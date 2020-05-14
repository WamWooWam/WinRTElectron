/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
var SourceType={
bing: "BING", custom: "CUSTOM"
};
function onRefresh(evt) {
NewsApp.PageEvents.dispatch("refreshing");
NewsJS.StateHandler.instance.syncWithPdp(true);
NewsApp.PageEvents.dispatch("refreshed");
NewsJS.Telemetry.BingDaily.recordRefreshButtonClick(evt);
CommonJS.dismissAllEdgies()
}
WinJS.Namespace.define("NewsJS", {MySourcesPage: WinJS.Class.derive(NewsJS.NewsBasePage, function(state) {
msWriteProfilerMark("NewsApp:MySources:s");
NewsJS.NewsBasePage.call(this, state);
state = state || {};
var that=this;
var refreshButton=PlatformJS.Utilities.getControl("refreshButton");
if (refreshButton) {
refreshButton.label = PlatformJS.Services.resourceLoader.getString("Refresh");
refreshButton.addEventListener("click", onRefresh)
}
msWriteProfilerMark("NewsApp:MySources:e")
}, {
getPageState: function getPageState() {
return null
}, createClusterMetadata: function createClusterMetadata(clusterDefinition, state, proxy) {
var identifier=clusterDefinition.guid,
entry=state ? state[identifier] : null,
clusterMetadata=createMetadata(clusterDefinition, entry, proxy);
return clusterMetadata
}, getClusterMetadata: function getClusterMetadata(state) {
var that=this;
return NewsJS.Customization.getSourcesDataManager().getAllAsync(null, "followed").then(function(sources) {
var clusters=new WinJS.Binding.List;
for (var i=0, ilen=sources.length; i < ilen; i++) {
var source=sources[i];
var clusterMetadata=that.createClusterMetadata(createCategoryObject(source));
if (clusterMetadata) {
var clusterKey=clusterMetadata.clusterKey;
clusters.push(clusterMetadata)
}
}
return clusters
}, function(error) {
return null
})
}, getPageData: function getPageData() {
return WinJS.Promise.wrap({
title: PlatformJS.Services.resourceLoader.getString("MySources"), panoramaState: this._panoramaState, semanticZoomRenderer: this.newsDailySemanticZoomRenderer, clusterDataSource: this.getClusterMetadata({})._value.dataSource, queryClusterData: this.queryClusterData
})
}, appWentOffline: function appWentOffline() {
var state={connection: false};
NewsApp.PageEvents.dispatch("connectionchanging", state);
NewsApp.PageEvents.dispatch("connectionchanged", state)
}, appWentOnline: function appWentOnline() {
var state={connection: true};
NewsApp.PageEvents.dispatch("connectionchanging", state);
NewsApp.PageEvents.dispatch("connectionchanged", state)
}, dispose: function dispose() {
var refreshButton=PlatformJS.Utilities.getControl("refreshButton");
if (refreshButton) {
refreshButton.removeEventListener("click", onRefresh)
}
NewsJS.NewsBasePage.prototype.dispose.call(this)
}
})});
function createMetadata(clusterDefinition, state, proxy) {
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
NewsJS.Telemetry.Cluster.recordClusterHeaderPress(key, clusterDefinition.title, position);
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
function createCategoryObject(source) {
var category={
title: source.displayname, guid: source.id, clusterType: "NewsApp.Controls.CategoryControl"
};
var navigationInfo=NewsJS.Utilities.navigationInfoForSource(source);
if (navigationInfo.pageInfo && navigationInfo.pageInfo.channelId) {
switch (navigationInfo.pageInfo.channelId) {
case("RSSSourcePage"):
category.providerConfiguration = {
source: source, sourceType: SourceType.custom, providerType: "NewsApp.RSS.CustomRSSProvider"
};
break;
case("SourcePage"):
category.providerConfiguration = {
source: source, sourceType: SourceType.bing, providerType: "NewsApp.RSS.BingRSSProvider"
};
break;
case("NYT"):
category.providerConfiguration = {
source: source, providerType: "NewsApp.DataProviders.NYTProvider", configKey: "EntityClusterNYTConfig", configObject: CommonJS.News.EntityClusterConfig.NYT, theme: "newsAppTheme NYT"
};
category.clusterType = "NewsApp.Controls.NYTControl";
break;
case("WSJ"):
category.providerConfiguration = {
source: source, providerType: "NewsApp.DataProviders.WSJProvider", configKey: "EntityClusterWSJConfig", configObject: CommonJS.News.EntityClusterConfig.WSJ, theme: "newsAppTheme WSJ"
};
category.clusterType = "NewsApp.Controls.WSJControl";
break;
default:
category.providerConfiguration = {
source: source, dynamicInfo: navigationInfo.state.dynamicInfo, providerType: "NewsApp.DataProviders.PartnerSourcesProvider"
};
break
}
;
}
return category
}
})()