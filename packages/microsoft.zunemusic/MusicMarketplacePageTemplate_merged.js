/* Copyright (C) Microsoft Corporation. All rights reserved. */
/* >>>>>>/viewmodels/music/musicmarketplaceviewmodelbase.js:2 */
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
            MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");
            var MusicMarketplaceViewModelBase = (function(_super) {
                    __extends(MusicMarketplaceViewModelBase, _super);
                    function MusicMarketplaceViewModelBase(view, pivotIndex) {
                        var _this = this;
                        this._viewStateViewModel = null;
                        this._headerActionsArray = new Entertainment.ObservableArray;
                        this._defaultPivotIndex = pivotIndex !== undefined ? pivotIndex : -1;
                        this._adsEnabled = false;
                        this._uiState = Entertainment.ServiceLocator.getService(Entertainment.Services.uiState);
                        this._uiStateServiceBinding = WinJS.Binding.bind(this._uiState, {shouldShowAdsForFreePlay: function() {
                                return _this._refreshAdState()
                            }});
                        _super.call(this, view)
                    }
                    Object.defineProperty(MusicMarketplaceViewModelBase.prototype, "adsEnabled", {
                        get: function() {
                            return this._adsEnabled
                        }, set: function(value) {
                                this.updateAndNotify("adsEnabled", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MusicMarketplaceViewModelBase.prototype, "headerActions", {
                        get: function() {
                            return this._headerActions
                        }, set: function(value) {
                                this.updateAndNotify("headerActions", value)
                            }, enumerable: true, configurable: true
                    });
                    MusicMarketplaceViewModelBase.prototype.loadModules = function(){};
                    MusicMarketplaceViewModelBase.prototype.freeze = function(){};
                    MusicMarketplaceViewModelBase.prototype.thaw = function() {
                        this.refreshItems()
                    };
                    Object.defineProperty(MusicMarketplaceViewModelBase.prototype, "viewStateViewModel", {
                        get: function() {
                            if (!this._viewStateViewModel) {
                                var viewStateItems = new Array;
                                viewStateItems[-2] = new ViewModels.ViewStateItem(String.load(String.id.IDS_MUSIC_OFFLINE_HEADER), String.load(String.id.IDS_MUSIC_OFFLINE_DETAILS), []);
                                viewStateItems[-1] = new ViewModels.ViewStateItem(String.load(String.id.IDS_MUSIC_ERROR_HEADER), String.load(String.id.IDS_MUSIC_ERROR_DETAILS), []);
                                viewStateItems[0] = new ViewModels.ViewStateItem(String.load(String.id.IDS_MUSIC_SEARCH_CATALOG_EMPTY_TITLE), String.empty, []);
                                this._viewStateViewModel = new ViewModels.ViewStateViewModel(viewStateItems)
                            }
                            return this._viewStateViewModel
                        }, enumerable: true, configurable: true
                    });
                    MusicMarketplaceViewModelBase.prototype._refreshAdState = function() {
                        this.adsEnabled = this._uiState.shouldShowAdsForFreePlay
                    };
                    MusicMarketplaceViewModelBase.prototype.createSelectionHandlers = function() {
                        var _this = this;
                        var shouldClearSelection = function() {
                                return _this._raiseShouldClearSelection()
                            };
                        var removeItem = function(eventArgs) {
                                return _this._raiseShouldClearSelection()
                            };
                        var result = [];
                        if (ViewModels.SmartAppbarActions.setDefaultGalleryEventHandlers)
                            result.push(ViewModels.SmartAppbarActions.setDefaultGalleryEventHandlers(shouldClearSelection, removeItem));
                        result.push({
                            deleteMedia: shouldClearSelection, findAlbumInfo: shouldClearSelection
                        });
                        return result
                    };
                    MusicMarketplaceViewModelBase.prototype._onBeginQuery = function(query) {
                        _super.prototype._onBeginQuery.call(this, query);
                        this.viewStateViewModel.viewState = 1
                    };
                    MusicMarketplaceViewModelBase.prototype._onQueryCompleted = function(query) {
                        _super.prototype._onQueryCompleted.call(this, query);
                        this.viewStateViewModel.viewState = query && query.result && query.result.items && query.result.items.count === 0 ? 0 : 2
                    };
                    MusicMarketplaceViewModelBase.prototype._onQueryFailed = function(error) {
                        _super.prototype._onQueryFailed.call(this, error);
                        if (!WinJS.Promise.isCanceledError(error))
                            this.viewStateViewModel.viewState = Entertainment.UI.NetworkStatusService.isOnline() ? -1 : -2
                    };
                    MusicMarketplaceViewModelBase.prototype._onItemsChanged = function(newItems, oldItems) {
                        _super.prototype._onItemsChanged.call(this, newItems, oldItems);
                        this._updateHeaderActions();
                        if (this._lastUsedQuery && this.headerActions && this.headerActions.length > 0)
                            MS.Entertainment.ViewModels.assert(this._lastUsedQuery.autoUpdateOnSignIn, "MusicMarketplaceViewModel::_onItemsChanged() For header actions to be updated correctly, the query must be set to auto update its results on sign-in changes")
                    };
                    MusicMarketplaceViewModelBase.prototype.refreshItems = function() {
                        if (this.items)
                            this.items.forEach(function(virtualListItem) {
                                if (virtualListItem.item.data && !virtualListItem.item.data.inCollection)
                                    ViewModels.MediaItemModel.hydrateLibraryInfoAsync(virtualListItem.item.data)
                            })
                    };
                    MusicMarketplaceViewModelBase.prototype.dispose = function() {
                        _super.prototype.dispose.call(this);
                        if (this._uiStateServiceBinding) {
                            this._uiStateServiceBinding.cancel();
                            this._uiStateServiceBinding = null
                        }
                    };
                    MusicMarketplaceViewModelBase.prototype._updateHeaderActions = function() {
                        var selectedPivot = this.pivotsSelectionManager && this.pivotsSelectionManager.selectedItem;
                        this._headerActionsArray.clear();
                        if (selectedPivot && selectedPivot.value && selectedPivot.value.trackQuery && this._playAllQueryAvailable()) {
                            var actionService = Entertainment.ServiceLocator.getService(Entertainment.Services.actions);
                            var playQueryAction = actionService.getAction(Entertainment.UI.Actions.ActionIdentifiers.playQuery);
                            playQueryAction.preRollVideoAdIfNeeded = true;
                            playQueryAction.queryFactory = this.createTrackQuery.bind(this);
                            playQueryAction.title = String.load(String.id.IDS_PLAY_ALL);
                            playQueryAction.icon = Entertainment.UI.Icon.play;
                            this._headerActionsArray.push(playQueryAction)
                        }
                        this.headerActions = this._headerActionsArray.bindableItems
                    };
                    MusicMarketplaceViewModelBase.prototype._playAllQueryAvailable = function() {
                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        var freeStreamEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicFreePlay);
                        var signIn = Entertainment.ServiceLocator.getService(Entertainment.Services.signIn);
                        var signedInUser = Entertainment.ServiceLocator.getService(Entertainment.Services.signedInUser);
                        var hasSubscription = signIn && signIn.isSignedIn && signedInUser.isSubscription;
                        return freeStreamEnabled || hasSubscription
                    };
                    return MusicMarketplaceViewModelBase
                })(ViewModels.Music);
            ViewModels.MusicMarketplaceViewModelBase = MusicMarketplaceViewModelBase;
            var MusicMarketplaceLXTemplates = (function() {
                    function MusicMarketplaceLXTemplates(){}
                    MusicMarketplaceLXTemplates.albums = {
                        debugId: "marketplaceAlbum", itemTemplate: "select(.template-marketplaceAlbumTemplate)", layout: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.Layout.grid, zoomedOutLayout: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.ZoomedOutLayout.list, orientation: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.Orientation.vertical, swipeBehavior: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.swipeBehavior.select, invokeBehavior: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.InvokeBehavior.action, itemsDraggable: true, selectionMode: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.SelectionMode.multi, tap: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.Tap.invokeOnly, actionOptions: {id: Entertainment.UI.Actions.ActionIdentifiers.albumDetailsNavigate}, selectionStyleFilled: true, maxSelectionCount: 100, allowEmpty: true, grouped: false, allowZoom: false, allowSelectAll: true, forceInteractive: true, minimumListLength: 1, raisePanelResetEvents: true, delayHydrateLibraryId: true
                    };
                    MusicMarketplaceLXTemplates.albumsWithNumber = {
                        debugId: "marketplaceAlbum", itemTemplate: "select(.templateid-topAlbum)", layout: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.Layout.grid, zoomedOutLayout: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.ZoomedOutLayout.list, orientation: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.Orientation.vertical, swipeBehavior: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.swipeBehavior.select, invokeBehavior: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.InvokeBehavior.action, itemsDraggable: true, selectionMode: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.SelectionMode.multi, tap: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.Tap.invokeOnly, actionOptions: {id: Entertainment.UI.Actions.ActionIdentifiers.albumDetailsNavigate}, selectionStyleFilled: true, maxSelectionCount: 100, allowEmpty: true, grouped: false, allowZoom: false, allowSelectAll: true, forceInteractive: true, minimumListLength: 1, raisePanelResetEvents: true, delayHydrateLibraryId: true, listViewClassName: "gallery-topAlbums"
                    };
                    MusicMarketplaceLXTemplates.albumsWithReleaseYear = {
                        debugId: "marketplaceAlbum", itemTemplate: "select(.templateid-artistDiscographyAlbum)", layout: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.Layout.grid, zoomedOutLayout: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.ZoomedOutLayout.list, orientation: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.Orientation.vertical, swipeBehavior: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.swipeBehavior.select, invokeBehavior: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.InvokeBehavior.action, itemsDraggable: true, selectionMode: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.SelectionMode.multi, tap: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.Tap.invokeOnly, actionOptions: {id: Entertainment.UI.Actions.ActionIdentifiers.albumDetailsNavigate}, selectionStyleFilled: true, maxSelectionCount: 100, allowEmpty: true, grouped: false, allowZoom: false, allowSelectAll: true, forceInteractive: true, minimumListLength: 1, raisePanelResetEvents: true, delayHydrateLibraryId: true
                    };
                    MusicMarketplaceLXTemplates.artistsWithNumber = {
                        debugId: "marketplaceArtist", itemTemplate: "select(.templateid-marketplaceTopArtist)", layout: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.Layout.grid, zoomedOutLayout: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.ZoomedOutLayout.list, orientation: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.Orientation.vertical, swipeBehavior: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.swipeBehavior.select, invokeBehavior: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.InvokeBehavior.action, selectionMode: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.SelectionMode.multi, tap: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.Tap.invokeOnly, actionOptions: {id: Entertainment.UI.Actions.ActionIdentifiers.artistDetailsNavigate}, selectionStyleFilled: true, maxSelectionCount: 100, allowEmpty: true, grouped: false, allowZoom: false, allowSelectAll: true, forceInteractive: true, minimumListLength: 1, raisePanelResetEvents: true, delayHydrateLibraryId: true, listViewClassName: "gallery-topArtists"
                    };
                    MusicMarketplaceLXTemplates.artistTracks = {
                        debugId: "artistDiscographySong", itemTemplate: "select(.templateid-artistDiscographySong)", layout: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.Layout.list, zoomedOutLayout: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.ZoomedOutLayout.list, orientation: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.Orientation.vertical, swipeBehavior: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.swipeBehavior.select, invokeBehavior: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.InvokeBehavior.inline, invokeHelperFactory: Entertainment.UI.Controls.GalleryControlInvocationHelper.create, itemsDraggable: true, selectionMode: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.SelectionMode.multi, tap: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.Tap.invokeOnly, selectionStyleFilled: true, maxSelectionCount: 100, allowEmpty: true, grouped: false, allowZoom: false, allowSelectAll: true, forceInteractive: true, minimumListLength: 1, raisePanelResetEvents: true, delayHydrateLibraryId: true
                    };
                    MusicMarketplaceLXTemplates.artistTracksWithNumberByPopularity = {
                        debugId: "artistDiscographySongNumbered", itemTemplate: "select(.templateid-artistDiscographySongNumbered)", layout: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.Layout.list, zoomedOutLayout: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.ZoomedOutLayout.list, orientation: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.Orientation.vertical, swipeBehavior: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.swipeBehavior.select, invokeBehavior: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.InvokeBehavior.inline, invokeHelperFactory: Entertainment.UI.Controls.GalleryControlInvocationHelper.create, itemsDraggable: true, selectionMode: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.SelectionMode.multi, tap: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.Tap.invokeOnly, selectionStyleFilled: true, maxSelectionCount: 100, allowEmpty: true, grouped: false, allowZoom: false, allowSelectAll: true, forceInteractive: true, minimumListLength: 1, raisePanelResetEvents: true, delayHydrateLibraryId: true
                    };
                    MusicMarketplaceLXTemplates.tracksWithNumber = {
                        debugId: "marketplaceTopSong", itemTemplate: "select(.templateid-marketplaceTopSong)", layout: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.Layout.list, zoomedOutLayout: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.ZoomedOutLayout.list, orientation: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.Orientation.vertical, swipeBehavior: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.swipeBehavior.select, invokeBehavior: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.InvokeBehavior.inline, invokeHelperFactory: Entertainment.UI.Controls.GalleryControlInvocationHelper.create, itemsDraggable: true, selectionMode: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.SelectionMode.multi, tap: Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.Tap.invokeOnly, selectionStyleFilled: true, maxSelectionCount: 100, allowEmpty: true, grouped: false, allowZoom: false, allowSelectAll: true, forceInteractive: true, minimumListLength: 1, raisePanelResetEvents: true, delayHydrateLibraryId: true
                    };
                    return MusicMarketplaceLXTemplates
                })();
            ViewModels.MusicMarketplaceLXTemplates = MusicMarketplaceLXTemplates;
            var MusicLXMarketplaceAutomationIds = (function() {
                    function MusicLXMarketplaceAutomationIds(){}
                    MusicLXMarketplaceAutomationIds.artistDiscographyPopularitySort = "artistDiscographyPopularitySort_modifier";
                    MusicLXMarketplaceAutomationIds.artistDiscographyReleaseYearSort = "artistDiscographyReleaseYearSort_modifier";
                    MusicLXMarketplaceAutomationIds.artistDiscographyAlbums = "artistDiscographyAlbums_pivot";
                    MusicLXMarketplaceAutomationIds.artistDiscographySongs = "artistDiscographySongs_pivot";
                    MusicLXMarketplaceAutomationIds.defaultSubGenre = "defaultSubGenre_modifier";
                    MusicLXMarketplaceAutomationIds.newReleasesAllGenres = "newReleasesAllGenres_pivot";
                    MusicLXMarketplaceAutomationIds.popularTopArtists = "popularTopArtists_modifier";
                    MusicLXMarketplaceAutomationIds.popularTopSongs = "popularTopSongs_modifier";
                    MusicLXMarketplaceAutomationIds.popularTopAlbums = "popularTopAlbums_modifier";
                    return MusicLXMarketplaceAutomationIds
                })();
            ViewModels.MusicLXMarketplaceAutomationIds = MusicLXMarketplaceAutomationIds
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/music1/newmusicmarketplaceviewmodel.js:188 */
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
            var NewMusicMarketplaceViewModel = (function(_super) {
                    __extends(NewMusicMarketplaceViewModel, _super);
                    function NewMusicMarketplaceViewModel(view) {
                        _super.call(this, view);
                        this.title = String.load(String.id.IDS_MUSIC_NEW_ALBUMS_TITLE);
                        this.refresh()
                    }
                    NewMusicMarketplaceViewModel.prototype.getViewDefinition = function(view) {
                        return ViewModels.NewMusicMarketplaceViewModel.Views[view]
                    };
                    NewMusicMarketplaceViewModel.prototype.getModifierDefinition = function(view) {
                        return ViewModels.NewMusicMarketplaceViewModel.Modifiers[view]
                    };
                    NewMusicMarketplaceViewModel.ViewTypes = {newAlbums: "newAlbums"};
                    NewMusicMarketplaceViewModel.Views = {newAlbums: new ViewModels.NodeValues(function() {
                            return new Entertainment.Data.Query.Music.BrowseFeaturedAlbums
                        }, {}, {
                            selectedTemplate: ViewModels.MusicMarketplaceLXTemplates.albums, propertyKey: "serviceId", taskKeyGetter: Entertainment.UI.FileTransferService && Entertainment.UI.FileTransferService.keyFromProperty("albumMediaId", false, true), notifier: Entertainment.UI.FileTransferNotifiers && Entertainment.UI.FileTransferNotifiers.trackCollection
                        }, null, null)};
                    NewMusicMarketplaceViewModel.Modifiers = {newAlbums: {
                            itemQuery: function() {
                                return new Entertainment.Data.Query.Music.Genres
                            }, itemFactory: function itemFactory() {
                                    return [new ViewModels.Node(ViewModels.MusicLXMarketplaceAutomationIds.newReleasesAllGenres, String.id.IDS_FILTER_ALL_GENRES_SC, new ViewModels.NodeValues(null, {
                                                genreId: String.empty, subGenreId: String.empty
                                            }))]
                                }
                        }};
                    return NewMusicMarketplaceViewModel
                })(ViewModels.MusicMarketplaceViewModelBase);
            ViewModels.NewMusicMarketplaceViewModel = NewMusicMarketplaceViewModel
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/music1/topmusicmarketplaceviewmodel.js:242 */
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
            var TopMusicMarketplaceViewModel = (function(_super) {
                    __extends(TopMusicMarketplaceViewModel, _super);
                    function TopMusicMarketplaceViewModel(view, pivotType) {
                        this._maxCount = 200;
                        var pivotIndex = this._getDefaultPivotIndex(pivotType);
                        _super.call(this, view, pivotIndex);
                        this.title = String.load(String.id.IDS_MUSIC_TOP_MUSIC_TITLE);
                        this.refresh()
                    }
                    TopMusicMarketplaceViewModel.prototype.getViewDefinition = function(view) {
                        return ViewModels.TopMusicMarketplaceViewModel.Views[view]
                    };
                    TopMusicMarketplaceViewModel.prototype.getPivotDefinition = function(view) {
                        return ViewModels.TopMusicMarketplaceViewModel.Pivots[view]
                    };
                    TopMusicMarketplaceViewModel.prototype.getModifierDefinition = function(view) {
                        return ViewModels.TopMusicMarketplaceViewModel.Modifiers.all
                    };
                    TopMusicMarketplaceViewModel.prototype.getSecondaryModifierDefinition = function(view) {
                        var result = null;
                        if (this.modifierSelectionManager && this.modifierSelectionManager.selectedIndex > 0)
                            result = ViewModels.TopMusicMarketplaceViewModel.SecondaryModifiers.all;
                        return result
                    };
                    TopMusicMarketplaceViewModel.prototype._getDefaultPivotIndex = function(pivotType) {
                        var pivotIndex;
                        switch (pivotType) {
                            case 0:
                                pivotIndex = 0;
                                break;
                            case 1:
                                pivotIndex = 1;
                                break;
                            case 2:
                                pivotIndex = 2;
                                break;
                            default:
                                pivotIndex = -1;
                                break
                        }
                        return pivotIndex
                    };
                    TopMusicMarketplaceViewModel.prototype._onItemsChanging = function(newItems, oldItems) {
                        _super.prototype._onItemsChanging.call(this, newItems, oldItems);
                        if (newItems)
                            newItems.maxCount = this._maxCount
                    };
                    TopMusicMarketplaceViewModel.ViewTypes = {topMusic: "topMusic"};
                    TopMusicMarketplaceViewModel.Views = {topMusic: new ViewModels.NodeValues(null, {hasTotalCount: true}, null, null, null)};
                    TopMusicMarketplaceViewModel.Pivots = {topMusic: {itemFactory: function itemFactory() {
                                return [new ViewModels.Node(ViewModels.MusicLXMarketplaceAutomationIds.popularTopAlbums, String.load(String.id.IDS_MUSIC_ALBUMS_PIVOT_TC), new ViewModels.NodeValues(Entertainment.Data.Query.Music.TopAlbums, {autoUpdateOnSignIn: true}, {
                                            selectedTemplate: ViewModels.MusicMarketplaceLXTemplates.albumsWithNumber, propertyKey: "serviceId", taskKeyGetter: Entertainment.UI.FileTransferService && Entertainment.UI.FileTransferService.keyFromProperty("albumMediaId", false, true), notifier: Entertainment.UI.FileTransferNotifiers && Entertainment.UI.FileTransferNotifiers.trackCollection
                                        }, null, null)), new ViewModels.Node(ViewModels.MusicLXMarketplaceAutomationIds.popularTopArtists, String.load(String.id.IDS_MUSIC_ARTISTS_PIVOT_TC), new ViewModels.NodeValues(Entertainment.Data.Query.Music.TopArtists, {autoUpdateOnSignIn: true}, {
                                            selectedTemplate: ViewModels.MusicMarketplaceLXTemplates.artistsWithNumber, propertyKey: "serviceId", taskKeyGetter: Entertainment.UI.FileTransferService && Entertainment.UI.FileTransferService.keyFromProperty("albumMediaId", false, true), notifier: Entertainment.UI.FileTransferNotifiers && Entertainment.UI.FileTransferNotifiers.trackCollection
                                        }, null, null)), new ViewModels.Node(ViewModels.MusicLXMarketplaceAutomationIds.popularTopSongs, String.load(String.id.IDS_MUSIC_SONGS_PIVOT_TC), new ViewModels.NodeValues(Entertainment.Data.Query.Music.TopSongs, {autoUpdateOnSignIn: true}, {
                                            selectedTemplate: ViewModels.MusicMarketplaceLXTemplates.tracksWithNumber, propertyKey: "serviceId", taskKeyGetter: Entertainment.UI.FileTransferService && Entertainment.UI.FileTransferService.keyFromProperty("mediaId", false, true), notifier: Entertainment.UI.FileTransferNotifiers && Entertainment.UI.FileTransferNotifiers.trackCollection
                                        }, null, null, Entertainment.Data.Query.Music.TopSongs, {
                                            hasTotalCount: true, acquisitionData: new Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.store, Microsoft.Entertainment.Platform.AcquisitionContextType.playAll)
                                        }))]
                            }}};
                    TopMusicMarketplaceViewModel.Modifiers = {all: {
                            itemQuery: function itemQuery() {
                                return new Entertainment.Data.Query.Music.Genres
                            }, itemFactory: function itemFactory() {
                                    return [new ViewModels.Node(ViewModels.MusicLXMarketplaceAutomationIds.newReleasesAllGenres, String.load(String.id.IDS_FILTER_ALL_GENRES_SC), new ViewModels.NodeValues(null, {
                                                genreId: String.empty, subGenreId: String.empty
                                            }))]
                                }
                        }};
                    TopMusicMarketplaceViewModel.SecondaryModifiers = {all: {
                            itemQuery: function itemQuery() {
                                return new Entertainment.Data.Query.Music.SubGenres
                            }, itemFactory: function itemFactory() {
                                    return [new ViewModels.Node(ViewModels.MusicLXMarketplaceAutomationIds.defaultSubGenre, String.load(String.id.IDS_FILTER_ALL_SUBGENRES_SC), new ViewModels.NodeValues(null, {subGenreId: String.empty}))]
                                }
                        }};
                    return TopMusicMarketplaceViewModel
                })(ViewModels.MusicMarketplaceViewModelBase);
            ViewModels.TopMusicMarketplaceViewModel = TopMusicMarketplaceViewModel
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/music/artistmediaviewmodel.js:344 */
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
            (function(ArtistMediaSortModifiers) {
                ArtistMediaSortModifiers[ArtistMediaSortModifiers["releaseYear"] = 0] = "releaseYear";
                ArtistMediaSortModifiers[ArtistMediaSortModifiers["popularity"] = 1] = "popularity"
            })(ViewModels.ArtistMediaSortModifiers || (ViewModels.ArtistMediaSortModifiers = {}));
            var ArtistMediaSortModifiers = ViewModels.ArtistMediaSortModifiers;
            var ArtistMediaViewModel = (function(_super) {
                    __extends(ArtistMediaViewModel, _super);
                    function ArtistMediaViewModel(view, artist, pivotType, modifierSelection) {
                        var pivotIndex = this._getDefaultPivotIndex(pivotType);
                        if (modifierSelection)
                            this._defaultModifierSelection = modifierSelection;
                        _super.call(this, view, pivotIndex);
                        MS.Entertainment.ViewModels.assert(artist, "An artist is required to construct an Artist Albums View Model");
                        this.artist = artist;
                        this.title = this.artist.name;
                        this.refresh()
                    }
                    Object.defineProperty(ArtistMediaViewModel.prototype, "selectedPivot", {
                        get: function() {
                            return this.pivotsSelectionManager ? this.pivotsSelectionManager.selectedItem : null
                        }, enumerable: true, configurable: true
                    });
                    ArtistMediaViewModel.prototype.getViewDefinition = function(view) {
                        return MS.Entertainment.ViewModels.ArtistMediaViewModel.Views[view]
                    };
                    ArtistMediaViewModel.prototype.getPivotDefinition = function(view) {
                        return MS.Entertainment.ViewModels.ArtistMediaViewModel.Pivots[view]
                    };
                    ArtistMediaViewModel.prototype.getModifierDefinition = function(view) {
                        var id = this.selectedPivot && this.selectedPivot.id;
                        return MS.Entertainment.ViewModels.ArtistMediaViewModel.Modifiers[id]
                    };
                    ArtistMediaViewModel.prototype.createTrackQuery = function() {
                        var query = _super.prototype.createTrackQuery.call(this);
                        query.id = this.artist.canonicalId;
                        query.impressionGuid = this.artist.impressionGuid;
                        return query
                    };
                    Object.defineProperty(ArtistMediaViewModel.prototype, "isAdFreePage", {
                        get: function() {
                            return true
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(ArtistMediaViewModel.prototype, "artist", {
                        get: function() {
                            return this._artist
                        }, set: function(value) {
                                this.updateAndNotify("artist", value)
                            }, enumerable: true, configurable: true
                    });
                    ArtistMediaViewModel.prototype.getArtistId = function() {
                        return this.artist.canonicalId
                    };
                    ArtistMediaViewModel.prototype._getDefaultPivotIndex = function(pivotType) {
                        var pivotIndex;
                        switch (pivotType) {
                            case 0:
                                pivotIndex = 0;
                                break;
                            case 2:
                                pivotIndex = 1;
                                break;
                            default:
                                pivotIndex = -1;
                                break
                        }
                        return pivotIndex
                    };
                    ArtistMediaViewModel.prototype._onBeginQuery = function(query) {
                        _super.prototype._onBeginQuery.call(this, query);
                        query.id = this.artist.canonicalId;
                        query.impressionGuid = this.artist.impressionGuid
                    };
                    ArtistMediaViewModel.ViewTypes = {artistMusic: "artistMusic"};
                    ArtistMediaViewModel.PivotTypes = {
                        albums: "albums", songs: "songs"
                    };
                    ArtistMediaViewModel.Views = {artistMusic: new MS.Entertainment.ViewModels.NodeValues(null, null, null, null, null)};
                    ArtistMediaViewModel.Pivots = {artistMusic: {itemFactory: function itemFactory() {
                                return [new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.ArtistMediaViewModel.PivotTypes.albums, String.load(String.id.IDS_MUSIC_ALBUMS_PIVOT_TC), new MS.Entertainment.ViewModels.NodeValues(MS.Entertainment.Data.Query.Music.ArtistAlbums, {orderBy: MS.Entertainment.Data.Query.convertToLegacySortIfNeeded(MS.Entertainment.Data.Query.edsSortOrder.releaseDate)}, {
                                            selectedTemplate: MS.Entertainment.ViewModels.MusicMarketplaceLXTemplates.albumsWithReleaseYear, propertyKey: "serviceId", taskKeyGetter: MS.Entertainment.UI.FileTransferService && MS.Entertainment.UI.FileTransferService.keyFromProperty("albumMediaId", false, true), notifier: MS.Entertainment.UI.FileTransferNotifiers && MS.Entertainment.UI.FileTransferNotifiers.trackCollection
                                        }, null, null)), new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.ArtistMediaViewModel.PivotTypes.songs, String.load(String.id.IDS_MUSIC_SONGS_PIVOT_TC), new MS.Entertainment.ViewModels.NodeValues(MS.Entertainment.Data.Query.Music.ArtistSongs, {autoUpdateOnSignIn: true}, {
                                            selectedTemplate: MS.Entertainment.ViewModels.MusicMarketplaceLXTemplates.artistTracks, propertyKey: "serviceId", taskKeyGetter: MS.Entertainment.UI.FileTransferService && MS.Entertainment.UI.FileTransferService.keyFromProperty("mediaId", false, true), notifier: MS.Entertainment.UI.FileTransferNotifiers && MS.Entertainment.UI.FileTransferNotifiers.trackCollection
                                        }, null, null, MS.Entertainment.Data.Query.Music.ArtistSongs, {
                                            hasTotalCount: true, acquisitionData: new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.store, Microsoft.Entertainment.Platform.AcquisitionContextType.playAll)
                                        }))]
                            }}};
                    ArtistMediaViewModel.Modifiers = {
                        albums: {itemFactory: function itemFactory() {
                                return [new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.MusicLXMarketplaceAutomationIds.artistDiscographyReleaseYearSort, String.id.IDS_MUSIC_COLLECTION_BY_RELEASEYEAR_SORT, new MS.Entertainment.ViewModels.NodeValues(null, {orderBy: MS.Entertainment.Data.Query.convertToLegacySortIfNeeded(MS.Entertainment.Data.Query.edsSortOrder.releaseDate)}, null)), new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.MusicLXMarketplaceAutomationIds.artistDiscographyPopularitySort, String.id.IDS_MUSIC_COLLECTION_BY_POPULARITY_SORT, new MS.Entertainment.ViewModels.NodeValues(null, {orderBy: MS.Entertainment.Data.Query.convertToLegacySortIfNeeded(MS.Entertainment.Data.Query.edsSortOrder.mostPopular)}, null)), ]
                            }}, songs: {itemFactory: function itemFactory() {
                                    return [new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.MusicLXMarketplaceAutomationIds.artistDiscographyReleaseYearSort, String.id.IDS_MUSIC_COLLECTION_BY_RELEASEYEAR_SORT, new MS.Entertainment.ViewModels.NodeValues(null, {orderBy: MS.Entertainment.Data.Query.convertToLegacySortIfNeeded(MS.Entertainment.Data.Query.edsSortOrder.releaseDate)}, {selectedTemplate: MS.Entertainment.ViewModels.MusicMarketplaceLXTemplates.artistTracks}, null, null, null, {orderBy: MS.Entertainment.Data.Query.convertToLegacySortIfNeeded(MS.Entertainment.Data.Query.edsSortOrder.releaseDate)})), new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.MusicLXMarketplaceAutomationIds.artistDiscographyPopularitySort, String.id.IDS_MUSIC_COLLECTION_BY_POPULARITY_SORT, new MS.Entertainment.ViewModels.NodeValues(null, {orderBy: MS.Entertainment.Data.Query.convertToLegacySortIfNeeded(MS.Entertainment.Data.Query.edsSortOrder.allTimePlayCount)}, {selectedTemplate: MS.Entertainment.ViewModels.MusicMarketplaceLXTemplates.artistTracksWithNumberByPopularity}, null, null, null, {orderBy: MS.Entertainment.Data.Query.convertToLegacySortIfNeeded(MS.Entertainment.Data.Query.edsSortOrder.allTimePlayCount)})), ]
                                }}
                    };
                    return ArtistMediaViewModel
                })(ViewModels.MusicMarketplaceViewModelBase);
            ViewModels.ArtistMediaViewModel = ArtistMediaViewModel
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
