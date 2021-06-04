/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
WinJS.Namespace.define("WeatherAppJS.Controls.Clusters", {interactiveMapsClusterControl: WinJS.Class.define(function(element, options) {
var that=this;
element = this.element = element ? element : document.createElement("div");
WinJS.Utilities.addClass(this.element, "interactiveMapsCluster " + CommonJS.RESPONSIVE_RESIZABLE_CLASS);
element.winControl = this;
this._mapElement = document.createElement("div");
this._mapElement.className = "interactiveMapsElement";
this.element.appendChild(this._mapElement);
this.supportsContentRefresh = true;
that._promiseStack = [];
that.fetchOverlayImagePromise = {};
WinJS.UI.setOptions(this, options);
var loc=WeatherAppJS.GeocodeCache.getLocation(this.locId);
if (loc) {
this.latitude = parseFloat(WeatherAppJS.Utilities.Common.trimLatLong(loc.latitude));
this.longitude = parseFloat(WeatherAppJS.Utilities.Common.trimLatLong(loc.longitude));
this.isoCode = loc.isoCode
}
WinJS.UI.Fragments.renderCopy("/html/delayedTemplate.html", document.body).then(function mapsTemplate(doc) {
that.initStaticMapImageSources()
})
}, {
_id: "WeatherAppJS.Controls.Clusters.interactiveMapsClusterControl", _OverlayCacheId: "MapsImageFrameCache", _StaticMapCacheId: "StaticMapsImageCache", _promiseStack: null, _viewPort: null, _baseMapDiv: null, _overlayDiv: null, _labelsDiv: null, _filterBar: null, _progressDiv: null, _errorElt: null, _progressElt: null, _legendDiv: null, _legend: null, _timestampDiv: null, _isRenderComplete: false, _overlayDivWidth: null, _overlayDivHeight: null, locId: null, bypassCache: false, isFre: false, clusterKey: null, currentIPage: null, latitude: null, longitude: null, isoCode: null, mapWidth: 870, mapHeight: 749, _iMapsData: null, iMapsData: {get: function get() {
return this._iMapsData
}}, _currentMapIndex: null, currentMapIndex: {
get: function get() {
return this._currentMapIndex
}, set: function set(value) {
if (this._iMapsData && this._iMapsData.MapTypes && this._iMapsData.MapTypes[value]) {
this._currentMapIndex = value;
this._initMapConfig()
}
}
}, getOverlayImageSource: function getOverlayImageSource(mapIndex) {
return {
url: this._iMapsData.MapTypes[mapIndex].Url, cacheId: this._OverlayCacheId, alt: PlatformJS.Services.resourceLoader.getString("MapImageAltText")
}
}, getOverlayImageData: function getOverlayImageData(mapIndex) {
if (!this._iMapsData) {
return null
}
return this._iMapsData.MapTypes[mapIndex]
}, _baseMapImageSourceLight: null, _baseMapImageSourceDark: null, baseMapImageSource: {get: function get() {
if (!MapConfigs.getMapScenarioConfigItem("DarkMapThemeActive").value) {
return this._baseMapImageSourceLight
}
else {
return this._baseMapImageSourceDark
}
}}, _labelsImageSourceLight: null, _labelsImageSourceDark: null, labelsImageSource: {get: function get() {
if (!MapConfigs.getMapScenarioConfigItem("DarkMapThemeActive").value) {
return this._labelsImageSourceLight
}
else {
return this._labelsImageSourceDark
}
}}, _fetchBaseMapImagePromise: null, fetchBaseMapImagePromise: {
get: function get() {
if (!this._fetchBaseMapImagePromise) {
return null
}
else {
return this._fetchBaseMapImagePromise[MapConfigs.getMapScenarioConfigItem("DarkMapThemeActive").value ? "Dark" : "Light"]
}
}, set: function set(fetchBaseMapImagePromise) {
if (!this._fetchBaseMapImagePromise) {
this._fetchBaseMapImagePromise = {}
}
this._fetchBaseMapImagePromise[MapConfigs.getMapScenarioConfigItem("DarkMapThemeActive").value ? "Dark" : "Light"] = fetchBaseMapImagePromise
}
}, _fetchLabelsImagePromise: null, fetchLabelsImagePromise: {
get: function get() {
if (!this._fetchLabelsImagePromise) {
return null
}
else {
return this._fetchLabelsImagePromise[MapConfigs.getMapScenarioConfigItem("DarkMapThemeActive").value ? "Dark" : "Light"]
}
}, set: function set(fetchLabelsImagePromise) {
if (!this._fetchLabelsImagePromise) {
this._fetchLabelsImagePromise = {}
}
this._fetchLabelsImagePromise[MapConfigs.getMapScenarioConfigItem("DarkMapThemeActive").value ? "Dark" : "Light"] = fetchLabelsImagePromise
}
}, fetchOverlayImagePromise: null, _initMapConfig: function _initMapConfig() {
if (this.currentMapIndex !== null) {
var mapData=this.getOverlayImageData(this.currentMapIndex);
if (mapData) {
MapConfigs.initMapScenarioConfig(mapData.MapType, mapData.MapSubType)
}
}
else {
MapConfigs.initMapScenarioConfig()
}
}, _setOverlayImage: function _setOverlayImage(mapIndex) {
var that=this;
if (!that.iMapsData) {
return
}
var idx=(that.iMapsData[mapIndex]) ? mapIndex : that.currentMapIndex;
if (idx !== null && idx !== undefined) {
var overlay=WinJS.Utilities.query(".platformImageCard", that._overlayDiv)[0];
if (overlay && overlay.winControl) {
overlay.winControl.imageSource = that.getOverlayImageSource(idx);
overlay.winControl.alternateText = that.getOverlayImageSource(idx).alt;
that._setOverlayImageStyles(that._overlayDiv, that.getOverlayImageData(idx))
}
}
}, _setBaseMapImage: function _setBaseMapImage() {
var that=this;
var baseMap=WinJS.Utilities.query(".platformImageCard", that._baseMapDiv)[0];
if (baseMap && baseMap.winControl && that.baseMapImageSource) {
baseMap.winControl.imageSource = that.baseMapImageSource;
baseMap.winControl.alternateText = that.baseMapImageSource.alt
}
}, _setLabelsImage: function _setLabelsImage() {
var that=this;
var labels=WinJS.Utilities.query(".platformImageCard", that._labelsDiv)[0];
if (labels && labels.winControl && that.labelsImageSource) {
labels.winControl.imageSource = that.labelsImageSource;
labels.winControl.alternateText = that.labelsImageSource.alt
}
}, _fetchMapsResponseAsync: function _fetchMapsResponseAsync() {
var that=this;
return WeatherAppJS.LocationsManager.getInteractiveMapsClusterDataForLocationAsync(that.locId, that.isoCode, that.bypassCache, that.isFre).then(function(locObj) {
if (locObj) {
var iMapsData=locObj.getInteractiveMaps();
if (iMapsData && iMapsData.MapTypes && iMapsData.MapTypes.length > 0 && iMapsData.RegionName) {
that._iMapsData = iMapsData
}
else {
return WinJS.Promise.wrapError("Invalid maps cluster data")
}
}
})
}, _fetchImageFromSourceAsync: function _fetchImageFromSourceAsync(imageSource, bypassCache) {
return WeatherAppJS.Utilities.Common.fetchSingleResolutionImageAsync(imageSource, bypassCache).then()
}, _fetchBaseMapImageAsync: function _fetchBaseMapImageAsync() {
var that=this;
if (!that.fetchBaseMapImagePromise) {
that.fetchBaseMapImagePromise = that._fetchImageFromSourceAsync(that.baseMapImageSource, that.bypassCache)
}
return that.fetchBaseMapImagePromise
}, _fetchOverlayImageAsync: function _fetchOverlayImageAsync(mapIndex) {
var that=this;
if (!that.fetchOverlayImagePromise[mapIndex]) {
var imageSource=that.getOverlayImageSource(mapIndex);
that.fetchOverlayImagePromise[mapIndex] = that._fetchImageFromSourceAsync(imageSource, that.bypassCache)
}
return that.fetchOverlayImagePromise[mapIndex]
}, _fetchLabelsImageAsync: function _fetchLabelsImageAsync() {
var that=this;
if (!that.fetchLabelsImagePromise) {
that.fetchLabelsImagePromise = that._fetchImageFromSourceAsync(that.labelsImageSource, that.bypassCache)
}
return that.fetchLabelsImagePromise
}, _fetchCurrentMapImagesAsync: function _fetchCurrentMapImagesAsync() {
var that=this;
this.fetchBaseMapImage = that._fetchBaseMapImageAsync().then(function(){});
this.fetchOverlayImageAsync = that._fetchOverlayImageAsync(that.currentMapIndex).then(function(){});
this.fetchLabelsImageAsync = that._fetchLabelsImageAsync().then(function(){});
return WinJS.Promise.join([this.fetchBaseMapImage, this.fetchOverlayImageAsync, this.fetchLabelsImageAsync]).then(function(){})
}, _prefetchOtherMapImages: function _prefetchOtherMapImages() {
var that=this;
if (!that.isFre) {
WeatherAppJS.Utilities.Common.prefetchImage(that._baseMapImageSourceLight);
WeatherAppJS.Utilities.Common.prefetchImage(that._baseMapImageSourceDark);
WeatherAppJS.Utilities.Common.prefetchImage(that._labelsImageSourceLight);
WeatherAppJS.Utilities.Common.prefetchImage(that._labelsImageSourceDark);
var mapTypes=that.iMapsData.MapTypes;
for (var i=0; i < mapTypes.length; i++) {
WeatherAppJS.Utilities.Common.prefetchImage(that.getOverlayImageSource(i))
}
}
}, _removeCluster: function _removeCluster() {
var that=this;
var clusterKey=that.clusterKey;
if (clusterKey && that.currentIPage && that.currentIPage._data) {
that.dispose();
var clusters=that.currentIPage._data;
for (var i=0; i < clusters.length; i++) {
if (clusters.getItem(i).data.clusterKey === clusterKey) {
clusters.splice(i, 1);
break
}
}
}
}, _computeMapClusterSize: function _computeMapClusterSize(resizedDimensions) {
var that=this;
if (!that.iMapsData) {
return
}
var iMapsContainer=WinJS.Utilities.query(".iMapsContainer", this.element)[0];
if (iMapsContainer && that._viewPort) {
var mapClusterMaxWidth=that.mapWidth;
var mapClusterMinWidth=480;
var mapClusterMaxHeight=that.mapHeight;
var mapClusterMinHeight=524;
var windowWidth=(resizedDimensions && resizedDimensions.width) ? resizedDimensions.width : window.innerWidth;
var windowHeight=(resizedDimensions && resizedDimensions.height) ? resizedDimensions.height : window.innerHeight;
var screenWidth=windowWidth - 20;
var screenHeight=windowHeight - 226;
var tempContainerWidth=(screenWidth >= mapClusterMinWidth && screenWidth <= mapClusterMaxWidth) ? screenWidth : (screenWidth > mapClusterMaxWidth ? mapClusterMaxWidth : mapClusterMinWidth);
var tempContainerHeight=(screenHeight >= mapClusterMinHeight && screenHeight <= mapClusterMaxHeight) ? screenHeight : (screenHeight > mapClusterMaxHeight ? mapClusterMaxHeight : mapClusterMinHeight);
var imapsContainerWidth=tempContainerWidth;
var imapsInnerContainerHeight=tempContainerWidth / 0.8;
if (imapsInnerContainerHeight > tempContainerHeight) {
imapsInnerContainerHeight = tempContainerHeight;
if (tempContainerWidth > tempContainerHeight * 1.2) {
imapsContainerWidth = tempContainerHeight * 1.2
}
else {
imapsContainerWidth = tempContainerWidth
}
}
if (screenWidth < that.mapWidth) {
imapsInnerContainerHeight = imapsInnerContainerHeight - 40
}
that._overlayDivWidth = imapsContainerWidth;
that._overlayDivHeight = imapsInnerContainerHeight;
iMapsContainer.style.width = that._overlayDivWidth + "px";
that._viewPort.style.height = that._overlayDivHeight + "px"
}
}, _setOverlayImageStyles: function _setOverlayImageStyles(overlayDiv, overlayImageData) {
var latitude=this.latitude;
var longitude=this.longitude;
var bounds=overlayImageData.MapBounds;
var zoom=PlatformJS.Services.appConfig.getInt32("InteractiveMapsClusterZoomLevel");
var topLeft=WeatherAppJS.Utilities.Common.tryLatLongToPixel(parseFloat(bounds.North), parseFloat(bounds.West), zoom);
var bottomRight=WeatherAppJS.Utilities.Common.tryLatLongToPixel(parseFloat(bounds.South), parseFloat(bounds.East), zoom);
var locPoint=WeatherAppJS.Utilities.Common.tryLatLongToPixel(latitude, longitude, zoom);
var mapswidth=this._overlayDivWidth ? this._overlayDivWidth : WinJS.Utilities.getTotalWidth(overlayDiv);
var mapsheight=this._overlayDivHeight ? this._overlayDivHeight : WinJS.Utilities.getTotalHeight(overlayDiv);
if (topLeft && bottomRight && locPoint) {
var scaledImgWidth=bottomRight.x - topLeft.x;
var scaledImgHeight=bottomRight.y - topLeft.y;
var offsetX=((topLeft.x - locPoint.x) + mapswidth / 2);
var offsetY=((topLeft.y - locPoint.y) + mapsheight / 2);
var imgDiv=WinJS.Utilities.query(".platformImageCardImage", overlayDiv)[0];
if (imgDiv) {
imgDiv.style.backgroundSize = scaledImgWidth + "px " + scaledImgHeight + "px";
imgDiv.style.backgroundPosition = offsetX + "px " + offsetY + "px";
imgDiv.style.opacity = ("Alpha" in overlayImageData) ? overlayImageData.Alpha : 1
}
}
}, _addMapFilters: function _addMapFilters(filterBar) {
var that=this;
if (filterBar) {
var mapTypes=that.iMapsData.MapTypes;
for (var m in mapTypes) {
var button=document.createElement('div');
button.id = mapTypes[m].MapType + "MapFilterButton";
button.setAttribute("tabindex", "0");
button.setAttribute("role", "button");
WinJS.Utilities.addClass(button, "iMapsFilterButton");
var mapButtonImg=document.createElement("div");
WinJS.Utilities.addClass(mapButtonImg, "iMapsFilterButtonImage ");
WinJS.Utilities.addClass(mapButtonImg, "icon" + mapTypes[m].MapType + "MapType");
button.appendChild(mapButtonImg);
var titleDiv=document.createElement('div');
titleDiv.innerText = PlatformJS.Services.resourceLoader.getString(mapTypes[m].MapType + 'Map');
WinJS.Utilities.addClass(titleDiv, "iMapsFilterButtonTitle");
button.appendChild(titleDiv);
button.addEventListener("click", (function switchMapType_onClickClosure(mapIndex, mapType) {
return function switchMapType_onClick(evt) {
var eventAttr={region: that.iMapsData.RegionName};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Maps Cluster", mapType, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr));
that._switchMapTypeAsync(mapIndex)
}
})(m, mapTypes[m].MapType));
button.addEventListener("keyup", WeatherAppJS.Utilities.TabIndexManager.HandleKeyboardInvocation);
button.addEventListener('keydown', function handleArrowKeys(evt) {
WeatherAppJS.Utilities.TabIndexManager.handleArrowKeyForAccessibility(evt, true)
}, false);
filterBar.appendChild(button)
}
}
}, _getFirstMapIndex: function _getFirstMapIndex() {
if (this.isoCode) {
var defaultMapType=MapConfigs.getDefaultMapTypeForIsoCode(this.isoCode);
if (defaultMapType) {
var mapTypes=this.iMapsData.MapTypes;
for (var m in mapTypes) {
if (mapTypes[m].MapType && defaultMapType.toUpperCase() === mapTypes[m].MapType.toUpperCase()) {
return +m
}
}
}
}
return 0
}, _selectMapTypeButton: function _selectMapTypeButton(mapIndex) {
if (this._filterBar) {
var filterButtons=this._filterBar.querySelectorAll(".iMapsFilterButton");
for (var b in filterButtons) {
WinJS.Utilities.removeClass(filterButtons[b], "selected")
}
var selectedButton=filterButtons[mapIndex];
if (selectedButton) {
WinJS.Utilities.addClass(selectedButton, "selected")
}
}
}, _switchMapTypeAsync: function _switchMapTypeAsync(mapIndex) {
var that=this;
if (that._switchMapTypePromise) {
that._switchMapTypePromise.cancel();
that._switchMapTypePromise = null
}
that._switchMapTypePromise = WinJS.UI.Animation.fadeOut([that._overlayDiv, that._legendDiv, that._timestampDiv]).then(function mapSwitchFadeOut_complete() {
that.currentMapIndex = mapIndex;
that._selectMapTypeButton(mapIndex);
that._showProgress();
if (MapConfigs.getMapScenarioConfigItem("DarkMapThemeActive").value) {
WinJS.Utilities.addClass(that._viewPort, "darkMapBase")
}
else {
WinJS.Utilities.removeClass(that._viewPort, "darkMapBase")
}
return that._fetchCurrentMapImagesAsync().then(function fetchCurrentMapImages_complete() {
that._hideProgress();
that._setOverlayImage();
that._setBaseMapImage();
that._setLabelsImage();
that._renderLegendControl();
var divArray=[that._overlayDiv, that._legendDiv, that._timestampDiv];
var nonNullDivArray=[];
for (var i=0; i < divArray.length; i++) {
if (divArray[i]) {
nonNullDivArray.push(divArray[i])
}
}
return WinJS.UI.Animation.fadeIn(nonNullDivArray)
}, function fetchCurrentMapImages_error(e) {
that._hideProgress();
that._handleDataFetchError(e)
})
});
return that._switchMapTypePromise
}, _navigateToMap: function _navigateToMap() {
msWriteProfilerMark("WeatherApp:HomePage:InteractiveMapClicked");
if (this.iMapsData && this.currentMapIndex !== null && !this.isFre) {
var data=this.iMapsData.MapTypes[this.currentMapIndex];
var zoom=PlatformJS.Services.appConfig.getInt32("InteractiveMapsClusterZoomLevel");
if (data) {
var map=WeatherAppJS.Utilities.UI.getPageStateForMapType(data.MapType, data.MapSubType);
PlatformJS.Navigation.navigateToChannel("WeatherMaps", {
region: this.iMapsData.RegionName, latitude: this.latitude, longitude: this.longitude, isoCode: this.isoCode, map: map, zoomLevel: zoom
})
}
}
}, _renderLegendControl: function _renderLegendControl() {
var that=this;
var mapData=that.getOverlayImageData(that.currentMapIndex);
if (!mapData || !that._legend || !that._legendDiv || !that._timestampDiv || that.isFre) {
return
}
var legendConfig=WeatherAppJS.Maps.Legend.createConfig(mapData.LegendDataList);
if (legendConfig) {
that._legend.render(legendConfig)
}
that._timestampDiv.innerText = WeatherAppJS.Maps.Utilities.formatSnapTime(mapData.SnapTime)
}, _showError: function _showError() {
var that=this;
if (!this._errorElt) {
this._errorElt = WeatherAppJS.Error.createErrorModule(function errorModule_retry() {
that._clearState();
that.render()
}, this.mapWidth + "px", this.mapHeight + "px", this._mapElement)
}
this._hideProgress();
WinJS.Utilities.removeClass(this._errorElt, "platformHide")
}, _hideError: function _hideError() {
if (this._errorElt) {
WinJS.Utilities.addClass(this._errorElt, "platformHide")
}
}, _showProgress: function _showProgress() {
if (!this._progressElt) {
this._progressElt = WeatherAppJS.Error.createProgressModule("100%", "100%", this._progressDiv)
}
this._hideError();
WinJS.Utilities.removeClass(this._progressElt, "platformHide")
}, _hideProgress: function _hideProgress() {
if (this._progressElt) {
WinJS.Utilities.addClass(this._progressElt, "platformHide")
}
}, _handleDataFetchError: function _handleDataFetchError(e) {
var that=this;
that._clearCurrentMapTypePromises();
if (WeatherAppJS.Controls.Utilities.isCancellationError(e)) {
return
}
that._showError()
}, _clearCurrentMapTypePromises: function _clearCurrentMapTypePromises() {
var that=this;
if (that.fetchBaseMapImagePromise) {
that.fetchBaseMapImagePromise.cancel();
that.fetchBaseMapImagePromise = null
}
if (that.fetchLabelsImagePromise) {
that.fetchLabelsImagePromise.cancel();
that.fetchLabelsImagePromise = null
}
if (that.fetchOverlayImagePromise[that.currentMapIndex]) {
that.fetchOverlayImagePromise[that.currentMapIndex].cancel();
that.fetchOverlayImagePromise[that.currentMapIndex] = null
}
}, _clearAllPromises: function _clearAllPromises() {
var that=this;
WeatherAppJS.Utilities.Common.cleanupPromiseStack(that._promisesStack);
if (that._switchMapTypePromise) {
that._switchMapTypePromise.cancel()
}
var promiseCaches=[that._fetchLabelsImagePromise, that._fetchBaseMapImagePromise, that.fetchOverlayImagePromise];
promiseCaches.forEach(function(promiseCache) {
for (var p in promiseCache) {
if (promiseCache[p]) {
promiseCache[p].cancel();
delete promiseCache[p]
}
}
})
}, _clearState: function _clearState() {
var that=this;
that._clearAllPromises();
that._viewPort = null,
that._baseMapDiv = null,
that._overlayDiv = null,
that._labelsDiv = null,
that._filterBar = null,
that._progressElt = null;
that._errorElt = null;
that._legendDiv = null;
if (that._legend) {
that._legend.dispose();
that._legend = null
}
that._timestampDiv = null;
that._iMapsData = null;
that._currentMapIndex = null;
that._baseMapImageSourceDark = null;
that._baseMapImageSourceLight = null;
that._labelsImageSourceDark = null;
that._labelsImageSourceLight = null;
that.fetchOverlayImagePromise = {}
}, initStaticMapImageSources: function initStaticMapImageSources() {
var baseMapUrl=(!this.isFre) ? PlatformJS.Services.appConfig.getString("StaticMapBaseLayerUriFormat") : PlatformJS.Services.appConfig.getString("SampleInteractiveMapsBaseMapImage");
var labelsUrl=(!this.isFre) ? PlatformJS.Services.appConfig.getString("StaticMapLabelsLayerUriFormat") : PlatformJS.Services.appConfig.getString("SampleInteractiveMapsLabelsImage");
var zoom=PlatformJS.Services.appConfig.getInt32("InteractiveMapsClusterZoomLevel");
var bingMapsKey=PlatformJS.Services.appConfig.getString("BingMapsKey");
var market=Platform.Globalization.Marketization.getMarketLocation();
var culture=MapConfigs.getStaticMapAPICultureParam();
var point=this.latitude + "," + this.longitude;
if (window.innerWidth <= 1366) {
if (window.innerHeight <= 768) {
this.mapWidth = 650;
this.mapHeight = 540
}
if (window.innerHeight > 768 && window.innerHeight <= 1366) {
this.mapWidth = 748
}
}
if (window.innerWidth > 1366 && window.innerHeight > 768 && window.innerWidth <= 1371 && window.innerHeight <= 771) {
this.mapWidth = 655;
this.mapHeight = 545
}
if (window.innerWidth > 1371 && window.innerHeight > 771 && window.innerWidth <= 1422 && window.innerHeight <= 800) {
this.mapWidth = 690;
this.mapHeight = 580
}
baseMapUrl = baseMapUrl.replace("\{zoomLevel\}", zoom).replace("\{bingMapsKey\}", bingMapsKey).replace("\{point\}", point).replace("\{mapWidth\}", this.mapWidth).replace("\{mapHeight\}", this.mapHeight);
labelsUrl = labelsUrl.replace("\{zoomLevel\}", zoom).replace("\{bingMapsKey\}", bingMapsKey).replace(/\{point\}/g, point).replace("\{mapWidth\}", this.mapWidth).replace("\{mapHeight\}", this.mapHeight).replace("\{culture\}", culture).replace("\{userRegion\}", market);
var baseAerialMapUrl=(!this.isFre) ? PlatformJS.Services.appConfig.getString("StaticAerialMapBaseLayerUriFormat") : PlatformJS.Services.appConfig.getString("SampleInteractiveMapsBaseMapImage");
baseAerialMapUrl = baseAerialMapUrl.replace("\{zoomLevel\}", zoom).replace("\{bingMapsKey\}", bingMapsKey).replace("\{point\}", point).replace("\{mapWidth\}", this.mapWidth).replace("\{mapHeight\}", this.mapHeight);
this._baseMapImageSourceLight = {
url: baseMapUrl.replace("\{ImagerySet\}", PlatformJS.Services.appConfig.getString("StaticMapBaseLayerLightImagerySet")), cacheId: this._StaticMapCacheId, alt: PlatformJS.Services.resourceLoader.getString("MapImageAltText")
};
this._labelsImageSourceLight = {
url: labelsUrl.replace("\{ImagerySet\}", PlatformJS.Services.appConfig.getString("StaticMapLabelsLayerLightImagerySet")), cacheId: this._StaticMapCacheId, alt: PlatformJS.Services.resourceLoader.getString("MapImageAltText")
};
this._baseMapImageSourceDark = {
url: baseAerialMapUrl, cacheId: this._StaticMapCacheId, alt: PlatformJS.Services.resourceLoader.getString("MapImageAltText")
};
this._labelsImageSourceDark = {
url: labelsUrl.replace("\{ImagerySet\}", PlatformJS.Services.appConfig.getString("StaticMapLabelsLayerDarkImagerySet")), cacheId: this._StaticMapCacheId, alt: PlatformJS.Services.resourceLoader.getString("MapImageAltText")
}
}, preRenderFetchDataAsync: function preRenderFetchDataAsync() {
return WinJS.Promise.join([this._fetchMapsResponseAsync(), this._fetchBaseMapImageAsync()])
}, render: function render() {
var that=this;
WinJS.Utilities.empty(that._mapElement);
var p=WeatherAppJS.Controls.Utilities.loadModule({
fragmentPath: "/html/delayedTemplate.html", templateId: "interactiveMaps"
}, {}, that._mapElement).then(function loadTemplate_complete(iMapsTemplate) {
that._initMapConfig();
that._viewPort = WinJS.Utilities.query(".iMapsImageViewport", iMapsTemplate)[0] || null;
that._baseMapDiv = WinJS.Utilities.query(".iMapsBaseMapDiv", iMapsTemplate)[0] || null;
that._overlayDiv = WinJS.Utilities.query(".iMapsOverlayDiv", iMapsTemplate)[0] || null;
that._labelsDiv = WinJS.Utilities.query(".iMapsLabelsDiv", iMapsTemplate)[0] || null;
that._filterBar = WinJS.Utilities.query(".iMapsFilterBar", iMapsTemplate)[0] || null;
that._progressDiv = WinJS.Utilities.query(".iMapsProgressBar", iMapsTemplate)[0] || null;
that._legendDiv = WinJS.Utilities.query(".iMapsLegendDiv", iMapsTemplate)[0] || null;
that._legend = (that._legendDiv) ? that._legendDiv.winControl : null;
that._timestampDiv = WinJS.Utilities.query(".iMapsTimestampDiv", iMapsTemplate)[0] || null;
that._fullScreenTogglerDiv = WinJS.Utilities.query("#iMapsFullScreenButton", iMapsTemplate)[0] || null;
if (that._fullScreenTogglerDiv) {
that._fullScreenTogglerDiv.addEventListener('click', function(event) {
var eventAttr={location: WeatherAppJS.GeocodeCache.getLocation(that.locId).getFullDisplayName()};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Maps Cluster", "Full Screen Toggle", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr))
})
}
if (that._progressDiv) {
that._progressDiv.addEventListener('click', function(event) {
var eventAttr={location: WeatherAppJS.GeocodeCache.getLocation(that.locId).getFullDisplayName()};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Maps Cluster", "Map", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr))
})
}
if (!that.isClusterActive()) {
return WinJS.Promise.wrapError(null)
}
}).then(function preRenderFetchData_begin() {
that._showProgress();
var pr=that.preRenderFetchDataAsync().then(function preRenderFetchData_complete() {
if (!that.isClusterActive()) {
that._removeCluster()
}
else {
that._setBaseMapImage();
that._hideProgress();
that._computeMapClusterSize();
var currentMapIndex=that._getFirstMapIndex();
that._switchMapTypeAsync(currentMapIndex);
that._addMapFilters(that._filterBar);
that._viewPort.addEventListener("click", function clicked() {
that._navigateToMap()
});
that._prefetchOtherMapImages();
that._isRenderComplete = true;
that.dispatchEvent(CommonJS.Immersive.ClusterControlRefreshedEvent, {isDataRefreshed: false})
}
}, function preRenderFetchData_error(e) {
if (WeatherAppJS.Controls.Utilities.isCancellationError(e)) {
return
}
that._removeCluster()
});
that._promiseStack.push(pr)
}, function renderTemplate_error(e) {
if (WeatherAppJS.Controls.Utilities.isCancellationError(e)) {
return
}
that._removeCluster()
});
that._promiseStack.push(p);
return p
}, isClusterActive: function isClusterActive() {
if (!this._viewPort || !this._overlayDiv || !this._baseMapDiv || !this._labelsDiv || !this._filterBar || !this._progressDiv || !this._legend || !this._timestampDiv) {
return false
}
return true
}, dispose: function dispose() {
WinJS.Utilities.disposeSubTree(this.element);
this.cleanUp()
}, cleanUp: function cleanUp() {
var that=this;
if (that._isDisposed) {
return
}
that._isDisposed = true;
that._isRenderComplete = false;
that._clearState();
that._mapElement.innerHTML = ""
}, onWindowResize: function onWindowResize(event) {
CommonJS.WindowEventManager.HandleWindowResizeEvent.call(this, event, function HandleWindowResize() {
if (this._isRenderComplete) {
this._computeMapClusterSize((event && event.new) ? event.new : null);
this._setOverlayImage()
}
})
}
})});
WinJS.Class.mix(WeatherAppJS.Controls.Clusters.interactiveMapsClusterControl, WinJS.Utilities.createEventProperties(CommonJS.Immersive.ClusterControlRefreshedEvent), WinJS.UI.DOMEventMixin)
})()