/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
WinJS.Namespace.define("WeatherAppJS.Maps", {
MapRegions: null, BaseMapController: WinJS.Class.mix(WinJS.Class.define(function() {
this._mapRegions = {};
this._currentRegion = WeatherAppJS.Maps.MapRegions.World
}, {
_baseMap: null, _currentRegion: null, currentRegion: {get: function get() {
return this._currentRegion
}}, baseMapZoomLevel: {
get: function get() {
return this._baseMap.getZoom()
}, set: function set(zoomLevel) {
this._baseMap.setView({zoom: zoomLevel});
this.setRestrictedView(false)
}
}, _baseMapZoomLevelLimits: null, baseMapZoomLevelLimits: {
get: function get() {
return this._baseMapZoomLevelLimits
}, set: function set(minZoom, maxZoom) {
this._baseMapZoomLevelLimits = {
minZoom: minZoom, maxZoom: maxZoom
}
}
}, _baseMapCurrentPanBounds: null, _isInitialized: null, _controllerOptions: null, _baseMapProperties: ["getWidth", "getHeight", "tryLocationToPixel", "tryPixelToLocation"], _initBaseMapController: function _initBaseMapController() {
var that=this;
MapUtils.copyObjectProperties(this._baseMap, this, this._baseMapProperties);
this._initEventListeners();
this.setRegion(this._controllerOptions.region);
if (this._controllerOptions.center) {
var zoomLevel=("zoom" in this._controllerOptions) ? this._controllerOptions.zoom : parseInt(PlatformJS.Services.appConfig.getString("BaseMapMaxMercatorZoom"));
this._baseMap.setView({
center: this._controllerOptions.center, zoom: zoomLevel, animate: false
})
}
else if (this._controllerOptions.bounds) {
var bounds=MapUtils.createMapLocationRectFromEdges(this._controllerOptions.bounds);
this._baseMap.setView({bounds: bounds})
}
this.setRestrictedView(false);
if (this._baseMap.isDownloadingTiles()) {
this._baseMap.addEventListener("tiledownloadcomplete", this._onTileDownloadComplete)
}
else {
this._onTileDownloadComplete()
}
}, _initEventListeners: function _initEventListeners() {
var that=this;
this._onTileDownloadComplete = function() {
if (!that._isInitialized) {
msWriteProfilerMark("WeatherApp:WeatherMapsPage:BaseMapControllerLoad:e");
CommonJS.Progress.hideProgress(CommonJS.Progress.centerProgressType);
that.dispatchEvent('initialized', null);
that._isInitialized = true
}
}
}, _removeEventListeners: function _removeEventListeners() {
if (this._baseMap) {
this._baseMap.removeEventListener("tiledownloadcomplete", this._onTileDownloadComplete);
if (this._targetViewChangedHandler) {
this.removeBaseMapEventHandler(this._targetViewChangedHandler);
this._targetViewChangedHandler = null
}
}
}, _initBaseMap: function _initBaseMap(mapDiv, baseMapOptions) {
msWriteProfilerMark("WeatherApp:WeatherMapsPage:BaseMapLoad:s");
var that=this;
var baseMap=new WeatherAppJS.Maps.BaseMap(mapDiv, baseMapOptions);
baseMap.initMap(function() {
msWriteProfilerMark("WeatherApp:WeatherMapsPage:BaseMapLoad:e");
that._baseMap = baseMap;
if (baseMapOptions.center && baseMapOptions.center.latitude && baseMapOptions.center.longitude) {
var curPos=new MicrosoftJS.Maps.Location(baseMapOptions.center.latitude, baseMapOptions.center.longitude);
var anchor=new MicrosoftJS.Maps.Point(25 / 2, 31);
var pin=new MicrosoftJS.Maps.Pushpin(curPos, {
icon: "/images/weathermaps/pushpin.png", anchor: anchor
});
that.addMapEntity(pin)
}
that._initBaseMapController()
})
}, _getPanRegion: function _getPanRegion(region, mapWidth, mapHeight) {
var rData=WeatherAppJS.Maps.BaseMapController.getRegionData(region);
var rView=this._getRegionView(region);
if (rData && rView) {
var panRegionBounds=MapUtils.createMapLocationRect(MapUtils.createMapLocation(rData.pan.bounds.topLeft), MapUtils.createMapLocation(rData.pan.bounds.bottomRight));
var minZoom=MapUtils.calculateZoomLevelFromBoundingBox(rView.bounds, mapWidth, mapHeight);
var maxZoom=rData.pan.maxZoom || parseInt(PlatformJS.Services.appConfig.getString("BaseMapMaxMercatorZoom"));
return {
bounds: panRegionBounds, minZoom: minZoom, maxZoom: maxZoom
}
}
}, _calcMaxPanRegionBounds: function _calcMaxPanRegionBounds(panRegionBounds, currentBounds) {
if (!(panRegionBounds.contains(currentBounds.getNorthwest()) && panRegionBounds.contains(currentBounds.getSoutheast()))) {
var boundingRect=MapUtils.createBoundingLocationRect(currentBounds, panRegionBounds);
if (boundingRect) {
return boundingRect
}
}
return panRegionBounds
}, _setPanRegion: function _setPanRegion(region) {
var panRegion=this._getPanRegion(region, this._baseMap.getWidth(), this._baseMap.getHeight());
if (panRegion) {
this._baseMap.restrictPanRegion(panRegion.bounds, panRegion.minZoom, panRegion.maxZoom);
this._baseMapZoomLevelLimits = {
minZoom: panRegion.minZoom, maxZoom: panRegion.maxZoom
};
this._baseMapCurrentPanBounds = panRegion.bounds
}
}, _getRegionView: function _getRegionView(region) {
var rData=WeatherAppJS.Maps.BaseMapController.getRegionData(region);
if (rData) {
return {
center: MapUtils.createMapLocation(rData.view.center), bounds: MapUtils.createMapLocationRect(MapUtils.createMapLocation(rData.view.bounds.topLeft), MapUtils.createMapLocation(rData.view.bounds.bottomRight))
}
}
}, _setRegionView: function _setRegionView(region) {
var view=this._getRegionView(region);
if (view) {
this._baseMap.setView(view);
this._currentRegion = region
}
else {
view = this._getRegionView(WeatherAppJS.Maps.MapRegions.World);
this._baseMap.setView(view);
this._currentRegion = WeatherAppJS.Maps.MapRegions.World
}
}, _parseBaseMapControllerOptions: function _parseBaseMapControllerOptions(controllerOptions) {
var options=controllerOptions || {};
var baseMapOptions=options.baseMapOptions || {};
if (options.hasOwnProperty("region") && MapUtils.isValidRegion(options.region)) {
options.region = WeatherAppJS.Maps.MapRegions[options.region]
}
else {
options.region = WeatherAppJS.Maps.MapRegions.World
}
if (options.center) {
baseMapOptions.center = options.center
}
else {
var rData=WeatherAppJS.Maps.BaseMapController.getRegionData(options.region);
baseMapOptions.bounds = rData.view.bounds
}
options.baseMapOptions = baseMapOptions;
this._controllerOptions = options
}, _getRestrictedView: function _getRestrictedView(panBounds, targetBounds, targetCenter, targetZoom) {
var minLatitude=panBounds.getSouth();
var maxLatitude=panBounds.getNorth();
var maxLongitude=panBounds.getEast();
var minLongitude=panBounds.getWest();
var width=this._baseMap.getWidth();
var height=this._baseMap.getHeight();
var bounds=targetBounds;
var center=targetCenter;
var zoom=targetZoom;
var centerOffset=new MicrosoftJS.Maps.Point(0, 0);
if ((bounds.center.longitude - bounds.width / 2) < minLongitude) {
center.longitude = minLongitude;
centerOffset.x = -width / 2
}
else if ((bounds.center.longitude + bounds.width / 2) > maxLongitude) {
center.longitude = maxLongitude;
centerOffset.x = width / 2
}
if (bounds.getNorth() > maxLatitude) {
center.latitude = maxLatitude;
centerOffset.y = -height / 2
}
else if (bounds.getSouth() < minLatitude) {
center.latitude = minLatitude;
centerOffset.y = height / 2
}
return {
zoom: zoom, center: center, centerOffset: centerOffset
}
}, init: function init(mapDiv, mapOptions) {
var that=this;
if (!that._isInitialized) {
msWriteProfilerMark("WeatherApp:WeatherMapsPage:BaseMapControllerLoad:s");
CommonJS.Progress.showProgress(CommonJS.Progress.centerProgressType);
that._parseBaseMapControllerOptions(mapOptions);
that._initBaseMap(mapDiv, that._controllerOptions.baseMapOptions)
}
}, setRegion: function setRegion(region) {
if (region !== undefined) {
this._setRegionView(region);
this._setPanRegion(region)
}
}, setRestrictedView: function setRestrictedView(updatePanRegion) {
if (updatePanRegion) {
this._setPanRegion(this._currentRegion)
}
if (this._baseMapCurrentPanBounds) {
var restrictedView=this._getRestrictedView(this._baseMapCurrentPanBounds, this._baseMap.getTargetBounds(), this._baseMap.getTargetCenter(), this._baseMap.getTargetZoom());
if (restrictedView) {
this._baseMap.setView(restrictedView)
}
}
}, setRestrictedViewDelayed: function setRestrictedViewDelayed(updatePanRegion) {
var that=this;
if (that._isInitialized) {
if (that._targetViewChangedHandler) {
that.removeBaseMapEventHandler(that._targetViewChangedHandler);
that._targetViewChangedHandler = null
}
that._targetViewChangedHandler = that.addBaseMapEventHandler("targetviewchanged", function onTargetViewChanged() {
that.removeBaseMapEventHandler(that._targetViewChangedHandler);
that._targetViewChangedHandler = null;
that.setRestrictedView(updatePanRegion)
})
}
}, addMapControl: function addMapControl(){}, removeMapControl: function removeMapControl(){}, addMapEntity: function addMapEntity(entity) {
this._baseMap.entities.push(entity)
}, removeMapEntity: function removeMapEntity(entity) {
this._baseMap.entities.remove(entity)
}, addMapLayerDiv: function addMapLayerDiv(layerDiv, useModeLayer) {
return this._baseMap.addElementToMap(layerDiv, useModeLayer)
}, removeMapLayerDiv: function removeMapLayerDiv(layerDiv, useModeLayer) {
return this._baseMap.removeElementFromMap(layerDiv, useModeLayer)
}, setBaseMapLayerOptions: function setBaseMapLayerOptions(baseMapLayerOptions) {
var baseMapOptions=this._baseMap.parseMapOptions(baseMapLayerOptions);
this._baseMap.setView(baseMapOptions)
}, addBaseMapEventHandler: function addBaseMapEventHandler(eventName, callback) {
return this._baseMap.addEventHandler(eventName, callback)
}, addBaseMapThrottledEventHandler: function addBaseMapThrottledEventHandler(eventName, callback, throttleInterval) {
return this._baseMap.addThrottledEventHandler(eventName, callback, throttleInterval)
}, removeBaseMapEventHandler: function removeBaseMapEventHandler(eventHandler) {
if (this._baseMap) {
this._baseMap.removeEventHandler(eventHandler)
}
}, dispose: function dispose() {
this._removeEventListeners();
this._isInitialized = false;
this._baseMapCurrentPanBounds = null;
MapUtils.removeObjectProperties(this, this._baseMapProperties);
if (this._baseMap) {
this._baseMap.disposeMap();
this._baseMap = null
}
}
}, {
_mapRegions: null, initMapRegions: function initMapRegions() {
WeatherAppJS.Maps.MapRegions = {};
this._mapRegions = {};
var baseMapRegionsConfig=PlatformJS.Services.appConfig.getDictionary("BaseMapRegions");
for (var regionName in baseMapRegionsConfig) {
if (baseMapRegionsConfig.hasItem(regionName)) {
var regionData=JSON.parse(baseMapRegionsConfig[regionName].value);
var regionCode=regionData.regionCode;
var regionId=regionData.id;
WeatherAppJS.Maps.MapRegions[regionId] = regionCode;
this._mapRegions[regionCode] = regionData
}
}
}, isValidRegion: function isValidRegion(region) {
return (region in this._mapRegions)
}, isValidRegionName: function isValidRegionName(regionName) {
return (regionName in WeatherAppJS.Maps.MapRegions)
}, getRegionName: function getRegionName(region) {
return (region in this._mapRegions) ? this._mapRegions[region].id : null
}, getRegionData: function getRegionData(region) {
if (region !== undefined && this._mapRegions[region]) {
return this._mapRegions[region][MapUtils.currentOrientation]
}
}, getRegionFetchId: function getRegionFetchId(region) {
if (region !== undefined && this._mapRegions[region]) {
return this._mapRegions[region].fetchId
}
}
}), WinJS.Utilities.eventMixin, WinJS.Utilities.createEventProperties('initialized'))
})
})();
WeatherAppJS.Maps.BaseMapController.initMapRegions()