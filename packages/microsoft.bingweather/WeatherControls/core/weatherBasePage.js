/*  © Microsoft. All rights reserved. */
'use strict';
WinJS.Namespace.define("WeatherAppJS.Core", {WeatherBasePage: WinJS.Class.define(function(state) {
this._state = state || {};
var that=this;
WeatherAppJS.SettingsManager.addEventListener('settingchanged', this.onSettingsChangeBase, false);
if (!WeatherAppJS.Utilities.Roaming.isPDPReadInProgress && PlatformJS.isPlatformInitialized && !WeatherAppJS.SettingsManager.isFRE) {
WeatherAppJS.SettingsManager.readPDPDataAsync().then()
}
}, {
_promisesStack: [], _timersStack: [], _timeoutsStack: [], _state: null, _lastUpdatedTime: null, isImmersive: false, displayLastUpdatedTime: function displayLastUpdatedTime() {
if (this._lastUpdatedTime) {
var timeStampDiv=document.querySelector(".lastUpdatedTimeStamp");
if (timeStampDiv) {
var ts=new Date(this._lastUpdatedTime);
var formatTimeStamp=PlatformJS.Services.resourceLoader.getString("LastUpdatedDataTime").format(WeatherAppJS.Utilities.Formatting.getShortFormattedLastUpdateTime(ts.getFullYear(), ts.getMonth(), ts.getDate(), ts.getHours(), ts.getMinutes()));
timeStampDiv.innerText = formatTimeStamp;
timeStampDiv.style.display = "block"
}
}
}, hideLastUpdatedTime: function hideLastUpdatedTime() {
var timeStampdiv=document.querySelector(".lastUpdatedTimeStamp");
if (timeStampdiv) {
timeStampdiv.style.display = "none"
}
}, setPlatformTheme: function setPlatformTheme(theme) {
CommonJS.setTheme(theme, true)
}, cleanPeriodicTimersStack: function cleanPeriodicTimersStack() {
while (this._timersStack.length > 0) {
var timer=this._timersStack.pop();
if (timer) {
clearInterval(timer);
timer = null
}
}
}, cleanTimeoutsStack: function cleanTimeoutsStack() {
while (this._timeoutsStack.length > 0) {
var timer=this._timeoutsStack.pop();
if (timer) {
clearTimeout(timer);
timer = null
}
}
}, onSettingsChangeBase: function onSettingsChangeBase(e) {
var currentPage=PlatformJS.Navigation.currentIPage;
if (currentPage.onSettingsChange && currentPage.onSettingsChange instanceof Function) {
currentPage.onSettingsChange(e)
}
}, onPageRefresh: function onPageRefresh(e){}, disposePage: function disposePage() {
WeatherAppJS.Utilities.Common.cleanupPromiseStack(this._promisesStack);
this.cleanPeriodicTimersStack();
this.cleanTimeoutsStack();
WeatherAppJS.SettingsManager.removeEventListener('settingchanged', this.onSettingsChangeBase);
if (this._disposePage) {
this._disposePage()
}
}, onNavigateAway: function onNavigateAway(reason) {
this.disposePage()
}, onBindingComplete: function onBindingComplete(){}, getPageState: function getPageState(){}, onRefreshClick: function onRefreshClick(e) {
CommonJS.dismissAllEdgies();
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NumRefreshClicked");
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.ActionContext.bottomEdgy, "Refresh", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0);
var geoLoc=WeatherAppJS.GeocodeCache.getLocation(this._locID);
if (geoLoc) {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logSearch(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, geoLoc.getFullDisplayName(), "Bing", Microsoft.Bing.AppEx.Telemetry.SearchMethod.view, false, -1, false, false, false, WeatherAppJS.Instrumentation.FormCodes.Default, geoLoc.latitude + ' - ' + geoLoc.longitude)
}
if (WeatherAppJS.Networking.internetAvailable) {
this.onPageRefresh(true)
}
else {
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString("NoInternetConnectionError"), false)
}
}, onChangeUnitToFClick: function onChangeUnitToFClick(e) {
CommonJS.dismissAllEdgies();
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NumBottomEdgyUnitChanged");
WeatherAppJS.SettingsManager.setDisplayUnitAsync('F', Microsoft.Bing.AppEx.Telemetry.ActionContext.bottomEdgy).then()
}, onChangeUnitToCClick: function onChangeUnitToCClick(e) {
CommonJS.dismissAllEdgies();
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NumBottomEdgyUnitChanged");
WeatherAppJS.SettingsManager.setDisplayUnitAsync('C', Microsoft.Bing.AppEx.Telemetry.ActionContext.bottomEdgy).then()
}, onChangeHomeClick: function onChangeHomeClick(event) {
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NumChangeHomeClick");
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.ActionContext.bottomEdgy, "Change Home", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0);
var changeHomeFlyout=document.getElementById("changeHomeFlyout");
if (!changeHomeFlyout) {
changeHomeFlyout = document.createElement('div');
changeHomeFlyout.id = 'changeHomeFlyout';
changeHomeFlyout.setAttribute('data-win-control', 'WinJS.UI.Flyout');
var mainContainer=document.getElementById('mainContainer');
if (mainContainer) {
mainContainer.appendChild(changeHomeFlyout)
}
WinJS.UI.processAll(changeHomeFlyout)
}
var changeHomeContainer=document.createElement("div");
WinJS.Utilities.addClass(changeHomeContainer, "changeHomeContainer");
var flyoutControl=changeHomeFlyout.winControl;
WeatherAppJS.Utilities.UI.dismissPlatformFlyout();
function changeHomeFlyoutClick(locationName) {
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NumUseExistingCity");
var eventAttr={
currentHome: WeatherAppJS.SettingsManager.getDefaultLocation().getFullDisplayName(), pickedHome: locationName.getFullDisplayName()
};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Change Home Flyout", "Fav/Recent Location", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.select, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr));
flyoutControl.hide();
CommonJS.dismissAllEdgies();
WeatherAppJS.SettingsManager.setDefaultLocationAsync(locationName, false).then(null, function(e) {
if (e.errorcode === WeatherAppJS.ErrorCodes.SettingsManager.FAVORITES_MAX_LIMIT_REACHED) {
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString("MaxFavoritesLimitReached"), false)
}
else if (e.errorcode === WeatherAppJS.ErrorCodes.SettingsManager.LOCATION_PINNED_TO_START) {
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString("LocationPinnedToStart"), false)
}
})
}
function addNewLocClick() {
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NumChangeHomeAdd");
flyoutControl.hide();
if (WeatherAppJS.SettingsManager.isFavoritesMaxLimitReached()) {
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString("MaxFavoritesLimitReached"), false)
}
else if (WeatherAppJS.Networking.internetAvailable === false) {
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString("NoInternetConnectionError"), false)
}
else {
WeatherAppJS.Utilities.UI.addNewHomeLoc()
}
}
var currentSelectedIndex=-1;
function changeHomeFlyout_onKeydown(e) {
var Key=WinJS.Utilities.Key;
var isUpKey=false;
switch (e.keyCode) {
case Key.upArrow:
isUpKey = true;
break;
case Key.downArrow:
break;
case Key.enter:
case Key.space:
e.preventDefault();
return;
default:
return
}
e.preventDefault();
e.stopImmediatePropagation();
var itemList=e.currentTarget.querySelectorAll(".changeHomeSectionDiv");
var curIndex=currentSelectedIndex;
if (document.activeElement !== itemList[curIndex]) {
for (var i=0; i < itemList.length; i++) {
if (document.activeElement === itemList[i]) {
curIndex = i;
break
}
}
}
if (itemList.length === 0) {
return
}
if (curIndex === -1) {
if (isUpKey) {
curIndex = itemList.length - 1
}
else {
curIndex = 0
}
}
else {
if (isUpKey) {
curIndex -= 1;
if (curIndex < 0) {
curIndex = itemList.length - 1
}
}
else {
curIndex += 1;
if (curIndex >= itemList.length) {
curIndex = 0
}
}
}
itemList[curIndex].focus();
currentSelectedIndex = curIndex
}
;
function buildChangeHomeFlyout() {
var listLength=0;
changeHomeFlyout.innerHTML = "";
changeHomeFlyout.onkeydown = changeHomeFlyout_onKeydown;
CommonJS.loadModule({
fragmentPath: "/html/templates.html", templateId: "changeHomeFlyoutTemplate"
}, {}).then(function(template) {
var resourceLoader=PlatformJS.Services.resourceLoader;
var section=template.querySelector(".changeHomeSection");
var sectionDiv=template.querySelector(".changeHomeSectionDiv");
function addToSection(locationObj, parentSection, isHomeLoc) {
if (!locationObj) {
return
}
var structure=sectionDiv.cloneNode(true);
structure.onkeyup = WeatherAppJS.Utilities.TabIndexManager.HandleKeyboardInvocation;
var displayName=WeatherAppJS.GeocodeCache.getFullDisplayName(locationObj.getId());
structure.querySelector(".changeHomeSectionText").innerText = displayName;
if (isHomeLoc) {
WinJS.Utilities.addClass(structure.querySelector(".changeHomeSectionIcon"), "changeHomeDefaultLocIcon");
var label=resourceLoader.getString("CurrentHomeNarratorString");
structure.querySelector(".changeHomeSectionText").setAttribute("aria-hidden", "true");
structure.setAttribute("aria-label", label.format(displayName))
}
(function(loc) {
structure.addEventListener("click", function(e) {
changeHomeFlyoutClick(loc)
})
})(locationObj);
parentSection.appendChild(structure)
}
WeatherAppJS.SettingsManager.getFavoritesAsync().then(function(favorites) {
var favSection=section.cloneNode(true);
favSection.querySelector(".changeHomeSectionText").innerText = resourceLoader.getString("Favorites");
addToSection(WeatherAppJS.SettingsManager.getDefaultLocation(), favSection, true);
if (favorites && favorites.length > 0) {
listLength += favorites.length;
for (var i=0; i < favorites.length; i++) {
addToSection(favorites[i], favSection)
}
}
changeHomeContainer.appendChild(favSection)
});
WeatherAppJS.SettingsManager.getRecentLocationsAsync().then(function(recentLocs) {
if (recentLocs && recentLocs.length > 0) {
listLength += recentLocs.length;
var recSection=section.cloneNode(true);
recSection.querySelector(".changeHomeSectionText").innerText = resourceLoader.getString("RecentSearches");
for (var i=0; i < recentLocs.length; i++) {
addToSection(recentLocs[i], recSection)
}
changeHomeContainer.appendChild(recSection)
}
});
var addNewSection=sectionDiv.cloneNode(true);
addNewSection.tabIndex = "0";
addNewSection.setAttribute("role", "button");
addNewSection.onkeyup = WeatherAppJS.Utilities.TabIndexManager.HandleKeyboardInvocation;
addNewSection.querySelector(".changeHomeSectionText").innerText = resourceLoader.getString("AddNewLocationString");
WinJS.Utilities.addClass(addNewSection, "changeHomeAddNew");
addNewSection.addEventListener("click", addNewLocClick);
changeHomeFlyout.appendChild(changeHomeContainer);
changeHomeFlyout.appendChild(addNewSection)
});
return (listLength !== 0)
}
function changeHomeFlyoutCleanup() {
CommonJS.dismissAllEdgies();
changeHomeFlyout.innerHTML = "";
flyoutControl.removeEventListener("afterhide", changeHomeFlyoutCleanup)
}
if (buildChangeHomeFlyout()) {
flyoutControl.addEventListener("afterhide", changeHomeFlyoutCleanup);
var changeHomeButton=document.getElementById('changeHomeButton');
flyoutControl.show(changeHomeButton, "top");
changeHomeFlyout.focus()
}
else {
if (WeatherAppJS.Networking.internetAvailable === false) {
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString("NoInternetConnectionError"), false)
}
else {
WeatherAppJS.Utilities.UI.addNewHomeLoc()
}
}
}, onCurrentLocationClick: function onCurrentLocationClick(event, currentPageLocation) {
var that=this;
CommonJS.dismissAllEdgies();
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NumCurrentLocationBottomEdgyClicked");
if (WeatherAppJS.Networking.internetAvailable) {
CommonJS.Progress.showProgress(CommonJS.Progress.headerProgressType);
var detectAndFetchLocationPromise=WeatherAppJS.LocationTracking.detectAndFetchCurrentLocationDataAsync();
that._promisesStack.push(detectAndFetchLocationPromise);
detectAndFetchLocationPromise.then(function(locationObj) {
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
var eventAttr={
detectedLocation: locationObj.getFullDisplayName(), accuracy: locationObj.locDetectAccuracy
};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.ActionContext.bottomEdgy, "Detect Location", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr));
if (locationObj.locDetectAccuracy > PlatformJS.Services.appConfig.getInt32("DetectedLocationAccuracyThreshold")) {
WeatherAppJS.Utilities.UI.showAddLocationFlyout(locationObj)
}
else {
if (locationObj && locationObj.getId() !== currentPageLocation) {
if (locationObj.getId() === WeatherAppJS.SettingsManager.getDefaultLocationId()) {
PlatformJS.Navigation.navigateToChannel('Home')
}
else {
PlatformJS.Navigation.navigateToChannel('Home', {
locID: locationObj.getId(), geocodeLocation: locationObj
})
}
}
}
}, function(err) {
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
if (err.errorcode === WeatherAppJS.ErrorCodes.LocationTracking.LOCATION_TRACKING_DISABLED) {
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString("LocationDisabledError"), false)
}
else if (err.errorcode === WeatherAppJS.ErrorCodes.LocationTracking.LOCATION_DETECTION_FAILED) {
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NumCurrentLocationBottomEdgyFailed");
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logContentError(Microsoft.Bing.AppEx.Telemetry.LogLevel.high, "", "Current Location detection failed", err.errorcode, "", "");
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString("CurrentLocationFetchErrorMsg"), false)
}
else if (err.errorcode === WeatherAppJS.ErrorCodes.LocationTracking.NO_WEATHER_DATA) {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logContentError(Microsoft.Bing.AppEx.Telemetry.LogLevel.high, "", "No weather data available when location detected", err.errorcode, "", "");
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString("CurrentLocDataNotAvailable"), false)
}
})
}
else {
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString("NoInternetConnectionError"), false)
}
}
})});
WinJS.Namespace.define("WeatherAppJS.Core", {WeatherPanoramaBasePage: WinJS.Class.derive(WeatherAppJS.Core.WeatherBasePage, function(state) {
WeatherAppJS.Core.WeatherBasePage.call(this, state);
this._panoramaControl = document.getElementById("mainPanorama").winControl;
if (state && state.panoramaState) {
this._panoramaControl.panoramaState = state.panoramaState
}
var that=this;
that._data = new PlatformJS.Utilities.Binding.List;
that._clusterDefs = []
}, {
_panoControl: null, _panoState: null, _data: null, _clusterDefs: null, onDpiChange: function onDpiChange(event) {
var panoControl=this._panoramaControl;
if (panoControl && panoControl.onDpiChange) {
panoControl.onDpiChange(event)
}
}, dispose: function dispose() {
this._clusterDefs = null;
this._data = null;
if (this._panoramaControl && this._panoramaControl.dispose) {
this._panoramaControl.dispose();
this._panoramaControl = null
}
if (this.disposePage) {
this.disposePage()
}
}, displayLastUpdatedTime: function displayLastUpdatedTime() {
if (this._lastUpdatedTime && this._panoramaControl) {
var ts=new Date(this._lastUpdatedTime);
var formatTimeStamp=PlatformJS.Services.resourceLoader.getString("LastUpdatedDataTime").format(WeatherAppJS.Utilities.Formatting.getShortFormattedLastUpdateTime(ts.getFullYear(), ts.getMonth(), ts.getDate(), ts.getHours(), ts.getMinutes()));
this._panoramaControl.watermark = formatTimeStamp
}
}, pushIntoClusterDefs: function pushIntoClusterDefs(clusterDef) {
if (!this._clusterDefs) {
this._clusterDefs = []
}
if (clusterDef && clusterDef.clusterContent && clusterDef.clusterContent.contentOptions) {
clusterDef.clusterContent.contentOptions.clusterKey = clusterDef.clusterKey;
clusterDef.clusterContent.contentOptions.currentIPage = this
}
this._clusterDefs.push(clusterDef)
}
})})