/*  © Microsoft. All rights reserved. */
WinJS.Namespace.define('CommonJS', {Version: 'latest'});
(function _CompactCluster_7(WinJS) {
"use strict";
var News=WinJS.Namespace.define("CommonJS.News", {CompactCluster: WinJS.Class.derive(CommonJS.Immersive.ItemsContainer, function _CompactCluster_15(element, options) {
var that=this;
var data=options.data;
for (var i=0; i < data.length; i++) {
data[i].moduleInfo = {
renderer: this._itemRenderer, stripHTML: this._stripHTML
}
}
data.unshift({moduleInfo: {
renderer: this._titleRenderer, isInteractive: true, title: options.title
}});
options.itemDataSource = (new WinJS.Binding.List(data)).dataSource;
options.className = "compactClusterLayout";
CommonJS.Immersive.ItemsContainer.call(this, element, options);
this.element.addEventListener("mousewheel", CommonJS.Immersive.PanoramaPanel.verticalScrollHandler, false)
}, {
dispose: function dispose() {
this.element.removeEventListener("mousewheel", CommonJS.Immersive.PanoramaPanel.verticalScrollHandler);
CommonJS.Immersive.ItemsContainer.prototype.dispose.call(this)
}, _titleRenderer: function _titleRenderer() {
var div=document.createElement("div");
WinJS.Utilities.addClass(div, "compactClusterHeader");
div.innerText = this.title;
return div
}, _itemRenderer: function _itemRenderer(item) {
item = item.data;
var div=document.createElement("div");
WinJS.Utilities.addClass(div, "compactClusterItem");
var title=document.createElement("div");
WinJS.Utilities.addClass(title, "compactClusterTitle");
title.innerHTML = this.stripHTML(item.title);
div.appendChild(title);
var snippet=document.createElement("div");
WinJS.Utilities.addClass(snippet, "compactClusterSnippet");
snippet.innerHTML = this.stripHTML(item.snippet);
div.appendChild(snippet);
if (item.isLocked) {
WinJS.Utilities.addClass(div, "lockedStory")
}
return div
}, _stripHTML: function _stripHTML(string) {
if (string) {
return string.replace(/<(?:.|\n)*?>/gm, "")
}
return ""
}
}, {})})
})(WinJS);
(function _RSSNewsProvider_7() {
"use strict";
WinJS.Namespace.define("CommonJS.NewsRSS", {NewsProvider: WinJS.Class.define(function _RSSNewsProvider_12(options) {
this._feed = options.feed;
this._sourceName = options.sourceName;
this._title = options.title;
this._showProgress = options.showProgress;
this._disableFavIcon = options.disableFavIcon;
this._bypassCache = options.bypassCache;
this._noResultsTile = options.noResultsTile;
this._onsuccess = options.onsuccess;
this._onerror = options.onerror
}, {
_maxArticles: 40, _articles: null, _bypassCache: false, _parser: null, _clusterID: null, title: {get: function get() {
return this._title
}}, articles: {get: function get() {
return this._articles
}}, clusterID: {
get: function get() {
return this._clusterID
}, set: function set(cid) {
this._clusterID = cid
}
}, initializeAsync: function initializeAsync(configuration) {
return WinJS.Promise.wrap({})
}, queryAsync: function queryAsync(query) {
var that=this;
var queryService=new PlatformJS.DataService.QueryService("RSS");
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("url", this._feed);
if (this._showProgress) {
CommonJS.Progress.showProgress(CommonJS.Progress.headerProgressType)
}
var options=new Platform.DataServices.QueryServiceOptions;
options.useExtendedEncoding = true;
options.useCompatDataModel = true;
options.bypassCache = this._bypassCache;
that.layoutCacheInfo = {
cacheKey: queryService.getUrl(urlParams), cacheID: queryService.getCacheID()
};
try {
return queryService.downloadDataAsync(urlParams, null, null, options).then(function _RSSNewsProvider_71(e) {
if (that.layoutCacheInfo && e) {
that.layoutCacheInfo.uniqueResponseID = e.responseId
}
if (that._onsuccess) {
that._onsuccess(e)
}
if (that._showProgress) {
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType)
}
that._articles = that._parseRSSDocument(e.dataString);
if (that.articles.length === 0) {
var message="Failed to parse RSS Feed";
var attributes={
URL: that._feed, Location: "CommonJS.NewsRSS.NewsProvider"
};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logCodeErrorWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.RuntimeEnvironment.javascript, message, null, JSON.stringify(attributes))
}
if (that.articles.length === 0 && that._noResultsTile) {
that.articles.push(that._noResultsTile)
}
return {
native: true, newsItems: that._articles, clusterID: that._clusterID, cacheID: that.layoutCacheInfo.cacheID, dataCacheID: that.layoutCacheInfo.cacheKey, uniqueResponseID: that.layoutCacheInfo.uniqueResponseID
}
}, function _RSSNewsProvider_114(error) {
if (that._onerror) {
that._onerror(error)
}
if (that._showProgress) {
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType)
}
if (PlatformJS.Utilities.isPromiseCanceled(error)) {
return
}
throw error;
})
}
catch(e) {
if (that._showProgress) {
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType)
}
debugger;
return WinJS.Promise.wrap(null)
}
}, _getElementsByTagNames: function _getElementsByTagNames(dom, tagNames) {
if (typeof tagNames === "string") {
tagNames = [tagNames]
}
for (var i=0; i < tagNames.length; i++) {
var tagName=tagNames[i];
var elements=dom.getElementsByTagName(tagName);
if (elements && elements.length > 0) {
return elements
}
}
return null
}, _getElementByTagNames: function _getElementByTagNames(dom, tagNames) {
var elements=this._getElementsByTagNames(dom, tagNames);
if (elements && elements.length > 0) {
return elements[0]
}
return null
}, _parseRSSItem: function _parseRSSItem(dom) {
var article={};
var url,
type,
height,
width;
article.source = this._sourceName;
var pubDate=this._getElementByTagNames(dom, ["pubDate", "published"]);
if (pubDate && pubDate.textContent) {
article.publishTime = CommonJS.Utils.convertRSSTimeToFriendlyTime(pubDate.textContent)
}
else {
article.publishTime = ""
}
article.title = "";
var title=this._getElementByTagNames(dom, "title");
if (title && this._parser) {
try {
var titleDom=this._parser.parseFromString(title.textContent, "text/html");
article.title = this._parseTextNodes(titleDom)
}
catch(e) {}
}
var thumb=this._getElementByTagNames(dom, "media:thumbnail");
if (thumb) {
url = thumb.attributes.getNamedItem("url");
if (url) {
article.thumbnail = {};
article.thumbnail.url = url.textContent;
width = thumb.attributes.getNamedItem("width");
if (width) {
article.thumbnail.width = width.textContent
}
height = thumb.attributes.getNamedItem("height");
if (height) {
article.thumbnail.height = height.textContent
}
}
}
else {
var description=this._getElementByTagNames(dom, "description");
if (description) {
var descriptionImages=this._parseAllImageTagsFromDescription(description),
imageWithWidthAndHeight=this._findFirstImageWithWidthAndHeight(descriptionImages);
if (imageWithWidthAndHeight) {
article.thumbnail = imageWithWidthAndHeight
}
}
}
var enclosures=dom.getElementsByTagName("enclosure");
for (var i=0; i < enclosures.length; i++) {
var enclosure=enclosures[i];
url = enclosure.attributes.getNamedItem("url");
type = enclosure.attributes.getNamedItem("type");
if (url && url.textContent && type && type.textContent && type.textContent.startsWith("image/")) {
if (!article.thumbnail) {
article.thumbnail = {};
article.thumbnail.url = url.textContent
}
break
}
}
var medias=dom.getElementsByTagName("media:content");
for (var k=0; k < medias.length; k++) {
var media=medias[k];
url = media.attributes.getNamedItem("url");
type = media.attributes.getNamedItem("type");
var medium=media.attributes.getNamedItem("medium");
if (url && (type || medium)) {
if ((type && type.textContent.startsWith("image/")) || (medium && (medium.textContent === "image"))) {
width = media.attributes.getNamedItem("width");
if (!width || width.textContent <= 200) {
if (!article.thumbnail) {
article.thumbnail = {};
article.thumbnail.url = url.textContent;
if (width) {
article.thumbnail.width = width.textContent
}
height = media.attributes.getNamedItem("height");
if (height) {
article.thumbnail.height = height.textContent
}
}
}
else {
article.imageUrl = url.textContent
}
}
else if (type && type.textContent === "video/mp4") {
article.videoUrl = url.textContent
}
}
}
article.snippet = "";
var desc=this._getElementByTagNames(dom, ["content:encoded", "description", "summary", "content"]);
if (desc && this._parser) {
article.html = desc.textContent;
try {
var descDom=this._parser.parseFromString(desc.textContent, "text/html");
article.snippet = this._parseTextNodes(descDom)
}
catch(e) {}
}
var link=null,
linkNoRel=null,
linkAlternate=null;
var links=dom.getElementsByTagName("link");
if (links && links.length) {
for (var j=0; j < links.length; j++) {
var rel=links[j].attributes.getNamedItem("rel");
if (!linkNoRel && (!rel || !rel.textContent)) {
linkNoRel = links[j]
}
else if (!linkAlternate && rel && rel.textContent.toLowerCase() === "alternate") {
linkAlternate = links[j]
}
}
}
if (linkNoRel) {
link = linkNoRel
}
else if (linkAlternate) {
link = linkAlternate
}
else if (links && links.length > 0) {
link = links[0]
}
if (link) {
var href=link.attributes.getNamedItem("href");
if (href && href.textContent) {
article.articleUrl = href.textContent
}
else if (link.textContent) {
article.articleUrl = link.textContent
}
article.sourceImageUrl = "";
if (article.articleUrl && !this._disableFavIcon) {
var uri=new Windows.Foundation.Uri(article.articleUrl);
if (uri) {
article.sourceImageUrl = "http://" + uri.host + "/favicon.ico"
}
}
}
if (!article.articleUrl) {
return null
}
if (article.thumbnail && ((article.thumbnail.height && article.thumbnail.height < 100) || (article.thumbnail.width && article.thumbnail.width < 100))) {
article.templateClass = "G";
article.thumbnail = null
}
return article
}, _parseTextNodesWorker: function _parseTextNodesWorker(node) {
var that=this;
var nodeText="";
if (node) {
if (node.nodeType === 3) {
nodeText = node.data
}
else if (node.nodeType === 1 && node.childNodes) {
var nodeTagName=node.tagName.toUpperCase();
if (!(nodeTagName === "SCRIPT") && !(nodeTagName === "STYLE")) {
for (var i=0; i < node.childNodes.length; i++) {
nodeText = nodeText + that._parseTextNodesWorker(node.childNodes[i])
}
}
}
}
return nodeText
}, _parseTextNodes: function _parseTextNodes(root) {
return this._parseTextNodesWorker(root.body)
}, _parseRSSDocument: function _parseRSSDocument(response) {
var articles=[];
if (window.DOMParser) {
this._parser = new window.DOMParser;
var xmlDoc=null;
try {
xmlDoc = this._parser.parseFromString(response, "text/xml")
}
catch(e) {
xmlDoc = null
}
if (xmlDoc) {
var items=this._getElementsByTagNames(xmlDoc, ["item", "entry"]);
if (items) {
for (var i=0; i < items.length && i < this._maxArticles; i++) {
var item=this._parseRSSItem(items[i]);
if (item) {
articles.push(item)
}
}
}
}
}
return articles
}, _parseAllImageTagsFromDescription: function _parseAllImageTagsFromDescription(descriptionNode) {
var imageTags=[];
try {
var descriptionDom=this._parser.parseFromString(descriptionNode.textContent, "text/html"),
nodes=descriptionDom.images;
for (var index in nodes) {
var node=nodes[index];
if (node.tagName && node.tagName.toLowerCase() === "img") {
imageTags.push(node)
}
}
}
catch(e) {}
return imageTags
}, _findFirstImageWithWidthAndHeight: function _findFirstImageWithWidthAndHeight(imageEls) {
var imagesWithWidthAndHeight=this._findImagesWithWidthAndHeight(imageEls);
return (imagesWithWidthAndHeight.length > 0) ? imagesWithWidthAndHeight[0] : null
}, _findImagesWithWidthAndHeight: function _findImagesWithWidthAndHeight(imageEls) {
var imagesWithWidthAndHeight=[],
_parseDimensionsFromImageEl=this._parseDimensionsFromImageEl;
imageEls.forEach(function _RSSNewsProvider_418(imageEl) {
var imageDimensions=_parseDimensionsFromImageEl(imageEl);
if (imageDimensions.width && imageDimensions.height) {
imagesWithWidthAndHeight.push({
url: imageEl.src, width: imageDimensions.width, height: imageDimensions.height
})
}
});
return imagesWithWidthAndHeight
}, _parseDimensionsFromImageEl: function _parseDimensionsFromImageEl(imageEl) {
var dimensions={
width: null, height: null
};
dimensions.width = parseInt(imageEl.width, 10) || parseInt(imageEl.currentStyle.width, 10);
dimensions.height = parseInt(imageEl.height, 10) || parseInt(imageEl.currentStyle.height, 10);
return dimensions
}
})})
})();
(function _DefaultFinanceSportsConfig_1() {
"use strict";
WinJS.Namespace.define("CommonJS.News.EntityClusterConfig.DefaultFinanceSports", {
TemplateClassMap: {
A: {
classID: "A", aspectRatioMin: 1.3, aspectRatioMax: 1.9, type: "News", templateList: ["Large_Landscape_2col_3row", "Medium_Landscape_1col_3row", "None_1col_1row"]
}, I: {
classID: "I", aspectRatioMin: 0.9, aspectRatioMax: 1.3, type: "News", templateList: ["Medium_Square_1col_3row", "None_1col_1row"]
}, C: {
classID: "C", aspectRatioMin: 0.5, aspectRatioMax: 0.9, type: "News", templateList: ["Medium_Portrait_1col_4row", "None_1col_1row"]
}, B: {replacementClass: "A"}, E: {replacementClass: "I"}, F: {
classID: "F", aspectRatioMin: 0, aspectRatioMax: 0, type: "News", templateList: ["None_1col_1row"]
}, G: {replacementClass: "A"}, H: {replacementClass: "A"}, P: {
classID: "P", aspectRatioMin: 0, aspectRatioMax: 0, type: "Pano", templateList: ["Small_Pano_1col_1row", ]
}, PS: {
classID: "PS", aspectRatioMin: 0, aspectRatioMax: 0, type: "Photosynth", templateList: ["Small_Photosynth_1col_1row", ]
}, S: {
classID: "S", aspectRatioMin: 0, aspectRatioMax: 0, type: "Slideshow", templateList: ["Large_Slideshow_2col_4row", "Medium_Slideshow_1col_2row", "Small_Slideshow_Fullbleed_1col_1row"]
}, SF: {
classID: "SF", aspectRatioMin: 0, aspectRatioMax: 0, type: "Slideshow", templateList: ["Small_Slideshow_Fullbleed_1col_1row", ]
}, V: {
classID: "V", aspectRatioMin: 0, aspectRatioMax: 0, type: "Video", templateList: ["Large_Video_2col_4row", "Medium_Video_1col_2row", "Small_Video_Fullbleed_1col_1row"]
}, VF: {
classID: "VF", aspectRatioMin: 0, aspectRatioMax: 0, type: "Video", templateList: ["Small_Video_Fullbleed_1col_1row", ]
}, V1: {
classID: "V1", aspectRatioMin: 0, aspectRatioMax: 0, type: "VideoCluster", templateList: ["Medium_videoCluster", "Small_videoCluster"]
}, V2: {replacementClass: "V1"}, Z1: {replacementClass: "I"}, Z2: {replacementClass: "A"}, M: {
classID: "M", aspectRatioMin: 0, aspectRatioMax: 0, type: "News", templateList: ["Large_Landscape_2col_3row", "Medium_Landscape_1col_3row", "Medium_Square_1col_3row", "Medium_Portrait_1col_4row", "None_1col_1row"]
}, MV: {
classID: "MV", aspectRatioMin: 0, aspectRatioMax: 0, type: "Video", templateList: ["Large_Video_2col_4row", "Medium_Video_1col_2row", "Small_Video_Fullbleed_1col_1row"]
}, MS: {
classID: "MS", aspectRatioMin: 0, aspectRatioMax: 0, type: "Slideshow", templateList: ["Medium_Slideshow_1col_2row", "Small_Slideshow_Fullbleed_1col_1row"]
}
}, TemplateDefinitions: {
Medium_Square_1col_3row: {
classID: "Medium_Square_1col_3row", thumbnailHeight: 260, thumbnailWidth: 260, height: 3, width: 1, minHeight: 410, lastResort: false
}, Large_Landscape_2col_3row: {
classID: "Large_Landscape_2col_3row", thumbnailHeight: 406, thumbnailWidth: 610, height: 3, width: 2, minHeight: 440, lastResort: false
}, Medium_Landscape_1col_3row: {
classID: "Medium_Landscape_1col_3row", thumbnailHeight: 174, thumbnailWidth: 260, height: 3, width: 1, minHeight: 330, lastResort: false
}, Medium_Portrait_1col_4row: {
classID: "Medium_Portrait_1col_4row", thumbnailHeight: 390, thumbnailWidth: 260, height: 4, width: 1, minHeight: 590, lastResort: false, weight: 2
}, None_1col_1row: {
classID: "None_1col_1row", thumbnailHeight: 0, thumbnailWidth: 0, height: 1, width: 1, minHeight: 140, lastResort: true, noThumbnail: true
}, Small_Headline: {
classID: "Small_Headline", thumbnailHeight: 64, thumbnailWidth: 64, height: 2, width: 1, minHeight: 100, lastResort: true
}, Large_Slideshow_2col_4row: {
classID: "Large_Slideshow_2col_4row", thumbnailHeight: 380, thumbnailWidth: 570, height: 4, width: 2, type: "Slideshow", minHeight: 400, lastResort: false, weight: 2
}, Medium_Slideshow_1col_2row: {
classID: "Medium_Slideshow_1col_2row", thumbnailHeight: 140, thumbnailWidth: 260, height: 2, width: 1, type: "Slideshow", minHeight: 330, lastResort: false
}, Small_Slideshow_Fullbleed_1col_1row: {
classID: "Small_Slideshow_Fullbleed_1col_1row", thumbnailHeight: 180, thumbnailWidth: 360, height: 1, width: 1, type: "Slideshow", minHeight: 140, lastResort: true
}, Large_Video_2col_4row: {
classID: "Large_Video_2col_4row", thumbnailHeight: 380, thumbnailWidth: 570, height: 4, width: 2, minHeight: 400, lastResort: false, weight: 2, type: "Video"
}, Medium_Video_1col_2row: {
classID: "Medium_Video_1col_2row", thumbnailHeight: 140, thumbnailWidth: 260, height: 2, width: 1, type: "Video", minHeight: 330, lastResort: false
}, Small_Video_Fullbleed_1col_1row: {
classID: "Small_Video_Fullbleed_1col_1row", thumbnailHeight: 180, thumbnailWidth: 360, height: 1, width: 1, type: "Video", minHeight: 140, lastResort: true
}, Small_Photosynth_1col_1row: {
classID: "Small_Photosynth_1col_1row", thumbnailHeight: 114, thumbnailWidth: 280, height: 1, width: 1, minHeight: 140, lastResort: false
}, Small_Pano_1col_1row: {
classID: "Small_Pano_1col_1row", thumbnailHeight: 114, thumbnailWidth: 280, height: 1, width: 1, type: "Pano", minHeight: 140, lastResort: false
}, Medium_videoCluster: {
classID: "Medium_videoCluster", thumbnailHeight: 290, thumbnailWidth: 450, height: 2, width: 2, type: "Video", minHeight: 290, lastResort: false
}, Small_videoCluster: {
classID: "Small_videoCluster", thumbnailHeight: 140, thumbnailWidth: 220, height: 1, width: 1, type: "Video", minHeight: 140, lastResort: true
}
}, headlineClassInfo: {newsCluster: "Small_Headline"}
})
})();
(function _DefaultNewsConfig_1() {
"use strict";
WinJS.Namespace.define("CommonJS.News.EntityClusterConfig.DefaultNews", {
TemplateClassMap: {
A: {
classID: "A", aspectRatioMin: 1.3, aspectRatioMax: 1.9, type: "News", templateList: ["Large_Landscape_2col_3row", "Medium_Landscape_1col_3row", "None_1col_1row"]
}, I: {
classID: "I", aspectRatioMin: 0.9, aspectRatioMax: 1.3, type: "News", templateList: ["Medium_Square_1col_3row", "None_1col_1row"]
}, C: {
classID: "C", aspectRatioMin: 0.5, aspectRatioMax: 0.9, type: "News", templateList: ["Medium_Portrait_1col_4row", "None_1col_1row"]
}, B: {replacementClass: "A"}, E: {replacementClass: "I"}, F: {
classID: "F", aspectRatioMin: 0, aspectRatioMax: 0, type: "News", templateList: ["None_1col_1row"]
}, G: {replacementClass: "A"}, H: {replacementClass: "A"}, S: {
classID: "S", aspectRatioMin: 0, aspectRatioMax: 0, type: "Slideshow", templateList: ["Large_Slideshow_2col_4row", "Medium_Slideshow_1col_2row", "Small_Slideshow_Fullbleed_1col_1row"]
}, V: {
classID: "V", aspectRatioMin: 0, aspectRatioMax: 0, type: "Video", templateList: ["Large_Video_2col_4row", "Medium_Video_1col_2row", "Small_Video_Fullbleed_1col_1row"]
}, V1: {
classID: "V1", aspectRatioMin: 0, aspectRatioMax: 0, type: "VideoCluster", templateList: ["Medium_videoCluster", "Small_videoCluster"]
}, V2: {replacementClass: "V1"}, AP_breaking: {
classID: "AP_breaking", aspectRatioMin: 0, aspectRatioMax: 0, type: "AP", templateList: ["None_Breaking_AP"]
}, AP_nonbreaking: {
classID: "AP_nonbreaking", aspectRatioMin: 0, aspectRatioMax: 0, type: "AP", templateList: ["Medium_AP", "None_AP"]
}, AP_bigstories: {
classID: "AP_bigstories", aspectRatioMin: 0, aspectRatioMax: 0, type: "AP", templateList: ["Medium_AP_1col_1row"]
}, S2: {
classID: "S2", aspectRatioMin: 0, aspectRatioMax: 0, type: "Slideshow", templateList: ["Medium_slideshowCluster"]
}
}, TemplateDefinitions: {
Medium_AP: {
classID: "Medium_AP", thumbnailHeight: 160, thumbnailWidth: 260, height: 4, width: 1, minHeight: 600, isNonFlexible: true, lastResort: false
}, None_AP: {
classID: "None_AP", thumbnailHeight: 0, thumbnailWidth: 0, height: 4, width: 1, minHeight: 600, isNonFlexible: true, lastResort: true, noThumbnail: true
}, None_Breaking_AP: {
classID: "None_Breaking_AP", thumbnailHeight: 0, thumbnailWidth: 0, height: 4, width: 1, minHeight: 600, lastResort: false, isNonFlexible: true, noThumbnail: true
}, Medium_AP_1col_1row: {
classID: "Medium_AP_1col_1row", thumbnailHeight: 406, thumbnailWidth: 610, height: 3, width: 2, minHeight: 450, lastResort: false, isNonFlexible: true
}, Medium_Square_1col_3row: {
classID: "Medium_Square_1col_3row", thumbnailHeight: 280, thumbnailWidth: 280, height: 3, width: 1, minHeight: 350, weight: 2, lastResort: false
}, Large_Landscape_2col_3row: {
classID: "Large_Landscape_2col_3row", thumbnailHeight: 393, thumbnailWidth: 590, height: 3, width: 2, minHeight: 440, lastResort: false
}, Medium_Landscape_1col_3row: {
classID: "Medium_Landscape_1col_3row", thumbnailHeight: 187, thumbnailWidth: 280, height: 3, width: 1, minHeight: 310, lastResort: false
}, Medium_Portrait_1col_4row: {
classID: "Medium_Portrait_1col_4row", thumbnailHeight: 420, thumbnailWidth: 280, height: 4, width: 1, minHeight: 590, lastResort: false, weight: 2
}, None_1col_1row: {
classID: "None_1col_1row", thumbnailHeight: 0, thumbnailWidth: 0, height: 1, width: 1, minHeight: 140, lastResort: true, noThumbnail: true
}, Small_Headline: {
classID: "Small_Headline", thumbnailHeight: 64, thumbnailWidth: 64, height: 2, width: 1, minHeight: 100, lastResort: true
}, Large_Slideshow_2col_4row: {
classID: "Large_Slideshow_2col_4row", thumbnailHeight: 393, thumbnailWidth: 590, height: 4, width: 2, minHeight: 400, lastResort: false, weight: 2, type: "Slideshow"
}, Medium_Slideshow_1col_2row: {
classID: "Medium_Slideshow_1col_2row", thumbnailHeight: 151, thumbnailWidth: 280, height: 2, width: 1, type: "Slideshow", minHeight: 290, lastResort: false
}, Small_Slideshow_Fullbleed_1col_1row: {
classID: "Small_Slideshow_Fullbleed_1col_1row", thumbnailHeight: 180, thumbnailWidth: 360, height: 1, width: 1, type: "Slideshow", minHeight: 140, lastResort: true
}, Large_Video_2col_4row: {
classID: "Large_Video_2col_4row", thumbnailHeight: 382, thumbnailWidth: 590, height: 4, width: 2, minHeight: 400, lastResort: false, weight: 2, type: "Video"
}, Medium_Video_1col_2row: {
classID: "Medium_Video_1col_2row", thumbnailHeight: 151, thumbnailWidth: 280, height: 2, width: 1, type: "Video", minHeight: 330, lastResort: false
}, Small_Video_Fullbleed_1col_1row: {
classID: "Small_Video_Fullbleed_1col_1row", thumbnailHeight: 180, thumbnailWidth: 360, height: 1, width: 1, type: "Video", minHeight: 140, lastResort: true
}, Medium_videoCluster: {
classID: "Medium_videoCluster", thumbnailHeight: 290, thumbnailWidth: 450, height: 2, width: 2, type: "Video", minHeight: 290, lastResort: false
}, Small_videoCluster: {
classID: "Small_videoCluster", thumbnailHeight: 140, thumbnailWidth: 220, height: 1, width: 1, type: "Video", minHeight: 140, lastResort: true
}, Medium_slideshowCluster: {
classID: "Medium_slideshowCluster", thumbnailHeight: 290, thumbnailWidth: 450, height: 2, width: 2, type: "Slideshow", minHeight: 290, lastResort: true
}
}, headlineClassInfo: {newsCluster: "Small_Headline"}
})
})();
(function _ProcessListener_8(WinJS) {
"use strict";
var News=WinJS.Namespace.define("CommonJS.News", {ProcessListener: WinJS.Class.mix(WinJS.Class.define(function _ProcessListener_13() {
if (PlatformJS.isPlatformInitialized) {
this._populateSupplementalConfig()
}
}, {
_updateCustomCSS: function _updateCustomCSS() {
var config=CommonJS.News.SupplementalConfig;
if (config && config.CSS) {
var element=document.getElementById("EntityClusterSupplementalStyles");
if (!element) {
element = document.createElement("style");
element.id = "EntityClusterSupplementalStyles";
element.type = "text/css";
element.setAttribute("data-version", config.Version);
element.sheet.cssText = toStaticHTML(config.CSS);
document.body.appendChild(element)
}
else {
var versionAttribute=element.getAttribute("data-version");
if (versionAttribute !== config.Version) {
element.sheet.cssText = toStaticHTML(config.CSS);
element.setAttribute("data-version", config.Version)
}
}
}
}, _handleJSON: function _handleJSON(jsonString) {
if (jsonString) {
var json=JSON.parse(jsonString);
CommonJS.News.SupplementalConfig = json;
this._updateCustomCSS()
}
}, _populateSupplementalConfig: function _populateSupplementalConfig() {
var that=this;
var primaryConfigUrl=PlatformJS.Services.configuration.getDictionary("EntityClusterConfig").getString("SupplementalConfigURLPrimary");
if (primaryConfigUrl) {
this._fetchContent(primaryConfigUrl).then(function _ProcessListener_56(data) {
if (data && !data.isCachedResponse) {
that._handleJSON(data.dataString)
}
}, function _ProcessListener_61(error) {
var secondaryConfigUrl=PlatformJS.Services.configuration.getDictionary("EntityClusterConfig").getString("SupplementalConfigURLSecondary");
if (secondaryConfigUrl) {
that._fetchContent(secondaryConfigUrl).then(function _ProcessListener_66(data) {
if (data && !data.isCachedResponse) {
that._handleJSON(data.dataString)
}
}, null, function _ProcessListener_72(data) {
if (data && data.cachedResponse) {
that._handleJSON(data.cachedResponse.dataString)
}
})
}
}, function _ProcessListener_79(data) {
if (data && data.cachedResponse) {
that._handleJSON(data.cachedResponse.dataString)
}
})
}
}, _fetchContent: function _fetchContent(url) {
var dataSource="CustomEntityClusterConfig";
var service=new PlatformJS.DataService.QueryService(dataSource);
var urlParams=PlatformJS.Collections.createStringDictionary();
if (url) {
urlParams["url"] = url
}
var options=new Platform.DataServices.QueryServiceOptions;
options.bypassCache = false;
options.useCompactDataModel = true;
var that=this;
return service.downloadDataAsync(urlParams, null, null, options)
}, onPlatformInitialized: function onPlatformInitialized(event){}, onSuspending: function onSuspending(event){}, onCheckpoint: function onCheckpoint(event){}, onResuming: function onResuming(event) {
this._populateSupplementalConfig()
}, onActivated: function onActivated(event){}
}, {SupplementalConfig: null}), WinJS.UI.DOMEventMixin)})
})(WinJS);
(function FlexEntityCluster_init(WinJS) {
"use strict";
var defaultThumbnailHeight=64;
var defaultThumbnailWidth=64;
var noop=function(){};
var imagelog=function(text) {
if (!PlatformJS.isDebug) {
imagelog = noop;
return
}
var __logger=LoggerJS.LocalFileLogger.get("image.log");
imagelog = __logger.write.bind(__logger);
imagelog(text)
};
var isFavIcon=function(url) {
return url && url.toLowerCase().indexOf("client=favicon.ico") > -1
};
var logUrl=function(label, url) {
if (!PlatformJS.isDebug) {
logUrl = noop;
return
}
if (!isFavIcon(url)) {
imagelog(label + url)
}
};
var logImageSource=function(imageSource) {
if (!PlatformJS.isDebug) {
logImageSource = noop;
return
}
if (typeof imageSource === "string") {
logUrl("url   :", imageSource);
return
}
logUrl("low   :", imageSource.lowResolutionUrl);
logUrl("high  :", imageSource.highResolutionUrl);
logUrl("single:", imageSource.url)
};
var logImage=function(text, url, width, height, mode) {
if (!PlatformJS.isDebug) {
logImage = noop;
return
}
if (!isFavIcon(url)) {
imagelog("getResizedImageUrlWithMode {0}  {1}x{2} {3} {4}".format(url, width, height, mode, text))
}
};
var NV=CommonJS.NavigableView;
var RENDER_COMPLETE="rendercomplete";
var ERROR="error";
var ITEM_CLICK="itemclick";
var SEE_MORE_CLICK="seemoreclick";
var DEBUG=PlatformJS.isDebug;
if (PlatformJS.mainProcessManager) {
PlatformJS.mainProcessManager._processListeners.push(new CommonJS.News.ProcessListener)
}
var nextUniqueID=1;
var getNextUniqueId=function() {
return nextUniqueID++
};
var News=WinJS.Namespace.define("CommonJS.News", {
EntityCluster: WinJS.Class.mix(WinJS.Class.define(function EntityCluster_ctor(domElement, options) {
this._imageCardOptions = [];
this._videoOptions = [];
this._elements = [];
this._progressElt = null;
this._errorElt = null;
domElement.winControl = this;
this._domElement = domElement;
CommonJS.Utils.markDisposable(domElement);
WinJS.Utilities.addClass(domElement, options.theme || "");
WinJS.Utilities.addClass(domElement, CommonJS.RESPONSIVE_RESIZABLE_CLASS);
if (options.clusterAutomationId) {
CommonJS.setAutomationId(this._domElement, null, null, options.clusterAutomationId)
}
Object.defineProperties(this, WinJS.Utilities.createEventProperties(ITEM_CLICK));
Object.defineProperties(this, WinJS.Utilities.createEventProperties(SEE_MORE_CLICK));
Object.defineProperties(this, WinJS.Utilities.createEventProperties(RENDER_COMPLETE));
Object.defineProperties(this, WinJS.Utilities.createEventProperties(ERROR));
this._registerItemClickProxy();
this._unitWidth = options.unitWidth > 0 ? options.unitWidth : 0;
this._configKey = options.configKey ? options.configKey : "EntityClusterDefaultNewsConfig";
this._noResultsMessage = options.noResultsMessage ? options.noResultsMessage : PlatformJS.Services.resourceLoader.getString("/platform/invalidEntry");
var maxColumnCount=this._maxColumnCount = options.maxColumnCount;
if (options.marginDistance || options.marginWidth || options.adUnitId) {
debugger
}
this._categoryName = options.categoryName;
this._categoryKey = options.categoryKey;
this._subcategory = options.subcategory;
this._providerId = options.providerId;
this._adLayoutOverrideKey = options.adLayoutOverrideKey;
this._showInClusterAd = options.showInClusterAd;
this._adsList = options.adsList;
this._showHeadlineList = options.showHeadlineList === false ? false : true;
this._keepSetImageSizes = !!options.keepSetImageSizes;
var wrapper=this._containerWrapper = document.createElement("div");
wrapper.className = "entityClusterGridWrapper";
this._container = document.createElement("div");
this._container.className = "ecFlexWrapper";
this._container.id = NV.createItemId();
this._adsWrapperControlList = [];
var defaultmaxLargeItemHeadlineLength=CommonJS.News.EntityCluster.DefaultLargeItemMaxHeadlineLength;
this._maxLargeItemHeadlineLength = PlatformJS.BootCache.instance.getEntry("BC_ECLargeItemMaxHeadlineLength", function getECLargeItemMaxHeadlineLength() {
return PlatformJS.Services.configuration ? PlatformJS.Services.configuration.getInt32("ECLargeItemMaxHeadlineLength", defaultmaxLargeItemHeadlineLength) : defaultmaxLargeItemHeadlineLength
});
if (options.mode === News.ClusterMode.dynamic && !options.provider) {
options.provider = new News.NewsProvider
}
var cluster=PlatformJS.Utilities.getAncestorByClassName(domElement, "platformCluster");
if (cluster) {
var clusterLabelledBy=cluster.getAttribute("aria-labelledby");
if (clusterLabelledBy !== "") {
domElement.setAttribute("role", "listbox");
domElement.setAttribute("aria-labelledby", clusterLabelledBy)
}
}
this._templateClassMap = options.configObject.TemplateClassMap;
this._templateDefinitions = options.configObject.TemplateDefinitions;
this._headlineClassInfo = options.configObject.headlineClassInfo;
this._instrumentationEntryPoint = options.instrumentationEntryPoint;
this._categoryContainsMore = options.categoryContainsMore;
var enableSeeMore=this._enableSeeMore = options.enableSeeMore;
if (enableSeeMore) {
if (PlatformJS.isDebug) {
if (maxColumnCount === undefined || maxColumnCount === null) {
throw"EntityCluster: When options.enableSeeMore is set to true, options.maxColumnCount must be provided as an integer.";
}
}
if (options.onseemoreclick) {
this._seeMoreHandler = options.onseemoreclick;
this._forceShowSeeMore = options.forceShowSeeMore
}
else {
this._enableSeeMore = false
}
}
if (options.onitemclick) {
this._itemClickHandler = options.onitemclick
}
if (this.retryHandler) {
this.addEventListener("retry", this.retryHandler)
}
WinJS.UI.setOptions(this, options)
}, {
_scheduler: null, _domElement: null, _elements: null, onitemclick: null, onretry: null, onrendercomplete: null, onerror: null, _progressElt: null, _errorElt: null, _newsItems: null, _uniqueID: null, _lastPromise: null, _templateDefinitions: null, _templateClassMap: null, _configKey: null, _noResultsElt: null, _navigableViewOrchestrator: null, _currentHeight: null, _currentWidth: null, _instrumentationEntryPoint: null, _debugTemplateSelectorData: null, _supplementalConfigCacheKey: null, _enableSeeMore: null, _categoryName: null, _categoryKey: null, _subcategory: null, _providerId: null, _adLayoutOverrideKey: null, _maxColumnCount: null, _isResponsive: true, _layout: null, _imageCardOptions: null, _videoOptions: null, _showHeadlineList: true, _adsWrapperControlList: null, _headlineMinHeight: 0, _headlineClassInfo: null, _itemWrappers: null, _categoryContainsMore: false, _isDisposed: false, _inClusterAdUnitId: null, _showInClusterAd: false, _keepSetImageSizes: false, _maxLargeItemHeadlineLength: 0, _forceShowSeeMore: false, scheduler: {
get: function get() {
return this._scheduler
}, set: function set(value) {
this._scheduler = value
}
}, isResponsive: {
get: function get() {
return this._isResponsive
}, set: function set(value) {
if (value === false) {
this._isResponsive = value
}
}
}, newsItems: {get: function get() {
return this._newsItems
}}, onWindowResize: function onWindowResize(event) {
CommonJS.WindowEventManager.HandleWindowResizeEvent.call(this, event, function HandleWindowResize() {
var displayData=PlatformJS.Utilities.getDisplayData();
var orientationString=this._getResultOrientation();
var layoutWindowSize=this._layout && this._layout[orientationString] ? this._layout[orientationString].windowSize : null;
var shouldRedraw=false;
var adjustDOM=false;
var detail=event.detail || event.platFormDetail;
if (!layoutWindowSize || (layoutWindowSize.height !== displayData.clientHeight)) {
shouldRedraw = true
}
else if (layoutWindowSize.width === displayData.clientWidth) {
adjustDOM = true
}
if (shouldRedraw) {
this._renderResponse(this._response)
}
else if (adjustDOM) {
this._clearStyleElement();
this._renderDOM(this._layout, this._itemWrappers, this._videoList)
}
})
}, _getResultOrientation: function _getResultOrientation() {
var orientationEnum=Windows.UI.ViewManagement.ApplicationViewOrientation;
var displayData=PlatformJS.Utilities.getDisplayData();
var resultOrientation=displayData.isFullScreen ? displayData.orientation : orientationEnum.landscape;
var orientationString=Object.keys(orientationEnum)[resultOrientation];
return orientationString
}, _registerItemClickProxy: function _registerItemClickProxy() {
var that=this;
PlatformJS.Utilities.registerItemClickProxy(this._domElement, function registerItemClickProxy_predicate(element) {
return WinJS.Utilities.hasClass(element, "entityCluster")
}, function registerItemClickProxy_completion(element) {
if (that._isDisposed) {
return
}
var index=element.getAttribute("data-index");
if (DEBUG && index >= 0 && CommonJS.News.EntityCluster.TemplateSelectorDebuggingEnabled) {
that._handleDebugOnClick(index, element)
}
else {
var isSeeMore=WinJS.Utilities.hasClass(element, "seeMore");
if (isSeeMore) {
that.dispatchEvent(SEE_MORE_CLICK, {
categoryKey: that._categoryKey, subcategory: that._subcategory, providerId: that._providerId
})
}
else {
var itemWrappers=that._itemWrappers;
if (itemWrappers) {
var item=itemWrappers[index].item;
that.dispatchEvent(ITEM_CLICK, {item: item})
}
}
}
}, {actionContext: "Cluster"})
}, dispose: function dispose() {
if (this._isDisposed) {
return
}
this._isDisposed = true;
var lastPromise=this._lastPromise;
if (lastPromise) {
lastPromise.cancel();
this._lastPromise = null
}
var renderingPromise=this._renderingPromise;
if (renderingPromise) {
renderingPromise.cancel();
this._renderingPromise = null
}
this._disablePointerUpDownAnimations();
this._itemWrappers = null;
this._videoList = null;
this._elements = null;
var containerWrapper=this._containerWrapper;
if (containerWrapper) {
WinJS.Utilities.disposeSubTree(containerWrapper);
this._containerWrapper = null
}
if (this._container) {
this._container = null
}
var itemClickHandler=this._itemClickHandler;
if (itemClickHandler) {
this.removeEventListener("itemclick", itemClickHandler);
this._itemClickHandler = null
}
var seeMoreHandler=this._seeMoreHandler;
if (seeMoreHandler) {
this.removeEventListener("seemoreclick", seeMoreHandler);
this._seeMoreHandler = null
}
var retryHandler=this.retryHandler;
if (retryHandler) {
this.removeEventListener("retry", retryHandler);
this.retryHandler = null
}
var ecDebugApplyButton=document.getElementById("ecEditApply");
if (ecDebugApplyButton) {
ecDebugApplyButton.removeEventListener("click", this._debugFlyoutTemplateApply);
this._debugFlyoutTemplateApply = null
}
var navigableViewOrchestrator=this._navigableViewOrchestrator;
if (navigableViewOrchestrator) {
navigableViewOrchestrator.dispose();
this._navigableViewOrchestrator = null
}
this._clearAdControls();
this._clearStyleElement();
this._adsWrapperControlList = null;
this._domElement.winControl = null;
this._domElement = null
}, render: function render() {
this._uniqueID = this._categoryKey + ":" + this._categoryName + ":" + getNextUniqueId();
var that=this;
msWriteProfilerMark("CommonControls:EntityCluster:render:" + this._uniqueID + ":s");
return new WinJS.Promise(function FlexEntityCluster_render(c, e, p) {
that._renderImpl(c, e, p)
})
}, _renderImpl: function _renderImpl(complete, error, progress) {
if (this._isDisposed) {
return
}
var that=this;
var mode=this.mode;
var cachedResponseRendered=false;
msWriteProfilerMark("CommonControls:EntityCluster:getNewsItems:s");
this._lastPromise = CommonJS.SchedulePromise(this._scheduler, CommonJS.TaskPriority.normal, "EntityCluster:RenderImpl:FetchData");
this._lastPromise.then(function renderImplRequest() {
if (that._isDisposed) {
return
}
return (mode === News.ClusterMode.dynamic) ? that._queryProviderAsync() : WinJS.Promise.wrap(that.dataSet || [])
}).then(function FlexEntityCluster_fetchComplete(response) {
if (that._isDisposed) {
return
}
that._response = response;
if (response && !(response.isCachedResponse || response.serverResponseNotModified) || !cachedResponseRendered) {
var previousPromise=that._renderingPromise ? that._renderingPromise : WinJS.Promise.wrap(null);
that._renderingPromise = previousPromise.then(function FlexEntityCluster_prevRenderComplete() {
that._renderResponse(response).then(function FlexEntityCluster_renderComplete() {
complete()
}, function FlexEntityCluster_renderError(err) {
if (!PlatformJS.Utilities.isPromiseCanceled(err)) {
that._renderError(err)
}
complete()
})
}, function FlexEntityCluster_prevRenderError(err) {
if (!PlatformJS.Utilities.isPromiseCanceled(err)) {
that._renderError(err)
}
complete()
})
}
else {
that._renderingPromise = that._renderingPromise.then(function FlexEntityCluster_renderCompleteNoOp() {
complete()
})
}
}, function FlexEntityCluster_fetchError(err) {
var previousPromise=that._renderingPromise ? that._renderingPromise : WinJS.Promise.wrap(null);
that._renderingPromise = previousPromise.then(function FlexEntityCluster_fetchError1() {
if (!PlatformJS.Utilities.isPromiseCanceled(err)) {
that._renderError(err)
}
complete()
})
}, function FlexEntityCluster_fetchProgress(response) {
cachedResponseRendered = true;
that._response = response;
var previousPromise=that._renderingPromise ? that._renderingPromise : WinJS.Promise.wrap(null);
that._renderingPromise = previousPromise.then(function FlexEntityCluster_fetchProgress1() {
return that._renderResponse(response)
})
})
}, _renderResponse: function _renderResponse(response) {
if (this._isDisposed) {
return
}
msWriteProfilerMark("CommonControls:EntityCluster:getNewsItems:e");
var that=this;
var newsItems=this._newsItems = this._discardHeroItems(response ? response.newsItems : null);
if (!newsItems || newsItems.length === 0) {
this._showNoResults();
return WinJS.Promise.wrap(null)
}
if (!this.cacheID && response.dataCacheID && response.cacheID) {
this.cacheID = response.cacheID
}
this._addSupplementalConfigs();
this._createDebugData(newsItems);
this._itemWrappers = this._createNewsItemsWrapper(newsItems, response);
this._videoList = this._createVideoList(this._itemWrappers);
var key=response.clusterID ? [response.clusterID, "_", response.dataCacheID].join("") : response.dataCacheID;
key = response.uniqueResponseID ? [key, "_", response.uniqueResponseID].join("") : key;
return this._layoutGeneration(this._itemWrappers, response.dataCacheID, key).then(function renderResponseSchedulerComplete(layout) {
msWriteProfilerMark("CommonControls:EntityCluster:generateLayoutNormal:e");
if (layout && that._itemWrappers && that._videoList) {
that._layout = layout;
return that._renderDOM(layout, that._itemWrappers, that._videoList)
}
return WinJS.Promise.wrap(null)
})
}, _discardHeroItems: function _discardHeroItems(newsItems) {
if (!newsItems) {
return null
}
var heroIndexes=[];
for (var index=0; index < newsItems.length; index++) {
if (newsItems[index].entityType === "Hero" || newsItems[index].entityType === "SubHero") {
heroIndexes.push(index)
}
}
for (var index=heroIndexes.length - 1; index >= 0; index--) {
newsItems.splice(heroIndexes[index], 1)
}
return newsItems
}, _layoutGeneration: function _layoutGeneration(newsItems, dataCacheID, key) {
var that=this;
return CommonJS.SchedulePromise(this._scheduler, CommonJS.TaskPriority.normal, "EntityCluster:RenderResponse:GenerateLayout").then(function layoutGeneration() {
msWriteProfilerMark("CommonControls:EntityCluster:generateLayoutNormal:s");
return that._getLayout(newsItems, dataCacheID, key)
})
}, _getLayout: function _getLayout(newsItems, dataCacheID, key) {
var that=this;
var response=this._response;
msWriteProfilerMark("CommonControls:EntityCluster:getLayout:s");
if (this.cacheID && dataCacheID && response.uniqueResponseID && !response.isLocalResponse) {
var layoutKey=this._generateLayoutCacheKey(key);
try {
return PlatformJS.Cache.CacheService.getInstance(this.cacheID).findEntry(layoutKey).then(function getLayoutCacheFind(cachedData) {
var regenerateLayout=false;
if (!News.EntityCluster.isInClusterAdLoaded) {
if (that._showInClusterAd && PlatformJS.isPlatformInitialized) {
var adsConfig=PlatformJS.Ads.getEntityClusterConfig(that._categoryKey, that._subcategory, that._providerId);
if (adsConfig && adsConfig.adUnitId) {
that._inClusterAdUnitId = adsConfig.adUnitId;
News.EntityCluster.isInClusterAdLoaded = true;
regenerateLayout = true
}
}
}
if (!cachedData || regenerateLayout) {
return that._createLayout(newsItems).then(function FlexEntityCluster_createLayoutComplete1(layout) {
PlatformJS.Cache.CacheService.getInstance(that.cacheID).addEntry(layoutKey, layout);
msWriteProfilerMark("CommonControls:EntityCluster:getLayout:e");
return WinJS.Promise.wrap(layout)
})
}
else {
msWriteProfilerMark("CommonControls:EntityCluster:getLayout:e");
return WinJS.Promise.wrap(cachedData.dataValue)
}
})
}
catch(e) {
return this._createLayout(newsItems).then(function FlexEntityCluster_createLayoutComplete2(layout) {
msWriteProfilerMark("CommonControls:EntityCluster:getLayout:e");
return layout
})
}
}
else {
return this._createLayout(newsItems).then(function FlexEntityCluster_createLayoutComplete3(layout) {
msWriteProfilerMark("CommonControls:EntityCluster:getLayout:e");
return layout
})
}
}, _createLayout: function _createLayout(newsItems) {
var templateValues=this._createTemplateSelectorOutput(newsItems);
var displayData=PlatformJS.Utilities.getDisplayData();
this._currentHeight = displayData.clientHeight;
this._currentWidth = displayData.clientWidth;
if (this._showInClusterAd && PlatformJS.isPlatformInitialized) {
var adsConfig=PlatformJS.Ads.getEntityClusterConfig(this._categoryKey, this._subcategory, this._providerId);
this._inClusterAdUnitId = adsConfig ? adsConfig.adUnitId : null
}
var offset=this.heightOffset ? this.heightOffset : 168;
var layoutOptions={};
layoutOptions.configObj = this.configObject;
layoutOptions.unitWidth = this._getDefaultUnitWidth();
layoutOptions.unitHeight = this._getDefaultUnitHeight();
layoutOptions.offset = offset;
layoutOptions.enableSeeMore = this._enableSeeMore;
layoutOptions.maxColumnCount = this._maxColumnCount;
layoutOptions.showHeadlineList = this._showHeadlineList && !this._isSpecialCluster();
layoutOptions.forceShowSeeMore = this._forceShowSeeMore;
layoutOptions.isFlexCluster = this._isFlexCluster();
layoutOptions.inClusterAdUnitId = this._inClusterAdUnitId;
if (layoutOptions.showHeadlineList && this._headlineClassInfo) {
var headlineClassName=this._headlineClassInfo.newsCluster;
var headlineMinHeight=headlineClassName && this._templateDefinitions[headlineClassName] ? this._templateDefinitions[headlineClassName].minHeight : 140;
layoutOptions.headlineClassName = headlineClassName;
layoutOptions.headlineMinHeight = headlineMinHeight
}
layoutOptions.adLayoutOverrideKey = this._adLayoutOverrideKey;
var layoutObject=CommonJS.News.OrientationLayoutGenerator.generateLayout(templateValues, layoutOptions);
msWriteProfilerMark("CommonControls:EntityCluster:getLayout:e");
return WinJS.Promise.wrap(layoutObject)
}, _renderDOM: function _renderDOM(layoutAll, newsItems, videoList) {
var that=this;
return CommonJS.SchedulePromise(this._scheduler, CommonJS.TaskPriority.normal, "EntityCluster:RenderResponse:RenderDOM").then(function renderDOM() {
msWriteProfilerMark("CommonControls:EntityCluster:renderDom:" + that._uniqueID + ":s");
var container=that._container;
var wrapper=that._containerWrapper;
var domElement=that._domElement;
var videoClass=CommonJS.News.EntityCluster.ClusterType.V1;
var orientationString=that._getResultOrientation();
var layout=layoutAll[orientationString];
if (!container || !newsItems || !videoList || !layout) {
return
}
if (!wrapper.parentElement) {
domElement.appendChild(wrapper)
}
if (container.parentElement) {
wrapper.removeChild(container)
}
var tempContainer=new CommonJS.DOMProxy("div");
if (layout.largeItems.length > 0) {
that._createChildElements(layout.largeItems, tempContainer, "ecLargeItem ecFlexContainer", newsItems, videoList)
}
if (layout.firstColumnItems.length > 0) {
that._createChildElements(layout.firstColumnItems, tempContainer, "ecFirstColumn ecFlexContainer", newsItems, videoList);
if (layout.secondColumnItems.length > 0) {
that._createChildElements(layout.secondColumnItems, tempContainer, "ecSecondColumn ecFlexContainer", newsItems, videoList);
var secondContainer=tempContainer.childNodes[tempContainer.childNodes.length - 1];
if (!layout.enableSeeMore && layout.headlineList.length === 0 && layout.additionalColumnItems.length === 0) {
var endElement=new CommonJS.DOMProxy("div");
endElement.className = "ecEndSpacer";
secondContainer.appendChild(endElement)
}
}
WinJS.Utilities.removeClass(container, "largeItemInAllRows")
}
else {
WinJS.Utilities.addClass(container, "largeItemInAllRows")
}
if (layout.gridItems && (layout.gridItems.length > 0)) {
var gridContainerId=that._createChildElements(layout.gridItems, tempContainer, "ecStaticGrid", newsItems, videoList);
that._updateStaticGridCSS(layout.gridItems, layout.gridColumnCount, layout.gridRowCount, layout.gridHeight, gridContainerId, newsItems)
}
if (layout.remainingFlexItems && layout.remainingFlexItems.length > 0) {
var ecMiniFlexContainerId=that._createChildElements(layout.remainingFlexItems, tempContainer, "ecMiniFlex ecFlexContainer", newsItems, videoList);
that._updateEcMiniFlexHeight(ecMiniFlexContainerId, layout.miniFlexHeight, layout.gridColumnCount)
}
if (that._unitWidth === 0) {
that._unitWidth = that._getDefaultUnitWidth()
}
var additionalColumnElement=null;
var columnWidth=0;
if (layout.additionalColumnItems.length > 0) {
that._createChildElements(layout.additionalColumnItems, tempContainer, "ecAdditionalColumn ecFlexContainer", newsItems, videoList);
additionalColumnElement = tempContainer.childNodes[tempContainer.childNodes.length - 1];
if (layout.gridItems && (layout.gridItems.length > 0) && layout.remainingFlexItems && layout.remainingFlexItems.length === 0) {
additionalColumnElement.addStyle("height", layout.gridHeight + "px")
}
if (layout.additionalColumnCount > 0 && !that._isCategoryPage()) {
columnWidth = (that._unitWidth + CommonJS.News.FlexLayoutGenerator.ColMargin) * layout.additionalColumnCount;
additionalColumnElement.addStyle("width", columnWidth + "rem")
}
if (!layout.enableSeeMore && layout.headlineList.length === 0 && layout.additionalColumnItems.length > 1) {
var endElement=new CommonJS.DOMProxy("div");
endElement.className = "ecEndSpacer";
additionalColumnElement.appendChild(endElement)
}
}
var headlineContainer=null;
if (layout.headlineList.length > 0) {
headlineContainer = new CommonJS.DOMProxy("div");
headlineContainer.className = "ecHeadlinesContainer";
tempContainer.appendChild(headlineContainer);
var headlinesClassList="ecHeadlineList ecFlexContainer";
headlinesClassList += !layout.enoughHeadlines ? " headlineNoFlex" : "";
that._createChildElements(layout.headlineList, headlineContainer, headlinesClassList, newsItems, videoList);
columnWidth = that._unitWidth + CommonJS.News.FlexLayoutGenerator.ColMargin;
tempContainer.childNodes[tempContainer.childNodes.length - 1].addStyle("width", columnWidth + "rem")
}
if (layout.enableSeeMore) {
WinJS.Utilities.removeClass(container, "seeMoreInAdditionalColumn seeMoreInSecondColumn " + videoClass);
var seeMoreNode=that._createSeeMoreHtml();
var targetContainer=headlineContainer ? headlineContainer : tempContainer;
if (layout.seeMoreInAdditionalColumn) {
WinJS.Utilities.addClass(container, "seeMoreInAdditionalColumn");
if (layout.firstColumnItems.length === 0 && layout.largeItems.length === 0 && layout.gridItems && (layout.gridItems.length === 0)) {
targetContainer = additionalColumnElement
}
}
targetContainer.appendChild(seeMoreNode);
if (layout.seeMoreInSecondColumn) {
WinJS.Utilities.addClass(container, "seeMoreInSecondColumn")
}
}
var clusterType=that._getClusterType();
if (clusterType) {
WinJS.Utilities.addClass(container, clusterType)
}
container.innerHTML = tempContainer.getInnerHTMLTree();
that._createVideoWrappers(container);
that._createImageCards(container);
that._clearAdControls();
if (that._showInClusterAd && PlatformJS.isPlatformInitialized) {
var adsConfig=PlatformJS.Ads.getEntityClusterConfig(that._categoryKey, that._subcategory, that._providerId);
if (adsConfig && adsConfig.adUnitId) {
msSetImmediate(function FlexEntityCluster_createInClusterAd() {
that._createInClusterAd(container, layout, adsConfig)
})
}
}
that._createSubClusterAds(WinJS.Utilities.query(".ecAdditionalColumn", container)[0], layout.adList);
that._enablePointerUpDownAnimations(WinJS.Utilities.query(".entityCluster", container));
that._attachStyleElement();
if (layout.clusterHeight > 0) {
container.style.height = layout.clusterHeight + "px"
}
if (!container.parentElement) {
that._hideProgress();
that._hideError();
that._hideNoResults();
that._containerWrapper.appendChild(container)
}
if (that._navigableViewOrchestrator === null) {
that._createNavigableView()
}
that._telemetryInstrumentation();
msWriteProfilerMark("CommonControls:EntityCluster:renderDom:" + that._uniqueID + ":e");
msWriteProfilerMark("CommonControls:EntityCluster:render:" + that._uniqueID + ":e")
})
}, _updateStaticGridCSS: function _updateStaticGridCSS(sourceList, gridColumnCount, gridRowCount, gridHeight, gridContainerId, newsItems) {
var gridCssRules=[];
var gridUnit=CommonJS.News.EntityCluster.GridUnit;
var msGridRow,
msGridColumn;
var unitHeightInPixels=this._getDefaultUnitHeight() * gridUnit + gridUnit;
var unitWidthInPixels=this._getDefaultUnitWidth() * gridUnit;
var gridWidth=(gridColumnCount * (unitWidthInPixels + gridUnit)) - gridUnit;
var ruleObj={};
ruleObj.selector = "#" + gridContainerId;
ruleObj.style = "display: -ms-grid;";
ruleObj.style += ["-ms-grid-columns:", "(", (unitWidthInPixels + gridUnit), "px)[", gridColumnCount, "];"].join("");
ruleObj.style += ["-ms-grid-rows:", "(", unitHeightInPixels, "px)[", gridRowCount, "];"].join("");
ruleObj.style += ["width:", gridWidth, "px;"].join("");
ruleObj.style += ["height:", gridHeight, "px;"].join("");
ruleObj.style += ["margin-right:", gridUnit, "px;"].join("");
gridCssRules.push(ruleObj);
for (var index=0; index < sourceList.length; index++) {
if (sourceList[index]) {
var itemIndex=sourceList[index].itemIndex;
var newsItem=newsItems[itemIndex];
msGridRow = sourceList[index].row + 1;
msGridColumn = sourceList[index].column + 1;
ruleObj = {};
ruleObj.selector = "#" + newsItem.item.id;
ruleObj.style = ["-ms-grid-row:", msGridRow, "; -ms-grid-column:", msGridColumn, ";"].join("");
ruleObj.style += ["-ms-grid-column-span:", sourceList[index].width, ";"].join("");
ruleObj.style += ["-ms-grid-row-span:", sourceList[index].height, ";"].join("");
gridCssRules.push(ruleObj)
}
}
var styleElement=this._getStyleElement();
for (var i=0; i < gridCssRules.length; i++) {
styleElement.sheet.addRule(gridCssRules[i].selector, gridCssRules[i].style, 1)
}
}, _updateEcMiniFlexHeight: function _updateEcMiniFlexHeight(ecMiniFlexContainerId, miniFlexHeight, miniFlexColumnCount) {
var gridUnit=CommonJS.News.EntityCluster.GridUnit;
var unitHeightInPixels=this._getDefaultUnitHeight() * gridUnit + gridUnit;
var unitWidthInPixels=this._getDefaultUnitWidth() * gridUnit;
var ruleObj={};
ruleObj.selector = "#" + ecMiniFlexContainerId;
ruleObj.style = "height:" + miniFlexHeight + "px;";
ruleObj.style += "width:" + ((miniFlexColumnCount * unitWidthInPixels) + gridUnit) + "px;";
var styleElement=this._getStyleElement();
styleElement.sheet.addRule(ruleObj.selector, ruleObj.style, 1)
}, _getStyleElement: function _getStyleElement() {
if (!this._styleElement) {
this._styleElement = document.createElement('style');
if (this.categoryKey) {
this._styleElement.id = this.categoryKey + "_Style"
}
this._styleElement.type = 'text/css'
}
return this._styleElement
}, _attachStyleElement: function _attachStyleElement() {
if (this._styleElement && !this._styleElement.parentElement) {
if (this._container) {
this._container.appendChild(this._styleElement)
}
}
}, _clearStyleElement: function _clearStyleElement() {
if (this._styleElement) {
if (this._styleElement.parentNode) {
this._styleElement.parentNode.removeChild(this._styleElement)
}
this._styleElement = null
}
}, _createChildElements: function _createChildElements(sourceList, parentNode, className, newsItems, videoList) {
var container=new CommonJS.DOMProxy("div");
container.className = className;
var containerId=NV.createItemId();
container.setAttribute("id", containerId);
for (var index=0; index < sourceList.length; index++) {
if (sourceList[index]) {
var itemIndex=sourceList[index].itemIndex;
var newsItem=newsItems[itemIndex];
if (newsItem) {
newsItem.index = itemIndex;
container.appendChild(this._createHTML(newsItem, sourceList[index], videoList))
}
}
}
parentNode.appendChild(container);
return containerId
}, _getClusterType: function _getClusterType() {
var result=null;
if (this._itemWrappers && this._itemWrappers.length > 0) {
var templateClass=this._templateClassMap[this._itemWrappers[0].templateClass];
if (templateClass) {
result = CommonJS.News.EntityCluster.ClusterType[templateClass.classID]
}
}
return result
}, _getDefaultUnitWidth: function _getDefaultUnitWidth() {
var unitWidth=CommonJS.News.EntityCluster.DefaultUnitWidth;
if (this._getClusterType() === CommonJS.News.EntityCluster.ClusterType.V1) {
unitWidth = 22
}
if (this.unitWidth) {
unitWidth = this.unitWidth
}
if (this.configObject && this.configObject.UnitWidth) {
unitWidth = this.configObject.UnitWidth
}
return unitWidth
}, _getDefaultUnitHeight: function _getDefaultUnitHeight() {
var unitHeight=CommonJS.News.EntityCluster.DefaultUnitHeight;
if (this.unitHeight) {
unitHeight = this.unitHeight
}
if (this.configObject && this.configObject.UnitHeight) {
unitHeight = this.configObject.UnitHeight
}
return unitHeight
}, _isFlexCluster: function _isFlexCluster() {
var clusterType=this._getClusterType();
return !clusterType
}, _isSpecialCluster: function _isSpecialCluster() {
var result=this._getClusterType() ? true : false;
if (!result && this._itemWrappers) {
var flag=true;
var length=this._itemWrappers.length;
for (var i=0; i < length; i++) {
if (this._itemWrappers[i].templateClass !== "S") {
flag = false;
break
}
}
result = flag
}
return result
}, _createSubClusterAds: function _createSubClusterAds(container, adList) {
if (this._isDisposed || !PlatformJS.Ads || !container || !adList) {
return
}
var adConfig=PlatformJS.Ads.getAdsConfig(this._categoryKey, this._subcategory, this._providerId);
if (!adConfig) {
return
}
if (!this._adUnitId) {
this._adUnitId = adConfig.adUnitId
}
var adListConfig=this._adsList;
for (var index=adList.length - 1; index >= 0; index--) {
if (container.childNodes.length >= adList[index]) {
var insertBefore=container.childNodes[adList[index]];
var adWrapper=document.createElement("div");
WinJS.Utilities.addClass(adWrapper, "adsWrapper");
var adElement=document.createElement("div");
var id=NV.createItemId();
adElement.id = id;
WinJS.Utilities.addClass(adElement, "SubclusterAd");
adWrapper.appendChild(adElement);
var otherAdOptions=null;
if (adListConfig && adListConfig.length > 0) {
otherAdOptions = adListConfig[index % adListConfig.length]
}
if (adConfig.adTags) {
if (!otherAdOptions) {
otherAdOptions = {}
}
otherAdOptions.adTags = PlatformJS.Ads.mergeAdTags(otherAdOptions.adTags, adConfig.adTags)
}
var ad=new PlatformJS.Ads.AdsWrapperControl(adElement, {
otherAdOptions: otherAdOptions, className: "adTypeThin", adUnitId: this._adUnitId
});
this._adsWrapperControlList.push(ad);
container.insertBefore(adWrapper, insertBefore);
var endElement=document.createElement("div");
endElement.className = "ecEndSpacer";
container.insertBefore(endElement, adWrapper)
}
}
}, _createInClusterAd: function _createInClusterAd(container, layout, adsConfig) {
if (this._isDisposed) {
return
}
var adUnitId=adsConfig.adUnitId;
var collapsed=adsConfig.type === "noad";
var adElement=document.createElement("div");
adElement.className = "inClusterAd" + (collapsed ? " collapsed" : "");
var adsParentNode=null;
var clusterClassName=null;
if (layout.inClusterAdLocation === News.ColumnType.secondColumn) {
clusterClassName = "inClusterAdInSecondColumn";
adsParentNode = WinJS.Utilities.query(".ecSecondColumn", container)[0]
}
else if (layout.inClusterAdLocation === News.ColumnType.additionalColumn) {
clusterClassName = "inClusterAdInAddlnCol";
if (layout.seeMoreInAdditionalColumn) {
adsParentNode = container
}
else {
adsParentNode = WinJS.Utilities.query(".ecAdditionalColumn", container)[0]
}
}
else if (layout.inClusterAdLocation === News.ColumnType.headlineColumn) {
adsParentNode = WinJS.Utilities.query(".ecHeadlinesContainer", container)[0]
}
if (!adsParentNode) {
return
}
if (clusterClassName) {
WinJS.Utilities.addClass(container, clusterClassName)
}
var endSpacer=WinJS.Utilities.query(".ecEndSpacer", adsParentNode);
if (endSpacer.length > 0) {
adsParentNode.insertBefore(adElement, endSpacer[0])
}
else {
adsParentNode.appendChild(adElement)
}
var adOptions=null;
if (adsConfig.adTags) {
adOptions = {adTags: adsConfig.adTags}
}
var ad=new PlatformJS.Ads.AdsWrapperControl(adElement, {
className: collapsed ? "adTypeCollapse" : "adTypeTile", adUnitId: adUnitId, otherAdOptions: adOptions, collapsed: collapsed
});
this._adsWrapperControlList.push(ad)
}, _clearAdControls: function _clearAdControls() {
var list=this._adsWrapperControlList;
for (var i=0, leni=list.length; i < leni; i++) {
var ad=list[i];
if (ad && ad.dispose) {
ad.dispose()
}
}
this._adsWrapperControlList = []
}, _createVideoWrappers: function _createVideoWrappers(container) {
var videoOptions=this._videoOptions;
WinJS.Utilities.query(".lazyVideoTile", container).forEach(function FlexEntityCluster_createVideoWrappers(videoElement) {
var videoIndex=videoElement.getAttribute("data-video-index");
if (videoIndex >= 0) {
var videoOptionItem=videoOptions[videoIndex];
var wrapperInnerDiv=videoOptionItem.subElement.createDOM();
var wrapper=new CommonJS.VideoWrapper(videoElement, {
subElement: wrapperInnerDiv, videoOptions: videoOptionItem.videoOptions, videoList: videoOptionItem.videoList, instrumentation: {actionContext: "Cluster"}
})
}
});
videoOptions = this._videoOptions = []
}, _createImageCards: function _createImageCards(container) {
var imageCardOptions=this._imageCardOptions;
imagelog("_createImageCards:s");
WinJS.Utilities.query(".lazyImageCard", container).forEach(function FlexEntityCluster_createImageCards(imageCardElement) {
var imageIndex=imageCardElement.getAttribute("data-image-index");
if (imageIndex >= 0) {
logImageSource(imageCardOptions[imageIndex].imageSource);
var thumbnailImage=new CommonJS.ImageCard(imageCardElement, imageCardOptions[imageIndex])
}
});
imagelog("_createImageCards:e");
imageCardOptions = this._imageCardOptions = []
}, _enablePointerUpDownAnimations: function _enablePointerUpDownAnimations(childNodes) {
var enableAnimation=PlatformJS.Utilities.enablePointerUpDownAnimations;
var elements=this._elements;
for (var index=0, len=childNodes.length; index < len; index++) {
elements.push(childNodes[index]);
enableAnimation(childNodes[index])
}
}, _disablePointerUpDownAnimations: function _disablePointerUpDownAnimations(container) {
var disableAnimation=PlatformJS.Utilities.disablePointerUpDownAnimations;
var elements=this._elements;
if (elements) {
for (var index=0, len=elements.length; index < len; index++) {
disableAnimation(elements[index])
}
}
}, isVideoClass: function isVideoClass(classType) {
return (classType === "Video" || classType === CommonJS.News.EntityCluster.ClusterType.V1)
}, isSlideshowClass: function isSlideshowClass(classType) {
return classType === "Slideshow"
}, isPhotosynthClass: function isPhotosynthClass(classType) {
return classType === "Photosynth"
}, isPanoClass: function isPanoClass(classType) {
return classType === "Pano"
}, isArticleClass: function isArticleClass(classType) {
return classType === "News"
}, _filterOutItems: function _filterOutItems(currentItemInfo, inputList, allItems) {
var currentItem=document.getElementById(currentItemInfo.id);
var hasClass=WinJS.Utilities.hasClass;
if (!currentItem || !currentItem.parentNode) {
return
}
if (this._isCategoryPage()) {
return
}
var visibleRanges={};
this._updateVisibleRange(visibleRanges, currentItem, currentItemInfo, allItems);
var discardIndexes=[];
for (var index=0; index < inputList.length; index++) {
var item=inputList[index];
if (!visibleRanges[item.parentNode.id]) {
this._updateVisibleRange(visibleRanges, item, currentItemInfo, allItems)
}
var left=visibleRanges[currentItem.parentNode.id].left;
var right=visibleRanges[currentItem.parentNode.id].right;
if (currentItemInfo.bounds.left > right || currentItemInfo.bounds.right < left) {
discardIndexes.push(index)
}
else {
left = visibleRanges[item.parentNode.id].left;
right = visibleRanges[item.parentNode.id].right;
if (item.bounds.right < left || item.bounds.left > right) {
discardIndexes.push(index)
}
}
}
for (var index=discardIndexes.length - 1; index >= 0; index--) {
inputList.splice(discardIndexes[index], 1)
}
}, _isCategoryPage: function _isCategoryPage() {
if (!this._enableSeeMore && (!this._maxColumnCount || this._maxColumnCount > 10)) {
return true
}
return false
}, _updateVisibleRange: function _updateVisibleRange(range, item, itemInfo, allItems) {
var hasClass=WinJS.Utilities.hasClass;
if (!item || !item.parentNode) {
return
}
var leftElementId=item.parentNode.childNodes[0].id;
var leftPosition=0,
rightPosition=0;
if (item.className.indexOf("seeMore") > 0) {
leftPosition = itemInfo.bounds.left;
rightPosition = itemInfo.bounds.right
}
else {
for (var index=0; index < allItems.length; index++) {
if (allItems[index].id === leftElementId) {
leftPosition = allItems[index].bounds.left;
break
}
}
var columnCount=1;
if (hasClass(item.parentNode, "ecAdditionalColumn")) {
var orientationString=this._getResultOrientation();
columnCount = this._layout[orientationString].additionalColumnCount
}
rightPosition = leftPosition + columnCount * (CommonJS.remToPx(this._unitWidth) + 10) - 10
}
range[item.parentNode.id] = {
left: leftPosition, right: rightPosition
}
}, _createNavigableView: function _createNavigableView() {
this._navigableViewOrchestrator = new CommonJS.NavigableView.NavigableViewOrchestrator(this._domElement, this._elements, this._filterOutItems.bind(this))
}, _createDebugData: function _createDebugData(newsItems) {
if (DEBUG) {
var landscapeDebug=[];
var portraitDebug=[];
for (var i=0, leni=newsItems.length; i < leni; i++) {
landscapeDebug.push([""]);
portraitDebug.push([""])
}
this._debugTemplateSelectorData = {
portrait: portraitDebug, landscape: landscapeDebug
}
}
}, _createNewsItemsWrapper: function _createNewsItemsWrapper(newsItems, dataSet) {
if (DEBUG) {
var landscapeDebug=[];
var portraitDebug=[]
}
var output=[];
var imageTag=dataSet.imageTag;
var templateClassMap=this._templateClassMap;
for (var i=0, leni=newsItems.length; i < leni; i++) {
var templateClass=newsItems[i].templateClass;
if (templateClassMap[templateClass] && templateClassMap[templateClass].replacementClass) {
templateClass = templateClassMap[templateClass].replacementClass;
if (DEBUG) {
this._writeToDebugData("The template class was replaced with : " + templateClass + ".\n", i, true, true)
}
}
var temp={
item: newsItems[i], templateClass: templateClass, index: i
};
if (imageTag) {
temp.item.imageTag = imageTag + i
}
output.push(temp);
if (DEBUG) {
landscapeDebug.push([""]);
portraitDebug.push([""])
}
}
if (DEBUG) {
this._debugTemplateSelectorData = {
portrait: portraitDebug, landscape: landscapeDebug
}
}
return output
}, _createHTML: function _createHTML(newsItemWrapper, layoutInfo, videoList) {
var templateClass=newsItemWrapper.templateClass;
var classMap=this._templateClassMap[templateClass];
if (classMap) {
var classType=classMap.type;
if (this.isSlideshowClass(classType)) {
return this._createSlideshowHtml(newsItemWrapper, layoutInfo)
}
else if (this.isPhotosynthClass(classType)) {
return this._createPhotosynthHtml(newsItemWrapper, layoutInfo)
}
else if (this.isPanoClass(classType)) {
return this._createPanoHtml(newsItemWrapper, layoutInfo)
}
else if (this.isVideoClass(classType)) {
return this._createVideoHtml(newsItemWrapper, layoutInfo, videoList)
}
else {
return this._createNormalHtml(newsItemWrapper, layoutInfo)
}
}
else {
return this._createNormalHtml(newsItemWrapper, layoutInfo)
}
}, _createVideoList: function _createVideoList(itemWrappers) {
var videoList=[];
var index=0;
for (var i=0; i < itemWrappers.length; i++) {
var itemWraper=itemWrappers[i];
var templateClass=itemWraper.templateClass;
var classType=templateClass && this._templateClassMap[templateClass] && this._templateClassMap[templateClass].type;
var item=itemWraper.item;
if (classType && this.isVideoClass(classType) && this._isValidVideo(item)) {
if (item.thumbnailLowRes) {
item.thumbnail.videoOptions.thumbnailLowResUrl = item.thumbnailLowRes.url
}
var optionSet=this._setVideoOptions(item.thumbnail.videoOptions);
optionSet.index = index++;
videoList.push(optionSet)
}
}
return videoList
}, _isValidVideo: function _isValidVideo(item) {
return (item && item.thumbnail && item.thumbnail.videoOptions && (item.thumbnail.videoOptions.videoSource || item.thumbnail.videoOptions.externalVideoUrl))
}, _createClusterHtml: function _createClusterHtml(newsItemWrapper, layoutInfo, iconName, videoList) {
var DOMProxy=CommonJS.DOMProxy;
var newsItem=newsItemWrapper.item;
var thumbnailData=newsItem.thumbnail;
var isVideo=!!videoList;
var cluster=new DOMProxy("div");
cluster.setAttribute("data-index", newsItemWrapper.index);
cluster.setAttribute("role", "option");
cluster.setAttribute("tabindex", 0);
if (isVideo) {
cluster.setAttribute("data-video-index", this._videoOptions.length)
}
var id=NV.createItemId();
newsItem.id = id;
cluster.setAttribute("id", id);
var classNames=["entityCluster", "MediaTemplate", layoutInfo.thumbnailModifier ? layoutInfo.thumbnailModifier : "", layoutInfo.classID];
if (isVideo) {
classNames.push("lazyVideoTile")
}
cluster.className = classNames.join(" ");
var grid=this._createGridHtml(newsItemWrapper, layoutInfo, thumbnailData, iconName);
if (isVideo) {
var wrapperInnerDiv=new DOMProxy("div");
wrapperInnerDiv.addStyle("width", "100%");
wrapperInnerDiv.addStyle("height", "100%");
wrapperInnerDiv.appendChild(grid);
this._videoOptions.push({
subElement: wrapperInnerDiv, videoOptions: thumbnailData.videoOptions, videoList: videoList
})
}
else {
cluster.appendChild(grid)
}
return cluster
}, _getRightSizedImageUrl: function _getRightSizedImageUrl(imageUrl, layoutInfo, label) {
var thumbnailHeight=layoutInfo.isHeadlineItem ? defaultThumbnailHeight : layoutInfo.thumbnailHeight;
var thumbnailWidth=layoutInfo.isHeadlineItem ? defaultThumbnailWidth : layoutInfo.thumbnailWidth;
if (thumbnailHeight && thumbnailWidth) {
imageUrl = this._keepSetImageSizes ? imageUrl : CommonJS.Utils.removeImageUrlResizeTags(imageUrl);
logImage(label ? label : "unknown text", imageUrl, thumbnailWidth, thumbnailHeight, 6);
imageUrl = CommonJS.Utils.getResizedImageUrlWithMode(imageUrl, thumbnailWidth, thumbnailHeight, 6)
}
return imageUrl
}, _createGridHtml: function _createGridHtml(newsItemWrapper, layoutInfo, thumbnailData, iconName) {
var DOMProxy=CommonJS.DOMProxy;
var newsItem=newsItemWrapper.item;
var grid=new DOMProxy("div");
grid.className = "grid";
var thumbnailContainer=null;
if (this.isResponsive) {
thumbnailContainer = new DOMProxy("div");
thumbnailContainer.className = "thumbnailContainer";
grid.appendChild(thumbnailContainer)
}
else {
thumbnailContainer = grid
}
var thumbnail=new DOMProxy("div");
thumbnail.className = "thumbnail anchorTop";
if (thumbnailData) {
var imageSource;
var lowRes=newsItem.thumbnailLowRes;
if (lowRes) {
lowRes.url = this._getRightSizedImageUrl(lowRes.url, layoutInfo, newsItem.headline)
}
var imageUrl=this._getRightSizedImageUrl(thumbnailData.url, layoutInfo, newsItem.headline);
if (lowRes) {
imageSource = {
lowResolutionUrl: lowRes.url, highResolutionUrl: imageUrl, cacheId: "PlatformImageCache", imageTag: newsItem.imageTag
}
}
else {
imageSource = {
url: imageUrl, cacheId: "PlatformImageCache", imageTag: newsItem.imageTag
}
}
var imageOptions={
alternateText: thumbnailData.altText || "", classification: "small", noIdentifier: 1, imageSource: imageSource, imageElement: null, placeholderElement: null, iconElement: null, preBuilt: true
};
thumbnail.setAttribute("data-image-index", this._imageCardOptions.length);
this._imageCardOptions.push(imageOptions);
CommonJS.ImageCard.populateDomProxyElement(thumbnail, imageOptions.classification)
}
thumbnailContainer.appendChild(thumbnail);
var gradient=new DOMProxy("div");
gradient.className = "gradient";
thumbnailContainer.appendChild(gradient);
if (iconName) {
var icon=new DOMProxy("div");
icon.className = "icon " + iconName;
var iconImage=new DOMProxy("div");
iconImage.className = "iconImage";
icon.appendChild(iconImage);
thumbnailContainer.appendChild(icon)
}
var headline=new DOMProxy("div");
headline.className = "headline";
var strippedTitle;
if (newsItem.isLocked) {
var headlineSpan=new DOMProxy("span");
if (this._containsHTML(newsItem.title)) {
headlineSpan.className = "payWallLockedHTML"
}
else {
headlineSpan.className = "payWallLockedNormal"
}
headlineSpan.innerHTML = toStaticHTML(newsItem.title) || "";
strippedTitle = headlineSpan.innerText;
headline.appendChild(headlineSpan)
}
else {
headline.innerHTML = toStaticHTML(newsItem.title) || "";
strippedTitle = headline.innerText
}
var dir=PlatformJS.Utilities.getTextDirection(strippedTitle);
if (layoutInfo.isHeadlineItem && strippedTitle.length > CommonJS.News.EntityCluster.MaxHeadlineLength) {
thumbnailContainer.addStyle("display", "none")
}
else if (layoutInfo.isLargeItem && strippedTitle.length > this._maxLargeItemHeadlineLength) {
headline.addClass("longText")
}
headline.setAttribute("dir", dir);
grid.appendChild(headline);
var kicker=new DOMProxy("div");
WinJS.Utilities.addClass(kicker, "kicker");
kicker.innerHTML = newsItem.kicker || "";
kicker.setAttribute("dir", dir);
grid.appendChild(kicker);
var sourceContainer=null;
if (this.isResponsive) {
sourceContainer = new DOMProxy("div");
sourceContainer.className = "sourceContainer";
grid.appendChild(sourceContainer)
}
else {
sourceContainer = grid
}
var source=new DOMProxy("div");
source.className = "source";
source.innerHTML = newsItem.source || "";
if (!newsItem.source) {
source.addClass("noSource")
}
sourceContainer.appendChild(source);
var publishTime=new DOMProxy("div");
var publishClassName="publishTime";
if (!newsItem.source) {
publishClassName += " noSource"
}
publishTime.className = publishClassName;
publishTime.innerHTML = this._getEffectiveTime(newsItem);
sourceContainer.appendChild(publishTime);
var sourceImage=new DOMProxy("div");
sourceImage.addClass("sourceImage fitBoth");
var sourceImageUrl=newsItem.sourceImageUrl;
if (sourceImageUrl) {
var imageOptions={
alternateText: newsItem.source || "", classification: "tiny", noIdentifier: 1, imageSource: {
url: sourceImageUrl, cacheId: "PlatformImageCache"
}, imageElement: null, placeholderElement: null, iconElement: null, preBuilt: true
};
sourceImage.setAttribute("data-image-index", this._imageCardOptions.length);
this._imageCardOptions.push(imageOptions);
CommonJS.ImageCard.populateDomProxyElement(sourceImage, imageOptions.classification)
}
else {
sourceImage.addStyle("display", "none")
}
sourceContainer.appendChild(sourceImage);
var snippetWrapper=new DOMProxy("div");
snippetWrapper.className = "snippetWrapper";
var snippet=new DOMProxy("div");
snippet.className = "snippet";
snippet.innerHTML = toStaticHTML(newsItem.snippet) || "";
snippet.setAttribute("dir", dir);
snippetWrapper.appendChild(snippet);
grid.appendChild(snippetWrapper);
if (!newsItem.snippet) {
snippetWrapper.addStyle("display", "none")
}
var miniLine=new DOMProxy("div");
miniLine.className = "miniLine";
grid.appendChild(miniLine);
return grid
}, _createSlideshowHtml: function _createSlideshowHtml(newsItemWrapper, layoutInfo) {
return this._createClusterHtml(newsItemWrapper, layoutInfo, "Slideshow")
}, _createPhotosynthHtml: function _createPhotosynthHtml(newsItemWrapper, layoutInfo) {
return this._createClusterHtml(newsItemWrapper, layoutInfo, "Photosynth")
}, _createPanoHtml: function _createPanoHtml(newsItemWrapper, layoutInfo) {
return this._createClusterHtml(newsItemWrapper, layoutInfo)
}, _createVideoHtml: function _createVideoHtml(newsItemWrapper, layoutInfo, videoList) {
return this._createClusterHtml(newsItemWrapper, layoutInfo, "Video", videoList)
}, _createNormalHtml: function _createNormalHtml(newsItemWrapper, layoutInfo) {
var newsItem=newsItemWrapper.item;
var DOMProxy=CommonJS.DOMProxy;
var cluster=new DOMProxy("div");
cluster.setAttribute("data-index", newsItemWrapper.index);
cluster.className = [layoutInfo.classID, "entityCluster", layoutInfo.thumbnailModifier].join(" ");
var hasImage=!this._templateDefinitions[layoutInfo.classID].noThumbnail;
var id=NV.createItemId();
newsItem.id = id;
cluster.setAttribute("id", id);
var grid=new DOMProxy("div");
grid.className = "grid";
var thumbnailContainer=null;
if (this.isResponsive) {
thumbnailContainer = new DOMProxy("div");
thumbnailContainer.className = "thumbnailContainer";
grid.appendChild(thumbnailContainer)
}
else {
thumbnailContainer = grid
}
var imageAttribution=null;
if (hasImage && newsItem.thumbnail) {
var thumbnail=new DOMProxy("div");
thumbnail.className = "thumbnail anchorTop";
var thumbnailData=newsItem.thumbnail;
if (thumbnailData) {
var imageSource;
var lowRes=newsItem.thumbnailLowRes;
if (lowRes) {
lowRes.url = this._getRightSizedImageUrl(lowRes.url, layoutInfo, newsItem.headline)
}
var imageUrl=this._getRightSizedImageUrl(thumbnailData.url, layoutInfo, newsItem.headline);
if (lowRes) {
imageSource = {
lowResolutionUrl: lowRes.url, highResolutionUrl: imageUrl, cacheId: "PlatformImageCache", imageTag: newsItem.imageTag
}
}
else {
imageSource = {
url: imageUrl, cacheId: "PlatformImageCache", imageTag: newsItem.imageTag
}
}
var imageOptions={
alternateText: thumbnailData.altText || "", classification: "small", noIdentifier: 1, imageSource: imageSource, imageElement: null, placeholderElement: null, iconElement: null, preBuilt: true
};
thumbnail.setAttribute("data-image-index", this._imageCardOptions.length);
this._imageCardOptions.push(imageOptions);
CommonJS.ImageCard.populateDomProxyElement(thumbnail, imageOptions.classification)
}
thumbnailContainer.appendChild(thumbnail);
var gradient=new DOMProxy("div");
gradient.className = "gradient";
thumbnailContainer.appendChild(gradient);
imageAttribution = new DOMProxy("div");
imageAttribution.className = "imageAttribution";
imageAttribution.innerHTML = newsItem.imageAttribution || "";
thumbnailContainer.appendChild(imageAttribution)
}
else {
thumbnailContainer.addClass("noThumbnail")
}
var headline=new DOMProxy("div");
headline.className = "headline";
var strippedTitle;
if (newsItem.isLocked) {
var headlineSpan=new DOMProxy("span");
if (this._containsHTML(newsItem.title)) {
headlineSpan.className = "payWallLockedHTML"
}
else {
headlineSpan.className = "payWallLockedNormal"
}
headlineSpan.innerHTML = toStaticHTML(newsItem.title) || "";
strippedTitle = headlineSpan.innerText;
headline.appendChild(headlineSpan)
}
else {
headline.innerHTML = toStaticHTML(newsItem.title) || "";
strippedTitle = headline.innerText
}
grid.appendChild(headline);
var dir=PlatformJS.Utilities.getTextDirection(strippedTitle);
headline.setAttribute("dir", dir);
if (layoutInfo.isHeadlineItem && strippedTitle.length > CommonJS.News.EntityCluster.MaxHeadlineLength) {
thumbnailContainer.addStyle("display", "none")
}
else if (layoutInfo.isLargeItem && strippedTitle.length > this._maxLargeItemHeadlineLength) {
headline.addClass("longText")
}
if (imageAttribution) {
imageAttribution.setAttribute("dir", dir)
}
var kicker=new DOMProxy("div");
kicker.className = "kicker";
kicker.innerHTML = newsItem.kicker || "";
kicker.setAttribute("dir", dir);
grid.appendChild(kicker);
var sourceContainer=null;
if (this.isResponsive) {
sourceContainer = new DOMProxy("div");
sourceContainer.className = "sourceContainer";
grid.appendChild(sourceContainer)
}
else {
sourceContainer = grid
}
var sourceImage=new DOMProxy("div");
sourceImage.className = "sourceImage fitBoth";
var sourceImageUrl=newsItem.sourceImageUrl;
if (sourceImageUrl) {
var imageOptions={
alternateText: newsItem.source || "", classification: "tiny", noIdentifier: 1, imageSource: {
url: sourceImageUrl, cacheId: "PlatformImageCache"
}, imageElement: null, placeholderElement: null, iconElement: null, preBuilt: true
};
sourceImage.setAttribute("data-image-index", this._imageCardOptions.length);
this._imageCardOptions.push(imageOptions);
CommonJS.ImageCard.populateDomProxyElement(sourceImage, imageOptions.classification)
}
else {
sourceImage.addStyle("display", "none")
}
sourceContainer.appendChild(sourceImage);
var source=new DOMProxy("div");
source.className = "source";
if (!sourceImageUrl) {
source.addClass("noSourceImage")
}
source.innerHTML = newsItem.source || "";
if (!newsItem.source) {
source.addClass("noSource")
}
sourceContainer.appendChild(source);
var publishTime=new DOMProxy("div");
publishTime.className = "publishTime";
if (!sourceImageUrl) {
publishTime.addClass("noSourceImage")
}
publishTime.innerHTML = this._getEffectiveTime(newsItem);
sourceContainer.appendChild(publishTime);
var snippetWrapper=new DOMProxy("div");
snippetWrapper.className = "snippetWrapper";
var snippet=new DOMProxy("div");
snippet.className = "snippet";
snippet.innerHTML = toStaticHTML(newsItem.snippet) || "";
snippet.setAttribute("dir", dir);
snippetWrapper.appendChild(snippet);
grid.appendChild(snippetWrapper);
cluster.appendChild(grid);
cluster.setAttribute("role", "option");
cluster.setAttribute("tabindex", 0);
return cluster
}, _createSeeMoreHtml: function _createSeeMoreHtml() {
var DOMProxy=CommonJS.DOMProxy;
var elt=new DOMProxy("div");
elt.className = "entityCluster seeMore";
elt.setAttribute("role", "option");
elt.setAttribute("tabindex", 0);
elt.setAttribute("id", NV.createItemId());
var gridElt=new DOMProxy("div");
gridElt.className = "grid";
elt.appendChild(gridElt);
var categoryNameElt=new DOMProxy("div");
categoryNameElt.className = "categoryName";
var categoryPrefix=this._categoryContainsMore ? "" : CommonJS.resourceLoader.getString("/platform/More") + " ";
categoryNameElt.innerHTML = categoryPrefix + this._categoryName;
gridElt.appendChild(categoryNameElt);
var icon=new DOMProxy("div");
icon.className = "icon win-command";
var iconRing=new DOMProxy("div");
iconRing.className = "iconRing win-commandring win-commandicon";
icon.appendChild(iconRing);
var iconImage=new DOMProxy("div");
iconImage.className = "iconImage win-commandimage";
iconRing.appendChild(iconImage);
gridElt.appendChild(icon);
return elt
}, _getEffectiveTime: function _getEffectiveTime(newsItem) {
return newsItem.updatedTime || newsItem.publishTime || ""
}, _containsHTML: function _containsHTML(string) {
if (string) {
var strippedString=CommonJS.Utils.stripHTML(string);
if (string === strippedString) {
return false
}
return true
}
return false
}, _createTemplateSelectorOutput: function _createTemplateSelectorOutput(items) {
var that=this;
var templateSelectorOutput=[];
for (var i=0, leni=items.length; i < leni; i++) {
var item=items[i];
templateSelectorOutput.push(this._templateSelector(item, i))
}
return templateSelectorOutput
}, _templateSelector: function _templateSelector(item, i) {
if (item.item && item.item.template && item.item.testData === true) {
return [this._createTemplateInfo(item.item.template)]
}
var itemTemplateClass=item.templateClass;
if (this.configObject && this.configObject.DefaultTemplateClass) {
itemTemplateClass = this.configObject.DefaultTemplateClass;
item.templateClass = itemTemplateClass
}
var templateClass=this._templateClassMap[itemTemplateClass];
if (DEBUG) {
this._writeToDebugData("The template class that was provided by the data was: " + itemTemplateClass + ".\n", i, true, true)
}
if (templateClass && templateClass.replacementClass) {
itemTemplateClass = item.templateClass = templateClass.replacementClass;
templateClass = this._templateClassMap[item.templateClass];
if (DEBUG) {
this._writeToDebugData("The template class was replaced with : " + itemTemplateClass + ".\n", i, true, true)
}
}
if (itemTemplateClass && !templateClass) {
if (DEBUG) {
this._writeToDebugData("This template class was not defined in the config so it will be dropped.\n", i, true, true)
}
return this._getTemplatesForItem(item)
}
if (templateClass) {
this._sanitizeTemplateClass(item)
}
else {
this._generateTemplateClass(item)
}
return this._getTemplatesForItem(item)
}, _validateVideoOptions: function _validateVideoOptions(itemWrapper, classType) {
if (this.isVideoClass(classType)) {
if (!itemWrapper.item.thumbnail) {
itemWrapper.item.thumbnail = {
width: 0, height: 0, url: "", name: ""
}
}
var thumbnailData=itemWrapper.item.thumbnail;
if (!thumbnailData.videoOptions) {
thumbnailData.videoOptions = {};
thumbnailData.videoOptions.videoSource = ""
}
}
}, _setVideoOptions: function _setVideoOptions(videoOptions) {
videoOptions.fullscreen = "true";
videoOptions.adUnitId = this.videoAdUnitId;
videoOptions.enableVideoAds = this.enableVideoAds;
videoOptions.instrumentationEntryPoint = this._instrumentationEntryPoint;
return videoOptions
}, _sanitizeTemplateClass: function _sanitizeTemplateClass(itemWrapper) {
var item=itemWrapper.item;
var index=itemWrapper.index;
var itemTemplateClass=itemWrapper.templateClass;
var valid=false;
var thumbnail=item.thumbnail;
var tempClass=this._templateClassMap[itemTemplateClass];
if (tempClass) {
this._validateVideoOptions(itemWrapper, tempClass.type);
if (thumbnail && thumbnail.height > 0 && thumbnail.width > 0) {
var aspectRatio=thumbnail.width / thumbnail.height;
var aspectRatioMin=tempClass["aspectRatioMin"];
var aspectRatioMax=tempClass["aspectRatioMax"];
if (aspectRatioMin && aspectRatioMax) {
if (aspectRatio < aspectRatioMax && aspectRatio >= aspectRatioMin) {
valid = true
}
else {
if (DEBUG) {
this._writeToDebugData("This item didn't fall within the desired aspectRatio range. It should fall between: " + aspectRatioMin + " and " + aspectRatioMax + ", but its actual aspect ratio is: " + aspectRatio + ".\n", index, true, true)
}
}
}
else {
valid = true
}
}
else {
valid = true
}
}
if (!valid) {
this._generateTemplateClass(itemWrapper)
}
}, _generateTemplateClass: function _generateTemplateClass(itemWrapper) {
var item=itemWrapper.item;
var index=itemWrapper.index;
var thumbnail=item.thumbnail;
var classMap=this._templateClassMap;
for (var key in classMap) {
var current=classMap[key];
if (current["type"] !== "News") {
continue
}
var aspectRatioMin=current["aspectRatioMin"];
var aspectRatioMax=current["aspectRatioMax"];
if (thumbnail && thumbnail.width > 0 && thumbnail.height > 0) {
if (aspectRatioMin && aspectRatioMax) {
var aspectRatio=thumbnail.width / thumbnail.height;
if (aspectRatio >= aspectRatioMin && aspectRatio < aspectRatioMax) {
itemWrapper.templateClass = current["classID"];
if (DEBUG) {
this._writeToDebugData("This template class that was generated for this item is: " + current["classID"] + ".\n", index, true, true)
}
return
}
}
else {
itemWrapper.templateClass = current["classID"];
if (DEBUG) {
this._writeToDebugData("This template class that was generated for this item is: " + current["classID"] + ".\n", index, true, true)
}
return
}
}
else {
itemWrapper.templateClass = current["classID"];
if (DEBUG) {
this._writeToDebugData("This template class that was generated for this item is: " + current["classID"] + ".\n", index, true, true)
}
return
}
}
}, _validateThumbnailSizes: function _validateThumbnailSizes(item, template, outputTemplates, index) {
var templateDim=this._templateDefinitions[template];
var thumbnailHeight=templateDim["thumbnailHeight"];
var thumbnailWidth=templateDim["thumbnailWidth"];
var aspectRatioMin=templateDim["aspectRatioMin"];
var aspectRatioMax=templateDim["aspectRatioMax"];
var modifier="";
var thumbnail=item.thumbnail;
if (thumbnailHeight && thumbnailWidth) {
if (thumbnail) {
var actualThumbnailHeight=thumbnail.height;
var actualThumbnailWidth=thumbnail.width;
if (actualThumbnailHeight < thumbnailHeight || actualThumbnailWidth < thumbnailWidth) {
if (DEBUG) {
this._writeToDebugData("This template: " + template + " was thrown out because it required a thumbnail size of " + thumbnailWidth + " by " + thumbnailHeight + ", but the actual data has a size of " + actualThumbnailWidth + " by " + actualThumbnailHeight + ".\n", index, true, true)
}
return
}
var aspectRatio=thumbnailWidth / thumbnailHeight;
var actualAspectRatio=actualThumbnailWidth / actualThumbnailHeight;
if (aspectRatioMin && aspectRatioMax) {
if (actualAspectRatio < aspectRatioMin || actualAspectRatio > aspectRatioMax) {
if (DEBUG) {
this._writeToDebugData("This template: " + template + " was thrown out because it required a thumbnail aspect ratio between  " + aspectRatioMin + " and " + aspectRatioMax + ", but the actual aspect ratio is " + actualAspectRatio + ".\n", index, true, true)
}
return
}
}
if (actualAspectRatio < aspectRatio) {
modifier = "fitWidth"
}
else {
modifier = "fitHeight"
}
}
else {
if (DEBUG) {
this._writeToDebugData("This template: " + template + " was thrown out because it required a thumbnail and the data didn't have one.\n", index, true, true)
}
return
}
}
var templateInfo={
classID: templateDim.classID, height: templateDim.height, width: templateDim.width, thumbnailModifier: modifier, lastResort: templateDim.lastResort, weight: templateDim.weight, type: templateDim.type, minHeight: templateDim.minHeight, isNonFlexible: templateDim.isNonFlexible, thumbnailHeight: thumbnailHeight, thumbnailWidth: thumbnailWidth
};
this._validateHeadlineLengths(item, templateInfo, templateDim, outputTemplates, index)
}, _validateHeadlineLengths: function _validateHeadlineLengths(item, templateInfo, templateDim, outputTemplates, index) {
var minHeadlineLength=templateDim["minHeadlineLength"];
var maxHeadlineLength=templateDim["maxHeadlineLength"];
var headlineValid=true;
if (minHeadlineLength && maxHeadlineLength) {
var strippedHeadline=CommonJS.Utils.stripHTML(item.title);
var length=strippedHeadline.length;
if (length < minHeadlineLength || length > maxHeadlineLength) {
headlineValid = false;
if (DEBUG) {
this._writeToDebugData("This template: " + templateInfo.classID + " was thrown out because it required a headline range of: " + minHeadlineLength + " to " + maxHeadlineLength + ", but the actual data had a length of " + length + ".\n", index, true, true)
}
}
}
if (headlineValid) {
if (this._isSnippetValid(item, templateDim)) {
outputTemplates.push(templateInfo)
}
}
}, _isSnippetValid: function _isSnippetValid(item, templateDim) {
var isValid=true;
var snippetMin=templateDim["snippetMin"];
if (snippetMin) {
var snippetLength=item.snippet ? item.snippet.length : 0;
if (snippetLength < snippetMin) {
isValid = false
}
}
return isValid
}, _getTemplatesForItem: function _getTemplatesForItem(itemWrapper) {
var outputTemplates=[];
var itemTemplateClass=itemWrapper.templateClass;
var classMap=this._templateClassMap[itemTemplateClass];
if (!itemTemplateClass || !classMap) {
return null
}
var item=itemWrapper.item;
var templateList=classMap["templateList"];
for (var i=0, ilen=templateList.length; i < ilen; i++) {
this._validateThumbnailSizes(item, templateList[i], outputTemplates, itemWrapper.index)
}
return outputTemplates
}, _createTemplateInfo: function _createTemplateInfo(template) {
var templateDims=this._templateDefinitions;
var templateDim=templateDims[template];
var height=templateDim["height"];
var width=templateDim["width"];
var thumbnailHeight=templateDim["thumbnailHeight"];
var thumbnailWidth=templateDim["thumbnailWidth"];
var templateInfo={
classID: template, height: height, width: width, thumbnailModifier: "fitBoth", lastResort: false, weight: templateDim.weight, type: templateDim.type, minHeight: templateDim.minHeight, isNonFlexible: templateDim.isNonFlexible, thumbnailHeight: thumbnailHeight, thumbnailWidth: thumbnailWidth
};
return templateInfo
}, _generateLayoutCacheKey: function _generateLayoutCacheKey(datakey) {
var dimensions=this._getDimensions();
var height=this._currentHeight = dimensions.height;
var width=this._currentWidth = dimensions.width;
var supplementalKey=this._supplementalConfigCacheKey;
var key=["EntityClusterLayout_Flex_", datakey, "_"];
if (height > width) {
key.push(height, "_", width)
}
else {
key.push(width, "_", height)
}
if (supplementalKey) {
key.push("_", supplementalKey)
}
key.push("_", this._maxColumnCount);
if (this._enableSeeMore) {
key.push("_", "seeMoreEnabled")
}
return key.join("")
}, _getDimensions: function _getDimensions() {
var height=window.innerHeight;
var width=window.innerWidth;
return {
width: width, height: height
}
}, _telemetryInstrumentation: function _telemetryInstrumentation() {
if (Platform.Telemetry && this.telemetry && this.telemetry.getCurrentImpression) {
var impression=this.telemetry.getCurrentImpression();
if (impression) {
var orderedRenderList=this._layout.orderedRenderList;
this._addTelemetryContent(impression, orderedRenderList);
impression.logContent(Platform.Telemetry.LogLevel.normal);
this._addTelemetryContentView(impression, orderedRenderList)
}
}
}, _addTelemetryContent: function _addTelemetryContent(impression, orderedRenderList) {
if (orderedRenderList) {
for (var i=0, leni=orderedRenderList.length; i < leni; i++) {
var item=orderedRenderList[i];
var telemetryInfo;
if (item.isAd) {
telemetryInfo = this._getAdsTelemetryInfo(item)
}
else {
telemetryInfo = this._getTileTelemetryInfo(item)
}
if (telemetryInfo) {
var k=impression.addContent(telemetryInfo.sourceName, telemetryInfo.partnerCode, telemetryInfo.contentId, telemetryInfo.type, telemetryInfo.date, telemetryInfo.uri, telemetryInfo.slug, telemetryInfo.isSummary, telemetryInfo.worth, telemetryInfo.isAd, telemetryInfo.adCampaign);
item.telemetry = {k: k};
if (!item.isAd) {
var itemWrapper=this._itemWrappers[item.realIndex];
itemWrapper.item.telemetry = {k: k}
}
}
}
}
}, _addTelemetryContentView: function _addTelemetryContentView(impression, orderedRenderList) {
if (orderedRenderList) {
var level=Platform.Telemetry.LogLevel.normal;
for (var i=0, leni=orderedRenderList.length; i < leni; i++) {
var item=orderedRenderList[i];
var telemetry=item.telemetry;
if (telemetry && typeof telemetry.k === "number") {
impression.logContentView(level, telemetry.k, "unknown", true, null)
}
}
}
}, _getTileTelemetryInfo: function _getTileTelemetryInfo(item) {
var itemWrapper=this._itemWrappers[item.realIndex];
var newsItem=itemWrapper.item;
var itemTemplateClass=itemWrapper.templateClass;
var templateClass=this._templateClassMap[itemTemplateClass];
var type;
if (templateClass) {
type = this._convertTypeToTelemetryType(templateClass.type)
}
var date;
if (newsItem.published) {
date = this._convertUtcTime(newsItem.published.utctime)
}
else {
date = new Date(1, 1, 1, 0, 0, 0, 0)
}
var slug=this._stripHTML(newsItem.title);
var worth=newsItem.isLocked ? "subscription" : "normal";
var retValue={
sourceName: newsItem.source, partnerCode: null, contentId: newsItem.destination || newsItem.articleUrl, type: type, date: date, uri: null, slug: slug, isSummary: true, worth: worth, isAd: false, adCampaign: null
};
return retValue
}, _getAdsTelemetryInfo: function _getAdsTelemetryInfo(item) {
var retValue={
isAd: true, adCampaign: this._adUnitId, date: new Date(1, 1, 1, 0, 0, 0, 0)
};
return retValue
}, _convertTypeToTelemetryType: function _convertTypeToTelemetryType(type) {
var telemetryType;
if (this.isVideoClass(type)) {
telemetryType = "video"
}
else if (this.isSlideshowClass(type)) {
telemetryType = "slideshow"
}
else if (this.isArticleClass(type)) {
telemetryType = "article"
}
else {
telemetryType = "app-" + type
}
return telemetryType
}, _convertUtcTime: function _convertUtcTime(utctime) {
var dateValue=0;
if (typeof(utctime) === "number") {
var epoch=Date.UTC(1601, 0, 1, 0, 0, 0);
dateValue = utctime / 10000 + epoch
}
return new Date(dateValue)
}, _showNoResults: function _showNoResults() {
if (this._isDisposed) {
return
}
if (!this._domElement) {
debugger;
return
}
this._hideProgress();
this._hideError();
if (!this._noResultsElt) {
var element=document.createElement("div");
element.className = "noEntityResultsFoundMessage";
var row=document.createElement("div");
row.className = "row";
var image=document.createElement("div");
image.className = "image win-command";
var ring=document.createElement("div");
ring.className = "ring win-commandring win-commandicon";
var icon=document.createElement("div");
icon.className = "icon win-commandimage";
var message=document.createElement("div");
message.className = "message";
message.innerText = this._noResultsMessage;
ring.appendChild(icon);
image.appendChild(ring);
row.appendChild(image);
row.appendChild(message);
element.appendChild(row);
this._noResultsElt = element;
this._domElement.appendChild(element)
}
WinJS.Utilities.removeClass(this._noResultsElt, "platformHide")
}, _hideNoResults: function _hideNoResults() {
if (this._noResultsElt) {
WinJS.Utilities.addClass(this._noResultsElt, "platformHide")
}
}, _renderError: function _renderError(err) {
if (this._isDisposed) {
return
}
this._showError(err);
this.dispatchEvent(ERROR, err);
msWriteProfilerMark("CommonControls:EntityCluster:render:" + this._uniqueID + ":e");
msWriteProfilerMark("CommonControls:EntityCluster:RenderComplete")
}, _showError: function _showError(err) {
this._createErrorModule(err);
this._hideProgress();
this._hideNoResults();
WinJS.Utilities.removeClass(this._errorElt, "platformHide")
}, _hideError: function _hideError() {
if (this._errorElt) {
WinJS.Utilities.addClass(this._errorElt, "platformHide")
}
}, _showProgress: function _showProgress() {
if (!this._progressElt || !this._progressElt.parentElement) {
this._createProgressModule()
}
this._hideNoResults();
this._hideError();
WinJS.Utilities.removeClass(this._progressElt, "platformHide")
}, _hideProgress: function _hideProgress() {
if (this._progressElt) {
WinJS.Utilities.addClass(this._progressElt, "platformHide")
}
}, _createErrorModule: function _createErrorModule(error) {
if (this._isDisposed) {
return
}
if (!this._domElement) {
debugger;
return
}
var that=this;
var data;
var retryFunction=WinJS.Utilities.markSupportedForProcessing(function FlexEntityCluster_retry(evt) {
if (that.retryHandler && that.mode === News.ClusterMode.static) {
that.dispatchEvent("retry", evt)
}
else {
that.render()
}
});
var isFREOfflineError=error && error.message && error.message.indexOf("FREOffline") === 0;
if (error && error.messageResource && error.errorContainerClassName) {
data = CommonJS.Error.getErrorModuleItem(retryFunction, "450px", "100%", error.messageResource, error.errorContainerClassName)
}
else if (!PlatformJS.Utilities.hasInternetConnection() || isFREOfflineError) {
data = CommonJS.Error.getErrorModuleItem(retryFunction, "450px", "100%", "/platform/offline_noContent", "platformOfflineErrorModule")
}
else {
data = CommonJS.Error.getErrorModuleItem(retryFunction, "450px", "100%")
}
var moduleInfo=data.moduleInfo;
var domElement=this._domElement;
var errorElt=document.createElement("div");
errorElt.className = "platformHide";
errorElt.style.width = moduleInfo.width;
errorElt.style.height = moduleInfo.height;
domElement.innerHTML = "";
domElement.appendChild(errorElt);
CommonJS.loadModule(moduleInfo, data, errorElt);
this._errorElt = errorElt
}, _createProgressModule: function _createProgressModule() {
var data=CommonJS.Error.getProgressModuleItem();
var moduleInfo=data.moduleInfo;
var domElement=this._domElement;
var progressElt=document.createElement("div");
progressElt.className = "platformHide";
progressElt.style.width = moduleInfo.width;
progressElt.style.height = moduleInfo.height;
domElement.appendChild(progressElt);
CommonJS.loadModule(moduleInfo, data, progressElt);
this._progressElt = progressElt
}, _processData: function _processData(queryResult) {
var data=null;
if (queryResult && !queryResult.native) {
data = PlatformJS.Utilities.convertManageToJSON(queryResult)
}
else {
data = queryResult
}
return data
}, _queryProviderAsync: function _queryProviderAsync() {
var that=this;
this._showProgress();
var providerConfiguration=PlatformJS.Collections.createStringDictionary();
providerConfiguration.insert("queryServiceId", this.queryServiceId);
return new WinJS.Promise(function FlexEntityCluster_queryPromise(complete, error, progress) {
that.provider.initializeAsync(providerConfiguration).then(function FlexEntityCluster_queryInit(initResult) {
if (!initResult) {
throw"NewsCluster initialization error.";
}
var query=PlatformJS.Collections.createStringDictionary();
for (var key in that.newsQuery) {
query.insert(key, that.newsQuery[key] + "")
}
return that.provider.queryAsync(query)
}).then(function FlexEntityCluster_queryPromiseComplete(queryResult) {
var data=that._processData(queryResult);
complete(data)
}, function FlexEntityCluster_queryPromiseError(e) {
error(e)
}, function FlexEntityCluster_queryPromiseProgress(queryResult) {
var data=that._processData(queryResult);
progress(data)
})
})
}, _debugAppendLayoutInfo: function _debugAppendLayoutInfo(layout) {
if (this._debugTemplateSelectorData) {
var portrait=layout.portrait;
var landscape=layout.landscape;
if (portrait && portrait.debugData) {
var portraitDebug=portrait.debugData;
for (var i=0, leni=portraitDebug.length; i < leni; i++) {
this._debugTemplateSelectorData.portrait[i] = this._debugTemplateSelectorData.portrait[i].concat(portraitDebug[i])
}
}
if (landscape && landscape.debugData) {
var landscapeDebug=landscape.debugData;
for (var j=0, lenj=landscapeDebug.length; j < lenj; j++) {
this._debugTemplateSelectorData.landscape[j] = this._debugTemplateSelectorData.landscape[j].concat(landscapeDebug[j])
}
}
}
}, _writeToDebugData: function _writeToDebugData(text, index, isLandscape, isPortrait) {
if (this._debugTemplateSelectorData) {
if (isLandscape && this._debugTemplateSelectorData.landscape[index]) {
this._debugTemplateSelectorData.landscape[index].push(text)
}
if (isPortrait && this._debugTemplateSelectorData.portrait[index]) {
this._debugTemplateSelectorData.portrait[index].push(text)
}
}
}, _handleDebugOnClick: function _handleDebugOnClick(index, element) {
var flyout=document.getElementById("entityClusterDebugFlyout");
var flyoutControl;
var item=this.newsItems[index];
var that=this;
if (!flyout) {
var flyoutHTML="<style>#ecDebugEdit div { width: 90px; display: inline-block } #ecDebugParameter div { width: 150px; display: inline-block }</style>";
flyoutHTML += "<div id='ecDebugParameter'></div><hr />";
flyoutHTML += "<div id='ecDebugMessage'></div><hr />";
flyoutHTML += "<div id='ecDebugEdit'>";
flyoutHTML += "    <div>Title:    </div><input type='text' id='ecEditTitle' /><br />";
flyoutHTML += "    <div>Snippet:  </div><input type='text' id='ecEditSnippet' /><br />";
flyoutHTML += "    <button id='ecEditApply'>Apply</button>";
flyoutHTML += "</div>";
flyout = CommonJS.FlyoutManager.getFlyoutElement();
flyout.id = "entityClusterDebugFlyout";
flyout.innerHTML = flyoutHTML;
flyoutControl = new WinJS.UI.Flyout(flyout, {alignment: "left"})
}
else {
flyoutControl = flyout.winControl;
flyoutControl.onaftershow = null;
flyoutControl.onafterhide = null
}
var paramElt=document.getElementById("ecDebugParameter");
var labelElt=document.getElementById("ecDebugMessage");
var selectElt=document.getElementById("ecDebugEdit");
var newTitle=document.getElementById("ecEditTitle");
var newSnippet=document.getElementById("ecEditSnippet");
var applyButton=document.getElementById('ecEditApply');
flyoutControl.onafterhide = function(e) {
applyButton.onclick = null
};
flyoutControl.onaftershow = function(e) {
applyButton.onclick = that._debugFlyoutTemplateApply.bind(that, e, index, flyout)
};
if (flyout && flyoutControl) {
var displayData=PlatformJS.Utilities.getDisplayData();
var currentOrientationDebugData=displayData.landscape ? this._debugTemplateSelectorData.landscape : this._debugTemplateSelectorData.portrait;
var templateDefinitions=[];
var tCDef=this._templateClassMap[item.templateClass];
var tDef=this._templateDefinitions[item.template];
if (tCDef && tDef) {
templateDefinitions.push(["template size", tDef.width + " x " + tDef.height]);
templateDefinitions.push(["headline length", tDef.minHeadlineLength + " - " + tDef.maxHeadlineLength]);
templateDefinitions.push(["thumbnail size", tDef.thumbnailWidth + " x " + tDef.thumbnailHeight]);
paramElt.innerHTML = [item.templateClass, item.template].join(" ") + "<br />";
templateDefinitions.forEach(function FlexEntityCluster_debugFlyout(elem, index) {
paramElt.innerHTML += "<div>" + elem[0] + ":</div> " + elem[1] + "<br />"
})
}
labelElt.innerText = currentOrientationDebugData[index].join("");
newTitle.value = item.title;
newSnippet.value = item.snippet;
flyoutControl.show(element, "right")
}
}, _debugFlyoutTemplateApply: function _debugFlyoutTemplateApply(e, itemIndex, flyout) {
var newTitle=document.getElementById("ecEditTitle");
var newSnippet=document.getElementById("ecEditSnippet");
var item=this.newsItems[itemIndex];
if (item) {
item.title = newTitle.value;
item.snippet = newSnippet.value;
item.testData = true;
this.newsItems[itemIndex] = item;
this._renderResponse(this._response)
}
if (flyout && flyout.winControl) {
flyout.winControl.hide()
}
}, _addSupplementalConfigs: function _addSupplementalConfigs() {
var supplemental=CommonJS.News.SupplementalConfig;
if (supplemental && supplemental.Config && !this._supplementalConfigCacheKey) {
this._supplementalConfigCacheKey = ["SupplementalConfig_", supplemental.Version].join("");
var supplementalTemplateClassMap=supplemental.Config.TemplateClassMap;
var supplementalTemplateDefinitions=supplemental.Config.TemplateDefinitions;
if (supplementalTemplateClassMap) {
this._templateClassMap = this._mergeObject(this._templateClassMap, supplementalTemplateClassMap)
}
if (supplementalTemplateDefinitions) {
this._templateDefinitions = this._mergeObject(this._templateDefinitions, supplementalTemplateDefinitions)
}
}
}, _mergeObject: function _mergeObject(obj1, obj2) {
var retVal={};
this._copyObject(retVal, obj1);
this._copyObject(retVal, obj2);
return retVal
}, _copyObject: function _copyObject(retVal, obj) {
for (var name in obj) {
retVal[name] = obj[name]
}
}, getLastKnownGoodState: function getLastKnownGoodState() {
var key=this._generateLayoutCacheKey("stateTest");
var itemWrappers=this._constructGoodStateItemWrappers();
var layout=this._layout;
if (layout && itemWrappers.length > 0) {
return {
itemWrappers: itemWrappers, layout: layout, videoList: this._videoList, key: key, adsOptions: {
adsList: this._adsList, subcategory: this._subcategory, providerId: this._providerId, adLayoutOverrideKey: this._adLayoutOverrideKey
}
}
}
else {
return null
}
}, isLastKnownGoodStateValid: function isLastKnownGoodStateValid(state) {
var result=false;
if (state) {
this._addSupplementalConfigs();
var newKey=this._generateLayoutCacheKey("stateTest");
if (newKey === state.key && this._isLayoutValid(state.layout) && state.itemWrappers) {
result = true
}
}
return result
}, renderLastKnownGoodState: function renderLastKnownGoodState(state) {
var that=this;
if (state) {
return CommonJS.SchedulePromise(this._scheduler, CommonJS.TaskPriority.normal, "EntityCluster:RenderLastKnownGoodState").then(function renderLastGoodKnownStateStart() {
var resultPromise=null;
that._addSupplementalConfigs();
var newKey=that._generateLayoutCacheKey("stateTest");
var itemWrappers=that._itemWrappers = state.itemWrappers;
var layout=that._layout = state.layout;
var adsOptions=state.adsOptions;
that._videoList = state.videoList;
var dimensions=that._getDimensions();
that._currentHeight = dimensions.height;
that._currentWidth = dimensions.width;
that._subcategory = adsOptions.subcategory;
that._providerId = adsOptions.providerId;
that._adLayoutOverrideKey = adsOptions.adLayoutOverrideKey;
that._adsList = adsOptions.adsList;
if (newKey === state.key && itemWrappers && that.isLastKnownGoodStateValid(state)) {
that._createDebugData(itemWrappers);
resultPromise = that._renderDOM(layout, itemWrappers, that._videoList)
}
else {
resultPromise = that._resizeLastKnownGoodState()
}
return resultPromise
})
}
return WinJS.Promise.wrap(null)
}, _isLayoutValid: function _isLayoutValid(layout) {
var orientationString=this._getResultOrientation();
var isLayoutValid=false;
if (layout && layout[orientationString]) {
var windowSize=layout[orientationString].windowSize;
var dimensions=this._getDimensions();
if (windowSize.width === dimensions.width && windowSize.height === dimensions.height) {
isLayoutValid = true
}
}
return isLayoutValid
}, _constructGoodStateItemWrappers: function _constructGoodStateItemWrappers() {
var itemWrappers=this._itemWrappers;
var retVal=[];
if (itemWrappers) {
for (var i=0, leni=itemWrappers.length; i < leni; i++) {
var itemWrapper=itemWrappers[i];
var item=itemWrapper.item;
var newItem={
articleUrl: item.articleUrl, altText: item.altText, articleid: item.articleid, contentid: item.contentid, destination: item.destination, editorial: item.editorial, imageAttribution: item.imageAttribution, imageTag: item.imageTag, published: item.published, publishTime: item.publishTime, snippet: item.snippet, source: item.source, sourceImageUrl: item.sourceImageUrl, telemetry: item.telemetry, templateClass: item.templateClass, thumbnail: item.thumbnail, title: item.title, type: item.type, updated: item.updated, updatedTime: item.updatedTime
};
var newItemWrapper={
index: itemWrapper.index, templateClass: itemWrapper.templateClass, item: newItem
};
retVal.push(newItemWrapper)
}
}
return retVal
}, _resizeLastKnownGoodState: function _resizeLastKnownGoodState() {
var that=this;
return this._layoutGeneration(this._itemWrappers, null, null).then(function FlexEntityCluster_resizeLKGState(layout) {
msWriteProfilerMark("CommonControls:EntityCluster:generateLayoutNormal:e");
if (layout && that._itemWrappers && that._videoList) {
that._layout = layout;
return that._renderDOM(layout, that._itemWrappers, that._videoList)
}
return WinJS.Promise.wrap(null)
})
}, setOptionsLastKnownGoodState: function setOptionsLastKnownGoodState(options) {
var unitWidth=this._unitWidth = options.unitWidth > 0 ? options.unitWidth : 0;
this._noResultsMessage = options.noResultsMessage ? options.noResultsMessage : PlatformJS.Services.resourceLoader.getString("/platform/invalidEntry");
var maxColumnCount=options.maxColumnCount;
this._adLayoutOverrideKey = options.adLayoutOverrideKey;
this._subcategory = options.subcategory;
this._providerId = options.providerId;
this._adsList = options.adsList;
this._adsWrapperControlList = [];
this._progressElt = null;
this._errorElt = null;
this._templateClassMap = options.configObject.TemplateClassMap;
this._templateDefinitions = options.configObject.TemplateDefinitions;
this._instrumentationEntryPoint = options.instrumentationEntryPoint;
WinJS.UI.setOptions(this, options)
}
}, {
isInClusterAdLoaded: false, TemplateSelectorDebuggingEnabled: false, itemClickHandler: function itemClickHandler(evt) {
var item=evt.item;
var url=item.articleUrl;
if (url) {
var uri=new Windows.Foundation.Uri(url);
Windows.System.Launcher.launchUriAsync(uri).then()
}
}, AdTileWidth: 30, InClusterAdHeight: 250, ClusterType: {
V1: "VideoCluster", S2: "SlideshowCluster"
}, MaxHeadlineLength: 60, DefaultLargeItemMaxHeadlineLength: 50, DefaultUnitHeight: 14, DefaultUnitWidth: 30, GridUnit: 10
}), WinJS.UI.DOMEventMixin), ClusterMode: {
static: "static", dynamic: "dynamic"
}, ColumnType: {
firstColumn: "firstColumn", secondColumn: "secondColumn", additionalColumn: "additionalColumn", headlineColumn: "headlineColumn"
}
})
})(WinJS);
(function FlexLayoutGenerator_init(WinJS) {
"use strict";
var DEBUG=PlatformJS.isDebug;
var News=WinJS.Namespace.define("CommonJS.News", {FlexLayoutGenerator: WinJS.Class.define(function FlexLayoutGenerator_ctor(options) {
options = options || {};
this._enableSeeMore = options.enableSeeMore;
this._forceShowSeeMore = options.forceShowSeeMore;
this._maxColumnCount = options.maxColumnCount;
this._showHeadlineList = options.showHeadlineList;
this._headlineClassName = options.headlineClassName;
this._headlineMinHeight = options.headlineMinHeight;
this._isFlexCluster = options.isFlexCluster;
this._templateDefinitions = options.configObj.TemplateDefinitions;
this._rulesDefinitions = options.configObj.Rules;
this._unitHeight = options.unitHeight;
this._unitWidth = options.unitWidth;
this._inClusterAdUnitId = options.inClusterAdUnitId;
this._adLayoutOverrideKey = options.adLayoutOverrideKey
}, {
_enableSeeMore: null, _maxColumnCount: 0, _showHeadlineList: true, _headlineMinHeight: 0, _headlineClassName: null, _isFlexCluster: true, _additionalColumnCount: 0, _prevItemHeight: 0, _templateDefinitions: 0, _rulesDefinitions: 0, _unitHeight: 0, _unitWidth: 0, _inClusterAdUnitId: null, generateLayout: function generateLayout(templateData, screenHeight) {
var layout={
largeItems: [], firstColumnItems: [], secondColumnItems: [], gridItems: [], remainingFlexItems: [], additionalColumnItems: [], headlineList: [], adList: [], orderedRenderList: [], enableSeeMore: false, seeMoreInSecondColumn: false, seeMoreInAdditionalColumn: false, additionalColumnCount: 0, clusterHeight: 0, gridRowCount: 0, gridColumnCount: 0, miniFlexRowCount: 0, gridHeight: 0, miniFlexHeight: 0, inClusterAdLocation: null, enoughHeadlines: true
};
var itemIndex=0;
var availableHeight=screenHeight;
var maxColumnCount=this._maxColumnCount ? this._maxColumnCount : templateData.length;
var adHeight=News.EntityCluster.InClusterAdHeight;
var gridRowCount=0;
var gridColumnCount=0;
var templateDefinitions=this._templateDefinitions;
var rules=this._rulesDefinitions;
var rulesLength=rules ? rules.length : 0;
var ruleIndex;
var columnCount=0;
var prevItemIndex;
if (rulesLength === 0) {
var firstTileLayout=this._fillLargeTile(layout.largeItems, templateData[0], availableHeight);
itemIndex = firstTileLayout.itemIndex;
availableHeight = firstTileLayout.availableHeight;
if (layout.largeItems.length > 0 || maxColumnCount === 2) {
columnCount = 2;
itemIndex = this._fillItems(layout.firstColumnItems, itemIndex, availableHeight, templateData, false).currentIndex;
if (maxColumnCount === 2 && this._enableSeeMore) {
availableHeight -= 120
}
itemIndex = this._fillItems(layout.secondColumnItems, itemIndex, availableHeight, templateData, false).currentIndex;
if (!this._isFlexCluster) {
var height=layout.largeItems[0] ? layout.largeItems[0].minHeight + 10 : 0;
for (var i=0; i < layout.firstColumnItems.length; i++) {
height += layout.firstColumnItems[i].minHeight + 10
}
layout.clusterHeight = height
}
}
}
else if (rulesLength > 0) {
for (ruleIndex = 0; ruleIndex < rulesLength; ruleIndex++) {
if (rules[ruleIndex].type === "static") {
var templateList=rules[ruleIndex].templates;
var newColumnCount,
newRowCount;
newRowCount = rules[ruleIndex].row + templateDefinitions[templateList[0]].height;
if (newRowCount > gridRowCount) {
gridRowCount = newRowCount
}
if (maxColumnCount > gridColumnCount) {
newColumnCount = rules[ruleIndex].column + templateDefinitions[templateList[0]].width;
if (gridColumnCount < newColumnCount && newColumnCount <= maxColumnCount) {
gridColumnCount = newColumnCount
}
}
}
}
if (gridColumnCount > 0 && gridRowCount > 0) {
itemIndex = this._generateStaticGridLayout(itemIndex, screenHeight, layout, rules, templateData, gridColumnCount, gridRowCount);
if (layout.gridItems.length > 0) {
layout.miniFlexHeight = screenHeight - layout.gridHeight;
availableHeight = layout.miniFlexHeight - CommonJS.News.EntityCluster.GridUnit;
columnCount = 0;
prevItemIndex = itemIndex;
if (gridColumnCount > 0 && gridRowCount > 0) {
for (; columnCount < gridColumnCount && itemIndex < templateData.length; columnCount++) {
itemIndex = this._fillItems(layout.remainingFlexItems, itemIndex, availableHeight, templateData, false).currentIndex
}
}
}
}
}
if (itemIndex >= templateData.length && layout.secondColumnItems.length > 0) {
if (this._forceShowSeeMore) {
layout.enableSeeMore = true;
layout.seeMoreInSecondColumn = true
}
if (this._inClusterAdUnitId) {
var heightForAd=screenHeight;
heightForAd = screenHeight - layout.largeItems[0].minHeight;
if (layout.seeMoreInSecondColumn) {
heightForAd -= 120
}
if (heightForAd > adHeight) {
layout.inClusterAdLocation = News.ColumnType.secondColumn
}
}
}
var prevItemIndex=itemIndex;
var lastColumnItemCount=0;
var listIntervals=PlatformJS.Ads ? PlatformJS.Ads.Config.instance.adManager.getListFrequency(this._adLayoutOverrideKey) : {};
var listAdStartColumnIndex=(listIntervals.start || maxColumnCount) - 1;
var listAdRepeatColumn=(listIntervals.repeat || maxColumnCount) + 1;
for (; columnCount < maxColumnCount - 1 && itemIndex < templateData.length; columnCount++) {
if (columnCount >= listAdStartColumnIndex && ((columnCount - listAdStartColumnIndex) % listAdRepeatColumn === 0) && (templateData.length - itemIndex > 2)) {
layout.adList.push(layout.additionalColumnItems.length)
}
else {
var newItemIndex=this._fillItems(layout.additionalColumnItems, itemIndex, screenHeight, templateData, false).currentIndex;
lastColumnItemCount = newItemIndex - itemIndex;
itemIndex = newItemIndex;
if (itemIndex > prevItemIndex && layout.additionalColumnItems[0]) {
this._additionalColumnCount += layout.additionalColumnItems[0].width;
prevItemIndex = itemIndex
}
}
}
if (itemIndex < templateData.length) {
if (columnCount < maxColumnCount) {
availableHeight = this._enableSeeMore ? screenHeight - 120 : screenHeight;
if (this._showHeadlineList && (templateData.length - itemIndex > 2)) {
var headlineLayout=this._fillItems(layout.headlineList, itemIndex, availableHeight, templateData, true);
itemIndex = headlineLayout.currentIndex;
layout.enoughHeadlines = headlineLayout.enoughHeadlines;
layout.inClusterAdLocation = News.ColumnType.headlineColumn
}
else {
itemIndex = this._fillItems(layout.additionalColumnItems, itemIndex, availableHeight, templateData, false).currentIndex;
if (itemIndex > prevItemIndex) {
this._additionalColumnCount += layout.additionalColumnItems[0].width
}
layout.inClusterAdLocation = News.ColumnType.additionalColumn
}
}
if (this._enableSeeMore && (itemIndex < templateData.length || this._forceShowSeeMore)) {
layout.enableSeeMore = true;
if (layout.headlineList.length === 0) {
if (layout.additionalColumnItems.length > 0) {
layout.seeMoreInAdditionalColumn = true
}
else {
layout.seeMoreInSecondColumn = true
}
}
}
}
else if (this._inClusterAdUnitId && !layout.inClusterAdLocation) {
layout.inClusterAdLocation = News.ColumnType.additionalColumn;
var columnHeight=0;
var firstItemIndex=layout.additionalColumnItems.length - lastColumnItemCount;
for (i = firstItemIndex; i < layout.additionalColumnItems.length; i++) {
columnHeight += layout.additionalColumnItems[i].minHeight
}
if (columnHeight > (screenHeight - adHeight)) {
var heightReduced=0;
for (var i=layout.additionalColumnItems.length - 1; i >= 0; i--) {
if (heightReduced < adHeight) {
var removedItem=layout.additionalColumnItems.splice(i, 1);
heightReduced += removedItem.minHeight
}
}
}
}
layout.additionalColumnCount = this._additionalColumnCount;
return layout
}, _generateStaticGridLayout: function _generateStaticGridLayout(itemIndex, screenHeight, layout, rules, templateData, gridColumnCount, gridRowCount) {
var gridUnit=CommonJS.News.EntityCluster.GridUnit;
var unitHeightInPixels=this._unitHeight * gridUnit + gridUnit;
var unitWidthInPixels=this._unitWidth * gridUnit;
var gridMatrix=[];
var rowIndex,
colIndex;
var startItemIndex=itemIndex;
var gridColumn;
for (rowIndex = 0; rowIndex < gridRowCount; rowIndex++) {
gridColumn = [];
for (colIndex = 0; colIndex < gridColumnCount; colIndex++) {
gridColumn[colIndex] = 0
}
gridMatrix[rowIndex] = gridColumn
}
var currentRule;
for (var ruleIndex=0; ruleIndex < rules.length; ruleIndex++) {
currentRule = rules[ruleIndex];
gridMatrix[currentRule.row][currentRule.column] = currentRule.templates
}
var itemLayout;
var availableHeight;
var gridHeight=0;
var availableTemplates;
for (colIndex = 0; colIndex < gridColumnCount; colIndex++) {
if (templateData.length <= itemIndex) {
gridColumnCount = colIndex;
break
}
if (gridHeight + availableHeight < screenHeight) {
gridHeight = screenHeight - availableHeight
}
availableHeight = screenHeight;
for (rowIndex = 0; rowIndex < gridRowCount; rowIndex++) {
if (templateData.length <= itemIndex) {
break
}
if (availableHeight < unitHeightInPixels) {
gridRowCount = rowIndex;
break
}
if (gridMatrix[rowIndex][colIndex] === 1) {
availableHeight -= unitHeightInPixels;
continue
}
if (gridMatrix[rowIndex][colIndex] === 0) {
availableTemplates = templateData[itemIndex]
}
else {
availableTemplates = [];
var validatedTemplates=templateData[itemIndex];
var staticTemplateClassIDs=gridMatrix[rowIndex][colIndex];
var count1,
count2;
for (count1 = 0; count1 < validatedTemplates.length; count1++) {
for (count2 = 0; count2 < staticTemplateClassIDs.length; count2++) {
if (validatedTemplates[count1].classID === staticTemplateClassIDs[count2]) {
availableTemplates.push(validatedTemplates[count1]);
break
}
}
}
}
this._validateTemplatesForHeightAndWidth(rowIndex, colIndex, availableHeight, availableTemplates, gridMatrix, gridRowCount, gridColumnCount);
if (availableTemplates.length === 0) {
itemIndex = startItemIndex;
gridColumnCount = 0;
gridRowCount = 0;
gridHeight = 0;
break
}
itemLayout = this._fillGridItem(itemIndex, availableHeight, availableTemplates, gridColumnCount - colIndex, gridRowCount - rowIndex);
availableHeight -= itemLayout.minHeight + gridUnit;
itemLayout.row = rowIndex;
itemLayout.column = colIndex;
var itemHeight=itemLayout.height;
var itemWidth=itemLayout.width;
for (var k=0; k < itemWidth; k++) {
for (var l=0; l < itemHeight; l++) {
gridMatrix[rowIndex + l][colIndex + k] = 1
}
}
layout.gridItems.push(itemLayout);
itemIndex++;
rowIndex += itemHeight - 1
}
}
if (gridHeight + availableHeight < screenHeight) {
gridHeight = screenHeight - availableHeight
}
layout.gridRowCount = gridRowCount;
layout.gridColumnCount = gridColumnCount;
layout.gridHeight = gridHeight;
return itemIndex
}, _validateTemplatesForHeightAndWidth: function _validateTemplatesForHeightAndWidth(rowIndex, colIndex, availableHeight, availableTemplates, gridMatrix, gridRowCount, gridColumnCount) {
var heightValid;
var widthValid;
var count1,
count2;
var maxRowCount;
var validTemplatesLength=availableTemplates.length;
for (count1 = 0; count1 < validTemplatesLength; count1++) {
heightValid = true;
widthValid = true;
maxRowCount = rowIndex + availableTemplates[count1].height;
if (maxRowCount <= gridRowCount && availableTemplates[count1].minHeight <= availableHeight) {
for (count2 = rowIndex; count2 < maxRowCount; count2++) {
if (gridMatrix[count2][colIndex] === 1) {
heightValid = false;
break
}
}
}
else {
heightValid = false
}
if (colIndex + availableTemplates[count1].width > gridColumnCount) {
widthValid = false
}
if (!heightValid || !widthValid) {
availableTemplates.splice(count1, 1);
count1--;
validTemplatesLength--
}
}
}, _fillGridItem: function _fillGridItem(currentIndex, availableHeight, templateList, remainingColumns, remainingRows) {
var bucket=[];
var itemLayout=null;
if (templateList && templateList.length > 0) {
var satisfiedList=[];
for (var tIndex=0; tIndex < templateList.length; tIndex++) {
var template=templateList[tIndex];
if (template.minHeight <= availableHeight && template.width <= remainingColumns && template.height <= remainingRows) {
var weight=template.weight || 1;
for (var k=0; k < weight; k++) {
satisfiedList.push(template)
}
}
}
while (satisfiedList.length > 0) {
var index=Math.floor(Math.random() * satisfiedList.length);
var chosen=satisfiedList[index];
if (!chosen.lastResort || satisfiedList.length === 1) {
itemLayout = this._getItemLayout(chosen, currentIndex, false);
break
}
else {
satisfiedList.splice(index, 1)
}
}
}
return itemLayout
}, _fillLargeTile: function _fillLargeTile(bucket, templateList, availableHeight) {
var itemIndex=0;
if (!templateList || templateList.length === 0) {
return {
availableHeight: availableHeight, itemIndex: itemIndex
}
}
var satisfiedList=[];
for (var tIndex=0, len=templateList.length; tIndex < len; tIndex++) {
var template=templateList[tIndex];
if (template.width === 2 && !template.lastResort) {
satisfiedList.push(template)
}
}
if (satisfiedList.length > 0) {
var index=Math.floor(Math.random() * satisfiedList.length);
var chosen=satisfiedList[index];
bucket.push(this._getItemLayout(chosen, itemIndex, false, true));
availableHeight = availableHeight - chosen.minHeight - 10;
itemIndex++
}
return {
availableHeight: availableHeight, itemIndex: itemIndex
}
}, _fillItems: function _fillItems(inputColumn, startIndex, screenHeight, templateData, isHeadlineItem) {
var currentIndex=startIndex;
var availableHeight=screenHeight;
var bucket=[];
var prevItemHeight=this._prevItemHeight;
var enoughHeadlines=true;
if (!isHeadlineItem) {
for (currentIndex = startIndex; currentIndex < templateData.length; currentIndex++) {
var templateList=templateData[currentIndex];
if (templateList && templateList.length > 0) {
var satisfiedList=[];
var filled=false;
for (var tIndex=0; tIndex < templateList.length; tIndex++) {
var template=templateList[tIndex];
if (prevItemHeight < 3 || template.height < 3 || template.isNonFlexible) {
if ((template.minHeight <= availableHeight) && (template.width === 1 || template.lastResort)) {
var weight=template.weight || 1;
for (var k=0; k < weight; k++) {
satisfiedList.push(template)
}
}
}
}
while (satisfiedList.length > 0) {
var index=Math.floor(Math.random() * satisfiedList.length);
var chosen=satisfiedList[index];
if (!chosen.lastResort || satisfiedList.length === 1) {
bucket.push(this._getItemLayout(chosen, currentIndex, false));
filled = true;
prevItemHeight = chosen.height;
availableHeight -= chosen.minHeight + 10;
break
}
else {
satisfiedList.splice(index, 1)
}
}
if (!filled) {
break
}
}
}
this._prevItemHeight = prevItemHeight
}
else {
var headlineClassName=this._headlineClassName;
var headlineMinHeight=this._headlineMinHeight;
var availableSpace=Math.floor(screenHeight / headlineMinHeight);
var availableCount=templateData.length - startIndex;
var minLength=availableCount < availableSpace ? availableCount : availableSpace;
if (availableSpace - availableCount > 2) {
enoughHeadlines = false
}
currentIndex = startIndex + minLength;
for (; startIndex < currentIndex; startIndex++) {
if (templateData[startIndex] && templateData[startIndex].length > 0) {
var chosenTemplate=this._getHeadlineTemplate(templateData[startIndex][0], headlineClassName, headlineMinHeight);
bucket.push(this._getItemLayout(chosenTemplate, startIndex, true))
}
}
}
bucket.map(function FlexLayoutGenerator_bucket_map(item) {
inputColumn.push(item)
});
return {
currentIndex: currentIndex, enoughHeadlines: enoughHeadlines
}
}, _getItemLayout: function _getItemLayout(template, index, isHeadlineItem, isLargeItem) {
if (!template) {
return {
itemIndex: index, classID: "", thumbnailModifier: "", minHeight: 140, width: 1, isHeadlineItem: isHeadlineItem, isLargeItem: isLargeItem
}
}
return {
itemIndex: index, classID: template.classID, thumbnailModifier: template.thumbnailModifier, minHeight: template.minHeight, width: template.width, height: template.height, isHeadlineItem: isHeadlineItem, thumbnailHeight: template.thumbnailHeight, thumbnailWidth: template.thumbnailWidth, isLargeItem: isLargeItem
}
}, _getHeadlineTemplate: function _getHeadlineTemplate(template, className, minHeight) {
return {
classID: className, thumbnailModifier: "", minHeight: minHeight, thumbnailHeight: template ? template.thumbnailHeight : template, thumbnailWidth: template ? template.thumbnailWidth : template
}
}
}, {
RowMargin: 1, ColMargin: 1
})})
})(WinJS);
(function _OrientationLayoutGenerator_8(WinJS) {
"use strict";
var News=WinJS.Namespace.define("CommonJS.News", {OrientationLayoutGenerator: {generateLayout: function generateLayout(templateData, layoutOptions) {
var displayData=PlatformJS.Utilities.getDisplayData();
var screenHeight=displayData.clientHeight - layoutOptions.offset;
var currentLayoutGenerator=new CommonJS.News.FlexLayoutGenerator(layoutOptions);
var currentLayout=currentLayoutGenerator.generateLayout(templateData, screenHeight);
currentLayout.windowSize = {
width: displayData.clientWidth, height: displayData.clientHeight
};
screenHeight = displayData.clientWidth - layoutOptions.offset;
var otherLayoutGenerator=new CommonJS.News.FlexLayoutGenerator(layoutOptions);
var otherLayout=otherLayoutGenerator.generateLayout(templateData, screenHeight);
otherLayout.windowSize = {
width: displayData.clientHeight, height: displayData.clientWidth
};
var layout={};
if (displayData.landscape || !displayData.isFullScreen) {
layout.landscape = currentLayout;
layout.portrait = otherLayout
}
else {
layout.portrait = currentLayout;
layout.landscape = otherLayout
}
return layout
}}})
})(WinJS)