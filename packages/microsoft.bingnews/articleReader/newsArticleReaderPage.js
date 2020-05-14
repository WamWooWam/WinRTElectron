/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
WinJS.Namespace.define("NewsJS", {
NewsArticleReaderPage: WinJS.Class.derive(DynamicPanoJS.DynamicArticleReaderPage, function(state) {
DynamicPanoJS.DynamicArticleReaderPage.call(this, state);
NewsJS.Partners.Theme.onNavigated(state);
if (!NewsJS.hasLoadedArticleReaderCss) {
var stylesheetNode=document.createElement("link");
stylesheetNode.setAttribute("href", "/css/articleReader.css");
stylesheetNode.setAttribute("rel", "stylesheet");
document.getElementsByTagName("HEAD")[0].appendChild(stylesheetNode);
NewsJS.hasLoadedArticleReaderCss = true
}
NewsJS.Utilities.loadDeferredStylesheets()
}, {
onVisibilityChange: function onVisibilityChange(event) {
if (this._isNytArticle() && document && !document.msHidden) {
PlatformJS.deferredTelemetry(DynamicPano.DynamicPanoPage._recordNytLaunch)
}
}, onNavigateAway: function onNavigateAway() {
if (!NewsJS.Utilities.isPartnerApp) {
NewsJS.StateHandler.instance.syncWithPdp()
}
DynamicPanoJS.DynamicArticleReaderPage.prototype.onNavigateAway.call(this)
}, dispose: function dispose() {
DynamicPanoJS.DynamicArticleReaderPage.prototype.dispose.call(this);
NewsJS.Partners.Theme.onNavigateAway()
}, _handleShareRequestImpl: function _handleShareRequestImpl(request, shareData) {
var sharingEnabled=Platform.Utilities.FailSafeConfiguration.isEnabled("Application", "CMSArticleSharing");
if (!sharingEnabled) {
return
}
var overrideSnippet=(shareData && shareData.articleHeader && shareData.pageState && shareData.pageState.providerConfiguration && shareData.pageState.providerConfiguration.articleInfos);
var originalSnippet;
if (overrideSnippet) {
originalSnippet = shareData.articleHeader.snippet;
var articleInfoContainer=JSON.parse(shareData.pageState.providerConfiguration.articleInfos);
var articleInfos=articleInfoContainer.articleInfos;
var targetId=shareData.articleId;
var len=articleInfos.length;
for (var i=0; i < len; i++) {
if (articleInfos[i].articleId === targetId) {
var prefferedSnippet=articleInfos[i].snippet;
if (prefferedSnippet) {
shareData.articleHeader.snippet = NewsJS.Utilities.stripHTML(prefferedSnippet)
}
break
}
}
}
DynamicPanoJS.DynamicArticleReaderPage.prototype._handleShareRequestImpl.call(this, request, shareData);
if (overrideSnippet) {
shareData.articleHeader.snippet = originalSnippet
}
}, _recordArticleView: function _recordArticleView(instrumentationData) {
var recordingPromise=DynamicPanoJS.DynamicArticleReaderPage.prototype._recordArticleView.call(this, instrumentationData);
return recordingPromise.then(function newsarticlereaderpage_recordarticleview() {
if (instrumentationData) {
var content=instrumentationData.content;
if (content && content.partnerCode === "NY" && content.partnerUri && content.accessibility) {
PlatformJS.deferredTelemetry(function _logNewYorkTimesArticleView() {
NYT.UPT.instance.recordArticleView(content.partnerUri, content.uri || "")
})
}
}
})
}, _getSharingAppParam: function _getSharingAppParam() {
return 1
}, _isNytArticle: function _isNytArticle() {
return this.partner === "NYT"
}
}), hasLoadedArticleReaderCss: false
})
})()