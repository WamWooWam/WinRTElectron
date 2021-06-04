/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
WinJS.Namespace.define("WeatherAppJS.Maps", {LabelsTileLayer: WinJS.Class.derive(WeatherAppJS.Maps.MapLayer, function(baseMapController, layerOptions) {
WeatherAppJS.Maps.MapLayer.call(this, baseMapController);
this._setOptions(layerOptions);
this._init()
}, {
_tileSource: null, _tileLayer: null, _tileSourceOptions: null, _tileLayerOptions: null, _options: null, _setOptions: function _setOptions(layerOptions) {
this._options = layerOptions || {};
this._tileSourceOptions = this._options.tileSourceOptions || {};
this._tileLayerOptions = this._options.tileLayerOptions || {}
}, _init: function _init() {
this._tileLayerOptions.visible = false;
var uriConstructor=this._tileSourceOptions.uriConstructor;
uriConstructor = uriConstructor.replace("\{userRegion\}", Platform.Globalization.Marketization.getMarketLocation());
uriConstructor = uriConstructor.replace(/(mkt=)[^\&]+/, '$1' + Platform.Globalization.Marketization.getQualifiedLanguageString());
this._tileSourceOptions.uriConstructor = uriConstructor
}, load: function load() {
this._tileSource = new MicrosoftJS.Maps.TileSource(this._tileSourceOptions);
this._tileLayerOptions.mercator = this._tileSource;
this._tileLayer = new MicrosoftJS.Maps.TileLayer(this._tileLayerOptions);
return WinJS.Promise.wrap(true)
}, show: function show() {
if (this._tileLayer) {
this._tileLayer.setOptions({visible: true})
}
}, hide: function hide() {
if (this._tileLayer) {
this._tileLayer._setOptions({visible: false})
}
}, attach: function attach() {
this._baseMapController.addMapEntity(this._tileLayer)
}, detach: function detach() {
this._baseMapController.removeMapEntity(this._tileLayer)
}, dispose: function dispose() {
if (this._tileLayer) {
this._baseMapController.removeMapEntity(this._tileLayer)
}
this._tileLayer = null;
this._tileSource = null
}
})})
})()