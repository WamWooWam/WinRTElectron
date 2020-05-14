/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
WinJS.Namespace.define("NYTJS", {CategoryPano: WinJS.Class.derive(NYTJS.BasePanoPage, function categoryPano_ctor(state) {
if (!state) {
state = {
feedType: "section", feedIdentifierValue: "homepage", title: "Top News", theme: "NYT"
}
}
NYTJS.BasePanoPage.call(this, state);
this._homepageSecondaryClusterLimit = CommonJS.Partners.Config.getConfig(this._partner, "HomepageSecondaryClusterLimit", 4);
this._homepageSecondaryClusterColumnLimit = CommonJS.Partners.Config.getConfig(this._partner, "HomepageSecondaryColumnClusterLimit", 3);
this._title = PlatformJS.Services.resourceLoader.getString("/nyt/thenyt");
this._categoryPano = {
fragment: "/nytshared/nytCategoryPano.html", page: "NYTJS.CategoryPano"
};
this._articleReaderPage = "NYTJS.ArticleReader.Page";
this._slideShowPage = "NYTJS.SlideShow.Page";
this._articleReaderProvider = "NYTJS.ArticleReader.Provider";
this._slideshowProvider = "NYTJS.SlideShow.Provider";
this._articleManager = NYTJS.ArticleManager.instance;
if (!NewsJS.Partners.Config.isPartnerApp) {
NYTJS.Instrumentation.instance.openSession()
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
NYTJS.Instrumentation.instance.instrumentSectionView(state.feedIdentifierValue);
this._startPrefetch()
}, {
_startPrefetch: function _startPrefetch() {
var that=this;
setTimeout(function startPrefetchForPartnerPanos() {
msSetImmediate(function startPrefetchForPartnerPanosAfterYielding() {
if (that._articleManager) {
that._articleManager.prefetch()
}
})
}, 5000)
}, _createCluster: function _createCluster(config, isPrimaryCluster, categoryInfo, adInfo) {
var that=this;
categoryInfo = categoryInfo || NYTJS.ArticleManager.instance.getFeedInfo("section", config.section);
if (!categoryInfo) {
return
}
var title=categoryInfo.sectionName && categoryInfo.sectionName.indexOf("video.") === 0 && categoryInfo.title !== "Video" ? PlatformJS.Services.resourceLoader.getString("/nyt/Video").format(categoryInfo.title) : categoryInfo.title;
var maxHeadlines=config && config.maxHeadlines !== "all" ? parseInt(config.maxHeadlines) : null;
var maxColumns=config && config.columns !== "all" ? parseInt(config.columns) : null;
var provider=new NYTJS.NewsCluster.Provider(categoryInfo, categoryInfo.title, maxHeadlines, function() {
if (isPrimaryCluster) {
that._pageLoadSucceeded()
}
that._computeTimestamp(categoryInfo.pubDate)
}, function(error) {
if (isPrimaryCluster) {
that._pageLoadFailed()
}
}, isPrimaryCluster, this._state.feedIdentifierValue);
this._providers.push(provider);
var adFrequency=6;
if (categoryInfo.sectionName === "homepage") {
adFrequency = 4
}
else if (categoryInfo.sectionName === "feeds.slideshows") {
adFrequency = 12
}
this._clusters.push(this.createNewsCluster(categoryInfo, provider, categoryInfo.title, !isPrimaryCluster, maxColumns, isPrimaryCluster, "EntityClusterNYTConfig", CommonJS.News.EntityClusterConfig.NYT, adInfo, adFrequency, null, Platform.Instrumentation.InstrumentationArticleEntryPoint.partnerPano, this.getPageImpressionPartnerCodeAndAttributes()))
}, _computeTimestamp: function _computeTimestamp(categoryTimestamp) {
var that=this;
if (!that._timestamp || that._timestamp < categoryTimestamp) {
that._timestamp = categoryTimestamp;
var waterMarkText="<span class='lastUpdated'>{0}</span><span class='lastUpdatedTime'>{1}</span> <span class='lastUpdatedDate'>{2}</span>";
CommonJS.Watermark.setWatermarkHtml(waterMarkText.format(PlatformJS.Services.resourceLoader.getString("/nyt/LastUpdated"), NYTJS.Formatter.instance.getTimeString(that._timestamp), NYTJS.Formatter.instance.getDateString(that._timestamp)))
}
}, getPageImpressionContext: function getPageImpressionContext() {
if (this._state.feedIdentifierValue === "homepage") {
return NewsJS.Telemetry.String.ImpressionContext.partnerPano
}
else {
return NewsJS.Telemetry.String.ImpressionContext.subPartnerPano
}
}, getPageImpressionPartnerCodeAndAttributes: function getPageImpressionPartnerCodeAndAttributes() {
return {partnerCode: "NY"}
}, dispose: function dispose() {
NYTJS.BasePanoPage.prototype.dispose.call(this)
}, onPinSection: function onPinSection() {
NYTJS.Instrumentation.instance.instrumentSectionPinned(this._state.feedIdentifierValue)
}, loadPageData: function loadPageData(bypassCache) {
NewsJS.BasePartnerPano.prototype.loadPageData.call(this, bypassCache);
var that=this;
this._pageDataPromise = NYTJS.ArticleManager.instance.getFeedInfoAsync(that._state.feedType, that._state.feedIdentifierValue, bypassCache).then(function(categoryInfo) {
that._providers = [];
that._clusters = [];
that._createTimer();
var adsMetadata=null,
adInfo=null,
primaryClusterFound=false;
if (that._state.feedType === "section" && that._state.feedIdentifierValue === "homepage") {
var topStoriesConfig=NYTJS.ArticleManager.instance.latest["top-stories-pano-config"];
if (!topStoriesConfig || topStoriesConfig.length === 0) {
topStoriesConfig = [{
columns: "all", maxHeadlines: "all", section: "homepage"
}, {
columns: "3", maxHeadlines: "9", section: "world"
}, {
columns: "3", maxHeadlines: "9", section: "us"
}, {
columns: "3", maxHeadlines: "9", section: "us.politics"
}, {
columns: "3", maxHeadlines: "9", section: "opinion"
}, {
columns: "3", maxHeadlines: "9", section: "business"
}, {
columns: "3", maxHeadlines: "9", section: "sports"
}, {
columns: "3", maxHeadlines: "9", section: "arts"
}]
}
for (var j=0; j < topStoriesConfig.length; j++) {
var config=topStoriesConfig[j];
var isHomepage=config.section === "homepage";
var adPosition=null;
var adUnitId=null;
if (isHomepage) {
adPosition = "MiddleRight";
adUnitId = PlatformJS.Ads.Partners.AdsManager.instance.getSectionAdUnitId("NYT", "homepage")
}
else if (j === topStoriesConfig.length - 1) {
adPosition = "MiddleRight";
adUnitId = PlatformJS.Ads.Partners.AdsManager.instance.getSectionAdUnitId("NYT", "homepageEnd")
}
else {
adPosition = null;
adUnitId = null
}
if (adPosition) {
adsMetadata = PlatformJS.Ads.Partners.AdsManager.instance.getFormattedAdsMetadataForPartnerByType("NYT", "cluster", {
numberOfAds: 1, section: that._state.feedIdentifierValue, location: "cluster", position: adPosition
});
adInfo = adsMetadata.formattedAdsList[0];
adInfo.adUnitId = adUnitId
}
else {
adInfo = null
}
that._createCluster(config, isHomepage, isHomepage ? categoryInfo : null, adInfo);
primaryClusterFound |= isHomepage
}
}
else {
primaryClusterFound = true;
adsMetadata = PlatformJS.Ads.Partners.AdsManager.instance.getFormattedAdsMetadataForPartnerByType("NYT", "cluster", {
numberOfAds: 1, section: that._state.feedIdentifierValue, location: "cluster", position: "MiddleRight"
});
adInfo = adsMetadata.formattedAdsList[0];
adInfo.adUnitId = PlatformJS.Ads.Partners.AdsManager.instance.getSectionAdUnitId("NYT", "otherSections");
that._createCluster(null, true, categoryInfo, adInfo);
if (categoryInfo.sectionInfo) {
if (categoryInfo.sectionInfo.blogs) {
var provider=new NYTJS.NewsCluster.BlogsListProvider(categoryInfo.sectionInfo.blogs);
that._providers.push(provider);
that._clusters.push(NYTJS.NewsCluster.BlogsListProvider.createBlogsCluster(PlatformJS.Services.resourceLoader.getString("/nyt/BlogsHeader").format(categoryInfo.title), provider, function(e) {
that.itemInvoked(e.detail.item, e)
}))
}
}
}
if (that._clusters.length === 0 || !primaryClusterFound) {
that._pageLoadFailed()
}
return that._populatePano()
}, function(error) {
that._pageLoadFailed();
if (error === "FeedDoesNotExist" && that._state.feedIdentifierValue !== "homepage") {
PlatformJS.Navigation.mainNavigator.resetApp()
}
return WinJS.Promise.wrap()
})
}
})})
})()