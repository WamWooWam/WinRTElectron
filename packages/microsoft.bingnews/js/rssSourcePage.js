/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
WinJS.Namespace.define("NewsJS", {RSSSourcePage: WinJS.Class.derive(NewsJS.SourceBasePage, function(state) {
NewsJS.SourceBasePage.call(this, state);
var that=this;
if (!state) {
state = {}
}
else {
this._panoramaState = state.panoramaState
}
this._state = state;
this._clusters = new WinJS.Binding.List;
var source=this._state.entity;
that.expandUrls(source);
this._onEdgyBeforeShowHandler = this._onEdgyBeforeShow.bind(this);
if (source) {
var edgy=PlatformJS.Utilities.getControl("actionEdgy");
if (edgy) {
edgy.addEventListener("beforeshow", this._onEdgyBeforeShowHandler)
}
this._title = source.displayname
}
this.zoomRenderer = function(itemPromise) {
return {element: itemPromise.then(function(group) {
var div=document.createElement("div");
if (group.data.clusterTitle) {
WinJS.Utilities.addClass(div, "platformSemanticZoomItem");
var binding=NewsJS.Bindings.semanticZoomSourceTile(group.data.clusterTitle);
if (binding) {
CommonJS.setModuleSizeAndClass(binding.moduleInfo, div);
CommonJS.loadModule(binding.moduleInfo, binding, div).then()
}
}
return div
})}
};
WinJS.Utilities.markSupportedForProcessing(this.zoomRenderer);
this.loadPageData()
}, {
_state: null, _title: null, _newsProviders: null, _showingSingleFeed: false, compressUrls: function compressUrls(source) {
var i=0;
if (source && source.feedUrlsArray && source.feedUrlsArray.length > 1) {
var url0=source.feedUrlsArray[0];
var url1=source.feedUrlsArray[1];
if (!source.feedUrlsPrefix) {
source.feedUrlsPrefix = "";
for (i = 0; i < url0.length && i < url1.length; i++) {
if (url0[i] === url1[i]) {
source.feedUrlsPrefix += url0[i]
}
else {
break
}
}
}
if (!source.feedUrlsSuffix) {
source.feedUrlsSuffix = "";
for (i = 0; i < url0.length && i < url1.length; i++) {
if (url0[url0.length - i - 1] === url1[url1.length - i - 1]) {
source.feedUrlsSuffix = url0[url0.length - i - 1] + source.feedUrlsSuffix
}
else {
break
}
}
}
for (i = 0; i < source.feedUrlsArray.length; i++) {
if (source.feedUrlsArray[i].indexOf(source.feedUrlsPrefix) === 0) {
source.feedUrlsArray[i] = source.feedUrlsArray[i].replace(source.feedUrlsPrefix, "@")
}
if (source.feedUrlsArray[i].indexOf(source.feedUrlsSuffix) === source.feedUrlsArray[i].length - source.feedUrlsSuffix.length) {
source.feedUrlsArray[i] = source.feedUrlsArray[i].substring(0, source.feedUrlsArray[i].lastIndexOf(source.feedUrlsSuffix)) + "^"
}
}
}
}, expandUrls: function expandUrls(source) {
if (source.feedUrlsPrefix) {
for (var i=0; i < source.feedUrlsArray.length; i++) {
if (source.feedUrlsArray[i].indexOf("@") === 0) {
source.feedUrlsArray[i] = source.feedUrlsPrefix + source.feedUrlsArray[i].substring(1)
}
}
}
if (source.feedUrlsSuffix) {
for (var j=0; j < source.feedUrlsArray.length; j++) {
if (source.feedUrlsArray[j].indexOf("^") === source.feedUrlsArray[j].length - 1) {
source.feedUrlsArray[j] = source.feedUrlsArray[j].substring(0, source.feedUrlsArray[j].length - 1) + source.feedUrlsSuffix
}
}
}
}, onBindingComplete: function onBindingComplete() {
NewsJS.SourceBasePage.prototype.onBindingComplete.call(this);
var panoControl=PlatformJS.Utilities.getControl("news_Panorama");
if (panoControl) {
panoControl.clusterDataSource = this._clusters.dataSource
}
}, getPageImpressionContext: function getPageImpressionContext() {
return NewsJS.Telemetry.String.ImpressionContext.rssSource
}, getPageState: function getPageState() {
var panoControl=PlatformJS.Utilities.getControl("news_Panorama");
if (panoControl) {
this._state.panoramaState = panoControl.getPanoramaState()
}
return this._state
}, getPageData: function getPageData() {
var that=this;
return WinJS.Promise.wrap({
title: that._title, semanticZoomRenderer: that.zoomRenderer, headerOptions: that.commonHeaderOptions, panoramaState: that._panoramaState
})
}, itemInvoked: function itemInvoked(e, listInfo) {
var that=this;
var item=e.item;
if ((item && item.sentinel) || this.checkOffline()) {
return
}
NewsJS.Telemetry.RSSSourcePage.recordRSSSourceItemPress(item);
NewsJS.Utilities.launchArticle(item, listInfo)
}, loadPageData: function loadPageData(bypassCache) {
this._newsProviders = [];
var source=this._state.entity;
if (source && !this.showErrorIfBlocked()) {
var feedNamesArray=source.feedNamesArray ? source.feedNamesArray : (source.rss_names ? source.rss_names.split(',') : null);
var feedUrlsArray=source.feedUrlsArray ? source.feedUrlsArray : (source.rss_urls ? source.rss_urls.split(',') : null);
if (feedNamesArray && feedUrlsArray && feedNamesArray.length === feedUrlsArray.length) {
var startIndex=0;
var endIndex=feedNamesArray.length;
if (this._state.defaultFeedName) {
startIndex = feedNamesArray.indexOf(this._state.defaultFeedName);
endIndex = startIndex + 1;
var button=document.getElementById("followSource");
if (button) {
WinJS.Utilities.addClass(button, "hidden")
}
button = document.getElementById("pinSource");
if (button) {
WinJS.Utilities.addClass(button, "hidden")
}
}
if (startIndex >= 0) {
for (var i=startIndex; i < endIndex; i++) {
var url=feedUrlsArray[i].trim();
var title=feedNamesArray[i].trim();
try {
url = decodeURIComponent(url)
}
catch(exception) {
continue
}
var disableFavIcon=!PlatformJS.Services.appConfig.getDictionary("BDIConfig").getBool("EnableFavIcons");
this._newsProviders.push(new CommonJS.NewsRSS.NewsProvider({
feed: url, isCustomRSS: source.isCustomRSS, sourceName: source.displayname, title: title, showProgress: true, disableFavIcon: disableFavIcon, bypassCache: bypassCache, onsuccess: function onsuccess(e) {
if (e) {
NewsJS.Utilities.setLastUpdatedTime([e.lastUpdateTime])
}
}, onerror: function onerror(){}
}))
}
}
if (this._newsProviders.length === 1) {
this._showingSingleFeed = true;
var panorama=PlatformJS.Utilities.getControl("news_Panorama");
if (panorama) {
panorama.zoomOptions = {locked: true}
}
}
else {
this._maxColumnCount = 2
}
}
else {
console.error("NewsJS.RssSourcePage:loadPageData: Required RSS source names/urls are null.")
}
this.createClusters();
if (bypassCache) {
var panoControl=PlatformJS.Utilities.getControl("news_Panorama");
if (panoControl) {
panoControl.clusterDataSource = this._clusters.dataSource
}
}
}
}, createClusters: function createClusters() {
var that=this;
that._clusters = new WinJS.Binding.List;
for (var i=0; i < that._newsProviders.length; i++) {
(function(index) {
var provider=that._newsProviders[index];
provider.clusterID = that._maxColumnCount;
var clusterKey="newsCluster" + index;
that._clusters.push({
clusterKey: clusterKey, clusterTitle: provider.title, onHeaderSelection: that._showingSingleFeed ? null : function() {
NewsJS.Telemetry.Cluster.recordClusterHeaderPress("newsCluster" + index, provider.title, index);
PlatformJS.Navigation.navigateToChannel("RSSSourcePage", {
entity: that._state.entity, defaultFeedName: provider.title
})
}, clusterContent: {
contentControl: "CommonJS.News.EntityCluster", contentOptions: {
categoryKey: clusterKey, adLayoutOverrideKey: "noad", mode: CommonJS.News.ClusterMode.dynamic, onitemclick: function onitemclick(e) {
if (e.item.sentinel) {
return
}
var panorama=PlatformJS.Utilities.getControl("news_Panorama");
var newsCluster=panorama.getClusterContentControl("newsCluster" + index);
var newsItems=newsCluster ? newsCluster.newsItems : null;
var clusterArticles={articleInfos: []};
if (newsItems && newsItems.length > 0) {
for (var k=0; k < newsItems.length; k++) {
var article=newsItems[k];
var articleIdPath=article.articleUrl;
if (articleIdPath) {
var articleInfo={
articleId: articleIdPath, headline: article.title, abstract: article.abstract, thumbnail: article.thumbnailLowRes || article.thumbnail
};
clusterArticles.articleInfos.push(articleInfo)
}
}
}
if (e.item && clusterArticles && clusterArticles.articleInfos && clusterArticles.articleInfos.length > 0) {
e.item.clusterArticles = clusterArticles
}
that.itemInvoked(e, {
title: that._title, subTitle: provider.title, articles: newsItems
})
}, provider: provider, maxColumnCount: that._maxColumnCount, noResultsMessage: "{0} {1}".format(PlatformJS.Services.resourceLoader.getString("NoSourceResultsMessage"), PlatformJS.Services.resourceLoader.getString("NoSourceResultsMessage2")), configKey: "EntityClusterDefaultNewsConfig", configObject: CommonJS.News.EntityClusterConfig.DefaultNews, theme: "newsAppTheme", telemetry: {getCurrentImpression: function getCurrentImpression() {
return PlatformJS.Navigation.mainNavigator.getCurrentImpression()
}}
}
}
})
})(i)
}
}, dispose: function dispose() {
var edgy=PlatformJS.Utilities.getControl("actionEdgy");
if (edgy) {
edgy.removeEventListener("beforeshow", this._onEdgyBeforeShowHandler)
}
this._onEdgyBeforeShowHandler = null;
NewsJS.SourceBasePage.prototype.dispose.call(this)
}, _onEdgyBeforeShow: function _onEdgyBeforeShow() {
var source=this._state.entity;
if (source) {
var sourceCopy={};
for (var attr in source) {
if (source[attr] && typeof source[attr] !== "function" && typeof source[attr] !== "object" && source[attr] !== "") {
sourceCopy[attr] = source[attr]
}
}
this.compressUrls(sourceCopy);
NewsJS.Utilities.Pinning.setupPinSourceButton("pinSource", "Pin RSS Source Button", sourceCopy, "NewsJS.RSSSourcePage");
NewsJS.Utilities.setupAddSectionButton(NewsJS.Personalization.Utilities.sectionType.Sources, {
type: "rss", market: this._state.market || NewsJS.Globalization.getMarketString(), appMarket: NewsJS.Globalization.getMarketString(), source: source
})
}
}
})})
})()