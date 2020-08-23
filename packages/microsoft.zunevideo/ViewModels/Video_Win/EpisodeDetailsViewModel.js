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
        (function(ViewModels) {
            var EpisodeDetailsViewModel = (function(_super) {
                    __extends(EpisodeDetailsViewModel, _super);
                    function EpisodeDetailsViewModel(mediaItem, initialPreferences) {
                        Trace.assert(mediaItem, "EpisodeDetailsViewModel::ctor(): Invalid media item provided.");
                        this.mediaItem = mediaItem;
                        _super.call(this, initialPreferences)
                    }
                    EpisodeDetailsViewModel.create = function(mediaItem, initialPreferences) {
                        if (!mediaItem || !Entertainment.Utilities.isTVEpisode(mediaItem)) {
                            Trace.fail("Could not create EpisodeDetailsViewModel");
                            return null
                        }
                        return new EpisodeDetailsViewModel(mediaItem, initialPreferences)
                    };
                    Object.defineProperty(EpisodeDetailsViewModel.prototype, "primaryHeaderButtons", {
                        get: function() {
                            return this._primaryHeaderButtons
                        }, set: function(value) {
                                this.updateAndNotify("primaryHeaderButtons", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(EpisodeDetailsViewModel.prototype, "secondaryHeaderButtons", {
                        get: function() {
                            return this._secondaryHeaderButtons
                        }, set: function(value) {
                                this.updateAndNotify("secondaryHeaderButtons", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(EpisodeDetailsViewModel.prototype, "network", {
                        get: function() {
                            return this._network
                        }, set: function(value) {
                                this.updateAndNotify("network", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(EpisodeDetailsViewModel.prototype, "title", {
                        get: function() {
                            return this._title
                        }, set: function(value) {
                                this.updateAndNotify("title", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(EpisodeDetailsViewModel.prototype, "subTitle", {
                        get: function() {
                            return this._subTitle
                        }, set: function(value) {
                                this.updateAndNotify("subTitle", value)
                            }, enumerable: true, configurable: true
                    });
                    EpisodeDetailsViewModel.prototype._initializeModules = function() {
                        this.modules = []
                    };
                    EpisodeDetailsViewModel.prototype.loadModules = function() {
                        _super.prototype.loadModules.call(this);
                        this.viewStateViewModel.viewState = 2
                    };
                    EpisodeDetailsViewModel.prototype._getSmartBuyEngineButtons = function() {
                        return MS.Entertainment.ViewModels.SmartBuyButtons.getVideoDetailsButtons(this.mediaItem, MS.Entertainment.UI.Actions.ExecutionLocation.canvas)
                    };
                    EpisodeDetailsViewModel.prototype._getSmartBuyEngineEventHandler = function() {
                        var _this = this;
                        return function(engine, stateInfo) {
                                var getStatePromise;
                                if (_this._smartBuyStateEngine)
                                    getStatePromise = _this._smartBuyStateEngine.onVideoVerticalDetailsStateChanged(stateInfo).then(function(buttonState) {
                                        _this._refreshPurchaseDetailsString(stateInfo);
                                        return buttonState
                                    });
                                return WinJS.Promise.as(getStatePromise)
                            }
                    };
                    EpisodeDetailsViewModel.prototype._refreshDetailString = function() {
                        if (!this.mediaItem)
                            return;
                        _super.prototype._refreshDetailsStrings.call(this);
                        var episode = this.mediaItem;
                        this.network = episode.networks ? MS.Entertainment.Formatters.formatGenresListNonConverter(episode.networks) : String.empty;
                        var formattedSeasonNumber = String.load(String.id.IDS_TV_SEASON_NAME).format(episode.formattedSeasonNumber);
                        if (episode.episodeNumber > 0)
                            this.title = String.load(String.id.IDS_VIDEO_LX_DETAILS_HEADER_EPISODE_TITLE).format(episode.episodeNumber, episode.name);
                        else
                            this.title = episode.name;
                        if (episode.seasonNumber > 0)
                            this.subTitle = String.load(String.id.IDS_VIDEO_LX_DETAILS_HEADER_SERIES_SEASON_SUBTITLE).format(episode.seriesTitle, formattedSeasonNumber);
                        else
                            this.subTitle = episode.seriesTitle
                    };
                    EpisodeDetailsViewModel.prototype._refreshPurchaseDetailsString = function(stateInfo){};
                    EpisodeDetailsViewModel.prototype._reloadFilteredModules = function(){};
                    EpisodeDetailsViewModel.prototype._updateFilterDetails = function(){};
                    EpisodeDetailsViewModel.prototype._onButtonsChanged = function() {
                        if (!this.disposed && this._smartBuyStateEngine) {
                            this.primaryHeaderButtons = this._smartBuyStateEngine.getCurrentButtonsForLocation(ViewModels.VideoDetailsActionLocations.primaryHeader);
                            this.secondaryHeaderButtons = this._smartBuyStateEngine.getCurrentButtonsForLocation(ViewModels.VideoDetailsActionLocations.secondaryHeader)
                        }
                    };
                    return EpisodeDetailsViewModel
                })(ViewModels.VideoDetailsViewModelBase);
            ViewModels.EpisodeDetailsViewModel = EpisodeDetailsViewModel
        })(Entertainment.ViewModels || (Entertainment.ViewModels = {}));
        var ViewModels = Entertainment.ViewModels
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
