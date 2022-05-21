
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="../../../Shared/JSUtil/Include.js"/>
/// <reference path="../../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../../../Shared/Sequence/Sequence.js" />
/// <reference path="../../../../Shared/WinJS/WinJS.ref.js" />
/// <reference path="VirtualizedGrid.Anim.ref.js" />

Jx.delayDefine(People.Grid, "Animations", function () {

    ///<disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People,
        S = P.Sequence,
        G = P.Grid,
        A = G.Animations = {},
        UI = WinJS.UI;
    ///<enable>JS2076.IdentifierIsMiscased</enable>

    function clearAnimation(element) {
        /// <param name="element" type="HTMLElement" />
        var style = element.style;
        style.msAnimationName = null;
        style.msAnimationDelay = null;
        style.msAnimationDuration = null;
        style.msAnimationTimingFunction = null;
        style.msAnimationFillMode = "none";
    }
    
    function removeAttrItem(elem, prop, toRemove) {
        /// <summary> Removes 'toRemove' from the 'prop' attribute in 'elem' where elem[prop] is a comma-delimited
        /// attribute.</summary>
        /// <param name="elem" type="HTMLElement" />
        var /*@dynamic*/ style = elem.style;
        var names = /*@static_cast(Array)*/ style.getAttribute(prop).split(", ");
        var index = names.lastIndexOf(toRemove);

        if (index >= 0) {
            names.splice(index, 1);
            style.setAttribute(prop, names.join(","));
        } else {
            // This can happen when our DOM tree has been mangled, which causes animations to get mangled
            // (e.g. instantiating the SemanticZoom control)
            Jx.log.error(toRemove + " not found in " + prop + " attribute.");
        }
    }

    function initializeAnimationArray(animArray) {
        /// <summary> A version of the private function, getAnimationStaggerOffset, used in WinJS.UI that initalizes an
        /// animation array correctly.  Intended for use in executeElementsAnimation</summary>
        /// <param name="animArray" type="Array" />

        for (var i = 0; i < animArray.length; i++) {
            animArray[i].keyframe = animArray[i].name + Jx.uid();
        }
    }

    function triggerStyle(elem, prop, value) {
        /// <param name="elem" type="HTMLElement" />
        /// <param name="prop" type="String" />
        elem.style.setAttribute(prop, value);
        return window.getComputedStyle(elem, null)[prop];
    }

    A.createAnimationPromises = function (elems, animArray, styleSheet) {
        /// <summary> createAnimationPromises and executeElementsAnimation combined work *very* similary to the current
        /// WinJS.UI.executeElementAnimation, with the exception that the function takes an array of elements instead of
        /// a single element as well as the stylesheet.  This avoids creating multiple stylesheets and multiple rules
        /// when one stylesheet can be applied to multiple elements and a few rules can be applied to mutually exclusive
        /// groups of elements.  When profiling, stylesheet creation showed up as the mostly costly item for animating
        /// repositioning elements to the point where it was not clear animations were even occuring due to
        /// "chopiness".</summary>
        /// <param name="elems" type="Array" />
        /// <param name="animArray" type="Array" />
        /// <param name="styleSheet" type="CSSStyleSheet" />
        var comma = "", delay = "", duration = "", animTiming = "", animName = "", i;

        initializeAnimationArray(animArray);

        for (i = 0; i < animArray.length; i++) {
            var kf = "@-ms-keyframes " + animArray[i].keyframe + " { from {" + animArray[i].from + ";} to {" + animArray[i].to + ";}}";
            styleSheet.insertRule(kf, 0);
            delay += comma + animArray[i].delay + "ms";
            duration += comma + animArray[i].duration + "ms";
            animTiming += comma + animArray[i].timing;
            animName += comma + animArray[i].keyframe;
            comma = ",";
        }

        for (i = 0; i < elems.length; i++) {
            var /*@dynamic*/style = elems[i].style;
            style.setAttribute("-ms-animation-delay", delay);
            style.setAttribute("-ms-animation-duration", duration);
            style.setAttribute("-ms-animation-timing-function", animTiming);
            style.setAttribute("-ms-animation-fill-mode", "both");
        }

        var promises = [];
        elems.forEach(function (elem) { 
            /// <param name="elem" type="HTMLElement" />
            animArray.forEach(function (/*@dynamic*/anim) {
                promises.push(new WinJS.Promise(function (c, e, p) {
                    var finish = function () {
                        elem.removeEventListener("MSAnimationEnd", onAnimationEnd, false);
                        removeAttrItem(elem, "-ms-animation-name", anim.keyframe);
                        window.clearTimeout(timeoutId);
                        c();
                    };

                    var onAnimationEnd = function (/*@dynamic*/ev) {
                        if (ev.animationName === anim.keyframe) {
                            finish();
                        }
                    };
                    var timeoutId = window.setTimeout(finish, anim.delay + anim.duration + 10);
                    elem.addEventListener("MSAnimationEnd", onAnimationEnd, false);
                }));

            });
            triggerStyle(elem, "-ms-animation-name", animName);
        });

        return promises;
    };

    A.executeElementsAnimation = function (animations) {
        /// <summary> createAnimationPromises and executeElementsAnimation combined work *very* similary to the current
        /// WinJS.UI.executeElementAnimation.  executeElementsAnimation takes an array of objects of the form:
        /// { elements: [...], animations: [...] }
        /// </summary>
        /// <param name="animations" type="Array" />
        try {
            var style = /*@static_cast(HTMLStyleElement)*/document.createElement("STYLE"),
                promises = [],
                styleSheet = style.sheet;

            document.documentElement.firstChild.appendChild(style);
            animations.forEach(function (anim) {                
                /// <param name="anim" type="ElementsAnimation" />
                S.append(promises, A.createAnimationPromises(anim.elements, anim.animations, styleSheet));
            });
            style.parentNode.removeChild(/*@static_cast(HTMLElement)*/style);
            return WinJS.Promise.join(promises);
        } catch (e) {
            return WinJS.Promise.wrapError(e);
        }
    };

    var msTransform = "-ms-transform",
        timing = "cubic-bezier(0.1, 0.9, 0.2, 1)";

    A.createOffsetAnimationArray = function (offset) {
        /// <param name="offset" type="ClientRect" />
        return [{
            name: "reposition",
            delay: 167,
            duration : 500,
            timing: timing,
            from: msTransform + ":translate(" + /*@static_cast(String)*/offset.left + "px, " + /*@static_cast(String)*/offset.top + "px)",
            to: msTransform + ":translate(0px, 0px)"
        }];
    };

    A.deleteFromList = function (deleted) {
        /// <summary> Provides a subset of the behavior of WinJS.UI.createDeleteFromListAnimation.  It does
        /// not take a remaining array to perform a 2D transform.  We do this because animTranslate2DTransform is
        /// extremely expensive, and the MoCo list animations do not use it.  Since we are emulating the MoCo
        /// animations, we can safely elide this functionality.</summary>
        return A.executeElementsAnimation([{
            elements: deleted, 
            animations: [{
                name: "deleteScale",
                delay: 0,
                duration: 367,
                timing: timing,
                from: msTransform + ":scale(1.0, 1.0)",
                to: msTransform + ":scale(0.85, 0.85)"
            },{
                name: "deleteOpacity",
                delay: 0,
                duration: 167,
                timing: "linear",
                from: "opacity: 1",
                to: "opacity: 0"
            }]
        }]);
    };

    A.addToList = function (added) {
        /// <summary> Provides a subset of the behavior of WinJS.UI.createAddToListAnimation.  It does not
        /// take a remaining array to perform a 2D transform.  We do this because animTranslate2DTransform is extremely
        /// expensive, and the MoCo list animations do not use it.  Since we are emulating the MoCo animations, we can 
        /// safely elide this functionality.</summary>
        return A.executeElementsAnimation([{
            elements: added,
            animations: [{
                 name: "addScale",
                 delay: 167,
                 duration: 367,
                 timing: timing,
                 from: msTransform + ":scale(0.85, 0.85)",
                 to: msTransform + ":scale(1.0, 1.0)"
            }, {
                name: "addOpacity",
                delay: 167,
                duration: 167,
                timing: "linear",
                from: "opacity: 0",
                to: "opacity: 1"
            }]
        }]);
    };

});
