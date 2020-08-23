/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/ViewModels/MediaItemModel.js", "/Components/Immersive/Shared/BaseImmersiveSummary.js");
(function() {
    "use strict";
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls");
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {TvImmersiveOverviewSummary: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.BaseImmersiveOverviewSummary", "/Components/Immersive/Video/TVImmersiveTemplates.html#ImmersiveOverview", function immersiveOverview() {
            this.displayActionButtons = MS.Entertainment.Utilities.isApp1
        }, {
            _buttonsEpisode: null, _buttonsSeason: null, usesSmartBuyStateEngine: false, initialize: function initialize() {
                    MS.Entertainment.UI.Controls.BaseImmersiveOverviewSummary.prototype.initialize.apply(this, arguments);
                    MS.Entertainment.UI.Controls.assert((this.dataContext && this.dataContext.tvImmersiveViewModel && this.dataContext.tvImmersiveViewModel.season && this.dataContext.tvImmersiveViewModel.season.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeason), "Must pass in a TV Season to the TV Season Overview panel.");
                    this.viewModel = this.dataContext.tvImmersiveViewModel;
                    if (this.viewModel) {
                        this.viewModel.seasonStateInfoCallback = this._setDisclaimerVisibility.bind(this);
                        if (this.viewModel.seasonStateInfo)
                            this._setDisclaimerVisibility(this.viewModel.seasonStateInfo)
                    }
                    if (MS.Entertainment.Utilities.isApp2 && this._episodeButton)
                        this._episodeButton.tabIndex = -1;
                    this._seasonBinds = WinJS.Binding.bind(this.viewModel, {
                        season: this.onMediaChange.bind(this), episode: this.onMediaChange.bind(this)
                    });
                    this._waitForActionsReadyOrTimeout().done(function actionsReady() {
                        if (!this.displayActionButtons)
                            this._updateDescriptionViewMore();
                        this.visible = true;
                        if (this.dataContext.visibleSignal)
                            WinJS.Binding.unwrap(this.dataContext.visibleSignal).complete()
                    }.bind(this));
                    this._setControlFocusability()
                }, _createSmartBuyStateEngine: function _createSmartBuyStateEngine() {
                    return new MS.Entertainment.ViewModels.VideoSmartBuyStateEngine
                }, _setControlFocusability: function _setControlFocusability() {
                    if (MS.Entertainment.Utilities.isApp1 && this._watchNextEpisode) {
                        WinJS.Utilities.addClass(this._watchNextEpisode, "acc-keyboardFocusTarget");
                        WinJS.Utilities.addClass(this._watchNextEpisode, "win-focusable")
                    }
                }, _setDisclaimerVisibility: function _setDisclaimerVisibility(stateInfo) {
                    if (!this.viewModel.season || this.viewModel.season.isComplete)
                        this.showSeasonPassDisclaimer = false;
                    else {
                        var entireSeasonIsOwned = WinJS.Utilities.getMember("marketplace.hasPurchasedSeason", stateInfo);
                        if (entireSeasonIsOwned !== undefined)
                            if (entireSeasonIsOwned)
                                this.showSeasonPassDisclaimer = false;
                            else {
                                var bestFreeRight = MS.Entertainment.ViewModels.VideoSmartBuyStateEngine.getBestFreeSeasonRight(this.viewModel.season);
                                var seasonPassOffer = MS.Entertainment.ViewModels.VideoSmartBuyStateEngine.getDefaultSeasonBuyOffer(this.viewModel.season, MS.Entertainment.Data.Augmenter.Marketplace.videoDefinition.hd, String.empty);
                                this.showSeasonPassDisclaimer = !!seasonPassOffer && !bestFreeRight
                            }
                    }
                }, _waitForActionsReadyOrTimeout: function _waitForActionsReadyOrTimeout() {
                    var previousFramePromise = this.dataContext.previousSignal ? WinJS.Binding.unwrap(this.dataContext.previousSignal).promise : WinJS.Promise.wrap();
                    var promises = [previousFramePromise];
                    var seasonButtons = WinJS.Utilities.getMember("_buttonsSeason.domElement", this);
                    if (seasonButtons && WinJS.Utilities.getMember("dataContext.tvImmersiveViewModel.seasonSmartBuyStateEngine", this))
                        promises.push(MS.Entertainment.Utilities.waitForDomEvent("ActionsReady", seasonButtons));
                    var episodeButtons = WinJS.Utilities.getMember("_buttonsEpisode.domElement", this);
                    if (episodeButtons && WinJS.Utilities.getMember("dataContext.tvImmersiveViewModel.episodeSmartBuyStateEngine", this))
                        promises.push(MS.Entertainment.Utilities.waitForDomEvent("ActionsReady", episodeButtons));
                    return WinJS.Promise.any([WinJS.Promise.join(promises), WinJS.Promise.timeout(2000)])
                }, onMediaChange: function onMediaChange() {
                    if (this.dataContext && this.dataContext.tvImmersiveViewModel && this.dataContext.tvImmersiveViewModel.season) {
                        this.season = this.dataContext.tvImmersiveViewModel.season;
                        this.episode = this.dataContext.tvImmersiveViewModel.season.episode;
                        if (!this.season.hydrated)
                            this.showSeasonPassDisclaimer = false;
                        this.season.hydrate().then(function onHydratedSeason() {
                            var fileTransferService = MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.fileTransfer) && MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                            if (this.season.hasServiceId && fileTransferService) {
                                var mediaKey = this.season.seriesId.toLowerCase();
                                var seasonNumber = this.season.seasonNumber;
                                fileTransferService.registerListener(MS.Entertainment.UI.Controls.TvImmersiveOverviewSummary._downloadNotificationListenerId, function getTaskKey(task) {
                                    return (task.libraryTypeId === Microsoft.Entertainment.Queries.ObjectType.video && task.seriesMediaId.toLowerCase() === mediaKey && task.seasonNumber === seasonNumber) ? mediaKey : null
                                }.bind(this), this.season, MS.Entertainment.UI.FileTransferNotifiers.episodeCollection);
                                MS.Entertainment.UI.FileTransferService.pulseAsync(this.season)
                            }
                            if (fileTransferService && this.season.episode && this.season.episode.hasServiceId) {
                                var currentEpisode = this.season.episode;
                                fileTransferService.registerListener(MS.Entertainment.UI.Controls.TvImmersiveOverviewSummary._downloadEpisodeNotificationListenerId, function getTaskKey(task) {
                                    return (task.libraryTypeId === Microsoft.Entertainment.Queries.ObjectType.video && task.libraryId === currentEpisode.libraryId) ? task.libraryId : null
                                }.bind(this), this.season.episode, MS.Entertainment.UI.FileTransferNotifiers.genericFile);
                                MS.Entertainment.UI.FileTransferService.pulseAsync(this.season.episode)
                            }
                            this.tvOverviewMetadata = this.formatTvOverviewMetadata(this.season);
                            this.episodeDetails = this.formatTvEpisodeMetadata();
                            if (!this.displayActionButtons) {
                                var event = document.createEvent("Event");
                                event.initEvent("contentready", true, false);
                                this.domElement.dispatchEvent(event)
                            }
                        }.bind(this))
                    }
                }, unload: function unload() {
                    var fileTransferService = MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.fileTransfer) && MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                    if (fileTransferService) {
                        fileTransferService.unregisterListener(MS.Entertainment.UI.Controls.TvImmersiveOverviewSummary._downloadNotificationListenerId);
                        fileTransferService.unregisterListener(MS.Entertainment.UI.Controls.TvImmersiveOverviewSummary._downloadEpisodeNotificationListenerId)
                    }
                    if (this._buttonsSeason && this._buttonsSeason.domElement)
                        this._buttonsSeason.domElement.removeEventListener("ActionsReady", this._updateDescriptionViewMore);
                    if (this._buttonsEpisode && this._buttonsEpisode.domElement)
                        this._buttonsEpisode.domElement.removeEventListener("ActionsReady", this._updateDescriptionViewMore);
                    if (this._seasonBinds) {
                        this._seasonBinds.cancel();
                        this._seasonBinds = null
                    }
                    if (this.viewModel) {
                        this.viewModel.seasonStateInfoCallback = null;
                        this.viewModel = null
                    }
                    MS.Entertainment.UI.Controls.BaseImmersiveOverviewSummary.prototype.unload.call(this)
                }, _updateDescriptionViewMore: function _updateDescriptionViewMore(newValue, oldValue) {
                    WinJS.Promise.timeout(500).then(function updateVM() {
                        var event = document.createEvent("Event");
                        event.initEvent("contentready", true, false);
                        this.domElement.dispatchEvent(event)
                    }.bind(this))
                }, formatTvOverviewMetadata: function formatTvOverviewMetadata(sourceValue) {
                    var result = String.empty;
                    if (sourceValue) {
                        var parts = [];
                        if (sourceValue.genre)
                            parts.push(MS.Entertainment.Formatters.formatGenresListNonConverter(sourceValue.genre));
                        if (sourceValue.studioName)
                            parts.push(sourceValue.studioName);
                        else if (sourceValue.network)
                            parts.push(sourceValue.network);
                        else if (sourceValue.studios && sourceValue.studios.length > 0 && sourceValue.studios[0].name)
                            parts.push(sourceValue.studios[0].name);
                        else if (sourceValue.networks && sourceValue.networks.length > 0 && sourceValue.networks[0].name)
                            parts.push(sourceValue.networks[0].name);
                        var languages = MS.Entertainment.ViewModels.VideoSmartBuyStateEngine.getLanguagesForRights(this.media, MS.Entertainment.Utilities.defaultClientTypeFromApp);
                        if (languages && languages.length === 1)
                            parts.push(String.load(String.id.IDS_DETAILS_AUDIO_LANGUAGE).format(MS.Entertainment.Utilities.getDisplayLanguageFromLanguageCode(languages[0])));
                        if (sourceValue.rating)
                            parts.push(sourceValue.rating);
                        var episodesLabel = this.getEpisodeCountLabel(sourceValue);
                        if (episodesLabel)
                            parts.push(episodesLabel);
                        result = parts.join(String.load(String.id.IDS_DETAILS_INFO_SEPERATOR))
                    }
                    return result
                }, formatTvEpisodeMetadata: function formatTvEpisodeMetadata() {
                    var result = String.empty;
                    if (this.season && this.season.episode) {
                        var parts = [];
                        if (this.season.episode.genre)
                            parts.push(MS.Entertainment.Formatters.formatGenresListNonConverter(this.season.episode.genre));
                        else if (this.season.episode.genreName)
                            parts.push(this.season.episode.genreName);
                        if (this.season.episode.studioName)
                            parts.push(this.season.episode.studioName);
                        else if (this.season.episode.network)
                            parts.push(this.season.episode.network);
                        var languages = MS.Entertainment.ViewModels.VideoSmartBuyStateEngine.getLanguagesForRights(this.media, MS.Entertainment.Utilities.defaultClientTypeFromApp);
                        if (languages && languages.length === 1)
                            parts.push(String.load(String.id.IDS_DETAILS_AUDIO_LANGUAGE).format(MS.Entertainment.Utilities.getDisplayLanguageFromLanguageCode(languages[0])));
                        if (this.season.episode.rating)
                            parts.push(this.season.episode.rating);
                        result = parts.join(String.load(String.id.IDS_DETAILS_INFO_SEPERATOR))
                    }
                    return result
                }, getEpisodeCountLabel: function getEpisodeCountLabel(seasonItem) {
                    var label = null;
                    if (seasonItem.episodes && seasonItem.episodes.count) {
                        var episodeCount = seasonItem.episodes.count;
                        if (episodeCount > 0) {
                            var stringId = String.id.IDS_TV_EPISODES_LABEL;
                            if (episodeCount === 1)
                                stringId = String.id.IDS_TV_EPISODE_LABEL;
                            var formattedNum = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber.format(episodeCount);
                            label = String.load(stringId).format(formattedNum)
                        }
                    }
                    return label
                }, _onClickEpisode: function _onClickEpisode() {
                    if (this.viewModel && this.viewModel.season && this.viewModel.season.episode) {
                        var popOverParameters = {itemConstructor: MS.Entertainment.Utilities.getTvInlineDetailsPopoverControl()};
                        popOverParameters.dataContext = {
                            data: this.viewModel.season.episode, location: MS.Entertainment.Pages.BaseMediaInlineDetails.Location.marketplace
                        };
                        MS.Entertainment.UI.Controls.PopOver.showPopOver(popOverParameters)
                    }
                }, _onKeyDown: function _onKeyDown(event) {
                    if (event.keyCode === WinJS.Utilities.Key.enter || event.keyCode === WinJS.Utilities.Key.space || event.keyCode === WinJS.Utilities.Key.invokeButton)
                        this._onClickEpisode()
                }
        }, {
            viewModel: null, tvOverviewMetadata: String.empty, episodeDetails: String.empty, season: null, episode: null, showSeasonPassDisclaimer: false, displayActionButtons: false, visible: false
        }, {
            _downloadNotificationListenerId: "TvImmersiveOverviewSummary", _downloadEpisodeNotificationListenerId: "TvImmersiveOverviewSummaryEpisode"
        })})
})()
