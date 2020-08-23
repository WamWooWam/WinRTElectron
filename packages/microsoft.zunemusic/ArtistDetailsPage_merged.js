/* Copyright (C) Microsoft Corporation. All rights reserved. */
/* >>>>>>/controls/music1/artistdetailsview.js:2 */
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
                MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls");
                var ArtistDetailsView = (function(_super) {
                        __extends(ArtistDetailsView, _super);
                        function ArtistDetailsView(element, options) {
                            var _this = this;
                            _super.call(this, element, options);
                            UI.Framework.processDeclarativeControlContainer(this).done(function() {
                                _this._eventHandlers = Entertainment.Utilities.addEventHandlers(_this.domElement, {imageLoadComplete: _this._onImageLoadComplete.bind(_this)});
                                _this._selfEventHandlers = Entertainment.Utilities.addEventHandlers(_this, {dataContextChanged: _this._onDataContextChanged.bind(_this)});
                                _this._onDataContextChanged()
                            }, function(error) {
                                MS.Entertainment.UI.Controls.fail("ArtistDetailsView() Unexcepted processDeclarativeControlContainer failure. error: " + (error && error.message))
                            });
                            if (this.enableAutoScroll)
                                this._enableFocusEventHandlers("details-layoutRoot")
                        }
                        ArtistDetailsView.prototype.unload = function() {
                            _super.prototype.unload.call(this);
                            if (this._eventHandlers) {
                                this._eventHandlers.cancel();
                                this._eventHandlers = null
                            }
                            if (this._selfEventHandlers) {
                                this._selfEventHandlers.cancel();
                                this._selfEventHandlers = null
                            }
                        };
                        ArtistDetailsView.prototype._onImageLoadComplete = function(args) {
                            if (!this.domElement)
                                return;
                            var loadedImage = args && args.detail && args.detail.loaded;
                            if (!loadedImage)
                                WinJS.Utilities.addClass(this.domElement, "state_artistArtNone");
                            else
                                WinJS.Utilities.removeClass(this.domElement, "state_artistArtNone")
                        };
                        ArtistDetailsView.prototype._onDataContextChanged = function() {
                            if (this._getHasNoPossibleHeaderImage())
                                WinJS.Utilities.addClass(this.domElement, "state_artistArtNone")
                        };
                        ArtistDetailsView.prototype._getHasNoPossibleHeaderImage = function() {
                            var hasNoPossibleHeaderImage = false;
                            if (this.dataContext && this.dataContext instanceof Entertainment.ViewModels.ArtistDetailsViewModelBase)
                                hasNoPossibleHeaderImage = this.dataContext.hasNoPossibleHeaderImage;
                            return hasNoPossibleHeaderImage
                        };
                        return ArtistDetailsView
                    })(Controls.PageViewBase);
                Controls.ArtistDetailsView = ArtistDetailsView
            })(Controls = UI.Controls || (UI.Controls = {}))
        })(UI = Entertainment.UI || (Entertainment.UI = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}));
WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.ArtistDetailsView)
})();
/* >>>>>>/viewmodels/music/artistdetailsviewmodelbase.js:78 */
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
            (function(ArtistDetailsViewModelModuleKeys) {
                ArtistDetailsViewModelModuleKeys[ArtistDetailsViewModelModuleKeys["marketplaceAlbumsModule"] = 0] = "marketplaceAlbumsModule";
                ArtistDetailsViewModelModuleKeys[ArtistDetailsViewModelModuleKeys["topSongsModule"] = 1] = "topSongsModule";
                ArtistDetailsViewModelModuleKeys[ArtistDetailsViewModelModuleKeys["relatedArtistsModule"] = 2] = "relatedArtistsModule"
            })(ViewModels.ArtistDetailsViewModelModuleKeys || (ViewModels.ArtistDetailsViewModelModuleKeys = {}));
            var ArtistDetailsViewModelModuleKeys = ViewModels.ArtistDetailsViewModelModuleKeys;
            var ArtistDetailsViewModelBase = (function(_super) {
                    __extends(ArtistDetailsViewModelBase, _super);
                    function ArtistDetailsViewModelBase(artist, collectionFilter) {
                        _super.call(this);
                        this._moduleViewStateListener = null;
                        this._mediaItemLibraryIdBinding = null;
                        this._viewStateViewModel = null;
                        this._biography = String.empty;
                        MS.Entertainment.ViewModels.assert(artist, "An artist media item is required.");
                        this._collectionFilter = collectionFilter;
                        this._featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        this._mediaItem = artist.clone();
                        this.hasNoPossibleHeaderImage = !this._mediaItem || !this._mediaItem.imageResizeUri;
                        this._initializeModules();
                        this._localAlbumsQuery = new Entertainment.Data.Query.libraryAlbums;
                        this._localTracksQuery = new Entertainment.Data.Query.libraryTracks
                    }
                    Object.defineProperty(ArtistDetailsViewModelBase.prototype, "collectionFilter", {
                        get: function() {
                            return this._collectionFilter
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(ArtistDetailsViewModelBase.prototype, "localAlbums", {
                        get: function() {
                            return this._localAlbums
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(ArtistDetailsViewModelBase.prototype, "marketplaceAlbums", {
                        get: function() {
                            return this.modules && this.modules[0]
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(ArtistDetailsViewModelBase.prototype, "topSongs", {
                        get: function() {
                            return this.modules && this.modules[1]
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(ArtistDetailsViewModelBase.prototype, "relatedArtists", {
                        get: function() {
                            return this.modules && this.modules[2]
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(ArtistDetailsViewModelBase.prototype, "mediaItem", {
                        get: function() {
                            return this._mediaItem
                        }, set: function(value) {
                                if (value !== this.mediaItem) {
                                    this.updateAndNotify("mediaItem", value);
                                    this._shareMediaItem();
                                    this.hasNoPossibleHeaderImage = !value || !value.imageResizeUri
                                }
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(ArtistDetailsViewModelBase.prototype, "primaryHeaderButtons", {
                        get: function() {
                            return this._primaryHeaderButtons
                        }, set: function(value) {
                                this.updateAndNotify("primaryHeaderButtons", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(ArtistDetailsViewModelBase.prototype, "myAlbumsButtons", {
                        get: function() {
                            return this._myAlbumsButtons
                        }, set: function(value) {
                                this.updateAndNotify("myAlbumsButtons", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(ArtistDetailsViewModelBase.prototype, "topSongsButtons", {
                        get: function() {
                            return this._topSongsButtons
                        }, set: function(value) {
                                this.updateAndNotify("topSongsButtons", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(ArtistDetailsViewModelBase.prototype, "hasNoPossibleHeaderImage", {
                        get: function() {
                            return this._hasNoPossibleHeaderImage
                        }, set: function(value) {
                                this.updateAndNotify("hasNoPossibleHeaderImage", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(ArtistDetailsViewModelBase.prototype, "headerImage", {
                        get: function() {
                            return this._headerImage
                        }, set: function(value) {
                                this.updateAndNotify("headerImage", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(ArtistDetailsViewModelBase.prototype, "biography", {
                        get: function() {
                            return this._biography
                        }, set: function(value) {
                                this.updateAndNotify("biography", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(ArtistDetailsViewModelBase.prototype, "viewStateViewModel", {
                        get: function() {
                            if (!this._viewStateViewModel) {
                                var viewStateItems = new Array;
                                viewStateItems[-2] = new ViewModels.ViewStateItem(String.load(String.id.IDS_MUSIC_OFFLINE_HEADER), String.load(String.id.IDS_MUSIC_OFFLINE_DETAILS), []);
                                viewStateItems[-1] = new ViewModels.ViewStateItem(String.load(String.id.IDS_MUSIC_ERROR_HEADER), String.load(String.id.IDS_MUSIC_ERROR_DETAILS), []);
                                this._viewStateViewModel = new ViewModels.ViewStateViewModel(viewStateItems)
                            }
                            return this._viewStateViewModel
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(ArtistDetailsViewModelBase.prototype, "skipListRendersForContentComplete", {
                        get: function() {
                            return !this._isMusicMarketplaceEnabled || !this.isOnline
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(ArtistDetailsViewModelBase.prototype, "filterDetails", {
                        get: function() {
                            return this._filterDetails
                        }, set: function(value) {
                                this.updateAndNotify("filterDetails", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(ArtistDetailsViewModelBase.prototype, "inCollection", {
                        get: function() {
                            return this.mediaItem && (this.mediaItem.inCollection || this.mediaItem.hasLibraryId)
                        }, enumerable: true, configurable: true
                    });
                    ArtistDetailsViewModelBase.prototype.dispose = function() {
                        this._disposeSmartBuyStateEngine();
                        this._disposeViewStateListeners();
                        this._releaseModules();
                        this._unshareMediaItem();
                        if (this._localAlbumsQuery)
                            this._localAlbumsQuery.dispose();
                        if (this._localTracksQuery)
                            this._localTracksQuery.dispose();
                        _super.prototype.dispose.call(this)
                    };
                    ArtistDetailsViewModelBase.prototype.loadModules = function() {
                        var _this = this;
                        if (!this.isOnline) {
                            this.viewStateViewModel.viewState = -2;
                            this.mediaItem.hydrate().done(function(artist) {
                                if (artist.isFailed) {
                                    _this.localAlbums.moduleState = -1;
                                    MS.Entertainment.ViewModels.fail("ArtistDetailsViewModelBase::loadModules: Failed to hydate mediaItem.")
                                }
                                else {
                                    _this.localAlbums.updateQuery({artistId: _this.mediaItem.libraryId});
                                    _this.localAlbums.load()
                                }
                            }, function(error) {
                                _this.localAlbums.moduleState = -1;
                                MS.Entertainment.ViewModels.fail("ArtistDetailsViewModelBase::loadModules: Failed to hydate mediaItem. Error message: " + (error && error.message))
                            });
                            return
                        }
                        this.viewStateViewModel.viewState = 1;
                        this.mediaItem = ViewModels.MediaItemModel.augment(this.mediaItem);
                        this.headerImage = Entertainment.UI.Shell.ImageLoader.getNewImageServiceUri(this.mediaItem, ArtistDetailsViewModelBase.DEFAULT_HEADER_IMAGE_SIZE.width, ArtistDetailsViewModelBase.DEFAULT_HEADER_IMAGE_SIZE.height, Entertainment.ImageSource.noAutoGenerated);
                        var getMediaIdPromise;
                        if (this.mediaItem.inCollection || this.mediaItem.hasCanonicalId)
                            getMediaIdPromise = WinJS.Promise.as(this.mediaItem);
                        else
                            getMediaIdPromise = this.mediaItem.hydrate();
                        var isLocalAlbumsLoaded = false;
                        getMediaIdPromise.then(function(artist) {
                            if (_this.mediaItem.inCollection) {
                                _this.localAlbums.updateQuery({artistId: _this.mediaItem.libraryId});
                                _this.localAlbums.reload();
                                isLocalAlbumsLoaded = true
                            }
                            if (_this._isMusicMarketplaceEnabled) {
                                _this.marketplaceAlbums.updateQuery({artistId: _this.mediaItem.canonicalId});
                                _this.marketplaceAlbums.moduleOptions.moduleActionFactoryParameter = _this.mediaItem;
                                _this.marketplaceAlbums.updateModuleAction();
                                _this.marketplaceAlbums.reload();
                                _this.topSongs.parentMediaId = _this.mediaItem.canonicalId;
                                _this.topSongs.parentMediaItem = _this.mediaItem;
                                _this.topSongs.trackLimit = ArtistDetailsViewModelBase.TOP_SONGS_LIMIT;
                                _this.topSongs.load()
                            }
                            return Entertainment.Utilities.schedulePromiseBelowNormal()
                        }).then(function() {
                            if (_this._isMusicMarketplaceEnabled) {
                                _this.relatedArtists.parentMediaItem = _this.mediaItem;
                                _this.relatedArtists.load()
                            }
                            return _this.mediaItem.hydrate({forceUpdate: true})
                        }).then(function() {
                            _this._shareMediaItem();
                            if (!isLocalAlbumsLoaded) {
                                _this.localAlbums.updateQuery({artistId: _this.mediaItem.libraryId});
                                _this.localAlbums.reload()
                            }
                            _this.biography = _this.mediaItem.description || String.empty
                        }, function(error) {
                            _this.viewStateViewModel.viewState = -1;
                            MS.Entertainment.ViewModels.fail("Failed to load ArtistDetails modules. Error message: " + (error && error.message))
                        })
                    };
                    ArtistDetailsViewModelBase.prototype._isNeededForPageReady = function(module) {
                        var result = _super.prototype._isNeededForPageReady.call(this, module);
                        result = result && (module !== this.relatedArtists) && (!this.mediaItem || !this.mediaItem.inCollection || module !== this.localAlbums);
                        return result
                    };
                    ArtistDetailsViewModelBase.prototype.delayInitialize = function() {
                        _super.prototype.delayInitialize.call(this);
                        this._delayInitialized = true;
                        if (this.topSongs && this.topSongs.items)
                            this.mediaItem.tracks = this.topSongs.items;
                        if (!this._smartBuyStateEngine)
                            this._initializeSmartBuyStateEngine();
                        if (this.localAlbums)
                            this.localAlbums.delayInitialize();
                        if (this.topSongs)
                            this.topSongs.delayInitialize();
                        if (this.marketplaceAlbums)
                            this.marketplaceAlbums.delayInitialize();
                        this._shareMediaItem()
                    };
                    ArtistDetailsViewModelBase.prototype.navigatedBackTo = function() {
                        ViewModels.MediaItemModel.hydrateLibraryInfoAsync(this._mediaItem);
                        this.modules.forEach(function(detailsModule) {
                            detailsModule.refreshItems()
                        })
                    };
                    ArtistDetailsViewModelBase.prototype.invokeShowAllCollectionAlbums = function() {
                        this._updateCollectionFilter(Microsoft.Entertainment.Platform.MediaAvailability.available);
                        this.localAlbums.reload();
                        this.filterDetails = String.empty
                    };
                    Object.defineProperty(ArtistDetailsViewModelBase.prototype, "_isMusicMarketplaceEnabled", {
                        get: function() {
                            return this._featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace)
                        }, enumerable: true, configurable: true
                    });
                    ArtistDetailsViewModelBase.prototype._initializeModules = function() {
                        this._localAlbums = ViewModels.AlbumsModuleFactory.createArtistLocalAlbumsModule(this.mediaItem, this._collectionFilter);
                        if (this._isMusicMarketplaceEnabled) {
                            var albumOptions = {shouldHydrateLibraryId: true};
                            this.modules = [ViewModels.AlbumsModuleFactory.createArtistAlbumsModule(this.mediaItem), new ViewModels.SongsModule(1), new ViewModels.ArtistsModule(1)];
                            this.listenForModuleViewStateChanges();
                            this._moduleViewStateListener = Entertainment.UI.Framework.addEventHandlers(this.topSongs, {moduleStateChanged: this._onTopSongsViewStateChanged.bind(this)})
                        }
                        this._moduleViewStateListener = Entertainment.UI.Framework.addEventHandlers(this._localAlbums, {moduleStateChanged: this._onLocalAlbumsViewStateChanged.bind(this)})
                    };
                    ArtistDetailsViewModelBase.prototype._initializeSmartBuyStateEngine = function() {
                        var _this = this;
                        this._disposeSmartBuyStateEngine();
                        var pageButtonSet = ViewModels.SmartBuyButtons.getArtistDetailsHeaderButtons(this.mediaItem, Entertainment.UI.Actions.ExecutionLocation.canvas);
                        var topSongsButtonSet = ViewModels.SmartBuyButtons.getArtistTopSongsButtons(this.mediaItem, Entertainment.UI.Actions.ExecutionLocation.canvas);
                        pageButtonSet = Entertainment.Utilities.uniteObjects(pageButtonSet, topSongsButtonSet);
                        if (this.mediaItem.inCollection)
                            pageButtonSet = Entertainment.Utilities.uniteObjects(pageButtonSet, this._getLocalAlbumsHeaderButtons(this.mediaItem.libraryId));
                        this._smartBuyStateEngine = new ViewModels.SmartBuyStateEngine;
                        var appBarService = Entertainment.ServiceLocator.getService(Entertainment.Services.appToolbar);
                        var mediaContext = appBarService.pushMediaContext(this.mediaItem, null, this._smartBuyStateEngine.currentAppbarActions, {executeLocation: Entertainment.UI.Actions.ExecutionLocation.canvas});
                        this._mediaContext = mediaContext;
                        mediaContext.collectionFilter = this._collectionFilter || Microsoft.Entertainment.Platform.MediaAvailability.available;
                        if (this.topSongs)
                            this.topSongs.mediaContext = mediaContext;
                        this._updateLocalAlbumFilter(mediaContext.collectionFilter);
                        this._smartBuyStateEngine.initialize(this.mediaItem, pageButtonSet, ViewModels.MusicLXStateHandlers.onArtistDetailsStateChanged, {invokeHandlerAsStatic: true});
                        this._smartBuyStateEngineBinding = WinJS.Binding.bind(this._smartBuyStateEngine, {currentAppbarActions: function() {
                                return _this._artistAppbarActionsChanged()
                            }});
                        this._mediaItemLibraryIdBinding = WinJS.Binding.bind(this._mediaItem, {libraryId: function() {
                                return _this._mediaCollectionStateChanged()
                            }});
                        this.primaryHeaderButtons = this._smartBuyStateEngine.getCurrentButtonsForLocation(ViewModels.ArtistDetailsActionLocations.primaryHeader);
                        this.myAlbumsButtons = this._smartBuyStateEngine.getCurrentButtonsForLocation(ViewModels.ArtistDetailsActionLocations.localAlbums);
                        this.topSongsButtons = this._smartBuyStateEngine.getCurrentButtonsForLocation(ViewModels.ArtistDetailsActionLocations.topSongs)
                    };
                    ArtistDetailsViewModelBase.prototype._artistAppbarActionsChanged = function() {
                        if (!this.disposed && this._mediaContext)
                            this._mediaContext.setToolbarActions(this._smartBuyStateEngine.currentAppbarActions)
                    };
                    ArtistDetailsViewModelBase.prototype._mediaCollectionStateChanged = function() {
                        if (!this.disposed && this._mediaItemLibraryIdBinding)
                            this._initializeSmartBuyStateEngine()
                    };
                    ArtistDetailsViewModelBase.prototype._unshareMediaItem = function() {
                        if (this._shareOperation) {
                            this._shareOperation.cancel();
                            this._shareOperation = null
                        }
                    };
                    ArtistDetailsViewModelBase.prototype._shareMediaItem = function() {
                        this._unshareMediaItem();
                        if (this.mediaItem && this._delayInitialized) {
                            var sender = Entertainment.ServiceLocator.getService(Entertainment.Services.shareSender);
                            this._shareOperation = sender.pendingShare(this.mediaItem)
                        }
                    };
                    ArtistDetailsViewModelBase.prototype._disposeViewStateListeners = function() {
                        if (this._moduleViewStateListener) {
                            this._moduleViewStateListener.cancel();
                            this._moduleViewStateListener = null
                        }
                    };
                    ArtistDetailsViewModelBase.prototype._disposeSmartBuyStateEngine = function() {
                        if (this._mediaContext) {
                            this._mediaContext.clearContext();
                            this._mediaContext = null
                        }
                        this._primaryHeaderButtons = null;
                        this._myAlbumsButtons = null;
                        if (this._smartBuyStateEngineBinding) {
                            this._smartBuyStateEngineBinding.cancel();
                            this._smartBuyStateEngineBinding = null
                        }
                        if (this._mediaItemLibraryIdBinding) {
                            this._mediaItemLibraryIdBinding.cancel();
                            this._mediaItemLibraryIdBinding = null
                        }
                        if (this._smartBuyStateEngine) {
                            this._smartBuyStateEngine.unload();
                            this._smartBuyStateEngine = null
                        }
                    };
                    ArtistDetailsViewModelBase.prototype._releaseModules = function() {
                        if (this.localAlbums) {
                            this.localAlbums.dispose();
                            this.localAlbums = null
                        }
                        if (this.marketplaceAlbums) {
                            this.marketplaceAlbums.dispose();
                            this.marketplaceAlbums = null
                        }
                        if (this.topSongs) {
                            this.topSongs.dispose();
                            this.topSongs = null
                        }
                        if (this.relatedArtists) {
                            this.relatedArtists.dispose();
                            this.relatedArtists = null
                        }
                    };
                    ArtistDetailsViewModelBase.prototype._onTopSongsViewStateChanged = function() {
                        if (this.isFirstLocationLoaded && this.topSongs.items) {
                            this.mediaItem.tracks = this.topSongs.items;
                            this._initializeSmartBuyStateEngine()
                        }
                    };
                    ArtistDetailsViewModelBase.prototype._onLocalAlbumsViewStateChanged = function() {
                        if (!this._isMusicMarketplaceEnabled)
                            this.viewStateViewModel.viewState = this._localAlbums.moduleState;
                        if (this._localAlbums.moduleState === 2)
                            this._updateFilterDetailString()
                    };
                    ArtistDetailsViewModelBase.prototype._updateCollectionFilter = function(filter) {
                        this._collectionFilter = filter;
                        this._updateLocalAlbumFilter(filter);
                        if (this._mediaContext)
                            this._mediaContext.collectionFilter = filter
                    };
                    ArtistDetailsViewModelBase.prototype._updateLocalAlbumFilter = function(filter) {
                        this._localAlbumsQuery.mediaAvailability = filter;
                        this._localTracksQuery.mediaAvailability = filter;
                        if (this.localAlbums)
                            this.localAlbums.updateQuery({mediaAvailability: filter})
                    };
                    ArtistDetailsViewModelBase.prototype._updateFilterDetailString = function() {
                        var _this = this;
                        if (!this.mediaItem || !this.inCollection || this._collectionFilter === Microsoft.Entertainment.Platform.MediaAvailability.available) {
                            this.filterDetails = String.empty;
                            return
                        }
                        var libraryAlbumsQuery = new Entertainment.Data.Query.libraryAlbums;
                        libraryAlbumsQuery.mediaAvailability = Microsoft.Entertainment.Platform.MediaAvailability.available;
                        libraryAlbumsQuery.artistId = this.mediaItem.libraryId;
                        libraryAlbumsQuery.executeCount().done(function(totalAlbumCount) {
                            if (totalAlbumCount > _this.localAlbums.count)
                                switch (_this._collectionFilter) {
                                    case Microsoft.Entertainment.Platform.MediaAvailability.availableOffline:
                                        _this.filterDetails = String.load(String.id.IDS_DETAILS_FILTER_AVAILABLE_OFFLINE);
                                        break;
                                    case Microsoft.Entertainment.Platform.MediaAvailability.availableFromCloud:
                                        _this.filterDetails = String.load(String.id.IDS_DETAILS_FILTER_IN_CLOUD);
                                        break;
                                    case Microsoft.Entertainment.Platform.MediaAvailability.availableFromCloudOnly:
                                        _this.filterDetails = String.load(String.id.IDS_DETAILS_FILTER_STREAMING);
                                        break;
                                    case Microsoft.Entertainment.Platform.MediaAvailability.musicPass:
                                        _this.filterDetails = String.load(String.id.IDS_DETAILS_FILTER_FROM_XBOX_MUSIC);
                                        break;
                                    case Microsoft.Entertainment.Platform.MediaAvailability.oneDrive:
                                        _this.filterDetails = String.load(String.id.IDS_DETAILS_FILTER_ON_ONEDRIVE);
                                        break;
                                    case Microsoft.Entertainment.Platform.MediaAvailability.thisDeviceOnly:
                                        _this.filterDetails = String.load(String.id.IDS_DETAILS_FILTER_ON_PC);
                                        break;
                                    default:
                                        _this.filterDetails = String.empty;
                                        break
                                }
                            libraryAlbumsQuery.dispose()
                        }, function(error) {
                            ViewModels.fail("ArtistDetailsViewModelBase::_updateFilterDetailString: Failed to execute library albums query with the following error: " + error && error.message);
                            libraryAlbumsQuery.dispose()
                        })
                    };
                    ArtistDetailsViewModelBase.prototype._getLocalAlbumsHeaderButtons = function(artistId) {
                        this._localAlbumsQuery.artistId = artistId;
                        this._localAlbumsQuery.sort = Microsoft.Entertainment.Queries.AlbumsSortBy.titleAscending;
                        this._localAlbumsQuery.isLive = false;
                        this._localAlbumsQuery.acquisitionData = new Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.collection, Microsoft.Entertainment.Platform.AcquisitionContextType.artist);
                        this._localTracksQuery.artistId = artistId;
                        this._localTracksQuery.sort = Microsoft.Entertainment.Queries.TracksSortBy.albumTitleDiscNumberNumberAscending;
                        this._localTracksQuery.isLive = false;
                        this._localTracksQuery.acquisitionData = new Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.collection, Microsoft.Entertainment.Platform.AcquisitionContextType.artist);
                        return ViewModels.SmartBuyButtons.getArtistDetailsLocalAlbumsButtons(this._localAlbumsQuery.clone(), this._localTracksQuery.clone(), Entertainment.UI.Actions.ExecutionLocation.canvas)
                    };
                    ArtistDetailsViewModelBase.TOP_SONGS_LIMIT = 5;
                    ArtistDetailsViewModelBase.DEFAULT_HEADER_IMAGE_SIZE = {
                        width: 400, height: 300
                    };
                    return ArtistDetailsViewModelBase
                })(ViewModels.PageViewModelBase);
            ViewModels.ArtistDetailsViewModelBase = ArtistDetailsViewModelBase
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
/* >>>>>>/controls/music1/moduleviewcontrol.js:524 */
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
                var ModuleViewControl = (function(_super) {
                        __extends(ModuleViewControl, _super);
                        function ModuleViewControl(element, options) {
                            _super.call(this, element, options);
                            UI.Framework.processDeclarativeControlContainer(this)
                        }
                        Object.defineProperty(ModuleViewControl.prototype, "dataContext", {
                            get: function() {
                                return this._dataContext
                            }, set: function(value) {
                                    this.updateAndNotify("dataContext", value)
                                }, enumerable: true, configurable: true
                        });
                        ModuleViewControl.prototype.onModuleItemInvoked = function(event) {
                            var element = event.srcElement;
                            while (element && element !== this.domElement) {
                                if (element.clickDataContext) {
                                    this.invokeModuleAction(element.clickDataContext);
                                    event.stopPropagation();
                                    break
                                }
                                element = element.parentElement
                            }
                        };
                        ModuleViewControl.prototype.onModuleHeaderInvoked = function(event) {
                            if (!event.keyCode || event.keyCode === WinJS.Utilities.Key.enter || event.keyCode === WinJS.Utilities.Key.space) {
                                var element = event.srcElement;
                                var viewModel = this.dataContext;
                                while (element && element !== this.domElement) {
                                    var moduleAction = WinJS.Utilities.getMember("moduleDataContext.moduleAction", element);
                                    if (moduleAction) {
                                        moduleAction.execute();
                                        event.stopPropagation();
                                        break
                                    }
                                    element = element.parentElement
                                }
                            }
                        };
                        ModuleViewControl.prototype.invokeModuleAction = function(item) {
                            if (!WinJS.Utilities.getMember("actionId", item))
                                if (WinJS.Utilities.getMember("data.actionId", item))
                                    item = item.data;
                                else
                                    return;
                            var actionService = Entertainment.ServiceLocator.getService(Entertainment.Services.actions);
                            var actionToExecute = actionService.getAction(item.actionId);
                            if (actionToExecute) {
                                actionToExecute.parameter = item.actionParameter;
                                if (item.automationId)
                                    actionToExecute.automationId = item.automationId;
                                actionToExecute.requeryCanExecute();
                                if (actionToExecute.isEnabled)
                                    actionToExecute.execute()
                            }
                        };
                        ModuleViewControl.prototype.onShowAllCollectionAlbumsInvoked = function(event) {
                            if (!event.keyCode || event.keyCode === WinJS.Utilities.Key.enter || event.keyCode === WinJS.Utilities.Key.space) {
                                var viewModel = this.dataContext;
                                if (viewModel) {
                                    viewModel.invokeShowAllCollectionAlbums();
                                    event.stopPropagation()
                                }
                            }
                        };
                        ModuleViewControl.prototype.freeze = function() {
                            _super.prototype.freeze.call(this);
                            if (this.dataContext)
                                this.dataContext.freeze()
                        };
                        ModuleViewControl.prototype.thaw = function() {
                            _super.prototype.thaw.call(this);
                            if (this.dataContext)
                                this.dataContext.thaw()
                        };
                        ModuleViewControl.prototype.unload = function() {
                            _super.prototype.unload.call(this)
                        };
                        ModuleViewControl.isDeclarativeControlContainer = true;
                        return ModuleViewControl
                    })(UI.Framework.UserControl);
                Controls.ModuleViewControl = ModuleViewControl
            })(Controls = UI.Controls || (UI.Controls = {}))
        })(UI = Entertainment.UI || (Entertainment.UI = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}));
WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.ModuleViewControl)
})();
