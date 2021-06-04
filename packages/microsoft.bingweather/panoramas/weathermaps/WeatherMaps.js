/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
WinJS.Namespace.define("WeatherAppJS.Pages", {WeatherMaps: WinJS.Class.derive(WeatherAppJS.Core.WeatherBasePage, function(state) {
msWriteProfilerMark("WeatherApp:WeatherMapsPageLoad:s");
WeatherAppJS.Core.WeatherBasePage.call(this, state);
var that=this;
that._pageState = Object.create(state) || {};
that._localState = Object.create(state) || {};
this.baseMapCtlr = new WeatherAppJS.Maps.BaseMapController;
this.bindableUserGestureHandler = this.onUserGesture.bind(this);
this.bindablePageRefreshFn = this.onPageRefresh.bind(this);
this.bindableNetworkOnlineFn = this.onNetworkOnline.bind(this);
this.bindableBaseMapViewChangeFn = this.onBaseMapViewChange.bind(this);
this.bindableProcessMove = this.processMouseMoveEvent.bind(this);
this.mapLayers = [];
CommonJS.setTheme("weatherMapsBackground", false);
WeatherAppJS.Networking.addEventListener('networkonline', this.bindableNetworkOnlineFn, false);
msWriteProfilerMark("WeatherApp:WeatherMapsPageLoad:e")
}, {
baseMapCtlr: null, mapLayers: null, supportedMaps: [], _currentMapType: null, _seekBar: null, _zoomControl: null, _legend: null, _isBaseMapCtrlInitialized: false, _baseMapInitializeCheckTimer: null, _baseMapInitializeCheckTimeout: {get: function get() {
return PlatformJS.Services.appConfig.getInt32("BaseMapInitTimeoutInMilliseconds", 15000)
}}, _baseMapViewChangeEventHandler: null, _autoHideChromeTimer: null, _prevZoomLevel: null, _autoHideChromeTimeOut: {get: function get() {
return PlatformJS.Services.appConfig.getInt32("ChromeDisplayTimeoutInMilliseconds", 2500)
}}, _showSearchCharmOnKeyBoardInput: null, _isMapsConfigInitDone: false, _isEdgyActionHandlersInitialized: false, _prevMousePos: {
x: 0, y: 0
}, getPageImpressionContext: function getPageImpressionContext() {
var regionName;
if (this._state.isTopEdgyL1Action) {
var regionISOCode=WeatherAppJS.SettingsManager.getUserDefaultRegionISOCode();
regionName = "WeatherMaps/" + regionISOCode;
var ui=WeatherAppJS.Utilities.UI;
ui.getMapRegionDataForIsoCodeAsync(regionISOCode).then(function(region) {
regionName = region.region
})
}
else {
regionName = this._state.region
}
return "/" + regionName
}, getPageData: function getPageData() {
var that=this;
var resourceLoader=PlatformJS.Services.resourceLoader;
var pageData={
HelpButtonTitle: resourceLoader.getString("/platform/HelpLabel"), RefreshButtonTitle: resourceLoader.getString("RefreshButtonTitle"), ChangeUnitToFButtonTitle: resourceLoader.getString("ChangeUnitToFButtonTitle"), ChangeUnitToCButtonTitle: resourceLoader.getString("ChangeUnitToCButtonTitle")
};
if (!this._isMapsConfigInitDone) {
return this._initMapsConfigAsync().then(function() {
that._isMapsConfigInitDone = true;
that._initCurrentMap();
MapConfigs.initMapScenarioConfig(that._currentMapType.id, that._currentMapType.subTypeId);
that._init();
msWriteProfilerMark("WeatherApp:WeatherMapsConfigInit:e");
return WinJS.Promise.wrap(pageData)
}, function(error) {
msWriteProfilerMark("WeatherApp:WeatherMapsConfigInit:e");
return WinJS.Promise.wrap(pageData)
})
}
else {
return WinJS.Promise.wrap(pageData)
}
}, getPageState: function getPageState() {
this._pageState.map = this._currentMapType;
return this._pageState
}, getRegionAsync: function getRegionAsync(pageState) {
if (pageState && pageState.region) {
return WinJS.Promise.wrap(pageState.region)
}
if (pageState && "latitude" in pageState && "longitude" in pageState) {
var matchedRegion=MapUtils.getMapRegionForLatLong(pageState.latitude, pageState.longitude);
if (matchedRegion.length === 1) {
return WinJS.Promise.wrap(matchedRegion[0])
}
}
var ui=WeatherAppJS.Utilities.UI;
if (pageState && pageState.isoCode) {
return ui.getMapRegionDataForIsoCodeAsync(pageState.isoCode).then(function(data) {
var regionName=data["region"];
var region=(regionName) ? regionName : PlatformJS.Services.appConfig.getString("BaseMapDefaultContinent");
return region
})
}
var regionCode=WeatherAppJS.SettingsManager.getUserDefaultRegionISOCode();
return ui.getMapRegionDataForIsoCodeAsync(regionCode).then(function(data) {
var regionName=data["region"];
var region=(regionName) ? regionName : PlatformJS.Services.appConfig.getString("BaseMapDefaultContinent");
return region
})
}, getRegionDataAsync: function getRegionDataAsync(pageState) {
if (pageState && pageState.region) {
if (!pageState.isTopEdgyL1Action) {
return WinJS.Promise.wrap({region: pageState.region})
}
if (pageState.bounds) {
return WinJS.Promise.wrap({
region: pageState.region, bounds: pageState.bounds
})
}
}
var ui=WeatherAppJS.Utilities.UI;
if (pageState && pageState.isoCode) {
return ui.getMapRegionDataForIsoCodeAsync(pageState.isoCode).then(function(data) {
return data
})
}
else {
var regionCode=WeatherAppJS.SettingsManager.getUserDefaultRegionISOCode();
this._localState.isoCode = regionCode;
return ui.getMapRegionDataForIsoCodeAsync(regionCode).then(function(data) {
var regionName=data["region"];
var region=(regionName) ? regionName : PlatformJS.Services.appConfig.getString("BaseMapDefaultContinent");
var bounds=data["bounds"];
return {
region: region, bounds: bounds
}
})
}
}, getMapOptionsFromPageState: function getMapOptionsFromPageState() {
var mapOptions={};
if (this._localState) {
mapOptions.region = this._localState.region ? this._localState.region : null;
if (this._localState.isNationalMap || this._localState.isTopEdgyL1Action) {
mapOptions.bounds = this._localState.bounds
}
else {
var center=null;
if (MapUtils.isNumeric(this._localState.latitude) && MapUtils.isNumeric(this._localState.longitude)) {
mapOptions.center = new MicrosoftJS.Maps.Location(this._localState.latitude, this._localState.longitude);
mapOptions.isoCode = this._localState.isoCode ? this._localState.isoCode : null
}
if (MapUtils.isNumeric(this._localState.zoomLevel)) {
mapOptions.zoom = this._localState.zoomLevel
}
}
}
return mapOptions
}, onBindingComplete: function onBindingComplete() {
WinJS.Resources.processAll();
var that=this;
var canvasLayer=new WeatherAppJS.Maps.CanvasLayer(this.baseMapCtlr, that._seekBar, {
map: that._currentMapType, tsControl: that._tsControl, legend: that._legend, baseMapLayerOptions: JSON.parse(MapConfigs.getMapScenarioConfigItem("BaseMapLayerOptions").value)
});
canvasLayer.addEventListener('firstframeloaded', function(event) {
PlatformJS.Navigation.mainNavigator.notifyPageLoadComplete();
that.logMapLoadTime('firstframe', event.startTime)
});
canvasLayer.addEventListener('allframesloaded', function(event) {
that.logMapLoadTime('allframes', event.startTime)
});
this.mapLayers.push(canvasLayer);
if (!that._isBaseMapCtrlInitialized) {
that._initializeBaseMapCtlr()
}
else {
that.loadMapLayers()
}
clearTimeout(that._baseMapInitializeCheckTimer);
that._baseMapInitializeCheckTimer = setTimeout(that.checkBaseMapInit.bind(that), that._baseMapInitializeCheckTimeout);
that._setMapTheme();
that.initializeEdgyActionHandlers();
that.cleanPeriodicTimersStack();
var dataRefreshTimerId=setInterval(this.bindablePageRefreshFn, PlatformJS.Services.appConfig.getString("PageRefreshTime"));
that._timersStack.push(dataRefreshTimerId)
}, _initializeBaseMapCtlr: function _initializeBaseMapCtlr() {
var that=this;
if (!this.baseMapCtlr) {
this.baseMapCtlr = new WeatherAppJS.Maps.BaseMapController
}
if (!this.baseMapCtlrInitHandler) {
this.baseMapCtlrInitHandler = function() {
that._isBaseMapCtrlInitialized = true;
that._registerEventHandlers();
that.loadMapLayers()
}
}
this.baseMapCtlr.addEventListener('initialized', this.baseMapCtlrInitHandler);
var mapDiv=document.getElementById("mapdiv");
var mapOptions=this.getMapOptionsFromPageState();
mapOptions.baseMapOptions = JSON.parse(MapConfigs.getMapScenarioConfigItem("BaseMapLayerOptions").value);
this.baseMapCtlr.init(mapDiv, mapOptions)
}, _disposeBaseMapCtlr: function _disposeBaseMapCtlr() {
this._removeEventHandlers();
if (this.baseMapCtlr) {
this.baseMapCtlr.dispose();
this.baseMapCtrl = null
}
}, logMapLoadTime: function logMapLoadTime(event, startTime) {
var perfContext="";
if (WinJS.Navigation.location) {
perfContext = WinJS.Navigation.location.page + "*" + WinJS.Navigation.location.channelId
}
var markerText=(event === 'firstframe') ? "WeatherApp:WeatherMapsPage:CanvasFirstFrameLoad" : "WeatherApp:WeatherMapsPage:CanvasAllFramesLoad";
var eventName=(event === 'firstframe') ? "First Frame Load Time" : "Animation Load Time";
var mapLoadTime=((new Date).getTime() / 1000) - startTime;
var eventAttr={
region: this._localState.region, mapType: this._currentMapType.id, mapSubType: this._currentMapType.subTypeId ? this._currentMapType.subTypeId : ""
};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logPerfWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, markerText, eventName, perfContext, mapLoadTime, JSON.stringify(eventAttr))
}, initializeEdgyActionHandlers: function initializeEdgyActionHandlers() {
if (this._isEdgyActionHandlersInitialized) {
return
}
this._isEdgyActionHandlersInitialized = true;
var bEdgyElement=document.getElementById("bottomEdgy");
this._bEdgy = bEdgyElement.winControl;
this._helpButton = bEdgyElement.querySelector("#helpButton");
this._refreshButton = bEdgyElement.querySelector("#refreshButton");
this._changeUnitToFButton = bEdgyElement.querySelector("#changeUnitToFButton");
this._changeUnitToCButton = bEdgyElement.querySelector("#changeUnitToCButton");
var that=this;
if (this._bEdgy) {
this._bEdgy.addEventListener("beforeshow", function(e) {
that.onBeforeShowBottomEdgy(e)
});
this._refreshButton.addEventListener("click", function(e) {
that.onRefreshClick(e)
});
this._helpButton.addEventListener("click", function(e) {
WeatherAppJS.Utilities.UI.openInAppHelp()
});
this._changeUnitToFButton.addEventListener("click", function(e) {
that.onChangeUnitToFClick(e)
});
this._changeUnitToCButton.addEventListener("click", function(e) {
that.onChangeUnitToCClick(e)
})
}
}, onBeforeShowBottomEdgy: function onBeforeShowBottomEdgy(e) {
var useTianQi=Platform.Utilities.Globalization.isFeatureEnabled("UseTianQi");
var toggleShowButton=WeatherAppJS.Utilities.UI.toggleShowButton;
if (!useTianQi) {
var isCurrentUnitF=(WeatherAppJS.SettingsManager.getDisplayUnit() === "F");
toggleShowButton(this._changeUnitToFButton, !isCurrentUnitF);
toggleShowButton(this._changeUnitToCButton, isCurrentUnitF)
}
}, _updateView: function _updateView() {
var that=this;
for (var i=0; i < that.mapLayers.length; i++) {
that.mapLayers[i].updateLayer()
}
if (that._seekbar) {
that._seekBar.update()
}
if (that.baseMapCtlr && that._isBaseMapCtrlInitialized) {
that.baseMapCtlr.setRestrictedViewDelayed(true)
}
}, onSettingsChange: function onSettingsChange(e) {
this.onPageRefresh(true)
}, onNetworkOnline: function onNetworkOnline() {
this.onPageRefresh(true)
}, checkBaseMapInit: function checkBaseMapInit() {
var that=this;
CommonJS.Progress.hideProgress(CommonJS.Progress.centerProgressType);
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
if (!this._isBaseMapCtrlInitialized) {
CommonJS.Error.removeError();
var errorCallback=null;
var errorType=null;
if (WeatherAppJS.Networking.internetAvailable === true) {
errorType = CommonJS.Error.STANDARD_ERROR;
errorCallback = function() {
that.onPageRefresh(true)
}
}
else {
errorType = CommonJS.Error.NO_INTERNET
}
CommonJS.Error.showError(errorType, errorCallback);
this._disposeBaseMapCtlr();
return
}
else {
clearTimeout(this._baseMapInitializeCheckTimer)
}
}, onWindowResize: function onWindowResize(event) {
CommonJS.WindowEventManager.HandleWindowResizeEvent.call(this, event, function HandleWindowResize() {
this._updateView()
})
}, onPageRefresh: function onPageRefresh(bypassCache) {
var that=this;
while (this.mapLayers.length !== 0) {
var layer=this.mapLayers.pop();
layer.removeLayer();
layer.disposeLayer()
}
that._seekBar.resetAnimation();
CommonJS.Progress.hideProgress(CommonJS.Progress.centerProgressType);
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
CommonJS.Error.removeError();
clearTimeout(that._baseMapInitializeCheckTimer);
CommonJS.forceRefresh()
}, loadMapLayers: function loadMapLayers() {
var that=this;
var layerConfig=PlatformJS.Services.appConfig.getDictionary("LabelsLayerUrls");
var layerConfigForEnv=layerConfig[WeatherAppJS.SettingsManager.getMapsEnvironment()];
var labelsLayerStyle=MapConfigs.getMapScenarioConfigItem("LabelsTileLayerStyle").value;
var labelLayerOptions={tileSourceOptions: {uriConstructor: (layerConfigForEnv[labelsLayerStyle]) ? layerConfigForEnv[labelsLayerStyle].value : MapConfigs.getBaseMapGlobalOption(labelsLayerStyle)}};
var labelsLayer=new WeatherAppJS.Maps.LabelsTileLayer(that.baseMapCtlr, labelLayerOptions);
that.mapLayers.push(labelsLayer);
var loadLayersPromises=[];
that.mapLayers.forEach(function(layer) {
loadLayersPromises.push(layer.loadLayerAsync())
});
var loadLayersMergedPromise=WinJS.Promise.join(loadLayersPromises);
that._promisesStack.push(loadLayersMergedPromise);
loadLayersMergedPromise.then(function() {
for (var i=0; i < that.mapLayers.length; i++) {
that.mapLayers[i].addLayer();
that.mapLayers[i].showLayer()
}
}, function(e) {
if (WeatherAppJS.Controls.Utilities.isCancellationError(e)) {
return
}
CommonJS.Error.removeError();
if (WeatherAppJS.Networking.internetAvailable === true) {
WeatherAppJS.Error.showMessageBarWithButton(PlatformJS.Services.resourceLoader.getString("/platform/standardErrorDescription"), false, PlatformJS.Services.resourceLoader.getString("RetryButtonLabel"), function() {
that.onPageRefresh(true)
})
}
else {
CommonJS.Error.showError(CommonJS.Error.NO_INTERNET)
}
})
}, mapSwitchedEventHandler: function mapSwitchedEventHandler(event) {
var that=this;
that._currentMapType = event.detail;
MapConfigs.initMapScenarioConfig(that._currentMapType.id, that._currentMapType.subTypeId);
that.onPageRefresh(false);
var eventAttr={
mapType: event.detail.id, mapSubType: event.detail.subTypeId ? event.detail.subTypeId : ""
};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, WeatherAppJS.Instrumentation.PageContext.WeatherMapsChromeTopBar, "Map Type", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.select, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr))
}, onUserGesture: function onUserGesture(event) {
var that=this;
if (that._topBar && that._seekBar) {
if (event.type === "MSPointerDown" || event.type === "pointerdown") {
that.feedGestureRecognizer(event.currentPoint, "down")
}
else if (event.type === "MSPointerUp" || event.type === "pointerup" || event.type === "MSPointerCancel" || event.type === "pointercancel" || ((event.type === "MSPointerOut" || event.type === "pointerout") && !event.currentPoint.isInContact) || ((event.type === "MSLostPointerCapture" || event.type === "lostpointercapture") && !event.currentPoint.isInContact)) {
that.feedGestureRecognizer(event.currentPoint, "up")
}
else if (event.type === 'tapped') {
if (that._topBar.isShown && !that._topBar.isMouseOver && that._seekBar.isEnabled && !that._seekBar.isMouseOver && !that._zoomControl.isMouseOver) {
that._displayChrome(false);
that._zoomControl.hide()
}
else {
that._displayChrome(true)
}
}
else if (event.type === 'mousewheel') {
if (that._topBar.isShown && that._seekBar.isEnabled) {
that._displayChrome(false);
that._zoomControl.hide()
}
}
else if (event.type === 'MSPointerMove' || event.type === 'pointermove') {
if (event.pointerType === (event.MSPOINTER_TYPE_TOUCH || "touch")) {
that._zoomControl.hide();
clearTimeout(that._autoHideChromeTimer);
that._autoHideChromeTimer = setTimeout(that._displayChrome.bind(that), that._autoHideChromeTimeOut);
return
}
if (event.currentPoint.isInContact || that._isMouseMoveWithinThreshold(event)) {
return
}
if (!that._topBar.isShown) {
that._displayChrome(true)
}
else {
clearTimeout(that._autoHideChromeTimer);
that._autoHideChromeTimer = setTimeout(that._displayChrome.bind(that), that._autoHideChromeTimeOut)
}
that._zoomControl.show()
}
else if (event.type === "keydown") {
if (event.keyCode === WinJS.Utilities.Key.enter) {
if (!that._topBar.isShown) {
that._isEnterPressed = true;
that._displayChrome(true)
}
else {
that._isEnterPressed = false;
that._displayChrome(false)
}
that._seekBar.isPlaying = !that._seekBar.isPlaying
}
else if (event.keyCode === WinJS.Utilities.Key.escape) {
that._isEnterPressed = false;
that._displayChrome(false)
}
}
else if (event.type === "manipulationstarted") {
that._displayChrome(false);
that._zoomControl.hide()
}
else if (event.type === "manipulationcompleted") {
that.gr.completeGesture()
}
}
}, onBaseMapViewChange: function onBaseMapViewChange() {
var currentZoomLevel=this.baseMapCtlr.baseMapZoomLevel;
if (this._prevZoomLevel) {
var eventAttr={
mapType: this._currentMapType.id, mapSubType: this._currentMapType.subTypeId ? this._currentMapType.subTypeId : ""
};
if (currentZoomLevel > this._prevZoomLevel) {
eventAttr['action'] = "Zoom In";
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, WeatherAppJS.Instrumentation.PageContext.WeatherMapsChrome, "Zoom In/Out", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr))
}
else if (currentZoomLevel < this._prevZoomLevel) {
eventAttr['action'] = "Zoom Out";
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, WeatherAppJS.Instrumentation.PageContext.WeatherMapsChrome, "Zoom In/Out", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr))
}
}
this._prevZoomLevel = currentZoomLevel;
this._zoomControl.update()
}, onRegionChange: function onRegionChange(e) {
if (e && e.detail && e.detail.region) {
var changedRegion=e.detail.region;
PlatformJS.Navigation.navigateToChannel("WeatherMaps", {region: changedRegion});
var eventAttr={region: e.detail.region};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, WeatherAppJS.Instrumentation.PageContext.WeatherMapsChromeTopBar, "Region", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.select, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr))
}
}, _registerEventHandlers: function _registerEventHandlers() {
var that=this;
var baseMapContainer=document.querySelector('.baseMapDiv');
if (!WeatherAppJS.Utilities.UI.isPerfOptimizedExperience()) {
if (baseMapContainer) {
baseMapContainer.addEventListener("MSPointerMove", that.bindableUserGestureHandler, true);
baseMapContainer.addEventListener('MSPointerMove', that.bindableProcessMove, true);
baseMapContainer.addEventListener("MSPointerDown", that.bindableUserGestureHandler, true);
baseMapContainer.addEventListener("MSPointerUp", that.bindableUserGestureHandler, true);
baseMapContainer.addEventListener("MSPointerCancel", that.bindableUserGestureHandler, true);
baseMapContainer.addEventListener("MSLostPointerCapture", that.bindableUserGestureHandler, true);
baseMapContainer.addEventListener("MSPointerOut", that.bindableUserGestureHandler, false);
baseMapContainer.addEventListener("mousewheel", that.bindableUserGestureHandler, true);
window.addEventListener("keydown", that.bindableUserGestureHandler, true);
that._initGestureRecognition()
}
}
if (this.baseMapCtlr) {
this._baseMapViewChangeEventHandler = this.baseMapCtlr.addBaseMapThrottledEventHandler('viewchangeend', that.bindableBaseMapViewChangeFn)
}
}, _removeEventHandlers: function _removeEventHandlers() {
var that=this;
var baseMapContainer=document.querySelector('.baseMapDiv');
if (baseMapContainer) {
baseMapContainer.removeEventListener('MSPointerMove', that.bindableUserGestureHandler);
baseMapContainer.removeEventListener('MSPointerMove', that.bindableProcessMove);
baseMapContainer.removeEventListener('MSPointerDown', that.bindableUserGestureHandler);
baseMapContainer.removeEventListener("MSPointerUp", that.bindableUserGestureHandler);
baseMapContainer.removeEventListener("MSPointerCancel", that.bindableUserGestureHandler);
baseMapContainer.removeEventListener("MSLostPointerCapture", that.bindableUserGestureHandler);
baseMapContainer.removeEventListener("MSPointerOut", that.bindableUserGestureHandler);
baseMapContainer.removeEventListener('mousewheel', that.bindableUserGestureHandler);
window.removeEventListener('keydown', that.bindableUserGestureHandler, true)
}
if (that.gr) {
that.gr.removeEventListener('manipulationstarted', that.bindableUserGestureHandler);
that.gr.removeEventListener('manipulationupdated', that.bindableUserGestureHandler);
that.gr.removeEventListener('manipulationcompleted', that.bindableUserGestureHandler);
that.gr.removeEventListener('tapped', that.bindableUserGestureHandler)
}
if (that.baseMapCtlr) {
that.baseMapCtlr.removeBaseMapEventHandler(that._baseMapViewChangeEventHandler);
that.baseMapCtlr.removeEventListener('initialized', that.baseMapCtlrInitHandler)
}
}, processMouseMoveEvent: function processMouseMoveEvent(event) {
this.feedGestureRecognizer(event.intermediatePoints, "move")
}, feedGestureRecognizer: function feedGestureRecognizer(feedData, eventType) {
var that=this;
try {
switch (eventType) {
case"up":
that.gr.processUpEvent(feedData);
break;
case"down":
that.gr.processDownEvent(feedData);
break;
case"move":
that.gr.processMoveEvents(feedData);
break;
default:
throw new Error("Unknown feed for feedGestureRecognizer");
}
}
catch(ex) {}
}, _isMouseMoveWithinThreshold: function _isMouseMoveWithinThreshold(event) {
var isMouseMoveWithinThreshold=false;
if (event && event.currentPoint && event.currentPoint.position) {
var dx=Math.abs(event.currentPoint.position.x - this._prevMousePos.x);
var dy=Math.abs(event.currentPoint.position.y - this._prevMousePos.y);
this._prevMousePos = {
x: event.currentPoint.position.x, y: event.currentPoint.position.y
};
if (dx < 15 && dy < 15) {
isMouseMoveWithinThreshold = true
}
}
return isMouseMoveWithinThreshold
}, _init: function _init() {
var that=this;
var mapControlsDiv=document.getElementById("mapcontrols");
var topBarDiv=document.createElement("div");
var topBar=new WeatherAppJS.Maps.MapsTopBar(topBarDiv, {
maps: that.supportedMaps, currentMap: that._currentMapType, region: that._localState.region
});
that._topBar = topBar;
mapControlsDiv.appendChild(topBarDiv);
topBarDiv.addEventListener("mapswitched", that.mapSwitchedEventHandler.bind(that));
topBarDiv.addEventListener("regionchanged", that.onRegionChange.bind(that));
var seekBarDiv=document.createElement("div");
var seekBar=new WeatherAppJS.Maps.SeekBar(seekBarDiv);
that._seekBar = seekBar;
that._seekBar._playButton.addEventListener('click', function(event) {
var eventAttr={
mapType: that._currentMapType.id, mapSubType: that._currentMapType.subTypeId ? that._currentMapType.subTypeId : "", action: !that._seekBar.isPlaying ? "Pause" : "Play"
};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, WeatherAppJS.Instrumentation.PageContext.WeatherMapsChrome, "Play/Pause", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr))
});
that._seekBar.addEventListener('animationcompleted', function(event) {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logAppAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Weather Maps Chrome", "Maps", "appAnimationComplete", PlatformJS.Utilities.getLastClickUserActionMethod(), 0)
});
mapControlsDiv.appendChild(seekBarDiv);
var zoomButtons=document.createElement("div");
var zoomControl=new WeatherAppJS.Maps.ZoomControl(zoomButtons, {baseMapCtlr: this.baseMapCtlr});
that._zoomControl = zoomControl;
mapControlsDiv.appendChild(zoomButtons);
that._displayChrome(true);
that._zoomControl.hide();
var tsControlDiv=document.createElement("div");
var tsControl=new WeatherAppJS.Maps.TimeStamp(tsControlDiv);
that._tsControl = tsControl;
mapControlsDiv.appendChild(tsControlDiv);
var legendDiv=document.createElement("div");
var legendControl=new WeatherAppJS.Maps.Legend(legendDiv, {});
that._legend = legendControl;
mapControlsDiv.appendChild(legendDiv)
}, _setMapTheme: function _setMapTheme() {
var mapControlsDiv=document.getElementById("mapcontrols");
if (mapControlsDiv) {
if (MapConfigs.getMapScenarioConfigItem("DarkMapThemeActive").value) {
WinJS.Utilities.addClass(mapControlsDiv, "darkMapBase")
}
else {
WinJS.Utilities.removeClass(mapControlsDiv, "darkMapBase")
}
}
}, _displayChrome: function _displayChrome(show) {
var that=this;
if (show) {
that._topBar.show();
that._seekBar.show();
clearTimeout(that._autoHideChromeTimer);
that._autoHideChromeTimer = (!WeatherAppJS.Utilities.UI.isPerfOptimizedExperience()) ? setTimeout(that._displayChrome.bind(that), that._autoHideChromeTimeOut) : null
}
else {
if (that._seekBar.isEnabled && !that._seekBar.isMouseOver && !that._topBar.isMouseOver && !that._zoomControl.isMouseOver && !that._isEnterPressed) {
that._topBar.hide();
that._seekBar.hide();
that._zoomControl.hide();
clearTimeout(that._autoHideChromeTimer);
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logAppAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, WeatherAppJS.Instrumentation.PageContext.WeatherMapsChrome, "", Microsoft.Bing.AppEx.Telemetry.AppActionOperation.open, 0)
}
else {
clearTimeout(that._autoHideChromeTimer);
that._autoHideChromeTimer = setTimeout(that._displayChrome.bind(that), that._autoHideChromeTimeOut)
}
}
}, _initMapsConfigAsync: function _initMapsConfigAsync() {
var that=this;
var ui=WeatherAppJS.Utilities.UI;
msWriteProfilerMark("WeatherApp:WeatherMapsConfigInit:s");
return this.getRegionDataAsync(this._localState).then(function getRegionData_complete(data) {
that.supportedMaps = [];
if (data) {
var isNationalMap=that._localState.isNationalMap;
var isTopEdgyL1Action=that._localState.isTopEdgyL1Action;
if (isNationalMap || isTopEdgyL1Action) {
that._localState.bounds = data.bounds
}
that._localState.region = data.region;
var mapTypes=ui.getMapTypesForRegion(that._localState.region);
for (var mapTypeId in mapTypes) {
var mapSubTypes=mapTypes[mapTypeId];
if (mapSubTypes) {
for (var i in mapSubTypes) {
that.supportedMaps.push(ui.getPageStateForMapType(mapTypeId, mapSubTypes[i]))
}
}
}
}
return that.supportedMaps
}, function(error) {
return null
})
}, _initCurrentMap: function _initCurrentMap() {
var that=this;
if (that._localState.map) {
that._currentMapType = {
mapType: that._localState.map.mapType, id: that._localState.map.id, mapSubType: that._localState.map.mapSubType, subTypeId: that._localState.map.subTypeId
}
}
else {
var isoCode=(this._localState.isTopEdgyL1Action) ? this._localState.isoCode : null;
var mapType=MapConfigs.getDefaultMapTypeForIsoCode(isoCode);
that._currentMapType = WeatherAppJS.Utilities.UI.getPageStateForMapType(mapType)
}
}, showMessage: function showMessage(msgKey) {
if (CommonJS.messageBar) {
CommonJS.messageBar.hide()
}
if (msgKey) {
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString(msgKey), false)
}
CommonJS.dismissAllEdgies()
}, _initGestureRecognition: function _initGestureRecognition() {
this.gr = new Windows.UI.Input.GestureRecognizer;
this.gr.gestureSettings = Windows.UI.Input.GestureSettings.manipulationTranslateX | Windows.UI.Input.GestureSettings.manipulationTranslateY | Windows.UI.Input.GestureSettings.manipulationTranslateInertia | Windows.UI.Input.GestureSettings.tap;
this.gr.showGestureFeedback = false;
this.gr.addEventListener('manipulationstarted', this.bindableUserGestureHandler);
this.gr.addEventListener('manipulationupdated', this.bindableUserGestureHandler);
this.gr.addEventListener('manipulationcompleted', this.bindableUserGestureHandler);
this.gr.addEventListener('tapped', this.bindableUserGestureHandler)
}, _disposePage: function _disposePage() {
var layer=null;
while (this.mapLayers.length !== 0) {
layer = this.mapLayers.pop();
layer.disposeLayer()
}
if (this._seekBar) {
this._seekBar.isPlaying = false;
this._seekBar.dispose()
}
if (this._topBar) {
this._topBar.cleanUp()
}
WeatherAppJS.Networking.removeEventListener('networkonline', this.bindableNetworkOnlineFn, false);
this._disposeBaseMapCtlr();
this.bindablePageRefreshFn = null;
this.bindableUserGestureHandler = null;
this.bindableBaseMapViewChangeFn = null;
this.bindableNetworkOnlineFn = null;
this.bindableProcessMove = null;
this.bindableMapSwitchHandler = null;
this.bindableRegionChangeHandler = null;
clearTimeout(this._autoHideChromeTimer);
clearTimeout(this._baseMapInitializeCheckTimer)
}
})})
})()