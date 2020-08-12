

var lib;
window.roboSky = new Skype.Diagnostics.ETW.Tracer("RoboSky");

(function () {
    "use strict";
    var app,
        document,
        WinJS,
        Skype,
        LibWrap,
        Microsoft,
        Windows,
        global;

    function updateDependencies(dependencies) {
        dependencies = dependencies || {};
        app = dependencies.app || window.WinJS.Application;
        document = dependencies.document || window.document;
        WinJS = dependencies.WinJS || window.WinJS;
        Skype = dependencies.Skype || window.Skype;
        LibWrap = dependencies.LibWrap || window.LibWrap;
        Microsoft = dependencies.Microsoft || window.Microsoft;
        Windows = dependencies.Windows || window.Windows;
        global = dependencies.global || window;
    }

    var activationParams;

    var languageSwitching = (function () {

        function updateUiLanguage() {
            var body = document.body;
            WinJS.Resources.processAll(body);
            Skype.Application.state.uiLanguage = Skype.Globalization.getCurrentLanguage();
            Skype.Application.state.isRTL ? WinJS.Utilities.addClass(body, 'RTL') : WinJS.Utilities.removeClass(body, 'RTL');
            
            Skype.Globalization.tryEastAsianFontOverride();
        }

        function updateLibLanguage() {
            var uiLang = Skype.Globalization.getCurrentLanguage();
            var isoLang = Skype.Globalization.mapBCP47toSkypeIsoLang(uiLang);
            global.lib.setUIStrProp(LibWrap.WrSkyLib.uiprop_UIPROP_LANGUAGE, isoLang);
            global.lib.setUIStrProp(LibWrap.WrSkyLib.uiprop_UIPROP_NOTIFICATIONS_LANGUAGE, uiLang);
        }

        function setupUILanguage() {
            WinJS.Resources.addEventListener("contextchanged", updateUiLanguage);
            updateUiLanguage();
        }

        function setupLibLanguage() {
            WinJS.Resources.addEventListener("contextchanged", updateLibLanguage);
            updateLibLanguage();
        }

        return {
            setupUILanguage: setupUILanguage,
            setupLibLanguage: setupLibLanguage
        };
    })();

    var sessionState = (function () {
        
        function visibilitychangeHandler(evt) {
            
            if (evt.target.visibilityState === 'hidden') {
                
                app.sessionState.timestamp = Date.now();
                app.sessionState.navigationHistory = Skype.UI.navigationHistory;

                
                app.skypeWriteStateAsync();
            }
            if (evt.target.visibilityState === 'visible') {
                Skype.Application.state.startedResumedTimestamp = Date.now();
            }
        }

        function init() {
            Skype.Application.state.startedResumedTimestamp = Date.now();
            document.addEventListener("visibilitychange", visibilitychangeHandler);
        }
        function resumeAsync() {
            roboSky.write('Default.js,sessionState,resumeAsync');
            return app.skypeLoadStateAsync().then(
                function resumeSessionState_loadState_then() {
                    roboSky.write('Default.js,sessionState,resumeSessionState_loadState_then, StartTM');
                    var sessionCfg = Skype.Configuration.session;
                    if (app.sessionState.timestamp) {
                        var suspendedTimestamp = new Date(app.sessionState.timestamp);
                        var spanInMins = (new Date() - suspendedTimestamp) / 60000;
                        if (spanInMins > sessionCfg.timeout) {
                            app.sessionState = {};
                        } else if (sessionCfg.override) {
                            for (var p in sessionCfg.override) {
                                if (app.sessionState[p]) {
                                    app.sessionState[p] = sessionCfg.stateOverride[p];
                                }
                            }
                        }
                    }

                    
                    if (!Skype.LoginManager.isValidCurrentUser()) {
                        app.sessionState = {};
                    }

                    
                    if (Skype.UI.navigationHistory.length === 0 && app.sessionState.navigationHistory && app.sessionState.navigationHistory.length) {
                        Skype.UI.navigationHistory = app.sessionState.navigationHistory;
                    }
                    roboSky.write('Default.js,sessionState,resumeSessionState_loadState_then, StopTM');
                });
        }


        return {
            init: init,
            resumeAsync: resumeAsync
        };
    })();
    var policyHandler = (function () {
        

        function onPolicyUpdate(event) {
            
            
            
            if (!event.detail.policy.application.enabled) {
                Skype.UI.navigate("policyWarning");
            }
        }

        function onFlagUpdate(e) {
            var flagsToDisable = e.detail.disabledFlagsAdded,
                flagsToEnable = e.detail.disabledFlagsRemoved;

            
            flagsToEnable.forEach(function (flag) {
                WinJS.Utilities.removeClass(document.body, "disable-" + flag);
            });

            flagsToDisable.forEach(function (flag) {
                WinJS.Utilities.addClass(document.body, "disable-" + flag);
            });
        }

        function init() {
            var manager = Skype.Application.PolicyManager.instance;
            manager.addEventListener(Skype.Application.PolicyManager.Events.PolicyUpdate, onPolicyUpdate);
            manager.addEventListener(Skype.Application.PolicyManager.Events.FlagUpdate, onFlagUpdate);

            manager.update();
        }

        return {
            init: init
        };
    })();
    var eventRunner = (function () {

        function init() {
            var eventsPullCadence = 160,
                eventsTimeProcessingThreshold = 40,
                runner = LibWrap.UIEventRunner.instance(),
                runEvents = function () {
                    
                    runner.run(LibWrap.UIEventContext.ui, eventsTimeProcessingThreshold);
                    global.setTimeout(runEvents, eventsPullCadence);
                };
            global.setTimeout(runEvents, eventsPullCadence);
        }


        return {
            init: init
        };
    })();

    var activationPromise;

    var jsLoadedSignal;
    var jsLoadedPromise;

    var uiReadySignal;
    var uiReadyPromise;
    var uiIsReady;

    function processNotifications() {
        Skype.Notifications.Tiles.clear();
        Skype.Notifications.IMCache.Handle();

        
        var abchNotificationCache = new Skype.Notifications.AbchNotificationCache(Windows.Storage.ApplicationData.current.localSettings);
        var abchNotification = new Skype.Notifications.AbchNotification(lib, abchNotificationCache);
        abchNotification.handleCachedNotification();
   }

    function prepareForNavigationAsync() {
        processNotifications();

        function handleActivationArgumentsAsync() {
            activationParams = activationParams || {};
            return Skype.UI.Activation.handleActivationArguments(activationParams).then(function () {
                
                activationParams = null;
            });
        }
        window.traceFunction && (handleActivationArgumentsAsync = window.traceFunction(handleActivationArgumentsAsync, "Bootstrapper,navigation"));

        activationPromise = uiReadyPromise.then(handleActivationArgumentsAsync);
        return activationPromise;
    }

    var startupScenarios = {
        RETAIL_MODE: "retailMode",
        PRELAUNCH_MODE: "prelaunch",
        FORCED_OFFLINE: "forcedOffline",
        NORMAL: "normal"
    };

    function identitfyStartupScenario(args) {
        if (args.detail.arguments === Skype.RetailMode.retailModeLaunchArg) {
            return startupScenarios.RETAIL_MODE;
        } else if (Skype.Application.state.forcedOffline) {
            return startupScenarios.FORCED_OFFLINE;
        } else if (args.detail.prelaunchActivated) {
            return startupScenarios.PRELAUNCH_MODE;
        }
        return startupScenarios.NORMAL;
    }

    function activatedHandler(e) {
        var startupScenario = identitfyStartupScenario(e);

        switch (startupScenario) {
            case startupScenarios.RETAIL_MODE:
                window.msWriteProfilerMark("Activated in Retail Experience mode");
                Skype.RetailMode.saveRetailModeFlag();
                MSApp.terminateApp(null);
                return;
            case startupScenarios.FORCED_OFFLINE:
                log("Activated in Forced Offline mode");
                break;
            case startupScenarios.PRELAUNCH_MODE:
                log("Activated in Prelaunch mode");
                Skype.LibraryManager.instance.setIsPrelaunched();
                if (Skype.Permissions.backgroundTasksEnabled()) {
                    log("bg tasks enabled -> completing promise");
                    Skype.LibraryManager.instance.unblockStart();
                }
                break;
            default:
                log("Activated in normal mode");
                Skype.LibraryManager.instance.unblockStart();
                break;
        }

        e.setPromise(
            jsLoadedPromise
                .then(function () {
                    roboSky.write('Default.js,parsing');

                    
                    
                    
                    activationParams = Skype.UI.Activation.parseActivationParams(e);
                    Skype.StartUpComponent.LockScreen.instance.handleActivationStart(activationParams); 
                    Skype.Application.BackgroundState.setState(Skype.Application.BackgroundState.State.Foreground);
                })
                .then(function () {
                    roboSky.write('Default.js,initUI');
                    initUIAsync();
                })
                .then(sessionState.resumeAsync)
                .then(function () {
                    if (e.detail.previousExecutionState != Windows.ApplicationModel.Activation.ApplicationExecutionState.running) {
                        roboSky.write('Default.js,policy');
                        policyHandler.init();
                    }

                    if (startupScenario === startupScenarios.FORCED_OFFLINE) {
                        Skype.UI.navigate("logout");
                        return WinJS.Promise.as();
                    } else {
                        return handleAppActivationAsync(e);
                    }
                })
        );

        function handleAppActivationAsync(args) {
            var isColdStart = [
                Windows.ApplicationModel.Activation.ApplicationExecutionState.running,
                Windows.ApplicationModel.Activation.ApplicationExecutionState.suspended].indexOf(args.detail.previousExecutionState) === -1;

            
            if (!isColdStart && global.lib && global.lib.account && Skype.Application.state.policy.application.enabled) {
                var libStatus = global.lib.getLibStatus();
                var accountStatus = global.lib.account.getStatus();
                log("WinJS.Application.activated Lib status: [{0}], account status[{1}]".format(libStatus, LibWrap.Account.statustoString(accountStatus)));
                if (libStatus === LibWrap.WrSkyLib.libstatus_RUNNING && accountStatus === LibWrap.Account.status_LOGGED_IN) {
                    log("WinJS.Application.activated: library already running, perform initialization phase 2");
                    return prepareForNavigationAsync();
                }
            }
            return WinJS.Promise.as();
        }
        window.traceFunction && (handleAppActivationAsync = window.traceFunction(handleAppActivationAsync, "Bootstrapper,activation"));
    }


    function loadedHandler(e) {
        log("window.load"); 

        jsLoadedSignal.complete();
    }
    window.traceFunction && (loadedHandler = window.traceFunction(loadedHandler, "Bootstrapper,loadedHandler"));


    function resumingHandler(e) {
        log('app is resuming');

        if (Skype.LoginManager.isValidCurrentUser()) {
            if (global.lib) {
                if (global.lib.getLibStatus() === LibWrap.WrSkyLib.libstatus_RUNNING) {
                    global.lib.changeBackgroundMode(false);
                    processNotifications();
                } else {
                    if (!Skype.Application.state.forcedOffline) {
                        Skype.LibraryManager.instance.unblockStart();
                    }
                }
            }
        } else {
            Skype.LoginManager.invalidateCurrentUser();
        }

        Skype.Application.BackgroundState.setState(Skype.Application.BackgroundState.State.Foreground);
        Skype.Diagnostics.PerfTrack.instance.writeResumeStopEvent();
        roboSky.write('Default.js,Resumed');
    }

    function initUIAsync() {

        
        if (uiIsReady) {
            return WinJS.Promise.as();
        }

        
        WinJS.Binding.optimizeBindingReferences = true;

        
        WinJS.UI._SELECTION_CHECKMARK = "\uE412";

        return WinJS.UI.processAll(document.body)
            .then(function () {
                return WinJS.Resources.processAll(document.body);
            })
            .then(function () {
                roboSky.write('Default.js,UI ready');
                Skype.Statistics.AppSizeReporter.instance.init();
                uiReadySignal.complete();
                uiIsReady = true;
                roboSky.write('Default.js,UI ready DONE');
                return uiReadyPromise;
            });
    }
    function initAppPlatformAsync() {

        function initBackgroundComponents() {
            global.lib.addEventListener("loginpartially", function () { roboSky.write("Bootstrapper,onLoginPartially,StartTM"); });
            global.lib.addEventListener("login", function () { roboSky.write("Bootstrapper,onLogin,StartTM"); });

            Skype.Application.state.alive();
            Skype.Upgrade.listen();

            [
                Skype.Application.DeviceManager,
                Skype.Sounds,
                Skype.CallManager,
                Skype.SendVideoManager.instance,
                Skype.Notifications,
                Skype.LoginManager,
                Skype.Notifications.NewMessageNotifier,
                Skype.FileTransferManager.instance,
                Skype.SendingTempStorage.instance,
                Skype.VideoMessageEntitlementsManager.instance,
                Skype.UI.HelpBubbles.Starter.instance,
                Skype.UI.AppBar.instance
            ].forEach(function (component) {
                roboSky.write('Default.js,initializing {0}'.format(component?.__className));
                component?.init();
            });

            global.lib.addEventListener("login", function () { roboSky.write("Bootstrapper,onLogin,StopTM"); });
            global.lib.addEventListener("loginpartially", function () { roboSky.write("Bootstrapper,onLoginPartially,StopTM"); });
            
            global.lib.addEventListener("libready", setupGlobalSettings);
        }
        window.traceFunction && (initBackgroundComponents = window.traceFunction(initBackgroundComponents, "Bootstrapper,initBackgroundComponents"));

        function createLib() {
            global.lib = Skype.LibraryManager.instance.create(Skype.Version.skypeVersion);

            
            Skype.Statistics.init();

            registerExtendedProps();
            registerLibEvents();

            languageSwitching.setupLibLanguage();

            function registerExtendedProps() {
                try {
                    global.lib.declareExtendedProp(LibWrap.WrSkyLib.objecttype_TRANSFER, "localfilename", LibWrap.EXTPROPKEY.ft_LOCALFILENAME, LibWrap.Metatag.type_STRING);
                    global.lib.declareExtendedProp(LibWrap.WrSkyLib.objecttype_TRANSFER, "localStatus", LibWrap.EXTPROPKEY.ft_LOCALSTATUS, LibWrap.Metatag.type_INTEGER);
                } catch (e) {
                    log("registerExtendedProps() error: " + e.description);
                }
            }
        }
        window.traceFunction && (createLib = window.traceFunction(createLib, "Bootstrapper,createLib"));

        function registerLibEvents() {
            global.lib.subscribePropChange([LibWrap.PROPKEY.message_BODY_XML, LibWrap.PROPKEY.sms_STATUS]);

            var loginHandlerManager = Skype.Application.LoginHandlerManager;

            loginHandlerManager.instance.init(global.lib);

            Skype.Application.LoginHandlerManager.instance.addEventListener(Skype.Application.LoginHandlerManager.Events.LOGOUT, function () {
                log("lib says logout with reason: " + LibWrap.Account.logoutreasontoString(global.lib.logoutReason));

                activationPromise && activationPromise.cancel();

                
                var imCache = new Skype.Notifications.IMCache();
                imCache.clear(0);
                
                if (Skype.Application.state.page.name !== "policyWarning" && !Skype.Application.state.forcedOffline) {
                    Skype.UI.navigate("login", { state: "logout" });
                }
            });

            loginHandlerManager.instance.addEventListener(loginHandlerManager.Events.LOGIN_READONLY, handleLogin);
        }
        
        function setupGlobalSettings() {
            
            global.lib.setup.setInt("*Lib/Call/AllowIncomingLyncId", 1);
            
            global.lib.setup.setInt("*Lib/MSNP/ConnectEarly", 1);

            if (Skype.Debug) {
                
                
                global.lib.setup.setInt("*Lib/MSNP/BetaTestGroup", 1);
            } else {
                
                
                global.lib.setup.setInt("*Lib/MSNP/BetaTestGroup", 0);
            }
        }

        function handleLogin() {
            roboSky.write("Bootstrapper,libLogin,StopTM");

            log("lib says login");

            global.lib.setup.setInt("Lib/Reachback/Enable", 1);

            global.lib.setup.setInt("Lib/Conversation/UpdateInboxMessageIDMethod", 1);
            global.lib.setup.setInt("Lib/Conversation/InboxUpdateTimeout", 10 * 60); 
            global.lib.setup.setInt("Lib/Conversation/DisableInboxUpdateOnTyping", 1);
            global.lib.setup.setInt("Lib/Conversation/InboxUpdateTimeout", 0); 
            global.lib.setup.setInt("Lib/Conversation/IncomingAuthRequestInConv", 1);
            global.lib.setup.setInt("Lib/Conversation/EnableBirthday", 0);
            global.lib.setup.setInt("Lib/Conversation/KeepInInboxWhenBlocking", 1);
            global.lib.setup.setInt("Lib/Conversation/RecentlyLiveTimeout", 1); 
            
            global.lib.setLocalizedString(LibWrap.WrSkyLib.localized_STRING_LOCALIZED_UPGRADE_MESSAGE_IN_P2P, 'msnp24_chat_migrated_message_in_p2p_chat'.translate());

            Skype.UI.disposePage("login");

            uiReadyPromise
                .then(initSessionComponents);

            prepareForNavigationAsync()
                .done(null, function (e) {
                    log("processing login event failed!");
                    return WinJS.Promise.wrapError(e);
                });
        }
        window.traceFunction && (handleLogin = window.traceFunction(handleLogin, "Bootstrapper,handleLogin"));


        function initSessionComponents() {
            
            Skype.UI.CallNotifications.init();
            Skype.Statistics.AppSizeReporter.instance.init();
        }
        window.traceFunction && (initSessionComponents = window.traceFunction(initSessionComponents, "Bootstrapper,initSessionComponents"));

        function initUAppUIPlatform() {
            [
                sessionState,
                Skype.Application.Suspending,
                Skype.StartUpComponent.LockScreen.instance,
                Skype.UI.KeyboardManager.instance,
                Skype.SettingsManager.instance,
            ].forEach(function (component) { component.init(); });

            Windows.UI.WebUI.WebUIApplication.addEventListener("resuming", resumingHandler);

            Skype.Application.state.view.bind("appReady", function (ready) {
                ready && postUIInitialization();
            });

            languageSwitching.setupUILanguage();

            
            return Skype.Version.init();
        }
        window.traceFunction && (initUAppUIPlatform = window.traceFunction(initUAppUIPlatform, "Bootstrapper,initAppUIPlatform"));

        function postUIInitialization() {
            Skype.UI.Util.initListViewFixes();
        }

        function navigateToSplashScreen() {
            var nc = document.querySelector('section.navigationContainer');
            
            if (nc.children.length === 0) {
                WinJS.UI.processAll(nc);
                Skype.UI.navigate("login", { state: "splash" });
            }
        }

        
        return WinJS.Promise.join([initLibPlatform(), jsLoadedPromise])

            .then(initUAppUIPlatform)
        
            .then(navigateToSplashScreen)

            .done(function () {
                
                
                    return Skype.Permissions.requestAll()
                        .then(function () {

                            createLib();

                            initBackgroundComponents();

                            Skype.LibraryManager.instance.start();
                        });                
            });
    }

    function initLibPlatform() {
        return LibWrap.WrSkyLib.initPlatform();
    }
    window.traceFunction && (initLibPlatform = window.traceFunction(initLibPlatform, "Bootstrapper,initLibPlatform"));

    function bootstrap(dependencies) {
        updateDependencies(dependencies);

        Skype.Diagnostics.PerfTrack.instance.init();
        eventRunner.init();
        Skype && Skype.Debug && Skype.Debug.Exception && Skype.Debug.Exception.init();

        app.addEventListener("activated", activatedHandler, false);
        global.addEventListener("load", loadedHandler, false);

        app.start();

        jsLoadedSignal = new WinJS._Signal();
        jsLoadedPromise = jsLoadedSignal.promise;

        uiReadySignal = new WinJS._Signal();
        uiReadyPromise = uiReadySignal.promise;
        uiIsReady = false;

        initAppPlatformAsync();
    }

    window.WinJS.Namespace.define("Skype.Application", {
        Bootstrapper: {
            bootstrap: bootstrap,
        }
    });
})();