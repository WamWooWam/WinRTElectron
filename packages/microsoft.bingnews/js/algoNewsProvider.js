/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
WinJS.Namespace.define("NewsJS", {AlgoNewsProvider: WinJS.Class.define(function(options) {
this._prefixArticle = options.prefixArticle;
this._noResultsTile = options.noResultsTile;
this._title = options.title;
this._query = options.query;
this._queryFunction = options.queryFunction;
this._onsuccess = options.onsuccess;
this._onerror = options.onerror;
this._providerConsumer = options.providerConsumer
}, {
_articles: null, _prefixArticle: null, _noResultsTile: null, title: {get: function get() {
return this._title
}}, query: {get: function get() {
return this._query
}}, articles: {get: function get() {
return this._articles
}}, initializeAsync: function initializeAsync(configuration) {
var that=this;
if (that._articles) {
that._articles = null
}
return WinJS.Promise.wrap({})
}, queryAsync: function queryAsync(q) {
console.log("algoNewsProvider querying: " + this.query);
var that=this;
var results=null;
if (that.articles) {
results = {
native: true, newsItems: that._articles
};
if (that.layoutCacheInfo) {
results.dataCacheID = that.layoutCacheInfo.cacheKey;
results.cacheID = that.layoutCacheInfo.cacheID;
results.uniqueResponseID = that.layoutCacheInfo.uniqueResponseID
}
return WinJS.Promise.wrap(results)
}
CommonJS.Progress.showProgress(CommonJS.Progress.headerProgressType);
function processResponse(response) {
var data=PlatformJS.Utilities.convertManageToJSON(response.data.dataObject);
that._articles = data.newsResults;
var bdiReporter=Platform.Utilities.BdiResultReport;
if (bdiReporter) {
for (var i=0; i < data.newsResults.length; i++) {
data.newsResults[i].bdiRequestUrl = response.url;
data.newsResults[i].transformer = response.transformer
}
}
if (that._noResultsTile && data.newsResults.length === 0) {
that._articles.push(that._noResultsTile)
}
if (that._prefixArticle) {
that._articles.splice(0, 0, that._prefixArticle)
}
results = {
isCachedResponse: response.data.isCachedResponse, serverResponseNotModified: response.data.serverResponseNotModified, native: true, newsItems: that._articles, lastUpdateTime: response.data.lastUpdateTime && response.data.lastUpdateTime.getTime ? response.data.lastUpdateTime.getTime() : null
};
if (that.layoutCacheInfo) {
results.dataCacheID = that.layoutCacheInfo.cacheKey;
results.cacheID = that.layoutCacheInfo.cacheID;
results.uniqueResponseID = that.layoutCacheInfo.uniqueResponseID
}
return results
}
return new WinJS.Promise(function(c, e, p) {
that._queryFunction(that.query, that._providerConsumer ? that._providerConsumer.bypassCache : false).then(function(success) {
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
var data=processResponse(success);
if (that._providerConsumer && that._providerConsumer.telemetry) {
NewsJS.Telemetry.Search.recordSearch(that._query, data.newsItems ? data.newsItems.length : 0, that._providerConsumer.telemetry.searchOrigin, success.data.isCachedResponse)
}
if (that._onsuccess) {
that._onsuccess(data.lastUpdateTime)
}
c(data)
}, function(error) {
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
if (that._onerror) {
that._onerror(error)
}
e(error)
}, function(progress) {
var data=processResponse(progress);
p(data)
})
})
}
})})
})()