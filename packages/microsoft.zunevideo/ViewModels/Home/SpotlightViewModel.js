/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/observablearray.js", "/Framework/serviceLocator.js", "/Framework/utilities.js");
(function() {
    "use strict";
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {SpotlightViewModel: MS.Entertainment.defineObservable(function spotlightViewModelConstructor(query) {
            if (MS.Entertainment.ViewModels.SpotlightViewModel.currentSpotlightViewModel)
                MS.Entertainment.ViewModels.SpotlightViewModel.currentSpotlightViewModel.cleanUp();
            MS.Entertainment.ViewModels.SpotlightViewModel.currentSpotlightViewModel = this;
            if (!query)
                throw new Error("Query required for SpotlightViewModel");
            this._query = query;
            this._queryWatcher = new MS.Entertainment.Framework.QueryWatcher("spotlightViewModel");
            this._networkStatusBinding = WinJS.Binding.bind(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState), {networkStatus: this._onNetworkStatusChanged.bind(this)});
            this._dashboardRefreshBinding = MS.Entertainment.UI.Framework.addEventHandlers(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dashboardRefresher), {refreshDashboard: this._dashboardRefreshChanged.bind(this)});
            this.itemClicked = MS.Entertainment.Utilities.bindAndMarkSupportedForProcessing(this.itemClicked, this);
            if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.signIn)) {
                var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                MS.Entertainment.ViewModels.SpotlightViewModel._ignoreFirstBind = true;
                if (!MS.Entertainment.ViewModels.SpotlightViewModel._signOutHandler)
                    MS.Entertainment.ViewModels.SpotlightViewModel._signOutHandler = WinJS.Binding.bind(signIn, {isSignedIn: this.handleSignOut.bind(this)});
                if (!MS.Entertainment.ViewModels.SpotlightViewModel._signingInHandler)
                    MS.Entertainment.ViewModels.SpotlightViewModel._signingInHandler = WinJS.Binding.bind(signIn, {isSigningIn: this.handleIsSigningIn.bind(this)});
                MS.Entertainment.ViewModels.SpotlightViewModel._ignoreFirstBind = false
            }
        }, {
            maxItems: 0, action: null, items: undefined, featuredObject: undefined, filterWebBlendActions: false, _query: null, _queryWatcher: null, _networkStatusBinding: null, _dashboardRefreshBinding: null, _isOnline: null, _modelReady: false, _maxQueryTimeMS: 2000, _queryTimeoutPromise: null, _dashboardFrozen: false, _refreshOnDashboardThaw: false, _previousStringifiedItems: String.empty, _maxRecommendationItems: 4, _recommendationRefreshRate: 1800000, _recommendationUpdatePromise: null, _secondaryPanelTitleLoaded: false, cleanUp: function cleanUp(){}, getItems: function getItems(refreshing) {
                    MS.Entertainment.ViewModels.assert(this.maxItems, "Must specify number of items for SpotlightViewModel");
                    if (!this.maxItems) {
                        this.items = null;
                        return WinJS.Promise.wrap()
                    }
                    this._modelReady = true;
                    this._queryWatcher.registerQuery(this._query);
                    this._query.aggregateChunks = false;
                    this._queryTimeoutPromise = WinJS.Promise.timeout(this._maxQueryTimeMS).then(function showDefault() {
                        this._queryTimeoutPromise = null;
                        if (!this.featuredObject && !refreshing)
                            this._setDefaultItems(false)
                    }.bind(this));
                    return this._query.execute().then(function queryComplete(q) {
                            if (this._queryTimeoutPromise) {
                                WinJS.Binding.unwrap(this._queryTimeoutPromise).cancel();
                                this._queryTimeoutPromise = null
                            }
                            if (q.result.entries && q.result.entries.count)
                                return q.result.entries.toArray();
                            else
                                return WinJS.Promise.wrapError("no entries returned")
                        }.bind(this)).then(this.populateItems.bind(this), function queryError(q) {
                            if (!refreshing)
                                this._setDefaultItems(true)
                        }.bind(this)).then(function gotItems() {
                            var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                            if ((signIn.isSignedIn || signIn.signInError) && !signIn.isSigningIn && !signIn.isSigningOut)
                                this.updateRecommendationPanel();
                            this.loadFeaturedSetsPanel()
                        }.bind(this))
                }, populateItems: function populateItems(queryItems) {
                    var stringifiedNewItems = JSON.stringify(queryItems);
                    if (stringifiedNewItems === this._previousStringifiedItems)
                        return;
                    this._previousStringifiedItems = stringifiedNewItems;
                    queryItems.sort(function sortQueryItems(a, b) {
                        return a.sequenceId - b.sequenceId
                    });
                    var spotlightItems = new MS.Entertainment.ObservableArray;
                    var item;
                    var setProperty = MS.Entertainment.Utilities.BindingAgnostic.setProperty;
                    var maxItems = (this.maxItems > 0) ? this.maxItems : queryItems.length;
                    for (var i = 0; i < queryItems.length && spotlightItems.length < maxItems; i++) {
                        var items = WinJS.Utilities.getMember("items", queryItems[i]);
                        if (!items || !items.length)
                            continue;
                        item = this.wrapItem(items[0]);
                        var itemIsFlexHub = item.action && item.action.type === MS.Entertainment.Data.Augmenter.Spotlight.ActionType.FlexHub;
                        var itemIsZuneFlexHub = item.spotlightAction && item.spotlightAction.type === MS.Entertainment.Data.Augmenter.Spotlight.ActionType.ZuneFlexHub;
                        setProperty(item, "isFlexHub", itemIsFlexHub || itemIsZuneFlexHub);
                        setProperty(item, "sequenceId", queryItems[i].sequenceId);
                        setProperty(item, "queryId", queryItems[i].queryId);
                        var filterFlexHub = (itemIsFlexHub && MS.Entertainment.Utilities.isMusicApp);
                        if (!filterFlexHub && (!this.filterWebBlendActions || item.type !== MS.Entertainment.Data.Augmenter.Spotlight.ItemType.WebBlend) && (item.type !== MS.Entertainment.Data.Augmenter.Spotlight.ItemType.Media || (this._hasValidMediaTarget(item) && this._canDisplayMediaType(item))))
                            spotlightItems.push(item)
                    }
                    this.items = spotlightItems;
                    this.featuredObject = this._createFeaturedObject(spotlightItems)
                }, handleIsSigningIn: function handleIsSigningIn(newValue, oldValue) {
                    if (MS.Entertainment.ViewModels.SpotlightViewModel._ignoreFirstBind)
                        return;
                    if (!newValue)
                        if (MS.Entertainment.ViewModels.SpotlightViewModel.currentSpotlightViewModel)
                            MS.Entertainment.ViewModels.SpotlightViewModel.currentSpotlightViewModel.updateRecommendationPanel()
                }, handleSignOut: function handleSignOut(newValue, oldValue) {
                    if (MS.Entertainment.ViewModels.SpotlightViewModel._ignoreFirstBind)
                        return;
                    if (!newValue)
                        if (MS.Entertainment.ViewModels.SpotlightViewModel.currentSpotlightViewModel)
                            MS.Entertainment.ViewModels.SpotlightViewModel.currentSpotlightViewModel.updateRecommendationPanel()
                }, updateRecommendationPanel: function updateRecommendationPanel() {
                    if (!MS.Entertainment.Utilities.isVideoApp1)
                        return;
                    if (this._recommendationUpdatePromise) {
                        WinJS.Binding.unwrap(this._recommendationUpdatePromise).cancel();
                        this._recommendationUpdatePromise = null
                    }
                    this._recommendationUpdatePromise = WinJS.Promise.timeout(this._recommendationRefreshRate).then(function recommendationUpdate() {
                        this.updateRecommendationPanel()
                    }.bind(this));
                    var recommendationQuery = new MS.Entertainment.Data.Query.EdsVideoRecommendations;
                    recommendationQuery.execute().then(function executed(q) {
                        var recommendationItems = WinJS.Utilities.getMember("result.filteredItemsArray", q);
                        var itemOffset = 0;
                        var itemsToDisplay = new MS.Entertainment.ObservableArray;
                        var zuneId = WinJS.Utilities.getMember("featuredObject.recommendationItems.item0.zuneId", this);
                        if (recommendationItems && (recommendationItems.length > 0)) {
                            if (zuneId === recommendationItems[0].zuneId)
                                itemOffset = this._maxRecommendationItems;
                            for (var i = itemOffset; i < recommendationItems.length && i - itemOffset < this._maxRecommendationItems; i++) {
                                var item = recommendationItems[i];
                                this._addDashboardInvokeHandler(item);
                                itemsToDisplay.push(item)
                            }
                        }
                        this._addRecommendationsToFeaturedObject(itemsToDisplay)
                    }.bind(this), function recommendationQueryError(q) {
                        return null
                    }.bind(this))
                }, loadFeaturedSetsPanel: function loadFeaturedSetsPanel() {
                    if (!MS.Entertainment.Utilities.isVideoApp1)
                        return;
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    var featuredSetsEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.videoFeaturedSetsEnabled);
                    if (!featuredSetsEnabled) {
                        this.featuredObject.showFeaturedSets = false;
                        this.featuredObject.showFeaturedSetsPlaceholder = false;
                        return
                    }
                    var featuredSetsQuery = new MS.Entertainment.Data.Query.MediaDiscoveryVideoFlexHub;
                    featuredSetsQuery.target = WinJS.Utilities.getMember("parameter.targetFeed", this) || "featuredsets";
                    return featuredSetsQuery.execute().then(function executed(q) {
                            var featuredSets = WinJS.Utilities.getMember("result.featuredSetsArray", q) || [];
                            featuredSets.forEach(this._addDashboardInvokeHandler.bind(this));
                            this.featuredObject.featuredSets = new MS.Entertainment.ObservableArray(featuredSets).bindableItems;
                            this.featuredObject.showFeaturedSets = featuredSets.length > 0;
                            this.featuredObject.showFeaturedSetsPlaceholder = !this.featuredObject.showFeaturedSets;
                            this._addShowAllFeaturedSetsInvokeHandler(this.featuredObject.featuredSets)
                        }.bind(this), function featuredSetsQueryError(error) {
                            this.featuredObject.featuredSets = null
                        }.bind(this))
                }, _addShowAllFeaturedSetsInvokeHandler: function _addShowAllFeaturedSetsInvokeHandler(featuredSets) {
                    var setProperty = MS.Entertainment.Utilities.BindingAgnostic.setProperty;
                    var featuredSetsClicked = MS.Entertainment.Utilities.bindAndMarkSupportedForProcessing(function featuredSetsClicked(e) {
                            if (this._isOnline) {
                                var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                                var featuredSetAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.featuredSetsNavigate);
                                featuredSetAction.parameter = {page: MS.Entertainment.UI.Monikers.homeSpotlight};
                                featuredSetAction.execute()
                            }
                        }, this);
                    setProperty(featuredSets, "doclick", featuredSetsClicked)
                }, _addDashboardInvokeHandler: function _addDashboardInvokeHandler(item) {
                    var setProperty = MS.Entertainment.Utilities.BindingAgnostic.setProperty;
                    var itemClicked;
                    var popOverConstructor;
                    var mediaItem = item;
                    itemClicked = MS.Entertainment.Utilities.bindAndMarkSupportedForProcessing(function itemClicked(e) {
                        var showItemDetails = mediaItem.mediaType && (mediaItem.mediaType !== Microsoft.Entertainment.Queries.ObjectType.editorial);
                        if (!this._isOnline) {
                            var errorCode = MS.Entertainment.Platform.Playback.Error.NS_E_WMPIM_USEROFFLINE.code;
                            return MS.Entertainment.UI.Shell.showError(String.load(String.id.IDS_FAILED_PANEL_HEADER), errorCode)
                        }
                        else if (mediaItem && showItemDetails) {
                            var popOverParameters = {
                                    itemConstructor: popOverConstructor, dataContext: {
                                            location: MS.Entertainment.Data.ItemLocation.marketplace, data: mediaItem
                                        }
                                };
                            MS.Entertainment.Platform.PlaybackHelpers.showItemDetails(popOverParameters)
                        }
                        else if (mediaItem && !showItemDetails) {
                            var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                            var featuredSetAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.featuredSetsNavigate);
                            featuredSetAction.parameter = {
                                page: MS.Entertainment.UI.Monikers.homeSpotlight, targetFeed: mediaItem.actionTarget
                            };
                            featuredSetAction.execute()
                        }
                    }, this);
                    setProperty(item, "doclick", itemClicked)
                }, _hasValidMediaTarget: function(spotlightItem) {
                    return (spotlightItem && spotlightItem.actionTarget && (spotlightItem.isFlexHub || (!MS.Entertainment.Utilities.isEmptyGuid(spotlightItem.actionTarget) && MS.Entertainment.Utilities.isValidGuid(spotlightItem.actionTarget))))
                }, _canDisplayMediaType: function _canDisplayMediaType(item) {
                    var config = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    var showEditorialEpisodes = config.video.supportsEditorialTVEpisodes;
                    var canDisplayMediaType = false;
                    if (item && item.actionType && item.actionType.mediaType)
                        if (item.isFlexHub)
                            canDisplayMediaType = true;
                        else
                            switch (item.actionType.mediaType) {
                                case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.Album:
                                case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.Artist:
                                    canDisplayMediaType = MS.Entertainment.Utilities.isMusicApp;
                                    break;
                                case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.Season:
                                    canDisplayMediaType = !!(MS.Entertainment.Utilities.isVideoApp && MS.Entertainment.Utilities.isValidServiceId(item.seriesId));
                                    break;
                                case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.Movie:
                                case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.Series:
                                    canDisplayMediaType = MS.Entertainment.Utilities.isVideoApp;
                                    break;
                                case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.Episode:
                                    canDisplayMediaType = (showEditorialEpisodes && MS.Entertainment.Utilities.isVideoApp);
                                    break
                            }
                    return canDisplayMediaType
                }, wrapItem: function wrapItem(item) {
                    var setProperty = MS.Entertainment.Utilities.BindingAgnostic.setProperty;
                    if (item.type === MS.Entertainment.Data.Augmenter.Spotlight.ItemType.Ad)
                        MS.Entertainment.ViewModels.SpotlightViewModel.WrapAd(item);
                    else if (item.type === MS.Entertainment.Data.Augmenter.Spotlight.ItemType.WebBlend)
                        MS.Entertainment.ViewModels.SpotlightViewModel.WrapWebBlendAction(item);
                    else if (item.actionType)
                        setProperty(item, "doclick", this.itemClicked);
                    return item
                }, itemClicked: function itemClicked(e) {
                    var stateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                    if (!stateService.servicesEnabled)
                        return MS.Entertainment.UI.Shell.showAppUpdateDialog();
                    var spotlightItem = e.target;
                    if (spotlightItem.action || !spotlightItem.actionType)
                        if (!this._isOnline) {
                            var popOverParameters = null;
                            popOverParameters = {itemConstructor: "MS.Entertainment.UI.Controls.FailedPanel"};
                            return MS.Entertainment.UI.Controls.PopOver.showNonMediaPopOver(popOverParameters)
                        }
                        else
                            return;
                    if (spotlightItem.type === MS.Entertainment.Data.Augmenter.Spotlight.ItemType.Ad)
                        MS.Entertainment.Utilities.Telemetry.logAdClicked(spotlightItem);
                    var popOverConstructor = null;
                    switch (spotlightItem.actionType.mediaType) {
                        case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.Movie:
                            popOverConstructor = "MS.Entertainment.Pages.MovieInlineDetails";
                            break;
                        case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.Artist:
                            popOverConstructor = "MS.Entertainment.Pages.MusicArtistInlineDetails";
                            break;
                        case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.Album:
                            popOverConstructor = "MS.Entertainment.Pages.MusicAlbumInlineDetails";
                            break;
                        case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.Series:
                        case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.Episode:
                            popOverConstructor = MS.Entertainment.Utilities.getTvInlineDetailsPopoverControl();
                            break
                    }
                    var mediaItem = WinJS.Binding.unwrap(spotlightItem);
                    if (spotlightItem.type === MS.Entertainment.Data.Augmenter.Spotlight.ItemType.Ad)
                        MS.Entertainment.Platform.PlaybackHelpers.showImmersiveDetails(mediaItem, true);
                    else if (spotlightItem.actionType.location === MS.Entertainment.Data.Augmenter.Spotlight.MediaType.FlexHub || spotlightItem.actionType.location === MS.Entertainment.Data.Augmenter.Spotlight.MediaType.ZuneFlexHub) {
                        var stateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                        if (!stateService.servicesEnabled)
                            return MS.Entertainment.UI.Shell.showAppUpdateDialog();
                        if (!this._isOnline) {
                            var errorCode = MS.Entertainment.Platform.Playback.Error.NS_E_WMPIM_USEROFFLINE.code;
                            return MS.Entertainment.UI.Shell.showError(String.load(String.id.IDS_FAILED_PANEL_HEADER), errorCode)
                        }
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).navigateTo(MS.Entertainment.UI.Monikers.flexHubPage, MS.Entertainment.UI.Monikers.flexHub, null, {query: mediaItem.actionTarget})
                    }
                    else {
                        var popOverParameters = {itemConstructor: popOverConstructor};
                        var hydrate = mediaItem && mediaItem.hydrate && mediaItem.hydrate();
                        popOverParameters.dataContext = {
                            data: mediaItem, location: MS.Entertainment.Data.ItemLocation.marketplace
                        };
                        MS.Entertainment.Utilities.Telemetry.logPageAction({
                            areaName: "dashboardSpotlight", itemPropertyBag: mediaItem
                        }, {
                            uri: MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).getUserLocation(), pageTypeId: MS.Entertainment.Utilities.Telemetry.PageTypeId.Dash
                        }, {
                            uri: popOverConstructor, pageTypeId: MS.Entertainment.Utilities.Telemetry.PageTypeId.PopUp
                        });
                        MS.Entertainment.Platform.PlaybackHelpers.showItemDetails(popOverParameters)
                    }
                }, _createFeaturedObject: function _createFeaturedObject(spotlightItems) {
                    return {
                            bindableItems: spotlightItems.bindableItems, recommendationItems: WinJS.Utilities.getMember("featuredObject.recommendationItems", this), featuredSets: WinJS.Utilities.getMember("featuredObject.featuredSets", this), isOnline: this._isOnline, showFeaturedSets: true, showFeaturedSetsPlaceholder: true
                        }
                }, _addRecommendationsToFeaturedObject: function _addRecommendationsToFeaturedObject(recommendationItems) {
                    if (this.featuredObject)
                        this.featuredObject.recommendationItems = recommendationItems.bindableItems
                }, _setDefaultItems: function _setDefaultItems(markError) {
                    var spotlightItems = new MS.Entertainment.ObservableArray;
                    for (var i = 0; i < this.maxItems; i++)
                        spotlightItems.push(this.wrapItem(this._defaultItem()));
                    this.items = markError ? null : spotlightItems;
                    this.featuredObject = this._createFeaturedObject(spotlightItems);
                    if (markError)
                        WinJS.Promise.timeout().then(function setOfflinePanel() {
                            this.featuredObject = null
                        }.bind(this))
                }, _defaultItem: function _defaultItem() {
                    return {primaryText: String.empty}
                }, _onNetworkStatusChanged: function _onNetworkStatusChanged(newValue) {
                    window.msWriteProfilerMark("spotlightViewModel_ onNetworkStatusChanged: " + newValue);
                    var isOnline = false;
                    switch (newValue) {
                        case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.unknown:
                        case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.unrestricted:
                        case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.throttled:
                            isOnline = true;
                            break;
                        case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.onDemand:
                        case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.localOnly:
                        case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.none:
                            isOnline = false;
                            break
                    }
                    if (isOnline !== this._isOnline) {
                        this._isOnline = isOnline;
                        if (this._modelReady)
                            if (isOnline)
                                this.getItems()
                    }
                    if (this.featuredObject)
                        this.featuredObject.isOnline = this._isOnline
                }, _dashboardRefreshChanged: function _dashboardRefreshChanged() {
                    if (!this._dashboardFrozen) {
                        if (this._modelReady)
                            this.getItems(true)
                    }
                    else
                        this._refreshOnDashboardThaw = true
                }, dashboardFreezeHandler: function dashboardFreezeHandler() {
                    this._dashboardFrozen = true
                }, dashboardThawHandler: function dashboardThawHandler() {
                    if (this._refreshOnDashboardThaw) {
                        this._refreshOnDashboardThaw = false;
                        if (this._modelReady)
                            WinJS.Promise.timeout(MS.Entertainment.UI.DashboardRefresherService.refreshDelayTime).then(function timeoutFunction() {
                                this.getItems(true)
                            }.bind(this))
                    }
                    this._dashboardFrozen = false
                }
        }, {
            currentSpotlightViewModel: null, _signOutHandler: null, _signingInHandler: null, _ignoreFirstBind: false, WrapAd: function WrapAd(item) {
                    var setProperty = MS.Entertainment.Utilities.BindingAgnostic.setProperty;
                    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                    MS.Entertainment.ViewModels.assert(item.type === MS.Entertainment.Data.Augmenter.Spotlight.ItemType.Ad, "cant wrap a non-ad in an ad");
                    setProperty(item, "caption", String.load(String.id.IDS_ADVERTISEMENT));
                    if (item.actionType && item.actionType.location === MS.Entertainment.Data.Augmenter.Spotlight.ActionType.Web) {
                        var action = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.externalAdNavigate);
                        action.parameter = {link: item.actionTarget};
                        setProperty(item, "action", action);
                        setProperty(item, "doclick", MS.Entertainment.Utilities.bindAndMarkSupportedForProcessing(function executeAction() {
                            action.executed(item.actionTarget)
                        }))
                    }
                }, WrapWebBlendAction: function WrapWebBlendAction(item) {
                    var setProperty = MS.Entertainment.Utilities.BindingAgnostic.setProperty;
                    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                    var actionTarget = item.actionTarget && MS.Entertainment.UI.Actions.ActionIdentifiers[item.actionTarget];
                    MS.Entertainment.ViewModels.assert(item.type === MS.Entertainment.Data.Augmenter.Spotlight.ItemType.WebBlend, "cant wrap a non-WebBlend Action");
                    MS.Entertainment.ViewModels.assert(actionTarget, "invalid action target passed in");
                    if (item.actionType && item.actionType.location === MS.Entertainment.Data.Augmenter.Spotlight.ActionType.WebBlend && actionTarget)
                        setProperty(item, "doclick", MS.Entertainment.Utilities.bindAndMarkSupportedForProcessing(function executeAction() {
                            var action = actionService.getAction(actionTarget);
                            action.execute()
                        }))
                }
        })})
})()
