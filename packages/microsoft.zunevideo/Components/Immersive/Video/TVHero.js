/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/debug.js", "/Framework/Utilities.js", "/Components/Immersive/Video/VideoHero.js");
(function() {
    "use strict";
    var MSEPlatform = WinJS.Namespace.define("MS.Entertainment.Platform", null);
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {
        TvHeroImageControl: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Shell.ImageControl", null, function(element, options){}, {hide: function hide(element) {
                try {
                    if (this.domElement && this.domElement.src && this.domElement.src !== this.defaultImagePath)
                        this._setImgSrc(this.defaultImagePath)
                }
                catch(e) {
                    fxassert(false, "Error setting image URL: " + result);
                    this._handleError()
                }
            }}), ImmersiveTvHero: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.ImmersiveVideoHero", "/Components/Immersive/Video/TVHero.html#ImmersiveTvHero", function immersiveTvHero(){}, {
                _bindings: null, _selectedSeasonBinds: null, _networkStatusBinds: null, _signedInBinding: null, controlName: "ImmersiveTvHero", ownedEpisodeCount: null, initialize: function initialize() {
                        MS.Entertainment.UI.Controls.ImmersiveVideoHero.prototype.initialize.call(this);
                        this.viewModel = this.dataContext.tvImmersiveViewModel;
                        this._bindings = WinJS.Binding.bind(this, {
                            dataContext: {
                                heroImageMediaItem: this._heroImageMediaItemChanged.bind(this), season: this._heroImageMediaItemChanged.bind(this)
                            }, viewModel: {
                                    season: this.onChangeSeason.bind(this), libraryEpisodes: {count: this.onLibraryEpisodesChange.bind(this)}
                                }
                        });
                        if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.uiState)) {
                            var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                            this._networkStatusBinds = WinJS.Binding.bind(uiStateService, {networkStatus: this._onNetworkStatusChanged.bind(this)})
                        }
                        this._setSeasonFromSeries(this.dataContext.series, this.dataContext.season);
                        if (MS.Entertainment.UI.Framework.animationsEnabled) {
                            var logPerfTrace = function logPerfTrace() {
                                    MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioTVDetailsRequest();
                                    this.domElement.removeEventListener("animationstart", logPerfTrace)
                                }.bind(this);
                            this.domElement.addEventListener("animationstart", logPerfTrace)
                        }
                        else
                            MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioTVDetailsRequest()
                    }, unload: function unload() {
                        if (this._signedInBinding) {
                            this._signedInBinding.cancel();
                            this._signedInBinding = null
                        }
                        if (this._bindings) {
                            this._bindings.cancel();
                            this._bindings = null
                        }
                        if (this._selectedSeasonBinds) {
                            this._selectedSeasonBinds.cancel();
                            this._selectedSeasonBinds = null
                        }
                        if (this._networkStatusBinds) {
                            this._networkStatusBinds.cancel();
                            this._networkStatusBinds = null
                        }
                        MS.Entertainment.UI.Controls.ImmersiveVideoHero.prototype.unload.call(this)
                    }, thaw: function thaw() {
                        MS.Entertainment.UI.Controls.ImmersiveVideoHero.prototype.thaw.call(this)
                    }, onChangeSeason: function onChangeSeason() {
                        if (this.viewModel && this.viewModel.season && this.viewModel.season.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeason) {
                            this._setSeasonFromSeries(this.viewModel.series, this.viewModel.season);
                            this.dataContext.heroImageMediaItem = this.viewModel.season
                        }
                    }, onLibraryEpisodesChange: function onLibraryEpisodesChange() {
                        if (this.viewModel.libraryEpisodes && this.viewModel.libraryEpisodes.count) {
                            var countLibraryEpisodes = {};
                            var fromSource = false;
                            var listProperty = "_data";
                            if (!this.viewModel.libraryEpisodes._data.length) {
                                listProperty = "_source";
                                fromSource = true
                            }
                            this.viewModel.libraryEpisodes[listProperty].forEach(function countEpisodes(episode) {
                                var seasonNumber = fromSource ? episode.seasonNumber : (episode.data && episode.data.seasonNumber);
                                if (countLibraryEpisodes[seasonNumber])
                                    countLibraryEpisodes[seasonNumber]++;
                                else
                                    countLibraryEpisodes[seasonNumber] = 1
                            });
                            this.ownedEpisodeCount = countLibraryEpisodes;
                            if (this.seasonSelections)
                                this.seasonSelections.forEach(function walkSeasonModifierList(item) {
                                    if (this.ownedEpisodeCount && typeof(item.season.seasonNumber) === "number")
                                        item.ownedEpisodes = this.ownedEpisodeCount[item.season.seasonNumber] || 0
                                }.bind(this))
                        }
                    }, _modifierSelectedItemChangedCallback: function _modifierSelectedItemChangedCallback() {
                        if (this.viewModel.series && (this.viewModel.series.seasons || this.viewModel.series.librarySeasons) && this.modifierSelectionManager.selectedItem && this.modifierSelectionManager.selectedItem.season) {
                            MS.Entertainment.Framework.assert(this.modifierSelectionManager.selectedItem.season.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeason, "Non-season used in the season drop down in tv series inline details");
                            if (this.modifierSelectionManager.selectedItem.season.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeason)
                                this.viewModel.setSeason(this.modifierSelectionManager.selectedItem.season)
                        }
                    }, _setSeasonFromSeries: function _setSeasonFromSeries(series, selectedSeason) {
                        series = MS.Entertainment.ViewModels.MediaItemModel.augment(series);
                        this.series = series;
                        var isOnline = MS.Entertainment.UI.NetworkStatusService.isOnline();
                        var seasons = (isOnline && series.seasons) ? series.seasons : series.librarySeasons;
                        MS.Entertainment.Framework.assert(!seasons || seasons.toArrayAll, "For some reason the seasons list does not support toArrayAll");
                        if (seasons && seasons.toArrayAll)
                            seasons.toArrayAll().then(function(seasonItems) {
                                var nonExtraSeasons = [];
                                for (var i = 0; i < seasonItems.length; i++) {
                                    var seasonNumber = seasonItems[i].seasonNumber;
                                    if (seasonNumber !== 0)
                                        nonExtraSeasons.push(seasonItems[i])
                                }
                                return WinJS.Promise.wrap(nonExtraSeasons)
                            }.bind(this)).then(function(items) {
                                this._updateFromSeasonsArray(items, selectedSeason)
                            }.bind(this))
                    }, _updateFromSeasonsArray: function _updateFromSeasonsArray(seasons, selectedSeason) {
                        this.seasonSelections = [];
                        var selectedIndex = seasons.length - 1;
                        for (var i = 0; i < seasons.length; i++) {
                            var item = null;
                            if (MS.Entertainment.Utilities.isVideoApp1)
                                item = {
                                    season: seasons[i], label: MS.Entertainment.Formatters.formatTVSeasonNumberInt(seasons[i].seasonNumber, true), templateOverride: "/Controls/Video/SeasonModifier.html#seasonModifierPopupEntry", ownedEpisodes: this.ownedEpisodeCount && typeof(seasons[i].seasonNumber) === "number" && this.ownedEpisodeCount[seasons[i].seasonNumber] ? this.ownedEpisodeCount[seasons[i].seasonNumber] : 0
                                };
                            else
                                item = {
                                    season: seasons[i], label: MS.Entertainment.Formatters.formatTVSeasonNumberInt(seasons[i].seasonNumber, true)
                                };
                            this.seasonSelections.push(item);
                            if (selectedSeason && this._isPartOfSeason(seasons[i], selectedSeason))
                                selectedIndex = i
                        }
                        if (this._selectedSeasonBinds) {
                            this._selectedSeasonBinds.cancel();
                            this._selectedSeasonBinds = null
                        }
                        this.modifierSelectionManager = new MS.Entertainment.UI.Framework.SelectionManager(this.seasonSelections, selectedIndex);
                        if (this.dataContext.tvImmersiveViewModel.setSeason)
                            this._selectedSeasonBinds = WinJS.Binding.bind(this.modifierSelectionManager, {selectedItem: this._modifierSelectedItemChangedCallback.bind(this)})
                    }, _onNetworkStatusChanged: function _onNetworkStatusChanged(status, oldStatus) {
                        var selectedSeason = null;
                        if (this.modifierSelectionManager && this.modifierSelectionManager.selectedItem)
                            selectedSeason = this.modifierSelectionManager.selectedItem.season;
                        if (oldStatus && selectedSeason)
                            if (MS.Entertainment.UI.NetworkStatusService.isOnline())
                                this._setSeasonFromSeries(this.series, selectedSeason);
                            else if (this.seasonSelections && this.seasonSelections.length > 0) {
                                var offlineSeasons = [];
                                var hydrationPromises = [];
                                for (var i = 0; i < this.seasonSelections.length; i++)
                                    if (this.seasonSelections[i] && this.seasonSelections[i].season) {
                                        MS.Entertainment.Framework.assert(this.seasonSelections[i].season, "Modifier season not found");
                                        hydrationPromises.push(MS.Entertainment.ViewModels.MediaItemModel.hydrateLibraryInfoAsync(this.seasonSelections[i].season))
                                    }
                                WinJS.Promise.join(hydrationPromises).done(function hydratedLibraryInfo() {
                                    for (var i = 0; i < this.seasonSelections.length; i++)
                                        if (this.seasonSelections[i] && this.seasonSelections[i].season) {
                                            var season = this.seasonSelections[i].season;
                                            MS.Entertainment.Framework.assert(season, "Modifier season not found");
                                            if (season && (season.inCollection || season.isEqual(selectedSeason)))
                                                offlineSeasons.push(season)
                                        }
                                    this._updateFromSeasonsArray(offlineSeasons, selectedSeason)
                                }.bind(this))
                            }
                    }, _isPartOfSeason: function _isPartOfSeason(seasonItem, selectedSeason) {
                        MS.Entertainment.Framework.assert(seasonItem, "seasonItem is not defined");
                        MS.Entertainment.Framework.assert(selectedSeason, "selectedSeason is not defined");
                        if (!MS.Entertainment.Utilities.isEmptyGuid(seasonItem.edsId) && (seasonItem.edsId === selectedSeason.canonicalSeasonId || seasonItem.edsId === selectedSeason.serviceId))
                            return true;
                        if (!MS.Entertainment.Utilities.isEmptyGuid(seasonItem.serviceId) && seasonItem.serviceId === selectedSeason.serviceId)
                            return true;
                        if (!MS.Entertainment.Utilities.isEmptyGuid(seasonItem.zuneId) && seasonItem.zuneId === selectedSeason.serviceId)
                            return true;
                        return false
                    }
            }, {
                mediaTypeClassName: MS.Entertainment.UI.Controls.VideoHeroMediaTypes.tv, modifierSelectionManager: null, seasonSelections: null, viewModel: null
            }, {cssSelectors: {immersiveSecondaryText: '.immersiveDetails .currentPage .immersivePageTitle .immersiveSecondaryText'}})
    })
})()
