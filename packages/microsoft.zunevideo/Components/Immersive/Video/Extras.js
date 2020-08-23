/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Framework/corefx.js", "/Framework/debug.js", "/Framework/Utilities.js", "/Controls/listControls.js");
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {ExtrasList: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.EpisodeList", "/Components/Immersive/Video/TVImmersiveTemplates.html#tvExtrasListTemplate", function episodeListConstructor(){}, {
            showExtrasViewMore: false, initializeEpisodeListControls: function initializeEpisodeListControls() {
                    this._episodeListControls = [this._extraEpisodeList, this._seriesExtrasList]
                }, initialize: function initialize() {
                    this.extraEpisodes = new MS.Entertainment.ObservableArray;
                    this.seriesExtras = new MS.Entertainment.ObservableArray;
                    MS.Entertainment.UI.Controls.EpisodeList.prototype.initialize.call(this)
                }, frameVisible: function frameVisible() {
                    return (this.extraEpisodes && this.extraEpisodes.length > 0) || (this.seriesExtras && this.seriesExtras.length > 0)
                }, _checkToShowViewMore: function _checkToShowViewMore() {
                    this.showExtraEpisodes = this.extraEpisodes && this.extraEpisodes.length > 0;
                    this.showSeriesExtras = this.seriesExtras && this.seriesExtras.length > 0;
                    this.showExtrasHeading = this.showExtraEpisodes || this.showSeriesExtras;
                    if (this.dataContext.maxItems) {
                        var numberOfEpisodesToDisplay = Math.max(this.dataContext.maxItems, this.dataContext.maxItems - this.extraEpisodes.length);
                        if (this.extraEpisodes && this.extraEpisodes.length > numberOfEpisodesToDisplay) {
                            this.extraEpisodes.splice(numberOfEpisodesToDisplay, this.extraEpisodes.length - numberOfEpisodesToDisplay);
                            this.showExtrasViewMore = true
                        }
                        numberOfEpisodesToDisplay -= this.extraEpisodes.length;
                        if (this.seriesExtras && this.seriesExtras.length > numberOfEpisodesToDisplay) {
                            this.seriesExtras.splice(numberOfEpisodesToDisplay > 0 ? numberOfEpisodesToDisplay : 0, this.seriesExtras.length - numberOfEpisodesToDisplay);
                            this.showExtrasViewMore = true
                        }
                    }
                    this._showViewMore(this.showExtrasViewMore);
                    this._scrollToTop()
                }, seasonChanged: function seasonChanged(season, oldSeason) {
                    if ((season && season !== oldSeason) && (!oldSeason || (season.serviceId !== oldSeason.serviceId)))
                        this.showExtrasViewMore = false;
                    MS.Entertainment.UI.Controls.EpisodeList.prototype.seasonChanged.apply(this, arguments)
                }, _additonalEpisodeParsing: function _additonalEpisodeParsing() {
                    var series = MS.Entertainment.ViewModels.MediaItemModel.augment(this.dataContext.tvImmersiveViewModel.series);
                    MS.Entertainment.Framework.assert(series, "The TV Series object cannot be undefined.");
                    var seasons = MS.Entertainment.UI.NetworkStatusService.isOnline() ? series.seasons : series.librarySeasons;
                    MS.Entertainment.Framework.assert(!seasons || seasons.toArrayAll, "For some reason the seasons list does not support toArrayAll");
                    if (seasons && seasons.toArrayAll)
                        seasons.toArrayAll().then(function(items) {
                            this._parseSeasons(items)
                        }.bind(this))
                }, _parseSeasons: function _parseSeasons(seasons) {
                    var seasonHydrationPromise = WinJS.Promise.wrap();
                    this.seriesExtras.clear();
                    this.showSeriesExtras = false;
                    for (var i = 0; seasons && i < seasons.length; i++) {
                        var currentSeason = seasons[i];
                        if (currentSeason.seasonNumber == 0) {
                            seasonHydrationPromise = currentSeason.hydrate();
                            break
                        }
                    }
                    return seasonHydrationPromise.then(function seasonHydrated(season) {
                            if (season && season.episodes) {
                                season.episodes.itemsFromIndex(0).then(function scanEpisodes(episodes) {
                                    for (var i = 0; i < episodes.items.length; i++)
                                        this.seriesExtras.push(episodes.items[i].data)
                                }.bind(this));
                                this.showSeriesExtras = this.seriesExtras.length > 0;
                                this.showExtrasHeading = this.showExtraEpisodes || this.showSeriesExtras;
                                this._checkToShowViewMore();
                                this.showFrameWhenReady()
                            }
                        }.bind(this))
                }, _parseEpisodes: function _parseEpisodes(episodes, featuredEpisode) {
                    this.extraEpisodes.clear();
                    this.showExtraEpisodes = false;
                    return MS.Entertainment.UI.Controls.EpisodeList.prototype._parseEpisodes.apply(this, arguments)
                }, _processExtraEpisode: function _processExtraEpisode(extrasEpisode) {
                    this.extraEpisodes.push(extrasEpisode);
                    return MS.Entertainment.UI.Controls.EpisodeList.prototype._processExtraEpisode.call(this)
                }
        }, {
            extraEpisodes: null, seriesExtras: null, showExtrasHeading: false, showSeriesExtras: false, showExtraEpisodes: false, showExtrasViewMore: false
        }, {cssSelectors: {
                episodeViewMore: ".currentPage .tvExtrasFrame .viewMoreRow .template-moreButton .win-focusable", episodeItem: ".currentPage .tvEpisodeListPanel .tvEpisodeExtraContainer .template-episodeListExtraItem"
            }})})
})()
