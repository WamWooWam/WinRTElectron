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
var MS;
(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var ViewModels;
        (function(ViewModels) {
            var ItemLocation = MS.Entertainment.Data.ItemLocation;
            (function(MusicVideosModuleViews) {
                MusicVideosModuleViews[MusicVideosModuleViews["latestVideos"] = 1] = "latestVideos";
                MusicVideosModuleViews[MusicVideosModuleViews["newVideos"] = 2] = "newVideos";
                MusicVideosModuleViews[MusicVideosModuleViews["topVideos"] = 3] = "topVideos";
                MusicVideosModuleViews[MusicVideosModuleViews["searchCollection"] = 4] = "searchCollection";
                MusicVideosModuleViews[MusicVideosModuleViews["searchCatalog"] = 5] = "searchCatalog";
                MusicVideosModuleViews[MusicVideosModuleViews["artistTopVideos"] = 6] = "artistTopVideos";
                MusicVideosModuleViews[MusicVideosModuleViews["artistNewVideos"] = 7] = "artistNewVideos";
                MusicVideosModuleViews[MusicVideosModuleViews["marketplaceAlbumVideos"] = 8] = "marketplaceAlbumVideos";
                MusicVideosModuleViews[MusicVideosModuleViews["collectionAlbumVideos"] = 9] = "collectionAlbumVideos";
                MusicVideosModuleViews[MusicVideosModuleViews["marketplacePlaylistVideos"] = 10] = "marketplacePlaylistVideos";
                MusicVideosModuleViews[MusicVideosModuleViews["collectionPlaylistVideos"] = 11] = "collectionPlaylistVideos"
            })(ViewModels.MusicVideosModuleViews || (ViewModels.MusicVideosModuleViews = {}));
            var MusicVideosModuleViews = ViewModels.MusicVideosModuleViews;
            var MusicVideoItemData = (function(_super) {
                    __extends(MusicVideoItemData, _super);
                    function MusicVideoItemData(musicVideo, location, position) {
                        _super.call(this);
                        this._data = null;
                        this._position = 0;
                        this._position = position;
                        this._location = location;
                        this._data = musicVideo
                    }
                    Object.defineProperty(MusicVideoItemData.prototype, "data", {
                        get: function() {
                            return this._data
                        }, set: function(value) {
                                this.updateAndNotify("data", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MusicVideoItemData.prototype, "collectionMusicVideo", {
                        get: function() {
                            return this._location !== ItemLocation.marketplace ? this.data : null
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MusicVideoItemData.prototype, "marketplaceMusicVideo", {
                        get: function() {
                            return this._location === ItemLocation.marketplace ? this.data : null
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MusicVideoItemData.prototype, "position", {
                        get: function() {
                            return this._position
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MusicVideoItemData.prototype, "actionId", {
                        get: function() {
                            return MS.Entertainment.UI.Actions.ActionIdentifiers.playMedia
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MusicVideoItemData.prototype, "actionParameter", {
                        get: function() {
                            return {
                                    mediaItem: this._data, automationId: this.id, data: this._data, location: this._location
                                }
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MusicVideoItemData.prototype, "id", {
                        get: function() {
                            return MusicVideoItemData._id
                        }, enumerable: true, configurable: true
                    });
                    MusicVideoItemData._id = "MusicVideoItem";
                    return MusicVideoItemData
                })(MS.Entertainment.UI.Framework.ObservableBase);
            ViewModels.MusicVideoItemData = MusicVideoItemData;
            var MusicVideosModule = (function(_super) {
                    __extends(MusicVideosModule, _super);
                    function MusicVideosModule(view, options) {
                        _super.call(this);
                        this._musicVideosQueryWatcher = null;
                        this._parentMediaItem = null;
                        this._shouldHydrateLibraryId = false;
                        this._view = null;
                        this._liveItems = null;
                        this._liveQuery = null;
                        this._virtualListEventListener = null;
                        this._disposed = false;
                        this._moreItemsAvailable = false;
                        this._hydrateItems = false;
                        this._queryResultLimit = 0;
                        this._view = view;
                        MS.Entertainment.Framework.ScriptUtilities.setOptions(this, options)
                    }
                    Object.defineProperty(MusicVideosModule.prototype, "parentMediaItem", {
                        get: function() {
                            return this._parentMediaItem
                        }, set: function(value) {
                                if (value !== this._parentMediaItem) {
                                    this.updateAndNotify("parentMediaItem", value);
                                    this.moduleAction = this._createHeaderAction()
                                }
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MusicVideosModule.prototype, "moreItemsAvailable", {
                        get: function() {
                            return this._moreItemsAvailable
                        }, set: function(value) {
                                this.updateAndNotify("moreItemsAvailable", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MusicVideosModule.prototype, "shouldHydrateLibraryId", {
                        get: function() {
                            return this._shouldHydrateLibraryId
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MusicVideosModule.prototype, "headerActions", {
                        get: function() {
                            return this._headerActions
                        }, set: function(value) {
                                this.updateAndNotify("headerActions", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MusicVideosModule.prototype, "_queryWatcher", {
                        get: function() {
                            if (!this._musicVideosQueryWatcher)
                                this._musicVideosQueryWatcher = new MS.Entertainment.Framework.QueryWatcher("MusicVideosModule");
                            return this._musicVideosQueryWatcher
                        }, enumerable: true, configurable: true
                    });
                    MusicVideosModule.prototype.delayInitialize = function() {
                        this.refreshItems()
                    };
                    MusicVideosModule.prototype.refreshItems = function() {
                        if (this.shouldHydrateLibraryId && this.items && this.items.length > 0)
                            this.items.forEach(function(musicVideo) {
                                return ViewModels.MediaItemModel.hydrateLibraryInfoAsync(musicVideo.data)
                            })
                    };
                    MusicVideosModule.prototype.getItems = function() {
                        if (this._getItemsPromise)
                            return this._getItemsPromise;
                        if (!ViewModels.ModuleBase.isValidSearchText(this.searchText)) {
                            MS.Entertainment.UI.fail("MusicVideosModule::getItems(). Cannot search using the term: " + this.searchText);
                            this.count = 0;
                            this.moduleState = 0;
                            return this._getItemsPromise = WinJS.Promise.wrap({
                                    items: [], totalCount: 0
                                })
                        }
                        var query = null;
                        this._hydrateItems = false;
                        this._queryResultLimit = 0;
                        switch (this._view) {
                            case 6:
                                MS.Entertainment.ViewModels.assert(this.parentMediaItem, "A media item is required to get items for the musicVideos module.");
                                MS.Entertainment.ViewModels.assert(this.parentMediaItem.canonicalId, "A media item with a canonicalId is required to get items for the musicVideos module.");
                                query = new MS.Entertainment.Data.Query.Music.ArtistTopMusicVideos;
                                query.chunkSize = MusicVideosModule.LATEST_MUSICVIDEOS_COUNT;
                                query.artistId = this.parentMediaItem.canonicalId;
                                query.impressionGuid = this.parentMediaItem.impressionGuid;
                                break;
                            case 7:
                                MS.Entertainment.ViewModels.assert(this.parentMediaItem, "A media item is required to get items for the musicVideos module.");
                                MS.Entertainment.ViewModels.assert(this.parentMediaItem.canonicalId, "A media item with a canonicalId is required to get items for the musicVideos module.");
                                query = new MS.Entertainment.Data.Query.Music.ArtistNewMusicVideos;
                                query.chunkSize = MusicVideosModule.LATEST_MUSICVIDEOS_COUNT;
                                query.artistId = this.parentMediaItem.canonicalId;
                                query.impressionGuid = this.parentMediaItem.impressionGuid;
                                break;
                            case 3:
                                query = new MS.Entertainment.Data.Query.Music.TopMusicVideos;
                                query.chunkSize = MusicVideosModule.TOP_MUSICVIDEOS_COUNT;
                                query.chunked = true;
                                break;
                            case 2:
                                query = new MS.Entertainment.Data.Query.Music.BrowseNewMusicVideos;
                                query.chunkSize = MusicVideosModule.NEW_MUSICVIDEOS_COUNT;
                                query.chunked = true;
                                break;
                            case 8:
                                query = new MS.Entertainment.Data.Query.Music.AlbumMusicVideos;
                                query.albumId = this.parentMediaItem.canonicalId;
                                query.acquisitionData = new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.store, Microsoft.Entertainment.Platform.AcquisitionContextType.album, MS.Entertainment.Utilities.isValidServiceId(this.parentMediaItem.canonicalId) ? this.parentMediaItem.canonicalId : String.empty);
                                this._hydrateItems = true;
                                break;
                            case 9:
                                query = new MS.Entertainment.Data.Query.Music.LibraryAlbumMusicVideos;
                                query.albumId = this.parentMediaItem.libraryId;
                                query.acquisitionData = new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.collection, Microsoft.Entertainment.Platform.AcquisitionContextType.album, MS.Entertainment.Utilities.isValidServiceId(this.parentMediaItem.canonicalId) ? this.parentMediaItem.canonicalId : String.empty);
                                this._hydrateItems = true;
                                break;
                            case 11:
                                query = new MS.Entertainment.Data.Query.Music.LibraryPlaylistMusicVideos;
                                query.playlistId = this.parentMediaItem.libraryId;
                                break;
                            default:
                                MS.Entertainment.ViewModels.fail("The view " + this._view + " is currently unsupported by the musicVideos module");
                                return
                        }
                        this._queryWatcher.registerQuery(query);
                        this._createHeaderActions(query.clone());
                        this._getItemsPromise = query.isLive ? this._executeLiveQuery(query) : this._executeStaticQuery(query);
                        return this._getItemsPromise
                    };
                    MusicVideosModule.prototype._executeStaticQuery = function(query) {
                        var _this = this;
                        return query.execute().then(function(queryResult) {
                                query.dispose();
                                var itemsHydrationPromise = WinJS.Promise.as();
                                var musicVideos = queryResult.result && queryResult.result.itemsArray || [];
                                if (_this._queryResultLimit) {
                                    _this.moreItemsAvailable = _this._queryResultLimit < musicVideos.length;
                                    musicVideos.splice(_this._queryResultLimit)
                                }
                                if (_this._hydrateItems)
                                    itemsHydrationPromise = WinJS.Promise.join(musicVideos.map(function(musicVideo) {
                                        return musicVideo.hydrate()
                                    }));
                                return itemsHydrationPromise.then(function() {
                                        _this.moduleState = musicVideos.length > 0 ? 2 : 0;
                                        return {
                                                items: musicVideos, totalCount: musicVideos.length
                                            }
                                    })
                            }, function(error) {
                                query.dispose();
                                return _this.wrapModuleError(error, "Failed to get musicVideos.")
                            })
                    };
                    MusicVideosModule.prototype._executeLiveQuery = function(query) {
                        var _this = this;
                        this._disposeLiveQuery();
                        this._liveQuery = query;
                        return this._liveQuery.getItems().then(function(virtualList) {
                                if (!virtualList || _this._disposed)
                                    return null;
                                var items = [];
                                var totalCount = 0;
                                _this._liveItems = new MS.Entertainment.Data.ObservableArrayVirtualListAdapter;
                                _this._liveItems.initialize(virtualList, function(data) {
                                    _this.moduleState = 2;
                                    _this.count = virtualList.count;
                                    return new MusicVideoItemData(data, ItemLocation.marketplace)
                                });
                                _this._virtualListEventListener = MS.Entertainment.Utilities.addEventHandlers(virtualList, {countChanged: function() {
                                        if (virtualList.count === 0) {
                                            _this.moduleState = 0;
                                            _this.count = 0
                                        }
                                    }});
                                items = _this._liveItems;
                                totalCount = virtualList.count;
                                return {
                                        items: items, totalCount: totalCount
                                    }
                            }, function(error) {
                                _this._disposeLiveQuery();
                                return _this.wrapModuleError(error, "Failed to get local musicVideos.")
                            })
                    };
                    MusicVideosModule.prototype._createHeaderActions = function(query) {
                        var signInService = Entertainment.ServiceLocator.getService(Entertainment.Services.signIn);
                        var signedInUserService = Entertainment.ServiceLocator.getService(Entertainment.Services.signedInUser);
                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        var isFreeStreamingEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicFreePlay);
                        if (signInService.isSignedIn && (signedInUserService.isSubscription || isFreeStreamingEnabled)) {
                            var action = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).getAction(Entertainment.UI.Actions.ActionIdentifiers.playQuery);
                            var actionOptions = {
                                    queryFactory: function() {
                                        return query
                                    }, preRollVideoAdIfNeeded: true, automationId: ViewModels.MusicMarketplaceAutomationIds.playTopMusicVideosAction, icon: Entertainment.UI.Icon.play, voiceGuiTextStringId: String.id.IDS_TOP_SONGS_PLAY_ALL_BUTTON_VUI_GUI, voicePhraseStringId: String.id.IDS_TOP_SONGS_PLAY_ALL_BUTTON_VUI_ALM, voicePhoneticPhraseStringId: String.id.IDS_TOP_SONGS_PLAY_ALL_BUTTON_VUI_PRON
                                };
                            WinJS.UI.setOptions(action, actionOptions);
                            this.headerActions = new Entertainment.ObservableArray([action]).bindableItems
                        }
                    };
                    MusicVideosModule.prototype.invokeItem = function(musicVideo) {
                        if (MS.Entertainment.Platform.PlaybackHelpers.isMusicVideo(musicVideo)) {
                            var smartBuyStateEngine;
                            var appBarService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appToolbar);
                            var mediaContext = appBarService.pushMediaContext(musicVideo, null, [], {executeLocation: MS.Entertainment.UI.Actions.ExecutionLocation.invokeInline});
                            smartBuyStateEngine = new MS.Entertainment.ViewModels.SmartBuyStateEngine;
                            smartBuyStateEngine.initialize(musicVideo, MS.Entertainment.ViewModels.SmartBuyButtons.getMusicVideoInlineDetailsButtons(mediaContext), MS.Entertainment.ViewModels.MusicStateHandlers.onMusicVideoInlineDetailsStateChanged);
                            var setAppbarActions = function setAppBarActions() {
                                    mediaContext.setToolbarActions(smartBuyStateEngine.currentAppbarActions)
                                };
                            var smartStateEngineBindings = WinJS.Binding.bind(smartBuyStateEngine, {currentAppbarActions: setAppbarActions.bind(this)});
                            var contextualData = {
                                    title: musicVideo.title, subTitle: musicVideo.artistName
                                };
                            MS.Entertainment.UI.Controls.CommandingPopOver.showContextualCommands(contextualData).then(function() {
                                smartStateEngineBindings.cancel();
                                smartStateEngineBindings = null
                            })
                        }
                        else
                            Trace.fail("MusicVideosModule::invokeItem: Item passed is not a music video")
                    };
                    MusicVideosModule.prototype.dispose = function() {
                        this._disposeLiveQuery();
                        this._disposed = true
                    };
                    MusicVideosModule.prototype._disposeLiveQuery = function() {
                        if (this._virtualListEventListener) {
                            this._virtualListEventListener.cancel();
                            this._virtualListEventListener = null
                        }
                        if (this._liveItems) {
                            this._liveItems.dispose();
                            this._liveItems = null
                        }
                        if (this._liveQuery) {
                            this._liveQuery.dispose();
                            this._liveQuery = null
                        }
                    };
                    MusicVideosModule.prototype._createHeaderAction = function() {
                        return null
                    };
                    MusicVideosModule.LATEST_MUSICVIDEOS_COUNT = 24;
                    MusicVideosModule.NEW_MUSICVIDEOS_COUNT = 24;
                    MusicVideosModule.TOP_MUSICVIDEOS_COUNT = 24;
                    MusicVideosModule.SEARCH_RESULTS_COUNT = 24;
                    MusicVideosModule.ALBUM_MUSICVIDEOS_COUNT = 4;
                    return MusicVideosModule
                })(ViewModels.ModuleBase);
            ViewModels.MusicVideosModule = MusicVideosModule
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
