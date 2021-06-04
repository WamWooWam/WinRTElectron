/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
var ImageStatus={
ERROR: -1, LOADING: 0, LOWRES_LOADED: 1, LOADED: 2
};
WinJS.Namespace.define("WeatherAppJS.Maps", {CanvasDataManager: WinJS.Class.define(function(canvasLayer, options) {
this._canvasLayer = canvasLayer;
this._setOptions(options);
this._init()
}, {
_cacheId: "MapsImageFrameCache", _canvasLayer: null, _options: null, _images: null, _imageList: null, _imageListLowRes: null, _numImagesFetched: 0, _imageLoadStatus: null, _data: null, data: {get: function get() {
return this._data
}}, _dataLowRes: null, dataLowRes: {get: function get() {
return this._dataLowRes
}}, _legendConfig: null, _promisesStack: null, _hasImageFetchFailed: false, _setOptions: function _setOptions(options) {
this._options = options || {}
}, _init: function _init() {
this._images = [];
this._imageList = [];
this._imageListLowRes = [];
this._imageLoadStatus = [];
this._promisesStack = []
}, _currentDisplayImg: null, _fetchMapsResponse: function _fetchMapsResponse(params, bypassCache) {
var marketization=Platform.Globalization.Marketization;
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("middletierhostmaps", PlatformJS.Services.appConfig.getString("MiddleTierHostMaps"));
urlParams.insert("region", params.region.toLowerCase());
urlParams.insert("mapType", params.mapType.toLowerCase());
urlParams.insert("mapSubType", params.mapSubType.toLowerCase());
urlParams.insert("unit", WeatherAppJS.SettingsManager.getDisplayUnit());
urlParams.insert("userRegion", marketization.getMarketLocation());
urlParams.insert("market", marketization.getCurrentMarket());
urlParams.insert("language", marketization.getQualifiedLanguageString());
urlParams.insert("fulldata", WeatherAppJS.Utilities.UI.fetchReducedMapsData());
var options=new Platform.DataServices.QueryServiceOptions;
options.useCompatDataModel = true;
options.bypassCache = (bypassCache) ? true : false;
options.enableAutoRefresh = false;
var qsWeatherMapsPanoResponse=new PlatformJS.DataService.QueryService("WeatherMapsPanoResponse");
return WinJS.Promise.wrap(qsWeatherMapsPanoResponse.downloadDataAsync(urlParams, null, null, options))
}, _parseMapsResponse: function _parseMapsResponse(mapsResponse) {
var that=this;
var mapData;
if (!mapsResponse || !mapsResponse.dataString) {
return WinJS.Promise.wrapError(new Error('Empty maps response'))
}
try {
mapData = JSON.parse(mapsResponse.dataString)
}
catch(e) {
return WinJS.Promise.wrapError(e)
}
if (!mapData.HighResMapDetails) {
return WinJS.Promise.wrapError(new Error('HighRes data not found'))
}
var highResData=mapData.HighResMapDetails;
that._data = {
width: parseInt(highResData.Width), height: parseInt(highResData.Height), bounds: MapUtils.createMapLocationRectFromEdges(highResData.MapBounds), alpha: parseFloat(highResData.Alpha)
};
that._imageList = (highResData.MapList) ? highResData.MapList : [];
that._numImagesFetched = 0;
if (mapData.LowResMapDetails) {
var lowResData=mapData.LowResMapDetails;
that._dataLowRes = {
width: parseInt(lowResData.Width), height: parseInt(lowResData.Height), bounds: MapUtils.createMapLocationRectFromEdges(lowResData.MapBounds), alpha: parseFloat(lowResData.Alpha)
};
that._imageListLowRes = (lowResData.MapList) ? lowResData.MapList : []
}
if (mapData.LegendDataList) {
that._legendConfig = WeatherAppJS.Maps.Legend.createConfig(mapData.LegendDataList)
}
}, _getFrameImageSource: function _getFrameImageSource(frameIndex) {
return {
lowRes: {
url: (this._imageListLowRes[frameIndex]) ? this._imageListLowRes[frameIndex].ImageUrl : null, frameIndex: frameIndex, cacheId: this._cacheId
}, highRes: {
url: (this._imageList[frameIndex]) ? this._imageList[frameIndex].ImageUrl : null, frameIndex: frameIndex, cacheId: this._cacheId
}
}
}, _fetchImageAsync: function _fetchImageAsync(imageSource, networkCallRequired) {
var imageUrl=imageSource.url;
var cacheId=imageSource.cacheId || this._cacheId;
return PlatformJS.Utilities.fetchImage(cacheId, imageUrl, networkCallRequired)
}, _fetchImageFromCacheAsync: function _fetchImageFromCacheAsync(imageSource) {
var that=this;
var cacheId=imageSource.cacheId || this._cacheId;
return PlatformJS.Cache.CacheService.getInstance(cacheId).findEntry(imageSource.url, {fileNameOnly: true}).then(function image_cache_completion(response) {
if (response) {
that._setImage(response.dataValue, imageSource)
}
return response
})
}, _loadSingleResolutionAsync: function _loadSingleResolutionAsync(imageSource, bypassCache) {
var that=this;
if (!imageSource || !imageSource.url) {
return WinJS.Promise.wrap(null)
}
var promise=(!bypassCache) ? this._fetchImageFromCacheAsync(imageSource) : WinJS.Promise.wrap(null);
return promise.then(function image_refresh(response) {
if (!response || response.isStale()) {
return that._fetchImageAsync(imageSource, null)
}
return WinJS.Promise.wrap(null)
}).then(function loadImageComplete(localUrl) {
if (localUrl) {
that._setImage(localUrl, imageSource)
}
return WinJS.Promise.wrap(null)
})
}, _loadDualResolutionAsync: function _loadDualResolutionAsync(dualImageSource, bypassCache) {
var that=this;
var lowResImageSource=dualImageSource.lowRes;
var highResImageSource=dualImageSource.highRes;
var promise=(!bypassCache) ? this._fetchImageFromCacheAsync(highResImageSource) : WinJS.Promise.wrap(null);
return promise.then(function image_refresh(response) {
if (!response || response.isStale()) {
return that._loadSingleResolutionAsync(lowResImageSource, bypassCache)
}
}).then(function loadSingleResolutionComplete() {
return that._fetchImageAsync(highResImageSource, null)
}).then(function fetchImage_complete(localUrl) {
if (localUrl) {
that._setImage(localUrl, highResImageSource)
}
})
}, _setImage: function _setImage(localUrl, imageSource) {
var frameIndex=imageSource.frameIndex;
if (this._images) {
if (!this._images[frameIndex]) {
this._images[frameIndex] = {}
}
this._images[frameIndex].src = localUrl;
this._numImagesFetched++
}
}, _handleImageError: function _handleImageError(imageSource){}, getFrame: function getFrame(frameIndex) {
if (!this._currentDisplayImg) {
this._currentDisplayImg = document.createElement('img')
}
if (this._images && this._images[frameIndex]) {
this._currentDisplayImg.src = this._images[frameIndex].src;
this._currentDisplayImg.onerror = this._images[frameIndex].onerror
}
return this._currentDisplayImg
}, getImageObj: function getImageObj(frameIndex) {
return this._imageList[frameIndex]
}, getFrameCount: function getFrameCount() {
return this._imageList.length
}, getMapsResponseAsync: function getMapsResponseAsync(params, bypassCache) {
var that=this;
var fetchPromise=this._fetchMapsResponse(params, bypassCache).then(this._parseMapsResponse.bind(this));
this._promisesStack.push(fetchPromise);
return fetchPromise
}, loadFrame: function loadFrame(frameIndex, loadProgressively) {
var imageSource=this._getFrameImageSource(frameIndex);
if (!loadProgressively) {
return this._loadSingleResolutionAsync(imageSource.highRes, false)
}
else {
return this._loadDualResolutionAsync(imageSource, false)
}
}, loadFirstFrame: function loadFirstFrame(frameIndex, lowResLoadedCallback, highResLoadedCallback, onErrorCallback) {
var that=this;
var img=document.createElement("img");
that._imageLoadStatus[frameIndex] = ImageStatus.LOADING;
img.onload = function frameloaded() {
if (that._dataLowRes && this.width === that._dataLowRes.width && lowResLoadedCallback && that._imageLoadStatus[frameIndex] === ImageStatus.LOADING) {
that._imageLoadStatus[frameIndex] = ImageStatus.LOWRES_LOADED;
lowResLoadedCallback()
}
else if (this.width === that._data.width && highResLoadedCallback && that._imageLoadStatus[frameIndex] !== ImageStatus.LOADED) {
that._imageLoadStatus[frameIndex] = ImageStatus.LOADED;
highResLoadedCallback()
}
};
this._images[frameIndex] = img;
this._promisesStack.push(this.loadFrame(frameIndex, true).then(null, function(e) {
if (onErrorCallback) {
onErrorCallback(e)
}
}))
}, loadAllFrames: function loadAllFrames(successCallback, errorCallback) {
var that=this;
var imagesToLoad=0;
var len=this._imageList.length;
if (this._imageList) {
for (var idx=0; idx < len; idx++) {
if (!this._images[idx]) {
CommonJS.Progress.showProgress(CommonJS.Progress.headerProgressType);
(function(i) {
that._images[i] = that._images[i] ? that._images[i] : {};
that._images[i].onerror = function() {
that._images[i] = null;
that._imageLoadStatus[i] = ImageStatus.ERROR;
that._hasImageFetchFailed = true;
CommonJS.Progress.resetProgress(CommonJS.Progress.headerProgressType);
if (errorCallback) {
errorCallback()
}
};
that._promisesStack.push(that.loadFrame(i, false).then(function(data) {
CommonJS.Progress.resetProgress(CommonJS.Progress.headerProgressType);
if ((that._numImagesFetched === len) && !that._hasImageFetchFailed) {
if (successCallback) {
successCallback()
}
}
}, function(e) {
if (PlatformJS.Utilities.isPromiseCanceled(e)) {
return
}
that._hasImageFetchFailed = true;
if (errorCallback) {
errorCallback(e)
}
}))
}(idx))
}
}
}
}, getLegendConfig: function getLegendConfig() {
return this._legendConfig
}, _disposeImages: function _disposeImages() {
var that=this;
if (that._images) {
for (var i in that._images) {
if (that._images[i]) {
that._images[i].onload = null;
that._images[i].onerror = null;
that._images[i] = null
}
}
}
}, dispose: function dispose() {
this._disposeImages();
this._images = null;
this._currentDisplayImg = null;
this._imageList = null;
this._imageListLowRes = null;
this._legendConfig = null;
this._hasImageFetchFailed = false;
WeatherAppJS.Utilities.Common.cleanupPromiseStack(this._promisesStack);
CommonJS.Progress.resetProgress(CommonJS.Progress.headerProgressType)
}
})})
})()