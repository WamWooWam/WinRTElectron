/*  © Microsoft. All rights reserved. */
WinJS.Namespace.define('CommonJS', {Version: 'latest'});
(function appexCommonControlsUtilsInit(WinJS) {
"use strict";
var selfClosingTagRegEx=/<\s*(?!br)(?!wbr)(?!hr)([^\s>]+)\s*\/\s*>/ig;
var selfClosingTagReplacement="<$1></$1>";
function _getEstimatedStringLength(strLength, currentHeight, desiredHeight) {
return Math.floor(strLength * desiredHeight / currentHeight)
}
function getDateString(dateType, publisherName) {
var dateString="";
if (dateType && dateType.utctime) {
var utcTime=dateType.utctime;
var dateFormatter;
if (publisherName) {
dateFormatter = CommonJS.Utils.DateTimeFormatting.getDateTimeFormatter(publisherName)
}
if (dateFormatter) {
dateString = dateFormatter(dateType, CommonJS.Utils.DateTimeFormatting.dateTimeFormat.panoTile)
}
if (!dateFormatter || !dateString) {
var time=CommonJS.Utils.convertBDITimeToFriendlyTime(utcTime);
dateString = time && time.indexOf("NaN") < 0 ? time : ""
}
}
return dateString
}
var qualityMap=function buildQualityMap() {
var normalResLabel="NormalRes";
var highResLabel="HighRes";
var baseDefaultImageQuality="60";
var imageQualityMap={};
var resolution=calculateResolutionLabel();
function calculateResolutionLabel() {
var resolution=Windows.Graphics.Display.DisplayProperties.resolutionScale;
return (resolution < 120 ? normalResLabel : highResLabel)
}
function addQualityMapping(name, bootcacheKey, configKey) {
var that=this;
imageQualityMap[name] = {
value: null, bootCacheKey: bootcacheKey, configKey: configKey
}
}
;
addQualityMapping("Default", "DefaultImageQuality", "DefaultImageQuality");
addQualityMapping("FullScreen", "FullScreenImageQuality", "FullScreenImageQuality");
function loadQualityFromConfig(name) {
if (!PlatformJS.isPlatformInitialized) {
debugger;
return
}
var q=imageQualityMap[name];
var bootCacheKey=q.bootCacheKey + resolution;
var configKey=q.configKey + resolution;
var quality=PlatformJS.Services.appConfig.getString(configKey);
if (quality === null || quality.length === 0) {
quality = baseDefaultImageQuality
}
PlatformJS.BootCache.instance.addOrUpdateEntry(bootCacheKey, quality);
q.value = quality
}
;
function loadQualityFromBootCache(name) {
var q=imageQualityMap[name];
var bootCacheKey=q.bootCacheKey + resolution;
var quality=PlatformJS.BootCache.instance.getEntry(bootCacheKey);
if (quality === null || quality.length === 0) {
quality = baseDefaultImageQuality
}
q.value = quality;
PlatformJS.platformInitializedPromise.then(function getImageQualityAfterInit() {
loadQualityFromConfig(name)
})
}
;
function getQuality(name) {
var q=imageQualityMap[name];
if (!q) {
debugger;
return normalResLabel
}
if (!q.value) {
PlatformJS.isPlatformInitialized ? loadQualityFromConfig(name) : loadQualityFromBootCache(name)
}
return q.value
}
;
return {getQuality: getQuality}
}();
var qualityMapRegEx={
hasQualityParmas: /(?:_m\d|_w|_h|_p)/i, getExtensionName: /(.*)\.(.*)/i, hasQParma: /_q\d+/i, extractParams: /((?:.*)\/(?:[^_\.]*))?(?:_[mwh]\d+)*(_[^_\.]+)?(\..*)?/ig
};
var Utils=WinJS.Namespace.define("CommonJS.Utils", {
itemClickProxy: function itemClickProxy(control) {
return function utils_itemClickProxy(evt) {
var item=null;
var currentElt=evt.srcElement;
while (currentElt) {
if (WinJS.Utilities.hasClass(currentElt, "cluster-item")) {
item = currentElt.winControl.data;
break
}
currentElt = currentElt.parentElement
}
if (item) {
control.dispatchEvent("itemclick", {item: item})
}
}
}, removeImageUrlResizeTags: function removeImageUrlResizeTags(url) {
if (!url || !Utils.isUriUnderDomains(url, "msn.com") || url.indexOf("_") < 0) {
return url
}
var imageParamRe=qualityMapRegEx.imageParameter,
tokens=[],
name,
extension;
url.replace(qualityMapRegEx.extractParams, function getTokens(full, m1, m2, m3) {
if (m1 && !name) {
name = m1
}
if (m2) {
tokens.push(m2)
}
if (m3 && !extension) {
extension = m3
}
});
return name + tokens.join("") + extension
}, _resizableExtensions: ["jpg", "jpeg", "png", "bmp"], _nonQualityExtensions: ["png"], _getDefaultImageQuality: function _getDefaultImageQuality() {
return qualityMap.getQuality("Default")
}, _getDefaultFullScreenImageQuality: function _getDefaultFullScreenImageQuality() {
return qualityMap.getQuality("FullScreen")
}, _applyImageQuality: function _applyImageQuality(url, params, quality) {
if (quality !== "100" && !/_q\d+/i.test(url)) {
if (!quality) {
quality = this._getDefaultImageQuality()
}
if (quality) {
params.push("_q", quality)
}
}
}, getResizedImageUrl: function getResizedImageUrl(url, width, height, quality) {
var lowerCaseUrl=url.toLowerCase();
if (Utils.isUriUnderDomains(url, "msn.com") && !url.match(/_m\d+/i)) {
width = Math.round(width);
height = Math.round(height);
var imageNames=Utils._seperateImageExtension(url);
if (imageNames && imageNames[0] && imageNames[1]) {
var urlExtension=imageNames[1];
var canSetQuality=url.match(qualityMapRegEx.hasQParma) || Utils._canSetQuality(urlExtension);
var isResizable=Utils._isValidResizableExtension(urlExtension);
if (isResizable) {
var params=[imageNames[0]];
params.push("_m6_w", width, "_h", height);
if (canSetQuality) {
this._applyImageQuality(url, params, quality)
}
params.push(".", urlExtension);
return params.join("")
}
}
}
return url
}, _isValidResizableExtension: function _isValidResizableExtension(subUrl) {
var extensions=CommonJS.Utils._resizableExtensions;
subUrl = subUrl.toLowerCase();
for (var index=0; index < extensions.length; index++) {
if (subUrl === extensions[index]) {
return true
}
}
return false
}, _canSetQuality: function _canSetQuality(subUrl) {
var extensions=CommonJS.Utils._nonQualityExtensions;
subUrl = subUrl.toLowerCase();
for (var index=0; index < extensions.length; index++) {
if (subUrl === extensions[index]) {
return false
}
}
return true
}, _seperateImageExtension: function _seperateImageExtension(url) {
var match=qualityMapRegEx.getExtensionName.exec(url);
if (match) {
return match.slice(1)
}
else {
return null
}
}, getResizedImageUrlWithMode: function getResizedImageUrlWithMode(url, width, height, mode, quality) {
if (url && (width > 0) && (height > 0) && (mode >= 1 && mode <= 7)) {
if (Utils.isUriUnderDomains(url, "msn.com") && !url.match(qualityMapRegEx.hasQualityParmas)) {
width = Math.round(width);
height = Math.round(height);
var imageNames=Utils._seperateImageExtension(url);
if (imageNames && imageNames[0] && imageNames[1]) {
var urlExtension=imageNames[1];
var canSetQuality=url.match(qualityMapRegEx.hasQParma) || Utils._canSetQuality(urlExtension);
var isResizable=Utils._isValidResizableExtension(urlExtension);
if (isResizable) {
var params=[imageNames[0]];
params.push("_m", mode, "_w", width, "_h", height);
if (canSetQuality) {
this._applyImageQuality(url, params, quality)
}
params.push("." + urlExtension);
return params.join("")
}
}
}
}
return url
}, _getImageUrlWithQuality: function _getImageUrlWithQuality(url, quality) {
if (url) {
if (Utils.isUriUnderDomains(url, "msn.com") && !url.match(qualityMapRegEx.hasQParma) && !url.match(/_p/i)) {
var imageNames=Utils._seperateImageExtension(url);
if (imageNames && imageNames[0] && imageNames[1]) {
var params=[imageNames[0]];
this._applyImageQuality(url, params, quality);
params.push(".", imageNames[1]);
return params.join("")
}
}
}
return url
}, getResizedHeroImageUrl: function getResizedHeroImageUrl(url) {
var displayHeight=null,
displayWidth=null;
if (screen.height > screen.width) {
displayWidth = screen.height;
displayHeight = screen.width
}
else {
displayHeight = screen.height,
displayWidth = screen.width
}
var quality=this._getDefaultFullScreenImageQuality();
if (displayHeight <= 768) {
var imageHeight=768,
imageWidth=parseInt(CommonJS.Immersive.HERO_IMAGE_WIDTH_RATIO_LANDSCAPE * 1366) + 1;
url = CommonJS.Utils.getResizedImageUrlWithMode(url, imageWidth, imageHeight, 2, quality)
}
else {
url = CommonJS.Utils._getImageUrlWithQuality(url, quality)
}
return url
}, addParamsToThirdPartyVideoUrl: function addParamsToThirdPartyVideoUrl(url) {
var params={
fs: {
value: "true", overrideIfExists: false
}, app: {
value: "1", overrideIfExists: false
}
};
return CommonJS.Utils.appendUriParams(url, params)
}, convertRSSTimeToFriendlyTime: function convertRSSTimeToFriendlyTime(rssTime) {
var now=new Date;
var nowEpoch=now.getTime();
var date=new Date(rssTime);
var rssTimeEpoch=date.getTime();
if (isNaN(rssTimeEpoch)) {
rssTime = rssTime.replace("-", "/");
date = new Date(rssTime);
rssTimeEpoch = date.getTime()
}
if (!isNaN(rssTimeEpoch)) {
var delta=Math.max(0, nowEpoch - rssTimeEpoch);
return CommonJS.Utils.convertDeltaToFriendlyTime(delta)
}
return ""
}, getBDITimeDelta: function getBDITimeDelta(bdiTime) {
var nowEpoch=CommonJS.Utils.getCurrentBDITime();
var bdiTimeEpoch=(bdiTime / 10000) + Utils._bdiTimeOriginEpoch;
return nowEpoch - bdiTimeEpoch
}, getCurrentBDITime: function getCurrentBDITime() {
var now=new Date;
var nowEpoch=Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
return nowEpoch
}, convertBDITimeToFriendlyTime: function convertBDITimeToFriendlyTime(bdiTime) {
var delta=CommonJS.Utils.getBDITimeDelta(bdiTime);
delta = delta < 0 ? 0 : delta;
return CommonJS.Utils.convertDeltaToFriendlyTime(delta)
}, convertDeltaToFriendlyTime: function convertDeltaToFriendlyTime(delta) {
var friendlyTime="";
var resourceLoader=CommonJS.resourceLoader;
if (0 <= delta && delta < 120000) {
friendlyTime = resourceLoader.getString("/Platform/OneMinAgo")
}
else if (120000 <= delta && delta < 3600000) {
friendlyTime = resourceLoader.getString("/Platform/MinsAgo").format(Math.floor(delta / 60000))
}
else if (3600000 <= delta && delta < 7200000) {
friendlyTime = resourceLoader.getString("/Platform/OneHourAgo")
}
else if (7200000 <= delta && delta < 86400000) {
friendlyTime = resourceLoader.getString("/Platform/HoursAgo").format(Math.floor(delta / 3600000))
}
else if (86400000 <= delta && delta < 172800000) {
friendlyTime = resourceLoader.getString("/Platform/OneDayAgo")
}
else {
friendlyTime = resourceLoader.getString("/Platform/DaysAgo").format(Math.floor(delta / 86400000))
}
return friendlyTime
}, truncateString: function truncateString(str, len) {
return str.substr(0, len) + (len >= str.length ? "" : "...")
}, truncateMultilineText: function truncateMultilineText(multilineElt) {
msWriteProfilerMark("CommonControls:Utils:truncateMultilineText:s");
var parentElt=multilineElt.parentElement;
var parentHeight=parentElt.clientHeight;
var height=multilineElt.clientHeight;
if (height > parentHeight) {
var originalString=multilineElt.innerText;
var originalLength=originalString.length;
var initialLength=_getEstimatedStringLength(originalLength, height, parentHeight);
var nextWordBoundaryIndex=originalString.indexOf(" ", initialLength);
initialLength = (nextWordBoundaryIndex === -1 ? initialLength : nextWordBoundaryIndex);
var tryLength=initialLength;
var tryString=CommonJS.Utils.truncateString(originalString, tryLength);
multilineElt.innerText = tryString;
height = multilineElt.clientHeight;
while (height > parentHeight) {
var oneLessWordLength=originalString.lastIndexOf(" ", tryLength - 1);
tryLength = oneLessWordLength === -1 ? tryLength - 1 : oneLessWordLength;
if (tryLength <= 0) {
break
}
tryString = CommonJS.Utils.truncateString(originalString, tryLength);
multilineElt.innerText = tryString;
height = multilineElt.clientHeight
}
}
msWriteProfilerMark("CommonControls:Utils:truncateMultilineText:e")
}, getAppProtocol: function getAppProtocol() {
return PlatformJS.Services.appConfig.getString("AppProtocol", "bingnews")
}, parseCMSUriString: function parseCMSUriString(uriString, defaultMarket) {
var result=Utils.parseUriString(uriString, Utils.getAppProtocol(), defaultMarket);
if (result && result.path === "application/view") {
result.entitytype = result.params["entitytype"];
result.pageId = result.params["pageid"];
result.contentId = result.params["contentid"];
var marketParam=result.params["market"];
if (marketParam && marketParam.length > 0) {
result.market = marketParam
}
var externalUrlParam=result.params["externalurl"];
if (externalUrlParam && externalUrlParam.length > 0) {
result.externalUrl = externalUrlParam
}
var adNetworkIdParam=result.params["adnetworkid"];
if (adNetworkIdParam && adNetworkIdParam.length > 0) {
result.adNetworkId = adNetworkIdParam
}
}
else {
result = null
}
return result
}, parseUriString: function parseUriString(uriString, defaultProtocol, defaultMarket) {
var result=null;
if (uriString) {
if (0 >= uriString.indexOf(":") && defaultProtocol) {
uriString = defaultProtocol + ":" + uriString
}
try {
result = Utils.parseUri(new Windows.Foundation.Uri(uriString), defaultMarket)
}
catch(ex) {
;
}
}
return result
}, parseUri: function parseUri(uri, defaultMarket) {
var result=null;
if (uri) {
if (!uri.suspicious) {
var path=uri.path;
var host=uri.host;
var actualPath=null;
if (host) {
actualPath = host.toLowerCase();
if (path) {
var pathValue=path.toLowerCase();
if (pathValue !== "/") {
actualPath += path.toLowerCase()
}
}
}
else {
if (path) {
actualPath = path.toLowerCase()
}
}
if (actualPath) {
var urlParams=PlatformJS.Collections.createStringDictionary();
var queryParser=uri.queryParsed;
var len=queryParser ? queryParser.size : 0;
for (var idx=0; idx < len; idx++) {
var entry=queryParser.getAt(idx);
if (entry && entry.name && entry.name.length > 0 && entry.value && entry.value.length > 0) {
try {
urlParams[entry.name.toLowerCase()] = entry.value
}
catch(err) {
;
}
}
}
if (!urlParams["market"] && defaultMarket) {
urlParams["market"] = defaultMarket
}
result = {
protocol: uri.schemeName, params: urlParams, path: actualPath, uri: uri
}
}
}
}
return result
}, isUriUnderDomains: function isUriUnderDomains(uriString, domains) {
if (!uriString || !domains || !domains.length) {
return false
}
var domainStr=domains;
if (typeof domains !== "string") {
domainStr = "(?:" + domains.join("|") + ")"
}
domainStr = domainStr.replace(".", "\.").replace("/", "\/");
var domainRegExp=new RegExp("^(?:https?:\/\/)?[^\\s\/?:#]*\\.?" + domainStr, "i");
return domainRegExp.test(uriString.trim())
}, getUriParams: function getUriParams(str) {
var re=/[?&]([^\s=?&]+)=([^\s=?&]*)/g,
params={},
result=null,
found=false;
while ((result = re.exec(str)) !== null) {
if (result[0] && result[1]) {
found = true;
params[result[1].toLowerCase()] = result[2]
}
}
return found ? params : null
}, appendUriParams: function appendUriParams(uri, newParams) {
var params=CommonJS.Utils.getUriParams(uri) || {},
paramsArry=[],
keys=Object.keys(newParams),
i,
len,
uriStr=uri.match(/^[^\s?=]+/);
uriStr = uriStr && uriStr[0];
for (i = 0, len = keys.length; i < len; i++) {
var key=keys[i],
valueObj=newParams[key];
if (valueObj && typeof valueObj.value !== "undefined" && valueObj.value !== null && (!params[key] || (params[key] && valueObj.overrideIfExists))) {
params[key] = valueObj.value.toString()
}
}
keys = Object.keys(params);
for (i = 0, len = keys.length; i < len; i++) {
var key=keys[i],
value=params[key];
paramsArry.push(key + "=" + value)
}
if (paramsArry.length && uriStr) {
uriStr += "?" + paramsArry.join("&")
}
return uriStr
}, stripHTML: function stripHTML(string) {
if (string) {
return string.replace(/<(?:.|\n)*?>/gm, "")
}
else {
return null
}
}, replaceHTMLEncodedChars: function replaceHTMLEncodedChars(str) {
if (typeof(str) !== "string") {
return str
}
var ret=str.replace(/<(?:.|\n)*?>/gm, "");
ret = ret.replace(/&quot;|&#34;/g, "\"");
ret = ret.replace(/&lt;|&#60;/g, "<");
ret = ret.replace(/&gt;|&#62;/g, ">");
ret = ret.replace(/&nbsp;|&#160;/g, " ");
ret = ret.replace(/&amp;|&#38;/g, "&");
return ret
}, toStaticHTMLWithSelfClosingTags: function toStaticHTMLWithSelfClosingTags(html) {
var refreshedHTML=html.replace(selfClosingTagRegEx, selfClosingTagReplacement);
return toStaticHTML(refreshedHTML)
}, getFakeGUID: function getFakeGUID() {
var d=Date.now();
var uuid='xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function generateGuid(c) {
var r=(d + Math.random() * 16) % 16 | 0;
d = Math.floor(d / 16);
return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16)
});
return uuid
}, versionInRange: function versionInRange(version, minVersion, maxVersion) {
if (minVersion && typeof minVersion.major === "number") {
if (minVersion.major > version.major) {
return false
}
else {
if (minVersion.major === version.major) {
if (typeof minVersion.minor === "number" && minVersion.minor > version.minor) {
return false
}
}
}
}
if (maxVersion && typeof maxVersion.major === "number") {
if (maxVersion.major < version.major) {
return false
}
else {
if (maxVersion.major === version.major) {
if (typeof maxVersion.minor === "number" && maxVersion.minor < version.minor) {
return false
}
}
}
}
return true
}, _bdiTimeOriginEpoch: Date.UTC(1601, 0, 1, 0, 0, 0), convertCMSArticle: function convertCMSArticle(result, createURIFunction, options) {
var newsArticle={};
newsArticle.editorial = true;
newsArticle.lastModified = result.lastModified;
newsArticle.entityType = result.entityType;
if (result.isFREOffline) {
var abstract=result.content.abstract;
var headline=result.content.headline;
var FREOfflineTitleResourceKey=result.FREOfflineTitleResourceKey;
var FREOfflineSubtitleResourceKey=result.FREOfflineSubtitleResourceKey;
result.content.headline = headline.replace(FREOfflineTitleResourceKey, PlatformJS.Services.resourceLoader.getString(FREOfflineTitleResourceKey));
result.content.abstract = abstract.replace(FREOfflineSubtitleResourceKey, PlatformJS.Services.resourceLoader.getString(FREOfflineSubtitleResourceKey));
newsArticle.isFREOffline = true
}
if (result.heroImage) {
newsArticle.anchorpoint = result.heroImage.anchorPoint
}
var cmsImage=null;
if (result.heroImage && result.heroImage.image) {
cmsImage = result.heroImage.image
}
else {
cmsImage = result.image
}
if (cmsImage) {
newsArticle.imageAttribution = cmsImage.attribution ? cmsImage.attribution : "";
newsArticle.altText = cmsImage.altText ? cmsImage.altText : "";
newsArticle.caption = cmsImage.caption ? toStaticHTML(cmsImage.caption) : "";
var originalImage=null;
if (cmsImage.images) {
for (var i=0; i < cmsImage.images.length; i++) {
var img=cmsImage.images[i];
if (img.url) {
var imgName=img.name && img.name.toLowerCase ? img.name.toLowerCase() : "";
if (imgName === "original") {
newsArticle.thumbnail = {};
newsArticle.thumbnail.url = img.url;
newsArticle.thumbnail.width = img.width;
newsArticle.thumbnail.height = img.height;
newsArticle.thumbnail.name = "original";
if (result.heroImage) {
newsArticle.thumbnail.heroFocalPoint = img.heroFocalPoint
}
}
else if (imgName === "semanticzoom") {
newsArticle.semanticZoomThumbnail = {};
newsArticle.semanticZoomThumbnail.url = img.url;
newsArticle.semanticZoomThumbnail.width = img.width;
newsArticle.semanticZoomThumbnail.height = img.height;
newsArticle.semanticZoomThumbnail.name = "semanticZoom"
}
else if (imgName === "lowres") {
newsArticle.thumbnailLowRes = {};
newsArticle.thumbnailLowRes.url = img.url;
newsArticle.thumbnailLowRes.width = img.width;
newsArticle.thumbnailLowRes.height = img.height;
newsArticle.thumbnailLowRes.name = "lowRes";
if (result.heroImage) {
newsArticle.thumbnailLowRes.heroFocalPoint = img.heroFocalPoint
}
}
}
}
}
}
else {
newsArticle.imageAttribution = "";
newsArticle.altText = "";
newsArticle.caption = ""
}
newsArticle.sourceImageUrl = result.content.source && result.content.source.favicon ? result.content.source.favicon : "";
newsArticle.headline = result.content.headline ? toStaticHTML(result.content.headline) : "";
newsArticle.title = newsArticle.headline;
newsArticle.source = result.content.source && result.content.source.name ? result.content.source.name : "";
newsArticle.destination = result.destination || "";
Utils.resolveDestination(newsArticle, createURIFunction);
newsArticle.abstract = result.content.abstract ? toStaticHTML(result.content.abstract) : "";
newsArticle.snippet = newsArticle.abstract;
newsArticle.byline = result.content.byline || result.byline || "";
newsArticle.kicker = result.content.kicker || result.kicker || "";
var publicationDate=result.content.publicationDate;
if (publicationDate) {
newsArticle.updatedTime = getDateString(publicationDate.updated, newsArticle.source);
newsArticle.publishTime = getDateString(publicationDate.published, newsArticle.source)
}
newsArticle.template = result.template;
newsArticle.templateClass = result.templateClass;
if (options) {
if (options.useByline) {
newsArticle.source = newsArticle.byline
}
}
newsArticle.paywall = result.paywallState;
return newsArticle
}, resolveDestination: function resolveDestination(entity, createURIFunction) {
createURIFunction = createURIFunction || Utils.parseCMSUriString;
var newsUri=createURIFunction(entity.destination);
if (newsUri) {
entity.market = newsUri.market ? newsUri.market : null;
if (newsUri.entitytype === "article") {
entity.type = newsUri.entitytype;
entity.articleid = newsUri.pageId && newsUri.pageId.length > 0 ? newsUri.pageId : null;
entity.contentid = newsUri.contentId && newsUri.contentId.length > 0 ? newsUri.contentId : null
}
else if (newsUri.entitytype === "slideshow") {
entity.type = newsUri.entitytype;
entity.contentid = newsUri.pageId
}
else if (newsUri.entitytype === "video") {
entity.type = newsUri.entitytype;
var videoOptions={};
var videoSource=null;
if (newsUri.contentId && newsUri.contentId.length > 0) {
videoSource = newsUri.contentId
}
var strippedTitle=Utils.stripHTML(entity.headline || entity.title);
if (!entity.thumbnail) {
entity.thumbnail = {
width: 0, height: 0, url: "", name: ""
}
}
videoOptions.thumbnail = entity.thumbnail.url;
videoOptions.videoSource = videoSource;
videoOptions.source = entity.source;
videoOptions.sourceImageUrl = entity.sourceImageUrl;
videoOptions.title = strippedTitle;
var externalUrl=newsUri.externalUrl;
if (externalUrl && externalUrl.length > 0) {
videoOptions.externalVideoUrl = externalUrl
}
var adNetworkId=newsUri.adNetworkId;
if (adNetworkId && adNetworkId.length > 0) {
videoOptions.adNetworkId = adNetworkId
}
entity.thumbnail.videoOptions = videoOptions
}
else if (newsUri.entitytype === "partnerPano" || newsUri.entitytype === "pano") {
entity.type = newsUri.entitytype
}
}
}, markDisposable: function markDisposable(element, disposeImpl) {
if (!element) {
console.warn("CommonJS.Utils.markDisposable: element is not set.");
debugger;
return null
}
var winControl=element.winControl;
if (!winControl) {
console.warn("CommonJS.Utils.markDisposable: element.winControl is not set.");
return WinJS.Utilities.markDisposable(element, disposeImpl)
}
else {
if (winControl.disposeImplAdded) {
console.warn("CommonJS.Utils.markDisposable: it has been applied on this element");
debugger
}
winControl.disposeImplAdded = true;
var newDisposeImpl=(disposeImpl || winControl.dispose || function _utils_675(){}).bind(winControl);
return WinJS.Utilities.markDisposable(element, newDisposeImpl)
}
}, loadStyleSheets: function loadStyleSheets(cssUris) {
var buildLink=function(cssUri) {
var link=document.createElement("link");
link.setAttribute("href", cssUri);
link.setAttribute("rel", "stylesheet");
return link
};
if (cssUris && cssUris.length > 0) {
var head=document.head,
foreach=Array.prototype.forEach,
links={},
re=/^ms-appx:\/\/[^\s\/]*(\S*)/;
foreach.call(head.querySelectorAll("link"), function createLinksMap(link) {
var href=link.href.toLowerCase();
var match=re.exec(href);
if (match) {
href = match[1]
}
if (href) {
links[href] = true
}
});
cssUris = cssUris.filter(function onlyNewCss(cssUri) {
return !links[cssUri.toLowerCase()]
});
if (cssUris.length > 0) {
var fragment=document.createDocumentFragment();
for (var i=0, len=cssUris.length; i < len; i++) {
fragment.appendChild(buildLink(cssUris[i]))
}
head.appendChild(fragment)
}
}
;
}, loadDeferredStyleSheets: function loadDeferredStyleSheets() {
CommonJS.Utils.loadStyleSheets(CommonJS.Utils._deferredCssUris);
CommonJS.Utils._deferredCssUris = []
}, registerDeferredStyleSheets: function registerDeferredStyleSheets(sheets) {
if (!CommonJS.Utils._deferredCssUris) {
CommonJS.Utils._deferredCssUris = []
}
var deferredCssUris=CommonJS.Utils._deferredCssUris;
sheets = typeof sheets === "string" ? [sheets] : sheets;
for (var i=0; i < sheets.length; i++) {
deferredCssUris.push(sheets[i])
}
}, showModalProgress: function showModalProgress(modalElementId) {
var loadingScreen=document.getElementById(modalElementId);
if (loadingScreen) {
WinJS.Utilities.removeClass(loadingScreen, "platformHide")
}
CommonJS.Progress.showProgress(CommonJS.Progress.centerProgressType)
}, hideModalProgress: function hideModalProgress(modalElementId) {
var loadingScreen=document.getElementById(modalElementId);
if (loadingScreen) {
WinJS.Utilities.addClass(loadingScreen, "platformHide")
}
CommonJS.Progress.hideProgress(CommonJS.Progress.centerProgressType)
}, IdEntryCollection: WinJS.Class.define(function IdEntryCollection_ctor() {
this.clean()
}, {
_id: null, _count: null, _collection: null, addEntry: function addEntry(entry) {
var id=this._id++;
this._count++;
this._collection[id] = entry;
return id
}, removeEntry: function removeEntry(id) {
this._count--;
var result=this._collection[id] || null;
if (this.isEmpty()) {
this._collection = {}
}
else {
this._collection[id] = null
}
return result
}, updateEntry: function updateEntry(id, entry) {
if (!entry) {
return this._removeEntry(id)
}
else {
var result=this._collection[id];
this._collection[id] = entry;
return result
}
}, getIds: function getIds() {
var result=[];
this.doForEach(function collectIds(value, key) {
result.push(key)
});
return result
}, getEntry: function getEntry(id) {
return this._collection[id]
}, doForEach: function doForEach(operation, caller) {
var collection=this._collection;
for (var key in collection) {
if (collection.hasOwnProperty(key)) {
var value=collection[key];
if (value) {
operation.call(caller || this, value, key, collection)
}
}
}
}, clean: function clean() {
this._id = 0;
this._count = 0;
this._collection = {}
}, isEmpty: function isEmpty() {
return this._count === 0
}
}), _EVENTLISTENERCOLLECTION: "eventListenerManager(EB3FA3E6-82AA-483E-B2DC-873FE07DFA97)", getEventListenerManager: function getEventListenerManager(object, friendlyName) {
var manager=null;
if (object) {
var managerId=CommonJS.Utils._EVENTLISTENERCOLLECTION;
manager = object[managerId];
if (!manager) {
var _friendlyName=friendlyName || (object.constructor && object.constructor.toString().slice(0, 40)) || "";
manager = object[managerId] = new CommonJS.Utils.EventListenerManager(_friendlyName)
}
}
return manager
}, removeEventListenerManager: function removeEventListenerManager(object) {
if (object) {
var managerId=CommonJS.Utils._EVENTLISTENERCOLLECTION;
var manager=object[managerId];
if (manager) {
manager.dispose();
object[managerId] = null
}
}
}, _allEventListeners: null, getAllEventListeners: function getAllEventListeners() {
if (!CommonJS.Utils._allEventListenenrs) {
CommonJS.Utils._allEventListenenrs = new CommonJS.Utils.IdEntryCollection
}
return CommonJS.Utils._allEventListenenrs
}, EventListenerManager: WinJS.Class.define(function eventListenerManager_ctor(friendlyName) {
this._disposed = false;
this._listeners = new CommonJS.Utils.IdEntryCollection;
this._listenersId = CommonJS.Utils.getAllEventListeners().addEntry(this);
this._friendlyName = friendlyName
}, {
_listeners: null, _disposed: null, _friendlyName: "EventListenerManager", toString: function toString() {
return this._friendlyName
}, add: function add(host, name, listener, message, isCrossPage, capture) {
if (this._disposed) {
console.warn("This eventsManger has been disposed. This new added listener will not be unregistered. \n" + "To keep the function works, this listener will still be registered. But this bug has to be fixed to avoid memory leak. \n" + "If you need help, please contact CUX team");
debugger
}
if (host && name && listener) {
capture = capture ? true : false;
host.addEventListener(name, listener, capture);
if (!message) {
message = "";
if (host.id) {
message += host.id + " "
}
message += name
}
return this._listeners.addEntry({
host: host, name: name, listener: listener, message: message, isCrossPage: isCrossPage, capture: capture
})
}
else {
return -1
}
}, remove: function remove(id) {
if (!this._disposed) {
this._removeListener(this._listeners.removeEntry(id))
}
}, _removeListener: function _removeListener(entry) {
if (entry) {
var host=entry.host,
name=entry.name,
listener=entry.listener,
capture=entry.capture;
if (host && name && listener) {
try {
host.removeEventListener(name, listener, capture)
}
catch(e) {
console.warn("get an error message when removing event listener. event listener message: " + entry.message + "; exception: " + e);
debugger
}
}
}
}, getIds: function getIds() {
return this._listeners.getIds()
}, getEntry: function getEntry(id) {
return this._listeners.getEntry(id)
}, doForEach: function doForEach(operation, caller) {
this._listeners.doForEach(function goThroughEachEntry(entry, key) {
var host=entry.host,
name=entry.name,
listener=entry.listener;
operation.call(caller || this, key, host, name, listener)
})
}, removeListenerForHost: function removeListenerForHost(host) {
if (!this._disposed) {
var ids=[];
this.doForEach(function _collectIds(_id, _host, _name, _listener) {
if (host === _host) {
ids.push(_id)
}
});
ids.forEach(function _removeListener(id) {
this.remove(id)
}, this)
}
}, removeListenerForHostAndName: function removeListenerForHostAndName(host, name) {
if (!this._disposed) {
var ids=[];
this.doForEach(function _collectIds(_id, _host, _name, _listener) {
if (host === _host && _name === name) {
ids.push(_id)
}
});
ids.forEach(function _removeListener(id) {
this.remove(id)
}, this)
}
}, clear: function clear() {
if (!this._disposed) {
this._listeners.doForEach(function removeListeners(entry) {
this._removeListener(entry)
}, this)
}
}, dispose: function dispose() {
if (!this._disposed) {
this.clear();
CommonJS.Utils.getAllEventListeners().removeEntry(this._listenersId);
this._listeners = null;
this._listenersId = null;
this._disposed = true
}
}
}), Delayer: WinJS.Class.define(function ctor(callback, timeout, caller) {
this._callback = callback || function _utils_936() {
console.log("no callback function is passed into Delayer");
debugger
};
this._timeout = timeout || 500;
this._caller = caller || null;
if (this._caller) {
this._callbackBinding = this._callback.bind(this._caller)
}
else {
this._callbackBinding = this._callback
}
}, {
_timeout: 0, _callback: null, _callbackBinding: null, _caller: null, _timeoutid: null, _slice: Array.prototype.slice, _bind: Function.prototype.bind, delay: function delay() {
this._clearTimeout();
var callback=this._callbackBinding;
if (arguments.length) {
var argu=[this._caller].concat(this._slice.call(arguments));
callback = this._bind.apply(this._callback, argu)
}
this._timeoutid = setTimeout(callback, this._timeout)
}, delayWithTimeout: function delayWithTimeout(timeout) {
this._clearTimeout();
this.timeoutid = setTimeout(this._callbackBinding, timeout)
}, dispose: function dispose() {
this._clearTimeout()
}, _clearTimeout: function _clearTimeout() {
if (this._timeoutid) {
clearTimeout(this._timeoutid);
this._timeoutid = null
}
}
}), isFREDone: function isFREDone() {
return Windows.Storage.ApplicationData.current.localSettings.values.hasKey("FREDone")
}
});
var PageEventListenerManager=WinJS.Class.derive(CommonJS.Utils.EventListenerManager, function pageEventListenerManager_ctor() {
CommonJS.Utils.EventListenerManager.call(this, "Page EventListenerManager");
this.add(WinJS.Navigation, "navigating", function disposePageEventListenerManager() {
if (_PageEventListenerManagerInstance) {
_PageEventListenerManagerInstance.dispose();
_PageEventListenerManagerInstance = null
}
})
}, {}),
_PageEventListenerManagerInstance=null;
WinJS.Namespace.define("CommonJS.Utils.PageEventListenerManager", {getInstance: function getInstance() {
if (!_PageEventListenerManagerInstance) {
_PageEventListenerManagerInstance = new PageEventListenerManager
}
return _PageEventListenerManagerInstance
}});
if (!CommonJS.Utils._deferredCssUris) {
CommonJS.Utils.registerDeferredStyleSheets(["/css/default-deferred.css", "/common/css/common-deferred.css"])
}
;
})(WinJS);
(function appexLocalLoggerInit() {
"use strict";
var formatTime=function(date) {
var hours=("0" + date.getHours()).slice(-2);
var minutes=("0" + date.getMinutes()).slice(-2);
var seconds=("0" + date.getSeconds()).slice(-2);
var milliseconds=("00" + date.getMilliseconds()).slice(-3);
return [hours, minutes, seconds, milliseconds].join(":")
};
WinJS.Namespace.define("LoggerJS", {LocalFileLogger: WinJS.Class.define(function logger_ctor(filename, append) {
var that=this;
this._filename = filename;
this._cachedMessages = [];
this._processPromise = (PlatformJS && PlatformJS.platformInitializedPromise ? WinJS.Promise.wrap(null) : WinJS.Promise.timeout(5000));
this._processPromise = this._processPromise.then(function waitForPlatform() {
return PlatformJS.platformInitializedPromise
}).then(function openFile() {
if (!PlatformJS.isDebug) {
that.dispose();
return WinJS.Promise.wrap(null)
}
var localFolder=Windows.Storage.ApplicationData.current.localFolder;
var openFlag=append ? Windows.Storage.CreationCollisionOption.openIfExists : Windows.Storage.CreationCollisionOption.replaceExisting;
return localFolder.createFileAsync(that._filename, Windows.Storage.CreationCollisionOption.replaceExisting)
}).then(function fileOpened(fileHandle) {
if (fileHandle) {
that._fileHandle = fileHandle;
return that._writeCacheToFile()
}
else {
that.dispose()
}
}, function fileError(e) {
that.dispose()
})
}, {
_processPromise: null, _cachedMessages: null, _fileHandle: null, dispose: function dispose() {
this._cachedMessages.length = 0;
this.write = function(){};
this._writeCacheToFile = function(){};
this._fileHandle = null;
if (this._processPromise) {
this._processPromise.cancel()
}
}, write: function write(text) {
this._cachedMessages.push([new Date, text]);
if (this._cachedMessages.length === 1) {
var that=this;
this._processPromise = this._processPromise.then(function pause() {
return WinJS.Promise.timeout(500)
}).then(function writeCache() {
return that._writeCacheToFile()
})
}
}, _writeCacheToFile: function _writeCacheToFile() {
var len=this._cachedMessages.length;
if (this._fileHandle && this._cachedMessages.length) {
var that=this;
var text="";
for (var i=0; i < len; i++) {
var values=this._cachedMessages[i];
text += [formatTime(values[0]), " : ", values[1], "\r\n"].join("")
}
this._cachedMessages.length = 0;
return Windows.Storage.FileIO.appendTextAsync(that._fileHandle, text)
}
;
return WinJS.Promise.wrap(null)
}
}, {
get: function get(logName, append) {
logName = logName ? logName : "default.log";
var instance=LoggerJS._loggerInstances[logName];
if (!instance) {
instance = new LoggerJS.LocalFileLogger(logName, append);
LoggerJS._loggerInstances[logName] = instance;
LoggerJS._loggerNames.push(logName)
}
;
return instance
}, dispose: function dispose() {
for (var i=LoggerJS._loggerNames.length - 1; i >= 0; i--) {
var logName=LoggerJS._loggerNames[i];
LoggerJS._loggerInstances[logName].dispose()
}
LoggerJS._loggerInstances = {};
LoggerJS._loggerNames = []
}
})});
LoggerJS._loggerInstances = (LoggerJS._loggerInstances ? LoggerJS._loggerInstances : {});
LoggerJS._loggerNames = (LoggerJS._loggerNames ? LoggerJS._loggerNames : [])
})();
(function appexPlatformUtilitiesInit() {
"use strict";
WinJS.Namespace.define("CommonJS.Utils.DateTimeFormatting", {
dateTimeFormat: {
article: 1, panoTile: 2, panoWatermark: 3, video: 4
}, _dateTimeFormatters: {}, registerDateTimeFormatter: function registerDateTimeFormatter(key, formatter) {
CommonJS.Utils.DateTimeFormatting._dateTimeFormatters[key] = formatter
}, unregisterDateTimeFormatter: function unregisterDateTimeFormatter(key) {
CommonJS.Utils.DateTimeFormatting._dateTimeFormatters[key] = null
}, getDateTimeFormatter: function getDateTimeFormatter(key) {
return CommonJS.Utils.DateTimeFormatting._dateTimeFormatters[key]
}
})
})()