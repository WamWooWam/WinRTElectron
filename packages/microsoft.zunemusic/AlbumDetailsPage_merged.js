/* Copyright (C) Microsoft Corporation. All rights reserved. */
/* >>>>>>/controls/music1/albumdetailsview.js:2 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p];
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    };

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var UI;
        (function(UI) {
            var Controls;
            (function(Controls) {
                var AlbumDetailsView = (function(_super) {
                        __extends(AlbumDetailsView, _super);
                        function AlbumDetailsView(element, options) {
                            _super.call(this, element, options);
                            MS.Entertainment.UI.Framework.processDeclarativeControlContainer(this)
                        }
                        AlbumDetailsView.prototype.onShowAllTracksInvoked = function(event) {
                            var viewModel = this.dataContext;
                            this.invokeActionForEvent(event, function() {
                                return viewModel && viewModel.clearFilter()
                            })
                        };
                        AlbumDetailsView.prototype.onBuyAlbumInvoked = function(event) {
                            var viewModel = this.dataContext;
                            this.invokeActionForEvent(event, function() {
                                return viewModel && viewModel.invokePurchaseAlbum()
                            })
                        };
                        AlbumDetailsView.prototype.onNavigateAlbumInvoked = function(event) {
                            var viewModel = this.dataContext;
                            this.invokeActionForEvent(event, function() {
                                return viewModel && viewModel.invokeCatalogAlbum()
                            })
                        };
                        return AlbumDetailsView
                    })(Controls.PageViewBase);
                Controls.AlbumDetailsView = AlbumDetailsView
            })(Controls = UI.Controls || (UI.Controls = {}))
        })(UI = Entertainment.UI || (Entertainment.UI = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}));
WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.AlbumDetailsView)
})();
/* >>>>>>/viewmodels/music/albumdetailsviewmodelbase.js:56 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p];
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    };

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var ViewModels;
        (function(ViewModels) {
            (function(AlbumDetailsViewModelModuleKeys) {
                AlbumDetailsViewModelModuleKeys[AlbumDetailsViewModelModuleKeys["songsModule"] = 0] = "songsModule";
                AlbumDetailsViewModelModuleKeys[AlbumDetailsViewModelModuleKeys["musicVideosModule"] = 1] = "musicVideosModule";
                AlbumDetailsViewModelModuleKeys[AlbumDetailsViewModelModuleKeys["count"] = 2] = "count"
            })(ViewModels.AlbumDetailsViewModelModuleKeys || (ViewModels.AlbumDetailsViewModelModuleKeys = {}));
            var AlbumDetailsViewModelModuleKeys = ViewModels.AlbumDetailsViewModelModuleKeys;
            var AlbumDetailsViewModelBase = (function(_super) {
                    __extends(AlbumDetailsViewModelBase, _super);
                    function AlbumDetailsViewModelBase(album, filter, queryAlbumId, queryTrack) {
                        _super.call(this);
                        this._hasCatalogVersion = false;
                        this._hasNavigatedToCatalogVersion = false;
                        this._initialInvokedTrack = null;
                        this._shouldHydrateAlbumReview = false;
                        this.applyGlobalNotifications = true;
                        this._ensureAlbum(album, filter, queryAlbumId, queryTrack)
                    }
                    Object.defineProperty(AlbumDetailsViewModelBase.prototype, "album", {
                        get: function() {
                            return this.mediaItem
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(AlbumDetailsViewModelBase.prototype, "hasCatalogVersion", {
                        get: function() {
                            return this._hasCatalogVersion
                        }, set: function(value) {
                                if (value !== this._hasCatalogVersion) {
                                    this._updatePurchaseDetails();
                                    this.updateAndNotify("hasCatalogVersion", value)
                                }
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(AlbumDetailsViewModelBase.prototype, "hasLocalTracks", {
                        get: function() {
                            return this.album && this.album.localTracksCount > 0
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(AlbumDetailsViewModelBase.prototype, "purchaseDetails", {
                        get: function() {
                            return this._purchaseDetails
                        }, set: function(value) {
                                this.updateAndNotify("purchaseDetails", value);
                                this._purchaseDetails = value
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(AlbumDetailsViewModelBase.prototype, "songsModule", {
                        get: function() {
                            return this.modules && this.modules[0]
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(AlbumDetailsViewModelBase.prototype, "musicVideosModule", {
                        get: function() {
                            return this.modules && this.modules[1]
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(AlbumDetailsViewModelBase.prototype, "viewStateViewModel", {
                        get: function() {
                            if (!this._viewStateViewModel)
                                this._viewStateViewModel = this.createViewStateModel();
                            return this._viewStateViewModel
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(AlbumDetailsViewModelBase.prototype, "_musicRights", {
                        get: function() {
                            return this._albumRights
                        }, enumerable: true, configurable: true
                    });
                    AlbumDetailsViewModelBase.prototype.createViewStateModel = function() {
                        var viewStateItems = new Array;
                        viewStateItems[-2] = new ViewModels.ViewStateItem(String.load(String.id.IDS_MUSIC_OFFLINE_HEADER), String.load(String.id.IDS_MUSIC_OFFLINE_DETAILS), []);
                        viewStateItems[-1] = new ViewModels.ViewStateItem(String.load(String.id.IDS_MUSIC_ERROR_HEADER), String.load(String.id.IDS_MUSIC_ERROR_DETAILS), []);
                        return new ViewModels.ViewStateViewModel(viewStateItems)
                    };
                    AlbumDetailsViewModelBase.prototype.dispose = function() {
                        this._releaseModuleBindings();
                        if (this.songsModule)
                            this.songsModule.dispose();
                        if (this.musicVideosModule)
                            this.musicVideosModule.dispose();
                        _super.prototype.dispose.call(this)
                    };
                    AlbumDetailsViewModelBase.prototype.delayInitialize = function() {
                        _super.prototype.delayInitialize.call(this);
                        this._updatePurchaseDetails()
                    };
                    AlbumDetailsViewModelBase.prototype.invokeCatalogAlbum = function() {
                        this._navigateToMarketplaceAlbum()
                    };
                    AlbumDetailsViewModelBase.prototype.invokePurchaseAlbum = function() {
                        var actionService = Entertainment.ServiceLocator.getService(Entertainment.Services.actions);
                        var purchaseAction = actionService.getAction(Entertainment.UI.Actions.ActionIdentifiers.albumPurchase);
                        purchaseAction.automationId = Entertainment.UI.AutomationIds.albumPurchase;
                        purchaseAction.parameter = this.album;
                        purchaseAction.execute()
                    };
                    AlbumDetailsViewModelBase.prototype.isShowing = function(mediaItemId) {
                        var isShowing = false;
                        if (this.album)
                            if (Entertainment.Utilities.isValidLibraryId(mediaItemId))
                                isShowing = this.album.libraryId === mediaItemId;
                            else
                                isShowing = this.album.serviceId === mediaItemId;
                        return isShowing
                    };
                    AlbumDetailsViewModelBase.prototype.loadModules = function() {
                        if (!this.isOnline && !this.inCollection) {
                            this.viewStateViewModel.viewState = -2;
                            return
                        }
                        var isLocalAlbum = this.inCollection;
                        var isCatalogAlbum = this.hasServiceId;
                        if (!isLocalAlbum && !isCatalogAlbum) {
                            this.viewStateViewModel.viewState = -1;
                            ViewModels.fail("AlbumDetailsViewModelBase::loadModules. Album does not have an id.");
                            return
                        }
                        this.viewStateViewModel.viewState = 1;
                        if (isLocalAlbum)
                            this.viewStateViewModel.suppressLoadingSpinner = true;
                        this._cancelMediaItemHydration();
                        this._mediaItemHydratePromise = this.album.hydrate({
                            listenForDBUpdates: this.inCollection, skipTracks: true
                        });
                        this._createSmartBuyStateEngine();
                        this._hydrateAlbum();
                        if (!this._delayInitializeSmartBuyEngine)
                            this._initializeSmartBuyStateEngine(false)
                    };
                    AlbumDetailsViewModelBase.prototype.navigatedBackTo = function() {
                        if (this.inCollection && this._hasNavigatedToCatalogVersion) {
                            var navigation = Entertainment.ServiceLocator.getService(Entertainment.Services.winJSNavigation);
                            navigation.navigateToMoniker("mymusic", true, true);
                            this._hasNavigatedToCatalogVersion = false
                        }
                        if (this.songsModule)
                            this.songsModule.refreshItems()
                    };
                    AlbumDetailsViewModelBase.prototype._initializeModules = function() {
                        var _this = this;
                        this._releaseModuleBindings();
                        var songsView = this.inCollection ? 2 : 3;
                        this.modules = new Array(2);
                        this.modules[0] = new ViewModels.SongsModule(songsView, {defaultTrack: this._initialInvokedTrack});
                        this.listenForModuleViewStateChanges();
                        this._songsModuleViewStateBinding = Entertainment.UI.Framework.addEventHandlers(this.songsModule, {
                            moduleStateChanged: this._onSongsModuleViewStateChanged.bind(this), editMetadata: this._onEditMetadata.bind(this), findAlbumInfo: this._onEditMetadata.bind(this), purchaseTrackCompleted: this._updatePurchaseDetails.bind(this)
                        });
                        this.songsModule.onTrackAddedOrRemoved = function(newCount) {
                            if (newCount === 0)
                                _this._navigateBack();
                            else {
                                _this._updateFilterDetails();
                                _this._updateCatalogDetails()
                            }
                        };
                        this._songsModuleItemsBinding = WinJS.Binding.bind(this.songsModule, {itemsChanged: function() {
                                return _this._updateTrackBinding()
                            }});
                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicVideosEnabled)) {
                            var musicVideosView = this.inCollection ? 9 : 8;
                            this.modules[1] = new ViewModels.MusicVideosModule(musicVideosView);
                            this.musicVideosModule.isExcludedFromPageState = true;
                            this.musicVideosModule.lockModuleState();
                            this._musicVideosModuleItemsBinding = WinJS.Binding.bind(this.musicVideosModule, {itemsChanged: function() {
                                    return _this._updateMusicVideosBinding()
                                }})
                        }
                    };
                    AlbumDetailsViewModelBase.prototype._onNetworkStatusChanged = function() {
                        this._updateCatalogDetails();
                        this._updatePurchaseDetails();
                        _super.prototype._onNetworkStatusChanged.call(this)
                    };
                    AlbumDetailsViewModelBase.prototype._getContainingMediaContextOptions = function() {
                        return {
                                playbackItemSource: this.mediaItem, playbackOffset: 0, dontUseTrackListForPlayback: true
                            }
                    };
                    AlbumDetailsViewModelBase.prototype._getSmartBuyEngineAppBarHandlers = function() {
                        return {
                                deleteMedia: this._onMediaItemDeletion.bind(this), subscriptionAddToMyMusic: this._refreshHeaderAndItems.bind(this), addToMyMusic: this._refreshHeaderAndItems.bind(this), addToPlaylist: this._refreshHeaderAndItems.bind(this), editMetadata: this._onEditMetadata.bind(this), findAlbumInfo: this._onEditMetadata.bind(this), purchase: this._refreshHeaderAndItems.bind(this)
                            }
                    };
                    AlbumDetailsViewModelBase.prototype._getSmartBuyEngineEventHandler = function() {
                        return this._onAlbumDetailsStateChanged.bind(this)
                    };
                    AlbumDetailsViewModelBase.prototype._getSmartBuyEngineButtons = function() {
                        ViewModels.fail("AlbumDetailsViewModelBase::_getSmartBuyEngineButtons. No buttons specified for the Smart Buy Engine.")
                    };
                    AlbumDetailsViewModelBase.prototype._getTracksForSmartBuyEngine = function() {
                        return this.songsModule.items
                    };
                    AlbumDetailsViewModelBase.prototype._initializeLocalNotifications = function() {
                        var notifications = [];
                        var signInService = Entertainment.ServiceLocator.getService(Entertainment.Services.signIn);
                        var userHasExplicitPrivilege = signInService.isSignedIn && signInService.hasExplicitPrivilege;
                        if (this.album && this.album.isExplicit && !userHasExplicitPrivilege && this._appState && this._appState.isExplicitBlocked) {
                            var explicitNotification = new Entertainment.UI.Notification;
                            explicitNotification.category = Entertainment.UI.NotificationCategoryEnum.explicitPrivileges;
                            explicitNotification.icon = explicitNotification.category.icon;
                            explicitNotification.subTitle = String.empty;
                            explicitNotification.dismissIcon = String.empty;
                            explicitNotification.actions = [Entertainment.UI.Actions.ActionIdentifiers.externalNavigate];
                            explicitNotification.actionParamsArray = [{
                                    parameter: {
                                        link: Entertainment.Endpoint.load(Entertainment.Endpoint.id.seid_XBoxLiveSSL) + "/Account/Settings", automationId: Entertainment.UI.AutomationIds.settingsAccountPrivacy
                                    }, title: String.load(String.id.IDS_MUSIC_EXPLORE_CHILD_EXPLICIT_BANNER_NOTIFICATION_BODY)
                                }];
                            if (this._albumRights.allTracksExplicit) {
                                explicitNotification.title = String.load(String.id.IDS_MUSIC_ALBUM_DETAILS_CHILD_EXPLICIT_BANNER_NOTIFICATION_TITLE);
                                explicitNotification.automationId = Entertainment.UI.AutomationIds.explicitAlbumNotification
                            }
                            else {
                                explicitNotification.title = String.load(String.id.IDS_MUSIC_ALBUM_DETAILS_CHILD_EXPLICIT_PARTIAL_BANNER_NOTIFICATION_TITLE);
                                explicitNotification.automationId = Entertainment.UI.AutomationIds.explicitAlbumMixedNotification
                            }
                            notifications.push(explicitNotification)
                        }
                        return WinJS.Promise.as(notifications)
                    };
                    AlbumDetailsViewModelBase.prototype._refreshDetailString = function() {
                        if (!this.album)
                            return;
                        var metadataLines = [];
                        if (this.album.artistName)
                            metadataLines.push(this.album.artistName);
                        if (this.album.releaseDate) {
                            var formattedYear = Entertainment.ServiceLocator.getService(Entertainment.Services.dateTimeFormatters).year;
                            metadataLines.push(formattedYear.format(this.album.releaseDate))
                        }
                        if (this.album.primaryGenreName)
                            metadataLines.push(this.album.primaryGenreName);
                        else if (this.album.genreName)
                            metadataLines.push(this.album.genreName);
                        if (this.album.label)
                            metadataLines.push(this.album.label);
                        this.mediaItemDetails = metadataLines.join(String.load(String.id.IDS_DETAILS_METADATA_SEPERATOR))
                    };
                    AlbumDetailsViewModelBase.prototype._reloadFilteredModules = function() {
                        if (this.songsModule)
                            this.songsModule.load()
                    };
                    AlbumDetailsViewModelBase.prototype._updateCatalogDetails = function() {
                        var _this = this;
                        if (this.inCollection && this.hasServiceId && this.isOnline) {
                            var marketplaceTrackCount = 0;
                            var libraryTrackCount = 0;
                            var albumSongsQuery = new Entertainment.Data.Query.Music.AlbumWithTracks;
                            albumSongsQuery.id = this.album.serviceId;
                            albumSongsQuery.idType = this.album.serviceIdType;
                            albumSongsQuery.execute().done(function(queryResult) {
                                albumSongsQuery.dispose();
                                marketplaceTrackCount = WinJS.Utilities.getMember("result.item.tracks.count", queryResult);
                                libraryTrackCount = _this.songsModule && _this.songsModule.count;
                                _this.hasCatalogVersion = marketplaceTrackCount > libraryTrackCount
                            }, function(error) {
                                albumSongsQuery.dispose();
                                _this.hasCatalogVersion = false
                            })
                        }
                        else
                            this.hasCatalogVersion = false
                    };
                    AlbumDetailsViewModelBase.prototype._updateFilterDetails = function() {
                        var _this = this;
                        if (!this.album || !this.inCollection || !this.songsModule || this.collectionFilter === Microsoft.Entertainment.Platform.MediaAvailability.available) {
                            this.updateAndNotify("filterDetails", String.empty);
                            return
                        }
                        var unfilteredQuery = new Entertainment.Data.Query.libraryTracks;
                        unfilteredQuery.albumId = this.album.libraryId;
                        unfilteredQuery.executeCount().done(function(unfilteredTrackCount) {
                            unfilteredQuery.dispose();
                            var currentTrackCount = _this.songsModule && _this.songsModule.count;
                            if (unfilteredTrackCount > currentTrackCount) {
                                var filter;
                                switch (_this.collectionFilter) {
                                    case Microsoft.Entertainment.Platform.MediaAvailability.availableOffline:
                                        filter = String.load(String.id.IDS_DETAILS_FILTER_AVAILABLE_OFFLINE);
                                        break;
                                    case Microsoft.Entertainment.Platform.MediaAvailability.availableFromCloud:
                                        filter = String.load(String.id.IDS_DETAILS_FILTER_IN_CLOUD);
                                        break;
                                    case Microsoft.Entertainment.Platform.MediaAvailability.availableFromCloudOnly:
                                        filter = String.load(String.id.IDS_DETAILS_FILTER_STREAMING);
                                        break;
                                    case Microsoft.Entertainment.Platform.MediaAvailability.musicPass:
                                        filter = String.load(String.id.IDS_DETAILS_FILTER_FROM_XBOX_MUSIC);
                                        break;
                                    case Microsoft.Entertainment.Platform.MediaAvailability.oneDrive:
                                        filter = String.load(String.id.IDS_DETAILS_FILTER_ON_ONEDRIVE);
                                        break;
                                    case Microsoft.Entertainment.Platform.MediaAvailability.thisDeviceOnly:
                                        filter = String.load(String.id.IDS_DETAILS_FILTER_ON_PC);
                                        break;
                                    default:
                                        filter = String.empty;
                                        break
                                }
                                _this.updateAndNotify("filterDetails", filter)
                            }
                        }, function(error) {
                            unfilteredQuery.dispose();
                            Entertainment.UI.assert(!error || WinJS.Promise.isCanceledError(error), "AlbumDetailsViewModelBaseBase::_updateFilterDetails. Failed to executeCount. Error message: " + (error && error.message), String.empty, Entertainment.UI.Debug.errorLevel.low)
                        })
                    };
                    AlbumDetailsViewModelBase.prototype._updatePurchaseDetails = function() {
                        var _this = this;
                        if (!this.hasServiceId || !this.isOnline || !this.isDelayInitialized) {
                            this.purchaseDetails = String.empty;
                            return
                        }
                        ViewModels.SmartBuyStateEngine.getMarketplaceFileAccessAsync(this.album).done(function(albumProperties) {
                            var mediaIds = albumProperties.mediaIds;
                            var tracksAvailable = albumProperties.mediaIds ? albumProperties.mediaIds.length : 0;
                            var tracksPurchased = albumProperties.hasPurchased ? albumProperties.hasPurchased : 0;
                            if (tracksPurchased < tracksAvailable) {
                                var matchingRights = ViewModels.SmartBuyStateHandlers.getMatchingRights(_this.album, Entertainment.Utilities.defaultClientTypeFromApp, [ViewModels.SmartBuyStateHandlers.MarketplaceRight.AlbumPurchase], {
                                        freeOnly: false, excludeFree: false
                                    });
                                if (matchingRights && matchingRights[0]) {
                                    var offer = matchingRights[0];
                                    if (offer && offer.displayPrice)
                                        if (offer.price === 0)
                                            _this.purchaseDetails = String.load(String.id.IDS_MUSIC_DTO_BUY_FREE_TEXT);
                                        else
                                            _this.purchaseDetails = String.load(String.id.IDS_MUSIC_DTO_BUY_ALBUM_TEXT).format(offer.displayPrice)
                                }
                            }
                            else
                                _this.purchaseDetails = String.empty
                        }, function(error) {
                            _this.purchaseDetails = String.empty
                        })
                    };
                    AlbumDetailsViewModelBase.prototype._ensureAlbum = function(album, filter, queryAlbumId, queryTrack) {
                        var _this = this;
                        if (!queryAlbumId && queryTrack && queryTrack.album)
                            queryAlbumId = queryTrack.album.inCollection ? queryTrack.album.libraryId : queryTrack.album.zuneId;
                        if (queryAlbumId && Entertainment.Utilities.isValidGuid(queryAlbumId)) {
                            if (queryTrack)
                                this._initialInvokedTrack = queryTrack;
                            var albumQuery = new Entertainment.Data.Query.Music.AlbumDetails;
                            albumQuery.id = queryAlbumId;
                            albumQuery.idType = Entertainment.Data.Query.edsIdType.zuneCatalog;
                            this.mediaItemPromise = albumQuery.execute().then(function(response) {
                                albumQuery.dispose();
                                if (response.result.item)
                                    _this.mediaItem = response.result.item.clone();
                                else
                                    ViewModels.fail("AlbumDetailsViewModelBase::_ensureAlbum. Failed to get an album media item using the service id " + queryAlbumId)
                            }, function(error) {
                                albumQuery.dispose();
                                ViewModels.fail("AlbumDetailsViewModelBase::_ensureAlbum. Failed to get an album media item.  Error message: " + (error && error.message))
                            })
                        }
                        else if (queryAlbumId && Entertainment.Utilities.isValidLibraryId(queryAlbumId)) {
                            if (queryTrack)
                                this._initialInvokedTrack = queryTrack;
                            var localAlbumQuery = new Entertainment.Data.Query.libraryAlbums;
                            localAlbumQuery.albumId = queryAlbumId;
                            localAlbumQuery.chunkSize = 1;
                            localAlbumQuery.chunked = false;
                            this.mediaItemPromise = localAlbumQuery.execute().then(function(response) {
                                localAlbumQuery.dispose();
                                if (response.result.primaryAlbum)
                                    _this.mediaItem = response.result.primaryAlbum;
                                else
                                    ViewModels.fail("AlbumDetailsViewModelBase::_ensureAlbum. Failed to get an album media item using the library id " + queryAlbumId)
                            }, function(error) {
                                localAlbumQuery.dispose();
                                ViewModels.fail("AlbumDetailsViewModelBase::_ensureAlbum. Failed to get an album media item.  Error message: " + (error && error.message))
                            })
                        }
                        else if (queryTrack)
                            this.mediaItemPromise = queryTrack.hydrate({forceUpdate: true}).then(function(hydratedTrack) {
                                if (!hydratedTrack)
                                    ViewModels.fail("AlbumDetailsViewModelBase::_ensureAlbum. Hydration of track failed.");
                                else {
                                    _this._initialInvokedTrack = hydratedTrack;
                                    var album = hydratedTrack.album;
                                    if (album) {
                                        _this.mediaItem = album.clone();
                                        if (hydratedTrack.inCollection)
                                            _this.album.libraryId = album.libraryId
                                    }
                                    else
                                        ViewModels.fail("AlbumDetailsViewModelBase::_ensureAlbum. Album not found on hydrated track.")
                                }
                            }, function(error) {
                                ViewModels.fail("AlbumDetailsViewModelBase::_ensureAlbum. Failed to get an album media item from track.  Error message: " + (error && error.message))
                            });
                        else {
                            ViewModels.assert(album, "AlbumDetailsViewModelBase::_ensureAlbum. An album media item is required.");
                            this.mediaItem = album.clone()
                        }
                        this.mediaItemPromise = this.mediaItemPromise.then(function() {
                            _this._initializeModules();
                            _this.collectionFilter = filter;
                            _this._updatePurchaseDetails()
                        })
                    };
                    AlbumDetailsViewModelBase.prototype._hydrateAlbum = function() {
                        var _this = this;
                        var albumPromise;
                        var isLocalAlbum = this.inCollection;
                        if (isLocalAlbum || (this.album.hasCanonicalId && this.album.hydrated))
                            albumPromise = WinJS.Promise.as(this.album);
                        else
                            albumPromise = this._mediaItemHydratePromise;
                        albumPromise.then(function(hydratedAlbum) {
                            if (!hydratedAlbum || hydratedAlbum.isFailed)
                                return WinJS.Promise.wrapError(new Error("AlbumDetailsViewModelBase::_hydrateAlbum. Hydration failed."));
                            _this.mediaItem = hydratedAlbum;
                            if (isLocalAlbum)
                                _this.songsModule.parentMediaId = _this.album.libraryId;
                            else if (_this.album.hasCanonicalId) {
                                _this.songsModule.parentMediaId = _this.album.canonicalId;
                                _this.songsModule.parentMediaServiceIdType = Entertainment.Data.Query.edsIdType.canonical
                            }
                            else
                                return WinJS.Promise.wrapError(new Error("AlbumDetailsViewModelBase::_hydrateAlbum. Album does not have a library or canonical id."));
                            _this.songsModule.load();
                            if (_this.musicVideosModule) {
                                _this.musicVideosModule.parentMediaItem = hydratedAlbum;
                                _this.musicVideosModule.load()
                            }
                        }, function(error) {
                            return WinJS.Promise.wrapError(new Error("AlbumDetailsViewModelBase::_hydrateAlbum. Album hydrate query failed with the following error: " + (error && error.message)))
                        }).then(function() {
                            if (_this._shouldHydrateAlbumReview)
                                return _this._hydrateAlbumReview()
                        }).done(null, function(error) {
                            _this.viewStateViewModel.viewState = -1;
                            ViewModels.fail("AlbumDetailsViewModelBase::_hydrateAlbum. Unexpected error: " + (error && error.message))
                        })
                    };
                    AlbumDetailsViewModelBase.prototype._hydrateAlbumReview = function() {
                        var _this = this;
                        var returnPromise;
                        if (!this.album.criticReview) {
                            var reviewQuery = new MS.Entertainment.Data.Query.Music.AlbumReview;
                            reviewQuery.id = this.mediaItem.serviceId;
                            reviewQuery.impressionGuid = this.mediaItem.impressionGuid;
                            reviewQuery.idType = this.mediaItem.serviceIdType;
                            returnPromise = reviewQuery.execute().then(function(q) {
                                reviewQuery.dispose();
                                if (q.result.item) {
                                    _this.album.criticReview = q.result.item.criticReview;
                                    _this.album.criticReviewNoTags = q.result.item.criticReviewNoTags
                                }
                            }, function(error) {
                                reviewQuery.dispose();
                                return error
                            })
                        }
                        return WinJS.Promise.as(returnPromise)
                    };
                    AlbumDetailsViewModelBase.prototype._navigateBack = function() {
                        var navigationService;
                        if (Entertainment.ServiceLocator.isServiceRegistered(Entertainment.Services.navigation))
                            navigationService = Entertainment.ServiceLocator.getService(Entertainment.Services.navigation);
                        else if (Entertainment.ServiceLocator.isServiceRegistered(Entertainment.Services.winJSNavigation))
                            navigationService = Entertainment.ServiceLocator.getService(Entertainment.Services.winJSNavigation);
                        Entertainment.UI.assert(navigationService, "No navigation service registered.");
                        if (navigationService) {
                            this._disposeSmartBuyStateEngine();
                            this.songsModule.onTrackAddedOrRemoved = null;
                            navigationService.navigateBack()
                        }
                    };
                    AlbumDetailsViewModelBase.prototype._navigateToMarketplaceAlbum = function() {
                        if (!this.hasServiceId)
                            return;
                        var navigation = Entertainment.ServiceLocator.getService(Entertainment.Services.winJSNavigation);
                        navigation.navigateToMoniker("explore", true, true);
                        var actionService = Entertainment.ServiceLocator.getService(Entertainment.Services.actions);
                        var albumDetailsNavigateAction = actionService.getAction(Entertainment.UI.Actions.ActionIdentifiers.albumDetailsNavigate);
                        albumDetailsNavigateAction.parameter = {
                            data: this.album.serviceId, forceNavigation: true, location: Entertainment.Data.ItemLocation.marketplace
                        };
                        albumDetailsNavigateAction.execute();
                        this._hasNavigatedToCatalogVersion = true
                    };
                    AlbumDetailsViewModelBase.prototype._onAlbumDetailsStateChanged = function(engine, stateInfo) {
                        var _this = this;
                        this._appState = ViewModels._MusicState.getCurrentState(engine.media, stateInfo);
                        var playabilityCounts = WinJS.Utilities.getMember("collection.playability.counts", stateInfo);
                        this._updateTrackLocationValues(playabilityCounts);
                        ViewModels.MusicSmartBuyStateHandlers.getAlbumRights(engine.media).then(function(rights) {
                            _this._albumRights = rights
                        }, function(error) {
                            ViewModels.fail("AlbumDetailsViewModelBase::_onAlbumDetailsStateChanged. Failed to get album rights. Error:" + error && error.message)
                        }).done(function() {
                            _this._reinitializeNotificationList()
                        }, function(error) {
                            ViewModels.fail("AlbumDetailsViewModelBase::_onAlbumDetailsStateChanged. Failed to get album rights. Error:" + error && error.message)
                        });
                        var musicStateHandler = Entertainment.ServiceLocator.getService(Entertainment.Services.musicStateHandler);
                        return musicStateHandler.onAlbumDetailsStateChanged(engine, stateInfo)
                    };
                    AlbumDetailsViewModelBase.prototype._onEditMetadata = function() {
                        var _this = this;
                        if (this.album && this.album.fromCollection) {
                            var query = new Entertainment.Data.Query.Music.LibraryAlbum;
                            query.albumId = this.album.libraryId;
                            query.execute().then(function() {
                                if (query.result) {
                                    _this.mediaItem = query.result.item;
                                    _this.loadModules()
                                }
                            }, function(error) {
                                ViewModels.fail("AlbumDetailsViewModelBase::_onEditMetadata. Updating album metadata after edit failed. error: " + (error && error.message))
                            }).done(function() {
                                query.dispose()
                            })
                        }
                    };
                    AlbumDetailsViewModelBase.prototype._onMediaItemDeletion = function(deletionEvent) {
                        if (deletionEvent.detail && deletionEvent.detail.deleted && deletionEvent.detail.removedItem && deletionEvent.detail.removedItem.isEqual(this.album))
                            this._navigateBack()
                    };
                    AlbumDetailsViewModelBase.prototype._onSongsModuleViewStateChanged = function(event) {
                        var viewState = event.detail.newValue;
                        if (viewState === 2 && this._delayInitialized)
                            this._initializeSmartBuyStateEngine(false);
                        else if (!this._delayInitializeSmartBuyEngine)
                            this._applyPropertiesToHydratedMedia();
                        if (Entertainment.Utilities.ViewState.isStateCompleted(this.songsModule.moduleState) && this.musicVideosModule)
                            this.musicVideosModule.unLockModuleState()
                    };
                    AlbumDetailsViewModelBase.prototype._refreshHeaderAndItems = function(appBarActionId) {
                        if (this.songsModule)
                            this.songsModule.refreshItems();
                        if (appBarActionId && appBarActionId.type === Entertainment.UI.Actions.ActionIdentifiers.purchase)
                            this.purchaseDetails = String.empty
                    };
                    AlbumDetailsViewModelBase.prototype._releaseModuleBindings = function() {
                        if (this._songsModuleItemsBinding) {
                            this._songsModuleItemsBinding.cancel();
                            this._songsModuleItemsBinding = null
                        }
                        if (this._songsModuleViewStateBinding) {
                            this._songsModuleViewStateBinding.cancel();
                            this._songsModuleViewStateBinding = null
                        }
                        if (this._musicVideosModuleItemsBinding) {
                            this._musicVideosModuleItemsBinding.cancel();
                            this._musicVideosModuleItemsBinding = null
                        }
                    };
                    AlbumDetailsViewModelBase.prototype._updateTrackBinding = function() {
                        this.dispatchChangeAndNotify("songsModule", this.songsModule, this.songsModule)
                    };
                    AlbumDetailsViewModelBase.prototype._updateMusicVideosBinding = function() {
                        this.dispatchChangeAndNotify("musicVideosModule", this.musicVideosModule, this.musicVideosModule)
                    };
                    return AlbumDetailsViewModelBase
                })(ViewModels.MusicDetailsPageViewModelBase);
            ViewModels.AlbumDetailsViewModelBase = AlbumDetailsViewModelBase;
            var AlbumDetailsViewModelBaseFactory = (function() {
                    function AlbumDetailsViewModelBaseFactory(){}
                    AlbumDetailsViewModelBaseFactory.create = function(options) {
                        var mediaItem = options.mediaItem;
                        var queryAlbumId;
                        var queryTrack;
                        if (options.isTrack)
                            queryTrack = mediaItem;
                        else if (Entertainment.Utilities.isValidGuid(mediaItem) || Entertainment.Utilities.isValidLibraryId(mediaItem))
                            queryAlbumId = mediaItem;
                        return new ViewModels.AlbumDetailsViewModel(mediaItem, options.filter, queryAlbumId, queryTrack)
                    };
                    return AlbumDetailsViewModelBaseFactory
                })();
            ViewModels.AlbumDetailsViewModelBaseFactory = AlbumDetailsViewModelBaseFactory
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/music1/albumdetailsviewmodel.js:655 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p];
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    };

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var ViewModels;
        (function(ViewModels) {
            var AlbumDetailsViewModel = (function(_super) {
                    __extends(AlbumDetailsViewModel, _super);
                    function AlbumDetailsViewModel() {
                        _super.apply(this, arguments)
                    }
                    AlbumDetailsViewModel.prototype.delayInitialize = function() {
                        this._mediaRightsConditions = new ViewModels.AlbumRestrictionCollection;
                        _super.prototype.delayInitialize.call(this)
                    };
                    AlbumDetailsViewModel.prototype._initializeLocalNotifications = function() {
                        var _this = this;
                        var album = this.mediaItem;
                        return _super.prototype._initializeLocalNotifications.call(this).then(function(notifications) {
                                if (!_this.isOnline && album && album.inCollection && _this.collectionFilter !== Microsoft.Entertainment.Platform.MediaAvailability.availableOffline && !_this._allTracksLocal) {
                                    var offlineNotification;
                                    if (_this._allTracksStreaming) {
                                        offlineNotification = Entertainment.UI.ListNotification.createNotification(Entertainment.UI.NotificationCategoryEnum.networkStatus, String.load(String.id.IDS_MUSIC_ALBUM_DETAILS_OFFLINE_BANNER_NOTIFICATION_TITLE), String.load(String.id.IDS_MUSIC_DETAILS_OFFLINE_BANNER_NOTIFICATION_BODY));
                                        offlineNotification.automationId = Entertainment.UI.AutomationIds.offlineFullyStreamingAlbumNotification;
                                        notifications.push(offlineNotification)
                                    }
                                    else if (_this._someTracksStreamingSomeLocal) {
                                        offlineNotification = Entertainment.UI.ListNotification.createNotification(Entertainment.UI.NotificationCategoryEnum.networkStatus, String.load(String.id.IDS_MUSIC_ALBUM_DETAILS_OFFLINE_PARTIAL_BANNER_NOTIFICATION_TITLE), String.empty, [Entertainment.UI.Actions.ActionIdentifiers.notificationDetailsNetworkStatus], [{title: String.load(String.id.IDS_MUSIC_DETAILS_OFFLINE_PARTIAL_BANNER_NOTIFICATION_BODY)}]);
                                        offlineNotification.automationId = Entertainment.UI.AutomationIds.offlinePartiallyStreamingAlbumNotification;
                                        notifications.push(offlineNotification)
                                    }
                                }
                                var bestCondition;
                                var bestConditionNotification = new Entertainment.UI.Notification;
                                if (_this._mediaRightsConditions)
                                    bestCondition = _this._mediaRightsConditions.getLeastRestrictive(_this.mediaItem, _this._musicRights);
                                if (bestCondition && bestCondition.title) {
                                    bestConditionNotification = Entertainment.UI.ListNotification.createNotification(Entertainment.UI.NotificationCategoryEnum.playbackPrivileges, bestCondition.title, bestCondition.description, Entertainment.UI.AutomationIds.offlinePartiallyStreamingAlbumNotification);
                                    bestConditionNotification.icon = bestCondition.actionIcon;
                                    bestConditionNotification.actions = [bestCondition.actionId];
                                    bestConditionNotification.actionParamsArray = [bestCondition.getActionOptions(_this.mediaItem)];
                                    notifications.push(bestConditionNotification)
                                }
                                return notifications
                            })
                    };
                    AlbumDetailsViewModel.prototype._getSmartBuyEngineButtons = function() {
                        return ViewModels.SmartBuyButtons.getAlbumDetailsButtonsLX(this.album, Entertainment.UI.Actions.ExecutionLocation.canvas, this._genericPlayButton)
                    };
                    return AlbumDetailsViewModel
                })(ViewModels.AlbumDetailsViewModelBase);
            ViewModels.AlbumDetailsViewModel = AlbumDetailsViewModel
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
