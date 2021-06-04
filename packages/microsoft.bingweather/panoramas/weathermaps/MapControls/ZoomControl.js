/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
WinJS.Namespace.define("WeatherAppJS.Maps", {ZoomControl: WinJS.Class.define(function(element, options) {
var that=this;
element = element || document.createElement("div");
element.winControl = this;
this._init(element);
this._setOptions(options)
}, {
_domElement: null, _zoomInButton: null, _zoomOutButton: null, _baseMapCtlr: null, isMouseOver: false, isShown: null, _setOptions: function _setOptions(options) {
if (options.baseMapCtlr) {
this._baseMapCtlr = options.baseMapCtlr
}
}, _init: function _init(element) {
var that=this;
WinJS.Utilities.addClass(element, "zoomControl");
var zoomWrapper=document.createElement("div");
WinJS.Utilities.addClass(zoomWrapper, "zoomButtonsWrapper");
this._zoomInButton = document.createElement('button');
var appCmdButton=new WinJS.UI.AppBarCommand(this._zoomInButton, {icon: "add"});
WinJS.Utilities.addClass(this._zoomInButton, "zoomInButton");
this._zoomInButton.addEventListener('click', function() {
if (that._baseMapCtlr) {
that._baseMapCtlr.baseMapZoomLevel = that._baseMapCtlr.baseMapZoomLevel + 1
}
}, false);
this._zoomOutButton = document.createElement('button');
var appCmdButton2=new WinJS.UI.AppBarCommand(this._zoomOutButton, {icon: "remove"});
WinJS.Utilities.addClass(this._zoomOutButton, "zoomOutButton");
this._zoomOutButton.addEventListener('click', function() {
if (that._baseMapCtlr) {
that._baseMapCtlr.baseMapZoomLevel = that._baseMapCtlr.baseMapZoomLevel - 1
}
}, false);
zoomWrapper.addEventListener("mouseover", function() {
that.isMouseOver = !that.isMouseOver
}, false);
zoomWrapper.addEventListener("mouseout", function() {
that.isMouseOver = !that.isMouseOver
}, false);
zoomWrapper.appendChild(this._zoomInButton);
zoomWrapper.appendChild(this._zoomOutButton);
this._domElement = element;
this._domElement.appendChild(zoomWrapper)
}, show: function show() {
var that=this;
that._domElement.style.visibility = 'visible';
that.isShown = true
}, hide: function hide() {
var that=this;
that._domElement.style.visibility = 'hidden';
that.isShown = false
}, update: function update() {
var baseMapCtlr=this._baseMapCtlr;
if (baseMapCtlr) {
var zoomLimits=baseMapCtlr.baseMapZoomLevelLimits;
var currentZoomLevel=baseMapCtlr.baseMapZoomLevel;
if (currentZoomLevel >= zoomLimits.maxZoom) {
this._zoomInButton.disabled = 'disabled'
}
else {
this._zoomInButton.removeAttribute('disabled')
}
if (currentZoomLevel <= zoomLimits.minZoom) {
this._zoomOutButton.disabled = 'disabled'
}
else {
this._zoomOutButton.removeAttribute('disabled')
}
}
}
})})
})()