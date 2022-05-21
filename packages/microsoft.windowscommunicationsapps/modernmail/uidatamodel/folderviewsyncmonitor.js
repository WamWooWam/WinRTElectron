
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug,Microsoft*/

Jx.delayDefine(Mail, "FolderViewSyncMonitor", function () {
    "use strict";

    var Plat = Microsoft.WindowsLive.Platform,
        FolderType = Plat.MailFolderType,
        ViewSyncMonitor = Mail.ViewSyncMonitor,
        SyncStatus = ViewSyncMonitor.SyncStatus;

    var FolderViewSyncMonitor = Mail.FolderViewSyncMonitor = function (view) {
        Debug.assert(Jx.isInstanceOf(view, Mail.UIDataModel.MailView));

        // Initialize before calling the base ctor, it will call _calculateSyncStatus
        var folder = this._folder = view.folder.platformMailFolder;
        ViewSyncMonitor.call(this, view);

        this._disposer.add(new Mail.EventHook(folder, "changed", this._onFolderChange, this));
        Debug.only(Object.seal(this));
    };
    Jx.inherit(FolderViewSyncMonitor, ViewSyncMonitor);
    var prototype = FolderViewSyncMonitor.prototype;

    var innocuousPlatformStatus = [
        0 /* S_OK */,
        -2147483638 /* E_PENDING */,
        Plat.Result.e_NEXUS_SYNC_SYNCKEY
    ];

    prototype._calculateSyncStatus = function () {
        var folder = this._folder,
            hasSyncSucceeded = folder.hasSynced && folder.hasProcessedConversations && folder.syncStatus === 0;

        if (hasSyncSucceeded || this._isLocalMailFolder() || folder.selectionDisabled) {
            return SyncStatus.completed; // we never want to show a spinner for local mail folders or folders
                                         // that can't be synchronized because the server doesn't allow it
        }

        if (Mail.Utilities.ConnectivityMonitor.hasNoInternetConnection()) {
            // This line should happen after the check for succeeded, as when the sync status is
            // succeeded, we want to show it as is regardless of whether we are offline or not
            return SyncStatus.offline;
        }

        if (innocuousPlatformStatus.indexOf(folder.syncStatus) === -1 ||
            SyncStatus.failed === this._getAccountSyncStatus()) {
            return SyncStatus.failed;
        }

        if (this._shouldSyncFolderContents()) {
            return SyncStatus.syncing;
        }
        return SyncStatus.notStarted;
    };

    prototype._getLogString = function () {
        var folder = this._folder;
        return "folder(" +
                   "id:" + folder.objectId + "," +
                   "specialMailFolderType:" + folder.specialMailFolderType + "," +
                   "isLocalMailFolder:" + folder.isLocalMailFolder + "," +
                   "syncFolderContents:" + folder.syncFolderContents + "," +
                   "selectionDisabled:" + folder.selectionDisabled + "," +
                   "hasSynced:" + folder.hasSynced + "," +
                   "hasProcessedConversations:" + folder.hasProcessedConversations + "," +
                   "syncStatus:" + folder.syncStatus +
               ") " + this._getAccountLogString();
    };

    prototype._onFolderChange = function (evt) {
        /// <param name="evt" type="Event" />
        if (Mail.Validators.havePropertiesChanged(evt, ["syncStatus", "hasSynced", "hasProcessedConversations", "syncFolderContents"])) {
            this._queueUpdate();
        }
    };

    prototype.getSyncWindow = function () {
        if (this._isLocalMailFolder()) {
            // Local folders don't have a concept of a sync window, so they will always contain all
            // messages we can know about.
            return Plat.SyncWindowSize.all;
        }
        return ViewSyncMonitor.prototype.getSyncWindow.call(this);
    };

    prototype._isLocalMailFolder = function () {
        // If the folder does not have a sync key, the platform will report it as a local mail folder
        // This can happen to special folders when we create them locally before doing the first folder sync
        // However, the only special folder that is guaranteed to be server-backed is the inbox
        // We should make sure the folder in question is not the inbox
        var folder = this._folder;
        return folder.specialMailFolderType !== FolderType.inbox && folder.isLocalMailFolder;
    };

    prototype._shouldSyncFolderContents = function () {
        // If the initial sync of an account hasn't completed a folder sync yet, the platform
        // will report syncFolderContents is false for all folders, including the inbox. However, we
        // know the inbox will always be synchronized, so make sure we return true when we have the inbox.
        // This is needed to correctly show the progress spinner on initial syncs.
        var folder = this._folder;
        return folder.specialMailFolderType === FolderType.inbox || folder.syncFolderContents;
    };

});
