
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail,Debug,Jx,Windows,People,Microsoft,Chat,BVT,WinJS */
/*jshint browser:true*/

(function () {
    "use strict";

    function waitForPlatform() {
        // Creates a promise that waits for its creation when we failed to
        // create it during synchronous startup
        var hr = window.getMailPlatformResult();
        Debug.assert(hr !== 0);

        return new WinJS.Promise(function (complete) {
            // Show the error dialog and try to recreate the platform
            People.Accounts.showLogonErrorDialog(
                // Callback to retry platform creation, returns true if successful
                function (setError) {
                    var platform = window.getMailPlatform();
                    setError(window.getMailPlatformResult());
                    return Boolean(platform);
                },
                // Callback when the error dialog is dismissed and the platform is created
                function (success) {
                    Debug.assert(success);
                    // Complete the promise with the platform value
                    complete(window.getMailPlatform());
                },
                hr
            );
        });
    }

    function ensurePlatform() {
        // Normally we should always have a platform
        var platform = window.getMailPlatform();
        if (platform) {
            return platform;
        }

        
        // Load the mock platform if we're in the test app
        if (Debug.loadMockPlatform) {
            return Debug.loadMockPlatform();
        }
        

        // Don't have a platform, return a promise that completes when we do
        return waitForPlatform();
    }

    function ensureActivation() {
        // Returns a promise that waits for initial activation and then parses the args
        // This can be either the normal activation event or a navigation event
        return WinJS.Promise.any([
            Mail.Promises.waitForEvent(Jx.activation, "navigated"),
            Mail.Promises.waitForEvent(Jx.activation, "activated")
        ]).then(function (result) {
            return result.value;
        }).then(Mail.Activation.serializeEvent)
          .then(function (ev) {
            return ev.arguments === "RetailExperience" ? Mail.startRetailExperience(ev) : ev;
        });
    }

    function createApp(platform, activationEvent) {
        var app = Jx.root = new Mail.CompApp(platform);
        app.buildUI(activationEvent);
    }

    window.addEventListener("DOMContentLoaded", function () {
        // Keep track of loaded scripts and assert if it finds duplicates
        Debug.only(Jx.Dep.collect());

        // Title must be set before Jx.Application because 
        // it can be used in startup dialogs
        document.title = Jx.res.getString("mailAppTitle");

        Jx.app = new Jx.Application(Jx.AppId.mail, true);

        // Create the logger
        Jx.log = new Jx.Log();
        Jx.log.enabled = true;
        Jx.log.level = Jx.LOG_VERBOSE;
        Mail.log("Mail_FirstAvailable");

        // If the app requires a mandatory update, we should abort app launch
        // Jx.launch will take over and show the update dialog
        if (Jx.launch.getCurrentAppStatus() === Jx.Launch.AppStatus.mandatoryUpdate) {
            Debug.Mail.log("mandatory update, restart required!");
            return;
        }

        Mail.Globals.splashScreen = new Mail.SplashScreen();

        Debug.hookPromiseErrors(/*assertOnException:*/true);

        // We need both activation and platform loading to occur before creating the app
        WinJS.Promise.join({
            platform: ensurePlatform(),
            activation: ensureActivation()
        }).done(function (result) {
            var activationEvent = result.activation;
            if (activationEvent.arguments !== "RetailExperience") {
                createApp(result.platform, activationEvent);
            }
        });

        Mail.log("Mail_DOMContentLoaded_end");
    }, false);

}());

