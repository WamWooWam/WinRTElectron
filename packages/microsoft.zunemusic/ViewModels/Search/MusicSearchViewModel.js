/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function(undefined) {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {MusicSearchAutomationIds: {
            searchAllMusic: "searchAllMusic_modifier", searchCollection: "searchCollection_modifier"
        }});
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {MusicSearchViewModel: MS.Entertainment.UI.Framework.derive("MS.Entertainment.ViewModels.NewSearchViewModel", function musicSearchViewModelConstructor(searchType, marketplaceEnabled, updateTitleOnFailureOnly) {
            this._defaultModifierSelection = MS.Entertainment.ViewModels.SearchViewModel.SearchCurrentFilter;
            this._searchTypeResults = MS.Entertainment.ViewModels.MusicSearchViewModel.searchTypeResults;
            this._modifiers = MS.Entertainment.ViewModels.MusicSearchViewModel.Modifiers;
            this._views = MS.Entertainment.ViewModels.MusicSearchViewModel.Views;
            this._musicMarketplaceEnabled = marketplaceEnabled;
            MS.Entertainment.ViewModels.NewSearchViewModel.prototype.constructor.call(this, searchType, null, updateTitleOnFailureOnly)
        }, {
            _musicMarketplaceEnabled: false, _modifiers: null, canSwitchToAllMusicView: {get: function get_canSwitchToAllMusicView() {
                        return this._searchType !== MS.Entertainment.ViewModels.MusicSearchViewModel.ViewTypes.allMusic && this._keepPivotOnEmpty
                    }}, isCollectionView: {get: function get_isCollectionView() {
                        return !this._musicMarketplaceEnabled || this.modifierSelectionManager.selectedIndex === MS.Entertainment.ViewModels.SearchFilter.localCollection
                    }}, isAllMusicSearchEnabled: {get: function get_isAllMusicSearchEnabled() {
                        return this._musicMarketplaceEnabled
                    }}, dispose: function dispose() {
                    MS.Entertainment.ViewModels.NewSearchViewModel.prototype.dispose.call(this)
                }, getModifierDefinition: function getModifierDefinition(view) {
                    if (this._musicMarketplaceEnabled && this._searchType !== MS.Entertainment.ViewModels.MusicSearchViewModel.ViewTypes.playlists)
                        return this._modifiers.allMusicSources;
                    else
                        return this._modifiers.collectionOnly
                }, _collectionTracks: function _collectionTracks(query, resultType, options) {
                    this._addSearchCallback(query, resultType, options, "songLocalResult", options.showCollection)
                }, _marketplaceTracks: function _marketplaceTracks(query, resultType, options) {
                    this._addSearchCallback(query, resultType, options, "songMPResult", options.showMarketplace)
                }, _collectionAlbums: function _collectionAlbums(query, resultType, options) {
                    this._addSearchCallback(query, resultType, options, "albumLocalResult", options.showCollection)
                }, _marketplaceAlbums: function _marketplaceAlbums(query, resultType, options) {
                    this._addSearchCallback(query, resultType, options, "albumMPResult", options.showMarketplace)
                }, _collectionArtists: function _collectionArtists(query, resultType, options) {
                    this._addSearchCallback(query, resultType, options, "artistLocalResult", options.showCollection)
                }, _marketplaceArtists: function _marketplaceArtists(query, resultType, options) {
                    this._addSearchCallback(query, resultType, options, "artistMPResult", options.showMarketplace)
                }, _collectionPlaylists: function _collectionPlaylists(query, resultType, options) {
                    this._addSearchCallback(query, resultType, options, "playlistLocalResult", options.showCollection)
                }, _updateResultCounts: function _updateResultCounts(options) {
                    if (options.showCollection) {
                        this._addResultCount("artistLocalResult", "artistsCount");
                        this._addResultCount("albumLocalResult", "albumsCount");
                        this._addResultCount("songLocalResult", "songsCount");
                        this._addResultCount("playlistLocalResult", "playlistsCount")
                    }
                    if (options.showMarketplace) {
                        this._addResultCount("artistMPResult", "artistsCount");
                        this._addResultCount("albumMPResult", "albumsCount");
                        this._addResultCount("songMPResult", "songsCount");
                        this._addResultCount("playlistMPResult", "playlistsCount");
                        this._addResultCount("musicVideoMPResult", "musicVideosCount")
                    }
                }, _getHCRResult: function _getHCRResult() {
                    return new MS.Entertainment.ViewModels.MusicHCRResult
                }, _searchCompleted: function _searchCompleted() {
                    var searchResultCounts = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.searchResultCounts);
                    if (searchResultCounts.allCount === -1)
                        searchResultCounts.allCount = 0;
                    if (searchResultCounts.allCount === 0 && this._hcrResult && this._hcrResult.hcrResult && this._hcrResult.hcrResult.inCollection)
                        searchResultCounts.allCount = 1;
                    MS.Entertainment.ViewModels.NewSearchViewModel.prototype._searchCompleted.call(this)
                }
        }, {
            ViewTypes: {
                allMusic: "allMusic", tracks: "tracks", albums: "albums", artists: "artists", playlists: "playlists", musicVideos: "musicVideos"
            }, Views: {
                    allMusic: new MS.Entertainment.ViewModels.NodeValues(null, null, {selectedTemplate: MS.Entertainment.ViewModels.MusicSearchTemplates.all}), tracks: new MS.Entertainment.ViewModels.NodeValues(null, null, {selectedTemplate: MS.Entertainment.ViewModels.MusicSearchTemplates.primary}), albums: new MS.Entertainment.ViewModels.NodeValues(null, null, {selectedTemplate: MS.Entertainment.ViewModels.MusicSearchTemplates.primary}), artists: new MS.Entertainment.ViewModels.NodeValues(null, null, {selectedTemplate: MS.Entertainment.ViewModels.MusicSearchTemplates.primary}), playlists: new MS.Entertainment.ViewModels.NodeValues(null, null, {selectedTemplate: MS.Entertainment.ViewModels.MusicSearchTemplates.primary}), musicVideos: new MS.Entertainment.ViewModels.NodeValues(null, null, {selectedTemplate: MS.Entertainment.ViewModels.MusicSearchTemplates.wide})
                }, Modifiers: {
                    allMusicSources: {itemFactory: function() {
                            return [new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.MusicSearchAutomationIds.searchAllMusic, String.id.IDS_SEARCH_FILTER_MARKETPLACE, new MS.Entertainment.ViewModels.NodeValues(null, null, {
                                        showCollection: true, showMarketplace: true
                                    })), new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.MusicSearchAutomationIds.searchCollection, String.id.IDS_MUSIC_COLLECTION_PIVOT, new MS.Entertainment.ViewModels.NodeValues(null, null, {
                                        showCollection: true, showMarketplace: false
                                    }))]
                        }}, collectionOnly: {itemFactory: function() {
                                return [new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.MusicSearchAutomationIds.searchCollection, String.id.IDS_MUSIC_COLLECTION_PIVOT, new MS.Entertainment.ViewModels.NodeValues(null, null, {
                                            showCollection: true, showMarketplace: false
                                        })), ]
                            }}
                }, searchTypeResults: {
                    allMusic: [{
                            callFunction: "_findHCR", maxResults: 1
                        }, {
                            callFunction: "_collectionArtists", maxResults: 10, mediaType: Microsoft.Entertainment.Queries.ObjectType.person
                        }, {
                            callFunction: "_marketplaceArtists", maxResults: 5, mediaType: Microsoft.Entertainment.Queries.ObjectType.person
                        }, {
                            callFunction: "_collectionAlbums", maxResults: 10, mediaType: Microsoft.Entertainment.Queries.ObjectType.album
                        }, {
                            callFunction: "_marketplaceAlbums", maxResults: 10, mediaType: Microsoft.Entertainment.Queries.ObjectType.album
                        }, {
                            callFunction: "_collectionTracks", maxResults: 10, mediaType: Microsoft.Entertainment.Queries.ObjectType.track
                        }, {
                            callFunction: "_marketplaceTracks", maxResults: 10, mediaType: Microsoft.Entertainment.Queries.ObjectType.track
                        }, {
                            callFunction: "_collectionPlaylists", maxResults: 100, mediaType: Microsoft.Entertainment.Queries.ObjectType.person
                        }, ], tracks: [{
                                callFunction: "_collectionTracks", maxResults: 100, mediaType: Microsoft.Entertainment.Queries.ObjectType.track
                            }, {
                                callFunction: "_marketplaceTracks", maxResults: 100, mediaType: Microsoft.Entertainment.Queries.ObjectType.track
                            }, ], albums: [{
                                callFunction: "_collectionAlbums", maxResults: 100, mediaType: Microsoft.Entertainment.Queries.ObjectType.album
                            }, {
                                callFunction: "_marketplaceAlbums", maxResults: 100, mediaType: Microsoft.Entertainment.Queries.ObjectType.album
                            }], artists: [{
                                callFunction: "_collectionArtists", maxResults: 100, mediaType: Microsoft.Entertainment.Queries.ObjectType.person
                            }, {
                                callFunction: "_marketplaceArtists", maxResults: 100, mediaType: Microsoft.Entertainment.Queries.ObjectType.person
                            }], playlists: [{
                                callFunction: "_collectionPlaylists", maxResults: 100, mediaType: Microsoft.Entertainment.Queries.ObjectType.person
                            }, ]
                }
        })})
})()
