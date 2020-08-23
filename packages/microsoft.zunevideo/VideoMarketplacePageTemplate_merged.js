/* Copyright (C) Microsoft Corporation. All rights reserved. */
/* >>>>>>/viewmodels/video_win/editorialvideomarketplaceviewmodel.js:2 */
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
    (function(Entertainment) {
        (function(ViewModels) {
            var EditorialVideoMarketplaceViewModel = (function(_super) {
                    __extends(EditorialVideoMarketplaceViewModel, _super);
                    function EditorialVideoMarketplaceViewModel(view) {
                        this._maxCount = 200;
                        var stringId = EditorialVideoMarketplaceViewModel.Titles[view];
                        Trace.assert(stringId, "EditorialVideoMarketplaceViewModel::constructor: Expected a string ID to be supplied for the gallery title.");
                        this.title = String.load(stringId);
                        _super.call(this, view);
                        this.refresh()
                    }
                    EditorialVideoMarketplaceViewModel.prototype.getViewDefinition = function(view) {
                        return EditorialVideoMarketplaceViewModel.Views[view]
                    };
                    EditorialVideoMarketplaceViewModel.prototype.getModifierDefinition = function(view) {
                        return EditorialVideoMarketplaceViewModel.Modifiers[view]
                    };
                    EditorialVideoMarketplaceViewModel.prototype.getModifierOptions = function(view) {
                        var definition = this.getViewDefinition(view);
                        return definition && definition.modelOptions
                    };
                    EditorialVideoMarketplaceViewModel.prototype.getSecondaryModifierDefinition = function(view) {
                        return EditorialVideoMarketplaceViewModel.SecondaryModifiers[view]
                    };
                    EditorialVideoMarketplaceViewModel.prototype._onItemsChanging = function(newItems, oldItems) {
                        _super.prototype._onItemsChanging.call(this, newItems, oldItems);
                        if (newItems)
                            newItems.maxCount = this._maxCount
                    };
                    EditorialVideoMarketplaceViewModel.ViewTypes = {
                        newMovies: "newMovies", featuredMovies: "featuredMovies", newTv: "newTv", featuredTv: "featuredTv", lastNightTv: "lastNightTv"
                    };
                    EditorialVideoMarketplaceViewModel.Titles = {
                        newMovies: String.id.IDS_VIDEO_LX_MOVIE_NEW_GALLERY_TITLE, featuredMovies: String.id.IDS_VIDEO_LX_MOVIE_FEATURED_GALLERY_TITLE, newTv: String.id.IDS_VIDEO_LX_TV_NEW_GALLERY_TITLE, featuredTv: String.id.IDS_VIDEO_LX_TV_FEATURED_GALLERY_TITLE, lastNightTv: String.id.IDS_VIDEO_LX_TV_LAST_NIGHT_GALLERY_TITLE
                    };
                    EditorialVideoMarketplaceViewModel.Views = {
                        newMovies: ViewModels.NodeValues.create({
                            query: function() {
                                return new Entertainment.Data.Query.Video.MovieNewReleasesQuery
                            }, queryOptions: {autoUpdateOnSignIn: true}, modelOptions: {
                                    selectedTemplate: new ViewModels.VideoMarketplaceLXTemplates.Movies, propertyKey: "serviceId", taskKeyGetter: Entertainment.UI.FileTransferService && Entertainment.UI.FileTransferService.keyFromProperty("serviceId", false, true), notifier: Entertainment.UI.FileTransferNotifiers && Entertainment.UI.FileTransferNotifiers.videoDownloadItem
                                }
                        }), featuredMovies: ViewModels.NodeValues.create({
                                query: function() {
                                    return new Entertainment.Data.Query.MovieHubFeaturedQuery
                                }, queryOptions: {autoUpdateOnSignIn: true}, modelOptions: {
                                        selectedTemplate: new ViewModels.VideoMarketplaceLXTemplates.Movies, propertyKey: "serviceId", taskKeyGetter: Entertainment.UI.FileTransferService && Entertainment.UI.FileTransferService.keyFromProperty("serviceId", false, true), notifier: Entertainment.UI.FileTransferNotifiers && Entertainment.UI.FileTransferNotifiers.videoDownloadItem
                                    }
                            }), newTv: ViewModels.NodeValues.create({
                                query: function() {
                                    return new Entertainment.Data.Query.Video.TvNewReleasesQuery
                                }, queryOptions: {autoUpdateOnSignIn: true}, modelOptions: {
                                        selectedTemplate: new ViewModels.VideoMarketplaceLXTemplates.TvSeries, propertyKey: "serviceId", taskKeyGetter: Entertainment.UI.FileTransferService && Entertainment.UI.FileTransferService.keyFromProperty("serviceId", false, true), notifier: Entertainment.UI.FileTransferNotifiers && Entertainment.UI.FileTransferNotifiers.episodeCollection
                                    }
                            }), featuredTv: ViewModels.NodeValues.create({
                                query: function() {
                                    return new Entertainment.Data.Query.TvHubFeaturedQuery
                                }, queryOptions: {autoUpdateOnSignIn: true}, modelOptions: {
                                        selectedTemplate: new ViewModels.VideoMarketplaceLXTemplates.TvSeries, propertyKey: "serviceId", taskKeyGetter: Entertainment.UI.FileTransferService && Entertainment.UI.FileTransferService.keyFromProperty("serviceId", false, true), notifier: Entertainment.UI.FileTransferNotifiers && Entertainment.UI.FileTransferNotifiers.episodeCollection
                                    }
                            }), lastNightTv: ViewModels.NodeValues.create({
                                query: function() {
                                    return new Entertainment.Data.Query.browseTVFromLastNight
                                }, queryOptions: {autoUpdateOnSignIn: true}, modelOptions: {
                                        selectedTemplate: new ViewModels.VideoMarketplaceLXTemplates.TvSeries, propertyKey: "serviceId", taskKeyGetter: Entertainment.UI.FileTransferService && Entertainment.UI.FileTransferService.keyFromProperty("serviceId", false, true), notifier: Entertainment.UI.FileTransferNotifiers && Entertainment.UI.FileTransferNotifiers.episodeCollection
                                    }
                            })
                    };
                    EditorialVideoMarketplaceViewModel.Modifiers = {
                        newMovies: {
                            itemQuery: function() {
                                return new Entertainment.Data.Query.Video.EdsMetadataMovieGenres
                            }, itemFactory: function() {
                                    return [new ViewModels.Node(ViewModels.VideoLXMarketplaceAutomationIds.allGenres, String.load(String.id.IDS_VIDEO_LX_MOVIE_GALLERY_MODIFIER_ALL_GENRES), ViewModels.NodeValues.create({queryOptions: {
                                                    genre: String.empty, studio: String.empty
                                                }}))]
                                }
                        }, featuredMovies: null, newTv: {
                                itemQuery: function() {
                                    return new Entertainment.Data.Query.Video.EdsMetadataTvGenres
                                }, itemFactory: function() {
                                        return [new ViewModels.Node(ViewModels.VideoLXMarketplaceAutomationIds.allGenres, String.load(String.id.IDS_VIDEO_LX_TV_GALLERY_MODIFIER_ALL_GENRES), ViewModels.NodeValues.create({queryOptions: {
                                                        genre: String.empty, network: String.empty
                                                    }}))]
                                    }
                            }, featuredTv: null, lastNightTv: null
                    };
                    EditorialVideoMarketplaceViewModel.SecondaryModifiers = {
                        newMovies: {
                            itemQuery: function() {
                                return new Entertainment.Data.Query.Video.EdsMetadataMovieStudios
                            }, itemFactory: function() {
                                    return [new ViewModels.Node(ViewModels.VideoLXMarketplaceAutomationIds.allStudios, String.load(String.id.IDS_VIDEO_LX_MOVIE_GALLERY_MODIFIER_ALL_STUDIOS), ViewModels.NodeValues.create({queryOptions: {studio: String.empty}}))]
                                }
                        }, featuredMovies: null, newTv: {
                                itemQuery: function() {
                                    return new Entertainment.Data.Query.Video.EdsMetadataTvNetworks
                                }, itemFactory: function() {
                                        return [new ViewModels.Node(ViewModels.VideoLXMarketplaceAutomationIds.allNetworks, String.load(String.id.IDS_VIDEO_LX_TV_GALLERY_MODIFIER_ALL_NETWORKS), ViewModels.NodeValues.create({queryOptions: {network: String.empty}}))]
                                    }
                            }, featuredTv: null, lastNightTv: null
                    };
                    return EditorialVideoMarketplaceViewModel
                })(ViewModels.VideoMarketplaceViewModelBase);
            ViewModels.EditorialVideoMarketplaceViewModel = EditorialVideoMarketplaceViewModel
        })(Entertainment.ViewModels || (Entertainment.ViewModels = {}));
        var ViewModels = Entertainment.ViewModels
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/video_win/featuredsetsmarketplaceviewmodel.js:129 */
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
    (function(Entertainment) {
        (function(ViewModels) {
            var FeaturedSetsMarketplaceViewModel = (function(_super) {
                    __extends(FeaturedSetsMarketplaceViewModel, _super);
                    function FeaturedSetsMarketplaceViewModel(view) {
                        var stringId = FeaturedSetsMarketplaceViewModel.Titles[view];
                        Trace.assert(stringId, "FeaturedSetsMarketplaceViewModel::constructor: Expected a string ID to be supplied for the gallery title.");
                        this.title = String.load(stringId);
                        _super.call(this, view);
                        this.refresh()
                    }
                    FeaturedSetsMarketplaceViewModel.prototype.getViewDefinition = function(view) {
                        return FeaturedSetsMarketplaceViewModel.Views[view]
                    };
                    FeaturedSetsMarketplaceViewModel.prototype.getModifierDefinition = function(view) {
                        return FeaturedSetsMarketplaceViewModel.Modifiers[view]
                    };
                    FeaturedSetsMarketplaceViewModel.prototype.getModifierOptions = function(view) {
                        var definition = this.getViewDefinition(view);
                        return definition && definition.modelOptions
                    };
                    FeaturedSetsMarketplaceViewModel.prototype.getSecondaryModifierDefinition = function(view) {
                        return FeaturedSetsMarketplaceViewModel.SecondaryModifiers[view]
                    };
                    FeaturedSetsMarketplaceViewModel.prototype._onItemsChanging = function(newItems, oldItems) {
                        _super.prototype._onItemsChanging.call(this, newItems, oldItems)
                    };
                    FeaturedSetsMarketplaceViewModel.prototype._onQueryCompleted = function(query) {
                        _super.prototype._onQueryCompleted.call(this, query);
                        var items = WinJS.Utilities.getMember("result.items", query);
                        var filteredItems = this._filterFeaturedSetItems(items, FeaturedSetsMarketplaceViewModel.ContentTypes[this.view]);
                        this._setItems(filteredItems)
                    };
                    FeaturedSetsMarketplaceViewModel.prototype._filterFeaturedSetItems = function(items, targetItemType) {
                        if (!items || !Array.isArray(items))
                            return;
                        var filtered = items.filter(function(item) {
                                var contentType = WinJS.Utilities.getMember("spotlightAction.contentType", item);
                                return contentType === MS.Entertainment.Data.Augmenter.Spotlight.ContentType.None || contentType === targetItemType
                            });
                        return filtered
                    };
                    FeaturedSetsMarketplaceViewModel.ViewTypes = {
                        tvFeaturedSets: "tvFeaturedSets", movieFeaturedSets: "movieFeaturedSets"
                    };
                    FeaturedSetsMarketplaceViewModel.Titles = {
                        tvFeaturedSets: String.id.IDS_VIDEO_FEATURED_SETS_TITLE, movieFeaturedSets: String.id.IDS_VIDEO_FEATURED_SETS_TITLE
                    };
                    FeaturedSetsMarketplaceViewModel.Views = {
                        tvFeaturedSets: ViewModels.NodeValues.create({
                            query: function() {
                                var query = new Entertainment.Data.Query.MediaDiscoveryVideoFlexHub;
                                query.target = ViewModels.QueryIds.featuredSets;
                                return query
                            }, queryOptions: {autoUpdateOnSignIn: true}, modelOptions: {
                                    selectedTemplate: new ViewModels.VideoMarketplaceLXTemplates.FeaturedSet, propertyKey: "serviceId", taskKeyGetter: Entertainment.UI.FileTransferService && Entertainment.UI.FileTransferService.keyFromProperty("serviceId", false, true), notifier: Entertainment.UI.FileTransferNotifiers && Entertainment.UI.FileTransferNotifiers.genericFile
                                }
                        }), movieFeaturedSets: ViewModels.NodeValues.create({
                                query: function() {
                                    var query = new Entertainment.Data.Query.MediaDiscoveryVideoFlexHub;
                                    query.target = ViewModels.QueryIds.featuredSets;
                                    return query
                                }, queryOptions: {autoUpdateOnSignIn: true}, modelOptions: {
                                        selectedTemplate: new ViewModels.VideoMarketplaceLXTemplates.FeaturedSet, propertyKey: "serviceId", taskKeyGetter: Entertainment.UI.FileTransferService && Entertainment.UI.FileTransferService.keyFromProperty("serviceId", false, true), notifier: Entertainment.UI.FileTransferNotifiers && Entertainment.UI.FileTransferNotifiers.genericFile
                                    }
                            })
                    };
                    FeaturedSetsMarketplaceViewModel.Modifiers = {
                        tvFeaturedSets: null, movieFeaturedSets: null
                    };
                    FeaturedSetsMarketplaceViewModel.SecondaryModifiers = {
                        tvFeaturedSets: null, movieFeaturedSets: null
                    };
                    FeaturedSetsMarketplaceViewModel.ContentTypes = {
                        tvFeaturedSets: MS.Entertainment.Data.Augmenter.Spotlight.ContentType.TV, movieFeaturedSets: MS.Entertainment.Data.Augmenter.Spotlight.ContentType.Movies
                    };
                    return FeaturedSetsMarketplaceViewModel
                })(ViewModels.VideoMarketplaceViewModelBase);
            ViewModels.FeaturedSetsMarketplaceViewModel = FeaturedSetsMarketplaceViewModel
        })(Entertainment.ViewModels || (Entertainment.ViewModels = {}));
        var ViewModels = Entertainment.ViewModels
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/video_win/topmoviesmarketplaceviewmodel.js:229 */
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
    (function(Entertainment) {
        (function(ViewModels) {
            (function(TopMoviesMarketplacePivotTypes) {
                TopMoviesMarketplacePivotTypes[TopMoviesMarketplacePivotTypes["topSellingMovies"] = 0] = "topSellingMovies";
                TopMoviesMarketplacePivotTypes[TopMoviesMarketplacePivotTypes["topRentedMovies"] = 1] = "topRentedMovies";
                TopMoviesMarketplacePivotTypes[TopMoviesMarketplacePivotTypes["topRatedMovies"] = 2] = "topRatedMovies"
            })(ViewModels.TopMoviesMarketplacePivotTypes || (ViewModels.TopMoviesMarketplacePivotTypes = {}));
            var TopMoviesMarketplacePivotTypes = ViewModels.TopMoviesMarketplacePivotTypes;
            var TopMoviesMarketplaceViewModel = (function(_super) {
                    __extends(TopMoviesMarketplaceViewModel, _super);
                    function TopMoviesMarketplaceViewModel(view, pivotType) {
                        this._maxCount = 200;
                        this.title = String.load(String.id.IDS_VIDEO_LX_MOVIE_GALLERY_TITLE);
                        var pivotIndex = this._getDefaultPivotIndex(pivotType);
                        _super.call(this, view, pivotIndex);
                        this.refresh()
                    }
                    TopMoviesMarketplaceViewModel.prototype.getViewDefinition = function(view) {
                        return TopMoviesMarketplaceViewModel.Views[view]
                    };
                    TopMoviesMarketplaceViewModel.prototype.getPivotDefinition = function(view) {
                        return TopMoviesMarketplaceViewModel.Pivots[view]
                    };
                    TopMoviesMarketplaceViewModel.prototype.getModifierDefinition = function(view) {
                        return TopMoviesMarketplaceViewModel.Modifiers.all
                    };
                    TopMoviesMarketplaceViewModel.prototype.getModifierOptions = function(view) {
                        var definition = this.getViewDefinition(view);
                        var pivot = this.getPivotDefinition(view);
                        return MS.Entertainment.Utilities.uniteObjects(WinJS.Utilities.getMember("value.modifierOptions", pivot), definition && definition.modelOptions)
                    };
                    TopMoviesMarketplaceViewModel.prototype.getSecondaryModifierDefinition = function(view) {
                        return TopMoviesMarketplaceViewModel.SecondaryModifiers.all
                    };
                    TopMoviesMarketplaceViewModel.prototype._getDefaultPivotIndex = function(pivotType) {
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
                    TopMoviesMarketplaceViewModel.prototype._onItemsChanging = function(newItems, oldItems) {
                        _super.prototype._onItemsChanging.call(this, newItems, oldItems);
                        if (newItems)
                            newItems.maxCount = this._maxCount
                    };
                    TopMoviesMarketplaceViewModel.ViewTypes = {topMovies: "topMovies"};
                    TopMoviesMarketplaceViewModel.Views = {topMovies: ViewModels.NodeValues.create({
                            queryOptions: {
                                autoUpdateOnSignIn: true, hasTotalCount: true
                            }, modelOptions: {
                                    propertyKey: "serviceId", taskKeyGetter: Entertainment.UI.FileTransferService && Entertainment.UI.FileTransferService.keyFromProperty("mediaId", false, true), notifier: Entertainment.UI.FileTransferNotifiers && Entertainment.UI.FileTransferNotifiers.videoDownloadItem
                                }
                        })};
                    TopMoviesMarketplaceViewModel.Pivots = {topMovies: {itemFactory: function() {
                                return [new ViewModels.Node(ViewModels.VideoLXMarketplaceAutomationIds.topSellingMovies, String.load(String.id.IDS_VIDEO_LX_MOVIE_GALLERY_PIVOT_TOP_SELLING), ViewModels.NodeValues.create({
                                            query: Entertainment.Data.Query.Video.EdsBrowseTopMoviesDetailed, queryOptions: {orderBy: MS.Entertainment.Data.Query.edsSortOrder.sevenDaysPurchaseCount}, modelOptions: {selectedTemplate: new ViewModels.VideoMarketplaceLXTemplates.TopMovies}
                                        })), new ViewModels.Node(ViewModels.VideoLXMarketplaceAutomationIds.topRentedMovies, String.load(String.id.IDS_VIDEO_LX_MOVIE_GALLERY_PIVOT_TOP_RENTALS), ViewModels.NodeValues.create({
                                            query: Entertainment.Data.Query.Video.EdsBrowseTopMoviesDetailed, queryOptions: {orderBy: MS.Entertainment.Data.Query.edsSortOrder.sevenDaysRentalCount}, modelOptions: {selectedTemplate: new ViewModels.VideoMarketplaceLXTemplates.TopMovies}
                                        })), new ViewModels.Node(ViewModels.VideoLXMarketplaceAutomationIds.topRatedMovies, String.load(String.id.IDS_VIDEO_LX_MOVIE_GALLERY_PIVOT_TOP_RATED), ViewModels.NodeValues.create({
                                            query: Entertainment.Data.Query.Video.EdsBrowseTopMoviesDetailed, queryOptions: {orderBy: MS.Entertainment.Data.Query.edsSortOrder.allTimeAverageRating}, modelOptions: {selectedTemplate: new ViewModels.VideoMarketplaceLXTemplates.TopRatedMovies}
                                        }))]
                            }}};
                    TopMoviesMarketplaceViewModel.Modifiers = {all: {
                            itemQuery: function() {
                                return new Entertainment.Data.Query.Video.EdsMetadataMovieGenres
                            }, itemFactory: function() {
                                    return [new ViewModels.Node(ViewModels.VideoLXMarketplaceAutomationIds.allGenres, String.load(String.id.IDS_VIDEO_LX_MOVIE_GALLERY_MODIFIER_ALL_GENRES), ViewModels.NodeValues.create({queryOptions: {
                                                    genre: String.empty, studio: String.empty
                                                }}))]
                                }
                        }};
                    TopMoviesMarketplaceViewModel.SecondaryModifiers = {all: {
                            itemQuery: function() {
                                return new Entertainment.Data.Query.Video.EdsMetadataMovieStudios
                            }, itemFactory: function() {
                                    return [new ViewModels.Node(ViewModels.VideoLXMarketplaceAutomationIds.allStudios, String.load(String.id.IDS_VIDEO_LX_MOVIE_GALLERY_MODIFIER_ALL_STUDIOS), ViewModels.NodeValues.create({queryOptions: {studio: String.empty}}))]
                                }
                        }};
                    return TopMoviesMarketplaceViewModel
                })(ViewModels.VideoMarketplaceViewModelBase);
            ViewModels.TopMoviesMarketplaceViewModel = TopMoviesMarketplaceViewModel
        })(Entertainment.ViewModels || (Entertainment.ViewModels = {}));
        var ViewModels = Entertainment.ViewModels
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/video_win/toptvmarketplaceviewmodel.js:343 */
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
    (function(Entertainment) {
        (function(ViewModels) {
            (function(TopTvMarketplacePivotTypes) {
                TopTvMarketplacePivotTypes[TopTvMarketplacePivotTypes["topSellingTv"] = 0] = "topSellingTv";
                TopTvMarketplacePivotTypes[TopTvMarketplacePivotTypes["topRatedTv"] = 1] = "topRatedTv"
            })(ViewModels.TopTvMarketplacePivotTypes || (ViewModels.TopTvMarketplacePivotTypes = {}));
            var TopTvMarketplacePivotTypes = ViewModels.TopTvMarketplacePivotTypes;
            var TopTvMarketplaceViewModel = (function(_super) {
                    __extends(TopTvMarketplaceViewModel, _super);
                    function TopTvMarketplaceViewModel(view, pivotType) {
                        this._maxCount = 200;
                        this.title = String.load(String.id.IDS_VIDEO_LX_TV_GALLERY_TITLE);
                        var pivotIndex = this._getDefaultPivotIndex(pivotType);
                        _super.call(this, view, pivotIndex);
                        this.refresh()
                    }
                    TopTvMarketplaceViewModel.prototype.getViewDefinition = function(view) {
                        return TopTvMarketplaceViewModel.Views[view]
                    };
                    TopTvMarketplaceViewModel.prototype.getPivotDefinition = function(view) {
                        return TopTvMarketplaceViewModel.Pivots[view]
                    };
                    TopTvMarketplaceViewModel.prototype.getModifierDefinition = function(view) {
                        return TopTvMarketplaceViewModel.Modifiers.all
                    };
                    TopTvMarketplaceViewModel.prototype.getModifierOptions = function(view) {
                        var definition = this.getViewDefinition(view);
                        var pivot = this.getPivotDefinition(view);
                        return MS.Entertainment.Utilities.uniteObjects(WinJS.Utilities.getMember("value.modifierOptions", pivot), definition && definition.modelOptions)
                    };
                    TopTvMarketplaceViewModel.prototype.getSecondaryModifierDefinition = function(view) {
                        return TopTvMarketplaceViewModel.SecondaryModifiers.all
                    };
                    TopTvMarketplaceViewModel.prototype._getDefaultPivotIndex = function(pivotType) {
                        var pivotIndex;
                        switch (pivotType) {
                            case 0:
                                pivotIndex = 0;
                                break;
                            case 1:
                                pivotIndex = 1;
                                break;
                            default:
                                pivotIndex = -1;
                                break
                        }
                        return pivotIndex
                    };
                    TopTvMarketplaceViewModel.prototype._onItemsChanging = function(newItems, oldItems) {
                        _super.prototype._onItemsChanging.call(this, newItems, oldItems);
                        if (newItems)
                            newItems.maxCount = this._maxCount
                    };
                    TopTvMarketplaceViewModel.ViewTypes = {topTv: "topTv"};
                    TopTvMarketplaceViewModel.Views = {topTv: ViewModels.NodeValues.create({
                            queryOptions: {
                                autoUpdateOnSignIn: true, hasTotalCount: true
                            }, modelOptions: {
                                    propertyKey: "serviceId", taskKeyGetter: Entertainment.UI.FileTransferService && Entertainment.UI.FileTransferService.keyFromProperty("mediaId", false, true), notifier: Entertainment.UI.FileTransferNotifiers && Entertainment.UI.FileTransferNotifiers.episodeCollection
                                }
                        })};
                    TopTvMarketplaceViewModel.Pivots = {topTv: {itemFactory: function() {
                                return [new ViewModels.Node(ViewModels.VideoLXMarketplaceAutomationIds.topSellingTv, String.load(String.id.IDS_VIDEO_LX_TV_GALLERY_PIVOT_TOP_SELLING), ViewModels.NodeValues.create({
                                            query: Entertainment.Data.Query.Video.EdsBrowseTvSeriesDetailed, queryOptions: {orderBy: MS.Entertainment.Data.Query.edsSortOrder.sevenDaysPurchaseCount}, modelOptions: {selectedTemplate: new ViewModels.VideoMarketplaceLXTemplates.TopTvSeries}
                                        })), new ViewModels.Node(ViewModels.VideoLXMarketplaceAutomationIds.topRatedTv, String.load(String.id.IDS_VIDEO_LX_TV_GALLERY_PIVOT_TOP_RATED), ViewModels.NodeValues.create({
                                            query: Entertainment.Data.Query.Video.EdsBrowseTvSeriesDetailed, queryOptions: {orderBy: MS.Entertainment.Data.Query.edsSortOrder.allTimeAverageRating}, modelOptions: {selectedTemplate: new ViewModels.VideoMarketplaceLXTemplates.TopRatedTvSeries}
                                        }))]
                            }}};
                    TopTvMarketplaceViewModel.Modifiers = {all: {
                            itemQuery: function() {
                                return new Entertainment.Data.Query.Video.EdsMetadataTvGenres
                            }, itemFactory: function() {
                                    return [new ViewModels.Node(ViewModels.VideoLXMarketplaceAutomationIds.allGenres, String.load(String.id.IDS_VIDEO_LX_TV_GALLERY_MODIFIER_ALL_GENRES), ViewModels.NodeValues.create({queryOptions: {
                                                    genre: String.empty, network: String.empty
                                                }}))]
                                }
                        }};
                    TopTvMarketplaceViewModel.SecondaryModifiers = {all: {
                            itemQuery: function() {
                                return new Entertainment.Data.Query.Video.EdsMetadataTvNetworks
                            }, itemFactory: function() {
                                    return [new ViewModels.Node(ViewModels.VideoLXMarketplaceAutomationIds.allStudios, String.load(String.id.IDS_VIDEO_LX_TV_GALLERY_MODIFIER_ALL_NETWORKS), ViewModels.NodeValues.create({queryOptions: {network: String.empty}}))]
                                }
                        }};
                    return TopTvMarketplaceViewModel
                })(ViewModels.VideoMarketplaceViewModelBase);
            ViewModels.TopTvMarketplaceViewModel = TopTvMarketplaceViewModel
        })(Entertainment.ViewModels || (Entertainment.ViewModels = {}));
        var ViewModels = Entertainment.ViewModels
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
})();
