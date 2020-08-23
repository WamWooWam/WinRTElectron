/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/observablearray.js", "/Framework/serviceLocator.js", "/Framework/utilities.js", "/Framework/imageLoader.js");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {TopMusicViewModel: MS.Entertainment.defineOptionalObservable(function topMusicViewModelConstructor(query) {
            if (!query)
                throw new Error("Query required for TopMusicViewModel");
            this._query = query;
            this._networkStatusBinding = WinJS.Binding.bind(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState), {networkStatus: this._onNetworkStatusChanged.bind(this)});
            this._dashboardRefreshBinding = MS.Entertainment.UI.Framework.addEventHandlers(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dashboardRefresher), {refreshDashboard: this._dashboardRefreshChanged.bind(this)})
        }, {
            _query: null, _queryWatcher: null, _currentQueryPromise: null, _fileTransferListenerId: null, _viewModelId: null, _networkStatusBinding: null, _isOnline: null, _initialized: false, _allItems: undefined, _numItemsToShow: 0, _itemMap: null, _lastQueryFailed: true, _modelReady: false, _dashboardFrozen: false, _refreshOnDashboardThaw: false, _previousStringifiedItems: String.empty, dispose: function dispose() {
                    if (this._networkStatusBinding) {
                        this._networkStatusBinding.cancel();
                        this._networkStatusBinding = null
                    }
                    if (this._dashboardRefreshBinding) {
                        this._dashboardRefreshBinding.cancel();
                        this._dashboardRefreshBinding = null
                    }
                }, thaw: function thaw() {
                    if (this._lastQueryFailed)
                        this.getItems()
                }, _initializeOnce: function _initializeOnce() {
                    if (this._currentQueryPromise) {
                        this._currentQueryPromise.cancel();
                        this._currentQueryPromise = null
                    }
                    this._fileTransferListenerId = this._fileTransferListenerId || this._viewModelId + "_" + Date.now() + "_" + Math.random();
                    this._queryWatcher = this._queryWatcher || new MS.Entertainment.Framework.QueryWatcher(this._viewModelId);
                    this._initialized = true
                }, getItems: function getItems(refreshing) {
                    var result = WinJS.Promise.wrap(null);
                    this._itemMap = {};
                    MS.Entertainment.ViewModels.assert(this.maxItems, "Must specify number of items for TopMusicViewModel");
                    if (!this.maxItems) {
                        this.allItems = null;
                        return result
                    }
                    this._modelReady = true;
                    this._initializeOnce();
                    this._beginQuery(this._query);
                    this._queryWatcher.registerQuery(this._query);
                    result = this._currentQueryPromise = this._query.execute().then(function queryComplete(q) {
                        if (q.result.items)
                            return q.result.items.toArray();
                        else
                            return WinJS.Promise.wrapError()
                    }.bind(this)).then(function _populateItems(result) {
                        var goodItems = [];
                        for (var i = 0; i < result.length && goodItems.length < this.maxItems; i++) {
                            var item = result[i];
                            if (item.hasServiceId)
                                this._itemMap[item.serviceId.toLowerCase()] = true;
                            goodItems.push(this.wrapItem(item))
                        }
                        this._completeQuery(this._query);
                        var stringifiedNewItems = JSON.stringify(goodItems);
                        if (stringifiedNewItems === this._previousStringifiedItems)
                            return;
                        this._previousStringifiedItems = stringifiedNewItems;
                        this._currentQueryPromise = null;
                        this.allItems = goodItems;
                        this._lastQueryFailed = false;
                        return this.allItems
                    }.bind(this), function queryFailed(error) {
                        if (!refreshing)
                            this.allItems = this._createDefaultItems();
                        this._currentQueryPromise = null;
                        this._completeQuery(this._query);
                        this._lastQueryFailed = true;
                        return this.allItems
                    }.bind(this));
                    return result
                }, _createDefaultItems: function _setDefaultItems() {
                    var items = [];
                    for (var i = 0; i < this.maxItems; i++)
                        items.push(this.wrapItem(this._defaultItem()));
                    return items
                }, _defaultItem: function _defaultItem() {
                    return {}
                }, wrapItem: function wrapItem(item) {
                    var setProperty = MS.Entertainment.Utilities.BindingAgnostic.setProperty;
                    MS.Entertainment.UI.Shell.ImageLoader.getServiceImageUrl(item).then(function setPrimaryImageUrl(url) {
                        setProperty(item, "imagePrimaryUrl", url)
                    }.bind(this));
                    setProperty(item, "imageFallbackUrl", MS.Entertainment.UI.Shell.ImageLoader.getMediaItemDefaultImageUrl(item));
                    var promoClicked = WinJS.Utilities.markSupportedForProcessing(function _promoClicked(e) {
                            var stateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                            if (!stateService.servicesEnabled)
                                return MS.Entertainment.UI.Shell.showAppUpdateDialog();
                            var mediaItem = e.target;
                            if (mediaItem && !mediaItem.isInvalid) {
                                var popOverConstructor = null;
                                if (mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.album)
                                    popOverConstructor = "MS.Entertainment.Pages.MusicAlbumInlineDetails";
                                else if (mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.person)
                                    popOverConstructor = "MS.Entertainment.Pages.MusicArtistInlineDetails";
                                else
                                    popOverConstructor = e.panelConstructor;
                                var popOverParameters = {itemConstructor: popOverConstructor};
                                popOverParameters.dataContext = {
                                    data: mediaItem, location: MS.Entertainment.Data.ItemLocation.marketplace
                                };
                                MS.Entertainment.Platform.PlaybackHelpers.showItemDetails(popOverParameters)
                            }
                        });
                    setProperty(item, "doclick", promoClicked);
                    return item
                }, _beginQuery: function _beginQuery(query){}, _completeQuery: function _completeQuery(query){}, _failQuery: function _failQuery(query){}, _onNetworkStatusChanged: function _onNetworkStatusChanged(newValue) {
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
                        if (this._initialized && this._isOnline)
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
                        WinJS.Promise.timeout(MS.Entertainment.UI.DashboardRefresherService.refreshDelayTime).then(function timeoutFunction() {
                            if (this._modelReady)
                                this.getItems(true)
                        }.bind(this))
                    }
                    this._dashboardFrozen = false
                }, _populateItems: function _populateItems() {
                    if (!this._allItems)
                        this.items = null;
                    else {
                        var numItemsToShow = this._numItemsToShow ? Math.min(this._numItemsToShow, this.maxItems) : this.maxItems;
                        this.items = this._allItems.slice(0, numItemsToShow);
                        this.bindableItems = new MS.Entertainment.ObservableArray(this.items).bindableItems
                    }
                }, numItemsToShow: {
                    get: function dashboardContentViewModel_numItemsToShow_get() {
                        return this._numItemsToShow
                    }, set: function dashboardContentViewModel_numItemsToShow_set(value) {
                            this._numItemsToShow = value;
                            this._populateItems()
                        }
                }, allItems: {
                    get: function dashboardContentViewModel_allItems_get() {
                        return this._allItems
                    }, set: function dashboardContentViewModel_allItems_set(value) {
                            this._allItems = value;
                            this._populateItems()
                        }
                }, _filterNotifications: function _filterNotifications(notificationId) {
                    return (!notificationId || !this._itemMap || !this._itemMap[notificationId.toLowerCase()])
                }
        }, {
            bindableItems: null, maxItems: 0, items: undefined, action: null
        })});
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {TopAlbumsViewModel: MS.Entertainment.deferredDerive(MS.Entertainment.ViewModels.TopMusicViewModel, function topAlbumsViewModelConstructor(query) {
            this.base(query)
        }, {
            _viewModelId: "TopAlbumsViewModel", _sender: null, _senderQuery: null, _beginQuery: function _beginQuery(query) {
                    if (query !== this._senderQuery) {
                        var sender = null;
                        var notifications = new MS.Entertainment.UI.ContentNotification.NotificationModification(MS.Entertainment.UI.ContentNotification.listResult(), MS.Entertainment.UI.FileTransferService.keyFromProperty("serviceId", false, true));
                        sender = notifications.createSender();
                        notifications.modifyQuery(query);
                        this._sender = sender;
                        this._senderQuery = query
                    }
                }, _completeQuery: function _completeQuery(query) {
                    if (query === this._senderQuery && this._sender) {
                        var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                        fileTransferService.registerListener(this._fileTransferListenerId, MS.Entertainment.UI.FileTransferService.keyFromProperty("albumMediaId", false, true), this._sender, MS.Entertainment.UI.FileTransferNotifiers.trackCollection, null, this._filterNotifications.bind(this));
                        this._sender = null
                    }
                }, _failQuery: function _failQuery(query) {
                    if (query === this._senderQuery) {
                        this._sender = null;
                        this._senderQuery = null
                    }
                }, _defaultItem: function _defaultItem() {
                    return MS.Entertainment.Data.augment({isInvalid: true}, MS.Entertainment.Data.Augmenter.Marketplace.EDSAlbum)
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {TopArtistViewModel: MS.Entertainment.deferredDerive(MS.Entertainment.ViewModels.TopMusicViewModel, function topArtistViewModelConstructor(query) {
            this.base(query)
        }, {
            _viewModelId: "TopArtistViewModel", _defaultItem: function _defaultItem() {
                    return MS.Entertainment.Data.augment({isInvalid: true}, MS.Entertainment.Data.Augmenter.Marketplace.EDSArtist)
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {NewReleasesViewModel: MS.Entertainment.defineObservable(function dashboardContentViewModelConstructor(query) {
            if (!query)
                throw new Error("Query required for NewReleasesViewModel");
            this._query = query;
            this._fileTransferListenerId = "NewReleasesViewModel_" + Date.now() + "_" + Math.random();
            this._queryWatcher = new MS.Entertainment.Framework.QueryWatcher("NewReleasesViewModel");
            this._networkStatusBinding = WinJS.Binding.bind(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState), {networkStatus: this._onNetworkStatusChanged.bind(this)})
        }, {
            maxItems: 0, items: undefined, _itemMap: null, action: null, panelAction: null, _query: null, _queryWatcher: null, _fileTransferListenerId: null, _networkStatusBinding: null, _isOnline: null, _modelReady: false, _sender: null, _lastQueryFailed: true, thaw: function thaw() {
                    if (this._lastQueryFailed)
                        this.getItems()
                }, getItems: function getItems() {
                    MS.Entertainment.ViewModels.assert(this.maxItems, "Must specify number of items for NewReleasesViewModel");
                    this._itemMap = {};
                    if (!this.maxItems) {
                        this.items = null;
                        return
                    }
                    this._modelReady = true;
                    if (this._isOnline) {
                        if (!this._sender) {
                            var notifications = new MS.Entertainment.UI.ContentNotification.NotificationModification(MS.Entertainment.UI.ContentNotification.listResult(), MS.Entertainment.UI.FileTransferService.keyFromProperty("serviceId", false, true));
                            this._sender = notifications.createSender();
                            notifications.modifyQuery(this._query)
                        }
                        this._queryWatcher.registerQuery(this._query);
                        return this._query.execute().then(function queryComplete(q) {
                                if (q.result.items)
                                    return q.result.items.itemsFromIndex(0);
                                else
                                    return WinJS.Promise.wrapError()
                            }.bind(this)).then(function populateItems(result) {
                                var goodItems = [];
                                for (var i = 0; i < result.items.length && goodItems.length < this.maxItems; i++) {
                                    var item = result.items[i].data;
                                    if (item.hasServiceId)
                                        this._itemMap[item.serviceId.toLowerCase()] = true;
                                    goodItems.push(this.wrapItem(item))
                                }
                                var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                                fileTransferService.registerListener(this._fileTransferListenerId, MS.Entertainment.UI.FileTransferService.keyFromProperty("albumMediaId", false, true), this._sender, MS.Entertainment.UI.FileTransferNotifiers.trackCollection, null, this._filterNotifications.bind(this));
                                this.items = goodItems;
                                this._lastQueryFailed = false
                            }.bind(this), function queryFailed() {
                                this._lastQueryFailed = true;
                                this.items = this._createDefaultItems()
                            }.bind(this))
                    }
                    else {
                        this._lastQueryFailed = false;
                        this.items = null
                    }
                }, wrapItem: function wrapItem(item) {
                    var setProperty = MS.Entertainment.Utilities.BindingAgnostic.setProperty;
                    setProperty(item, "primaryText", item.name);
                    setProperty(item, "secondaryText", item.artistName);
                    MS.Entertainment.UI.Shell.ImageLoader.getServiceImageUrl(item).then(function setPrimaryImageUrl(url) {
                        setProperty(item, "imagePrimaryUrl", url)
                    }.bind(this));
                    setProperty(item, "imageFallbackUrl", MS.Entertainment.UI.Shell.ImageLoader.getMediaItemDefaultImageUrl(item));
                    var promoClicked = WinJS.Utilities.markSupportedForProcessing(function _promoClicked(e) {
                            var mediaItem = e.target;
                            if (mediaItem && !mediaItem.isInvalid) {
                                var popOverParameters = {
                                        itemConstructor: e.panelConstructor, size: MS.Entertainment.Utilities.popOverDefaultSize
                                    };
                                popOverParameters.dataContext = item.marketplacePanelData || {};
                                popOverParameters.dataContext.data = mediaItem;
                                MS.Entertainment.Platform.PlaybackHelpers.showItemDetails(popOverParameters)
                            }
                        });
                    setProperty(item, "doclick", promoClicked);
                    return item
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
                        if (this._modelReady)
                            this.getItems()
                    }
                }, _createDefaultItems: function _setDefaultItems() {
                    var items = [];
                    for (var i = 0; i < this.maxItems; i++)
                        items.push(this.wrapItem(this._defaultItem()));
                    return items
                }, _defaultItem: function _defaultItem() {
                    return MS.Entertainment.Data.augment({isInvalid: true}, MS.Entertainment.Data.Augmenter.Marketplace.EDSAlbum)
                }, _filterNotifications: function _filterNotifications(notificationId) {
                    return (!notificationId || !this._itemMap || !this._itemMap[notificationId.toLowerCase()])
                }
        })})
})()
