
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Jx,Mail,Debug*/

Jx.delayDefine(Mail, "ImageDownloadStatus", function () {
    "use strict";

    
    Mail.ImageDownloadStatus = /* @constructor*/function () {
        this._host = null;
    };

    var proto = Mail.ImageDownloadStatus.prototype;

    proto.initialize = function (host) {
        Debug.assert(Jx.isHTMLElement(host));
        Debug.assert(this._host === null, "Why are we initializing ImageDownloadStatus twice?");

        this._host = host;
        this._downloadInProgressText = Jx.escapeHtml(Jx.res.getString("messageImageDownloadInProgress"));
        this._downloadErrorText = Jx.escapeHtml(Jx.res.getString("messageImageDownloadError"));
        host.innerHTML = '<progress class="mailReadingPaneImageDownloadStatusProgressLine" aria-hidden="true" aria-label="' + this._downloadInProgressText + '"></progress>' +
                         '<div class="mailReadingPaneImageDownloadStatusError typeSizeNormal" aria-hidden="true">' + this._downloadErrorText + '</div>' +
                         '<div class="mailReadingPaneImageAnouncerHost"></div>';
        this._progressRingElement = host.querySelector(".mailReadingPaneImageDownloadStatusProgressLine");
        this._downloadErrorElement = host.querySelector(".mailReadingPaneImageDownloadStatusError");
        this._state = new StateDisplayNothing(this);
        this._announcer = new Mail.Announcer(host.querySelector(".mailReadingPaneImageAnouncerHost"));
    };

    proto.dispose = function () {
        this._host = null;
        this._state.dispose();
        this._state = null;
        this._announcer.dispose();
        this._announcer = null;
    };

    proto._transitionToState = function (NewState) {
        // _transitionToState can be called by embeddedAttachments dispose
        // after it has already been disposed by readingPane
        if (this._state) {
            this._state.dispose();
            this._state = new NewState(this);
        }
    };

    proto.newMessageSelected = function () {
        this._transitionToState(StateNewMessageSelected);
    };

    proto.downloadDelayed = function () {
        this._transitionToState(StateImagesStillDownloading);
    };

    proto.downloadError = function () {
        this._transitionToState(StateImagesDownloadError);
    };

    proto.downloadComplete = function () {
        this._transitionToState(StateDisplayNothing);
    };

    proto.clear = function () {
        this._transitionToState(StateDisplayNothing);
    };

    proto.setProgressRingShowing = function (show) {
        Debug.assert(Jx.isBoolean(show));
        Debug.assert(this._progressRingElement, "Initialization incomplete");
        if (show && Jx.hasClass(this._progressRingElement, "hidden")) {
            this._announcer.speak(this._downloadInProgressText);
        }
        Jx.setClass(this._progressRingElement, "hidden", !show);
        Mail.setAttribute(this._progressRingElement, "aria-hidden", (!show).toString());
     }; 

    proto.setErrorTextShowing = function (show) {
        Debug.assert(Jx.isBoolean(show));
        Debug.assert(this._downloadErrorElement, "Initialization incomplete");
        if (show && Jx.hasClass(this._downloadErrorElement, "hidden")) {
            this._announcer.speak(this._downloadErrorText);
        }
        Jx.setClass(this._downloadErrorElement, "hidden", !show);
        Mail.setAttribute(this._downloadErrorElement, "aria-hidden", (!show).toString());
    }; 

    var StateNewMessageSelected = function (downloadStatus) {
        this._downloadStatus = downloadStatus;
        downloadStatus.setProgressRingShowing(false);
        downloadStatus.setErrorTextShowing(false);

        // If the UI remains in this state for longer than 2 seconds, then transition 
        // to show the progress line.
        this._timer = new Jx.Timer(2000, this._handleSlowDownload, this);
    };
    StateNewMessageSelected.prototype = {
        dispose: function () {
            this._timer.dispose();
            this._downloadStatus = null;
        },
        _handleSlowDownload: function () {
            this._downloadStatus.downloadDelayed();
        }
    };

    var StateImagesStillDownloading = function (downloadStatus) {
        this._downloadStatus = downloadStatus;
        downloadStatus.setProgressRingShowing(true);
        downloadStatus.setErrorTextShowing(false);
    };
    StateImagesStillDownloading.prototype = {
        dispose: function () {
            this._downloadStatus = null;
        }
    };

    var StateImagesDownloadError = function (downloadStatus) {
        this._downloadStatus = downloadStatus;
        downloadStatus.setProgressRingShowing(false);
        downloadStatus.setErrorTextShowing(true);
    };
    StateImagesDownloadError.prototype = {
        dispose: function () {
            this._downloadStatus = null;
        }
    };

    var StateDisplayNothing = function (downloadStatus) {
        this._downloadStatus = downloadStatus;
        downloadStatus.setProgressRingShowing(false);
        downloadStatus.setErrorTextShowing(false);
    };
    StateDisplayNothing.prototype = {
        dispose: function () {
            this._downloadStatus = null;
        }
    };
  
});