/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
var _marketString=null;
var _marketStringForAlgoBrowse=null;
var _marketStringForAlgoSearch=null;
var _marketStringForAlgoSource=null;
var _marketStringForAutosuggest=null;
var _marketStringForLiveTile=null;
var _marketStringForEditorial=null;
var _marketStringForSourcesFeed=null;
function reload() {
_marketStringForAlgoBrowse = null;
_marketStringForAlgoSearch = null;
_marketStringForAlgoSource = null;
_marketStringForAutosuggest = null;
_marketStringForLiveTile = null;
_marketStringForEditorial = null;
_marketStringForSourcesFeed = null
}
function isAlgoBrowseEnabled() {
return Platform.Utilities.Globalization.isFeatureEnabled("AlgoBrowse") && NewsJS.Globalization.getMarketStringForAlgoBrowse()
}
function isEditorialEnabled() {
return Platform.Utilities.Globalization.isFeatureEnabled("Editorial") && NewsJS.Globalization.getMarketStringForEditorial()
}
function getMarketString() {
if (_marketString === null) {
_marketString = PlatformJS.BootCache.instance.getEntry("NewsJSGlobalizationMarketString", function() {
return Platform.Utilities.Globalization.getMarketString()
})
}
return _marketString
}
function getMarketStringForAlgoBrowse() {
if (_marketStringForAlgoBrowse === null) {
var marketParams=PlatformJS.Services.appConfig.getDictionary("MarketParams");
_marketStringForAlgoBrowse = marketParams.getString("AlgoBrowse")
}
return _marketStringForAlgoBrowse
}
function getMarketStringForAlgoSearch() {
if (_marketStringForAlgoSearch === null) {
var marketParams=PlatformJS.Services.appConfig.getDictionary("MarketParams");
if (marketParams.hasKey("AlgoSearch")) {
_marketStringForAlgoSearch = marketParams.getString("AlgoSearch")
}
else {
_marketStringForAlgoSearch = PlatformJS.Utilities.Globalization.getCurrentMarket()
}
}
return _marketStringForAlgoSearch
}
function getMarketStringForAlgoSource() {
if (_marketStringForAlgoSource === null) {
var marketParams=PlatformJS.Services.appConfig.getDictionary("MarketParams");
_marketStringForAlgoSource = marketParams.getString("AlgoSources")
}
return _marketStringForAlgoSource
}
function getMarketStringForAutosuggest() {
if (_marketStringForAutosuggest === null) {
_marketStringForAutosuggest = PlatformJS.BootCache.instance.getEntry("MarketStringForAutosuggest", function() {
var marketParams=PlatformJS.Services.appConfig.getDictionary("MarketParams");
return marketParams.getString("Autosuggest")
})
}
return _marketStringForAutosuggest
}
function getMarketStringForEditorial() {
if (_marketStringForEditorial === null) {
_marketStringForEditorial = PlatformJS.BootCache.instance.getEntry("MarketStringForEditorial", function() {
var marketParamsDictionary=PlatformJS.Services.appConfig.getDictionary("MarketParams");
return marketParamsDictionary.getString("Editorial")
})
}
return _marketStringForEditorial
}
function getMarketStringForLiveTile() {
if (_marketStringForLiveTile === null) {
var marketParams=PlatformJS.Services.appConfig.getDictionary("MarketParams");
_marketStringForLiveTile = marketParams.getString("LiveTile")
}
return _marketStringForLiveTile
}
function getMarketStringForSources() {
if (_marketStringForSourcesFeed === null) {
_marketStringForSourcesFeed = PlatformJS.BootCache.instance.getEntry("MarketStringForSourcesFeed", function() {
var marketParams=PlatformJS.Services.appConfig.getDictionary("MarketParams");
return marketParams.getString("SourcesFeed")
})
}
return _marketStringForSourcesFeed
}
function countryCheck() {
var queryService=new PlatformJS.DataService.QueryService("CountryCheck");
var options=new Platform.DataServices.QueryServiceOptions;
options.useCompatDataModel = true;
options.retryCount = 0;
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("domain", NewsJS.Utilities.appServerDomain());
return queryService.downloadDataAsync(urlParams, null, null, options)
}
WinJS.Namespace.define("NewsJS.Globalization", {
countryCheck: countryCheck, isAlgoBrowseEnabled: isAlgoBrowseEnabled, isEditorialEnabled: isEditorialEnabled, getMarketString: getMarketString, getMarketStringForAlgoBrowse: getMarketStringForAlgoBrowse, getMarketStringForAlgoSearch: getMarketStringForAlgoSearch, getMarketStringForAlgoSource: getMarketStringForAlgoSource, getMarketStringForAutosuggest: getMarketStringForAutosuggest, getMarketStringForEditorial: getMarketStringForEditorial, getMarketStringForLiveTile: getMarketStringForLiveTile, getMarketStringForSources: getMarketStringForSources, reload: reload
})
})()