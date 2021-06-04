/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
var appData=Windows.Storage.ApplicationData.current;
var _pdpReadCompleteHandler=function(){};
WinJS.Namespace.define("WeatherAppJS", {SettingsManager: new(WinJS.Class.mix(function() {
var that=this;
this._geographicRegion = new Windows.Globalization.GeographicRegion;
if (appData.version === 0) {
that._clearUserSettings();
appData.setVersionAsync(1, function(setVersionRequest){}).done()
}
this._detectRegionSwitch();
this._initSettingsStore();
this._init();
this._readSettings()
}, {
_settings: {
favorites: "favorites", recentLocations: "recentlocations", defaultlocation: "defaultlocation", currentlocation: "currentlocation", displayunit: "displayunit", displayunitpending: "displayunitpending", isFRE: "isFRE", enableSearchHistory: "enablesearchhistory", mapsEnvironment: "mapsenvironment", isCCMinimized: "isCCMinimized", lastSuspendTime: "lastSuspendTime", geographicRegionISOCode: "geographicRegionISOCode", userDefaultRegionISOCode: "userDefaultRegionISOCode", isPDPRead: "isPDPReadComplete"
}, _favorites: null, _recentLocations: null, _defaultLocation: null, _currentLocation: null, _displayUnit: null, _displayUnitPending: null, _isFRE: true, _isCCMinimized: true, _enableSearchHistory: null, _lastSuspendTime: null, _localSettings: null, _isPDPRead: false, _roamingSettings: null, _shouldMergeTianQiWithPdp: false, _userDefaultRegionISOCode: null, _revIPComplete: false, _geographicRegion: null, _geographicRegionSwitched: null, _doingBulkUpdates: false, _init: function _init() {
this._favorites = [];
this._recentLocations = [];
this._defaultLocation = null;
this._currentLocation = null;
this._displayUnit = null;
this._displayUnitPending = null;
this._isFRE = null;
this._enableSearchHistory = null;
this._isCCMinimized = null;
this._lastSuspendTime = null;
this._doingBulkUpdates = false;
this._userDefaultRegionISOCode = null
}, pdpReadCompletedPromise: function pdpReadCompletedPromise() {
var that=this;
return new WinJS.Promise(function(complete) {
if (!that._isFRE || WeatherAppJS.SettingsManager.IsPDPRead) {
complete();
return
}
_pdpReadCompleteHandler = complete
})
}, IsPDPRead: {
get: function get() {
return this._isPDPRead
}, set: function set(value) {
this._isPDPRead = value;
this._serializeSetting(this._settings.isPDPRead)
}
}, _initSettingsStore: function _initSettingsStore() {
var localSettings=appData.localSettings;
var roamingSettings=localSettings;
if (this._geographicRegion.codeTwoLetter === "CN") {
roamingSettings = appData.roamingSettings;
if (roamingSettings.containers.hasKey("TianQiSettings")) {
this._shouldMergeTianQiWithPdp = true;
if (localSettings.containers.hasKey("TianQiSettings")) {
var tianQiLocalSettings=localSettings.containers.lookup("TianQiSettings");
this._mergeTianQiSettings(tianQiLocalSettings, localSettings);
localSettings.deleteContainer("TianQiSettings")
}
var tianQiRoamingSettings=roamingSettings.containers.lookup("TianQiSettings");
this._mergeTianQiSettings(tianQiRoamingSettings, localSettings);
roamingSettings.deleteContainer("TianQiSettings");
this._localSettings = this._roamingSettings = roamingSettings = localSettings
}
else {
this._localSettings = localSettings;
this._roamingSettings = appData.localSettings
}
}
else {
this._localSettings = localSettings;
this._roamingSettings = roamingSettings
}
}, _mergeTianQiSettings: function _mergeTianQiSettings(tianQiSettings, parentSettings) {
if (tianQiSettings && tianQiSettings.values) {
for (var setting in tianQiSettings.values) {
if (this._settings[setting] && tianQiSettings.values[this._settings[setting]]) {
parentSettings.values[this._settings[setting]] = tianQiSettings.values[this._settings[setting]]
}
}
}
}, _clearUserSettings: function _clearUserSettings() {
var localSettings=appData.localSettings;
var roamingSettings=localSettings;
if (this._geographicRegion.codeTwoLetter === "CN") {
roamingSettings = appData.roamingSettings
}
for (var setting in this._settings) {
roamingSettings.values.remove(this._settings[setting]);
localSettings.values.remove(this._settings[setting])
}
for (var localIndex in localSettings.containers) {
if (localSettings.containers[localIndex] instanceof Windows.Storage.ApplicationDataContainer) {
localSettings.deleteContainer(localIndex)
}
}
for (var roamingIndex in roamingSettings.containers) {
if (roamingSettings.containers[roamingIndex] instanceof Windows.Storage.ApplicationDataContainer) {
roamingSettings.deleteContainer(roamingIndex)
}
}
}, _detectRegionSwitch: function _detectRegionSwitch() {
var localSettings=appData.localSettings;
var oldGeographicRegion=localSettings.values[this._settings.geographicRegionISOCode];
if (oldGeographicRegion === undefined) {
localSettings.values[this._settings.geographicRegionISOCode] = this._geographicRegion.codeTwoLetter
}
else if (oldGeographicRegion !== this._geographicRegion.codeTwoLetter) {
this._geographicRegionSwitched = true;
localSettings.values[this._settings.geographicRegionISOCode] = this._geographicRegion.codeTwoLetter
}
}, _readSettings: function _readSettings() {
var defaultLocation=this._deserializeSetting(this._settings.defaultlocation, function(e) {
throw e;
});
if (defaultLocation) {
defaultLocation = WeatherAppJS.GeocodeLocation.createGeocodeLocation(defaultLocation);
this._defaultLocation = defaultLocation
}
var favorites=this._deserializeSetting(this._settings.favorites, function(e) {
throw e;
});
if (favorites) {
if (Object.prototype.toString.call(favorites) === '[object Array]') {
for (var f in favorites) {
var favorite=favorites[f];
if (this._isValidLocation(favorite)) {
favorite = WeatherAppJS.GeocodeLocation.createGeocodeLocation(favorite);
if (!this._isDefaultLocation(favorite)) {
this._favorites.push(favorite)
}
}
}
}
}
var recentLocations=this._deserializeSetting(this._settings.recentLocations, function(e) {
throw e;
});
if (recentLocations) {
if (Object.prototype.toString.call(recentLocations) === '[object Array]') {
for (var r in recentLocations) {
var recentLoc=recentLocations[r];
if (this._isValidLocation(recentLoc)) {
recentLoc = WeatherAppJS.GeocodeLocation.createGeocodeLocation(recentLoc);
this._recentLocations.push(recentLoc)
}
}
}
}
var currentLocation=this._deserializeSetting(this._settings.currentlocation, function(e) {
throw e;
});
if (currentLocation) {
currentLocation = WeatherAppJS.GeocodeLocation.createGeocodeLocation(currentLocation);
this._currentLocation = currentLocation
}
this._displayUnit = this._deserializeSetting(this._settings.displayunit);
this._displayUnitPending = this._deserializeSetting(this._settings.displayunitpending);
var isFRE=this._deserializeSetting(this._settings.isFRE, function(e) {
throw e;
});
if (isFRE !== true && isFRE !== false) {
this._isFRE = true
}
else {
this._isFRE = isFRE
}
this._enableSearchHistory = this._deserializeSetting(this._settings.enableSearchHistory);
this._mapsEnvironment = this._deserializeSetting(this._settings.mapsEnvironment);
var isCCMinimized=this._deserializeSetting(this._settings.isCCMinimized, function(e) {
throw e;
});
if (isCCMinimized !== true && isCCMinimized !== false) {
this._isCCMinimized = true
}
else {
this._isCCMinimized = isCCMinimized
}
this._lastSuspendTime = this._deserializeSetting(this._settings.lastSuspendTime);
var userDefaultRegionISOCode=this._deserializeSetting(this._settings.userDefaultRegionISOCode);
if (userDefaultRegionISOCode) {
this._userDefaultRegionISOCode = userDefaultRegionISOCode
}
else {
var geographicRegion=this._geographicRegion ? this._geographicRegion : new Windows.Globalization.GeographicRegion;
this._userDefaultRegionISOCode = geographicRegion.codeTwoLetter;
this.fetchUserDefaultRegionAsync()
}
this._isPDPRead = this._deserializeSetting(this._settings.isPDPRead)
}, readPDPDataAsync: function readPDPDataAsync(bypassCache) {
if (this._shouldMergeTianQiWithPdp) {
this._migrateDataToPDP()
}
if (WeatherAppJS.WarmBoot.Cache.isFeatureEnabled("UsePDP")) {
var that=this;
return new WinJS.Promise(function(complete, error) {
var pdpDataServiceUtility=WeatherAppJS.Utilities.Roaming.getDataServiceUtilityInstance();
var dataService=pdpDataServiceUtility.getPersonalizedDataServiceInstance();
WeatherAppJS.Utilities.Roaming.isPDPReadInProgress = true;
dataService.readAsync(bypassCache).then(function pdp_Read_Success(data) {
try {
WeatherAppJS.Utilities.Roaming.isPDPReadInProgress = false;
if (data.defaultLocation && data.defaultLocation.locationId !== "") {
var defaultLoc=that._validateAndBuildLocationObj(data.defaultLocation);
if (defaultLoc) {
if (!that._defaultLocation || (that._defaultLocation.getId() !== defaultLoc.getId())) {
WeatherAppJS.GeocodeCache.addLocation(defaultLoc);
if (that._defaultLocation) {
that.dispatchEvent('defaultlocationupdated', that._copyLocation(defaultLoc))
}
else {
var e={};
e.detail = that._copyLocation(defaultLoc);
WeatherAppJS.LocationsManager.setLocationAsDefault(e)
}
that._defaultLocation = defaultLoc;
that._serializeSetting(that._settings.defaultlocation)
}
}
}
else {
that._migrateDataToPDP();
complete(true);
return
}
if (data.displayUnit) {
var newUnit=data.displayUnit === 1 ? 'F' : 'C';
if (that._geographicRegion.codeTwoLetter === "CN") {
newUnit = 'C'
}
if (newUnit !== that._displayUnit) {
that._displayUnit = newUnit;
that._serializeSetting(that._settings.displayunit);
if (!that._isFRE) {
var eventObj={};
eventObj.setting = "unitChange";
eventObj.unit = that._displayUnit;
that.dispatchEvent('settingchanged', eventObj)
}
}
}
var locations=data.locations;
var addedFavorites=[];
var allFavorites=[];
if (locations) {
var i=0;
for (i = 0; i < locations.length; i++) {
var favorite=locations[i];
var locObj=that._validateAndBuildLocationObj(favorite);
if (locObj) {
if (!that._isDefaultLocation(locObj)) {
allFavorites.push(locObj)
}
WeatherAppJS.GeocodeCache.addLocation(locObj);
if (!that._isFavorite(locObj) && !that._isDefaultLocation(locObj)) {
addedFavorites.push(locObj)
}
if (that._isRecentLocation(locObj)) {
that.removeRecentLocationAsync(locObj).done()
}
}
}
}
var oldFavorites=that._favorites;
that._favorites = allFavorites;
for (var afIndex in addedFavorites) {
that.dispatchEvent('favoriteadded', that._copyLocation(addedFavorites[afIndex]))
}
for (var ofIndex in oldFavorites) {
if (!that._isFavorite(oldFavorites[ofIndex])) {
that.dispatchEvent('favoriteremoved', that._copyLocation(oldFavorites[ofIndex]))
}
}
if (data.isFRE === false || data.isFRE === true) {
that._isFRE = data.isFRE;
that._serializeSetting(that._settings.isFRE)
}
if (data.isCCMinimized === false || data.isCCMinimized === true) {
that._isCCMinimized = data.isCCMinimized;
that._serializeSetting(that._settings.isCCMinimized)
}
_pdpReadCompleteHandler();
that._initializePdpReadCompleteHandler();
complete(true)
}
catch(e) {
_pdpReadCompleteHandler();
that._initializePdpReadCompleteHandler();
error(e)
}
}, function pdp_Read_Error(e) {
WeatherAppJS.Utilities.Roaming.isPDPReadInProgress = false;
_pdpReadCompleteHandler();
that._initializePdpReadCompleteHandler();
error(e)
})
})
}
else {
return new WinJS.Promise.wrap(true)
}
}, _migrateDataToPDP: function _migrateDataToPDP() {
var favorites=[];
for (var f in this._favorites) {
this._writeUpdateToPDP(this._favorites[f], WeatherAppJS.Utilities.Roaming.pdpUpdateType.add)
}
var otherUpdates={};
if (this._defaultLocation) {
otherUpdates["DefaultLocation"] = WeatherAppJS.Utilities.Roaming.getLocationDetails(this._defaultLocation)
}
if (!this._isFRE) {
otherUpdates["IsFRE"] = this._isFRE
}
otherUpdates["IsCCMinimized"] = this._isCCMinimized;
otherUpdates["DisplayUnit"] = this._displayUnit === 'F' ? 1 : 2;
var dataServiceUtility=WeatherAppJS.Utilities.Roaming.getDataServiceUtilityInstance();
dataServiceUtility.update(JSON.stringify(otherUpdates));
if (this._shouldMergeTianQiWithPdp) {
this._shouldMergeTianQiWithPdp = false
}
_pdpReadCompleteHandler();
this._initializePdpReadCompleteHandler()
}, _initializePdpReadCompleteHandler: function _initializePdpReadCompleteHandler() {
_pdpReadCompleteHandler = function(){}
}, _writeUpdateToPDP: function _writeUpdateToPDP(locationObj, type) {
if (WeatherAppJS.WarmBoot.Cache.isFeatureEnabled("UsePDP")) {
var dataServiceUtility=WeatherAppJS.Utilities.Roaming.getDataServiceUtilityInstance();
var params;
if (type === WeatherAppJS.Utilities.Roaming.pdpUpdateType.add) {
params = {AddLocation: WeatherAppJS.Utilities.Roaming.getLocationDetails(locationObj)}
}
else if (type === WeatherAppJS.Utilities.Roaming.pdpUpdateType.remove) {
params = {RemoveLocation: locationObj.getId()}
}
else {
params = {DefaultLocation: WeatherAppJS.Utilities.Roaming.getLocationDetails(locationObj)}
}
dataServiceUtility.update(JSON.stringify(params))
}
}, _writeUpdatesToPDP: function _writeUpdatesToPDP(addFav, defaultLoc, type) {
if (WeatherAppJS.WarmBoot.Cache.isFeatureEnabled("UsePDP")) {
var dataServiceUtility=WeatherAppJS.Utilities.Roaming.getDataServiceUtilityInstance();
var params;
var addedFavorite=WeatherAppJS.Utilities.Roaming.getLocationDetails(addFav);
var defaultLocation=WeatherAppJS.Utilities.Roaming.getLocationDetails(defaultLoc);
if (type === WeatherAppJS.Utilities.Roaming.changeHomeType.favorite) {
params = {
AddLocation: addedFavorite, RemoveLocation: defaultLocation.LocationTypeId, DefaultLocation: defaultLocation
}
}
else {
params = {
AddLocation: addedFavorite, DefaultLocation: defaultLocation
}
}
dataServiceUtility.update(JSON.stringify(params))
}
}, _writeSettingUpdatesToPDP: function _writeSettingUpdatesToPDP(update) {
if (WeatherAppJS.WarmBoot.Cache.isFeatureEnabled("UsePDP")) {
var pdpDataServiceUtility=WeatherAppJS.Utilities.Roaming.getDataServiceUtilityInstance();
pdpDataServiceUtility.update(JSON.stringify(update))
}
}, writeFavoritesOrderToPDP: function writeFavoritesOrderToPDP() {
if (WeatherAppJS.WarmBoot.Cache.isFeatureEnabled("UsePDP")) {
var favorites=[];
for (var f in this._favorites) {
favorites.push(WeatherAppJS.Utilities.Roaming.getLocationDetails(this._favorites[f]))
}
var updates={ReorderFavorites: favorites};
var dataServiceUtility=WeatherAppJS.Utilities.Roaming.getDataServiceUtilityInstance();
dataServiceUtility.update(JSON.stringify(updates))
}
}, _validateAndBuildLocationObj: function _validateAndBuildLocationObj(favorite) {
var that=this;
var loc={};
var locObj=null;
loc.id = favorite.locationId;
loc.latitude = favorite.geoPoint.latitude;
loc.longitude = favorite.geoPoint.longitude;
loc.city = favorite.city;
loc.state = favorite.state;
loc.country = favorite.country;
loc.fullName = [loc.city, loc.state, loc.country].join(", ");
loc.locType = parseInt(favorite.locationType);
loc.fetchByLatLong = true;
if (that._isValidLocation(loc)) {
locObj = WeatherAppJS.GeocodeLocation.createGeocodeLocation(loc)
}
if (!locObj || (locObj.isSkiLocation && WeatherAppJS.WarmBoot.Cache.isFeatureEnabled("UseTianQi"))) {
return null
}
return locObj
}, _refreshRoamingSettings: function _refreshRoamingSettings() {
var favorites=this._deserializeSetting(this._settings.favorites, function(e) {
throw e;
});
if (favorites) {
if (Object.prototype.toString.call(favorites) === '[object Array]') {
var addedFavorites=[];
var allFavorites=[];
for (var f in favorites) {
if (this._isValidLocation(favorites[f])) {
allFavorites.push(favorites[f]);
if (!this._isFavorite(favorites[f])) {
addedFavorites.push(favorites[f])
}
}
if (this._isRecentLocation(favorites[f])) {
this.removeRecentLocationAsync(favorites[f]).done()
}
}
var oldFavorites=this._favorites;
this._favorites = allFavorites;
for (var afIndex in addedFavorites) {
this._writeUpdateToPDP(addedFavorites[afIndex], WeatherAppJS.Utilities.Roaming.pdpUpdateType.add);
this.dispatchEvent('favoriteadded', this._copyLocation(addedFavorites[afIndex]))
}
for (var ofIndex in oldFavorites) {
if (!this._isFavorite(oldFavorites[ofIndex])) {
this._writeUpdateToPDP(oldFavorites[ofIndex], WeatherAppJS.Utilities.Roaming.pdpUpdateType.remove);
this.dispatchEvent('favoriteremoved', this._copyLocation(oldFavorites[ofIndex]))
}
}
}
}
var defaultLocation=this._deserializeSetting(this._settings.defaultlocation, function(e) {
throw e;
});
if (defaultLocation && this._isValidLocation(defaultLocation) && !this._isDefaultLocation(defaultLocation)) {
if (this._isRecentLocation(defaultLocation)) {
this.removeRecentLocationAsync(defaultLocation).done()
}
this._defaultLocation = defaultLocation;
this._writeUpdateToPDP(defaultLocation, WeatherAppJS.Utilities.Roaming.pdpUpdateType.defaultUpdate);
this.dispatchEvent('defaultlocationupdated', this._copyLocation(defaultLocation))
}
var displayUnit=this._deserializeSetting(this._settings.displayunit);
if (displayUnit && (displayUnit === 'C' || displayUnit === 'F') && displayUnit !== this._displayUnit) {
this.setDisplayUnitAsync(displayUnit, "").done()
}
var isFRE=this._deserializeSetting(this._settings.isFRE, function(e) {
throw e;
});
if ((isFRE === true || isFRE === false) && isFRE !== this._isFRE) {
this._isFRE = isFRE;
if (this._isFRE === false) {
this.dispatchEvent('frecompleted')
}
}
var enableSearchHistory=this._deserializeSetting(this._settings.enableSearchHistory);
if ((enableSearchHistory === true || enableSearchHistory === false) && enableSearchHistory !== this._enableSearchHistory) {
this._enableSearchHistory = enableSearchHistory;
if (this._enableSearchHistory === false) {
this.removeAllRecentLocationsAsync().done()
}
}
var isCCMinimized=this._deserializeSetting(this._settings.isCCMinimized, function(e) {
throw e;
});
if ((isCCMinimized === true || isCCMinimized === false) && isCCMinimized !== this._isCCMinimized) {
this._isCCMinimized = isCCMinimized
}
}, _serializeSetting: function _serializeSetting(setting, errorHandler) {
if (setting === this._settings.favorites) {
this._saveSettingAsJsonString(this._settings.favorites, this._favorites, this._roamingSettings, errorHandler)
}
else if (setting === this._settings.defaultlocation) {
this._saveSettingAsJsonString(this._settings.defaultlocation, this._defaultLocation, this._roamingSettings, errorHandler)
}
else if (setting === this._settings.currentlocation) {
this._saveSettingAsJsonString(this._settings.currentlocation, this._currentLocation, this._localSettings, errorHandler)
}
else if (setting === this._settings.displayunit) {
this._roamingSettings.values[this._settings.displayunit] = this._displayUnit
}
else if (setting === this._settings.displayunitpending) {
this._localSettings.values[this._settings.displayunitpending] = this._displayUnitPending
}
else if (setting === this._settings.recentLocations) {
this._saveSettingAsJsonString(this._settings.recentLocations, this._recentLocations, this._localSettings, errorHandler)
}
else if (setting === this._settings.isFRE) {
this._roamingSettings.values[this._settings.isFRE] = this._isFRE
}
else if (setting === this._settings.enableSearchHistory) {
this._roamingSettings.values[this._settings.enableSearchHistory] = this._enableSearchHistory
}
else if (setting === this._settings.mapsEnvironment) {
this._localSettings.values[this._settings.mapsEnvironment] = this._mapsEnvironment
}
else if (setting === this._settings.isCCMinimized) {
this._roamingSettings.values[this._settings.isCCMinimized] = this._isCCMinimized
}
else if (setting === this._settings.lastSuspendTime) {
this._localSettings.values[this._settings.lastSuspendTime] = this._lastSuspendTime
}
else if (setting === this._settings.userDefaultRegionISOCode) {
this._localSettings.values[this._settings.userDefaultRegionISOCode] = this._userDefaultRegionISOCode
}
else if (setting === this._settings.isPDPRead) {
this._localSettings.values[this._settings.isPDPRead] = this._isPDPRead
}
else {
if (errorHandler) {
errorHandler({
errorcode: WeatherAppJS.ErrorCodes.SettingsManager.UNKNOWN_SETTING_ERROR, errormessage: "Unknown setting error. Unable to serialize setting '" + setting + "'"
})
}
}
}, _saveSettingAsJsonString: function _saveSettingAsJsonString(setting, settingObject, settingsStore, errorHandler) {
try {
settingsStore.values[setting] = JSON.stringify(settingObject)
}
catch(exp) {
if (errorHandler) {
errorHandler({
errorcode: WeatherAppJS.ErrorCodes.SettingsManager.PARSE_ERROR, errormessage: exp.description
})
}
}
}, _deserializeSetting: function _deserializeSetting(setting, errorHandler) {
if (setting === this._settings.favorites) {
return this._readSettingFromJsonString(this._settings.favorites, this._roamingSettings, errorHandler)
}
else if (setting === this._settings.defaultlocation) {
return this._readSettingFromJsonString(this._settings.defaultlocation, this._roamingSettings, errorHandler)
}
else if (setting === this._settings.currentlocation) {
return this._readSettingFromJsonString(this._settings.currentlocation, this._localSettings, errorHandler)
}
else if (setting === this._settings.displayunit) {
return this._roamingSettings.values[this._settings.displayunit]
}
else if (setting === this._settings.displayunitpending) {
return this._localSettings.values[this._settings.displayunitpending]
}
else if (setting === this._settings.recentLocations) {
return this._readSettingFromJsonString(this._settings.recentLocations, this._localSettings, errorHandler)
}
else if (setting === this._settings.isFRE) {
return this._roamingSettings.values[this._settings.isFRE]
}
else if (setting === this._settings.enableSearchHistory) {
return this._roamingSettings.values[this._settings.enableSearchHistory]
}
else if (setting === this._settings.mapsEnvironment) {
return this._localSettings.values[this._settings.mapsEnvironment]
}
else if (setting === this._settings.isCCMinimized) {
return this._roamingSettings.values[this._settings.isCCMinimized]
}
else if (setting === this._settings.lastSuspendTime) {
return this._localSettings.values[this._settings.lastSuspendTime]
}
else if (setting === this._settings.userDefaultRegionISOCode) {
return this._localSettings.values[this._settings.userDefaultRegionISOCode]
}
else if (setting === this._settings.isPDPRead) {
return this._localSettings.values[this._settings.isPDPRead]
}
else {
if (errorHandler) {
errorHandler({
errorcode: WeatherAppJS.ErrorCodes.SettingsManager.UNKNOWN_SETTING_ERROR, errormessage: "Unknown setting error. Unable to deserialize setting '" + setting + "'"
})
}
}
}, _readSettingFromJsonString: function _readSettingFromJsonString(setting, settingsStore, errorHandler) {
var settingBlob=settingsStore.values[setting];
if (settingBlob !== undefined) {
try {
return JSON.parse(settingBlob)
}
catch(exp) {
if (errorHandler) {
errorHandler({
errorcode: WeatherAppJS.ErrorCodes.SettingsManager.PARSE_ERROR, errormessage: exp.description
})
}
}
}
}, _isFavorite: function _isFavorite(locationObj) {
if (locationObj) {
var locID=locationObj.getId();
for (var f in this._favorites) {
if (this._favorites[f]) {
if (this._favorites[f].getId() === locID) {
return f
}
}
}
}
}, _isRecentLocation: function _isRecentLocation(locationObj) {
if (locationObj) {
var locID=locationObj.getId();
for (var r in this._recentLocations) {
if (this._recentLocations[r].getId() === locID) {
return r
}
}
}
}, _isDefaultLocation: function _isDefaultLocation(locationObj) {
if (locationObj && this._defaultLocation && this._defaultLocation.getId() === locationObj.getId()) {
return true
}
return false
}, _isValidLocation: function _isValidLocation(locationObj) {
if (locationObj) {
try {
var newLocation=new WeatherAppJS.GeocodeLocation(locationObj);
return true
}
catch(exp) {}
}
return false
}, _copyLocation: function _copyLocation(locationObj) {
if (locationObj) {
try {
var newLocation=new WeatherAppJS.GeocodeLocation(locationObj);
return newLocation
}
catch(exp) {}
}
}, isFavorite: function isFavorite(locId) {
for (var f in this._favorites) {
if (this._favorites[f]) {
if (this._favorites[f].getId() === locId) {
return true
}
}
}
return false
}, isRecentLocation: function isRecentLocation(locId) {
for (var r in this._recentLocations) {
if (this._recentLocations[r].getId() === locId) {
return true
}
}
return false
}, addFavoriteAsync: function addFavoriteAsync(locationObj) {
var that=this;
var MAX_FAVORITES=PlatformJS.Services.appConfig.getInt32("MaxFavoriteLimit");
return new WinJS.Promise(function(c, e) {
if (that._isFavorite(locationObj) === undefined) {
if (!that._isDefaultLocation(locationObj)) {
if (that._favorites.length < MAX_FAVORITES) {
if (that._isValidLocation(locationObj)) {
var r,
favorite;
if ((r = that._isRecentLocation(locationObj)) !== undefined) {
var recent=that._recentLocations.splice(r, 1);
favorite = recent[0];
that._serializeSetting(that._settings.recentLocations, e);
that.dispatchEvent('recentlocationremoved', recent[0])
}
else {
favorite = that._copyLocation(locationObj)
}
that._favorites.push(favorite);
that._writeUpdateToPDP(favorite, WeatherAppJS.Utilities.Roaming.pdpUpdateType.add);
that.dispatchEvent('favoriteadded', that._copyLocation(favorite));
c();
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NumFavorites");
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, WeatherAppJS.Instrumentation.PageContext.Favorites, "", "appFavoriteAdded", "", 0)
}
else {
e({
errorcode: WeatherAppJS.ErrorCodes.SettingsManager.INVALID_LOCATION, errormessage: 'Invalid location attribute'
})
}
}
else {
e({
errorcode: WeatherAppJS.ErrorCodes.SettingsManager.FAVORITES_MAX_LIMIT_REACHED, errormessage: 'Max ' + MAX_FAVORITES + ' favorites allowed'
})
}
}
else {
e({
errorcode: WeatherAppJS.ErrorCodes.SettingsManager.LOCATION_ALREADY_A_DEFAULT, errormessage: 'Location is already the default location'
})
}
}
else {
e({
errorcode: WeatherAppJS.ErrorCodes.SettingsManager.FAVORITE_ALREADY_EXISTS, errormessage: 'Location already exists as a favorite'
})
}
})
}, removeFavoriteAsync: function removeFavoriteAsync(locationObj) {
var that=this;
return new WinJS.Promise(function(c, e) {
var f;
if ((f = that._isFavorite(locationObj)) !== undefined) {
var removed=that._favorites.splice(f, 1);
that._serializeSetting(that._settings.favorites, e);
that._writeUpdateToPDP(removed[0], WeatherAppJS.Utilities.Roaming.pdpUpdateType.remove);
that.dispatchEvent('favoriteremoved', removed[0]);
c()
}
else {
e({
errorcode: WeatherAppJS.ErrorCodes.SettingsManager.FAVORITE_DOES_NOT_EXIST, errormessage: 'Location is not a favorite'
})
}
})
}, removeAllFavoritesAsync: function removeAllFavoritesAsync() {
var that=this;
return new WinJS.Promise(function(c, e) {
var favorites=that._favorites;
that._favorites = [];
that._serializeSetting(that._settings.favorites, e);
while (favorites.length) {
var f=favorites.pop();
that._writeUpdateToPDP(f, WeatherAppJS.Utilities.Roaming.pdpUpdateType.remove);
that.dispatchEvent('favoriteremoved', f)
}
c()
})
}, getFavoritesAsync: function getFavoritesAsync() {
var that=this;
return new WinJS.Promise(function(c, e) {
try {
var favorites=[];
for (var f in that._favorites) {
var favorite=that._favorites[f];
favorite = WeatherAppJS.GeocodeLocation.createGeocodeLocation(favorite);
favorites.push(favorite)
}
c(favorites)
}
catch(exp) {
e({
errorcode: WeatherAppJS.ErrorCodes.SettingsManager.PARSE_ERROR, errormessage: exp.description
})
}
})
}, addRecentLocationAsync: function addRecentLocationAsync(locationObj) {
var that=this;
var MAX_RECENT_LOCATIONS=PlatformJS.Services.appConfig.getInt32("MaxRecentLocationsLimit");
return new WinJS.Promise(function(c, e) {
if (that.getEnableSearchHistory()) {
if (that._isValidLocation(locationObj)) {
if (that._isFavorite(locationObj) === undefined) {
if (!that._isDefaultLocation(locationObj)) {
var r;
if ((r = that._isRecentLocation(locationObj)) !== undefined) {
if (r !== 0) {
var recent=that._recentLocations.splice(r, 1);
that._recentLocations.unshift(recent[0]);
that._serializeSetting(that._settings.recentLocations, e)
}
that.dispatchEvent('recentlocationupdated', {
location: that._copyLocation(recent[0]), oldPosition: r, newPosition: 0
});
c()
}
else {
var oldRecents;
var oldRecent=that._copyLocation(locationObj);
that._recentLocations.unshift(oldRecent);
if (that._recentLocations.length > MAX_RECENT_LOCATIONS) {
oldRecents = that._recentLocations.splice(MAX_RECENT_LOCATIONS, that._recentLocations.length - MAX_RECENT_LOCATIONS)
}
that._serializeSetting(that._settings.recentLocations, e);
that.dispatchEvent('recentlocationadded', locationObj);
if (oldRecents) {
for (var o in oldRecents) {
that.dispatchEvent('recentlocationremoved', oldRecents[o])
}
}
c();
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logAppAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, WeatherAppJS.Instrumentation.PageContext.Recent, "", "appRecentlySearchedLocAdded", "", 0)
}
}
else {
e({
errorcode: WeatherAppJS.ErrorCodes.SettingsManager.LOCATION_ALREADY_A_DEFAULT, errormessage: 'Location is already the default location'
})
}
}
else {
e({
errorcode: WeatherAppJS.ErrorCodes.SettingsManager.LOCATION_ALREADY_A_FAVORITE, errormessage: 'Location is already a favorite'
})
}
}
else {
e({
errorcode: WeatherAppJS.ErrorCodes.SettingsManager.INVALID_LOCATION, errormessage: 'Invalid location attribute'
})
}
}
else {
c()
}
})
}, removeRecentLocationAsync: function removeRecentLocationAsync(locationObj) {
var that=this;
return new WinJS.Promise(function(c, e) {
var r;
if ((r = that._isRecentLocation(locationObj)) !== undefined) {
var removed=that._recentLocations.splice(r, 1);
that._serializeSetting(that._settings.recentLocations, e);
that.dispatchEvent('recentlocationremoved', removed[0]);
c()
}
else {
e({
errorcode: WeatherAppJS.ErrorCodes.SettingsManager.NOT_A_RECENT_LOCATION, errormessage: 'Location is not a recent location'
})
}
})
}, removeAllRecentLocationsAsync: function removeAllRecentLocationsAsync() {
var that=this;
return new WinJS.Promise(function(c, e) {
var recentLocations=that._recentLocations;
that._recentLocations = [];
that._serializeSetting(that._settings.recentLocations, e);
that.dispatchEvent('recentlocationscleared', recentLocations);
c()
})
}, getRecentLocationsAsync: function getRecentLocationsAsync() {
var that=this;
return new WinJS.Promise(function(c, e) {
try {
var recentLocations=[];
for (var r in that._recentLocations) {
var recentLoc=that._recentLocations[r];
recentLoc = WeatherAppJS.GeocodeLocation.createGeocodeLocation(recentLoc);
recentLocations.push(recentLoc)
}
c(recentLocations)
}
catch(exp) {
e({
errorcode: WeatherAppJS.ErrorCodes.SettingsManager.PARSE_ERROR, errormessage: exp.description
})
}
})
}, getDefaultLocation: function getDefaultLocation() {
return this._defaultLocation
}, getDefaultLocationId: function getDefaultLocationId() {
var defaultLoc;
if (this._defaultLocation) {
defaultLoc = this._defaultLocation.getId()
}
return defaultLoc
}, getCurrentLocation: function getCurrentLocation() {
return this._currentLocation
}, clearCurrentLocation: function clearCurrentLocation() {
this._currentLocation = null;
this._serializeSetting(this._settings.currentlocation)
}, isFavoritesMaxLimitReached: function isFavoritesMaxLimitReached() {
return (this._favorites.length >= PlatformJS.Services.appConfig.getInt32("MaxFavoriteLimit"))
}, setCurrentLocationAsync: function setCurrentLocationAsync(locationObj) {
var that=this;
return new WinJS.Promise(function(c, e) {
if (that._isValidLocation(locationObj)) {
that._currentLocation = locationObj;
that._serializeSetting(that._settings.currentlocation, e);
c(locationObj)
}
else {
that.clearCurrentLocation()
}
})
}, setDefaultLocationAsync: function setDefaultLocationAsync(locationObj, overwrite) {
var that=this;
overwrite = (overwrite) ? true : false;
var MAX_FAVORITES=PlatformJS.Services.appConfig.getInt32("MaxFavoriteLimit");
return new WinJS.Promise(function(c, e) {
if (that._isValidLocation(locationObj)) {
if (!WeatherAppJS.App.isLocationPinned(locationObj.getId())) {
if (that._isFavorite(locationObj) !== undefined) {
that.setFavoriteAsDefaultLocationAsync(locationObj).then(c, e)
}
else if (that._isRecentLocation(locationObj) !== undefined) {
that.setRecentAsDefaultLocationAsync(locationObj).then(c, e)
}
else if (!that._isDefaultLocation(locationObj)) {
that._doingBulkUpdates = true;
var oldDefault=that.getDefaultLocation();
if (!overwrite) {
if (that._favorites.length < MAX_FAVORITES) {
that._favorites.push(oldDefault);
that._serializeSetting(that._settings.favorites, e);
var newFav=that._copyLocation(oldDefault);
that._writeUpdateToPDP(newFav, WeatherAppJS.Utilities.Roaming.pdpUpdateType.add);
that.dispatchEvent('favoriteadded', newFav)
}
else {
that._doingBulkUpdates = false;
e({
errorcode: WeatherAppJS.ErrorCodes.SettingsManager.FAVORITES_MAX_LIMIT_REACHED, errormessage: 'Max ' + MAX_FAVORITES + ' favorites limit reached.'
});
return
}
}
var newDefault=that._copyLocation(locationObj);
that._defaultLocation = newDefault;
that._serializeSetting(that._settings.defaultlocation, e);
that._writeUpdateToPDP(locationObj, WeatherAppJS.Utilities.Roaming.pdpUpdateType.defaultUpdate);
that.dispatchEvent('defaultlocationupdated', locationObj);
that._doingBulkUpdates = false;
that.dispatchEvent('bulkupdatescompleted');
c()
}
else {
c()
}
}
else {
e({
errorcode: WeatherAppJS.ErrorCodes.SettingsManager.LOCATION_PINNED_TO_START, errormessage: 'Cannot set pinned location as default'
})
}
}
else {
e({
errorcode: WeatherAppJS.ErrorCodes.SettingsManager.INVALID_LOCATION, errormessage: 'Invalid default location'
})
}
})
}, setFavoriteAsDefaultLocationAsync: function setFavoriteAsDefaultLocationAsync(favorite) {
var that=this;
return new WinJS.Promise(function(c, e) {
if (that._isValidLocation(favorite)) {
if (!WeatherAppJS.App.isLocationPinned(favorite.getId())) {
var f;
if ((f = that._isFavorite(favorite)) !== undefined) {
that._doingBulkUpdates = true;
var newDefault=that._favorites[f];
var oldDefault=that.getDefaultLocation();
that._favorites[f] = oldDefault;
that._defaultLocation = newDefault;
that._serializeSetting(that._settings.favorites, e);
that._serializeSetting(that._settings.defaultlocation, e);
var newFav=that._copyLocation(that._favorites[f]);
var newDefaultLocation=that._copyLocation(that.getDefaultLocation());
that._writeUpdatesToPDP(newFav, newDefaultLocation, WeatherAppJS.Utilities.Roaming.changeHomeType.favorite);
that.dispatchEvent('favoriteremoved', newDefaultLocation);
that.dispatchEvent('defaultlocationupdated', newDefaultLocation);
that.dispatchEvent('favoriteadded', newFav);
that._doingBulkUpdates = false;
that.dispatchEvent('bulkupdatescompleted');
c(newDefaultLocation, newFav)
}
else {
e({
errorcode: WeatherAppJS.ErrorCodes.SettingsManager.FAVORITE_DOES_NOT_EXIST, errormessage: 'Location is not a favorite'
})
}
}
else {
e({
errorcode: WeatherAppJS.ErrorCodes.SettingsManager.LOCATION_PINNED_TO_START, errormessage: 'Cannot set pinned location as default'
})
}
}
else {
e({
errorcode: WeatherAppJS.ErrorCodes.SettingsManager.INVALID_LOCATION, errormessage: 'Invalid location'
})
}
})
}, ReorderFavorites: function ReorderFavorites(reorderedFavorites) {
var that=this;
return new WinJS.Promise(function(c, e) {
that._favorites = [];
for (var locID in reorderedFavorites) {
var reorderedFav=WeatherAppJS.GeocodeCache.getLocation(reorderedFavorites[locID]);
var fav=that._copyLocation(reorderedFav);
that._favorites.push(fav)
}
that.dispatchEvent('favoritesreordered');
c()
})
}, setRecentAsDefaultLocationAsync: function setRecentAsDefaultLocationAsync(recent) {
var that=this;
var MAX_FAVORITES=PlatformJS.Services.appConfig.getInt32("MaxFavoriteLimit");
return new WinJS.Promise(function(c, e) {
if (that.getEnableSearchHistory()) {
if (that._isValidLocation(recent)) {
if (!WeatherAppJS.App.isLocationPinned(recent.getId())) {
if (that._favorites.length < MAX_FAVORITES) {
var f;
if ((f = that._isRecentLocation(recent)) !== undefined) {
that._doingBulkUpdates = true;
var newDefault=that._recentLocations[f];
var oldDefault=that.getDefaultLocation();
that._recentLocations.splice(f, 1);
if (that._isValidLocation(oldDefault)) {
that._favorites.push(oldDefault)
}
that._defaultLocation = newDefault;
that._serializeSetting(that._settings.recentLocations, e);
that._serializeSetting(that._settings.defaultlocation, e);
that._serializeSetting(that._settings.favorites, e);
var newDefaultLocation=that._copyLocation(that.getDefaultLocation());
if (that._isValidLocation(oldDefault)) {
var newFav=that._copyLocation(oldDefault);
that._writeUpdatesToPDP(newFav, newDefaultLocation, WeatherAppJS.Utilities.Roaming.changeHomeType.recent);
that.dispatchEvent('recentlocationremoved', newDefaultLocation);
that.dispatchEvent('defaultlocationupdated', newDefaultLocation);
that.dispatchEvent('favoriteadded', newFav)
}
else {
that.dispatchEvent('recentlocationremoved', newDefaultLocation);
that.dispatchEvent('defaultlocationupdated', newDefaultLocation)
}
that._doingBulkUpdates = false;
that.dispatchEvent('bulkupdatescompleted');
c(newDefaultLocation, newFav)
}
else {
e({
errorcode: WeatherAppJS.ErrorCodes.SettingsManager.NOT_A_RECENT_LOCATION, errormessage: 'Location is not a recent location'
})
}
}
else {
e({
errorcode: WeatherAppJS.ErrorCodes.SettingsManager.FAVORITES_MAX_LIMIT_REACHED, errormessage: 'Max ' + MAX_FAVORITES + ' favorites limit reached.'
})
}
}
else {
e({
errorcode: WeatherAppJS.ErrorCodes.SettingsManager.LOCATION_PINNED_TO_START, errormessage: 'Cannot set pinned location as default'
})
}
}
else {
e({
errorcode: WeatherAppJS.ErrorCodes.SettingsManager.INVALID_LOCATION, errormessage: 'Invalid location'
})
}
}
else {
e({
errorcode: WeatherAppJS.ErrorCodes.SettingsManager.SEARCH_HISTORY_DISABLED, errormessage: 'Cannot set recent location as default because search history is disabled.'
})
}
})
}, ReorderRecent: function ReorderRecent(reorderedRecent) {
var that=this;
return new WinJS.Promise(function(c, e) {
that._recentLocations = [];
reorderedRecent.reverse();
for (var locID in reorderedRecent) {
var reorderRecent=WeatherAppJS.GeocodeCache.getLocation(reorderedRecent[locID]);
var oldRecent=that._copyLocation(reorderRecent);
that._recentLocations.unshift(oldRecent)
}
that._serializeSetting(that._settings.recentLocations, e);
c()
})
}, setDisplayUnitAsync: function setDisplayUnitAsync(newUnit, context) {
var that=this;
return new WinJS.Promise(function(c, e) {
if (newUnit === 'F' || newUnit === 'C') {
if (that.getDisplayUnit() !== newUnit) {
if ((WeatherAppJS.Networking.internetAvailable === true) || (that._isFRE || !that._defaultLocation) || PlatformJS.mainProcessManager.retailModeEnabled) {
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NumTimesDisplayUnitSettingChanged");
if (context !== "") {
var eventAttr={change: newUnit === 'C' ? "F to C" : "C to F"};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, context, "Change Unit", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr))
}
that._displayUnit = newUnit;
that._displayUnitPending = null;
WeatherAppJS.Networking.removeEventListener('networkonline', that.onHandlePendingDisplayUnitChange);
that._serializeSetting(that._settings.displayunit, e);
that._serializeSetting(that._settings.displayunitpending, e);
var eventObj={};
eventObj.setting = "unitChange";
eventObj.unit = that._displayUnit;
that._writeSettingUpdatesToPDP({DisplayUnit: newUnit === 'F' ? 1 : 2});
that.dispatchEvent('settingchanged', eventObj)
}
else {
if (!that._displayUnitPending || that._displayUnitPending !== newUnit) {
that._displayUnitPending = newUnit;
that._serializeSetting(that._settings.displayunitpending, e);
WeatherAppJS.Networking.addEventListener('networkonline', that.onHandlePendingDisplayUnitChange, false)
}
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString("NoInternetOnSettingChange"), false)
}
}
else {
that._displayUnitPending = null;
that._serializeSetting(that._settings.displayunitpending, e);
WeatherAppJS.Networking.removeEventListener('networkonline', that.onHandlePendingDisplayUnitChange)
}
c()
}
else {
e()
}
})
}, getDisplayUnit: function getDisplayUnit() {
var that=this;
if (this._displayUnit !== 'F' && this._displayUnit !== 'C') {
var defaultValue='C';
try {
defaultValue = WeatherAppJS.WarmBoot.Cache.getValueWithKey(that._userDefaultRegionISOCode, WeatherAppJS.Services.Utilities.isRegionMetric) ? 'C' : 'F'
}
catch(err) {}
this._displayUnit = defaultValue
}
return this._displayUnit
}, isFRE: function isFRE() {
return this._isFRE
}, setIsFREAsync: function setIsFREAsync(updatedIsFRE) {
var that=this;
return new WinJS.Promise(function(c, e) {
if (updatedIsFRE === true || updatedIsFRE === false) {
if (that._isFRE !== updatedIsFRE) {
that._isFRE = updatedIsFRE;
that._serializeSetting(that._settings.isFRE, e);
that._writeSettingUpdatesToPDP({IsFRE: updatedIsFRE});
if (that._isFRE === false) {
that.dispatchEvent('frecompleted')
}
}
c()
}
else {
e()
}
})
}, getEnableSearchHistory: function getEnableSearchHistory() {
if (this._enableSearchHistory !== true && this._enableSearchHistory !== false) {
var defaultValue=WeatherAppJS.WarmBoot.Cache.getBool('EnableSearchHistoryDefault');
this._enableSearchHistory = defaultValue
}
return this._enableSearchHistory
}, setEnableSearchHistory: function setEnableSearchHistory(enableFlag) {
var that=this;
return new WinJS.Promise(function(c, e) {
if (enableFlag === true) {
that._enableSearchHistory = true;
that._serializeSetting(that._settings.enableSearchHistory, e);
c()
}
else if (enableFlag === false) {
that.removeAllRecentLocationsAsync().then(function() {
that._enableSearchHistory = false;
that._serializeSetting(that._settings.enableSearchHistory, e);
c()
}, e)
}
else {
e()
}
})
}, setMapsEnvironment: function setMapsEnvironment(value) {
var that=this;
return new WinJS.Promise(function(c, e) {
that._mapsEnvironment = value;
that._serializeSetting(that._settings.mapsEnvironment, e);
that.dispatchEvent("mapsenvchanged", null);
c()
})
}, getMapsEnvironment: function getMapsEnvironment(value) {
var that=this;
if (!this._mapsEnvironment || !PlatformJS.Services.appConfig.getDictionary("MapEnvironments").hasKey(this._mapsEnvironment)) {
this._mapsEnvironment = PlatformJS.Services.appConfig.getString("DefaultMapsEnv")
}
return that._mapsEnvironment
}, isCCMinimized: function isCCMinimized() {
return false
}, setIsCCMinimizedAsync: function setIsCCMinimizedAsync(updatedIsCCMinimized) {
var that=this;
return new WinJS.Promise(function(c, e) {
if ((updatedIsCCMinimized !== undefined) && (that._isCCMinimized !== updatedIsCCMinimized)) {
that._isCCMinimized = updatedIsCCMinimized;
that._serializeSetting(that._settings.isCCMinimized, e);
that._writeSettingUpdatesToPDP({IsCCMinimized: updatedIsCCMinimized})
}
c()
})
}, getLastSuspendTime: function getLastSuspendTime() {
return this._lastSuspendTime
}, setLastSuspendTimeAsync: function setLastSuspendTimeAsync(lastSuspendTime) {
var that=this;
return new WinJS.Promise(function(c, e) {
that._lastSuspendTime = lastSuspendTime;
that._serializeSetting(that._settings.lastSuspendTime, e);
c()
})
}, onHandlePendingDisplayUnitChange: function onHandlePendingDisplayUnitChange() {
var that=WeatherAppJS.SettingsManager;
if (that._displayUnitPending) {
that.setDisplayUnitAsync(that._displayUnitPending, "").then()
}
}, getUserDefaultRegionISOCode: function getUserDefaultRegionISOCode() {
return this._userDefaultRegionISOCode
}, setUserDefaultRegionISOCodeAsync: function setUserDefaultRegionISOCodeAsync(isoCode) {
var that=this;
return new WinJS.Promise(function(c) {
if (isoCode && WeatherAppJS.Services.Utilities.isValidCountryCode(isoCode)) {
that._userDefaultRegionISOCode = isoCode.toUpperCase();
that._serializeSetting(that._settings.userDefaultRegionISOCode);
c()
}
})
}, fetchUserDefaultRegionAsync: function fetchUserDefaultRegionAsync() {
var that=this;
if (!that._revIPComplete) {
var geographicRegion=that._geographicRegion ? that._geographicRegion : new Windows.Globalization.GeographicRegion;
if (geographicRegion.codeTwoLetter !== "CN") {
PlatformJS.Utilities.Globalization.getLocationFromServerAsync().then(function(isoCode) {
return that.setUserDefaultRegionISOCodeAsync(isoCode)
}).done(function() {
that._revIPComplete = true
}, function(err){})
}
}
}, preFREUserDefaultRegionFetchTimeoutAsync: function preFREUserDefaultRegionFetchTimeoutAsync() {
var that=this;
if (that._revIPComplete) {
return WinJS.Promise.wrap(true)
}
var timeoutPeriod=WeatherAppJS.WarmBoot.Cache.getInt32("PreFRERevIPTimeout");
if (!timeoutPeriod) {
timeoutPeriod = 200
}
return WinJS.Promise.timeout(timeoutPeriod).then(function() {
return WinJS.Promise.wrap(true)
}, function(err) {
return WinJS.Promise.wrap(true)
})
}, doingBulkUpdates: function doingBulkUpdates() {
return this._doingBulkUpdates
}, onActivated: function onActivated() {
if (this._displayUnitPending) {
if (WeatherAppJS.Networking.internetAvailable === true) {
this.setDisplayUnitAsync(this._displayUnitPending, "").then()
}
else {
WeatherAppJS.Networking.addEventListener('networkonline', this.onHandlePendingDisplayUnitChange, false)
}
}
if (this._geographicRegionSwitched) {
try {
WeatherAppJS.App.clearAllTiles()
}
catch(ex) {}
this._geographicRegionSwitched = false
}
}
}, WinJS.Utilities.eventMixin, WinJS.Utilities.createEventProperties('favoriteadded', 'favoriteremoved', 'favoritesreordered', 'recentlocationadded', 'recentlocationremoved', 'recentlocationupdated', 'recentlocationscleared', 'defaultlocationupdated', 'bulkupdatescompleted', 'frecompleted', 'settingchanged', 'mapsenvchanged')))})
})()