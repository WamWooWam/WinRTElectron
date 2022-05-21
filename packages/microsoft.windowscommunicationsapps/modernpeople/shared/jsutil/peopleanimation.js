
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../JsUtil/namespace.js" />

Jx.delayDefine(People, "Animation", function () {
    
    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People;
    var A = window.People.Animation = {};
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    
    var disabled = false;
    Object.defineProperty(A, "disabled", { 
        get: function () {
            return disabled;
        },
        set: function (value) {
            disabled = value;
            defineFunctions();
        },
        enumerable: true
    });

    

    function defineExecFunction(item) {
        ///<summary>Defines the animation execution function.</summary>
        ///<param name="item" type="Object">Item in the array</param>
        var winAnim = WinJS.UI.Animation;
        A[item] = function () {
            
            if (A.disabled) {
                return new WinJS.Promise(function (c, e, p) { c(); });
            }
            
            return winAnim[item].apply(winAnim, arguments);
        };
    };

    function defineCreateFunction(item) {
        ///<summary>Defines the animation creation function.</summary>
        ///<param name="item" type="Object">Item in the array</param>
        var winAnim = WinJS.UI.Animation;
        A[item] = function () {
            
            if (A.disabled) {
                // create a dummy object that can be executed.
                return { execute: function () { return new WinJS.Promise(function (c, e, p) { c(); }); } };
            }
            
            return winAnim[item].apply(winAnim, arguments);
        };
    };

    function defineFunctions() {
        // Defines the animation execution functions that are used in People. The execution can be turned on/off by setting
        // People.Animation.disabled
        [
            "crossFade",
            "enterContent",
            "exitContent",
            "exitPage",
            "pointerDown",
            "pointerUp",
            "updateBadge"
        ].forEach(defineExecFunction);

        [
            "createAddToListAnimation",
            "createCollapseAnimation",
            "createDeleteFromListAnimation",
            "createExpandAnimation",
            "createRepositionAnimation"
        ].forEach(defineCreateFunction);
    }
    defineFunctions();

    A.cropStaggeredList = function (elementList, crop) {
        ///<summary>Limit the length of the element list intended to be passed to a WinJS animation to a length of
        ///'crop'.  The rest of the elements are set as this last element in the list and we ensure the rest are also
        ///flattened in case one of the items in the elementList was, itself, a list.</summary>
        ///<param name="elementList" type="HTMLElement"/>
        ///<param name="crop" type="Number"/>
        ///<returns type="Array" />
        if (elementList.length > crop) {
            // Set the crop'th item as the flattened list of the rest.
            elementList[crop] = P.Sequence.flatten(elementList.splice(crop, elementList.length)); 
        }
        return elementList;
    };

    A.fadeIn = function (element) {
        ///<summary>Fades in an element.</summary>
        ///<param name="element" type="HTMLElement"/>

        
        if (A.disabled) {
            return new WinJS.Promise(function (c, e, p) {
                setVisibilityImmediately(element, 1);
                c();
            });
        }
        
        return WinJS.Promise.as(WinJS.UI.Animation.fadeIn(element));
    };

    A.fadeOut = function (element) {
        ///<summary>Fades out an element.</summary>
        ///<param name="element" type="HTMLElement"/>

        
        if (A.disabled) {
            return new WinJS.Promise(function (c, e, p) {
                setVisibilityImmediately(element, 0);
                c();
            });
        }
        
        return WinJS.Promise.as(WinJS.UI.Animation.fadeOut(element));
    };

    A.removeOutgoingElements = function (elements) {
        ///<summary>Remove the outgoing elements after animation is supposed to be finished</summary>
        ///<param name="elements" type="Array"/>
        Debug.assert(Jx.isArray(elements));
        elements.forEach(A.removeOutgoingElement);
    };

    A.removeOutgoingElement = function (element) {
        ///<summary>Remove the outgoing element after animation is supposed to be finished</summary>
        ///<param name="element" type="HTMLElement"/>
        Debug.assert(Jx.isHTMLElement(element));
        if (element.parentNode) {
            // Hiding (display => "none") before removing prevents a crazy (& intermittent) flicker
            element.style.display = "none"; 
            element.parentNode.removeChild(element);
            Debug.assert(element.parentNode === null);
        }
    };

    A.addTapAnimation = function (element) {
        ///<summary>Attaches a 97% scale to the specified element on pointer down</summary>
        ///<param name="element" type="HTMLElement"/>
        Debug.assert(Jx.isHTMLElement(element));
        addPointerDownListener(element, startTapAnimation, stopTapAnimation);
    };

    A.addPressStyling = function (element) {
        ///<summary>Adds a "pressed" class to the specified element on pointer down.  Use in place of :active, which can't
        ///handle child elements.</summary>
        ///<param name="element" type="HTMLElement"/>
        addPointerDownListener(element, startPress, stopPress);
    };

    A.startTapAnimation = function (element, event, supportRightClick) {
        ///<summary>A pointer-down event listener that will initiate and cancel the "pressed" 97% scale tap animation</summary>
        ///<param name="element" type="HTMLElement"/>
        ///<param name="supportRightClick" type="Boolean" optional="true"/>
        Debug.assert(Jx.isHTMLElement(element));
        Debug.assert(Jx.isObject(event));
        pointerDownListener(element, startTapAnimation, stopTapAnimation, event, supportRightClick);
    };


    function startTapAnimation(element) {
        ///<summary>Starts the tap animation in response to a pointer down</summary>
        ///<param name="element" type="HTMLElement"/>
        startPress(element);
        WinJS.UI.Animation.pointerDown(element);
    }
    function stopTapAnimation(element) {
        ///<summary>Removes the tap animation/style in response to a pointer up/out</summary>
        ///<param name="element" type="HTMLElement"/>
        WinJS.UI.Animation.pointerUp(element);
        stopPress(element);
    }

    function startPress(element) {
        ///<summary>Adds the "pressed" class to an element</summary>
        ///<param name="element" type="HTMLElement"/>
        Jx.addClass(element, "pressed");
    }

    function stopPress(element) {
        ///<summary>Removes the "pressed" class from an element</summary>
        ///<param name="element" type="HTMLElement"/>
        Jx.removeClass(element, "pressed");
    }

    function addPointerDownListener(element, pressedCallback, unpressedCallback) {
        ///<summary>Binds pointerDownListener to the specified element</summary>
        ///<param name="element" type="HTMLElement"/>
        ///<param name="pressedCallback" type="Function"/>
        ///<param name="unpressedCallback" type="Function"/>
        Debug.assert(Jx.isHTMLElement(element));
        Debug.assert(Jx.isFunction(pressedCallback));
        Debug.assert(Jx.isFunction(unpressedCallback));
        element.addEventListener("MSPointerDown", pointerDownListener.bind(null, element, pressedCallback, unpressedCallback), false);
    };
    function pointerDownListener(element, pressedCallback, unpressedCallback, event, supportRightClick) {
        ///<summary>A pointer-down event handler that track pressed state</summary>
        ///<param name="element" type="HTMLElement"/>
        ///<param name="pressedCallback" type="Function"/>
        ///<param name="unpressedCallback" type="Function"/>
        ///<param name="event" type="Event"/>
        ///<param name="supportRightClick" type="Boolean" optional="true"/>
        Debug.assert(Jx.isHTMLElement(element));
        Debug.assert(Jx.isFunction(pressedCallback));
        Debug.assert(Jx.isFunction(unpressedCallback));
        Debug.assert(Jx.isObject(event));

        if (event.pointerType === "touch" ||
            event.pointerType === MSPointerEvent.MSPOINTER_TYPE_TOUCH ||
            event.button === 0 /* Left click */ ||
            (supportRightClick && event.button === 2 /* Right click */)) {
            pressedCallback(element);

            var clearEffect = function () {
                unpressedCallback(element);
                document.removeEventListener("MSPointerUp", clearEffect, true);
                document.removeEventListener("MSPointerCancel", clearEffect, true);
            };

            document.addEventListener("MSPointerUp", clearEffect, true);
            document.addEventListener("MSPointerCancel", clearEffect, true);
        }
    };

    function setVisibilityImmediately(e, toShow) {
        if (Jx.isArray(e)) {
            e.forEach(function (child) {
                setVisibilityImmediately(child, toShow);
            });
        } else {
            e.style.opacity = toShow ? 1 : 0;
        }
    };

    // The rest of this file is a copy of WinJS.Animations for a custom enterPage animation that allows passing an
    // initial delay for the animation, a capability which the WinJS Animations lack.  This ability enables us to call
    // the exitPage & enterPage animations concurrently without the worry that controls we host 'misbehave' and don't
    // yield back to trident.  Calling enterPage on the completion of exitPage with 'misbehaving' controls results in
    // long wait times with a blank screen.
    function staggerDelay(initialDelay, extraDelay, delayFactor, delayCap) {
        return function (i) {
            var ret = initialDelay;
            for (var j = 0; j < i; j++) {
                extraDelay *= delayFactor;
                ret += extraDelay;
            }
            if (delayCap) {
                ret = Math.min(ret, delayCap);
            }
            return ret;
        };
    }

    var mstransform = "-ms-transform";
    var defaultOffset = [{ top: "0px", left: "11px", rtlflip: true }];
    var OffsetArray = WinJS.Class.define (function OffsetArray_ctor(offset, keyframe, defOffset) {
        // Constructor
        defOffset = defOffset || defaultOffset;
        if (Array.isArray(offset) && offset.length > 0) {
            this.offsetArray = offset;
            if (offset.length === 1) {
                this.keyframe = checkKeyframe(offset[0], defOffset[0], keyframe);
            }
        } else if (offset && offset.hasOwnProperty("top") && offset.hasOwnProperty("left")) {
            this.offsetArray = [offset];
            this.keyframe = checkKeyframe(offset, defOffset[0], keyframe);
        } else {
            this.offsetArray = defOffset;
            this.keyframe = chooseKeyframe(defOffset[0], keyframe);
        }
    }, { // Public Members
        getOffset: function (i) {
            if (i >= this.offsetArray.length) {
                i = this.offsetArray.length - 1;
            }
            return this.offsetArray[i];
        }
    }, { // Static Members
        supportedForProcessing: false
    });

    function chooseKeyframe(defOffset, keyframe) {
        if (!keyframe || !defOffset.rtlflip) {
            return keyframe;
        }
        return keyframeCallback(keyframe);
    }

    function keyframeCallback(keyframe) {
        var keyframeRtl = keyframe + "-rtl";
        return function (i, elem) {
            return window.getComputedStyle(elem).direction === "ltr" ? keyframe : keyframeRtl;
        };
    }

    var isSnapped = function () {
        if (WinJS.Utilities.hasWinRT) {
            var appView = Windows.UI.ViewManagement.ApplicationView;
            var snapped = Windows.UI.ViewManagement.ApplicationViewState.snapped;
            isSnapped = function () {
                return appView.value === snapped;
            };
        } else {
            isSnapped = function () { return false; };
        }
        return isSnapped();
    };


    A.enterPage = function (elements, offset, initialDelay) {
        ///<summary>A pointer-down event handler that track pressed state</summary>
        ///<param name="elements" type="Array" />
        ///<param name="offset">
        ///Optional offset object or collection of offset objects
        ///array describing the starting point of the animation.
        ///If the number of offset objects is less than the length of the
        ///element parameter, then the last value is repeated for all
        ///remaining elements.
        ///If this parameter is omitted, then a default value is used.
        ///</param>
        ///<param name="initialDelay" type="Number" optional="true" />
        ///<returns type="WinJS.Promise">
        ///Promise object that completes when the animation is complete.
        ///</returns>

        
        if (A.disabled) {
            return new WinJS.Promise(function (c, e, p) {
                setVisibilityImmediately(elements, 1);
                c(); 
            });
        }
        

        var offsetArray;
        initialDelay = initialDelay || 0;
        if (isSnapped()) {
            offsetArray = new OffsetArray(offset, "WinJS-enterPage-snapped", [{ top: "0px", left: "40px", rtlflip: true }]);
        } else {
            offsetArray = new OffsetArray(offset, "WinJS-enterPage", [{ top: "0px", left: "100px", rtlflip: true }]);
        }
        var promise1 = WinJS.UI.executeAnimation(
            elements,
            {
                keyframe: offsetArray.keyframe,
                property: mstransform,
                delay: staggerDelay(initialDelay, 83, 1, 750),
                duration: 1000,
                timing: "cubic-bezier(0.1, 0.9, 0.2, 1)",
                from: offsetArray.keyframe || translateCallback(offsetArray),
                to: "none"
            });
        var promise2 = WinJS.UI.executeTransition(
            elements,
            {
                property: "opacity",
                delay: staggerDelay(initialDelay, 83, 1, 750),
                duration: 170,
                timing: "cubic-bezier(0.1, 0.9, 0.2, 1)",
                from: 0,
                to: 1
            });
        return WinJS.Promise.join([promise1, promise2]);
    };

});
