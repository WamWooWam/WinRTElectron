/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
WinJS.Namespace.define("WeatherAppJS.Maps", {BaseMap: WinJS.Class.mix(function(mapdiv, mapOptions, initCallback) {
this._mapDiv = mapdiv || document.createElement("div");
WinJS.Utilities.addClass(this._mapDiv, "baseMapDiv");
this._eventHandlers = [];
this.setInitOptions(mapOptions)
}, {
_map: null, _mapDiv: null, _mapOptions: null, _userLayer: null, _modeLayer: null, _eventHandlers: null, _ui: null, _mapProperties: ["getWidth", "getHeight", "getZoom", "getTargetZoom", "getBounds", "getTargetBounds", "getTargetCenter", "tryLocationToPixel", "tryPixelToLocation", "isDownloadingTiles", "entities"], setInitOptions: function setInitOptions(options) {
options = options || {};
var mapOptions=MapConfigs.getBaseMapDefaultOptions() || {};
for (var propertyName in options) {
mapOptions[propertyName] = options[propertyName]
}
this._mapOptions = this.parseMapOptions(mapOptions)
}, initMap: function initMap(initCallback) {
var that=this;
msWriteProfilerMark("WeatherApp:WeatherMapsPage:BingMapsControlLoad:s");
MicrosoftJS.Maps.loadModule('Microsoft.Maps.Map', {
homeRegion: Platform.Globalization.Marketization.getMarketLocation(), callback: function callback() {
msWriteProfilerMark("WeatherApp:WeatherMapsPage:BingMapsControlLoad:e");
MapConfigs.setBaseMapGlobalOptions();
that._map = new MicrosoftJS.Maps.Map(that._mapDiv, that._mapOptions);
if (that._map.getWidth() && that._map.getHeight()) {
MapUtils.copyObjectProperties(that._map, that, that._mapProperties);
that._attachEventHandlers();
if (initCallback && typeof initCallback === "function") {
initCallback()
}
}
}
})
}, setView: function setView(viewOptions) {
if (viewOptions) {
this._map.setView(viewOptions)
}
}, parseMapOptions: function parseMapOptions(mapOptions) {
if (mapOptions.hasOwnProperty("mapTypeId") && MicrosoftJS.Maps.MapTypeId[mapOptions.mapTypeId]) {
mapOptions.mapTypeId = MicrosoftJS.Maps.MapTypeId[mapOptions.mapTypeId]
}
if (mapOptions.hasOwnProperty("labelOverlay")) {
mapOptions.labelOverlay = MicrosoftJS.Maps.LabelOverlay[mapOptions.labelOverlay]
}
if (mapOptions.hasOwnProperty("center")) {
mapOptions.center = MapUtils.createMapLocation(mapOptions.center)
}
if (mapOptions.hasOwnProperty("bounds")) {
mapOptions.bounds = MapUtils.createMapLocationRect(MapUtils.createMapLocation(mapOptions.bounds.topLeft), MapUtils.createMapLocation(mapOptions.bounds.bottomRight))
}
return mapOptions
}, _initUserInteraction: function _initUserInteraction(uiOptions) {
var options=uiOptions || {};
if (this._map) {
this._ui = new MicrosoftJS.Maps.UserInteraction(this._map, options)
}
}, disablePanRestriction: function disablePanRestriction() {
if (this._ui) {
this._ui.setOptions({disable: true})
}
}, restrictPanRegion: function restrictPanRegion(bounds, minZoom, maxZoom) {
if (bounds) {
var uiOptions={
disable: false, minZoom: minZoom, maxZoom: maxZoom, minLatitude: bounds.getSouth(), maxLatitude: bounds.getNorth(), minLongitude: bounds.getWest(), maxLongitude: bounds.getEast()
};
if (WeatherAppJS.Utilities.UI.isPerfOptimizedExperience()) {
uiOptions.inertiaIntensity = 0.1
}
if (!this._ui) {
this._initUserInteraction(uiOptions)
}
else {
this._ui.setOptions(uiOptions)
}
}
}, _getUserLayer: function _getUserLayer() {
if (!this._userLayer) {
if (this._map) {
this._userLayer = this._map.getUserLayer()
}
if (!this._userLayer) {
throw new Error("_getUserLayer(): Unable to get map's user layer");
}
}
return this._userLayer
}, _getModeLayer: function _getModeLayer() {
if (!this._modeLayer) {
if (this._map && this._map.getModeLayer() && this._map.getModeLayer().firstChild) {
this._modeLayer = this._map.getModeLayer().firstChild
}
else {
this._modeLayer = this._getUserLayer()
}
}
return this._modeLayer
}, addElementToMap: function addElementToMap(domElement, useModeLayer) {
if (domElement) {
var userLayer=(useModeLayer) ? this._getModeLayer() : this._getUserLayer();
try {
userLayer.appendChild(domElement);
return domElement
}
catch(err) {}
}
return null
}, removeElementFromMap: function removeElementFromMap(domElement, useModeLayer) {
if (domElement) {
var userLayer=(useModeLayer) ? this._getModeLayer() : this._getUserLayer();
try {
return userLayer.removeChild(domElement)
}
catch(err) {}
}
return null
}, addEventHandler: function addEventHandler(eventName, callback) {
if (eventName && typeof callback === "function") {
return MicrosoftJS.Maps.Events.addHandler(this._map, eventName, callback)
}
}, addThrottledEventHandler: function addThrottledEventHandler(eventName, callback, throttleInterval) {
if (eventName && typeof callback === "function") {
return MicrosoftJS.Maps.Events.addHandler(this._map, eventName, callback, throttleInterval)
}
}, removeEventHandler: function removeEventHandler(eventHandler) {
if (eventHandler) {
MicrosoftJS.Maps.Events.removeHandler(eventHandler)
}
}, _attachEventHandlers: function _attachEventHandlers() {
var that=this;
this._detachEventHandlers();
this._eventHandlers.push(this.addEventHandler('tiledownloadcomplete', function(e) {
that.dispatchEvent("tiledownloadcomplete", null)
}))
}, _detachEventHandlers: function _detachEventHandlers() {
var e=this._eventHandlers.pop();
while (e) {
MicrosoftJS.Maps.Events.removeHandler(e);
e = this._eventHandlers.pop()
}
}, clearMap: function clearMap() {
if (this._map) {
this._map.entities.clear();
var userLayer=this._map.getUserLayer();
if (userLayer) {
WinJS.Utilities.empty(userLayer)
}
}
}, disposeMap: function disposeMap() {
this._detachEventHandlers();
MapUtils.removeObjectProperties(this, this._mapProperties);
this._userLayer = null;
this.disablePanRestriction();
this._ui = null;
if (this._map) {
this._map.dispose();
this._map = null
}
}
}, WinJS.Utilities.eventMixin, WinJS.Utilities.createEventProperties('tiledownloadcomplete'))})
})()