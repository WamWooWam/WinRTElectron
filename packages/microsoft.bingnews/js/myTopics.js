/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
WinJS.Namespace.define("NewsJS", {MyTopics: WinJS.Class.derive(NewsJS.NewsBasePage, function(state) {
NewsJS.NewsBasePage.call(this, state);
var that=this;
if (!state) {
state = {}
}
else {
this._panoramaState = state.panoramaState
}
this._state = state;
this._sortedClusters = null;
this._visibleClusters = null;
this._topicsClusterIndex = 0;
this.numNonTopicClusters = 0;
this.numNonTopicLeadingClusters = 0;
this.showTopicHeaderTitles = PlatformJS.Services.appConfig.getDictionary("TopicsConfig").getBool("showTopicHeaderTitles");
this.sortResultsByDate = PlatformJS.Services.appConfig.getDictionary("TopicsConfig").getBool("sortResultsByDate");
that.numColumnsPerTopic = PlatformJS.Services.appConfig.getDictionary("TopicsConfig").getInt32("numColumnsPerTopic");
that.allowPromote = PlatformJS.Services.appConfig.getDictionary("TopicsConfig").getBool("allowPromote");
that.displayLimit = PlatformJS.Services.appConfig.getDictionary("TopicsConfig").getInt32("maxFollowsDisplay");
that.orderingPosition = PlatformJS.Services.appConfig.getDictionary("TopicsPanoOrder").getInt32("topics");
that.moreOrder = PlatformJS.Services.appConfig.getDictionary("TopicsPanoOrder").getInt32("moretopics");
that.collapseOnZoom = PlatformJS.Services.appConfig.getDictionary("TopicsConfig").getBool("collapseTopicClustersOnZoom");
that.showMoreButton = PlatformJS.Services.appConfig.getDictionary("TopicsConfig").getBool("showMoreButton");
if (that.showMoreButton) {
this.numNonTopicClusters++;
if (that.moreOrder < that.orderingPosition) {
this.numNonTopicLeadingClusters++
}
}
this.zoomRenderer = function(itemPromise) {
return {element: itemPromise.then(function(group) {
var div=document.createElement("div");
if (group.data.clusterKey === "last" || group.data.clusterEntity) {
WinJS.Utilities.addClass(div, "platformSemanticZoomItem");
var title;
var type;
if (group.data.clusterKey === "last") {
title = that._clusterTitle(group.data);
type = "addTopic";
div.setAttribute("id", "addTopic")
}
else {
title = group.data.clusterEntity.title;
type = group.data.clusterEntity.type
}
var binding=NewsJS.Bindings.semanticZoomTopicTile(title, type);
if (binding) {
CommonJS.setModuleSizeAndClass(binding.moduleInfo, div);
CommonJS.loadModule(binding.moduleInfo, binding, div).then(function() {
var elt=div.querySelector(".topicSemanticZoomContainer");
if (elt) {
NewsJS.Bindings.clusterColorMapper(binding, elt)
}
})
}
}
return div
})}
};
WinJS.Utilities.markSupportedForProcessing(this.zoomRenderer);
this.isOnline = NewsJS.Utilities.CachedNetworkChecks.hasInternetConnection();
this.loadPageData(false);
NewsJS.Telemetry.Topics.recordPreferences()
}, {
_providers: null, _clusters: null, _sortedClusters: null, _visibleClusters: null, _selectedTopics: null, orderingPosition: -1, displayLimit: -1, collapseOnZoom: true, numNonTopicLeadingClusters: 0, numNonTopicClusters: 0, numColumnsPerTopic: 1, showMoreButton: false, allowPromote: false, showTopicHeaderTitles: false, contextMenu: null, contextMenuCommand: null, moreOrder: 0, sortResultsByDate: false, zoomRenderer: null, telemetry: {searchOrigin: NewsJS.Telemetry.Search.Origin.topics}, onRoamingStateChanged: function onRoamingStateChanged() {
NewsJS.Utilities.cancelPromise(this._pageDataPromise);
CommonJS.forceRefresh()
}, createRefreshButtonEvents: function createRefreshButtonEvents() {
var that=this;
var refreshButton=PlatformJS.Utilities.getControl("refreshButton");
refreshButton.label = PlatformJS.Services.resourceLoader.getString("Refresh");
refreshButton.onclick = function(e) {
that._refreshPage();
that.setTopicButtonStates();
NewsJS.Telemetry.Topics.recordRefreshButtonClick(e)
}
}, createSemanticZoomEvents: function createSemanticZoomEvents() {
var semanticZoom=PlatformJS.Utilities.getControl("news_Panorama");
if (semanticZoom) {
this._onZoomChangedHandler = this._onZoomChanged.bind(this);
semanticZoom.addEventListener("zoomchanged", this._onZoomChangedHandler)
}
}, initializeProviders: function initializeProviders() {
if (!this._providers) {
this.createTopicProviders()
}
}, getPageImpressionContext: function getPageImpressionContext() {
return NewsJS.Telemetry.String.ImpressionContext.topics
}, getPageState: function getPageState() {
var panoControl=PlatformJS.Utilities.getControl("news_Panorama");
if (panoControl) {
this._state.panoramaState = panoControl.getPanoramaState()
}
return this._state
}, getPageData: function getPageData() {
var that=this;
that.initializeProviders();
that.createRefreshButtonEvents();
that.createSemanticZoomEvents();
that.createTopicButtons();
return WinJS.Promise.wrap({
title: PlatformJS.Services.resourceLoader.getString("MyTopics"), zoomOutOptions: {
selectionMode: "multi", oniteminvoked: function oniteminvoked(event) {
var moreIndex=-1;
if (that.showMoreButton) {
moreIndex = that.moreOrder < that.orderingPosition ? 0 : that._visibleClusters.length - 1;
if (event.detail.itemIndex === moreIndex) {
var panorama=PlatformJS.Utilities.getControl("news_Panorama");
panorama.zoomOptions = {locked: true};
NewsJS.Utilities.presentTopicModalPrompt().then(function(topic) {
panorama.zoomOptions = {locked: false};
if (topic) {
var listView=PlatformJS.Utilities.getControl("news_Panorama_zoomOut");
if (listView) {
listView.selection.clear()
}
that.onNewTopic(topic)
}
})
}
}
}, onselectionchanging: function onselectionchanging(eventInfo) {
var selection=eventInfo.detail.newSelection;
var moreIndex=that.moreOrder < that.orderingPosition ? 0 : that._visibleClusters.length - 1;
selection.remove(moreIndex)
}, onselectionchanged: function onselectionchanged(eventInfo) {
that.selectionChanged(eventInfo);
var actionEdgyCtl=PlatformJS.Utilities.getControl("actionEdgy");
if (actionEdgyCtl) {
var listView=eventInfo.target.winControl;
if (listView) {
if (!actionEdgyCtl.hidden && listView.selection.count() === 0) {
actionEdgyCtl.hide();
actionEdgyCtl.sticky = false
}
else if (actionEdgyCtl.hidden && listView.selection.count() > 0) {
actionEdgyCtl.sticky = true;
actionEdgyCtl.show()
}
}
}
}
}, headerOptions: that.commonHeaderOptions, semanticZoomRenderer: that.zoomRenderer, clusters: this.createClusters().dataSource, panoramaState: that._panoramaState
})
}, createTopicProvider: function createTopicProvider(topicEntity) {
var that=this;
var result=null;
var topic=topicEntity.title;
var query=topicEntity.query;
var type=topicEntity.type;
this._providers[topic.toLocaleLowerCase()] = result = new NewsJS.AlgoNewsProvider({
query: query, title: topic, providerConsumer: that, queryFunction: function queryFunction(q, bypassCache) {
return NewsJS.Data.Bing.getNewsSearch(q, 0, 20, that.sortResultsByDate, bypassCache ? true : false, that._providers[topic.toLowerCase()], NewsJS.Telemetry.Search.FormCode.topics)
}, onsuccess: function onsuccess(lastUpdatedTime) {
NewsJS.Utilities.setLastUpdatedTime([lastUpdatedTime])
}, onerror: function onerror(){}
});
return result
}, createTopicProviders: function createTopicProviders() {
var that=this;
var providerArray=[];
this._providers = {};
var followedTopics=NewsJS.StateHandler.instance.getTopics();
var followedTopicsLength=followedTopics ? followedTopics.length : 0;
var limit=Math.min(followedTopicsLength, that.displayLimit);
for (var i=0; i < limit; i++) {
providerArray.push(that.createTopicProvider(followedTopics[i]))
}
return providerArray
}, setButtonDisplayState: function setButtonDisplayState(buttonElement, display) {
if (display) {
WinJS.Utilities.removeClass(buttonElement, "followedHideNavButton")
}
else {
WinJS.Utilities.addClass(buttonElement, "followedHideNavButton")
}
}, providerForTopic: function providerForTopic(topicEntity) {
var that=this;
var provider=that._providers[topicEntity.title.toLocaleLowerCase()];
if (!provider) {
that.createTopicProvider(topicEntity);
provider = that._providers[topicEntity.title.toLocaleLowerCase()]
}
return provider
}, createNewsCluster: function createNewsCluster(topicEntity) {
var that=this;
var topic=topicEntity.title;
return {
clusterEntity: topicEntity, clusterKey: topic, clusterPosition: that.orderingPosition, clusterTitle: that.showTopicHeaderTitles ? topic : PlatformJS.Services.resourceLoader.getString("MyTopics"), onHeaderSelection: function onHeaderSelection(clusterKey, clusterIndex, cluster) {
that.clusterHeaderClicked.call(that, topicEntity, clusterIndex)
}, clusterContent: {
contentControl: "CommonJS.News.EntityCluster", contentOptions: {
mode: CommonJS.News.ClusterMode.dynamic, onrendercomplete: function onrendercomplete(elements) {
var heading=elements[0];
if (heading) {
var buttonContainer=heading.querySelector(".topicButtonContainer");
if (buttonContainer) {
PlatformJS.Utilities.enablePointerUpDownAnimations(buttonContainer)
}
}
}, onitemclick: function onitemclick(e) {
var itemTemplate=e.detail.item.template;
if (itemTemplate !== "clusterHeadingTopicTile") {
var panorama=PlatformJS.Utilities.getControl("news_Panorama");
var newsCluster=panorama.getClusterContentControl(topic);
var newsItems=newsCluster ? newsCluster.newsItems : null;
that.itemInvoked(e, {
subTitle: topic, articles: newsItems.slice(1)
})
}
}, provider: that.providerForTopic(topicEntity), noResultsMessage: PlatformJS.Services.resourceLoader.getString("NoTopicResultsMessage"), maxColumnCount: that.numColumnsPerTopic, configKey: "EntityClusterDefaultNewsConfig", configObject: CommonJS.News.EntityClusterConfig.DefaultNews, theme: "newsAppTheme", enableSeeMore: true, categoryKey: topic, categoryName: topic, onseemoreclick: function onseemoreclick() {
NewsJS.Telemetry.Topics.recordSeeMorePress(topic);
that.openTopicPage(topicEntity)
}, telemetry: {getCurrentImpression: function getCurrentImpression() {
return PlatformJS.Navigation.mainNavigator.getCurrentImpression()
}}
}
}
}
}, createVisibleClusters: function createVisibleClusters() {
var clusters=new WinJS.Binding.List;
var limit=Math.min(this._sortedClusters.length, this.numNonTopicClusters + this.displayLimit);
for (var i=0; i < limit - 1; i++) {
clusters.push(this._sortedClusters.getItem(i).data)
}
clusters.push(this._sortedClusters.getItem(this._sortedClusters.length - 1).data);
return clusters
}, createClusters: function createClusters() {
var clusters=new WinJS.Binding.List;
var topics=NewsJS.StateHandler.instance.getTopics();
if (topics) {
for (var i=0; i < topics.length; i++) {
clusters.push(this.createNewsCluster(topics[i]));
if (i === 0) {
this._topicsClusterIndex = clusters.length - 1
}
}
}
if (this.showMoreButton) {
this.addMoreButton(clusters)
}
this._sortedClusters = clusters;
return this._visibleClusters = this.createVisibleClusters()
}, loadPageData: function loadPageData(bypassCache) {
this.bypassCache = bypassCache;
if (bypassCache) {
var panorama=PlatformJS.Utilities.getControl("news_Panorama");
panorama.refresh()
}
}, appWentOnline: function appWentOnline() {
NewsJS.NewsBasePage.prototype.appWentOnline.call(this)
}, appWentOffline: function appWentOffline() {
NewsJS.NewsBasePage.prototype.appWentOffline.call(this)
}, toggleOfflineArticles: function toggleOfflineArticles(enabled){}, removeTopicCluster: function removeTopicCluster(indexInSortedList) {
var numNonTopicTrailingClusters=this.numNonTopicClusters - this.numNonTopicLeadingClusters;
this._sortedClusters.splice(indexInSortedList, 1);
if (indexInSortedList < this._visibleClusters.length - numNonTopicTrailingClusters) {
this._visibleClusters.splice(indexInSortedList, 1)
}
}, addTopicCluster: function addTopicCluster(newCluster) {
this._sortedClusters.splice(this.numNonTopicLeadingClusters, 0, newCluster);
this._visibleClusters.splice(this.numNonTopicLeadingClusters, 0, newCluster)
}, showNewTopic: function showNewTopic(topic) {
var theClusters=this._sortedClusters;
var panorama=PlatformJS.Utilities.getControl("news_Panorama");
var indexToRemove=-1;
var clusterData=null;
for (var idx=this.numNonTopicLeadingClusters; idx < theClusters.length; idx++) {
clusterData = theClusters.getAt(idx);
if (NewsJS.Utilities.culturedStringsEqual(clusterData.clusterKey, topic)) {
indexToRemove = idx;
break
}
}
if (indexToRemove >= 0) {
this.removeTopicCluster(indexToRemove)
}
var topicEntity=NewsJS.StateHandler.instance.getTopics()[NewsJS.Utilities.topicIndexOf(topic)];
var newCluster=this.createNewsCluster(topicEntity);
this.addTopicCluster(newCluster);
var numDisplayedAfterAdd=this._visibleClusters.length - this.numNonTopicClusters;
if (numDisplayedAfterAdd > this.displayLimit) {
this._visibleClusters.splice(this.displayLimit + this.numNonTopicLeadingClusters, 1)
}
if (this._topicsClusterIndex >= 0) {
panorama.currentClusterIndex = this._topicsClusterIndex
}
}, openTopicPage: function openTopicPage(topic) {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(NewsJS.Telemetry.String.ImpressionNavMethod.topicHeader);
WinJS.Navigation.navigate({
fragment: "/html/search.html", page: "NewsJS.Search"
}, {
topicEntry: topic, queryText: topic.query, searchOrigin: NewsJS.Telemetry.Search.Origin.topicHeader
})
}, onRemoveTopics: function onRemoveTopics() {
if (this._selectedTopics.length > 0) {
var items=this._selectedTopics;
var topicsToRemove=[];
var idx;
for (idx = 0; idx < items.length; idx++) {
topicsToRemove.push(items[idx].data.clusterEntity.title)
}
NewsJS.Utilities.unfollowTopics(topicsToRemove);
for (idx = 0; idx < topicsToRemove.length; idx++) {
this.onRemoveTopicWorker(topicsToRemove[idx])
}
}
NewsJS.Telemetry.Topics.recordPreferences()
}, onRemoveTopicWorker: function onRemoveTopicWorker(topic) {
var theClusters=this._sortedClusters;
var indexToRemove=-1;
for (var idx=this.numNonTopicLeadingClusters; idx < theClusters.length; idx++) {
var clusterData=theClusters.getAt(idx);
if (NewsJS.Utilities.culturedStringsEqual(clusterData.clusterKey, topic)) {
indexToRemove = idx;
break
}
}
if (indexToRemove >= 0) {
this.removeTopicCluster(indexToRemove)
}
delete this._providers[topic.toLocaleLowerCase()]
}, onRemoveTopic: function onRemoveTopic(topic) {
var success=NewsJS.Utilities.unfollowTopic(topic);
if (success) {
var panorama=PlatformJS.Utilities.getControl("news_Panorama");
this.onRemoveTopicWorker(topic);
var numDisplayedAfterRemove=this._visibleClusters.length - this.numNonTopicClusters;
var theClusters=this._sortedClusters;
if (NewsJS.StateHandler.instance.getTopics().length > numDisplayedAfterRemove && numDisplayedAfterRemove < this.displayLimit) {
var idx=numDisplayedAfterRemove + this.numNonTopicLeadingClusters;
this._visibleClusters.splice(idx, 0, theClusters.getItem(idx).data)
}
if (this.showMoreButton) {
var clusterControl=panorama.getClusterContentControl("last");
if (clusterControl) {
clusterControl.refresh()
}
}
}
NewsJS.Telemetry.Topics.recordPreferences()
}, addMoreButton: function addMoreButton(clusters) {
var that=this;
var list=new WinJS.Binding.List;
var title=PlatformJS.Services.resourceLoader.getString("AddTopic");
list.push(NewsJS.Bindings.addTopicCardTile());
clusters.push({
clusterKey: "last", clusterPosition: PlatformJS.Services.appConfig.getDictionary("TopicsPanoOrder").getInt32("moretopics"), clusterTitle: title, clusterContent: {
contentControl: "NewsJS.Controls.MoreColumnControl", contentOptions: {addTileOptions: {
itemclick: function itemclick(element) {
NewsJS.Telemetry.Topics.recordAddTopicTilePress();
NewsJS.Utilities.presentTopicModalPrompt().then(function(topic) {
if (topic) {
that.onNewTopic(topic)
}
})
}, itemDataSource: list.dataSource, className: "newsMoreEntriesTile"
}}
}
})
}, _clusterTitle: function _clusterTitle(groupData) {
var that=this;
if (groupData.clusterKey === "last") {
return PlatformJS.Services.resourceLoader.getString("AddTopic")
}
return that.collapseOnZoom ? groupData.clusterTitle : groupData.clusterKey
}, selectionChanged: function selectionChanged(eventInfo) {
var that=this;
var listView=eventInfo.target.winControl;
listView.selection.getItems().then(function(items) {
var numItemsSelected=items.length;
if (numItemsSelected) {
if (items[numItemsSelected - 1].data.clusterKey === "last") {
items.splice(items.length - 1, 1)
}
}
that._selectedTopics = items;
that.setTopicButtonStates()
})
}, createTopicButtons: function createTopicButtons() {
var that=this;
var addButton=PlatformJS.Utilities.getControl("MoreTopics");
addButton.label = PlatformJS.Services.resourceLoader.getString("Add");
addButton.onclick = function(e) {
NewsJS.Utilities.presentTopicModalPrompt().then(function(topic) {
if (topic) {
that.onNewTopic(topic)
}
});
NewsJS.Telemetry.Topics.recordAddButtonClick(e)
};
var promoteButton=PlatformJS.Utilities.getControl("PromoteTopic");
promoteButton.label = PlatformJS.Services.resourceLoader.getString("PromoteTopic");
promoteButton.onclick = function(e) {
if (that._selectedTopics && that._selectedTopics.length === 1) {
var topicToPromote=that._selectedTopics[0].data.clusterEntity.title;
that.onNewTopic(topicToPromote)
}
NewsJS.Telemetry.Topics.recordPromoteButtonClick(e)
};
var clearButton=PlatformJS.Utilities.getControl("ClearSelection");
clearButton.label = PlatformJS.Services.resourceLoader.getString("ClearSelection");
clearButton.onclick = function(e) {
var listView=PlatformJS.Utilities.getControl("news_Panorama_zoomOut");
if (listView) {
listView.selection.clear()
}
NewsJS.Telemetry.Topics.recordClearButtonClick(e)
};
var removeButton=PlatformJS.Utilities.getControl("RemoveTopics");
if (removeButton) {
removeButton.label = PlatformJS.Services.resourceLoader.getString("RemoveTopics");
removeButton.onclick = function(e) {
that.onRemoveTopics();
NewsJS.Telemetry.Topics.recordRemoveButtonClick(e)
}
}
var editButton=PlatformJS.Utilities.getControl("EditTopics");
if (editButton) {
editButton.label = PlatformJS.Services.resourceLoader.getString("Remove");
editButton.onclick = function(e) {
var panorama=PlatformJS.Utilities.getControl("news_Panorama");
if (panorama) {
var messageText=PlatformJS.Services.resourceLoader.getString("RemoveSectionsTextLabel");
var messageBar=new CommonJS.MessageBar(messageText, {
autoHide: true, autoHideTimeout: 15000
});
messageBar.addButton(PlatformJS.Services.resourceLoader.getString("Dismiss"), function() {
messageBar.hide()
});
messageBar.show();
panorama.zoomOptions = {zoomedOut: true}
}
NewsJS.Telemetry.Topics.recordEditButtonClick(e)
}
}
this.setTopicButtonStates()
}, buttonElement: function buttonElement(buttonName) {
var buttonControl=PlatformJS.Utilities.getControl(buttonName);
return buttonControl ? buttonControl.element : null
}, setTopicButtonStates: function setTopicButtonStates() {
var that=this;
var addButton=that.buttonElement("AddTopic");
var promoteButton=that.buttonElement("PromoteTopic");
var removeButton=that.buttonElement("RemoveTopics");
var clearButton=that.buttonElement("ClearSelection");
var editButton=that.buttonElement("EditTopics");
var numSelected=this._selectedTopics ? this._selectedTopics.length : 0;
if (addButton) {
if (numSelected === 0) {
that.setButtonDisplayState(addButton, true)
}
else {
that.setButtonDisplayState(addButton, false)
}
}
if (editButton) {
if (NewsJS.StateHandler.instance.getTopics().length) {
var semanticZoom=PlatformJS.Utilities.getControl("news_Panorama_semanticZoom");
if (semanticZoom) {
that.setButtonDisplayState(editButton, !semanticZoom.zoomedOut)
}
else {
that.setButtonDisplayState(editButton, true)
}
}
else {
that.setButtonDisplayState(editButton, false)
}
}
if (promoteButton) {
if (numSelected === 1) {
if (this.allowPromote && this._selectedTopics[0].data.type !== "favorite") {
that.setButtonDisplayState(promoteButton, true)
}
else {
that.setButtonDisplayState(promoteButton, false)
}
}
else {
that.setButtonDisplayState(promoteButton, false)
}
}
if (clearButton && removeButton) {
if (numSelected >= 2) {
that.setButtonDisplayState(clearButton, true);
that.setButtonDisplayState(removeButton, true)
}
else if (numSelected >= 1) {
that.setButtonDisplayState(clearButton, false);
that.setButtonDisplayState(removeButton, true)
}
else {
that.setButtonDisplayState(clearButton, false);
that.setButtonDisplayState(removeButton, false)
}
}
}, onNewTopic: function onNewTopic(topic) {
var that=this;
if (topic && topic.length > 0) {
var success=NewsJS.Utilities.followTopic(topic);
if (success) {
NewsJS.Telemetry.Topics.recordAddTopic(topic);
that.showNewTopic(topic);
that.setTopicButtonStates()
}
}
NewsJS.Telemetry.Topics.recordPreferences()
}, clusterHeaderClicked: function clusterHeaderClicked(clusterEntity, clusterIndex) {
var that=this;
NewsJS.Telemetry.Topics.recordSectionHeaderPress(clusterEntity.title, clusterIndex);
if (that.showTopicHeaderTitles) {
that.openTopicPage(clusterEntity)
}
}, itemInvoked: function itemInvoked(e, listInfo) {
var item=e.item;
if ((item && item.sentinel) || this.checkOffline()) {
return
}
if (item) {
if (item.invokeBehavior && item.invokeBehavior === "Search") {
var query=item.query;
if (!query) {
return
}
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(NewsJS.Telemetry.String.ImpressionNavMethod.topic);
WinJS.Navigation.navigate({
fragment: "/html/search.html", page: "NewsJS.Search"
}, {
queryText: query, searchOrigin: NewsJS.Telemetry.Search.Origin.topics
})
}
else {
NewsJS.Telemetry.Topics.recordTopicItemPress(item);
NewsJS.Utilities.launchArticle(item, listInfo)
}
}
}, dispose: function dispose() {
var semanticZoom=PlatformJS.Utilities.getControl("news_Panorama");
if (semanticZoom) {
semanticZoom.removeEventListener("zoomchanged", this._onZoomChangedHandler);
this._onZoomChangedHandler = null
}
NewsJS.NewsBasePage.prototype.dispose.call(this)
}, _onZoomChanged: function _onZoomChanged(evt) {
var listView=PlatformJS.Utilities.getControl("news_Panorama_zoomOut");
if (listView) {
listView.selection.clear()
}
var actionEdgyCtl=PlatformJS.Utilities.getControl("actionEdgy");
if (actionEdgyCtl && actionEdgyCtl.sticky) {
actionEdgyCtl.sticky = false
}
this.setTopicButtonStates()
}
})})
})()