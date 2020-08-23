/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/FileTransferNotificationService.js");
scriptValidator("/Components/BaseTransferNotificationHandler.js");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI", {FileTransferNotificationHandlers: MS.Entertainment.UI.Framework.derive("MS.Entertainment.UI.BaseFileTransferNotificationHandlers", function FileTransferNotificationHandlersConstructor() {
            MS.Entertainment.UI.BaseFileTransferNotificationHandlers.prototype.constructor.call(this);
            this.currentError = {};
            this.trackErrors = 0
        }, {
            _downloadInProgressString: {get: function() {
                    return String.id.IDS_VIDEO_DOWNLOAD_PROGRESS_ITEMS_PLURAL
                }}, _downloadNotification: {get: function() {
                        return String.load(String.id.IDS_VIDEO_DOWNLOAD_NOTIFICATION)
                    }}, _downloadComplete: {get: function() {
                        return String.load(String.id.IDS_VIDEO_DOWNLOAD_COMPLETE)
                    }}, trackDownloadUpdate: function trackDownloadUpdate(eventInfo) {
                    MS.Entertainment.UI.assert(!MS.Entertainment.Utilities.isEmptyGuid(eventInfo.task.mediaId) || eventInfo.task.libraryId > 0, "task object had an invalid identifiers: mediaId: {0}, libraryId {1}".format(eventInfo.task.mediaId, eventInfo.task.libraryId));
                    var mediaIdentifier = this._getMediaIdentifierFromTask(eventInfo.task);
                    var itemIsDownloading = false;
                    var fileTransferNotifications = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransferNotifications);
                    switch (eventInfo.task.taskStatus) {
                        case Microsoft.Entertainment.FileTransferStatus.error:
                            if (this.currentDownloads[mediaIdentifier]) {
                                delete this.currentDownloads[mediaIdentifier];
                                this.trackDownloads--
                            }
                            if (this.currentPaused[mediaIdentifier]) {
                                delete this.currentPaused[mediaIdentifier];
                                this.trackPaused--
                            }
                            if (eventInfo.task.isClosed && this.currentError[mediaIdentifier]) {
                                delete this.currentError[mediaIdentifier];
                                this.trackErrors--
                            }
                            else if (!eventInfo.task.isClosed && !this.currentError[mediaIdentifier]) {
                                this.currentError[mediaIdentifier] = true;
                                this.trackErrors++
                            }
                            itemIsDownloading = false;
                            break;
                        case Microsoft.Entertainment.FileTransferStatus.canceled:
                        case Microsoft.Entertainment.FileTransferStatus.completed:
                            if (this.currentDownloads[mediaIdentifier]) {
                                delete this.currentDownloads[mediaIdentifier];
                                this.trackDownloads--
                            }
                            if (this.currentError[mediaIdentifier]) {
                                delete this.currentError[mediaIdentifier];
                                this.trackErrors--
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
                            if (this.currentError[mediaIdentifier]) {
                                delete this.currentError[mediaIdentifier];
                                this.trackErrors--
                            }
                            if (!this.currentPaused[mediaIdentifier]) {
                                this.currentPaused[mediaIdentifier] = true;
                                this.trackPaused++
                            }
                            itemIsDownloading = true;
                            break;
                        case Microsoft.Entertainment.FileTransferStatus.running:
                            if (this.currentError[mediaIdentifier]) {
                                delete this.currentError[mediaIdentifier];
                                this.trackErrors--
                            }
                            if (this.currentPaused[mediaIdentifier]) {
                                delete this.currentPaused[mediaIdentifier];
                                this.trackPaused--
                            }
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
                }, _updateTrackDownloadNotification: function _updateTrackDownloadNotification() {
                    var appNotificationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appNotification);
                    var notification;
                    var notificationType = MS.Entertainment.UI.Notification.Type.Informational;
                    var title = String.Empty;
                    var subTitle = String.Empty;
                    var subTitleCaret = false;
                    var icon = WinJS.UI.AppBarIcon.download;
                    var category = this.Type.TrackDownloadInformational;
                    var isPersistent = false;
                    var clickAction = (MS.Entertainment.Utilities.isVideoApp1 ? MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.showVideoDownloadManager) : null);
                    var currentDownloads = this.trackDownloads;
                    var currentPaused = this.trackPaused;
                    var currentErrors = this.trackErrors;
                    if (currentDownloads > 0) {
                        var numberFormatter = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber;
                        var formattedCount = numberFormatter.format(currentDownloads);
                        title = this._downloadNotification;
                        subTitle = MS.Entertainment.Utilities.Pluralization.getPluralizedString(this._downloadInProgressString, currentDownloads).format(formattedCount);
                        isPersistent = true
                    }
                    else if (currentPaused > 0) {
                        title = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOAD_PAUSED_GLOBAL_SHORT);
                        subTitle = String.load(String.id.IDS_VIDEO_DOWNLOAD_MORE_INFO);
                        isPersistent = true
                    }
                    else if (currentErrors > 0) {
                        title = String.load(String.id.IDS_VIDEO_DOWNLOAD_ERROR);
                        subTitle = String.load(String.id.IDS_VIDEO_DOWNLOAD_MORE_INFO);
                        isPersistent = true
                    }
                    else
                        title = this._downloadComplete;
                    subTitleCaret = (MS.Entertainment.Utilities.isVideoApp1 && subTitle && clickAction);
                    notification = new MS.Entertainment.UI.Notification({
                        notificationType: notificationType, title: title, subTitle: subTitle, subTitleCaret: subTitleCaret, icon: icon, category: category, isPersistent: isPersistent, action: clickAction
                    });
                    appNotificationService.send(notification)
                }, trackDownloadError: function trackDownloadError(eventInfo) {
                    this.trackDownloadUpdate(eventInfo)
                }
        })})
})()
