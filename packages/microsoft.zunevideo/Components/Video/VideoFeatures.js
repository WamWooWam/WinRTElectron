/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment", {Features: {
            appFeatures: [Microsoft.Entertainment.FeatureEnablement.FeatureItem.videoSignInAvailable, Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace, Microsoft.Entertainment.FeatureEnablement.FeatureItem.movieTrailersMarketplace, Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace, Microsoft.Entertainment.FeatureEnablement.FeatureItem.videoAllQuerySupported], refreshApp: function refreshApp() {
                    WinJS.Promise.timeout(500).done(function() {
                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        var hasMarketplace = true;
                        if (MS.Entertainment.Utilities.isVideoApp) {
                            var moviesEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace);
                            var tvEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace);
                            hasMarketplace = moviesEnabled || tvEnabled;
                            MS.Entertainment.ViewModels.VideoSpotlight.startupVideoSpotlight = null
                        }
                        if (MS.Entertainment.Utilities.isVideoApp2 && WinJS.Utilities.getMember("Microsoft.Entertainment.BackgroundTasks.EpgChannelUpdateTask")) {
                            var epg = new Microsoft.Entertainment.BackgroundTasks.EpgChannelUpdateTask;
                            epg.updateChannelsNow()
                        }
                        if (hasMarketplace) {
                            if (MS.Entertainment.Utilities.isVideoApp2)
                                MS.Entertainment.Video.Video2WelcomeDialog.hide();
                            WinJS.Utilities.removeClass(document.documentElement, MS.Entertainment.Utilities.noMarketplaceRootClassName)
                        }
                        else
                            WinJS.Utilities.addClass(document.documentElement, MS.Entertainment.Utilities.noMarketplaceRootClassName);
                        var iaService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.informationArchitecture);
                        iaService.reset();
                        var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                        var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                        this._handleAppRefreshAfterNavigate();
                        if (navigationService.currentPage && !uiStateService.isFullScreenVideo && !uiStateService.isFullScreenMusic && !uiStateService.isSnapped) {
                            var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                            navigationService.navigateToDefaultPage()
                        }
                        else
                            navigationService.clearBackStackOnNextNavigate(true)
                    }.bind(this))
                }, _handleAppRefreshAfterNavigate: function _handleAppRefreshAfterNavigate() {
                    if (!MS.Entertainment.Utilities.isVideoApp2)
                        return;
                    var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                    var eventHandlers = MS.Entertainment.Utilities.addEvents(navigationService, {currentPageChanged: function onCurrentPageChanged() {
                                var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                                var moviesEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace);
                                var tvEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace);
                                var hasMarketplace = moviesEnabled || tvEnabled;
                                if (!hasMarketplace)
                                    MS.Entertainment.Video.Video2WelcomeDialog.show().done(null, null);
                                if (eventHandlers) {
                                    eventHandlers.cancel();
                                    eventHandlers = null
                                }
                            }.bind(this)})
                }
        }})
})()
