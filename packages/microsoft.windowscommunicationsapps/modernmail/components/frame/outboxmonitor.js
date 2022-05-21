
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*jshint browser:true */
/*global Mail,Jx,Debug,Chat,Microsoft */

Jx.delayDefine(Mail, "OutboxMonitor", function () {
    "use strict";

    Mail.OutboxMonitor = function () {
        /// <summary>Returns a OutboxMonitor object for handling outbox queue states.</summary>
        this._accountsChanged = this._accountsChanged.bind(this);
        this._messageChangedListener = this._messageChangedListener.bind(this);

        this._platform = null;
        this._messageBar = null;
        this._accounts = null;
        this._outboxCollections = null;
        this._messages = null;
        this._queueHandler =  null;
    };

    var proto = Mail.OutboxMonitor.prototype,
        Plat = Microsoft.WindowsLive.Platform;

    proto.init = function (messageBar, platform, handler) {
        /// <summary>
        ///    Initialize OutboxMonitor object using the specified platform.
        ///    OutboxMonitor object will register for outbox queue and starts listening to state changes in queue.
        /// </summary>
        /// <param name="messageBar" type="Chat.MessageBar">Message bar control to be used for displaying notifications.</param>
        /// <param name="platform" type="Microsoft.WindowsLive.Platform.Client">The platform to use for listening to outbox queues.</param>
        /// <param name="handler" type="Mail.OutboxQueueHandlerBase">An Mail.OutboxQueueHandlerBase object.</param>
        Debug.assert(Jx.isInstanceOf(messageBar, Chat.MessageBar));
        Debug.assert(Jx.isInstanceOf(platform, Microsoft.WindowsLive.Platform.Client));
        Debug.assert(Jx.isInstanceOf(handler, Mail.OutboxQueueHandlerBase));

        this._messages = {};
        this._platform = platform;
        this._messageBar = messageBar;
        this._queueHandler = handler;
        handler.init(this._messageBar, this._messages, this._platform);

        this._initializeListeners();

        Jx.log.info("Mail.OutboxMonitor - Init complete");
    };

    proto.dispose = function () {
        /// <summary>Shutdown OutboxMonitor object and unregister all listeners.</summary>

        // Sometimes we will be shutting down because the platform has crashed. In such cases
        // trying to call platform here will throw exception, so just eat those and log them for debug.
        try {
            this._removeAllListeners();
        } catch (e) {
            Jx.log.exception("Mail.OutboxMonitor - Exception during shutdown", e);
        }

        // Dispose of the queue handler
        if (this._queueHandler) {
            this._queueHandler.dispose();
        }
        this._queueHandler = null;

        this._messages = null;
        this._messageBar = null;
        this._platform = null;

        Jx.log.info("Mail.OutboxMonitor - Shutdown complete");
    };

    proto._initializeListeners = function () {
        Debug.assert(!this._outboxCollections);
        Debug.assert(Object.keys(this._messages).length === 0);
        Debug.assert(!this._accounts);

        this._outboxCollections = {};
        this._accounts = this._platform.accountManager.getConnectedAccountsByScenario(
            Plat.ApplicationScenario.mail, Plat.ConnectedFilter.normal, Plat.AccountSort.name
        );
        this._accounts.addEventListener("collectionchanged", this._accountsChanged);
        for (var i = 0, len = this._accounts.count; i < len; i++) {
            // Add each account for listening to its outbox
            this._addAccount(this._accounts.item(i));
        }
        this._accounts.unlock();
    };

    proto._removeAllListeners = function () {
        if (this._accounts) {
            this._accounts.removeEventListener("collectionchanged", this._accountsChanged);
            this._accounts.dispose();
            this._accounts = null;

            // Stop listening to messages
            Object.keys(this._messages).forEach(function (key) { this._removeMessage(key); }, this);
            Debug.assert(Object.keys(this._messages).length === 0);

            // Stop listening to accounts
            Object.keys(this._outboxCollections).forEach(function (key) { this._removeAccount(key); }, this);
            this._outboxCollections = null;
        }
    };

    proto._accountsChanged = function (ev) {
        /// <summary>Listener for accounts collection changed event.</summary>
        /// <param name="ev" type="Microsoft.WindowsLive.Platform.CollectionChangedEventArgs">Event arguments</param>
        Debug.assert(Jx.isInstanceOf(ev, Microsoft.WindowsLive.Platform.CollectionChangedEventArgs));

        var ChangeType = Plat.CollectionChangeType,
            type = ev.eType;

        if (type === ChangeType.itemRemoved) {
            this._removeAccount(ev.objectId);
        } else if (type === ChangeType.itemAdded) {
            // A new account is added, start listening to its outbox collection
            this._addAccount(this._accounts.item(ev.index));
        } else if (type === ChangeType.reset) {
            this._removeAllListeners();
            this._initializeListeners();
        }
    };

    proto._addAccount = function (account) {
        /// <summary>Add an account for listening to its outbox collection.</summary>
        /// <param name="account" type="Microsoft.WindowsLive.Platform.IAccount">Account object to add</param>
        Debug.assert(Jx.isInstanceOf(account, Microsoft.WindowsLive.Platform.Account));

        var accountId = account.objectId;

        Debug.assert(!this._outboxCollections[accountId], "Why are we seeing an existing account being added?");

        var outboxFolderView = this._platform.mailManager.ensureMailView(Plat.MailViewType.outbox, accountId, "");
        if (!outboxFolderView) { // The account may not actually exist, so there could be no Outbox view
            return;
        }

        var outboxCollection = outboxFolderView.getMessages(Plat.FilterCriteria.all),
            outboxCollectionListener = this._getOutboxListener(accountId);

        // Start listening to outgoing mails on this account
        outboxCollection.addEventListener("collectionchanged", outboxCollectionListener);
        this._outboxCollections[accountId] = {
            account: account,
            collection: outboxCollection,
            listener: outboxCollectionListener
        };

        // Add any existing messages in outbox and start watching them
        this._addOutboxCollection(outboxCollection, account);
        outboxCollection.unlock();

        Jx.log.info("Mail.OutboxMonitor - Added account " + accountId + " for listening to outbox errors");
    };

    proto._addOutboxCollection = function (outboxCollection, account) {
        /// <summary>Adds message from the specified outbox collection.</summary>
        /// <param name="outboxCollection" type="Microsoft.WindowsLive.Platform.ICollection">Collection of messages in outbox.</param>
        /// <param name="account" type="Microsoft.WindowsLive.Platform.IAccount">Account associated with this outbox.</param>
        Debug.assert(Jx.isInstanceOf(outboxCollection, Microsoft.WindowsLive.Platform.Collection));
        Debug.assert(Jx.isInstanceOf(account, Microsoft.WindowsLive.Platform.Account));

        // Add any existing messages in outbox and start watching them
        for (var i = 0, len = outboxCollection.count; i < len; i++) {
            var message = outboxCollection.item(i);
            this._addMessage(message, account);

            // Check for any existing errors on this message
            this._checkMessageForError(message, account);
        }
    };

    proto._addMessage = function (messageObject, account) {
        /// <summary>Adds the specified message for listening to changes.</summary>
        /// <param name="messageObject" type="Microsoft.WindowsLive.Platform.IMailMessage">Message object to add.</param>
        /// <param name="account" type="Microsoft.WindowsLive.Platform.IAccount">Account associated with this message.</param>
        Debug.assert(Jx.isInstanceOf(messageObject, Microsoft.WindowsLive.Platform.MailMessage));
        Debug.assert(Jx.isInstanceOf(account, Microsoft.WindowsLive.Platform.Account));

        var messageId = messageObject.objectId;
        Debug.assert(!this._messages[messageId]);

        this._messages[messageId] = {
            message: messageObject,
            account: account
        };

        messageObject.addEventListener("changed", this._messageChangedListener);
        Jx.log.info("Mail.OutboxMonitor - Added message " + messageId + " for listening to errors");
    };

    proto._checkMessageForError = function (message, account) {
        /// <param name="message" type="Microsoft.WindowsLive.Platform.IMailMessage" />
        /// <param name="account" type="Microsoft.WindowsLive.Platform.IAccount">Account associated with this message.</param>
        Debug.assert(Jx.isInstanceOf(message, Microsoft.WindowsLive.Platform.MailMessage));
        Debug.assert(Jx.isInstanceOf(account, Microsoft.WindowsLive.Platform.Account));

        if (message.isInSpecialFolderType(Plat.MailFolderType.outbox)) {
            var handler = this._queueHandler;
            Debug.assert(Jx.isInstanceOf(handler, Mail.OutboxQueueHandlerBase));
            Debug.assert(handler.queueType === message.outboxQueue);
            handler.checkForError(message, account);
        }
    };

    proto._getOutboxListener = function (accountId) {
        /// <summary>Gets a listener for listening to the specified account.</summary>
        /// <param name="accountId" type="String">Account to remove</param>
        Debug.assert(Jx.isNonEmptyString(accountId));

        return function outboxListener(ev) {
            /// <summary>Listener for outbox collection changed event.</summary>
            /// <param name="ev" type="Microsoft.WindowsLive.Platform.CollectionChangedEventArgs">Event arguments</param>
            Debug.assert(Jx.isObject(ev));
            Debug.assert(Jx.isValidNumber(ev.eType));

            var ChangeType = Plat.CollectionChangeType,
                outboxEntry = this._outboxCollections[accountId];
            Debug.assert(outboxEntry);

            var collection = outboxEntry.collection,
                account = outboxEntry.account,
                type = ev.eType;
            if (type === ChangeType.itemRemoved) {
                this._removeMessage(ev.objectId);
            } else if (type === ChangeType.itemAdded) {
                this._addMessage(collection.item(ev.index), account);
            } else if (type === ChangeType.reset) {
                // If we received a reset notification, then we need to rescan all messages
                // in this collection as that is the only way to know what changed.
                collection.lock();

                // Stop listening to old messages in this collection
                Object.keys(this._messages).forEach(function (key) { this._removeMessage(key); }, this);

                // Now rescan and add all
                this._addOutboxCollection(collection, account);

                collection.unlock();
            }
        }.bind(this);
    };

    proto._messageChangedListener = function (ev) {
        /// <summary>Listener for outbox collection changed event.</summary>
        /// <param name="ev" type="Event">Event arguments</param>
        Debug.assert(Jx.isObject(ev));
        Debug.assert(Jx.isInstanceOf(ev.target, Microsoft.WindowsLive.Platform.MailMessage));

        var message = ev.target,
            handler = this._queueHandler;
        if (Jx.isObject(handler) && Mail.Validators.havePropertiesChanged(ev, handler.subscribedProperties)) {
            this._checkMessageForError(message, this._messages[message.objectId].account);
        }
    };

    proto._removeAccount = function (accountId) {
        /// <summary>Removes an account and stop listening to its outbox.</summary>
        /// <param name="accountId" type="String">Id of the account to remove</param>
        Debug.assert(Jx.isNonEmptyString(accountId));

        var entry = this._outboxCollections[accountId];
        if (!entry) {
            return;
        }

        var collection = entry.collection;
        Debug.assert(Jx.isInstanceOf(collection, Microsoft.WindowsLive.Platform.Collection));

        collection.removeEventListener("collectionchanged", entry.listener);
        collection.dispose();

        this._outboxCollections[accountId] = null;
        delete this._outboxCollections[accountId];

        // Stop watching the messages associated with the account
        for (var messageId in this._messages) {
            if (this._messages[messageId].account.objectId === accountId) {
                this._removeMessage(messageId);
            }
        }

        this._queueHandler.removeAccount(accountId);
    };

    proto._removeMessage = function (messageId) {
        /// <summary>Removes the specified message from the list of messages for listening to changes.</summary>
        /// <param name="messageId" type="String">Id of the message object to remove.</param>
        Debug.assert(Jx.isNonEmptyString(messageId));

        var entry = this._messages[messageId];
        if (entry) {
            var message = entry.message;
            message.removeEventListener("changed", this._messageChangedListener);
            this._messages[messageId] = null;
            delete this._messages[messageId];

            this._queueHandler.removeMessage(messageId);
        }
    };

});
