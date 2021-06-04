/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
var image=null;
WinJS.Namespace.define("WeatherAppJS.Maps", {CanvasImageRenderer: WinJS.Class.mix(function(mapLayerDiv, baseMapController) {
var that=this;
this._mapLayerDiv = mapLayerDiv;
this._map = baseMapController;
this._createCanvas();
this._updateView = function updateView_handler() {
that._currentScale = that._getCurrentScale();
that._currentOffset = that._getTranslationOffset(that._currentScale);
that._isBufferValid = false;
that._isCanvasDirty = true;
that.updateCanvas()
}
}, {
_map: null, _mapLayerDiv: null, _canvasDiv: null, _bufferCanvas: null, _buffer: null, _outputCanvas: null, _output: null, _isCanvasDirty: true, _isBufferValid: false, _isVisible: false, isVisible: {get: function get() {
return this._isVisible
}}, _width: "400", _height: "300", _currentScale: 1, _currentOffset: [0, 0], _eventHandlers: [], _anchorLocation: null, _bounds: null, _globalAlpha: 1.0, _image: null, Image: {
get: function get() {
return this._image
}, set: function set(value) {
if (value && value.nodeName === "IMG") {
this._image = value;
this._isCanvasDirty = true
}
}
}, _createCanvas: function _createCanvas() {
this._canvasDiv = document.createElement("div");
WinJS.Utilities.addClass(this._canvasDiv, "canvasContainer");
this._outputCanvas = document.createElement("canvas");
WinJS.Utilities.addClass(this._outputCanvas, "outputcanvas");
this._canvasDiv.appendChild(this._outputCanvas);
this._output = this._outputCanvas.getContext('2d');
this._mapLayerDiv.appendChild(this._canvasDiv)
}, _setImageData: function _setImageData(imgData) {
this._width = imgData.width;
this._height = imgData.height;
this._bounds = imgData.bounds;
this._anchorLocation = imgData.bounds.getNorthwest();
this._globalAlpha = ("alpha" in imgData) ? imgData.alpha : 1.0
}, _initCanvas: function _initCanvas() {
this._outputCanvas.width = this._outputCanvas.clientWidth;
this._outputCanvas.height = this._outputCanvas.clientHeight;
this._output.globalAlpha = this._globalAlpha;
this._canvasScaleX = this._outputCanvas.clientWidth / this._outputCanvas.width;
this._canvasScaleY = this._outputCanvas.clientHeight / this._outputCanvas.height;
this._currentScale = this._getCurrentScale();
this._currentOffset = this._getTranslationOffset(this._currentScale)
}, _updateCanvas: function _updateCanvas() {
if (this.isVisible) {
this._initCanvas()
}
}, _removeCanvas: function _removeCanvas() {
if (this._mapLayerDiv && this._canvasDiv) {
this._mapLayerDiv.removeChild(this._canvasDiv)
}
}, _copyImageFrame: function _copyImageFrame() {
var w=this._width;
var h=this._height;
var cw=this._outputCanvas.width;
var ch=this._outputCanvas.height;
var s=this._currentScale;
var sx=-this._currentOffset[0];
var sy=-this._currentOffset[1];
var sw=(cw / s);
var sh=(ch / s);
var dx=(sx < 0) ? -sx * s : 0;
var dy=(sy < 0) ? -sy * s : 0;
var dh=(sh < h) ? ch : ch - ((sh - h) * s);
var dw=(sw < w) ? cw : cw - ((sw - w) * s);
sx = (sx < 0) ? 0 : sx;
sy = (sy < 0) ? 0 : sy;
sw = (sw > w) ? w : sw;
sh = (sh > h) ? h : sh;
this._output.globalAlpha = this._globalAlpha;
try {
this._output.drawImage(this._image, sx, sy, sw, sh, dx, dy, dw, dh)
}
catch(err) {}
}, _getCurrentScale: function _getCurrentScale() {
if (this._height) {
var pointNW=this._map.tryLocationToPixel(this._bounds.getNorthwest());
var pointSE=this._map.tryLocationToPixel(this._bounds.getSoutheast());
var height=Math.abs(pointNW.y - pointSE.y);
return (height / this._height)
}
return 0
}, _getTranslationOffset: function _getTranslationOffset(scale) {
var offset=this._map.tryLocationToPixel(this._anchorLocation, MicrosoftJS.Maps.PixelReference.control);
return [(offset.x) / scale, (offset.y) / scale]
}, _attachEventHandlers: function _attachEventHandlers() {
var that=this;
this._eventHandlers.push(that._map.addBaseMapThrottledEventHandler('viewchange', this._updateView, 200))
}, _detachEventHandlers: function _detachEventHandlers() {
var e;
while (this._eventHandlers.length) {
var handler=this._eventHandlers.pop();
this._map.removeBaseMapEventHandler(handler);
handler.handler = null;
handler.target = null
}
}, initialize: function initialize(imgData) {
this._setImageData(imgData);
this._initCanvas()
}, showCanvas: function showCanvas() {
var that=this;
var nullPromise=WinJS.Promise.wrap(null);
if (this._image && this._outputCanvas && !this._isVisible) {
this._attachEventHandlers();
this.updateCanvas(true);
return this.fadeInCanvasAsync().then(function() {
that._isVisible = true
})
}
return nullPromise
}, updateCanvas: function updateCanvas(forceUpdate) {
if (forceUpdate) {
this._updateCanvas()
}
if (this._image && (this._isCanvasDirty || forceUpdate)) {
this._outputCanvas.width = this._outputCanvas.width;
this._copyImageFrame();
this._isCanvasDirty = false
}
}, fadeInCanvasAsync: function fadeInCanvasAsync() {
return WinJS.UI.Animation.fadeIn(this._outputCanvas)
}, fadeOutCanvasAsync: function fadeOutCanvasAsync() {
return WinJS.UI.Animation.fadeOut(this._outputCanvas)
}, hideCanvas: function hideCanvas() {
var that=this;
if (this._isVisible) {
this.fadeOutCanvasAsync().then(function() {
this._detachEventHandlers();
this._isVisible = false
})
}
}, dispose: function dispose() {
this._detachEventHandlers();
this._removeCanvas()
}
}, WinJS.Utilities.eventMixin, WinJS.Utilities.createEventProperties('framechanged'))})
})()