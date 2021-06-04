/*  © Microsoft. All rights reserved. */
(function SkiResortsInit() {
"use strict";
WinJS.Namespace.define("WeatherAppJS.SkiResorts", {
EntityCollection: WinJS.Class.derive(CommonJS.EntityCollection.Collection, function entityCollection_ctor(options) {
msWriteProfilerMark("WeatherApp:SkiResorts:PageLoad:s");
CommonJS.EntityCollection.Collection.call(this, options);
var that=this;
this._options = options || {};
this._data = [];
this._firstLaunch = true;
this._cacheInstance = PlatformJS.Cache.CacheService.getInstance("ECVProcessedDataCache");
msWriteProfilerMark("WeatherApp:SkiResorts:PageLoad:e");
this.impressionContext = WeatherAppJS.Instrumentation.PageContext.SkiResortsECV
}, {
_tempunit: null, _userRegion: null, _processedData: null, _cacheInstance: null, _oldSearchType: null, _firstLaunch: false, Initialize: function Initialize(config) {
msWriteProfilerMark("WeatherApp:SkiResorts:Initialize:s");
CommonJS.setTheme("skiECVBackground", true);
config = config || {};
this.UIConfig = new WeatherAppJS.SkiResorts.UIConfig({collection: this});
this.DataConfig = config.DataConfig || new CommonJS.EntityCollection.DataConfig;
this.Provider = WeatherAppJS.SkiResorts._provider;
var unit=this._tempunit = WeatherAppJS.SettingsManager.getDisplayUnit();
var isoCode=this._userRegion = WeatherAppJS.SettingsManager.getUserDefaultRegionISOCode();
var providerConfiguration=PlatformJS.Collections.createStringDictionary();
providerConfiguration.insert("unit", unit);
providerConfiguration.insert("userRegion", isoCode);
this.isSearchBoxEnabled = true;
this.searchBoxData = this.getSearchBoxData();
return this.Provider.initializeAsync(providerConfiguration)
}, getSearchBoxData: function getSearchBoxData() {
return new WinJS.Promise.wrap({options: {
autoSuggestionDataProvider: WeatherAppJS.Search, searchHandler: WeatherAppJS.Search.SuggestionOnEnterHandler, suggestionChosenHandler: WeatherAppJS.Search.suggestionHandler, focusOnKeyboardInput: true, chooseSuggestionOnEnter: false, searchHistoryDisabled: WeatherAppJS.SettingsManager.getEnableSearchHistory() ? false : true, startMinimized: true
}})
}, _getCacheKey: function _getCacheKey() {
var prefix='pd';
var lang=Platform.Globalization.Marketization.getQualifiedLanguageString();
var isNearbyEnabled=Platform.Utilities.Globalization.isFeatureEnabled("CurrentLocationDetection");
var args=[prefix, this._tempunit, this._userRegion, lang, isNearbyEnabled];
return args.join('_')
}, _updateCacheIfRequired: function _updateCacheIfRequired(dataString) {
var that=this;
var cacheKey=this._getCacheKey();
if (dataString && cacheKey) {
this._cacheInstance.findEntry(cacheKey).then(function(cachedData) {
if (cachedData && cachedData.dataValue !== dataString) {
that._cacheInstance.addEntry(cacheKey, dataString).done()
}
else if (!cachedData) {
that._cacheInstance.addEntry(cacheKey, dataString).done()
}
}, function(err){})
}
}, countElements: function countElements(obj) {
var count=0;
for (var ele in obj) {
if (obj.hasOwnProperty(ele)) {
++count
}
}
return count
}, _preprocessFilters: function _preprocessFilters(filters) {
var newSearchType;
filters = filters || [];
for (var i=0, l=filters.length; i < l; i++) {
if (filters[i].attribute === "Region" && filters[i].items.length === 1) {
filters.splice(i, 1)
}
if (filters[i] && (filters[i].attribute === "SearchType")) {
for (var searchType in filters[i].items) {
if (filters[i].items[searchType].selected) {
newSearchType = filters[i].items[searchType].value
}
}
}
}
var noNewFilters=filters.length;
var filterBarElem=document.getElementById("filterBar");
if (filterBarElem && filterBarElem.winControl) {
var filterBar=filterBarElem.winControl;
if (filterBar && filterBar._filterBar) {
var noOldFilters=this.countElements(filterBar._filterBar.filterGroups);
if ((noNewFilters !== noOldFilters) || (this._oldSearchType && (this._oldSearchType !== newSearchType))) {
filterBar._filterBar.dispose();
filterBar._filterBar.filterGroups = {};
filterBar._filterBar.initialize()
}
}
}
this._oldSearchType = newSearchType;
return filters
}, _showErrorMessage: function _showErrorMessage(filters) {
msSetImmediate(function() {
var appBar=document.querySelector(".entityappbar");
if (appBar && appBar.winControl) {
appBar.winControl.disabled = false
}
});
if (WeatherAppJS.Networking.internetAvailable === false) {
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString("NoInternetConnectionError"), false)
}
else {
for (var f in filters) {
if (filters[f].attribute === "SearchType") {
for (var fi in filters[f].items) {
if (filters[f].items[fi].value === "Nearby" && filters[f].items[fi].selected === true) {
if (this.Provider.isLocationDetectionDisabled()) {
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString("LocationDisabledError"), false)
}
return
}
}
}
}
}
}, onBeforeQuery: function onBeforeQuery(query) {
var that=this;
var cacheKey=this._getCacheKey();
return CommonJS.EntityCollection.Collection.prototype.onBeforeQuery.call(this).then(function() {
if (!cacheKey) {
that._processedData = null;
return WinJS.Promise.wrap(true)
}
return that._cacheInstance.findEntry(cacheKey).then(function(cachedData) {
if (cachedData) {
that._processedData = cachedData.dataValue
}
}, function(err) {
that._processedData = null
})
})
}, onQueryReturned: function onQueryReturned(entities, sorts, groups, filters) {
if (!entities || (entities instanceof Array && entities.length === 0)) {
this._showErrorMessage(filters)
}
msWriteProfilerMark("WeatherApp:SkiResorts:Initialize:e");
msWriteProfilerMark("WeatherApp:SkiResorts:OnQueryReturned:s");
return CommonJS.EntityCollection.Collection.prototype.onQueryReturned.call(this).then(function() {
msWriteProfilerMark("WeatherApp:SkiResorts:OnQueryReturned:e")
})
}, Query: function Query(sort, filters) {
var that=this;
var isQueryComplete=false;
var logStr="Query(): Selected Sort: " + (sort ? sort.identifier : " none") + ", Selected Filters: ";
var p=new WinJS.Promise(function collection_queryPromiseInit(complete, error, progress) {
var onQueryUpdate=function(jsonStr) {
var result={};
var dataset=null;
try {
dataset = JSON.parse(jsonStr);
jsonStr = null
}
catch(e) {
error(e);
return
}
var e=dataset.entities;
that.Sorts = dataset.sorts;
var g=that.Groups = dataset.groups;
that.Filters = that._preprocessFilters(dataset.filters);
var groupsDictionary={};
for (var i=0; i < g.length; i++) {
var key=g[i].identifier;
groupsDictionary[key] = g[i].count
}
for (var j=0; j < e.length; j++) {
e[j].groupCount = groupsDictionary[e[j].group]
}
try {
that.onQueryReturned(e, that.Sorts, that.Groups, that.Filters).done(function collection_onQueryReturnedComplete() {
that.Entities = e;
if (isQueryComplete) {
if (that.onQueryComplete) {
that.onQueryComplete(e)
}
complete()
}
else {
progress()
}
})
}
catch(e) {
error(e)
}
};
var onQueryProgress=function(dataset) {
isQueryComplete = false;
onQueryUpdate(dataset)
};
var onQueryComplete=function(dataset) {
isQueryComplete = true;
msWriteProfilerMark("CommonControls:EntityCollection:providerQuery:e");
onQueryUpdate(dataset)
};
var onDeferedQueryComplete=function(dataset) {
if (!isQueryComplete) {
isQueryComplete = true;
msWriteProfilerMark("CommonControls:EntityCollection:providerQuery:e");
onQueryUpdate(dataset)
}
that._updateCacheIfRequired(dataset)
};
var q=new AppEx.Common.EntityCollection.Query.EntityQuery;
if (filters) {
for (var ii=0; ii < filters.length; ii++) {
q.filters.append(filters[ii]);
logStr += "[" + filters[ii].attribute + ":";
for (var jj=0; jj < filters[ii].value.length; jj++) {
var val=filters[ii].value[jj];
logStr += val + ";"
}
logStr += "] "
}
}
if (sort && sort.identifier) {
q.sortIdentifier = sort.identifier;
q.sortDirection = sort.sortDirection
}
that.onBeforeQuery(q).done(function collection_onBeforeQueryComplete() {
msWriteProfilerMark("CommonControls:EntityCollection:providerQuery:s");
var jsonShim=new AppEx.Common.EntityCollection.JSONCollectionProvider(that.Provider);
if (!that._processedData) {
that._firstLaunch = false;
jsonShim.queryAsync(q).done(onDeferedQueryComplete, error, onQueryProgress)
}
else {
if (that._firstLaunch) {
onQueryComplete(that._processedData);
that._firstLaunch = false
}
else {
jsonShim.queryAsync(q).done(onDeferedQueryComplete)
}
}
})
});
return WinJS.Promise.wrap(p)
}
}), _provider: new AppEx.WeatherApp.Services.SkiResorts.SkiResortsProvider
})
})();
(function() {
WinJS.Namespace.define("WeatherAppJS.SkiResorts", {UIConfig: WinJS.Class.derive(CommonJS.EntityCollection.UIConfig, function(options) {
CommonJS.EntityCollection.UIConfig.call(this, options);
this._collection = options.collection;
this._bindableSettingChanged = this.onSettingsChanged.bind(this);
WeatherAppJS.SettingsManager.addEventListener('settingchanged', this._bindableSettingChanged, false)
}, {
_collection: null, OnItemClicked: function OnItemClicked(entity) {
var geocodeLocation=WeatherAppJS.LocationSuggest.getSkiResortGeocodeLocation(entity);
var eventAttr={
resort: geocodeLocation.getFullDisplayName(), index: entity.index
};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Ski Resorts ECV", "Ski Resort", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr));
WinJS.Navigation.navigate({
fragment: "/panoramas/home/home.html", page: "WeatherAppJS.Pages.Home"
}, {
locID: geocodeLocation.getId(), geocodeLocation: geocodeLocation, formCode: WeatherAppJS.Instrumentation.FormCodes.Default
});
return true
}, GetViewOptions: function GetViewOptions(view) {
var options={};
options.disableSemanticZoom = true;
return options
}, GetSupportedViews: function GetSupportedViews() {
return {
list: [CommonJS.EntityCollection.Views.List], defaultView: CommonJS.EntityCollection.Views.List
}
}, SetFilterType: function SetFilterType(filter) {
var resourceLoader=PlatformJS.Services.resourceLoader;
if (filter.attribute === "Country") {
filter.selectionMode = "Single"
}
if (filter.attribute === "SearchType") {
filter.selectionMode = "Single";
filter.useWideTile = true;
filter.name = resourceLoader.getString(filter.name);
if (filter.items) {
for (var i=0, l=filter.items.length; i < l; i++) {
filter.items[i].label = resourceLoader.getString(filter.items[i].label)
}
}
}
if (filter.attribute === "Within") {
var weatherFormatting=WeatherAppJS.Utilities.Formatting;
var displayUnit=WeatherAppJS.SettingsManager.getDisplayUnit();
filter.selectionMode = "Single";
filter.useWideTile = true;
filter.name = resourceLoader.getString(filter.name);
if (filter.items) {
for (var ii=0, ll=filter.items.length; ii < ll; ii++) {
filter.items[ii].label = weatherFormatting.getDistanceUnit(filter.items[ii].label, displayUnit)
}
}
}
}, forceRefresh: function forceRefresh(bypassCache) {
if (bypassCache) {
this._collection.Provider.forceRefresh()
}
WeatherAppJS.SettingsManager.removeEventListener('settingchanged', this._bindableSettingChanged, false);
CommonJS.forceRefresh()
}, GetAppBarItems: function GetAppBarItems(controller) {
var that=this;
var buttons=[];
var onHelpButtonClicked=function() {
WeatherAppJS.Utilities.UI.openInAppHelp()
};
var onChangeUnitToFClick=function() {
CommonJS.dismissAllEdgies();
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NumBottomEdgyUnitChanged");
WeatherAppJS.SettingsManager.setDisplayUnitAsync('F', Microsoft.Bing.AppEx.Telemetry.ActionContext.bottomEdgy).then()
};
var onChangeUnitToCClick=function() {
CommonJS.dismissAllEdgies();
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NumBottomEdgyUnitChanged");
WeatherAppJS.SettingsManager.setDisplayUnitAsync('C', Microsoft.Bing.AppEx.Telemetry.ActionContext.bottomEdgy).then()
};
var onRefreshButtonClicked=function() {
that.forceRefresh(true);
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.ActionContext.bottomEdgy, "Refresh", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0);
CommonJS.dismissAllEdgies()
};
var appBar=document.querySelector(".entityappbar");
var multiSelect;
if (!appBar.querySelector("#changeUnitToCButton")) {
multiSelect = {
id: "changeUnitToCButton", extraClass: 'appexSymbol', icon: '\uE150', onclick: onChangeUnitToCClick, hidden: true
};
multiSelect.label = PlatformJS.Services.resourceLoader.getString("ChangeUnitToCButtonTitle");
buttons.push(multiSelect)
}
if (!appBar.querySelector("#changeUnitToFButton")) {
multiSelect = {
id: "changeUnitToFButton", extraClass: 'appexSymbol', icon: '\uE151', onclick: onChangeUnitToFClick, hidden: true
};
multiSelect.label = PlatformJS.Services.resourceLoader.getString("ChangeUnitToFButtonTitle");
buttons.push(multiSelect)
}
if (!appBar.querySelector("#refreshButton")) {
multiSelect = {
id: "refreshButton", extraClass: 'appexSymbol', icon: '\uE067', onclick: onRefreshButtonClicked
};
multiSelect.label = PlatformJS.Services.resourceLoader.getString("RefreshButtonTitle");
buttons.push(multiSelect)
}
if (!appBar.querySelector("#helpButton")) {
multiSelect = {
id: "helpButton", extraClass: 'appexSymbol', icon: "\uFF60", onclick: onHelpButtonClicked
};
multiSelect.label = CommonJS.resourceLoader.getString("/platform/HelpLabel");
buttons.push(multiSelect)
}
appBar.addEventListener('beforeshow', function(event) {
if (WeatherAppJS.SettingsManager.getDisplayUnit() === 'F') {
appBar.querySelector("#changeUnitToCButton").winControl.hidden = false;
appBar.querySelector("#changeUnitToFButton").winControl.hidden = true
}
else {
appBar.querySelector("#changeUnitToFButton").winControl.hidden = false;
appBar.querySelector("#changeUnitToCButton").winControl.hidden = true
}
});
return buttons
}, OnClearFiltersClick: function OnClearFiltersClick() {
if (this._collection && this._collection.Provider) {
try {
this._collection.Provider.clearFilters()
}
catch(ex) {}
}
}, onSettingsChanged: function onSettingsChanged(event) {
this.forceRefresh(false)
}, GetTableDefinition: function GetTableDefinition(entities) {
var that=this;
var td=new CommonJS.Table.TableDefinition;
var resourceLoader=PlatformJS.Services.resourceLoader;
var ecvFields=WeatherAppJS.SkiResorts.ECVColumns;
for (var i=0, len=ecvFields.length; i < len; i++) {
var colDefinition=new CommonJS.Table.ColumnDefinition;
var currentField=ecvFields[i];
colDefinition.ID = currentField.id;
colDefinition.priority = i;
colDefinition.headerText = resourceLoader.getString(currentField.id + "Header");
colDefinition.boundField = currentField.boundField;
colDefinition.sortIdentifier = currentField.sortId;
colDefinition.fieldTemplate = document.getElementById(currentField.fieldTemplateId);
if (currentField.isTextFormat) {
colDefinition.isTextFormat = currentField.isTextFormat
}
if (currentField.canWrap) {
colDefinition.canWrap = currentField.canWrap
}
td.columns.push(colDefinition)
}
td.cssAllowList = ["skiResortsECV.css"];
td.itemSpacing.min = 0;
this._bindColumnRenders(td);
return td
}, _bindColumnRenders: function _bindColumnRenders(td) {
var resourceLoader=PlatformJS.Services.resourceLoader;
var weatherCommon=WeatherAppJS.Utilities.Common;
var weatherFormatting=WeatherAppJS.Utilities.Formatting;
var displayUnit=WeatherAppJS.SettingsManager.getDisplayUnit();
var tempString=resourceLoader.getString("TemperatureWithDegreeUnit");
var noDataString=weatherCommon.getNoDataString();
var getSafeInt=function(data) {
return (data && data !== "--") ? weatherFormatting.formatInt(data) : noDataString
};
var getSafeIntWithoutFormatting=function(data) {
return (data && data !== "--") ? data : noDataString
};
var getResortClass=function(st) {
return (st === "Open" || st === "WeekendsOnly") ? "resortStatus open" : "resortStatus closed"
};
var tempFormat=WeatherAppJS.WarmBoot.Cache.getString("TemperatureFormat");
td.columnRenderer = {};
var html="",
ariaText="",
role="listitem";
var nameHeaderLabel=resourceLoader.getString("NameHeader");
td.columnRenderer["name"] = function(entity) {
var resortStatus=resourceLoader.getString("ResortStatus" + entity.Status);
ariaText = [nameHeaderLabel, entity.Name, entity.City, resortStatus].join("'");
html = ['<div class="nameColContainer">', '<img class="skiImage" width="100" height="70" src="', entity.ThumbUrl, '" role="img" />', '<div class="nameContainer">', '<div class="resortName" >', entity.Name, '</div>', '<div class="resortCity" >', entity.City, '</div>', '<div class="resortStatus ', getResortClass(entity.Status), '" >', resortStatus, '</div>', '</div>', '</div>'].join('');
return [html, ariaText, role]
};
var forcastHeaderLabel=resourceLoader.getString("ForecastHeader"),
highMapSubTypeLabel=resourceLoader.getString("HighMapSubType"),
lowMapSubTypeLabel=resourceLoader.getString("LowMapSubType");
td.columnRenderer["forecast"] = function(entity) {
var safeIconImageSrc="/images/skycodes/48x48/" + entity.SkyCode + ".png";
var value=getSafeInt(entity.HighTemp);
var highTemp=(value !== "--") ? tempString.format(value) : value;
value = getSafeInt(entity.LowTemp);
var lowTemp=(value !== "--") ? tempString.format(value) : value;
var caption=(entity.Caption && entity.Caption !== "") ? resourceLoader.getString(entity.Caption) : "";
var displayTemp1=(tempFormat === 'MaxMin') ? highTemp : lowTemp;
var displayTemp2=(tempFormat === 'MaxMin') ? lowTemp : highTemp;
ariaText = [forcastHeaderLabel, highMapSubTypeLabel, highTemp, lowMapSubTypeLabel, lowTemp, caption].join(",");
html = ['<div class="forecastColContainer" >', '<img class="skyCodeImage" src="', safeIconImageSrc, '" role="img" alt="', caption, '"/>', '<div class="forecastContainer"><div class="highLow">', '<span>', displayTemp1, '</span><span>/</span>', '<span>', displayTemp2, '</span>', '</div>', '<div class="caption">', caption, '</div>', '</div></div>'].join('');
return [html, ariaText, role]
};
var newSnowHeaderLabel=resourceLoader.getString("NewSnowHeader");
td.columnRenderer["newsnow"] = function(entity) {
var value=getSafeIntWithoutFormatting(entity.NewSnowString);
value = (value !== "--") ? weatherFormatting.getSnowDepthUnit(value, displayUnit) : value;
ariaText = [newSnowHeaderLabel, value].join("'");
html = ['<div class="newSnowCol" >', value, '</div>'].join('');
return [html, ariaText, role]
};
var snowDepthHeaderLabel=resourceLoader.getString("SnowDepthHeader");
td.columnRenderer["snowdepth"] = function(entity) {
var baseDepthLow=entity.BaseDepth;
var baseDepthHigh=entity.TopDepth;
var b0="",
b1="-",
b2="";
if (!(baseDepthLow === noDataString && baseDepthHigh === noDataString)) {
b0 = weatherFormatting.formatInt(baseDepthLow);
b2 = weatherFormatting.getSnowDepthUnit(baseDepthHigh, displayUnit)
}
else {
b1 = noDataString
}
ariaText = [snowDepthHeaderLabel, b0, b2].join(",");
html = ['<div class="snowDepthCol" ><span>', b0, '</span><span>', b1, '</span><span>', b2, '</span></div>'].join('');
return [html, ariaText, role]
};
var windHeaderLabel=resourceLoader.getString("WindHeader");
td.columnRenderer["wind"] = function(entity) {
var value=getSafeIntWithoutFormatting(entity.WindSpeed);
value = value !== "--" ? weatherFormatting.getSpeedUnit(value, displayUnit).value : value;
ariaText = [windHeaderLabel, value].join("'");
html = ['<div class="windCol" >', value, '</div>'].join('');
return [html, ariaText, role]
};
var openTrailsHeaderLabel=resourceLoader.getString("OpenTrailsHeader");
td.columnRenderer["opentrails"] = function(entity) {
var value=getSafeInt(entity.OpenTrailsString);
ariaText = [openTrailsHeaderLabel, value].join("'");
html = ['<div class="openTrailsCol" >', value, '</div>'].join('');
return [html, ariaText, role]
};
var openLiftsHeaderLabel=resourceLoader.getString("OpenLiftsHeader");
td.columnRenderer["openlifts"] = function(entity) {
var value=getSafeInt(entity.OpenLiftsString);
ariaText = [openLiftsHeaderLabel, value].join("'");
html = ['<div class="openLiftsCol" >', value, '</div>'].join('');
return [html, ariaText, role]
}
}, getSleepDuration: function getSleepDuration() {
return PlatformJS.Services.appConfig.getString("PageRefreshTime")
}, onNavigateAway: function onNavigateAway() {
WeatherAppJS.SettingsManager.removeEventListener('settingchanged', this._bindableSettingChanged, false)
}
})})
})();
(function() {
WinJS.Namespace.define("WeatherAppJS.SkiResorts", {ECVColumns: [{
id: "Name", boundField: ["ThumbUrl", "Name", "City", "Status"], fieldTemplateId: "skiECVNameTemplate", sortId: "Name"
}, {
id: "Forecast", boundField: ["SkyCode", "HighTemp", "LowTemp", "Caption"], fieldTemplateId: "skiECVForecastTemplate"
}, {
id: "NewSnow", boundField: "NewSnowString", fieldTemplateId: "skiECVNewSnow", sortId: "NewSnow"
}, {
id: "SnowDepth", boundField: ["BaseDepth", "TopDepth"], fieldTemplateId: "skiECVSnowDepth"
}, {
id: "Wind", boundField: "WindSpeed", fieldTemplateId: "skiECVWind"
}, {
id: "OpenTrails", boundField: "OpenTrailsString", fieldTemplateId: "skiECVOpenTrails", sortId: "OpenTrails", isTextFormat: true
}, {
id: "OpenLifts", boundField: "OpenLiftsString", fieldTemplateId: "skiECVOpenLifts", sortId: "OpenLifts", isTextFormat: true
}]})
})()