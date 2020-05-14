/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
WinJS.Namespace.define("NewsJS", {SourcePage: WinJS.Class.derive(NewsJS.SourceBasePage, function(state) {
NewsJS.SourceBasePage.call(this, state);
var that=this;
if (!state) {
state = {}
}
else {
this._panoramaState = state.panoramaState
}
var firstload=true;
if (state !== undefined && state.firstload !== undefined) {
firstload = state.firstload
}
if (firstload) {
state.firstload = false
}
this._state = state;
this._clusters = new WinJS.Binding.List;
this._data = [];
var market=that._state.entity.market || that._state.market || Platform.Globalization.Marketization.getCurrentMarket();
this._state.entity.market = market;
this._onEdgyBeforeShowHandler = this._onEdgyBeforeShow.bind(this);
var edgy=PlatformJS.Utilities.getControl("actionEdgy");
if (edgy) {
edgy.addEventListener("beforeshow", this._onEdgyBeforeShowHandler)
}
this.loadPageData(false)
}, {
_state: null, _gridLayout: null, _datasource: null, _listView: null, _clusterDataSourceSet: false, _offset: 0, _cluster: null, getPageImpressionContext: function getPageImpressionContext() {
return NewsJS.Telemetry.String.ImpressionContext.source
}, getPageState: function getPageState() {
var panoControl=PlatformJS.Utilities.getControl("news_Panorama");
if (panoControl) {
this._state.panoramaState = panoControl.getPanoramaState()
}
return this._state
}, getPageData: function getPageData() {
var that=this;
return WinJS.Promise.wrap({
title: that._state.entity.displayname, semanticZoomRenderer: that.semanticZoomRenderer, headerOptions: that.commonHeaderOptions, panoramaState: that._panoramaState
})
}, setClusterDataSource: function setClusterDataSource() {
var that=this;
this._clusters.pop();
var dataResults={newsItems: this._data};
if (that.layoutCacheInfo) {
dataResults.cacheID = that.layoutCacheInfo.cacheID;
dataResults.dataCacheID = that.layoutCacheInfo.cacheKey;
dataResults.uniqueResponseID = that.layoutCacheInfo.uniqueResponseID
}
var clusterArticles={articleInfos: []};
if (dataResults.newsItems && dataResults.newsItems.length > 0) {
for (var i=0; i < dataResults.newsItems.length; i++) {
var article=dataResults.newsItems[i];
var articleIdPath=article.articleUrl;
if (articleIdPath) {
var articleInfo={
articleId: articleIdPath, headline: article.title
};
clusterArticles.articleInfos.push(articleInfo)
}
}
}
var clusterKey="newsCluster";
this._clusters.push({
clusterKey: clusterKey, clusterContent: {
contentControl: "CommonJS.News.EntityCluster", contentOptions: {
categoryKey: clusterKey, adLayoutOverrideKey: "noad", mode: CommonJS.News.ClusterMode.static, configKey: "EntityClusterDefaultNewsConfig", configObject: CommonJS.News.EntityClusterConfig.DefaultNews, onitemclick: function onitemclick(e) {
if (e.item && clusterArticles && clusterArticles.articleInfos && clusterArticles.articleInfos.length > 0) {
e.item.clusterArticles = clusterArticles
}
that.itemInvoked(e)
}, dataSet: dataResults, noResultsMessage: "{0} {1}".format(PlatformJS.Services.resourceLoader.getString("NoSourceResultsMessage"), PlatformJS.Services.resourceLoader.getString("NoSourceResultsMessage2")), theme: "newsAppTheme ", telemetry: {getCurrentImpression: function getCurrentImpression() {
return PlatformJS.Navigation.mainNavigator.getCurrentImpression()
}}
}
}
});
var panoControl=PlatformJS.Utilities.getControl("news_Panorama");
if (panoControl && !this._clusterDataSourceSet) {
this._clusterDataSourceSet = true;
panoControl.clusterDataSource = that._clusters.dataSource
}
}, loadPageData: function loadPageData(bypassCache) {
var that=this;
this._offset = 0;
this.isOnline = NewsJS.Utilities.CachedNetworkChecks.hasInternetConnection();
var source=that._state.entity;
if (!that.showErrorIfBlocked()) {
that.fetchData(source.title, bypassCache)
}
var panorama=PlatformJS.Utilities.getControl("news_Panorama");
if (panorama) {
panorama.zoomOptions = {locked: true}
}
}, toggleOfflineArticles: function toggleOfflineArticles(enabled){}, fetchData: function fetchData(source_domain, bypassCache) {
var that=this;
NewsJS.Utilities.disableButton("refreshButton", true);
CommonJS.Progress.showProgress(CommonJS.Progress.headerProgressType);
var sourceData=new NewsJS.SourceData({market: that._state.entity.market || that._state.market || Platform.Globalization.Marketization.getCurrentMarket()});
sourceData.fetchSourceData(source_domain, bypassCache).then(function(results) {
if (results) {
var parsedResults=sourceData.parseResults(results);
that._data = parsedResults.data;
that.allResultsReceived();
that._pageLoadSucceeded();
NewsJS.Utilities.setLastUpdatedTime(parsedResults.lastUpdateTimes)
}
else {
that._pageLoadFailed()
}
}, function(e) {
that._pageDataPromise = null;
if (!NewsJS.Utilities.isCancellationError(e)) {
that._pageLoadFailed()
}
})
}, allResultsReceived: function allResultsReceived() {
var that=this;
that.setClusterDataSource()
}, dispose: function dispose() {
var edgy=PlatformJS.Utilities.getControl("actionEdgy");
if (edgy) {
edgy.removeEventListener("beforeshow", this._onEdgyBeforeShowHandler)
}
this._onEdgyBeforeShowHandler = null;
NewsJS.SourceBasePage.prototype.dispose.call(this)
}, _clusterTitle: function _clusterTitle(groupData) {
return this._state.entity.displayname
}, _onEdgyBeforeShow: function _onEdgyBeforeShow() {
NewsJS.Utilities.Pinning.setupPinSourceButton("pinSource", "Pin Source Button", this._state.entity, null);
NewsJS.Utilities.setupAddSectionButton(NewsJS.Personalization.Utilities.sectionType.Sources, {
type: "algo", market: this._state.market, appMarket: NewsJS.Globalization.getMarketString(), source: this._state.entity
})
}, itemInvoked: function itemInvoked(e) {
var that=this;
var item=e.item;
if ((item && item.sentinel) || this.checkOffline()) {
return
}
NewsJS.Telemetry.SourcePage.recordSourceItemPress(item);
NewsJS.Utilities.launchArticle(item, {
subTitle: that._state.entity.displayname, articles: that._data, currentArticleIndex: e.currentArticleIndex
})
}
})})
})()