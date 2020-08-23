/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {
        TvHeroViewModel: MS.Entertainment.deferredDerive(MS.Entertainment.ViewModels.BaseHeroViewModel, function tvHeroViewModel(mediaItem) {
            this.base(mediaItem)
        }, {}), TvImmersiveViewModel: MS.Entertainment.defineOptionalObservable(function tvImmersiveViewModel() {
                this.frames = new MS.Entertainment.ObservableArray;
                this.setupMediaRightsMonitor();
                this.setupMediaDeleteMonitor();
                this.addMediaClassToImmersiveDetails()
            }, {
                _bookmarkedEpisode: null, _refreshEpisodePromise: null, frames: null, handleNavigationCompleteCallback: true, navigationCompleteCallback: null, _sessionMgrBindings: null, _appBarBindings: null, _mediaDeletedBindingMethod: null, _mediaRightChangedBindingMethod: null, _navigationEventHandlers: null, _mediaContext: null, _firedNavigationComplete: false, _purchaseOptions: null, mediaTypeClassName: "mediatype-tvSeries", wasDirectMediaLink: false, _shareOperation: null, viewMoreInfo: {get: function() {
                            return MS.Entertainment.Utilities.isVideoApp1 ? {
                                    icon: MS.Entertainment.UI.Icon.nowPlayingNext, title: String.load(String.id.IDS_DETAILS_VIEW_MORE)
                                } : {
                                    icon: MS.Entertainment.UI.Icon.moreActions, title: null
                                }
                        }}, clearSessionBindings: function clearSessionBindings() {
                        if (this._sessionMgrBindings) {
                            this._sessionMgrBindings.cancel();
                            this._sessionMgrBindings = null
                        }
                    }, setupMediaRightsMonitor: function setupMediaRightsMonitor() {
                        try {
                            this._mediaRightChangedBindingMethod = this._mediaRightChanged.bind(this);
                            Microsoft.Entertainment.Marketplace.Marketplace.addEventListener("mediarightchanged", this._mediaRightChangedBindingMethod)
                        }
                        catch(e) {
                            var message = (e && e.message) || e;
                            var errorCode = e && e.number;
                            MS.Entertainment.ViewModels.fail("Microsoft.Entertainment.Marketplace.Marketplace.addEventListener failed with error:" + errorCode + "; message:" + message);
                            this._mediaRightChangedBindingMethod = null
                        }
                    }, setupMediaDeleteMonitor: function setupMediaDeleteMonitor() {
                        if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.mediaDeleted)) {
                            var deleteService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.mediaDeleted);
                            this._mediaDeletedBindingMethod = MS.Entertainment.Utilities.addEventHandlers(deleteService, {mediaDeleted: this.handleDeleteMedia.bind(this)})
                        }
                    }, updateMetaData: function updateMetaData(mediaItem, deferAdditionalFrames) {
                        var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                        if (this._navigationEventHandlers) {
                            this._navigationEventHandlers.cancel();
                            this._navigationEventHandlers = null
                        }
                        var seasonHydratePromise = null;
                        var seriesHydratePromise = null;
                        var page = WinJS.Binding.unwrap(navigationService.currentPage);
                        this._navigationEventHandlers = MS.Entertainment.UI.Framework.addEventHandlers(page, {onNavigateTo: function onNavigateTo(args) {
                                var fromMoniker = WinJS.Utilities.getMember("detail.previous.iaNode.moniker", args);
                                if (fromMoniker === MS.Entertainment.UI.Monikers.fullScreenNowPlaying && !this.isLastPlayedMediaAnExtraOrError() && !this.wasDirectMediaLink)
                                    this.findNextEpisode(null, true);
                                else
                                    this.getLibraryEpisodes().done(function libraryEpisodesFound(episodes) {
                                        this.libraryEpisodes = episodes
                                    }.bind(this), function libraryEpisodesFailed(error){})
                            }.bind(this)});
                        var directMediaLink = null;
                        if (mediaItem && MS.Entertainment.Platform.PlaybackHelpers.isTVEpisode(mediaItem)) {
                            this.series = MS.Entertainment.Utilities.convertMediaItemToTvSeries(mediaItem);
                            this.episode = mediaItem;
                            directMediaLink = mediaItem
                        }
                        else if (mediaItem && MS.Entertainment.Platform.PlaybackHelpers.isTVSeason(mediaItem)) {
                            this.series = MS.Entertainment.Utilities.convertMediaItemToTvSeries(mediaItem);
                            seasonHydratePromise = mediaItem.hydrate().then(function setSeasonOnHydrated() {
                                this.setSeason(mediaItem);
                                return mediaItem
                            }.bind(this));
                            directMediaLink = mediaItem
                        }
                        else
                            this.series = mediaItem;
                        this.wasDirectMediaLink = !!directMediaLink;
                        if (this.series && this.series.refresh)
                            seriesHydratePromise = this.series.refresh().then(function seriesHydrated(mediaItem) {
                                this.series = mediaItem;
                                return WinJS.Promise.wrap(mediaItem)
                            }.bind(this), function seriesHydrateFailed(mediaItem) {
                                return WinJS.Promise.wrap(mediaItem)
                            });
                        else
                            seriesHydratePromise = WinJS.Promise.wrap(this.series);
                        var combinedPromise = WinJS.Promise.join({
                                season: seasonHydratePromise, series: seriesHydratePromise
                            }).then(function seriesHydrated(data) {
                                var series = data.series;
                                if (MS.Entertainment.Utilities.isVideoApp2) {
                                    if (series.xboxBackgroundImageUri !== series.networkBackgroundImageUri)
                                        this.backgroundImageUri = series.xboxBackgroundImageResizeUri;
                                    this.seriesSmartBuyStateEngine = new MS.Entertainment.ViewModels.VideoSmartBuyStateEngine;
                                    this.seriesSmartBuyStateEngine.initialize(this.series, MS.Entertainment.ViewModels.SmartBuyButtons.getTVSeriesDetailsButtons(this.series, MS.Entertainment.UI.Actions.ExecutionLocation.canvas, this), MS.Entertainment.ViewModels.VideoSmartBuyStateEngine.prototype.onTVSeriesDetailsStateChanged)
                                }
                                return this.findNextEpisode(directMediaLink)
                            }.bind(this), function seriesFailed() {
                                return WinJS.Promise.wrap(this.series)
                            }.bind(this));
                        this.frames = this.buildFrames(combinedPromise, deferAdditionalFrames);
                        return combinedPromise
                    }, handleDeleteMedia: function handleDeleteMedia(deletedMedia) {
                        if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.navigation)) {
                            var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                            var currentPage = WinJS.Utilities.getMember("currentPage", navigationService);
                            if (!currentPage || WinJS.Utilities.getMember("iaNode.moniker", currentPage) !== MS.Entertainment.UI.Monikers.immersiveDetails)
                                return;
                            var mediaItem = WinJS.Utilities.getMember("episode", this);
                            var deletedMediaItem = WinJS.Utilities.getMember("detail", deletedMedia);
                            if (mediaItem && mediaItem.isEqual(deletedMediaItem))
                                return this.findNextEpisode(this.season)
                        }
                    }, findNextEpisode: function findNextEpisode(directMediaLink, isBackNavigate) {
                        var libraryEpisodesPromise = WinJS.Promise.wrap();
                        var lastWatchedPromise = WinJS.Promise.wrap();
                        if (this.series) {
                            libraryEpisodesPromise = this.getLibraryEpisodes().then(function libraryEpisodesFound(episodes) {
                                this.libraryEpisodes = episodes;
                                return WinJS.Promise.wrap(episodes)
                            }.bind(this), function libraryEpisodesFailed(episodes) {
                                return WinJS.Promise.wrap(null)
                            });
                            lastWatchedPromise = this.getLastWatchedBookmark(isBackNavigate).then(function lastWatchedFound(bookmark) {
                                this._bookmarkedEpisode = bookmark;
                                return WinJS.Promise.wrap(bookmark)
                            }.bind(this), function lastWatchedFailed(bookmark) {
                                return WinJS.Promise.wrap(null)
                            })
                        }
                        return WinJS.Promise.join([libraryEpisodesPromise, lastWatchedPromise]).then(function queriesCompleted() {
                                var lastWatchedSeason = null;
                                var lastWatchedEpisode = null;
                                var lastWatchedEpisodeLibraryId = -1;
                                var lastWatchedComplete = false;
                                var minWatchedPercentage = 0.95;
                                if (!directMediaLink && !this.libraryEpisodes)
                                    if (this.series && this.series.seasons)
                                        return this.series.seasons.itemsFromIndex(0).then(function scanSeasons(seasons) {
                                                if (seasons.items && seasons.items.length > 0) {
                                                    var seasonToSet = seasons.items[seasons.items.length - 1];
                                                    if (seasonToSet && seasonToSet.data)
                                                        this.setSeason(seasonToSet.data)
                                                }
                                                return WinJS.Promise.wrap(this.season)
                                            }.bind(this));
                                if (this._bookmarkedEpisode) {
                                    lastWatchedSeason = this._bookmarkedEpisode.tvSeasonNumber;
                                    lastWatchedEpisode = this._bookmarkedEpisode.tvEpisodeNumber;
                                    lastWatchedEpisodeLibraryId = this._bookmarkedEpisode.tvEpisodeId;
                                    var lastPosition = this._bookmarkedEpisode.tvEpisodeBookmark;
                                    var duration = this._bookmarkedEpisode.tvEpisodeDuration;
                                    if (lastPosition > 0)
                                        lastWatchedComplete = ((lastPosition / duration) > minWatchedPercentage);
                                    else
                                        lastWatchedComplete = this._bookmarkedEpisode.hasPlayed
                                }
                                if ((!MS.Entertainment.UI.NetworkStatusService.isOnline() && this.libraryEpisodes) || (!this.series.seasons && this.libraryEpisodes)) {
                                    var useNextEpisode = false;
                                    var currentEpisode = null;
                                    var nextEpisode = null;
                                    return this.libraryEpisodes.itemsFromIndex(0).then(function scanLibrary(sortedLibraryEpisodes) {
                                            if (lastWatchedEpisodeLibraryId === -1 && sortedLibraryEpisodes.items.length > 0) {
                                                for (var x = 0; x < sortedLibraryEpisodes.items.length; x++)
                                                    if (sortedLibraryEpisodes.items[x].data.episodeNumber > 0 && sortedLibraryEpisodes.items[x].data.seasonNumber > 0) {
                                                        currentEpisode = sortedLibraryEpisodes.items[x].data;
                                                        break
                                                    }
                                            }
                                            else
                                                for (var x = 0; x < sortedLibraryEpisodes.items.length; x++) {
                                                    if (useNextEpisode) {
                                                        nextEpisode = sortedLibraryEpisodes.items[x].data;
                                                        break
                                                    }
                                                    if (lastWatchedEpisodeLibraryId === sortedLibraryEpisodes.items[x].data.libraryId) {
                                                        if (lastWatchedComplete)
                                                            useNextEpisode = true;
                                                        currentEpisode = sortedLibraryEpisodes.items[x].data
                                                    }
                                                }
                                            if (nextEpisode)
                                                this.setEpisode(nextEpisode);
                                            else if (currentEpisode)
                                                this.setEpisode(currentEpisode);
                                            if (this.series.librarySeasons)
                                                return this.series.librarySeasons.itemsFromIndex(0).then(function scanLibrarySeasons(sortedLibrarySeasons) {
                                                        var latestSeason = null;
                                                        var seasonToUse = null;
                                                        for (var x = 0; x < sortedLibrarySeasons.items.length; x++) {
                                                            var season = sortedLibrarySeasons.items[x].data;
                                                            latestSeason = season;
                                                            if (this.episode && this.episode.seasonNumber === season.seasonNumber) {
                                                                seasonToUse = season;
                                                                break
                                                            }
                                                        }
                                                        seasonToUse = seasonToUse || latestSeason;
                                                        this.setSeason(seasonToUse);
                                                        return WinJS.Promise.wrap(this.season)
                                                    }.bind(this))
                                        }.bind(this))
                                }
                                var scanLibraryEpisodesPromise = this.libraryEpisodes ? this.libraryEpisodes.itemsFromIndex(0) : WinJS.Promise.wrap(null);
                                return scanLibraryEpisodesPromise.then(function scanLibrary(sortedLibraryEpisodes) {
                                        var seasonHydrationPromise = WinJS.Promise.wrap();
                                        var nextEpisodeNumber = -1;
                                        var currentEpisode = null;
                                        var nextEpisode = null;
                                        if (sortedLibraryEpisodes && !this._bookmarkedEpisode) {
                                            for (var x = 0; x < sortedLibraryEpisodes.items.length; x++)
                                                if (sortedLibraryEpisodes.items[x].data.episodeNumber > 0 && sortedLibraryEpisodes.items[x].data.seasonNumber > 0) {
                                                    this.setEpisode(sortedLibraryEpisodes.items[x].data);
                                                    break
                                                }
                                        }
                                        else if (sortedLibraryEpisodes) {
                                            nextEpisodeNumber = (lastWatchedEpisode + 1);
                                            for (var x = 0; x < sortedLibraryEpisodes.items.length; x++) {
                                                if (lastWatchedEpisodeLibraryId === sortedLibraryEpisodes.items[x].data.libraryId) {
                                                    currentEpisode = sortedLibraryEpisodes.items[x].data;
                                                    useNextEpisode = true
                                                }
                                                if (useNextEpisode && lastWatchedEpisode === sortedLibraryEpisodes.items[x].data.episodeNumber && lastWatchedSeason === sortedLibraryEpisodes.items[x].data.seasonNumber && lastWatchedEpisodeLibraryId !== sortedLibraryEpisodes.items[x].data.libraryId) {
                                                    nextEpisode = sortedLibraryEpisodes.items[x].data;
                                                    break
                                                }
                                                if (nextEpisodeNumber === sortedLibraryEpisodes.items[x].data.episodeNumber && lastWatchedSeason === sortedLibraryEpisodes.items[x].data.seasonNumber) {
                                                    nextEpisode = sortedLibraryEpisodes.items[x].data;
                                                    break
                                                }
                                            }
                                            if (!lastWatchedComplete && currentEpisode)
                                                this.setEpisode(currentEpisode);
                                            else if (lastWatchedComplete && nextEpisode)
                                                this.setEpisode(nextEpisode);
                                            else if (lastWatchedComplete && this.series && this.series.seasons) {
                                                var jumpToNextSeason = false;
                                                this.series.seasons.itemsFromIndex(0).then(function scanSeasons(seasons) {
                                                    for (var x = 0; x < seasons.items.length; x++) {
                                                        var currentSeason = seasons.items[x].data;
                                                        if (jumpToNextSeason) {
                                                            nextEpisodeNumber = 1;
                                                            seasonHydrationPromise = currentSeason.hydrate();
                                                            break
                                                        }
                                                        else if (lastWatchedSeason === currentSeason.seasonNumber)
                                                            if (lastWatchedEpisode === currentSeason.latestEpisode) {
                                                                jumpToNextSeason = true;
                                                                seasonHydrationPromise = currentSeason.hydrate()
                                                            }
                                                            else if (nextEpisodeNumber <= currentSeason.latestEpisode) {
                                                                seasonHydrationPromise = currentSeason.hydrate();
                                                                break
                                                            }
                                                    }
                                                }.bind(this))
                                            }
                                        }
                                        return seasonHydrationPromise.then(function seasonHydrated(season) {
                                                if (season && season.episodes)
                                                    season.episodes.itemsFromIndex(0).then(function scanEpisodes(episodes) {
                                                        for (var x = 0; x < episodes.items.length; x++)
                                                            if (nextEpisodeNumber === episodes.items[x].data.episodeNumber) {
                                                                this.setEpisode(episodes.items[x].data);
                                                                break
                                                            }
                                                        if (!this.episode)
                                                            this.setEpisode(currentEpisode)
                                                    }.bind(this));
                                                var seasons = null;
                                                if (this.series)
                                                    seasons = this.series.seasons || this.series.librarySeasons;
                                                if (seasons)
                                                    return seasons.itemsFromIndex(0).then(function scanSeasons(seasons) {
                                                            if (directMediaLink)
                                                                for (var x = 0; x < seasons.items.length; x++)
                                                                    if (directMediaLink.seasonNumber === seasons.items[x].data.seasonNumber) {
                                                                        this.setSeason(seasons.items[x].data);
                                                                        return WinJS.Promise.wrap(this.season)
                                                                    }
                                                            for (var x = 0; x < seasons.items.length; x++)
                                                                if (this.episode && this.episode.seasonNumber === seasons.items[x].data.seasonNumber) {
                                                                    this.setSeason(seasons.items[x].data);
                                                                    return WinJS.Promise.wrap(this.season)
                                                                }
                                                            if (seasons.items.length > 0) {
                                                                this.setSeason(seasons.items[seasons.items.length - 1].data);
                                                                return WinJS.Promise.wrap(this.season)
                                                            }
                                                        }.bind(this))
                                            }.bind(this));
                                        return WinJS.Promise.wrap(this.season)
                                    }.bind(this), function failed() {
                                        return WinJS.Promise.wrap(this.season)
                                    })
                            }.bind(this))
                    }, isLastPlayedMediaAnExtraOrError: function isLastPlayedMediaAnExtraOrError() {
                        var isExtraOrError = false;
                        var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                        var playbackSession = sessionMgr.primarySession;
                        if (playbackSession && (playbackSession.errorDescriptor || (playbackSession.lastPlayedMedia && (playbackSession.lastPlayedMedia.seasonNumber === 0 || playbackSession.lastPlayedMedia.episodeNumber === 0))))
                            isExtraOrError = true;
                        return isExtraOrError
                    }, removeOtherMediaClasses: function removeOtherMediaClasses(clearAll) {
                        var immersiveDetailsElement = document.querySelector(".immersiveDetails");
                        for (var type in MS.Entertainment.UI.Controls.VideoHeroMediaTypes) {
                            var typeClass = MS.Entertainment.UI.Controls.VideoHeroMediaTypes[type];
                            if (typeClass && (clearAll || typeClass !== this.mediaTypeClassName))
                                if (immersiveDetailsElement && typeClass && WinJS.Utilities.hasClass(immersiveDetailsElement, typeClass))
                                    WinJS.Utilities.removeClass(immersiveDetailsElement, typeClass)
                        }
                    }, addMediaClassToImmersiveDetails: function addMediaClassToImmersiveDetails() {
                        var immersiveDetailsElement = document.querySelector(".immersiveDetails");
                        if (immersiveDetailsElement && this.mediaTypeClassName && !WinJS.Utilities.hasClass(immersiveDetailsElement, this.mediaTypeClassName)) {
                            this.removeOtherMediaClasses();
                            WinJS.Utilities.addClass(immersiveDetailsElement, this.mediaTypeClassName)
                        }
                    }, buildFrames: function buildFrames(mediaHydratePromise, deferAdditionalFrames) {
                        var heroControl = MS.Entertainment.UI.Controls.ImmersiveTvHero;
                        var frames = new MS.Entertainment.ObservableArray([function makeHeroFrame() {
                                    var frame = MS.Entertainment.UI.Controls.Immersive.makeFrame(String.load(String.id.IDS_DETAILS_OVERVIEW), 2, heroControl);
                                    frame.columnStyle = "firstImmersiveTwoColumn";
                                    frame.getData = function frameGetData() {
                                        return mediaHydratePromise.then(function mediaHydrateComplete(value) {
                                                var dataContext = new MS.Entertainment.ViewModels.TvHeroViewModel(this.series);
                                                dataContext.tvImmersiveViewModel = this;
                                                dataContext.mediaItem = this.series;
                                                dataContext.selectedItem = this.season;
                                                dataContext.episode = this.episode;
                                                dataContext.season = this.season;
                                                dataContext.series = this.series;
                                                return WinJS.Promise.wrap(dataContext)
                                            }.bind(this))
                                    }.bind(this);
                                    return frame
                                }.bind(this)()]);
                        this.clearSessionBindings();
                        if (deferAdditionalFrames) {
                            var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                            var completePromise = function completePromise(newValue) {
                                    if (newValue === MS.Entertainment.Platform.Playback.TransportState.playing || newValue === MS.Entertainment.Platform.Playback.PlayerState.error) {
                                        WinJS.Promise.timeout().then(function _delayed() {
                                            this.loadAdditionalFrames(mediaHydratePromise)
                                        }.bind(this));
                                        this.clearSessionBindings()
                                    }
                                }.bind(this);
                            this._sessionMgrBindings = WinJS.Binding.bind(sessionMgr.primarySession, {
                                currentTransportState: completePromise, playerState: completePromise
                            })
                        }
                        else
                            WinJS.Promise.timeout().then(function _delayed() {
                                this.loadAdditionalFrames(mediaHydratePromise)
                            }.bind(this));
                        return frames
                    }, loadAdditionalFrames: function loadAdditionalFrames(mediaHydratePromise) {
                        var heroVisibleSignal = new MS.Entertainment.UI.Framework.Signal;
                        var overviewVisibleSignal = new MS.Entertainment.UI.Framework.Signal;
                        var episodesVisibleSignal = new MS.Entertainment.UI.Framework.Signal;
                        var extrasVisibleSignal = new MS.Entertainment.UI.Framework.Signal;
                        var previousVisibleSignal = heroVisibleSignal;
                        function makeOverviewFrame(previousSignal, visibleSignal) {
                            var frame = MS.Entertainment.UI.Controls.Immersive.makeFrame(" ", 1, MS.Entertainment.UI.Controls.TvImmersiveOverviewSummary, "/Components/Immersive/Video/MoreVideoOverview.html");
                            frame.hideViewMoreIfEnoughSpace = true;
                            frame.columnStyle = "tvOverviewFrame";
                            frame.viewMoreColumnStyle = "tvOverviewViewMore";
                            var viewMoreInfo = this.viewMoreInfo;
                            if (MS.Entertainment.Utilities.isVideoApp2) {
                                viewMoreInfo.voicePhrase = String.load(String.id.IDS_VIDEO2_TV_MORE_DESCRIPTION_BUTTON_VUI_ALM);
                                viewMoreInfo.voicePhoneticPhrase = String.load(String.id.IDS_VIDEO2_TV_MORE_DESCRIPTION_BUTTON_VUI_PRON);
                                viewMoreInfo.voiceConfidence = String.load(String.id.IDS_VIDEO2_TV_MORE_DESCRIPTION_BUTTON_VUI_CONF)
                            }
                            frame.viewMoreInfo = viewMoreInfo;
                            frame.viewMoreHeading = String.load(String.id.IDS_NOW_PLAYING_DETAILS_BUTTON);
                            frame.visibleSignal = visibleSignal;
                            frame.getData = function frameGetData() {
                                frame.viewMoreSubHeading = MS.Entertainment.Utilities.isVideoApp2 ? this.secondaryText : null;
                                return WinJS.Promise.wrap({
                                        series: this.series, season: this.season, episode: this.episode, mediaItem: (this.season && this.season.episode) ? this.season.episode : this.season, tvImmersiveViewModel: this, previousSignal: previousSignal, visibleSignal: visibleSignal
                                    })
                            }.bind(this);
                            return frame
                        }
                        {};
                        function makeErrorFrame(error, headerText) {
                            var frame = MS.Entertainment.UI.Controls.Immersive.makeFrame(headerText, 1, MS.Entertainment.UI.Controls.BaseImmersiveSummary);
                            frame.hideViewMoreIfEnoughSpace = true;
                            frame.getData = function frameGetData() {
                                return WinJS.Promise.wrapError(error)
                            };
                            return frame
                        }
                        {};
                        heroVisibleSignal.complete();
                        mediaHydratePromise.then(function beginLoadingOverview(value) {
                            if (MS.Entertainment.UI.NetworkStatusService.isOnline() || this.libraryEpisodes) {
                                this.frames.push(makeOverviewFrame.call(this, previousVisibleSignal, overviewVisibleSignal));
                                previousVisibleSignal = overviewVisibleSignal
                            }
                            return WinJS.Promise.wrap()
                        }.bind(this)).then(function addEpisodesPanel() {
                            return previousVisibleSignal.promise.then(function _delay() {
                                    this.loadEpisodesFrame(previousVisibleSignal, episodesVisibleSignal).then(function loadEpisodesFrameComplete(episodesFrame) {
                                        if (episodesFrame) {
                                            this.frames.push(episodesFrame);
                                            previousVisibleSignal = episodesVisibleSignal
                                        }
                                        return WinJS.Promise.wrap()
                                    }.bind(this))
                                }.bind(this))
                        }.bind(this)).then(function addExtrasPanel() {
                            return previousVisibleSignal.promise.then(function _delay() {
                                    this.loadExtrasFrame(previousVisibleSignal, extrasVisibleSignal).then(function loadExtrasFrameComplete(extrasFrame) {
                                        if (extrasFrame) {
                                            this.frames.push(extrasFrame);
                                            previousVisibleSignal = extrasVisibleSignal
                                        }
                                        return WinJS.Promise.wrap()
                                    }.bind(this))
                                }.bind(this))
                        }.bind(this))
                    }, loadEpisodesFrame: function loadEpisodesFrame(previousSignal, visibleSignal) {
                        var frame = MS.Entertainment.UI.Controls.Immersive.makeFrame(String.load(String.id.IDS_DETAILS_EPISODES_LABEL_LC), 1, MS.Entertainment.UI.Controls.EpisodeList, "/Components/Immersive/Video/EpisodesMore.html", null, MS.Entertainment.Utilities.isVideoApp2);
                        frame.hideViewMoreIfEnoughSpace = true;
                        frame.columnStyle = "tvEpisodesFrame";
                        frame.viewMoreColumnStyle = "tvEpisodesViewMore";
                        var viewMoreInfo = this.viewMoreInfo;
                        if (MS.Entertainment.Utilities.isVideoApp2) {
                            viewMoreInfo.voicePhrase = String.load(String.id.IDS_VIDEO2_TV_MORE_EPISODES_BUTTON_VUI_ALM);
                            viewMoreInfo.voicePhoneticPhrase = String.load(String.id.IDS_VIDEO2_TV_MORE_EPISODES_BUTTON_VUI_PRON);
                            viewMoreInfo.voiceConfidence = String.load(String.id.IDS_VIDEO2_TV_MORE_EPISODES_BUTTON_VUI_CONF)
                        }
                        frame.viewMoreInfo = viewMoreInfo;
                        frame.visibleSignal = visibleSignal;
                        frame.getData = function frameGetData() {
                            var dataContext = {};
                            dataContext.frame = frame;
                            dataContext.tvImmersiveViewModel = this;
                            dataContext.maxItems = MS.Entertainment.Utilities.isVideoApp1 ? 0 : 5;
                            dataContext.previousSignal = previousSignal;
                            dataContext.visibleSignal = visibleSignal;
                            frame.viewMoreSubHeading = MS.Entertainment.Utilities.isVideoApp2 ? this.secondaryText : null;
                            return WinJS.Promise.wrap(dataContext)
                        }.bind(this);
                        return WinJS.Promise.wrap(frame)
                    }, loadExtrasFrame: function loadExtrasFrame(previousSignal, visibleSignal) {
                        var frame = MS.Entertainment.UI.Controls.Immersive.makeFrame(String.load(String.id.IDS_DETAILS_EXTRA_EPISODE_LABEL_LC), 1, MS.Entertainment.UI.Controls.ExtrasList, "/Components/Immersive/Video/ExtrasMore.html", null, MS.Entertainment.Utilities.isVideoApp2);
                        frame.hideViewMoreIfEnoughSpace = true;
                        frame.columnStyle = "tvEpisodesFrame";
                        frame.viewMoreColumnStyle = "tvEpisodesViewMore";
                        var viewMoreInfo = this.viewMoreInfo;
                        if (MS.Entertainment.Utilities.isVideoApp2) {
                            viewMoreInfo.voicePhrase = String.load(String.id.IDS_VIDEO2_TV_MORE_EXTRAS_BUTTON_VUI_ALM);
                            viewMoreInfo.voicePhoneticPhrase = String.load(String.id.IDS_VIDEO2_TV_MORE_EXTRAS_BUTTON_VUI_PRON);
                            viewMoreInfo.voiceConfidence = String.load(String.id.IDS_VIDEO2_TV_MORE_EXTRAS_BUTTON_VUI_CONF)
                        }
                        frame.viewMoreInfo = viewMoreInfo;
                        frame.visibleSignal = visibleSignal;
                        frame.getData = function frameGetData() {
                            var dataContext = {};
                            dataContext.frame = frame;
                            dataContext.tvImmersiveViewModel = this;
                            dataContext.maxItems = MS.Entertainment.Utilities.isVideoApp1 ? 0 : 5;
                            dataContext.previousSignal = previousSignal;
                            dataContext.visibleSignal = visibleSignal;
                            frame.viewMoreSubHeading = MS.Entertainment.Utilities.isVideoApp2 ? this.secondaryText : null;
                            return WinJS.Promise.wrap(dataContext)
                        }.bind(this);
                        return WinJS.Promise.wrap(frame)
                    }, _mediaRightChanged: function _mediaRightChanged(serviceMediaId) {
                        if (this._unloaded)
                            return;
                        MS.Entertainment.ViewModels.SmartBuyStateEngine.mediaContainsServiceMediaIdAsync(this.season, serviceMediaId).done(function mediaContainsServiceMediaIdAsync_complete(containsServiceId) {
                            if (containsServiceId && this.season.seasonNumber) {
                                if (this._refreshEpisodePromise) {
                                    this._refreshEpisodePromise.cancel();
                                    this._refreshEpisodePromise = null
                                }
                                this._refreshEpisodePromise = WinJS.Promise.timeout(1000).done(function refreshNextEpisode() {
                                    return this.findNextEpisode(this.season)
                                }.bind(this))
                            }
                        }.bind(this))
                    }, getLibraryEpisodes: function getLibraryEpisodes() {
                        if (!this.series)
                            return WinJS.Promise.wrap(null);
                        return MS.Entertainment.ViewModels.MediaItemModel.hydrateLibraryInfoAsync(this.series).then(function hydratedLibraryInfo() {
                                if (!this.series || this.series.libraryId === -1)
                                    return WinJS.Promise.wrap(null);
                                var query = new MS.Entertainment.Data.Query.libraryVideoTV;
                                query.seriesId = this.series.libraryId;
                                query.sort = Microsoft.Entertainment.Queries.VideosSortBy.seriesTitleSeasonNumberEpisodeNumber;
                                query.isLive = false;
                                query.chunkSize = 1000;
                                return query.execute().then(function queryComplete(q) {
                                        if (q && q.result && q.result.items)
                                            return WinJS.Promise.wrap(q.result.items)
                                    }.bind(this), function queryFailed(q) {
                                        return WinJS.Promise.wrap(null)
                                    })
                            }.bind(this))
                    }, getLastWatchedBookmark: function getLastWatchedBookmark(isBackNavigate) {
                        if (!this.series || this.series.libraryId === undefined || this.series.libraryId === -1)
                            return WinJS.Promise.wrap(null);
                        var queryDelay = isBackNavigate ? 1000 : 0;
                        var findSeriesZuneIdPromise = WinJS.Promise.wrap(this.series.zuneId);
                        if (!this.series.hasZuneId && this.series.librarySeasons)
                            findSeriesZuneIdPromise = this.series.librarySeasons.itemsFromIndex(0).then(function scanLibrarySeasons(sortedLibrarySeasons) {
                                for (var x = 0; x < sortedLibrarySeasons.items.length; x++)
                                    if (!MS.Entertainment.Utilities.isEmptyGuid(sortedLibrarySeasons.items[x].data.seriesZuneId))
                                        return WinJS.Promise.wrap(sortedLibrarySeasons.items[x].data.seriesZuneId)
                            }.bind(this));
                        return WinJS.Promise.timeout(queryDelay).then(function waitDelay() {
                                return findSeriesZuneIdPromise.then(function foundZuneId(zuneId) {
                                        if (MS.Entertainment.Utilities.isEmptyGuid(zuneId))
                                            return WinJS.Promise.wrap(null);
                                        var ms = new Microsoft.Entertainment.Platform.MediaStore;
                                        return ms.videoProvider.getLastWatchedEpisodeForSeriesAsync(zuneId).then(function checkBookmark(bookmark) {
                                                if (bookmark && bookmark.tvEpisodeId >= 0)
                                                    return WinJS.Promise.wrap(bookmark);
                                                else
                                                    return WinJS.Promise.wrap(null)
                                            }, function bookmarkNotFound(bookmark) {
                                                return WinJS.Promise.wrap(null)
                                            })
                                    })
                            }.bind(this))
                    }, updateAppBar: function updateAppBar(newValue, oldValue) {
                        var combinedAppBarActions = [];
                        if (this.season && this.seasonSmartBuyStateEngine && this.seasonSmartBuyStateEngine.currentAppbarActions)
                            combinedAppBarActions = combinedAppBarActions.concat(this.seasonSmartBuyStateEngine.currentAppbarActions);
                        if (this.season && this.season.episode && this.episodeSmartBuyStateEngine && this.episodeSmartBuyStateEngine.currentAppbarActions)
                            combinedAppBarActions = combinedAppBarActions.concat(this.episodeSmartBuyStateEngine.currentAppbarActions);
                        if (this._mediaContext)
                            this._mediaContext.setToolbarActions(combinedAppBarActions);
                        if (!this._firedNavigationComplete) {
                            if (this.navigationCompleteCallback)
                                this.navigationCompleteCallback(true);
                            this._firedNavigationComplete = true
                        }
                    }, setupAppBarBindings: function setupAppBarBindings() {
                        if (this._appBarBindings)
                            this._appBarBindings.cancel();
                        if (this.episodeSmartBuyStateEngine)
                            this._appBarBindings = WinJS.Binding.bind(this.episodeSmartBuyStateEngine, {currentAppbarActions: this.updateAppBar.bind(this)});
                        if (this.seasonSmartBuyStateEngine)
                            this._appBarBindings = WinJS.Binding.bind(this.seasonSmartBuyStateEngine, {currentAppbarActions: this.updateAppBar.bind(this)})
                    }, dispose: function dispose() {
                        this.clearSessionBindings();
                        this.removeOtherMediaClasses(true);
                        if (this._appBarBindings) {
                            this._appBarBindings.cancel();
                            this._appBarBindings = null
                        }
                        if (this._navigationEventHandlers) {
                            this._navigationEventHandlers.cancel();
                            this._navigationEventHandlers = null
                        }
                        if (this._mediaRightChangedBindingMethod) {
                            Microsoft.Entertainment.Marketplace.Marketplace.removeEventListener("mediarightchanged", this._mediaRightChangedBindingMethod);
                            this._mediaRightChangedBindingMethod = null
                        }
                        if (this._mediaDeletedBindingMethod) {
                            this._mediaDeletedBindingMethod.cancel();
                            this._mediaDeletedBindingMethod = null
                        }
                        if (this._mediaContext) {
                            this._mediaContext.clearContext();
                            this._mediaContext = null
                        }
                        if (this.episodeSmartBuyStateEngine) {
                            this.episodeSmartBuyStateEngine.unload();
                            this.episodeSmartBuyStateEngine = null
                        }
                        if (this.seasonSmartBuyStateEngine) {
                            this.seasonSmartBuyStateEngine.unload();
                            this.seasonSmartBuyStateEngine = null
                        }
                        if (this.seriesSmartBuyStateEngine) {
                            this.seriesSmartBuyStateEngine.unload();
                            this.seriesSmartBuyStateEngine = null
                        }
                    }, freeze: function tvImmersiveViewModel_freeze() {
                        if (this._mediaContext) {
                            this._mediaContext.clearContext();
                            this._mediaContext = null
                        }
                        this.removeOtherMediaClasses(true)
                    }, thaw: function tvImmersiveViewModel_thaw() {
                        this.addMediaClassToImmersiveDetails();
                        var appBarService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appToolbar);
                        this._mediaContext = appBarService.pushMediaContext(this.season, null, null, {executeLocation: MS.Entertainment.UI.Actions.ExecutionLocation.canvas});
                        this.updateAppBar()
                    }, setEpisode: function setEpisode(episode) {
                        if (!this.episode || !this.episode.isEqual(episode)) {
                            this.episode = episode;
                            if (this.season && (!this.season.episode || !this.season.episode.isEqual(episode)))
                                this.season.episode = (this.episode && this.season.seasonNumber === this.episode.seasonNumber) ? this.episode : null;
                            if (this.episode)
                                if (!this.episode.contentNotifications)
                                    MS.Entertainment.Utilities.BindingAgnostic.setProperty(this.episode, "contentNotifications", new MS.Entertainment.UI.ContentNotification.ObservableNotificationArray);
                                else
                                    this.episode.contentNotifications.clear();
                            if (this.episodeSmartBuyStateEngine) {
                                this.episodeSmartBuyStateEngine.unload();
                                this.episodeSmartBuyStateEngine = null
                            }
                            var hydratePromise = WinJS.Promise.wrap();
                            if (this.season && this.season.episode && this.season.episode.hydrate)
                                hydratePromise = this.season.episode.hydrate();
                            hydratePromise.done(function hydratedEpisode() {
                                this.episodeSmartBuyStateEngine = new MS.Entertainment.ViewModels.VideoSmartBuyStateEngine;
                                this.episodeSmartBuyStateEngine.purchaseOptions = this._getPurchaseOptions();
                                var episodeButtons = MS.Entertainment.ViewModels.SmartBuyButtons.getWatchNextEpisodeButtons(this.episode, MS.Entertainment.UI.Actions.ExecutionLocation.canvas);
                                this.episodeSmartBuyStateEngine.initialize(this.episode, episodeButtons, MS.Entertainment.ViewModels.VideoSmartBuyStateEngine.prototype.onWatchNextStateChanged);
                                this.setupAppBarBindings()
                            }.bind(this))
                        }
                    }, _getPurchaseOptions: function _getPurchaseOptions() {
                        if (!this._purchaseOptions)
                            this._purchaseOptions = new MS.Entertainment.ViewModels.PurchaseOptions;
                        return this._purchaseOptions
                    }, _shareMediaItem: function _shareMediaItem(mediaItem) {
                        var sender = MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.shareSender) && MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.shareSender);
                        if (sender) {
                            if (this._shareOperation) {
                                this._shareOperation.cancel();
                                this._shareOperation = null
                            }
                            this._shareOperation = sender.pendingShare(mediaItem)
                        }
                    }, setSeason: function setSeason(season) {
                        if (!season || season.mediaType !== Microsoft.Entertainment.Queries.ObjectType.tvSeason)
                            return;
                        if (!this.season || (season && !season.isEqual(this.season))) {
                            this.primaryText = season.seriesTitle || String.empty;
                            this.secondaryText = MS.Entertainment.Formatters.formatTVSeasonNumberInt(season.seasonNumber, true) || String.empty;
                            this.season = season;
                            this.season.addProperty("episode", null);
                            this.season.seriesLibraryId = this.series.libraryId;
                            if (this._mediaContext) {
                                this._mediaContext.clearContext();
                                this._mediaContext = null
                            }
                            var appBarService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appToolbar);
                            if (!this.season)
                                this._mediaContext = appBarService.pushDefaultContext([]);
                            else
                                this._mediaContext = appBarService.pushMediaContext(this.season, null, null, {executeLocation: MS.Entertainment.UI.Actions.ExecutionLocation.canvas});
                            if (this.season)
                                if (!this.season.contentNotifications)
                                    MS.Entertainment.Utilities.BindingAgnostic.setProperty(this.season, "contentNotifications", new MS.Entertainment.UI.ContentNotification.ObservableNotificationArray);
                                else
                                    this.season.contentNotifications.clear();
                            if (this.seasonSmartBuyStateEngine) {
                                this.seasonSmartBuyStateEngine.unload();
                                this.seasonSmartBuyStateEngine = null
                            }
                            this.seasonSmartBuyStateEngine = new MS.Entertainment.ViewModels.VideoSmartBuyStateEngine;
                            this.seasonSmartBuyStateEngine.purchaseOptions = this._getPurchaseOptions();
                            var seasonButtons = MS.Entertainment.ViewModels.SmartBuyButtons.getTVDetailsButtons(this.season, MS.Entertainment.UI.Actions.ExecutionLocation.canvas);
                            var onStateInfoRetrieved = function onStateInfoRetrieved(stateInfo) {
                                    return MS.Entertainment.ViewModels.VideoSmartBuyStateEngine.prototype.onSeasonDetailsStateChanged.apply(this.seasonSmartBuyStateEngine, arguments).then(function onSeasonDetailsStateChanged(buttonState) {
                                            if (this.seasonStateInfoCallback)
                                                this.seasonStateInfoCallback(stateInfo);
                                            this.seasonStateInfo = stateInfo;
                                            return buttonState
                                        }.bind(this))
                                }.bind(this);
                            this.seasonSmartBuyStateEngine.initialize(this.season, seasonButtons, onStateInfoRetrieved);
                            this.setupAppBarBindings();
                            this._shareMediaItem(this.season);
                            var subTitleElement = document.querySelector(MS.Entertainment.UI.Controls.ImmersiveTvHero.cssSelectors.immersiveSecondaryText);
                            if (subTitleElement)
                                WinJS.UI.Animation.fadeIn(subTitleElement)
                        }
                        if (this.season && (!this.season.episode || !this.season.episode.isEqual(this.episode)))
                            this.season.episode = (this.episode && this.season.seasonNumber === this.episode.seasonNumber) ? this.episode : null
                    }
            }, {
                series: null, episode: null, season: null, primaryText: String.empty, secondaryText: String.empty, backgroundImageUri: String.empty, episodeSmartBuyStateEngine: null, seasonSmartBuyStateEngine: null, seasonStateInfoCallback: null, seasonStateInfo: null, seriesSmartBuyStateEngine: null, libraryEpisodes: null
            }, {Monikers: {
                    promoted: "promoted", seasons: "seasons", activities: "activities"
                }})
    })
})()
