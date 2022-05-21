
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

Jx.delayDefine(Mail, "ViewSyncMonitor", function () {
    "use strict";

    var Plat = Microsoft.WindowsLive.Platform;

    var ViewSyncMonitor = Mail.ViewSyncMonitor = function (view) {
        Debug.assert(Jx.isInstanceOf(view, Mail.UIDataModel.MailView));
        _markStart("ctor");

        this.initEvents();

        var account = view.account;
        var resource = this._resource = account.mailResource;

        this._disposer = new Mail.Disposer(
            new Mail.EventHook(resource, "changed", this._resourceChanged, this),
            new Mail.EventHook(Mail.EventHook.getGlobalRootSource(), Mail.Utilities.ConnectivityMonitor.Events.connectivityChanged, this._onNetworkStatusChanged, this)
        );
        this._syncStatus = SyncStatus.notStarted;
        this._updateJob = null;
        this._update();

        _markStop("ctor");
    };
    Jx.augment(ViewSyncMonitor, Jx.Events);
    var prototype = ViewSyncMonitor.prototype;
    Debug.Events.define(prototype, "syncStatusChanged", "syncWindowChanged");

    ViewSyncMonitor.create = function (view) {
        if (view.type === Plat.MailViewType.allPinnedPeople) {
            // The AllPeople view has special treatment, as it relies on relevance aggregation to complete
            return new Mail.AllPinnedViewSyncMonitor(view);
        }
        if (view.folder) {
            // Folders have a specific sync state on them, in addition to the sync state on the account
            return new Mail.FolderViewSyncMonitor(view);
        }
        // Other views will piggy-back the inbox sync.
        return new Mail.FolderViewSyncMonitor(view.account.inboxView);
    };

    var SyncStatus = ViewSyncMonitor.SyncStatus = {
        notStarted: 0,
        syncing: 1,
        failed: 2,
        completed: 3,
        offline: 4
    };

    prototype.dispose = function () {
        Jx.dispose(this._disposer);
    };

    Object.defineProperty(prototype, "isSyncCompleted", { get: function () {
        var syncStatus = this._syncStatus;
        return syncStatus === SyncStatus.completed || syncStatus === SyncStatus.offline || syncStatus === SyncStatus.failed;
    }, enumerable: true });

    prototype._onNetworkStatusChanged = function () {
        this._queueUpdate();
    };

    prototype._resourceChanged = function (evt) {
        if (Mail.Validators.havePropertiesChanged(evt, ["isSynchronizing", "lastSyncResult"])) {
            this._queueUpdate();
        } else if (Mail.Validators.hasPropertyChanged(evt, "syncWindowSize")) {
            this.raiseEvent("syncWindowChanged");
        }
    };

    prototype._queueUpdate = function () {
        this._updateJob = this._disposer.replace(
            this._updateJob,
            Jx.scheduler.addJob(null, Mail.Priority.updateSyncStatus, "update sync status", this._update, this)
        );
    };

    prototype._update = function () {
        _markStart("update");
        var newStatus = this._calculateSyncStatus(),
            oldStatus = this._syncStatus;
        Jx.log.info("Sync status " + oldStatus + "->" + newStatus + " " + this._getLogString());
        if (newStatus !== oldStatus) {
            this._syncStatus = newStatus;
            this.raiseEvent("syncStatusChanged");
        }
        _markStop("update");
    };

    prototype._getLogString = prototype._getAccountLogString = function () {
        var resource = this._resource;
        return "mailResource(" +
                   "id:" + resource.objectId + "," +
                   "synchronizing:" + resource.isSynchronizing + "," +
                   "lastSyncResult:" + resource.lastSyncResult +
               ")";
    };

    prototype.getSyncStatus = function () {
        return this._syncStatus;
    };

    prototype.getSyncWindow = function () {
        return this._resource.syncWindowSize;
    };

    prototype._calculateSyncStatus = prototype._getAccountSyncStatus = function () {
        var syncStatus,
            lastSyncResult = this._resource.lastSyncResult;
        if (this._resource.isSynchronizing) {
            syncStatus = SyncStatus.syncing;
        } else if (lastSyncResult === 0) {
            syncStatus = SyncStatus.completed;
        } else if (Mail.Utilities.ConnectivityMonitor.hasNoInternetConnection()) {
            syncStatus = SyncStatus.offline;
        } else if (lastSyncResult === Plat.Result.authNotAttempted) {
            syncStatus = SyncStatus.notStarted;
        } else {
            syncStatus = SyncStatus.failed;
        }
        return syncStatus;
    };

    function _markStart(str) { Jx.mark("Mail.ViewSyncMonitor." + str + ",StartTA,Mail"); }
    function _markStop(str) { Jx.mark("Mail.ViewSyncMonitor." + str + ",StopTA,Mail"); }

});
