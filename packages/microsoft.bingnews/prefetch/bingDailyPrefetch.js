/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
var _articleLimitPerCategory=20;
WinJS.Namespace.define("NewsApp.Prefetch", {BingDailyPrefetch: WinJS.Class.define(function(options) {
this._clusterDefinitions = options.clusterDefinitions;
this._market = options.market;
this._guid = options.guid;
this._clusterDownloadFailure = false;
this._allowedPrefetchClusterTypes = ['NewsApp.Controls.CategoryControl', 'NewsApp.Controls.HeroControl', 'NewsApp.Controls.UserSection.TopicControl', 'NewsApp.Controls.UserSection.InternationalEditionControl', 'NewsApp.Controls.UserSection.SourceControl']
}, {
guid: {get: function get() {
return this._guid
}}, delay: {get: function get() {
return 10000
}}, panoramaId: {get: function get() {
return "news_Panorama"
}}, market: {get: function get() {
return this._market
}}, _createPrefetchItemFromConfig: function _createPrefetchItemFromConfig(prefetchConfig) {
var prefetchItem=null;
if (prefetchConfig) {
prefetchItem = new News.Utilities.PrefetchItem;
prefetchItem.articleId = prefetchConfig.articleIdPath;
prefetchItem.priority = prefetchConfig.priority;
prefetchItem.providerString = prefetchConfig.providerType;
prefetchItem.providerConfiguration = prefetchConfig.providerConfiguration;
prefetchItem.token = prefetchConfig.token
}
return prefetchItem
}, _canPrefetchCluster: function _canPrefetchCluster(clusterDefinition, currentReleaseNumber) {
if (!clusterDefinition || !clusterDefinition.clusterType) {
return false
}
if (NewsApp.PersonalizationManager.isUnknownCluster(clusterDefinition, currentReleaseNumber)) {
return false
}
return NewsJS.Utilities.ParamChecks.checkValueExists(clusterDefinition.clusterType, this._allowedPrefetchClusterTypes)
}, request: function request() {
var promises=[];
var that=this;
if (!NewsJS.Utilities.ParamChecks.isNullOrEmpty(that._clusterDefinitions)) {
for (var i=0; i < that._clusterDefinitions.length; i++) {
var clusterDefinition=that._clusterDefinitions[i],
config=clusterDefinition.providerConfiguration,
currentReleaseNumber=PlatformJS.Services.appConfig.getDictionary("Release").getInt32("ReleaseNumber");
if (this._canPrefetchCluster(clusterDefinition, currentReleaseNumber)) {
if (config && config.providerType) {
var provider=PlatformJS.Utilities.createObject(config.providerType, config);
if (provider) {
promises.push(new WinJS.Promise(function(complete, error) {
var market=null;
if (clusterDefinition.providerConfiguration.market) {
market = clusterDefinition.providerConfiguration.market.toLowerCase()
}
provider.request().then(function(results) {
complete({
results: results, market: market
})
}, function(error) {
that._clusterDownloadFailure = true;
complete(null)
})
}))
}
}
if (!NewsJS.Utilities.ParamChecks.areStringsEqualCaseInsensitive(clusterDefinition.providerConfiguration.market, NewsJS.Globalization.getMarketStringForEditorial()) && NewsJS.Utilities.ParamChecks.areStringsEqualCaseInsensitive(clusterDefinition.providerConfiguration.providerType, "NewsApp.DataProviders.CMS.InternationalProvider")) {
promises.push(NewsApp.PersonalizationManager.getDefaultClusters(clusterDefinition.providerConfiguration.market))
}
}
}
}
return WinJS.Promise.join(promises).then(function(responses) {
var fullNewsItemsList=[];
var plainImages=0;
var fullArticles=0;
var seenTypes=[];
if (!NewsJS.Utilities.ParamChecks.isNullOrEmpty(responses)) {
var hasInternetConnection=NewsJS.Utilities.CachedNetworkChecks.hasInternetConnection();
for (i = 0; i < responses.length; i++) {
if (!responses[i]) {
continue
}
var response=responses[i].results;
if (response && response.newsItems) {
var articlePrefetchCount=_articleLimitPerCategory <= response.newsItems.length ? _articleLimitPerCategory : response.newsItems.length;
for (var j=0, jlen=articlePrefetchCount; j < jlen; j++) {
var newsItem=response.newsItems[j];
if (newsItem) {
console.log(newsItem.type);
if (!seenTypes[newsItem.type]) {
seenTypes[newsItem.type] = 0
}
seenTypes[newsItem.type]++;
var clusterPrefetchConfig=NewsJS.Utilities.getClusterPrefetchConfigs(newsItem, that._guid);
if (!NewsJS.Utilities.ParamChecks.isNullOrEmpty(clusterPrefetchConfig)) {
for (var k=0; k < clusterPrefetchConfig.length; k++) {
var item=that._createPrefetchItemFromConfig(clusterPrefetchConfig[k]);
fullNewsItemsList.push(item);
plainImages++;
console.log(item.toString())
}
}
var prefetchConfig;
if (NewsJS.Utilities.ParamChecks.areStringsEqualCaseInsensitive(newsItem.type, "article")) {
prefetchConfig = that._getPrefetchConfigForItem(newsItem, that._guid, responses[i].market, hasInternetConnection)
}
else if (!NewsJS.Utilities.ParamChecks.isNullOrEmpty(newsItem.heroItems)) {
prefetchConfig = that._getPrefetchConfigForItem(newsItem.heroItems[0], that._guid, responses[i].market, hasInternetConnection)
}
if (prefetchConfig) {
var prefetchItem=that._createPrefetchItemFromConfig(prefetchConfig);
fullNewsItemsList.push(prefetchItem);
fullArticles++;
console.log(prefetchItem.toString())
}
}
}
}
}
}
var metadata={
prefetchList: fullNewsItemsList, plainImages: plainImages, fullArticles: fullArticles, seenTypes: seenTypes, clusterDownloadFailure: that._clusterDownloadFailure
};
return metadata
}, function(e) {
return []
})
}, _getPrefetchConfigForItem: function _getPrefetchConfigForItem(item, guid, clusterMarket, hasInternetConnection) {
var priority=Platform.DataServices.QueryServicePriority.high;
clusterMarket = clusterMarket || NewsJS.Globalization.getMarketStringForEditorial();
return NewsJS.Utilities.getPrefetchConfig(item, priority, guid, clusterMarket, hasInternetConnection)
}, shouldShowDownloadProgressBar: function shouldShowDownloadProgressBar() {
var channelIdInView=WinJS.Navigation.history.current.location.channelId;
return channelIdInView && channelIdInView.toLowerCase() === "home"
}
})})
})()