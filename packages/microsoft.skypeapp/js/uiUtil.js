

(function () {
    "use strict";

    
    
    
    
    function sendEvent(type, element, eventDetailObj) {
        var evt = document.createEvent("CustomEvent");
        evt.initCustomEvent(type, true, true, eventDetailObj || {});
        element ? element.dispatchEvent(evt) : document.dispatchEvent(evt);
    }

    function getParentElementByClass(el, parentClassName) {
        var tempEl = el.parentNode;
        while (tempEl.parentNode && !WinJS.Utilities.hasClass(tempEl, parentClassName)) {
            tempEl = tempEl.parentNode;
        }
        if (tempEl === document) {
            return null;
        }
        return tempEl;
    }

    function isNodeOrParentFulfillPredicate(elem, predicate) {
        
        
        
        
        
        

        if (elem && predicate) {
            while (elem) {
                if (predicate(elem)) {
                    return elem;
                } else {
                    elem = elem.parentNode;
                }
            }
        }

        return false;
    }


    
    
    function setTemporaryClass(el, className, removeAfterMillis) {
        assert(el, "element for temporary CSS class");

        if (!className) {
            return;
        }
        if (typeof removeAfterMillis === 'number') { 
            el._timersForClassRemoval = el._timersForClassRemoval || [];
            el._timersForClassRemoval[className] && clearTimeout(el._timersForClassRemoval[className]);
            if (removeAfterMillis > 0) {
                WinJS.Utilities.addClass(el, className);
                el._timersForClassRemoval[className] = setTimeout(function () {
                    el && WinJS.Utilities.removeClass(el, className);
                }, removeAfterMillis);
            } else {
                WinJS.Utilities.removeClass(el, className);
            }
        }
    }

    function setSlowDownClass(el, removeAfterMillis) {
        setTemporaryClass(el, 'SLOWDOWNTRANSITION', removeAfterMillis);
    }

    function setNoTransitionClass(el, removeAfterMillis) {
        setTemporaryClass(el, 'NOTRANSITION', removeAfterMillis);
    }

    function addClassToAll(elementsArray, className) {
        var len = elementsArray.length;
        if (len) {
            for (; len--;) {
                WinJS.Utilities.addClass(elementsArray[len], className);
            }
        }
    }

    function setClass(element, name, addClass) {
        if (addClass) {
            WinJS.Utilities.addClass(element, name);
        } else {
            WinJS.Utilities.removeClass(element, name);
        }
    }

    function removeClassFromAll(elementsArray, className) {
        var len = elementsArray.length;
        if (len) {
            for (; len--;) {
                WinJS.Utilities.removeClass(elementsArray[len], className);
            }
        }
    }

    function animateInvoke(el, callback) {
        if (!el._animatingInvoke) {
            el._animatingInvoke = true;

            var anim = WinJS.UI.Animation;
            anim.pointerDown(el).done(function () {
                callback && setImmediate(callback);
                setTimeout(function () {
                    el._animatingInvoke = null;
                    anim.pointerUp(el);
                }, 167);
            });
        }
    }

    function preventTextLinks(el) {
        WinJS.Utilities.addClass(el, "preventTextLinks");

        el.addEventListener("click", function (e) {
            if (e.target.nodeName == "A") {
                e.preventDefault();
            }
        }, true);
    }

    function addMouseDownCss(selectorOrElement, selectorSearchInElement) {
        if (typeof selectorOrElement == "string") {
            WinJS.Utilities.query(selectorOrElement, selectorSearchInElement).listen("mousedown", _mouseDown);
        } else {
            selectorOrElement.addEventListener("mousedown", _mouseDown);
        }
    }

    var clickedOn;
    function _mouseDown(evt) {

        clickedOn && log("Error clickedOn exists");

        clickedOn = evt.currentTarget;

        
        document.addEventListener("mouseup", mouseUpOrOut);

        
        clickedOn.addEventListener("mouseout", mouseUpOrOut);

        WinJS.Utilities.addClass(clickedOn, "active");
    }

    function mouseUpOrOut(evt) {
        WinJS.Utilities.removeClass(clickedOn, "active");

        clickedOn.removeEventListener("mouseout", mouseUpOrOut);
        document.removeEventListener("mouseup", mouseUpOrOut);

        clickedOn = null;
    }

    

    function getCurrentViewStateName() {
        var curName = '';
        Object.keys(Windows.UI.ViewManagement.ApplicationViewState).forEach(function (key) {
            if (Windows.UI.ViewManagement.ApplicationViewState[key] === Windows.UI.ViewManagement.ApplicationView.value) {
                curName = key;
            }
        });
        return curName;
    }

    
    var letterUsedToClass = WinJS.Binding.converter(function (used) {
        return used ? "letter used" : "letter";
    });

    
    var lengthToTabIndex = WinJS.Binding.converter(function (length) {
        return length > 0 ? "0" : "-1";
    });

    var disableIfEmpty = WinJS.Binding.converter(function (length) {
        return (length && length > 0) ? "" : "disabled";
    });

    
    var addPercentSign = WinJS.Binding.converter(function (value) {
        return value + "%";
    });

    function getFormattedFileSize(size) {
        size = parseInt(size);
        var unit = "",
            unit_key,
            normalizedSize,
            isRounded = true,
            product;

        if (size > (1024 * 1024 * 1024)) {
            unit_key = "unit_gigabyte";
            normalizedSize = size / (1024 * 1024 * 1024);
        } else if (size > (1024 * 1024)) {
            unit_key = "unit_megabyte";
            normalizedSize = size / (1024 * 1024);
        } else if (size > 16) {
            unit_key = "unit_kilobyte";
            normalizedSize = size / 1024;
        } else {
            unit_key = "unit_byte";
            normalizedSize = size;
            isRounded = false;
        }

        unit = WinJS.Resources.getString(unit_key).value;
        product = (isRounded) ? parseFloat(normalizedSize.toFixed(2)) : normalizedSize;

        return Skype.Globalization.formatNumber(product, 0) + unit;
    }

    var getFormattedFileSizeConverter = WinJS.Binding.converter(function (size) {
        return getFormattedFileSize(size);
    });

    function getTrackingParam(goLink) {
        var trackingPlatform = "windows8_" + Skype.Version.getPlatformId();
        return "intsrc=client-_-{0}-_-{1}-_-{2}".format(trackingPlatform, Skype.Version.uiVersion(true), goLink);
    }

    
    function isHTMLNode(obj) {
        return (typeof obj === "object") &&
                (obj.nodeType === 1) && (typeof obj.style === "object") &&
                (typeof obj.ownerDocument === "object");
    }

    function decodeHTMLEntities(str) {
        var entityRegexp = /&(lt|gt|amp|quot);/g;
        var entityHash = {
            "lt": "<",
            "gt": ">",
            "amp": "&",
            "quot": "\""
        };
        return (str.replace(entityRegexp, function (match, item) {
            return entityHash[item];
        }));
    }

    function getRealEventTranslation(evt) {
        
        
        
        
        
        

        if (!evt || !evt.gestureObject || !evt.gestureObject.target) {
            return { translationX: 0, translationY: 0 };
        }

        
        try {
            var targetMatrix = new MSCSSMatrix(evt.gestureObject.target.style.transform);
            targetMatrix.m41 = targetMatrix.m42 = 0; 

            var realMatrix = targetMatrix
                .translate(evt.translationX, evt.translationY).
                rotate(evt.rotation * 180 / Math.PI).
                scale(evt.scale);
            

            return { translationX: realMatrix.m41, translationY: realMatrix.m42 };
        } catch (e) {
            return { translationX: 0, translationY: 0 };
        }
    }

    function removeFromDOM(element) {
        element.parentNode && element.parentNode.removeChild(element);
        Skype.UI.Framework.disposeSubTree(element);
    }

    function isFullViewportParam(paramInPixels, paramType) {
        if (!paramInPixels || paramInPixels.indexOf("px") === -1) {
            log("isFullViewportParam invalid parameter !");
            return false;
        }

        var nParam = parseInt(paramInPixels);
        if (isNaN(nParam)) {
            log("isFullViewportParam parsing error !");
            return false;
        }
        return nParam === Skype.Application.state.view.size[paramType];
    }

    function translateParamToViewport(paramInPixels, paramType, paramInViewportCoordinates) {
        var isFullVp = isFullViewportParam(paramInPixels, paramType);
        return isFullVp ? paramInViewportCoordinates : paramInPixels;
    }

    function translateToViewportWidth(widthInPixels, unitType) {
        
        
        
        
        
        
        
        
        
        

        var type = unitType && unitType === "viewport" ? "100vw" : "100%";

        return translateParamToViewport(widthInPixels, "width", type); 
    }

    function translateToViewportHeight(heightInPixels, unitType) {
        
        
        
        
        
        
        
        
        
        

        var type = unitType && unitType === "viewport" ? "100vh" : "100%";

        return translateParamToViewport(heightInPixels, "height", type); 
    }

    function empty(element) {
        
        
        
        
        
        
        
        
        
        
        
        
        

        WinJS.Utilities.disposeSubTree(element);
        return WinJS.Utilities.empty(element);
    };

    function addTemporaryTabIndex(context, element) {
        
        
        
        
        
        
        
        
        
        
        
        
        

        element.setAttribute("tabindex", 666); 
        context.regImmediate(function () {
            element.removeAttribute("tabindex");
        });
    }

    function getGestureObjectForEvent(event) {
        
        
        
        
        
        
        
        

        var type = event.currentPoint ? event.currentPoint.pointerDevice.pointerDeviceType : Windows.Devices.Input.PointerDeviceType.touch,
            target = event.target;

        target.gestureObjects = target.gestureObjects || [];

        var gesture = target.gestureObjects[type];
        if (!gesture) {
            gesture = target.gestureObjects[type] = new MSGesture();
        }
        
        target.gestureObjects[type].target = target;
        return gesture;
    }

    function deactivateAnchorFocus(value) {
        if (value && value.search('<a') != -1) {
            return value.replace(/<a/gi, '<a tabindex="-1"');
        }
        return value;
    }

    function lockRotation(activate) {
        
        
        
        
        
        
        
        
        if (activate) {
            Windows.Graphics.Display.DisplayInformation.autoRotationPreferences = Windows.Graphics.Display.DisplayInformation.getForCurrentView().currentOrientation;
        } else {
            Windows.Graphics.Display.DisplayInformation.autoRotationPreferences = Windows.Graphics.Display.DisplayOrientations.none;
        }
    }

    
    function initListViewFixes() {
        _fixListviewRTLChangeBug();
        _fixListviewLockScreenResumeBug();
    }

    function _fixListviewRTLChangeBug() {
        
        Skype.Application.state.bind("isRTL", function (isRTL) {
            WinJS.Utilities.query("div.win-listview").setAttribute("dir", isRTL ? "rtl" : "");
        });
    }

    function _fixListviewLockScreenResumeBug() {
        
        var wasInLockScreen = false;
        Skype.Application.state.view.bind("isOnLockScreen", function (isNow) {
            if (wasInLockScreen && !isNow) {
                WinJS.Utilities.query("div.win-listview").forEach(function (el) {
                    el.winControl && el.winControl.forceLayout && el.winControl.forceLayout();
                });
            }
            wasInLockScreen = isNow;
        });
    }

    function disableElementAnimation(element, eventListener) {
        
        
        
        
        
        
        
        
        
        
        
        

        assert(eventListener.regEventListener, "Incorrect usage of this function. Use control with disposable mixin - Skype.UI.Control");

        eventListener.regEventListener(element, "contentanimating", function (evt) {
            evt.preventDefault();
        });
    }

    function activeElementCantBeBlured() {
        
        
        
        
        
        

        return document.activeElement && (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT' || document.activeElement.classList.contains("cantBeBlured"));
    }

    WinJS.Namespace.define("Skype.UI.Util", {
        sendEvent: sendEvent,
        getParentElementByClass: getParentElementByClass,
        addClassToAll: addClassToAll,
        removeClassFromAll: removeClassFromAll,
        setTemporaryClass: setTemporaryClass,
        setSlowDownClass: setSlowDownClass,
        setNoTransitionClass: setNoTransitionClass,
        animateInvoke: animateInvoke,
        preventTextLinks: preventTextLinks,
        addMouseDownCss: addMouseDownCss,
        getCurrentViewStateName: getCurrentViewStateName,
        letterUsedToClass: letterUsedToClass,
        lengthToTabIndex: lengthToTabIndex,
        disableIfEmpty: disableIfEmpty,
        setClass: setClass,
        getTrackingParam: getTrackingParam,
        isHTMLNode: isHTMLNode,
        getFormattedFileSize: getFormattedFileSize,
        getFormattedFileSizeConverter: getFormattedFileSizeConverter,
        decodeHTMLEntities: decodeHTMLEntities,
        getRealEventTranslation: getRealEventTranslation,
        addPercentSign: addPercentSign,
        removeFromDOM: removeFromDOM,
        translateToViewportWidth: translateToViewportWidth,
        translateToViewportHeight: translateToViewportHeight,
        addTemporaryTabIndex: addTemporaryTabIndex,
        empty: empty,
        isNodeOrParentFulfillPredicate: isNodeOrParentFulfillPredicate,
        deactivateAnchorFocus: deactivateAnchorFocus,
        getGestureObjectForEvent: getGestureObjectForEvent,
        lockRotation: lockRotation,
        initListViewFixes: initListViewFixes,
        disableElementAnimation: disableElementAnimation,
        activeElementCantBeBlured: activeElementCantBeBlured
    });
}());