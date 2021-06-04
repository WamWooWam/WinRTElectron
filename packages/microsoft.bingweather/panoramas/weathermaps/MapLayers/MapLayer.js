/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
WinJS.Namespace.define("WeatherAppJS.Maps", {MapLayer: WinJS.Class.define(function(baseMapController) {
if (!baseMapController || !baseMapController instanceof WeatherAppJS.Maps.BaseMapController) {
throw"Need a valid basemap controller instance";
}
this._baseMapController = baseMapController
}, {
_baseMapController: null, _mapControls: null, _visible: false, _attached: false, show: null, hide: null, load: null, attach: null, detach: null, dispose: null, showLayer: function showLayer() {
if (this.show && this.show instanceof Function) {
this.show()
}
this._visible = true
}, hideLayer: function hideLayer() {
if (this.hide && this.hide instanceof Function) {
this.hide()
}
this._visible = false
}, loadLayerAsync: function loadLayerAsync() {
if (this.load && this.load instanceof Function) {
return this.load()
}
return WinJS.Promise.wrap(null)
}, addLayer: function addLayer() {
if (!this._attached) {
if (this.attach && this.attach instanceof Function) {
this.attach()
}
this._attached = true
}
}, removeLayer: function removeLayer() {
if (this._attached) {
if (this.detach && this.detach instanceof Function) {
this.detach()
}
this._attached = false
}
}, disposeLayer: function disposeLayer() {
if (this.dispose && this.dispose instanceof Function) {
this.dispose()
}
}, updateLayer: function updateLayer() {
if (this.update && this.update instanceof Function) {
this.update()
}
}
}, {})})
})()