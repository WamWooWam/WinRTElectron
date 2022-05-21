
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail,Jx,Debug,Microsoft*/
/*jshint browser:true*/

Jx.delayDefine(Mail, "Selection", function () {
    "use strict";

    var Selection = Mail.Selection = function (platform, appState) {
        this._platform = platform;
        this._appState = appState;

        this._account = appState.getStartupAccount();
        this._view = appState.getStartupView();
        this._message = appState.lastSelectedMessage;
        this._messages = appState.selectedMessages || [];

        // Tracked for commands on the current selection that affect keepInView
        this._query = null;
        this._filter = Filter.all;

        this._pendingNav = 0;

        this._logChange("initial", null, null, null);
    };

    var prototype = Selection.prototype = {
        get account() { return this._account; },
        get view() { return this._view; },
        get message() { return this._message; },
        get messages() { return this._messages; },

        // This is only used to rehydrate selection in the message list. Ideally platform
        // collections would expose a method to efficiently go from objectId -> index.
        get messageIndex() { return this._appState.lastSelectedMessageIndex; },
    };

    Jx.augment(Selection, Jx.Events);
    Debug.Events.define(prototype, "navChanged", "messagesChanged", "deleteItemsStart");

    prototype.dispose = function () {
        this._cancelPendingNav();
    };

    prototype.selectMessage = function (view, messageId) {
        var message = view.loadMessage(messageId);
        if (message) {
            this.updateNav(view.account, view, message);
            this.updateMessages(message, -1, [message], false);
        }
    };

    prototype.clearMessageSelection = function () {
        _markStart("clearMessageSelection");
        this.updateMessages(null, -1, []);
        _markStop("clearMessageSelection");
    };

    prototype.updateMessages = function (displayed, index, messages, keyboard) {
        // Called by the message list to update selection or establish initial selection
        this._logChange("messages", null, null, displayed);

        var messageChanged = !Mail.Validators.areEqual(displayed, this._message),
            ev = {
                target: this,
                // when moving from being a draft to not we consider this a message changing event so the StandardReadingPane can flip modes
                messageChanged: messageChanged || (displayed && this._message && displayed.isDraft !== this._message.isDraft),
                keyboard: keyboard || false
            };

        this._message = displayed;
        this._messages = messages;
        this._appState.setSelectedMessages(displayed, index, messages);

        this.raiseEvent("messagesChanged", ev);
    };

    prototype.updateNav = function (account, /*optional*/view, /*optional*/message) {
        // Called when the account or view may be changing with optional message
        // to select in that view once complete. Under some scenarios neither view nor
        // account may change e.g. clicking an already selected view. We still want
        // to fire the navigation event so that the message list can update to the
        // default message in the view.
        Debug.assert(Jx.isInstanceOf(account, Mail.Account));
        this._cancelPendingNav();
        this._logChange("navigation", account, view, message);

        // Make sure we have the default view if we weren't provided one
        view = view || account.inboxView;
        Debug.assert(view.accountId === view.account.objectId);

        var ev = {
            target: this,
            accountChanged: !Mail.Validators.areEqual(account, this._account),
            viewChanged: !Mail.Validators.areEqual(view, this._view),
            desiredMessage: message
        };

        this._account = account;
        this._view = view;

        this._appState.setSelectedView(view);

        this.raiseEvent("navChanged", ev);
    };

    prototype.updateNavAsync = function (account, /*optional*/view, /*optional*/message) {
        this._cancelPendingNav();
        this._logChange("async navigation queued", account, view, message);
        this._pendingNav = window.requestAnimationFrame(this._completePendingNav.bind(this, account, view, message));
    };

    prototype._completePendingNav = function (account, view, message) {
        Jx.mark("Selection async navigation completed");
        this._pendingNav = 0;
        this.updateNav(account, view, message);
    };

    prototype._cancelPendingNav = function () {
        if (this._pendingNav) {
            Jx.mark("Selection async navigation cancelled");
            window.cancelAnimationFrame(this._pendingNav);
            this._pendingNav = 0;
        }
    };

    function log(type, obj) { return type + ":" + (obj ? (obj.objectId || "") : ""); }
    function logAll(ver, account, view, message) {
        return ver + " = { " + log("account", account) + " " + log("view", view) + " " + log("message", message) + " } ";
    }

    prototype._logChange = function (reason, account, view, message) {
        Jx.mark("Selection " + reason + " " + logAll("old", this._account, this._view, this._message) + logAll("new", account, view, message));
    };


    // Below are the methods that support operations/commands on some aspect of the current
    // selection. Effectively this enables move, delete, flag and mark read from numerous
    // places in the UI. The set of message items to operate on is optional. Things like the
    // on-item commands, drag/drop and the reading pane do this. Other places like keyboard
    // shortcuts and app bar commands forgo this and get the default message list selection.

    var Plat = Microsoft.WindowsLive.Platform,
        ViewType = Plat.MailViewType,
        Filter = Plat.FilterCriteria,
        ChangeOp = Plat.MailMessageChangeOperation;

    prototype.registerQuery = function (query, filter) {
        // Certain batch operations require knowledge of the source query from the
        // message list - keep in view, marking all messages or emptying a view.
        this._query = query;
        this._filter = filter;
    };

    prototype.clearQuery = function () {
        this._query = null;
        this._filter = Filter.all;
    };

    prototype.moveItemsTo = function (target, items) {
        Debug.assert(Jx.isInstanceOf(target, Mail.UIDataModel.MailView));
        this._batchMove(this._view.objectId, target.objectId, items);
    };

    prototype.moveItemsFrom = function (source, target, items) {
        Debug.assert(Jx.isInstanceOf(source, Mail.UIDataModel.MailView));
        Debug.assert(Jx.isInstanceOf(target, Mail.UIDataModel.MailView));
        this._batchMove(source.objectId, target.objectId, items);
    };

    prototype.deleteItems = function (items) {
        this.raiseEvent("deleteItemsStart");
        switch (this._view.type) {
        case ViewType.deletedItems:
        case ViewType.junkMail:
        case ViewType.draft:
        case ViewType.outbox:
            this._batchDelete(items);
            break;
        default:
            this.moveItemsTo(this.account.deletedView, items);
            break;
        }
    };

    prototype.junkItems = function (items) {
        // Fallback to deleted items if this account doesn't have a junk folder
        var account = this.account;
        this.moveItemsTo(account.junkView || account.deletedView, items);
    };

    prototype.emptyView = function () {
        // Emptying a view requires a registered query from the message list.
        Debug.assert(Jx.isObject(this._query));
        this.deleteItems(this._query);
    };

    prototype.setFlagState = function (flagState, items) {
        this._batchChange(flagState ? ChangeOp.flag : ChangeOp.unflag, items);
    };

    prototype.setReadState = function (readState, items) {
        this._batchChange(readState ? ChangeOp.markAsRead : ChangeOp.markAsUnread, items);
    };

    prototype.markViewRead = function () {
        // Marking all as read requires a registered query from the message list.
        Debug.assert(Jx.isObject(this._query));
        this._batchChange(ChangeOp.markAsRead, this._query);
    };

    prototype._batchChange = function (operation, items) {
        var batch = this._getBatch(items);
        if (batch.length > 0) {
            // Figure out if we're in a view that requires us to provide the source
            // collection so that changing items doesn't cause them to disappear.
            var query = this._query, keepInView = null;
            if (query && Mail.ViewCapabilities.isFiltered(this._view, this._filter)) {
                keepInView = query.keepInView();
            }

            try {
                this._platform.mailManager.batchChange(keepInView, this._view.objectId, operation, batch);
            } catch (e) {
                Jx.log.exception("batchChange(" + operation + ")", e);
            }
        }
    };

    prototype._batchMove = function (source, target, items) {
        var batch = this._getBatch(items);
        if (batch.length > 0) {
            try {
                this._platform.mailManager.batchMove(source, target, batch);
            } catch (e) {
                Jx.log.exception("batchMove(" + source + ", " + target + ")", e);
            }
        }
    };

    prototype._batchDelete = function (items) {
        var batch = this._getBatch(items);
        if (batch.length > 0) {
            try {
                this._platform.mailManager.batchDelete(batch);
            } catch (e) {
                Jx.log.exception("batchDelete(" + this._view.objectId + ")", e);
            }
        }
    };

    prototype._getBatch = function (items) {
        items = items || this._messages;
        return items.map(function (item) {
            Debug.assert(Jx.isNonEmptyString(item.objectId));
            return item.objectId;
        });
    };

    function _markStart(s) { Jx.mark("Mail.Selection." + s + ",StartTA,Mail,Selection"); }
    function _markStop(s) { Jx.mark("Mail.Selection." + s + ",StopTA,Mail,Selection"); }
});


