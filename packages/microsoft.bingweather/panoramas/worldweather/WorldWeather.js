/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
var RTL_MAP_SHIFT=280;
var MAP_IMAGE_WIDTH=1366;
var MAP_IMAGE_HEIGHT=768;
WinJS.Namespace.define("WeatherAppJS", {WorldWeather: WinJS.Class.derive(WeatherAppJS.WeatherBasePage, function(state) {
msWriteProfilerMark("WeatherApp:WorldWeatherPageLoad:s");
WeatherAppJS.WeatherBasePage.call(this, state);
var that=this;
this._continentName = "World";
this.panelDisplayData = [];
this.locationDisplayData = [];
this.locationGroups = {};
this._locationBindData = {};
this._setClickHandlers();
CommonJS.setTheme("worldWeatherBackground", true);
this.onSettingsChange = function(e) {
if (e.detail.setting === "unitChange") {
if (WeatherAppJS.Networking.internetAvailable === true) {
msWriteProfilerMark("WeatherApp:WorldWeatherPageRefresh:s");
that._fetchAndBindLocationsDataAsync(that._continentName, true).then(null, function(e){});
msWriteProfilerMark("WeatherApp:WorldWeatherPageRefresh:e")
}
}
};
this.onPageRefresh = function(bypassCache) {
bypassCache = (bypassCache) || false;
msWriteProfilerMark("WeatherApp:WorldWeatherPageRefresh:s");
that._fetchAndBindLocationsDataAsync(that._continentName, bypassCache).then(null, function(e){});
msWriteProfilerMark("WeatherApp:WorldWeatherPageRefresh:e")
};
this._disposePage = function() {
this.cleanUpLocationsData();
this.cleanUpWeatherDataRefresh();
this.panelDisplayData = null;
this.locationDisplayData = null;
this.locationGroups = null;
this._cityListPanel = null;
this._layers = null;
this._locationBindData = null
};
msWriteProfilerMark("WeatherApp:WorldWeatherPageLoad:e")
}, {
currentLayerShown: 0, _interval: {}, _continentName: null, _layers: [], _zoomOrigin: "", _animationInProgress: false, _landscape: "landscape", _portrait: "portrait", _isEdgyActionHandlersInitialized: false, _currentOrientation: {get: function get() {
var viewManagement=Windows.UI.ViewManagement;
if (viewManagement.ApplicationView.value === viewManagement.ApplicationViewState.fullScreenPortrait) {
return this._portrait
}
else {
return this._landscape
}
}}, _clickSwallowTimer: null, _continentProperties: {
NorthAmerica: {
id: 1, landscape: {
zoomOrigin: {
ltr: "156.01px 230.70px", rtl: "-25.28px 230.70px"
}, scale: 2.51, points: "7,147 27,247 143,261 225,407 335,442 395,407 478,256 288,137"
}, portrait: {
zoomOrigin: {
ltr: "-50.71px 290px", rtl: "-50.71px 290px"
}, scale: 2.71, points: "77,231 227,269 251,327 184,385 216,416 196,426 178,449 129,428 77,375 39,306 0,316 0,256"
}
}, Europe: {
id: 3, landscape: {
zoomOrigin: {
ltr: "787.20px 203.10px", rtl: "695.39px 203.10px"
}, scale: 4, points: "728,141,802,165,832,335,711,343,665,318,600,341,616,284,600,259,616,221"
}, portrait: {
zoomOrigin: {
ltr: "419.36px 303.70px", rtl: "419.36px 303.70px"
}, scale: 4.8, points: "427,252 461,269 478,369 444,385 392,368 344,372 334,305"
}
}, Asia: {
id: 5, landscape: {
zoomOrigin: {
ltr: "1437.27px 318.73px", rtl: "1162.49px 318.73px"
}, scale: 2.02, points: "797,149,994,59,1335,142,1356,174,1356,204,1326,204,1106,394,1104,525,1037,510,992,459,980,402,944,467,885,387,814,431,758,343,828,333"
}, portrait: {
zoomOrigin: {
ltr: "855.45px 291.95px", rtl: "855.45px 291.95px"
}, scale: 1.96, points: "461,269 496,223 582,204 765,254 765,303 667,403 672,450 657,486 616,486 582,457 573,416 557,449 532,448 513,411 468,433 444,385 478,369"
}
}, SouthAmerica: {
id: 2, landscape: {
zoomOrigin: {
ltr: "372.54px 687.77px", rtl: "206.81px 687.77px"
}, scale: 2.69, points: "375,412,515,498,497,568,407,727,353,700,368,555,324,484"
}, portrait: {
zoomOrigin: {
ltr: "157.42px 552.35px", rtl: "157.42px 552.35px"
}, scale: 3.79, points: "203,424 292,474 215,603 202,606 188,595 191,502 173,470 194,427"
}
}, Africa: {
id: 4, landscape: {
zoomOrigin: {
ltr: "820.55px 526.24px", rtl: "651.87px 526.24px"
}, scale: 2.66, points: "604,340,673,327,758,351,809,431,851,427,822,476,838,566,708,626,658,476,603,462,568,410"
}, portrait: {
zoomOrigin: {
ltr: "413.46px 474.92px", rtl: "413.46px 474.92px"
}, scale: 3.52, points: "392,368 444,385 468,433 487,430 483,510 448,545 405,545 381,458 337,455 322,405 351,372"
}
}, Oceania: {
id: 6, landscape: {
zoomOrigin: {
ltr: "1466.44px 657.27px", rtl: "1349.33px 657.27px"
}, scale: 3.40, points: "1145,510,1130,469,1213,478,1270,515,1320,628,1268,691,1178,646,1138,611,1070,621,1061,550"
}, portrait: {
zoomOrigin: {
ltr: "792.78px 555.07px", rtl: "792.78px 555.07px"
}, scale: 4.51, points: "672,450 759,485 766,565 757,582 702,574 629,546 619,511 657,486"
}
}
}, _getViewportWidth: function _getViewportWidth(orientation) {
var viewWidth=MAP_IMAGE_WIDTH;
if (orientation === this._portrait) {
viewWidth = MAP_IMAGE_HEIGHT
}
return viewWidth
}, _getImagePath: function _getImagePath(continentName) {
var flow=WeatherAppJS.Utilities.Common.getDirection();
var orientation=this._currentOrientation;
var imagePath="/images/worldweather/" + orientation + "/";
if (orientation === this._landscape) {
imagePath += continentName + "-" + flow + ".png"
}
else {
imagePath += continentName + ".png"
}
return imagePath
}, _cityListPanel: null, cityListPanel: {get: function get() {
if (!this._cityListPanel) {
this._cityListPanel = document.querySelectorAll('.cityListPanel')[0]
}
return this._cityListPanel
}}, _appendLocationsToDom: function _appendLocationsToDom(continentName) {
var that=this;
var winjsAddClass=WinJS.Utilities.addClass;
var orientation=this._currentOrientation;
this._layers = [];
var mapContainer=document.querySelector(".mapContainer");
var locationList=this.locationGroups[continentName];
for (var key in locationList) {
var thisLocation=locationList[key];
var orientationValues=thisLocation[orientation];
if (!this._layers[orientationValues.group]) {
this._layers[orientationValues.group] = document.createElement("div");
winjsAddClass(this._layers[orientationValues.group], "animationLayer");
mapContainer.appendChild(this._layers[orientationValues.group])
}
this._layers[orientationValues.group].appendChild(this.locationDisplayData[continentName][thisLocation.id][orientation]);
this.cityListPanel.appendChild(this.panelDisplayData[continentName][thisLocation.id])
}
if (this.isContinent(continentName) || this._currentOrientation === this._portrait) {
this._cityListPanel.style.display = "block";
this._showPanelAsync(true).then(this.displayLastUpdatedTime())
}
else {
this._cityListPanel.style.display = "none"
}
}, _removeAllLocationsFromDom: function _removeAllLocationsFromDom() {
var mapContainer=document.querySelector(".mapContainer");
if (mapContainer) {
var layers=mapContainer.querySelectorAll(".animationLayer");
if (layers.length > 0) {
for (var index=0, len=layers.length; index < len; index++) {
mapContainer.removeChild(layers[index])
}
}
}
if (this.cityListPanel) {
while (this.cityListPanel.hasChildNodes()) {
this.cityListPanel.removeChild(this.cityListPanel.lastChild)
}
}
}, _locationBindData: null, _fetchAndBindLocationsDataAsync: function _fetchAndBindLocationsDataAsync(continentName, bypassCache) {
var that=this;
var orientation=this._currentOrientation;
var tempFormat=WeatherAppJS.WarmBoot.Cache.getString("TemperatureFormat");
return new WinJS.Promise(function(complete, error, progress) {
var locations=that.locationGroups[continentName];
var locIdList={};
locations.forEach(function(loc) {
locIdList[loc.id] = loc.locationData.fullName
});
var success=function(locsData, isProgress) {
if (!isProgress) {
msWriteProfilerMark("WeatherApp:WorldWeatherPageLoad:DataFetch:" + continentName + ":e");
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType)
}
CommonJS.Progress.destroySplash(true);
for (var eachLocation in locations) {
try {
var currentLocation=locations[eachLocation];
var locObj=locsData[locIdList[currentLocation.id]];
var ccData=locObj.getCurrentConditions();
var isDataValid=true;
if (locObj) {
if (ccData.tempHigh === undefined && ccData.tempLow === undefined) {
isDataValid = false
}
}
else {
isDataValid = false
}
if (isDataValid) {
if (!that._locationBindData[currentLocation.id]) {
that._locationBindData[currentLocation.id] = {}
}
var locationBindData=that._locationBindData[currentLocation.id];
locationBindData.firstName = currentLocation.name.first;
locationBindData.lastName = currentLocation.name.second;
locationBindData.panelItemOnClick = currentLocation.panelItemOnClick;
locationBindData.skycode = ccData.skycode;
locationBindData.caption = ccData.caption;
locationBindData.tempHigh = (tempFormat === 'MaxMin') ? ccData.tempHigh : ccData.tempLow;
locationBindData.tempLow = (tempFormat === 'MaxMin') ? ccData.tempLow : ccData.tempHigh;
locationBindData.symbolPosition = ccData.symbolPosition;
if (locationBindData.skycode && locationBindData.skycode !== '--') {
locationBindData.displayImg = "block"
}
if (ccData.tempHigh === "--" && ccData.tempLow === "--") {
that.locationDisplayData[continentName][currentLocation.id][orientation].style.display = "none"
}
else {
that.locationDisplayData[continentName][currentLocation.id][orientation].style.display = "block"
}
}
else {
that.locationDisplayData[continentName][currentLocation.id][orientation].style.display = "none"
}
}
catch(exp) {
that.locationDisplayData[continentName][currentLocation.id][orientation].style.display = "none"
}
}
WeatherAppJS.DataManager.getWorldWeatherLastUpdatedTime(continentName).then(function(lastUpdateTime) {
if (lastUpdateTime) {
that._lastUpdatedTime = lastUpdateTime;
that.displayLastUpdatedTime()
}
}, null, function(lastUpdateTime) {
if (lastUpdateTime) {
that._lastUpdatedTime = lastUpdateTime;
that.displayLastUpdatedTime()
}
});
if (!isProgress) {
complete()
}
else {
progress()
}
};
var failure=function(e) {
msWriteProfilerMark("WeatherApp:WorldWeatherPageLoad:DataFetch:" + continentName + ":e");
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
if (PlatformJS.Utilities.isPromiseCanceled(e)) {
return
}
for (var eachLocation in locations) {
var currentLocation=locations[eachLocation];
if (that.locationDisplayData[continentName][currentLocation.id][orientation].style.display !== "block") {
that.locationDisplayData[continentName][currentLocation.id][orientation].style.display = "none"
}
}
that.displayLastUpdatedTime();
error(e)
};
msWriteProfilerMark("WeatherApp:WorldWeatherPageLoad:DataFetch:" + continentName + ":s");
CommonJS.Progress.showProgress(CommonJS.Progress.headerProgressType);
var wwDataPromise=WeatherAppJS.LocationsManager.getWorldWeatherDataForLocationsAsync(continentName, locIdList, bypassCache);
that._promisesStack.push(wwDataPromise);
wwDataPromise.then(success, failure, function(p) {
if (p && p.statusCode && p.statusCode === Platform.DataServices.QueryServiceStatusCode.suspending) {
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString("CouldNotLoadDataMsg", false))
}
else if (p && p.statusCode && p.statusCode === Platform.DataServices.QueryServiceStatusCode.resuming) {
CommonJS.Progress.showProgress(CommonJS.Progress.headerProgressType)
}
else if (p) {
success(p, true)
}
})
})
}, _showPanelAsync: function _showPanelAsync(toggle) {
if (this._currentOrientation === this._landscape) {
return this._showPanelLandscape(toggle)
}
else {
return this._showPanelPortrait(toggle)
}
}, _showPanelLandscape: function _showPanelLandscape(toggle) {
var rtlflip=false;
if (WeatherAppJS.Utilities.Common.getDirection() === "rtl") {
rtlflip = true
}
if (toggle) {
return WinJS.UI.Animation.showPanel(this._cityListPanel, {
left: "300px", top: "0px", rtlflip: rtlflip
})
}
else {
return WinJS.UI.Animation.hidePanel(this._cityListPanel, {
left: "300px", top: "0px", rtlflip: rtlflip
})
}
}, _showPanelPortrait: function _showPanelPortrait(toggle) {
if (toggle) {
return WinJS.UI.Animation.showPanel(this._cityListPanel, {
top: "606px", left: "0px"
})
}
else {
return WinJS.UI.Animation.hidePanel(this._cityListPanel, {
top: "606px", left: "0px"
})
}
}, _startAnimation: function _startAnimation() {
PlatformJS.Navigation.mainNavigator.notifyPageLoadComplete();
msWriteProfilerMark("WeatherApp:WorldWeatherPageAnimation:Start");
var that=this;
that._animateLayer();
if (this._interval) {
clearInterval(this._interval)
}
this._interval = setInterval(function() {
that._animateLayer()
}, PlatformJS.Services.appConfig.getString("WorldWeatherAnimationTime"))
}, _animateLayer: function _animateLayer() {
var that=this;
var layers=this._layers;
var currentLayer=layers[that.currentLayerShown];
WinJS.Utilities.removeClass(currentLayer, "active");
var tilesInCurrentLayer=currentLayer.getElementsByClassName('locationDataWrapper');
WinJS.UI.executeTransition(tilesInCurrentLayer, {
property: '-ms-transform', delay: 0, duration: 500, timing: "linear", to: "scale(0,0)"
}).then(function(){});
var nextLayerIndex=(that.currentLayerShown + 1) % layers.length;
var nextLayer=layers[nextLayerIndex];
WinJS.Utilities.addClass(nextLayer, "active");
var tilesInNextLayer=nextLayer.getElementsByClassName('locationDataWrapper');
WinJS.UI.executeTransition(tilesInNextLayer, {
property: '-ms-transform', delay: 0, duration: 500, timing: "linear", to: "scale(1,1)"
}).then(function(){});
that.currentLayerShown = nextLayerIndex
}, _stopAnimation: function _stopAnimation() {
clearInterval(this._interval);
this._interval = null;
this.currentLayerShown = 0;
msWriteProfilerMark("WeatherApp:WorldWeatherPageAnimation:Stop")
}, cleanUpLocationsData: function cleanUpLocationsData() {
this._stopAnimation();
var locationItems=document.getElementsByClassName('locationDataWrapper');
for (var i=0, len=locationItems.length; i < len; i++) {
locationItems[i].style['-ms-transform'] = "scale(0)"
}
this._removeAllLocationsFromDom()
}, isWorldMapPage: function isWorldMapPage() {
return !(this.isContinent(this._continentName))
}, isContinent: function isContinent(continentName) {
var that=this;
if (continentName in that._continentProperties) {
return that._continentProperties[continentName].id
}
else {
return false
}
}, _showWorldMap: function _showWorldMap() {
var that=this;
var winjsAddClass=WinJS.Utilities.addClass;
var worldMap=document.getElementById('worldMap');
var continentMap=document.getElementById('continentMap');
that._removeMapDisplayClasses(worldMap);
winjsAddClass(worldMap, "showMap");
that._removeMapDisplayClasses(continentMap);
winjsAddClass(continentMap, "hideMap");
var continentNames=worldMap.querySelector("." + this._currentOrientation + " .continentNames");
if (continentNames) {
continentNames.style.display = "block"
}
}, _showContinentMap: function _showContinentMap() {
var that=this;
var winjsAddClass=WinJS.Utilities.addClass;
var worldMap=document.getElementById('worldMap');
var continentMap=document.getElementById('continentMap');
that._removeMapDisplayClasses(continentMap);
winjsAddClass(continentMap, "showMap");
that._removeMapDisplayClasses(worldMap);
winjsAddClass(worldMap, "hideMap")
}, _removeMapDisplayClasses: function _removeMapDisplayClasses(element) {
WinJS.Utilities.removeClass(element, 'showMap hideMap')
}, _setClickHandlers: function _setClickHandlers() {
var that=this;
var flow=WeatherAppJS.Utilities.Common.getDirection();
var orientationList=[this._landscape, this._portrait];
var worldMapContainer=document.getElementById("worldMap");
for (var index in orientationList) {
var orientation=orientationList[index];
var continentNames=worldMapContainer.querySelectorAll("." + orientation + " .mapTouchAreas polygon");
that._setClickHandlersForItems(continentNames, orientation, flow);
continentNames = worldMapContainer.querySelectorAll("." + orientation + " .continentNames .navText");
that._setClickHandlersForItems(continentNames, orientation, flow)
}
var continentMap=document.getElementById('continentMap');
continentMap.addEventListener("keyup", function(event) {
switch (event.keyCode) {
case WinJS.Utilities.Key.escape:
continentMap.click();
break;
default:
break
}
});
that.cityListPanel.addEventListener("keyup", function(event) {
switch (event.keyCode) {
case WinJS.Utilities.Key.escape:
continentMap.click();
break;
default:
break
}
});
continentMap.onclick = function() {
if (that._setClickSwallowTimer() && !that._animationInProgress) {
that._animationInProgress = true;
that._continentName = "World";
that.hideLastUpdatedTime();
that._showPanelAsync(false).then(function() {
that.zoomOut()
})
}
}
}, _setClickHandlersForItems: function _setClickHandlersForItems(continentNames, orientation, flow) {
var that=this;
for (var continent in continentNames) {
if (continentNames[continent].id !== undefined) {
var continentName=continentNames[continent].id.replace("Portrait", "").replace("Text", "");
var continentProps=that._continentProperties[continentName];
var zoomOrigin=continentProps[orientation].zoomOrigin[flow];
var scale=continentProps[orientation].scale;
continentNames[continent].onclick = (function(c, z, s) {
return function() {
if (that._setClickSwallowTimer() && !that._animationInProgress) {
msWriteProfilerMark("WeatherApp:WorldWeatherPage:ContinentLoad:s");
that._animationInProgress = true;
WeatherAppJS.Utilities.Instrumentation.incrementInt32("WorldWeatherContinentClicked");
var eventAttr={continent: c};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "World Weather", "Continent", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr));
that._continentName = c;
that.hideLastUpdatedTime();
that.zoomIn(that._continentName, z, s);
msWriteProfilerMark("WeatherApp:WorldWeatherPage:ContinentLoad:e")
}
}
})(continentName, zoomOrigin, scale);
continentNames[continent].addEventListener("keyup", WeatherAppJS.Utilities.TabIndexManager.HandleKeyboardInvocation);
PlatformJS.Utilities.enablePointerUpDownAnimations(continentNames[continent])
}
}
}, _setClickSwallowTimer: function _setClickSwallowTimer(timeout) {
var that=this;
var timeoutInterval=(isNaN(timeout)) ? 1000 : timeout;
if (!this._clickSwallowTimer) {
this._clickSwallowTimer = setTimeout(function() {
that._clickSwallowTimer = null
}, timeoutInterval);
return this._clickSwallowTimer
}
else {
return null
}
}, zoomIn: function zoomIn(continentName, origin, scale) {
var that=this;
that.cleanUpLocationsData();
that._zoomOrigin = origin;
var mapContainer=document.querySelector(".mapContainer");
if (!mapContainer) {
return
}
var continentMap=mapContainer.querySelector('#continentMap');
var continentImage=continentMap.querySelector("#continentImage");
continentImage.src = this._getImagePath(continentName);
continentImage.setAttribute("alt", PlatformJS.Services.resourceLoader.getString(continentName));
var worldMap=mapContainer.querySelector('#worldMap');
worldMap.style["-ms-transition-property"] = "-ms-transform";
worldMap.style["-ms-transition-duration"] = "0.5s";
worldMap.style["-ms-transition-timing-function"] = "ease-out";
worldMap.style["-ms-transform-origin"] = origin;
worldMap.style["-ms-transform"] = "scale(" + scale + ")";
WinJS.UI.executeTransition(worldMap, {
property: 'opacity', from: 1, delay: 300, duration: 600, timing: "linear", to: 0
}).then(function(event) {
if (continentMap) {
continentMap.focus()
}
});
continentMap.style.display = "block";
var animationAsync=WinJS.UI.executeTransition(continentMap, {
property: 'opacity', from: 0, delay: 300, duration: 400, timing: "linear", to: 1
});
that._promisesStack.push(animationAsync);
animationAsync.then(function() {
worldMap.style.display = "none";
that._animationInProgress = false;
if (PlatformJS.Navigation.currentIPage) {
CommonJS.forceRefresh()
}
})
}, zoomOut: function zoomOut() {
var that=this;
that.cleanUpLocationsData();
var continentMap=document.getElementById('continentMap');
var worldMap=document.getElementById('worldMap');
if (!continentMap || !worldMap) {
return
}
var zoomOutAsync=WinJS.UI.executeTransition(continentMap, {
property: 'opacity', from: 1, delay: 0, duration: 400, timing: "linear", to: 0
});
that._promisesStack.push(zoomOutAsync);
zoomOutAsync.then(function() {
if (PlatformJS.Navigation.currentIPage) {
CommonJS.forceRefresh()
}
});
WinJS.UI.executeTransition(worldMap, {
property: 'opacity', from: 0, delay: 0, duration: 600, timing: "linear", to: 1
}).then(function() {
if (continentMap) {
continentMap.style.display = "none";
that._animationInProgress = false
}
});
worldMap.style["-ms-transition-property"] = "-ms-transform";
worldMap.style["-ms-transition-duration"] = "0.5s";
worldMap.style["-ms-transition-timing-function"] = "ease-out";
worldMap.style["-ms-transform-origin"] = that._zoomOrigin;
worldMap.style.display = "block";
worldMap.style["-ms-transform"] = "scale(" + 1 + ")"
}, displayLocationsData: function displayLocationsData(bypassCache) {
var that=this;
var flow=WeatherAppJS.Utilities.Common.getDirection();
try {
that.cleanUpLocationsData();
if (that.isContinent(that._continentName)) {
var continentImage=document.getElementById('continentImage');
if (continentImage) {
continentImage.src = that._getImagePath(that._continentName);
continentImage.setAttribute("alt", PlatformJS.Services.resourceLoader.getString(that._continentName))
}
that._showContinentMap()
}
else {
that._showWorldMap()
}
that._appendLocationsToDom(that._continentName);
that._fetchAndBindLocationsDataAsync(that._continentName, bypassCache).then(function() {
if (!that._interval) {
that._startAnimation()
}
}, function() {
that._startAnimation()
}, function() {
that._startAnimation()
})
}
catch(ex) {
that.cleanUpLocationsData()
}
}, locationGroups: null, locationDisplayData: null, getPageImpressionContext: function getPageImpressionContext() {
return WeatherAppJS.Instrumentation.PageContext.WorldWeather
}, getLocationDisplayData: function getLocationDisplayData(continent, loc, template, orientation) {
var eachlocationDisplayData=template.querySelector(".locationTileItem");
PlatformJS.Utilities.enablePointerUpDownAnimations(eachlocationDisplayData);
var flow=WeatherAppJS.Utilities.Common.getDirection();
var layoutValues=loc[orientation];
var xpos=parseInt(layoutValues.x);
if (flow === "rtl" && this.isContinent(continent) && orientation === this._landscape) {
xpos = xpos + RTL_MAP_SHIFT
}
if (layoutValues.hpos === "left") {
var imageWidth=this._getViewportWidth(orientation);
eachlocationDisplayData.style.right = (imageWidth - xpos) + "px"
}
else {
eachlocationDisplayData.style.left = xpos + "px"
}
eachlocationDisplayData.style.top = layoutValues.y + "px";
var wrapper=template.querySelector(".locationDataWrapper");
if (layoutValues.hpos === "left") {
WinJS.Utilities.addClass(wrapper, "positionLeft")
}
else {
WinJS.Utilities.addClass(wrapper, "positionRight")
}
if (layoutValues.vpos === "bottom") {
WinJS.Utilities.addClass(wrapper, "positionBottom")
}
else {
WinJS.Utilities.addClass(wrapper, "positionTop")
}
var arrowImg=template.querySelector(".arrowImg");
if ((layoutValues.hpos === "left" && layoutValues.vpos !== "bottom") || (layoutValues.hpos !== "left" && layoutValues.vpos === "bottom")) {
arrowImg.src = "/images/worldweather/arrow-bottomright.png"
}
else {
arrowImg.src = "/images/worldweather/arrow-topleft.png"
}
var point=template.querySelector(".bullet");
point.style.left = xpos + "px";
point.style.top = layoutValues.y + "px";
var onClickHandler=function() {
msWriteProfilerMark("WeatherApp:WorldWeatherPage:LocationClicked");
WeatherAppJS.Utilities.Instrumentation.incrementInt32("WorldWeatherClickToCityDetails");
var eventAttr={location: loc.locationData.getFullDisplayName()};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "World Weather", "World Weather City", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr));
var defaultLoc=WeatherAppJS.SettingsManager.getDefaultLocationId();
if (defaultLoc === loc.locationData.getId()) {
PlatformJS.Navigation.navigateToChannel('Home')
}
else {
PlatformJS.Navigation.navigateToChannel('Home', {
locID: loc.locationData.getId(), geocodeLocation: loc.locationData
})
}
};
var shadowBox=template.querySelector(".locationShadowBox");
shadowBox.addEventListener("click", onClickHandler, false);
point.addEventListener("click", onClickHandler, false);
return template
}, createLocationDisplayDataAsync: function createLocationDisplayDataAsync(eachContinent) {
var that=this;
var promises=[];
var landscape=this._landscape;
var portrait=this._portrait;
var locationGroups=this.locationGroups;
that.locationDisplayData[eachContinent] = {};
var locations=locationGroups[eachContinent];
for (var eachLocation in locations) {
(function(continent, loc) {
that.locationDisplayData[continent][loc.id] = {};
that._locationBindData[loc.id].displayImg = 'none';
that._locationBindData[loc.id] = WinJS.Binding.as(that._locationBindData[loc.id]);
promises.push(CommonJS.loadModule({
fragmentPath: "/panoramas/worldweather/mapsTemplate.html", templateId: "eachLocationTileItem"
}, that._locationBindData[loc.id], null, null, null).then(function(template) {
var locationData=that.getLocationDisplayData(continent, loc, template, landscape);
that.locationDisplayData[continent][loc.id][landscape] = locationData
}));
promises.push(CommonJS.loadModule({
fragmentPath: "/panoramas/worldweather/mapsTemplate.html", templateId: "eachLocationTileItem"
}, that._locationBindData[loc.id], null, null, null).then(function(template) {
var locationDataPortrait=that.getLocationDisplayData(continent, loc, template, portrait);
that.locationDisplayData[continent][loc.id][portrait] = locationDataPortrait
}))
})(eachContinent, locations[eachLocation])
}
return WinJS.Promise.join(promises)
}, panelDisplayData: null, _promiseDisplayData: null, createPanelDisplayDataAsync: function createPanelDisplayDataAsync(eachContinent) {
var that=this;
var locationGroups=this.locationGroups;
var promises=[];
that.panelDisplayData[eachContinent] = {};
var locations=locationGroups[eachContinent];
for (var eachLocation in locations) {
var thisLocation=locations[eachLocation];
that._locationBindData[thisLocation.id] = WinJS.Binding.as(that._locationBindData[thisLocation.id]);
(function(continent, loc) {
promises.push(CommonJS.loadModule({
fragmentPath: '/panoramas/worldweather/mapsTemplate.html', templateId: 'eachPanelItem'
}, that._locationBindData[loc.id], null, null, null).then(function(template) {
that.panelDisplayData[continent][loc.id] = template;
PlatformJS.Utilities.enablePointerUpDownAnimations(that.panelDisplayData[continent][loc.id]);
template.querySelector(".panelItem").addEventListener("keydown", function(event) {
switch (event.keyCode) {
case WinJS.Utilities.Key.upArrow:
if (event.target && event.target.parentNode && event.target.parentNode.previousSibling && event.target.parentNode.previousSibling.firstElementChild) {
event.target.parentNode.previousSibling.firstElementChild.focus()
}
break;
case WinJS.Utilities.Key.downArrow:
if (event.target && event.target.parentNode && event.target.parentNode.nextSibling && event.target.parentNode.nextSibling.firstElementChild) {
event.target.parentNode.nextSibling.firstElementChild.focus()
}
break;
case WinJS.Utilities.Key.enter:
case WinJS.Utilities.Key.space:
if (event.target) {
event.target.click()
}
break;
default:
break
}
})
}))
})(eachContinent, thisLocation)
}
return WinJS.Promise.join(promises)
}, getGeocodeLocationsData: function getGeocodeLocationsData() {
var that=this;
var locationGroups=this.locationGroups;
var locationSuggest=WeatherAppJS.LocationSuggest;
for (var eachContinent in locationGroups) {
var locations=locationGroups[eachContinent];
for (var eachLocation in locations) {
var loc=locations[eachLocation];
var s=locationSuggest.getWorldWeatherGeocodeLocation(loc);
if (s) {
loc.locationData = s
}
else {
throw"Error creating geocode location object for " + loc.id;
}
}
}
}, createDisplayDataAsync: function createDisplayDataAsync(continent) {
var that=WeatherAppJS.WorldWeather;
var winjsEventHandler=WinJS.UI.eventHandler;
var locationGroups=this.locationGroups;
var locations=locationGroups[continent];
var symbolPosition=WeatherAppJS.Utilities.Formatting.getSymbolPosition();
for (var eachLocation in locations) {
var thisLocation=locations[eachLocation];
thisLocation.panelItemOnClick = that.getPanelItemOnClick(thisLocation);
winjsEventHandler(thisLocation.panelItemOnClick);
if (!this._locationBindData[thisLocation.id]) {
this._locationBindData[thisLocation.id] = {}
}
var locationBindData=this._locationBindData[thisLocation.id];
locationBindData.panelItemOnClick = thisLocation.panelItemOnClick;
locationBindData.firstName = thisLocation.name.first;
locationBindData.lastName = thisLocation.name.second;
locationBindData.skycode = "";
locationBindData.caption = "";
locationBindData.tempHigh = "";
locationBindData.tempLow = "";
locationBindData.symbolPosition = symbolPosition;
locationBindData.displayImg = "none"
}
var promisePanelData=this.createPanelDisplayDataAsync(continent);
var timeoutPromise=WinJS.Promise.timeout(0);
var promiseLocationData=this.createLocationDisplayDataAsync(continent);
return WinJS.Promise.join([promiseLocationData, timeoutPromise, promisePanelData])
}, cleanUpWeatherDataRefresh: function cleanUpWeatherDataRefresh() {
this.cleanPeriodicTimersStack();
WeatherAppJS.SettingsManager.removeEventListener('settingchanged', this.onSettingsChange)
}, parseLocationGroupsFile: function parseLocationGroupsFile(jsonText) {
var locationGroups=JSON.parse(jsonText);
var resources=PlatformJS.Services.resourceLoader;
for (var eachContinent in locationGroups) {
var locations=locationGroups[eachContinent];
for (var eachLocation in locations) {
locations[eachLocation].name.first = resources.getString("/worldweather/" + locations[eachLocation].name.first);
locations[eachLocation].name.second = resources.getString("/worldweather/" + locations[eachLocation].name.second)
}
}
return locationGroups
}, getPageData: function getPageData() {
var that=this;
var resourceLoader=PlatformJS.Services.resourceLoader;
CommonJS.Progress.showProgress(CommonJS.Progress.headerProgressType);
var title=resourceLoader.getString("WorldWeatherTitle");
var subTitle="";
if (!this.isWorldMapPage()) {
subTitle = resourceLoader.getString(that._continentName)
}
var pageData={
headerTitle: title, headerSubTitle: subTitle, HelpButtonTitle: resourceLoader.getString("/platform/HelpLabel"), RefreshButtonTitle: resourceLoader.getString("RefreshButtonTitle"), ChangeUnitToFButtonTitle: resourceLoader.getString("ChangeUnitToFButtonTitle"), ChangeUnitToCButtonTitle: resourceLoader.getString("ChangeUnitToCButtonTitle"), CurrentLocationButtonTitle: resourceLoader.getString("CurrentLocationButtonTitle")
};
if (Object.keys(this.locationGroups).length === 0) {
return WinJS.xhr({url: PlatformJS.Services.appConfig.getString("WorldWeatherLocationGroupsFile")}).then(function(request) {
try {
var locations=that.parseLocationGroupsFile(request.responseText);
Object.keys(locations).forEach(function(key) {
that.locationGroups[key] = locations[key]
});
that.getGeocodeLocationsData();
that.cleanUpWeatherDataRefresh();
if (!that.panelDisplayData[that._continentName] || !that.locationDisplayData[that._continentName]) {
that._promiseDisplayData = that.createDisplayDataAsync(that._continentName)
}
}
catch(ex) {}
return pageData
}, function() {
return pageData
})
}
else if (!that.panelDisplayData[that._continentName] || !that.locationDisplayData[that._continentName]) {
that._promiseDisplayData = that.createDisplayDataAsync(that._continentName)
}
this.cleanUpWeatherDataRefresh();
this.cleanUpLocationsData();
return WinJS.Promise.wrap(pageData)
}, onBindingComplete: function onBindingComplete() {
WinJS.Resources.processAll();
var that=this;
if (this._promiseDisplayData) {
this._promiseDisplayData.then(function() {
that.displayLocationsData(false);
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType)
});
this._promiseDisplayData = null
}
else {
this.displayLocationsData(false);
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType)
}
WeatherAppJS.SettingsManager.addEventListener('settingchanged', this.onSettingsChange, false);
this.cleanPeriodicTimersStack();
var dataRefreshTimerId=setInterval(this.onPageRefresh, PlatformJS.Services.appConfig.getString("PageRefreshTime"));
that._timersStack.push(dataRefreshTimerId);
this.initializeEdgyActionHandlers()
}, initializeEdgyActionHandlers: function initializeEdgyActionHandlers() {
if (this._isEdgyActionHandlersInitialized) {
return
}
this._isEdgyActionHandlersInitialized = true;
var bEdgyElement=document.getElementById("bottomEdgy");
if (bEdgyElement) {
this._bEdgy = bEdgyElement.winControl;
this._helpButton = bEdgyElement.querySelector("#helpButton");
this._refreshButton = bEdgyElement.querySelector("#refreshButton");
this._changeUnitToFButton = bEdgyElement.querySelector("#changeUnitToFButton");
this._changeUnitToCButton = bEdgyElement.querySelector("#changeUnitToCButton");
this._currentLocationButton = bEdgyElement.querySelector("#currentLocationButton")
}
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
});
this._currentLocationButton.addEventListener("click", function(e) {
that.onCurrentLocationClick(e)
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
var isCurrentLocationDetection=Platform.Utilities.Globalization.isFeatureEnabled("CurrentLocationDetection");
toggleShowButton(this._currentLocationButton, isCurrentLocationDetection ? true : false)
}, onWindowResize: function onWindowResize(event) {
CommonJS.WindowEventManager.HandleWindowResizeEvent.call(this, event, function HandleWindowResize() {
msWriteProfilerMark("WeatherApp:OrientationChange:s");
this.currentLayerShown = 0;
var detail=event.detail || event.platFormDetail;
if (detail.hasOrientationChanged) {
this.cleanUpLocationsData();
if (this._continentName !== "World") {
this._zoomOrigin = this._continentProperties[this._continentName][this._currentOrientation].zoomOrigin
}
CommonJS.forceRefresh()
}
msWriteProfilerMark("WeatherApp:OrientationChange:e")
})
}
}, {getPanelItemOnClick: function getPanelItemOnClick(loc) {
return function() {
WeatherAppJS.Utilities.Instrumentation.incrementInt32("WorldWeatherClickToCityDetails");
var eventAttr={location: loc.locationData.getFullDisplayName()};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "World Weather Panel", "World Weather City", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr));
var defaultLoc=WeatherAppJS.SettingsManager.getDefaultLocationId();
if (defaultLoc === loc.locationData.getId()) {
PlatformJS.Navigation.navigateToChannel('Home')
}
else {
PlatformJS.Navigation.navigateToChannel('Home', {
locID: loc.locationData.getId(), geocodeLocation: loc.locationData
})
}
}
}})})
})()