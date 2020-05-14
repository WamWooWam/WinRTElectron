/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
var LOCAL_STATE_FILE_NAME="state.json";
var DEPRECATED_81_GA_STATE_FILE_NAME="state201309.json";
var DEPRECATED_80_RTM_STATE_FILE_NAME="state.json";
var WIN_80_RTM_STATE_VERSION=80;
var WIN_81_RTM_STATE_VERSION=81;
var WIN_81_GA_STATE_VERSION=201309;
var CURRENT_STATE_VERSION=201311;
var StateHandler=WinJS.Class.define(function stateHandlercTor() {
CommonJS.PrivacySettings.pdpFactory = function() {
return new Microsoft.Amp.PersonalDataPlatform.DataClient.News.NewsPersonalizedDataFactory
};
this._load().then(function _bootStateLoadSucceed() {
Windows.Storage.ApplicationData.current.localSettings.values["BingDailyAlreadySynchedWithCloud"] = false
}, function _bootStateLoadFailed(e){})
}, {
_initialized: false, _lostInternetConnection: false, _newsPersonalizedDataClient: null, _state: {}, _lastSavedState: null, _lastSavedDate: {
get: function get() {
return this._state.updatedDateLocal
}, set: function set(value) {
this._state.updatedDateLocal = value
}
}, _isPreviewModeEnabled: false, _stateLayerLoaded: false, hasPulledPdpData: {get: function get() {
return this._stateLayerLoaded
}}, isPreviewModeEnabled: {
get: function get() {
if (CommonJS.State && CommonJS.State.isPreviewModeEnabled !== undefined) {
return this._isPreviewModeEnabled || CommonJS.State.isPreviewModeEnabled
}
return this._isPreviewModeEnabled
}, set: function set(value) {
this._isPreviewModeEnabled = value
}
}, allSources: null, _currentMarket: {get: function get() {
return PlatformJS.Utilities.Globalization.getCurrentMarket().toLowerCase()
}}, Init: function Init() {
if (!this._initialized) {
this._initialized = true;
if (PlatformJS.isPlatformInitialized) {
NewsJS.StateHandler.instance._initWhenClr()
}
else {
NewsApp.PageEvents.register("clrInitialized", NewsJS.StateHandler.instance._initWhenClr)
}
}
}, _initWhenClr: function _initWhenClr() {
Platform.Networking.NetworkManager.addEventListener("networkstatuschanged", function(event) {
if (NewsJS.Utilities.CachedNetworkChecks.hasInternetConnection()) {
if (NewsJS.StateHandler.instance._lostInternetConnection) {
NewsJS.StateHandler.instance._lostInternetConnection = false;
NewsJS.StateHandler.instance.syncWithPdp()
}
}
else {
NewsJS.StateHandler.instance._lostInternetConnection = true
}
});
Platform.Process.registerPlatformUIEventHandler("PDP_Enabled_changed", function(eventName, obj) {
NewsJS.StateHandler.instance.syncWithPdp(true, false)
});
this.syncWithPdp()
}, _load: function _load() {
var that=this;
return WinJS.Application.local.readText(LOCAL_STATE_FILE_NAME, "{}").then(function readSuccess(filecontent) {
return filecontent
}, function readFailed() {
return "{}"
}).then(function loadState(data) {
try {
var loadedState=JSON.parse(data);
if (loadedState.updatedDateLocal === undefined) {
loadedState.updatedDateLocal = 0
}
if (!that._state || that._lastSavedDate !== loadedState.updatedDateLocal) {
that._lastSavedState = data;
that._state = loadedState;
if (that._state.version !== CURRENT_STATE_VERSION) {
return that._migrationRequired()
}
}
}
catch(e) {}
}).then(function updateSourcesCluster() {
if (that._state && that._state.followedSources) {
NewsApp.PageEvents.dispatch("sourceschanged")
}
})
}, save: function save() {
if (this._newsPersonalizedDataClient !== null) {
return this._newsPersonalizedDataClient.save()
}
return WinJS.Promise.wrap(null)
}, _initPdpClientDeferred: false, _initPdpClient: function _initPdpClient() {
if (PlatformJS.isPlatformInitialized) {
if (this._newsPersonalizedDataClient === null && CommonJS.PrivacySettings.pdpFactory) {
var newsResolver=new Microsoft.Amp.PersonalDataPlatform.DataClient.News.WindowsNewsPersonalizedDataResolver;
var pdpClient=new Platform.Storage.PersonalizedDataService("News", CommonJS.PrivacySettings.pdpFactory, newsResolver);
this._newsPersonalizedDataClient = new Microsoft.Amp.PersonalDataPlatform.DataClient.News.NewsPersonalizedDataClient(pdpClient);
return this._newsPersonalizedDataClient.initialize().then(function InitializeSuccess() {
NewsJS.StateHandler.instance._stateLayerLoaded = true;
NewsApp.PageEvents.dispatch("pdpInitialized")
}, function InitializeError(e) {
this._newsPersonalizedDataClient = null;
debugger
})
}
}
else if (!this._initPdpClientDeferred) {
this._initPdpClientDeferred = true;
NewsApp.PageEvents.register("clrInitialized", function _initPdpClientDeferred() {
NewsJS.StateHandler.instance._initPdpClient()
})
}
return WinJS.Promise.wrap(null)
}, _postPdpUpdate: function _postPdpUpdate(forceRefresh) {
if (forceRefresh === true) {
var currentIPage=PlatformJS.Navigation.currentIPage;
if (currentIPage && currentIPage.onRoamingStateChanged) {
currentIPage.onRoamingStateChanged()
}
}
if (NewsJS.TopEdgy) {
NewsJS.TopEdgy.instance.setupNewsMyTopics()
}
NewsApp.PageEvents.dispatch("sourceschanged")
}, syncWithPdp: function syncWithPdp(bypassCache, forceRefresh) {
try {
this._initPdpClient().then(function _syncWithPdp_initPdpClientSucceed() {
if (NewsJS.StateHandler.instance._stateLayerLoaded && NewsJS.StateHandler.instance._newsPersonalizedDataClient) {
var bc=bypassCache || false;
var fr=forceRefresh || false;
NewsJS.StateHandler.instance._newsPersonalizedDataClient.readLatestRoamedData(bc).then(function onComplete(hasChanged) {
NewsJS.StateHandler.instance._postPdpUpdate(fr)
}, function onError() {
NewsJS.StateHandler.instance._postPdpUpdate(false)
}, function onProgress(){})
}
else {
NewsApp.PageEvents.register("pdpInitialized", function removeTopicDeferred() {
NewsJS.StateHandler.instance.syncWithPdp(bypassCache, forceRefresh)
})
}
}, function _syncWithPdp_initPdpClientFailed(e) {
debugger
})
}
catch(e) {}
}, _getTopicDataModel: function _getTopicDataModel(topic) {
var topicInstance=new Microsoft.Amp.PersonalDataPlatform.DataClient.News.DataModel.Windows.WindowsTopicDataModel;
topicInstance.title = topic.title;
topicInstance.query = topic.query;
topicInstance.market = this._currentMarket;
return topicInstance
}, _getTopicViewModel: function _getTopicViewModel(topic) {
return {
title: topic.title, query: topic.query, searchCount: topic.searchCount, ageCount: topic.ageCount, type: topic.type
}
}, getTopics: function getTopics() {
if (this._stateLayerLoaded && this._newsPersonalizedDataClient) {
var topics=this._newsPersonalizedDataClient.currentStateInstance.topics;
var topicsViewModel=[];
for (var i=0; i < topics.length; i++) {
topicsViewModel.push(this._getTopicViewModel(topics[i]))
}
return topicsViewModel
}
else if (this._state && this._state.followedSearchTopics) {
return this._state.followedSearchTopics
}
else {
return []
}
}, addTopic: function addTopic(index, topic) {
this._initPdpClient().then(function _addTopic_initPdpClientSucceed() {
if (NewsJS.StateHandler.instance._stateLayerLoaded && NewsJS.StateHandler.instance._newsPersonalizedDataClient) {
NewsJS.StateHandler.instance._newsPersonalizedDataClient.currentStateInstance.addTopic(index, NewsJS.StateHandler.instance._getTopicDataModel(topic))
}
else {
NewsApp.PageEvents.register("pdpInitialized", function addTopicDeferred() {
NewsJS.StateHandler.instance.addTopic(index, topic)
})
}
}, function _addTopic_initPdpClientFailed(e) {
debugger
})
}, removeTopic: function removeTopic(index) {
this._initPdpClient().then(function _removeTopic_initPdpClientSucceed() {
if (NewsJS.StateHandler.instance._stateLayerLoaded && NewsJS.StateHandler.instance._newsPersonalizedDataClient) {
NewsJS.StateHandler.instance._newsPersonalizedDataClient.currentStateInstance.removeTopicAt(index)
}
else {
NewsApp.PageEvents.register("pdpInitialized", function removeTopicDeferred() {
NewsJS.StateHandler.instance.removeTopic(index)
})
}
}, function _removeTopic_initPdpClientFailed() {
debugger
})
}, getSources: function getSources() {
var sources=[];
if (this._stateLayerLoaded && this._newsPersonalizedDataClient) {
sources = this._newsPersonalizedDataClient.currentStateInstance.sources
}
else if (this._state && this._state.followedSources) {
sources = this._state.followedSources
}
else {
return []
}
var sourcesViewModels=[];
for (var i=0; i < sources.length; i++) {
sourcesViewModels.push(this._getSourceViewModel(sources[i]))
}
return sourcesViewModels
}, _getSourceDataModel: function _getSourceDataModel(source) {
try {
var sourceInstance=new Microsoft.Amp.PersonalDataPlatform.DataClient.News.DataModel.Windows.WindowsSourceDataModel;
sourceInstance.freq = source.freq;
sourceInstance.alphaSortableName = source.alpha;
sourceInstance.displayname = source.displayname;
sourceInstance.win8Image = source.win8_image;
sourceInstance.id = source.id;
sourceInstance.title = source.title;
sourceInstance.sourcedescription = source.sourcedescription;
sourceInstance.rssNames = source.rss_names;
sourceInstance.rssUrls = source.rss_urls;
sourceInstance.newscategory = source.newscategory;
sourceInstance.isNotFeatured = source.is_not_featured;
sourceInstance.featuredCategories = source.featured_category;
sourceInstance.featuredUrl = source.featured_url;
sourceInstance.channelId = source.channel_id;
sourceInstance.adUnitId = source.ad_unit_id;
sourceInstance.instrumentationId = source.instrumentation_id;
sourceInstance.partnerHeaderLogo = source.partner_header_logo;
sourceInstance.partnerHeaderLogoSnap = source.partner_header_logo_snap;
sourceInstance.theme = source.theme;
sourceInstance.backbuttontype = source.backbuttontype;
sourceInstance.css = source.css;
sourceInstance.featured = source.featured;
sourceInstance.tileType = source.tileType;
sourceInstance.source = source.source;
sourceInstance.selected = source.selected;
sourceInstance.added = source.added;
sourceInstance.market = source.market || this._currentMarket;
sourceInstance.orderBy = source.orderBy;
sourceInstance.internationalType = source.type;
sourceInstance.isCustomRSS = source.isCustomRSS;
return sourceInstance
}
catch(e) {
throw e;
}
}, _getSourceViewModel: function _getSourceViewModel(source) {
return {
freq: source.freq, alpha: source.alpha, displayname: source.displayname, win8_image: source.win8_image, id: source.id, title: source.title, sourcedescription: source.sourcedescription, rss_names: source.rss_names, rss_urls: source.rss_urls, newscategory: source.newscategory, is_not_featured: source.is_not_featured, featured_category: source.featured_category, featured_url: source.featured_url, channel_id: source.channel_id, ad_unit_id: source.ad_unit_id, instrumentation_id: source.instrumentation_id, partner_header_logo: source.partner_header_logo, partner_header_logo_snap: source.partner_header_logo_snap, theme: source.theme, backbuttontype: source.backbuttontype, css: source.css, featured: source.featured, tileType: source.tileType, source: source.source, selected: source.selected, added: source.added, market: source.market, orderBy: source.orderBy, type: source.type, isCustomRSS: source.isCustomRSS || false
}
}, updateSources: function updateSources(sources) {
this._initPdpClient().then(function _updateSources_initPdpClientSucceed() {
if (NewsJS.StateHandler.instance._stateLayerLoaded && NewsJS.StateHandler.instance._newsPersonalizedDataClient) {
var sourcesInstances=[];
if (sources && sources.length > 0) {
for (var i=0; i < sources.length; i++) {
sourcesInstances.push(NewsJS.StateHandler.instance._getSourceDataModel(sources[i]))
}
}
NewsJS.StateHandler.instance._newsPersonalizedDataClient.currentStateInstance.updateSources(sourcesInstances)
}
else {
NewsApp.PageEvents.register("pdpInitialized", function updateSourcesDeferred() {
NewsJS.StateHandler.instance.updateSources(sources)
})
}
}, function _updateSources_initPdpClientFailed(e) {
debugger
})
}, appendSources: function appendSources(sources) {
this._initPdpClient().then(function _appendSources_initPdpClientSucceed() {
if (NewsJS.StateHandler.instance._stateLayerLoaded && NewsJS.StateHandler.instance._newsPersonalizedDataClient) {
var sourcesInstances=[];
if (sources && sources.length > 0) {
for (var i=0; i < sources.length; i++) {
sourcesInstances.push(NewsJS.StateHandler.instance._getSourceDataModel(sources[i]))
}
}
NewsJS.StateHandler.instance._newsPersonalizedDataClient.currentStateInstance.appendSources(sourcesInstances)
}
else {
NewsApp.PageEvents.register("pdpInitialized", function appendSourcesDeferred() {
NewsJS.StateHandler.instance.appendSources(sources)
})
}
}, function _appendSources_initPdpClientFailed(e) {
debugger
})
}, addSource: function addSource(index, source) {
if (!source) {
return
}
this._initPdpClient().then(function _addSource_initPdpClientSucceed() {
if (NewsJS.StateHandler.instance._stateLayerLoaded && NewsJS.StateHandler.instance._newsPersonalizedDataClient) {
var sourceInstance=NewsJS.StateHandler.instance._getSourceDataModel(source);
NewsJS.StateHandler.instance._newsPersonalizedDataClient.currentStateInstance.addSource(index, sourceInstance)
}
else {
NewsApp.PageEvents.register("pdpInitialized", function addSourceDeferred() {
NewsJS.StateHandler.instance.addSource(index, source)
})
}
}, function _addSource_initPdpClientFailed(e) {
debugger
})
}, removeSource: function removeSource(index) {
this._initPdpClient().then(function _removeSource_initPdpClientSucceed() {
if (NewsJS.StateHandler.instance._stateLayerLoaded && NewsJS.StateHandler.instance._newsPersonalizedDataClient) {
NewsJS.StateHandler.instance._newsPersonalizedDataClient.currentStateInstance.removeSourceAt(index)
}
else {
NewsApp.PageEvents.register("pdpInitialized", function removeSourceDeferred() {
NewsJS.StateHandler.instance.removeSource(source)
})
}
}, function _removeSource_initPdpClientFailed(e) {
debugger
})
}, _featuredSourcesWereAdded: null, FeaturedSourcesWereAdded: {
get: function get() {
if (this._stateLayerLoaded && this._newsPersonalizedDataClient) {
return this._newsPersonalizedDataClient.currentStateInstance.featuredSourcesWereAdded
}
else if (this._state && this._state.featuredSourcesWereAdded) {
return this._state.featuredSourcesWereAdded
}
else {
return false
}
}, set: function set(value) {
this._initPdpClient().then(function _setFeaturedSourcesWereAdded_initPdpClientSucceed() {
if (NewsJS.StateHandler.instance._stateLayerLoaded && NewsJS.StateHandler.instance._newsPersonalizedDataClient) {
NewsJS.StateHandler.instance._newsPersonalizedDataClient.currentStateInstance.featuredSourcesWereAdded = value
}
else {
NewsApp.PageEvents.register("pdpInitialized", function FeaturedSourcesWereAddedDeferred() {
NewsJS.StateHandler.instance.FeaturedSourcesWereAdded = value
})
}
}, function _setFeaturedSourcesWereAdded_initPdpClientFailed(e) {
debugger
})
}
}, _getClusterDataModel: function _getClusterDataModel(cluster) {
try {
var clusterInstance=new Microsoft.Amp.PersonalDataPlatform.DataClient.News.DataModel.Windows.WindowsCategoryDataModel;
clusterInstance.server = cluster.server;
clusterInstance.pinned = cluster.pinned;
clusterInstance.title = cluster.title;
clusterInstance.id = cluster.guid;
clusterInstance.clusterType = cluster.clusterType;
clusterInstance.append = cluster.append;
clusterInstance.minReleaseNumber = cluster.minReleaseNumber;
clusterInstance.semanticZoomThumbnailUrl = cluster.semanticZoomThumbnailUrl ? cluster.semanticZoomThumbnailUrl : "";
clusterInstance.providerConfiguration = new Microsoft.Amp.PersonalDataPlatform.DataClient.News.DataModel.Windows.WindowsProviderConfigurationDataModel;
clusterInstance.providerConfiguration.providerType = cluster.providerConfiguration.providerType;
clusterInstance.providerConfiguration.categoryKey = cluster.providerConfiguration.categoryKey;
clusterInstance.providerConfiguration.strategy = cluster.providerConfiguration.strategy ? cluster.providerConfiguration.strategy : "";
clusterInstance.providerConfiguration.feed = cluster.providerConfiguration.feed ? cluster.providerConfiguration.feed : "";
clusterInstance.providerConfiguration.sourceName = cluster.providerConfiguration.sourceName ? cluster.providerConfiguration.sourceName : "";
clusterInstance.providerConfiguration.market = cluster.providerConfiguration.market ? cluster.providerConfiguration.market : "";
clusterInstance.providerConfiguration.feedName = cluster.providerConfiguration.feedName ? cluster.providerConfiguration.feedName : "";
clusterInstance.providerConfiguration.domain = cluster.providerConfiguration.domain ? cluster.providerConfiguration.domain : "";
clusterInstance.providerConfiguration.sourceId = cluster.providerConfiguration.sourceId ? cluster.providerConfiguration.sourceId : "";
clusterInstance.providerConfiguration.instrumentationId = cluster.providerConfiguration.instrumentationId ? cluster.providerConfiguration.instrumentationId : "";
clusterInstance.providerConfiguration.css = cluster.providerConfiguration.css ? cluster.providerConfiguration.css : "";
clusterInstance.providerConfiguration.query = cluster.providerConfiguration.query ? cluster.providerConfiguration.query : "";
clusterInstance.providerConfiguration.categoryAdKey = cluster.providerConfiguration.categoryAdKey ? cluster.providerConfiguration.categoryAdKey : "";
return clusterInstance
}
catch(e) {
throw e;
}
}, _getClusterViewModel: function _getClusterViewModel(cluster) {
return {
server: cluster.server, pinned: cluster.pinned, title: cluster.title, guid: cluster.guid, clusterType: cluster.clusterType, append: cluster.append, minReleaseNumber: cluster.minReleaseNumber, semanticZoomThumbnailUrl: cluster.semanticZoomThumbnailUrl, providerConfiguration: {
providerType: cluster.providerConfiguration.providerType, categoryKey: cluster.providerConfiguration.categoryKey, categoryAdKey: cluster.providerConfiguration.categoryAdKey, strategy: cluster.providerConfiguration.strategy, feed: cluster.providerConfiguration.feed, sourceName: cluster.providerConfiguration.sourceName, market: cluster.providerConfiguration.market, feedName: cluster.providerConfiguration.feedName, domain: cluster.providerConfiguration.domain, sourceId: cluster.providerConfiguration.sourceId, instrumentationId: cluster.providerConfiguration.instrumentationId, css: cluster.providerConfiguration.css, query: cluster.providerConfiguration.query
}
}
}, getClustersDefinition: function getClustersDefinition(market) {
if (!market) {
throw new Error("market is null or undefined");
}
var categories=[];
if (this._stateLayerLoaded && this._newsPersonalizedDataClient) {
var cats=this._newsPersonalizedDataClient.currentStateInstance.getCategoriesForMarket(market);
if (cats) {
for (var i=0; i < cats.followedCategories.length; i++) {
categories.push(this._getClusterViewModel(cats.followedCategories[i]))
}
}
}
else if (this._state && this._state.clustersDefinition) {
market = market.toUpperCase();
for (var i=0; i < this._state.clustersDefinition.length; i++) {
if (this._state.clustersDefinition[i].market.toUpperCase() === market) {
if (this._state.clustersDefinition[i].categories) {
for (var j=0; j < this._state.clustersDefinition[i].categories.length; j++) {
if (this._state.clustersDefinition[i].categories[j].isDeleted !== true) {
categories.push(this._state.clustersDefinition[i].categories[j])
}
}
}
}
}
}
return categories || []
}, getClustersDeleted: function getClustersDeleted(market) {
if (!market) {
throw new Error("market is null or undefined");
}
var categories=[];
if (this._stateLayerLoaded && this._newsPersonalizedDataClient) {
var cats=this._newsPersonalizedDataClient.currentStateInstance.getCategoriesForMarket(market);
if (cats) {
for (var i=0; i < cats.deletedCategories.length; i++) {
categories.push(this._getClusterViewModel(cats.deletedCategories[i]))
}
}
}
else if (this._state && this._state.clustersDefinition) {
market = market.toUpperCase();
for (var i=0; i < this._state.clustersDefinition.length; i++) {
if (this._state.clustersDefinition[i].market.toUpperCase() === market) {
if (this._state.clustersDefinition[i].categories) {
for (var j=0; j < this._state.clustersDefinition[i].categories.length; j++) {
if (this._state.clustersDefinition[i].categories[j].isDeleted === true) {
categories.push(this._state.clustersDefinition[i].categories[j])
}
}
}
}
}
}
return categories || []
}, updateClustersUI: function updateClustersUI(market, clusters) {
this._updateClusters(market, clusters, true)
}, updateClusters: function updateClusters(market, clusters) {
this._updateClusters(market, clusters, false)
}, _updateClusters: function _updateClusters(market, clusters, userIntended) {
if (!market) {
throw new Error("market is null or undefined");
}
if (!clusters) {
throw new Error("clusters is null or undefined");
}
this._initPdpClient().then(function _updateClusters_initPdpClientSucceed() {
if (NewsJS.StateHandler.instance._stateLayerLoaded && NewsJS.StateHandler.instance._newsPersonalizedDataClient) {
var clusterInstances=[];
for (var i=0; i < clusters.length; i++) {
clusterInstances.push(NewsJS.StateHandler.instance._getClusterDataModel(clusters[i]))
}
NewsJS.StateHandler.instance._newsPersonalizedDataClient.currentStateInstance.updateCategoriesForMarket(market, clusterInstances, userIntended)
}
else {
NewsApp.PageEvents.register("pdpInitialized", function _updateClustersDeferred() {
NewsJS.StateHandler.instance._updateClusters(market, clusters, userIntended)
})
}
}, function _updateClusters_initPdpClientFailed(e) {
debugger
})
}, addCluster: function addCluster(market, index, cluster) {
if (!market) {
throw new Error("market is null or undefined");
}
if (!cluster) {
throw new Error("cluster is null or undefined");
}
this._initPdpClient().then(function _addCluster_initPdpClientSucceed() {
if (NewsJS.StateHandler.instance._stateLayerLoaded && NewsJS.StateHandler.instance._newsPersonalizedDataClient) {
var clusterInstance=NewsJS.StateHandler.instance._getClusterDataModel(cluster);
NewsJS.StateHandler.instance._newsPersonalizedDataClient.currentStateInstance.addCategoryByMarket(market, index, clusterInstance)
}
else {
NewsApp.PageEvents.register("pdpInitialized", function addClusterDeferred() {
NewsJS.StateHandler.instance.addCluster(market, index, cluster)
})
}
}, function _addCluster_initPdpClientFailed(e) {
debugger
})
}, removeClustersUI: function removeClustersUI(market, clusters) {
this._removeClusters(market, clusters, true)
}, removeClusters: function removeClusters(market, clusters) {
this._removeClusters(market, clusters, false)
}, _removeClusters: function _removeClusters(market, clusters, userIntended) {
if (!market) {
throw new Error("market is null or undefined");
}
if (!clusters) {
throw new Error("clusters is null or undefined");
}
this._initPdpClient().then(function _removeClusters_initPdpClientSucceed() {
if (NewsJS.StateHandler.instance._stateLayerLoaded && NewsJS.StateHandler.instance._newsPersonalizedDataClient) {
var clusterInstances=[];
for (var i=0; i < clusters.length; i++) {
clusterInstances.push(NewsJS.StateHandler.instance._getClusterDataModel(clusters[i]))
}
NewsJS.StateHandler.instance._newsPersonalizedDataClient.currentStateInstance.removeCategoriesFromMarket(market, clusterInstances, userIntended)
}
else {
NewsApp.PageEvents.register("pdpInitialized", function _removeClustersDeferred() {
NewsJS.StateHandler.instance._removeClusters(market, clusters, userIntended)
})
}
}, function _removeClusters_initPdpClientFailed(e) {
debugger
})
}, removeCluster: function removeCluster(market, cluster) {
if (!market) {
throw new Error("market is null or undefined");
}
if (!cluster) {
throw new Error("cluster is null or undefined");
}
this._initPdpClient().then(function _removeCluster_initPdpClientSucceed() {
if (NewsJS.StateHandler.instance._stateLayerLoaded && NewsJS.StateHandler.instance._newsPersonalizedDataClient) {
var clusterInstance=NewsJS.StateHandler.instance._getClusterDataModel(cluster);
NewsJS.StateHandler.instance._newsPersonalizedDataClient.currentStateInstance.removeCategoryFromMarket(market, clusterInstance)
}
else {
NewsApp.PageEvents.register("pdpInitialized", function removeClusterDeferred() {
NewsJS.StateHandler.instance.removeCluster(market, cluster)
})
}
}, function _removeCluster_initPdpClientFailed(e) {
debugger
})
}, isUserAlreadyWentThroughFRE: {
get: function get() {
if (this._stateLayerLoaded && this._newsPersonalizedDataClient) {
return this._newsPersonalizedDataClient.currentStateInstance.isUserAlreadyWentThroughFRE
}
else if (this._state && this._state.isUserAlreadyWentThroughFRE) {
return this._state.isUserAlreadyWentThroughFRE
}
else {
return false
}
}, set: function set(value) {
this._initPdpClient().then(function _setIsUserAlreadyWentThroughFRE_initPdpClientSucceed() {
if (NewsJS.StateHandler.instance._stateLayerLoaded && NewsJS.StateHandler.instance._newsPersonalizedDataClient) {
NewsJS.StateHandler.instance._newsPersonalizedDataClient.currentStateInstance.isUserAlreadyWentThroughFRE = value
}
else {
NewsApp.PageEvents.register("pdpInitialized", function isUserAlreadyWentThroughFREDeferred() {
NewsJS.StateHandler.instance.isUserAlreadyWentThroughFRE = value
})
}
}, function _setIsUserAlreadyWentThroughFRE_initPdpClientFailed(e) {
debugger
})
}
}, _liveTileMarket: null, liveTileMarket: {
get: function get() {
if (this._stateLayerLoaded && this._newsPersonalizedDataClient) {
return this._newsPersonalizedDataClient.currentStateInstance.liveTileMarket
}
else if (this._state && this._state.liveTileMarket) {
return this._state.liveTileMarket
}
else {
return this._currentMarket
}
}, set: function set(value) {
this._initPdpClient().then(function _setLiveTileMarket_initPdpClientSucceed() {
if (NewsJS.StateHandler.instance._stateLayerLoaded && NewsJS.StateHandler.instance._newsPersonalizedDataClient) {
NewsJS.StateHandler.instance._newsPersonalizedDataClient.currentStateInstance.liveTileMarket = value
}
else {
NewsApp.PageEvents.register("pdpInitialized", function liveTileMarketDeferred() {
NewsJS.StateHandler.instance.liveTileMarket = value
})
}
}, function _setLiveTileMarket_initPdpClientFailed(e) {
debugger
})
}
}, _stateVersion: null, stateVersion: {
get: function get() {
return this._stateVersion
}, set: function set(value) {
this._initPdpClient().then(function _setStateVersion_initPdpClientSucceed() {
if (NewsJS.StateHandler.instance._stateLayerLoaded && NewsJS.StateHandler.instance._newsPersonalizedDataClient) {
NewsJS.StateHandler.instance._stateVersion = NewsJS.StateHandler.instance._newsPersonalizedDataClient.currentStateInstance.version = value
}
else {
NewsApp.PageEvents.register("pdpInitialized", function stateVersionDeferred() {
NewsJS.StateHandler.instance.stateVersion = value
})
}
}, function _setStateVersion_initPdpClientFailed(e) {
debugger
})
}
}, _win81RoamedFileBaseName: "bingDailyClusterDefinitions_", _win81Version: 2, _win80RoamedFileBaseName: "clusterDefinitions_", _win80Version: 1.12, _win81clustersDefinitionFileExists: {get: function get() {
return WinJS.Application.roaming.exists(this._win81RoamedFileBaseName + this._currentMarket + ".json")
}}, _win80clustersDefinitionFileExists: {get: function get() {
return WinJS.Application.roaming.exists(this._win80RoamedFileBaseName + this._currentMarket + ".json")
}}, _migrationRequired: function _migrationRequired(market) {
if (PlatformJS.isPlatformInitialized) {
this._migrationRequiredImpl(market)
}
else {
NewsApp.PageEvents.register("clrInitialized", function() {
NewsJS.StateHandler.instance._migrationRequiredImpl(market)
})
}
}, _migrationRequiredImpl: function _migrationRequiredImpl(market) {
var targetMarket=market || PlatformJS.Utilities.Globalization.getCurrentMarket();
targetMarket = targetMarket.toLowerCase();
var that=this;
var loadedState=null;
var migrateFromVersion=0;
var writeToPdp=false;
var promises=[];
promises.push(this._win81clustersDefinitionFileExists);
promises.push(this._win80clustersDefinitionFileExists);
return WinJS.Promise.join(promises).then(function(result) {
if (result[0] === true) {
migrateFromVersion = WIN_81_RTM_STATE_VERSION
}
else if (result[1] === true) {
migrateFromVersion = WIN_80_RTM_STATE_VERSION
}
return WinJS.Application.roaming.readText(DEPRECATED_81_GA_STATE_FILE_NAME, "{}")
}).then(function(data) {
loadedState = JSON.parse(data);
if (loadedState && loadedState.version && migrateFromVersion < loadedState.version) {
migrateFromVersion = loadedState.version
}
that._state.upgradedFromPreviousState = migrateFromVersion >= WIN_80_RTM_STATE_VERSION;
var migrationSteps=[];
if (migrateFromVersion === WIN_80_RTM_STATE_VERSION) {
migrationSteps.push(that._migrateWin80ClustersDefinition(targetMarket));
migrationSteps.push(that._migrateRoamedStateFromRtmToGa(targetMarket))
}
else if (migrateFromVersion === WIN_81_RTM_STATE_VERSION) {
migrationSteps.push(that._migrateWin81ClustersDefinition(targetMarket));
migrationSteps.push(that._migrateRoamedStateFromRtmToGa(targetMarket))
}
if (migrateFromVersion <= WIN_81_RTM_STATE_VERSION) {
migrationSteps.push(that._migrateTopicsAddDefault(targetMarket));
migrationSteps.push(that._migrateSourcesAddDefault(targetMarket));
writeToPdp = true
}
return WinJS.Promise.join(migrationSteps)
}).then(function() {
if (migrateFromVersion >= WIN_81_GA_STATE_VERSION && migrateFromVersion <= CURRENT_STATE_VERSION) {
that._state = loadedState
}
if (that._state.updatedDateLocal === undefined) {
that._state.updatedDateLocal = 0
}
if (migrateFromVersion <= WIN_81_GA_STATE_VERSION) {
that._migrateFrom201309(targetMarket)
}
that.stateVersion = that._state.version = CURRENT_STATE_VERSION
}).then(function(success) {
return true
}, function(error) {
return false
})
}, _migrateFrom201309: function _migrateFrom201309(targetMarket) {
var sources=this.getSources();
if (sources && sources.length) {
for (var s=0; s < sources.length; s++) {
var source=sources[s];
if (!source || !source.id) {
continue
}
var sourceId=source.id.toLowerCase();
var sourceMarket=(source.market || targetMarket || "").toLowerCase();
source.market = source.market || sourceMarket;
if (sourceId === "newssource_more_online_wsj_com") {
switch (sourceMarket) {
case"en-us":
source.channel_id = "WSJ";
source.featured_url = "WSJSangam.js";
source.partner_header_logo = "http://appexblu.stb.s-msn.com/usappex/i/A6/4A63EC6026AFA1FF2728CBA7EE8994.png";
source.partner_header_logo_snap = "http://appexblu.stb.s-msn.com/usappex/i/31/2040DE3BD324B5FFEDD903046F01B.png";
source.css = "http://en-us.appex-rf.msn.com/pd/v1/en-us/news/WSJ/partner.css";
break;
case"en-ca":
source.channel_id = "WSJ";
source.featured_url = "WSJSangam.js";
source.partner_header_logo = "http://appexblu.stb.s-msn.com/usappex/i/A6/4A63EC6026AFA1FF2728CBA7EE8994.png";
source.partner_header_logo_snap = "http://appexblu.stb.s-msn.com/usappex/i/31/2040DE3BD324B5FFEDD903046F01B.png";
source.css = "http://en-ca.appex-rf.msn.com/pd/v1/en-ca/news/WSJ/partner.css";
break;
case"en-au":
source.channel_id = "WSJ";
source.featured_url = "WSJSangam.js";
source.partner_header_logo = "http://appexsin.stb.s-msn.com/sgappex/i/C7/52AF81721CF9E9FDFD3F48935E7E80.png";
source.partner_header_logo_snap = "http://appexsin.stb.s-msn.com/sgappex/i/DD/F3214AFFC864D8FB8EDF1703B9B47.png";
source.css = "http://en-au.appex-rf.msn.com/pd/v1/en-au/news/WSJ/partner.css";
break;
default:
break
}
}
else if (sourceId === "newssource_more_nytimes_com" && sourceMarket === "en-us") {
source.channel_id = "NYT";
source.featured_url = "NYTSangam.js";
source.partner_header_logo = "http://appexblu.stb.s-msn.com/usappex/i/FF/E3A227BE7652C9C0362F6E365D42.png";
source.partner_header_logo_snap = "http://appexblu.stb.s-msn.com/usappex/i/A3/5ED5D1CE78B3687E5C873947A16B.png";
source.css = "http://en-us.appex-rf.msn.com/pd/v1/en-us/news/NYT/partner.css"
}
}
}
}, _migrateTopicsAddDefault: function _migrateTopicsAddDefault(market) {
if (this.getTopics.length === 0) {
var that=this;
return PlatformJS.BootCache.instance.getEntryAsync("AppConfigDefaultFollowedTopics", this._getDefaultFromConfig("DefaultFollowedTopics")).then(function(defaultFollowedTopics) {
if (defaultFollowedTopics && defaultFollowedTopics.size) {
for (var i=0; i < defaultFollowedTopics.size; i++) {
var defaultFollowedTopic=defaultFollowedTopics[i];
var alreadyAdded=false;
for (var j=0; j < that.getTopics().length; j++) {
if (defaultFollowedTopic.value.toLocaleLowerCase() === that.getTopics()[j].query.toLocaleLowerCase()) {
alreadyAdded = true;
break
}
}
if (!alreadyAdded) {
that.addTopic(0, new{
title: defaultFollowedTopic.value, query: defaultFollowedTopic.value, type: "favorite", searchCount: 0
});
that.followedTopicsState.state.favoriteCount++
}
}
}
})
}
else {
return WinJS.Promise.wrap(null)
}
}, _migrateSourcesAddDefault: function _migrateSourcesAddDefault(market) {
var that=this;
return PlatformJS.BootCache.instance.getEntryAsync("DefaultFollowedSources", this._getDefaultFromConfig("DefaultFollowedSources")).then(function(defaultFollowedSources) {
if (defaultFollowedSources && defaultFollowedSources.size) {
for (var i=0; i < defaultFollowedSources.size; i++) {
var defaultFollowedSource=defaultFollowedSources[i];
var followedSource={};
for (var key in defaultFollowedSource) {
if (key) {
var currentDefaultFollowedSource=defaultFollowedSource[key];
if (currentDefaultFollowedSource && typeof currentDefaultFollowedSource === "object" && currentDefaultFollowedSource.value) {
followedSource[key] = currentDefaultFollowedSource.value
}
}
}
var alreadyAdded=false;
for (var j=0; j < that.getSources().length; j++) {
if (followedSource.id && that.getSources()[j].id && followedSource.id.toLowerCase() === that.getSources()[j].id.toLowerCase()) {
alreadyAdded = true;
break
}
}
if (!alreadyAdded) {
that.addSource(-1, followedSource)
}
}
}
})
}, _getDefaultFromConfig: function _getDefaultFromConfig(configKey) {
return PlatformJS.Services && PlatformJS.Services.appConfig ? PlatformJS.Services.appConfig.getList(configKey) : null
}, _migrateRoamedStateFromRtmToGa: function _migrateRoamedStateFromRtmToGa(market) {
var that=this;
return WinJS.Application.roaming.readText(DEPRECATED_80_RTM_STATE_FILE_NAME, "{}").then(function(roamedText) {
return JSON.parse(roamedText)
}).then(function(data) {
if (data.followedSearchTopics && data.followedSearchTopics.length) {
for (var i=0; i < data.followedSearchTopics.length; i++) {
that.addTopic(i, data.followedSearchTopics[i])
}
}
if (data.userDiscoveredAddSource !== undefined) {
that.userDiscoveredAddSource = data.userDiscoveredAddSource
}
var guid="MySources";
var sourcesKey="followedSources_" + market.toUpperCase() + "_" + guid;
if (data[sourcesKey] && data[sourcesKey].length > 0) {
that.appendSources(data[sourcesKey])
}
var featuredSourcesKey="showFeaturedSources_" + market.toUpperCase() + "_" + guid;
if (data[featuredSourcesKey] !== undefined) {
that.FeaturedSourcesWereAdded = data[featuredSourcesKey]
}
})
}, _migrateWin80ClustersDefinition: function _migrateWin80ClustersDefinition(market) {
return this._migratePreviouslyRoamedClustersDefinition(market, this._win80RoamedFileBaseName, this._win80Version)
}, _migrateWin81ClustersDefinition: function _migrateWin81ClustersDefinition(market) {
return this._migratePreviouslyRoamedClustersDefinition(market, this._win81RoamedFileBaseName, this._win81Version)
}, _migratePreviouslyRoamedClustersDefinition: function _migratePreviouslyRoamedClustersDefinition(market, fileBaseName, version) {
var that=this;
return WinJS.Application.roaming.readText(fileBaseName + market + ".json", "{}").then(function(roamedText) {
return JSON.parse(roamedText)
}).then(function(data) {
if (data.clustersDeleted && data.clustersDeleted.length > 0) {
that.removeClusters(market, data.clustersDeleted)
}
})
}
}, {});
WinJS.Namespace.define("NewsJS.StateHandler", {instance: new StateHandler});
var StateTemp=WinJS.Class.define(function statecTor(){}, {isPreviewModeEnabled: {
get: function get() {
return PlatformJS.BootCache.instance.getEntry("State_IsPreviewModeEnabled", function() {
return NewsJS.StateHandler && NewsJS.StateHandler.instance && NewsJS.StateHandler.instance.isPreviewModeEnabled
})
}, set: function set(value) {
NewsJS.StateHandler.instance.isPreviewModeEnabled = value
}
}}, {});
WinJS.Namespace.define("NewsJS.State", {temp: new StateTemp})
})()