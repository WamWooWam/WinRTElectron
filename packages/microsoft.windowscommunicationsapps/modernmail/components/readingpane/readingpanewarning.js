
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx, Mail, Debug */
/*jshint browser:true*/

Jx.delayDefine(Mail, "ReadingPaneWarning", function () {
    "use strict";

    Mail.ReadingPaneWarning = /* @constructor*/function () {
        this._message = this._messageHook = null;
        this._host = null;
    };

    var proto = Mail.ReadingPaneWarning.prototype;

    proto.initialize = function (host) {
        /// <param name="host" type="HTMLElement" />
        Debug.assert(this._host === null, "Why are we initializing ReadingPaneWarning twice?");

        this._host = host;
        this._host.innerHTML = '<div class="mailReadingPaneWarningTitle mailReadingPaneHeader typeSizeNormal"></div>' +
                               '<div class="mailReadingPaneWarningMessage mailReadingPaneHeader typeSizeNormal"></div>';
    };

    proto.dispose = function () {
        Jx.dispose(this._messageHook);
        this._message = this._messageHook = null;
        this._host = null;
    };

    proto.setMessage = function (message) {
        /// <param name="message" type="Mail.UIDataModel.MailMessage" />
        Debug.assert(message === null || Jx.isInstanceOf(message, Mail.UIDataModel.MailMessage));
        Mail.writeProfilerMark("ReadingPaneWarning.setMessage", Mail.LogEvent.start);

        Jx.dispose(this._messageHook);
        this._messageHook = null;

        this._message = message;

        if (Jx.isObject(this._message)) {
            this._messageHook = new Mail.EventHook(this._message, "changed", this._messageChanged, this);
            this._updateWarning();
            this._host.classList.remove("hidden");
        }
        Mail.writeProfilerMark("ReadingPaneWarning.setMessage", Mail.LogEvent.stop);
    };

    proto._messageChanged = function (evt) {
        ///<param name="evt" type="Event"/>
        Debug.assert(Jx.isObject(evt));
        Debug.assert(Jx.isInstanceOf(this._message, Mail.UIDataModel.MailMessage));

        if (Mail.Validators.hasPropertyChanged(evt, "syncStatus")) {
            this._updateWarning();
        }
    };

    proto._updateWarning = function () {
        Mail.writeProfilerMark("ReadingPaneWarning._updateWarning", Mail.LogEvent.start);
        
        var isJunkFolder = this._message.isJunk,
            isStuckInOutbox = this._message.isStuckInOutbox,
            showWarning = isJunkFolder || isStuckInOutbox,
            warningTitle = this._host.querySelector(".mailReadingPaneWarningTitle"),
            warningMessage = this._host.querySelector(".mailReadingPaneWarningMessage"),
            titleText = "",
            messageText = "";

        Debug.assert(!(isJunkFolder && isStuckInOutbox)); // At most one of these two flags should be True

        if (isJunkFolder) { // Junk mail warning
            titleText = Jx.res.getString("mailReadingPaneJunkTitle");
            messageText = Jx.res.getString("mailReadingPaneJunkMessage");
        } else if (isStuckInOutbox) { // Stuck-in-outbox warning (there is no "messageText")
            var appState = /* @static_cast(Mail.AppState)*/Mail.Globals.appState;
            titleText = Mail.Utilities.getSendErrorString(this._message.syncStatus, appState.selectedAccount);
        }

        if (showWarning){
            warningTitle.innerText = titleText;
            warningMessage.innerText = messageText;
        }

        Jx.setClass(warningTitle, "hidden", !showWarning);
        Jx.setClass(warningMessage, "hidden", !showWarning);

        Mail.writeProfilerMark("ReadingPaneWarning._updateWarning", Mail.LogEvent.stop);
    };

});
