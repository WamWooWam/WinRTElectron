
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail, Jx, Debug,*/

Jx.delayDefine(Mail, "ReadingPaneHeader", function () {
    "use strict";

    Mail.ReadingPaneHeader = function (selection) {
        Debug.assert(Jx.isObject(selection), 'Jx.isObject(selection)');

        this._message = this._messageHook = null;
        this._host = null;
        this._header = new Mail.HeaderControl(selection);
        this._resizeHook = null;
    };

    Mail.ReadingPaneHeader.prototype.initialize = function (host) {
        /// <param name="host" type="HTMLElement" />
        Debug.assert(this._host === null, "Why are we initializing ReadingPaneHeader twice?");

        this._host = host;
        this._header.initialize(host);
    };

    Mail.ReadingPaneHeader.prototype.dispose = function () {
        Mail.writeProfilerMark("ReadingPaneHeader.dispose", Mail.LogEvent.start);
        Jx.dispose(this._resizeHook);
        Jx.dispose(this._messageHook);
        this._message = this._messageHook = this._resizeHook = null;

        this._header.dispose();
        Mail.writeProfilerMark("ReadingPaneHeader.dispose", Mail.LogEvent.stop);
    };

    Mail.ReadingPaneHeader.prototype.setMessage = function (message) {
        /// <param name="message" type="Mail.UIDataModel.MailMessage" />
        Debug.assert(message === null || Jx.isInstanceOf(message, Mail.UIDataModel.MailMessage));


        Jx.dispose(this._messageHook);
        this._messageHook = null;

        this._message = message;

        if (Jx.isObject(this._message)) {
            this._messageHook = new Mail.EventHook(this._message, "changed", this._messageChanged, this);
            if (!this._resizeHook) {
                this._resizeHook = new Mail.EventHook(window, "resize", this._updateDateTime, this, false);
            }
            this._updateHeader();
            this._host.classList.remove("hidden");
        } else {
            Jx.dispose(this._resizeHook);
            this._resizeHook = null;
        }
    };

    Mail.ReadingPaneHeader.prototype._messageChanged = function (evt) {
        ///<param name="evt" type="Event"/>
        Debug.assert(Jx.isObject(evt));
        Debug.assert(Jx.isInstanceOf(this._message, Mail.UIDataModel.MailMessage));

        if (Mail.Validators.havePropertiesChanged(evt, ["to", "cc", "bcc", "from", "receivedDate", "irmTemplateId"])) {
            this._updateHeader();
        }
    };

    Mail.ReadingPaneHeader.prototype._updateDateTime = function () {
        Debug.assert(Jx.isInstanceOf(this._message, Mail.UIDataModel.MailMessage));
        var message = this._message;

        // Which date format we show depends on the size of the app
        var state = Jx.ApplicationView.State,
            currentState = Jx.ApplicationView.getState();
        if (currentState === state.minimum || currentState === state.snap) {
            Debug.assert(Jx.isNonEmptyString(message.bestDateShortString));
            this._header.updateDateTime(message.bestDateShortString);
        } else {
            Debug.assert(Jx.isNonEmptyString(message.bestDateLongString));
            Debug.assert(Jx.isNonEmptyString(message.bestTimeShortString));
            this._header.updateDateTime(message.bestDateLongString, message.bestTimeShortString);
        }
    };

    Mail.ReadingPaneHeader.prototype._updateHeader = function () {
        Debug.assert(Jx.isInstanceOf(this._message, Mail.UIDataModel.MailMessage));
        var message = this._message;

        this._updateDateTime();
        this._header.updateIrmInfo(message.irmHasTemplate, message.irmTemplateName, message.irmTemplateDescription);

        this._header.updateHeader(message.to, message.cc, message.bcc, message.fromRecipientArray,
                                  message.headerNoRecipientsString, message.isOutboundFolder, message.isOutboundFolder, message.isInSentItems, message.senderRecipient);
    };

});
