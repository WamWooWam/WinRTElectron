
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\Jx\Core\Jx.dep.js" />
/// <reference path="%_NTTREE%\drop\published\ModernContactPlatform\Microsoft.WindowsLive.Platform.js" />

Jx.delayDefine(Mail, "OutboxQueueHandlerBase", function () {

    Mail.OutboxQueueHandlerBase = /*@constructor*/ function () { };

    var proto = Mail.OutboxQueueHandlerBase.prototype;

    proto._queueType = null;
    proto._subscribedProperties = /* @static_cast(Array) */ null;
    proto._className = "mailMessageBar";

    proto.checkForError = function (message, account) {
        /// <param name="message" type="Microsoft.WindowsLive.Platform.IMailMessage" />
        /// <param name="account" type="Microsoft.WindowsLive.Platform.IAccount" optional="True" />
        Debug.assert(false, "Not implemented");
    };

    proto.dispose = function () {
        Debug.assert(false, "Not implemented");
    };

    proto.removeAccount = function (accountId) {
        /// <param name="accountId" type="String">Id of the account to remove</param>
        Debug.assert(Jx.isNonEmptyString(accountId));
    };

    proto.removeMessage = function (messageId) {
        /// <param name="messageId" type="String" />
        Debug.assert(Jx.isNonEmptyString(messageId));
    };

    Object.defineProperty(proto, "queueType", {
        get: function () {
            Debug.assert(Jx.isValidNumber(this._queueType));
            return this._queueType;
        },
        enumerable: true
    });

    Object.defineProperty(proto, "subscribedProperties", {
        get: function () {
            Debug.assert(Jx.isArray(this._subscribedProperties));
            Debug.assert(this._subscribedProperties.length > 0);
            return this._subscribedProperties;
        },
        enumerable: true
    });

    proto.init = function (messageBar, messageEntries, platform) {
        /// <param name="messageBar" type="Chat.MessageBar" />
        /// <param name="messages" type="Object" />
        /// <param name="platform" type="Microsoft.WindowsLive.Platform.Client" />
        Debug.assert(Jx.isInstanceOf(messageBar, Chat.MessageBar));
        Debug.assert(Jx.isObject(messageEntries));
        Debug.assert(Jx.isInstanceOf(platform, Microsoft.WindowsLive.Platform.Client));

        this._messageBar = messageBar;
        this._messages = messageEntries;
        this._platform = platform;
    };

    proto._baseDispose = function () {
        this._messageBar = null;
        this._messages = null;
        this._platform = null;
    };

});