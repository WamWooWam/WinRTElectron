
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug*/

Jx.delayDefine(Mail, "ResizePerfReport", function () {
    "use strict";

    //
    //  ResizePerfReport
    //
    //  This class listens to an event from guiState that fires at the end of guiState handling a resize event.
    //  If the message list is showing, a flag is set to expect the message list loading state change.
    //  If the reading pane is showing, a flag is set to expect a reading pane resize event.
    //  Once both conditions have been met, window.requestAnimationFrame is used to make sure the screen has been drawn.
    //  After paint, the resize event is reported to perftrack.
    //

    Mail.ResizePerfReport = function (guiState) {
        this._guiState = guiState;
        this._disposer = new Mail.Disposer(Mail.EventHook.createGlobalHook("bodyResized", this._onBodyResized, this));
        this._previousIsThreePane = this._guiState.isThreePane;
        this._viewPortLoaded = true;
        this._reportResize = this._reportResize.bind(this);
        this._enableReport = false;
        this._readingPaneResized = true;
        this._viewLoadedHandler = null;
        Debug.only(Object.seal(this));
    };

    var proto = Mail.ResizePerfReport.prototype;
    proto._onLoadingStateChanged = function () {
        if (!this._viewPortLoaded) {
            var listView = Mail.MessageListItemFactory.listView;
            Debug.assert(Jx.isObject(listView));
            if (listView.loadingState === "viewPortLoaded") {
                Debug.assert(!Jx.isNullOrUndefined(this._viewLoadedHandler), "Recived view loaded event but not registered for it?");
                this._viewLoadedHandler.dispose();
                this._viewLoadedHandler = null;
                this._viewPortLoaded = true;
                this._checkResizeComplete();
            }
        }
    };

    proto._onBodyResized = function () {
        if (!this._readingPaneResized) {
            this._readingPaneResized = true;
            this._checkResizeComplete();
        }
    };

    proto._checkResizeComplete = function () {
        if (this._viewPortLoaded && this._readingPaneResized && this._enableReport) {
            // The viewPortLoaded event and the readingPaneResize event both occur before the paint.
            // Report after paint.
            _markAsyncStart("requestAnimationFrame");
            window.requestAnimationFrame(this._reportResize);
            this._enableReport = false;
        }
    };

    proto._reportResize = function () {
        _markAsyncStop("requestAnimationFrame");
        var isThreePane = this._guiState.isThreePane,
            isMajor = isThreePane != this._previousIsThreePane;
        _mark("isMajor = " + isMajor);
        Jx.ptStopResize(
            /*Timepoint*/Jx.TimePoint.responsive,
            /*isMajor*/isMajor,
            /*isRotate*/false,
            /*logicalWidth*/this._guiState.width,
            /*logicalHeight*/window.innerHeight);
        this._previousIsThreePane = isThreePane;
        _markAsyncStop("Async Work");
    };

    proto.viewStateComplete = function () {
        if (this._guiState.isMessageListVisible) {
            var listView = Mail.MessageListItemFactory.listView;
            if (listView) {
                if (!this._viewLoadedHandler) {
                    this._viewLoadedHandler = new Mail.EventHook(listView, "loadingstatechanged", this._onLoadingStateChanged, this);
                }
                this._viewPortLoaded = false;
            }
        }
        if (this._guiState.isReadingPaneVisible) {
            this._readingPaneResized = false;
        }
        if (!this._readingPaneResized || !this._viewPortLoaded) {
            _markAsyncStart("Async Work");
            this._enableReport = true;
        }
    };

    proto.dispose = function () {
        Debug.assert(this._viewLoadedHandler === null);
        this._disposer.dispose();
        this._disposer = null;
        Jx.EventManager.removeListener(null, "bodyResized", this._onBodyResized, this);
    };

    function _mark(s) { Jx.mark("ResizePerfReport." + s); }
    function _markAsyncStart(s) { Jx.mark("ResizePerfReport:" + s + ",StartTM,ResizePerfReport"); }
    function _markAsyncStop(s) { Jx.mark("ResizePerfReport:" + s + ",StopTM,ResizePerfReport"); }


});
