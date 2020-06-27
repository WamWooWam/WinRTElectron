/*  © Microsoft. All rights reserved. */
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS", {
        SourcesGalleryProvider: WinJS.Class.define(function (options) {
            options = options || {};
            var defaultMarket = options.market || NewsJS.Globalization.getMarketStringForSources();
            this.market = defaultMarket;
            this._guid = options.guid;
            this.appMarket = options.appMarket;
            this._dataProvider = NewsJS.Customization.getSourcesDataManager({ guid: options.guid });
            this._dummyClusterName = PlatformJS.Services.resourceLoader.getString("AllSources");
            this._categoryManager = NewsJS.Customization.getCategoriesDataManager({ guid: options.guid });
            this.forceMerge = options.forceMerge;
            this._defaultOptions = {
                market: this.appMarket, guid: this._guid
            }
        }, {
            getContent: function getContent(market, type, dataFormat) {
                var that = this;
                if (market) {
                    this.market = market
                }
                if (type === "followed") {
                    return this._dataProvider.getAllAsync(market, "followed").then(function (followedSources) {
                        return that._convertFollowedSources(followedSources)
                    }, function (e) {
                        return []
                    })
                }
                else {
                    var promises = [];
                    promises.push(this.loadPageData(market));
                    promises.push(NewsApp.PersonalizationManager.getClusterDefinitions());
                    return WinJS.Promise.join(promises).then(function (results) {
                        var val = results[0];
                        var indexResults = 0;
                        var userClusters = results[1];
                        if (that.shouldMergeFeaturedSource(market)) {
                            that.featuredSources = val[0];
                            indexResults = 1
                        }
                        that._pageDataPromise = null;
                        that._sourcesResponse = val[indexResults];
                        that._rssResponse = val[++indexResults];
                        return that.sourcesFetchCompleted(dataFormat, market, userClusters)
                    })
                }
            }, getRSSSources: function getRSSSources() {
                return this._dataProvider.getAllAsync(this.market, "RSS")
            }, sourcesFetchCompleted: function sourcesFetchCompleted(dataFormat, market, userClusters) {
                var that = this;
                this.createSourcesDictionary(that._sourcesResponse.dataResponse, dataFormat);
                var groups = this._sourcesContentEntries;
                for (var g in groups) {
                    var group = groups[g];
                    var invalidItems = [];
                    if (group && group.length > 0) {
                        for (var i = 0; i < group.length; i++) {
                            var item = group[i];
                            if (item && item.data) {
                                item.data.tileType = NewsJS.Personalization.Utilities.tileType.Customize;
                                item.data.source = true;
                                if (dataFormat === NewsJS.Personalization.Utilities.selectionPageFormat.FORMAT_CLUSTER) {
                                    var clusterDef = this._createClusterDefinition(item.data, market, userClusters);
                                    if (clusterDef) {
                                        item.data.cluster = clusterDef
                                    }
                                    else {
                                        invalidItems.push(item)
                                    }
                                }
                                else {
                                    item.data.selected = this._getFollowedState(item, dataFormat)
                                }
                            }
                        }
                    }
                    invalidItems.forEach(function (badItem) {
                        if (badItem && badItem.data && badItem.data.id) {
                            console.log("sourcesGalleryProvider: invalid source: " + badItem.data.id)
                        }
                        var index = group.indexOf(badItem);
                        group.splice(index, 1)
                    })
                }
                groups["RSS"] = [];
                for (var rss in that._rssResponse) {
                    var rssitem = {
                        categoryKey: "sourcesContent", data: that._rssResponse[rss], moduleInfo: {}, template: "sourceItemTemplate"
                    };
                    rssitem.data.selected = true;
                    rssitem.data.tileType = NewsJS.Personalization.Utilities.tileType.Customize;
                    rssitem.data.source = true;
                    groups["RSS"].push(rssitem)
                }
                return groups
            }, _getFollowedState: function _getFollowedState(item, dataType) {
                if (dataType === NewsJS.Personalization.Utilities.selectionPageFormat.FORMAT_CLUSTER) {
                    return false
                }
                else {
                    return NewsJS.Utilities.isSourceFollowed(item.data, this._defaultOptions)
                }
            }, _convertFollowedSources: function _convertFollowedSources(followedSources) {
                var items = [];
                for (var source in followedSources) {
                    var followedItem = {
                        categoryKey: "sourcesContent", data: followedSources[source], template: "sourceItemTemplate"
                    };
                    followedItem.data.selected = true;
                    followedItem.data.tileType = NewsJS.Personalization.Utilities.tileType.Customize;
                    items.push(followedItem)
                }
                return items
            }, followItem: function followItem(item) {
                return NewsJS.Utilities.followSources([item], this._defaultOptions, true)
            }, followItems: function followItems(items) {
                return NewsJS.Utilities.followSources(items, this._defaultOptions, true)
            }, addManyAsync: function addManyAsync(items) {
                return NewsJS.Utilities.unfollowSources(items, this._defaultOptions, true)
            }, removeManyAsync: function removeManyAsync(item) {
                return NewsJS.Utilities.unfollowSources([item], this._defaultOptions, true)
            }, updateManyAsync: function updateManyAsync(addItems, removeItems) {
                return NewsJS.Utilities.updateSources(addItems, removeItems, this._defaultOptions, true)
            }, navigate: function navigate(data, market) {
                Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(NewsJS.Telemetry.String.ImpressionNavMethod.browseSources);
                if (data.type === NewsJS.Personalization.Utilities.sourceType.InternationalBingDaily) {
                    PlatformJS.Navigation.navigateToChannel("HomePage", {
                        market: data.market, title: data.displayname
                    })
                }
                else if (data.tileType === NewsJS.Personalization.Utilities.tileType.Featured) {
                    this._partnerPanoItemInvoked(data, market)
                }
                else if (data.tileType === NewsJS.Personalization.Utilities.tileType.Customize) {
                    this._sourceNavigate(data, "sourcegallery", market)
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
            }, _partnerPanoItemInvoked: function _partnerPanoItemInvoked(item, market) {
                if (item.destination) {
                    var newsUri = NewsJS.Utilities.parseCMSUriString(item.destination);
                    if (newsUri && newsUri.entitytype === "partnerPano" && newsUri.params && !newsUri.params["entrypoint"]) {
                        newsUri = NewsJS.Utilities.parseCMSUriString(item.destination + "&entrypoint=" + Windows.Foundation.Uri.escapeComponent("bingdailycluster"))
                    }
                    if (newsUri && newsUri.uri) {
                        Windows.System.Launcher.launchUriAsync(newsUri.uri)
                    }
                }
            }, _createClusterDefinition: function _createClusterDefinition(data, market, userClusters) {
                var clusterConfig = null;
                var clusterDefinition = this.createCategoryObject(data, market, userClusters);
                return clusterDefinition
            }, createCategoryObject: function createCategoryObject(source, market, userClusters) {
                var category = {
                    title: source.displayname, guid: source.id + "." + market
                };
                var state = { clustersDefinition: userClusters };
                var navigationInfo = NewsJS.Utilities.navigationInfoForSource(source);
                source.selected = false;
                if (navigationInfo && navigationInfo.pageInfo && navigationInfo.pageInfo.channelId) {
                    switch (navigationInfo.pageInfo.channelId) {
                        case ("RSSSourcePage"):
                            category = NewsApp.PersonalizationManager.createSourceSection("rss", market, source);
                            source.selected = NewsApp.PersonalizationManager.isSourceFollowed(state, source.id, market, "rss");
                            break;
                        case ("SourceNavPage"):
                            category = NewsApp.PersonalizationManager.createSourceSection("algo", market, source);
                            source.selected = NewsApp.PersonalizationManager.isSourceFollowed(state, source.id, market, "algo");
                            break;
                        case ("NYT"):
                            break;
                        case ("WSJ"):
                            break;
                        default:
                            category = NewsApp.PersonalizationManager.createSourceSection("partner", market, source);
                            source.selected = NewsApp.PersonalizationManager.isSourceFollowed(state, source.id, market, "partner");
                            break
                    }
                    ;
                }
                else {
                    category = null
                }
                return category
            }, _sourceNavigate: function _sourceNavigate(source, entrypoint, market) {
                var that = this;
                NewsJS.Utilities.navigateToSource(source, function (src) {
                    NewsJS.Utilities.updateStateOnSourceVisited(src.id, market)
                }, entrypoint, market)
            }, shouldMergeFeaturedSource: function shouldMergeFeaturedSource(m) {
                if (this.forceMerge) {
                    return true
                }
                else {
                    var market = m || NewsJS.Globalization.getMarketStringForSources();
                    var shouldMerge = PlatformJS.Services.appConfig.getDictionary("SourcesConfig").getBool("MergeFeaturedSourcesDataSource");
                    var editorialMarket = NewsJS.Globalization.getMarketStringForEditorial();
                    if (shouldMerge && (!market || !editorialMarket || market.toLowerCase() !== editorialMarket.toLowerCase())) {
                        shouldMerge = false
                    }
                    return shouldMerge
                }
            }, loadPageData: function loadPageData(requestedMarket) {
                var that = this;
                var mergeFeaturedSources = this.shouldMergeFeaturedSource(requestedMarket);
                that.isOnline = NewsJS.Utilities.CachedNetworkChecks.hasInternetConnection();
                var market = this.market || NewsJS.Globalization.getMarketStringForSources();
                var editorialMarket = NewsJS.Globalization.getMarketStringForEditorial();
                var promises = [];
                if (mergeFeaturedSources) {
                    promises.push(NewsJS.Utilities.fetchFeaturedSourcesData(requestedMarket).then(function (results) {
                        return WinJS.Promise.wrap(results)
                    }, function (error) {
                        return WinJS.Promise.wrap({})
                    }))
                }
                promises.push(this.fetchData());
                that._pageDataPromise = WinJS.Promise.join(promises);
                return that._pageDataPromise
            }, createSourceContent: function createSourceContent(entity, market, createFeaturedSourcesCluster) {
                return {
                    categoryKey: "sourcesContent", template: "sourceItemTemplate", data: NewsJS.Utilities.createSourceData(this._sourcesResponse, entity, null, createFeaturedSourcesCluster, this.featuredSources), moduleInfo: { renderer: this.sourcesItemRenderer }
                }
            }, getGroups: function getGroups(sourceContent) {
                var groups = [];
                if (sourceContent && sourceContent.data) {
                    var group = sourceContent.data.newscategory;
                    if (group) {
                        groups = group.toLocaleLowerCase().split(",");
                        for (var i = 0; i < groups.length; i++) {
                            if (groups[i] && groups[i].length > 0) {
                                groups[i] = decodeURIComponent(groups[i])
                            }
                        }
                    }
                }
                return groups
            }, createSourcesDictionary: function createSourcesDictionary(data, dataFormat) {
                var market = this.market || NewsJS.Globalization.getMarketString();
                var groups = [];
                var sources = [];
                if (data) {
                    groups = data.Filters[0].Items;
                    sources = data.Topics;
                    this._sourcesContentEntries = {};
                    this._numFeedGroups = groups.length;
                    var columnMap = this._sourcesResponse.columnMap;
                    var sourcesConfigDictionary = PlatformJS.Services.appConfig.getDictionary("SourcesConfig");
                    var createFeaturedSourcesCluster = sourcesConfigDictionary.getBool("ShowFeaturedSourcesClusterOnGalleryPano");
                    var selectedNameInState = this.selectedGroupName;
                    this._sourcesContentEntries[this._dummyClusterName] = [];
                    for (var i = 0; i < sources.length; i++) {
                        var validSource = false;
                        var entity = sources[i];
                        if (!News.NewsUtil.instance.isDomainBlockListed(entity[columnMap["topicname"]]) && this._isSourceSupported(entity[columnMap["requiredfeatures"]])) {
                            var content = this.createSourceContent(entity, market, createFeaturedSourcesCluster);
                            if (dataFormat === NewsJS.Personalization.Utilities.selectionPageFormat.FORMAT_CLUSTER && (content.data.id === "newssource_more_nytimes_com" || content.data.id === "newssource_more_online_wsj_com")) {
                                continue
                            }
                            var sourceGroups = createFeaturedSourcesCluster ? this.getGroups(content) : [this._dummyClusterName];
                            if (!sourceGroups || sourceGroups.length === 0) {
                                sourceGroups = [this._dummyClusterName]
                            }
                            for (var j = 0; j < sourceGroups.length; j++) {
                                var group = sourceGroups[j];
                                if (!group || group.length === 0) {
                                    group = this._dummyClusterName
                                }
                                if (!this._sourcesContentEntries[group]) {
                                    this._sourcesContentEntries[group] = []
                                }
                                this._sourcesContentEntries[group].push(content);
                                validSource = true
                            }
                        }
                    }
                    for (var key in this._sourcesContentEntries) {
                        this._sourcesContentEntries[key].sort(function (a, b) {
                            var alphaA = a.data.alpha.toLocaleLowerCase();
                            var alphaB = b.data.alpha.toLocaleLowerCase();
                            if (alphaA < alphaB) {
                                return -1
                            }
                            else if (alphaA > alphaB) {
                                return 1
                            }
                            else {
                                return 0
                            }
                        })
                    }
                }
            }, fetchData: function fetchData() {
                var that = this;
                return new WinJS.Promise(function (complete, error, progress) {
                    that._fetchCacheData().done(function (cacheData) {
                        if (cacheData) {
                            complete(cacheData);
                            that._fetchNetworkData().done(function () { }, function () { })
                        }
                        else {
                            progress();
                            that._fetchNetworkData().done(function (networkData) {
                                complete(networkData)
                            }, function (e) {
                                error(e)
                            })
                        }
                    })
                })
            }, _isSourceSupported: function _isSourceSupported(requiredFeatures) {
                if (!requiredFeatures) {
                    return true
                }
                var isSupported = true;
                var supportedFeatures = PlatformJS.Services.appConfig.getString("SupportedFeatures");
                var requiredFeaturesArray = requiredFeatures.split(",");
                var supportedFeaturesArray = supportedFeatures.split(",");
                for (var counter = 0; counter < requiredFeaturesArray.length; counter++) {
                    var requiredFeature = requiredFeaturesArray[counter];
                    if (supportedFeaturesArray.indexOf(requiredFeature) === -1) {
                        isSupported = false;
                        break
                    }
                }
                return isSupported
            }, _fetchSourceInfo: function _fetchSourceInfo() {
                var that = this;
                var sourcesFetched = false;
                return new WinJS.Promise(function (complete, error, progress) {
                    NewsJS.Utilities.fetchSourcesInfo(that.market).done(function (data) {
                        if (!sourcesFetched) {
                            sourcesFetched = that._fetchSources(data, complete, error)
                        }
                    }, function (e) {
                        if (PlatformJS.Utilities.isPromiseCanceled(e)) {
                            return
                        }
                        error(e)
                    }, function (p) {
                        if (p.statusCode === Platform.DataServices.QueryServiceStatusCode.cachedEntryFound) {
                            var data = p.cachedResponse;
                            sourcesFetched = that._fetchSources(data, complete, error)
                        }
                    })
                })
            }, _fetchSources: function _fetchSources(data, complete, error) {
                var errorResult = null;
                var sourcesFetched = false;
                try {
                    var response = data && data.dataString ? JSON.parse(data.dataString) : null;
                    if (response && response.urls && Array.isArray(response.urls) && response.urls.length > 0 && response.urls[0].Path) {
                        sourcesFetched = true;
                        complete(response)
                    }
                    else {
                        errorResult = new SyntaxError("SyntaxError")
                    }
                }
                catch (err) {
                    errorResult = err
                }
                if (errorResult) {
                    error(errorResult)
                }
                return sourcesFetched
            }, _fetchSourceData: function _fetchSourceData(infoResponse) {
                if (!infoResponse) {
                    return WinJS.Promise.wrap(null)
                }
                var dataQueryService = new PlatformJS.DataService.QueryService("SourcesData");
                var dataParams = PlatformJS.Collections.createStringDictionary();
                var url = infoResponse.urls[0].Path;
                dataParams.insert("url", url);
                var options = new Platform.DataServices.QueryServiceOptions;
                var processResponse = function (responseString) {
                    var result = {
                        response: null, errorResult: null
                    };
                    var sourceResponse = null;
                    try {
                        sourceResponse = JSON.parse(responseString);
                        if (sourceResponse) {
                            result.response = sourceResponse
                        }
                        else {
                            result.errorResult = new SyntaxError("error")
                        }
                    }
                    catch (err) {
                        result.errorResult = err
                    }
                    return result
                };
                return new WinJS.Promise(function (complete, error, progress) {
                    dataQueryService.downloadDataAsync(dataParams, null, null, options).done(function (data) {
                        var result = processResponse(data.dataString);
                        if (result.response) {
                            complete(result.response)
                        }
                        else {
                            error(result.errorResult)
                        }
                    }, function (e) {
                        if (PlatformJS.Utilities.isPromiseCanceled(e)) {
                            return
                        }
                        error(e)
                    })
                })
            }, _buildColumnMap: function _buildColumnMap(dataResponse) {
                var that = this;
                var columnMap = {};
                if (dataResponse && dataResponse.Columns) {
                    for (var i = 0; i < dataResponse.Columns.length; i++) {
                        columnMap[dataResponse.Columns[i].ID] = dataResponse.Columns[i].Position
                    }
                }
                return columnMap
            }, _validateData: function _validateData(columnMap, data) {
                var that = this;
                var isValidColumn = function (columnName) {
                    return typeof columnMap[columnName] === "number"
                };
                var syntaxError = new SyntaxError("SyntaxError");
                if (!columnMap || !isValidColumn("topicname") || !isValidColumn("rb_hash") || !isValidColumn("alphaorder") || !isValidColumn("displayname") || !isValidColumn("sourcedescription") || !isValidColumn("newscategory")) {
                    return syntaxError
                }
                if (!data || !data.Filters || !Array.isArray(data.Filters) || data.Filters.length < 1 || !data.Filters[0].Items || !Array.isArray(data.Filters[0].Items)) {
                    return syntaxError
                }
                if (!data.Topics || !Array.isArray(data.Topics)) {
                    return syntaxError
                }
                var hasValidOverrideCols = isValidColumn("rb_hash_override") && isValidColumn("rb_hash");
                for (var i = 0; i < data.Topics.length; i++) {
                    var entity = data.Topics[i];
                    if (!entity || !Array.isArray(entity) || entity.length < data.Columns.length) {
                        return syntaxError
                    }
                    if (hasValidOverrideCols) {
                        var oldindex = columnMap["rb_hash"];
                        var newIndex = columnMap["rb_hash_override"];
                        var newValue = entity[newIndex];
                        if (newValue && newValue.length > 0) {
                            entity[oldindex] = newValue
                        }
                    }
                }
                return null
            }, _fetchCacheData: function _fetchCacheData() {
                msWriteProfilerMark("NewsApp:sourcesGalleryProvider:fetchCacheData:s");
                var filename = NewsJS.Constants.getSourcesGalleryProviderCacheFilePath(this.market);
                return WinJS.Application.local.readText(filename).then(function (data) {
                    var result = null;
                    try {
                        if (data) {
                            result = JSON.parse(data);
                            if (result && result.version !== NewsJS.SourcesGalleryProvider._version) {
                                result = null
                            }
                        }
                    }
                    catch (e) {
                        result = null
                    }
                    msWriteProfilerMark("NewsApp:sourcesGalleryProvider:fetchCacheData:e");
                    return result
                }, function (error) {
                    msWriteProfilerMark("NewsApp:sourcesGalleryProvider:fetchCacheData:e");
                    return null
                })
            }, _fetchNetworkData: function _fetchNetworkData() {
                var that = this;
                return new WinJS.Promise(function (complete, error, progress) {
                    that._fetchSourceInfo().then(function (data) {
                        return that._fetchSourceData(data)
                    }, function (err) {
                        error(err)
                    }).done(function (data) {
                        if (data) {
                            var columnMap = that._buildColumnMap(data);
                            var errorResult = that._validateData(columnMap, data);
                            if (errorResult) {
                                error(errorResult)
                            }
                            else {
                                complete({
                                    columnMap: columnMap, dataResponse: data
                                });
                                try {
                                    var str = JSON.stringify({
                                        version: NewsJS.SourcesGalleryProvider._version, columnMap: columnMap, dataResponse: data
                                    });
                                    if (str) {
                                        var filename = NewsJS.Constants.getSourcesGalleryProviderCacheFilePath(that.market);
                                        WinJS.Application.local.writeText(filename, str)
                                    }
                                }
                                catch (e) { }
                            }
                        }
                        else {
                            error(new SyntaxError("SyntaxError"))
                        }
                    }, function (err) {
                        error(err)
                    })
                })
            }
        }, { _version: 1 })
    })
})()