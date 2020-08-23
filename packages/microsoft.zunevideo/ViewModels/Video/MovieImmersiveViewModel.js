/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {
        MovieImmersiveViewModel: MS.Entertainment.UI.Framework.define(function movieImmersiveViewModel() {
            this.frames = new MS.Entertainment.ObservableArray;
            this.addMediaClassToImmersiveDetails()
        }, {
            frames: null, createOverviewFrame: false, _mediaDeletedBindingMethod: null, _sessionMgrBindings: null, _relatedViewModel: null, _activitiesViewModel: null, _criticReviewViewModel: null, _mediaItem: null, primaryText: String.empty, secondaryText: String.empty, backgroundImageUri: String.empty, mediaTypeClassName: "mediatype-movie", dispose: function dispose() {
                    this.clearSessionBindings();
                    if (this._mediaDeletedBindingMethod) {
                        this._mediaDeletedBindingMethod.cancel();
                        this._mediaDeletedBindingMethod = null
                    }
                    this.removeOtherMediaClasses(true)
                }, freeze: function movieImmersiveViewModel_freeze() {
                    this.removeOtherMediaClasses(true)
                }, thaw: function movieImmersiveViewModel_thaw() {
                    this.addMediaClassToImmersiveDetails()
                }, viewMoreInfo: {get: function() {
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
                }, setupMediaDeleteMonitor: function setupMediaDeleteMonitor() {
                    if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.mediaDeleted)) {
                        var deleteService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.mediaDeleted);
                        this._mediaDeletedBindingMethod = MS.Entertainment.Utilities.addEventHandlers(deleteService, {mediaDeleted: this.handleDeleteMedia.bind(this)})
                    }
                }, handleDeleteMedia: function handleDeleteMedia(deletedMedia) {
                    if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.navigation)) {
                        var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                        var currentPage = WinJS.Utilities.getMember("currentPage", navigationService);
                        if (!currentPage || WinJS.Utilities.getMember("iaNode.moniker", currentPage) !== MS.Entertainment.UI.Monikers.immersiveDetails)
                            return;
                        var mediaItem = WinJS.Utilities.getMember("_mediaItem", this);
                        var pageMediaItem = WinJS.Utilities.getMember("options.mediaItem", currentPage);
                        var deletedMediaItem = WinJS.Utilities.getMember("detail", deletedMedia);
                        if (mediaItem && mediaItem.isEqual(pageMediaItem) && pageMediaItem.isEqual(deletedMediaItem))
                            navigationService.navigateBack()
                    }
                }, updateMetaData: function updateMetaData(mediaItem, deferAdditionalFrames) {
                    MS.Entertainment.ViewModels.assert(!deferAdditionalFrames, "Calling MovieImmersiveViewModel with deferAdditionalFrames = true is not supported anymore");
                    this._mediaItem = mediaItem;
                    var hydratePromise;
                    if (mediaItem.refresh) {
                        this.createOverviewFrame = true;
                        hydratePromise = mediaItem.refresh({listenForDBUpdates: true}).then(function mediaHydrated() {
                            this._mediaItem = mediaItem;
                            return mediaItem
                        }.bind(this), function mediaHydrateFailed() {
                            return mediaItem
                        }.bind(this))
                    }
                    else
                        hydratePromise = WinJS.Promise.wrap(mediaItem);
                    this.frames = this.buildFrames(hydratePromise, deferAdditionalFrames);
                    hydratePromise.then(function mediaHydrateComplete(value) {
                        if (this._mediaItem && this._mediaItem.name) {
                            this.primaryText = this._mediaItem.name;
                            this.secondaryText = String.load(String.id.IDS_MOVIE_HERO_HEADING);
                            if (MS.Entertainment.Utilities.isVideoApp2)
                                if (this._mediaItem.xboxBackgroundImageUri !== this._mediaItem.studioBackgroundImageUri)
                                    this.backgroundImageUri = this._mediaItem.xboxBackgroundImageResizeUri;
                            return WinJS.Promise.timeout(500)
                        }
                    }.bind(this)).done(function delayFadeInSecondaryText() {
                        var subTitleElement = document.querySelector(MS.Entertainment.UI.Controls.ImmersiveVideoHero.cssSelectors.immersiveSecondaryText);
                        if (subTitleElement)
                            WinJS.UI.Animation.fadeIn(subTitleElement)
                    });
                    return hydratePromise
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
                    var heroControl = MS.Entertainment.UI.Controls.ImmersiveMovieHero;
                    var frames = new MS.Entertainment.ObservableArray([function makeHeroFrame() {
                                var frame = MS.Entertainment.UI.Controls.Immersive.makeFrame(String.empty, 2, heroControl);
                                frame.columnStyle = "firstImmersiveTwoColumn";
                                frame.getData = function frameGetData() {
                                    return mediaHydratePromise.then(function mediaHydrateComplete(value) {
                                            var dataContext = new MS.Entertainment.ViewModels.MovieHeroViewModel(value);
                                            return WinJS.Promise.wrap(dataContext)
                                        }.bind(this))
                                }.bind(this);
                                return frame
                            }.bind(this)()]);
                    this.clearSessionBindings();
                    this.setupMediaDeleteMonitor();
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
                    var criticVisibleSignal = new MS.Entertainment.UI.Framework.Signal;
                    var castAndCrewVisibleSignal = new MS.Entertainment.UI.Framework.Signal;
                    var relatedVisibleSignal = new MS.Entertainment.UI.Framework.Signal;
                    var previousVisibleSignal = heroVisibleSignal;
                    mediaHydratePromise.then(function beginLoadingOverviewFrame(value) {
                        heroVisibleSignal.complete();
                        return this.loadOverviewFrame(value, previousVisibleSignal, overviewVisibleSignal)
                    }.bind(this)).then(function addOverviewFrame(overviewFrame) {
                        if (overviewFrame) {
                            this.frames.push(overviewFrame);
                            previousVisibleSignal = overviewVisibleSignal
                        }
                        return WinJS.Promise.wrap()
                    }.bind(this)).then(function beginLoadingCriticReviewFrame() {
                        return previousVisibleSignal.promise.then(function _delay() {
                                return this.loadCriticReviewFrame(this._mediaItem, previousVisibleSignal, criticVisibleSignal).then(function addCriticReviewFrame(criticReviewFrame) {
                                        if (criticReviewFrame) {
                                            this.frames.push(criticReviewFrame);
                                            previousVisibleSignal = criticVisibleSignal
                                        }
                                        return WinJS.Promise.wrap()
                                    }.bind(this))
                            }.bind(this))
                    }.bind(this)).then(function beginLoadingCastAndCrewFrame() {
                        return previousVisibleSignal.promise.then(function _delay() {
                                return MS.Entertainment.UI.Controls.CastAndCrewList.makeCastAndCrewFrame(this._mediaItem, previousVisibleSignal, castAndCrewVisibleSignal).then(function addCastAndCrewFrame(castAndCrewFrame) {
                                        if (castAndCrewFrame) {
                                            var viewMoreInfo = this.viewMoreInfo;
                                            if (MS.Entertainment.Utilities.isVideoApp2) {
                                                viewMoreInfo.voicePhrase = String.load(String.id.IDS_VIDEO2_L3_MOVIES_MORE_CAST_BUTTON_VUI_ALM);
                                                viewMoreInfo.voicePhoneticPhrase = String.load(String.id.IDS_VIDEO2_L3_MOVIES_MORE_CAST_BUTTON_VUI_PRON);
                                                viewMoreInfo.voiceConfidence = String.load(String.id.IDS_VIDEO2_L3_MOVIES_MORE_CAST_BUTTON_VUI_CONF)
                                            }
                                            castAndCrewFrame.viewMoreInfo = viewMoreInfo;
                                            this.frames.push(castAndCrewFrame);
                                            previousVisibleSignal = castAndCrewVisibleSignal
                                        }
                                        return WinJS.Promise.wrap()
                                    }.bind(this))
                            }.bind(this))
                    }.bind(this)).then(function addRelatedFrame() {
                        return WinJS.Promise.timeout().then(function _delay() {
                                return this.loadRelatedFrame(previousVisibleSignal, relatedVisibleSignal).then(function addRelatedFrame(relatedFrame) {
                                        if (relatedFrame)
                                            this.frames.push(relatedFrame);
                                        return WinJS.Promise.wrap()
                                    }.bind(this))
                            }.bind(this))
                    }.bind(this))
                }, loadOverviewFrame: function loadOverviewFrame(mediaItem, previousSignal, visibleSignal) {
                    if (this.createOverviewFrame) {
                        var frame = MS.Entertainment.UI.Controls.Immersive.makeFrame(" ", 1, MS.Entertainment.UI.Controls.MovieImmersiveOverviewSummary, "/Components/Immersive/Video/MoreVideoOverview.html");
                        frame.hideViewMoreIfEnoughSpace = true;
                        frame.columnStyle = "movieOverviewFrame";
                        frame.viewMoreColumnStyle = "movieOverviewViewMore";
                        var viewMoreInfo = this.viewMoreInfo;
                        if (MS.Entertainment.Utilities.isVideoApp2) {
                            viewMoreInfo.voicePhrase = String.load(String.id.IDS_VIDEO2_L3_MOVIES_MORE_DESCRIPTION_BUTTON_VUI_ALM);
                            viewMoreInfo.voicePhoneticPhrase = String.load(String.id.IDS_VIDEO2_L3_MOVIES_MORE_DESCRIPTION_BUTTON_VUI_PRON);
                            viewMoreInfo.voiceConfidence = String.load(String.id.IDS_VIDEO2_L3_MOVIES_MORE_DESCRIPTION_BUTTON_VUI_CONF)
                        }
                        frame.viewMoreInfo = viewMoreInfo;
                        frame.viewMoreHeading = String.load(String.id.IDS_NOW_PLAYING_DETAILS_BUTTON);
                        frame.visibleSignal = visibleSignal;
                        frame.getData = function frameGetData() {
                            return WinJS.Promise.wrap({
                                    mediaItem: mediaItem, expirationString: null, showButtons: true, previousSignal: previousSignal, visibleSignal: visibleSignal
                                })
                        }.bind(this);
                        return WinJS.Promise.wrap(frame)
                    }
                    else
                        return WinJS.Promise.wrap()
                }, loadCriticReviewFrame: function loadCriticReviewFrame(mediaItem, previousSignal, visibleSignal) {
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    var rottenTomatoesEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.rottenTomatoes);
                    if (!MS.Entertainment.UI.NetworkStatusService.isOnline() || !rottenTomatoesEnabled || !mediaItem || !mediaItem.criticReview || isNaN(mediaItem.criticReview.reviewScore) || mediaItem.criticReview.reviewScore <= 0)
                        return WinJS.Promise.wrap();
                    if (!this._criticReviewViewModel) {
                        this._criticReviewViewModel = new MS.Entertainment.ViewModels.CriticReviewViewModel(mediaItem);
                        this._criticReviewViewModel.previousSignal = previousSignal;
                        this._criticReviewViewModel.visibleSignal = visibleSignal
                    }
                    var frame = MS.Entertainment.UI.Controls.Immersive.makeFrame("rotten tomatoes\u00AE", 1, MS.Entertainment.UI.Controls.RottenTomatoesImmersivePanel, "/Components/Immersive/Video/CriticReviewMore.html", MS.Entertainment.ViewModels.MovieImmersiveViewModel.Monikers.reviews, MS.Entertainment.Utilities.isVideoApp2);
                    frame.hideViewMoreIfEnoughSpace = this._criticReviewViewModel.maxItems === 0 || this._criticReviewViewModel.fullCriticReviewList.length <= this._criticReviewViewModel.maxItems;
                    frame.columnStyle = "movieCriticReviewFrame";
                    frame.viewMoreColumnStyle = "movieCriticReviewViewMore";
                    var viewMoreInfo = this.viewMoreInfo;
                    if (MS.Entertainment.Utilities.isVideoApp2) {
                        viewMoreInfo.voicePhrase = String.load(String.id.IDS_VIDEO2_L3_MOVIES_MORE_REVIEWS_BUTTON_VUI_ALM);
                        viewMoreInfo.voicePhoneticPhrase = String.load(String.id.IDS_VIDEO2_L3_MOVIES_MORE_REVIEWS_BUTTON_VUI_PRON);
                        viewMoreInfo.voiceConfidence = String.load(String.id.IDS_VIDEO2_L3_MOVIES_MORE_REVIEWS_BUTTON_VUI_CONF)
                    }
                    frame.viewMoreInfo = viewMoreInfo;
                    frame.visibleSignal = visibleSignal;
                    frame.getData = function criticGetData() {
                        this._criticReviewViewModel.frame = frame;
                        return WinJS.Promise.wrap(this._criticReviewViewModel)
                    }.bind(this);
                    return WinJS.Promise.wrap(frame)
                }, loadRelatedFrame: function loadRelatedFrame(previousSignal, visibleSignal) {
                    if (!this._mediaItem || !MS.Entertainment.UI.NetworkStatusService.isOnline())
                        return WinJS.Promise.wrap();
                    if (!this._relatedViewModel) {
                        this._relatedViewModel = new MS.Entertainment.ViewModels.MovieRelatedViewModel(this._mediaItem);
                        this._relatedViewModel.previousSignal = previousSignal;
                        this._relatedViewModel.visibleSignal = visibleSignal
                    }
                    return this._relatedViewModel.getItems().then(function relatedSuccess(relatedItems) {
                            if (relatedItems && relatedItems.length) {
                                var frame = MS.Entertainment.UI.Controls.Immersive.makeFrame(String.load(String.id.IDS_DETAILS_VIDEO_HUB_RELATED), 2, MS.Entertainment.UI.Controls.ImmersiveRelatedGridItems, null, null, MS.Entertainment.Utilities.isVideoApp2);
                                frame.hideViewMoreIfEnoughSpace = true;
                                frame.columnStyle = "movieRelatedFrame";
                                frame.visibleSignal = visibleSignal;
                                frame.getData = function relatedGetData() {
                                    return WinJS.Promise.wrap(this._relatedViewModel)
                                }.bind(this);
                                return frame
                            }
                        }.bind(this), function relatedError(e) {
                            return WinJS.Promise.wrap()
                        }.bind(this))
                }
        }, {Monikers: {
                overview: "overview", activities: "activities", related: "related", cast: "cast", reviews: "reviews"
            }}), MovieHeroViewModel: MS.Entertainment.deferredDerive(MS.Entertainment.ViewModels.BaseHeroViewModel, function movieHeroViewModel(mediaItem) {
                this.base(mediaItem);
                this._initialize()
            }, {_initialize: function _initialize() {
                    if (this.buttons)
                        this.buttons.clear();
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    var trailerEnabled = false;
                    trailerEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.movieTrailersMarketplace) && ((this.mediaItem.hasCanonicalId && this.mediaItem.videoPreviewUrl) || (this.mediaItem.hasServiceId && MS.Entertainment.ViewModels.SmartBuyStateHandlers._mediaHasAnyRight(this.mediaItem, MS.Entertainment.Utilities.defaultClientTypeFromApp, [MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.Preview, MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.PreviewStream])));
                    if (trailerEnabled) {
                        var buttons = MS.Entertainment.ViewModels.SmartBuyButtons.getVideoImmersiveDetailsHeroButtons(this.mediaItem);
                        this.actionDescription = String.load(String.id.IDS_DETAILS_FEATURED_TRAILER_TITLE);
                        this._addButtons(buttons)
                    }
                }}), MovieRelatedViewModel: MS.Entertainment.deferredDerive(MS.Entertainment.ViewModels.BaseImmersiveListViewModel, function relatedMoviesViewModelConstructor(mediaItem) {
                this.base();
                MS.Entertainment.ViewModels.assert(mediaItem, "MoviesRelatedViewModel requires a mediaItem");
                if (!mediaItem)
                    throw new Error("MoviesRelatedViewModel requires a mediaItem");
                this._mediaItem = mediaItem;
                this._queryWatcher = new MS.Entertainment.Framework.QueryWatcher("relatedMovies");
                this.columnSpan = 1;
                this._heroAugmentation = MS.Entertainment.ViewModels.MovieRelatedViewModel.HeroAugmentation;
                this.selectedTemplate = MS.Entertainment.ViewModels.MovieRelatedViewModel.GridTemplate;
                this.maxItems = 10;
                if (MS.Entertainment.Utilities.isVideoApp1) {
                    var screenHeight = MS.Entertainment.Utilities.getWindowHeight();
                    if (screenHeight <= 900) {
                        this.selectedTemplate.itemTemplates[0].template = "/Components/Video/VideoMarketplaceTemplates.html#movieRelatedGridItemSmallTemplate";
                        this.selectedTemplate.itemSize = MS.Entertainment.Utilities.relatedMovieGridItemSizeSmall
                    }
                    else {
                        this.selectedTemplate.itemTemplates[0].template = "/Components/Video/VideoMarketplaceTemplates.html#movieRelatedGridItemTemplate";
                        this.selectedTemplate.itemSize = MS.Entertainment.Utilities.relatedMovieGridItemSize
                    }
                }
                else {
                    this.selectedTemplate.itemTemplates[0].template = "/Components/Video/VideoMarketplaceTemplates2.html#movieRelatedGridItemTemplate";
                    this.selectedTemplate.itemSize = MS.Entertainment.Utilities.relatedMovieGridItemSize2
                }
            }, {
                _mediaItem: null, _queryWatcher: null, items: null, fullItemList: null, maxItems: -1, visibleSignal: null, previousSignal: null, getItems: function getItems() {
                        if (this.items)
                            return WinJS.Promise.wrap(this.items);
                        return this._beginQuery()
                    }, _beginQuery: function _beginQuery() {
                        var relatedQuery = new MS.Entertainment.Data.Query.Video.EdsMovieRelatedItems;
                        relatedQuery.serviceId = this._mediaItem.canonicalId;
                        relatedQuery.impressionGuid = this._mediaItem.impressionGuid;
                        relatedQuery.relevancyTrackingContent = this._mediaItem.relevancyTrackingContent;
                        this._queryWatcher.registerQuery(relatedQuery);
                        return relatedQuery.execute().then(function relatedSuccess(q) {
                                if (q.result.items)
                                    return q.result.items.toArray().then(function(data) {
                                            this._setItems(data);
                                            this.fullItemList = {items: data};
                                            this.fullItemList.getItems = this.getItems.bind(this.fullItemList);
                                            return this.items
                                        }.bind(this));
                                else
                                    return null
                            }.bind(this), function relatedFailure(e){}.bind(this))
                    }
            }, {
                HeroAugmentation: MS.Entertainment.Data.define(null, {heroLabel: MS.Entertainment.Data.Property.convertNoDeflate("releaseDate", MS.Entertainment.Data.Factory.year, null)}), GridTemplate: {
                        fixedColumnCount: null, fixedRowCount: 2, rowLayout: true, itemSize: MS.Entertainment.Utilities.relatedMovieGridItemSize, itemTemplates: [{
                                    value: Microsoft.Entertainment.Queries.VideoType.movie, template: "/Components/Video/VideoMarketplaceTemplates.html#movieRelatedGridItemTemplate"
                                }], propertyName: ['videoType', 'mediaType'], className: "relatedMoviesGrid"
                    }
            }), CastAndCrewViewModel: MS.Entertainment.deferredDerive(MS.Entertainment.ViewModels.BaseImmersiveListViewModel, function castAndCrewConstructor(mediaItem) {
                this.base();
                this.columnSpan = 1;
                this.maxItems = MS.Entertainment.Utilities.isApp2 ? 7 : 0;
                MS.Entertainment.ViewModels.assert(mediaItem, "CastAndCrewViewModel requires a mediaItem");
                if (!mediaItem)
                    throw new Error("CastAndCrewViewModel requires a mediaItem");
                this._mediaItem = mediaItem;
                this.selectedTemplate = MS.Entertainment.ViewModels.CastAndCrewViewModel.DefaultTemplate;
                this._setItems(mediaItem.contributors)
            }, {
                fullItemList: null, visibleSignal: null, previousSignal: null, _setItems: function _setItems(items) {
                        this.items = this.maxItems ? items.slice(0, this.maxItems) : items;
                        this.fullItemList = items
                    }
            }, {DefaultTemplate: {
                    templateUrl: "/Components/Video/VideoMarketplaceTemplates.html#castAndCrewTemplate", panelOptions: {location: MS.Entertainment.Pages.BaseMediaInlineDetails.Location.marketplace}, className: "castAndCrew"
                }}), CriticReviewViewModel: MS.Entertainment.defineObservable(function criticReviewConstructor(mediaItem) {
                MS.Entertainment.ViewModels.assert(mediaItem, "CriticReviewModel requires a mediaItem");
                if (!mediaItem)
                    throw new Error("CriticReviewViewModel requires a mediaItem");
                this.mediaItem = mediaItem;
                if (mediaItem && mediaItem.criticReview && mediaItem.criticReview.criticReviews) {
                    this.maxItems = MS.Entertainment.Utilities.isApp2 ? 1 : 0;
                    this._setItems(mediaItem.criticReview.criticReviews)
                }
            }, {
                maxItems: 0, mediaItem: null, fullCriticReviewList: null, criticReviews: null, visibleSignal: null, previousSignal: null, _setItems: function _setItems(items) {
                        if (items) {
                            var filteredItems = items.filter(function filterIncompleteReviews(review) {
                                    return (review && review.criticName && review.publication && review.scoreDescription && review.scoreDescription !== "none")
                                });
                            this.criticReviews = this.maxItems ? filteredItems.slice(0, this.maxItems) : filteredItems;
                            this.fullCriticReviewList = filteredItems
                        }
                    }
            })
    })
})()
