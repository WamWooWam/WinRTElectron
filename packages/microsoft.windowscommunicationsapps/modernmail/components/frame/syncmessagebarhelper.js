
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail,Chat,Microsoft,Jx,Debug*/
/*jshint browser:true */

Jx.delayDefine(Mail, "SyncMessageBarHelper", function () {
    "use strict";

    Mail.SyncMessageBarHelper = function () {
        this._syncMessageBarPresenter = new Chat.SyncMessageBarPresenter();
    };

    Mail.SyncMessageBarHelper.prototype.init = function (messageBar, cssClassName) {
        Debug.assert(Jx.isObject(messageBar));
        Debug.assert(Jx.isNonEmptyString(cssClassName));

        // By default, suppress sync status messages.
        this._syncMessageBarPresenter.disableSyncStatus();
        this._syncMessageBarPresenter.init(
            messageBar,
            Mail.Globals.platform,
            Microsoft.WindowsLive.Platform.ApplicationScenario.mail,
            cssClassName,
            {
                checkIsSyncingAll: true,
                showCredError: false, // Do not show cred error for the mail app as the mail account list will be the primary UI to communicate password errors
                showFolderSyncError: true
            }
        );

        this._eventHook = Mail.EventHook.createGlobalHook(Mail.Commands.Events.showNextSyncStatus, this._onManualSync, this);

        Debug.only(Object.seal(this));
    };

    Mail.SyncMessageBarHelper.prototype.dispose = function () {
        this._syncMessageBarPresenter.shutdown();
        this._eventHook.dispose();
    };

    Mail.SyncMessageBarHelper.prototype._onManualSync = function () {
        // The true parameter indicates that the sync status is only
        // un-disabled once. After showing one status, it reverts back to being
        // disabled.
        this._syncMessageBarPresenter.unDisableSyncStatus(true);
    };

});
