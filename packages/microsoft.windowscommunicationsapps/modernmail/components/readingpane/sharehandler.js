
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Jx, Mail, Windows, Debug, ModernCanvas */

Jx.delayDefine(Mail, "ShareHandler", function () {
    "use strict";

    /// <summary>
    /// ShareHandler - Handling sharing for the mail app
    /// </summary>
    Mail.ShareHandler = function () {
        Mail.writeProfilerMark("ShareHandler.Constructor", Mail.LogEvent.start);
        this._enabled = true;
        this._onShareSourceDataRequested = this._onShareSourceDataRequested.bind(this);

        this._disposer = new Mail.Disposer(
            new Mail.EventHook(Mail.guiState, "layoutChanged", this._onLayoutChanged, this),
            new Mail.EventHook(
                Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView(),
                "datarequested",
                this._onShareSourceDataRequested,
                this
            )
        );

        Debug.only(Object.seal(this));

        Mail.writeProfilerMark("ShareHandler.Constructor", Mail.LogEvent.stop);
    };

    //
    // Private members
    //

    Mail.ShareHandler.prototype._onShareSourceDataRequested = function (/*@dynamic*/e) {
        /// <summary>Handler to set the share source</summary>
        Mail.writeProfilerMark("ShareHandler._onShareSourceDataRequested", Mail.LogEvent.start);

        Debug.assert(Jx.isObject(e));

        var request = e.request,
            readingBody = this._getBestReadingBody();

        Debug.assert(Jx.isHTMLElement(readingBody));
        Debug.assert(Jx.isObject(request));

        if (this._enabled) {
            var doc = document;
            if (window.getSelection().isCollapsed) {
                doc = readingBody.contentWindow.document;
            }

            var packageData = ModernCanvas.Component.prototype.createDataPackageFromSelection(doc);

            if (packageData) {
                request.data = packageData;

                request.data.properties.title = Jx.res.getString("mailShareTitle");
            } else {
                Jx.log.error("Unable to create Share package from selection");
                this._failRequest(request);
            }
        } else {
            this._failRequest(request);
        }

        Mail.writeProfilerMark("ShareHandler._onShareSourceDataRequested", Mail.LogEvent.stop);
    };

    Mail.ShareHandler.prototype._failRequest = function (request) {
        Debug.assert(Jx.isFunction(request.failWithDisplayText));

        request.failWithDisplayText(Jx.res.getString("mailShareFail"));
    };

    Mail.ShareHandler.prototype._getBestReadingBody = function () {
        var activePane = document.getElementById("mailFrameReadingPane");
        return activePane.querySelector(Mail.ReadingPaneBody._Selectors.bodyFrameElementSelector);
    };

    Mail.ShareHandler.prototype._onLayoutChanged = function () {
        /// <summary>Disable share when ReadingPane is not visible in one-pane view</summary>
        var guiState = Mail.guiState;
        this._enabled = guiState.isReadingPaneVisible;
    };

    Mail.ShareHandler.prototype.dispose = function () {
        this._disposer.dispose();
        this._disposer = null;
    };

});
