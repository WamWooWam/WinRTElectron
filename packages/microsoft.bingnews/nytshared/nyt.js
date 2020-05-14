/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
var partner="NYT";
WinJS.Namespace.define("NYTJS", {
AuthControl: WinJS.Class.derive(NewsJS.Partners.BaseWebAuthControl, function nyt_auth_ctrl_ctor(options) {
this._partner = partner;
options.targetUrl = NYTJS.AuthControl.rebuildUrl(options.targetUrl);
options.partner = partner;
options.initializeUrl = NYTJS.AuthControl.rebuildUrl(options.initializeUrl);
CommonJS.Partners.Debug.instance.log("Opening: " + options.targetUrl);
NewsJS.Partners.BaseWebAuthControl.call(this, options)
}, {
instrumentCancel: function instrumentCancel() {
NYTJS.Instrumentation.instance.instrumentSubscription(false, true)
}, getUrl: function getUrl(data) {
var url=NYTJS.AuthControl.rebuildUrl(data.url);
CommonJS.Partners.Debug.instance.log("Opening: " + url);
return url
}
}, {rebuildUrl: function rebuildUrl(originalUrl) {
var unencodedId="app=microsoft.nyt";
if (originalUrl.indexOf(unencodedId) !== -1) {
return originalUrl.replace(unencodedId, "app=" + NYTJS.Auth.instance.authUrlAppId)
}
var encodedId=encodeURIComponent(unencodedId).replace(".", "%2E");
if (originalUrl.indexOf(encodedId) !== -1) {
return originalUrl.replace(encodedId, encodeURIComponent("app=" + NYTJS.Auth.instance.authUrlAppId).replace(".", "%2E"))
}
if (originalUrl.indexOf("{0}") !== -1) {
return originalUrl.replace("{0}", encodeURIComponent(NYTJS.Auth.instance.authUrlAppId).replace(".", "%2E"))
}
return originalUrl
}}), SaveArticleManager: WinJS.Class.define(function() {
this._cachedArticles = null;
this._saveTokenLifetime = CommonJS.Partners.Config.getConfig(partner, "SaveTokenLifetime", 60 * 10);
this._cachedOffset = 0
}, {
_cachedArticles: null, _cachedOffset: 0, getCountsAsync: function getCountsAsync(isRetry, paywallProviderPromise) {
paywallProviderPromise = paywallProviderPromise || WinJS.Promise.wrap({});
var that=this;
return paywallProviderPromise.then(this.getSaveTokenAsync.bind(this)).then(function(tokenInfo) {
var queryService=new PlatformJS.DataService.QueryService("NYT.ReadingList.Counts"),
options=new Platform.DataServices.QueryServiceOptions;
options.bypassCache = true;
options.requestCookies.insert("NYT-S", tokenInfo.authToken);
options.requestHeaders.insert("X-Nyt-Sartre-Token", tokenInfo.token);
return queryService.downloadDataAsync(null, null, null, options)
}).then(function(response) {
var counts=null;
try {
counts = JSON.parse(response.dataString)
}
catch(e) {}
if (counts) {
return WinJS.Promise.wrap(counts)
}
else {
return WinJS.Promise.wrapError("Unable to fetch counts")
}
}, function(error) {
if (!isRetry) {
return that.getCountsAsync(true, paywallProviderPromise)
}
else {
return WinJS.Promise.wrapError(error)
}
})
}, purgeCache: function purgeCache(dataService) {
var service=new Platform.QueryService(dataService);
service.deleteCacheEntryAsync(null, null).then(function(){}, function(){})
}, reset: function reset() {
this._saveToken = null;
this._saveTokenExpireTime = 0;
this._cachedArticles = null;
this._cachedOffset = 0;
this.purgeCache("NYT.TokenService");
this.purgeCache("NYT.ReadingList.Counts");
var service=new Platform.QueryService("NYT.ReadingList.List");
for (var i=0; i < 10; i++) {
var params=PlatformJS.Collections.createStringDictionary();
params.insert("offset", i * 50);
params.insert("limit", 50);
service.deleteCacheEntryAsync(params, null).then(function(){}, function(){})
}
}, _saveToken: null, _saveTokenExpireTime: 0, getSaveTokenAsync: function getSaveTokenAsync(paywallProvider) {
var authToken;
if (paywallProvider) {
authToken = paywallProvider.authToken
}
if (!authToken || authToken === "") {
return WinJS.Promise.wrapError(CommonJS.Partners.Auth.BaseAuth.notLoggedInError)
}
if (this._saveToken && Date.now() / 1000 < this._saveTokenExpireTime) {
return WinJS.Promise.wrap({
token: this._saveToken, authToken: authToken
})
}
var queryService=new PlatformJS.DataService.QueryService("NYT.TokenService"),
options=new Platform.DataServices.QueryServiceOptions;
options.bypassCache = true;
options.requestCookies.insert("NYT-S", authToken);
var that=this;
return queryService.downloadDataAsync(null, null, null, options).then(function(tokenResponse) {
var token=null;
try {
var tokenData=JSON.parse(tokenResponse.dataString);
token = tokenData && tokenData.data ? tokenData.data.token : null
}
catch(e) {}
if (token) {
that._saveToken = token;
that._saveTokenExpireTime = Date.now() / 1000 + that._saveTokenLifetime;
return WinJS.Promise.wrap({
token: token, authToken: authToken
})
}
else {
return WinJS.Promise.wrapError("Unable to fetch save token")
}
}, function(error) {
return WinJS.Promise.wrapError("Unable to fetch save token")
})
}, getSavedArticlesAsync: function getSavedArticlesAsync(offset, limit, isRetry, useCache, paywallProviderPromise) {
paywallProviderPromise = paywallProviderPromise || WinJS.Promise.wrap({});
var that=this;
return paywallProviderPromise.then(this.getSaveTokenAsync.bind(this)).then(function(tokenInfo) {
var queryService=new PlatformJS.DataService.QueryService("NYT.ReadingList.List"),
options=new Platform.DataServices.QueryServiceOptions,
params=PlatformJS.Collections.createStringDictionary();
params.insert("offset", offset);
params.insert("limit", limit);
options.bypassCache = !useCache;
options.requestCookies.insert("NYT-S", tokenInfo.authToken);
options.requestHeaders.insert("X-Nyt-Sartre-Token", tokenInfo.token);
return queryService.downloadDataAsync(params, null, null, options)
}).then(function(response) {
if (!response.isCachedResponse || !that._cachedArticles) {
that._cachedArticles = NYTJS.ArticleManager.parseArticleList(response.dataString, "readinglist");
that._cachedOffset = offset
}
if (that._cachedArticles) {
return WinJS.Promise.wrap(that._cachedArticles)
}
else {
return WinJS.Promise.wrapError("Unable to fetch latest feed")
}
}, function(error) {
if (!isRetry) {
return that.getSavedArticlesAsync(offset, limit, true, useCache, paywallProviderPromise)
}
else {
if (that._cachedArticles && that._cachedOffset === offset) {
return WinJS.Promise.wrap(that._cachedArticles)
}
else {
return WinJS.Promise.wrapError(error)
}
}
}, function(progress) {
if (progress.statusCode === Platform.DataServices.QueryServiceStatusCode.cachedEntryFound && progress.cachedResponse) {
that._cachedArticles = NYTJS.ArticleManager.parseArticleList(progress.cachedResponse.dataString, "readinglist");
that._cachedOffset = offset
}
})
}, getReadingListEntryAsync: function getReadingListEntryAsync(articleUrl, paywallProviderPromise) {
paywallProviderPromise = paywallProviderPromise || WinJS.Promise.wrap({});
return paywallProviderPromise.then(this.getSaveTokenAsync.bind(this)).then(function(tokenInfo) {
var queryService=new PlatformJS.DataService.QueryService("NYT.ReadingList.List"),
options=new Platform.DataServices.QueryServiceOptions,
params=PlatformJS.Collections.createStringDictionary();
params.insert("url", encodeURIComponent(articleUrl));
options.requestCookies.insert("NYT-S", tokenInfo.authToken);
options.requestHeaders.insert("X-Nyt-Sartre-Token", tokenInfo.token);
return queryService.downloadDataAsync(params, null, null, options)
})
}, archiveArticleAsync: function archiveArticleAsync(url, paywallProviderPromise) {
paywallProviderPromise = paywallProviderPromise || WinJS.Promise.wrap({});
return paywallProviderPromise.then(this.getSaveTokenAsync.bind(this)).then(function(tokenInfo) {
var queryService=new PlatformJS.DataService.QueryService("NYT.ReadingList.Archive"),
options=new Platform.DataServices.QueryServiceOptions,
params=PlatformJS.Collections.createStringDictionary();
params.insert("url", url);
options.bypassCache = true;
options.requestCookies.insert("NYT-S", tokenInfo.authToken);
options.requestHeaders.insert("X-Nyt-Sartre-Token", tokenInfo.token);
return queryService.downloadDataAsync(null, params, null, options)
}).then(function(response) {
return WinJS.Promise.wrap(true)
})
}, saveArticleAsync: function saveArticleAsync(url, paywallProviderPromise) {
var attributes;
paywallProviderPromise = paywallProviderPromise || WinJS.Promise.wrap({});
return paywallProviderPromise.then(function(paywallProvider) {
attributes = DynamicPanoJS.DynamicPano.getPaywallInstrumentationFromPaywallProvider(paywallProvider, "NY");
attributes["URL"] = url;
return paywallProvider
}).then(this.getSaveTokenAsync.bind(this)).then(function(tokenInfo) {
var queryService=new PlatformJS.DataService.QueryService("NYT.ReadingList.Add"),
options=new Platform.DataServices.QueryServiceOptions,
params=PlatformJS.Collections.createStringDictionary();
params.insert("url", url);
options.bypassCache = true;
options.requestCookies.insert("NYT-S", tokenInfo.authToken);
options.requestHeaders.insert("X-Nyt-Sartre-Token", tokenInfo.token);
return queryService.downloadDataAsync(null, params, null, options)
}).then(function(response) {
var responseData=null,
savedUrl=null;
try {
responseData = JSON.parse(response.dataString)
}
catch(e) {}
if (responseData && responseData.assets && responseData.assets.length > 0) {
savedUrl = responseData.assets[0].url
}
if (savedUrl) {
PlatformJS.deferredTelemetry(function _logNewYorkTimesSaveArticle() {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.ActionContext.bottomEdgy, "Saved Article", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(attributes))
});
return WinJS.Promise.wrap(true)
}
else {
return WinJS.Promise.wrapError("Unable to save article")
}
})
}
}, {
_instance: null, instance: {get: function get() {
if (!NYTJS.SaveArticleManager._instance) {
NYTJS.SaveArticleManager._instance = new NYTJS.SaveArticleManager
}
return NYTJS.SaveArticleManager._instance
}}
}), ArticleManager: WinJS.Class.derive(NewsJS.Partners.ArticleManager, function articleManager_ctor() {
this._latest = null;
this._latestFeedDownloadTime = 0;
this._cache = {};
this._cacheIdentifiers = {};
this._cacheLayoutInfo = {};
this._partner = partner;
this._refreshInterval = CommonJS.Partners.Config.getConfig(partner, "RefreshInterval", 15 * 60) * 1000;
this._isDirty = false;
this._downloadedSections = null;
this._initialized = false;
this._feedPath = CommonJS.Partners.Config.getConfig(partner, "FeedPath", "/partners/microsoft/windows8/v2/json/");
this._latestFile = CommonJS.Partners.Config.getConfig(partner, "LatestFile", "latestfeed.json.gz");
this._blogsMap = {};
this._sectionsMap = {};
this.minimumSlideShowCount = CommonJS.Partners.Config.getConfig(partner, "MinimumSlideShowCount", 0)
}, {
minimumSlideShowCount: 0, _latest: null, latest: {get: function get() {
return this._latest
}}, _isDirty: false, _previousLatest: null, _downloadedSections: null, _lastFullFeed: null, _initialized: false
}, {
isInList: function isInList(list, string) {
NYTJS.ArticleManager._populateList(NYTJS.ArticleManager.photoCreditDisallowList, "PhotoCreditDisallowList");
NYTJS.ArticleManager._populateList(NYTJS.ArticleManager.photoCreditAllowList, "PhotoCreditAllowList");
NYTJS.ArticleManager._populateList(NYTJS.ArticleManager.photoSectionDisallowList, "PhotoSectionDisallowList");
NYTJS.ArticleManager._populateList(NYTJS.ArticleManager.photoSectionAllowList, "PhotoSectionAllowList");
NYTJS.ArticleManager._populateList(NYTJS.ArticleManager.articleBylineDisallowList, "ArticleBylineDisallowList");
NYTJS.ArticleManager._populateSet(NYTJS.ArticleManager.acronymsSet, "AcronymsSet");
if (!string) {
return false
}
string = string.toUpperCase();
for (var i=0; i < list.length; i++) {
var check=list[i].toUpperCase();
if (string.indexOf(check) !== -1) {
if (NYTJS.ArticleManager.acronymsSet[check]) {
var parts=string.split(/\s|\//);
var isInList=parts.filter(function(a) {
return a === list[i]
}).length > 0;
if (isInList) {
return true
}
else {
continue
}
}
else {
return true
}
}
}
}, findArticle: function findArticle(articles, articleId) {
if (articles && articles.length > 0) {
var article=null,
previousArticle=null,
moreArticles=[];
for (var i=0; i < articles.length; i++) {
if (articles[i].url === articleId) {
article = articles[i];
if (i > 0) {
article.previousArticleId = articles[i - 1].url;
article.previousArticle = {articleId: articles[i - 1].url}
}
if (i < articles.length - 1) {
article.nextArticleId = articles[i + 1].url;
article.nextArticle = {articleId: articles[i + 1].url}
}
var offset=0;
while (moreArticles.length < 4) {
offset++;
if (i + offset < articles.length) {
var currentMoreArticle=articles[i + offset];
var currentHeadline=currentMoreArticle.title;
var currentArticleId=currentMoreArticle.url;
if (currentHeadline && currentArticleId) {
var moreArticle={
headline: currentHeadline, articleId: currentArticleId
};
moreArticles.push(moreArticle)
}
}
else {
break
}
}
article.moreArticles = moreArticles;
break
}
}
return article
}
}, isImageAllowed: function isImageAllowed(asset, blog) {
if (NewsJS.Partners.Config.isPartnerApp) {
return true
}
var credit=asset.credit;
var inDisallowList=NYTJS.ArticleManager.isInList(NYTJS.ArticleManager.photoCreditDisallowList, credit);
if (inDisallowList) {
return false
}
var inAllowList=NYTJS.ArticleManager.isInList(NYTJS.ArticleManager.photoCreditAllowList, credit);
if (!credit || !inAllowList) {
if (blog) {
return NYTJS.ArticleManager.isInList(NYTJS.ArticleManager.photoSectionAllowList, blog)
}
else {
return false
}
}
return true
}, isSupportedType: function isSupportedType(article) {
return article.type === "article" || article.type === "video" || article.type === "slideshow" || article.type === "blog"
}, getInlineCrop: function getInlineCrop(crops) {
return crops.articleInline || crops.jumbo || crops.popup || crops.articleLarge || crops.superJumbo || crops.thumbLarge || crops.thumbStandard
}, getLeadCrop: function getLeadCrop(crops) {
if (!crops) {
return null
}
return crops.popup || crops.jumbo || crops.superJumbo || crops.articleInline || crops.thumbLarge || crops.articleLarge || crops.thumbStandard
}, getCrop: function getCrop(crops, descending) {
if (!crops) {
return null
}
if (descending) {
return crops.superJumbo || crops.articleLarge || crops.popup || crops.jumbo || crops.articleInline || crops.thumbLarge || crops.thumbStandard
}
else {
return crops.articleInline || crops.jumbo || crops.popup || crops.articleLarge || crops.superJumbo || crops.thumbLarge || crops.thumbStandard
}
}, hasLargeCrop: function hasLargeCrop(crops) {
if (!crops) {
return false
}
return (crops.superJumbo || crops.articleLarge || crops.popup || crops.jumbo) !== null
}, parseArticleList: function parseArticleList(dataString, feedType, feedIdentifierValue) {
var fullfeed=null;
if (!dataString) {
return
}
try {
fullfeed = JSON.parse(dataString).assets
}
catch(e) {}
if (!fullfeed) {
return
}
var now=Date.now();
var previousArticle=null;
var nextArticle=null;
var feedInfo=feedType !== "readinglist" ? NYTJS.ArticleManager.instance.getFeedInfo(feedType, feedIdentifierValue) : null;
var articles=[];
var i=0;
var guidList=[];
for (i = 0; i < fullfeed.length; i++) {
guidList.push(fullfeed[i].url)
}
var firstImage=true;
var originalFeedCount=fullfeed.length;
for (i = 0; i < fullfeed.length; i++) {
var thumbnail=null,
feedItem=fullfeed[i];
if ((feedItem.glass_status && feedItem.glass_status !== "success") || !NYTJS.ArticleManager.isSupportedType(feedItem)) {
var indexToRemove=guidList.indexOf(fullfeed[i].url);
guidList.splice(indexToRemove, 1);
continue
}
previousArticle = i > 0 ? fullfeed[i] : null,
nextArticle = i < fullfeed.length - 1 ? fullfeed[i + 1] : null;
if (feedItem.relatedAssets && feedItem.relatedAssets.length > 0 && !NYTJS.ArticleManager.isInList(NYTJS.ArticleManager.photoSectionDisallowList, feedItem.blog || feedItem.section)) {
for (var j=0; j < feedItem.relatedAssets.length; j++) {
if (feedItem.relatedAssets[j].crops && NYTJS.ArticleManager.isImageAllowed(feedItem.relatedAssets[j], feedItem.blog || feedItem.section)) {
var crops=feedItem.relatedAssets[j].crops;
if (firstImage) {
thumbnail = NYTJS.ArticleManager.getLeadCrop(crops);
firstImage = false
}
else {
thumbnail = NYTJS.ArticleManager.getCrop(crops, false)
}
thumbnail.altText = feedItem.relatedAssets[j].caption;
thumbnail.attribution = feedItem.relatedAssets[j].credit;
break
}
}
}
if (feedItem.stills) {
var still=feedItem.stills.stillLarge || feedItem.stills.videoSmall || feedItem.stills.thumbStandard;
if (still) {
thumbnail = still;
thumbnail.altText = feedItem.caption;
thumbnail.attribution = feedItem.credit
}
}
var snippet=feedItem.summary || feedItem.caption || "";
var videoEncoding=null;
if (feedItem.encodings) {
videoEncoding = feedItem.encodings.video_xxxl_hb_mm || feedItem.encodings.video_xl_bb_mm || feedItem.encodings.video_l_3g_mob || feedItem.encodings.video_xs_2g_mob
}
var byLine;
var publishTime;
if (feedItem.type === "video") {
byLine = feedItem.credit;
publishTime = NYTJS.Formatter.instance.formatTime(feedItem.pubDate, NYTJS.Formatter.videoFormat)
}
else {
byLine = NewsJS.Utilities.stripHTML(feedItem.byline) || "";
publishTime = feedItem.showTimestamp !== false ? NYTJS.Formatter.instance.formatTime(feedItem.updatedDate, NYTJS.Formatter.tileFormat) : ""
}
var access=this._getAccess(feedItem, feedInfo, feedType);
feedItem.newsClusterItem = {
articleUrl: feedItem.url, articleURL: feedItem.url, shareURL: feedItem.tinyUrl, parentClass: NYTJS.Formatter.instance.getTimeClass(now, feedItem.updatedDate), publishTime: publishTime, publishTimeRaw: feedItem.pubDate, snippet: snippet, source: byLine, sourceImageUrl: "", title: feedItem.title + (access !== "anonymous" ? "<div class=\"lockIcon\"></div>" : ""), byline: byLine, thumbnail: thumbnail, imageAttribution: thumbnail ? thumbnail.attribution : null, kicker: feedType !== "blog" ? feedItem.kicker : null, video: videoEncoding, articleId: feedItem.url, articleGuid: feedItem.id, type: feedItem.type, access: access, articleIndex: i + 1, feedType: feedType, feedIdentifierValue: feedIdentifierValue, articleList: guidList, articleid: feedItem.url, contentid: feedItem.url
};
articles.push(feedItem)
}
articles.originalFeedCount = originalFeedCount;
return articles
}, _getAccess: function _getAccess(feedItem, feedInfo, feedType) {
var access=feedInfo && feedInfo.sectionInfo && feedInfo.sectionInfo.access ? feedInfo.sectionInfo.access : "unknown";
if (feedType === "blog") {
access = "subscribed"
}
if (feedType === "readinglist") {
access = "anonymous"
}
if (feedItem.type === "video" && access === "unknown") {
access = "anonymous"
}
if (access === "unknown") {
access = "subscribed"
}
return access
}, articleBylineDisallowList: [], photoCreditAllowList: [], photoCreditDisallowList: [], photoSectionAllowList: [], photoSectionDisallowList: [], acronymsSet: {}, _populateSet: function _populateSet(input, listName) {
var i=0,
list=null;
list = CommonJS.Partners.Config.getConfig(partner, listName, []);
for (i = 0; i < list.size; i++) {
input[list[i].value] = true
}
}, _populateList: function _populateList(input, listName) {
var i=0,
list=null;
list = CommonJS.Partners.Config.getConfig(partner, listName, []);
for (i = 0; i < list.size; i++) {
input.push(list[i].value)
}
}
})
});
WinJS.Namespace.define("NYTJS.NewsCluster", {
BlogsListProvider: WinJS.Class.define(function(blogsList, title) {
this._blogsList = blogsList;
this.articles = null;
this._partner = partner;
this.title = title || PlatformJS.Services.resourceLoader.getString("/nyt/blogs")
}, {
_blogsList: null, title: null, articles: null, initializeAsync: function initializeAsync() {
return WinJS.Promise.wrap({})
}, queryAsync: function queryAsync() {
var that=this;
this.articles = [];
for (var i=0; i < this._blogsList.length; i++) {
var blog=this._blogsList[i];
if (blog) {
that.articles.push({
articleUrl: "blog", title: blog.title, sourceImageUrl: "", byline: "", source: "", snippet: blog.blogDescriptions ? blog.blogDescriptions.description : "", publishTime: "", type: "pano", templateClass: "NYTBlog", thumbnail: blog.blogDescriptions && blog.blogDescriptions.thumbnails && blog.blogDescriptions.thumbnails.thumb75 ? {
url: blog.blogDescriptions.thumbnails.thumb75, width: 75, height: 75
} : "", state: {
feedType: "blog", feedIdentifierValue: blog.blogName, theme: partner
}
})
}
}
return WinJS.Promise.wrap({
native: true, newsItems: that.articles
})
}
}, {createBlogsCluster: function createBlogsCluster(title, provider, itemclick) {
return {
clusterKey: title, clusterTitle: title, clusterContent: {
contentControl: "CommonJS.News.EntityCluster", contentOptions: {
mode: CommonJS.News.ClusterMode.dynamic, onitemclick: itemclick, configKey: "EntityClusterNYTConfig", configObject: CommonJS.News.EntityClusterConfig.NYT, provider: provider, alignBottom: true, marginDistance: 4, marginWidth: 8, theme: "newsAppTheme"
}
}
}
}}), Provider: WinJS.Class.derive(NewsJS.Partners.NewsClusterProvider, function nytjs_cluster_provider(categoryInfo, title, maxArticles, onsuccess, onerror, isPrimaryCluster) {
this._articleManager = NYTJS.ArticleManager.instance;
this.isPrimaryCluster = isPrimaryCluster;
this._partner = partner;
NewsJS.Partners.NewsClusterProvider.call(this, categoryInfo, title, maxArticles, onsuccess, onerror)
}, {
isPrimaryCluster: null, selectTemplateClass: function selectTemplateClass(index, item) {
var thumbnail=item.newsClusterItem.thumbnail;
var aspectRatio=0;
if (item.newsClusterItem.type === "video") {
item.newsClusterItem.templateClass = "NYTVideo"
}
else if (item.newsClusterItem.type === "slideshow") {
item.newsClusterItem.templateClass = "NYTPhoto"
}
else if (this.categoryInfo.sectionName === "mostemailed") {
item.newsClusterItem.templateClass = "NYTMostEmailed"
}
else {
if (this.isPrimaryCluster) {
if (index < 1) {
if (thumbnail && thumbnail.width && thumbnail.height) {
aspectRatio = thumbnail.width / thumbnail.height;
if (aspectRatio <= 1.6775 && aspectRatio >= 1.33 && thumbnail.height >= 400 && thumbnail.width >= 610) {
item.newsClusterItem.templateClass = "NYTLead"
}
else {
item.newsClusterItem.templateClass = "NYTLeadNoImage"
}
}
else {
item.newsClusterItem.templateClass = "NYTLeadNoImage"
}
}
else {
if (thumbnail && thumbnail.width && thumbnail.height) {
aspectRatio = thumbnail.width / thumbnail.height;
if (aspectRatio >= 1.35) {
item.newsClusterItem.templateClass = "NYTTallLandscapeWidePrimary"
}
else if (aspectRatio < 1.35 && aspectRatio >= 1.1) {
item.newsClusterItem.templateClass = "NYTTallLandscapePrimary"
}
else if (aspectRatio < 1.1 && aspectRatio > 0.9) {
item.newsClusterItem.templateClass = "NYTTallSquarePrimary"
}
else if (aspectRatio <= 0.9) {
item.newsClusterItem.templateClass = "NYTTallPortraitPrimary"
}
}
else {
item.newsClusterItem.templateClass = "NYTRegular"
}
}
}
else {
if (this.categoryInfo.sectionName === "opinion") {
item.newsClusterItem.templateClass = "NYTRegularNoImage"
}
else {
if (thumbnail && thumbnail.width && thumbnail.height) {
aspectRatio = thumbnail.width / thumbnail.height;
if (aspectRatio >= 1.35) {
item.newsClusterItem.templateClass = "NYTTallLandscapeWide"
}
else if (aspectRatio < 1.35 && aspectRatio >= 1.1) {
item.newsClusterItem.templateClass = "NYTTallLandscape"
}
else if (aspectRatio < 1.1 && aspectRatio > 0.9) {
item.newsClusterItem.templateClass = "NYTTallSquare"
}
else if (aspectRatio <= 0.9) {
item.newsClusterItem.templateClass = "NYTTallPortrait"
}
}
else {
item.newsClusterItem.templateClass = "NYTRegular"
}
}
}
}
return item.newsClusterItem
}
})
});
WinJS.Namespace.define("NYTJS", {BasePanoPage: WinJS.Class.derive(NewsJS.BasePartnerPano, function nytBasePanoPage_ctor(state) {
if (!PlatformJS.Ads.Partners.AdsManager.adFormatters[partner]) {
PlatformJS.Ads.Partners.AdsManager.adFormatters[partner] = new NYTJS.Ads.AdFormatter
}
var that=this;
this._partner = partner;
this._subscribeButton = null;
NewsJS.BasePartnerPano.call(this, state);
this._paywallProviderPromise = DynamicPanoJS.createPaywallProviderPromise(this._state.dynamicInfo.instrumentationId, this._state.authInfo);
this.setupPage()
}, {
_subscribeButton: null, _paywallProviderPromise: null, dispose: function dispose() {
NewsJS.BasePartnerPano.prototype.dispose.call(this)
}, onPlayVideo: function onPlayVideo(articleURL, feedIdentifierValue, feedType) {
NYTJS.Instrumentation.instance.instrumentVideoPlayStart(articleURL, feedIdentifierValue, feedType)
}, getValidActions: function getValidActions() {
var defaultAction={
icon: {
type: "image", url: "/nytshared/images/NYT_black_t-bg.svg"
}, text: CommonJS.Partners.Config.getConfig(partner, "ArticleDefaultMessage", PlatformJS.Services.resourceLoader.getString("/nyt/thenyt")), textSize: "small"
};
var subscribeAction={
icon: {
type: "glyph", className: "subscribe"
}, textHeader: CommonJS.Partners.Config.getConfig(partner, "ArticleHeaderSubscriptionMessage", PlatformJS.Services.resourceLoader.getString("/nyt/ArticleHeaderSubscriptionMessage")), text: CommonJS.Partners.Config.getConfig(partner, "ArticleSubscriptionMessage", PlatformJS.Services.resourceLoader.getString("/nyt/ArticleSubscriptionMessage")), textSize: "small", customized: true
};
var downloadAction={
icon: {
type: "image", url: "/nytshared/images/NYT_black_t-bg.svg"
}, textHeader: CommonJS.Partners.Config.getConfig(partner, "ArticleHeaderDownloadMessage", PlatformJS.Services.resourceLoader.getString("/nyt/ArticleHeaderDownloadMessage")), text: CommonJS.Partners.Config.getConfig(partner, "ArticleDownloadMessage", PlatformJS.Services.resourceLoader.getString("/nyt/ArticleDownloadMessage")), textSize: "small", customized: true
};
if (NewsJS.Partners.Config.isPartnerApp) {
return {
defaultAction: defaultAction, subscribeAction: subscribeAction
}
}
else {
return {
subscribeAction: subscribeAction, downloadAction: downloadAction
}
}
}, getActionsHandlerType: function getActionsHandlerType() {
return "NYTJS.ArticleReader.NYTArticleActionsHandler"
}, getActionKeys: function getActionKeys() {
if (NewsJS.Partners.Config.isPartnerApp) {
return ["defaultAction", "subscribeAction"]
}
else {
return ["subscribeAction", "downloadAction"]
}
}, onManualRefreshButtonClick: function onManualRefreshButtonClick() {
NYTJS.Instrumentation.instance.instrumentManualRefresh()
}, setupPage: function setupPage() {
var that=this;
if (this._paywallProviderPromise) {
this._paywallProviderPromise.done(function(paywallProvider) {
var instrumentationId=that._state.dynamicInfo.instrumentationId;
var refresh=function() {
that._sortedDataSource = null;
that._refreshPage()
};
var dynamicPanoAccent=document.querySelector(".dynamicPanoAccent");
var dynamicPanoAccentColor=dynamicPanoAccent ? window.getComputedStyle(dynamicPanoAccent).backgroundColor : null;
CommonJS.Partners.Auth.defaultSettings.accentColor = dynamicPanoAccentColor;
var panoramaFragmentElement=document.querySelector(".nytPano");
DynamicPanoJS.setupLoginButton(paywallProvider, refresh, instrumentationId);
DynamicPanoJS.setupSubscribeButton(paywallProvider, refresh, instrumentationId, dynamicPanoAccentColor, panoramaFragmentElement);
var titleLogoElement=document.querySelector(".platformMainContent .immersiveHeaderTitle");
var paywallSubscribeElement=document.getElementById("subscribeButton");
if (paywallSubscribeElement && titleLogoElement) {
paywallSubscribeElement.hidden = false;
var logoContent=titleLogoElement.firstElementChild || titleLogoElement;
var logoBounds=logoContent.getBoundingClientRect();
var subscribeBounds=paywallSubscribeElement.getBoundingClientRect();
var overlap=subscribeBounds.left < (logoBounds.left + logoBounds.width);
paywallSubscribeElement.hidden = overlap
}
})
}
}, _refreshPage: function _refreshPage(showToast) {
if (!this.checkOffline(!showToast)) {
this._offlineData = null;
var panoControl=PlatformJS.Utilities.getControl("news_Panorama");
if (panoControl) {
panoControl.panoramaState = null
}
this.loadPageData(true);
this._resetForSnap()
}
CommonJS.dismissAllEdgies();
this.progressType = CommonJS.Progress.centerProgressType;
NewsJS.Utilities.disableButton("refreshButton", false);
CommonJS.Progress.hideProgress(this.progressType)
}
})});
WinJS.Namespace.define("NYTJS.ArticleReader", {NYTArticleActionsHandler: WinJS.Class.define(function nytArticlesActionsHandler_ctor(){}, {onActionInvoked: function onActionInvoked(event) {
var data=event.data;
var actionKey=data.actionKey;
switch (actionKey) {
case"defaultAction":
break;
case"subscribeAction":
NYTJS.Auth.instance.subscribe(NYTJS.Auth.instance.getCampaignCode("EOA"));
break;
case"downloadAction":
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(data.impressionNavMethod);
NewsJS.BasePartnerPano.launchPartnerApp(partner);
break
}
}})});
WinJS.Namespace.define("NYTJS.SlideShow", {
Page: WinJS.Class.derive(NewsJS.Partners.SlideShowPage, function nyt_slideshowpage_ctor(state) {
this.partner = partner;
NewsJS.Partners.SlideShowPage.call(this, state);
var url=state.providerConfiguration.url ? state.providerConfiguration.url : state.providerConfiguration.articleId;
var sectionName=state.providerConfiguration.feedIdentifierValue ? state.providerConfiguration.feedIdentifierValue : state.providerConfiguration.sectionDisplayName;
var slideShowStyle=state.providerConfiguration.url ? "InLine" : "Slideshow Section"
}, {}), Provider: WinJS.Class.define(function(articleInfo) {
this.articleInfo = articleInfo
}, {
articleInfo: null, initializeAsync: function initializeAsync(config) {
return WinJS.Promise.wrap({})
}, queryAsync: function queryAsync() {
var that=this,
promise=null;
if (that.articleInfo.slides) {
promise = WinJS.Promise.wrap(that.articleInfo)
}
if (promise) {
return promise.then(function(articleData) {
var slides=[];
slides.instrumentationId = CommonJS.Partners.Config.getConfig(partner, "Instrumentation", {}).getString("InstrumentationId");
for (var i=0; i < articleData.slides.length; i++) {
var slide=articleData.slides[i];
if (slide.crops) {
if (NYTJS.ArticleManager.isImageAllowed(slide, null)) {
slides.push({
thumbnail: {
url: NYTJS.ArticleManager.getCrop(slide.crops, false).url, altText: slide.caption
}, altText: slide.caption, attribution: slide.credit, caption: slide.caption, desc: slide.caption, image: NYTJS.ArticleManager.getCrop(slide.crops, true), title: ""
})
}
}
}
return WinJS.Promise.wrap({
title: articleData.title, desc: articleData.summary, byline: "", version: 1, slides: slides
})
})
}
}
})
});
WinJS.Namespace.define("NYTJS.ArticleReader", {
Page: WinJS.Class.derive(NewsJS.NewsArticleReaderPage, function nytjs_articlereader_page(state) {
this.disableSaveArticle = state.disableSaveArticle;
this.partner = partner;
this._deletedArticles = {};
if (!PlatformJS.Ads.Partners.AdsManager.adFormatters[partner]) {
PlatformJS.Ads.Partners.AdsManager.adFormatters[partner] = new NYTJS.Ads.AdFormatter
}
NewsJS.NewsArticleReaderPage.call(this, state);
var that=this;
this._articleChanged = function(event) {
that._setupSaveButtonState()
};
this._articleManager.addEventListener("articlechanged", this._articleChanged)
}, {
handleLoginStateChange: function handleLoginStateChange(isLoggedIn) {
if (this._state.originatingFeed === "readinglist" && !isLoggedIn) {
this.goBack()
}
}, _deletedArticles: {}, updateUX: function updateUX(isAd) {
var that=this;
if (this._paywallProviderPromise) {
this._paywallProviderPromise.then(function(paywallProvider) {
if (paywallProvider.currentLoginStatus.loggedIn) {
var articleManager=that._articleManager;
var articleId=articleManager.currentArticleId;
if (that._deleteButton && that._saveButton) {
if (that._deletedArticles[articleId]) {
WinJS.Utilities.addClass(that._deleteButton.element, "platformHide");
WinJS.Utilities.removeClass(that._saveButton.element, "platformHide")
}
else {
if (!isAd) {
WinJS.Utilities.removeClass(that._deleteButton.element, "platformHide");
WinJS.Utilities.addClass(that._saveButton.element, "platformHide")
}
else {
WinJS.Utilities.addClass(that._deleteButton.element, "platformHide");
WinJS.Utilities.addClass(that._saveButton.element, "platformHide")
}
}
}
}
})
}
}, dispose: function dispose() {
NewsJS.NewsArticleReaderPage.prototype.dispose.call(this);
if (this._saveButton) {
this._saveButton.onclick = null;
this._saveButton = null
}
if (this._deleteButton) {
this._deleteButton.onclick = null;
this._deleteButton = null
}
this._disposed = true
}, _deleteButton: null, _setupSaveButtonState: function _setupSaveButtonState() {
var that=this;
var articleManager=this._articleManager;
var metadata=articleManager.getCurrentArticleMetadata();
if (metadata && (metadata.webUrl || metadata.articleId)) {
NYTJS.SaveArticleManager.instance.getReadingListEntryAsync(metadata.webUrl || metadata.articleId, this._paywallProviderPromise, true).then(function(response) {
if (response && response.dataString) {
var result=JSON.parse(response.dataString);
if (result && result.assets && result.assets[0]) {
var isArticleActive=result.assets[0].state === "active";
if (isArticleActive && that._deleteButton && that._saveButton) {
WinJS.Utilities.removeClass(that._deleteButton.element, "platformHide");
WinJS.Utilities.addClass(that._saveButton.element, "platformHide")
}
else {
WinJS.Utilities.addClass(that._deleteButton.element, "platformHide");
WinJS.Utilities.removeClass(that._saveButton.element, "platformHide")
}
}
}
}, function(error){})
}
}, _setupBottomEdgy: function _setupBottomEdgy() {
if (this._bottomEdgy) {
return
}
NewsJS.NewsArticleReaderPage.prototype._setupBottomEdgy.call(this);
if (!this.disableSaveArticle && CommonJS.Partners.Config.getConfig(partner, "disableReadingList", "false") === "false") {
var saveButton=this._saveButton = new WinJS.UI.AppBarCommand(document.createElement("button"), {
icon: "\uE105", label: PlatformJS.Services.resourceLoader.getString("/partners/SaveArticle")
});
var deleteButton=this._deleteButton = new WinJS.UI.AppBarCommand(document.createElement("button"), {
icon: "\uE018", extraClass: "appexSymbol", label: PlatformJS.Services.resourceLoader.getString("/partners/RemoveArticle")
});
this._bottomEdgy.appBar.element.appendChild(deleteButton.element);
this._bottomEdgy.appBar.element.appendChild(saveButton.element);
WinJS.Utilities.addClass(this._deleteButton.element, "platformHide");
WinJS.Utilities.removeClass(this._saveButton.element, "platformHide");
this._bottomEdgy.appBar.disabled = false;
var that=this;
saveButton.onclick = function(event) {
var articleManager=that._articleManager;
var articleId=articleManager.currentArticleId;
var metadata=articleManager.getCurrentArticleMetadata();
if (metadata && metadata.webUrl) {
articleId = metadata.webUrl
}
CommonJS.dismissAllEdgies();
NYTJS.SaveArticleManager.instance.saveArticleAsync(articleId, that._paywallProviderPromise).then(function() {
if (that._disposed) {
return
}
WinJS.Utilities.removeClass(that._deleteButton.element, "platformHide");
WinJS.Utilities.addClass(that._saveButton.element, "platformHide");
NewsJS.Utilities.showToast(PlatformJS.Services.resourceLoader.getString("/partners/saveSuccessful"));
if (that._state.originatingFeed === "readinglist") {
that._deletedArticles[articleId] = null
}
}, function(error) {
if (that._disposed) {
return
}
if (error === CommonJS.Partners.Auth.BaseAuth.notLoggedInError) {
var message=PlatformJS.Services.resourceLoader.getString("/nyt/LoginToSaveArticles"),
buttonLabel=PlatformJS.Services.resourceLoader.getString("/nyt/signInLabel"),
messageBar=new CommonJS.MessageBar(message);
messageBar.addButton(buttonLabel, function() {
messageBar.hide();
if (that._paywallProviderPromise) {
that._paywallProviderPromise.then(function(paywallProvider) {
var paywallControl=CommonJS.Partners.Auth.PaywallControlFactory.createPaywallControl(paywallProvider);
paywallControl.loginAsync().then(function(response) {
if (response.success) {
DynamicPanoJS.forceRefreshPano = true
}
var loggedIn=paywallProvider.currentLoginStatus.loggedIn;
var appBar=that._bottomEdgy.appBar.element;
var loginButton=appBar.querySelector("#loginButton");
if (loginButton) {
loginButton.hidden = loggedIn
}
var logoutButton=appBar.querySelector("#logoutButton");
if (logoutButton) {
logoutButton.hidden = !loggedIn
}
}, function paywallError(e){})
})
}
});
messageBar.addButton(PlatformJS.Services.resourceLoader.getString("/partners/Dismiss"), function() {
messageBar.hide()
});
messageBar.show()
}
else {
NewsJS.Utilities.showToast(PlatformJS.Services.resourceLoader.getString("/partners/saveFailed"))
}
})
};
deleteButton.onclick = function() {
var articleManager=that._articleManager;
var articleId=articleManager.currentArticleId;
var metadata=articleManager.getCurrentArticleMetadata();
if (metadata && metadata.webUrl) {
articleId = metadata.webUrl
}
CommonJS.dismissAllEdgies();
NYTJS.SaveArticleManager.instance.archiveArticleAsync(articleId, that._paywallProviderPromise).then(function() {
if (that._disposed) {
return
}
that._deletedArticles[articleId] = true;
NewsJS.Utilities.showToast(PlatformJS.Services.resourceLoader.getString("/partners/deleteSuccess"));
WinJS.Utilities.addClass(that._deleteButton.element, "platformHide");
WinJS.Utilities.removeClass(that._saveButton.element, "platformHide")
}, function(error) {
if (that._disposed) {
return
}
NewsJS.Utilities.showToast(PlatformJS.Services.resourceLoader.getString("/partners/deleteFailed"))
})
}
}
}, onShareRequest: function onShareRequest(articleData) {
NewsJS.Partners.BaseProcessListener.prototype.onShareRequest.call(this)
}
}), Provider: WinJS.Class.derive(NewsJS.Partners.ArticleReaderProvider, function nytjs_articlereader_provider_ctor(state) {
this.articleManager = NYTJS.ArticleManager.instance;
this.partner = partner;
NewsJS.Partners.ArticleReaderProvider.call(this, state)
}, {
_processContentBlock: function _processContentBlock(p) {
var model=AppEx.Common.ArticleReader.Model,
contentBlock=new model.Block.ContentBlock,
attributes=contentBlock.attributes = new model.BlockAttributes.ContentAttributes;
attributes.content = p.outerHTML;
return contentBlock
}, _createImageDescriptor: function _createImageDescriptor(imageData, asset) {
var model=AppEx.Common.ArticleReader.Model;
var image=new model.ImageDescriptor;
if (asset.caption) {
image.attribution = asset.credit ? "| " + asset.credit : ""
}
else {
image.attribution = asset.credit ? asset.credit : ""
}
image.caption = asset.caption ? NewsJS.Utilities.stripHTML(asset.caption) : "";
image.altText = image.attribution;
var resource=new model.ImageResourceDescriptor;
resource.height = imageData.height;
resource.width = imageData.width;
var maxHeight=600;
if (imageData.height > maxHeight) {
var scaleRatio=maxHeight / imageData.height;
resource.height *= scaleRatio;
resource.width *= scaleRatio
}
resource.name = "original";
resource.url = imageData.url;
image.images = [resource];
return image
}, _processImageBlock: function _processImageBlock(asset, state, title) {
var model=AppEx.Common.ArticleReader.Model,
that=this;
if (NYTJS.ArticleManager.hasLargeCrop(asset.crops) && !state.haveArticleSpan) {
var crop=NYTJS.ArticleManager.getCrop(asset.crops, true);
if (this._validateTitleImage(crop)) {
var titleImage=new model.Block.TitleImageBlock;
titleImage.image = that._createImageDescriptor(crop, asset);
var resource=titleImage.image.images[0];
title.style = 2;
titleImage.locationHint = "";
titleImage.sizeHint = 2;
title.titleImage = titleImage;
state.haveArticleSpan = true;
return null
}
}
var imageData=NYTJS.ArticleManager.getInlineCrop(asset.crops),
imageBlock=new model.Block.InlineImageBlock,
attributes=new model.BlockAttributes.InlineImageAttributes,
image=null;
imageBlock.attributes = attributes;
attributes.image = image = that._createImageDescriptor(imageData, asset);
return imageBlock
}, _processVideoBlock: function _processVideoBlock(asset, state) {
var model=AppEx.Common.ArticleReader.Model,
that=this,
encodings=asset.encodings,
stills=asset.stills,
encoding=encodings.video_xxxl_hb_mm || encodings.video_xl_bb_mm || encodings.video_l_3g_mob || encodings.video_xs_2g_mob;
if (!stills || !encoding) {
return null
}
var poster=stills.stillLarge || stills.videoSmall || stills.thumbStandard,
videoBlock=new model.Block.InlineVideoBlock,
attributes=new model.BlockAttributes.InlineVideoAttributes,
video=new model.VideoDescriptor;
videoBlock.attributes = attributes;
attributes.video = video;
video.attribution = PlatformJS.Services.resourceLoader.getString("/nyt/VideoCaption").format(asset.title);
video.caption = PlatformJS.Services.resourceLoader.getString("/nyt/VideoCaption").format(asset.title);
video.height = poster.height;
video.width = poster.width;
video.videoSource = encoding.url;
video.posterUrl = poster.url;
if (asset.priority === 0 && !state.haveArticleSpan) {
attributes.sizeHint = 2;
state.haveArticleSpan = true;
state.haveMultimediaSpan = true
}
else {
attributes.sizeHint = 1
}
return videoBlock
}, feedType: null, feedIdentifierValue: null, fullfeed: null, initializeAsync: function initializeAsync(config) {
this.feedType = config.feedType;
this.feedIdentifierValue = config.feedIdentifierValue;
var promise=null,
that=this;
CommonJS.Progress.showProgress(CommonJS.Progress.centerProgressType);
if (this.feedType !== "readinglist") {
promise = NYTJS.ArticleManager.instance.getFullFeedAsync(this.feedType, this.feedIdentifierValue).then(function(fullfeed) {
CommonJS.Progress.hideProgress(CommonJS.Progress.centerProgressType);
that.fullfeed = that.sprinkleAds(fullfeed.fullfeed.filter(function(article) {
return article.type === "article" || article.type === "blog"
}));
that.categoryInfo = fullfeed.categoryInfo;
return WinJS.Promise.wrap()
})
}
else {
promise = NYTJS.SaveArticleManager.instance.getSavedArticlesAsync(Math.floor(config.articleIndex / 50) * 50, 50, false, true, config.paywallProviderPromise).then(function(fullfeed) {
CommonJS.Progress.hideProgress(CommonJS.Progress.centerProgressType);
that.fullfeed = that.sprinkleAds(fullfeed.filter(function(article) {
return article.type === "article" || article.type === "blog"
}));
return WinJS.Promise.wrap()
})
}
return promise
}, _sortAssets: function _sortAssets(assets) {
for (var i=0; i < assets.length; i++) {
if (assets[i].type === "video") {
assets[i].priority = 0
}
else if (assets[i].type === "slideshow") {
assets[i].priority = 0
}
else if (assets[i].type === "image" && NYTJS.ArticleManager.hasLargeCrop(assets[i].crops)) {
assets[i].priority = 1
}
else {
assets[i].priority = 2
}
}
return assets.sort(function(a, b) {
return a.priority - b.priority
})
}, _processSlideshow: function _processSlideshow(asset, state, articleData) {
var model=AppEx.Common.ArticleReader.Model,
that=this,
externalBlock=new model.Block.ExternalBlock,
attributes=externalBlock.attributes = new model.BlockAttributes.ExternalAttributes;
attributes.controlType = "NewsJS.SlideShowEntryBlock";
var options={
articleData: asset, providerType: "NYTJS.SlideShow.Provider", theme: partner, parentArticle: {
id: articleData.id, url: articleData.url, tinyUrl: articleData.tinyUrl
}, slideShowPage: "NYTJS.SlideShow.Page"
};
var thumbnail=null;
var slide=null;
var slideShowCount=0;
for (var i=0; i < asset.slides.length; i++) {
if (NYTJS.ArticleManager.isImageAllowed(asset.slides[i])) {
slideShowCount++;
if (!slide) {
slide = asset.slides[i];
if (NewsJS.Partners.Config.isPartnerApp) {
break
}
}
}
}
if (!slide) {
return null
}
var minimumSlideShowCount=CommonJS.Partners.Config.getConfig(partner, "MinimumSlideShowCount", 0);
if (!NewsJS.Partners.Config.isPartnerApp && slideShowCount < minimumSlideShowCount && asset.slides.length !== slideShowCount) {
return null
}
if (!state.haveArticleSpan) {
attributes.placement = "Top";
state.haveArticleSpan = true;
state.haveMultimediaSpan = true;
thumbnail = options.thumbnail = NYTJS.ArticleManager.getCrop(slide.crops, true)
}
else {
attributes.placement = "inline";
thumbnail = options.thumbnail = NYTJS.ArticleManager.getInlineCrop(slide.crops, true)
}
if (thumbnail) {
thumbnail.altText = PlatformJS.Services.resourceLoader.getString("/nyt/SlideshowCaption").format(asset.title);
thumbnail.attribution = thumbnail.altText;
attributes.maxHeight = options.thumbnail.height;
attributes.maxWidth = options.thumbnail.width;
attributes.controlOptionsSerialized = JSON.stringify(options);
return externalBlock
}
else {
return null
}
}, _processTitleBlock: function _processTitleBlock(articleData) {
var model=AppEx.Common.ArticleReader.Model,
that=this,
title=new model.Title,
publisher=new model.SourceDescriptor,
favicon=new model.ImageResourceDescriptor;
title.byline = NewsJS.Utilities.stripHTML(articleData.byline) || "";
title.date = NYTJS.Formatter.instance.formatTime(articleData.updatedDate, NYTJS.Formatter.articleFormat) || "";
title.headline = articleData.title || "";
title.allowAds = true;
title.pgCode = "";
title.author = title.byline || "";
title.kicker = articleData.kicker || "";
title.style = 1;
if (!NewsJS.Partners.Config.isPartnerApp) {
title.publisher = publisher;
publisher.name = PlatformJS.Services.resourceLoader.getString("/nyt/thenyt");
publisher.favicon = favicon;
favicon.height = 30;
favicon.width = 213;
favicon.url = "/nytshared/images/NYT_logo_long_black.svg";
favicon.name = publisher.name
}
return title
}, isArticleLocked: function isArticleLocked(articleId) {
if (this.categoryInfo && this.categoryInfo.sectionInfo) {
return this.categoryInfo.sectionInfo.access !== "anonymous"
}
else {
return false
}
}, isAd: function isAd(article) {
if (typeof article === "string") {
return this.getAdInfo(article) !== null
}
else if (article.type === "ad") {
return true
}
return false
}, getAdInfo: function getAdInfo(articleId) {
var article=NYTJS.ArticleManager.findArticle(this.fullfeed, articleId);
if (article && article.type === "ad") {
return article
}
else {
return null
}
}, getArticleAsync: function getArticleAsync(articleId) {
var that=this;
var dataPromise=null,
i=0;
if (this.fullfeed) {
var foundArticle=NYTJS.ArticleManager.findArticle(this.fullfeed, articleId);
if (foundArticle) {
dataPromise = WinJS.Promise.wrap(foundArticle);
if (this.isAd(foundArticle)) {
return dataPromise
}
}
}
if (!dataPromise) {
if (this.feedType === "readinglist") {
dataPromise = NYTJS.SaveArticleManager.instance.getArticleAsync(articleId)
}
else {
dataPromise = NYTJS.ArticleManager.instance.getArticleAsync(this.feedType, this.feedIdentifierValue, articleId)
}
}
return dataPromise.then(function(articleData) {
var model=AppEx.Common.ArticleReader.Model,
article=new model.Article,
title=null,
state={
haveArticleSpan: false, haveMultimediaSpan: false
};
article.title = title = that._processTitleBlock(articleData);
article.metadata = new model.ArticleInfo;
article.metadata.articleId = articleId;
article.metadata.adGroups = that.createArticleAds();
article.metadata.instrumentationId = CommonJS.Partners.Config.getConfig(partner, "Instrumentation", {}).getString("InstrumentationId");
if (articleData.nextArticleId) {
var nextArticle=null;
article.nextArticle = nextArticle = new model.ArticleInfo;
nextArticle.articleId = articleData.nextArticleId
}
if (articleData.previousArticleId) {
var previousArticle=null;
article.previousArticle = previousArticle = new model.ArticleInfo;
previousArticle.articleId = articleData.previousArticleId
}
var moreArticlesData=articleData.moreArticles;
if (moreArticlesData) {
var moreArticles=[];
for (var j=0, lenj=moreArticlesData.length; j < lenj; j++) {
var currentMoreArticle=moreArticlesData[j];
var moreArticle=new model.ArticleInfo;
moreArticle.articleId = currentMoreArticle.articleId;
moreArticle.headline = currentMoreArticle.headline;
moreArticles.push(moreArticle)
}
article.moreArticles = moreArticles
}
var assets=articleData.relatedAssets,
assetBlocks=[];
if (assets) {
assets = that._sortAssets(assets);
for (i = 0; i < assets.length; i++) {
if (assets[i].type === "image" && (NewsJS.Partners.Config.isPartnerApp || !NYTJS.ArticleManager.isInList(NYTJS.ArticleManager.photoSectionDisallowList, articleData.blog || articleData.section)) && NYTJS.ArticleManager.isImageAllowed(assets[i], articleData.blog || articleData.section)) {
var image=that._processImageBlock(assets[i], state, title);
if (image) {
assetBlocks.push(image)
}
}
else if (assets[i].type === "video") {
var video=that._processVideoBlock(assets[i], state);
if (video) {
assetBlocks.push(video)
}
}
else if (assets[i].type === "slideshow") {
var slideshow=that._processSlideshow(assets[i], state, articleData);
if (slideshow) {
assetBlocks.push(slideshow)
}
}
}
}
var parser=new DOMParser,
doc=parser.parseFromString(articleData.body, "text/html"),
div=doc.body.children,
paragraphs=div.length > 0 ? div[0].children : null,
contentBlocks=[];
if (paragraphs) {
for (i = 0; i < paragraphs.length; i++) {
var contentBlock=that._processContentBlock(paragraphs[i]);
if (contentBlock) {
contentBlocks.push(contentBlock)
}
}
}
if (articleData.tagline) {
var taglineBlock=new model.Block.ContentBlock,
attributes=taglineBlock.attributes = new model.BlockAttributes.ContentAttributes;
attributes.content = "<p><i>" + articleData.tagline + "</i></p>";
contentBlocks.push(taglineBlock)
}
that._sprinkleContent(article, contentBlocks, assetBlocks, state);
return WinJS.Promise.wrap(article)
})
}, getCacheId: function getCacheId() {
return "PlatformImageCache"
}
})
});
WinJS.Namespace.define("NYTJS.Ads", {AdFormatter: WinJS.Class.derive(PlatformJS.Ads.Partners.AdFormatter, function nytAdFormatter_ctor(){}, {getKeywordString: function getKeywordString(options) {
var page="",
adTags=[];
var isPartnerApp=NewsJS.Partners.Config.isPartnerApp;
if (options && options.section) {
page = (isPartnerApp ? "app" : "bing") + "/" + options.location + "/" + options.section;
adTags.push({
key: "NYTPage", value: page
});
if (options.position === "interstitial") {
if (options.orientation) {
adTags.push({
key: "NYTPos", value: "int_" + options.orientation
})
}
}
else {
adTags.push({
key: "NYTPos", value: options.position
})
}
}
return adTags
}})})
})()