/*  © Microsoft. All rights reserved. */
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
var feedType="",
feedIdentifierValue="";
var SECTION_TO_FETCH=0;
function createRequest(args) {
return new WinJS.Promise(function(complete) {
var articleManager=NYTJS.ArticleManager.instance;
articleManager.getLatestAsync().then(function(categories) {
var categoryInfo=categories.sections[SECTION_TO_FETCH];
feedType = categoryInfo.feedType;
feedIdentifierValue = categoryInfo.sectionName;
var provider=new NYTJS.NewsCluster.Provider(categoryInfo, categoryInfo.title, null, null, null, true, feedIdentifierValue);
provider.queryAsync().then(function(results) {
complete(results.newsItems)
}, function(e) {
complete([])
})
})
})
}
function createProxy(args) {
var source=args.source,
predicate=function(items) {
return filterLockedArticles(source, items)
},
transform=transformSourceEntityList;
return new NewsApp.Providers.ProxyBase(this, predicate, transform)
}
var Provider=NewsApp.Providers.CreateGenericProvider(createRequest, createProxy);
function getHashForParameters(args) {
return args.market
}
WinJS.Namespace.define("NewsApp.DataProviders", {NYTProvider: NewsApp.Providers.CreateProviderWithParametersFactory(Provider, getHashForParameters)});
function transformForArticleReader(source, article) {
var articleReaderState={
originatingFeed: feedIdentifierValue, originatingSection: feedIdentifierValue, templateClass: article.templateClass, articleId: article.articleid, feedType: feedType, feedIdentifierValue: feedIdentifierValue, articleList: article.articleList, title: article.title, snippet: article.snippet, imageAttribution: article.imageAttribution, kicker: article.kicker, source: article.source, publishTime: article.publishTime, thumbnail: article.thumbnail
};
return articleReaderState
}
function filterLockedArticles(source, articles) {
var unlockedArticles=[];
for (var a in articles) {
var article=articles[a];
if (article.access === "anonymous" && article.type === "article") {
unlockedArticles.push(transformForArticleReader(source, article))
}
}
return unlockedArticles
}
function transformSourceEntityList(response) {
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
var RSSProvider=function(metadata) {
return metadata.sourceType === "BING" ? new NewsApp.RSS.BingRSSProvider(metadata) : new NewsApp.RSS.CustomRSSProvider(metadata)
};
WinJS.Namespace.define("NewsApp.RSS", {RSSProvider: RSSProvider})
})();
(function() {
"use strict";
var feedType="",
feedIdentifierValue="";
var SECTION_TO_FETCH=1;
function createRequest(args) {
return new WinJS.Promise(function(complete) {
var articleManager=WSJJS.ArticleManager.instance;
articleManager.getLatestAsync().then(function(categories) {
var categoryInfo=categories.sections[SECTION_TO_FETCH];
feedType = categoryInfo.feedType;
feedIdentifierValue = categoryInfo.title;
var provider=new WSJJS.NewsCluster.Provider(categoryInfo, categoryInfo.title, null, null, null, true, feedIdentifierValue);
provider.queryAsync().then(function(results) {
complete(results.newsItems)
}, function(e) {
complete([])
})
})
})
}
function createProxy(args) {
var source=args.source,
predicate=function(items) {
return filterLockedArticles(source, items)
},
transform=transformSourceEntityList;
return new NewsApp.Providers.ProxyBase(this, predicate, transform)
}
var Provider=NewsApp.Providers.CreateGenericProvider(createRequest, createProxy);
function getHashForParameters(args) {
return args.market
}
WinJS.Namespace.define("NewsApp.DataProviders", {WSJProvider: NewsApp.Providers.CreateProviderWithParametersFactory(Provider, getHashForParameters)});
function transformForArticleReader(source, article) {
var articleReaderState={
originatingFeed: feedIdentifierValue, originatingSection: feedIdentifierValue, templateClass: article.templateClass, articleId: article.articleid, feedType: feedType, feedIdentifierValue: feedIdentifierValue, articleList: article.articleList, title: article.title, snippet: article.snippet, imageAttribution: article.imageAttribution, kicker: article.kicker, source: article.source, publishTime: article.publishTime, thumbnail: article.thumbnail
};
return articleReaderState
}
function filterLockedArticles(source, articles) {
var unlockedArticles=[];
for (var a in articles) {
var article=articles[a];
if (article.access === "anonymous" && article.type === "article") {
unlockedArticles.push(transformForArticleReader(source, article))
}
}
return unlockedArticles
}
function transformSourceEntityList(response) {
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
})()