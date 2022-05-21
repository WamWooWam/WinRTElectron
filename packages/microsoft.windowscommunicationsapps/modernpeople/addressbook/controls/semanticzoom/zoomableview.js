
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <disable>JS3092.DeclarePropertiesBeforeUse</disable>

Jx.delayDefine(People, "ZoomableView", function () {

    var P = window.People;
    P.ZoomableView = /* @constructor*/function (className, scrollingViewport, orientation, jobSet) {
        /// <param name="className" type="String" />
        /// <param name="scrollingViewport" type="P.ScrollingViewport" />
        /// <param name="orientation" type="String" />
        /// <param name="host" type="P.CpMain">The object that hosts the app.</param>
        /// <param name="jobSet" type="P.JobSet"/>
        this._scrollingViewport = scrollingViewport;
        this._className = className;
        this._orientation = orientation;
        this._jobSet = jobSet;
        this._activeElement = null;
        this._disposed = false;
        this.initComponent();
        Debug.assert(Jx.isObject(scrollingViewport));

        var childHasUI = this._childHasUI = scrollingViewport.hasUI();
        if (!childHasUI) {
            // If the scrollingViewport is already activated, we'll wait to add it to the component tree until we are activated as well.
            this.appendChild(/*@static_cast(Jx.TreeNode)*/scrollingViewport);
        }

        // For the indirection of the semantic zoom control.
        this.zoomableView = this;
    };
    Jx.augment(P.ZoomableView, Jx.Component);

    // The requisite methods to implement semantic zoom control's zoomableView interface.
    P.ZoomableView.prototype.getPanAxis = function () {
        return this._orientation;
    };
    P.ZoomableView.prototype.configureForZoom = function (isZoomedOut, isCurrentView, triggerZoom, prefetchedPages) {
        if (!this._disposed) {
            this._triggerZoom = triggerZoom;
            this._isZoomedOut = isZoomedOut;
            this._jobSet.setVisibility(isCurrentView);
        }
    };
    P.ZoomableView.prototype.setCurrentItem = function (x, y) {
        // Translate the screen coordinate to viewport's scroll coordinate
        if (getComputedStyle(this._element).direction === "rtl") {
            x = this._element.clientWidth - x;
        }
        var position = /*@static_cast(Position)*/{};
        var isHorizontal = (this._orientation === "horizontal");
        position.scrollPos = isHorizontal ? x : y;
        position.orthoPos = isHorizontal ? y : x;

        this._scrollingViewport.setCurrentItem(position);
    };
    P.ZoomableView.prototype.getCurrentItem = function () {
        var item = { section: 0, groupIndex: 0, itemIndex: 0 };
        var ourPosition = this._scrollingViewport.getCurrentItem(item);
        return WinJS.Promise.wrap({
            item: item,
            position: this._toSemanticZoomPosition(ourPosition)
        });
    };
    P.ZoomableView.prototype.beginZoom = function () {
        // Hide the ScrollingViewport's scrollbar and extend the content beyond the ScrollingViewport's viewport
        this._scrollingViewport.beginZoom();
    };
    P.ZoomableView.prototype.positionItem = function (item, position) {
        // position the viewport and set element to be active
        this._scrollingViewport.positionItem(item);

        // store active element before it gets reset by the semantic zoom control
        this._activeElement = document.activeElement;

        // SeZo control no longer uses the position returned from positionItem to align the views
        return null;    
    };
    P.ZoomableView.prototype.endZoom = function (isCurrentView) {
        if (!this._disposed) {
            this._jobSet.setVisibility(isCurrentView);
            this._scrollingViewport.endZoom(isCurrentView);
        }
    };
    // End of zoomableView interface methods

    P.ZoomableView.prototype.getUI = /*@bind(P.ZoomableView)*/function (ui) {
        /// <param name="ui" type="JxUI" />
        var childHtml = "";
        if (!this._childHasUI) {
            childHtml = Jx.getUI(this._scrollingViewport).html;
        }

        ui.html =
            "<div id='" + this._id + "' class='" + this._className + "'>" +
                childHtml +
            "</div>";
    };
    P.ZoomableView.prototype.activateUI = function () {
        Jx.Component.prototype.activateUI.call(this);
        this._element = document.getElementById(this._id);
        this._element.winControl = this;
        this._element.addEventListener("focus", this._onFocusHandler = this._onFocus.bind(this), false);

        if (this._childHasUI) { // If our child was already activated, we can now add it our tree.
            this.appendChild(this._scrollingViewport);
            this._element.appendChild(this._scrollingViewport.getElement());
        }
    };
    P.ZoomableView.prototype.shutdownComponent = function () {
        this._disposed = true;
        if (Jx.isFunction(this._onFocusHandler)) {
            this._element.removeEventListener("focus", this._onFocusHandler, false);
            this._onFocusHandler = null;
        }
        Jx.Component.prototype.shutdownComponent.call(this);
    };
    P.ZoomableView.prototype._toSemanticZoomPosition = function (position) {
        if (this._orientation === "horizontal") {
            return { left: position.scrollPos, top: position.orthoPos };
        } else {
            return { top: position.scrollPos, left: position.orthoPos };
        }
    };
    P.ZoomableView.prototype.getTriggerZoom = function () {
        return this._triggerZoom;
    };
    P.ZoomableView.prototype._onFocus = function () {
        if (this._activeElement) {
            try {
                // Restores the active element previously set in positionItem but overriden by the control
                this._activeElement.setActive();
            } catch (err) {
                Jx.log.exception("People.ZoomableView._onFocus: setActive throws exception", err);
            }
        }
    };
});
