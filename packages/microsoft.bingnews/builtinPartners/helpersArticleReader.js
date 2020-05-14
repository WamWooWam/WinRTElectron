/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
WinJS.Namespace.define("NewsJS.Partners", {
ArticleReaderProvider: WinJS.Class.define(function partner_articlereaderprovider_ctor(state){}, {
_sprinkleContent: function _sprinkleContent(article, contentBlocks, assetBlocks, state) {
var i=0;
var blocks=article.blocks;
if (contentBlocks.length < 7 && (assetBlocks.length > 0 || (article.title && article.title.titleImage))) {
article.metadata.renderAll = true;
article.title.publisher = null;
for (i = 0; i < assetBlocks.length; i++) {
blocks.append(assetBlocks[i])
}
for (i = 0; i < contentBlocks.length; i++) {
blocks.append(contentBlocks[i])
}
return
}
if (state.initialContentBlocks) {
for (i = 0; i < state.initialContentBlocks && contentBlocks.length > 0; i++) {
blocks.append(contentBlocks.shift())
}
}
var sprinkleSpacing=Math.floor(assetBlocks.length > 0 ? contentBlocks.length / (assetBlocks.length + 1) : 0),
blockCount=0;
while (assetBlocks.length > 0 || contentBlocks.length > 0) {
if ((state.haveMultimediaSpan || blockCount > 0) && sprinkleSpacing > 0 && blockCount % sprinkleSpacing === 0 && assetBlocks.length > 0) {
blocks.append(assetBlocks.shift())
}
else {
if (contentBlocks.length > 0) {
blocks.append(contentBlocks.shift())
}
else if (assetBlocks.length > 0) {
blocks.append(assetBlocks.shift())
}
}
blockCount++
}
}, _validateTitleImage: function _validateTitleImage(imageResource) {
var minAspectRatio=1.3;
var maxAspectRatio=1.89;
var width=imageResource.width;
var height=imageResource.height;
var aspectRatio=width / height;
if (aspectRatio < minAspectRatio || aspectRatio > maxAspectRatio) {
return false
}
else {
return true
}
}, sprinkleAds: function sprinkleAds(feed) {
var options={
section: this.feedIdentifierValue, location: "article", position: "interstitial"
};
var partnerInterstitials=PlatformJS.Ads.Partners.AdsManager.instance.getFormattedAdsMetadataForPartnerByType(this.partner, "interstitial", options);
if (!partnerInterstitials || partnerInterstitials.length === 0 || !partnerInterstitials.adDisplayController.isVisible()) {
return feed
}
var newList=[];
for (var i=0; i < feed.length; i++) {
newList.push(feed[i])
}
var interstitialAds=partnerInterstitials.formattedAdsList;
var controller=partnerInterstitials.adDisplayController;
var articleGap=partnerInterstitials.articleGap;
var maxInterstiatialsToShow=controller.getMaxAdDisplayCount();
var k=0;
var adStartPos=partnerInterstitials.startAfterArticle;
var insertPos=adStartPos;
for (var l=adStartPos; l < newList.length; l++) {
if (maxInterstiatialsToShow <= 0) {
break
}
var adData=interstitialAds[k];
adData.articleId = "ad" + this.adCount;
var ad={
type: "ad", partner: this.partner, url: adData.articleId, metadata: adData, articleId: adData.articleId
};
this.adCount++;
if (insertPos < newList.length) {
newList.splice(insertPos, 0, ad);
insertPos += articleGap + 1
}
else {
break
}
k++;
maxInterstiatialsToShow--;
if (k === interstitialAds.length) {
k = 0
}
}
return newList
}, createArticleAds: function createArticleAds() {
var model=AppEx.Common.ArticleReader.Model,
adArray=[],
adsToAppend=[],
k=0;
var options={
section: this.feedIdentifierValue, location: "article", position: "MiddleRight"
};
var endAds=PlatformJS.Ads.Partners.AdsManager.instance.getFormattedAdsMetadataForPartnerByType(this.partner, "end", options);
if (endAds && endAds.formattedAdsList && endAds.formattedAdsList.length > 0 && endAds.adDisplayController.isVisible()) {
var endAd=new model.AdGroup;
endAd.type = "end";
adsToAppend = [];
for (k = 0; k < endAds.formattedAdsList.length; k++) {
adsToAppend.push(endAds.formattedAdsList[k])
}
endAd.adMetadatas = [adsToAppend];
adArray.push(endAd)
}
return adArray
}, adCount: 0, articleManager: null, getAdInfo: function getAdInfo(articleId){}, getArticleMetadataAsync: function getArticleMetadataAsync(articleId) {
var fullfeed=null;
if (this.fullfeed) {
fullfeed = this.fullfeed;
for (var i=0; i < fullfeed.length; i++) {
if (fullfeed[i].newsClusterItem && fullfeed[i].newsClusterItem.articleId === articleId) {
return WinJS.Promise.wrap(fullfeed[i].newsClusterItem)
}
}
}
return this.articleManager.getFullFeedAsync(this.feedType, this.feedIdentifierValue).then(function(fullFeedItem) {
fullfeed = fullFeedItem.fullfeed;
for (var j=0; j < fullfeed.length; j++) {
if (fullfeed[j].newsClusterItem && fullfeed[j].newsClusterItem.articleId === articleId) {
return WinJS.Promise.wrap(fullfeed[j].newsClusterItem)
}
}
return WinJS.Promise.wrap({})
}, function(error) {
return WinJS.Promise.wrap({})
})
}
}), ArticleReaderPage: WinJS.Class.derive(NewsJS.NewsArticleReaderPage, function partner_articlereaderpage_ctor(state) {
NewsJS.NewsArticleReaderPage.call(this, state);
this.feedType = state.feedType;
this.feedIdentifierValue = state.feedIdentiferValue;
this.disableSaveArticle = state.disableSaveArticle;
this.originatingSection = state.originatingSection;
this.originatingFeed = state.originatingFeed;
this.authManager = CommonJS.Partners.Auth.BaseAuth.authenticators[this.partner];
this._isCurrentArticleAd = null;
var that=this;
this._dataChangeHandler = function(event) {
if (that._paywallProviderPromise) {
that._paywallProviderPromise.then(function(paywallProvider) {
if (paywallProvider && that.handleLoginStateChange) {
that.handleLoginStateChange(paywallProvider.currentLoginStatus.loggedIn)
}
})
}
};
this._articleChanged = function(event) {
var isAd=that._isCurrentArticleAd = that.incrementAdCount()
};
if (this._articleManager.addEventListener) {
this._articleManager.addEventListener("articlechanged", this._articleChanged)
}
if (this._paywallProviderPromise) {
this._paywallProviderPromise.then(function(paywallProvider) {
if (paywallProvider) {
paywallProvider.addEventListener("loginstatuschange", that._dataChangeHandler())
}
})
}
}, {
dispose: function dispose() {
if (this._dataChangeHandler) {
Windows.Storage.ApplicationData.current.removeEventListener("loginstatuschange", this._dataChangeHandler)
}
if (this._articleManager && this._articleManager.removeEventListener) {
this._articleManager.removeEventListener("articlechanged", this._articleChanged)
}
this._dataChangeHandler = null;
this._articleChanged = null;
NewsJS.NewsArticleReaderPage.prototype.dispose.call(this)
}, partner: null, _saveButton: null, _isCurrentArticleAd: null, goBack: function goBack() {
if (WinJS.Navigation.history.current.location.fragment === "/common/ArticleReader/html/ArticleReaderPage.html") {
if (WinJS.Navigation.canGoBack) {
WinJS.Navigation.back()
}
else {
CommonJS.Navigation.mainNavigator.resetApp(new Error("ArticleReaderPage cant go back"))
}
}
}, incrementAdCount: function incrementAdCount() {
if (this._articleManager && this._articleManager.getCurrentArticleMetadata().isAd) {
if (this._saveButton) {
this._saveButton.disabled = true
}
var partnerName=articleData.partner;
var controller=PlatformJS.Ads.Partners.AdsManager.instance.getDisplayControllerForAdType(partnerName, "interstitial");
controller.increment();
return true
}
return false
}, onWindowResize: function onWindowResize(event) {
CommonJS.WindowEventManager.HandleWindowResizeEvent.call(this, event, function HandleWindowResize() {
NewsJS.NewsArticleReaderPage.prototype.onWindowResize.call(this, event);
this.checkPermissionForCurrentArticle(this._isCurrentArticleAd)
})
}, recordArticleView: function recordArticleView(currentArticleId, previousArticleId){}, _handleShareRequestImpl: function _handleShareRequestImpl(request, shareData) {
if (this._articleManager) {
var articleData=this._articleManager.getCurrentArticleMetadata();
if (articleData.isAd) {
var errorStringResourceId="/partners/ShareInstr";
request.failWithDisplayText(PlatformJS.Services.resourceLoader.getString(errorStringResourceId));
return
}
var deferral=request.getDeferral();
var articleId=this._articleManager.currentArticleId;
this.onShareRequest(articleData);
var uriText=articleData.shareURL || articleData.articleURL || shareData.articleHeader.sharingUrl || "";
request.data.setText(this._formatShareText(shareData, request.data.properties.description, uriText));
if (uriText) {
request.data.setUri(new Windows.Foundation.Uri(uriText))
}
request.data.properties.title = this._formatShareTitle(shareData);
request.data.properties.description = this._formatShareDescription(shareData);
var htmlText=this._formatShareHTML(shareData, uriText, articleData);
var htmlFormat=Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.createHtmlFormat(htmlText);
request.data.setHtmlFormat(htmlFormat);
this._telemetryRecordShare(uriText, shareData.pageState.telemetry ? shareData.pageState.telemetry.k : 0, "Article Reader");
deferral.complete()
}
}, onShareRequest: function onShareRequest(articleData){}, getThumbnail: function getThumbnail(articleData) {
if (articleData.thumbnail) {
return "<img src='" + articleData.thumbnail.url + "' align='left' style='margin-right: 10px'/>"
}
return ""
}, getSnippet: function getSnippet(articleData) {
if (articleData.snippet) {
return articleData.snippet
}
else {
return ""
}
}, _formatShareTitle: function _formatShareTitle(shareData) {
return shareData.articleHeader.headline
}, _formatShareHTML: function _formatShareHTML(shareData, uriText, articleData) {
var link="<a href=\"' + uriText + '\">" + uriText + "</a>";
var img=this.getThumbnail(articleData);
return "<h2><b>" + shareData.articleHeader.headline + "</b></h2><p>" + shareData.articleHeader.author + "</p><p>" + shareData.articleHeader.date + "</p>" + img + shareData.articleHeader.snippet + "</p><p>" + link + "</p>"
}
}), ArticleManager: WinJS.Class.define(function article_mgr_ctor(){}, {
_imageService: null, _prefetchImage: function _prefetchImage(imageData) {
if (!this._imageService) {
this._imageService = new Platform.ImageService("PlatformImageCache")
}
var prefetchOptions=new Platform.DataServices.PrefetchQueryServiceOptions;
prefetchOptions.priority = NewsJS.Partners.Config.isPartnerApp ? Platform.DataServices.QueryServicePriority.medium : Platform.DataServices.QueryServicePriority.low;
if (imageData) {
this._imageService.prefetchImage(imageData.url, prefetchOptions)
}
}
})
})
})()