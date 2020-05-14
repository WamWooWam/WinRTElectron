/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
var PAGE_GUID="31256468-7623-11E2-8106-14916188709B";
var clustersDefinition=[];
var clustersDeleted=[];
var clustersDefinitionInstrumented=false;
var enableCustomization=false;
var launched=false;
var _lastSuspendedTime=null;
function onRefresh(evt) {
NewsApp.PageEvents.dispatch("refreshing");
NewsJS.StateHandler.instance.syncWithPdp(true, true);
NewsJS.Telemetry.BingDaily.recordRefreshButtonClick(evt);
CommonJS.dismissAllEdgies();
NewsApp.PageEvents.dispatch("refreshed")
}
WinJS.Namespace.define("NewsJS", {BingDaily: WinJS.Class.derive(NewsJS.NewsBasePage, function(state) {
msWriteProfilerMark("NewsApp:BingDaily:s");
NewsJS.NewsBasePage.call(this, state);
state = state || {};
this._panoramaState = state.panoramaState || {};
this._state = state;
this._clustersAdded = {};
var marketString=NewsJS.Globalization.getMarketString();
this._market = this._state.market || marketString;
this._editorialMarket = null;
this._isHomePage = this._market === marketString;
this._title = !this._isHomePage && this._state.title ? this._state.title : PlatformJS.Services.resourceLoader.getString("BingNews");
this._bindableFirstViewRealizedFn = this.onFirstViewRealized.bind(this);
this._customizeButtonClickHandler = this._customizeButtonClickHandler.bind(this);
this.addRemovePanoramaFlush(true);
this._guid = "bingdaily";
NewsApp.PageEvents.register("removingcluster", this.onRemovingCluster.bind(this));
NewsApp.PageEvents.register("removedcluster", this.onRemovedCluster.bind(this));
this._jsLoadedPromise = PlatformJS.platformInitializedPromise.then(function _startBingDailyLazyLoad() {
return WinJS.UI.Fragments.renderCopy("/bingDaily/lazyBingDaily.html")
});
msWriteProfilerMark("NewsApp:BingDaily:e")
}, {
isHomeMarket: function isHomeMarket() {
var isHomeMarket=this._state.market ? this._state.market === NewsJS.Globalization.getMarketStringForEditorial() : true;
return isHomeMarket
}, isCustomizationCluster: function isCustomizationCluster(definition) {
return definition && definition.providerConfiguration && definition.providerConfiguration.providerType === "NewsApp.DataProviders.CMS.DataProvider" ? false : true
}, isFREOfflineBeforeOnline: function isFREOfflineBeforeOnline() {
if (clustersDefinition && clustersDefinition.length === 1 && clustersDefinition[0] && clustersDefinition[0].isFREOffline) {
return true
}
return false
}, getPageImpressionContext: function getPageImpressionContext() {
return NewsJS.Telemetry.String.ImpressionContext.bingDaily
}, createClusterMetadata: function createClusterMetadata(clusterDefinition, state, proxy) {
var currentReleaseNumberFromCache=PlatformJS.BootCache.instance.getEntry("AppConfigReleaseReleaseNumber", function() {
return PlatformJS.Services.appConfig.getDictionary("Release").getInt32("ReleaseNumber")
});
var identifier=clusterDefinition.guid,
entry=state ? state[identifier] : null,
clusterMetadata=null,
categoryKey=null,
providerConfig=null,
navigationState=null,
clusterType=clusterDefinition.clusterType,
currentReleaseNumber=currentReleaseNumberFromCache;
if (NewsApp.PersonalizationManager.isUnknownCluster(clusterDefinition, currentReleaseNumber)) {
clusterType = clusterDefinition.clusterType = "NewsApp.Controls.UnknownControl"
}
clusterDefinition.title = processTitle(clusterDefinition.title);
switch (clusterDefinition.clusterType) {
case"NewsApp.Controls.TempClusterWrapper":
clusterMetadata = createTempClusterMetadata(clusterDefinition, entry, proxy);
break;
case"NewsApp.Controls.DevelopingNewsControl":
clusterMetadata = createDevelopingNewsMetadata(clusterDefinition, entry, proxy);
break;
case"NewsJS.Personalization.MySourcesControl":
clusterMetadata = createMySourcesMetadata(clusterDefinition, entry, proxy);
providerConfig = clusterDefinition.providerConfiguration;
navigationState = {
mode: NewsJS.Personalization.Utilities.selectionPageFormat.FORMAT_SOURCE, features: [NewsJS.Personalization.Utilities.selectionPageFeature.TYPE_SOURCES, NewsJS.Personalization.Utilities.selectionPageFeature.TYPE_INTERNATIONAL], isBrowse: true, title: PlatformJS.Services.resourceLoader.getString("BrowseSourceTile"), guid: clusterDefinition.guid
};
setUpChannelNavigation(clusterDefinition, clusterMetadata, "SelectionPage", navigationState);
break;
case"NewsJS.Controls.MoreColumnControl":
clusterMetadata = createMyCategoriesMetadata(clusterDefinition, entry, proxy);
break;
case"NewsApp.Controls.UserSection.InternationalEditionControl":
clusterMetadata = createCategoryClusterMetadata(clusterDefinition, entry, proxy);
providerConfig = clusterDefinition.providerConfiguration;
if (providerConfig && providerConfig.market) {
navigationState = {market: providerConfig.market};
setUpChannelNavigation(clusterDefinition, clusterMetadata, "HomePage", navigationState)
}
break;
case"NewsApp.Controls.UserSection.TopicControl":
clusterMetadata = createCategoryClusterMetadata(clusterDefinition, entry, proxy);
providerConfig = clusterDefinition.providerConfiguration;
if (providerConfig && providerConfig.query) {
var loc={
fragment: "/html/search.html", page: "NewsJS.Search"
};
navigationState = {
searchOrigin: NewsJS.Telemetry.Search.Origin.topicCluster, queryText: providerConfig.query
};
setUpNavigation(clusterDefinition, clusterMetadata, loc, navigationState)
}
break;
case"NewsApp.Controls.UserSection.SourceControl":
providerConfig = clusterDefinition.providerConfiguration;
var sourceId=providerConfig.sourceId;
var sourceMarket=providerConfig.market;
var rssFeed=providerConfig.feed;
clusterMetadata = createCategoryClusterMetadata(clusterDefinition, entry, proxy);
setUpSourceNavigation(clusterDefinition, clusterMetadata, sourceId, sourceMarket, rssFeed);
break;
case"NewsApp.Controls.CategoryControl":
clusterMetadata = createCategoryClusterMetadata(clusterDefinition, entry, proxy);
providerConfig = clusterDefinition.providerConfiguration;
categoryKey = providerConfig.categoryKey;
if (categoryKey) {
navigationState = {
categoryKey: providerConfig.categoryKey, algoCategoryKey: providerConfig.algoCategoryKey ? providerConfig.algoCategoryKey : providerConfig.categoryKey, categoryName: clusterDefinition.title, market: providerConfig.market, title: clusterDefinition.title, categoryAdKey: providerConfig.categoryAdKey, clusterAdsConfigPageId: "Home", articleReaderAdsConfigPageId: "Home", videoAdsConfigPageId: "Home"
}
}
setUpChannelNavigation(clusterDefinition, clusterMetadata, "CategoryPage", navigationState);
break;
case"NewsApp.Controls.HeroControl":
clusterMetadata = createHeroClusterMetadata(clusterDefinition, entry, proxy);
break;
case"NewsApp.Controls.FeatureSourcesControl":
clusterMetadata = createFeaturedSourcesMetata(clusterDefinition, entry, proxy);
break;
default:
clusterType = clusterDefinition.clusterType = "NewsApp.Controls.UnknownControl";
if (clusterDefinition.providerConfiguration) {
clusterDefinition.providerConfiguration.providerType = ""
}
clusterMetadata = createUnknownControlMetadata(clusterDefinition, entry, proxy);
break
}
return clusterMetadata
}, onRoamingStateChanged: function onRoamingStateChanged() {
NewsApp.PageEvents.dispatch("refreshing");
CommonJS.Progress.resetProgress(CommonJS.Progress.headerProgressType);
CommonJS.forceRefresh();
NewsApp.PageEvents.dispatch("refreshed")
}, addAdClusters: function addAdClusters() {
if (this._clusters && this._clusters.length > 0) {
var adTagKey=PlatformJS.Services.configuration.getDictionary("AdTags").getString("CategoryAdTagKey") || "BINGAPPS";
var adTagValue=PlatformJS.Services.configuration.getDictionary("AdTags").getString("HomeAdTagValue") || "HPN";
var adTagsArray=[];
if (adTagKey && adTagValue) {
adTagsArray.push({
key: adTagKey, value: adTagValue
})
}
PlatformJS.Ads.addOrderedAdsClusterConfig(this._clusters, {
clusterPosition: this._clusters.length, isEntityCluster: true, clusterEntity: {
title: CommonJS.resourceLoader.getString("/platform/advertisement"), thumbnail: {url: ""}, moduleInfo: {
height: "140px", width: "290px", fragmentPath: "/html/templates.html", templateId: "homeSemanticTile"
}
}, otherAdOptions: {adTags: adTagsArray}
}, "Home")
}
}, getClusterMetadata: function getClusterMetadata(state) {
var clusters=this._clusters = new WinJS.Binding.List;
for (var i=0, ilen=clustersDefinition.length; i < ilen; i++) {
var definition=clustersDefinition[i];
if (!this._isHomePage && this.isCustomizationCluster(definition)) {
continue
}
var proxy=new NewsApp.PanoramaProxy(clusters, definition.guid, this._market);
var clonedDefinition={};
for (var attr in definition) {
if (definition[attr] && typeof definition[attr] !== "function") {
clonedDefinition[attr] = definition[attr]
}
}
var clusterMetadata=this.createClusterMetadata(clonedDefinition, state, proxy);
if (clusterMetadata) {
clusters.push(clusterMetadata)
}
}
if (this._isHomePage && this._clusters && this._clusters.length > 0) {
this._updateClusterAddsFlag()
}
else if (!this._isHomePage && this._market && this._market.toLowerCase() === PlatformJS.Utilities.Globalization.getCurrentMarket().toLowerCase()) {
this.addAdClusters()
}
return clusters
}, appWentOffline: function appWentOffline() {
var state={connection: false};
NewsApp.PageEvents.dispatch("connectionchanging", state);
NewsApp.PageEvents.dispatch("connectionchanged", state)
}, appWentOnline: function appWentOnline() {
var state={connection: true};
NewsApp.PageEvents.dispatch("connectionchanging", state);
NewsApp.PageEvents.dispatch("connectionchanged", state);
if (this.isFREOfflineBeforeOnline()) {
CommonJS.disableAllEdgies(false);
if (this._isHomePage) {
WinJS.Navigation.history.current.location.channelId = "";
PlatformJS.Navigation.mainNavigator.resetApp(new Error("BingDaily appWentOnline"))
}
else {
NewsApp.PersonalizationManager.getClusterDefinitionsState(this._market, true, true, !this._isHomePage).done(function() {
CommonJS.Progress.resetProgress(CommonJS.Progress.headerProgressType);
CommonJS.forceRefresh()
})
}
}
else {
if (this._isHomePage) {
if (!NewsJS.BingDaily._useOldPrefetchManager) {
this._prefetch()
}
else {
NewsJS.PrefetchManager.onAppGoingOnline("NewsApp.Prefetch.BingDailyPrefetch", this.getPrefetchDefinition())
}
}
}
}, getPageState: function getPageState() {
var panoControl=this.getPanoramaControl();
if (panoControl) {
this._state.panoramaState = panoControl.getPanoramaState()
}
return this._state
}, getPageData: function getPageData() {
var that=this;
return NewsApp.PersonalizationManager.getClusterDefinitionsState(that._market, false, launched, !this._isHomePage).then(function(state) {
launched = true;
clustersDefinition = state.clustersDefinition;
clustersDeleted = state.clustersDeleted;
if (state.editorialMarket) {
that._editorialMarket = state.editorialMarket
}
enableCustomization = !state.isMinimal && !that.isFREOfflineBeforeOnline();
var market=that._editorialMarket || that._market;
var root=document.getElementById("todayPage");
if (root && market) {
var bingDailyRootLanguageForMarketKey="BingDailyRootLanguage" + market;
var rootLang=PlatformJS.BootCache.instance.getEntry(bingDailyRootLanguageForMarketKey, function() {
return PlatformJS.Utilities.convertMarketToLanguageCode(market)
});
root.lang = rootLang
}
if (!clustersDefinitionInstrumented) {
NewsJS.Telemetry.BingDaily.recordClusterLayout(clustersDefinition, !that._isHomePage);
clustersDefinitionInstrumented = true
}
}).then(function() {
return (PlatformJS.isWarmBoot ? StateManager.get(PAGE_GUID, that._market) : null)
}).then(function(state) {
state = state || {};
var showImmediate=!!that._state.showCustomizationImmediate;
that._state.showCustomizationImmediate = false;
var scrollToEnd=(NewsJS && NewsJS.Customization && NewsJS.Customization.categoriesAdded) ? -1 : 0;
if (scrollToEnd === -1) {
NewsJS.Customization.categoriesAdded = false
}
var addButtonOptions=[{
title: PlatformJS.Services.resourceLoader.getString("CustomizationTopicsButton"), content: PlatformJS.Services.resourceLoader.getString("CustomizationTopicsButtonContent")
}, {
title: PlatformJS.Services.resourceLoader.getString("CustomizationSourcesButton"), content: PlatformJS.Services.resourceLoader.getString("CustomizationSourcesButtonContent")
}, {
title: PlatformJS.Services.resourceLoader.getString("ManageCategories"), content: PlatformJS.Services.resourceLoader.getString("CustomizationCategoriesButtonContent")
}];
var hideInternational=PlatformJS.BootCache.instance.getEntry("PlatformConfigurationHideInternationalEditionsButton", function() {
return Platform.Configuration.ConfigurationManager.custom.getBool("hideInternationalEditionsButton")
});
if (!hideInternational) {
addButtonOptions.push({
title: PlatformJS.Services.resourceLoader.getString("CustomizationInternationalButton"), content: PlatformJS.Services.resourceLoader.getString("CustomizationInternationalButtonContent")
})
}
return {
title: that._title, semanticZoomRenderer: that.newsDailySemanticZoomRenderer, headerOptions: that.commonHeaderOptions, panoramaState: that._panoramaState, clusterDataSource: that.getClusterMetadata(state).dataSource, queryClusterData: that.queryClusterData, customizationUseVariableSizedTemplates: true, customizationUseHeroImageTemplate: true, enableCustomization: true, customizationStartIndex: scrollToEnd, customizationTitle: PlatformJS.Services.resourceLoader.getString("Customize"), customizationImageMap: that._state.customizationImageMap || null, customizationHintText: PlatformJS.Services.resourceLoader.getString("CustomizationHintText"), customizationAddButtonOptions: addButtonOptions, customizationMode: CommonJS.Immersive.CUSTOMIZATIONMODE.full, customizationAddCallback: WinJS.Utilities.markSupportedForProcessing(function(array, removedArray, callback, buttonIndex) {
that.customizationAddCallback(array, removedArray, callback, buttonIndex)
}), onCustomizationCompleted: WinJS.Utilities.markSupportedForProcessing(function(results) {
that.onCustomizationCompleted(results)
}), showCustomizationImmediate: showImmediate
}
})
}, getSearchBoxData: function getSearchBoxData() {
return PlatformJS.platformInitializedPromise.then(function _getSearchBoxDataLazy() {
return new WinJS.Promise.wrap({options: {
placeholderText: PlatformJS.Services.resourceLoader.getString("AppSearchHint"), autoSuggestionDataProvider: NewsJS.Autosuggest.getSearchSuggestionDataProvider(), searchHandler: NewsJS.Autosuggest.searchHandler, suggestionChosenHandler: NewsJS.Autosuggest.suggestionHandler, focusOnKeyboardInput: true, chooseSuggestionOnEnter: false
}})
})
}, setGoodState: function setGoodState() {
if (this.isFREOfflineBeforeOnline()) {
return
}
var that=this,
panoControl=this.getPanoramaControl(),
state={lastModified: 0};
for (var i=0, ilen=clustersDefinition.length; i < ilen; i++) {
var identifier=clustersDefinition[i].guid,
control=panoControl.getClusterContentControl(identifier);
if (control && control.getGoodState) {
state[identifier] = control.getGoodState()
}
}
return StateManager.set(PAGE_GUID, that._market, state)
}, customizationItemTemplate: function customizationItemTemplate(itemPromise) {
return itemPromise.then(function customizationItemTemplateRenderer(result) {
var render=function(item) {
var div=document.createElement("div");
var uxInfo={
title: item.data.clusterTitle, moduleInfo: {
templateId: "customizationItemTemplate", fragmentPath: "/html/templates.html"
}
};
CommonJS.loadModule(uxInfo.moduleInfo, uxInfo, div).done();
return div
};
if (WinJS.Promise.is(result)) {
return result.then(render)
}
else {
return render(result)
}
})
}, queryClusterData: WinJS.Utilities.markSupportedForProcessing(function(clusterKey) {
return null
}), customizationAddCallback: function customizationAddCallback(array, removedArray, callback, buttonIndex) {
var that=this;
if (buttonIndex === 0) {
NewsJS.Utilities.presentTopicModalPrompt().then(function(topic) {
if (topic && !NewsApp.PersonalizationManager.isTopicFollowed({clustersDefinition: clustersDefinition}, topic)) {
var clusterToAdd=NewsApp.PersonalizationManager.createTopicUserSection(topic, topic, that._market);
if (clusterToAdd && clusterToAdd.guid && !that._clustersAdded[clusterToAdd.guid]) {
var proxy=new NewsApp.PanoramaProxy(that._clusters, clusterToAdd.guid, that._market),
metaData=that.createClusterMetadata(clusterToAdd, null, proxy);
callback([metaData]);
that._clustersAdded[clusterToAdd.guid] = clusterToAdd;
var pano=that.getPanoramaControl();
pano.customizationStartIndex = -1
}
}
});
return
}
var panoControl=this.getPanoramaControl();
if (panoControl) {
this._state.customizationImageMap = panoControl.customizationImageMap;
this._state.showCustomizationImmediate = true;
this.onCustomizationCompleted(panoControl.getCustomizationResult(), true, buttonIndex)
}
}, setHeroCustomizationItemBackgroundImage: function setHeroCustomizationItemBackgroundImage() {
if (this._clusters) {
for (var i=0, ilen=this._clusters.length; i < ilen; i++) {
var cluster=this._clusters.getItem(i);
if (cluster && cluster.data && cluster.data.clusterKey && cluster.data.clusterKey === "hero") {
var panoControl=this.getPanoramaControl();
if (panoControl) {
var clusterInstance=panoControl.getClusterContentControl(cluster.data.clusterKey);
if (clusterInstance && clusterInstance.customizationImageUrl) {
var imageUrl=clusterInstance.customizationImageUrl();
if (imageUrl) {
cluster.data.customizationItemBackgroundImage = imageUrl
}
}
}
break
}
}
}
}, syncL2Categories: function syncL2Categories() {
if (!this._isHomePage) {
return
}
var channelManager=PlatformJS.Navigation && PlatformJS.Navigation.mainNavigator && PlatformJS.Navigation.mainNavigator.channelManager;
if (channelManager) {
var standardChannels=channelManager.standardChannels,
channelHome=null;
var channelData;
var channelProperty;
if (standardChannels) {
for (channelProperty in standardChannels) {
channelData = standardChannels[channelProperty];
if (channelData.id === "Home") {
channelHome = channelData
}
}
}
if (channelHome) {
channelHome.subChannels = [];
var promises=[];
for (var i=0, ilen=clustersDefinition.length; i < ilen; i++) {
var clusterDefinition=clustersDefinition[i];
var providerConfig=clusterDefinition.providerConfiguration;
var categoryName=clusterDefinition.title,
categoryKey=providerConfig.categoryKey;
var newChannel=null;
switch (clusterDefinition.clusterType) {
case"NewsApp.Controls.CategoryControl":
{
if (!providerConfig.market || (providerConfig.market.toLowerCase() === this._market.toLowerCase()) || (providerConfig.market === this._editorialMarket)) {
newChannel = NewsJS.TopEdgy.createChannel(categoryKey, categoryName, "", [], "/html/categoryPage.html", "NewsJS.CategoryPage", {
categoryKey: categoryKey, categoryName: categoryName, title: clusterDefinition.title, categoryAdKey: providerConfig.categoryAdKey, clusterAdsConfigPageId: "Home", articleReaderAdsConfigPageId: "Home", videoAdsConfigPageId: "Home"
})
}
else {
newChannel = NewsJS.TopEdgy.createChannel(categoryKey, categoryName, "", [], "/bingDaily/bingDaily.html", "NewsJS.BingDaily", {market: providerConfig.market})
}
promises.push(WinJS.Promise.wrap(newChannel))
}
break;
case"NewsApp.Controls.UserSection.InternationalEditionControl":
{
newChannel = NewsJS.TopEdgy.createChannel("HomePage", categoryName, "", [], "/bingDaily/bingDaily.html", "NewsJS.BingDaily", {
market: providerConfig.market, title: categoryName, dynamicInfo: {adLayoutOverrideKey: "noad"}
});
promises.push(WinJS.Promise.wrap(newChannel))
}
break;
case"NewsApp.Controls.UserSection.TopicControl":
{
var navigationState={
searchOrigin: NewsJS.Telemetry.Search.Origin.topicCluster, queryText: providerConfig.query
};
newChannel = NewsJS.TopEdgy.createChannel(categoryKey, categoryName, "", [], "/html/search.html", "NewsJS.Search", navigationState);
promises.push(WinJS.Promise.wrap(newChannel))
}
break;
case"NewsApp.Controls.UserSection.SourceControl":
{
var newChannelPromise=this.createL2ForSourceCategory(clusterDefinition);
promises.push(newChannelPromise)
}
break;
case"NewsApp.Controls.HeroControl":
case"NewsApp.Controls.TempClusterWrapper":
case"NewsJS.Personalization.MySourcesControl":
default:
break
}
}
WinJS.Promise.join(promises).then(function(subChannels) {
if (subChannels) {
subChannels.forEach(function(subChannel) {
if (subChannel) {
channelHome.subChannels.push(subChannel)
}
})
}
channelManager.standardChannelChanged = true
})
}
}
}, createL2ForSourceCategory: function createL2ForSourceCategory(clusterDefinition) {
var providerConfig=clusterDefinition.providerConfiguration;
var categoryName=clusterDefinition.title;
var sourceId=providerConfig.sourceId;
var sourceMarket=providerConfig.market;
var rssFeed=providerConfig.feed;
var l2Promise=getSource(clusterDefinition, sourceId, sourceMarket, rssFeed).then(function(source) {
if (source) {
var navigationInfo=NewsJS.Utilities.navigationInfoForSource(source, "bingdaily", sourceMarket);
if (navigationInfo) {
var state=navigationInfo.state || {};
var newChannel=NewsJS.TopEdgy.createChannel(sourceId, categoryName, "", [], navigationInfo.pageInfo.fragment, navigationInfo.pageInfo.page, state);
return newChannel
}
}
return null
});
return l2Promise
}, getPrefetchDefinition: function getPrefetchDefinition() {
return {
market: this._market, clusterDefinitions: clustersDefinition, guid: this._guid
}
}, startPrefetch: function startPrefetch(forcePrefetch) {
if (this.isHomeMarket() && !this.isFREOfflineBeforeOnline()) {
NewsJS.BingDaily._prefetchUI.show();
if (!NewsJS.BingDaily._useOldPrefetchManager) {
NewsJS.BingDaily._prefetchUI.init();
this._prefetch()
}
else {
NewsJS.PrefetchManager.initializePrefetchManager(forcePrefetch);
NewsJS.PrefetchManager.add("NewsApp.Prefetch.BingDailyPrefetch", this.getPrefetchDefinition())
}
}
}, dispose: function dispose() {
var panoControl=this.getPanoramaControl();
if (panoControl && this._bindableFirstViewRealizedFn) {
panoControl.removeEventListener('afterFirstView', this._bindableFirstViewRealizedFn)
}
var edgy=PlatformJS.Utilities.getControl("actionEdgy");
var panoControl=this.getPanoramaControl();
if (panoControl && this._bindableFirstViewRealizedFn) {
panoControl.removeEventListener('afterFirstView', this._bindableFirstViewRealizedFn);
this._bindableFirstViewRealizedFn = null
}
var edgy=PlatformJS.Utilities.getControl("actionEdgy");
if (edgy && this._bindableEdgyBeforeShowFn) {
edgy.removeEventListener("beforeshow", this._bindableEdgyBeforeShowFn);
this._bindableEdgyBeforeShowFn = null
}
var refreshButton=PlatformJS.Utilities.getControl("refreshButton");
if (refreshButton) {
refreshButton.removeEventListener("click", onRefresh)
}
var customizeButton=PlatformJS.Utilities.getControl("customizeButton");
if (customizeButton) {
customizeButton.removeEventListener("click", this._customizeButtonClickHandler);
this._customizeButtonClickHandler = null
}
NewsJS.NewsBasePage.prototype.dispose.call(this)
}, onCustomize: function onCustomize() {
if (PlatformJS.isDebug && NewsJS.StateHandler.instance.isPreviewModeEnabled) {
this._displayHiddenClustersInPreviewMode();
return
}
var panoControl=this.getPanoramaControl();
if (panoControl) {
this.setHeroCustomizationItemBackgroundImage();
panoControl.initializeCustomizationView();
panoControl.showCustomizationView()
}
}, onCustomizationCompleted: function onCustomizationCompleted(results, navigateToSelectionPage, buttonIndex) {
if (results) {
var that=this;
NewsApp.PersonalizationManager.synchronizeAfterCustomization(results, clustersDefinition, clustersDeleted, that._clustersAdded, that._market, that._editorialMarket).then(function(finalResults) {
that._clustersAdded = {};
clustersDefinition = finalResults.clustersDefinition;
clustersDeleted = finalResults.clustersDeleted;
that.syncL2Categories();
NewsJS.Telemetry.BingDaily.recordClusterLayout(clustersDefinition);
var features=[NewsJS.Personalization.Utilities.selectionPageFeature.TYPE_TOPICS, NewsJS.Personalization.Utilities.selectionPageFeature.TYPE_SOURCES, NewsJS.Personalization.Utilities.selectionPageFeature.TYPE_CATEGORIES, NewsJS.Personalization.Utilities.selectionPageFeature.TYPE_INTERNATIONAL];
var featureCategories=[features[0], PlatformJS.Services.resourceLoader.getString("Featured"), PlatformJS.Services.resourceLoader.getString("CustomizationCategoriesButton"), "internationalBingDailyTab"];
if (navigateToSelectionPage) {
var pageState={
mode: NewsJS.Personalization.Utilities.selectionPageFormat.FORMAT_CLUSTER, features: features, isBrowse: false, title: PlatformJS.Services.resourceLoader.getString("AddASection").toUpperCase()
};
if (buttonIndex < features.length) {
pageState.selectedCategory = featureCategories[buttonIndex]
}
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(NewsJS.Telemetry.String.ImpressionNavMethod.customizationPage);
PlatformJS.Navigation.navigateToChannel("SelectionPage", pageState)
}
});
if (this.getPanoramaControl) {
var pano=this.getPanoramaControl();
pano.customizationStartIndex = 0
}
}
}, onBindingComplete: function onBindingComplete() {
if (this.getPanoramaControl) {
var panoControl=this.getPanoramaControl();
if (panoControl && this._bindableFirstViewRealizedFn) {
panoControl.addEventListener('afterFirstView', this._bindableFirstViewRealizedFn, false)
}
}
}, onPreviewToggle: function onPreviewToggle() {
NewsApp.PageEvents.dispatch("refreshing");
NewsApp.PageEvents.dispatch("refreshed");
NewsApp.PersonalizationManager.getClusterDefinitionsState(this._market, true, true, !this._isHomePage).done(function() {
CommonJS.Progress.resetProgress(CommonJS.Progress.headerProgressType);
CommonJS.forceRefresh()
})
}, onRemovingCluster: function onRemovingCluster(e){}, onRemovedCluster: function onRemovedCluster(e) {
if (e.persist) {
var key=e.key,
cluster=null,
updatedClusters=[];
for (var i=0, ilen=clustersDefinition.length; i < ilen; i++) {
var def=clustersDefinition[i];
if (def.guid === key) {
cluster = def
}
else {
updatedClusters.push(def)
}
}
if (cluster) {
clustersDeleted.push(cluster)
}
NewsJS.Telemetry.BingDaily.recordClusterLayout(updatedClusters)
}
}, onResuming: function onResuming(event) {
NewsApp.PageEvents.dispatch("resuming");
NewsApp.PageEvents.dispatch("resumed");
var resetHistoryMillisecondThreshold=Platform.Configuration.ConfigurationManager.custom.getInt32("ResetHistoryMillisecondThreshold");
var millisecondsSinceLastSuspend=Date.now() - this._lastSuspendedTime;
var that=this;
if (this._isHomePage && millisecondsSinceLastSuspend < resetHistoryMillisecondThreshold) {
if (!NewsJS.BingDaily._useOldPrefetchManager) {
var p=WinJS.Promise.wrap(null);
if (!NewsJS.BingDaily._firsttimeFirstViewRealized) {
p = News.NewsUtil.instance.initializePrefetchManager(this._guid)
}
p.then(function prefetchAfterResume() {
NewsJS.BingDaily._firsttimeFirstViewRealized = true;
that._prefetch()
})
}
else {
NewsJS.PrefetchManager.isAppFirstViewRealizationComplete = true;
NewsJS.PrefetchManager.onPanoResuming("NewsApp.Prefetch.BingDailyPrefetch", this.getPrefetchDefinition())
}
}
}, onRefreshed: function onRefreshed() {
this.startPrefetch(false)
}, onSuspending: function onSuspending(e) {
var goodStatePromise=this.setGoodState();
if (goodStatePromise && e && e.suspendingOperation && e.suspendingOperation.getDeferral) {
var suspendingDeferral=e.suspendingOperation.getDeferral();
if (suspendingDeferral && suspendingDeferral.complete) {
var completeDeferral=function deferralHelper() {
suspendingDeferral.complete()
};
goodStatePromise.then(completeDeferral, completeDeferral)
}
}
this._lastSuspendedTime = Date.now();
if (NewsJS.BingDaily._useOldPrefetchManager) {
if (NewsJS.PrefetchManager && this._isHomePage) {
NewsJS.PrefetchManager.onPanoSuspending()
}
}
else {
NewsJS.BingDaily._firsttimeFirstViewRealized = false
}
}, onNavigateAway: function onNavigateAway() {
this.setGoodState();
NewsJS.BingDaily._prefetchUI.hide()
}, onFirstViewRealized: function onFirstViewRealized() {
var that=this,
panoControl=this.getPanoramaControl();
if (panoControl) {
panoControl.removeEventListener('afterFirstView', this._bindableFirstViewRealizedFn);
this._bindableFirstViewRealizedFn = null
}
var refreshButton=PlatformJS.Utilities.getControl("refreshButton");
if (refreshButton) {
refreshButton.label = PlatformJS.Services.resourceLoader.getString("Refresh");
refreshButton.addEventListener("click", onRefresh)
}
NewsApp.PageEvents.register("refreshed", this.onRefreshed.bind(this));
var customizeButton=PlatformJS.Utilities.getControl("customizeButton");
if (customizeButton) {
if (this._isHomePage && enableCustomization) {
WinJS.Utilities.removeClass(customizeButton.element, "hiddenButton");
customizeButton.label = PlatformJS.Services.resourceLoader.getString("EditTopics");
customizeButton.addEventListener("click", this._customizeButtonClickHandler)
}
else {
customizeButton.element.style.display = "none"
}
}
var edgy=PlatformJS.Utilities.getControl("actionEdgy");
var edgyBeforeShow=function() {
if (!that._isHomePage) {
NewsJS.Utilities.setupAddSectionButton(NewsJS.Personalization.Utilities.sectionType.InternationalBingDaily, {
title: that._title, market: that._market, appMarket: NewsJS.Globalization.getMarketString()
});
NewsJS.Utilities.setupPinInternationBDButton("pinInternatinalBD", "Pin Internation BingDaily", {
title: that._title, market: that._market, appMarket: NewsJS.Globalization.getMarketString()
})
}
};
this._bindableEdgyBeforeShowFn = edgyBeforeShow.bind(this);
edgy.addEventListener("beforeshow", this._bindableEdgyBeforeShowFn);
this.syncL2Categories();
this._jsLoadedPromise.then(function prefetchOrShowPrefetchStatus() {
if (!NewsJS.BingDaily._useOldPrefetchManager) {
if (!NewsJS.BingDaily._firsttimeFirstViewRealized && NewsJS.Utilities.CachedNetworkChecks.hasInternetConnection()) {
News.NewsUtil.instance.initializePrefetchManager(that._guid).then(function goingToPrefetch() {
that.startPrefetch(false);
NewsJS.BingDaily._firsttimeFirstViewRealized = true
})
}
else {
if (that.isHomeMarket()) {
NewsJS.BingDaily._prefetchUI.show()
}
}
}
else {
if (!NewsJS.PrefetchManager.isAppFirstViewRealizationComplete && NewsJS.Utilities.CachedNetworkChecks.hasInternetConnection()) {
that.startPrefetch(false);
NewsJS.PrefetchManager.isAppFirstViewRealizationComplete = true
}
else {
if (that.isHomeMarket()) {
NewsJS.PrefetchManager.showPrefetchStatus()
}
}
}
})
}, _updateClusterAddsFlag: function _updateClusterAddsFlag() {
if (this._clusters) {
for (var i=0, clusterLength=this._clusters.length; i < clusterLength; i++) {
var cluster=this._clusters.getAt(i);
var aDRenderClusterControlName=PlatformJS.BootCache.instance.getEntry("ADRenderClusterControlName", function() {
return PlatformJS.Services.appConfig.getString("ADRenderClusterControlName")
});
if (cluster && cluster.clusterContent && cluster.clusterContent.contentControl && cluster.clusterContent.contentControl === aDRenderClusterControlName) {
cluster.isEntityCluster = true
}
}
if (PlatformJS.Ads) {
PlatformJS.Ads.updateEntityClusters(this._clusters)
}
}
}, _customizeButtonClickHandler: function _customizeButtonClickHandler(event) {
NewsJS.Telemetry.BingDaily.recordEditButtonClick(event);
this.onCustomize()
}, _displayHiddenClustersInPreviewMode: function _displayHiddenClustersInPreviewMode() {
NewsApp.PersonalizationManager.getDefaultClusters(this._market).then(function(defaultClusters) {
var message="Customization is not enabled in preview mode:\r\nHidden clusters: ",
first=false;
for (var i=0, ilen=defaultClusters.length; i < ilen; i++) {
var cluster=defaultClusters[i];
if (cluster.hidden) {
message += cluster.title;
if (!first) {
message += ", "
}
first = true
}
}
var messageBar=new CommonJS.MessageBar(message, {autoHide: false});
messageBar.addButton(PlatformJS.Services.resourceLoader.getString("Dismiss") || PlatformJS.Services.resourceLoader.getString("/partners/Dismiss"), function() {
messageBar.hide()
});
messageBar.show()
})
}, _prefetch: function _prefetch() {
var prefetcher=PlatformJS.Utilities.createObject("NewsApp.Prefetch.BingDailyPrefetch", this.getPrefetchDefinition());
if (prefetcher && prefetcher.request) {
var prefetchPromise=prefetcher.request();
if (prefetchPromise && prefetchPromise.then) {
prefetchPromise.then(function(metadata) {
if (metadata) {
console.log(metadata);
var items=metadata.prefetchList;
if (items) {
AppEx.Common.ArticleReader.DeterminePrefetchStatus.clusterDownloadFailed = metadata.clusterDownloadFailure;
News.NewsUtil.instance.prefetchItems(prefetcher.guid, items)
}
}
})
}
}
}
}, {
_firsttimeFirstViewRealized: false, _prefetchUI: new PlatformJS.PrefetchUI.PrefetchUI, _useOldPrefetchManager: Windows.Storage.ApplicationData.current.localSettings["UseOldPrefetchManager"]
})});
function createSourceClickthroughs(clusterDefinition, clusterMetadata, sourceId, sourceMarket, feed) {
clusterMetadata.onHeaderSelection = function(key, position, cluster) {
getSource(clusterDefinition, sourceId, sourceMarket, feed).then(function(source) {
if (source) {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(NewsJS.Telemetry.String.ImpressionNavMethod.BingDaily);
NewsJS.Telemetry.BingDaily.recordSeeMorePress(clusterDefinition.guid, clusterDefinition.title);
NewsJS.Utilities.navigateToSource(source, function(src) {
NewsJS.Utilities.updateStateOnSourceVisited(src.id)
}, "bingdaily", sourceMarket)
}
})
};
clusterDefinition.onSeeMoreClick = function(clusterKey) {
getSource(clusterDefinition, sourceId, sourceMarket, feed).then(function(source) {
if (source) {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(NewsJS.Telemetry.String.ImpressionNavMethod.BingDaily);
NewsJS.Telemetry.BingDaily.recordSeeMorePress(clusterDefinition.guid, clusterDefinition.title);
NewsJS.Utilities.navigateToSource(source, function(src) {
NewsJS.Utilities.updateStateOnSourceVisited(src.id)
}, "bingdaily", sourceMarket)
}
})
}
}
function setUpSourceNavigation(clusterDefinition, clusterMetadata, sourceId, sourceMarket, feed) {
createSourceClickthroughs(clusterDefinition, clusterMetadata, sourceId, sourceMarket.toLowerCase(), feed)
}
function getSource(clusterDefinition, sourceId, sourceMarket, feed) {
return NewsJS.Utilities.readSources(sourceMarket, true).then(function(allSources) {
for (var idx=0; allSources && idx < allSources.length; idx++) {
if (allSources[idx].id === sourceId) {
return (allSources[idx])
}
}
if (feed) {
return NewsJS.Utilities.RSS.urlAsSyndicationFeedAsync(feed).then(function urlAsSyndicationFeedAsyncSucceed(syndicationFeed) {
var source=NewsJS.Utilities.RSS.syndicationFeedAsNewsSource(feed, syndicationFeed);
if (clusterDefinition && clusterDefinition.providerConfiguration && clusterDefinition.providerConfiguration.isCustomRSS) {
source.data.isCustomRSS = true
}
return source.data
}, function urlAsSyndicationFeedAsyncFailed(e) {
return null
})
}
return null
})
}
function setUpNavigation(clusterDefinition, clusterMetadata, loc, initialState) {
clusterMetadata.onHeaderSelection = function(key, position, cluster) {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(NewsJS.Telemetry.String.ImpressionNavMethod.BingDaily);
NewsJS.Telemetry.BingDaily.recordClusterHeaderPress(key, clusterDefinition.title, position);
WinJS.Navigation.navigate(loc, initialState)
};
clusterDefinition.onSeeMoreClick = function(clusterKey) {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(NewsJS.Telemetry.String.ImpressionNavMethod.BingDaily);
NewsJS.Telemetry.BingDaily.recordSeeMorePress(clusterDefinition.guid, clusterDefinition.title);
WinJS.Navigation.navigate(loc, initialState)
}
}
function setUpChannelNavigation(clusterDefinition, clusterMetadata, channel, state) {
clusterMetadata.onHeaderSelection = function(key, position, cluster) {
if (channel && state) {
state.telemetry = {
contextString: NewsJS.Telemetry.String.ImpressionContext.bingDaily + "/" + NewsJS.Telemetry.Utilities.convertClusterGuidToClusterId(key), guid: key, clusterName: clusterDefinition.title
};
state.title = state.title || clusterDefinition.title;
NewsJS.Telemetry.BingDaily.recordClusterHeaderPress(key, clusterDefinition.title, position);
PlatformJS.Navigation.navigateToChannel(channel, state)
}
};
clusterDefinition.onSeeMoreClick = function(clusterKey) {
if (channel && state) {
state.telemetry = {
contextString: NewsJS.Telemetry.String.ImpressionContext.bingDaily + "/" + NewsJS.Telemetry.Utilities.convertClusterGuidToClusterId(clusterDefinition.guid), guid: clusterDefinition.guid, clusterName: clusterDefinition.title
};
state.title = state.title || clusterDefinition.title;
NewsJS.Telemetry.BingDaily.recordSeeMorePress(clusterDefinition.guid, clusterDefinition.title);
PlatformJS.Navigation.navigateToChannel(channel, state)
}
}
}
function createUnknownControlMetadata(clusterDefinition, state, proxy) {
var metadata=createCategoryClusterMetadata(clusterDefinition, state, proxy);
return metadata
}
function createDevelopingNewsMetadata(clusterDefinition, state, proxy) {
var metadata=createCategoryClusterMetadata(clusterDefinition, state, proxy);
metadata.titleClass = "headerFontLight";
return metadata
}
function createMySourcesMetadata(clusterDefinition, state, proxy) {
var metadata=createCategoryClusterMetadata(clusterDefinition, state, proxy);
metadata.customizationItemBackgroundImage = "/images/Customization_Medium.png";
metadata.itemSize = CommonJS.Immersive.CUSTOMIZATIONTEMPLATESIZE.medium;
return metadata
}
function createMyCategoriesMetadata(clusterDefinition, state, proxy) {
var that=this;
clusterDefinition.goodState = state;
clusterDefinition.panorama = proxy;
var list=new WinJS.Binding.List;
list.push(NewsJS.Bindings.addTopicCardTile());
var pageState={
mode: NewsJS.Personalization.Utilities.selectionPageFormat.FORMAT_CLUSTER, features: [NewsJS.Personalization.Utilities.selectionPageFeature.TYPE_CATEGORIES], isBrowse: false, title: PlatformJS.Services.resourceLoader.getString("AddSection"), guid: clusterDefinition.guid
};
var options={addTileOptions: {
itemclick: function itemclick(el) {
PlatformJS.Navigation.navigateToChannel("SelectionPage", pageState)
}, itemDataSource: list.dataSource, className: "newsMoreEntriesTile"
}};
return {
clusterKey: clusterDefinition.guid, clusterTitle: clusterDefinition.title, hideTitle: false, clusterContent: {
contentControl: clusterDefinition.clusterType, contentOptions: options
}, clusterEntity: createClusterEntityMetadata(clusterDefinition)
}
}
function createClusterEntityMetadata(clusterDefinition) {
var thumbnail=null;
var templateId="homeSemanticTileNoImage";
if (clusterDefinition.semanticZoomThumbnailUrl) {
thumbnail = {url: clusterDefinition.semanticZoomThumbnailUrl};
templateId = "homeSemanticTile"
}
var clusterEntity={
title: clusterDefinition.title, thumbnail: thumbnail, moduleInfo: {
height: "140px", width: "290px", fragmentPath: "/html/templates.html", templateId: templateId
}
};
return clusterEntity
}
function createCustomSourcesMetadata(clusterDefinition, state, proxy) {
var config=clusterDefinition.providerConfiguration || {},
categoryKey=config.categoryKey,
clusterKey=clusterDefinition.guid;
clusterDefinition.state = state;
clusterDefinition.goodState = state;
clusterDefinition.panorama = proxy;
return {
clusterKey: clusterKey, clusterTitle: clusterDefinition.title, clusterContent: {
contentControl: clusterDefinition.clusterType, contentOptions: clusterDefinition
}, onHeaderSelection: function onHeaderSelection(key, position, cluster) {
NewsJS.Telemetry.BingDaily.recordClusterHeaderPress(key, clusterDefinition.title, position);
NewsJS.Utilities.navigateToSource(config.source, function(src) {
NewsJS.Utilities.updateStateOnSourceVisited(src.id)
}, "sourcegallery")
}, clusterEntity: {
title: clusterDefinition.title, moduleInfo: {
height: "140px", width: "290px", fragmentPath: "/html/templates.html", templateId: "homeSemanticTileNoImage"
}
}
}
}
function createCategoryClusterMetadata(clusterDefinition, state, proxy) {
var config=clusterDefinition.providerConfiguration || {},
categoryKey=config.categoryKey,
clusterKey=clusterDefinition.guid;
if (config.providerType === "NewsApp.DataProviders.PartnerSourcesProvider" || config.providerType === "NewsApp.RSS.CustomRSSProvider" || config.providerType === "NewsApp.RSS.BingRSSProvider" || config.providerType === "NewsApp.DataProviders.NYTProvider") {
return createCustomSourcesMetadata(clusterDefinition, state, proxy)
}
clusterDefinition.goodState = state;
clusterDefinition.panorama = proxy;
var metaData={
itemSize: CommonJS.Immersive.CUSTOMIZATIONTEMPLATESIZE.large, customizationItemBackgroundImage: "/images/Customization_Large.png", clusterKey: clusterKey, clusterTitle: clusterDefinition.title, clusterContent: {
contentControl: clusterDefinition.clusterType, contentOptions: clusterDefinition
}, clusterEntity: createClusterEntityMetadata(clusterDefinition)
};
if (clusterDefinition.pinned) {
metaData.pinned = true
}
return metaData
}
function createTempClusterMetadata(clusterDefinition, state, proxy) {
clusterDefinition.goodState = state;
clusterDefinition.panorama = proxy;
return {
isTempCluster: clusterDefinition.providerConfiguration && clusterDefinition.providerConfiguration.strategy === "GettingStarted" ? true : false, isLastCluster: clusterDefinition.providerConfiguration && clusterDefinition.providerConfiguration.strategy === "NextSteps" ? true : false, platformInvisibleCluster: true, platformInvisiblePermanentCluster: true, pinned: clusterDefinition.pinned ? true : false, clusterKey: clusterDefinition.guid, clusterTitle: clusterDefinition.title, titleClass: NewsApp.PersonalizationManager.isNextStepsCluster(clusterDefinition) ? "nextSteps" : "", hideTitle: false, isSticky: true, clusterContent: {
contentControl: clusterDefinition.clusterType, contentOptions: clusterDefinition
}, clusterEntity: createClusterEntityMetadata(clusterDefinition)
}
}
function createHeroClusterMetadata(clusterDefinition, state, proxy) {
clusterDefinition.goodState = state;
clusterDefinition.panorama = proxy;
return {
pinned: clusterDefinition.pinned ? true : false, isHero: true, itemSize: CommonJS.Immersive.CUSTOMIZATIONTEMPLATESIZE.large, clusterKey: clusterDefinition.guid, clusterTitle: clusterDefinition.title, hideTitle: true, isSticky: true, supressTitleInHeader: true, titleClass: "headerFontLight", clusterContent: {
contentControl: clusterDefinition.clusterType, contentOptions: clusterDefinition
}, clusterEntity: createClusterEntityMetadata(clusterDefinition)
}
}
function createFeaturedSourcesMetata(clusterDefinition, state, proxy) {
var config=clusterDefinition.providerConfiguration || {},
categoryKey=config.categoryKey,
clusterKey=clusterDefinition.guid;
clusterDefinition.goodState = state;
clusterDefinition.panorama = proxy;
return {
clusterKey: clusterKey, clusterTitle: clusterDefinition.title, clusterContent: {
contentControl: clusterDefinition.clusterType, contentOptions: clusterDefinition
}, clusterEntity: {
title: clusterDefinition.title, moduleInfo: {
height: "140px", width: "290px", fragmentPath: "/html/templates.html", templateId: "homeSemanticTileNoImage"
}
}
}
}
function processTitle(title) {
var result=title,
len=title ? title.length : 0;
if (title && title.indexOf("_") === 0 && title.lastIndexOf("_") === len - 1) {
result = PlatformJS.Services.resourceLoader.getString(title.substring(1, len - 1))
}
return result
}
})()