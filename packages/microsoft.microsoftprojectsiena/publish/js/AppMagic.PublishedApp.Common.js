//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Publish;
    (function(Publish) {
        var Application;
        (function(Application) {
            var AppActivationEventArgs = function() {
                    function AppActivationEventArgs(){}
                    return AppActivationEventArgs
                }();
            Application.AppActivationEventArgs = AppActivationEventArgs,
            function(ActivationType) {
                ActivationType[ActivationType.Launch = 0] = "Launch";
                ActivationType[ActivationType.Unknown = 1] = "Unknown"
            }(Application.ActivationType || (Application.ActivationType = {}));
            var ActivationType = Application.ActivationType;
            (function(AppExecutionState) {
                AppExecutionState[AppExecutionState.NotRunning = 0] = "NotRunning";
                AppExecutionState[AppExecutionState.Running = 1] = "Running";
                AppExecutionState[AppExecutionState.Suspended = 2] = "Suspended";
                AppExecutionState[AppExecutionState.Terminated = 3] = "Terminated";
                AppExecutionState[AppExecutionState.ClosedByUser = 4] = "ClosedByUser"
            })(Application.AppExecutionState || (Application.AppExecutionState = {}));
            var AppExecutionState = Application.AppExecutionState
        })(Application = Publish.Application || (Publish.Application = {}))
    })(Publish = AppMagic.Publish || (AppMagic.Publish = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var PublishedApp;
    (function(PublishedApp) {
        var DataSources;
        (function(DataSources) {
            var LocalTableProvider = AppMagic.DataSources.LocalTableProvider,
                LocalTableProviderFactory = function() {
                    function LocalTableProviderFactory(){}
                    return LocalTableProviderFactory.prototype.createDataSourceProvider = function(configuration, dataSourceName, runtime) {
                            var readWriter = new DataSources.MemoryTableStorage(configuration, dataSourceName);
                            return new LocalTableProvider(runtime, readWriter)
                        }, LocalTableProviderFactory
                }();
            DataSources.LocalTableProviderFactory = LocalTableProviderFactory
        })(DataSources = PublishedApp.DataSources || (PublishedApp.DataSources = {}))
    })(PublishedApp = AppMagic.PublishedApp || (AppMagic.PublishedApp = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var PublishedApp;
    (function(PublishedApp) {
        var DataSources;
        (function(DataSources) {
            var MemoryTableStorage = function() {
                    function MemoryTableStorage(configuration, dataSourceName) {
                        this._configuration = configuration;
                        this._dataSourceName = dataSourceName
                    }
                    return Object.defineProperty(MemoryTableStorage.prototype, "name", {
                            get: function() {
                                return this._dataSourceName
                            }, enumerable: !0, configurable: !0
                        }), MemoryTableStorage.prototype.getData = function() {
                            return AppMagic.Utility.jsonClone(this._configuration.data)
                        }, MemoryTableStorage.prototype.getSchema = function() {
                                return AppMagic.Utility.jsonClone(this._configuration.schema)
                            }, MemoryTableStorage.prototype.setSchema = function(schema){}, MemoryTableStorage.prototype.setData = function(data){}, MemoryTableStorage
                }();
            DataSources.MemoryTableStorage = MemoryTableStorage
        })(DataSources = PublishedApp.DataSources || (PublishedApp.DataSources = {}))
    })(PublishedApp = AppMagic.PublishedApp || (AppMagic.PublishedApp = {}))
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
            Application.GenericInitError = AppMagic.Strings.GenericInitError;
            Application.GenericInitTitle = AppMagic.Strings.GenericInitTitle
        })(Application = Publish.Application || (Publish.Application = {}))
    })(Publish = AppMagic.Publish || (AppMagic.Publish = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var MarkupService;
    (function(MarkupService) {
        var PackagedMarkupService = function() {
                function PackagedMarkupService() {
                    this._uriToConstructor = {}
                }
                return PackagedMarkupService.prototype.injectMarkup = function(uri) {
                        return WinJS.Promise.as(!0)
                    }, PackagedMarkupService.prototype.associateView = function(uri, viewConstructor) {
                        this._uriToConstructor[uri] = viewConstructor;
                        WinJS.UI && WinJS.UI.Pages && WinJS.UI.Pages.define && uri.indexOf("notification.html") >= 0 && WinJS.UI.Pages.define(uri, {ready: function(element) {
                                new viewConstructor(element)
                            }})
                    }, PackagedMarkupService.prototype.render = function(uri, element) {
                            var markupElement = document.getElementById(uri);
                            WinJS.Utilities.setInnerHTMLUnsafe(element, markupElement.innerHTML);
                            var viewConstructor = this._uriToConstructor[uri];
                            return viewConstructor && new viewConstructor(element), WinJS.Promise.as(element)
                        }, PackagedMarkupService
            }();
        MarkupService.PackagedMarkupService = PackagedMarkupService
    })(MarkupService = AppMagic.MarkupService || (AppMagic.MarkupService = {}))
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
            WinJS.Namespace.define("Microsoft.AppMagic.Authoring.ControlRequirementType", {
                css: 0, folder: 1, image: 2, javaScript: 3, markup: 4, media: 5, other: 6
            });
            function setSplashScreenColor(bgColor) {
                var splashScreen = document.getElementById("splashScreen");
                splashScreen.style.backgroundColor = bgColor
            }
            WinJS.Namespace.define("Microsoft.AppMagic", {setSplashScreenColor: setSplashScreenColor});
            function hideSplashScreen() {
                var splashScreen = document.getElementById("splashScreen");
                document.body.removeChild(splashScreen)
            }
            var PublishedApp = function() {
                    function PublishedApp(errorHandler, sessionState) {
                        this._viewBox = null;
                        this._errorHandler = errorHandler;
                        this._sessionState = sessionState
                    }
                    return PublishedApp.prototype.onActivated = function(activationArgs) {
                            var _this = this;
                            if (activationArgs.ActivationType === 0) {
                                var prevState = activationArgs.PreviousExecutionState,
                                    startupPromise = this._loadPlugins(),
                                    isResumeFromTerminated = prevState === 3 && typeof this._sessionState.getSessionState() != "undefined";
                                if (prevState !== 1 && prevState !== 2) {
                                    if (isResumeFromTerminated)
                                        AppMagic.AuthoringTool.Runtime.onResumeFromTerminate(this._sessionState.getSessionState());
                                    startupPromise.then(function() {
                                        return _this._initializeApp(isResumeFromTerminated)
                                    })
                                }
                                return startupPromise
                            }
                        }, PublishedApp.prototype.onCheckpoint = function() {
                            var suspendState = {
                                    currentScreen: AppMagic.Publish.Canvas.currentScreen, contextSuspendState: {}
                                };
                            AppMagic.AuthoringTool.Runtime.onSuspend(suspendState);
                            var contextSuspendState = AppMagic.Controls.GlobalContextManager.instance.dehydrateBindingContext(AppMagic.Controls.GlobalContextManager.bindingContext);
                            suspendState.contextSuspendState = contextSuspendState;
                            PublishedApp._updateSuspendState(suspendState);
                            this._sessionState.setSessionState(suspendState);
                            var serviceCallsInFlight = AppMagic.AuthoringTool.Runtime.getOutstandingServiceCallsPromises();
                            return serviceCallsInFlight.push(AppMagic.Settings.instance.save()), WinJS.Promise.join(serviceCallsInFlight)
                        }, PublishedApp.prototype.onResume = function(suspendState) {
                                if (suspendState && suspendState.contextSuspendState)
                                    return PublishedApp._recoverAppState(suspendState.contextSuspendState), WinJS.Promise.as(AppMagic.Controls.GlobalContextManager.instance.hydrateBindingContext(AppMagic.Controls.GlobalContextManager.bindingContext, suspendState.contextSuspendState))
                            }, PublishedApp.prototype._initializeApp = function(isResumeFromTerminated) {
                                var _this = this,
                                    loadingDialog = new AppMagic.Popups.WaitDialog(AppMagic.Strings.LoadingMessage);
                                loadingDialog.showAsync();
                                isResumeFromTerminated = !1;
                                AppMagic.Settings.instance.load().then(function() {
                                    return initappmagic(isResumeFromTerminated)
                                }).then(function() {
                                    return _this._loadAppState(isResumeFromTerminated)
                                }).then(function() {
                                    return _this._scaleCanvasToFit()
                                }).then(function() {
                                    return _this._initializeControlManager(isResumeFromTerminated)
                                }).then(function() {
                                    return loadingDialog.close()
                                }).then(function() {
                                    return AppMagic.DocumentLayout.instance.layoutEngine.clean()
                                }).then(function() {
                                    return _this._initializeRules(isResumeFromTerminated)
                                }).then(function() {
                                    return _this._navigateToFirstScreen(isResumeFromTerminated)
                                }).then(function() {
                                    return _this._viewBox.forceUpdate()
                                }).then(null, function(err) {
                                    return _this._handleInitializationErrors(err)
                                })
                            }, PublishedApp.prototype._loadAppState = function(isResumeFromTerminated) {
                                if (isResumeFromTerminated)
                                    try {
                                        var suspendState = this._sessionState.getSessionState();
                                        if (!suspendState)
                                            return;
                                        PublishedApp._recoverAppState(suspendState)
                                    }
                                    catch(err) {
                                        this._errorHandler.terminate(err)
                                    }
                            }, PublishedApp._updateSuspendState = function(src) {
                                Object.keys(src).forEach(function(propertyName) {
                                    var item = src[propertyName];
                                    AppMagic.Utility.isOpenAjaxControl(item) ? src[propertyName] = AppMagic.Constants.Runtime.suspendResumeControlIdProperty + item.OpenAjax.getId() : item !== null && typeof item == "object" && PublishedApp._updateSuspendState(item)
                                })
                            }, PublishedApp._recoverAppState = function(src) {
                                var suspendResumeControlIdPrefixLen = AppMagic.Constants.Runtime.suspendResumeControlIdProperty.length;
                                Object.keys(src).forEach(function(propertyName) {
                                    var item = src[propertyName];
                                    if (typeof item == "string") {
                                        if (item.indexOf(AppMagic.Constants.Runtime.suspendResumeControlIdProperty) === 0) {
                                            var id = item.substr(suspendResumeControlIdPrefixLen);
                                            src[propertyName] = AppMagic.AuthoringTool.Runtime.getNamedObject(id)
                                        }
                                    }
                                    else
                                        item !== null && typeof item == "object" && PublishedApp._recoverAppState(item)
                                })
                            }, PublishedApp.prototype._scaleCanvasToFit = function() {
                                if (this._viewBox == null) {
                                    var canvas = document.getElementById("publishedCanvas");
                                    return canvas.style.width = AppMagic.DocumentLayout.instance.width + "px", canvas.style.height = AppMagic.DocumentLayout.instance.height + "px", this._viewBox = new Application.ViewBox(document.body, canvas), !0
                                }
                                return !1
                            }, PublishedApp.prototype._initializeControlManager = function(isResumeFromTerminated) {
                                if (isResumeFromTerminated)
                                    try {
                                        var suspendState = this._sessionState.getSessionState();
                                        if (!suspendState)
                                            return;
                                        AppMagic.Controls.GlobalContextManager.instance.hydrateBindingContext(AppMagic.Controls.GlobalContextManager.bindingContext, suspendState.contextSuspendState)
                                    }
                                    catch(err) {
                                        this._errorHandler.terminate(err)
                                    }
                                return !0
                            }, PublishedApp.prototype._initializeRules = function(isResumeFromTerminated) {
                                return initrules(isResumeFromTerminated), !0
                            }, PublishedApp.prototype._navigateToFirstScreen = function(isResumeFromTerminated) {
                                var sessionState = this._sessionState.getSessionState();
                                if (isResumeFromTerminated && typeof sessionState != "undefined" && typeof sessionState.currentScreen != "undefined")
                                    AppMagic.AuthoringTool.Runtime.navigateTo(sessionState.currentScreen, "");
                                else {
                                    var currentScreen = OpenAjax.widget.byId(AppMagic.Publish.Canvas.currentScreen);
                                    currentScreen.OpenAjax.fireEvent(AppMagic.AuthoringTool.OpenAjaxPropertyNames.OnVisible, currentScreen)
                                }
                                return hideSplashScreen(), !0
                            }, PublishedApp.prototype._handleInitializationErrors = function(err) {
                                this._errorHandler.showErrorAndTerminate(err)
                            }, PublishedApp.prototype._loadPlugins = function() {
                                if (window.cordova) {
                                    var completablePromise = Core.Promise.createCompletablePromise(),
                                        deviceReadyFunction = function() {
                                            completablePromise.complete();
                                            document.removeEventListener("deviceready", deviceReadyFunction)
                                        };
                                    return document.addEventListener("deviceready", deviceReadyFunction), completablePromise.promise
                                }
                                else
                                    return WinJS.Promise.wrap()
                            }, PublishedApp
                }();
            Application.PublishedApp = PublishedApp
        })(Application = Publish.Application || (Publish.Application = {}))
    })(Publish = AppMagic.Publish || (AppMagic.Publish = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var ConnectionStatusProvider;
    (function(ConnectionStatusProvider) {
        var PublishedAppConnectionStatusProvider = function() {
                function PublishedAppConnectionStatusProvider(){}
                return PublishedAppConnectionStatusProvider.prototype.getInternetConnectionStatus = function() {
                        return 0
                    }, PublishedAppConnectionStatusProvider.prototype.getCorpNetConnectionStatus = function() {
                        return 1
                    }, PublishedAppConnectionStatusProvider
            }();
        ConnectionStatusProvider.PublishedAppConnectionStatusProvider = PublishedAppConnectionStatusProvider
    })(ConnectionStatusProvider = AppMagic.ConnectionStatusProvider || (AppMagic.ConnectionStatusProvider = {}))
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
    var Publish;
    (function(Publish) {
        var Application;
        (function(Application) {
            var PublishedLayoutManager = function(_super) {
                    __extends(PublishedLayoutManager, _super);
                    function PublishedLayoutManager() {
                        _super.apply(this, arguments);
                        this._layoutEngine = new AppMagic.DocumentLayout.LayoutEngine(this);
                        this.layoutEngineActive = !1
                    }
                    return PublishedLayoutManager.prototype.setDimensions = function(width, height, orientation) {
                            this._width = width;
                            this._height = height;
                            this._orientation = orientation;
                            var canvas = document.getElementById("publishedCanvas");
                            canvas.style.width = this._width + "px";
                            canvas.style.height = this._height + "px"
                        }, Object.defineProperty(PublishedLayoutManager.prototype, "width", {
                            get: function() {
                                return this._width
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(PublishedLayoutManager.prototype, "height", {
                                get: function() {
                                    return this._height
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(PublishedLayoutManager.prototype, "orientation", {
                                get: function() {
                                    return this._orientation
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(PublishedLayoutManager.prototype, "layoutEngine", {
                                get: function() {
                                    return this._layoutEngine
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(PublishedLayoutManager.prototype, "aspectRatioMultiplier", {
                                get: function() {
                                    return 1
                                }, enumerable: !0, configurable: !0
                            }), PublishedLayoutManager
                }(AppMagic.Utility.Disposable);
            Application.PublishedLayoutManager = PublishedLayoutManager
        })(Application = Publish.Application || (Publish.Application = {}))
    })(Publish = AppMagic.Publish || (AppMagic.Publish = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var PublishedApp;
    (function(PublishedApp) {
        var DataSources;
        (function(DataSources) {
            var LocalTableProvider = AppMagic.DataSources.LocalTableProvider,
                PublishLocalTableProviderFactory = function() {
                    function PublishLocalTableProviderFactory(){}
                    return PublishLocalTableProviderFactory.prototype.createDataSourceProvider = function(configuration, dataSourceName, runtime) {
                            var memoryStorage = new DataSources.MemoryTableStorage(configuration, dataSourceName);
                            return new LocalTableProvider(runtime, memoryStorage)
                        }, PublishLocalTableProviderFactory
                }();
            DataSources.PublishLocalTableProviderFactory = PublishLocalTableProviderFactory
        })(DataSources = PublishedApp.DataSources || (PublishedApp.DataSources = {}))
    })(PublishedApp = AppMagic.PublishedApp || (AppMagic.PublishedApp = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var PackagedServiceImporter = function() {
                function PackagedServiceImporter(){}
                return PackagedServiceImporter.prototype.getServiceDefinitions = function() {
                        for (var beginSectionElement = document.getElementById("begin-service-json"), currentPackage = beginSectionElement.nextElementSibling, serviceDefinitions = []; currentPackage.id !== "end-service-json"; ) {
                            var serviceDefinition = JSON.parse(currentPackage.innerHTML);
                            serviceDefinitions.push(serviceDefinition);
                            currentPackage = currentPackage.nextElementSibling
                        }
                        return WinJS.Promise.wrap(serviceDefinitions)
                    }, PackagedServiceImporter
            }();
        Services.PackagedServiceImporter = PackagedServiceImporter
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
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
            var ViewBox = function() {
                    function ViewBox(container, resizeElement) {
                        this._container = container;
                        this._resizeElement = resizeElement;
                        window.addEventListener("resize", this.onResize.bind(this));
                        this.forceUpdate()
                    }
                    return ViewBox.prototype.forceUpdate = function() {
                            AppMagic.DocumentLayout.instance.layoutEngine.clean();
                            var matchedAspectRatio = !1;
                            for (var platform in AppMagic.DocumentLayout.Constants.Platforms) {
                                var platformSettings = AppMagic.DocumentLayout.Constants.Platforms[platform];
                                if (window.matchMedia(Core.Utility.formatString("(device-aspect-ratio: {0})", platformSettings.aspectRatio)).matches) {
                                    AppMagic.DocumentLayout.instance.layoutEngine.setDesiredLayout(platformSettings.width, platformSettings.height);
                                    matchedAspectRatio = !0;
                                    break
                                }
                            }
                            matchedAspectRatio || AppMagic.DocumentLayout.instance.layoutEngine.setDesiredLayout(AppMagic.DocumentLayout.instance.width, AppMagic.DocumentLayout.instance.height);
                            AppMagic.DocumentLayout.instance.layoutEngine.initialize();
                            var containerWidth = this._container.clientWidth,
                                containerHeight = this._container.clientHeight,
                                childWidth = this._resizeElement.clientWidth,
                                childHeight = this._resizeElement.clientHeight;
                            if (childWidth != 0 && childHeight !== 0) {
                                var scaleWidth = containerWidth / childWidth,
                                    scaleHeight = containerHeight / childHeight,
                                    scaleFactor = Math.min(scaleWidth, scaleHeight),
                                    xOffset = (childWidth * scaleFactor - childWidth) / 2,
                                    yOffset = (childHeight * scaleFactor - childHeight) / 2;
                                xOffset += (containerWidth - childWidth * scaleFactor) / 2;
                                yOffset += (containerHeight - childHeight * scaleFactor) / 2;
                                var translateString = "translate(" + xOffset + "px, " + yOffset + "px) scale(" + scaleFactor + ")";
                                this._resizeElement.style.transform = translateString;
                                this._resizeElement.style["-webkit-transform"] = translateString;
                                this._resizeElement.style["-moz-transform"] = translateString
                            }
                        }, ViewBox.prototype.onResize = function() {
                            var _this = this;
                            this._isUpdatePending || (this._isUpdatePending = !0, window.setImmediate(function() {
                                _this.forceUpdate();
                                _this._isUpdatePending = !1
                            }))
                        }, ViewBox
                }();
            Application.ViewBox = ViewBox
        })(Application = Publish.Application || (Publish.Application = {}))
    })(Publish = AppMagic.Publish || (AppMagic.Publish = {}))
})(AppMagic || (AppMagic = {}));