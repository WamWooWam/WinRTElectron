/*  © Microsoft. All rights reserved. */
(function(global) {
'use strict';
WinJS.Namespace.define("WeatherAppJS.Pages", {Home: WinJS.Class.derive(WeatherAppJS.Core.WeatherPanoramaBasePage, function Home_ctor(state) {
msWriteProfilerMark("WeatherApp:Home:Load:s");
CommonJS.Progress.showProgress(CommonJS.Progress.headerProgressType);
if (state && (WeatherAppJS.LocationsManager.getDefaultLocation() === undefined)) {
WeatherAppJS.SettingsManager.setDefaultLocationAsync(state.geocodeLocation, true).then(null, function(e) {
if (e.errorcode === WeatherAppJS.ErrorCodes.SettingsManager.FAVORITES_MAX_LIMIT_REACHED) {
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString("MaxFavoritesLimitReached"), false)
}
else if (e.errorcode === WeatherAppJS.ErrorCodes.SettingsManager.LOCATION_PINNED_TO_START) {
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString("LocationPinnedToStart"), false)
}
})
}
WeatherAppJS.Core.WeatherPanoramaBasePage.call(this, state);
var that=this;
var locID=null;
this._isHome = false;
if (!state || (state && state.isHome) || !WeatherAppJS.LocationsManager.getDefaultLocation()) {
this._isHome = true
}
else {
locID = state.locID;
var geoLoc=state.geocodeLocation;
if (!locID) {
this._isHome = true
}
else if (!WeatherAppJS.GeocodeCache.getLocation(locID)) {
if (geoLoc && locID === geoLoc.getId()) {
var geocodeLocation=WeatherAppJS.GeocodeLocation.createGeocodeLocation(geoLoc);
WeatherAppJS.GeocodeCache.addLocation(geocodeLocation)
}
else {
this._isHome = true
}
}
else if (locID === WeatherAppJS.SettingsManager.getDefaultLocationId()) {
this._isHome = true
}
}
if (this._isHome) {
document.querySelector(".mainActionBarLeft-NotOnHome").style.display = "none"
}
if (!this._isHome) {
this._locID = locID;
this._geoLoc = WeatherAppJS.GeocodeCache.getLocation(locID)
}
else {
this._locID = WeatherAppJS.LocationsManager.getDefaultLocation()
}
if (state && state.searchingLocation === true) {
this._searchingLocation = true;
this._edgyShownAfterNavigation = false
}
this._bindablePageRefreshFn = this.onPageRefresh.bind(this);
this._bindableNetworkOnlineFn = this.onNetworkOnline.bind(this);
this._bindableAddLocationFlyoutHideFn = this.onAddLocationFlyoutHide.bind(this);
this._bindableDefaultLocationUpdatedFn = this.onDefaultLocationUpdated.bind(this);
this._bindableSamePageNavFn = this.onSamePageNav.bind(this);
this._bindableFirstViewRealizedFn = this.onFirstViewRealized.bind(this);
this._detailsImpl = WeatherAppJS.Pages.DetailsPage.DetailsImplFactory.create(this._locID);
this._state = state || {};
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
msWriteProfilerMark("WeatherApp:Home:Load:e");
CommonJS.WindowEventManager.getInstance().addEventListener('samePageNav', this._bindableSamePageNavFn, false);
WeatherAppJS.Networking.addEventListener('networkonline', this._bindableNetworkOnlineFn, false)
}, {
_locID: null, _geoLoc: null, _isHome: true, _bypassCache: false, _isPageDestroyed: false, _detailsImpl: null, _nextStepsRenderPromise: null, _gettingStartedRenderPromise: null, _isPageRefreshInProgress: false, getPageImpressionContext: function getPageImpressionContext() {
var pageContext;
if (this._isHome) {
pageContext = WeatherAppJS.Instrumentation.PageContext.Home
}
else {
pageContext = this._detailsImpl.getPageContext()
}
return pageContext
}, getPageState: function getPageState() {
var state={};
if (!this._isHome) {
var locID=this._locID;
var geoLoc=this._geoLoc;
if (!geoLoc) {
geoLoc = WeatherAppJS.GeocodeCache.getLocation(locID)
}
if (locID && geoLoc) {
state = {
locID: locID, geocodeLocation: geoLoc
}
}
}
var pano=this._panoramaControl;
var panoState=pano ? pano.getPanoramaState() : null;
state.panoramaState = panoState;
return state
}, getPageData: function getPageData() {
var that=this;
if (that._detailsImpl) {
that._detailsImpl.clearPageClass()
}
var createDetailsImpl=function() {
that._detailsImpl = WeatherAppJS.Pages.DetailsPage.DetailsImplFactory.create(that._locID);
that._detailsImpl.setTheme();
that._detailsImpl.setPageClass()
};
if (WeatherAppJS.SettingsManager.isFRE() && WeatherAppJS.WarmBoot.Cache.isFeatureEnabled("UsePDP") && !WeatherAppJS.SettingsManager.IsPDPRead) {
return new WinJS.Promise(function(complete, error, progress) {
WeatherAppJS.SettingsManager.pdpReadCompletedPromise().then(function() {
if (!WeatherAppJS.SettingsManager.isFRE() && !that._locID) {
that._locID = WeatherAppJS.SettingsManager.getDefaultLocationId()
}
createDetailsImpl();
that._getDataPromise = that._detailsImpl.getPageData(that).then(function(data) {
complete(data)
}, function(e) {
error(e)
}, function() {
progress()
})
})
})
}
else {
createDetailsImpl();
that._getDataPromise = that._detailsImpl.getPageData(that);
return that._getDataPromise
}
}, getSearchBoxData: function getSearchBoxData() {
return new WinJS.Promise.wrap({options: {
autoSuggestionDataProvider: WeatherAppJS.Search, searchHandler: WeatherAppJS.Search.SuggestionOnEnterHandler, suggestionChosenHandler: WeatherAppJS.Search.suggestionHandler, focusOnKeyboardInput: PlatformJS.mainProcessManager.retailModeEnabled ? false : true, chooseSuggestionOnEnter: false, searchHistoryDisabled: WeatherAppJS.SettingsManager.getEnableSearchHistory() ? false : true, startMinimized: true
}})
}, onBindingComplete: function onBindingComplete() {
if (!this._isPageDestroyed) {
WinJS.Resources.processAll();
var p=WeatherAppJS.Services.mainProcessManager.processListener;
var loc=WeatherAppJS.GeocodeCache.getLocation(this._locID);
if (p._launchMode) {
this._logSearch(PlatformJS.Telemetry.searchMethod.view, p._launchMode, loc, false);
p._launchMode = null
}
if (this._state) {
if (this._state.formCode) {
var method=this._state.method ? this._state.method : PlatformJS.Telemetry.searchMethod.view;
this._logSearch(method, this._state.formCode, loc, this._state.searchingLocation);
this._state.formCode = this._state.method = null
}
if (this._state.isNavBarEvent) {
this._logSearch(PlatformJS.Telemetry.searchMethod.view, WeatherAppJS.Instrumentation.FormCodes.TopEdgy, loc, false);
this._state.isNavBarEvent = false
}
}
WeatherAppJS.SettingsManager.addEventListener('defaultlocationupdated', this._bindableDefaultLocationUpdatedFn, false);
if (this._panoramaControl) {
this._panoramaControl.addEventListener('afterFirstView', this._bindableFirstViewRealizedFn, false)
}
this.cleanPeriodicTimersStack();
var dataRefreshTimerId=setInterval(this._bindablePageRefreshFn, WeatherAppJS.WarmBoot.Cache.getString("PageRefreshTime"));
this._timersStack.push(dataRefreshTimerId);
WeatherAppJS.Networking.networkChangeCallback = null;
this.initializeEdgyActionHandlers();
this.updateAllEdgyButtons(this._locID)
}
}, _logSearch: function _logSearch(method, formCode, loc, searchingLocation) {
PlatformJS.deferredTelemetry(function() {
if (searchingLocation) {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logSearch(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, loc.getFullDisplayName(), "Bing", method, true, -1, true, true, false, formCode, loc.latitude + ' - ' + loc.longitude)
}
else {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logSearch(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, loc.getFullDisplayName(), "Bing", method, true, -1, false, true, false, formCode, loc.latitude + ' - ' + loc.longitude)
}
})
}, onPageRefresh: function onPageRefresh(bypassCache) {
var that=this;
if (!that._isPageRefreshInProgress) {
that._isPageRefreshInProgress = true;
bypassCache = (bypassCache) || false;
that._bypassCache = bypassCache;
if (that._panoramaControl) {
that._panoramaControl.panoramaState = that._panoramaControl.getPanoramaState()
}
if (WeatherAppJS.Networking.internetAvailable === true && !PlatformJS.mainProcessManager.retailModeEnabled) {
msWriteProfilerMark("WeatherApp:Home:Refresh:s");
CommonJS.Error.removeError();
var clusters=WeatherAppJS.Controls.Utilities.getClusterControlsInsidePagePano();
for (var i in clusters) {
var cluster=clusters[i];
if (cluster.dispose) {
cluster.dispose()
}
}
if (WeatherAppJS.UI && WeatherAppJS.UI.HWChartManager) {
WeatherAppJS.UI.HWChartManager.clearHWCluster()
}
that._isFirstViewRealized = false;
WeatherAppJS.Controls.Utilities.cancelPromise(that._getDataPromise);
that._clusterDefs = [];
that._data = new WinJS.Binding.List;
if (that._panoramaControl) {
that._panoramaControl.clusterDataSource = that._data.dataSource
}
WeatherAppJS.SettingsManager.readPDPDataAsync(bypassCache).then(function() {
CommonJS.forceRefresh()
}, function() {
CommonJS.forceRefresh()
});
msWriteProfilerMark("WeatherApp:Home:Refresh:e")
}
}
}, onSettingsChange: function onSettingsChange(e) {
var that=this;
if (e.detail.setting === "unitChange") {
msWriteProfilerMark("WeatherApp:Home:SettingChange:s");
that.onPageRefresh(true);
msWriteProfilerMark("WeatherApp:Home:SettingChange:e")
}
}, onNetworkOnline: function onNetworkOnline() {
var that=this;
that._isPageRefreshInProgress = false;
if (WeatherAppJS.SettingsManager.isFRE() || !WeatherAppJS.LocationsManager.getDefaultLocation()) {
WeatherAppJS.SettingsManager.readPDPDataAsync().then(function() {
if (!WeatherAppJS.LocationsManager.getDefaultLocation()) {
that.freScenario()
}
else {
that._locID = WeatherAppJS.SettingsManager.getDefaultLocationId();
that._geoLoc = WeatherAppJS.GeocodeCache.getLocation(that._locID);
WeatherAppJS.SettingsManager.setIsFREAsync(false).then();
that.onPageRefresh()
}
}, function() {
if (!WeatherAppJS.LocationsManager.getDefaultLocation()) {
that.freScenario()
}
else {
that._locID = WeatherAppJS.SettingsManager.getDefaultLocationId();
that._geoLoc = WeatherAppJS.GeocodeCache.getLocation(this._locID);
WeatherAppJS.SettingsManager.setIsFREAsync(false).then();
that.onPageRefresh()
}
})
}
else {
that.onPageRefresh()
}
}, freScenario: function freScenario() {
var that=this;
if (CommonJS._messageBar) {
CommonJS._messageBar.hide()
}
if (WeatherAppJS.Networking.internetAvailable === true && !PlatformJS.mainProcessManager.retailModeEnabled) {
if (WeatherAppJS.SettingsManager.isFRE()) {
var viewManagement=Windows.UI.ViewManagement;
WeatherAppJS.LocationTracking.getCurrentLocationDataAsync().then(function(locationObj) {
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
if (locationObj.hasOwnProperty("locDetectAccuracy") && locationObj.locDetectAccuracy <= PlatformJS.Services.appConfig.getInt32("DetectedLocationAccuracyThreshold")) {
WeatherAppJS.SettingsManager.setDefaultLocationAsync(locationObj, true).then();
that._logSearch(Microsoft.Bing.AppEx.Telemetry.SearchMethod.view, WeatherAppJS.Instrumentation.FormCodes.AppLaunch, locationObj, false)
}
else {
WeatherAppJS.Utilities.UI.showAddLocationFlyout(locationObj, true, that._bindableAddLocationFlyoutHideFn)
}
WeatherAppJS.SettingsManager.setIsFREAsync(false).then();
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Location Access Dialog", "Allow", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0)
}, function(err) {
WeatherAppJS.SettingsManager.setIsFREAsync(false).then();
if (!WeatherAppJS.Error.isMarketBlockedError(err)) {
if (!(err && err.errorcode === WeatherAppJS.ErrorCodes.LocationTracking.LOCATION_TRACKING_DISABLED)) {
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString("LocationDetectionFailed"), false);
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Location Access Dialog", "Allow", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0)
}
else {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Location Access Dialog", "Block", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0)
}
WeatherAppJS.Search.showQuickSearchDialog("mainPanorama", WeatherAppJS.Search.Actions.SetDefault, that._bindableAddLocationFlyoutHideFn)
}
})
}
else {
WeatherAppJS.Search.showQuickSearchDialog("mainPanorama", WeatherAppJS.Search.Actions.SetDefault, that._bindableAddLocationFlyoutHideFn)
}
}
else {
WeatherAppJS.Utilities.UI.disableBottomEdgy("homeEdgy");
var msg=PlatformJS.Services.resourceLoader.getString("FREOfflineMessage");
var messageBar=new CommonJS.MessageBar(msg, {
level: CommonJS.MessageBarLevelError, autoHide: false
});
var bLabel=PlatformJS.Services.resourceLoader.getString("CloseButtonLabel");
messageBar.addButton(bLabel, function() {
messageBar.hide()
});
messageBar.show();
Platform.Networking.NetworkManager.addEventListener("networkstatuschanged", function() {
messageBar.hide()
})
}
}, onAddLocationFlyoutHide: function onAddLocationFlyoutHide() {
var that=this;
WeatherAppJS.Search.onAddLocationFlyoutHide();
if (!that._isPageDestroyed && !WeatherAppJS.LocationsManager.getDefaultLocation() && WeatherAppJS.Networking.internetAvailable === true) {
var presetDefaultLocation=WeatherAppJS.Utilities.Common.getPresetDefaultLocation();
WeatherAppJS.SettingsManager.setDefaultLocationAsync(presetDefaultLocation, true)
}
}, onDefaultLocationUpdated: function onDefaultLocationUpdated() {
var that=this;
if (that._isHome) {
var p=WinJS.Promise.wrap(true);
if (WeatherAppJS.SettingsManager.isFRE()) {
p = WeatherAppJS.SettingsManager.setIsFREAsync(false)
}
that._locID = WeatherAppJS.LocationsManager.getDefaultLocation();
that._promisesStack.push(p);
p.then(function() {
that.onPageRefresh(false)
})
}
}, onSamePageNav: function onSamePageNav(e) {
var that=this;
var channelIDInView=PlatformJS.Navigation.mainNavigator.channelIDInView;
if (channelIDInView === "Home" && that._locID !== WeatherAppJS.SettingsManager.getDefaultLocationId()) {
PlatformJS.Navigation.navigateToChannel('Home')
}
}, onFirstViewRealized: function onFirstViewRealized() {
var that=this;
var jsLoadPromise=WinJS.UI.Fragments.renderCopy("/html/delayedTemplate.html", null);
jsLoadPromise.done(function() {
WeatherAppJS.Services.mainProcessManager.processListener.onFirstViewRealized()
});
WeatherAppJS.SettingsManager.fetchUserDefaultRegionAsync();
if (!that._isFirstViewRealized && that._detailsImpl.firstViewRealized) {
jsLoadPromise.done(function() {
that._detailsImpl.firstViewRealized(that)
})
}
that._isFirstViewRealized = true;
var defaultLocation=WeatherAppJS.LocationsManager.getDefaultLocation();
var isFre=(WeatherAppJS.SettingsManager.isFRE() || !defaultLocation);
if (isFre) {
WeatherAppJS.SettingsManager.readPDPDataAsync().then(function() {
if (!WeatherAppJS.LocationsManager.getDefaultLocation()) {
that.freScenario()
}
else {
that._locID = WeatherAppJS.SettingsManager.getDefaultLocationId();
that._geoLoc = WeatherAppJS.GeocodeCache.getLocation(that._locID);
WeatherAppJS.SettingsManager.setIsFREAsync(false).then();
that.onPageRefresh()
}
}, function() {
if (!WeatherAppJS.LocationsManager.getDefaultLocation()) {
that.freScenario()
}
else {
that._locID = WeatherAppJS.SettingsManager.getDefaultLocationId();
that._geoLoc = WeatherAppJS.GeocodeCache.getLocation(this._locID);
WeatherAppJS.SettingsManager.setIsFREAsync(false).then();
that.onPageRefresh()
}
})
}
}, initializeEdgyActionHandlers: function initializeEdgyActionHandlers() {
if (this._isEdgyActionHandlersInitialized) {
return
}
this._isEdgyActionHandlersInitialized = true;
var bEdgyElement=document.getElementById("homeEdgy");
var bEdgy=bEdgyElement.winControl;
var tEdgy=PlatformJS.Utilities.getControl("platformNavigationBar");
this._helpButton = bEdgyElement.querySelector("#helpButton");
this._refreshButton = bEdgyElement.querySelector("#refreshButton");
this._changeUnitToFButton = bEdgyElement.querySelector("#changeUnitToFButton");
this._changeUnitToCButton = bEdgyElement.querySelector("#changeUnitToCButton");
this._changeHomeButton = bEdgyElement.querySelector("#changeHomeButton");
this._currentLocationButton = bEdgyElement.querySelector("#currentLocationButton");
var that=this;
var resourceLoader=PlatformJS.Services.resourceLoader;
if (this._helpButton && this._helpButton.winControl) {
this._helpButton.winControl.label = CommonJS.resourceLoader.getString("/platform/HelpLabel");
this._helpButton.addEventListener("click", function(e) {
WeatherAppJS.Utilities.UI.openInAppHelp()
})
}
if (this._refreshButton && this._refreshButton.winControl) {
this._refreshButton.winControl.label = PlatformJS.Services.resourceLoader.getString("RefreshButtonTitle");
this._refreshButton.addEventListener("click", function(e) {
that.onRefreshClick(e)
})
}
if (this._changeUnitToFButton && this._changeUnitToFButton.winControl) {
this._changeUnitToFButton.winControl.label = resourceLoader.getString("ChangeUnitToFButtonTitle");
this._changeUnitToFButton.addEventListener("click", function(e) {
that.onChangeUnitToFClick(e)
})
}
if (this._changeUnitToCButton && this._changeUnitToCButton.winControl) {
this._changeUnitToCButton.winControl.label = resourceLoader.getString("ChangeUnitToCButtonTitle");
this._changeUnitToCButton.addEventListener("click", function(e) {
that.onChangeUnitToCClick(e)
})
}
if (this._changeHomeButton && this._changeHomeButton.winControl) {
this._changeHomeButton.winControl.label = resourceLoader.getString("ChangeHomeButtonTitle");
this._changeHomeButton.addEventListener("click", function(e) {
that.onChangeHomeClick(e)
})
}
if (this._currentLocationButton && this._currentLocationButton.winControl) {
this._currentLocationButton.winControl.label = resourceLoader.getString("CurrentLocationButtonTitle");
this._currentLocationButton.addEventListener("click", function(e) {
that.onCurrentLocationClick(e, that._locID)
})
}
if (this._isHome) {
if (bEdgy) {
bEdgy.addEventListener("beforeshow", function(e) {
that.onBeforeShowBottomEdgy(e)
})
}
}
else {
var addButton=bEdgyElement.querySelector("#addFavoriteButton");
var removeButton=bEdgyElement.querySelector("#removeFavoriteButton");
var setDefaultButton=bEdgyElement.querySelector("#setDefaultButton");
var pinButton=bEdgyElement.querySelector("#pinButton");
var unpinButton=bEdgyElement.querySelector("#unpinButton");
if (bEdgy) {
bEdgy.addEventListener("beforeshow", function(e) {
that.updateEdgyButtons(that._locID)
});
bEdgy.addEventListener("aftershow", function(e) {
that.updateEdgyPinButtons(that._locID)
})
}
if (addButton && addButton.winControl) {
addButton.winControl.label = resourceLoader.getString("AddButtonTitle");
addButton.addEventListener("click", function(e) {
msWriteProfilerMark("WeatherApp:HomePageEdgy:AddFavorite:s");
WeatherAppJS.Utilities.Instrumentation.incrementInt32("HomePageBottomEdgyAddFavorite");
CommonJS.dismissAllEdgies();
var locationDetails=WeatherAppJS.GeocodeCache.getLocation(that._locID);
var eventAttr={location: locationDetails.getFullDisplayName()};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.ActionContext.bottomEdgy, "Add Location", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr));
WeatherAppJS.SettingsManager.addFavoriteAsync(locationDetails).then(function() {
that.updateAllEdgyButtons(that._locID);
msWriteProfilerMark("WeatherApp:HomePageEdgy:AddFavorite:e")
}, function(e) {
if (e.errorcode === WeatherAppJS.ErrorCodes.SettingsManager.FAVORITES_MAX_LIMIT_REACHED) {
WeatherAppJS.Error.showMessageBar(resourceLoader.getString("MaxFavoritesLimitReached"), false)
}
that.updateAllEdgyButtons(that._locID);
msWriteProfilerMark("WeatherApp:HomePageEdgy:AddFavorite:e")
})
})
}
if (removeButton && removeButton.winControl) {
removeButton.winControl.label = resourceLoader.getString("RemoveButtonTitle");
removeButton.addEventListener("click", function(e) {
msWriteProfilerMark("WeatherApp:HomePageEdgy:RemoveFavorite:s");
WeatherAppJS.Utilities.Instrumentation.incrementInt32("HomePageBottomEdgyRemoveFavorite");
CommonJS.dismissAllEdgies();
var locationDetails=WeatherAppJS.GeocodeCache.getLocation(that._locID);
var eventAttr={location: locationDetails.getFullDisplayName()};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.ActionContext.bottomEdgy, "Remove", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr));
WeatherAppJS.SettingsManager.removeFavoriteAsync(locationDetails).then(function() {
that.updateAllEdgyButtons(that._locID);
msWriteProfilerMark("WeatherApp:HomePageEdgy:RemoveFavorite:e");
PlatformJS.Navigation.navigateToChannel('MyPlaces')
}, function(e) {
that.updateAllEdgyButtons(that._locID);
msWriteProfilerMark("WeatherApp:HomePageEdgy:RemoveFavorite:e")
})
})
}
if (setDefaultButton && setDefaultButton.winControl) {
setDefaultButton.winControl.label = resourceLoader.getString("SetDefaultButtonTitle");
setDefaultButton.addEventListener("click", function(e) {
msWriteProfilerMark("WeatherApp:HomePageEdgy:SetDefault:s");
WeatherAppJS.Utilities.Instrumentation.incrementInt32("HomePageBottomEdgySetDefault");
var newDefault=that._locID;
CommonJS.dismissAllEdgies();
var locationDetails=WeatherAppJS.GeocodeCache.getLocation(that._locID);
var eventAttr={location: locationDetails.getFullDisplayName()};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.ActionContext.bottomEdgy, "Set as Home", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr));
WeatherAppJS.SettingsManager.setDefaultLocationAsync(locationDetails).then(function() {
that._isHome = true;
that.updateAllEdgyButtons(that._locID);
msWriteProfilerMark("WeatherApp:HomePageEdgy:SetDefault:e");
PlatformJS.Navigation.mainNavigator.channelIDInView = "Home"
}, function(e) {
if (e.errorcode === WeatherAppJS.ErrorCodes.SettingsManager.FAVORITES_MAX_LIMIT_REACHED) {
WeatherAppJS.Error.showMessageBar(resourceLoader.getString("SetDefaultMaxLimitReached"), false)
}
else if (e.errorcode === WeatherAppJS.ErrorCodes.SettingsManager.LOCATION_PINNED_TO_START) {
WeatherAppJS.Error.showMessageBar(resourceLoader.getString("LocationPinnedToStart"), false)
}
that.updateAllEdgyButtons(that._locID);
msWriteProfilerMark("WeatherApp:HomePageEdgy:SetDefault:e")
})
})
}
if (pinButton && pinButton.winControl) {
pinButton.winControl.label = resourceLoader.getString("/platform/pinToStart");
pinButton.addEventListener("click", function(e) {
msWriteProfilerMark("WeatherApp:HomePageEdgy:Pin");
var toggleStickyEdgy=WeatherAppJS.Utilities.UI.toggleStickyEdgy;
toggleStickyEdgy(bEdgy, true);
toggleStickyEdgy(tEdgy, true);
WeatherAppJS.App.pinLocationAsync(pinButton, that._locID).then(function() {
toggleStickyEdgy(bEdgy, false);
toggleStickyEdgy(tEdgy, false);
that.updateEdgyPinButtons(that._locID)
}, function(e) {
toggleStickyEdgy(bEdgy, false);
toggleStickyEdgy(tEdgy, false);
if (e.errorcode && e.errorcode === WeatherAppJS.ErrorCodes.SettingsManager.PINNED_MAX_LIMIT_REACHED) {
WeatherAppJS.Error.showMessageBar(resourceLoader.getString("MaxPinnedLocationsLimitReached"), false)
}
})
})
}
if (unpinButton && unpinButton.winControl) {
unpinButton.winControl.label = resourceLoader.getString("/platform/unpinFromStart");
unpinButton.addEventListener("click", function(e) {
msWriteProfilerMark("WeatherApp:HomePageEdgy:Unpin");
var toggleStickyEdgy=WeatherAppJS.Utilities.UI.toggleStickyEdgy;
toggleStickyEdgy(bEdgy, true);
toggleStickyEdgy(tEdgy, true);
WeatherAppJS.App.unpinLocationAsync(unpinButton, that._locID).then(function() {
toggleStickyEdgy(bEdgy, false);
toggleStickyEdgy(tEdgy, false);
that.updateEdgyPinButtons(that._locID)
})
})
}
}
}, onBeforeShowBottomEdgy: function onBeforeShowBottomEdgy(e) {
var that=this;
PlatformJS.execDeferredNavigate(function() {
var useTianQi=Platform.Utilities.Globalization.isFeatureEnabled("UseTianQi");
if (!useTianQi) {
var isCurrentUnitF=(WeatherAppJS.SettingsManager.getDisplayUnit() === "F");
that.toggleShowButton(that._changeUnitToFButton, !isCurrentUnitF);
that.toggleShowButton(that._changeUnitToCButton, isCurrentUnitF)
}
var defaultLoc=WeatherAppJS.LocationsManager.getDefaultLocation();
that.toggleShowButton(that._refreshButton, defaultLoc ? true : false);
that.toggleShowButton(that._changeHomeButton, defaultLoc ? true : false);
var isCurrentLocationDetection=Platform.Utilities.Globalization.isFeatureEnabled("CurrentLocationDetection");
that.toggleShowButton(that._currentLocationButton, (isCurrentLocationDetection && defaultLoc) ? true : false)
})
}, toggleShowButton: function toggleShowButton(b, show) {
if (b) {
if (show) {
b.style.display = ""
}
else {
b.style.display = "none"
}
}
}, updateEdgyButtons: function updateEdgyButtons(locID) {
var addButton=document.getElementById("addFavoriteButton");
var removeButton=document.getElementById("removeFavoriteButton");
var setDefaultButton=document.getElementById("setDefaultButton");
var pinButton=document.getElementById("pinButton");
var unpinButton=document.getElementById("unpinButton");
var changeUnitToFButton=document.getElementById("changeUnitToFButton");
var changeUnitToCButton=document.getElementById("changeUnitToCButton");
var changeHomeButton=document.getElementById("changeHomeButton");
var defaultLoc=WeatherAppJS.SettingsManager.getDefaultLocationId();
if (defaultLoc !== locID) {
this.toggleShowButton(changeHomeButton, false);
this.toggleShowButton(setDefaultButton, true);
if (WeatherAppJS.SettingsManager.isFavorite(locID)) {
this.toggleShowButton(removeButton, true);
this.toggleShowButton(addButton, false)
}
else {
this.toggleShowButton(removeButton, false);
this.toggleShowButton(addButton, true)
}
}
else {
this.toggleShowButton(pinButton, false);
this.toggleShowButton(unpinButton, false);
this.toggleShowButton(addButton, false);
this.toggleShowButton(removeButton, false);
this.toggleShowButton(changeHomeButton, true);
this.toggleShowButton(setDefaultButton, false)
}
var useTianQi=WeatherAppJS.WarmBoot.Cache.isFeatureEnabled("UseTianQi");
if (!useTianQi) {
var isCurrentUnitF=(WeatherAppJS.SettingsManager.getDisplayUnit() === "F");
this.toggleShowButton(changeUnitToFButton, !isCurrentUnitF);
this.toggleShowButton(changeUnitToCButton, isCurrentUnitF)
}
var isCurrentLocationDetection=WeatherAppJS.WarmBoot.Cache.isFeatureEnabled("CurrentLocationDetection");
this.toggleShowButton(this._currentLocationButton, (isCurrentLocationDetection && defaultLoc) ? true : false)
}, updateEdgyPinButtons: function updateEdgyPinButtons(locID) {
var defaultLoc=WeatherAppJS.SettingsManager.getDefaultLocationId();
if (defaultLoc !== locID) {
var isLocationPinned=WeatherAppJS.App.isLocationPinned(locID);
var pinButton=document.getElementById("pinButton");
var unpinButton=document.getElementById("unpinButton");
if (pinButton && unpinButton) {
this.toggleShowButton(pinButton, !isLocationPinned);
this.toggleShowButton(unpinButton, isLocationPinned)
}
}
}, updateAllEdgyButtons: function updateAllEdgyButtons(locID) {
this.updateEdgyButtons(locID);
this.updateEdgyPinButtons(locID)
}, _disposePage: function _disposePage() {
WeatherAppJS.Networking.removeEventListener('networkonline', this._bindableNetworkOnlineFn);
WeatherAppJS.SettingsManager.removeEventListener('defaultlocationupdated', this._bindableDefaultLocationUpdatedFn);
CommonJS.WindowEventManager.getInstance().removeEventListener('samePageNav', this._bindableSamePageNavFn);
if (this._panoramaControl) {
this._panoramaControl.removeEventListener('afterFirstView', this._bindableFirstViewRealizedFn)
}
WeatherAppJS.Networking.networkChangeCallback = null;
this._data = null;
if (WeatherAppJS.UI && WeatherAppJS.UI.HWChartManager) {
WeatherAppJS.UI.HWChartManager.clearHWCluster()
}
this._isPageDestroyed = true;
if (WeatherAppJS.Utilities.UI.MapsFlyout) {
WeatherAppJS.Utilities.UI.MapsFlyout.resetFlyout()
}
clearTimeout(WeatherAppJS.Utilities.UI._hourlyScrollDetectTimer);
if (this._nextStepsRenderPromise) {
this._nextStepsRenderPromise.cancel();
this._nextStepsRenderPromise = null
}
if (this._gettingStartedRenderPromise) {
this._gettingStartedRenderPromise.cancel();
this._gettingStartedRenderPromise = null
}
this._bindableFirstViewRealizedFn = null;
this._bindableSamePageNavFn = null;
this._bindablePageRefreshFn = null;
this._bindableNetworkOnlineFn = null;
this._bindableAddLocationFlyoutHideFn = null;
this._bindableDefaultLocationUpdatedFn = null
}, addGetStartedCluster: function addGetStartedCluster() {
var that=this;
if (this._isHome && WeatherAppJS.WarmBoot.Cache.isCurrentLanguageLocationValid("getStartedLanguageLocation")) {
var gsClusterConfig=PlatformJS.BootCache.instance.getEntry("gsClusterConfig");
if (!gsClusterConfig) {
gsClusterConfig = {
clusterPosition: 1, templateName: "gsTemplate", clusterKey: "getStarted", useLocalCache: true
}
}
gsClusterConfig.dataProvider = null;
this._gettingStartedRenderPromise = CommonJS.TempCluster.insertClusterIfAllowed(this._data, gsClusterConfig).done(function() {
gsClusterConfig.dataProvider = null;
PlatformJS.BootCache.instance.addOrUpdateEntry("gsClusterConfig", gsClusterConfig)
})
}
}, addNextStepsCluster: function addNextStepsCluster() {
var that=this;
if (WeatherAppJS.SettingsManager.isFRE()) {
return
}
if (Platform.Globalization.Marketization.isCurrentLanguageLocationValid()) {
var nsClusterConfig=WeatherAppJS.Storage.Memory.getItem("nsClusterConfig");
if (!nsClusterConfig) {
nsClusterConfig = {
clusterPosition: 20, templateName: "nsTemplate", clusterKey: "nextSteps"
}
}
this._nextStepsRenderPromise = CommonJS.TempCluster.insertNextStepsCluster(this._data, nsClusterConfig).done(function() {
WeatherAppJS.Storage.Memory.cacheItem("nsClusterConfig", nsClusterConfig);
if (that._panoramaControl) {
that._panoramaControl.compactPanorama = true
}
})
}
}, _handleError: function _handleError() {
var that=this;
if (!that._isPageDestroyed) {
var errorType=(WeatherAppJS.Networking.internetAvailable === true) ? CommonJS.Error.STANDARD_ERROR : CommonJS.Error.NO_INTERNET;
CommonJS.Error.showError(errorType, function() {
that.onPageRefresh(that._bypassCache)
})
}
}
})});
WinJS.Namespace.define("WeatherAppJS.Pages.DetailsPage.DetailsImplFactory", {create: function create(locID) {
var geoLoc=WeatherAppJS.GeocodeCache.getLocation(locID);
var useTianQi=WeatherAppJS.WarmBoot.Cache.isFeatureEnabled("UseTianQi");
if (useTianQi && (!geoLoc || (geoLoc && geoLoc.isTianQiSupportedLocation()))) {
return WeatherAppJS.Pages.DetailsPage.TianQiImpl
}
if (geoLoc && geoLoc.locType === WeatherAppJS.GeocodeLocation.locationType.cityLocation) {
return WeatherAppJS.Pages.DetailsPage.CityImpl
}
else if (geoLoc && geoLoc.isSkiLocation) {
return WeatherAppJS.Pages.DetailsPage.SkiImpl
}
else {
return WeatherAppJS.Pages.DetailsPage.CityImpl
}
}});
WinJS.Namespace.define("WeatherAppJS.Pages.DetailsPage.CityImpl", {
_isClustersPushed: false, _isAdsPushed: false, _adCategory: WeatherAppJS.WarmBoot.Cache.getString("AdCategory"), _adSubCategory: WeatherAppJS.WarmBoot.Cache.getString("AdSubCategory"), getPageContext: function getPageContext() {
return WeatherAppJS.Instrumentation.PageContext.CityDetails
}, setTheme: function setTheme(page) {
CommonJS.setTheme(null, true)
}, setPageClass: function setPageClass() {
var pageContainer=document.getElementById("mainContainer");
if (pageContainer) {
WinJS.Utilities.addClass(pageContainer, "home")
}
}, clearPageClass: function clearPageClass() {
var pageContainer=document.getElementById("mainContainer");
if (pageContainer) {
WinJS.Utilities.removeClass(pageContainer, "home")
}
}, getPageData: function getPageData(page) {
var that=page;
var context=this;
var pageTitle;
var dataQuery;
var bypassCache=(that._bypassCache) || false;
WeatherAppJS.Pages.DetailsPage.CityImpl._isClustersPushed = false;
WeatherAppJS.Pages.DetailsPage.CityImpl._isAdsPushed = false;
var defaultLocation=WeatherAppJS.LocationsManager.getDefaultLocation();
var isFre=(WeatherAppJS.SettingsManager.isFRE() || !defaultLocation);
CommonJS.Progress.showProgress(CommonJS.Progress.headerProgressType);
if (isFre) {
WeatherAppJS.Utilities.UI.disableNavigationBar();
var presetDefaultLocation=WeatherAppJS.Utilities.Common.getPresetDefaultLocation();
that._locID = presetDefaultLocation.getId();
var locationDisplayName=presetDefaultLocation.getShortDisplayName(that._locID);
pageTitle = PlatformJS.Services.resourceLoader.getString("SampleDataHeader").format(locationDisplayName)
}
else {
WeatherAppJS.Utilities.UI.enableNavigationBar();
WeatherAppJS.Utilities.UI.enableBottomEdgy("homeEdgy");
that.initializeEdgyActionHandlers();
pageTitle = WeatherAppJS.GeocodeCache.getShortDisplayName(that._locID)
}
var pageData={
title: pageTitle, panoramaState: {}, showInertiaBackground: true, semanticZoomRenderer: WeatherAppJS.Utilities.Templates.getSemanticZoomTemplate
};
that._clusterDefs = [];
var p=WinJS.Promise.wrap(true);
dataQuery = WeatherAppJS.LocationsManager.getCCDataForLocationAsync;
var imageServicesQuery=WeatherAppJS.LocationsManager.getImageServicesDataForLocationAsync;
if (isFre) {
p = WeatherAppJS.SettingsManager.preFREUserDefaultRegionFetchTimeoutAsync()
}
;
return new WinJS.Promise(function(complete, error, progress) {
p.then(function() {
return WinJS.Promise.join([dataQuery(that._locID, false, isFre), imageServicesQuery(that._locID, false, isFre)])
}).then(function(data) {
if (!that._isPageDestroyed) {
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
var locObj=data[0];
if (locObj && locObj.getCurrentConditions()) {
that._lastUpdatedTime = locObj.getCurrentConditions().lastUpdatedTime;
WeatherAppJS.Utilities.Common.displayLastUpdatedTime(that);
if (PlatformJS.isPlatformInitialized) {
if (!WeatherAppJS.Pages.DetailsPage.CityImpl._isClustersPushed) {
WeatherAppJS.Pages.DetailsPage.CityImpl._pushFirstClusters(that, locObj, bypassCache, isFre);
WeatherAppJS.Pages.DetailsPage.CityImpl._pushRemainingClusters(that, locObj, bypassCache, isFre);
that._data = new WinJS.Binding.List(that._clusterDefs);
that.addGetStartedCluster();
WeatherAppJS.Pages.DetailsPage.CityImpl.addAds(that);
that.addNextStepsCluster();
pageData.clusterDataSource = that._data.dataSource;
complete(pageData)
}
}
else {
if (!WeatherAppJS.Pages.DetailsPage.CityImpl._isClustersPushed) {
WeatherAppJS.Pages.DetailsPage.CityImpl._pushFirstClusters(that, locObj, bypassCache, isFre);
that._data = new WinJS.Binding.List(that._clusterDefs);
that.addGetStartedCluster();
that._otherClustersAdded = false;
PlatformJS.platformInitializedPromise.then(function() {
that._otherClustersAdded = true;
WeatherAppJS.Pages.DetailsPage.CityImpl._pushRemainingClusters(that, locObj, bypassCache, isFre);
that._clusterDefs.reverse();
var adClusterPosition=0;
var adPosition=PlatformJS.Ads.Config.instance.adManager.getPanoFrequency();
if (adPosition && adPosition.start > 0) {
adClusterPosition = PlatformJS.Ads.getAdjustedAdClusterPosition(that._data, adPosition.start - 1)
}
var mergeBindingList=function(currentPage, locationObj) {
while (currentPage._clusterDefs.length > 0) {
var cluster=currentPage._clusterDefs.pop();
if (currentPage._data.indexOf(cluster) === -1) {
if (adClusterPosition > 0 && adClusterPosition <= currentPage._data.length) {
WeatherAppJS.Utilities.Common.addAd(currentPage, adClusterPosition);
adClusterPosition = adClusterPosition + (((adPosition && adPosition.repeat > 0) ? adPosition.repeat : 0) + 1)
}
currentPage._data.push(cluster)
}
if ((WeatherAppJS.Utilities.Common.isStale(locationObj._currentConditions.lastUpdatedTime, WeatherAppJS.WarmBoot.Cache.getString("TimeBeforeStale"))) && (cluster.clusterKey === "Cluster001" || cluster.clusterKey === "Cluster002")) {
var control=currentPage._panoramaControl.getClusterContentControl(cluster.clusterKey);
if (control) {
if (cluster.clusterKey === "Cluster001") {
control.render(true)
}
else if (WeatherAppJS.Pages.DetailsPage.CityImpl._pushHourlyDuringWarmBoot) {
control.render(true)
}
}
}
}
};
mergeBindingList(that, locObj);
that.addNextStepsCluster()
});
if (!that._otherClustersAdded) {
pageData.clusterDataSource = that._data.dataSource;
complete(pageData)
}
}
}
}
else {
that._handleError()
}
that._isPageRefreshInProgress = false
}
}, function(e) {
if (!that._isPageDestroyed) {
that._isPageRefreshInProgress = false;
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
if (PlatformJS.Utilities.isPromiseCanceled(e)) {
return WinJS.Promise.wrapError(e)
}
var errorType=(WeatherAppJS.Networking.internetAvailable === true) ? CommonJS.Error.STANDARD_ERROR : CommonJS.Error.NO_INTERNET;
CommonJS.Error.showError(errorType, function() {
that.onPageRefresh(that._bypassCache)
})
}
}, function(data) {
if (!that._isPageDestroyed && data[0]) {
var locObj=data[0];
if (locObj && locObj.getCurrentConditions()) {
that._lastUpdatedTime = locObj.getCurrentConditions().lastUpdatedTime;
WeatherAppJS.Utilities.Common.displayLastUpdatedTime(that);
WeatherAppJS.Pages.DetailsPage.CityImpl._pushFirstClusters(that, locObj, bypassCache, isFre);
WeatherAppJS.Pages.DetailsPage.CityImpl._pushRemainingClusters(that, locObj, bypassCache, isFre);
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
that._data = new WinJS.Binding.List(that._clusterDefs);
WeatherAppJS.Pages.DetailsPage.CityImpl.addAds(page);
that.addGetStartedCluster();
that.addNextStepsCluster();
pageData.clusterDataSource = that._data.dataSource;
complete(pageData)
}
else {
that._handleError()
}
}
})
}, function() {
that._isPageRefreshInProgress = false;
WeatherAppJS.Controls.Utilities.cancelPromise(p)
})
}, firstViewRealized: function firstViewRealized(page) {
var that=page;
PlatformJS.platformInitializedPromise.then(function() {
var isDailyDrilldownEnabled=WeatherAppJS.Utilities.UI.isDailyDrilldownEnabled(that._locID);
if (isDailyDrilldownEnabled) {
WeatherAppJS.DataManager.prefetchHourlyForecastDataByLatLong(that._locID)
}
})
}, addAds: function addAds(page) {
var that=page;
if (WeatherAppJS.Pages.DetailsPage.CityImpl._isAdsPushed) {
return
}
else {
WeatherAppJS.Utilities.Common.addAllAds(page);
WeatherAppJS.Pages.DetailsPage.CityImpl._isAdsPushed = true
}
}, _pushHourlyDuringWarmBoot: false, _pushHourlyCluster: function _pushHourlyCluster(page, locObj, isFre) {
var that=page;
var singleProviderOnly=WeatherAppJS.WarmBoot.Cache.getBool("SingleProviderOnly");
var showLimitedExperience=WeatherAppJS.Utilities.UI.showLimitedExperience(that._locID);
var isHourlyClusterEnabled=WeatherAppJS.WarmBoot.Cache.isFeatureEnabled("HourlyCluster");
if (!isHourlyClusterEnabled && singleProviderOnly && !showLimitedExperience) {
isHourlyClusterEnabled = true
}
if (isHourlyClusterEnabled && locObj.getCurrentConditions().isHourlyForecastAvailable) {
that.pushIntoClusterDefs(WeatherAppJS.Configs.Cluster.hourlyForecast(that._locID, false, isFre))
}
}, _pushFirstClusters: function _pushFirstClusters(page, locObj, bypassCache, isFre) {
var that=page;
var useTianQi=WeatherAppJS.WarmBoot.Cache.isFeatureEnabled("UseTianQi");
WeatherAppJS.Pages.DetailsPage.CityImpl._isClustersPushed = true;
that.pushIntoClusterDefs(WeatherAppJS.Configs.Cluster.heroOverview(that._locID, bypassCache, isFre, false));
var showGettingStartedCluster=CommonJS.TempCluster.shouldShowTempCluster();
if (!showGettingStartedCluster) {
WeatherAppJS.Pages.DetailsPage.CityImpl._pushHourlyDuringWarmBoot = true
}
else {
WeatherAppJS.Pages.DetailsPage.CityImpl._pushHourlyDuringWarmBoot = false
}
if (WeatherAppJS.Pages.DetailsPage.CityImpl._pushHourlyDuringWarmBoot) {
WeatherAppJS.Pages.DetailsPage.CityImpl._pushHourlyCluster(that, locObj, isFre)
}
}, _pushRemainingClusters: function _pushRemainingClusters(page, locObj, bypassCache, isFre) {
var that=page;
var singleProviderOnly=WeatherAppJS.WarmBoot.Cache.getBool("SingleProviderOnly");
var useTianQi=WeatherAppJS.WarmBoot.Cache.isFeatureEnabled("UseTianQi");
var showLimitedExperience=WeatherAppJS.Utilities.UI.showLimitedExperience(that._locID);
WeatherAppJS.Pages.DetailsPage.CityImpl._isClustersPushed = true;
if (!WeatherAppJS.Pages.DetailsPage.CityImpl._pushHourlyDuringWarmBoot) {
WeatherAppJS.Pages.DetailsPage.CityImpl._pushHourlyCluster(that, locObj, isFre)
}
var isInteractiveMapsEnabled=WeatherAppJS.WarmBoot.Cache.isFeatureEnabled("ShowInteractiveMaps");
WeatherAppJS.Utilities.UI.createMapRegionToIsoCodeMappingAsync();
var isMapsClusterEnabled=WeatherAppJS.WarmBoot.Cache.isFeatureEnabled("MapsCluster");
if (isMapsClusterEnabled && isInteractiveMapsEnabled) {
if ((WeatherAppJS.SettingsManager.isFRE() && WeatherAppJS.Networking.internetAvailable === false) || PlatformJS.mainProcessManager.retailModeEnabled) {
var isInteractiveMapsEnabledOfflineFRE=WeatherAppJS.WarmBoot.Cache.isFeatureEnabled("ShowInteractiveMapsOfflineFRE");
if (isInteractiveMapsEnabledOfflineFRE) {
that.pushIntoClusterDefs(WeatherAppJS.Configs.Cluster.interactiveMapsControl(that._locID, bypassCache, isFre))
}
}
else {
that.pushIntoClusterDefs(WeatherAppJS.Configs.Cluster.interactiveMapsControl(that._locID, bypassCache, isFre))
}
}
else {
if (!isMapsClusterEnabled && singleProviderOnly && !showLimitedExperience) {
isMapsClusterEnabled = true
}
if (isMapsClusterEnabled && locObj.getCurrentConditions().isMapsAvailable) {
that.pushIntoClusterDefs(WeatherAppJS.Configs.Cluster.maps(that._locID, bypassCache, isFre))
}
}
if (locObj.getCurrentConditions().isTripPlanAvailable) {
that.pushIntoClusterDefs(WeatherAppJS.Configs.Cluster.historical(that._locID, bypassCache, isFre))
}
if (!isFre && !useTianQi) {
that.pushIntoClusterDefs(WeatherAppJS.Configs.Cluster.nearbySkiResorts(that._locID, bypassCache))
}
}
});
WinJS.Namespace.define("WeatherAppJS.Pages.DetailsPage.SkiImpl", {
_isClustersPushed: false, _isAdsPushed: false, _adCategory: WeatherAppJS.WarmBoot.Cache.getString("SkiAdCategory"), _adSubCategory: WeatherAppJS.WarmBoot.Cache.getString("SkiAdSubCategory"), getPageContext: function getPageContext() {
return WeatherAppJS.Instrumentation.PageContext.SkiResorts
}, setTheme: function setTheme(page) {
CommonJS.setTheme(null, true)
}, setPageClass: function setPageClass() {
var pageContainer=document.getElementById("mainContainer");
if (pageContainer) {
WinJS.Utilities.addClass(pageContainer, "skidetails")
}
}, clearPageClass: function clearPageClass() {
var pageContainer=document.getElementById("mainContainer");
if (pageContainer) {
WinJS.Utilities.removeClass(pageContainer, "skidetails")
}
}, getPageData: function getPageData(page) {
var that=page;
var pageTitle="";
var dataQuery;
var bypassCache=(that._bypassCache) || false;
WeatherAppJS.Pages.DetailsPage.SkiImpl._isClustersPushed = false;
WeatherAppJS.Pages.DetailsPage.SkiImpl._isAdsPushed = false;
CommonJS.Progress.showProgress(CommonJS.Progress.headerProgressType);
WeatherAppJS.Utilities.UI.enableNavigationBar();
WeatherAppJS.Utilities.UI.enableBottomEdgy("homeEdgy");
that.initializeEdgyActionHandlers();
pageTitle = WeatherAppJS.GeocodeCache.getShortDisplayName(that._locID);
var pageData={
title: pageTitle, panoramaState: {}, showInertiaBackground: true, semanticZoomRenderer: WeatherAppJS.Utilities.Templates.getSemanticZoomTemplate
};
that._clusterDefs = [];
var addAds=this.addAds;
if (!PlatformJS.isPlatformInitialized) {
PlatformJS.startPlatformInitialization()
}
var skiDataPromise=PlatformJS.platformInitializedPromise.then(function() {
return WeatherAppJS.LocationsManager.getSkiDetailsAsync(that._locID, false)
});
return new WinJS.Promise(function(complete, error) {
skiDataPromise.then(function(data) {
if (!that._isPageDestroyed) {
var locObj=data;
if (locObj && locObj.getCurrentConditions()) {
that._lastUpdatedTime = locObj.getCurrentConditions().lastUpdatedTime;
that.displayLastUpdatedTime();
if (!WeatherAppJS.Pages.DetailsPage.SkiImpl._isClustersPushed) {
WeatherAppJS.Pages.DetailsPage.SkiImpl._pushClusters(page, locObj, bypassCache);
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
that._data = new WinJS.Binding.List(that._clusterDefs);
WeatherAppJS.Pages.DetailsPage.SkiImpl.addAds(page);
that.addGetStartedCluster();
that.addNextStepsCluster();
pageData.clusterDataSource = that._data.dataSource;
complete(pageData)
}
}
else {
that._handleError()
}
that._isPageRefreshInProgress = false
}
}, function(err) {
if (!that._isPageDestroyed) {
that._isPageRefreshInProgress = false;
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
if (PlatformJS.Utilities.isPromiseCanceled(err)) {
return WinJS.Promise.wrapError(err)
}
var errorType=(WeatherAppJS.Networking.internetAvailable === true) ? CommonJS.Error.STANDARD_ERROR : CommonJS.Error.NO_INTERNET;
CommonJS.Error.showError(errorType, function() {
that.onPageRefresh(that._bypassCache)
})
}
}, function(data) {
if (!that._isPageDestroyed) {
var locObj=data;
if (locObj && locObj.getCurrentConditions()) {
that._lastUpdatedTime = locObj.getCurrentConditions().lastUpdatedTime;
that.displayLastUpdatedTime();
WeatherAppJS.Pages.DetailsPage.SkiImpl._pushClusters(page, locObj, bypassCache);
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
that._data = new WinJS.Binding.List(that._clusterDefs);
WeatherAppJS.Pages.DetailsPage.SkiImpl.addAds(page);
that.addGetStartedCluster();
that.addNextStepsCluster();
pageData.clusterDataSource = that._data.dataSource;
complete(pageData)
}
else {
that._handleError()
}
}
})
}, function() {
that._isPageRefreshInProgress = false;
if (skiDataPromise && skiDataPromise.cancel) {
skiDataPromise.cancel()
}
})
}, firstViewRealized: function firstViewRealized(page) {
var isDailyDrilldownEnabled=WeatherAppJS.Utilities.UI.isDailyDrilldownEnabled(page._locID);
if (isDailyDrilldownEnabled) {
WeatherAppJS.DataManager.prefetchHourlyForecastDataByLatLong(page._locID)
}
}, addAds: function addAds(page) {
var that=page;
if (WeatherAppJS.Pages.DetailsPage.SkiImpl._isAdsPushed) {
return
}
else {
WeatherAppJS.Utilities.Common.addAllAds(page);
WeatherAppJS.Pages.DetailsPage.SkiImpl._isAdsPushed = true
}
}, _pushClusters: function _pushClusters(page, locObj, bypassCache) {
var that=page;
var singleProviderOnly=PlatformJS.Services.appConfig.getBool("SingleProviderOnly");
var showLimitedExperience=WeatherAppJS.Utilities.UI.showLimitedExperience(that._locID);
WeatherAppJS.Pages.DetailsPage.SkiImpl._isClustersPushed = true;
that.pushIntoClusterDefs(WeatherAppJS.Configs.Cluster.skiResortsHero(that._locID, bypassCache));
var skiOverview=locObj.getSkiOverview();
if (skiOverview) {
that.pushIntoClusterDefs(WeatherAppJS.Configs.Cluster.skiOverview(that._locID, false))
}
var isHourlyClusterEnabled=Platform.Utilities.Globalization.isFeatureEnabled("HourlyCluster");
if (!isHourlyClusterEnabled && singleProviderOnly && !showLimitedExperience) {
isHourlyClusterEnabled = true
}
if (isHourlyClusterEnabled && locObj.getCurrentConditions().isHourlyForecastAvailable) {
that.pushIntoClusterDefs(WeatherAppJS.Configs.Cluster.skiHourlyForecast(that._locID, bypassCache))
}
var isMapsClusterEnabled=Platform.Utilities.Globalization.isFeatureEnabled("MapsCluster");
var isInteractiveMapsEnabled=Platform.Utilities.Globalization.isFeatureEnabled("ShowInteractiveMaps");
if (isMapsClusterEnabled && isInteractiveMapsEnabled) {
that.pushIntoClusterDefs(WeatherAppJS.Configs.Cluster.interactiveMapsControl(that._locID, bypassCache, false))
}
else {
if (!isMapsClusterEnabled && singleProviderOnly && !showLimitedExperience) {
isMapsClusterEnabled = true
}
if (isMapsClusterEnabled && locObj.getCurrentConditions().isMapsAvailable) {
that.pushIntoClusterDefs(WeatherAppJS.Configs.Cluster.maps(that._locID, bypassCache))
}
}
if (skiOverview) {
if (skiOverview.isCamsAndPanosAvailable) {
that.pushIntoClusterDefs(WeatherAppJS.Configs.Cluster.skiWebcam(that._locID, false))
}
if (skiOverview.isDealsAndNewsAvailable) {
that.pushIntoClusterDefs(WeatherAppJS.Configs.Cluster.skiDeals(that._locID, false))
}
if (skiOverview.isReviewsAvailable) {
var skiReviewLocObj=locObj.getSkiReviews();
var skiReviewConfig=WeatherAppJS.Configs.Cluster.skiReviews(that._locID, false);
if (skiReviewLocObj.reviewUrl && skiReviewLocObj.reviewUrl.length > 0) {
skiReviewConfig.onHeaderSelection = skiReviewLocObj.reviewUrl[0].reviewUrlClick
}
that.pushIntoClusterDefs(skiReviewConfig)
}
}
that.pushIntoClusterDefs(WeatherAppJS.Configs.Cluster.skiNearbySkiResorts(that._locID, bypassCache))
}
});
WinJS.Namespace.define("WeatherAppJS.Pages.DetailsPage.TianQiImpl", {
_isClustersPushed: false, _isAdsPushed: false, _adCategory: WeatherAppJS.WarmBoot.Cache.getString("AdCategory"), _adSubCategory: WeatherAppJS.WarmBoot.Cache.getString("AdSubCategory"), getPageContext: function getPageContext() {
return "/TianQi"
}, setTheme: function setTheme(page) {
CommonJS.setTheme(null, true)
}, setPageClass: function setPageClass() {
var pageContainer=document.getElementById("mainContainer");
if (pageContainer) {
WinJS.Utilities.addClass(pageContainer, "tianQi")
}
}, clearPageClass: function clearPageClass() {
var pageContainer=document.getElementById("mainContainer");
if (pageContainer) {
WinJS.Utilities.removeClass(pageContainer, "tianQi")
}
}, getPageData: function getPageData(page) {
var that=page;
var pageTitle;
WeatherAppJS.Pages.DetailsPage.TianQiImpl._isAdsPushed = false;
WeatherAppJS.Pages.DetailsPage.TianQiImpl._isClustersPushed = false;
var defaultLocation=WeatherAppJS.LocationsManager.getDefaultLocation();
var isFre=(WeatherAppJS.SettingsManager.isFRE() || !defaultLocation);
if (isFre) {
WeatherAppJS.Utilities.UI.disableNavigationBar();
WeatherAppJS.Utilities.UI.disableBottomEdgy("homeEdgy");
var presetDefaultLocation=WeatherAppJS.Utilities.Common.getPresetDefaultLocation();
that._locID = presetDefaultLocation.getId();
var locationDisplayName=presetDefaultLocation.getShortDisplayName(that._locID);
pageTitle = PlatformJS.Services.resourceLoader.getString("SampleDataHeader").format(locationDisplayName)
}
else {
CommonJS.Progress.showProgress(CommonJS.Progress.headerProgressType);
WeatherAppJS.Utilities.UI.enableNavigationBar();
WeatherAppJS.Utilities.UI.enableBottomEdgy("homeEdgy");
that.initializeEdgyActionHandlers();
pageTitle = WeatherAppJS.GeocodeCache.getShortDisplayName(that._locID)
}
var pageData={
title: pageTitle, panoramaState: {}, showInertiaBackground: true, semanticZoomRenderer: WeatherAppJS.Utilities.Templates.getSemanticZoomTemplate
};
that._clusterDefs = [];
var bypassCache=(that._bypassCache) || false;
var dataQuery=WeatherAppJS.LocationsManager.getTianQiDataForLocationAsync;
var imageServicesQuery=WeatherAppJS.LocationsManager.getImageServicesDataForLocationAsync;
var fragmentPath="/panoramas/tianqi/template.html";
var p=WinJS.UI.Fragments.cache(fragmentPath);
return new WinJS.Promise(function(complete, error, progress) {
p.then(function() {
return WinJS.Promise.join([dataQuery(that._locID, false, isFre), imageServicesQuery(that._locID, false, isFre)])
}).then(function dataQueryComplete(data) {
var locObj=data[0];
if (locObj && locObj.getCurrentConditions()) {
that._lastUpdatedTime = locObj.getCurrentConditions().lastUpdatedTime;
WeatherAppJS.Utilities.Common.displayLastUpdatedTime(that);
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
if (!WeatherAppJS.Pages.DetailsPage.TianQiImpl._isClustersPushed) {
if (PlatformJS.isPlatformInitialized) {
WeatherAppJS.Pages.DetailsPage.TianQiImpl._pushFirstClusters(that, locObj, bypassCache, isFre);
WeatherAppJS.Pages.DetailsPage.TianQiImpl._pushRemainingClusters(that, locObj, bypassCache, isFre);
that._data = new WinJS.Binding.List(that._clusterDefs);
that.addGetStartedCluster();
WeatherAppJS.Pages.DetailsPage.TianQiImpl.addAds(page);
that.addNextStepsCluster();
pageData.clusterDataSource = that._data.dataSource;
complete(pageData)
}
else {
WeatherAppJS.Pages.DetailsPage.TianQiImpl._pushFirstClusters(that, locObj, bypassCache, isFre);
that._data = new WinJS.Binding.List(that._clusterDefs);
that.addGetStartedCluster();
that._otherClustersAdded = false;
PlatformJS.platformInitializedPromise.then(function() {
that._otherClustersAdded = true;
WeatherAppJS.Pages.DetailsPage.TianQiImpl._pushRemainingClusters(that, locObj, bypassCache, isFre);
that._clusterDefs.reverse();
var adClusterPosition=0;
var adPosition=PlatformJS.Ads.Config.instance.adManager.getPanoFrequency();
if (adPosition && adPosition.start > 0) {
adClusterPosition = PlatformJS.Ads.getAdjustedAdClusterPosition(that._data, adPosition.start - 1)
}
var mergeBindingList=function(currentPage, locationObj) {
while (currentPage._clusterDefs.length > 0) {
var cluster=currentPage._clusterDefs.pop();
if (currentPage._data.indexOf(cluster) === -1) {
if (adClusterPosition > 0 && adClusterPosition <= currentPage._data.length) {
WeatherAppJS.Utilities.Common.addAd(currentPage, adClusterPosition);
adClusterPosition = adClusterPosition + ((adPosition && adPosition.repeat > 0) ? adPosition.repeat : 0)
}
currentPage._data.push(cluster)
}
if ((WeatherAppJS.Utilities.Common.isStale(locationObj._currentConditions.lastUpdatedTime, WeatherAppJS.WarmBoot.Cache.getString("TimeBeforeStale"))) && (cluster.clusterKey === "Cluster001" || cluster.clusterKey === "Cluster002")) {
var control=currentPage._panoramaControl.getClusterContentControl(cluster.clusterKey);
if (control) {
if (cluster.clusterKey === "Cluster001") {
control.render(true)
}
else if (WeatherAppJS.Pages.DetailsPage.TianQiImpl._pushHourlyDuringWarmBoot) {
control.render(true)
}
}
}
}
};
mergeBindingList(that, locObj);
that.addNextStepsCluster()
});
if (!that._otherClustersAdded) {
pageData.clusterDataSource = that._data.dataSource;
complete(pageData)
}
}
}
}
else {
that._handleError()
}
that._isPageRefreshInProgress = false
}, function dataQueryError(err) {
that._isPageRefreshInProgress = false;
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
if (PlatformJS.Utilities.isPromiseCanceled(err)) {
return WinJS.Promise.wrapError(err)
}
var errorType=(WeatherAppJS.Networking.internetAvailable === true) ? CommonJS.Error.STANDARD_ERROR : CommonJS.Error.NO_INTERNET;
CommonJS.Error.showError(errorType, function() {
that.onPageRefresh(that._bypassCache)
})
}).then(function(data) {
if (data) {
var locObj=data[0];
if (locObj && locObj.getCurrentConditions()) {
that._lastUpdatedTime = locObj.getCurrentConditions().lastUpdatedTime;
WeatherAppJS.Utilities.Common.displayLastUpdatedTime(that);
WeatherAppJS.Pages.DetailsPage.TianQiImpl._pushFirstClusters(that, locObj, bypassCache, isFre);
WeatherAppJS.Pages.DetailsPage.TianQiImpl._pushRemainingClusters(that, locObj, bypassCache, isFre);
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
that._data = new WinJS.Binding.List(that._clusterDefs);
WeatherAppJS.Pages.DetailsPage.TianQiImpl.addAds(page);
that.addGetStartedCluster();
that.addNextStepsCluster();
pageData.clusterDataSource = that._data.dataSource;
complete(pageData)
}
else {
that._handleError()
}
}
})
}, function() {
WeatherAppJS.Controls.Utilities.cancelPromise(p)
})
}, _pushFirstClusters: function _pushFirstClusters(page, locObj, bypassCache, isFre) {
var that=page;
var useTianQi=WeatherAppJS.WarmBoot.Cache.isFeatureEnabled("UseTianQi");
WeatherAppJS.Pages.DetailsPage.TianQiImpl._isClustersPushed = true;
that.pushIntoClusterDefs(WeatherAppJS.Configs.Cluster.heroOverview(that._locID, bypassCache, isFre, useTianQi));
var showGettingStartedCluster=CommonJS.TempCluster.shouldShowTempCluster();
if (!showGettingStartedCluster) {
WeatherAppJS.Pages.DetailsPage.TianQiImpl._pushHourlyDuringWarmBoot = true
}
else {
WeatherAppJS.Pages.DetailsPage.TianQiImpl._pushHourlyDuringWarmBoot = false
}
if (WeatherAppJS.Pages.DetailsPage.TianQiImpl._pushHourlyDuringWarmBoot) {
WeatherAppJS.Pages.DetailsPage.TianQiImpl._pushHourlyCluster(that, locObj, isFre)
}
}, _pushRemainingClusters: function _pushRemainingClusters(page, locObj, bypassCache, isFre) {
var that=page;
var isMapsAvailable=locObj.getCurrentConditions().isMapsAvailable;
if (isMapsAvailable) {
that.pushIntoClusterDefs(WeatherAppJS.Configs.Cluster.maps(that._locID, bypassCache, isFre, true))
}
if (!isFre) {
var isNewsClusterEnabled=Platform.Utilities.Globalization.isFeatureEnabled("NewsCluster");
if (isNewsClusterEnabled) {
that.pushIntoClusterDefs(WeatherAppJS.Configs.Cluster.chinaNewsCluster())
}
var isVideosClusterEnabled=Platform.Utilities.Globalization.isFeatureEnabled("VideosCluster");
if (isVideosClusterEnabled) {
that.pushIntoClusterDefs(WeatherAppJS.Configs.Cluster.chinaVideoCluster())
}
}
var isTripPlanAvailable=locObj.getCurrentConditions().isTripPlanAvailable;
if (isTripPlanAvailable) {
that.pushIntoClusterDefs(WeatherAppJS.Configs.Cluster.historical(that._locID, bypassCache, isFre))
}
}, _pushHourlyDuringWarmBoot: false, _pushHourlyCluster: function _pushHourlyCluster(page, locObj, isFre) {
var that=page;
var isHourlyClusterEnabled=WeatherAppJS.WarmBoot.Cache.isFeatureEnabled("HourlyCluster");
if (isHourlyClusterEnabled && locObj.getCurrentConditions().isHourlyForecastAvailable) {
that.pushIntoClusterDefs(WeatherAppJS.Configs.Cluster.chinaHourlyForecast(that._locID, false, isFre))
}
}, addAds: function addAds(page) {
var that=page;
if (WeatherAppJS.Pages.DetailsPage.TianQiImpl._isAdsPushed) {
return
}
else {
WeatherAppJS.Utilities.Common.addAllAds(page);
WeatherAppJS.Pages.DetailsPage.TianQiImpl._isAdsPushed = true
}
}
})
})(WinJS)