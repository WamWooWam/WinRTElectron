
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../../Shared/JSUtil/Hydration.js"/>
/// <reference path="Section.js"/>

Jx.delayDefine(People, "StaticSection", function () {

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People,
        U = WinJS.Utilities;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    P.StaticSection = /* @constructor*/function (sectionName, title) {
        ///<summary>A static section is a basic section of the address book composed from static HTML, like the
        ///me area.  This is contrasted with a section that contains a grid control and may dynamically add/remove
        ///content and update its extent.</summary>
        P.Section.call(this, sectionName, title);
    };
    Jx.inherit(P.StaticSection, P.Section);
    P.StaticSection.prototype.contentReadyAsync = function () {
        var /*@type(P.Viewport)*/parentViewport = this.getParent();
        var scrollPos = parentViewport.getScrollPosition();
        var isOnScreen = !this.isHidden() && (scrollPos <= this._extent) && (scrollPos + parentViewport.getViewportExtent()) > 0;
        return isOnScreen ? [this._sectionElement] : [];
    };
    P.StaticSection.prototype.hydrateExtent = function (data) {
        P.Section.prototype.hydrateExtent.call(this, data);
        if (!this.isHidden()) {
            var newExtent = this.getOrientation() === P.Orientation.horizontal ? U.getTotalWidth(this._contentElement) : U.getTotalHeight(this._sectionElement);
            this.extentChanged(/* @static_cast(P.Section)*/this, 0, newExtent - this._extent);
        }
        this.extentReady(/* @static_cast(P.Section)*/this);
    };
    P.StaticSection.prototype.hydratePosition = function (data) {
        // Restore the scroll position in pixels
        var /*@type(P.Viewport)*/parentViewport = this.getParent();
        parentViewport.setScrollPosition(P.Hydration.get(data, "lastPosition", 0));
    };
    P.StaticSection.prototype.dehydrate = function (shouldDehydratePosition) {
        var data = {};
        if (shouldDehydratePosition) {
            var /*@type(P.Viewport)*/parentViewport = this.getParent();
            P.Hydration.set(data, "lastPosition", parentViewport.getScrollPosition());
        }
        return data;
    };
    P.StaticSection.prototype.setCurrentItem = function (position) { };
    P.StaticSection.prototype.getCurrentItem = function (item) { return { scrollPos: 0, orthoPos: 0, width: 0, height: 0 }; };
    P.StaticSection.prototype.positionItem = function (item) {
        // Set focus on the first tabbable element in the section
        var firstElement = this._sectionElement.querySelector("[tabIndex='0']");
        Debug.assert(Jx.isHTMLElement(firstElement));
        firstElement.setActive();
        return { scrollPos: 0, orthoPos: 0, width: 0, height: 0 };
    };
});

