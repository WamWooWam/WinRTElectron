/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/FileTransferNotificationService.js", "/Components/BaseTransferNotificationHandler.js");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI", {FileTransferNotificationHandlers: MS.Entertainment.UI.Framework.derive("MS.Entertainment.UI.BaseFileTransferNotificationHandlers", function FileTransferNotificationHandlersConstructor() {
            MS.Entertainment.UI.BaseFileTransferNotificationHandlers.prototype.constructor.call(this)
        }, {
            _createAlbumNotificationCategory: function _createAlbumNotificationCategory(albumMediaId) {
                return this.Type.AlbumDownloadError + "_" + albumMediaId
            }, _clearDownloadEventInfo: function _clearDownloadEventInfo(eventInfo) {
                    var appNotificationService;
                    MS.Entertainment.UI.BaseFileTransferNotificationHandlers.prototype._clearDownloadEventInfo.apply(this, arguments);
                    if (!MS.Entertainment.Utilities.isEmptyGuid(eventInfo.task.albumMediaId)) {
                        appNotificationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appNotification);
                        appNotificationService.removeNotificationByCategory(this._createAlbumNotificationCategory(eventInfo.task.albumMediaId))
                    }
                }, _setDownloadErrorEventInfo: function _setDownloadErrorEventInfo(eventInfo) {
                    MS.Entertainment.UI.BaseFileTransferNotificationHandlers.prototype._setDownloadErrorEventInfo.apply(this, arguments);
                    if (eventInfo && eventInfo.task && !MS.Entertainment.Utilities.isEmptyGuid(eventInfo.task.albumMediaId) && this.errorPopoverMediaId !== eventInfo.task.albumMediaId && MS.Entertainment.UI.FileTransferService.showErrorNotificationsForTask(eventInfo.task)) {
                        var appNotificationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appNotification);
                        var notification;
                        var title = String.load(String.id.IDS_MUSIC_DOWNLOAD_ERROR);
                        var subTitle = String.load(String.id.IDS_MUSIC_DOWNLOAD_VIEW_ALBUM);
                        var icon = MS.Entertainment.UI.Icon.inlineError;
                        var category = this._createAlbumNotificationCategory(eventInfo.task.albumMediaId);
                        var action;
                        if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.winJSNavigation))
                            action = function navigateToAlbumDetails() {
                                var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                                var actionToExecute = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.albumDetailsNavigate);
                                var hasLibraryId = MS.Entertainment.Utilities.isValidLibraryId(eventInfo.task.albumLibraryId);
                                actionToExecute.parameter = {
                                    data: hasLibraryId ? eventInfo.task.albumLibraryId : eventInfo.task.albumMediaId, location: hasLibraryId ? MS.Entertainment.Data.ItemLocation.collection : MS.Entertainment.Data.ItemLocation.marketplace
                                };
                                actionToExecute.execute()
                            }.bind(this);
                        else
                            action = function showErrorPopover() {
                                var fileTransferNotifications = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransferNotifications);
                                var query = new MS.Entertainment.Data.Query.libraryAlbums;
                                query.albumId = eventInfo.task.albumLibraryId;
                                var sender;
                                var notifications = new MS.Entertainment.UI.ContentNotification.NotificationModification(MS.Entertainment.UI.ContentNotification.listResult(), MS.Entertainment.UI.FileTransferService.keyFromProperty("serviceId", false, true));
                                sender = notifications.createSender();
                                notifications.modifyQuery(query);
                                query.execute().done(function displayPopOver(q) {
                                    if (q.result.totalCount > 0) {
                                        var listenerId = "AlbumDownloadErrorListenerId_" + Math.random();
                                        var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                                        fileTransferService.registerListener(listenerId, MS.Entertainment.UI.FileTransferService.keyFromProperty("albumMediaId", false, true), sender, MS.Entertainment.UI.FileTransferNotifiers.trackCollection);
                                        q.result.items.itemsFromIndex(0).then(function itemsFromIndex_complete(items) {
                                            var item = items.items[0].data;
                                            item.listenerId = listenerId;
                                            var popOverParameters = {itemConstructor: "MS.Entertainment.Pages.MusicAlbumInlineDetails"};
                                            popOverParameters.dataContext = {
                                                data: item, location: MS.Entertainment.Data.ItemLocation.collection
                                            };
                                            this.errorPopoverMediaId = eventInfo.task.albumMediaId;
                                            var onPopoverClosed = function onPopoverClosed() {
                                                    this.errorPopoverMediaId = null
                                                }.bind(this);
                                            MS.Entertainment.UI.Controls.PopOver.showPopOver(popOverParameters).done(onPopoverClosed, onPopoverClosed)
                                        }.bind(this))
                                    }
                                }.bind(this))
                            }.bind(this);
                        notification = new MS.Entertainment.UI.Notification({
                            notificationType: MS.Entertainment.UI.Notification.Type.Critical, title: title, subTitle: subTitle, icon: icon, action: action, category: category, isPersistent: true, dismissOnSignOut: true
                        });
                        appNotificationService.send(notification)
                    }
                }, _downloadNotification: {get: function() {
                        return String.load(String.id.IDS_MUSIC_DOWNLOAD_NOTIFICATION)
                    }}, _downloadInProgressString: {get: function() {
                        return String.id.IDS_MUSIC_DOWNLOAD_PROGRESS_SONGS_PLURAL
                    }}, _downloadComplete: {get: function() {
                        return String.load(String.id.IDS_MUSIC_DOWNLOAD_COMPLETE)
                    }}
        })})
})()
