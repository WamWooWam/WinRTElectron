//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Publish;
    (function(Publish) {
        var Application;
        (function(Application) {
            var WindowsErrorHandler = function() {
                    function WindowsErrorHandler(){}
                    return WindowsErrorHandler.prototype.showErrorAndTerminate = function(error) {
                            var content = error.message || Application.GenericInitError,
                                md = new AppMagic.Popups.MessageDialog(content, Application.GenericInitTitle);
                            return md.showAsync().then(function() {
                                    MSApp.terminateApp(error)
                                })
                        }, WindowsErrorHandler.prototype.terminate = function(error) {
                            MSApp.terminateApp(error)
                        }, WindowsErrorHandler
                }();
            Application.WindowsErrorHandler = WindowsErrorHandler
        })(Application = Publish.Application || (Publish.Application = {}))
    })(Publish = AppMagic.Publish || (AppMagic.Publish = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Publish;
    (function(Publish) {
        var Application;
        (function(Application) {
            var WindowsSessionState = function() {
                    function WindowsSessionState(){}
                    return WindowsSessionState.prototype.setSessionState = function(state) {
                            WinJS.Application.sessionState = state
                        }, WindowsSessionState.prototype.getSessionState = function() {
                            return WinJS.Application.sessionState
                        }, WindowsSessionState
                }();
            Application.WindowsSessionState = WindowsSessionState
        })(Application = Publish.Application || (Publish.Application = {}))
    })(Publish = AppMagic.Publish || (AppMagic.Publish = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    function start() {
        (function() {"use strict";
            WinJS.Binding.optimizeBindingReferences = !0;
            var errorHandler = new AppMagic.Publish.Application.WindowsErrorHandler,
                sessionState = new AppMagic.Publish.Application.WindowsSessionState,
                applicationModel = new AppMagic.Publish.Application.PublishedApp(errorHandler, sessionState),
                app = WinJS.Application;
            app.onactivated = function(args) {
                AppMagic.Utility.disableAutoUrlDetect();
                var appMagicActivationEventArgs = createActivationEventFromWinJS(args),
                    promise = applicationModel.onActivated(appMagicActivationEventArgs),
                    startupPromise = promise.then(WinJS.UI.processAll);
                args.setPromise(startupPromise)
            };
            app.oncheckpoint = function(args) {
                var promise = applicationModel.onCheckpoint();
                args.setPromise(promise)
            };
            Windows.UI.WebUI.WebUIApplication.addEventListener("resuming", function(args) {
                if (typeof app.sessionState != "undefined" && app.sessionState !== null)
                    applicationModel.onResume(app.sessionState)
            }, !1);
            app.start()
        })()
    }
    AppMagic.start = start;
    function createActivationEventFromWinJS(args) {
        var retArgs = new AppMagic.Publish.Application.AppActivationEventArgs,
            activationKind = window.Windows.ApplicationModel.Activation.ActivationKind;
        switch (args.detail.kind) {
            case activationKind.launch:
                retArgs.ActivationType = 0;
                break;
            default:
                retArgs.ActivationType = 1
        }
        var executionState = window.Windows.ApplicationModel.Activation.ApplicationExecutionState;
        switch (args.detail.previousExecutionState) {
            case executionState.notRunning:
                retArgs.PreviousExecutionState = 0;
                break;
            case executionState.running:
                retArgs.PreviousExecutionState = 1;
                break;
            case executionState.suspended:
                retArgs.PreviousExecutionState = 2;
                break;
            case executionState.terminated:
                retArgs.PreviousExecutionState = 3;
                break;
            case executionState.closedByUser:
                retArgs.PreviousExecutionState = 4;
                break;
            default:
                throw new Error("Unknown execution state");
        }
        return retArgs
    }
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
AppMagic.Services.CookieManager.instance = new AppMagic.Services.WindowsCookieManager;
AppMagic.Services.Importer.instance = new AppMagic.Services.PackagedServiceImporter;
AppMagic.Settings.instance = new AppMagic.Settings.WindowsSettingsProvider;
AppMagic.MarkupService.instance = new AppMagic.MarkupService.PackagedMarkupService;
AppMagic.DynamicDataSource.instance = new AppMagic.DynamicDataSource.WindowsDynamicDataSourceFactory;
AppMagic.Encryption.instance = new AppMagic.Encryption.WindowsEncryptionProvider;
AppMagic.DocumentLayout.instance = new AppMagic.Publish.Application.PublishedLayoutManager;
AppMagic.ConnectionStatusProvider.instance = new AppMagic.ConnectionStatusProvider.PublishedAppConnectionStatusProvider;
AppMagic.Services.AuthenticationBrokerManagerFactory.instance = new AppMagic.Services.WindowsAuthenticationBrokerManagerFactory(new AppMagic.Services.WebViewAuthenticationBroker, new AppMagic.Services.WindowsAuthenticationBroker({forceAzureFormsAuth: !0}), AppMagic.ConnectionStatusProvider.instance);