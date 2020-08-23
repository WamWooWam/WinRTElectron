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
                var MovieDashboardDataContext = (function() {
                        function MovieDashboardDataContext() {
                            this.doNotRaisePanelReady = false;
                            this.hideNavigationContainer = true;
                            this.viewModel = MS.Entertainment.UI.Video.MovieDashboardViewModel.sharedInstance
                        }
                        MovieDashboardDataContext.prototype.dispose = function() {
                            if (this.viewModel && this.viewModel.dispose)
                                this.viewModel.dispose()
                        };
                        return MovieDashboardDataContext
                    })();
                Video.MovieDashboardDataContext = MovieDashboardDataContext;
                var NewMoviesDashboardDataContext = (function() {
                        function NewMoviesDashboardDataContext() {
                            this.doNotRaisePanelReady = false;
                            this.hideNavigationContainer = true;
                            this.panelAction = null;
                            this.viewModel = MS.Entertainment.UI.Video.MovieDashboardViewModel.sharedInstance;
                            this.panelAction = {action: this.viewModel.viewModelData.primaryContentPanel.moreAction}
                        }
                        NewMoviesDashboardDataContext.prototype.dispose = function() {
                            if (this.viewModel && this.viewModel.dispose)
                                this.viewModel.dispose()
                        };
                        return NewMoviesDashboardDataContext
                    })();
                Video.NewMoviesDashboardDataContext = NewMoviesDashboardDataContext;
                var FeaturedMoviesDashboardDataContext = (function() {
                        function FeaturedMoviesDashboardDataContext() {
                            this.doNotRaisePanelReady = false;
                            this.hideNavigationContainer = true;
                            this.panelAction = null;
                            this.viewModel = MS.Entertainment.UI.Video.MovieDashboardViewModel.sharedInstance;
                            this.panelAction = {action: this.viewModel.viewModelData.secondaryContentPanel.moreAction}
                        }
                        FeaturedMoviesDashboardDataContext.prototype.dispose = function() {
                            if (this.viewModel && this.viewModel.dispose)
                                this.viewModel.dispose()
                        };
                        return FeaturedMoviesDashboardDataContext
                    })();
                Video.FeaturedMoviesDashboardDataContext = FeaturedMoviesDashboardDataContext;
                var MovieDashboardViewModel = (function(_super) {
                        __extends(MovieDashboardViewModel, _super);
                        function MovieDashboardViewModel(maxNewReleaseItems, maxFeaturedItems, loadPanelActions) {
                            _super.call(this, maxNewReleaseItems, maxFeaturedItems, loadPanelActions)
                        }
                        Object.defineProperty(MovieDashboardViewModel, "sharedInstance", {
                            get: function() {
                                if (!MS.Entertainment.UI.Video.MovieDashboardViewModel._sharedInstance) {
                                    if (MS.Entertainment.Utilities.isVideoApp1)
                                        MS.Entertainment.UI.Video.MovieDashboardViewModel._sharedInstance = new MS.Entertainment.UI.Video.MovieDashboardViewModel(6, 6, false);
                                    else
                                        MS.Entertainment.UI.Video.MovieDashboardViewModel._sharedInstance = new MS.Entertainment.UI.Video.MovieDashboardViewModel(4, 4, true);
                                    MS.Entertainment.UI.Video.MovieDashboardViewModel._sharedInstance.getItems()
                                }
                                return MS.Entertainment.UI.Video.MovieDashboardViewModel._sharedInstance
                            }, enumerable: true, configurable: true
                        });
                        MovieDashboardViewModel.prototype._getQuery = function() {
                            var query = new MS.Entertainment.Data.Query.MovieHub;
                            query.queryId = MS.Entertainment.UI.Monikers.movieMarketplacePanel;
                            return query
                        };
                        MovieDashboardViewModel.prototype._getPrimaryContentPanel = function() {
                            var primaryContentPanel = new Video.VideoHubDashboardContentPanel;
                            primaryContentPanel.header = String.load(String.id.IDS_VIDEO_DASH_MOVIE_NEW_UC);
                            var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                            var moreAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.videoMarketplaceNavigate);
                            moreAction.moniker = MS.Entertainment.UI.Monikers.movieMarketplaceNewReleases;
                            moreAction.parameter = {
                                page: MS.Entertainment.UI.Monikers.movieMarketplace, hub: MS.Entertainment.UI.Monikers.movieMarketplaceNewReleases, args: {selectHub: true}
                            };
                            moreAction.disableWhenOffline = true;
                            moreAction.disableOnServicesDisabled = true;
                            if (MS.Entertainment.Utilities.isVideoApp2) {
                                moreAction.voicePhrase = String.load(String.id.IDS_VIDEO2_L1_NEW_MOVIES_BUTTON_VUI_ALM);
                                moreAction.voicePhoneticPhrase = String.load(String.id.IDS_VIDEO2_L1_NEW_MOVIES_BUTTON_VUI_PRON);
                                moreAction.voiceConfidence = String.load(String.id.IDS_VIDEO2_L1_NEW_MOVIES_BUTTON_VUI_CONF)
                            }
                            primaryContentPanel.moreAction = moreAction;
                            return primaryContentPanel
                        };
                        MovieDashboardViewModel.prototype._getSecondaryContentPanel = function() {
                            var secondaryContentPanel = new Video.VideoHubDashboardContentPanel;
                            secondaryContentPanel.header = String.load(String.id.IDS_VIDEO_DASH_MOVIE_FEATURED_UC);
                            var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                            var moreAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.videoMarketplaceNavigate);
                            moreAction.moniker = MS.Entertainment.UI.Monikers.movieMarketplaceFeatured;
                            moreAction.parameter = {
                                page: MS.Entertainment.UI.Monikers.movieMarketplace, hub: MS.Entertainment.UI.Monikers.movieMarketplaceFeatured, args: {selectHub: true}
                            };
                            moreAction.disableWhenOffline = true;
                            moreAction.disableOnServicesDisabled = true;
                            if (MS.Entertainment.Utilities.isVideoApp2) {
                                moreAction.voicePhrase = String.load(String.id.IDS_VIDEO2_L1_MORE_FEATURED_MOVIES_BUTTON_VUI_ALM);
                                moreAction.voicePhoneticPhrase = String.load(String.id.IDS_VIDEO2_L1_MORE_FEATURED_MOVIES_BUTTON_VUI_PRON);
                                moreAction.voiceConfidence = String.load(String.id.IDS_VIDEO2_L1_MORE_FEATURED_MOVIES_BUTTON_VUI_CONF)
                            }
                            secondaryContentPanel.moreAction = moreAction;
                            return secondaryContentPanel
                        };
                        MovieDashboardViewModel.prototype._getActions = function() {
                            if (!this._loadPanelActions)
                                return [];
                            var actionService;
                            var browseAction;
                            var searchAction;
                            actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                            browseAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.videoMarketplaceNavigate);
                            browseAction.moniker = MS.Entertainment.UI.Monikers.movieMarketplaceNewReleases;
                            browseAction.icon = MS.Entertainment.UI.Icon.store;
                            browseAction.parameter = {
                                page: MS.Entertainment.UI.Monikers.movieMarketplace, hub: MS.Entertainment.UI.Monikers.movieMarketplaceNewReleases, args: {selectHub: true}
                            };
                            browseAction.disableWhenOffline = true;
                            browseAction.disableOnServicesDisabled = true;
                            browseAction.automationId = MS.Entertainment.UI.AutomationIds.dashboardVideoBrowseMovieMarketplace;
                            browseAction.title = String.load(String.id.IDS_VIDEO2_L1_BROWSE_MOVIES_BUTTON_VUI_GUI);
                            browseAction.voicePhrase = String.load(String.id.IDS_VIDEO2_L1_BROWSE_MOVIES_BUTTON_VUI_ALM);
                            browseAction.voicePhoneticPhrase = String.load(String.id.IDS_VIDEO2_L1_BROWSE_MOVIES_BUTTON_VUI_PRON);
                            browseAction.voiceConfidence = String.load(String.id.IDS_VIDEO2_L1_BROWSE_MOVIES_BUTTON_VUI_CONF);
                            searchAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.search);
                            searchAction.icon = WinJS.UI.AppBarIcon.find;
                            searchAction.automationId = MS.Entertainment.UI.AutomationIds.dashboardFeaturedSearch;
                            searchAction.defaultModifierIndex = MS.Entertainment.ViewModels.VideoSearchViewModel.ViewIndex.movies;
                            searchAction.title = String.load(String.id.IDS_VIDEO2_L1_SEARCH_MOVIES_BUTTON_VUI_GUI);
                            searchAction.voicePhrase = String.load(String.id.IDS_VIDEO2_L1_SEARCH_MOVIES_BUTTON_VUI_ALM);
                            searchAction.voicePhoneticPhrase = String.load(String.id.IDS_VIDEO2_L1_SEARCH_MOVIES_BUTTON_VUI_PRON);
                            searchAction.voiceConfidence = String.load(String.id.IDS_VIDEO2_L1_SEARCH_MOVIES_BUTTON_VUI_CONF);
                            return [browseAction, searchAction]
                        };
                        MovieDashboardViewModel.prototype.dispose = function() {
                            MS.Entertainment.UI.Video.MovieDashboardViewModel._sharedInstance = null
                        };
                        return MovieDashboardViewModel
                    })(Video.VideoHubDashboardViewModel);
                Video.MovieDashboardViewModel = MovieDashboardViewModel
            })(UI.Video || (UI.Video = {}));
            var Video = UI.Video
        })(Entertainment.UI || (Entertainment.UI = {}));
        var UI = Entertainment.UI
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
