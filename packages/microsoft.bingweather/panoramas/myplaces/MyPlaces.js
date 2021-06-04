/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
var resourceFile=PlatformJS.Services.resourceLoader;
var key={
Home: "Cluster0", Favorite: "Cluster1", Recent: "Cluster2"
};
var title={
Home: resourceFile.getString("Home"), Favorite: resourceFile.getString("Favorites"), Recent: resourceFile.getString("RecentSearches")
};
WinJS.Namespace.define("WeatherAppJS", {MyPlaces: WinJS.Class.derive(WeatherAppJS.WeatherPanoramaBasePage, function(state) {
msWriteProfilerMark("WeatherApp:PlacesPageLoad:s");
WeatherAppJS.WeatherPanoramaBasePage.call(this, state);
CommonJS.Progress.showProgress(CommonJS.Progress.headerProgressType);
CommonJS.setTheme("myPlacesBackground", false);
this._recentClusterKey = key["Recent"];
this._favoriteClusterKey = key["Favorite"];
this._homeClusterKey = key["Home"];
this._title = resourceFile.getString("MyPlaces");
this.favoritesData = [];
this.recentLocsData = [];
this.defaultLocData = {};
this._setDefaultClicked = false;
this._logSelection = false;
this._prevFavorites = 0;
this._prevRecent = 0;
this.isRecentEditButtonListenerConfigured = false;
this.favoritesReordered = false;
this._state = state || {};
var that=this;
this.onInternetChange = function() {
if (WeatherAppJS.Networking.internetAvailable === true) {
that.resetAllClusters();
CommonJS.forceRefresh();
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
WeatherAppJS.Networking.networkChangeCallback = null
}
else {
WeatherAppJS.Networking.networkChangeCallback = that.onInternetChange
}
};
this.onSettingsChange = function(e) {
if (e.detail.setting === "unitChange") {
if (WeatherAppJS.Networking.internetAvailable === true) {
msWriteProfilerMark("WeatherApp:PlacesPageRefresh:s");
that._bypassCache = true;
that.resetAllClusters();
CommonJS.forceRefresh();
msWriteProfilerMark("WeatherApp:PlacesPageRefresh:e")
}
else {
WeatherAppJS.Networking.networkChangeCallback = that.onInternetChange
}
}
};
this.onPageRefresh = function(bypassCache) {
if (WeatherAppJS.Networking.internetAvailable === true) {
that.resetAllClusters();
that._bypassCache = (bypassCache) || false;
CommonJS.forceRefresh()
}
else {
WeatherAppJS.Networking.networkChangeCallback = that.onInternetChange
}
};
this._fadeOut = function(shown, duration) {
if (!shown) {
return
}
return WinJS.UI.executeTransition(shown, {
property: 'opacity', delay: 0, duration: duration, timing: "linear", to: 0
})
};
this._fadeIn = function(notShown, duration) {
if (!notShown) {
return
}
return WinJS.UI.executeTransition(notShown, {
property: 'opacity', delay: 0, duration: duration, timing: "linear", to: 1
})
};
this._rotate = function(shown, duration) {
if (!shown) {
return
}
WinJS.UI.executeTransition(shown, {
property: '-ms-transform', delay: 0, duration: duration, timing: "linear", to: "perspective(200px) rotateY(-180deg)"
})
};
this.animate = function(currentTemp, highLowTemp, index, nodeListLength) {
if (index < nodeListLength) {
if (!currentTemp[index] || !currentTemp[index].parentElement || !currentTemp[index].parentElement.parentElement) {
return
}
var grandparent=currentTemp[index].parentElement.parentElement;
var isHighLowViewBlocked=(grandparent.className.indexOf("noHighLowAnimation") !== -1);
var animationTimeoutId=null;
if (that._tempCurrentBlockInView) {
if (!isHighLowViewBlocked) {
that._rotate(currentTemp[index], that._tempBlockRotationTime);
animationTimeoutId = setTimeout(function() {
that.animate(currentTemp, highLowTemp, index + 1, nodeListLength)
}, that._timeDelayBetweenTiles);
that._fadeOut(currentTemp[index], that._tempBlockFadeOutTime).then(function() {
if (currentTemp[index]) {
currentTemp[index].style.msTransform = ""
}
that._fadeIn(highLowTemp[index], that._tempBlockFadeInTime)
})
}
else {
animationTimeoutId = setTimeout(function() {
that.animate(currentTemp, highLowTemp, index + 1, nodeListLength)
}, that._timeDelayBetweenTiles)
}
}
else {
that._rotate(highLowTemp[index], that._tempBlockRotationTime);
animationTimeoutId = setTimeout(function() {
that.animate(currentTemp, highLowTemp, index + 1, nodeListLength)
}, that._timeDelayBetweenTiles);
that._fadeOut(highLowTemp[index], that._tempBlockFadeOutTime).then(function() {
if (highLowTemp[index]) {
highLowTemp[index].style.msTransform = ""
}
that._fadeIn(currentTemp[index], that._tempBlockFadeInTime).then(function(){})
})
}
that._timeoutsStack.push(animationTimeoutId)
}
else {
that._tempCurrentBlockInView = !that._tempCurrentBlockInView
}
};
this.tempBlockToggle = function() {
if (that._isAnimationEnabled) {
var currentTemp=document.querySelectorAll('.favCurrentTempBlock');
var highLowTemp=document.querySelectorAll('.boundaryTempBlock');
that.animate(currentTemp, highLowTemp, 0, currentTemp.length)
}
};
this.onClearSearchHistory = function(locations) {
that.removeClusterFromPanorama(that._recentClusterKey);
that.addRemoveRecentCluster()
};
this.onRecentLocationRemoved = function(e) {
if (!e || !e.detail) {
return
}
var loc=e.detail;
var index=that._getItemIndex(that.getAllModulesOfType(that._recentClusterKey), loc);
if (index >= 0) {
that.removeModuleFromCluster(that._recentClusterKey, index);
that.addRemoveRecentCluster()
}
};
this.onFavoriteAdded = function(e) {
if (!e || !e.detail) {
return
}
var loc=e.detail;
var index=that._getItemIndex(that.getAllModulesOfType(that._favoriteClusterKey), loc);
var home_index=that._getItemIndex(that.getAllModulesOfType(that._homeClusterKey), loc);
if (index >= 0 || home_index >= 0) {
return
}
var locationData=that.getEmptyLocationToBind();
var locationDisplayName=(loc.getId()) ? WeatherAppJS.GeocodeCache.getFullDisplayName(loc.getId()) : "";
locationData.id = loc.getId();
locationData.locationDisplayName = (locationDisplayName) ? locationDisplayName : loc.fullName;
that.fetchLocationDataAsync(false, locationData, "Favorite");
that.addModuleAtPenultimatePosition(that._favoriteClusterKey, {
groupKey: that._favoriteClusterKey, groupTitle: title["Favorite"], loc: locationData, itemKey: locationData.id, moduleInfo: {
fragmentPath: "/panoramas/myplaces/favoritesTemplate.html", templateId: "eachfavoriteModule", className: "favoriteLocation"
}, placeType: "Favorite"
})
};
this.onDefaultLocationUpdated = function(e) {
if (!that._setDefaultClicked) {
var oldDefault=that.getModuleFromCluster(that._homeClusterKey, 0).data;
var loc=e.detail;
var newDefault=null;
var index=that._getItemIndex(that.getAllModulesOfType(that._favoriteClusterKey), loc);
if (index >= 0) {
newDefault = that.getModuleFromCluster(that._favoriteClusterKey, index).data;
that.swapTileData(newDefault, oldDefault)
}
else {
var emptyLocation=that.getEmptyLocationToBind();
that.addModuleAtPenultimatePosition(that._favoriteClusterKey, {
groupKey: that._favoriteClusterKey, groupTitle: title["Favorite"], loc: emptyLocation, itemKey: "", moduleInfo: {
fragmentPath: "/panoramas/myplaces/favoritesTemplate.html", templateId: "eachfavoriteModule", className: "favoriteLocation"
}, placeType: "Favorite"
});
index = that.getTotalModulesCount(that._favoriteClusterKey) - 2;
newDefault = that.getModuleFromCluster(that._favoriteClusterKey, index).data;
if (newDefault) {
that.swapTileData(newDefault, oldDefault);
oldDefault.loc.id = loc.getId();
oldDefault.itemKey = oldDefault.loc.id;
var locationDisplayName=(loc.fullName) ? WeatherAppJS.GeocodeCache.getFullDisplayName(loc.getId()) : "";
oldDefault.loc.locationDisplayName = (locationDisplayName) ? locationDisplayName : loc.fullName;
that.fetchLocationDataAsync(false, oldDefault.loc, "Favorite")
}
}
}
},
this._getItemIndex = function(list, loc) {
if (!list) {
return -1
}
for (var i=0; i < list.length; i++) {
var item=list.getItem(i);
if (item && item.data && item.data.loc) {
if (item.data.loc.id === loc.getId()) {
return i
}
}
}
return -1
};
this._disposePage = function() {
var settingsManager=WeatherAppJS.SettingsManager;
if (this.favoritesReordered) {
this.favoritesReordered = false;
settingsManager.writeFavoritesOrderToPDP()
}
settingsManager.removeEventListener('settingchanged', this.onSettingsChange, false);
settingsManager.removeEventListener('recentlocationscleared', this.onClearSearchHistory, false);
settingsManager.removeEventListener('recentlocationremoved', this.onRecentLocationRemoved, false);
settingsManager.removeEventListener('favoriteadded', this.onFavoriteAdded, false);
settingsManager.removeEventListener('defaultlocationupdated', this.onDefaultLocationUpdated, false);
this._title = null;
this.favoritesData = null;
this.recentLocsData = null;
this.defaultLocData = null;
this._data = null;
WeatherAppJS.Networking.networkChangeCallback = null
};
this.showAddLocationFlyout = function() {
that._isAnimationEnabled = false;
WeatherAppJS.Utilities.UI.dismissPlatformFlyout();
WeatherAppJS.Search.showQuickSearchDialog("mainPanorama", WeatherAppJS.Search.Actions.AddLocation, that.hideAddLocationFlyout)
};
this.hideAddLocationFlyout = function() {
WeatherAppJS.Search.onAddLocationFlyoutHide();
that._isAnimationEnabled = true
};
var appConfig=PlatformJS.Services.appConfig;
that._tempBlockToggleTimeout = appConfig.getInt32("MyPlacesTempBlockToggleTimeout");
that._timeDelayBetweenTiles = appConfig.getInt32("MyPlacesTimeDelayBetweenTiles");
that._tempBlockFadeInTime = appConfig.getInt32("MyPlacesTempBlockFadeInTime");
that._tempBlockFadeOutTime = appConfig.getInt32("MyPlacesTempBlockFadeOutTime");
that._tempBlockRotationTime = appConfig.getInt32("MyPlacesTempBlockRotationTime");
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
msWriteProfilerMark("WeatherApp:PlacesPageLoad:e")
}, {
getPageImpressionContext: function getPageImpressionContext() {
return WeatherAppJS.Instrumentation.PageContext.MyPlaces
}, populateMyPlacesData: function populateMyPlacesData(bypassCache) {
var that=this;
var settingsManager=WeatherAppJS.SettingsManager;
that.defaultLocData = {};
that.favoritesData = [];
that.recentLocsData = [];
populateDefaultLocation(bypassCache, that.defaultLocData);
populateChangeHomeTile();
settingsManager.getFavoritesAsync().then(function(favorites) {
that.createCluster(that._favoriteClusterKey);
populateMyPlaces(bypassCache, favorites, that.favoritesData, "Favorite");
settingsManager.getRecentLocationsAsync().then(function(recentLocs) {
populateMyPlaces(bypassCache, recentLocs, that.recentLocsData, "Recent")
}, function(recentError){})
}, function(favoritesError) {
that.createCluster(that._favoriteClusterKey);
settingsManager.getRecentLocationsAsync().then(function(recentLocs) {
populateMyPlaces(bypassCache, recentLocs, that.recentLocsData, "Recent")
}, function(recentError){})
});
function populateDefaultLocation(bypassCacheFlag, locationData) {
var clusterName="Home";
locationData = that.getEmptyLocationToBind();
locationData.displayHome = '';
var defaultLoc=settingsManager.getDefaultLocationId();
var locationDisplayName=(defaultLoc) ? WeatherAppJS.GeocodeCache.getFullDisplayName(defaultLoc) : "";
locationData.id = defaultLoc;
locationData.locationDisplayName = (locationDisplayName) ? locationDisplayName : defaultLoc;
that.fetchLocationDataAsync(bypassCacheFlag, locationData, clusterName);
that.addModuleToCluster(key[clusterName], {
groupKey: key[clusterName], groupTitle: title[clusterName], loc: locationData, itemKey: locationData.id, moduleInfo: {
fragmentPath: "/panoramas/myplaces/favoritesTemplate.html", templateId: "eachfavoriteModule", className: "favoriteLocation defaultLocation"
}, placeType: clusterName
})
}
function populateMyPlaces(bypassCacheFlag, locations, locationsData, clusterName) {
if (locations !== undefined && locations.length > 0) {
var geocodeCache=WeatherAppJS.GeocodeCache;
for (var i=0, j=locations.length; i < j; i++) {
locationsData[i] = that.getEmptyLocationToBind();
var locationDisplayName=(locations[i].fullName) ? geocodeCache.getFullDisplayName(locations[i].getId()) : "";
locationsData[i].id = locations[i].getId();
locationsData[i].locationDisplayName = (locationDisplayName) ? locationDisplayName : locations[i].fullName;
that.fetchLocationDataAsync(bypassCacheFlag, locationsData[i], clusterName)
}
for (var locationIndex=0, k=locations.length; locationIndex < k; locationIndex++) {
that.addModuleToCluster(key[clusterName], {
groupKey: key[clusterName], groupTitle: title[clusterName], loc: locationsData[locationIndex], itemKey: locationsData[locationIndex].id, moduleInfo: {
fragmentPath: "/panoramas/myplaces/favoritesTemplate.html", templateId: "eachfavoriteModule", className: "favoriteLocation"
}, placeType: clusterName
})
}
}
}
function populateChangeHomeTile() {
that.addModuleToCluster(that._homeClusterKey, {
groupKey: that._homeClusterKey, groupTitle: title["Home"], moduleInfo: {
fragmentPath: "/panoramas/myplaces/favoritesTemplate.html", templateId: "homeChangeTile", className: "addTileFavorites"
}, placeType: "ChangeHomeTile"
})
}
}, getEmptyLocationToBind: function getEmptyLocationToBind() {
var noDataString=WeatherAppJS.Utilities.Common.getNoDataString();
return WinJS.Binding.as({
id: '', locationDisplayName: '', skycode: "/images/skycodes/89x89/44.png", caption: '', secondaryCaption: '', bgClass: "favoriteLocation platformImagePlaceHolder", bg: 'url("/images/weather_placeholder.png")', snowCC: noDataString, snowUnit: noDataString, displaySnowData: 'none', displayTempData: 'none', currentTemp: noDataString, displayCurrentTemp: 'inline', currentTempBlockOpacity: 1, displayTemp1: noDataString, displayTemp2: noDataString, symbolPosition: "ltr", displayTempBoundary: 'inline', boundaryTempBlockOpacity: 0, alertText: '', displayAlert: 'none', displayAlertBgClassFav: 'favAlerts', displayHome: 'none'
})
}, fetchLocationDataAsync: function fetchLocationDataAsync(bypassCache, locationData, clusterName) {
var that=this;
var tempFormat=WeatherAppJS.WarmBoot.Cache.getString("TemperatureFormat");
var weatherDataAsyncFunction=WeatherAppJS.LocationsManager.getTileDataForLocationAsync;
var locID=locationData.id;
var locationObj=WeatherAppJS.GeocodeCache.getLocation(locID);
if (locationObj && locationObj.isSkiLocation) {
weatherDataAsyncFunction = WeatherAppJS.LocationsManager.getSkiTileDataForLocationAsync
}
var useTianQi=Platform.Utilities.Globalization.isFeatureEnabled("UseTianQi");
var isTianQiLocation=useTianQi && WeatherAppJS.GeocodeCache.isTianQiSupportedLocation(locID);
if (isTianQiLocation) {
weatherDataAsyncFunction = WeatherAppJS.LocationsManager.getTianQiTileDataForLocationAsync
}
var progressCallback=(function(locData) {
return function(Loc) {
var handleAlertData=function(locObj) {
var cc=locObj.getCurrentConditions();
locData.alertText = cc.alertTextFavTile;
locData.displayAlert = cc.displayAlert;
locData.displayAlertBgClassFav = cc.displayAlertBgClassFav
};
if (Loc && locID === Loc.id) {
var LocCC=Loc.getCurrentConditions();
var bgClass="favoriteLocation";
if (locationObj && locationObj.isSkiLocation) {
locData.snowCC = (LocCC.snowCC !== undefined) ? LocCC.snowCC : "";
locData.snowUnit = (LocCC.snowUnit !== undefined) ? LocCC.snowUnit : "";
locData.displaySnowData = (locData.snowCC !== "") ? "inline" : "none";
locData.displayTempBoundary = "none";
locData.secondaryCaption = resourceFile.getString("NewSnowHeader");
locData.bg = 'url("' + LocCC.skycode + '")';
if ((LocCC.snowCC === undefined || LocCC.snowCC === "--") && (LocCC.snowUnit === undefined || LocCC.snowUnit === "--")) {
bgClass = bgClass.concat(" noHighLowAnimation")
}
bgClass = bgClass + " favSkiTileImg"
}
else {
locData.displayTemp1 = tempFormat === 'MaxMin' ? LocCC.tempHigh : LocCC.tempLow;
locData.displayTemp2 = tempFormat === 'MaxMin' ? LocCC.tempLow : LocCC.tempHigh;
locData.displayTempBoundary = (LocCC.displayTempBoundary === "") ? "inline" : "none";
locData.displaySnowData = "none";
if ((LocCC.tempHigh === undefined || LocCC.tempHigh === "--") && (LocCC.tempLow === undefined || LocCC.tempLow === "--")) {
bgClass = bgClass.concat(" noHighLowAnimation")
}
locData.secondaryCaption = resourceFile.getString("favHighLowText");
if (tempFormat === "MinMax") {
locData.secondaryCaption = resourceFile.getString("favLowHighText")
}
var imgAndTheme=Loc.getHeroImageAndThemeData();
locData.bg = WeatherAppJS.Utilities.ThemeManager.getTileImageForSkyCode(imgAndTheme, LocCC.iconcode, LocCC.dayNightIndicator)
}
locData.currentTemp = (LocCC.temperature !== undefined && LocCC.temperature !== null) ? LocCC.temperature : "";
locData.displayCurrentTemp = (LocCC.displayTemp === "") ? "inline" : "none";
locData.caption = LocCC.caption;
locData.symbolPosition = LocCC.symbolPosition;
locData.displayTempData = "block";
locData.bgClass = bgClass;
if (!isTianQiLocation) {
CommonJS.Progress.showProgress(CommonJS.Progress.headerProgressType);
var alertsDataPromise=WeatherAppJS.LocationsManager.getAlertsDataForLocationAsync(locData.id, bypassCache);
that._promisesStack.push(alertsDataPromise);
alertsDataPromise.then(function(locObj) {
handleAlertData(locObj);
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType)
}, function(e) {
if (PlatformJS.Utilities.isPromiseCanceled(e)) {
return
}
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType)
}, function(locObj) {
handleAlertData(locObj)
})
}
if (!that._lastUpdatedTime) {
that._lastUpdatedTime = LocCC.lastUpdatedTime
}
else {
if (that._lastUpdatedTime < LocCC.lastUpdatedTime) {
that._lastUpdatedTime = LocCC.lastUpdatedTime
}
}
that.displayLastUpdatedTime()
}
}
})(locationData);
var successCallback=(function(locData) {
return function(Loc) {
var successMarker="WeatherApp:PlacesPageLoad:DataFetch:" + Loc.id + ":e";
successMarker = successMarker.replace(",", "");
msWriteProfilerMark(successMarker);
if (locationObj && locationObj.isSkiLocation) {
progressCallback(Loc)
}
else {
progressCallback(Loc[0])
}
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType)
}
})(locationData);
var failureCallback=function(e) {
var failureMarker="WeatherApp:PlacesPageLoad:DataFetch:" + locationData.id + ":e";
failureMarker = failureMarker.replace(",", "");
msWriteProfilerMark(failureMarker);
if (PlatformJS.Utilities.isPromiseCanceled(e)) {
return
}
locationData.displayTempData = "block";
locationData.bgClass = "favoriteLocation noHighLowAnimation",
locationData.bg = 'url(/images/favoritesBackgrounds/44.jpg)';
that.displayLastUpdatedTime();
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType)
};
CommonJS.Progress.showProgress(CommonJS.Progress.headerProgressType);
var fetchMarker="WeatherApp:PlacesPageLoad:DataFetch:" + locationData.id + ":s";
fetchMarker = fetchMarker.replace(",", "");
msWriteProfilerMark(fetchMarker);
var tileDataPromise;
if (locationObj && locationObj.isSkiLocation) {
tileDataPromise = weatherDataAsyncFunction(locID, bypassCache)
}
else {
var imageServicesQuery=WeatherAppJS.LocationsManager.getImageServicesDataForLocationAsync;
tileDataPromise = WinJS.Promise.join([weatherDataAsyncFunction(locID, bypassCache), imageServicesQuery(locID, bypassCache)])
}
that._promisesStack.push(tileDataPromise);
tileDataPromise.then(successCallback, failureCallback, progressCallback)
}, addFavoritesCluster: function addFavoritesCluster() {
var that=this;
this.addClusterToPanorama({
clusterKey: this._favoriteClusterKey, clusterTitle: title["Favorite"], clusterType: WeatherAppJS.Utilities.ClusterDefinition.AdvancedListView, itemDataSource: this.getModulesDatasource(this._favoriteClusterKey), enabledFeatures: CommonJS.UI.ResponsiveListView.FEATURES.ADD + CommonJS.UI.ResponsiveListView.FEATURES.REMOVE + CommonJS.UI.ResponsiveListView.FEATURES.REORDER + CommonJS.UI.ResponsiveListView.FEATURES.PERSISTENCE, itemTemplate: function itemTemplate(itemPromise) {
return itemPromise.then(function(item) {
return CommonJS.loadModule(item.data.moduleInfo, item.data).then(function(nodeValue) {
return nodeValue
})
})
}, addTileItemTemplate: function addTileItemTemplate(itemPromise) {
return itemPromise.then(function(item) {
var favClusterControl=that._panorama.getClusterContentControl(that._favoriteClusterKey);
var addTile=CommonJS.createElement("div", favClusterControl.element, "ListView2AddTile");
WinJS.Utilities.addClass(addTile, "addTileContainer");
WinJS.Utilities.addClass(addTile, "win-nondraggable");
addTile.setAttribute("aria-label", resourceFile.getString("AddTileAriaText"));
var addTileIcon=CommonJS.createElement("span", addTile, "AddIcon");
WinJS.Utilities.addClass(addTileIcon, "addTileIcon");
addTile.appendChild(addTileIcon);
favClusterControl._addTileID = addTile.id;
return addTile
})
}
}, {
friendlyName: "favoriteCitiesList", onMSPointerDown: function onMSPointerDown(e) {
that.handleTileSelect(e)
}, onselectionchanged: function onselectionchanged(e) {
that.onSelectionChanged(e)
}, onlistreordered: function onlistreordered(e) {
that.favoritesReordered = true;
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, WeatherAppJS.Instrumentation.PageContext.Favorites, "Location Tile", "appReorder", PlatformJS.Utilities.getLastClickUserActionMethod(), 0);
WeatherAppJS.SettingsManager.ReorderFavorites(this.winControl.getOrder()).then()
}, onitemdeleted: function onitemdeleted(e) {
var locationDetails=WeatherAppJS.GeocodeCache.getLocation(e.detail.loc.id);
var eventAttr={location: locationDetails.getFullDisplayName()};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, WeatherAppJS.Instrumentation.PageContext.Favorites, "Remove Marked Tile", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr));
WeatherAppJS.SettingsManager.removeFavoriteAsync(locationDetails).then(function() {
msWriteProfilerMark("WeatherApp:PlacesPageListView:RemoveFavorite:e")
}, function(e) {
msWriteProfilerMark("WeatherApp:PlacesPageListView:RemoveFavorite:e")
})
}, onadditeminvoked: function onadditeminvoked(e) {
that.onAddFavoriteClick(WeatherAppJS.Instrumentation.PageContext.Favorites)
}, oniteminvoked: function oniteminvoked(e) {
if (e) {
var fav=that.getModuleFromCluster(that._favoriteClusterKey, e.detail.itemIndex);
if (!fav.data.isCommonJSAddTile) {
var eventAttr={location: WeatherAppJS.GeocodeCache.getLocation(fav.data.loc.id).getFullDisplayName()};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, WeatherAppJS.Instrumentation.PageContext.Favorites, "Location Tile", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr));
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NumFavoritesClicked");
WeatherAppJS.Utilities.UI.handleFavoritesClick(fav.data.loc.id)
}
}
}
})
}, addHomeCluster: function addHomeCluster() {
var that=this;
this.addClusterToPanorama({
clusterKey: this._homeClusterKey, clusterTitle: title["Home"], clusterType: WeatherAppJS.Utilities.ClusterDefinition.StandardListView, itemDataSource: this.getModulesDatasource(this._homeClusterKey), itemTemplate: function itemTemplate(itemPromise) {
return itemPromise.then(function(item) {
return CommonJS.loadModule(item.data.moduleInfo, item.data).then(function(nodeValue) {
if (that.isChangeHomeTile(item)) {
nodeValue.setAttribute("aria-label", resourceFile.getString("ChangeHomeTileAriaText"))
}
return nodeValue
})
})
}
}, {
onselectionchanging: function onselectionchanging(e) {
if (e) {
e.preventDefault()
}
}, oniteminvoked: function oniteminvoked(e) {
if (e) {
var changeHome=that.getModuleFromCluster(that._homeClusterKey, e.detail.itemIndex);
if (e.detail.itemIndex === 0) {
PlatformJS.Navigation.navigateToChannel('Home', {formCode: WeatherAppJS.Instrumentation.FormCodes.MyPlacesTile})
}
else if (that.isChangeHomeTile(changeHome)) {
msSetImmediate(function() {
WeatherAppJS.Utilities.UI.addNewHomeLoc()
})
}
}
}
})
}, addRemoveRecentCluster: function addRemoveRecentCluster() {
var that=this;
var clusterPresent=this.containsCluster(this._recentClusterKey);
if (clusterPresent && this.getTotalModulesCount(this._recentClusterKey) === 0) {
this.removeClusterFromPanorama(this._recentClusterKey)
}
else if (!clusterPresent && this.getTotalModulesCount(this._recentClusterKey) > 0) {
this.addClusterToPanorama({
clusterKey: this._recentClusterKey, clusterTitle: title["Recent"], clusterType: WeatherAppJS.Utilities.ClusterDefinition.AdvancedListView, itemDataSource: this.getModulesDatasource(this._recentClusterKey), enabledFeatures: CommonJS.UI.ResponsiveListView.FEATURES.REMOVE + CommonJS.UI.ResponsiveListView.FEATURES.REORDER + CommonJS.UI.ResponsiveListView.FEATURES.PERSISTENCE, itemTemplate: function itemTemplate(itemPromise) {
return itemPromise.then(function(item) {
var editButtons=document.getElementsByClassName('listView2EditButtonContainer');
if (editButtons.length === 2 && !that.isRecentEditButtonListenerConfigured) {
editButtons[1].addEventListener('click', function(event) {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel, WeatherAppJS.Instrumentation.PageContext.Recent, "Edit", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0)
});
that.isRecentEditButtonListenerConfigured = true
}
return CommonJS.loadModule(item.data.moduleInfo, item.data)
})
}
}, {
friendlyName: "recentCitiesList", onMSPointerDown: function onMSPointerDown(e) {
that.handleTileSelect(e)
}, onselectionchanged: function onselectionchanged(e) {
that.onSelectionChanged(e)
}, onlistreordered: function onlistreordered(e) {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, WeatherAppJS.Instrumentation.PageContext.Recent, "Location Tile", "appReorder", PlatformJS.Utilities.getLastClickUserActionMethod(), 0);
WeatherAppJS.SettingsManager.ReorderRecent(this.winControl.getOrder()).then()
}, onitemdeleted: function onitemdeleted(e) {
var locationDetails=WeatherAppJS.GeocodeCache.getLocation(e.detail.loc.id);
var eventAttr={location: locationDetails.getFullDisplayName()};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, WeatherAppJS.Instrumentation.PageContext.Recent, "Remove Marked Tile", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr));
WeatherAppJS.SettingsManager.removeRecentLocationAsync(locationDetails).then(function() {
that.addRemoveRecentCluster();
msWriteProfilerMark("WeatherApp:PlacesPageListView:RemoveRecent:e")
}, function(e) {
msWriteProfilerMark("WeatherApp:PlacesPageListView:RemoveRecent:e")
})
}, oniteminvoked: function oniteminvoked(e) {
if (e) {
var fav=that.getModuleFromCluster(that._recentClusterKey, e.detail.itemIndex);
var eventAttr={location: WeatherAppJS.GeocodeCache.getLocation(fav.data.loc.id).getFullDisplayName()};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, WeatherAppJS.Instrumentation.PageContext.Recent, "Location Tile", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr));
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NumRecentlySearchedClicked");
WeatherAppJS.Utilities.UI.handleFavoritesClick(fav.data.loc.id)
}
}
})
}
}, handleTileSelect: function handleTileSelect(e) {
var currentPoint=Windows.UI.Input.PointerPoint.getCurrentPoint(e.pointerId);
var pointProps=currentPoint.properties;
var touchInput=(e.pointerType === 2);
var rightButton=false;
if (!(touchInput || pointProps.isInverted || pointProps.isEraser || pointProps.isMiddleButtonPressed)) {
rightButton = pointProps.isRightButtonPressed
}
if (rightButton || touchInput) {
this._logSelection = true
}
}, clearSelection: function clearSelection() {
msWriteProfilerMark("WeatherApp:PlacesPageEdgy:Clear");
var listviewFavorite=this._panorama.getClusterContentControl(this._favoriteClusterKey);
var listviewRecent=this._panorama.getClusterContentControl(this._recentClusterKey);
if (listviewFavorite) {
listviewFavorite.selection.clear()
}
if (listviewRecent) {
listviewRecent.selection.clear()
}
}, onSelectionChanged: function onSelectionChanged(e) {
var listviewFavorite=this._panorama.getClusterContentControl(this._favoriteClusterKey);
var listviewRecent=this._panorama.getClusterContentControl(this._recentClusterKey);
var indicesFavorite=listviewFavorite.selection.getIndices();
var indicesRecent=(listviewRecent) ? listviewRecent.selection.getIndices() : [];
var totalIndices=indicesFavorite.length + indicesRecent.length;
var prevSelectedTiles=this._prevRecent + this._prevFavorites;
var context=WeatherAppJS.Instrumentation.PageContext.Favorites;
if (this._logSelection) {
if (prevSelectedTiles < totalIndices) {
if (indicesRecent.length > this._prevRecent) {
context = WeatherAppJS.Instrumentation.PageContext.Recent
}
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, context, "Location Tile", "appSelect", PlatformJS.Utilities.getLastClickUserActionMethod(), 0)
}
else if (prevSelectedTiles > totalIndices) {
if (indicesRecent.length < this._prevRecent) {
context = WeatherAppJS.Instrumentation.PageContext.Recent
}
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, context, "Location Tile", "appDeselect", PlatformJS.Utilities.getLastClickUserActionMethod(), 0)
}
}
this._logSelection = false;
this._prevFavorites = indicesFavorite.length;
this._prevRecent = indicesRecent.length
}, onBeforeShowBottomEdgy: function onBeforeShowBottomEdgy(e) {
this.clearSelection();
this.showEdgyButtons(0)
}, onBeforeHideBottomEdgy: function onBeforeHideBottomEdgy(e) {
this.clearSelection()
}, onRemoveClick: function onRemoveClick(e) {
msWriteProfilerMark("WeatherApp:PlacesPageEdgy:RemoveFavorite:s");
function handleRemoveClick(listview, myPlacesList) {
var indices=listview.selection.getIndices();
listview.selection.clear();
indices.sort(function(a, b) {
return (b - a)
});
for (var i in indices) {
var fav=myPlacesList.getItem(indices[i]).data;
var locationDetails=WeatherAppJS.GeocodeCache.getLocation(fav.loc.id);
eventAttr["location" + (listIndex++)] = locationDetails.getFullDisplayName();
if (fav.placeType === "Favorite") {
WeatherAppJS.SettingsManager.removeFavoriteAsync(locationDetails).then(function() {
myPlacesList.remove(indices[i]);
msWriteProfilerMark("WeatherApp:PlacesPageEdgy:RemoveFavorite:e")
}, function(e) {
msWriteProfilerMark("WeatherApp:PlacesPageEdgy:RemoveFavorite:e")
})
}
else if (fav.placeType === "Recent") {
WeatherAppJS.SettingsManager.removeRecentLocationAsync(locationDetails).then(function() {
msWriteProfilerMark("WeatherApp:PlacesPageEdgy:RemoveFavorite:e")
}, function(e) {
msWriteProfilerMark("WeatherApp:PlacesPageEdgy:RemoveFavorite:e")
})
}
}
}
WeatherAppJS.Utilities.Instrumentation.incrementInt32("MyPlacesBottomEdgyRemoveFavorite");
var listviewFavorite=this._panorama.getClusterContentControl(this._favoriteClusterKey);
var listviewRecent=this._panorama.getClusterContentControl(this._recentClusterKey);
var locList=[];
var listIndex=1;
var eventAttr={};
if (listviewRecent) {
handleRemoveClick(listviewRecent, this.getAllModulesOfType(this._recentClusterKey))
}
handleRemoveClick(listviewFavorite, this.getAllModulesOfType(this._favoriteClusterKey));
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.ActionContext.bottomEdgy, "Remove", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr));
this.addRemoveRecentCluster()
}, getSelectedTile: function getSelectedTile(clearSelection) {
var listviewFavorite=this._panorama.getClusterContentControl(this._favoriteClusterKey);
var listviewRecent=this._panorama.getClusterContentControl(this._recentClusterKey);
var selectedTile;
var indices=listviewFavorite.selection.getIndices();
if (clearSelection) {
listviewFavorite.selection.clear()
}
if (indices.length > 0 && indices[0] >= 0) {
var favoriteItem=this.getModuleFromCluster(this._favoriteClusterKey, indices[0]);
if (favoriteItem && favoriteItem.data) {
selectedTile = favoriteItem.data
}
}
if (listviewRecent) {
if (!selectedTile) {
indices = listviewRecent.selection.getIndices();
if (indices.length > 0 && indices[0] >= 0) {
var recentItem=this.getModuleFromCluster(this._recentClusterKey, indices[0]);
if (recentItem && recentItem.data) {
selectedTile = recentItem.data
}
}
}
if (clearSelection) {
listviewRecent.selection.clear()
}
}
return {
data: selectedTile, index: indices[0]
}
}, onSetDefaultClick: function onSetDefaultClick(e) {
msWriteProfilerMark("WeatherApp:PlacesPageEdgy:SetDefault:s");
WeatherAppJS.Utilities.Instrumentation.incrementInt32("MyPlacesBottomEdgySetDefault");
var selectedTile=this.getSelectedTile(true);
var newDefault;
if (selectedTile) {
newDefault = selectedTile.data;
var eventAttr={location: WeatherAppJS.GeocodeCache.getLocation(newDefault.loc.id).getFullDisplayName()};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.ActionContext.bottomEdgy, "Set as Home", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr))
}
var oldDefault=this.getAllModulesOfType(this._homeClusterKey).getItem(0).data;
var that=this;
if (newDefault && oldDefault) {
var locationDetails=WeatherAppJS.GeocodeCache.getLocation(newDefault.loc.id);
that._setDefaultClicked = true;
if (newDefault.placeType === "Favorite") {
WeatherAppJS.SettingsManager.setFavoriteAsDefaultLocationAsync(locationDetails).then(function() {
that._setDefaultClicked = false;
that.swapTileData(newDefault, oldDefault);
msWriteProfilerMark("WeatherApp:PlacesPageEdgy:SetDefault:e")
}, function(e) {
if (e.errorcode === WeatherAppJS.ErrorCodes.SettingsManager.LOCATION_PINNED_TO_START) {
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString("LocationPinnedToStart"), false)
}
msWriteProfilerMark("WeatherApp:PlacesPageEdgy:SetDefault:e")
})
}
else if (newDefault.placeType === "Recent") {
WeatherAppJS.SettingsManager.setRecentAsDefaultLocationAsync(locationDetails).then(function() {
that._setDefaultClicked = false;
that.addModuleAtPenultimatePosition(that._favoriteClusterKey, {
groupKey: that._favoriteClusterKey, groupTitle: title["Favorite"], loc: newDefault.loc, itemKey: newDefault.loc.id, moduleInfo: {
fragmentPath: "/panoramas/myplaces/favoritesTemplate.html", templateId: "eachfavoriteModule", className: "favoriteLocation"
}, placeType: "Favorite"
});
var numIndex=that.getTotalModulesCount(that._favoriteClusterKey) - 2;
newDefault = that.getModuleFromCluster(that._favoriteClusterKey, numIndex).data;
that.swapTileData(newDefault, oldDefault);
msWriteProfilerMark("WeatherApp:PlacesPageEdgy:SetDefault:e")
}, function(e) {
if (e.errorcode === WeatherAppJS.ErrorCodes.SettingsManager.FAVORITES_MAX_LIMIT_REACHED) {
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString("SetDefaultMaxLimitReached"), false)
}
else if (e.errorcode === WeatherAppJS.ErrorCodes.SettingsManager.LOCATION_PINNED_TO_START) {
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString("LocationPinnedToStart"), false)
}
msWriteProfilerMark("WeatherApp:PlacesPageEdgy:SetDefault:e")
})
}
}
this.addRemoveRecentCluster()
}, isSelectedTilePinned: function isSelectedTilePinned() {
var selectedTile=this.getSelectedTile(false);
if (selectedTile && selectedTile.data && selectedTile.data.loc) {
return WeatherAppJS.App.isLocationPinned(selectedTile.data.loc.id)
}
else {
return false
}
}, onPinClick: function onPinClick(e) {
msWriteProfilerMark("WeatherApp:PlacesPageEdgy:Pin");
var selectedTile=this.getSelectedTile(false);
if (e && e.currentTarget && selectedTile && selectedTile.data && selectedTile.data.loc) {
var that=this;
WeatherAppJS.App.pinLocationAsync(e.currentTarget, selectedTile.data.loc.id).then(function() {
that.clearSelection()
}, function(e) {
that.clearSelection();
if (e.errorcode && e.errorcode === WeatherAppJS.ErrorCodes.SettingsManager.PINNED_MAX_LIMIT_REACHED) {
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString("MaxPinnedLocationsLimitReached"), false)
}
})
}
}, onUnpinClick: function onUnpinClick(e) {
msWriteProfilerMark("WeatherApp:PlacesPageEdgy:Unpin");
var selectedTile=this.getSelectedTile(false);
if (e && e.currentTarget && selectedTile && selectedTile.data && selectedTile.data.loc) {
var that=this;
WeatherAppJS.App.unpinLocationAsync(e.currentTarget, selectedTile.data.loc.id).then(function() {
that.clearSelection()
})
}
}, showEdgyButtons: function showEdgyButtons(itemCount) {
if (itemCount === 0) {
this.toggleShowButton(this._addButton, true);
this.toggleShowButton(this._removeButton, false);
this.toggleShowButton(this._setDefaultButton, false);
this.toggleShowButton(this._pinButton, false);
this.toggleShowButton(this._unpinButton, false);
this.toggleShowButton(this._clearButton, false);
this.toggleShowButton(this._changeHomeButton, true)
}
else if (itemCount === 1) {
this.toggleShowButton(this._addButton, true);
this.toggleShowButton(this._clearButton, false);
this.toggleShowButton(this._removeButton, true);
this.toggleShowButton(this._setDefaultButton, true);
this.toggleShowButton(this._changeHomeButton, false);
var isSelectedTilePinned=this.isSelectedTilePinned();
this.toggleShowButton(this._pinButton, !isSelectedTilePinned);
this.toggleShowButton(this._unpinButton, isSelectedTilePinned)
}
else if (itemCount > 1) {
this.toggleShowButton(this._clearButton, true);
this.toggleShowButton(this._removeButton, true);
this.toggleShowButton(this._addButton, true);
this.toggleShowButton(this._setDefaultButton, false);
this.toggleShowButton(this._pinButton, false);
this.toggleShowButton(this._unpinButton, false);
this.toggleShowButton(this._changeHomeButton, false)
}
var useTianQi=Platform.Utilities.Globalization.isFeatureEnabled("UseTianQi");
if (!useTianQi) {
var isCurrentUnitF=(WeatherAppJS.SettingsManager.getDisplayUnit() === "F");
this.toggleShowButton(this._changeUnitToFButton, !isCurrentUnitF);
this.toggleShowButton(this._changeUnitToCButton, isCurrentUnitF)
}
var isCurrentLocationDetection=Platform.Utilities.Globalization.isFeatureEnabled("CurrentLocationDetection");
this.toggleShowButton(this._currentLocationButton, isCurrentLocationDetection ? true : false)
}, swapTileData: function swapTileData(tile1, tile2) {
var temp={
loc: {}, itemKey: ""
};
this.copyTileData(temp, tile1);
this.copyTileData(tile1, tile2);
this.copyTileData(tile2, temp)
}, copyTileData: function copyTileData(tileDest, tileSrc) {
tileDest.loc.id = tileSrc.loc.id;
tileDest.loc.locationDisplayName = tileSrc.loc.locationDisplayName;
tileDest.loc.caption = tileSrc.loc.caption;
tileDest.loc.secondaryCaption = tileSrc.loc.secondaryCaption;
tileDest.loc.snowCC = tileSrc.loc.snowCC;
tileDest.loc.snowUnit = tileSrc.loc.snowUnit;
tileDest.loc.displaySnowData = tileSrc.loc.displaySnowData;
tileDest.loc.currentTemp = tileSrc.loc.currentTemp;
tileDest.loc.displayCurrentTemp = tileSrc.loc.displayCurrentTemp;
tileDest.loc.currentTempBlockOpacity = tileSrc.loc.currentTempBlockOpacity;
tileDest.loc.displayTempData = tileSrc.loc.displayTempData;
tileDest.loc.displayTemp1 = tileSrc.loc.displayTemp1;
tileDest.loc.displayTemp2 = tileSrc.loc.displayTemp2;
tileDest.loc.symbolPosition = tileSrc.loc.symbolPosition;
tileDest.loc.displayTempBoundary = tileSrc.loc.displayTempBoundary;
tileDest.loc.boundaryTempBlockOpacity = tileSrc.loc.boundaryTempBlockOpacity;
tileDest.loc.skycode = tileSrc.loc.skycode;
tileDest.loc.bgClass = tileSrc.loc.bgClass;
tileDest.loc.bg = tileSrc.loc.bg;
tileDest.loc.alertText = tileSrc.loc.alertText;
tileDest.loc.displayAlert = tileSrc.loc.displayAlert;
tileDest.loc.displayAlertBgClassFav = tileSrc.loc.displayAlertBgClassFav;
tileDest.itemKey = tileSrc.itemKey
}, isChangeHomeTile: function isChangeHomeTile(tileItem) {
if (tileItem && tileItem.data && tileItem.data.placeType === "ChangeHomeTile") {
return true
}
else {
return false
}
}, toggleStickyEdgy: function toggleStickyEdgy(edgy, show) {
WeatherAppJS.Utilities.UI.toggleStickyEdgy(edgy, show)
}, toggleShowButton: function toggleShowButton(b, show) {
WeatherAppJS.Utilities.UI.toggleShowButton(b, show)
}, _title: null, _tempCurrentBlockInView: true, _tempBlockToggleTimeout: 0, _timeDelayBetweenTiles: 0, _tempBlockFadeInTime: 0, _tempBlockFadeOutTime: 0, _tempBlockRotationTime: 0, _bypassCache: false, _isEdgyActionHandlersInitialized: false, _isAnimationEnabled: true, getPageData: function getPageData() {
var that=this;
CommonJS.Progress.showProgress(CommonJS.Progress.headerProgressType);
that.populateMyPlacesData(that._bypassCache);
that.addHomeCluster();
that.addFavoritesCluster();
that.addRemoveRecentCluster();
var appConfig=PlatformJS.Services.appConfig;
var category=appConfig.getString('PlacesAdCategory');
var subCategory=appConfig.getString('PlacesAdSubCategory');
var providerId=appConfig.getString('AdProviderId');
PlatformJS.Ads.addOrderedAdsClusterConfig(that._data, {}, category, subCategory, providerId);
that._bypassCache = false;
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
return WinJS.Promise.wrap({
title: that._title, listDataSource: this._data.dataSource, AddButtonTitle: resourceFile.getString("AddButtonTitle"), RemoveButtonTitle: resourceFile.getString("RemoveButtonTitle"), SetDefaultButtonTitle: resourceFile.getString("SetDefaultButtonTitle"), PinButtonTitle: resourceFile.getString("/platform/pinToStart"), UnpinButtonTitle: resourceFile.getString("/platform/unpinFromStart"), ClearButtonTitle: resourceFile.getString("ClearSelectionButtonTitle"), HelpButtonTitle: resourceFile.getString("/platform/HelpLabel"), RefreshButtonTitle: resourceFile.getString("RefreshButtonTitle"), ChangeUnitToFButtonTitle: resourceFile.getString("ChangeUnitToFButtonTitle"), ChangeUnitToCButtonTitle: resourceFile.getString("ChangeUnitToCButtonTitle"), ChangeHomeButtonTitle: resourceFile.getString("ChangeHomeButtonTitle"), CurrentLocationButtonTitle: resourceFile.getString("CurrentLocationButtonTitle")
})
}, onBindingComplete: function onBindingComplete() {
var settingsManager=WeatherAppJS.SettingsManager;
WinJS.Resources.processAll();
settingsManager.addEventListener('recentlocationscleared', this.onClearSearchHistory, false);
settingsManager.addEventListener('recentlocationremoved', this.onRecentLocationRemoved, false);
settingsManager.addEventListener('favoriteadded', this.onFavoriteAdded, false);
settingsManager.addEventListener('defaultlocationupdated', this.onDefaultLocationUpdated, false);
this.cleanPeriodicTimersStack();
this.cleanTimeoutsStack();
var dataRefreshTimerId=setInterval(this.onPageRefresh, PlatformJS.Services.appConfig.getString("PageRefreshTime"));
this._timersStack.push(dataRefreshTimerId);
var tempBlockToggleTimerId=setInterval(this.tempBlockToggle, this._tempBlockToggleTimeout);
this._timersStack.push(tempBlockToggleTimerId);
WeatherAppJS.Networking.networkChangeCallback = this.onInternetChange;
this._panorama = PlatformJS.Utilities.getControl("mainPanorama");
this.initializeEdgyActionHandlers();
if (this._state.disambigLocation) {
var loc=this._state.disambigLocation;
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logSearch(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, loc.getFullDisplayName(), "Bing", Microsoft.Bing.AppEx.Telemetry.SearchMethod.form, false, -1, true, true, false, WeatherAppJS.Instrumentation.FormCodes.Search, loc.latitude + ' - ' + loc.longitude);
this._state.disambigLocation = null
}
if (this._state.action) {
if (this._state.action === 'onChangeHomeClick') {
WeatherAppJS.Utilities.UI.addNewHomeLoc()
}
else if (this._state.action === 'onAddFavoriteClick') {
this.onAddFavoriteClick(null)
}
delete this._state['action']
}
}, initializeEdgyActionHandlers: function initializeEdgyActionHandlers() {
if (this._isEdgyActionHandlersInitialized) {
return
}
this._isEdgyActionHandlersInitialized = true;
var bEdgyElement=document.getElementById("myPlacesEdgy");
if (bEdgyElement) {
this._bEdgy = bEdgyElement.winControl;
this._removeButton = bEdgyElement.querySelector("#removeLocationButton");
this._setDefaultButton = bEdgyElement.querySelector("#setDefaultButton");
this._pinButton = bEdgyElement.querySelector("#pinButton");
this._unpinButton = bEdgyElement.querySelector("#unpinButton");
this._addButton = bEdgyElement.querySelector("#addFavoriteButton");
this._clearButton = bEdgyElement.querySelector("#clearButton");
this._helpButton = bEdgyElement.querySelector("#helpButton");
this._refreshButton = bEdgyElement.querySelector("#refreshButton");
this._changeUnitToFButton = bEdgyElement.querySelector("#changeUnitToFButton");
this._changeUnitToCButton = bEdgyElement.querySelector("#changeUnitToCButton");
this._changeHomeButton = bEdgyElement.querySelector("#changeHomeButton");
this._currentLocationButton = bEdgyElement.querySelector("#currentLocationButton")
}
this._editButton = document.getElementById("_EditButtonContainer");
if (this._editButton) {
this._editButton.addEventListener('click', function(event) {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel, WeatherAppJS.Instrumentation.PageContext.Favorites, "Edit", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0)
})
}
var that=this;
if (this._bEdgy) {
this._bEdgy.addEventListener("beforeshow", function(e) {
that.onBeforeShowBottomEdgy(e)
});
this._bEdgy.addEventListener("beforehide", function(e) {
that.onBeforeHideBottomEdgy(e)
});
this._addButton.addEventListener("click", function(e) {
that.onAddFavoriteClick(Microsoft.Bing.AppEx.Telemetry.ActionContext.bottomEdgy)
});
this._clearButton.addEventListener("click", function(e) {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.ActionContext.bottomEdgy, "Clear Selection", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0);
this._clearedSelection = true;
that.clearSelection()
});
this._removeButton.addEventListener("click", function(e) {
that.onRemoveClick(e)
});
this._setDefaultButton.addEventListener("click", function(e) {
that.onSetDefaultClick(e)
});
this._pinButton.addEventListener("click", function(e) {
that.onPinClick(e)
});
this._unpinButton.addEventListener("click", function(e) {
that.onUnpinClick(e)
});
this._refreshButton.addEventListener("click", function(e) {
WeatherAppJS.SettingsManager.readPDPDataAsync(true).then(function() {
that.onRefreshClick(e)
}, function() {
that.onRefreshClick(e)
})
});
this._helpButton.addEventListener("click", function(e) {
WeatherAppJS.Utilities.UI.openInAppHelp()
});
this._changeUnitToFButton.addEventListener("click", function(e) {
that.onChangeUnitToFClick(e)
});
this._changeUnitToCButton.addEventListener("click", function(e) {
that.onChangeUnitToCClick(e)
});
this._changeHomeButton.addEventListener("click", function(e) {
that.onChangeHomeClick(e)
});
this._currentLocationButton.addEventListener("click", function(e) {
that.onCurrentLocationClick(e)
})
}
}, onAddFavoriteClick: function onAddFavoriteClick(context) {
msWriteProfilerMark("WeatherApp:PlacesPageEdgy:AddFavorite");
WeatherAppJS.Utilities.Instrumentation.incrementInt32("AddLocationTileClicked");
if (context) {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, context, "Add Location", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0)
}
CommonJS.dismissAllEdgies();
if (WeatherAppJS.SettingsManager.isFavoritesMaxLimitReached()) {
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString("MaxFavoritesLimitReached"), false)
}
else if (WeatherAppJS.Networking.internetAvailable === false) {
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString("NoInternetConnectionError"), false)
}
else {
this.showAddLocationFlyout()
}
}
})})
})()