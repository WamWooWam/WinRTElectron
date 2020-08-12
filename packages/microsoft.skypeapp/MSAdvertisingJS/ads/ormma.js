/*!
  Copyright (C) Microsoft. All rights reserved.
  This library is supported for use in Windows Store apps only.
*/
///<disable>EnableStrictMode.EnforceModulePattern</disable>
"use strict";
var ORMMA_STATE_UNKNOWN = "unknown";
var ORMMA_STATE_HIDDEN = "hidden";
var ORMMA_STATE_DEFAULT = "default";
var ORMMA_STATE_EXPANDED = "expanded";
var ORMMA_STATE_RESIZED = "resized";
var ORMMA_STATE_SUSPENDED = "suspended";

var ORMMA_EVENT_ERROR = "error";
var ORMMA_EVENT_HEADING_CHANGE = "headingChange";
var ORMMA_EVENT_KEYBOARD_CHANGE = "keyboardChange";
var ORMMA_EVENT_LOCATION_CHANGE = "locationChange";
var ORMMA_EVENT_NETWORK_CHANGE = "networkChange";
var ORMMA_EVENT_ORIENTATION_CHANGE = "orientationChange";
var ORMMA_EVENT_VIEWABLE_CHANGE = "viewableChange";
var ORMMA_EVENT_READY = "ready";
var ORMMA_EVENT_RESPONSE = "response";
var ORMMA_EVENT_SCREEN_CHANGE = "screenChange";
var ORMMA_EVENT_SHAKE = "shake";
var ORMMA_EVENT_SIZE_CHANGE = "sizeChange";
var ORMMA_EVENT_STATE_CHANGE = "stateChange";
var ORMMA_EVENT_TILT_CHANGE = "tiltChange";

var ORMMA_FEATURE_SCREEN = "screen";
var ORMMA_FEATURE_ORIENTATION = "orientation";
var ORMMA_FEATURE_LOCATION = "location";
var ORMMA_FEATURE_SMS = "sms";
var ORMMA_FEATURE_PHONE = "phone";
var ORMMA_FEATURE_EMAIL = "email";
var ORMMA_FEATURE_HEADING = "heading";
var ORMMA_FEATURE_SHAKE = "shake";
var ORMMA_FEATURE_TILT = "tilt";
var ORMMA_FEATURE_NETWORK = "network";
var ORMMA_FEATURE_CALENDAR = "calendar";
var ORMMA_FEATURE_CAMERA = "camera";
var ORMMA_FEATURE_MAP = "map";
var ORMMA_FEATURE_AUDIO = "audio";
var ORMMA_FEATURE_VIDEO = "video";
var ORMMA_FEATURE_LEVEL1 = "level-1";
var ORMMA_FEATURE_LEVEL2 = "level-2";
var ORMMA_FEATURE_LEVEL3 = "level-3";
var ORMMA_API_VERSION = "1.1.0";
var MRAID_API_VERSION = "1.0";
var MAPLE_MAX_STATE_DATA_SIZE = 65536;




function setScreenSize(width, height) {
    
    
    
    
    
    var convertWidth = parseInt(width);
    convertWidth = convertWidth === NaN ? -1 : convertWidth;
    var convertHeight = parseInt(height);
    convertHeight = convertHeight === NaN ? -1 : convertHeight;

    Ormma._setScreenSize(convertWidth, convertHeight);
}

function invokeInit() {
    
    
    
    Ormma._init();
}

function reportError(action, msg) {
    
    
    
    
    
    Ormma._throwError(action, msg);
}

function setOrmmaState(state) {
    
    
    
    
    Ormma._setState(state);
}

function setOrmmaLocale(locale) {
    
    
    
    
    Ormma._setLocale(locale);
}

function setSize(width, height) {
    
    
    
    
    
    var convertWidth = parseInt(width);
    convertWidth = convertWidth === NaN ? -1 : convertWidth;
    var convertHeight = parseInt(height);
    convertHeight = convertHeight === NaN ? -1 : convertHeight;

    Ormma._setSize(convertWidth, convertHeight);
}

