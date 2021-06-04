/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
WinJS.Namespace.define("WeatherAppJS", {GeocodeLocation: WinJS.Class.define(function(locationData) {
if (this._isValidLocation(locationData)) {
this.fullName = locationData.fullName;
this.latitude = locationData.latitude;
this.longitude = locationData.longitude;
this.id = locationData.id ? locationData.id : null;
this.locType = locationData.locType ? locationData.locType : WeatherAppJS.GeocodeLocation.locationType.cityLocation;
var optionalFields=["city", "country", "state", "type", "name", "zipcode", "matchCode", "confidence", "source", "fetchByLatLong", "score", "isoCode"];
for (var propertyName in locationData) {
if (optionalFields.indexOf(propertyName) !== -1 && !(locationData[propertyName] instanceof Function)) {
this[propertyName] = locationData[propertyName]
}
}
if (!this.isoCode && this.country) {
var countryCode=WeatherAppJS.GeocodeLocation.getCountryRegionCode(this.country);
if (countryCode) {
this.isoCode = countryCode
}
}
}
else {
throw"Invalid location data";
}
}, {
_isValidLocation: function _isValidLocation(locationObj) {
var isValid=false;
if (locationObj && locationObj.fullName) {
if (locationObj.fetchByLatLong === false) {
isValid = true
}
else {
isValid = (locationObj.latitude && locationObj.latitude <= 90 && locationObj.latitude >= -90 && locationObj.longitude && locationObj.longitude <= 180 && locationObj.longitude >= -180)
}
if (locationObj.locType === WeatherAppJS.GeocodeLocation.locationType.skiLocation && !locationObj.id) {
isValid = false
}
}
return isValid
}, isfetchByName: function isfetchByName() {
return (this.fetchByLatLong) ? false : true
}, isfetchByLatLong: function isfetchByLatLong() {
return (this.fetchByLatLong) ? true : false
}, setFetchByLatLong: function setFetchByLatLong(value) {
this.fetchByLatLong = (value) ? true : false
}, getId: function getId() {
return (this.id) ? this.id : this.fullName
}, getFullName: function getFullName() {
return this.fullName
}, getLocType: function getLocType() {
return this.locType
}, getLocTypeString: function getLocTypeString() {
if (this.locType === WeatherAppJS.GeocodeLocation.locationType.skiLocation) {
return "ski"
}
else {
return "location"
}
}, isTianQiSupportedLocation: function isTianQiSupportedLocation() {
var tianQiSupportedIsoCodes=["CN", "MO", "HK", "TW"];
if (this.isoCode) {
return (tianQiSupportedIsoCodes.indexOf(this.isoCode) !== -1)
}
}, isAlertsSupportedLocation: function isAlertsSupportedLocation() {
var alertSupportedIsoCodes=["US", "AS", "GU", "MP", "PR", "VI", "UM"];
if (this.isoCode) {
return (alertSupportedIsoCodes.indexOf(this.isoCode) !== -1)
}
}, isCurrentMarketLocation: function isCurrentMarketLocation() {
if (this.isoCode) {
return (this.isoCode === WeatherAppJS.WarmBoot.Cache.getMarketLocation("MarketLocation"))
}
else if (this.country) {
return WeatherAppJS.Utilities.Common.isCurrentRegion(this.country)
}
}, isSkiLocation: {get: function get() {
return this.locType === WeatherAppJS.GeocodeLocation.locationType.skiLocation
}}, getFullDisplayName: function getFullDisplayName(bypassCountryCheck, ignoreNameFormatReversal) {
var loc=this;
if (!loc.city || !loc.country) {
return loc.fullName
}
else {
var isReversed=(ignoreNameFormatReversal) ? false : WeatherAppJS.WarmBoot.Cache.getBool("LocationNameFormatReversed");
var shortFormat=PlatformJS.Services.resourceLoader.getString("LocationNameShortFormat");
var longFormat=PlatformJS.Services.resourceLoader.getString("LocationNameLongFormat");
if (!loc.state && (loc.city === loc.country)) {
return loc.city
}
else if (!loc.state || loc.state === loc.city || loc.state === loc.country) {
return (isReversed) ? shortFormat.format(loc.country, loc.city) : shortFormat.format(loc.city, loc.country)
}
if (!bypassCountryCheck && loc.isCurrentMarketLocation()) {
return (isReversed) ? shortFormat.format(loc.state, loc.city) : shortFormat.format(loc.city, loc.state)
}
return (isReversed) ? longFormat.format(loc.country, loc.state, loc.city) : longFormat.format(loc.city, loc.state, loc.country)
}
}, getShortDisplayName: function getShortDisplayName() {
var loc=this;
if (!loc.city || !loc.country) {
return loc.fullName
}
else {
var isReversed=WeatherAppJS.WarmBoot.Cache.getBool("LocationNameFormatReversed");
var shortFormat=PlatformJS.Services.resourceLoader.getString("LocationNameShortFormat");
if (!loc.state && (loc.city === loc.country)) {
return loc.city
}
else if (!loc.state || loc.state === loc.city || loc.state === loc.country) {
return (isReversed) ? shortFormat.format(loc.country, loc.city) : shortFormat.format(loc.city, loc.country)
}
if (loc.isCurrentMarketLocation()) {
return (isReversed) ? shortFormat.format(loc.state, loc.city) : shortFormat.format(loc.city, loc.state)
}
else {
return (isReversed) ? shortFormat.format(loc.country, loc.city) : shortFormat.format(loc.city, loc.country)
}
}
}, getTwoLineDisplayName: function getTwoLineDisplayName() {
var loc=this;
if (!loc.city || !loc.country) {
return [loc.fullName, ""]
}
else {
var isReversed=PlatformJS.Services.appConfig.getBool("LocationNameFormatReversed");
var shortFormat=PlatformJS.Services.resourceLoader.getString("LocationNameShortFormat");
if (!loc.state && (loc.city === loc.country)) {
return (isReversed) ? ["", loc.city] : [loc.city, ""]
}
else if (!loc.state || loc.state === loc.city || loc.state === loc.country) {
return (isReversed) ? [loc.country, loc.city] : [loc.city, loc.country]
}
return (isReversed) ? [shortFormat.format(loc.country, loc.state), loc.city] : [loc.city, shortFormat.format(loc.state, loc.country)]
}
}, getThreeLineDisplayName: function getThreeLineDisplayName() {
var loc=this;
if (!loc.city || !loc.country) {
return [loc.fullName, "", ""]
}
else {
var isReversed=PlatformJS.Services.appConfig.getBool("LocationNameFormatReversed");
if (!loc.state && (loc.city === loc.country)) {
return (isReversed) ? ["", "", loc.city] : [loc.city, "", ""]
}
else if (!loc.state || loc.state === loc.city || loc.state === loc.country) {
return (isReversed) ? [loc.country, "", loc.city] : [loc.city, "", loc.country]
}
return (isReversed) ? [loc.country, loc.state, loc.city] : [loc.city, loc.state, loc.country]
}
}, getQueryName: function getQueryName() {
var loc=this;
if (!loc.city || !loc.country) {
return loc.fullName
}
else {
return loc.city + (loc.state ? (", " + loc.state) : "") + ", " + loc.country
}
}
}, {
_countryCodesList: null, locationType: {
cityLocation: 1, skiLocation: 2
}, locationTypeString: {
cityLocationString: "location", skiLocationString: "ski"
}, getLocTypeFromString: function getLocTypeFromString(entityTypeName) {
if (entityTypeName && (entityTypeName.toLowerCase() === this.locationTypeString.skiLocationString)) {
return WeatherAppJS.GeocodeLocation.locationType.skiLocation
}
else {
return WeatherAppJS.GeocodeLocation.locationType.cityLocation
}
}, createGeocodeLocation: function createGeocodeLocation(locationData) {
try {
return new WeatherAppJS.GeocodeLocation(locationData)
}
catch(exp) {
return null
}
}, getCountryRegionCode: function getCountryRegionCode(countryRegion) {
if (countryRegion && WeatherAppJS.GeocodeLocation._countryCodesList) {
return WeatherAppJS.GeocodeLocation._countryCodesList[countryRegion]
}
}, init: function init() {
var countryRegionCodesFile="resources/countryRegionCodes.json";
WinJS.xhr({url: countryRegionCodesFile}).then(function(request) {
try {
WeatherAppJS.GeocodeLocation._countryCodesList = JSON.parse(request.responseText)
}
catch(ex) {
WeatherAppJS.GeocodeLocation._countryCodesList = {}
}
}, function(ex) {
WeatherAppJS.GeocodeLocation._countryCodesList = {}
})
}
})});
WeatherAppJS.GeocodeLocation.init()
})()