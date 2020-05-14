/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
var ProviderBase=function(params, getAsyncImpl, getProxyImpl) {
var strategy=request,
operation;
function createOperation(args) {
return (operation = getAsyncImpl.call(params, args))
}
function request(args) {
return (strategy = proxy(createOperation(args || {})))()
}
function proxy(object) {
return function() {
return object
}
}
function resetStrategy() {
strategy = request
}
NewsApp.PageEvents.register("resuming", resetStrategy);
NewsApp.PageEvents.register("connectionchanging", resetStrategy);
NewsApp.PageEvents.register("refreshing", resetStrategy);
WinJS.Navigation.addEventListener("navigated", onNavigateAway);
function onNavigateAway(evt) {
WinJS.Navigation.removeEventListener("navigated", onNavigateAway);
cancelOperationAndResetStrategy()
}
function cancelOperationAndResetStrategy() {
if (operation && operation.cancel) {
operation.cancel()
}
resetStrategy()
}
return {
getProvider: getProxyImpl, request: function request(args) {
return strategy(args)
}, refresh: resetStrategy
}
};
WinJS.Namespace.define("NewsApp.Providers", {ProviderBase: ProviderBase})
})();
(function() {
"use strict";
var ResponseType={
cache: "cache", live: "live"
};
var events={
request: "request", get: "get", parse: "parse", execute: "execute", notify: "notify", wait: "wait", error: "error"
};
var states={
created: "created", tryIssueRequest: "tryissuerequest", waiting: "waiting", parsing: "parsing", pending: "pending", notify: "notify", error: "error", allStates: "*"
};
var stateMachineConfig=[{
name: events.request, from: states.created, to: states.tryIssueRequest
}, {
name: events.get, from: states.tryIssueRequest, to: states.waiting
}, {
name: events.parse, from: states.waiting, to: states.pending
}, {
name: events.parse, from: states.pending, to: states.pending
}, {
name: events.execute, from: states.pending, to: states.parsing
}, {
name: events.notify, from: states.parsing, to: states.notify
}, {
name: events.wait, from: states.notify, to: states.waiting
}, {
name: events.wait, from: states.error, to: states.waiting
}, {
name: events.error, from: states.allStates, to: states.error
}, ];
var ProxyBase=function(provider, selector, transformer, orchestrator) {
var completion,
progress,
error;
orchestrator = orchestrator || NewsApp.Orchestration.getOrchestrator();
var handlers={
oncreated: function oncreated(proxy){}, ontryissuerequest: function ontryissuerequest(proxy, args, allow) {
if (!allow && !PlatformJS.isPlatformInitialized) {
PlatformJS.startPlatformInitialization();
PlatformJS.platformInitializedPromise.then(function() {
proxy.get(args)
})
}
else if (!allow || PlatformJS.isPlatformInitialized) {
proxy.get(args)
}
else {
NewsApp.PageEvents.register("clrInitialized", function() {
proxy.get(args)
})
}
}, onwaiting: function onwaiting(proxy, args) {
provider.request(args).then(function(response) {
proxy.parse(response, ResponseType.live)
}, function(exception) {
proxy.error(exception)
}, function(cache) {
proxy.parse(cache, ResponseType.cache)
})
}, onpending: function onpending(proxy, response, responseType) {
this.handle = orchestrator.submit({
identifier: "parse (" + responseType + ")", execute: function execute() {
return proxy.execute(response, responseType)
}, getPriority: function getPriority() {
return 1
}
})
}, onexitpending: function onexitpending(proxy) {
if (this.handle) {
this.handle.cancel();
this.handle = null
}
}, onparsing: function onparsing(proxy, response, responseType) {
try {
var selection=selector(response),
transformed=transformer(selection);
proxy.notify(transformed, responseType)
}
catch(exception) {
proxy.error(exception, responseType)
}
}, onnotify: function onnotify(proxy, response, responseType) {
switch (responseType) {
case ResponseType.cache:
progress(response);
proxy.wait();
break;
case ResponseType.live:
default:
completion(response);
break
}
}, onerror: function onerror(proxy, exception, responseType) {
switch (responseType) {
case ResponseType.cache:
proxy.wait();
break;
case ResponseType.live:
default:
error(exception);
break
}
}
};
return {request: function request(args, allow) {
return new WinJS.Promise(function(c, e, p) {
completion = c;
progress = p;
error = e;
if (args && args.refresh) {
provider.refresh()
}
new NewsApp.StateMachine(stateMachineConfig, handlers, states.created).request(args, allow || false)
})
}}
};
WinJS.Namespace.define("NewsApp.Providers", {ProxyBase: ProxyBase})
})();
(function() {
"use strict";
function CreateProviderFactory(Type) {
var strategy=create;
function construct(type, args) {
function Ghost() {
return type.apply(this, args)
}
;
Ghost.prototype = type.prototype;
return new Ghost
}
function create(args) {
return (strategy = proxy(construct(Type, args))).apply(this, args)
}
function proxy(instance) {
return function() {
return instance.getProvider.apply(instance, Array.prototype.slice.call(arguments))
}
}
;
function resetStrategy() {
strategy = create
}
function onNavigateAway(evt) {
resetStrategy()
}
WinJS.Navigation.addEventListener("navigated", onNavigateAway);
return function() {
return strategy.apply(this, Array.prototype.slice.call(arguments))
}
}
WinJS.Namespace.define("NewsApp.Providers", {CreateProviderFactory: CreateProviderFactory})
})();
(function() {
"use strict";
function CreateProviderWithParametersFactory(Type, getHashImplementation) {
var dictionary={};
function construct(type, args) {
function Ghost() {
return type.apply(this, args)
}
;
Ghost.prototype = type.prototype;
return new Ghost
}
function create(hash, args) {
return (dictionary[hash] = proxy(construct(Type, args))).apply(this, args)
}
function proxy(instance) {
return function() {
return instance.getProvider.apply(instance, Array.prototype.slice.call(arguments))
}
}
;
function reset() {
dictionary = {}
}
function onNavigateAway(evt) {
reset()
}
WinJS.Navigation.addEventListener("navigated", onNavigateAway);
return function() {
var args=Array.prototype.slice.call(arguments),
hash=getHashImplementation.apply(this, args) || "default";
if (!dictionary[hash]) {
return create(hash, args)
}
else {
return dictionary[hash].apply(this, args)
}
}
}
WinJS.Namespace.define("NewsApp.Providers", {CreateProviderWithParametersFactory: CreateProviderWithParametersFactory})
})();
(function() {
"use strict";
WinJS.Namespace.define("NewsApp.Providers", {CreateGenericProvider: function CreateGenericProvider(getAsyncImpl, getProxyImpl) {
return function(params) {
return new NewsApp.Providers.ProviderBase(params, getAsyncImpl, getProxyImpl)
}
}})
})();
WinJS.Namespace.define("NewsApp.Utils", {SnappedProviderDecorator: WinJS.Class.define(function(provider, args) {
this._articles = null;
this._clusterArticles = null;
this._title = args.title;
this._groupData = args;
this.base = provider
}, {
articles: {get: function get() {
return this._articles
}}, clusterArticles: {get: function get() {
return this._clusterArticles
}}, groupData: {get: function get() {
return this._groupData
}}, title: {get: function get() {
return this._title
}}, initializeAsync: function initializeAsync() {
return WinJS.Promise.wrap(true)
}, queryAsync: function queryAsync() {
var that=this;
return this.base.request().then(function(results) {
that._articles = results ? results.newsItems : [];
that._clusterArticles = results ? results.clusterArticles : null;
return results
}, function(error) {
that._articles = [];
return null
})
}, request: function request() {
return this.base.request()
}
})});
(function() {
"use strict";
function createPartnerRequest(args) {
args.queryService = new PlatformJS.DataService.QueryService("CustomPanoFeed");
args.urlParams = PlatformJS.Collections.createStringDictionary();
args.urlParams["feedName"] = this.feedName;
if (this.css) {
var queryService=new PlatformJS.DataService.QueryService("CustomPanoCssFeed");
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams["url"] = this.css;
var options=new Platform.DataServices.QueryServiceOptions;
options.bypassCache = args.bypassCache;
options.useCompatDataModel = true;
queryService.downloadDataAsync(urlParams, null, null, options)
}
return createRequest.call(this, args, true)
}
function createCategoryRequest(args) {
var identifier=this.mini ? "MarketCMSTodayMinFeed" : "MarketCMSTodayFeed3";
args.queryService = new PlatformJS.DataService.QueryService(identifier);
args.urlParams = PlatformJS.Collections.createStringDictionary();
return createRequest.call(this, args)
}
function createInternationalRequest(args) {
this.market = this.market;
return createCategoryRequest.call(this, args)
}
function transformHeroClusterInHeroObject(cmsData) {
if (cmsData && cmsData.clusters) {
for (var i=0; i < cmsData.clusters.length; i++) {
var cluster=cmsData.clusters[i];
var isHeroCluster=cluster.entityList && cluster.entityList.collectionId && cluster.entityList.collectionId.toLowerCase() === "hero" && cluster.entityList.entities && cluster.entityList.entities.length > 0;
var isChinaHeroCluster=cluster.entityList && cluster.entityList.entities && cluster.entityList.entities.length > 0 && cluster.entityList.entities[0].entityType && cluster.entityList.entities[0].entityType.toLowerCase() === "hero";
if (isHeroCluster || isChinaHeroCluster) {
var heroContainer={
hero: cluster.entityList.entities[0], type: "Hero", lastModified: cluster.lastModified
};
cmsData.clusters.splice(i, 1);
cmsData.clusters.splice(0, 0, heroContainer);
break
}
}
}
return cmsData
}
function createRequest(args, lowercase) {
var queryService=args.queryService;
var urlParams=args.urlParams;
var options=new Platform.DataServices.QueryServiceOptions;
if (PlatformJS.isDebug && NewsJS.StateHandler.instance.isPreviewModeEnabled) {
urlParams["previewparams"] = "/" + PlatformJS.Services.appConfig.getString("CMSPreviewParam")
}
else {
urlParams["previewparams"] = ""
}
var marketParams=NewsJS.Globalization && NewsJS.Globalization.getMarketStringForEditorial ? NewsJS.Globalization.getMarketStringForEditorial() : null;
var marketParams=this.market || marketParams;
if (marketParams) {
urlParams["market"] = lowercase ? marketParams.toLowerCase() : marketParams
}
options.bypassCache = args.bypassCache;
options.useCompatDataModel = true;
options.localDataFile = NewsJS.Data.Bing.LOCAL_FRE_OFFLINE_DATA_FILE;
return new WinJS.Promise(function(complete, error, progress) {
var processResponse=function(response, handler) {
try {
var cmsData=transformHeroClusterInHeroObject(JSON.parse(response.dataString));
handler(cmsData)
}
catch(ex) {
error(ex)
}
};
queryService.downloadDataAsync(urlParams, null, null, options).then(function(response) {
processResponse(response, complete)
}, function(exception) {
if (NewsJS.Utilities.isBadHttpStatusCode(exception)) {
exception = new Error("DataError:ExpectedDataMissing:ResponseUnavailable")
}
error(exception)
}, function(cache) {
var response=cache.cachedResponse;
if (response) {
processResponse(response, progress)
}
})
})
}
function createProxy(args, orchestrator) {
var strategy=args.strategy,
category=args.categoryKey,
predicate,
transform;
switch (strategy) {
case"hero":
predicate = function(items) {
return items
};
transform = function(response) {
return transformHero(response, args)
};
break;
case"developingNews":
var filter=function(i) {
return i.type === "video"
},
binding=function(i) {
return NewsJS.Bindings.developingNewsTile(i)
};
predicate = function(items) {
return extractCategory(category, items)
};
transform = function(items) {
return transformCMSEntityList(items, filter, binding)
};
break;
case"AdsConfiguration":
predicate = function(response) {
return response ? response.adsData : null
};
transform = function(response) {
return response
};
break;
case"checkFRE":
predicate = extractHero;
transform = function(response) {
return response && response.hero && response.hero.isFREOffline ? true : false
};
break;
case"partner":
predicate = function(response) {
return extractSpecifiedCluster(response, 0)
};
transform = function(response) {
return transformCMSEntityList(response)
};
break;
case"international":
predicate = function(response) {
return extractInternationalCluster(response, 0)
};
transform = function(response) {
return transformInternationalCluster(response)
};
break;
case"topStories":
category = getTopStoriesCategory(args);
default:
predicate = function(items) {
return extractCategory(category, items)
};
transform = transformCMSEntityList;
break
}
return new NewsApp.Providers.ProxyBase(this, predicate, transform, orchestrator)
}
var CategoryProvider=NewsApp.Providers.CreateGenericProvider(createCategoryRequest, createProxy);
var PartnerProvider=NewsApp.Providers.CreateGenericProvider(createPartnerRequest, createProxy);
var InternationalProvider=NewsApp.Providers.CreateGenericProvider(createInternationalRequest, createProxy);
function getHashForCategoryParameters(args) {
return args.mini + args.market
}
function getHashForPartnerParameters(args) {
return args.feedName + args.market
}
function getHashForInternationalParameters(args) {
return args.mini + args.market
}
function getTopStoriesCategory(args) {
return args.market === "EN-US" ? "rt_US" : "topStories"
}
;
WinJS.Namespace.define("NewsApp.DataProviders.CMS", {
DataProvider: NewsApp.Providers.CreateProviderWithParametersFactory(CategoryProvider, getHashForCategoryParameters), PartnerProvider: NewsApp.Providers.CreateProviderWithParametersFactory(PartnerProvider, getHashForPartnerParameters), InternationalProvider: NewsApp.Providers.CreateProviderWithParametersFactory(InternationalProvider, getHashForInternationalParameters)
});
function extractHero(response) {
var items=response ? response.clusters : [];
for (var i=0, ilen=items.length; i < ilen; i++) {
var item=items[i];
if (item.hero) {
return item
}
else if (item && item.entityList && !item.entityList.collectionId && item.entityList.entities) {
var entities=item.entityList.entities;
for (var counter=0; counter < entities.length; counter++) {
if (entities[counter] && entities[counter].entityType && entities[counter].entityType.toLowerCase() === "hero") {
return {hero: entities[counter]}
}
}
}
}
return null
}
function isFREOffline(response) {
return response.clusters.length === 1 && response.clusters[0].hero && response.clusters[0].hero.isFREOffline ? true : false
}
function extractHeroAndTopStories(topStoriesCategory, items) {
var result={hero: extractHero(items)};
if (!isFREOffline(items)) {
result.topStories = extractCategory(topStoriesCategory, items)
}
return result
}
function extractInternationalCluster(response, clusterIndex) {
var response=transformHeroClusterInHeroObject(response);
var result={
hero: extractHero(response), topStories: extractSpecifiedCluster(response, clusterIndex)
};
return result
}
function extractSpecifiedCluster(response, clusterIndex) {
var clustersArrayLength=0;
if (!response || !response.clusters || !Array.isArray(response.clusters) || (clustersArrayLength = response.clusters.length) < clusterIndex + 1 || !response.clusters[clusterIndex]) {
throw new Error("DataError:ExpectedDataMissing:Response is null");
}
var cluster=response.clusters[clusterIndex];
if (clusterIndex === 0) {
while ((!cluster.entityList || !cluster.entityList.entities || cluster.entityList.entities.length === 0) && clustersArrayLength > clusterIndex + 1) {
cluster = response.clusters[++clusterIndex]
}
}
return cluster
}
function extractCategories(response) {
return response ? response.clusters : null
}
function extractCategory(identifier, response) {
if (!response || !response.clusters) {
throw new Error("DataError:ExpectedDataMissing:Response is null");
}
if (isFREOffline(response)) {
return {entityList: {
entities: [], type: "EntityList"
}}
}
var items=response.clusters;
for (var i=0, ilen=items.length; i < ilen; i++) {
var item=items[i];
if (item.entityList && item.entityList.collectionId === identifier) {
return item
}
}
throw new Error("DataError:ExpectedDataMissing:Category: " + identifier + " not found in response");
}
function transformHero(response, args) {
var transformed=CommonJS.Immersive.PlatformHeroControl.parseHeroContent(response, NewsJS.Bindings.resolveDestination);
if (!transformed) {
throw new Error("DataError:ExpectedDataMissing:Hero not found in response");
}
var clusterArticles=null;
if (isFREOffline(response)) {
var heroItem=response.clusters[0].hero;
if (!NewsJS.Utilities.ParamChecks.isNullOrEmpty(transformed.heroItems)) {
var content=transformed.heroItems[0];
var FREOfflineTitleResourceKey=heroItem.FREOfflineTitleResourceKey;
var FREOfflineSubtitleResourceKey=heroItem.FREOfflineSubtitleResourceKey;
if (content.headline) {
content.headline = content.headline.replace(FREOfflineTitleResourceKey, PlatformJS.Services.resourceLoader.getString(FREOfflineTitleResourceKey))
}
if (content.abstract) {
content.abstract = content.abstract.replace(FREOfflineSubtitleResourceKey, PlatformJS.Services.resourceLoader.getString(FREOfflineSubtitleResourceKey));
content.snippet = content.abstract
}
}
}
else {
var topStoriesResponse=extractCategory(getTopStoriesCategory(args), response);
if (topStoriesResponse) {
var transformedTopStories=transformCMSEntityList(topStoriesResponse, null, null, true);
if (transformedTopStories && transformedTopStories.clusterArticles && transformedTopStories.clusterArticles.articleInfos) {
var heroArticles=transformed.heroItems;
for (var i=0; i < heroArticles.length; i++) {
transformedTopStories.clusterArticles.articleInfos.unshift(NewsJS.Utilities.getArticleInfo(heroArticles[i]))
}
clusterArticles = transformedTopStories.clusterArticles
}
}
}
return _getTransformedHeroResult(transformed, clusterArticles, transformed.lastModified)
}
function transformInternationalHero(combinedResponse) {
var response=combinedResponse && combinedResponse.hero ? combinedResponse.hero : null;
var hero=response ? response.hero : null;
if (!hero || !hero.content) {
throw new Error("DataError:ExpectedDataMissing:Hero not found in response");
}
var lastModified=(response.lastModified && response.lastModified.utctime) ? response.lastModified.utctime : null;
var transformed=NewsJS.Bindings.convertCMSArticle(hero);
var clusterArticles=null;
var topStoriesResponse=combinedResponse.topStories;
if (topStoriesResponse) {
var transformedTopStories=transformCMSEntityList(topStoriesResponse, null, null, true);
if (transformedTopStories && transformedTopStories.clusterArticles && transformedTopStories.clusterArticles.articleInfos) {
transformedTopStories.clusterArticles.articleInfos.unshift(NewsJS.Utilities.getArticleInfo(transformed));
clusterArticles = transformedTopStories.clusterArticles
}
}
return _getTransformedHeroResult(transformed, clusterArticles, lastModified)
}
function _getTransformedHeroResult(transformedHero, clusterArticles, lastModified) {
return {
native: true, clusterArticles: clusterArticles, lastModified: lastModified, response: transformedHero, newsItems: [transformedHero]
}
}
function findSemanticZoomUrl(item) {
function worker(entity) {
var semanticZoomThumbnailUrl=null;
if (entity) {
var cmsImage;
if (entity.heroImage && entity.heroImage.image) {
cmsImage = entity.heroImage.image
}
else {
cmsImage = entity.image
}
if (cmsImage) {
if (cmsImage.images) {
for (var idx=0, idxLen=cmsImage.images.length; idx < idxLen; idx++) {
var img=cmsImage.images[idx];
if (img.url) {
var imgName=img.name && img.name.toLowerCase ? img.name.toLowerCase() : "";
if (imgName === "semanticzoom") {
semanticZoomThumbnailUrl = img.url;
break
}
}
}
}
}
}
return semanticZoomThumbnailUrl
}
if (item.hero) {
return worker(item.hero)
}
else if (item.entityList && item.entityList.entities) {
for (var i=0, ilen=item.entityList.entities.length; i < ilen; i++) {
var result=worker(item.entityList.entities[i]);
if (result) {
return result
}
}
return null
}
}
function transformDataToCategoryList(items) {
var results=[];
for (var i=0, ilen=items ? items.length : 0; i < ilen; i++) {
var item=items[i],
semanticZoomThumbnailUrl=findSemanticZoomUrl(item);
if (item.entityList && item.entityList.collectionId) {
results.push({
categoryKey: item.entityList.collectionId, categoryName: item.entityList.categoryName, semanticZoomThumbnailUrl: semanticZoomThumbnailUrl
})
}
else if (item.hero) {
if (item.hero.isFREOffline) {
results.push({
isFREOffline: true, categoryKey: "hero", semanticZoomThumbnailUrl: semanticZoomThumbnailUrl
})
}
else {
results.push({
categoryKey: "hero", semanticZoomThumbnailUrl: semanticZoomThumbnailUrl
})
}
}
}
return results
}
function transformInternationalCluster(response, filter, binding, skipNewsItems) {
var results=transformCMSEntityList(response.topStories, filter, binding, skipNewsItems);
if (results) {
if (!results.newsItems) {
results.newsItems = []
}
try {
var heroItem=transformInternationalHero(response);
if (heroItem && heroItem.newsItems && heroItem.newsItems.length > 0) {
results.newsItems.unshift(heroItem.newsItems[0])
}
}
catch(e) {}
}
return results
}
function transformCMSEntityList(response, filter, binding, skipNewsItems) {
var newsItems=[],
articleInfos=[],
itemsLen=0,
lastModified=(response.lastModified && response.lastModified.utctime) ? response.lastModified.utctime : null;
if (response && response.entityList) {
var items=response.entityList;
itemsLen = Math.min(items.entities.length, PlatformJS.Services.appConfig.getInt32("MaxCMSArticles"));
filter = filter || function() {
return false
};
binding = binding || function(article) {
return NewsJS.Bindings.convertCMSArticle(article)
};
for (var i=0; i < itemsLen; i++) {
var original=items.entities[i],
transformed=binding(original);
if (transformed.templateClass === "AP_nonbreaking" || transformed.templateClass === "AP_breaking") {
delete transformed.templateClass
}
if (!filter(transformed)) {
if (transformed && transformed.type === "article") {
var articleInfo=NewsJS.Utilities.getArticleInfo(transformed);
if (articleInfo) {
articleInfos.push(articleInfo)
}
}
if (!skipNewsItems) {
newsItems.push(transformed)
}
}
}
}
return {
native: true, clusterArticles: {articleInfos: articleInfos}, lastModified: lastModified, newsItems: newsItems
}
}
})();
(function() {
"use strict";
function createRequest(args) {
return NewsJS.Data.Bing.getNewsBrowse(20, null, false, null, NewsJS.Telemetry.Search.FormCode.category).then(function(val) {
var newsItems=val ? PlatformJS.Utilities.convertManageToJSON(val.data.dataObject.newsResults) : [],
newsResults={};
for (var idx=0, len=newsItems.length; idx < len; idx++) {
var article=newsItems[idx];
if (!newsResults[article.categoryKey]) {
newsResults[article.categoryKey] = []
}
newsResults[article.categoryKey].push(article)
}
return {
localNews: val ? PlatformJS.Utilities.convertManageToJSON(val.data.dataObject.localNews) : [], newsResults: newsResults, topStories: val ? PlatformJS.Utilities.convertManageToJSON(val.data.dataObject.topStories) : [], lastFetchedTime: val && val.data && val.data.lastUpdateTime ? val.data.lastUpdateTime.getTime() : null
}
})
}
var Provider=NewsApp.Providers.CreateGenericProvider(createRequest, createProxy);
WinJS.Namespace.define("NewsApp.DataProviders.BDI", {DataProvider: NewsApp.Providers.CreateProviderFactory(Provider)});
function extractEntitiesFromResponse(categoryKey, data) {
return data.newsResults[categoryKey]
}
function transformData(title, items) {
var transformedData={
native: true, clusterInfo: {
title: title, thumbnail: {url: ""}, moduleInfo: {
height: "140px", width: "290px", fragmentPath: "/html/templates.html", templateId: "homeSemanticTileNoImage"
}
}, newsItems: items
};
return transformedData
}
function createProxy(args, LGS) {
var strategy=args.strategy,
category=args.categoryKey,
predicate=function(data) {
return extractEntitiesFromResponse(category, data)
},
transform=function(items) {
return transformData(args.title, items)
};
return new NewsApp.Providers.ProxyBase(this, predicate, transform, LGS)
}
})();
(function() {
"use strict";
function createTopicRequest(args) {
var that=this;
return createRequest.call(this, args, NewsJS.Data.Bing.getNewsSearch(this.query, 0, 20, false, args.bypassCache, null, NewsJS.Telemetry.Search.FormCode.topicCluster)).then(function(result) {
NewsJS.Telemetry.Search.recordSearch(that.query, result.newsItems ? result.newsItems.length : 0, NewsJS.Telemetry.Search.Origin.topicCluster);
return result
})
}
function createAlgoSourceRequest(args) {
var sourcesConfig=PlatformJS.Services.appConfig.getDictionary("SourcesConfig");
var sortByDate=sourcesConfig.getBool("SortArticlesByDateOnSourcePage");
return createRequest.call(this, args, NewsJS.Data.Bing.getNewsBrowseForCategory(null, 0, 20, this.domain, sortByDate, args.bypassCache, this.market.toLowerCase(), null, NewsJS.Telemetry.Search.FormCode.category))
}
function createRequest(args, dataPromise) {
return dataPromise.then(function(val) {
var newsItems=val ? PlatformJS.Utilities.convertManageToJSON(val.data.dataObject.newsResults) : [];
return {
newsItems: newsItems, lastModified: val && val.data && val.data.lastUpdateTime ? val.data.lastUpdateTime.getTime() : null
}
})
}
function createCustomRSSSourceRequest(args) {
var feedUrls=this.feed ? this.feed.split(',') : [];
var rssSourceData=new CommonJS.NewsRSS.NewsProvider({
feed: feedUrls[0], sourceName: this.sourceName, showProgress: false, disableFavIcon: true, bypassCache: args.bypassCache
});
return rssSourceData.queryAsync().then(function(val) {
return _getRssSourceObject(val)
}, function() {
return _getRssSourceObject(null)
})
}
var TopicProvider=NewsApp.Providers.CreateGenericProvider(createTopicRequest, createProxy);
var AlgoSourceProvider=NewsApp.Providers.CreateGenericProvider(createAlgoSourceRequest, createProxy);
var CustomRSSSourceProvider=NewsApp.Providers.CreateGenericProvider(createCustomRSSSourceRequest, createProxy);
function getHashForTopicParameters(args) {
return args.query + args.market
}
function getHashForAlgoSourceParameters(args) {
return args.domain + args.market
}
function getHashForCustomRSSSourceParameters(args) {
return args.feed + args.sourceName
}
WinJS.Namespace.define("NewsApp.DataProviders.Generic", {
TopicDataProvider: NewsApp.Providers.CreateProviderWithParametersFactory(TopicProvider, getHashForTopicParameters), AlgoSourceDataProvider: NewsApp.Providers.CreateProviderWithParametersFactory(AlgoSourceProvider, getHashForAlgoSourceParameters), CustomRSSSourceDataProvider: NewsApp.Providers.CreateProviderWithParametersFactory(CustomRSSSourceProvider, getHashForCustomRSSSourceParameters)
});
function extract(data) {
return data
}
function transform(data) {
if (data && data.newsItems && data.newsItems.length) {
var articleInfos=[];
var articles=data.newsItems;
var itemsLen=data.newsItems.length;
for (var i=0; i < itemsLen; i++) {
var article=articles[i];
var articleIdPath=article.articleUrl;
if (articleIdPath) {
var articleInfo={
articleId: articleIdPath, headline: article.title, abstract: article.abstract, thumbnail: article.thumbnailLowRes || article.thumbnail
};
articleInfos.push(articleInfo)
}
}
data.clusterArticles = {articleInfos: articleInfos}
}
return data
}
function transformTopics(data) {
if (data.newsItems) {
for (var i=0, ilen=data.newsItems.length; i < ilen; i++) {
var result=data.newsItems[i];
if (result.deepLink) {
result.destination = result.deepLink;
NewsJS.Bindings.resolveDestination(result);
if (result.type) {
result.editorial = true
}
}
}
}
return data
}
function createProxy(args, orchestrator) {
var transformer=args && args.strategy === "conflatedSearch" ? transformTopics : transform;
return new NewsApp.Providers.ProxyBase(this, extract, transformer, orchestrator)
}
function _getRssSourceObject(val) {
if (val) {
return {
newsItems: val.newsItems, lastModified: val.lastUpdateTime
}
}
return {
newsItems: null, lastModified: null
}
}
})();
(function() {
"use strict";
var FAILSAFE_TOKEN_BASE="ClusterDefinitions";
function getFailSafeToken(version, market) {
if (market) {
return FAILSAFE_TOKEN_BASE + "_" + market.replace("-", "").toUpperCase() + "_Ver" + version
}
else {
return FAILSAFE_TOKEN_BASE + "_Ver" + version
}
}
function versionFilter(clusterDefinitions) {
var retainedDefinitions=[],
currentReleaseNumber=PlatformJS.Services.appConfig.getDictionary("Release").getInt32("ReleaseNumber");
for (var idx=0, ilen=clusterDefinitions.length; idx < ilen; idx++) {
var clusterDefinition=clusterDefinitions[idx];
var filterCluster=false;
if (clusterDefinition.minReleaseNumber || clusterDefinition.maxReleaseNumber) {
if (clusterDefinition.minReleaseNumber && clusterDefinition.minReleaseNumber > currentReleaseNumber) {
filterCluster = true
}
else if (clusterDefinition.maxReleaseNumber && clusterDefinition.maxReleaseNumber < currentReleaseNumber) {
filterCluster = true
}
}
if (!filterCluster) {
if (!clusterDefinition.guid || !clusterDefinition.title || !clusterDefinition.providerConfiguration) {
filterCluster = true
}
else if (typeof clusterDefinition.title !== "string" || typeof clusterDefinition.guid !== "string") {
filterCluster = true
}
}
if (!filterCluster) {
retainedDefinitions.push(clusterDefinition)
}
}
return retainedDefinitions
}
function createRequest(args) {
var queryService=new PlatformJS.DataService.QueryService("BingDailyClusterDefinitions"),
urlParams=PlatformJS.Collections.createStringDictionary(),
options=new Platform.DataServices.QueryServiceOptions,
that=this;
if (PlatformJS.isDebug && NewsJS.StateHandler.instance.isPreviewModeEnabled) {
urlParams["previewparams"] = "/" + PlatformJS.Services.appConfig.getString("CMSPreviewParam")
}
else {
urlParams["previewparams"] = ""
}
var marketParams=this.market || NewsJS.Globalization.getMarketString();
if (marketParams) {
urlParams["market"] = marketParams
}
options.bypassCache = args.bypassCache || args.bypassOnce;
options.useCompatDataModel = true;
options.localDataFile = NewsJS.Data.Bing.LOCAL_FRE_OFFLINE_CLUSTERSDEFINITION_FILE;
return queryService.downloadDataAsync(urlParams, null, null, options).then(function(e) {
var data=null,
versionNumber=0,
isVersionDisabled=false,
exception=null;
try {
data = JSON.parse(e.dataString);
versionNumber = parseInt(data.version)
}
catch(error) {
exception = error
}
if (!args.bypassOnce) {
if (data) {
var failSafeToken=getFailSafeToken(versionNumber),
failSafeMarketToken=getFailSafeToken(versionNumber, marketParams);
isVersionDisabled = !Platform.Utilities.FailSafeConfiguration.isEnabled("BingDaily", failSafeToken) || !Platform.Utilities.FailSafeConfiguration.isEnabled("BingDaily", failSafeMarketToken)
}
if (!data || isVersionDisabled) {
var newArgs=JSON.parse(JSON.stringify(args));
newArgs.bypassOnce = true;
return createRequest.call(that, newArgs)
}
}
if (exception) {
throw exception;
}
if (data.clustersDefinition) {
data.clustersDefinition = versionFilter(data.clustersDefinition)
}
else {
throw new SyntaxError("ClusterDefinitionsMissing");
}
return {
isLocalResponse: e.isLocalResponse, isCachedResponse: e.isCachedResponse, data: data
}
})
}
function createProxy(args, LGS) {
var strategy=args.strategy,
category=args.categoryKey,
predicate=function(data) {
return data
},
transform=function(data) {
return data
};
return new NewsApp.Providers.ProxyBase(this, predicate, transform, LGS)
}
var Provider=NewsApp.Providers.CreateGenericProvider(createRequest, createProxy);
function getHashForParameters(args) {
return args.market
}
WinJS.Namespace.define("NewsApp.DataProviders.Azure", {BingDailyClusterDefinitionsDataProvider: NewsApp.Providers.CreateProviderWithParametersFactory(Provider, getHashForParameters)})
})();
(function() {
"use strict";
function createRequest(args) {
var identifier=this.strategy === "NextSteps" ? "NextSteps" : "GettingStarted";
var queryService=new PlatformJS.DataService.QueryService(identifier),
urlParams=PlatformJS.Collections.createStringDictionary(),
options=new Platform.DataServices.QueryServiceOptions;
var marketParams=this.market || NewsJS.Globalization.getMarketStringForEditorial();
if (marketParams) {
urlParams["market"] = marketParams
}
options.bypassCache = args.bypassCache;
return new WinJS.Promise(function(complete, error, progress) {
var processResponse=function(response, handler) {
try {
handler(JSON.parse(response.dataString))
}
catch(ex) {
error(ex)
}
};
queryService.downloadDataAsync(urlParams, null, null, options).then(function(response) {
processResponse(response, complete)
}, function(exception) {
error(exception)
}, function(cache) {
var response=cache.cachedResponse;
if (response) {
processResponse(response, progress)
}
})
})
}
function createProxy(args) {
var predicate=function(data) {
return data
},
transform;
switch (args.strategy) {
case("NextSteps"):
transform = function(data) {
return transformNextSteps(data)
};
break;
default:
transform = function(data) {
return transformGettingStarted(data)
};
break
}
;
return new NewsApp.Providers.ProxyBase(this, predicate, transform)
}
var Provider=NewsApp.Providers.CreateGenericProvider(createRequest, createProxy);
function getHashForParameters(args) {
return args.market + args.strategy
}
WinJS.Namespace.define("NewsApp.DataProviders", {TempClusterProvider: NewsApp.Providers.CreateProviderWithParametersFactory(Provider, getHashForParameters)});
function transformGettingStarted(data) {
var provider=new CommonJS.TempClusterDataProvider;
var transformed=provider.parseData(data).data;
if (!transformed) {
throw new Error("DataError:ExpectedDataMissing:Response is null");
}
return {
lastModified: data.lastModified, clusterKey: null, clusterList: null, messageData: transformed, templateName: "gsTemplate"
}
}
function transformNextSteps(data) {
var provider=new CommonJS.TempClusterDataProvider;
var transformed=provider.parseNextStepsData(data).data;
if (!transformed) {
throw new Error("DataError:ExpectedDataMissing:Response is null");
}
return {
lastModified: data.lastModified, clusterKey: null, clusterList: null, messageData: transformed, templateName: "nsTemplate"
}
}
})();
(function() {
"use strict";
function createRequest(args) {
var options={
dataSourceName: this.source.dataSourceName, feedName: this.source.feedName, dataProviderOptions: this.source.dataProviderOptions, cssFeedUrl: this.source.css, channelId: null
};
return new DynamicPanoJS.DynamicPanoProvider(options).fetchNetworkData(true).then(function(response) {
return response.cmsData
}, function(error){})
}
function createProxy(args) {
var source=args.source,
predicate=function(items) {
return extractPartnerSource(source, items)
},
transform=transformSourceEntityList;
return new NewsApp.Providers.ProxyBase(this, predicate, transform)
}
var Provider=NewsApp.Providers.CreateGenericProvider(createRequest, createProxy);
function getHashForParameters(args) {
return args.source.id
}
WinJS.Namespace.define("NewsApp.DataProviders", {PartnerSourcesProvider: NewsApp.Providers.CreateProviderWithParametersFactory(Provider, getHashForParameters)});
function extractPartnerSource(source, response) {
var allEntities=[];
var numClustersStitched=0;
for (var c in response.categories) {
var category=response.categories[c];
for (var e in category.entities) {
allEntities.push(category.entities[e])
}
numClustersStitched++;
if (numClustersStitched >= 2)
break
}
return allEntities
}
function transformSourceEntityList(response, filter) {
var items=response,
newsItems=response,
lastModified=null;
return {
native: true, clusterInfo: {
title: "title", thumbnail: {url: ""}, moduleInfo: {
height: "140px", width: "290px", fragmentPath: "/html/templates.html", templateId: "homeSemanticTileNoImage"
}
}, lastModified: lastModified, newsItems: newsItems
}
}
})();
(function() {
"use strict";
var sourceData=null;
function createRequest(args) {
var rssSourceData=new CommonJS.NewsRSS.NewsProvider({
feed: this.source.rss_urls, sourceName: this.source.displayname, title: this.source.title, showProgress: true, disableFavIcon: true, bypassCache: false, onsuccess: function onsuccess(e) {
if (e) {
NewsJS.Utilities.setLastUpdatedTime([e.lastUpdateTime])
}
}, onerror: function onerror(){}
});
return rssSourceData.queryAsync().then(function(e) {
return e
}, function(error) {
return null
})
}
function createProxy(args) {
var source=args.source,
predicate=function(items) {
return extractCustomRSSSource(source, items)
},
transform=transformSourceEntityList;
return new NewsApp.Providers.ProxyBase(this, predicate, transform)
}
var Provider=NewsApp.Providers.CreateGenericProvider(createRequest, createProxy);
function getHashForParameters(args) {
return args.source.id
}
WinJS.Namespace.define("NewsApp.RSS", {CustomRSSProvider: NewsApp.Providers.CreateProviderWithParametersFactory(Provider, getHashForParameters)});
function extractCustomRSSSource(source, response) {
return response.newsItems
}
function transformSourceEntityList(response, filter) {
var items=response,
newsItems=response,
lastModified=null;
return {
native: true, clusterInfo: {
title: "title", thumbnail: {url: ""}, moduleInfo: {
height: "140px", width: "290px", fragmentPath: "/html/templates.html", templateId: "homeSemanticTileNoImage"
}
}, lastModified: lastModified, newsItems: newsItems
}
}
})();
(function() {
"use strict";
var sourceData=null;
function createRequest(args) {
sourceData = new NewsJS.SourceData(Platform.Globalization.Marketization.getCurrentMarket());
return sourceData.fetchSourceData(this.source.title, false).then(function(e) {
return e
}, function(error) {
return null
})
}
function createProxy(args) {
var source=args.source,
predicate=function(items) {
return extractBingRSSSource(source, items)
},
transform=transformSourceEntityList;
return new NewsApp.Providers.ProxyBase(this, predicate, transform)
}
var Provider=NewsApp.Providers.CreateGenericProvider(createRequest, createProxy);
function getHashForParameters(args) {
return args.source.id
}
WinJS.Namespace.define("NewsApp.RSS", {BingRSSProvider: NewsApp.Providers.CreateProviderWithParametersFactory(Provider, getHashForParameters)});
function extractBingRSSSource(source, response) {
return sourceData.parseResults(response).data
}
function transformSourceEntityList(response, filter) {
var items=response,
newsItems=response,
lastModified=null;
return {
native: true, clusterInfo: {
title: "title", thumbnail: {url: ""}, moduleInfo: {
height: "140px", width: "290px", fragmentPath: "/html/templates.html", templateId: "homeSemanticTileNoImage"
}
}, lastModified: lastModified, newsItems: newsItems
}
}
})();
(function() {
"use strict";
WinJS.Namespace.define("NewsJS", {SourceData: WinJS.Class.define(function(options) {
this._data = [];
this._market = options.market;
this._snappedDataSource = new WinJS.Binding.List
}, {
fetchSourceData: function fetchSourceData(source_domain, bypassCache) {
var that=this;
this._articleUrlMap = {};
msWriteProfilerMark("NewsApp:SourcePage:getAlgo:s");
this.deDupResults = PlatformJS.Services.appConfig.getDictionary("BDIConfig").getBool("deDupSearchResults");
this.deDupPath = PlatformJS.Services.appConfig.getDictionary("BDIConfig").getString("deDupPath");
this.deDupParamName = PlatformJS.Services.appConfig.getDictionary("BDIConfig").getString("deDupParamName");
var sourcesConfig=PlatformJS.Services.appConfig.getDictionary("SourcesConfig");
var sortByDate=sourcesConfig.getBool("SortArticlesByDateOnSourcePage");
this._snappedDataSource.splice(0, that._snappedDataSource.length);
this._data = [];
var promises=[];
promises.push(NewsJS.Data.Bing.getNewsBrowseForCategory(null, 0, 20, source_domain, sortByDate, bypassCache, that._market, that, NewsJS.Telemetry.Search.FormCode.category));
if (NewsJS.Utilities.CachedNetworkChecks.hasInternetConnection()) {
promises.push(NewsJS.Data.Bing.getNewsBrowseForCategory(null, 20, 20, source_domain, sortByDate, bypassCache, that._market, null, NewsJS.Telemetry.Search.FormCode.category))
}
that._pageDataPromise = WinJS.Promise.join(promises);
return that._pageDataPromise.then(function(e) {
msWriteProfilerMark("NewsApp:SourcePage:getAlgo:e");
return e
}, function(error) {
msWriteProfilerMark("NewsApp:SourcePage:getAlgo:e");
return null
})
}, parseResults: function parseResults(e) {
var that=this;
that._pageDataPromise = null;
var resultsReceived=0;
var lastUpdateTimes=[];
for (var idx=0; idx < e.length; idx++) {
if (e[idx] && e[idx].data && e[idx].data.lastUpdateTime && e[idx].data.lastUpdateTime.getTime) {
lastUpdateTimes.push(e[idx].data.lastUpdateTime.getTime())
}
resultsReceived += e[idx] ? e[idx].data.dataObject.newsResults.length : 0;
that.resultsReceived(e[idx]);
var totalResults=e[idx] ? e[idx].data.dataObject.totalResults : 0;
if (totalResults <= resultsReceived) {
break
}
}
return {
data: that._data, lastUpdateTimes: lastUpdateTimes, snappedDataSource: that._snappedDataSource
}
}, resultsReceived: function resultsReceived(e) {
if (e) {
var that=this;
var data=PlatformJS.Utilities.convertManageToJSON(e.data.dataObject);
for (var i=0; i < data.newsResults.length; i++) {
var article=data.newsResults[i];
if (that._bdiReporter) {
article.bdiRequestUrl = e.url;
article.transformer = e.transformer
}
var rawArticleUrl=NewsJS.Utilities.getRawArticleUrl(article.articleUrl, this.deDupPath, this.deDupParamName);
if (rawArticleUrl && rawArticleUrl.length > 0 && (!this.deDupResults || !this._articleUrlMap[rawArticleUrl])) {
this._articleUrlMap[rawArticleUrl] = 1;
this._data.push(article);
var binding=NewsJS.Bindings.snappedStoryTile(article);
that._snappedDataSource.push(WinJS.Binding.as(binding))
}
}
}
}
})})
})()