function setMaxSize(width, height) {
    
    
    
    
    
    
    var convertWidth = parseInt(width);
    convertWidth = convertWidth === NaN ? -1 : convertWidth;
    var convertHeight = parseInt(height);
    convertHeight = convertHeight === NaN ? -1 : convertHeight;

    Ormma._setMaxSize(convertWidth, convertHeight);
}

function setOrientation(orientation) {
    
    
    
    
    
    
    
    
    
    
    
    var convertOrientation = parseInt(orientation);
    convertOrientation = convertOrientation === NaN ? -1 : convertOrientation;
    Ormma._setOrientation(convertOrientation);
}

function fireShake() {
    
    
    
    Ormma._shake();
}

function updateTiltCoords(x, y, z) {
    
    
    
    
    
    
    Ormma._tiltChange({ x: x, y: y, z: z });
}

function fireViewable(isViewable) {
    
    
    
    var isViewableBool = stringToBoolean(isViewable);
    Ormma._viewableChange(isViewableBool);
}

function setCapability(capability, value) {
    
    
    
    
    
    Ormma._setCapability(capability, stringToBoolean(value));
}

function stringToBoolean(value) {
    
    
    
    
    
    if (value.toLowerCase() === "true") {
        return true;
    }
    return false;
}

function fireResponse(url, response) {
    
    
    

    
    var data = { url: escape(url), response: escape(response) };
    Ormma._sendResponse(data);
}

function setNetwork(networkType) {
    
    
    
    Ormma._setNetwork(networkType);
}

function setSdkVersion(sdkVersion, client, runtimeType) {
    
    
    
    Ormma._setSdkVersion(sdkVersion, client, runtimeType);
}

function setAdInstanceState(adInstanceState) {
    
    
    
    Ormma._setAdInstanceState(adInstanceState);
}

