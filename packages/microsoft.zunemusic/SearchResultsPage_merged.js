/* Copyright (C) Microsoft Corporation. All rights reserved. */
/* >>>>>>/viewmodels/searchgalleryviewmodelbase.js:2 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var ViewModels;
        (function(ViewModels) {
            (function(SearchGalleryViewModelModuleKeys) {
                SearchGalleryViewModelModuleKeys[SearchGalleryViewModelModuleKeys["collectionSearchModule"] = 0] = "collectionSearchModule";
                SearchGalleryViewModelModuleKeys[SearchGalleryViewModelModuleKeys["catalogSearchModule"] = 1] = "catalogSearchModule"
            })(ViewModels.SearchGalleryViewModelModuleKeys || (ViewModels.SearchGalleryViewModelModuleKeys = {}));
            var SearchGalleryViewModelModuleKeys = ViewModels.SearchGalleryViewModelModuleKeys
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/searchmodule.js:20 */
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
            var SearchModule = (function(_super) {
                    __extends(SearchModule, _super);
                    function SearchModule(view, options) {
                        _super.call(this, view);
                        this._count = 0;
                        this._isExcludedFromPageState = false;
                        this._mediaContext = null;
                        this._searchText = null;
                        this._moduleState = -3;
                        Entertainment.Framework.ScriptUtilities.setOptions(this, options)
                    }
                    Object.defineProperty(SearchModule.prototype, "count", {
                        get: function() {
                            return this._count
                        }, set: function(value) {
                                this.updateAndNotify("count", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(SearchModule.prototype, "isExcludedFromPageState", {
                        get: function() {
                            return this._isExcludedFromPageState
                        }, set: function(value) {
                                this.updateAndNotify("isExcludedFromPageState", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(SearchModule.prototype, "mediaContext", {
                        get: function() {
                            return this._mediaContext
                        }, set: function(value) {
                                this.updateAndNotify("mediaContext", value);
                                if (this._mediaContext && this._mediaContext.containingMedia)
                                    this.containingMedia = this._mediaContext.containingMedia
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(SearchModule.prototype, "searchText", {
                        get: function() {
                            return this._searchText
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(SearchModule.prototype, "moduleState", {
                        get: function() {
                            return this._moduleState
                        }, set: function(value) {
                                this.updateAndNotify("moduleState", value)
                            }, enumerable: true, configurable: true
                    });
                    SearchModule.prototype.cloneCurrentQuery = function() {
                        if (!this._lastUsedQuery || !this._lastUsedQuery.clone)
                            return null;
                        return this._lastUsedQuery.clone()
                    };
                    SearchModule.prototype.dispose = function() {
                        _super.prototype.dispose.call(this);
                        this._releaseResultsChangeHandler()
                    };
                    SearchModule.prototype.load = function() {
                        return this.refresh()
                    };
                    SearchModule.prototype.reload = function() {
                        return this.refresh()
                    };
                    SearchModule.prototype._listenForResultChanges = function() {
                        var _this = this;
                        this._releaseResultsChangeHandler();
                        this._resultsChangedBinding = Entertainment.Utilities.addEventHandlers(this.items, {countChanged: function(result) {
                                if (result && result.detail) {
                                    var newCount = result.detail.newValue;
                                    if (newCount === 0)
                                        _this.moduleState = 0;
                                    else
                                        _this.moduleState = 2;
                                    _this.count = newCount
                                }
                            }})
                    };
                    SearchModule.prototype._onBeginQuery = function(lastUsedQuery) {
                        ViewModels.assert(this.searchText || this.searchText === String.empty, "Expected search query terms to be defined before searching.");
                        lastUsedQuery.keyword = this.searchText;
                        lastUsedQuery.search = this.searchText;
                        this.moduleState = 1
                    };
                    SearchModule.prototype._onQueryCompleted = function(query, useItemsCount) {
                        _super.prototype._onQueryCompleted.call(this, query);
                        if (!query || !query.result)
                            this.moduleState = -1;
                        else {
                            var count = useItemsCount ? query.result.items && query.result.items.count : query.result.totalCount;
                            if (count <= 0) {
                                this.moduleState = 0;
                                this.count = 0
                            }
                            else {
                                this.moduleState = 2;
                                this.count = count
                            }
                        }
                        this._listenForResultChanges()
                    };
                    SearchModule.prototype._onQueryFailed = function(error) {
                        _super.prototype._onQueryFailed.call(this, error);
                        this.moduleState = -1
                    };
                    SearchModule.prototype._releaseResultsChangeHandler = function() {
                        if (this._resultsChangedBinding) {
                            this._resultsChangedBinding.cancel();
                            this._resultsChangedBinding = null
                        }
                    };
                    return SearchModule
                })(ViewModels.QueryViewModel);
            ViewModels.SearchModule = SearchModule
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/music/musicsearchgalleryviewmodelbase.js:155 */
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
            var MusicSearchGalleryViewModelBase = (function(_super) {
                    __extends(MusicSearchGalleryViewModelBase, _super);
                    function MusicSearchGalleryViewModelBase(searchText, searchScope) {
                        _super.call(this, searchText, searchScope)
                    }
                    Object.defineProperty(MusicSearchGalleryViewModelBase.prototype, "searchResults", {
                        get: function() {
                            var key = this.isCollectionScope ? 0 : 1;
                            return this.modules[key]
                        }, enumerable: true, configurable: true
                    });
                    MusicSearchGalleryViewModelBase.prototype._onPivotChanged = function() {
                        var _this = this;
                        _super.prototype._onPivotChanged.call(this);
                        this.dispatchChangeAndNotify("searchResults", this.searchResults, this.searchResults);
                        var waitForBindings = WinJS.Binding.bind(this, {searchResults: function() {
                                    if (waitForBindings) {
                                        waitForBindings.cancel();
                                        _this.refreshViewState()
                                    }
                                }})
                    };
                    return MusicSearchGalleryViewModelBase
                })(ViewModels.MusicSearchViewModelBase);
            ViewModels.MusicSearchGalleryViewModelBase = MusicSearchGalleryViewModelBase;
            var AlbumSearchGalleryViewModelBase = (function(_super) {
                    __extends(AlbumSearchGalleryViewModelBase, _super);
                    function AlbumSearchGalleryViewModelBase(searchText, searchScope) {
                        ViewModels.SearchViewModelBase.RESULTS_STRING_FORMAT = String.id.IDS_SEARCH_ALBUMS_RESULT_TITLE;
                        _super.call(this, searchText, searchScope)
                    }
                    AlbumSearchGalleryViewModelBase.prototype._initializeModules = function() {
                        var options = {searchText: this.searchText};
                        this._addCollectionModule(new ViewModels.MusicSearchModule(1, options));
                        if (this.isMarketplaceEnabled)
                            this._addCatalogModule(new ViewModels.MusicSearchModule(4, options));
                        _super.prototype._initializeModules.call(this)
                    };
                    return AlbumSearchGalleryViewModelBase
                })(MusicSearchGalleryViewModelBase);
            ViewModels.AlbumSearchGalleryViewModelBase = AlbumSearchGalleryViewModelBase;
            var ArtistSearchGalleryViewModelBase = (function(_super) {
                    __extends(ArtistSearchGalleryViewModelBase, _super);
                    function ArtistSearchGalleryViewModelBase(searchText, searchScope) {
                        ViewModels.SearchViewModelBase.RESULTS_STRING_FORMAT = String.id.IDS_SEARCH_ARTISTS_RESULT_TITLE;
                        _super.call(this, searchText, searchScope)
                    }
                    ArtistSearchGalleryViewModelBase.prototype._initializeModules = function() {
                        var options = {searchText: this.searchText};
                        this._addCollectionModule(new ViewModels.MusicSearchModule(2, options));
                        if (this.isMarketplaceEnabled)
                            this._addCatalogModule(new ViewModels.MusicSearchModule(5, options));
                        _super.prototype._initializeModules.call(this)
                    };
                    return ArtistSearchGalleryViewModelBase
                })(MusicSearchGalleryViewModelBase);
            ViewModels.ArtistSearchGalleryViewModelBase = ArtistSearchGalleryViewModelBase;
            var SongSearchGalleryViewModelBase = (function(_super) {
                    __extends(SongSearchGalleryViewModelBase, _super);
                    function SongSearchGalleryViewModelBase(searchText, searchScope) {
                        ViewModels.SearchViewModelBase.RESULTS_STRING_FORMAT = String.id.IDS_SEARCH_TRACKS_RESULT_TITLE;
                        _super.call(this, searchText, searchScope)
                    }
                    SongSearchGalleryViewModelBase.prototype._initializeModules = function() {
                        var options = {searchText: this.searchText};
                        this._addCollectionModule(new ViewModels.MusicSearchModule(3, options));
                        if (this.isMarketplaceEnabled)
                            this._addCatalogModule(new ViewModels.MusicSearchModule(6, options));
                        _super.prototype._initializeModules.call(this)
                    };
                    return SongSearchGalleryViewModelBase
                })(MusicSearchGalleryViewModelBase);
            ViewModels.SongSearchGalleryViewModelBase = SongSearchGalleryViewModelBase
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/music/musicsearchmodule.js:251 */
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
            (function(SearchModuleViews) {
                SearchModuleViews[SearchModuleViews["searchCollectionAlbums"] = 1] = "searchCollectionAlbums";
                SearchModuleViews[SearchModuleViews["searchCollectionArtists"] = 2] = "searchCollectionArtists";
                SearchModuleViews[SearchModuleViews["searchCollectionSongs"] = 3] = "searchCollectionSongs";
                SearchModuleViews[SearchModuleViews["searchCatalogAlbums"] = 4] = "searchCatalogAlbums";
                SearchModuleViews[SearchModuleViews["searchCatalogArtists"] = 5] = "searchCatalogArtists";
                SearchModuleViews[SearchModuleViews["searchCatalogSongs"] = 6] = "searchCatalogSongs"
            })(ViewModels.SearchModuleViews || (ViewModels.SearchModuleViews = {}));
            var SearchModuleViews = ViewModels.SearchModuleViews;
            var SearchCollectionTemplate = (function() {
                    function SearchCollectionTemplate() {
                        this.itemTemplate = "select(.templateid-searchCollectionTemplate)";
                        this.tap = Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.Tap.invokeOnly;
                        this.layout = Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.Layout.grid;
                        this.orientation = Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.Orientation.vertical;
                        this.zoomedOutLayout = Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.ZoomedOutLayout.list;
                        this.invokeBehavior = Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.InvokeBehavior.none;
                        this.invokeHelperFactory = Entertainment.UI.Controls.GalleryControlInvocationHelper.create;
                        this.forceInteractive = true;
                        this.minimumListLength = 1;
                        this.maxRows = NaN;
                        this.grouped = false;
                        this.hideShadow = true;
                        this.allowZoom = false;
                        this.allowSelectAll = false;
                        this.delayHydrateLibraryId = false;
                        this.selectionStyleFilled = false;
                        this.swipeBehavior = Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.swipeBehavior.select;
                        this.selectionMode = Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.SelectionMode.multi
                    }
                    return SearchCollectionTemplate
                })();
            ViewModels.SearchCollectionTemplate = SearchCollectionTemplate;
            var SearchCollectionAlbumsTemplate = (function(_super) {
                    __extends(SearchCollectionAlbumsTemplate, _super);
                    function SearchCollectionAlbumsTemplate() {
                        _super.apply(this, arguments);
                        this.itemTemplate = "select(.templateid-searchCollectionAlbumsTemplate)";
                        this.invokeBehavior = Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.InvokeBehavior.action;
                        this.itemsDraggable = true;
                        this.actionOptions = {id: Entertainment.UI.Actions.ActionIdentifiers.albumDetailsNavigate};
                        this.strings = {countFormatStringId: String.id.IDS_MUSIC_TYPE_ALBUM_PLURAL};
                        this.listViewClassName = "gallery-albums"
                    }
                    return SearchCollectionAlbumsTemplate
                })(SearchCollectionTemplate);
            ViewModels.SearchCollectionAlbumsTemplate = SearchCollectionAlbumsTemplate;
            var SearchCollectionArtistsTemplate = (function(_super) {
                    __extends(SearchCollectionArtistsTemplate, _super);
                    function SearchCollectionArtistsTemplate() {
                        _super.apply(this, arguments);
                        this.itemTemplate = "select(.templateid-searchCollectionArtistsTemplate)";
                        this.invokeBehavior = Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.InvokeBehavior.action;
                        this.actionOptions = {id: Entertainment.UI.Actions.ActionIdentifiers.artistDetailsNavigate};
                        this.strings = {countFormatStringId: String.id.IDS_MUSIC_TYPE_ARTIST_PLURAL};
                        this.listViewClassName = "gallery-artists"
                    }
                    return SearchCollectionArtistsTemplate
                })(SearchCollectionTemplate);
            ViewModels.SearchCollectionArtistsTemplate = SearchCollectionArtistsTemplate;
            var SearchCollectionSongsTemplate = (function(_super) {
                    __extends(SearchCollectionSongsTemplate, _super);
                    function SearchCollectionSongsTemplate() {
                        _super.apply(this, arguments);
                        this.itemTemplate = "select(.templateid-searchCollectionSongsTemplate)";
                        this.layout = Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.Layout.list;
                        this.invokeBehavior = Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.InvokeBehavior.inline;
                        this.itemsDraggable = true;
                        this.strings = {countFormatStringId: String.id.IDS_MUSIC_TYPE_TRACK_PLURAL};
                        this.listViewClassName = "gallery-songs"
                    }
                    return SearchCollectionSongsTemplate
                })(SearchCollectionTemplate);
            ViewModels.SearchCollectionSongsTemplate = SearchCollectionSongsTemplate;
            var SearchCatalogTemplate = (function(_super) {
                    __extends(SearchCatalogTemplate, _super);
                    function SearchCatalogTemplate() {
                        _super.apply(this, arguments);
                        this.itemTemplate = "select(.templateid-searchCatalogTemplate)";
                        this.delayHydrateLibraryId = true
                    }
                    return SearchCatalogTemplate
                })(SearchCollectionTemplate);
            ViewModels.SearchCatalogTemplate = SearchCatalogTemplate;
            var SearchCatalogAlbumsTemplate = (function(_super) {
                    __extends(SearchCatalogAlbumsTemplate, _super);
                    function SearchCatalogAlbumsTemplate() {
                        _super.apply(this, arguments);
                        this.itemTemplate = "select(.templateid-searchCatalogAlbumsTemplate)";
                        this.invokeBehavior = Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.InvokeBehavior.action;
                        this.itemsDraggable = true;
                        this.actionOptions = {id: Entertainment.UI.Actions.ActionIdentifiers.albumDetailsNavigate};
                        this.strings = {countFormatStringId: String.id.IDS_MUSIC_TYPE_ALBUM_PLURAL};
                        this.listViewClassName = "gallery-albums"
                    }
                    return SearchCatalogAlbumsTemplate
                })(SearchCatalogTemplate);
            ViewModels.SearchCatalogAlbumsTemplate = SearchCatalogAlbumsTemplate;
            var SearchCatalogArtistsTemplate = (function(_super) {
                    __extends(SearchCatalogArtistsTemplate, _super);
                    function SearchCatalogArtistsTemplate() {
                        _super.apply(this, arguments);
                        this.itemTemplate = "select(.templateid-searchCatalogArtistsTemplate)";
                        this.invokeBehavior = Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.InvokeBehavior.action;
                        this.actionOptions = {id: Entertainment.UI.Actions.ActionIdentifiers.artistDetailsNavigate};
                        this.strings = {countFormatStringId: String.id.IDS_MUSIC_TYPE_ARTIST_PLURAL};
                        this.listViewClassName = "gallery-artists"
                    }
                    return SearchCatalogArtistsTemplate
                })(SearchCatalogTemplate);
            ViewModels.SearchCatalogArtistsTemplate = SearchCatalogArtistsTemplate;
            var SearchCatalogSongsTemplate = (function(_super) {
                    __extends(SearchCatalogSongsTemplate, _super);
                    function SearchCatalogSongsTemplate() {
                        _super.apply(this, arguments);
                        this.itemTemplate = "select(.templateid-searchCatalogSongsTemplate)";
                        this.layout = Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.Layout.list;
                        this.invokeBehavior = Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.InvokeBehavior.inline;
                        this.itemsDraggable = true;
                        this.strings = {countFormatStringId: String.id.IDS_MUSIC_TYPE_TRACK_PLURAL};
                        this.listViewClassName = "gallery-songs"
                    }
                    return SearchCatalogSongsTemplate
                })(SearchCatalogTemplate);
            ViewModels.SearchCatalogSongsTemplate = SearchCatalogSongsTemplate;
            var MusicSearchModule = (function(_super) {
                    __extends(MusicSearchModule, _super);
                    function MusicSearchModule(view, options) {
                        _super.call(this, SearchModuleViews[view], options);
                        this.selectedTemplate = new SearchCollectionTemplate
                    }
                    Object.defineProperty(MusicSearchModule.prototype, "enableDelayInitialize", {
                        get: function() {
                            return true
                        }, enumerable: true, configurable: true
                    });
                    MusicSearchModule.prototype.createSelectionHandlers = function() {
                        var _this = this;
                        var result = [];
                        var clearSelection = function() {
                                return _this._raiseShouldClearSelection()
                            };
                        var removeItem = function() {
                                return _this._raiseShouldClearSelection()
                            };
                        if (ViewModels.SmartAppbarActions.setDefaultGalleryEventHandlers)
                            result.push(ViewModels.SmartAppbarActions.setDefaultGalleryEventHandlers(clearSelection, removeItem));
                        result.push({deleteMedia: removeItem});
                        return result
                    };
                    MusicSearchModule.prototype.delayInitialize = function() {
                        _super.prototype.delayInitialize.call(this);
                        this._raiseDelayLoadedEvent()
                    };
                    MusicSearchModule.prototype.refreshItems = function() {
                        if (this.view === SearchModuleViews[4] && this.items)
                            this.items.forEach(function(virtualListItem) {
                                if (virtualListItem && virtualListItem.item && virtualListItem.item.data)
                                    ViewModels.MediaItemModel.hydrateLibraryInfoAsync(virtualListItem.item.data)
                            })
                    };
                    MusicSearchModule.prototype.getViewDefinition = function(view) {
                        return MusicSearchModule._views[view]
                    };
                    MusicSearchModule._views = {
                        searchCollectionAlbums: new ViewModels.NodeValues(Entertainment.Data.Query.libraryAlbums, {
                            isLive: true, acquisitionData: new Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.collection, Microsoft.Entertainment.Platform.AcquisitionContextType.album)
                        }, {selectedTemplate: new SearchCollectionAlbumsTemplate}), searchCollectionArtists: new ViewModels.NodeValues(Entertainment.Data.Query.libraryArtists, {
                                isLive: true, acquisitionData: new Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.collection, Microsoft.Entertainment.Platform.AcquisitionContextType.artist)
                            }, {selectedTemplate: new SearchCollectionArtistsTemplate}), searchCollectionSongs: new ViewModels.NodeValues(Entertainment.Data.Query.libraryTracks, {
                                isLive: true, acquisitionData: new Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.collection, Microsoft.Entertainment.Platform.AcquisitionContextType.track)
                            }, {selectedTemplate: new SearchCollectionSongsTemplate}), searchCatalogAlbums: new ViewModels.NodeValues(Entertainment.Data.Query.Music.AlbumSearch, {
                                aggregateChunks: true, acquisitionData: new Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.store, Microsoft.Entertainment.Platform.AcquisitionContextType.album)
                            }, {selectedTemplate: new SearchCatalogAlbumsTemplate}), searchCatalogArtists: new ViewModels.NodeValues(Entertainment.Data.Query.Music.ArtistSearch, {
                                aggregateChunks: true, acquisitionData: new Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.store, Microsoft.Entertainment.Platform.AcquisitionContextType.artist)
                            }, {selectedTemplate: new SearchCatalogArtistsTemplate}), searchCatalogSongs: new ViewModels.NodeValues(Entertainment.Data.Query.Music.SongSearch, {
                                aggregateChunks: true, acquisitionData: new Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.store, Microsoft.Entertainment.Platform.AcquisitionContextType.track)
                            }, {selectedTemplate: new SearchCatalogSongsTemplate})
                    };
                    return MusicSearchModule
                })(ViewModels.SearchModule);
            ViewModels.MusicSearchModule = MusicSearchModule
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
