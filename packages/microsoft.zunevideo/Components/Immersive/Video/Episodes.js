/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Framework/corefx.js", "/Framework/debug.js", "/Framework/Utilities.js", "/Controls/listControls.js");
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {
        EpisodeItem: MS.Entertainment.UI.Framework.defineUserControl("/Components/Immersive/Video/TVImmersiveTemplates.html#tvEpisodeTemplate", function episodeItemConstructor(){}, {
            _bindings: null, initialize: function initialize() {
                    if (this.tvEpisodeDownloadStatusIcon.supportsDelayInitialization)
                        MS.Entertainment.Utilities.schedulePromiseNormal().done(function _delay() {
                            this.tvEpisodeDownloadStatusIcon.delayInitialize()
                        }.bind(this));
                    this._bindings = WinJS.Binding.bind(this, {mediaItem: this._mediaItemChanged.bind(this)});
                    this.showMediaStatusIcon = MS.Entertainment.Utilities.isApp1
                }, unload: function unload() {
                    if (this._bindings) {
                        this._bindings.cancel();
                        this._bindings = null
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, _mediaItemChanged: function _mediaItemChanged() {
                    this.showDuration = MS.Entertainment.Utilities.isApp1 && this.mediaItem && this.mediaItem.duration
                }, _onClick: function onClick() {
                    if (MS.Entertainment.Utilities.isApp2)
                        MS.Entertainment.UI.Controls.ImmersiveViewMore.dismissCurrentPopOver();
                    var popOverParameters = {itemConstructor: MS.Entertainment.Utilities.getTvInlineDetailsPopoverControl()};
                    popOverParameters.dataContext = {data: this.mediaItem};
                    MS.Entertainment.Platform.PlaybackHelpers.showItemDetails(popOverParameters)
                }, _onKeyDown: function _onKeyDown(event) {
                    if (event.keyCode === WinJS.Utilities.Key.enter || event.keyCode === WinJS.Utilities.Key.space)
                        this._onClick()
                }
        }, {
            showDuration: false, showMediaStatusIcon: false
        }), EpisodeList: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.BaseImmersiveSummary", "/Components/Immersive/Video/TVImmersiveTemplates.html#tvEpisodeListTemplate", function episodeListConstructor(){}, {
                _keyboardNavigationManager: null, _focusEventHandlers: null, _focusInitialized: false, _episodeListControls: null, _navigationEventHandlers: null, isViewMore: false, initializeEpisodeListControls: function initializeEpisodeListControls() {
                        this._episodeListControls = [this._episodeList, this._latestEpisodeList]
                    }, initialize: function initialize() {
                        this.latestEpisodes = new MS.Entertainment.ObservableArray;
                        this.episodes = new MS.Entertainment.ObservableArray;
                        this.initializeEpisodeListControls();
                        this._bindings = WinJS.Binding.bind(this.dataContext.tvImmersiveViewModel, {season: this.seasonChanged.bind(this)});
                        this._focusEventHandlers = [MS.Entertainment.Utilities.addEvents(this, {focusin: this._focusHandler.bind(this)})];
                        if (MS.Entertainment.Utilities.isApp1)
                            this.keyboardNavigationManager = new MS.Entertainment.Framework.VerticalKeyboardNavigationManager(this.domElement, null, true);
                        else
                            for (var control in this._episodeListControls) {
                                this._episodeListControls[control].keyboardNavigable = true;
                                if (this.isViewMore)
                                    this._focusEventHandlers.push(MS.Entertainment.UI.Framework.addEventHandlers(this._episodeListControls[control].domElement, {firstTimeRendered: this._forceFocusHandler.bind(this)}))
                            }
                        var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                        var page = WinJS.Binding.unwrap(navigationService.currentPage);
                        if (this._navigationEventHandlers) {
                            this._navigationEventHandlers.cancel();
                            this._navigationEventHandlers = null
                        }
                        this._navigationEventHandlers = MS.Entertainment.UI.Framework.addEventHandlers(page, {onNavigateTo: function onNavigateTo() {
                                for (var control in this._episodeListControls) {
                                    var listElement = this._episodeListControls[control] && this._episodeListControls[control].domElement;
                                    if (listElement)
                                        listElement.tabIndex = 0
                                }
                                this._focusInitialized = false
                            }.bind(this)})
                    }, showFrameWhenReady: function showFrameWhenReady() {
                        var promise = this.dataContext.previousSignal ? WinJS.Binding.unwrap(this.dataContext.previousSignal).promise : WinJS.Promise.wrap();
                        promise.done(function showFrame() {
                            this.visible = this.frameVisible();
                            if (this.dataContext.frame)
                                this.dataContext.frame.hideFrame(this.visible);
                            if (this.dataContext.visibleSignal) {
                                WinJS.Binding.unwrap(this.dataContext.visibleSignal).complete();
                                this.dataContext.visibleSignal = null
                            }
                        }.bind(this))
                    }, frameVisible: function frameVisible() {
                        return this.episodes && this.episodes.length > 0
                    }, unload: function unload() {
                        if (this._bindings) {
                            this._bindings.cancel();
                            this._bindings = null
                        }
                        if (this._episodeBindings) {
                            this._episodeBindings.cancel();
                            this._episodeBindings = null
                        }
                        if (this._seasonChangePromise) {
                            this._seasonChangePromise.cancel();
                            this._seasonChangePromise = null
                        }
                        if (this._focusEventHandlers) {
                            for (var focusEventHandler in this._focusEventHandlers)
                                this._focusEventHandlers[focusEventHandler].cancel();
                            this._focusEventHandlers = null
                        }
                        if (this._navigationEventHandlers) {
                            this._navigationEventHandlers.cancel();
                            this._navigationEventHandlers = null
                        }
                        MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                    }, _forceFocusHandler: function _forceFocusHandler() {
                        WinJS.Promise.timeout(1).done(function delayFocusFirstEpisode() {
                            this._focusHandler(true)
                        }.bind(this))
                    }, _focusHandler: function _focusHandler(event) {
                        var force = event === true;
                        var clickTarget = null;
                        if (event && event.target)
                            if (event.target.classList.contains("template-episodeListItem"))
                                clickTarget = event.target;
                            else if (event.target.parentElement && event.target.parentElement.classList.contains("template-episodeListItem"))
                                clickTarget = event.target.parentElement;
                        if (!this._focusInitialized || force) {
                            var querySelectorString = ".win-focusable";
                            var firstListItem = this.domElement.querySelector(querySelectorString);
                            var itemToFocus = firstListItem;
                            if (MS.Entertainment.Utilities.isApp1) {
                                var itemListElement = this._episodeList ? this._episodeList.domElement : null;
                                if (!this.isViewMore && MS.Entertainment.UI.Controls.EpisodeList.storedIndexOfItemForScroll >= 0 && itemToFocus && itemListElement && itemListElement.children && itemListElement.children[MS.Entertainment.UI.Controls.EpisodeList.storedIndexOfItemForScroll]) {
                                    var itemToScroll = itemListElement.children[MS.Entertainment.UI.Controls.EpisodeList.storedIndexOfItemForScroll];
                                    if (!clickTarget && itemToScroll)
                                        itemToScroll.scrollIntoView();
                                    itemToFocus = itemListElement.children[MS.Entertainment.UI.Controls.EpisodeList.storedIndexOfItemForScroll + 1].querySelector(querySelectorString) || itemToFocus
                                }
                                itemToFocus = clickTarget || itemToFocus;
                                if (itemToFocus)
                                    this.keyboardNavigationManager.setFocusedItem(itemToFocus, true)
                            }
                            else if (this.isViewMore && firstListItem)
                                MS.Entertainment.UI.Framework.focusElement(firstListItem);
                            if (!this._focusInitialized && firstListItem) {
                                this._focusEventHandlers.push(MS.Entertainment.Utilities.addEvents(firstListItem, {focusin: this._scrollToTop.bind(this)}));
                                for (var control in this._episodeListControls)
                                    this._episodeListControls[control].domElement.tabIndex = -1;
                                this._setControlFocusDirectionOverrides();
                                this._focusInitialized = true
                            }
                        }
                    }, _scrollToTop: function _scrollToTop() {
                        if (this.domElement)
                            this.domElement.scrollTop = 0;
                        if (this.isViewMore && this._episodeListPanel && this._episodeListPanel.children && this._episodeListPanel.children.length > 0)
                            this._episodeListPanel.children[0].scrollIntoView()
                    }, _setControlFocusDirectionOverrides: function _setControlFocusDirectionOverrides() {
                        if (this.isViewMore)
                            return;
                        var belowEpisodes = MS.Entertainment.UI.Controls.ImmersiveVideoHero.cssSelectors.noOp;
                        if (this.dataContext && this.dataContext.frame && !this.dataContext.frame.hideViewMoreIfEnoughSpace)
                            belowEpisodes = MS.Entertainment.UI.Controls.EpisodeList.cssSelectors.episodeViewMore;
                        var middleEpisodeFocusDirectionMap = JSON.stringify({});
                        var topEpisodeFocusDirectionMap = JSON.stringify({up: MS.Entertainment.UI.Controls.ImmersiveVideoHero.cssSelectors.noOp});
                        var bottomEpisodeFocusDirectionMap = JSON.stringify({down: belowEpisodes});
                        var bottomEpisodeItemClass = "bottomEpisodeItem";
                        var episodeItems = this.domElement.querySelectorAll(MS.Entertainment.UI.Controls.EpisodeList.cssSelectors.episodeItem);
                        if (episodeItems && episodeItems.length > 0) {
                            if (episodeItems.length === 1) {
                                var onlyEpisodeFocusDirectionMap = JSON.stringify({
                                        down: belowEpisodes, up: MS.Entertainment.UI.Controls.ImmersiveVideoHero.cssSelectors.noOp
                                    });
                                episodeItems[0].setAttribute("data-win-focus", onlyEpisodeFocusDirectionMap);
                                WinJS.Utilities.addClass(episodeItems[0], bottomEpisodeItemClass)
                            }
                            else {
                                episodeItems[0].setAttribute("data-win-focus", topEpisodeFocusDirectionMap);
                                WinJS.Utilities.removeClass(episodeItems[0], bottomEpisodeItemClass);
                                episodeItems[episodeItems.length - 1].setAttribute("data-win-focus", bottomEpisodeFocusDirectionMap);
                                WinJS.Utilities.addClass(episodeItems[episodeItems.length - 1], bottomEpisodeItemClass)
                            }
                            for (var i = 1; i < episodeItems.length - 1; i++) {
                                episodeItems[i].setAttribute("data-win-focus", middleEpisodeFocusDirectionMap);
                                WinJS.Utilities.removeClass(episodeItems[i], bottomEpisodeItemClass)
                            }
                        }
                        var bottomEpisodeItemSelector = ".currentPage ." + bottomEpisodeItemClass;
                        var episodeViewMoreItemFocusDirectionMap = JSON.stringify({
                                left: MS.Entertainment.UI.Controls.ImmersiveVideoHero.cssSelectors.tvHeroViewMore, down: MS.Entertainment.UI.Controls.ImmersiveVideoHero.cssSelectors.noOp, up: bottomEpisodeItemSelector
                            });
                        var episodeViewMore = document.querySelector(MS.Entertainment.UI.Controls.EpisodeList.cssSelectors.episodeViewMore);
                        if (episodeViewMore)
                            episodeViewMore.setAttribute("data-win-focus", episodeViewMoreItemFocusDirectionMap)
                    }, seasonChanged: function seasonChanged(season, oldSeason) {
                        if ((season && season !== oldSeason) && (!oldSeason || (season.serviceId !== oldSeason.serviceId))) {
                            if (this._episodeBindings) {
                                this._episodeBindings.cancel();
                                this._episodeBindings = null
                            }
                            if (this._seasonChangePromise) {
                                this._seasonChangePromise.cancel();
                                this._seasonChangePromise = null
                            }
                            this._focusInitialized = false;
                            for (var control in this._episodeListControls)
                                this._episodeListControls[control].domElement.tabIndex = 0;
                            this._seasonChangePromise = season.hydrate().then(function hydrated(mediaItem) {
                                var promise;
                                if (MS.Entertainment.UI.NetworkStatusService.isOnline() && mediaItem.episodes && mediaItem.episodes.count > 0)
                                    this._episodeBindings = WinJS.Binding.bind(this.dataContext.tvImmersiveViewModel, {episode: this._parseEpisodesFromSeason.bind(this)});
                                else
                                    promise = this._loadLocalEpisodes(season);
                                return promise
                            }.bind(this)).then(function additonalEpisodeParsing() {
                                this._additonalEpisodeParsing()
                            }.bind(this)).done(function allDone() {
                                this._checkToShowViewMore();
                                this.showFrameWhenReady();
                                return
                            }.bind(this));
                            {}
                        }
                    }, _additonalEpisodeParsing: function _additonalEpisodeParsing() {
                        return WinJS.Promise.wrap()
                    }, _parseEpisodesFromSeason: function _parseEpisodesFromSeason() {
                        this._parseEpisodes(this.dataContext.tvImmersiveViewModel.season.episodes, this.dataContext.tvImmersiveViewModel.season.episode)
                    }, _parseEpisodes: function _parseEpisodes(episodes, featuredEpisode) {
                        var promise = WinJS.Promise.wrap();
                        var featuredEpisodeIndex = 0;
                        this.latestEpisodes.clear();
                        this.episodes.clear();
                        this.showLatestEpisodes = false;
                        this.showEpisodes = false;
                        this.showEpisodesHeading = this.showLatestEpisodes && this.showEpisodes;
                        this._showViewMore(false);
                        this.visible = false;
                        MS.Entertainment.UI.Controls.EpisodeList.episodeRenderIndex = 0;
                        MS.Entertainment.UI.Controls.EpisodeList.totalEpisodesToRender = episodes ? episodes.count : 0;
                        if (episodes && episodes.count > 0) {
                            var sevenDaysInMilliseconds = MS.Entertainment.Formatters.milliSecondsFromTimeSpan(7);
                            promise = episodes.itemsFromIndex(0).then(function gotEpisodes(episodeList) {
                                if (episodeList && episodeList.items && episodeList.items.length > 0) {
                                    var todayDateOnly = new Date;
                                    todayDateOnly.setHours(0, 0, 0, 0);
                                    var latestEpisode = null;
                                    var latestEpisodeDateOnly = null;
                                    for (var i = 0; i < episodeList.items.length; i++) {
                                        var currentEpisode = episodeList.items[i].data;
                                        if (!currentEpisode)
                                            continue;
                                        if (currentEpisode.episodeNumber > 0) {
                                            if (featuredEpisode && featuredEpisode.isEqual && featuredEpisode.isEqual(currentEpisode))
                                                featuredEpisodeIndex = this.episodes.length;
                                            this.episodes.push(currentEpisode);
                                            var currentEpisodeDateOnly = new Date;
                                            currentEpisodeDateOnly.setTime(currentEpisode.releaseDate);
                                            currentEpisodeDateOnly.setHours(0, 0, 0, 0);
                                            var deltaDates = todayDateOnly - currentEpisodeDateOnly;
                                            if (deltaDates >= 0 && deltaDates <= sevenDaysInMilliseconds)
                                                if (!latestEpisodeDateOnly || currentEpisodeDateOnly >= latestEpisodeDateOnly) {
                                                    latestEpisode = currentEpisode;
                                                    latestEpisodeDateOnly = currentEpisodeDateOnly
                                                }
                                        }
                                        else {
                                            MS.Entertainment.UI.Controls.EpisodeList.totalEpisodesToRender--;
                                            this._processExtraEpisode(currentEpisode)
                                        }
                                    }
                                    if (latestEpisode) {
                                        if (latestEpisodeDateOnly <= todayDateOnly)
                                            this.latestEpisodes.push(latestEpisode);
                                        MS.Entertainment.UI.Controls.EpisodeList.totalEpisodesToRender++
                                    }
                                }
                                if (this.dataContext.maxItems) {
                                    var numberOfEpisodesToDisplay = this.dataContext.maxItems - this.latestEpisodes.length;
                                    var showViewMore = false;
                                    if (this.episodes && this.episodes.length > numberOfEpisodesToDisplay) {
                                        var firstShown = 0;
                                        if (featuredEpisodeIndex)
                                            firstShown = Math.min(this.episodes.length - numberOfEpisodesToDisplay, Math.max(0, featuredEpisodeIndex - 1));
                                        this.episodes.splice(0, firstShown);
                                        this.episodes.splice(numberOfEpisodesToDisplay, this.episodes.length - numberOfEpisodesToDisplay);
                                        showViewMore = true
                                    }
                                    this._showViewMore(showViewMore)
                                }
                                else {
                                    var indexOfItemForScroll = Math.max(featuredEpisodeIndex - 1, 0);
                                    if (indexOfItemForScroll)
                                        MS.Entertainment.UI.Controls.EpisodeList.storedIndexOfItemForScroll = indexOfItemForScroll;
                                    else {
                                        this._scrollToTop();
                                        MS.Entertainment.UI.Controls.EpisodeList.storedIndexOfItemForScroll = -1
                                    }
                                }
                                this.showLatestEpisodes = this.latestEpisodes.length > 0;
                                this.showEpisodes = this.episodes.length > 0;
                                this.showEpisodesHeading = this.showLatestEpisodes || this.showEpisodes;
                                this.showFrameWhenReady()
                            }.bind(this))
                        }
                        else {
                            this.showLatestEpisodes = false;
                            this.showEpisodes = false;
                            this.showEpisodesHeading = false;
                            this.visible = false
                        }
                        return promise
                    }, _processExtraEpisode: function _processExtraEpisode(extrasEpisode){}, _showViewMore: function _showViewMore(show) {
                        if (!this.isViewMore && this.dataContext && this.dataContext.frame)
                            this.dataContext.frame.hideViewMoreIfEnoughSpace = MS.Entertainment.Utilities.isApp1 || !show
                    }, _checkToShowViewMore: function _checkToShowViewMore(){}, _loadLocalEpisodes: function loadLocalEpisodes(mediaItem) {
                        var completion;
                        var promise = new WinJS.Promise(function(c, e, p) {
                                completion = c
                            });
                        if (!mediaItem.inCollection) {
                            this._parseEpisodes([]);
                            completion();
                            return promise
                        }
                        var query = new MS.Entertainment.Data.Query.libraryVideoTV;
                        query.seasonId = mediaItem.libraryId;
                        query.sort = Microsoft.Entertainment.Queries.VideosSortBy.seriesTitleSeasonNumberEpisodeNumber;
                        query.isLive = true;
                        this.episodesQuery = query;
                        query.execute().then(function queryComplete(q) {
                            return this._parseEpisodes(q.result.items, this.dataContext.tvImmersiveViewModel.season.episode).then(function parseEpisodesComplete(parseComplete) {
                                    completion()
                                }.bind(this))
                        }.bind(this));
                        return promise
                    }
            }, {
                episodes: null, latestEpisodes: null, showEpisodes: false, showEpisodesHeading: false, showLatestEpisodes: false, visible: false
            }, {
                cssSelectors: {
                    episodeViewMore: ".currentPage .tvEpisodesFrame .viewMoreRow .template-moreButton .win-focusable", episodeItem: ".currentPage .tvEpisodeListPanel .episodeContainer .template-episodeListItem"
                }, episodeRenderIndex: 0, totalEpisodesToRender: 0, storedIndexOfItemForScroll: 0, countRenderedItemsForScrollIntoView: MS.Entertainment.Utilities.weakElementBindingInitializer(function countRenderedItemsForScrollIntoView(sourceValue, targetElement, elementProperty) {
                        targetElement[elementProperty] = sourceValue;
                        MS.Entertainment.UI.Controls.EpisodeList.episodeRenderIndex++;
                        if (MS.Entertainment.UI.Controls.EpisodeList.episodeRenderIndex === MS.Entertainment.UI.Controls.EpisodeList.totalEpisodesToRender) {
                            var itemListElement = document.querySelector(".tvEpisodeListPanel .inlineDetailsEpisodeList.standardEpisodes");
                            if (MS.Entertainment.UI.Controls.EpisodeList.storedIndexOfItemForScroll >= 0 && itemListElement && itemListElement.children && itemListElement.children[MS.Entertainment.UI.Controls.EpisodeList.storedIndexOfItemForScroll])
                                WinJS.Promise.timeout(1).done(function delayScrollEpisode() {
                                    itemListElement.children[MS.Entertainment.UI.Controls.EpisodeList.storedIndexOfItemForScroll].scrollIntoView()
                                });
                            if (MS.Entertainment.Utilities.isApp2)
                                if (itemListElement && itemListElement.children)
                                    WinJS.Promise.timeout(1).done(function delayFocusFirstEpisode() {
                                        MS.Entertainment.UI.Framework.focusElement(itemListElement.children[0])
                                    })
                        }
                    })
            })
    })
})()
