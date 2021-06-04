/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
var notifications=Windows.UI.Notifications;
WinJS.Namespace.define("WeatherAppJS.App", {
_isInitialized: false, _isPullNotificationEnabled: false, _maxTileIDLength: 64, isBadgeApplicableForLocation: function isBadgeApplicableForLocation(locationObj) {
return WeatherAppJS.GeocodeCache.isAlertsSupportedLocation(locationObj.getId())
}, getTileIDForLocID: function getTileIDForLocID(locID) {
var tileID;
tileID = locID.replace(/\,/g, "-");
tileID = tileID.replace(/ /g, "-");
tileID = tileID.replace(/\//g, "-");
return tileID.substring(0, this._maxTileIDLength)
}, getGeoLocFromTileArguments: function getGeoLocFromTileArguments(args) {
var geocodeCache=WeatherAppJS.GeocodeCache;
var geoLoc;
try {
var loc=JSON.parse(args);
geoLoc = WeatherAppJS.GeocodeLocation.createGeocodeLocation(loc);
if (loc.tileMarket) {
geoLoc.tileMarket = loc.tileMarket
}
}
catch(err) {
geoLoc = geocodeCache.getLocation(args);
if (!geoLoc) {
geoLoc = WeatherAppJS.GeocodeLocation.createGeocodeLocation({
fullName: args, fetchByLatLong: false
})
}
}
if (geoLoc && geoLoc.getId()) {
if (!geocodeCache.getLocation(geoLoc.getId())) {
geocodeCache.addLocation(geoLoc)
}
}
return geoLoc
}, getShortNameForLocation: function getShortNameForLocation(locationObj) {
return (locationObj.city && locationObj.city !== "") ? locationObj.city : locationObj.fullName
}, getDisplayNameForLocation: function getDisplayNameForLocation(locationObj) {
return locationObj.getFullDisplayName()
}, isLocationPinned: function isLocationPinned(locID) {
var isPinned;
var tileID=this.getTileIDForLocID(locID);
try {
isPinned = Windows.UI.StartScreen.SecondaryTile.exists(tileID)
}
catch(e) {
isPinned = false
}
return isPinned
}, pinLocationAsync: function pinLocationAsync(element, locID) {
var that=this;
return new WinJS.Promise(function(c, e) {
Windows.UI.StartScreen.SecondaryTile.findAllAsync().then(function(tiles) {
if (tiles) {
var MAX_PINNED_LOCATIONS=PlatformJS.Services.appConfig.getInt32("MaxRecentLocationsLimit");
if (tiles.size < MAX_PINNED_LOCATIONS) {
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NumLocationsPinned");
var eventAttr={location: WeatherAppJS.GeocodeCache.getLocation(locID).getFullDisplayName()};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.ActionContext.bottomEdgy, "Pin to Mogo", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr));
var tileID=that.getTileIDForLocID(locID);
var locationObj=WeatherAppJS.GeocodeCache.getLocation(locID);
locationObj.tileMarket = Platform.Globalization.Marketization.getMarketLocation();
var activeContext=[];
activeContext.push({activationContext: "pinnedTile"});
locationObj.context = activeContext;
var geocodeInfo=JSON.stringify(locationObj);
var square70x70LogoUri=new Windows.Foundation.Uri("ms-appx:///images/tinylogo.png");
var square150x150LogoUri=new Windows.Foundation.Uri("ms-appx:///images/logo.png");
var wide310x150LogoUri=new Windows.Foundation.Uri("ms-appx:///images/widelogo.png");
var square30x30LogoUri=new Windows.Foundation.Uri("ms-appx:///images/smalllogo.png");
var large310x310LogoUri=new Windows.Foundation.Uri("ms-appx:///images/largelogo.png");
var tile=new Windows.UI.StartScreen.SecondaryTile(tileID, that.getShortNameForLocation(locationObj), geocodeInfo, wide310x150LogoUri, Windows.UI.StartScreen.TileSize.wide310x150);
tile.visualElements.square30x30Logo = square30x30LogoUri;
tile.visualElements.square70x70Logo = square70x70LogoUri;
tile.visualElements.square150x150Logo = square150x150LogoUri;
tile.visualElements.wide310x150Logo = wide310x150LogoUri;
tile.visualElements.square310x310Logo = large310x310LogoUri;
tile.visualElements.showNameOnWide310x150Logo = true;
tile.visualElements.showNameOnSquare150x150Logo = true;
tile.visualElements.showNameOnSquare310x310Logo = true;
var selectionRect=element.getBoundingClientRect();
tile.requestCreateForSelectionAsync({
x: selectionRect.left, y: selectionRect.top, width: selectionRect.width, height: selectionRect.height
}).then(function(isCreated) {
if (isCreated) {
that.startPeriodicUpdateForSecondaryTile(locationObj, tileID)
}
c()
}, function(err) {
e(err)
})
}
else {
e({
errorcode: WeatherAppJS.ErrorCodes.SettingsManager.PINNED_MAX_LIMIT_REACHED, errormessage: 'Max ' + MAX_PINNED_LOCATIONS + ' pinned locations limit reached.'
})
}
}
}, function(err) {
e(err)
})
})
}, unpinLocationAsync: function unpinLocationAsync(element, locID) {
var that=this;
return new WinJS.Promise(function(c, e) {
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NumLocationsUnpinned");
var eventAttr={location: WeatherAppJS.GeocodeCache.getLocation(locID).getFullDisplayName()};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.ActionContext.bottomEdgy, "Unpin from Mogo", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr));
var tileID=that.getTileIDForLocID(locID);
var tile=Windows.UI.StartScreen.SecondaryTile(tileID);
var selectionRect=element.getBoundingClientRect();
tile.requestDeleteForSelectionAsync({
x: selectionRect.left, y: selectionRect.top, width: selectionRect.width, height: selectionRect.height
}).then(function(isDeleted) {
c()
}, function(err) {
e(err)
})
})
}, getNotificationServerUriForLocation: function getNotificationServerUriForLocation(appserverhost, appId, locationObj, mkt, region, pullNotification, scenario, isTianQiLocation) {
var serverUri;
var locationName;
var configName;
var middletierhost=WeatherAppJS.WarmBoot.Cache.getString("MiddleTierHostTileAppex");
var trimLatLong=WeatherAppJS.Utilities.Common.trimLatLong;
if (isTianQiLocation) {
middletierhost = WeatherAppJS.WarmBoot.Cache.getString("MiddleTierHostTileForTianqi");
configName = "ServerUriForTianQi" + scenario;
serverUri = WeatherAppJS.WarmBoot.Cache.getStringFromDictionary(configName, pullNotification);
locationName = WeatherAppJS.Utilities.TianQi.getEncodedLocationName(locationObj.city);
serverUri = serverUri.replace("\{city\}", locationName)
}
else {
if (locationObj.isSkiLocation) {
configName = "ServerUriForSki" + scenario;
serverUri = WeatherAppJS.WarmBoot.Cache.getStringFromDictionary(configName, pullNotification);
serverUri = serverUri.replace("\{id\}", locationObj.id)
}
else if (locationObj.fetchByLatLong) {
configName = "ServerUriFor" + scenario + "ByLatLongAppex";
var locId=locationObj.getId();
if (!WeatherAppJS.Utilities.Common.shouldUseAppexDataSource(locId)) {
configName = "ServerUriFor" + scenario + "ByLatLong";
middletierhost = WeatherAppJS.WarmBoot.Cache.getString("MiddleTierHostTile")
}
serverUri = WeatherAppJS.WarmBoot.Cache.getStringFromDictionary(configName, pullNotification);
locationName = this.getShortNameForLocation(locationObj)
}
else {
configName = "ServerUriFor" + scenario + "ByLocationName";
serverUri = pullNotification.getString(configName);
locationName = locationObj.fullName
}
serverUri = serverUri.replace("\{unit\}", WeatherAppJS.SettingsManager.getDisplayUnit());
serverUri = serverUri.replace("\{mkt\}", mkt);
serverUri = serverUri.replace("\{region\}", region);
serverUri = serverUri.replace("\{lang\}", Platform.Globalization.Marketization.getQualifiedLanguageString())
}
serverUri = serverUri.replace("\{appserverhost\}", appserverhost);
serverUri = serverUri.replace("\{middletierhosttile\}", middletierhost);
serverUri = serverUri.replace("\{latitude\}", trimLatLong(locationObj.latitude));
serverUri = serverUri.replace("\{longitude\}", trimLatLong(locationObj.longitude));
serverUri = serverUri.replace("\{appid\}", appId);
if (!isTianQiLocation) {
serverUri = encodeURI(serverUri);
locationName = encodeURIComponent(locationName);
serverUri = serverUri.replace("%7BlocationName%7D", locationName)
}
return serverUri
}, getNotificationServerUriForSecondPage: function getNotificationServerUriForSecondPage(appserverhost, appId, locationObj, mkt, region, pullNotification, isAlertReqd, favorites) {
var that=this;
var serverUri=WeatherAppJS.WarmBoot.Cache.getStringFromDictionary("ServerUriForTileSecondPage", pullNotification);
var middletierhost=WeatherAppJS.WarmBoot.Cache.getString("MiddleTierHostTile");
var trimLatLong=WeatherAppJS.Utilities.Common.trimLatLong;
var useTianQi=WeatherAppJS.WarmBoot.Cache.isFeatureEnabled("UseTianQi");
function getName(loc, isTianQiLocation, isSkiLocation) {
if (isTianQiLocation) {
return WeatherAppJS.Utilities.TianQi.getEncodedLocationName(loc.city)
}
else if (isSkiLocation) {
return encodeURI(that.getShortNameForLocation(loc))
}
else if (loc.fetchByLatLong) {
return encodeURI(that.getShortNameForLocation(loc))
}
else {
return encodeURI(loc.fullName)
}
}
function getLat(loc, isTianQiLocation, isSkiLocation) {
if (isSkiLocation) {
return ""
}
else {
return trimLatLong(loc.latitude)
}
}
function getLong(loc, isTianQiLocation, isSkiLocation) {
if (isSkiLocation) {
return ""
}
else {
return trimLatLong(loc.longitude)
}
}
function getId(loc, isTianQiLocation, isSkiLocation) {
if (isSkiLocation) {
return loc.id
}
else {
return ""
}
}
function getLocType(loc, isTianQiLocation, isSkiLocation) {
if (isTianQiLocation) {
return "C"
}
else if (isSkiLocation) {
return "S"
}
else {
return ""
}
}
var isTianQiLocationObj=useTianQi && WeatherAppJS.GeocodeCache.isTianQiSupportedLocation(locationObj.getId());
var isSkiLocationObj=locationObj.isSkiLocation;
serverUri = serverUri.replace("\{middletierhosttile\}", middletierhost);
serverUri = serverUri.replace("\{city\}", getName(locationObj, isTianQiLocationObj, isSkiLocationObj));
serverUri = serverUri.replace("\{latitude\}", trimLatLong(locationObj.latitude));
serverUri = serverUri.replace("\{longitude\}", trimLatLong(locationObj.longitude));
serverUri = serverUri.replace("\{id\}", getId(locationObj, isTianQiLocationObj, isSkiLocationObj));
serverUri = serverUri.replace("\{locType\}", getLocType(locationObj, isTianQiLocationObj, isSkiLocationObj));
serverUri = serverUri.replace("\{unit\}", WeatherAppJS.SettingsManager.getDisplayUnit());
serverUri = serverUri.replace("\{mkt\}", mkt);
serverUri = serverUri.replace("\{region\}", region);
serverUri = serverUri.replace("\{lang\}", Platform.Globalization.Marketization.getQualifiedLanguageString());
serverUri = serverUri.replace("\{appid\}", appId);
serverUri = serverUri.replace("\{isAlertReqd\}", isAlertReqd ? "true" : "false");
function populateFavAttributes(index, favName, lat, long, id, locType) {
serverUri = serverUri.replace("\{fav" + index + "Name\}", favName ? favName : "");
serverUri = serverUri.replace("\{fav" + index + "Lat\}", lat ? lat : "");
serverUri = serverUri.replace("\{fav" + index + "Long\}", long ? long : "");
serverUri = serverUri.replace("\{fav" + index + "Id\}", id ? id : "");
serverUri = serverUri.replace("\{fav" + index + "LocType\}", locType ? locType : "")
}
function populateFavData(index, favorite) {
if (favorite) {
var isTianQiFavorite=useTianQi && WeatherAppJS.GeocodeCache.isTianQiSupportedLocation(favorite.getId());
var isSkiFavorite=favorite.isSkiLocation;
populateFavAttributes(index, getName(favorite, isTianQiFavorite, isSkiFavorite), getLat(favorite, isTianQiFavorite, isSkiFavorite), getLong(favorite, isTianQiFavorite, isSkiFavorite), getId(favorite, isTianQiFavorite, isSkiFavorite), getLocType(favorite, isTianQiFavorite, isSkiFavorite))
}
else {
populateFavAttributes(index, "", "", "", "", "")
}
}
var fav1=null,
fav2=null,
fav3=null;
if (favorites && favorites.length >= 2) {
fav1 = (favorites.length === 2) ? locationObj : favorites[0];
fav2 = (favorites.length === 2) ? favorites[0] : favorites[1];
fav3 = (favorites.length === 2) ? favorites[1] : favorites[2]
}
populateFavData(1, fav1);
populateFavData(2, fav2);
populateFavData(3, fav3);
return serverUri
}, getRecurrence: function getRecurrence(pullNotification, scenario, isTianQiLocation) {
var configName;
if (isTianQiLocation) {
configName = "UpdateRecurrenceForTianQi" + scenario
}
else {
configName = "UpdateRecurrenceFor" + scenario
}
var updateRecurrence=WeatherAppJS.WarmBoot.Cache.getStringFromDictionary(configName, pullNotification);
var recurrence=notifications.PeriodicUpdateRecurrence[updateRecurrence];
return recurrence
}, startPeriodicUpdateForAppTile: function startPeriodicUpdateForAppTile() {
var that=this;
if (this._isPullNotificationEnabled) {
WeatherAppJS.SettingsManager.getFavoritesAsync().then(function(favorites) {
try {
var defaultLocation=WeatherAppJS.SettingsManager.getDefaultLocation();
if (defaultLocation) {
var appserverhost=WeatherAppJS.WarmBoot.Cache.getString("AppServerHost");
var appId=WeatherAppJS.WarmBoot.Cache.getString("AppID");
var mkt=WeatherAppJS.WarmBoot.Cache.getString("AppServerMarket");
var region=WeatherAppJS.WarmBoot.Cache.getString("AppServerRegion");
var pullNotification=WeatherAppJS.WarmBoot.Cache.getDictionary("PullNotification");
var isAlertReqd=that.isBadgeApplicableForLocation(defaultLocation);
var enableCycling=isAlertReqd || (favorites && favorites.length >= 2);
var isTianQiLocation=WeatherAppJS.WarmBoot.Cache.isFeatureEnabled("UseTianQi") && WeatherAppJS.GeocodeCache.isTianQiSupportedLocation(defaultLocation.getId());
var serverUriForTile=that.getNotificationServerUriForLocation(appserverhost, appId, defaultLocation, mkt, region, pullNotification, "Tile", isTianQiLocation);
var recurrenceForTile=that.getRecurrence(pullNotification, "Tile", isTianQiLocation);
var firstPageUri=new Windows.Foundation.Uri(serverUriForTile);
if (!enableCycling) {
notifications.TileUpdateManager.createTileUpdaterForApplication().enableNotificationQueue(false);
notifications.TileUpdateManager.createTileUpdaterForApplication().startPeriodicUpdate(firstPageUri, recurrenceForTile)
}
else {
var serverUriForSecondPage=that.getNotificationServerUriForSecondPage(appserverhost, appId, defaultLocation, mkt, region, pullNotification, isAlertReqd, favorites);
var secondPageUri=new Windows.Foundation.Uri(serverUriForSecondPage);
var urisToPoll=[];
urisToPoll.push(secondPageUri);
urisToPoll.push(firstPageUri);
notifications.TileUpdateManager.createTileUpdaterForApplication().startPeriodicUpdateBatch(urisToPoll, recurrenceForTile);
notifications.TileUpdateManager.createTileUpdaterForApplication().enableNotificationQueueForSquare310x310(true)
}
if (isAlertReqd) {
var serverUriForBadge=that.getNotificationServerUriForLocation(appserverhost, appId, defaultLocation, mkt, region, pullNotification, "Badge", isTianQiLocation);
var recurrenceForBadge=that.getRecurrence(pullNotification, "Badge", isTianQiLocation);
notifications.BadgeUpdateManager.createBadgeUpdaterForApplication().startPeriodicUpdate(new Windows.Foundation.Uri(serverUriForBadge), recurrenceForBadge)
}
else {
that.clearBadgeUpdates()
}
}
}
catch(ex) {}
})
}
}, startPeriodicUpdateForSecondaryTile: function startPeriodicUpdateForSecondaryTile(locationObj, tileID) {
if (this._isPullNotificationEnabled) {
try {
if (locationObj) {
var appConfig=PlatformJS.Services.appConfig;
var appserverhost=appConfig.getString("AppServerHost");
var appId=appConfig.getString("AppID");
var mkt=appConfig.getString("AppServerMarket");
var region=appConfig.getString("AppServerRegion");
var pullNotification=appConfig.getDictionary("PullNotification");
var isAlertReqd=this.isBadgeApplicableForLocation(locationObj);
var isTianQiLocation=Platform.Utilities.Globalization.isFeatureEnabled("UseTianQi") && locationObj.isTianQiSupportedLocation();
var serverUriForTile=this.getNotificationServerUriForLocation(appserverhost, appId, locationObj, mkt, region, pullNotification, "PinnedTile", isTianQiLocation);
var recurrenceForTile=this.getRecurrence(pullNotification, "Tile", isTianQiLocation);
notifications.TileUpdateManager.createTileUpdaterForSecondaryTile(tileID).startPeriodicUpdate(new Windows.Foundation.Uri(serverUriForTile), recurrenceForTile);
if (isAlertReqd) {
var serverUriForBadge=this.getNotificationServerUriForLocation(appserverhost, appId, locationObj, mkt, region, pullNotification, "Badge", isTianQiLocation);
var recurrenceForBadge=this.getRecurrence(pullNotification, "Badge", isTianQiLocation);
notifications.BadgeUpdateManager.createBadgeUpdaterForSecondaryTile(tileID).startPeriodicUpdate(new Windows.Foundation.Uri(serverUriForBadge), recurrenceForBadge)
}
else {
this.clearBadgeUpdates(tileID)
}
}
}
catch(ex) {}
}
}, updateAppTile: function updateAppTile() {
if (!WeatherAppJS.SettingsManager.doingBulkUpdates()) {
WeatherAppJS.App.clearTileUpdates();
this.startPeriodicUpdateForAppTile()
}
}, updateAllTiles: function updateAllTiles() {
try {
this.updateAppTile();
var that=this;
Windows.UI.StartScreen.SecondaryTile.findAllAsync().then(function(tiles) {
if (tiles) {
tiles.forEach(function(tile) {
if (that.isTileSupportedInCurrentMarket(tile.arguments)) {
var geoLoc=that.getGeoLocFromTileArguments(tile.arguments);
that.startPeriodicUpdateForSecondaryTile(geoLoc, tile.tileId)
}
else {
that.clearTileUpdates(tile.tileId);
that.clearBadgeUpdates(tile.tileId)
}
})
}
})
}
catch(ex) {}
}, clearAllTiles: function clearAllTiles() {
try {
this.clearTileUpdates();
this.clearBadgeUpdates();
var that=this;
Windows.UI.StartScreen.SecondaryTile.findAllAsync().then(function(tiles) {
if (tiles) {
tiles.forEach(function(tile) {
that.clearTileUpdates(tile.tileId);
that.clearBadgeUpdates(tile.tileId)
})
}
})
}
catch(ex) {}
}, clearTileUpdates: function clearTileUpdates(tileID) {
try {
var tileUpdater=null;
if (tileID) {
tileUpdater = notifications.TileUpdateManager.createTileUpdaterForSecondaryTile(tileID)
}
else {
tileUpdater = notifications.TileUpdateManager.createTileUpdaterForApplication()
}
if (tileUpdater) {
tileUpdater.clear();
tileUpdater.stopPeriodicUpdate()
}
}
catch(ex) {}
}, clearBadgeUpdates: function clearBadgeUpdates(tileID) {
try {
var badgeUpdater=null;
if (tileID) {
badgeUpdater = notifications.BadgeUpdateManager.createBadgeUpdaterForSecondaryTile(tileID)
}
else {
badgeUpdater = notifications.BadgeUpdateManager.createBadgeUpdaterForApplication()
}
if (badgeUpdater) {
badgeUpdater.clear();
badgeUpdater.stopPeriodicUpdate()
}
}
catch(ex) {}
}, isTileSupportedInCurrentMarket: function isTileSupportedInCurrentMarket(tileArguments) {
var geoLoc=this.getGeoLocFromTileArguments(tileArguments);
var marketLocation=Platform.Globalization.Marketization.getMarketLocation();
var useTianQi=Platform.Utilities.Globalization.isFeatureEnabled("UseTianQi");
if (geoLoc) {
if (geoLoc.tileMarket !== marketLocation) {
if (useTianQi && geoLoc.isTianQiSupportedLocation() === true) {
return false
}
if (!useTianQi && geoLoc.isTianQiSupportedLocation() === true && geoLoc.tileMarket === "CN") {
return false
}
}
return true
}
}, onDefaultLocationUpdate: function onDefaultLocationUpdate() {
WeatherAppJS.App.updateAppTile()
}, onSettingsChange: function onSettingsChange(e) {
if (e.detail.setting === "unitChange") {
WeatherAppJS.App.updateAllTiles()
}
}, onFavoriteUpdated: function onFavoriteUpdated(e) {
WeatherAppJS.App.updateAppTile()
}, reinitialize: function reinitialize() {
this._isInitialized = false;
this.initAppTileManager()
}, initAppTileManager: function initAppTileManager() {
if (!this._isInitialized) {
var settingsManager=WeatherAppJS.SettingsManager;
settingsManager.addEventListener('defaultlocationupdated', this.onDefaultLocationUpdate, false);
settingsManager.addEventListener('settingchanged', this.onSettingsChange, false);
settingsManager.addEventListener('favoriteadded', this.onFavoriteUpdated, false);
settingsManager.addEventListener('favoriteremoved', this.onFavoriteUpdated, false);
settingsManager.addEventListener('favoritesreordered', this.onFavoriteUpdated, false);
settingsManager.addEventListener('bulkupdatescompleted', this.onFavoriteUpdated, false);
var pullNotification=WeatherAppJS.WarmBoot.Cache.getDictionary("PullNotification");
this._isPullNotificationEnabled = WeatherAppJS.WarmBoot.Cache.getBoolFromDictionary("Enabled", pullNotification);
if (!this._isPullNotificationEnabled) {
this.clearAllTiles()
}
if (settingsManager.isFRE() === false) {
this.updateAllTiles();
var that=this;
if (PlatformJS.isPlatformInitialized) {
var appConfig=PlatformJS.Services.appConfig;
var qsForPing=new PlatformJS.DataService.QueryService("AppServerPing");
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("appserverhost", appConfig.getString("AppServerHost"));
urlParams.insert("mkt", appConfig.getString("AppServerMarket"));
urlParams.insert("region", appConfig.getString("AppServerRegion"));
var options=new Platform.DataServices.QueryServiceOptions;
options.useCompatDataModel = true;
options.bypassCache = true;
options.enableAutoRefresh = false;
qsForPing.downloadDataAsync(urlParams, null, null, options).then(function(response) {
WeatherAppJS.LocationsManager.isMarketBlockedByIP = false
}, function(e) {
if (PlatformJS.Utilities.isPromiseCanceled(e)) {
return
}
if (WeatherAppJS.Error.isMarketBlockedError(e)) {
WeatherAppJS.LocationsManager.isMarketBlockedByIP = true;
that.clearAllTiles()
}
})
}
else {
WeatherAppJS.LocationsManager.isMarketBlockedByIP = false
}
}
this._isInitialized = true
}
}
})
})()