/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/utilities.js", "/ViewModels/MediaItemModel.js", "/Components/InlineDetails/ActionButtonsControl.js", "/Components/InlineDetails/BaseInlineDetails.js");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.Pages", {TvSeriesInlineDetails: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.Pages.BaseMediaInlineDetails", "/Components/InlineDetails/TvSeriesInlineDetails.html#tvSeriesInlineDetailsTemplate", function tvSeriesInlineDetails(element, options) {
            this._episodeHeight = options.episodeHeight;
            this._inlineHeight = options.inlineHeight;
            this._onBackFromEpisodeClickCallback = MS.Entertainment.Utilities.bindAndMarkSupportedForProcessing(this._backFromEpisode, this);
            this._onEpisodeListItemClickCallback = MS.Entertainment.Utilities.bindAndMarkSupportedForProcessing(this._onEpisodeListItemClick, this)
        }, {
            _episodeHeight: 0, _inlineHeight: 0, _fileTransferListenerId: null, _detailStringBindingComplete: false, _detailEpisodeStringBindingComplete: false, _modifierBinding: null, _selectedEpisodeIndex: 0, _activeEpisodeList: null, _episodesPanel: null, _currentPage: null, initialize: function initialize() {
                    var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                    this._currentPage = WinJS.Binding.unwrap(navigationService.currentPage);
                    if (this._currentPage.iaNode.moniker === MS.Entertainment.UI.Monikers.navigationPopover)
                        this._currentPage.onNavigateTo = function onNavigateTo(fromPage) {
                            if (navigationService.navigationDirection === MS.Entertainment.Navigation.NavigationDirection.backward) {
                                var fromPageMoniker = WinJS.Utilities.getMember("iaNode.moniker", fromPage);
                                if (fromPageMoniker === MS.Entertainment.UI.Monikers.fullScreenNowPlaying) {
                                    WinJS.Utilities.addClass(this.domElement, "hideFromDisplay");
                                    WinJS.Promise.timeout(1).done(function delayBackNavigate() {
                                        navigationService.navigateBack()
                                    })
                                }
                            }
                        }.bind(this);
                    if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.fileTransfer))
                        this._fileTransferListenerId = "TVSeriesInlineDetails_" + MS.Entertainment.Utilities.getSessionUniqueInteger();
                    if (this.media.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeason)
                        this.domElement.addEventListener("galleryFirstPageRendered", function galleryFirstPageRendered() {
                            MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioPopoverRequestToLoad("tv-season")
                        });
                    else if (this.media.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeries)
                        this.domElement.addEventListener("galleryFirstPageRendered", function galleryFirstPageRendered() {
                            MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioPopoverRequestToLoad("tv-series")
                        });
                    else if (MS.Entertainment.Platform.PlaybackHelpers.isTVEpisode(this.media))
                        this.domElement.addEventListener("galleryFirstPageRendered", function galleryFirstPageRendered() {
                            MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioPopoverRequestToLoad("tv-episode")
                        });
                    if (this.media.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeason || this.media.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeries) {
                        var handleBackPress = function(event) {
                                var goBackToEpisodeList = false;
                                if (this.showEpisode)
                                    switch (event.type) {
                                        case"MSPointerUp":
                                        case"pointerup":
                                            goBackToEpisodeList = (event.button === 3);
                                            break;
                                        case"keydown":
                                            goBackToEpisodeList = (event.keyCode === WinJS.Utilities.Key.backspace);
                                            break
                                    }
                                if (goBackToEpisodeList)
                                    this._backFromEpisode()
                            };
                        var handleBackPressFunc = handleBackPress.bind(this);
                        this.domElement.addEventListener("keydown", handleBackPressFunc, true);
                        this.domElement.addEventListener("MSPointerUp", handleBackPressFunc, true);
                        this.domElement.addEventListener("pointerup", handleBackPressFunc, true)
                    }
                    if (MS.Entertainment.Platform.PlaybackHelpers.isTVEpisode(this.media))
                        this.episode = this.media;
                    if (Microsoft.Entertainment.Queries.ObjectType.tvSeries === this.media.mediaType)
                        this.series = this.media;
                    MS.Entertainment.Pages.BaseMediaInlineDetails.prototype.initialize.apply(this, arguments);
                    this._formatDetailString();
                    this._showPanel(true)
                }, unload: function unload() {
                    if (this._fileTransferListenerId) {
                        var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                        var listenerId = this._fileTransferListenerId;
                        if (!this.showEpisode)
                            listenerId = listenerId + "_season";
                        fileTransferService.unregisterListener(listenerId)
                    }
                    if (this._currentPage && this._currentPage.onNavigateTo)
                        this._currentPage.onNavigateTo = null;
                    this._currentPage = null;
                    if (this._modifierBinding)
                        this._modifierBinding.cancel();
                    MS.Entertainment.Pages.BaseMediaInlineDetails.prototype.unload.call(this)
                }, _createSmartBuyStateEngine: function _createSmartBuyStateEngine() {
                    return new MS.Entertainment.ViewModels.VideoSmartBuyStateEngine
                }, _onHydrateCompleted: function _onHydrateCompleted() {
                    if (this.media.isFailed)
                        this._handleError();
                    else if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.applicationStateManager)) {
                        var applicationStateManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.applicationStateManager);
                        applicationStateManager.saveDetailsState(this.media)
                    }
                }, _fragmentContainerShown: function _fragmentContainerShown() {
                    MS.Entertainment.Pages.BaseMediaInlineDetails.prototype._fragmentContainerShown.call(this);
                    if (this.series)
                        MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioPopoverRequestToLoad("tv-series");
                    else if (this.media.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeason)
                        MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioPopoverRequestToLoad("tv-season");
                    else if (this.media.mediaType === Microsoft.Entertainment.Queries.ObjectType.video)
                        MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioPopoverRequestToLoad("tv-episode")
                }, _modifierSelectedItemChangedCallback: function _modifierSelectedItemChangedCallback() {
                    if (this.series && (this.series.seasons || this.series.librarySeasons) && this.modifierSelectionManager.selectedItem && this.modifierSelectionManager.selectedItem.media) {
                        MS.Entertainment.Framework.assert(this.modifierSelectionManager.selectedItem.media.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeason, "Non-season used in the season drop down in tv series inline details");
                        if (this.modifierSelectionManager.selectedItem.media.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeason)
                            this._setMedia(this.modifierSelectionManager.selectedItem.media)
                    }
                }, _setSeasonFromSeries: function _setSeasonFromSeries(media) {
                    media = MS.Entertainment.ViewModels.MediaItemModel.augment(media);
                    this.series = media;
                    this._hydrateMedia().then(function seriesHydrated() {
                        if (media.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeries) {
                            this._formatDetailString();
                            var seasons = media.seasons ? media.seasons : media.librarySeasons;
                            if (seasons)
                                seasons.toArrayAll().then(function(items) {
                                    this.seasonSelections = [];
                                    items.forEach(function(season) {
                                        var item = {
                                                media: season, label: MS.Entertainment.Formatters.formatTVSeasonNumberInt(season.seasonNumber)
                                            };
                                        this.seasonSelections.push(item)
                                    }.bind(this));
                                    media = items[items.length - 1];
                                    this.modifierSelectionManager = new MS.Entertainment.UI.Framework.SelectionManager(this.seasonSelections, items.length - 1);
                                    var binding = WinJS.Binding.bind(this.modifierSelectionManager, {selectedItem: this._modifierSelectedItemChangedCallback.bind(this)})
                                }.bind(this))
                        }
                    }.bind(this))
                }, _setMedia: function _setMedia(media) {
                    MS.Entertainment.Pages.BaseMediaInlineDetails.prototype._setMedia.apply(this, arguments);
                    if (Microsoft.Entertainment.Queries.ObjectType.tvSeries === this.media.mediaType || (MS.Entertainment.Data.Augmenter.ServiceTypes.editorialItem === this.media.serviceType && MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Series === this.media.type)) {
                        this._setSeasonFromSeries(this.media);
                        return
                    }
                    if (Microsoft.Entertainment.Queries.ObjectType.tvSeason === this.media.mediaType || (MS.Entertainment.Data.Augmenter.ServiceTypes.editorialItem === this.media.serviceType && MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Season === this.media.type))
                        this.season = this.media;
                    this.media = MS.Entertainment.ViewModels.MediaItemModel.augment(this.media);
                    this.showEpisode = (this.episode && this.episode === this.media);
                    this._updateShowBackButton();
                    this._hideShowEpisodeList();
                    this._hydrateMedia();
                    if (this._fileTransferListenerId && MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.fileTransfer)) {
                        if (!this.media.contentNotifications)
                            MS.Entertainment.Utilities.BindingAgnostic.setProperty(this.media, "contentNotifications", new MS.Entertainment.UI.ContentNotification.ObservableNotificationArray);
                        else
                            this.media.contentNotifications.clear();
                        var mediaKey = this.showEpisode ? null : this.media.seriesId.toLowerCase() + "_s" + this.media.seasonNumber;
                        var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                        var getTaskKey = null;
                        var listenerId = this._fileTransferListenerId;
                        if (this.showEpisode)
                            getTaskKey = function getTaskKey(task) {
                                return (task.libraryTypeId === Microsoft.Entertainment.Queries.ObjectType.video && task.libraryId === media.libraryId) ? task.libraryId : null
                            };
                        else {
                            getTaskKey = function getTaskKey(task) {
                                if (task && task.seriesMediaId && !MS.Entertainment.Utilities.isEmptyGuid(task.seriesMediaId)) {
                                    var taskKey = task.seriesMediaId.toLowerCase() + "_s" + task.seasonNumber;
                                    if (taskKey === mediaKey)
                                        return mediaKey
                                }
                                return null
                            };
                            listenerId = listenerId + "_season"
                        }
                        fileTransferService.registerListener(listenerId, getTaskKey, this.media, this.showEpisode ? MS.Entertainment.UI.FileTransferNotifiers.genericFile : MS.Entertainment.UI.FileTransferNotifiers.episodeCollection);
                        MS.Entertainment.UI.FileTransferService.pulseAsync(this.media)
                    }
                    var binding;
                    if (!this.series || this.media.mediaType !== Microsoft.Entertainment.Queries.ObjectType.tvSeason)
                        this.description = String.empty;
                    if (this.media.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeason && this.media.hasSeriesId) {
                        var updateEpisodes = function updateEpisodes() {
                                if (!this.media.episodesQueryFailed)
                                    this._parseEpisodes(this.media.episodes);
                                else
                                    this._parseEpisodes(null);
                                this._hideShowEpisodeList()
                            };
                        var episodesQueryFailed = function episodesQueryFailed() {
                                if (this.media.episodesQueryFailed)
                                    this._loadLocalEpisodes()
                            };
                        if (this.media.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeason)
                            this._loadSeriesInfo();
                        binding = WinJS.Binding.bind(this.media, {
                            episodeCount: this._formatDetailString.bind(this), genre: this._formatDetailString.bind(this), episodes: updateEpisodes.bind(this), episodesQueryFailed: episodesQueryFailed.bind(this)
                        });
                        if (this.series)
                            this.mediaBindings.push(WinJS.Binding.bind(this.series, {description: this._formatDetailString.bind(this)}));
                        else
                            this.mediaBindings.push(WinJS.Binding.bind(this.media, {description: this._formatDetailString.bind(this)}));
                        this._detailStringBindingComplete = true
                    }
                    else if (this.media.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeason) {
                        this._loadLocalSeriesInfo();
                        binding = WinJS.Binding.bind(this.media, {description: this._formatDetailString.bind(this)});
                        this._detailStringBindingComplete = true
                    }
                    else if (this.media === this.episode || MS.Entertainment.Platform.PlaybackHelpers.isTVEpisode(this.media)) {
                        binding = WinJS.Binding.bind(this.media, {
                            rightsHydrated: this._formatDetailString.bind(this), description: this._formatDetailString.bind(this), libraryDefinitions: this._formatDetailString.bind(this)
                        });
                        this._detailEpisodeStringBindingComplete = true
                    }
                    if (binding)
                        this.mediaBindings.push(binding);
                    this._formatDetailString();
                    this._setupSmartBuy();
                    var animations = [];
                    var episodeShown = !WinJS.Utilities.hasClass(this._episodeContent, "hideFromDisplay");
                    if (this.showEpisode) {
                        if (!episodeShown)
                            animations.push(MS.Entertainment.Utilities.showElement(this._episodeContent))
                    }
                    else if (episodeShown)
                        animations.push(MS.Entertainment.Utilities.hideElement(this._episodeContent));
                    WinJS.Promise.join(animations).done(function animationsComplete() {
                        if (this.showEpisode) {
                            if (this._actionButtons.restoreFocus)
                                this._actionButtons.restoreFocus(true);
                            else
                                MS.Entertainment.UI.Framework.focusFirstInSubTree(this._actionButtons.domElement);
                            var lists = [this._latestEpisodeList, this._episodeList, this._extraEpisodeList];
                            lists.forEach(function(list) {
                                if (list) {
                                    var item = list.getCurrentItem();
                                    if (item && item.hasFocus) {
                                        this._activeEpisodeList = list;
                                        this._selectedEpisodeIndex = item.index
                                    }
                                }
                            }.bind(this))
                        }
                        else {
                            var activeEpisodeList = this._activeEpisodeList;
                            var indexToFocus = this._selectedEpisodeIndex;
                            if (!this._activeEpisodeList) {
                                activeEpisodeList = this.showLatestEpisodes ? this._latestEpisodeList : this._episodeList;
                                indexToFocus = 0
                            }
                            activeEpisodeList.setCurrentItem({
                                index: indexToFocus, hasFocus: true, showFocus: MS.Entertainment.Framework.KeyboardInteractionListener.showKeyboardFocus
                            })
                        }
                    }.bind(this))
                }, _releaseMedia: function _releaseMedia() {
                    MS.Entertainment.Pages.BaseMediaInlineDetails.prototype._releaseMedia.apply(this, arguments);
                    if (this._episodeListHooked) {
                        this._episodeList.domElement.removeEventListener("iteminvoked", this._onEpisodeListItemClickCallback);
                        this._episodeListHooked = false
                    }
                    if (this._latestEpisodeListHooked) {
                        this._latestEpisodeList.domElement.removeEventListener("iteminvoked", this._onEpisodeListItemClickCallback);
                        this._latestEpisodeListHooked = false
                    }
                    if (this._extraEpisodeListHooked) {
                        this._extraEpisodeList.domElement.removeEventListener("iteminvoked", this._onEpisodeListItemClickCallback);
                        this._extraEpisodeListHooked = false
                    }
                    if (this.episodesQuery) {
                        this.episodesQuery.dispose();
                        this.episodesQuery = null
                    }
                    if (this._fileTransferListenerId) {
                        var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                        var listenerId = this._fileTransferListenerId;
                        if (!this.showEpisode)
                            listenerId = listenerId + "_season";
                        fileTransferService.unregisterListener(listenerId)
                    }
                }, _setupSmartBuy: function _setupSmartBuy() {
                    if (this.showEpisode) {
                        var that = this;
                        var smartBuyButtonsChanged = function smartButtonsChanged(stateInfo) {
                                return MS.Entertainment.ViewModels.VideoSmartBuyStateEngine.prototype.onVideoInlineDetailsStateChanged.call(this, stateInfo).then(function refreshedButtons(buttons) {
                                        if (that._actionButtons.restoreFocus)
                                            that._actionButtons.restoreFocus(true);
                                        else
                                            MS.Entertainment.UI.Framework.focusFirstInSubTree(that._actionButtons.domElement);
                                        return buttons
                                    })
                            };
                        if (this.smartBuyStateEngine)
                            this.smartBuyStateEngine.initialize(this.media, MS.Entertainment.ViewModels.SmartBuyButtons.getEpisodeDetailsButtons(this.media, MS.Entertainment.UI.Actions.ExecutionLocation.popover), smartBuyButtonsChanged)
                    }
                    else if (this.media.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeason)
                        if (this.smartBuyStateEngine)
                            this.smartBuyStateEngine.initialize(this.media, MS.Entertainment.ViewModels.SmartBuyButtons.getTVSeasonInlineDetailsButtons(this.media, MS.Entertainment.UI.Actions.ExecutionLocation.popover), MS.Entertainment.ViewModels.VideoSmartBuyStateEngine.prototype.onTVSeasonInlineDetailsStateChanged)
                }, _handleError: function _handleError() {
                    if (this.media.inCollection)
                        this._loadLocalSeriesInfo();
                    MS.Entertainment.Pages.BaseMediaInlineDetails.prototype._handleError.apply(this, arguments)
                }, _loadLocalSeriesInfo: function _loadLocalSeriesInfo() {
                    var loadEpisodesPromise = this._loadLocalEpisodes();
                    var loadSeriesPromise = this._loadSeriesInfo();
                    WinJS.Promise.join([loadEpisodesPromise, loadSeriesPromise]).then(function() {
                        this._showPanel()
                    }.bind(this))
                }, _loadLocalEpisodes: function loadLocalEpisodes() {
                    var completion;
                    var promise = new WinJS.Promise(function(c, e, p) {
                            completion = c
                        });
                    if (!this.media.inCollection || this.showEpisode) {
                        completion();
                        return
                    }
                    var query = new MS.Entertainment.Data.Query.libraryVideoTV;
                    query.seasonId = this.media.libraryId;
                    query.sort = Microsoft.Entertainment.Queries.VideosSortBy.seriesTitleSeasonNumberEpisodeNumber;
                    query.isLive = true;
                    query.execute().then(function queryComplete(q) {
                        if (!this.episodes) {
                            this._parseEpisodes(q.result.items);
                            this.episodesQuery = query;
                            this._hideShowEpisodeList()
                        }
                        completion()
                    }.bind(this));
                    return promise
                }, _hasVideoRating: function hasVideoRating(rating) {
                    var lowerCased = rating && rating.toLowerCase();
                    if (!lowerCased)
                        return false;
                    switch (lowerCased) {
                        case MS.Entertainment.Data.Augmenter.Marketplace.edsVideoRating.nr:
                        case MS.Entertainment.Data.Augmenter.Marketplace.edsVideoRating.notRated:
                        case MS.Entertainment.Data.Augmenter.Marketplace.edsVideoRating.unrated:
                            return false
                    }
                    return true
                }, _loadSeriesInfo: function _loadSeriesInfo() {
                    var completion;
                    var promise = new WinJS.Promise(function(c, e, p) {
                            completion = c
                        });
                    if (this.media.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeason && !this._isOnline) {
                        this._loadLocalEpisodes();
                        completion()
                    }
                    else if (this.media.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeason && this.media.seriesId && this.media.seriesId !== MS.Entertainment.Utilities.EMPTY_GUID) {
                        var series = this.series;
                        if (!series) {
                            series = new MS.Entertainment.Data.Augmenter.Marketplace.Video.EdsTVSeries;
                            series.serviceId = this.media.seriesId;
                            series.serviceIdType = this.media.seriesIdType
                        }
                        series.hydrate().done(function populateSeriesInfo() {
                            this.media.genre = series.genre;
                            if (!this._hasVideoRating(this.media.rating))
                                this.media.rating = series.rating;
                            if (this.media.seasonNumber > 0 && series.seasons)
                                series.seasons.itemsFromIndex(0).done(function processItems(args) {
                                    for (var x = 0; x < args.items.length; x++)
                                        if (this.media.seasonNumber === args.items[x].data.seasonNumber) {
                                            this.media.releaseDate = this.media.releaseDate || args.items[x].data.releaseDate;
                                            this.media.episodeCount = this.media.episodeCount || args.items[x].data.episodeCount;
                                            this.media.description = this.media.description || args.items[x].data.description;
                                            this.media.rights = this.media.rights || args.items[x].data.rights;
                                            this.media.isComplete = this.media.isComplete || args.items[x].data.isComplete;
                                            break
                                        }
                                    if (this.showEpisode)
                                        this._formatDetailString();
                                    completion()
                                }.bind(this));
                            else {
                                this._formatDetailString();
                                completion()
                            }
                        }.bind(this), function seriesInfoError() {
                            this._loadLocalEpisodes();
                            completion()
                        }.bind(this))
                    }
                    return promise
                }, _onEpisodeListItemClick: function TVSeriesInlineDetails_onEpisodeListItemClick(event) {
                    this.description = String.empty;
                    MS.Entertainment.Utilities.hideElement(this._seasonContent).done(function loadEpisode() {
                        event.detail.itemPromise.then(function getItemData(data) {
                            this.episode = data.data;
                            this._setMedia(this.episode);
                            MS.Entertainment.Utilities.showElement(this._episodeContent)
                        }.bind(this))
                    }.bind(this))
                }, _backFromEpisode: function _backFromEpisode() {
                    this.episode = null;
                    this._seasonContent.setAttribute("data-ent-showanimation", "enterPage");
                    this.description = String.empty;
                    MS.Entertainment.Utilities.hideElement(this._episodeContent).done(function loadSeason() {
                        this._setMedia(this.season);
                        MS.Entertainment.Utilities.showElement(this._seasonContent)
                    }.bind(this))
                }, _canNavigateBackfromEpisode: function _canNavigateBackfromEpisode() {
                    return this.showEpisode && (this.season || this.series)
                }, _updateShowBackButton: function _updateShowBackButton() {
                    var showBackButton = this._canNavigateBackfromEpisode() && MS.Entertainment.Utilities.isApp1;
                    if (showBackButton !== this.showBackButton)
                        this.showBackButton = showBackButton
                }, _formatDetailString: function formatDetailString() {
                    if (this.showEpisode)
                        return this._formatEpisodeDetailString();
                    if (this.series)
                        return this._formatSeriesDetailString();
                    return this._formatSeasonDetailString()
                }, _formatSeasonDetailString: function formatDetailString() {
                    if (!this._detailStringBindingComplete)
                        return;
                    if (!this.media.rightsHydrated)
                        return;
                    var values = [];
                    var releaseDate = this._getReleaseDate();
                    if (releaseDate)
                        values.push(releaseDate);
                    if (this.media.rating)
                        values.push(this.media.rating);
                    var genres = this._getGenres();
                    if (genres)
                        values.push(genres);
                    var episodesLabel = this._getEpisodeCountLabel();
                    if (episodesLabel)
                        values.push(episodesLabel);
                    var detailString = values.join(String.load(String.id.IDS_DETAILS_INFO_SEPERATOR));
                    if (this.detailString !== detailString)
                        this.detailString = detailString;
                    if (!this.detailString)
                        this.detailString = " ";
                    this._updateDescription()
                }, _formatSeriesDetailString: function _formatSeriesDetailString() {
                    if (!this._detailStringBindingComplete)
                        return;
                    if (!this.series.rightsHydrated && this.series.mediaType !== Microsoft.Entertainment.Queries.ObjectType.tvSeries)
                        return;
                    var values = [];
                    if (this.originalLocation === MS.Entertainment.Data.ItemLocation.collection && this.series.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeason)
                        if (this.series.seasonNumber <= 0)
                            values.push(String.load(String.id.IDS_TV_SEASON_0_NAME));
                        else
                            values.push(String.load(String.id.IDS_TV_SEASON_NAME).format(this.series.seasonNumber));
                    var genres = this._getGenres();
                    if (genres)
                        values.push(genres);
                    if (this.series.rating)
                        values.push(this.series.rating);
                    var seasonsLabel = this._getSeasonCountLabel();
                    if (seasonsLabel)
                        values.push(seasonsLabel);
                    var seriesDetailString = values.join(String.load(String.id.IDS_DETAILS_INFO_SEPERATOR));
                    if (this.seriesDetailString !== seriesDetailString)
                        this.seriesDetailString = seriesDetailString;
                    if (!this.seriesDetailString)
                        this.seriesDetailString = " ";
                    this._updateDescription()
                }, _formatEpisodeDetailString: function formatEpisodeDetailString() {
                    if (!this._detailEpisodeStringBindingComplete)
                        return;
                    if (!this.media.rightsHydrated)
                        return;
                    var episodeDetailString = MS.Entertainment.Formatters.formatEpisodeMetadata(this.media, {
                            releaseDate: true, genres: true, network: true, languages: true, rating: true, videoDefinition: true, duration: true
                        });
                    if (this.episodeDetailString !== episodeDetailString)
                        this.episodeDetailString = episodeDetailString;
                    if (!this.episodeDetailString)
                        this.episodeDetailString = " ";
                    var seasonNumberEpisodeNumberString = MS.Entertainment.Formatters.formatTVSeasonEpisodeNumberInt(this.media);
                    if (this.seasonNumberEpisodeNumberString !== seasonNumberEpisodeNumberString)
                        this.seasonNumberEpisodeNumberString = seasonNumberEpisodeNumberString;
                    if (!this.seasonNumberEpisodeNumberString)
                        this.seasonNumberEpisodeNumberString = " ";
                    this._updateDescription()
                }, _updateDescription: function _updateDescription() {
                    if (this.showEpisode) {
                        if (this.description !== this.media.description && this.episodeDetailString && this.episodeDetailString !== " ")
                            this.description = this.media.description
                    }
                    else if (this.series) {
                        if (this.description !== this.series.description && this.seriesDetailString && this.seriesDetailString !== " ")
                            this.description = this.series.description
                    }
                    else if (this.description !== this.media.description && this.detailString && this.detailString !== " ")
                        this.description = MS.Entertainment.Utilities.isVideoApp1 ? this.media.description : null
                }, _hideShowEpisodeList: function _hideShowEpisodeList() {
                    if (!this.showEpisode && this.episodes && this.episodes.length > 0) {
                        this._episodeList.domElement.addEventListener("iteminvoked", this._onEpisodeListItemClickCallback, false);
                        this._episodeListHooked = true;
                        this._showElement(this._episodesPanel, true)
                    }
                    else
                        this._showElement(this._episodesPanel, false);
                    if (!this.showEpisode && this.latestEpisodes && this.latestEpisodes.length > 0) {
                        this._latestEpisodeList.domElement.addEventListener("iteminvoked", this._onEpisodeListItemClickCallback, false);
                        this._latestEpisodeListHooked = true;
                        this._showElement(this._latestEpisodesPanel, true)
                    }
                    else
                        this._showElement(this._latestEpisodesPanel, false);
                    if (!this.showEpisode && this.extraEpisodes && this.extraEpisodes.length > 0) {
                        this._extraEpisodeList.domElement.addEventListener("iteminvoked", this._onEpisodeListItemClickCallback, false);
                        this._extraEpisodeListHooked = true;
                        this._showElement(this._extraEpisodesPanel, true)
                    }
                    else
                        this._showElement(this._extraEpisodesPanel, false)
                }, _parseEpisodes: function _parseEpisodes(episodes) {
                    this.episodes = episodes === null ? null : [];
                    this.extraEpisodes = episodes === null ? null : [];
                    if (episodes && episodes.count > 0) {
                        var sevenDaysInMilliseconds = MS.Entertainment.Formatters.milliSecondsFromTimeSpan(7);
                        episodes.itemsFromIndex(0, 0, episodes.count).done(function gotLatestEpisode(latestEpisodes) {
                            var latestEpisode = null;
                            if (latestEpisodes && latestEpisodes.items && latestEpisodes.items.length > 0) {
                                var foundLatestAired = false;
                                var index = latestEpisodes.items.length - 1;
                                while (index >= 0) {
                                    latestEpisode = latestEpisodes.items[index].data;
                                    if (MS.Entertainment.Utilities.isVideoApp2 || latestEpisode.episodeNumber > 0)
                                        this.episodes.unshift(latestEpisode);
                                    else
                                        this.extraEpisodes.unshift(latestEpisode);
                                    if (!foundLatestAired) {
                                        var todayDateOnly = new Date;
                                        todayDateOnly.setTime(Date.now());
                                        todayDateOnly.setHours(0, 0, 0, 0);
                                        var latestEpisodeDateOnly = new Date;
                                        latestEpisodeDateOnly.setTime(latestEpisode.releaseDate);
                                        latestEpisodeDateOnly.setHours(0, 0, 0, 0);
                                        var deltaDates = todayDateOnly - latestEpisodeDateOnly;
                                        if (latestEpisode && (deltaDates >= 0 && deltaDates <= sevenDaysInMilliseconds))
                                            this.latestEpisodes = [latestEpisode];
                                        else
                                            this.latestEpisodes = [];
                                        foundLatestAired = deltaDates >= 0
                                    }
                                    index--
                                }
                            }
                            else
                                this.latestEpisodes = [];
                            this.showLatestEpisodes = MS.Entertainment.Utilities.isVideoApp1 && this.latestEpisodes.length > 0;
                            this.showExtraEpisodes = MS.Entertainment.Utilities.isVideoApp1 && this.extraEpisodes.length > 0;
                            this.showEpisodes = this.episodes.length > 0
                        }.bind(this))
                    }
                    else {
                        this.latestEpisodes = [];
                        this.showEpisodes = false;
                        this.showLatestEpisodes = false;
                        this.showExtraEpisodes = false
                    }
                }, _getReleaseDate: function getReleaseDate() {
                    var releaseDate = null;
                    if (this.media.releaseDate) {
                        var formatter = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).year;
                        if (MS.Entertainment.Platform.PlaybackHelpers.isTVEpisode(this.media))
                            formatter = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).shortDate;
                        var date = new Date(this.media.releaseDate);
                        releaseDate = formatter.format(date)
                    }
                    return releaseDate
                }, _getGenres: function getGenres() {
                    var genres = null;
                    if (this.media.genre)
                        if (Array.isArray(this.media.genre)) {
                            var genreNames = [];
                            this.media.genre.forEach(function(genre) {
                                if (genre)
                                    genreNames.push(genre.name)
                            });
                            genres = genreNames.join(String.load(String.id.IDS_DETAILS_INFO_SEPERATOR))
                        }
                        else
                            genres = this.media.genre;
                    else if (this.media.genreName)
                        genres = this.media.genreName;
                    return genres
                }, _getSeasonCountLabel: function getSeasonCountLabel() {
                    var label = null;
                    if (this.series.seasonCount && this.series.seasonCount > 0)
                        label = MS.Entertainment.Formatters.seasonCountText(this.series.seasonCount);
                    return label
                }, _getEpisodeCountLabel: function getEpisodeCountLabel() {
                    var label = null;
                    var formattedNum;
                    if (this.media.episodeCount && this.media.episodeCount > 0) {
                        var stringId = String.id.IDS_TV_EPISODES_LABEL;
                        if (this.media.episodeCount === 1)
                            stringId = String.id.IDS_TV_EPISODE_LABEL;
                        formattedNum = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber.format(this.media.episodeCount);
                        label = String.load(stringId).format(formattedNum)
                    }
                    return label
                }
        }, {
            _episodeList: null, _latestEpisodeList: null, _extraEpisodeList: null, _onEpisodeListItemClickCallback: null, _onBackFromEpisodeClickCallback: null, _episodeListHooked: false, _latestEpisodeListHooked: false, _extraEpisodeListHooked: false, episodes: null, showEpisodes: false, latestEpisodes: null, showLatestEpisodes: false, extraEpisodes: null, showExtraEpisodes: false, episodeDetailString: null, seasonNumberEpisodeNumberString: null, seriesDetailString: null, description: null, episodesQuery: null, episode: null, showEpisode: false, showBackButton: false, season: null, series: null, seasonSelections: null, modifierSelectionManager: null
        })});
    WinJS.Namespace.define("MS.Entertainment.Pages", {TvSeriesInlineDetailsFullScreen: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.Pages.TvSeriesInlineDetails", "/Components/InlineDetails/TvSeriesInlineDetails.html#tvSeriesInlineDetailsFullScreenTemplate", function TvSeriesInlineDetailsFullScreen(){}, {}, {})})
})()
