
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true */
/*global Mail,Jx,Debug,AttachmentWell */

Jx.delayDefine(Mail, "ReadingPaneAttachmentWell", function () {
    "use strict";

    var Well = Mail.ReadingPaneAttachmentWell = function (rootId, readingPane) {
        Debug.assert(Jx.isNonEmptyString(rootId));
        Debug.assert(Jx.isInstanceOf(readingPane, Mail.CompReadingPane));
        this._readingPane = readingPane;
        this._rootId = rootId;

        this._attachmentWell = null;
        this._rootElement = null;
        this._isVisible = true;
        this._message = null;
        this._messageHook = null;

        this._disposer = new Mail.Disposer();
        Debug.only(Object.seal(this));
    };

    var wellSelector = ".mailReadingPaneAttachmentWell";

    Well.prototype = {
        dispose: function () {
            this.clear();
            this._disposer.dispose();
        },
        _getElement: function (selector) {
            if (!this._rootElement) {
                this._rootElement = document.getElementById(this._rootId);
            }
            var element = this._rootElement.querySelector(selector);
            Debug.assert(this._rootElement.querySelectorAll(selector).length === 1);
            return element;
        },
        setMessage: function (message) {
            Debug.assert((message === null) || Jx.isInstanceOf(message, Mail.UIDataModel.MailMessage));
            if (this._message !== message) {
                this._disposer.disposeNow(this._messageHook);
                this._messageHook = null;
                this._message = message;
                this.clear();
            }
        },
        clear: function () {
            if (this._attachmentWell) {
                this._attachmentWell.deactivateUI();
                this._readingPane.removeChild(this._attachmentWell);
                this._attachmentWell = null;
            }
        },
        update: function () {
            Debug.Mail.log("ReadingPane._updateAttachmentWell", Mail.LogEvent.start);

            // We're about to be up-to-date, so we don't need to listen for message changes.
            this._disposer.disposeNow(this._messageHook);
            this._messageHook = null;

            // If the reading pane is not visible (e.g. the compose window is up), we don't want to create the attachment well.
            // Otherwise, this can cause lots of file contention and unnecessary processing in the case that a message is both
            // open in the compose window and selected in the drafts folder (e.g. editing a draft).
            if (this._isVisible) {
                this.clear();
                var message = this._message;
                Debug.assert(Jx.isInstanceOf(message, Mail.UIDataModel.MailMessage));
                if (message.hasOrdinaryAttachments && !message.isJunk) {
                    var platformMessage = message.platformMailMessage,
                        body = this._getElement(Mail.ReadingPaneBody._Selectors.bodyWrapperSelector);
                    this._attachmentWell = new AttachmentWell.Read.Module(platformMessage, body);
                    this._readingPane.append(this._attachmentWell);
                    var well = this._getElement(wellSelector);
                    well.classList.remove("hidden");
                    this._attachmentWell.initUI(well);

                    // BLUE:394028 Without animation, sometimes body text overlaps with attachment well
                    // upon first initialization especially when the attachment area takes up the whole screen. 
                    // Using animation forces a repaint and hides this bug. 
                    WinJS.UI.Animation.createExpandAnimation(well).execute();
                } else {
                    this._getElement(wellSelector).classList.add("hidden");
                    Debug.assert(Jx.isNullOrUndefined(this._messageHook));
                    this._messageHook = this._disposer.add(new Mail.EventHook(message, "changed", this._onMessageChanged, this));
                }
            }
            Debug.Mail.log("ReadingPane._updateAttachmentWell", Mail.LogEvent.stop);
        },
        _onMessageChanged: function (evt) {
            Debug.assert(Jx.isObject(evt));
            Debug.assert(Jx.isInstanceOf(this._message, Mail.UIDataModel.MailMessage));

            if (Mail.Validators.hasPropertyChanged(evt, "hasOrdinaryAttachments") && !this._attachmentWell) {
                // If update() was called before the platform fired a changed event, then we never created an
                // instance of the attachment well for this message.
                this.update();
            }
        }
    };
});

