/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Framework/Data/queries/libraryQueries.js", "/Framework/iaservice.js", "/Framework/serviceLocator.js", "/Framework/utilities.js", "/Monikers.js", "/ViewModels/Video/VideoSpotlight.js");
    var createVideoIA = function createVideoIA(iaService) {
            var hiddenPanel = {panel: MS.Entertainment.InformationArchitecture.Viewability.hidden};
            var hiddenHub = {hub: MS.Entertainment.InformationArchitecture.Viewability.hidden};
            var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
            var config = new Microsoft.Entertainment.Configuration.ConfigurationManager;
            var moviesMarketplaceEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace);
            var tvMarketplaceEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace);
            var marketplaceEnabled = (moviesMarketplaceEnabled || tvMarketplaceEnabled);
            var lastNightOnTvEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvLastNightQuery);
            var demoMode = config.shell.retailExperience;
            var customerRatingSortEnabled = config.video.customerRatingSort;
            var galleryPageTemplate = "/Controls/ModifierGalleryPage.html";
            var templateVideoHubSpotlightPanel = "/Components/Video/VideoSpotlightView1.html#videoHubSpotlightPanelTemplate";
            var templateMovieHubCollectionPanel = "/Components/Video/VideoSpotlightView1.html#movieHubCollectionPanelTemplate";
            var templateTvHubCollectionPanel = "/Components/Video/VideoSpotlightView1.html#tvHubCollectionPanelTemplate";
            var templateVideoHubCollectionPanel = "/Components/Video/VideoSpotlightView1.html#videoHubCollectionPanelTemplate";
            var templateVideoHubNewMoviesPanel = "/Components/Video/VideoSpotlightView1.html#videoHubNewMoviesPanelTemplate";
            var templateVideoHubFeaturedMoviesPanel = "/Components/Video/VideoSpotlightView1.html#videoHubFeaturedMoviesPanelTemplate";
            var templateVideoHubNewTvPanel = "/Components/Video/VideoSpotlightView1.html#videoHubNewTvPanelTemplate";
            var templateVideoHubFeaturedTvPanel = "/Components/Video/VideoSpotlightView1.html#videoHubFeaturedTvPanelTemplate";
            var movieMarketplaceHubFragmentUrl = "/Components/Video/VideoPanels.html#movieMarketplaceTemplate";
            var tvMarketplaceHubFragmentUrl = "/Components/Video/VideoPanels.html#tvMarketplaceTemplate";
            var videoSearchHubFragmentTemplate = "/Components/Video/VideoPanels.html#videoSearchTemplate";
            var videoMarketplaceFlexHubFragmentUrl = "/Components/Video/VideoPanels.html#flexHubMarketplaceTemplate";
            var videoMarketplaceFeaturedSetsFragmentUrl = "/Components/Video/VideoPanels.html#featuredSetsMarketplaceTemplate";
            function createVideoMarketplaceDataContext(view, hub) {
                return {
                        viewModel: new MS.Entertainment.ViewModels.VideoMarketplace(view, hub), doNotRaisePanelReady: false
                    }
            }
            {};
            function createVideoCollectionDataContext(view, hub) {
                return {
                        viewModel: new MS.Entertainment.ViewModels.VideoCollection(view, hub), view: view, doNotRaisePanelReady: false
                    }
            }
            {};
            function createVideoSearchDataContext(viewType) {
                return {
                        viewModel: new MS.Entertainment.ViewModels.VideoSearchViewModel(viewType, moviesMarketplaceEnabled, tvMarketplaceEnabled), noMarketplace: !marketplaceEnabled, minModifierItems: 0, doNotRaisePanelReady: false, hideLoadingPanel: false, hideShadow: false
                    }
            }
            {};
            var videoSearch = iaService.createNode(String.load(String.id.IDS_SEARCH_SEARCHSTARTED), MS.Entertainment.UI.Monikers.searchPage);
            videoSearch.useStaticHubStrip = true;
            MS.Entertainment.InformationArchitecture.Node.overridePageFragmentUrl(videoSearch, galleryPageTemplate);
            var videoAllSearch = iaService.createNode(String.empty, MS.Entertainment.UI.Monikers.allVideoSearch, null, hiddenPanel);
            videoAllSearch.useStaticHubStrip = true;
            MS.Entertainment.InformationArchitecture.Node.overrideHubFragmentUrl(videoAllSearch, videoSearchHubFragmentTemplate);
            videoAllSearch.getDataContext = function getVideoAllSearchDataContext() {
                var viewType = marketplaceEnabled ? MS.Entertainment.ViewModels.VideoSearchViewModel.ViewTypes.allVideo : MS.Entertainment.ViewModels.VideoSearchViewModel.ViewTypes.noMarketplace;
                var dataContext = createVideoSearchDataContext(viewType);
                return dataContext
            };
            videoAllSearch.addChild(iaService.createNode(String.load(String.id.IDS_SEARCH_SEARCHSTARTED), MS.Entertainment.UI.Monikers.allVideoSearchPanel, "/Components/Video/VideoPanels.html#videoSearchTemplate", hiddenHub, null));
            videoSearch.addChild(videoAllSearch);
            var videoCollection = iaService.createNode(String.load(String.id.IDS_VIDEO_COLLECTION_PIVOT), MS.Entertainment.UI.Monikers.videoCollection);
            videoCollection.perfTrackStartPoint = MS.Entertainment.Instrumentation.PerfTrack.StartPoints.CollectionGalleryRequest;
            videoCollection.useStaticHubStrip = true;
            MS.Entertainment.InformationArchitecture.Node.overridePageFragmentUrl(videoCollection, galleryPageTemplate);
            var addedLxEmptyPage = false;
            if (window.onNewVideoPage && !config.video.videoLXDefaultToClassic) {
                var emptyHome = iaService.createNode(String.load(String.id.IDS_HOME_PIVOT), MS.Entertainment.UI.Monikers.homeHub);
                MS.Entertainment.InformationArchitecture.Node.overridePageFragmentUrl(emptyHome, "/Components/Video/EmptyHome.html");
                iaService.rootNode = emptyHome;
                addedLxEmptyPage = true
            }
            if (marketplaceEnabled || addedLxEmptyPage)
                iaService.rootNode.addChild(videoCollection);
            else
                iaService.rootNode = videoCollection;
            if (marketplaceEnabled) {
                if (!demoMode)
                    if (!addedLxEmptyPage) {
                        var home = iaService.createNode(String.load(String.id.IDS_HOME_PIVOT), MS.Entertainment.UI.Monikers.homeHub);
                        home.getDataContext = function homeGetDataContext() {
                            var videoSpotlight = MS.Entertainment.ViewModels.VideoSpotlight.startupVideoSpotlight;
                            MS.Entertainment.ViewModels.VideoSpotlight.startupVideoSpotlight = null;
                            if (!videoSpotlight)
                                videoSpotlight = new MS.Entertainment.ViewModels.VideoSpotlight;
                            return videoSpotlight
                        };
                        var spotlightPanel = iaService.createNode(String.load(String.id.IDS_VIDEO_SPOTLIGHT), MS.Entertainment.UI.Monikers.homeSpotlight, templateVideoHubSpotlightPanel);
                        iaService.rootNode.addChild(home);
                        iaService.rootNode.defaultChild = home;
                        home.addChild(spotlightPanel)
                    }
                var videoOtherCollectionPanel = iaService.createNode(String.load(String.id.IDS_VIDEO_COLLECTION_PIVOT), MS.Entertainment.UI.Monikers.videoOtherCollectionPanel, templateVideoHubCollectionPanel, hiddenHub);
                videoOtherCollectionPanel.getDataContext = function videoCollectionPanelGetDataContext() {
                    return new MS.Entertainment.ViewModels.OtherHubCollectionPanel
                };
                videoCollection.addChild(videoOtherCollectionPanel);
                if (moviesMarketplaceEnabled && !demoMode) {
                    var videoMovieCollectionPanel = iaService.createNode(String.load(String.id.IDS_VIDEO_COLLECTION_MOVIES_PIVOT), MS.Entertainment.UI.Monikers.videoMovieCollectionPanel, templateMovieHubCollectionPanel, hiddenHub);
                    videoMovieCollectionPanel.getDataContext = function videoCollectionPanelGetDataContext() {
                        return new MS.Entertainment.ViewModels.MovieHubCollectionPanel
                    };
                    videoCollection.addChild(videoMovieCollectionPanel)
                }
                if (tvMarketplaceEnabled && !demoMode) {
                    var videoTvCollectionPanel = iaService.createNode(String.load(String.id.IDS_VIDEO_COLLECTION_TV_PIVOT), MS.Entertainment.UI.Monikers.videoTvCollectionPanel, templateTvHubCollectionPanel, hiddenHub);
                    videoTvCollectionPanel.getDataContext = function videoCollectionPanelGetDataContext() {
                        return new MS.Entertainment.ViewModels.TvHubCollectionPanel
                    };
                    videoCollection.addChild(videoTvCollectionPanel)
                }
            }
            var folderTitle = String.load(String.id.IDS_OTHER_VIDEO_COLLECTION_TITLE);
            var folderVideoCollection = iaService.createNode(folderTitle, MS.Entertainment.UI.Monikers.otherVideoCollection, null, hiddenPanel);
            folderVideoCollection.getDataContext = function getDataContext() {
                return createVideoCollectionDataContext("other")
            };
            videoCollection.addChild(folderVideoCollection);
            folderVideoCollection.addChild(iaService.createNode(String.empty, MS.Entertainment.UI.Monikers.otherVideoCollectionPanel, "/Components/Video/VideoCollectionPanels.html#videoCollectionFolderTemplate"));
            if (!demoMode) {
                var movieCollection = iaService.createNode(String.load(String.id.IDS_MOVIE_COLLECTION_TITLE), MS.Entertainment.UI.Monikers.movieCollection, null, hiddenPanel, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace);
                MS.Entertainment.InformationArchitecture.Node.overrideHubFragmentUrl(movieCollection, "/Components/Video/VideoCollectionPanels.html#videoCollectionMoviesTemplate");
                movieCollection.getDataContext = function getDataContext() {
                    return createVideoCollectionDataContext("movies", movieCollection)
                };
                movieCollection.addChild(iaService.createNode(String.empty, MS.Entertainment.UI.Monikers.movieCollectionPanel, "/Components/Video/VideoCollectionPanels.html#videoCollectionMoviesTemplate"), null, null, null);
                videoCollection.addChild(movieCollection);
                var tvCollection = iaService.createNode(String.load(String.id.IDS_TV_COLLECTION_TITLE), MS.Entertainment.UI.Monikers.tvCollection, null, hiddenPanel, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace);
                MS.Entertainment.InformationArchitecture.Node.overrideHubFragmentUrl(tvCollection, "/Components/Video/VideoCollectionPanels.html#videoCollectionTVTemplate");
                tvCollection.getDataContext = function getDataContext() {
                    return createVideoCollectionDataContext("tv", tvCollection)
                };
                tvCollection.addChild(iaService.createNode(String.empty, MS.Entertainment.UI.Monikers.tvCollectionPanel, "/Components/Video/VideoCollectionPanels.html#videoCollectionTVTemplate"), null, null, null);
                videoCollection.addChild(tvCollection)
            }
            if (marketplaceEnabled)
                if (!demoMode) {
                    var movieMarketplace = iaService.createNode(String.load(String.id.IDS_MOVIE_MARKETPLACE_TITLE_LC), MS.Entertainment.UI.Monikers.movieMarketplace, null, null, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace);
                    movieMarketplace.perfTrackStartPoint = MS.Entertainment.Instrumentation.PerfTrack.StartPoints.MarketplaceGalleryRequest;
                    movieMarketplace.useStaticHubStrip = true;
                    MS.Entertainment.InformationArchitecture.Node.overridePageFragmentUrl(movieMarketplace, galleryPageTemplate);
                    iaService.rootNode.addChild(movieMarketplace);
                    var movieMarketplaceNewReleasesPanel = iaService.createNode(String.load(String.id.IDS_VIDEO_DASH_MOVIE_NEW_LC), MS.Entertainment.UI.Monikers.movieMarketplacePanel, templateVideoHubNewMoviesPanel, hiddenHub, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace);
                    movieMarketplaceNewReleasesPanel.getDataContext = function movieMarketplaceGetDataContext() {
                        return new MS.Entertainment.UI.Video.NewMoviesDashboardDataContext
                    };
                    movieMarketplace.addChild(movieMarketplaceNewReleasesPanel);
                    var movieMarketplaceFeaturedPanel = iaService.createNode(String.load(String.id.IDS_VIDEO_DASH_MOVIE_FEATURED_LC), MS.Entertainment.UI.Monikers.movieMarketplacePanel2, templateVideoHubFeaturedMoviesPanel, hiddenHub, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace);
                    movieMarketplaceFeaturedPanel.getDataContext = function movieMarketplaceGetDataContext() {
                        return new MS.Entertainment.UI.Video.FeaturedMoviesDashboardDataContext
                    };
                    movieMarketplace.addChild(movieMarketplaceFeaturedPanel);
                    var movieMarketplaceNewReleasesHub = iaService.createNode(String.load(String.id.IDS_MARKETPLACE_MOVIE_NEW_RELEASE_LC), MS.Entertainment.UI.Monikers.movieMarketplaceNewReleases, null, hiddenPanel, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace);
                    MS.Entertainment.InformationArchitecture.Node.overrideHubFragmentUrl(movieMarketplaceNewReleasesHub, movieMarketplaceHubFragmentUrl);
                    movieMarketplaceNewReleasesHub.getDataContext = function getNewReleasesContext() {
                        return createVideoMarketplaceDataContext("movieNewReleases", movieMarketplaceNewReleasesHub)
                    };
                    movieMarketplaceNewReleasesHub.addChild(iaService.createNode(String.empty, MS.Entertainment.UI.Monikers.movieMarketplaceNewReleasesPanel, "/Components/Video/VideoPanels.html#movieMarketplaceTemplate", null, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace));
                    movieMarketplace.addChild(movieMarketplaceNewReleasesHub);
                    var movieMarketplaceFeaturedHub = iaService.createNode(String.load(String.id.IDS_MARKETPLACE_MOVIE_FEATURED_LC), MS.Entertainment.UI.Monikers.movieMarketplaceFeatured, null, hiddenPanel, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace);
                    MS.Entertainment.InformationArchitecture.Node.overrideHubFragmentUrl(movieMarketplaceFeaturedHub, movieMarketplaceHubFragmentUrl);
                    movieMarketplaceFeaturedHub.getDataContext = function getFeaturedContext() {
                        return createVideoMarketplaceDataContext("movieFeatured", movieMarketplaceFeaturedHub)
                    };
                    movieMarketplaceFeaturedHub.addChild(iaService.createNode(String.empty, MS.Entertainment.UI.Monikers.movieMarketplaceFeaturedPanel, "/Components/Video/VideoPanels.html#movieMarketplaceTemplate", null, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace));
                    movieMarketplace.addChild(movieMarketplaceFeaturedHub);
                    var movieMarketplaceTopPurchasedHub = iaService.createNode(String.load(String.id.IDS_MARKETPLACE_MOVIE_TOP_SALES_LC), MS.Entertainment.UI.Monikers.movieMarketplaceTopPurchased, null, hiddenPanel, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace);
                    MS.Entertainment.InformationArchitecture.Node.overrideHubFragmentUrl(movieMarketplaceTopPurchasedHub, movieMarketplaceHubFragmentUrl);
                    movieMarketplaceTopPurchasedHub.getDataContext = function getPopularContext() {
                        return createVideoMarketplaceDataContext("movieTopPurchased", movieMarketplaceTopPurchasedHub)
                    };
                    movieMarketplaceTopPurchasedHub.addChild(iaService.createNode(String.empty, MS.Entertainment.UI.Monikers.movieMarketplaceTopPurchasedPanel, "/Components/Video/VideoPanels.html#movieMarketplaceTemplate", null, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace));
                    movieMarketplace.addChild(movieMarketplaceTopPurchasedHub);
                    var movieMarketplaceTopRentedHub = iaService.createNode(String.load(String.id.IDS_MARKETPLACE_MOVIE_TOP_RENTED_LC), MS.Entertainment.UI.Monikers.movieMarketplaceTopRented, null, hiddenPanel, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace);
                    MS.Entertainment.InformationArchitecture.Node.overrideHubFragmentUrl(movieMarketplaceTopRentedHub, movieMarketplaceHubFragmentUrl);
                    movieMarketplaceTopRentedHub.getDataContext = function getTopRentedContext() {
                        return createVideoMarketplaceDataContext("movieTopRented", movieMarketplaceTopRentedHub)
                    };
                    movieMarketplaceTopRentedHub.addChild(iaService.createNode(String.empty, MS.Entertainment.UI.Monikers.movieMarketplaceTopRentedPanel, "/Components/Video/VideoPanels.html#movieMarketplaceTemplate", null, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace));
                    movieMarketplace.addChild(movieMarketplaceTopRentedHub);
                    if (customerRatingSortEnabled) {
                        var movieMarketplaceTopRatedHub = iaService.createNode(String.load(String.id.IDS_MARKETPLACE_MOVIE_TOP_RATED_LC), MS.Entertainment.UI.Monikers.movieMarketplaceTopRated, null, hiddenPanel, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace);
                        MS.Entertainment.InformationArchitecture.Node.overrideHubFragmentUrl(movieMarketplaceTopRatedHub, movieMarketplaceHubFragmentUrl);
                        movieMarketplaceTopRatedHub.getDataContext = function getTopRatedContext() {
                            return createVideoMarketplaceDataContext("movieTopRated", movieMarketplaceTopRatedHub)
                        };
                        movieMarketplaceTopRatedHub.addChild(iaService.createNode(String.empty, MS.Entertainment.UI.Monikers.movieMarketplaceTopRatedPanel, "/Components/Video/VideoPanels.html#movieMarketplaceTemplate", null, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace));
                        movieMarketplace.addChild(movieMarketplaceTopRatedHub)
                    }
                    var tvMarketplace = iaService.createNode(String.load(String.id.IDS_TV_MARKETPLACE_TITLE_LC), MS.Entertainment.UI.Monikers.tvMarketplace, null, null, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace);
                    tvMarketplace.perfTrackStartPoint = MS.Entertainment.Instrumentation.PerfTrack.StartPoints.MarketplaceGalleryRequest;
                    tvMarketplace.useStaticHubStrip = true;
                    MS.Entertainment.InformationArchitecture.Node.overridePageFragmentUrl(tvMarketplace, galleryPageTemplate);
                    iaService.rootNode.addChild(tvMarketplace);
                    var tvMarketplacePanel = iaService.createNode(String.load(String.id.IDS_VIDEO_DASH_TV_NEW_LC), MS.Entertainment.UI.Monikers.tvMarketplacePanel, templateVideoHubNewTvPanel, hiddenHub, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace);
                    tvMarketplacePanel.getDataContext = function tvMarketplaceGetDataContext() {
                        return new MS.Entertainment.UI.Video.NewTvDashboardDataContext
                    };
                    tvMarketplace.addChild(tvMarketplacePanel);
                    var tvMarketplacePanel2 = iaService.createNode(String.load(String.id.IDS_VIDEO_DASH_TV_FEATURED_LC), MS.Entertainment.UI.Monikers.tvMarketplacePanel2, templateVideoHubFeaturedTvPanel, hiddenHub, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace);
                    tvMarketplacePanel2.getDataContext = function tvMarketplaceGetDataContext() {
                        return new MS.Entertainment.UI.Video.FeaturedTvDashboardDataContext
                    };
                    tvMarketplace.addChild(tvMarketplacePanel2);
                    var tvMarketplaceNewReleasesHub = iaService.createNode(String.load(String.id.IDS_MARKETPLACE_TV_NEW_RELEASE_LC), MS.Entertainment.UI.Monikers.tvMarketplaceNewReleases, null, hiddenPanel, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace);
                    MS.Entertainment.InformationArchitecture.Node.overrideHubFragmentUrl(tvMarketplaceNewReleasesHub, tvMarketplaceHubFragmentUrl);
                    tvMarketplaceNewReleasesHub.getDataContext = function getNewReleasesContext() {
                        return createVideoMarketplaceDataContext("tvNewReleases", tvMarketplaceNewReleasesHub)
                    };
                    tvMarketplaceNewReleasesHub.addChild(iaService.createNode(String.empty, MS.Entertainment.UI.Monikers.tvMarketplaceNewReleasesPanel, "/Components/Video/VideoPanels.html#tvMarketplaceTemplate", null, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace));
                    tvMarketplace.addChild(tvMarketplaceNewReleasesHub);
                    var tvMarketplaceFeaturedHub = iaService.createNode(String.load(String.id.IDS_MARKETPLACE_TV_FEATURED_LC), MS.Entertainment.UI.Monikers.tvMarketplaceFeatured, null, hiddenPanel, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace);
                    MS.Entertainment.InformationArchitecture.Node.overrideHubFragmentUrl(tvMarketplaceFeaturedHub, tvMarketplaceHubFragmentUrl);
                    tvMarketplaceFeaturedHub.getDataContext = function getTvFeaturedContext() {
                        return createVideoMarketplaceDataContext("tvFeatured", tvMarketplaceFeaturedHub)
                    };
                    tvMarketplaceFeaturedHub.addChild(iaService.createNode(String.empty, MS.Entertainment.UI.Monikers.tvMarketplaceFeaturedPanel, "/Components/Video/VideoPanels.html#tvMarketplaceTemplate", null, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace));
                    tvMarketplace.addChild(tvMarketplaceFeaturedHub);
                    if (lastNightOnTvEnabled) {
                        var tvMarketplaceLastNightHub = iaService.createNode(String.load(String.id.IDS_VIDEO_TV_FROM_LAST_NIGHT_PIVOT), MS.Entertainment.UI.Monikers.tvMarketplaceLastNight, null, hiddenPanel, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace);
                        MS.Entertainment.InformationArchitecture.Node.overrideHubFragmentUrl(tvMarketplaceLastNightHub, tvMarketplaceHubFragmentUrl);
                        tvMarketplaceLastNightHub.getDataContext = function getLastNightTvContext() {
                            return createVideoMarketplaceDataContext("tvAiredLastNight", tvMarketplaceLastNightHub)
                        };
                        tvMarketplaceLastNightHub.addChild(iaService.createNode(String.empty, MS.Entertainment.UI.Monikers.tvMarketplaceLastNightPanel, "/Components/Video/VideoPanels.html#tvMarketplaceTemplate", null, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace));
                        tvMarketplace.addChild(tvMarketplaceLastNightHub)
                    }
                    var tvMarketplaceTopPurchasedHub = iaService.createNode(String.load(String.id.IDS_MARKETPLACE_TV_TOP_SALES_LC), MS.Entertainment.UI.Monikers.tvMarketplaceTopPurchased, null, hiddenPanel, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace);
                    MS.Entertainment.InformationArchitecture.Node.overrideHubFragmentUrl(tvMarketplaceTopPurchasedHub, tvMarketplaceHubFragmentUrl);
                    tvMarketplaceTopPurchasedHub.getDataContext = function getTopPurchasedContext() {
                        return createVideoMarketplaceDataContext("tvTopPurchased", tvMarketplaceTopPurchasedHub)
                    };
                    tvMarketplaceTopPurchasedHub.addChild(iaService.createNode(String.empty, MS.Entertainment.UI.Monikers.tvMarketplaceTopPurchasedPanel, "/Components/Video/VideoPanels.html#tvMarketplaceTemplate", null, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace));
                    tvMarketplace.addChild(tvMarketplaceTopPurchasedHub);
                    if (customerRatingSortEnabled) {
                        var tvMarketplaceTopRatedHub = iaService.createNode(String.load(String.id.IDS_MARKETPLACE_TV_TOP_RATED_LC), MS.Entertainment.UI.Monikers.tvMarketplaceTopRated, null, hiddenPanel, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace);
                        MS.Entertainment.InformationArchitecture.Node.overrideHubFragmentUrl(tvMarketplaceTopRatedHub, tvMarketplaceHubFragmentUrl);
                        tvMarketplaceTopRatedHub.getDataContext = function getTvTopRatedContext() {
                            return createVideoMarketplaceDataContext("tvTopRated", tvMarketplaceTopRatedHub)
                        };
                        tvMarketplaceTopRatedHub.addChild(iaService.createNode(String.empty, MS.Entertainment.UI.Monikers.tvMarketplaceTopRatedPanel, "/Components/Video/VideoPanels.html#tvMarketplaceTemplate", null, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace));
                        tvMarketplace.addChild(tvMarketplaceTopRatedHub)
                    }
                    var videoMarketplaceFlexHubPage = iaService.createNode(String.empty, MS.Entertainment.UI.Monikers.flexHubPage);
                    videoMarketplaceFlexHubPage.useStaticHubStrip = true;
                    MS.Entertainment.InformationArchitecture.Node.overridePageFragmentUrl(videoMarketplaceFlexHubPage, galleryPageTemplate);
                    var videoMarketplaceFlexHub = iaService.createNode(String.empty, MS.Entertainment.UI.Monikers.flexHub, null, hiddenPanel, null);
                    MS.Entertainment.InformationArchitecture.Node.overrideHubFragmentUrl(videoMarketplaceFlexHub, videoMarketplaceFlexHubFragmentUrl);
                    videoMarketplaceFlexHub.getDataContext = function getFlexHubContext() {
                        return createVideoMarketplaceDataContext("flexHub", videoMarketplaceFlexHub)
                    };
                    videoMarketplaceFlexHub.addChild(iaService.createNode(String.empty, MS.Entertainment.UI.Monikers.flexHubPanel, "/Components/Video/VideoPanels.html#flexHubMarketplaceTemplate", null, null));
                    videoMarketplaceFlexHubPage.addChild(videoMarketplaceFlexHub);
                    var videoMarketplaceFeaturedSetsPage = iaService.createNode(String.empty, MS.Entertainment.UI.Monikers.featuredSetsPage);
                    videoMarketplaceFeaturedSetsPage.useStaticHubStrip = true;
                    MS.Entertainment.InformationArchitecture.Node.overridePageFragmentUrl(videoMarketplaceFeaturedSetsPage, galleryPageTemplate);
                    var videoMarketplaceFeaturedSets = iaService.createNode(String.empty, MS.Entertainment.UI.Monikers.featuredSets, null, hiddenPanel, null);
                    MS.Entertainment.InformationArchitecture.Node.overrideHubFragmentUrl(videoMarketplaceFeaturedSets, videoMarketplaceFeaturedSetsFragmentUrl);
                    videoMarketplaceFeaturedSets.getDataContext = function getFeaturedSetsContext() {
                        return createVideoMarketplaceDataContext("featuredSet", videoMarketplaceFeaturedSets)
                    };
                    videoMarketplaceFeaturedSets.addChild(iaService.createNode(String.empty, MS.Entertainment.UI.Monikers.featuredSetsPanel, "/Components/Video/VideoPanels.html#featuredSetsMarketplaceTemplate", null, null));
                    videoMarketplaceFeaturedSetsPage.addChild(videoMarketplaceFeaturedSets);
                    var previewBrowsePanel = iaService.createNode(String.load(String.id.IDS_VIDEO_PREVIEW_BROWSE_BUTTON), MS.Entertainment.UI.Monikers.movieTrailerBrowse);
                    MS.Entertainment.InformationArchitecture.Node.overridePageFragmentUrl(previewBrowsePanel, "/Components/Video/PreviewBrowse.html");
                    previewBrowsePanel.getDataContext = null
                }
                else {
                    var demoMarketplaceHub = iaService.createNode(String.load(String.id.IDS_MARKETPLACE_PIVOT), MS.Entertainment.UI.Monikers.videoMarketplace);
                    iaService.rootNode.addChild(demoMarketplaceHub);
                    iaService.rootNode.defaultChild = demoMarketplaceHub;
                    if (moviesMarketplaceEnabled) {
                        var demoMoviePanel = iaService.createNode(String.load(String.id.IDS_VIDEO_DASH_MOVIE_FEATURED_LC), MS.Entertainment.UI.Monikers.movieMarketplacePanel, templateVideoHubNewMoviesPanel, hiddenHub);
                        demoMoviePanel.getDataContext = function demoMovieMarketplaceGetDataContext() {
                            return new MS.Entertainment.UI.Video.MovieDemoDashboardDataContext
                        };
                        demoMarketplaceHub.addChild(demoMoviePanel)
                    }
                    if (tvMarketplaceEnabled) {
                        var demoTvPanel = iaService.createNode(String.load(String.id.IDS_VIDEO_DASH_TV_FEATURED_LC), MS.Entertainment.UI.Monikers.tvMarketplacePanel, templateVideoHubNewTvPanel, hiddenHub);
                        demoTvPanel.getDataContext = function demoTvMarketplaceGetDataContext() {
                            return new MS.Entertainment.UI.Video.TvDemoDashboardDataContext
                        };
                        demoMarketplaceHub.addChild(demoTvPanel)
                    }
                }
        };
    if (!MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.informationArchitecture)) {
        Trace.fail("VideoIA - Information Architecture not registered. This should be impossible, but is always fatal");
        throw new Error("VideoIA - Information Architecture not registered");
    }
    var ia = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.informationArchitecture);
    ia.addIAHandler(createVideoIA)
})()
