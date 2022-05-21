
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

Jx.delayDefine(Mail, "AllPinnedViewSyncMonitor", function () {
    "use strict";

    var ViewSyncMonitor = Mail.ViewSyncMonitor,
        SyncStatus = ViewSyncMonitor.SyncStatus;

    var AllPinnedViewSyncMonitor = Mail.AllPinnedViewSyncMonitor = function (view) {
        Debug.assert(Jx.isInstanceOf(view, Mail.UIDataModel.MailView));

        // Initialize before calling the base ctor: it will call _calculateSyncStatus
        var account = this._account = view.account;
        ViewSyncMonitor.call(this, view);

        this._disposer.add(
            new Mail.EventHook(account, "changed", this._onAccountChange, this)
        );
        Debug.only(Object.seal(this));
    };
    Jx.inherit(AllPinnedViewSyncMonitor, ViewSyncMonitor);
    var prototype = AllPinnedViewSyncMonitor.prototype;

    prototype._onAccountChange = function (ev) {
        if (Mail.Validators.hasPropertyChanged(ev, "peopleViewComplete")) {
            this._queueUpdate();
        }
    };

    prototype._calculateSyncStatus = function () {
        if (this._account.peopleViewComplete) {
            return SyncStatus.completed;
        }

        var syncStatus = this._getAccountSyncStatus();
        if (syncStatus === SyncStatus.completed) {
            // The account may be done, but if peopleViews aren't done, we are still syncing
            return SyncStatus.syncing;
        }
        return syncStatus;
    };

    prototype._getLogString = function () {
        var account = this._account;
        return "account(" +
                   "id:" + account.objectId + "," +
                   "peopleViewComplete:" + account.peopleViewComplete +
               ") " + this._getAccountLogString();
    };

});
