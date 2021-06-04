/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
WinJS.Namespace.define("WeatherAppJS.Utilities.FRE", {
getOverviewData: function getOverviewData() {
return new WinJS.Promise(function(c, e, p) {
var appConfig=WeatherAppJS.WarmBoot.Cache;
var path=appConfig.getString("SampleOverviewFilePath");
var unit=WeatherAppJS.SettingsManager.getDisplayUnit();
path = path.format(unit);
WinJS.xhr({url: path}).then(function(request) {
try {
var response;
response = JSON.parse(request.responseText);
var dummyCacheResponse={};
dummyCacheResponse.bdiResponse = request.responseText;
dummyCacheResponse.lastUpdateTime = new Date(appConfig.getString("SampleOverviewTime"));
var presetDefaultLocation=WeatherAppJS.Utilities.Common.getPresetDefaultLocation();
var returnedLocId;
var useTianQi=WeatherAppJS.WarmBoot.Cache.isFeatureEnabled("UseTianQi");
if (useTianQi && WeatherAppJS.GeocodeCache.isTianQiSupportedLocation(presetDefaultLocation.getId())) {
returnedLocId = WeatherAppJS.DataManager._processTianQiData(presetDefaultLocation.getId(), dummyCacheResponse, response)
}
else {
returnedLocId = WeatherAppJS.DataManager._processCCAndForecastData(presetDefaultLocation.getId(), dummyCacheResponse, response)
}
c(WeatherAppJS.LocationsManager.getLocation(returnedLocId))
}
catch(ex) {}
}, function(ex){})
})
}, getMapsData: function getMapsData() {
return new WinJS.Promise(function(c, e, p) {
var appConfig=PlatformJS.Services.appConfig;
var path=appConfig.getString("SampleMapsFilePath");
var unit=WeatherAppJS.SettingsManager.getDisplayUnit();
path = path.format(unit);
WinJS.xhr({url: path}).then(function(request) {
try {
var response;
response = JSON.parse(request.responseText);
var dummyCacheResponse={};
dummyCacheResponse.bdiResponse = request.responseText;
dummyCacheResponse.lastUpdateTime = new Date(appConfig.getString("SampleMapsTime"));
var presetDefaultLocation=WeatherAppJS.Utilities.Common.getPresetDefaultLocation();
var returnedLocId=WeatherAppJS.DataManager._processMapsData(presetDefaultLocation.getId(), dummyCacheResponse, response);
c(WeatherAppJS.LocationsManager.getLocation(returnedLocId))
}
catch(ex) {}
}, function(ex){})
})
}, getInteractiveMapsClusterData: function getInteractiveMapsClusterData() {
return new WinJS.Promise(function(c, e, p) {
var appConfig=PlatformJS.Services.appConfig;
var path=appConfig.getString("SampleInteractiveMapsResponseFilePath");
WinJS.xhr({url: path}).then(function(request) {
try {
var response;
response = JSON.parse(request.responseText);
var dummyCacheResponse={};
dummyCacheResponse.bdiResponse = request.responseText;
dummyCacheResponse.lastUpdateTime = new Date(appConfig.getString("SampleInteractiveMapsResponseTime"));
var presetDefaultLocation=WeatherAppJS.Utilities.Common.getPresetDefaultLocation();
var returnedLocId=WeatherAppJS.DataManager._processInteractiveMapsClusterData(presetDefaultLocation.getId(), dummyCacheResponse, response);
c(WeatherAppJS.LocationsManager.getLocation(returnedLocId))
}
catch(ex) {}
}, function(ex){})
})
}, getHistoricalWeatherData: function getHistoricalWeatherData() {
return new WinJS.Promise(function(c, e, p) {
var appConfig=PlatformJS.Services.appConfig;
var path=appConfig.getString("SampleHistoricalFilePath");
var unit=WeatherAppJS.SettingsManager.getDisplayUnit();
path = path.format(unit);
WinJS.xhr({url: path}).then(function(request) {
try {
var response;
response = JSON.parse(request.responseText);
var dummyCacheResponse={};
dummyCacheResponse.bdiResponse = request.responseText;
dummyCacheResponse.lastUpdateTime = new Date(appConfig.getString("SampleHistoricalTime"));
var presetDefaultLocation=WeatherAppJS.Utilities.Common.getPresetDefaultLocation();
var returnedLocId=WeatherAppJS.DataManager._processHWData(presetDefaultLocation.getId(), dummyCacheResponse, response);
c(WeatherAppJS.LocationsManager.getLocation(returnedLocId))
}
catch(ex) {}
}, function(ex){})
})
}
})
})()