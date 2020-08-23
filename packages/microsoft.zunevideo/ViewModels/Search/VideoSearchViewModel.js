/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {VideoSearchResultCounts: MS.Entertainment.defineObservable(function videoSearchResultCountsConstructor(){}, {
            allCount: -1, hcrCount: -1, videoOfflineCount: -1, videoOnlineCount: -1, otherVideoLocalResultCount: -1, backup: function backup() {
                    return {
                            allCount: this.allCount, hcrCount: this.hcrCount, videoOfflineCount: this.videoOfflineCount, videoOnlineCount: this.videoOnlineCount, otherVideoLocalResultCount: this.otherVideoLocalResultCount
                        }
                }, restore: function restore(savedSearchResultCounts) {
                    this.allCount = savedSearchResultCounts.allCount;
                    this.hcrCount = savedSearchResultCounts.hcrCount;
                    this.videoOfflineCount = savedSearchResultCounts.videoOfflineCount;
                    this.videoOnlineCount = savedSearchResultCounts.videoOnlineCount;
                    this.otherVideoLocalResultCount = savedSearchResultCounts.otherVideoLocalResultCount
                }, clearCounts: function clearCounts() {
                    this.allCount = -1;
                    this.hcrCount = -1;
                    this.videoOfflineCount = -1;
                    this.videoOnlineCount = -1;
                    this.otherVideoLocalResultCount = -1
                }
        })});
    MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.searchResultCounts, function getSearchResultCountsService() {
        return new MS.Entertainment.ViewModels.VideoSearchResultCounts
    });
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {VideoSearchAutomationIds: {
            videoSearchAll: "videoSearchAll_modifier", videoSearchMarketplace: "videoSearchMarketplace_modifier", videoSearchMovies: "videoSearchMovies_modifier", videoSearchTV: "videoSearchTV_modifier", videoSearchCast: "videoSearchCast_modifier"
        }});
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {VideoSearchViewModel: MS.Entertainment.UI.Framework.derive("MS.Entertainment.ViewModels.NewSearchViewModel", function videoSearchViewModelConstructor(searchType, movieMarketplaceEnabled, tvMarketplaceEnabled, actorSearchEnabled) {
            this._defaultModifierSelection = MS.Entertainment.ViewModels.SearchViewModel.SearchCurrentFilter;
            this._searchTypeResults = MS.Entertainment.ViewModels.VideoSearchViewModel.searchTypeResults;
            this._views = MS.Entertainment.ViewModels.VideoSearchViewModel.Views;
            this._movieMarketplaceEnabled = movieMarketplaceEnabled;
            this._tvMarketplaceEnabled = tvMarketplaceEnabled;
            this._actorSearchEnabled = actorSearchEnabled;
            this._maxResultCount = 25;
            this._hideHcrIfOffline = true;
            this._addHcrToResults = true;
            this._hideHeaderForHCR = true;
            MS.Entertainment.ViewModels.NewSearchViewModel.prototype.constructor.call(this, searchType)
        }, {
            _movieMarketplaceEnabled: false, _tvMarketplaceEnabled: false, _actorSearchEnabled: false, getModifierDefinition: function getModifierDefinition(view) {
                    var modifiers = {itemFactory: function() {
                                var searchResultCounts = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.searchResultCounts);
                                var hasLocalMovieResults = searchResultCounts.videoOfflineCount > 0;
                                var hasLocalTVResults = searchResultCounts.videoOfflineCount > 0;
                                var showMarketplace = (this._movieMarketplaceEnabled || this._tvMarketplaceEnabled);
                                var showMovies = (this._movieMarketplaceEnabled || hasLocalMovieResults);
                                var showTV = (this._tvMarketplaceEnabled || hasLocalTVResults);
                                var showCast = this._actorSearchEnabled && MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.graceNoteService);
                                var nodes = [];
                                if (showMarketplace) {
                                    if (showMovies && showTV)
                                        nodes = nodes.concat([new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.VideoSearchAutomationIds.videoSearchAll, String.id.IDS_SEARCH_FILTER_ALL, new MS.Entertainment.ViewModels.NodeValues(null, null, {
                                                showMarketplace: true, showCollection: true, showMovies: true, showTVSeries: true, showCast: showCast, showOtherVideos: !MS.Entertainment.Utilities.isVideoApp2
                                            }))]);
                                    if (showMovies)
                                        nodes = nodes.concat([new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.VideoSearchAutomationIds.videoSearchMovies, String.id.IDS_MOVIE_COLLECTION_TITLE, new MS.Entertainment.ViewModels.NodeValues(null, null, {
                                                showMarketplace: true, showCollection: true, showMovies: true, showTVSeries: false, showCast: false, showOtherVideos: false
                                            }))]);
                                    if (showTV)
                                        nodes = nodes.concat([new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.VideoSearchAutomationIds.videoSearchTV, String.id.IDS_TV_COLLECTION_TITLE, new MS.Entertainment.ViewModels.NodeValues(null, null, {
                                                showMarketplace: true, showCollection: true, showMovies: false, showTVSeries: true, showCast: false, showOtherVideos: false
                                            }))]);
                                    if (showCast)
                                        nodes = nodes.concat([new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.VideoSearchAutomationIds.videoSearchCast, String.id.IDS_VIDEO2_SEARCH_CAST_FILTER_VUI_GUI, new MS.Entertainment.ViewModels.NodeValues(null, null, {
                                                showMarketplace: false, showCollection: false, showMovies: false, showTVSeries: false, showCast: true, showOtherVideos: false
                                            }))])
                                }
                                else
                                    nodes = [new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.VideoSearchAutomationIds.videoSearchAll, String.id.IDS_SEARCH_FILTER_ALL, new MS.Entertainment.ViewModels.NodeValues(null, null, {
                                            showMarketplace: false, showCollection: false, showMovies: false, showTVSeries: false, showCast: false, showOtherVideos: true
                                        }))];
                                return nodes
                            }.bind(this)};
                    return modifiers
                }, _collectionVideos: function _collectionVideos(query, resultType, options) {
                    this._addSearchCallback(query, resultType, options, "videoOfflineResult", options.showCollection && (options.showMovies || options.showTVSeries))
                }, _marketplaceVideos: function _marketplaceVideos(query, resultType, options) {
                    if (this._isOnline)
                        this._addSearchCallback(query, resultType, options, "videoOnlineResult", options.showMarketplace && (options.showMovies || options.showTVSeries));
                    else
                        this._setResultPopulated(resultType, 0, true)
                }, _otherVideos: function _otherVideos(query, resultType, options) {
                    this._addSearchCallback(query, resultType, options, "otherVideoLocalResult", options.showOtherVideos)
                }, _graceNoteCast: function _cast(query, resultType, options) {
                    this._addSearchCallback(query, resultType, options, "graceNoteCastResult", options.showCast && !options.showMovies && !options.showTVSeries)
                }, _updateResultCounts: function _updateResultCounts(options) {
                    if (options.showCollection && (options.showMovies || options.showTVSeries))
                        this._addResultCount("videoOfflineResult", "videoOfflineCount", 25);
                    if (options.showMarketplace && (options.showMovies || options.showTVSeries))
                        this._addResultCount("videoOnlineResult", "videoOnlineCount", 25);
                    if (options.showOtherVideos)
                        this._addResultCount("otherVideoLocalResult", "otherVideoLocalResultCount", 25);
                    if (options.showCast)
                        this._addResultCount("graceNoteCastResult", "graceNoteCastResult", 10);
                    var searchResultCounts = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.searchResultCounts);
                    searchResultCounts.hcrCount = (this._hcrResult && this._hcrResult.hcrResult) ? 1 : 0;
                    searchResultCounts.allCount += searchResultCounts.hcrCount
                }, _getHCRResult: function _getHCRResult() {
                    return new MS.Entertainment.ViewModels.VideoHCRResult
                }, _searchCompleted: function _searchCompleted() {
                    MS.Entertainment.ViewModels.NewSearchViewModel.prototype._searchCompleted.call(this);
                    var searchResultCounts = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.searchResultCounts);
                    if (searchResultCounts.allCount === -1) {
                        searchResultCounts.allCount = 0;
                        searchResultCounts.hcrCount = 0;
                        searchResultCounts.videoOfflineCount = 0;
                        searchResultCounts.videoOnlineCount = 0;
                        searchResultCounts.otherVideoLocalResultCount = 0
                    }
                }, _clearSearch: function _clearSearch() {
                    this._setLargeItemIndex(-1);
                    MS.Entertainment.ViewModels.NewSearchViewModel.prototype._clearSearch.call(this)
                }
        }, {
            ViewTypes: {
                allVideo: "allVideo", movies: "movies", tvShows: "tvShows", noMarketplace: "noMarketplace"
            }, ViewIndex: {
                    allVideo: 0, movies: 1, tvShows: 2, noMarketplace: 0
                }, Views: {
                    allVideo: new MS.Entertainment.ViewModels.NodeValues(null, null, {selectedTemplate: MS.Entertainment.ViewModels.VideoSearchTemplates.all}), noMarketplace: new MS.Entertainment.ViewModels.NodeValues(null, null, {selectedTemplate: MS.Entertainment.ViewModels.VideoSearchTemplates.noMarketplace})
                }, searchTypeResults: {
                    allVideo: [{
                            callFunction: "_otherVideos", maxResults: 25, mediaType: Microsoft.Entertainment.Queries.ObjectType.video, videoType: Microsoft.Entertainment.Queries.VideoType.other
                        }, {
                            callFunction: "_collectionVideos", maxResults: 50, mediaType: Microsoft.Entertainment.Queries.ObjectType.video, videoType: Microsoft.Entertainment.Queries.VideoType.movie, includesHcrResult: true
                        }, {
                            callFunction: "_marketplaceVideos", maxResults: 50, mediaType: Microsoft.Entertainment.Queries.ObjectType.video, videoType: Microsoft.Entertainment.Queries.VideoType.movie, includesHcrResult: true
                        }, {
                            callFunction: "_graceNoteCast", maxResults: 10, mediaType: Microsoft.Entertainment.Queries.ObjectType.video, videoType: Microsoft.Entertainment.Queries.VideoType.other
                        }], noMarketplace: [{
                                callFunction: "_otherVideos", maxResults: 25, mediaType: Microsoft.Entertainment.Queries.ObjectType.video, videoType: Microsoft.Entertainment.Queries.VideoType.other
                            }, ]
                }
        })})
})()
