/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {RemoveOverlay: MS.Entertainment.UI.Framework.defineUserControl("/Controls/AppBar/RemoveOverlay.html#removeOverlayTemplate", function removeOverlayConstructor(element, options) {
            this._inputItems = options.items;
            MS.Entertainment.UI.Controls.assert(this._inputItems, "Need item(s) for deletion in RemoveOverlay!");
            this._inputItems = this._inputItems || []
        }, {
            items: null, collectionFilter: null, deleteLocalFilesOnly: false, removed: false, _inputItems: null, _dialog: null, _okEnabled: true, _cancelEnabled: true, _mediaType: null, _ids: null, initialize: function initialize() {
                    this._waitCursor.isBusy = true;
                    this._setOKEnabled(false);
                    var length = 0;
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    var isCloudCollectionV2Enabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.cloudCollectionV2Enabled);
                    return this._getCount().then(function gotCount(count) {
                            length = count;
                            if (isCloudCollectionV2Enabled)
                                return MS.Entertainment.Data.List.listToArray(this._inputItems, 0, MS.Entertainment.UI.Controls.RemoveOverlay.DELETE_CONFIRMATION_VERIFICATION_LIMIT);
                            else
                                return MS.Entertainment.Data.List.listToArray(this._inputItems, 0, 3)
                        }.bind(this)).then(function copiedItems(arrayMediaItems) {
                            this._waitCursor.isBusy = false;
                            this._setOKEnabled(true);
                            var mediaItem = arrayMediaItems ? arrayMediaItems[0] : null;
                            if (!mediaItem || !mediaItem.isRemovable) {
                                MS.Entertainment.UI.Controls.fail("Item is invalid or has mediaType not supported for deletion.");
                                this._hide()
                            }
                            else if (length === 1)
                                if (!mediaItem.name && mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeason)
                                    this._removeDescription.text = String.load(String.id.IDS_DELETE_DESCRIPTION_LOCAL_SINGLE).format(mediaItem.seriesTitle);
                                else if (mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.track || mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.album)
                                    this._removeDescription.text = mediaItem.inCloudCollectionV2 ? String.load(String.id.IDS_MUSIC_DELETE_DIALOG_BODY_SINGLE_ONEDRIVE).format(mediaItem.name) : String.load(String.id.IDS_MUSIC_DELETE_DIALOG_BODY_SINGLE_LIBRARY).format(mediaItem.name);
                                else
                                    this._removeDescription.text = String.load(String.id.IDS_DELETE_DESCRIPTION_LOCAL_SINGLE).format(mediaItem.name);
                            else if (length !== 0) {
                                var decimalFormatter = new Windows.Globalization.NumberFormatting.DecimalFormatter;
                                decimalFormatter.fractionDigits = 0;
                                var decimalFormattedNumber = decimalFormatter.format(length);
                                var messageId = String.id.IDS_DELETE_DESCRIPTION_LOCAL_PLURAL;
                                var isTrack = (mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.track);
                                if (isTrack || mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.album)
                                    if (isCloudCollectionV2Enabled) {
                                        messageId = isTrack ? String.id.IDS_MUSIC_DELETE_DIALOG_BODY_MULTIPLE_TRACKS_MIXED_PLURAL : String.id.IDS_MUSIC_DELETE_DIALOG_BODY_MULTIPLE_ALBUMS_MIXED_PLURAL;
                                        if (length <= MS.Entertainment.UI.Controls.RemoveOverlay.DELETE_CONFIRMATION_VERIFICATION_LIMIT) {
                                            var mixedContent = false;
                                            for (var i = 1; i < length; i++)
                                                if (arrayMediaItems[i - 1].inCloudCollectionV2 !== arrayMediaItems[i].inCloudCollectionV2) {
                                                    mixedContent = true;
                                                    break
                                                }
                                            if (!mixedContent)
                                                if (mediaItem.inCloudCollectionV2)
                                                    messageId = isTrack ? String.id.IDS_MUSIC_DELETE_DIALOG_BODY_MULTIPLE_TRACKS_ONEDRIVE_PLURAL : String.id.IDS_MUSIC_DELETE_DIALOG_BODY_MULTIPLE_ALBUMS_ONEDRIVE_PLURAL;
                                                else
                                                    messageId = isTrack ? String.id.IDS_MUSIC_DELETE_DIALOG_BODY_MULTIPLE_TRACKS_LIBRARY_PLURAL : String.id.IDS_MUSIC_DELETE_DIALOG_BODY_MULTIPLE_ALBUMS_LIBRARY_PLURAL
                                        }
                                    }
                                    else
                                        messageId = isTrack ? String.id.IDS_MUSIC_DELETE_DIALOG_BODY_MULTIPLE_TRACKS_LIBRARY_PLURAL : String.id.IDS_MUSIC_DELETE_DIALOG_BODY_MULTIPLE_ALBUMS_LIBRARY_PLURAL;
                                this._removeDescription.text = MS.Entertainment.Utilities.Pluralization.getPluralizedString(messageId, length).format(decimalFormattedNumber)
                            }
                            else {
                                MS.Entertainment.UI.Controls.fail("Need item(s) for deletion in RemoveOverlay! List was empty");
                                this._hide()
                            }
                            this._mediaType = mediaItem ? mediaItem.mediaType : null
                        }.bind(this), function copiedFailed() {
                            MS.Entertainment.UI.Controls.fail("Error occured when attempting to get items to delete.");
                            this._waitCursor.isBusy = false;
                            this._hide()
                        }.bind(this))
                }, setOverlay: function setOverlay(overlay) {
                    this._dialog = overlay;
                    this._setOKEnabled(this._okEnabled);
                    this._setCanceledEnabled(this._cancelEnabled)
                }, submit: function submit() {
                    this._setOKEnabled(false);
                    this._setCanceledEnabled(false);
                    this.removed = true;
                    this._waitCursor.isBusy = true;
                    return this._getIds().then(function deleteItems() {
                            return this._deleteItems()
                        }.bind(this))
                }, _hide: function _hide() {
                    if (this._dialog)
                        this._dialog.hide()
                }, _setOKEnabled: function _setOKEnabled(enabled) {
                    if (this._dialog && this._dialog.buttons && (this._dialog.buttons.length > 0))
                        this._dialog.buttons[0].isEnabled = enabled;
                    this._okEnabled = enabled
                }, _setCanceledEnabled: function _setCanceledEnabled(enabled) {
                    if (this._dialog && this._dialog.buttons && (this._dialog.buttons.length > 1))
                        this._dialog.buttons[1].isEnabled = enabled;
                    this._cancelEnabled = enabled
                }, _getCount: function _getCount() {
                    var promise;
                    if (Array.isArray(this._inputItems))
                        promise = this._inputItems.length;
                    else if (MS.Entertainment.Data.List.isList(this._inputItems))
                        promise = this._inputItems.getCount();
                    else if (this._inputItems)
                        promise = 1;
                    else
                        promise = 0;
                    return WinJS.Promise.as(promise)
                }, _clearCurrentMediaIfMatch: function _clearCurrentMediaIfMatch(playbackSession, id) {
                    if (playbackSession) {
                        if (playbackSession.isMediaCurrentlyLoaded(id)) {
                            var removeItemIfMatch = function removeItemIfMatch(item) {
                                    if (item && item.data && item.data.libraryId === id) {
                                        playbackSession.mediaCollection.remove(item.key);
                                        if (MS.Entertainment.Utilities.useModalNowPlaying) {
                                            playbackSession.targetTransportState = MS.Entertainment.Platform.Playback.TransportState.stopped;
                                            var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                                            if (navigationService.currentPage && navigationService.currentPage.iaNode && navigationService.currentPage.iaNode.moniker === "immersiveDetails")
                                                navigationService.navigateBack()
                                        }
                                    }
                                    return WinJS.Promise.wrap()
                                };
                            MS.Entertainment.Platform.Playback.Playlist.PlaylistCore.forEachItemSequentially(playbackSession.mediaCollection, removeItemIfMatch, null, null)
                        }
                        if (MS.Entertainment.Utilities.useModalNowPlaying && playbackSession.lastPlayedMedia && playbackSession.lastPlayedMedia.libraryId === id)
                            playbackSession.setLastPlayedMedia(null)
                    }
                }, _getIds: function _getIds() {
                    var ids = [];
                    var promise = ids;
                    var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    var playbackSession = sessionMgr.primarySession;
                    this._ids = ids;
                    if (Array.isArray(this._inputItems))
                        this._inputItems.forEach(function iteration(item) {
                            if (MS.Entertainment.Utilities.isValidLibraryId(item.libraryId)) {
                                ids.push(item.libraryId);
                                this._clearCurrentMediaIfMatch(playbackSession, item.libraryId)
                            }
                        }, this);
                    else if (MS.Entertainment.Data.List.isList(this._inputItems))
                        promise = this._inputItems.forEachAll(function iteration(args) {
                            if (args.item && args.item.data && MS.Entertainment.Utilities.isValidLibraryId(args.item.data.libraryId)) {
                                ids.push(args.item.data.libraryId);
                                this._clearCurrentMediaIfMatch(playbackSession, args.item.data.libraryId)
                            }
                        }.bind(this)).then(null, function ignoreErrors(){}).then(function returnIds() {
                            return ids
                        });
                    else if (this._inputItems && MS.Entertainment.Utilities.isValidLibraryId(this._inputItems.libraryId)) {
                        ids.push(this._inputItems.libraryId);
                        this._clearCurrentMediaIfMatch(playbackSession, this._inputItems.libraryId)
                    }
                    return WinJS.Promise.as(promise)
                }, _deleteItems: function _deleteItems() {
                    var handleDeleteSuccess = this._handleDeleteSuccess.bind(this);
                    var handleDeleteFailure = this._handleDeleteCompleted.bind(this);
                    if (!this._ids || !this._ids.length || !this._mediaType) {
                        handleDeleteFailure();
                        return WinJS.Promise.wrapError(new Error("Ids are invalid or has mediaType not supported for deletion."))
                    }
                    var mediaStore = new Microsoft.Entertainment.Platform.MediaStore;
                    var mediaProvider = mediaStore.mediaProvider;
                    var playlistProvider = mediaStore.playlistProvider;
                    var mediaAvailability = this.collectionFilter || Microsoft.Entertainment.Platform.MediaAvailability.available;
                    switch (this._mediaType) {
                        case Microsoft.Entertainment.Queries.ObjectType.playlist:
                            return playlistProvider.deletePlaylistAsync(this._ids, mediaAvailability).then(handleDeleteSuccess, handleDeleteFailure);
                        case Microsoft.Entertainment.Queries.ObjectType.album:
                        case Microsoft.Entertainment.Queries.ObjectType.track:
                        case Microsoft.Entertainment.Queries.ObjectType.video:
                            if (this.deleteLocalFilesOnly)
                                return mediaProvider.deleteFilesForMediaAsync(this._mediaType, this._ids, mediaAvailability).then(handleDeleteSuccess, handleDeleteFailure);
                            return mediaProvider.deleteMediaAsync(this._mediaType, this._ids, mediaAvailability).then(handleDeleteSuccess, handleDeleteFailure);
                        default:
                            this._waitCursor.isBusy = true;
                            var deletePromises = [];
                            var ids = [];
                            var mediaType = null;
                            this._ids.forEach(function deleteItem(collectionId) {
                                deletePromises.push(this._getIdsFromQuery(collectionId, this._mediaType).then(function addIds(deleteIds) {
                                    ids = ids.concat(deleteIds.ids);
                                    mediaType = deleteIds.mediaType
                                }))
                            }.bind(this));
                            return WinJS.Promise.join(deletePromises).then(function deleteQueryItems() {
                                    if (ids.length === 0)
                                        return WinJS.Promise.wrapError("No items to delete");
                                    if (this.deleteLocalFilesOnly)
                                        return mediaProvider.deleteFilesForMediaAsync(this._mediaType, this._ids, mediaAvailability).then(handleDeleteSuccess, handleDeleteFailure);
                                    return mediaProvider.deleteMediaAsync(mediaType, ids, mediaAvailability).then(handleDeleteSuccess, handleDeleteFailure)
                                }.bind(this))
                    }
                }, _handleDeleteSuccess: function _handleDeleteSuccess() {
                    return this._clearLibraryIds().then(this._handleDeleteCompleted.bind(this))
                }, _handleDeleteCompleted: function _handleDeleteCompleted() {
                    this._waitCursor.isBusy = false;
                    this._hide()
                }, _clearLibraryId: function _clearLibraryId(item) {
                    if (item && !item.fromCollection && MS.Entertainment.Utilities.isValidLibraryId(item.libraryId))
                        item.libraryId = MS.Entertainment.Utilities.invalidateLibraryId
                }, _clearLibraryIds: function _clearLibraryIds() {
                    var promise;
                    if (Array.isArray(this._inputItems))
                        this._inputItems.forEach(this._clearLibraryId, this);
                    else if (MS.Entertainment.Data.List.isList(this._inputItems))
                        promise = this._inputItems.forEachAll(function iteration(args) {
                            this._clearLibraryId(args.item && args.item.data)
                        }.bind(this)).then(null, function ignoreErrors(error) {
                            MS.Entertainment.UI.Controls.fail("Failed to clear all library ids after delete. Error message: " + error && error.message)
                        });
                    else
                        this._clearLibraryId(this._inputItems);
                    return WinJS.Promise.as(promise)
                }, _getIdsFromQuery: function _getIdsFromQuery(libraryId, mediaType) {
                    var currentId;
                    var ids = [];
                    var childMediaType = null;
                    var itemsPromise = WinJS.Promise.wrap();
                    var queryComplete = function queryComplete(q) {
                            return q.result.items.itemsFromIndex(0).then(function processItems(dataContext) {
                                    for (var x = 0; x < dataContext.items.length; x++) {
                                        currentId = dataContext.items[x].data.libraryId;
                                        if (MS.Entertainment.Utilities.isValidLibraryId(currentId))
                                            ids.push(currentId)
                                    }
                                })
                        };
                    switch (mediaType) {
                        case Microsoft.Entertainment.Queries.ObjectType.album:
                            childMediaType = Microsoft.Entertainment.Queries.ObjectType.track;
                            var tracksQuery = new MS.Entertainment.Data.Query.libraryTracks;
                            tracksQuery.albumId = libraryId;
                            tracksQuery.mediaAvailability = this.collectionFilter;
                            itemsPromise = tracksQuery.execute().then(queryComplete);
                            break;
                        case Microsoft.Entertainment.Queries.ObjectType.tvSeason:
                            childMediaType = Microsoft.Entertainment.Queries.ObjectType.video;
                            var episodeQuery = new MS.Entertainment.Data.Query.libraryVideoTV;
                            episodeQuery.seasonId = libraryId;
                            itemsPromise = episodeQuery.execute().then(queryComplete);
                            break;
                        case Microsoft.Entertainment.Queries.ObjectType.tvSeries:
                            childMediaType = Microsoft.Entertainment.Queries.ObjectType.video;
                            var seriesEpisodesQuery = new MS.Entertainment.Data.Query.libraryVideoTV;
                            seriesEpisodesQuery.seriesId = libraryId;
                            itemsPromise = seriesEpisodesQuery.execute().then(queryComplete);
                            break
                    }
                    return itemsPromise.then(function returnIds() {
                            return {
                                    ids: ids, mediaType: childMediaType
                                }
                        })
                }
        }, {}, {
            _isRemoveOverlayOpen: false, DELETE_CONFIRMATION_VERIFICATION_LIMIT: 25, show: function show(dataSource, collectionFilter, deleteLocalFilesOnly) {
                    if (MS.Entertainment.UI.Controls.RemoveOverlay._isRemoveOverlayOpen)
                        return WinJS.Promise.wrap();
                    MS.Entertainment.UI.Controls.RemoveOverlay._isRemoveOverlayOpen = true;
                    return MS.Entertainment.UI.Shell.showDialog(String.load(String.id.IDS_DELETE_LABEL), "MS.Entertainment.UI.Controls.RemoveOverlay", {
                            userControlOptions: {
                                items: dataSource, collectionFilter: collectionFilter, deleteLocalFilesOnly: deleteLocalFilesOnly
                            }, width: "40%", height: "310px", buttons: [WinJS.Binding.as({
                                        isEnabled: true, title: String.load(String.id.IDS_DELETE_BUTTON), execute: function execute_submit(dialog) {
                                                WinJS.Promise.as(dialog.userControlInstance.submit()).done(null, function(error) {
                                                    MS.Entertainment.UI.Controls.fail("Submit failed in the delete dialog. Error message: " + error && error.message)
                                                })
                                            }
                                    }), WinJS.Binding.as({
                                        isEnabled: true, title: String.load(String.id.IDS_CANCEL_BUTTON_TC), execute: function execute_cancel(dialog) {
                                                dialog.hide()
                                            }
                                    })], defaultButtonIndex: 0, cancelButtonIndex: 1
                        }).then(function onDismiss(overlay) {
                            if (overlay)
                                MS.Entertainment.UI.Controls.RemoveOverlay._isRemoveOverlayOpen = false;
                            return overlay
                        })
                }
        })})
})()
