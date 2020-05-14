/*  © Microsoft. All rights reserved. */
WinJS.Namespace.define('CommonJS', {Version: 'latest'});
(function _dynamicPanoDataProvider_1() {
"use strict";
WinJS.Namespace.define("DynamicPanoJS", {DynamicPanoProvider: WinJS.Class.define(function _dynamicPanoDataProvider_6(options) {
WinJS.UI.setOptions(this, options)
}, {
_versionChanged: false, _cmsProgressComplete: false, cmsData: null, cmsHash: null, cmsCss: null, layoutCacheInfo: null, algoHash: null, isNewData: false, fetchPromise: null, disableAlgoFetch: false, dataSourceName: null, feedName: null, cssFeedUrl: null, dataProviderOptions: null, channelId: null, callReceiverProgress: function callReceiverProgress() {
if (this._cmsProgressComplete) {
if (this.receiverProgressCallback) {
this.receiverProgressCallback({offlineData: this.offlineData})
}
}
}, callReceiverComplete: function callReceiverComplete() {
var str=null;
if (this.cmsData) {
this.cmsData.originalResponse = null;
if (this.cmsData.hero && this.cmsData.hero.content) {
this.cmsData.hero = this.convertCMSArticle(this.cmsData.hero, this.dataProviderOptions)
}
else {
this.cmsData.hero = null
}
for (var category in this.cmsData.categories) {
var categoryData=this.cmsData.categories[category];
if (categoryData && categoryData.entities) {
var newEntities=[];
var count=categoryData.entities.length;
var isVideoCluster=true;
for (var i=0; i < count; i++) {
var entity=categoryData.entities[i];
if (entity && entity.content) {
var newEntry=this.convertCMSArticle(entity, this.dataProviderOptions);
newEntities.push(newEntry);
var templateClass=newEntry.templateClass;
if (templateClass !== "V1" && templateClass !== "V2" && templateClass !== "S2") {
isVideoCluster = false
}
}
}
categoryData.entities = newEntities;
categoryData.isVideoCluster = isVideoCluster
}
}
str = {
version: DynamicPanoJS.DynamicPanoProvider._version, cmsData: this.cmsData, cmsHash: this.cmsHash, cmsCss: this.cmsCss, layoutCacheInfo: this.layoutCacheInfo
}
}
if (this.receiverCompleteCallback) {
this.receiverCompleteCallback({
isNewData: this.isNewData, offlineData: this.offlineData, cmsData: this.cmsData, cmsCss: this.cmsCss
})
}
if (str) {
var cacheInMemory=true;
if (this.dataProviderOptions && typeof this.dataProviderOptions.cacheInMemory === "boolean") {
cacheInMemory = this.dataProviderOptions.cacheInMemory
}
try {
PlatformJS.Cache.CacheService.getInstance("CustomPanoCache").addEntry(this.channelId + "_" + this.feedName, str, {supportsInMemory: cacheInMemory})
}
catch(ex) {
if (PlatformJS.isDebug) {
debugger;
throw ex;
}
}
}
}, fetchCacheData: function fetchCacheData() {
var that=this;
var cacheInMemory=true;
if (this.dataProviderOptions && typeof this.dataProviderOptions.cacheInMemory === "boolean") {
cacheInMemory = this.dataProviderOptions.cacheInMemory
}
return PlatformJS.Cache.CacheService.getInstance("CustomPanoCache").findEntry(this.channelId + "_" + this.feedName, {supportsInMemory: cacheInMemory}).then(function findEntry_Complete(complete) {
if (complete) {
if (complete.dataValue && complete.dataValue.cmsData && complete.dataValue.layoutCacheInfo) {
that.layoutCacheInfo = complete.dataValue.layoutCacheInfo
}
return complete.dataValue
}
return null
})
}, getDynamicCssFeed: function getDynamicCssFeed(bypassCache, url) {
msWriteProfilerMark("NewsApp:getDynamicCssFeed" + ":s");
var dataSource="CustomPanoCssFeed";
var cssService=new PlatformJS.DataService.QueryService(dataSource);
var urlParams=PlatformJS.Collections.createStringDictionary();
if (url) {
urlParams["url"] = url
}
var options=new Platform.DataServices.QueryServiceOptions;
options.bypassCache = bypassCache;
options.useCompatDataModel = true;
return new WinJS.Promise(function _dynamicPanoDataProvider_142(complete, error, progress) {
cssService.downloadDataAsync(urlParams, null, null, options).then(function _dynamicPanoDataProvider_143(e) {
msWriteProfilerMark("NewsApp:getDynamicCssFeed" + ":e");
complete(e)
}, function _dynamicPanoDataProvider_146(e) {
msWriteProfilerMark("NewsApp:getDynamicCssFeed" + ":e");
if (PlatformJS.Utilities.isPromiseCanceled(e)) {
return
}
error(e)
}, function _dynamicPanoDataProvider_153(e) {
if (e.statusCode === Platform.DataServices.QueryServiceStatusCode.cachedEntryFound) {
progress(e)
}
else if (e.statusCode === Platform.DataServices.QueryServiceStatusCode.cachedEntryNotFound) {
progress(null)
}
})
})
}, dynamicServiceAndParams: function dynamicServiceAndParams(dataSourceName, feedName, feedMarket) {
var dataSource=dataSourceName || "CustomPanoFeed";
var cmsHeroService=new PlatformJS.DataService.QueryService(dataSource);
var urlParams=PlatformJS.Collections.createStringDictionary();
var marketParams=feedMarket || this.market || CommonJS.Globalization.getMarketStringForEditorial();
if (marketParams) {
urlParams["market"] = marketParams.toLowerCase()
}
if (feedName) {
urlParams["feedName"] = feedName
}
if (PlatformJS.isDebug && CommonJS.State && CommonJS.State.isPreviewModeEnabled) {
urlParams["previewparams"] = "/" + PlatformJS.Services.appConfig.getString("CMSPreviewParam")
}
else {
urlParams["previewparams"] = ""
}
return {
service: cmsHeroService, params: urlParams
}
}, getDynamicPanoFeed: function getDynamicPanoFeed(bypassCache, dataSourceName, feedName, feedMarket, provider, isSubPano) {
msWriteProfilerMark("NewsApp:getDynamicPanoFeed" + ":s");
var serviceAndParams=this.dynamicServiceAndParams(dataSourceName, feedName, feedMarket);
var cmsHeroService=serviceAndParams.service;
var urlParams=serviceAndParams.params;
if (!serviceAndParams.params["market"]) {
return WinJS.Promise.wrap({
data: null, hash: null
})
}
var processResponse=function(response) {
var cmsData=null;
if (response) {
var editorial;
try {
editorial = JSON.parse(response.dataString);
if (response.isLocalResponse) {
cmsData = {};
cmsData.offlineData = editorial;
cmsData.originalResponse = response;
cmsData.backgroundImages = editorial.backgroundImages
}
else if (editorial) {
cmsData = {};
if (editorial.lastModified && editorial.lastModified.utctime) {
cmsData.lastModified = editorial.lastModified.utctime
}
cmsData.version = editorial.version;
cmsData.lastFetchedTime = response.lastUpdateTime ? response.lastUpdateTime.getTime() : null;
cmsData.uniqueResponseId = response.responseId;
cmsData.backgroundImages = editorial.backgroundImages;
var clusterKeyIndex=0;
for (var i=0; i < editorial.clusters.length; i++) {
var cluster=editorial.clusters[i];
if (cluster.type === "Hero") {
cmsData.hero = cluster.hero
}
else if (cluster.type === "EntityList") {
if (!cmsData.categories) {
cmsData.categories = {}
}
if (!cmsData.categoryOrder) {
cmsData.categoryOrder = []
}
if (cluster.entityList) {
var categoryKey=cluster.entityList.collectionId;
if (!categoryKey) {
categoryKey = "customCluster" + clusterKeyIndex;
clusterKeyIndex++
}
var categoryData={};
categoryData.entities = cluster.entityList.entities;
categoryData.template = cluster.entityList.template;
categoryData.categoryName = cluster.entityList.categoryName ? cluster.entityList.categoryName : "";
var maxColumnCount=cluster.entityList.maxColumnCount;
if (maxColumnCount && maxColumnCount > 0) {
categoryData.maxColumnCount = maxColumnCount
}
cmsData.categories[categoryKey] = categoryData;
cmsData.categoryOrder.push(categoryKey)
}
}
}
cmsData.originalResponse = response
}
cmsData.authInfo = editorial.authinfo
}
catch(ex) {
return null
}
}
return cmsData
};
var options=new Platform.DataServices.QueryServiceOptions;
options.bypassCache = bypassCache;
options.useCompatDataModel = true;
var LOCAL_OFFLINE_DATA_FILE="cannedData\\offline.json";
options.localDataFile = LOCAL_OFFLINE_DATA_FILE;
if (provider) {
provider.layoutCacheInfo = {
cacheKey: cmsHeroService.getUrl(urlParams), cacheID: cmsHeroService.getCacheID()
}
}
return new WinJS.Promise(function _dynamicPanoDataProvider_284(complete, error, progress) {
cmsHeroService.downloadDataAsync(urlParams, null, null, options).then(function _dynamicPanoDataProvider_285(e) {
if (provider && provider.layoutCacheInfo && e) {
provider.layoutCacheInfo.uniqueResponseID = e.responseId
}
if (!e.isLocalResponse) {
var cmsData=processResponse(e);
if (!cmsData) {
cmsHeroService.deleteCacheEntryAsync(urlParams, null)
}
msWriteProfilerMark("NewsApp:getDynamicPanoFeed" + ":e");
complete({
data: cmsData, hash: cmsHeroService.entryHash(urlParams, null)
})
}
else {
msWriteProfilerMark("NewsApp:getDynamicPanoFeed:e");
complete(null)
}
}, function _dynamicPanoDataProvider_302(e) {
msWriteProfilerMark("NewsApp:getDynamicPanoFeed" + ":e");
if (PlatformJS.Utilities.isPromiseCanceled(e)) {
return
}
error(e)
}, function _dynamicPanoDataProvider_309(e) {
if (e.statusCode === Platform.DataServices.QueryServiceStatusCode.cachedEntryFound) {
var cmsData=null;
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
}, fetchNetworkData: function fetchNetworkData(bypassCache, isSubPano) {
var that=this;
var feeds=[];
if (!this._cmsProgressComplete) {
if (this.cssFeedUrl) {
feeds["css"] = this.getDynamicCssFeed(bypassCache, this.cssFeedUrl).then(function _dynamicPanoDataProvider_332(e) {
that.cmsCss = e.dataString
}, function _dynamicPanoDataProvider_334(err) {
that.cmsCss = null
})
}
feeds["feed"] = this.getDynamicPanoFeed(bypassCache, this.dataSourceName, this.feedName, this.feedMarket, this, isSubPano).then(function _dynamicPanoDataProvider_339(val) {
if (val) {
that.cmsData = val.data;
that.cmsHash = val.hash;
if (val.data && val.data.originalResponse && !val.data.originalResponse.isCachedResponse && !val.data.originalResponse.serverResponseNotModified) {
that.isNewData = true
}
}
}, function _dynamicPanoDataProvider_350(error){}, function _dynamicPanoDataProvider_352(progress) {
that._cmsProgressComplete = true;
if (progress && progress.originalResponse && progress.originalResponse.isLocalResponse) {
that.offlineData = progress.offlineData
}
that.callReceiverProgress()
})
}
var dataPromise=new WinJS.Promise(function _dynamicPanoDataProvider_361(complete, error, progress) {
that.receiverCompleteCallback = complete;
that.receiverErrorCallback = error;
that.receiverProgressCallback = progress;
that.fetchPromise = WinJS.Promise.join(feeds);
that.fetchPromise.then(function _dynamicPanoDataProvider_369(val) {
that.fetchPromise = null;
that.callReceiverComplete()
}, function _dynamicPanoDataProvider_373(err) {
that.fetchPromise = null;
if (that.receiverErrorCallback) {
that.receiverErrorCallback(err)
}
})
});
return dataPromise
}, convertCMSArticle: function convertCMSArticle(result, options) {
return CommonJS.Utils.convertCMSArticle(result, CommonJS.Utils.parseCMSUriString, options)
}
}, {_version: 2})})
})()