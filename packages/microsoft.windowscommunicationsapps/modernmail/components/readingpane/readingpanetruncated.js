
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug,Microsoft,WinJS*/

Jx.delayDefine(Mail, "ReadingPaneTruncationControl", function () {
    "use strict";

    var Truncated = Mail.ReadingPaneTruncationControl = function (rootId, readingPane, readingPaneBody) {
        Debug.assert(Jx.isNonEmptyString(rootId));
        Debug.assert(Jx.isInstanceOf(readingPane, Mail.CompReadingPane));
        Debug.assert(Jx.isInstanceOf(readingPaneBody, Mail.ReadingPaneBody));
        this._rootId = rootId;
        this._readingPane = readingPane;
        this._readingPaneBody = readingPaneBody;

        this._disposer = new Mail.Disposer();
        this._rootElement = null;
        this._message = null;
        this._timer = null;

        this._messageChangeHook = null;

        Debug.only(Object.seal(this));
    };

    var Selectors = Truncated._selectors = {
        progressText: ".mailReadingPaneDownloadMessageProgress",
        failureState: ".mailReadingPaneDownloadMessageFailure",
        failureText: ".mailReadingPaneDownloadMessageFailureText",
        link: ".mailReadingPaneDownloadMessageLink",
        linkRetry: ".mailReadingPaneDownloadMessageLinkRetry",
        control: ".mailReadingPaneTruncationControl"
    };

    var Plat = Microsoft.WindowsLive.Platform,
        BodyStatus = Plat.BodyDownloadStatus;
    Truncated.prototype = {
        dispose: function () {
            this._disposer.dispose();
            this._disposer = null;

            this._rootId = null;
            this._readingPane = null;
            this._readingPaneBody = null;
        },
        _getRootElement: function () {
            if (!this._rootElement) {
                this._rootElement = document.getElementById(this._rootId);
            }
            return this._rootElement;
        },
        activateUI: function () {
            var root = this._getRootElement(),
                truncationLink = root.querySelector(Selectors.link),
                retryLink = root.querySelector(Selectors.linkRetry);
            this._disposer.addMany(
                new Mail.EventHook(this._readingPaneBody, Mail.ReadingPaneBody.Events.bodyLoaded, this._onBodyLoaded, this),
                new Mail.EventHook(truncationLink, "click", this._onDownloadLinkClick, this, false),
                new Mail.EventHook(retryLink, "click", this._onDownloadLinkClick, this, false)
            );

        },
        setMessage: function (message) {
            this._disposer.disposeNow(this._messageChangeHook);
            this._messageChangeHook = null;

            this._message = message;
            if (message) {
                this._messageChangeHook = new Mail.EventHook(message.platformMailMessage, "changed", this._messageChanged, this);
                this._disposer.add(this._messageChangeHook);
            }
        },
        _onBodyLoaded: function () {
            this.updateTruncationControl();
        },
        updateTruncationControl: function () {
            var message = this._message;
            if (Jx.isNullOrUndefined(message) || message.needBody) {
                return;
            }

            // bodyContentType might be null if we encountered an error downloading a truncated message and we are
            // currently reloading the message body
            var bodyContentType = this._readingPaneBody.getBodyType();
            Debug.assert(Jx.isNumber(bodyContentType) || (bodyContentType === null));
            if (Jx.isNumber(bodyContentType) && message.isBodyTruncated(bodyContentType)) {
                this._showElement(Selectors.control);

                // Always show first, then hide the others, it prevents the scroll position from shifting awkwardly
                if (message.bodyDownloadStatus === BodyStatus.upToDate) {
                    this._showElement(Selectors.link);
                    this._hideElement(Selectors.progressText);
                    this._hideElement(Selectors.failureState);
                } else if (message.bodyDownloadStatus === BodyStatus.inProgress) {
                    this._showElement(Selectors.progressText);
                    this._hideElement(Selectors.link);
                    this._hideElement(Selectors.failureState);

                    // We need to modify the innerText manually for narrator to pick it up
                    this._getRootElement().querySelector(Selectors.progressText).innerText = Jx.res.getString("mailReadingPaneDownloadProgress");
                } else {
                    this._showElement(Selectors.failureState);
                    this._hideElement(Selectors.link);
                    this._hideElement(Selectors.progressText);

                    // We need to modify the innerText manually for narrator to pick it up
                    this._getRootElement().querySelector(Selectors.failureText).innerText = Jx.res.getString("mailReadingPaneDownloadFailure");
                }
            } else {
                this._hideElement(Selectors.control);
            }
        },
        _showElement: function (selector) {
            this._getRootElement().querySelector(selector).classList.remove("hidden");
        },
        _hideElement: function (selector) {
            this._getRootElement().querySelector(selector).classList.add("hidden");
        },
        _onDownloadLinkClick: function () {
            Debug.assert(Jx.isObject(this._message));
            this._readingPaneBody.focusAfterReload = true;

            this._message.downloadFullBody();
        },
        updateBodyDownloadStatus: function () {
            if (this._message.bodyDownloadStatus === BodyStatus.failed) {
                this.clearProgressRingTimer();
                this._showElement(".mailReadingPaneMissingBodyMessage");
                this._hideElement(".mailReadingPaneProgress");
            }
        },
        clearProgressRingTimer: function () {
            this._disposer.disposeNow(this._timer);
            this._timer = null;
        },
        _messageChanged: function (evt) {
            ///<param name="evt" type="Event"/>
            var logString = "ReadingPaneTruncationControl._messageChanged:";
                Debug.assert(Jx.isObject(evt));
            if (Mail.Validators.hasPropertyChanged(evt, "bodyDownloadStatus")) {
                logString += "bodyDownloadStatus - " + this._message.objectId;
                Mail.writeProfilerMark(logString, Mail.LogEvent.start);
                if (this._message.needBody) {
                    this.updateBodyDownloadStatus();
                } else {
                    this.updateTruncationControl();
                }
                Mail.writeProfilerMark(logString, Mail.LogEvent.stop);
            } else if (Mail.Validators.hasPropertyChanged(evt, "needBody")) {
                logString += "needBody - " + this._message.objectId;
                Mail.writeProfilerMark(logString, Mail.LogEvent.start);
                this._readingPane.refreshUI();
                if (!this._message.needBody) {
                    this._handleBodyDownloaded();
                }
                Mail.writeProfilerMark(logString, Mail.LogEvent.stop);
            }
        },
        _handleBodyDownloaded: function () {
            Debug.assert(!this._message.needBody);
            var guiState = Mail.guiState;
            if (guiState.isReadingPaneVisible) {
                this._readingPane.markAsRead();
            }
        },
        canShowBody: function () {
            Mail.writeProfilerMark("ReadingPaneTruncationControl.canShowBody", Mail.LogEvent.start);
            var message = this._message,
                needBody = message.needBody;
            if (needBody) { // If we need to get the body for a message, kick off the download and show a spinner
                message.downloadFullBody();
            }
            this._showSpinner(needBody);
            Mail.writeProfilerMark("ReadingPaneTruncationControl.canShowBody", Mail.LogEvent.stop);
            return !needBody;
        },
        _showSpinner: function (show) {
            var root = this._getRootElement();
            var progressRing = root.querySelector(".mailReadingPaneProgress");
            Truncated.showSpinner(show, root);
            progressRing.classList.add("hidden");
            if (show) {
                Mail.writeProfilerMark("ReadingPaneTruncationControl.canShowBody - showing spinner for objectId: " + this._message.objectId);
                // Wait 1000ms seconds before showing the spinner
                this._timer = this._disposer.replace(this._timer, new Jx.Timer(1000, function () {
                    progressRing.classList.remove("hidden");
                    WinJS.UI.Animation.fadeIn([progressRing]);
                }, this));
            } else {
                this.clearProgressRingTimer();
            }
        }
    };

    Truncated.showSpinner = function (show, root) {
        Jx.setClass(root.querySelector(".mailReadingPaneBodyWrapper"), "hidden", show);
        Jx.setClass(root.querySelector(".mailReadingPaneProgressWrapper"), "hidden", !show);
        Jx.setClass(root.querySelector(".mailReadingPaneProgress"), "hidden", !show);
    };

});
