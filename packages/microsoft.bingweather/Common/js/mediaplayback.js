/*  © Microsoft. All rights reserved. */
WinJS.Namespace.define('CommonJS', {Version: 'latest'});
(function appexCommonControlsMediaPlaybackInit(WinJS) {
"use strict";
var Animation=WinJS.UI.Animation;
var Utilities=WinJS.Utilities;
var Promise=WinJS.Promise;
var EventNS=CommonJS.WindowEventManager;
var mouseLeftButton=0;
var mousePointerType=4;
var controlTemplateLocation="/Common/MediaPlayback/html/MediaPlayback.html";
var SMTC_PlaybackStatus=Windows.Media.MediaPlaybackStatus;
var SMTC_PlaybackStatus_Closed=SMTC_PlaybackStatus.closed;
var SMTC_PlaybackStatus_Playing=SMTC_PlaybackStatus.playing;
var SMTC_PlaybackStatus_Paused=SMTC_PlaybackStatus.paused;
var SMTC_PlaybackStatus_Stopped=SMTC_PlaybackStatus.stopped;
function checkValidProtocol(contentSrc) {
return (contentSrc && (contentSrc.indexOf("http://") >= 0 || contentSrc.indexOf("ms-appdata://") >= 0 || contentSrc.indexOf("ms-appx://") >= 0)) ? true : false
}
var MediaAppControls=WinJS.Namespace.define("CommonJS.MediaApp.Controls", {
PlaybackCapabilities: {
inlineOnly: "inlineOnly", fullScreenOnly: "fullScreenOnly", normal: "normal"
}, PlaybackMode: {
full: "full", partial: "partial", minimal: "minimal"
}, PlaybackType: {video: "video"}, ControlState: {
rest: "Rest", hover: "Hover", pressed: "Pressed"
}, Control: {
play: "Play", pause: "Pause", gripper: "Gripper"
}, VideoProgress: {
videoStart: "VideoStart", video25Percent: "Video25Percent", video50Percent: "Video50Percent", video75Percent: "Video75Percent", videoComplete: "VideoComplete"
}, MediaPlayback: WinJS.Class.define(function mediaPlayback_ctor(containerElement, options) {
if (!containerElement) {
throw new Error("container element cannot be null or undefined");
}
if (this === window || this === MediaAppControls) {
var playback=containerElement.winControl;
if (playback) {
return playback
}
else {
return new MediaAppControls.MediaPlayback(containerElement, options)
}
}
if (!containerElement.winControl) {
containerElement.winControl = this
}
this._currentMediaSrcId = null;
this._currentMediaSrcProvider = null;
this._containerElement = containerElement;
this._type = MediaAppControls.PlaybackType.video;
this._mode = MediaAppControls.PlaybackMode.partial;
this._logFunction = function(){};
this._windowEventManager = CommonJS.WindowEventManager.getInstance();
this._timeFormatDefault = CommonJS.resourceLoader.getString("/platform/timeIndicatorTextFormat");
this._captionOffLabel = CommonJS.resourceLoader.getString("/platform/offLabel");
if (options) {
if (options.type && MediaAppControls.PlaybackType[options.type]) {
this._type = options.type
}
if (options.mode && MediaAppControls.PlaybackMode[options.mode]) {
this._mode = options.mode
}
if (options.templateFragmentLocation) {
controlTemplateLocation = options.templateFragmentLocation
}
if (options.timeFormat) {
this._timeFormat = options.timeFormat
}
if (options.durationFormatter) {
this._durationFormatter = options.durationFormatter
}
if (options.logFunction) {
this._logFunction = options.logFunction
}
this._setupEtw(options.etwProvider);
if (options.playbackCapabilities && MediaAppControls.PlaybackCapabilities[options.playbackCapabilities]) {
this._playbackCapabilities = options.playbackCapabilities
}
else {
this._playbackCapabilities = MediaAppControls.PlaybackCapabilities.normal
}
if (options.width && options.height) {
this._containerElement.style.width = options.width;
this._containerElement.style.height = options.height
}
}
this._currentMediaElement = this._createVideoElement();
this._currentMediaElement.isVacant = true;
if (options && options.contentProtectionManager) {
this._setupContentProtectionMonitor(options.contentProtectionManager)
}
this._instrMgrInstance = Platform.Instrumentation.InstrumentationManager.instance;
this._nextVideoUIController = new CommonJS.MediaApp.Controls.NextVideoUIController;
this._eventListenerManager = new CommonJS.Utils.EventListenerManager("MediaPlayback_EventListenerManager");
this._mediaPlayback_onBlurBinding = this._mediaPlayback_onBlur.bind(this);
this._mediaPlayback_onKeyDownBinding = this._mediaPlayback_onKeyDown.bind(this);
this._mediaPlayback_onKeyUpBinding = this._mediaPlayback_onKeyUp.bind(this);
this._mediaPlayback_onFocusThumbBinding = this._mediaPlayback_onFocusThumb.bind(this);
this._mediaPlayback_onClickPlayButtonBinding = this._mediaPlayback_onClickPlayButton.bind(this);
this._mediaPlayback_onClickShareButtonBinding = this._mediaPlayback_onClickShareButton.bind(this);
this._mediaPlayback_onClickScreenSizeToggleButtonBinding = this._mediaPlayback_onClickScreenSizeToggleButton.bind(this);
this._mediaPlayback_onClickFullScreenButtonBinding = this._mediaPlayback_onClickFullScreenButton.bind(this);
this._mediaPlayback_onVisibilityChangeBinding = this._mediaPlayback_onVisibilityChange.bind(this);
this._mediaPlayback_beforeShowNavBinding = this._mediaPlayback_beforeShowNav.bind(this);
this._mediaPlayback_beforeHideNavBinding = this._mediaPlayback_beforeHideNav.bind(this);
this._mediaPlayback_onInputHandlerClickBinding = this._mediaPlayback_onInputHandlerClick.bind(this);
this._syncTimeAndProgressBinding = this._syncTimeAndProgress.bind(this);
this._onAdStartBinding = this._onAdStart.bind(this);
this._onAdCompleteBinding = this._onAdComplete.bind(this);
this._onAdErrorBinding = this._onAdError.bind(this);
this._onAdTimeOutFinishBinding = this._onAdTimeOutFinish.bind(this);
this._onCountdownUIShowBinding = this._onCountdownUIShow.bind(this);
this._onCountdownUIHideBinding = this._onCountdownUIHide.bind(this);
this._mediaPlayback_onMouseMoveBinding = this._mediaPlayback_onMouseMove.bind(this);
this._mediaPlayback_onEnterFullScreenBinding = this._mediaPlayback_onEnterFullScreen.bind(this);
this._mediaPlayback_onFullScreenEnteredBinding = this._mediaPlayback_onFullScreenEntered.bind(this);
this._mediaPlayback_onFullScreenExitBinding = this._mediaPlayback_onFullScreenExit.bind(this);
this._onInputHandlerPointerDownBinding = this._onInputHandlerPointerDown.bind(this);
this._onInputHandlerPointerMoveBinding = this._onInputHandlerPointerMove.bind(this);
this._onInputHandlerGestureEndBinding = this._onInputHandlerGestureEnd.bind(this);
this._onInputHandlerPointerUpBinding = this._onInputHandlerPointerUp.bind(this);
this._MTCUI_onButtonPressedBinding = this._MTCUI_onButtonPressed.bind(this);
this._onSamePageNavBinding = this._onSamePageNav.bind(this);
this._captionLanguageOnSelectBinding = this._captionLanguageOnSelect.bind(this);
this._captionButtonClickBinding = this._captionButtonClick.bind(this);
return null
}, {
_SS_ADAPTIVESOURCEMANAGER_GUID: "{A5CE1DE8-1D00-427B-ACEF-FB9A3C93DE2D}", _playbackCapabilities: null, _videoRequiresAds: false, _overridePosterImageUrl: null, _thumbSrc: null, _srcPath: null, _containerElement: null, _currentMediaElement: null, _inputHandlerElement: null, _controlsElement: null, _thumbElement: null, _playbackControlTable: null, _seekAndPlaybackControlTable: null, _seekAndPlaybackControlTableSpacerLeft: null, _seekAndPlaybackControlTableSpacerRight: null, _seekAndPlaybackControlTableSpacerMiddle: null, _playButton: null, _type: null, _mode: null, _controlHideTimeout: null, _controlsAutoHideDuration: 3000, _controlsAddedHideDuration: null, _thumbGrabThreshold: 30, _isControlsVisible: false, _isThumbUp: false, _oldThumbState: null, _onStopping: false, _timeFormat: null, _timeFormatDefault: null, _timeIndicator: null, _currentContentProtectionMonitor: null, _mediaControl: Windows.Media.MediaControl, _lastTimeDisplayAriaUpdate: Math.min(), _msnVideosFormatCodes: [1004, 103, 102, 101, 1002], _inFullScreenMode: false, _canScrubVideo: true, _instrumentationCallback: null, _instrMgrInstance: null, _isNewInstr: true, _instrIndex: -1, _currentVideoAdsInterval: 0, _adsConfig: null, _userPreferenceVideoScreenSize: "auto", _transportControl: null, _eventListenerManager: null, _controlEventHandlerIdList: [], _mediaPlayback_onBlurBinding: null, _mediaPlayback_onKeyDownBinding: null, _mediaPlayback_onKeyUpBinding: null, _mediaPlayback_onFocusThumbBinding: null, _mediaPlayback_onClickPlayButtonBinding: null, _mediaPlayback_onClickShareButtonBinding: null, _mediaPlayback_onClickScreenSizeToggleButtonBinding: null, _mediaPlayback_onClickFullScreenButtonBinding: null, _mediaPlayback_onVisibilityChangeBinding: null, _mediaPlayback_beforeShowNavBinding: null, _mediaPlayback_beforeHideNavBinding: null, _mediaPlayback_onInputHandlerClickBinding: null, _syncTimeAndProgressBinding: null, _onAdStartBinding: null, _onAdCompleteBinding: null, _onAdErrorBinding: null, _onAdTimeOutFinishBinding: null, _onCountdownUIShowBinding: null, _onCountdownUIHideBinding: null, _mediaPlayback_onMouseMoveBinding: null, _mediaPlayback_onEnterFullScreenBinding: null, _mediaPlayback_onFullScreenEnteredBinding: null, _mediaPlayback_onFullScreenExitBinding: null, _onInputHandlerPointerDownBinding: null, _onInputHandlerPointerMoveBinding: null, _onInputHandlerGestureEndBinding: null, _onInputHandlerPointerUpBinding: null, _MTCUI_onButtonPressedBinding: null, _onSamePageNavBinding: null, _captionLanguageOnSelectBinding: null, _captionButtonClickBinding: null, _captionAvailable: false, _captionButton: null, _captionLanguageDropDown: null, _captionFiles: null, _captionCulturesList: null, _defaultTrack: null, _captionLanguageDropdownVisible: false, _captionControlsElement: null, _captionOffLabel: null, _videoOptions: null, _nextVideoUIController: null, _errorLog: function _errorLog(msg) {
var src=this._currentMediaSrcId || "Src_Not_set";
var impression=PlatformJS.Navigation.mainNavigator.getCurrentImpression();
if (impression) {
if (this._isNewInstr) {
this._instrIndex = impression.addContent(this._currentMediaSrcProvider, null, this._currentMediaSrcId, "video", new Date(0), null, this._topBarTitle.innerText, false, null, false, null)
}
impression.logContentError(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, this._instrIndex, "", src + " " + msg, 0, "", null)
}
console.error("Video Control: " + src + " " + msg)
}, _instrLog: function _instrLog(percentage, isNew) {
var src="Src_Not_set";
if (this._currentMediaSrcId) {
src = this._currentMediaSrcId
}
var jsonStr="";
if (this._adsConfig) {
jsonStr = JSON.stringify({
adProvider: this._adsConfig.adProvider, adServer: this._adsConfig.adServer
})
}
var impression=PlatformJS.Navigation.mainNavigator.getCurrentImpression();
if (impression) {
var progress=new Microsoft.Bing.AppEx.Telemetry.ContentViewProgress;
progress.percent = percentage;
impression.logContentViewWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, this._instrIndex, Microsoft.Bing.AppEx.Telemetry.ContentViewMechanism.unknown, !isNew, progress, jsonStr)
}
console.log("Video Control: sending Appex Platform perf ping... :" + this._currentMediaSrcId + " percentage:" + percentage + " New_Instrumentation:" + isNew)
}, _instrVideoProgress: function _instrVideoProgress(progress) {
var percentage=-1;
var instrumentationParam=-1;
switch (progress) {
case CommonJS.MediaApp.Controls.VideoProgress.videoStart:
var impression=PlatformJS.Navigation.mainNavigator.getCurrentImpression();
if (impression && this._isNewInstr) {
this._instrIndex = impression.addContent(this._currentMediaSrcProvider, null, this._currentMediaSrcId, "video", new Date(0), null, this._topBarTitle.innerText, false, null, false, null)
}
percentage = 0;
instrumentationParam = 0;
break;
case CommonJS.MediaApp.Controls.VideoProgress.video25Percent:
percentage = 25;
instrumentationParam = 1;
break;
case CommonJS.MediaApp.Controls.VideoProgress.video50Percent:
percentage = 50;
instrumentationParam = 2;
break;
case CommonJS.MediaApp.Controls.VideoProgress.video75Percent:
percentage = 75;
instrumentationParam = 3;
break;
case CommonJS.MediaApp.Controls.VideoProgress.videoComplete:
percentage = 100;
instrumentationParam = 4;
break
}
if (percentage >= 0) {
this._instrLog(percentage, this._isNewInstr)
}
if (progress === CommonJS.MediaApp.Controls.VideoProgress.videoStart && this._isNewInstr) {
this._isNewInstr = false
}
if (instrumentationParam >= 0 && this._instrumentationCallback) {
this._instrumentationCallback(instrumentationParam, this._currentMediaSrcId)
}
}, _setupContentProtectionMonitor: function _setupContentProtectionMonitor(ContentProtectionManager) {
this._currentContentProtectionMonitor = new ContentProtectionManager.ContentProtectionMonitor;
this._currentContentProtectionMonitor.setMediaElement(this._currentMediaElement)
}, _assignContentVideo: function _assignContentVideo(contentVideoObject) {
var that=this;
this._currentMediaElement.src = contentVideoObject.SourceUrl;
this._currentMediaElement.isVacant = false;
if (contentVideoObject.PosterImageUrl) {
this._posterImage.src = contentVideoObject.PosterImageUrl
}
}, _disableScrubbing: function _disableScrubbing() {
this._canScrubVideo = false;
Utilities.addClass(this._thumbElement, "platformHide")
}, _enableScrubbing: function _enableScrubbing() {
this._canScrubVideo = true;
Utilities.removeClass(this._thumbElement, "platformHide")
}, _showContentVideoElement: function _showContentVideoElement() {
Utilities.removeClass(this._currentMediaElement, "platformHide");
this._setupMediaElement(this._currentMediaElement)
}, _assignSrcUrlFromContentId: function _assignSrcUrlFromContentId(catalogUrlPrefix, videoId, overridePosterImageUrl) {
var that=this;
var xhr=WinJS.xhr({url: catalogUrlPrefix + videoId});
return xhr.then(function mediaPlayback_xhrComplete(xmlHttpRequest) {
var msnVidsResponse=xmlHttpRequest.responseXML;
if (!msnVidsResponse) {
return Promise.wrap(null)
}
var currentMsnVideosFormatCode=null;
that._videoSrcList = [];
for (var i=0; i < that._msnVideosFormatCodes.length; i++) {
var videoNode=msnVidsResponse.querySelector("video > videoFiles > videoFile[formatCode='" + that._msnVideosFormatCodes[i] + "'] > uri");
if (videoNode) {
if (!currentMsnVideosFormatCode) {
currentMsnVideosFormatCode = that._msnVideosFormatCodes[i]
}
var sourceUrl=null;
if (videoNode.textContent) {
if (that._msnVideosFormatCodes[i] === 1004) {
sourceUrl = videoNode.textContent + "/manifest"
}
else {
sourceUrl = videoNode.textContent
}
that._videoSrcList.push(sourceUrl)
}
}
}
var enableVideoCaptions=PlatformJS.Services.configuration.getBool("EnableVideoCaptions");
if (enableVideoCaptions) {
var filesParent=msnVidsResponse.querySelector("video > files");
if (filesParent) {
var filesList=filesParent.childNodes;
if (filesList && filesList.length) {
for (var i=0, length=filesList.length; i < length; i++) {
var file=filesList[i];
var code=file.getAttribute("formatCode");
if (code.slice(0, 1) === "3") {
if (!that._captionFiles) {
that._captionFiles = {}
}
if (!that._captionCulturesList) {
that._captionCulturesList = []
}
var uriNode=file.querySelector("uri");
var market=file.getAttribute("culture");
var marketInfo=Platform.Globalization.MarketInfo.parse(market);
var marketDisplayName=PlatformJS.Utilities.Globalization.getLanguageFromMarket(market);
that._captionFiles[market] = {
market: market, displayName: marketDisplayName, uri: uriNode.textContent
};
that._captionCulturesList.push(market)
}
}
if (that._captionCulturesList && that._captionCulturesList.length) {
that._captionAvailable = true
}
}
}
}
console.log("Video Control: the avaliable video source list is: " + that._videoSrcList);
var geoFenceNode=msnVidsResponse.querySelector("video > tags > tag[namespace='Geofence']");
if (geoFenceNode && geoFenceNode.textContent) {
that._geoFence = geoFenceNode.textContent
}
else {
that._geoFence = ""
}
console.log("Video Control: current geofence string is " + that._geoFence);
console.log("Video Control: current format code is " + currentMsnVideosFormatCode);
if (that._userPreferenceVideoScreenSize === "auto") {
var hasHighResVideoFormat=false;
if (msnVidsResponse.querySelector("video > videoFiles > videoFile[formatCode='103'] > uri")) {
hasHighResVideoFormat = true;
console.log("Video Control: current video has a high resolution format, will play in fullscreen")
}
that._adjustVideoSizeToScreen(hasHighResVideoFormat)
}
else {
that._adjustVideoSizeToScreen(that._userPreferenceVideoScreenSize === "100%" ? true : false)
}
if (!that._videoSrcList || that._videoSrcList.length === 0) {
return Promise.wrap(null)
}
var posterNode=msnVidsResponse.querySelector("video > files > file[formatCode='2001'] >uri");
var pageGroupNode=msnVidsResponse.querySelector("video > pageGroup");
var MSNCatalogShowAd=pageGroupNode && !pageGroupNode.textContent.endsWith("NAX");
var providerIdNode=msnVidsResponse.querySelector("video > csId");
var partnerContentIdNode=msnVidsResponse.querySelector("video > providerId");
var sourceIdNode=msnVidsResponse.querySelector("video > source");
var providerId=providerIdNode ? providerIdNode.textContent : "";
var partnerContentId=partnerContentIdNode ? partnerContentIdNode.textContent : "";
var sourceId=sourceIdNode ? sourceIdNode.textContent : "";
var sourceFriendlyName=sourceIdNode && sourceIdNode.getAttribute ? sourceIdNode.getAttribute("friendlyName") : "";
var appEnableVideoAds=PlatformJS.Services.configuration.getBool("EnableVideoAds");
if (!appEnableVideoAds) {
console.warn("Video Control: App configuration disables video ads")
}
var adsConfig=null;
adsConfig = that._videoAdsController.getVideoAdsConfig(providerId, sourceFriendlyName, sourceId);
var controlShowVideoAds=false;
if (appEnableVideoAds && adsConfig && adsConfig.adStartFrequency >= 0 && adsConfig.adServer && adsConfig.appID && adsConfig.adUnitId) {
var videoAdsInterval=adsConfig.adRepeatFrequency;
var videoAdsPlayTimeAtInterval=adsConfig.adStartFrequency;
var currentVideoAdsInterval=that._currentVideoAdsInterval;
if (currentVideoAdsInterval === videoAdsPlayTimeAtInterval || (currentVideoAdsInterval > videoAdsPlayTimeAtInterval && (currentVideoAdsInterval - videoAdsPlayTimeAtInterval) % videoAdsInterval === 0)) {
controlShowVideoAds = true;
console.log("Video Control: Show video ad, currentVideoAdsInterval=" + currentVideoAdsInterval)
}
else {
console.log("Video Control: No video ad, currentVideoAdsInterval=" + currentVideoAdsInterval);
that._currentVideoAdsInterval = currentVideoAdsInterval + 1
}
}
else if (!adsConfig) {
console.warn("invalid adsConfig object, will skip video ad playing")
}
if (controlShowVideoAds && MSNCatalogShowAd && adsConfig && adsConfig.adUnitId && adsConfig.appID) {
that._videoRequiresAds = true
}
else {
that._videoRequiresAds = false
}
var videoContentObject={
ContentType: CommonJS.MediaApp.Controls.MediaContentType.VideoContent, PingHandler: new CommonJS.MediaApp.Controls.MsnVideosInstrumentationHandler(videoId, currentMsnVideosFormatCode, "http://appex.msn.com"), VideoUuid: videoId, CanScrubVideo: true, RequiresAds: that._videoRequiresAds, partnerContentId: partnerContentId, adsConfig: adsConfig ? adsConfig : null
};
if (that._videoSrcList && that._videoSrcList.length > 0) {
if (that._currentMediaElement) {
videoContentObject.SourceUrl = that._videoSrcList[0];
that._videoSrcListIndex = 0
}
}
else {
that._logFunction("MediaPlayback._createMockMsnVideoLibrary", "Failed while attempting to load content id {0}. Response was {1}".format(videoId, msnVidsResponse.xml));
videoContentObject = null
}
if (posterNode && !overridePosterImageUrl) {
if (that._posterImage && videoContentObject) {
videoContentObject.PosterImageUrl = posterNode.textContent
}
}
else if (overridePosterImageUrl) {
videoContentObject.PosterImageUrl = overridePosterImageUrl
}
if (videoContentObject) {
that._sequencer.AddContent(videoContentObject)
}
return Promise.wrap(videoContentObject)
}, function MediaPlayback_assignSrcUrlFromContentId_xhrError(error) {
Promise.wrap(null);
that._errorLog("MSNcatalog video fetching error: " + error.responseText + " URL: " + catalogUrlPrefix + videoId)
})
}, _resetCaption: function _resetCaption() {
this._captionFiles = null;
this._captionCulturesList = null;
this._removeCaptionTrack();
this._captionAvailable = false
}, _hideCaptionControls: function _hideCaptionControls() {
this._hideCaptionDropDown();
this._hideCaptionButton()
}, _enableCaptioning: function _enableCaptioning() {
if (this._captionAvailable) {
this._populateCaptionLanguageDropDown();
this._showCaptionButton()
}
}, _populateCaptionLanguageDropDown: function _populateCaptionLanguageDropDown() {
var option=null;
for (var i=0, length=this._captionCulturesList.length; i < length; i++) {
option = document.createElement("option");
this._captionLanguageDropDown.options.add(option);
option.innerHTML = this._captionFiles[this._captionCulturesList[i]].displayName || this._captionCulturesList[i];
option.value = this._captionCulturesList[i]
}
option = document.createElement("option");
this._captionLanguageDropDown.options.add(option);
option.innerHTML = this._captionOffLabel;
option.value = "off";
option.setAttribute("selected", "selected")
}, _showCaptionButton: function _showCaptionButton() {
Utilities.removeClass(this._captionButton, "platformHide")
}, _hideCaptionButton: function _hideCaptionButton() {
Utilities.addClass(this._captionButton, "platformHide")
}, _showCaptionDropDown: function _showCaptionDropDown() {
Utilities.removeClass(this._captionLanguageDropDown, "platformHide")
}, _hideCaptionDropDown: function _hideCaptionDropDown() {
Utilities.addClass(this._captionLanguageDropDown, "platformHide")
}, _setCaptionTrack: function _setCaptionTrack(caption) {
var trackElement=null;
if (caption && caption.uri && caption.market) {
trackElement = document.createElement("track");
trackElement.setAttribute("src", caption.uri);
trackElement.setAttribute("kind", "subtitles");
var lang=caption.market.slice(0, 2);
trackElement.setAttribute("srclang", lang);
trackElement.setAttribute("default", "default");
this._currentMediaElement.appendChild(trackElement)
}
return trackElement
}, _removeCaptionTrack: function _removeCaptionTrack() {
if (this._defaultTrack) {
this._currentMediaElement.removeChild(this._defaultTrack)
}
this._defaultTrack = null
}, _adjustVideoSizeToScreen: function _adjustVideoSizeToScreen(shouldFitToScreen) {
if (!shouldFitToScreen) {
console.log("Video Control: use 50% screen size");
this._currentMediaElement.visual.style.width = "50%";
this._currentMediaElement.visual.style.height = "50%";
this._mediaStrip.style.paddingTop = "25%";
this._mediaStrip.style.textAlign = "center";
Utilities.addClass(this._screenSizeToggleButton, "fullScreenSizeToggleButton");
Utilities.removeClass(this._screenSizeToggleButton, "halfScreenSizeToggleButton")
}
else {
this._currentMediaElement.visual.style.width = "100%";
this._currentMediaElement.visual.style.height = "100%";
this._mediaStrip.style.paddingTop = "";
this._mediaStrip.style.textAlign = "";
Utilities.addClass(this._screenSizeToggleButton, "halfScreenSizeToggleButton");
Utilities.removeClass(this._screenSizeToggleButton, "fullScreenSizeToggleButton")
}
}, _createVideoElement: function _createVideoElement() {
var videoElementContainer=document.createElement("div");
Utilities.setInnerHTMLUnsafe(videoElementContainer, "<video preload='auto' />");
var videoElement=videoElementContainer.firstChild.cloneNode(true);
Utilities.addClass(videoElement, "mediaPlaybackVideo");
videoElement.visual = videoElement;
videoElement._mediaEventSubscriptions = [];
videoElement._posterEventSubscriptions = [];
try {
videoElement.msAudioCategory = "ForegroundOnlyMedia"
}
catch(e) {}
return videoElement
}, _setupEtw: function _setupEtw(etwProvider) {
if (etwProvider) {
this._etw = etwProvider
}
else {
var defaultEtw={};
defaultEtw["mediaPlaybackSliderUpdateStart"] = function mediaPlayback_defaultMediaPlaybackSliderUpdateStart(){};
defaultEtw["mediaPlaybackSliderUpdateEnd"] = function mediaPlayback_defaultMediaPlaybackSliderUpdateEnd(){};
defaultEtw["mediaPlaybackSeekStart"] = function mediaPlayback_defaultMediaPlaybackSeekStart(){};
defaultEtw["mediaPlaybackSeekEnd"] = function mediaPlayback_defaultMediaPlaybackSeekEnd(){};
defaultEtw["mediaPlaybackPlayStart"] = function mediaPlayback_defaultMediaPlaybackPlayStart() {
msWriteProfilerMark("Common:MediaPlayback:mediaPlaybackPlayStart")
};
defaultEtw["mediaPlaybackPlayEnd"] = function mediaPlayback_defaultMediaPlaybackPlayEnd() {
msWriteProfilerMark("Common:MediaPlayback:mediaPlaybackPlayEnd")
};
defaultEtw["mediaPlaybackPauseStart"] = function mediaPlayback_defaultMediaPlaybackPauseStart() {
msWriteProfilerMark("Common:MediaPlayback:mediaPlaybackPauseStart")
};
defaultEtw["mediaPlaybackPauseEnd"] = function mediaPlayback_defaultMediaPlaybackPauseEnd() {
msWriteProfilerMark("Common:MediaPlayback:mediaPlaybackPauseEnd")
};
defaultEtw["mediaPlaybackShowControlsStart"] = function mediaPlayback_defaultMediaPlaybackShowControlsStart(){};
defaultEtw["mediaPlaybackShowControlsEnd"] = function mediaPlayback_defaultMediaPlaybackShowControlsEnd(){};
defaultEtw["mediaPlaybackHideControlsStart"] = function mediaPlayback_defaultMediaPlaybackHideControlsStart(){};
defaultEtw["mediaPlaybackHideControlsEnd"] = function mediaPlayback_defaultMediaPlaybackHideControlsEnd(){};
defaultEtw["mediaPlaybackSrcSet"] = function mediaPlayback_defaultMediaPlaybackSrcSet() {
msWriteProfilerMark("Common:MediaPlayback:mediaPlaybackSrcSet")
};
defaultEtw["mediaPlaybackMediaEnd"] = function mediaPlayback_defaultMediaPlaybackMediaEnd() {
msWriteProfilerMark("Common:MediaPlayback:mediaPlaybackMediaEnd")
};
this._etw = defaultEtw
}
}, _removeControlsTimer: function _removeControlsTimer() {
if (this._controlHideTimeout) {
clearTimeout(this._controlHideTimeout);
this._controlHideTimeout = null
}
}, _setControlsTimer: function _setControlsTimer() {
var that=this;
this._removeControlsTimer();
this._controlHideTimeout = setTimeout(function mediaPlayback_afterSetControlsTimer() {
if (that._lastPointerMoveTimeStamp && that._lastPointerMoveTimeStamp > that._lastControlsResetTimeStamp) {
var currentHideDuration=that._controlsAddedHideDuration || that._controlsAutoHideDuration;
that._controlsAddedHideDuration = that._controlsAutoHideDuration - (that._lastControlsResetTimeStamp + currentHideDuration - that._lastPointerMoveTimeStamp);
that._removeControlsTimer();
that._setControlsTimer();
that._controlsAddedHideDuration = null
}
else {
that._hideControls()
}
}, this._controlsAddedHideDuration || this._controlsAutoHideDuration);
this._lastControlsResetTimeStamp = Date.now()
}, _hideControls: function _hideControls(isInternal) {
var that=this;
this._etw.mediaPlaybackHideControlsStart();
this._removeControlsTimer();
if (!Utilities.hasClass(this._topBar, "platformHide") && Utilities.hasClass(this._errorScreen, "platformHide")) {
if (!(this._videoAdsController.isAdPlaying() && this._videoRequiresAds)) {
Animation.fadeOut(this._fullScreenToggleButton)
}
Animation.fadeOut(this._topBar).done(function topBarFadeOutComplete() {
Utilities.addClass(that._topBar, "platformHide");
that._topBarShowed = false
})
}
Animation.fadeOut([this._controlsElement, this._captionControlsElement]).then(function mediaPlayback_fadeOutComplete() {
that._isControlsVisible = false;
Utilities.addClass(that._controlsElement, "hiddenObject");
Utilities.addClass(that._captionControlsElement, "hiddenObject")
});
this._lastPointerPosition = null;
this._etw.mediaPlaybackHideControlsEnd()
}, _showControls: function _showControls(forceShow, skipAutoHide) {
if (!this._inFullScreenMode && this._videoAdsController.isAdPlaying() && this._videoRequiresAds) {
return
}
if (this._isControlsVisible && !forceShow) {
return
}
this._removeControlsTimer();
if (Utilities.hasClass(this._topBar, "platformHide")) {
var that=this;
Utilities.removeClass(that._topBar, "platformHide");
Animation.fadeIn(this._fullScreenToggleButton);
Animation.fadeIn(this._topBar).done(function showTopBarComplete() {
that._topBarShowed = true
})
}
if (!skipAutoHide) {
this._setControlsTimer()
}
if (!WinJS.Utilities.hasClass(this._waitingSpinnerContainer, "platformHide")) {
return
}
if (this._videoRequiresAds && this._videoAdsController.isAdPlaying()) {
return
}
if (!Utilities.hasClass(this._errorScreen, "platformHide")) {
return
}
this._etw.mediaPlaybackShowControlsStart();
Utilities.removeClass(this._controlsElement, "hiddenObject");
Utilities.removeClass(this._captionControlsElement, "hiddenObject");
if (this._isThumbUp) {
this._rotateThumbDown()
}
this._isControlsVisible = true;
this._controlsElement.style.opacity = 1;
this._captionControlsElement.style.opacity = 1;
this._etw.mediaPlaybackShowControlsEnd()
}, _isSeekBarVisible: {get: function get() {
if (this._canScrubVideo) {
if (this._thumbElement.currentStyle) {
return this._thumbElement.currentStyle.opacity !== "0"
}
else {
return false
}
}
else {
if (this._seekBar.currentStyle) {
return this._seekBar.currentStyle.opacity !== "0"
}
else {
return false
}
}
}}, _removeSeekBarTimer: function _removeSeekBarTimer() {
if (this._seekBarHideTimeout) {
clearTimeout(this._seekBarHideTimeout);
this._seekBarHideTimeout = null
}
}, _setSeekBarTimer: function _setSeekBarTimer() {
var that=this;
this._removeSeekBarTimer();
this._seekBarHideTimeout = setTimeout(function mediaPlayback_afterSeekBarHideTimeout() {
if (that._lastPointerMoveTimeStamp && that._lastPointerMoveTimeStamp > that._lastSeekBarResetTimeStamp) {
var currentHideDuration=that._seekBarAddedHideDuration || that._controlsAutoHideDuration;
that._seekBarAddedHideDuration = that._controlsAutoHideDuration - (that._lastSeekBarResetTimeStamp + currentHideDuration - that._lastPointerMoveTimeStamp);
that._removeSeekBarTimer();
that._setSeekBarTimer();
that._seekBarAddedHideDuration = null
}
else {
that._hideSeekBar()
}
}, this._seekBarAddedHideDuration || this._controlsAutoHideDuration);
this._lastSeekBarResetTimeStamp = Date.now()
}, _hideSeekBar: function _hideSeekBar() {
var that=this;
if (this._isSeekBarVisible) {
this._removeSeekBarTimer();
Animation.fadeOut(this._thumbElement);
var promise=Animation.fadeOut(this._seekBar);
promise.then(function mediaPlayback_fadeOutSeekBarComplete() {
that._rotateThumbDown()
});
Animation.fadeOut(this._timeIndicator);
Animation.fadeOut(this._currentTimeIndicator);
Animation.fadeOut(this._totalTimeIndicator);
this._backdrop.style.opacity = 0
}
}, _showSeekBar: function _showSeekBar(forceShow, skipAutoHide) {
if (this._videoRequiresAds && this._videoAdsController.isAdPlaying()) {
return
}
if (this._isSeekBarVisible && !forceShow) {
return
}
if (!WinJS.Utilities.hasClass(this._errorScreen, "platformHide")) {
return
}
if (!WinJS.Utilities.hasClass(this._waitingSpinnerContainer, "platformHide")) {
return
}
if (this._seekBarHideTimeout) {
this._removeSeekBarTimer()
}
if (!this._isSeekBarVisible) {
this._syncTimeAndProgress(true);
if (this._canScrubVideo) {
Animation.fadeIn(this._thumbElement)
}
Animation.fadeIn(this._seekBar);
Animation.fadeIn(this._timeIndicator);
Animation.fadeIn(this._currentTimeIndicator);
Animation.fadeIn(this._totalTimeIndicator);
this._backdrop.style.opacity = 1
}
if (!skipAutoHide) {
this._setSeekBarTimer()
}
}, _getRelativeOffsetX: function _getRelativeOffsetX(parentElement, element) {
var offSetX=0;
while (element && parentElement !== element) {
offSetX += element.offsetLeft;
element = element.offsetParent
}
return offSetX
}, _removeControlEventHandlers: function _removeControlEventHandlers() {
if (this._controlEventHandlerIdList && this._controlEventHandlerIdList.length) {
var that=this;
this._controlEventHandlerIdList.forEach(function MediaPlayback_removeControlEventHandler_forEach(eventListenerId) {
that._eventListenerManager.remove(eventListenerId)
});
that._controlEventHandlerIdList.splice(0, that._controlEventHandlerIdList.length)
}
}, _init: function _init() {
console.log("Video Control: entered init");
this._removeControlEventHandlers();
this._thumbSrc = Utilities.query("#mediaPlaybackGripperHarvest", this._containerElement)[0].src;
this._srcPath = this._thumbSrc.substring(0, this._thumbSrc.lastIndexOf("/"));
this._contentElement = Utilities.query("#mediaPlaybackContent", this._containerElement)[0];
this._controlsElement = Utilities.query("#mediaPlaybackControls", this._containerElement)[0];
this._controlsLayerElement = Utilities.query("#mediaPlaybackControlsLayer", this._containerElement)[0];
this._thumbElement = Utilities.query("#mediaPlaybackSeekBarThumb", this._containerElement)[0];
this._thumbElementToolTip = Utilities.query("#mediaPlaybackSeekBarThumbToolTip", this._containerElement)[0].firstChild;
this._seekBar = Utilities.query("#mediaPlaybackSeekBar", this._containerElement)[0];
this._seekBarRail = Utilities.query("#mediaPlaybackSeekBarRail", this._containerElement)[0];
this._progress = Utilities.query("#mediaPlaybackSeekBarProgress", this._containerElement)[0];
this._playbackControlTable = Utilities.query("#playbackControlTable", this._containerElement)[0];
this._seekAndPlaybackControlTable = Utilities.query("#seekAndPlaybackControlTable", this._containerElement)[0];
this._seekAndPlaybackControlTableSpacerLeft = Utilities.query("#seekAndPlaybackControlTableSpacerLeft", this._containerElement)[0];
this._seekAndPlaybackControlTableSpacerRight = Utilities.query("#seekAndPlaybackControlTableSpacerRight", this._containerElement)[0];
this._seekAndPlaybackControlTableSpacerMiddle = Utilities.query("#seekAndPlaybackControlTableSpacerMiddle", this._containerElement)[0];
this._playButton = Utilities.query("#mediaPlaybackPlayButton", this._containerElement)[0];
this._shareVideoButton = Utilities.query("#shareVideoButton", this._containerElement)[0];
this._screenSizeToggleButton = Utilities.query("#screenSizeToggleButton", this._containerElement)[0];
this._inputHandlerElement = Utilities.query("#mediaPlaybackInputHandler", this._containerElement)[0];
this._onPlayingEventFired = false;
this._timeIndicator = Utilities.query("#mediaPlaybackTimeIndicator", this._containerElement)[0];
this._currentTimeIndicator = Utilities.query("#mediaPlaybackCurrentTimeIndicator", this._containerElement)[0];
this._totalTimeIndicator = Utilities.query("#mediaPlaybackTotalTimeIndicator", this._containerElement)[0];
this._fullScreenToggleButton = Utilities.query("#mediaPlaybackFullScreenToggleButton", this._containerElement)[0];
this._fullScreenControl = CommonJS.FullScreen;
this._navigationControl = WinJS.Navigation;
this._posterImageElement = Utilities.query("#mediaPlaybackPosterImageContainer", this._containerElement)[0];
this._posterImage = Utilities.query("#mediaPlaybackPosterImage", this._containerElement)[0];
this._loadingScreen = Utilities.query("#mediaPlaybackPosterImagePlaceholder", this._containerElement)[0];
this._waitingSpinnerContainer = Utilities.query("#mediaPlaybackSpinnerContainer", this._containerElement)[0];
this._waitingSpinnerVisible = false;
this._message = Utilities.query("#mediaPlaybackMessage", this._containerElement)[0];
this._errorScreen = Utilities.query("#mediaPlaybackErrorScreen", this._containerElement)[0];
this._topBar = Utilities.query("#mediaPlaybackTopBar", this._containerElement)[0];
this._topBarCurrentTime = Utilities.query("#topBarCurrentTime", this._containerElement)[0];
this._topBarTotalTime = Utilities.query("#topBarTotalTime", this._containerElement)[0];
this._topBarTitle = Utilities.query("#topBarTitle", this._containerElement)[0];
this._topBarAttribution = Utilities.query("#topBarAttribution", this._containerElement)[0];
this._topBarLogo = Utilities.query("#topBarLogo", this._containerElement)[0];
this._captionControlsElement = Utilities.query("#captionControls", this._containerElement)[0];
this._captionButton = Utilities.query("#captionButton", this._containerElement)[0];
this._captionLanguageDropDown = Utilities.query("#captionLanguageDropDown", this._containerElement)[0];
var videoAdsElement=Utilities.query("#mediaPlaybackVideoAd", this._containerElement)[0];
this._videoAdsController = new CommonJS.MediaApp.Controls.VideoAdsController(videoAdsElement);
this._geoFence = "";
this._disableVideoForGeoFence = false;
this._currentMediaSrcProvider = null;
this._resetVidSrc = "/Common/MediaPlayback/Resources/black.mp4";
this._adsConfig = null;
this._isNewInstr = true;
this._instrIndex = -1;
if (!this._posterImageElement) {
console.log("Video Control: _init():: PosterImageElement not found. Cannot initialize the video control. Throwing...");
throw"Unable to initialize video playback.";
}
if ((this._playbackCapabilities !== MediaAppControls.PlaybackCapabilities.inlineOnly) && (this._fullScreenControl)) {
this._fullScreenToggleButton.style.display = "inline-block"
}
this._backdrop = Utilities.query("#mediaPlaybackControlsBackdrop", this._containerElement)[0];
this._sequencer = new CommonJS.MediaApp.Controls.MediaSequencer(this);
this._mediaStrip = Utilities.query("#mediaPlaybackMediaStrip", this._containerElement)[0];
this._setupMediaElement(this._currentMediaElement);
this._mediaStrip.appendChild(this._currentMediaElement.visual);
this._setupMediaStrip();
this._updateControls();
this._showPlayButton();
this._hideShareButton();
var that=this;
this._transportControl = Windows.Media.SystemMediaTransportControls.getForCurrentView();
this._transportControl.onbuttonpressed = this._MTCUI_onButtonPressedBinding;
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._playButton, "blur", this._mediaPlayback_onBlurBinding, "playButton_blur", true));
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._fullScreenToggleButton, "blur", this._mediaPlayback_onBlurBinding, "fullscreenTaggleButton_blur", true));
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._thumbElement, "focus", this._mediaPlayback_onFocusThumbBinding, "thumbElement_focus", true));
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._thumbElement, "blur", this._mediaPlayback_onBlurBinding, "thumbElement_blur", true));
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._playButton, "keydown", this._mediaPlayback_onKeyDownBinding, "playButton_keydown", true));
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._playButton, "keyup", this._mediaPlayback_onKeyUpBinding, "playButton_keyup", true));
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._fullScreenToggleButton, "keydown", this._mediaPlayback_onKeyDownBinding, "fullScreenToggleButton_keydown", true));
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._fullScreenToggleButton, "keyup", this._mediaPlayback_onKeyUpBinding, "fullScreenToggleButton_keyup", true));
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._thumbElement, "keydown", this._mediaPlayback_onKeyDownBinding, "thumbElement_keydown", true));
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._thumbElement, "keyup", this._mediaPlayback_onKeyUpBinding, "thumbElement_keyup", true));
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._playButton, "click", this._mediaPlayback_onClickPlayButtonBinding, "playbutton_click", true));
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._shareVideoButton, "click", this._mediaPlayback_onClickShareButtonBinding, "sharebutton_click", true));
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._screenSizeToggleButton, "click", this._mediaPlayback_onClickScreenSizeToggleButtonBinding, "screenSizeToggleButton_click", true));
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._screenSizeToggleButton, "keydown", this._mediaPlayback_onKeyDownBinding, "screenSizeToggleButton_keydown", true));
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._screenSizeToggleButton, "keyup", this._mediaPlayback_onKeyUpBinding, "screenSizeToggleButton_keyup", true));
if (document) {
this._controlEventHandlerIdList.push(this._eventListenerManager.add(document, "msvisibilitychange", this._mediaPlayback_onVisibilityChangeBinding, "document_msvisibilitychange", true))
}
var navControl=document.getElementById("platformNavigationBar").winControl;
if (navControl) {
this._controlEventHandlerIdList.push(this._eventListenerManager.add(navControl, "beforeshow", this._mediaPlayback_beforeShowNavBinding, "navControl_beforeshow", true));
this._controlEventHandlerIdList.push(this._eventListenerManager.add(navControl, "beforehide", this._mediaPlayback_beforeHideNavBinding, "navControl_beforehide", true))
}
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._fullScreenToggleButton, "click", this._mediaPlayback_onClickFullScreenButtonBinding, "fullscreenToggleButton_click", true));
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._inputHandlerElement, "click", this._mediaPlayback_onInputHandlerClickBinding, "inputHandlerElement_click", true));
var events=EventNS.Events;
if (this._windowEventManager) {
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._windowEventManager, "samePageNav", this._onSamePageNavBinding, "windowEventManager_samePageNav", true));
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._windowEventManager, "window_resize", this._syncTimeAndProgressBinding, "windowEventManager_window_resize", true));
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._windowEventManager, events.VIDEOAD_START, this._onAdStartBinding, "windowEventManager_videoad_start", true));
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._windowEventManager, events.VIDEOAD_COMPLETE, this._onAdCompleteBinding, "windowEventManager_videoad_complete", true));
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._windowEventManager, events.VIDEOAD_ERROR, this._onAdErrorBinding, "windowEventManager_videoad_error", true));
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._windowEventManager, events.VIDEOAD_TIMEOUT_FINISH, this._onAdTimeOutFinishBinding, "windowEventManager_videoad_timeout_finish", true));
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._windowEventManager, events.VIDEO_COUNTDOWNUI_SHOW, this._onCountdownUIShowBinding, "windowEventManager_video_countdownui_show", true));
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._windowEventManager, events.VIDEO_COUNTDOWNUI_HIDE, this._onCountdownUIHideBinding, "windowEventManager_video_countdownui_hide", true))
}
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._navigationControl, "navigating", this._onSamePageNavBinding, "navControl_navigating", true));
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._controlsElement, "mousemove", this._mediaPlayback_onMouseMoveBinding, "controlsElement_mousemove", true, true));
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._thumbElement, "resize", this._syncTimeAndProgressBinding, "thumbElement_resize", true));
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._fullScreenControl, "EnterFullScreen", this._mediaPlayback_onEnterFullScreenBinding, "fullscreencontrol_enterfullscreen", true));
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._fullScreenControl, "FullScreenEntered", this._mediaPlayback_onFullScreenEnteredBinding, "fullscreencontrol_fullscreenentered", true));
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._fullScreenControl, "FullScreenExit", this._mediaPlayback_onFullScreenExitBinding, "fullscreencontrol_fullscreenexit", true));
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._captionLanguageDropDown, "change", this._captionLanguageOnSelectBinding, "captionlanguagedropdown_onselect", true));
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._captionButton, "click", this._captionButtonClickBinding, "captionbutton_select", true));
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._captionButton, "blur", this._mediaPlayback_onBlurBinding, "captionbutton_blur", true));
this._startOffsetX = 0;
this._lastGranularity = 1;
this._hasBeenInitialized = true;
this._isPointerDown = false;
if (this._nextVideoUIController) {
this._nextVideoUIController.shouldContinueNextVideo = this._nextVideoUIController.shouldContinueNextVideo && window.navigator.onLine;
if (this._nextVideoUIController.shouldContinueNextVideo) {
this._nextVideoUIController.init(this._containerElement)
}
}
PlatformJS.mainProcessManager.afterFirstView();
this._setUpSSPlugin();
console.log("Video Control: leaving init")
}, _mediaPlayback_onBlur: function _mediaPlayback_onBlur(event) {
this.resetAutoHideTimers(true)
}, _mediaPlayback_onKeyDown: function _mediaPlayback_onKeyDown(event) {
this._stopEventPropagation(event);
this._onInputHandlerKeyDown(event)
}, _mediaPlayback_onKeyUp: function _mediaPlayback_onKeyUp(event) {
this._stopEventPropagation(event);
this._onInputHandlerKeyUp(event)
}, _mediaPlayback_onFocusThumb: function _mediaPlayback_onFocusThumb(event) {
this._showControls(true, false);
this._showSeekBar(true, false)
}, _mediaPlayback_onClickPlayButton: function _mediaPlayback_onClickPlayButton(event) {
if (event.offsetX < 0 || event.offsetY < 0) {
return
}
this.resetAutoHideControlsTimer();
this._onPlayPauseToggleCommand();
this._stopEventPropagation(event);
this._thumbElement.focus()
}, _mediaPlayback_onClickShareButton: function _mediaPlayback_onClickShareButton(event) {
Windows.ApplicationModel.DataTransfer.DataTransferManager.showShareUI()
}, _mediaPlayback_onClickScreenSizeToggleButton: function _mediaPlayback_onClickScreenSizeToggleButton(event) {
this._toggleScreenSize(event);
this._thumbElement.focus()
}, _mediaPlayback_onClickFullScreenButton: function _mediaPlayback_onClickFullScreenButton(event) {
this.resetAutoHideControlsTimer();
this._toggleFullScreen();
this._stopEventPropagation(event);
this._thumbElement.focus()
}, _mediaPlayback_onVisibilityChange: function _mediaPlayback_onVisibilityChange(event) {
if (document) {
var isHidden=document.msHidden;
if (isHidden) {
if (this._sequencer && (!this._sequencer.IsPaused())) {
this._resumePlay = true;
this.pause();
console.log("Video Control: pause video on suspending")
}
}
else if (this._resumePlay) {
this._resumePlay = false;
this.play();
console.log("Video Control: play video on resuming")
}
}
}, _mediaPlayback_beforeShowNav: function _mediaPlayback_beforeShowNav() {
if (this._sequencer && (!this._sequencer.IsPaused())) {
this._resumePlay = true;
this.pause();
console.log("Video Control: pause video on Appbar show")
}
}, _mediaPlayback_beforeHideNav: function _mediaPlayback_beforeHideNav() {
if (this._resumePlay && (!document.msHidden)) {
this._resumePlay = false;
this.play();
console.log("Video Control: play video on Appbar hide")
}
}, _mediaPlayback_onInputHandlerClick: function _mediaPlayback_onInputHandlerClick(event) {
var that=this;
if (that._message && that._message.innerText && that._message.innerText !== "") {
that._message.innerText = "";
that.load().then(function reloadComplete(event) {
if (checkValidProtocol(that._currentMediaSrcId)) {
that.src = that._currentMediaSrcId
}
else {
return that.loadContentId(that._currentMediaSrcId)
}
}).done(function reloadPlayerPlayVideo() {
that._resetControlsElementState();
that.play()
})
}
}, _mediaPlayback_onMouseMove: function _mediaPlayback_onMouseMove(event) {
this._onControlsElementMouseMove();
this._stopEventPropagation(event)
}, _mediaPlayback_onEnterFullScreen: function _mediaPlayback_onEnterFullScreen(event) {
this._sequencer._onEnterFullScreen(event)
}, _mediaPlayback_onFullScreenEntered: function _mediaPlayback_onFullScreenEntered(event) {
this._sequencer._onFullScreenEntered(event)
}, _mediaPlayback_onFullScreenExit: function _mediaPlayback_onFullScreenExit(event) {
this._sequencer._onExitedFullScreen(event)
}, _MTCUI_onButtonPressed: function _MTCUI_onButtonPressed(evt) {
this._onPlayPauseToggleCommand()
}, _captionLanguageOnSelect: function _captionLanguageOnSelect(event) {
var selectedValue=this._captionLanguageDropDown.options[this._captionLanguageDropDown.selectedIndex].value;
if (selectedValue === "off") {
this._removeCaptionTrack()
}
else {
var captionFile=this._captionFiles[selectedValue];
if (captionFile) {
if (this._defaultTrack) {
this._removeCaptionTrack()
}
this._defaultTrack = this._setCaptionTrack(captionFile)
}
}
this._hideCaptionDropDown();
this._captionLanguageDropdownVisible = false
}, _captionButtonClick: function _captionButtonClick(event) {
if (this._captionLanguageDropdownVisible) {
this._hideCaptionDropDown();
this._captionLanguageDropdownVisible = false
}
else {
this._showCaptionDropDown();
this._captionLanguageDropdownVisible = true
}
}, _setUpSSPlugin: function _setUpSSPlugin() {
if (!CommonJS.MediaApp.Controls.ssPlugin) {
console.warn("Video Control: creating new SmoothStreaming object, only expect to see this once");
try {
var ssPlugin=new Windows.Media.MediaExtensionManager;
var mgr=Microsoft.Media.AdaptiveStreaming.AdaptiveSourceManager.getDefault();
var property=new Windows.Foundation.Collections.PropertySet;
mgr.addEventListener("manifestreadyevent", this._onManifestReady.bind(this), false);
property[this._SS_ADAPTIVESOURCEMANAGER_GUID] = mgr;
ssPlugin.registerByteStreamHandler("Microsoft.Media.AdaptiveStreaming.SmoothByteStreamHandler", ".ism", "text/xml", property);
ssPlugin.registerByteStreamHandler("Microsoft.Media.AdaptiveStreaming.SmoothByteStreamHandler", ".ism", "application/vnd.ms-ss", property);
CommonJS.MediaApp.Controls.ssPlugin = ssPlugin
}
catch(error) {
throw new Error("media player not avaiable");
}
}
}, _onManifestReady: function _onManifestReady(e) {
console.log("Video Control: in Smooth Streaming Manifestreadyevent");
try {
var manifest=e.adaptiveSource.manifest;
var availableStreams=manifest.availableStreams;
for (var i=0; i < availableStreams.length; i++) {
var stream=availableStreams[i];
var tracks=stream.availableTracks;
var currentSelectedTracks=[];
var k=0;
var networkStatus=Platform.Networking.NetworkManager.instance.networkCostSuggestion;
if (stream.type === Microsoft.Media.AdaptiveStreaming.MediaStreamType.video) {
if (Platform.Networking.NetworkCostSuggestion.standard === networkStatus) {
var highestResIndex=0;
var secondaryResIndex=-1;
var currentMaxWidth=0;
for (k = 0; k < tracks.length; k++) {
if (tracks[k].maxWidth > currentMaxWidth) {
currentMaxWidth = tracks[k].maxWidth;
secondaryResIndex = highestResIndex;
highestResIndex = k
}
}
if (secondaryResIndex !== -1 && secondaryResIndex !== highestResIndex) {
currentSelectedTracks.push(tracks[secondaryResIndex])
}
currentSelectedTracks.push(tracks[highestResIndex]);
stream.selectTracks(currentSelectedTracks)
}
else {
var currentMinWidth=Number.MAX_VALUE;
var minIndex=0;
for (k = 0; k < tracks.length; k++) {
if (tracks[k].maxWidth < currentMinWidth) {
currentMinWidth = tracks[k].maxWidth;
minIndex = k
}
}
for (k = 0; k < tracks.length; k++) {
if (k !== minIndex) {
currentSelectedTracks.push(tracks[k])
}
}
if (currentSelectedTracks.length > 0) {
stream.selectTracks(currentSelectedTracks)
}
}
}
}
}
catch(error) {
console.warn("Video Control: onManifestReadey(): " + error.message.toString())
}
}, _resetControlsElementState: function _resetControlsElementState() {
if (this._controlHideTimeout) {
this._removeControlsTimer();
this._isControlsVisible = false
}
}, _onSamePageNav: function _onSamePageNav(event) {
this._leaveFullScreenMode()
}, _getRelativeTop: function _getRelativeTop(obj) {
var offsetTop=0;
while (obj) {
offsetTop += obj.offsetTop;
obj = obj.offsetParent
}
return offsetTop
}, _stopEventPropagation: function _stopEventPropagation(event) {
event.stopPropagation();
event.preventDefault()
}, _setupMediaStrip: function _setupMediaStrip() {
this._mediaStrip.style.msTransform = ""
}, _onInputHandlerPointerDown: function _onInputHandlerPointerDown(event) {
if (!this._canScrubVideo) {
return
}
if (event.pointerType === mousePointerType && event.button !== mouseLeftButton) {
return
}
else {
this._inputHandlerElement.msSetPointerCapture(event.pointerId);
event.preventDefault()
}
this._startTouchOffsetX = event.offsetX;
this._startTouchOffsetY = event.offsetY;
var thumbOffsetX=(this._thumbElement.offsetLeft - this._thumbElement.parentElement.offsetLeft) + this._thumbElement.clientWidth / 2;
var thumbOffsetY=(this._thumbElement.offsetTop - this._thumbElement.parentElement.offsetTop) + this._thumbElement.clientHeight / 2;
if (this._isSeekBarVisible && Math.abs(thumbOffsetX - this._startTouchOffsetX) < this._thumbGrabThreshold && Math.abs(thumbOffsetY - this._startTouchOffsetY) < this._thumbGrabThreshold) {
this._onThumbStartDrag(event);
this._stopEventPropagation(event);
return true
}
this._isPointerDown = true
}, _onInputHandlerPointerMove: function _onInputHandlerPointerMove(event) {
var currentPointerPosition=event.pageX + "," + event.pageY;
this._testThumbState(event.pageX, event.pageY);
var lastPointerPosition=this._lastPointerPosition;
this._lastPointerPosition = currentPointerPosition;
event.preventDefault();
if (!lastPointerPosition || lastPointerPosition === currentPointerPosition) {
return
}
if (this._isThumbGrabbed) {
this._etw.mediaPlaybackSliderUpdateStart();
this._onThumbDrag(event);
return true
}
if (this._isPointerDown) {
var newOffset=event.offsetX - this._startTouchOffsetX;
var inputHandlerWidth=this._inputHandlerElement.clientWidth;
if (newOffset > inputHandlerWidth) {
newOffset = inputHandlerWidth
}
else if (newOffset < -inputHandlerWidth) {
newOffset = -inputHandlerWidth
}
if (this._mode !== MediaAppControls.PlaybackMode.minimal && this._type !== MediaAppControls.PlaybackType.video) {
this._currentMediaStripTranslation = newOffset;
this._mediaStrip.style.msTransform = "translate(" + newOffset + "px,0px)";
if (!this._isSeekBarVisible) {
this._hideControls();
this._hideSeekBar()
}
}
event.preventDefault();
return true
}
this._lastPointerMoveTimeStamp = event.timeStamp;
if (!(this._videoAdsController.isAdPlaying() && this._videoRequiresAds)) {
this.showControls(true, false)
}
return false
}, _onInputHandlerPointerUp: function _onInputHandlerPointerUp(event) {
var mini=event.currentTarget.getAttribute("data-mini") === "root";
if (!mini) {
this._inputHandlerElement.msReleasePointerCapture(event.pointerId);
if (this._isThumbGrabbed) {
if (this._isThumbUp) {
this._rotateThumbDown()
}
this._onThumbStopDrag(event);
this._testThumbState(event.pageX, event.pageY);
return true
}
}
if (this._isPointerDown) {
var offsetX=event.offsetX + event.target.offsetLeft - event.currentTarget.offsetLeft;
if (Math.abs(event.offsetY + this._getRelativeTop(event.currentTarget) - (this._getRelativeTop(this._seekBar) + this._seekBar.clientHeight / 2)) < this._thumbGrabThreshold && this._isSeekBarVisible) {
this._startOffsetX = event.offsetX;
if (this._startOffsetX > this._getSeekbarStart() && this._startOffsetX < (parseFloat(this._seekBar.clientWidth) + this._getSeekbarStart())) {
this._onThumbDrag(event)
}
this._showControls();
this._showSeekBar()
}
else {
this._onInputHandlerTap(event)
}
}
this._isPointerDown = false;
return false
}, _onInputHandlerTap: function _onInputHandlerTap(event) {
if (this._controlHideTimeout) {
this._hideControls();
this._hideSeekBar()
}
else {
this._showControls();
if (this._mode !== MediaAppControls.PlaybackMode.minimal) {
this._showSeekBar()
}
}
}, _onInputHandlerGestureEnd: function _onInputHandlerGestureEnd(event){}, _onInputHandlerKeyUp: function _onInputHandlerKeyUp(event) {
this.showControls(true, false);
var keyPressed=event.key;
if ((keyPressed === "Spacebar") || (keyPressed === "Enter")) {
if (document.activeElement === this._fullScreenToggleButton || (document.activeElement && document.activeElement.children && document.activeElement.children[0] && document.activeElement.children[0] === this._fullScreenToggleButton)) {
this._toggleFullScreen()
}
else if (!(this._videoAdsController.isAdPlaying() && this._videoRequiresAds) && (document.activeElement === this._screenSizeToggleButton || (document.activeElement && document.activeElement.children && document.activeElement.children[0] && document.activeElement.children[0] === this._screenSizeToggleButton))) {
this._toggleScreenSize()
}
else {
this._onPlayPauseToggleCommand()
}
return
}
if (keyPressed === "Esc" || keyPressed === "Backspace") {
this._leaveFullScreenMode()
}
if (keyPressed === "Tab") {
if (Utilities.hasClass(this._waitingSpinnerContainer, "platformHide") && !(this._videoAdsController.isAdPlaying() && this._videoRequiresAds) && (document.activeElement === this._fullScreenToggleButton || (document.activeElement && document.activeElement.children && document.activeElement.children[0] && document.activeElement.children[0] === this._fullScreenToggleButton))) {
this._playButton.focus()
}
else if (Utilities.hasClass(this._errorScreen, "platformHide") && !(this._videoAdsController.isAdPlaying() && this._videoRequiresAds) && (document.activeElement === this._playButton || (document.activeElement && document.activeElement.children && document.activeElement.children[0] && document.activeElement.children[0] === this._playButton))) {
this._screenSizeToggleButton.focus()
}
else {
this._fullScreenToggleButton.focus()
}
}
}, _onInputHandlerKeyDown: function _onInputHandlerKeyDown(event) {
if (!this._canScrubVideo || !this._onPlayingEventFired) {
return
}
var keyPressed=event.key;
switch (keyPressed) {
case"Left":
this.showControls();
this.currentTime = this.currentTime - 10;
this._stopEventPropagation(event);
return;
case"Right":
this.showControls();
this.currentTime = this.currentTime + 10;
this._stopEventPropagation(event);
return
}
}, _vacateMediaElement: function _vacateMediaElement(mediaElement) {
mediaElement.isVacant = true
}, _onControlsElementMouseMove: function _onControlsElementMouseMove() {
this._showControls();
this._showSeekBar()
}, _getTotalSeekbarWidth: function _getTotalSeekbarWidth() {
return parseFloat(this._seekBar.clientWidth) - this._thumbElement.clientWidth
}, _getSeekbarStart: function _getSeekbarStart() {
return this._seekAndPlaybackControlTableSpacerLeft.clientWidth
}, _onThumbStartDrag: function _onThumbStartDrag(event) {
if (this._isSeekBarVisible && this._canScrubVideo) {
this._changeControlSource(this._thumbElement, MediaAppControls.Control.gripper, MediaAppControls.ControlState.pressed);
var thumbOffset=(this._thumbElement.offsetLeft - this._thumbElement.parentElement.offsetLeft) + this._thumbElement.clientWidth / 2;
this._thumbGrabOffsetX = event.clientX - thumbOffset;
this._wasPausedBeforeScrubbing = this._sequencer._currentState === CommonJS.MediaApp.Controls.MediaSequencerStates.ContentPlayback_Paused;
if (this._type === MediaAppControls.PlaybackType.video) {
this._currentMediaElement.playbackRate = 0
}
this._startOffsetX = event.offsetX;
this._isThumbGrabbed = true;
this._removeControlsTimer();
this._removeSeekBarTimer();
this._lastSeekBarLocation = this._seekBar.currentStyle.bottom;
this._lastThumbLocation = this._thumbElement.currentStyle.bottom;
this._rotateThumbUp();
return true
}
else {
this._onInputHandlerPointerDown(event);
event.preventDefault();
return true
}
}, _onThumbStopDrag: function _onThumbStopDrag(event) {
if (this._isThumbGrabbed) {
if (!this._wasPausedBeforeScrubbing) {
this._currentMediaElement.playbackRate = 1;
if (this._sequencer._currentState !== CommonJS.MediaApp.Controls.MediaSequencerStates.ContentPlayback_Playing && this._sequencer._currentState !== CommonJS.MediaApp.Controls.MediaSequencerStates.ContentPlayback_Paused) {
if (this._nextVideoUIController && this._nextVideoUIController.isCountdownUIShowing) {
this._nextVideoUIController.hideCountdownUI()
}
this._currentMediaElement.play()
}
}
this._isThumbGrabbed = false;
this._showSeekBar(true);
this._thumbElementToolTip.style.opacity = 0;
this._changeControlSource(this._thumbElement, MediaAppControls.Control.gripper, MediaAppControls.ControlState.hover);
this.resetAutoHideTimers(true);
return true
}
return false
}, _rotateThumbUp: function _rotateThumbUp() {
this._seekBar.style.msTransitionProperty = "margin-bottom";
this._backdrop.style.msTransitionProperty = "height";
Utilities.addClass(this._seekBar, "seekBarRaised");
Utilities.addClass(this._backdrop, "backDropExpanded");
var totalSeekBarWidth=this._getTotalSeekbarWidth();
var seekStart=this._getSeekbarStart();
var progress=this._sequencer.CurrentTime * totalSeekBarWidth / this._sequencer.Duration;
if (isNaN(this._sequencer.Duration)) {
progress = 0
}
var angle=-90 + progress / totalSeekBarWidth * 90;
if (angle >= -45 && !this._isThumbUp) {
angle -= 360
}
this._thumbElement.style.msTransitionProperty = "all";
this._thumbElement.style.msTransitionDuration = "200ms";
this._thumbElement.style.msTransitionTimingFunction = "ease-in-out";
this._thumbElement.style.msTransform = "rotate(" + angle + "deg)";
this._thumbElement.style.msTransitionProperty = "";
this._thumbElement.style.msTransitionDuration = "";
this._thumbElement.style.msTransitionTimingFunction = "";
this._isThumbUp = true
}, _rotateThumbDown: function _rotateThumbDown() {
this._isThumbUp = false;
this._syncTimeAndProgress(true);
Utilities.removeClass(this._backdrop, "backDropExpanded");
Utilities.removeClass(this._seekBar, "seekBarRaised")
}, _onThumbDrag: function _onThumbDrag(event) {
if (this._currentMediaElement.isVacant) {
return
}
var difference=event.offsetX - this._startOffsetX;
var totalSeekBarWidth=this._getTotalSeekbarWidth();
var seekStart=this._getSeekbarStart();
var granularity=1;
var progress=this._startOffsetX + difference * granularity - seekStart;
progress = progress > 0 ? progress : 0;
progress = progress < totalSeekBarWidth ? progress : totalSeekBarWidth;
var angle=0;
if (this._isThumbGrabbed || this._isThumbUp) {
angle = -90 + progress / totalSeekBarWidth * 90
}
else {
angle = -180 - progress / totalSeekBarWidth * 90
}
this._thumbElement.style.msTransform = "rotate(" + angle + "deg)";
if (isNaN(this._sequencer.Duration)) {
return
}
var newTime=progress / totalSeekBarWidth * this._sequencer.Duration;
this._thumbElementToolTip.innerText = this._formatTime(newTime);
if (newTime >= (this._sequencer.Duration - 4) && this._sequencer.Duration > 4) {
newTime = this._sequencer.Duration - 4
}
this._newTime = newTime;
this.currentTime = newTime;
if (this.currentTime !== 0) {
this._posterImage.style.visibility = "hidden"
}
this._thumbElement.style.marginLeft = (seekStart + progress) + "px";
var tooltipBottomMargin=(this._mode === MediaAppControls.PlaybackMode.full) ? 9 : 0;
if (this._isThumbGrabbed) {
this._thumbElementToolTip.style.opacity = 1;
this._thumbElementToolTip.style.marginLeft = Math.min((this._thumbElement.offsetLeft - this._thumbElement.parentElement.offsetLeft) - ((this._thumbElementToolTip.clientWidth - this._thumbElement.clientWidth) / 2), (this._thumbElementToolTip.parentElement.clientWidth - this._thumbElementToolTip.clientWidth) - 5) + "px";
this._thumbElementToolTip.style.offsetTop = (this._thumbElement.offsetTop) - (this._thumbElementToolTip.clientHeight - tooltipBottomMargin) + "px"
}
this._progress.style.width = progress / totalSeekBarWidth * 100 + "%";
this._etw.mediaPlaybackSliderUpdateEnd();
return true
}, _syncTimeAndProgress: function _syncTimeAndProgress(force) {
if (force || this._isSeekBarVisible || this.playbackMode === MediaAppControls.PlaybackMode.partial) {
var totalSeekBarWidth=this._getTotalSeekbarWidth();
var seekStart=this._getSeekbarStart();
var currentTime=this._sequencer.CurrentTime;
var duration=this._sequencer.Duration;
if (currentTime > duration) {
currentTime = duration
}
var progress=((this._newTime) ? this._newTime : currentTime) * totalSeekBarWidth / duration;
if (force || this._isSeekBarVisible) {
var angle=0;
if (this._isThumbUp) {
angle = -90 + progress / totalSeekBarWidth * 90
}
else {
angle = -180 - progress / totalSeekBarWidth * 90
}
this._thumbElement.style.msTransform = "rotate(" + angle + "deg)";
this._thumbElement.style.marginLeft = seekStart + progress + "px"
}
this._progress.style.width = progress / totalSeekBarWidth * 100 + "%"
}
}, _getTimeString: function _getTimeString(secondsOrMinutes) {
var stringForm=secondsOrMinutes.toString();
if (secondsOrMinutes < 10) {
stringForm = "0" + stringForm
}
return stringForm
}, _formatTime: function _formatTime(seconds) {
if (isNaN(seconds)) {
return ""
}
if (this._durationFormatter) {
return this._durationFormatter.formatLong(seconds * 1000)
}
var minutes=Math.floor(seconds / 60);
seconds = Math.floor(seconds % 60);
var hours=Math.floor(minutes / 60);
minutes = minutes % 60;
var timeString=minutes.toString() + ":" + this._getTimeString(seconds);
if (hours > 0) {
timeString = hours.toString() + ":" + this._getTimeString(timeString)
}
return timeString
}, _updateTimeDisplay: function _updateTimeDisplay() {
this._clearTimeDisplay();
this._timeIndicator.innerText = this.timeIndicatorText;
this._currentTimeIndicator.innerText = this._formatTime(this._sequencer.CurrentTime);
this._totalTimeIndicator.innerText = this._formatTime(this._sequencer.Duration);
if (this._currentMediaElement && this._currentMediaElement.src.indexOf(this._resetVidSrc) >= 0) {
this._topBarCurrentTime.innerText = "0:00";
this._topBarTotalTime.innerText = "/ 0:00"
}
else {
this._topBarCurrentTime.innerText = this._currentTimeIndicator.innerText;
this._topBarTotalTime.innerText = "/ " + this._totalTimeIndicator.innerText
}
if (Math.abs(this._currentMediaElement.currentTime - this._lastTimeDisplayAriaUpdate) > 5) {
this._thumbElement.setAttribute("aria-valuenow", this._sequencer.CurrentTime);
this._thumbElement.setAttribute("aria-valuemin", 0);
this._thumbElement.setAttribute("aria-valuemax", this._sequencer.Duration);
this._lastTimeDisplayAriaUpdate = this._sequencer.CurrentTime
}
}, _clearTimeDisplay: function _clearTimeDisplay() {
Utilities.empty(this._timeIndicator);
Utilities.empty(this._currentTimeIndicator);
Utilities.empty(this._totalTimeIndicator)
}, _onTimeUpdate: function _onTimeUpdate() {
if (this._hasBeenInitialized) {
if (!this._isThumbGrabbed) {
this._syncTimeAndProgress()
}
this._updateTimeDisplay()
}
}, _updateControls: function _updateControls() {
var controls=this._controlsElement.getElementsByTagName("button");
if (controls && controls.length > 0) {
for (var index=controls.length - 1; index >= 0; index--) {
var control=controls[index];
control.style.defaultDisplay = control.style.display;
control.style.display = "none";
control.setAttribute("data-mode", this._mode);
var supportedModes=control.getAttribute("data-supportedModes");
var supportedTypes=control.getAttribute("data-supportedMediaTypes");
if (supportedModes && supportedModes.indexOf(this._mode) > -1) {
if (supportedTypes && supportedTypes.indexOf(this._type) > -1) {
control.style.display = control.style.defaultDisplay
}
}
}
}
this._timeIndicator.setAttribute("data-mode", this._mode);
this._currentTimeIndicator.setAttribute("data-mode", this._mode);
this._totalTimeIndicator.setAttribute("data-mode", this._mode);
this._thumbElement.setAttribute("data-mode", this._mode);
this._seekBar.setAttribute("data-mode", this._mode);
this._backdrop.setAttribute("data-mode", this._mode);
this._playButton.setAttribute("data-mode", this._mode);
this._fullScreenToggleButton.setAttribute("data-mode", this._mode);
this._thumbElementToolTip.setAttribute("data-mode", this._mode);
this._playbackControlTable.setAttribute("data-mode", this._mode);
this._seekAndPlaybackControlTable.setAttribute("data-mode", this._mode);
this._seekAndPlaybackControlTableSpacerLeft.setAttribute("data-mode", this._mode);
this._seekAndPlaybackControlTableSpacerRight.setAttribute("data-mode", this._mode);
this._seekAndPlaybackControlTableSpacerMiddle.setAttribute("data-mode", this._mode)
}, _showPauseButton: function _showPauseButton() {
this._playButton.isPause = true;
this._playButton.setAttribute("aria-labelledby", "mediaPlaybackPauseButtonAriaLabel");
Utilities.addClass(this._playButton, "playing");
Utilities.removeClass(this._playButton, "grayButton");
Utilities.removeClass(this._fullScreenToggleButton, "grayButton")
}, _showPlayButton: function _showPlayButton() {
this._playButton.isPause = false;
this._playButton.setAttribute("aria-labelledby", "mediaPlaybackPlayButtonAriaLabel");
Utilities.removeClass(this._playButton, "playing")
}, _hideShareButton: function _hideShareButton() {
var options=this._videoOptions;
if (!options || !options.videoSource) {
console.log("video cannot be shared. hiding the share button");
this._shareVideoButton.style.display = "none"
}
}, _addMediaEventListener: function _addMediaEventListener(element, eventName, handler) {
element.addEventListener(eventName, handler, false);
element._mediaEventSubscriptions.push({
eventName: eventName, handler: handler
})
}, _unsubscribeFromMediaEvents: function _unsubscribeFromMediaEvents(element) {
var that=this;
if (element._mediaEventSubscriptions) {
element._mediaEventSubscriptions.forEach(function mediaPlayback_foreachMediaEventSubscription(subscription) {
element.removeEventListener(subscription.eventName, subscription.handler)
})
}
element._mediaEventSubscriptions = []
}, _unsubscribeFromMediaEvent: function _unsubscribeFromMediaEvent(element, eventName) {
if (element._mediaEventSubscriptions) {
for (var i=0, len=element._mediaEventSubscriptions.length; i < len; i++) {
var otherEventName=element._mediaEventSubscriptions[i].eventName;
if (eventName === otherEventName) {
element.removeEventListener(otherEventName, element._mediaEventSubscriptions[i].handler);
element._mediaEventSubscriptions.splice(i, 1);
break
}
}
}
}, _setupMediaElement: function _setupMediaElement(mediaElement) {
if (!mediaElement) {
return
}
this._unsubscribeFromMediaEvents(mediaElement);
var that=this._sequencer;
this._addMediaEventListener(mediaElement, "playing", function mediaPlayback_mediaElementOnPlaying(event) {
that._onPlaying(event)
});
this._addMediaEventListener(mediaElement, "loadedmetadata", function mediaPlayback_mediaElementOnLoadedMetadata(event) {
that._onMetaDataLoaded(event)
});
this._addMediaEventListener(mediaElement, "pause", function mediaPlayback_mediaElementOnPause(event) {
that._onPause(event)
});
this._addMediaEventListener(mediaElement, "ended", function mediaPlayback_mediaElementOnEnded(event) {
that._onEnded(event)
});
this._addMediaEventListener(mediaElement, "ratechange", function mediaPlayback_mediaElementOnRateChange(event) {
that._onRateChange(event)
});
this._addMediaEventListener(mediaElement, "error", function mediaPlayback_mediaElementOnError(event) {
that._onError(event)
});
this._addMediaEventListener(mediaElement, "timeupdate", function mediaPlayback_mediaElementOnTimeUpdate(event) {
that._onTimeUpdate(event)
});
this._addMediaEventListener(mediaElement, "seeked", function mediaPlayback_mediaElementOnSeeked(event) {
Utilities.addClass(that._mediaPlayer._waitingSpinnerContainer, "platformHide");
Utilities.removeClass(that._mediaPlayer._waitingSpinnerContainer, "mediaPlaybackSpinnerTransBG");
that._onSeeked(event)
});
this._addMediaEventListener(mediaElement, "seeking", function mediaPlayback_mediaElementOnSeeked(event) {
Utilities.removeClass(that._mediaPlayer._waitingSpinnerContainer, "platformHide");
Utilities.addClass(that._mediaPlayer._waitingSpinnerContainer, "mediaPlaybackSpinnerTransBG")
})
}, _changeControlSource: function _changeControlSource(control, controlName, state) {
control.src = "{0}/{1}{2}_{3}.svg".format(this._srcPath, controlName, state, (this._inFullScreenMode) ? "fullscreen" : "inline")
}, _testThumbState: function _testThumbState(mouseX, mouseY) {
var position=Utilities.getPosition(this._thumbElement);
var state;
if (this._isThumbGrabbed) {
state = MediaAppControls.ControlState.pressed
}
else if (mouseX >= position.left && mouseX <= position.left + position.width && mouseY >= position.top && mouseY <= position.top + position.height) {
state = MediaAppControls.ControlState.hover
}
else {
state = MediaAppControls.ControlState.rest
}
if (state !== this._oldThumbState) {
this._oldThumbState = state;
this._changeControlSource(this._thumbElement, MediaAppControls.Control.gripper, state)
}
}, _onReadyForInteraction: function _onReadyForInteraction() {
var that=this;
this._loadPromise.then(function mediaPlayback_onReadyForInteractionPromiseComplete() {
that._enableInteraction()
})
}, _enableInteraction: function _enableInteraction() {
var that=this;
console.log("enable interaction");
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._inputHandlerElement, "MSPointerDown", this._onInputHandlerPointerDownBinding, "inputHandlerElement_MSPointerDown", true, true));
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._inputHandlerElement, "MSPointerMove", this._onInputHandlerPointerMoveBinding, "inputHandlerElement_MSPointerMove", true));
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._inputHandlerElement, "MSGestureEnd", this._onInputHandlerGestureEndBinding, "inputHandlerElement_MSGestureEnd", true));
this._controlEventHandlerIdList.push(this._eventListenerManager.add(this._inputHandlerElement, "MSPointerUp", this._onInputHandlerPointerUpBinding, "inputHandlerElement_MSPointerUp", true))
}, _onPlaying: function _onPlaying() {
var that=this;
if (that && that._currentMediaElement && that._currentMediaElement.visual && that._currentMediaElement.visual.style) {
that._currentMediaElement.visual.style.opacity = "0.99"
}
setTimeout(function mediaPlaybackResetVideoOpacity() {
if (that && that._currentMediaElement && that._currentMediaElement.visual && that._currentMediaElement.visual.style) {
that._currentMediaElement.visual.style.opacity = "1";
console.log("Video Control: set video element opacity back to 1")
}
}, 500);
this._posterImage.style.visibility = "hidden";
Utilities.addClass(this._waitingSpinnerContainer, "platformHide");
if (this._hasBeenInitialized) {
if (this._currentMediaElement.playbackRate === this._currentMediaElement.defaultPlaybackRate) {
this._showPauseButton()
}
Utilities.addClass(this._playButton, "playbackActiveButton");
Utilities.addClass(this._fullScreenToggleButton, "playbackActiveButton")
}
this._systemTransportControls = SMTC_PlaybackStatus_Playing
}, _onPause: function _onPause() {
this._etw.mediaPlaybackPauseEnd();
if (this._hasBeenInitialized) {
this._showPlayButton()
}
if (!this._onStopping) {
this._systemTransportControls = SMTC_PlaybackStatus_Paused
}
else {
this._onStopping = false
}
Utilities.removeClass(this._playButton, "playbackActiveButton");
Utilities.removeClass(this._fullScreenToggleButton, "playbackActiveButton")
}, _onEnded: function _onEnded(event) {
if (this._isThumbGrabbed) {
this._onThumbStopDrag(null)
}
Utilities.removeClass(this._playButton, "playbackActiveButton");
Utilities.removeClass(this._fullScreenToggleButton, "playbackActiveButton");
this._hideCaptionControls();
this._systemTransportControls = SMTC_PlaybackStatus_Stopped;
if (this._nextVideoUIController && this._nextVideoUIController.shouldContinueNextVideo) {
this._nextVideoUIController.goToNextVideo()
}
else {
if (Utilities.hasClass(this._errorScreen, "platformHide")) {
this._leaveFullScreenMode()
}
}
this._etw.mediaPlaybackMediaEnd()
}, _onSeeked: function _onSeeked() {
this._etw.mediaPlaybackSeekEnd(this._currentMediaElement.currentTime);
if (this._currentMediaElement && this._newTime) {
var newTime=Math.round(this._newTime);
var currentTime=Math.round(this._currentMediaElement.currentTime);
if (newTime !== currentTime) {
this.currentTime = this._newTime
}
this._newTime = null
}
}, _onRateChange: function _onRateChange() {
if (this._currentMediaElement.playbackRate === this._currentMediaElement.defaultPlaybackRate) {
this._showPauseButton()
}
else if (this._currentMediaElement.playbackRate === 0) {}
else {
this._showPlayButton()
}
}, _onError: function _onError(event) {
var errorCode=event.srcElement && event.srcElement.error ? event.srcElement.error.code : "n/a";
this._errorLog("Video element error code:" + errorCode);
console.warn("Video Control: failed to play " + this._currentMediaElement.src);
if (window.navigator.onLine) {
if (!this._inFullScreenMode) {
console.warn("Video Control: Not in fullscreen mode. Returning without trying to fall back to next track.");
return
}
this._videoSrcListIndex = this._videoSrcListIndex + 1;
var nextVideoSrc=this._videoSrcList && this._videoSrcList.length && this._videoSrcListIndex >= 0 && this._videoSrcListIndex < this._videoSrcList.length ? this._videoSrcList[this._videoSrcListIndex] : null;
if (nextVideoSrc) {
console.warn("Video Control: fall back to play list[" + this._videoSrcListIndex + "]: " + nextVideoSrc);
this._currentMediaElement.src = nextVideoSrc;
this.play()
}
}
else if (this._message) {
Utilities.removeClass(this._errorScreen, "platformHide");
Utilities.addClass(this._waitingSpinnerContainer, "platformHide");
this._message.innerText = window.navigator.onLine ? CommonJS.resourceLoader.getString("/platform/videoLoadErrorText") : CommonJS.resourceLoader.getString("/platform/videoConnectErrorText");
this._showControls(true, false);
this._fullScreenToggleButton.focus();
this._systemTransportControls = SMTC_PlaybackStatus_Closed
}
}, _removeAdAndPlayVideo: function _removeAdAndPlayVideo(suspended) {
this._videoAdsController.hideAdDivCleanupAdRenderer(suspended);
if (document && (!document.msHidden)) {
this._sequencer.Play();
console.log("Video Control: play video content after Ads")
}
else {
this._resumePlay = true
}
Utilities.addClass(this._waitingSpinnerContainer, "platformHide")
}, _resetToBlack: function _resetToBlack() {
try {
this._currentMediaElement.src = this._resetVidSrc;
this._currentMediaElement.load()
}
catch(e) {
console.warn("Video Control: failed to load black.mp4: " + this._resetVidSrc + ", error message: " + e.message)
}
}, _validateLocationForVideo: function _validateLocationForVideo(loc) {
if (loc === "IPLookupError") {
console.warn("Video Control: location Lookup service error, will ignore and play video");
return true
}
if (this._geoFence === "") {
return true
}
if (typeof this._geoFence !== "string") {
console.error("video Control: incorrect MSN Catalog geoFence type");
return false
}
if (typeof loc !== "string") {
console.error("video Control: location lookup value" + loc + " is not a string");
return false
}
var bitmasks=PlatformJS.Services.configuration.getDictionary("MSNVideoLocBitmask");
var maskPos=bitmasks ? bitmasks.getInt32(loc.toLowerCase(), -1) : -1;
if (bitmasks && maskPos >= 0) {
console.log("video Control: validating location " + loc);
var bitPosInChar=maskPos % 4;
var bitPosInStr=this._geoFence.length - 1 - Math.floor(maskPos / 4);
if (bitPosInStr < 0 || bitPosInStr >= this._geoFence.length) {
console.error("video Control: geoFence: incorrect bit position: " + bitPosInStr + "; _geoFence=" + this._geoFence);
return false
}
var num=parseInt(this._geoFence.charAt(bitPosInStr), 16);
if (!(num >= 0 && num < 16)) {
console.error("video Control: error during validating location: " + "geoFence: " + this._geoFence + "; bitmask=" + maskPos);
return false
}
var bitAtNum=(num >>> bitPosInChar) & 1;
if (bitAtNum) {
return false
}
else {
return true
}
}
else {
console.error("video Control: error during validating location: " + "geoFence: " + this._geoFence + "; bitmask=" + maskPos);
return false
}
}, _onAdStart: function _onAdStart() {
console.log("Video Control: Video Ad start");
Utilities.addClass(this._waitingSpinnerContainer, "platformHide");
Animation.fadeIn(this._fullScreenToggleButton);
this._fullScreenToggleButton.focus()
}, _onAdComplete: function _onAdComplete() {
this._currentVideoAdsInterval = this._currentVideoAdsInterval + 1;
this._removeAdAndPlayVideo(true);
console.log("Video Control: Ad is complete, about to play video content")
}, _onAdError: function _onAdError(adError) {
this._removeAdAndPlayVideo(true);
if (adError && adError.logMessage) {
this._errorLog(adError.logMessage)
}
console.log("Video Control: Ad error")
}, _onAdTimeOutFinish: function _onAdTimeOutFinish(adError) {
this._removeAdAndPlayVideo(true);
if (adError && adError.logMessage) {
this._errorLog(adError.logMessage)
}
console.log("Video Control: Ad timeout")
}, _onCountdownUIShow: function _onCountdownUIShow() {
this._screenSizeToggleButton.disabled = true;
Animation.fadeOut(this._currentMediaElement)
}, _onCountdownUIHide: function _onCountdownUIHide() {
Animation.fadeIn(this._currentMediaElement);
this._screenSizeToggleButton.disabled = false
}, _resetMediaElement: function _resetMediaElement(mediaElement, src, useMediaLibrary) {
console.log("Video Control: entered resetMediaElement");
var returnPromise;
if (src) {
var source=src;
this._currentMediaSrcId = src;
mediaElement.objId = null;
if (src.objId && src.src) {
source = src.src;
mediaElement.objId = src.objId
}
this._resetToBlack();
this._currentMediaElement.isMediaLoadedFromLibrary = useMediaLibrary;
if (this._currentMediaElement.isMediaLoadedFromLibrary) {
var that=this;
returnPromise = Promise.join([this._loadContentFromMediaLibrary(source), Platform.Globalization.Marketization.getLocationFromServerAsync().then(function ipLookupComplete(p) {
return WinJS.Promise.wrap(p)
}, function ipLookupError() {
return WinJS.Promise.wrap("IPLookupError")
})]).then(function mediaPlayback_loadAdsForVideoComplete(results) {
if (results) {
if (!results[0]) {
Utilities.addClass(that._waitingSpinnerContainer, "platformHide");
Utilities.removeClass(that._errorScreen, "platformHide");
that._message.innerText = window.navigator.onLine ? CommonJS.resourceLoader.getString("/platform/videoLoadErrorText") : CommonJS.resourceLoader.getString("/platform/videoConnectErrorText");
that._errorLog("failed to load video source from MSNCatalog");
that._showControls(true, false);
that._fullScreenToggleButton.focus();
that._systemTransportControls = SMTC_PlaybackStatus_Closed
}
else if (!that._validateLocationForVideo(results[1])) {
that._resetToBlack();
that._disableVideoForGeoFence = true;
Utilities.addClass(that._waitingSpinnerContainer, "platformHide");
Utilities.removeClass(that._errorScreen, "platformHide");
that._message.innerText = CommonJS.resourceLoader.getString("/platform/videoGeoErrorText");
that._showControls(true, false);
that._fullScreenToggleButton.focus();
that._systemTransportControls = SMTC_PlaybackStatus_Closed
}
else {
that._sequencer.AddContent(results[0]);
if (that._videoRequiresAds && results[0].adsConfig && results[0].adsConfig.adServer && results[0].adsConfig.adServer.toLowerCase() !== "noad") {
that._adsConfig = results[0].adsConfig;
that._videoAdsController.playAds(results, that._videoOptions && that._videoOptions.adNetworkId)
}
}
}
})
}
else {
mediaElement.src = source;
var extVid={
ContentType: CommonJS.MediaApp.Controls.MediaContentType.VideoContent, PingHandler: null, VideoUuid: null, CanScrubVideo: true, RequiresAds: false, SourceUrl: source
};
this._videoRequiresAds = false;
this._sequencer.AddContent(extVid);
this._adjustVideoSizeToScreen(this._userPreferenceVideoScreenSize === "50%" ? false : true)
}
this._newTime = null
}
else {
mediaElement.isVacant = true;
mediaElement.src = "";
Utilities.removeClass(this._loadingScreen, "hiddenObject")
}
if (!returnPromise) {
returnPromise = Promise.wrap(true)
}
return returnPromise
}, _loadContentFromMediaLibrary: function _loadContentFromMediaLibrary(contentId) {
if (!window.navigator.onLine) {
if (this._message) {
Utilities.removeClass(this._errorScreen, "platformHide");
this._message.innerText = window.navigator.onLine ? CommonJS.resourceLoader.getString("/platform/videoLoadErrorText") : CommonJS.resourceLoader.getString("/platform/videoConnectErrorText");
console.log("Video Control: Network error when loading MSN video");
this._showControls(true, false);
this._fullScreenToggleButton.focus();
this._systemTransportControls = SMTC_PlaybackStatus_Closed
}
return Promise.wrap(null)
}
var that=this;
var overridePosterImageUrl=this._overridePosterImageUrl;
var videoEndpointProvider=new CommonJS.MediaApp.Controls.VideoEndpointProvider;
return this._assignSrcUrlFromContentId(videoEndpointProvider.getNextCatalogPrefix(), contentId, overridePosterImageUrl).then(function mediaPlayback_assignSrcUrlComplete(resultVideoObject) {
if (!resultVideoObject) {
return Promise.wrap(null)
}
else {
return Promise.wrap(resultVideoObject)
}
})
}, _onPlayCommand: function _onPlayCommand() {
this.showControls();
this._sequencer.Play()
}, _onStopCommand: function _onStopCommand() {
this.showControls();
this._sequencer.Pause()
}, _onPauseCommand: function _onPauseCommand() {
this.showControls();
this._sequencer.Pause()
}, _onPlayPauseToggleCommand: function _onPlayPauseToggleCommand() {
this.showControls(true, false);
if (!Utilities.hasClass(this._errorScreen, "platformHide") && !this._message.innerText) {
return
}
if (this._sequencer.IsPaused() || this._sequencer.HasEnded()) {
this.play()
}
else {
this.pause()
}
}, _systemTransportControls: {set: function set(value) {
switch (value) {
case SMTC_PlaybackStatus_Closed:
this._transportControl.isPlayEnabled = false;
this._transportControl.isPauseEnabled = false;
this._transportControl.playbackStatus = value;
break;
case SMTC_PlaybackStatus_Playing:
if (Utilities.hasClass(this._errorScreen, "platformHide")) {
this._transportControl.isPlayEnabled = true;
this._transportControl.isPauseEnabled = true;
this._transportControl.playbackStatus = value
}
break;
default:
if (this._inFullScreenMode && Utilities.hasClass(this._errorScreen, "platformHide")) {
this._transportControl.isPlayEnabled = true;
this._transportControl.isPauseEnabled = true;
this._transportControl.playbackStatus = value
}
break
}
}}, _formatShareApplicationLink: function _formatShareApplicationLink(source) {
var uriBuilder=new Platform.Utilities.AppExUriBuilder;
uriBuilder.controllerId = "application";
uriBuilder.commandId = "view";
uriBuilder.queryParameters.insert("entitytype", "video");
uriBuilder.queryParameters.insert("contentid", source);
uriBuilder.queryParameters.insert("referrer", "share");
return uriBuilder.toString()
}, load: function load() {
var that=this;
console.log("Video Control: entered load");
this._resetCaption();
this._loadPromise = WinJS.UI.Fragments.renderCopy(controlTemplateLocation, null).then(function mediaPlayback_loadRenderCopyComplete(documentFragment) {
console.log("Video Control: entered loadpromise.then");
that._containerElement.innerHTML = "";
that._containerElement.appendChild(documentFragment);
try {
that._init()
}
catch(error) {
return WinJS.Promise.wrapError(error);
console.log("Error during init: " + error)
}
that._controlsElement.setAttribute("data-mediatype", that._type);
console.log("Video Control: leavingt loadpromise.then");
return WinJS.Resources.processAll(that._containerElement)
}, function mediaPlayback_loadRenderCopyError(errorDetails) {
console.log("An error while rendering the mediaplayback control template" + errorDetails)
});
console.log("Video Control: leaving load");
return this._loadPromise
}, loadContentId: function loadContentId(contentId) {
console.log("Video Control: entered loadContentId");
var that=this;
Utilities.removeClass(this._loadingScreen, "hiddenObject");
this._etw.mediaPlaybackSrcSet(contentId ? contentId.objId : "invalid source");
this._sequencer.Reset();
var resetPromise=this._resetMediaElement(this._currentMediaElement, contentId, true);
var that=this;
var resetPromiseNext=resetPromise.then(function mediaPlayback_resetPromiseComplete() {
that._enableCaptioning();
Utilities.addClass(that._loadingScreen, "hiddenObject")
});
console.log("Video Control: leavingt loadContentId");
return resetPromiseNext
}, play: function play() {
console.log("Video Control: entered play");
if (this._playbackCapabilities === MediaAppControls.PlaybackCapabilities.fullScreenOnly && !this._inFullScreenMode) {
this._enterFullScreenMode()
}
if (this._nextVideoUIController && this._nextVideoUIController.isCountdownUIShowing) {
this._nextVideoUIController.hideCountdownUI()
}
if (this._captionAvailable) {
this._showCaptionButton()
}
if (this._videoAdsController.isAdPlaying() && this._videoRequiresAds) {
if (!this._inFullScreenMode) {
this.hideControls()
}
return
}
this._etw.mediaPlaybackPlayStart();
this._sequencer.Play()
}, _toggleFullScreen: function _toggleFullScreen() {
if (!this._inFullScreenMode) {
this._enterFullScreenMode()
}
else {
this._leaveFullScreenMode()
}
}, _toggleScreenSize: function _toggleScreenSize(event) {
var currentMediaElmStyle=this._currentMediaElement.visual.style;
var isFullSize=(currentMediaElmStyle.width === "100%") && (currentMediaElmStyle.height === "100%");
this._userPreferenceVideoScreenSize = isFullSize ? "50%" : "100%";
this._adjustVideoSizeToScreen(!isFullSize);
if (event) {
this._stopEventPropagation(event)
}
;
this._screenSizeToggleButton.focus()
}, _enterFullScreenMode: function _enterFullScreenMode() {
if (this._inFullScreenMode) {
return
}
var fsControl=this._fullScreenControl;
this._canResumePlayback = !this._sequencer.IsPaused();
if (fsControl) {
var currentStyle=this._containerElement.style;
this._containerElement.oldStyle = {};
var oldStyle=this._containerElement.oldStyle;
oldStyle.width = currentStyle.width;
oldStyle.height = currentStyle.height;
if (!fsControl.tryEnterFullScreen(this._containerElement)) {
console.log("Video Control: Failed to enter fullscreen mode");
this._containerElement.oldStyle = null
}
}
}, _onFullScreenEntered: function _onFullScreenEntered() {
var currentStyle=this._containerElement.style;
currentStyle.width = "";
currentStyle.height = "";
this.playbackMode = MediaAppControls.PlaybackMode.full;
Utilities.addClass(this._containerElement, "fullScreen");
this._changeControlSource(this._thumbElement, MediaAppControls.Control.gripper, MediaAppControls.ControlState.rest);
if (this._canResumePlayback) {
this._sequencer.Play()
}
this._canResumePlayback = null;
this._syncTimeAndProgress(true);
this._displayRequest = new Windows.System.Display.DisplayRequest;
this._displayRequest.requestActive();
CommonJS.processListener.disableSearchOnType()
}, _onExitedFullScreen: function _onExitedFullScreen() {
var currentStyle=this._containerElement.style;
var oldStyle=this._containerElement.oldStyle;
if (oldStyle) {
currentStyle.width = oldStyle.width;
currentStyle.height = oldStyle.height;
this._containerElement.oldStyle = null
}
this.playbackMode = MediaAppControls.PlaybackMode.partial;
Utilities.removeClass(this._containerElement, "fullScreen");
this._inFullScreenMode = false;
this._changeControlSource(this._thumbElement, MediaAppControls.Control.gripper, MediaAppControls.ControlState.rest);
this._fullScreenToggleButton.focus();
if (this._canResumePlayback) {
this._sequencer.Play()
}
this._canResumePlayback = null;
this._syncTimeAndProgress(true);
this.showControls(true);
this._systemTransportControls = SMTC_PlaybackStatus_Closed;
this._transportControl.onbuttonpressed = null;
this._displayRequest.requestRelease();
CommonJS.processListener.enableSearchOnType()
}, _leaveFullScreenMode: function _leaveFullScreenMode() {
if (!this._inFullScreenMode) {
return
}
var fsControl=this._fullScreenControl;
this.hideControls();
this._hideCaptionControls();
this._canResumePlayback = !this._sequencer.IsPaused() && (this._playbackCapabilities !== MediaAppControls.PlaybackCapabilities.fullScreenOnly);
if (this._playbackCapabilities === MediaAppControls.PlaybackCapabilities.fullScreenOnly) {
if (this._videoRequiresAds && this._videoAdsController.isAdPlaying()) {
this._videoAdsController.hideAdDivCleanupAdRenderer(false)
}
}
if (fsControl) {
if (!fsControl.tryLeaveFullScreen()) {
console.log("Video Control: Failed to leave fullscreen mode")
}
}
if (this._nextVideoUIController && this._nextVideoUIController.shouldContinueNextVideo) {
this._nextVideoUIController.clearCountdownTimer()
}
try {
this.dynamicPanoPaywallMessageFunction()
}
catch(error) {
debugger
}
}, pause: function pause() {
this._etw.mediaPlaybackPauseStart();
if (this._sequencer && !this._sequencer.IsPaused()) {
try {
this._sequencer.Pause()
}
catch(error) {}
}
else {
this._onStopping = false
}
}, togglePlayPause: function togglePlayPause() {
this._onPlayPauseToggleCommand()
}, stop: function stop() {
this._onStopping = true;
this._sequencer.Pause()
}, showControls: function showControls(forceShow, skipAutoHide) {
this._showControls(forceShow, skipAutoHide);
this._showSeekBar(forceShow, skipAutoHide)
}, hideControls: function hideControls() {
this._hideControls();
this._hideSeekBar()
}, subscribeTimeUpdates: function subscribeTimeUpdates() {
var that=this._sequencer;
this.unsubscribeTimeUpdates();
this._addMediaEventListener(this._currentMediaElement, "timeupdate", function mediaElement_currentMediaElementTimeUpdate() {
that._onTimeUpdate()
})
}, unsubscribeTimeUpdates: function unsubscribeTimeUpdates() {
this._unsubscribeFromMediaEvent(this._currentMediaElement, "timeupdate")
}, resetAutoHideTimers: function resetAutoHideTimers(forceReset) {
this.resetAutoHideControlsTimer(forceReset);
this.resetAutoHideSeekbarTimer(forceReset)
}, resetAutoHideControlsTimer: function resetAutoHideControlsTimer(forceReset) {
if (this._controlHideTimeout || forceReset) {
var that=this;
this._removeControlsTimer();
this._controlHideTimeout = setTimeout(function mediaPlayback_controlHideTimeout() {
that._hideControls()
}, this._controlsAutoHideDuration)
}
}, resetAutoHideSeekbarTimer: function resetAutoHideSeekbarTimer(forceReset) {
if (this._seekBarHideTimeout || forceReset) {
var that=this;
if (this._seekBarHideTimeout) {
clearTimeout(this._seekBarHideTimeout)
}
this._seekBarHideTimeout = setTimeout(function mediaElement_seekBarHideTimeout() {
that._hideSeekBar()
}, this._controlsAutoHideDuration)
}
}, handleShareRequest: function handleShareRequest(request) {
var options=this._videoOptions;
if (!options) {
return
}
var videoSource=options.videoSource;
if (!videoSource) {
return
}
var title=CommonJS.Utils.replaceHTMLEncodedChars(options.title);
if (options.source) {
var titleFormatter=PlatformJS.Services.resourceLoader.getString("/platform/win8ShareTitle");
title = titleFormatter.format(title, options.source)
}
var thumbnail=options.thumbnailLowResUrl;
var url=this._formatShareApplicationLink(videoSource);
var win8ShareText=PlatformJS.Services.resourceLoader.getString("/platform/win8Share");
var win8ShareLinkText="<a href='" + url + "'>" + PlatformJS.Services.resourceLoader.getString("/platform/win8ShareLink").format(CommonJS.getAppName()) + "</a>";
var link=win8ShareText.format(PlatformJS.Services.resourceLoader.getString("/platform/win8Brand"), win8ShareLinkText);
var img="";
if (thumbnail) {
img = "<img src='" + thumbnail + "'/>"
}
var html=img + "<div>" + link + "</div>";
var htmlFormat=Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.createHtmlFormat(html);
request.data.properties.title = title || " ";
request.data.setApplicationLink(new Windows.Foundation.Uri(url));
request.data.setHtmlFormat(htmlFormat)
}, src: {
get: function get() {
if (this._currentMediaElement.isVacant) {
return null
}
else {
return this._currentMediaElement.src
}
}, set: function set(value) {
this._etw.mediaPlaybackSrcSet(value ? value.objId : "invalid source");
this._resetMediaElement(this._currentMediaElement, value, false)
}
}, srcId: {
get: function get() {
if (this._currentMediaElement.isVacant) {
return null
}
else {
if (!this._currentMediaElement.isMediaLoadedFromLibrary) {
return this._currentMediaElement.src
}
else {
return this._sequencer.GetCurrentVideoId()
}
}
}, set: function set(value) {
this.loadContentId(value)
}
}, logoSrc: {set: function set(value) {
try {
this._topBarLogo.src = value
}
catch(e) {}
}}, attributionSrc: {set: function set(value) {
this._topBarAttribution.innerText = value;
this._currentMediaSrcProvider = value
}}, titleSrc: {set: function set(value) {
this._topBarTitle.innerText = value
}}, posterSrc: {set: function set(value) {
try {
this._overridePosterImageUrl = value;
this._posterImage.src = value
}
catch(e) {}
}}, poster: {get: function get() {
return this._posterImage.src
}}, isPlaying: {get: function get() {
return this._inFullScreenMode
}}, error: {get: function get() {
return this._currentMediaElement.error
}}, duration: {get: function get() {
return this._sequencer.Duration
}}, dynamicPanoPaywallMessageFunction: function dynamicPanoPaywallMessageFunction(){}, currentTime: {
get: function get() {
return this._sequencer.CurrentTime
}, set: function set(value) {
if (this._currentMediaElement.isVacant) {
console.log("Video Control: Attempted to seek an empty media element");
return
}
this._etw.mediaPlaybackSeekStart(value);
var newTime=value;
if (newTime > this._sequencer.Duration) {
this._sequencer.CurrentTime = this._sequencer.Duration
}
else if (newTime < 0) {
this._sequencer.CurrentTime = 0
}
else {
this._sequencer.CurrentTime = newTime
}
}
}, timeIndicatorText: {get: function get() {
return (this._timeFormat || this._timeFormatDefault).format(this._formatTime(this._sequencer.CurrentTime), this._formatTime(this._sequencer.Duration))
}}, rate: {
get: function get() {
return this._currentMediaElement.playbackRate
}, set: function set(value) {
this._currentMediaElement.playbackRate = value
}
}, videoWidth: {get: function get() {
return this._currentMediaElement.videoWidth
}}, videoHeight: {get: function get() {
return this._currentMediaElement.videoHeight
}}, seekToBeginning: function seekToBeginning() {
if (this._currentMediaElement.ended) {
this._currentMediaElement.load()
}
if (this.currentTime !== 0) {
this.currentTime = 0
}
this._newTime = null
}, addTextTrack: function addTextTrack(kind, label, language) {
return this._currentMediaElement.addTrack(kind, label, language)
}, zoom: {
get: function get() {
return this._currentMediaElement.msZoom
}, set: function set(value) {
this._currentMediaElement.msZoom = value
}
}, playbackMode: {
get: function get() {
return this._mode
}, set: function set(value) {
this._mode = value;
this._updateControls();
this._contentElement.setAttribute("data-mode", this._mode);
var that=this._sequencer;
this.subscribeTimeUpdates()
}
}, refresh: function refresh() {
this._setupMediaStrip()
}
}, {
instance: {get: function get() {
if (!CommonJS.MediaApp.Controls.MediaPlayback_instance) {
var hiddenVideoContainer=document.createElement("div");
WinJS.Utilities.addClass(hiddenVideoContainer, "hiddenObject hiddenVideoContainer");
var hiddenVideoContainerChild=document.createElement("div");
hiddenVideoContainer.appendChild(hiddenVideoContainerChild);
document.body.appendChild(hiddenVideoContainer);
CommonJS.MediaApp.Controls.MediaPlayback_instance = new CommonJS.MediaApp.Controls.MediaPlayback(hiddenVideoContainerChild, {
type: CommonJS.MediaApp.Controls.PlaybackType.video, mode: CommonJS.MediaApp.Controls.PlaybackMode.partial, playbackCapabilities: CommonJS.MediaApp.Controls.PlaybackCapabilities.fullScreenOnly
})
}
return CommonJS.MediaApp.Controls.MediaPlayback_instance
}}, isFullscreenVideoPlaying: function isFullscreenVideoPlaying() {
var contentElement=document.getElementById("mediaPlaybackContent");
return contentElement && contentElement.getAttribute("data-mode") === "full"
}, inlineInstance: {get: function get() {
if (!CommonJS.MediaApp.Controls.MediaPlayback_inlineInstance) {
var hiddenVideoContainer=document.createElement("div");
WinJS.Utilities.addClass(hiddenVideoContainer, "mediaPlaybackContainer");
CommonJS.MediaApp.Controls.MediaPlayback_inlineInstance = new CommonJS.MediaApp.Controls.MediaPlayback(hiddenVideoContainer, {
type: CommonJS.MediaApp.Controls.PlaybackType.video, mode: CommonJS.MediaApp.Controls.PlaybackMode.partial
})
}
return CommonJS.MediaApp.Controls.MediaPlayback_inlineInstance
}}, fullscreenPlayback: function fullscreenPlayback(contentSrc, videoOptions, videoList) {
if (!contentSrc) {
return
}
var systemTransportControls=Windows.Media.SystemMediaTransportControls.getForCurrentView();
systemTransportControls.isPlayEnabled = false;
systemTransportControls.isPauseEnabled = false;
systemTransportControls.playbackStatus = SMTC_PlaybackStatus_Closed;
PlatformJS.execDeferredNavigate(function deferFullscreenPlayback() {
var player=CommonJS.MediaApp.Controls.MediaPlayback.instance;
if (player) {
if (videoOptions && !videoOptions.videoSource) {
videoOptions.videoSource = contentSrc
}
player._videoOptions = videoOptions;
player._nextVideoUIController.shouldContinueNextVideo = player._nextVideoUIController.enableContinuousVideoPlayback && window.navigator.onLine;
if (player._nextVideoUIController.shouldContinueNextVideo) {
if (videoList && videoList.length > 1) {
var currentIndex=videoOptions.index;
var nextIndex=currentIndex + 1;
while (nextIndex < videoList.length) {
if (videoList[nextIndex].externalVideoUrl) {
nextIndex++
}
else {
break
}
}
if (nextIndex < videoList.length) {
player._nextVideoUIController.setupNextVideo(videoList[nextIndex].videoSource, videoList[nextIndex], videoList)
}
else {
player._nextVideoUIController.shouldContinueNextVideo = false
}
}
else {
player._nextVideoUIController.shouldContinueNextVideo = false
}
}
else {
if (player._fullScreenControl && player._fullScreenControl._element) {
var videoDivs=player._fullScreenControl._element.getElementsByClassName("mediaPlaybackInputHandler");
if (videoDivs && videoDivs.length > 0) {
return
}
}
}
player.load().then(function fullscreenPlaybackLoadComplete() {
var inlinePlayer=CommonJS.MediaApp.Controls.MediaPlayback_inlineInstance;
if (inlinePlayer) {
if (inlinePlayer._videoRequiresAds) {
inlinePlayer._videoAdsController.hideAdDivCleanupAdRenderer();
inlinePlayer._videoAdsController.adStatus = CommonJS.MediaApp.Controls.AdStates.AdNotStart
}
inlinePlayer.pause();
try {
var parent=inlinePlayer._containerElement.parentNode;
if (parent) {
parent.removeChild(inlinePlayer._containerElement);
if (parent.children && parent.children[0]) {
Utilities.removeClass(parent.children[0], "platformHide")
}
}
}
catch(e) {
player._errorLog("unexpected error when trying to remove inlineInstance from its current parent, error message: " + e.message)
}
}
if (videoOptions) {
if (videoOptions.thumbnail) {
player.posterSrc = videoOptions.thumbnail
}
else {
player.posterSrc = "";
console.warn("Video Control: video poster image is not specified for video " + contentSrc)
}
if (videoOptions.source) {
player.attributionSrc = videoOptions.source
}
else {
player.attributionSrc = "";
console.warn("Video Control: video attribution is not specified for video " + contentSrc)
}
if (videoOptions.sourceImageUrl) {
player.logoSrc = videoOptions.sourceImageUrl;
Utilities.removeClass(player._topBarLogo, "platformHide")
}
else {
player.logoSrc = "";
console.warn("Video Control: video logo is not specified for video " + contentSrc)
}
if (videoOptions.title) {
player.titleSrc = CommonJS.Utils.replaceHTMLEncodedChars(videoOptions.title)
}
else {
player.titleSrc = "";
console.warn("Video Control: video title is not specified for video " + contentSrc)
}
if (videoOptions.instrumentationCallback) {
player._instrumentationCallback = videoOptions.instrumentationCallback
}
else {
player._instrumentationCallback = ""
}
if (videoOptions.instrumentationEntryPoint || videoOptions.instrumentationEntryPoint === 0) {
player._instrumentationEntryPoint = videoOptions.instrumentationEntryPoint
}
else {
player._instrumentationEntryPoint = ""
}
}
if (checkValidProtocol(contentSrc)) {
player.src = contentSrc
}
else {
player._resetToBlack();
player._enterFullScreenMode();
return player.loadContentId(contentSrc)
}
}).done(function fullScreenPlayerPlayVideo() {
if (!player._disableVideoForGeoFence) {
if (document && (!document.msHidden)) {
player.play()
}
else {
player._resumePlay = true
}
if (videoOptions && videoOptions.showPaywallMessageBar) {
return videoOptions.showPaywallMessageBar()
}
}
}, function fullScreenPlayerPlayVideoError(error) {
player._enterFullScreenMode();
Utilities.removeClass(player._errorScreen, "platformHide");
var reloadButton=document.getElementById("mediaPlaybackReloadIcon");
if (reloadButton) {
reloadButton.style.display = "none"
}
Utilities.addClass(player._waitingSpinnerContainer, "platformHide");
player._showControls(true, false);
player._fullScreenToggleButton.focus();
console.warn("Video Control: fullScreenPlayer Error " + error.message)
})
}
})
}, inlinePlayback: function inlinePlayback(event, contentSrc, wrapperElement, videoOptions) {
if (!contentSrc) {
return
}
var currentItem=wrapperElement;
if (event) {
var clusterItems=event.srcElement.getElementsByClassName("cluster-item")
}
var len=clusterItems ? clusterItems.length : 0;
if (!currentItem) {
var findItem=false;
if (!(event.detail && event.detail.item && event.detail.item.title)) {
return
}
for (var i=0; i < len; i++) {
currentItem = clusterItems[i];
var headlineElements=currentItem.getElementsByClassName("headline");
var videoTitleElements=currentItem.getElementsByClassName("video-title");
var videoTitleWithSubTitleElements=currentItem.getElementsByClassName("video-title-with-subtitle");
if (headlineElements && headlineElements[0] && event.detail.item.title.indexOf(headlineElements[0].innerText) >= 0) {
findItem = true;
break
}
else if (videoTitleElements && videoTitleElements[0] && event.detail.item.title.indexOf(videoTitleElements[0].innerText) >= 0) {
findItem = true;
break
}
else if (videoTitleWithSubTitleElements && videoTitleWithSubTitleElements[0] && event.detail.item.title.indexOf(videoTitleWithSubTitleElements[0].innerText) >= 0) {
findItem = true;
break
}
}
}
var player=CommonJS.MediaApp.Controls.MediaPlayback.inlineInstance;
if (!player) {
player._errorLog("failed to get video control inlineInstance singleton, something goes wrong");
return
}
if (currentItem || findItem) {
var videoDivs=currentItem.getElementsByClassName("mediaPlaybackInputHandler");
if (videoDivs && videoDivs.length > 0) {
return
}
var containerEle=document.createElement("div");
containerEle.style.width = "100%";
containerEle.style.height = "100%";
WinJS.Utilities.addClass(containerEle, "mediaPlaybackContainer");
if (currentItem.children && currentItem.children[0]) {
Utilities.addClass(currentItem.children[0], "platformHide")
}
player._containerElement.style.width = "100%";
player._containerElement.style.height = "100%";
player._resetToBlack();
var parent=player._containerElement.parentNode;
if (parent) {
parent.removeChild(player._containerElement);
if (parent.children && parent.children[0]) {
Utilities.removeClass(parent.children[0], "platformHide")
}
}
currentItem.appendChild(player._containerElement);
player.load().then(function inlinePlaybackLoadComplete(event) {
if (videoOptions) {
if (videoOptions.thumbnail) {
player.posterSrc = videoOptions.thumbnail
}
else {
console.warn("Video Control: video poster image is not specified for video " + contentSrc);
player.posterSrc = ""
}
if (videoOptions.source) {
player.attributionSrc = videoOptions.source
}
else {
console.warn("Video Control: video attribution is not specified for video " + contentSrc);
player.attributionSrc = ""
}
if (videoOptions.title) {
player.titleSrc = CommonJS.Utils.replaceHTMLEncodedChars(videoOptions.title)
}
else {
console.warn("Video Control: video title is not specified for video " + contentSrc);
player.titleSrc = ""
}
if (videoOptions.sourceImageUrl) {
player.logoSrc = videoOptions.sourceImageUrl;
Utilities.removeClass(player._topBarLogo, "platformHide")
}
else {
console.warn("Video Control: video logo is not specified for video " + contentSrc);
player.logoSrc = ""
}
if (videoOptions.instrumentationCallback) {
player._instrumentationCallback = videoOptions.instrumentationCallback
}
else {
player._instrumentationCallback = ""
}
if (videoOptions.instrumentationEntryPoint || videoOptions.instrumentationEntryPoint === 0) {
player._instrumentationEntryPoint = videoOptions.instrumentationEntryPoint
}
else {
player._instrumentationEntryPoint = ""
}
}
if (checkValidProtocol(contentSrc)) {
player.src = contentSrc
}
else {
return player.loadContentId(contentSrc)
}
}).done(function playerPlayVideo() {
if (!player._disableVideoForGeoFence) {
if (document && (!document.msHidden)) {
player.play()
}
else {
player._resumePlay = true
}
}
})
}
}
})
})
})(WinJS);
(function appexCommonControlsMediaAppControlsInit() {
"use strict";
var MediaAppControls=WinJS.Namespace.define("CommonJS.MediaApp.Controls", {
VideoPlaybackEvents: {
PlayStart: "PLAY_START", PlayEnd: "PLAY_END", PlayContinue: "PLAY_CONTINUE"
}, MsnVideosInstrumentationHandler: WinJS.Class.define(function msnVideosInstrumentationHandler_ctor(videoUuid, msnVideosFormatCode, appStoreUrl) {
var ppName="";
var appVersion=encodeURIComponent(PlatformJS.Services.process.getAppVersionString());
var formatCode=msnVideosFormatCode;
var installationId=encodeURIComponent(Platform.Instrumentation.InstrumentationManager.instance.installationId);
var locale=Windows.Globalization.ApplicationLanguages.languages.toString().replace("-", "").toLowerCase();
var market=Platform.Globalization.Marketization.getCurrentMarket().toLowerCase();
var playerLocation=PlatformJS.Services.appConfig.getString("VideoMSNPingPL");
if (!playerLocation) {
playerLocation = encodeURIComponent("http://appex.msn.com")
}
else {
playerLocation = encodeURIComponent(playerLocation)
}
var videoLocationInsideApp=PlatformJS.Services.appConfig.getString("VideoMSNPingFR");
if (!videoLocationInsideApp) {
videoLocationInsideApp = encodeURIComponent("en-us_appex8")
}
else {
videoLocationInsideApp = encodeURIComponent(videoLocationInsideApp)
}
var playerTechnology="AppEx";
var playerType="appex_mediaplayer";
var urlBase="http://catalog.video.msn.com/FraudDetect.aspx?";
var videoId=encodeURIComponent(videoUuid);
this._pingUrl = "{0}md={1}&av={2}&c8={3}&c9={4}_v{5}&d={6}&fc={7}&fr={8}&mkt={9}&pbStatus={10}&pl={11}&plt={12}&pt=pb&size={13}x{14}&t={15}&u={16}".format(urlBase, installationId, appVersion, playerTechnology, playerTechnology, appVersion, "{0}", formatCode, videoLocationInsideApp, market, "{1}", playerLocation, playerType, "{2}", "{3}", "{4}", videoId);
this._lastPingInterval = 0;
this._continuationPingIntervalSeconds = 20
}, {
_pingUrl: "", _lastPingInterval: 0, _continuationPingIntervalSeconds: 20, SetDimensions: function SetDimensions(videoWidth, videoHeight, videoDuration) {
this.videoWidth = videoWidth;
this.videoHeight = videoHeight;
this.videoDuration = videoDuration
}, SendPing: function SendPing(eventType, currentTimeinSeconds) {
var pbStatus;
var tCode;
switch (eventType) {
case CommonJS.MediaApp.Controls.VideoPlaybackEvents.PlayStart:
pbStatus = "VideoPlaying";
tCode = 1;
break;
case CommonJS.MediaApp.Controls.VideoPlaybackEvents.PlayEnd:
pbStatus = "VideoPlayCompleted";
tCode = 11;
this._lastPingInterval = 0;
break;
case CommonJS.MediaApp.Controls.VideoPlaybackEvents.PlayContinue:
if (this._continuationPingIntervalSeconds === 0) {
console.log("Video Control: Video Playback instrumation ping interval was not set. Not sending continuation pings");
return
}
var currentPingInterval=Math.floor(currentTimeinSeconds / this._continuationPingIntervalSeconds);
if (currentPingInterval > this._lastPingInterval) {
pbStatus = "VideoPlaying";
tCode = 8;
this._lastPingInterval = currentPingInterval
}
else {
return
}
break
}
var pingUrl=this._pingUrl.format(Math.round(this.videoDuration), pbStatus, this.videoWidth, this.videoHeight, tCode);
var xhrPing=WinJS.xhr({url: pingUrl});
var that=this;
xhrPing.then(function msnVideosInstrumentationHandler_xhrComplete(xmlHttpRequestPing) {
console.log("Video Control: Playback ping sent to MSNCatalog: " + " Response status:" + xmlHttpRequestPing.status + " ;Ping IntervalSeconds: " + that._continuationPingIntervalSeconds + " ;pingUrl: " + pingUrl)
}, function msnVideosInstrumentationHandler_xhrError(xmlHttpRequestPing) {
if (xmlHttpRequestPing.status !== 399) {
console.log("Video Control: Error sending playback ping: " + " Response status:" + xmlHttpRequestPing.status + " ;Ping IntervalSeconds: " + that._continuationPingIntervalSeconds + " ;pingUrl: " + pingUrl)
}
else {
console.log("Video Control: Playback ping sent to MSNCatalog: " + " Response status:" + xmlHttpRequestPing.status + " ;Ping IntervalSeconds: " + that._continuationPingIntervalSeconds + " ;pingUrl: " + pingUrl)
}
})
}
})
})
})();
(function appexCommonControlsMediaAppVideoEndpointProviderInit() {
"use strict";
WinJS.Namespace.define("CommonJS.MediaApp.Controls", {VideoEndpointProvider: WinJS.Class.define(function _MediaPlayback_3819() {
this._videoCatalogEndpoints = PlatformJS.Services.configuration.getList("VideoCatalogEndpoints")
}, {
_defaultCatalogPrefix: "http://edge1.catalog.video.msn.com/videobyuuid.aspx?uuid=", getNextCatalogPrefix: function getNextCatalogPrefix() {
if (this._videoCatalogEndpoints.length > 0) {
var randomNumber=Math.floor(Math.random() * 100000) + 10000;
var endpointIndex=randomNumber % this._videoCatalogEndpoints.length;
var catalogEntry=this._videoCatalogEndpoints[endpointIndex];
if (catalogEntry && catalogEntry.value) {
return catalogEntry.value
}
}
return this._defaultCatalogPrefix
}
})})
})();
(function appexCommonControlsVideoAdsInit(WinJS) {
"use strict";
var EventNS=CommonJS.WindowEventManager;
var MediaAppControls=WinJS.Namespace.define("CommonJS.MediaApp.Controls", {VideoAdsController: WinJS.Class.define(function videoads_ctor(containerElement, options) {
if (!containerElement) {
throw new Error("container element cannot be null or undefined");
}
this._adDiv = containerElement;
if (!containerElement.winControl) {
containerElement.winControl = this
}
this._windowEventManager = EventNS.getInstance()
}, {
_windowEventManager: null, _adControl: null, adStatus: null, _adDiv: null, _videoAdTimeOutFinish: null, _onAdStart: function _onAdStart() {
console.log("Video ads control: Video Ad start");
this._adStatus = CommonJS.MediaApp.Controls.AdStates.AdStarted;
this._windowEventManager.dispatchEvent(EventNS.Events.VIDEOAD_START)
}, _onAdComplete: function _onAdComplete() {
console.log("Video ads control: Ad is complete, about to play video content");
this._windowEventManager.dispatchEvent(EventNS.Events.VIDEOAD_COMPLETE)
}, _createMMPPFAd: function _createMMPPFAd(results, adNetworkId) {
var result=results[0];
var that=this;
console.log("Video ads control: Creating MMPPF control.....");
var contentIdConverter=PlatformJS.Utilities && PlatformJS.Utilities.EntityIdConverter && PlatformJS.Utilities.EntityIdConverter.convertBase62ToBase32;
var adTags={
playerid: result.adsConfig.adUnitId, partnerContentId: result.partnerContentId
};
try {
adTags.contentid = contentIdConverter(result.VideoUuid)
}
catch(e) {
adTags.contentid = result.VideoUuid
}
if (adNetworkId) {
adTags.ContentNetworkId = adNetworkId
}
this._adControl = new PlayerFramework.MediaPlayer(this._adDiv, {
width: "100%", height: "100%", autoplay: true, isFullScreenVisible: false, isTimelineVisible: false, isPlayPauseVisible: false, isVolumeMuteVisible: false, isElapsedTimeVisible: false, autohide: false, adPlayerFactoryPlugin: {supportedVideoMimeTypes: ['video/mp4', 'text/xml']}, adSDKPlugin: {
onadrefreshed: that._onAdStart.bind(that), onerroroccurred: function errorOccurredLogger(e) {
var msg=e && e.detail && e.detail.errorMessage ? e.detail.errorMessage : "";
var adError={
error: e, logMessage: "Video ads control: MMPPF: errorOccurredLogger: error in adControl: " + msg
};
that._windowEventManager.dispatchEvent(EventNS.Events.VIDEOAD_ERROR, adError)
}, adUnitId: result.adsConfig.adUnitId, applicationId: result.adsConfig.appID, adTags: adTags
}
});
that._adControl.adSDKPlugin.playAd().done(that._onAdComplete.bind(that), function onAdError(e) {
var adError={
error: e, logMessage: "Video ads control: MMPPF Ad plugin throws a Promise error"
};
that._windowEventManager.dispatchEvent(EventNS.Events.VIDEOAD_ERROR, adError)
})
}, _createMDialogAd: function _createMDialogAd(results) {
var that=this;
var adsConfig=results[0] ? results[0].adsConfig : null;
var partnerContentId=results[0] ? results[0].partnerContentId : "";
partnerContentId = partnerContentId.toLowerCase().replace(/{|}/g, "");
var providerStr=adsConfig.adProvider ? adsConfig.adProvider : "";
var appName=(PlatformJS.Services.manifest && PlatformJS.Services.manifest.appId) ? PlatformJS.Services.manifest.appId : "AppEX";
if (!this._sectionID) {
this._sectionID = CommonJS.Utils.getFakeGUID()
}
var videoAdDicts=PlatformJS.Services.configuration.getDictionary("VideoAdParams");
var moreParams=videoAdDicts ? videoAdDicts.getDictionary(providerStr.toLowerCase()) : null;
if (!moreParams || !moreParams.size) {
var adError={
error: null, logMessage: "Video ads control: mDialog Ad plugin failed to get necessary parameters from configuration"
};
this._windowEventManager.dispatchEvent(EventNS.Events.VIDEOAD_ERROR, adError);
return
}
var mDialogEndPoint=videoAdDicts.getString("mDialogEndPoint");
var account=moreParams.getString("account");
var removeStr=moreParams.getString("toRemove");
if (removeStr) {
partnerContentId = partnerContentId.replace(removeStr.toLowerCase(), "")
}
var sdk_decisioning_data=[];
sdk_decisioning_data.push({
key: "video_asset_id", value: partnerContentId
});
sdk_decisioning_data.push({
key: "application_version", value: appName
});
sdk_decisioning_data.push({
key: "model", value: moreParams.getString("model")
});
sdk_decisioning_data.push({
key: "device_unique_identifier", value: this._sectionID
});
var api_key=moreParams.getString("api_key");
var application_key=moreParams.getString("application_key");
var client_decisioning_data=[];
client_decisioning_data.push({
key: "g", value: moreParams.getString("g")
});
client_decisioning_data.push({
key: "z", value: moreParams.getString("z")
});
client_decisioning_data.push({
key: "app", value: moreParams.getString("app")
});
client_decisioning_data.push({
key: "device", value: moreParams.getString("device")
});
var client_tracking_data=[];
client_tracking_data.push({
key: "BUSINESS_NAME", value: account
});
client_tracking_data.push({
key: "APPLICATION_NAME", value: appName
});
client_tracking_data.push({
key: "DEVICE", value: moreParams.getString("model")
});
console.log("Video ads control: Creating mDialog ad control.....");
this._adControl = new MDialog.mDialogAd(this._adDiv, {
account: account, apiKey: api_key, applicationKey: application_key, baseURL: mDialogEndPoint, playerWidth: "100%", playerHeight: "100%", sdkDecisioningData: sdk_decisioning_data, clientDecisioningData: client_decisioning_data, clientTrackingData: client_tracking_data, controls: false, onStart: that._onAdStart.bind(that), onTimeUpdate: function mDialogOnTimeUpdate(){}, onError: function onMDialogAdError(e) {
var adError={
error: e, logMessage: "Video ads control: mDialog Ad plugin throws an error"
};
that._windowEventManager.dispatchEvent(EventNS.Events.VIDEOAD_ERROR, adError)
}, onComplete: that._onAdComplete.bind(that)
})
}, getVideoAdsConfig: function getVideoAdsConfig(providerId, sourceFriendlyName, sourceId) {
var adsConfig=null;
if (PlatformJS.Ads) {
adsConfig = PlatformJS.Ads.getVideoAdsConfig()
}
return adsConfig
}, isAdPlaying: function isAdPlaying() {
if (this._adStatus !== CommonJS.MediaApp.Controls.AdStates.AdCompleted) {
return true
}
else {
return false
}
}, hideAdDivCleanupAdRenderer: function hideAdDivCleanupAdRenderer(suspended) {
this._adStatus = CommonJS.MediaApp.Controls.AdStates.AdCompleted;
if (this._adControl) {
this._adControl.dispose();
this._adControl = null;
console.log("Video ads control: HideAdDivCleanupAdRenderer(): dispose ad Control ...")
}
this._adDiv.style.display = "none";
if (this._videoAdTimeOutFinish) {
clearTimeout(this._videoAdTimeOutFinish);
this._videoAdTimeOutFinish = null
}
}, playAds: function playAds(results, adNetworkId) {
var that=this;
if (results[0].adsConfig && results[0].adsConfig.adServer && results[0].adsConfig.adServer.toLowerCase() !== "noad") {
if (this._adDiv) {
this._adStatus = CommonJS.MediaApp.Controls.AdStates.AdNotStart;
console.log("Video ads control: creating new AdControl...");
var adControlName=results[0].adsConfig.adServer.toLowerCase();
this._adsConfig = results[0].adsConfig;
try {
if (adControlName === "mmppf") {
this._createMMPPFAd.bind(this)(results, adNetworkId)
}
else if (adControlName === "mdialog") {
this._createMDialogAd.bind(this)(results)
}
}
catch(error) {
var adError={
error: null, logMessage: "Error during ad creation: " + error
};
console.log(adError.logMessage);
that._windowEventManager.dispatchEvent(EventNS.Events.VIDEOAD_ERROR, adError)
}
if (this._videoAdTimeOutFinish) {
clearTimeout(this._videoAdTimeOutFinish);
this._videoAdTimeOutFinish = null
}
var maxAdTime=PlatformJS.Services.appConfig.getInt32("MaxAdTimeMS");
if (!maxAdTime || maxAdTime < 45000) {
maxAdTime = 45000
}
this._videoAdTimeOutFinish = setTimeout(function videoAdTimeOutFinish() {
if (that && that._adStatus !== CommonJS.MediaApp.Controls.AdStates.AdCompleted && that._adControl) {
var adError={
error: null, logMessage: "Video Ad timed out to finish, force to close and about to play video content"
};
that._windowEventManager.dispatchEvent(EventNS.Events.VIDEOAD_TIMEOUT_FINISH, adError)
}
}, maxAdTime)
}
}
else {
this.HideAdDivCleanupAdRenderer(true);
this._adStatus = CommonJS.MediaApp.Controls.AdStates.AdNotStart
}
}
}, {})})
})(WinJS);
(function appexCommonControlsMediaAppControlsInit(WinJS) {
"use strict";
var Animation=WinJS.UI.Animation;
var Utilities=WinJS.Utilities;
var Promise=WinJS.Promise;
var MediaAppControls=WinJS.Namespace.define("CommonJS.MediaApp.Controls", {
MediaContentType: {
VideoContent: "videoContent", VideoPreRollAd: "videoPreRollAd"
}, MediaSequencerStates: {
InitialState: "InitialState", ContentPlayback_Playing: "ContentPlayback_Playing", ContentPlayback_Paused: "ContentPlayback_Paused"
}, AdStates: {
AdNotStart: "AdNotStart", AdStarted: "AdStarted", AdCompleted: "AdCompleted"
}, MediaSequencer: WinJS.Class.define(function _MediaSequencer_34(mediaPlayer) {
this._mediaPlayer = mediaPlayer;
this._contentVideoElement = mediaPlayer._currentMediaElement;
this._currentState = CommonJS.MediaApp.Controls.MediaSequencerStates.InitialState
}, {
_contentVideoObject: null, _isAdElementVisible: false, _assignContentVideo: function _assignContentVideo(contentObject) {
this._contentVideoObject = contentObject;
this._currentState = CommonJS.MediaApp.Controls.MediaSequencerStates.InitialState;
this._mediaPlayer._assignContentVideo(contentObject)
}, _sendPerfPing: function _sendPerfPing(pingType) {
var currentVideoObject,
currentVideoTime;
switch (this._currentState) {
case CommonJS.MediaApp.Controls.MediaSequencerStates.ContentPlayback_Playing:
case CommonJS.MediaApp.Controls.MediaSequencerStates.ContentPlayback_Paused:
currentVideoObject = this._contentVideoObject;
currentVideoTime = this._contentVideoElement.currentTime;
break;
case CommonJS.MediaApp.Controls.MediaSequencerStates.InitialState:
break;
default:
console.log("Video Control: Bad state in _sendPerfPing(): " + this._currentState);
break
}
switch (pingType) {
case CommonJS.MediaApp.Controls.VideoPlaybackEvents.PlayStart:
if (this._mediaPlayer._currentMediaElement.src.indexOf(this._mediaPlayer._resetVidSrc) >= 0) {
this._mediaPlayer._instrVideoStartDone = true;
this._mediaPlayer._instrVideo25Done = true;
this._mediaPlayer._instrVideo50Done = true;
this._mediaPlayer._instrVideo75Done = true;
this._mediaPlayer._instrVideoCompleteDone = true
}
else {
this._mediaPlayer._instrVideoStartDone = false;
this._mediaPlayer._instrVideo25Done = false;
this._mediaPlayer._instrVideo50Done = false;
this._mediaPlayer._instrVideo75Done = false;
this._mediaPlayer._instrVideoCompleteDone = false
}
this._mediaPlayer._instrVideo25Time = this.Duration * 0.25;
this._mediaPlayer._instrVideo50Time = this.Duration * 0.50;
this._mediaPlayer._instrVideo75Time = this.Duration * 0.75;
if (!this._mediaPlayer._instrVideoStartDone) {
this._mediaPlayer._instrVideoProgress(CommonJS.MediaApp.Controls.VideoProgress.videoStart);
this._mediaPlayer._instrVideoStartDone = true
}
break;
case CommonJS.MediaApp.Controls.VideoPlaybackEvents.PlayEnd:
if (!this._mediaPlayer._instrVideoCompleteDone) {
this._mediaPlayer._instrVideoProgress(CommonJS.MediaApp.Controls.VideoProgress.videoComplete);
this._mediaPlayer._instrVideoCompleteDone = true
}
break;
case CommonJS.MediaApp.Controls.VideoPlaybackEvents.PlayContinue:
if (this._mediaPlayer._instrVideo25Time && (this.CurrentTime > this._mediaPlayer._instrVideo25Time) && !this._mediaPlayer._instrVideo25Done) {
this._mediaPlayer._instrVideo25Done = true;
this._mediaPlayer._instrVideoProgress(CommonJS.MediaApp.Controls.VideoProgress.video25Percent)
}
if (this._mediaPlayer._instrVideo50Time && (this.CurrentTime > this._mediaPlayer._instrVideo50Time) && !this._mediaPlayer._instrVideo50Done) {
this._mediaPlayer._instrVideo50Done = true;
this._mediaPlayer._instrVideoProgress(CommonJS.MediaApp.Controls.VideoProgress.video50Percent)
}
if (this._mediaPlayer._instrVideo75Time && (this.CurrentTime > this._mediaPlayer._instrVideo75Time) && !this._mediaPlayer._instrVideo75Done) {
this._mediaPlayer._instrVideo75Done = true;
this._mediaPlayer._instrVideoProgress(CommonJS.MediaApp.Controls.VideoProgress.video75Percent)
}
break
}
if (currentVideoObject && currentVideoObject.PingHandler && currentVideoTime) {
currentVideoObject.PingHandler.SendPing(pingType, currentVideoTime)
}
}, _updateScrubber: function _updateScrubber(videoObject) {
if (videoObject) {
if (videoObject.CanScrubVideo) {
this._mediaPlayer._enableScrubbing()
}
else {
this._mediaPlayer._disableScrubbing()
}
}
}, _onEnded: function _onEnded(event) {
this._sendPerfPing(CommonJS.MediaApp.Controls.VideoPlaybackEvents.PlayEnd);
switch (this._currentState) {
case CommonJS.MediaApp.Controls.MediaSequencerStates.ContentPlayback_Playing:
this.Pause();
this._currentState = CommonJS.MediaApp.Controls.MediaSequencerStates.InitialState;
this._mediaPlayer._onEnded(event);
break;
default:
console.log("Video Control: Bad state in _onEnded(): " + this._currentState);
break
}
}, _onError: function _onError(event) {
this._mediaPlayer._onError(event)
}, _setPausedState: function _setPausedState() {
switch (this._currentState) {
case CommonJS.MediaApp.Controls.MediaSequencerStates.ContentPlayback_Playing:
this._currentState = CommonJS.MediaApp.Controls.MediaSequencerStates.ContentPlayback_Paused;
break
}
}, _onEnterFullScreen: function _onEnterFullScreen(event) {
if (event.detail && (event.detail.winControl !== this._mediaPlayer)) {
return
}
this._setPausedState();
this._mediaPlayer._onFullScreenEntered()
}, _onFullScreenEntered: function _onFullScreenEntered(event) {
if (event.detail && (event.detail.winControl !== this._mediaPlayer)) {
return
}
this._mediaPlayer._inFullScreenMode = true;
this._mediaPlayer._fullScreenToggleButton.focus()
}, _onExitedFullScreen: function _onExitedFullScreen(event) {
if (event.detail && (event.detail.winControl !== this._mediaPlayer)) {
return
}
this._setPausedState();
this._mediaPlayer._onExitedFullScreen()
}, _onMetaDataLoaded: function _onMetaDataLoaded(event) {
if (!this._contentVideoObject) {
return
}
this._updateScrubber(this._contentVideoObject);
this._mediaPlayer._onReadyForInteraction()
}, _onPause: function _onPause(event) {
switch (this._currentState) {
case CommonJS.MediaApp.Controls.MediaSequencerStates.ContentPlayback_Playing:
this._currentState = CommonJS.MediaApp.Controls.MediaSequencerStates.ContentPlayback_Paused;
break;
default:
console.log("Video Control: Bad state in _onPause(): " + this._currentState);
break
}
this._mediaPlayer._onPause(event)
}, _onPlaying: function _onPlaying(event) {
var videoObject;
var videoDuration;
var isInitialState=false;
var mediaSequencerStates=CommonJS.MediaApp.Controls.MediaSequencerStates;
switch (this._currentState) {
case mediaSequencerStates.InitialState:
case mediaSequencerStates.ContentPlayback_Paused:
if (this._currentState === mediaSequencerStates.InitialState) {
isInitialState = true
}
this._currentState = CommonJS.MediaApp.Controls.MediaSequencerStates.ContentPlayback_Playing;
var contentElement=this._contentVideoElement;
videoObject = this._contentVideoObject;
videoDuration = contentElement.duration;
if (videoObject && videoObject.PingHandler) {
videoObject.PingHandler.SetDimensions(contentElement.clientWidth, contentElement.clientHeight, videoDuration)
}
break;
default:
console.log("Video Control: Bad state in _onPlaying(): " + this._currentState);
break
}
if (isInitialState) {
this._sendPerfPing(CommonJS.MediaApp.Controls.VideoPlaybackEvents.PlayStart)
}
this._updateScrubber(videoObject);
this._mediaPlayer._onPlaying(event);
this._mediaPlayer._showPauseButton();
this._mediaPlayer._showControls();
if (!this._mediaPlayer._onPlayingEventFired) {
this._mediaPlayer._onPlayingEventFired = true;
this._mediaPlayer._thumbElement.focus()
}
else {
if (document.activeElement === this._mediaPlayer._fullScreenToggleButton || (document.activeElement && document.activeElement.children && document.activeElement.children[0] && document.activeElement.children[0] === this._mediaPlayer._fullScreenToggleButton)) {
this._mediaPlayer._fullScreenToggleButton.focus()
}
else {
this._mediaPlayer._thumbElement.focus()
}
}
}, _onRateChange: function _onRateChange(event) {
this._mediaPlayer._onRateChange(event)
}, _onSeeked: function _onSeeked(event) {
this._mediaPlayer._onSeeked(event)
}, _onTimeUpdate: function _onTimeUpdate(event) {
this._mediaPlayer._onTimeUpdate(event);
this._sendPerfPing(CommonJS.MediaApp.Controls.VideoPlaybackEvents.PlayContinue)
}, AddContent: function AddContent(contentObject) {
switch (contentObject.ContentType) {
case CommonJS.MediaApp.Controls.MediaContentType.VideoContent:
this._assignContentVideo(contentObject);
break;
default:
console.log("Unknown ContentType in sequencer: " + contentObject.ContentType);
break
}
}, CurrentTime: {
get: function get() {
var videoElement;
switch (this._currentState) {
case CommonJS.MediaApp.Controls.MediaSequencerStates.InitialState:
case CommonJS.MediaApp.Controls.MediaSequencerStates.ContentPlayback_Paused:
case CommonJS.MediaApp.Controls.MediaSequencerStates.ContentPlayback_Playing:
videoElement = this._contentVideoElement;
break
}
if (videoElement) {
return videoElement.currentTime
}
else {
return 0
}
}, set: function set(newTime) {
var videoElement;
switch (this._currentState) {
case CommonJS.MediaApp.Controls.MediaSequencerStates.InitialState:
case CommonJS.MediaApp.Controls.MediaSequencerStates.ContentPlayback_Paused:
case CommonJS.MediaApp.Controls.MediaSequencerStates.ContentPlayback_Playing:
videoElement = this._contentVideoElement;
break
}
if (videoElement) {
videoElement.currentTime = newTime
}
}
}, Duration: {get: function get() {
var videoElement;
switch (this._currentState) {
case CommonJS.MediaApp.Controls.MediaSequencerStates.InitialState:
case CommonJS.MediaApp.Controls.MediaSequencerStates.ContentPlayback_Paused:
case CommonJS.MediaApp.Controls.MediaSequencerStates.ContentPlayback_Playing:
videoElement = this._contentVideoElement;
break
}
if (videoElement) {
return videoElement.duration
}
else {
return 0
}
}}, GetCurrentVideoId: function GetCurrentVideoId() {
if (this._contentVideoObject) {
return this._contentVideoObject.VideoUuid
}
else {
return null
}
}, HasEnded: function HasEnded() {
return ((this._currentState === CommonJS.MediaApp.Controls.MediaSequencerStates.InitialState) && this._contentVideoElement.ended)
}, IsPaused: function IsPaused() {
switch (this._currentState) {
case CommonJS.MediaApp.Controls.MediaSequencerStates.ContentPlayback_Playing:
return false
}
return true
}, Pause: function Pause() {
switch (this._currentState) {
case CommonJS.MediaApp.Controls.MediaSequencerStates.ContentPlayback_Playing:
this._contentVideoElement.pause();
break;
default:
break
}
}, Play: function Play() {
var videoObject,
videoDuration;
var mediaPlayer=this._mediaPlayer;
switch (this._currentState) {
case CommonJS.MediaApp.Controls.MediaSequencerStates.InitialState:
if (this._contentVideoElement.ended) {
this._contentVideoElement.pause();
this._contentVideoElement.currentTime = 0
}
mediaPlayer._showContentVideoElement();
case CommonJS.MediaApp.Controls.MediaSequencerStates.ContentPlayback_Paused:
this._contentVideoElement.play();
break;
default:
console.log("Video Control: Bad state in Play(): " + this._currentState);
break
}
}, Reset: function Reset() {
this._currentState = CommonJS.MediaApp.Controls.MediaSequencerStates.InitialState;
this._contentVideoObject = null
}
})
})
})(WinJS);
(function appexCommonControlsMediaAppNextVideoUIControllerInit(WinJS) {
"use strict";
var Utilities=WinJS.Utilities;
var Animation=WinJS.UI.Animation;
var EventNS=CommonJS.WindowEventManager;
var MediaAppControls=WinJS.Namespace.define("CommonJS.MediaApp.Controls", {NextVideoUIController: WinJS.Class.define(function NextVideoUIController_ctor() {
this._windowEventManager = EventNS.getInstance();
this._enableContinuousVideoPlayback = PlatformJS.Services.configuration.getBool("EnableContinuousVideoPlayback");
this._eventListenerManager = new CommonJS.Utils.EventListenerManager("NextVideoUIController_EventListenerManager");
this._nextVideoPlayback_onClickPlayButtonBinding = this._nextVideoPlayback_onClickPlayButton.bind(this)
}, {
_mediaPlaybackCountdownUI: null, _countdownText: null, _nextVideoTitle: null, _nextVideoFavicon: null, _nextVideoSource: null, _nextVideoThumbnail: null, _nextVideoPlaybackButton: null, _nextContentSrc: null, _nextVideoOptions: null, _videoList: null, _countdownTimerId: null, _countdownForNextVideo: 3, _windowEventManager: null, _enableContinuousVideoPlayback: false, _eventListenerManager: null, _nextVideoPlayback_onClickPlayButtonBinding: null, _nextVideoPlayback_onClickPlayId: -1, isCountdownUIShowing: false, shouldContinueNextVideo: false, enableContinuousVideoPlayback: {get: function get() {
return this._enableContinuousVideoPlayback
}}, init: function init(containerElement) {
var that=this;
this._mediaPlaybackCountdownUI = Utilities.query("#mediaPlaybackCountdownUI", containerElement)[0];
var mediaPlaybackCountdownUI=this._mediaPlaybackCountdownUI;
if (mediaPlaybackCountdownUI) {
this._countdownText = mediaPlaybackCountdownUI.querySelector("#countdownText");
this._nextVideoTitle = mediaPlaybackCountdownUI.querySelector("#nextVideoTitle");
this._nextVideoFavicon = mediaPlaybackCountdownUI.querySelector("#nextVideoFavicon");
this._nextVideoSource = mediaPlaybackCountdownUI.querySelector("#nextVideoSource");
this._nextVideoThumbnail = mediaPlaybackCountdownUI.querySelector("#nextVideoThumbnail");
this._nextVideoPlaybackButton = mediaPlaybackCountdownUI.querySelector("#nextVideoPlaybackButton");
if (this._nextVideoPlayback_onClickPlayId >= 0) {
this._eventListenerManager.remove(this._nextVideoPlayback_onClickPlayId)
}
this._nextVideoPlayback_onClickPlayId = this._eventListenerManager.add(this._nextVideoPlaybackButton, "click", this._nextVideoPlayback_onClickPlayButtonBinding, "nextVideoPlaybackButton_click", true)
}
}, _nextVideoPlayback_onClickPlayButton: function _nextVideoPlayback_onClickPlayButton(event) {
event.stopPropagation();
event.preventDefault();
this.clearCountdownTimer();
CommonJS.MediaApp.Controls.MediaPlayback.fullscreenPlayback(this._nextContentSrc, this._nextVideoOptions, this._videoList)
}, goToNextVideo: function goToNextVideo() {
var that=this;
if (this._mediaPlaybackCountdownUI) {
var showNextVideoPromise;
if (that._nextVideoOptions.checkPaywallState) {
showNextVideoPromise = that._nextVideoOptions.checkPaywallState(that._nextVideoOptions)
}
else {
showNextVideoPromise = WinJS.Promise.wrap(true)
}
showNextVideoPromise.then(function nextVideoUIController_goToNextVideo(showVideo) {
if (showVideo) {
var sec=that._countdownForNextVideo;
var countdownMessage=CommonJS.resourceLoader.getString("/platform/videoCountdownText");
that.showCountdownUI();
that._countdownTimerId = setInterval(function nextVideoCountdownComplete() {
if (sec === 0) {
that.hideCountdownUI();
CommonJS.MediaApp.Controls.MediaPlayback.fullscreenPlayback(that._nextContentSrc, that._nextVideoOptions, that._videoList);
return
}
that._countdownText.innerHTML = countdownMessage.format("<strong>" + sec + "</strong>");
sec--
}, 1000)
}
})
}
}, showCountdownUI: function showCountdownUI() {
var that=this;
this._populateCountdownUI();
this._windowEventManager.dispatchEvent(EventNS.Events.VIDEO_COUNTDOWNUI_SHOW);
Utilities.removeClass(this._mediaPlaybackCountdownUI, "platformHide");
Animation.fadeIn(this._mediaPlaybackCountdownUI).done(function showCountdownUIComplete() {
CommonJS.Utils.truncateMultilineText(that._nextVideoTitle);
Utilities.removeClass(that._nextVideoTitle, "mask");
that.isCountdownUIShowing = true
})
}, _populateCountdownUI: function _populateCountdownUI() {
var sec=this._countdownForNextVideo;
var countdownMessage=CommonJS.resourceLoader.getString("/platform/videoCountdownText");
this._countdownText.innerHTML = countdownMessage.format("<strong>" + sec + "</strong>");
this._nextVideoTitle.innerText = CommonJS.Utils.replaceHTMLEncodedChars(this._nextVideoOptions.title || "");
if (this._nextVideoOptions.sourceImageUrl) {
this._nextVideoFavicon.src = this._nextVideoOptions.sourceImageUrl;
this._nextVideoFavicon.alt = this._nextVideoOptions.source || ""
}
else {
this._nextVideoFavicon.style.display = "none"
}
this._nextVideoSource.innerText = this._nextVideoOptions.source || "";
if (this._nextVideoOptions.thumbnail) {
this._nextVideoThumbnail.src = this._nextVideoOptions.thumbnail
}
else {
this._nextVideoThumbnail.style.display = "none"
}
}, hideCountdownUI: function hideCountdownUI() {
var that=this;
this.clearCountdownTimer();
Animation.fadeOut(this._mediaPlaybackCountdownUI).done(function hideCountdownUIComplete() {
Utilities.addClass(that._mediaPlaybackCountdownUI, "platformHide");
that.isCountdownUIShowing = false
});
this._windowEventManager.dispatchEvent(EventNS.Events.VIDEO_COUNTDOWNUI_HIDE)
}, clearCountdownTimer: function clearCountdownTimer() {
if (this._countdownTimerId) {
clearInterval(this._countdownTimerId)
}
}, setupNextVideo: function setupNextVideo(nextContentSrc, nextVideoOptions, videoList) {
this._nextContentSrc = nextContentSrc;
this._nextVideoOptions = nextVideoOptions;
this._videoList = videoList
}
})})
})(WinJS);
(function appexPlatformControlsVideoWrapperInit() {
"use strict";
var NS=WinJS.Namespace.define("CommonJS", {VideoWrapper: WinJS.Class.define(function VideoWrapper_ctor(element, options) {
this._element = element;
this._element.winControl = this;
CommonJS.Utils.markDisposable(this._element);
this._videoList = [];
if (options) {
this._videoOptions = options.videoOptions;
if (options.subElement) {
element.appendChild(options.subElement)
}
this._videoList = options.videoList;
this._instrumentation = options.instrumentation
}
this._clickBinding = this._onClick.bind(this);
this._keyUpBinding = this._onKeyUp.bind(this);
this._element.addEventListener("click", this._clickBinding);
this._element.addEventListener("keyup", this._keyUpBinding)
}, {
_element: null, _videoOptions: null, _clickBinding: null, _keyUpBinding: null, _enableContinuousVideoPlayback: false, _videoList: null, _instrumentation: null, _onClick: function _onClick(e) {
var evt=e ? e : window.event;
if (evt.stopPropagation) {
evt.stopPropagation()
}
if (evt.cancelBubble !== null) {
evt.cancelBubble = true
}
this._launchVideo()
}, _onKeyUp: function _onKeyUp(event) {
var keyCode=event.keyCode;
if (WinJS.Utilities.Key.enter === keyCode || WinJS.Utilities.Key.space === keyCode) {
this._launchVideo()
}
}, _launchVideo: function _launchVideo() {
var that=this,
videoOptions=this._videoOptions;
if (videoOptions) {
if (videoOptions.externalVideoUrl) {
var externalVideoUrl=videoOptions.externalVideoUrl;
var params=CommonJS.Utils.getUriParams(externalVideoUrl) || {};
if (params["videoformat"] && params["videoformat"].toLowerCase() === "flash") {
try {
this._launchThirdPartyVideo(externalVideoUrl)
}
catch(error) {
PlatformJS.deferredTelemetry(function videoWrapper_logException() {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logCodeErrorWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.high, Microsoft.Bing.AppEx.Telemetry.RuntimeEnvironment.javascript, "VideoWrapper - Third party video - LaunchUriAsync error:" + error.message, error.stack, JSON.stringify({url: externalVideoUrl}))
})
}
}
else {
externalVideoUrl = CommonJS.Utils.addParamsToThirdPartyVideoUrl(externalVideoUrl);
var location={
fragment: "/common/mediaplayback/html/ThirdPartyPlayerPage.html", page: "CommonJS.Mediaplayback.ThirdPartyPlayerPage"
};
var state={
url: externalVideoUrl, instrumentationEntryPoint: "", impressionContext: "/Mediaplayback/Thirdpartyplayer"
};
this._navigateToThirdPartyPlayerPage(location, state)
}
this._logUserAction("Third party video")
}
else {
var preLaunchVideoPromise=WinJS.Promise.wrap(true);
if (videoOptions.preLaunch) {
preLaunchVideoPromise = videoOptions.preLaunch(videoOptions) || preLaunchVideoPromise
}
preLaunchVideoPromise.then(function launchVideo_afterPreLaunchProcedure(launchVideo) {
if (launchVideo && videoOptions.videoSource) {
if (videoOptions.fullscreen === "false") {
CommonJS.MediaApp.Controls.MediaPlayback.inlinePlayback(null, videoOptions.videoSource, that._element, videoOptions);
that._logUserAction("First party video inline")
}
else {
CommonJS.MediaApp.Controls.MediaPlayback.fullscreenPlayback(videoOptions.videoSource, videoOptions, that._videoList);
that._logUserAction("First party video fullscreen")
}
}
})
}
}
}, _navigateToThirdPartyPlayerPage: function _navigateToThirdPartyPlayerPage(location, state) {
WinJS.Navigation.navigate(location, state)
}, _launchThirdPartyVideo: function _launchThirdPartyVideo(url) {
Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(url))
}, _logUserAction: function _logUserAction(videoType) {
var instrumentation=this._instrumentation;
var actionContext=(instrumentation && instrumentation.actionContext) || "";
PlatformJS.deferredTelemetry(function videoWrapper_logUserAction() {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, actionContext, "Video wrapper - " + videoType, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0)
})
}, dispose: function dispose() {
this._element.removeEventListener("click", this._clickBinding);
this._element.removeEventListener("keyup", this._keyUpBinding)
}
})})
})();
(function appexCommonControlsThirdPartyPlayerPageInit() {
"use strict";
WinJS.Namespace.define("CommonJS.Mediaplayback", {ThirdPartyPlayerPage: WinJS.Class.define(function thirdPartyPlayerPage_ctor(state) {
this._state = state;
this._impressionContext = state.impressionContext || "ThirdPartyPlayerPage"
}, {
_state: null, _control: null, _impressionContext: null, getPageState: function getPageState() {
return this._state
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
var modalElementId="loadingScreen";
CommonJS.Utils.showModalProgress(modalElementId);
var elt=document.getElementById("thirdPartyPlayerContainer");
var webViewOptions={modalElementId: modalElementId};
var webpage=this._control = new CommonJS.UI.WebView(null, webViewOptions);
var element=webpage.element;
elt.appendChild(element);
var renderOptions={gridOptions: {leftMargin: 120}};
var renderPromise=webpage.render(state.url, renderOptions);
return renderPromise
}, dispose: function dispose() {
if (this._control && this._control.dispose) {
this._control.dispose()
}
}
})})
})()