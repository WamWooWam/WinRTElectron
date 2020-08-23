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
    (function(Entertainment) {
        (function(UI) {
            (function(Video) {
                var MovieDemoDashboardDataContext = (function() {
                        function MovieDemoDashboardDataContext() {
                            this.doNotRaisePanelReady = false;
                            this.hideNavigationContainer = true;
                            this.viewModel = new MS.Entertainment.UI.Video.DemoDashboardViewModel([{imageUriOverride: "ms-appdata:///local/Images/movie_01.png"}, {imageUriOverride: "ms-appdata:///local/Images/movie_02.png"}, {imageUriOverride: "ms-appdata:///local/Images/movie_03.png"}, {imageUriOverride: "ms-appdata:///local/Images/movie_04.png"}, {imageUriOverride: "ms-appdata:///local/Images/movie_05.png"}, {imageUriOverride: "ms-appdata:///local/Images/movie_06.png"}], "MS.Entertainment.Pages.VideoInlineDetailsSpotlightDemo");
                            this.viewModel.getItems()
                        }
                        return MovieDemoDashboardDataContext
                    })();
                Video.MovieDemoDashboardDataContext = MovieDemoDashboardDataContext;
                var TvDemoDashboardDataContext = (function() {
                        function TvDemoDashboardDataContext() {
                            this.doNotRaisePanelReady = false;
                            this.hideNavigationContainer = true;
                            this.viewModel = new MS.Entertainment.UI.Video.DemoDashboardViewModel([{imageUriOverride: "ms-appdata:///local/Images/tv_01.png"}, {imageUriOverride: "ms-appdata:///local/Images/tv_02.png"}, {imageUriOverride: "ms-appdata:///local/Images/tv_03.png"}, {imageUriOverride: "ms-appdata:///local/Images/tv_04.png"}, {imageUriOverride: "ms-appdata:///local/Images/tv_05.png"}, {imageUriOverride: "ms-appdata:///local/Images/tv_06.png"}], "MS.Entertainment.Pages.VideoInlineDetailsMarketplaceDemo");
                            this.viewModel.getItems()
                        }
                        return TvDemoDashboardDataContext
                    })();
                Video.TvDemoDashboardDataContext = TvDemoDashboardDataContext;
                var DemoDashboardViewModel = (function(_super) {
                        __extends(DemoDashboardViewModel, _super);
                        function DemoDashboardViewModel(items, popoverConstructor) {
                            _super.call(this, items.length, 0, false);
                            this._items = items;
                            this._popoverConstructor = popoverConstructor
                        }
                        DemoDashboardViewModel.prototype._getResultsFromQuery = function() {
                            return WinJS.Promise.wrap({primaryPanelItems: this._items})
                        };
                        DemoDashboardViewModel.prototype._wrapEditorialItem = function(item) {
                            item.doclick = function() {
                                var popOverParameters = null;
                                popOverParameters = {itemConstructor: this._popoverConstructor};
                                MS.Entertainment.UI.Controls.PopOver.showNonMediaPopOver(popOverParameters)
                            }.bind(this);
                            return WinJS.Binding.as(item)
                        };
                        DemoDashboardViewModel.prototype.canDisplayMediaType = function(item) {
                            return true
                        };
                        DemoDashboardViewModel.prototype._getPrimaryContentPanel = function() {
                            return new Video.VideoHubDashboardContentPanel
                        };
                        DemoDashboardViewModel.prototype._getSecondaryContentPanel = function() {
                            return null
                        };
                        DemoDashboardViewModel.prototype._getActions = function() {
                            return []
                        };
                        return DemoDashboardViewModel
                    })(Video.VideoHubDashboardViewModel);
                Video.DemoDashboardViewModel = DemoDashboardViewModel
            })(UI.Video || (UI.Video = {}));
            var Video = UI.Video
        })(Entertainment.UI || (Entertainment.UI = {}));
        var UI = Entertainment.UI
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
