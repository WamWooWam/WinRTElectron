//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AsyncWhile = function() {
            function AsyncWhile(condition) {
                this._condition = condition
            }
            return AsyncWhile.prototype.loop = function(body) {
                    var complete,
                        promise = new WinJS.Promise(function(c) {
                            complete = c
                        });
                    return this._scheduleNext(body, complete), promise
                }, AsyncWhile.prototype._scheduleNext = function(body, complete) {
                    var _this = this;
                    this._condition() ? body().then(function() {
                        _this._scheduleNext(body, complete)
                    }) : complete()
                }, AsyncWhile
        }();
    AppMagic.AsyncWhile = AsyncWhile
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var DynamicDataSource;
    (function(DynamicDataSource) {
        var ConnectionData = function() {
                function ConnectionData(connected, metered) {
                    this.Connected = connected;
                    this.Metered = metered
                }
                return ConnectionData
            }();
        DynamicDataSource.ConnectionData = ConnectionData
    })(DynamicDataSource = AppMagic.DynamicDataSource || (AppMagic.DynamicDataSource = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var DynamicDataSource;
    (function(DynamicDataSource) {
        var ConnectionDataSource = function() {
                function ConnectionDataSource(networkConnectionProfile, updateDataFn) {
                    this._isEnabled = !1;
                    this._connected = !0;
                    this._metered = !1;
                    this._networkConnectionProfile = networkConnectionProfile;
                    updateDataFn || (updateDataFn = function(connectionData) {
                        AppMagic.AuthoringTool.Runtime.updateDynamicDatasource(AppMagic.Strings.ConnectionDataSourceName, connectionData)
                    });
                    this._updateDataFn = updateDataFn
                }
                return Object.defineProperty(ConnectionDataSource.prototype, "isEnabled", {
                        get: function() {
                            return this._isEnabled
                        }, enumerable: !0, configurable: !0
                    }), ConnectionDataSource.prototype.subscribe = function() {
                        this._networkConnectionProfile.subscribe(this._onConnectionSignalChanged.bind(this));
                        this._isEnabled = !0
                    }, ConnectionDataSource.prototype.unSubscribe = function() {
                            this._networkConnectionProfile.unSubscribe(this._onConnectionSignalChanged.bind(this));
                            this._isEnabled = !1
                        }, ConnectionDataSource.prototype.getData = function(errorFunction) {
                            return this._onConnectionSignalChanged(), new DynamicDataSource.ConnectionData(this._connected, this._metered)
                        }, ConnectionDataSource.prototype._onConnectionSignalChanged = function() {
                            var connection = this._networkConnectionProfile.getConnectionType();
                            this._updateConnectionStatus(connection.Connected, connection.Metered)
                        }, ConnectionDataSource.prototype._updateConnectionStatus = function(connected, metered) {
                            this._connected = connected;
                            this._metered = metered;
                            var connectionData = new DynamicDataSource.ConnectionData(this._connected, this._metered);
                            this._updateDataFn(connectionData)
                        }, ConnectionDataSource
            }();
        DynamicDataSource.ConnectionDataSource = ConnectionDataSource
    })(DynamicDataSource = AppMagic.DynamicDataSource || (AppMagic.DynamicDataSource = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var DynamicDataSource;
    (function(DynamicDataSource) {
        var NullConnectionDataSource = function() {
                function NullConnectionDataSource() {
                    this._isEnabled = !1
                }
                return Object.defineProperty(NullConnectionDataSource.prototype, "isEnabled", {
                        get: function() {
                            return this._isEnabled
                        }, enumerable: !0, configurable: !0
                    }), NullConnectionDataSource.prototype.subscribe = function() {
                        this._isEnabled = !0
                    }, NullConnectionDataSource.prototype.unSubscribe = function() {
                            this._isEnabled = !1
                        }, NullConnectionDataSource.prototype.getData = function(errorFunction) {
                            var connectionData = new DynamicDataSource.ConnectionData(!0, !1);
                            return AppMagic.AuthoringTool.Runtime.updateDynamicDatasource(AppMagic.Strings.LocationDataSourceName, connectionData), connectionData
                        }, NullConnectionDataSource
            }();
        DynamicDataSource.NullConnectionDataSource = NullConnectionDataSource
    })(DynamicDataSource = AppMagic.DynamicDataSource || (AppMagic.DynamicDataSource = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var InternetConnectionStatus;
(function(InternetConnectionStatus) {
    InternetConnectionStatus[InternetConnectionStatus.Connected = 0] = "Connected";
    InternetConnectionStatus[InternetConnectionStatus.Disconnected = 1] = "Disconnected"
})(InternetConnectionStatus || (InternetConnectionStatus = {}));
var CorpNetConnectionStatus;
(function(CorpNetConnectionStatus) {
    CorpNetConnectionStatus[CorpNetConnectionStatus.Connected = 0] = "Connected";
    CorpNetConnectionStatus[CorpNetConnectionStatus.Disconnected = 1] = "Disconnected"
})(CorpNetConnectionStatus || (CorpNetConnectionStatus = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Line = function() {
            function Line(x1, y1, x2, y2) {
                x1 === void 0 && (x1 = 0);
                y1 === void 0 && (y1 = 0);
                x2 === void 0 && (x2 = 0);
                y2 === void 0 && (y2 = 0);
                this.x1 = x1;
                this.y1 = y1;
                this.x2 = x2;
                this.y2 = y2
            }
            return Line
        }();
    AppMagic.Line = Line
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var StringResources = function() {
            function StringResources(resource) {
                this._resourceTree = resource;
                Windows && Windows.ApplicationModel && Windows.ApplicationModel.Resources && this._loadStringsInNamespace()
            }
            return StringResources.prototype._loadStringsInNamespace = function() {
                    var resources = Windows.ApplicationModel.Resources.Core.ResourceManager.current.mainResourceMap.getSubtree(this._resourceTree);
                    for (var property in resources)
                        resources.hasOwnProperty(property) && (this[property] = WinJS.Resources.getString("/" + this._resourceTree + "/" + property).value);
                    if (resources !== null && resources.first().hasCurrent) {
                        var languageResource = resources.first().current.value.candidates[0].qualifiers;
                        for (var qualifier in languageResource)
                            if (languageResource.hasOwnProperty(qualifier) && languageResource[qualifier].qualifierName === "Language") {
                                this[this._resourceTree.concat("Language")] = languageResource[qualifier].qualifierValue;
                                typeof Microsoft != "undefined" && typeof Microsoft.AppMagic != "undefined" && typeof Microsoft.AppMagic.Common != "undefined" && typeof Microsoft.AppMagic.Common.LocalizationHelper != "undefined" && typeof Microsoft.AppMagic.Common.LocalizationHelper.currentUILanguageName != "undefined" && (Microsoft.AppMagic.Common.LocalizationHelper.currentUILanguageName = languageResource[qualifier].qualifierValue);
                                break
                            }
                    }
                }, StringResources
        }();
    AppMagic.StringResources = StringResources;
    AppMagic.Strings = new StringResources("Strings");
    AppMagic.AuthoringStrings = new StringResources("AuthoringStrings");
    AppMagic.ControlStrings = new StringResources("ControlStrings")
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Common;
    (function(Common) {
        var DataSourceSetupState = function() {
                function DataSourceSetupState(){}
                return DataSourceSetupState.Unready = "unready", DataSourceSetupState.Ready = "ready", DataSourceSetupState
            }();
        Common.DataSourceSetupState = DataSourceSetupState
    })(Common = AppMagic.Common || (AppMagic.Common = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Common;
    (function(Common) {
        var DefaultDateProvider = function() {
                function DefaultDateProvider(){}
                return DefaultDateProvider.prototype.toUTCString = function() {
                        return (new Date).toUTCString()
                    }, DefaultDateProvider
            }();
        Common.DefaultDateProvider = DefaultDateProvider
    })(Common = AppMagic.Common || (AppMagic.Common = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Common;
    (function(Common) {
        var DefaultGuidGenerator = function() {
                function DefaultGuidGenerator(){}
                return DefaultGuidGenerator.prototype.generateGuid = function() {
                        return AppMagic.Utility.generate128BitUUID()
                    }, DefaultGuidGenerator
            }();
        Common.DefaultGuidGenerator = DefaultGuidGenerator
    })(Common = AppMagic.Common || (AppMagic.Common = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var IO;
    (function(IO) {
        var Path = function() {
                function Path(){}
                return Object.defineProperty(Path, "winjsPath", {
                        get: function() {
                            return WinJS.Utilities.hasWinRT ? "//Microsoft.WinJS.2.0/js/base.js" : Path.getFullPath("js/winjs/base.min.js")
                        }, enumerable: !0, configurable: !0
                    }), Path.getFullPath = function(path) {
                        var anchor = document.createElement("a");
                        return anchor.href = path, anchor.href
                    }, Path
            }();
        IO.Path = Path
    })(IO = AppMagic.IO || (AppMagic.IO = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Point = function() {
            function Point(x, y) {
                x === void 0 && (x = 0);
                y === void 0 && (y = 0);
                this.x = x;
                this.y = y
            }
            return Point
        }();
    AppMagic.Point = Point
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Rectangle = function() {
            function Rectangle(x, y, width, height) {
                x === void 0 && (x = 0);
                y === void 0 && (y = 0);
                width === void 0 && (width = 0);
                height === void 0 && (height = 0);
                this._setBounds(x, y, width, height)
            }
            return Rectangle.prototype._setBounds = function(x, y, width, height) {
                    x === void 0 && (x = 0);
                    y === void 0 && (y = 0);
                    width === void 0 && (width = 0);
                    height === void 0 && (height = 0);
                    this.x = x;
                    this.y = y;
                    this.width = width;
                    this.height = height
                }, Object.defineProperty(Rectangle.prototype, "left", {
                    get: function() {
                        return this.x
                    }, enumerable: !0, configurable: !0
                }), Object.defineProperty(Rectangle.prototype, "top", {
                        get: function() {
                            return this.y
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(Rectangle.prototype, "right", {
                        get: function() {
                            return this.x + this.width
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(Rectangle.prototype, "bottom", {
                        get: function() {
                            return this.y + this.height
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(Rectangle.prototype, "size", {
                        get: function() {
                            return new AppMagic.Size(this.width, this.height)
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(Rectangle.prototype, "center", {
                        get: function() {
                            return new AppMagic.Point(this.x + this.width / 2, this.y + this.height / 2)
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(Rectangle.prototype, "topLeft", {
                        get: function() {
                            return new AppMagic.Point(this.left, this.top)
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(Rectangle.prototype, "topRight", {
                        get: function() {
                            return new AppMagic.Point(this.right, this.top)
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(Rectangle.prototype, "bottomLeft", {
                        get: function() {
                            return new AppMagic.Point(this.left, this.bottom)
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(Rectangle.prototype, "bottomRight", {
                        get: function() {
                            return new AppMagic.Point(this.right, this.bottom)
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(Rectangle.prototype, "isEmpty", {
                        get: function() {
                            return this.width * this.height == 0
                        }, enumerable: !0, configurable: !0
                    }), Rectangle.prototype.offset = function(x, y) {
                        this.x += x;
                        this.y += y
                    }, Rectangle.prototype.union = function(second) {
                        Contracts.checkValue(second);
                        var x = Math.min(this.x, second.x),
                            y = Math.min(this.y, second.y),
                            width = Math.max(this.right, second.right) - x,
                            height = Math.max(this.bottom, second.bottom) - y;
                        this._setBounds(x, y, width, height)
                    }, Rectangle
        }();
    AppMagic.Rectangle = Rectangle
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Settings;
    (function(Settings) {
        Settings.instance = null
    })(Settings = AppMagic.Settings || (AppMagic.Settings = {}))
})(AppMagic || (AppMagic = {}));
var AppMagic;
(function(AppMagic) {
    var MarkupService;
    (function(MarkupService) {
        MarkupService.instance = null
    })(MarkupService = AppMagic.MarkupService || (AppMagic.MarkupService = {}))
})(AppMagic || (AppMagic = {}));
var AppMagic;
(function(AppMagic) {
    var DynamicDataSource;
    (function(DynamicDataSource) {
        DynamicDataSource.instance = null
    })(DynamicDataSource = AppMagic.DynamicDataSource || (AppMagic.DynamicDataSource = {}))
})(AppMagic || (AppMagic = {}));
var AppMagic;
(function(AppMagic) {
    var Encryption;
    (function(Encryption) {
        Encryption.instance = null
    })(Encryption = AppMagic.Encryption || (AppMagic.Encryption = {}))
})(AppMagic || (AppMagic = {}));
var AppMagic;
(function(AppMagic) {
    var ConnectionStatusProvider;
    (function(ConnectionStatusProvider) {
        ConnectionStatusProvider.instance = null
    })(ConnectionStatusProvider = AppMagic.ConnectionStatusProvider || (AppMagic.ConnectionStatusProvider = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var EventObject = function() {
        function EventObject() {
            this._listeners = []
        }
        return EventObject.prototype.addListener = function(callback) {
                this._listeners.push(callback)
            }, EventObject.prototype.removeListener = function(callback) {
                var listenerIndex = this._listeners.indexOf(callback);
                if (listenerIndex === -1)
                    throw"Invalid callback. Cannot remove listener that has not been previously added.";
                listenerIndex >= 0 && this._listeners.splice(listenerIndex, 1)
            }, EventObject.prototype.dispatch = function(val) {
                    for (var i = 0, len = this._listeners.length; i < len; i++)
                        this._listeners[i](val)
                }, EventObject.prototype.dispose = function() {
                    this._listeners = null
                }, EventObject
    }();
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var DynamicDataSource;
    (function(DynamicDataSource) {
        var DynamicDataSourceFactory = function() {
                function DynamicDataSourceFactory() {
                    this.dynamicDataSources = {}
                }
                return DynamicDataSourceFactory.prototype.getDynamicDataSource = function(signalName) {
                        return this.dynamicDataSources[signalName]
                    }, DynamicDataSourceFactory
            }();
        DynamicDataSource.DynamicDataSourceFactory = DynamicDataSourceFactory
    })(DynamicDataSource = AppMagic.DynamicDataSource || (AppMagic.DynamicDataSource = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var DynamicDataSource;
    (function(DynamicDataSource) {
        var HTML5LocationDataSource = function() {
                function HTML5LocationDataSource() {
                    this._isEnabled = !1
                }
                return Object.defineProperty(HTML5LocationDataSource.prototype, "isEnabled", {
                        get: function() {
                            return this._isEnabled
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(HTML5LocationDataSource.prototype, "locationService", {
                        get: function() {
                            return navigator.geolocation
                        }, enumerable: !0, configurable: !0
                    }), HTML5LocationDataSource.prototype.subscribe = function() {
                            this._watchId = navigator.geolocation.watchPosition(this.onPositionSignalChanged.bind(this));
                            this._isEnabled = !0
                        }, HTML5LocationDataSource.prototype.unSubscribe = function() {
                            navigator.geolocation.clearWatch(this._watchId);
                            this._isEnabled = !1;
                            this._watchId = null
                        }, HTML5LocationDataSource.prototype.getData = function(errorFunction) {
                            return navigator.geolocation.getCurrentPosition(this.onPositionSignalChanged, errorFunction), new DynamicDataSource.LocationData(0, 0, 0)
                        }, HTML5LocationDataSource.prototype.onPositionSignalChanged = function(position) {
                            var coords = position.coords,
                                retVal = new DynamicDataSource.LocationData(coords.latitude, coords.longitude, coords.altitude);
                            AppMagic.AuthoringTool.Runtime.updateDynamicDatasource(AppMagic.Strings.LocationDataSourceName, retVal)
                        }, HTML5LocationDataSource
            }();
        DynamicDataSource.HTML5LocationDataSource = HTML5LocationDataSource
    })(DynamicDataSource = AppMagic.DynamicDataSource || (AppMagic.DynamicDataSource = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var AuthenticationCache = function() {
                function AuthenticationCache(settings) {
                    this._settings = settings
                }
                return AuthenticationCache.prototype.getToken = function(serviceName, authId) {
                        var cachedTokens = this._getCachedTokens(),
                            cacheKey = this._generateCacheKey(serviceName, authId);
                        return typeof cachedTokens[cacheKey] != "undefined" ? cachedTokens[cacheKey] : null
                    }, AuthenticationCache.prototype.setToken = function(serviceName, authId, value) {
                        var cachedTokens = this._getCachedTokens(),
                            cacheKey = this._generateCacheKey(serviceName, authId);
                        cachedTokens[cacheKey] = value;
                        this._settings.setValue(AppMagic.Constants.Services.OAUTH_SETTINGS_KEY, cachedTokens)
                    }, AuthenticationCache.prototype.removeToken = function(serviceName, authId) {
                            var cachedTokens = this._getCachedTokens(),
                                cacheKey = this._generateCacheKey(serviceName, authId);
                            delete cachedTokens[cacheKey];
                            this._settings.setValue(AppMagic.Constants.Services.OAUTH_SETTINGS_KEY, cachedTokens)
                        }, AuthenticationCache.prototype.clearTokens = function() {
                            this._settings.setValue(AppMagic.Constants.Services.OAUTH_SETTINGS_KEY, {})
                        }, AuthenticationCache.prototype._getCachedTokens = function() {
                            return this._settings.getValue(AppMagic.Constants.Services.OAUTH_SETTINGS_KEY) || {}
                        }, AuthenticationCache.prototype._generateCacheKey = function(serviceName, authId) {
                            return [serviceName.length.toString(), "+", authId.length.toString(), "_", serviceName, authId].join("")
                        }, AuthenticationCache
            }();
        Services.AuthenticationCache = AuthenticationCache
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var DynamicDataSource;
    (function(DynamicDataSource) {
        var LocationData = function() {
                function LocationData(latitude, longitude, altitude) {
                    this.Latitude = latitude;
                    this.Longitude = longitude;
                    this.Altitude = altitude
                }
                return LocationData
            }();
        DynamicDataSource.LocationData = LocationData
    })(DynamicDataSource = AppMagic.DynamicDataSource || (AppMagic.DynamicDataSource = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Size = function() {
            function Size(width, height) {
                width === void 0 && (width = 0);
                height === void 0 && (height = 0);
                this.width = width;
                this.height = height
            }
            return Object.defineProperty(Size.prototype, "isEmpty", {
                    get: function() {
                        return this.width * this.height == 0
                    }, enumerable: !0, configurable: !0
                }), Size
        }();
    AppMagic.Size = Size
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Common;
    (function(Common) {
        var SvgPath = function() {
                function SvgPath() {
                    this._data = ""
                }
                return SvgPath.prototype.createSvgElement = function() {
                        var svg = document.createElementNS("http://www.w3.org/2000/svg", "path");
                        return svg.appendChild(this.createPathElement()), svg
                    }, SvgPath.prototype.createPathElement = function() {
                        var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                        return path.setAttribute("d", this._data), path
                    }, SvgPath.prototype.closePath = function() {
                            this._data += " Z"
                        }, SvgPath.prototype.horizontalTo = function(x) {
                            this._data += " H" + x.toString()
                        }, SvgPath.prototype.line = function(line) {
                            this.moveTo(line.x1, line.y1);
                            this.lineTo(line.x2, line.y2)
                        }, SvgPath.prototype.lineTo = function(x, y) {
                            this._data += " L" + x.toString() + " " + y.toString()
                        }, SvgPath.prototype.moveTo = function(x, y) {
                            this._data += " M" + x.toString() + " " + y.toString()
                        }, SvgPath.prototype.rectangle = function(rect) {
                            this.moveTo(rect.left, rect.top);
                            this.horizontalTo(rect.right);
                            this.verticalTo(rect.bottom);
                            this.horizontalTo(rect.left);
                            this.closePath()
                        }, SvgPath.prototype.relativeHorizontalTo = function(x) {
                            this._data += " h" + x.toString()
                        }, SvgPath.prototype.relativeLineTo = function(x, y) {
                            this._data += " l" + x.toString() + " " + y.toString()
                        }, SvgPath.prototype.relativeVerticalTo = function(y) {
                            this._data += " v" + y.toString()
                        }, SvgPath.prototype.verticalTo = function(y) {
                            this._data += " V" + y.toString()
                        }, SvgPath.prototype.lineTriangles = function(size, line) {
                            var minimumDistance = size * SvgPath.minimumLineTriangleLength;
                            if (line.y1 === line.y2) {
                                var x1 = Math.min(line.x1, line.x2),
                                    x2 = Math.max(line.x1, line.x2);
                                if (x2 - x1 >= minimumDistance) {
                                    var y = line.y1;
                                    this.moveTo(x1, y);
                                    this.relativeLineTo(size, -size / 2);
                                    this.relativeVerticalTo(size);
                                    this.closePath();
                                    this.moveTo(x2, y);
                                    this.relativeLineTo(-size, -size / 2);
                                    this.relativeVerticalTo(size);
                                    this.closePath()
                                }
                            }
                            else if (line.x1 === line.x2) {
                                var y1 = Math.min(line.y1, line.y2),
                                    y2 = Math.max(line.y1, line.y2);
                                if (y2 - y1 >= minimumDistance) {
                                    var x = line.x1;
                                    this.moveTo(x, y1);
                                    this.relativeLineTo(size / 2, size);
                                    this.relativeHorizontalTo(-size);
                                    this.closePath();
                                    this.moveTo(x, y2);
                                    this.relativeLineTo(size / 2, -size);
                                    this.relativeHorizontalTo(-size);
                                    this.closePath()
                                }
                            }
                        }, Object.defineProperty(SvgPath.prototype, "data", {
                            get: function() {
                                return this._data
                            }, enumerable: !0, configurable: !0
                        }), SvgPath.minimumLineTriangleLength = 2.5, SvgPath
            }();
        Common.SvgPath = SvgPath
    })(Common = AppMagic.Common || (AppMagic.Common = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var UI;
    (function(UI) {
        var Pages = function() {
                function Pages(){}
                return Pages.define = function(uri, viewConstructor) {
                        AppMagic.MarkupService.instance.associateView(uri, viewConstructor)
                    }, Pages
            }();
        UI.Pages = Pages
    })(UI = AppMagic.UI || (AppMagic.UI = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Common;
    (function(Common) {
        var util = AppMagic.Utility,
            PromiseCollection = function() {
                function PromiseCollection() {
                    this._jobs = {};
                    this._nextJobId = 0
                }
                return PromiseCollection.prototype.addJob = function(fn) {
                        var complete,
                            promise = new WinJS.Promise(function(c) {
                                complete = c
                            }),
                            that = this,
                            jobId = this._getNextJobId();
                        return promise = promise.then(fn).then(function(result) {
                                return delete that._jobs[jobId], result
                            }, function(error) {
                                delete that._jobs[jobId];
                                throw error;
                            }), this._jobs[jobId] = promise, complete(), promise
                    }, PromiseCollection.prototype.cancelAll = function() {
                        var that = this,
                            keys = Object.keys(this._jobs);
                        keys.forEach(function(key) {
                            that._jobs[key].cancel()
                        })
                    }, PromiseCollection.prototype.getJobsCount = function() {
                            return Object.keys(this._jobs).length
                        }, PromiseCollection.prototype._getNextJobId = function() {
                            var result = util.getNextId(this._nextJobId, this._jobs);
                            return this._nextJobId = result.newCounter, result.id
                        }, PromiseCollection
            }();
        Common.PromiseCollection = PromiseCollection
    })(Common = AppMagic.Common || (AppMagic.Common = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var Log = function() {
        function Log(){}
        return Log.writeln = function(msg) {
                var debugNameSpace = window.Debug;
                debugNameSpace && debugNameSpace.writeln ? debugNameSpace.writeln(msg) : window.console && window.console.log(msg)
            }, Log
    }();
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Utility;
    (function(Utility) {
        var ElementRenderer = function() {
                function ElementRenderer() {
                    this._offscreenCanvas = document.createElement("canvas");
                    this._offscreenCanvas.style.display = "none";
                    this._offscreenCanvas.setAttribute("aria-role", "presentation");
                    this._canvasContext = this._offscreenCanvas.getContext("2d")
                }
                return ElementRenderer.prototype.renderElementToDataUrl = function(element, width, height, imageType) {
                        return imageType = imageType || "image/jpeg", typeof width == "undefined" && (width = element.offsetWidth), typeof height == "undefined" && (height = element.offsetHeight), this._resizeCanvas(width, height), this._canvasContext.drawImage(element, 0, 0, width, height), this._offscreenCanvas.toDataURL(imageType)
                    }, ElementRenderer.prototype.dispose = function() {
                        this._offscreenCanvas = null;
                        this._canvasContext = null
                    }, ElementRenderer.prototype._resizeCanvas = function(width, height) {
                            this._offscreenCanvas.width = width;
                            this._offscreenCanvas.height = height;
                            this._offscreenCanvas.style.width = width.toString() + "px";
                            this._offscreenCanvas.style.height = height.toString() + "px"
                        }, ElementRenderer
            }();
        Utility.ElementRenderer = ElementRenderer
    })(Utility = AppMagic.Utility || (AppMagic.Utility = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var Enum;
(function(Enum) {
    function count(enumNamespace) {
        return Object.keys(enumNamespace).length / 2
    }
    Enum.count = count
})(Enum || (Enum = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Utility;
    (function(Utility) {
        var MimeType;
        (function(MimeType) {
            MimeType.MimeType_ImagePng = "image/png";
            MimeType.MimeType_ImageJpeg = "image/jpeg";
            MimeType.MimeType_ImageGif = "image/gif";
            MimeType.MimeType_ImageBmp = "image/bmp";
            MimeType.MimeType_ImageTiff = "image/tiff";
            MimeType.MimeType_ImageSvgXml = "image/svg+xml";
            MimeType.MimeType_AudioMpeg = "audio/mpeg";
            MimeType.MimeType_AudioWav = "audio/wav";
            MimeType.MimeType_AudioXMsWma = "audio/x-ms-wma";
            MimeType.MimeType_VideoMp4 = "video/mp4";
            MimeType.MimeType_VideoXMsWmv = "video/x-ms-wmv";
            MimeType.FileExt_Png = ".png";
            MimeType.FileExt_Jpg = ".jpg";
            MimeType.FileExt_Gif = ".gif";
            MimeType.FileExt_Bmp = ".bmp";
            MimeType.FileExt_Tiff = ".tiff";
            MimeType.FileExt_Svg = ".svg";
            MimeType.FileExt_Mpeg = ".mpeg";
            MimeType.FileExt_Wav = ".wav";
            MimeType.FileExt_Wma = ".wma";
            MimeType.FileExt_Mp4 = ".mp4";
            MimeType.FileExt_Wmv = ".wmv";
            function mimeTypeToFileExtension(mimeType) {
                switch (mimeType) {
                    case MimeType.MimeType_ImagePng:
                        return MimeType.FileExt_Png;
                    case MimeType.MimeType_ImageJpeg:
                        return MimeType.FileExt_Jpg;
                    case MimeType.MimeType_ImageGif:
                        return MimeType.FileExt_Gif;
                    case MimeType.MimeType_ImageBmp:
                        return MimeType.FileExt_Bmp;
                    case MimeType.MimeType_ImageTiff:
                        return MimeType.FileExt_Tiff;
                    case MimeType.MimeType_ImageSvgXml:
                        return MimeType.FileExt_Svg;
                    case MimeType.MimeType_AudioMpeg:
                        return MimeType.FileExt_Mpeg;
                    case MimeType.MimeType_AudioWav:
                        return MimeType.FileExt_Wav;
                    case MimeType.MimeType_AudioXMsWma:
                        return MimeType.FileExt_Wma;
                    case MimeType.MimeType_VideoMp4:
                        return MimeType.FileExt_Mp4;
                    case MimeType.MimeType_VideoXMsWmv:
                        return MimeType.FileExt_Wmv;
                    default:
                        return ""
                }
            }
            MimeType.mimeTypeToFileExtension = mimeTypeToFileExtension
        })(MimeType = Utility.MimeType || (Utility.MimeType = {}))
    })(Utility = AppMagic.Utility || (AppMagic.Utility = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Utility;
    (function(Utility) {
        var UriUtility;
        (function(UriUtility) {
            function parseUriComponents(uriString) {
                var hierPartDelimIdx = uriString.indexOf(":");
                if (hierPartDelimIdx === -1)
                    return null;
                var scheme = uriString.substr(0, hierPartDelimIdx),
                    queryDelimIdx = uriString.indexOf("?"),
                    fragmentDelimIdx = uriString.indexOf("#"),
                    queryComponent = queryDelimIdx === -1 ? "" : uriString.substring(queryDelimIdx + 1, fragmentDelimIdx === -1 ? uriString.length : fragmentDelimIdx);
                var fragmentComponent;
                return fragmentComponent = fragmentDelimIdx === -1 ? "" : uriString.substring(fragmentDelimIdx + 1), {
                        scheme: scheme, authority: null, path: null, query: queryComponent, fragment: fragmentComponent
                    }
            }
            UriUtility.parseUriComponents = parseUriComponents;
            function parseFormUrlEncodedStringToHashTable(formUrlEncodedString) {
                if (formUrlEncodedString.match(/[?#]/) !== null)
                    return null;
                var kvps = {};
                return formUrlEncodedString.split("&").forEach(function(nameValuePair) {
                        if (nameValuePair.length > 0) {
                            var parts = nameValuePair.split("=", 2);
                            var paramName = decodeURIComponent(parts[0]),
                                paramValue = decodeURIComponent(parts[1]);
                            kvps[paramName] = paramValue
                        }
                    }), kvps
            }
            UriUtility.parseFormUrlEncodedStringToHashTable = parseFormUrlEncodedStringToHashTable;
            function parseDataUrlComponents(uriString) {
                var hierPartDelimIdx = uriString.indexOf(":");
                if (hierPartDelimIdx === -1)
                    return null;
                var scheme = uriString.substr(0, hierPartDelimIdx);
                if (scheme !== "data")
                    return null;
                var commaDelimIdx = uriString.indexOf(",");
                if (commaDelimIdx === -1)
                    return null;
                var isBase64 = !1,
                    mediaTypePart;
                if (commaDelimIdx - hierPartDelimIdx > 1) {
                    var optionalParts = uriString.substr(hierPartDelimIdx, commaDelimIdx - hierPartDelimIdx),
                        lastSemiColonIdx = optionalParts.lastIndexOf(";");
                    if (lastSemiColonIdx === -1)
                        return null;
                    optionalParts.substr(lastSemiColonIdx) === ";base64" ? (isBase64 = !0, mediaTypePart = optionalParts.substr(0, lastSemiColonIdx)) : mediaTypePart = optionalParts
                }
                else
                    mediaTypePart = "";
                var mediaType = null;
                if (mediaTypePart.length > 0) {
                    var allParameters = mediaTypePart.split(";");
                    allParameters[0].indexOf("=") === -1 && (mediaType = allParameters.shift());
                    var hasInvalidParameters = !1;
                    if (allParameters.forEach(function(part) {
                        var eqCharIdx = part.indexOf("=");
                        eqCharIdx === -1 && (hasInvalidParameters = !0)
                    }), hasInvalidParameters)
                        return null
                }
                mediaType === null && (mediaType = "text/plain");
                var data = uriString.substr(commaDelimIdx + 1);
                return data = decodeURIComponent(data), {
                        mediaType: mediaType, isBase64: isBase64, data: data
                    }
            }
            UriUtility.parseDataUrlComponents = parseDataUrlComponents
        })(UriUtility = Utility.UriUtility || (Utility.UriUtility = {}))
    })(Utility = AppMagic.Utility || (AppMagic.Utility = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Utility;
    (function(Utility) {
        var StringUtility;
        (function(StringUtility) {
            function escapeCharacters(input, charsToEscape, escapeStr) {
                var value = input,
                    escapableRegexCharsRegex = /[.\\+*?\[\^\]$(){}=!<>|:\-]/,
                    charsToEscapeRegexString = charsToEscape.split("").map(function(charToEscape) {
                        return charToEscape.replace(escapableRegexCharsRegex, "\\$&")
                    }).join("|");
                return charsToEscapeRegexString = "(" + charsToEscapeRegexString + ")", value.replace(new RegExp(charsToEscapeRegexString, "g"), function(charToEscape) {
                        return escapeStr + charToEscape
                    })
            }
            StringUtility.escapeCharacters = escapeCharacters;
            function dotNetStringFormat_format_args(format, args) {
                return format.replace(/{{|}}|{(\d+)}/g, function(matchStr, argIdxStr) {
                        if (matchStr === "{{")
                            return "{";
                        else if (matchStr === "}}")
                            return "}";
                        var argIdx = parseInt(argIdxStr, 10);
                        Contracts.check(argIdx >= 0 && argIdx < args.length, "The format item {" + argIdx + "} has not been provided an argument in the 'args' parameter.");
                        var argValue = args[argIdx];
                        return argValue === null || typeof argValue == "undefined" ? "" : (Contracts.checkPrimitiveType(argValue, "dotNetStringFormat_format_args can only convert from primitive value types."), argValue.toString())
                    })
            }
            StringUtility.dotNetStringFormat_format_args = dotNetStringFormat_format_args
        })(StringUtility = Utility.StringUtility || (Utility.StringUtility = {}))
    })(Utility = AppMagic.Utility || (AppMagic.Utility = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Utility;
    (function(Utility) {
        Utility.EventTracker = Core.EventTracker;
        function areErrorNumbersEqual(err0, err1) {
            return err0.number === err1.number
        }
        Utility.areErrorNumbersEqual = areErrorNumbersEqual;
        function isString(value) {
            return typeof value == "string"
        }
        Utility.isString = isString;
        function generate128BitUUID() {
            var rand4HexDigits = function() {
                    return CryptoJS.lib.WordArray.random(2).toString()
                },
                uuid = rand4HexDigits() + rand4HexDigits() + "-" + rand4HexDigits() + "-" + rand4HexDigits() + "-" + rand4HexDigits() + "-" + rand4HexDigits() + rand4HexDigits() + rand4HexDigits();
            return uuid
        }
        Utility.generate128BitUUID = generate128BitUUID;
        function randomAlphaNumeric(length) {
            for (var nonce = new Array(length), i = 0; i < length; i++) {
                var r = Math.floor(Math.random() * 62);
                nonce[i] = r < 10 ? r.toString() : r < 36 ? String.fromCharCode(r - 10 + "a".charCodeAt(0)) : String.fromCharCode(r - 36 + "A".charCodeAt(0))
            }
            return nonce.join("")
        }
        Utility.randomAlphaNumeric = randomAlphaNumeric;
        function fixedEncodeURIComponent(str) {
            return encodeURIComponent(str).replace(/!|'|\(|\)|\*/g, function(char) {
                    switch (char) {
                        case"!":
                            return "%21";
                        case"'":
                            return "%27";
                        case"(":
                            return "%28";
                        case")":
                            return "%29";
                        case"*":
                            return "%2A"
                    }
                    return char
                })
        }
        Utility.fixedEncodeURIComponent = fixedEncodeURIComponent;
        function jsonClone(json) {
            return JSON.parse(JSON.stringify(json))
        }
        Utility.jsonClone = jsonClone;
        function getNextId(currentCounter, valuesById) {
            var id,
                newCounter = currentCounter;
            do
                id = newCounter,
                newCounter === AppMagic.Constants.MaxInteger ? newCounter = 0 : newCounter++;
            while (typeof valuesById[id] != "undefined");
            return {
                    id: id, newCounter: newCounter
                }
        }
        Utility.getNextId = getNextId;
        Utility.DefaultCharSetForGenerateRandomString = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLOMNOPQRSTUVWXYZ0123456789";
        function generateRandomString(length, chars) {
            chars || (chars = Utility.DefaultCharSetForGenerateRandomString);
            for (var result = new Array(length), i = 0; i < length; i++)
                result[i] = chars[Math.floor(Math.random() * chars.length)];
            return result.join("")
        }
        Utility.generateRandomString = generateRandomString;
        function isBase64BinaryString(value) {
            var base64Regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/;
            return typeof value == "string" && base64Regex.test(value)
        }
        Utility.isBase64BinaryString = isBase64BinaryString;
        function createCanceledError() {
            return new Error("Canceled")
        }
        Utility.createCanceledError = createCanceledError
    })(Utility = AppMagic.Utility || (AppMagic.Utility = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Utility;
    (function(Utility) {
        var XPathTokenType;
        (function(XPathTokenType) {
            XPathTokenType[XPathTokenType.Element = 0] = "Element";
            XPathTokenType[XPathTokenType.Text = 1] = "Text"
        })(XPathTokenType || (XPathTokenType = {}));
        var XPathToken = function() {
                function XPathToken(rawToken) {
                    this.index = this._parseIndex(rawToken);
                    this.tagName = this._parseTagName(rawToken);
                    this.tokenType = this._parseTokenType(rawToken)
                }
                return XPathToken.prototype.nodeTest = function(node) {
                        switch (this.tokenType) {
                            case 0:
                                return node.nodeType === Node.ELEMENT_NODE && node.nodeName === this.tagName;
                                break;
                            case 1:
                                return node.nodeType === Node.TEXT_NODE;
                                break;
                            default:
                                return !1;
                                break
                        }
                    }, XPathToken.prototype._parseTagName = function(rawToken) {
                        return rawToken.match(XPathToken.RegEx.TagName)[1]
                    }, XPathToken.prototype._parseIndex = function(rawToken) {
                            if (XPathToken.RegEx.Index.test(rawToken)) {
                                var parsedIndex = parseInt(rawToken.match(XPathToken.RegEx.Index)[1], 10) - 1;
                                return parsedIndex
                            }
                            return null
                        }, XPathToken.prototype._parseTokenType = function(rawToken) {
                            return rawToken.match(XPathToken.RegEx.TagName)[1] === XPathToken.TextNodeTagName ? 1 : 0
                        }, XPathToken.RegEx = {
                            TagName: /(\w[\w\d.-]*)/, Index: /\[([1-9]\d*)\]/
                        }, XPathToken.TextNodeTagName = "text", XPathToken
            }(),
            XmlSelection = function() {
                function XmlSelection(){}
                return XmlSelection.selectNodes = function(xmlDoc, xPath) {
                        return XmlSelection._selectNodes(xmlDoc, XmlSelection._tokenizeXPath(xPath))
                    }, XmlSelection._selectNodes = function(contextNode, tokens) {
                        if (tokens.length === 0)
                            return [contextNode];
                        for (var matches = [], currentToken = tokens.shift(), i = 0; i < contextNode.childNodes.length; i++) {
                            var childNode = contextNode.childNodes[i];
                            currentToken.nodeTest(childNode) && matches.push(childNode)
                        }
                        var result;
                        return result = currentToken.index !== null ? currentToken.index < matches.length ? XmlSelection._selectNodes(matches[currentToken.index], tokens) : [] : matches.map(function(node) {
                                return XmlSelection._selectNodes(node, tokens)
                            }).reduce(function(a, b) {
                                return a.concat(b)
                            }, []), tokens.unshift(currentToken), result
                    }, XmlSelection._tokenizeXPath = function(xPath) {
                            return xPath.split(XmlSelection.XPathSeperator).filter(function(rawToken) {
                                    return rawToken !== "" && rawToken !== "."
                                }).map(function(rawToken) {
                                    return new XPathToken(rawToken)
                                })
                        }, XmlSelection.XPathSeperator = "/", XmlSelection
            }();
        Utility.XmlSelection = XmlSelection
    })(Utility = AppMagic.Utility || (AppMagic.Utility = {}))
})(AppMagic || (AppMagic = {}));