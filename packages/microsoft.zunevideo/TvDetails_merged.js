/* Copyright (C) Microsoft Corporation. All rights reserved. */
/* >>>>>>/viewmodels/video_win/episodesmodule.js:2 */
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
        (function(ViewModels) {
            var EpisodesModule = (function(_super) {
                    __extends(EpisodesModule, _super);
                    function EpisodesModule(_model) {
                        _super.call(this, "episodes");
                        this._model = _model;
                        Trace.assert(this._model, "Invalid TV Details model")
                    }
                    EpisodesModule.prototype.getItems = function() {
                        if (!this._getItemsPromise)
                            var items = (this._model.episodes || []).concat(this._model.extrasForSeason || []).concat(this._model.extrasForSeries || []).map(function(item) {
                                    return {
                                            actionId: Entertainment.UI.Actions.ActionIdentifiers.navigateToVideoDetails, actionParameter: {data: item}, mediaItem: item
                                        }
                                });
                        this._getItemsPromise = WinJS.Promise.as({items: items});
                        return this._getItemsPromise
                    };
                    return EpisodesModule
                })(ViewModels.ModuleBase);
            ViewModels.EpisodesModule = EpisodesModule
        })(Entertainment.ViewModels || (Entertainment.ViewModels = {}));
        var ViewModels = Entertainment.ViewModels
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/video_win/seriesseasonsmodule.js:45 */
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
        (function(ViewModels) {
            var SeriesSeasonsModule = (function(_super) {
                    __extends(SeriesSeasonsModule, _super);
                    function SeriesSeasonsModule(_model, _viewModel) {
                        _super.call(this, "seasons");
                        this._model = _model;
                        this._viewModel = _viewModel;
                        Trace.assert(this._model, "Invalid TV Details model")
                    }
                    SeriesSeasonsModule.prototype._createHeaderAction = function() {
                        return null
                    };
                    SeriesSeasonsModule.prototype.getItems = function() {
                        var _this = this;
                        if (!this._getItemsPromise)
                            this._getItemsPromise = Entertainment.Utilities.schedulePromiseNormal().then(function() {
                                var seasons = (_this._model && _this._model.seasons) || [];
                                seasons = seasons.sort(function(itemA, itemB) {
                                    return itemB.seasonNumber - itemA.seasonNumber
                                });
                                var items = seasons.map(function(season) {
                                        return {
                                                actionId: Entertainment.UI.Actions.ActionIdentifiers.changeTvSeason, actionParameter: {
                                                        data: season, model: _this._model
                                                    }, mediaItem: season
                                            }
                                    });
                                return {items: items}
                            });
                        return this._getItemsPromise
                    };
                    return SeriesSeasonsModule
                })(ViewModels.ModuleBase);
            ViewModels.SeriesSeasonsModule = SeriesSeasonsModule
        })(Entertainment.ViewModels || (Entertainment.ViewModels = {}));
        var ViewModels = Entertainment.ViewModels
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/video_win/tvdetailsviewmodel.js:101 */
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
        (function(ViewModels) {
            (function(TvDetailsModuleKeys) {
                TvDetailsModuleKeys[TvDetailsModuleKeys["episodesModule"] = 0] = "episodesModule";
                TvDetailsModuleKeys[TvDetailsModuleKeys["seriesSeasonsModule"] = 1] = "seriesSeasonsModule"
            })(ViewModels.TvDetailsModuleKeys || (ViewModels.TvDetailsModuleKeys = {}));
            var TvDetailsModuleKeys = ViewModels.TvDetailsModuleKeys;
            var TvDetailsViewModel = (function(_super) {
                    __extends(TvDetailsViewModel, _super);
                    function TvDetailsViewModel(model, initialPreferences) {
                        this._model = model;
                        this._primaryHeaderButtons = new Entertainment.ObservableArray;
                        this._secondaryHeaderButtons = new Entertainment.ObservableArray;
                        this._refreshHeaderButtons = this._refreshHeaderButtons.bind(this);
                        _super.call(this, initialPreferences)
                    }
                    TvDetailsViewModel.create = function(mediaItem, initialPreferences) {
                        if (!mediaItem || !Entertainment.Utilities.isAnyTV(mediaItem)) {
                            Trace.fail("Could not create TvDetailsViewModel");
                            return null
                        }
                        var tvDetailsModel = new Entertainment.Components.Video.TvDetailsModel;
                        tvDetailsModel.start(mediaItem);
                        return new TvDetailsViewModel(tvDetailsModel, initialPreferences)
                    };
                    TvDetailsViewModel.prototype._hydrateMedia = function() {
                        var _this = this;
                        return this._model.start().then(function() {
                                Trace.assert(_this._model, "TvDetailsViewModel::_hydrateMedia(): Expected TV model to be populated");
                                var season = _this._model.season;
                                var series = _this._model.series;
                                Trace.assert(season, "TvDetailsViewModel::_hydrateMedia(): Invalid season provided!");
                                Trace.assert(Entertainment.Platform.PlaybackHelpers.isTVSeason(season), "TvDetailsViewModel::_hydrateMedia(): Invalid season provided!");
                                Trace.assert(series, "TvDetailsViewModel::_hydrateMedia(): Invalid series provided!");
                                Trace.assert(Entertainment.Platform.PlaybackHelpers.isTVSeries(series), "TvDetailsViewModel::_hydrateMedia(): Invalid series provided!");
                                _this.mediaItem = season;
                                _this.season = season;
                                _this.series = series
                            })
                    };
                    TvDetailsViewModel.prototype._initializeFromMedia = function() {
                        var _this = this;
                        this._viewModelBindings = new Array;
                        this._viewModelBindings.push(WinJS.Binding.bind(this._model, {updating: function() {
                                return _this.refreshContent()
                            }}))
                    };
                    TvDetailsViewModel.prototype._initializeModules = function() {
                        this.modules = [new ViewModels.EpisodesModule(this._model), new ViewModels.SeriesSeasonsModule(this._model, this)]
                    };
                    TvDetailsViewModel.prototype._onMediaItemDeletion = function(deletionEvent) {
                        this.refreshContent();
                        this.refreshEpisodeList()
                    };
                    TvDetailsViewModel.prototype.delayInitialize = function() {
                        var _this = this;
                        var navigationService = Entertainment.ServiceLocator.getService(Entertainment.Services.navigation);
                        var page = WinJS.Binding.unwrap(navigationService.currentPage);
                        this._viewModelBindings.push(Entertainment.UI.Framework.addEventHandlers(page, {onNavigateTo: function(args) {
                                if (navigationService.navigationDirection === Entertainment.Navigation.NavigationDirection.backward)
                                    _this._findNextPromotedEpisode(_this.season)
                            }}));
                        try {
                            this._viewModelBindings.push(MS.Entertainment.Utilities.addEventHandlers(Microsoft.Entertainment.Marketplace.Marketplace, {mediarightchanged: this._mediaRightChanged.bind(this)}))
                        }
                        catch(e) {
                            var message = (e && e.message) || e;
                            var errorCode = e && e.number;
                            ViewModels.fail("Microsoft.Entertainment.Marketplace.Marketplace.addEventListener failed with error:" + errorCode + "; message:" + message)
                        }
                        _super.prototype.delayInitialize.call(this)
                    };
                    Object.defineProperty(TvDetailsViewModel.prototype, "title", {
                        get: function() {
                            return this._title
                        }, set: function(value) {
                                this.updateAndNotify("title", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(TvDetailsViewModel.prototype, "subTitle", {
                        get: function() {
                            return this._subTitle
                        }, set: function(value) {
                                this.updateAndNotify("subTitle", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(TvDetailsViewModel.prototype, "description", {
                        get: function() {
                            return this._description
                        }, set: function(value) {
                                this.updateAndNotify("description", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(TvDetailsViewModel.prototype, "episode", {
                        get: function() {
                            return this._episode
                        }, enumerable: true, configurable: true
                    });
                    TvDetailsViewModel.prototype.refreshEpisodeList = function() {
                        if (this.episodes)
                            this.episodes.reload()
                    };
                    TvDetailsViewModel.prototype.refreshContent = function() {
                        if (this._model && !this._model.updating) {
                            var updatedSeason = (this._model && this._model.season) ? this._model.season : null;
                            this.season = updatedSeason;
                            this.refreshPromotedEpisode()
                        }
                    };
                    TvDetailsViewModel.prototype.refreshPromotedEpisode = function() {
                        var _this = this;
                        var updatedEpisode = (this._model && this._model.seasonHasPromotedEpisode) ? this._model.episode : null;
                        this.updateAndNotify("episode", updatedEpisode);
                        this._disposeEpisodeSmartBuyStateEngine();
                        this._onButtonsChanged();
                        if (this.episode) {
                            this._episodeSmartBuyStateEngine = new ViewModels.VideoSmartBuyStateEngine;
                            this._episodeSmartBuyStateEngine.purchaseOptions = this.purchaseOptions;
                            this._episodeSmartBuyStateEngineBinding = WinJS.Binding.bind(this._episodeSmartBuyStateEngine, {
                                currentAppbarActions: function() {
                                    return _this._onAppbarActionsChanged()
                                }, currentButtons: function() {
                                        return _this._onButtonsChanged()
                                    }
                            });
                            var episodeButtons = ViewModels.SmartBuyButtons.getWatchNextEpisodeButtons(this.episode, Entertainment.UI.Actions.ExecutionLocation.canvas);
                            this._episodeSmartBuyStateEngine.initialize(this.episode, episodeButtons, ViewModels.VideoSmartBuyStateEngine.prototype.onWatchNextStateChanged)
                        }
                        this._refreshDetailString()
                    };
                    Object.defineProperty(TvDetailsViewModel.prototype, "episodes", {
                        get: function() {
                            return this.modules && this.modules[0]
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(TvDetailsViewModel.prototype, "seasons", {
                        get: function() {
                            return this.modules && this.modules[1]
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(TvDetailsViewModel.prototype, "season", {
                        get: function() {
                            return this._season
                        }, set: function(value) {
                                if (value && !value.isEqual(this.season)) {
                                    this.updateAndNotify("season", value);
                                    this._mediaItemHydratePromise = this.season ? this.season.hydrate() : WinJS.Promise.as(null);
                                    this._disposeSmartBuyStateEngine();
                                    if (this.purchaseOptions)
                                        this.purchaseOptions = new ViewModels.PurchaseOptions(this.purchaseOptions.selectedDefinition, this.purchaseOptions.selectedLanguageCode);
                                    this._createSmartBuyStateEngine();
                                    this._initializeSmartBuyStateEngine(false);
                                    this.refreshEpisodeList()
                                }
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(TvDetailsViewModel.prototype, "series", {
                        get: function() {
                            return this._series
                        }, set: function(value) {
                                this.updateAndNotify("series", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(TvDetailsViewModel.prototype, "episodePrimaryHeaderButtons", {
                        get: function() {
                            return this._episodePrimaryHeaderButtons
                        }, set: function(value) {
                                this._updateButtonList("_episodePrimaryHeaderButtons", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(TvDetailsViewModel.prototype, "episodeSecondaryHeaderButtons", {
                        get: function() {
                            return this._episodeSecondaryHeaderButtons
                        }, set: function(value) {
                                this._updateButtonList("_episodeSecondaryHeaderButtons", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(TvDetailsViewModel.prototype, "seasonPrimaryHeaderButtons", {
                        get: function() {
                            return this._seasonPrimaryHeaderButtons
                        }, set: function(value) {
                                this._updateButtonList("_seasonPrimaryHeaderButtons", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(TvDetailsViewModel.prototype, "seasonSecondaryHeaderButtons", {
                        get: function() {
                            return this._seasonSecondaryHeaderButtons
                        }, set: function(value) {
                                this._updateButtonList("_seasonSecondaryHeaderButtons", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(TvDetailsViewModel.prototype, "primaryHeaderButtons", {
                        get: function() {
                            return this._primaryHeaderButtons
                        }, set: function(value) {
                                this._primaryHeaderButtons = value
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(TvDetailsViewModel.prototype, "secondaryHeaderButtons", {
                        get: function() {
                            return this._secondaryHeaderButtons
                        }, set: function(value) {
                                this._secondaryHeaderButtons = value
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(TvDetailsViewModel.prototype, "seasonName", {
                        get: function() {
                            return this._seasonName
                        }, set: function(value) {
                                this.updateAndNotify("seasonName", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(TvDetailsViewModel.prototype, "episodeCount", {
                        get: function() {
                            return this._episodeCount
                        }, set: function(value) {
                                this.updateAndNotify("episodeCount", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(TvDetailsViewModel.prototype, "network", {
                        get: function() {
                            return this._network
                        }, set: function(value) {
                                this.updateAndNotify("network", value)
                            }, enumerable: true, configurable: true
                    });
                    TvDetailsViewModel.prototype.dispose = function() {
                        this._disposeEpisodeSmartBuyStateEngine();
                        if (this._viewModelBindings) {
                            this._viewModelBindings.forEach(function(binding) {
                                return binding.cancel()
                            });
                            this._viewModelBindings = null
                        }
                        if (this._model) {
                            this._model.dispose();
                            this._model = null
                        }
                        _super.prototype.dispose.call(this)
                    };
                    TvDetailsViewModel.prototype._disposeSmartBuyStateEngine = function() {
                        _super.prototype._disposeSmartBuyStateEngine.call(this)
                    };
                    TvDetailsViewModel.prototype._getSmartBuyEngineButtons = function() {
                        return ViewModels.SmartBuyButtons.getTVDetailsButtons(this.mediaItem, Entertainment.UI.Actions.ExecutionLocation.canvas, {includeDownloadButtons: true})
                    };
                    TvDetailsViewModel.prototype._getSmartBuyEngineEventHandler = function() {
                        var _this = this;
                        return function(engine, stateInfo) {
                                var getStatePromise;
                                if (_this._smartBuyStateEngine)
                                    getStatePromise = _this._smartBuyStateEngine.onSeasonDetailsStateChanged(stateInfo).then(function(buttonState) {
                                        _this._refreshPurchaseDetailsString(stateInfo);
                                        return buttonState
                                    });
                                return WinJS.Promise.as(getStatePromise)
                            }
                    };
                    TvDetailsViewModel.prototype._refreshDetailString = function() {
                        if (!this.season || !this.series)
                            return;
                        _super.prototype._refreshDetailsStrings.call(this);
                        var episode = this.episode;
                        var season = this.season;
                        var series = this.series;
                        if (season.seasonNumber > -1)
                            this.seasonName = Entertainment.Formatters.formatTVSeasonNumberInt(season.seasonNumber, false) || String.empty;
                        var count = 0;
                        if (this._model.episodes)
                            count = this._model.episodes.length;
                        if (count >= 0)
                            this.episodeCount = Entertainment.Utilities.Pluralization.getPluralizedString(String.id.IDS_TV_EPISODES_LABEL_PLURAL, count).format(count);
                        this.network = season.networks ? Entertainment.Formatters.formatGenresListNonConverter(season.networks) : String.empty;
                        if (episode && episode.seasonNumber === season.seasonNumber) {
                            this.title = String.load(String.id.IDS_VIDEO_LX_DETAILS_HEADER_EPISODE_TITLE).format(episode.episodeNumber, episode.name);
                            this.subTitle = String.load(String.id.IDS_VIDEO_LX_DETAILS_HEADER_SERIES_SEASON_SUBTITLE).format(series.name, season.name);
                            this.description = episode.description
                        }
                        else {
                            this.title = series.name;
                            this.subTitle = season.name;
                            this.description = season.description
                        }
                    };
                    TvDetailsViewModel.prototype._refreshPurchaseDetailsString = function(stateInfo) {
                        var season = this.season;
                        if (!season)
                            return;
                        var purchaseDetails = String.empty;
                        if (!season.isComplete) {
                            var entireSeasonIsOwned = stateInfo.marketplace.hasPurchasedSeason;
                            if (!entireSeasonIsOwned) {
                                var bestFreeRight = ViewModels.VideoSmartBuyStateEngine.getBestFreeSeasonRight(season);
                                var seasonPassOffer = ViewModels.VideoSmartBuyStateEngine.getDefaultSeasonBuyOffer(season, Entertainment.Data.Augmenter.Marketplace.videoDefinition.hd, String.empty);
                                if (!!seasonPassOffer && !bestFreeRight)
                                    purchaseDetails = String.load(String.id.IDS_VIDEO_SEASON_PASS_EXPLANATION)
                            }
                        }
                        this.mediaItemPurchaseDetails = purchaseDetails
                    };
                    TvDetailsViewModel.prototype._getMediaItemForProviderDetails = function() {
                        return (this.season && this.season.firstEpisode)
                    };
                    TvDetailsViewModel.prototype._reloadFilteredModules = function(){};
                    TvDetailsViewModel.prototype._updateFilterDetails = function(){};
                    TvDetailsViewModel.prototype._onButtonsChanged = function() {
                        if (this.disposed)
                            return;
                        if (this._episodeSmartBuyStateEngine) {
                            this.episodePrimaryHeaderButtons = this._episodeSmartBuyStateEngine.getCurrentButtonsForLocation(ViewModels.TvDetailsActionLocations.primaryHeader);
                            this.episodeSecondaryHeaderButtons = this._episodeSmartBuyStateEngine.getCurrentButtonsForLocation(ViewModels.TvDetailsActionLocations.secondaryHeader)
                        }
                        if (this._smartBuyStateEngine) {
                            this.seasonPrimaryHeaderButtons = this._smartBuyStateEngine.getCurrentButtonsForLocation(ViewModels.TvDetailsActionLocations.primaryHeader);
                            this.seasonSecondaryHeaderButtons = this._smartBuyStateEngine.getCurrentButtonsForLocation(ViewModels.TvDetailsActionLocations.secondaryHeader)
                        }
                        this._refreshHeaderButtons()
                    };
                    TvDetailsViewModel.prototype._updateButtonList = function(oldButtonListName, newButtonList) {
                        this._clearHeaderButtonChangeListener(this[oldButtonListName]);
                        this[oldButtonListName] = newButtonList;
                        this._addHeaderButtonChangeListener(newButtonList)
                    };
                    TvDetailsViewModel.prototype._addHeaderButtonChangeListener = function(buttonList) {
                        if (buttonList)
                            buttonList.addChangeListener(this._refreshHeaderButtons)
                    };
                    TvDetailsViewModel.prototype._clearHeaderButtonChangeListener = function(buttonList) {
                        if (buttonList)
                            buttonList.removeChangeListener(this._refreshHeaderButtons)
                    };
                    TvDetailsViewModel.prototype._disposeEpisodeSmartBuyStateEngine = function() {
                        this._clearHeaderButtonChangeListener(this.episodePrimaryHeaderButtons);
                        this._clearHeaderButtonChangeListener(this.episodeSecondaryHeaderButtons);
                        if (this._episodeSmartBuyStateEngineBinding) {
                            this._episodeSmartBuyStateEngineBinding.cancel();
                            this._episodeSmartBuyStateEngineBinding = null
                        }
                        if (this._episodeSmartBuyStateEngine) {
                            this._episodeSmartBuyStateEngine.unload();
                            this._episodeSmartBuyStateEngine = null
                        }
                    };
                    TvDetailsViewModel.prototype._findNextPromotedEpisode = function(selectedSeason) {
                        var _this = this;
                        if (!this._model)
                            return;
                        if (this._findNextPromotedEpisodePromise) {
                            this._findNextPromotedEpisodePromise.cancel();
                            this._findNextPromotedEpisodePromise = null
                        }
                        this._findNextPromotedEpisodePromise = WinJS.Promise.timeout(1000).then(function() {
                            return _this._model.findNextEpisode(selectedSeason)
                        })
                    };
                    TvDetailsViewModel.prototype._mediaRightChanged = function(serviceMediaId) {
                        var _this = this;
                        if (this.disposed)
                            return;
                        ViewModels.SmartBuyStateEngine.mediaContainsServiceMediaIdAsync(this.season, serviceMediaId).done(function(containsServiceId) {
                            return (containsServiceId && _this.season.seasonNumber && _this._findNextPromotedEpisode(_this.season))
                        })
                    };
                    TvDetailsViewModel.prototype._refreshHeaderButtons = function() {
                        var _this = this;
                        this.primaryHeaderButtons.clear();
                        this.secondaryHeaderButtons.clear();
                        if (this._episodeSmartBuyStateEngine) {
                            if (this.episodePrimaryHeaderButtons)
                                this.episodePrimaryHeaderButtons.forEach(function(button) {
                                    return _this.primaryHeaderButtons.push(button)
                                });
                            if (this.episodeSecondaryHeaderButtons)
                                this.episodeSecondaryHeaderButtons.forEach(function(button) {
                                    return _this.secondaryHeaderButtons.push(button)
                                })
                        }
                        if (this._smartBuyStateEngine) {
                            if (this.seasonPrimaryHeaderButtons)
                                this.seasonPrimaryHeaderButtons.forEach(function(button) {
                                    return _this.primaryHeaderButtons.push(button)
                                });
                            if (!this._episodeSmartBuyStateEngine && this.seasonSecondaryHeaderButtons)
                                this.seasonSecondaryHeaderButtons.forEach(function(button) {
                                    return _this.secondaryHeaderButtons.push(button)
                                })
                        }
                    };
                    return TvDetailsViewModel
                })(ViewModels.VideoDetailsViewModelBase);
            ViewModels.TvDetailsViewModel = TvDetailsViewModel
        })(Entertainment.ViewModels || (Entertainment.ViewModels = {}));
        var ViewModels = Entertainment.ViewModels
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
})();
/* >>>>>>/components/video/metacriticreview.js:513 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";

    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels.Video");
    var config = new Microsoft.Entertainment.Configuration.ConfigurationManager;
    MS.Entertainment.ViewModels.Video.assert(MS.Entertainment.appMode !== undefined, "File was loaded in startup path, this make slow down perf since we are creating a config object");
    WinJS.Namespace.define("MS.Entertainment.ViewModels.Video", {metaCriticTemplate: MS.Entertainment.Utilities.isVideoApp1 ? "/Components/Video_win/TVDetails.html#metaCriticTemplate" : "/Components/Video2/TvDetailsPage.html#metaCriticTemplate"});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {MetaCriticControl: MS.Entertainment.UI.Framework.defineUserControl(MS.Entertainment.ViewModels.Video.metaCriticTemplate, function MetaCriticControl(element) {
            this.clickHandlerWithContext = WinJS.Utilities.markSupportedForProcessing(this._onClick.bind(this))
        }, {
            controlName: "MetaCriticControl", allowAnimations: false, voicePhrase: "metacritic", clickHandlerWithContext: null, _metaCriticScoreDomElement: null, _mediaItemBindings: null, initialize: function initialize() {
                    this._mediaItemBindings = WinJS.Binding.bind(this, {mediaItem: this._onMediaItemChanded.bind(this)})
                }, unload: function unload() {
                    if (this._mediaItemBindings) {
                        this._mediaItemBindings.cancel();
                        this._mediaItemBindings = null
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, _onMediaItemChanded: function _onMediaItemChanded() {
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    this.visible = (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.metaCritic) && this.mediaItem && this.mediaItem.criticReview && this.mediaItem.criticReview.reviewScore >= 0);
                    if (this.visible) {
                        this._updateColor = this._updateColor.bind(this);
                        this._onClick = this._onClick.bind(this);
                        this._updateColor()
                    }
                    this._setControlFocusability()
                }, _setControlFocusability: function _setControlFocusability() {
                    if (!this._metaCriticControl)
                        return;
                    if (this.visible && MS.Entertainment.Utilities.isApp1) {
                        WinJS.Utilities.addClass(this._metaCriticControl, "win-focusable");
                        WinJS.Utilities.addClass(this._metaCriticControl, "acc-keyboardFocusTarget")
                    }
                }, _onKeyDown: function _onKeyDown(event) {
                    if (event.keyCode === WinJS.Utilities.Key.enter || event.keyCode === WinJS.Utilities.Key.space || event.keyCode === WinJS.Utilities.Key.invokeButton)
                        this._onClick()
                }, _onClick: function onClick() {
                    if (this.mediaItem && this.mediaItem.criticReview && this.mediaItem.criticReview.url && MS.Entertainment.Utilities.verifyUrl(this.mediaItem.criticReview.url))
                        Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(this.mediaItem.criticReview.url))
                }, _updateColor: function updateColor() {
                    if (this.mediaItem && this.mediaItem.criticReview && this.mediaItem.criticReview.reviewScore >= 0 && this._metaCriticScoreDomElement) {
                        WinJS.Utilities.removeClass(this._metaCriticScoreDomElement, "metaCritic-red");
                        WinJS.Utilities.removeClass(this._metaCriticScoreDomElement, "metaCritic-yellow");
                        WinJS.Utilities.removeClass(this._metaCriticScoreDomElement, "metaCritic-green");
                        if (this.mediaItem.criticReview.reviewScore < 40)
                            WinJS.Utilities.addClass(this._metaCriticScoreDomElement, "metaCritic-red");
                        else if (this.mediaItem.criticReview.reviewScore < 61)
                            WinJS.Utilities.addClass(this._metaCriticScoreDomElement, "metaCritic-yellow");
                        else if (this.mediaItem.criticReview.reviewScore <= 100)
                            WinJS.Utilities.addClass(this._metaCriticScoreDomElement, "metaCritic-green")
                    }
                }
        }, {
            visible: false, mediaItem: null
        })})
})()
})();
/* >>>>>>/components/video/episodeprogressionhelper.js:574 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */

(function(MS) {
    (function(Entertainment) {
        (function(Components) {
            (function(Video) {
                var EpisodeProgressionHelper = (function() {
                        function EpisodeProgressionHelper(series) {
                            this._series = series;
                            if (!this._series)
                                Trace.fail("No series provided")
                        }
                        EpisodeProgressionHelper.prototype.findNextEpisode = function(selectedSeason, lastWatchedEpisode) {
                            var _this = this;
                            if (!this._series) {
                                Trace.fail("No series provided");
                                return null
                            }
                            return this._hydrateModel(this._series, selectedSeason).then(function(hydrateResults) {
                                    _this._series = hydrateResults.series;
                                    selectedSeason = hydrateResults.season;
                                    return _this._findNextEpisode(selectedSeason, lastWatchedEpisode)
                                }).then(function() {
                                    return _this._hydrateModel(_this._series, _this._season, _this._episode)
                                })
                        };
                        EpisodeProgressionHelper.prototype._findNextEpisode = function(selectedSeason, lastWatchedEpisode) {
                            var _this = this;
                            var useBookmark = !lastWatchedEpisode;
                            var libraryEpisodesPromise = WinJS.Promise.wrap();
                            var lastWatchedPromise;
                            libraryEpisodesPromise = EpisodeProgressionHelper.getLibraryEpisodes(this._series).then(function(episodes) {
                                return WinJS.Promise.wrap(episodes)
                            }, function() {
                                return WinJS.Promise.wrap(null)
                            });
                            if (useBookmark)
                                lastWatchedPromise = this._getLastWatchedBookmark().then(function(bookmark) {
                                    return WinJS.Promise.wrap(bookmark)
                                }, function() {
                                    return WinJS.Promise.wrap(null)
                                });
                            return WinJS.Promise.join({
                                    libraryEpisodes: libraryEpisodesPromise, lastWatchedEpisodeBookmark: lastWatchedPromise
                                }).then(function(results) {
                                    if (!results)
                                        return WinJS.Promise.wrapError("No results from previous Promise");
                                    var lastWatchedEpisodeBookmark = results.lastWatchedEpisodeBookmark;
                                    var libraryEpisodes = results.libraryEpisodes;
                                    var foundLastWatchedEpisode = false;
                                    var lastWatchedSeasonNumber = null;
                                    var lastWatchedEpisodeNumber = null;
                                    var lastWatchedEpisodeLibraryId = -1;
                                    var lastWatchedComplete = false;
                                    var minWatchedPercentage = 0.95;
                                    if (!selectedSeason && !libraryEpisodes)
                                        if (_this._series && _this._series.seasons)
                                            return _this._series.seasons.toArrayAll().then(function(seasons) {
                                                    _this._season = (seasons[seasons.length - 1]);
                                                    return WinJS.Promise.wrap(_this._season)
                                                });
                                    if (lastWatchedEpisode) {
                                        foundLastWatchedEpisode = true;
                                        lastWatchedSeasonNumber = lastWatchedEpisode.seasonNumber;
                                        lastWatchedEpisodeNumber = lastWatchedEpisode.episodeNumber;
                                        lastWatchedEpisodeLibraryId = lastWatchedEpisode.libraryId;
                                        lastWatchedComplete = true
                                    }
                                    else if (lastWatchedEpisodeBookmark) {
                                        foundLastWatchedEpisode = true;
                                        lastWatchedSeasonNumber = lastWatchedEpisodeBookmark.tvSeasonNumber;
                                        lastWatchedEpisodeNumber = lastWatchedEpisodeBookmark.tvEpisodeNumber;
                                        lastWatchedEpisodeLibraryId = lastWatchedEpisodeBookmark.tvEpisodeId;
                                        var lastPosition = lastWatchedEpisodeBookmark.tvEpisodeBookmark;
                                        var duration = lastWatchedEpisodeBookmark.tvEpisodeDuration;
                                        if (lastPosition > 0)
                                            lastWatchedComplete = ((lastPosition / duration) > minWatchedPercentage);
                                        else
                                            lastWatchedComplete = lastWatchedEpisodeBookmark.hasPlayed
                                    }
                                    var seasonHydrationPromise = WinJS.Promise.wrap();
                                    var nextEpisodeNumber = -1;
                                    var currentEpisode = null;
                                    var nextEpisode = null;
                                    if (libraryEpisodes && !foundLastWatchedEpisode) {
                                        for (var x = 0; x < libraryEpisodes.length; x++)
                                            if (libraryEpisodes[x].episodeNumber > 0 && libraryEpisodes[x].seasonNumber > 0) {
                                                _this._episode = libraryEpisodes[x];
                                                break
                                            }
                                    }
                                    else if (libraryEpisodes) {
                                        var useNextEpisode = false;
                                        var nextEpisodeByNumber = null;
                                        var nextEpisodeByPosition = null;
                                        nextEpisodeNumber = (lastWatchedEpisodeNumber + 1);
                                        for (var x = 0; x < libraryEpisodes.length; x++) {
                                            if (lastWatchedEpisodeLibraryId === libraryEpisodes[x].libraryId) {
                                                currentEpisode = libraryEpisodes[x];
                                                useNextEpisode = true
                                            }
                                            if (useNextEpisode && !nextEpisodeByPosition && lastWatchedEpisodeNumber === libraryEpisodes[x].episodeNumber && lastWatchedSeasonNumber === libraryEpisodes[x].seasonNumber && lastWatchedEpisodeLibraryId !== libraryEpisodes[x].libraryId)
                                                nextEpisodeByPosition = libraryEpisodes[x];
                                            if (nextEpisodeNumber === libraryEpisodes[x].episodeNumber && lastWatchedSeasonNumber === libraryEpisodes[x].seasonNumber) {
                                                nextEpisodeByNumber = libraryEpisodes[x];
                                                break
                                            }
                                        }
                                        nextEpisode = nextEpisodeByNumber || nextEpisodeByPosition;
                                        if (!lastWatchedComplete && currentEpisode)
                                            _this._episode = currentEpisode;
                                        else if (lastWatchedComplete && nextEpisode)
                                            _this._episode = nextEpisode;
                                        else if (lastWatchedComplete && _this._series && _this._series.seasons) {
                                            var jumpToNextSeason = false;
                                            _this._series.seasons.toArrayAll().then(function(seasons) {
                                                for (var x = 0; x < seasons.length; x++) {
                                                    var currentSeason = seasons[x];
                                                    if (jumpToNextSeason) {
                                                        nextEpisodeNumber = 1;
                                                        seasonHydrationPromise = currentSeason.refresh();
                                                        break
                                                    }
                                                    else if (lastWatchedSeasonNumber === currentSeason.seasonNumber)
                                                        if (lastWatchedEpisodeNumber === currentSeason.latestEpisode) {
                                                            jumpToNextSeason = true;
                                                            seasonHydrationPromise = currentSeason.refresh()
                                                        }
                                                        else if (nextEpisodeNumber <= currentSeason.latestEpisode) {
                                                            seasonHydrationPromise = currentSeason.refresh();
                                                            break
                                                        }
                                                }
                                            })
                                        }
                                    }
                                    return seasonHydrationPromise.then(function(season) {
                                            if (season && season.episodes)
                                                season.episodes.toArrayAll().then(function(episodes) {
                                                    for (var x = 0; x < episodes.length; x++)
                                                        if (nextEpisodeNumber === episodes[x].episodeNumber) {
                                                            _this._episode = episodes[x];
                                                            break
                                                        }
                                                    if (!_this._episode)
                                                        _this._episode = currentEpisode
                                                });
                                            var seasons = null;
                                            if (_this._series)
                                                if (_this._series.seasons && _this._series.seasons.count > 0)
                                                    seasons = _this._series.seasons;
                                                else
                                                    seasons = _this._series.librarySeasons;
                                            Trace.assert(seasons && seasons.count, ("No seasons found for this series! " + "Series: Name {0}, CanonicalID {1}").format(_this._series.name, _this._series.canonicalId));
                                            if (seasons)
                                                return seasons.toArrayAll().then(function(seasons) {
                                                        if (selectedSeason)
                                                            for (var x = 0; x < seasons.length; x++)
                                                                if (selectedSeason.seasonNumber === seasons[x].seasonNumber) {
                                                                    _this._season = seasons[x];
                                                                    return WinJS.Promise.wrap(_this._season)
                                                                }
                                                        for (var x = 0; x < seasons.length; x++)
                                                            if (_this._episode && _this._episode.seasonNumber === seasons[x].seasonNumber) {
                                                                _this._season = seasons[x];
                                                                return WinJS.Promise.wrap(_this._season)
                                                            }
                                                        if (seasons.length > 0) {
                                                            _this._season = seasons[seasons.length - 1];
                                                            return WinJS.Promise.wrap(_this._season)
                                                        }
                                                    });
                                            Trace.assert(_this._season, ("No season found for this series! " + "Series: Name {0}, CanonicalID {1}").format(_this._series.name, _this._series.canonicalId))
                                        });
                                    return WinJS.Promise.wrap(_this._season)
                                })
                        };
                        EpisodeProgressionHelper.prototype._getLastWatchedBookmark = function() {
                            if (!this._series || this._series.libraryId === undefined || this._series.libraryId === -1)
                                return WinJS.Promise.wrap(null);
                            var findSeriesZuneIdPromise = WinJS.Promise.wrap(this._series.zuneId);
                            if (!this._series.hasZuneId && this._series.librarySeasons)
                                findSeriesZuneIdPromise = this._series.librarySeasons.toArrayAll().then(function(sortedLibrarySeasons) {
                                    for (var x = 0; x < sortedLibrarySeasons.length; x++)
                                        if (!MS.Entertainment.Utilities.isEmptyGuid(sortedLibrarySeasons[x].seriesZuneId))
                                            return WinJS.Promise.wrap(sortedLibrarySeasons[x].seriesZuneId)
                                });
                            var pendingBookmarkWriteOperations;
                            if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.bookmarkOperationsWatcher)) {
                                var bookmarkWatcher = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.bookmarkOperationsWatcher);
                                pendingBookmarkWriteOperations = bookmarkWatcher.waitForPendingOperations()
                            }
                            return WinJS.Promise.join({
                                    zuneId: findSeriesZuneIdPromise, pendingBookmarkWriteOperations: WinJS.Promise.as(pendingBookmarkWriteOperations)
                                }).then(function(results) {
                                    var zuneId = results && results.zuneId;
                                    if (MS.Entertainment.Utilities.isEmptyGuid(zuneId))
                                        return WinJS.Promise.wrap(null);
                                    var ms = new Microsoft.Entertainment.Platform.MediaStore;
                                    return ms.videoProvider.getLastWatchedEpisodeForSeriesAsync(zuneId)
                                }).then(function(bookmark) {
                                    if (bookmark && bookmark.tvEpisodeId >= 0)
                                        return WinJS.Promise.wrap(bookmark);
                                    else
                                        return WinJS.Promise.wrap(null)
                                }, function() {
                                    return WinJS.Promise.wrap(null)
                                })
                        };
                        EpisodeProgressionHelper.prototype._hydrateModel = function(series, season, episode) {
                            var seriesHydrate;
                            if (series && series.hydrate && !series.hydrated)
                                seriesHydrate = series.hydrate();
                            else
                                seriesHydrate = WinJS.Promise.as(series);
                            var seasonHydrate;
                            if (season && season.hydrate && !season.hydrated)
                                seasonHydrate = season.hydrate();
                            else
                                seasonHydrate = WinJS.Promise.as(season);
                            var episodeHydrate;
                            if (episode && episode.hydrate && !episode.hydrated)
                                episodeHydrate = episode.hydrate();
                            else
                                episodeHydrate = WinJS.Promise.as(episode);
                            return WinJS.Promise.join({
                                    series: seriesHydrate, season: seasonHydrate, episode: episodeHydrate
                                })
                        };
                        EpisodeProgressionHelper.getLibraryEpisodes = function(series) {
                            if (!series)
                                return WinJS.Promise.wrap(null);
                            return MS.Entertainment.ViewModels.MediaItemModel.hydrateLibraryInfoAsync(series).then(function() {
                                    if (!series || series.libraryId === -1)
                                        return WinJS.Promise.wrap(null);
                                    var query = new MS.Entertainment.Data.Query.libraryVideoTV;
                                    query.seriesId = series.libraryId;
                                    query.sort = Microsoft.Entertainment.Queries.VideosSortBy.seriesTitleSeasonNumberEpisodeNumber;
                                    query.isLive = false;
                                    query.chunkSize = 1000;
                                    return query.getItemsArrayAndIgnoreErrors()
                                })
                        };
                        return EpisodeProgressionHelper
                    })();
                Video.EpisodeProgressionHelper = EpisodeProgressionHelper
            })(Components.Video || (Components.Video = {}));
            var Video = Components.Video
        })(Entertainment.Components || (Entertainment.Components = {}));
        var Components = Entertainment.Components
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
})();
/* >>>>>>/controls/video_win/tvdetails.js:830 */
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
                var TvDetails = (function(_super) {
                        __extends(TvDetails, _super);
                        function TvDetails(element, options) {
                            _super.call(this, element, options);
                            this._displayedSeason = null;
                            MS.Entertainment.UI.Framework.processDeclarativeControlContainer(this);
                            this._viewModelBindings = new Array;
                            this._viewModelBindings.push(WinJS.Binding.bind(this, {dataContext: {season: this._onTvSeasonChanged.bind(this)}}))
                        }
                        TvDetails.prototype.dispose = function() {
                            if (this._viewModelBindings) {
                                this._viewModelBindings.forEach(function(binding) {
                                    return binding.cancel()
                                });
                                this._viewModelBindings = null
                            }
                            _super.prototype.dispose.call(this)
                        };
                        TvDetails.prototype.onFooterLinkClicked = function(event) {
                            var foundElement = this.domElement.querySelector(".videoDetails-footer");
                            if (foundElement && MS.Entertainment.Utilities.isInvocationEvent(event))
                                foundElement.scrollIntoView()
                        };
                        TvDetails.prototype._onTvSeasonChanged = function() {
                            var newSeason = this.dataContext && this.dataContext.season;
                            if (newSeason && this._displayedSeason && (newSeason !== this._displayedSeason)) {
                                var foundElement = document.querySelector(".nav-currentPage .header-backButton");
                                if (foundElement)
                                    foundElement.scrollIntoView()
                            }
                            this._displayedSeason = newSeason
                        };
                        TvDetails.isDeclarativeControlContainer = true;
                        TvDetails.tvSeasonItemSize = 160;
                        return TvDetails
                    })(Controls.PageViewBase);
                Controls.TvDetails = TvDetails
            })(UI.Controls || (UI.Controls = {}));
            var Controls = UI.Controls
        })(Entertainment.UI || (Entertainment.UI = {}));
        var UI = Entertainment.UI
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}));
WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.TvDetails)
})();
