/*  © Microsoft. All rights reserved. */
WinJS.Namespace.define('CommonJS', { Version: 'latest' });
(function appexPlatformUtilitiesInit() {
    "use strict";
    WinJS.Namespace.define("PlatformJS.Configuration.ConfigurationManager", {
        _previewFeaturedDataSource: false, optimalTextSizeEnabled: false, previewFeaturedDataSource: {
            get: function get() {
                return this._previewFeaturedDataSource
            }, set: function set(value) {
                this._previewFeaturedDataSource = value;
                Platform.Configuration.ConfigurationManager.instance.previewFeaturedDataSource = value
            }
        }, enableLocationLookup: {
            get: function get() {
                return Windows.Storage.ApplicationData.current.localSettings.values["enableLocationLookup"]
            }, set: function set(value) {
                Windows.Storage.ApplicationData.current.localSettings.values["enableLocationLookup"] = value
            }
        }
    });
    WinJS.Namespace.define("PlatformJS.Utilities.Globalization", {
        _currentMarketKey: "app.currentMarket", _currentMarket: null, _dominantMarketKey: "app.dominantMarket", _dominantMarket: null, _qualifiedLanguageKey: "app.qualifiedLanguage", _qualifiedLanguage: null, applicationSettingsNS: {
            get: function get() {
                return Windows.Storage.ApplicationData.current.localSettings
            }
        }, _isEmbargoed: false, _nsInitialized: false, isEmbargoed: {
            get: function get() {
                return this._isEmbargoed
            }, set: function set(value) {
                this._isEmbargoed = value;
                Platform.Configuration.ConfigurationManager.instance.isEmbargoed = value
            }
        }, _ensureGlobalizationInitialized: function _ensureGlobalizationInitialized() {
            if (!this._nsInitialized) {
                if (typeof Platform.Globalization === "undefined") {
                    Platform.Globalization = Microsoft.Bing.AppEx.ClientPlatform.Globalization
                }
                this._nsInitialized = true
            }
        }, _getCurrentLanguageAndLocation: function _getCurrentLanguageAndLocation() {
            return this.applicationSettingsNS.values["Platform_LanguageLocationString"]
        }, clearSavedGlobalizationData: function clearSavedGlobalizationData() {
            this._currentMarket = null;
            this._qualifiedLanguage = null;
            this._dominantMarket = null;
            this.applicationSettingsNS.values.remove(this._currentMarketKey);
            this.applicationSettingsNS.values.remove(this._qualifiedLanguageKey);
            this.applicationSettingsNS.values.remove(this._dominantMarketKey)
        }, _getCurrentMarket: function _getCurrentMarket() {
            this._ensureGlobalizationInitialized();
            return Platform.Globalization.Marketization.getCurrentMarket()
        }, getCurrentMarket: function getCurrentMarket(getCachedValue) {
            if (getCachedValue) {
                if (this.applicationSettingsNS.values[this._currentMarketKey]) {
                    return JSON.parse(this.applicationSettingsNS.values[this._currentMarketKey])
                }
            }
            return this._localSettingsWrapper("_currentMarket", this._currentMarketKey, this._getCurrentMarket)
        }, setCurrentMarket: function setCurrentMarket(value) {
            this._ensureGlobalizationInitialized();
            Platform.Globalization.Marketization.setCurrentMarket(value)
        }, _getQualifiedLanguageString: function _getQualifiedLanguageString() {
            this._ensureGlobalizationInitialized();
            return Platform.Globalization.Marketization.getQualifiedLanguageString()
        }, getQualifiedLanguageString: function getQualifiedLanguageString() {
            return this._localSettingsWrapper("_qualifiedLanguage", this._qualifiedLanguageKey, this._getQualifiedLanguageString)
        }, _getDominantMarketForLocation: function _getDominantMarketForLocation() {
            this._ensureGlobalizationInitialized();
            var dominantMarket = Platform.Globalization.Marketization.getDominantMarketForLocation();
            var geographicRegionTwoLetterCode = null;
            if (dominantMarket.geographicRegion && dominantMarket.geographicRegion.codeTwoLetter) {
                geographicRegionTwoLetterCode = dominantMarket.geographicRegion.codeTwoLetter
            }
            return {
                valueAsString: dominantMarket.valueAsString, geographicRegionTwoLetterCode: geographicRegionTwoLetterCode
            }
        }, getDominantMarketForLocation: function getDominantMarketForLocation() {
            return this._localSettingsWrapper("_dominantMarket", this._dominantMarketKey, this._getDominantMarketForLocation)
        }, isSavedLanguageAndLocationSame: function isSavedLanguageAndLocationSame() {
            var languageLocationStringFromSettings = this._getCurrentLanguageAndLocation();
            var homeGeographicRegionCode = Windows.System.UserProfile.GlobalizationPreferences.homeGeographicRegion;
            var topSystemLanguageString = Windows.System.UserProfile.GlobalizationPreferences.languages[0];
            if (languageLocationStringFromSettings) {
                var languageLocationString = topSystemLanguageString + ";" + homeGeographicRegionCode;
                return languageLocationString.toLowerCase() === languageLocationStringFromSettings.toLowerCase()
            }
            return false
        }, _localSettingsWrapper: function _localSettingsWrapper(cachedValueKey, localSettingsKey, getValueDelegate) {
            var currentValue;
            var updateLocalSettings = true;
            if (PlatformJS.isPlatformInitialized || !PlatformJS.isWarmBoot) {
                currentValue = getValueDelegate.call(this)
            }
            else {
                if (this[cachedValueKey]) {
                    currentValue = this[cachedValueKey];
                    updateLocalSettings = false
                }
                else if (this.applicationSettingsNS.values[localSettingsKey]) {
                    currentValue = JSON.parse(this.applicationSettingsNS.values[localSettingsKey]);
                    updateLocalSettings = false
                }
                else {
                    currentValue = getValueDelegate.call(this)
                }
            }
            if (currentValue !== this[cachedValueKey]) {
                this[cachedValueKey] = currentValue;
                if (updateLocalSettings) {
                    this.applicationSettingsNS.values[localSettingsKey] = JSON.stringify(currentValue)
                }
            }
            return currentValue
        }, getGeographicRegion: function getGeographicRegion() {
            this._ensureGlobalizationInitialized();
            return Platform.Globalization.Marketization.getCurrentMarketInfo().geographicRegion
        }, getLocationFromServerAsync: function getLocationFromServerAsync() {
            this._ensureGlobalizationInitialized();
            return Platform.Globalization.Marketization.getLocationFromServerAsync()
        }, getLanguageFromMarket: function getLanguageFromMarket(market) {
            var language = null;
            var marketInfo = Platform.Globalization.MarketInfo.parse(market);
            if (marketInfo && marketInfo.displayName && typeof marketInfo.displayName === "string" && marketInfo.displayName !== "row") {
                var displayName = marketInfo.displayName;
                language = displayName.slice(displayName.lastIndexOf('-') + 1, displayName.length);
                if (language) {
                    language = language.trim()
                }
            }
            return language
        }
    });
    WinJS.Namespace.define("PlatformJS.Utilities", {
        onError: function onError(error) {
            var errorForLogging = null;
            if (error && error instanceof Object) {
                try {
                    errorForLogging = JSON.stringify(error)
                }
                catch (ex) { }
            }
            var stackTrace = "";
            try {
                throw new Error("on error");
            }
            catch (exception) {
                stackTrace = exception.stack
            }
            errorForLogging = errorForLogging || error;
            console.error(errorForLogging);
            console.error(stackTrace);
            PlatformJS.deferredTelemetry(function logOnErrorTelemetry() {
                PlatformJS.Utilities._logCodeError(Microsoft.Bing.AppEx.Telemetry.LogLevel.high, Microsoft.Bing.AppEx.Telemetry.RuntimeEnvironment.javascript, errorForLogging, stackTrace)
            });
            return WinJS.Promise.wrap(null)
        }, _logCodeError: function _logCodeError(logLevel, runtimeEnvironment, errorForLogging, stackTrace) {
            Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logCodeError(logLevel, runtimeEnvironment, errorForLogging, stackTrace)
        }, _appexUriSchemes: [], _appexSchemesLoaded: false, addAppexUriScheme: function addAppexUriScheme(scheme) {
            if (!this._appexSchemesLoaded) {
                var schemes = Windows.Storage.ApplicationData.current.localSettings.values["appexUriSchemes"];
                if (schemes) {
                    this._appexUriSchemes = schemes.split(',')
                }
                this._appexSchemesLoaded = true
            }
            if (scheme) {
                if (this._appexUriSchemes.indexOf(scheme) === -1) {
                    this._appexUriSchemes.push(scheme);
                    Windows.Storage.ApplicationData.current.localSettings.values["appexUriSchemes"] = this._appexUriSchemes.toString();
                    Windows.Storage.ApplicationData.current.localSettings.values["appexUriSchemesChanged"] = true
                }
            }
        }, imageCardSource: WinJS.Binding.converter(function platformUtilities_imageCardSource(url) {
            return {
                url: url, cacheId: "PlatformImageCache"
            }
        }), _localCachedSettingsWrapper: function _localCachedSettingsWrapper(cachedValueKey, getValueDelegate) {
            var currentValue;
            var cachedValue = this[cachedValueKey];
            if (PlatformJS.isPlatformInitialized || !PlatformJS.isWarmBoot) {
                currentValue = getValueDelegate.call(this)
            }
            else {
                if (cachedValue) {
                    currentValue = cachedValue
                }
                else {
                    currentValue = getValueDelegate.call(this)
                }
            }
            if (currentValue !== cachedValue) {
                this[cachedValueKey] = currentValue
            }
            return currentValue
        }, getInternetConnectionProfile: function getInternetConnectionProfile() {
            var profile = this._localCachedSettingsWrapper("_currentInternetConnectionProfile", function fetchInternetConnectionProfile() {
                var windowsNetworking = Windows.Networking.Connectivity;
                var result = windowsNetworking.NetworkInformation.getInternetConnectionProfile();
                return result
            });
            return profile
        }, getPlatformErrorCode: function getPlatformErrorCode(exception) {
            var errorCode = Platform.PlatformExceptionCode.none;
            if (exception) {
                var code = parseInt(exception.message);
                if (code) {
                    errorCode = code
                }
                else {
                    if (exception.name === "WinRTError") {
                        var message = exception.message;
                        var number = exception.number;
                        if (number) {
                            errorCode = number & 0x0000FFFF
                        }
                        else {
                            var idx = message.indexOf(": ");
                            if (idx > -1) {
                                var substr = message.substring(idx);
                                var endIdx = substr.indexOf(" at");
                                if (endIdx > -1) {
                                    var codeString = substr.substring(2, endIdx);
                                    code = parseInt(codeString);
                                    if (code) {
                                        errorCode = code
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return errorCode
        }, checkOfflineErrorCode: function checkOfflineErrorCode(code) {
            if (code === 102 && !Platform.Networking.NetworkManager.instance.isNetworkAvailable) {
                return CommonJS.Error.NO_INTERNET
            }
            return CommonJS.Error.STANDARD_ERROR
        }, enableArrowKeyNavigation: function enableArrowKeyNavigation(element, ignoreLeftRight) {
            var getAjacentItem = function (nextSibling, Xaxis) {
                var left = element.offsetLeft;
                var top = element.offsetTop;
                var elem = element;
                if (nextSibling) {
                    elem = elem.nextSibling;
                    while (elem) {
                        if (Xaxis && elem.offsetTop === top) {
                            return elem
                        }
                        if (!Xaxis && elem.offsetLeft === left) {
                            return elem
                        }
                        elem = elem.nextSibling
                    }
                }
                else {
                    elem = elem.previousSibling;
                    while (elem) {
                        if (Xaxis && elem.offsetTop === top) {
                            return elem
                        }
                        if (!Xaxis && elem.offsetLeft === left) {
                            return elem
                        }
                        elem = elem.previousSibling
                    }
                }
                return null
            };
            var onkey = function (evt) {
                var isNextSibling = false;
                var Xaxis = true;
                switch (evt.keyCode) {
                    case WinJS.Utilities.Key.leftArrow:
                        if (ignoreLeftRight) {
                            return
                        }
                        break;
                    case WinJS.Utilities.Key.rightArrow:
                        if (ignoreLeftRight) {
                            return
                        }
                        isNextSibling = true;
                        break;
                    case WinJS.Utilities.Key.downArrow:
                        isNextSibling = true;
                        Xaxis = false;
                        break;
                    case WinJS.Utilities.Key.upArrow:
                        Xaxis = false;
                        break;
                    default:
                        return
                }
                if (document.dir === "rtl") {
                    isNextSibling = !isNextSibling
                }
                var ajacent = getAjacentItem(isNextSibling, Xaxis);
                if (ajacent) {
                    ajacent.focus()
                }
            };
            element.addEventListener("keydown", onkey)
        }, pointerEventListenersMap: {
            MSLostPointerCapture: function platformUtilities_onMSLostPointerCapture(event) {
                WinJS.UI.Animation.pointerUp(this).then();
                WinJS.Utilities.data(this).pointerDown = false
            }, MSPointerCancel: function platformUtilities_onMSPointerCancel(event) {
                WinJS.UI.Animation.pointerUp(this).then();
                WinJS.Utilities.data(this).pointerDown = false
            }, MSPointerUp: function platformUtilities_onMSPointerUp(event) {
                if (event.button !== 2) {
                    WinJS.UI.Animation.pointerUp(this).then();
                    WinJS.Utilities.data(this).pointerDown = false
                }
            }, MSPointerDown: function platformUtilities_onMSPointerDown(event) {
                if (event.button !== 2) {
                    WinJS.UI.Animation.pointerDown(this).then();
                    WinJS.Utilities.data(this).pointerDown = true
                }
            }, MSPointerOut: function platformUtilities_onMSPointerOut(event) {
                var elementData = WinJS.Utilities.data(this);
                if (elementData.pointerDown) {
                    WinJS.UI.Animation.pointerUp(this).then();
                    elementData.pointerDown = false
                }
            }
        }, enablePointerUpDownAnimations: function enablePointerUpDownAnimations(element) {
            var pointerEventListenersMap = PlatformJS.Utilities.pointerEventListenersMap;
            element.addEventListener("MSLostPointerCapture", pointerEventListenersMap["MSPointerCancel"], false);
            element.addEventListener("MSPointerCancel", pointerEventListenersMap["MSPointerCancel"], false);
            element.addEventListener("MSPointerUp", pointerEventListenersMap["MSPointerUp"], false);
            element.addEventListener("MSPointerDown", pointerEventListenersMap["MSPointerDown"], false);
            element.addEventListener("MSPointerOut", pointerEventListenersMap["MSPointerOut"], false)
        }, disablePointerUpDownAnimations: function disablePointerUpDownAnimations(element) {
            var pointerEventListenersMap = PlatformJS.Utilities.pointerEventListenersMap;
            element.removeEventListener("MSLostPointerCapture", pointerEventListenersMap["MSLostPointerCapture"], false);
            element.removeEventListener("MSPointerCancel", pointerEventListenersMap["MSPointerCancel"], false);
            element.removeEventListener("MSPointerUp", pointerEventListenersMap["MSPointerUp"], false);
            element.removeEventListener("MSPointerDown", pointerEventListenersMap["MSPointerDown"], false);
            element.removeEventListener("MSPointerOut", pointerEventListenersMap["MSPointerOut"], false)
        }, registerSwipeProxy: function registerSwipeProxy(element, onSwipe, onEnter, onExit) {
            var onPointerMove = function (ptr) {
                try {
                    var pos = ptr.currentPoint.position;
                    if (!previousPt) {
                        previousPt = pos
                    }
                    var evt = {
                        slope: 0, event: ptr, pointer: capturedPtr, isVertical: true
                    };
                    var deltaX = pos.x - previousPt.x;
                    if (deltaX !== 0) {
                        var slope = ((pos.y - previousPt.y) / (deltaX));
                        evt.slope = slope;
                        if (Math.abs(slope) < 1) {
                            evt.isVertical = false
                        }
                        if (onSwipe) {
                            onSwipe(evt)
                        }
                    }
                    previousPt = pos
                }
                catch (ex) { }
            };
            element.addEventListener("MSPointerDown", function platformUtilities_onMSPointerDownSwipe(ptr) {
                capturedPtr = ptr;
                previousPt = ptr.currentPoint.position;
                element.addEventListener("MSPointerMove", onPointerMove);
                if (onEnter) {
                    onEnter(ptr)
                }
            });
            var capturedPtr = null;
            var previousPt = null;
            var leave = function (evt) {
                element.removeEventListener("MSPointerMove", onPointerMove);
                if (onExit) {
                    onExit(evt)
                }
            };
            element.addEventListener("MSLostPointerCapture", leave);
            element.addEventListener("MSPointerUp", leave)
        }, _lastClickUserActionMethodDate: null, _lastClickUserActionMethodValue: null, _lastClickUserActionMethod: {
            get: function get() {
                return this._lastClickUserActionMethodValue || Microsoft.Bing.AppEx.Telemetry.UserActionMethod.unknown
            }, set: function set(value) {
                this._lastClickUserActionMethodValue = value
            }
        }, logClickUserAction: function logClickUserAction(clickUserActionMethod, actionContext, element) {
            this._lastClickUserActionMethod = clickUserActionMethod;
            this._lastClickUserActionMethodDate = (new Date).getTime();
            Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, actionContext || "", element || "", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, clickUserActionMethod, 0)
        }, getLastClickUserActionMethod: function getLastClickUserActionMethod() {
            if ((new Date).getTime() - this._lastClickUserActionMethodDate > 1500) {
                return Microsoft.Bing.AppEx.Telemetry.UserActionMethod.unknown
            }
            return this._lastClickUserActionMethod
        }, _setLastClickUserActionMethod: function _setLastClickUserActionMethod(lastClickUserActionMethod, lastClickUserActionMethodDate) {
            if (lastClickUserActionMethod !== Microsoft.Bing.AppEx.Telemetry.UserActionMethod.unknown) {
                this._lastClickUserActionMethod = lastClickUserActionMethod;
                this._lastClickUserActionMethodDate = lastClickUserActionMethodDate
            }
        }, setLastClickUserActionMethodWithEvent: function setLastClickUserActionMethodWithEvent(event) {
            var clickUserActionMethod = PlatformJS.Utilities.getClickUserActionMethod(event);
            PlatformJS.Utilities.setLastClickUserActionMethodWithNavMethod(clickUserActionMethod)
        }, setLastClickUserActionMethodWithNavMethod: function setLastClickUserActionMethodWithNavMethod(navMethod) {
            var clickUserActionMethodDate = (new Date).getTime();
            PlatformJS.Utilities._setLastClickUserActionMethod(navMethod, clickUserActionMethodDate)
        }, getClickUserActionMethod: function getClickUserActionMethod(event) {
            var clickUserActionMethod = Microsoft.Bing.AppEx.Telemetry.UserActionMethod.unknown;
            if (event) {
                var pointerType = event.pointerType;
                if (pointerType) {
                    switch (pointerType) {
                        case event.MSPOINTER_TYPE_TOUCH || "touch":
                            clickUserActionMethod = Microsoft.Bing.AppEx.Telemetry.UserActionMethod.touch;
                            break;
                        case event.MSPOINTER_TYPE_MOUSE || "mouse":
                            clickUserActionMethod = Microsoft.Bing.AppEx.Telemetry.UserActionMethod.mouse;
                            break;
                        case event.MSPOINTER_TYPE_PEN || "pen":
                            clickUserActionMethod = Microsoft.Bing.AppEx.Telemetry.UserActionMethod.pen;
                            break
                    }
                }
            }
            return clickUserActionMethod
        }, registerGlobalClickProxy: function registerGlobalClickProxy() {
            return function platformUtilities_registerLastClick() {
                function onKeyDown(evt) {
                    var clickUserActionMethod = Microsoft.Bing.AppEx.Telemetry.UserActionMethod.keyboard;
                    PlatformJS.Utilities.setLastClickUserActionMethodWithNavMethod(clickUserActionMethod)
                }
                function onMsPointerDown(evt) {
                    PlatformJS.Utilities.setLastClickUserActionMethodWithEvent(evt)
                }
                var element = document.body;
                element.addEventListener("keydown", onKeyDown);
                element.addEventListener("MSPointerDown", onMsPointerDown)
            }()
        }, registerItemClickProxy: function registerItemClickProxy(element, predicate, completion, instrumentation) {
            var instrumentationElement = (instrumentation && instrumentation.element) || "";
            var actionContext = (instrumentation && instrumentation.actionContext) || "";
            var logUserAction = instrumentation && instrumentation.logUserAction === false ? false : true;
            return function platformUtilities_itemClickProxyHandler() {
                var pointerUpEventObject = null;
                var pressedElement = null;
                var isUiaClick = false;
                var pressedLocation = {
                    x: -1, y: -1
                };
                var LEFT_MSPOINTER_BUTTON = 0;
                function onClick(evt) {
                    if (pointerUpEventObject === null) {
                        isUiaClick = true;
                        pressedElement = evt.srcElement
                    }
                    else {
                        var clickUserActionMethod = PlatformJS.Utilities.getClickUserActionMethod(pointerUpEventObject);
                        if (logUserAction) {
                            PlatformJS.Utilities.logClickUserAction(clickUserActionMethod, actionContext, instrumentationElement)
                        }
                    }
                    delayedPointerUp(evt)
                }
                function onKeyDown(evt) {
                    switch (evt.keyCode) {
                        case WinJS.Utilities.Key.enter:
                        case WinJS.Utilities.Key.space:
                            if (logUserAction) {
                                PlatformJS.Utilities.logClickUserAction(Microsoft.Bing.AppEx.Telemetry.UserActionMethod.keyboard, actionContext, instrumentationElement)
                            }
                            maybeInvokeItem(evt.srcElement, evt);
                            break;
                        default:
                            break
                    }
                }
                function onMsPointerUp(evt) {
                    pointerUpEventObject = evt;
                    msSetImmediate(function delayedMsPointerUp() {
                        delayedPointerUp(evt)
                    })
                }
                function onMsPointerDown(evt) {
                    var leftButton = isLeftButton(evt);
                    if (leftButton) {
                        pressedElement = evt.srcElement;
                        pressedLocation.x = evt.clientX;
                        pressedLocation.y = evt.clientY
                    }
                }
                function delayedPointerUp(evt) {
                    if (isUiaClick || (pointerUpEventObject && (pointerUpEventObject.srcElement === pressedElement || (pointerUpEventObject.clientX === pressedLocation.x && pointerUpEventObject.clientY === pressedLocation.y)))) {
                        predicate = predicate || function _utilities_728(domElement) {
                            return true
                        };
                        pointerUpEventObject = null;
                        isUiaClick = false;
                        maybeInvokeItem(pressedElement, evt)
                    }
                }
                function isLeftButton(evt) {
                    return evt.button === LEFT_MSPOINTER_BUTTON
                }
                function maybeInvokeItem(domElement, evt) {
                    while (domElement) {
                        if (predicate(domElement)) {
                            break
                        }
                        domElement = domElement.parentElement
                    }
                    if (domElement && completion) {
                        completion(domElement, evt)
                    }
                }
                element.addEventListener("click", onClick);
                element.addEventListener("keydown", onKeyDown);
                element.addEventListener("MSPointerUp", onMsPointerUp);
                element.addEventListener("MSPointerDown", onMsPointerDown)
            }()
        }, isCursorKey: function isCursorKey(keyCode) {
            return keyCode === WinJS.Utilities.Key.upArrow || keyCode === WinJS.Utilities.Key.downArrow || keyCode === WinJS.Utilities.Key.leftArrow || keyCode === WinJS.Utilities.Key.rightArrow
        }, getAncestorByClassName: function getAncestorByClassName(startElement, ancestorClassName) {
            var ancestor = startElement || null;
            while (ancestor && !WinJS.Utilities.hasClass(ancestor, ancestorClassName)) {
                ancestor = ancestor.parentElement || null
            }
            return ancestor
        }, parseDataAttribute: function parseDataAttribute(attributeName, element) {
            var data = null,
                dataAttribute = element.getAttribute(attributeName);
            if (dataAttribute) {
                data = JSON.parse(dataAttribute)
            }
            return data
        }, createElement: function createElement(type, className, parent, innerText) {
            var elt = document.createElement(type);
            if (className) {
                elt.className = className
            }
            if (innerText) {
                elt.innerText = innerText
            }
            if (parent) {
                parent.appendChild(elt)
            }
            return elt
        }, createObject: function createObject(className, initializationParameter) {
            var obj = null;
            var namespaceParts = null;
            var i = 0;
            var namespace = null;
            if (className) {
                namespaceParts = className.split(".");
                if (namespaceParts && namespaceParts.length > 0) {
                    for (i = 0; i < namespaceParts.length; i++) {
                        if (i === 0) {
                            namespace = window[namespaceParts[0]]
                        }
                        else {
                            namespace = namespace[namespaceParts[i]]
                        }
                        if (!namespace) {
                            break
                        }
                    }
                    if (namespace) {
                        if (arguments.length <= 2) {
                            obj = new namespace(initializationParameter)
                        }
                        else {
                            var parameters = [];
                            for (i = 1; i < arguments.length; i++) {
                                parameters[i - 1] = arguments[i]
                            }
                            var construct = function constructFn(constructor, args) {
                                function F() {
                                    return constructor.apply(this, args)
                                }
                                F.prototype = namespace.prototype;
                                return new F
                            };
                            return construct(namespace, parameters)
                        }
                    }
                }
            }
            return obj
        }, getControl: function getControl(id) {
            var element = null;
            if (typeof id === "string") {
                element = document.getElementById(id)
            }
            else {
                element = id
            }
            if (element) {
                if (element.winControl) {
                    return element.winControl
                }
                else {
                    return null
                }
            }
            else {
                return null
            }
        }, setInnerHtml: function setInnerHtml(elem, html) {
            if (html) {
                WinJS.Utilities.setInnerHTML(elem, toStaticHTML(html))
            }
            else {
                elem.innerText = ""
            }
        }, deepCopy: function deepCopy(p, c, depth) {
            if (typeof depth === 'undefined') {
                depth = -1
            }
            c = c || new p.constructor;
            for (var i in p) {
                if (p[i] && typeof p[i] === 'object' && depth !== 0) {
                    c[i] = c[i] || new p[i].constructor;
                    PlatformJS.Utilities.deepCopy(p[i], c[i], depth - 1)
                }
                else {
                    if (c[i] !== p[i]) {
                        c[i] = p[i]
                    }
                }
            }
            return c
        }, createElements: function createElements(container, parent) {
            if (typeof container !== 'object') {
                return null
            }
            var returnArr = true;
            if (container.constructor !== Array) {
                returnArr = false;
                container = [container]
            }
            var elems = [];
            for (var i = 0; i < container.length; i++) {
                var def = container[i];
                var elem = document.createElement(def.tag);
                for (var p in def.attrs) {
                    if (p === "style") {
                        for (var c in def.attrs[p]) {
                            elem.style[c] = def.attrs[p][c]
                        }
                    }
                    else {
                        if (typeof elem[p] !== 'undefined') {
                            elem[p] = def.attrs[p]
                        }
                        else {
                            elem.setAttribute(p, def.attrs[p])
                        }
                    }
                }
                if (def.children) {
                    var children = PlatformJS.Utilities.createElements(def.children, elem)
                }
                elems.push(elem)
            }
            if (parent) {
                elems.forEach(parent.appendChild.bind(parent))
            }
            return returnArr ? elems : elems[0]
        }, getDeepObject: function getDeepObject(obj, key) {
            if (!key) {
                return obj
            }
            if (typeof key === 'string') {
                key = key.split(".")
            }
            key.forEach(function _utilities_979(k) {
                obj = obj && obj[k]
            });
            return obj
        }, setDeepObject: function setDeepObject(obj, key, value) {
            if (!key) {
                return
            }
            var old = null;
            if (typeof key === 'string') {
                old = obj[key];
                obj[key] = value;
                return old
            }
            for (var i = 0; i < key.length - 1; i++) {
                obj = obj[key[i]]
            }
            old = obj[key[key.length - 1]];
            (obj[key[key.length - 1]] = value);
            return old
        }, getResourceString: function getResourceString(key) {
            var value = null;
            var resourceValue = WinJS.Resources.getString(key);
            if (resourceValue.empty) {
                console.log("MISSING RESOURCE - " + key)
            }
            value = resourceValue.value;
            return value
        }, convertManageToJSON: function convertManageToJSON(obj) {
            var newObj = {},
                i = 0;
            var size = 0;
            if (typeof obj["size"] === "undefined" && typeof obj["indexOf"] === "undefined") {
                for (var propertyName in obj) {
                    var property = obj[propertyName];
                    if (property && typeof property === "object") {
                        if (typeof property["size"] === "undefined" && typeof property["indexOf"] === "undefined") {
                            newObj[propertyName] = PlatformJS.Utilities.convertManageToJSON(property)
                        }
                        else {
                            newObj[propertyName] = [];
                            size = property.size;
                            for (i = 0; i < size; i++) {
                                newObj[propertyName].push(PlatformJS.Utilities.convertManageToJSON(property[i]))
                            }
                        }
                    }
                    else if (typeof property !== "function") {
                        newObj[propertyName] = property
                    }
                }
            }
            else {
                newObj = [];
                size = obj.size;
                for (i = 0; i < size; i++) {
                    var arrayItem = obj[i];
                    if (typeof arrayItem === "object") {
                        newObj.push(PlatformJS.Utilities.convertManageToJSON(arrayItem))
                    }
                    else if (typeof arrayItem !== "function") {
                        newObj.push(arrayItem)
                    }
                }
            }
            return newObj
        }, _uniqueId: 0, generateUniqueId: function generateUniqueId() {
            PlatformJS.Utilities._uniqueId++;
            return "AppEx." + PlatformJS.Utilities._uniqueId + "." + (new Date).getTime()
        }, fetchImage: function fetchImage(cacheId, url, networkCallRequired) {
            return PlatformJS.Images.fetchImage(cacheId, url, networkCallRequired)
        }, saveImageForBoot: function saveImageForBoot(imageUrl, imageSource, localUrl) {
            if (imageSource && imageSource.imageTag) {
                var currentEntry = PlatformJS.BootCache.instance.getEntry(imageSource.imageTag);
                if (currentEntry) {
                    PlatformJS.Images._unsaveImageForBoot(currentEntry.url, imageSource.cacheId)
                }
                PlatformJS.BootCache.instance.addOrUpdateEntry(imageSource.imageTag, {
                    url: imageUrl, localUrl: localUrl
                });
                return PlatformJS.Images._saveImageForBoot(imageUrl, imageSource.cacheId)
            }
            else {
                throw new Error("ImafeSource cannot be null and must have an imageTag to save the image");
            }
        }, downloadFile: function downloadFile(cacheID, uri) {
            var promise = PlatformJS.Cache.CacheService.getInstance(cacheID).findEntry(uri, { fileNameOnly: true }).then(function cache_completion(response) {
                if (response && !response.isStale() && response.dataValue) {
                    return response.dataValue
                }
                else {
                    return PlatformJS.Utilities.fetchImage(cacheID, uri, null)
                }
            });
            return promise
        }, _hasInternetConnectionPlatformNotInitialized: function _hasInternetConnectionPlatformNotInitialized() {
            msWriteProfilerMark("_hasInternetConnectionPlatformNotInitialized");
            return true
        }, _isHighCostConnectionPlatformNotInitialized: function _isHighCostConnectionPlatformNotInitialized() {
            msWriteProfilerMark("_isHighCostConnectionPlatformNotInitialized");
            return false
        }, hasInternetConnection: function hasInternetConnection() {
            if (!PlatformJS.isPlatformInitialized) {
                return PlatformJS.Utilities._hasInternetConnectionPlatformNotInitialized()
            }
            msWriteProfilerMark("hasInternetConnection:s");
            var windowsNetworking = Windows.Networking.Connectivity;
            var connectionProfile = null;
            try {
                connectionProfile = this.getInternetConnectionProfile()
            }
            catch (e) { }
            var hasInternetAccess = (connectionProfile !== null) && (connectionProfile.getNetworkConnectivityLevel() === windowsNetworking.NetworkConnectivityLevel.internetAccess);
            var disableNetworkForPrelaunch = true;
            try {
                disableNetworkForPrelaunch = PlatformJS.BootCache.instance.getEntry("DisableNetworkForPrelaunch", function getConfiguration_disableNetworkForPrelaunch() {
                    return Platform.Configuration.ConfigurationManager.instance.disableNetworkForPrelaunch
                })
            }
            catch (err) { }
            var prelaunchNetworkAccess = (!PlatformJS.isPrelaunched || !disableNetworkForPrelaunch);
            var result = !PlatformJS.Utilities.Globalization.isEmbargoed && hasInternetAccess && prelaunchNetworkAccess;
            msWriteProfilerMark("hasInternetConnection:e");
            return result
        }, isHighCostConnection: function isHighCostConnection() {
            if (!PlatformJS.isPlatformInitialized) {
                return PlatformJS.Utilities._isHighCostConnectionPlatformNotInitialized()
            }
            msWriteProfilerMark("isHighCostConnection:s");
            var isHighCost = true;
            var connectionProfile = null;
            try {
                connectionProfile = this.getInternetConnectionProfile()
            }
            catch (e) { }
            if (connectionProfile) {
                var connectionCost = connectionProfile.getConnectionCost();
                isHighCost = (!connectionCost || connectionCost.roaming || connectionCost.overDataLimit)
            }
            msWriteProfilerMark("isHighCostConnection:e");
            return isHighCost
        }, getSquarePeekImageAndText04: function getSquarePeekImageAndText04(imageLogo, text) {
            var squareTileXml = Windows.UI.Notifications.TileUpdateManager.getTemplateContent(Windows.UI.Notifications.TileTemplateType.tileSquare150x150PeekImageAndText04);
            var attributes = squareTileXml.getElementsByTagName("image");
            if (attributes && attributes.length > 0) {
                attributes[0].setAttribute("src", imageLogo)
            }
            attributes = squareTileXml.getElementsByTagName("text");
            if (attributes && attributes.length > 0) {
                attributes[0].appendChild(squareTileXml.createTextNode(text))
            }
            return squareTileXml
        }, getSquareImage: function getSquareImage(imageLogo) {
            var squareTileXml = Windows.UI.Notifications.TileUpdateManager.getTemplateContent(Windows.UI.Notifications.TileTemplateType.tileSquare150x150Image);
            var attributes = squareTileXml.getElementsByTagName("image");
            if (attributes && attributes.length > 0) {
                attributes[0].setAttribute("src", imageLogo)
            }
            return squareTileXml
        }, _textDirectionInstance: null, getTextDirection: function getTextDirection(text) {
            if (PlatformJS.Utilities._textDirectionInstance === null) {
                PlatformJS.Utilities._textDirectionInstance = new PlatformJS.Utilities.TextDirection
            }
            return PlatformJS.Utilities._textDirectionInstance.getTextDirection(text)
        }, fixupBidiTextNodesWorker: function fixupBidiTextNodesWorker(node) {
            function fixupBidiPunctuation(text) {
                var directionText = PlatformJS.Utilities.getTextDirection(text);
                var result = text + ((directionText === "ltr") ? "\u200E" : "\u200F");
                return result
            }
            var nodeText = "";
            if (node) {
                if (node.nodeType === 3) {
                    node.data = fixupBidiPunctuation(node.data)
                }
                else if ((node.nodeType === 1 || node.nodeType === 9) && node.childNodes) {
                    var nodeTagName = node.tagName.toUpperCase();
                    if (!(nodeTagName === "SCRIPT") && !(nodeTagName === "STYLE")) {
                        for (var i = 0; i < node.childNodes.length; i++) {
                            this.fixupBidiTextNodesWorker(node.childNodes[i])
                        }
                    }
                }
            }
        }, fixupBidiTextNodes: function fixupBidiTextNodes(htmlText, parser) {
            var result = htmlText;
            if (parser) {
                var descDom = parser.parseFromString(htmlText, "text/html");
                if (descDom.body) {
                    this.fixupBidiTextNodesWorker(descDom.body);
                    result = descDom.body.innerHTML
                }
            }
            return result
        }, convertMarketToLanguageCode: function convertMarketToLanguageCode(marketcode) {
            var lookup;
            if (marketcode) {
                lookup = PlatformJS.Services.configuration.getDictionary("MarketToLanguageDictionary").getString(marketcode.toLowerCase())
            }
            return lookup || marketcode
        }, DisplayData: WinJS.Class.define(function displayData_ctor() {
            var that = this;
            this._currentData = {};
            WinJS.Utilities.ready(function _utilities_1253() {
                if (!that._initalized) {
                    that._compute()
                }
            });
            CommonJS.WindowEventManager.addEventListener(CommonJS.WindowEventManager.Events.PLATFORM_RESIZE, function displayData_onResize(event) {
                console.log("DisplayData computing size information due to resize event");
                if (!that._compute()) {
                    event.preventDefault()
                }
            })
        }, {
            clientWidth: {
                get: function get() {
                    if (!this._initalized) {
                        this._compute()
                    }
                    ;
                    return this._currentData._clientWidth
                }
            }, hasClientWidthChanged: function hasClientWidthChanged() {
                if (!this._initalized) {
                    this._compute()
                }
                ;
                if (!this._currentData) {
                    debugger;
                    return false
                }
                if (!this._previousData) {
                    return true
                }
                return this._currentData._clientWidth !== this._previousData._clientWidth
            }, clientHeight: {
                get: function get() {
                    if (!this._initalized) {
                        this._compute()
                    }
                    ;
                    return this._currentData._clientHeight
                }
            }, hasClientHeightChanged: function hasClientHeightChanged() {
                if (!this._initalized) {
                    this._compute()
                }
                ;
                if (!this._currentData) {
                    debugger;
                    return false
                }
                if (!this._previousData) {
                    return true
                }
                return this._currentData._clientHeight !== this._previousData._clientHeight
            }, offsetWidth: {
                get: function get() {
                    if (!this._initalized) {
                        this._compute()
                    }
                    ;
                    return this._currentData._offsetWidth
                }
            }, hasOffsetWidthChanged: function hasOffsetWidthChanged() {
                if (!this._initalized) {
                    this._compute()
                }
                ;
                if (!this._currentData) {
                    debugger;
                    return false
                }
                if (!this._previousData) {
                    return true
                }
                return this._currentData._offsetWidth !== this._previousData._offsetWidth
            }, offsetHeight: {
                get: function get() {
                    if (!this._initalized) {
                        this._compute()
                    }
                    ;
                    return this._currentData._offsetHeight
                }
            }, hasOffsetHeightChanged: function hasOffsetHeightChanged() {
                if (!this._initalized) {
                    this._compute()
                }
                ;
                if (!this._currentData) {
                    debugger;
                    return false
                }
                if (!this._previousData) {
                    return true
                }
                return this._currentData._offsetHeight !== this._previousData._offsetHeight
            }, width: {
                get: function get() {
                    if (!this._initalized) {
                        this._compute()
                    }
                    ;
                    return this._currentData._width
                }
            }, height: {
                get: function get() {
                    if (!this._initalized) {
                        this._compute()
                    }
                    ;
                    return this._currentData._height
                }
            }, scale: {
                get: function get() {
                    if (!this._initalized) {
                        this._compute()
                    }
                    ;
                    return this._currentData._scale
                }
            }, longerLength: {
                get: function get() {
                    if (!this._initalized) {
                        this._compute()
                    }
                    ;
                    return this._currentData._longerLength
                }
            }, shorterLength: {
                get: function get() {
                    if (!this._initalized) {
                        this._compute()
                    }
                    ;
                    return this._currentData._shorterLength
                }
            }, outerHeight: {
                get: function get() {
                    if (!this._initalized) {
                        this._compute()
                    }
                    ;
                    return this._currentData._outerHeight
                }
            }, hasOuterHeightChanged: function hasOuterHeightChanged() {
                if (!this._initalized) {
                    this._compute()
                }
                ;
                if (!this._currentData) {
                    debugger;
                    return false
                }
                if (!this._previousData) {
                    return true
                }
                return this._currentData._outerHeight !== this._previousData._outerHeight
            }, outerWidth: {
                get: function get() {
                    if (!this._initalized) {
                        this._compute()
                    }
                    ;
                    return this._currentData._outerWidth
                }
            }, hasOuterWidthChanged: function hasOuterWidthChanged() {
                if (!this._initalized) {
                    this._compute()
                }
                ;
                if (!this._currentData) {
                    debugger;
                    return false
                }
                if (!this._previousData) {
                    return true
                }
                return this._currentData._outerWidth !== this._previousData._outerWidth
            }, innerHeight: {
                get: function get() {
                    if (!this._initalized) {
                        this._compute()
                    }
                    ;
                    return this._currentData._innerHeight
                }
            }, hasInnerHeightChanged: function hasInnerHeightChanged() {
                if (!this._initalized) {
                    this._compute()
                }
                ;
                if (!this._currentData) {
                    debugger;
                    return false
                }
                if (!this._previousData) {
                    return true
                }
                return this._currentData._innerHeight !== this._previousData._innerHeight
            }, innerWidth: {
                get: function get() {
                    if (!this._initalized) {
                        this._compute()
                    }
                    ;
                    return this._currentData._innerWidth
                }
            }, hasInnerWidthChanged: function hasInnerWidthChanged() {
                if (!this._initalized) {
                    this._compute()
                }
                ;
                if (!this._currentData) {
                    debugger;
                    return false
                }
                if (!this._previousData) {
                    return true
                }
                return this._currentData._innerWidth !== this._previousData._innerWidth
            }, orientation: {
                get: function get() {
                    if (!this._initalized) {
                        this._compute()
                    }
                    ;
                    return this._currentData._orientation
                }
            }, hasOrientationChanged: function hasOrientationChanged() {
                if (!this._initalized) {
                    this._compute()
                }
                ;
                if (!this._currentData) {
                    debugger;
                    return false
                }
                if (!this._previousData) {
                    return true
                }
                return this._currentData._orientation !== this._previousData._orientation
            }, landscape: {
                get: function get() {
                    if (!this._initalized) {
                        this._compute()
                    }
                    ;
                    return this._currentData._landscape
                }
            }, isFullScreen: {
                get: function get() {
                    if (!this._initalized) {
                        this._compute()
                    }
                    ;
                    return this._currentData._isFullScreen
                }
            }, hasFullScreenChanged: function hasFullScreenChanged() {
                if (!this._initalized) {
                    this._compute()
                }
                ;
                if (!this._currentData) {
                    debugger;
                    return false
                }
                if (!this._previousData) {
                    return true
                }
                return this._currentData._isFullScreen !== this._previousData._isFullScreen
            }, _previousData: null, _currentData: null, _initalized: false, _isASimpleRotate: function _isASimpleRotate() {
                var view = Windows.UI.ViewManagement.ApplicationView.getForCurrentView();
                return (this._initalized && this._currentData._isFullScreen && view.isFullScreen && this._currentData._orientation !== view.orientation && this._currentData._outerHeight === window.outerWidth && this._currentData._outerWidth === window.outerHeight && this._currentData._scale === Windows.Graphics.Display.DisplayProperties.resolutionScale)
            }, _rotateData: function _rotateData() {
                this._previousData = this._currentData;
                this._currentData = {};
                var view = Windows.UI.ViewManagement.ApplicationView.getForCurrentView();
                this._currentData._isFullScreen = view.isFullScreen;
                this._currentData._orientation = view.orientation;
                this._currentData._landscape = this._currentData._orientation === Windows.UI.ViewManagement.ApplicationViewOrientation.landscape;
                if (!this._previousData._isFullScreen || !this._currentData._isFullScreen) {
                    debugger
                }
                this._currentData._offsetWidth = this._previousData._offsetHeight;
                this._currentData._offsetHeight = this._previousData._offsetWidth;
                this._currentData._clientWidth = this._previousData._clientHeight;
                this._currentData._clientHeight = this._previousData._clientWidth;
                this._currentData._outerHeight = this._previousData._outerWidth;
                this._currentData._outerWidth = this._previousData._outerHeight;
                this._currentData._innerHeight = this._previousData._innerWidth;
                this._currentData._innerWidth = this._previousData._innerHeight;
                this._currentData._longerLength = this._previousData._longerLength;
                this._currentData._shorterLength = this._previousData._shorterLength;
                this._currentData._width = this._previousData._width;
                this._currentData._height = this._previousData._height;
                this._currentData._scale = this._previousData._scale
            }, _compute: function _compute() {
                if (this._isASimpleRotate()) {
                    this._rotateData();
                    return true
                }
                this._previousData = this._currentData;
                if (!document || !document.body || !document.body.offsetWidth) {
                    return false
                }
                this._initalized = true;
                this._currentData = {};
                var view = Windows.UI.ViewManagement.ApplicationView.getForCurrentView();
                this._currentData._isFullScreen = view.isFullScreen;
                this._currentData._orientation = view.orientation;
                this._currentData._landscape = this._currentData._orientation === Windows.UI.ViewManagement.ApplicationViewOrientation.landscape;
                this._currentData._offsetWidth = document.body.offsetWidth;
                this._currentData._offsetHeight = document.body.offsetHeight;
                this._currentData._clientWidth = document.body.clientWidth;
                this._currentData._clientHeight = document.body.clientHeight;
                this._currentData._outerHeight = window.outerHeight;
                this._currentData._outerWidth = window.outerWidth;
                this._currentData._innerHeight = window.innerHeight;
                this._currentData._innerWidth = window.innerWidth;
                this._currentData._longerLength = Math.max(window.outerWidth, window.outerHeight);
                this._currentData._shorterLength = Math.min(window.outerWidth, window.outerHeight);
                this._currentData._width = Math.max(this._currentData._clientWidth, this._currentData._clientHeight);
                this._currentData._height = Math.min(this._currentData._clientWidth, this._currentData._clientHeight);
                this._currentData._scale = Windows.Graphics.Display.DisplayProperties.resolutionScale;
                if (this._currentData._scale > 100) {
                    this._currentData._width = Math.ceil(this._currentData._width * (this._currentData._scale / 100.0));
                    this._currentData._height = Math.ceil(this._currentData._height * (this._currentData._scale / 100.0))
                }
                return !(this._previousData.oldOffsetWidth === this._currentData._offsetWidth && this._previousData.oldOffsetHeight === this._currentData._offsetHeight && this._previousData.oldClientWidth === this._currentData._clientWidth && this._previousData.oldClientHeight === this._currentData._clientHeight && this._previousData.oldOuterHeight === this._currentData._outerHeight && this._previousData.oldOuterWidth === this._currentData._outerWidth && this._previousData.oldInnerHeight === this._currentData._innerHeight && this._previousData.oldInnerWidth === this._currentData._innerWidth)
            }
        }), _displayData: null, getDisplayData: function getDisplayData(forceRecalc) {
            if (!PlatformJS.Utilities._displayData) {
                PlatformJS.Utilities._displayData = new PlatformJS.Utilities.DisplayData
            }
            var data = PlatformJS.Utilities._displayData;
            if (forceRecalc) {
                data._compute()
            }
            return data
        }, TextDirection: WinJS.Class.define(function textDirection_ctor() {
            this._rangeLookup = {
                0: 0, 65: 1, 91: 0, 97: 1, 123: 0, 170: 1, 171: 0, 181: 1, 182: 0, 186: 1, 187: 0, 192: 1, 215: 0, 216: 1, 247: 0, 248: 1, 697: 0, 699: 1, 706: 0, 720: 1, 722: 0, 736: 1, 741: 0, 750: 1, 751: 0, 880: 1, 884: 0, 886: 1, 888: 0, 890: 1, 894: 0, 895: 0, 900: 0, 902: 1, 903: 0, 904: 1, 907: 0, 908: 1, 909: 0, 910: 1, 930: 0, 931: 1, 1014: 0, 1015: 1, 1155: 0, 1162: 1, 1320: 0, 1329: 1, 1367: 0, 1369: 1, 1376: 0, 1377: 1, 1416: 0, 1417: 1, 1418: 0, 1419: 0, 1425: 0, 1470: 2, 1471: 0, 1472: 2, 1473: 0, 1475: 2, 1476: 0, 1478: 2, 1479: 0, 1480: 0, 1488: 2, 1515: 0, 1520: 2, 1525: 0, 1536: 2, 1540: 0, 1542: 0, 1544: 2, 1545: 0, 1547: 2, 1548: 0, 1549: 2, 1550: 0, 1563: 2, 1564: 0, 1566: 2, 1611: 0, 1632: 2, 1642: 0, 1643: 2, 1648: 0, 1649: 2, 1750: 0, 1757: 2, 1758: 0, 1765: 2, 1767: 0, 1774: 2, 1776: 0, 1786: 2, 1806: 0, 1807: 2, 1809: 0, 1810: 2, 1840: 0, 1867: 0, 1869: 2, 1958: 0, 1969: 2, 1970: 0, 1984: 2, 2027: 0, 2036: 2, 2038: 0, 2042: 2, 2043: 0, 2048: 2, 2070: 0, 2074: 2, 2075: 0, 2084: 2, 2085: 0, 2088: 2, 2089: 0, 2094: 0, 2096: 2, 2111: 0, 2112: 2, 2137: 0, 2140: 0, 2142: 2, 2143: 0, 2304: 0, 2307: 1, 2362: 0, 2363: 1, 2364: 0, 2365: 1, 2369: 0, 2377: 1, 2381: 0, 2382: 1, 2385: 0, 2392: 1, 2402: 0, 2404: 1, 2424: 0, 2425: 1, 2432: 0, 2433: 0, 2434: 1, 2436: 0, 2437: 1, 2445: 0, 2447: 1, 2449: 0, 2451: 1, 2473: 0, 2474: 1, 2481: 0, 2482: 1, 2483: 0, 2486: 1, 2490: 0, 2492: 0, 2493: 1, 2497: 0, 2501: 0, 2503: 1, 2505: 0, 2507: 1, 2509: 0, 2510: 1, 2511: 0, 2519: 1, 2520: 0, 2524: 1, 2526: 0, 2527: 1, 2530: 0, 2532: 0, 2534: 1, 2546: 0, 2548: 1, 2555: 0, 2556: 0, 2561: 0, 2563: 1, 2564: 0, 2565: 1, 2571: 0, 2575: 1, 2577: 0, 2579: 1, 2601: 0, 2602: 1, 2609: 0, 2610: 1, 2612: 0, 2613: 1, 2615: 0, 2616: 1, 2618: 0, 2620: 0, 2621: 0, 2622: 1, 2625: 0, 2627: 0, 2631: 0, 2633: 0, 2635: 0, 2638: 0, 2641: 0, 2642: 0, 2649: 1, 2653: 0, 2654: 1, 2655: 0, 2662: 1, 2672: 0, 2674: 1, 2677: 0, 2678: 0, 2689: 0, 2691: 1, 2692: 0, 2693: 1, 2702: 0, 2703: 1, 2706: 0, 2707: 1, 2729: 0, 2730: 1, 2737: 0, 2738: 1, 2740: 0, 2741: 1, 2746: 0, 2748: 0, 2749: 1, 2753: 0, 2758: 0, 2759: 0, 2761: 1, 2762: 0, 2763: 1, 2765: 0, 2766: 0, 2768: 1, 2769: 0, 2784: 1, 2786: 0, 2788: 0, 2790: 1, 2800: 0, 2801: 0, 2802: 0, 2817: 0, 2818: 1, 2820: 0, 2821: 1, 2829: 0, 2831: 1, 2833: 0, 2835: 1, 2857: 0, 2858: 1, 2865: 0, 2866: 1, 2868: 0, 2869: 1, 2874: 0, 2876: 0, 2877: 1, 2879: 0, 2880: 1, 2881: 0, 2885: 0, 2887: 1, 2889: 0, 2891: 1, 2893: 0, 2894: 0, 2902: 0, 2903: 1, 2904: 0, 2908: 1, 2910: 0, 2911: 1, 2914: 0, 2916: 0, 2918: 1, 2936: 0, 2946: 0, 2947: 1, 2948: 0, 2949: 1, 2955: 0, 2958: 1, 2961: 0, 2962: 1, 2966: 0, 2969: 1, 2971: 0, 2972: 1, 2973: 0, 2974: 1, 2976: 0, 2979: 1, 2981: 0, 2984: 1, 2987: 0, 2990: 1, 3002: 0, 3006: 1, 3008: 0, 3009: 1, 3011: 0, 3014: 1, 3017: 0, 3018: 1, 3021: 0, 3022: 0, 3024: 1, 3025: 0, 3031: 1, 3032: 0, 3046: 1, 3059: 0, 3067: 0, 3073: 1, 3076: 0, 3077: 1, 3085: 0, 3086: 1, 3089: 0, 3090: 1, 3113: 0, 3114: 1, 3124: 0, 3125: 1, 3130: 0, 3133: 1, 3134: 0, 3137: 1, 3141: 0, 3142: 0, 3145: 0, 3146: 0, 3150: 0, 3157: 0, 3159: 0, 3160: 1, 3162: 0, 3168: 1, 3170: 0, 3172: 0, 3174: 1, 3184: 0, 3192: 0, 3199: 1, 3200: 0, 3202: 1, 3204: 0, 3205: 1, 3213: 0, 3214: 1, 3217: 0, 3218: 1, 3241: 0, 3242: 1, 3252: 0, 3253: 1, 3258: 0, 3260: 0, 3261: 1, 3269: 0, 3270: 1, 3273: 0, 3274: 1, 3276: 0, 3278: 0, 3285: 1, 3287: 0, 3294: 1, 3295: 0, 3296: 1, 3298: 0, 3300: 0, 3302: 1, 3312: 0, 3313: 1, 3315: 0, 3330: 1, 3332: 0, 3333: 1, 3341: 0, 3342: 1, 3345: 0, 3346: 1, 3387: 0, 3389: 1, 3393: 0, 3397: 0, 3398: 1, 3401: 0, 3402: 1, 3405: 0, 3406: 1, 3407: 0, 3415: 1, 3416: 0, 3424: 1, 3426: 0, 3428: 0, 3430: 1, 3446: 0, 3449: 1, 3456: 0, 3458: 1, 3460: 0, 3461: 1, 3479: 0, 3482: 1, 3506: 0, 3507: 1, 3516: 0, 3517: 1, 3518: 0, 3520: 1, 3527: 0, 3530: 0, 3531: 0, 3535: 1, 3538: 0, 3541: 0, 3542: 0, 3543: 0, 3544: 1, 3552: 0, 3570: 1, 3573: 0, 3585: 1, 3633: 0, 3634: 1, 3636: 0, 3643: 0, 3647: 0, 3648: 1, 3655: 0, 3663: 1, 3676: 0, 3713: 1, 3715: 0, 3716: 1, 3717: 0, 3719: 1, 3721: 0, 3722: 1, 3723: 0, 3725: 1, 3726: 0, 3732: 1, 3736: 0, 3737: 1, 3744: 0, 3745: 1, 3748: 0, 3749: 1, 3750: 0, 3751: 1, 3752: 0, 3754: 1, 3756: 0, 3757: 1, 3761: 0, 3762: 1, 3764: 0, 3770: 0, 3771: 0, 3773: 1, 3774: 0, 3776: 1, 3781: 0, 3782: 1, 3783: 0, 3784: 0, 3790: 0, 3792: 1, 3802: 0, 3804: 1, 3806: 0, 3840: 1, 3864: 0, 3866: 1, 3893: 0, 3894: 1, 3895: 0, 3896: 1, 3897: 0, 3902: 1, 3912: 0, 3913: 1, 3949: 0, 3953: 0, 3967: 1, 3968: 0, 3973: 1, 3974: 0, 3976: 1, 3981: 0, 3992: 0, 3993: 0, 4029: 0, 4030: 1, 4038: 0, 4039: 1, 4045: 0, 4046: 1, 4059: 0, 4096: 1, 4141: 0, 4145: 1, 4146: 0, 4152: 1, 4153: 0, 4155: 1, 4157: 0, 4159: 1, 4184: 0, 4186: 1, 4190: 0, 4193: 1, 4209: 0, 4213: 1, 4226: 0, 4227: 1, 4229: 0, 4231: 1, 4237: 0, 4238: 1, 4253: 0, 4254: 1, 4294: 0, 4304: 1, 4349: 0, 4352: 1, 4681: 0, 4682: 1, 4686: 0, 4688: 1, 4695: 0, 4696: 1, 4697: 0, 4698: 1, 4702: 0, 4704: 1, 4745: 0, 4746: 1, 4750: 0, 4752: 1, 4785: 0, 4786: 1, 4790: 0, 4792: 1, 4799: 0, 4800: 1, 4801: 0, 4802: 1, 4806: 0, 4808: 1, 4823: 0, 4824: 1, 4881: 0, 4882: 1, 4886: 0, 4888: 1, 4955: 0, 4957: 0, 4960: 1, 4989: 0, 4992: 1, 5008: 0, 5018: 0, 5024: 1, 5109: 0, 5120: 0, 5121: 1, 5760: 0, 5761: 1, 5787: 0, 5789: 0, 5792: 1, 5873: 0, 5888: 1, 5901: 0, 5902: 1, 5906: 0, 5909: 0, 5920: 1, 5938: 0, 5941: 1, 5943: 0, 5952: 1, 5970: 0, 5972: 0, 5984: 1, 5997: 0, 5998: 1, 6001: 0, 6002: 0, 6004: 0, 6016: 1, 6071: 0, 6078: 1, 6086: 0, 6087: 1, 6089: 0, 6100: 1, 6107: 0, 6108: 1, 6109: 0, 6110: 0, 6112: 1, 6122: 0, 6128: 0, 6138: 0, 6144: 0, 6159: 0, 6160: 1, 6170: 0, 6176: 1, 6264: 0, 6272: 1, 6313: 0, 6314: 1, 6315: 0, 6320: 1, 6390: 0, 6400: 1, 6429: 0, 6432: 0, 6435: 1, 6439: 0, 6441: 1, 6444: 0, 6448: 1, 6450: 0, 6451: 1, 6457: 0, 6460: 0, 6464: 0, 6465: 0, 6468: 0, 6470: 1, 6510: 0, 6512: 1, 6517: 0, 6528: 1, 6572: 0, 6576: 1, 6602: 0, 6608: 1, 6619: 0, 6622: 0, 6656: 1, 6679: 0, 6681: 1, 6684: 0, 6686: 1, 6742: 0, 6743: 1, 6744: 0, 6751: 0, 6752: 0, 6753: 1, 6754: 0, 6755: 1, 6757: 0, 6765: 1, 6771: 0, 6781: 0, 6783: 0, 6784: 1, 6794: 0, 6800: 1, 6810: 0, 6816: 1, 6830: 0, 6912: 0, 6916: 1, 6964: 0, 6965: 1, 6966: 0, 6971: 1, 6972: 0, 6973: 1, 6978: 0, 6979: 1, 6988: 0, 6992: 1, 7019: 0, 7028: 1, 7037: 0, 7040: 0, 7042: 1, 7074: 0, 7078: 1, 7080: 0, 7082: 1, 7083: 0, 7086: 1, 7098: 0, 7104: 1, 7142: 0, 7143: 1, 7144: 0, 7146: 1, 7149: 0, 7150: 1, 7151: 0, 7154: 1, 7156: 0, 7164: 1, 7212: 0, 7220: 1, 7222: 0, 7224: 0, 7227: 1, 7242: 0, 7245: 1, 7296: 0, 7376: 0, 7379: 1, 7380: 0, 7393: 1, 7394: 0, 7401: 1, 7405: 0, 7406: 1, 7411: 0, 7424: 1, 7616: 0, 7655: 0, 7676: 0, 7680: 1, 7958: 0, 7960: 1, 7966: 0, 7968: 1, 8006: 0, 8008: 1, 8014: 0, 8016: 1, 8024: 0, 8025: 1, 8026: 0, 8027: 1, 8028: 0, 8029: 1, 8030: 0, 8031: 1, 8062: 0, 8064: 1, 8117: 0, 8118: 1, 8125: 0, 8126: 1, 8127: 0, 8130: 1, 8133: 0, 8134: 1, 8141: 0, 8144: 1, 8148: 0, 8150: 1, 8156: 0, 8157: 0, 8160: 1, 8173: 0, 8176: 0, 8178: 1, 8181: 0, 8182: 1, 8189: 0, 8191: 0, 8192: 0, 8206: 1, 8207: 2, 8208: 0, 8234: 1, 8235: 2, 8236: 0, 8237: 1, 8238: 2, 8239: 0, 8293: 0, 8298: 0, 8305: 1, 8306: 0, 8308: 0, 8319: 1, 8320: 0, 8335: 0, 8336: 1, 8349: 0, 8352: 0, 8378: 0, 8400: 0, 8433: 0, 8448: 0, 8450: 1, 8451: 0, 8455: 1, 8456: 0, 8458: 1, 8468: 0, 8469: 1, 8470: 0, 8473: 1, 8478: 0, 8484: 1, 8485: 0, 8486: 1, 8487: 0, 8488: 1, 8489: 0, 8490: 1, 8494: 0, 8495: 1, 8506: 0, 8508: 1, 8512: 0, 8517: 1, 8522: 0, 8526: 1, 8528: 0, 8544: 1, 8585: 0, 8586: 0, 8592: 0, 9014: 1, 9083: 0, 9109: 1, 9110: 0, 9204: 0, 9216: 0, 9255: 0, 9280: 0, 9291: 0, 9312: 0, 9372: 1, 9450: 0, 9900: 1, 9901: 0, 9984: 0, 9985: 0, 10187: 0, 10188: 0, 10189: 0, 10190: 0, 10240: 1, 10496: 0, 11085: 0, 11088: 0, 11098: 0, 11264: 1, 11311: 0, 11312: 1, 11359: 0, 11360: 1, 11493: 0, 11499: 1, 11503: 0, 11506: 0, 11513: 0, 11520: 1, 11558: 0, 11568: 1, 11622: 0, 11631: 1, 11633: 0, 11647: 0, 11648: 1, 11671: 0, 11680: 1, 11687: 0, 11688: 1, 11695: 0, 11696: 1, 11703: 0, 11704: 1, 11711: 0, 11712: 1, 11719: 0, 11720: 1, 11727: 0, 11728: 1, 11735: 0, 11736: 1, 11743: 0, 11744: 0, 11826: 0, 11904: 0, 11930: 0, 11931: 0, 12020: 0, 12032: 0, 12246: 0, 12272: 0, 12284: 0, 12288: 0, 12293: 1, 12296: 0, 12321: 1, 12330: 0, 12337: 1, 12342: 0, 12344: 1, 12349: 0, 12352: 0, 12353: 1, 12439: 0, 12441: 0, 12445: 1, 12448: 0, 12449: 1, 12539: 0, 12540: 1, 12544: 0, 12549: 1, 12590: 0, 12593: 1, 12687: 0, 12688: 1, 12731: 0, 12736: 0, 12772: 0, 12784: 1, 12829: 0, 12831: 0, 12832: 1, 12880: 0, 12896: 1, 12924: 0, 12927: 1, 12977: 0, 12992: 1, 13004: 0, 13008: 1, 13055: 0, 13056: 1, 13175: 0, 13179: 1, 13278: 0, 13280: 1, 13311: 0, 13312: 1, 13313: 0, 19893: 1, 19894: 0, 19904: 0, 19968: 1, 19969: 0, 40907: 1, 40908: 0, 40960: 1, 42125: 0, 42128: 0, 42183: 0, 42192: 1, 42509: 0, 42512: 1, 42540: 0, 42560: 1, 42607: 0, 42612: 0, 42620: 0, 42624: 1, 42648: 0, 42656: 1, 42736: 0, 42738: 1, 42744: 0, 42752: 0, 42786: 1, 42888: 0, 42889: 1, 42895: 0, 42896: 1, 42898: 0, 42912: 1, 42922: 0, 43002: 1, 43010: 0, 43011: 1, 43014: 0, 43015: 1, 43019: 0, 43020: 1, 43045: 0, 43047: 1, 43048: 0, 43052: 0, 43056: 1, 43064: 0, 43066: 0, 43072: 1, 43124: 0, 43128: 0, 43136: 1, 43204: 0, 43205: 0, 43214: 1, 43226: 0, 43232: 0, 43250: 1, 43260: 0, 43264: 1, 43302: 0, 43310: 1, 43335: 0, 43346: 1, 43348: 0, 43359: 1, 43389: 0, 43392: 0, 43395: 1, 43443: 0, 43444: 1, 43446: 0, 43450: 1, 43452: 0, 43453: 1, 43470: 0, 43471: 1, 43482: 0, 43486: 1, 43488: 0, 43520: 1, 43561: 0, 43567: 1, 43569: 0, 43571: 1, 43573: 0, 43575: 0, 43584: 1, 43587: 0, 43588: 1, 43596: 0, 43597: 1, 43598: 0, 43600: 1, 43610: 0, 43612: 1, 43644: 0, 43648: 1, 43696: 0, 43697: 1, 43698: 0, 43701: 1, 43703: 0, 43705: 1, 43710: 0, 43712: 1, 43713: 0, 43714: 1, 43715: 0, 43739: 1, 43744: 0, 43777: 1, 43783: 0, 43785: 1, 43791: 0, 43793: 1, 43799: 0, 43808: 1, 43815: 0, 43816: 1, 43823: 0, 43968: 1, 44005: 0, 44006: 1, 44008: 0, 44009: 1, 44013: 0, 44014: 0, 44016: 1, 44026: 0, 44032: 1, 44033: 0, 55203: 1, 55204: 0, 55216: 1, 55239: 0, 55243: 1, 55292: 0, 55296: 1, 55297: 0, 56191: 1, 56193: 0, 56319: 1, 56321: 0, 57343: 1, 57345: 0, 63743: 1, 64046: 0, 64048: 1, 64110: 0, 64112: 1, 64218: 0, 64256: 1, 64263: 0, 64275: 1, 64280: 0, 64285: 2, 64286: 0, 64287: 2, 64297: 0, 64298: 2, 64311: 0, 64312: 2, 64317: 0, 64318: 2, 64319: 0, 64320: 2, 64322: 0, 64323: 2, 64325: 0, 64326: 2, 64450: 0, 64467: 2, 64830: 0, 64832: 0, 64848: 2, 64912: 0, 64914: 2, 64968: 0, 65008: 2, 65021: 0, 65022: 0, 65024: 0, 65050: 0, 65056: 0, 65063: 0, 65072: 0, 65107: 0, 65108: 0, 65127: 0, 65128: 0, 65132: 0, 65136: 2, 65141: 0, 65142: 2, 65277: 0, 65279: 0, 65280: 0, 65281: 0, 65313: 1, 65339: 0, 65345: 1, 65371: 0, 65382: 1, 65471: 0, 65474: 1, 65480: 0, 65482: 1, 65488: 0, 65490: 1, 65496: 0, 65498: 1, 65501: 0, 65504: 0, 65511: 0, 65512: 0, 65519: 0, 65529: 0, 65534: 0, 65536: 1, 65548: 0, 65549: 1, 65575: 0, 65576: 1, 65595: 0, 65596: 1, 65598: 0, 65599: 1, 65614: 0, 65616: 1, 65630: 0, 65664: 1, 65787: 0, 65792: 1, 65793: 0, 65794: 1, 65795: 0, 65799: 1, 65844: 0, 65847: 1, 65856: 0, 65931: 0, 65936: 0, 65948: 0, 66000: 1, 66045: 0, 66046: 0, 66176: 1, 66205: 0, 66208: 1, 66257: 0, 66304: 1, 66335: 0, 66336: 1, 66340: 0, 66352: 1, 66379: 0, 66432: 1, 66462: 0, 66463: 1, 66500: 0, 66504: 1, 66518: 0, 66560: 1, 66718: 0, 66720: 1, 66730: 0, 67584: 2, 67590: 0, 67592: 2, 67593: 0, 67594: 2, 67638: 0, 67639: 2, 67641: 0, 67644: 2, 67645: 0, 67647: 2, 67670: 0, 67671: 2, 67680: 0, 67840: 2, 67868: 0, 67871: 0, 67872: 2, 67898: 0, 67903: 2, 67904: 0, 68096: 2, 68097: 0, 68100: 0, 68101: 0, 68103: 0, 68108: 0, 68112: 2, 68116: 0, 68117: 2, 68120: 0, 68121: 2, 68148: 0, 68152: 0, 68155: 0, 68159: 0, 68160: 2, 68168: 0, 68176: 2, 68185: 0, 68192: 2, 68224: 0, 68352: 2, 68406: 0, 68409: 0, 68416: 2, 68438: 0, 68440: 2, 68467: 0, 68472: 2, 68480: 0, 68608: 2, 68681: 0, 69216: 2, 69247: 0, 69632: 1, 69633: 0, 69634: 1, 69688: 0, 69703: 1, 69710: 0, 69714: 0, 69734: 1, 69744: 0, 69760: 0, 69762: 1, 69811: 0, 69815: 1, 69817: 0, 69819: 1, 69826: 0, 73728: 1, 74607: 0, 74752: 1, 74851: 0, 74864: 1, 74868: 0, 77824: 1, 78895: 0, 92160: 1, 92729: 0, 110592: 1, 110594: 0, 118784: 1, 119030: 0, 119040: 1, 119079: 0, 119081: 1, 119143: 0, 119146: 1, 119155: 0, 119171: 1, 119173: 0, 119180: 1, 119210: 0, 119214: 1, 119262: 0, 119296: 0, 119366: 0, 119552: 0, 119639: 0, 119648: 1, 119666: 0, 119808: 1, 119893: 0, 119894: 1, 119965: 0, 119966: 1, 119968: 0, 119970: 1, 119971: 0, 119973: 1, 119975: 0, 119977: 1, 119981: 0, 119982: 1, 119994: 0, 119995: 1, 119996: 0, 119997: 1, 120004: 0, 120005: 1, 120070: 0, 120071: 1, 120075: 0, 120077: 1, 120085: 0, 120086: 1, 120093: 0, 120094: 1, 120122: 0, 120123: 1, 120127: 0, 120128: 1, 120133: 0, 120134: 1, 120135: 0, 120138: 1, 120145: 0, 120146: 1, 120486: 0, 120488: 1, 120539: 0, 120540: 1, 120597: 0, 120598: 1, 120655: 0, 120656: 1, 120713: 0, 120714: 1, 120771: 0, 120772: 1, 120780: 0, 120782: 0, 120832: 0, 126976: 0, 127020: 0, 127024: 0, 127124: 0, 127136: 0, 127151: 0, 127153: 0, 127167: 0, 127169: 0, 127184: 0, 127185: 0, 127200: 0, 127232: 0, 127243: 0, 127248: 1, 127279: 0, 127280: 1, 127338: 0, 127344: 1, 127387: 0, 127462: 1, 127491: 0, 127504: 1, 127547: 0, 127552: 1, 127561: 0, 127568: 1, 127570: 0, 127744: 0, 127777: 0, 127792: 0, 127798: 0, 127799: 0, 127869: 0, 127872: 0, 127892: 0, 127904: 0, 127941: 0, 127942: 0, 127947: 0, 127968: 0, 127985: 0, 128000: 0, 128063: 0, 128064: 0, 128065: 0, 128066: 0, 128140: 1, 128141: 0, 128248: 0, 128249: 0, 128253: 0, 128256: 0, 128292: 1, 128293: 0, 128318: 0, 128336: 0, 128360: 0, 128507: 0, 128512: 0, 128513: 0, 128529: 0, 128530: 0, 128533: 0, 128534: 0, 128535: 0, 128536: 0, 128537: 0, 128538: 0, 128539: 0, 128540: 0, 128543: 0, 128544: 0, 128550: 0, 128552: 0, 128556: 0, 128557: 0, 128558: 0, 128560: 0, 128564: 0, 128565: 0, 128577: 0, 128581: 0, 128592: 0, 128640: 0, 128710: 0, 128768: 0, 128884: 0, 131072: 1, 131073: 0, 173782: 1, 173783: 0, 173824: 1, 173825: 0, 177972: 1, 177973: 0, 177984: 1, 177985: 0, 178205: 1, 178206: 0, 194560: 1, 195102: 0, 917505: 0, 917506: 0, 917536: 0, 917632: 0, 917760: 0, 918000: 0, 983040: 1, 983041: 0, 1048573: 1, 1048574: 0, 1048576: 1, 1048577: 0, 1114109: 1
            };
            this._ranges = [0, 65, 91, 97, 123, 170, 171, 181, 182, 186, 187, 192, 215, 216, 247, 248, 697, 699, 706, 720, 722, 736, 741, 750, 751, 880, 884, 886, 888, 890, 894, 895, 900, 902, 903, 904, 907, 908, 909, 910, 930, 931, 1014, 1015, 1155, 1162, 1320, 1329, 1367, 1369, 1376, 1377, 1416, 1417, 1418, 1419, 1425, 1470, 1471, 1472, 1473, 1475, 1476, 1478, 1479, 1480, 1488, 1515, 1520, 1525, 1536, 1540, 1542, 1544, 1545, 1547, 1548, 1549, 1550, 1563, 1564, 1566, 1611, 1632, 1642, 1643, 1648, 1649, 1750, 1757, 1758, 1765, 1767, 1774, 1776, 1786, 1806, 1807, 1809, 1810, 1840, 1867, 1869, 1958, 1969, 1970, 1984, 2027, 2036, 2038, 2042, 2043, 2048, 2070, 2074, 2075, 2084, 2085, 2088, 2089, 2094, 2096, 2111, 2112, 2137, 2140, 2142, 2143, 2304, 2307, 2362, 2363, 2364, 2365, 2369, 2377, 2381, 2382, 2385, 2392, 2402, 2404, 2424, 2425, 2432, 2433, 2434, 2436, 2437, 2445, 2447, 2449, 2451, 2473, 2474, 2481, 2482, 2483, 2486, 2490, 2492, 2493, 2497, 2501, 2503, 2505, 2507, 2509, 2510, 2511, 2519, 2520, 2524, 2526, 2527, 2530, 2532, 2534, 2546, 2548, 2555, 2556, 2561, 2563, 2564, 2565, 2571, 2575, 2577, 2579, 2601, 2602, 2609, 2610, 2612, 2613, 2615, 2616, 2618, 2620, 2621, 2622, 2625, 2627, 2631, 2633, 2635, 2638, 2641, 2642, 2649, 2653, 2654, 2655, 2662, 2672, 2674, 2677, 2678, 2689, 2691, 2692, 2693, 2702, 2703, 2706, 2707, 2729, 2730, 2737, 2738, 2740, 2741, 2746, 2748, 2749, 2753, 2758, 2759, 2761, 2762, 2763, 2765, 2766, 2768, 2769, 2784, 2786, 2788, 2790, 2800, 2801, 2802, 2817, 2818, 2820, 2821, 2829, 2831, 2833, 2835, 2857, 2858, 2865, 2866, 2868, 2869, 2874, 2876, 2877, 2879, 2880, 2881, 2885, 2887, 2889, 2891, 2893, 2894, 2902, 2903, 2904, 2908, 2910, 2911, 2914, 2916, 2918, 2936, 2946, 2947, 2948, 2949, 2955, 2958, 2961, 2962, 2966, 2969, 2971, 2972, 2973, 2974, 2976, 2979, 2981, 2984, 2987, 2990, 3002, 3006, 3008, 3009, 3011, 3014, 3017, 3018, 3021, 3022, 3024, 3025, 3031, 3032, 3046, 3059, 3067, 3073, 3076, 3077, 3085, 3086, 3089, 3090, 3113, 3114, 3124, 3125, 3130, 3133, 3134, 3137, 3141, 3142, 3145, 3146, 3150, 3157, 3159, 3160, 3162, 3168, 3170, 3172, 3174, 3184, 3192, 3199, 3200, 3202, 3204, 3205, 3213, 3214, 3217, 3218, 3241, 3242, 3252, 3253, 3258, 3260, 3261, 3269, 3270, 3273, 3274, 3276, 3278, 3285, 3287, 3294, 3295, 3296, 3298, 3300, 3302, 3312, 3313, 3315, 3330, 3332, 3333, 3341, 3342, 3345, 3346, 3387, 3389, 3393, 3397, 3398, 3401, 3402, 3405, 3406, 3407, 3415, 3416, 3424, 3426, 3428, 3430, 3446, 3449, 3456, 3458, 3460, 3461, 3479, 3482, 3506, 3507, 3516, 3517, 3518, 3520, 3527, 3530, 3531, 3535, 3538, 3541, 3542, 3543, 3544, 3552, 3570, 3573, 3585, 3633, 3634, 3636, 3643, 3647, 3648, 3655, 3663, 3676, 3713, 3715, 3716, 3717, 3719, 3721, 3722, 3723, 3725, 3726, 3732, 3736, 3737, 3744, 3745, 3748, 3749, 3750, 3751, 3752, 3754, 3756, 3757, 3761, 3762, 3764, 3770, 3771, 3773, 3774, 3776, 3781, 3782, 3783, 3784, 3790, 3792, 3802, 3804, 3806, 3840, 3864, 3866, 3893, 3894, 3895, 3896, 3897, 3902, 3912, 3913, 3949, 3953, 3967, 3968, 3973, 3974, 3976, 3981, 3992, 3993, 4029, 4030, 4038, 4039, 4045, 4046, 4059, 4096, 4141, 4145, 4146, 4152, 4153, 4155, 4157, 4159, 4184, 4186, 4190, 4193, 4209, 4213, 4226, 4227, 4229, 4231, 4237, 4238, 4253, 4254, 4294, 4304, 4349, 4352, 4681, 4682, 4686, 4688, 4695, 4696, 4697, 4698, 4702, 4704, 4745, 4746, 4750, 4752, 4785, 4786, 4790, 4792, 4799, 4800, 4801, 4802, 4806, 4808, 4823, 4824, 4881, 4882, 4886, 4888, 4955, 4957, 4960, 4989, 4992, 5008, 5018, 5024, 5109, 5120, 5121, 5760, 5761, 5787, 5789, 5792, 5873, 5888, 5901, 5902, 5906, 5909, 5920, 5938, 5941, 5943, 5952, 5970, 5972, 5984, 5997, 5998, 6001, 6002, 6004, 6016, 6071, 6078, 6086, 6087, 6089, 6100, 6107, 6108, 6109, 6110, 6112, 6122, 6128, 6138, 6144, 6159, 6160, 6170, 6176, 6264, 6272, 6313, 6314, 6315, 6320, 6390, 6400, 6429, 6432, 6435, 6439, 6441, 6444, 6448, 6450, 6451, 6457, 6460, 6464, 6465, 6468, 6470, 6510, 6512, 6517, 6528, 6572, 6576, 6602, 6608, 6619, 6622, 6656, 6679, 6681, 6684, 6686, 6742, 6743, 6744, 6751, 6752, 6753, 6754, 6755, 6757, 6765, 6771, 6781, 6783, 6784, 6794, 6800, 6810, 6816, 6830, 6912, 6916, 6964, 6965, 6966, 6971, 6972, 6973, 6978, 6979, 6988, 6992, 7019, 7028, 7037, 7040, 7042, 7074, 7078, 7080, 7082, 7083, 7086, 7098, 7104, 7142, 7143, 7144, 7146, 7149, 7150, 7151, 7154, 7156, 7164, 7212, 7220, 7222, 7224, 7227, 7242, 7245, 7296, 7376, 7379, 7380, 7393, 7394, 7401, 7405, 7406, 7411, 7424, 7616, 7655, 7676, 7680, 7958, 7960, 7966, 7968, 8006, 8008, 8014, 8016, 8024, 8025, 8026, 8027, 8028, 8029, 8030, 8031, 8062, 8064, 8117, 8118, 8125, 8126, 8127, 8130, 8133, 8134, 8141, 8144, 8148, 8150, 8156, 8157, 8160, 8173, 8176, 8178, 8181, 8182, 8189, 8191, 8192, 8206, 8207, 8208, 8234, 8235, 8236, 8237, 8238, 8239, 8293, 8298, 8305, 8306, 8308, 8319, 8320, 8335, 8336, 8349, 8352, 8378, 8400, 8433, 8448, 8450, 8451, 8455, 8456, 8458, 8468, 8469, 8470, 8473, 8478, 8484, 8485, 8486, 8487, 8488, 8489, 8490, 8494, 8495, 8506, 8508, 8512, 8517, 8522, 8526, 8528, 8544, 8585, 8586, 8592, 9014, 9083, 9109, 9110, 9204, 9216, 9255, 9280, 9291, 9312, 9372, 9450, 9900, 9901, 9984, 9985, 10187, 10188, 10189, 10190, 10240, 10496, 11085, 11088, 11098, 11264, 11311, 11312, 11359, 11360, 11493, 11499, 11503, 11506, 11513, 11520, 11558, 11568, 11622, 11631, 11633, 11647, 11648, 11671, 11680, 11687, 11688, 11695, 11696, 11703, 11704, 11711, 11712, 11719, 11720, 11727, 11728, 11735, 11736, 11743, 11744, 11826, 11904, 11930, 11931, 12020, 12032, 12246, 12272, 12284, 12288, 12293, 12296, 12321, 12330, 12337, 12342, 12344, 12349, 12352, 12353, 12439, 12441, 12445, 12448, 12449, 12539, 12540, 12544, 12549, 12590, 12593, 12687, 12688, 12731, 12736, 12772, 12784, 12829, 12831, 12832, 12880, 12896, 12924, 12927, 12977, 12992, 13004, 13008, 13055, 13056, 13175, 13179, 13278, 13280, 13311, 13312, 13313, 19893, 19894, 19904, 19968, 19969, 40907, 40908, 40960, 42125, 42128, 42183, 42192, 42509, 42512, 42540, 42560, 42607, 42612, 42620, 42624, 42648, 42656, 42736, 42738, 42744, 42752, 42786, 42888, 42889, 42895, 42896, 42898, 42912, 42922, 43002, 43010, 43011, 43014, 43015, 43019, 43020, 43045, 43047, 43048, 43052, 43056, 43064, 43066, 43072, 43124, 43128, 43136, 43204, 43205, 43214, 43226, 43232, 43250, 43260, 43264, 43302, 43310, 43335, 43346, 43348, 43359, 43389, 43392, 43395, 43443, 43444, 43446, 43450, 43452, 43453, 43470, 43471, 43482, 43486, 43488, 43520, 43561, 43567, 43569, 43571, 43573, 43575, 43584, 43587, 43588, 43596, 43597, 43598, 43600, 43610, 43612, 43644, 43648, 43696, 43697, 43698, 43701, 43703, 43705, 43710, 43712, 43713, 43714, 43715, 43739, 43744, 43777, 43783, 43785, 43791, 43793, 43799, 43808, 43815, 43816, 43823, 43968, 44005, 44006, 44008, 44009, 44013, 44014, 44016, 44026, 44032, 44033, 55203, 55204, 55216, 55239, 55243, 55292, 55296, 55297, 56191, 56193, 56319, 56321, 57343, 57345, 63743, 64046, 64048, 64110, 64112, 64218, 64256, 64263, 64275, 64280, 64285, 64286, 64287, 64297, 64298, 64311, 64312, 64317, 64318, 64319, 64320, 64322, 64323, 64325, 64326, 64450, 64467, 64830, 64832, 64848, 64912, 64914, 64968, 65008, 65021, 65022, 65024, 65050, 65056, 65063, 65072, 65107, 65108, 65127, 65128, 65132, 65136, 65141, 65142, 65277, 65279, 65280, 65281, 65313, 65339, 65345, 65371, 65382, 65471, 65474, 65480, 65482, 65488, 65490, 65496, 65498, 65501, 65504, 65511, 65512, 65519, 65529, 65534, 65536, 65548, 65549, 65575, 65576, 65595, 65596, 65598, 65599, 65614, 65616, 65630, 65664, 65787, 65792, 65793, 65794, 65795, 65799, 65844, 65847, 65856, 65931, 65936, 65948, 66000, 66045, 66046, 66176, 66205, 66208, 66257, 66304, 66335, 66336, 66340, 66352, 66379, 66432, 66462, 66463, 66500, 66504, 66518, 66560, 66718, 66720, 66730, 67584, 67590, 67592, 67593, 67594, 67638, 67639, 67641, 67644, 67645, 67647, 67670, 67671, 67680, 67840, 67868, 67871, 67872, 67898, 67903, 67904, 68096, 68097, 68100, 68101, 68103, 68108, 68112, 68116, 68117, 68120, 68121, 68148, 68152, 68155, 68159, 68160, 68168, 68176, 68185, 68192, 68224, 68352, 68406, 68409, 68416, 68438, 68440, 68467, 68472, 68480, 68608, 68681, 69216, 69247, 69632, 69633, 69634, 69688, 69703, 69710, 69714, 69734, 69744, 69760, 69762, 69811, 69815, 69817, 69819, 69826, 73728, 74607, 74752, 74851, 74864, 74868, 77824, 78895, 92160, 92729, 110592, 110594, 118784, 119030, 119040, 119079, 119081, 119143, 119146, 119155, 119171, 119173, 119180, 119210, 119214, 119262, 119296, 119366, 119552, 119639, 119648, 119666, 119808, 119893, 119894, 119965, 119966, 119968, 119970, 119971, 119973, 119975, 119977, 119981, 119982, 119994, 119995, 119996, 119997, 120004, 120005, 120070, 120071, 120075, 120077, 120085, 120086, 120093, 120094, 120122, 120123, 120127, 120128, 120133, 120134, 120135, 120138, 120145, 120146, 120486, 120488, 120539, 120540, 120597, 120598, 120655, 120656, 120713, 120714, 120771, 120772, 120780, 120782, 120832, 126976, 127020, 127024, 127124, 127136, 127151, 127153, 127167, 127169, 127184, 127185, 127200, 127232, 127243, 127248, 127279, 127280, 127338, 127344, 127387, 127462, 127491, 127504, 127547, 127552, 127561, 127568, 127570, 127744, 127777, 127792, 127798, 127799, 127869, 127872, 127892, 127904, 127941, 127942, 127947, 127968, 127985, 128000, 128063, 128064, 128065, 128066, 128140, 128141, 128248, 128249, 128253, 128256, 128292, 128293, 128318, 128336, 128360, 128507, 128512, 128513, 128529, 128530, 128533, 128534, 128535, 128536, 128537, 128538, 128539, 128540, 128543, 128544, 128550, 128552, 128556, 128557, 128558, 128560, 128564, 128565, 128577, 128581, 128592, 128640, 128710, 128768, 128884, 131072, 131073, 173782, 173783, 173824, 173825, 177972, 177973, 177984, 177985, 178205, 178206, 194560, 195102, 917505, 917506, 917536, 917632, 917760, 918000, 983040, 983041, 1048573, 1048574, 1048576, 1048577, 1114109]
        }, {
            _rangeLookup: null, _ranges: null, _search: function _search(charCode) {
                var low = 0,
                    high = this._ranges.length - 1,
                    i = 0;
                while (low <= high) {
                    i = Math.floor((low + high) / 2);
                    if (charCode < this._ranges[i]) {
                        if (high <= i + 1) {
                            return this._ranges[i - 1]
                        }
                        else {
                            high = i + 1;
                            continue
                        }
                    }
                    else if (charCode > this._ranges[i]) {
                        if (low >= i - 1) {
                            return this._ranges[i]
                        }
                        else {
                            low = i - 1;
                            continue
                        }
                    }
                    else {
                        return this._ranges[i]
                    }
                }
                return this._ranges[i]
            }, _getCharacterCodeDirection: function _getCharacterCodeDirection(charCode) {
                var i = this._search(charCode);
                return this._rangeLookup[i]
            }, _convertToStringDirection: function _convertToStringDirection(dir) {
                if (dir === PlatformJS.Utilities.TextDirection.ltr) {
                    return "ltr"
                }
                else {
                    return "rtl"
                }
            }, getTextDirection: function getTextDirection(text) {
                if (typeof text !== "string" || !text) {
                    return "ltr"
                }
                for (var i = 0; i < text.length; i++) {
                    var charCode = text.charCodeAt(i);
                    var charDirection = this._getCharacterCodeDirection(charCode);
                    if (charDirection !== PlatformJS.Utilities.TextDirection.unknown) {
                        return this._convertToStringDirection(charDirection)
                    }
                }
                return "ltr"
            }
        }, {
            ltr: 1, rtl: 2, unknown: 0
        }), MemoryCache: WinJS.Class.define(function memoryCache_ctor(maxSize) {
            this.maxSize = maxSize;
            this._priorityQueue = [];
            this._lookupTable = {};
            this.field = {}
        }, {
            maxSize: 0, _priorityQueue: null, field: null, addItem: function addItem(key, item) {
                if (!this.getItem(key)) {
                    if (this._priorityQueue.length > this.maxSize) {
                        delete this._lookupTable[this._priorityQueue[0].key];
                        this._priorityQueue.pop()
                    }
                    this._priorityQueue.push({
                        key: key, item: item
                    });
                    this._lookupTable[key] = item
                }
                else {
                    this._lookupTable[key] = item;
                    for (var i = 0; i < this._priorityQueue.length; i++) {
                        var entry = this._priorityQueue[i];
                        if (entry.key === key) {
                            entry.item = item;
                            break
                        }
                    }
                }
            }, getItem: function getItem(key) {
                var item = this._lookupTable[key];
                if (item) {
                    for (var i = 0; i < this._priorityQueue.length; i++) {
                        var entry = this._priorityQueue[i];
                        if (entry.key === key) {
                            this._priorityQueue.splice(i, 1);
                            this._priorityQueue.push(entry);
                            break
                        }
                    }
                }
                return item
            }
        }), isPromiseCanceled: function isPromiseCanceled(err) {
            if (!err) {
                return false
            }
            return err.name === "Canceled"
        }, handleNetworkSuspend: function handleNetworkSuspend(p) {
            if (p.statusCode === Platform.DataServices.QueryServiceStatusCode.suspending) {
                CommonJS.Error.showError(CommonJS.Error.NO_INTERNET, false, false, true)
            }
            else if (p.statusCode === Platform.DataServices.QueryServiceStatusCode.resuming) {
                CommonJS.Error.removeError(CommonJS.Error.NO_INTERNET, false, false, true)
            }
        }, setLastUpdatedTime: function setLastUpdatedTime(lastUpdatedArray, lastUpdatedString) {
            if (Array.isArray(lastUpdatedArray)) {
                if (!PlatformJS.mainProcessManager.retailModeEnabled) {
                    var innerHtml = this.buildLastUpdatedElement(lastUpdatedArray, lastUpdatedString);
                    CommonJS.Watermark.setWatermarkHtml(innerHTML)
                }
            }
        }, buildLastUpdatedElement: function buildLastUpdatedElement(lastUpdatedArray, lastUpdatedString) {
            var innerHtml = "";
            lastUpdatedString = lastUpdatedString || PlatformJS.Services.resourceLoader.getString("/platform/offline_lastUpdated");
            if (!lastUpdatedString.match(/\{0\}/)) {
                innerHtml = "<div id=\"platformLastUpdatedTime\"><span class=\"platformLastUpdatedLabel\">" + lastUpdatedString + "</span></div>"
            }
            else {
                var mostRecentDateTime = Math.max.apply(Math, lastUpdatedArray);
                if (mostRecentDateTime > 0) {
                    var dateTime = new Date(mostRecentDateTime);
                    var market = Platform.Utilities.Globalization.getCurrentMarket();
                    var dateFormatting = Windows.Globalization.DateTimeFormatting;
                    var now = new Date;
                    var anchor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    var dateTimeFormat;
                    if (anchor > dateTime) {
                        dateTimeFormat = new dateFormatting.DateTimeFormatter(dateFormatting.YearFormat.none, dateFormatting.MonthFormat.abbreviated, dateFormatting.DayFormat.default, dateFormatting.DayOfWeekFormat.default, dateFormatting.HourFormat.none, dateFormatting.MinuteFormat.none, dateFormatting.SecondFormat.none, [market])
                    }
                    else {
                        dateTimeFormat = new dateFormatting.DateTimeFormatter(dateFormatting.YearFormat.none, dateFormatting.MonthFormat.none, dateFormatting.DayFormat.none, dateFormatting.DayOfWeekFormat.none, dateFormatting.HourFormat.default, dateFormatting.MinuteFormat.default, dateFormatting.SecondFormat.none, [market])
                    }
                    innerHtml = "<div id=\"platformLastUpdatedTime\"><span class=\"platformLastUpdatedLabel\">" + lastUpdatedString.format(dateTimeFormat.format(dateTime)) + "</span></div>"
                }
            }
            return innerHtml
        }
    });
    WinJS.Namespace.define("PlatformJS.Utilities.Transitions", {
        _buildTransition: function _buildTransition(target, options) {
            var isANumber = function (x) {
                return typeof (x) === "number"
            };
            var transition = {};
            transition.target = target;
            transition.durationMs = options.duration;
            transition.intervalMs = (options.interval ? options.interval : 33);
            transition.property = options.property;
            transition.toValue = options.to;
            transition.fromValue = (options.from ? options.from : target[transition.property]);
            if (!isANumber(transition.toValue)) {
                throw "to value must be a number";
            }
            if (!isANumber(transition.fromValue)) {
                throw "target does not currently support the property " + transition.property + " as a number. Either set it explicitly or hand in starting from";
            }
            return transition
        }, _buildTransitionsPromise: function _buildTransitionsPromise(startTimeMs, intervalMs, transitions) {
            var updateFn = function () {
                var deltaMs = ((new Date).getTime()) - startTimeMs;
                var activeTransitionCnt = 0,
                    t;
                for (t = transitions.length - 1; t >= 0; t--) {
                    var transition = transitions[t];
                    if (!transition) {
                        continue
                    }
                    if (deltaMs < transition.durationMs) {
                        transition.target[transition.property] = transition.fromValue + (deltaMs / transition.durationMs) * (transition.toValue - transition.fromValue);
                        activeTransitionCnt++
                    }
                    else {
                        transition.target[transition.property] = transition.toValue;
                        transition.target = null;
                        transitions[t] = null
                    }
                }
                if (activeTransitionCnt > 0) {
                    if (activeTransitionCnt < transitions.length) {
                        for (t = transitions.length - 1; t >= 0; t--) {
                            if (!transitions[t]) {
                                transitions.splice(t, 1)
                            }
                        }
                    }
                    return WinJS.Promise.timeout(intervalMs).then(updateFn)
                }
                return null
            };
            var promise = WinJS.Promise.timeout(intervalMs).then(updateFn);
            return promise
        }, applyTransitions: function applyTransitions(targetList, optionsList) {
            var startTimeMs = (new Date).getTime();
            var makeArray = function (item) {
                if (Array.isArray(item)) {
                    return item
                }
                var t = [];
                t.push(item);
                return t
            };
            targetList = makeArray(targetList);
            optionsList = makeArray(optionsList);
            var intervalMap = {};
            var intervalKeys = [];
            for (var optionIndex = optionsList.length - 1; optionIndex >= 0; optionIndex--) {
                var options = optionsList[optionIndex];
                var intervalMs = (options.interval ? options.interval : 33);
                var currentInterval = intervalMap[intervalMs];
                if (!currentInterval) {
                    currentInterval = [];
                    intervalMap[intervalMs] = currentInterval;
                    intervalKeys.push(intervalMs)
                }
                for (var targetIndex = targetList.length - 1; targetIndex >= 0; targetIndex--) {
                    currentInterval.push(PlatformJS.Utilities.Transitions._buildTransition(targetList[targetIndex], options))
                }
            }
            var promises = [];
            for (var i = intervalKeys.length - 1; i >= 0; i--) {
                intervalMs = intervalKeys[i];
                var transitions = intervalMap[intervalMs];
                var transitionPromise = PlatformJS.Utilities.Transitions._buildTransitionsPromise(startTimeMs, intervalMs, transitions);
                promises.push(transitionPromise)
            }
            return WinJS.Promise.join(promises)
        }
    });
    String.prototype.format = function () {
        var str = this,
            result = "",
            chunkStart = 0,
            i,
            c,
            len;
        for (i = 0, len = str.length; i < len; i++) {
            c = str[i];
            if (c === "{") {
                var c2,
                    j,
                    tokenSearchLimit,
                    end = -1;
                for (j = i + 1, len = str.length, tokenSearchLimit = i + 6; j < len && j < tokenSearchLimit; j++) {
                    c2 = str.charCodeAt(j);
                    if (c2 < 48 || c2 > 57) {
                        if (c2 === 125) {
                            end = j
                        }
                        break
                    }
                }
                if (end !== -1) {
                    var number = parseInt(str.substring(i + 1, end));
                    var arg = arguments[number];
                    var argType = typeof arg;
                    if (argType !== "undefined") {
                        result += str.substring(chunkStart, i);
                        if (argType === "function") {
                            result += arg()
                        }
                        else {
                            result += arg
                        }
                        i = end;
                        chunkStart = i + 1
                    }
                }
            }
        }
        if (chunkStart < len) {
            result += str.substring(chunkStart, len)
        }
        return result
    };
    String.prototype.startsWith = function (str) {
        return (this.match("^" + str) !== null)
    };
    String.prototype.endsWith = function (str) {
        return (this.match(str + "$") !== null)
    };
    WinJS.Namespace.define("PlatformJS.Utilities.Binding", {
        cacheableImage: function cacheableImage(source, sourceProperty, dest, destProperty) {
            PlatformJS.Utilities.fetchImage(source[sourceProperty].cacheId, source[sourceProperty].url).then(function platformUtilities_fetchImageComplete(url) {
                dest[destProperty[0]] = url
            })
        }, List: WinJS.Class.derive(WinJS.Binding.List, function _utilities_2136(data, options) {
            WinJS.Binding.List.apply(this, arguments);
            this._lastGroupIndex = -1;
            this._groupMappings = {};
            this._groups = {};
            this._batchEditsLevel = 0
        }, {
            _lastGroupIndex: -1, _groupMappings: null, _groups: null, _batchEditsLevel: 0, isPlatformJSList: true, listView: null, beginEdits: function beginEdits() {
                if (this.listView && this.listView.itemDataSource && this._batchEditsLevel === 0) {
                    this.listView.itemDataSource.beginEdits()
                }
                this._batchEditsLevel++
            }, endEdits: function endEdits() {
                this._batchEditsLevel--;
                if (this.listView && this.listView.itemDataSource && this._batchEditsLevel === 0) {
                    this.listView.itemDataSource.endEdits()
                }
            }, clear: function clear() {
                this.beginEdits();
                try {
                    this.splice(0, this.length)
                }
                finally {
                    this.endEdits()
                }
                this._groupMappings = {};
                this._groups = {}
            }, remove: function remove(index) {
                this.beginEdits();
                try {
                    this.splice(index, 1)
                }
                finally {
                    this.endEdits()
                }
            }, createGroup: function createGroup(group) {
                return this.getGroupKey(group)
            }, deleteGroup: function deleteGroup(group) {
                this.removeGroup(group);
                var id = (typeof group === "string") ? group : group.groupTitle + "_" + group.entityTitle;
                if (this._groupMappings[id]) {
                    delete this._groups[this._groupMappings[id]];
                    delete this._groupMappings[id]
                }
            }, addToGroup: function addToGroup(group, item) {
                item.groupKey = this.getGroupKey(group);
                item.groupTitle = this.getGroupTitle(item.groupKey);
                if (!item.groupTitle) {
                    item.groupTitle = ""
                }
                this.beginEdits();
                try {
                    if (typeof item.length !== "undefined") {
                        for (var i = 0; i < item.length; i++) {
                            this.addToGroup(group, item[i])
                        }
                    }
                    else {
                        this.push(item)
                    }
                }
                finally {
                    this.endEdits()
                }
            }, getGroupKey: function getGroupKey(group) {
                if (group.groupKey) {
                    if (!this._groups[group.groupKey]) {
                        this._groups[group.groupKey] = group
                    }
                    return group.groupKey
                }
                else {
                    var id = (typeof group === "string") ? group : group.groupTitle + "_" + group.entityTitle;
                    if (!this._groupMappings[id]) {
                        this._lastGroupIndex++;
                        if (this._lastGroupIndex < 10) {
                            this._groupMappings[id] = "00" + this._lastGroupIndex
                        }
                        else if (this._lastGroupIndex < 100) {
                            this._groupMappings[id] = "0" + this._lastGroupIndex
                        }
                        else {
                            this._groupMappings[id] = "" + this._lastGroupIndex
                        }
                    }
                    this._groups[this._groupMappings[id]] = group;
                    return this._groupMappings[id]
                }
            }, getGroup: function getGroup(groupKey) {
                return this._groups[groupKey]
            }, getGroupTitle: function getGroupTitle(groupKey) {
                var group = this.getGroup(groupKey);
                if (typeof group === "string") {
                    return group
                }
                else {
                    return group.groupTitle
                }
            }, removeFromGroup: function removeFromGroup(group, item) {
                var groupKey = this.getGroupKey(group);
                this.beginEdits();
                try {
                    for (var i = 0; i < this.length; i++) {
                        var element = this.getItem(i);
                        if (element.data.groupKey === groupKey && element.data === item) {
                            this.remove(i);
                            break
                        }
                    }
                }
                finally {
                    this.endEdits()
                }
            }, removeGroup: function removeGroup(group) {
                var groupKey = this.getGroupKey(group),
                    i = 0;
                this.beginEdits();
                try {
                    for (i = 0; i < this.length; i++) {
                        var element = this.getItem(i);
                        if (element.data.groupKey === groupKey) {
                            this.remove(i);
                            i--
                        }
                    }
                }
                finally {
                    this.endEdits()
                }
            }, replaceGroup: function replaceGroup(group, items) {
                this.beginEdits();
                try {
                    this.removeGroup(group);
                    for (var i = 0; i < items.length; i++) {
                        this.addToGroup(group, items[i])
                    }
                }
                finally {
                    this.endEdits()
                }
            }, _invokeMethod: function _invokeMethod(methodName, args) {
                var returnValue = null;
                this.beginEdits();
                try {
                    returnValue = WinJS.Binding.List.prototype[methodName].apply(this, args)
                }
                finally {
                    this.endEdits()
                }
                return returnValue
            }, concat: function concat(value) {
                return this._invokeMethod("concat", arguments)
            }, join: function join(value) {
                return this._invokeMethod("join", arguments)
            }, pop: function pop(value) {
                return this._invokeMethod("pop", arguments)
            }, push: function push(value) {
                return this._invokeMethod("push", arguments)
            }, reverse: function reverse(value) {
                return this._invokeMethod("reverse", arguments)
            }, shift: function shift(value) {
                return this._invokeMethod("shift", arguments)
            }, slice: function slice(value) {
                return this._invokeMethod("slice", arguments)
            }, sort: function sort(value) {
                return this._invokeMethod("sort", arguments)
            }, splice: function splice(value) {
                return this._invokeMethod("splice", arguments)
            }, unshift: function unshift(value) {
                return this._invokeMethod("unshift", arguments)
            }
        })
    });
    WinJS.Namespace.define("PlatformJS.Utilities.Instrumentation", {
        _dataPoints: null, DataPoints: {
            get: function get() {
                if (!PlatformJS.Utilities.Instrumentation._dataPoints) {
                    PlatformJS.Utilities.Instrumentation._dataPoints = PlatformJS.Services.configuration.getDictionary("Instrumentation").getDictionary("DataPoints")
                }
                return PlatformJS.Utilities.Instrumentation._dataPoints
            }
        }, _dataSetId: null, DataSetId: {
            get: function get() {
                if (!PlatformJS.Utilities.Instrumentation._dataSetId) {
                    PlatformJS.Utilities.Instrumentation._dataSetId = PlatformJS.Services.configuration.getDictionary("Instrumentation").getInt32("DataSetID")
                }
                return PlatformJS.Utilities.Instrumentation._dataSetId
            }
        }, incrementInt32: function incrementInt32(dataPointName) {
            if (PlatformJS.Utilities.Instrumentation.DataPoints.hasItem(dataPointName)) {
                var dataPointId = PlatformJS.Utilities.Instrumentation.DataPoints.getInt32(dataPointName);
                Platform.Instrumentation.InstrumentationManager.instance.incrementInt32(PlatformJS.Utilities.Instrumentation.DataSetId, dataPointId, 1)
            }
        }, instrumentEditorial: function instrumentEditorial(id, market, source, page, instrumentationId, entryPoint, trailingMediaBlockCount, dwellTime) {
            var data = "";
            if (id && id !== "") {
                var idSplit = id.split("/");
                if (idSplit.length === 2) {
                    data += "c*" + idSplit[1]
                }
                else {
                    data += "p*" + idSplit[0]
                }
            }
            else {
                return
            }
            data += "*";
            if (market) {
                data += market
            }
            data += "*";
            if (source || source === 0) {
                data += source
            }
            data += "*";
            if (page) {
                data += page
            }
            data += "*";
            if (instrumentationId) {
                data += instrumentationId
            }
            data += "*";
            if (trailingMediaBlockCount || trailingMediaBlockCount === 0) {
                data += trailingMediaBlockCount
            }
            data += "*";
            if (entryPoint || entryPoint === 0) {
                data += entryPoint
            }
            data += "*";
            if (dwellTime || dwellTime === 0) {
                data += dwellTime
            }
            Platform.Instrumentation.InstrumentationManager.instance.addString_IgnoreCeip(Platform.Instrumentation.InstrumentationDataSetId.editorial, Platform.Instrumentation.InstrumentationDataPointId.editorial, data)
        }, ECVInstrumenter: WinJS.Class.define(function ecvInstrumenter_ctor(filterDataPoints, sortDataPoints) {
            this._filterDataPoints = filterDataPoints;
            this._sortDataPoints = sortDataPoints;
            this._lastQuery = null;
            this._ignoreFilterChange = false
        }, {
            _filterDataPoints: null, _sortDataPoints: null, _lastQuery: null, _lastSortIdentifier: null, _lastSortDirection: null, _ignoreFilterChange: false, getECVFilterValue: function getECVFilterValue(filter) {
                var filterValue = "";
                for (var i = 0; i < filter.value.length; i++) {
                    filterValue += filter.value[i] + ";"
                }
                return filterValue
            }, diffECVQuery: function diffECVQuery(query, lastQuery) {
                var filtersChanged = [],
                    filterFound = false,
                    filterName = null,
                    filterValue = null,
                    i = 0,
                    j = 0,
                    a = 0,
                    b = 0;
                for (i = 0; i < query.filters.length; i++) {
                    filterFound = false;
                    filterName = query.filters[i].attribute;
                    for (j = 0; j < lastQuery.filters.length; j++) {
                        if (filterName === lastQuery.filters[j].attribute) {
                            filterFound = true;
                            if (this.getECVFilterValue(query.filters[i]) !== this.getECVFilterValue(lastQuery.filters[j])) {
                                filtersChanged.push(filterName)
                            }
                            break
                        }
                    }
                    if (!filterFound) {
                        filtersChanged.push(filterName)
                    }
                }
                for (i = 0; i < lastQuery.filters.length; i++) {
                    filterFound = false;
                    filterName = lastQuery.filters[i].attribute;
                    for (j = 0; j < query.filters.length; j++) {
                        if (filterName === query.filters[j].attribute) {
                            filterFound = true;
                            break
                        }
                    }
                    if (!filterFound) {
                        filtersChanged.push(filterName)
                    }
                }
                return filtersChanged
            }, onBeforeQuery: function onBeforeQuery(query) {
                try {
                    if (this._lastQuery && !this._ignoreFilterChange) {
                        var filtersChanged = this.diffECVQuery(query, this._lastQuery);
                        for (var i = 0; i < filtersChanged.length; i++) {
                            if (this._filterDataPoints[filtersChanged[i]]) {
                                PlatformJS.Utilities.Instrumentation.incrementInt32(this._filterDataPoints[filtersChanged[i]])
                            }
                        }
                        if (filtersChanged.length === 0 && this._sortDataPoints[query.sortIdentifier] && (query.sortIdentifier !== this._lastSortIdentifier || query.sortDirection !== this._lastSortDirection)) {
                            PlatformJS.Utilities.Instrumentation.incrementInt32(this._sortDataPoints[query.sortIdentifier])
                        }
                        this._lastSortIdentifier = query.sortIdentifier;
                        this._lastSortDirection = query.sortDirection
                    }
                    this._lastQuery = query;
                    this._ignoreFilterChange = false
                }
                catch (exception) { }
            }, OnClearFiltersClick: function OnClearFiltersClick() {
                this._ignoreFilterChange = true
            }
        })
    });
    var DayPoller = WinJS.Namespace.define("PlatformJS.Utilities.DayPoller", {
        _instance: null, POLL_INTERVAL: 30000, _DayPoller: WinJS.Class.define(function dayPoller_ctor() {
            this._lastDate = new Date;
            this._listeners = [];
            this._element = document.createElement("div")
        }, {
            _element: null, _interval: null, _lastDate: null, _numListeners: 0, _listeners: null, _onInterval: function _onInterval(event) {
                var currentDate = new Date;
                if (currentDate.getFullYear() !== this._lastDate.getFullYear() || currentDate.getMonth() !== this._lastDate.getMonth() || currentDate.getDay() !== this._lastDate.getDay()) {
                    this._lastDate = currentDate;
                    this._dispatchDateChangedEvent(currentDate)
                }
            }, _dispatchDateChangedEvent: function _dispatchDateChangedEvent(date) {
                var event = document.createEvent("CustomEvent");
                event.initCustomEvent("datechanged", false, false, { date: date });
                this._element.dispatchEvent(event)
            }, addListener: function addListener(id, callback) {
                if (!this._listeners[id]) {
                    this._listeners[id] = callback;
                    this._element.addEventListener("datechanged", this._listeners[id]);
                    if (this._numListeners === 0) {
                        this._interval = window.setInterval(this._onInterval.bind(this), DayPoller.POLL_INTERVAL)
                    }
                    this._numListeners++
                }
            }, removeListener: function removeListener(id, callback) {
                if (this._listeners[id]) {
                    if (this._numListeners > 0) {
                        this._numListeners--
                    }
                    this._element.removeEventListener("datechanged", this._listeners[id]);
                    if (this._numListeners === 0) {
                        window.clearInterval(this._interval)
                    }
                    delete this._listeners[id]
                }
            }
        }), getInstance: function getInstance() {
            if (!DayPoller._instance) {
                DayPoller._instance = new DayPoller._DayPoller
            }
            return DayPoller._instance
        }
    })
})();
(function appexPlatformEventsInit() {
    "use strict";
    WinJS.Namespace.define("PlatformJS.Events", {
        init: function init() {
            if (!this._eventProxy) {
                this._eventProxy = new PlatformJS.Events.EventProxy
            }
        }, dispose: function dispose() {
            if (this._eventProxy) {
                this._eventProxy.dispose();
                this._eventProxy = null
            }
        }, addEventListener: function addEventListener(uniqueId, eventName, eventCallback) {
            this.init();
            this._eventProxy.addEvent(uniqueId, eventName, eventCallback)
        }, removeEventListener: function removeEventListener(uniqueId) {
            if (this._eventProxy) {
                this._eventProxy.removeEvent(uniqueId)
            }
        }, _eventProxy: null, EventProxy: WinJS.Class.define(function eventProxy_ctor() {
            this._currentEvents = [];
            this._addedNetworkEventListener = false
        }, {
            _currentEvents: null, _addedNetworkEventListener: false, _networkStatusChangedEventHandler: function _networkStatusChangedEventHandler(e) {
                if (PlatformJS.Utilities.hasInternetConnection()) {
                    var eventList = PlatformJS.Events._eventProxy._currentEvents;
                    for (var evtId in eventList) {
                        var evt = eventList[evtId];
                        if (evt.evtName === "networkstatuschanged" && evt.callback) {
                            evt.callback()
                        }
                    }
                }
            }, addEvent: function addEvent(uniqueId, eventName, eventCallback) {
                if (uniqueId && eventName && eventCallback) {
                    if (!this._currentEvents[uniqueId]) {
                        this._currentEvents[uniqueId] = {
                            evtName: eventName, callback: eventCallback
                        }
                    }
                    if (eventName === "networkstatuschanged" && !this._addedNetworkEventListener) {
                        this._addedNetworkEventListener = true;
                        Platform.Networking.NetworkManager.addEventListener("networkstatuschanged", this._networkStatusChangedEventHandler)
                    }
                }
            }, removeEvent: function removeEvent(uniqueId) {
                if (uniqueId) {
                    try {
                        delete this._currentEvents[uniqueId]
                    }
                    catch (e) { }
                }
            }, dispose: function dispose() {
                this._currentEvents = [];
                if (this._addedNetworkEventListener) {
                    Platform.Networking.NetworkManager.removeEventListener("networkstatuschanged", this._networkStatusChangedEventHandler)
                }
                this._addedNetworkEventListener = false
            }
        })
    })
})();
(function appexPlatformImagesInit() {
    "use strict";
    WinJS.Namespace.define("PlatformJS.Images", {
        _imageProxy: null, _getImageProxy: function _getImageProxy() {
            if (!this._imageProxy) {
                var that = this;
                return PlatformJS.platformInitializedPromise.then(function _initiaizeImageProxy() {
                    that._imageProxy = new PlatformJS.Images.ImageProxyService;
                    return that._imageProxy
                })
            }
            else {
                return WinJS.Promise.wrap(this._imageProxy)
            }
        }, dispose: function dispose() {
            if (this._imageProxy) {
                this._imageProxy.dispose();
                this._imageProxy = null
            }
        }, _unsaveImageForBoot: function _unsaveImageForBoot(imageUrl, cacheId) {
            return this._getImageProxy().then(function _utilities_2833(imageProxy) {
                imageProxy.updateImageCacheEntry(imageUrl, cacheId, false)
            })
        }, _saveImageForBoot: function _saveImageForBoot(imageUrl, cacheId) {
            return this._getImageProxy().then(function _utilities_2839(imageProxy) {
                imageProxy.updateImageCacheEntry(imageUrl, cacheId, true)
            })
        }, fetchImage: function fetchImage(cacheId, url, networkCallRequired) {
            if (!url || typeof url !== "string") {
                return WinJS.Promise.wrap(null)
            }
            if (url.indexOf("/") === 0 || url.indexOf("ms-appdata://") === 0 || url.indexOf("ms-appx://") === 0) {
                return WinJS.Promise.wrap(url)
            }
            if (PlatformJS.Services.configuration.getBool("EnableImageThrottling", false)) {
                return this._getImageProxy().then(function _utilities_2865(imageProxy) {
                    return imageProxy.fetchImage(cacheId, url, networkCallRequired)
                })
            }
            else {
                return this.fetchImageOld(cacheId, url, networkCallRequired)
            }
        }, fetchImageOld: function fetchImageOld(cacheId, url, networkCallRequired) {
            var that = this;
            var marker = performance.now();
            return new WinJS.Promise(function platformImages_fetchImageOldPromiseInit(complete, error) {
                msWriteProfilerMark("Platform:fetchImage:" + marker + ":s");
                if (!cacheId) {
                    cacheId = "PlatformImageCache"
                }
                if (cacheId) {
                    if (!that._imageCaches) {
                        that._imageCaches = {}
                    }
                    if (!that._imageCaches[cacheId]) {
                        that._imageCaches[cacheId] = new Platform.ImageService(cacheId)
                    }
                    var imageService = that._imageCaches[cacheId];
                    if (imageService && url && url.length > 0) {
                        imageService.fetchImageAsync(url).then(function platformImages_fetchImageAsyncComplete(response) {
                            if (response.dataString) {
                                msWriteProfilerMark("Platform:fetchImage:" + marker + ":e");
                                complete(response.dataString)
                            }
                        }, function platformImages_fetchImageAsyncError(url) {
                            msWriteProfilerMark("Platform:fetchImage:" + marker + ":e");
                            error(url)
                        }, function platformImages_fetchImageAsyncProgress(progress) {
                            if (progress.statusCode === Platform.DataServices.QueryServiceStatusCode.cachedEntryNotFound && networkCallRequired) {
                                networkCallRequired()
                            }
                        })
                    }
                    else {
                        msWriteProfilerMark("Platform:fetchImage:" + marker + ":e");
                        complete(url)
                    }
                }
                else {
                    msWriteProfilerMark("Platform:fetchImage:" + marker + ":e");
                    complete(url)
                }
            })
        }, ImageProxyService: WinJS.Class.define(function imageProxyService_ctor() {
            this._currentOperations = [];
            this._imageCaches = {};
            this._currentlyRunning = 0;
            this._currentRunningOperations = [];
            this._disposed = false;
            this._throttleLifo = PlatformJS.BootCache.instance.getEntry("ImageProxyService.ImageThrottlingLIFO", function _utilities_2934() {
                return PlatformJS.Services.configuration.getBool("ImageThrottlingLIFO", true)
            });
            this._maxThrottle = PlatformJS.BootCache.instance.getEntry("ImageProxyService.MaxImageThrottling", function _utilities_2937() {
                return PlatformJS.Services.configuration.getInt32("MaxImageThrottling", 30)
            })
        }, {
            _currentOperations: null, _imageCaches: null, _currentlyRunning: 0, _maxThrottle: 30, _throttleLifo: true, _currentRunningOperations: null, _disposed: false, updateImageCacheEntry: function updateImageCacheEntry(imageUrl, cacheId, saveForboot) {
                var imageService = this._getImageService(cacheId);
                return imageService.cacheEntryUpdateAsync(imageUrl, saveForboot)
            }, fetchImage: function fetchImage(cacheId, url, networkCallRequired) {
                var that = this;
                var operation = {
                    cacheId: cacheId, url: url, networkCallRequired: networkCallRequired, isRunning: false, uniqueId: null
                };
                return this._setNetworkOperationAsync(operation).then(function _fetchImage() {
                    var promise;
                    if (operation.isNetworkOperation) {
                        that._currentOperations.push(operation);
                        promise = new WinJS.Promise(function imageProxyService_networkOperationPromiseInit(complete, error) {
                            operation["complete"] = complete;
                            operation["error"] = error
                        });
                        var completion = function () {
                            msSetImmediate(function imageProxyService_fetchImageExecuteNext() {
                                that._executeNext()
                            })
                        };
                        promise.then(completion, completion);
                        that._executeNext()
                    }
                    else {
                        promise = new WinJS.Promise(function imageProxyService_completedPromiseInit(complete, error) {
                            operation["complete"] = complete;
                            operation["error"] = error;
                            that._runImageServiceFetch(operation)
                        })
                    }
                    return promise
                })
            }, _executeNext: function _executeNext() {
                if (this._disposed) {
                    return
                }
                if (this._currentlyRunning <= this._maxThrottle) {
                    if (this._currentOperations.length > 0) {
                        var operation = this._throttleLifo ? this._currentOperations.pop() : this._currentOperations.shift();
                        this._operationStarted(operation);
                        this._runImageServiceFetch(operation)
                    }
                }
            }, _setNetworkOperationAsync: function _setNetworkOperationAsync(operation) {
                var cacheId = operation.cacheId;
                var url = operation.url;
                return Platform.ImageService.hasImageEntryAsync(url, cacheId).then(function updateImageProxyNetwork(entryFound) {
                    operation["isNetworkOperation"] = !entryFound
                }, function hasEntryErrorHandler() {
                    operation["isNetworkOperation"] = true
                })
            }, _operationStarted: function _operationStarted(operation) {
                if (operation.isNetworkOperation) {
                    this._currentlyRunning++;
                    operation.uniqueId = PlatformJS.Utilities.generateUniqueId();
                    this._currentRunningOperations.push(operation);
                    operation.isRunning = true
                }
            }, _operationFinished: function _operationFinished(operation) {
                if (operation.isNetworkOperation) {
                    this._currentlyRunning--;
                    var opIndex = -1;
                    for (var i = 0; i < this._currentRunningOperations.length; i++) {
                        if (this._currentRunningOperations[i].uniqueId === operation.uniqueId) {
                            opIndex = i;
                            break
                        }
                    }
                    this._currentRunningOperations.splice(opIndex, 1)
                }
            }, _getImageService: function _getImageService(cacheId) {
                if (!cacheId) {
                    cacheId = "PlatformImageCache"
                }
                if (!this._imageCaches[cacheId]) {
                    this._imageCaches[cacheId] = new Platform.ImageService(cacheId)
                }
                return this._imageCaches[cacheId]
            }, _runImageServiceFetch: function _runImageServiceFetch(operation) {
                var that = this;
                var cacheId = operation.cacheId;
                var url = operation.url;
                var networkCallRequired = operation.networkCallRequired;
                var marker = performance.now();
                msWriteProfilerMark("Platform:fetchImage:" + marker + ":s");
                var imageService = this._getImageService(cacheId);
                if (imageService && url && url.length > 0) {
                    operation["promise"] = imageService.fetchImageAsync(url).then(function imageProxyService_fetchImageAsyncComplete(response) {
                        that._operationFinished(operation);
                        msWriteProfilerMark("Platform:fetchImage:" + marker + ":e");
                        operation.complete(response.dataString)
                    }, function imageProxyService_fetchImageAsyncError(url) {
                        that._operationFinished(operation);
                        msWriteProfilerMark("Platform:fetchImage:" + marker + ":e");
                        operation.error(url)
                    }, function imageProxyService_fetchImageAsyncProgress(progress) {
                        if (progress.statusCode === Platform.DataServices.QueryServiceStatusCode.cachedEntryNotFound && networkCallRequired) {
                            networkCallRequired()
                        }
                    })
                }
                else {
                    that._operationFinished(operation);
                    msWriteProfilerMark("Platform:fetchImage:" + marker + ":e");
                    operation.complete(url)
                }
            }, dispose: function dispose() {
                var that = this;
                this._disposed = true;
                for (var x in this._currentRunningOperations) {
                    msSetImmediate(function imageProxyService_afterDispose(x) {
                        if (that._currentRunningOperations[x] && that._currentRunningOperations[x].isRunning && that._currentRunningOperations[x].promise) {
                            that._currentRunningOperations[x].promise.cancel()
                        }
                    }, x)
                }
                for (var i = 0; i < this._currentOperations.length; i++) {
                    this._currentOperations[i].error({
                        message: "Canceled", reason: "ImageProxyServiceDispose"
                    })
                }
                this._imageCaches = {};
                this._currentOperations = []
            }
        })
    })
})();
(function appexPlatformCacheInit() {
    "use strict";
    WinJS.Namespace.define("PlatformJS.Cache", {
        CacheResponse: WinJS.Class.define(function cacheResponse_ctor(data, expiresOn) {
            this.dataValue = data;
            this.expiryTime = expiresOn
        }, {
            dataValue: null, expiryTime: null, isStale: function isStale() {
                var dt = new Date;
                return dt > this.expiryTime
            }
        }), CacheService: (function cacheServiceInit() {
            var _instance = {};
            function cacheConstructor(cacheId) {
                var _cacheService = new Platform.DataServices.CacheService(cacheId);
                var _dictionary = {};
                var _count = 0;
                this.addEntry = function (keyValue, cacheValue, cacheOptions) {
                    if (!keyValue || keyValue === "") {
                        throw { message: "Invalid key passed to addEntry function.  Please pass a valid key" };
                    }
                    if (!cacheValue) {
                        throw { message: "Invalid value passed to addEntry function.  Please pass a valid value" };
                    }
                    var inMemorySupport = cacheOptions && cacheOptions.supportsInMemory;
                    var cacheValueString = JSON.stringify(cacheValue);
                    var doNotPurge = false;
                    var eTag = "";
                    var writeEntryPromise = _cacheService.writeEntryAsync(keyValue, cacheValueString, eTag, doNotPurge).then(function writeEntryAsync_CompletionHandler(expiryDateTime) {
                        var existsInCache = _dictionary[keyValue];
                        if (inMemorySupport) {
                            if (!existsInCache) {
                                purgeStaleEntries();
                                _count++
                            }
                            _dictionary[keyValue] = {
                                touched: true, value: new PlatformJS.Cache.CacheResponse(cacheValue, expiryDateTime)
                            }
                        }
                        else if (existsInCache) {
                            delete _dictionary[keyValue];
                            _count--
                        }
                        return expiryDateTime
                    }, function writeEntryAsync_ErrorHandler() {
                        return null
                    });
                    return writeEntryPromise
                };
                this.findEntry = function (key, cacheOptions) {
                    var inMemorySupport = cacheOptions && cacheOptions.supportsInMemory;
                    var bypassInMemory = cacheOptions && cacheOptions.bypassInMemory;
                    var existsInCache = _dictionary[key];
                    if (!bypassInMemory && inMemorySupport && existsInCache) {
                        existsInCache.touched = true;
                        return WinJS.Promise.wrap(existsInCache.value)
                    }
                    var fileNameOnly = cacheOptions && cacheOptions.fileNameOnly;
                    var expiryTime = null;
                    var readEntryPromise = _cacheService.readEntryAsync(key, fileNameOnly).then(function readEntryAsync_CompletionHandler(entry) {
                        if (entry) {
                            expiryTime = entry.expiryTime;
                            if (fileNameOnly) {
                                return entry.fileName
                            }
                            if (entry.fileName) {
                                return WinJS.Application.local.readText(entry.fileName)
                            }
                            else if (entry.data) {
                                return entry.data
                            }
                        }
                        return entry
                    }, function readEntryAsync_ErrorHandler() {
                        return null
                    }).then(function cacheService_readText_CompletionHandler(data) {
                        var cacheValue = null;
                        if (data) {
                            if (!fileNameOnly) {
                                try {
                                    data = JSON.parse(data)
                                }
                                catch (e) {
                                    data = null
                                }
                            }
                            if (data) {
                                cacheValue = new PlatformJS.Cache.CacheResponse(data, expiryTime);
                                if (inMemorySupport) {
                                    _dictionary[key] = {
                                        touched: true, value: cacheValue
                                    };
                                    if (!existsInCache) {
                                        purgeStaleEntries();
                                        _count++
                                    }
                                }
                            }
                        }
                        return cacheValue
                    }, function cacheService_readText_Error(data) {
                        return null
                    });
                    return readEntryPromise
                };
                this.removeEntry = function (key) {
                    var existsInCache = _dictionary[key];
                    if (existsInCache) {
                        delete _dictionary[key];
                        _count--
                    }
                    var deleteEntryPromise = _cacheService.removeEntryAsync(key);
                    return deleteEntryPromise
                };
                function purgeStaleEntries() {
                    var maxCount = _cacheService.inMemorySize;
                    if (_count > 1.1 * maxCount) {
                        for (var i = 0; i < 2 && _count > maxCount; i++) {
                            for (var item in _dictionary) {
                                if (_count < maxCount) {
                                    break
                                }
                                if (!_dictionary[item].touched) {
                                    delete _dictionary[item];
                                    _count--
                                }
                                else {
                                    _dictionary[item].touched = false
                                }
                            }
                        }
                    }
                }
                ;
            }
            return new function _utilities_3318() {
                this.reset = function reset() {
                    _instance = {}
                };
                this.getInstance = function (key) {
                    if (!_instance[key]) {
                        _instance[key] = new cacheConstructor(key);
                        _instance[key].constructor = null
                    }
                    return _instance[key]
                }
            }
        })()
    })
})();
(function appexPlatformSourcesInit() {
    "use strict";
    WinJS.Namespace.define("PlatformJS.FeaturedPartners", {
        Sources: WinJS.Class.define(function sources_ctor() {
            this._currentMarket = Platform.Configuration.ConfigurationManager.instance.currentConfigurationFolderName
        }, {
            _currentMarket: null, getSourcesForCategory: function getSourcesForCategory(category) {
                return;
                PlatformJS.Cache.CacheService.getInstance("ConfigurationCache").findEntry(this._currentMarket + "-Features", { supportsInMemory: true }).then(function getFeaturesConfig_Complete(response) {
                    var featuredSources = [];
                    if (response && response.dataValue && response.dataValue.length > 0) {
                        for (var i = 0; i < sources.length; i++) {
                            if (sources[i].category.match(category)) {
                                featuredSources.push(sources[i])
                            }
                        }
                    }
                    return featuredSources
                })
            }, getSourceForID: function getSourceForID(ID) {
                var that = this;
                var channelManager = PlatformJS.Navigation.mainNavigator.channelManager;
                var defaultChannel = channelManager.resolveChannel("Home", "standard");
                return new WinJS.Promise(function _utilities_3369(complete, error, progress) {
                    var cacheInstance = PlatformJS.Cache.CacheService.getInstance("ConfigurationCache");
                    var searchEntry = that._currentMarket + "-Features";
                    channelManager.downloadFeaturesConfigAsync().then(function downloadComplete() {
                        cacheInstance.findEntry(searchEntry, { supportsInMemory: true }).then(function getFeaturesConfig_Complete(response) {
                            var returnValue = null;
                            if (response && response.dataValue && response.dataValue.sources) {
                                var channel = channelManager.parseChannel({ destination: "//sources/" + ID }, response.dataValue.sources);
                                if (channel) {
                                    if (channel.state.dynamicInfo) {
                                        channel.state.dynamicInfo.entrypoint = "deeplink"
                                    }
                                    returnValue = channel
                                }
                                else {
                                    returnValue = defaultChannel
                                }
                            }
                            complete(returnValue)
                        }, function _utilities_3393() {
                            complete(defaultChannel)
                        })
                    }, function downloadError() {
                        complete(defaultChannel)
                    })
                })
            }
        })
    });
    WinJS.Namespace.define("CommonJS.Globalization", {
        _marketStringForEditorial: null, getMarketStringForEditorial: function getMarketStringForEditorial() {
            var that = this;
            if (!that._marketStringForEditorial) {
                that._marketStringForEditorial = Platform.Configuration.ConfigurationManager.getMarketStringForEditorial()
            }
            return that._marketStringForEditorial
        }
    });
    WinJS.Namespace.define("CommonJS.Partners.Config", {
        _partnerContainers: {}, _partnerRoamingContainers: {}, _partnerConfigDictionaries: {}, _partnerConfigCallback: {}, _getConfigDictionary: function _getConfigDictionary(partnerName) {
            if (!CommonJS.Partners.Config._partnerConfigDictionaries[partnerName]) {
                CommonJS.Partners.Config._partnerConfigDictionaries[partnerName] = PlatformJS.Services.configuration.getDictionary(partnerName)
            }
            return CommonJS.Partners.Config._partnerConfigDictionaries[partnerName]
        }, _getConfigContainer: function _getConfigContainer(partnerName, isRoamingSetting) {
            var storage = Windows.Storage;
            if (!isRoamingSetting) {
                if (!CommonJS.Partners.Config._partnerContainers[partnerName]) {
                    CommonJS.Partners.Config._partnerContainers[partnerName] = storage.ApplicationData.current.localSettings.createContainer(partnerName, storage.ApplicationDataCreateDisposition.always).values
                }
                return CommonJS.Partners.Config._partnerContainers[partnerName]
            }
            else {
                if (!CommonJS.Partners.Config._partnerRoamingContainers[partnerName]) {
                    CommonJS.Partners.Config._partnerRoamingContainers[partnerName] = storage.ApplicationData.current.roamingSettings.createContainer(partnerName, storage.ApplicationDataCreateDisposition.always).values
                }
                return CommonJS.Partners.Config._partnerRoamingContainers[partnerName]
            }
        }, registerPostReadingConfig: function registerPostReadingConfig(configName, postReadingCallback) {
            CommonJS.Partners.Config._partnerConfigCallback[configName] = postReadingCallback
        }, getConfig: function getConfig(partnerName, configName, defaultValue, isRoamingSetting) {
            if (!partnerName || !configName) {
                return defaultValue
            }
            var configValue = CommonJS.Partners.Config._getConfigContainer(partnerName, isRoamingSetting)[configName];
            if (configValue === null || configValue === undefined) {
                var dictionary = CommonJS.Partners.Config._getConfigDictionary(partnerName);
                if (dictionary) {
                    if (typeof (defaultValue) === "number") {
                        configValue = dictionary.getInt32(configName, defaultValue)
                    }
                    else if (typeof (defaultValue) === "boolean") {
                        configValue = dictionary.getBool(configName, defaultValue)
                    }
                    else if (Array.isArray(defaultValue)) {
                        configValue = dictionary.getList(configName)
                    }
                    else if (typeof (defaultValue) === "object") {
                        configValue = dictionary.getDictionary(configName)
                    }
                    else {
                        configValue = dictionary.getString(configName, defaultValue)
                    }
                }
                else {
                    configValue = defaultValue
                }
            }
            var callback = CommonJS.Partners.Config._partnerConfigCallback[configName];
            if (callback) {
                configValue = callback(configValue, partnerName, configName)
            }
            return configValue
        }, setConfig: function setConfig(partnerName, configName, configValue, isRoamingSetting) {
            var container = CommonJS.Partners.Config._getConfigContainer(partnerName, isRoamingSetting);
            container[configName] = configValue;
            if (isRoamingSetting) {
                Windows.Storage.ApplicationData.current.signalDataChanged()
            }
        }
    });
    WinJS.Namespace.define("CommonJS.Partners", {
        Debug: WinJS.Class.define(function _utilities_3510() {
            this.output = ""
        }, {
            output: "", log: function log(string, jsonObj) {
                if (PlatformJS.isDebug) {
                    if (jsonObj) {
                        this.output += string + " " + JSON.stringify(jsonObj) + "\n"
                    }
                    else {
                        this.output += string + "\n"
                    }
                }
            }
        }, {
            _instance: null, instance: {
                get: function get() {
                    if (!CommonJS.Partners.Debug._instance) {
                        CommonJS.Partners.Debug._instance = new CommonJS.Partners.Debug
                    }
                    return CommonJS.Partners.Debug._instance
                }
            }
        })
    })
})();
(function appexEntityIdConverterInit() {
    "use strict";
    var _base32Digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    var _base62Digits = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var _maxLengthBase32 = 20;
    var _numDigits = 10;
    var _numChars = 26;
    var _base32Base = 32;
    var _base62Base = 62;
    var _base62Map = [];
    (function _initialize() {
        var totalLength = 'z'.charCodeAt(0) + 1;
        _base62Map = [];
        var i = 0,
            ch,
            charStart,
            charEnd;
        for (; i < totalLength; i++) {
            _base62Map[i] = -1
        }
        charStart = '0'.charCodeAt(0);
        charEnd = '9'.charCodeAt(0);
        for (ch = charStart; ch <= charEnd; ch++) {
            _base62Map[ch] = ch - charStart
        }
        charStart = 'a'.charCodeAt(0);
        charEnd = 'z'.charCodeAt(0);
        for (ch = charStart; ch <= charEnd; ch++) {
            _base62Map[ch] = ch - charStart + _numDigits
        }
        charStart = 'A'.charCodeAt(0);
        charEnd = 'Z'.charCodeAt(0);
        for (ch = charStart; ch <= charEnd; ch++) {
            _base62Map[ch] = ch - charStart + _numDigits + _numChars
        }
    })();
    function _multiply(base32Array, val) {
        var carry = 0;
        var digit,
            v;
        for (var i = _maxLengthBase32 - 1; i >= 0; i--) {
            digit = base32Array[i] || 0;
            v = digit * val + carry;
            base32Array[i] = v % _base32Base;
            carry = Math.floor(v / _base32Base)
        }
    }
    function _add(base32Array, val) {
        var carry = val;
        var digit,
            v;
        for (var i = _maxLengthBase32 - 1; i >= 0; i--) {
            digit = base32Array[i] || 0;
            v = digit + carry;
            base32Array[i] = v % _base32Base;
            carry = Math.floor(v / _base32Base);
            if (carry === 0) {
                break
            }
        }
    }
    function _convertBase62ToBase32(base62String) {
        var base32Array = [];
        var zCharCode = 'z'.charCodeAt(0);
        for (var i = 0, base62Len = base62String.length; i < base62Len; i++) {
            var ch = base62String.charCodeAt(i);
            var digit = -1;
            if (ch <= zCharCode) {
                digit = _base62Map[ch]
            }
            if (digit < 0) {
                throw new Error("invalid base62 string");
            }
            _multiply(base32Array, _base62Base);
            _add(base32Array, digit)
        }
        var start = -1;
        for (var i = 0; i < _maxLengthBase32; i++) {
            var digit = base32Array[i] || 0;
            if ((start < 0) && digit) {
                start = i
            }
            base32Array[i] = _base32Digits[digit]
        }
        if (start < 0) {
            start = _maxLengthBase32 - 1
        }
        return base32Array.slice(start).join("")
    }
    WinJS.Namespace.define("PlatformJS.Utilities.EntityIdConverter", { convertBase62ToBase32: _convertBase62ToBase32 })
})();
(function appexPlatformBootCacheDefinition() {
    "use strict";
    WinJS.Namespace.define("PlatformJS", {
        BootCache: WinJS.Class.define(function BootCache_ctor() {
            this._cacheContainer = {};
            this._prefetchUrlContainer = {};
            this._prefetchStates = {}
        }, {
            _cacheContainer: null, _prefetchUrlContainer: null, _prefetchStates: null, _isInitialized: false, _hasUnsavedData: false, _cacheFileParseSuccess: false, _prefetchCompletePromise: null, initializeAsync: function initializeAsync() {
                var cacheFileFound = false;
                if (this._isInitialized) {
                    return WinJS.Promise.wrap(this._cacheFileParseSuccess)
                }
                else {
                    var that = this;
                    return WinJS.Application.local.exists(PlatformJS.BootCache._cacheFileName).then(function cacheFileExists(exists) {
                        if (exists) {
                            cacheFileFound = true;
                            return WinJS.Application.local.readText(PlatformJS.BootCache._cacheFileName, null)
                        }
                        else {
                            msWriteProfilerMark("bootCache:cache file not found")
                        }
                        return WinJS.Promise.wrap(null)
                    }).then(function readText_CompletionHandler(dataString) {
                        msWriteProfilerMark("bootCache:initialize:loaded from disk");
                        if (!that._isInitialized && cacheFileFound) {
                            msWriteProfilerMark("bootCache:initialize:parseString:s");
                            try {
                                var data = dataString ? JSON.parse(dataString) : null;
                                if (data) {
                                    that._cacheContainer = data.cache || {};
                                    that._prefetchUrlContainer = data.prefetch || {}
                                }
                                else {
                                    that._cacheContainer = {};
                                    that._prefetchUrlContainer = {}
                                }
                                that._cacheFileParseSuccess = true;
                                that.startPrefetchRequests();
                                PlatformJS.modernPerfTrack.launchDetails |= (1 << 9)
                            }
                            catch (ex) {
                                msWriteProfilerMark("bootCache:error parsing cache file content")
                            }
                            msWriteProfilerMark("bootCache:initialize:parseString:e")
                        }
                        that._isInitialized = true;
                        return WinJS.Promise.wrap(that._cacheFileParseSuccess)
                    }, function bootCacheInitErrorHandler(error) {
                        that._isInitialized = true;
                        msWriteProfilerMark("bootCache:error loading cache from file");
                        return WinJS.Promise.wrap(that._cacheFileParseSuccess)
                    })
                }
            }, addOrUpdateEntry: function addOrUpdateEntry(key, value) {
                if (!key) {
                    return WinJS.Promise.wrap(false)
                }
                var that = this;
                return this.initializeAsync().then(function addEntryHandler() {
                    that._cacheContainer[key] = value;
                    that._hasUnsavedData = true;
                    msWriteProfilerMark("bootCache:addEntry: " + key);
                    return true
                })
            }, addorUpdatePrefetchUrl: function addorUpdatePrefetchUrl(key, url) {
                var that = this;
                return this.initializeAsync().then(function addPrefetchHandler() {
                    that._prefetchUrlContainer[key] = url;
                    that._hasUnsavedData = true;
                    msWriteProfilerMark("bootCache:addPrefetchEntry: " + key + "," + url);
                    return true
                })
            }, startPrefetchRequests: function startPrefetchRequests() {
                var that = this;
                for (var prefetchKey in that._prefetchUrlContainer) {
                    this._prefetchStates[prefetchKey] = {
                        ready: false, data: null, error: false
                    }
                }
                this._prefetchCompletePromise = new WinJS.Promise(function _bootCache_123(complete) {
                    var itemPrefetched = false;
                    for (var key in that._prefetchUrlContainer) {
                        itemPrefetched = true;
                        that.startPrefetchRequest(key, complete)
                    }
                    if (!itemPrefetched) {
                        complete(null)
                    }
                })
            }, startPrefetchRequest: function startPrefetchRequest(key, allRequestsCompletedHandler) {
                var httpClient = new Windows.Web.Http.HttpClient;
                var uri = new Windows.Foundation.Uri(this._prefetchUrlContainer[key]);
                var that = this;
                httpClient.getStringAsync(uri).done(function bootCachePrefetchComplete(result) {
                    var responseData = that._prefetchStates[key];
                    responseData.ready = true;
                    responseData.data = result;
                    var isAllCompleted = true;
                    for (var promiseKey in that._prefetchStates) {
                        isAllCompleted = isAllCompleted && that._prefetchStates[promiseKey].ready
                    }
                    if (isAllCompleted) {
                        allRequestsCompletedHandler(null)
                    }
                }, function bootCachePrefetchError(result) {
                    var responseData = that._prefetchStates[key];
                    responseData.error = true;
                    responseData.ready = true;
                    var isAllCompleted = true;
                    for (var promiseKey in that._prefetchStates) {
                        isAllCompleted = isAllCompleted && that._prefetchStates[promiseKey].ready
                    }
                    if (isAllCompleted) {
                        allRequestsCompletedHandler(null)
                    }
                })
            }, getPrefetchRequest: function getPrefetchRequest(key) {
                if (!this._isInitialized) {
                    throw new Error("BootCache is not yet initialized.");
                }
                var found = key && this._prefetchStates && this._prefetchStates.hasOwnProperty(key);
                if (!found) {
                    return null
                }
                return this._prefetchStates[key]
            }, isPrefetchCompleteAsync: function isPrefetchCompleteAsync() {
                return this._prefetchCompletePromise
            }, hasEntryAsync: function hasEntryAsync(key) {
                var that = this;
                return this.initializeAsync().then(function hasEntryAsyncHandler() {
                    return that.hasEntry(key)
                })
            }, hasEntry: function hasEntry(key) {
                if (!this._isInitialized) {
                    throw new Error("BootCache is not yet initialized.");
                }
                var found = key && this._cacheContainer && this._cacheContainer.hasOwnProperty(key);
                if (found) {
                    msWriteProfilerMark("bootCache:hasEntry:found: " + key)
                }
                else {
                    msWriteProfilerMark("bootCache:hasEntry:notFound: " + key)
                }
                return found
            }, getEntry: function getEntry(key, fallbackDelegate) {
                if (this.hasEntry(key)) {
                    return this._cacheContainer[key]
                }
                else if (typeof fallbackDelegate === 'function') {
                    var entry;
                    try {
                        entry = fallbackDelegate(key)
                    }
                    catch (exception) {
                        msWriteProfilerMark("bootCache:getEntry:error calling delegate");
                        return null
                    }
                    if (typeof entry === "undefined") {
                        throw new Error("The delegate returned 'undefined'");
                    }
                    else if (WinJS.Promise.is(entry)) {
                        throw new Error("The delegate should not return a promise. Use getEntryAsync if the delegate can return a promise.");
                    }
                    this.addOrUpdateEntry(key, entry);
                    msWriteProfilerMark("bootCache:getEntry:got cache entry from delegate");
                    return entry
                }
                else {
                    return null
                }
            }, getEntryAsync: function getEntryAsync(key, fallbackDelegate) {
                var that = this;
                return this.initializeAsync().then(function getEntryAsyncHandler() {
                    if (that.hasEntry(key)) {
                        return that._cacheContainer[key]
                    }
                    else if (typeof fallbackDelegate === 'function') {
                        try {
                            return WinJS.Promise.wrap(fallbackDelegate(key)).then(function fallbackDelegate_completion(entry) {
                                that.addOrUpdateEntry(key, entry);
                                msWriteProfilerMark("bootCache:getEntry:got cache entry from delegate");
                                return entry
                            })
                        }
                        catch (exception) {
                            msWriteProfilerMark("bootCache:getEntry:error calling delegate");
                            return null
                        }
                    }
                    else {
                        return null
                    }
                })
            }, saveCacheToDisk: function saveCacheToDisk() {
                if (this._hasUnsavedData === true) {
                    try {
                        var that = this;
                        msWriteProfilerMark("bootCache:serializeCacheData:s");
                        var dataString = JSON.stringify({
                            cache: this._cacheContainer, prefetch: this._prefetchUrlContainer
                        });
                        msWriteProfilerMark("bootCache:serializeCacheData:e");
                        return WinJS.Application.local.writeText(PlatformJS.BootCache._cacheFileName, dataString).then(function writeText_CompletionHandler() {
                            that._hasUnsavedData = false;
                            msWriteProfilerMark("bootCache:saveCacheToDisk:done");
                            return true
                        }, function writeText_ErrorHandler(error) {
                            msWriteProfilerMark("bootCache:saveCacheToDisk:Error: " + error);
                            return false
                        })
                    }
                    catch (exception) {
                        msWriteProfilerMark("bootCache:saveCacheToDisk:Error stringifying the cache object")
                    }
                }
                else {
                    msWriteProfilerMark("bootCache:saveCacheToDisk:nothingToSave");
                    return WinJS.Promise.wrap(true)
                }
                return WinJS.Promise.wrap(false)
            }, reset: function reset() {
                this._cacheContainer = {};
                msWriteProfilerMark("bootCache:Reset");
                this._hasUnsavedData = true;
                return this.saveCacheToDisk()
            }, deleteEntry: function deleteEntry(key) {
                if (!this.hasEntry(key)) {
                    msWriteProfilerMark("bootCache:delete:NoMatchFound: " + key);
                    return false
                }
                delete this._cacheContainer[key];
                this._hasUnsavedData = true;
                msWriteProfilerMark("bootCache:delete: " + key);
                return true
            }
        }, {
            _instanceHandle: null, _cacheFileName: "BootCache.json", instance: {
                get: function get() {
                    if (!PlatformJS.BootCache._instanceHandle) {
                        PlatformJS.BootCache._instanceHandle = new PlatformJS.BootCache
                    }
                    return PlatformJS.BootCache._instanceHandle
                }
            }
        })
    })
})();
(function _PrefetchUI_1() {
    "use strict";
    var _PrefetchStateEnum = {
        NotStarted: "notStarted", Partial: "partial", Completed: "completed", CompletedWithError: "completedWithError"
    };
    WinJS.Namespace.define("PlatformJS.PrefetchUI", {
        PrefetchUI: WinJS.Class.define(function prefetchUICtor() { }, {
            _downloadContainerStart: null, _downloadContainerEnd: null, _savedWatermark: "", _show: true, init: function init() {
                this._initEventHandlers();
                this._recordPrefetchPreferences();
                this._downloadContainerStart = "<div id=\"downloadPanoContainer\"><span class=\"downloadLabel\" id=\"downloadLabel\">" + PlatformJS.Services.resourceLoader.getString("DownloadingArticles") + "</span><progress class=\"downloadProgress\" id=\"downloadProgress\" value=\"";
                this._downloadContainerEnd = "\" max=\"100\"></progress></div>"
            }, _buildPrefetchProgressBar: function _buildPrefetchProgressBar(progressValue) {
                if (PlatformJS.mainProcessManager.retailModeEnabled) {
                    return ""
                }
                return this._downloadContainerStart + progressValue + this._downloadContainerEnd
            }, _buildPrefetchEndedMsg: function _buildPrefetchEndedMsg(prefetchEndState) {
                if (PlatformJS.mainProcessManager.retailModeEnabled) {
                    return ""
                }
                var prefetchCompleteTime;
                var message;
                switch (prefetchEndState) {
                    case _PrefetchStateEnum.NotStarted:
                        prefetchCompleteTime = Windows.Storage.ApplicationData.current.localSettings.values["PrefetchLastUpdateTime"];
                        message = null;
                        break;
                    case _PrefetchStateEnum.Partial:
                        prefetchCompleteTime = Windows.Storage.ApplicationData.current.localSettings.values["PrefetchLastUpdateTime"];
                        message = PlatformJS.Services.resourceLoader.getString("DownloadingArticlesErrorOffline");
                        break;
                    case _PrefetchStateEnum.CompletedWithError:
                        prefetchCompleteTime = Windows.Storage.ApplicationData.current.localSettings.values["PrefetchLastUpdateTime"];
                        message = "\u26A0 " + PlatformJS.Services.resourceLoader.getString("DownloadingArticlesError");
                        break;
                    case _PrefetchStateEnum.Completed:
                        prefetchCompleteTime = new Date;
                        message = PlatformJS.Services.resourceLoader.getString("LastUpdatedBingDaily");
                        Windows.Storage.ApplicationData.current.localSettings.values["PrefetchLastUpdateTime"] = prefetchCompleteTime;
                        break
                }
                return PlatformJS.Utilities.buildLastUpdatedElement([prefetchCompleteTime], message)
            }, _initEventHandlers: function _initEventHandlers() {
                var that = this;
                Platform.Process.registerPlatformUIEventHandler("prefetch_progress", function prefetchProgress(eventName, obj) {
                    var vals = obj.message.split('/');
                    var count = vals.length > 0 ? vals[0] : null;
                    var total = vals.length > 1 ? vals[1] : null;
                    if (count && total) {
                        var innerHtml = that._buildPrefetchProgressBar(count / total * 100);
                        if (that._show) {
                            CommonJS.Watermark.setWatermarkHtml(innerHtml)
                        }
                        else {
                            that._savedWatermark = innerHtml
                        }
                    }
                });
                Platform.Process.registerPlatformUIEventHandler("prefetch_end", function prefetchComplete(eventName, obj) {
                    var innerHtml = that._buildPrefetchEndedMsg(obj.message);
                    var manager = PlatformJS.mainProcessManager;
                    if (manager.prefetchEnd) {
                        manager.prefetchEnd()
                    }
                    if (that._show) {
                        CommonJS.Watermark.setWatermarkHtml(innerHtml)
                    }
                    else {
                        that._savedWatermark = innerHtml
                    }
                })
            }, hide: function hide() {
                this._show = false;
                var watermark = document.querySelector(".platformWatermark");
                if (watermark) {
                    this._savedWatermark = watermark.innerHTML
                }
            }, show: function show() {
                this._show = true;
                CommonJS.Watermark.setWatermarkHtml(this._savedWatermark)
            }, prefetchToggled: {
                get: function get() {
                    _prefetchToggled.supportedForProcessing = true;
                    return _prefetchToggled
                }
            }, _prefetchToggled: function _prefetchToggled() {
                var toggleControl = PlatformJS.Utilities.getControl(event.currentTarget);
                if (toggleControl && (toggleControl.checked === true || toggleControl.checked === false)) {
                    Platform.QueryService.togglePrefetch(toggleControl.checked);
                    if (!toggleControl.checked) {
                        Platform.DataServices.PrefetchManager.cancelAll()
                    }
                    this._recordPrefetchPreferences()
                }
            }, _recordPrefetchPreferences: function _recordPrefetchPreferences() {
                var prefetchPreferences = {};
                prefetchPreferences["Prefetch/IsEnabled"] = Platform.DataServices.PrefetchManager.isPrefetchEnabled;
                var jsonString = JSON.stringify(prefetchPreferences);
                PlatformJS.Telemetry.flightRecorder.logPreferencesAsJson(PlatformJS.Telemetry.logLevel.normal, jsonString)
            }
        }, {})
    })
})();
(function appexPlatformCSSViewInit() {
    "use strict";
    WinJS.Namespace.define("PlatformJS.Tools", {
        prevBorderStyle: null, prevElement: null, prevHoverElement: null, defaultStyle: {}, POPUP_RIGHT_OFFSET: 50, POPUP_LEFT_OFFSET: 550, popup: document.createElement("div"), basicInfo: document.createElement("div"), propertyNames: document.createElement("div"), propertyValues: document.createElement("div"), cssRulesContainer: document.createElement("div"), elementOverlay: document.createElement("div"), footer: document.createElement("div"), parentButton: document.createElement("div"), childButton: document.createElement("div"), copyRulesButton: document.createElement("div"), copyClassNamesButton: document.createElement("div"), noClickEvent: null, isOverPopup: false, init: function init() {
            this.popup.id = "cssview",
                this.popup.style.display = "none";
            this.popup.style.width = "450px";
            this.popup.style.height = "auto";
            this.popup.style.maxHeight = "600px";
            this.popup.style.position = "absolute";
            this.popup.style.backgroundColor = "#85b9e6";
            this.popup.style.zIndex = "10000";
            this.popup.style.border = "2px solid #000";
            this.popup.style.overflow = "hidden";
            this.popup.style.overflowY = "hidden";
            this.popup.style.top = "0px";
            this.elementOverlay.style.backgroundColor = "rgba(255, 0, 0, 0.3)";
            this.elementOverlay.style.display = "none";
            this.elementOverlay.style.position = "absolute";
            this.elementOverlay.style.top = "0px";
            this.elementOverlay.style.left = "0px";
            this.elementOverlay.style.border = "2px solid red";
            this.elementOverlay.style.pointerEvents = "none";
            this.basicInfo.style.backgroundColor = "#69C";
            this.basicInfo.style.width = "430px";
            this.basicInfo.style.height = "auto";
            this.basicInfo.style.overflow = "hidden";
            this.basicInfo.style.marginBottom = "15px";
            this.basicInfo.style.padding = "10px";
            this.cssRulesContainer.style.width = "auto";
            this.cssRulesContainer.style.height = "auto";
            this.cssRulesContainer.style.maxHeight = "350px";
            this.cssRulesContainer.style.fontSize = "12.66px";
            this.cssRulesContainer.style.color = "#000000";
            this.cssRulesContainer.style.padding = "10px";
            this.cssRulesContainer.style.overflow = "scroll";
            this.cssRulesContainer.style.msOverflowStyle = "-ms-autohiding-scrollbar";
            var propertiesContainer = document.createElement("div");
            propertiesContainer.style.height = "auto";
            propertiesContainer.style.maxHeight = "350px";
            propertiesContainer.style.padding = "10px";
            propertiesContainer.style.overflowY = "auto";
            propertiesContainer.style.visibility = "collapse";
            this.propertyNames.height = "400px";
            this.propertyNames.style.width = "auto";
            this.propertyNames.style.fontSize = "12.66px";
            this.propertyNames.style.color = "#000000";
            this.propertyValues.style.width = "200px";
            this.propertyValues.style.whiteSpace = "nowrap";
            this.propertyValues.style.paddingLeft = "10px";
            this.footer.style.height = "88px";
            this.footer.style.backgroundColor = "#000";
            var closeButton = new this.footerButton("AppexSymbolFont", "\u274C", "Hide", this.hidePopup);
            closeButton.style.float = "right";
            closeButton.style.marginRight = "-12px";
            var copyRuleNamesButton = new this.footerButton("Segoe UI Symbol", "\uE16C", "Copy Name(s)", this.copyNames);
            var copyRulesButton = new this.footerButton("Segoe UI Symbol", "\uE16C", "Copy Style(s)", this.copyRules);
            var moveToParentButton = new this.footerButton("Segoe UI Symbol", "\u25B2", "Parent", this.moveToParent);
            var moveToChildButton = new this.footerButton("Segoe UI Symbol", "\u25BC", "Child", this.moveToChild);
            moveToParentButton.firstChild.children[0].style.marginTop = "-4px";
            this.footer.appendChild(closeButton);
            this.footer.appendChild(moveToParentButton);
            this.footer.appendChild(moveToChildButton);
            this.footer.appendChild(copyRuleNamesButton);
            this.footer.appendChild(copyRulesButton);
            propertiesContainer.appendChild(this.propertyNames);
            propertiesContainer.appendChild(this.propertyValues);
            this.popup.appendChild(this.basicInfo);
            this.popup.appendChild(propertiesContainer);
            this.popup.appendChild(this.cssRulesContainer);
            this.popup.appendChild(this.footer);
            document.body.appendChild(this.elementOverlay);
            document.body.appendChild(this.popup);
            this.popup.onmouseover = function (e) {
                var that = this;
                that.isOverPopup = true;
                e.stopPropagation()
            };
            this.popup.onmouseout = function (e) {
                var that = this;
                that.isOverPopup = false;
                e.stopPropagation()
            };
            var b = Windows.Storage.ApplicationData.current.localFolder.path;
            var c = Windows.Storage.PathIO.readTextAsync(b + "\common\less\platform.less");
            this.defaultStyles = document.defaultView.getComputedStyle(document.createElement("div"));
            this.noClickEvent = function (e) {
                var that = PlatformJS.Tools;
                var ele = e.srcElement;
                if (ele.winControl) {
                    if (ele.winControl._label === "CSS View") {
                        return true
                    }
                    else if ((ele.winControl._label === "Parent") || (ele.winControl._label === "Child") || (ele.winControl._label === "Hide") || (ele.winControl._label === "Copy Name(s)") || (ele.winControl._label === "Copy Style(s)")) {
                        return false
                    }
                }
                if (that.NotPopup(ele) && that.elementOverlay.style.display === "block") {
                    that.elementClick(e);
                    if (e.preventDefault) {
                        e.preventDefault();
                        e.stopPropagation();
                        return false
                    }
                    e.returnValue = false;
                    e.cancelBubble = true
                }
                return false
            };
            document.body.addEventListener("click", this.noClickEvent, true);
            document.body.addEventListener("MSPointerDown", this.noClickEvent, true);
            document.body.addEventListener("MSPointerUp", this.noClickEvent, true);
            document.body.addEventListener("mouseover", this.onDocMouseOver)
        }, elementClick: function elementClick(e) {
            var that = PlatformJS.Tools;
            that.showPopup(e)
        }, copyNames: function copyNames() {
            var that = PlatformJS.Tools;
            if (that.prevElement !== null) {
                window.clipboardData.setData("Text", that.prevElement.className)
            }
        }, copyRules: function copyRules() {
            var that = PlatformJS.Tools;
            if (that.prevElement !== null) {
                window.clipboardData.setData("Text", that.cssRulesContainer.innerText)
            }
        }, moveToParent: function moveToParent(e) {
            var that = PlatformJS.Tools;
            if (that.prevElement.parentElement !== null) {
                var e = [];
                e.srcElement = that.prevElement.parentElement;
                e.clientY = that.getElementAbsolutePos(that.prevElement.parentElement)[1];
                that.showElementOverlay(that.prevElement.parentElement);
                that.showPopup(e)
            }
        }, moveToChild: function moveToChild(e) {
            var that = PlatformJS.Tools;
            if (that.prevElement.children.length > 0) {
                var e = [];
                e.srcElement = that.prevElement.children[0];
                e.clientY = that.getElementAbsolutePos(e.srcElement)[1];
                that.showElementOverlay(e.srcElement);
                that.showPopup(e)
            }
            return true
        }, footerButton: function footerButton(font, icon, labelName, event) {
            var button = document.createElement("button");
            var buttonControl = new WinJS.UI.AppBarCommand(button, {
                icon: icon, extraClass: "#filtermenu-Left"
            });
            buttonControl.label = labelName;
            buttonControl.onclick = event;
            button.style.marginRight = "-12px";
            return button
        }, onDocMouseOver: function onDocMouseOver(e) {
            var that = PlatformJS.Tools;
            that.showElementOverlay(e.srcElement)
        }, showElementOverlay: function showElementOverlay(ele) {
            var that = PlatformJS.Tools;
            if (ele !== that.popup && ele !== that.elementOverlay) {
                if (!that.isOverPopup && ele !== that.propertyNames && ele !== that.propertyValues && ele !== that.basicInfo && ele !== that.elementOverlay) {
                    that.prevHoverElement = ele;
                    var pos = that.getElementAbsolutePos(that.prevHoverElement);
                    that.elementOverlay.style.left = pos[0] + "px";
                    that.elementOverlay.style.top = pos[1] + "px";
                    that.elementOverlay.style.width = that.prevHoverElement.offsetWidth + "px";
                    that.elementOverlay.style.height = that.prevHoverElement.offsetHeight + "px";
                    that.elementOverlay.style.display = "block"
                }
            }
        }, createOnlyModifiedCSS: function createOnlyModifiedCSS(ele) {
            var styleNamesToShow = [];
            var styleValuesToShow = [];
            var styles = document.defaultView.getComputedStyle(ele);
            for (var i = 0; i < this.defaultStyles.length; i++) {
                if (styles.getPropertyValue(styles[i]) !== this.defaultStyles.getPropertyValue(this.defaultStyles[i])) {
                    var style = styles.getPropertyValue(styles[i]);
                    styleValuesToShow.push(styles.getPropertyValue(styles[i]));
                    styleNamesToShow.push(styles[i])
                }
            }
            var values = "";
            var names = "";
            for (var j = 0; j < styleValuesToShow.length; j++) {
                var styleValue = styleValuesToShow[j];
                var styleName = styleNamesToShow[j];
                if (styleValue !== "") {
                    values += styleValue + "<br/>";
                    names += "<strong>" + styleName + "</strong>" + ":" + "<br/>"
                }
            }
            this.propertyNames.innerHTML = names;
            this.propertyValues.innerHTML = values
        }, getStyle: function getStyle(className) {
            var x,
                sheet,
                classes;
            var result = "";
            for (sheet = document.styleSheets.length - 1; sheet >= 0; sheet--) {
                classes = document.styleSheets[sheet].rules;
                for (x = 0; x < classes.length; x++) {
                    if (classes[x].selectorText === "." + className) {
                        result = classes[x].cssText + "<br>";
                        return result
                    }
                    var reg = new RegExp("^" + classes[x].selectorText + "$", "g");
                    if (reg.test("." + className)) {
                        result += classes[x].cssText + "<br>"
                    }
                }
            }
            if (result === "") {
                return false
            }
            else {
                return result
            }
        }, showPopup: function showPopup(e) {
            var ele = e.srcElement;
            if (ele !== null) {
                var that = PlatformJS.Tools;
                that.prevElement = ele;
                var eleClassName;
                if (ele.className !== "") {
                    eleClassName = ele.className
                }
                else {
                    eleClassName = "NONE"
                }
                var eleId;
                if (ele.id !== "") {
                    eleId = ele.id
                }
                else {
                    eleId = "NONE"
                }
                that.basicInfo.innerHTML = "<strong> Class Name(s): </strong>" + eleClassName + "</br>" + "<strong> ID </strong> : " + eleId + "</br>";
                that.basicInfo.style.pointerEvents = "none";
                var eleClassText = "";
                that.cssRulesContainer.innerHTML = "";
                for (var i = 0; i < ele.classList.length; i++) {
                    eleClassText = that.getStyle(ele.classList[i]);
                    if (eleClassText !== false) {
                        eleClassText = eleClassText.replace(/(;)/gm, ";<br>&nbsp&nbsp");
                        eleClassText = eleClassText.replace(/({)/gm, "{<br>&nbsp&nbsp");
                        eleClassText = eleClassText.replace("&nbsp&nbsp }", "}<br>");
                        that.cssRulesContainer.innerHTML += eleClassText
                    }
                }
                var pos = that.getElementAbsolutePos(ele);
                var leftPosition = pos[0] + ele.offsetWidth;
                var topPosition = e.clientY;
                var height = that.popup.offsetHeight;
                var popupRightSide = leftPosition + that.popup.offsetWidth;
                var leftDistance = pos[0];
                var rightDistance = window.innerWidth - pos[0] + ele.offsetWidth;
                if (leftDistance >= rightDistance) {
                    leftPosition = pos[0] - that.popup.offsetWidth;
                    if (leftPosition < 0) {
                        leftPosition = 0
                    }
                }
                else {
                    leftPosition = pos[0] + ele.offsetWidth;
                    if (popupRightSide > window.innerWidth) {
                        leftPosition = window.innerWidth - that.popup.offsetWidth
                    }
                }
                that.popup.style.left = leftPosition + "px";
                if (height + topPosition > window.innerHeight) {
                    that.popup.style.top = (window.innerHeight - height - 20) + "px"
                }
                else {
                    that.popup.style.top = e.clientY.toString() + "px"
                }
                that.popup.style.display = "block"
            }
        }, getElementAbsolutePos: function getElementAbsolutePos(element) {
            var position = {};
            position.x = 0;
            position.y = 0;
            if (element !== null) {
                if (element.getBoundingClientRect) {
                    var box = element.getBoundingClientRect();
                    var body = document.body;
                    var docElem = document.documentElement;
                    var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
                    var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
                    var clientTop = docElem.clientTop || body.clientTop || 0;
                    var clientLeft = docElem.clientLeft || body.clientLeft || 0;
                    position.x = Math.round(box.left + scrollLeft - clientLeft);
                    position.y = Math.round(box.top + scrollTop - clientTop)
                }
            }
            return [position.x, position.y]
        }, NotPopup: function NotPopup(ele) {
            var that = PlatformJS.Tools;
            if ((ele === that.popup || ele === that.propertiesContainer || ele === that.basicInfo) || (ele === that.propertyNames || ele === that.propertyValues || ele === that.footer)) {
                return false
            }
            return true
        }, hidePopup: function hidePopup(e) {
            var that = PlatformJS.Tools;
            that.elementOverlay.style.display = "none";
            that.popup.style.display = "none";
            e.stopPropagation();
            return true
        }, resetToDefault: function resetToDefault() {
            var that = PlatformJS.Tools;
            document.body.removeEventListener("mouseover", that.onDocMouseOver);
            document.body.removeEventListener("click", that.noClickEvent, true);
            document.body.removeEventListener("MSPointerDown", that.noClickEvent, true);
            document.body.removeEventListener("MSPointerUp", that.noClickEvent, true);
            document.body.removeChild(this.elementOverlay);
            var view = document.getElementById("cssview");
            view.innerHTML = "";
            document.body.removeChild(view)
        }
    })
})()