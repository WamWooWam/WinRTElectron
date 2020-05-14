/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
WinJS.Namespace.define("NYTJS", {
ReadingListDataAdapter: WinJS.Class.define(function(onerror, onemptylist, onsuccess, paywallProviderPromise) {
this._minPageSize = 50;
this._maxPageSize = this._minPageSize;
this.onerror = onerror;
this.onemptylist = onemptylist;
this.onsuccess = onsuccess;
this._count = 0;
this._firedSuccess = false;
this._seenKeys = {};
this._fetchPromise = null;
this._disposed = false;
this._articleCache = [];
this._articleOffsets = 0;
this._paywallProviderPromise = paywallProviderPromise
}, {
_count: 0, onerror: null, onemptylist: null, onsuccess: null, _firedSuccess: false, _fetchPromise: null, _disposed: false, _articleCache: {}, _paywallProviderPromise: null, dispose: function dispose() {
this._disposed = true;
CommonJS.Progress.resetProgress(CommonJS.Progress.headerProgressType);
if (this._fetchPromise) {
this._fetchPromise.cancel();
this._fetchPromise = null
}
this.onerror = null;
this.onemptylist = null;
this.onsuccess = null;
this.handler = null
}, setNotificationHandler: function setNotificationHandler(handler) {
this.handler = handler
}, reloadContentIfNecessary: function reloadContentIfNecessary() {
var that=this;
if (that._count === 0) {
that._count = Number.MAX_VALUE;
if (that.handler) {
that.handler.reload()
}
}
}, getCount: function getCount() {
var that=this;
if (that._count) {
return WinJS.Promise.wrap(that._count)
}
else {
this._fetchPromise = NYTJS.SaveArticleManager.instance.getCountsAsync(false, this._paywallProviderPromise).then(function(counts) {
if (!counts.counts.active && that.onemptylist) {
that.onemptylist()
}
else {
that._count = counts.counts.active
}
return WinJS.Promise.wrap(that._count)
}, function(error) {
that.onerror(error);
return WinJS.UI.CountError.noResponse
});
return this._fetchPromise
}
}, _seenKeys: {}, _getResult: function _getResult(requestIndex) {
var results=[];
for (var i=0; i < this._articleCache.length; i++) {
results.push(this._articleCache[i])
}
return WinJS.Promise.wrap({
items: results, offset: requestIndex, totalCount: this._count
})
}, itemsFromIndex: function itemsFromIndex(requestIndex, countBefore, countAfter) {
var that=this;
var fetchSize=this._minPageSize;
if (requestIndex < that._articleCache.length) {
return this._getResult(requestIndex)
}
if (that._firedSuccess && !that._disposed) {
CommonJS.Progress.showProgress(CommonJS.Progress.headerProgressType)
}
var fetchIndex=this._articleOffsets;
this._fetchPromise = NYTJS.SaveArticleManager.instance.getSavedArticlesAsync(fetchIndex, fetchSize, false, false, this._paywallProviderPromise).then(function(blogsList) {
that._articleOffsets += fetchSize;
var originalCount=blogsList.length;
if (blogsList.originalFeedCount !== undefined) {
originalCount = blogsList.originalFeedCount
}
var addedCount=0;
for (var i=0; i < blogsList.length; i++) {
var key=blogsList[i].url;
if (!that._seenKeys[key]) {
blogsList[i].newsClusterItem.articleIndex += (fetchIndex - 1);
blogsList[i].newsClusterItem.originalData = JSON.parse(JSON.stringify(blogsList[i]));
that._articleCache.push({
key: key, data: blogsList[i].newsClusterItem
});
that._seenKeys[key] = true;
addedCount++
}
}
that._count -= (originalCount - blogsList.length);
if (that._articleCache && originalCount === blogsList.length && originalCount < fetchSize) {
that._count = that._articleCache.length;
if (requestIndex >= that._articleCache.length) {
requestIndex = -1
}
}
if (!that._firedSuccess && that.onsuccess) {
that.onsuccess();
that._firedSuccess = true
}
else if (!that._disposed) {
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType)
}
return that._getResult(requestIndex)
}, function(error) {
if (!that._firedSuccess && that.onerror) {
that.onerror(error)
}
else if (!that._disposed) {
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType)
}
if (that._articleCache) {
that._count = that._articleCache.length;
return that._getResult(-1)
}
else {
return WinJS.UI.FetchError.noResponse
}
});
return this._fetchPromise
}
}), SavedArticles: WinJS.Class.derive(NYTJS.BasePanoPage, function savedArticlesPano_ctor(state) {
this._setupSectionPin = null;
NYTJS.BasePanoPage.call(this, state);
var that=this;
this._title = PlatformJS.Services.resourceLoader.getString("/nyt/ReadingList");
this.progressType = CommonJS.Progress.centerProgressType;
if (this._paywallProviderPromise) {
this._paywallProviderPromise.then(function(paywallProvider) {
that._isSignedIn = paywallProvider.currentLoginStatus.loggedIn;
that._dataChangeHandlerLogout = function(event) {
var isCurrentlyLoggedIn=paywallProvider.currentLoginStatus.loggedIn;
if (that._isSignedIn !== isCurrentlyLoggedIn) {
that._isSignedIn = isCurrentlyLoggedIn;
CommonJS.Progress.resetProgress(CommonJS.Progress.centerProgressType);
WinJS.Navigation.navigate({
channelId: "savedArticles", fragment: "/nytshared/nytSavedArticles.html", page: "NYTJS.SavedArticles"
}, that._state)
}
if (that._subscribeButton) {
if (isCurrentlyLoggedIn) {
WinJS.Utilities.addClass(that._subscribeButton, "platformHide")
}
else {
WinJS.Utilities.removeClass(that._subscribeButton, "platformHide")
}
}
};
that.commonHeaderOptions.headerSubTitleText = that._title;
paywallProvider.addEventListener("loginstatuschange", that._dataChangeHandlerLogout)
})
}
}, {
dispose: function dispose() {
NYTJS.BasePanoPage.prototype.dispose.call(this);
Windows.Storage.ApplicationData.current.removeEventListener("datachanged", this._dataChangeHandlerLogout);
var mainListView=document.querySelector("#savedListView");
if (mainListView) {
mainListView = mainListView.winControl;
mainListView.itemDataSource = null
}
var that=this;
that._itemDataSource = null;
if (that._newsProviderAdapter) {
that._newsProviderAdapter.dispose();
that._newsProviderAdapter = null
}
}, onerror: function onerror(error) {
if (error === CommonJS.Partners.Auth.BaseAuth.notLoggedInError) {
this.onNotLoggedIn()
}
else {
this._pageLoadFailed()
}
}, showInlineError: function showInlineError(string, onclick) {
if (document.querySelector(".inlineError")) {
return
}
var platformPage=document.querySelector(".nytSavedArticles");
WinJS.Utilities.addClass(platformPage, "hasInlineError");
CommonJS.Error.removeError();
CommonJS.Progress.hideProgress(this.progressType);
var inlineError=document.createElement("div");
WinJS.Utilities.addClass(inlineError, "inlineError");
var errorHeader=document.createElement("div");
WinJS.Utilities.addClass(errorHeader, "errorHeader");
errorHeader.textContent = PlatformJS.Services.resourceLoader.getString("/nyt/NoSavedArticlesHeader");
inlineError.appendChild(errorHeader);
var errorMessage=document.createElement("div");
WinJS.Utilities.addClass(errorMessage, "errorMessage");
inlineError.appendChild(errorMessage);
errorMessage.textContent = string;
var parentNode=document.querySelector(".platformClusterContent");
WinJS.Utilities.addClass(parentNode, "noItems");
parentNode.appendChild(inlineError);
if (onclick) {
inlineError.onclick = onclick;
PlatformJS.Utilities.enablePointerUpDownAnimations(inlineError)
}
}, reParentInlineError: function reParentInlineError(newParent) {
var inlineError=document.querySelector(".inlineError");
if (inlineError) {
var parentNode=inlineError.parentNode;
parentNode.removeChild(inlineError);
WinJS.Utilities.removeClass(parentNode, "noItems");
newParent.appendChild(inlineError);
WinJS.Utilities.addClass(newParent, "noItems")
}
}, removeInlineError: function removeInlineError() {
var platformPage=document.querySelector(".nytSavedArticles");
if (platformPage) {
WinJS.Utilities.removeClass(platformPage, "hasInlineError")
}
var inlineError=document.querySelector(".inlineError");
if (inlineError) {
var parentNode=inlineError.parentNode;
parentNode.removeChild(inlineError);
WinJS.Utilities.removeClass(parentNode, "noItems")
}
}, onNotLoggedIn: function onNotLoggedIn() {
this.showInlineError(PlatformJS.Services.resourceLoader.getString("/nyt/LoginSaveArticles"), null)
}, onemptylist: function onemptylist() {
this.showInlineError(PlatformJS.Services.resourceLoader.getString("/nyt/NoArticles"), null);
NewsJS.Utilities.disableButton("refreshButton", false)
}, itemTemplate: function itemTemplate(itemPromise) {
return itemPromise.then(function(item) {
var binding=NewsJS.Bindings.snappedStoryTile(item.data);
return CommonJS.loadModule(binding.moduleInfo, binding)
})
}, getPageState: function getPageState() {
return this._state
}, getPageData: function getPageData() {
var that=this;
return WinJS.Promise.wrap({
loadingBehavior: "incremental", itemTemplate: WinJS.Utilities.markSupportedForProcessing(that.itemTemplate), selectionMode: WinJS.UI.SelectionMode.none, oniteminvoked: WinJS.Utilities.markSupportedForProcessing(function(e) {
that.itemInvoked(e)
}), layout: {type: WinJS.UI.GridLayout}, title: this._title
})
}, _isSignedIn: null, loadPageData: function loadPageData(refresh) {
var that=this;
NewsJS.Utilities.disableButton("refreshButton", true);
CommonJS.Progress.showProgress(this.progressType);
this.removeInlineError();
var savedListView=PlatformJS.Utilities.getControl("savedListView");
if (that._newsProviderAdapter) {
that._newsProviderAdapter.dispose()
}
that._newsProviderAdapter = new NYTJS.ReadingListDataAdapter(this.onerror.bind(this), this.onemptylist.bind(this), this._pageLoadSucceeded.bind(this), this._paywallProviderPromise);
that._itemDataSource = new CommonJS.VirtualizedDataSource(that._newsProviderAdapter);
savedListView.itemDataSource = that._itemDataSource
}, itemInvoked: function itemInvoked(e) {
var that=this;
if (!that._itemDataSource) {
return
}
that._itemDataSource.itemFromIndex(e.detail.itemIndex).then(function(f) {
var item=f.data;
var authProvider=[];
authProvider["authInfo"] = that._state.authInfo;
if (item.type === "article" || item.type === "blog") {
WinJS.Navigation.navigate({
fragment: "/common/ArticleReader/html/ArticleReaderPage.html", page: "NYTJS.ArticleReader.Page"
}, {
providerType: "NYTJS.ArticleReader.Provider", providerConfiguration: {
feedType: "readinglist", articleIndex: item.articleIndex, feedIdentifierValue: "readinglist", isNYT: true, paywallProviderPromise: that._paywallProviderPromise
}, initialArticleId: item.articleId, enableSharing: true, enableSnap: true, snappedHeaderTitle: " ", snappedHeaderFontColor: "headerFontLight", disableSaveArticle: false, originatingFeed: item.feedType, originatingSection: item.feedType, theme: "NYT defaultArticleReaderTheme", validActions: that.getValidActions(), actionsHandlerType: that.getActionsHandlerType(), actionKeys: that.getActionKeys(), authProvider: authProvider, instrumentationId: that._state.dynamicInfo.instrumentationId
})
}
else if (item.type === "slideshow") {
WinJS.Navigation.navigate({
fragment: "/html/newsSlideshow.html", page: "NYTJS.SlideShow.Page"
}, {
providerType: "NYTJS.SlideShow.Provider", providerConfiguration: item.originalData, theme: "NYT", access: "anonymous"
})
}
else if (item.type === "video") {
CommonJS.MediaApp.Controls.MediaPlayback.fullscreenPlayback(item.video.url, {
title: item.title ? NewsJS.Utilities.stripHTML(item.title) : item.snippet, thumbnail: item.thumbnail.url, source: PlatformJS.Services.resourceLoader.getString("/nyt/thenyt")
});
that.onPlayVideo(item.articleURL, item.feedIdentifierValue, item.feedType)
}
})
}
})
})
})()