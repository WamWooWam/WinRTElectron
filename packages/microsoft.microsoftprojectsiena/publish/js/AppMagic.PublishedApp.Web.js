//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Cordova;
    (function(Cordova) {
        var CordovaInAppBrowser = function() {
                function CordovaInAppBrowser(){}
                return CordovaInAppBrowser.prototype.open = function(uri, target, options) {
                        return window.open(uri, target, options)
                    }, CordovaInAppBrowser
            }();
        Cordova.CordovaInAppBrowser = CordovaInAppBrowser
    })(Cordova = AppMagic.Cordova || (AppMagic.Cordova = {}))
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
            var WebErrorHandler = function() {
                    function WebErrorHandler(){}
                    return WebErrorHandler.prototype.showErrorAndTerminate = function(error) {
                            var content = error.message || Application.GenericInitError,
                                md = new AppMagic.Popups.MessageDialog(content, Application.GenericInitTitle);
                            return md.showAsync()
                        }, WebErrorHandler.prototype.terminate = function(error){}, WebErrorHandler
                }();
            Application.WebErrorHandler = WebErrorHandler
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
            var WebSessionState = function() {
                    function WebSessionState() {
                        this._state = null
                    }
                    return WebSessionState.prototype.setSessionState = function(state) {
                            this._state = state
                        }, WebSessionState.prototype.getSessionState = function() {
                            return this._state
                        }, WebSessionState
                }();
            Application.WebSessionState = WebSessionState
        })(Application = Publish.Application || (Publish.Application = {}))
    })(Publish = AppMagic.Publish || (AppMagic.Publish = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    function start() {
        var errorHandler = new AppMagic.Publish.Application.WebErrorHandler,
            sessionState = new AppMagic.Publish.Application.WebSessionState,
            application = new AppMagic.Publish.Application.PublishedApp(errorHandler, sessionState),
            applicationEventArgs = new AppMagic.Publish.Application.AppActivationEventArgs;
        applicationEventArgs.ActivationType = 0;
        applicationEventArgs.PreviousExecutionState = 0;
        application.onActivated(applicationEventArgs)
    }
    AppMagic.start = start
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var CordovaAuthenticationBroker = function() {
                function CordovaAuthenticationBroker(){}
                return CordovaAuthenticationBroker.prototype.authenticateAsync = function(authUri, callbackUri) {
                        var authDialog = new Services.CordovaAuthenticationDialog(authUri, callbackUri);
                        return authDialog.showAsync()
                    }, CordovaAuthenticationBroker
            }();
        Services.CordovaAuthenticationBroker = CordovaAuthenticationBroker
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var UnsupportedAuthenticationBroker = function() {
                function UnsupportedAuthenticationBroker(){}
                return UnsupportedAuthenticationBroker.prototype.authenticateAsync = function(requestUri, callbackUri) {
                        var completablePromise = Core.Promise.createCompletablePromise(),
                            dialog = new AppMagic.Popups.MessageDialog(AppMagic.Strings.AuthenticationBrokerManagerErrorNotSupported);
                        return dialog.addButton(AppMagic.Strings.Cancel), dialog.showAsync().then(function() {
                                var result = {
                                        responseData: null, navigatedUris: [], authenticationStatus: 2
                                    };
                                completablePromise.complete(result)
                            }), completablePromise.promise
                    }, UnsupportedAuthenticationBroker
            }();
        Services.UnsupportedAuthenticationBroker = UnsupportedAuthenticationBroker
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var WebAuthenticationBrokerFactory = function() {
                function WebAuthenticationBrokerFactory(){}
                return WebAuthenticationBrokerFactory.createBrokerInstance = function() {
                        return window.cordova ? new Services.CordovaAuthenticationBroker : new Services.UnsupportedAuthenticationBroker
                    }, WebAuthenticationBrokerFactory
            }();
        Services.WebAuthenticationBrokerFactory = WebAuthenticationBrokerFactory
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var WebAuthenticationBrokerManagerFactory = function() {
                function WebAuthenticationBrokerManagerFactory(broker) {
                    this._broker = broker;
                    this._brokerManager = new Services.AuthenticationBrokerManager(this._broker)
                }
                return WebAuthenticationBrokerManagerFactory.prototype.getBrokerManager = function() {
                        return this._brokerManager
                    }, WebAuthenticationBrokerManagerFactory.prototype.getAzureBrokerManager = function() {
                        return this._brokerManager
                    }, WebAuthenticationBrokerManagerFactory
            }();
        Services.WebAuthenticationBrokerManagerFactory = WebAuthenticationBrokerManagerFactory
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Encryption;
    (function(Encryption) {
        var WebEncryptionProvider = function() {
                function WebEncryptionProvider(){}
                return WebEncryptionProvider.prototype.generateHmacSha1Signature = function(sigBaseString, keyText) {
                        return CryptoJS.HmacSHA1(sigBaseString, keyText).toString(CryptoJS.enc.Base64)
                    }, WebEncryptionProvider
            }();
        Encryption.WebEncryptionProvider = WebEncryptionProvider
    })(Encryption = AppMagic.Encryption || (AppMagic.Encryption = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Settings;
    (function(Settings) {
        var WebSettingsProvider = function() {
                function WebSettingsProvider(){}
                return WebSettingsProvider.prototype.load = function() {
                        return WinJS.Promise.as(!0)
                    }, WebSettingsProvider.prototype.save = function() {
                        return WinJS.Promise.as(!0)
                    }, WebSettingsProvider.prototype.getValue = function(key) {
                            return null
                        }, WebSettingsProvider.prototype.removeValue = function(key){}, WebSettingsProvider.prototype.setValue = function(key, value){}, WebSettingsProvider
            }();
        Settings.WebSettingsProvider = WebSettingsProvider
    })(Settings = AppMagic.Settings || (AppMagic.Settings = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            b.hasOwnProperty(p) && (d[p] = b[p]);
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    },
    AppMagic;
(function(AppMagic) {
    var DynamicDataSource;
    (function(DynamicDataSource) {
        var WebDynamicDataSourceFactory = function(_super) {
                __extends(WebDynamicDataSourceFactory, _super);
                function WebDynamicDataSourceFactory() {
                    _super.call(this);
                    this.dynamicDataSources[AppMagic.Strings.LocationDataSourceName] = new DynamicDataSource.HTML5LocationDataSource;
                    this.dynamicDataSources[AppMagic.Strings.ConnectionDataSourceName] = new DynamicDataSource.NullConnectionDataSource
                }
                return WebDynamicDataSourceFactory
            }(DynamicDataSource.DynamicDataSourceFactory);
        DynamicDataSource.WebDynamicDataSourceFactory = WebDynamicDataSourceFactory
    })(DynamicDataSource = AppMagic.DynamicDataSource || (AppMagic.DynamicDataSource = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
AppMagic.Services.Importer.instance = new AppMagic.Services.PackagedServiceImporter;
AppMagic.Settings.instance = new AppMagic.Settings.WebSettingsProvider;
AppMagic.MarkupService.instance = new AppMagic.MarkupService.PackagedMarkupService;
AppMagic.DynamicDataSource.instance = new AppMagic.DynamicDataSource.WebDynamicDataSourceFactory;
AppMagic.Encryption.instance = new AppMagic.Encryption.WebEncryptionProvider;
AppMagic.DocumentLayout.instance = new AppMagic.Publish.Application.PublishedLayoutManager;
AppMagic.ConnectionStatusProvider.instance = new AppMagic.ConnectionStatusProvider.PublishedAppConnectionStatusProvider;
AppMagic.Services.AuthenticationBrokerManagerFactory.instance = new AppMagic.Services.WebAuthenticationBrokerManagerFactory(AppMagic.Services.WebAuthenticationBrokerFactory.createBrokerInstance());
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var CordovaAuthenticationDialog = function() {
                function CordovaAuthenticationDialog(authUri, callbackUri, inAppBrowser) {
                    this._navigatedUris = [];
                    this._authComplete = !1;
                    this._inAppBrowser = inAppBrowser || new AppMagic.Cordova.CordovaInAppBrowser;
                    this._authUri = authUri;
                    this._callbackUri = callbackUri
                }
                return CordovaAuthenticationDialog.prototype.showAsync = function() {
                        this._eventTracker = new AppMagic.Utility.EventTracker;
                        this._window = this._inAppBrowser.open(this._authUri, CordovaAuthenticationDialog.InAppBrowserTarget, CordovaAuthenticationDialog.InAppBrowserOptions);
                        this._eventTracker.add(this._window, "loadstart", this._onLoadStart, this);
                        this._eventTracker.add(this._window, "loaderror", this._onLoadError, this);
                        this._eventTracker.add(this._window, "exit", this._onExit, this);
                        var promise = Core.Promise.createCompletablePromise();
                        return this._completeFn = promise.complete, promise.promise
                    }, CordovaAuthenticationDialog.prototype._onExit = function(evt) {
                        this._notifyAuthComplete(null, 2)
                    }, CordovaAuthenticationDialog.prototype._onLoadStart = function(evt) {
                            evt.url.indexOf(this._callbackUri) === 0 && (this._notifyAuthComplete(evt.url, 1), this._closeWindow())
                        }, CordovaAuthenticationDialog.prototype._onLoadError = function(evt) {
                            this._notifyAuthComplete(evt.url, 4);
                            this._closeWindow()
                        }, CordovaAuthenticationDialog.prototype._notifyAuthComplete = function(url, authStatus) {
                            if (!this._authComplete) {
                                this._authComplete = !0;
                                var authResult = {
                                        responseData: url, authenticationStatus: authStatus, navigatedUris: []
                                    };
                                this._completeFn(authResult)
                            }
                        }, CordovaAuthenticationDialog.prototype._closeWindow = function() {
                            this._window.close();
                            this._window = null;
                            this._eventTracker.dispose();
                            this._eventTracker = null
                        }, CordovaAuthenticationDialog.InAppBrowserTarget = "_blank", CordovaAuthenticationDialog.InAppBrowserOptions = "location=no,clearcache=yes,clearsessioncache=yes", CordovaAuthenticationDialog
            }();
        Services.CordovaAuthenticationDialog = CordovaAuthenticationDialog
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));