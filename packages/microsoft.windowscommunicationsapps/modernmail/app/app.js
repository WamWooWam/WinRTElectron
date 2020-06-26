(function() {
    "use strict";

    function n() {
        var n = window.getMailPlatformResult();
        return new WinJS.Promise(function(t) {
            People.Accounts.showLogonErrorDialog(function(n) {
                var t = window.getMailPlatform();
                return n(window.getMailPlatformResult()), Boolean(t)
            }, function() {
                t(window.getMailPlatform())
            }, n)
        })
    }

    function t() {
        var t = window.getMailPlatform();
        return t ? t : n()
    }

    function i() {
        return WinJS.Promise.any([Mail.Promises.waitForEvent(Jx.activation, "navigated"), Mail.Promises.waitForEvent(Jx.activation, "activated")]).then(function(n) {
            return n.value
        }).then(Mail.Activation.serializeEvent).then(function(n) {
            return n.arguments === "RetailExperience" ? Mail.startRetailExperience(n) : n
        })
    }

    function r(n, t) {
        var i = Jx.root = new Mail.CompApp(n);
        i.buildUI(t)
    }
    window.addEventListener("DOMContentLoaded", function() {
        (document.title = Jx.res.getString("mailAppTitle"), Jx.app = new Jx.Application(Jx.AppId.mail, true), Jx.log = new Jx.Log, Jx.log.enabled = true, Jx.log.level = Jx.LOG_VERBOSE, Mail.log("Mail_FirstAvailable"), Jx.launch.getCurrentAppStatus() !== Jx.Launch.AppStatus.mandatoryUpdate) && (Mail.Globals.splashScreen = new Mail.SplashScreen, WinJS.Promise.join({
            platform: t(),
            activation: i()
        }).done(function(n) {
            var t = n.activation;
            t.arguments !== "RetailExperience" && r(n.platform, t)
        }), Mail.log("Mail_DOMContentLoaded_end"))
    }, false)
})();
Jx.delayDefine(Mail, "CompApp", function() {
    "use strict";

    function r() {
        People.Accounts.showMustSignInDialog(function() {
            Jx.log.warning("Restart needed due to connected account change");
            Jx.root.restart()
        }, true)
    }
    var t = Mail.BaseApp,
        i = Mail.CompApp = function(n) {
            t.call(this, n);
            this._accountValidator = Mail.AccountValidator.create(n);
            this._startupHelper = new Mail.StartupHelper;
            this._splashScreen = Mail.Globals.splashScreen;
            this.on(People.DialogEvents.opened, this._onAccountDialogOpened);
            this.on(People.DialogEvents.closed, this._onAccountDialogClosed);
            this.on(People.Accounts.AccountDialogEvents.launchingOAuthFlow, this._onOAuthFlowOpened);
            this.on(People.Accounts.AccountDialogEvents.closingOAuthFlow, this._onOAuthFlowClosed)
        },
        n;
    Jx.augment(i, t.prototype);
    n = i.prototype;
    n.buildUI = function(n) {
        var t = this._accountValidator;
        t.mailAccountAvailable || (Jx.forceSyncAccount(this._platform.accountManager.defaultAccount, Microsoft.WindowsLive.Platform.ApplicationScenario.mail), this._platform.requestDelayedResources(), this._buildUpsell());
        t.waitForAccountAvailable().then(this._buildFrame.bind(this, n));
        this._mailAccountDepletedHook = new Mail.EventHook(t, "mailAccountDepleted", this.restart, this)
    };
    n._buildUpsell = function() {
        var n = this._platform,
            t = this._upsellFrame = new Mail.CompUpsellFrame(n, this._splashScreen);
        this.appendChild(t);
        Mail.log("Frame_checkForEasiId", Mail.LogEvent.start);
        People.Accounts.checkForEasiId(n, Microsoft.WindowsLive.Platform.ApplicationScenario.mail);
        Mail.log("Frame_checkForEasiId", Mail.LogEvent.stop);
        Jx.app.initUI(document.getElementById(i.rootElementId))
    };
    n._buildFrame = function(n, i) {
        var r = this._settings.getLocalSettings(),
            u = new Mail.AppState(this._platform, n, i, r);
        if (this.shutdownUI(), this.removeChildren(), t.prototype._buildFrame.call(this, u, this._splashScreen), n.kind === Windows.ApplicationModel.Activation.ActivationKind.protocol) Mail.Utilities.ComposeHelper.onProtocol(n);
        this._postStartupQueue = new Mail.PostStartupQueue(this._splashScreen);
        this.schedulePostStartupWork()
    };
    n._onAccountDialogOpened = function() {
        this._startupHelper.onAccountDialogOpened()
    };
    n._onAccountDialogClosed = function() {
        var n = Jx.isObject(this._accountValidator) && this._accountValidator.mailAccountAvailable;
        this._startupHelper.onAccountDialogClosed(n)
    };
    n._onOAuthFlowOpened = function() {
        this._startupHelper.onOAuthFlowOpened()
    };
    n._onOAuthFlowClosed = function() {
        var n = Jx.isObject(this._accountValidator) && this._accountValidator.mailAccountAvailable;
        this._startupHelper.onOAuthFlowClosed(n)
    };
    n._forceSyncOnFirstLaunch = function() {
        this._startupHelper.isFirstRun && (this._platform.requestDelayedResources(), this._splashScreen.dismiss(), Mail.Commands.Handlers.onSyncButton(), this._startupHelper.clearFirstRunFlag())
    };
    n.schedulePostStartupWork = function() {
        this._postStartupQueue.queue("Start message bar", this._frame.postStartupWork.bind(this._frame));
        this._postStartupQueue.queue("First run force sync", this._forceSyncOnFirstLaunch.bind(this));
        this._postStartupQueue.queue("Ensure network connection on first run", function() {
            Mail.log("EnsureNetworkOnFirstRun", Mail.LogEvent.start);
            People.Accounts.ensureNetworkOnFirstRun(this._platform);
            Mail.log("EnsureNetworkOnFirstRun", Mail.LogEvent.stop)
        }.bind(this));
        this._postStartupQueue.queue("Start deferred tasks for Jx.Launch", function() {
            Mail.log("Mail_Launch_StartDeferredTasks", Mail.LogEvent.start);
            Jx.isObject(Jx.launch) && Jx.isFunction(Jx.launch.startDeferredTasks) && Jx.launch.startDeferredTasks(this._platform);
            Mail.log("Mail_Launch_StartDeferredTasks", Mail.LogEvent.stop)
        }.bind(this));
        Jx.isNullOrUndefined(this._platform) ? Jx.log.warning("Failed to schedule mail sync - no platform available.") : (Jx.log.info("Mail sync scheduled."), this._postStartupQueue.queue("Start mail sync", function() {
            Jx.startupSync(this._platform, Microsoft.WindowsLive.Platform.ApplicationScenario.mail);
            this._platform.requestDelayedResources()
        }.bind(this)));
        this._postStartupQueue.queue("Ensure that Mail is on the lock screen", function() {
            Mail.log("EnsureLockScreen", Mail.LogEvent.start);
            Chat.Shared.ensureLockScreen();
            Mail.log("EnsureLockScreen", Mail.LogEvent.stop)
        });
        this._postStartupQueue.queue("Load share handler", function() {
            Mail.log("load share handler", Mail.LogEvent.start);
            this._shareHandler = new Mail.ShareHandler;
            Mail.log("load share handler", Mail.LogEvent.stop)
        }.bind(this));
        this._postStartupQueue.queue("Load files for compose", function() {
            Mail.log("StartComposeDelayLoad", Mail.LogEvent.start);
            Mail.Utilities.ComposeHelper.ensureComposeFiles();
            Mail.log("StartComposeDelayLoad", Mail.LogEvent.stop)
        }.bind(this));
        this._postStartupQueue.queue("Build compose object", function() {
            Mail.log("StartDelayBuildCompose", Mail.LogEvent.start);
            Mail.Utilities.ComposeHelper.ensureComposeObject();
            Mail.log("StartDelayBuildCompose", Mail.LogEvent.stop)
        }.bind(this));
        this._postStartupQueue.queue("Add compose html to the DOM", function() {
            Mail.log("StartDelayInsertComposeHTML", Mail.LogEvent.start);
            Mail.Utilities.ComposeHelper.ensureComposeHTML();
            Mail.log("StartDelayInsertComposeHTML", Mail.LogEvent.stop)
        }.bind(this));
        this._postStartupQueue.finishedQueuing()
    };
    n.restart = function() {
        this._startupHelper.restart()
    };
    n.activateUI = function() {
        t.prototype.activateUI.call(this);
        this._disposer = new Mail.Disposer(new Mail.EventHook(this._platform, "restartneeded", r))
    };
    n.deactivateUI = function() {
        t.prototype.deactivateUI.call(this);
        Jx.dispose(this._disposer);
        Mail.Utilities.ConnectivityMonitor.dispose()
    };
    i.rootElementId = "idCompApp";
    n.shutDownComponent = function() {
        t.prototype.shutDownComponent.call(this);
        Jx.dispose(this._mailAccountDepletedHook);
        this._mailAccountDepletedHook = null;
        Jx.dispose(this._accountValidator);
        this._accountValidator = null
    }
})