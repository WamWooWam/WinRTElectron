/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Framework/corefx.js", "/Framework/debug.js", "/Framework/utilities.js");
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {TvEpisodeDownloadStatus: MS.Entertainment.UI.Framework.defineUserControl(null, function TvEpisodeDownloadStatus(element){}, {
            controlName: "TvEpisodeDownloadStatus", allowAnimations: false, preventHideDuringInitialize: true, _hasNotificationMessage: false, _isLocallyPlayable: false, _canStream: false, _status: String.empty, _statusContainerDomElement: null, _ariaLabel: String.empty, _ariaLabelContainerDomElement: null, _alternateTextContainerDomElement: null, _visible: false, _bindings: null, _fileTransferListenerId: null, sendNotification: null, _attachedLibraryId: -1, _attachedServiceId: MS.Entertainment.Utilities.EMPTY_GUID, _attachedActivationFilePath: String.empty, _delayInitialized: function _delayInitialized() {
                    this._fileTransferListenerId = "TvEpisodeDownloadStatus_" + MS.Entertainment.Utilities.getSessionUniqueInteger();
                    this._statusContainerDomElement = this.domElement.querySelector(".mediaStatusIconContainer");
                    MS.Entertainment.UI.Controls.assert(this._statusContainerDomElement, "MediaStatusIcon control is missing required child element of class 'mediaStatusIconContainer'.");
                    this._alternateTextContainerDomElement = this.domElement.querySelector(".mediaStatusAlternateTextContainer");
                    this._ariaLabelContainerDomElement = this.domElement.querySelector(".mediaStatusAriaLabelContainer");
                    MS.Entertainment.UI.Controls.assert(this._ariaLabelContainerDomElement, "MediaStatusIcon control is missing required child element of class 'mediaStatusAriaLabelContainer'.");
                    this._handleMediaChange = this._handleMediaChange.bind(this);
                    this.sendNotification = this._fileTransferNotification.bind(this);
                    this._updateCanPlayLocally = this._updateCanPlayLocally.bind(this);
                    this._bindings = WinJS.Binding.bind(this, {mediaInstance: {
                            serviceId: this._handleMediaChange, libraryId: this._handleMediaChange, activationFilePath: this._handleMediaChange
                        }})
                }, unload: function unload() {
                    if (this._bindings) {
                        this._bindings.cancel();
                        this._bindings = null;
                        var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                        fileTransferService.unregisterListener(this._fileTransferListenerId)
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, _fileTransferNotification: function sendNotification(notification, notificationType, notificationMessage) {
                    if (notificationMessage && notificationMessage.shortText && !this._isLocallyPlayable) {
                        this._hasNotificationMessage = true;
                        this._updateState(notificationMessage.shortText)
                    }
                    if (!notificationMessage) {
                        this._updateCanPlayLocally();
                        this._hasNotificationMessage = false
                    }
                }, _handleMediaChange: function _handleMediaChange(newMediaId, oldMediaId) {
                    if (this.mediaInstance) {
                        var fileTransferService = MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.fileTransfer) && MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                        if (this._isValidMediaId(oldMediaId) && (this._attachedServiceId === oldMediaId || this._attachedLibraryId === oldMediaId)) {
                            fileTransferNotifications.unregisterListener(this._fileTransferListenerId);
                            this._detachedMediaId(oldMediaId)
                        }
                        if (!this._unloaded && fileTransferService) {
                            if (this._isValidMediaId(newMediaId)) {
                                fileTransferService.registerListener(this._fileTransferListenerId, function getTaskKey(task) {
                                    return (task.libraryTypeId === Microsoft.Entertainment.Queries.ObjectType.video && task.libraryId === this.mediaInstance.libraryId) ? task.libraryId : null
                                }.bind(this), this, MS.Entertainment.UI.FileTransferNotifiers.episodeListItem);
                                MS.Entertainment.UI.FileTransferService.pulseAsync(this.mediaInstance)
                            }
                            this._updateCanPlayLocally();
                            this._updateCanStream()
                        }
                    }
                }, _updateCanStream: function _updateCanStream() {
                    if (this.mediaInstance)
                        MS.Entertainment.ViewModels.SmartBuyStateEngine.queryMediaStateAsync(this.mediaInstance).then(function checkCanStream(stateInfo) {
                            this._canStream = WinJS.Utilities.getMember("marketplace.canStream", stateInfo);
                            this._updateState()
                        }.bind(this))
                }, _updateCanPlayLocally: function updateCanPlayLocally() {
                    if (this.mediaInstance && this.mediaInstance.inCollection) {
                        var mediaStore = new Microsoft.Entertainment.Platform.MediaStore;
                        mediaStore.videoProvider.getPlayabilityByLibraryIdAsync(this.mediaInstance.libraryId).then(function getCanPlayLocally(nativePlayability) {
                            this._isLocallyPlayable = nativePlayability.locallyPlayable;
                            this._updateState()
                        }.bind(this))
                    }
                    else {
                        this._isLocallyPlayable = this.mediaInstance && this.mediaInstance.inCollection;
                        this._updateState()
                    }
                }, _updateState: function _updateState(statusMessage, ariaMessage) {
                    var statusLabel = statusMessage || String.empty;
                    var ariaLabel = ariaMessage || String.empty;
                    var alternateLabel = String.empty;
                    var hasStreamingIcon = false;
                    var forceStatusLabelUpdate = false;
                    if (this._unloaded)
                        return;
                    if (this._isLocallyPlayable)
                        statusLabel = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOADED);
                    else if (this.mediaInstance && (this._canStream || this.mediaInstance.inCollection) && !this._hasNotificationMessage) {
                        statusLabel = MS.Entertainment.UI.Icon.inlineStreaming;
                        hasStreamingIcon = true;
                        ariaLabel = String.load(String.id.IDS_MEDIA_STATUS_INLINE_STREAMING_ICON);
                        alternateLabel = this.alternateText
                    }
                    else if (this.mediaInstance.libraryId === -1) {
                        alternateLabel = this.alternateText;
                        forceStatusLabelUpdate = true
                    }
                    if (statusLabel || forceStatusLabelUpdate) {
                        if (this._status !== statusLabel) {
                            this._status = statusLabel;
                            this._statusContainerDomElement.textContent = statusLabel;
                            if (hasStreamingIcon) {
                                WinJS.Utilities.addClass(this._statusContainerDomElement, "icon");
                                WinJS.Utilities.removeClass(this._statusContainerDomElement, "text-metadata")
                            }
                            else {
                                WinJS.Utilities.removeClass(this._statusContainerDomElement, "icon");
                                WinJS.Utilities.addClass(this._statusContainerDomElement, "text-metadata")
                            }
                        }
                        if (this._ariaLabel !== ariaLabel)
                            this._ariaLabelContainerDomElement.textContent = ariaLabel
                    }
                    if (this._alternateTextContainerDomElement)
                        this._alternateTextContainerDomElement.textContent = alternateLabel
                }, _attachedMediaId: function _attachedMediaId(mediaId) {
                    if (typeof mediaId === "number")
                        this._attachedLibraryId = mediaId;
                    else if (typeof mediaId === "string")
                        this._attachedServiceId = mediaId;
                    else
                        MS.Entertainment.UI.Controls.Music.fail("Attached unknown mediaId type")
                }, _detachedMediaId: function _detachedMediaId(mediaId) {
                    if (typeof mediaId === "number")
                        this._attachedLibraryId = -1;
                    else if (typeof mediaId === "string")
                        if (this._isFilePath(mediaId))
                            this._attachedActivationFilePath = String.empty;
                        else
                            this._attachedServiceId = MS.Entertainment.Utilities.EMPTY_GUID;
                    else
                        MS.Entertainment.UI.Controls.fail("Detached unknown mediaId type")
                }, _isValidMediaId: function _isValidMediaId(mediaId) {
                    return ((typeof mediaId === "number" && mediaId >= 0) || (typeof mediaId === "string" && !MS.Entertainment.Utilities.isEmptyGuid(mediaId)))
                }
        }, {
            mediaInstance: null, alternateText: null
        })})
})()
