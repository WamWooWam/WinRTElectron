/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
WinJS.Namespace.define("WeatherAppJS.GeocodePolygonSearch", {
_virtualEarthBoundingBoxes: null, initBoundingBoxesFromConfig: function initBoundingBoxesFromConfig() {
if (!this._virtualEarthBoundingBoxes) {
var boundingBoxDict=PlatformJS.Services.appConfig.getDictionary("VirtualEarthBoundingBoxes");
this._virtualEarthBoundingBoxes = {};
for (var i in boundingBoxDict) {
if (boundingBoxDict[i] instanceof Platform.Configuration.StringConfigurationItem) {
var key=boundingBoxDict[i].value;
var coordinates=key.split(";");
if (coordinates && coordinates.length >= 4) {
this._virtualEarthBoundingBoxes[i] = {
topLeft: {
latitude: parseFloat(coordinates[0]), longitude: parseFloat(coordinates[1])
}, bottomRight: {
latitude: parseFloat(coordinates[2]), longitude: parseFloat(coordinates[3])
}
}
}
}
}
}
}, overridePolygonFromConfig: function overridePolygonFromConfig(entityId) {
if (entityId) {
if (!this._virtualEarthPolygonsOverrides[entityId]) {
var virtualEarthPolygonsDict=PlatformJS.Services.appConfig.getDictionary("VirtualEarthPolygonsDict");
if (virtualEarthPolygonsDict) {
var polygonsList=virtualEarthPolygonsDict.getList(entityId);
if (polygonsList && polygonsList.size > 0) {
this._virtualEarthPolygons[entityId] = [];
for (var i=0; i < polygonsList.size; i++) {
var polygon=polygonsList[i].value;
if (polygon) {
var vertexList=polygon.split(';');
var vertices=[];
for (var v=0; v < vertexList.length; v++) {
var vertex=vertexList[v].split(',');
vertices.push([parseFloat(vertex[0]), parseFloat(vertex[1])])
}
this._virtualEarthPolygons[entityId].push(vertices)
}
}
}
}
this._virtualEarthPolygonsOverrides[entityId] = true
}
}
}, boundingBoxSearch: function boundingBoxSearch(topLeft, bottomRight, point) {
if (topLeft && topLeft.latitude && topLeft.longitude && bottomRight && bottomRight.latitude && bottomRight.longitude && point && point.latitude && point.longitude) {
if (topLeft.longitude > +bottomRight.longitude) {
return ((topLeft.longitude >= +point.longitude || bottomRight.longitude <= +point.longitude) && topLeft.latitude >= +point.latitude && bottomRight.latitude <= +point.latitude)
}
else {
return (topLeft.longitude <= +point.longitude && bottomRight.longitude >= +point.longitude && topLeft.latitude >= +point.latitude && bottomRight.latitude <= +point.latitude)
}
}
}, isLatLongBlocked: function isLatLongBlocked(point) {
try {
var that=this;
var isEnabled=PlatformJS.Services.appConfig.getBool("IsVirtualEarthPolygonSearchEnabled");
if (isEnabled) {
msWriteProfilerMark("WeatherApp:GeocodePolygonSearch:LatLongSearch:s");
that.initBoundingBoxesFromConfig();
for (var entity in that._virtualEarthBoundingBoxes) {
var bBox=that._virtualEarthBoundingBoxes[entity];
if (that.boundingBoxSearch(bBox.topLeft, bBox.bottomRight, point) !== false) {
if (that.isPointInsideEntityPolygon(entity, point.latitude, point.longitude)) {
msWriteProfilerMark("WeatherApp:GeocodePolygonSearch:LatLongSearch:e");
return true
}
}
}
msWriteProfilerMark("WeatherApp:GeocodePolygonSearch:LatLongSearch:e")
}
return false
}
catch(ex) {
msWriteProfilerMark("WeatherApp:GeocodePolygonSearch:LatLongSearch:e");
return true
}
}, isPointInPolygon: function isPointInPolygon(points, lat, lon) {
var j=points.length - 1;
var inPoly=false;
for (var i=0; i < points.length; i++) {
if ((points[i][1] < lon && points[j][1] >= lon) || (points[j][1] < lon && points[i][1] >= lon)) {
if (points[i][0] + ((lon - points[i][1]) / (points[j][1] - points[i][1]) * (points[j][0] - points[i][0])) < lat) {
inPoly = !inPoly
}
}
j = i
}
return inPoly
}, isPointInsideEntityPolygon: function isPointInsideEntityPolygon(entityId, lat, lon) {
try {
this.overridePolygonFromConfig(entityId);
var entityPolygons=this._virtualEarthPolygons[entityId];
if (entityPolygons) {
for (var polygon in entityPolygons) {
if (this.isPointInPolygon(entityPolygons[polygon], lat, lon)) {
return true
}
}
}
return false
}
catch(e) {
return true
}
}, _virtualEarthPolygonsOverrides: {}, _virtualEarthPolygons: {}, reinitialize: function reinitialize() {
this._virtualEarthBoundingBoxes = null;
this._virtualEarthPolygonsOverrides = {};
this._virtualEarthPolygons = {}
}
})
})()