/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
var MAX_QUERY_SUGGESTIONS=5;
WinJS.Namespace.define("WeatherAppJS.Search.Actions", {
SearchLocation: 0, AddLocation: 1, SetDefault: 2, AddLocationDisambiguationPage: 3, SetDefaultDisambiguationPage: 4, DetectedLocationConfirm: 5
});
WinJS.Namespace.define("WeatherAppJS.Search", {
_quickSearchSuggestions: [], _searchCharmSuggestions: [], _searchAction: WeatherAppJS.Search.Actions.SearchLocation, _context: "Add Location Flyout", fetchLocationData: function fetchLocationData(locationObj, action, quickSearchObj) {
var that=this;
that._toggleProgressBar(true, quickSearchObj);
WeatherAppJS.LocationsManager.tryFetchingCCDataAsync(locationObj, true).then(function(responseData) {
that._toggleProgressBar(false, quickSearchObj);
if (action === WeatherAppJS.Search.Actions.AddLocation || action === WeatherAppJS.Search.Actions.SetDefault) {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logSearch(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, locationObj.getFullDisplayName(), "Bing", Microsoft.Bing.AppEx.Telemetry.SearchMethod.form, true, -1, true, true, false, WeatherAppJS.Instrumentation.FormCodes.Search, locationObj.latitude + ' - ' + locationObj.longitude)
}
that.openLocationPage(responseData.locationObject, action, quickSearchObj);
msWriteProfilerMark("WeatherApp:LocationSuggestConfirmSelection:e")
}, function() {
that._toggleProgressBar(false, quickSearchObj);
if (WeatherAppJS.Networking.internetAvailable === true) {
that._showMessage("WeatherDataNotAvailable", quickSearchObj);
if (locationObj) {
WeatherAppJS.Utilities.Common.instrumentLocation("SearchByTextFailure", locationObj.latitude, locationObj.longitude, locationObj.fullName)
}
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NoWeatherDataForLocation")
}
else {
that._showMessage("NoInternetConnectionError", quickSearchObj)
}
msWriteProfilerMark("WeatherApp:LocationSuggestConfirmSelection:e")
})
}, quickSearchSuggestionSelected: function quickSearchSuggestionSelected(event, src) {
msWriteProfilerMark("WeatherApp:LocationSuggestConfirmSelection:s");
var that=WeatherAppJS.Search;
var locationObj=src.detectedLocation;
var isFRE=src.isFRE;
var eventAttr;
if (locationObj && event.queryText === WeatherAppJS.GeocodeCache.getFullDisplayName(locationObj.getId())) {
if (WeatherAppJS.Networking.internetAvailable === false) {
that._showMessage('NoInternetConnectionError', src);
return
}
eventAttr = {
detectedLocation: locationObj.getFullDisplayName(), accuracy: locationObj.locDetectAccuracy
};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, WeatherAppJS.Instrumentation.PageContext.ConfirmLocFlyout, "Confirm", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr));
if (WeatherAppJS.Search._searchAction === WeatherAppJS.Search.Actions.DetectedLocationConfirm) {
if (isFRE) {
WeatherAppJS.SettingsManager.setDefaultLocationAsync(locationObj, true).then()
}
else {
PlatformJS.Navigation.navigateToChannel('Home', {
locID: locationObj.getId(), geocodeLocation: locationObj, method: Microsoft.Bing.AppEx.Telemetry.SearchMethod.form, formCode: WeatherAppJS.Instrumentation.FormCodes.Search
})
}
WeatherAppJS.Utilities.UI.dismissPlatformFlyout()
}
else if ((WeatherAppJS.Search._searchAction === WeatherAppJS.Search.Actions.AddLocation) && src.detectedLocation) {
that.openLocationPage(src.detectedLocation, WeatherAppJS.Search.Actions.AddLocation, src)
}
else if ((WeatherAppJS.Search._searchAction === WeatherAppJS.Search.Actions.AddLocationDisambiguationPage) && src.detectedLocation) {
that.openLocationPage(src.detectedLocation, WeatherAppJS.Search.Actions.AddLocationDisambiguationPage, src)
}
else if ((WeatherAppJS.Search._searchAction === WeatherAppJS.Search.Actions.SetDefault) && src.detectedLocation) {
that.openLocationPage(src.detectedLocation, WeatherAppJS.Search.Actions.SetDefault, src)
}
else if ((WeatherAppJS.Search._searchAction === WeatherAppJS.Search.Actions.SetDefaultDisambiguationPage) && src.detectedLocation) {
that.openLocationPage(src.detectedLocation, WeatherAppJS.Search.Actions.SetDefaultDisambiguationPage, src)
}
}
else if (event.index !== undefined && event.index >= 0 && that._quickSearchSuggestions[event.index]) {
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NumAutoSuggestionUsed");
var loc=that._quickSearchSuggestions[event.index];
var curElement;
if (WeatherAppJS.Search._context === WeatherAppJS.Instrumentation.PageContext.ConfirmLocFlyout) {
var common=WeatherAppJS.Utilities.Common;
var trimmedLatitude=common.trimLatLong(locationObj.latitude, 2);
var trimmedLongitude=common.trimLatLong(locationObj.longitude, 2);
eventAttr = {
detectedLocation: locationObj.getFullDisplayName(), newLocation: event.queryText, detectedLocLatlong: trimmedLatitude + " - " + trimmedLongitude, newLocLatLong: loc.latitude + " - " + loc.longitude, detectedLocAccuracy: locationObj.locDetectAccuracy
};
curElement = "Change Location"
}
else {
eventAttr = {location: event.queryText};
curElement = "Auto-suggest City"
}
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, WeatherAppJS.Search._context, curElement, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr));
if (isFRE) {
WeatherAppJS.Search._searchAction = WeatherAppJS.Search.Actions.SetDefault
}
WeatherAppJS.Search.fetchLocationData(loc, WeatherAppJS.Search._searchAction, src)
}
else if (event.queryText && event.queryText.trim()) {
if (isFRE) {
WeatherAppJS.Search._searchAction = WeatherAppJS.Search.Actions.SetDefault
}
if (WeatherAppJS.Networking.internetAvailable === true || WeatherAppJS.LocationsManager.getDefaultLocation()) {
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NumDisambiguationPageLaunchedFromAddLocFlyout");
eventAttr = {
searchQuery: event.queryText, source: "Add Location Flyout"
};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logAppActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Search Results", "Search Disambiguation Page", Microsoft.Bing.AppEx.Telemetry.AppActionOperation.open, 0, JSON.stringify(eventAttr));
WinJS.Navigation.navigate({
fragment: "/panoramas/search/searchPage.html", page: "WeatherAppJS.Search.SearchPage"
}, {
event: {}, searchAction: WeatherAppJS.Search._searchAction, query: event.queryText.trim()
})
}
else {
that._showMessage("NoInternetConnectionError", src)
}
}
else {
that._toggleProgressBar(false, src);
that._showMessage("NoSearchResults", src);
msWriteProfilerMark("WeatherApp:LocationSuggestConfirmSelection:e")
}
}, searchCharmSuggestionSelected: function searchCharmSuggestionSelected(event) {
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NumSearchCharmUsed");
msWriteProfilerMark("WeatherApp:LocationSuggestConfirmSelection:s");
var that=WeatherAppJS.Search;
if (event.tag !== undefined && event.tag >= 0 && that._searchCharmSuggestions[event.tag]) {
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NumAutoSuggestionUsed");
var loc=that._searchCharmSuggestions[event.tag];
var eventAttr={location: loc.getFullDisplayName()};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.ActionContext.charms, "Auto-suggest City", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.select, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr));
that.fetchLocationData(loc, WeatherAppJS.Search.Actions.SearchLocation)
}
else {
that._toggleProgressBar(false);
that._showMessage("NoSearchResults");
msWriteProfilerMark("WeatherApp:LocationSuggestConfirmSelection:e")
}
}, searchCharmSuggestionsRequested: function searchCharmSuggestionsRequested(event) {
if (WeatherAppJS.SettingsManager.isFRE() || !WeatherAppJS.LocationsManager.getDefaultLocation()) {
return
}
var that=WeatherAppJS.Search;
that.querySuggestionsRequested(event)
}, quickSearchSuggestionsRequested: function quickSearchSuggestionsRequested(event, src) {
var that=WeatherAppJS.Search;
that.querySuggestionsRequested(event, src)
}, querySuggestionsRequested: function querySuggestionsRequested(event, src) {
var that=WeatherAppJS.Search;
if (that._lastQuery) {
var lastQuery=that._lastQuery;
that._lastQuery = null;
lastQuery.cancel()
}
if (that._timeoutHandle) {
clearTimeout(that._timeoutHandle);
that._timeoutHandle = null
}
if (!event || !event.queryText || !event.queryText.trim()) {
if (event && src) {
src.searchSuggestions = {
event: event, suggestions: []
}
}
return
}
var searchText=event.queryText.trim();
var deferral=event.request.getDeferral();
msWriteProfilerMark("WeatherApp:LocationSuggestSearch:s");
function fetchLocalSuggestions() {
WeatherAppJS.LocationSuggest.getLocalSuggestionsAsync(searchText).then(function(localSuggestions) {
that._processSuggestions(localSuggestions, event, src);
deferral.complete();
msWriteProfilerMark("WeatherApp:LocationSuggestSearch:e")
}, function() {
deferral.complete();
msWriteProfilerMark("WeatherApp:LocationSuggestSearch:e")
})
}
;
var isPredictEnabled=PlatformJS.Services.appConfig.getBool("UsePredict");
if (isPredictEnabled) {
that._timeoutHandle = setTimeout(function() {
that._lastQuery = WeatherAppJS.LocationSuggest.getPredictSuggestionsAsync(searchText).then(function(suggestions) {
if (suggestions && suggestions.length > 0) {
that._lastQuery = null;
that._processSuggestions(suggestions, event, src)
}
else {}
deferral.complete();
msWriteProfilerMark("WeatherApp:LocationSuggestSearch:e")
}, function(err) {
deferral.complete();
msWriteProfilerMark("WeatherApp:LocationSuggestSearch:e")
});
that._timeoutHandle = null
}, 200)
}
else {
fetchLocalSuggestions()
}
}, getSuggestionsAsync: function getSuggestionsAsync(searchText, queryLanguage) {
var that=WeatherAppJS.Search;
return new WinJS.Promise(function(c, e) {
if (!searchText || !searchText.trim()) {
c([]);
return
}
searchText = searchText.trim();
var isPredictEnabled=PlatformJS.Services.appConfig.getBool("UsePredict");
if (isPredictEnabled) {
var suggestionsList=[];
that._timeoutHandle = setTimeout(function() {
that._lastQuery = WeatherAppJS.LocationSuggest.getPredictSuggestionsAsync(searchText).then(function(suggestions) {
if (suggestions && suggestions.length > 0) {
that._lastQuery = null;
suggestionsList = that._processSuggestions(suggestions)
}
c(suggestionsList)
}, function(err) {
msWriteProfilerMark("WeatherApp:LocationSuggestSearch:e")
});
that._timeoutHandle = null
}, 200)
}
})
}, suggestionHandler: function suggestionHandler(eventInfo) {
var locObject=JSON.parse(eventInfo.detail.tag);
var geocodeLocation=WeatherAppJS.GeocodeLocation.createGeocodeLocation(locObject);
WeatherAppJS.Search.openLocationPage(geocodeLocation, WeatherAppJS.Search.Actions.SearchLocation, null)
}, SuggestionOnEnterHandler: function SuggestionOnEnterHandler(eventInfo) {
if (!eventInfo.query || !eventInfo.query.trim()) {
return false
}
eventInfo.query = eventInfo.query.trim();
WeatherAppJS.Search._searchAction = WeatherAppJS.Search.Actions.SearchLocation;
var eventAttr={
searchQuery: eventInfo.query, source: "Search Text Box"
};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logAppActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Search Results", "Search Disambiguation Page", Microsoft.Bing.AppEx.Telemetry.AppActionOperation.open, 0, JSON.stringify(eventAttr));
WinJS.Navigation.navigate({
fragment: "/panoramas/search/searchPage.html", page: "WeatherAppJS.Search.SearchPage"
}, {
event: {}, searchAction: WeatherAppJS.Search._searchAction, query: eventInfo.query.trim()
})
}, _processSuggestions: function _processSuggestions(localSuggestions, event, src) {
var that=WeatherAppJS.Search;
localSuggestions = (localSuggestions.length > MAX_QUERY_SUGGESTIONS) ? localSuggestions.slice(0, MAX_QUERY_SUGGESTIONS) : localSuggestions;
if (src) {
that._quickSearchSuggestions = [];
var displaySuggestions=[];
for (var i in localSuggestions) {
that._quickSearchSuggestions.push(localSuggestions[i]);
var displayName=localSuggestions[i].getFullDisplayName(true);
displaySuggestions.push({Title: displayName})
}
src.searchSuggestions = {
event: event, suggestions: displaySuggestions
};
return displaySuggestions
}
else {
that._searchCharmSuggestions = [];
var searchSuggestionCollection;
if (event) {
searchSuggestionCollection = event.request.searchSuggestionCollection
}
var cityUri=new Windows.Foundation.Uri("ms-appx:///images/autoSuggest/searchCharm.png");
var skiUri=new Windows.Foundation.Uri("ms-appx:///images/autoSuggest/searchCharmSki.png");
var cityImg=Windows.Storage.Streams.RandomAccessStreamReference.createFromUri(cityUri);
var skiImg=Windows.Storage.Streams.RandomAccessStreamReference.createFromUri(skiUri);
var isReversed=PlatformJS.Services.appConfig.getBool("LocationNameFormatReversed");
for (var suggestionIndex in localSuggestions) {
var displayNames=localSuggestions[suggestionIndex].getTwoLineDisplayName();
var img=localSuggestions[suggestionIndex].isSkiLocation ? skiImg : cityImg;
localSuggestions[suggestionIndex].type = CommonJS.Search.SearchSuggestion.SearchResultTypes.RESULT;
if (isReversed) {
localSuggestions[suggestionIndex].text = displayNames[1];
localSuggestions[suggestionIndex].detailText = displayNames[0]
}
else {
localSuggestions[suggestionIndex].text = displayNames[0];
localSuggestions[suggestionIndex].detailText = displayNames[1]
}
localSuggestions[suggestionIndex].image = img;
localSuggestions[suggestionIndex].imageAlternateText = "";
localSuggestions[suggestionIndex].tag = JSON.stringify(localSuggestions[suggestionIndex]);
that._searchCharmSuggestions.push(localSuggestions[suggestionIndex]);
if (event) {
searchSuggestionCollection.appendResultSuggestion(displayNames[0], displayNames[1], suggestionIndex, img, displayNames.join())
}
}
return that._searchCharmSuggestions
}
}, onAddLocationFlyoutHide: function onAddLocationFlyoutHide() {
msWriteProfilerMark("WeatherApp:AddLocationFlyout:Dismissed");
var that=WeatherAppJS.Search;
if (that._detectLocationPromise) {
that._detectLocationPromise.cancel();
that._detectLocationPromise = null
}
that._isLocationDetectionInProgress = false
}, detectCurrentLocation: function detectCurrentLocation(quickSearchObj, searchAction) {
var that=WeatherAppJS.Search;
msWriteProfilerMark("WeatherApp:LocationSuggestDetectCurrent:s");
if (that._isLocationDetectionInProgress) {
msWriteProfilerMark("WeatherApp:LocationSuggestDetectCurrent:e");
return
}
that._toggleProgressBar(true, quickSearchObj);
that._isLocationDetectionInProgress = true;
that._detectLocationPromise = WeatherAppJS.LocationTracking.detectAndFetchCurrentLocationDataAsync().then(function(locationObject) {
var eventAttr={
detectedLocation: locationObject.getFullDisplayName(), accuracy: locationObject.locDetectAccuracy
};
WeatherAppJS.Search._context = WeatherAppJS.Instrumentation.PageContext.ConfirmLocFlyout;
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, WeatherAppJS.Search._context, "Detect Location", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr));
var currentLocation=WeatherAppJS.SettingsManager.getCurrentLocation();
if (!currentLocation || (currentLocation.getId() !== locationObject.getId())) {
WeatherAppJS.SettingsManager.setCurrentLocationAsync(locationObject).then()
}
else {
var accuracy=locationObject.locDetectAccuracy;
locationObject = currentLocation;
locationObject.locDetectAccuracy = accuracy
}
quickSearchObj.detectedLocation = locationObject;
that._toggleProgressBar(false, quickSearchObj);
that._isLocationDetectionInProgress = false;
var searchBox=document.getElementById("SearchTextBox");
if (searchBox) {
searchBox.focus();
searchBox.value = WeatherAppJS.GeocodeCache.getFullDisplayName(locationObject.getId())
}
var addButton=document.getElementById("SearchDialog_addButton");
if (addButton) {
addButton.innerText = PlatformJS.Services.resourceLoader.getString("ConfirmButtonTitle")
}
msWriteProfilerMark("WeatherApp:LocationSuggestDetectCurrent:e")
}, function(e) {
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NumDetectCurrentLocationFailed");
that._toggleProgressBar(false, quickSearchObj);
that._isLocationDetectionInProgress = false;
var locationTracking=WeatherAppJS.ErrorCodes.LocationTracking;
if (e && e.errorcode === locationTracking.LOCATION_DETECTION_FAILED) {
that._showMessage("LocationDetectionFailed", quickSearchObj)
}
else if (e && e.errorcode === locationTracking.LOCATION_TRACKING_DISABLED) {
that._showMessage("LocationDisabledError", quickSearchObj)
}
else if (e && e.errorcode === locationTracking.NO_WEATHER_DATA) {
that._showMessage("CurrentLocDataNotAvailable", quickSearchObj);
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NoWeatherDataForLocation")
}
else if (e && e.errorcode === locationTracking.NO_INTERNET_CONNECTION) {
that._showMessage("NoInternetConnectionError", quickSearchObj)
}
else {
that._showMessage("LocDetectionUnknownError", quickSearchObj)
}
msWriteProfilerMark("WeatherApp:LocationSuggestDetectCurrent:e")
}).done(null, function(e) {
that._isLocationDetectionInProgress = false
})
}, _toggleProgressBar: function _toggleProgressBar(show, quickSearchObj) {
if (quickSearchObj) {
(show) ? quickSearchObj.showSearchProgress() : quickSearchObj.hideSearchProgress()
}
else {
(show) ? CommonJS.Progress.showProgress(CommonJS.Progress.headerProgressType) : CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType)
}
CommonJS.dismissAllEdgies()
}, _showMessage: function _showMessage(msgKey, quickSearchObj) {
if (quickSearchObj) {
quickSearchObj.message = (msgKey) ? PlatformJS.Services.resourceLoader.getString(msgKey) : ""
}
else {
if (msgKey) {
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString(msgKey), false)
}
else {
if (CommonJS.messageBar) {
CommonJS.messageBar.hide()
}
}
}
CommonJS.dismissAllEdgies()
}, showQuickSearchDialog: function showQuickSearchDialog(headerId, searchAction, onDialogHide, locationObj, isFRE) {
var that=WeatherAppJS.Search;
CommonJS.dismissAllEdgies();
msWriteProfilerMark("WeatherApp:AddLocationFlyout:Launched");
WeatherAppJS.Search._context = "Add Location Flyout";
var eventAttr;
if (searchAction === WeatherAppJS.Search.Actions.DetectedLocationConfirm) {
WeatherAppJS.Search._context = WeatherAppJS.Instrumentation.PageContext.ConfirmLocFlyout;
eventAttr = {
detectedLocation: locationObj.getFullDisplayName(), accuracy: locationObj.locDetectAccuracy
};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logAppActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, WeatherAppJS.Instrumentation.PageContext.ConfirmLocFlyout, "", Microsoft.Bing.AppEx.Telemetry.AppActionOperation.open, 0, JSON.stringify(eventAttr))
}
else {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logAppAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, WeatherAppJS.Search._context, "", Microsoft.Bing.AppEx.Telemetry.AppActionOperation.open, 0)
}
var quickSearchObj=CommonJS.SearchDialog.show({
onSearchTextEntered: WeatherAppJS.Search.quickSearchSuggestionSelected, onSearchSuggestionsRequested: WeatherAppJS.Search.quickSearchSuggestionsRequested, onHide: onDialogHide ? onDialogHide : that.onAddLocationFlyoutHide, promptText: PlatformJS.Services.resourceLoader.getString("EnterLocation"), extraButtons: Platform.Utilities.Globalization.isFeatureEnabled("CurrentLocationDetection") ? [{
icon: "iconDetectCurrentAppEx", theme: "dark", title: PlatformJS.Services.resourceLoader.getString("Home"), clickHandler: function clickHandler() {
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NumDetectCurrentLocationClicked");
WeatherAppJS.Search.detectCurrentLocation(quickSearchObj, searchAction)
}
}] : [], autoSuggestOptions: {
selectionMode: CommonJS.AutoSuggest.freeForm, invalidEntryString: PlatformJS.Services.resourceLoader.getString("searchboxInvalidEntry")
}, searchPlaceholderText: PlatformJS.Services.resourceLoader.getString("searchboxPlaceHolderTest"), detectedLocation: locationObj, isFRE: isFRE
});
var cancelButton=document.getElementById("SearchDialog_closeButton");
cancelButton.addEventListener('click', function(event) {
eventAttr = {queryText: quickSearchObj._searchBox.value};
if (WeatherAppJS.Search._context === WeatherAppJS.Instrumentation.PageContext.ConfirmLocFlyout) {
eventAttr = {
detectedLocation: quickSearchObj.detectedLocation.getFullDisplayName(), accuracy: quickSearchObj.detectedLocation.locDetectAccuracy
}
}
if (isFRE) {
var loc=WeatherAppJS.SettingsManager.getDefaultLocation();
if (loc) {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logSearch(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, loc.getFullDisplayName(), "Bing", Microsoft.Bing.AppEx.Telemetry.SearchMethod.view, true, -1, false, true, false, WeatherAppJS.Instrumentation.FormCodes.AppLaunch, loc.latitude + ' - ' + loc.longitude)
}
}
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, WeatherAppJS.Search._context, "Cancel", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr))
});
WeatherAppJS.Search._searchAction = searchAction
}, getPlatformHeaderControl: function getPlatformHeaderControl(headerId) {
var platformHeader=PlatformJS.Utilities.getControl(headerId);
if (platformHeader) {
return (platformHeader.header) ? platformHeader.header : platformHeader
}
}, openLocationPage: function openLocationPage(locObj, searchAction, quickSearchObj) {
var defaultLoc=WeatherAppJS.SettingsManager.getDefaultLocationId();
var setDefaultOverwriteFlag=(WeatherAppJS.SettingsManager.isFRE() || !defaultLoc) ? true : false;
var searchActions=WeatherAppJS.Search.Actions;
if (searchAction === searchActions.SearchLocation) {
if (defaultLoc === locObj.getId()) {
PlatformJS.Navigation.navigateToChannel('Home', {
formCode: WeatherAppJS.Instrumentation.FormCodes.Search, method: Microsoft.Bing.AppEx.Telemetry.SearchMethod.charm
});
return
}
if (WeatherAppJS.SettingsManager.getEnableSearchHistory()) {
WeatherAppJS.SettingsManager.addRecentLocationAsync(locObj).then(null, function(){})
}
PlatformJS.Navigation.navigateToChannel('Home', {
locID: locObj.getId(), geocodeLocation: locObj, searchingLocation: true, formCode: WeatherAppJS.Instrumentation.FormCodes.Search, method: Microsoft.Bing.AppEx.Telemetry.SearchMethod.charm
})
}
else if (searchAction === searchActions.AddLocation) {
WeatherAppJS.SettingsManager.addFavoriteAsync(locObj).then(null, function(e) {
if (e.errorcode === WeatherAppJS.ErrorCodes.SettingsManager.FAVORITES_MAX_LIMIT_REACHED) {
var msg=PlatformJS.Services.resourceLoader.getString("MaxFavoritesLimitReached");
WeatherAppJS.Error.showMessageBar(msg, false);
if (quickSearchObj) {
quickSearchObj.searchVisible = false
}
}
}).then(function() {
if (quickSearchObj) {
quickSearchObj.searchVisible = false
}
})
}
else if (searchAction === searchActions.AddLocationDisambiguationPage) {
WeatherAppJS.SettingsManager.addFavoriteAsync(locObj).then(function() {
PlatformJS.Navigation.navigateToChannel('MyPlaces', {disambigLocation: locObj})
}, function(e) {
if (e.errorcode === WeatherAppJS.ErrorCodes.SettingsManager.FAVORITES_MAX_LIMIT_REACHED) {
var msg=PlatformJS.Services.resourceLoader.getString("MaxFavoritesLimitReached");
WeatherAppJS.Error.showMessageBar(msg, true)
}
else {
PlatformJS.Navigation.navigateToChannel('MyPlaces')
}
})
}
else if (searchAction === searchActions.SetDefault) {
WeatherAppJS.SettingsManager.setDefaultLocationAsync(locObj, setDefaultOverwriteFlag).then(function() {
if (quickSearchObj) {
quickSearchObj.searchVisible = false
}
}, function(e) {
if (quickSearchObj) {
quickSearchObj.searchVisible = false
}
if (e.errorcode === WeatherAppJS.ErrorCodes.SettingsManager.FAVORITES_MAX_LIMIT_REACHED) {
var msg=PlatformJS.Services.resourceLoader.getString("MaxFavoritesLimitReached");
WeatherAppJS.Error.showMessageBar(msg, true)
}
else if (e.errorcode === WeatherAppJS.ErrorCodes.SettingsManager.LOCATION_PINNED_TO_START) {
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString("LocationPinnedToStart"), false)
}
})
}
else if (searchAction === searchActions.SetDefaultDisambiguationPage) {
WeatherAppJS.SettingsManager.setDefaultLocationAsync(locObj, setDefaultOverwriteFlag).then(function() {
PlatformJS.Navigation.navigateToChannel('Home', {
method: Microsoft.Bing.AppEx.Telemetry.SearchMethod.form, formCode: WeatherAppJS.Instrumentation.FormCodes.Search
})
}, function(e) {
if (e.errorcode === WeatherAppJS.ErrorCodes.SettingsManager.FAVORITES_MAX_LIMIT_REACHED) {
var msg=PlatformJS.Services.resourceLoader.getString("MaxFavoritesLimitReached");
WeatherAppJS.Error.showMessageBar(msg, true)
}
else if (e.errorcode === WeatherAppJS.ErrorCodes.SettingsManager.LOCATION_PINNED_TO_START) {
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString("LocationPinnedToStart"), false)
}
else {
PlatformJS.Navigation.navigateToChannel('Home')
}
})
}
else if (searchAction === searchActions.DetectedLocationConfirm) {
PlatformJS.Navigation.navigateToChannel('Home', {
locID: locObj.getId(), geocodeLocation: locObj, searchingLocation: true, method: Microsoft.Bing.AppEx.Telemetry.SearchMethod.form, formCode: WeatherAppJS.Instrumentation.FormCodes.Search
})
}
}
})
})()