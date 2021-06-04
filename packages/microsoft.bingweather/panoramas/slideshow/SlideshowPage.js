/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
WinJS.Namespace.define("WeatherAppJS.Pages", {SlideshowPage: WinJS.Class.define(function(state) {
if (state) {
this._state = state
}
}, {
_state: null, _data: null, isImmersive: true, getPageImpressionContext: function getPageImpressionContext() {
var context=WeatherAppJS.Instrumentation.PageContext.SlideShow;
if (this._state && this._state.page) {
context = this._state.page
}
return context
}, getPageState: function getPageState() {
this._state = this._state || {};
var element=document.querySelector('.weatherSlideView');
if (element) {
var control=element.winControl;
if (control && control.currentPage !== null && typeof control.currentPage !== "undefined") {
this._state.index = control.currentPage
}
}
return this._state
}, getPageData: function getPageData() {
var that=this;
var disableSemanticZoom=that._state.disableSemanticZoom ? true : false;
var dontShowImageCount=that._state.dontShowImageCount ? true : false;
var pageData={
data: that._state.data, semanticZoomLocked: disableSemanticZoom, enableSemanticZoomButton: !disableSemanticZoom, dontShowImageCount: dontShowImageCount
};
return WinJS.Promise.wrap(pageData)
}, onBindingComplete: function onBindingComplete(){}, handleShareRequest: function handleShareRequest(request) {
var state=this.getPageState();
if (state && state.data && state.data.slides && state.data.slides.length > 0) {
var slide=state.data.slides[state.index];
if (slide && slide.thumbnail && slide.thumbnail.url) {
request.data.properties.title = slide.title || " ";
request.data.properties.description = slide.desc || "";
var html="<img src='" + slide.thumbnail.url + "'/>";
var htmlFormat=Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.createHtmlFormat(html);
request.data.setHtmlFormat(htmlFormat)
}
}
}
})})
})()