/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function(undefined) {
    "use strict";
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Pages");
    WinJS.Namespace.define("MS.Entertainment.Pages", {
        MusicArtistInlineDetails: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.Pages.BaseMediaInlineDetails", "Components/InlineDetails/MusicArtistInlineDetails.html#musicArtistInlineDetailsTemplate", function musicArtistInlineDetails(element, options){}, {
            tracks: null, albums: null, _songCount: -1, _albumIndex: -1, _queryResults: null, _queryDisposer: null, _buttonEventHandlers: null, _initializingLists: false, _initializedLists: false, _notificationsSender: null, _detailBindings: null, _disableActionsOnListSelection: true, _enableCurrentButtonsBinding: true, _signedInUser: null, _signInBindings: null, isCollection: {get: function() {
                        return this.originalLocation === MS.Entertainment.Data.ItemLocation.collection
                    }}, initialize: function initialize() {
                    MS.Entertainment.Pages.BaseMediaInlineDetails.prototype.initialize.apply(this, arguments);
                    this.domElement.addEventListener("galleryFirstPageRendered", function galleryFirstPageRendered() {
                        MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioPopoverRequestToLoad("artist")
                    });
                    this._buttonEventHandlers = MS.Entertainment.Utilities.addEvents(this.domElement, {iconButtonClicked: function processIconButtonClicked(event) {
                            var id = event && event.id;
                            if (id === MS.Entertainment.UI.Actions.AddTo.subMenuIds.addToMyMusic || id === MS.Entertainment.UI.Actions.ActionIdentifiers.subscriptionAddToMyMusic) {
                                MS.Entertainment.ViewModels.MediaItemModel.hydrateLibraryInfoAsync(this.media);
                                MS.Entertainment.ViewModels.MediaItemModel.hydrateListLibraryInfoAsync(this.media && this.media.tracks)
                            }
                            event.stopPropagation()
                        }.bind(this)});
                    if (this.media.mediaType !== Microsoft.Entertainment.Queries.ObjectType.person && this.media.artist)
                        this.media = this.media.artist;
                    this.media = MS.Entertainment.ViewModels.MediaItemModel.augment(this.media);
                    this._showPanel(true);
                    this.showListLoadingControl();
                    this._queryDisposer = new MS.Entertainment.Data.Disposer
                }, _shouldShowErrorPanel: function _shouldShowErrorPanel() {
                    return this.media && !this.media.fromCollection && !this.blockErrorPanel && !this.isFailed
                }, _onPrimaryItemInvoked: function _onPrimaryItemInvoked(event) {
                    if (!event || !event.detail || !event.detail.itemPromise)
                        return;
                    event.detail.itemPromise.done(function gotItem(item) {
                        if (!item || !item.data) {
                            MS.Entertainment.Pages.fail("In valid arugments. The item or item.data was null");
                            return
                        }
                        if (!item.isHeader) {
                            this._albumIndex = item.index;
                            this._setMedia(item.data)
                        }
                        else
                            this._albumIndex = -1
                    }.bind(this), function handleError(error) {
                        MS.Entertainment.Pages.fail("Failed to get primary item data in artist popover. Error: " + (error && error.message))
                    })
                }, _onSecondaryItemInvoked: function _onSecondaryItemInvoked(event) {
                    if (!event || !event.detail || !event.detail.itemPromise)
                        return;
                    event.detail.itemPromise.then(function getItemData(data) {
                        if (data.data && data.data.mediaType === Microsoft.Entertainment.Queries.ObjectType.track && !data.data.rights) {
                            MS.Entertainment.ViewModels.MediaItemModel.augment(data.data);
                            data.data.hydrate()
                        }
                    }.bind(this), function handleError(error) {
                        MS.Entertainment.Pages.fail("Failed to get secondary item data in artist popover. Error: " + (error && error.message))
                    });
                    event.stopPropagation()
                }, _onBackButtonClicked: function _onBackButtonClicked() {
                    this._setMedia(this.artist)
                }, _onClearedFilters: function _onClearedFilters() {
                    this.albums = null;
                    this._queryDisposer.disposeOnly("albumsQuery");
                    this._queryDisposer.disposeOnly("tracksQuery");
                    this._setMedia(this.media)
                }, _setupSmartBuy: function _setupSmartBuy(media) {
                    if (this.smartBuyStateEngine) {
                        var buttons;
                        var stateUpdateHandler;
                        var isAlbum = media && media.mediaType === Microsoft.Entertainment.Queries.ObjectType.album;
                        if (isAlbum) {
                            stateUpdateHandler = MS.Entertainment.ViewModels.MusicStateHandlers.onAlbumPopoverStateChanged;
                            buttons = MS.Entertainment.ViewModels.SmartBuyButtons.getAlbumInlineDetailsButtons(media, MS.Entertainment.UI.Actions.ExecutionLocation.popover)
                        }
                        else {
                            buttons = MS.Entertainment.ViewModels.SmartBuyButtons.getArtistInlineDetailsButtons(media, MS.Entertainment.UI.Actions.ExecutionLocation.popover);
                            stateUpdateHandler = !this.isCollection ? function onMarketplaceArtistDetailsChanged(stateInfo) {
                                return MS.Entertainment.ViewModels.MusicStateHandlers.onMarketplaceArtistPopoverStateChanged.apply(this.smartBuyStateEngine, [stateInfo, this.tracks])
                            }.bind(this) : MS.Entertainment.ViewModels.MusicStateHandlers.onLocalArtistPopoverStateChanged
                        }
                        this.smartBuyStateEngine.initialize(media, buttons, stateUpdateHandler)
                    }
                }, unload: function unload() {
                    if (this._buttonEventHandlers) {
                        this._buttonEventHandlers.cancel();
                        this._buttonEventHandlers = null
                    }
                    if (this._queryDisposer) {
                        this._queryDisposer.dispose();
                        this._queryDisposer = null
                    }
                    if (this._detailBindings) {
                        this._detailBindings.cancel();
                        this._detailBindings = null
                    }
                    if (this._signInBindings) {
                        this._signInBindings.cancel();
                        this._signInBindings = null
                    }
                    this._unregisterFileTransferListener();
                    MS.Entertainment.Pages.BaseMediaInlineDetails.prototype.unload.call(this)
                }, _setMedia: function _setMedia(media) {
                    this.activeMedia = media = media || this.artist;
                    var useMedia = this.activeMedia;
                    var loadContentPromise;
                    if (media && media.isTopSongs) {
                        useMedia = this.artist;
                        this._secondaryList.itemTemplate = "Components/InlineDetails/MusicArtistInlineDetails.html#musicInlineDetailsTrack"
                    }
                    else
                        this._secondaryList.itemTemplate = "Components/InlineDetails/MusicAlbumInlineDetails.html#musicInlineDetailsTrack";
                    MS.Entertainment.Pages.BaseMediaInlineDetails.prototype._setMedia.call(this, useMedia);
                    this._beginPageChange();
                    this._secondaryList.dataSource = null;
                    this._actionsPanel.buttons = [];
                    if (media && media.mediaType === Microsoft.Entertainment.Queries.ObjectType.album) {
                        this.album = media;
                        this.album.location = this.originalLocation;
                        this._formatAlbumDetailString();
                        WinJS.Utilities.addClass(this._primaryPanel, "popOverSecondPage");
                        this._showElement(this._containerTitle.domElement, false);
                        this._showElement(this._primaryListPanel, false);
                        this._showElement(this._secondaryListPanel, false);
                        loadContentPromise = this._loadAlbumTracks(media);
                        this._secondaryList.mediaContext.containingMedia = {
                            playbackItemSource: useMedia, playbackOffset: 0
                        }
                    }
                    else {
                        this.artist = media;
                        this._formatArtistDetailString();
                        WinJS.Utilities.removeClass(this._primaryPanel, "popOverSecondPage");
                        this._showElement(this._containerTitle.domElement, this.isCollection);
                        this._showElement(this._primaryListPanel, false);
                        this._showElement(this._secondaryListPanel, false);
                        loadContentPromise = this._loadAlbums(media);
                        if (this._albumIndex >= 0)
                            this._list.ensureVisible(this._albumIndex);
                        this._secondaryList.mediaContext.containingMedia = {
                            playbackItemSource: null, playbackOffset: 0
                        }
                    }
                    loadContentPromise.done(function addSubscriptionUpsell() {
                        if (!this._signedInUser)
                            this._signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                        if (this._signedInUser && !this._signedInUser.isSubscription)
                            this._signInBindings = WinJS.Binding.bind(this._signedInUser, {isSubscription: this._updateSubscriptionLinkVisibility.bind(this)})
                    }.bind(this));
                    MS.Entertainment.UI.FileTransferService.pulseAsync(useMedia);
                    this._initializeListsOnce();
                    this._setupSmartBuy(useMedia);
                    this._endPageChange()
                }, _initializeListsOnce: function intializeListsOnce() {
                    if (this._initializingLists)
                        return;
                    this._initializingLists = true;
                    WinJS.Promise.timeout().then(function() {
                        if (!this.smartBuyStateEngine || this._unloaded)
                            return;
                        this._initializedLists = true;
                        if (!this.isCollection) {
                            WinJS.Utilities.addClass(this._list.domElement, "marketplaceAlbums");
                            WinJS.Utilities.addClass(this._secondaryList.domElement, "marketplaceTracks");
                            this._list.grouper = new MS.Entertainment.Pages.ArtistPopoverAlbumGrouper(true)
                        }
                        else {
                            WinJS.Utilities.addClass(this._list.domElement, "collectionAlbums");
                            WinJS.Utilities.addClass(this._secondaryList.domElement, "collectionTracks");
                            this._containerTitle.stringId = String.id.IDS_MUSIC_ALBUMS_IN_COLLECTION
                        }
                        var hydrateIfPossible = function hydrateIfPossible(hasServiceId) {
                                this._hydrateMediaIfPossible()
                            }.bind(this);
                        var binding = WinJS.Binding.bind(this.artist, {hasServiceId: hydrateIfPossible});
                        this.mediaBindings.push(binding);
                        this._loadAlbums(this.artist).done()
                    }.bind(this))
                }, _buttonChangedHandler: function _buttonChangedHandler() {
                    if (this.activeMedia && this.activeMedia.mediaType === Microsoft.Entertainment.Queries.ObjectType.album)
                        this._displayAlbumTracksList(this.tracks);
                    else
                        this._displayArtistAlbumList(this.albums)
                }, _loadAlbums: function _loadAlbums(artist) {
                    if (!this._initializedLists || !artist || this._unloaded)
                        return WinJS.Promise.as();
                    var query = this._queryDisposer.albumsQuery;
                    var hydratePromise;
                    if (this.albums) {
                        this._displayArtistAlbumList(this.albums);
                        return WinJS.Promise.as()
                    }
                    else {
                        query = query || this.isCollection ? new MS.Entertainment.Data.Query.libraryAlbums : new MS.Entertainment.Data.Query.Music.ArtistAlbums;
                        this._queryDisposer.albumsQuery = query;
                        if (this.isCollection) {
                            query.artistId = artist.libraryId;
                            query.sort = Microsoft.Entertainment.Queries.AlbumsSortBy.titleAscending;
                            query.mediaAvailability = this.collectionFilter;
                            query.isLive = true
                        }
                        else {
                            if (!artist.hasCanonicalId)
                                hydratePromise = artist.hydrate();
                            hydratePromise = WinJS.Promise.as(hydratePromise).then(function setCanonicalId() {
                                if (!artist.hasCanonicalId || artist.isFailed)
                                    return WinJS.Promise.wrapError(new Error("Artist doesn't have a canonical id or hydrate failed"));
                                else
                                    query.id = artist.canonicalId
                            })
                        }
                        return WinJS.Promise.as(hydratePromise).then(function executeQuery() {
                                if (this._unloaded)
                                    return;
                                query = this._addContentNotifications(query, artist);
                                return query.getItemsAndIgnoreErrors()
                            }.bind(this)).then(function insertTopSongsItem(albums) {
                                if (this._unloaded)
                                    return;
                                if (!albums)
                                    albums = new MS.Entertainment.Data.VirtualList(null, []);
                                return MS.Entertainment.Utilities.redirectPromise(this._insertTopSongsItems(albums), albums)
                            }.bind(this)).then(function setAlbums(albums) {
                                if (this._unloaded)
                                    return;
                                this.albums = albums;
                                if (this._loadedButtons)
                                    this._displayArtistAlbumList(albums)
                            }.bind(this), function handleError() {
                                if (this._unloaded)
                                    return;
                                if (!this._isOnline)
                                    this._handleError();
                                else
                                    this._showEmptyArtistPanel()
                            }.bind(this))
                    }
                }, _showEmptyArtistPanel: function _showEmptyArtistPanel() {
                    WinJS.Utilities.removeClass(this.emptyContainer, "removeFromDisplay");
                    this.hideListLoadingControl();
                    this.tracks = [];
                    this.smartBuyStateEngine.updateState()
                }, _loadAlbumTracks: function _loadAlbumTracks(album) {
                    if (!this._initializedLists || !album)
                        return WinJS.Promise.as();
                    var hydratingPromise;
                    if (this.isCollection)
                        album.tracks = null;
                    else if (album.hydrate)
                        hydratingPromise = album.hydrate();
                    return WinJS.Promise.as(hydratingPromise).then(function hydratingDone() {
                            if (this._unloaded)
                                return;
                            return album.tracks || this._getAlbumTracksQuery(album).getItemsAndIgnoreErrors()
                        }.bind(this)).then(function setAlbumTrack(tracks) {
                            if (this._unloaded)
                                return;
                            album.tracks = tracks || album.tracks;
                            this.tracks = tracks;
                            if (this._loadedButtons)
                                this._displayAlbumTracksList(tracks)
                        }.bind(this))
                }, _updateSubscriptionLinkVisibility: function _updateSubscriptionLinkVisibility() {
                    if (this._subscriptionLink && this._subscriptionLink.action && this._subscriptionLink.action.canExecute() && this.media && (this.media.mediaType === Microsoft.Entertainment.Queries.ObjectType.album))
                        MS.Entertainment.ViewModels.MusicSmartBuyStateHandlers.getAlbumRights(this.media).then(function getAlbumRights_complete(rights) {
                            this.showSignupLink = (rights.subscriptionStream || rights.subscriptionDownload);
                            if (this.showSignupLink)
                                this._subscriptionLink.action.parameter = MS.Entertainment.Music.Freeplay.Events.musicPassUpsellAlbumPopoverLinkInvoked
                        }.bind(this));
                    else
                        this.showSignupLink = false
                }, _insertTopSongsItems: function _insertTopSongsItems(albums) {
                    var insertPromise;
                    if (albums && !this.isCollection) {
                        var topSongsAlbum = new MS.Entertainment.Data.Augmenter.Marketplace.EDSTopSongsAlbum;
                        topSongsAlbum.artist = this.artist;
                        insertPromise = albums.insertAt(0, new MS.Entertainment.Data.Factory.ListNoHeaderItemWrapper(topSongsAlbum))
                    }
                    return WinJS.Promise.as(insertPromise)
                }, _getAlbumTracksQuery: function _getAlbumTracksQuery(album) {
                    var query = this._queryDisposer.tracksQuery || this.isCollection ? new MS.Entertainment.Data.Query.libraryTracks : new MS.Entertainment.Data.Query.Music.AlbumSongs;
                    this._queryDisposer.tracksQuery = query;
                    if (this.isCollection) {
                        query.albumId = album.libraryId;
                        query.sort = Microsoft.Entertainment.Queries.TracksSortBy.albumReleaseYearDescendingNumberAscending;
                        query.mediaAvailability = this.collectionFilter;
                        query.isLive = true;
                        query.acquisitionData = new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.collection, Microsoft.Entertainment.Platform.AcquisitionContextType.album, MS.Entertainment.Utilities.isValidServiceId(album.canonicalId) ? album.canonicalId : String.empty)
                    }
                    else {
                        query.id = album.canonicalId;
                        query.acquisitionData = new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.store, Microsoft.Entertainment.Platform.AcquisitionContextType.album, MS.Entertainment.Utilities.isValidServiceId(album.canonicalId) ? album.canonicalId : String.empty)
                    }
                    return this._addContentNotifications(query)
                }, _beginPageChange: function _beginPageChange() {
                    MS.Entertainment.Utilities.hideElement(this._primaryPanel)
                }, _displayArtistAlbumList: function _displayArtistAlbumList(items) {
                    if (this._unloaded)
                        return;
                    this.hideListLoadingControl();
                    this._showElement(this._primaryListPanel, items && items.count > 0);
                    this._showElement(this._containerTitle, items && items.count > 0);
                    if (this._list) {
                        if (!this._list.dataSource)
                            this._updateArtistCounts();
                        this._list.dataSource = items
                    }
                    if (items && this.collectionFilter && this.collectionFilter !== Microsoft.Entertainment.Platform.MediaAvailability.available) {
                        var unfilteredQuery = new MS.Entertainment.Data.Query.libraryAlbums;
                        unfilteredQuery.artistId = this.media.libraryId;
                        unfilteredQuery.executeCount().done(function unfilteredQueryComplete(unfilteredAlbumCount) {
                            if (unfilteredAlbumCount > items.count)
                                this._showCollectionFilter()
                        }.bind(this), function unfilteredQueryError() {
                            this._showCollectionFilter()
                        }.bind(this))
                    }
                }, _displayAlbumTracksList: function _displayAlbumTracksList(items) {
                    if (this._unloaded)
                        return;
                    this.hideListLoadingControl();
                    this._showElement(this._secondaryListPanel, items && items.count > 0);
                    this._showElement(this._containerTitle, items && items.count > 0);
                    this._secondaryList.dataSource = items;
                    if (items && this.collectionFilter && this.collectionFilter !== Microsoft.Entertainment.Platform.MediaAvailability.available) {
                        var unfilteredQuery = new MS.Entertainment.Data.Query.libraryTracks;
                        unfilteredQuery.albumId = this.media.libraryId;
                        unfilteredQuery.executeCount().done(function unfilteredQueryComplete(unfilteredTrackCount) {
                            if (unfilteredTrackCount > items.count)
                                this._showCollectionFilter()
                        }.bind(this), function unfilteredQueryError() {
                            this._showCollectionFilter()
                        }.bind(this))
                    }
                }, _endPageChange: function _endPageChange() {
                    MS.Entertainment.Utilities.showElement(this._primaryPanel)
                }, _updateArtistCounts: function _updateArtistCounts() {
                    if (this.artist && this.artist.inCollection) {
                        var localArtistQuery = new MS.Entertainment.Data.Query.libraryArtists;
                        localArtistQuery.personId = this.artist.libraryId;
                        localArtistQuery.mediaAvailability = this.collectionFilter;
                        localArtistQuery.execute().done(function(query) {
                            this.artist.totalTracksCount = query.result.totalTracksCount;
                            this.artist.totalAlbumsCount = query.result.totalAlbumsCount
                        }.bind(this))
                    }
                }, _formatAlbumDetailString: function _formatAlbumDetailString() {
                    if (this._detailBindings) {
                        this._detailBindings.cancel();
                        this._detailBindings = null
                    }
                    var bindingsComplete = false;
                    var formatAlbumDetailString = function formatAlbumDetailString() {
                            if (bindingsComplete && this.media === this.album)
                                this.detailString = MS.Entertainment.Data.Factory.createAlbumDetailString(this.album)
                        }.bind(this);
                    this._detailBindings = WinJS.Binding.bind(this.album, {
                        artistName: formatAlbumDetailString, releaseDate: formatAlbumDetailString, primaryGenre: formatAlbumDetailString, genreName: formatAlbumDetailString, label: formatAlbumDetailString
                    });
                    bindingsComplete = true;
                    formatAlbumDetailString()
                }, _formatArtistDetailString: function _formatArtistDetailString() {
                    if (this._detailBindings) {
                        this._detailBindings.cancel();
                        this._detailBindings = null
                    }
                    var bindingsComplete = false;
                    var formatArtistDetailString = function formatArtistDetailString() {
                            if (bindingsComplete && this.media === this.artist)
                                this.detailString = MS.Entertainment.Data.Factory.createArtistDetailString(this.artist, this.isCollection)
                        }.bind(this);
                    this._detailBindings = WinJS.Binding.bind(this.artist, {
                        inCollection: formatArtistDetailString, detailString: formatArtistDetailString, totalAlbumsCount: formatArtistDetailString, totalTracksCount: formatArtistDetailString, primaryGenre: formatArtistDetailString
                    });
                    bindingsComplete = true;
                    formatArtistDetailString()
                }, _addContentNotifications: function _addContentNotifications(query, sourceMedia) {
                    if (query) {
                        var propertyKey = this.isCollection ? "libraryId" : "serviceId";
                        var notifications = new MS.Entertainment.UI.ContentNotification.NotificationModification(MS.Entertainment.UI.ContentNotification.listResult(), MS.Entertainment.UI.FileTransferService.keyFromProperty(propertyKey, false, true));
                        notifications.modifyQuery(query);
                        if (sourceMedia && sourceMedia.mediaType === Microsoft.Entertainment.Queries.ObjectType.person) {
                            this._notificationsSender = notifications.createSender();
                            this._fileTransferListenerId = "MusicArtistInlineDetails_" + MS.Entertainment.Utilities.getSessionUniqueInteger();
                            var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                            var taskKeyGetter;
                            if (this.isCollection)
                                taskKeyGetter = MS.Entertainment.UI.FileTransferService.keyFromProperty("albumLibraryId");
                            else
                                taskKeyGetter = MS.Entertainment.UI.FileTransferService.keyFromProperty("albumMediaId", false, true);
                            fileTransferService.registerListener(this._fileTransferListenerId, taskKeyGetter, this._notificationsSender, MS.Entertainment.UI.FileTransferNotifiers.trackCollection)
                        }
                    }
                    return query
                }, _unregisterFileTransferListener: function _unregisterFileTransferListener() {
                    if (this._fileTransferListenerId) {
                        var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                        fileTransferService.unregisterListener(this._fileTransferListenerId)
                    }
                    this._notificationsSender = null
                }
        }, {
            artist: null, album: null, activeMedia: null, showSignupLink: false
        }), ArtistPopoverAlbumGrouper: MS.Entertainment.UI.Framework.derive("MS.Entertainment.UI.Controls.GalleryGrouper", function ArtistPopoverAlbumGrouper(isMarketplace) {
                this.isMarketplace = isMarketplace || false;
                this.keyPropertyName = "mediaType"
            }, {
                isMarketplace: false, useKeyAsData: false, createData: function createData(item) {
                        var title;
                        if (item && item.data && !item.data.isTopSongs && item.data.mediaType === Microsoft.Entertainment.Queries.ObjectType.album)
                            title = String.load(this.isMarketplace ? String.id.IDS_DETAILS_RECENT_ALBUMS : String.id.IDS_MUSIC_ALBUMS_IN_COLLECTION);
                        else
                            title = String.load(this.isMarketplace ? String.id.IDS_DETAILS_TOP_SONGS : String.id.IDS_MUSIC_SONGS_IN_COLLECTION);
                        return {title: title}
                    }
            }), ArtistPopoverTemplateSelector: MS.Entertainment.UI.Framework.derive("MS.Entertainment.UI.Controls.GalleryTemplateSelector", function galleryTemplateSelector() {
                MS.Entertainment.UI.Controls.TemplateSelectorBase.prototype.constructor.call(this);
                this.topSongsAlbumTemplate = "Components/Music/MusicSharedTemplates.html#verticalTopSongsAlbumTemplate"
            }, {
                topSongsAlbumTemplate: {
                    get: function() {
                        return this.getTemplate(MS.Entertainment.Pages.ArtistPopoverTemplateSelector.templateType.topSongsAlbum)
                    }, set: function(value) {
                            this.addTemplate(MS.Entertainment.Pages.ArtistPopoverTemplateSelector.templateType.topSongsAlbum, value)
                        }
                }, onSelectTemplate: function onSelectTemplate(item) {
                        if (item.data && item.data.isTopSongs)
                            return this.getTemplateProvider(MS.Entertainment.Pages.ArtistPopoverTemplateSelector.templateType.topSongsAlbum);
                        else
                            return MS.Entertainment.UI.Controls.GalleryTemplateSelector.prototype.onSelectTemplate.apply(this, arguments)
                    }
            }, {templateType: {topSongsAlbum: "topSongsAlbum"}}), ArtistTracksDataNotificationHandler: MS.Entertainment.UI.Framework.define(function artistTracksDataNotificationHandler(updateCallback) {
                this._updateCallback = updateCallback
            }, {
                _updateCallback: null, dispose: function dispose() {
                        this._updateCallback = null
                    }, inserted: function inserted(item, previousKey, nextKey, index) {
                        this._updateCallback(index)
                    }, changed: function changed(newItem, oldItem){}, moved: function moved(item, previousKey, nextKey, oldIndex, newIndex){}, removed: function removed(key, index) {
                        this._updateCallback(index, key)
                    }, countChanged: function countChanged(newCount, oldCount){}
            })
    })
})()
