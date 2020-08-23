/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/iaservice.js", "/Framework/serviceLocator.js", "/Monikers.js", "/ViewModels/Music/MusicSpotlight.js", "/ViewModels/Music/MusicHubMusicPanel.js");
(function() {
    "use strict";
    var createMusicIA = function createMusicIA(iaService) {
            var configManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
            var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
            var musicMarketplaceEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace);
            var musicMarketplaceEditorialEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplaceEditorial);
            var musicSmartDJEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.smartDJMarketplace);
            var subscriptionEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicSubscription);
            var freeStreamEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicFreePlay);
            var demoMode = configManager.shell.retailExperience;
            var usingNewMusicPage = configManager.shell.useNewMusicPage || window.onNewMusicPage;
            var hiddenPanel = {panel: MS.Entertainment.InformationArchitecture.Viewability.hidden};
            var hiddenHub = {hub: MS.Entertainment.InformationArchitecture.Viewability.hidden};
            var musicPage = "Components/Music/MusicPagesVertical.html";
            var templateMusicHubSpotlightPanel = "Components/Music/MusicDashboardTemplates.html#musicHubSpotlightPanelTemplate";
            var templateMusicHubMarketplacePanel = "Components/Music/Music.html#musicHubMusicMarketplacePanelTemplate";
            var templateMusicHubNewReleasesPanel = "Components/Music/Music.html#musicHubNewReleasesPanelTemplate";
            var templateTopMusic = "Components/Music/Music.html#musicHubTopMusicPanelTemplate";
            if (MS.Entertainment.Utilities.isMusicApp1)
                scriptValidator("/ViewModels/Music/MusicWelcomeViewModel.js");
            function createMusicCollectionGetDataContext(view) {
                return {
                        viewModel: new MS.Entertainment.ViewModels.MusicCollection(view), minModifierItems: 0, doNotRaisePanelReady: true, pivotsUsePanels: true, modifiersUsePanels: false, hideLoadingPanel: true, hideShadow: false, hideSidebar: true
                    }
            }
            {};
            function createMusicPlaylistCollectionGetDataContext() {
                return {
                        viewModel: new MS.Entertainment.ViewModels.MusicPlaylistCollection, minModifierItems: 0, doNotRaisePanelReady: true, pivotsUsePanels: true, modifiersUsePanels: false, hideLoadingPanel: true, hideShadow: false, hideSidebar: true
                    }
            }
            {};
            function createMusicSmartDJCollectionGetDataContext() {
                return {
                        viewModel: new MS.Entertainment.ViewModels.MusicSmartDJCollection, minModifierItems: 0, doNotRaisePanelReady: true, pivotsUsePanels: true, modifiersUsePanels: false, hideLoadingPanel: false, hideShadow: false, hidePivotsOnFailed: false, hideSidebar: true
                    }
            }
            {};
            function createMusicSearchDataContext(viewType) {
                return {
                        viewModel: new MS.Entertainment.ViewModels.MusicSearchViewModel(viewType, musicMarketplaceEnabled), minModifierItems: 0, doNotRaisePanelReady: true, pivotsUsePanels: true, modifiersUsePanels: false, hideLoadingPanel: false, hideShadow: false, hideSidebar: true
                    }
            }
            {};
            function createArtistAlbumsDataContext(viewType) {
                return {
                        viewModel: new MS.Entertainment.ViewModels.ArtistAlbums(viewType), minModifierItems: 0, doNotRaisePanelReady: true, pivotsUsePanels: true, modifiersUsePanels: false, hideLoadingPanel: false, hideShadow: false, hideSidebar: true
                    }
            }
            {};
            function createArtistActionSearchContext(viewType) {
                return {
                        viewModel: new MS.Entertainment.ViewModels.ArtistActionSearchViewModel(viewType), minModifierItems: 0, doNotRaisePanelReady: true, pivotsUsePanels: false, modifiersUsePanels: false, hideLoadingPanel: false, hideShadow: false, hideSidebar: true
                    }
            }
            {};
            function createSelectPlaylistContext(viewType) {
                return {
                        viewModel: new MS.Entertainment.ViewModels.SelectPlaylistViewModel(viewType), minModifierItems: 0, doNotRaisePanelReady: true, pivotsUsePanels: false, modifiersUsePanels: false, hideLoadingPanel: false, hideShadow: false, hideSidebar: true
                    }
            }
            {};
            var nowPlaying = iaService.createNode(String.load(String.id.IDS_HOME_NOW_PLAYING), MS.Entertainment.UI.Monikers.fullScreenNowPlaying);
            MS.Entertainment.InformationArchitecture.Node.overridePageFragmentUrl(nowPlaying, "Components/Music/MusicFullScreenNowPlaying.html");
            nowPlaying.getDataContext = null;
            var artistAlbums = iaService.createNode(String.load(String.id.IDS_MUSIC_ALBUMS_PIVOT), MS.Entertainment.UI.Monikers.artistAlbums);
            MS.Entertainment.InformationArchitecture.Node.overridePageFragmentUrl(artistAlbums, musicPage);
            artistAlbums.getDataContext = function getMusicCollectionDataContext() {
                return {preventHubSelectionSave: true}
            };
            var collectionArtistAlbums = iaService.createNode(String.load(String.id.IDS_MUSIC_COLLECTION_PIVOT), MS.Entertainment.UI.Monikers.artistAlbumsCollection, null, hiddenPanel);
            MS.Entertainment.InformationArchitecture.Node.overrideHubFragmentUrl(collectionArtistAlbums, "Components/Music/MusicPanels.html#artistAlbums");
            collectionArtistAlbums.getDataContext = function getMusicCollectionDataContext() {
                var dataContext = createArtistAlbumsDataContext("collection");
                return dataContext
            };
            artistAlbums.addChild(collectionArtistAlbums);
            var marketplaceArtistAlbums = iaService.createNode(String.load(String.id.IDS_MARKETPLACE_PIVOT), MS.Entertainment.UI.Monikers.artistAlbumsMarketplace, null, hiddenPanel);
            MS.Entertainment.InformationArchitecture.Node.overrideHubFragmentUrl(marketplaceArtistAlbums, "Components/Music/MusicPanels.html#artistAlbums");
            marketplaceArtistAlbums.getDataContext = function getMusicCollectionDataContext() {
                var dataContext = createArtistAlbumsDataContext("marketplace");
                return dataContext
            };
            artistAlbums.addChild(marketplaceArtistAlbums);
            var musicSearch = iaService.createNode(String.load(String.id.IDS_SEARCH_SEARCHSTARTED), MS.Entertainment.UI.Monikers.searchPage);
            MS.Entertainment.InformationArchitecture.Node.overridePageFragmentUrl(musicSearch, musicPage);
            musicSearch.getDataContext = function getMusicCollectionDataContext() {
                return {preventHubSelectionSave: true}
            };
            var allMusicSearch = iaService.createNode(String.load(String.id.IDS_SEARCH_FILTER_ALL), MS.Entertainment.UI.Monikers.allMusicSearch, null, hiddenPanel);
            MS.Entertainment.InformationArchitecture.Node.overrideHubFragmentUrl(allMusicSearch, "Components/Music/MusicPanels.html#musicSearchTemplate");
            allMusicSearch.getDataContext = function getMusicCollectionDataContext() {
                var dataContext = createMusicSearchDataContext(MS.Entertainment.ViewModels.MusicSearchViewModel.ViewTypes.allMusic);
                return dataContext
            };
            allMusicSearch.titleProviderFactory = function getSearchResultsPivotTitleProvider() {
                return new MS.Entertainment.ViewModels.SearchResultsPivotTitleProvider(String.id.IDS_SEARCH_FILTER_ALL, String.id.IDS_SEARCH_ALL_PIVOT_LABEL, "allCount", false)
            };
            musicSearch.addChild(allMusicSearch);
            var artistsSearch = iaService.createNode(String.load(String.id.IDS_MUSIC_TYPE_ARTIST_TITLE_TC), MS.Entertainment.UI.Monikers.artistsSearch, null, hiddenPanel);
            MS.Entertainment.InformationArchitecture.Node.overrideHubFragmentUrl(artistsSearch, "Components/Music/MusicPanels.html#musicSearchTemplate");
            artistsSearch.getDataContext = function getMusicCollectionDataContext() {
                var dataContext = createMusicSearchDataContext(MS.Entertainment.ViewModels.MusicSearchViewModel.ViewTypes.artists);
                return dataContext
            };
            artistsSearch.titleProviderFactory = function getSearchResultsPivotTitleProvider() {
                return new MS.Entertainment.ViewModels.SearchResultsPivotTitleProvider(String.id.IDS_MUSIC_TYPE_ARTIST_TITLE_TC, String.id.IDS_SEARCH_ARTISTS_PIVOT_LABEL, "artistsCount", true)
            };
            musicSearch.addChild(artistsSearch);
            var albumsSearch = iaService.createNode(String.load(String.id.IDS_MUSIC_TYPE_ALBUM_TITLE_TC), MS.Entertainment.UI.Monikers.albumsSearch, null, hiddenPanel);
            MS.Entertainment.InformationArchitecture.Node.overrideHubFragmentUrl(albumsSearch, "Components/Music/MusicPanels.html#musicSearchTemplate");
            albumsSearch.getDataContext = function getMusicCollectionDataContext() {
                var dataContext = createMusicSearchDataContext(MS.Entertainment.ViewModels.MusicSearchViewModel.ViewTypes.albums);
                return dataContext
            };
            albumsSearch.titleProviderFactory = function getSearchResultsPivotTitleProvider() {
                return new MS.Entertainment.ViewModels.SearchResultsPivotTitleProvider(String.id.IDS_MUSIC_TYPE_ALBUM_TITLE_TC, String.id.IDS_SEARCH_ALBUMS_PIVOT_LABEL, "albumsCount", true)
            };
            musicSearch.addChild(albumsSearch);
            var tracksSearch = iaService.createNode(String.load(String.id.IDS_MUSIC_TYPE_TRACK_TITLE_TC), MS.Entertainment.UI.Monikers.tracksSearch, null, hiddenPanel);
            MS.Entertainment.InformationArchitecture.Node.overrideHubFragmentUrl(tracksSearch, "Components/Music/MusicPanels.html#musicSearchTemplate");
            tracksSearch.getDataContext = function getMusicCollectionDataContext() {
                var dataContext = createMusicSearchDataContext(MS.Entertainment.ViewModels.MusicSearchViewModel.ViewTypes.tracks);
                return dataContext
            };
            tracksSearch.titleProviderFactory = function getSearchResultsPivotTitleProvider() {
                return new MS.Entertainment.ViewModels.SearchResultsPivotTitleProvider(String.id.IDS_MUSIC_TYPE_TRACK_TITLE_TC, String.id.IDS_SEARCH_SONGS_PIVOT_LABEL, "songsCount", true)
            };
            musicSearch.addChild(tracksSearch);
            var playlistsSearch = iaService.createNode(String.load(String.id.IDS_MUSIC_TYPE_PLAYLIST_TITLE_TC), MS.Entertainment.UI.Monikers.playlistsSearch, null, hiddenPanel);
            MS.Entertainment.InformationArchitecture.Node.overrideHubFragmentUrl(playlistsSearch, "Components/Music/MusicPanels.html#musicSearchTemplate");
            playlistsSearch.getDataContext = function getMusicCollectionDataContext() {
                var dataContext = createMusicSearchDataContext(MS.Entertainment.ViewModels.MusicSearchViewModel.ViewTypes.playlists);
                return dataContext
            };
            playlistsSearch.titleProviderFactory = function getSearchResultsPivotTitleProvider() {
                return new MS.Entertainment.ViewModels.SearchResultsPivotTitleProvider(String.id.IDS_MUSIC_TYPE_PLAYLIST_TITLE_TC, String.id.IDS_SEARCH_PLAYLISTS_PIVOT_LABEL, "playlistsCount", true)
            };
            musicSearch.addChild(playlistsSearch);
            var artistActionSearch = iaService.createNode(String.load(String.id.IDS_SEARCH_SEARCHSTARTED), MS.Entertainment.UI.Monikers.artistSearchAction);
            MS.Entertainment.InformationArchitecture.Node.overridePageFragmentUrl(artistActionSearch, musicPage);
            artistActionSearch.getDataContext = function getMusicCollectionDataContext() {
                return {preventHubSelectionSave: true}
            };
            var artistActionSearchPivot = iaService.createNode(String.load(String.id.IDS_MUSIC_COLLECTION_PIVOT), MS.Entertainment.UI.Monikers.artistSearchActionPivot, null, hiddenPanel);
            MS.Entertainment.InformationArchitecture.Node.overrideHubFragmentUrl(artistActionSearchPivot, "Components/Music/MusicPanels.html#artistActionSearch");
            artistActionSearchPivot.getDataContext = function getMusicCollectionDataContext() {
                var dataContext = createArtistActionSearchContext("artistActionSearch");
                return dataContext
            };
            artistActionSearch.addChild(artistActionSearchPivot);
            var musicCollection = iaService.createNode(String.load(musicMarketplaceEnabled ? String.id.IDS_MUSIC_COLLECTION_PIVOT : String.id.IDS_MUSIC_APP_TITLE), MS.Entertainment.UI.Monikers.musicCollection);
            MS.Entertainment.InformationArchitecture.Node.overridePageFragmentUrl(musicCollection, musicPage);
            musicCollection.perfTrackStartPoint = MS.Entertainment.Instrumentation.PerfTrack.StartPoints.CollectionGalleryRequest;
            if (usingNewMusicPage) {
                var emptyHome = iaService.createNode(String.load(String.id.IDS_HOME_PIVOT), MS.Entertainment.UI.Monikers.homeHub);
                MS.Entertainment.InformationArchitecture.Node.overridePageFragmentUrl(emptyHome, "/Components/Music1/EmptyHome.html");
                iaService.rootNode = emptyHome
            }
            if (musicMarketplaceEnabled || usingNewMusicPage)
                iaService.rootNode.addChild(musicCollection);
            else
                iaService.rootNode = musicCollection;
            var musicCollectionByAlbum = iaService.createNode(String.load(String.id.IDS_COLLECTION_BY_ALBUM_TITLE), MS.Entertainment.UI.Monikers.musicCollectionByAlbum, null, hiddenPanel);
            MS.Entertainment.InformationArchitecture.Node.overrideHubFragmentUrl(musicCollectionByAlbum, "Components/Music/MusicPanels.html#musicCollectionAlbumsTemplate");
            musicCollectionByAlbum.getDataContext = function getMusicCollectionDataContext() {
                var dataContext = createMusicCollectionGetDataContext("albums");
                return dataContext
            };
            musicCollection.addChild(musicCollectionByAlbum);
            var musicCollectionByArtist = iaService.createNode(String.load(String.id.IDS_COLLECTION_BY_ARTIST_TITLE), MS.Entertainment.UI.Monikers.musicCollectionByArtist, null, hiddenPanel);
            MS.Entertainment.InformationArchitecture.Node.overrideHubFragmentUrl(musicCollectionByArtist, "Components/Music/MusicPanels.html#musicCollectionArtistsTemplate");
            musicCollectionByArtist.getDataContext = function getMusicCollectionDataContext() {
                var dataContext = createMusicCollectionGetDataContext("artists");
                return dataContext
            };
            musicCollection.addChild(musicCollectionByArtist);
            if (MS.Entertainment.Utilities.isMusicApp1) {
                var musicCollectionBySong = iaService.createNode(String.load(String.id.IDS_COLLECTION_BY_SONG_TITLE), MS.Entertainment.UI.Monikers.musicCollectionBySong, null, hiddenPanel);
                MS.Entertainment.InformationArchitecture.Node.overrideHubFragmentUrl(musicCollectionBySong, "Components/Music/MusicPanels.html#musicCollectionSongsTemplate");
                musicCollectionBySong.getDataContext = function getMusicCollectionDataContext() {
                    var dataContext = createMusicCollectionGetDataContext("songs");
                    return dataContext
                };
                musicCollection.addChild(musicCollectionBySong)
            }
            var musicCollectionPlaylists = iaService.createNode(String.load(String.id.IDS_PLAYLIST_COLLECTION_TITLE), MS.Entertainment.UI.Monikers.musicCollectionPlaylists, null, hiddenPanel);
            MS.Entertainment.InformationArchitecture.Node.overrideHubFragmentUrl(musicCollectionPlaylists, "Components/Music/MusicPanels.html#musicCollectionPlaylistsTemplate");
            musicCollectionPlaylists.getDataContext = function getMusicCollectionDataContext() {
                var dataContext = createMusicPlaylistCollectionGetDataContext("playlists");
                return dataContext
            };
            musicCollection.addChild(musicCollectionPlaylists);
            if (musicMarketplaceEnabled && (subscriptionEnabled || freeStreamEnabled) && musicSmartDJEnabled) {
                var musicCollectionSmartDJs = iaService.createNode(String.load(String.id.IDS_SMARTDJ_COLLECTION_TITLE), MS.Entertainment.UI.Monikers.musicCollectionSmartDJs, null, hiddenPanel);
                MS.Entertainment.InformationArchitecture.Node.overrideHubFragmentUrl(musicCollectionSmartDJs, "Components/Music/MusicPanels.html#musicCollectionSmartDJsTemplate");
                musicCollectionSmartDJs.getDataContext = function getMusicCollectionDataContext() {
                    var dataContext = createMusicSmartDJCollectionGetDataContext("smartDJs");
                    return dataContext
                };
                musicCollection.addChild(musicCollectionSmartDJs)
            }
            var selectPlaylist = iaService.createNode(String.load(String.id.IDS_MUSIC_ENGAGE_PLAYLIST_PLAY_TITLE_UC), MS.Entertainment.UI.Monikers.selectPlaylist);
            MS.Entertainment.InformationArchitecture.Node.overridePageFragmentUrl(selectPlaylist, musicPage);
            selectPlaylist.getDataContext = function getMusicCollectionDataContext() {
                return {preventHubSelectionSave: true}
            };
            var selectPlaylistPivot = iaService.createNode(String.load(String.id.IDS_MUSIC_COLLECTION_PIVOT), MS.Entertainment.UI.Monikers.selectPlaylistPivot, null, hiddenPanel);
            MS.Entertainment.InformationArchitecture.Node.overrideHubFragmentUrl(selectPlaylistPivot, "Components/Music/MusicPanels.html#selectPlaylist");
            selectPlaylistPivot.getDataContext = function getSelectPlaylistContext() {
                var dataContext = createSelectPlaylistContext("playlists");
                return dataContext
            };
            selectPlaylist.addChild(selectPlaylistPivot);
            if (musicMarketplaceEnabled)
                if (!demoMode) {
                    if (!usingNewMusicPage) {
                        var home = iaService.createNode(String.load(String.id.IDS_HOME_PIVOT), MS.Entertainment.UI.Monikers.homeHub);
                        home.getDataContext = function homeGetDataContext() {
                            return new MS.Entertainment.ViewModels.MusicSpotlight
                        };
                        var spotlightPanel = iaService.createNode(String.load(String.id.IDS_HOME_NOW_PLAYING_LC), MS.Entertainment.UI.Monikers.homeSpotlight, templateMusicHubSpotlightPanel);
                        iaService.rootNode.addChild(home);
                        iaService.rootNode.defaultChild = home;
                        home.addChild(spotlightPanel)
                    }
                    var createMusicMarketplaceGetDataContext = function createMusicMarketplaceGetDataContext(view) {
                            return {
                                    viewModel: new MS.Entertainment.ViewModels.MusicMarketplace(view), minModifierItems: 1, doNotRaisePanelReady: true, pivotsUsePanels: false, modifiersUsePanels: false, hideLoadingPanel: false, hideShadow: true, hideSidebar: false
                                }
                        };
                    var createMusicFlexHubGetDataContext = function createMusicFlexHubGetDataContext(view) {
                            return {
                                    viewModel: new MS.Entertainment.ViewModels.MusicFlexHub(view), minModifierItems: 0, pivotsUsePanels: false, modifiersUsePanels: false, hideLoadingPanel: false, hideShadow: true, hideSidebar: false
                                }
                        };
                    var welcomeAcknowledged = configManager.music.welcomeAcknowledged;
                    if (MS.Entertainment.Utilities.isMusicApp1 && !welcomeAcknowledged && freeStreamEnabled && (MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState)).servicesEnabled) {
                        var welcomeHub = iaService.createNode(String.empty, MS.Entertainment.UI.Monikers.welcomeHub);
                        welcomeHub.getDataContext = function welcomeHubGetDataContext() {
                            return new MS.Entertainment.ViewModels.MusicWelcomeViewModel
                        };
                        var welcomePanel = iaService.createNode(String.empty, MS.Entertainment.UI.Monikers.welcomePanel, "Components/Music/Music.html#musicHubWelcomePanelTemplate");
                        iaService.rootNode.addChild(welcomeHub);
                        welcomeHub.addChild(welcomePanel)
                    }
                    var featuredNewReleasesHub;
                    if (musicMarketplaceEditorialEnabled) {
                        featuredNewReleasesHub = iaService.createNode(String.load(String.id.IDS_MUSIC_MARKETPLACE_GALLERY_TITLE), MS.Entertainment.UI.Monikers.musicMarketplace, null, null, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace);
                        featuredNewReleasesHub.perfTrackStartPoint = MS.Entertainment.Instrumentation.PerfTrack.StartPoints.MarketplaceGalleryRequest;
                        featuredNewReleasesHub.getDataContext = function getMusicCollectionDataContext() {
                            return {
                                    doNotRaisePanelReady: true, hideLoadingPanel: true, hideShadow: false
                                }
                        }
                    }
                    else
                        featuredNewReleasesHub = iaService.createNode(String.load(String.id.IDS_MUSIC_MARKETPLACE_GALLERY_TITLE), MS.Entertainment.UI.Monikers.musicNewReleases, null, null, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace);
                    MS.Entertainment.InformationArchitecture.Node.overridePageFragmentUrl(featuredNewReleasesHub, musicPage);
                    iaService.rootNode.addChild(featuredNewReleasesHub);
                    var featuredNewReleasesPanel;
                    if (musicMarketplaceEditorialEnabled) {
                        featuredNewReleasesPanel = iaService.createNode(String.load(String.id.IDS_MUSIC_MARKETPLACE_DASHBOARD_TITLE), MS.Entertainment.UI.Monikers.musicMarketplacePanel, templateMusicHubMarketplacePanel, {hub: MS.Entertainment.InformationArchitecture.Viewability.hidden}, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace);
                        featuredNewReleasesPanel.getDataContext = function musicMarketplaceGetDataContext() {
                            return new MS.Entertainment.ViewModels.MusicHubMusicPanel
                        }
                    }
                    else {
                        featuredNewReleasesPanel = iaService.createNode(String.load(String.id.IDS_MUSIC_MARKETPLACE_DASHBOARD_TITLE), MS.Entertainment.UI.Monikers.musicNewReleasesPanel, templateMusicHubNewReleasesPanel, {hub: MS.Entertainment.InformationArchitecture.Viewability.hidden}, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace);
                        featuredNewReleasesPanel.getDataContext = function newReleasesGetDataContext() {
                            return new MS.Entertainment.ViewModels.MusicHubNewReleasesPanel
                        }
                    }
                    featuredNewReleasesHub.addChild(featuredNewReleasesPanel);
                    var musicMarketplaceNewReleasesHub = iaService.createNode(String.load(String.id.IDS_MUSIC_MARKETPLACE_DASHBOARD_TITLE), MS.Entertainment.UI.Monikers.musicNewReleasesGallery, null, hiddenPanel, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace);
                    var newView = (MS.Entertainment.Utilities.isMusicApp1) ? MS.Entertainment.ViewModels.MusicMarketplace.ViewTypes.newReleases : MS.Entertainment.ViewModels.MusicMarketplace.ViewTypes.newReleasesHorizontal;
                    musicMarketplaceNewReleasesHub.getDataContext = function getFeaturedContext() {
                        return createMusicMarketplaceGetDataContext(newView)
                    };
                    MS.Entertainment.InformationArchitecture.Node.overrideHubFragmentUrl(musicMarketplaceNewReleasesHub, "Components/Music/MusicPanels.html#musicMarketplaceTemplate");
                    featuredNewReleasesHub.addChild(musicMarketplaceNewReleasesHub);
                    var topAlbums = iaService.createNode(String.load(String.id.IDS_MUSIC_MOST_POPULAR_PANEL_HEADER), MS.Entertainment.UI.Monikers.musicTopMusic, null, null, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace);
                    topAlbums.perfTrackStartPoint = MS.Entertainment.Instrumentation.PerfTrack.StartPoints.MarketplaceGalleryRequest;
                    MS.Entertainment.InformationArchitecture.Node.overridePageFragmentUrl(topAlbums, musicPage);
                    iaService.rootNode.addChild(topAlbums);
                    var topAlbumsPanel = iaService.createNode(String.load(String.id.IDS_MUSIC_MOST_POPULAR_PANEL_HEADER), MS.Entertainment.UI.Monikers.musicTopAlbumsPanel, "Components/Music/Music.html#musicHubTopAlbumsPanelTemplate", {hub: MS.Entertainment.InformationArchitecture.Viewability.hidden}, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace);
                    topAlbumsPanel.getDataContext = function topAlbumsGetDataContext() {
                        return new MS.Entertainment.ViewModels.MusicHubTopAlbumsPanel
                    };
                    topAlbums.addChild(topAlbumsPanel);
                    var topArtistPanel = iaService.createNode(String.empty, MS.Entertainment.UI.Monikers.musicTopArtistsPanel, "Components/Music/Music.html#musicHubTopArtistPanelTemplate", {hub: MS.Entertainment.InformationArchitecture.Viewability.hidden}, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace);
                    topArtistPanel.getDataContext = function topAlbumsGetDataContext() {
                        return new MS.Entertainment.ViewModels.MusicHubTopArtistPanel
                    };
                    topAlbums.addChild(topArtistPanel);
                    var musicMarketplacePopularGallery = iaService.createNode(String.load(String.id.IDS_MUSIC_MOST_POPULAR_PANEL_HEADER), MS.Entertainment.UI.Monikers.musicPopularGallery, null, hiddenPanel, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace);
                    var popularView = (MS.Entertainment.Utilities.isMusicApp1) ? MS.Entertainment.ViewModels.MusicMarketplace.ViewTypes.popular : MS.Entertainment.ViewModels.MusicMarketplace.ViewTypes.popularHorizontal;
                    musicMarketplacePopularGallery.getDataContext = function getFeaturedContext() {
                        return createMusicMarketplaceGetDataContext(popularView)
                    };
                    MS.Entertainment.InformationArchitecture.Node.overrideHubFragmentUrl(musicMarketplacePopularGallery, "Components/Music/MusicPanels.html#musicMarketplaceTemplate");
                    topAlbums.addChild(musicMarketplacePopularGallery);
                    var musicFlexHubPage = iaService.createNode(String.empty, MS.Entertainment.UI.Monikers.flexHubPage);
                    MS.Entertainment.InformationArchitecture.Node.overridePageFragmentUrl(musicFlexHubPage, musicPage);
                    musicFlexHubPage.getDataContext = function getMusicFlexHubDataContext() {
                        return {
                                preventHubSelectionSave: true, pageIsFlexHub: true
                            }
                    };
                    var musicFlexHub = iaService.createNode(String.empty, MS.Entertainment.UI.Monikers.flexHub, null, hiddenPanel);
                    MS.Entertainment.InformationArchitecture.Node.overrideHubFragmentUrl(musicFlexHub, "Components/Music/MusicPanels.html#musicFlexHubTemplate");
                    musicFlexHub.getDataContext = function getFeaturedContext() {
                        return createMusicFlexHubGetDataContext(MS.Entertainment.ViewModels.MusicFlexHub.ViewTypes.flexHub)
                    };
                    musicFlexHubPage.addChild(musicFlexHub)
                }
                else if (!window.onNewMusicPage) {
                    var home = iaService.createNode(String.load(String.id.IDS_HOME_PIVOT), MS.Entertainment.UI.Monikers.homeHub);
                    var spotlightPanel = iaService.createNode(String.load(String.id.IDS_MUSIC_SPOTLIGHT_PANEL_HEADER), MS.Entertainment.UI.Monikers.homeSpotlight, "Components/Music/MusicSpotlightViewDemo.html#musicSpotlightViewDemoTemplate");
                    iaService.rootNode.addChild(home);
                    iaService.rootNode.defaultChild = home;
                    home.addChild(spotlightPanel);
                    var featuredNewReleasesHubDemo = iaService.createNode(String.load(String.id.IDS_MUSIC_MARKETPLACE_GALLERY_TITLE), MS.Entertainment.UI.Monikers.musicMarketplace, null, null, null);
                    iaService.rootNode.addChild(featuredNewReleasesHubDemo);
                    var featuredNewReleasesPanelDemo = iaService.createNode(String.load(String.id.IDS_MUSIC_MARKETPLACE_DASHBOARD_TITLE), MS.Entertainment.UI.Monikers.musicMarketplacePanel, "Components/Music/FeaturedMusicViewDemo.html#featuredMusicViewDemoTemplate", hiddenHub);
                    featuredNewReleasesHubDemo.addChild(featuredNewReleasesPanelDemo)
                }
        };
    if (!MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.informationArchitecture)) {
        Trace.fail("MusicIA - Information Architecture not registered. This should be impossible, but is always fatal");
        throw new Error("MusicIA - Information Architecture not registered");
    }
    var ia = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.informationArchitecture);
    ia.addIAHandler(createMusicIA)
})()
