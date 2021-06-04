/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
WinJS.Namespace.define("WeatherAppJS", {DailyForecast: WinJS.Class.derive(WeatherAppJS.WeatherPanoramaBasePage, function(state) {
msWriteProfilerMark("WeatherApp:DailyForecastPanorama:s");
if (state && state.scrollPosition) {
if (!state.panoramaState) {
state.panoramaState = {}
}
state.panoramaState.count = state.count;
state.panoramaState.scrollPosition = state.scrollPosition
}
WeatherAppJS.WeatherPanoramaBasePage.call(this, state);
this._locID = '';
if (!state || !state.locID) {
this._locID = WeatherAppJS.SettingsManager.getDefaultLocationId()
}
else {
this._locID = state.locID
}
this._state = state;
CommonJS.Progress.showProgress(CommonJS.Progress.headerProgressType);
this._locationName = WinJS.Binding.as({name: this._locID});
this._clusterKeys = {};
this._daysOfYear = [];
this._historicData = null;
this._hourlyData = null;
this._historicStringData = null;
this._pageLoadType = WeatherAppJS.PageLoadTypes.loadPageByDefault;
this.setPlatformTheme(null);
var that=this;
this.bindableRefreshClickFn = this.onRefreshClick.bind(this);
this.bindableRestartPageRefreshTimerFn = this.restartPageRefreshTimer.bind(this);
this.bindablePageRefreshFn = this.onPageRefresh.bind(this);
this.bindableInternetChangeFn = this.onInternetChange.bind(this);
WeatherAppJS.Networking.addEventListener('networkonline', this.bindableInternetChangeFn, false);
this.onSettingsChange = function(e) {
if (e.detail.setting === "unitChange") {
if (WeatherAppJS.Networking.internetAvailable === true) {
msWriteProfilerMark("WeatherApp:DailyForecastPageRefresh:s");
that._bypassCache = true;
that._daysOfYear = [];
that._clusterKeys = {};
that._pageLoadType = WeatherAppJS.PageLoadTypes.loadPageBySettingsChange;
that._loadPageData(false);
msWriteProfilerMark("WeatherApp:DailyForecastPageRefresh:e");
WeatherAppJS.Networking.networkChangeCallback = null;
that.bindableRestartPageRefreshTimerFn()
}
else {
WeatherAppJS.Networking.networkChangeCallback = that.bindableInternetChangeFn
}
}
};
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
msWriteProfilerMark("WeatherApp:DailyForecastPanorama:e")
}, {
_title: null, _state: null, _isEdgyActionHandlersInitialized: false, _bypassCache: false, _dataSources: {}, _isTripPlanAvailable: false, _isAddlModulesLoaded: false, getPageImpressionContext: function getPageImpressionContext() {
return WeatherAppJS.Instrumentation.PageContext.DayDrilldown
}, getPageData: function getPageData() {
var that=this;
that._loadPageData(that._bypassCache);
that._bypassCache = false;
var locationDisplayName=WeatherAppJS.GeocodeCache.getShortDisplayName(that._locationName.name);
if (locationDisplayName) {
that._locationName.name = locationDisplayName
}
return WinJS.Promise.wrap({
title: that._locationName, listDataSource: that._data.createSorted(function(left, right) {
if (left.clusterKey < right.clusterKey) {
return -1
}
else if (left.clusterKey === right.clusterKey) {
return 0
}
else {
return 1
}
}).dataSource, semanticZoomRenderer: WeatherAppJS.Utilities.Templates.getSemanticZoomTemplate, symbolPosition: WeatherAppJS.Utilities.Common.getDirection()
})
}, getSearchBoxData: function getSearchBoxData() {
return new WinJS.Promise.wrap({options: {
autoSuggestionDataProvider: WeatherAppJS.Search, searchHandler: WeatherAppJS.Search.SuggestionOnEnterHandler, suggestionChosenHandler: WeatherAppJS.Search.suggestionHandler, focusOnKeyboardInput: true, chooseSuggestionOnEnter: false, searchHistoryDisabled: WeatherAppJS.SettingsManager.getEnableSearchHistory() ? false : true, startMinimized: true
}})
}, getPageState: function getPageState() {
var state={};
if (this._locID) {
state.locID = this._locID
}
var pano=this._panoramaControl;
var panoState=pano ? pano.getPanoramaState() : null;
state.panoramaState = panoState;
return state
}, onBindingComplete: function onBindingComplete() {
WinJS.Resources.processAll();
this.cleanPeriodicTimersStack();
var dataRefreshTimerId=setInterval(this.bindablePageRefreshFn, PlatformJS.Services.appConfig.getString("DailyForecastPageRefreshTime"));
this._timersStack.push(dataRefreshTimerId);
this.initializeEdgyActionHandlers()
}, onInternetChange: function onInternetChange(e) {
var that=this;
if (WeatherAppJS.Networking.internetAvailable === true) {
that._daysOfYear = [];
that._clusterKeys = {};
WeatherAppJS.Networking.networkChangeCallback = null;
CommonJS.forceRefresh()
}
else {
WeatherAppJS.Networking.networkChangeCallback = that.bindableInternetChangeFn
}
}, onRefreshClick: function onRefreshClick(e) {
var that=this;
msWriteProfilerMark("WeatherApp:HomePageEdgy:Refresh");
CommonJS.dismissAllEdgies();
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NumRefreshClicked");
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.ActionContext.bottomEdgy, "Refresh", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0);
var geoLoc=WeatherAppJS.GeocodeCache.getLocation(this._locID);
if (geoLoc) {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logSearch(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, geoLoc.getFullDisplayName(), "Bing", Microsoft.Bing.AppEx.Telemetry.SearchMethod.view, false, -1, false, false, false, WeatherAppJS.Instrumentation.FormCodes.Default, geoLoc.latitude + ' - ' + geoLoc.longitude)
}
if (WeatherAppJS.Networking.internetAvailable === true) {
this.bindablePageRefreshFn(true)
}
else {
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString("NoInternetConnectionError"), false)
}
}, restartPageRefreshTimer: function restartPageRefreshTimer() {
var that=this;
this.cleanPeriodicTimersStack();
var dataRefreshTimerId=setInterval(this.bindablePageRefreshFn, PlatformJS.Services.appConfig.getString("PageRefreshTime"));
this._timersStack.push(dataRefreshTimerId)
}, onPageRefresh: function onPageRefresh(bypassCache) {
var that=this;
if (WeatherAppJS.Networking.internetAvailable === true) {
msWriteProfilerMark("WeatherApp:DailyForecastPageRefresh:s");
that.resetAllClusters();
that._daysOfYear = [];
that._clusterKeys = {};
that._loadPageData(true);
that._bypassCache = (bypassCache) || false;
msWriteProfilerMark("WeatherApp:DailyForecastPageRefresh:e");
WeatherAppJS.Networking.networkChangeCallback = null
}
else {
WeatherAppJS.Networking.networkChangeCallback = that.bindableInternetChangeFn
}
}, initializeEdgyActionHandlers: function initializeEdgyActionHandlers() {
if (this._isEdgyActionHandlersInitialized) {
return
}
this._isEdgyActionHandlersInitialized = true;
var bEdgyElement=document.getElementById("forecastEdgy");
var bEdgy=bEdgyElement.winControl;
var tEdgy=PlatformJS.Utilities.getControl("platformNavigationBar");
this._helpButton = bEdgyElement.querySelector("#helpButton");
this._refreshButton = bEdgyElement.querySelector("#refreshButton");
this._changeUnitToFButton = bEdgyElement.querySelector("#changeUnitToFButton");
this._changeUnitToCButton = bEdgyElement.querySelector("#changeUnitToCButton");
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
this._refreshButton.winControl.label = resourceLoader.getString("RefreshButtonTitle");
this._refreshButton.addEventListener("click", function(e) {
that.bindableRefreshClickFn(e)
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
if (this._currentLocationButton && this._currentLocationButton.winControl) {
this._currentLocationButton.winControl.label = resourceLoader.getString("CurrentLocationButtonTitle");
this._currentLocationButton.addEventListener("click", function(e) {
that.onCurrentLocationClick(e)
})
}
if (bEdgy) {
bEdgy.addEventListener("beforeshow", function(e) {
that.onBeforeShowBottomEdgy(e)
})
}
}, onBeforeShowBottomEdgy: function onBeforeShowBottomEdgy(e) {
var useTianQi=Platform.Utilities.Globalization.isFeatureEnabled("UseTianQi");
if (!useTianQi) {
var isCurrentUnitF=(WeatherAppJS.SettingsManager.getDisplayUnit() === "F");
WeatherAppJS.Utilities.UI.toggleShowButton(this._changeUnitToFButton, !isCurrentUnitF);
WeatherAppJS.Utilities.UI.toggleShowButton(this._changeUnitToCButton, isCurrentUnitF)
}
var isCurrentLocationDetection=Platform.Utilities.Globalization.isFeatureEnabled("CurrentLocationDetection");
WeatherAppJS.Utilities.UI.toggleShowButton(this._currentLocationButton, isCurrentLocationDetection ? true : false)
}, _disposePage: function _disposePage() {
WeatherAppJS.SettingsManager.removeEventListener('settingchanged', this.bindableSettingsChangeFn, false);
WeatherAppJS.Networking.removeEventListener('networkonline', this.bindableInternetChangeFn, false);
this._title = null;
this._clusterKeys = null;
this._daysOfYear = [];
this._historicData = null;
this._hourlyData = null;
this._historicStringData = null;
this._dataSources = null;
this._data = null;
WeatherAppJS.Networking.networkChangeCallback = null;
clearTimeout(WeatherAppJS.Utilities.UI._hourlyScrollDetectTimer)
}, _loadHistoricAveragesModule: function _loadHistoricAveragesModule(bypassCache) {
var that=this;
var historicalClusterEnabled=Platform.Utilities.Globalization.isFeatureEnabled("HistoricalWeatherCluster");
var hourlyDataPromise=WeatherAppJS.LocationsManager.getHourlyForecastDataForLocationAsync(that._locID, bypassCache);
that._promisesStack.push(hourlyDataPromise);
hourlyDataPromise.then(function(hourlyDataResponse) {
if (hourlyDataResponse && hourlyDataResponse.HourlyData) {
if ((that._lastUpdatedTime && that._lastUpdatedTime > hourlyDataResponse.LastUpdatedTime) || !that._lastUpdatedTime) {
that._lastUpdatedTime = hourlyDataResponse.LastUpdatedTime;
that.displayLastUpdatedTime()
}
that._hourlyData = hourlyDataResponse.HourlyData;
that._hourlyData.lastUpdatedTime = hourlyDataResponse.LastUpdatedTime
}
if (historicalClusterEnabled && hourlyDataResponse && hourlyDataResponse.HistoricData) {
that._historicData = hourlyDataResponse.HistoricData
}
that.loadAdditionalModules()
}, function(error) {
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
if (PlatformJS.Utilities.isPromiseCanceled(error)) {
return
}
})
}, _loadModule: function _loadModule(index, loadImmediately, showEnterContentAnimation) {
var that=this;
var dayOfYear=that._daysOfYear[index];
var dayOfWeek=((new Date).getDay() + index) % 7;
var key=that._clusterKeys[dayOfYear];
var historicDataForDay=null;
var hourlyDataForDay=null;
if (this._historicData && this._historicData[dayOfYear]) {
historicDataForDay = this._historicData[dayOfYear]
}
if (this._hourlyData && this._hourlyData[dayOfYear]) {
hourlyDataForDay = {};
hourlyDataForDay[dayOfYear] = this._hourlyData[dayOfYear];
hourlyDataForDay.lastUpdatedTime = (index === 0) ? this._hourlyData.lastUpdatedTime : ""
}
var historicalString=(this._historicStringData && this._historicStringData[index]) ? this._historicStringData[index] : null;
var histClassName="histModule" + dayOfYear;
if (historicDataForDay || hourlyDataForDay) {
var moduleDefinition={
groupKey: key, groupTitle: key, historicData: historicDataForDay, hourlyConditionsData: hourlyDataForDay, fragmentPath: "/html/templates.html", historicalString: historicalString, hourlyHeaderTemplate: "hourlyForecastHeaderModule", hourlyRowTemplate: "hourlyForecastRowModule", histModuleClassName: histClassName, index: index, location: that._locID, dayOfWeek: dayOfWeek, showEnterContentAnimation: showEnterContentAnimation, moduleInfo: {
renderer: WeatherAppJS.Utilities.Templates.getHistoricDailyDataTemplate, isInteractive: true
}
};
var isAdditionalModulePresent=that.getModuleFromCluster(key, 1);
if (isAdditionalModulePresent) {
var dataSource=that._dataSources[key];
if (dataSource) {
dataSource.push(moduleDefinition)
}
}
else {
if (loadImmediately) {
that.addModuleToCluster(key, moduleDefinition)
}
else {
msSetImmediate(function() {
that.addModuleToCluster(key, moduleDefinition)
})
}
}
}
}, loadAdditionalModules: function loadAdditionalModules() {
if (!this._historicData && !this._hourlyData) {
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
return
}
var that=this;
that._isAddlModulesLoaded = true;
var scrollPosition=0;
if (that._state) {
if (that._state.scrollPosition !== undefined) {
scrollPosition = that._state.scrollPosition
}
else if (that._state.panoramaState && (that._state.panoramaState.scrollPosition !== undefined)) {
scrollPosition = that._state.panoramaState.scrollPosition
}
}
var clusterWidth=WeatherAppJS.Utilities.UI.getDailyDrilldownClusterWidth();
var firstClusterToLoad=Math.floor(scrollPosition / clusterWidth);
that._loadModule(firstClusterToLoad, true);
var currentIndex=0;
var totalClustersToBeAdded=that._daysOfYear.length - 1;
while (currentIndex <= totalClustersToBeAdded) {
currentIndex++;
if (that._daysOfYear[firstClusterToLoad + currentIndex] !== undefined) {
that._loadModule(firstClusterToLoad + currentIndex, false)
}
if (that._daysOfYear[firstClusterToLoad - currentIndex] !== undefined) {
var showEnterContentAnimation=true;
if (currentIndex === 1) {
showEnterContentAnimation = false
}
that._loadModule(firstClusterToLoad - currentIndex, false, showEnterContentAnimation)
}
}
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType)
}, _loadPageData: function _loadPageData(bypassCache) {
var that=this;
that._isAddlModulesLoaded = false;
CommonJS.Progress.showProgress(CommonJS.Progress.headerProgressType);
var weatherDataAsyncFunction;
var locationObj=WeatherAppJS.GeocodeCache.getLocation(this._locID);
if (locationObj.isSkiLocation) {
weatherDataAsyncFunction = WeatherAppJS.LocationsManager.getSkiDetailsAsync
}
else {
weatherDataAsyncFunction = WeatherAppJS.LocationsManager.getCCDataForLocationAsync
}
var ccDataPromise=weatherDataAsyncFunction(this._locID, bypassCache);
that._promisesStack.push(ccDataPromise);
ccDataPromise.then(function(locObj) {
var container=document.getElementById('mainContainer');
var cc=locObj.getCurrentConditions();
that._isTripPlanAvailable = cc.isTripPlanAvailable;
if (container) {
if (locationObj.isSkiLocation) {
CommonJS.setTheme('darkTheme', false);
WinJS.Utilities.addClass(container, "skiDailyForecast")
}
else {
var dayNightIndicator=cc.dayNightIndicator;
var iconCode=cc.iconcode;
var imgAndTheme=locObj.getHeroImageAndThemeData();
var themeManager=WeatherAppJS.Utilities.ThemeManager;
var morphedSkyCode=themeManager.getMorphedSkyCode(imgAndTheme, iconCode, dayNightIndicator);
themeManager.applyTheme(container, imgAndTheme, morphedSkyCode)
}
}
var ccLastUpdatedTime=cc.lastUpdatedTime;
if (ccLastUpdatedTime) {
that._lastUpdatedTime = ccLastUpdatedTime;
that.displayLastUpdatedTime()
}
var dailyForecasts=locObj.getDailyConditions();
var primaryProviderData=null;
var forecasts=null;
var providerIndexes=Object.keys(dailyForecasts);
if (providerIndexes && providerIndexes.length > 0) {
primaryProviderData = dailyForecasts[0]
}
if (primaryProviderData && primaryProviderData.forecasts) {
forecasts = primaryProviderData.forecasts
}
var resLoader=PlatformJS.Services.resourceLoader;
var formatting=WeatherAppJS.Utilities.Formatting;
for (var d in forecasts) {
var thisForecast=forecasts[d];
var dayOfYear=thisForecast.dayofyear;
var key=that.getFormattedClusterKey(thisForecast.dayofyear, thisForecast.kiftime);
that._clusterKeys[dayOfYear] = key;
that._daysOfYear.push(dayOfYear);
var histClassName="histModule" + dayOfYear;
forecasts[d].histModuleClassName = histClassName;
var moduleDefinition={
groupKey: key, groupTitle: key, forecastData: forecasts[d], moduleInfo: {
renderer: WeatherAppJS.Utilities.Templates.getDailyConditionsTemplate, isInteractive: true
}
};
var isClusterExisting=that.containsCluster(key);
var cluster=that._panoramaControl.getClusterContentControl(key);
var isRealized=cluster ? true : false;
if (isClusterExisting && isRealized) {
var newList=new WinJS.Binding.List;
cluster.itemDataSource = newList.dataSource;
newList.push(moduleDefinition);
that._dataSources[key] = newList
}
else {
if (isClusterExisting && !isRealized) {
that.removeClusterFromPanorama(key)
}
that.addModuleToCluster(key, moduleDefinition);
var clusterTitle=formatting.getFormattedForecastClusterKey(thisForecast.kiftime);
that.addClusterToPanorama({
clusterKey: key, clusterTitle: clusterTitle, clusterType: WeatherAppJS.Utilities.ClusterDefinition.ItemsContainer, dataSource: that.getModulesDatasource(key), width: WeatherAppJS.Utilities.UI.getDailyDrilldownClusterWidth() - 80
}, {className: "forecastCluster"})
}
}
that._loadHistoricAveragesModule(bypassCache)
}, function(error) {
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
that.handleError(error, bypassCache)
})
}, onWindowResize: function onWindowResize(event) {
CommonJS.WindowEventManager.HandleWindowResizeEvent.call(this, event, function HandleWindowResize() {
var detail=event.detail || event.platFormDetail;
if (detail.hasOrientationChanged && this._panoramaControl) {
this._panoramaControl.getPanoramaState().scrollPosition = 0
}
})
}, getFormattedClusterKey: function getFormattedClusterKey(dayOfYear, kifTime) {
var key=dayOfYear;
if (/^\d$/.test(dayOfYear)) {
key = '00' + dayOfYear
}
else if (/^\d\d$/.test(dayOfYear)) {
key = '0' + dayOfYear
}
var year=WeatherAppJS.Utilities.Formatting.getYearFromKifTime(kifTime);
key = 'Cluster' + year + key;
return key
}, handleError: function handleError(error, bypassCache) {
var that=this;
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
if (PlatformJS.Utilities.isPromiseCanceled(error)) {
return
}
else if (WeatherAppJS.Networking.internetAvailable === false) {
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString("NoInternetConnectionError"), false)
}
else if (that._pageLoadType === WeatherAppJS.PageLoadTypes.loadPageBySettingsChange) {
var msg=PlatformJS.Services.resourceLoader.getString("CouldNotLoadDataMsg");
var messageBar=new CommonJS.MessageBar(msg, {
level: CommonJS.MessageBarLevelError, autoHide: false
});
messageBar.addButton(PlatformJS.Services.resourceLoader.getString("RetryButtonLabel"), function() {
messageBar.hide();
that._loadPageData(bypassCache)
});
messageBar.addButton(PlatformJS.Services.resourceLoader.getString("CloseButtonLabel"), function() {
messageBar.hide()
});
messageBar.show()
}
else {
CommonJS.Error.showError(CommonJS.Error.STANDARD_ERROR, function() {
CommonJS.forceRefresh()
})
}
}
})})
})()