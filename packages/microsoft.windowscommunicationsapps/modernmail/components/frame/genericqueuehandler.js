
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail,Jx,Microsoft,Debug*/

Jx.delayDefine(Mail, "GenericQueueHandler", function () {
    "use strict";

    var Plat = Microsoft.WindowsLive.Platform,
        PlatResult = Plat.Result;

    Mail.GenericQueueHandler = function (selection, platform) {
        Debug.assert(Jx.isObject(selection));
        Debug.assert(Jx.isObject(platform));

        this._queueType = Plat.OutboxQueue.sendMail;
        this._subscribedProperties = ["syncStatus"];
        this._pendingErrorMessages = {};

        this._closeClicked = this._closeClicked.bind(this);

        this._selection = selection;
        this._platform = platform;
    };
    Jx.inherit(Mail.GenericQueueHandler, Mail.OutboxQueueHandlerBase);

    var proto = Mail.GenericQueueHandler.prototype;

    proto.checkForError = function (message, account) {
        /// <param name="message" type="Microsoft.WindowsLive.Platform.IMailMessage" />
        /// <param name="account" type="Microsoft.WindowsLive.Platform.IAccount" />
        Debug.assert(Jx.isInstanceOf(message, Microsoft.WindowsLive.Platform.MailMessage));
        Debug.assert(Jx.isInstanceOf(account, Microsoft.WindowsLive.Platform.Account));
        Debug.assert(message.accountId === account.objectId);
        Debug.assert(message.outboxQueue === this._queueType);

        if ((message.syncStatus === PlatResult.success) || Mail.Utilities.ConnectivityMonitor.hasNoInternetConnection()) {
            return; // Don't dispatch any error messages if there are no errors or we are offline
        }

        var accountId = account.objectId,
            pendingMessagesForAccount = this._pendingErrorMessages[accountId];

        this._dispatchErrorMessage(message, account);

        // Keep track of the dispatched error message
        if (pendingMessagesForAccount) {
            Debug.assert(Jx.isArray(pendingMessagesForAccount));
            pendingMessagesForAccount.push(message.objectId);
        } else {
            this._pendingErrorMessages[accountId] = [message.objectId];
        }
    };

    function getErrorMessageId(messageId) {
        /// <param name="messageId" type="String" />
        Debug.assert(Jx.isNonEmptyString(messageId));
        return "mail_genericQueue_" + messageId;
    }

    proto.removeAccount = function (accountId) {
        /// <param name="accountId" type="String">Id of the account to remove</param>
        Debug.assert(Jx.isNonEmptyString(accountId));
        this._removePendingMessages(accountId, false /* skipAnimation */);
    };

    proto.removeMessage = function (messageId) {
        /// <param name="messageId" type="String" />
        Debug.assert(Jx.isNonEmptyString(messageId));
        this._messageBar.removeMessage(getErrorMessageId(messageId));
    };

    proto.dispose = function () {
        this._baseDispose();
        this._pendingErrorMessages = null;
    };

    proto._dispatchErrorMessage = function (message, account) {
        /// <param name="message" type="Microsoft.WindowsLive.Platform.IMailMessage" />
        /// <param name="account" type="Microsoft.WindowsLive.Platform.IAccount" />
        Debug.assert(Jx.isInstanceOf(message, Microsoft.WindowsLive.Platform.MailMessage));
        Debug.assert(Jx.isInstanceOf(account, Microsoft.WindowsLive.Platform.Account));
        Debug.assert(message.accountId === account.objectId);

        var errorMessageId = getErrorMessageId(message.objectId),
            options = {
                messageText: Mail.Utilities.getSendErrorString(message.syncStatus, account),
                button1: { text: Jx.res.getString("mailSendErrorGoToMessage"), callback: this._viewInOutbox.bind(this, message.objectId, account) },
                button2: { text: Jx.res.getString("mailSendErrorClose"),       callback: this._closeClicked },
                cssClass: this._className
            };

        this._messageBar.addErrorMessage(errorMessageId, 2 /* priority */, options); // Dispatch the error message
    };

    proto._removePendingMessages = function (accountId, skipAnimation) {
        /// <param name="accountId" type="String" />
        /// <param name="skipAnimation" type="Boolean" />
        Debug.assert(Jx.isNonEmptyString(accountId));
        Debug.assert(Jx.isBoolean(skipAnimation));

        var pendingMessages = this._pendingErrorMessages[accountId];
        if (pendingMessages) { // Dismiss all error messages for the given account
            Debug.assert(Jx.isArray(pendingMessages));
            this._messageBar.removeMessages(pendingMessages.map(getErrorMessageId), skipAnimation);
            this._pendingErrorMessages[accountId] = null;
        }
    };

    proto._viewInOutbox = function (messageId, account) {
        /// <param name="messageId" type="String" />
        /// <param name="account" type="Microsoft.WindowsLive.Platform.IAccount" />
        Debug.assert(Jx.isNonEmptyString(messageId));
        Debug.assert(Jx.isInstanceOf(account, Microsoft.WindowsLive.Platform.Account));

        var targetAccountId = account.objectId,
            targetMessageId = null,
            messageEntry = this._messages[messageId];
        if (messageEntry) { // If the message still exists, find out what it is
            var message = messageEntry.message;
            Debug.assert(Jx.isInstanceOf(message, Microsoft.WindowsLive.Platform.MailMessage));
            Debug.assert(targetAccountId === message.accountId);
            Debug.assert(messageId === message.objectId);
            targetMessageId = messageId;
        }

        // Remove all pending error messages that are in the same account as the message
        this._removePendingMessages(targetAccountId, true /* skipAnimation */);

        var outboxView = new Mail.Account(account, this._platform).outboxView;
        this._selection.selectMessage(outboxView, targetMessageId);
    };

    proto._closeClicked = function (target, errorMessageId) {
        /// <param name="target" type="HTMLElement" />
        /// <param name="errorMessageId" type="String" />
        Debug.assert(Jx.isHTMLElement(target));
        Debug.assert(Jx.isNonEmptyString(errorMessageId));
        this._messageBar.removeMessage(errorMessageId);
    };

});