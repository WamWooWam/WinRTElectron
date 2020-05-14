/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
WinJS.Namespace.define("NewsJS.Customization", {SelectionPageProvider: WinJS.Class.define(function(options) {
options = options || {};
this.isBrowse = options.isBrowse;
this.features = options.features;
this.mode = options.mode;
this.title = options.title;
this.guid = options.guid;
this.appMarket = options.appMarket;
this.pendingActions = [];
NewsJS.Customization.categoriesAdded = false
}, {
getContent: function getContent(market, type) {
NewsJS.Customization.categoriesAdded = false;
if (!this.currentMarket || this.currentMarket !== market) {
this.refresh();
this.results = null;
this.currentMarket = market
}
var promises=[];
for (var i=0; i < this.features.length; i++) {
var feature=this.features[i];
switch (feature) {
case NewsJS.Personalization.Utilities.selectionPageFeature.TYPE_SOURCES:
promises.push(this.sourcesDataManager.getContent(this.currentMarket, type, this.mode));
break;
case NewsJS.Personalization.Utilities.selectionPageFeature.TYPE_TOPICS:
break;
case NewsJS.Personalization.Utilities.selectionPageFeature.TYPE_INTERNATIONAL:
promises.push(this.categoriesDataManager.getAllAsync(this.currentMarket, type, this.mode));
break;
case NewsJS.Personalization.Utilities.selectionPageFeature.TYPE_CATEGORIES:
promises.push(this.categoriesDataManager.getAllAsync(this.currentMarket, "categories_grouped", this.mode));
break
}
}
return WinJS.Promise.join(promises).then(function(complete) {
var results={};
for (var i=0; i < complete.length; i++) {
var json=complete[i];
for (var k in json) {
results[k] = json[k]
}
}
return results
}, function(err) {
return null
})
}, _constructLocalTab: function _constructLocalTab() {
var localTab={};
localTab[PlatformJS.Services.resourceLoader.getString("LocalSourcesTileTitle")] = [{data: ""}];
return WinJS.Promise.wrap(localTab)
}, refresh: function refresh(){}, getPageTitle: function getPageTitle() {
return this.title.toUpperCase()
}, categoriesDataManager: {get: function get(market) {
if (!this.cdm) {
this.cdm = NewsJS.Customization.getCategoriesDataManager({guid: this.guid})
}
return this.cdm
}}, sourcesDataManager: {get: function get() {
if (!this.sdm) {
this.sdm = new NewsJS.SourcesGalleryProvider({
forceMerge: true, guid: this.guid, appMarket: this.appMarket
})
}
return this.sdm
}}, getActionItem: function getActionItem(item, isAddAction) {
var actionItem={add: isAddAction};
item.market = item.market || this.currentMarket;
if (item.cluster) {
actionItem.item = item.cluster;
actionItem.type = "category"
}
else if (item.source) {
actionItem.item = item;
actionItem.type = "source"
}
else if (item.topic) {
actionItem.item = item.displayname;
actionItem.type = "topic"
}
return actionItem
}, _followOrUnfollowItems: function _followOrUnfollowItems(actionType, addedItems, removedItems) {
if (!actionType || !addedItems || !removedItems) {
return WinJS.Promise.wrap(false)
}
switch (actionType) {
case"source":
if (this.mode === NewsJS.Personalization.Utilities.selectionPageFormat.FORMAT_SOURCE) {
return this.sourcesDataManager.updateManyAsync(addedItems, removedItems).then(function(success) {
console.log(success);
return true
}, function(error) {
console.log(error);
return false
})
}
break;
case"category":
if (this.mode === NewsJS.Personalization.Utilities.selectionPageFormat.FORMAT_CLUSTER) {
return this.categoriesDataManager.updateManyAsync(addedItems, removedItems).then(function(success) {
console.log(success);
return true
}, function(error) {
console.log(error);
return false
})
}
}
return WinJS.Promise.wrap(true)
}, followItem: function followItem(item) {
var action=this.getActionItem(item, true);
var items=[];
items.push(action.item);
return this._followOrUnfollowItems(action.type, items, [])
}, unfollowItem: function unfollowItem(item) {
var action=this.getActionItem(item, false);
var removedItems=[];
removedItems.push(action.item);
return this._followOrUnfollowItems(action.type, [], removedItems)
}, createSearchItemData: function createSearchItemData(searchQuery, market) {
var that=this;
if (this.mode === NewsJS.Personalization.Utilities.selectionPageFormat.FORMAT_CLUSTER) {
return new WinJS.Promise(function(complete) {
NewsApp.PersonalizationManager.getClusterDefinitions(market).then(function(userClusters) {
var item=that._createTopicsClusterDefinition(searchQuery, market, userClusters);
complete(item)
})
})
}
else if (this.mode === NewsJS.Personalization.Utilities.selectionPageFormat.FORMAT_SOURCE) {
return WinJS.Promise.wrap({data: {
id: searchQuery, displayname: searchQuery, tileType: "SearchResultTopic", topic: true, win8_image: ""
}})
}
}, _createTopicsClusterDefinition: function _createTopicsClusterDefinition(val, market, userClusters) {
var clusterDefinition=NewsApp.PersonalizationManager.createTopicUserSection(val, val, market);
var item={};
item.data = {};
item.data.topic = true;
item.data.cluster = clusterDefinition;
item.data.displayname = val;
item.data.id = val;
item.data.tileType = "SearchResultTopic";
item.data.win8_image = "";
if (userClusters) {
var state={clustersDefinition: userClusters};
item.data.selected = NewsApp.PersonalizationManager.isTopicFollowed(state, val)
}
else {
item.data.selected = false
}
return item
}, createRSSItemData: function createRSSItemData(market, data) {
var that=this;
var itemData=data;
if (this.mode === NewsJS.Personalization.Utilities.selectionPageFormat.FORMAT_CLUSTER) {
return new WinJS.Promise(function(complete) {
NewsApp.PersonalizationManager.getClusterDefinitionsState(market).then(function(userClusters) {
itemData.cluster = NewsApp.PersonalizationManager.createSourceSection("rss", market, data);
itemData.selected = NewsApp.PersonalizationManager.isSourceFollowed(userClusters, data.id, market, "rss");
complete(itemData)
})
})
}
else {
itemData.selected = NewsJS.Utilities.isSourceFollowed(data, {
market: this.appMarket, guid: this.guid
});
return WinJS.Promise.wrap(itemData)
}
}, commitItems: function commitItems() {
var categoryAdd=[];
var categoryRemove=[];
var sourceAdd=[];
var sourceRemove=[];
var topicAdd=[];
var topicRemove=[];
var hasChanged=false;
for (var actionId in this.pendingActions) {
hasChanged = true;
var action=this.pendingActions[actionId];
switch (action.type) {
case"source":
if (action.add) {
sourceAdd.push(action.item)
}
else {
sourceRemove.push(action.item)
}
break;
case"category":
if (action.add) {
categoryAdd.push(action.item)
}
else {
categoryRemove.push(action.item)
}
break
}
}
if (hasChanged) {
if (this.mode === NewsJS.Personalization.Utilities.selectionPageFormat.FORMAT_CLUSTER) {
if (categoryAdd.length > 0) {
NewsJS.Customization.categoriesAdded = true
}
this._commitType(categoryAdd, categoryRemove, this.categoriesDataManager)
}
else if (this.mode === NewsJS.Personalization.Utilities.selectionPageFormat.FORMAT_SOURCE) {
this._commitType(sourceAdd, sourceRemove, this.sourcesDataManager)
}
this.pendingActions = []
}
}, _commitType: function _commitType(addItems, removeItems, dataManager) {
dataManager.updateManyAsync(addItems, removeItems).then(function(success) {
console.log(success)
}, function(error) {
console.log(error)
})
}, navigate: function navigate(item, mkt) {
if (item.source) {
return this.sourcesDataManager.navigate(item, mkt)
}
else if (item.topic) {
return WinJS.Navigation.navigate({
fragment: "/html/search.html", page: "NewsJS.Search"
}, {
queryText: item.id, searchOrigin: NewsJS.Telemetry.Search.Origin.myNews
})
}
else if (item.type === "marketCluster" && item && item.cluster && item.cluster.providerConfiguration) {
item.pageInfo = {
fragment: "/html/categoryPage.html", page: "NewsJS.CategoryPage", channelId: item.cluster.providerConfiguration.categoryKey
};
item.state = {
categoryKey: item.cluster.providerConfiguration.categoryKey, categoryName: item.cluster.title
};
return this.sourcesDataManager.navigate(item, mkt)
}
}
}, {
_version: 1, categoriesAdded: null, LOCATIONS_IN_MARKET_TAG: "LocationsForThisMarket"
})})
})()