/* Copyright (C) Microsoft Corporation. All rights reserved. */
/* >>>>>>/viewmodels/music/musicsearchhubviewmodelbase.js:2 */
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
            (function(SearchHubViewModelModuleKeys) {
                SearchHubViewModelModuleKeys[SearchHubViewModelModuleKeys["collectionArtistsModule"] = 0] = "collectionArtistsModule";
                SearchHubViewModelModuleKeys[SearchHubViewModelModuleKeys["collectionAlbumsModule"] = 1] = "collectionAlbumsModule";
                SearchHubViewModelModuleKeys[SearchHubViewModelModuleKeys["collectionSongsModule"] = 2] = "collectionSongsModule";
                SearchHubViewModelModuleKeys[SearchHubViewModelModuleKeys["catalogArtistsModule"] = 3] = "catalogArtistsModule";
                SearchHubViewModelModuleKeys[SearchHubViewModelModuleKeys["catalogAlbumsModule"] = 4] = "catalogAlbumsModule";
                SearchHubViewModelModuleKeys[SearchHubViewModelModuleKeys["catalogSongsModule"] = 5] = "catalogSongsModule"
            })(ViewModels.SearchHubViewModelModuleKeys || (ViewModels.SearchHubViewModelModuleKeys = {}));
            var SearchHubViewModelModuleKeys = ViewModels.SearchHubViewModelModuleKeys;
            var MusicSearchHubViewModelBase = (function(_super) {
                    __extends(MusicSearchHubViewModelBase, _super);
                    function MusicSearchHubViewModelBase(searchText, searchScope) {
                        ViewModels.SearchViewModelBase.RESULTS_STRING_FORMAT = String.id.IDS_SEARCH_RESULT_TITLE_TC;
                        _super.call(this, searchText, searchScope)
                    }
                    Object.defineProperty(MusicSearchHubViewModelBase.prototype, "albums", {
                        get: function() {
                            var key = this.isCollectionScope ? 1 : 4;
                            return this.modules && this.modules[key]
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MusicSearchHubViewModelBase.prototype, "artists", {
                        get: function() {
                            var key = this.isCollectionScope ? 0 : 3;
                            return this.modules && this.modules[key]
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MusicSearchHubViewModelBase.prototype, "songs", {
                        get: function() {
                            var key = this.isCollectionScope ? 2 : 5;
                            return this.modules && this.modules[key]
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MusicSearchHubViewModelBase.prototype, "impressionGuid", {
                        get: function() {
                            var albums = this.albums;
                            var artists = this.artists;
                            var songs = this.songs;
                            return (albums && albums.impressionGuid) || (artists && artists.impressionGuid) || (songs && songs.impressionGuid)
                        }, enumerable: true, configurable: true
                    });
                    MusicSearchHubViewModelBase.prototype._initializeModules = function() {
                        var albumOptions = {searchText: this.searchText};
                        var artistOptions = {searchText: this.searchText};
                        var songOptions = {
                                searchText: this.searchText, trackLimit: MusicSearchHubViewModelBase.SONG_RESULTS_COUNT
                            };
                        this._addCollectionModule(new ViewModels.ArtistsModule(2, artistOptions));
                        this._addCollectionModule(ViewModels.AlbumsModuleFactory.createSearchCollectionAlbumsModule(this.searchText));
                        this._addCollectionModule(new ViewModels.SongsModule(6, songOptions));
                        if (this.isMarketplaceEnabled) {
                            this._addCatalogModule(new ViewModels.ArtistsModule(3, artistOptions));
                            this._addCatalogModule(ViewModels.AlbumsModuleFactory.createSearchCatalogAlbumsModule(this.searchText));
                            this._addCatalogModule(new ViewModels.SongsModule(7, songOptions))
                        }
                        _super.prototype._initializeModules.call(this)
                    };
                    MusicSearchHubViewModelBase.prototype._onPivotChanged = function() {
                        var _this = this;
                        _super.prototype._onPivotChanged.call(this);
                        this.dispatchChangeAndNotify("artists", this.artists, this.artists);
                        this.dispatchChangeAndNotify("albums", this.albums, this.albums);
                        this.dispatchChangeAndNotify("songs", this.songs, this.songs);
                        var waitForBindings = WinJS.Binding.bind(this, {songs: function() {
                                    if (waitForBindings) {
                                        waitForBindings.cancel();
                                        _this.refreshViewState()
                                    }
                                }})
                    };
                    MusicSearchHubViewModelBase.SONG_RESULTS_COUNT = 25;
                    return MusicSearchHubViewModelBase
                })(ViewModels.MusicSearchViewModelBase);
            ViewModels.MusicSearchHubViewModelBase = MusicSearchHubViewModelBase
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
