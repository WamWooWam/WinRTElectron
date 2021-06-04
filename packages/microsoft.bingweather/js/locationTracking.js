/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
WinJS.Namespace.define("WeatherAppJS.LocationTracking", {
getCurrentLatLongAsync: function getCurrentLatLongAsync() {
return new WinJS.Promise(function(complete, error) {
var isLocationDetectionEnabled=Platform.Utilities.Globalization.isFeatureEnabled("CurrentLocationDetection");
if (!isLocationDetectionEnabled) {
error({
errorcode: WeatherAppJS.ErrorCodes.LocationTracking.LOCATION_TRACKING_DISABLED, errormessage: 'location tracking disabled for current market'
});
return
}
msWriteProfilerMark("WeatherApp:GetGeopositionFlyout:Launched");
var geoLocator=new Windows.Devices.Geolocation.Geolocator;
geoLocator.getGeopositionAsync().then(function(response) {
msWriteProfilerMark("WeatherApp:GetGeopositionFlyout:Dismissed");
complete({
latitude: response.coordinate.latitude, longitude: response.coordinate.longitude, accuracy: response.coordinate.accuracy
})
}, function(err) {
msWriteProfilerMark("WeatherApp:GetGeopositionFlyout:Dismissed");
if (geoLocator.locationStatus === Windows.Devices.Geolocation.PositionStatus.disabled) {
error({
errorcode: WeatherAppJS.ErrorCodes.LocationTracking.LOCATION_TRACKING_DISABLED, errormessage: 'location tracking is disabled'
})
}
else {
error({
errorcode: WeatherAppJS.ErrorCodes.LocationTracking.LOCATION_DETECTION_FAILED, errormessage: 'getGeopositionAsync failed'
})
}
})
})
}, getLocationDataByLatLongAsync: function getLocationDataByLatLongAsync(latitude, longitude) {
return new WinJS.Promise(function(complete, error) {
WeatherAppJS.LocationSuggest.searchByLatLong(latitude + ',' + longitude).then(function(cityNames) {
if (cityNames.length === 0) {
WeatherAppJS.Utilities.Common.instrumentLocation("SearchByLocationFailure", latitude, longitude, ""),
error({
errorcode: WeatherAppJS.ErrorCodes.LocationTracking.LOCATION_DETECTION_FAILED, errormessage: 'Virtual earth returned no locations'
})
}
else {
WeatherAppJS.LocationsManager.tryFetchingCCDataAsync(cityNames[0], true).then(function(responseData) {
if (responseData && responseData.locationObject) {
complete(responseData.locationObject)
}
else {
WeatherAppJS.Utilities.Common.instrumentLocation("SearchByLocationFailure", cityNames[0].latitude, cityNames[0].longitude, cityNames[0].fullName);
error({
errorcode: WeatherAppJS.ErrorCodes.LocationTracking.NO_WEATHER_DATA, errormessage: 'Got empty response object'
})
}
}, function(err) {
WeatherAppJS.Utilities.Common.instrumentLocation("SearchByLocationFailure", cityNames[0].latitude, cityNames[0].longitude, cityNames[0].fullName);
error({
errorcode: WeatherAppJS.ErrorCodes.LocationTracking.NO_WEATHER_DATA, errormessage: 'No valid weather data returned'
})
})
}
}, function(err) {
error({
errorcode: WeatherAppJS.ErrorCodes.LocationTracking.LOCATION_DETECTION_FAILED, errormessage: 'searchByLatLong failed'
})
})
})
}, getCurrentLocationDataAsync: function getCurrentLocationDataAsync() {
var that=this;
return new WinJS.Promise(function(complete, error) {
that.getCurrentLatLongAsync().then(function(loc) {
var latitude=loc.latitude;
var longitude=loc.longitude;
var accuracy=loc.accuracy;
CommonJS.Progress.showProgress(CommonJS.Progress.headerProgressType);
that.getLocationDataByLatLongAsync(latitude, longitude).then(function(locationObj) {
locationObj.locDetectAccuracy = accuracy;
complete(locationObj)
}, function(err) {
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
error(err)
})
}, function(err) {
error(err)
})
})
}, detectAndFetchCurrentLocationDataAsync: function detectAndFetchCurrentLocationDataAsync() {
var that=this;
return new WinJS.Promise(function(complete, error) {
that.getCurrentLatLongAsync().then(function(loc) {
that.getLocationDataByLatLongAsync(loc.latitude, loc.longitude).then(function(locationObj) {
locationObj.locDetectAccuracy = loc.accuracy;
complete(locationObj)
}, function(err) {
if (err && err.errorcode) {
error(err)
}
else {
error({
errorcode: WeatherAppJS.ErrorCodes.LocationTracking.LOCATION_DETECTION_FAILED, errormessage: 'searchByLatLong failed'
})
}
})
}, function(err) {
error(err)
})
})
}
})
})()