/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
var MAX_SEARCH_RESULTS=12;
WinJS.Namespace.define("WeatherAppJS.Search", {SearchPage: WinJS.Class.define(function(state) {
msWriteProfilerMark("WeatherApp:SearchPageLoad:s");
var that=this;
var searchActions=WeatherAppJS.Search.Actions;
CommonJS.setTheme("searchPageBackground", true);
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NumDisambiguationPageLaunched");
if (!state || !state.query) {
return
}
this.eventObject = state.event;
this.queryText = state.query;
this.searchAction = state.searchAction;
if (!state.searchAction) {
this.searchAction = searchActions.SearchLocation
}
else if (this.searchAction === searchActions.AddLocation) {
this.searchAction = searchActions.AddLocationDisambiguationPage
}
else if (this.searchAction === searchActions.SetDefault) {
this.searchAction = searchActions.SetDefaultDisambiguationPage
}
this._searchResults = new WinJS.Binding.List;
this._skiSuggestions = [];
CommonJS.Progress.showProgress(CommonJS.Progress.headerProgressType);
that.populateSearchResults();
this.searchResultInvoked = function(eventObject) {
if (!that._searchResultInvokedFlag) {
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NumDisambiguatedLocPicked");
that._setSearchResultInvokedTimeout();
that._searchResultInvokedFlag = true;
CommonJS.Progress.showProgress(CommonJS.Progress.headerProgressType);
eventObject.detail.itemPromise.then(function(item) {
var geoLoc=item.data.geocodeLocation;
var locnName="";
if (geoLoc) {
locnName = geoLoc.getFullDisplayName()
}
var eventAttr={location: locnName};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Search Results", "Location", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.select, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr));
that._searchResultInvokedPromise = WeatherAppJS.LocationsManager.tryFetchingCCDataAsync(geoLoc, false).then(function(responseData) {
that._clearSearchResultInvokedTimeout();
try {
that._searchResultInvokedFlag = false;
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
WeatherAppJS.Search.openLocationPage(responseData.locationObject, that.searchAction, null)
}
catch(ex) {
that._searchResultInvokedError(locnName)
}
}, function(err) {
that._clearSearchResultInvokedTimeout();
if (!(err instanceof Error && err.message === "Canceled")) {
that._searchResultInvokedError(locnName);
if (geoLoc) {
WeatherAppJS.Utilities.Common.instrumentLocation("SearchByTextFailure", geoLoc.latitude, geoLoc.longitude, geoLoc.fullName)
}
}
else {
that._searchResultInvokedFlag = false;
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType)
}
})
}, function() {
that._searchResultInvokedError("")
})
}
};
msWriteProfilerMark("WeatherApp:SearchPageLoad:e")
}, {
_suggestions: {}, _searchResultInvokedFlag: false, _searchResultInvokedPromise: null, _fetchVESearchResultsPromise: null, _fetchPredictSuggestionsPromise: null, _searchResultInvokedTimeout: null, _skiSuggestions: null, getPageImpressionContext: function getPageImpressionContext() {
return WeatherAppJS.Instrumentation.PageContext.SearchDisambiguation
}, _setSearchResultInvokedTimeout: function _setSearchResultInvokedTimeout() {
var that=this;
that._searchResultInvokedTimeout = setTimeout(function() {
that._searchResultInvokedTimeout = null;
if (that._searchResultInvokedPromise) {
that._searchResultInvokedPromise.cancel();
that._searchResultInvokedPromise = null
}
that._searchResultInvokedError("")
}, 5000)
}, _clearSearchResultInvokedTimeout: function _clearSearchResultInvokedTimeout() {
if (this._searchResultInvokedTimeout) {
clearTimeout(this._searchResultInvokedTimeout);
this._searchResultInvokedTimeout = null
}
}, _searchResultInvokedError: function _searchResultInvokedError(locationName) {
this._searchResultInvokedFlag = false;
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
if (WeatherAppJS.Networking.internetAvailable === true) {
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString("WeatherDataNotAvailable"), false);
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NoWeatherDataForLocation")
}
else {
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString("NoInternetConnectionError"), false)
}
}, getSearchBoxData: function getSearchBoxData() {
return new WinJS.Promise.wrap({options: {
autoSuggestionDataProvider: WeatherAppJS.Search, searchHandler: WeatherAppJS.Search.SuggestionOnEnterHandler, suggestionChosenHandler: WeatherAppJS.Search.suggestionHandler, focusOnKeyboardInput: true, chooseSuggestionOnEnter: false, searchHistoryDisabled: WeatherAppJS.SettingsManager.getEnableSearchHistory() ? false : true, startMinimized: true
}})
}, populateSearchResults: function populateSearchResults() {
var that=this;
that._suggestions = {};
var fetchLocalAutoSuggestResults=function() {
WeatherAppJS.LocationSuggest.getLocalSuggestionsAsync(that.queryText).then(function(suggestions) {
that._processAutoSuggestResults(suggestions);
msWriteProfilerMark("WeatherApp:SearchPageLoad:LocalResultsLoaded")
}, function() {
that._fetchSuggestionsComplete("LocationSearchFetchError")
})
};
var isPredictEnabled=PlatformJS.Services.appConfig.getBool("UsePredict");
if (isPredictEnabled) {
that._fetchPredictSuggestionsPromise = WeatherAppJS.LocationSuggest.getPredictSuggestionsAsync(that.queryText).then(function(suggestions) {
if (suggestions && suggestions.length > 0) {
that._processAutoSuggestResults(suggestions);
msWriteProfilerMark("WeatherApp:SearchPageLoad:BingPredictResultsLoaded")
}
else {
that.fetchVESearchResults()
}
}, function(err) {
if (err instanceof Error && err.message === "Canceled" && !that._fetchPredictSuggestionsPromise) {
that._fetchSuggestionsComplete()
}
else {
that.fetchVESearchResults()
}
})
}
else {
fetchLocalAutoSuggestResults()
}
}, _processAutoSuggestResults: function _processAutoSuggestResults(suggestionsList) {
var that=this;
var trimLatLong=WeatherAppJS.Utilities.Common.trimLatLong;
suggestionsList = (suggestionsList.length > MAX_SEARCH_RESULTS) ? suggestionsList.slice(0, MAX_SEARCH_RESULTS) : suggestionsList;
suggestionsList.forEach(function(s) {
var geocodeLocation=WeatherAppJS.GeocodeLocation.createGeocodeLocation(s);
if (geocodeLocation) {
var displayNames=geocodeLocation.getTwoLineDisplayName();
that._suggestions[geocodeLocation.fullName] = geocodeLocation;
var latlong=[trimLatLong(geocodeLocation.latitude), trimLatLong(geocodeLocation.longitude)].join();
that._suggestions[latlong] = geocodeLocation;
var id=[geocodeLocation.city, trimLatLong(geocodeLocation.latitude, 1), trimLatLong(geocodeLocation.longitude, 1)].join();
that._suggestions[id] = geocodeLocation;
if (geocodeLocation.locType === WeatherAppJS.GeocodeLocation.locationType.skiLocation) {
that._skiSuggestions.push(geocodeLocation)
}
var item,
isReversed=PlatformJS.Services.appConfig.getBool("LocationNameFormatReversed");
var glyphClass=geocodeLocation.locType === WeatherAppJS.GeocodeLocation.locationType.skiLocation ? "skiGlyph" : "";
if (isReversed) {
item = {
geocodeLocation: geocodeLocation, Title: displayNames[1], Subtitle: displayNames[0], cName: glyphClass
}
}
else {
item = {
geocodeLocation: geocodeLocation, Title: displayNames[0], Subtitle: displayNames[1], cName: glyphClass
}
}
that._searchResults.push(item)
}
});
if (suggestionsList.length < MAX_SEARCH_RESULTS) {
var resultsRequired=MAX_SEARCH_RESULTS - suggestionsList.length;
that.fetchVESearchResults(resultsRequired)
}
else {
that._fetchSuggestionsComplete()
}
}, fetchVESearchResults: function fetchVESearchResults(resultsRequiredCount) {
var that=this;
var trimLatLong=WeatherAppJS.Utilities.Common.trimLatLong;
if (!resultsRequiredCount) {
resultsRequiredCount = MAX_SEARCH_RESULTS
}
var isGeocodingAPIEnabled=Platform.Utilities.Globalization.isFeatureEnabled("VEGeocodingAPISuggestions");
if (isGeocodingAPIEnabled) {
that._fetchVESearchResultsPromise = WeatherAppJS.LocationSuggest.getVESuggestionsByName(that.queryText).then(function(cityNames) {
var resultsAdded=0;
for (var i=0; i < cityNames.length && resultsAdded < resultsRequiredCount; i++) {
var s=cityNames[i];
var latlong=[trimLatLong(s.latitude), trimLatLong(s.longitude)].join();
var id=[s.city, trimLatLong(s.latitude, 1), trimLatLong(s.longitude, 1)].join();
var canAddLocation=true;
if (!that._suggestions[s.fullName] && !that._suggestions[latlong] && !that._suggestions[id]) {
if (that._skiSuggestions.length !== 0) {
for (var j=0; j < that._skiSuggestions.length; j++) {
var locationVal=that._skiSuggestions[j];
var lat=locationVal.latitude;
var lon=locationVal.longitude;
var distance=Math.sqrt(Math.pow(Math.abs(lat - s.latitude), 2) + Math.pow(Math.abs(lon - s.longitude), 2));
if (distance < 0.1) {
canAddLocation = false;
break
}
}
}
if (canAddLocation) {
var geocodeLocation=WeatherAppJS.GeocodeLocation.createGeocodeLocation(s);
if (geocodeLocation) {
var displayNames=geocodeLocation.getTwoLineDisplayName();
that._suggestions[geocodeLocation.fullName] = geocodeLocation;
that._suggestions[id] = geocodeLocation;
var item,
isReversed=PlatformJS.Services.appConfig.getBool("LocationNameFormatReversed");
var glyphClass=geocodeLocation.locType === WeatherAppJS.GeocodeLocation.locationType.skiLocation ? "skiGlyph" : "";
if (isReversed) {
item = {
geocodeLocation: geocodeLocation, Title: displayNames[1], Subtitle: displayNames[0], cName: glyphClass
}
}
else {
item = {
geocodeLocation: geocodeLocation, Title: displayNames[0], Subtitle: displayNames[1], cName: glyphClass
}
}
that._searchResults.push(item);
resultsAdded++
}
}
}
}
that._fetchSuggestionsComplete();
msWriteProfilerMark("WeatherApp:SearchPageLoad:VEResultsLoaded")
}, function(err) {
if (err instanceof Error && err.message === "Canceled") {
that._fetchSuggestionsComplete()
}
else {
if (!WeatherAppJS.Networking.internetAvailable) {
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString("NoInternetConnectionError", false))
}
that._fetchSuggestionsComplete()
}
})
}
else {
that._fetchSuggestionsComplete()
}
}, _fetchSuggestionsComplete: function _fetchSuggestionsComplete(errorMsg) {
if (errorMsg) {
this.showMessageOnPage(errorMsg)
}
else if (this._searchResults.length === 0) {
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NumNoSearchResults");
var eventAttr={searchQuery: this.queryText};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logContentErrorWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.high, "", "No search results corresponding to user's query", "", "", "", JSON.stringify(eventAttr));
WeatherAppJS.Utilities.Common.instrumentLocation("SearchByTextFailure", '', '', this.queryText);
this.showMessageOnPage("NoSearchResults")
}
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
msWriteProfilerMark("WeatherApp:LocationSuggestSearch:e")
}, showMessageOnPage: function showMessageOnPage(message) {
if (!this.messageDiv || !this.searchResultsDiv) {
this.messageDiv = document.querySelector("#searchErrorMsg");
this.searchResultsDiv = document.querySelector("#searchResults")
}
if (this.messageDiv && this.searchResultsDiv) {
this.messageDiv.innerText = PlatformJS.Services.resourceLoader.getString(message);
this.searchResultsDiv.style.display = "none"
}
;
}, getPageState: function getPageState() {
return {
event: this.eventObject, searchAction: this.searchAction, query: this.queryText
}
}, getPageData: function getPageData() {
var that=this;
var pageData={
headerTitle: PlatformJS.Services.resourceLoader.getString("SearchPageHeaderTitle").format(that.queryText), headerSubTitle: PlatformJS.Services.resourceLoader.getString("SearchPageHeaderSubTitle"), searchResultsDataSource: that._searchResults.dataSource, searchResultTemplate: document.querySelector(".itemtemplate"), displayAddLocationButton: (this.searchAction === WeatherAppJS.Search.Actions.SearchLocation) ? "none" : "", addLocationClicked: WinJS.UI.eventHandler(function() {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Search Results", "Add Location", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0);
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NumAddAnotherLocButtonClicked");
if (that.searchAction === WeatherAppJS.Search.Actions.DetectedLocationConfirm) {
that.searchAction = WeatherAppJS.Search.Actions.SearchLocation
}
WeatherAppJS.Search.showQuickSearchDialog("searchPageHeader", that.searchAction)
}), handleKeyboardInvocation: WeatherAppJS.Utilities.TabIndexManager.HandleKeyboardInvocation
};
return WinJS.Promise.wrap(pageData)
}, onBindingComplete: function onBindingComplete() {
var searchResultsListView=document.querySelector("#searchResults").winControl;
WinJS.UI.setOptions(searchResultsListView, {oniteminvoked: this.searchResultInvoked});
var addCityButton=document.querySelector('.addCityButton');
if (addCityButton) {
PlatformJS.Utilities.enablePointerUpDownAnimations(addCityButton)
}
document.body.focus();
this.initializeEdgyActionHandlers()
}, initializeEdgyActionHandlers: function initializeEdgyActionHandlers() {
if (this._isEdgyActionHandlersInitialized) {
return
}
this._isEdgyActionHandlersInitialized = true;
var bEdgyElement=document.getElementById("searchPageEdgy");
this._bEdgy = bEdgyElement.winControl;
this._helpButton = bEdgyElement.querySelector("#helpButton");
var that=this;
if (this._helpButton && this._helpButton.winControl) {
this._helpButton.winControl.label = CommonJS.resourceLoader.getString("/platform/HelpLabel");
this._helpButton.addEventListener("click", function(e) {
WeatherAppJS.Utilities.UI.openInAppHelp()
})
}
}, onNavigateAway: function onNavigateAway() {
this._destroySearchPage()
}, _destroySearchPage: function _destroySearchPage() {
this._clearSearchResultInvokedTimeout();
if (this._searchResultInvokedPromise) {
this._searchResultInvokedPromise.cancel()
}
if (this._fetchVESearchResultsPromise) {
this._fetchVESearchResultsPromise.cancel()
}
if (this._fetchPredictSuggestionsPromise) {
var p=this._fetchPredictSuggestionsPromise;
this._fetchPredictSuggestionsPromise = null;
p.cancel()
}
}
})})
})()