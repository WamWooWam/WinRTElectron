/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/FileTransferNotificationService.js");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI", {BaseFileTransferNotificationHandlers: MS.Entertainment.UI.Framework.define(function BaseFileTransferNotificationHandlersConstructor() {
            this.errorPopoverMediaId = null;
            this.currentDownloads = {};
            this.trackDownloads = 0;
            this.currentPaused = {};
            this.trackPaused = 0;
            this.downloadErrorsEncountered = false;
            this.updateTimer = null;
            this.preventMoreDownloadPausedNotification = false
        }, {
            trackDownloadUpdate: function trackDownloadUpdate(eventInfo) {
                MS.Entertainment.UI.assert(!MS.Entertainment.Utilities.isEmptyGuid(eventInfo.task.mediaId) || eventInfo.task.libraryId > 0, "task object had an invalid identifiers: mediaId: {0}, libraryId {1}".format(eventInfo.task.mediaId, eventInfo.task.libraryId));
                var mediaIdentifier = this._getMediaIdentifierFromTask(eventInfo.task);
                var itemIsDownloading = false;
                var fileTransferNotifications = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransferNotifications);
                switch (eventInfo.task.taskStatus) {
                    case Microsoft.Entertainment.FileTransferStatus.error:
                    case Microsoft.Entertainment.FileTransferStatus.canceled:
                    case Microsoft.Entertainment.FileTransferStatus.completed:
                        if (this.currentDownloads[mediaIdentifier]) {
                            delete this.currentDownloads[mediaIdentifier];
                            this.trackDownloads--
                        }
                        if (this.currentPaused[mediaIdentifier]) {
                            delete this.currentPaused[mediaIdentifier];
                            this.trackPaused--
                        }
                        itemIsDownloading = false;
                        break;
                    case Microsoft.Entertainment.FileTransferStatus.paused:
                    case Microsoft.Entertainment.FileTransferStatus.pausedCostedNetwork:
                    case Microsoft.Entertainment.FileTransferStatus.pausedNoNetwork:
                        if (this.currentDownloads[mediaIdentifier]) {
                            delete this.currentDownloads[mediaIdentifier];
                            this.trackDownloads--
                        }
                        if (!this.currentPaused[mediaIdentifier]) {
                            this.currentPaused[mediaIdentifier] = true;
                            this.trackPaused++
                        }
                        itemIsDownloading = true;
                        break;
                    case Microsoft.Entertainment.FileTransferStatus.running:
                        if (this.trackDownloads === 0)
                            this.downloadErrorsEncountered = false;
                        if (!this.currentDownloads[mediaIdentifier]) {
                            this.currentDownloads[mediaIdentifier] = true;
                            this.trackDownloads++
                        }
                        itemIsDownloading = true;
                        break
                }
                fileTransferNotifications.setItemError(mediaIdentifier, 0);
                fileTransferNotifications.setItemTransferState(mediaIdentifier, MS.Entertainment.UI.FileTransferNotificationService.Event.download, itemIsDownloading);
                this._startNotificationTimer()
            }, trackDownloadError: function trackDownloadError(eventInfo) {
                    MS.Entertainment.UI.assert(!MS.Entertainment.Utilities.isEmptyGuid(eventInfo.task.mediaId) || eventInfo.task.libraryId > 0, "task object had an invalid identifiers: mediaId: {0}, libraryId {1}".format(eventInfo.task.mediaId, eventInfo.task.libraryId));
                    this.downloadErrorsEncountered = true;
                    this._setDownloadErrorEventInfo(eventInfo);
                    if (eventInfo.task.isClosed)
                        this._clearDownloadEventInfo(eventInfo)
                }, startTransferListener: function startTransferListener() {
                    var trackDownloadNotifiers = {
                            add: this.trackDownloadUpdate.bind(this), cancel: this.trackDownloadUpdate.bind(this), complete: this.trackDownloadUpdate.bind(this), update: this.trackDownloadUpdate.bind(this), error: this.trackDownloadError.bind(this)
                        };
                    var trackTaskKeyGetter = MS.Entertainment.UI.FileTransferService.keyFromProperty("mediaId", false, true);
                    var handler = {
                            notifier: trackDownloadNotifiers, taskKeyGetter: trackTaskKeyGetter
                        };
                    var fileTransferNotifications = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransferNotifications);
                    fileTransferNotifications.startListening(handler)
                }, _clearDownloadEventInfo: function _clearDownloadEventInfo(eventInfo) {
                    var fileTransferNotifications = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransferNotifications);
                    var appNotificationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appNotification);
                    if (!MS.Entertainment.Utilities.isEmptyGuid(eventInfo.task.mediaId)) {
                        fileTransferNotifications.setItemTransferState(eventInfo.task.mediaId, MS.Entertainment.UI.FileTransferNotificationService.Event.download, false);
                        fileTransferNotifications.setItemError(eventInfo.task.mediaId, 0)
                    }
                    if (eventInfo.task.libraryId >= 0) {
                        fileTransferNotifications.setItemTransferState(eventInfo.task.libraryId, MS.Entertainment.UI.FileTransferNotificationService.Event.download, false);
                        fileTransferNotifications.setItemError(eventInfo.task.libraryId, 0)
                    }
                }, _setDownloadErrorEventInfo: function _setDownloadErrorEventInfo(eventInfo) {
                    var fileTransferNotifications = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransferNotifications);
                    var mediaIdentifier = this._getMediaIdentifierFromTask(eventInfo.task);
                    fileTransferNotifications.setItemTransferState(mediaIdentifier, MS.Entertainment.UI.FileTransferNotificationService.Event.download, false);
                    fileTransferNotifications.setItemError(mediaIdentifier, eventInfo.task.responseCode);
                    var startNotificationTimer = false;
                    if (this.currentPaused[mediaIdentifier]) {
                        delete this.currentPaused[mediaIdentifier];
                        this.trackPaused--;
                        startNotificationTimer = true
                    }
                    if (this.currentDownloads[mediaIdentifier]) {
                        delete this.currentDownloads[mediaIdentifier];
                        this.trackDownloads--;
                        startNotificationTimer = true
                    }
                    if (startNotificationTimer)
                        this._startNotificationTimer()
                }, _getMediaIdentifierFromTask: function _getMediaIdentifierFromTask(transferTask) {
                    return !MS.Entertainment.Utilities.isEmptyGuid(transferTask.mediaId) ? transferTask.mediaId : transferTask.libraryId
                }, _startNotificationTimer: function _startNotificationTimer() {
                    if (!this.updateTimer)
                        this.updateTimer = WinJS.Promise.timeout(1000).then(function updateTrackNotifications() {
                            this._updateTrackDownloadNotification();
                            this.updateTimer = null
                        }.bind(this))
                }, _updateTrackDownloadNotification: function _updateTrackDownloadNotification() {
                    var appNotificationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appNotification);
                    var removeNotification = false;
                    var notification;
                    var notificationType = MS.Entertainment.UI.Notification.Type.Informational;
                    var title = String.empty;
                    var subTitle = String.empty;
                    var icon = WinJS.UI.AppBarIcon.download;
                    var category = this.Type.TrackDownloadInformational;
                    var isPersistent = false;
                    var skipNotification = false;
                    var clickAction = (MS.Entertainment.Utilities.isVideoApp1 ? MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.showVideoDownloadManager) : null);
                    var currentDownloads = this.trackDownloads;
                    var currentPaused = this.trackPaused;
                    if (currentDownloads > 0) {
                        var numberFormatter = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber;
                        var formattedCount = numberFormatter.format(currentDownloads);
                        title = this._downloadNotification;
                        subTitle = MS.Entertainment.Utilities.Pluralization.getPluralizedString(this._downloadInProgressString, currentDownloads).format(formattedCount);
                        isPersistent = true;
                        this.preventMoreDownloadPausedNotification = false
                    }
                    else if (currentPaused > 0)
                        if (this.preventMoreDownloadPausedNotification)
                            skipNotification = true;
                        else {
                            title = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOAD_PAUSED_GLOBAL_SHORT);
                            this.preventMoreDownloadPausedNotification = true
                        }
                    else {
                        title = this._downloadComplete;
                        removeNotification = this.downloadErrorsEncountered;
                        this.downloadErrorsEncountered = false;
                        this.preventMoreDownloadPausedNotification = false;
                        if (MS.Entertainment.UI.CollectionChangeNotifierService) {
                            MS.Entertainment.UI.CollectionChangeNotifierService.blockGlobalCollectionChangeEvents = false;
                            MS.Entertainment.UI.CollectionChangeNotifierService.blockGlobalCollectionUpSyncEvents = false
                        }
                    }
                    if (!skipNotification) {
                        notification = new MS.Entertainment.UI.Notification({
                            notificationType: notificationType, title: title, subTitle: subTitle, icon: icon, category: category, isPersistent: isPersistent, action: clickAction, dismissOnSignOut: true
                        });
                        if (!removeNotification)
                            appNotificationService.send(notification);
                        else
                            appNotificationService.removeNotificationByCategory(notification.category)
                    }
                }, Type: {
                    TrackDownloadInformational: "TrackDownloadInformational", AlbumDownloadError: "AlbumDownloadError"
                }
        })})
})()
