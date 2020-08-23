/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {
        ArtistImmersiveViewModel: MS.Entertainment.defineOptionalObservable(function artistImmersiveViewModel() {
            MS.Entertainment.UI.Framework.loadTemplate("/Components/Immersive/Music/ArtistOverview.html", "ImmersiveOverview");
            this.frames = new MS.Entertainment.ObservableArray;
            this.phases = [this._loadAboutPanel, this._loadFullDiscographyPanel, this._loadTopSongsPanel, this._loadMusicVideosPanel, this._loadRelatedArtistPanel, this._loadSecondaryFrames];
            this._heroControl = MS.Entertainment.UI.Controls.Music2ImmersiveHero
        }, {
            _sessionId: null, _loadedMediaItem: null, _loadingPromise: null, _hydratePromise: null, _mediaItem: null, _originalMediaItem: null, _disposed: false, _nowPlayingBindings: null, _smartDJBindings: null, _currentPhase: 0, _frameFlushCount: 1, _frozen: false, _useBackgroundImage: false, _heroControl: null, _heroColumns: 0, _heroAdded: false, _heroDelayMS: 500, skipInitialFocus: true, phases: null, secondaryFrames: null, tertiaryFrames: null, deferredFrameLoadTimeout: 2500, dispose: function dispose() {
                    this._releaseRelatedArtistsViewModel();
                    this._releaseDiscographyViewModel();
                    this._disposed = true
                }, freeze: function freeze() {
                    this._frozen = true
                }, thaw: function thaw() {
                    this._frozen = false;
                    if (this.phases && this.phases.indexOf(this._loadNowPlayingPanel) >= 0)
                        this._loadNowPlayingPanel()
                }, mediaItem: {
                    get: function() {
                        return this._mediaItem
                    }, set: function(value) {
                            if (value !== this._mediaItem && !this._disposed) {
                                var oldValue = this._mediaItem;
                                this._mediaItem = value;
                                if (this.heroDataContext)
                                    this.heroDataContext.mediaItem = value;
                                this.notify("mediaItem", value, oldValue)
                            }
                        }
                }, updateMetaData: function updateMetaData(originalMediaItem, deferAdditionalFrames) {
                    if (this._disposed)
                        return;
                    var firstSecondaryIndex;
                    var mediaItem;
                    this._originalMediaItem = originalMediaItem.clone();
                    if (originalMediaItem.mediaType !== Microsoft.Entertainment.Queries.ObjectType.person && originalMediaItem.artist) {
                        mediaItem = originalMediaItem.artist.clone();
                        mediaItem = MS.Entertainment.ViewModels.MediaItemModel.augment(mediaItem)
                    }
                    else
                        mediaItem = this._originalMediaItem;
                    this.heroDataContext = new MS.Entertainment.ViewModels.ArtistHeroViewModel(mediaItem);
                    if (this._hydratePromise && mediaItem.isEqual(this.mediaItem))
                        return this._hydratePromise;
                    this.mediaItem = mediaItem;
                    var hydratePromise = null;
                    if (mediaItem.hydrate)
                        hydratePromise = mediaItem.hydrate({
                            forceUpdate: mediaItem.fromCollection, listenForDBUpdates: true
                        }).then(function mediaHydrated() {
                            this.mediaItem = mediaItem;
                            return mediaItem
                        }.bind(this), function mediaHydrateFailed() {
                            return mediaItem
                        }.bind(this));
                    else
                        hydratePromise = WinJS.Promise.wrap(mediaItem);
                    if (this._loadingPromise)
                        this._loadingPromise.cancel();
                    this.secondaryFrames = [];
                    this.tertiaryFrames = [];
                    this._loadingPromise = this._loadPhase(0, hydratePromise, deferAdditionalFrames);
                    this._loadingPromise.done(function() {
                        this._loadingPromise = null
                    }.bind(this), function() {
                        this._loadingPromise = null
                    }.bind(this));
                    this._hydratePromise = hydratePromise;
                    return this._hydratePromise
                }, _loadPhase: function _loadPhase(phase, param, deferAdditionalFrames) {
                    if (this._disposed || phase >= this.phases.length)
                        return WinJS.Promise.as();
                    var phasePromise = this.phases[phase].call(this, param);
                    return phasePromise.then(function endPhase() {
                            return this._endPhase(phase, param, deferAdditionalFrames)
                        }.bind(this), function(error) {
                            if (error.name !== "Canceled")
                                return this._endPhase(phase, param, deferAdditionalFrames);
                            else
                                return WinJS.Promise.wrapError(error)
                        }.bind(this))
                }, _endPhase: function _endPhase(phase, param, deferAdditionalFrames) {
                    return WinJS.Promise.timeout(deferAdditionalFrames ? this.deferredFrameLoadTimeout : 0).then(function _delay() {
                            if (this.secondaryFrames && phase === this._frameFlushCount) {
                                this.frames.spliceArray(this.frames.length, 0, this.secondaryFrames);
                                this.secondaryFrames = []
                            }
                            if (WinJS.Utilities.getMember("XboxJS.UI.Voice"))
                                XboxJS.UI.Voice.refreshVoiceElements();
                            return this._loadPhase(phase + 1, param)
                        }.bind(this))
                }, _loadHeroPanel: function _loadHeroPanel(mediaHydratePromise) {
                    if (this._heroAdded)
                        return mediaHydratePromise;
                    var heroFrame = function makeHeroFrame() {
                            var frame = MS.Entertainment.UI.Controls.Immersive.makeFrame(String.load(String.id.IDS_DETAILS_OVERVIEW), this._heroColumns, this._heroControl);
                            frame.columnStyle = "immersiveHeroFrameColumn firstImmersiveTwoColumn";
                            frame.getData = function frameGetData() {
                                return WinJS.Promise.as(this.heroDataContext)
                            }.bind(this);
                            return frame
                        }.bind(this)();
                    if (!this.frames || this.frames.length === 0)
                        this.frames = new MS.Entertainment.ObservableArray([heroFrame]);
                    else
                        this.frames.push(heroFrame);
                    this._heroAdded = true;
                    return mediaHydratePromise
                }, _loadAboutPanel: function _loadAboutPanel(mediaHydratePromise) {
                    this.biographyViewModel = new MS.Entertainment.ViewModels.ArtistBiographyViewModel(this.mediaItem, true);
                    if (!this.frames || this.frames.length === 0)
                        this.frames = new MS.Entertainment.ObservableArray([function makeBioFrame() {
                                var bioFrame = null;
                                bioFrame = this._makeOverviewFrame(false);
                                return bioFrame
                            }.bind(this)()]);
                    this._loadHeroPanel(mediaHydratePromise);
                    mediaHydratePromise = mediaHydratePromise.then(function delay() {
                        return WinJS.Promise.timeout(this._heroDelayMS)
                    }.bind(this));
                    mediaHydratePromise.done(function execute() {
                        this.biographyViewModel.execute()
                    }.bind(this));
                    return mediaHydratePromise
                }, _loadFullDiscographyPanel: function _loadFullDiscographyPanel(result) {
                    this._releaseDiscographyViewModel();
                    this.discographyViewModel = new MS.Entertainment.ViewModels.ImmersiveDetailsArtistsDiscography(this.mediaItem);
                    return this.discographyViewModel.execute().then(function addFrame(result) {
                            var discographyViewModel = WinJS.Binding.unwrap(this.discographyViewModel);
                            if (discographyViewModel && ((discographyViewModel.firstPanelItems && discographyViewModel.firstPanelItems.length > 0) || (discographyViewModel.secondPanelItems && discographyViewModel.secondPanelItems.length > 0)))
                                this.secondaryFrames.push(this._makeDiscographyFrame())
                        }.bind(this))
                }, _loadTopSongsPanel: function _loadTopSongsPanel(result) {
                    if (!this.mediaItem || (!MS.Entertainment.Utilities.isValidServiceId(this.mediaItem.canonicalId) && !MS.Entertainment.Utilities.isValidLibraryId(this.mediaItem.libraryId)))
                        return WinJS.Promise.as();
                    var query;
                    var totalMember;
                    if (MS.Entertainment.Utilities.isValidServiceId(this.mediaItem.canonicalId)) {
                        query = new MS.Entertainment.Data.Query.Music.ArtistTopSongs;
                        query.id = this.mediaItem.canonicalId;
                        query.impressionGuid = this.mediaItem.impressionGuid;
                        totalMember = "result.total"
                    }
                    else {
                        query = new MS.Entertainment.Data.Query.libraryTracks;
                        query.artistId = this.mediaItem.libraryId;
                        query.impressionGuid = this.mediaItem.impressionGuid;
                        totalMember = "result.totalCount"
                    }
                    return query.execute().then(function addFrame(result) {
                            if (WinJS.Utilities.getMember(totalMember, result) > 0)
                                this.secondaryFrames.push(this._makeTopSongsFrame(result))
                        }.bind(this))
                }, _loadMusicVideosPanel: function _loadArtistMusicVideoPanel(result) {
                    var featureEnablement = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.featureEnablement);
                    if (!this.mediaItem || !this.mediaItem.canonicalId || !featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicVideosEnabled))
                        return WinJS.Promise.as();
                    var query = new MS.Entertainment.Data.Query.Music.ArtistNewMusicVideos;
                    query.id = this.mediaItem.canonicalId;
                    query.impressionGuid = this.mediaItem.impressionGuid;
                    return query.execute().then(function addFrame(result) {
                            if (result && result.result && (result.result.total > 0 || result.result.totalCount > 0))
                                this.secondaryFrames.push(this._makeMusicVideosFrame(result))
                        }.bind(this))
                }, _loadRelatedArtistPanel: function _loadRelatedArtistPanel(result) {
                    this._releaseRelatedArtistsViewModel();
                    this.relatedArtistsViewModel = new MS.Entertainment.ViewModels.ImmersiveDetailsRelatedArtists(this.mediaItem);
                    return this.relatedArtistsViewModel.execute().then(function addFrame(result) {
                            var relatedArtistsViewModel = WinJS.Binding.unwrap(this.relatedArtistsViewModel);
                            if (relatedArtistsViewModel && relatedArtistsViewModel.firstPanelItems && relatedArtistsViewModel.firstPanelItems.length > 0)
                                this.secondaryFrames.push(this._makeRelatedArtistsFrame())
                        }.bind(this))
                }, _loadSecondaryFrames: function _loadSecondaryFrames(result) {
                    if (this._disposed)
                        return;
                    var mediaItemToLoad;
                    var minFrames = 1;
                    if (this.frames.length + this.secondaryFrames.length <= minFrames) {
                        mediaItemToLoad = this._originalMediaItem;
                        this.secondaryFrames.push(this._makeOverviewFrame(true))
                    }
                    else
                        mediaItemToLoad = this.mediaItem;
                    this._loadedMediaItem = mediaItemToLoad;
                    if (this.secondaryFrames.length)
                        this.frames.spliceArray(this.frames.length, 0, this.secondaryFrames);
                    return WinJS.Promise.as()
                }, _releaseRelatedArtistsViewModel: function _releaseRelatedArtistsViewModel() {
                    if (this.relatedArtistsViewModel) {
                        this.relatedArtistsViewModel.dispose();
                        this.relatedArtistsViewModel = null
                    }
                }, _releaseDiscographyViewModel: function _releaseDiscographyViewModel() {
                    if (this.discographyViewModel) {
                        this.discographyViewModel.dispose();
                        this.discographyViewModel = null
                    }
                }, _makeOverviewFrame: function _makeOverviewFrame() {
                    var frame;
                    frame = MS.Entertainment.UI.Controls.Immersive.makeFrame(String.load(String.id.IDS_MUSIC_ABOUT_PANEL_TEXT), 1, MS.Entertainment.UI.Controls.ArtistImmersiveHeroSummary, "/Components/Immersive/Music/MoreArtistOverview.html");
                    frame.hideViewMoreIfEnoughSpace = true;
                    frame.columnStyle = "immersiveAboutPanel";
                    frame.getData = function frameGetData() {
                        return WinJS.Promise.wrap(this.biographyViewModel)
                    }.bind(this);
                    return frame
                }, _makeDiscographyFrame: function _makeDiscographyFrame() {
                    var frame = MS.Entertainment.UI.Controls.Immersive.makeFrame(String.load(String.id.IDS_MUSIC_DISCOGRAPHY_TITLE), -1, MS.Entertainment.UI.Controls.ImmersiveRelatedTileItems, String.empty, MS.Entertainment.ViewModels.ArtistImmersiveViewModel.Monikers.albums);
                    frame.columnStyle = "immersiveAutoSize";
                    frame.getData = function frameGetData() {
                        return WinJS.Promise.wrap(this.discographyViewModel)
                    }.bind(this);
                    return frame
                }, _makeRelatedArtistsFrame: function _makeRelatedArtistsFrame() {
                    var columns = -1;
                    var frame = MS.Entertainment.UI.Controls.Immersive.makeFrame(String.load(String.id.IDS_MUSIC_RELATED_ARTISTS_TEXT), columns, MS.Entertainment.UI.Controls.ImmersiveRelatedTileItems, "Components/Immersive/Music/MoreArtistAlbums.html", MS.Entertainment.ViewModels.ArtistImmersiveViewModel.Monikers.related);
                    if (columns > 0) {
                        frame.hideViewMoreIfEnoughSpace = false;
                        frame.viewMoreInfo.title = String.load(String.id.IDS_MUSIC_RELATED_ARTISTS_LINK)
                    }
                    else
                        frame.columnStyle = "immersiveAutoSize";
                    frame.getData = function frameGetData() {
                        return WinJS.Promise.wrap(this.relatedArtistsViewModel)
                    }.bind(this);
                    return frame
                }, _makeTopSongsFrame: function _makeTopSongsFrame(result) {
                    var frame = MS.Entertainment.UI.Controls.Immersive.makeFrame(String.load(String.id.IDS_MUSIC2_TOP_SONGS_PANEL_TEXT), 3, MS.Entertainment.UI.Controls.NowPlayingPlaylist, null, MS.Entertainment.ViewModels.ArtistImmersiveViewModel.Monikers.songs);
                    frame.hideViewMoreIfEnoughSpace = true;
                    frame.getData = function frameGetData() {
                        return WinJS.Promise.wrap({
                                dataSource: result.result.items, galleryTemplate: MS.Entertainment.UI.Controls.NowPlayingPlaylistTemplates.topSongs, focusFirstItemOnPageLoad: false
                            })
                    }.bind(this);
                    return frame
                }, _makeMusicVideosFrame: function _makeMusicVideosFrame(result) {
                    var frame = MS.Entertainment.UI.Controls.Immersive.makeFrame(String.load(String.id.IDS_MUSIC_VIDEO_MARKETPLACE_TITLE_LC), -1, MS.Entertainment.UI.Controls.MusicVideoList, String.empty, MS.Entertainment.ViewModels.ArtistImmersiveViewModel.Monikers.musicVideos, true);
                    frame.columnStyle = "immersiveAutoSize immersiveFrameContainer_musicVideos";
                    frame.getData = function frameGetData() {
                        return WinJS.Promise.wrap({
                                dataSource: result.result.items, galleryTemplate: MS.Entertainment.UI.Controls.NowPlayingPlaylistTemplates.musicVideos, focusFirstItemOnPageLoad: false
                            })
                    }.bind(this);
                    return frame
                }
        }, {
            frames: null, heroDataContext: null, relatedArtistsViewModel: null, discographyViewModel: null, musicVideosViewModel: null
        }, {Monikers: {
                songs: "songs", overview: "overview", albums: "albums", related: "related", relatedArtists: "relatedArtists", musicVideos: "musicVideos"
            }}), ArtistBiographyViewModel: MS.Entertainment.defineOptionalObservable(function artistBiographyViewModel(mediaItem, noTags) {
                this.mediaItem = mediaItem;
                var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                this._noTags = noTags || configurationManager.music.disableArtistBioLinks
            }, {
                _noTags: true, execute: function execute() {
                        var description = String.empty;
                        if (this.mediaItem)
                            if (this.mediaItem.backgroundImage)
                                this.backgroundImageUri = this.mediaItem.backgroundImage.url;
                            else
                                this.backgroundImageUri = this.mediaItem.backgroundImageUri;
                        if (this.mediaItem)
                            description = this._noTags ? this.mediaItem.descriptionNoTags : this.mediaItem.description;
                        var promise = null;
                        this._processDescription(description ? description : String.empty);
                        if (this.mediaItem && this.mediaItem.hasServiceId && !this.mediaItem.hasDescription && !this.description) {
                            var biographyQuery = new MS.Entertainment.Data.Query.Music.ArtistBio;
                            biographyQuery.id = this.mediaItem.serviceId;
                            biographyQuery.impressionGuid = this.mediaItem.impressionGuid;
                            biographyQuery.idType = this.mediaItem.serviceIdType;
                            promise = biographyQuery.execute().then(function querySuccess(q) {
                                if (q.result.item) {
                                    var artistBio = this._noTags ? q.result.item.contentNoTags : q.result.item.content;
                                    this._processDescription(artistBio)
                                }
                                return this.description
                            }.bind(this))
                        }
                        else
                            promise = WinJS.Promise.wrap(this.description);
                        return promise
                    }, _processDescription: function _processDescription(description) {
                        this.mediaItem.description = this.description = (description || String.empty)
                    }
            }, {
                mediaItem: null, backgroundImageUri: String.empty, description: String.empty, smartBuyStateEngine: null, backgroundArtAvailable: false
            }), ImmersiveDetailsArtistsDiscography: MS.Entertainment.defineOptionalObservable(function immersiveDetailsArtistsDiscography(mediaItem) {
                this.mediaItem = mediaItem;
                this.selectedTemplate = {
                    templateUrl: "Components/Music/MusicSharedTemplates.html#largeDiscographyAlbumTemplate", className: "flexPanel albumDiscography", invokeBehavior: MS.Entertainment.UI.Controls.GalleryControl.InvokeBehavior.action, actionOptions: {
                            parameter: {location: MS.Entertainment.Data.ItemLocation.marketplace}, id: MS.Entertainment.UI.Actions.ActionIdentifiers.albumDetailsNavigate
                        }
                }
            }, {
                _numberOfCollectionAlbums: 6, _numberOfMarketplaceAlbums: 6, _disposed: false, dispose: function dispose() {
                        this._disposed = true
                    }, execute: function execute() {
                        if (this._disposed)
                            return;
                        var promise = null;
                        var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                        this.firstPanelItems = [];
                        this.secondPanelItems = [];
                        if (this.mediaItem) {
                            var libraryInfoPromise = WinJS.Promise.wrap();
                            if (!this.mediaItem.libraryId || this.mediaItem.libraryId < 0)
                                libraryInfoPromise = MS.Entertainment.ViewModels.MediaItemModel.hydrateLibraryInfoAsync(this.mediaItem);
                            promise = libraryInfoPromise.then(function executeLibraryQuery() {
                                if (this.mediaItem.libraryId < 0)
                                    return WinJS.Promise.as();
                                var sender;
                                var notifications;
                                var query = new MS.Entertainment.Data.Query.libraryAlbums;
                                query.aggregateChunks = false;
                                query.orderBy = MS.Entertainment.Data.Query.convertToLegacySortIfNeeded(MS.Entertainment.Data.Query.edsSortOrder.releaseDate);
                                query.chunkSize = 10;
                                query.chunked = false;
                                query.sort = Microsoft.Entertainment.Queries.AlbumsSortBy.dateAddedDescending;
                                query.artistId = this.mediaItem.libraryId;
                                if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.fileTransfer)) {
                                    notifications = new MS.Entertainment.UI.ContentNotification.NotificationModification(MS.Entertainment.UI.ContentNotification.listResult(), MS.Entertainment.UI.FileTransferService.keyFromProperty("serviceId", false, true));
                                    sender = notifications.createSender();
                                    notifications.modifyQuery(query)
                                }
                                return query.execute().then(function queryCompleted(q) {
                                        if (sender) {
                                            var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                                            fileTransferService.registerListener(this._fileTransferListenerId, MS.Entertainment.UI.FileTransferService.keyFromProperty("albumMediaId", false, true), sender, MS.Entertainment.UI.FileTransferNotifiers.trackCollection)
                                        }
                                        if (q.result.items)
                                            return q.result.items.toArray(0, this._numberOfCollectionAlbums).then(function setCount(itemsArray) {
                                                    return {
                                                            totalCount: q.result.totalCount, items: itemsArray
                                                        }
                                                });
                                        else
                                            return {
                                                    totalCount: 0, items: []
                                                }
                                    }.bind(this))
                            }.bind(this)).then(function setResult(results) {
                                if (results && results.items && results.items.length > 0) {
                                    if (results.totalCount <= this._numberOfCollectionAlbums)
                                        this.firstPanelItems = results.items;
                                    else {
                                        this.firstPanelItems = results.items.slice(0, this._numberOfCollectionAlbums);
                                        var collectionNavigateAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.navigate);
                                        collectionNavigateAction.parameter = {
                                            page: MS.Entertainment.UI.Monikers.artistAlbums, hub: MS.Entertainment.UI.Monikers.artistAlbumsCollection, args: {
                                                    selectHub: true, artistId: this.mediaItem.canonicalId, artistLibraryId: this.mediaItem.libraryId, artistName: this.mediaItem.name
                                                }
                                        };
                                        this.firstPanelMoreAction = {
                                            action: collectionNavigateAction, voicePhrase: String.load(String.id.IDS_MUSIC2_ARTIST_DETAILS_MORE_COLLECTION_ALBUMS_VUI_ALM), voicePhoneticPhrase: String.load(String.id.IDS_MUSIC2_ARTIST_DETAILS_MORE_COLLECTION_ALBUMS_VUI_PRON), voiceConfidence: String.load(String.id.IDS_MUSIC2_ARTIST_DETAILS_MORE_COLLECTION_ALBUMS_VUI_CONF)
                                        }
                                    }
                                    if (this.firstPanelItems.length > 0) {
                                        this.showFirstPanel = true;
                                        if (MS.Entertainment.Utilities.isMusicApp2)
                                            this.firstPanelHeader = String.load(String.id.IDS_MUSIC2_DISCOGRAPHY_COLLECTION_TITLE_LC)
                                    }
                                }
                                else
                                    return null
                            }.bind(this)).then(function getMarketplaceAlbums() {
                                if (!MS.Entertainment.Utilities.isEmptyGuid(this.mediaItem.canonicalId)) {
                                    var sender;
                                    var notifications;
                                    var query = new MS.Entertainment.Data.Query.Music.ArtistAlbums;
                                    query.aggregateChunks = false;
                                    query.orderBy = MS.Entertainment.Data.Query.convertToLegacySortIfNeeded(MS.Entertainment.Data.Query.edsSortOrder.releaseDate);
                                    query.chunkSize = this._numberOfMarketplaceAlbums;
                                    query.chunked = false;
                                    query.artistId = this.mediaItem.canonicalId;
                                    query.impressionGuid = this.mediaItem.impressionGuid;
                                    if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.fileTransfer)) {
                                        notifications = new MS.Entertainment.UI.ContentNotification.NotificationModification(MS.Entertainment.UI.ContentNotification.listResult(), MS.Entertainment.UI.FileTransferService.keyFromProperty("serviceId", false, true));
                                        sender = notifications.createSender();
                                        notifications.modifyQuery(query)
                                    }
                                    return query.execute().then(function queryCompleted(q) {
                                            if (sender) {
                                                var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                                                fileTransferService.registerListener(this._fileTransferListenerId, MS.Entertainment.UI.FileTransferService.keyFromProperty("albumMediaId", false, true), sender, MS.Entertainment.UI.FileTransferNotifiers.trackCollection)
                                            }
                                            if (q.result.items)
                                                return q.result.items.toArray(0, this._numberOfCollectionAlbums).then(function hydrateListLibraryInfoAsync(itemsArray) {
                                                        var albums = itemsArray || [];
                                                        var totalCount = q.result.totalCount;
                                                        return MS.Entertainment.ViewModels.MediaItemModel.hydrateListLibraryInfoAsync(albums).then(function onHydrateLibraryIdComplete() {
                                                                return {
                                                                        totalCount: totalCount, items: albums
                                                                    }
                                                            }, function onHydrateLibraryIdError(error) {
                                                                var errorMessage = error && errorMessage;
                                                                MS.Entertainment.ViewModels.fail("hydrateListLibraryInfoAsync failed with error: " + errorMessage);
                                                                return {
                                                                        totalCount: totalCount, items: albums
                                                                    }
                                                            })
                                                    });
                                            else
                                                return {
                                                        totalCount: 0, items: []
                                                    }
                                        }.bind(this)).then(function setMarketplaceAlbums(results) {
                                            if (results) {
                                                if (results.totalCount <= this._numberOfMarketplaceAlbums)
                                                    this.secondPanelItems = results.items;
                                                else {
                                                    this.secondPanelItems = results.items.slice(0, this._numberOfMarketplaceAlbums);
                                                    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                                                    var marketPlaceNavigateAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.navigate);
                                                    marketPlaceNavigateAction.parameter = {
                                                        page: MS.Entertainment.UI.Monikers.artistAlbums, hub: MS.Entertainment.UI.Monikers.artistAlbumsMarketplace, args: {
                                                                selectHub: true, artistId: this.mediaItem.canonicalId, artistLibraryId: this.mediaItem.libraryId, artistName: this.mediaItem.name
                                                            }
                                                    };
                                                    this.secondPanelMoreAction = {
                                                        action: marketPlaceNavigateAction, voicePhrase: String.load(String.id.IDS_MUSIC2_ARTIST_DETAILS_MORE_CATALOG_ALBUMS_VUI_ALM), voicePhoneticPhrase: String.load(String.id.IDS_MUSIC2_ARTIST_DETAILS_MORE_CATALOG_ALBUMS_VUI_PRON), voiceConfidence: String.load(String.id.IDS_MUSIC2_ARTIST_DETAILS_MORE_CATALOG_ALBUMS_VUI_CONF)
                                                    }
                                                }
                                                if (this.secondPanelItems.length > 0) {
                                                    this.showSecondPanel = true;
                                                    this.secondPanelHeader = String.load(String.id.IDS_MARKETPLACE_PIVOT)
                                                }
                                            }
                                        }.bind(this))
                                }
                                else
                                    return null
                            }.bind(this))
                        }
                        else
                            promise = WinJS.Promise.wrap(this.items);
                        return promise
                    }
            }, {
                firstPanelItems: null, firstPanelHeader: String.empty, firstPanelMoreAction: null, secondPanelItems: null, secondPanelHeader: null, secondPanelMoreAction: null, showFirstPanel: false, showSecondPanel: false, selectedTemplate: null
            }), ImmersiveDetailsRelatedArtists: MS.Entertainment.defineOptionalObservable(function immersiveDetailsRelatedArtists(mediaItem) {
                this.mediaItem = mediaItem;
                this.selectedTemplate = {
                    templateUrl: "Components/Music/MusicSharedTemplates.html#relatedArtistTileLargeTemplate", className: "flexPanel relatedArtists", invokeBehavior: MS.Entertainment.UI.Controls.GalleryControl.InvokeBehavior.action, actionOptions: {
                            parameter: {location: MS.Entertainment.Data.ItemLocation.marketplace}, id: MS.Entertainment.UI.Actions.ActionIdentifiers.artistDetailsNavigate
                        }
                };
                this._uiStateServiceBindings = MS.Entertainment.Utilities.addEventHandlers(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState), {windowresize: function refreshView() {
                        this.execute()
                    }.bind(this)})
            }, {
                _uiStateServiceBindings: null, _numberOfSimilarItems: 0, _numberOfInfluencingArtists: 0, _moreModel: null, _disposed: false, dispose: function dispose() {
                        if (this._moreModel) {
                            this._moreModel.dispose();
                            this._moreModel = null
                        }
                        if (this._uiStateServiceBindings) {
                            this._uiStateServiceBindings.cancel();
                            this._uiStateServiceBindings = null
                        }
                        this._disposed = true
                    }, execute: function execute() {
                        if (this._disposed)
                            return;
                        var promise = null;
                        this.items = [];
                        this.firstPanelItems = [];
                        this.secondPanelItems = [];
                        if (MS.Entertainment.Utilities.isMusicApp1) {
                            var screenHeight = MS.Entertainment.Utilities.getWindowHeight();
                            var rowCount = screenHeight >= 1080 ? 3 : 2;
                            this._numberOfSimilarItems = (2 * rowCount);
                            this._numberOfInfluencingArtists = 0
                        }
                        else {
                            this._numberOfSimilarItems = 6;
                            this._numberOfInfluencingArtists = 6
                        }
                        if (this.mediaItem && !MS.Entertainment.Utilities.isEmptyGuid(this.mediaItem.canonicalId)) {
                            var relatedArtistsQuery = new MS.Entertainment.Data.Query.Music.RelatedArtists;
                            relatedArtistsQuery.id = this.mediaItem.canonicalId;
                            relatedArtistsQuery.impressionGuid = this.mediaItem.impressionGuid;
                            relatedArtistsQuery.chunkSize = this._numberOfSimilarItems;
                            relatedArtistsQuery.chunked = false;
                            promise = relatedArtistsQuery.execute().then(function relatedArtistQuerySuccess(response) {
                                if (response.result.itemsArray)
                                    return response.result.itemsArray
                            }.bind(this)).then(function relatedArtistQuerySetItemList(itemList) {
                                if (itemList && itemList.length > 0) {
                                    if (itemList.length <= this._numberOfSimilarItems)
                                        this.firstPanelItems = itemList;
                                    else
                                        this.firstPanelItems = itemList.slice(0, this._numberOfSimilarItems);
                                    if (this.firstPanelItems.length > 0) {
                                        this.showFirstPanel = true;
                                        if (MS.Entertainment.Utilities.isMusicApp2)
                                            this.firstPanelHeader = String.load(String.id.IDS_MUSIC_SIMILAR_ARTISTS_TEXT)
                                    }
                                    var influencedByQuery = new MS.Entertainment.Data.Query.Music.InfluenceArtists;
                                    influencedByQuery.id = this.mediaItem.canonicalId;
                                    influencedByQuery.impressionGuid = this.mediaItem.impressionGuid;
                                    influencedByQuery.chunkSize = this._numberOfInfluencingArtists;
                                    influencedByQuery.chunked = false;
                                    return influencedByQuery.execute().then(function influencedByQuerySuccess(response) {
                                            if (response.result && response.result.itemsArray && response.result.itemsArray.length > 0 && response.result.itemsArray[0]) {
                                                this.influencedCount = response.result.itemsArray.length;
                                                if (MS.Entertainment.Utilities.isMusicApp2) {
                                                    var items = response.result.itemsArray;
                                                    if (items.length <= this._numberOfInfluencingArtists)
                                                        this.secondPanelItems = items;
                                                    else
                                                        this.secondPanelItems = items.slice(0, this._numberOfInfluencingArtists);
                                                    if (this.secondPanelItems.length > 0) {
                                                        this.showSecondPanel = true;
                                                        this.secondPanelHeader = String.load(String.id.IDS_MUSIC_INFLUENCING_ARTISTS_TEXT)
                                                    }
                                                }
                                            }
                                        }.bind(this), function onError(){})
                                }
                            }.bind(this))
                        }
                        else
                            promise = WinJS.Promise.wrap(this.items);
                        return promise
                    }, moreModel: {get: function() {
                            if (!this._moreModel && this.mediaItem && !this._disposed) {
                                this._moreModel = new MS.Entertainment.ViewModels.ArtistMarketplace;
                                this._moreModel.artist = this.mediaItem;
                                if (this.influencedCount && this.influencedCount > 0)
                                    this._moreModel.view = MS.Entertainment.ViewModels.ArtistMarketplace.ViewTypes.relatedArtistsAndInfluencers;
                                else
                                    this._moreModel.view = MS.Entertainment.ViewModels.ArtistMarketplace.ViewTypes.relatedArtists
                            }
                            return this._moreModel
                        }}
            }, {
                items: null, influencedCount: 0, firstPanelItems: null, firstPanelHeader: String.empty, secondPanelItems: null, secondPanelHeader: String.empty, showFirstPanel: false, showSecondPanel: false, selectedTemplate: null
            }), ArtistHeroViewModel: MS.Entertainment.deferredDerive(MS.Entertainment.ViewModels.BaseHeroViewModel, function artistHeroViewModel(mediaItem) {
                this.base(mediaItem);
                this._initialize();
                this.actionDescription = String.empty
            }, {
                isMarketplace: false, playlist: null, _eventHandler: null, _updateButtonsMethod: null, dispose: function dispose() {
                        if (this._eventHandler) {
                            this._eventHandler.cancel();
                            this._eventHandler = null
                        }
                        if (this._updateButtonsMethod)
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser).unbind("isSubscription", this._updateButtonsMethod)
                    }, updateButtons: function updateButtons() {
                        if (this.buttons && !this.buttons.addTo) {
                            this.buttons = null;
                            this._addButtons(MS.Entertainment.ViewModels.SmartBuyButtons.getArtistImmersiveDetailsButtonsDefault(this.mediaItem, false))
                        }
                    }, _initialize: function _initialize() {
                        if (!this.mediaItem || (MS.Entertainment.Utilities.isEmptyGuid(this.mediaItem.serviceId) && !MS.Entertainment.Utilities.isValidLibraryId(this.mediaItem.libraryId)))
                            return;
                        if (this._eventHandler) {
                            this._eventHandler.cancel();
                            this._eventHandler = null
                        }
                        if (this.buttons)
                            this.buttons.clear();
                        this.actionDescription = String.empty;
                        this._updateButtonsMethod = this.updateButtons.bind(this);
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser).bind("isSubscription", this._updateButtonsMethod);
                        var getLibraryButtons = function getLibraryButtons() {
                                mediaStore.artistProvider.getLibraryIdFromMediaIdAsync(this.mediaItem.zuneId).done(function loadLibraryOrServiceTracks(result) {
                                    if (result && MS.Entertainment.Utilities.isValidLibraryId(result.libraryId))
                                        this._createCollectionButtons(result.libraryId);
                                    else {
                                        this._createMarketplaceButtons();
                                        this.isMarketplace = true
                                    }
                                }.bind(this), function onGetLibraryIdError(error) {
                                    MS.Entertainment.ViewModels.fail("getLibraryIdFromMediaIdAsync failed with error: " + error && error.message)
                                })
                            }.bind(this);
                        var mediaStore = new Microsoft.Entertainment.Platform.MediaStore;
                        if (this.mediaItem.fromCollection)
                            if (MS.Entertainment.Utilities.isValidLibraryId(this.mediaItem.libraryId))
                                this._createCollectionButtons(this.mediaItem.libraryId);
                            else
                                getLibraryButtons();
                        else if (this.mediaItem.acquisitionContext === MS.Entertainment.Utilities.AcquisitionContext.Collection) {
                            var hydratePromise = WinJS.Promise.as();
                            if (!MS.Entertainment.Utilities.isValidServiceId(this.mediaItem.zuneId))
                                hydratePromise = this.mediaItem.hydrate();
                            hydratePromise.then(function onHydrated(hydratedArtist) {
                                this.mediaItem = hydratedArtist || this.mediaItem;
                                return MS.Entertainment.ViewModels.MediaItemModel.hydrateLibraryInfoAsync(this.mediaItem)
                            }.bind(this)).done(function onLibraryId() {
                                getLibraryButtons()
                            }.bind(this), function onError() {
                                this._createMarketplaceButtons();
                                this.isMarketplace = true
                            }.bind(this))
                        }
                        else {
                            this._createMarketplaceButtons();
                            this.isMarketplace = true
                        }
                    }, _createCollectionButtons: function _createCollectionButtons(libraryId) {
                        var buttons = MS.Entertainment.ViewModels.SmartBuyButtons.getArtistImmersiveDetailsButtonsDefault(this.mediaItem, true);
                        if (buttons.playAll && buttons.playAll.parameter)
                            buttons.playAll.parameter.libraryId = libraryId;
                        var query = new MS.Entertainment.Data.Query.libraryTracks;
                        query.artistId = libraryId;
                        query.execute().then(this._setResult.bind(this));
                        this.actionDescription = String.load(String.id.IDS_MUSIC_SONGS_IN_COLLECTION);
                        this.playbackItemSource = query.clone();
                        this._addButtons(buttons)
                    }, _createMarketplaceButtons: function _createMarketplaceButtons() {
                        var hydratePromise = WinJS.Promise.as();
                        if (!MS.Entertainment.Utilities.isValidServiceId(this.mediaItem.canonicalId))
                            hydratePromise = this.mediaItem.hydrate();
                        hydratePromise.done(function getButtons() {
                            var tracksQuery = new MS.Entertainment.Data.Query.Music.ArtistTopSongs;
                            tracksQuery.id = this.mediaItem.canonicalId;
                            tracksQuery.acquisitionData = new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.store, Microsoft.Entertainment.Platform.AcquisitionContextType.artist, this.mediaItem.canonicalId);
                            var musicVideoQuery = WinJS.Promise.as();
                            if (MS.Entertainment.Utilities.isMusicApp2) {
                                tracksQuery.isChunked = false;
                                tracksQuery.chunkSize = 1;
                                var featureEnablement = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.featureEnablement);
                                if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicVideosEnabled)) {
                                    musicVideoQuery = new MS.Entertainment.Data.Query.Music.ArtistMusicVideos;
                                    musicVideoQuery.id = this.mediaItem.canonicalId;
                                    musicVideoQuery.acquisitionData = new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.store, Microsoft.Entertainment.Platform.AcquisitionContextType.artist, this.mediaItem.canonicalId);
                                    musicVideoQuery.impressionGuid = this.mediaItem.impressionGuid;
                                    musicVideoQuery.chunkSize = 1;
                                    musicVideoQuery.isChunked = false
                                }
                            }
                            tracksQuery.impressionGuid = this.mediaItem.impressionGuid;
                            WinJS.Promise.join({
                                tracksResult: tracksQuery.execute(), musicVideosResult: musicVideoQuery.execute()
                            }).then(this._setMarketplaceResult.bind(this), function showNotAvailable() {
                                this.actionDescription = String.load(String.id.IDS_DETAILS_TOP_SONGS);
                                this._addButtons({playAll: MS.Entertainment.ViewModels.SmartBuyButtons.createButtonContentNotAvailable(MS.Entertainment.UI.Actions.ExecutionLocation.canvas)})
                            }.bind(this));
                            this.playbackItemSource = this.mediaItem
                        }.bind(this))
                    }, _showPlaylist: function _showPlaylist(param) {
                        this.dispatchEvent("showplaylist", param)
                    }, _setMarketplaceResult: function _setMarketplaceResult(queryResult) {
                        var hasVideos = queryResult.musicVideosResult !== null && queryResult.musicVideosResult.result.totalCount > 0;
                        if (queryResult.tracksResult.result.totalCount > 0) {
                            this.actionDescription = String.load(String.id.IDS_DETAILS_TOP_SONGS);
                            this._addButtons(MS.Entertainment.ViewModels.SmartBuyButtons.getArtistImmersiveDetailsButtonsDefault(this.mediaItem, false, null, true, hasVideos));
                            this._setResult(queryResult.tracksResult)
                        }
                        else
                            this._addButtons(MS.Entertainment.ViewModels.SmartBuyButtons.getArtistImmersiveDetailsButtonsDefault(this.mediaItem, false, null, false, hasVideos))
                    }, _setResult: function _setResult(query) {
                        var buttons = MS.Entertainment.ViewModels.SmartBuyButtons.getArtistImmersiveDetailsButtonsViewPlaylist(this.mediaItem);
                        if (buttons && buttons.viewPlaylist && buttons.viewPlaylist.invoker) {
                            if (this._eventHandler) {
                                this._eventHandler.cancel();
                                this._eventHandler = null
                            }
                            this._eventHandler = MS.Entertainment.Utilities.addEvents(buttons.viewPlaylist.invoker, {invoked: this._showPlaylist.bind(this)})
                        }
                        this._addButtons(buttons);
                        this.playlist = query.result.items
                    }
            })
    }),
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {MusicVideoList: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.NowPlayingPlaylist", "/Components/Immersive/Music2/ArtistVideos.html#artistDetailsVideoControl")})
})()
