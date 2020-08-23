/* Copyright (C) Microsoft Corporation. All rights reserved. */
/* >>>>>>/viewmodels/video_win/tvstorehubviewmodel.js:2 */
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
            (function(TvStoreHubModuleKeys) {
                TvStoreHubModuleKeys[TvStoreHubModuleKeys["heroModule"] = 0] = "heroModule";
                TvStoreHubModuleKeys[TvStoreHubModuleKeys["newTv"] = 1] = "newTv";
                TvStoreHubModuleKeys[TvStoreHubModuleKeys["featuredTv"] = 2] = "featuredTv";
                TvStoreHubModuleKeys[TvStoreHubModuleKeys["lastNightTv"] = 3] = "lastNightTv";
                TvStoreHubModuleKeys[TvStoreHubModuleKeys["featuredSets"] = 4] = "featuredSets";
                TvStoreHubModuleKeys[TvStoreHubModuleKeys["topSellingTv"] = 5] = "topSellingTv"
            })(ViewModels.TvStoreHubModuleKeys || (ViewModels.TvStoreHubModuleKeys = {}));
            var TvStoreHubModuleKeys = ViewModels.TvStoreHubModuleKeys;
            var TvStoreHubViewModel = (function(_super) {
                    __extends(TvStoreHubViewModel, _super);
                    function TvStoreHubViewModel() {
                        _super.apply(this, arguments)
                    }
                    Object.defineProperty(TvStoreHubViewModel.prototype, "heroModule", {
                        get: function() {
                            return this.modules[0]
                        }, set: function(value) {
                                this._updateModuleAndNotify(0, "heroModule", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(TvStoreHubViewModel.prototype, "newTv", {
                        get: function() {
                            return this.modules[1]
                        }, set: function(value) {
                                this._updateModuleAndNotify(1, "newTv", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(TvStoreHubViewModel.prototype, "featuredTv", {
                        get: function() {
                            return this.modules[2]
                        }, set: function(value) {
                                this._updateModuleAndNotify(2, "featuredTv", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(TvStoreHubViewModel.prototype, "lastNightTv", {
                        get: function() {
                            return this.modules[3]
                        }, set: function(value) {
                                this._updateModuleAndNotify(3, "lastNightTv", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(TvStoreHubViewModel.prototype, "featuredSets", {
                        get: function() {
                            return this.modules[4]
                        }, set: function(value) {
                                this._updateModuleAndNotify(4, "featuredSets", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(TvStoreHubViewModel.prototype, "topSellingTv", {
                        get: function() {
                            return this.modules[5]
                        }, set: function(value) {
                                this._updateModuleAndNotify(5, "topSellingTv", value)
                            }, enumerable: true, configurable: true
                    });
                    TvStoreHubViewModel.prototype._initializeModules = function() {
                        this.modules = [ViewModels.VideoModuleFactory.createTVHeroModule(), ViewModels.VideoModuleFactory.createNewTvSeriesModule(), ViewModels.VideoModuleFactory.createFeaturedTvSeriesModule(), ViewModels.VideoModuleFactory.createLastNightTvModule(), ViewModels.VideoModuleFactory.createTvFeaturedSetsModule(), ViewModels.VideoModuleFactory.createTopSellingTvModule()];
                        this._primaryModule = this.newTv;
                        this._secondaryModule = this.featuredTv;
                        this._tertiaryModules = [this.lastNightTv, this.featuredSets, this.topSellingTv]
                    };
                    return TvStoreHubViewModel
                })(ViewModels.VideoStoreHubViewModelBase);
            ViewModels.TvStoreHubViewModel = TvStoreHubViewModel
        })(Entertainment.ViewModels || (Entertainment.ViewModels = {}));
        var ViewModels = Entertainment.ViewModels
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
})();
/* >>>>>>/controls/video_win/tvstorehub.js:91 */
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
                var TvStoreHub = (function(_super) {
                        __extends(TvStoreHub, _super);
                        function TvStoreHub(element, options) {
                            _super.call(this, element, options);
                            this.loadModulesImmediately = true;
                            MS.Entertainment.UI.Framework.processDeclarativeControlContainer(this)
                        }
                        TvStoreHub.prototype.onHeroCarouselInvoke = function(event) {
                            if (!MS.Entertainment.Utilities.isInvocationEvent(event))
                                return;
                            if (event.srcElement && !WinJS.Utilities.hasClass(event.srcElement, "win-navbutton"))
                                if (this._heroCarousel && this._heroCarousel.dataSource) {
                                    var item = this._heroCarousel.dataSource[this._heroCarousel.currentFlipViewPage];
                                    this.invokeModuleAction(item)
                                }
                        };
                        TvStoreHub.prototype.onModuleItemClicked = function(event) {
                            if (!MS.Entertainment.Utilities.isInvocationEvent(event))
                                return;
                            if (!MS.Entertainment.UI.NetworkStatusService.isOnline()) {
                                var errorCode = MS.Entertainment.Platform.Playback.Error.NS_E_WMPIM_USEROFFLINE.code;
                                MS.Entertainment.UI.Shell.showError(String.load(String.id.IDS_FAILED_PANEL_HEADER), errorCode)
                            }
                            else
                                _super.prototype.onModuleItemClicked.call(this, event)
                        };
                        TvStoreHub.isDeclarativeControlContainer = true;
                        TvStoreHub.tvItemSize = 160;
                        return TvStoreHub
                    })(Controls.PageViewBase);
                Controls.TvStoreHub = TvStoreHub
            })(UI.Controls || (UI.Controls = {}));
            var Controls = UI.Controls
        })(Entertainment.UI || (Entertainment.UI = {}));
        var UI = Entertainment.UI
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}));
WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.TvStoreHub)
})();
