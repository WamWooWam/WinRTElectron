/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
WinJS.Namespace.define("WeatherAppJS.Maps.Utilities", {
createMapLocation: function createMapLocation(loc) {
if (loc && loc.hasOwnProperty("lat") && loc.hasOwnProperty("long")) {
return this.createMapLocationFromLatLong(loc.lat, loc.long)
}
}, createMapLocationFromLatLong: function createMapLocationFromLatLong(latitude, longitude) {
if (this.isNumeric(latitude) && this.isNumeric(longitude)) {
return new MicrosoftJS.Maps.Location(latitude, longitude)
}
}, createMapLocationRect: function createMapLocationRect(locationNW, locationSE) {
if (locationNW && locationSE) {
return MicrosoftJS.Maps.LocationRect.fromCorners(locationNW, locationSE)
}
}, createMapLocationRectFromEdges: function createMapLocationRectFromEdges(edges) {
if (edges) {
return MicrosoftJS.Maps.LocationRect.fromEdges(parseFloat(edges.North), parseFloat(edges.West), parseFloat(edges.South), parseFloat(edges.East))
}
}, createBoundingLocationRect: function createBoundingLocationRect(rect1, rect2) {
if (rect1 && rect2) {
var nw1=rect1.getNorthwest();
var nw2=rect2.getNorthwest();
var north=Math.max(nw1.latitude, nw2.latitude);
var west=Math.min(nw1.longitude, nw2.longitude);
var se1=rect1.getSoutheast();
var se2=rect2.getSoutheast();
var south=Math.min(se1.latitude, se2.latitude);
var east=Math.max(se1.longitude, se2.longitude);
return MicrosoftJS.Maps.LocationRect.fromEdges(north, west, south, east)
}
}, isNumeric: function isNumeric(n) {
return !isNaN(parseFloat(n)) && isFinite(n)
}, EarthCircumferenceInMeters: 6378137 * 2 * Math.PI, MercatorLatitudeLimit: 85.051128, MaxBoundingRectToZoomLevel: parseInt(WeatherAppJS.WarmBoot.Cache.getString("BaseMapMaxMercatorZoom")), calculateZoomLevelFromBoundingBox: function calculateZoomLevelFromBoundingBox(boundingBox, mapWidth, mapHeight) {
if (boundingBox && mapWidth && mapHeight) {
var topLeft=this._locationToLogicalPoint(boundingBox.getNorthwest());
var bottomRight=this._locationToLogicalPoint(boundingBox.getSoutheast());
var horizontalScale=this.EarthCircumferenceInMeters * (bottomRight.x - topLeft.x) / mapWidth;
var verticalScale=this.EarthCircumferenceInMeters * (bottomRight.y - topLeft.y) / mapHeight;
var scale=Math.max(horizontalScale, verticalScale);
if (scale === 0) {
return this.MaxBoundingRectToZoomLevel
}
else {
var currentZoom=Math.log(this.EarthCircumferenceInMeters / (scale * 512)) / Math.LN2 + 1;
currentZoom = Math.floor(Math.min(this.MaxBoundingRectToZoomLevel, Math.max(currentZoom, 1)));
return currentZoom
}
}
return this.MaxBoundingRectToZoomLevel
}, _locationToLogicalPoint: function _locationToLogicalPoint(loc) {
var unitLat;
var latitude=loc.latitude;
var longitude=loc.longitude;
if (latitude > this.MercatorLatitudeLimit) {
unitLat = 0
}
else if (latitude < -this.MercatorLatitudeLimit) {
unitLat = 1
}
else {
var sinLatitude=Math.sin(latitude * Math.PI / 180);
unitLat = 0.5 - (Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4.0 * Math.PI))
}
return new MicrosoftJS.Maps.Point((longitude + 180) / 360, unitLat)
}, _isoCodeToRegionMap: null, getMapRegionForIsoCode: function getMapRegionForIsoCode(isocode) {
var ui=WeatherAppJS.Utilities.UI;
if (ui._isoCodeToRegionMap && ui._isoCodeToRegionMap[isocode]) {
return WeatherAppJS.Maps.MapRegions[ui._isoCodeToRegionMap[isocode]]
}
return null
}, getMapRegionForLatLong: function getMapRegionForLatLong(latitude, longitude) {
var regions=WeatherAppJS.Maps.MapRegions;
var world=WeatherAppJS.Maps.MapRegions.World;
var matchedRegions=[];
for (var region in regions) {
var regionIndex=regions[region];
if (regionIndex !== world) {
var rData=WeatherAppJS.Maps.BaseMapController.getRegionData(regionIndex);
var panRegionBounds=MapUtils.createMapLocationRect(MapUtils.createMapLocation(rData.pan.bounds.topLeft), MapUtils.createMapLocation(rData.pan.bounds.bottomRight));
if (panRegionBounds.contains({
latitude: latitude, longitude: longitude
})) {
matchedRegions.push(region)
}
}
}
return matchedRegions
}, copyObjectProperties: function copyObjectProperties(fromObject, toObject, properties) {
if (fromObject && toObject && properties && properties.length) {
for (var p in properties) {
var prop=properties[p];
if (fromObject.hasOwnProperty(prop)) {
toObject[prop] = fromObject[prop]
}
}
}
}, removeObjectProperties: function removeObjectProperties(obj, properties) {
if (obj && properties && properties.length) {
for (var p in properties) {
var prop=properties[p];
delete obj[prop]
}
}
}, isValidRegion: function isValidRegion(region) {
return ((WeatherAppJS.Maps.MapRegions[region] !== undefined) && WeatherAppJS.Maps.MapRegions[region] !== null)
}, showMessage: function showMessage(msgKey) {
if (CommonJS.messageBar) {
CommonJS.messageBar.hide()
}
if (msgKey) {
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString(msgKey), false)
}
CommonJS.dismissAllEdgies()
}, landscape: "landscape", portrait: "portrait", currentOrientation: {get: function get() {
var viewManagement=Windows.UI.ViewManagement;
return (viewManagement.ApplicationView.value === viewManagement.ApplicationViewState.fullScreenPortrait) ? this.portrait : this.landscape
}}, formatSnapTime: function formatSnapTime(ts) {
var jsDateInUTC=WeatherAppJS.Maps.Utilities._getJSDateFromSnapTime(ts);
var localDate=WeatherAppJS.Utilities.Formatting.convertUTCToLocalDate(jsDateInUTC);
var dateTimeFormatter=Windows.Globalization.DateTimeFormatting.DateTimeFormatter;
return dateTimeFormatter.shortTime.format(localDate)
}, _getJSDateFromSnapTime: function _getJSDateFromSnapTime(ts) {
var year,
month,
day,
hours,
mins,
secs,
millisecs=0;
month = parseInt(ts.substring(0, 2)) - 1;
day = ts.substring(2, 4);
year = parseInt(ts.substring(4, 6)) + 2000;
hours = ts.substring(6, 8);
mins = ts.substring(8, 10);
secs = ts.substring(10);
return new Date(year, month, day, hours, mins, secs, millisecs)
}
});
WinJS.Namespace.define("WeatherAppJS.Maps.Configs", {
getBaseMapDefaultOptions: function getBaseMapDefaultOptions() {
var baseMapOptionsString=PlatformJS.Services.appConfig.getString("BaseMapDefaultMapOptions");
var baseMapOptions=JSON.parse(baseMapOptionsString);
if (!baseMapOptions.credentials) {
baseMapOptions.credentials = PlatformJS.Services.appConfig.getString("BingMapsKey")
}
return baseMapOptions
}, setBaseMapGlobalOptions: function setBaseMapGlobalOptions() {
var baseMapGlobalOptionsConfig=PlatformJS.Services.appConfig.getDictionary("BaseMapGlobalOptions");
var baseMapGlobalConfigForEnv=baseMapGlobalOptionsConfig[WeatherAppJS.SettingsManager.getMapsEnvironment()];
for (var globalOption in baseMapGlobalConfigForEnv) {
if (baseMapGlobalConfigForEnv.hasKey(globalOption)) {
var value=baseMapGlobalConfigForEnv[globalOption].value;
if (globalOption.endsWith("UriFormat")) {
value = value.replace("\{market\}", Platform.Globalization.Marketization.getCurrentMarket());
value = value.replace("\{userRegion\}", Platform.Globalization.Marketization.getMarketLocation())
}
MicrosoftJS.Maps.Globals[globalOption] = value
}
}
}, getBaseMapGlobalOption: function getBaseMapGlobalOption(globalOption) {
return MicrosoftJS.Maps.Globals[globalOption]
}, _defaultMapTypeDictByIsoCode: null, getDefaultMapTypeForIsoCode: function getDefaultMapTypeForIsoCode(isoCode) {
if (!this._defaultMapTypeDictByIsoCode) {
this._defaultMapTypeDictByIsoCode = JSON.parse(WeatherAppJS.WarmBoot.Cache.getString("WeatherMapDefaultMapTypeByIsoCode"))
}
if (isoCode) {
var mapType=this._defaultMapTypeDictByIsoCode[isoCode.toUpperCase()];
if (mapType) {
return mapType
}
}
return WeatherAppJS.WarmBoot.Cache.getString("WeatherMapDefaultMapType")
}, _mapScenarioDefaultConfig: null, _mapScenarioMapTypeConfig: null, _mapScenarioMapTypeSubTypeConfig: null, initMapScenarioConfig: function initMapScenarioConfig(mapType, mapSubType) {
this._mapScenarioDefaultConfig = WeatherAppJS.WarmBoot.Cache.getDictionary("MapScenarioDefaultConfig");
this._mapScenarioMapTypeConfig = null;
this._mapScenarioMapTypeSubTypeConfig = null;
if (mapType) {
var allMapTypeConfig=PlatformJS.Services.appConfig.getDictionary("MapScenarioMapTypeConfig");
if (allMapTypeConfig && allMapTypeConfig.hasKey(mapType)) {
this._mapScenarioMapTypeConfig = allMapTypeConfig.getDictionary(mapType)
}
if (mapSubType) {
var allMapTypeSubTypeConfig=PlatformJS.Services.appConfig.getDictionary("MapScenarioMapTypeSubTypeConfig");
if (allMapTypeSubTypeConfig) {
this._mapScenarioMapTypeSubTypeConfig = allMapTypeSubTypeConfig.getDictionary(mapType + "-" + mapSubType)
}
}
}
}, getMapScenarioConfigItem: function getMapScenarioConfigItem(key) {
if (!this._mapScenarioDefaultConfig) {
this.initMapScenarioConfig(null, null)
}
if (this._mapScenarioMapTypeSubTypeConfig && this._mapScenarioMapTypeSubTypeConfig.hasKey(key)) {
return this._mapScenarioMapTypeSubTypeConfig[key]
}
else if (this._mapScenarioMapTypeConfig && this._mapScenarioMapTypeConfig.hasKey(key)) {
return this._mapScenarioMapTypeConfig[key]
}
else {
return this._mapScenarioDefaultConfig[key]
}
}, _staticMapAPICultureMap: null, getStaticMapAPICultureParam: function getStaticMapAPICultureParam() {
var culture=WeatherAppJS.WarmBoot.Cache.getQualifiedLanguageString("culture");
if (WeatherAppJS.WarmBoot.Cache.getString("StaticMapAPICultureMap")) {
if (!this._staticMapAPICultureMap) {
this._staticMapAPICultureMap = JSON.parse(WeatherAppJS.WarmBoot.Cache.getString("StaticMapAPICultureMap"))
}
if (this._staticMapAPICultureMap[culture.toLowerCase()]) {
culture = this._staticMapAPICultureMap[culture.toLowerCase()]
}
}
return culture
}
})
})();
var MapUtils=WeatherAppJS.Maps.Utilities;
var MapConfigs=WeatherAppJS.Maps.Configs