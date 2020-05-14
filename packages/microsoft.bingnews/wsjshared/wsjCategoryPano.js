/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
WinJS.Namespace.define("WSJJS", {
VerticalScrollContainer: WinJS.Class.derive(CommonJS.Immersive.ItemsContainer, function(element, options) {
CommonJS.Immersive.ItemsContainer.call(this, element, options);
this.element.addEventListener("mousewheel", CommonJS.Immersive.PanoramaPanel.verticalScrollHandler, false)
}, {dispose: function dispose() {
this.element.removeEventListener("mousewheel", CommonJS.Immersive.PanoramaPanel.verticalScrollHandler);
CommonJS.Immersive.ItemsContainer.prototype.dispose.call(this)
}}), CategoryPano: WinJS.Class.derive(WSJJS.BasePanoPage, function categoryPano_ctor(state) {
if (!state) {
var channelInfo=PlatformJS.Navigation.mainNavigator.channelManager.resolveChannel("Home");
state = channelInfo.state
}
WSJJS.BasePanoPage.call(this, state);
if (state.feedType === "WSJ.GetVideoSection") {
var wsjCategoryPano=document.querySelector(".wsjCategoryPano");
if (wsjCategoryPano) {
WinJS.Utilities.addClass(wsjCategoryPano, "wsjLive")
}
}
this._title = PlatformJS.Services.resourceLoader.getString("/wsj/thewsj");
this._categoryPano = {
fragment: "/wsjshared/wsjCategoryPano.html", page: "WSJJS.CategoryPano"
};
this._articleReaderPage = "WSJJS.ArticleReader.Page";
this._articleReaderProvider = "WSJJS.ArticleReader.Provider";
this._slideshowProvider = "WSJJS.SlideShow.Provider";
this._slideShowPage = "WSJJS.SlideShow.Page";
this._articleManager = WSJJS.ArticleManager.instance;
this._openBlogInFrame = true;
this._marketData = null;
if (!NewsJS.Partners.Config.isPartnerApp) {
WSJJS.Instrumentation.instance.openSession()
}
else {
var newsActionEdgyRight=document.querySelector(".newsActionEdgyRight");
if (newsActionEdgyRight) {
var helpButton=document.getElementById("helpButton");
if (helpButton) {
newsActionEdgyRight.removeChild(helpButton)
}
}
}
this._startPrefetch();
WSJJS.Instrumentation.instance.instrumentSectionView(state.feedIdentifierValue)
}, {
_marketData: null, _startPrefetch: function _startPrefetch() {
var that=this;
var WSJSettings=PlatformJS.Services.configuration.getDictionary("WSJ");
var prefetchEnabled=!WSJSettings.getBool("DisablePrefetching");
if (prefetchEnabled) {
setTimeout(function startPrefetchForPartnerPanos() {
msSetImmediate(function startPrefetchForPartnerPanosAfterYielding() {
if (that._articleManager) {
that._articleManager.prefetch()
}
})
}, 5000)
}
}, dispose: function dispose() {
WSJJS.BasePanoPage.prototype.dispose.call(this);
if (this._marketData) {
this._marketData.dispose()
}
}, _createMarketWatch: function _createMarketWatch() {
this._marketData = new WSJJS.MarketData;
var page=document.querySelector(".platformPage");
page.appendChild(this._marketData.element)
}, _computeTimestamp: function _computeTimestamp(categoryTimestamp) {
var that=this;
if (!that._timestamp || new Date(that._timestamp) < new Date(categoryTimestamp)) {
that._timestamp = categoryTimestamp;
var waterMarkText="<span class='lastUpdated'>{0}</span> <span class='lastUpdatedTime'>{1}</span> <span class='lastUpdatedDate'>{2}</span>";
CommonJS.Watermark.setWatermarkHtml(waterMarkText.format(PlatformJS.Services.resourceLoader.getString("/wsj/LastUpdated"), WSJJS.Formatter.instance.getTimeString(that._timestamp), WSJJS.Formatter.instance.getDateString(that._timestamp)))
}
}, getPageImpressionContext: function getPageImpressionContext() {
if (this._state.feedIdentifierValue === "FRONT SECTION") {
return NewsJS.Telemetry.String.ImpressionContext.partnerPano
}
else {
return NewsJS.Telemetry.String.ImpressionContext.subPartnerPano
}
}, getPageImpressionPartnerCodeAndAttributes: function getPageImpressionPartnerCodeAndAttributes() {
return {partnerCode: "BI"}
}, whatsNewsTitleRenderer: function whatsNewsTitleRenderer() {
var div=document.createElement("div");
WinJS.Utilities.addClass(div, "whatsNewsHeader");
div.innerText = PlatformJS.Services.resourceLoader.getString("/wsj/WHATS NEWS");
return div
}, whatsNewsRenderer: function whatsNewsRenderer(item) {
item = item.data;
var div=document.createElement("div");
WinJS.Utilities.addClass(div, "whatsNewsItem");
var title=document.createElement("div");
WinJS.Utilities.addClass(title, "whatsNewsTitle");
title.innerHTML = item.title;
div.appendChild(title);
var snippet=document.createElement("div");
WinJS.Utilities.addClass(snippet, "whatsNewsSnippet");
snippet.innerText = item.snippet;
div.appendChild(snippet);
if (item.access !== "anonymous") {
WinJS.Utilities.addClass(div, "lockedStory")
}
return div
}, createFrontSection: function createFrontSection(frontSectionInfo, bypassCache) {
var whatsNews="WHATS NEWS",
that=this,
whatsNewsCategoryInfo=that._articleManager.getFeedInfo("section", whatsNews),
whatsNewsProvider=new WSJJS.NewsCluster.Provider(whatsNewsCategoryInfo, whatsNewsCategoryInfo.title, null, function() {
that._computeTimestamp(whatsNewsProvider.categoryInfo.lastBuildDate);
if (that._isSnapped) {
that._pageLoadSucceeded()
}
}, function() {
whatsNewsProvider.onerror = null;
if (that._isSnapped) {
that._providers = [];
that.createSectionCluster(frontSectionInfo, bypassCache, false);
return that._populatePano()
}
}, bypassCache);
that._providers.push(whatsNewsProvider);
var whatsNewsPromise=whatsNewsProvider.queryAsync().then(function(feed) {
var newsItems=[];
for (var i=0; i < feed.newsItems.length; i++) {
newsItems.push(feed.newsItems[i])
}
if (newsItems.length > 0) {
for (var j=0; j < newsItems.length; j++) {
newsItems[j].moduleInfo = {renderer: that.whatsNewsRenderer}
}
newsItems.unshift({moduleInfo: {
renderer: that.whatsNewsTitleRenderer, isInteractive: true
}});
that._clusters.push({
clusterKey: whatsNewsCategoryInfo.title, clusterTitle: "", clusterContent: {
contentControl: "NewsJS.Controls.VerticalScrollContainer", contentOptions: {
itemDataSource: (new WinJS.Binding.List(newsItems)).dataSource, className: "whatsNewsLayout", onitemclick: function onitemclick(event) {
that.itemInvoked(event.detail.item, event)
}
}
}
})
}
return WinJS.Promise.wrap()
});
return whatsNewsPromise.then(function() {
that.createSectionCluster(frontSectionInfo, bypassCache, false);
return that._populatePano()
}, function(error) {
if (NewsJS.Utilities.isCancellationError(error)) {
return WinJS.Promise.wrap()
}
else {
that.createSectionCluster(frontSectionInfo, bypassCache, false);
return that._populatePano()
}
})
}, loadPageData: function loadPageData(bypassCache) {
NewsJS.BasePartnerPano.prototype.loadPageData.call(this, bypassCache);
var that=this;
if (that._state.feedIdentifierValue === "WSJ LIVE") {
this._pageDataPromise = this._getLiveFeedsAsync(bypassCache)
}
else {
this._pageDataPromise = this._articleManager.getFeedInfoAsync(that._state.feedType, that._state.feedIdentifierValue, bypassCache).then(function(categoryInfo) {
that._providers = [];
that._clusters = [];
that._createTimer();
if (that._state.feedIdentifierValue === "FRONT SECTION") {
return that.createFrontSection(categoryInfo, bypassCache)
}
else {
that.createSectionCluster(categoryInfo, bypassCache, false, {omitAds: that._state.feedType === "WSJ.GetVideoSection"});
return that._populatePano()
}
}, function() {
that._pageLoadFailed()
})
}
}, _onHeaderSelection: function _onHeaderSelection(clusterKey, index, pano, event) {
var pageInfo={
fragment: "/wsjshared/wsjCategoryPano.html", page: this._categoryPano.page, channelId: "WSJ_WSJ LIVE"
};
WinJS.Navigation.navigate(pageInfo, {
feedType: this._state.feedType, feedIdentifierValue: clusterKey, theme: this._partner
})
}, _getLiveFeedsAsync: function _getLiveFeedsAsync(bypassCache) {
this._providers = [];
this._clusters = [];
var liveFeeds=CommonJS.Partners.Config.getConfig(this._partner, "WSJLiveFeeds", []);
var promises=[];
for (var i=0; i < liveFeeds.length; i++) {
promises.push(this._articleManager.getFeedInfoAsync(this._state.feedType, liveFeeds[i].value, bypassCache))
}
var that=this;
return WinJS.Promise.join(promises).then(function(categoryInfos) {
var maxColumnCount=CommonJS.Partners.Config.getConfig(that._partner, "WSJLiveColumnCount", 3);
for (var j=0; j < categoryInfos.length; j++) {
that.createSectionCluster(categoryInfos[j], bypassCache, false, {
onheaderselection: true, omitAds: true, maxColumnCount: maxColumnCount, isPrimaryCluster: false
})
}
that._pageLoadSucceeded();
return that._populatePano()
})
}, createSectionCluster: function createSectionCluster(categoryInfo, bypassCache, omitTitle, options) {
var that=this;
var isPrimaryCluster=options && options.isPrimaryCluster !== undefined ? options.isPrimaryCluster : true;
var provider=new WSJJS.NewsCluster.Provider(categoryInfo, categoryInfo.title, null, function() {
if (isPrimaryCluster) {
that._pageLoadSucceeded()
}
that._computeTimestamp(provider.categoryInfo.lastBuildDate)
}, function(error) {
if (isPrimaryCluster) {
that._pageLoadFailed()
}
}, bypassCache, !options || options.isPrimaryCluster);
var adsMetadata=PlatformJS.Ads.Partners.AdsManager.instance.getFormattedAdsMetadataForPartnerByType("WSJ", "cluster", {
numberOfAds: 1, section: this._state.feedIdentifierValue, location: "cluster"
});
var adInfo=adsMetadata.formattedAdsList[0];
adInfo.adUnitId = PlatformJS.Ads.Partners.AdsManager.instance.getSectionAdUnitId("WSJ", categoryInfo.sectionName);
if (!this._providers) {
return
}
this._providers.push(provider);
this._clusters.push(this.createNewsCluster(categoryInfo, provider, omitTitle ? " " : categoryInfo.title, options ? options.onheaderselection : false, options && options.maxColumnCount ? options.maxColumnCount : null, isPrimaryCluster, "EntityClusterWSJConfig", CommonJS.News.EntityClusterConfig.WSJ, options && options.omitAds ? null : adInfo, null, null, Platform.Instrumentation.InstrumentationArticleEntryPoint.partnerPano, this.getPageImpressionPartnerCodeAndAttributes()))
}, onPinSection: function onPinSection() {
WSJJS.Instrumentation.instance.instrumentSectionPinned(this._state.feedIdentifierValue)
}
})
})
})()