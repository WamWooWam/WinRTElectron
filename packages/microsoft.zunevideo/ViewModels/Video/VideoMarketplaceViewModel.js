/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {VideoMarketplaceQueryViewModelBaseMixIn: {
            items: null, modifierSelectionManager: null, secondaryModifierSelectionManager: null, modelActions: null, isFailed: false, isLoading: false, failedGalleryModel: null, galleryImageUrl: null, titleOverride: null, subTitleOverride: null, heroImageUrl: null, heroPrimaryText: String.empty, heroSecondaryText: String.empty, hideHubs: false, largeItemIndex: -1
        }});
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {VideoMarketplaceQueryViewModelBase: WinJS.Class.mix(function observableQuery() {
            this._initObservable(Object.create(MS.Entertainment.ViewModels.VideoMarketplaceQueryViewModelBaseMixIn))
        }, WinJS.Utilities.eventMixin, WinJS.Binding.mixin, WinJS.Binding.expandProperties(MS.Entertainment.ViewModels.VideoMarketplaceQueryViewModelBaseMixIn))});
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {VideoMarketplace: MS.Entertainment.UI.Framework.derive("MS.Entertainment.ViewModels.VideoMarketplaceQueryViewModelBase", function videoMarketplaceConstructor(view, hub) {
            MS.Entertainment.ViewModels.VideoMarketplaceQueryViewModelBase.prototype.constructor.call(this);
            this.view = view;
            this.hub = hub;
            this.items = {};
            this._setGalleryImageUrl(null);
            this._queryWatcher = new MS.Entertainment.Framework.QueryWatcher("video_marketplace");
            this._fileTransferListenerId = "videoMarketplace_" + Date.now() + "_" + Math.random();
            this.addActionCellsToList = MS.Entertainment.Utilities.isVideoApp1;
            if (this.view === "flexHub" || this.view === "featuredSet") {
                this.templateSelectorConstructor = MS.Entertainment.Pages.VideoFlexHubTemplateSelector;
                this.hideHubs = true
            }
        }, {
            query: null, _queryWatcher: null, _pendingQueryExecute: null, _lastQuery: null, templateSelectorConstructor: null, addActionCellsToList: false, combinedQueryOptions: null, failOnEmpty: true, isDisposed: false, dispose: function dispose() {
                    if (this._pendingQueryExecute) {
                        WinJS.Binding.unwrap(this._pendingQueryExecute).cancel();
                        this._pendingQueryExecute = null
                    }
                    if (this.modifierSelectionManager) {
                        this.modifierSelectionManager.dispose();
                        this.modifierSelectionManager = null
                    }
                    if (this.secondaryModifierSelectionManager) {
                        this.secondaryModifierSelectionManager.dispose();
                        this.secondaryModifierSelectionManager = null
                    }
                    this.isDisposed = true
                }, thaw: function thaw() {
                    if (this.view === "watchlist")
                        this.dispatchEvent(MS.Entertainment.ViewModels.VideoMarketplace.events.modifierChanged, {
                            sender: this, newValue: this.modifierSelectionManager, oldValue: null
                        })
                }, isCurrentQuery: function isCurrentQuery() {
                    return !this._pendingQueryExecute
                }, _isEmptyListFromQuery: function _isEmptyListFromQuery(query) {
                    return WinJS.Utilities.getMember("result.items.count", query) <= 0 && WinJS.Utilities.getMember("result.entries.count", query) <= 0 && WinJS.Utilities.getMember("result.filteredItemsArray.length", query) <= 0 && WinJS.Utilities.getMember("length", query) <= 0
                }, _handleQueryFailure: function _handleQueryFailure(e) {
                    this._pendingQueryExecute = null;
                    if (!(e && (e.message === "Canceled" || e.name === "Canceled"))) {
                        this._setModelActions(null);
                        this._setItems(MS.Entertainment.Data.VirtualList.wrapArray([]));
                        this._setIsFailed(true)
                    }
                }, createActionCells: function createActionCells() {
                    var selectedTemplate = this.Templates[this.combinedQueryOptions.template];
                    var actionCells = [];
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    var viewSupportsPreviewBrowse = this.view === "movieNewReleases" || this.view === "movieFeatured" || this.view === "movieTopPurchased" || this.view === "movieTopRented" || this.view === "movieTopRated";
                    var isPreviewBrowseEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.previewMovieTrailers);
                    if (viewSupportsPreviewBrowse && isPreviewBrowseEnabled) {
                        var actionCell = new MS.Entertainment.ViewModels.ActionCell(MS.Entertainment.UI.Actions.ActionIdentifiers.navigate, {
                                disableWhenOffline: true, suppressMessageInNetworkBind: true, offlineMessageTitle: String.load(String.id.IDS_PLAYBACK_ERROR_MESSAGE_TITLE), parameter: {
                                        page: MS.Entertainment.UI.Monikers.movieTrailerBrowse, args: {
                                                showNotifications: false, getItems: function getItems() {
                                                        if (this._lastQuery) {
                                                            var queryClone = this._lastQuery.clone();
                                                            return queryClone.execute().then(function getContentQuerySuccess(q) {
                                                                    return this.getItemsFromQuery(q)
                                                                }.bind(this), function getContentQueryFailure(q) {
                                                                    return []
                                                                }.bind(this))
                                                        }
                                                        else
                                                            return WinJS.Promise.wrap([])
                                                    }.bind(this)
                                            }
                                    }, automationId: MS.Entertainment.UI.AutomationIds.videoNavigateToPreviewBrowse, icon: MS.Entertainment.UI.Icon.play, voiceGuiTextStringId: String.id.IDS_VIDEO2_L2_MOVIES_PLAY_ALL_TRAILERS_BUTTON_VUI_GUI, voicePhraseStringId: String.id.IDS_VIDEO2_L2_MOVIES_PLAY_ALL_TRAILERS_BUTTON_VUI_ALM, voicePhoneticPhraseStringId: String.id.IDS_VIDEO2_L2_MOVIES_PLAY_ALL_TRAILERS_BUTTON_VUI_PRON, voiceConfidenceStringId: String.id.IDS_VIDEO2_L2_MOVIES_PLAY_ALL_TRAILERS_BUTTON_VUI_CONF
                            });
                        actionCell.icon = MS.Entertainment.UI.Icon.play;
                        actionCell.stringId = String.id.IDS_VIDEO_PREVIEW_BROWSE_BUTTON;
                        actionCell.automationId = "trailerBrowse";
                        actionCells.push(actionCell)
                    }
                    return actionCells
                }, isEditorialView: function isEditorialView() {
                    switch (this.view) {
                        case"tvAiredLastNight":
                        case"flexHub":
                        case"featuredSet":
                            return true;
                        case"movieFeatured":
                        case"movieNewReleases":
                        case"tvFeatured":
                        case"tvNewReleases":
                            var genreModifierSelected = this.modifierSelectionManager && this.modifierSelectionManager.selectedIndex > 0;
                            var studioModifierSelected = this.secondaryModifierSelectionManager && this.secondaryModifierSelectionManager.selectedIndex > 0;
                            return !genreModifierSelected && !studioModifierSelected;
                        default:
                            break
                    }
                    return false
                }, parseEditorialItems: function parseEditorialItems(editorialItemsArray, notifications) {
                    var getItemsPromise;
                    if (this.isEditorialView()) {
                        var goodItems = [];
                        editorialItemsArray.forEach(function accumulateValidEditorialItems(currentEntry) {
                            var item = currentEntry && currentEntry.editorialItem;
                            var editorialType = WinJS.Utilities.getMember("actionType.mediaType", item);
                            if (!MS.Entertainment.Utilities.isSupportedVideoEditorialType(item, editorialType))
                                return;
                            if (notifications)
                                notifications.modifyItem(item);
                            if (editorialType === MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Series)
                                MS.Entertainment.Utilities.BindingAgnostic.setProperty(item, "seriesTitle", item.name || String.empty);
                            if (editorialType !== MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.FlexHub && editorialType !== MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Hub)
                                item = MS.Entertainment.Utilities.convertEditorialItem(item);
                            goodItems.push(item)
                        });
                        if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.contentRestrictionService)) {
                            var contentRestrictionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.contentRestrictionService);
                            getItemsPromise = contentRestrictionService.getBrowsePolicyUpdatePromise().then(function gotBrowsePolicy() {
                                return contentRestrictionService.filterRestrictedMediaItems(goodItems)
                            })
                        }
                        else
                            getItemsPromise = WinJS.Promise.wrap(goodItems)
                    }
                    else
                        getItemsPromise = WinJS.Promise.wrap(editorialItemsArray);
                    return getItemsPromise.then(function gotItems(itemsArray) {
                            return MS.Entertainment.Data.VirtualList.wrapArray(itemsArray)
                        })
                }, removeMarketplaceItem: function removeMarketplaceItem(mediaItem) {
                    if (this.items && mediaItem) {
                        var itemIndex;
                        return this.items.forEachAll(function findItem(args) {
                                var serviceId = WinJS.Utilities.getMember("item.data.serviceId", args);
                                if (serviceId === mediaItem.serviceId) {
                                    itemIndex = this.items.indexFromKey(args.item.key);
                                    args.stop = true
                                }
                            }.bind(this)).then(function itemFound() {
                                if (itemIndex !== null && itemIndex !== undefined)
                                    this.items.removeAt(itemIndex).then(function itemRemoved(item) {
                                        if (this.items && !this.items.count)
                                            this._handleQueryFailure()
                                    }.bind(this));
                                return itemIndex
                            }.bind(this))
                    }
                    else
                        return WinJS.Promise.wrapError()
                }, _isRecommendationsView: function _isRecommendationsView() {
                    var isRecommendationsView = false;
                    switch (this.view) {
                        case"recommendations":
                            isRecommendationsView = true;
                            break;
                        case"movieRecommendations":
                            isRecommendationsView = true;
                            break;
                        case"tvRecommendations":
                            isRecommendationsView = true;
                            break
                    }
                    return isRecommendationsView
                }, getItemsFromQuery: function getItemsFromQuery(q, notifications) {
                    this.isLoading = false;
                    if (this._isRecommendationsView() && q.length > 0)
                        return WinJS.Promise.wrap(MS.Entertainment.Data.VirtualList.wrapArray(q));
                    else if (q.result.filteredItemsArray && this._isRecommendationsView()) {
                        var recommendationItems = WinJS.Utilities.getMember("result.filteredItemsArray", q);
                        return WinJS.Promise.wrap(MS.Entertainment.Data.VirtualList.wrapArray(recommendationItems))
                    }
                    else if (q.result.entries) {
                        var listIndex = (this.view === "movieFeatured" || this.view === "tvFeatured" || this.view === "tvTopPurchased") ? 1 : 0;
                        return q.result.entries.itemsFromIndex(listIndex, 0, 0).then(function firstItemGotten(result) {
                                var editorialItemsArray = result.items[0].data.editorialItems;
                                return this.parseEditorialItems(editorialItemsArray, notifications)
                            }.bind(this))
                    }
                    else if (q.result.items) {
                        if (this.isEditorialView(this.view)) {
                            var rawItems = q.result.items;
                            if (!Array.isArray(rawItems)) {
                                if (rawItems.toArray)
                                    return rawItems.toArray().then(function(items) {
                                            return this.parseEditorialItems(items, notifications)
                                        }.bind(this));
                                MS.Entertainment.Pages.fail("Editorial augmenter is not producing an array");
                                return MS.Entertainment.Data.VirtualList.wrapArray(rawItems)
                            }
                            return this.parseEditorialItems(rawItems, notifications)
                        }
                        return WinJS.Promise.wrap(q.result.items)
                    }
                    return WinJS.Promise.wrap(MS.Entertainment.Data.VirtualList.wrapArray([]))
                }, beginQuery: function beginQuery(contentQuery, imageQuery, galleryImage) {
                    var currentPage;
                    var resultModifier = null;
                    var taskKeyGetter = null;
                    var notifier = null;
                    var notifications = null;
                    var sender = null;
                    this.isLoading = true;
                    this._calculateTitle();
                    this._setIsFailed(false);
                    if (!this.addActionCellsToList) {
                        var action = this.createActionCells();
                        if (action && action.length > 0)
                            this._setModelActions(action)
                    }
                    if (this.view === "flexHub" || this.view === "featuredSet") {
                        currentPage = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).currentPage;
                        if (currentPage.options) {
                            contentQuery.target = currentPage.options.query;
                            if (!MS.Entertainment.Utilities.isVideoApp2)
                                this._setLargeItemIndex(0)
                        }
                    }
                    if (this.view === "browseByActor" && this._lastQuery)
                        contentQuery.actor = this._lastQuery.actor;
                    this._setGalleryImageUrl(null);
                    if (galleryImage)
                        this._setGalleryImageUrl(galleryImage);
                    else if (imageQuery) {
                        this._queryWatcher.registerQuery(imageQuery);
                        imageQuery.execute().then(function getImageQuerySuccess(q) {
                            var imageUrl = null;
                            if (q.result.item) {
                                var studio = q.result.item;
                                var studioLogoDimensions = {
                                        x: 0, y: 40
                                    };
                                if (studio.imageId) {
                                    var imageUrl = MS.Entertainment.UI.Shell.ImageLoader.makeCatalogImageUri(studio.imageId, MS.Entertainment.Data.ImageIdType.image, {
                                            x: 0, y: 40
                                        }, true, true, MS.Entertainment.ImageRequested.primaryImage, 0, MS.Entertainment.ImageContentType.png);
                                    var imageManager = new Microsoft.Entertainment.ImageManager;
                                    imageManager.retrieveImageFromUrlAsync(Microsoft.Entertainment.NetworkUsage.normal, imageUrl, String.empty, String.empty).then(function setImagePrimaryUrl(uri) {
                                        this._setGalleryImageUrl(uri)
                                    }.bind(this))
                                }
                            }
                        }.bind(this))
                    }
                    var executePromise = null;
                    if (WinJS.Utilities.getMember("Entertainment.ViewModels.VideoMarketplace.preloadedVideoMarketplaceQueryInfo.query.queryType", MS) === contentQuery.queryType && WinJS.Utilities.getMember("Entertainment.ViewModels.VideoMarketplace.preloadedVideoMarketplaceQueryInfo.promise", MS)) {
                        contentQuery = MS.Entertainment.ViewModels.VideoMarketplace.preloadedVideoMarketplaceQueryInfo.query;
                        executePromise = MS.Entertainment.ViewModels.VideoMarketplace.preloadedVideoMarketplaceQueryInfo.promise;
                        notifications = MS.Entertainment.ViewModels.VideoMarketplace.preloadedVideoMarketplaceQueryInfo.notifications;
                        sender = MS.Entertainment.ViewModels.VideoMarketplace.preloadedVideoMarketplaceQueryInfo.sender;
                        MS.Entertainment.ViewModels.VideoMarketplace.preloadedVideoMarketplaceQueryInfo = null
                    }
                    else {
                        var notificationInfo = MS.Entertainment.ViewModels.VideoMarketplace.getNotificationInfo(this.view);
                        if (notificationInfo) {
                            resultModifier = notificationInfo.resultModifier;
                            taskKeyGetter = notificationInfo.taskKeyGetter;
                            notifier = notificationInfo.notifier;
                            var modQueryInfo = MS.Entertainment.ViewModels.VideoMarketplace.modifyQuery(contentQuery, resultModifier, taskKeyGetter, notifier);
                            if (modQueryInfo) {
                                notifications = modQueryInfo.notifications;
                                sender = modQueryInfo.sender
                            }
                        }
                    }
                    if (this._pendingQueryExecute) {
                        WinJS.Binding.unwrap(this._pendingQueryExecute).cancel();
                        this._pendingQueryExecute = null
                    }
                    this._queryWatcher.registerQuery(contentQuery);
                    this._lastQuery = contentQuery;
                    if (this.view === "browseByActor")
                        this._calculateTitle();
                    if (this.view === "watchlist" && !executePromise) {
                        var watchlistService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.watchlistService);
                        executePromise = watchlistService.initialize().then(function() {
                            contentQuery.watchlistId = watchlistService.watchlistId;
                            return contentQuery.execute()
                        })
                    }
                    if (!executePromise)
                        executePromise = contentQuery.execute();
                    this._pendingQueryExecute = executePromise.then(function getContentQuerySuccess(q) {
                        if (this.failOnEmpty && (this._isEmptyListFromQuery(q) || !MS.Entertainment.UI.NetworkStatusService.isOnline()))
                            this._handleQueryFailure();
                        else {
                            this._pendingQueryExecute = null;
                            if (this.view === "flexHub" || this.view === "featuredSet") {
                                var name = String.empty;
                                var description = String.empty;
                                if (q.result.name)
                                    name = q.result.name;
                                if (q.result.description && typeof q.result.description === "string")
                                    description = q.result.description;
                                if (q.result.backgroundImageUrl && (!MS.Entertainment.Utilities.isVideoApp1 || this.view !== "flexHub")) {
                                    this._setHeroImageObject({
                                        imageUrl: q.result.backgroundImageUrl, primaryText: name, secondaryText: description
                                    });
                                    this.titleOverride = String.nbsp;
                                    this.subTitleOverride = String.empty
                                }
                                else {
                                    this.titleOverride = name;
                                    this.subTitleOverride = description
                                }
                            }
                            this.getItemsFromQuery(q, notifications).then(function gotItems(items) {
                                if (!items.count)
                                    this._handleQueryFailure();
                                else
                                    this._setItems(items)
                            }.bind(this));
                            if (taskKeyGetter) {
                                var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                                fileTransferService.registerListener(this._fileTransferListenerId, taskKeyGetter, sender, notifier)
                            }
                        }
                    }.bind(this), function getContentQueryError(e) {
                        this._handleQueryFailure(e)
                    }.bind(this))
                }, _setLargeItemIndex: function _setLargeItemIndex(value) {
                    if (this.largeItemIndex !== value) {
                        var oldValue = this.largeItemIndex;
                        this.largeItemIndex = value;
                        this.dispatchEvent(MS.Entertainment.ViewModels.VideoMarketplace.events.largeItemIndexChanged, {
                            sender: this, newValue: this.largeItemIndex, oldValue: oldValue
                        })
                    }
                }, _setModelActions: function _setModelActions(value) {
                    if (this.modelActions !== value) {
                        var oldValue = this.modelActions;
                        this.modelActions = value;
                        this.dispatchEvent(MS.Entertainment.ViewModels.VideoMarketplace.events.modelActionsChanged, {
                            sender: this, newValue: this.modelActions, oldValue: oldValue
                        })
                    }
                }, _setItems: function _setItems(items) {
                    if (this.items !== items) {
                        var action;
                        if (items && items.count && this.addActionCellsToList) {
                            action = this.createActionCells();
                            if (action && !Array.isArray(action))
                                action = [action];
                            if (action && action.length > 0) {
                                action = action.map(function(currentAction) {
                                    return new MS.Entertainment.Data.Factory.ListActionItemWrapper(currentAction)
                                });
                                items.insertRangeAt(0, action)
                            }
                        }
                        var oldValue = this.items;
                        this.items = items;
                        this.dispatchEvent(MS.Entertainment.ViewModels.VideoMarketplace.events.itemsChanged, {
                            sender: this, newValue: this.items, oldValue: oldValue
                        })
                    }
                }, _setIsFailed: function _setIsFailed(value) {
                    if (this.isFailed !== value) {
                        var oldValue = this.isFailed;
                        this.isFailed = value;
                        this.failedGalleryModel = {
                            primaryText: String.load(String.id.IDS_VIDEO_MARKETPLACE_EMPTY_TITLE), secondaryText: String.load(String.id.IDS_VIDEO_MARKETPLACE_EMPTY_DESC)
                        };
                        if (this._isRecommendationsView())
                            this.failedGalleryModel.secondaryText = String.load(String.id.IDS_VIDEO_RECOMMEND_EMPTY_GALLERIES);
                        if (this.view === "watchlist")
                            this.failedGalleryModel.secondaryText = String.load(String.id.IDS_VIDEO2_WISHLIST_EMPTY_GALLERY);
                        this.dispatchEvent(MS.Entertainment.ViewModels.VideoMarketplace.events.isFailedChanged, {
                            sender: this, newValue: this.isFailed, oldValue: oldValue
                        })
                    }
                }, _setPrimaryFilterItems: function _setPrimaryFilterItems(primaryFilterItems) {
                    var oldValue = this.modifierSelectionManager;
                    var settings = this._getFilterSettings(this.view);
                    this.modifierSelectionManager = new MS.Entertainment.UI.Framework.SelectionManager(primaryFilterItems, 0, settings.primaryFilter);
                    var currentPage = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).currentPage;
                    var primaryModifierOverride = WinJS.Utilities.getMember("options.selectPrimaryModifier", currentPage);
                    if (primaryModifierOverride) {
                        var selectedIndex = -1;
                        for (var i = 0; i < primaryFilterItems.length; i++)
                            if (primaryFilterItems[i].label.toUpperCase() === primaryModifierOverride.toUpperCase()) {
                                selectedIndex = i;
                                break
                            }
                        if (selectedIndex >= 0)
                            this.modifierSelectionManager.selectedIndex = selectedIndex
                    }
                    else if (MS.Entertainment.ViewModels.VideoMarketplace.defaultPrimaryFilter) {
                        this.modifierSelectionManager.selectedIndex = MS.Entertainment.ViewModels.VideoMarketplace.defaultPrimaryFilter;
                        MS.Entertainment.ViewModels.VideoMarketplace.defaultPrimaryFilter = null
                    }
                    this.dispatchEvent(MS.Entertainment.ViewModels.VideoMarketplace.events.modifierChanged, {
                        sender: this, newValue: this.modifierSelectionManager, oldValue: oldValue
                    })
                }, _setSecondaryFilterItems: function _setSecondaryFilterItems(secondaryFilterItems) {
                    var oldValue = this.secondaryModifierSelectionManager;
                    var settings = this._getFilterSettings(this.view);
                    this.secondaryModifierSelectionManager = new MS.Entertainment.UI.Framework.SelectionManager(secondaryFilterItems, 0, settings.secondaryFilter);
                    var currentPage = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).currentPage;
                    var secondaryModifierOverride = WinJS.Utilities.getMember("options.selectSecondaryModifier", currentPage);
                    if (secondaryModifierOverride) {
                        var selectedIndex = -1;
                        for (var i = 0; i < secondaryFilterItems.length; i++)
                            if (secondaryFilterItems[i].label.toUpperCase() === secondaryModifierOverride.toUpperCase()) {
                                selectedIndex = i;
                                break
                            }
                        if (selectedIndex >= 0)
                            this.secondaryModifierSelectionManager.selectedIndex = selectedIndex
                    }
                    this.dispatchEvent(MS.Entertainment.ViewModels.VideoMarketplace.events.secondaryModifierChanged, {
                        sender: this, newValue: this.secondaryModifierSelectionManager, oldValue: oldValue
                    })
                }, _setGalleryImageUrl: function _setGalleryImageUrl(galleryImageUrl) {
                    if (this.galleryImageUrl !== galleryImageUrl) {
                        var oldValue = this.galleryImageUrl;
                        this.galleryImageUrl = galleryImageUrl;
                        this.dispatchEvent(MS.Entertainment.ViewModels.VideoMarketplace.events.galleryImageUrlChanged, {
                            sender: this, newValue: this.galleryImageUrl, oldValue: oldValue
                        })
                    }
                }, _setHeroImageObject: function _setHeroImageObject(heroImageObject) {
                    if (!heroImageObject)
                        return;
                    var imageUrl = heroImageObject.imageUrl;
                    if (this.heroImageUrl !== imageUrl) {
                        var oldValue = this.heroImageUrl;
                        this.heroImageUrl = imageUrl;
                        this.heroPrimaryText = heroImageObject.primaryText;
                        this.heroSecondaryText = heroImageObject.secondaryText;
                        this.dispatchEvent(MS.Entertainment.ViewModels.VideoMarketplace.events.heroImageUrlChanged, {
                            sender: this, newValue: this.heroImageUrl, oldValue: oldValue
                        })
                    }
                }, unregisterServices: function unregisterServices() {
                    var fileTransferService = MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.fileTransfer) && MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                    if (fileTransferService)
                        fileTransferService.unregisterListener(this._fileTransferListenerId)
                }, _getFilterSettings: function _getFilterSettings(view) {
                    var settings = {};
                    switch (view) {
                        case"movieNewReleases":
                        case"movieTopPurchased":
                        case"movieTopRented":
                        case"movieTopRated":
                            settings.primaryFilter = "movieMarketplaceFilter";
                            settings.secondaryFilter = "movieMarketplaceSecondaryFilter";
                            break;
                        case"tvNewReleases":
                        case"tvTopPurchased":
                        case"tvTopRated":
                            settings.primaryFilter = "tvMarketplaceFilter";
                            settings.secondaryFilter = "tvMarketplaceSecondaryFilter";
                            break
                    }
                    return settings
                }, _getModifierText: function _getModifierText(modifier) {
                    var text = String.empty;
                    if (modifier)
                        if (modifier.selectedIndex > 0)
                            text = modifier.selectedItem.label;
                    return text
                }, _calculateTitle: function _calculateTitle() {
                    if (MS.Entertainment.Utilities.isVideoApp2) {
                        if (this.hub && this.hub.title) {
                            var view = this.hub.title;
                            var genre = this._getModifierText(this.modifierSelectionManager);
                            var studio = this._getModifierText(this.secondaryModifierSelectionManager);
                            var title = String.empty;
                            if (genre && studio)
                                title = String.load(String.id.IDS_VIDEO_VIEW_IN_GENRE_FROM_STUDIO_LABEL).format(view, genre, studio);
                            else if (genre)
                                title = String.load(String.id.IDS_VIDEO_VIEW_IN_GENRE_LABEL).format(view, genre);
                            else if (studio)
                                title = String.load(String.id.IDS_VIDEO_VIEW_FROM_STUDIO_LABEL).format(view, studio);
                            else
                                title = view;
                            this.titleOverride = title
                        }
                        if (this.view === "movieRecommendations")
                            this.titleOverride = String.load(String.id.IDS_VIDEO_RECOMMEND_MOVIES_TITLE_TC);
                        else if (this.view === "tvRecommendations")
                            this.titleOverride = String.load(String.id.IDS_VIDEO_RECOMMEND_TV_TITLE_TC);
                        else if (this.view === "recommendations")
                            this.titleOverride = String.load(String.id.IDS_VIDEO_RECOMMEND_TITLE_TC);
                        if (this.view === "browseByActor") {
                            var stringId = String.id.IDS_VIDEO2_CONTRIBUTOR_MOVIES_GALLERY_TITLE;
                            var filter = this._getModifierText(this.modifierSelectionManager);
                            if (filter === "IDS_VIDEO2_DETAILS_TV_DROPDOWN_LC")
                                stringId = String.id.IDS_VIDEO2_CONTRIBUTOR_TV_GALLERY_TITLE;
                            if (this._lastQuery && this._lastQuery.actor)
                                this.titleOverride = String.load(stringId).format(this._lastQuery.actor)
                        }
                    }
                }, _expandFilter: function _expandFilter(filter) {
                    var promises = [];
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    if (filter)
                        filter.forEach(function addFilterItem(filterItem) {
                            if (filterItem.feature && !featureEnablement.isEnabled(filterItem.feature))
                                return;
                            if (!filterItem.label || typeof filterItem.label === "string" || typeof filterItem.label === "number")
                                promises.push(WinJS.Promise.wrap([filterItem]));
                            else if (Array.isArray(filterItem.label)) {
                                var filterItemsToAdd = filterItem.label.map(function map(filterSubItem) {
                                        return MS.Entertainment.Utilities.uniteObjects(filterItem, filterSubItem)
                                    }.bind(this));
                                promises.push(WinJS.Promise.wrap(filterItemsToAdd))
                            }
                            else {
                                var getFiltersQuery = new filterItem.label;
                                this._queryWatcher.registerQuery(getFiltersQuery);
                                promises.push(getFiltersQuery.execute().then(function getFiltersQuerySuccess(q) {
                                    if (!q || !q.result || !q.result.items)
                                        return WinJS.Promise.wrap([]);
                                    var filterItemsToAdd = [];
                                    q.result.items.forEach(function copy(args) {
                                        var copiedFilterItem = {};
                                        for (var property in filterItem)
                                            copiedFilterItem[property] = filterItem[property];
                                        copiedFilterItem.label = (args.item && args.item.data ? args.item.data.name : args.name);
                                        copiedFilterItem.serviceId = (args.item && args.item.data ? args.item.data.serviceId : args.serviceId);
                                        copiedFilterItem.imageUri = (args.item && args.item.data ? args.item.data.imageUri : args.imageUri);
                                        if (args.item && args.item.data) {
                                            if (args.item.data.genre)
                                                copiedFilterItem.genre = args.item.data.genre;
                                            if (args.item.data.studio)
                                                copiedFilterItem.studio = args.item.data.studio;
                                            if (args.item.data.network)
                                                copiedFilterItem.network = args.item.data.network
                                        }
                                        filterItemsToAdd.push(copiedFilterItem)
                                    });
                                    return WinJS.Promise.wrap(filterItemsToAdd)
                                }.bind(this), function getFiltersQueryError() {
                                    return WinJS.Promise.wrap([])
                                }.bind(this)))
                            }
                        }.bind(this));
                    return WinJS.Promise.join(promises).then(function complete(results) {
                            var filterItemsToAdd = [];
                            results.forEach(function forEachResult(result) {
                                filterItemsToAdd = filterItemsToAdd.concat(result)
                            });
                            return filterItemsToAdd
                        }.bind(this), function error() {
                            return []
                        }.bind(this))
                }, populateSecondaryFilter: function populateSecondaryFilter(primaryFilterItem) {
                    if (primaryFilterItem && primaryFilterItem.secondaryFilter)
                        this._expandFilter(this.SecondaryFilters[primaryFilterItem.secondaryFilter]).then(function complete(filtersToAdd) {
                            this._setSecondaryFilterItems(filtersToAdd)
                        }.bind(this))
                }, populatePrimaryFilter: function populatePrimaryFilter() {
                    this._setIsFailed(false);
                    var primaryFilter = this.PrimaryFilters[this.view]();
                    this._expandFilter(primaryFilter).then(function complete(filtersToAdd) {
                        this._setPrimaryFilterItems(filtersToAdd)
                    }.bind(this))
                }, SecondaryFilters: (function() {
                    var secondaryFilters;
                    return {get: function() {
                                if (!secondaryFilters) {
                                    var allStudiosLabel = MS.Entertainment.Utilities.isVideoApp1 ? String.load(String.id.IDS_FILTER_ALL_STUDIOS_LC) : String.load(String.id.IDS_FILTER_ALL_STUDIOS_SC);
                                    var allNetworksLabel = MS.Entertainment.Utilities.isVideoApp1 ? String.load(String.id.IDS_FILTER_ALL_NETWORKS_LC) : String.load(String.id.IDS_FILTER_ALL_NETWORKS_SC);
                                    secondaryFilters = {
                                        movieNewReleaseSecondaryFilter: [{label: allStudiosLabel}, {
                                                label: MS.Entertainment.Data.Query.Video.EdsMetadataMovieStudios, query: MS.Entertainment.Data.Query.Video.EdsBrowseMoviesByGenreStudio, orderBy: MS.Entertainment.Data.Query.convertToLegacySortIfNeeded(MS.Entertainment.Data.Query.edsSortOrder.releaseDate)
                                            }], movieTopPurchasedStudios: [{label: allStudiosLabel}, {label: MS.Entertainment.Data.Query.Video.EdsMetadataMovieStudios}], movieTopRentedStudios: [{label: allStudiosLabel}, {label: MS.Entertainment.Data.Query.Video.EdsMetadataMovieStudios}], movieTopRatedStudios: [{label: allStudiosLabel}, {label: MS.Entertainment.Data.Query.Video.EdsMetadataMovieStudios}], tvNewReleaseFilter: [{label: allNetworksLabel}, {
                                                    label: MS.Entertainment.Data.Query.Video.EdsMetadataTvNetworks, query: MS.Entertainment.Data.Query.Video.EdsBrowseTVByGenreNetwork, orderBy: MS.Entertainment.Data.Query.convertToLegacySortIfNeeded(MS.Entertainment.Data.Query.edsSortOrder.releaseDate)
                                                }], tvTopPurchasedNetworks: [{label: allNetworksLabel}, {label: MS.Entertainment.Data.Query.Video.EdsMetadataTvNetworks}], tvTopRatedNetworks: [{label: allNetworksLabel}, {label: MS.Entertainment.Data.Query.Video.EdsMetadataTvNetworks}], watchlistSorts: [{
                                                    label: String.load(String.id.IDS_VIDEO_COLLECTION_DATEADDED_SORT_2), sort: Microsoft.Entertainment.Queries.WatchlistItemsSortBy.dateCreatedDescending
                                                }, {
                                                    label: String.load(String.id.IDS_VIDEO_COLLECTION_ALPHA_SORT_2), sort: Microsoft.Entertainment.Queries.WatchlistItemsSortBy.nameAscending
                                                }]
                                    }
                                }
                                return secondaryFilters
                            }}
                })(), PrimaryFilters: {get: function() {
                        var secondaryFilters = this.SecondaryFilters;
                        return {
                                movieNewReleases: function primaryFilters_movieNewReleases_get() {
                                    return [{
                                                label: MS.Entertainment.Utilities.isApp1 ? String.id.IDS_FILTER_ALL_GENRES : String.id.IDS_FILTER_ALL_GENRES_2, query: MS.Entertainment.Data.Query.MovieHub, secondaryFilter: "movieNewReleaseSecondaryFilter", template: "movie", mediaType: "editorialVideo"
                                            }, {
                                                label: MS.Entertainment.Data.Query.Video.EdsMetadataMovieGenres, query: MS.Entertainment.Data.Query.Video.EdsBrowseMoviesByGenreStudio, orderBy: MS.Entertainment.Data.Query.convertToLegacySortIfNeeded(MS.Entertainment.Data.Query.edsSortOrder.releaseDate), secondaryFilter: "movieNewReleaseSecondaryFilter", template: "movie", mediaType: "editorialVideo"
                                            }]
                                }, movieFeatured: function primaryFilters_movieFeatured_get() {
                                        return [{
                                                    label: String.empty, query: MS.Entertainment.Data.Query.MovieHub, template: "movie", mediaType: "editorialVideo"
                                                }]
                                    }, movieTopPurchased: function primaryFilters_movieTopPurchased_get() {
                                        return [{
                                                    label: MS.Entertainment.Utilities.isApp1 ? String.id.IDS_FILTER_ALL_GENRES : String.id.IDS_FILTER_ALL_GENRES_2, query: MS.Entertainment.Data.Query.Video.EdsBrowseMoviesByGenreStudio, orderBy: MS.Entertainment.Data.Query.convertToLegacySortIfNeeded(MS.Entertainment.Data.Query.edsSortOrder.sevenDaysPurchaseCount), secondaryFilter: "movieTopPurchasedStudios", template: "movie"
                                                }, {
                                                    label: MS.Entertainment.Data.Query.Video.EdsMetadataMovieGenres, query: MS.Entertainment.Data.Query.Video.EdsBrowseMoviesByGenreStudio, orderBy: MS.Entertainment.Data.Query.convertToLegacySortIfNeeded(MS.Entertainment.Data.Query.edsSortOrder.sevenDaysPurchaseCount), secondaryFilter: "movieTopPurchasedStudios", template: "movie"
                                                }]
                                    }, movieTopRented: function primaryFilters_movieTopRented_get() {
                                        return [{
                                                    label: MS.Entertainment.Utilities.isApp1 ? String.id.IDS_FILTER_ALL_GENRES : String.id.IDS_FILTER_ALL_GENRES_2, query: MS.Entertainment.Data.Query.Video.EdsBrowseMoviesByGenreStudio, orderBy: MS.Entertainment.Data.Query.convertToLegacySortIfNeeded(MS.Entertainment.Data.Query.edsSortOrder.sevenDaysRentalCount), secondaryFilter: "movieTopRentedStudios", template: "movie"
                                                }, {
                                                    label: MS.Entertainment.Data.Query.Video.EdsMetadataMovieGenres, query: MS.Entertainment.Data.Query.Video.EdsBrowseMoviesByGenreStudio, orderBy: MS.Entertainment.Data.Query.convertToLegacySortIfNeeded(MS.Entertainment.Data.Query.edsSortOrder.sevenDaysRentalCount), secondaryFilter: "movieTopRentedStudios", template: "movie"
                                                }]
                                    }, movieTopRated: function primaryFilters_movieTopRated_get() {
                                        return [{
                                                    label: MS.Entertainment.Utilities.isApp1 ? String.id.IDS_FILTER_ALL_GENRES : String.id.IDS_FILTER_ALL_GENRES_2, query: MS.Entertainment.Data.Query.Video.EdsBrowseMoviesByGenreStudio, orderBy: MS.Entertainment.Data.Query.convertToLegacySortIfNeeded(MS.Entertainment.Data.Query.edsSortOrder.allTimeAverageRating), secondaryFilter: "movieTopRatedStudios", template: "movie"
                                                }, {
                                                    label: MS.Entertainment.Data.Query.Video.EdsMetadataMovieGenres, query: MS.Entertainment.Data.Query.Video.EdsBrowseMoviesByGenreStudio, orderBy: MS.Entertainment.Data.Query.convertToLegacySortIfNeeded(MS.Entertainment.Data.Query.edsSortOrder.allTimeAverageRating), secondaryFilter: "movieTopRatedStudios", template: "movie"
                                                }]
                                    }, tvFeatured: function primaryFilters_tvFeatured_get() {
                                        return [{
                                                    label: String.empty, query: MS.Entertainment.Data.Query.TvHub, template: "tvSeries", mediaType: "editorialVideo"
                                                }]
                                    }, browseByActor: function primaryFilters_browseByActor_get() {
                                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                                        var moviesMarketplaceEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace);
                                        var tvMarketplaceEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace);
                                        var movieFilter = {
                                                label: String.id.IDS_VIDEO2_DETAILS_MOVIE_DROPDOWN_LC, query: MS.Entertainment.Data.Query.Video.EdsBrowseMoviesByActor, template: "movie"
                                            };
                                        var tvFilter = {
                                                label: String.id.IDS_VIDEO2_DETAILS_TV_DROPDOWN_LC, query: MS.Entertainment.Data.Query.Video.EdsBrowseTVByActor, template: "tvSeries"
                                            };
                                        var filterSet = [];
                                        if (moviesMarketplaceEnabled)
                                            filterSet.push(movieFilter);
                                        if (tvMarketplaceEnabled)
                                            filterSet.push(tvFilter);
                                        return filterSet
                                    }, tvNewReleases: function primaryFilters_tvNewReleases_get() {
                                        return [{
                                                    label: MS.Entertainment.Utilities.isApp1 ? String.id.IDS_FILTER_ALL_GENRES : String.id.IDS_FILTER_ALL_GENRES_2, query: MS.Entertainment.Data.Query.TvHub, secondaryFilter: "tvNewReleaseFilter", template: "tvSeries", mediaType: "editorialVideo"
                                                }, {
                                                    label: MS.Entertainment.Data.Query.Video.EdsMetadataTvGenres, query: MS.Entertainment.Data.Query.Video.EdsBrowseNewReleaseTvSeries, orderBy: MS.Entertainment.Data.Query.convertToLegacySortIfNeeded(MS.Entertainment.Data.Query.edsSortOrder.releaseDate), secondaryFilter: "tvNewReleaseFilter", template: "tvSeries", mediaType: "editorialVideo"
                                                }]
                                    }, tvAiredLastNight: function primaryFilters_tvAiredLastNight_get() {
                                        return [{
                                                    label: String.empty, query: MS.Entertainment.Data.Query.browseTVFromLastNight, template: "tvSeason", mediaType: "editorialVideo"
                                                }]
                                    }, tvTopPurchased: function primaryFilters_tvTopPurchased_get() {
                                        return [{
                                                    label: MS.Entertainment.Utilities.isApp1 ? String.id.IDS_FILTER_ALL_GENRES : String.id.IDS_FILTER_ALL_GENRES_2, query: MS.Entertainment.Data.Query.Video.EdsBrowseTVByGenreNetwork, orderBy: MS.Entertainment.Data.Query.convertToLegacySortIfNeeded(MS.Entertainment.Data.Query.edsSortOrder.sevenDaysPurchaseCount), secondaryFilter: "tvTopPurchasedNetworks", template: "tvSeries"
                                                }, {
                                                    label: MS.Entertainment.Data.Query.Video.EdsMetadataTvGenres, query: MS.Entertainment.Data.Query.Video.EdsBrowseTVByGenreNetwork, orderBy: MS.Entertainment.Data.Query.convertToLegacySortIfNeeded(MS.Entertainment.Data.Query.edsSortOrder.sevenDaysPurchaseCount), secondaryFilter: "tvTopPurchasedNetworks", template: "tvSeries"
                                                }]
                                    }, tvTopRated: function primaryFilters_tvTopRated_get() {
                                        return [{
                                                    label: MS.Entertainment.Utilities.isApp1 ? String.id.IDS_FILTER_ALL_GENRES : String.id.IDS_FILTER_ALL_GENRES_2, query: MS.Entertainment.Data.Query.Video.EdsBrowseTVByGenreNetwork, orderBy: MS.Entertainment.Data.Query.convertToLegacySortIfNeeded(MS.Entertainment.Data.Query.edsSortOrder.allTimeAverageRating), secondaryFilter: "tvTopRatedNetworks", template: "tvSeries"
                                                }, {
                                                    label: MS.Entertainment.Data.Query.Video.EdsMetadataTvGenres, query: MS.Entertainment.Data.Query.Video.EdsBrowseTVByGenreNetwork, orderBy: MS.Entertainment.Data.Query.convertToLegacySortIfNeeded(MS.Entertainment.Data.Query.edsSortOrder.allTimeAverageRating), secondaryFilter: "tvTopRatedNetworks", template: "tvSeries"
                                                }]
                                    }, flexHub: function primaryFilters_flexHub_get() {
                                        return [{
                                                    label: String.empty, query: MS.Entertainment.Data.Query.MediaDiscoveryVideoFlexHub, template: "flexHub", mediaType: "editorialVideo"
                                                }]
                                    }, studiosHub: function primaryFilters_studiosHub_get() {
                                        return [{
                                                    label: String.empty, query: MS.Entertainment.Data.Query.Video.EdsMetadataMovieStudios, template: "studiosHub", mediaType: "studioTemplate"
                                                }]
                                    }, networksHub: function primaryFilters_networksHub_get() {
                                        return [{
                                                    label: String.empty, query: MS.Entertainment.Data.Query.Video.EdsMetadataTvNetworks, template: "networksHub", mediaType: "networkTemplate"
                                                }]
                                    }, featuredSet: function primaryFilters_featuredSet_get() {
                                        return [{
                                                    label: String.empty, query: MS.Entertainment.Data.Query.MediaDiscoveryVideoFlexHub, template: "featuredSet", mediaType: "editorialVideo"
                                                }]
                                    }, recommendations: function primaryFilters_recommendations_get() {
                                        return [{
                                                    label: String.empty, query: MS.Entertainment.Data.Query.EdsVideoRecommendations, template: "recommendations", mediaType: "editorialVideo"
                                                }]
                                    }, movieRecommendations: function primaryFilters_movieRecommendations_get() {
                                        return [{
                                                    label: String.empty, query: MS.Entertainment.Data.Query.EdsVideoRecommendations, template: "recommendations", mediaType: "editorialVideo", desiredMediaItemTypes: "movies"
                                                }]
                                    }, tvRecommendations: function primaryFilters_tvRecommendations_get() {
                                        return [{
                                                    label: String.empty, query: MS.Entertainment.Data.Query.EdsVideoRecommendations, template: "recommendations", mediaType: "editorialVideo", desiredMediaItemTypes: "tv"
                                                }]
                                    }, watchlist: function primaryFilters_watchlist_get() {
                                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                                        var moviesMarketplaceEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace);
                                        var watchlistFilters = [{
                                                    label: String.id.IDS_VIDEO2_WISHLIST_ALL_FILTER_VUI_GUI, secondaryFilter: "watchlistSorts", query: MS.Entertainment.Data.Query.libraryWatchlistMediaItems
                                                }];
                                        if (moviesMarketplaceEnabled) {
                                            watchlistFilters.push({
                                                label: String.id.IDS_VIDEO2_WISHLIST_MOVIES_FILTER_VUI_GUI, secondaryFilter: "watchlistSorts", query: MS.Entertainment.Data.Query.libraryWatchlistMediaItems, mediaItemObjectType: Microsoft.Entertainment.Queries.ObjectType.video
                                            });
                                            watchlistFilters.push({
                                                label: String.id.IDS_VIDEO2_WISHLIST_BUNDLES_FILTER_VUI_GUI, secondaryFilter: "watchlistSorts", query: MS.Entertainment.Data.Query.libraryWatchlistMediaItems, mediaItemObjectType: Microsoft.Entertainment.Queries.ObjectType.bundle
                                            })
                                        }
                                        return watchlistFilters
                                    }
                            }
                    }}, Templates: MS.Entertainment.ViewModels.VideoMarketplaceTemplates
        }, {
            preloadedVideoMarketplaceQueryInfo: null, defaultPrimaryFilter: 0, getNotificationInfo: function getNotificationInfo(view) {
                    var notificationInfo = null;
                    if (MS.Entertainment.UI.ContentNotification && MS.Entertainment.UI.FileTransferService)
                        switch (view) {
                            case"movieFeatured":
                            case"movieNewReleases":
                            case"movieTopPurchased":
                            case"movieTopRented":
                            case"movieTopRated":
                            case"tvFeatured":
                            case"tvNewReleases":
                            case"tvAiredLastNight":
                            case"tvTopPurchased":
                            case"tvTopRated":
                            case"flexHub":
                            case"featuredSet":
                            case"browseByActor":
                                notificationInfo = {
                                    resultModifier: MS.Entertainment.UI.ContentNotification.listResult(), taskKeyGetter: MS.Entertainment.UI.FileTransferService.keyFromProperty("mediaId", false, true), notifier: MS.Entertainment.UI.FileTransferNotifiers.genericFile
                                };
                                break;
                            default:
                                MS.Entertainment.Pages.assert(false, "getNotificationInfo received an unknown view")
                        }
                    return notificationInfo
                }, modifyQuery: function modifyQuery(contentQuery, resultModifier, taskKeyGetter, notifier) {
                    var queryModInfo = null;
                    var notifications = null;
                    var sender = null;
                    if (taskKeyGetter) {
                        notifications = new MS.Entertainment.UI.ContentNotification.NotificationModification(resultModifier, MS.Entertainment.UI.FileTransferService.keyFromProperty("serviceId", false, true));
                        var sender = notifications.createSender();
                        notifications.modifyQuery(contentQuery);
                        queryModInfo = {
                            notifications: notifications, sender: sender
                        }
                    }
                    return queryModInfo
                }, events: {
                    itemsChanged: "itemsChanged", isFailedChanged: "isFailedChanged", modifierChanged: "modifierChanged", secondaryModifierChanged: "secondaryModifierChanged", galleryImageUrlChanged: "galleryImageUrlChanged", heroImageUrlChanged: "heroImageUrlChanged", largeItemIndexChanged: "largeItemIndexChanged", selectedItemChanged: "selectedItemChanged", modelActionsChanged: "modelActionsChanged"
                }, tvSeriesLowDensityCardTemplateSize: 440, movieLowDensityCardTemplateSize: 324, tvSeriesWatchlistGalleryWidth: 648, movieWatchlistGalleryWidth: 468
        })});
    WinJS.Namespace.define("MS.Entertainment.Pages", {VideoFlexHubTemplateSelector: MS.Entertainment.UI.Framework.derive("MS.Entertainment.UI.Controls.GalleryTemplateSelector", function galleryTemplateSelector(galleryView) {
            MS.Entertainment.UI.Controls.GalleryTemplateSelector.prototype.constructor.call(this);
            this._galleryView = galleryView;
            this.addTemplate("marketplaceMovie", "/Components/Video/VideoMarketplaceTemplates.html#movieFlexHubTemplate");
            this.addTemplate("marketplaceTVSeries", "/Components/Video/VideoMarketplaceTemplates.html#tvFlexHubTemplate");
            this.addTemplate("flexHubBigItem", "/Components/Video/VideoMarketplaceTemplates.html#videoFlexHubBigItemTemplate")
        }, {
            onSelectTemplate: function onSelectTemplate(item) {
                var template = null;
                if (item && item.isHeader)
                    template = "header";
                else if (item && item.index === 0 && !MS.Entertainment.Utilities.isVideoApp2)
                    template = "flexHubBigItem";
                else {
                    var editorialType = WinJS.Utilities.getMember("data.actionType.mediaType", item);
                    switch (editorialType) {
                        case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Series:
                        case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Season:
                        case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Episode:
                            template = "marketplaceTVSeries";
                            break;
                        case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Movie:
                        case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.MovieTrailer:
                            template = "marketplaceMovie";
                            break;
                        default:
                            MS.Entertainment.Pages.fail("no template defined");
                            break
                    }
                }
                this.ensureTemplatesLoaded([template]);
                return this.getTemplateProvider(template)
            }, getPanelTemplatePath: function getPanelTemplatePath(item) {
                    return this._getPanelTemplatePath(item, false)
                }, _getPanelTemplatePath: function getPanelTemplatePath(item, forceMarketplace) {
                    var data = (item && item.data) ? item.data : {};
                    this._galleryView.panelOptions = (data && data.inCollection && (!forceMarketplace || !data.hasServiceId)) ? {location: MS.Entertainment.Pages.BaseMediaInlineDetails.Location.collection} : {location: MS.Entertainment.Pages.BaseMediaInlineDetails.Location.marketplace};
                    switch (data.mediaType) {
                        case Microsoft.Entertainment.Queries.ObjectType.tvEpisode:
                        case Microsoft.Entertainment.Queries.ObjectType.tvSeason:
                        case Microsoft.Entertainment.Queries.ObjectType.tvSeries:
                            return MS.Entertainment.Utilities.getTvInlineDetailsPopoverControl();
                        case Microsoft.Entertainment.Queries.ObjectType.video:
                            if (data.videoType === Microsoft.Entertainment.Queries.VideoType.movie)
                                return "MS.Entertainment.Pages.MovieInlineDetails";
                            else if (data.videoType === Microsoft.Entertainment.Queries.VideoType.tvEpisode)
                                return MS.Entertainment.Utilities.getTvInlineDetailsPopoverControl();
                            MS.Entertainment.Pages.assert(data.videoType === Microsoft.Entertainment.Queries.VideoType.other, "unknown video type");
                            return String.empty;
                        default:
                            MS.Entertainment.Pages.assert(false, "no template defined");
                            return null
                    }
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.Pages", {Video2FlexHub: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.Pages.Marketplace", "/Components/Video/VideoMarketplaceTemplates.html#flexHubGalleryTemplate", null, {}, {}, {
            featuredSetFlexHubTemplateSize: 576, computeFlexHubItemSize: function computeFlexHubItemSize(item, itemIndex) {
                    itemIndex = itemIndex || 0;
                    var itemType = WinJS.Utilities.getMember("actionType.mediaType", item);
                    switch (itemType) {
                        case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Episode:
                        case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Season:
                        case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Series:
                            return MS.Entertainment.ViewModels.VideoMarketplace.tvSeriesLowDensityCardTemplateSize;
                        case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.FlexHub:
                        case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Hub:
                            return (itemIndex % 2) ? 0 : MS.Entertainment.Pages.Video2FlexHub.featuredSetFlexHubTemplateSize;
                        default:
                            MS.Entertainment.Pages.assert(itemType === MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Movie || itemType === MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.MovieTrailer, "Unexpected media type found in Flex Hub: " + itemType);
                            return MS.Entertainment.ViewModels.VideoMarketplace.movieLowDensityCardTemplateSize
                    }
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.Pages", {Video2StudioAndNetworkGallery: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.Pages.Marketplace", "/Components/Video/VideoMarketplaceTemplates.html#studioAndNetworkGalleryTemplate", null, {}, {}, {
            hubTemplateSize: 576, computeHubItemSize: function computeFlexHubItemSize(item, itemIndex) {
                    itemIndex = itemIndex || 0;
                    return (itemIndex % 2) ? 0 : MS.Entertainment.Pages.Video2StudioAndNetworkGallery.hubTemplateSize
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.Pages", {BrowseByActorHub: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.Pages.Marketplace", "/Components/Video/VideoMarketplaceTemplates.html#browseByActorTemplate", null, {}, {}, {computeBrowseByActorHubItemSize: function computeBrowseByActorHubItemSize(item, itemIndex) {
                itemIndex = itemIndex || 0;
                var itemType = WinJS.Utilities.getMember("mediaType", item);
                switch (itemType) {
                    case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Episode:
                    case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Season:
                    case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Series:
                    case Microsoft.Entertainment.Queries.ObjectType.tvSeries:
                    case Microsoft.Entertainment.Queries.ObjectType.tvSeason:
                        return MS.Entertainment.ViewModels.VideoMarketplace.tvSeriesLowDensityCardTemplateSize;
                    default:
                        return MS.Entertainment.ViewModels.VideoMarketplace.movieLowDensityCardTemplateSize
                }
            }})});
    WinJS.Namespace.define("MS.Entertainment.Pages", {Video1FeaturedSets: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.Pages.Marketplace", "/Components/Video/VideoMarketplaceTemplates.html#featuredSetsGalleryTemplate", null, {}, {}, {
            tvSeriesFlexHubTemplateSize: 320, movieFlexHubTemplateSize: 236, featuredSetFlexHubTemplateSize: 526, computeFlexHubItemSize: function computeFlexHubItemSize(item, itemIndex) {
                    itemIndex = itemIndex || 0;
                    var itemType = WinJS.Utilities.getMember("actionType.mediaType", item) || item.mediaType;
                    switch (itemType) {
                        case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Episode:
                        case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Season:
                        case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Series:
                        case Microsoft.Entertainment.Queries.ObjectType.tvSeries:
                        case Microsoft.Entertainment.Queries.ObjectType.tvSeason:
                            return MS.Entertainment.Pages.Video1FeaturedSets.tvSeriesFlexHubTemplateSize;
                        case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.FlexHub:
                        case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Hub:
                            return (itemIndex % 2) ? 0 : MS.Entertainment.Pages.Video1FeaturedSets.featuredSetFlexHubTemplateSize;
                        default:
                            MS.Entertainment.Pages.assert(itemType === MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Movie || itemType === MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.MovieTrailer, "Unexpected media type found in Flex Hub: " + itemType);
                            return MS.Entertainment.Pages.Video1FeaturedSets.movieFlexHubTemplateSize
                    }
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.Pages", {MarketplacePageWithRemoveButton: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.Pages.Marketplace", null, null, {
            _galleryViewEventHandlers: null, initialize: function initialize() {
                    MS.Entertainment.Pages.Marketplace.prototype.initialize.call(this);
                    if (this._galleryView)
                        this._galleryViewEventHandlers = MS.Entertainment.Utilities.addEventHandlers(this._galleryView, {removeItem: this._onItemRemoved.bind(this)})
                }, unload: function unload() {
                    if (this._galleryViewEventHandlers) {
                        this._galleryViewEventHandlers.cancel();
                        this._galleryViewEventHandlers = null
                    }
                    MS.Entertainment.Pages.Marketplace.prototype.unload.call(this)
                }, _onItemRemoved: function _onItemRemoved(eventArgs) {
                    if (this._viewModel && this._viewModel.removeMarketplaceItem) {
                        var mediaItem = WinJS.Utilities.getMember("detail.mediaItem", eventArgs);
                        this._viewModel.removeMarketplaceItem(mediaItem).done(function focusItem(removedIndex) {
                            MS.Entertainment.Pages.assert(removedIndex > -1, "Unexpected item removed index");
                            if (this._galleryView && !this._unloaded) {
                                var items = WinJS.Utilities.query("[data-ent-type~='removableGalleryItem']", this._galleryView.domElement);
                                if (items && items.length) {
                                    var itemToFocus = items[removedIndex] || items[items.length - 1];
                                    if (itemToFocus)
                                        itemToFocus.focus()
                                }
                            }
                        }.bind(this))
                    }
                }
        }, {}, {})});
    WinJS.Namespace.define("MS.Entertainment.Pages", {Video2Recommendations: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.Pages.MarketplacePageWithRemoveButton", "/Components/Video/VideoMarketplaceTemplates.html#recommendationsGalleryTemplate", null, {}, {}, {
            tvSeriesRecommendationsTemplateSize: 440, movieRecommendationsTemplateSize: 324, computeRecommendationsItemSize: function computeRecommendationsItemSize(item) {
                    var itemType = WinJS.Utilities.getMember("actionType.mediaType", item) || item.mediaType;
                    switch (itemType) {
                        case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Episode:
                        case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Season:
                        case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Series:
                        case Microsoft.Entertainment.Queries.ObjectType.tvSeries:
                        case Microsoft.Entertainment.Queries.ObjectType.tvSeason:
                            return MS.Entertainment.ViewModels.VideoMarketplace.tvSeriesLowDensityCardTemplateSize;
                        default:
                            return MS.Entertainment.ViewModels.VideoMarketplace.movieLowDensityCardTemplateSize
                    }
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.Pages", {Video2Watchlist: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.Pages.MarketplacePageWithRemoveButton", "/Components/Video/VideoMarketplaceTemplates.html#watchlistGalleryTemplate", function video2Watchlist() {
            if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.watchlistService))
                MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.watchlistService).initialize()
        }, {
            _lastSelectedIndex: 0, freeze: function freeze() {
                    if (this._galleryView && !this._unloaded) {
                        var selectedElement = WinJS.Utilities.query(".template-verticalCardTile:focus", this._galleryView.domElement);
                        if (selectedElement && selectedElement[0]) {
                            this._lastSelectedIndex = this._galleryView.getIndexForElement(selectedElement[0]);
                            this._galleryView.focusFirstItemOnRender = false
                        }
                    }
                    MS.Entertainment.Pages.MarketplacePageWithRemoveButton.prototype.freeze.call(this)
                }, thaw: function thaw() {
                    MS.Entertainment.Pages.MarketplacePageWithRemoveButton.prototype.thaw.call(this);
                    WinJS.Promise.timeout(200).then(function restoreFocus() {
                        if (this._galleryView && !this._unloaded) {
                            var items = WinJS.Utilities.query(".template-verticalCardTile", this._galleryView.domElement);
                            if (items && items.length) {
                                var itemToFocus = items[this._lastSelectedIndex] || items[0];
                                if (itemToFocus)
                                    itemToFocus.focus()
                            }
                        }
                    }.bind(this))
                }
        }, {}, {computeWatchlistHubItemSize: function computeWatchlistHubItemSize(item, itemIndex) {
                itemIndex = itemIndex || 0;
                var itemType = WinJS.Utilities.getMember("mediaType", item);
                switch (itemType) {
                    case Microsoft.Entertainment.Queries.ObjectType.tvSeries:
                    case Microsoft.Entertainment.Queries.ObjectType.tvSeason:
                        return MS.Entertainment.ViewModels.VideoMarketplace.tvSeriesWatchlistGalleryWidth;
                    default:
                        return MS.Entertainment.ViewModels.VideoMarketplace.movieWatchlistGalleryWidth
                }
            }})});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {VerticalCardGalleryItem: MS.Entertainment.UI.Framework.defineUserControl(null, function VerticalCardGalleryItem(){}, {
            mediaItem: null, frozen: false, _showPopoverPromise: null, freeze: function freeze() {
                    MS.Entertainment.UI.Framework.UserControl.prototype.freeze.call(this);
                    if (this._showPopoverPromise) {
                        this._showPopoverPromise.cancel();
                        this._showPopoverPromise = null
                    }
                    this.frozen = true
                }, thaw: function thaw() {
                    MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this);
                    this.frozen = false
                }, _onClick: function _onClick() {
                    var initialPreferences = {};
                    if (MS.Entertainment.Utilities.isVideoApp2 && this.mediaItem && this.mediaItem.bundleOffer) {
                        if (this.mediaItem.bundleOffer.videoDefinition)
                            initialPreferences.preferredVideoResolution = this._getVideoDefinitionFromResolutionFormat(this.mediaItem.bundleOffer.videoDefinition);
                        if (this.mediaItem.bundleOffer.primaryAudioLanguage)
                            initialPreferences.preferredLanguage = this.mediaItem.bundleOffer.primaryAudioLanguage
                    }
                    if (MS.Entertainment.Utilities.isApp2 && MS.Entertainment.Platform.PlaybackHelpers.isTVEpisode(this.mediaItem)) {
                        if (this._showPopoverPromise)
                            return;
                        this._showPopoverPromise = this.mediaItem.hydrate().then(function hydrateSeries(mediaItem) {
                            if (!mediaItem.hydrated)
                                return WinJS.Promise.wrapError(new Error("mediaItem not hydrated"));
                            var seriesItem = MS.Entertainment.Utilities.convertMediaItemToTvSeries(mediaItem);
                            return seriesItem.hydrate()
                        }).then(function openEpisode(seriesItem) {
                            if (!seriesItem.hydrated)
                                return WinJS.Promise.wrapError(new Error("seriesItem not hydrated"));
                            return MS.Entertainment.Video2.EpisodeDetailsOverlay.show(this.mediaItem, {}, seriesItem, initialPreferences)
                        }.bind(this));
                        this._showPopoverPromise.done(function() {
                            this._showPopoverPromise = null
                        }.bind(this), function() {
                            this._showPopoverPromise = null
                        }.bind(this))
                    }
                    else
                        MS.Entertainment.Platform.PlaybackHelpers.showItemDetails({
                            dataContext: {
                                data: this.mediaItem, preferences: initialPreferences
                            }, itemConstructor: MS.Entertainment.Utilities.getTvInlineDetailsPopoverControl()
                        })
                }, _getVideoDefinitionFromResolutionFormat: function _getVideoDefinitionFromResolutionFormat(resolutionFormat) {
                    var edsResolutionFormats = MS.Entertainment.Data.Augmenter.Marketplace.edsResolutionFormat;
                    var videoDefinition;
                    if (resolutionFormat === edsResolutionFormats.hd1080p || resolutionFormat === edsResolutionFormats.hd)
                        videoDefinition = MS.Entertainment.Data.Augmenter.Marketplace.videoDefinition.hd;
                    else if (resolutionFormat === edsResolutionFormats.sd || resolutionFormat === edsResolutionFormats.xd)
                        videoDefinition = MS.Entertainment.Data.Augmenter.Marketplace.videoDefinition.sd;
                    else
                        MS.Entertainment.UI.Controls.fail("Resolution format '{0}'not recognized".format(resolutionFormat));
                    return videoDefinition
                }
        }, {}, {
            templates: MS.Entertainment.UI.Framework.lazyDefine(function() {
                var templates = ["/Components/Video/VideoMarketplaceTemplates.html#featuredSetsTVTemplate", "/Components/Video/VideoMarketplaceTemplates.html#featuredSetsMovieTemplate", "/Components/Video/VideoMarketplaceTemplates.html#video1FeaturedSetTemplate", "/Components/Video/VideoMarketplaceTemplates.html#bundledTvVerticalItemTemplate", "/Components/Video/VideoMarketplaceTemplates.html#tvVerticalItemTemplate", "/Components/Video/VideoMarketplaceTemplates.html#bundledMovieVerticalItemTemplate", "/Components/Video/VideoMarketplaceTemplates.html#movieVerticalItemTemplate", "/Components/Video/VideoMarketplaceTemplates.html#featuredSetItemTemplate", "/Components/Video/VideoMarketplaceTemplates.html#castVerticalItemTemplate", ];
                return templates
            }), selectVerticalItemTemplate: function selectVerticalItemTemplate(item) {
                    var template = String.empty;
                    if (MS.Entertainment.Utilities.isVideoApp1) {
                        if (item.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeason || item.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeries || MS.Entertainment.Platform.PlaybackHelpers.isTVEpisode(item))
                            template = "/Components/Video/VideoMarketplaceTemplates.html#featuredSetsTVTemplate";
                        else if (item.mediaType === Microsoft.Entertainment.Queries.ObjectType.video)
                            template = "/Components/Video/VideoMarketplaceTemplates.html#featuredSetsMovieTemplate";
                        else if (item.type === MS.Entertainment.Data.Augmenter.Spotlight.MediaType.FlexHub)
                            template = "/Components/Video/VideoMarketplaceTemplates.html#video1FeaturedSetTemplate"
                    }
                    else if (item.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeason || item.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeries || MS.Entertainment.Platform.PlaybackHelpers.isTVEpisode(item))
                        if (item.isPartOfBundle)
                            template = "/Components/Video/VideoMarketplaceTemplates.html#bundledTvVerticalItemTemplate";
                        else
                            template = "/Components/Video/VideoMarketplaceTemplates.html#tvVerticalItemTemplate";
                    else if (item.mediaType === Microsoft.Entertainment.Queries.ObjectType.video)
                        if (item.isPartOfBundle)
                            template = "/Components/Video/VideoMarketplaceTemplates.html#bundledMovieVerticalItemTemplate";
                        else
                            template = "/Components/Video/VideoMarketplaceTemplates.html#movieVerticalItemTemplate";
                    else if (item.type === MS.Entertainment.Data.Augmenter.Spotlight.MediaType.FlexHub)
                        template = "/Components/Video/VideoMarketplaceTemplates.html#featuredSetItemTemplate";
                    else if (item.studio || item.network)
                        template = "/Components/Video/VideoMarketplaceTemplates.html#studioAndNetworkGalleryItemTemplate";
                    else
                        template = "/Components/Video/VideoMarketplaceTemplates.html#castVerticalItemTemplate";
                    if (!template)
                        return WinJS.Promise.wrapError(new Error("Unsupported item for Video1 Featured Sets."));
                    return MS.Entertainment.UI.Framework.loadTemplate(template, null, true)
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {VerticalGalleryItemWithRemoveButton: MS.Entertainment.UI.Framework.defineUserControl(null, function verticalGalleryItemWithRemoveButton(element) {
            if (element && element.parentElement)
                this.containerElement = element.parentElement
        }, {
            mediaItem: null, containerElement: null, _onClick: function _onClick() {
                    MS.Entertainment.Platform.PlaybackHelpers.showItemDetails({
                        dataContext: {data: this.mediaItem}, itemConstructor: MS.Entertainment.Utilities.getTvInlineDetailsPopoverControl()
                    })
                }, _onFocusIn: function _onFocusIn() {
                    if (this.containerElement)
                        WinJS.Utilities.addClass(this.containerElement, "focused")
                }, _onFocusOut: function _onFocusOut() {
                    if (this.containerElement)
                        WinJS.Utilities.removeClass(this.containerElement, "focused")
                }
        }, {}, {})});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {VerticalRecommendationsGalleryItem: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.VerticalGalleryItemWithRemoveButton", null, function VerticalRecommendationsGalleryItem(element){}, {}, {}, {selectRecommendationsItemTemplate: function selectRecommendationsItemTemplate(item) {
                if (MS.Entertainment.Utilities.isVideoApp2) {
                    var template = "/Components/Video/VideoMarketplaceTemplates.html#movieRecommendationsItemTemplate";
                    if (item.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeason || item.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeries || MS.Entertainment.Platform.PlaybackHelpers.isTVEpisode(item))
                        template = "/Components/Video/VideoMarketplaceTemplates.html#tvRecommendationsItemTemplate";
                    return MS.Entertainment.UI.Framework.loadTemplate(template, null, true).then(function(templateControl) {
                            return templateControl
                        })
                }
            }})});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {VerticalWatchlistsGalleryItem: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.VerticalGalleryItemWithRemoveButton", null, function VerticalWatchlistsGalleryItem(element){}, {}, {}, {
            templates: MS.Entertainment.UI.Framework.lazyDefine(function() {
                var templates = ["/Components/Video/VideoMarketplaceTemplates.html#movieWatchlistsItemTemplate", "/Components/Video/VideoMarketplaceTemplates.html#tvWatchlistsItemTemplate", ];
                return templates
            }), selectWatchlistItemTemplate: function selectWatchlistItemTemplate(item) {
                    if (MS.Entertainment.Utilities.isVideoApp2) {
                        var template = "/Components/Video/VideoMarketplaceTemplates.html#movieWatchlistsItemTemplate";
                        if (item.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeason || item.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeries || MS.Entertainment.Platform.PlaybackHelpers.isTVEpisode(item))
                            template = "/Components/Video/VideoMarketplaceTemplates.html#tvWatchlistsItemTemplate";
                        return MS.Entertainment.UI.Framework.loadTemplate(template, null, true).then(function(templateControl) {
                                return templateControl
                            })
                    }
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {MovieVerticalItem: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.VerticalCardGalleryItem", "/Components/Video/VideoMarketplaceTemplates.html#largeMovieTitleRatingTemplate")});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {BundledVerticalItemBase: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.VerticalCardGalleryItem", null, function bundledVerticalItem() {
            this._marketplaceEvents = MS.Entertainment.Utilities.addEventHandlers(Microsoft.Entertainment.Marketplace.Marketplace, {mediarightchanged: this._mediaRightChanged.bind(this)})
        }, {
            _isOwned: null, _marketplaceEvents: null, _updateMediaItemPromise: null, _mediaRightChangedPromise: null, _mediaItemBinding: null, initialize: function initialize() {
                    this._updatePrimaryText();
                    this._updateMediaItem();
                    this._mediaItemBinding = WinJS.Binding.bind(this.mediaItem, {bundleOffer: this._updateSecondaryText.bind(this)})
                }, unload: function unload() {
                    if (this._marketplaceEvents) {
                        this._marketplaceEvents.cancel();
                        this._marketplaceEvents = null
                    }
                    if (this._updateMediaItemPromise) {
                        this._updateMediaItemPromise.cancel();
                        this._updateMediaItemPromise = null
                    }
                    if (this._mediaRightChangedPromise) {
                        this._mediaRightChangedPromise.cancel();
                        this._mediaRightChangedPromise = null
                    }
                    if (this._mediaItemBinding) {
                        this._mediaItemBinding.cancel();
                        this._mediaItemBinding = null
                    }
                    MS.Entertainment.UI.Controls.VerticalCardGalleryItem.prototype.unload.call(this)
                }, _updateMediaItem: function _updateMediaItem(forceUpdate) {
                    if (this._unloaded || !this.mediaItem)
                        return;
                    if (this._updateMediaItemPromise) {
                        this._updateMediaItemPromise.cancel();
                        this._updateMediaItemPromise = null
                    }
                    var hydrateOptions = {isPartOfBundle: true};
                    var hydrateMediaItemPromise = WinJS.Promise.wrap();
                    if (forceUpdate && this.mediaItem.refresh)
                        hydrateMediaItemPromise = this.mediaItem.refresh(hydrateOptions);
                    else if (this.mediaItem.hydrate && !this.mediaItem.hydrated)
                        hydrateMediaItemPromise = this.mediaItem.hydrate(hydrateOptions);
                    this._updateMediaItemPromise = hydrateMediaItemPromise.then(function onHydrateMediaItem() {
                        var hydrateFirstEpisodePromise = WinJS.Promise.wrap();
                        if (MS.Entertainment.Platform.PlaybackHelpers.isTVSeason(this.mediaItem) && this.mediaItem.firstEpisode && this.mediaItem.firstEpisode.hydrate && !this.mediaItem.firstEpisode.hydrated)
                            hydrateFirstEpisodePromise = this.mediaItem.firstEpisode.hydrate();
                        return hydrateFirstEpisodePromise
                    }.bind(this)).then(function onHydrateEpisode() {
                        if (MS.Entertainment.Platform.PlaybackHelpers.isTVSeason(this.mediaItem))
                            return MS.Entertainment.ViewModels.SmartBuyStateEngine.getMarketplaceFileAccessAsync(this.mediaItem).then(function stateInfoToIsOwned(stateInfo) {
                                    return WinJS.Promise.wrap(stateInfo && (stateInfo.hasPurchased > 0 || stateInfo.hasPurchasedSeason))
                                });
                        else
                            return WinJS.Promise.wrap(this.mediaItem.inCollection)
                    }.bind(this)).then(function updateOwnedAndRatingItem(isOwned) {
                        if (this._isOwned === null || this._isOwned !== isOwned) {
                            this._isOwned = isOwned;
                            this._updateSecondaryText()
                        }
                        var ratingItemHydratePromise = WinJS.Promise.wrap();
                        if (MS.Entertainment.Platform.PlaybackHelpers.isTVSeason(this.mediaItem) || MS.Entertainment.Platform.PlaybackHelpers.isTVEpisode(this.mediaItem)) {
                            var seriesItem = MS.Entertainment.Utilities.convertMediaItemToTvSeries(this.mediaItem);
                            ratingItemHydratePromise = seriesItem.hydrate().then(function seriesItemHydrated(series) {
                                this.ratingItem = series
                            }.bind(this))
                        }
                        else
                            this.ratingItem = this.mediaItem;
                        return ratingItemHydratePromise
                    }.bind(this)).then(function complete() {
                        this._updateMediaItemPromise = null
                    }.bind(this), function onError(error) {
                        this._updateMediaItemPromise = null;
                        if (!WinJS.Promise.isCanceledError(error))
                            return WinJS.Promise.wrapError(error);
                        return null
                    }.bind(this))
                }, _mediaRightChanged: function _mediaRightChanged(serviceMediaId) {
                    if (this._unloaded || !this.mediaItem)
                        return;
                    if (this._mediaRightChangedPromise) {
                        this._mediaRightChangedPromise.cancel();
                        this._mediaRightChangedPromise = null
                    }
                    this._mediaRightChangedPromise = MS.Entertainment.ViewModels.SmartBuyStateEngine.mediaContainsServiceMediaIdAsync(this.mediaItem, serviceMediaId).then(function onMediaContainsServiceIdComplete(containsServiceId) {
                        if (this._unloaded || !this.mediaItem || !containsServiceId)
                            return;
                        return this._updateMediaItem(true)
                    }.bind(this)).then(function() {
                        this._mediaRightChangedPromise = null
                    }.bind(this), function onError(error) {
                        this._mediaRightChangedPromise = null;
                        if (!WinJS.Promise.isCanceledError(error))
                            return WinJS.Promise.wrapError(error);
                        return null
                    }.bind(this))
                }, _updatePrimaryText: function _updatePrimaryText() {
                    if (this.mediaItem.primaryText)
                        this.primaryText = this.mediaItem.primaryText;
                    else
                        this.primaryText = String.empty
                }, _updateSecondaryText: function _updateSecondaryText() {
                    if (this._isOwned)
                        this.secondaryText = String.load(String.id.IDS_VIDEO_IN_COLLECTION_LABEL);
                    else if (this.mediaItem.bundleOffer) {
                        var currentVideoDefinition = this.mediaItem.bundleOffer.videoDefinition;
                        var currentPrimaryAudioLanguage;
                        var variousLanguages = true;
                        if (this.mediaItem.bundleOffer.primaryAudioLanguage && this.mediaItem.bundleOffer.primaryAudioLanguage.toUpperCase() !== MS.Entertainment.Utilities.VARIOUS_LANGUAGES_CODE.toUpperCase()) {
                            currentPrimaryAudioLanguage = this.mediaItem.bundleOffer.primaryAudioLanguage;
                            variousLanguages = false
                        }
                        var isSeason = MS.Entertainment.Platform.PlaybackHelpers.isTVSeason(this.mediaItem);
                        var isMovie = MS.Entertainment.Platform.PlaybackHelpers.isMovie(this.mediaItem);
                        var selectedOffer = MS.Entertainment.ViewModels.VideoSmartBuyStateEngine.getDefaultBuyOffer(this.mediaItem, isSeason, currentVideoDefinition, currentPrimaryAudioLanguage);
                        if (!selectedOffer) {
                            var matchingOfferId;
                            var bundledItemOffers = this.mediaItem.bundleOffer.bundledItems;
                            for (var i = 0; i < bundledItemOffers.length; i++)
                                if (bundledItemOffers[i].mid.toUpperCase() === this.mediaItem.zuneId.toUpperCase()) {
                                    matchingOfferId = bundledItemOffers[i].offerId;
                                    break
                                }
                            var rights;
                            if (isMovie)
                                rights = this.mediaItem.unfilteredRights;
                            else
                                rights = this.mediaItem.rights;
                            if (matchingOfferId) {
                                var matchingOffers = [];
                                for (var i = 0; i < rights.length; i++) {
                                    var currentOffer = rights[i];
                                    if (currentOffer.offerId && currentOffer.offerId.toUpperCase() === matchingOfferId.toUpperCase())
                                        matchingOffers.push(currentOffer)
                                }
                            }
                            if (matchingOffers && matchingOffers.length > 0) {
                                var bundledMediaItem = this.mediaItem.clone();
                                bundledMediaItem.rights = matchingOffers;
                                selectedOffer = MS.Entertainment.ViewModels.VideoSmartBuyStateEngine.getDefaultBuyOffer(bundledMediaItem, isSeason, currentVideoDefinition, currentPrimaryAudioLanguage, true)
                            }
                        }
                        if (selectedOffer) {
                            this.secondaryText = MS.Entertainment.ViewModels.VideoSmartBuyStateEngine.getPriceString(selectedOffer);
                            if (selectedOffer.primaryAudioLanguage && variousLanguages)
                                this.languageText = MS.Entertainment.Utilities.getDisplayLanguageFromLanguageCode(selectedOffer.primaryAudioLanguage);
                            else
                                this.languageText = String.empty
                        }
                    }
                }
        }, {
            primaryText: String.empty, secondaryText: String.empty, languageText: String.empty, ratingItem: null
        })});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {BundledMovieVerticalItem: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.BundledVerticalItemBase", "/Components/Video/VideoMarketplaceTemplates.html#largeBundledMovieTitlePriceRatingTemplate")});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {BundledTvVerticalItem: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.BundledVerticalItemBase", "/Components/Video/VideoMarketplaceTemplates.html#largeBundledTvTitlePriceTemplate", null, {_updatePrimaryText: function _updatePrimaryText() {
                if (this.mediaItem.seriesTitle)
                    this.primaryText = String.load(String.id.IDS_APP2_PAGE_TITLE_PRIMARY).format(this.mediaItem.seriesTitle, this.mediaItem.primaryText);
                else
                    MS.Entertainment.UI.Controls.BundledVerticalItemBase.prototype._updatePrimaryText.call(this)
            }})});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {MovieRecommendationsItem: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.VerticalRecommendationsGalleryItem", "/Components/Video/VideoMarketplaceTemplates.html#largeMovieRecommendationsTemplate")});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {MovieWatchlistItem: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.VerticalWatchlistsGalleryItem", "/Components/Video/VideoMarketplaceTemplates.html#largeMovieWatchlistItemTemplate")});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {TvVerticalItem: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.VerticalCardGalleryItem", "/Components/Video/VideoMarketplaceTemplates.html#largeTvTitleRatingTemplate")});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {TvRecommendationsItem: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.VerticalRecommendationsGalleryItem", "/Components/Video/VideoMarketplaceTemplates.html#largeTvRecommendationsTemplate")});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {TvWatchlistItem: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.VerticalWatchlistsGalleryItem", "/Components/Video/VideoMarketplaceTemplates.html#largeTvWatchlistsTemplate")});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {MarketplaceRemoveButton: MS.Entertainment.UI.Framework.defineUserControl(null, function marketplaceRemoveButton(element) {
            if (element && element.parentElement)
                this.containerElement = element.parentElement
        }, {
            mediaItem: null, containerElement: null, _hideContainerElement: function _hideContainerElement() {
                    if (this.containerElement)
                        return MS.Entertainment.Utilities.hideElement(this.containerElement);
                    else
                        return WinJS.Promise.wrap()
                }, _dispatchRemoveEvent: function _dispatchRemoveEvent(mediaItem) {
                    var itemsControlElement = WinJS.Utilities.query(".currentPage .watchlistPage .marketplaceGalleryFlex");
                    var itemsControl = itemsControlElement && itemsControlElement[0] && itemsControlElement[0].winControl;
                    MS.Entertainment.UI.Controls.assert(itemsControl, "ItemsControl not found in MarketplaceRemoveButton");
                    if (itemsControl && !this._unloaded)
                        itemsControl.dispatchEvent(MS.Entertainment.UI.Controls.MarketplaceRemoveButton.events.removeItem, {
                            sender: this, mediaItem: mediaItem
                        })
                }, _onFocusIn: function _onFocusIn() {
                    if (this.containerElement)
                        WinJS.Utilities.addClass(this.containerElement, "focused")
                }, _onFocusOut: function _onFocusOut() {
                    if (this.containerElement)
                        WinJS.Utilities.removeClass(this.containerElement, "focused")
                }
        }, {}, {events: {removeItem: "removeItem"}})});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {RecommendationsNotInterestedButton: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.MarketplaceRemoveButton", "/Components/Video/VideoMarketplaceTemplates.html#recommendationsNotInterestedTemplate", function recommendationsNotInterestedButton(element){}, {
            mediaItem: null, _onClick: function _onClick() {
                    if (this.mediaItem) {
                        MS.Entertainment.Utilities.addNotInterestedRecommendationsItem(this.mediaItem);
                        this._hideContainerElement().then(function fireNotInterested() {
                            this._dispatchRemoveEvent(this.mediaItem)
                        }.bind(this));
                        MS.Entertainment.Utilities.postNotInterestedRecommendationsItem(this.mediaItem)
                    }
                }
        }, {}, {})});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {WatchlistRemoveButton: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.MarketplaceRemoveButton", "/Components/Video/VideoMarketplaceTemplates.html#watchlistRemoveButtonTemplate", function watchlistRemoveButton(element){}, {
            mediaItem: null, _onClick: function _onClick() {
                    if (this.mediaItem) {
                        this._hideContainerElement().then(function fireWatchlistRemove() {
                            this._dispatchRemoveEvent(this.mediaItem)
                        }.bind(this));
                        var watchlistService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.watchlistService);
                        watchlistService.removeItemFromWatchlist(this.mediaItem)
                    }
                }
        }, {}, {})});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {Video1FeaturedSetMediaItem: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.VerticalCardGalleryItem", null, null, {
            _onClick: function _onClick() {
                MS.Entertainment.Platform.PlaybackHelpers.showImmersive(this.mediaItem)
            }, _onFocusIn: function _onFocusIn(event) {
                    var galleryScroller = document.querySelector(".currentPage .marketplace.marketplaceGalleryView.marketplaceGallery.flexHubPage");
                    MS.Entertainment.Pages.assert(galleryScroller, "no scroll container found for Video 1 Featured Sets");
                    if (!galleryScroller)
                        return;
                    var itemsToCheck = [];
                    var elementsInItemsControl = galleryScroller.querySelectorAll(".win-focusable");
                    if (elementsInItemsControl && elementsInItemsControl.length) {
                        var itemsToCheck = [elementsInItemsControl[0]];
                        var firstItemLeft = WinJS.Utilities.getPosition(elementsInItemsControl[0]).left;
                        for (var i = 1; i < elementsInItemsControl.length; i++) {
                            var itemLeft = WinJS.Utilities.getPosition(elementsInItemsControl[i]).left;
                            if (itemLeft === firstItemLeft)
                                itemsToCheck.push(elementsInItemsControl[i]);
                            else
                                break
                        }
                        for (var j = 0; j < itemsToCheck.length; j++)
                            if (event && event.target === itemsToCheck[j])
                                galleryScroller.scrollLeft = 0
                    }
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {FeaturedSetMovieItem: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.Video1FeaturedSetMediaItem", "/Components/Video/VideoMarketplaceTemplates.html#featuredSetsMovieCardItemTemplate")});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {FeaturedSetTVItem: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.Video1FeaturedSetMediaItem", "/Components/Video/VideoMarketplaceTemplates.html#featuredSetsTVCardItemTemplate")});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {CastVerticalItem: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.VerticalCardGalleryItem", "/Components/Video/VideoMarketplaceTemplates.html#largeCastTemplate", null, {_onClick: function _onClick() {
                MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).navigateTo(MS.Entertainment.UI.Monikers.actorDetailsPage, null, null, {mediaItem: this.mediaItem}, true)
            }})});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {FeaturedSetItem: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.Video1FeaturedSetMediaItem", "/Components/Video/VideoMarketplaceTemplates.html#wideFeaturedSetItemTemplate", null, {_onClick: function _onClick() {
                if (this.mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.editorial) {
                    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                    var featuredSetAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.featuredSetsNavigate);
                    featuredSetAction.parameter = {
                        page: MS.Entertainment.UI.Monikers.flexHubPage, targetFeed: this.mediaItem.actionTarget
                    };
                    featuredSetAction.execute()
                }
            }})});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {StudioAndNetworkGalleryItem: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.VerticalCardGalleryItem", "/Components/Video/VideoMarketplaceTemplates.html#studioAndNetworkGalleryWideItemTemplate", null, {_onClick: function _onClick() {
                var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                var navigateAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.videoMarketplaceNavigate);
                if (this.mediaItem.studio)
                    navigateAction.parameter = {
                        moniker: MS.Entertainment.UI.Monikers.movieMarketplaceNewReleases, page: MS.Entertainment.UI.Monikers.movieMarketplace, hub: MS.Entertainment.UI.Monikers.movieMarketplaceNewReleases, args: {
                                selectHub: true, selectSecondaryModifier: this.mediaItem.studio
                            }
                    };
                else if (this.mediaItem.network)
                    navigateAction.parameter = {
                        moniker: MS.Entertainment.UI.Monikers.tvMarketplaceNewReleases, page: MS.Entertainment.UI.Monikers.tvMarketplace, hub: MS.Entertainment.UI.Monikers.tvMarketplaceNewReleases, args: {
                                selectHub: true, selectSecondaryModifier: this.mediaItem.network
                            }
                    };
                else {
                    MS.Entertainment.UI.Actions.fail("Media Item is not a network or a studio");
                    return
                }
                navigateAction.execute()
            }})});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {Video1FeaturedSetItem: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.FeaturedSetItem", "/Components/Video/VideoMarketplaceTemplates.html#video1FeaturedSetItemTemplate")})
})()
