/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/observablearray.js", "/Framework/serviceLocator.js", "/Framework/utilities.js");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {FeaturedViewModel: MS.Entertainment.defineObservable(function featuredViewModelConstructor(query, overrideQuery, overrideFilterString) {
            if (!query)
                throw new Error("Query required for FeaturedViewModel");
            this._itemMap = {};
            this._query = query;
            if (overrideQuery && !overrideFilterString)
                throw new Error("Specified override query but not an override filter string");
            this._overrideQuery = overrideQuery;
            this._overrideFilterString = overrideFilterString;
            this._queryWatcher = new MS.Entertainment.Framework.QueryWatcher("featuredViewModel");
            this._networkStatusBinding = WinJS.Binding.bind(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState), {networkStatus: this._onNetworkStatusChanged.bind(this)});
            this._dashboardRefreshBinding = MS.Entertainment.UI.Framework.addEventHandlers(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dashboardRefresher), {refreshDashboard: this._dashboardRefreshChanged.bind(this)});
            this.wrapItem = MS.Entertainment.ViewModels.FeaturedViewModel.wrapItem
        }, {
            maxItems: 0, skipCount: 0, items: undefined, _itemMap: null, featuredObject: undefined, action: null, panelAction: null, wrapItem: null, _query: null, _overrideQuery: null, _overrideFilterString: null, _queryWatcher: null, _networkStatusBinding: null, _isOnline: null, _modelReady: false, _dashboardFrozen: false, _refreshOnDashboardThaw: false, _previousStringifiedItems: String.empty, _fileTransferListenerIds: null, _fileTransferHandlersRegistered: null, _addListenerIdForMediaType: function _addListenerIdForMediaType(mediaType) {
                    this._fileTransferListenerIds = this._fileTransferListenerIds || {};
                    if (!this._fileTransferListenerIds[mediaType])
                        this._fileTransferListenerIds[mediaType] = "featuredViewModel_" + mediaType + "_" + MS.Entertainment.Utilities.getSessionUniqueInteger()
                }, _modifyQueryForContentNotifications: function _modifyQueryForContentNotifications(query) {
                    var notifications = null;
                    if (query.supportsContentNotifications && query.status === MS.Entertainment.Data.queryStatus.idle) {
                        var resultModifier = MS.Entertainment.UI.ContentNotification.listResult();
                        var notifications = new MS.Entertainment.UI.ContentNotification.NotificationModification(resultModifier, MS.Entertainment.UI.FileTransferService.keyFromProperty("serviceId", false, true));
                        notifications.modifyQuery(this._query)
                    }
                    return notifications
                }, _registerContentNotificationListener: function _registerContentNotificationListener(sender) {
                    var fileTransferService;
                    var taskKeyGetter;
                    var fileTransferNotifiers;
                    var currentItem;
                    var currentMediaType;
                    var notificationFilter;
                    var itemsLength = (this.items && this.items.length) ? this.items.length : 0;
                    if (!sender || itemsLength <= 0)
                        return;
                    MS.Entertainment.ViewModels.assert(!this._fileTransferHandlersRegistered, "_registerContentNotificationListener called more than once which was not expected");
                    this._fileTransferHandlersRegistered = {};
                    fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                    notificationFilter = this._filterNotifications.bind(this);
                    for (var i = 0; i < itemsLength; i++) {
                        currentItem = this.items[i];
                        currentMediaType = currentItem && currentItem.mediaType;
                        if (!currentItem || currentItem.isFlexHub || this._fileTransferHandlersRegistered[currentMediaType])
                            continue;
                        switch (currentMediaType) {
                            case Microsoft.Entertainment.Queries.ObjectType.album:
                                taskKeyGetter = MS.Entertainment.UI.FileTransferService.keyFromProperty("albumMediaId", false, true);
                                fileTransferNotifiers = MS.Entertainment.UI.FileTransferNotifiers.trackCollection;
                                break;
                            case Microsoft.Entertainment.Queries.ObjectType.video:
                                taskKeyGetter = MS.Entertainment.UI.FileTransferService.keyFromProperty("mediaId", false, true);
                                fileTransferNotifiers = MS.Entertainment.UI.FileTransferNotifiers.genericFile;
                                break;
                            case Microsoft.Entertainment.Queries.ObjectType.person:
                                break;
                            default:
                                MS.Entertainment.ViewModels.fail("Unexpected item type: " + currentItem.type);
                                break
                        }
                        if (taskKeyGetter && fileTransferNotifiers) {
                            this._addListenerIdForMediaType(currentMediaType);
                            fileTransferService.registerListener(this._fileTransferListenerIds[currentMediaType], taskKeyGetter, sender, fileTransferNotifiers, null, notificationFilter);
                            this._fileTransferHandlersRegistered[currentMediaType] = true
                        }
                    }
                }, _filterNotifications: function _filterNotifications(notificationId) {
                    return (!notificationId || !this._itemMap || !this._itemMap[notificationId.toLowerCase()])
                }, canDisplayMediaType: function filterUnsupportedTypes(item) {
                    var config = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    var showEditorialEpisodes = config.video.supportsEditorialTVEpisodes;
                    var canDisplayMediaType = false;
                    if (item && item.actionType && item.actionType.mediaType)
                        if (item.isFlexHub)
                            canDisplayMediaType = true;
                        else
                            switch (item.actionType.mediaType) {
                                case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.ModernGame:
                                case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.PhoneGame:
                                case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.WindowsGame:
                                case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.XboxGame:
                                    canDisplayMediaType = false;
                                    break;
                                case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.Album:
                                case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.Artist:
                                    canDisplayMediaType = MS.Entertainment.Utilities.isMusicApp;
                                    break;
                                case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.Movie:
                                case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.Season:
                                case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.Series:
                                    canDisplayMediaType = MS.Entertainment.Utilities.isVideoApp;
                                    break;
                                case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.Episode:
                                    canDisplayMediaType = (showEditorialEpisodes && MS.Entertainment.Utilities.isVideoApp);
                                    break
                            }
                    return canDisplayMediaType
                }, getItems: function getItems(refreshing) {
                    MS.Entertainment.ViewModels.assert(this.maxItems, "Must specify number of items for FeaturedViewModel");
                    var setProperty = MS.Entertainment.Utilities.BindingAgnostic.setProperty;
                    if (!this.maxItems) {
                        this.items = null;
                        return
                    }
                    this._modelReady = true;
                    var notifications = this._modifyQueryForContentNotifications(this._query);
                    var sender = null;
                    if (notifications)
                        sender = notifications.createSender();
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    var showMovieTrailers = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.videoShowMovieTrailers);
                    var config = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    var showEditorialEpisodes = config.video.supportsEditorialTVEpisodes;
                    var overrideQueryPromise = {};
                    this._queryWatcher.registerQuery(this._query);
                    if (this._overrideQuery) {
                        this._queryWatcher.registerQuery(this._overrideQuery);
                        overrideQueryPromise = this._overrideQuery.execute().then(function arrayOverrideResults(overrideResults) {
                            if (overrideResults.result.entries && overrideResults.result.entries.count)
                                return overrideResults.result.entries.toArray();
                            return null
                        }).then(function filterOverrideResults(overrideResultArray) {
                            if (!overrideResultArray)
                                return;
                            var overrideItem = null;
                            var overrideItemSplitSequenceId = null;
                            var goodOverrideItemArray = [];
                            var hasValidMediaTarget = function(checkOverrideItem) {
                                    return (checkOverrideItem && checkOverrideItem.actionTarget && (checkOverrideItem.isFlexHub || (!MS.Entertainment.Utilities.isEmptyGuid(checkOverrideItem.actionTarget) && MS.Entertainment.Utilities.isValidGuid(checkOverrideItem.actionTarget))))
                                };
                            overrideResultArray.forEach(function iterateOverrideItems(overrideItem) {
                                if (overrideItem.items && overrideItem.items[0]) {
                                    var itemIsFlexHub = overrideItem.items[0].actionType.mediaType === MS.Entertainment.Data.Augmenter.Spotlight.MediaType.FlexHub;
                                    var itemIsZuneFlexHub = overrideItem.items[0].actionType.mediaType === MS.Entertainment.Data.Augmenter.Spotlight.MediaType.ZuneFlexHub;
                                    setProperty(overrideItem.items[0], "isFlexHub", itemIsFlexHub || itemIsZuneFlexHub);
                                    setProperty(overrideItem.items[0], "queryId", this._overrideQuery.queryId);
                                    if (hasValidMediaTarget(overrideItem.items[0]) && this.canDisplayMediaType(overrideItem.items[0]))
                                        if (overrideItem.overrideSequenceId && overrideItem.overrideSequenceId.split) {
                                            overrideItemSplitSequenceId = overrideItem.overrideSequenceId.split(".");
                                            if (overrideItemSplitSequenceId.length === 3)
                                                if (overrideItemSplitSequenceId[0].toLowerCase() === this._overrideFilterString) {
                                                    overrideItem.splitSequenceId = overrideItemSplitSequenceId;
                                                    goodOverrideItemArray.push(overrideItem)
                                                }
                                        }
                                }
                            }.bind(this));
                            return goodOverrideItemArray
                        }.bind(this), function overrideFailed() {
                            return null
                        })
                    }
                    var mainQueryPromise = this._query.execute().then(function queryComplete(q) {
                            return MS.Entertainment.ViewModels.FeaturedViewModel._safeGetFirstItem(q)
                        }.bind(this)).then(function filterMainQueryItems(result) {
                            var itemsEditorial = MS.Entertainment.ViewModels.FeaturedViewModel._safeGetEditorialItemsFromOuterItem(result).filter(function(item) {
                                    return (item && item.type === MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Album || item.type === MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Artist || item.type === MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Track || item.type === MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Season || item.type === MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Series || item.type === MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Movie || (showEditorialEpisodes && item.type === MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Episode) || (showMovieTrailers && item.type === MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.MovieTrailer) || (item.type === MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Hub))
                                });
                            var stringifiedNewItems = JSON.stringify(itemsEditorial);
                            if (stringifiedNewItems === this._previousStringifiedItems)
                                return;
                            this._previousStringifiedItems = stringifiedNewItems;
                            var goodItems = [];
                            for (var i = this.skipCount; i < itemsEditorial.length && goodItems.length < this.maxItems; i++) {
                                var item = itemsEditorial[i];
                                setProperty(item, "queryId", this._query.queryId);
                                if (notifications) {
                                    notifications.modifyItem(item);
                                    if (!MS.Entertainment.Utilities.isEmptyGuid(item.serviceId))
                                        this._itemMap[item.serviceId.toLowerCase()] = true
                                }
                                goodItems.push(this.wrapItem(item))
                            }
                            return goodItems
                        }.bind(this));
                    var joinedPromises = WinJS.Promise.join({
                            mainQuery: mainQueryPromise, overrideQuery: overrideQueryPromise
                        }).then(function populateItems(result) {
                            var finalItemsList = result.mainQuery;
                            if (result.overrideQuery && result.overrideQuery.length)
                                for (var r = 0; r < result.overrideQuery.length; r++) {
                                    var currentOverrideItem = result.overrideQuery[r];
                                    for (var o = 0; o < finalItemsList.length; o++)
                                        if (currentOverrideItem.splitSequenceId[2] === finalItemsList[o].target) {
                                            currentOverrideItem.items[0].overrideItemUseUrl = true;
                                            finalItemsList[o] = MS.Entertainment.ViewModels.FeaturedViewModel.wrapOverrideItem(currentOverrideItem.items[0]);
                                            break
                                        }
                                }
                            if (this.action)
                                finalItemsList.splice(finalList.length - 1, 1, this.action);
                            if (finalItemsList) {
                                var featuredContentObject = MS.Entertainment.ViewModels.FeaturedViewModel.createFeaturedContentDataSource(finalItemsList);
                                if (this.panelAction)
                                    featuredContentObject.panelAction = this.panelAction;
                                this.items = finalItemsList;
                                this.featuredObject = featuredContentObject
                            }
                            if (sender)
                                this._registerContentNotificationListener(sender)
                        }.bind(this), function queryFailed() {
                            if (!refreshing)
                                this._fillEmptyResults()
                        }.bind(this));
                    return joinedPromises
                }, _fillEmptyResults: function _fillEmptyResults() {
                    var featuredItems = [];
                    for (var i = 0; i < this.maxItems; i++)
                        featuredItems.push(this.wrapItem({}));
                    this.items = null;
                    this.featuredObject = MS.Entertainment.ViewModels.FeaturedViewModel.createFeaturedContentDataSource(featuredItems);
                    if (this.panelAction)
                        this.featuredObject.panelAction = this.panelAction
                }, _onNetworkStatusChanged: function _onNetworkStatusChanged(newValue) {
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
                        if (this._modelReady && this._isOnline)
                            this.getItems()
                    }
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
            _safeGetFirstItem: function _safeGetFirstItem(query) {
                if (!query) {
                    MS.Entertainment.ViewModels.assert(false, "Unexpected null query passed to _safeGetFirstItem");
                    return WinJS.Promise.wrap(null)
                }
                var result = query.result;
                if (!result) {
                    MS.Entertainment.ViewModels.assert(false, "Query without result passed to _safeGetFirstItem");
                    return WinJS.Promise.wrap(null)
                }
                var entries = result.entries;
                if (!entries || !entries.itemsFromIndex(0)) {
                    MS.Entertainment.ViewModels.assert(false, "Query result passed to _safeGetFirstItem has no outer container");
                    return WinJS.Promise.wrap(null)
                }
                return entries.itemsFromIndex(0)
            }, _safeGetEditorialItemsFromOuterItem: function _safeGetEditorialItemsFromOuterItem(item) {
                    if (!item || !item.items[0] || !item.items[0].data) {
                        MS.Entertainment.ViewModels.assert(false, "Item passed to _safeGetEditorialItemsFromOuterItem has no data");
                        return null
                    }
                    return item.items[0].data.editorialItems
                }, createFeaturedContentDataSource: function createFeaturedContentDataSource(flatItems) {
                    return {bindableItems: new MS.Entertainment.ObservableArray(flatItems).bindableItems}
                }, wrapOverrideItem: function wrapOverrideItem(item) {
                    var setProperty = MS.Entertainment.Utilities.BindingAgnostic.setProperty;
                    var popOverConstructor = null;
                    switch (item.actionType.mediaType) {
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
                    var mediaItem = WinJS.Binding.unwrap(item);
                    if (mediaItem.actionType.location === MS.Entertainment.Data.Augmenter.Spotlight.MediaType.FlexHub || mediaItem.actionType.location === MS.Entertainment.Data.Augmenter.Spotlight.MediaType.ZuneFlexHub) {
                        var flexHubClick = function flexHubClicked() {
                                var stateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                                if (!stateService.servicesEnabled)
                                    return MS.Entertainment.UI.Shell.showAppUpdateDialog();
                                mediaItem.overrideItemUseUrl = false;
                                MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).navigateTo(MS.Entertainment.UI.Monikers.flexHubPage, MS.Entertainment.UI.Monikers.flexHub, null, {query: mediaItem.actionTarget})
                            };
                        setProperty(mediaItem, "doclick", flexHubClick)
                    }
                    else {
                        var itemClicked = function itemClicked() {
                                var stateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                                if (!stateService.servicesEnabled)
                                    return MS.Entertainment.UI.Shell.showAppUpdateDialog();
                                var popOverParameters = {itemConstructor: popOverConstructor};
                                popOverParameters.dataContext = {
                                    data: mediaItem, location: MS.Entertainment.Data.ItemLocation.marketplace
                                };
                                mediaItem.overrideItemUseUrl = false;
                                MS.Entertainment.Platform.PlaybackHelpers.showItemDetails(popOverParameters)
                            };
                        setProperty(mediaItem, "doclick", itemClicked)
                    }
                    return mediaItem
                }, wrapItem: function wrapItem(item) {
                    var setProperty = MS.Entertainment.Utilities.BindingAgnostic.setProperty;
                    var query;
                    var promoClicked;
                    var flexHubClicked;
                    var popOverConstructor;
                    var mediaItem = item;
                    var showItemDetails = true;
                    switch (item.type) {
                        case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Movie:
                            popOverConstructor = "MS.Entertainment.Pages.MovieInlineDetails";
                            break;
                        case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Episode:
                        case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Season:
                        case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Series:
                            popOverConstructor = MS.Entertainment.Utilities.getTvInlineDetailsPopoverControl();
                            break;
                        case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Artist:
                            popOverConstructor = "MS.Entertainment.Pages.MusicArtistInlineDetails";
                            break;
                        case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Album:
                            popOverConstructor = "MS.Entertainment.Pages.MusicAlbumInlineDetails";
                            break;
                        case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Track:
                            popOverConstructor = "MS.Entertainment.Pages.MusicArtistInlineDetails";
                            break;
                        case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Hub:
                            setProperty(item, "isFlexHub", true);
                            break;
                        default:
                            showItemDetails = false;
                            MS.Entertainment.ViewModels.assert(item.type === undefined, "Unknown type passed into wrapItem: " + item.type);
                            break
                    }
                    if (item.type !== MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Hub) {
                        var queriedData;
                        if (item.type === MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Track) {
                            query = new MS.Entertainment.Data.Query.Music.SongDetails;
                            if (query) {
                                query.id = item.serviceId;
                                query.idType = item.serviceIdType;
                                query.execute().done(function querySuccess(q) {
                                    queriedData = q.result.item
                                }, function queryFailure(){})
                            }
                        }
                        else
                            queriedData = mediaItem;
                        promoClicked = MS.Entertainment.Utilities.bindAndMarkSupportedForProcessing(function promoClicked(e) {
                            var stateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                            if (!stateService.servicesEnabled)
                                return MS.Entertainment.UI.Shell.showAppUpdateDialog();
                            if (!this._isOnline) {
                                var errorCode = MS.Entertainment.Platform.Playback.Error.NS_E_WMPIM_USEROFFLINE.code;
                                return MS.Entertainment.UI.Shell.showError(String.load(String.id.IDS_FAILED_PANEL_HEADER), errorCode)
                            }
                            else if (queriedData && showItemDetails) {
                                var popOverParameters = {
                                        itemConstructor: popOverConstructor, dataContext: {
                                                location: MS.Entertainment.Data.ItemLocation.marketplace, data: queriedData
                                            }
                                    };
                                MS.Entertainment.Platform.PlaybackHelpers.showItemDetails(popOverParameters)
                            }
                        }, this);
                        setProperty(item, "doclick", promoClicked)
                    }
                    else {
                        flexHubClicked = MS.Entertainment.Utilities.bindAndMarkSupportedForProcessing(function flexHubClicked(e) {
                            var stateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                            if (!stateService.servicesEnabled)
                                return MS.Entertainment.UI.Shell.showAppUpdateDialog();
                            if (!this._isOnline) {
                                var errorCode = MS.Entertainment.Platform.Playback.Error.NS_E_WMPIM_USEROFFLINE.code;
                                return MS.Entertainment.UI.Shell.showError(String.load(String.id.IDS_FAILED_PANEL_HEADER), errorCode)
                            }
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).navigateTo(MS.Entertainment.UI.Monikers.flexHubPage, MS.Entertainment.UI.Monikers.flexHub, null, {
                                query: item.target, sourceQueryId: item.queryId
                            })
                        }, this);
                        setProperty(item, "doclick", flexHubClicked)
                    }
                    return item
                }
        })})
})()
