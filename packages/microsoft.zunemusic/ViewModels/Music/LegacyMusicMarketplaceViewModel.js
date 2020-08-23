/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    var transferService = MS.Entertainment.UI.FileTransferService;
    var notifiers = MS.Entertainment.UI.FileTransferNotifiers;
    scriptValidator("/ViewModels/Music/MusicViewModel.js");
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {MusicMarketplaceAutomationIds: {
            newReleasesAllGenres: "newReleasesAllGenres_pivot", popularAllGenres: "popularAllGenres_pivot", newReleasesReleaseDate: "newReleasesReleaseDate_modifier", newReleasesTopAlbums: "newReleasesTopAlbums_modifier", newReleasesFeaturedAlbums: "newReleasesFeaturedAlbums_modifier", newMusicVideos: "newMusicVideos_modifier", newReleasesSubGenreReleaseDate: "newReleasesSubGenreReleaseDate_modifier", newReleasesSubGenreTopAlbums: "newReleasesSubGenreTopAlbums_modifier", playTopSongsAction: "playTopSongsAction", playTopMusicVideosAction: "playTopMusicVideosAction", popularTopArtists: "popularTopArtists_modifier", popularTopSongs: "popularTopSongs_modifier", popularTopAlbums: "popularTopAlbums_modifier", popularTopVideos: "popularTopVideos_modifier", artistDiscography: "artistDiscography_pivot", artistDiscographyReleaseYearSort: "artistDiscographyReleaseYearSort_modifier", artistDiscographyPopularitySort: "artistDiscographyPopularitySort_modifier", defaultSubGenre: "defaultSubGenre_modifier", artistRelated: "artistRelated_pivot", artistRelations: "artistRelations_modifier", artistInfluencers: "artistInfluencers_modifier"
        }});
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {
        MusicMarketplaceFailedPanelModel: MS.Entertainment.deferredDerive(MS.Entertainment.UI.Controls.DefaultFailedPanelModel, function MusicMarketplaceFailedPanelModel() {
            this.base()
        }, {
            primaryStringId: String.id.IDS_MUSIC_MARKETPLACE_EMPTY_TITLE, secondaryStringId: String.id.IDS_MUSIC_MARKETPLACE_EMPTY_DESC
        }), MusicMarketplace: MS.Entertainment.UI.Framework.derive("MS.Entertainment.ViewModels.Music", function musicMarketplaceConstructor(view) {
                MS.Entertainment.ViewModels.Music.prototype.constructor.apply(this, arguments);
                if (MS.Entertainment.Utilities.isMusicApp1)
                    this.emptyGalleryModel = new MS.Entertainment.ViewModels.MusicMarketplaceFailedPanelModel;
                else {
                    MS.Entertainment.ViewModels.assert(MS.Entertainment.Utilities.isMusicApp2, "Expected to be in Music2 if not Music1");
                    this.emptyGalleryModel = new MS.Entertainment.UI.Controls.MarketplaceEmptyPanelModel;
                    this.isHorizontalLayout = true;
                    this.addActionCellsToList = false
                }
            }, {
                _viewModelId: "musicMarketplace", emptyGalleryModel: null, isHorizontalLayout: false, createActionCells: function createActionCells(count) {
                        var actionCells = [];
                        var canShowPlayAction = WinJS.Utilities.getMember("selectedTemplate.showPlayAction", this);
                        var minimumCount = WinJS.Utilities.getMember("selectedTemplate.minimumCount", this);
                        if (canShowPlayAction && WinJS.Utilities.getMember("selectedTemplate.hasUnratedContent", this)) {
                            var contentRestrictionStateHandler = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.contentRestrictionStateHandler);
                            canShowPlayAction = contentRestrictionStateHandler.canPlayUnratedContent
                        }
                        canShowPlayAction = canShowPlayAction && minimumCount !== undefined && count >= minimumCount;
                        if (canShowPlayAction) {
                            var signInService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                            var signedInUserService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                            var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                            var isFreeStreamingEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicFreePlay);
                            if (signInService.isSignedIn && (signedInUserService.isSubscription || isFreeStreamingEnabled)) {
                                var newActionCell = new MS.Entertainment.ViewModels.ActionCell(MS.Entertainment.UI.Actions.ActionIdentifiers.playQuery, {
                                        queryFactory: this.createTrackQuery.bind(this), preRollVideoAdIfNeeded: true, automationId: MS.Entertainment.ViewModels.MusicMarketplaceAutomationIds.playTopSongsAction, icon: MS.Entertainment.UI.Icon.play, voiceGuiTextStringId: String.id.IDS_TOP_SONGS_PLAY_ALL_BUTTON_VUI_GUI, voicePhraseStringId: String.id.IDS_TOP_SONGS_PLAY_ALL_BUTTON_VUI_ALM, voicePhoneticPhraseStringId: String.id.IDS_TOP_SONGS_PLAY_ALL_BUTTON_VUI_PRON
                                    });
                                newActionCell.icon = MS.Entertainment.UI.Icon.play;
                                newActionCell.stringId = String.id.IDS_PLAY_ALL_LABEL;
                                actionCells.push(newActionCell)
                            }
                        }
                        return actionCells
                    }, createTrackQuery: function createTrackQuery() {
                        var query = MS.Entertainment.ViewModels.Music.prototype.createTrackQuery.apply(this, arguments);
                        query.hasTotalCount = true;
                        return query
                    }, getViewDefinition: function getViewDefinition(view) {
                        return MS.Entertainment.ViewModels.MusicMarketplace.Views[view]
                    }, getPivotDefinition: function getPivotDefinition(view) {
                        return MS.Entertainment.ViewModels.MusicMarketplace.Pivots[view]
                    }, getSubPivotDefinition: function(view, pivot) {
                        var definition = null;
                        if (MS.Entertainment.Utilities.isMusicApp1 && pivot && pivot.isRoot && this.pivotsSelectionManager && this.pivotsSelectionManager.selectedIndex > 0)
                            definition = MS.Entertainment.ViewModels.MusicMarketplace.SubPivots.all;
                        return definition
                    }, getModifierDefinition: function getModifierDefinition(view) {
                        if (view === MS.Entertainment.ViewModels.MusicMarketplace.ViewTypes.newReleases && this.pivotsSelectionManager && this.pivotsSelectionManager.selectedItem && !this.pivotsSelectionManager.selectedItem.isRoot)
                            return MS.Entertainment.ViewModels.MusicMarketplace.Modifiers.newReleasesSubGenre;
                        else
                            return MS.Entertainment.ViewModels.MusicMarketplace.Modifiers[view]
                    }, getSecondaryModifierDefinition: function getSecondaryModifierDefinition(view) {
                        var definition = null;
                        if (MS.Entertainment.Utilities.isMusicApp2 && this.modifierSelectionManager && this.modifierSelectionManager.selectedIndex > 0)
                            definition = MS.Entertainment.ViewModels.MusicMarketplace.SecondaryModifiers[this._view];
                        return definition
                    }, _isAdEnabled: function _isAdEnabled() {
                        var screenWidth = MS.Entertainment.Utilities.getWindowWidth();
                        if (screenWidth < MS.Entertainment.ViewModels.MusicMarketplace.MinimumPixelWidthForSidebar)
                            return false;
                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        if (!featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicFreePlay))
                            return false;
                        var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                        return !signedInUser.isSubscription
                    }, getSidebarItems: function getSidebarItems(view) {
                        var sidebarItems = [];
                        if (this._isAdEnabled()) {
                            var adId = view === MS.Entertainment.ViewModels.MusicMarketplace.ViewTypes.newReleases ? MS.Entertainment.UI.Components.Shell.AdControl.AdIds.musicSpotlightSidebar : MS.Entertainment.UI.Components.Shell.AdControl.AdIds.musicPopularSidebar;
                            var adControl = new MS.Entertainment.UI.Components.Shell.SidebarAdControl(null, {ad: adId});
                            sidebarItems.push(adControl.domElement)
                        }
                        return sidebarItems
                    }
            }, {
                MinimumPixelWidthForSidebar: 1366, ViewTypes: {
                        newReleases: "newReleases", newReleasesHorizontal: "newReleasesHorizontal", popular: "popular", popular2: "popular2", popularHorizontal: "popularHorizontal"
                    }, Pivots: {
                        newReleases: {
                            itemQuery: MS.Entertainment.Data.Query.Music.Genres, itemFactory: function itemFactory() {
                                    return [new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.MusicMarketplaceAutomationIds.newReleasesAllGenres, String.id.IDS_FILTER_ALL_GENRES, new MS.Entertainment.ViewModels.NodeValues(null, {
                                                genreId: String.empty, subGenreId: String.empty
                                            }))]
                                }
                        }, newReleasesHorizontal: {itemFactory: function itemFactory() {
                                    return [new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.MusicMarketplaceAutomationIds.newReleasesFeaturedAlbums, String.id.IDS_MUSIC2_NEW_ALBUMS_GALLERY_PAGE_TITLE, new MS.Entertainment.ViewModels.NodeValues(function getFeaturedAlbumsQuery() {
                                                return new MS.Entertainment.Data.Query.FilterMusicBrowseRestrictedContentWrapperQuery(MS.Entertainment.Data.Query.Music.BrowseFeaturedAlbums)
                                            }, {autoUpdateOnSignIn: true}, {
                                                failOnEmpty: true, selectedTemplate: MS.Entertainment.ViewModels.MusicMarketplaceTemplates.albums
                                            }, null)), new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.MusicMarketplaceAutomationIds.newMusicVideos, String.id.IDS_MUSIC2_NEW_VIDEOS_GALLERY_PAGE_TITLE, new MS.Entertainment.ViewModels.NodeValues(null, {
                                                autoUpdateOnSignIn: true, acquisitionData: new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.store, Microsoft.Entertainment.Platform.AcquisitionContextType.musicVideo)
                                            }, {
                                                failOnEmpty: true, selectedTemplate: MS.Entertainment.ViewModels.MusicMarketplaceTemplates.musicVideos
                                            }, null, {acquisitionData: new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.store, Microsoft.Entertainment.Platform.AcquisitionContextType.playAll)})), ]
                                }}, popular: {
                                itemQuery: MS.Entertainment.Data.Query.Music.Genres, itemFactory: function itemFactory() {
                                        return [new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.MusicMarketplaceAutomationIds.popularAllGenres, String.id.IDS_FILTER_ALL_GENRES, new MS.Entertainment.ViewModels.NodeValues(null, {
                                                    genreId: String.empty, subGenreId: String.empty
                                                }, null, null, null, null, {acquisitionData: new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.store, Microsoft.Entertainment.Platform.AcquisitionContextType.playAll)}))]
                                    }
                            }, popularHorizontal: {itemFactory: function itemFactory() {
                                    return MS.Entertainment.ViewModels.MusicMarketplace.Modifiers[MS.Entertainment.ViewModels.MusicMarketplace.ViewTypes.popular2].generateItemFactory({
                                            artists: MS.Entertainment.ViewModels.MusicMarketplaceTemplates.topArtists, tracks: MS.Entertainment.ViewModels.MusicMarketplaceTemplates.topTracks, albums: MS.Entertainment.ViewModels.MusicMarketplaceTemplates.topAlbums, musicVideos: MS.Entertainment.ViewModels.MusicMarketplaceTemplates.topMusicVideos
                                        })
                                }}
                    }, Modifiers: {
                        newReleases: {itemFactory: function itemFactory() {
                                var modifiers = [new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.MusicMarketplaceAutomationIds.newReleasesReleaseDate, String.id.IDS_MUSIC_NEW_RELEASES_TITLE_LC, new MS.Entertainment.ViewModels.NodeValues(MS.Entertainment.Data.Query.Music.Albums, {
                                            orderBy: MS.Entertainment.Data.Query.convertToLegacySortIfNeeded(MS.Entertainment.Data.Query.edsSortOrder.releaseDate), autoUpdateOnSignIn: true
                                        }, {failOnEmpty: false}, null)), new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.MusicMarketplaceAutomationIds.newReleasesTopAlbums, String.id.IDS_MUSIC_TOP_ALBUMS_PIVOT, new MS.Entertainment.ViewModels.NodeValues(MS.Entertainment.Data.Query.Music.TopAlbums, {autoUpdateOnSignIn: true}, {failOnEmpty: false}, null))];
                                var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                                var musicMarketplaceEditorialEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplaceEditorial);
                                if (musicMarketplaceEditorialEnabled)
                                    modifiers.splice(0, 0, new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.MusicMarketplaceAutomationIds.newReleasesFeaturedAlbums, String.id.IDS_MUSIC_FEATURED_PIVOT, new MS.Entertainment.ViewModels.NodeValues(function getFeaturedAlbumsQuery() {
                                        return new MS.Entertainment.Data.Query.FilterMusicBrowseRestrictedContentWrapperQuery(MS.Entertainment.Data.Query.Music.BrowseFeaturedAlbums)
                                    }, {autoUpdateOnSignIn: true}, {failOnEmpty: true}, null)));
                                return modifiers
                            }}, newReleasesSubGenre: {itemFactory: function itemFactory() {
                                    return [new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.MusicMarketplaceAutomationIds.newReleasesSubGenreReleaseDate, String.id.IDS_MUSIC_NEW_RELEASES_TITLE_LC, new MS.Entertainment.ViewModels.NodeValues(MS.Entertainment.Data.Query.Music.Albums, {
                                                orderBy: MS.Entertainment.Data.Query.convertToLegacySortIfNeeded(MS.Entertainment.Data.Query.edsSortOrder.releaseDate), autoUpdateOnSignIn: true
                                            }, {failOnEmpty: false})), new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.MusicMarketplaceAutomationIds.newReleasesSubGenreTopAlbums, String.id.IDS_MUSIC_TOP_ALBUMS_PIVOT, new MS.Entertainment.ViewModels.NodeValues(MS.Entertainment.Data.Query.Music.TopAlbums, {autoUpdateOnSignIn: true}, {failOnEmpty: false}))]
                                }}, newReleasesHorizontal: {itemFactory: function itemFactory() {
                                    var userUsageDataService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.userUsageData);
                                    var isSynchronous = false;
                                    var genreList = [new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.MusicMarketplaceAutomationIds.newReleasesAllGenres, String.id.IDS_MUSIC2_FILTER_ALL_GENRES_TC, new MS.Entertainment.ViewModels.NodeValues(MS.Entertainment.Data.Query.Music.BrowseFeaturedMusicVideos, {
                                                genreId: String.empty, subGenreId: String.empty
                                            }))];
                                    userUsageDataService.getMusicGenreList().done(function gotGenres(genres) {
                                        isSynchronous = true;
                                        for (var i = 0; i < genres.length; i++)
                                            genreList.push(new MS.Entertainment.ViewModels.Node(genres[i].name, genres[i].name, new MS.Entertainment.ViewModels.NodeValues(MS.Entertainment.Data.Query.Music.BrowseNewMusicVideos, {genreId: genres[i].name})))
                                    });
                                    MS.Entertainment.Pages.assert(isSynchronous, "getMusicGenreList should be synchronous");
                                    return genreList
                                }}, popular: {
                                generateItemFactory: function generateItemFactory(selectedTemplates) {
                                    return [new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.MusicMarketplaceAutomationIds.popularTopArtists, String.id.IDS_MUSIC_SHOW_ARTISTS, new MS.Entertainment.ViewModels.NodeValues(MS.Entertainment.Data.Query.Music.TopArtists, {
                                                autoUpdateOnSignIn: true, acquisitionData: new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.store, Microsoft.Entertainment.Platform.AcquisitionContextType.artist)
                                            }, {
                                                selectedTemplate: selectedTemplates.artists, propertyKey: "serviceId", taskKeyGetter: transferService && transferService.keyFromProperty("albumArtistMediaId", false, true), notifier: notifiers && notifiers.trackCollection
                                            }, null)), new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.MusicMarketplaceAutomationIds.popularTopSongs, String.id.IDS_MUSIC_SHOW_SONGS, new MS.Entertainment.ViewModels.NodeValues(MS.Entertainment.Data.Query.Music.TopSongs, {
                                                autoUpdateOnSignIn: true, acquisitionData: new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.store, Microsoft.Entertainment.Platform.AcquisitionContextType.track)
                                            }, {
                                                selectedTemplate: selectedTemplates.tracks, propertyKey: "serviceId", taskKeyGetter: transferService && transferService.keyFromProperty("mediaId", false, true), notifier: notifiers && notifiers.trackCollection
                                            }, null, null, MS.Entertainment.Data.Query.Music.TopSongs, {acquisitionData: new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.store, Microsoft.Entertainment.Platform.AcquisitionContextType.playAll)})), new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.MusicMarketplaceAutomationIds.popularTopAlbums, String.id.IDS_MUSIC_SHOW_ALBUMS, new MS.Entertainment.ViewModels.NodeValues(MS.Entertainment.Data.Query.Music.TopAlbums, {
                                                autoUpdateOnSignIn: true, acquisitionData: new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.store, Microsoft.Entertainment.Platform.AcquisitionContextType.album)
                                            }, {
                                                selectedTemplate: selectedTemplates.albums, propertyKey: "serviceId", taskKeyGetter: transferService && transferService.keyFromProperty("albumMediaId", false, true), notifier: notifiers && notifiers.trackCollection
                                            }, null)), ]
                                }, itemFactory: function itemFactory() {
                                        return MS.Entertainment.ViewModels.MusicMarketplace.Modifiers[MS.Entertainment.ViewModels.MusicMarketplace.ViewTypes.popular].generateItemFactory({
                                                artists: MS.Entertainment.ViewModels.MusicMarketplaceTemplates.artists, tracks: MS.Entertainment.ViewModels.MusicMarketplaceTemplates.tracks, albums: MS.Entertainment.ViewModels.MusicMarketplaceTemplates.albums
                                            })
                                    }
                            }, popular2: {
                                generateItemFactory: function generateItemFactory(selectedTemplates) {
                                    return [new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.MusicMarketplaceAutomationIds.popularTopSongs, String.id.IDS_MUSIC2_TOP_SONGS_GALLERY_PAGE_TITLE, new MS.Entertainment.ViewModels.NodeValues(MS.Entertainment.Data.Query.Music.LimitedTopSongs, {
                                                autoUpdateOnSignIn: true, acquisitionData: new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.store, Microsoft.Entertainment.Platform.AcquisitionContextType.track)
                                            }, {
                                                selectedTemplate: selectedTemplates.tracks, propertyKey: "serviceId", taskKeyGetter: transferService && transferService.keyFromProperty("mediaId", false, true), notifier: notifiers && notifiers.trackCollection
                                            }, null, null, MS.Entertainment.Data.Query.Music.LimitedTopSongs, {acquisitionData: new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.store, Microsoft.Entertainment.Platform.AcquisitionContextType.playAll)}), String.id.IDS_MUSIC2_TOP_SONGS_GALLERY_PAGE_TITLE_TC), new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.MusicMarketplaceAutomationIds.popularTopAlbums, String.id.IDS_MUSIC2_TOP_ALBUMS_GALLERY_PAGE_TITLE, new MS.Entertainment.ViewModels.NodeValues(MS.Entertainment.Data.Query.Music.TopAlbums, {
                                                autoUpdateOnSignIn: true, acquisitionData: new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.store, Microsoft.Entertainment.Platform.AcquisitionContextType.album)
                                            }, {
                                                selectedTemplate: selectedTemplates.albums, propertyKey: "serviceId", taskKeyGetter: transferService && transferService.keyFromProperty("albumMediaId", false, true), notifier: notifiers && notifiers.trackCollection
                                            }, null), String.id.IDS_MUSIC2_TOP_ALBUMS_GALLERY_PAGE_TITLE_TC), new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.MusicMarketplaceAutomationIds.popularTopArtists, String.id.IDS_MUSIC2_TOP_ARTISTS_GALLERY_PAGE_TITLE, new MS.Entertainment.ViewModels.NodeValues(MS.Entertainment.Data.Query.Music.TopArtists, {
                                                autoUpdateOnSignIn: true, acquisitionData: new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.store, Microsoft.Entertainment.Platform.AcquisitionContextType.artist)
                                            }, {
                                                selectedTemplate: selectedTemplates.artists, propertyKey: "serviceId", taskKeyGetter: transferService && transferService.keyFromProperty("albumArtistMediaId", false, true), notifier: notifiers && notifiers.trackCollection
                                            }, null), String.id.IDS_MUSIC2_TOP_ARTISTS_GALLERY_PAGE_TITLE_TC), new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.MusicMarketplaceAutomationIds.popularTopVideos, String.id.IDS_MUSIC2_TOP_VIDEOS_GALLERY_PAGE_TITLE, new MS.Entertainment.ViewModels.NodeValues(MS.Entertainment.Data.Query.Music.LimitedTopMusicVideos, {
                                                autoUpdateOnSignIn: true, acquisitionData: new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.store, Microsoft.Entertainment.Platform.AcquisitionContextType.musicVideo)
                                            }, {
                                                selectedTemplate: selectedTemplates.musicVideos, propertyKey: "serviceId", taskKeyGetter: transferService && transferService.keyFromProperty("albumArtistMediaId", false, true), notifier: notifiers && notifiers.trackCollection
                                            }, null, null, MS.Entertainment.Data.Query.Music.LimitedTopMusicVideos, {acquisitionData: new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.store, Microsoft.Entertainment.Platform.AcquisitionContextType.playAll)}), String.id.IDS_MUSIC2_TOP_VIDEOS_GALLERY_PAGE_TITLE), ]
                                }, itemFactory: function itemFactory() {
                                        return MS.Entertainment.ViewModels.MusicMarketplace.Modifiers[MS.Entertainment.ViewModels.MusicMarketplace.ViewTypes.popular].generateItemFactory({
                                                artists: MS.Entertainment.ViewModels.MusicMarketplaceTemplates.artists, tracks: MS.Entertainment.ViewModels.MusicMarketplaceTemplates.tracks, albums: MS.Entertainment.ViewModels.MusicMarketplaceTemplates.albums, musicVideos: MS.Entertainment.ViewModels.MusicMarketplaceTemplates.musicVideos
                                            })
                                    }
                            }, popularHorizontal: {itemFactory: function itemFactory() {
                                    var userUsageDataService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.userUsageData);
                                    var isSynchronous = false;
                                    var genreList = [new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.MusicMarketplaceAutomationIds.popularAllGenres, String.id.IDS_MUSIC2_FILTER_ALL_GENRES_TC, new MS.Entertainment.ViewModels.NodeValues(null, {
                                                genreId: String.empty, subGenreId: String.empty
                                            }, null))];
                                    userUsageDataService.getMusicGenreList().done(function gotGenres(genres) {
                                        isSynchronous = true;
                                        genreList = genreList.concat(genres)
                                    });
                                    MS.Entertainment.Pages.assert(isSynchronous, "getMusicGenreList should be synchronous");
                                    return genreList
                                }}
                    }, SubPivots: {all: {itemQuery: MS.Entertainment.Data.Query.Music.SubGenres}}, SecondaryModifiers: {popularHorizontal: {
                            itemQuery: MS.Entertainment.Data.Query.Music.SubGenres, itemFactory: function itemFactory() {
                                    return [new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.MusicMarketplaceAutomationIds.defaultSubGenre, String.id.IDS_MUSIC2_FILTER_ALL_TC, new MS.Entertainment.ViewModels.NodeValues(null, {subGenreId: String.empty}))]
                                }
                        }}, Views: {
                        newReleases: MS.Entertainment.ViewModels.NodeValues.create({
                            queryOptions: {acquisitionData: new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.store, Microsoft.Entertainment.Platform.AcquisitionContextType.genre)}, modelOptions: {
                                    selectedTemplate: MS.Entertainment.ViewModels.MusicMarketplaceTemplates.albums, autoHideInvalidModifiers: true, propertyKey: "serviceId", taskKeyGetter: transferService && transferService.keyFromProperty("albumMediaId", false, true), notifier: notifiers && notifiers.trackCollection
                                }, subPivotOptions: {minItems: 2}
                        }), newReleasesHorizontal: new MS.Entertainment.ViewModels.NodeValues(null, null, {
                                autoHideInvalidModifiers: true, propertyKey: "serviceId", taskKeyGetter: transferService && transferService.keyFromProperty("albumMediaId", false, true), notifier: notifiers && notifiers.trackCollection
                            }), popular: new MS.Entertainment.ViewModels.NodeValues(null, null, {autoHideInvalidModifiers: false}, {settingsKey: "marketplace-populatar-media-type"}), popularHorizontal: new MS.Entertainment.ViewModels.NodeValues(null, null, {autoHideInvalidModifiers: false})
                    }
            })
    });
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {ArtistMarketplace: MS.Entertainment.UI.Framework.derive("MS.Entertainment.ViewModels.Music", function musicMarketplaceConstructor(view) {
            MS.Entertainment.ViewModels.Music.prototype.constructor.apply(this, arguments);
            this.modifierDescriptionFormatter = new MS.Entertainment.Formatters.MediaSortFormatter
        }, {
            _viewModelId: "artistMarketplace", _enabled: false, _resultBinds: null, artist: null, dispose: function dispose() {
                    MS.Entertainment.ViewModels.Music.prototype.dispose.call(this);
                    if (this._resultBinds) {
                        this._resultBinds.cancel();
                        this._resultBinds = null
                    }
                }, getViewDefinition: function(view) {
                    return MS.Entertainment.ViewModels.ArtistMarketplace.Views[view]
                }, getPivotDefinition: function(view) {
                    return MS.Entertainment.ViewModels.ArtistMarketplace.Pivots[view]
                }, getModifierDefinition: function(view) {
                    return MS.Entertainment.ViewModels.ArtistMarketplace.Modifiers[view]
                }, _onBeginQuery: function _onBeginQuery(query) {
                    query.id = this.artist.canonicalId;
                    query.impressionGuid = this.artist.impressionGuid;
                    var template = this.selectedTemplate;
                    this.modifierDescriptionFormatter.totalCount = 0;
                    this.modifierDescriptionFormatter.initialize(template.strings ? template.strings.countFormatStringId : null, template.strings ? template.strings.unknownCountName : null, template.strings ? template.strings.countOnly : null)
                }, _onQueryCompleted: function _onQueryCompleted(query) {
                    if (this._resultBinds) {
                        this._resultBinds.cancel();
                        this._resultBinds = null
                    }
                    if (query && query.result)
                        if (query.result.total)
                            this.modifierDescriptionFormatter.totalCount = query.result.total;
                        else if (query.result.items)
                            this._resultBinds = WinJS.Binding.bind(query.result.items, {count: function setCount(count) {
                                    this.modifierDescriptionFormatter.totalCount = count
                                }.bind(this)})
                }
        }, {
            ViewTypes: {
                artist: "artist", relatedArtists: "relatedArtists", relatedArtistsAndInfluencers: "relatedArtistsAndInfluencers", relatedMusicVideos: "relatedMusicVideos"
            }, Pivots: {artist: {itemFactory: function itemFactory() {
                            return [new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.MusicMarketplaceAutomationIds.artistDiscography, String.id.IDS_MUSIC_DISCOGRAPHY_TITLE, new MS.Entertainment.ViewModels.NodeValues(MS.Entertainment.Data.Query.Music.ArtistAlbums, {artistId: null}))]
                        }}}, Modifiers: {
                    artist: {itemFactory: function itemFactory() {
                            return [new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.MusicMarketplaceAutomationIds.artistDiscographyReleaseYearSort, String.id.IDS_MUSIC_COLLECTION_RELEASEYEAR_SORT, new MS.Entertainment.ViewModels.NodeValues(null, {orderBy: MS.Entertainment.Data.Query.convertToLegacySortIfNeeded(MS.Entertainment.Data.Query.edsSortOrder.releaseDate)})), new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.MusicMarketplaceAutomationIds.artistDiscographyPopularitySort, String.id.IDS_MUSIC_MARKETPLACE_POPULARITY_SORT, new MS.Entertainment.ViewModels.NodeValues(null, {orderBy: MS.Entertainment.Data.Query.convertToLegacySortIfNeeded(MS.Entertainment.Data.Query.edsSortOrder.mostPopular)})), ]
                        }}, relatedArtists: {itemFactory: function itemFactory() {
                                return [new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.MusicMarketplaceAutomationIds.artistRelations, String.id.IDS_MUSIC_RELATED_ARTISTS_COUNT_TEXT, new MS.Entertainment.ViewModels.NodeValues(MS.Entertainment.Data.Query.Music.RelatedArtists))]
                            }}, relatedArtistsAndInfluencers: {itemFactory: function itemFactory() {
                                return [new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.MusicMarketplaceAutomationIds.artistRelations, String.id.IDS_MUSIC_RELATED_ARTISTS_COUNT_TEXT, new MS.Entertainment.ViewModels.NodeValues(MS.Entertainment.Data.Query.Music.RelatedArtists)), new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.MusicMarketplaceAutomationIds.artistInfluencers, String.id.IDS_MUSIC_INFLUENCING_ARTISTS_COUNT_TEXT, new MS.Entertainment.ViewModels.NodeValues(MS.Entertainment.Data.Query.Music.InfluenceArtists)), ]
                            }}
                }, Views: {
                    artist: new MS.Entertainment.ViewModels.NodeValues(null, null, {selectedTemplate: MS.Entertainment.ViewModels.MusicMarketplaceTemplates.viewMoreAlbums}), relatedArtists: new MS.Entertainment.ViewModels.NodeValues(null, null, {selectedTemplate: MS.Entertainment.ViewModels.MusicMarketplaceTemplates.viewMoreRelatedArtists}), relatedArtistsAndInfluencers: new MS.Entertainment.ViewModels.NodeValues(null, null, {selectedTemplate: MS.Entertainment.ViewModels.MusicMarketplaceTemplates.viewMoreRelatedArtists})
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {MusicFlexHub: MS.Entertainment.UI.Framework.derive("MS.Entertainment.ViewModels.QueryViewModel", function musicFlexHubConstructor(view) {
            MS.Entertainment.ViewModels.QueryViewModel.prototype.constructor.apply(this, arguments);
            this.templateSelectorConstructor = MS.Entertainment.Pages.MusicFlexHubTemplateSelector;
            this.selectedTemplate = MS.Entertainment.ViewModels.MusicMarketplaceTemplates.flexHub
        }, {
            templateSelectorConstructor: null, querySuccessCallback: null, queryTitleCallback: null, queryTitle: null, getViewDefinition: function(view) {
                    return new MS.Entertainment.ViewModels.NodeValues(null, null, null)
                }, _setPageTitle: function setPageTitle(title) {
                    if (this.queryTitleCallback)
                        this.queryTitleCallback(title);
                    this.queryTitle = title
                }, _handleBeginQuery: function _handleBeginQuery(view, pivot, modifier) {
                    var currentPage = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).currentPage;
                    var flexHubQuery = new MS.Entertainment.Data.Query.FilterMusicBrowseRestrictedContentWrapperQuery(MS.Entertainment.Data.Query.BrowseDiscoveryFlexHub);
                    flexHubQuery.target = currentPage.options.query;
                    flexHubQuery.execute().done(function success(queryResult) {
                        if (queryResult) {
                            if (this.querySuccessCallback && queryResult.result && queryResult.result.items && queryResult.result.items.count > 0)
                                this.querySuccessCallback(queryResult.result.items.removeAt(0));
                            if (WinJS.Utilities.getMember("result.name", queryResult))
                                this._setPageTitle(queryResult.result.name);
                            this._setItemsFromQuery(queryResult);
                            var telemetryParameters = {
                                    title: this._view, automationId: MS.Entertainment.UI.AutomationIds.flexHubSelected, parameter: {
                                            page: flexHubQuery.target, queryId: currentPage.options.sourceQueryId
                                        }
                                };
                            MS.Entertainment.Utilities.Telemetry.logCommandClicked(telemetryParameters)
                        }
                    }.bind(this), function failure(error) {
                        this._setItems(MS.Entertainment.Data.VirtualList.wrapArray([]));
                        this._setIsFailed(true)
                    }.bind(this))
                }
        }, {ViewTypes: {flexHub: "flexHub"}})});
    WinJS.Namespace.define("MS.Entertainment.Pages", {MusicFlexHubTemplateSelector: MS.Entertainment.UI.Framework.derive("MS.Entertainment.UI.Controls.GalleryTemplateSelector", function galleryTemplateSelector(galleryView) {
            MS.Entertainment.UI.Controls.GalleryTemplateSelector.prototype.constructor.call(this);
            this._galleryView = galleryView;
            if (MS.Entertainment.Utilities.isMusicApp1) {
                this.addTemplate("marketplaceArtist", "Components/Music/MusicSharedTemplates.html#verticalMusicFlexHubItemTemplate");
                this.addTemplate("marketplaceAlbum", "Components/Music/MusicSharedTemplates.html#verticalMusicFlexHubItemTemplate")
            }
            else {
                this.addTemplate("marketplaceArtist", "Components/Music/MusicSharedTemplates.html#horizontalMusicFlexHubArtistTemplate");
                this.addTemplate("marketplaceAlbum", "Components/Music/MusicSharedTemplates.html#horizontalMusicFlexHubAlbumTemplate")
            }
        }, {
            ensureItemTemplatesLoaded: function ensureItemTemplatesLoaded() {
                return this.ensureTemplatesLoaded(["header", "marketplaceArtist", "marketplaceAlbum", "emptyGallery", ])
            }, onSelectTemplate: function onSelectTemplate(item) {
                    var template = null;
                    if (item.isHeader)
                        template = "header";
                    else {
                        var data = (item && item.data) ? item.data : {};
                        switch (data.type) {
                            case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Artist:
                                template = "marketplaceArtist";
                                break;
                            case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Album:
                                template = "marketplaceAlbum";
                                break;
                            default:
                                MS.Entertainment.Pages.fail("no template defined");
                                break
                        }
                    }
                    this.ensureTemplatesLoaded([template]);
                    return this.getTemplateProvider(template)
                }, getDetailsAction: function getDetailsAction(item) {
                    return this._getDetailsAction(item, false)
                }, _getDetailsAction: function getDetailsAction(item, forceMarketplace) {
                    var data = (item && item.data) ? item.data : {};
                    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                    this._galleryView.actionOptions = {location: MS.Entertainment.Data.ItemLocation.marketplace};
                    switch (data.mediaType) {
                        case Microsoft.Entertainment.Queries.ObjectType.person:
                            return actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.artistDetailsNavigate);
                        case Microsoft.Entertainment.Queries.ObjectType.album:
                        case Microsoft.Entertainment.Queries.ObjectType.track:
                            return actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.albumDetailsNavigate);
                        default:
                            MS.Entertainment.Pages.assert(false, "no action defined");
                            return null
                    }
                }
        })})
})()
