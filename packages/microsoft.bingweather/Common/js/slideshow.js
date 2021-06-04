/*  © Microsoft. All rights reserved. */
WinJS.Namespace.define('CommonJS', {Version: 'latest'});
(function CommonControlsSlideshowUtilitiesInit() {
"use strict";
WinJS.Namespace.define("CommonJS.Slideshow", {
Constants: {ssImageLoaded: "ssImageLoaded"}, ResourceStrings: {
PLAY: CommonJS.resourceLoader.getString("/platform/Play") || "Play", PAUSE: CommonJS.resourceLoader.getString("/platform/Pause") || "Pause", SLIDESHOW: CommonJS.resourceLoader.getString("/platform/Slideshow") || "Slideshow", SLIDE: CommonJS.resourceLoader.getString("/platform/Slide") || "Image"
}, Utilities: {
createElement: PlatformJS.Utilities.createElement, setInnerHtml: function setInnerHtml(elem, html) {
if (html) {
WinJS.Utilities.setInnerHTML(elem, toStaticHTML(html))
}
else {
elem.innerText = ""
}
}, clickInfoArea: function clickInfoArea(evt) {
var hasClass=WinJS.Utilities.hasClass;
if (evt.srcElement && hasClass(evt.srcElement, "platformRetryButton")) {
return true
}
var hitTargets=document.msElementsFromPoint(evt.clientX, evt.clientY);
if (hitTargets) {
for (var i=0, len=hitTargets.length; i < len; i++) {
var item=hitTargets[i];
if (hasClass(item, "win-navbutton") || hasClass(item, "ssMediaOverlay") || hasClass(item, "win-semanticzoom-button") || hasClass(item, "ssAttribution")) {
return true
}
}
}
return false
}, clickBlock: function clickBlock(evt, className) {
var hasClass=WinJS.Utilities.hasClass;
var hitTargets=document.msElementsFromPoint(evt.clientX, evt.clientY);
if (hitTargets) {
for (var i=0, len=hitTargets.length; i < len; i++) {
if (hasClass(hitTargets[i], className)) {
return true
}
}
}
return false
}, clickFlyoutArea: function clickFlyoutArea(evt) {
var hitTargets=document.msElementsFromPoint(evt.clientX, evt.clientY);
if (hitTargets) {
for (var i=0, len=hitTargets.length; i < len; i++) {
if (hitTargets[i].className.indexOf("platformFlyoutOuterContainer") !== -1) {
return true
}
}
}
return false
}, logUserAction: function logUserAction(element, inputActionMethod) {
PlatformJS.deferredTelemetry(function _logUserAction() {
var utils=CommonJS.Slideshow.Utilities;
var userActionMethod=Microsoft.Bing.AppEx.Telemetry.UserActionMethod.unknown;
if (inputActionMethod === utils.actionMethod.touch) {
userActionMethod = Microsoft.Bing.AppEx.Telemetry.UserActionMethod.touch
}
else if (inputActionMethod === utils.actionMethod.mouse) {
userActionMethod = Microsoft.Bing.AppEx.Telemetry.UserActionMethod.mouse
}
else if (inputActionMethod === utils.actionMethod.keyboard) {
userActionMethod = Microsoft.Bing.AppEx.Telemetry.UserActionMethod.keyboard
}
element = element + " - " + inputActionMethod;
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "slideshow", element, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, userActionMethod, 0)
})
}, actionElement: {
previousFlipper: "Previous Flipper", nextFlipper: "Next Flipper", swipe: "Swipe", scroll: "Scroll"
}, actionMethod: {
touch: "touch", mouse: "mouse", keyboard: "keyboard"
}
}
})
})();
(function CommonControlsSlideshowImageCardInit() {
"use strict";
var Slideshow=WinJS.Namespace.define("CommonJS.Slideshow", {ImageCard: WinJS.Class.define(function imageCard_ctor(element, options) {
this._domElement = element || document.createElement("div");
this._domElement.winControl = this;
CommonJS.Utils.markDisposable(this._domElement);
this._zoomInEnabled = true;
WinJS.UI.setOptions(this, options);
this._init();
this._fetchImage(this._showPlaceholder.bind(this))
}, {
_handleWheelBind: null, _handleImageOnLoadBind: null, _handleImageErrorBind: null, dispose: function dispose() {
if (this._handleWheelBind) {
if (this._imgElementDiv) {
this._imgElementDiv.removeEventListener("wheel", this._handleWheelBind)
}
this._handleWheelBind = null
}
var imgElement=this._imgElement;
this._imgElement = null;
if (this._handleImageOnLoadBind) {
if (imgElement) {
imgElement.removeEventListener("load", this._handleImageOnLoadBind)
}
this._handleImageOnLoadBind = null
}
if (this._handleImageErrorBind) {
if (imgElement) {
imgElement.removeEventListener("error", this._handleImageErrorBind)
}
this._handleImageErrorBind = null
}
if (this._domElement) {
this._domElement.winControl = null;
this._domElement = null
}
}, cropImage: {
get: function get() {
return this._crop
}, set: function set(value) {
this._crop = value
}
}, showErrorInfo: {
get: function get() {
return this._showErrorInfo
}, set: function set(v) {
this._showErrorInfo = v
}
}, fill: {
get: function get() {
return this._fill
}, set: function set(v) {
this._fill = v
}
}, zoomInEnabled: {
get: function get() {
return this._zoomInEnabled
}, set: function set(v) {
this._zoomInEnabled = v
}
}, pageIndex: {
get: function get() {
return this._pageIndex
}, set: function set(v) {
this._pageIndex = v
}
}, alternateText: {
get: function get() {
return this._alternateText
}, set: function set(value) {
this._alternateText = value
}
}, imageSource: {set: function set(value) {
if (typeof value === "string") {
this._imageCardUrl = value
}
else if (typeof value === "object") {
this._imageCardUrl = value.url;
this._cacheId = value.cacheId;
this._width = value.width;
this._height = value.height;
this._thumbnail = value.thumbnail
}
}}, _init: function _init() {
if (this.alternateText) {
this._domElement.setAttribute("aria-label", this.alternateText)
}
this._imgElementDiv = document.createElement("div");
this._imgElement = document.createElement("img");
WinJS.Utilities.addClass(this._imgElementDiv, "platformImageCardImage platformHide");
WinJS.Utilities.addClass(this._imgElement, "ssImage");
this._imgElementDiv.appendChild(this._imgElement);
if (this.zoomInEnabled) {
this.initializeOpticalZoom()
}
var placeholderElement=this._placeholderElement = document.createElement("div");
WinJS.Utilities.addClass(placeholderElement, "platformImageCardPlaceholder");
this._domElement.appendChild(placeholderElement);
var iconElement=document.createElement("div");
WinJS.Utilities.addClass(iconElement, "platformImageCardPlaceholderIcon platformCameraIcon");
placeholderElement.appendChild(iconElement);
this._iconElement = iconElement;
var progressElement=document.createElement("progress");
WinJS.Utilities.addClass(progressElement, "platformImageCardPlaceholderProgress win-ring");
placeholderElement.appendChild(progressElement);
this._progressElement = progressElement;
placeholderElement.appendChild(progressElement);
this._showPlaceholder();
this._domElement.appendChild(this._imgElementDiv);
WinJS.Utilities.addClass(this._domElement, "platformPlaceHolderMedium")
}, initializeOpticalZoom: function initializeOpticalZoom() {
this._handleWheelBind = this._handleWheel.bind(this);
this._imgElementDiv.addEventListener("wheel", this._handleWheelBind);
var zoomedInElement=document.querySelector(".ssZoomIn");
if (zoomedInElement) {
this._ssZoomedInView = zoomedInElement.winControl
}
}, handleKeyDown: function handleKeyDown(eventObject) {
if (!eventObject.ctrlKey) {
return
}
if (WinJS.Utilities.hasClass(this._imgElementDiv, "platformHide")) {
return
}
var semanticZoomControl=document.querySelector(".ssSemanticZoomDom");
if (semanticZoomControl && semanticZoomControl.winControl && semanticZoomControl.winControl.zoomedOut) {
return
}
if (this._ssZoomedInView && this.pageIndex !== this._ssZoomedInView.currentPage) {
return
}
var distance;
var Key=WinJS.Utilities.Key;
switch (eventObject.keyCode) {
case Key.add:
case Key.equal:
distance = 1;
break;
case Key.subtract:
case Key.dash:
distance = -1;
break;
default:
return
}
distance = distance * this.zoomState.DistancePerKeystroke;
var x=0.5 * window.innerWidth;
var y=0.5 * window.innerHeight;
var processed=this._performZoom(distance, x, y);
if (processed) {
eventObject.stopPropagation();
eventObject.preventDefault()
}
}, _handleWheel: function _handleWheel(eventObject) {
if (!eventObject.ctrlKey || eventObject.deltaY === 0) {
return
}
var distance=eventObject.deltaY * this.zoomState.DistancePerWheelDelta;
var x=eventObject.offsetX;
var y=eventObject.offsetY;
var tempElement=eventObject.srcElement;
while (tempElement && tempElement !== this._imgElementDiv) {
x += tempElement.offsetLeft;
y += tempElement.offsetTop;
tempElement = tempElement.parentNode
}
if (this._performZoom(distance, x, y)) {
eventObject.preventDefault()
}
}, _currentZoomLevel: 1, _performZoom: function _performZoom(distance, x, y) {
var container=this._imgElementDiv;
var currentZoomLevel=this._currentZoomLevel;
var minZoomLevel=this.zoomState.min;
var maxZoomLevel=this.zoomState.max;
if (!this.zoomInEnabled) {
return false
}
if ((currentZoomLevel <= minZoomLevel && distance < 0) || (currentZoomLevel >= maxZoomLevel && distance > 0)) {
return false
}
this._currentZoomLevel = currentZoomLevel = currentZoomLevel + distance;
if (currentZoomLevel < minZoomLevel) {
currentZoomLevel = minZoomLevel
}
else if (currentZoomLevel > maxZoomLevel) {
currentZoomLevel = maxZoomLevel
}
var zoString=x.toFixed() + "px " + y.toFixed() + "px";
container.style["transition-property"] = "-ms-transform";
container.style["transition-timing-function"] = "linear";
container.style["transform-origin"] = zoString;
container.style["transform"] = "scale(" + currentZoomLevel + ")";
return true
}, resetZoom: function resetZoom() {
if (!this.zoomInEnabled) {
return
}
var that=this;
setImmediate(function _SlideshowImageCard_288() {
var container=that._imgElementDiv;
container.style["transition-property"] = "-ms-transform";
container.style["transform"] = "scale(1)";
that._currentZoomLevel = 1;
var zoomElement=container.parentNode;
if (zoomElement) {
zoomElement.msContentZoomFactor = 1
}
})
}, canZoomOut: function canZoomOut() {
return this._currentZoomLevel > this.zoomState.min
}, zoomState: {
min: 1, max: 5, DistancePerKeystroke: .25, DistancePerWheelDelta: -.4 / (document.documentElement.clientHeight * .15)
}, _setImage: function _setImage(url) {
if (this._imgElement) {
var img=this._imgElement;
img.src = url;
var container=this.container || this._domElement;
this._handleImageOnLoadBind = this._handleOnLoad.bind(this);
img.addEventListener("load", this._handleImageOnLoadBind, false);
this._handleImageErrorBind = this._handleImageError.bind(this);
img.addEventListener("error", this._handleImageErrorBind, false)
}
}, _showPlaceholder: function _showPlaceholder() {
this._toggleProgress(true);
this._toggleIcon(false);
this._togglePlaceholder(true)
}, _fetchImage: function _fetchImage(networkCallRequired) {
var that=this;
var imageSet=false;
PlatformJS.Utilities.fetchImage(that._cacheId, that._imageCardUrl, networkCallRequired).then(function imageCard_fetchHiResImageComplete(url) {
that._setImage(url);
imageSet = true
}, function imageCard_fetchHiResImageError() {
that._handleImageError()
});
if (this._thumbnail) {
PlatformJS.Utilities.fetchImage(that._cacheId, that._thumbnail.url, networkCallRequired).then(function imageCard_fetchLowResImageComplete(url) {
WinJS.Promise.timeout(150).then(function imageCard_fetchLowResImage_timeout() {
if (imageSet) {
return
}
that._setImage(url)
})
}, function imageCard_fetchLowResImageError() {
that._handleImageError()
})
}
}, _refresh: function _refresh() {
Slideshow.Utilities.setInnerHtml(this._domElement, "");
this._init(this._domElement);
this._fetchImage(this._showPlaceholder.bind(this))
}, _handleImageError: function _handleImageError(err) {
var that=this;
this._toggleProgress(false);
this._toggleIcon(true);
this._togglePlaceholder(true)
}, _toggleElement: function _toggleElement(element, show) {
if (element) {
if (show) {
WinJS.Utilities.removeClass(element, "platformHide")
}
else {
WinJS.Utilities.addClass(element, "platformHide")
}
}
}, _toggleProgress: function _toggleProgress(show) {
this._toggleElement(this._progressElement, show)
}, _togglePlaceholder: function _togglePlaceholder(show) {
this._toggleElement(this._placeholderElement, show)
}, _toggleIcon: function _toggleIcon(show) {
var placeholderImageElement=this._placeholderElement;
var that=this;
if (show && that.showErrorInfo && placeholderImageElement) {
var className="ssError";
var domElement=placeholderImageElement.querySelector("." + className);
if (!domElement) {
domElement = document.createElement("div");
WinJS.Utilities.addClass(domElement, className);
placeholderImageElement.appendChild(domElement);
WinJS.Utilities.addClass(placeholderImageElement, className);
var retryFunction=WinJS.Utilities.markSupportedForProcessing(function imageCard_retryFunction(evt) {
that._refresh()
});
var data;
if (!PlatformJS.Utilities.hasInternetConnection()) {
data = CommonJS.Error.getErrorModuleItem(retryFunction, "450px", "100%", "/platform/offline_noContent", "platformOfflineErrorModule")
}
else {
data = CommonJS.Error.getErrorModuleItem(retryFunction, "450px", "100%")
}
var moduleInfo=data.moduleInfo;
var container=document.createElement("div");
container.style.width = moduleInfo.width;
container.style.height = moduleInfo.height;
Slideshow.Utilities.setInnerHtml(domElement, "");
domElement.appendChild(container);
CommonJS.loadModule(moduleInfo, data, container)
}
this._toggleElement(this._iconElement, false)
}
else {
this._toggleElement(this._iconElement, show)
}
}, _removePlaceholderImage: function _removePlaceholderImage() {
if (this._domElement && this._placeholderElement) {
this._domElement.removeChild(this._placeholderElement);
this._placeholderElement = null
}
}, _handleOnLoad: function _handleOnLoad(e) {
var that=this;
WinJS.Utilities.addClass(that._imgElement, Slideshow.Constants.ssImageLoaded);
var alt=this.alternateText ? this.alternateText : Slideshow.ResourceStrings.SLIDE;
that._imgElement.setAttribute("alt", alt);
that._showImageOnload(e.srcElement)
}, autoAdjustImageSize: function autoAdjustImageSize(img, fill) {
var w=this._width ? this._width : img.naturalWidth,
h=this._height ? this._height : img.naturalHeight,
imgParentNode=img.parentNode,
container=(imgParentNode && imgParentNode.parentNode) ? imgParentNode.parentNode : null;
if (container && (fill || (w >= container.clientWidth || h >= container.clientHeight))) {
var newSize=this._calculateImageDisplaySize(w, h, container);
img.setAttribute("width", newSize.width);
img.setAttribute("height", newSize.height)
}
else {
img.setAttribute("width", w);
img.setAttribute("height", h)
}
}, _showImageOnload: function _showImageOnload(img) {
var that=this;
this.autoAdjustImageSize(img, that.fill);
WinJS.Utilities.removeClass(img.parentNode, "platformHide");
if (this._placeholderElement) {
if (!WinJS.Utilities.hasClass(this._placeholderElement, "platformHide")) {
WinJS.UI.Animation.crossFade(img, this._placeholderElement).then(function imageCard_crossFadeComplete() {
that._removePlaceholderImage()
})
}
else {
that._removePlaceholderImage()
}
}
}, pageId: {
get: function get() {
return this._pageId
}, set: function set(v) {
this._pageId = v
}
}, _cropImageOnload: function _cropImageOnload(img) {
WinJS.Utilities.removeClass(img.parentNode, "platformHide");
var loadPos=calcPos(img);
setImagePos(img, loadPos);
this._removePlaceholderImage();
function calcPos(imgElement) {
var container=imgElement.parentNode;
var cw=container.clientWidth,
ch=container.clientHeight;
var imageW=imgElement.naturalWidth,
imageH=imgElement.naturalHeight;
var ratio=cw / ch;
if (imageW / imageH < ratio) {
var dispWidth=cw;
var dispHeight=imageH * (dispWidth / imageW);
return {
left: 0, top: 0 - (dispHeight - ch) / 2, width: dispWidth, height: dispHeight
}
}
else {
var dispHeight1=ch;
var dispWidth1=imageW * (dispHeight1 / imageH);
return {
left: 0 - (dispWidth1 - cw) / 2, top: 0, width: dispWidth1, height: dispHeight1
}
}
}
function setImagePos(imageElement, pos) {
imageElement.style.position = "relative";
imageElement.setAttribute("width", pos.width);
imageElement.setAttribute("height", pos.height);
imageElement.style.top = pos.top + "px";
imageElement.style.left = pos.left + "px"
}
}, _calculateImageDisplaySize: function _calculateImageDisplaySize(imageWidth, imageHeight, mainContainer) {
if (imageWidth && imageHeight && mainContainer) {
var width=0;
var height=0;
var containerWidth=mainContainer.clientWidth;
var containerHeight=mainContainer.clientHeight;
containerWidth = containerWidth > 0 ? containerWidth : 160;
containerHeight = containerHeight > 0 ? containerHeight : 160;
var imageRatio=imageWidth / imageHeight;
var containerRatio=containerWidth / containerHeight;
if (imageRatio > containerRatio) {
width = containerWidth;
height = width / imageRatio
}
else {
height = containerHeight;
width = height * imageRatio
}
if (width === 190) {
debugger
}
return {
width: width + "px", height: height + "px"
}
}
return {
width: "auto", height: "auto"
}
}
}, {relayoutSlides: function relayoutSlides() {
var that=this;
var images=document.querySelectorAll(".ssZoomIn .ssImageLoaded");
for (var i=0; i < images.length; i++) {
var img=images[i];
if (img.parentNode && img.parentNode.parentNode) {
var container=img.parentNode.parentNode;
var imageCard=container.winControl;
if (imageCard) {
imageCard.autoAdjustImageSize(img, imageCard.fill)
}
}
}
}})})
})();
(function CommonControlsSlideshowControlBaseInit() {
"use strict";
var SlideshowUtilities=CommonJS.Slideshow.Utilities;
var Slideshow=WinJS.Namespace.define("CommonJS.Slideshow", {SlideshowControlBase: WinJS.Class.define(function slideshowControlBase_ctor(element, options, count, slideshowId, instrumentationId) {
options = options || {};
this._options = options;
this._domElement = element;
this._domElement.winControl = this;
CommonJS.Utils.markDisposable(this._domElement);
this._slideCount = count;
this._additionalButtons = null;
WinJS.UI.setOptions(this, options);
this._onLayoutUpdatedBind = this._onLayoutUpdated.bind(this);
this._domElement.addEventListener("mselementresize", this._onLayoutUpdatedBind);
this._initInstrumentation(slideshowId, instrumentationId)
}, {
_options: null, _domElement: null, _slideCount: 0, _infoShown: true, _isZoomedOut: null, _additionalButtons: null, _triggerZoom: null, _selectedIndex: null, _headerShownFlag: false, _lastZoomFactor: 1, _flipElement: null, _ssControl: null, _mediaContainer: null, _startIndex: 0, _mediaPos: null, _mediaBox: null, _attributionButton: null, _attributionLabel: null, _smDS: null, _isDisposed: false, _buttonsWrapper: null, _currentImageCard: null, _instrumentationIndex: -1, _onMSContentZoomBind: null, _onMouseWheelBind: null, _onLayoutUpdatedBind: null, _pageVisibilityChangeHandlerBind: null, _pageCompletedHandlerBind: null, _semanticKeydownHandlerBind: null, _touchListenerBind: null, _keyupListenerBind: null, cacheId: null, onClickHandler: null, customAnimations: null, pageVisibilityChanged: null, zoomableView: {get: function get() {
return this
}}, beginZoom: function beginZoom() {
this._selectedIndex = this._ssControl.currentPage
}, configureForZoom: function configureForZoom(isZoomedOut, isCurrentView, triggerZoom, prefectchedPages) {
this._isZoomedOut = isZoomedOut;
this._triggerZoom = triggerZoom
}, endZoom: function endZoom(isCurrentView, setFocus) {
var selectedIndex=this._selectedIndex;
if (selectedIndex) {
this._ssControl.currentPage = (selectedIndex)
}
}, getCurrentItem: function getCurrentItem() {
this._headerShownFlag = true;
var header=document.querySelector(".immersiveHeader");
if (header) {
header.style.visibility = "visible"
}
var dataSource=this.smDataSource.dataSource;
var binding=dataSource.createListBinding();
return binding.fromIndex(this._ssControl.currentPage).then(function slideshowControlBase_getCurrentItemFromIndexComplete(listItem) {
return WinJS.Promise.wrap({
item: listItem, position: {
left: 0, top: 0, width: 100, height: 100
}
})
})
}, getPanAxis: function getPanAxis() {
return "horizontal"
}, positionItem: function positionItem(listItem, position) {
this._headerShownFlag = false;
this._infoShown = !this._infoShown;
this._toggleInfoBlock();
var index=listItem.firstItemIndexHint;
this._ssControl.currentPage = index;
this._selectedIndex = index;
return WinJS.Promise.wrap({
x: 0, y: 0
})
}, setCurrentItem: function setCurrentItem(x, y){}, _onLayoutUpdated: function _onLayoutUpdated() {
if (this._mediaContainer) {
Slideshow.ImageCard.relayoutSlides()
}
}, currentPage: {get: function get() {
var currentPage=0;
if (this._ssControl) {
currentPage = this._ssControl.currentPage
}
return currentPage
}}, startIndex: {
get: function get() {
if (typeof this._startIndex === "undefined") {
this._startIndex = 0
}
return this._startIndex
}, set: function set(newData) {
this._startIndex = newData
}
}, additionalButtons: {set: function set(v) {
this._additionalButtons = v
}}, mediaBlockPosition: {
get: function get() {
if (!this._mediaPos) {
this._mediaPos = Slideshow.SlideshowControl.MediaBlockPosition.bottomRight
}
return this._mediaPos
}, set: function set(newData) {
this._mediaPos = newData
}
}, _initInstrumentation: function _initInstrumentation(slideshowId, instrumentationId) {
var authorPublisherInfo="";
var attrList=document.getElementsByClassName("ssAttr");
if (attrList && attrList[0]) {
authorPublisherInfo = attrList[0].innerText
}
var impression=PlatformJS.Navigation.mainNavigator.getCurrentImpression();
if (!impression) {
return
}
if (this._instrumentationIndex !== -1) {
debugger
}
this._instrumentationIndex = impression.addContent(authorPublisherInfo, instrumentationId, slideshowId, "slideshow", new Date(0), null, this.title, false, null, false, null)
}, _render: function _render() {
SlideshowUtilities.setInnerHtml(this._domElement, "");
var flipElement=SlideshowUtilities.createElement("div", "flipContainer", this._domElement);
flipElement.setAttribute("aria-label", Slideshow.ResourceStrings.SLIDESHOW);
this._createFlipControl(flipElement);
this._createMediaContainer(this._domElement);
this._hookupEvents()
}, _hookupEvents: function _hookupEvents() {
var that=this;
this._pageVisibilityChangeHandlerBind = this._pageVisibilityChangeHandler.bind(this);
this._pageCompletedHandlerBind = this._pageCompletedHandler.bind(this);
this._ssControl.addEventListener("pagevisibilitychanged", this._pageVisibilityChangeHandlerBind, false);
this._ssControl.addEventListener("pagecompleted", this._pageCompletedHandlerBind);
this._touchListenerBind = this._touchListener.bind(this);
this._keyupListenerBind = this._keyupListener.bind(this);
this._ssControl.addEventListener("click", this._touchListenerBind, false);
this._ssControl.addEventListener("keyup", this._keyupListenerBind, false);
this._mediaContainer.addEventListener("click", this._touchListenerBind, false);
this._mediaContainer.addEventListener("keyup", this._keyupListenerBind, false);
var firstImageCardElement=document.querySelector(".ssZoomIn .flipItem");
if (firstImageCardElement && firstImageCardElement.winControl) {
this._currentImageCard = firstImageCardElement.winControl
}
var semanticZoomDom=document.querySelector(".ssSemanticZoomDom");
if (semanticZoomDom && semanticZoomDom.parentNode) {
this._semanticParent = semanticZoomDom.parentNode;
this._semanticKeydownHandlerBind = this._semanticKeydownHandler.bind(this);
this._semanticParent.addEventListener("keydown", this._semanticKeydownHandlerBind, true)
}
}, _semanticKeydownHandler: function _semanticKeydownHandler(event) {
if (this._currentImageCard) {
this._currentImageCard.handleKeyDown(event)
}
this._logTelemetry(event)
}, _instrumentSlideshow: function _instrumentSlideshow() {
var impression=PlatformJS.Navigation.mainNavigator.getCurrentImpression();
if (!impression) {
return
}
var progress=new Microsoft.Bing.AppEx.Telemetry.ContentViewProgress;
progress.pageCount = this._slideCount;
progress.page = this._ssControl.currentPage + 1;
impression.logContentView(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, this._instrumentationIndex, Microsoft.Bing.AppEx.Telemetry.ContentViewMechanism.unknown, false, progress)
}, _logTelemetry: function _logTelemetry(event) {
var actionElement=null;
if (this._slideCount > 0) {
if ((event.keyCode === WinJS.Utilities.Key.rightArrow) && (this.currentPage < this._slideCount - 1)) {
actionElement = SlideshowUtilities.actionElement.nextFlipper
}
else if ((event.keyCode === WinJS.Utilities.Key.leftArrow) && (this.currentPage > 0)) {
actionElement = SlideshowUtilities.actionElement.previousFlipper
}
if (actionElement) {
SlideshowUtilities.logUserAction(actionElement, SlideshowUtilities.actionMethod.keyboard)
}
}
}, _touchListener: function _touchListener(event) {
if (SlideshowUtilities.clickBlock(event, "ssMediaOverlay")) {
if (this.onClickHandler) {
this.onClickHandler(this._mediaBox.getAttribute("uid"))
}
}
else if (!SlideshowUtilities.clickInfoArea(event)) {
this._toggleInfoBlock()
}
}, _keyupListener: function _keyupListener(event) {
switch (event.keyCode) {
case WinJS.Utilities.Key.space:
this._toggleInfoBlock();
break;
case WinJS.Utilities.Key.enter:
this._onEnterKeyUp(event);
break;
case WinJS.Utilities.Key.escape:
WinJS.Navigation.back();
break;
default:
break
}
}, _onEnterKeyUp: function _onEnterKeyUp(event) {
var target=event.target;
if (target && WinJS.Utilities.hasClass(target, "ssMediaOverlay")) {
if (this.onClickHandler) {
return this.onClickHandler(this._mediaBox.getAttribute("uid"))
}
}
}, _pageVisibilityChangeHandler: function _pageVisibilityChangeHandler(event) {
if (!event.detail.visible) {
this._updateMediaBlock(this._ssControl.currentPage);
if (this.pageVisibilityChanged) {
this.pageVisibilityChanged(this._ssControl.currentPage, this._buttonsWrapper)
}
}
if (event.target && event.target.winControl && event.detail.visible) {
this._currentImageCard = event.target.winControl;
this._currentImageCard.resetZoom()
}
}, _pageCompletedHandler: function _pageCompletedHandler(event) {
this._instrumentSlideshow()
}, _updateMediaBlock: function _updateMediaBlock(pageIndex) {
var that=this;
if (this._mediaBox && this._ssControl) {
SlideshowUtilities.setInnerHtml(this._mediaBox, "");
this.smDataSource.dataSource.itemFromIndex(pageIndex).then(function slideshowControlBase_updateMediaBlockFromIndexComplete(item) {
that._setMediaContent(item)
})
}
}, _toggleInfoBlock: function _toggleInfoBlock() {
var that=this;
var header=document.querySelector(".immersiveHeader");
if (!that._infoShown) {
that._infoShown = true;
that._mediaBox.style.display = "";
if (!this._headerShownFlag && header) {
header.style.visibility = "visible"
}
}
else {
that._mediaBox.style.display = "none";
if (!this._headerShownFlag && header) {
header.style.visibility = "hidden"
}
that._infoShown = false
}
that._attributionButton.currentState = that._infoShown ? "on" : "off"
}, _createMediaContainer: function _createMediaContainer(container) {
this._mediaContainer = SlideshowUtilities.createElement("div", "ssMediaContainer", container);
this._createMediaBox(this._mediaContainer);
this._createAttribution()
}, _createAdditionalButtons: function _createAdditionalButtons(mediaContainerElement) {
if (!this._additionalButtons) {
return
}
var buttonsWrapper=this._buttonsWrapper = document.createElement("div");
WinJS.Utilities.addClass(buttonsWrapper, "ssAdditionalButtons");
var row=mediaContainerElement.style.msGridRow;
var column=mediaContainerElement.msGridColumn;
var buttonElement=null;
var that=this;
for (var i=0; i < this._additionalButtons.length; i++) {
var currentButton=this._additionalButtons[i];
buttonElement = SlideshowUtilities.createElement("div", currentButton.className, buttonsWrapper);
buttonElement.setAttribute("tabIndex", 0);
var onclick=(function slideshowControlBase_additionalButtonOnClick(button) {
return function _SlideshowControlBase_431(event) {
button.clickHandler(that._ssControl.currentPage);
event.stopPropagation()
}
})(currentButton);
var onkeydown=(function slideshowControlBase_additionalButtonOnKeyDown(button) {
return function _SlideshowControlBase_438(event) {
if (event.keyCode === WinJS.Utilities.Key.enter) {
button.clickHandler(that._ssControl.currentPage);
event.stopPropagation()
}
}
})(currentButton);
buttonElement.addEventListener("click", onclick, false);
buttonElement.addEventListener("keydown", onkeydown, false);
SlideshowUtilities.createElement("div", "primaryText", buttonElement, currentButton.primaryText);
SlideshowUtilities.createElement("div", "value", buttonElement, currentButton.value);
SlideshowUtilities.createElement("div", "secondaryText", buttonElement, currentButton.secondaryText)
}
buttonsWrapper.style.msGridColumn = column;
if ((this.mediaBlockPosition === Slideshow.SlideshowControl.MediaBlockPosition.topLeft) || (this.mediaBlockPosition === Slideshow.SlideshowControl.MediaBlockPosition.topRight)) {
buttonsWrapper.style.msGridRow = row
}
else {
buttonsWrapper.style.msGridRow = row;
buttonsWrapper.style.msGridRowAlign = "end"
}
mediaContainerElement.appendChild(buttonsWrapper)
}, _createMediaBox: function _createMediaBox(container) {
this._mediaBox = SlideshowUtilities.createElement("div", "ssMediaOverlay " + this.mediaBlockPosition, container);
this._mediaBox.setAttribute("tabIndex", 0);
this._updateMediaBlock(this.startIndex)
}, _createAttribution: function _createAttribution() {
var that=this;
this.attrBox = document.createElement("div");
WinJS.Utilities.addClass(this.attrBox, "ssAttribution");
this._domElement.appendChild(this.attrBox);
var title=PlatformJS.Services.resourceLoader.getString("/platform/imageAttribution") || "Image attribution";
var attributionButton=this._attributionButton = new CommonJS.Button(null, {
icon: "platformInfoButton", title: "title", states: [{
id: "on", title: "title", iconRemove: "platformInfoButtonOff", iconAdd: "platformInfoButtonOn"
}, {
id: "off", title: "title", iconRemove: "platformInfoButtonOn", iconAdd: "platformInfoButtonOff"
}]
});
attributionButton.onclick = this._toggleInfoBlock.bind(this);
attributionButton.currentState = that._infoShown ? "on" : "off";
WinJS.Utilities.addClass(attributionButton.element, "platformAttributionButton");
this.attrBox.appendChild(attributionButton.element)
}, _setAttrContent: function _setAttrContent(item) {
var itemObject=item.data;
var text=itemObject.data.attribution;
if (text) {
SlideshowUtilities.setInnerHtml(this._attributionLabel, text)
}
}, _setMediaContent: function _setMediaContent(item) {
var itemObject=item.data;
var hasData=false;
this._mediaBox.setAttribute("uid", itemObject.data.uniqueIdentifier ? itemObject.data.uniqueIdentifier : "NA");
var text=(item.index === 0 || this.showTitleOnEveryFrame) ? this.title : null;
var titleText=this.dontShowSlideTitle ? "" : itemObject.data.title;
if (!this.dontShowImageCount) {
text = PlatformJS.Services.resourceLoader.getString("/platform/ImageCount").format(item.index + 1, this._slideCount);
if (titleText && titleText.length > 0) {
text += ": " + titleText
}
}
if (text) {
var desc=document.createElement("div");
desc.className = "ssSlideTitle";
SlideshowUtilities.setInnerHtml(desc, text);
this._mediaBox.appendChild(desc);
hasData = true
}
text = itemObject.data.desc;
if (text) {
var desc1=document.createElement("div");
desc1.className = "ssDesc";
SlideshowUtilities.setInnerHtml(desc1, text);
this._mediaBox.appendChild(desc1);
if (text.length > Slideshow.SlideshowControl.MaxStringLengthForNarrow) {
WinJS.Utilities.addClass(this._mediaBox, "wider")
}
else {
WinJS.Utilities.removeClass(this._mediaBox, "wider")
}
hasData = true
}
var attrContainer=document.createElement("div");
if (attrContainer) {
attrContainer.className = "ssAttrContainer";
text = itemObject.data.attribution;
if (text) {
var attr=document.createElement("div");
attr.className = "ssAttr";
SlideshowUtilities.setInnerHtml(attr, text);
if (itemObject.data.onClickAttribution) {
attr.addEventListener("click", itemObject.data.onClickAttribution, false)
}
attrContainer.appendChild(attr);
hasData = true
}
var favicon=itemObject.data.favicon;
if (favicon) {
var sourceImageUrl=favicon.url;
var sourceImage=document.createElement("div");
if (favicon.width) {
sourceImage.style.width = favicon.width + "px"
}
if (favicon.height) {
sourceImage.style.height = favicon.height + "px"
}
sourceImage.className = "ssLogo sourceImage fitBoth";
var sourceImageImage=new CommonJS.ImageCard(sourceImage, {
classification: "tiny", imageSource: {
url: sourceImageUrl, cacheId: this.cacheId
}
});
attrContainer.appendChild(sourceImage);
hasData = true
}
if (this.showArticleLinkLabel) {
text = itemObject.data.uniqueIdentifier;
if (text) {
var readArticleLabel=document.createElement("div");
readArticleLabel.className = "ssArticleLinkLabel";
SlideshowUtilities.setInnerHtml(readArticleLabel, CommonJS.resourceLoader.getString("/platform/ArticleLinkLabelText"));
attrContainer.appendChild(readArticleLabel);
hasData = true
}
}
this._mediaBox.appendChild(attrContainer)
}
this._mediaBox.style.visibility = hasData ? "visible" : "hidden";
this._createAdditionalButtons(this._mediaBox)
}, showEntityForIndex: function showEntityForIndex(index) {
this._ssControl.currentPage = index
}, smDataSource: {
get: function get() {
return this._smDS
}, set: function set(v) {
this._smDS = v;
this._render()
}
}, _createFlipControl: function _createFlipControl(container) {
var that=this;
function renderer(itemPromise, element) {
var d=element;
if (!d) {
d = document.createElement("div");
WinJS.Utilities.addClass(d, "flipItem");
WinJS.Utilities.addClass(d, "zoomElement");
that._onMSContentZoomBind = that._onMSContentZoom.bind(that);
d.addEventListener("MSContentZoom", that._onMSContentZoomBind);
that._onMouseWheelBind = that._onMouseWheel.bind(that);
d.addEventListener("wheel", that._onMouseWheelBind, true)
}
that._flipElement = d;
return {
element: d, renderComplete: itemPromise.then(function slideshowControlBase_itemPromiseComplete(item) {
var itemData=item.data.data;
var imageObj=itemData.image;
var thumbnail=itemData.thumbnail;
d.setAttribute("aria-label", Slideshow.ResourceStrings.SLIDE + " " + item.index);
if (imageObj && imageObj.url) {
var imageCard=new Slideshow.ImageCard(d, {
imageSource: {
url: imageObj.url, cacheId: that.cacheId, width: imageObj.width, height: imageObj.height, thumbnail: thumbnail
}, showErrorInfo: true, alternateText: itemData.altText, zoomInEnabled: true, pageIndex: item.index
})
}
})
}
}
;
var options={};
options.itemDataSource = this.smDataSource.dataSource;
options.currentPage = this.startIndex;
options.itemTemplate = renderer;
options.itemSpacing = 40;
this._ssControl = new WinJS.UI.FlipView(container, options);
this._ssControl._nextButton.style.display = "none";
this._ssControl._prevButton.style.display = "none";
var paginatedViewManager=this._paginatedViewManager = new Slideshow.SlideshowPaginatedViewManager({
controller: this._ssControl, flippersAlwaysVisible: false, touchToShowFlippers: true
});
paginatedViewManager.attachEventListeners(this._ssControl._contentDiv);
function _nextAnimation(curr, next) {
var incomingPageMove={};
next.style.left = "0px";
next.style.top = "0px";
incomingPageMove.left = "100px";
incomingPageMove.top = "100px";
var p=WinJS.UI.Animation.fadeOut(curr);
var p2=WinJS.UI.Animation.enterContent(next, [incomingPageMove]);
return WinJS.Promise.join([p, p2])
}
var animation=null;
if (this.customAnimations) {
animation = this.customAnimations
}
else {
animation = {
next: null, previous: null, jump: null
}
}
this._ssControl.setCustomAnimations(animation)
}, _onMSContentZoom: function _onMSContentZoom(event) {
if (event && event.target) {
if (this._lastZoomFactor === 1 && event.target.msContentZoomFactor === 1) {
this._performZoomOut()
}
this._lastZoomFactor = event.target.msContentZoomFactor
}
}, _onMouseWheel: function _onMouseWheel(ev) {
if (ev.ctrlKey && ev.deltaY > 0 && !ev.currentTarget.winControl.canZoomOut()) {
this._performZoomOut();
ev.stopPropagation();
ev.preventDefault()
}
}, _performZoomOut: function _performZoomOut() {
if (this._triggerZoom) {
this._triggerZoom(true)
}
}, dispose: function dispose() {
if (this._isDisposed) {
return
}
this._isDisposed = true;
var flipElement=this._flipElement;
this._flipElement = null;
if (this._onMSContentZoomBind) {
if (flipElement) {
flipElement.removeEventListener("MSContentZoom", this._onMSContentZoomBind)
}
this._onMSContentZoomBind = null
}
if (this._onMouseWheelBind) {
if (flipElement) {
flipElement.removeEventListener("wheel", this._onMouseWheelBind)
}
this._onMouseWheelBind = null
}
if (this._onLayoutUpdatedBind) {
if (this._domElement) {
this._domElement.removeEventListener("mselementresize", this._onLayoutUpdatedBind);
this._domElement.winControl = null;
this._domElement = null
}
this._onLayoutUpdatedBind = null
}
if (this._pageVisibilityChangeHandlerBind) {
this._ssControl.removeEventListener("pagevisibilitychanged", this._pageVisibilityChangeHandlerBind);
this._pageVisibilityChangeHandlerBind = null
}
if (this._pageCompletedHandlerBind) {
this._ssControl.removeEventListener("pagecompleted", this._pageCompletedHandlerBind);
this._pageCompletedHandlerBind = null
}
if (this._touchListenerBind) {
this._ssControl.removeEventListener("click", this._touchListenerBind);
this._mediaContainer.removeEventListener("click", this._touchListenerBind);
this._touchListenerBind = null
}
if (this._keyupListenerBind) {
this._ssControl.removeEventListener("keyup", this._keyupListenerBind);
this._mediaContainer.removeEventListener("keyup", this._keyupListenerBind);
this._keyupListenerBind = null
}
if (this._ssControl) {
this._ssControl.element.winControl = null;
this._ssControl = null
}
if (this._semanticKeydownHandlerBind && this._semanticParent) {
this._semanticParent.removeEventListener("keydown", this._semanticKeydownHandlerBind);
this._semanticKeydownHandlerBind = null;
this._semanticParent = null
}
this._mediaContainer = null;
this._triggerZoom = null;
this._mediaBox = null;
this._buttonsWrapper = null
}
})})
})();
(function CommonControlsSlideshowControlInit() {
"use strict";
var SlideshowUtils=CommonJS.Slideshow.Utilities;
WinJS.Namespace.define("CommonJS.Slideshow", {SlideshowControl: WinJS.Class.define(function slideshowControl_ctor(element, options) {
this.element = element || document.createElement("div");
this.element.winControl = this;
CommonJS.Utils.markDisposable(this.element);
this.options = options;
WinJS.Utilities.addClass(this.element, "slideView");
this._createDOM();
WinJS.UI.setOptions(this, options)
}, {
_instrDataSetID: 8, _instSlideshowViewDataPointID: 25185, _smDataSource: null, _setFocusOnFlipContainerBind: null, _isDisposed: false, _semanticZoomDom: null, _zoomInDom: null, _zoomOutDom: null, _semanticZoom: null, _zoomedInItem: null, _zoomedOutItem: null, cacheId: {
get: function get() {
return this._cacheId
}, set: function set(v) {
this._cacheId = v
}
}, startIndex: {
get: function get() {
return this.options.startIndex
}, set: function set(value) {
this.options.startIndex = value
}
}, currentPage: {get: function get() {
if (this._zoomedInItem) {
return this._zoomedInItem.currentPage
}
else {
return this.options.startIndex
}
}}, dataOptions: {set: function set(v) {
this._config = v.config;
this._provider = v.provider;
this._initData()
}}, dynamicPanoPaywallMessageFunction: function dynamicPanoPaywallMessageFunction(){}, provider: {get: function get() {
return this._provider
}}, config: {get: function get() {
return this._config
}}, data: {
get: function get() {
return this._data
}, set: function set(r) {
if (r && r.slides) {
this._data = r.slides;
this.options.title = r.title;
this.options.desc = r.desc;
this.options.byline = r.byline;
this.options.version = r.version;
this.options.additionalButtons = r.additionalButtons;
this.options.pageVisibilityChanged = r.pageVisibilityChanged
}
this._refresh();
try {
this.dynamicPanoPaywallMessageFunction()
}
catch(error) {
debugger
}
}
}, semanticZoom: {get: function get() {
return this._semanticZoom
}}, semanticZoomRenderer: function semanticZoomRenderer(itemPromise) {
var that=this;
return {element: itemPromise.then(function slideshowControl_semanticZoomRendererItemPromiseComplete(item) {
var d=document.createElement("div");
d.setAttribute("aria-label", CommonJS.Slideshow.ResourceStrings.SLIDE + " " + item.index);
WinJS.Utilities.addClass(d, "ssZoomedOutTemplate");
if (item.data && item.data.data && item.data.data.thumbnail) {
var imageCard=new CommonJS.Slideshow.ImageCard(d, {
imageSource: {
url: item.data.data.thumbnail.url, cacheId: that.cacheId, width: item.data.data.thumbnail.width, height: item.data.data.thumbnail.height
}, alternateText: item.data.data.altText, fill: true, zoomInEnabled: false
})
}
return d
})}
}, showEntityForIndex: function showEntityForIndex(index) {
this._zoomedInItem.showEntityForIndex(index)
}, _createDOM: function _createDOM() {
this._canvas = SlideshowUtils.createElement("div", "viewPort", this.element);
this._canvas.setAttribute("aria-label", CommonJS.Slideshow.ResourceStrings.SLIDESHOW);
this._semanticZoomDom = SlideshowUtils.createElement("div", "ssSemanticZoomDom", this._canvas);
this._zoomInDom = SlideshowUtils.createElement("div", "ssZoomIn platformParallaxImageViewport", this._semanticZoomDom);
this._zoomOutDom = SlideshowUtils.createElement("div", "ssZoomOut", this._semanticZoomDom);
var headerElement=SlideshowUtils.createElement("div", null, this.element);
this.header = new CommonJS.Immersive.Header(headerElement)
}, _initData: function _initData() {
var that=this;
var provider=this.provider;
var config=this.config;
if (!provider) {
debugger
}
else {
that._initializeSplash();
provider.initializeAsync(config).then(function slideshowControl_providerInitializeAsyncComplete(success) {
provider.queryAsync(0, -1).then(function slideshowControl_providerQueryAsyncComplete(result) {
that._destroySplash();
if (result && result.slides && result.slides.length > 0) {
that.data = (result)
}
else {
that._handleError()
}
}, that._handleError.bind(that))
}, that._handleError.bind(that))
}
}, smDataSource: {get: function get() {
if (!this._smDataSource) {
var slides=[];
var rawData=this.data;
for (var i=0, len=rawData.length; i < len; i++) {
var dataItem=rawData[i];
slides.push({
key: "r" + i, data: dataItem, itemOffset: i, uniqueID: i
})
}
var itemsList=new WinJS.Binding.List(slides);
var charPostfix="A";
var groupedItemsList=itemsList.createGrouped(function slideshowControl_createdGroup(item) {
if (item) {
return item.itemOffset + charPostfix
}
return charPostfix
}, function slideshowControl_groupItem(item) {
return item
}, function slideshowControl_groupCompare(l, r) {
return 0
});
this._smDataSource = groupedItemsList
}
return this._smDataSource
}}, _refresh: function _refresh() {
if (!this.data) {
return
}
var slideshowId=-1,
instrumentationId=-1;
if (this.provider && this.provider.slideshowId) {
slideshowId = this.provider.slideshowId
}
if (this.data.instrumentationId) {
instrumentationId = this.data.instrumentationId
}
this._zoomedInItem = new CommonJS.Slideshow.SlideshowControlBase(this._zoomInDom, this.options, this.data.length, slideshowId, instrumentationId);
var zoomOutOptions={
selectionMode: "none", crossSlide: "none", itemDataSource: this.smDataSource.groups.dataSource
};
this._zoomedOutItem = new WinJS.UI.ListView(this._zoomOutDom, zoomOutOptions);
this._zoomedOutItem.itemTemplate = this.semanticZoomRenderer.bind(this);
this._semanticZoom = new WinJS.UI.SemanticZoom(this._semanticZoomDom);
this._setFocusOnFlipContainerBind = this._setFocusOnFlipContainer.bind(this);
this._semanticZoom.addEventListener("zoomchanged", this._setFocusOnFlipContainerBind);
this._zoomedInItem.smDataSource = this.smDataSource;
this._setFocusOnFlipContainer()
}, _setFocusOnFlipContainer: function _setFocusOnFlipContainer() {
if (!this._semanticZoom.zoomedOut) {
var flipContainer=this._zoomInDom.querySelector(".flipContainer");
if (flipContainer) {
flipContainer.focus()
}
}
}, dispose: function dispose() {
if (!this._isDisposed) {
this._isDisposed = true;
if (this._zoomedInItem && this._zoomedInItem.dispose) {
this._zoomedInItem.dispose();
this._zoomedInItem = null
}
if (this._zoomInDom) {
this._zoomInDom.winControl = null;
this._zoomInDom = null
}
if (this._zoomedOutItem && this._zoomedOutItem.dispose) {
this._zoomedOutItem.dispose();
this._zoomedOutItem = null
}
if (this._zoomOutDom) {
this._zoomOutDom.winControl = null;
this._zoomOutDom = null
}
if (this._semanticZoom) {
if (this._setFocusOnFlipContainerBind) {
this._semanticZoom.removeEventListener("zoomchanged", this._setFocusOnFlipContainerBind);
this._setFocusOnFlipContainerBind = null
}
if (this._semanticZoom.dispose) {
this._semanticZoom.dispose();
this._semanticZoom = null
}
}
if (this.element) {
this.element.winControl = null;
this.element = null
}
}
}, _initializeSplash: function _initializeSplash() {
CommonJS.Progress.showProgress(CommonJS.Progress.centerProgressType)
}, _destroySplash: function _destroySplash() {
CommonJS.Progress.hideProgress(CommonJS.Progress.centerProgressType);
PlatformJS.mainProcessManager.afterFirstView()
}, _handleError: function _handleError(error) {
this._destroySplash();
var code=PlatformJS.Utilities.getPlatformErrorCode(error);
var errorCode=PlatformJS.Utilities.checkOfflineErrorCode(code);
CommonJS.Error.showError(errorCode, function slideshowControl_initDataShowError(evt) {
CommonJS.forceRefresh()
})
}
}, {
MediaBlockPosition: {
topLeft: "topLeft", topRight: "topRight", bottomLeft: "bottomLeft", bottomRight: "bottomRight"
}, MaxStringLengthForNarrow: 350
})})
})();
(function appexCommonControlsSlideshowPageInit() {
"use strict";
WinJS.Namespace.define("CommonJS.Slideshow", {
SlideshowProvider: WinJS.Class.define(function slideshowProvider_ctor(options) {
WinJS.UI.setOptions(this, options)
}, {
slideshowId: null, market: null, queryServiceId: "CustomPanoSlideshows", updateResponse: null, initializeAsync: function initializeAsync(configuration) {
WinJS.UI.setOptions(this, configuration);
return WinJS.Promise.wrap(true)
}, queryAsync: function queryAsync(startPos, count) {
var that=this;
var queryService=new Platform.QueryService(this.queryServiceId);
var queryParams=PlatformJS.Collections.createStringDictionary();
queryParams.insert("slideshowId", this.slideshowId);
queryParams.insert("market", this.market);
var isPreviewModeEnabled=PlatformJS.Configuration.ConfigurationManager.previewFeaturedDataSource;
if (PlatformJS.isDebug && isPreviewModeEnabled) {
queryParams["previewparams"] = "/" + PlatformJS.Services.appConfig.getString("CMSPreviewParam")
}
else {
queryParams["previewparams"] = ""
}
return queryService.fetchDataAsync(queryParams, null, null).then(function _SlideshowPage_40(response) {
var jsonResponse=null;
try {
jsonResponse = JSON.parse(response.dataString);
if (that.updateResponse) {
jsonResponse = that.updateResponse(jsonResponse)
}
}
catch(exception) {
queryService.deleteCacheEntryAsync(queryParams, null);
throw new SyntaxError("Syntax Error");
}
return jsonResponse
})
}
}, {_version: 1}), SlideshowPage: WinJS.Class.define(function slideshowPage_ctor(state) {
if (state) {
this.slideshowId = state.config && state.config.slideshowId ? state.config.slideshowId : state.slideshowId;
this.startPageIndex = state.startPageIndex ? state.startPageIndex : 0;
this.instrumentationEntryPoint = state.instrumentationEntryPoint;
this.market = state.config && state.config.market ? state.config.market : (state.market ? state.market : CommonJS.Globalization.getMarketStringForEditorial());
this._state = state;
var slideShowControl=this._slideShowControl = PlatformJS.Utilities.getControl("ssView");
if (state.extraOptions && slideShowControl) {
var extraOptions=state.extraOptions;
if (extraOptions.dynamicPanoPaywallMessageFunction) {
slideShowControl.dynamicPanoPaywallMessageFunction = extraOptions.dynamicPanoPaywallMessageFunction
}
}
}
}, {
slideshowId: null, startPageIndex: 0, instrumentationEntryPoint: null, market: null, queryServiceId: "CustomPanoSlideshows", _slideShowControl: null, clickHandler: null, updateResponse: null, getPageImpressionContext: function getPageImpressionContext() {
if (this.instrumentationEntryPoint === 1) {
return "/Partner Pano/Slideshow"
}
else {
return "/Slideshow"
}
}, getPageState: function getPageState() {
this._state = this._state || {};
var control=this._slideShowControl;
if (!control) {
control = this._slideShowControl = PlatformJS.Utilities.getControl("ssView")
}
if (control && control.currentPage >= 0) {
this._state.startPageIndex = control.currentPage
}
return this._state
}, getPageData: function getPageData() {
var that=this;
var options={
slideshowId: this.slideshowId, market: this.market, updateResponse: this.updateResponse, queryServiceId: this.queryServiceId
};
var provider=new CommonJS.Slideshow.SlideshowProvider(options);
var config=PlatformJS.Collections.createStringDictionary();
var p=new WinJS.Promise(function _SlideshowPage_124(complete) {
complete({
dataOptions: {
provider: provider, config: config
}, instrumentationEntryPoint: that.instrumentationEntryPoint, startIndex: that.startPageIndex, clickHandler: that.clickHandler
})
});
return p
}, onBindingComplete: function onBindingComplete(){}, handleShareRequest: function handleShareRequest(request) {
CommonJS.Sharing.Slideshow.share(request, this._state)
}, dispose: function dispose() {
var slideShowControl=this._slideShowControl;
if (slideShowControl && slideShowControl.dispose) {
slideShowControl.dispose()
}
}
})
})
})();
(function _SlideshowPaginatedViewManager_7() {
"use strict";
var utils=CommonJS.Slideshow.Utilities;
WinJS.Namespace.define("CommonJS.Slideshow", {SlideshowPaginatedViewManager: WinJS.Class.derive(CommonJS.PaginatedViewManager, function _SlideshowPaginatedViewManager_16(options) {
this._controller = options.controller;
CommonJS.PaginatedViewManager.call(this, options);
var panningDiv=this._controller._panningDivContainer;
if (panningDiv) {
this._attach(panningDiv, "scroll", this._onScroll);
this._attach(panningDiv, "wheel", this._onWheel)
}
}, {
_controller: null, _currentPageIndex: 0, _isPrevNextClick: false, _isWheelEvent: false, _getContainerElement: function _getContainerElement() {
return this._controller._contentDiv
}, _hasNext: function _hasNext() {
return this._controller._hasNextContent
}, _hasPrevious: function _hasPrevious() {
return this._controller._hasPrevContent
}, _onNextPageClick: function _onNextPageClick(event) {
this._controller.next();
this._isPrevNextClick = true;
var actionElement=utils.actionElement.nextFlipper;
var pointerType=this._touch ? utils.actionMethod.touch : utils.actionMethod.mouse;
utils.logUserAction(actionElement, pointerType)
}, _onPreviousPageClick: function _onPreviousPageClick(event) {
this._controller.previous();
this._isPrevNextClick = true;
var actionElement=utils.actionElement.previousFlipper;
var pointerType=this._touch ? utils.actionMethod.touch : utils.actionMethod.mouse;
utils.logUserAction(actionElement, pointerType)
}, _onScroll: function _onScroll(event) {
this._maybeUpdateButtons();
if (this._controller.currentPage !== this._currentPageIndex && !this._isPrevNextClick) {
var actionElement=null;
var pointerType=null;
if (this._touch) {
actionElement = utils.actionElement.swipe;
pointerType = utils.actionMethod.touch
}
else if (this._isWheelEvent) {
actionElement = utils.actionElement.scroll;
pointerType = utils.actionMethod.mouse;
this._isWheelEvent = false
}
if (actionElement && pointerType) {
utils.logUserAction(actionElement, pointerType)
}
}
this._isPrevNextClick = false;
this._currentPageIndex = this._controller.currentPage
}, _onWheel: function _onWheel(event) {
this._isWheelEvent = true
}
})})
})();
(function appexCommonControlsGenericSlideshowPageInit() {
"use strict";
WinJS.Namespace.define("CommonJS.Slideshow", {GenericSlideshowPage: WinJS.Class.define(function genericSlideshowPage_ctor(state) {
this._state = state;
this._impressionContext = state.impressionContext || "Slideshow"
}, {
_state: null, _control: null, _impressionContext: null, getPageState: function getPageState() {
var state=this._state;
var control=this._control;
if (control && control.currentPage >= 0) {
state.startPageIndex = control.currentPage
}
return state
}, getPageImpressionContext: function getPageImpressionContext() {
return this._impressionContext
}, getPageImpressionPartnerCodeAndAttributes: function getPageImpressionPartnerCodeAndAttributes() {
var state=this._state;
var results={partnerCode: state && state.instrumentationId};
return results
}, getPageData: function getPageData() {
return WinJS.Promise.wrap({})
}, onBindingComplete: function onBindingComplete() {
this._initialize()
}, _initialize: function _initialize() {
var state=this._state;
var elt=document.getElementById("ssView");
var options={
data: state.data, startIndex: state.startIndex, instrumentationEntryPoint: state.instrumentationEntryPoint, cacheId: state.cacheId
};
this._control = new CommonJS.Slideshow.SlideshowControl(elt, options)
}, dispose: function dispose() {
if (this._control && this._control.dispose) {
this._control.dispose()
}
}
})})
})()