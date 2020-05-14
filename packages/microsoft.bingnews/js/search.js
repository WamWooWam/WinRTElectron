/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
var searchPage="/html/search.html";
var lastSearch=null;
var searchAll=false;
WinJS.Namespace.define("NewsJS", {Search: WinJS.Class.derive(NewsJS.NewsBasePage, function(state) {
NewsJS.NewsBasePage.call(this, state);
var that=this;
if (!state) {
state = {}
}
else {
this._panoramaState = state.panoramaState
}
this._state = state;
this._data = [];
this._articleUrlMap = {};
this._clusters = new WinJS.Binding.List;
this.sortResultsByDate = PlatformJS.Services.appConfig.getDictionary("TopicsConfig").getBool("sortResultsByDate");
this.deDupResults = PlatformJS.Services.appConfig.getDictionary("BDIConfig").getBool("deDupSearchResults");
this.deDupPath = PlatformJS.Services.appConfig.getDictionary("BDIConfig").getString("deDupPath");
this.deDupParamName = PlatformJS.Services.appConfig.getDictionary("BDIConfig").getString("deDupParamName");
this._jsLoadedPromise = PlatformJS.platformInitializedPromise.then(function _startBingDailyLazyLoad() {
return WinJS.UI.Fragments.renderCopy("/bingDaily/lazyBingDaily.html")
});
lastSearch = this._state.queryText;
searchAll = this._state.searchAll;
this.registerSearchTopics = PlatformJS.Services.appConfig.getDictionary("TopicsConfig").getBool("registerSearchTopics");
try {
if (typeof lastSearch === "string") {
that.doSearch(lastSearch, false, searchAll);
if (this.registerSearchTopics) {
NewsJS.Utilities.registerSearchTopic(lastSearch, state.searchOrigin !== NewsJS.Telemetry.Search.Origin.popularNow)
}
}
var refreshButton=PlatformJS.Utilities.getControl("refreshButton");
if (refreshButton) {
refreshButton.label = PlatformJS.Services.resourceLoader.getString("Refresh");
refreshButton.onclick = function(e) {
that._refreshPage();
NewsJS.Telemetry.Search.recordRefreshButtonClick(e)
}
}
this._onEdgyBeforeShowHandler = this._onEdgyBeforeShow.bind(this);
var edgy=PlatformJS.Utilities.getControl("actionEdgy");
if (edgy) {
edgy.addEventListener("beforeshow", this._onEdgyBeforeShowHandler)
}
var enableTopicsFeature=Platform.Utilities.Globalization.isFeatureEnabled("Topics");
if (!enableTopicsFeature) {
var pinButton=document.getElementById("pinTopic");
if (pinButton) {
WinJS.Utilities.addClass(pinButton, "hidden")
}
}
}
catch(e) {}
this.isOnline = NewsJS.Utilities.CachedNetworkChecks.hasInternetConnection()
}, {
_clusters: null, _state: null, _panorama: null, _data: null, _gridLayout: null, _clusterDataSourceSet: false, registerSearchTopics: false, sortResultsByDate: false, getPageImpressionContext: function getPageImpressionContext() {
return NewsJS.Telemetry.String.ImpressionContext.search
}, getPageState: function getPageState() {
var panoControl=PlatformJS.Utilities.getControl("news_Panorama");
if (panoControl) {
this._state.panoramaState = panoControl.getPanoramaState()
}
return this._state
}, getPageData: function getPageData() {
var that=this;
var headerOptions=that.commonHeaderOptions;
headerOptions.headerTitleSentenceCasing = false;
return WinJS.Promise.wrap({
title: lastSearch, semanticZoomRenderer: that.semanticZoomRenderer, headerOptions: headerOptions, panoramaState: that._panoramaState
})
}, getSearchBoxData: function getSearchBoxData() {
return new WinJS.Promise.wrap({options: {
placeholderText: PlatformJS.Services.resourceLoader.getString("AppSearchHint"), autoSuggestionDataProvider: NewsJS.Autosuggest.getSearchSuggestionDataProvider(), searchHandler: NewsJS.Autosuggest.searchHandler, suggestionChosenHandler: NewsJS.Autosuggest.suggestionHandler, focusOnKeyboardInput: true, chooseSuggestionOnEnter: false
}})
}, dispose: function dispose() {
var edgy=PlatformJS.Utilities.getControl("actionEdgy");
if (edgy) {
edgy.removeEventListener("beforeshow", this._onEdgyBeforeShowHandler)
}
this._onEdgyBeforeShowHandler = null;
NewsJS.NewsBasePage.prototype.dispose.call(this)
}, _refreshPage: function _refreshPage() {
if (!this.checkOffline()) {
this.doSearch(this._state.queryText, true, this._state.searchAll)
}
CommonJS.dismissAllEdgies()
}, toggleOfflineArticles: function toggleOfflineArticles(enabled){}, _onEdgyBeforeShow: function _onEdgyBeforeShow() {
var addSectionButtonParams={
state: this._state, market: NewsJS.Globalization.getMarketString(), title: this._state.queryText, query: this._state.queryText
};
NewsJS.Utilities.setupAddSectionButton(NewsJS.Personalization.Utilities.sectionType.Topics, addSectionButtonParams);
var enableTopicsFeature=Platform.Utilities.Globalization.isFeatureEnabled("Topics");
if (enableTopicsFeature) {
var pinTopicButtonParams={
queryText: this._state.queryText, searchOrigin: NewsJS.Telemetry.Search.Origin.pin
};
NewsJS.Utilities.Pinning.setupPinTopicButton("pinTopic", "Pin Topic Button", pinTopicButtonParams)
}
}, _processArticleSearchResults: function _processArticleSearchResults(bypassCache, results) {
var resultsReceived=0;
var lastUpdateTimes=[];
var validSets=0;
var cachedResponse=false;
for (var idx=0; idx < results.length; idx++) {
var currentResult=results[idx];
if (!currentResult) {
continue
}
if (currentResult.fromCache) {
cachedResponse = true
}
if (validSets === 0 && currentResult.data) {
this.layoutCacheInfo.uniqueResponseID = currentResult.data.responseId
}
validSets++;
if (currentResult.data && currentResult.data.lastUpdateTime && currentResult.data.lastUpdateTime.getTime) {
lastUpdateTimes.push(currentResult.data.lastUpdateTime.getTime())
}
resultsReceived += currentResult ? currentResult.data.dataObject.newsResults.length : 0;
this.articleResultsReceived(currentResult);
var totalResults=currentResult ? currentResult.data.dataObject.totalResults : 0;
if (totalResults <= resultsReceived) {
break
}
}
if (validSets > 0) {
this.allArticleResultsReceived(!bypassCache, cachedResponse, this._state.searchAll);
NewsJS.Utilities.setLastUpdatedTime(lastUpdateTimes);
return true
}
return false
}, _processSourcesSearchResults: function _processSourcesSearchResults(searchText) {
var modules=[];
NewsJS.Autosuggest.findPartiallyMatchingFeaturedSources(NewsJS.StateHandler.instance.allSources, searchText, null, function(result) {
var sourceImageUrl=(result.win8_image && result.win8_image.length > 0) ? result.win8_image : "url('/images/defaultSource.png')";
modules.push({
title: result.displayname, thumbnail: {
url: sourceImageUrl, altText: result.displayname
}, moduleInfo: {
height: "70px", width: "290px", fragmentPath: "/html/templates.html", templateId: "searchResultTile"
}, sourceInfo: result
})
});
if (modules.length) {
var clusterInfo={
title: PlatformJS.Services.resourceLoader.getString("Sources"), thumbnail: {url: ""}
};
this._clusters.push({
clusterEntity: clusterInfo, clusterKey: clusterInfo.title, clusterTitle: clusterInfo.title, clusterContent: {
contentControl: "CommonJS.Immersive.ItemsContainer", contentOptions: {
onitemclick: function onitemclick(e) {
NewsJS.Telemetry.Search.recordSearchResultPress({telemetry: {k: {result: e.detail.item.sourceInfo.id}}}, NewsJS.Telemetry.String.ActionContext.sources);
NewsJS.Utilities.navigateToSource(e.detail.item.sourceInfo, function updateStateOnSourceVisited(source) {
NewsJS.Utilities.updateStateOnSourceVisited(source.id, NewsJS.Globalization.getMarketString())
}, "InAppSearch")
}, itemDataSource: new WinJS.Binding.List(modules).dataSource, className: "platformListLayout"
}
}
});
return true
}
return false
}, _processTopicsSearchResults: function _processTopicsSearchResults(results) {
if (results) {
var modules=[];
var list=results.dataObjectList;
var count=list.size;
if (count) {
for (var i=0; i < count; i++) {
var text=list.getAt(i);
modules.push({
title: text, moduleInfo: {
height: "70px", width: "290px", fragmentPath: "/html/templates.html", templateId: "searchResultTileNoImage"
}
})
}
var clusterInfo={
title: PlatformJS.Services.resourceLoader.getString("MyTopics"), thumbnail: {url: ""}
};
this._clusters.push({
clusterEntity: clusterInfo, clusterKey: clusterInfo.title, clusterTitle: clusterInfo.title, clusterContent: {
contentControl: "CommonJS.Immersive.ItemsContainer", contentOptions: {
onitemclick: function onitemclick(e) {
NewsJS.Telemetry.Search.recordSearchResultPress({telemetry: {k: {result: e.detail.item.title}}}, NewsJS.Telemetry.String.ActionContext.topics);
NewsJS.Utilities.navigateToSearchPano(e.detail.item.title, false)
}, itemDataSource: new WinJS.Binding.List(modules).dataSource, className: "platformListLayout"
}
}
});
return true
}
}
return false
}, _processInternationalEditionsSearchResults: function _processInternationalEditionsSearchResults(response, queryText) {
var modules=[];
var defaultImage="ms-appx:///images/logoSource.contrast-white_scale-80.png";
NewsJS.Autosuggest.findPartiallyMatchingInternationalSources(response, queryText, function(entityList) {
modules.push({
title: entityList.categoryName, thumbnail: {
url: defaultImage, altText: entityList.categoryName
}, moduleInfo: {
height: "70px", width: "290px", fragmentPath: "/html/templates.html", templateId: "searchResultTile"
}, market: entityList.collectionId
})
});
if (modules.length) {
var clusterInfo={
title: PlatformJS.Services.resourceLoader.getString("InternationalEditions"), thumbnail: {url: ""}
};
this._clusters.push({
clusterEntity: clusterInfo, clusterKey: clusterInfo.title, clusterTitle: clusterInfo.title, clusterContent: {
contentControl: "CommonJS.Immersive.ItemsContainer", contentOptions: {
onitemclick: function onitemclick(e) {
NewsJS.Telemetry.Search.recordSearchResultPress({telemetry: {k: {result: e.detail.item.market}}}, NewsJS.Telemetry.String.ActionContext.internationalEditions);
NewsJS.Utilities.navigateToInternationalEdition(e.detail.item.market)
}, itemDataSource: new WinJS.Binding.List(modules).dataSource, className: "platformListLayout"
}
}
})
}
}, _searchCategories: function _searchCategories(queryText) {
var modules=[];
var defaultImage="/images/logo.contrast-white_scale-80.png";
NewsJS.Autosuggest.findPartiallyMatchingCategories(queryText, function(catInfo) {
modules.push({
title: catInfo.category, thumbnail: {
url: defaultImage, altText: catInfo.category
}, moduleInfo: {
height: "70px", width: "290px", fragmentPath: "/html/templates.html", templateId: "searchResultTile"
}, categoryInfo: catInfo
})
});
return WinJS.Promise.wrap(modules)
}, _processCategoriesSearchResults: function _processCategoriesSearchResults(results) {
if (results.length) {
var clusterInfo={
title: PlatformJS.Services.resourceLoader.getString("Categories"), thumbnail: {url: ""}
};
this._clusters.push({
clusterEntity: clusterInfo, clusterKey: clusterInfo.title, clusterTitle: clusterInfo.title, clusterContent: {
contentControl: "CommonJS.Immersive.ItemsContainer", contentOptions: {
onitemclick: function onitemclick(e) {
var categoryInfo=e.detail.item.categoryInfo;
NewsJS.Telemetry.Search.recordSearchResultPress({telemetry: {k: {result: categoryInfo.categoryKey}}}, NewsJS.Telemetry.String.ActionContext.categories);
NewsJS.Utilities.navigateToCategory(categoryInfo.category, categoryInfo.categoryKey)
}, itemDataSource: new WinJS.Binding.List(results).dataSource, className: "platformListLayout"
}
}
});
return true
}
return false
}, doSearch: function doSearch(queryText, bypassCache, searchAll) {
var that=this;
lastSearch = queryText;
this._data = [];
this._clusters = new WinJS.Binding.List;
var promises=[];
that._articleUrlMap = {};
var formCode=NewsJS.Telemetry.Search.getSearchClassification(that._state.searchOrigin).formCode;
promises.push(NewsJS.Data.Bing.getNewsSearch(queryText, 0, 20, that.sortResultsByDate, bypassCache, that, formCode).then(function(e) {
return WinJS.Promise.wrap(e)
}, function(error) {
if (NewsJS.Utilities.isCancellationError(error)) {
return WinJS.Promise.wrapError(error)
}
return WinJS.Promise.wrap(null)
}));
promises.push(NewsJS.Data.Bing.getNewsSearch(queryText, 20, 20, that.sortResultsByDate, bypassCache, that, formCode).then(function(e) {
return WinJS.Promise.wrap(e)
}, function(error) {
if (NewsJS.Utilities.isCancellationError(error)) {
return WinJS.Promise.wrapError(error)
}
return WinJS.Promise.wrap(null)
}));
NewsJS.Utilities.disableButton("refreshButton", true);
var onSearchError=function(error) {
msWriteProfilerMark("NewsApp:Search:getAlgo:e");
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
that._pageDataPromise = null;
if (!NewsJS.Utilities.isCancellationError(error)) {
that._pageLoadFailed(function() {
that.doSearch(that._state.queryText, true, searchAll)
})
}
};
CommonJS.Progress.showProgress(CommonJS.Progress.headerProgressType);
msWriteProfilerMark("NewsApp:Search:getAlgo:s");
var articlePromise=WinJS.Promise.join(promises);
var hasResults=false;
if (searchAll) {
var currentMarket=NewsJS.Globalization.getMarketString();
var sourcesPromise=NewsJS.Utilities.readSources();
var topicsPromise=NewsJS.Data.Bing.getQuerySuggestions(queryText, currentMarket);
var internationalEditionsPromise=NewsJS.Utilities.fetchInternationalSources(currentMarket);
var categoriesPromise=this._searchCategories(queryText);
this._pageDataPromise = articlePromise.then(function onSearchArticlesComplete(e) {
msWriteProfilerMark("NewsApp:Search:getAlgo:e");
hasResults = that._processArticleSearchResults(bypassCache, e) || hasResults;
return sourcesPromise
}, onSearchError).then(function onReadSourcesComplete() {
hasResults = that._processSourcesSearchResults(queryText) || hasResults;
return topicsPromise
}, onSearchError).then(function onGetTopicsComplete(results) {
hasResults = that._processTopicsSearchResults(results) || hasResults;
return internationalEditionsPromise
}, onSearchError).then(function onInternationalEditionsComplete(response) {
hasResults = that._processInternationalEditionsSearchResults(response, queryText) || hasResults;
return categoriesPromise
}, onSearchError).then(function onCategoriesComplete(results) {
hasResults = that._processCategoriesSearchResults(results) || hasResults;
return WinJS.Promise.wrap()
})
}
else {
this._pageDataPromise = articlePromise.then(function onSearchArticlesComplete(e) {
msWriteProfilerMark("NewsApp:Search:getAlgo:e");
hasResults = that._processArticleSearchResults(bypassCache, e) || hasResults;
return WinJS.Promise.wrap()
})
}
this._pageDataPromise = this._pageDataPromise.then(function onPageDataPromisesComplete(e) {
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
that._pageDataPromise = null;
if (hasResults) {
that._pageLoadSucceeded();
return WinJS.Promise.wrap()
}
else if (that.checkOffline()) {
that._pageLoadFailed();
return WinJS.Promise.wrap()
}
else {
return WinJS.Promise.wrapError("Error")
}
}, onSearchError).done()
}, setArticleClusterDataSource: function setArticleClusterDataSource(truncate) {
var that=this;
this._clusters.splice(0, 1);
var dataResults={newsItems: this._data};
if (that.layoutCacheInfo) {
var id="search" + (truncate ? "_all" : "");
dataResults.clusterID = id;
dataResults.cacheID = that.layoutCacheInfo.cacheID;
dataResults.dataCacheID = that.layoutCacheInfo.cacheKey;
dataResults.uniqueResponseID = that.layoutCacheInfo.uniqueResponseID
}
if (this._state.articleInfo) {
var insertNewsItem={
articleUrl: this._state.articleInfo.destinationUrl, category: "PopularNow", categoryKey: "PopularNow", source: this._state.articleInfo.source, thumbnail: {
height: this._state.articleInfo.image.image.height, width: this._state.articleInfo.image.image.width, url: this._state.articleInfo.image.image.url
}, title: this._state.articleInfo.abstract, templateClass: "P"
};
dataResults.newsItems.splice(0, 1, insertNewsItem)
}
var clusterKey="newsCluster";
this._clusters.push({
clusterKey: clusterKey, clusterTitle: PlatformJS.Services.resourceLoader.getString("NewsResults"), clusterContent: {
contentControl: "CommonJS.News.EntityCluster", contentOptions: {
categoryKey: clusterKey, adLayoutOverrideKey: "noad", theme: "newsAppTheme", mode: CommonJS.News.ClusterMode.static, noResultsMessage: "{0} {1}".format(PlatformJS.Services.resourceLoader.getString("NoResultsMessage"), PlatformJS.Services.resourceLoader.getString("NoResultsMessage2")), configKey: "EntityClusterDefaultNewsConfig", configObject: CommonJS.News.EntityClusterConfig.DefaultNews, onitemclick: function onitemclick(arg) {
that.itemInvoked(arg)
}, dataSet: dataResults, telemetry: {getCurrentImpression: function getCurrentImpression() {
return PlatformJS.Navigation.mainNavigator.getCurrentImpression()
}}, maxColumnCount: truncate ? 3 : undefined, enableSeeMore: truncate, categoryName: truncate ? PlatformJS.Services.resourceLoader.getString("Articles") : undefined, onseemoreclick: function onseemoreclick() {
NewsJS.Utilities.navigateToSearchPano(lastSearch, false)
}
}
}
});
var panoControl=PlatformJS.Utilities.getControl("news_Panorama");
if (panoControl && !this._clusterDataSourceSet) {
this._clusterDataSourceSet = true;
panoControl.clusterDataSource = this._clusters.dataSource
}
}, articleResultsReceived: function articleResultsReceived(e) {
var that=this;
if (e) {
var data=PlatformJS.Utilities.convertManageToJSON(e.data.dataObject);
var bdiTimeOriginEpoch=Date.UTC(1601, 0, 1, 0, 0, 0);
var now=new Date;
var nowEpoch=Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
if (data.newsResults.length > 0) {
for (var i=0; i < data.newsResults.length; i++) {
var result=data.newsResults[i];
if (that._bdiReporter) {
result.bdiRequestUrl = e.url;
result.transformer = e.transformer
}
if (result.deepLink) {
result.destination = result.deepLink;
NewsJS.Bindings.resolveDestination(result);
if (result.type) {
result.editorial = true
}
}
var rawArticleUrl=NewsJS.Utilities.getRawArticleUrl(result.articleUrl, that.deDupPath, that.deDupParamName);
if (rawArticleUrl && rawArticleUrl.length > 0 && (!that.deDupResults || !that._articleUrlMap[rawArticleUrl])) {
that._articleUrlMap[rawArticleUrl] = 1;
that._data.push(result);
var bdiTimeEpoch=(result.publishTimeRaw / 10000) + bdiTimeOriginEpoch;
result.publishDateTime = new Date(bdiTimeEpoch)
}
}
}
}
}, allArticleResultsReceived: function allArticleResultsReceived(shouldShowEdgy, cachedResponse, truncate) {
var that=this;
if (that._data.length >= 0) {
NewsJS.Telemetry.Search.recordSearch(that._state.queryText, that._data.length, that._state.searchOrigin, cachedResponse);
that.setArticleClusterDataSource(truncate)
}
else {}
}, onNewTopic: function onNewTopic(topic) {
var that=this;
if (topic && topic.length > 0) {
var success=NewsJS.Utilities.followTopic(topic);
if (success) {
NewsJS.Telemetry.Topics.recordAddTopic(topic);
var topicIndex=NewsJS.Utilities.topicIndexOf(topic);
if (topicIndex >= 0) {
var topicEntry=NewsJS.StateHandler.instance.getTopics()[topicIndex];
WinJS.Navigation.navigate({
fragment: searchPage, page: "NewsJS.Search"
}, {
topicEntry: topicEntry, queryText: topicEntry.query
})
}
}
}
NewsJS.Telemetry.Topics.recordPreferences()
}, itemInvoked: function itemInvoked(e) {
var that=this;
var item=e.item;
if ((item && item.sentinel) || this.checkOffline()) {
return
}
NewsJS.Telemetry.Search.recordSearchResultPress(item);
NewsJS.Utilities.launchArticle(item, {
title: lastSearch, subTitle: PlatformJS.Services.resourceLoader.getString("NewsResults"), articles: that._data
})
}
}, {areStateEqual: function areStateEqual(state1, state2) {
return (state1 && state2 && state1.searchOrigin === state2.searchOrigin && state1.queryText === state2.queryText && state1.searchAll === state2.searchAll)
}})})
})()