
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx, Mail, self, Debug, Microsoft */
/*jshint browser:true*/

Jx.delayDefine(Mail.UIDataModel, "MailConversation", function () {
    "use strict";

    /// <disable>JS2076</disable>
    var UIDataModel = self.Mail.UIDataModel;
    /// <enable>JS2076</enable>

    var MailConversation = UIDataModel.MailConversation = /* @constructor*/function (platformConversation) {
        /// <param name="platformConversation" type="Microsoft.WindowsLive.Platform.IMailConversation" />
        Debug.assert(Jx.isInstanceOf(platformConversation, Microsoft.WindowsLive.Platform.MailConversation));

        this._platformConversation = platformConversation;
        this._initMailItem(/* @static_cast(Microsoft.WindowsLive.Platform.IObject) */ this._platformConversation);
    };
    Jx.inherit(MailConversation, UIDataModel.MailItem);

    var prototype = MailConversation.prototype;

    prototype.getChildMessageCollection = function () {
        Mail.log("GetConversationMessages", Mail.LogEvent.start);
        var messages = this._platformConversation.getChildMessages();
        Mail.log("GetConversationMessages", Mail.LogEvent.stop);
        return messages;
    };

    Object.defineProperty(prototype, "fromRecipientString", { get: function () {
        return this._getHeaderRecipientStringHelper("calculatedUIName", this.fromRecipientArray);
    }, enumerable: true });

    Object.defineProperty(prototype, "toRecipientString", { get: function () {
        return this._getHeaderRecipientStringHelper("calculatedUIName", this.to);
    }, enumerable: true });

    Object.defineProperty(prototype, "canFlag", { get: function () { return true; }, enumerable: true });
    Object.defineProperty(prototype, "canMove", { get: function () { return true; }, enumerable: true });
    Object.defineProperty(prototype, "canMarkRead", { get: function () { return true; }, enumerable: true });
    Object.defineProperty(prototype, "isLocalMessage", { get: function () { return true; }, enumerable: true });

    Object.defineProperty(prototype, "isOutboundFolder", { get: function () {
        return this._platformConversation.hasOnlyDraftOrSent;
    }, enumerable: true });

    Object.defineProperty(prototype, "hasOnlyDraftOrSent", { get: function () {
        return this._platformConversation.hasOnlyDraftOrSent;
    }, enumerable: true });

    Object.defineProperty(prototype, "read", { get: function () {
        return this._platformConversation.read;
    }, enumerable: true });

    Object.defineProperty(prototype, "flagged", { get: function () {
        return this._platformConversation.flagged;
    }, enumerable: true });

    Object.defineProperty(prototype, "bestDate", { get: function () {
        return this._platformConversation.latestReceivedTime;
    }, enumerable: true });

    Object.defineProperty(prototype, "totalCount", { get: function () {
        return this._platformConversation.totalCount;
    }, enumerable: true });

    Object.defineProperty(prototype, "calendarInvite", { get: function () {
        return this._platformConversation.hasCalendarInvite;
    }, enumerable: true });

    Object.defineProperty(prototype, "calendarRequest", { get: function () {
        return this._platformConversation.hasCalendarRequest;
    }, enumerable: true });

    Object.defineProperty(prototype, "isDraft", { get: function () {
        return this._platformConversation.hasOnlyDraftOrSent && this._platformConversation.hasDraft;
    }, enumerable: true });

    Object.defineProperty(prototype, "hasDraft", { get: function () {
        return this._platformConversation.hasDraft;
    }, enumerable: true });

    Object.defineProperty(prototype, "preview", { get: function () { return ""; }, enumerable: true });
    Object.defineProperty(prototype, "folderName", { get: function () { return ""; }, enumerable: true });

});
