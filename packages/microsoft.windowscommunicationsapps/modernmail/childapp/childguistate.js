
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug*/

Jx.delayDefine(Mail, ["GUIState", "ChildGUIState"], function () {
    "use strict";

    Mail.GUIState = function () {
        this._viewState = null;
        this._width = this._getWidth();
        this._disposer = new Mail.Disposer(new Mail.EventHook(window, "resize", this.updateViewState, this));
    };
    var GUIState = Mail.GUIState;
    Jx.augment(GUIState, Jx.Events);

    // Unique class name for UTs
    Mail.ChildGUIState = Mail.GUIState;

    GUIState.Events = {
        layoutChanged: "layoutChanged",
        viewStateChanged: "viewStateChanged"
    };
    var prototype = GUIState.prototype;
    Debug.Events.define.apply(Debug.Events, [prototype].concat(Object.keys(GUIState.Events)));

    Object.defineProperty(prototype, "isSnapped", { get: function () { return this._width <= 320; }, enumerable: true });
    Object.defineProperty(prototype, "isOnePane", { get: function () { return true; }, enumerable: true });
    Object.defineProperty(prototype, "isThreePane", { get: function () { return false; }, enumerable: true });
    Object.defineProperty(prototype, "isNavPaneWide", { get: function () { return false; }, enumerable: true });
    Object.defineProperty(prototype, "isNavPaneActive", { get: function () { return false; }, enumerable: true });
    Object.defineProperty(prototype, "isMessageListActive", { get: function () { return false; }, enumerable: true });
    Object.defineProperty(prototype, "isReadingPaneActive", { get: function () { return true; }, enumerable: true });
    Object.defineProperty(prototype, "isNavPaneVisible", { get: function () { return false; }, enumerable: true });
    Object.defineProperty(prototype, "isMessageListVisible", { get: function () { return false; }, enumerable: true });
    Object.defineProperty(prototype, "isReadingPaneVisible", { get: function () { return true; }, enumerable: true });
    Object.defineProperty(prototype, "width", { get: function () { return this._width; }, enumerable: true });

    prototype._getWidth = function () {
        // Since we cannot programmatically resize windows, this method is overwritten by UT to simulate width change.
        return window.innerWidth;
    };

    prototype.updateViewState = function () {
        Mail.writeProfilerMark("ChildGUIState._updateViewState", Mail.LogEvent.start);
        document.getElementById(Mail.CompFrame.frameElementId).classList.add("childWindow");

        var newWidth = this._getWidth(),
            newViewState = Jx.ApplicationView.getState();
        Debug.assert(Jx.isValidNumber(newWidth));

        this._width = newWidth;

        if (newViewState !== this._viewState) {
            this._viewState = newViewState;
            this.raiseEvent(Mail.GUIState.Events.viewStateChanged, this._viewState);
        }

        Mail.writeProfilerMark("ChildGUIState._updateViewState", Mail.LogEvent.stop);

    };

    prototype.ensureNavMessageList = function () {
        // Child gui states have no message list or nave pane to ensure.
    };

    prototype.navigateForward = function () {
        // Child gui states does not 'navigate'.
        Debug.assert(false, "navigateForward unexpected in child window");
    };

    prototype.navigateBackward = function () {
        // Child gui states does not 'navigate'.
        Debug.assert(false, "navigateBackward unexpected in child window");
    };

    prototype.handleGlomVisible = function () {
        // Child gui states has no behavior for other child glom visability changes.
        Debug.assert(false, "handleGlomVisible unexpected in child window");
    };

    prototype.dispose = function () {
        this._disposer.dispose();
        this._disposer = null;
    };

});
