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
                var TvDashboardDataContext = (function() {
                        function TvDashboardDataContext() {
                            this.doNotRaisePanelReady = false;
                            this.hideNavigationContainer = true;
                            this.viewModel = MS.Entertainment.UI.Video.TvDashboardViewModel.sharedInstance
                        }
                        TvDashboardDataContext.prototype.dispose = function() {
                            if (this.viewModel && this.viewModel.dispose)
                                this.viewModel.dispose()
                        };
                        return TvDashboardDataContext
                    })();
                Video.TvDashboardDataContext = TvDashboardDataContext;
                var NewTvDashboardDataContext = (function() {
                        function NewTvDashboardDataContext(maxNewReleases, maxFeatured, loadPanelActions) {
                            this.doNotRaisePanelReady = false;
                            this.hideNavigationContainer = true;
                            this.panelAction = null;
                            this.viewModel = MS.Entertainment.UI.Video.TvDashboardViewModel.sharedInstance;
                            this.panelAction = {action: this.viewModel.viewModelData.primaryContentPanel.moreAction}
                        }
                        NewTvDashboardDataContext.prototype.dispose = function() {
                            if (this.viewModel && this.viewModel.dispose)
                                this.viewModel.dispose()
                        };
                        return NewTvDashboardDataContext
                    })();
                Video.NewTvDashboardDataContext = NewTvDashboardDataContext;
                var FeaturedTvDashboardDataContext = (function() {
                        function FeaturedTvDashboardDataContext(maxNewReleases, maxFeatured, loadPanelActions) {
                            this.doNotRaisePanelReady = false;
                            this.hideNavigationContainer = true;
                            this.panelAction = null;
                            this.viewModel = MS.Entertainment.UI.Video.TvDashboardViewModel.sharedInstance;
                            this.panelAction = {action: this.viewModel.viewModelData.secondaryContentPanel.moreAction}
                        }
                        FeaturedTvDashboardDataContext.prototype.dispose = function() {
                            if (this.viewModel && this.viewModel.dispose)
                                this.viewModel.dispose()
                        };
                        return FeaturedTvDashboardDataContext
                    })();
                Video.FeaturedTvDashboardDataContext = FeaturedTvDashboardDataContext;
                var TvDashboardViewModel = (function(_super) {
                        __extends(TvDashboardViewModel, _super);
                        function TvDashboardViewModel(maxNewReleaseItems, maxFeaturedItems, loadPanelActions) {
                            _super.call(this, maxNewReleaseItems, maxFeaturedItems, loadPanelActions)
                        }
                        Object.defineProperty(TvDashboardViewModel, "sharedInstance", {
                            get: function() {
                                if (!MS.Entertainment.UI.Video.TvDashboardViewModel._sharedInstance) {
                                    if (MS.Entertainment.Utilities.isVideoApp1)
                                        MS.Entertainment.UI.Video.TvDashboardViewModel._sharedInstance = new MS.Entertainment.UI.Video.TvDashboardViewModel(6, 7, false);
                                    else
                                        MS.Entertainment.UI.Video.TvDashboardViewModel._sharedInstance = new MS.Entertainment.UI.Video.TvDashboardViewModel(4, 4, true);
                                    MS.Entertainment.UI.Video.TvDashboardViewModel._sharedInstance.getItems()
                                }
                                return MS.Entertainment.UI.Video.TvDashboardViewModel._sharedInstance
                            }, enumerable: true, configurable: true
                        });
                        TvDashboardViewModel.prototype._getQuery = function() {
                            var query = new MS.Entertainment.Data.Query.TvHub;
                            query.queryId = MS.Entertainment.UI.Monikers.tvMarketplacePanel;
                            return query
                        };
                        TvDashboardViewModel.prototype._getPrimaryContentPanel = function() {
                            var primaryContentPanel = new Video.VideoHubDashboardContentPanel;
                            primaryContentPanel.header = String.load(String.id.IDS_VIDEO_DASH_TV_NEW_UC);
                            var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                            var moreAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.videoMarketplaceNavigate);
                            moreAction.moniker = MS.Entertainment.UI.Monikers.tvMarketplaceNewReleases;
                            moreAction.parameter = {
                                page: MS.Entertainment.UI.Monikers.tvMarketplace, hub: MS.Entertainment.UI.Monikers.tvMarketplaceNewReleases, args: {selectHub: true}
                            };
                            moreAction.disableWhenOffline = true;
                            moreAction.disableOnServicesDisabled = true;
                            if (MS.Entertainment.Utilities.isVideoApp2) {
                                moreAction.voicePhrase = String.load(String.id.IDS_VIDEO2_L1_MORE_NEW_TV_BUTTON_VUI_ALM);
                                moreAction.voicePhoneticPhrase = String.load(String.id.IDS_VIDEO2_L1_MORE_NEW_TV_BUTTON_VUI_PRON);
                                moreAction.voiceConfidence = String.load(String.id.IDS_VIDEO2_L1_MORE_NEW_TV_BUTTON_VUI_CONF)
                            }
                            primaryContentPanel.moreAction = moreAction;
                            return primaryContentPanel
                        };
                        TvDashboardViewModel.prototype._getSecondaryContentPanel = function() {
                            var secondaryContentPanel = new Video.VideoHubDashboardContentPanel;
                            secondaryContentPanel.header = String.load(String.id.IDS_VIDEO_DASH_TV_FEATURED_UC);
                            var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                            var moreAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.videoMarketplaceNavigate);
                            moreAction.moniker = MS.Entertainment.UI.Monikers.tvMarketplaceFeatured;
                            moreAction.parameter = {
                                page: MS.Entertainment.UI.Monikers.tvMarketplace, hub: MS.Entertainment.UI.Monikers.tvMarketplaceFeatured, args: {selectHub: true}
                            };
                            moreAction.disableWhenOffline = true;
                            moreAction.disableOnServicesDisabled = true;
                            if (MS.Entertainment.Utilities.isVideoApp2) {
                                moreAction.voicePhrase = String.load(String.id.IDS_VIDEO2_L1_MORE_FEATURED_TV_BUTTON_VUI_ALM);
                                moreAction.voicePhoneticPhrase = String.load(String.id.IDS_VIDEO2_L1_MORE_FEATURED_TV_BUTTON_VUI_PRON);
                                moreAction.voiceConfidence = String.load(String.id.IDS_VIDEO2_L1_MORE_FEATURED_TV_BUTTON_VUI_CONF)
                            }
                            secondaryContentPanel.moreAction = moreAction;
                            return secondaryContentPanel
                        };
                        TvDashboardViewModel.prototype._getActions = function() {
                            if (!this._loadPanelActions)
                                return [];
                            var actionService;
                            var browseAction;
                            var searchAction;
                            actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                            browseAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.videoMarketplaceNavigate);
                            browseAction.icon = MS.Entertainment.UI.Icon.store;
                            browseAction.moniker = MS.Entertainment.UI.Monikers.tvMarketplaceNewReleases;
                            browseAction.parameter = {
                                page: MS.Entertainment.UI.Monikers.tvMarketplace, hub: MS.Entertainment.UI.Monikers.tvMarketplaceNewReleases, args: {selectHub: true}
                            };
                            browseAction.disableWhenOffline = true;
                            browseAction.disableOnServicesDisabled = true;
                            browseAction.automationId = MS.Entertainment.UI.AutomationIds.dashboardVideoBrowseMovieMarketplace;
                            browseAction.title = String.load(String.id.IDS_VIDEO2_L1_BROWSE_TV_BUTTON_VUI_GUI);
                            browseAction.voicePhrase = String.load(String.id.IDS_VIDEO2_L1_BROWSE_TV_BUTTON_VUI_ALM);
                            browseAction.voicePhoneticPhrase = String.load(String.id.IDS_VIDEO2_L1_BROWSE_TV_BUTTON_VUI_PRON);
                            browseAction.voiceConfidence = String.load(String.id.IDS_VIDEO2_L1_BROWSE_TV_BUTTON_VUI_CONF);
                            searchAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.search);
                            searchAction.icon = WinJS.UI.AppBarIcon.find;
                            searchAction.automationId = MS.Entertainment.UI.AutomationIds.dashboardFeaturedSearch;
                            searchAction.defaultModifierIndex = MS.Entertainment.ViewModels.VideoSearchViewModel.ViewIndex.tvShows;
                            searchAction.title = String.load(String.id.IDS_VIDEO2_L1_SEARCH_TV_BUTTON_VUI_GUI);
                            searchAction.voicePhrase = String.load(String.id.IDS_VIDEO2_L1_SEARCH_TV_BUTTON_VUI_ALM);
                            searchAction.voicePhoneticPhrase = String.load(String.id.IDS_VIDEO2_L1_SEARCH_TV_BUTTON_VUI_PRON);
                            searchAction.voiceConfidence = String.load(String.id.IDS_VIDEO2_L1_SEARCH_TV_BUTTON_VUI_CONF);
                            return [browseAction, searchAction]
                        };
                        TvDashboardViewModel.prototype.dispose = function() {
                            MS.Entertainment.UI.Video.TvDashboardViewModel._sharedInstance = null
                        };
                        return TvDashboardViewModel
                    })(Video.VideoHubDashboardViewModel);
                Video.TvDashboardViewModel = TvDashboardViewModel
            })(UI.Video || (UI.Video = {}));
            var Video = UI.Video
        })(Entertainment.UI || (Entertainment.UI = {}));
        var UI = Entertainment.UI
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
