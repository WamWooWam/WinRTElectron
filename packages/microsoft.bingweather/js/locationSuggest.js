/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
WinJS.Namespace.define("WeatherAppJS.LocationSuggest", {
_nameQueryService: null, _latLongQueryService: null, _bingMapsKey: null, _currentCultureCode: null, _reverseLookupQueryService: null, reinitialize: function reinitialize() {
this._nameQueryService = null;
this._latLongQueryService = null;
this._bingMapsKey = null;
this._currentCultureCode = null;
this._initPredictSuggestionsAPI = false;
this._predictSuggestionsTimeout = null;
this.locationsLocalList = null;
this.locationsDefaultList = null;
this.suggestionsData = {};
this.suggestionsDatabyLatLong = null;
this._reverseLookupQueryService = null
}, getVECultureCode: function getVECultureCode() {
if (!this._currentCultureCode) {
try {
this._currentCultureCode = Platform.Globalization.Marketization.getQualifiedLanguageString().toLowerCase()
}
catch(ex) {
this._currentCultureCode = "en"
}
}
return this._currentCultureCode
}, getVESuggestionsByName: function getVESuggestionsByName(queryText, culture, userLocation, includeEntityTypes) {
var that=this;
var bingMapsKey=this._bingMapsKey || (this._bingMapsKey = PlatformJS.Services.appConfig.getString("BingMapsKey"));
var queryService=this._nameQueryService || (this._nameQueryService = new PlatformJS.DataService.QueryService("VirtualEarthSearchByName"));
var cultureParam=culture || this.getVECultureCode();
var userLocationParam=userLocation ? "&userLocation=" + userLocation : "";
var includeEntityTypesParam=includeEntityTypes ? "&includeEntityTypes=" + includeEntityTypes : "";
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("bingMapsKey", bingMapsKey);
urlParams.insert("queryText", encodeURIComponent(queryText));
urlParams.insert("homeRegion", Platform.Globalization.Marketization.getMarketLocation());
urlParams.insert("culture", cultureParam);
urlParams.insert("userLocation", userLocationParam);
urlParams.insert("includeEntityTypes", includeEntityTypesParam);
return new WinJS.Promise(function(c, e) {
var isGeocodingAPIEnabled=Platform.Utilities.Globalization.isFeatureEnabled("VEGeocodingAPISuggestions");
var isAdminDivision1Enabled=PlatformJS.Services.appConfig.getBool("ShowAdminDivision1ForJPLocations");
if (!isGeocodingAPIEnabled) {
c([]);
return
}
var options=new Platform.DataServices.QueryServiceOptions;
options.useCompatDataModel = true;
options.enableAutoRefresh = false;
options.retryCount = 0;
queryService.downloadDataAsync(urlParams, null, null, options).then(function(response) {
var locationList=[];
if (!response || !response.dataString) {
e(new Error('Empty virtual earth reponse.'));
return
}
try {
locationList = that.parseResponseVESuggestionsByName(response.dataString, isAdminDivision1Enabled)
}
catch(ex) {
e(ex);
return
}
c(locationList)
}, function(error) {
if (PlatformJS.Utilities.isPromiseCanceled(error)) {
return
}
e(error)
})
})
}, parseResponseVESuggestionsByName: function parseResponseVESuggestionsByName(dataString, isAdminDivision1Enabled) {
var locationList=[];
var data=JSON.parse(dataString);
if (data && data.resourceSets) {
for (var i=0; i < data.resourceSets.length; i++) {
var resourceSet=data.resourceSets[i];
if (resourceSet.resources) {
for (var index=0; index < resourceSet.resources.length; index++) {
var resource=resourceSet.resources[index];
if (resource && resource.entityType && resource.address && resource.point && resource.point.coordinates && resource.point.coordinates.length === 2 && resource.point.coordinates[0] && resource.point.coordinates[1] && (resource.address.locality || resource.address.landmark || resource.address.adminDistrict) && resource.address.countryRegion && resource.address.countryRegionIso2) {
if (resource.entityType === 'PopulatedPlace' || resource.entityType === 'Island' || resource.entityType === 'Postcode1' || resource.entityType === 'Park' || (isAdminDivision1Enabled && resource.entityType === 'AdminDivision1' && resource.address.countryRegionIso2 === 'JP')) {
var locationObj={};
locationObj.latitude = resource.point.coordinates[0] + "";
locationObj.longitude = resource.point.coordinates[1] + "";
locationObj.fetchByLatLong = true;
locationObj.city = '';
locationObj.state = resource.address.adminDistrict || "";
if ((resource.entityType === 'PopulatedPlace' || resource.entityType === 'Postcode1') && resource.address.locality) {
locationObj.city = resource.address.locality
}
else if ((resource.entityType === 'Island' || resource.entityType === 'Park') && resource.address.landmark) {
locationObj.city = resource.address.landmark
}
else if (resource.entityType === 'AdminDivision1' && resource.address.adminDistrict) {
locationObj.city = resource.address.adminDistrict;
locationObj.state = ""
}
else {
continue
}
locationObj.country = resource.address.countryRegion;
locationObj.fullName = [locationObj.city, locationObj.state, locationObj.country].join(", ");
locationObj.type = resource.entityType || "";
locationObj.name = resource.name || "";
locationObj.zipCode = resource.address.postalCode || "";
locationObj.matchCode = resource.matchCode || [];
locationObj.confidence = resource.confidence || "";
locationObj.isoCode = resource.address.countryRegionIso2 || "";
locationObj.source = "VEGeocode";
var geocodeLocation=WeatherAppJS.GeocodeLocation.createGeocodeLocation(locationObj);
if (geocodeLocation && !WeatherAppJS.GeocodePolygonSearch.isLatLongBlocked(geocodeLocation)) {
locationList.push(geocodeLocation)
}
}
}
}
}
}
}
return locationList
}, getLocalizedGeocodeLocationAync: function getLocalizedGeocodeLocationAync(locName, latitude, longitude, isoCode, culture, skipValidation) {
var nullPromise=WinJS.Promise.wrap(null);
var LATLONG_ERROR_TOLERANCE=1.0;
if (locName) {
var query=locName;
var trimLatLong=WeatherAppJS.Utilities.Common.trimLatLong;
var la=trimLatLong(latitude);
var lo=trimLatLong(longitude);
var point=(!isNaN(la) && !isNaN(lo) && la !== "" && lo !== "") ? (la + "," + lo) : "";
var cultureParam=culture || this.getVECultureCode();
var isAdminDivision1Enabled=PlatformJS.Services.appConfig.getBool("ShowAdminDivision1ForJPLocations");
var includeEntityTypes="PopulatedPlace,Island,Postcode1,Park";
if (isAdminDivision1Enabled && isoCode === 'JP') {
includeEntityTypes += ",AdminDivision1"
}
return this.getVESuggestionsByName(query, cultureParam, point, includeEntityTypes).then(function(locations) {
if (locations && locations.length > 0) {
var loc=locations[0];
if (!skipValidation && point) {
var longdiff=Math.min(Math.abs(parseFloat(loc.longitude) - lo), 360.0 - Math.abs(parseFloat(loc.longitude) - lo));
if (Math.abs(parseFloat(loc.latitude) - la) > LATLONG_ERROR_TOLERANCE || longdiff > LATLONG_ERROR_TOLERANCE) {
return nullPromise
}
}
return WinJS.Promise.wrap(loc)
}
return nullPromise
})
}
return nullPromise
}, getInvariantGeocodeLocationAync: function getInvariantGeocodeLocationAync(locName, latitude, longitude, isoCode, skipValidation) {
var invariantCulture="en";
return this.getLocalizedGeocodeLocationAync(locName, latitude, longitude, isoCode, invariantCulture, skipValidation)
}, searchByLatLong: function searchByLatLong(point) {
var that=this;
var bingMapsKey=this._bingMapsKey || (this._bingMapsKey = PlatformJS.Services.appConfig.getString("BingMapsKey"));
var queryService=this._latLongQueryService || (this._latLongQueryService = new PlatformJS.DataService.QueryService("VirtualEarthSearchByLatLong"));
var culture=this.getVECultureCode();
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("bingMapsKey", bingMapsKey);
urlParams.insert("point", point);
urlParams.insert("culture", culture);
urlParams.insert("homeRegion", Platform.Globalization.Marketization.getMarketLocation());
return new WinJS.Promise(function(c, e) {
var isLocationDetectionEnabled=Platform.Utilities.Globalization.isFeatureEnabled("CurrentLocationDetection");
if (!isLocationDetectionEnabled) {
c([]);
return
}
var options=new Platform.DataServices.QueryServiceOptions;
options.useCompatDataModel = true;
options.enableAutoRefresh = false;
queryService.downloadDataAsync(urlParams, null, null, options).then(function(response) {
var locationList=[];
if (!response || !response.dataString) {
e(new Error('Empty virtual earth reponse.'));
return
}
try {
locationList = that.parseResponseVESuggestionsByLatLong(response.dataString)
}
catch(ex) {
e(ex);
return
}
c(locationList)
}, function(error) {
if (PlatformJS.Utilities.isPromiseCanceled(error)) {
return
}
e(error)
})
})
}, parseResponseVESuggestionsByLatLong: function parseResponseVESuggestionsByLatLong(dataString) {
var locationList=[];
var data=JSON.parse(dataString);
if (data && data.resourceSets) {
for (var i=0; i < data.resourceSets.length; i++) {
var resourceSet=data.resourceSets[i];
if (resourceSet.resources) {
for (var index=0; index < resourceSet.resources.length; index++) {
var resource=resourceSet.resources[index];
if (resource.address && resource.point && resource.point.coordinates && resource.point.coordinates.length === 2 && resource.point.coordinates[0] && resource.point.coordinates[1] && resource.address.locality && resource.address.countryRegion) {
var locationObj={};
locationObj.latitude = resource.point.coordinates[0] + "";
locationObj.longitude = resource.point.coordinates[1] + "";
locationObj.fetchByLatLong = true;
locationObj.city = resource.address.locality;
locationObj.state = resource.address.adminDistrict || "";
locationObj.country = resource.address.countryRegion;
locationObj.fullName = [locationObj.city, locationObj.state, locationObj.country].join(", ");
locationObj.type = resource.entityType || "";
locationObj.name = resource.name || "";
locationObj.zipCode = resource.address.postalCode || "";
locationObj.matchCode = resource.matchCode || [];
locationObj.confidence = resource.confidence || "";
locationObj.isoCode = resource.address.countryRegionIso2 || "";
locationObj.source = "VEReverseGeocode";
var geocodeLocation=WeatherAppJS.GeocodeLocation.createGeocodeLocation(locationObj);
if (geocodeLocation && !WeatherAppJS.GeocodePolygonSearch.isLatLongBlocked(geocodeLocation)) {
locationList.push(geocodeLocation)
}
}
}
}
}
}
return locationList
}, getInvariantLocationByLatLongAsync: function getInvariantLocationByLatLongAsync(latitude, longitude, id, locType) {
return this.getLocationByLatLongAsync(latitude, longitude, id, locType, "en-us")
}, getLocationByLatLongAsync: function getLocationByLatLongAsync(latitude, longitude, id, locType, culture) {
var useTianQi=Platform.Utilities.Globalization.isFeatureEnabled("UseTianQi");
var queryService=this._reverseLookupQueryService || (this._reverseLookupQueryService = new PlatformJS.DataService.QueryService("LocationSearchByLatLong"));
var urlParams=PlatformJS.Collections.createStringDictionary();
var middleTierHost=PlatformJS.Services.appConfig.getString("MiddleTierHostAutosuggest");
var skiId="";
var locId="";
if (locType === WeatherAppJS.GeocodeLocation.locationType.skiLocation) {
skiId = "&id=" + id;
latitude = "";
longitude = "";
locId = id
}
else {
skiId = "";
latitude = "&lat=" + latitude;
longitude = "&long=" + longitude;
locId = null
}
urlParams.insert("middletierhostautosuggest", middleTierHost);
urlParams.insert("latitude", latitude);
urlParams.insert("longitude", longitude);
urlParams.insert("language", culture);
urlParams.insert("useTianQi", useTianQi);
urlParams.insert("skiId", skiId);
return new WinJS.Promise(function(c, e) {
var options=new Platform.DataServices.QueryServiceOptions;
queryService.downloadDataAsync(urlParams, null, null, options).then(function(response) {
if (!response || !response.dataString) {
e(new Error('Empty autosuggest response'));
return
}
try {
var data=JSON.parse(response.dataString)
}
catch(ex) {
e(ex);
return
}
if (data && data.Latitude && data.Longitude && data.City && data.Country && data.IsoCode) {
var locationObj={};
locationObj.latitude = data.Latitude;
locationObj.longitude = data.Longitude;
locationObj.fetchByLatLong = true;
locationObj.name = data.City;
locationObj.city = data.City;
locationObj.state = data.State;
locationObj.country = data.Country;
locationObj.fullName = [data.City, data.State, data.Country].join(", ");
locationObj.isoCode = data.IsoCode;
locationObj.locType = locType;
locationObj.id = locId;
var geocodeLocation=WeatherAppJS.GeocodeLocation.createGeocodeLocation(locationObj);
if (useTianQi && geocodeLocation.isTianQiSupportedLocation()) {
geocodeLocation.setFetchByLatLong(false)
}
if (geocodeLocation && !WeatherAppJS.GeocodePolygonSearch.isLatLongBlocked(geocodeLocation)) {
c(geocodeLocation);
return
}
}
c(null)
}, function(error) {
if (PlatformJS.Utilities.isPromiseCanceled(error)) {
return
}
e(error)
})
})
}, _initPredictSuggestionsAPI: false, _predictSuggestionsTimeout: null, getPredictSuggestionsAsync: function getPredictSuggestionsAsync(query) {
var that=this;
if (!this._initPredictSuggestionsAPI) {
WeatherAppJS.Geo.Locations.initPrediction(PlatformJS.Services.appConfig.getString("PredictProvider"));
this._predictSuggestionsTimeout = PlatformJS.Services.appConfig.getInt32("PredictTimeoutInMilliseconds");
this._initPredictSuggestionsAPI = true
}
return new WinJS.Promise(function(c, e) {
WinJS.Promise.timeout(that._predictSuggestionsTimeout, WeatherAppJS.Geo.Locations.getPredictionsAsync(query).then(function(suggestions) {
var locations=[];
var suggestionsDict={};
if (suggestions) {
for (var s in suggestions) {
if (suggestions[s].name && suggestions[s].country && suggestions[s].isoCode && suggestions[s].latitude && suggestions[s].longitude) {
suggestions[s].city = suggestions[s].name;
suggestions[s].state = suggestions[s].state ? suggestions[s].state : "";
suggestions[s].fullName = [suggestions[s].city, suggestions[s].state, suggestions[s].country].join(", ");
suggestions[s].fetchByLatLong = true;
suggestions[s].locType = (suggestions[s].type === "S") ? WeatherAppJS.GeocodeLocation.locationType.skiLocation : WeatherAppJS.GeocodeLocation.locationType.cityLocation;
var geocodeLocation=WeatherAppJS.GeocodeLocation.createGeocodeLocation(suggestions[s]);
var useTianQi=Platform.Utilities.Globalization.isFeatureEnabled("UseTianQi");
if (useTianQi && geocodeLocation.isTianQiSupportedLocation()) {
geocodeLocation.setFetchByLatLong(false)
}
if (geocodeLocation && !WeatherAppJS.GeocodePolygonSearch.isLatLongBlocked(geocodeLocation)) {
if (!suggestionsDict[geocodeLocation.getId()]) {
suggestionsDict[geocodeLocation.getId()] = true;
locations.push(geocodeLocation)
}
}
}
}
}
c(locations)
}, function(ex) {
e(ex)
}))
})
}, getWorldWeatherGeocodeLocation: function getWorldWeatherGeocodeLocation(wwLocation) {
if (!wwLocation || !wwLocation.name || !wwLocation.latitude || !wwLocation.longitude || !wwLocation.isoCode) {
return
}
var useTianQi=Platform.Utilities.Globalization.isFeatureEnabled("UseTianQi");
var loc={};
loc.latitude = wwLocation.latitude;
loc.longitude = wwLocation.longitude;
loc.fetchByLatLong = true;
loc.city = wwLocation.name.first;
loc.state = "";
loc.country = wwLocation.name.second;
loc.fullName = [loc.city, loc.state, loc.country].join(", ");
loc.type = "PopulatedPlace";
loc.isoCode = wwLocation.isoCode;
loc.source = "WorldWeather";
var geocodeLocation=WeatherAppJS.GeocodeLocation.createGeocodeLocation(loc);
if (geocodeLocation) {
if (useTianQi && geocodeLocation.isTianQiSupportedLocation()) {
geocodeLocation.setFetchByLatLong(false)
}
return geocodeLocation
}
}, getSkiResortGeocodeLocation: function getSkiResortGeocodeLocation(skiResortLocation) {
if (!skiResortLocation || !skiResortLocation.id || !skiResortLocation.Name || !skiResortLocation.Latitude || !skiResortLocation.Longitude) {
return
}
var loc={};
loc.id = skiResortLocation.id;
loc.latitude = skiResortLocation.Latitude;
loc.longitude = skiResortLocation.Longitude;
loc.name = skiResortLocation.Name;
loc.city = skiResortLocation.Name;
loc.state = skiResortLocation.State;
loc.country = skiResortLocation.Country;
loc.isoCode = skiResortLocation.CC;
loc.fullName = [loc.city, loc.state, loc.country].join(", ");
loc.locType = WeatherAppJS.GeocodeLocation.locationType.skiLocation;
loc.fetchByLatLong = true;
loc.source = "ECV";
var geocodeLocation=WeatherAppJS.GeocodeLocation.createGeocodeLocation(loc);
return geocodeLocation
}, locationsLocalList: null, locationsDefaultList: null, suggestionsData: {}, suggestionsDatabyLatLong: null, _populateLocationsListAsync: function _populateLocationsListAsync() {
var that=this;
return new WinJS.Promise(function(c, e) {
var promises=[];
promises.push(readFile("LocalSuggestionsFile"));
promises.push(readFile("DefaultSuggestionsFile"));
promises.push(readFile("SuggestionsDataFile"));
WinJS.Promise.join(promises).then(c, e);
function readFile(filename) {
var filepath=PlatformJS.Services.appConfig.getString(filename);
return WinJS.xhr({url: filepath}).then(function(request) {
try {
if (filename === "LocalSuggestionsFile") {
that.locationsLocalList = JSON.parse(request.responseText)
}
else if (filename === "DefaultSuggestionsFile") {
that.locationsDefaultList = JSON.parse(request.responseText)
}
else if (filename === "SuggestionsDataFile") {
that.suggestionsData = JSON.parse(request.responseText)
}
}
catch(ex) {
e(ex)
}
}, function(ex) {
e(ex);
return
})
}
})
}, _processSuggestionsData: function _processSuggestionsData() {
for (var i in this.locationsLocalList) {
if (this.suggestionsData[this.locationsLocalList[i].dn]) {
this.suggestionsData[this.locationsLocalList[i].dn].local = this.locationsLocalList[i]
}
}
}, _processSuggestionsDataByLatLong: function _processSuggestionsDataByLatLong() {
this.suggestionsDatabyLatLong = {};
var useTianQi=Platform.Utilities.Globalization.isFeatureEnabled("UseTianQi");
var list=(useTianQi) ? this.locationsLocalList : this.locationsDefaultList;
var trimLatLong=WeatherAppJS.Utilities.Common.trimLatLong;
for (var i in list) {
var id=list[i].dn;
if (this.suggestionsData[id]) {
var la=trimLatLong(this.suggestionsData[id].la);
var lo=trimLatLong(this.suggestionsData[id].lo);
if (isNaN(la) || isNaN(lo)) {
continue
}
var key=la + ',' + lo;
this.suggestionsDatabyLatLong[key] = list[i]
}
}
}, getLocalSuggestionsAsync: function getLocalSuggestionsAsync(query) {
var that=this;
return new WinJS.Promise(function(complete, error) {
if (!that.locationsLocalList || !that.locationsDefaultList) {
that._populateLocationsListAsync().then(function() {
that._processSuggestionsData();
complete(that._fetchAllLocalSuggestions(query))
}, function(err) {
error(err)
})
}
else {
complete(that._fetchAllLocalSuggestions(query))
}
})
}, getLocalSuggestionsByLatLongAsync: function getLocalSuggestionsByLatLongAsync(latitude, longitude, localize) {
var that=this;
var trimLatLong=WeatherAppJS.Utilities.Common.trimLatLong;
return new WinJS.Promise(function(complete, error) {
that.getLocalSuggestionsAsync("").then(function() {
var loc=null;
if (!that.suggestionsDatabyLatLong) {
that._processSuggestionsDataByLatLong()
}
var la=trimLatLong(latitude);
var lo=trimLatLong(longitude);
if (isNaN(la) || isNaN(lo)) {
complete(loc);
return
}
var key=la + ',' + lo;
var s=that.suggestionsDatabyLatLong[key];
if (s && that.suggestionsData[s.dn]) {
if (localize && that.suggestionsData[s.dn].local) {
s = that.suggestionsData[s.dn].local
}
var suggestion=that._createSuggestionObject(s, that.suggestionsData[s.dn]);
var geocodeLocation=WeatherAppJS.GeocodeLocation.createGeocodeLocation(suggestion);
if (geocodeLocation) {
var useTianQi=Platform.Utilities.Globalization.isFeatureEnabled("UseTianQi");
if (useTianQi && geocodeLocation.isTianQiSupportedLocation()) {
geocodeLocation.setFetchByLatLong(false)
}
loc = geocodeLocation
}
}
complete(loc)
}, function(e) {
error(e)
})
})
}, _fetchAllLocalSuggestions: function _fetchAllLocalSuggestions(query) {
if (query) {
var localizedSuggestions=[],
defaultSuggestions=[];
var locations=[],
suggestions={};
var lQuery=WeatherAppJS.Services.Utilities.getLowerCase(query, false);
var iQuery=WeatherAppJS.Services.Utilities.getLowerCase(query, true);
var useTianQi=Platform.Utilities.Globalization.isFeatureEnabled("UseTianQi");
if (this.locationsLocalList) {
localizedSuggestions = this._searchLocalSuggestions(lQuery, this.locationsLocalList)
}
if (this.locationsDefaultList) {
defaultSuggestions = this._searchLocalSuggestions(iQuery, this.locationsDefaultList)
}
localizedSuggestions.forEach(function(s) {
suggestions[s.defaultName] = s;
var gcLocation=WeatherAppJS.GeocodeLocation.createGeocodeLocation(s);
if (gcLocation) {
if (useTianQi && gcLocation.isTianQiSupportedLocation()) {
gcLocation.setFetchByLatLong(false)
}
locations.push(gcLocation)
}
});
for (var i in defaultSuggestions) {
var s=defaultSuggestions[i];
if (!suggestions[s.defaultName]) {
var localizedLocation=null;
if (this.suggestionsData[s.defaultName] && this.suggestionsData[s.defaultName].local) {
localizedLocation = this.suggestionsData[s.defaultName].local;
defaultSuggestions[i] = this._createSuggestionObject(localizedLocation, this.suggestionsData[s.defaultName])
}
var geocodeLocation=WeatherAppJS.GeocodeLocation.createGeocodeLocation(defaultSuggestions[i]);
if (geocodeLocation) {
if (!(useTianQi && geocodeLocation.isTianQiSupportedLocation())) {
locations.push(geocodeLocation)
}
else {
if (localizedLocation) {
geocodeLocation.setFetchByLatLong(false);
locations.push(geocodeLocation)
}
}
}
}
}
locations.sort(function(a, b) {
return (a.score - b.score)
});
return locations
}
else {
return []
}
}, _searchLocalSuggestions: function _searchLocalSuggestions(query, locationsList) {
var min=0;
var max=locationsList.length - 1;
var suggestions=[];
if (query) {
var minIndex=this._binSearchRange(query, locationsList, min, max, true);
if (minIndex !== undefined) {
var maxIndex=this._binSearchRange(query, locationsList, minIndex, max, false);
for (var i=minIndex; i <= maxIndex; i++) {
if (this.suggestionsData[locationsList[i].dn]) {
var s=this._createSuggestionObject(locationsList[i], this.suggestionsData[locationsList[i].dn]);
suggestions.push(s)
}
}
}
}
return suggestions
}, _createSuggestionObject: function _createSuggestionObject(locationObject, suggestionData) {
var s={};
s.defaultName = locationObject.dn;
s.latitude = suggestionData.la;
s.longitude = suggestionData.lo;
s.city = locationObject.ct;
s.state = locationObject.st;
s.country = locationObject.co;
s.isoCode = suggestionData.cc;
s.fetchByLatLong = true;
s.type = suggestionData.tp;
s.normalizedName = locationObject.nn;
s.fullName = [s.city, s.state, s.country].join(", ");
s.score = locationObject.sc;
s.source = "localSuggest";
return s
}, _binSearchRange: function _binSearchRange(query, locationsList, min, max, leftmost) {
leftmost = (leftmost) ? true : false;
min = (min === undefined ? 0 : min);
max = (max === undefined ? locationsList.length - 1 : max);
var left=longestPrefix(query, locationsList[min].nn).length;
var right=longestPrefix(query, locationsList[max].nn).length;
var min_lr=Math.min(left, right);
while (min <= max) {
var mid=Math.floor((max + min) / 2);
var mid_str=locationsList[mid].nn;
var prefixLen=longestPrefix(mid_str, query, min_lr).length;
var matchLen=min_lr + prefixLen;
if (query.length > matchLen) {
var mismatched=mid_str[matchLen];
var qChar=query[matchLen];
if (!mismatched || mismatched < qChar) {
min = mid + 1;
left = matchLen
}
else if (mismatched > qChar) {
max = mid - 1;
right = matchLen
}
}
else if (query.length === matchLen) {
if (leftmost) {
max = mid - 1;
right = matchLen
}
else {
min = mid + 1;
left = matchLen
}
var found=true
}
min_lr = Math.min(left, right)
}
if (found) {
return (leftmost) ? max + 1 : min - 1
}
}
});
function longestPrefix(str1, str2, pos) {
if (!str1 || !str2) {
return ""
}
if (!pos || pos < 0) {
pos = 0
}
var minLen=(Math.min(str1.length, str2.length));
for (var i=pos; i < minLen; i++) {
if (str1[i] !== str2[i]) {
return str1.substr(pos, i - pos)
}
}
return str1.substr(pos, minLen - pos)
}
})()