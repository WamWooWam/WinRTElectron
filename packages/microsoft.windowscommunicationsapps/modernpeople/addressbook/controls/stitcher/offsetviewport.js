
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="../../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../../../../Shared/Jx/Core/Component.js"/>
/// <reference path="../Viewport/Viewport.js"/>
/// <reference path="../Viewport/ViewportChild.ref.js"/>

Jx.delayDefine(People, "OffsetViewport", function () {

    var P = window.People;

    P.OffsetViewport = /* @constructor*/function (jobSet, child) {
        ///<summary>The offset viewport provides a coordinate translation by a specified offset.  This enables children
        ///to see positions relative to their own edges, rather than having to consider the positions and widths of their
        ///siblings</summary>
        ///<param name="jobSet" type="P.JobSet"/>
        ///<param name="child" type="ViewportChild"/>
        P.Viewport.call(this);
        this._child = child;
        this._jobSet = jobSet;

        // Some subclasses of ViewportChild will have a name property we want to copy.
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        this.name = child.name;
        /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>

        ///<disable>JS3057.AvoidImplicitTypeCoercion</disable>   ViewportChild is a Component, which is a TreeNode
        this.appendChild(child);

        this._suppressionToken = {}; // each OffsetViewport has a unique, and secret, suppression token
        this._initialSuppression = this.suppressScrollEvents();
    };
    Jx.inherit(P.OffsetViewport, P.Viewport);
    P.OffsetViewport.prototype.suppressScrollEvents = function () {
        ///<summary>There are times when it is necessary to temporarilly turn off scrolling events.  In fact, this is the
        ///initial state of an OffsetViewport.  This helps to avoid receiving multiple scroll events when children are shuffled
        ///around and the viewport moves.</summary>
        ///<returns type="ScrollEventSuppression">An object that can be used to re-enable the scroll events</returns>
        this._suppressionCount++;
        return new ScrollEventSuppression(this, this._suppressionToken);
    };
    P.OffsetViewport.prototype.enableScrollEvents = function (token) {
        ///<summary>There are times when it is necessary to temporarilly turn off scrolling events.  In fact, this is the
        ///initial state of an OffsetViewport.  This helps to avoid receiving multiple scroll events when children are shuffled
        ///around and the viewport moves.</summary>
        ///<param name="token" type="Object">A token that verifies this call is paired to a previous suppressScrollEvents</param>
        Debug.assert(token === this._suppressionToken, "Attempting to enable scroll events with an invalid token");
        if (token === this._suppressionToken) {
            this._suppressionCount--;
            this._reportScroll();
        }
    };
    P.OffsetViewport.prototype.getUI = function (ui) {
        ///<summary>The OffsetViewport has no UI of its own</summary>
        ///<param name="ui" type="JxUI" />

        ui.html = Jx.getUI(this._child).html;
    };
    P.OffsetViewport.prototype.getOffset = function () {
        ///<returns type="Number">The value last passed to setOffset</returns>
        return this._offset;
    };
    P.OffsetViewport.prototype.setOffset = function (offset) {
        ///<summary>Sets the coordinate translation to the specified offset.  Generates a scroll event.</summary>
        ///<param name="offset" type="Number"/>
        this._offset = offset;
        this._reportScroll();
    };
    P.OffsetViewport.prototype.setScrollPosition = function (position) {
        ///<summary>When the child changes the scroll position, this is translated and applied to the parent</summary>
        ///<param name="position">A scroll position in child-relative coordinates</param>
        var /*@type(P.Viewport)*/parentViewport = this.getParent();
        parentViewport.setScrollPosition(position + this._offset);
    };
    P.OffsetViewport.prototype.extentChanged = function (child, origin, extentChange) {
        ///<summary>When the child's extent changes, this is translated and applied to the parent</summary>
        ///<param name="child" type="ViewportChild">Ignored, this viewport has only one child</param>
        ///<param name="origin" type="Number">The position at which the extent change originated, in child-relative coordinates</param>
        ///<param name="extentChange" type="Number">The amount, positive or negative, by which the extent changed</param>
        var /*@type(P.Viewport)*/parentViewport = this.getParent();
        parentViewport.extentChanged(this, this._offset + origin, extentChange);
    };
    P.OffsetViewport.prototype.getScrollPosition = function () {
        ///<returns type="Number">The last scroll position reported via scroll</returns>
        return this._lastPosition;
    };
    P.OffsetViewport.prototype.hydrateExtent = function (data) {
        ///<summary>Hydration is delegated to the child</summary>
        ///<param name="data" type="Object">The last value returned from dehydrate</param>
        this._child.hydrateExtent(data);
    };
    P.OffsetViewport.prototype.hydratePosition = function (data) {
        ///<summary>Hydration is delegated to the child</summary>
        ///<param name="data" type="Object">The last value returned from dehydrate</param>
        this._child.hydratePosition(data);
    };
    P.OffsetViewport.prototype.render = function () {
        ///<summary>When rendered, the offsetViewport begins firing scroll events.  Before that, these events
        ///would be inaccurate as the offset is likely to be adjusting based on changes to siblings</summary>
        var /*@type(P.Viewport)*/parentViewport = this.getParent();
        this._lastPosition = parentViewport.getScrollPosition() - this._offset;
        this._child.render();
        this._initialSuppression.enableScrollEvents();
    };
    P.OffsetViewport.prototype.dehydrate = function (shouldDehydratePosition) {
        ///<summary>Dehydration is delegated to the child</summary>
        ///<param name="shouldDehydratePosition" type="Boolean"/>
        ///<returns type="Object"/>
        return this._child.dehydrate(shouldDehydratePosition);
    };
    P.OffsetViewport.prototype.scroll = function (position, positionChange) {
        ///<summary>The offset viewport ignores the scroll information coming in.  Because scroll events can
        ///be suppressed, it must maintain its own distinct position information</summary>
        this._reportScroll();
    };
    P.OffsetViewport.prototype.resize = function () {
        ///<summary>Reports a resize event to the child</summary>
        if (this._suppressionCount === 0) {
            this._child.resize();
        }
    };
    P.OffsetViewport.prototype.getJobSet = function () {
        ///<returns type="P.JobSet"/>
        return this._jobSet;
    };
    P.OffsetViewport.prototype._reportScroll = function () {
        ///<summary>Reports a scroll event in child-relative coordinates</summary>
        if (this._suppressionCount === 0) {
            var /*@type(P.Viewport)*/parentViewport = this.getParent();
            var parentPosition = parentViewport.getScrollPosition();
            var lastPosition = this._lastPosition;
            var newPosition = parentPosition - this._offset;
            var change = newPosition - lastPosition;
            if (change !== 0) {
                this._lastPosition = newPosition;
                this._child.scroll(newPosition, change);
            }
        }
    };
    P.OffsetViewport.prototype.getCurrentItem = function (item) {
        /// <summary> If the current item has been set by setCurrentItem previously, return its position.
        /// Else, return a dummy position. </summary> 
        /// <param name="item" type="Object"/>
        /// <returns type="Position"> viewport-centric position </returns>
        var position = this._child.getCurrentItem(item);
        position.scrollPos += this._offset;
        return position;
    };
    P.OffsetViewport.prototype.setCurrentItem = function (position) {
        /// <summary> If semantic zoom is invoked on an item that has a corresponding item in the other view,
        /// set that item to be in focus. Else, does nothing. </summary>
        /// <param name="position" type="Position" />
        position.scrollPos -= this._offset;
        this._child.setCurrentItem(position);
    };
    P.OffsetViewport.prototype.positionItem = function (item) {
        /// <summary> Set the corresponding item in the other view to be in focus and returns its position. </summary>
        /// <param name="item" type="Object">format: { itemOffset: _, groupIndex: _ }</param>
        /// <returns type="Position"> viewport-centric position </returns>
        var position = this._child.positionItem(item);
        position.scrollPos += this._offset;
        return position;
    };
    P.OffsetViewport.prototype._offset = 0;
    P.OffsetViewport.prototype._suppressionCount = 0;
    P.OffsetViewport.prototype._suppressionToken = /* @static_cast(Object)*/null;
    P.OffsetViewport.prototype._initalSuppression = /* @static_cast(ScrollEventSuppression)*/null;
    P.OffsetViewport.prototype._lastPosition = 0;
    P.OffsetViewport.prototype._child = /* @static_cast(ViewportChild)*/null;
    P.OffsetViewport.prototype._jobSet = /* @static_cast(P.JobSet)*/null;

    /* @constructor*/function ScrollEventSuppression(viewport, token) {
        ///<summary>This object is returned from OffsetViewport.suppressScrollEvents. It allows a corresponding call to
        ///enableScrollEvents.</summary>
        ///<param name="viewport" type="P.OffsetViewport"/>
        ///<param name="token" type="Object">A token that can be used to re-enable scrolling events</param>
        this._viewport = viewport;
        this._token = token;
    }
    ScrollEventSuppression.prototype.enableScrollEvents = function () {
        var viewport = this._viewport;
        var token = this._token;
        Debug.assert(viewport !== null, "Attempting to enableScrollEvents more than once");
        Debug.assert(token !== null, "Attempting to enableScrollEvents more than once");
        this._viewport = null;
        this._token = null;
        if (viewport !== null && token !== null) {
            viewport.enableScrollEvents(token);
        }
    };
    ScrollEventSuppression.prototype._viewport = /* @static_cast(P.OffsetViewport)*/null;
    ScrollEventSuppression.prototype._token = /* @static_cast(Object)*/null;

});
