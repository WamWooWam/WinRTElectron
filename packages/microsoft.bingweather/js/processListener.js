/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
WinJS.Namespace.define("WeatherAppJS", {ProcessListener: WinJS.Class.define(function() {
this._curTime = 0;
this._chStartTime = 0;
this._curView = 0;
this._launchMode = null;
CommonJS.PrivacySettings.pdpFactory = this.appPDPFactory;
CommonJS.PrivacySettings.pdpConflictResolver = this.appPDPConflictResolver
}, {
appPDPFactory: function appPDPFactory() {
var dataFactory=new AppEx.WeatherApp.Services.PersonalizedDataFactory;
return dataFactory
}, appPDPConflictResolver: function appPDPConflictResolver() {
return new AppEx.WeatherApp.Services.Shared.WeatherAppConflictResolver
}, _logDwellTime: function _logDwellTime(event) {
var applicationViewState=Windows.UI.ViewManagement.ApplicationViewState;
this._curTime = (new Date).getTime() / 1000;
if (this._curTime > this._chStartTime) {
var totalTime=this._curTime - this._chStartTime;
this._chStartTime = this._curTime;
var viewType;
if (this._curView === applicationViewState.filled) {
viewType = "Filled"
}
else {
viewType = "Fullscreen"
}
var eventAttr={
viewType: viewType, timeSpent: totalTime
};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "App", "Layout", "appViewed", PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr))
}
this._curView = event.viewState
}, onSuspending: function onSuspending(event) {
this._logDwellTime(event);
WeatherAppJS.SettingsManager.setLastSuspendTimeAsync((new Date).getTime()).then(null, function(e){})
}, onCheckpoint: function onCheckpoint(event){}, onResuming: function onResuming(event) {
WeatherAppJS.Networking.updateNetworkStatus();
this._curView = Windows.UI.ViewManagement.ApplicationView.value;
this._chStartTime = (new Date).getTime() / 1000;
var common=WeatherAppJS.Utilities.Common;
var currentPage=common.getCurrentPage();
var isAppStateStale=common.isAppStateStale();
var isAppDataStale=common.isAppDataStale();
if (PlatformJS.isPlatformInitialized) {
WeatherAppJS.SettingsManager.readPDPDataAsync()
}
if (isAppDataStale && !isAppStateStale && currentPage !== "WeatherAppJS.DailyForecast") {
var page=PlatformJS.Navigation.currentIPage;
if (page.onPageRefresh) {
page.onPageRefresh()
}
}
}, onActivated: function onActivated(event) {
WeatherAppJS.Services.initialize(false);
this._curView = Windows.UI.ViewManagement.ApplicationView.value;
this._chStartTime = (new Date).getTime() / 1000;
WeatherAppJS.SettingsManager.onActivated();
var defaultLocation=WeatherAppJS.LocationsManager.getDefaultLocation();
var isFRE=WeatherAppJS.SettingsManager.isFRE();
if (event && event.detail && event.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.search) {
if (event.detail.queryText && !isFRE && defaultLocation) {
return {
pageInfo: {
fragment: "/panoramas/search/searchPage.html", page: "WeatherAppJS.Search.SearchPage"
}, state: {
event: event, query: event.detail.queryText, searchAction: WeatherAppJS.Search.Actions.SearchLocation
}
}
}
}
else if (event && event.detail && event.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.protocol && !WeatherAppJS.LocationsManager.isMarketBlockedByIP) {
if (isFRE && !defaultLocation) {
WeatherAppJS.SettingsManager.setIsFREAsync(false).then()
}
var uri=event.detail.uri.rawUri;
return PlatformJS.Navigation.createCommandFromUri(uri)
}
else if ((event.type === "activated") && event.detail && event.detail.arguments) {
if (isFRE && !defaultLocation) {
WeatherAppJS.SettingsManager.setIsFREAsync(false).then()
}
if (PlatformJS.mainProcessManager.searchTileArguments) {
var command=PlatformJS.Navigation.createCommandFromSearchTile(PlatformJS.mainProcessManager.searchTileArguments);
if (command) {
if (WinJS.Promise.is(command)) {
return command
}
else if (command.channelInfo) {
return {
pageInfo: command.channelInfo.pageInfo, state: command.options
}
}
else {
command()
}
}
}
else if ((event.detail.tileId !== "App") && WeatherAppJS.App.isTileSupportedInCurrentMarket(event.detail.arguments)) {
var geoLoc=WeatherAppJS.App.getGeoLocFromTileArguments(event.detail.arguments);
if (geoLoc) {
this._launchMode = WeatherAppJS.Instrumentation.FormCodes.PinnedTile
}
return {
pageInfo: {
channelId: 'Home', fragment: "/panoramas/home/home.html", page: "WeatherAppJS.Pages.Home"
}, state: {
locID: geoLoc.getId(), geocodeLocation: geoLoc, searchingLocation: false
}
}
}
}
else if (WeatherAppJS.Utilities.Common.isAppStateStale() && (WeatherAppJS.Utilities.Common.getCurrentPage() !== "WeatherAppJS.Pages.Home")) {
this._launchMode = WeatherAppJS.Instrumentation.FormCodes.AppLaunch;
return {
pageInfo: {
fragment: "/panoramas/home/home.html", page: "WeatherAppJS.Pages.Home"
}, state: {}
}
}
else {
var loc=WeatherAppJS.GeocodeCache.getLocation(WeatherAppJS.SettingsManager.getDefaultLocationId());
if (loc) {
this._launchMode = WeatherAppJS.Instrumentation.FormCodes.AppLaunch
}
}
}, _isFirstViewRealized: false, onFirstViewRealized: function onFirstViewRealized() {
if (!this._isFirstViewRealized) {
this._isFirstViewRealized = true;
var jsLoadPromise=WinJS.UI.Fragments.renderCopy("/html/delayedTemplate.html", null);
jsLoadPromise.done(function() {
if (!((WeatherAppJS.SettingsManager.isFRE() && WeatherAppJS.Networking.internetAvailable === false) || PlatformJS.mainProcessManager.retailModeEnabled)) {
WeatherAppJS.UI.Settings.init()
}
});
WeatherAppJS.App.initAppTileManager();
WeatherAppJS.topEdgy.instance.initializeEdgy();
if (PlatformJS.isDebug) {
WinJS.UI.Fragments.render("/html/debug.html").then(function() {
WeatherAppJS.Debug.init()
}, function(e){})
}
}
}, startPostActivateWork: function startPostActivateWork(){}, onUpdatedConfig: function onUpdatedConfig(event) {
WeatherAppJS.App.reinitialize();
WeatherAppJS.LocationSuggest.reinitialize();
WeatherAppJS.Utilities.Common.reinitialize();
WeatherAppJS.GeocodePolygonSearch.reinitialize();
WeatherAppJS.Storage.Memory.removeItem("homeAdsConfig");
WeatherAppJS.Storage.Memory.removeItem("gsClusterConfig");
WeatherAppJS.Storage.Memory.removeItem("nsClusterConfig");
return true
}
})})
})()