/* Copyright (C) Microsoft Corporation. All rights reserved. */
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p];
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    };
var MS;
(function(MS) {
    (function(Entertainment) {
        (function(UI) {
            (function(Video) {
                var VideoHubDashboardContentPanel = (function(_super) {
                        __extends(VideoHubDashboardContentPanel, _super);
                        function VideoHubDashboardContentPanel() {
                            _super.apply(this, arguments)
                        }
                        Object.defineProperty(VideoHubDashboardContentPanel.prototype, "header", {
                            get: function() {
                                return this._header
                            }, set: function(value) {
                                    this.updateAndNotify("header", value)
                                }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(VideoHubDashboardContentPanel.prototype, "items", {
                            get: function() {
                                return this._items
                            }, set: function(value) {
                                    this.updateAndNotify("items", value)
                                }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(VideoHubDashboardContentPanel.prototype, "moreAction", {
                            get: function() {
                                return this._moreAction
                            }, set: function(value) {
                                    this.updateAndNotify("moreAction", value)
                                }, enumerable: true, configurable: true
                        });
                        return VideoHubDashboardContentPanel
                    })(MS.Entertainment.UI.Framework.ObservableBase);
                Video.VideoHubDashboardContentPanel = VideoHubDashboardContentPanel;
                var VideoHubDashboardViewModelData = (function(_super) {
                        __extends(VideoHubDashboardViewModelData, _super);
                        function VideoHubDashboardViewModelData() {
                            _super.apply(this, arguments);
                            this._showNotEnoughKidsContentPanel = false
                        }
                        Object.defineProperty(VideoHubDashboardViewModelData.prototype, "actions", {
                            get: function() {
                                return this._actions
                            }, set: function(value) {
                                    this.updateAndNotify("actions", value)
                                }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(VideoHubDashboardViewModelData.prototype, "primaryContentPanel", {
                            get: function() {
                                return this._primaryContentPanel
                            }, set: function(value) {
                                    this.updateAndNotify("primaryContentPanel", value)
                                }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(VideoHubDashboardViewModelData.prototype, "secondaryContentPanel", {
                            get: function() {
                                return this._secondaryContentPanel
                            }, set: function(value) {
                                    this.updateAndNotify("secondaryContentPanel", value)
                                }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(VideoHubDashboardViewModelData.prototype, "showNotEnoughKidsContentPanel", {
                            get: function() {
                                return this._showNotEnoughKidsContentPanel
                            }, set: function(value) {
                                    this.updateAndNotify("showNotEnoughKidsContentPanel", value)
                                }, enumerable: true, configurable: true
                        });
                        return VideoHubDashboardViewModelData
                    })(MS.Entertainment.UI.Framework.ObservableBase);
                Video.VideoHubDashboardViewModelData = VideoHubDashboardViewModelData;
                var VideoHubDashboardViewModel = (function(_super) {
                        __extends(VideoHubDashboardViewModel, _super);
                        function VideoHubDashboardViewModel(maxPrimaryItems, maxSecondaryItems, loadPanelActions) {
                            _super.call(this);
                            this._viewModelData = null;
                            this._mainQueryRetryTimeout = 250;
                            this._mainQueryRetryAttempts = 1;
                            this._maxQueryRetryAttempts = 6;
                            this._mainQueryRefreshPromise = null;
                            this._maxPrimaryItems = maxPrimaryItems;
                            this._maxSecondaryItems = maxSecondaryItems;
                            this._loadPanelActions = loadPanelActions
                        }
                        VideoHubDashboardViewModel.prototype.dispose = function() {
                            _super.prototype.dispose.call(this);
                            if (this._mainQueryRefreshPromise) {
                                this._mainQueryRefreshPromise.cancel();
                                this._mainQueryRefreshPromise = null
                            }
                        };
                        Object.defineProperty(VideoHubDashboardViewModel.prototype, "viewModelData", {
                            get: function() {
                                return this._viewModelData
                            }, set: function(value) {
                                    this.updateAndNotify("viewModelData", value)
                                }, enumerable: true, configurable: true
                        });
                        VideoHubDashboardViewModel.prototype.getItems = function(refreshing) {
                            var _this = this;
                            if (!refreshing)
                                this.createEmptyDataSource();
                            if (this._mainQueryRefreshPromise) {
                                this._mainQueryRefreshPromise.cancel();
                                this._mainQueryRefreshPromise = null
                            }
                            return this._getResultsFromQuery().then(function(results) {
                                    if (!results)
                                        return null;
                                    var primaryItems = _this.getItemsToDisplay(results.primaryPanelItems, _this._maxPrimaryItems);
                                    var secondaryItems = _this.getItemsToDisplay(results.secondaryPanelItems, _this._maxSecondaryItems);
                                    _this.createDataSource(primaryItems, secondaryItems)
                                }, function() {
                                    if (!refreshing && _this._mainQueryRetryAttempts < _this._maxQueryRetryAttempts) {
                                        _this._mainQueryRetryTimeout *= _this._mainQueryRetryAttempts;
                                        _this._mainQueryRefreshPromise = WinJS.Promise.timeout(_this._mainQueryRetryTimeout).then(_this.getItems.bind(_this));
                                        _this._mainQueryRetryAttempts++
                                    }
                                    return null
                                })
                        };
                        VideoHubDashboardViewModel.prototype.getItemsToDisplay = function(items, maxItems) {
                            var itemsToDisplay = [];
                            if (items)
                                for (var i = 0; i < items.length && itemsToDisplay.length < maxItems; i++) {
                                    var currentItem = (items[i] && items[i].editorialItem) || items[i];
                                    if (this.canDisplayMediaType(currentItem)) {
                                        currentItem = this._wrapEditorialItem(currentItem);
                                        itemsToDisplay.push(currentItem)
                                    }
                                }
                            itemsToDisplay = itemsToDisplay.concat(this._fillEmptyResults(maxItems - itemsToDisplay.length));
                            return itemsToDisplay
                        };
                        VideoHubDashboardViewModel.prototype.createEmptyDataSource = function() {
                            this.createDataSource(this._fillEmptyResults(this._maxPrimaryItems), this._fillEmptyResults(this._maxSecondaryItems))
                        };
                        VideoHubDashboardViewModel.prototype.createDataSource = function(firstPanelItems, secondPanelItems) {
                            if (!this.viewModelData) {
                                var actions = this._getActions();
                                var primaryContentPanel = this._getPrimaryContentPanel();
                                var secondaryContentPanel = this._getSecondaryContentPanel();
                                this.viewModelData = new VideoHubDashboardViewModelData;
                                this.viewModelData.actions = new MS.Entertainment.ObservableArray(actions).bindableItems;
                                this.viewModelData.primaryContentPanel = primaryContentPanel;
                                this.viewModelData.secondaryContentPanel = secondaryContentPanel
                            }
                            if (this.viewModelData.primaryContentPanel)
                                this.viewModelData.primaryContentPanel.items = new MS.Entertainment.ObservableArray(firstPanelItems).bindableItems;
                            if (this.viewModelData.secondaryContentPanel)
                                this.viewModelData.secondaryContentPanel.items = new MS.Entertainment.ObservableArray(secondPanelItems).bindableItems
                        };
                        VideoHubDashboardViewModel.prototype._getQuery = function() {
                            throw new Error("This should be implemented by a subclass.");
                        };
                        VideoHubDashboardViewModel.prototype._getResultsFromQuery = function() {
                            var _this = this;
                            return this._getQuery().execute().then(function(query) {
                                    if (!query || !query.result.entriesArray)
                                        return null;
                                    var items = query.result.entriesArray;
                                    var primaryPanelItems = items && items[0] && items[0].editorialItems;
                                    var secondaryPanelItems = items && items[1] && items[1].editorialItems;
                                    primaryPanelItems = primaryPanelItems.map(function(item) {
                                        return item.editorialItem
                                    });
                                    secondaryPanelItems = secondaryPanelItems.map(function(item) {
                                        return item.editorialItem
                                    });
                                    var contentRestrictionService = null;
                                    if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.contentRestrictionService))
                                        contentRestrictionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.contentRestrictionService);
                                    var wrapPanelItems = function() {
                                            var config = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                                            var numberEmptyTiles = (_this._maxPrimaryItems - primaryPanelItems.length) + (_this._maxSecondaryItems - secondaryPanelItems.length);
                                            if (contentRestrictionService)
                                                contentRestrictionService.getBrowsePolicyUpdatePromise().done(function() {
                                                    if (contentRestrictionService.hasBrowseFilterRestriction() && numberEmptyTiles > config.video.contentRestrictionMaxEmptyFeaturedItems)
                                                        _this.viewModelData.showNotEnoughKidsContentPanel = true;
                                                    else
                                                        _this.viewModelData.showNotEnoughKidsContentPanel = false
                                                });
                                            return WinJS.Promise.wrap({
                                                    primaryPanelItems: primaryPanelItems, secondaryPanelItems: secondaryPanelItems
                                                })
                                        };
                                    if (contentRestrictionService)
                                        return contentRestrictionService.getBrowsePolicyUpdatePromise().then(function() {
                                                if (contentRestrictionService.hasBrowseFilterRestriction()) {
                                                    var primaryPromise = contentRestrictionService.filterRestrictedMediaItems(primaryPanelItems).then(function setFilteredPrimaryItems(filteredPrimaryItems) {
                                                            primaryPanelItems = filteredPrimaryItems
                                                        });
                                                    var secondaryPromise = contentRestrictionService.filterRestrictedMediaItems(secondaryPanelItems).then(function setFilteredSecondaryItems(filteredSecondaryItems) {
                                                            secondaryPanelItems = filteredSecondaryItems
                                                        });
                                                    return WinJS.Promise.join([primaryPromise, secondaryPromise]).then(wrapPanelItems)
                                                }
                                                return wrapPanelItems()
                                            });
                                    return wrapPanelItems()
                                })
                        };
                        VideoHubDashboardViewModel.prototype._getPrimaryContentPanel = function() {
                            throw new Error("This should be implemented by a subclass.");
                        };
                        VideoHubDashboardViewModel.prototype._getSecondaryContentPanel = function() {
                            throw new Error("This should be implemented by a subclass.");
                        };
                        VideoHubDashboardViewModel.prototype._getActions = function() {
                            throw new Error("This should be implemented by a subclass.");
                        };
                        return VideoHubDashboardViewModel
                    })(MS.Entertainment.UI.Video.EditorialDashboardViewModel);
                Video.VideoHubDashboardViewModel = VideoHubDashboardViewModel
            })(UI.Video || (UI.Video = {}));
            var Video = UI.Video
        })(Entertainment.UI || (Entertainment.UI = {}));
        var UI = Entertainment.UI
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
