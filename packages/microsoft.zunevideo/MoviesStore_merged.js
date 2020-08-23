/* Copyright (C) Microsoft Corporation. All rights reserved. */
/* >>>>>>/viewmodels/video_win/moviesstorehubviewmodel.js:2 */
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
    (function(Entertainment) {
        (function(ViewModels) {
            (function(MoviesStoreHubModuleKeys) {
                MoviesStoreHubModuleKeys[MoviesStoreHubModuleKeys["heroModule"] = 0] = "heroModule";
                MoviesStoreHubModuleKeys[MoviesStoreHubModuleKeys["newMovies"] = 1] = "newMovies";
                MoviesStoreHubModuleKeys[MoviesStoreHubModuleKeys["featuredMovies"] = 2] = "featuredMovies";
                MoviesStoreHubModuleKeys[MoviesStoreHubModuleKeys["featuredSets"] = 3] = "featuredSets";
                MoviesStoreHubModuleKeys[MoviesStoreHubModuleKeys["topSellingMovies"] = 4] = "topSellingMovies"
            })(ViewModels.MoviesStoreHubModuleKeys || (ViewModels.MoviesStoreHubModuleKeys = {}));
            var MoviesStoreHubModuleKeys = ViewModels.MoviesStoreHubModuleKeys;
            var MoviesStoreHubViewModel = (function(_super) {
                    __extends(MoviesStoreHubViewModel, _super);
                    function MoviesStoreHubViewModel() {
                        _super.apply(this, arguments)
                    }
                    Object.defineProperty(MoviesStoreHubViewModel.prototype, "heroModule", {
                        get: function() {
                            return this.modules[0]
                        }, set: function(value) {
                                this._updateModuleAndNotify(0, "heroModule", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MoviesStoreHubViewModel.prototype, "newMovies", {
                        get: function() {
                            return this.modules[1]
                        }, set: function(value) {
                                this._updateModuleAndNotify(1, "newMovies", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MoviesStoreHubViewModel.prototype, "featuredMovies", {
                        get: function() {
                            return this.modules[2]
                        }, set: function(value) {
                                this._updateModuleAndNotify(2, "featuredMovies", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MoviesStoreHubViewModel.prototype, "featuredSets", {
                        get: function() {
                            return this.modules[3]
                        }, set: function(value) {
                                this._updateModuleAndNotify(3, "featuredSets", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MoviesStoreHubViewModel.prototype, "topSellingMovies", {
                        get: function() {
                            return this.modules[4]
                        }, set: function(value) {
                                this._updateModuleAndNotify(4, "topSellingMovies", value)
                            }, enumerable: true, configurable: true
                    });
                    MoviesStoreHubViewModel.prototype._initializeModules = function() {
                        this.modules = [ViewModels.VideoModuleFactory.createMoviesHeroModule(), ViewModels.VideoModuleFactory.createNewMoviesModule(), ViewModels.VideoModuleFactory.createFeaturedMoviesModule(), ViewModels.VideoModuleFactory.createMovieFeaturedSetsModule(), ViewModels.VideoModuleFactory.createTopSellingMoviesModule()];
                        this._primaryModule = this.newMovies;
                        this._secondaryModule = this.featuredMovies;
                        this._tertiaryModules = [this.featuredSets, this.topSellingMovies]
                    };
                    return MoviesStoreHubViewModel
                })(ViewModels.VideoStoreHubViewModelBase);
            ViewModels.MoviesStoreHubViewModel = MoviesStoreHubViewModel
        })(Entertainment.ViewModels || (Entertainment.ViewModels = {}));
        var ViewModels = Entertainment.ViewModels
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
})();
/* >>>>>>/controls/video_win/moviesstorehub.js:83 */
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
        (function(UI) {
            (function(Controls) {
                var MoviesStoreHub = (function(_super) {
                        __extends(MoviesStoreHub, _super);
                        function MoviesStoreHub(element, options) {
                            _super.call(this, element, options);
                            this.loadModulesImmediately = true;
                            MS.Entertainment.UI.Framework.processDeclarativeControlContainer(this)
                        }
                        MoviesStoreHub.prototype.onHeroCarouselInvoke = function(event) {
                            if (!MS.Entertainment.Utilities.isInvocationEvent(event))
                                return;
                            if (event.srcElement && !WinJS.Utilities.hasClass(event.srcElement, "win-navbutton"))
                                if (this._heroCarousel && this._heroCarousel.dataSource) {
                                    var item = this._heroCarousel.dataSource[this._heroCarousel.currentFlipViewPage];
                                    this.invokeModuleAction(item)
                                }
                        };
                        MoviesStoreHub.prototype.onModuleItemClicked = function(event) {
                            if (!MS.Entertainment.Utilities.isInvocationEvent(event))
                                return;
                            if (!MS.Entertainment.UI.NetworkStatusService.isOnline()) {
                                var errorCode = MS.Entertainment.Platform.Playback.Error.NS_E_WMPIM_USEROFFLINE.code;
                                MS.Entertainment.UI.Shell.showError(String.load(String.id.IDS_FAILED_PANEL_HEADER), errorCode)
                            }
                            else
                                _super.prototype.onModuleItemClicked.call(this, event)
                        };
                        MoviesStoreHub.isDeclarativeControlContainer = true;
                        MoviesStoreHub.movieItemSize = 160;
                        return MoviesStoreHub
                    })(Controls.PageViewBase);
                Controls.MoviesStoreHub = MoviesStoreHub
            })(UI.Controls || (UI.Controls = {}));
            var Controls = UI.Controls
        })(Entertainment.UI || (Entertainment.UI = {}));
        var UI = Entertainment.UI
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}));
WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.MoviesStoreHub)
})();
