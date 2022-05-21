
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug*/

Jx.delayDefine(Mail, "GUIState", function () {
    "use strict";

    var GUIState = Mail.GUIState = function (selection) {
        this._frameElement = null;
        this._viewState = null;
        this._layout = null;

        this._defaultOnePaneLayout = Layout.navAndMessageList;
        this._lastVisibility = this._getVisibility();

        this._width = window.innerWidth;

        this._newGlomTimer = null;
        this._handleSizeDownInternal = this._sizeDownToReadingPane;
        this._disposer = new Mail.Disposer(
            new Mail.EventHook(window, "resize", this.updateViewState, this),
            new Mail.EventHook(document, "msvisibilitychange", function () { this._lastVisibility = this._getVisibility(); }, this)
        );
        this._selection = selection;
        this._resizePerf = this._disposer.add(new Mail.ResizePerfReport(this));
    };
    Jx.augment(GUIState, Jx.Events);

    // Unique class name for UTs
    Mail.ParentGUIState = Mail.GUIState;

    var prototype = GUIState.prototype;
    Debug.Events.define(prototype, "layoutChanged");
    Debug.Events.define(prototype, "viewStateChanged");

    var Layout = {
        full: 0,
        navAndMessageList: 1,
        readingPane: 2
    };

    Object.defineProperty(prototype, "isSnapped", { get: function () { return this._width <= 320; }, enumerable: true });
    Object.defineProperty(prototype, "isOnePane", { get: function () { return !this.isThreePane; }, enumerable: true });
    Object.defineProperty(prototype, "isThreePane", { get: function () { return this._width >= 844; }, enumerable: true });
    Object.defineProperty(prototype, "isNavPaneWide", { get: function () { return (this._width >= 502 && this._width < 844) || this._width >= 1025; }, enumerable: true });
    Object.defineProperty(prototype, "isNavPaneActive", { get: function () { return this._layout === Layout.navAndMessageList; }, enumerable: true });
    Object.defineProperty(prototype, "isMessageListActive", { get: function () { return this.isNavPaneActive; }, enumerable: true });
    Object.defineProperty(prototype, "isReadingPaneActive", { get: function () { return this._layout === Layout.readingPane; }, enumerable: true });
    Object.defineProperty(prototype, "isNavPaneVisible", { get: function () { return this.isThreePane || this.isNavPaneActive; }, enumerable: true });
    Object.defineProperty(prototype, "isMessageListVisible", { get: function () { return this.isThreePane || this.isMessageListActive; }, enumerable: true });
    Object.defineProperty(prototype, "isReadingPaneVisible", { get: function () { return this.isThreePane || this.isReadingPaneActive; }, enumerable: true });
    Object.defineProperty(prototype, "width", { get: function () { return this._width; }, enumerable: true });

    prototype._updateLayout = function (newLayout) {
        Debug.assert(Jx.isValidNumber(newLayout));
        this._layout = newLayout;
        if (this.isOnePane) { // Remember the most recent layout used in One Pane
            this._defaultOnePaneLayout = newLayout;
        }
        this.raiseEvent("layoutChanged");
    };

    prototype._initializeFrame = function (newWidth) {
        Mail.writeProfilerMark("GUIState._initializeFrame", Mail.LogEvent.start);

        Debug.assert(this._frameElement === null);
        Debug.assert(this._viewState === null);
        Debug.assert(this._layout === null);

        this._width = newWidth;
        this._frameElement = document.getElementById(Mail.CompFrame.frameElementId);
        this._appBodyElement = document.getElementById("appBody");
        this._viewState = Jx.ApplicationView.getState();

        Debug.assert(Jx.isHTMLElement(this._frameElement));
        Debug.assert(Jx.isHTMLElement(this._appBodyElement));

        if (this.isThreePane) {
            this._layout = Layout.full;
        } else {
            Debug.assert(this._defaultOnePaneLayout === Layout.navAndMessageList);
            this._layout = this._defaultOnePaneLayout;
            this._appBodyElement.classList.add("navMessageListActive");
        }

        Debug.assert(Jx.isValidNumber(this._viewState));
        Debug.assert(Jx.isValidNumber(this._layout));
        Debug.assert(Jx.isValidNumber(this._width));

        this._disposer.add(new Mail.EventHook(Jx.glomManager, Jx.GlomManager.Events.glomShowing, this._onGlomShowing, this));

        Mail.writeProfilerMark("GUIState._initializeFrame", Mail.LogEvent.stop);
    };

    prototype.updateViewState = function () {
        Mail.writeProfilerMark("GUIState._updateViewState", Mail.LogEvent.start);

        var newWidth = this._getWidth();
        Debug.assert(Jx.isValidNumber(newWidth));

        if (!this._frameElement) {
            this._initializeFrame(newWidth);
            Mail.writeProfilerMark("GUIState._updateViewState", Mail.LogEvent.stop);
            return;
        }

        var wasThreePane = this.isThreePane,
            newViewState = Jx.ApplicationView.getState();

        this._width = newWidth;

        if (newViewState !== this._viewState) {
            this._viewState = newViewState;
            this.raiseEvent("viewStateChanged", this._viewState);

            if (wasThreePane !== this.isThreePane) {
                if (this.isOnePane && !this._lastVisibility && this._getVisibility()) {
                    // We are being resized down to One Pane before being brought from the backstack - decide which layout to use
                    this._handleSizeDownInternal = this._defaultOnePaneLayout === Layout.navAndMessageList ? this._sizeDownToNavMessageList : this._sizeDownToReadingPane;
                }

                (wasThreePane ? this._handleSizeDown : this._handleSizeUp).call(this);
            }
        }

        this._resizePerf.viewStateComplete();
        Mail.writeProfilerMark("GUIState._updateViewState", Mail.LogEvent.stop);
    };

    prototype._restoreSizeDownHandler = function () {
        this._handleSizeDownInternal = this._sizeDownToReadingPane;
        this._disposer.disposeNow(this._newGlomTimer);
        this._newGlomTimer = null;
    };

    prototype._onGlomShowing = function (event) {
        var context = event.glom.getStartingContext();

        // Unless if the child shows an EML message, we should resize down to the NavPane and MessageList
        if (!context.isEmlMessage) {
            this._handleSizeDownInternal = this._sizeDownToNavMessageList;

            // If we don't hear back from the child window in 5 seconds, recover the normal behavior
            this._newGlomTimer = this._disposer.replace(this._newGlomTimer, new Jx.Timer(5000, this._restoreSizeDownHandler, this));
        }
    };

    prototype.handleGlomVisible = function () {
        this._restoreSizeDownHandler();
    };

    prototype._sizeDownToReadingPane = function () {
        if (!this._showReadingPane()) {
            this._sizeDownToNavMessageList();
        }

        Mail.writeProfilerMark("GUIState._handleSizeDown_ReadingPane");
    };

    prototype._sizeDownToNavMessageList = function () {
        this._frameElement.classList.remove("readingPaneActive");
        this._appBodyElement.classList.add("navMessageListActive");
        this._updateLayout(Layout.navAndMessageList);
        Mail.writeProfilerMark("GUIState._handleSizeDown_NavMessage");
    };

    prototype._handleSizeDown = function () {
        Mail.writeProfilerMark("GUIState._handleSizeDown", Mail.LogEvent.start);

        Debug.assert(this.isOnePane);
        this._handleSizeDownInternal();

        Mail.writeProfilerMark("GUIState._handleSizeDown", Mail.LogEvent.stop);
    };

    prototype._handleSizeUp = function () {
        Mail.writeProfilerMark("GUIState._handleSizeUp", Mail.LogEvent.start);

        Debug.assert(this.isThreePane);

        this._frameElement.classList.remove("readingPaneActive");
        this._appBodyElement.classList.remove("navMessageListActive");
        this._updateLayout(Layout.full);

        Mail.writeProfilerMark("GUIState._handleSizeUp", Mail.LogEvent.stop);
    };

    prototype._showReadingPane = function () {
        if (!this._selection.message) {
            return false;
        }

        this._frameElement.classList.add("readingPaneActive");
        this._appBodyElement.classList.remove("navMessageListActive");
        this._updateLayout(Layout.readingPane);

        return true;
    };

    prototype.navigateForward = function () {
        Mail.writeProfilerMark("GUIState.navigateForward", Mail.LogEvent.start);

        if (this._layout === Layout.navAndMessageList) {
            this._showReadingPane();
        }

        Mail.writeProfilerMark("GUIState.navigateForward", Mail.LogEvent.stop);
    };

    prototype.navigateBackward = function () {
        Mail.writeProfilerMark("GUIState.navigateBackward", Mail.LogEvent.start);

        this._frameElement.classList.remove("readingPaneActive");

        if (this._layout === Layout.readingPane) {
            this._appBodyElement.classList.add("navMessageListActive");
            this._updateLayout(Layout.navAndMessageList);
        }

        Mail.writeProfilerMark("GUIState.navigateBackward", Mail.LogEvent.stop);
    };

    prototype.ensureNavMessageList = function () {
        Mail.writeProfilerMark("GUIState.ensureNavMessageList", Mail.LogEvent.start);

        this.navigateBackward();

        if (!this._getVisibility()) {
            this._defaultOnePaneLayout = Layout.navAndMessageList;
        }

        Mail.writeProfilerMark("GUIState.ensureNavMessageList", Mail.LogEvent.stop);
    };

    prototype.dispose = function () {
        this._disposer.dispose();
        this._disposer = null;
        this._newGlomTimer = null;
    };

    // UTs replace the following functions to simulate window property change

    prototype._getWidth = function () {
        return window.innerWidth;
    };

    prototype._getVisibility = function () {
        return !document.msHidden;
    };

});
