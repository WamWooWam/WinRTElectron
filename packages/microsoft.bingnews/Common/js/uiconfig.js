/*  © Microsoft. All rights reserved. */
WinJS.Namespace.define('CommonJS', {Version: 'latest'});
(function appexCommonControlsECUIConfigInit() {
"use strict";
WinJS.Namespace.define("CommonJS.EntityCollection", {UIConfig: WinJS.Class.define(function uiConfig_ctor(options) {
WinJS.UI.setOptions(this, options)
}, {
GetEntityTemplate: function GetEntityTemplate(view) {
return document.querySelector(".itemTemplate")
}, GetDataAttributionText: function GetDataAttributionText() {
return "<h3>this is an attribution</h3>"
}, GetHeaderTemplate: function GetHeaderTemplate(view) {
switch (view) {
case CommonJS.EntityCollection.Views.Grid:
return document.querySelector(".headerTemplate");
default:
return document.querySelector(".listHeaderTemplate")
}
}, HideAppBar: function HideAppBar() {
return false
}, GetSemanticZoomEntityTemplate: function GetSemanticZoomEntityTemplate(view) {
return document.querySelector("#semanticZoomTemplate")
}, GetListRendererTemplate: function GetListRendererTemplate(view) {
return document.querySelector(".listTemplate")
}, GetViewOptions: function GetViewOptions(view) {
var options={};
switch (view) {
case CommonJS.EntityCollection.Views.Grid:
options.minCellHeight = this.minCellHeight;
options.maxCellHeight = this.maxCellHeight;
options.minCellWidth = this.minCellWidth;
break
}
return options
}, GetAppBarItems: function GetAppBarItems(controller) {
var buttons=[];
var onSampleItemClicked=function(item) {
var items=controller.currentView.getSelectedItems();
controller.currentView.clearSelection();
console.log("test button clicked")
};
var multiSelect={
icon: "iconHome", title: "test button", onclick: onSampleItemClicked
};
return buttons
}, getLocalizedStringPrefix: function getLocalizedStringPrefix() {
return ""
}, onNavigateAway: function onNavigateAway(){}, setSelectionAppBar: function setSelectionAppBar(domElement, sort, filters, controller){}, onSelectionChanged: function onSelectionChanged(changedItems) {
console.log(changedItems.length + " items are selected")
}, onSelectionChanging: function onSelectionChanging(changingItems) {
console.log(changingItems.length + " items are changing")
}, getSleepDuration: function getSleepDuration() {
return 0
}, OnItemClicked: function OnItemClicked() {
console.log("item clicked");
return false
}, GetSupportedViews: function GetSupportedViews() {
return {
list: [CommonJS.EntityCollection.Views.Grid], defaultView: CommonJS.EntityCollection.Views.Grid
}
}, GetTableDefinition: function GetTableDefinition(entities) {
var td=new CommonJS.Table.TableDefinition;
var testFields=["title", "id", "group"];
for (var i=0, len=testFields.length; i < len; i++) {
var colDefinition=new CommonJS.Table.ColumnDefinition;
colDefinition.headerText = testFields[i];
colDefinition.priority = i;
colDefinition.boundField = testFields[i];
colDefinition.ID = testFields[i];
td.columns.push(colDefinition)
}
var imgDefinition=new CommonJS.Table.ColumnDefinition;
imgDefinition.fieldTemplate = document.querySelector(".imageFieldTemplate");
imgDefinition.priority = 100;
imgDefinition.boundField = "image";
imgDefinition.ID = "image";
td.columns.push(imgDefinition);
td.groupPosition = "top";
return td
}, SetFilterType: function SetFilterType(filter) {
filter.type = "DropDown";
if (filter.attribute !== "Sort") {
filter.selectionMode = "Multiple"
}
else {
filter.selectionMode = "SingleToggle"
}
}
})});
CommonJS.EntityCollection.Views = {
Grid: 1, List: 2, Map: 4
}
})()