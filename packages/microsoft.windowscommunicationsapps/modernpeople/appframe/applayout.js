
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="Windows.UI.ViewManagement.js" />
/// <reference path="../Shared/JsUtil/namespace.js" />

/*jshint browser:true*/
/*global Jx,People,Windows,Debug*/

Jx.delayDefine(People, "Layout", function () {

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    var wal = Windows.UI.ViewManagement.ApplicationView;

    P.Layout = /*@constructor*/function () {
        /// <summary>Layout Constructor.</summary>
        // Initialize the state.
        this._queryWindowLayout();

        // Hook up the layout change event.
        this._layoutChangedHandler = this._onLayoutChanged.bind(this);
        /// <disable>JS3092.DeclarePropertyExplicitly</disable>
        this._mql = window.msMatchMedia("(-ms-view-state: snapped)");
        this._mqlOrient = window.msMatchMedia("(-ms-view-state: fullscreen-portrait)");
        this._mqlTall = window.msMatchMedia("(min-height: 1024px)");
        
        if (!Jx.isWWA) {
            this._mqlOrient = this._mql = window.msMatchMedia("(max-width: 340px)");// Snap is 320, but leave some extra space for the IE scrollbar
        }
        
        this._mql.addListener(this._layoutChangedHandler);
        this._mqlOrient.addListener(this._orientationChangedHandler = this._onOrientationChanged.bind(this));
        this._tallChangedHandler = this._onTallChanged.bind(this);
        this._mqlTall.addListener(this._tallChangedHandler);
        ///<enable>JS3092.DeclarePropertyExplicitly</enable>

        this._saveLayoutState = true;
        this._tallEventTriggered = false;
        this._layoutEventTriggered = false;
        this._orientationEventTriggered = false;
        this._currentScreenHeight = window.screen.height;

        Debug.Events.define(this, this.layoutChanged);
        Debug.Events.define(this, this.orientationChanged);
        Debug.Events.define(this, this.tallChanged);
    };

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var L = window.People.Layout;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    L.prototype.dispose = function () {
        // Unhook layout change event.
        ///<disable>JS3092.DeclarePropertyExplicitly</disable>
        if (this._mql) {
            this._mql.removeListener(this._layoutChangedHandler);
            this._mql = null;
        }

        if (this._mqlOrient) {
            this._mqlOrient.removeListener(this._orientationChangedHandler);
            this._mqlOrient = null;
        }

        if (this._mqlTall) {
            this._mqlTall.removeListener(this._tallChangedHandler);
            this._mqlTall = null;
        }
        ///<enable>JS3092.DeclarePropertyExplicitly</enable>
    };

    // Map snapped/filled/fullscreen to snapped/mobody/portrait as we don't care about fullscreen vs. filled.
    L.layoutState = {
        snapped: "snapped",
        mobody: "mobody",
        portrait: "portrait",
    };

    L.prototype._currentLayoutState = "";
    L.prototype.layoutChanged = "layoutChanged";
    L.prototype._layoutChangedHandler = /* @static_cast(Function)*/null;

    L.prototype.orientationChanged = "orientationChanged";
    L.prototype._orientationChangedHandler = /* @static_cast(Function)*/null;
    
    L.prototype.tallChanged = "tallChanged";
    L.prototype._tallChangedHandler = /* @static_cast(Function)*/null;

    L.prototype._onOrientationChanged = function () {
        Jx.log.info("People.CpMain._onOrientationChanged: raising orientationChanged event");

        this._queryWindowLayout();
        this._orientationEventTriggered = true;
        Jx.raiseEvent(this, this.orientationChanged);
        this._reportPerfTrackStopResize();
    };

    L.prototype.addOrientationChangedEventListener = function (eventHandler, /*@dynamic*/context) {
        /// <summary>Add an event listener for orientationChanged event.</summary>
        /// <param name="eventHandler" type="Object">The event handler.</param>
        /// <param name="context">The object which contains the event handler.</param>
        Jx.addListener(this, this.orientationChanged, eventHandler, context);
    };

    L.prototype.removeOrientationChangedEventListener = function (eventHandler, /*@dynamic*/context) {
        /// <summary>Remove an event listener for orientationChanged event.</summary>
        /// <param name="eventHandler" type="Object">The event handler.</param>
        /// <param name="context">The object which contains the event handler.</param>
        Jx.removeListener(this, this.orientationChanged, eventHandler, context);
    };

    L.prototype.getIsTall = function () {
        return window.screen.height >= 1024;
    };

    L.prototype._onTallChanged = function () {
        Jx.log.info("People.CpMain._onTallChanged: raising tallChanged event");

        this._queryWindowLayout();

        this._tallEventTriggered = true;
        Jx.raiseEvent(this, this.tallChanged);
        this._reportPerfTrackStopResize();
    };

    L.prototype.addTallChangedEventListener = function (eventHandler, /*@dynamic*/context) {
        /// <summary>Add an event listener for tallChanged event.</summary>
        /// <param name="eventHandler" type="Object">The event handler.</param>
        /// <param name="context">The object which contains the event handler.</param>
        Jx.addListener(this, this.tallChanged, eventHandler, context);
    };

    L.prototype.removeTallChangedEventListener = function (eventHandler, /*@dynamic*/context) {
        /// <summary>Remove an event listener for tallChanged event.</summary>
        /// <param name="eventHandler" type="Object">The event handler.</param>
        /// <param name="context">The object which contains the event handler.</param>
        Jx.removeListener(this, this.tallChanged, eventHandler, context);
    };

    L.prototype.getLayoutState = function () {
        /// <summary>Gets the cached layout state.</summary>
        /// <returns type="String">The cached layout state: "snapped" for snap state, "mobody" otherwise</returns>
        Jx.log.info("People.Layout.getLayoutState");
        if (this._currentLayoutState === "") {
            this._queryWindowLayout();
        }

        Debug.assert(this._currentLayoutState === L.layoutState.snapped || this._currentLayoutState === L.layoutState.mobody || this._currentLayoutState === L.layoutState.portrait);
        return this._currentLayoutState;
    };

    L.prototype.addLayoutChangedEventListener = function (eventHandler, /*@dynamic*/context) {
        /// <summary>Add an event listener for layoutChanged event.</summary>
        /// <param name="eventHandler" type="Object">The event handler.</param>
        /// <param name="context">The object which contains the event handler.</param>
        Jx.addListener(this, this.layoutChanged, eventHandler, context);
    };

    L.prototype.removeLayoutChangedEventListener = function (eventHandler, /*@dynamic*/context) {
        /// <summary>Remove an event listener for layoutChanged event.</summary>
        /// <param name="eventHandler" type="Object">The event handler.</param>
        /// <param name="context">The object which contains the event handler.</param>
        Jx.removeListener(this, this.layoutChanged, eventHandler, context);
    };

    L.prototype.unsnap = function (callback, /*@dynamic*/context) {
        /// <summary>Unsnap is not supported in Blue. Short circuit to call the callback.</summary>
        /// <param name="callback" type="Function" optional="true">The callback after app is unsnapped. </param>
        /// <param name="context" optional="true">The calling context for the callback</param>
        /// <returns type="Boolean">Returns whether unsnap succeeded</returns>
        Debug.assert(Jx.isNullOrUndefined(callback) || Jx.isFunction(callback), "Invalid parameter: callback");
        Debug.assert(Jx.isNullOrUndefined(context) || !Jx.isNullOrUndefined(callback), "Context passed without callback");
        Jx.log.info("People.Layout.unsnap");

        // Just call the callback and return true as unsnap is no longer supported in Blue.
        if (callback) {
            callback.call(context);
        }

        return true;
    };

    L.prototype._reportPerfTrackStopResize = function () {
        // compare old height and new height to see if it is a rotate
        var isRotate = (((this._oldScreenHeight < 1024) && (this._currentScreenHeight >= 1024)) ||
                    ((this._oldScreenHeight >= 1024) && (this._currentScreenHeight < 1024))); 

        // if it is a rotate then we have to wait for the "_tallEventTriggered" before we mark the Stop resize event
        var waitForRotateEvent = (isRotate && !this._tallEventTriggered);

        // compare old layout state with new to see if we expect a layout change event
        var isLayoutChange = (((this._oldLayoutState !== L.layoutState.snapped) && (this._currentLayoutState === L.layoutState.snapped)) ||
                          ((this._oldLayoutState === L.layoutState.snapped) && (this._currentLayoutState !== L.layoutState.snapped)));

        // if it is a layoutChange then we have to wait for the "_layoutEventTriggered" before we mark the Stop resize event
        var waitForLayoutEvent = (isLayoutChange && !this._layoutEventTriggered);

        if (this._orientationEventTriggered && !waitForLayoutEvent && !waitForRotateEvent) {
            var isMajorChange = (isRotate || this._layoutEventTriggered);

            Jx.ptStopResize(Jx.TimePoint.responsive, isMajorChange, isRotate, window.screen.width, window.screen.height);
            // Reset these flags once they have been used
            this._tallEventTriggered = false;
            this._layoutEventTriggered = false;
            this._orientationEventTriggered = false;
            this._saveLayoutState = true;
        }
    };

    L.prototype._queryWindowLayout = function () {
        /// <summary>Query the current app layout state and update the cached value.</summary>
        Jx.log.info("People.Layout._queryWindowLayout");

        // This function gets called mutiple times when the app layout or orientation gets changed.
        // Save the old state - only once per change
        // At the end of the change _reportPerfTrackStopResize will reset this "_saveLayoutState" flag
        if (this._saveLayoutState) {
            this._oldLayoutState = this._currentLayoutState;
            this._oldScreenHeight = this._currentScreenHeight;
            this._saveLayoutState = false;
        }

        this._currentScreenHeight = window.screen.height;

        var appLayout = wal.value;
        var layoutState = Windows.UI.ViewManagement.ApplicationViewState;
        // Convert ApplicationViewState to P.CpMain.layoutState.
        if (appLayout === layoutState.snapped) {
            this._currentLayoutState = L.layoutState.snapped;
        } else if (appLayout === layoutState.fullScreenPortrait) {
            this._currentLayoutState = L.layoutState.portrait;
        } else {
            // Map other filled and fullscreen states to mobody.
            this._currentLayoutState = L.layoutState.mobody;
        }
    };

    L.prototype._onLayoutChanged = function () {
        /// <summary>Layout change event handler. Raise layoutChanged event with the new layout state.</summary>
        Jx.log.info("People.Layout._onLayoutChanged");
        var oldLayout = this._currentLayoutState;
        Debug.assert(Jx.isNonEmptyString(oldLayout));

        this._queryWindowLayout();
        var newLayout = this._currentLayoutState;
        
        if (newLayout !== oldLayout) {
            // Fire layout change event so that components can update accordingly.
            // We only care about the layout change between snap and non-snap.
            Jx.log.info("People.CpMain._onLayoutChanged: raising layoutChanged event=" + newLayout);
            this._layoutEventTriggered = true;
            Jx.raiseEvent(this, this.layoutChanged, newLayout);
            this._reportPerfTrackStopResize();
        }
    };
});