(function () {

    
    function AdClientData() {
        this.listeners = [];
    }

    var _adClient = new AdClientData();

    
    window.ORMMA = window.ormma = window.Ormma = window.MAPLE = window.maple = window.Maple = {

        
        _maxSize: {},

        
        _dimensions: {},

        
        _defaultDimensions: {},

        
        _screenSize: null,

        
        
        _tiltCapability: false,

        
        
        _shakeCapability: false,

        
        
        _expandProperties: {
            width: 480,
            height: 800,
            useCustomClose: false,
            lockOrientation: false,
            isModal: true
        },

        
        _shakeProperties: {},

        
        _resizeProperties: {
            transition: "none"
        },

        
        _state: ORMMA_STATE_DEFAULT,

        
        _locale: null,

        
        
        _location: null,

        
        
        
        
        
        _orientation: -1,

        
        _lastTiltCoords: { x: 0, y: 0, z: 0 },

        
        _lastNetworkState: ORMMA_STATE_UNKNOWN,

        
        _sdkInfo: null,

        
        _adInstanceState: null,

        storeAdInstanceState: function (adInstanceState) {
            
            
            
            
            
            if (typeof (adInstanceState) === "string") {

                if (adInstanceState.length <= MAPLE_MAX_STATE_DATA_SIZE) {
                    this._adInstanceState = adInstanceState;
                    _notify("storeadinstancestate:" + this._adInstanceState);
                } else {
                    this._throwError("storeAdInstanceState", "attempting to store state data greater than allowed length of " + MAPLE_MAX_STATE_DATA_SIZE + ", attempted store length " + adInstanceState.length);
                }
            } else {
                this._throwError("storeAdInstanceState", "attempting to store state data that is not a string");
            }
        },

        getAdInstanceState: function () {
            
            
            
            
            if (this._adInstanceState !== null) {
                return this._adInstanceState;
            }
        },

        addEventListener: function (evt, callback) {
            
            
            
            
            
            if (_adClient.listeners[evt] === null || typeof (_adClient.listeners[evt]) === "undefined") {
                _adClient.listeners[evt] = [];
            }

            if (evt === ORMMA_EVENT_TILT_CHANGE && !this._tiltCapability) {
                this._throwError("tilt", "tilt capability is not supported, event listener not added");
                return;
            } else if (evt === ORMMA_EVENT_SHAKE && !this._shakeCapability) {
                this._throwError("shake", "shake capability is not supported, event listener not added");
                return;
            }

            
            _logme("adding listener for " + evt);
            _adClient.listeners[evt].push(callback);

            if (evt === ORMMA_EVENT_TILT_CHANGE) {
                _notify("tilt:listener=start");
            } else if (evt === ORMMA_EVENT_SHAKE) {
                _notify("shake:listener=start");
            } else if (evt === ORMMA_EVENT_ORIENTATION_CHANGE) {
                _notify("getorientation:listener=start");
            } else if (evt === ORMMA_EVENT_VIEWABLE_CHANGE) {
                _notify("viewableChange:listener=start");
            }
        },

        close: function () {
            
            
            
            
            _logme("sending close request");
            _notify("close");
        },

        createEvent: function (date, title, body) {
            
            
            
            _logme("[not impl] createEvent called: " + date + ", " + title + ", " + body);
        },

        expand: function (url) {
            
            
            
            
            if (!(this.getState() === ORMMA_STATE_DEFAULT || this.getState() === ORMMA_STATE_RESIZED)) {
                reportError("expand", "can only expand from resized or default states");
                return;
            }

            if (typeof (url) === "undefined" || url === null) {
                url = "";
            }

            
            if (typeof (this._expandProperties) === "object") {
                ///<disable>JS2045.ReviewEmptyBlocks</disable>
                if (_isEmbeddedBrowser()) {
                    
                } else {
                    var propStr = JSON.stringify(this._expandProperties);
                    _notify("setexpandproperties:" + propStr);
                }
                ///<enable>JS2045.ReviewEmptyBlocks</enable>
            }

            _logme("sending expand request");

            if (_isEmbeddedBrowser()) {
                _notify("expand:url=" + encodeURIComponent(url));
            } else {
                
                var msg = { url: url };
                _notify("expand:" + JSON.stringify(msg));
            }
        },

        getDefaultPosition: function () {
            
            
            
            
            
            
            return this._defaultDimensions;
        },

        getExpandProperties: function () {
            
            
            
            
            
            
            return this._expandProperties;
        },

        getHeading: function () {
            
            
            
            
            
            _logme("[not impl] getHeading called");
            return -1;
        },

        getKeyboard: function () {
            
            
            
            _logme("[not impl] getKeyboard called");
            return false;
        },

        getLocation: function () {
            
            
            
            _logme("[not impl] getKeyboard called");
            return this._location;
        },

        getMaxSize: function () {
            
            
            
            
            return this._maxSize;
        },

        getNetwork: function () {
            
            
            
            
            return this._lastNetworkState;
        },

        getOrientation: function () {
            
            
            
            
            _notify("getorientation");
            return this._orientation;
        },

        getPlacementType: function (none) {
            
            
            
            
            _logme("[not impl] getPlacementType called");
            return "unknown";
        },

        getScreenSize: function () {
            
            
            
            
            if (this._screenSize === null) {
                
                this._screenSize = { width: screen.availWidth, height: screen.availHeight - 100};
            }
            return this._screenSize;
        },

        getShakeProperties: function () {
            
            
            
            
            return this._shakeProperties;
        },

        getSize: function () {
            
            
            
            
            if (typeof (this._dimensions) === "undefined") {
                this._dimensions = {};
            }
            return this._dimensions;
        },

        getState: function () {
            
            
            
            
            return this._state;
        },

        getLocale: function () {
            
            
            
            
            if (this._locale !== null) {
                return this._locale;
            }
        },

        getTilt: function () {
            
            
            
            
            _logme("calling getTilt");

            if (!this._tiltCapability) {
                this._throwError("tilt", "tilt capability is not supported");
                return;
            }
            _notify("tilt:gettilt=refresh");
            return this._lastTiltCoords;
        },

        getViewable: function () {
            
            
            
            _logme("[not impl] getViewable called");
        },

        hide: function () {
            
            
            
            _logme("calling hide");
            _notify("hide");
        },

        isViewable: function () {
            
            
            
            
            
            _logme("[not impl] isViewable called");
        },

        makeCall: function (number) {
            
            
            
            
            
            
            _logme("sending call request: " + number);
            _notify("call:recipient=" + number);
        },

        open: function (url, controls) {
            
            
            
            
            
            _logme("sending website request: " + url);
            var msg;
            if (_isEmbeddedBrowser()) {
                msg = "url=" + encodeURIComponent(url);
            } else {
                msg = JSON.stringify({ url: url });
            }

            _notify("web:" + msg);
        },

        openMap: function (poi, fullscreen) {
            
            
            
            
            
            _logme("[not impl] openMap called: " + poi);
        },

        removeEventListener: function (evt, listener) {
            
            
            
            
            
            
            
            _logme("removing listener for " + evt);
            if (_adClient.listeners[evt] !== null && typeof (_adClient.listeners[evt]) !== "undefined") {
                var callbacks = _adClient.listeners[evt];
                for (var ix = 0; ix < callbacks.length; ix++) {
                    if (callbacks[ix] === listener) {
                        var xxx = callbacks.splice(ix, 1);
                        break;
                    }
                }

                
                if (_adClient.listeners[evt] === null || typeof (_adClient.listeners[evt]) === "undefined" || _adClient.listeners[evt].length === 0) {
                    if (evt === ORMMA_EVENT_TILT_CHANGE) {
                        if (!this._tiltCapability) {
                            this._throwError("tilt", "tilt capability is not supported, no event listener");
                            return;
                        }
                        _logme("stopping tilt device for event: " + evt + " (no more client listeners)");
                        _notify("tilt:listener=stop");
                    } else if (evt === ORMMA_EVENT_SHAKE) {
                        if (!this._shakeCapability) {
                            this._throwError("shake", "shake capability is not supported, no event listener");
                            return;
                        }
                        _logme("stopping shake device for event: " + evt + " (no more client listeners)");
                        _notify("shake:listener=stop");
                    } else if (evt === ORMMA_EVENT_ORIENTATION_CHANGE) {
                        _logme("stopping orientation changed event: " + evt + " (no more client listeners)");
                        _notify("getorientation:listener=stop");
                    } else if (evt === ORMMA_EVENT_VIEWABLE_CHANGE) {
                        _logme("stopping viewable changed event: " + evt + " (no more client listeners)");
                        _notify("viewableChange:listener=stop");
                    }
                }
            }
        },

        request: function (url, display) {
            
            
            
            var requestParams = {
                url: url,
                display: (typeof (display) !== "undefined" && display !== null ? display : "ignore")
            };
            _notify("request:" + JSON.stringify(requestParams));
            return false;
        },

        resize: function (width, height) {
            
            
            
            
            
            if (width > this._maxSize.width || width < 0) {
                this._throwError("resize", "width is greater than max allowed width (" + this._maxSize.width + ") or less than zero.");
                return;
            }

            if (height > this._maxSize.height || width < 0) {
                this._throwError("resize", "height is greater than max allowed height  (" + this._maxSize.height + ") or less than zero.");
                return;
            }

            _logme("calling resize:width=" + width + "&height=" + height);

            if (_isEmbeddedBrowser()) {
                _notify("resize:width=" + width + "&height=" + height);
            } else {
                
                var msg = { width: width, height: height };
                _notify("resize:" + JSON.stringify(msg));
            }
        },

        sendMail: function (recipient, subject, body) {
            
            
            
            
            
            
            _logme("sending mail request: " + recipient);
            _notify("mail:recipient=" + recipient + "&subject=" + subject + "&body=" + body);
        },

        sendSMS: function (recipient, body) {
            
            
            
            
            
            _logme("sending sms request: " + recipient);
            _notify("sms:recipient=" + recipient + "&body=" + body);
        },

        setExpandProperties: function (properties) {
            
            
            
            
            
            
            

            this._expandProperties = typeof (properties) !== "object" ? {} : properties;

            
            var screenSize = (typeof (this.getScreenSize) === "function" ? this.getScreenSize() : window.ormma.getScreenSize());

            this._expandProperties.width = _isValidExpandPropertiesDimension(this._expandProperties.width) ? this._expandProperties.width : screenSize.width;
            this._expandProperties.height = _isValidExpandPropertiesDimension(this._expandProperties.height) ? this._expandProperties.height : screenSize.height;
            this._expandProperties.useCustomClose = typeof (this._expandProperties.useCustomClose) === "undefined" ? false : this._expandProperties.useCustomClose;
            this._expandProperties.lockOrientation = typeof (this._expandProperties.lockOrientation) === "undefined" ? false : this._expandProperties.lockOrientation;
            this._expandProperties.isModal = true;

            if (_isEmbeddedBrowser()) {
                
                _logme("setting expand properties: width=" + this._expandProperties.width + "&height=" + this._expandProperties.height + "&usecustomclose=" + this._expandProperties.useCustomClose + "&lockorientation=" + this._expandProperties.lockOrientation);
                _notify("setexpandproperties:width=" + this._expandProperties.width + "&height=" + this._expandProperties.height + "&usecustomclose=" + this._expandProperties.useCustomClose + "&lockorientation=" + this._expandProperties.lockOrientation);
            } else {
                
                var propStr = JSON.stringify(this._expandProperties);
                _logme("setting expand properties: " + propStr);
                _notify("setexpandproperties:" + propStr);
            }
        },

        setResizeProperties: function (properties) {
            
            
            
            this._resizeProperties = typeof (properties) !== "object" ? {} : properties;
            _logme("setting resize properties: " + JSON.stringify(this._resizeProperties));
        },

        setShakeProperties: function (properties) {
            
            
            
            this._shakeProperties = typeof (properties) !== "object" ? {} : properties;
            _logme("setting shake properties: " + JSON.stringify(this._shakeProperties));
        },

        setUserEngaged: function (isEngaged) {
            
            
            
            
            this._isUserEngaged = typeof (isEngaged) === "boolean" ? isEngaged : false;
            _logme("setting user engaged: " + this._isUserEngaged);
            _notify("setuserengaged:engaged=" + this._isUserEngaged);
        },

        show: function () {
            
            
            
            _logme("calling show");
            _notify("show");
        },

        storePicture: function (url) {
            
            
            
            
            _logme("sending storePicture request: " + url);
            _notify("storePicture:url=" + encodeURIComponent(url));
        },

        supports: function (feature) {
            
            
            
            
            
            switch (feature) {
                case ORMMA_FEATURE_SCREEN:
                case ORMMA_FEATURE_ORIENTATION:
                case ORMMA_FEATURE_LEVEL1:
                case ORMMA_FEATURE_LEVEL2:
                case ORMMA_FEATURE_NETWORK:
                    return true;
                case ORMMA_FEATURE_SHAKE:
                    return this._shakeCapability;
                case ORMMA_FEATURE_TILT:
                    return this._tiltCapability;
                case ORMMA_FEATURE_PHONE:
                case ORMMA_FEATURE_SMS:
                case ORMMA_FEATURE_EMAIL:
                case ORMMA_FEATURE_LOCATION:
                case ORMMA_FEATURE_HEADING:
                case ORMMA_FEATURE_CALENDAR:
                case ORMMA_FEATURE_AUDIO:
                case ORMMA_FEATURE_VIDEO:
                case ORMMA_FEATURE_LEVEL3:
                default:
                    return false;
            }
        },

        useCustomClose: function (flag) {
            
            
            
            
            
            if (typeof (flag) === "boolean") {
                _logme("calling usecustomclose:" + flag);
                _notify("usecustomclose:" + flag);
            }
            else {
                reportError("useCustomClose", "parameter 'flag' is not a boolean value");
            }
        },

        playVideo: function (url) {
            
            
            
        },

        playAudio: function (url) {
            
            
            
        },


        

        addPhoneContact: function (phone) {
            
            
            
            
            _logme("adding phone contact : " + phone);
            _notify("addphonecontact:phonenumber=" + phone);
        },

        addEmailContact: function (email) {
            
            
            
            
            _logme("adding email contact : " + email);
            _notify("addemailcontact:email=" + email);
        },

        fanOnFacebook: function (url) {
            
            
            
            
            _logme("sending fanOnFacebook request: " + url);
            this.open(url);
        },

        fanOnTwitter: function (url) {
            
            
            
            
            _logme("sending fanOnTwitter request: " + url);
            this.open(url);
        },

        openMarketplace: function (applicationId) {
            
            
            
            
            _logme("opening marketplace appId: " + applicationId);
            _notify("marketplace:appid=" + applicationId);
        },

        getVersion: function () {
            
            
            
            
            return ORMMA_API_VERSION;
        },

        getSdkVersion: function () {
            
            
            
            
            if (this._sdkInfo !== null) {
                return this._sdkInfo;
            }
        },

        
        
        _tiltChange: function (data) {
            
            
            
            this._lastTiltCoords = data;
            _fireEvent(ORMMA_EVENT_TILT_CHANGE, data);
        },

        _shake: function () {
            
            
            
            _fireEvent(ORMMA_EVENT_SHAKE);
        },

        _viewableChange: function (data) {
            
            
            
            _fireEvent(ORMMA_EVENT_VIEWABLE_CHANGE, data);
        },

        _orientationChange: function (change) {
            
            
            
        },

        _networkChange: function (change) {
            
            
            
        },

        _headingChange: function (heading) {
            
            
            
        },

        _locationChanged: function (lat, lon, accuracy) {
            
            
            
        },

        _sendResponse: function (data) {
            
            
            
            
            _fireEvent(ORMMA_EVENT_RESPONSE, data);
        },

        _throwError: function (action, message) {
            
            
            
            
            
            var data = { message: message, action: action };
            _fireEvent(ORMMA_EVENT_ERROR, data);
        },

        _init: function () {
            
            
            
            _logme("Ormma is ready");
            _fireEvent(ORMMA_EVENT_READY, null);

            
            if (typeof (window.ORMMAReady) === "function") {
                _logme("Ormma calling ORMMAReady()");
                window.ORMMAReady();
            }
        },

        _setOrientation: function (orientation) {
            
            
            
            
            
            
            
            
            
            
            var oldOrientation = this._orientation;
            this._orientation = orientation;
            if (oldOrientation !== this._orientation) {
                _fireEvent(ORMMA_EVENT_ORIENTATION_CHANGE, this._orientation);
            }
        },

        _setState: function (state) {
            
            
            
            
            var oldState = this._state;
            this._state = state;
            if (oldState !== state) {
                _fireEvent(ORMMA_EVENT_STATE_CHANGE, this._state);
            }
        },

        _setLocale: function (locale) {
            
            
            
            
            this._locale = locale;
        },

        _setSize: function (width, height) {
            
            
            
            
            
            if (typeof (this._dimensions) === "undefined") {
                this._dimensions = {};
            }

            var currWidth = typeof (this._dimensions.width) === "undefined" ? 0 : this._dimensions.width;
            var currHeight = typeof (this._dimensions.height) === "undefined" ? 0 : this._dimensions.height;

            this._dimensions.width = width;
            this._dimensions.height = height;

            if (currWidth !== width || currHeight !== height) {
                _fireEvent(ORMMA_EVENT_SIZE_CHANGE, this._dimensions);
            }
        },

        _setSdkVersion: function (sdkVersion, client, runtimeType) {
            
            
            
            
            
            
            this._sdkInfo = {
                sdkVersion: sdkVersion,
                client: client,
                runtimeType: runtimeType,
                appName: navigator.appName,
                appVersion: navigator.appVersion,
                userAgent: navigator.userAgent,
                platform: navigator.platform
            };
        },

        _setCapability: function (capability, value) {
            
            
            
            
            

            if (typeof (value) !== "boolean") {
                return;
            }

            if (capability === ORMMA_FEATURE_TILT) {
                this._tiltCapability = value;
            } else if (capability === ORMMA_FEATURE_SHAKE) {
                this._shakeCapability = value;
            }
        },

        _setMaxSize: function (width, height) {
            
            
            
            
            
            if (typeof (this._maxSize) === "undefined") {
                this._maxSize = {};
            }

            this._maxSize.width = width;
            this._maxSize.height = height;
        },

        _setScreenSize: function (width, height) {
            
            
            
            
            
            if (this._screenSize === null || typeof (this._screenSize) === "undefined") {
                this._screenSize = {};
            }

            var currWidth = typeof (this._screenSize.width) === "undefined" ? 0 : this._screenSize.width;
            var currHeight = typeof (this._screenSize.height) === "undefined" ? 0 : this._screenSize.height;

            this._screenSize.width = width;
            this._screenSize.height = height;

            if (currWidth !== this._screenSize.width || currHeight !== this._screenSize.height) {
                _fireEvent(ORMMA_EVENT_SCREEN_CHANGE, this._screenSize);
            }
        },

        _setNetwork: function (networkState) {
            
            
            
            

            _logme("setting network state: " + networkState);
            if (typeof (this._lastNetworkState) === "undefined") {
                this._lastNetworkState = "";
            }

            if (networkState !== this._lastNetworkState) {
                this._lastNetworkState = networkState;
                _fireEvent(ORMMA_EVENT_NETWORK_CHANGE, {
                    online: (networkState !== "offline"),
                    connection: networkState
                });
            }
        },

        _setAdInstanceState: function (adInstanceState) {
            
            
            
            
            this._adInstanceState = adInstanceState;
        }

    };

    function _logme(msg) {
        
        
        
        

        if (_isEmbeddedBrowser()) {
            window.external.notify("$log - " + msg);
        } else {
            var debg = document.getElementById("debg");
            if (debg !== null) {
                if (debg.innerHTML === null) {
                    debg.innerHTML = msg;
                } else {
                    var oldval = debg.innerHTML;
                    debg.innerHTML = msg + "<br>" + oldval;
                }
            }
        }
    }

    function _isValidExpandPropertiesDimension(val) {
        
        
        
        
        
        if (typeof (val) === "undefined" || val === null || val <= 0) {
            return false;
        } else {
            return true;
        }
    }

    function _isEmbeddedBrowser() {
        return (typeof (window.external) === "object" && typeof (window.external.notify) !== "undefined");
    }

    function _notify(msg) {
        
        
        
        

        
        
        
        if (_isEmbeddedBrowser()) {
            window.external.notify(msg);
        } else {
            postToLocal(msg);
        }
    }

    function _fireEvent(eventType, data) {
        
        
        
        
        
        _logme("raising event " + eventType + " with data " + data);

        if (_adClient.listeners[eventType] !== null && typeof (_adClient.listeners[eventType]) !== "undefined") {
            try {
                
                
                var callbacks = _adClient.listeners[eventType].slice();
                var ix;
                switch (eventType) {
                    case ORMMA_EVENT_ERROR:
                        for (ix = 0; ix < callbacks.length; ix++) {
                            callbacks[ix](data.message, data.action);
                        }
                        break;
                    case ORMMA_EVENT_NETWORK_CHANGE:
                        for (ix = 0; ix < callbacks.length; ix++) {
                            callbacks[ix](data.online, data.connection);
                        }
                        break;
                    case ORMMA_EVENT_ORIENTATION_CHANGE:
                        for (ix = 0; ix < callbacks.length; ix++) {
                            callbacks[ix](data);
                        }
                        break;
                    case ORMMA_EVENT_READY:
                        for (ix = 0; ix < callbacks.length; ix++) {
                            callbacks[ix]();
                        }
                        break;
                    case ORMMA_EVENT_SCREEN_CHANGE:
                        for (ix = 0; ix < callbacks.length; ix++) {
                            callbacks[ix](data.width, data.height);
                        }
                        break;
                    case ORMMA_EVENT_SHAKE:
                        for (ix = 0; ix < callbacks.length; ix++) {
                            callbacks[ix]();
                        }
                        break;
                    case ORMMA_EVENT_SIZE_CHANGE:
                        for (ix = 0; ix < callbacks.length; ix++) {
                            callbacks[ix](data.width, data.height);
                        }
                        break;
                    case ORMMA_EVENT_STATE_CHANGE:
                        for (ix = 0; ix < callbacks.length; ix++) {
                            callbacks[ix](data);
                        }
                        break;
                    case ORMMA_EVENT_TILT_CHANGE:
                        for (ix = 0; ix < callbacks.length; ix++) {
                            callbacks[ix](data.x, data.y, data.z);
                        }
                        break;
                    case ORMMA_EVENT_VIEWABLE_CHANGE:
                        for (ix = 0; ix < callbacks.length; ix++) {
                            callbacks[ix](data);
                        }
                        break;
                    case ORMMA_EVENT_RESPONSE:
                        for (ix = 0; ix < callbacks.length; ix++) {
                            callbacks[ix](unescape(data.url), unescape(data.response));
                        }
                        break;
                        
                    case ORMMA_EVENT_HEADING_CHANGE:
                    case ORMMA_EVENT_KEYBOARD_CHANGE:
                    case ORMMA_EVENT_LOCATION_CHANGE:
                    default:
                        return false;
                }
            }
            catch (err) {
                _logme("exception thrown while firing event: " + err.message);
            }
        } else {
            _logme("no listeners for event " + eventType);
        }
    }

    window.mraid = window.MRAID = {

        
        addEventListener: function (evt, callback) {
            if (this._mraidSupportedEvts === null) {
                this._mraidSupportedEvts = this._initEventList();
            }

            
            if (this._mraidSupportedEvts[evt]) {
                window.ormma.addEventListener(evt, callback);
            }
        },
        close: window.ormma.close,
        expand: window.ormma.expand,
        getExpandProperties: window.ormma.getExpandProperties,
        getPlacementType: window.ormma.getPlacementType,
        getState: function () { return window.ormma._state; },
        getVersion: function () { return MRAID_API_VERSION; },
        isViewable: window.ormma.isViewable,
        open: window.ormma.open,
        removeEventListener: function (evt, callback) {
            if (this._mraidSupportedEvts === null) {
                this._mraidSupportedEvts = this._initEventList();
            }

            
            if (this._mraidSupportedEvts[evt]) {
                window.ormma.removeEventListener(evt, callback);
            }
        },
        setExpandProperties: window.ormma.setExpandProperties,
        useCustomClose: window.ormma.useCustomClose,

        
        _mraidSupportedEvts: null,

        
        _initEventList: function () {
            var evtArray = [];
            evtArray[ORMMA_EVENT_ERROR] =
                evtArray[ORMMA_EVENT_READY] =
                evtArray[ORMMA_EVENT_STATE_CHANGE] =
                evtArray[ORMMA_EVENT_VIEWABLE_CHANGE] = true;
            return evtArray;
        }
    };
})();
