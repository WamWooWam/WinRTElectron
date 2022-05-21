
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true */
/*global Mail,Jx,Debug */

Jx.delayDefine(Mail, "ReadingPaneCalendarNotificationArea", function () {
    "use strict";

    var Area = Mail.ReadingPaneCalendarNotificationArea = function (rootId) {
        Debug.assert(Jx.isNonEmptyString(rootId));
        this._rootId = rootId;
        this._message = null;

        Debug.only(Object.seal(this));
    };

    Area.prototype = {
        dispose: function () {
        },
        setMessage: function (message) {
            Debug.assert((message === null) || Jx.isInstanceOf(message, Mail.UIDataModel.MailMessage));
            this._message = message;
            if (this._message) {
                this.update();
            }
        },
        _showElement: function () {
            document.getElementById(this._rootId).querySelector(".mailReadingPaneCalendarNotification").classList.remove("hidden");
        },
        update: function () {
            Debug.Mail.log("ReadingPaneCalendarNotificationArea.update", Mail.LogEvent.start);
            var message = this._message;
            Debug.assert(Jx.isInstanceOf(message, Mail.UIDataModel.MailMessage));

            // if this is a calendar invite but we don't have an event, show our "go
            // to web" notification.  this will happen after migration, where old
            // emails don't have the required information to show our real ui.
            var calendarType = message.calendarMessageType,
                CalendarType = Microsoft.WindowsLive.Platform.CalendarMessageType;

            if (calendarType === CalendarType.request || calendarType === CalendarType.cancelled) {
                if (!message.calendarEvent && !message.isOutboundFolder) {
                    this._showElement();
                }
            }

            Debug.Mail.log("ReadingPaneCalendarNotificationArea.update", Mail.LogEvent.stop);
        }
    };
});

