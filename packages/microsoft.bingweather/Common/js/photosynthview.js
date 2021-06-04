/*  © Microsoft. All rights reserved. */
WinJS.Namespace.define('CommonJS', {Version: 'latest'});
(function _PhotosynthView_6() {
"use strict";
WinJS.Namespace.define("CommonJS", {PhotosynthView: WinJS.Class.define(function photosynthView_ctor(element, options) {
this.element = element || document.createElement("div");
this.element.winControl = this;
this._toggleVisibility = "visible";
this._pointerMoveData = {
x: 0, y: 0, state: 0
};
this.setOptions(options)
}, {
_panoCacheId: null, _title: null, _orientationSensor: null, _gyroInstance: null, _fragmentPath: null, _templateId: null, _doNotShowProgress: null, _attribution: null, _attributionDestination: null, _pageHeaderId: null, _hideDefaultAttribution: null, _toggleVisibility: null, _panoId: null, _viewer: null, _viewerDiv: null, _gyrometerToggle: null, _gyrometerToggleContainer: null, _renderPromise: null, _panoList: null, _panoButton: null, _attributionContentElement: null, _attributionButtonElement: null, _pointerMoveData: null, _className: null, _perftrackEndEventFired: false, _loggedWarnAboutTiles: false, panoId: {set: function set(value) {
if (typeof value === "undefined") {
return
}
this._panoId = value;
if (value) {
this.render()
}
}}, setClassName: function setClassName(className) {
if (className === this._className) {
return
}
var winJsUtils=WinJS.Utilities;
if (this._className) {
winJsUtils.removeClass(this.element, this._className)
}
if (className) {
winJsUtils.addClass(this.element, className)
}
this._className = className
}, setHeaderClassName: function setHeaderClassName(headerId) {
if (!headerId) {
return
}
var headerElement=document.getElementById(headerId);
if (headerElement) {
WinJS.Utilities.addClass(headerElement, "PhotosynthViewHeader")
}
}, setOptions: function setOptions(options) {
options = options || {};
this._gyroInstance = typeof options.gyroInstance !== "undefined" ? options.gyroInstance : this._gyroInstance || CommonJS.Gyrometer.getInstance(options.gyroOptions || {});
this._panoCacheId = typeof options.panoCacheId !== "undefined" ? options.panoCacheId : this._panoCacheId || CommonJS.PhotosynthView.DEFAULT_PANO_CACHE_ID;
this._title = typeof options.title !== "undefined" ? options.title : this._title || "";
this._orientationSensor = typeof options.orientationSensor !== "undefined" ? options.orientationSensor : this._orientationSensor || null;
this._fragmentPath = typeof options.fragmentPath !== "undefined" ? options.fragmentPath : this._fragmentPath || "/common/PhotosynthView/PhotosynthView.html";
this._templateId = typeof options.templateId !== "undefined" ? options.templateId : this._templateId || "photosynth-view-template";
this._doNotShowProgress = typeof options.doNotShowProgress !== "undefined" ? options.doNotShowProgress : this._doNotShowProgress || false;
this._attribution = typeof options.attribution !== "undefined" ? options.attribution : this._attribution || "";
this._attributionDestination = typeof options.attributionDestination !== "undefined" ? options.attributionDestination : this._attributionDestination || "";
this._pageHeaderId = typeof options.pageHeaderId !== "undefined" ? options.pageHeaderId : this._pageHeaderId || "";
this._hideDefaultAttribution = typeof options.hideDefaultAttribution !== "undefined" ? options.hideDefaultAttribution : this._hideDefaultAttribution || false;
this.setClassName(options.ClassName);
this.setHeaderClassName(this._pageHeaderId);
this.panoId = options.panoId
}, render: function render() {
PlatformJS.modernPerfTrack.writeStartEvent(PlatformJS.perfTrackScenario_Panorama360Loaded, "Panorama 360 Loaded", this._panoId);
var that=this;
var moduleInfo={
fragmentPath: this._fragmentPath, templateId: this._templateId
};
var data={title: this._title};
this._renderPromise = CommonJS.loadModule(moduleInfo, data, null, null, null).then(function postRender(newDiv) {
that.element.appendChild(newDiv);
var viewerDiv=newDiv.querySelector(".photosynth-view-div");
if (viewerDiv) {
that._viewerDiv = viewerDiv;
that._resizeEventHandlerBound = that._resizeEventHandler.bind(that);
CommonJS.WindowEventManager.addEventListener(CommonJS.WindowEventManager.Events.WINDOW_RESIZE, that._resizeEventHandlerBound);
that._keyUpHandlerBound = that._keyUpHandler.bind(that, that._toggleControlVisibility);
setTimeout(function addKeyDownHandler() {
viewerDiv.addEventListener("keyup", that._keyUpHandlerBound)
}, 1000);
that._pointerDownHandlerBound = that._pointerDownHandler.bind(that);
viewerDiv.addEventListener("MSPointerDown", that._pointerDownHandlerBound);
that._pointerMoveHandlerBound = that._pointerMoveHandler.bind(that);
viewerDiv.addEventListener("MSPointerMove", that._pointerMoveHandlerBound);
that._pointerUpHandlerBound = that._pointerUpHandler.bind(that, that._toggleControlVisibility);
viewerDiv.addEventListener("MSPointerUp", that._pointerUpHandlerBound)
}
if (that._panoId) {
that._createViewerFromJsonUri(that._panoId)
}
else {
var selector=document.getElementById("panoSelector");
if (selector) {
WinJS.Utilities.removeClass(selector, "hidden");
var panoList=document.getElementById("panoList");
if (panoList) {
that._panoListChangeHandlerBound = that._createViewerFromJsonUri.bind(that, panoList.value);
panoList.addEventListener("change", that._panoListChangeHandlerBound);
that._panoList = panoList
}
var panoButton=document.getElementById("panoButton");
var panoTextbox=document.getElementById("panoTextbox");
if (panoButton && panoTextbox) {
that._panoButtonClickHandlerBound = that._createViewerFromJsonUri.bind(that, panoTextbox.value);
panoButton.addEventListener("click", that._panoButtonClickHandlerBound);
that._panoButton = panoButton
}
}
}
});
return this._renderPromise
}, _firePerfTrackEndEvent: function _firePerfTrackEndEvent(result, downloadSuccessCount, downloadFailureCount) {
if (!this._perftrackEndEventFired) {
PlatformJS.modernPerfTrack.writeStopEventWithFlagsAndMetadata(PlatformJS.perfTrackScenario_Panorama360Loaded, "Panorama 360 Loaded", this._panoId, result, downloadSuccessCount, downloadFailureCount, 0, 0, this._panoId, "");
PlatformJS.Navigation.mainNavigator.notifyPageLoadComplete();
this._perftrackEndEventFired = true
}
}, _resizeEventHandler: function _resizeEventHandler(event) {
var viewerDiv=this._viewerDiv;
if (this._viewer && viewerDiv) {
this._viewer.setViewportSize(viewerDiv.offsetWidth, viewerDiv.offsetHeight)
}
}, _createViewerFromJsonUri: function _createViewerFromJsonUri(panoId) {
if (panoId !== "" && panoId.indexOf("http") === 0) {
this._showProgress(true);
PhotosynthRml.createFromJsonUri(panoId, this._rmlCallback.bind(this), this._panoCacheId)
}
}, _rmlCallback: function _rmlCallback(rml, error) {
var that=this;
if (!rml) {
var result=0;
this._showProgress(false);
if (error instanceof JsonDownloadFailedError) {
console.warn("json failed to download");
result = CommonJS.PhotosynthView.RESULT_JSON_DOWNLOAD_FAILED
}
else if (error instanceof JsonMalformedError) {
console.warn("json was malformed");
result = CommonJS.PhotosynthView.RESULT_JSON_MALFORMED
}
else {
console.warn("unknown error when attempting to download json");
result = CommonJS.PhotosynthView.RESULT_JSON_UNKNOWN
}
var errorType=Platform.Networking.NetworkManager.instance.isNetworkAvailable ? CommonJS.Error.STANDARD_ERROR : CommonJS.Error.NO_INTERNET;
if (errorType === CommonJS.Error.NO_INTERNET) {
result = CommonJS.PhotosynthView.RESULT_NO_INTERNET
}
this._firePerfTrackEndEvent(result, 0, 0);
CommonJS.Error.showError(errorType, function photosynthViewer_showRmlError(evt) {
that._createViewerFromJsonUri(that._panoId)
})
}
else {
this._createViewer(rml)
}
}, _createViewer: function _createViewer(rml) {
if (this._viewer) {
this._viewer.dispose();
this._viewer = null
}
var div=this._viewerDiv;
if (div) {
msWriteProfilerMark("CommonJS:PhotosynthViewFetch:s");
this._viewer = new RwwViewer(div, {
rml: rml, hideAttribution: this._hideDefaultAttribution, tileCacheId: this._panoCacheId, tileDownloadFailed: this._tileDownloadFailHandler.bind(this), tileDownloadSucceeded: this._tileDownloadSucceedHandler.bind(this), renderer: "css", orientationSensor: this._orientationSensor
});
this._renderButtons();
this._renderGyrometerToggle()
}
this.dispatchEvent("viewercreated", {winControl: this})
}, _toggleControlVisibility: function _toggleControlVisibility() {
var visibility=(this._toggleVisibility === "hidden") ? "visible" : "hidden";
this._toggleVisibility = visibility;
if (this._pageHeaderId) {
var header=document.getElementById(this._pageHeaderId);
if (header) {
header.style.visibility = visibility
}
}
if (this._gyroInstance) {
this._setGyroToggleContainerVisibility(visibility === "visible")
}
var viewerDiv=this._viewerDiv;
var attributionControlElement=document.querySelector(".panoramaAttributionControl");
if (attributionControlElement) {
attributionControlElement.style.visibility = visibility
}
if (this._attributionContentElement) {
this._attributionContentElement.style.visibility = visibility
}
if (this._attributionButtonElement) {
this._attributionButtonElement.winControl.currentState = (visibility === "visible") ? "on" : "off"
}
var ariaLabel=(visibility === "visible") ? PlatformJS.Services.resourceLoader.getString("/platform/PhotosynthControlsVisibleAriaLabel") : PlatformJS.Services.resourceLoader.getString("/platform/PhotosynthControlsHiddenAriaLabel");
viewerDiv.setAttribute("aria-label", ariaLabel)
}, _enableGyrometer: function _enableGyrometer(enable) {
CommonJS.Gyrometer.getInstance().gyrometerEnabled = enable;
var toggleButton=this._gyrometerToggle;
if (toggleButton) {
if (this._viewer) {
var cameraController=this._viewer.getActiveCameraController();
if (cameraController) {
var gyroAriaLabel=null;
if (enable) {
cameraController.setGyrometer(this._gyroInstance.gyro);
gyroAriaLabel = PlatformJS.Services.resourceLoader.getString("/platform/GyrometerOnAriaLabel");
WinJS.Utilities.removeClass(toggleButton, "gyrometer-toggle-off");
WinJS.Utilities.addClass(toggleButton, "gyrometer-toggle-on")
}
else {
cameraController.setGyrometer(null);
gyroAriaLabel = PlatformJS.Services.resourceLoader.getString("/platform/GyrometerOffAriaLabel");
WinJS.Utilities.removeClass(toggleButton, "gyrometer-toggle-on");
WinJS.Utilities.addClass(toggleButton, "gyrometer-toggle-off")
}
toggleButton.setAttribute("aria-label", gyroAriaLabel)
}
}
}
}, _keyUpHandler: function _keyUpHandler(func, event) {
if (event.keyCode === WinJS.Utilities.Key.enter) {
if (func) {
func.call(this, event)
}
}
}, _pointerUpHandler: function _pointerUpHandler(func, event) {
if (event.button === 0 && this._pointerMoveData.state === 1) {
if (func) {
func.call(this, event)
}
}
this._pointerMoveData.x = -1;
this._pointerMoveData.y = -1;
this._pointerMoveData.state = 0
}, _pointerMoveHandler: function _pointerMoveHandler(event) {
if (this._pointerMoveData.state === 1) {
if (this._pointerMoveData.x < 0) {
this._pointerMoveData.x = event.x;
this._pointerMoveData.y = event.y
}
else {
var dx=event.x - this._pointerMoveData.x;
var dy=event.y - this._pointerMoveData.y;
this._pointerMoveData.state = (dx || dy) ? 2 : 1
}
}
}, _pointerDownHandler: function _pointerDownHandler(event) {
this._pointerMoveData.x = -1;
this._pointerMoveData.y = -1;
this._pointerMoveData.state = 1
}, _renderGyrometerToggle: function _renderGyrometerToggle() {
var gyrometerToggleContainer=this.element.querySelector(".gyrometer-toggle-container");
this._gyrometerToggleContainer = gyrometerToggleContainer;
var gyrometerToggle=gyrometerToggleContainer.querySelector(".gyrometer-toggle");
this._gyrometerToggle = gyrometerToggle;
if (this._gyroInstance) {
this._setGyroToggleContainerVisibility(true);
this._gyroClickHandlerBound = this._gyroClickHandler.bind(this);
gyrometerToggle.addEventListener("click", this._gyroClickHandlerBound);
this._gyroKeyUpHandlerBound = this._gyroKeyUpHandler.bind(this);
gyrometerToggle.addEventListener("keyup", this._gyroKeyUpHandlerBound);
this._enableGyrometer(this._gyroInstance.gyrometerEnabled)
}
}, _gyroClickHandler: function _gyroClickHandler(event) {
if (this._viewer) {
this._enableGyrometer(!this._gyroInstance.gyrometerEnabled);
this._viewer.focusKeyboardElement()
}
}, _gyroKeyUpHandler: function _gyroKeyUpHandler(event) {
if (this._viewer && event.keyCode === WinJS.Utilities.Key.enter) {
this._enableGyrometer(!this._gyroInstance.gyrometerEnabled);
this._viewer.focusKeyboardElement()
}
}, _tileDownloadFailHandler: function _tileDownloadFailHandler(failCount, succeedCount) {
if (!Platform.Networking.NetworkManager.instance.isNetworkAvailable) {
this._showProgress(false);
this._firePerfTrackEndEvent(CommonJS.PhotosynthView.RESULT_NO_INTERNET, 0, 0);
CommonJS.Error.showError(CommonJS.Error.NO_INTERNET, function photosynthViewer_failDownloadNoInternet() {
WinJS.Navigation.back()
})
}
else {
var total=failCount + succeedCount;
if (total > CommonJS.PhotosynthView.DOWNLOAD_FAILURE_COUNT && failCount > succeedCount && !this._loggedWarnAboutTiles) {
console.warn("tile download failures are high");
this._loggedWarnAboutTiles = true;
this._showProgress(false);
this._firePerfTrackEndEvent(CommonJS.PhotosynthView.RESULT_DOWNLOAD_FAILURE_TOO_HIGH, succeedCount, failCount);
CommonJS.Error.showError(CommonJS.Error.STANDARD_ERROR, function photosynthViewer_failDownloadHighCount() {
WinJS.Navigation.back()
})
}
if (total > CommonJS.PhotosynthView.DOWNLOAD_SUCCESS_COUNT) {
this._showProgress(false);
this._firePerfTrackEndEvent(CommonJS.PhotosynthView.RESULT_SUCCESS, 0, 0);
msWriteProfilerMark("CommonJS:PhotosynthViewFetch:e")
}
}
}, _tileDownloadSucceedHandler: function _tileDownloadSucceedHandler(failCount, succeedCount) {
var total=failCount + succeedCount;
if (total > CommonJS.PhotosynthView.DOWNLOAD_SUCCESS_COUNT) {
this._showProgress(false);
this._firePerfTrackEndEvent(CommonJS.PhotosynthView.RESULT_SUCCESS, 0, 0);
msWriteProfilerMark("CommonJS:PhotosynthViewFetch:e")
}
}, _setGyroToggleContainerVisibility: function _setGyroToggleContainerVisibility(visible) {
var gyrometerToggleContainer=this._gyrometerToggleContainer;
if (gyrometerToggleContainer) {
gyrometerToggleContainer.style.display = visible ? "block" : "none"
}
}, _renderButtons: function _renderButtons() {
var buttonsContainer=this.element.querySelector(".buttons-container");
var attributionContentElement=this.element.querySelector(".attribution-content");
if (this._attribution) {
attributionContentElement.textContent = this._attribution;
this._attributionContentElement = attributionContentElement;
if (this._attributionDestination) {
this._attributionKeyUpHandlerBound = this._keyUpHandler.bind(this, this._navigateTo.bind(this, this._attributionDestination));
attributionContentElement.addEventListener("keyup", this._attributionKeyUpHandlerBound);
this._attributionPointerUpHandlerBound = this._navigateTo.bind(this, this._attributionDestination);
attributionContentElement.addEventListener("MSPointerUp", this._attributionPointerUpHandlerBound)
}
attributionContentElement.style.display = "block"
}
var attributionButton=new CommonJS.ImageAttribution(buttonsContainer, {});
var attributionButtonElement=buttonsContainer.querySelector(".platformInfoButton");
if (attributionButtonElement) {
attributionButtonElement.winControl.onclick = null;
attributionButtonElement.winControl.currentState = "on";
this._attributionBtnKeyUpHandlerBound = this._keyUpHandler.bind(this, this._toggleControlVisibility);
attributionButtonElement.addEventListener("keyup", this._attributionBtnKeyUpHandlerBound);
this._attributionBtnPointerUpHandlerBound = this._toggleControlVisibility.bind(this);
attributionButtonElement.addEventListener("MSPointerUp", this._attributionBtnPointerUpHandlerBound);
this._attributionButtonElement = attributionButtonElement
}
}, _showProgress: function _showProgress(show) {
if (!show) {
CommonJS.Progress.hideProgress(CommonJS.Progress.centerProgressType)
}
else if (!this._doNotShowProgress) {
CommonJS.Progress.showProgress(CommonJS.Progress.centerProgressType)
}
}, _navigateTo: function _navigateTo(destination) {
if (destination) {
var uri=new Windows.Foundation.Uri(destination);
Windows.System.Launcher.launchUriAsync(uri)
}
}, dispose: function dispose() {
if (this._viewer) {
this._viewer.dispose();
this._viewer = null
}
if (this._renderPromise) {
this._renderPromise.cancel();
this._renderPromise = null
}
if (this._resizeEventHandlerBound) {
CommonJS.WindowEventManager.removeEventListener(CommonJS.WindowEventManager.Events.WINDOW_RESIZE, this._resizeEventHandlerBound);
this._resizeEventHandlerBound = null
}
var viewerDiv=this._viewerDiv;
if (viewerDiv) {
if (this._keyUpHandlerBound) {
viewerDiv.removeEventListener("keyup", this._keyUpHandlerBound);
this._keyUpHandlerBound = null
}
if (this._pointerDownHandlerBound) {
viewerDiv.removeEventListener("MSPointerDown", this._pointerDownHandlerBound);
this._pointerDownHandlerBound = null
}
if (this._pointerMoveHandlerBound) {
viewerDiv.removeEventListener("MSPointerMove", this._pointerMoveHandlerBound);
this._pointerMoveHandlerBound = null
}
if (this._pointerUpHandlerBound) {
viewerDiv.removeEventListener("MSPointerUp", this._pointerUpHandlerBound);
this._pointerUpHandlerBound = null
}
this._viewerDiv = null
}
var gyrometerToggle=this._gyrometerToggle;
if (gyrometerToggle) {
if (this._gyroClickHandlerBound) {
gyrometerToggle.removeEventListener("click", this._gyroClickHandlerBound);
this._gyroClickHandlerBound = null
}
if (this._gyroKeyUpHandlerBound) {
gyrometerToggle.removeEventListener("keyup", this._gyroKeyUpHandlerBound);
this._gyroKeyUpHandlerBound = null
}
this._gyrometerToggle = null
}
var panoList=this._panoList;
if (panoList && this._panoListChangeHandlerBound) {
panoList.removeEventListener("change", this._panoListChangeHandlerBound);
this._panoListChangeHandlerBound = null;
this._panoList = null
}
var panoButton=this._panoButton;
if (panoButton && this._panoButtonClickHandlerBound) {
panoButton.removeEventListener("click", this._panoButtonClickHandlerBound);
this._panoButtonClickHandlerBound = null;
this._panoButton = null
}
var attributionContentElement=this._attributionContentElement;
if (attributionContentElement && this._attributionDestination) {
if (this._attributionKeyUpHandlerBound) {
attributionContentElement.removeEventListener("keyup", this._attributionKeyUpHandlerBound);
this._attributionKeyUpHandlerBound = null
}
if (this._attributionPointerUpHandlerBound) {
attributionContentElement.removeEventListener("MSPointerUp", this._attributionPointerUpHandlerBound);
this._attributionPointerUpHandlerBound = null
}
this._attributionContentElement = null
}
var attributionBtnElement=this._attributionButtonElement;
if (attributionBtnElement) {
if (this._attributionBtnPointerDownHandlerBound) {
attributionBtnElement.removeEventListener("MSPointerDown", this._attributionBtnPointerDownHandlerBound);
this._attributionBtnPointerDownHandlerBound = null
}
if (this._attributionBtnPointerMoveHandlerBound) {
attributionBtnElement.removeEventListener("MSPointerMove", this._attributionBtnPointerMoveHandlerBound);
this._attributionBtnPointerMoveHandlerBound = null
}
this._attributionButtonElement = null
}
}
}, {
DEFAULT_PANO_CACHE_ID: "JSPanoViewerCache", DOWNLOAD_SUCCESS_COUNT: 2, DOWNLOAD_FAILURE_COUNT: 4, RESULT_SUCCESS: 0, RESULT_NO_INTERNET: 1, RESULT_JSON_DOWNLOAD_FAILED: 2, RESULT_JSON_MALFORMED: 4, RESULT_JSON_UNKNOWN: 8, RESULT_DOWNLOAD_FAILURE_TOO_HIGH: 16
})});
WinJS.Class.mix(CommonJS.PhotosynthView, WinJS.Utilities.eventMixin)
})();
(function _Gyrometer_6() {
"use strict";
WinJS.Namespace.define("CommonJS", {Gyrometer: WinJS.Class.define(function gyrometer_ctor(options) {
this._gyro = null;
this.setOptions(options);
var gyrometer=Windows.Devices.Sensors.Gyrometer.getDefault();
if (gyrometer) {
var minimimReportInterval=gyrometer.minimumReportInterval;
var reportInterval=minimimReportInterval > this._reportIntervalMs ? minimimReportInterval : this._reportIntervalMs;
gyrometer.reportInterval = reportInterval;
this.gyrometerEnabled = true
}
this._gyro = gyrometer
}, {
_gyro: null, _reportIntervalMs: null, _localSettingName: null, setOptions: function setOptions(options) {
options = options || {};
this._reportIntervalMs = typeof options.reportIntervalMs !== "undefined" ? options.reportIntervalMs : this._reportIntervalMs || CommonJS.DEFAULT_REPORT_INTERVAL_MS;
this._localSettingName = typeof options.localSettingName !== "undefined" ? options.localSettingName : this._localSettingName || CommonJS.DEFAULT_LOCAL_SETTING_NAME;
this.gyro = options.gyro
}, gyro: {
get: function get() {
return this._gyro
}, set: function set(value) {
if (typeof value === "undefined") {
return
}
this._gyro = value
}
}, gyrometerEnabled: {
get: function get() {
var enabled=false;
if (!CommonJS.Gyrometer.isGyroFeatureEnabled || CommonJS.Gyrometer.isGyroFeatureEnabled()) {
enabled = Windows.Storage.ApplicationData.current.localSettings.values.lookup(this._localSettingName)
}
return enabled
}, set: function set(value) {
if (CommonJS.Gyrometer.isGyroFeatureEnabled && !CommonJS.Gyrometer.isGyroFeatureEnabled()) {
value = false
}
Windows.Storage.ApplicationData.current.localSettings.values.insert(this._localSettingName, value);
return value
}
}
}, {
getInstance: function getInstance(options) {
options = options || {};
var instance=CommonJS.Gyrometer._instance;
if (!instance) {
if (typeof options.isGyroFeatureEnabled === "function" || options.isGyroFeatureEnabled === null) {
CommonJS.Gyrometer.isGyroFeatureEnabled = options.isGyroFeatureEnabled
}
if (CommonJS.Gyrometer.isGyroFeatureEnabled && !CommonJS.Gyrometer.isGyroFeatureEnabled()) {
return null
}
instance = new CommonJS.Gyrometer(options);
CommonJS.Gyrometer._instance = instance
}
return instance.gyro ? instance : null
}, isGyroFeatureEnabled: function isGyroFeatureEnabled() {
var enabled=false;
if (!CommonJS.Gyrometer._gyroEnabled) {
enabled = PlatformJS.Services.appConfig.getBool("EnableGyrometer") === true;
CommonJS.Gyrometer._gyroEnabled = enabled ? "true" : "false"
}
else {
enabled = CommonJS.Gyrometer._gyroEnabled === "true"
}
return enabled
}, _gyroEnabled: "", _instance: null, DEFAULT_REPORT_INTERVAL_MS: 16, DEFAULT_LOCAL_SETTING_NAME: "enableGyrometer"
})})
})()