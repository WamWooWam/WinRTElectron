
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/// <reference path="ContactControlPosition.ref.js"/>

Jx.delayDefine(People.Controls, "ContactControlPosition", function () {

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People;
    var C = P.Controls;
    var L = P.Layout;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    var direction = getComputedStyle(document.body).direction; // "ltr" or "rtl"
    var bidiLeft = direction === "rtl" ? "right" : "left"; // in CSS, direction defaults to ltr if not specified
    var bidiRight = direction === "rtl" ? "left" : "right";
    var c_contentPaddingLeft = 0;
    var c_contentPaddingRight = 40;
    var c_containerOffsetLeft = 380;

    C.ContactControlPosition = {};

    C.ContactControlPosition.update = function (layout, cachedWidth, container, padding, containerOffsetLeft) {
        /// <summary>Resize the control and update position based on the actual width it needs.</summary>
        /// <param name="layout" type="P.Layout"/>
        /// <param name="cachedWidth" type="Number"/>
        /// <param name="container" type="HTMLElement"/>
        /// <param name="padding" type="HTMLElement"/>
        /// <param name="containerOffsetLeft" type="Number" optional="true"/>
        /// <returns type="Number"/>
        Debug.assert(Jx.isObject(layout));
        Debug.assert(Jx.isHTMLElement(container));
        Debug.assert(Jx.isHTMLElement(padding));
        
        // For the "snap" and "no content" scenarios, we want CSS styles to handle it.
        if (layout.getLayoutState() === L.layoutState.snapped || !container.hasChildNodes()) {
            return;
        }

        var sizingRect = container.lastChild.getBoundingClientRect();
        var containerRect = container.getBoundingClientRect();
        // While it is possible to use scroll values to get this relative zero, it is better to use the same method throughout for resiliency.
        // Also, our LessCSS is set up so that left and right values flip properly for RTL builds.
        var sign = direction === "rtl" ? -1 : 1;
        var zero = containerRect[bidiLeft] - sign * (containerOffsetLeft ? containerOffsetLeft : c_containerOffsetLeft);

        var actualWidth = sign * Math.round(sizingRect[bidiRight] - containerRect[bidiLeft]) - c_contentPaddingLeft;
        if (actualWidth !== cachedWidth) {
            ///<disable>JS3057.AvoidImplicitTypeCoercion</disable>
            container.style.width = actualWidth + "px";
            padding.style[bidiLeft] = (sign * Math.round(sizingRect[bidiRight] - zero) + c_contentPaddingRight) + "px";
            ///<enable>JS3057.AvoidImplicitTypeCoercion</enable>
        }
        return actualWidth;
    };

    C.ContactControlPosition.getScrollPosition = function (div) {
        /// <summary>Get the scroll position for the div element.</summary>
        /// <param name="div" type="HTMLElement"/>
        /// <returns type="ControlPositionDescriptor"/>
        Debug.assert(Jx.isHTMLElement(div));
        return {scroll: {scrollLeft: div.scrollLeft, scrollTop: div.scrollTop} };
    };

    C.ContactControlPosition.setScrollPosition = function (div, scrollObject) {
        /// <summary>Set the scroll position for the div element.</summary>
        /// <param name="div" type="HTMLElement"/>
        /// <param name="scrollObject" type="ControlPositionDescriptor"/>
        Debug.assert(Jx.isHTMLElement(div));
        if (Jx.isObject(scrollObject) && Jx.isObject(scrollObject.scroll)) {
            for (var scrollPos in scrollObject.scroll) {
                div[scrollPos] = scrollObject.scroll[scrollPos];
            }
        }
    };
});
