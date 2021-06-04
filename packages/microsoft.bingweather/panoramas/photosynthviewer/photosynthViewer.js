/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
WinJS.Namespace.define("WeatherAppJS", {PhotosynthViewer: WinJS.Class.derive(WeatherAppJS.WeatherBasePage, function(state) {
WeatherAppJS.WeatherBasePage.call(this, state);
this._panoId = state.panoId;
var isPhotosynthEnabled=Platform.Utilities.FailSafeConfiguration.isEnabled("application", "photosynth");
if (!isPhotosynthEnabled) {
WinJS.Navigation.back()
}
var viewerElement=document.querySelector("#panorama-viewer-container");
if (!viewerElement) {
throw(new Error("Cannot find the panorama viewer element"));
}
if (!viewerElement.winControl) {
throw(new Error("The panorama viewer element is not a control"));
}
this._viewer = viewerElement.winControl;
this._viewer.setOptions({
pageHeaderId: "panorama-viewer-header", panoId: this._panoId
})
}, {
_viewer: null, _panoId: null, dispose: function dispose() {
if (this._viewer) {
this._viewer.dispose();
this._viewer = null
}
}, getPageData: function getPageData() {
return WinJS.Promise.wrap({title: ""})
}, getPageImpressionContext: function getPageImpressionContext() {
var context=WeatherAppJS.Instrumentation.PageContext.PhotoSynth;
if (this._state.page) {
context = this._state.page
}
return context
}, onBindingComplete: function onBindingComplete(){}
})})
})()