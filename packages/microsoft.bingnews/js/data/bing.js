/*  © Microsoft. All rights reserved. */
(function () {
    "use strict";
    var LOCAL_OFFLINE_DATA_FILE = "cannedData\\offline.json";
    var LOCAL_FRE_OFFLINE_DATA_FILE = "cannedData\\FREOffline.json";
    var LOCAL_FRE_OFFLINE_CLUSTERSDEFINITION_FILE = "cannedData\\FREOfflineClustersDefinition.json";
    function insertEscapedValue(dictionary, key, value) {
        var escapedValue;
        try {
            escapedValue = encodeURIComponent(value).replace(/\%20/g, "+")
        }
        catch (err) {
            console.log("Encountered error:" + err + " escaping value: " + value);
            escapedValue = value
        }
        dictionary.insert(key, escapedValue)
    }
    function getBingAppID() {
        return PlatformJS.Services.appConfig.getString("bingAppID")
    }
    var _newsBrowseService = null;
    var _cmsService = null;
    function reload() {
        _newsBrowseService = null;
        _cmsService = null
    }
    WinJS.Namespace.define("NewsJS.Data.Bing", {
        insertEscapedValue: insertEscapedValue, reload: reload, getBingAppID: getBingAppID, _cmsService: _cmsService, _newsBrowseService: _newsBrowseService, LOCAL_OFFLINE_DATA_FILE: LOCAL_OFFLINE_DATA_FILE, LOCAL_FRE_OFFLINE_DATA_FILE: LOCAL_FRE_OFFLINE_DATA_FILE, LOCAL_FRE_OFFLINE_CLUSTERSDEFINITION_FILE: LOCAL_FRE_OFFLINE_CLUSTERSDEFINITION_FILE
    })
})();
(function () {
    "use strict";
    function newsBrowseServiceAndParams(count, domain, currentVersionConfig, formCode) {
        if (!NewsJS.Data.Bing._newsBrowseService) {
            if (!currentVersionConfig) {
                var bdiConfig = PlatformJS.Services.appConfig.getDictionary("BDIConfig");
                var bdiVersions = bdiConfig.getDictionary("Versions");
                var currentVersion = bdiConfig.getString("CurrentVersion");
                currentVersionConfig = bdiVersions.getDictionary(currentVersion)
            }
            NewsJS.Data.Bing._newsBrowseService = new PlatformJS.DataService.QueryService(currentVersionConfig.getString("NewsDataSourceID"))
        }
        var queryService = NewsJS.Data.Bing._newsBrowseService;
        var urlParams = PlatformJS.Collections.createStringDictionary();
        NewsJS.Data.Bing.insertEscapedValue(urlParams, "appid", NewsJS.Data.Bing.getBingAppID());
        NewsJS.Data.Bing.insertEscapedValue(urlParams, "count", count);
        NewsJS.Data.Bing.insertEscapedValue(urlParams, "domain", NewsJS.Utilities.appServerDomain());
        NewsJS.Data.Bing.insertEscapedValue(urlParams, "form", formCode);
        var market = null;
        if (typeof domain === "string") {
            NewsJS.Data.Bing.insertEscapedValue(urlParams, "query", "site:" + domain);
            market = NewsJS.Globalization.getMarketStringForAlgoSource()
        }
        else {
            NewsJS.Data.Bing.insertEscapedValue(urlParams, "query", "");
            market = NewsJS.Globalization.getMarketStringForAlgoBrowse()
        }
        NewsJS.Data.Bing.insertEscapedValue(urlParams, "market", market);
        return {
            service: queryService, params: urlParams
        }
    }
    function getNewsBrowse(count, domain, bypassCache, provider, formCode) {
        msWriteProfilerMark("NewsApp:getNewsBrowse:s");
        var bdiConfig = PlatformJS.Services.appConfig.getDictionary("BDIConfig");
        var bdiVersions = bdiConfig.getDictionary("Versions");
        var currentVersion = bdiConfig.getString("CurrentVersion");
        var currentVersionConfig = bdiVersions.getDictionary(currentVersion);
        var serviceAndParams = NewsJS.Data.Bing.newsBrowseServiceAndParams(count, domain, currentVersionConfig, formCode);
        var queryService = serviceAndParams.service;
        var urlParams = serviceAndParams.params;
        var transformer = new News.NewsTransformerWrapper(currentVersion, bdiConfig.getBool("EnableFavIcons"));
        var processResponse = function (response) {
            var data = {};
            data.originalResponse = response;
            data.offlineData = null;
            if (response.isLocalResponse) {
                var offlineData = JSON.parse(response.dataString);
                data.offlineData = offlineData
            }
            return data
        };
        var options = new Platform.DataServices.QueryServiceOptions;
        options.bypassCache = bypassCache;
        options.useCompatDataModel = true;
        options.honorServerExpiryTime = false;
        options.localDataFile = NewsJS.Data.Bing.LOCAL_OFFLINE_DATA_FILE;
        if (provider) {
            provider.layoutCacheInfo = {
                cacheKey: queryService.getUrl(urlParams), cacheID: queryService.getCacheID()
            }
        }
        return new WinJS.Promise(function (complete, error, progress) {
            queryService.downloadDataAsync(urlParams, null, transformer, options).then(function (data) {
                if (provider && provider.layoutCacheInfo && data) {
                    provider.layoutCacheInfo.uniqueResponseID = data.responseId
                }
                if (!data.isLocalResponse) {
                    msWriteProfilerMark("NewsApp:getNewsBrowse:e");
                    complete({
                        data: data, hash: queryService.entryHash(urlParams, null), url: queryService.getUrl(urlParams), transformer: transformer
                    })
                }
                else {
                    msWriteProfilerMark("NewsApp:getNewsBrowse:e");
                    complete(null)
                }
            }, function (e) {
                msWriteProfilerMark("NewsApp:getNewsBrowse:e");
                if (PlatformJS.Utilities.isPromiseCanceled(e)) {
                    return
                }
                error(e)
            }, function (e) {
                if (e.statusCode === Platform.DataServices.QueryServiceStatusCode.cachedEntryFound) {
                    var data = null;
                    if (e.cachedResponse) {
                        data = processResponse(e.cachedResponse)
                    }
                    progress(data)
                }
                else if (e.statusCode === Platform.DataServices.QueryServiceStatusCode.cachedEntryNotFound) {
                    progress(null)
                }
            })
        })
    }
    function getNewsBrowseForCategory(category, offset, count, domain, sortByDate, bypassCache, market, provider, formCode) {
        msWriteProfilerMark("NewsApp:getNewsBrowseForCategory:s");
        var bdiConfig = PlatformJS.Services.appConfig.getDictionary("BDIConfig");
        var bdiVersions = bdiConfig.getDictionary("Versions");
        var currentVersion = bdiConfig.getString("CurrentVersion");
        var currentVersionConfig = bdiVersions.getDictionary(currentVersion);
        var queryService = new PlatformJS.DataService.QueryService(currentVersionConfig.getString("NewsBrowseCategoryDataSourceID"));
        var transformer = new News.NewsTransformerWrapper(currentVersion, bdiConfig.getBool("EnableFavIcons"));
        var urlParams = PlatformJS.Collections.createStringDictionary();
        NewsJS.Data.Bing.insertEscapedValue(urlParams, "appid", NewsJS.Data.Bing.getBingAppID());
        NewsJS.Data.Bing.insertEscapedValue(urlParams, "category", category);
        NewsJS.Data.Bing.insertEscapedValue(urlParams, "offset", offset);
        NewsJS.Data.Bing.insertEscapedValue(urlParams, "count", count);
        NewsJS.Data.Bing.insertEscapedValue(urlParams, "sortbydate", sortByDate ? "1" : "0");
        NewsJS.Data.Bing.insertEscapedValue(urlParams, "domain", NewsJS.Utilities.appServerDomain());
        NewsJS.Data.Bing.insertEscapedValue(urlParams, "form", formCode);
        if (typeof domain === "string") {
            NewsJS.Data.Bing.insertEscapedValue(urlParams, "query", "site:" + domain);
            if (!market) {
                market = NewsJS.Globalization.getMarketStringForAlgoSource()
            }
        }
        else {
            NewsJS.Data.Bing.insertEscapedValue(urlParams, "query", "");
            if (!market) {
                market = NewsJS.Globalization.getMarketStringForAlgoBrowse()
            }
        }
        NewsJS.Data.Bing.insertEscapedValue(urlParams, "market", market);
        var options = new Platform.DataServices.QueryServiceOptions;
        options.bypassCache = bypassCache;
        options.honorServerExpiryTime = false;
        options.useCompatDataModel = true;
        if (provider) {
            provider.layoutCacheInfo = {
                cacheKey: queryService.getUrl(urlParams), cacheID: queryService.getCacheID()
            }
        }
        return new WinJS.Promise(function (complete, error, progress) {
            return queryService.downloadDataAsync(urlParams, null, transformer, options).then(function (e) {
                msWriteProfilerMark("NewsApp:getNewsBrowseForCategory:e");
                if (provider && provider.layoutCacheInfo && e) {
                    provider.layoutCacheInfo.uniqueResponseID = e.responseId
                }
                complete({
                    url: queryService.getUrl(urlParams), transformer: transformer, data: e
                })
            }, function (e) {
                msWriteProfilerMark("NewsApp:getNewsBrowseForCategory:e");
                if (PlatformJS.Utilities.isPromiseCanceled(e)) {
                    return
                }
                complete(null)
            }, function (e) {
                if (e.statusCode === Platform.DataServices.QueryServiceStatusCode.cachedEntryFound) {
                    progress(e.cachedResponse)
                }
            })
        })
    }
    WinJS.Namespace.define("NewsJS.Data.Bing", {
        newsBrowseServiceAndParams: newsBrowseServiceAndParams, getNewsBrowse: getNewsBrowse, getNewsBrowseForCategory: getNewsBrowseForCategory
    })
})();
(function () {
    "use strict";
    function getNewsSearch(query, offset, count, sortByDate, bypassCache, provider, formCode) {
        msWriteProfilerMark("NewsApp:getNewsSearch:s");
        var bdiConfig = PlatformJS.Services.appConfig.getDictionary("BDIConfig");
        var bdiVersions = bdiConfig.getDictionary("Versions");
        var currentVersion = bdiConfig.getString("CurrentVersion");
        var currentVersionConfig = bdiVersions.getDictionary(currentVersion);
        var queryService = new PlatformJS.DataService.QueryService(currentVersionConfig.getString("NewsSearchDataSourceID"));
        var transformer = new News.NewsTransformerWrapper(currentVersion, bdiConfig.getBool("EnableFavIcons"));
        var urlParams = PlatformJS.Collections.createStringDictionary();
        NewsJS.Data.Bing.insertEscapedValue(urlParams, "appid", NewsJS.Data.Bing.getBingAppID());
        NewsJS.Data.Bing.insertEscapedValue(urlParams, "query", query);
        NewsJS.Data.Bing.insertEscapedValue(urlParams, "offset", offset);
        NewsJS.Data.Bing.insertEscapedValue(urlParams, "count", count);
        NewsJS.Data.Bing.insertEscapedValue(urlParams, "sortbydate", sortByDate ? "1" : "0");
        NewsJS.Data.Bing.insertEscapedValue(urlParams, "market", NewsJS.Globalization.getMarketStringForAlgoSearch());
        NewsJS.Data.Bing.insertEscapedValue(urlParams, "domain", NewsJS.Utilities.appServerDomain());
        NewsJS.Data.Bing.insertEscapedValue(urlParams, "et", offset === 0 ? "1" : "0");
        NewsJS.Data.Bing.insertEscapedValue(urlParams, "form", formCode);
        var options = new Platform.DataServices.QueryServiceOptions;
        options.bypassCache = bypassCache;
        options.honorServerExpiryTime = false;
        options.useCompatDataModel = true;
        if (provider) {
            provider.layoutCacheInfo = {
                cacheKey: queryService.getUrl(urlParams), cacheID: queryService.getCacheID()
            }
        }
        return new WinJS.Promise(function (complete, error, progress) {
            queryService.downloadDataAsync(urlParams, null, transformer, options).then(function (e) {
                msWriteProfilerMark("NewsApp:getNewsSearch:e");
                if (provider && provider.layoutCacheInfo && e) {
                    provider.layoutCacheInfo.uniqueResponseID = e.responseId
                }
                complete({
                    url: queryService.getUrl(urlParams), transformer: transformer, data: e, fromCache: e.isCachedResponse
                })
            }, function (e) {
                msWriteProfilerMark("NewsApp:getNewsSearch:e");
                if (PlatformJS.Utilities.isPromiseCanceled(e)) {
                    return
                }
                else {
                    error(e)
                }
            }, function (e) {
                if (e.statusCode === Platform.DataServices.QueryServiceStatusCode.cachedEntryFound) {
                    progress({
                        url: queryService.getUrl(urlParams), transformer: transformer, data: e.cachedResponse, fromCache: true
                    })
                }
            })
        })
    }
    function getQuerySuggestions(query, locale) {
        msWriteProfilerMark("NewsApp:getQuerySuggestions:s");
        var queryService = new PlatformJS.DataService.QueryService("QuerySuggestions");
        var transformer = new News.SuggestionsTransformer;
        var urlParams = PlatformJS.Collections.createStringDictionary();
        NewsJS.Data.Bing.insertEscapedValue(urlParams, "query", query);
        NewsJS.Data.Bing.insertEscapedValue(urlParams, "locale", locale);
        var options = new Platform.DataServices.QueryServiceOptions;
        options.failWithException = false;
        options.useCompatDataModel = true;
        options.retryCount = 0;
        return new WinJS.Promise(function (complete, error, progress) {
            queryService.downloadDataAsync(urlParams, null, transformer, options).then(function (e) {
                msWriteProfilerMark("NewsApp:getQuerySuggestions:e");
                complete(e)
            }, function (e) {
                msWriteProfilerMark("NewsApp:getQuerySuggestions:e");
                if (PlatformJS.Utilities.isPromiseCanceled(e)) {
                    return
                }
                error(e)
            }, function (e) {
                if (e.statusCode === Platform.DataServices.QueryServiceStatusCode.cachedEntryFound) {
                    progress(e.cachedResponse)
                }
            })
        })
    }
    WinJS.Namespace.define("NewsJS.Data.Bing", {
        getNewsSearch: getNewsSearch, getQuerySuggestions: getQuerySuggestions
    })
})();
(function () {
    "use strict";
    function cmsTodayServiceAndParams(market) {
        if (!NewsJS.Data.Bing._cmsService) {
            NewsJS.Data.Bing._cmsService = new PlatformJS.DataService.QueryService("MarketCMSTodayFeed3")
        }
        var cmsHeroService = NewsJS.Data.Bing._cmsService;
        var urlParams = PlatformJS.Collections.createStringDictionary();
        if (PlatformJS.isDebug && NewsJS.StateHandler.instance.isPreviewModeEnabled) {
            urlParams["previewparams"] = "/" + PlatformJS.Services.appConfig.getString("CMSPreviewParam")
        }
        else {
            urlParams["previewparams"] = ""
        }
        var marketParams = market || NewsJS.Globalization.getMarketStringForEditorial();
        if (marketParams) {
            urlParams["market"] = marketParams
        }
        return {
            service: cmsHeroService, params: urlParams
        }
    }
    function processResponse(response) {
        var cmsData = null;
        if (response) {
            var editorial;
            try {
                editorial = JSON.parse(response.dataString);
                if (response.isLocalResponse) {
                    cmsData = {};
                    cmsData.offlineData = editorial;
                    cmsData.originalResponse = response
                }
                else if (editorial) {
                    cmsData = {};
                    if (editorial.lastModified && editorial.lastModified.utctime) {
                        cmsData.lastModified = editorial.lastModified.utctime
                    }
                    cmsData.lastFetchedTime = response.lastUpdateTime ? response.lastUpdateTime.getTime() : null;
                    cmsData.version = editorial.version;
                    var clusterKeyIndex = 0;
                    for (var i = 0; i < editorial.clusters.length; i++) {
                        var cluster = editorial.clusters[i];
                        var isHeroCluster = cluster.entityList && cluster.entityList.collectionId && cluster.entityList.collectionId.toLowerCase() === "hero" && cluster.entityList.entities && cluster.entityList.entities.length > 0;
                        var isChinaHeroCluster = cluster.entityList && cluster.entityList.entities && cluster.entityList.entities.length > 0 && cluster.entityList.entities[0].entityType && cluster.entityList.entities[0].entityType.toLowerCase() === "hero";
                        if (isHeroCluster || isChinaHeroCluster) {
                            cmsData.hero = {
                                hero: cluster.entityList.entities[0], type: "Hero", lastModified: cluster.lastModified
                            }
                        }
                        else if (cluster.type === "EntityList") {
                            if (!cmsData.categories) {
                                cmsData.categories = {}
                            }
                            if (cluster.entityList) {
                                var categoryKey = cluster.entityList.collectionId && (typeof cluster.entityList.collectionId === "string") ? cluster.entityList.collectionId : null;
                                if (!categoryKey) {
                                    categoryKey = "customCluster" + clusterKeyIndex;
                                    clusterKeyIndex++
                                }
                                var categoryData = {};
                                categoryData.entities = cluster.entityList.entities;
                                categoryData.template = cluster.entityList.template;
                                if (cluster.lastModified && cluster.lastModified.utctime) {
                                    categoryData.lastModified = cluster.lastModified.utctime
                                }
                                cmsData.categories[categoryKey] = categoryData
                            }
                        }
                    }
                    cmsData.originalResponse = response
                }
            }
            catch (ex) {
                return null
            }
        }
        return cmsData
    }
    ;
    function getCMSTodayFeed(bypassCache, market, provider) {
        msWriteProfilerMark("NewsApp:getCMSTodayFeed" + ":s");
        var serviceAndParams = cmsTodayServiceAndParams(market);
        var cmsHeroService = serviceAndParams.service;
        var urlParams = serviceAndParams.params;
        if (!serviceAndParams.params["market"]) {
            return WinJS.Promise.wrap({
                data: null, hash: cmsHeroService.entryHash(urlParams, null)
            })
        }
        var options = new Platform.DataServices.QueryServiceOptions;
        options.bypassCache = bypassCache;
        options.useCompatDataModel = true;
        options.localDataFile = NewsJS.Data.Bing.LOCAL_OFFLINE_DATA_FILE;
        if (provider) {
            provider.layoutCacheInfo = {
                cacheKey: cmsHeroService.getUrl(urlParams), cacheID: cmsHeroService.getCacheID()
            }
        }
        return new WinJS.Promise(function (complete, error, progress) {
            cmsHeroService.downloadDataAsync(urlParams, null, null, options).then(function (e) {
                if (provider && provider.layoutCacheInfo && e) {
                    provider.layoutCacheInfo.uniqueResponseID = e.responseId
                }
                if (!e.isLocalResponse) {
                    var cmsData = processResponse(e);
                    if (!cmsData) {
                        cmsHeroService.deleteCacheEntryAsync(urlParams, null)
                    }
                    msWriteProfilerMark("NewsApp:getCMSTodayFeed" + ":e");
                    complete({
                        data: cmsData, hash: cmsHeroService.entryHash(urlParams, null)
                    })
                }
                else {
                    msWriteProfilerMark("NewsApp:getCMSTodayFeed:e");
                    complete(null)
                }
            }, function (e) {
                msWriteProfilerMark("NewsApp:getCMSTodayFeed" + ":e");
                if (PlatformJS.Utilities.isPromiseCanceled(e)) {
                    return
                }
                error(e)
            }, function (e) {
                if (e.statusCode === Platform.DataServices.QueryServiceStatusCode.cachedEntryFound) {
                    var cmsData = null;
                    if (e.cachedResponse) {
                        cmsData = processResponse(e.cachedResponse)
                    }
                    progress(cmsData)
                }
                else if (e.statusCode === Platform.DataServices.QueryServiceStatusCode.cachedEntryNotFound) {
                    progress(null)
                }
            })
        })
    }
    WinJS.Namespace.define("NewsJS.Data.Bing", {
        getCMSTodayFeed: getCMSTodayFeed, cmsTodayServiceAndParams: cmsTodayServiceAndParams
    })
})()