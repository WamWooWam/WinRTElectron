/* Copyright (C) Microsoft Corporation. All rights reserved. */
/*!
  Copyright (C) Microsoft. All rights reserved.
  This library is supported for use in Windows Store apps only.
*/
(function(WinJS) {
    "use strict";
    WinJS.Namespace.define("MicrosoftNSJS.Advertising", {
        AdGlobalEventManager: WinJS.Class.define(function() {
            if (!this._isNullOrUndefined(window)) {
                if (this._isNullOrUndefined(window._msAdsGlobalEventManager) || window._msAdsGlobalEventManager.isInitialized !== true) {
                    if (!this._isNullOrUndefined(window._msAdsGlobalEventManager) && window._msAdsGlobalEventManager.OBJECT_NAME !== MicrosoftNSJS.Advertising.AdGlobalEventManager.OBJECT_NAME)
                        this._logError("window._msAdsGlobalEventManager already exists but is not of correct object type [{0}]. Overwriting.", MicrosoftNSJS.Advertising.AdGlobalEventManager.OBJECT_NAME);
                    this._isInitialized = true;
                    window._msAdsGlobalEventManager = this
                }
                return window._msAdsGlobalEventManager
            }
        }, {
            isInitialized: {get: function() {
                    return this._isInitialized
                }}, _eventListeners: null, _isInitialized: false, addEventListener: function(eventType, listener) {
                    if (this._isNullOrUndefined(eventType) || this._isNullOrUndefined(listener)) {
                        this._logError("Could not add listener, eventType or listener null or undefined");
                        return
                    }
                    try {
                        this._initializeEventListenersContainer(eventType);
                        this._eventListeners[eventType].push(listener);
                        return listener
                    }
                    catch(err) {
                        this._logError("Could not add listener type '" + eventType + "', exception was thrown [{0}]", err);
                        return null
                    }
                }, removeEventListener: function(eventType, listener) {
                    if (this._isNullOrUndefined(eventType) || this._isNullOrUndefined(listener)) {
                        this._logError("Could not remove listener, eventType or listener null or undefined.");
                        return
                    }
                    if (!this._eventArrayExists(eventType)) {
                        this._logError("Could not remove listener, no listener found for eventType: " + eventType);
                        return null
                    }
                    else
                        try {
                            var listeners = this._eventListeners[eventType];
                            for (var i = 0; i < listeners.length; i++)
                                if (listeners[i] === listener) {
                                    var l = listeners.splice(i, 1);
                                    return l[0]
                                }
                        }
                        catch(err) {
                            this._logError("Could not remove listener, exception was thrown [{0}]", err);
                            return null
                        }
                }, broadcastEvent: function(eventType, args) {
                    if (this._isNullOrUndefined(eventType)) {
                        this._logError("Could not broadcast event, eventType null or undefined");
                        return
                    }
                    if (!this._eventArrayExists(eventType))
                        return;
                    else {
                        var listeners = this._eventListeners[eventType];
                        for (var i = 0; i < listeners.length; i++)
                            if (!this._isNullOrUndefined(listeners[i]))
                                listeners[i](args)
                    }
                }, dispose: function(force) {
                    try {
                        if (force === true) {
                            this._dispose();
                            return
                        }
                        var eventsLeft = false;
                        for (var i in MicrosoftNSJS.Advertising.AdGlobalEventManager.EVENT_TYPE)
                            if (this._eventArrayExists(MicrosoftNSJS.Advertising.AdGlobalEventManager.EVENT_TYPE[i]) && this._eventListeners[MicrosoftNSJS.Advertising.AdGlobalEventManager.EVENT_TYPE[i]].length > 0) {
                                eventsLeft = true;
                                break
                            }
                        if (eventsLeft === false)
                            this._dispose();
                        else
                            this._logError("Could not dispose, events collection is not empty.")
                    }
                    catch(err) {
                        try {
                            this._logError("Could not dispose, exception thrown [{0}].", err)
                        }
                        catch(err) {}
                    }
                }, _dispose: function() {
                    this._eventListeners = null;
                    this._isInitialized = false;
                    window._msAdsGlobalEventManager = null
                }, _initializeEventListenersContainer: function(eventType) {
                    if (this._eventListeners === null) {
                        this._eventListeners = {};
                        this._eventListeners[eventType] = []
                    }
                    else if (this._isNullOrUndefined(this._eventListeners[eventType]))
                        this._eventListeners[eventType] = []
                }, _eventArrayExists: function(eventType) {
                    if (this._eventListeners === null || this._eventListeners[eventType] === null || typeof(this._eventListeners[eventType]) === "undefined")
                        return false;
                    return true
                }, _isNullOrUndefined: function(object) {
                    if (typeof(object) === "undefined" || object === null)
                        return true;
                    return false
                }, _logError: function(message, err){}
        }, {
            OBJECT_NAME: "MicrosoftNSJS.Advertising.AdGlobalEventManager", EVENT_TYPE: {
                    AD_ENGAGED: "msAdEngaged", AD_DISENGAGED: "msAdDisengaged"
                }
        }), AdControl: WinJS.Class.define(function(element, options) {
                try {
                    element = element || document.createElement("div");
                    element.winControl = this;
                    this._adsGlobalEventManager = new MicrosoftNSJS.Advertising.AdGlobalEventManager;
                    try {
                        this._rendererOptions = new MicrosoftAdvertising.Shared.WinRT.RendererOptions
                    }
                    catch(err) {}
                    this._globalAdEngagedHandler = null;
                    this._globalAdDisengagedHandler = null;
                    this._ad = null;
                    this._adIFrame = null;
                    this._expandedIFrame = null;
                    this._applicationId = "";
                    this._adUnitId = "";
                    this._currentAdHeight = null;
                    this._currentAdWidth = null;
                    this._defaultStateSize = {};
                    this._isDisposed = false;
                    this._errorReportCount = 0;
                    this._expandProperties = null;
                    this._isAutoRefreshEnabled = true;
                    this._isExpanded = false;
                    this._isUserEngaged = false;
                    this._isSuspended = false;
                    this._ormmaState = "default";
                    this._placement = null;
                    this._previousOrmmaState = "";
                    this._refreshPeriodSeconds = 60;
                    this._refreshTimerId = null;
                    this._requestInProgress = false;
                    this._timeAtLastRotation = null;
                    this._currentCloseBandHeight = this._RESERVED_CLOSE_BAND_HEIGHT;
                    this._accelerometer = {
                        device: null, tiltHandlers: [], shakeHandlers: []
                    };
                    this._lastCoords = {
                        x: 0, y: 0, z: 0
                    };
                    this._viewableChangedTimer = null;
                    this._isViewable = false;
                    this._viewableCheckPeriodMs = 500;
                    this._orientationChangedHandler = null;
                    this._fadeOptions = {
                        timer: {linear: " cubic-bezier(0,0,1,1)"}, fadeInTimeS: 0.7, fadeOutTimeS: 0.7
                    };
                    this._sensorOptions = {accelerometer: {reportIntervalMS: 50}};
                    this._adInstanceState = null;
                    this._onAdRefreshedInternal = null;
                    this._onAdRefreshed = null;
                    this._onAdRendered = null;
                    this._onBeforeAdRender = null;
                    this._onErrorOccurred = null;
                    this._onEngagedChanged = null;
                    this._onPointerDown = null;
                    this._onPointerUp = null;
                    element.style.breakInside = "avoid";
                    element.style.overflow = "hidden";
                    WinJS.UI.setOptions(this, options);
                    this._setElement(element);
                    this._setupEvents();
                    var self = this;
                    setImmediate(function() {
                        if (!self._requestInProgress && self._ad === null)
                            self._refreshInternal()
                    })
                }
                catch(err) {
                    return
                }
            }, {
                _MSG_TYPE_ADPARAMS: "adParams", _MSG_TYPE_PRMPARAMS: "prmParams", _MSG_TYPE_APPPARAMS: "appParams", _MSG_TYPE_INIT: "init", _MSG_TYPE_ORMMA_START: "ormmaStart", _MSG_TYPE_SCRIPT: "script", _MSG_TYPE_SETMAXSIZE: "setMaxSize", _MSG_TYPE_SETSCREENSIZE: "setScreenSize", _MSG_TYPE_SETSIZE: "setSize", _MSG_TYPE_SETSTATE: "setState", _MSG_TYPE_SETID: "setId", _MSG_TYPE_FIRESHAKE: "fireShake", _MSG_TYPE_UPDATETILTCOORDS: "updateTiltCoords", _MSG_TYPE_UPDATEORIENTATION: "updateOrienation", _MSG_TYPE_SETNETWORK: "setNetwork", _MSG_TYPE_VIEWABLECHANGE: "viewableChange", _MSG_TYPE_SETLOCALE: "setLocale", _MSG_TYPE_SETSDKINFO: "setSdkInfo", _MSG_TYPE_SETCAPABILITY: "setCapability", _MSG_TYPE_SETADINSTANCESTATE: "setAdInstanceState", _MSG_TYPE_RENDERED: "rendered", _MSG_TYPE_OPEN: "web", _MSG_TYPE_EXPAND: "expand", _MSG_TYPE_CLOSE: "close", _MSG_TYPE_RESIZE: "resize", _MSG_TYPE_HIDE: "hide", _MSG_TYPE_SHOW: "show", _MSG_TYPE_SETEXPANDPROPERTIES: "setexpandproperties", _MSG_TYPE_SETUSERENGAGED: "setuserengaged", _MSG_TYPE_TILT: "tilt", _MSG_TYPE_SHAKE: "shake", _MSG_TYPE_LISTENER: "listener", _MSG_TYPE_VALUESTART: "start", _MSG_TYPE_VALUESTOP: "stop", _MSG_TYPE_GETTILT: "gettilt", _MSG_TYPE_GETORIENTATION: "getorientation", _MSG_TYPE_REFRESH: "refresh", _MSG_TYPE_REQUEST: "request", _MSG_TYPE_STOREADINSTANCESTATE: "storeadinstancestate", _MSG_TYPE_ONPOINTERDOWN: "MSPointerDown", _MSG_TYPE_ONPOINTERUP: "MSPointerUp", _MSG_TYPE_USECUSTOMCLOSE: "usecustomclose", _MSG_TYPE_ERROR: "error", _ORMMA_STATE_DEFAULT: "default", _ORMMA_STATE_EXPANDED: "expanded", _ORMMA_STATE_HIDDEN: "hidden", _ORMMA_STATE_RESIZED: "resized", _ORMMA_STATE_SUSPENDED: "suspended", _ORMMA_NETWORK_OFFLINE: "offline", _ORMMA_NETWORK_WIFI: "wifi", _ORMMA_NETWORK_CELL: "cell", _ORMMA_NETWORK_UNKNOWN: "unknown", _ORMMA_RESPONSE_IGNORE: "ignore", _ORMMA_RESPONSE_PROXY: "proxy", _HTTP_HEADER_CACHE_CONTROL: "cache-control", _HTTP_HEADER_VALUE_CACHE_CONTROL_NO_CACHE: "no-cache", _RESERVED_CLOSE_BAND_HEIGHT: 2 * 50, _MIN_AD_REFRESH_INTERVAL_IN_MILLISECONDS_METERED: 60000, _MIN_AD_REFRESH_INTERVAL_IN_MILLISECONDS_UNMETERED: 30000, _MAX_ERROR_REPORT: 20, _MAX_ERROR_REPORT_MESSAGE: "error reporting maximum reached, no more errors will be reported", _MAX_URL_LENGTH: 2048, _ERROR_ENUM: {
                        Unknown: "Unknown", NoAdAvailable: "NoAdAvailable", NetworkConnectionFailure: "NetworkConnectionFailure", ClientConfiguration: "ClientConfiguration", ServerSideError: "ServerSideError", InvalidServerResponse: "InvalidServerResponse", Other: "Other"
                    }, onAdRefreshed: {
                        get: function() {
                            return this._onAdRefreshed
                        }, set: function(value) {
                                if (typeof(value) === "function" || value === null || typeof(value) === "undefined")
                                    this._onAdRefreshed = value
                            }
                    }, onAdRendered: {
                        get: function() {
                            return this._onAdRendered
                        }, set: function(value) {
                                if (typeof(value) === "function" || value === null || typeof(value) === "undefined")
                                    this._onAdRendered = value
                            }
                    }, onBeforeAdRender: {
                        get: function() {
                            return this._onBeforeAdRender
                        }, set: function(value) {
                                if (typeof(value) === "function" || value === null || typeof(value) === "undefined")
                                    this._onBeforeAdRender = value
                            }
                    }, onErrorOccurred: {
                        get: function() {
                            return this._onErrorOccurred
                        }, set: function(value) {
                                if (typeof(value) === "function" || value === null || typeof(value) === "undefined")
                                    this._onErrorOccurred = value
                            }
                    }, onEngagedChanged: {
                        get: function() {
                            return this._onEngagedChanged
                        }, set: function(value) {
                                if (typeof(value) === "function" || value === null || typeof(value) === "undefined")
                                    this._onEngagedChanged = value
                            }
                    }, onPointerDown: {
                        get: function() {
                            return this._onPointerDown
                        }, set: function(value) {
                                if (typeof(value) === "function" || value === null || typeof(value) === "undefined")
                                    this._onPointerDown = value
                            }
                    }, onPointerUp: {
                        get: function() {
                            return this._onPointerUp
                        }, set: function(value) {
                                if (typeof(value) === "function" || value === null || typeof(value) === "undefined")
                                    this._onPointerUp = value
                            }
                    }, applicationId: {
                        get: function() {
                            return this._applicationId
                        }, set: function(value) {
                                if (this._applicationId !== value)
                                    this._applicationId = value
                            }
                    }, adUnitId: {
                        get: function() {
                            return this._adUnitId
                        }, set: function(value) {
                                if (this._adUnitId !== value)
                                    this._adUnitId = value
                            }
                    }, isAutoRefreshEnabled: {
                        get: function() {
                            return this._isAutoRefreshEnabled
                        }, set: function(value) {
                                if (this._isAutoRefreshEnabled !== value) {
                                    this._isAutoRefreshEnabled = value;
                                    if (this._isAutoRefreshEnabled)
                                        this._scheduleRefresh();
                                    else
                                        this._unscheduleRefresh()
                                }
                            }
                    }, isEngaged: {get: function() {
                            return this._isExpanded || this._isUserEngaged
                        }}, latitude: {
                        get: function() {
                            return this._latitude
                        }, set: function(value) {
                                if (typeof(value) === "string")
                                    this._latitude = parseFloat(value);
                                else
                                    this._latitude = value
                            }
                    }, longitude: {
                        get: function() {
                            return this._longitude
                        }, set: function(value) {
                                if (typeof(value) === "string")
                                    this._longitude = parseFloat(value);
                                else
                                    this._longitude = value
                            }
                    }, element: {get: function() {
                            return this._domElement
                        }}, addAdTag: function(tagName, tagValue) {
                        if (typeof(tagName) === "string" && typeof(tagValue) === "string")
                            try {
                                this._rendererOptions.addRendererOption(tagName, tagValue)
                            }
                            catch(e) {
                                this._fireErrorOccurred(e.message, this._ERROR_ENUM.Other)
                            }
                        else
                            this._fireErrorOccurred("Error: Could not add renderer option or value as they were not strings.", this._ERROR_ENUM.Other)
                    }, refresh: function() {
                        if (this._isAutoRefreshEnabled) {
                            this._fireErrorOccurred("refresh() may not be called when auto-refresh is enabled (isAutoRefreshEnabled=true)", this._ERROR_ENUM.Other);
                            return
                        }
                        if (!this._checkIfRefreshIntervalMetAndRaiseError())
                            return;
                        this._refreshInternal()
                    }, _checkIfRefreshIntervalMetAndRaiseError: function() {
                        var isIntervalMet = false;
                        var refreshInterval = this._MIN_AD_REFRESH_INTERVAL_IN_MILLISECONDS_UNMETERED;
                        if (this._timeAtLastRotation !== null)
                            try {
                                var connectionProfile = Windows.Networking.Connectivity.NetworkInformation.getInternetConnectionProfile();
                                if (connectionProfile !== null) {
                                    var currentConnectionCost = connectionProfile.getConnectionCost();
                                    var isMeteredConnection = currentConnectionCost.NetworkCostType === Windows.Networking.Connectivity.NetworkCostType.fixed || currentConnectionCost.NetworkCostType === Windows.Networking.Connectivity.NetworkCostType.variable;
                                    refreshInterval = isMeteredConnection ? this._MIN_AD_REFRESH_INTERVAL_IN_MILLISECONDS_METERED : this._MIN_AD_REFRESH_INTERVAL_IN_MILLISECONDS_UNMETERED
                                }
                            }
                            catch(err) {}
                        else {
                            this._timeAtLastRotation = new Date;
                            return true
                        }
                        isIntervalMet = new Date - this._timeAtLastRotation > refreshInterval;
                        if (!isIntervalMet)
                            this._fireErrorOccurred("refresh() may not be called more than once every " + refreshInterval / 1000 + " seconds.", this._ERROR_ENUM.Other);
                        return isIntervalMet
                    }, suspend: function() {
                        if (this._isExpanded)
                            this._closePopup();
                        this._unscheduleRefresh();
                        if (this._ormmaState !== this._ORMMA_STATE_SUSPENDED)
                            this._setState(this._ORMMA_STATE_SUSPENDED);
                        this._isSuspended = true
                    }, resume: function() {
                        if (this._isAutoRefreshEnabled)
                            this._scheduleRefresh();
                        if (this._ormmaState === this._ORMMA_STATE_SUSPENDED)
                            if (typeof(this._previousOrmmaState) === "undefined" || this._previousOrmmaState === null)
                                this._setState(this._ORMMA_STATE_DEFAULT);
                            else
                                this._setState(this._previousOrmmaState);
                        this._isSuspended = false
                    }, _log: function(msg){}, _getSdkInfo: function() {
                        try {
                            var info = MicrosoftAdvertising.Shared.WinRT.SdkInfoProvider.getSdkInfo();
                            return {
                                    sdkVersion: info.sdkVersion, client: info.client, runtimeType: info.runtimeType
                                }
                        }
                        catch(err) {
                            return {}
                        }
                    }, _fadeIn: function(elem, callback) {
                        try {
                            if (typeof(elem) === "object" && elem !== null) {
                                elem.style.visibility = "inherit";
                                elem.style.transition = "opacity " + this._fadeOptions.fadeInTimeS + "s" + this._fadeOptions.timer.linear;
                                elem.style.opacity = 1;
                                if (typeof(callback) === "function")
                                    window.setTimeout(function() {
                                        callback(true)
                                    }, this._fadeOptions.fadeInTimeS * 1000)
                            }
                            else if (typeof(callback) === "function")
                                callback(false)
                        }
                        catch(err) {}
                    }, _fadeOut: function(elem, callback) {
                        try {
                            if (typeof(elem) === "object" && elem !== null) {
                                elem.style.transition = "opacity " + this._fadeOptions.fadeInTimeS + "s" + this._fadeOptions.timer.linear;
                                elem.style.opacity = 0;
                                if (typeof(callback) === "function")
                                    window.setTimeout(function() {
                                        callback(true)
                                    }, this._fadeOptions.fadeOutTimeS * 1000)
                            }
                            else if (typeof(callback) === "function")
                                callback(false)
                        }
                        catch(err) {}
                    }, _refreshInternal: function() {
                        if (this._requestInProgress) {
                            this._fireErrorOccurred("refresh triggered but request is already in progress", this._ERROR_ENUM.Other);
                            return
                        }
                        this._requestInProgress = true;
                        try {
                            if (Windows.ApplicationModel.DesignMode.designModeEnabled) {
                                this._requestInProgress = false;
                                return
                            }
                        }
                        catch(err) {}
                        if (window !== top) {
                            this._requestInProgress = false;
                            this._fireErrorOccurred("ad control may not be loaded in an iframe", this._ERROR_ENUM.Other);
                            return
                        }
                        if (this._domElement === null || this._domElement.offsetWidth === 0 || this._domElement.offsetHeight === 0) {
                            this._requestInProgress = false;
                            return
                        }
                        if (this._isExpanded) {
                            this._requestInProgress = false;
                            return
                        }
                        if (this._isSuspended) {
                            this._requestInProgress = false;
                            this._fireErrorOccurred("cannot refresh when suspended", this._ERROR_ENUM.Other);
                            return
                        }
                        if (this._isUserEngaged) {
                            this._requestInProgress = false;
                            if (this._isAutoRefreshEnabled)
                                this._scheduleRefresh();
                            return
                        }
                        if (typeof(window._msAdEngaged) !== "undefined" && window._msAdEngaged) {
                            this._requestInProgress = false;
                            if (this._isAutoRefreshEnabled)
                                this._scheduleRefresh();
                            return
                        }
                        if (!this._validateParameters()) {
                            this._requestInProgress = false;
                            if (this._isAutoRefreshEnabled)
                                this._scheduleRefresh();
                            return
                        }
                        if (this._adIFrame !== null && (document.hidden || !this._isOnScreen())) {
                            this._requestInProgress = false;
                            this._fireErrorOccurred("refresh not performed because ad is not on screen", this._ERROR_ENUM.Other);
                            if (this._isAutoRefreshEnabled)
                                this._scheduleRefresh();
                            return
                        }
                        if (this._placement === null)
                            try {
                                this._placement = new MicrosoftAdvertising.Shared.WinRT.AdPlacement
                            }
                            catch(err) {
                                this._requestInProgress = false;
                                this._fireErrorOccurred("could not initialize AdPlacement", this._ERROR_ENUM.Other);
                                return
                            }
                        this._placement.applicationId = this._applicationId;
                        this._placement.adUnitId = this._adUnitId;
                        this._placement.latitude = this.latitude;
                        this._placement.longitude = this.longitude;
                        this._placement.width = this._domElement.offsetWidth;
                        this._placement.height = this._domElement.offsetHeight;
                        if (this._rendererOptions !== null && typeof(this._rendererOptions) !== "undefined")
                            this._placement.adTags = this._rendererOptions.getOptions();
                        try {
                            var self = this;
                            this._placement.getAdAsync().done(function(ad) {
                                if (ad !== null)
                                    self._adRefreshedCallback(ad);
                                else if (!self._isDisposed && self._placement !== null && typeof(self._placement) !== "undefined") {
                                    var error = self._placement.lastError;
                                    self._errorOccurredCallback(error)
                                }
                            }, function(evt) {
                                if (!self._isDisposed && self._placement !== null && typeof(self._placement) !== "undefined") {
                                    var error = self._placement.lastError;
                                    self._errorOccurredCallback(error)
                                }
                            });
                            this._timeAtLastRotation = new Date
                        }
                        catch(err) {
                            self._errorOccurredCallback({
                                errorMessage: err.message, errorCode: this._ERROR_ENUM.Other
                            })
                        }
                    }, removeAdTag: function(tagName) {
                        if (typeof(tagName) === "string")
                            try {
                                this._rendererOptions.removeRendererOption(tagName)
                            }
                            catch(e) {
                                this._fireErrorOccurred("Error: Could not remove renderer option or value.", this._ERROR_ENUM.Other)
                            }
                    }, _networkInfo: function() {
                        try {
                            return Windows.Networking.Connectivity.NetworkInformation
                        }
                        catch(err) {}
                    }(), _networkChangedEventHandler: function(){}, _isOnScreen: function() {
                        if (this._domElement === null)
                            return false;
                        var fractionAllowedOffScreen = 0.4;
                        var adRect = {};
                        try
                        {
                            adRect = this._domElement.getBoundingClientRect()
                        }
                        catch(e) {
                            return false
                        }
                        var xAllowedOff = this._domElement.offsetWidth * fractionAllowedOffScreen;
                        var yAllowedOff = this._domElement.offsetHeight * fractionAllowedOffScreen;
                        return (adRect.left >= -xAllowedOff) && (adRect.top >= -yAllowedOff) && (adRect.right < document.documentElement.offsetWidth + xAllowedOff) && (adRect.bottom < document.documentElement.offsetHeight + yAllowedOff)
                    }, _errorOccurredCallback: function(evt) {
                        if (this._isDisposed)
                            return;
                        if (typeof(evt) !== "object" || evt === null)
                            this._fireErrorOccurred("Other", this._ERROR_ENUM.Other);
                        else
                            this._fireErrorOccurred(evt.errorMessage, evt.errorCode);
                        this._currentAdHeight = null;
                        this._currentAdWidth = null;
                        this._requestInProgress = false;
                        if (this._isAutoRefreshEnabled)
                            this._scheduleRefresh()
                    }, _adRefreshedCallback: function(ad) {
                        if (this._isDisposed)
                            return;
                        if (ad !== null)
                            this._onAdReceived(ad);
                        this._requestInProgress = false;
                        if (this._isAutoRefreshEnabled)
                            this._scheduleRefresh()
                    }, _onAdReceived: function(ad) {
                        if (typeof(ad) !== "undefined" && ad !== null) {
                            this._adInstanceState = null;
                            this._disposeAccelerometer();
                            this._stopOrientationMonitoring();
                            this._stopViewableChangeMonitoring();
                            this._setUseCustomClose(false);
                            this._ad = ad;
                            var iFrameToRemove = null;
                            this._currentAdHeight = this._placement.height;
                            this._currentAdWidth = this._placement.width;
                            if (this._adIFrame !== null)
                                iFrameToRemove = this._adIFrame;
                            try {
                                var rendererUrl = this._ad.rendererUrl;
                                var adString = this._ad.adParameters;
                                var prmString = this._ad.prmParameters
                            }
                            catch(err) {
                                if (err !== null && typeof(err) === "object")
                                    this._fireErrorOccurred(err.message, this._ERROR_ENUM.Other);
                                return
                            }
                            var self = this;
                            var createFrameAndLoadAd = function() {
                                    var newFrame = self._createMainFrame();
                                    if (newFrame === null || typeof(newFrame) !== "object") {
                                        self._fireErrorOccurred("Error: Could not create iFrame", self._ERROR_ENUM.Other);
                                        return
                                    }
                                    self._onAdRefreshedInternal = function() {
                                        if (typeof(iFrameToRemove) === "object" && iFrameToRemove !== null)
                                            self._fadeOut(iFrameToRemove, function() {
                                                self._removeIFrame(iFrameToRemove);
                                                self._fadeIn(newFrame, null)
                                            });
                                        else
                                            self._showIFrame(newFrame);
                                        self._adIFrame = newFrame;
                                        self._onAdRefreshedInternal = null
                                    };
                                    self._loadAdInFrame(newFrame, rendererUrl, adString, prmString)
                                };
                            var promise = this._fireBeforeAdRender();
                            if (typeof(promise) === "object" && promise !== null && typeof(promise.then) === "function")
                                promise.then(createFrameAndLoadAd);
                            else
                                createFrameAndLoadAd()
                        }
                    }, _showIFrame: function(iFrame) {
                        if (typeof(iFrame) === "object" && iFrame !== null) {
                            iFrame.style.opacity = 1;
                            iFrame.style.visibility = "inherit"
                        }
                    }, _removeIFrame: function(iFrame) {
                        if (iFrame === null || typeof(iFrame) === "undefined")
                            iFrame = this._adIFrame;
                        this._removeFromParent(iFrame)
                    }, _removeFromParent: function(child) {
                        try {
                            if (child !== null && typeof(child) === "object") {
                                var parentElem = child.parentNode;
                                if (parentElem !== null && typeof(parentElem) === "object")
                                    parentElem.removeChild(child)
                            }
                        }
                        catch(err) {}
                    }, _createMainFrame: function() {
                        return this._createIFrame(this._domElement.id + "_webFrame_" + (+new Date), this._domElement.offsetWidth, this._domElement.offsetHeight, this._domElement, "default")
                    }, _initializeOrmma: function(iframe, width, height, ormmaState) {
                        var adSize = {
                                height: height, width: width
                            };
                        var locale = "undefined";
                        try {
                            locale = Windows.Globalization.ApplicationLanguages.languages[0]
                        }
                        catch(err) {
                            this._log("locale init error: " + (typeof(err) === "object" ? err.message : err))
                        }
                        if (ormmaState === this._ORMMA_STATE_DEFAULT)
                            this._defaultStateSize = adSize;
                        this._sendMessageToAdContainer(iframe, this._MSG_TYPE_SETSIZE + ":" + JSON.stringify(adSize));
                        this._sendMessageToAdContainer(iframe, this._MSG_TYPE_SETMAXSIZE + ":" + JSON.stringify(adSize));
                        this._setOrmmaScreenSize(iframe);
                        this._sendMessageToAdContainer(iframe, this._MSG_TYPE_SETSTATE + ":" + ormmaState);
                        this._sendMessageToAdContainer(iframe, this._MSG_TYPE_SETLOCALE + ":" + locale);
                        this._sendMessageToAdContainer(iframe, this._MSG_TYPE_SETNETWORK + ":" + this._getNetworkState());
                        this._sendMessageToAdContainer(iframe, this._MSG_TYPE_SETSDKINFO + ":" + JSON.stringify(this._getSdkInfo()));
                        var isAccelerometerPresent = false;
                        try {
                            isAccelerometerPresent = Windows.Devices.Sensors.Accelerometer.getDefault() !== null
                        }
                        catch(err) {}
                        this._sendMessageToAdContainer(iframe, this._MSG_TYPE_SETCAPABILITY + ":" + JSON.stringify({
                            capability: "tilt", value: isAccelerometerPresent
                        }));
                        this._sendMessageToAdContainer(iframe, this._MSG_TYPE_SETCAPABILITY + ":" + JSON.stringify({
                            capability: "shake", value: isAccelerometerPresent
                        }));
                        this._sendMessageToAdContainer(iframe, this._MSG_TYPE_ORMMA_START)
                    }, _createIFrame: function(frameId, width, height, parentElem, ormmaState) {
                        try {
                            var iframe = document.createElement("iframe");
                            iframe.src = "ms-appx-web:///MSAdvertisingJS/ads/bootstrap.html?bubblePointerEvents=1";
                            iframe.width = width + "px";
                            iframe.height = height + "px";
                            iframe.frameBorder = "0px";
                            iframe.marginwidth = "0px";
                            iframe.marginheight = "0px";
                            iframe.id = frameId;
                            iframe.scrolling = "no";
                            iframe.style.visibility = "hidden";
                            iframe.style.backgroundColor = "transparent";
                            iframe.style.opacity = 0;
                            parentElem.appendChild(iframe);
                            this._sendMessageToAdContainer(iframe, this._MSG_TYPE_SETID + ":" + this._domElement.id);
                            this._initializeOrmma(iframe, width, height, ormmaState);
                            return iframe
                        }
                        catch(err) {
                            return
                        }
                    }, _setElement: function(element) {
                        if (element.id === null || element.id === "")
                            element.id = this._generateUniqueId();
                        this._domElement = element
                    }, _generateUniqueId: function() {
                        var generatedId = null;
                        var existingElem = null;
                        do {
                            generatedId = "ad" + Math.floor(Math.random() * 10000);
                            existingElem = document.getElementById(generatedId)
                        } while (existingElem !== null);
                        return generatedId
                    }, _loadAdInFrame: function(iframe, rendererUrl, adString, prmString) {
                        if (this._renderContent === null || typeof(this._renderContent) === "undefined") {
                            if (this._getNetworkState() === this._ORMMA_NETWORK_OFFLINE) {
                                this._removeIFrame(iframe);
                                this._fireErrorOccurred("no network is available", this._ERROR_ENUM.NetworkConnectionFailure);
                                return
                            }
                            var xhr = new XMLHttpRequest;
                            var self = this;
                            xhr.onreadystatechange = function() {
                                if (xhr.readyState === XMLHttpRequest.DONE)
                                    if (xhr.status === 200) {
                                        self._rendererContent = xhr.responseText;
                                        self._loadAdInFrameB(iframe, self._rendererContent, adString, prmString)
                                    }
                                    else {
                                        self._removeIFrame(iframe);
                                        self._fireErrorOccurred("error loading ad renderer: code " + xhr.status, self._ERROR_ENUM.NetworkConnectionFailure)
                                    }
                            };
                            xhr.open("GET", rendererUrl, true);
                            xhr.timeout = 10000;
                            try {
                                xhr.send(null)
                            }
                            catch(e) {
                                this._removeIFrame(iframe);
                                this._fireErrorOccurred("http request error: " + e.message, this._ERROR_ENUM.NetworkConnectionFailure);
                                return
                            }
                        }
                        else
                            this._loadAdInFrameB(iframe, this._rendererContent, adString, prmString)
                    }, _loadAdInFrameB: function(iframe, rendererContent, adString, prmString) {
                        this._rendererParams = adString;
                        this._prmParams = prmString;
                        this._sendAdDataToAdContainer(iframe, rendererContent, adString, prmString);
                        this._fireAdRefreshed()
                    }, _sendMessageToAdContainer: function(iframe, msg) {
                        if (iframe !== null && iframe !== undefined) {
                            var target = iframe.contentWindow;
                            var origin = "ms-appx-web://" + document.location.host;
                            var self = this;
                            setImmediate(function() {
                                if (target && !self._isDisposed)
                                    try {
                                        target.postMessage(msg, origin)
                                    }
                                    catch(err) {
                                        if (err !== null && typeof(err) === "object")
                                            self._log("postMessage error" + (typeof(err) !== "undefined" ? ": " + err.message : ""))
                                    }
                            })
                        }
                    }, _sendMessageToAllAdContainers: function(msg) {
                        try {
                            this._sendMessageToAdContainer(this._adIFrame, msg);
                            this._sendMessageToAdContainer(this._expandedIFrame, msg)
                        }
                        catch(err) {}
                    }, _sendAdDataToAdContainer: function(iframe, renderer, ad, prm) {
                        try {
                            if (typeof(ad) === "string" && ad !== "")
                                this._sendMessageToAdContainer(iframe, this._MSG_TYPE_ADPARAMS + ":" + ad);
                            if (typeof(prm) === "string" && prm !== "")
                                this._sendMessageToAdContainer(iframe, this._MSG_TYPE_PRMPARAMS + ":" + prm);
                            try {
                                var appPrm = this._rendererOptions.getOptionsJson()
                            }
                            catch(e) {
                                this._log("error: could not get renderer options as json")
                            }
                            if (typeof(appPrm) === "string" && appPrm !== "")
                                this._sendMessageToAdContainer(iframe, this._MSG_TYPE_APPPARAMS + ":" + appPrm);
                            this._sendMessageToAdContainer(iframe, this._MSG_TYPE_SCRIPT + ":" + renderer);
                            this._sendMessageToAdContainer(iframe, this._MSG_TYPE_INIT)
                        }
                        catch(err) {}
                    }, _fireErrorOccurred: function(msg, errorCode) {
                        this._log(msg + " (" + errorCode + ")");
                        if (typeof(this._onErrorOccurred) === "function")
                            this._onErrorOccurred(this, {
                                errorMessage: msg, errorCode: errorCode
                            })
                    }, _firePointerDown: function(msg) {
                        if (typeof(this._onPointerDown) === "function")
                            this._onPointerDown(this, msg)
                    }, _firePointerUp: function() {
                        if (typeof(this._onPointerUp) === "function")
                            this._onPointerUp(this)
                    }, _fireEngagedChanged: function() {
                        if (typeof(this._onEngagedChanged) === "function")
                            this._onEngagedChanged(this)
                    }, _fireAdRendered: function() {
                        if (typeof(this._onAdRendered) === "function")
                            this._onAdRendered(this)
                    }, _fireAdRefreshed: function() {
                        if (typeof(this._onAdRefreshedInternal) === "function")
                            this._onAdRefreshedInternal();
                        if (typeof(this._onAdRefreshed) === "function")
                            this._onAdRefreshed(this)
                    }, _fireBeforeAdRender: function() {
                        if (typeof(this._onBeforeAdRender) === "function")
                            return this._onBeforeAdRender(this);
                        else
                            return null
                    }, _receiveMessage: function(msg) {
                        if (msg.origin !== "ms-appx-web://" + document.location.host)
                            return;
                        var msgStr = msg.data;
                        var colonIx = msgStr.indexOf(":");
                        if (colonIx < 0)
                            return;
                        var divId = msgStr.substr(0, colonIx);
                        if (divId === "null")
                            return;
                        msgStr = msgStr.substr(colonIx + 1);
                        var controlElem = document.getElementById(divId);
                        if (controlElem === null)
                            return;
                        var control = controlElem.winControl;
                        if (control === null || typeof(control) !== "object" || control._isDisposed)
                            return;
                        var msgType = null;
                        var msgParams = null;
                        colonIx = msgStr.indexOf(":");
                        if (colonIx < 0)
                            msgType = msgStr;
                        else {
                            msgType = msgStr.substr(0, colonIx);
                            msgParams = msgStr.substr(colonIx + 1)
                        }
                        if (msgType === control._MSG_TYPE_EXPAND)
                            try {
                                var props = JSON.parse(msgParams);
                                if (control._ormmaState === control._ORMMA_STATE_DEFAULT || control._ormmaState === control._ORMMA_STATE_RESIZED)
                                    control._expand(props.url);
                                else
                                    control._reportError("expand", "state is not default or resized, current state is:" + control._ormmaState)
                            }
                            catch(err) {
                                control._reportError(control._MSG_TYPE_EXPAND, "unable to parse expand properties as json")
                            }
                        else if (msgType === control._MSG_TYPE_CLOSE)
                            if (control._ormmaState === control._ORMMA_STATE_EXPANDED)
                                control._closePopup();
                            else if (control._ormmaState === control._ORMMA_STATE_DEFAULT)
                                control._resize(0, 0, control._ORMMA_STATE_HIDDEN);
                            else if (control._ormmaState === control._ORMMA_STATE_RESIZED)
                                control._resize(control._defaultStateSize.width, control._defaultStateSize.height, control._ORMMA_STATE_DEFAULT);
                            else
                                control._reportError("close", "state is not expanded, default or resized, current state is:" + control._ormmaState);
                        else if (msgType === control._MSG_TYPE_SETEXPANDPROPERTIES)
                            control._updateExpandProperties(msgParams);
                        else if (msgType === control._MSG_TYPE_SETUSERENGAGED)
                            control._processSetUserEngaged(msgParams);
                        else if (msgType === control._MSG_TYPE_RENDERED)
                            control._fireAdRendered();
                        else if (msgType === control._MSG_TYPE_TILT)
                            control._processTiltMessage(msgParams);
                        else if (msgType === control._MSG_TYPE_SHAKE)
                            control._processShakeMessage(msgParams);
                        else if (msgType === control._MSG_TYPE_GETORIENTATION)
                            control._processGetOrientationMessage(msgParams);
                        else if (msgType === control._MSG_TYPE_ERROR) {
                            control._removeIFrame();
                            control._fireErrorOccurred(msgParams, control._ERROR_ENUM.Other)
                        }
                        else if (msgType === control._MSG_TYPE_RESIZE)
                            if (control._ormmaState === control._ORMMA_STATE_DEFAULT) {
                                var resizeProps = JSON.parse(msgParams);
                                control._resize(resizeProps.width, resizeProps.height, control._ORMMA_STATE_RESIZED)
                            }
                            else
                                control._reportError("resize", "state is not default, current state is:" + control._ormmaState);
                        else if (msgType === control._MSG_TYPE_HIDE)
                            if (control._ormmaState === control._ORMMA_STATE_DEFAULT)
                                control._resize(0, 0, control._ORMMA_STATE_HIDDEN);
                            else
                                control._reportError("hide", "state is not default, current state is:" + control._ormmaState);
                        else if (msgType === control._MSG_TYPE_SHOW)
                            if (control._ormmaState === control._ORMMA_STATE_HIDDEN)
                                control._resize(control._defaultStateSize.width, control._defaultStateSize.height, control._ORMMA_STATE_DEFAULT);
                            else
                                control._reportError("show", "state is not hidden, current state is:" + control._ormmaState);
                        else if (msgType === control._MSG_TYPE_OPEN) {
                            var data = JSON.parse(msgParams);
                            var uri = control._getUri(data);
                            if (uri !== null)
                                try {
                                    Windows.System.Launcher.launchUriAsync(uri)
                                }
                                catch(err) {
                                    control._reportError("open", "unable to open URL")
                                }
                            else
                                control._reportError("open", "parameters are not valid")
                        }
                        else if (msgType === control._MSG_TYPE_REQUEST)
                            control._request(JSON.parse(msgParams));
                        else if (msgType === control._MSG_TYPE_VIEWABLECHANGE)
                            control._processViewableChangeMessage(msgParams);
                        else if (msgType === control._MSG_TYPE_STOREADINSTANCESTATE)
                            control._storeAdInstanceState(msgParams);
                        else if (msgType === control._MSG_TYPE_ONPOINTERDOWN)
                            control._firePointerDown(JSON.parse(msgParams));
                        else if (msgType === control._MSG_TYPE_ONPOINTERUP)
                            control._firePointerUp();
                        else if (msgType === control._MSG_TYPE_USECUSTOMCLOSE)
                            control._setUseCustomClose(JSON.parse(msgParams));
                        else
                            control._reportError("unknown", "unknown action")
                    }, _reportError: function(action, message) {
                        if (this._errorReportCount < this._MAX_ERROR_REPORT) {
                            this._errorReportCount++;
                            message = this._errorReportCount >= this._MAX_ERROR_REPORT ? this._MAX_ERROR_REPORT_MESSAGE : message;
                            this._sendMessageToAllAdContainers(this._MSG_TYPE_ERROR + ":" + JSON.stringify({
                                action: action, message: message
                            }))
                        }
                    }, _setupEvents: function() {
                        try {
                            window.addEventListener("message", this._receiveMessage);
                            var self = this;
                            this._domElement.onresize = function() {
                                self._onResize()
                            };
                            this._resizeHandler = this._onDocumentResize.bind(this);
                            window.addEventListener("resize", this._resizeHandler);
                            this._domNodeRemovedHandler = function(evt) {
                                if (evt.target === self._domElement)
                                    self._onRemove()
                            };
                            this._domElement.addEventListener("DOMNodeRemoved", this._domNodeRemovedHandler);
                            this._networkChangedEventHandler = function(eventArgs) {
                                self._sendMessageToAllAdContainers(self._MSG_TYPE_SETNETWORK + ":" + self._getNetworkState())
                            };
                            this._networkInfo.addEventListener("networkstatuschanged", this._networkChangedEventHandler);
                            if (this._adsGlobalEventManager !== null && typeof(this._adsGlobalEventManager) !== "undefined" && this._adsGlobalEventManager.isInitialized === true) {
                                this._globalAdEngagedHandler = this._adsGlobalEventManager.addEventListener(MicrosoftNSJS.Advertising.AdGlobalEventManager.EVENT_TYPE.AD_ENGAGED, function(engagedAdId) {
                                    if (self.element !== null && typeof(self.element !== "undefined") && self.element.id !== engagedAdId)
                                        self.suspend()
                                });
                                this._globalAdDisengagedHandler = this._adsGlobalEventManager.addEventListener(MicrosoftNSJS.Advertising.AdGlobalEventManager.EVENT_TYPE.AD_DISENGAGED, function(disengagedAdId) {
                                    if (self.element !== null && typeof(self.element !== "undefined") && self.element.id !== disengagedAdId)
                                        self.resume()
                                })
                            }
                        }
                        catch(err) {}
                    }, dispose: function() {
                        try {
                            if (this._expandedIFrame !== null)
                                this._closePopup();
                            if (typeof(this._resizeHandler) === "function") {
                                window.removeEventListener("resize", this._resizeHandler);
                                this._resizeHandler = null
                            }
                            if (typeof(this._domNodeRemovedHandler) === "function") {
                                if (this._domElement !== null)
                                    this._domElement.removeEventListener("DOMNodeRemoved", this._domNodeRemovedHandler);
                                this._domNodeRemovedHandler = null
                            }
                            if (this._adIFrame !== null) {
                                this._removeIFrame(this._adIFrame);
                                this._adIFrame = null
                            }
                            this._disposeAccelerometer();
                            this._stopOrientationMonitoring();
                            this._stopViewableChangeMonitoring();
                            this._onAdRefreshedInternal = null;
                            this._onAdRefreshed = null;
                            this._onAdRendered = null;
                            this._onBeforeAdRender = null;
                            this._onErrorOccurred = null;
                            this._onEngagedChanged = null;
                            this._onPointerDown = null;
                            this._onPointerUp = null;
                            this._onRemove();
                            this._adsGlobalEventManager.removeEventListener(MicrosoftNSJS.Advertising.AdGlobalEventManager.EVENT_TYPE.AD_ENGAGED, this._globalAdEngagedHandler);
                            this._adsGlobalEventManager.removeEventListener(MicrosoftNSJS.Advertising.AdGlobalEventManager.EVENT_TYPE.AD_DISENGAGED, this._globalAdDisengagedHandler);
                            this._adsGlobalEventManager.dispose();
                            if (this._domElement !== null) {
                                this._domElement.winControl = null;
                                this._domElement.onresize = null;
                                this._domElement = null
                            }
                            this._isDisposed = true
                        }
                        catch(err) {}
                    }, _setUseCustomClose: function(flag) {
                        var previousCloseBandHeight = this._currentCloseBandHeight;
                        if (flag)
                            this._currentCloseBandHeight = 0;
                        else
                            this._currentCloseBandHeight = this._RESERVED_CLOSE_BAND_HEIGHT;
                        if (previousCloseBandHeight !== this._currentCloseBandHeight)
                            this._setOrmmaScreenSize(this._adIFrame)
                    }, _disposeAdPlacement: function() {
                        if (this._placement !== null) {
                            this._placement.onadrefreshed = null;
                            this._placement.onerroroccurred = null;
                            this._placement = null
                        }
                    }, _onRemove: function() {
                        this._unscheduleRefresh();
                        this._stopOrientationMonitoring();
                        this._networkInfo.removeEventListener("networkstatuschanged", this._networkChangedEventHandler);
                        this._disposeAdPlacement()
                    }, _onDocumentResize: function() {
                        if (this._adIFrame !== null) {
                            this._setOrmmaScreenSize(this._adIFrame);
                            if (this._ormmaState === this._ORMMA_STATE_EXPANDED) {
                                this._positionExpandedFrame();
                                this._setOrmmaScreenSize(this._expandedIFrame)
                            }
                        }
                    }, _setOrmmaScreenSize: function(iframe) {
                        var screenSize = {
                                height: document.documentElement.offsetHeight - this._currentCloseBandHeight, width: document.documentElement.offsetWidth
                            };
                        if (screenSize.height < 0)
                            screenSize.height = 0;
                        this._sendMessageToAdContainer(iframe, this._MSG_TYPE_SETSCREENSIZE + ":" + JSON.stringify(screenSize))
                    }, _onResize: function() {
                        var newWidth = this.element.offsetWidth;
                        var newHeight = this.element.offsetHeight;
                        var currentWidth = this._currentAdWidth;
                        var currentHeight = this._currentAdHeight;
                        if (newWidth !== currentWidth || newHeight !== currentHeight) {
                            if (!this._requestInProgress) {
                                this._unscheduleRefresh();
                                this._refreshInternal()
                            }
                        }
                        else if (this._isAutoRefreshEnabled)
                            this._scheduleRefresh()
                    }, _updateExpandProperties: function(newExpandProps) {
                        try {
                            this._expandProperties = JSON.parse(newExpandProps)
                        }
                        catch(err) {
                            this._reportError(this._MSG_TYPE_SETEXPANDPROPERTIES, "unable to parse expand properties as json");
                            return
                        }
                        if (this._isExpanded && this._expandedIFrame !== null) {
                            var expandedBounds = this._getExpandedBounds();
                            this._expandedIFrame.style.top = expandedBounds.y + "px";
                            this._expandedIFrame.style.left = expandedBounds.x + "px";
                            this._expandedIFrame.width = expandedBounds.width + "px";
                            this._expandedIFrame.height = expandedBounds.height + "px";
                            this._setSize(this._expandedIFrame, expandedBounds.width, expandedBounds.height)
                        }
                    }, _getExpandedBounds: function() {
                        var screenHeight = document.documentElement.offsetHeight;
                        var screenWidth = document.documentElement.offsetWidth;
                        var expandedX = 0;
                        var expandedY = 0;
                        var expandedHeight = screenHeight - this._currentCloseBandHeight;
                        var expandedWidth = screenWidth;
                        if (this._expandProperties) {
                            expandedWidth = this._expandProperties.width !== undefined ? this._expandProperties.width : expandedWidth;
                            expandedHeight = this._expandProperties.height !== undefined ? this._expandProperties.height : expandedHeight;
                            if (expandedHeight > screenHeight - this._currentCloseBandHeight) {
                                expandedWidth = expandedWidth * (screenHeight - this._currentCloseBandHeight) / expandedHeight;
                                expandedHeight = screenHeight - this._currentCloseBandHeight
                            }
                            if (expandedWidth > screenWidth) {
                                expandedHeight = expandedHeight * (screenWidth / expandedWidth);
                                expandedWidth = screenWidth
                            }
                            expandedX = (screenWidth - expandedWidth) / 2;
                            expandedY = (screenHeight - expandedHeight) / 2
                        }
                        return {
                                x: expandedX, y: expandedY, width: expandedWidth, height: expandedHeight
                            }
                    }, _expand: function(url) {
                        if (this._isExpanded || (typeof(window._msAdEngaged) !== "undefined" && window._msAdEngaged))
                            return;
                        var screenHeight = document.documentElement.offsetHeight;
                        var screenWidth = document.documentElement.offsetWidth;
                        var expandedBounds = this._getExpandedBounds();
                        var expandedAdZIndex = 2147483647 - 10;
                        try {
                            this._overlayDiv = document.createElement("div");
                            this._overlayDiv.style.zIndex = expandedAdZIndex - 1;
                            this._overlayDiv.style.position = "absolute";
                            this._overlayDiv.style.top = "0px";
                            this._overlayDiv.style.left = "0px";
                            this._overlayDiv.style.width = screenWidth + "px";
                            this._overlayDiv.style.height = screenHeight + "px";
                            this._overlayDiv.id = this._domElement.id + "_overlayDiv";
                            this._overlayDiv.style.backgroundColor = "#000000";
                            this._overlayDiv.style.opacity = 0.8;
                            var control = this;
                            this._overlayDiv.onclick = function(evt) {
                                control._closePopup()
                            };
                            document.body.appendChild(this._overlayDiv);
                            this._expandedIFrame = document.createElement("iframe");
                            this._expandedIFrame.id = this._domElement.id + "_expandIframe";
                            this._expandedIFrame.style.top = expandedBounds.y + "px";
                            this._expandedIFrame.style.left = expandedBounds.x + "px";
                            this._expandedIFrame.style.zIndex = expandedAdZIndex;
                            this._expandedIFrame.style.position = "absolute";
                            this._expandedIFrame.width = expandedBounds.width + "px";
                            this._expandedIFrame.height = expandedBounds.height + "px";
                            this._expandedIFrame.marginwidth = "0px";
                            this._expandedIFrame.marginheight = "0px";
                            this._expandedIFrame.frameBorder = "0px";
                            this._expandedIFrame.onblur = function(evt) {
                                try {
                                    evt.currentTarget.focus()
                                }
                                catch(err) {}
                            };
                            document.body.appendChild(this._expandedIFrame)
                        }
                        catch(err) {
                            this._overlayDiv = this._disposeElement(this._overlayDiv);
                            this._expandedIFrame = this._disposeElement(this._expandedIFrame);
                            return
                        }
                        if (typeof(url) === "string" && url.length !== 0) {
                            this._expandedIFrame.src = url;
                            this._expandedIFrame.style.backgroundColor = "#FFFFFF"
                        }
                        else {
                            this._expandedIFrame.src = "ms-appx-web:///MSAdvertisingJS/ads/bootstrap.html";
                            this._sendMessageToAdContainer(this._expandedIFrame, this._MSG_TYPE_SETID + ":" + this._domElement.id);
                            if (this._adInstanceState !== null)
                                this._sendMessageToAdContainer(this._expandedIFrame, this._MSG_TYPE_SETADINSTANCESTATE + ":" + this._adInstanceState);
                            this._initializeOrmma(this._expandedIFrame, expandedBounds.width, expandedBounds.height, this._ORMMA_STATE_EXPANDED);
                            this._sendAdDataToAdContainer(this._expandedIFrame, this._rendererContent, this._rendererParams, this._prmParams);
                            try {
                                this._adsGlobalEventManager.broadcastEvent(MicrosoftNSJS.Advertising.AdGlobalEventManager.EVENT_TYPE.AD_ENGAGED, this.element.id)
                            }
                            catch(err) {
                                this._log("this._adsGlobalEventManager could not be called")
                            }
                        }
                        this._unscheduleRefresh();
                        this._setState(this._ORMMA_STATE_EXPANDED);
                        if (this._adIFrame !== null && typeof(this._adIFrame) === "object")
                            this._setSize(this._adIFrame, expandedBounds.width, expandedBounds.height);
                        var engagedBefore = this.isEngaged;
                        this._isExpanded = true;
                        window._msAdEngaged = true;
                        if (engagedBefore !== this.isEngaged)
                            this._fireEngagedChanged()
                    }, _disposeElement: function(node) {
                        if (node !== null && typeof(node) === "object")
                            try {
                                document.body.removeChild(node);
                                return null
                            }
                            catch(err) {
                                this._log("unable to remove node")
                            }
                        return node
                    }, _closePopup: function() {
                        if (this._overlayDiv !== null && typeof(this._overlayDiv) !== "undefined") {
                            this._removeFromParent(this._overlayDiv);
                            this._overlayDiv = null
                        }
                        if (this._expandedIFrame !== null) {
                            this._expandedIFrame.src = "about:blank";
                            this._removeFromParent(this._expandedIFrame);
                            this._expandedIFrame = null
                        }
                        this._setState(this._previousOrmmaState);
                        if (this._isAutoRefreshEnabled)
                            this._scheduleRefresh();
                        if (this._adIFrame !== null && typeof(this._adIFrame) === "object")
                            this._setSize(this._adIFrame, this._adIFrame.width, this._adIFrame.height);
                        var engagedBefore = this.isEngaged;
                        this._isExpanded = false;
                        window._msAdEngaged = false;
                        if (engagedBefore !== this.isEngaged)
                            this._fireEngagedChanged();
                        try {
                            this._adsGlobalEventManager.broadcastEvent(MicrosoftNSJS.Advertising.AdGlobalEventManager.EVENT_TYPE.AD_DISENGAGED, this.element.id)
                        }
                        catch(err) {
                            this._log("this._adsGlobalEventManager could not be called")
                        }
                    }, _positionExpandedFrame: function() {
                        if (this._expandedIFrame === null)
                            return;
                        var screenWidth = document.documentElement.offsetWidth;
                        var screenHeight = document.documentElement.offsetHeight;
                        if (this._overlayDiv !== null && typeof(this._overlayDiv) !== "undefined") {
                            this._overlayDiv.style.width = screenWidth + "px";
                            this._overlayDiv.style.height = screenHeight + "px"
                        }
                        var expandedX = (screenWidth - this._expandedIFrame.width) / 2;
                        var expandedY = (screenHeight - this._expandedIFrame.height) / 2;
                        this._expandedIFrame.style.left = expandedX + "px";
                        this._expandedIFrame.style.top = expandedY + "px"
                    }, _resize: function(width, height, state) {
                        if (this._adIFrame !== null && typeof(this._adIFrame) !== "undefined") {
                            this._adIFrame.height = height;
                            this._adIFrame.width = width;
                            this._setSize(this._adIFrame, width, height);
                            this._setState(state)
                        }
                    }, _setState: function(state) {
                        this._previousOrmmaState = this._ormmaState;
                        this._ormmaState = state;
                        this._sendMessageToAllAdContainers(this._MSG_TYPE_SETSTATE + ":" + state)
                    }, _setSize: function(iframe, width, height) {
                        this._sendMessageToAdContainer(iframe, this._MSG_TYPE_SETSIZE + ":" + JSON.stringify({
                            height: height, width: width
                        }))
                    }, _processSetUserEngaged: function(msgStr) {
                        if (msgStr === null || msgStr.indexOf("=") === -1)
                            this._log("invalid setUserEngaged message: " + msgStr);
                        else {
                            var msgArray = msgStr.split("=");
                            if (msgArray[0] === "engaged") {
                                var engagedBefore = this.isEngaged;
                                this._isUserEngaged = (msgArray[1] === "true");
                                if (this._isAutoRefreshEnabled)
                                    if (this._isUserEngaged)
                                        this._unscheduleRefresh();
                                    else
                                        this._scheduleRefresh();
                                if (engagedBefore !== this.isEngaged)
                                    this._fireEngagedChanged()
                            }
                            else
                                this._log("invalid setUserEngaged message: " + msgStr)
                        }
                    }, _processTiltMessage: function(msgStr) {
                        if (msgStr === null || msgStr.indexOf("=") === -1)
                            this._log("invalid tilt message: " + msgStr);
                        else {
                            var msgArray = msgStr.split("=");
                            if (msgArray[0] === this._MSG_TYPE_LISTENER)
                                if (msgArray[1] === this._MSG_TYPE_VALUESTART)
                                    this._startTiltAccelerometer();
                                else if (msgArray[1] === this._MSG_TYPE_VALUESTOP)
                                    this._stopTiltAccelerometer();
                                else
                                    this._log("invalid tilt message: " + msgStr);
                            else if (msgArray[0] === this._MSG_TYPE_GETTILT && msgArray[1] === this._MSG_TYPE_REFRESH)
                                this._getTilt();
                            else
                                this._log("invalid tilt message: " + msgStr)
                        }
                    }, _processShakeMessage: function(msgStr) {
                        if (msgStr === null || msgStr.indexOf("=") === -1)
                            this._log("invalid shake message: " + msgStr);
                        else {
                            var msgArray = msgStr.split("=");
                            if (msgArray[0] === this._MSG_TYPE_LISTENER)
                                if (msgArray[1] === this._MSG_TYPE_VALUESTART)
                                    this._startShakeAccelerometer();
                                else if (msgArray[1] === this._MSG_TYPE_VALUESTOP)
                                    this._stopShakeAccelerometer();
                                else
                                    this._log("invalid shake message: " + msgStr);
                            else
                                this._log("invalid shake message: " + msgStr)
                        }
                    }, _startTiltAccelerometer: function() {
                        if (this._checkAndCreateAccelerometer())
                            try {
                                if (typeof(this._accelerometer.tiltHandlers[this._ad.guid]) === "undefined" || this._accelerometer.tiltHandlers[this._ad.guid] === null)
                                    this._accelerometer.device.addEventListener("readingchanged", this._generateTiltListener())
                            }
                            catch(err) {}
                    }, _generateTiltListener: function() {
                        try {
                            var self = this;
                            var handler = function(eventArgs) {
                                    var coords = self._generateCoordsMessage(eventArgs.reading.accelerationX, eventArgs.reading.accelerationY, eventArgs.reading.accelerationZ);
                                    self._sendMessageToAllAdContainers(self._MSG_TYPE_UPDATETILTCOORDS + ":{" + coords + "}")
                                };
                            if (this._accelerometer !== null && typeof(this._accelerometer) !== "undefined")
                                this._accelerometer.tiltHandlers[self._ad.guid] = handler;
                            return handler
                        }
                        catch(err) {
                            return
                        }
                    }, _generateCoordsMessage: function(x, y, z) {
                        return '"x":"' + x + '","y":"' + y + '","z":"' + z + '"'
                    }, _stopTiltAccelerometer: function() {
                        try {
                            var handler = this._accelerometer.tiltHandlers[this._ad.guid];
                            if (handler !== null && typeof(handler) !== "undefined") {
                                this._accelerometer.device.removeEventListener("readingchanged", handler);
                                this._accelerometer.tiltHandlers[this._ad.guid] = null
                            }
                        }
                        catch(err) {
                            this._log("could not stop the tilt accelerometer")
                        }
                    }, _startShakeAccelerometer: function() {
                        if (this._checkAndCreateAccelerometer())
                            try {
                                if (typeof(this._accelerometer.shakeHandlers[this._ad.guid]) === "undefined" || this._accelerometer.shakeHandlers[this._ad.guid] === null)
                                    this._accelerometer.device.addEventListener("shaken", this._generateShakeListener())
                            }
                            catch(err) {
                                this._log("could not start the shake accelerometer")
                            }
                    }, _generateShakeListener: function() {
                        var self = this;
                        var handler = function(eventArgs) {
                                self._sendMessageToAllAdContainers(self._MSG_TYPE_FIRESHAKE)
                            };
                        if (this._accelerometer !== null && typeof(this._accelerometer) !== "undefined")
                            this._accelerometer.shakeHandlers[self._ad.guid] = handler;
                        return handler
                    }, _stopShakeAccelerometer: function() {
                        try {
                            var handler = this._accelerometer.shakeHandlers[this._ad.guid];
                            if (handler !== null && typeof(handler) !== "undefined") {
                                this._accelerometer.device.removeEventListener("shaken", handler);
                                this._accelerometer.shakeHandlers[this._ad.guid] = null
                            }
                        }
                        catch(err) {
                            this._log("could not stop shake accelerometer")
                        }
                    }, _getTilt: function() {
                        if (this._checkAndCreateAccelerometer())
                            try {
                                var coords = this._lastCoords;
                                var strCoords = this._generateCoordsMessage(coords.x, coords.y, coords.z);
                                this._sendMessageToAllAdContainers(this._MSG_TYPE_UPDATETILTCOORDS + ":{" + strCoords + "}");
                                var reading = this._accelerometer.device.getCurrentReading();
                                this._lastCoords = {
                                    x: reading.accelerationX, y: reading.accelerationY, z: reading.accelerationZ
                                }
                            }
                            catch(err) {
                                this._log("error in getTilt")
                            }
                    }, _disposeAccelerometer: function() {
                        if (this._accelerometer === null)
                            return;
                        else if (this._accelerometer.device !== null && typeof(this._accelerometer.device) === "object") {
                            this._stopShakeAccelerometer();
                            this._stopTiltAccelerometer()
                        }
                    }, _checkAndCreateAccelerometer: function() {
                        if (this._accelerometer === null || typeof(this._accelerometer.device) !== "object")
                            this._accelerometer = {};
                        try {
                            if (this._accelerometer.device === null || typeof(this._accelerometer.device) !== "object") {
                                this._accelerometer.device = Windows.Devices.Sensors.Accelerometer.getDefault();
                                this._accelerometer.device.reportInterval = this._sensorOptions.accelerometer.reportIntervalMS
                            }
                            if (this._accelerometer.device === null || typeof(this._accelerometer.device) !== "object") {
                                this._log("could not instantiate the accelerometer object, is the sensor online?");
                                return false
                            }
                            return true
                        }
                        catch(err) {
                            return false
                        }
                    }, _processViewableChangeMessage: function(msgStr) {
                        if (msgStr === null || msgStr.indexOf("=") === -1)
                            this._log("invalid viewable change message: " + msgStr);
                        else {
                            var msgArray = msgStr.split("=");
                            if (msgArray[0] === this._MSG_TYPE_LISTENER)
                                if (msgArray[1] === this._MSG_TYPE_VALUESTART)
                                    this._startViewableChangeMonitoring();
                                else if (msgArray[1] === this._MSG_TYPE_VALUESTOP)
                                    this._stopViewableChangeMonitoring();
                                else
                                    this._log("invalid viewable change message: " + msgStr);
                            else
                                this._log("invalid viewably change message: " + msgStr)
                        }
                    }, _storeAdInstanceState: function(adInstanceState) {
                        this._adInstanceState = adInstanceState;
                        if (this._ormmaState === this._ORMMA_STATE_EXPANDED)
                            this._sendMessageToAdContainer(this._adIFrame, this._MSG_TYPE_SETADINSTANCESTATE + ":" + this._adInstanceState)
                    }, _startViewableChangeMonitoring: function() {
                        if (this._viewableChangedTimer === null) {
                            this._sendMessageToAdContainer(this._adIFrame, this._MSG_TYPE_VIEWABLECHANGE + ":" + JSON.stringify({viewable: this._isOnScreen()}));
                            var self = this;
                            this._viewableChangedTimer = window.setInterval(function() {
                                var onScreen = self._isOnScreen();
                                if (self._isViewable !== onScreen) {
                                    self._isViewable = onScreen;
                                    self._sendMessageToAdContainer(self._adIFrame, self._MSG_TYPE_VIEWABLECHANGE + ":" + JSON.stringify({viewable: onScreen}))
                                }
                            }, this._viewableCheckPeriodMs)
                        }
                        this._isViewable = this._isOnScreen();
                        this._sendMessageToAdContainer(this._adIFrame, this._MSG_TYPE_VIEWABLECHANGE + ":" + JSON.stringify({viewable: this._isViewable}))
                    }, _stopViewableChangeMonitoring: function() {
                        if (this._viewableChangedTimer !== null && typeof(this._viewableChangedTimer) === "number") {
                            window.clearInterval(this._viewableChangedTimer);
                            this._viewableChangedTimer = null
                        }
                    }, _processGetOrientationMessage: function(msgStr) {
                        if (msgStr === null || msgStr.indexOf("=") === -1)
                            this._updateOrienation();
                        else {
                            var msgArray = msgStr.split("=");
                            if (msgArray[0] === this._MSG_TYPE_LISTENER)
                                if (msgArray[1] === this._MSG_TYPE_VALUESTART)
                                    this._startOrientationMonitoring();
                                else if (msgArray[1] === this._MSG_TYPE_VALUESTOP)
                                    this._stopOrientationMonitoring();
                                else
                                    this._log("invalid orientation message: " + msgStr);
                            else
                                this._log("invalid orientation message: " + msgStr)
                        }
                    }, _updateOrienation: function() {
                        var orientation = -1;
                        try {
                            switch (Windows.Graphics.Display.DisplayProperties.currentOrientation) {
                                case Windows.Graphics.Display.DisplayOrientations.landscape:
                                    orientation = 270;
                                    break;
                                case Windows.Graphics.Display.DisplayOrientations.landscapeFlipped:
                                    orientation = 90;
                                    break;
                                case Windows.Graphics.Display.DisplayOrientations.portraitFlipped:
                                    orientation = 180;
                                    break;
                                case Windows.Graphics.Display.DisplayOrientations.portrait:
                                    orientation = 0;
                                    break;
                                default:
                                    orientation = -1;
                                    break
                            }
                            this._sendMessageToAllAdContainers(this._MSG_TYPE_UPDATEORIENTATION + ":" + JSON.stringify({orientation: orientation}))
                        }
                        catch(err) {
                            control._reportError(control._MSG_TYPE_UPDATEORIENTATION, "Unable to communicate with orientation sensor.")
                        }
                    }, _startOrientationMonitoring: function() {
                        try {
                            if (typeof(this._orientationChangedHandler) !== "function") {
                                var self = this;
                                this._orientationChangedHandler = function(evt) {
                                    self._updateOrienation()
                                };
                                Windows.Graphics.Display.DisplayProperties.addEventListener("orientationchanged", this._orientationChangedHandler)
                            }
                        }
                        catch(err) {
                            control._reportError(control._MSG_TYPE_UPDATEORIENTATION, "Unable to communicate with orientation sensor.")
                        }
                    }, _stopOrientationMonitoring: function() {
                        try {
                            if (typeof(this._orientationChangedHandler) === "function") {
                                Windows.Graphics.Display.DisplayProperties.removeEventListener("orientationchanged", this._orientationChangedHandler);
                                this._orientationChangedHandler = null
                            }
                        }
                        catch(err) {
                            control._reportError(control._MSG_TYPE_UPDATEORIENTATION, "Unable to communicate with orientation sensor.")
                        }
                    }, _scheduleRefresh: function() {
                        if (this._refreshTimerId === null) {
                            var self = this;
                            this._refreshTimerId = setTimeout(function() {
                                self._refreshTimerId = null;
                                self._refreshInternal()
                            }, this._refreshPeriodSeconds * 1000)
                        }
                    }, _unscheduleRefresh: function() {
                        if (this._refreshTimerId !== null) {
                            clearTimeout(this._refreshTimerId);
                            this._refreshTimerId = null
                        }
                    }, _request: function(data) {
                        if (this._getNetworkState() === this._ORMMA_NETWORK_OFFLINE) {
                            this._fireErrorOccurred("http request error, network offline", this._ERROR_ENUM.NetworkConnectionFailure);
                            return
                        }
                        var self = this;
                        var req = new XMLHttpRequest;
                        if (data.display.toLowerCase() !== this._ORMMA_RESPONSE_IGNORE)
                            req.onreadystatechange = function() {
                                if (this.readyState === XMLHttpRequest.DONE)
                                    if (this.status === 200) {
                                        var responseJSON = {
                                                url: escape(data.url), response: escape(this.responseText)
                                            };
                                        self._sendMessageToAdContainer(self._adIFrame, "ormmaResponse:" + JSON.stringify(responseJSON))
                                    }
                                    else
                                        self._fireErrorOccurred("error on request to url: " + data.url + ": code " + req.status, self._ERROR_ENUM.NetworkConnectionFailure)
                            };
                        req.open("GET", data.url, true);
                        req.setRequestHeader(this._HTTP_HEADER_CACHE_CONTROL, this._HTTP_HEADER_VALUE_CACHE_CONTROL_NO_CACHE);
                        req.timeout = 10000;
                        try {
                            req.send(null)
                        }
                        catch(e) {
                            this._fireErrorOccurred("http request error: " + e.message, this._ERROR_ENUM.NetworkConnectionFailure)
                        }
                    }, _validateParameters: function() {
                        if (this._applicationId === null || this._applicationId === "" || this._adUnitId === null || this._adUnitId === "") {
                            this._fireErrorOccurred("ad control requires applicationId and adUnitId properties to be set", this._ERROR_ENUM.ClientConfiguration);
                            return false
                        }
                        if (typeof(this.latitude) !== "undefined" && !this._validateNumber("latitude", this.latitude))
                            return false;
                        if (typeof(this.longitude) !== "undefined" && !this._validateNumber("longitude", this.longitude))
                            return false;
                        return true
                    }, _validateNumber: function(fieldName, value) {
                        if (typeof(value) === "number") {
                            if (isNaN(value)) {
                                this._fireErrorOccurred(fieldName + " value is not a valid number (NaN)", this._ERROR_ENUM.ClientConfiguration);
                                return false
                            }
                        }
                        else {
                            this._fireErrorOccurred(fieldName + " value is not a valid type: " + typeof(value), this._ERROR_ENUM.ClientConfiguration);
                            return false
                        }
                        return true
                    }, _getUri: function(data) {
                        if (data !== null && typeof(data) === "object" && typeof(data.url) === "string" && data.url.length <= this._MAX_URL_LENGTH)
                            try {
                                var uri = new Windows.Foundation.Uri(data.url);
                                if (uri.schemeName === "http" || uri.schemeName === "https" || uri.schemeName === "ms-windows-store" || uri.schemeName === "skype" || uri.schemeName === "microsoftmusic" || uri.schemeName === "xboxsmartglass" || uri.schemeName === "xboxgames" || uri.schemeName === "microsoftvideo" || uri.schemeName === "bingtravel" || uri.schemeName === "bingweather" || uri.schemeName === "bingmaps" || uri.schemeName === "bingfinance" || uri.schemeName === "bingsports" || uri.schemeName === "bingnews")
                                    return uri
                            }
                            catch(err) {}
                        return null
                    }, _getNetworkState: function() {
                        var wifiThreshold = 1024000;
                        try {
                            var connProfile = this._networkInfo.getInternetConnectionProfile();
                            if (!connProfile || connProfile.getNetworkConnectivityLevel() === Windows.Networking.Connectivity.NetworkConnectivityLevel.none)
                                return this._ORMMA_NETWORK_OFFLINE;
                            else {
                                var interfaceType = connProfile.networkAdapter.ianaInterfaceType;
                                if (interfaceType === 6 || interfaceType === 71)
                                    return this._ORMMA_NETWORK_WIFI;
                                else
                                    return this._ORMMA_NETWORK_CELL
                            }
                        }
                        catch(err) {
                            if (err !== null && typeof(err) === "object")
                                this._fireErrorOccurred("error getting network state: " + err.message, this._ERROR_ENUM.Other);
                            else
                                this._fireErrorOccurred("error getting network state", this._ERROR_ENUM.Other)
                        }
                        return this._ORMMA_NETWORK_UNKNOWN
                    }
            })
    })
})(WinJS)
