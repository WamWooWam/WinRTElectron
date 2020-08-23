/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Framework/corefx.js", "/Framework/debug.js", "/Framework/utilities.js");
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {VideoDownloadItem: MS.Entertainment.UI.Framework.defineUserControl("/Controls/Video/VideoDownloadItem.html#videoDownloadItemTemplate", function videoDownloadItem(element) {
            this.smartBuyStateEngine = null
        }, {
            controlName: "VideoDownloadItem", sendNotification: null, _isLocallyPlayable: false, _downloadSize: null, _bindings: null, _fileTransferListenerId: null, initialize: function initialize() {
                    if (this.isDelayInitialized && this._imageControl && !this._imageControl._enabled && this._imageControl.supportsDelayInitialization)
                        this._imageControl.delayInitialize()
                }, _delayInitialized: function _delayInitialized() {
                    this._fileTransferListenerId = "VideoDownloadItemStatus_" + MS.Entertainment.Utilities.getSessionUniqueInteger();
                    this._handleMediaChange = this._handleMediaChange.bind(this);
                    this.sendNotification = this._fileTransferNotification.bind(this);
                    this._updateCanPlayLocally = this._updateCanPlayLocally.bind(this);
                    this._bindings = WinJS.Binding.bind(this, {mediaItem: {
                            serviceId: this._handleMediaChange, libraryId: this._handleMediaChange, activationFilePath: this._handleMediaChange
                        }});
                    WinJS.Promise.timeout().then(function() {
                        if (!this.smartBuyStateEngine)
                            return;
                        this.smartBuyStateEngine.initialize(this.mediaItem, MS.Entertainment.ViewModels.SmartBuyButtons.getVideoDownloadItemButtons(this.mediaItem, MS.Entertainment.UI.Actions.ExecutionLocation.invokeInline), MS.Entertainment.ViewModels.VideoSmartBuyStateEngine.prototype.onVideoDownloadItemStateChanged)
                    }.bind(this))
                }, unload: function unload() {
                    if (this._bindings) {
                        this._bindings.cancel();
                        this._bindings = null
                    }
                    if (this._fileTransferListenerId) {
                        var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                        fileTransferService.unregisterListener(this._fileTransferListenerId)
                    }
                    if (this.smartBuyStateEngine) {
                        this.smartBuyStateEngine.unload();
                        this.smartBuyStateEngine = null
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, _fileTransferNotification: function sendNotification(notification, notificationType, notificationMessage) {
                    if (!this._downloadSize && notificationMessage && notificationMessage.task)
                        this._updateDownloadSize(notificationMessage.task.totalBytesToReceive);
                    if (notificationMessage && notificationMessage.shortText && !this._isLocallyPlayable)
                        this._updateState(notificationMessage.shortText);
                    if (notificationMessage && notificationMessage.task && !isNaN(notificationMessage.task.percentage))
                        this._updateProgressBar(notificationMessage.task.percentage);
                    if (!notificationMessage)
                        this._updateCanPlayLocally()
                }, _handleMediaChange: function handleMediaChange(newMediaId, oldMediaId) {
                    if (this.mediaItem) {
                        var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                        if (!this._unloaded && this._isValidMediaId(newMediaId)) {
                            fileTransferService.registerListener(this._fileTransferListenerId, function getTaskKey(task) {
                                return (task.libraryTypeId === Microsoft.Entertainment.Queries.ObjectType.video && task.libraryId === this.mediaItem.libraryId) ? task.libraryId : null
                            }.bind(this), this, MS.Entertainment.UI.FileTransferNotifiers.videoDownloadItem);
                            MS.Entertainment.UI.FileTransferService.pulseAsync(this.mediaItem);
                            if (!this.smartBuyStateEngine)
                                this.smartBuyStateEngine = new MS.Entertainment.ViewModels.VideoSmartBuyStateEngine;
                            if (!this._downloadSize && this.mediaItem && this.mediaItem.downloadTask)
                                this._updateDownloadSize(this.mediaItem.downloadTask.totalBytesToReceive);
                            this._updateDescription();
                            this._updateCanPlayLocally()
                        }
                    }
                }, _updateCanPlayLocally: function updateCanPlayLocally() {
                    if (this.mediaItem && this.mediaItem.libraryId !== 0) {
                        var mediaStore = new Microsoft.Entertainment.Platform.MediaStore;
                        mediaStore.videoProvider.getPlayabilityByLibraryIdAsync(this.mediaItem.libraryId).then(function getCanPlayLocally(nativePlayability) {
                            this._isLocallyPlayable = nativePlayability.locallyPlayable;
                            this._updateState()
                        }.bind(this))
                    }
                }, _updateProgressBar: function updateProgressBar(percentDownloaded) {
                    if (!percentDownloaded)
                        return;
                    this.downloadProgress = Math.round(percentDownloaded * 100)
                }, _updateState: function updateState(statusMessage) {
                    var statusLabel = statusMessage || String.empty;
                    if (this._unloaded)
                        return;
                    if (this._isLocallyPlayable)
                        statusLabel = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOADED);
                    if (statusLabel)
                        this.statusText = statusLabel
                }, _updateDownloadSize: function updateDownloadSize(totalBytes) {
                    var downloadSize = String.empty;
                    if (isNaN(totalBytes) || totalBytes <= 0)
                        return;
                    var kilobytes = (totalBytes / 1024);
                    var megabytes = (kilobytes / 1024);
                    if (megabytes < 1000) {
                        megabytes = Math.round(megabytes);
                        this._downloadSize = String.load(String.id.IDS_VIDEO_DOWNLOAD_MANAGER_MB_SIZE).format(megabytes)
                    }
                    else {
                        var gigabytes = (megabytes / 1024);
                        gigabytes = gigabytes.toFixed(1);
                        this._downloadSize = String.load(String.id.IDS_VIDEO_DOWNLOAD_MANAGER_GB_SIZE).format(gigabytes)
                    }
                    this._updateDescription()
                }, _updateDescription: function updateDescription() {
                    var description = String.empty;
                    if (this.mediaItem) {
                        switch (this.mediaItem.videoType) {
                            case Microsoft.Entertainment.Queries.VideoType.movie:
                                if (this.mediaItem.genreName)
                                    description = this.mediaItem.genreName;
                                if (this.mediaItem.releaseDate) {
                                    var dateFormat = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).year;
                                    var year = dateFormat.format(this.mediaItem.releaseDate);
                                    if (description.length > 0)
                                        description = String.load(String.id.IDS_COMMA_SEPARATOR).format(description, year);
                                    else
                                        description = year
                                }
                                break;
                            case Microsoft.Entertainment.Queries.VideoType.tvEpisode:
                                var seasonEpisodeNumber = MS.Entertainment.Formatters.formatTVSeasonEpisodeNumberInt(this.mediaItem);
                                if (seasonEpisodeNumber)
                                    if (description.length > 0)
                                        description = String.load(String.id.IDS_COMMA_SEPARATOR).format(description, seasonEpisodeNumber);
                                    else
                                        description = seasonEpisodeNumber;
                                break;
                            default:
                                throw new Error("videoType not recognized for VideoDownloadItem control!");
                                break
                        }
                        if (this._downloadSize)
                            if (description.length > 0)
                                description = String.load(String.id.IDS_COMMA_SEPARATOR).format(description, this._downloadSize);
                            else
                                description = this._downloadSize
                    }
                    this.descriptionText = description
                }, _isValidMediaId: function isValidMediaId(mediaId) {
                    return ((typeof mediaId === "number" && mediaId >= 0) || (typeof mediaId === "string" && !MS.Entertainment.Utilities.isEmptyGuid(mediaId)))
                }
        }, {
            mediaItem: null, smartBuyStateEngine: null, titleText: "", descriptionText: "", statusText: "", errorText: "", downloadProgress: 0
        })})
})()
