/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function() {
    "use strict";
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls");
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {
        LibraryFeaturedDataNotificationHandler: MS.Entertainment.UI.Framework.define(function libraryFeaturedDataNotificationHandler(listUpdateCallback, itemUpdateCallback) {
            this._listUpdateCallback = listUpdateCallback;
            this._itemUpdateCallback = itemUpdateCallback
        }, {
            _listUpdateCallback: null, _itemUpdateCallback: null, dispose: function dispose() {
                    this._listUpdateCallback = null;
                    this._itemUpdateCallback = null
                }, inserted: function inserted(item, previousKey, nextKey, index) {
                    if (this._listUpdateCallback)
                        this._listUpdateCallback(index)
                }, changed: function changed(newItem, oldItem) {
                    if (this._itemUpdateCallback)
                        this._itemUpdateCallback(newItem, oldItem)
                }, moved: function moved(item, previousKey, nextKey, oldIndex, newIndex){}, removed: function removed(key, index) {
                    if (this._listUpdateCallback)
                        this._listUpdateCallback(index, key)
                }, countChanged: function countChanged(newCount, oldCount){}
        }), NoContentPane: MS.Entertainment.UI.Framework.defineUserControl("/Controls/LibraryFeaturedContent.html#noContentPaneTemplate", null, {
                _modelBindings: null, initialize: function initialize() {
                        if (this.model) {
                            if (this.model.primaryText)
                                this.title = this.model.primaryText;
                            else if (this.model.primaryStringId)
                                this.title = String.load(this.model.primaryStringId);
                            if (this.model.secondaryText)
                                this.description = this.model.secondaryText;
                            else if (this.model.secondaryStringId)
                                this.description = String.load(this.model.secondaryStringId);
                            this._modelBindings = WinJS.Binding.bind(this.model, {details: this._onDetailsChanged.bind(this)})
                        }
                    }, unload: function unload() {
                        MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this);
                        if (this._modelBindings) {
                            this._modelBindings.cancel();
                            this._modelBindings = null
                        }
                    }, _onDetailsChanged: function _onDetailsChanged(newValue) {
                        this.details = newValue
                    }
            }, {
                title: null, description: null, details: null, model: null
            })
    });
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {LibraryFeaturedContent: MS.Entertainment.UI.Framework.defineUserControl(null, function libraryFeaturedContentConstructor(element, options) {
            this._queryWatcher = new MS.Entertainment.Framework.QueryWatcher("libraryFeaturedContent");
            this._rebuildDataOnWindowSizeChange = this._rebuildDataOnWindowSizeChange.bind(this)
        }, {
            _queryResults: null, _itemsVisible: -1, _queryWatcher: null, _populateTimeout: null, controlName: "LibraryFeaturedContent", _fileTransferListenerId: null, _signInBinding: null, _queryBinding: null, _pendingLoadPromises: null, _queryPromise: null, _onScreen: true, _queryEventHandlers: null, _currentlySelectedItem: null, hidePanelWhenEmpty: false, _maxItems: {get: function get_maxItems() {
                        return MS.Entertainment.Utilities.HIGH_RESOLUTION_ROWS * 3
                    }}, initialize: function initialize() {
                    var librayQueryUpdated = function libraryQueryChanged() {
                            if (this._signInBinding) {
                                this._signInBinding.cancel();
                                this._signInBinding = null
                            }
                            var appSignIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                            this._signInBinding = WinJS.Binding.bind(appSignIn, {isSignedIn: this.refreshQueries.bind(this)})
                        };
                    this._queryBinding = WinJS.Binding.bind(this, {libraryQuery: librayQueryUpdated.bind(this)})
                }, refreshQueries: function refreshQueries() {
                    if (this._queryPromise) {
                        this._queryPromise.cancel();
                        this._queryPromise = null
                    }
                    var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                    if (MS.Entertainment.Utilities.isVideoApp1 || signIn.isSignedIn)
                        this._queryPromise = WinJS.Promise.timeout(1000).then(function delayQuery() {
                            return this.executeQueries()
                        }.bind(this));
                    else
                        this._updateItems([])
                }, executeQueries: function executeQueries() {
                    this._cancelPendingLoads();
                    this._unregisterContentNotificationListeners();
                    var pendingLoadPromisesArray = [];
                    var pendingLoadPromises;
                    if (this.libraryQuery && this._loadFeaturedItems)
                        if (Array.isArray(this.libraryQuery)) {
                            this._queryResults = [];
                            this._fileTransferListenerId = [];
                            for (var i = 0; i < this.libraryQuery.length; i++) {
                                this._fileTransferListenerId[i] = "LibraryFeaturedContent_" + Date.now() + "_" + Math.random();
                                pendingLoadPromisesArray.push(this._loadFeaturedItems(i))
                            }
                        }
                        else {
                            this._fileTransferListenerId = "LibraryFeaturedContent_" + Date.now() + "_" + Math.random();
                            pendingLoadPromisesArray.push(this._loadFeaturedItems())
                        }
                    pendingLoadPromises = WinJS.Promise.join(pendingLoadPromisesArray);
                    this._pendingLoadPromises = pendingLoadPromises;
                    pendingLoadPromises.done(function loadingComplete() {
                        if (pendingLoadPromises === this._pendingLoadPromises)
                            this._pendingLoadPromises = null
                    }.bind(this), function loadingFailed() {
                        if (pendingLoadPromises === this._pendingLoadPromises) {
                            this._pendingLoadPromises = null;
                            if (!this._queryResults || !this._queryResults.length)
                                this._updateItems([])
                        }
                    }.bind(this))
                }, unload: function unload() {
                    if (this._queryBinding) {
                        this._queryBinding.cancel();
                        this._queryBinding = null
                    }
                    if (this._signInBinding) {
                        this._signInBinding.cancel();
                        this._signInBinding = null
                    }
                    this._cancelPendingLoads();
                    if (this._populateTimeout) {
                        this._populateTimeout.cancel();
                        this._populateTimeout = null
                    }
                    if (this._queryEventHandlers) {
                        this._queryEventHandlers.cancel();
                        this._queryEventHandlers = null
                    }
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).removeEventListener("windowresize", this._rebuildDataOnWindowSizeChange);
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, freeze: function freeze() {
                    this.onOffScreen();
                    MS.Entertainment.UI.Framework.UserControl.prototype.freeze.call(this)
                }, thaw: function thaw() {
                    MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this);
                    this.onOnScreen()
                }, onOffScreen: function onOffScreen() {
                    if (this._onScreen)
                        this._pauseQueries();
                    this._onScreen = false
                }, onOnScreen: function onOnScreen() {
                    if (!this._onScreen)
                        this._unPauseQueries();
                    this._onScreen = true
                }, onItemSelected: function onItemSelected(e) {
                    this._pauseQueries();
                    this._currentlySelectedItem = e.srcElement
                }, onItemDeselected: function onItemDeselected(e) {
                    if (e.srcElement === this._currentlySelectedItem) {
                        this._unPauseQueries();
                        this._currentlySelectedItem = null
                    }
                }, _pauseQueries: function _pauseQueries() {
                    if (this.libraryQuery)
                        if (Array.isArray(this.libraryQuery))
                            this.libraryQuery.forEach(function unpauseQuery(query) {
                                if (query.pause)
                                    query.pause()
                            });
                        else if (this.libraryQuery.pause)
                            this.libraryQuery.pause()
                }, _unPauseQueries: function _unPauseQueries() {
                    if (this.libraryQuery)
                        if (Array.isArray(this.libraryQuery))
                            this.libraryQuery.forEach(function unpauseQuery(query) {
                                if (query.unpause)
                                    query.unpause()
                            });
                        else if (this.libraryQuery.unpause)
                            this.libraryQuery.unpause()
                }, _cancelPendingLoads: function _cancelPendingLoads() {
                    if (this._pendingLoadPromises) {
                        this._pendingLoadPromises.cancel();
                        this._pendingLoadPromises = null
                    }
                }, _loadFeaturedItems: function _loadFeaturedItems(index) {
                    var query = (index >= 0) ? this.libraryQuery[index] : this.libraryQuery;
                    var listenerId = (index >= 0) ? this._fileTransferListenerId[index] : this._fileTransferListenerId;
                    var sender = this._modifyQueryForContentNotifications(query);
                    this._queryWatcher.registerQuery(query);
                    if ("isLive" in query)
                        query.isLive = true;
                    if (this._queryEventHandlers) {
                        this._queryEventHandlers.cancel();
                        this._queryEventHandlers = null
                    }
                    return query.execute().then(function libraryFeaturedContentQueryComplete(q) {
                            if (index >= 0)
                                this._queryResults[index] = q.result.items;
                            else
                                this._queryResults = q.result.items;
                            this._registerContentNotificationListener(sender, listenerId);
                            if (q.isLive)
                                q.result.items.setNotificationHandler(new MS.Entertainment.UI.Controls.LibraryFeaturedDataNotificationHandler(this._handleDataNotifications.bind(this), this._handleDataUpdates.bind(this)));
                            this._queryEventHandlers = MS.Entertainment.Utilities.addEventHandlers(q, {resultChanged: function handleQueryResultChanged() {
                                    this._handleQueryResultChanged(query, index)
                                }.bind(this)});
                            this._populateContent();
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).addEventListener("windowresize", this._rebuildDataOnWindowSizeChange)
                        }.bind(this), function libraryFeaturedContentQueryError(q) {
                            return null
                        })
                }, _handleQueryResultChanged: function _handleQueryResultChanged(query, index) {
                    if (index >= 0)
                        this._queryResults[index] = query.result && query.result.items;
                    else
                        this._queryResults = query.result && query.result.items;
                    this._populateContent()
                }, _rebuildDataOnWindowSizeChange: function _rebuildDataOnWindowSizeChange() {
                    this._populateContent(true)
                }, _handleDataUpdates: function _handleDateUpdates(newItem, oldItem){}, _handleDataNotifications: function _handleDataNotifications(index, key) {
                    MS.Entertainment.UI.Controls.assert(this._populateContent, "For db updates, LibraryFeaturedContent requires _populateContent defined");
                    if (index > this._maxItems)
                        return;
                    if (!key) {
                        if (!this.items || this._itemsVisible <= 0 || this.items.length < this._itemsVisible || index < this._itemsVisible)
                            this._deferredPopulateContent()
                    }
                    else
                        for (var i = 0; i < this.items.length; i++)
                            if (this.items[i].key === key) {
                                this._deferredPopulateContent();
                                break
                            }
                }, _deferredPopulateContent: function _deferredPopulateContent() {
                    if (this._populateTimeout) {
                        this._populateTimeout.cancel();
                        this._populateTimeout = null
                    }
                    this._populateTimeout = WinJS.Promise.timeout(300).then(this._populateContent.bind(this), function cancelledHandler(error){})
                }, _updateItems: function _updateItems(libraryItems) {
                    if (!this._content || !this._emptyContent)
                        return;
                    var hasItems = libraryItems && libraryItems.length > 0;
                    if (!hasItems) {
                        WinJS.Utilities.addClass(this._content.domElement, "removeFromDisplay");
                        WinJS.Utilities.removeClass(this._emptyContent.noContentPane, "removeFromDisplay");
                        WinJS.Utilities.addClass(this._emptyContent.noContentPane, this.emptyLibraryStyle)
                    }
                    else {
                        WinJS.Utilities.removeClass(this._content.domElement, "removeFromDisplay");
                        WinJS.Utilities.addClass(this._emptyContent.noContentPane, "removeFromDisplay");
                        WinJS.Utilities.removeClass(this._emptyContent.noContentPane, this.emptyLibraryStyle)
                    }
                    if (this.hidePanelWhenEmpty) {
                        var rootElement = MS.Entertainment.Utilities.findParentElementByClassName(this.domElement, "dashboardPanel");
                        if (hasItems)
                            WinJS.Utilities.removeClass(rootElement, "removeFromDisplay");
                        else
                            WinJS.Utilities.addClass(rootElement, "removeFromDisplay")
                    }
                    this.items = libraryItems;
                    MS.Entertainment.UI.Controls.Panel.raisePanelReady(this.domElement)
                }, _unregisterContentNotificationListeners: function _unregisterContentNotificationListeners() {
                    if (this._fileTransferListenerId && MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.fileTransfer)) {
                        var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                        if (Array.isArray(this._fileTransferListenerId))
                            for (var i = 0; i < this._fileTransferListenerId.length; i++) {
                                fileTransferService.unregisterListener(this._fileTransferListenerId[i]);
                                this._fileTransferListenerUnregistered(fileTransferService, this._fileTransferListenerId[i])
                            }
                        else {
                            fileTransferService.unregisterListener(this._fileTransferListenerId);
                            this._fileTransferListenerUnregistered(fileTransferService, this._fileTransferListenerId)
                        }
                    }
                }, _modifyQueryForContentNotifications: function _modifyQueryForContentNotifications(query) {
                    var sender = null;
                    return sender
                }, _registerContentNotificationListener: function _registerContentNotificationListener(sender, listenerId){}, _fileTransferListenerUnregistered: function _fileTransferListenerUnregistered(fileTransferService, listenerId){}, _filterNotifications: function _filterNotifications(notificationId) {
                    return false
                }
        }, {
            items: undefined, emptyLibraryStyle: null, emptyLibraryModel: null, libraryClicked: null, libraryQuery: null
        })});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {LibraryVideoEmptyFeaturedContent: MS.Entertainment.UI.Framework.defineUserControl("/Controls/LibraryFeaturedContent.html#libraryEmptyContentTemplate", function LibraryVideoEmptyFeaturedContent(element, options){}, {
            _bindings: null, _refreshPromise: null, _emptyCollectionPromise: null, initialize: function initialize() {
                    this._setupBindings()
                }, _setupBindings: function _setupBindings() {
                    if (this._bindings) {
                        this._bindings.cancel();
                        this._bindings = null
                    }
                    var updateStateBinding = this._updateState.bind(this);
                    this._bindings = WinJS.Binding.bind(this, {sharedData: {
                            isSignedIn: updateStateBinding, isGrovelling: updateStateBinding, isQuerying: updateStateBinding, tvCount: updateStateBinding, movieCount: updateStateBinding
                        }})
                }, unload: function unload() {
                    if (this._bindings) {
                        this._bindings.cancel();
                        this._bindings = null
                    }
                    if (this._emptyCollectionPromise) {
                        this._emptyCollectionPromise.cancel();
                        this._emptyCollectionPromise = null
                    }
                    if (this.sharedData) {
                        this.sharedData.unload();
                        this.sharedData = null
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, signInClickHandler: function signInClickHandler() {
                    var signInPromise = null;
                    var appSignIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                    if (appSignIn)
                        signInPromise = appSignIn.signIn();
                    return WinJS.Promise.as(signInPromise).then(function onSignInComplete() {
                            if (this.sharedData)
                                this.sharedData.isSignedIn = appSignIn.isSignedIn
                        }.bind(this))
                }, browseMoviesClickHandler: function browseMoviesClickHandler() {
                    var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                    if (navigationService)
                        navigationService.navigateTo(MS.Entertainment.UI.Monikers.movieMarketplace, MS.Entertainment.UI.Monikers.movieMarketplaceNewReleases)
                }, browseTvClickHandler: function browseTvClickHandler() {
                    var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                    if (navigationService)
                        navigationService.navigateTo(MS.Entertainment.UI.Monikers.tvMarketplace, MS.Entertainment.UI.Monikers.tvMarketplaceFeatured)
                }, searchClickHandler: function searchClickHandler() {
                    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                    if (actionService) {
                        var searchAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.search);
                        return searchAction.execute()
                    }
                }, _updateState: function _updateState() {
                    if (this._refreshPromise) {
                        this._refreshPromise.cancel();
                        this._refreshPromise = null
                    }
                    this._refreshPromise = WinJS.Promise.timeout(100).then(function refreshAfterDelay() {
                        var title = String.empty;
                        var description = String.empty;
                        var showSignInButton = false;
                        var showBrowseMoviesButton = false;
                        var showBrowseTvButton = false;
                        var showSearchButton = false;
                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        var movieMarketplaceEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace);
                        var tvMarketplaceEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace);
                        if (this.sharedData) {
                            if (this._emptyCollectionPromise) {
                                this._emptyCollectionPromise.cancel();
                                this._emptyCollectionPromise = null
                            }
                            if (!this.sharedData.isSignedIn && !this.sharedData.isSigningIn) {
                                title = String.load(String.id.IDS_VIDEO2_COLLECTION_ANON_TITLE);
                                if (movieMarketplaceEnabled && tvMarketplaceEnabled)
                                    description = String.load(String.id.IDS_VIDEO2_COLLECTION_ANON_DESCRIPTION);
                                else if (movieMarketplaceEnabled)
                                    description = String.load(String.id.IDS_VIDEO2_COLLECTION_ANON_MOVIESMARKETPLACE_ONLY_DESCRIPTION);
                                else {
                                    MS.Entertainment.UI.Controls.assert(tvMarketplaceEnabled, "No TV or movies marketplace was enabled");
                                    description = String.load(String.id.IDS_VIDEO2_COLLECTION_ANON_TVMARKETPLACE_ONLY_DESCRIPTION)
                                }
                                showSignInButton = true
                            }
                            else if (this.sharedData.isSigningIn || this.sharedData.isGrovelling || this.sharedData.isQuerying) {
                                title = String.load(String.id.IDS_VIDEO2_COLLECTION_GROVEL_TITLE);
                                if (movieMarketplaceEnabled && tvMarketplaceEnabled)
                                    description = String.load(String.id.IDS_VIDEO2_COLLECTION_GROVEL_DESCRIPTION);
                                else if (movieMarketplaceEnabled)
                                    description = String.load(String.id.IDS_VIDEO2_COLLECTION_GROVEL_MOVIESMARKETPLACE_ONLY_DESCRIPTION);
                                else {
                                    MS.Entertainment.UI.Controls.assert(tvMarketplaceEnabled, "No TV or movies marketplace was enabled");
                                    description = String.load(String.id.IDS_VIDEO2_COLLECTION_GROVEL_TVMARKETPLACE_ONLY_DESCRIPTION)
                                }
                                showBrowseMoviesButton = movieMarketplaceEnabled;
                                showBrowseTvButton = tvMarketplaceEnabled;
                                showSearchButton = true
                            }
                            else if (this.sharedData.tvCount === 0 && this.sharedData.movieCount === 0)
                                this._emptyCollectionPromise = WinJS.Promise.timeout(3000).then(function showEmptyCollection() {
                                    title = String.load(String.id.IDS_VIDEO2_COLLECTION_EMPTY_TITLE);
                                    if (movieMarketplaceEnabled && tvMarketplaceEnabled)
                                        description = String.load(String.id.IDS_VIDEO2_COLLECTION_EMPTY_DESCRIPTION_2);
                                    else if (movieMarketplaceEnabled)
                                        description = String.load(String.id.IDS_VIDEO2_COLLECTION_EMPTY_MOVIESMARKETPLACE_ONLY_DESCRIPTION_2);
                                    else {
                                        MS.Entertainment.UI.Controls.assert(tvMarketplaceEnabled, "No TV or movies marketplace was enabled");
                                        description = String.load(String.id.IDS_VIDEO2_COLLECTION_EMPTY_TVMARKETPLACE_ONLY_DESCRIPTION_2)
                                    }
                                    showBrowseMoviesButton = movieMarketplaceEnabled;
                                    showBrowseTvButton = tvMarketplaceEnabled;
                                    showSearchButton = true
                                }.bind(this))
                        }
                        WinJS.Promise.as(this._emptyCollectionPromise).done(function updatePanel() {
                            this.titleText = title;
                            this.descriptionText = description;
                            this.showButtonSignIn = showSignInButton;
                            this.showButtonBrowseMovies = showBrowseMoviesButton;
                            this.showButtonBrowseTv = showBrowseTvButton;
                            this.showButtonSearch = showSearchButton
                        }.bind(this))
                    }.bind(this))
                }
        }, {
            sharedData: null, titleText: String.empty, descriptionText: String.empty, showButtonSignIn: false, showButtonBrowseMovies: false, showButtonBrowseTv: false, showButtonSearch: false
        })});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {LibraryVideoFeaturedContent: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.LibraryFeaturedContent", "/Controls/LibraryFeaturedContent.html#libraryVideoContentTemplate", function(element, options) {
            this.emptyLibraryStyle = "noVideoContentPane"
        }, {
            _itemsVisible: 0, itemsColumns: 2, propertyName: ['videoType', 'mediaType'], containerStyle: 'dashboardGridPersonalItemContent', itemSize: MS.Entertainment.Utilities.personalTileSize, showNavigateToCollectionButton: true, viewMoreInfo: {
                    icon: MS.Entertainment.UI.Icon.moreActions, title: null
                }, _notifications: null, sharedData: null, sharedKey: "Video", initialize: function initialize() {
                    this.updateSettings();
                    MS.Entertainment.UI.Controls.LibraryFeaturedContent.prototype.initialize.call(this)
                }, updateSettings: function updateSettings() {
                    if (this._content) {
                        this._content.itemSize = this.itemSize;
                        this._content.propertyName = this.propertyName;
                        this._content.containerStyle = this.containerStyle;
                        this._content.itemTemplates = MS.Entertainment.Utilities.isVideoApp1 ? [{
                                value: Microsoft.Entertainment.Queries.VideoType.movie, template: '/Components/Video/VideoStartupTemplates.html#moviePosterTile'
                            }, {
                                value: Microsoft.Entertainment.Queries.VideoType.other, template: '/Components/Video/VideoStartupTemplates.html#personalFileTileL1Small'
                            }, {
                                value: Microsoft.Entertainment.Queries.ObjectType.tvSeries, template: '/Components/Video/VideoStartupTemplates.html#tvSeriesTile'
                            }, {
                                value: 'actionButton', template: '/Components/Video/VideoStartupTemplates.html#dashboardEngagePanelButton'
                            }] : [{
                                value: Microsoft.Entertainment.Queries.VideoType.movie, template: '/Components/Video/VideoStartupTemplates2.html#moviePosterTile'
                            }, {
                                value: Microsoft.Entertainment.Queries.ObjectType.tvSeries, template: '/Components/Video/VideoStartupTemplates2.html#tvSeriesTile'
                            }, {
                                value: 'actionButton', template: '/Components/Video/VideoStartupTemplates2.html#dashboardEngagePanelButton'
                            }]
                    }
                }, _maxItems: {get: function get_maxItems() {
                        return MS.Entertainment.Utilities.HIGH_RESOLUTION_VIDEO_ROWS * this.itemsColumns
                    }}, _loadFeaturedItems: function _loadFeaturedItems(index) {
                    if (this.sharedKey && this.sharedData)
                        this.sharedData[this.sharedKey] = -1;
                    MS.Entertainment.UI.Controls.LibraryFeaturedContent.prototype._loadFeaturedItems.apply(this, arguments)
                }, _updateItems: function _updateItems(libraryItems) {
                    var totalItems = this.itemsColumns * MS.Entertainment.Utilities.getRowCountForResolution();
                    if (this.sharedKey && this.sharedData) {
                        var videoCount = libraryItems ? libraryItems.length : 0;
                        this.sharedData[this.sharedKey] = videoCount
                    }
                    this.viewMoreButtonVisible = (MS.Entertainment.Utilities.isApp2 && this.showNavigateToCollectionButton && libraryItems && libraryItems.length > 0 && libraryItems.length >= totalItems);
                    MS.Entertainment.UI.Controls.LibraryFeaturedContent.prototype._updateItems.apply(this, arguments)
                }, _viewMoreClicked: function _viewMoreClicked() {
                    if (this.panelAction && this.panelAction.action)
                        this.panelAction.action.execute()
                }, _getRowCountForResolution: function _getRowCountForResolution() {
                    return MS.Entertainment.Utilities.getRowCountForResolution()
                }, _populateContent: function _populateContent(validateItemsNeeded) {
                    var totalItems = this.itemsColumns * this._getRowCountForResolution();
                    var setProperty = MS.Entertainment.Utilities.BindingAgnostic.setProperty;
                    this.updateSettings();
                    if (validateItemsNeeded && (totalItems === this._itemsVisible) && (this.items && this.items.length > 0) || !this._queryResults)
                        return;
                    this._itemsVisible = totalItems;
                    var goodItems = [];
                    return this._queryResults.forEachAll(function populateData(args) {
                            var item = args.item.data;
                            setProperty(item, "doclick", this.libraryClicked);
                            if (this.libraryQuery.queryId)
                                setProperty(item, "queryId", this.libraryQuery.queryId);
                            item.key = args.item.key;
                            if (item.mediaType === Microsoft.Entertainment.Queries.ObjectType.video || item.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeries)
                                goodItems.push(item);
                            if (goodItems.length >= this._itemsVisible)
                                args.stop = true
                        }.bind(this)).then(function updateItems() {
                            this._updateItems(goodItems)
                        }.bind(this))
                }, _modifyQueryForContentNotifications: function _modifyQueryForContentNotifications(query) {
                    var sender = null;
                    if (query && query.status === MS.Entertainment.Data.queryStatus.idle) {
                        this._notifications = new MS.Entertainment.UI.ContentNotification.NotificationModification(MS.Entertainment.UI.ContentNotification.listResult(), MS.Entertainment.UI.ContentNotification.idFromProperty("libraryId"));
                        this._notifications.modifyQuery(query);
                        sender = this._notifications.createSender()
                    }
                    return sender
                }, _handleDataUpdates: function _handleDataUpdates(newItem) {
                    MS.Entertainment.UI.Controls.LibraryFeaturedContent.prototype._handleDataUpdates.apply(this, arguments);
                    if (!newItem || !newItem.data || !this.items)
                        return;
                    var oldItem = null;
                    if (newItem.itemIndex >= 0 && this.items.length > newItem.itemIndex && this.items[newItem.itemIndex].libraryId === newItem.data.libraryId && this.items[newItem.itemIndex].mediaType === newItem.data.mediaType)
                        oldItem = this.items[newItem.itemIndex];
                    else {
                        var i = 0;
                        for (i = 0; i < this.items.length; i++) {
                            var currentItem = this.items[i];
                            if (currentItem.libraryId === newItem.data.libraryId && currentItem.mediaType === newItem.data.mediaType) {
                                oldItem = currentItem;
                                break
                            }
                        }
                    }
                    if (oldItem) {
                        if (oldItem.canPlayLocally !== newItem.data.canPlayLocally)
                            MS.Entertainment.Utilities.BindingAgnostic.setProperty(oldItem, "canPlayLocally", newItem.data.canPlayLocally);
                        if (oldItem.downloadedEpisodesCount !== newItem.data.downloadedEpisodesCount)
                            MS.Entertainment.Utilities.BindingAgnostic.setProperty(oldItem, "downloadedEpisodesCount", newItem.data.downloadedEpisodesCount)
                    }
                }
        }, {viewMoreButtonVisible: false})});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {LibraryPersonalFeaturedContent: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.LibraryVideoFeaturedContent", "/Controls/LibraryFeaturedContent.html#libraryVideoContentTemplate", function(element, options) {
            this.emptyLibraryStyle = "noVideoContentPane"
        }, {
            rowCount: 3, itemsColumns: 2, containerStyle: 'dashboardGridPersonalItemContentSmall', itemSize: MS.Entertainment.Utilities.personalTileSize, _getRowCountForResolution: function _getRowCountForResolution() {
                    return this.rowCount
                }, updateSettings: function updateSettings() {
                    if (this._content) {
                        var previousResolution = this._content.itemSize;
                        this._content.propertyName = this.propertyName;
                        if (MS.Entertainment.Utilities.isHighResolution()) {
                            this._content.itemSize = MS.Entertainment.Utilities.personalTileSize;
                            this._content.containerStyle = 'dashboardGridPersonalItemContentLarge';
                            this._content.itemTemplates = [{
                                    value: Microsoft.Entertainment.Queries.VideoType.other, template: '/Components/Video/VideoStartupTemplates.html#personalFileTileL1Large'
                                }, {
                                    value: 'actionButton', template: '/Components/Video/VideoStartupTemplates.html#dashboardEngagePanelButton'
                                }]
                        }
                        else {
                            this._content.itemSize = MS.Entertainment.Utilities.personalTileSizeL1Small;
                            this._content.containerStyle = 'dashboardGridPersonalItemContentSmall';
                            this._content.itemTemplates = [{
                                    value: Microsoft.Entertainment.Queries.VideoType.other, template: '/Components/Video/VideoStartupTemplates.html#personalFileTileL1Small'
                                }, {
                                    value: 'actionButton', template: '/Components/Video/VideoStartupTemplates.html#dashboardEngagePanelButton'
                                }]
                        }
                        if (previousResolution && previousResolution !== this._content.itemSize) {
                            this._content.applyPanelTemplate();
                            this._content.resetItemTemplate();
                            this._content.render(true)
                        }
                    }
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {LibraryMovieFeaturedContent: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.LibraryVideoFeaturedContent", "/Controls/LibraryFeaturedContent.html#libraryMovieContentTemplate", function(element, options) {
            this.emptyLibraryStyle = "noVideoContentPane";
            this.itemSize = MS.Entertainment.Utilities.isVideoApp1 ? MS.Entertainment.Utilities.movieTileSize : MS.Entertainment.Utilities.movieLargeTileSize;
            this.sharedKey = "movieCount";
            this._uiStateEventHandler = MS.Entertainment.Utilities.addEventHandlers(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState), {isFilledChanged: function isFilledChanged() {
                    this._populateContent()
                }.bind(this)})
        }, {
            _itemsColumns: 2, itemsColumns: {get: function get_itemsColumns() {
                        this._itemsColumns = MS.Entertainment.Utilities.isApp1 ? 2 : (MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isFilled) ? 2 : 3;
                        var rootElement = MS.Entertainment.Utilities.findParentElementByClassName(this.domElement, "dashboardContent");
                        if (this._itemsColumns > 2)
                            WinJS.Utilities.removeClass(rootElement, "fillMode");
                        else
                            WinJS.Utilities.addClass(rootElement, "fillMode");
                        return this._itemsColumns
                    }}, containerStyle: 'dashboardGridMovieItemContent', unload: function unload() {
                    if (this._uiStateEventHandler) {
                        this._uiStateEventHandler.cancel();
                        this._uiStateEventHandler = null
                    }
                    MS.Entertainment.UI.Controls.LibraryVideoFeaturedContent.prototype.unload.call(this)
                }, _registerContentNotificationListener: function _registerContentNotificationListener(sender, listenerId) {
                    if (sender && MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.fileTransfer)) {
                        var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                        fileTransferService.registerListener(listenerId, function getTaskKey(task) {
                            return (task && (!task.seriesMediaId || MS.Entertainment.Utilities.isEmptyGuid(task.seriesMediaId)) && task.libraryTypeId === Microsoft.Entertainment.Queries.ObjectType.video) ? task.libraryId : null
                        }, sender, MS.Entertainment.UI.FileTransferNotifiers.genericFile)
                    }
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {LibraryTvFeaturedContent: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.LibraryVideoFeaturedContent", "/Controls/LibraryFeaturedContent.html#libraryTvContentTemplate", function(element, options) {
            this.emptyLibraryStyle = "noVideoContentPane";
            this.itemSize = MS.Entertainment.Utilities.isVideoApp1 ? MS.Entertainment.Utilities.tvTileSize : MS.Entertainment.Utilities.tvLargeTileSize;
            this.sharedKey = "tvCount"
        }, {
            itemsColumns: 1, containerStyle: 'dashboardGridTvItemContent', _registerContentNotificationListener: function _registerContentNotificationListener(sender, listenerId) {
                    if (sender && MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.fileTransfer)) {
                        var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                        fileTransferService.registerListener(listenerId, function getTaskKey(task) {
                            return (task && task.seriesMediaId && task.libraryTypeId === Microsoft.Entertainment.Queries.ObjectType.video && !MS.Entertainment.Utilities.isEmptyGuid(task.seriesMediaId)) ? task.seriesLibraryId : null
                        }, sender, MS.Entertainment.UI.FileTransferNotifiers.episodeCollection)
                    }
                }
        })})
})()