Jx.delayDefine(Mail, "CompApp", function () {
    "use strict";

    var BaseApp = Mail.BaseApp,
        CompApp = Mail.CompApp = function (platform) {
        BaseApp.call(this, platform);

        this._accountValidator = Mail.AccountValidator.create(platform);
        this._startupHelper = new Mail.StartupHelper();

        this._splashScreen = Mail.Globals.splashScreen;

        this.on(People.DialogEvents.opened, this._onAccountDialogOpened);
        this.on(People.DialogEvents.closed, this._onAccountDialogClosed);
        this.on(People.Accounts.AccountDialogEvents.launchingOAuthFlow, this._onOAuthFlowOpened);
        this.on(People.Accounts.AccountDialogEvents.closingOAuthFlow, this._onOAuthFlowClosed);
    };
    Jx.augment(CompApp, BaseApp.prototype);
    var prototype = CompApp.prototype;

    prototype.buildUI = function (activationEvent) {
        var validator = this._accountValidator;
        if (!validator.mailAccountAvailable) {
            Jx.forceSyncAccount(this._platform.accountManager.defaultAccount, Microsoft.WindowsLive.Platform.ApplicationScenario.mail);
            this._platform.requestDelayedResources();
            this._buildUpsell();
        }
        
        validator.waitForAccountAvailable().then(this._buildFrame.bind(this, activationEvent));

        // The accounts can get depleted multiple times if 
        // 1. The last account is removed and re-created under the add account dialog due to a cert error (See BLUE:443186)
        // 2. The user later decides to remove that account
        // An event handler should be used in this case as opposed to using the one shot waitForEvent approach
        this._mailAccountDepletedHook = new Mail.EventHook(validator, "mailAccountDepleted", this.restart, this);
    };

    prototype._buildUpsell = function () {
        /// <summary>We don't have a valid account, show the upsell UI</summary>
        var platform = this._platform;
        var upsellFrame = this._upsellFrame = new Mail.CompUpsellFrame(platform, this._splashScreen);
        this.appendChild(upsellFrame);

        // popping the EASI-ID connector
        Mail.log("Frame_checkForEasiId", Mail.LogEvent.start);
        People.Accounts.checkForEasiId(platform, Microsoft.WindowsLive.Platform.ApplicationScenario.mail);
        Mail.log("Frame_checkForEasiId", Mail.LogEvent.stop);

        Jx.app.initUI(document.getElementById(CompApp.rootElementId));
    };

    prototype._buildFrame = function (activationEvent, defaultAccount) {
        var container = this._settings.getLocalSettings(),
            appState = new Mail.AppState(this._platform, activationEvent, defaultAccount, container);

        // In case we were previously showing the upsell
        this.shutdownUI();
        this.removeChildren();

        BaseApp.prototype._buildFrame.call(this, appState, this._splashScreen);

        if (activationEvent.kind === Windows.ApplicationModel.Activation.ActivationKind.protocol) {
            Mail.Utilities.ComposeHelper.onProtocol(activationEvent);
        }
        this._postStartupQueue = new Mail.PostStartupQueue(this._splashScreen);
        this.schedulePostStartupWork();
    };

    prototype._onAccountDialogOpened = function () {
        this._startupHelper.onAccountDialogOpened();
    };

    prototype._onAccountDialogClosed = function () {
        var hasValidAccount = Jx.isObject(this._accountValidator) && this._accountValidator.mailAccountAvailable;
        this._startupHelper.onAccountDialogClosed(hasValidAccount);
    };

    prototype._onOAuthFlowOpened = function () {
        this._startupHelper.onOAuthFlowOpened();
    };

    prototype._onOAuthFlowClosed = function () {
        var hasValidAccount = Jx.isObject(this._accountValidator) && this._accountValidator.mailAccountAvailable;
        this._startupHelper.onOAuthFlowClosed(hasValidAccount);
    };

    prototype._forceSyncOnFirstLaunch = function () {
        Debug.Mail.log("CompApp._forceSyncOnFirstLaunch", Mail.LogEvent.start);
        if (this._startupHelper.isFirstRun) {
            Debug.assert(Jx.isFunction(this._platform.requestDelayedResources));
            Debug.assert(Jx.isInstanceOf(this._splashScreen, Mail.SplashScreen));

            this._platform.requestDelayedResources();
            this._splashScreen.dismiss();

            Mail.Commands.Handlers.onSyncButton();
            this._startupHelper.clearFirstRunFlag();
        }
        Debug.Mail.log("CompApp._forceSyncOnFirstLaunch", Mail.LogEvent.stop);
    };

    prototype.schedulePostStartupWork = function () {
        this._postStartupQueue.queue("Start message bar", this._frame.postStartupWork.bind(this._frame));

        this._postStartupQueue.queue("First run force sync", this._forceSyncOnFirstLaunch.bind(this));

        this._postStartupQueue.queue("Ensure network connection on first run", function () {
            Mail.log("EnsureNetworkOnFirstRun", Mail.LogEvent.start);
            People.Accounts.ensureNetworkOnFirstRun(this._platform);
            Mail.log("EnsureNetworkOnFirstRun", Mail.LogEvent.stop);
        }.bind(this));

        this._postStartupQueue.queue("Start deferred tasks for Jx.Launch", function () {
            Mail.log("Mail_Launch_StartDeferredTasks", Mail.LogEvent.start);
            if (Jx.isObject(Jx.launch) && Jx.isFunction(Jx.launch.startDeferredTasks)) {
                Jx.launch.startDeferredTasks(this._platform);
            }
            Mail.log("Mail_Launch_StartDeferredTasks", Mail.LogEvent.stop);
        }.bind(this));

        if (Jx.isNullOrUndefined(this._platform)) {
            Jx.log.warning("Failed to schedule mail sync - no platform available.");
        } else {
            Jx.log.info("Mail sync scheduled.");
            this._postStartupQueue.queue("Start mail sync", function () {
                Jx.startupSync(this._platform, Microsoft.WindowsLive.Platform.ApplicationScenario.mail);

                Debug.assert(Jx.isFunction(this._platform.requestDelayedResources));
                this._platform.requestDelayedResources();
            }.bind(this));
        }

        this._postStartupQueue.queue("Ensure that Mail is on the lock screen", function () {
            Mail.log("EnsureLockScreen", Mail.LogEvent.start);
            Chat.Shared.ensureLockScreen();
            Mail.log("EnsureLockScreen", Mail.LogEvent.stop);
        });

        this._postStartupQueue.queue("Load share handler", function () {
            Mail.log("load share handler", Mail.LogEvent.start);
            this._shareHandler = new Mail.ShareHandler();
            Mail.log("load share handler", Mail.LogEvent.stop);
        }.bind(this));

        this._postStartupQueue.queue("Load files for compose", function () {
            Mail.log("StartComposeDelayLoad", Mail.LogEvent.start);
            Mail.Utilities.ComposeHelper.ensureComposeFiles();
            Mail.log("StartComposeDelayLoad", Mail.LogEvent.stop);
        }.bind(this));

        this._postStartupQueue.queue("Build compose object", function () {
            Mail.log("StartDelayBuildCompose", Mail.LogEvent.start);
            Mail.Utilities.ComposeHelper.ensureComposeObject();
            Mail.log("StartDelayBuildCompose", Mail.LogEvent.stop);
        }.bind(this));

        this._postStartupQueue.queue("Add compose html to the DOM", function () {
            Mail.log("StartDelayInsertComposeHTML", Mail.LogEvent.start);
            Mail.Utilities.ComposeHelper.ensureComposeHTML();
            Mail.log("StartDelayInsertComposeHTML", Mail.LogEvent.stop);
        }.bind(this));

        
        // Retrieve the mailto protocol out of the Mock App redirect and fire activation
        this._postStartupQueue.queue("Pass MailTo from Mock App", function () {
            function QueryParser(url) {
                this.getParam = function (name) {
                    return map[name];
                };

                var map = {},
                    parameters = url.substring(url.indexOf("?") + 1).split("&");

                parameters.forEach(function (parameter) {
                    var pair = parameter.split("=");
                    map[pair[0]] = decodeURIComponent(pair[1] || "");
                });
            }

            var query = document.location.hash,
                parsedArgs = new QueryParser(query),
                mailTo = parsedArgs.getParam("mailtest");
            if (query.indexOf("#testMode") !== -1 && Jx.isNonEmptyString(mailTo)) {
                var activationEvent = {
                    uri: new Windows.Foundation.Uri("mailto:" + mailTo)
                };

                Mail.Utilities.ComposeHelper.onProtocol(activationEvent);
            }
        });

        // Look for tests in the local app data directory. If this file exists, we are
        // running under 'lab' conditions and should automatically start the start the
        // tests that are defined in the default JSON file
        this._postStartupQueue.queue("BVT check", function () {
            Jx.loadScript("/ModernShared/uibvt/bvtLoader.js").then(function () { return BVT.lab(); });
        });
        

        this._postStartupQueue.finishedQueuing();
    };

    prototype.restart = function () {
        Debug.assert(Jx.isObject(this._startupHelper));
        this._startupHelper.restart();
    };

    function onConnectedIdChanged () {
        /// <summary>Called by the platform when the connected account has changed. Present the user with
        /// a full-screen dialog informing them that they need to sign-in to continue.</summary>
        People.Accounts.showMustSignInDialog(function () {
            // This will be invoked when the user hits the "try again" link in the dialog.
            Jx.log.warning("Restart needed due to connected account change");
            Jx.root.restart();
        }, true /*forceShow*/);
    }

    prototype.activateUI = function () {
        BaseApp.prototype.activateUI.call(this);

        this._disposer = new Mail.Disposer(new Mail.EventHook(this._platform, "restartneeded", onConnectedIdChanged));
    };

    prototype.deactivateUI = function () {
        BaseApp.prototype.deactivateUI.call(this);
        Jx.dispose(this._disposer);
        Mail.Utilities.ConnectivityMonitor.dispose();
    };

    CompApp.rootElementId = "idCompApp";

    prototype.shutDownComponent = function () {
        BaseApp.prototype.shutDownComponent.call(this);
        Jx.dispose(this._mailAccountDepletedHook);
        this._mailAccountDepletedHook = null;
        Jx.dispose(this._accountValidator);
        this._accountValidator = null;
    };
});

