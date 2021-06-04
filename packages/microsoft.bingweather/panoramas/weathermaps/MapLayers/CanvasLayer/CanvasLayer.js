/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
WinJS.Namespace.define("WeatherAppJS.Maps", {CanvasLayer: WinJS.Class.derive(WeatherAppJS.Maps.MapLayer, function(baseMapController, seekBar, layerOptions) {
WeatherAppJS.Maps.MapLayer.call(this, baseMapController);
this.seekBar = seekBar;
this.impressionStartTime = (new Date).getTime() / 1000;
this._eventHandlers = [];
this._setOptions(layerOptions);
this._init()
}, {
_domElement: null, canvasRenderer: null, canvasDataManager: null, seekBar: null, tsControl: null, legend: null, _layerDiv: null, _options: null, _currentImage: null, _isAnimating: null, _isRenderingPaused: false, _setOptions: function _setOptions(layerOptions) {
this._options = layerOptions || {};
this._options.baseMapLayerOptions = this._options.baseMapLayerOptions || null;
this._options.mapType = (this._options.map && this._options.map.mapType) ? this._options.map.mapType : "temperature";
this._options.mapSubType = (this._options.map && this._options.map.mapSubType) ? this._options.map.mapSubType : "today";
this.tsControl = layerOptions.tsControl;
this.legend = layerOptions.legend
}, _init: function _init() {
this._layerDiv = document.createElement("div");
WinJS.Utilities.addClass(this._layerDiv, "canvasLayer");
this._domElement = this._layerDiv;
this.canvasRenderer = new WeatherAppJS.Maps.CanvasImageRenderer(this._layerDiv, this._baseMapController);
this.canvasDataManager = new WeatherAppJS.Maps.CanvasDataManager(this);
this._initEventListeners()
}, _eventHandlers: null, _playListener: null, _pauseListener: null, _sliderChangedListener: null, _viewChangeStartListener: null, _viewChangeEndListener: null, _initEventListeners: function _initEventListeners() {
var that=this;
if (this.seekBar) {
this._playListener = function() {
that._isAnimating = true
};
this._pauseListener = function() {
that._isAnimating = false
};
this._sliderChangedListener = function(evt) {
var frameIndex=that.seekBar.sliderValue;
if (that.canvasRenderer) {
that._showCanvasFrame(frameIndex)
}
}
}
this._viewChangeEndListener = function(e) {
if (that._isRenderingPaused) {
if (that.seekBar && !that.seekBar.isPlaying) {
that.seekBar.isPlaying = true
}
that._isRenderingPaused = false
}
};
this._viewChangeStartListener = function(e) {
if (that.seekBar && that.seekBar.isPlaying) {
that.seekBar.isPlaying = false;
that._isRenderingPaused = true
}
}
}, _addEventListeners: function _addEventListeners() {
if (this.seekBar) {
this.seekBar.addEventListener("play", this._playListener);
this.seekBar.addEventListener("paused", this._pauseListener);
this.seekBar.addEventListener("sliderchanged", this._sliderChangedListener)
}
if (WeatherAppJS.Utilities.UI.isPerfOptimizedExperience()) {
this._eventHandlers.push(this._baseMapController.addBaseMapThrottledEventHandler('viewchangeend', this._viewChangeEndListener, 200));
this._eventHandlers.push(this._baseMapController.addBaseMapThrottledEventHandler('viewchangestart', this._viewChangeStartListener, 200))
}
}, _removeEventListeners: function _removeEventListeners() {
if (this.seekBar) {
this.seekBar.removeEventListener("play", this._playListener);
this.seekBar.removeEventListener("paused", this._pauseListener);
this.seekBar.removeEventListener("sliderchanged", this._sliderChangedListener)
}
while (this._eventHandlers.length) {
this._baseMapController.removeBaseMapEventHandler(this._eventHandlers.pop())
}
}, _showCanvasFirstFrame: function _showCanvasFirstFrame(frameIndex, canvasData) {
var that=this;
that._currentImage = frameIndex;
that.canvasRenderer.initialize(canvasData);
that.canvasRenderer.Image = this.canvasDataManager.getFrame(frameIndex);
if (!that.canvasRenderer.isVisible) {
that.canvasRenderer.showCanvas()
}
else {
if (that.canvasRenderer.Image.src) {
that.canvasRenderer.updateCanvas()
}
}
that._updateTimeStamp(frameIndex)
}, _showCanvasFrame: function _showCanvasFrame(frameIndex) {
var that=this;
that._currentImage = frameIndex;
that.canvasRenderer.Image = that.canvasDataManager.getFrame(frameIndex);
if (that.canvasRenderer.Image.src) {
that.canvasRenderer.updateCanvas()
}
that._updateTimeStamp(frameIndex)
}, _updateTimeStamp: function _updateTimeStamp(frameIndex) {
var that=this;
var imageObj=that.canvasDataManager.getImageObj(frameIndex);
if (imageObj && imageObj.SnapTime) {
that.tsControl.updateTimeStamp(imageObj.SnapTime)
}
}, _handleError: function _handleError(errorResponse) {
CommonJS.Progress.resetProgress(CommonJS.Progress.centerProgressType);
CommonJS.Progress.resetProgress(CommonJS.Progress.headerProgressType);
if (!WeatherAppJS.Controls.Utilities.isCancellationError(errorResponse)) {
WeatherAppJS.Maps.Utilities.showMessage("/platform/standardErrorDescription")
}
}, load: function load() {
var that=this;
that.seekBar.disable();
var regionFetchId=WeatherAppJS.Maps.BaseMapController.getRegionFetchId(this._baseMapController.currentRegion);
msWriteProfilerMark("WeatherApp:WeatherMapsPage:MapsResponseFetch:s");
CommonJS.Progress.showProgress(CommonJS.Progress.centerProgressType);
return this.canvasDataManager.getMapsResponseAsync({
mapType: this._options.mapType, mapSubType: this._options.mapSubType, region: regionFetchId
}).then(function fetchResponse_complete() {
msWriteProfilerMark("WeatherApp:WeatherMapsPage:MapsResponseFetch:e");
CommonJS.Progress.hideProgress(CommonJS.Progress.centerProgressType);
var count=that.canvasDataManager.getFrameCount();
if (count) {
that.seekBar.initSliderValues(0, count - 1, 0);
var startIndex=0;
var tickArray=[];
while (startIndex <= (count - 1)) {
var imageObj=that.canvasDataManager.getImageObj(startIndex);
if (imageObj && imageObj.SnapTime) {
var tickValue=WeatherAppJS.Maps.Utilities.formatSnapTime(imageObj.SnapTime);
tickArray.push(tickValue)
}
startIndex++
}
that.seekBar.setTickValues(tickArray);
that._addEventListeners()
}
}, function fetchResponse_error(e) {
msWriteProfilerMark("WeatherApp:WeatherMapsPage:MapsResponseFetch:e");
CommonJS.Progress.hideProgress(CommonJS.Progress.centerProgressType);
return WinJS.Promise.wrapError(e)
})
}, show: function show() {
var that=this;
var frameIndex=0;
msWriteProfilerMark("WeatherApp:WeatherMapsPage:CanvasFirstFrameLoad:s");
CommonJS.Progress.showProgress(CommonJS.Progress.centerProgressType);
this.canvasDataManager.loadFirstFrame(frameIndex, function lowRes_loaded() {
msWriteProfilerMark("WeatherApp:WeatherMapsPage:CanvasFirstFrameLoad:LowResLoaded");
CommonJS.Progress.hideProgress(CommonJS.Progress.centerProgressType);
CommonJS.Progress.showProgress(CommonJS.Progress.headerProgressType);
if (that.canvasRenderer) {
that._showCanvasFirstFrame(frameIndex, that.canvasDataManager.dataLowRes)
}
}, function highRes_loaded() {
msWriteProfilerMark("WeatherApp:WeatherMapsPage:CanvasFirstFrameLoad:e");
that.dispatchEvent("firstframeloaded", {startTime: that.impressionStartTime});
CommonJS.Progress.hideProgress(CommonJS.Progress.centerProgressType);
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
if (that.canvasRenderer) {
that._showCanvasFirstFrame(frameIndex, that.canvasDataManager.data)
}
var legendConfig=that.canvasDataManager.getLegendConfig();
if (legendConfig) {
that.legend.render(legendConfig)
}
msWriteProfilerMark("WeatherApp:WeatherMapsPage:CanvasAllFramesLoad:s");
that.canvasDataManager.loadAllFrames(function canvasLayerAllFramesLoadedCallback() {
msWriteProfilerMark("WeatherApp:WeatherMapsPage:CanvasAllFramesLoad:e");
that.dispatchEvent("allframesloaded", {startTime: that.impressionStartTime});
that.seekBar.enable();
that.seekBar.isPlaying = true
}, function canvasLayerAllFramesLoadedErrorCallback(errorResponse) {
that._handleError(errorResponse)
})
}, function loadFirstFrame_error(errorResponse) {
msWriteProfilerMark("WeatherApp:WeatherMapsPage:CanvasFirstFrameLoad:e");
that._handleError(errorResponse)
})
}, hide: function hide() {
this.canvasRenderer.hideCanvas()
}, attach: function attach() {
if (this._options.baseMapLayerOptions) {
this._baseMapController.setBaseMapLayerOptions(this._options.baseMapLayerOptions)
}
this._baseMapController.addMapLayerDiv(this._layerDiv, true)
}, detach: function detach() {
this._baseMapController.removeMapLayerDiv(this._layerDiv, true)
}, dispose: function dispose() {
this._removeEventListeners();
this.canvasRenderer.dispose();
this.canvasRenderer = null;
this.canvasDataManager.dispose();
this.canvasDataManager = null;
this.seekBar.disable();
this.legend.dispose()
}, update: function update() {
this.canvasRenderer.updateCanvas(true)
}
})});
WinJS.Class.mix(WeatherAppJS.Maps.CanvasLayer, WinJS.Utilities.createEventProperties("firstframeloaded", "allframesloaded"), WinJS.UI.DOMEventMixin)
})()