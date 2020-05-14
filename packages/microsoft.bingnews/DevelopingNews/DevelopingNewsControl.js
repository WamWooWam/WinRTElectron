/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
function onItemClicked(evt) {
var item=evt.item,
source=null;
if (item) {
item.categoryKey = "Developing News";
NewsJS.Telemetry.Cluster.recordClusterItemPress("Developing News", item);
var telemetry={};
if (item.telemetry) {
telemetry = item.telemetry
}
else {
item.telemetry = telemetry
}
telemetry.entryPoint = Platform.Instrumentation.InstrumentationArticleEntryPoint.homePano;
telemetry.source = source;
NewsJS.Utilities.launchArticle(item)
}
}
WinJS.Namespace.define("NewsApp.Controls", {DevelopingNewsControl: WinJS.Class.derive(NewsApp.Controls.ControlBase, function(element, options, orchestrator) {
NewsApp.Controls.ControlBase.call(this, element, options, orchestrator)
}, {
control: null, createProviderInstance: function createProviderInstance() {
var options=this.options,
config=options.providerConfiguration;
return PlatformJS.Utilities.createObject(config.providerType, config)
}, renderState: function renderState(response) {
return this.renderFirstTime(response)
}, renderFirstTime: function renderFirstTime(response) {
if (response) {
var element=this.element,
options={
mode: CommonJS.News.ClusterMode.static, theme: "newsAppTheme", configKey: "EntityClusterDefaultNewsConfig", configObject: CommonJS.News.EntityClusterConfig.DefaultNews, onitemclick: onItemClicked, className: "developingNewsListLayout"
};
var control=this.control = new NewsJS.Controls.VerticalScrollContainer(element, options);
control.itemDataSource = new WinJS.Binding.List(response.newsItems).dataSource;
return control.render()
}
else {
return WinJS.Promise.wrap(null)
}
}, renderNextTime: function renderNextTime(response) {
var editorial=response.response,
options=createHeroOptionsFromMetadata(editorial);
this.control.refresh(options)
}, itemClickHandler: onItemClicked
})})
})()