/* Copyright (C) Microsoft Corporation. All rights reserved. */
/* >>>>>>/controls/music1/playlistdetailsview.js:2 */
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
                var PlaylistDetailsView = (function(_super) {
                        __extends(PlaylistDetailsView, _super);
                        function PlaylistDetailsView(element, options) {
                            _super.call(this, element, options);
                            MS.Entertainment.UI.Framework.processDeclarativeControlContainer(this)
                        }
                        PlaylistDetailsView.prototype.onShowAllTracksInvoked = function(event) {
                            var viewModel = this.dataContext;
                            this.invokeActionForEvent(event, function() {
                                return viewModel && viewModel.clearFilter()
                            })
                        };
                        return PlaylistDetailsView
                    })(Controls.PageViewBase);
                Controls.PlaylistDetailsView = PlaylistDetailsView
            })(Controls = UI.Controls || (UI.Controls = {}))
        })(UI = Entertainment.UI || (Entertainment.UI = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}));
WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.PlaylistDetailsView)
})();
/* >>>>>>/viewmodels/music/virtualplaylistchangehandler.js:44 */
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
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var ViewModels;
        (function(ViewModels) {
            var VirtualPlaylistChangeHandler = (function(_super) {
                    __extends(VirtualPlaylistChangeHandler, _super);
                    function VirtualPlaylistChangeHandler(playlist) {
                        _super.call(this, playlist);
                        this._disposed = false;
                        var mediaStore = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.mediaStore);
                        this._playlistProvider = mediaStore.getPlaylistProvider()
                    }
                    VirtualPlaylistChangeHandler.prototype.dispose = function() {
                        _super.prototype.dispose.call(this);
                        this._disposed = true;
                        if (this._blockSyncOperation) {
                            this._blockSyncOperation.cancel();
                            this._blockSyncOperation = null
                        }
                    };
                    VirtualPlaylistChangeHandler.prototype.waitForEdits = function() {
                        return WinJS.Promise.as(this._currentWork).then(function hideResult(){})
                    };
                    VirtualPlaylistChangeHandler.prototype.onMoved = function(result) {
                        if (!result || !result.detail || result.detail.changeType === MS.Entertainment.Data.VirtualListBase.changeType.source)
                            return;
                        this._movePlaylistItem(result.detail.oldIndex, result.detail.newIndex)
                    };
                    VirtualPlaylistChangeHandler.prototype.onRemoved = function(result) {
                        if (!result || !result.detail || result.detail.changeType === MS.Entertainment.Data.VirtualListBase.changeType.source)
                            return;
                        this._removePlaylistItem(result.detail.index)
                    };
                    VirtualPlaylistChangeHandler.prototype._executeWork = function(callback) {
                        var _this = this;
                        this._currentWork = WinJS.Promise.as(this._currentWork).then(function() {
                            if (!_this._blockSyncOperation && !_this._disposed) {
                                var syncManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.syncManager);
                                return syncManager.getSyncManager().blockSyncAsync()
                            }
                        }).then(function(blockSyncOperation) {
                            var result = callback();
                            if (blockSyncOperation)
                                if (!_this._disposed)
                                    _this._blockSyncOperation = blockSyncOperation;
                                else
                                    blockSyncOperation.cancel();
                            return result
                        }).then(null, function(error) {
                            ViewModels.fail("VirtualPlaylistChangeHandler::_executeWork failed. error: " + (error && error.message))
                        })
                    };
                    VirtualPlaylistChangeHandler.prototype._movePlaylistItem = function(oldIndex, newIndex) {
                        var _this = this;
                        var callback = function() {
                                return _this._playlistProvider.reorderPlaylistItemsAsync(_this.libraryId, [oldIndex], (oldIndex < newIndex) ? newIndex + 1 : newIndex, _this.availabilityFilter).then(null, function(error) {
                                        ViewModels.fail("VirtualPlaylistChangeHandler::_movePlaylistItem failed. error: " + (error && error.message))
                                    })
                            };
                        this._executeWork(callback)
                    };
                    VirtualPlaylistChangeHandler.prototype._removePlaylistItem = function(index) {
                        var _this = this;
                        var callback = function() {
                                return _this._playlistProvider.removePlaylistItemsAsync(_this.libraryId, [index], _this.availabilityFilter)
                            };
                        this._executeWork(callback)
                    };
                    return VirtualPlaylistChangeHandler
                })(MS.Entertainment.Data.VirtualListChangeHandler);
            ViewModels.VirtualPlaylistChangeHandler = VirtualPlaylistChangeHandler
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/music/playlistdetailsviewmodelbase.js:135 */
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
            (function(PlayListDetailsModuleKeys) {
                PlayListDetailsModuleKeys[PlayListDetailsModuleKeys["songsModule"] = 0] = "songsModule";
                PlayListDetailsModuleKeys[PlayListDetailsModuleKeys["musicVideosModule"] = 1] = "musicVideosModule";
                PlayListDetailsModuleKeys[PlayListDetailsModuleKeys["count"] = 2] = "count"
            })(ViewModels.PlayListDetailsModuleKeys || (ViewModels.PlayListDetailsModuleKeys = {}));
            var PlayListDetailsModuleKeys = ViewModels.PlayListDetailsModuleKeys;
            var PlaylistDetailsViewModelBase = (function(_super) {
                    __extends(PlaylistDetailsViewModelBase, _super);
                    function PlaylistDetailsViewModelBase(playlist) {
                        _super.call(this);
                        ViewModels.assert(playlist && (Entertainment.Utilities.isValidLibraryId(playlist.libraryId) || playlist.hasServiceId), "PlaylistDetailsViewModel::ctor. A playlist with a library id or a service id is required to get the details.");
                        this.mediaItem = playlist;
                        this._initializeModules()
                    }
                    Object.defineProperty(PlaylistDetailsViewModelBase.prototype, "playlist", {
                        get: function() {
                            return this.mediaItem
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(PlaylistDetailsViewModelBase.prototype, "songsModule", {
                        get: function() {
                            return this.modules && this.modules[0]
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(PlaylistDetailsViewModelBase.prototype, "musicVideosModule", {
                        get: function() {
                            return this.modules && this.modules[1]
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(PlaylistDetailsViewModelBase.prototype, "viewStateViewModel", {
                        get: function() {
                            if (!this._viewStateViewModel) {
                                var viewStateItems = new Array;
                                viewStateItems[-2] = new ViewModels.ViewStateItem(String.load(String.id.IDS_MUSIC_OFFLINE_HEADER), String.load(String.id.IDS_MUSIC_OFFLINE_DETAILS), []);
                                viewStateItems[-1] = new ViewModels.ViewStateItem(String.load(String.id.IDS_MUSIC_ERROR_HEADER), String.load(String.id.IDS_MUSIC_ERROR_DETAILS), []);
                                viewStateItems[0] = new ViewModels.ViewStateItem(String.load(String.id.IDS_PLAYLIST_PAGE_EMPTY_TITLE), String.load(String.id.IDS_PLAYLIST_PAGE_EMPTY_TEXT), this._getEmptyViewStateActions());
                                this._viewStateViewModel = new ViewModels.ViewStateViewModel(viewStateItems)
                            }
                            return this._viewStateViewModel
                        }, enumerable: true, configurable: true
                    });
                    PlaylistDetailsViewModelBase.prototype.dispose = function() {
                        this._releaseModuleBindings();
                        this._releasePlaylistChangedHander();
                        _super.prototype.dispose.call(this)
                    };
                    PlaylistDetailsViewModelBase.prototype.loadModules = function() {
                        if (!this.isOnline && !this.inCollection) {
                            this.viewStateViewModel.viewState = -2;
                            return
                        }
                        var isLocalPlaylist = this.inCollection;
                        var isCatalogPlaylist = this.hasServiceId;
                        if (!isLocalPlaylist && !isCatalogPlaylist) {
                            this.viewStateViewModel.viewState = -1;
                            ViewModels.fail("PlaylistDetailsViewModelBase::loadModules. Playlist does not have an id.");
                            return
                        }
                        this._cancelMediaItemHydration();
                        this._createSmartBuyStateEngine();
                        this._hydratePlaylist();
                        if (!this._delayInitializeSmartBuyEngine)
                            this._initializeSmartBuyStateEngine(false)
                    };
                    PlaylistDetailsViewModelBase.prototype.navigatedBackTo = function() {
                        if (this.songsModule && !this.songsModule.isItemsLive)
                            this.songsModule.refresh()
                    };
                    PlaylistDetailsViewModelBase.prototype._getSmartBuyEngineAppBarHandlers = function() {
                        return {
                                deleteMedia: this._onMediaItemDeletion.bind(this), renamePlaylist: this._onPlaylistRename.bind(this)
                            }
                    };
                    PlaylistDetailsViewModelBase.prototype._getSmartBuyEngineButtons = function() {
                        ViewModels.fail("PlaylistDetailsViewModelBase::_getSmartBuyEngineButtons. No buttons specified for the Smart Buy Engine.")
                    };
                    PlaylistDetailsViewModelBase.prototype._getSmartBuyEngineEventHandler = function() {
                        return this._onPlaylistDetailsStateChanged.bind(this)
                    };
                    PlaylistDetailsViewModelBase.prototype._getTracksForSmartBuyEngine = function() {
                        return this.songsModule.items
                    };
                    PlaylistDetailsViewModelBase.prototype._initializeModules = function() {
                        var _this = this;
                        this._releaseModuleBindings();
                        var playlistView = Entertainment.Utilities.isValidLibraryId(this.playlist.libraryId) ? 4 : 5;
                        this.modules = new Array(2);
                        this.modules[0] = new ViewModels.SongsModule(playlistView);
                        this.listenForModuleViewStateChanges();
                        this._songsModuleBinding = Entertainment.UI.Framework.addEventHandlers(this.songsModule, {
                            moduleStateChanged: this._onSongsModuleViewStateChanged.bind(this), itemsChanged: this._onSongsModuleItemsChanged.bind(this)
                        });
                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicVideosEnabled)) {
                            var musicVideosView = this.inCollection ? 11 : 10;
                            this.modules[1] = new ViewModels.MusicVideosModule(musicVideosView);
                            this.musicVideosModule.isExcludedFromPageState = true;
                            this.musicVideosModule.lockModuleState();
                            this._musicVideosModuleItemsBinding = WinJS.Binding.bind(this.musicVideosModule, {itemsChanged: function() {
                                    return _this._updateMusicVideosBinding()
                                }})
                        }
                    };
                    PlaylistDetailsViewModelBase.prototype._initializeSmartBuyStateEngine = function(initializeImmediately) {
                        ViewModels.assert((initializeImmediately || this._mediaItemHydratePromise), "PlaylistDetailsViewModel::_initializeSmartBuyStateEngine. this._mediaItemHydratePromise should be valid or initializeImmediately should be true");
                        _super.prototype._initializeSmartBuyStateEngine.call(this, initializeImmediately)
                    };
                    PlaylistDetailsViewModelBase.prototype._reloadFilteredModules = function() {
                        if (this.songsModule)
                            this.songsModule.load()
                    };
                    PlaylistDetailsViewModelBase.prototype._refreshDetailString = function() {
                        if (!this.playlist)
                            return;
                        var metadataLines = [];
                        var songCount = Entertainment.Formatters.formatPlaylistDetailsTrackCount(this.playlist);
                        var duration = this.playlist.duration ? Entertainment.Utilities.formatTimeString(this.playlist.duration) : String.empty;
                        if (this.playlist.count >= 0)
                            metadataLines.push(songCount);
                        if (duration)
                            metadataLines.push(duration);
                        this.mediaItemDetails = metadataLines.join(String.load(String.id.IDS_DETAILS_METADATA_SEPERATOR))
                    };
                    PlaylistDetailsViewModelBase.prototype._updateFilterDetails = function() {
                        var filter = String.empty;
                        if (this.collectionFilter === Microsoft.Entertainment.Platform.MediaAvailability.availableOffline)
                            filter = String.load(String.id.IDS_DETAILS_FILTER_AVAILABLE_OFFLINE);
                        this.updateAndNotify("filterDetails", filter)
                    };
                    PlaylistDetailsViewModelBase.prototype._getEmptyViewStateActions = function() {
                        var actionService = Entertainment.ServiceLocator.getService(Entertainment.Services.actions);
                        var emptyActions = [];
                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace))
                            emptyActions.push(new ViewModels.ActionItem(String.id.IDS_COLLECTION_PAGE_EMPTY_BROWSE_TITLE, String.id.IDS_COLLECTION_PAGE_EMPTY_BROWSE_SUBTITLE, actionService.getAction(Entertainment.UI.Actions.ActionIdentifiers.exploreHubNavigate), Entertainment.UI.Icon.explore));
                        return emptyActions
                    };
                    PlaylistDetailsViewModelBase.prototype._hydratePlaylist = function() {
                        var _this = this;
                        var getPlaylistQuery;
                        if (this.playlist && this.playlist.inCollection) {
                            getPlaylistQuery = new Entertainment.Data.Query.libraryPlaylists;
                            getPlaylistQuery.playlistId = this.playlist.libraryId;
                            getPlaylistQuery.isLive = true;
                            getPlaylistQuery.chunkSize = 1;
                            getPlaylistQuery.acquisitionData = new Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.collection, Microsoft.Entertainment.Platform.AcquisitionContextType.playlist);
                            this._mediaItemHydratePromise = getPlaylistQuery.getItems().then(function(virtualList) {
                                if (virtualList && virtualList.count === 1) {
                                    _this._listenForPlaylistChanges(virtualList);
                                    return virtualList.itemsFromIndex(0, 0, 0)
                                }
                                else
                                    return WinJS.Promise.wrapError(new Error("PlaylistDetailsViewModelBase::_hydratePlaylist. Expected a single playlist for library id " + _this.playlist.libraryId))
                            }).then(function(result) {
                                if (result && result.items) {
                                    var playlist = result.items[0].data;
                                    _this.songsModule.parentMediaId = playlist.libraryId;
                                    _this.songsModule.load();
                                    if (_this.musicVideosModule) {
                                        _this.musicVideosModule.parentMediaItem = playlist;
                                        _this.musicVideosModule.load()
                                    }
                                    return _this.mediaItem
                                }
                            }, function(error) {
                                if (!WinJS.Promise.isCanceledError(error))
                                    return WinJS.Promise.wrapError(new Error("PlaylistDetailsViewModelBase::_hydratePlaylist. Unable to get the playlist item from the list with error message: " + (error && error.message)))
                            })
                        }
                        else if (this.playlist && this.playlist.hasServiceId) {
                            getPlaylistQuery = new Entertainment.Data.Query.Music.CloudPlaylist;
                            getPlaylistQuery.id = this.playlist.serviceId;
                            getPlaylistQuery.idType = this.playlist.serviceIdType;
                            getPlaylistQuery.acquisitionData = new Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.store, Microsoft.Entertainment.Platform.AcquisitionContextType.playlist);
                            getPlaylistQuery.acquisitionData = new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.store, Microsoft.Entertainment.Platform.AcquisitionContextType.playlist, this.playlist.serviceId);
                            this._mediaItemHydratePromise = getPlaylistQuery.execute().then(function(queryResult) {
                                if (queryResult.result) {
                                    _this.songsModule.parentMediaId = _this.playlist.serviceId;
                                    _this.songsModule.parentMediaServiceIdType = _this.playlist.serviceIdType;
                                    _this.playlist.count = queryResult.result.count;
                                    _this.playlist.albumImages = queryResult.result.albumImages;
                                    return _this.songsModule.load().then(function() {
                                            return _this.playlist
                                        })
                                }
                            }, function(error) {
                                if (!WinJS.Promise.isCanceledError(error))
                                    return WinJS.Promise.wrapError(new Error("PlaylistDetailsViewModelBase::_hydratePlaylist. Unable to get the playlist with error message: " + (error && error.message)))
                            })
                        }
                        else
                            this._mediaItemHydratePromise = WinJS.Promise.wrapError(new Error("PlaylistDetailsViewModelBase::_hydratePlaylist. Unable to hydrate playlist; unknown type"))
                    };
                    PlaylistDetailsViewModelBase.prototype._listenForPlaylistChanges = function(virtualList) {
                        var _this = this;
                        this._releasePlaylistChangedHander();
                        this._playlistChangedBinding = Entertainment.Utilities.addEventHandlers(virtualList, {itemChanged: function(result) {
                                if (result && result.detail && result.detail.newValue)
                                    _this._playlistChanged(result.detail.newValue.data)
                            }})
                    };
                    PlaylistDetailsViewModelBase.prototype._playlistChanged = function(newPlaylist) {
                        var oldPlaylistDuration = this.playlist.duration;
                        var oldPlaylistTracks = this.playlist.tracks;
                        var oldPlaylistTrackCount = this.playlist.totalTracksCount;
                        this.mediaItem = newPlaylist;
                        if (oldPlaylistTracks)
                            this.playlist.tracks = oldPlaylistTracks;
                        if (this.playlist.duration !== oldPlaylistDuration || this.playlist.totalTracksCount !== oldPlaylistTrackCount)
                            this._smartBuyStateEngine.updateMediaItemProperties(this.playlist)
                    };
                    PlaylistDetailsViewModelBase.prototype._releaseModuleBindings = function() {
                        if (this._songsModuleBinding) {
                            this._songsModuleBinding.cancel();
                            this._songsModuleBinding = null
                        }
                        if (this._musicVideosModuleItemsBinding) {
                            this._musicVideosModuleItemsBinding.cancel();
                            this._musicVideosModuleItemsBinding = null
                        }
                    };
                    PlaylistDetailsViewModelBase.prototype._releasePlaylistChangedHander = function() {
                        if (this._playlistChangedBinding) {
                            this._playlistChangedBinding.cancel();
                            this._playlistChangedBinding = null
                        }
                    };
                    PlaylistDetailsViewModelBase.prototype._onMediaItemDeletion = function(deletionEvent) {
                        if (deletionEvent.detail && deletionEvent.detail.deleted && deletionEvent.detail.removedItem && deletionEvent.detail.removedItem.isEqual(this.playlist)) {
                            var navigation;
                            if (Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.navigation)) {
                                navigation = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                                navigation.navigateBack()
                            }
                            else if (Entertainment.ServiceLocator.isServiceRegistered(Entertainment.Services.winJSNavigation)) {
                                navigation = Entertainment.ServiceLocator.getService(Entertainment.Services.winJSNavigation);
                                navigation.navigateBack()
                            }
                        }
                    };
                    PlaylistDetailsViewModelBase.prototype._onPlaylistRename = function(renameEvent){};
                    PlaylistDetailsViewModelBase.prototype._onPlaylistDetailsStateChanged = function(engine, stateInfo) {
                        var playabilityCounts = WinJS.Utilities.getMember("collection.playability.counts", stateInfo);
                        this._updateTrackLocationValues(playabilityCounts);
                        this._reinitializeNotificationList();
                        var musicStateHandler = Entertainment.ServiceLocator.getService(Entertainment.Services.musicStateHandler);
                        return musicStateHandler.onPlaylistDetailsStateChanged(engine, stateInfo)
                    };
                    PlaylistDetailsViewModelBase.prototype._onSongsModuleItemsChanged = function(event) {
                        if (!this.playlist.tracks)
                            this.playlist.tracks = event.detail.newValue
                    };
                    PlaylistDetailsViewModelBase.prototype._onSongsModuleViewStateChanged = function(event) {
                        var viewState = event.detail.newValue;
                        if (viewState === 2 && this._delayInitialized && !this._smartBuyStateEngineInitialized)
                            this._initializeSmartBuyStateEngine(false);
                        if (Entertainment.Utilities.ViewState.isStateCompleted(this.songsModule.moduleState) && this.musicVideosModule)
                            this.musicVideosModule.unLockModuleState()
                    };
                    PlaylistDetailsViewModelBase.prototype._updateMusicVideosBinding = function() {
                        this.dispatchChangeAndNotify("musicVideosModule", this.musicVideosModule, this.musicVideosModule)
                    };
                    return PlaylistDetailsViewModelBase
                })(ViewModels.MusicDetailsPageViewModelBase);
            ViewModels.PlaylistDetailsViewModelBase = PlaylistDetailsViewModelBase
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/music1/playlistdetailsviewmodel.js:423 */
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
            var PlaylistDetailsViewModel = (function(_super) {
                    __extends(PlaylistDetailsViewModel, _super);
                    function PlaylistDetailsViewModel(playlist) {
                        var _this = this;
                        _super.call(this, playlist);
                        this._signInBindings = null;
                        this._subscriptionBinding = null;
                        this._signInService = null;
                        this._freeUserHasSubscriptionStreamingTracks = false;
                        ViewModels.assert(playlist && MS.Entertainment.Utilities.isValidLibraryId(playlist.libraryId), "PlaylistDetailsViewModel::ctor. A playlist with a library id is required to get the details.");
                        this.applyGlobalNotifications = true;
                        this._signInService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                        this._signInBindings = Entertainment.Utilities.addEventHandlers(this._signInService, {isSignedIn: function() {
                                return _this._onUserStatusChanged()
                            }});
                        var signedInUser = Entertainment.ServiceLocator.getService(Entertainment.Services.signedInUser);
                        this._subscriptionBinding = Entertainment.Utilities.addEventHandlers(signedInUser, {isSubscriptionChanged: function() {
                                return _this._onUserStatusChanged()
                            }});
                        var featureEnablementService = Entertainment.ServiceLocator.getService(Entertainment.Services.featureEnablement);
                        this._isFreeStreamingEnabled = featureEnablementService.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicFreePlay);
                        this._isSubscriptionEnabled = featureEnablementService.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicSubscription)
                    }
                    PlaylistDetailsViewModel.prototype.navigatedBackTo = function() {
                        if (this.songsModule && !this.songsModule.isItemsLive)
                            this.songsModule.refresh()
                    };
                    PlaylistDetailsViewModel.prototype._checkCanInitializeSmartBuyStateEngine = function() {
                        ViewModels.assert(this._mediaItemHydratePromise, "PlaylistDetailsViewModel::_initializeSmartBuyStateEngine. this._mediaItemHydratePromise should be valid");
                        var canInitialize = _super.prototype._checkCanInitializeSmartBuyStateEngine.call(this);
                        if (!this.isFirstLocationLoaded || this._mediaContext || !this.songsModule.items || !this._mediaItemHydratePromise)
                            return false;
                        return canInitialize
                    };
                    PlaylistDetailsViewModel.prototype._initializeLocalNotifications = function() {
                        var _this = this;
                        return _super.prototype._initializeLocalNotifications.call(this).then(function(notifications) {
                                if (!_this.isOnline && _this.playlist && _this.collectionFilter !== Microsoft.Entertainment.Platform.MediaAvailability.availableOffline && !_this._allTracksLocal) {
                                    var offlineNotification;
                                    if (_this._allTracksStreaming) {
                                        offlineNotification = Entertainment.UI.ListNotification.createNotification(Entertainment.UI.NotificationCategoryEnum.networkStatus, String.load(String.id.IDS_MUSIC_PLAYLIST_DETAILS_OFFLINE_BANNER_NOTIFICATION_TITLE), String.load(String.id.IDS_MUSIC_DETAILS_OFFLINE_BANNER_NOTIFICATION_BODY));
                                        offlineNotification.automationId = Entertainment.UI.AutomationIds.offlineFullyStreamingPlaylistNotification;
                                        notifications.push(offlineNotification)
                                    }
                                    else if (_this._someTracksStreamingSomeLocal) {
                                        offlineNotification = Entertainment.UI.ListNotification.createNotification(Entertainment.UI.NotificationCategoryEnum.networkStatus, String.load(String.id.IDS_MUSIC_PLAYLIST_DETAILS_OFFLINE_PARTIAL_BANNER_NOTIFICATION_TITLE), String.empty, [Entertainment.UI.Actions.ActionIdentifiers.notificationDetailsNetworkStatus], [{title: String.load(String.id.IDS_MUSIC_DETAILS_OFFLINE_PARTIAL_BANNER_NOTIFICATION_BODY)}]);
                                        offlineNotification.automationId = Entertainment.UI.AutomationIds.offlinePartiallyStreamingPlaylistNotification;
                                        notifications.push(offlineNotification)
                                    }
                                }
                                if (_this._freeUserHasSubscriptionStreamingTracks) {
                                    var playlistUpsellNotification = Entertainment.UI.ListNotification.createNotification(Entertainment.UI.NotificationCategoryEnum.playlistUpsell, String.load(String.id.IDS_PLAYLIST_ITEM_DIALOG_NOT_AVAILABLE_FREE_USER_TITLE), String.empty, [Entertainment.UI.Actions.ActionIdentifiers.subscriptionSignup], [{
                                                title: String.load(String.id.IDS_PLAYLIST_ITEM_DIALOG_NOT_AVAILABLE_FREE_USER_ACTION), automationId: Entertainment.UI.AutomationIds.playlistUpsellNotificationSubscriptionSignUp
                                            }]);
                                    playlistUpsellNotification.automationId = Entertainment.UI.AutomationIds.playlistUpsellNotification;
                                    notifications.push(playlistUpsellNotification)
                                }
                                return notifications
                            })
                    };
                    PlaylistDetailsViewModel.prototype._onMediaItemDeletion = function(deletionEvent) {
                        _super.prototype._onMediaItemDeletion.call(this, deletionEvent);
                        if (deletionEvent.detail && deletionEvent.detail.deleted && deletionEvent.detail.removedItem && deletionEvent.detail.removedItem.isEqual(this.playlist))
                            this._refreshPlaylistsInNavBar()
                    };
                    PlaylistDetailsViewModel.prototype._onPlaylistRename = function(renameEvent) {
                        _super.prototype._onPlaylistRename.call(this, renameEvent);
                        this._refreshPlaylistsInNavBar()
                    };
                    PlaylistDetailsViewModel.prototype._getSmartBuyEngineButtons = function() {
                        return ViewModels.SmartBuyButtons.getPlaylistDetailsButtonsLX(this.playlist, Entertainment.UI.Actions.ExecutionLocation.canvas, this._genericPlayButton)
                    };
                    PlaylistDetailsViewModel.prototype._onPlaylistDetailsStateChanged = function(engine, stateInfo) {
                        this._checkFreeUserHasSubscriptionStreamingTracks();
                        return _super.prototype._onPlaylistDetailsStateChanged.call(this, engine, stateInfo)
                    };
                    PlaylistDetailsViewModel.prototype._onSongsModuleItemsChanged = function(event) {
                        _super.prototype._onSongsModuleItemsChanged.call(this, event);
                        this._checkFreeUserHasSubscriptionStreamingTracks()
                    };
                    PlaylistDetailsViewModel.prototype._refreshPlaylistsInNavBar = function() {
                        if (Entertainment.ServiceLocator.isServiceRegistered(Entertainment.Services.playlists)) {
                            var playlists = Entertainment.ServiceLocator.getService(Entertainment.Services.playlists);
                            playlists.refresh()
                        }
                    };
                    PlaylistDetailsViewModel.prototype._checkFreeUserHasSubscriptionStreamingTracks = function() {
                        var _this = this;
                        var signedInUser = Entertainment.ServiceLocator.getService(Entertainment.Services.signedInUser);
                        this._freeUserHasSubscriptionStreamingTracks = false;
                        if (this._isSubscriptionEnabled && this.songsModule && !this._isFreeStreamingEnabled && this._signInService.isSignedIn && signedInUser && !signedInUser.isSubscription)
                            this.songsModule.items.forEach(function(virtualListItem) {
                                var track = WinJS.Utilities.getMember("item.data", virtualListItem);
                                if (track && !track.canPlayLocally && !track.canFreeStream && !track.canPurchaseStream && !track.canStreamFromCloudStorage && !track.roamingViaOneDrive && track.hasServiceId) {
                                    _this._freeUserHasSubscriptionStreamingTracks = true;
                                    virtualListItem.stop = true
                                }
                            })
                    };
                    PlaylistDetailsViewModel.prototype._onUserStatusChanged = function() {
                        this._checkFreeUserHasSubscriptionStreamingTracks()
                    };
                    return PlaylistDetailsViewModel
                })(ViewModels.PlaylistDetailsViewModelBase);
            ViewModels.PlaylistDetailsViewModel = PlaylistDetailsViewModel
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
