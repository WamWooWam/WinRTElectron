/*  © Microsoft. All rights reserved. */
(function () {
    "use strict";
    function getSourcesDataManager(options) {
        var dataManager = null;
        if (NewsJS.StateHandler.instance.FeaturedSourcesWereAdded) {
            dataManager = new NewsJS.Customization.UserSourcesDataManager(options)
        }
        else {
            dataManager = new NewsJS.Customization.FeaturedSourcesDataManager(options)
        }
        return dataManager
    }
    function getCategoriesDataManager(options) {
        var dataManager = new NewsJS.Customization.CategoriesDataManager(options);
        return dataManager
    }
    WinJS.Namespace.define("NewsJS.Customization", {
        getSourcesDataManager: getSourcesDataManager, getCategoriesDataManager: getCategoriesDataManager
    })
})();
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS.Customization", {
        CategoriesDataManager: WinJS.Class.define(function ctor_CategoriesDataManager(options) {
            this._appMarket = Platform.Globalization.Marketization.getCurrentMarket();
            options = options || {};
            this._guid = options.guid
        }, {
            _guid: null, getAllAsync: function getAllAsync(market, type, dataFormat) {
                switch (type) {
                    case "categories_grouped":
                        return NewsJS.Customization.CategoriesDataManager._getUserCategories(market, dataFormat).then(function (results) {
                            var items = [];
                            if (results && results.categories && results.categories.length) {
                                for (var i = 0; i < results.categories.length; i++) {
                                    items.push(results.categories[i])
                                }
                            }
                            var label = PlatformJS.Services.resourceLoader.getString("CustomizationCategoriesButton");
                            var result = {};
                            result[label] = items;
                            return result
                        }, function (err) {
                            return {}
                        });
                    case "followed":
                        return NewsJS.Customization.CategoriesDataManager._getUserCategories(market).then(function (results) {
                            var items = [];
                            if (results && results.categories && results.categories.length) {
                                for (var i = 0; i < results.categories.length; i++) {
                                    var resultCategory = results.categories[i];
                                    if (resultCategory && resultCategory.data && resultCategory.data.selected) {
                                        items.push(resultCategory)
                                    }
                                }
                            }
                            return items
                        }, function (err) {
                            return []
                        });
                    default:
                        return NewsJS.Customization.CategoriesDataManager._getInternationalCategories(market, dataFormat, this._appMarket, this._guid).then(function (results) {
                            var groups = [];
                            if (results && results.categoryName) {
                                groups[results.categoryName] = results.categories
                            }
                            return groups
                        }, function (err) {
                            return []
                        })
                }
            }, navigate: function navigate(data) {
                if (data.type === NewsJS.Personalization.Utilities.sourceType.InternationalBingDaily) {
                    PlatformJS.Navigation.navigateToChannel("HomePage", { market: data.market })
                }
                else {
                    NewsJS.Customization.CategoriesDataManager._navigateToMarketCategory(data.cluster)
                }
            }, getDefaultAsync: function getDefaultAsync(market) {
                var promises = [];
                promises.push(NewsApp.PersonalizationManager.getDefaultClusters(market));
                promises.push(NewsApp.PersonalizationManager.getClusterDefinitions());
                return WinJS.Promise.join(promises).then(function (results) {
                    var clusters = [];
                    if (results) {
                        var clustersFromServer = results[0];
                        if (clustersFromServer && clustersFromServer.length) {
                            var userClusters = results[1];
                            if (userClusters) {
                                var customizeHomeEnabled = PlatformJS.Services.configuration.getDictionary("FRECustomization").getBool("FRECustomizeHomeEnabled");
                                for (var i = 0; i < clustersFromServer.length; i++) {
                                    var cluster = clustersFromServer[i];
                                    if (cluster) {
                                        if (customizeHomeEnabled && cluster.isCategory) {
                                            var item = NewsJS.Customization.CategoriesDataManager._formatClusterItem(cluster, market, userClusters);
                                            item.data.tile_backgroundImage = cluster.imageUrl;
                                            item.data.isPreselected = cluster.isPreselected;
                                            clusters.push(item)
                                        }
                                        else {
                                            var item = NewsJS.Customization.CategoriesDataManager._formatClusterItem(cluster, market, userClusters);
                                            item.data.isPreselected = true;
                                            clusters.push(item)
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return clusters
                })
            }, addAsync: function addAsync(clusterDefinition) {
                return NewsApp.PersonalizationManager.addClusterDefinition(clusterDefinition, this._appMarket)
            }, addManyAsync: function addManyAsync(categories) {
                return WinJS.Promise.wrap(null)
            }, removeAsync: function removeAsync(clusterDefinition) {
                return NewsApp.PersonalizationManager.removeClusterDefinition(clusterDefinition.guid, this._appMarket)
            }, saveAsync: function saveAsync(sources) {
                return WinJS.Promise.wrap(null)
            }, removeManyAsync: function removeManyAsync(clusterDefinitions) {
                return WinJS.Promise.wrap(null)
            }, initializeAsync: function initializeAsync(configuration) {
                return WinJS.Promise.wrap(null)
            }, updateManyAsync: function updateManyAsync(addItems, removeItems) {
                return NewsApp.PersonalizationManager.applyClusterAdditionsAndDeletions(this._appMarket, removeItems, addItems)
            }
        }, {
            _navigateToMarketCategory: function _navigateToMarketCategory(clusterDefinition) {
                if (clusterDefinition && clusterDefinition.providerConfiguration) {
                    var providerConfig = clusterDefinition.providerConfiguration;
                    if (providerConfig.categoryKey) {
                        var categoryKey = providerConfig.categoryKey;
                        if (categoryKey) {
                            var navigationState = { categoryKey: providerConfig.categoryKey };
                            PlatformJS.Navigation.navigateToChannel("CategoryPage", navigationState)
                        }
                    }
                }
            }, _processTitle: function _processTitle(title) {
                var result = title;
                if (title && title.indexOf("_") === 0 && title.lastIndexOf("_") === title.length - 1) {
                    result = PlatformJS.Services.resourceLoader.getString(title.substring(1, title.length - 1))
                }
                return result
            }, _formatClusterItem: function _formatClusterItem(cluster, market, userClusters) {
                var item = {};
                item.data = {};
                if (cluster) {
                    item.data.cluster = cluster;
                    item.data.id = cluster.guid;
                    item.data.displayname = NewsJS.Customization.CategoriesDataManager._processTitle(cluster.title)
                }
                item.data.tileType = "SearchResultTopic";
                item.data.type = "marketCluster";
                item.data.market = market;
                item.data.selected = false;
                item.data.win8_image = "";
                if (userClusters && userClusters.length) {
                    for (var i = 0; i < userClusters.length; i++) {
                        var userCluster = userClusters[i];
                        if (userCluster && userCluster.guid === item.data.cluster.guid) {
                            item.data.selected = true;
                            break
                        }
                    }
                }
                return item
            }, _getUserCategories: function _getUserCategories(market, dataFormat) {
                var promises = [];
                promises.push(NewsApp.PersonalizationManager.getDefaultClusters());
                promises.push(NewsApp.PersonalizationManager.getClusterDefinitions());
                return WinJS.Promise.join(promises).then(function (results) {
                    var categories = [];
                    if (results) {
                        var defaultClusters = results[0];
                        var userClusters = results[1];
                        var formatSource = (dataFormat === NewsJS.Personalization.Utilities.selectionPageFormat.FORMAT_SOURCE);
                        if (defaultClusters && defaultClusters.length) {
                            for (var i = 0; i < defaultClusters.length; i++) {
                                var cluster = defaultClusters[i];
                                if (NewsApp.PersonalizationManager.isHeroCluster(cluster) || NewsApp.PersonalizationManager.isTempCluster(cluster) || NewsApp.PersonalizationManager.isNextStepsCluster(cluster)) {
                                    continue
                                }
                                if (formatSource && NewsApp.PersonalizationManager.isSourcesCluster(cluster)) {
                                    continue
                                }
                                var item = NewsJS.Customization.CategoriesDataManager._formatClusterItem(cluster, market, userClusters);
                                if (item) {
                                    categories.push(item)
                                }
                            }
                        }
                    }
                    return {
                        categoryName: CommonJS.resourceLoader.getString("Categories"), categories: categories
                    }
                }, function (err) {
                    return null
                })
            }, _createClusterDefinition: function _createClusterDefinition(ec, userClusters) {
                var item = {};
                item.data = {};
                var market = item.data.id = ec.content.source.name;
                item.data.market = market;
                item.data.type = NewsJS.Personalization.Utilities.sourceType.InternationalBingDaily;
                item.template = "sourceItemTemplate";
                item.data.tileType = NewsJS.Personalization.Utilities.tileType.Customize;
                if (ec.image && ec.image.images && ec.image.images[0] && ec.image.images[0].url) {
                    item.data.win8_image = ec.image.images[0].url
                }
                else {
                    item.data.win8_image = ""
                }
                var tmp = document.createElement("div");
                tmp.innerHTML = toStaticHTML(ec.content.headline);
                var val = tmp.innerText;
                item.data.displayname = val;
                tmp.innerHTML = toStaticHTML(ec.content.abstract);
                item.data.cluster = NewsApp.PersonalizationManager.createInternationalEditionUserSection(val, market);
                if (userClusters && userClusters.length) {
                    for (var i = 0; i < userClusters.length; i++) {
                        var userCluster = userClusters[i];
                        if (userCluster && userCluster.guid === item.data.cluster.guid) {
                            item.data.selected = true;
                            break
                        }
                    }
                }
                var state = { clustersDefinition: userClusters };
                item.data.selected = NewsApp.PersonalizationManager.isInternationalEditionFollowed(state, val, market);
                return item
            }, _createSourceDefinition: function _createSourceDefinition(ec, appMarket, guid) {
                var item = {};
                item.data = {};
                var market = item.data.id = ec.content.source.name;
                item.data.market = market;
                item.data.type = NewsJS.Personalization.Utilities.sourceType.InternationalBingDaily;
                item.categoryKey = "sourcesContent";
                item.moduleInfo = {};
                item.template = "sourceItemTemplate";
                item.data.tileType = NewsJS.Personalization.Utilities.tileType.Customize;
                item.data.sourcedescription = "";
                var tmp = document.createElement("div");
                tmp.innerHTML = toStaticHTML(ec.content.headline);
                var val = tmp.innerText;
                item.data.displayname = val;
                if (ec.image && ec.image.images && ec.image.images[0] && ec.image.images[0].url) {
                    item.data.win8_image = ec.image.images[0].url
                }
                else {
                    item.data.win8_image = ""
                }
                item.data.source = true;
                item.data.selected = NewsJS.Utilities.isSourceFollowed(item.data, {
                    market: appMarket, guid: guid
                });
                return item
            }, _getInternationalCategories: function _getInternationalCategories(market, dataFormat, appMarket, guid) {
                return new WinJS.Promise(function (complete, error, progress) {
                    NewsApp.PersonalizationManager.getClusterDefinitions().then(function getCategoryInfoFromClusters(userClusters) {
                        var categoryInfoCreated = false;
                        var urlParams = PlatformJS.Collections.createStringDictionary();
                        urlParams.insert("market", market);
                        var options = new Platform.DataServices.QueryServiceOptions;
                        var qs = new Platform.QueryService("CategoriesData");
                        qs.downloadDataAsync(urlParams, null, null, options).then(function handleDownloadDataAsyncData(responseData) {
                            if (!categoryInfoCreated) {
                                if (responseData && responseData.dataString && responseData.dataString.length > 0) {
                                    var categoryInfo = NewsJS.Customization.CategoriesDataManager._createCategoryInfo(responseData, dataFormat, userClusters, appMarket, guid);
                                    complete(categoryInfo)
                                }
                                else {
                                    error()
                                }
                            }
                        }, function handleDownloadDataAsyncError(e) {
                            if (!PlatformJS.Utilities.isPromiseCanceled(e)) {
                                error(e)
                            }
                        }, function handleDownloadDataAsyncProgress(p) {
                            if (p.statusCode && p.statusCode === Platform.DataServices.QueryServiceStatusCode.cachedEntryFound) {
                                var responseData = p.cachedResponse;
                                if (responseData && responseData.dataString && responseData.dataString.length > 0) {
                                    categoryInfoCreated = true;
                                    var categoryInfo = NewsJS.Customization.CategoriesDataManager._createCategoryInfo(responseData, dataFormat, userClusters, appMarket, guid);
                                    complete(categoryInfo)
                                }
                            }
                        })
                    }, function getClusterDefinitionsError(e) {
                        if (!PlatformJS.Utilities.isPromiseCanceled(e)) {
                            error(e)
                        }
                    })
                })
            }, _createCategoryInfo: function _createCategoryInfo(response, dataFormat, userClusters, appMarket, guid) {
                var json = JSON.parse(response.dataString);
                var categoryInfo = {};
                var clusters = json.clusters;
                if (clusters) {
                    for (var i = 0; i < clusters.length; i++) {
                        var cluster = clusters[i];
                        if (cluster) {
                            var entityList = cluster.entityList;
                            if (entityList && entityList.collectionId === "international") {
                                categoryInfo.categoryName = entityList.categoryName;
                                categoryInfo.categories = [];
                                var entities = entityList.entities;
                                if (entities && entities.length) {
                                    for (var k = 0; k < entities.length; k++) {
                                        var ec = entities[k];
                                        if (ec) {
                                            var item = null;
                                            if (dataFormat === NewsJS.Personalization.Utilities.selectionPageFormat.FORMAT_SOURCE) {
                                                item = NewsJS.Customization.CategoriesDataManager._createSourceDefinition(ec, appMarket, guid)
                                            }
                                            else if (dataFormat === NewsJS.Personalization.Utilities.selectionPageFormat.FORMAT_CLUSTER) {
                                                item = NewsJS.Customization.CategoriesDataManager._createClusterDefinition(ec, userClusters)
                                            }
                                            if (item) {
                                                categoryInfo.categories.push(item)
                                            }
                                        }
                                    }
                                }
                                break
                            }
                        }
                    }
                }
                return categoryInfo
            }
        })
    })
})();
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS.Customization", {
        UserSourcesDataManager: WinJS.Class.define(function (options) {
            options = options || {};
            this._guid = options.guid;
            this._market = options.market || NewsJS.Globalization.getMarketString();
            this._defaultOptions = {
                market: this._market, guid: this._guid
            }
        }, {
            _guid: null, _market: null, _defaultOptions: {}, getAllAsync: function getAllAsync(market, type) {
                var market = market || this._market;
                var options = {
                    market: market, guid: this._guid
                };
                if (!type || type === "followed") {
                    return NewsJS.Utilities.readUserSources(options)
                }
                else {
                    if (type === "RSS") {
                        return NewsJS.Utilities.readUserSources(options).then(function (sources) {
                            var rssSources = [];
                            for (var s in sources) {
                                var source = sources[s];
                                if (source.isCustomRSS) {
                                    rssSources.push(source)
                                }
                            }
                            return WinJS.Promise.wrap(rssSources)
                        }, function () {
                            return WinJS.Promise.wrap([])
                        })
                    }
                }
            }, addAsync: function addAsync(source) {
                return NewsJS.Utilities.followSources([source], this._defaultOptions, true)
            }, addManyAsync: function addManyAsync(sources) {
                return NewsJS.Utilities.followSources(sources, this._defaultOptions, true)
            }, removeAsync: function removeAsync(source) {
                return NewsJS.Utilities.unfollowSources([source], this._defaultOptions, true)
            }, saveAsync: function saveAsync(sources) {
                return NewsJS.Utilities.saveSourcesAsync(sources, this._defaultOptions)
            }, removeManyAsync: function removeManyAsync(sources) {
                return NewsJS.Utilities.unfollowSources(sources, this._defaultOptions, true)
            }, initializeAsync: function initializeAsync(configuration) {
                return WinJS.Promise.wrap({})
            }
        })
    })
})();
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS.Customization", {
        FeaturedSourcesDataManager: WinJS.Class.define(function (options) {
            options = options || {};
            this._guid = options.guid;
            this._market = options.market || NewsJS.Globalization.getMarketString();
            this._defaultOptions = {
                market: this._market, guid: this._guid
            }
        }, {
            _guid: null, _market: null, _defaultOptions: {}, getAllAsync: function getAllAsync(market) {
                var market = market || this._market;
                var guid = this._guid;
                var options = {
                    market: market, guid: guid
                };
                if (!NewsJS.StateHandler.instance.FeaturedSourcesWereAdded) {
                    return NewsJS.Utilities.readFeaturedSources(market).then(function (featuredSources) {
                        NewsJS.Utilities.followSources(featuredSources, options, true);
                        NewsJS.StateHandler.instance.FeaturedSourcesWereAdded = true;
                        return featuredSources
                    }, function (err) {
                        return null
                    })
                }
                else {
                    return WinJS.Promise.wrap(NewsJS.StateHandler.instance.getSources())
                }
            }, addAsync: function addAsync(source) {
                return WinJS.Promise.wrap({})
            }, addManyAsync: function addManyAsync(sources) {
                return WinJS.Promise.wrap({})
            }, removeAsync: function removeAsync(source) {
                return WinJS.Promise.wrap({})
            }, saveAsync: function saveAsync(sources) {
                return NewsJS.Utilities.saveSourcesAsync(sources, this._defaultOptions)
            }, removeManyAsync: function removeManyAsync(sources) {
                return NewsJS.Utilities.unfollowSources(sources, this._defaultOptions, true)
            }, initializeAsync: function initializeAsync(configuration) {
                return WinJS.Promise.wrap({})
            }
        })
    })
})();
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS", {
        CategoriesGalleryProvider: WinJS.Class.define(function (options) {
            this.dataManager = NewsJS.Customization.getCategoriesDataManager(options)
        }, {
            getContent: function getContent(market, type) {
                var that = this;
                return this.loadPageData(type).then(function (val) {
                    return val
                }, function (err) {
                    return []
                })
            }, followItem: function followItem(item) {
                var clusterDefinition = item.cluster;
                return this.dataManager.addAsync(clusterDefinition)
            }, unfollowItem: function unfollowItem(item) {
                var clusterDefinition = item.cluster;
                return this.dataManager.removeAsync(clusterDefinition)
            }, loadPageData: function loadPageData(type) {
                return this.dataManager.getAllAsync(Platform.Globalization.Marketization.getCurrentMarket(), type)
            }
        }, { _version: 1 })
    })
})();
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS.Personalization", {
        DataManager: WinJS.Class.define(function (options) {
            this._cnpLiveData = options.liveData;
            this._cnpItems = options.items,
                this._dataKey = options.dataKey,
                this._itemsKey = options.itemsKey;
            this._init()
        }, {
            _cnpLiveData: null, _cnpItems: null, _init: function _init() {
                this._cnpItems = this.getMyRoamingData(this._itemsKey);
                this._cnpLiveData = this.getMyRoamingData(this._dataKey)
            }, _removeMyItemsData: function _removeMyItemsData(newItems) {
                var that = this;
                newItems.forEach(function (item) {
                    if (item.data.topicEntity) {
                        var topic = item.data.topicEntity.title;
                        NewsJS.Utilities.unfollowTopic(topic);
                        that._removeSingleItemData(topic)
                    }
                })
            }, _getMyItemsData: function _getMyItemsData() {
                return this._cnpLiveData
            }, _setMyItemsData: function _setMyItemsData(data) {
                var that = this;
                this._cnpLiveData = data
            }, _removeSingleItemData: function _removeSingleItemData(key) {
                if (!this._cnpLiveData || !this._cnpLiveData[key]) {
                    return
                }
                delete this._cnpLiveData[key];
                this.setMyRoamingData(this._dataKey, this._cnpLiveData)
            }, _setMySingleItemData: function _setMySingleItemData(key, value) {
                if (!this._cnpLiveData) {
                    this._cnpLiveData = {}
                }
                this._cnpLiveData[key] = value;
                if (value) {
                    this.setMyRoamingData(this._dataKey, this._cnpLiveData)
                }
            }, _getMyItems: function _getMyItems() {
                return this._cnpItems
            }, _setMyItems: function _setMyItems(items) {
                this._cnpItems = items
            }, foundItem: function foundItem(item) {
                var items = this._cnpItems;
                var found = this._isDup(items, item);
                return found
            }, handleAddItem: function handleAddItem(item) {
                var that = this;
                var itemAdded = that._addMyItem(item);
                if (itemAdded) {
                    this.setMyRoamingData(this._itemsKey, this._cnpItems)
                }
                return itemAdded
            }, handleRemoveItems: function handleRemoveItems(removedItems) {
                var that = this;
                if (removedItems) {
                    that._removeMyItems(removedItems);
                    that.setMyRoamingData(that._itemsKey, that._cnpItems);
                    that._removeMyItemsData(removedItems);
                    that.setMyRoamingData(that._dataKey, that._cnpLiveData)
                }
            }, handleRemoveItem: function handleRemoveItem(index) {
                var that = this;
                if (index > 0) {
                    var item = that._cnpItems[index];
                    that._removeMyItems([{ data: item }]);
                    that.setMyRoamingData(that._itemsKey, that._cnpItems);
                    that._removeMyItemsData([{ data: item }]);
                    that.setMyRoamingData(that._dataKey, that._cnpLiveData)
                }
            }, _removeMyItems: function _removeMyItems(newItems) {
                var that = this;
                var items = this._cnpItems;
                var toChange = [];
                newItems.forEach(function (item) {
                    var found = that._isDup(items, item.data);
                    if (found) {
                        toChange.push(found);
                        items.splice(items.indexOf(found), 1)
                    }
                });
                return toChange
            }, _addMyItem: function _addMyItem(newItem) {
                var that = this;
                var items = this._cnpItems;
                var found = that._isDup(items, newItem);
                if (!found) {
                    items.push(newItem);
                    return newItem
                }
                return null
            }, _addMyItems: function _addMyItems(newItems) {
                var that = this;
                var items = this._cnpItems;
                var toChange = [];
                newItems.forEach(function (item) {
                    var found = that._isDup(items, item);
                    if (!found) {
                        toChange.push(item);
                        items.push(item)
                    }
                });
                return toChange
            }, _isDup: function _isDup(items, theOne) {
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    if (item && (item.displaynameHeadline && item.displaynameHeadline === theOne.displaynameHeadline) || (item.id && item.id === theOne.id)) {
                        return item
                    }
                }
            }, hasRoamingData: function hasRoamingData() {
                return localStorage.getItem(this._itemsKey)
            }, setMyRoamingData: function setMyRoamingData(key, value) {
                localStorage.setItem(key, JSON.stringify(value))
            }, getMyRoamingData: function getMyRoamingData(key) {
                try {
                    var data = localStorage.getItem(key);
                    if (data) {
                        return JSON.parse(data)
                    }
                }
                catch (e) {
                    return null
                }
                return null
            }
        })
    })
})();
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS.Personalization", {
        Utilities: WinJS.Class.mix(WinJS.Class.define(function (options) { }, {}, {
            mySourcesKey: "mySources", myTopicsKey: "myTopics", cnpItemsKey: "appexNewsCnPItem", cnpHeadlineKey: "appexNewsCnPData", maxCnPItems: 1024, supportTrends: true, maxTrendingItems: 60, todayMyItemsTemplate: "todayMyItemsTemplate", todayMyItemsTemplateImageOnly: "todayMyItemsTemplateImageOnly", todayMyItemsTemplateRss: "todayMyItemsTemplateRss", todayMyItemsTrendsTemplateTextOnly: "todayMyItemsTrendsTemplateTextOnly", todayMyItemsTrendsTemplate: "todayMyItemsTrendsTemplate", myItemsAddTile: "myItemsAddTile", tileSizeLarge: 290, tileSizeSmall: 140, tileType: {
                Customize: "Customize", Featured: "Featured", SeeMore: "SeeMore", AddMore: "AddMore"
            }, tileSize: {
                Large: "Large", Wide: "Wide", Small: "Small"
            }, sourceType: { InternationalBingDaily: "InternationalBingDaily" }, sectionType: {
                Category: "Category", Topics: "Topics", Sources: "Sources", InternationalBingDaily: "InternationalBingDaily"
            }, selectionPageFormat: {
                FORMAT_CLUSTER: "Cluster", FORMAT_SOURCE: "Source"
            }, selectionPageFeature: {
                TYPE_SOURCES: "Sources", TYPE_TOPICS: "Topics", TYPE_TOPICS_FLAT: "Topics_Flat", TYPE_INTERNATIONAL: "International", TYPE_CATEGORIES: "Categories", TYPE_LOCAL: "Local"
            }, sectionCategory: {
                InternationalBingDaily: "InternationalBingDaily", marketCluster: "marketCluster", Featured: "Featured", Topics: "Topic", Source: "Source"
            }, imageConverter: WinJS.Binding.converter(function (thumbnail) {
                if (thumbnail && thumbnail.url) {
                    return "block"
                }
                else {
                    return "none"
                }
            }), tabOrderConverter: WinJS.Binding.converter(function (id) {
                var trendsDiv = WinJS.Utilities.query(".myTrendsList", document.body);
                var maxItemToShow = parseInt(trendsDiv.getAttribute("maxItemToShow"));
                if (id < maxItemToShow) {
                    return 0
                }
                return -1
            })
        }), WinJS.Utilities.eventMixin)
    })
})()