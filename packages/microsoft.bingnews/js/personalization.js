/*  © Microsoft. All rights reserved. */
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS.Personalization", {
        MySourcesDataProvider: WinJS.Class.define(function (options) {
            this._init(options)
        }, {
            _cnpDataManager: null, _options: null, _init: function _init(options) {
                this._options = options || {};
                this._cnpDataManager = NewsJS.Customization.getSourcesDataManager(options)
            }, request: function request() {
                var that = this;
                var market = this._options.market || Platform.Globalization.Marketization.getCurrentMarket();
                return this._cnpDataManager.getAllAsync(market).then(function (sources) {
                    return that._transformToMyItems(sources)
                })
            }, _transformToMyItems: function _transformToMyItems(sources) {
                var that = this;
                var items = [];
                if (sources) {
                    var newOrder = sources.sort(this.compareItems.bind(this));
                    for (var i = 0; i < newOrder.length; i++) {
                        var item = that.createNewItem(sources[i]);
                        if (item) {
                            items.push(item)
                        }
                    }
                }
                return items
            }, _transformToSources: function _transformToSources(myItems) {
                var that = this;
                var sources = [];
                if (myItems) {
                    for (var id in myItems) {
                        var source = myItems[id];
                        sources.push(source.data)
                    }
                }
                return sources
            }, _uniformItem: function _uniformItem(originalData, templateId, tileType) {
                var item = {};
                item.data = originalData ? originalData : {};
                var market = this._options.market || NewsJS.Globalization.getMarketStringForSources();
                item.data.market = item.data.market || market;
                item.itemKey = "key",
                    item.groupKey = "";
                item.groupTitle = "";
                item.moduleInfo = {
                    fragmentPath: "/html/templates.html", templateId: templateId
                };
                item.tileType = tileType;
                item.displayName = "";
                item.thumbnail = { url: "" };
                item.subTitle = "";
                return item
            }, _addOrderBy: function _addOrderBy(sources, order) {
                if (sources && order) {
                    sources.forEach(function (source) {
                        if (source && source.id) {
                            source.orderBy = order.indexOf(source.id) + 1
                        }
                    })
                }
            }, compareItems: function compareItems(a, b) {
                if (a.orderBy && b.orderBy) {
                    return a.orderBy - b.orderBy
                }
                else {
                    return 0
                }
            }, createNewItem: function createNewItem(selectedSource) {
                var that = this;
                var templateId = NewsJS.Personalization.Utilities.todayMyItemsTemplate;
                var item = that._uniformItem(selectedSource, templateId, NewsJS.Personalization.Utilities.tileType.Customize);
                item.displayName = selectedSource.displayname;
                item.sourceDesc = selectedSource.sourcedescription;
                item.thumbnail = { url: selectedSource.win8_image };
                item.key = selectedSource.id;
                item.itemKey = selectedSource.id;
                item.id = selectedSource.id;
                return item
            }, createAddMoreItem: function createAddMoreItem(templateId) {
                var that = this;
                var item = that._uniformItem(null, templateId, NewsJS.Personalization.Utilities.tileType.AddMore);
                item.displayName = "More Sources";
                item.isCommonJSAddTile = true;
                item.id = "addMore";
                item.key = "addMore";
                item.itemKey = "addMore";
                return item
            }, handleRemoveItemsAsync: function handleRemoveItemsAsync(removedItems) {
                var that = this;
                return that._cnpDataManager.removeManyAsync(removedItems)
            }, handleSaveItemsAsync: function handleSaveItemsAsync(items) {
                var that = this;
                return that._cnpDataManager.saveAsync(sources)
            }, handleItemReorderedAsync: function handleItemReorderedAsync(order) {
                var that = this;
                return this._cnpDataManager.getAllAsync().then(function (sources) {
                    that._addOrderBy(sources, order);
                    return that._cnpDataManager.saveAsync(sources)
                })
            }
        })
    })
})();
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS.Personalization", {
        MySourcesControl: WinJS.Class.derive(NewsApp.Controls.ControlBase, function (element, options, orchestrator) {
            NewsApp.Controls.ControlBase.call(this, element, options, orchestrator);
            options = options || {};
            WinJS.Utilities.addClass(this.element, "mySourcesItemsContainer");
            this.handleItemDeleted = this.handleItemDeleted.bind(this);
            this.handleItemReordered = this.handleItemReordered.bind(this);
            this._onAddItemInvokedHandler = this._onAddItemInvoked.bind(this);
            this.element.addEventListener("itemdeleted", this.handleItemDeleted);
            this.element.addEventListener("listreordered", this.handleItemReordered);
            this.element.addEventListener("additeminvoked", this._onAddItemInvokedHandler);
            NewsApp.PageEvents.register("sourceschanged", this._onSourcesChange.bind(this));
            this._market = NewsJS.Globalization.getMarketString();
            this._guid = options.guid
        }, {
            createProviderInstance: function createProviderInstance() {
                return new NewsJS.Personalization.MySourcesDataProvider({
                    guid: this._guid, market: this._market
                })
            }, _dataSource: null, _listBinding: null, _addIndex: 0, _completeHandler: null, _loadingStateChangedEventHandler: null, dispose: function dispose() {
                if (this._completeHandler) {
                    this._completeHandler = null
                }
                if (this.element) {
                    this.element.removeEventListener("itemdeleted", this.handleItemDeleted);
                    this.element.removeEventListener("listreordered", this.handleItemReordered);
                    this.element.removeEventListener("additeminvoked", this._onAddItemInvokedHandler)
                }
                this.handleItemDeleted = null;
                this.handleItemReordered = null;
                this._onAddItemInvoked = null;
                if (this.control) {
                    this.control.removeEventListener("loadingstatechanged", this._loadingStateChangedEventHandler)
                }
                this._loadingStateChangedEventHandler = null;
                NewsApp.Controls.ControlBase.prototype.dispose.call(this)
            }, clearControl: function clearControl() {
                if (this.control) {
                    if (this.control._dispose) {
                        this.control._dispose();
                        this.control = null
                    }
                    if (this.element) {
                        this.element.innerHTML = ""
                    }
                }
            }, renderFirstTime: function renderFirstTime(response) {
                var that = this;
                return new WinJS.Promise(function (completeHandler, errorHandler, progressHandler) {
                    that.clearControl();
                    var itemsToShow = response;
                    that._listBinding = new WinJS.Binding.List(itemsToShow);
                    that._dataSource = that._listBinding.dataSource;
                    var clusterBinding = {
                        groupKey: "", groupTitle: "", contentOptions: {
                            friendlyName: "mySourcesList", selectionMode: "multi", itemDataSource: that._dataSource, itemTemplate: that._renderItem.bind(that), oniteminvoked: that.onItemInvoke.bind(that), addTileItemTemplate: that._renderAddItem.bind(that), enabledFeatures: CommonJS.UI.ResponsiveListView.FEATURES.ALL
                        }
                    };
                    if (!NewsJS.Telemetry.Customization.sourcesReported) {
                        NewsJS.Telemetry.Customization.sourcesReported = true;
                        NewsJS.Telemetry.Customization.recordSources(itemsToShow)
                    }
                    that._completeHandler = completeHandler;
                    var control = that.control = new CommonJS.UI.ResponsiveListView(that.element, clusterBinding.contentOptions);
                    control.scheduler = that.scheduler;
                    control.render();
                    that._loadingStateChangedEventHandler = that._loadingStateChangedEvent.bind(that);
                    control.addEventListener("loadingstatechanged", that._loadingStateChangedEventHandler)
                })
            }, _loadingStateChangedEvent: function _loadingStateChangedEvent() {
                if (this.control) {
                    var loadingState = this.control.loadingState;
                    if (loadingState && loadingState === "complete" && this._completeHandler) {
                        this._completeHandler();
                        this._completeHandler = null
                    }
                }
            }, renderNextTime: function renderNextTime(response) {
                return
            }, _onSourcesChange: function _onSourcesChange() {
                if (this._listBinding) {
                    var that = this;
                    var provider = this.createProviderInstance();
                    provider.request().then(function (sources) {
                        if (sources) {
                            that._listBinding.splice(0, that._listBinding.length - 1);
                            for (var i = sources.length - 1; i >= 0; i--) {
                                that._listBinding.unshift(sources[i])
                            }
                        }
                    })
                }
            }, _renderItem: function _renderItem(itemPromise) {
                return {
                    element: itemPromise.then(function _cnpRenderer(item) {
                        var div = document.createElement("div");
                        WinJS.Utilities.addClass(div, "mySourcesItem");
                        var binding = item.data;
                        return CommonJS.loadModule(binding.moduleInfo, binding, div).then(function () {
                            return div
                        })
                    })
                }
            }, _renderAddItem: function _renderAddItem(itemPromise) {
                var provider = this.createProviderInstance();
                return {
                    element: itemPromise.then(function _cnpRenderer() {
                        var div = document.createElement("div");
                        WinJS.Utilities.addClass(div, "mySourcesItem");
                        div.setAttribute("aria-label", PlatformJS.Services.resourceLoader.getString("AddTopic"));
                        var templateId = NewsJS.Personalization.Utilities.myItemsAddTile;
                        var item = provider.createAddMoreItem(templateId);
                        CommonJS.loadModule(item.moduleInfo, item, div).then();
                        return div
                    })
                }
            }, onConnectionChanged: function onConnectionChanged(evt) {
                if (evt.connection) {
                    this.render()
                }
            }, onResumed: function onResumed(evt) {
                this.render()
            }, onRefreshed: function onRefreshed(evt) {
                this.render()
            }, handleItemDeleted: function handleItemDeleted(e) {
                var that = this;
                var item = e.detail;
                var provider = this.createProviderInstance();
                if (item) {
                    provider.handleRemoveItemsAsync([item]).then(function () {
                        that._addIndex--;
                        item.selected = false;
                        if (item.data) {
                            item.data.selected = false;
                            var category = null;
                            if (item.data.type === "InternationalBingDaily" || item.data.type === "marketCluster") {
                                category = item.data.type
                            }
                            else if (item.data.featured) {
                                category = "Featured"
                            }
                            else if (item.data.newscategory) {
                                category = item.data.newscategory
                            }
                            NewsJS.Telemetry.Customization.recordAddRemove(that._market, item.data, "Source", category)
                        }
                        provider.request().then(function (sources) {
                            NewsJS.Telemetry.Customization.recordSources(sources)
                        })
                    })
                }
            }, handleItemReordered: function handleItemReordered(e) {
                var order = this.control.getOrder();
                var provider = this.createProviderInstance();
                provider.handleItemReorderedAsync(order).then(function (done) {
                    provider.request().then(function (sources) {
                        NewsJS.Telemetry.Customization.recordSources(sources)
                    })
                })
            }, onItemInvoke: function onItemInvoke(e) {
                var that = this;
                Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(NewsJS.Telemetry.String.ImpressionNavMethod.mySources);
                if (!that.control) {
                    return
                }
                var ds = this._dataSource;
                ds.itemFromIndex(e.detail.itemIndex).then(function (item) {
                    if (!that.isAddTile(item)) {
                        that._myItemsItemInvoked(item)
                    }
                })
            }, isAddTile: function isAddTile(tileItem) {
                return (tileItem && tileItem.data && tileItem.data.isCommonJSAddTile)
            }, _myItemsItemInvoked: function _myItemsItemInvoked(item) {
                NewsJS.Telemetry.BingDaily.recordSourcesItemPress(item);
                var data = item.data;
                if (data.data.type === NewsJS.Personalization.Utilities.sourceType.InternationalBingDaily) {
                    PlatformJS.Navigation.navigateToChannel("HomePage", {
                        market: data.data.market, title: data.data.displayname
                    })
                }
                else if (data.tileType === NewsJS.Personalization.Utilities.tileType.Featured) {
                    this._partnerPanoItemInvoked(data.data)
                }
                else if (data.tileType === NewsJS.Personalization.Utilities.tileType.Customize) {
                    this._sourceNavigate(data.data, "sourcegallery")
                }
                else if (data.isCommonJSAddTile) {
                    PlatformJS.Navigation.navigateToChannel("Sources")
                }
                else {
                    if (data.isDeepLink) {
                        PlatformJS.Navigation.navigateTo(data.pageInfo.fragment)
                    }
                    else {
                        WinJS.Navigation.navigate(data.pageInfo, data.state)
                    }
                }
            }, _partnerPanoItemInvoked: function _partnerPanoItemInvoked(item) {
                if (item.destination) {
                    var newsUri = NewsJS.Utilities.parseCMSUriString(item.destination);
                    if (newsUri && newsUri.entitytype === "partnerPano" && newsUri.params && !newsUri.entrypoint) {
                        newsUri = NewsJS.Utilities.parseCMSUriString(item.destination + "&entrypoint=" + Windows.Foundation.Uri.escapeComponent("bingdailycluster"))
                    }
                    if (newsUri && newsUri.uri) {
                        Windows.System.Launcher.launchUriAsync(newsUri.uri)
                    }
                }
            }, _sourceNavigate: function _sourceNavigate(source, entrypoint, market) {
                Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(NewsJS.Telemetry.String.ImpressionNavMethod.mySources);
                market = market || source.market;
                NewsJS.Utilities.navigateToSource(source, function (src) {
                    NewsJS.Utilities.updateStateOnSourceVisited(src.id, market)
                }, entrypoint, market.toLowerCase())
            }, _onAddItemInvoked: function _onAddItemInvoked(e) {
                NewsJS.Telemetry.BingDaily.recordSourcesAddSourcePress();
                var state = {
                    mode: NewsJS.Personalization.Utilities.selectionPageFormat.FORMAT_SOURCE, features: [NewsJS.Personalization.Utilities.selectionPageFeature.TYPE_SOURCES, NewsJS.Personalization.Utilities.selectionPageFeature.TYPE_INTERNATIONAL], isBrowse: false, title: PlatformJS.Services.resourceLoader.getString("AddSourceTile"), guid: this._guid
                };
                PlatformJS.Navigation.navigateToChannel("SelectionPage", state)
            }
        }, {})
    })
})()