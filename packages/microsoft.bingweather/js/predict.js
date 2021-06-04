/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
WinJS.Namespace.define("WeatherAppJS.Geo.Locations", {
_baseUrl: null, _queryService: null, _provider: null, _appId: null, _regionCode: null, _language: null, _market: null, _dataset: null, initPrediction: function initPrediction(provider) {
var marketization=Platform.Globalization.Marketization;
var useTianQi=Platform.Utilities.Globalization.isFeatureEnabled("UseTianQi");
this._provider = (provider) ? provider.toLowerCase() : "bp";
this._regionCode = marketization.getMarketLocation();
this._language = marketization.getQualifiedLanguageString();
this._market = (useTianQi) ? marketization.getCurrentMarket().toLowerCase() : this.getBingPredictCultureCode();
this._dataset = PlatformJS.Services.appConfig.getString("AutosuggestDataset");
if (this._provider === "as") {
this._baseUrl = PlatformJS.Services.appConfig.getString("PredictAutoSuggestProviderHost");
this._queryService = new PlatformJS.DataService.QueryService("PredictAutoSuggestProviderUrl")
}
else {
this._baseUrl = PlatformJS.Services.appConfig.getString("PredictDefaultProviderHost");
this._appId = PlatformJS.Services.appConfig.getString("PredictAppId");
this._queryService = new PlatformJS.DataService.QueryService("PredictDefaultProviderUrl")
}
}, getBingPredictCultureCode: function getBingPredictCultureCode() {
var loc=Platform.Globalization.Marketization.getCurrentMarketInfo().geographicRegion;
if (loc) {
var language=Platform.Globalization.Marketization.getQualifiedLanguage();
var market=Platform.Globalization.Marketization.deriveDefaultMarket(language, loc);
if (market && market.valueAsString && market.valueAsString !== "row") {
return market.valueAsString.toLowerCase()
}
}
return "en-ww"
}, getPredictionsAsync: function getPredictionsAsync(query, page_size, page_offset) {
var that=this;
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("host", that._baseUrl);
urlParams.insert("query", encodeURIComponent(query));
urlParams.insert("dataset", that._dataset);
if (that._provider === "as") {
urlParams.insert("market", that._market)
}
else {
urlParams.insert("language", that._language);
urlParams.insert("region", that._regionCode);
urlParams.insert("appId", that._appId);
urlParams.insert("pageSize", (page_size) ? page_size : "");
urlParams.insert("pageOffset", (page_offset) ? page_offset : "")
}
var options=new Platform.DataServices.QueryServiceOptions;
options.useCompatDataModel = true;
options.enableAutoRefresh = false;
return new WinJS.Promise(function(c, e) {
that._queryService.downloadDataAsync(urlParams, null, null, options).then(function(request) {
var locations=[];
try {
locations = that.parseResponse(request.dataString, that._provider);
c(locations)
}
catch(ex) {
e(ex)
}
}, function(ex) {
if (PlatformJS.Utilities.isPromiseCanceled(ex)) {
return
}
e(ex);
return
})
})
}, parseResponse: function parseResponse(dataString, provider) {
var response=JSON.parse(dataString);
var locations=[];
if (provider === "bp") {
if (response && response["suggests"]) {
var suggestions=response["suggests"];
for (var s in suggestions) {
var locationObj={};
var loc=suggestions[s];
locationObj.name = loc.Name || "";
locationObj.state = loc.State || "";
locationObj.country = loc.Country || "";
locationObj.isoCode = loc.isoCode || "";
locationObj.latitude = loc.Location.La;
locationObj.longitude = loc.Location.Lo;
locationObj.type = loc.Type;
locationObj.score = loc.Score || 9999;
locationObj.source = "predict";
locations.push(locationObj)
}
}
}
else if (provider === "as") {
var autoSuggestResponse=response;
if (autoSuggestResponse && autoSuggestResponse.AS) {
var results=autoSuggestResponse.AS.Results;
if (results && results.length > 0) {
for (var i=0; i < results.length; i++) {
var rObj=results[i];
if (rObj && rObj.Suggests && rObj.Suggests.length > 0) {
for (var j=0; j < rObj.Suggests.length; j++) {
var sObj=rObj.Suggests[j];
if (sObj && sObj.Txt) {
var parts=sObj.Txt.split('_');
if (parts && parts.length > 0) {
var autoSuggestLocation={};
autoSuggestLocation.name = parts[0] || "";
autoSuggestLocation.state = parts[2] || "";
autoSuggestLocation.country = parts[3] || "";
autoSuggestLocation.isoCode = parts[4] || "";
autoSuggestLocation.latitude = parts[5] || "";
autoSuggestLocation.longitude = parts[6] || "";
autoSuggestLocation.id = parts[7] || null;
autoSuggestLocation.type = parts[1] || "";
autoSuggestLocation.score = 9999;
autoSuggestLocation.source = "autosuggest";
locations.push(autoSuggestLocation)
}
}
}
}
}
}
}
}
return locations
}
})
})()