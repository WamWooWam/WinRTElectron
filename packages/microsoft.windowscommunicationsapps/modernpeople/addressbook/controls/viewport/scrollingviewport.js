
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="../../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../Scheduler/Scheduler.js"/>
/// <reference path="Viewport.js"/>
/// <reference path="ViewportChild.ref.js"/>
/// <reference path="../Scheduler/JobSet.js"/>
/// <disable>JS2076.IdentifierIsMiscased</disable>

Jx.delayDefine(People, "ScrollingViewport", function () {

    var P = window.People;
    var Orientation = P.Orientation;

    var orientationData = {};
    orientationData[Orientation.horizontal] = {
        _orientation: Orientation.horizontal,
        _className: "viewport-horizontal",
        _scrollPositionStart: "left",
        _scrollPositionProperty: "scrollLeft",
        _scrollExtentProperty: "scrollWidth",
        _clientExtentProperty: "clientWidth"
    };
    orientationData[Orientation.vertical] = {
        _orientation: Orientation.vertical,
        _className: "viewport-vertical",
        _scrollPositionStart: "top",
        _scrollPositionProperty: "scrollTop",
        _scrollExtentProperty: "scrollHeight",
        _clientExtentProperty: "clientHeight"
    };

    P.ScrollingViewport = /* @constructor*/function (parentJobSet, child, orientation, supportsSelection) {
        ///<summary>The scrolling viewport provides a horizontally scrolling div around its child</summary>
        ///<param name="parentJobSet" type="P.JobSet">A parent JobSet, used to create a child JobSet coordinating asynchronous activity</param>
        ///<param name="child" type="ViewportChild">The component that will be panned</param>
        ///<param name="orientation" type="Number">A value from P.Orientation indicating the scroll direction</param>
        ///<param name="supportsSelection" type="Boolean" optional="true">True if the items in this viewport can be selected</param>
        Debug.assert(orientation === P.Orientation.vertical || orientation === P.Orientation.horizontal);
        P.Viewport.call(this);

        this._child = child;
        this.appendChild(/*@static_cast(Jx.TreeNode)*/child);

        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        this._jobSet = parentJobSet.createChild();
        /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>

        Jx.mix(this, orientationData[orientation]);

        this._supportsSelection = supportsSelection;
    };
    Jx.inherit(P.ScrollingViewport, P.Viewport);

    Object.defineProperty(P.ScrollingViewport.prototype, "id", { get: function () { return this._id; } });

    P.ScrollingViewport.prototype.getUI = function (ui) {
        ///<summary>Jx.Component method for creating the html</summary>
        ///<param name="ui" type="JxUI"/>
        var role = this._supportsSelection ? "listbox" : "list";
        var childUI = Jx.getUI(this._child);
        ui.html =
        "<div id='" + this._id + "' class='" + this._className + "' role='" + role + "'>" +
            childUI.html +
        "</div>";
    };

    P.ScrollingViewport.prototype.activateUI = function () {
        ///<summary>Jx.Component method, called after the UI is instantiated</summary>
        Jx.Component.prototype.activateUI.call(this);
        var div = this._div = document.getElementById(this._id);
        this._viewportExtent = div[this._clientExtentProperty];

        if (this._scrollPositionStart === "left" && Jx.isRtl()) {
            this._scrollPositionStart = "right";
        }

        div.onselectstart = function () { return false; }; // disable text selection: dragging within the viewport will pan it
    };
    P.ScrollingViewport.prototype.getElement = function () {
        return this._div;
    };
    P.ScrollingViewport.prototype.setScrollPosition = function (position) {
        ///<summary>Called to update the scroll position</summary>
        if (Jx.hasClass(this._div, "zooming")) {
            this._div.style[this._scrollPositionStart] = (-position).toString() + "px";
            this._lastKnownPosition = position;
        } else {
            this._div[this._scrollPositionProperty] = position;
            this._lastKnownPosition = this._div[this._scrollPositionProperty];
        }
        this._reportScroll();
    };
    P.ScrollingViewport.prototype.extentReady = function (child) {
        ///<summary>Ignored.  The extent of the child of the ScrollingViewport does not affect layout</summary>
    };
    P.ScrollingViewport.prototype.contentReadyAsync = function () {
        ///<returns type="WinJS.Promise" />
        return this._child.contentReadyAsync();
    };
    P.ScrollingViewport.prototype.extentChanged = function (child, position, extentChange) {
        ///<summary>Fired when the child of the ScrollingViewport grows or shrinks.  Attempts to avoid resulting shifts
        ///in the display by maintaining the same pixels at the left/top edge of the viewport.</summary>
        ///<param name="child" type="ViewportChild">Unused, the ScrollingViewport has only one child</param>
        ///<param name="position" type="Number">The position at which the size change originated</param>
        ///<param name="extentChange" type="Number">The amount, positive or negative, by which the extent changed</param>
        var div = this._div;
        if (div !== null) {
            var lastKnownPosition = this._lastKnownPosition;
            if (position < lastKnownPosition) {
                this.setScrollPosition(lastKnownPosition + extentChange);
            }
        }
    };
    P.ScrollingViewport.prototype.getOrientation = function () {
        ///<returns type="Number">A value from P.Orientation indicating the scroll direction</returns>
        return this._orientation;
    };
    P.ScrollingViewport.prototype.getScrollPosition = function () {
        ///<returns type="Number">The current scroll position.  This is the same value passed in the last call to scroll.  The actual viewport may have moved since then: this value
        ///does not reflect any as-yet unreported change.</returns>
        return this._lastReportedPosition;
    };
    P.ScrollingViewport.prototype.getViewportExtent = function () {
        ///<returns type="Number">The visible extent of the viewport.</returns>
        return this._viewportExtent;
    };
    P.ScrollingViewport.prototype.hydrate = function (data, shouldRestoreScrollPosition) {
        ///<summary>ScrollingViewport performs a 3-phase hydration.  First the extent of the child is hydrated, then the scroll position, then the child is rendered.  These phases each
        ///cascade down the tree.  It is important to restore extents before restoring the scroll position, lest that position be invalid (against the edge of the not-yet correctly sized canvas). 
        ///It is important to restore the scroll position before beginning to render, because virtualized elements will render different amounts of UI based on the scroll position, and because
        ///visibility is important to correct prioritization.  It would be wasteful to recompute those things based on rendering with an initially invalid scroll position.</summary>
        ///<param name="data" type="Object">The value last returned from dehydrate</param>
        ///<param name="shouldRestoreScrollPosition" type="Boolean" optional="true">Should it hydrate position? Default is true</param>

        // hydrate the child 
        this._child.hydrateExtent(data);
        if (shouldRestoreScrollPosition || Jx.isNullOrUndefined(shouldRestoreScrollPosition)) {
            this._child.hydratePosition(data);
        }
        this._lastReportedPosition = this._lastKnownPosition;
        this._child.render();

        // after hydration is completed, hook up to scroll events
        this._div.addEventListener("scroll", this._scrollListener = this._onScroll.bind(this), false);
        this._div.addEventListener("mselementresize", this._resizeListener = this._onResize.bind(this), false);
    };
    P.ScrollingViewport.prototype.dehydrate = function () {
        ///<summary>Records data for a future call to hydrate</summary>
        ///<returns type="Object">The data to be passed to the next call to hydrate</returns>
        return this._child.dehydrate(true /*record scroll position*/);
    };
    P.ScrollingViewport.prototype.getJobSet = function () {
        ///<summary>Returns the jobset provided in the constructor</summary>
        ///<returns type="P.JobSet"/>
        return this._jobSet;
    };
    P.ScrollingViewport.prototype._onScroll = function () {
        ///<summary>This method is called when the DOM scroll event fires.  As little work as possible should be done in this function, as scroll events can fire at an extremely high rate
        ///and starve other work</summary>
        if (!this._frozen) {
            this._lastKnownPosition = this._div[this._scrollPositionProperty];
            this._jobSet.addUIJob(this, this._reportScroll, null, P.Priority.scroll);
            Jx.scheduler.prioritizeInvisible(); // While we are scrolling, invisible jobs are as important as visible ones, and fidelity is of lesser importance
        }
    };
    P.ScrollingViewport.prototype._reportScroll = function () {
        ///<summary>This method is a rate-limited version of _onScroll.  It is safe to do work in this method.</summary>
        var lastPosition = this._lastReportedPosition;
        var newPosition = this._lastKnownPosition;
        var change = newPosition - lastPosition;

        if (change !== 0) {
            this._lastReportedPosition = newPosition;
            this._child.scroll(newPosition, change);
        }
    };
    P.ScrollingViewport.prototype._onResize = function () {
        if (!this._frozen) {
            this._onScroll(); // resizing the window can change the scroll position
            this._jobSet.addUIJob(this, this._reportResize, null, P.Priority.resize);
        }
    };
    P.ScrollingViewport.prototype._reportResize = function () {
        var unused = document.body.offsetWidth;  // Resizing based on partial layout data produces bad results.  We'll attempt to inhibit it by forcing a full calculation.
        this._viewportExtent = this._div[this._clientExtentProperty];
        this.forEachChild(function (child) {
            /// <param name="child" type="ViewportChild" />
            child.resize();
        });
    };
    P.ScrollingViewport.prototype.shutdownComponent = function () {
        ///<summary>Cleans up the component and its children</summary>
        P.Viewport.prototype.shutdownComponent.call(this);
        this._jobSet.dispose();
        if (this._scrollListener !== null) {
            this._div.removeEventListener("scroll", this._scrollListener, false);
        }
        if (this._resizeListener !== null) {
            this._div.removeEventListener("mselementresize", this._resizeListener, false);
        }
    };
    P.ScrollingViewport.prototype.getCurrentItem = function (item) {
        ///<summary>Return the position of the item in current view set by setCurrentItem previously. </summary> 
        ///<param name="item" type="Object" />
        ///<returns type="Position">Item position</returns>
        var position = this._child.getCurrentItem(item);
        position.scrollPos -= this._lastKnownPosition;
        return position;
    };
    P.ScrollingViewport.prototype.setCurrentItem = function (position) {
        /// <summary> Set the item in current view where semantic zoom is invoked to be in focus. </summary>
        ///<param name="position" type="Position" />
        position.scrollPos += this._lastKnownPosition;
        this._child.setCurrentItem(position);
    };
    P.ScrollingViewport.prototype.positionItem = function (item) {
        ///<summary>Set the corresponding item in the other view to be in focus. </summary>
        ///<param name="item" type="Object"/>
        var div = this._div;
        var position = this._child.positionItem(item);
        var maxStart = div[this._scrollExtentProperty] - this.getViewportExtent();
        this.setScrollPosition(Math.min(position.scrollPos, maxStart));
    };
    P.ScrollingViewport.prototype.beginZoom = function () {
        // Hide the ScrollingViewport's scrollbar and extend the content beyond the ScrollingViewport's viewport
        var div = this._div;
        div.style[this._scrollPositionStart] = (-this.getScrollPosition()).toString() + "px";
        Jx.addClass(div, "zooming");
    };
    P.ScrollingViewport.prototype.endZoom = function (isCurrentView) {
        var div = this._div;
        var offset = parseInt(div.style[this._scrollPositionStart], 10);
        Jx.removeClass(div, "zooming");
        div.style[this._scrollPositionStart] = "0px";
        this.setScrollPosition(-offset);
    };
    P.ScrollingViewport.prototype.freeze = function () {
        this._onScroll();
        Debug.call(/*@bind(P.ScrollingViewport)*/function () {
            Debug.assert(!this._frozen, "Freezing an already frozen viewport");
            this._debugFreeze = ["scrollLeft", "scrollTop", "clientWidth", "clientHeight"].reduce(/*@bind(P.ScrollingViewport)*/function (obj, field) {
                obj[field] = this._div[field];
                return obj;
            } .bind(this), {});
        }, this);
        this._frozen = true;
    };
    P.ScrollingViewport.prototype.thaw = function () {
        if (this._lastKnownPosition !== 0) {
            this.setScrollPosition(this._lastKnownPosition);
        }
        Debug.call(/*@bind(P.ScrollingViewport)*/function () {
            Debug.assert(this._frozen, "Thawing an already thawed viewport");
            for (var field in this._debugFreeze) {
                Debug.assert(this._debugFreeze[field] === this._div[field], "Viewport " + field + " changed between freeze/thaw");
            }
        }, this);
        this._frozen = false;
    };
    P.ScrollingViewport.prototype._lastReportedPosition = 0;
    P.ScrollingViewport.prototype._div = /* @static_cast(HTMLElement)*/null;
    P.ScrollingViewport.prototype._viewportExtent = 0;
    P.ScrollingViewport.prototype._lastKnownPosition = 0;
    P.ScrollingViewport.prototype._child = /* @static_cast(ViewportChild)*/null;
    P.ScrollingViewport.prototype._jobSet = /* @static_cast(P.JobSet)*/null;
    P.ScrollingViewport.prototype._scrollListener = /* @static_cast(Function)*/null;
    P.ScrollingViewport.prototype._resizeListener = /* @static_cast(Function)*/null;
    P.ScrollingViewport.prototype._frozen = false;

    
    P.ScrollingViewport.prototype._orientation = /* @static_cast(P.Orientation)*/null;
    P.ScrollingViewport.prototype._className = /* @static_cast(String)*/null;
    P.ScrollingViewport.prototype._scrollPositionProperty = /* @static_cast(String)*/null;
    P.ScrollingViewport.prototype._scrollExtentProperty = /* @static_cast(String)*/null;
    P.ScrollingViewport.prototype._clientExtentProperty = /* @static_cast(String)*/null;
    P.ScrollingViewport.prototype._scrollPositionStart = /* @static_cast(String)*/null;
    P.ScrollingViewport.prototype._debugFreeze = null;
    

});
