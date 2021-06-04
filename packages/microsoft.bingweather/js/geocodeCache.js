/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
WinJS.Namespace.define("WeatherAppJS", {GeocodeCache: new(WinJS.Class.define(function() {
var that=this;
var createGeocodeLocation=WeatherAppJS.GeocodeLocation.createGeocodeLocation;
var settingsManager=WeatherAppJS.SettingsManager;
settingsManager.getFavoritesAsync().then(function(favorites) {
for (var i=0; i < favorites.length; i++) {
that.addLocation(favorites[i])
}
});
settingsManager.getRecentLocationsAsync().then(function(locations) {
for (var i=0; i < locations.length; i++) {
that.addLocation(locations[i])
}
});
var defaultLocation=settingsManager.getDefaultLocation();
if (defaultLocation && defaultLocation.fullName) {
this.addLocation(defaultLocation)
}
var addToCache=function(e) {
if (e && e.detail) {
var loc=e.detail;
var cGeoLoc=createGeocodeLocation(loc);
if (cGeoLoc) {
that.addLocation(cGeoLoc)
}
}
};
settingsManager.addEventListener('favoriteadded', addToCache, false);
settingsManager.addEventListener('recentlocationadded', addToCache, false);
settingsManager.addEventListener('defaultlocationupdated', addToCache, false)
}, {
_locations: {}, addLocation: function addLocation(geocodeLocation) {
if (geocodeLocation && geocodeLocation.getId() && geocodeLocation instanceof WeatherAppJS.GeocodeLocation) {
this._locations[geocodeLocation.getId()] = geocodeLocation;
return this._locations[geocodeLocation.getId()]
}
else {
throw"add failed";
}
}, removeLocation: function removeLocation(id) {
if (id && this._locations[id]) {
var locationData=this._locations[id];
delete this._locations[id];
return locationData
}
}, getLocation: function getLocation(id) {
if (id && this._locations[id]) {
return this._locations[id]
}
}, isfetchByName: function isfetchByName(id) {
if (id && this._locations[id]) {
return this._locations[id].isfetchByName()
}
return true
}, isfetchByLatLong: function isfetchByLatLong(id) {
if (id && this._locations[id]) {
return this._locations[id].isfetchByLatLong()
}
return false
}, setFetchByLatLong: function setFetchByLatLong(id, value) {
if (id && this._locations[id]) {
this._locations[id].setFetchByLatLong(value)
}
}, isTianQiSupportedLocation: function isTianQiSupportedLocation(id) {
if (id && this._locations[id]) {
return this._locations[id].isTianQiSupportedLocation()
}
}, isAlertsSupportedLocation: function isAlertsSupportedLocation(id) {
if (id && this._locations[id]) {
return this._locations[id].isAlertsSupportedLocation()
}
}, getFullDisplayName: function getFullDisplayName(id, bypassCountryCheck, ignoreNameFormatReversal) {
if (id && this._locations[id]) {
return this._locations[id].getFullDisplayName(bypassCountryCheck, ignoreNameFormatReversal)
}
}, getShortDisplayName: function getShortDisplayName(id) {
if (id && this._locations[id]) {
return this._locations[id].getShortDisplayName()
}
}, getTwoLineDisplayName: function getTwoLineDisplayName(id) {
if (id && this._locations[id]) {
return this._locations[id].getTwoLineDisplayName()
}
}, getThreeLineDisplayName: function getThreeLineDisplayName(id) {
if (id && this._locations[id]) {
return this._locations[id].getThreeLineDisplayName()
}
}
}))})
})()