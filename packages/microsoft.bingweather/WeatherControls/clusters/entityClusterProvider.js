/*  © Microsoft. All rights reserved. */
(function weatherEntityCluserProviderInit() {
"use strict";
var EC=WinJS.Namespace.define("WeatherAppJS.EntityCluster", {
EntityClusterProviderBase: WinJS.Class.define(function(options){}, {
_queryServiceIdentifier: {get: function get() {
throw'_queryServiceIdentifier is missing';
}}, _collectionId: {get: function get() {
throw'_collectionId is missing';
}}, _clusterId: {get: function get() {
throw'_clusterId is missing';
}}, _parseResponse: function _parseResponse(response) {
var that=this;
var data=null;
var jsonResponse;
try {
jsonResponse = JSON.parse(response.dataString)
}
catch(e) {}
;
if (jsonResponse && jsonResponse.clusters) {
var numClusters=jsonResponse.clusters.length;
for (var i=0; i < numClusters; i++) {
var cluster=jsonResponse.clusters[i];
if (cluster && cluster.entityList && cluster.entityList.collectionId === that._collectionId) {
var entities=cluster.entityList.entities;
var entityLength=entities ? entities.length : 0;
var results=[];
var clusterArticles={articleInfos: []};
for (var j=0; j < entityLength; ++j) {
var entity=entities[j];
var article=CommonJS.Utils.convertCMSArticle(entity, EC.parseCMSUriString);
if (article.type === "article") {
var articleId=article.contentid ? article.articleid + '/' + article.contentid : article.articleid;
clusterArticles.articleInfos.push({articleId: articleId})
}
article.clusterArticles = clusterArticles;
results.push(article)
}
data = {
native: true, newsItems: results, cacheID: that._cacheId, dataCacheID: that._dataCacheId, clusterID: that._clusterId, uniqueResponseID: response.responseId, isCachedResponse: response.isCachedResponse, serverResponseNotModified: response.serverResponseNotModified, isLocalResonse: response.isLocalResonse
};
return data
}
}
}
return data
}, initializeAsync: function initializeAsync(providerConfiguration) {
return WinJS.Promise.wrap(true)
}, queryAsync: function queryAsync(query) {
var that=this;
var queryService=new Platform.QueryService(this._queryServiceIdentifier);
var queryParams=PlatformJS.Collections.createStringDictionary();
var options=new Platform.DataServices.QueryServiceOptions;
options.useCompatDataModel = true;
if (!that._cacheId || !that._dataCacheId) {
that._dataCacheId = queryService.getUrl(queryParams);
that._cacheId = queryService.getCacheID()
}
var dataDownloadPromise=queryService.downloadDataAsync(queryParams, null, null, options);
return new WinJS.Promise(function init(complete, error, progress) {
dataDownloadPromise.then(function entityCluster_downloadDataAsyncComplete(response) {
var data=null;
if (response) {
data = that._parseResponse(response)
}
complete(data)
}, function entityCluster_downloadDataAsyncError(e) {
if (PlatformJS.Utilities.isPromiseCanceled(e)) {
return WinJS.Promise.wrapError(e)
}
error(e)
}, function entityCluster_downloadDataAsyncProgress(response){})
}, function onCancel() {
WeatherAppJS.Controls.Utilities.cancelPromise(dataDownloadPromise)
})
}
}), itemClickHandler: function itemClickHandler(event) {
var that=this;
if (!event || !event.item) {
return
}
if (event.item.type === "article") {
var articleId=(event.item.articleid && event.item.articleid.length > 0) ? event.item.articleid : null;
var contentId=(event.item.contentid && event.item.contentid.length > 0) ? event.item.contentid : null;
var market=Platform.Globalization.Marketization.getMarketLocation().toLowerCase();
var clusterArticles=event.item.clusterArticles;
if (articleId) {
var state={};
var providerType="AppEx.Common.ArticleReader.BedrockArticleProvider";
var providerConfiguration=PlatformJS.Collections.createStringDictionary();
var eventAttr={headline: event.item.headline.replace(/<\/?p>/g, "")};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "News Cluster", "Article", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr));
if (contentId) {
articleId = articleId + '/' + contentId
}
providerConfiguration.insert("queryServiceId", "RenderProxy_BedrockArticles");
providerConfiguration.insert("fallbackQueryServiceId", "BedrockArticles");
providerConfiguration.insert("articleId", articleId);
providerConfiguration.insert("market", market);
if (clusterArticles) {
try {
var articlesInfos=JSON.stringify(clusterArticles);
providerConfiguration.insert("articleInfos", articlesInfos)
}
catch(e) {
return
}
;
}
state.providerType = providerType;
state.providerConfiguration = providerConfiguration;
state.initialArticleId = articleId;
state.market = market;
state.enableSharing = true;
if (state) {
PlatformJS.Navigation.navigateToChannel("ArticleReader", state)
}
}
}
}, parseCMSUriString: function parseCMSUriString(uriString) {
var defaultProtocol="bingnews";
var parsedUri=null;
if (uriString) {
if (0 >= uriString.indexOf(":") && defaultProtocol) {
uriString = defaultProtocol + ":" + uriString
}
try {
var parseResult=Platform.Utilities.AppExUri.tryCreate(uriString);
if (parseResult.value) {
parsedUri = parseResult.appExUri
}
}
catch(ex) {
;
}
}
var result={};
if (parsedUri && parsedUri.controllerId === "application" && parsedUri.commandId === "view") {
result.entitytype = parsedUri.queryParameters["entitytype"];
result.pageId = parsedUri.queryParameters["pageId"];
result.contentId = parsedUri.queryParameters["contentId"]
}
else {
result = null
}
return result
}
});
WinJS.Namespace.define("WeatherAppJS.EntityCluster", {NewsClusterProvider: WinJS.Class.derive(EC.EntityClusterProviderBase, function NewsClusterProvider_ctor(options) {
options = options || {};
EC.EntityClusterProviderBase.call(this, options);
if (options.clusterKey) {
this._clusterId = options.clusterKey
}
PlatformJS.Utilities.addAppexUriScheme("bingnews")
}, {
_queryServiceIdentifier: "ChinaCMSDataSource", _collectionId: "CMA_WeatherNews", _clusterId: "ChinaNews", _cacheId: null, _dataCacheId: null
})});
WinJS.Namespace.define("WeatherAppJS.EntityCluster", {VideoClusterProvider: WinJS.Class.derive(EC.EntityClusterProviderBase, function NewsClusterProvider_ctor(options) {
options = options || {};
EC.EntityClusterProviderBase.call(this, options);
if (options.clusterKey) {
this._clusterId = options.clusterKey
}
PlatformJS.Utilities.addAppexUriScheme("bingnews")
}, {
_queryServiceIdentifier: "ChinaCMSDataSource", _collectionId: "CMAWeatherVideos", _clusterId: "ChinaVideo", _cacheId: null, _dataCacheId: null
})})
})()