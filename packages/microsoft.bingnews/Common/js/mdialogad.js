/*  © Microsoft. All rights reserved. */
WinJS.Namespace.define('CommonJS', {Version: 'latest'});
(function mDialogInit() {
"use strict";
var NS=WinJS.Namespace.define("MDialog", {mDialogAd: WinJS.Class.define(function mDialogAd_ctor(element, options) {
element.innerHTML = "<progress class='loading win-medium win-ring mediaPlaybackSpinner'></progress><div class='player-overlay'><div class='ad-countdown-container'><div class='ad-countdown'></div></div></div>";
element.winControl = this;
CommonJS.Utils.markDisposable(element);
var style=document.createElement('style');
style.type = 'text/css';
style.innerHTML = '.player-overlay {visibility:hidden;width: auto;height: 23px;background-color: none;position: absolute;margin-top:0px;}.loading {visibility:hidden;opacity: 1 !important;position: absolute;color: white;}.mediaPlaybackSpinnerContainer {width:  100%;height:  100%;background-color:black;color: grey;position: relative;}.ad-countdown-container {position: fixed;margin: 0 auto;background-color:none;opacity: 1 !important;}.ad-countdown {position: relative;padding-right: 6px;padding-left: 6px;padding-bottom: 2px;align: right;text-align:right;  opacity: 0.5 !important;color: #FFF;background-color:black;font-size: small;width: 50px;}';
document.getElementsByTagName('head')[0].appendChild(style);
this.mediaPlayerContainer = element;
this.account = options.account;
this.apiKey = options.apiKey;
this.applicationKey = options.applicationKey;
this.playerWidth = options.playerWidth;
this.playerHeight = options.playerHeight;
this.timeout = options.timeout || 5000;
this.OSVersion = "6.2";
this.OSName = "Windows 8";
this.SDKVersion = '1.0.4';
this.sdkDecisioningData = options.sdkDecisioningData || [];
var video_asset_id_param=false;
var application_version_param=false;
var model_param=false;
for (var i=0; i < this.sdkDecisioningData.length; i++) {
if (this.sdkDecisioningData[i].key === "video_asset_id") {
video_asset_id_param = true
}
if (this.sdkDecisioningData[i].key === "application_version") {
application_version_param = true
}
if (this.sdkDecisioningData[i].key === "model") {
model_param = true
}
}
var all_required_params_present=false;
if (video_asset_id_param && application_version_param && model_param && this.account !== null && this.account !== "" && this.apiKey !== null && this.apiKey !== "" && this.applicationKey !== null && this.applicationKey !== "") {
all_required_params_present = true
}
this.sdkDecisioningData.push({
key: "os_version", value: this.OSVersion
});
this.sdkDecisioningData.push({
key: "os_name", value: this.OSName
});
this.sdkDecisioningData.push({
key: "sdk_version", value: this.SDKVersion
});
var today=new Date;
var tz_offset=today.getTimezoneOffset();
this.sdkDecisioningData.push({
key: "tz_offset", value: tz_offset.toString()
});
this.sdkDecisioningData.push({
key: "wifi", value: "true"
});
var sessionState=WinJS.Application.sessionState;
if (sessionState["application_session_unique_identifier"] === undefined) {
sessionState["application_session_unique_identifier"] = CommonJS.Utils.getFakeGUID()
}
this.sdkDecisioningData.push({
key: "application_session_unique_identifier", value: sessionState["application_session_unique_identifier"]
});
this.clientDecisioningData = options.clientDecisioningData || [];
this.sdkTrackingData = [];
this.sdkTrackingData.push({
key: "APPLICATION_KEY", value: this.applicationKey
});
this.sdkTrackingData.push({
key: "SESSION_ID", value: sessionState["application_session_unique_identifier"]
});
var device="";
for (var j=0; j < this.sdkDecisioningData.length; j++) {
if (this.sdkDecisioningData[j].key === "model") {
device = this.sdkDecisioningData[j].value
}
}
this.sdkTrackingData.push({
key: "DEVICE", value: device
});
var min=100000;
var max=999999;
var num=Math.floor(Math.random() * (max - min + 1)) + min;
this.sdkTrackingData.push({
key: "CACHE_BUST", value: num
});
var network="wifi";
if (this.wifi === "true") {
network = "cell"
}
this.sdkTrackingData.push({
key: "NETWORK", value: network
});
var deviceID="";
for (var k=0; k < this.sdkDecisioningData.length; k++) {
if (this.sdkDecisioningData[k].key === "device_unique_identifier") {
deviceID = this.sdkDecisioningData[k].value
}
}
this.sdkTrackingData.push({
key: "DEVICE_UNIQUE_ID", value: deviceID
});
this.sdkTrackingData.push({
key: "OS_NAME", value: this.OSVersion
});
this.sdkTrackingData.push({
key: "OS_VERSION", value: this.OSName
});
this.sdkTrackingData.push({
key: "SDK_VERSION", value: this.SDKVersion
});
this.clientTrackingData = options.clientTrackingData || [];
this.controls = options.controls || false;
this.baseURL = options.baseURL || "http://vast-preview.mdialog.com/decision";
this.onStart = options.onStart;
this.onTimeUpdate = options.onTimeUpdate;
this.onError = options.onError;
this.onComplete = options.onComplete;
this.ads = null;
this.trackingURL = [];
this.videoSource = null;
this.duration = null;
this.currentTime = null;
this.firstQuartile = null;
this.midpoint = null;
this.thirdQuartile = null;
this.firstQuartileTrack = false;
this.midpointTrack = false;
this.thirdQuartileTrack = false;
this.vastURL = this.buildAPIRequestURL();
this.video = document.createElement('video');
this.video.setAttribute('autoplay', true);
this.video.style.width = this.playerWidth;
this.video.style.height = this.playerHeight;
this.video.controls = this.controls;
this.video.style.backgroundColor = "Black";
this.mediaPlayerContainer.appendChild(this.video);
this.loadingRefresh();
var vastURLOptions={
url: this.vastURL, type: "GET"
};
var md=this;
if (all_required_params_present) {
WinJS.Promise.timeout(this.timeout, WinJS.xhr({
url: this.vastURL, headers: {"If-Modified-Since": "Mon, 27 Mar 1972 00:00:00 GMT"}
}).then(function complete(request) {
console.log("request completed", request);
md.response_xml(request)
}, function error(e) {
console.log("request failed", e);
md.videoPlaybackError(null)
}))
}
else {
md.videoPlaybackError(null)
}
}, {
buildCreateStreamURL: function buildCreateStreamURL() {
var qps=[];
for (var i in this.sdkDecisioningData) {
qps.push(this.sdkDecisioningData[i].key + "=" + this.sdkDecisioningData[i].value)
}
for (var j in this.clientDecisioningData) {
qps.push(this.clientDecisioningData[j].key + "=" + this.clientDecisioningData[j].value)
}
qps.push("account=" + this.account);
qps.push("api_key=" + this.apiKey);
qps.push("application_key=" + this.applicationKey);
return qps.join("&")
}, buildAPIRequestURL: function buildAPIRequestURL() {
return this.baseURL + "?" + this.buildCreateStreamURL()
}, parseXml: function parseXml(xml) {
var dom=null;
if (window.DOMParser) {
try {
dom = (new DOMParser).parseFromString(xml, "text/xml")
}
catch(e) {
dom = null
}
}
else if (window.ActiveXObject) {
try {
dom = new ActiveXObject('Microsoft.XMLDOM');
dom.async = false;
if (!dom.loadXML(xml)) {
window.alert(dom.parseError.reason + dom.parseError.srcText)
}
}
catch(e) {
dom = null
}
}
else {
alert("cannot parse xml string!")
}
return dom
}, response_xml: function response_xml(httpRequest) {
if (httpRequest.readyState === 4) {
var vastXml=this.parseXml(httpRequest.responseText);
try {
this.ads = vastXml.getElementsByTagName("Ad");
var mediaFiles=this.ads[0].getElementsByTagName("MediaFile");
var mediaIndex=null;
for (var i=0; i < mediaFiles.length; i++) {
if (mediaFiles[i].getAttribute('type') === 'video/mp4') {
mediaIndex = i
}
}
if (mediaFiles[mediaIndex].textContent !== null) {
this.videoSource = mediaFiles[mediaIndex].textContent.replace(/(\r\n|\n|\r)/gm, "")
}
else {
this.videoSource = mediaFiles[mediaIndex].getElementsByTagName("URL")[0].textContent.replace(/(\r\n|\n|\r)/gm, "")
}
var impressionNodes=this.ads[0].getElementsByTagName("Impression");
var impressionURL="";
for (var j=0; j < impressionNodes.length; j++) {
if (impressionNodes[j].textContent !== null) {
impressionURL = this.replaceSDKTrackingTokens(this.replaceClientTrackingTokens(impressionNodes[j].textContent.replace(/(\r\n|\n|\r)/gm, "")));
this.trackingURL.push({
key: "start", value: impressionURL
})
}
else {
impressionURL = this.replaceSDKTrackingTokens(this.replaceClientTrackingTokens(impressionNodes[j].getElementsByTagName("URL")[0].textContent.replace(/(\r\n|\n|\r)/gm, "")));
this.trackingURL.push({
key: "start", value: impressionURL
})
}
}
var trackingNodes=this.ads[0].getElementsByTagName("Tracking");
var trackingURL="";
for (var k=0; k < trackingNodes.length; k++) {
if (trackingNodes[k].textContent !== null) {
trackingURL = this.replaceSDKTrackingTokens(this.replaceClientTrackingTokens(trackingNodes[k].textContent.replace(/(\r\n|\n|\r)/gm, "")));
this.trackingURL.push({
key: trackingNodes[k].getAttribute('event'), value: trackingURL
})
}
else {
trackingURL = this.replaceSDKTrackingTokens(this.replaceClientTrackingTokens(trackingNodes[k].getElementsByTagName("URL")[0].textContent.replace(/(\r\n|\n|\r)/gm, "")));
this.trackingURL.push({
key: trackingNodes[k].getAttribute('event'), value: trackingURL
})
}
}
if (mediaIndex !== null) {
this.createMediaPlayer()
}
else {
this.videoPlaybackError(null)
}
}
catch(error) {
this.videoPlaybackError(error)
}
}
}, replaceClientTrackingTokens: function replaceClientTrackingTokens(template) {
var url=template;
if (this.clientTrackingData) {
for (var i=0; i < this.clientTrackingData.length; i++) {
url = url.replace("#{" + this.clientTrackingData[i].key + "}", encodeURI(this.clientTrackingData[i].value))
}
}
return url
}, replaceSDKTrackingTokens: function replaceSDKTrackingTokens(template) {
var url=template;
if (this.sdkTrackingData) {
for (var i=0; i < this.sdkTrackingData.length; i++) {
url = url.replace("${" + this.sdkTrackingData[i].key + "}", encodeURI(this.sdkTrackingData[i].value))
}
}
return url
}, track: function track(url) {
if (url !== null) {
var opts={
type: "GET", url: url
};
WinJS.xhr(opts).done(function completed(request){}, function failed(request) {
console.log("request for tracking url " + url + " failed", request)
})
}
}, createMediaPlayer: function createMediaPlayer() {
var self=this;
this.video.src = this.videoSource;
this.video.onplay = function() {
self.videoStarted()
};
this.video.onloadstart = function() {
self.videoLoadStart()
};
this.video.onloadeddata = function() {
self.videoLoadComplete()
};
this.video.ontimeupdate = function() {
self.videoTimeUpdate()
};
this.video.onerror = function() {
self.videoPlaybackError(null)
};
this.video.onpause = function() {
self.videoPaused()
};
this.video.onvolumechange = function() {
self.videoVolumeChanged()
};
this.video.onsuspend = function() {
self.videoSuspend()
};
this.video.onended = function() {
self.videoEnded()
};
this.video.onseeked = function() {
self.videoSeeked()
};
this.video.onreadystatechange = function() {
self.videoStateChanged()
};
this.video.onresize = function() {
self.videoResized()
}
}, videoStarted: function videoStarted() {
this.duration = this.video.duration;
this.firstQuartile = Math.round(this.duration / 4);
this.midpoint = Math.round(this.firstQuartile * 2);
this.thirdQuartile = Math.round(this.firstQuartile * 3);
for (var k in this.trackingURL) {
if (this.trackingURL[k].key === 'start') {
if (this.trackingURL[k].value !== null) {
this.track(this.trackingURL[k].value)
}
}
}
this.countdownTimerRefresh();
this.onStart()
}, videoLoadStart: function videoLoadStart() {
this.loadingRefresh()
}, videoLoadComplete: function videoLoadComplete() {
var loading=this.mediaPlayerContainer.getElementsByClassName("loading");
loading[0].style.visibility = 'hidden'
}, videoTimeUpdate: function videoTimeUpdate() {
this.currentTime = this.video.currentTime;
var adCountdown=this.mediaPlayerContainer.getElementsByClassName("ad-countdown");
if (adCountdown.length > 0) {
var totalSec=Math.round(this.duration - this.currentTime);
var numHours=parseInt(totalSec / 3600, 0) % 24;
var numMinutes=parseInt(totalSec / 60, 0) % 60;
var numSeconds=totalSec % 60;
adCountdown[0].innerText = ((numHours < 10) ? '0' + numHours.toString() : numHours.toString()).toString() + ":" + ((numMinutes < 10) ? '0' + numMinutes.toString() : numMinutes.toString()).toString() + ":" + ((numSeconds < 10) ? '0' + numSeconds.toString() : numSeconds.toString()).toString()
}
var currentRoundedTime=Math.round(this.currentTime);
if (currentRoundedTime === this.firstQuartile && !this.firstQuartileTrack && !this.video.seeking) {
this.firstQuartileTrack = true;
for (var i in this.trackingURL) {
if (this.trackingURL[i].key === 'firstQuartile') {
if (this.trackingURL[i].value !== null) {
this.track(this.trackingURL[i].value)
}
}
}
}
else if (currentRoundedTime === this.midpoint && !this.midpointTrack && !this.video.seeking) {
this.midpointTrack = true;
for (var j in this.trackingURL) {
if (this.trackingURL[j].key === 'midpoint') {
if (this.trackingURL[j].value !== null) {
this.track(this.trackingURL[j].value)
}
}
}
}
else if (currentRoundedTime === this.thirdQuartile && !this.thirdQuartileTrack && !this.video.seeking) {
this.thirdQuartileTrack = true;
for (var k in this.trackingURL) {
if (this.trackingURL[k].key === 'thirdQuartile') {
if (this.trackingURL[k].value !== null) {
this.track(this.trackingURL[k].value)
}
}
}
}
this.seekingCtrLast = this.seekingCtr;
this.onTimeUpdate(this.currentTime, this.duration)
}, videoPlaybackError: function videoPlaybackError(err) {
this.onError(err)
}, videoPaused: function videoPaused(video) {
for (var k in this.trackingURL) {
if (this.trackingURL[k].key === 'pause') {
if (this.trackingURL[k].value !== null) {
this.track(this.trackingURL[k].value)
}
}
}
}, videoVolumeChanged: function videoVolumeChanged(){}, videoSuspend: function videoSuspend() {
for (var k in this.trackingURL) {
if (this.trackingURL[k].key === 'stop') {
if (this.trackingURL[k].value !== null) {
this.track(this.trackingURL[k].value)
}
}
}
}, videoEnded: function videoEnded() {
for (var k in this.trackingURL) {
if (this.trackingURL[k].key === 'complete') {
if (this.trackingURL[k].value !== null) {
this.track(this.trackingURL[k].value)
}
}
}
this.mediaPlayerContainer.getElementsByClassName("player-overlay")[0].style.visibility = 'hidden';
this.onComplete()
}, videoSeeked: function videoSeeked() {
this.firstQuartileTrack = false;
this.midpointTrack = false;
this.thirdQuartileTrack = false
}, videoStateChanged: function videoStateChanged(){}, videoResized: function videoResized() {
this.countdownTimerRefresh()
}, countdownTimerRefresh: function countdownTimerRefresh() {
var playerOverlay=this.mediaPlayerContainer.getElementsByClassName("player-overlay");
if (playerOverlay.length > 0) {
playerOverlay[0].style.visibility = 'visible';
playerOverlay[0].style.width = this.mediaPlayerContainer.clientWidth.toString() + "px";
playerOverlay[0].style.marginTop = (this.mediaPlayerContainer.clientHeight - 24).toString() + "px"
}
var ad_countdown_container=this.mediaPlayerContainer.getElementsByClassName("ad-countdown-container");
if (ad_countdown_container.length > 0) {
ad_countdown_container[0].style.width = this.mediaPlayerContainer.clientWidth.toString() + "px"
}
var ad_countdown=this.mediaPlayerContainer.getElementsByClassName("ad-countdown");
if (ad_countdown.length > 0) {
ad_countdown[0].style.left = (this.mediaPlayerContainer.clientWidth - 62).toString() + "px"
}
}, loadingRefresh: function loadingRefresh() {
var loading=this.mediaPlayerContainer.getElementsByClassName("loading");
loading[0].style.visibility = 'visible';
var padding_left=(this.mediaPlayerContainer.clientWidth / 2) - loading[0].clientWidth / 2;
loading[0].style.paddingLeft = (padding_left).toString() + "px";
var padding_top=(this.mediaPlayerContainer.clientHeight / 2) - loading[0].clientHeight / 2;
loading[0].style.paddingTop = (padding_top).toString() + "px"
}, dispose: function dispose() {
while (this.mediaPlayerContainer.hasChildNodes()) {
this.mediaPlayerContainer.removeChild(this.mediaPlayerContainer.lastChild)
}
this.playerWidth = null;
this.playerHeight = null;
this.adUnitId = null;
this.videoContentId = null;
this.vastUrl = null;
this.ads = null
}, getVersion: function getVersion() {
return this.SDKVersion
}
})})
})()