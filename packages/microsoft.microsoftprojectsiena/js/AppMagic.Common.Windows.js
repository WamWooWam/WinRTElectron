//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var WebViewAuthenticationBroker = function() {
                function WebViewAuthenticationBroker(){}
                return WebViewAuthenticationBroker.prototype.authenticateAsync = function(requestUri, callbackUri) {
                        var completablePromise = Core.Promise.createCompletablePromise(),
                            authenticationCanceled = !1,
                            dialog;
                        return setImmediate(function() {
                                authenticationCanceled || (dialog = new AppMagic.Popups.AuthenticationDialog(requestUri, callbackUri), dialog.showAsync().then(function() {
                                    completablePromise.complete(dialog.authenticationResult)
                                }, function(error) {
                                    completablePromise.error(error)
                                }))
                            }), completablePromise.promise.then(null, function(error) {
                                authenticationCanceled = !0;
                                throw error;
                            })
                    }, WebViewAuthenticationBroker
            }();
        Services.WebViewAuthenticationBroker = WebViewAuthenticationBroker
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var WindowsCookieManager = function() {
                function WindowsCookieManager() {
                    this._platformCookieManager = (new Windows.Web.Http.Filters.HttpBaseProtocolFilter).cookieManager
                }
                return WindowsCookieManager.prototype.deleteCookies = function(uri) {
                        var _this = this,
                            cookies = this.getCookies(uri);
                        cookies.forEach(function(cookie) {
                            _this._platformCookieManager.deleteCookie(cookie)
                        })
                    }, WindowsCookieManager.prototype.getCookies = function(uriString) {
                        try {
                            var uri = new Windows.Foundation.Uri(uriString)
                        }
                        catch(e) {
                            return []
                        }
                        return this._platformCookieManager.getCookies(uri)
                    }, WindowsCookieManager
            }();
        Services.WindowsCookieManager = WindowsCookieManager
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var WindowsAuthenticationBroker = function() {
                function WindowsAuthenticationBroker(options) {
                    options === void 0 && (options = null);
                    this._options = options
                }
                return WindowsAuthenticationBroker.prototype.authenticateAsync = function(authUriString, callbackUriString) {
                        var _this = this;
                        var completablePromise = Core.Promise.createCompletablePromise(),
                            authenticationCanceled = !1;
                        return setImmediate(function() {
                                authenticationCanceled || _this._authenticateAsync(authUriString, callbackUriString).then(function(authenticationResult) {
                                    return completablePromise.complete(authenticationResult)
                                })
                            }), completablePromise.promise.then(null, function(error) {
                                authenticationCanceled = !0;
                                throw error;
                            })
                    }, WindowsAuthenticationBroker.prototype._authenticateAsync = function(authUriString, callbackUriString) {
                        try {
                            var authUri = new Windows.Foundation.Uri(authUriString)
                        }
                        catch(e) {
                            return WinJS.Promise.wrap({
                                    authenticationStatus: 3, navigatedUris: []
                                })
                        }
                        var authenticationOptions = Windows.Security.Authentication.Web.WebAuthenticationOptions.useCorporateNetwork;
                        var broker = Windows.Security.Authentication.Web.WebAuthenticationBroker;
                        return broker.authenticateAsync(authenticationOptions, authUri).then(function(brokerResponse) {
                                return {
                                        authenticationStatus: WindowsAuthenticationBroker.parseWabStatus(brokerResponse.responseStatus), responseData: brokerResponse.responseData, navigatedUris: []
                                    }
                            }, function(error) {
                                if (Core.Utility.isCanceledError(error))
                                    throw error;
                                return {
                                        authenticationStatus: 4, navigatedUris: []
                                    }
                            })
                    }, WindowsAuthenticationBroker.parseWabStatus = function(responseStatus) {
                            var webAuthenticationStatus = Windows.Security.Authentication.Web.WebAuthenticationStatus;
                            switch (responseStatus) {
                                case webAuthenticationStatus.success:
                                    return 1;
                                case webAuthenticationStatus.userCancel:
                                    return 2;
                                case webAuthenticationStatus.errorHttp:
                                    return 4;
                                default:
                                    return 4
                            }
                        }, WindowsAuthenticationBroker
            }();
        Services.WindowsAuthenticationBroker = WindowsAuthenticationBroker
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var WindowsAuthenticationBrokerManagerFactory = function() {
                function WindowsAuthenticationBrokerManagerFactory(defaultBroker, azureBroker, connectionStatusProvider) {
                    this._defaultBroker = defaultBroker;
                    this._azureBroker = azureBroker;
                    this._connectionStatusProvider = connectionStatusProvider;
                    this._defaultBrokerManager = new Services.AuthenticationBrokerManager(this._defaultBroker);
                    this._azureBroker && (this._azureBrokerManager = new Services.AuthenticationBrokerManager(this._azureBroker))
                }
                return WindowsAuthenticationBrokerManagerFactory.prototype.getBrokerManager = function() {
                        return this._defaultBrokerManager
                    }, WindowsAuthenticationBrokerManagerFactory.prototype.getAzureBrokerManager = function() {
                        if (!this._connectionStatusProvider)
                            return this._defaultBrokerManager;
                        var corpNetConnectionStatus = this._connectionStatusProvider.getCorpNetConnectionStatus();
                        return corpNetConnectionStatus === 0 ? this._azureBrokerManager : this._defaultBrokerManager
                    }, WindowsAuthenticationBrokerManagerFactory
            }();
        Services.WindowsAuthenticationBrokerManagerFactory = WindowsAuthenticationBrokerManagerFactory
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var DynamicDataSource;
    (function(DynamicDataSource) {
        var WindowsConnectionDataSource = function() {
                function WindowsConnectionDataSource() {
                    this._isEnabled = !1;
                    this._connected = !0;
                    this._metered = !1
                }
                return Object.defineProperty(WindowsConnectionDataSource.prototype, "isEnabled", {
                        get: function() {
                            return this._isEnabled
                        }, enumerable: !0, configurable: !0
                    }), WindowsConnectionDataSource.prototype.subscribe = function() {
                        Windows.Networking.Connectivity.NetworkInformation !== null && (Windows.Networking.Connectivity.NetworkInformation.addEventListener("networkstatuschanged", this._onConnectionSignalChanged.bind(this)), this._isEnabled = !0)
                    }, WindowsConnectionDataSource.prototype.unSubscribe = function() {
                            if (Windows.Networking.Connectivity.NetworkInformation === null) {
                                this._isEnabled = !1;
                                return
                            }
                            Windows.Networking.Connectivity.NetworkInformation.removeEventListener("networkstatuschanged", this._onConnectionSignalChanged.bind(this));
                            this._isEnabled = !1
                        }, WindowsConnectionDataSource.prototype.getData = function(errorFunction) {
                            return this._updateConnectionStatus(), new DynamicDataSource.ConnectionData(this._connected, this._metered)
                        }, WindowsConnectionDataSource.prototype._onConnectionSignalChanged = function(args) {
                            this._updateConnectionStatus()
                        }, WindowsConnectionDataSource.prototype._updateConnectionStatus = function() {
                            var connectionProfile = Windows.Networking.Connectivity.NetworkInformation.getInternetConnectionProfile();
                            if (connectionProfile === null)
                                this._connected = !1,
                                this._metered = !1;
                            else {
                                var networkConnectivityLevel = connectionProfile.getNetworkConnectivityLevel();
                                this._connected = networkConnectivityLevel === Windows.Networking.Connectivity.NetworkConnectivityLevel.internetAccess;
                                var connectionCost = connectionProfile.getConnectionCost();
                                this._metered = connectionCost.networkCostType === Windows.Networking.Connectivity.NetworkCostType.fixed || connectionCost.networkCostType === Windows.Networking.Connectivity.NetworkCostType.variable
                            }
                            var connectionData = new DynamicDataSource.ConnectionData(this._connected, this._metered);
                            AppMagic.AuthoringTool.Runtime.updateDynamicDatasource(AppMagic.Strings.ConnectionDataSourceName, connectionData)
                        }, WindowsConnectionDataSource
            }();
        DynamicDataSource.WindowsConnectionDataSource = WindowsConnectionDataSource
    })(DynamicDataSource = AppMagic.DynamicDataSource || (AppMagic.DynamicDataSource = {}))
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
        var WindowsDynamicDataSourceFactory = function(_super) {
                __extends(WindowsDynamicDataSourceFactory, _super);
                function WindowsDynamicDataSourceFactory() {
                    _super.call(this);
                    WinJS.Utilities.hasWinRT ? (this.dynamicDataSources[AppMagic.Strings.LocationDataSourceName] = new DynamicDataSource.WindowsLocationDataSource, this.dynamicDataSources[AppMagic.Strings.ConnectionDataSourceName] = new DynamicDataSource.ConnectionDataSource(new DynamicDataSource.WindowsNetworkConnectionProfile, null)) : (this.dynamicDataSources[AppMagic.Strings.LocationDataSourceName] = new DynamicDataSource.HTML5LocationDataSource, this.dynamicDataSources[AppMagic.Strings.ConnectionDataSourceName] = new DynamicDataSource.NullConnectionDataSource)
                }
                return WindowsDynamicDataSourceFactory
            }(DynamicDataSource.DynamicDataSourceFactory);
        DynamicDataSource.WindowsDynamicDataSourceFactory = WindowsDynamicDataSourceFactory
    })(DynamicDataSource = AppMagic.DynamicDataSource || (AppMagic.DynamicDataSource = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Encryption;
    (function(Encryption) {
        var WindowsEncryptionProvider = function() {
                function WindowsEncryptionProvider(){}
                return WindowsEncryptionProvider.prototype.generateHmacSha1Signature = function(sigBaseString, keyText) {
                        var keyMaterial = Windows.Security.Cryptography.CryptographicBuffer.convertStringToBinary(keyText, Windows.Security.Cryptography.BinaryStringEncoding.Utf8),
                            macAlgorithmProvider = Windows.Security.Cryptography.Core.MacAlgorithmProvider.openAlgorithm("HMAC_SHA1"),
                            key = macAlgorithmProvider.createKey(keyMaterial),
                            tbs = Windows.Security.Cryptography.CryptographicBuffer.convertStringToBinary(sigBaseString, Windows.Security.Cryptography.BinaryStringEncoding.Utf8),
                            signatureBuffer = Windows.Security.Cryptography.Core.CryptographicEngine.sign(key, tbs);
                        return Windows.Security.Cryptography.CryptographicBuffer.encodeToBase64String(signatureBuffer)
                    }, WindowsEncryptionProvider
            }();
        Encryption.WindowsEncryptionProvider = WindowsEncryptionProvider
    })(Encryption = AppMagic.Encryption || (AppMagic.Encryption = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var DynamicDataSource;
    (function(DynamicDataSource) {
        var WindowsLocationDataSource = function() {
                function WindowsLocationDataSource() {
                    this._locationService = new Windows.Devices.Geolocation.Geolocator;
                    this._isEnabled = !1
                }
                return Object.defineProperty(WindowsLocationDataSource.prototype, "isEnabled", {
                        get: function() {
                            return this._isEnabled
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(WindowsLocationDataSource.prototype, "locationService", {
                        get: function() {
                            return this._locationService
                        }, enumerable: !0, configurable: !0
                    }), WindowsLocationDataSource.prototype.subscribe = function() {
                            this._locationService !== null && (this._locationService.addEventListener("positionchanged", this.onPositionSignalChanged.bind(this)), this._isEnabled = !0)
                        }, WindowsLocationDataSource.prototype.unSubscribe = function() {
                            if (this._locationService === null) {
                                this._isEnabled = !1;
                                return
                            }
                            this._locationService.removeEventListener("positionchanged", this.onPositionSignalChanged.bind(this));
                            this._isEnabled = !1
                        }, WindowsLocationDataSource.prototype.getData = function(errorFunction) {
                            return this._locationService === null ? null : (this._locationService.getGeopositionAsync().then(this.onGetPosition.bind(this), errorFunction), new DynamicDataSource.LocationData(0, 0, 0))
                        }, WindowsLocationDataSource.prototype.onPositionSignalChanged = function(args) {
                            this.onGetPosition(args.position)
                        }, WindowsLocationDataSource.prototype.onGetPosition = function(position) {
                            var coordinate = position.coordinate;
                            var retVal = new DynamicDataSource.LocationData(coordinate.latitude, coordinate.longitude, coordinate.altitude);
                            AppMagic.AuthoringTool.Runtime.updateDynamicDatasource(AppMagic.Strings.LocationDataSourceName, retVal)
                        }, WindowsLocationDataSource
            }();
        DynamicDataSource.WindowsLocationDataSource = WindowsLocationDataSource
    })(DynamicDataSource = AppMagic.DynamicDataSource || (AppMagic.DynamicDataSource = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var DynamicDataSource;
    (function(DynamicDataSource) {
        var WindowsNetworkConnectionProfile = function() {
                function WindowsNetworkConnectionProfile(){}
                return WindowsNetworkConnectionProfile.prototype.subscribe = function(callbackFunction) {
                        Windows.Networking.Connectivity.NetworkInformation !== null && Windows.Networking.Connectivity.NetworkInformation.addEventListener("networkstatuschanged", callbackFunction)
                    }, WindowsNetworkConnectionProfile.prototype.unSubscribe = function(callbackFunction) {
                        Windows.Networking.Connectivity.NetworkInformation !== null && Windows.Networking.Connectivity.NetworkInformation.removeEventListener("networkstatuschanged", callbackFunction)
                    }, WindowsNetworkConnectionProfile.prototype.getConnectionType = function() {
                            var networkConnectivityLevel = Windows.Networking.Connectivity.NetworkConnectivityLevel.None,
                                networkCostType = Windows.Networking.Connectivity.NetworkCostType.unknown,
                                connectionProfile = Windows.Networking.Connectivity.NetworkInformation.getInternetConnectionProfile();
                            return connectionProfile !== null && (networkConnectivityLevel = connectionProfile.getNetworkConnectivityLevel(), networkCostType = connectionProfile.getConnectionCost().networkCostType), this._createConnectionData(networkConnectivityLevel, networkCostType)
                        }, WindowsNetworkConnectionProfile.prototype._createConnectionData = function(networkConnectivityLevel, networkCostType) {
                            var connected = networkConnectivityLevel === Windows.Networking.Connectivity.NetworkConnectivityLevel.internetAccess,
                                metered = networkCostType === Windows.Networking.Connectivity.NetworkCostType.fixed || networkCostType === Windows.Networking.Connectivity.NetworkCostType.variable;
                            return new DynamicDataSource.ConnectionData(connected, metered)
                        }, WindowsNetworkConnectionProfile
            }();
        DynamicDataSource.WindowsNetworkConnectionProfile = WindowsNetworkConnectionProfile
    })(DynamicDataSource = AppMagic.DynamicDataSource || (AppMagic.DynamicDataSource = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Settings;
    (function(Settings) {
        var crypto = Windows.Security.Cryptography,
            store = WinJS.Application.local,
            WindowsSettingsProvider = function() {
                function WindowsSettingsProvider() {
                    this.settings = {};
                    this.protEnc = null;
                    this.protDec = null;
                    this.dirty = !1;
                    this.savePromise = null;
                    this.protEnc = crypto.DataProtection.DataProtectionProvider(WindowsSettingsProvider.PROTECTION_DESCRIPTOR);
                    this.protDec = crypto.DataProtection.DataProtectionProvider()
                }
                return WindowsSettingsProvider.prototype.load = function() {
                        var _this = this,
                            errorFn = function() {
                                return _this.settings = {}, !1
                            },
                            loadFile = function(exists) {
                                return exists ? store.readText(WindowsSettingsProvider.SETTINGS_FILE, "").then(decryptData) : WinJS.Promise.wrap(errorFn())
                            },
                            decryptData = function(encData) {
                                if (!encData)
                                    return errorFn();
                                var encBuffer = crypto.CryptographicBuffer.decodeFromBase64String(encData);
                                return _this.protDec.unprotectAsync(encBuffer).then(parseSettings)
                            },
                            parseSettings = function(buffer) {
                                var data = crypto.CryptographicBuffer.convertBinaryToString(WindowsSettingsProvider.PROTECTION_ENCODING, buffer);
                                return _this.settings = JSON.parse(data), !0
                            };
                        return store.exists(WindowsSettingsProvider.SETTINGS_FILE).then(loadFile).then(null, errorFn)
                    }, WindowsSettingsProvider.prototype.save = function() {
                        var _this = this;
                        if (this.dirty && !this.savePromise) {
                            var encryptData = function(data) {
                                    var buffer = crypto.CryptographicBuffer.convertStringToBinary(data, WindowsSettingsProvider.PROTECTION_ENCODING);
                                    return _this.protEnc.protectAsync(buffer)
                                },
                                saveFile = function(encBuffer) {
                                    var encData = crypto.CryptographicBuffer.encodeToBase64String(encBuffer);
                                    return store.writeText(WindowsSettingsProvider.SETTINGS_FILE, encData)
                                },
                                saveComplete = function() {
                                    return _this.savePromise = null, !0
                                },
                                saveError = function() {
                                    return _this.savePromise = null, !1
                                };
                            this.dirty = !1;
                            this.savePromise = encryptData(JSON.stringify(this.settings)).then(saveFile).then(saveComplete, saveError)
                        }
                        return this.savePromise || WinJS.Promise.as(!1)
                    }, WindowsSettingsProvider.prototype.getValue = function(key) {
                            return this.settings[key]
                        }, WindowsSettingsProvider.prototype.removeValue = function(key) {
                            delete this.settings[key];
                            this.markSaveAndDelayed()
                        }, WindowsSettingsProvider.prototype.setValue = function(key, value) {
                            this.settings[key] = value;
                            this.markSaveAndDelayed()
                        }, WindowsSettingsProvider.prototype.markSaveAndDelayed = function() {
                            var _this = this;
                            this.dirty || (this.dirty = !0, window.setImmediate(function() {
                                return _this.save
                            }))
                        }, WindowsSettingsProvider.SETTINGS_FILE = "appsettings.json", WindowsSettingsProvider.PROTECTION_DESCRIPTOR = "LOCAL=user", WindowsSettingsProvider.PROTECTION_ENCODING = Windows.Security.Cryptography.BinaryStringEncoding.utf8, WindowsSettingsProvider
            }();
        Settings.WindowsSettingsProvider = WindowsSettingsProvider
    })(Settings = AppMagic.Settings || (AppMagic.Settings = {}))
})(AppMagic || (AppMagic = {}));