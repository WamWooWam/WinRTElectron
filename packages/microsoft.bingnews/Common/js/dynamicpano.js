/*  © Microsoft. All rights reserved. */
WinJS.Namespace.define('CommonJS', {Version: 'latest'});
(function _dynamicPano_1() {
"use strict";
var _currentScreenRatio=null;
var _displayData=PlatformJS.Utilities.getDisplayData();
var _getScreenRatio=function() {
if (_currentScreenRatio) {
return _currentScreenRatio
}
_currentScreenRatio = 0;
var bodyWidth=_displayData.offsetWidth,
bodyHeight=_displayData.offsetHeight;
if (bodyWidth && bodyHeight) {
if (!_displayData.landscape) {
_currentScreenRatio = bodyHeight / bodyWidth
}
else {
_currentScreenRatio = bodyWidth / bodyHeight
}
}
return 0
};
var MutexPromise=function() {
var mutexCompleteHandle=null;
var mutex=new WinJS.Promise(function init(complete, error, progress) {
mutexCompleteHandle = complete
});
mutex.complete = mutexCompleteHandle;
return mutex
};
WinJS.Namespace.define("DynamicPanoJS", {
UserTypeEnum: {
Registered: "Registered", Subscriber: "Subscriber", Anonymous: "Anonymous"
}, DynamicPano: WinJS.Class.define(function categoryPano_ctor(state) {
state = JSON.parse(JSON.stringify(state));
var that=this;
this._clusters = new WinJS.Binding.List;
this._lockUntilBindingComplete = new MutexPromise;
if (!state) {
state = {}
}
else {
this._panoramaState = state.panoramaState
}
if (!state.dynamicInfo) {
state.dynamicInfo = {}
}
this.market = state.dynamicInfo.market || CommonJS.Globalization.getMarketStringForEditorial();
state.dynamicInfo.market = this.market;
this.validateDynamicInfo(state.dynamicInfo);
PlatformJS.platformInitializedPromise.then(function _dynamicPano_66() {
that.config = that._readConfig("DynamicPano")
});
this.numCategoryClusters = 0;
this._state = state;
this.addRemovePanoramaFlush(false);
this._panoControl = PlatformJS.Utilities.getControl("news_Panorama");
this._elementPanoramaFragment = document.querySelector(".dynamicPano");
var panoClass=state.dynamicInfo.panoClass;
if (panoClass) {
WinJS.Utilities.addClass(this._elementPanoramaFragment, panoClass)
}
this._elementTitleLogo = document.querySelector(".platformMainContent .immersiveHeaderTitle");
this.logoPromises = null;
var refreshButton=PlatformJS.Utilities.getControl("refreshButton");
if (refreshButton) {
refreshButton.label = PlatformJS.Services.resourceLoader.getString("/platform/refresh");
refreshButton.onclick = function() {
that._refreshPage()
}
}
var helpButton=this._helpButton = PlatformJS.Utilities.getControl("helpButton");
if (helpButton) {
helpButton.label = CommonJS.resourceLoader.getString("/platform/HelpLabel");
var helpButtonClickListener=this._helpButtonClickListener = this._helpButtonClicked.bind(this);
helpButton.addEventListener("click", helpButtonClickListener)
}
var header=this._elementHeader = document.querySelector(".platformMainContent .immersiveHeader");
this._hgroupElement = header && header.getElementsByTagName("hgroup")[0];
var accentLineContainer=document.createElement("div");
accentLineContainer.id = "dynamicPanoAccentLineContainer";
WinJS.Utilities.addClass(accentLineContainer, "dynamicPanoAccentLineContainer");
var accent=document.createElement("div");
accent.id = "dynamicPanoAccent";
WinJS.Utilities.addClass(accent, "dynamicPanoAccent");
accentLineContainer.appendChild(accent);
if (this._elementHeader) {
var firstChild=this._elementHeader.firstChild;
if (firstChild) {
this._elementHeader.insertBefore(accentLineContainer, firstChild)
}
else {
this._elementHeader.appendChild(accentLineContainer)
}
}
if (this._state.dynamicInfo) {
this._headerColor = this._state.dynamicInfo.backbuttontype === 1 ? "headerFontLight" : "headerFontDark"
}
if (this._state.dynamicInfo && this._state.dynamicInfo.isFeaturedSource) {
this.logoPromises = this.queryLogos();
var edgy=PlatformJS.Utilities.getControl("actionEdgy");
edgy.addEventListener("beforeshow", function _dynamicPano_127() {
CommonJS.Utilities.Pinning.setupPinFeaturedSourceButton("pinFeaturedSource", that._state.dynamicInfo, that._onPinSection.bind(that))
})
}
else {
var pinFeaturedSource=document.getElementById("pinFeaturedSource");
if (pinFeaturedSource) {
WinJS.Utilities.addClass(pinFeaturedSource, "platformHide")
}
}
this._messageDialogHelper = new DynamicPanoJS.MessageDialogHelper(this._state.dynamicInfo);
this.headerSelectionEnabled = state.dynamicInfo.clusterToRender ? false : true;
CommonJS.Utils.loadDeferredStyleSheets();
this._loadPageData(false)
}, {
countWeight: 2, _paywallProviderPromise: null, _paywallExtraConfigPromise: null, _showGrowlMessageBarPromise: null, _paywallSettingsSlideShowPromise: null, _showPaywallCardForVideoEntityBinding: null, _showGrowlMessageBarVideoEntityBinding: null, _elementPanoramaFragment: null, _elementTitleLogo: null, _messageDialogHelper: null, _lockUntilBindingComplete: null, _helpButton: null, _helpButtonClickListener: null, _messageDialogPromiseChain: null, _disposed: false, _videoMessageBar: null, _clusterTitle: function _clusterTitle(groupData) {
if (groupData.clusterKey === this._hero) {
return PlatformJS.Services.resourceLoader.getString("SemanticZoomHeroClusterTitle")
}
return groupData.clusterTitle
}, _pageLoadSucceeded: function _pageLoadSucceeded() {
CommonJS.Error.removeError();
CommonJS.Progress.hideProgress(this.progressType);
this.setHeaderColor(this._headerColor)
}, _refreshPage: function _refreshPage(showToast) {
if (!this.checkOffline(!showToast)) {
var that=this;
this._getPaywallInstrumentationAsync().done(function _dynamicPano_180(attributes) {
attributes.partnerId = that._state.dynamicInfo.id;
attributes.channelID = that._state.dynamicInfo.channelID;
attributes.partnerCode = that._state.dynamicInfo.instrumentationId;
PlatformJS.deferredTelemetry(function _logUserAction() {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.ActionContext.bottomEdgy, "manual refresh", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(attributes))
})
});
this._offlineData = null;
if (this._panoControl) {
this._panoControl.panoramaState = null
}
this._loadPageData(true)
}
CommonJS.dismissAllEdgies()
}, _onPinSection: function _onPinSection() {
var that=this;
this._getPaywallInstrumentationAsync().done(function _dynamicPano_209(attributes) {
attributes.partnerId = that._state.dynamicInfo.id;
attributes.channelID = that._state.dynamicInfo.channelID;
attributes.partnerCode = that._state.dynamicInfo.instrumentationId;
PlatformJS.deferredTelemetry(function _logUserAction() {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.ActionContext.bottomEdgy, "Section Pinned", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(attributes))
})
})
}, showToast: function showToast(message) {
var messageBar=new CommonJS.MessageBar(message, {autoHide: true});
messageBar.addButton(PlatformJS.Services.resourceLoader.getString("/platform/Dismiss") || PlatformJS.Services.resourceLoader.getString("/partners/Dismiss"), function _dynamicPano_230() {
messageBar.hide()
});
messageBar.show()
}, checkOffline: function checkOffline(dontShowToast) {
this.isOnline = PlatformJS.Utilities.hasInternetConnection();
if (this.isOnline) {
return false
}
else {
if (!dontShowToast) {
var msg=PlatformJS.Services.resourceLoader.getString("/platform/ArticleUnavailableOffline");
this.showToast(msg)
}
return true
}
}, _readConfig: function _readConfig(nodeName) {
var pano=PlatformJS.Services.appConfig.getDictionary(nodeName);
var readList=function(list) {
var obj={};
for (var j=0; j < list.length; j++) {
var subList=list[j];
var keys=Object.keys(subList);
for (var i in keys) {
var val=keys[i];
obj[val] = subList.getString(val)
}
}
;
return obj
};
if (!pano) {
console.log(nodeName + " dictionary does not exist in appconfiguration.xml");
debugger;
return null
}
var ss=pano.getList("SlideshowConfig", Platform.Configuration.ListConfigurationItem.empty);
var ar=pano.getList("ArticleReaderConfig", Platform.Configuration.ListConfigurationItem.empty);
var cp=pano.getList("CategoryPageConfig", Platform.Configuration.ListConfigurationItem.empty);
var config={
slideshow: readList(ss), articlereader: readList(ar), cacheId: pano.getString("CacheID"), categorypage: readList(cp)
};
return config
}, addRemovePanoramaFlush: function addRemovePanoramaFlush(shouldAdd) {
var panoEl=document.getElementById("news_Panorama");
if (panoEl) {
if (shouldAdd) {
WinJS.Utilities.addClass(panoEl, "platformPanoramaFlushLeft")
}
else {
WinJS.Utilities.removeClass(panoEl, "platformPanoramaFlushLeft")
}
}
}, onViewStateChange: function onViewStateChange(viewState, e) {
var displayData=PlatformJS.Utilities.getDisplayData();
if (displayData.isFullScreenChaged() || displayData.isOrientationChaged()) {
this.populatePanoBranding()
}
}, onWindowResize: function onWindowResize(e) {
this._hidePaywallSubscribeOnOverlap();
CommonJS.WindowEventManager.HandleWindowResizeEvent.call(this, e, function HandleWindowResize() {
this.populatePanoBranding()
})
}, setHeaderColor: function setHeaderColor(color) {
var panoElement=document.getElementById("news_Panorama");
if (panoElement) {
WinJS.Utilities.addClass(panoElement, color)
}
var headerControl=PlatformJS.Utilities.getControl("news_Panorama_header");
this._headerColor = color;
if (headerControl) {
headerControl.fontColor = color
}
}, _loadPageData: function _loadPageData(bypassCache) {
var that=this;
bypassCache = true;
var options={
dataSourceName: this._state.dynamicInfo.dataSourceName, feedName: this._state.dynamicInfo.feedName, feedMarket: this._state.dynamicInfo.feedMarket, dataProviderOptions: this._state.dynamicInfo.dataProviderOptions, cssFeedUrl: this._state.dynamicInfo.css, channelId: this._state.channelId, market: this.market
};
this.dataProvider = new DynamicPanoJS.DynamicPanoProvider(options);
if (bypassCache) {
this._pageWrapperDataPromise = WinJS.Promise.wrap(null)
}
else {
this._pageWrapperDataPromise = this.dataProvider.fetchCacheData()
}
this.progressType = CommonJS.Progress.headerProgressType;
CommonJS.Progress.showProgress(this.progressType);
var messageDialogPromise=this._messageDialogHelper ? this._messageDialogHelper.showMessageAsync() : WinJS.Promise.wrap(false);
this._messageDialogPromiseChain = messageDialogPromise.then(function messageDialogPromise_complete() {
return that._pageWrapperDataPromise
}).then(function pageWrapperDataFromCache_complete(complete) {
if (complete) {
if (complete.cmsData) {
that.processFetch(complete);
that._pageLoadSucceeded();
that._pageRendered = true
}
}
}, function _dynamicPano_354(error) {
that._pageWrapperDataPromise = null
}).then(function pageWrapperDataFromNetwork() {
var isSubPano=that._state.dynamicInfo.clusterID ? true : false;
that._pageWrapperDataPromise = that.dataProvider.fetchNetworkData(bypassCache, isSubPano);
that._pageDataPromise = that.dataProvider.fetchPromise;
return that._pageWrapperDataPromise.then(function pageWrapperDataFromNetwork_complete(complete) {
that._pageDataPromise = that._pageWrapperDataPromise = null;
if ((DynamicPanoJS.forceRefreshPano || complete.isNewData || !that._pageRendered) && complete.cmsData) {
DynamicPanoJS.forceRefreshPano = false;
if (that._panoControl) {
that._panoControl.panoramaState = null
}
that.processFetch(complete)
}
if (complete.cmsData && that._clusters && that._clusters.length) {
that._pageLoadSucceeded()
}
else if (!that._pageRendered) {
that._pageLoadFailed(function _dynamicPano_380() {
that._refreshPage()
})
}
}, function _dynamicPano_385(error) {
that._pageDataPromise = that._pageWrapperDataPromise = null;
if (!PlatformJS.Utilities.isPromiseCanceled(error) && !that._pageRendered) {
that._pageLoadFailed(function _dynamicPano_388() {
that._refreshPage()
})
}
}, function _dynamicPano_393(progress){})
});
return this._messageDialogPromiseChain
}, _pageLoadFailed: function _pageLoadFailed(refreshFunction) {
var that=this;
CommonJS.Error.showError(PlatformJS.Utilities.hasInternetConnection() ? CommonJS.Error.STANDARD_ERROR : CommonJS.Error.NO_INTERNET, refreshFunction ? refreshFunction : function() {
that._loadPageData(false)
});
CommonJS.Progress.hideProgress(this.progressType)
}, _applyCustomStyling: function _applyCustomStyling() {
var css=this._cssData;
if (css) {
var partnerStyleAnchor=document.getElementById("partnerStyleAnchor");
if (partnerStyleAnchor) {
partnerStyleAnchor.sheet.cssText = toStaticHTML(this._cssData)
}
}
}, onNavigateAway: function onNavigateAway(event) {
var panoElement=document.getElementById("news_Panorama");
if (panoElement && panoElement.style) {
panoElement.style.display = "none"
}
var sheets=document.styleSheets;
for (var i=0; i < sheets.length; i++) {
var sheet=sheets[i];
if (sheet.id === "partnerStyleAnchor") {
var rules=sheet.cssRules;
while (rules.length > 0) {
sheet.deleteRule(rules[0])
}
var partnerStyleAnchor=document.getElementById("partnerStyleAnchor");
partnerStyleAnchor.parentNode.removeChild(partnerStyleAnchor)
}
}
if (this.logoPromises) {
this.logoPromises.cancel()
}
if (this._pageWrapperDataPromise) {
this._pageWrapperDataPromise.cancel()
}
if (this._pageDataPromise) {
this._pageDataPromise.cancel()
}
CommonJS.WindowEventManager.getInstance().dispatchEvent("samePageNav", event)
}, dispose: function dispose() {
if (this._disposed) {
return
}
if (this._messageDialogHelper) {
this._messageDialogHelper.dispose();
this._messageDialogHelper = null
}
if (this._panoControl && this._panoControl.dispose) {
this._panoControl.dispose()
}
var helpButton=this._helpButton;
if (helpButton) {
helpButton.removeEventListener("click", this._helpButtonClickListener)
}
if (this._paywallExtraConfigPromise) {
this._paywallExtraConfigPromise.cancel();
this._paywallExtraConfigPromise = null
}
if (this._messageDialogPromiseChain) {
this._messageDialogPromiseChain.cancel();
this._messageDialogPromiseChain = null
}
if (this._showGrowlMessageBarPromise) {
this._showGrowlMessageBarPromise.cancel();
this._showGrowlMessageBarPromise = null
}
if (this._paywallSettingsSlideShowPromise) {
this._paywallSettingsSlideShowPromise.cancel();
this._paywallSettingsSlideShowPromise = null
}
if (this._showPaywallCardForVideoEntityBinding) {
this._showPaywallCardForVideoEntityBinding = null
}
if (this._showGrowlMessageBarVideoEntityBinding) {
this._showGrowlMessageBarVideoEntityBinding = null
}
this._disposed = true
}, addTitleLogo: function addTitleLogo() {
var that=this;
if (this.logoPromises) {
this.logoPromises = this.logoPromises.then(function _dynamicPano_502(results) {
that.logoPromises = null;
if (results) {
that.logoUrl = results.length > 0 ? results[0] : null;
if (that.logoUrl) {
that._addTitleLogo()
}
else {
that._removeTitleLogo()
}
}
}, function _dynamicPano_512(error) {
that.logoPromises = null
})
}
else if (this.logoUrl) {
this._addTitleLogo()
}
}, _removeTitleLogo: function _removeTitleLogo() {
var hgroupElement=this._hgroupElement;
if (hgroupElement) {
WinJS.Utilities.removeClass(hgroupElement, "pendingLogo")
}
var panoFragment=this._elementPanoramaFragment;
if (panoFragment) {
WinJS.Utilities.removeClass(panoFragment, "useLogo")
}
var header=this._elementTitleLogo;
if (header) {
WinJS.Utilities.removeClass(header, "useLogo");
while (header.firstChild) {
header.removeChild(header.firstChild)
}
header.innerText = this.getPanoTitle()
}
}, _addTitleLogo: function _addTitleLogo() {
var panoFragment=this._elementPanoramaFragment;
var hgroupElement=this._hgroupElement;
if (this.logoUrl) {
var addTitleLogoWorker=function(foundElement, logoUrl) {
if (foundElement) {
if (!WinJS.Utilities.hasClass(foundElement, "useLogo")) {
WinJS.Utilities.addClass(foundElement, "useLogo");
if (logoUrl) {
foundElement.innerText = "";
var logoElement=document.createElement("img");
logoElement.src = logoUrl;
foundElement.appendChild(logoElement)
}
}
}
};
if (panoFragment) {
addTitleLogoWorker(panoFragment)
}
if (hgroupElement) {
WinJS.Utilities.removeClass(hgroupElement, "pendingLogo")
}
addTitleLogoWorker(this._elementTitleLogo, this.logoUrl)
}
else {
if (hgroupElement) {
WinJS.Utilities.removeClass(hgroupElement, "pendingLogo")
}
}
}, _hidePaywallSubscribeOnOverlap: function _hidePaywallSubscribeOnOverlap() {
var elementPaywallSubscribe=document.getElementById("subscribeButton");
if (elementPaywallSubscribe && this._elementTitleLogo) {
elementPaywallSubscribe.hidden = false;
var logoContent=this._elementTitleLogo.firstElementChild || this._elementTitleLogo;
var logoBounds=logoContent.getBoundingClientRect();
var subscribeBounds=elementPaywallSubscribe.getBoundingClientRect();
var overlap=subscribeBounds.left < (logoBounds.left + logoBounds.width);
elementPaywallSubscribe.hidden = overlap
}
}, getLogo: function getLogo(logoUrl, forceCacheId) {
var networkCallRequired=function() {
;
};
var cacheId=forceCacheId ? forceCacheId : (this.config ? this.config.cacheId : null);
return new WinJS.Promise(function _dynamicPano_597(complete, error) {
var staleResponse=null;
var exit=function(response, err) {
if (response) {
complete(response.dataValue)
}
else {
error(err || new Error)
}
};
PlatformJS.Cache.CacheService.getInstance(cacheId).findEntry(logoUrl, {fileNameOnly: true}).then(function _dynamicPano_608(response) {
if (response && response.isStale()) {
staleResponse = response
}
if (response && !staleResponse) {
complete(response.dataValue);
return WinJS.Promise.wrap(null)
}
if (PlatformJS.Utilities.hasInternetConnection()) {
return PlatformJS.Utilities.fetchImage(cacheId, logoUrl, networkCallRequired)
}
else {
exit(staleResponse)
}
}).done(function _dynamicPano_625(finalResponse) {
if (finalResponse) {
complete(finalResponse)
}
}, function _dynamicPano_630(err) {
exit(staleResponse, err)
})
})
}, queryLogos: function queryLogos(fetch) {
var promises=[];
if (this._state.dynamicInfo) {
if (this._state.dynamicInfo.logoUrl) {
var hgroupElement=this._hgroupElement;
if (hgroupElement) {
WinJS.Utilities.addClass(hgroupElement, "pendingLogo")
}
}
if (this._state.dynamicInfo.logoUrl) {
this.logoUrl = null;
promises.push(this.getLogo(this._state.dynamicInfo.logoUrl).then(function _dynamicPano_650(response) {
return WinJS.Promise.wrap(response)
}, function _dynamicPano_651() {
return WinJS.Promise.wrap(null)
}))
}
var pinLogoUrls=this._state.dynamicInfo.pinLogoUrls;
if (pinLogoUrls) {
for (var key in pinLogoUrls) {
var pinLogoUrl=pinLogoUrls[key];
if (pinLogoUrl) {
promises.push(this.getLogo(pinLogoUrl, "CustomPanoPinningLogoCache").then(function _dynamicPano_662(response) {
return WinJS.Promise.wrap(response)
}, function _dynamicPano_663() {
return WinJS.Promise.wrap(null)
}))
}
}
}
}
return WinJS.Promise.join(promises)
}, getPageImpressionContext: function getPageImpressionContext() {
if (this._state.dynamicInfo.clusterID) {
return "/Partner Pano/Sub Pano"
}
return "/Partner Pano"
}, getPageImpressionPartnerCodeAndAttributes: function getPageImpressionPartnerCodeAndAttributes() {
var isEmptyDictionary=function(ob) {
for (var i in ob) {
return false
}
return true
};
var results={partnerCode: this._state.dynamicInfo.instrumentationId};
var attributes={};
if (this._state.dynamicInfo.clusterID) {
attributes['SubPanoChannel'] = this._state.dynamicInfo.clusterID
}
;
if (!isEmptyDictionary(attributes)) {
results['attributes'] = attributes
}
return results
}, onBindingComplete: function onBindingComplete() {
this.addTitleLogo();
this._lockUntilBindingComplete.complete()
}, validateDynamicInfo: function validateDynamicInfo(dynamicInfo) {
if (dynamicInfo && dynamicInfo.adUnitId && dynamicInfo.isFeaturedSource) {
var adUnitIds=dynamicInfo.adUnitId.split(";");
if (adUnitIds && adUnitIds.length > 1) {
dynamicInfo.videoAdUnitId = adUnitIds[1];
dynamicInfo.adUnitId = adUnitIds[0]
}
}
}, capCMSArticles: function capCMSArticles() {
return true
}, processFetch: function processFetch(data) {
this._cssData = data.cmsCss;
this._applyCustomStyling();
this._cmsData = null;
this._categoryLeadStories = {};
this.handleCMS(data.cmsData);
this.fetchCompleted()
}, fetchCompleted: function fetchCompleted() {
msWriteProfilerMark("Platform:DynamicPano:fetchCompleted:s");
this.populatePanoBranding();
this.populateHeroAndCategories();
msWriteProfilerMark("Platform:DynamicPano:fetchCompleted:e")
}, populatePanoBranding: function populatePanoBranding() {
if (this._disposed || !this._state.dynamicInfo || this._state.dynamicInfo.clusterID) {
return
}
var panoElement=document.getElementById("news_Panorama");
if (panoElement && this._cmsData) {
if (this._cmsData.backgroundImages) {
var panoBackgroundImage=this._getPanoBackgroundImage(this._cmsData.backgroundImages);
panoElement.style.backgroundImage = panoBackgroundImage ? "url(" + panoBackgroundImage + ")" : ""
}
}
}, _getPanoBackgroundImage: function _getPanoBackgroundImage(imageArray) {
var ratio=_getScreenRatio();
var wideStandard=ratio > 1.5 ? "Wide" : "Standard";
var key=(_displayData.landscape ? "landscape" : "portrait") + wideStandard;
for (var i=0; i < imageArray.length; i++) {
var image=imageArray[i];
if (image.name === key) {
return image.url
}
}
return null
}, createHero: function createHero() {
if (this._cmsData && this._cmsData.hero) {
this.addRemovePanoramaFlush(true);
var editorial=this._cmsData.hero;
var heroList=[];
this.cmsHeroCluster(editorial, heroList);
return true
}
else {
this.addRemovePanoramaFlush(false);
return false
}
}, getEditorialArticleIdPath: function getEditorialArticleIdPath(article) {
var articleIdPath=null;
if (article.editorial) {
articleIdPath = article.contentid ? article.articleid + "/" + article.contentid : article.articleid + ""
}
return articleIdPath
}, getArticleInfo: function getArticleInfo(article) {
var articleInfo=null;
var articleIdPath=this.getEditorialArticleIdPath(article);
if (articleIdPath) {
articleInfo = {
articleId: articleIdPath, headline: article.title, snippet: article.snippet, abstract: article.abstract, thumbnail: article.thumbnailLowRes || article.thumbnail
}
}
return articleInfo
}, getFeaturedChannel: function getFeaturedChannel(channelID) {
var allFeaturedChannels=PlatformJS.Navigation.mainNavigator.channelManager.featuredChannels;
var featuredChannel=null,
j=0;
for (j = 0; j < allFeaturedChannels.length; j++) {
if (allFeaturedChannels[j].id === channelID) {
featuredChannel = allFeaturedChannels[j];
break
}
}
return featuredChannel
}, _getFeaturedSubchannels: function _getFeaturedSubchannels(featuredChannel) {
return DynamicPanoJS.DynamicPano.loadPanoData(featuredChannel, this.market).then(function processCmsData(data) {
var featuredSubChannels=[];
for (var i=0; i < data.categoryOrder.length; i++) {
var categoryKey=data.categoryOrder[i];
var category=data.categories[categoryKey];
var newChannel=DynamicPanoJS.DynamicPano.createSubChannelFromFeaturedParent(featuredChannel, category.categoryName, categoryKey, featuredChannel.id);
featuredSubChannels.push(newChannel)
}
return featuredSubChannels
})
}, _addExtraChannelsFromConfig: function _addExtraChannelsFromConfig(featuredChannelId, featuredChannel) {
var that=this;
var config=CommonJS.Partners.Config.getConfig(featuredChannelId, "ExtraSubChannels", []),
i,
listLen;
if (config && config.length) {
config.forEach(function addToMenu(extraSubChannel) {
var menuIndex=extraSubChannel.menuIndex;
extraSubChannel.state = extraSubChannel.state || {};
extraSubChannel.state.authInfo = that._authInfo;
if (menuIndex !== null && !isNaN(menuIndex) && menuIndex >= 0) {
featuredChannel.subChannels.splice(menuIndex, 0, extraSubChannel)
}
else {
featuredChannel.subChannels.push(extraSubChannel)
}
})
}
}, _applyAllowedAndBlockedLists: function _applyAllowedAndBlockedLists(featuredChannelId, featuredChannel) {
var i=0,
listLen;
var allowedList=CommonJS.Partners.Config.getConfig(featuredChannelId, "SubChannelsWhiteList", []);
if (allowedList && allowedList.length) {
var allowedListMap={};
for (i = 0, listLen = allowedList.length; i < listLen; i++) {
if (allowedList[i] && allowedList[i].value) {
allowedListMap[allowedList[i].value] = true
}
}
featuredChannel.subChannels = featuredChannel.subChannels.filter(function _dynamicPano_879(channel) {
return !!allowedListMap[channel.id] || (channel.state && channel.state.dynamicInfo && channel.state.dynamicInfo.clusterID && !!allowedListMap[channel.state.dynamicInfo.clusterID])
})
}
else {
var blockList=CommonJS.Partners.Config.getConfig(featuredChannelId, "SubChannelsBlackList", []);
if (blockList && blockList.length) {
var blockListMap={};
for (i = 0, listLen = blockList.length; i < listLen; i++) {
if (blockList[i] && blockList[i].value) {
blockListMap[blockList[i].value] = true
}
}
featuredChannel.subChannels = featuredChannel.subChannels.filter(function _dynamicPano_891(channel) {
var shouldFilter=!(blockListMap[channel.id] || (channel.state && channel.state.dynamicInfo && channel.state.dynamicInfo.clusterID && !!blockListMap[channel.state.dynamicInfo.clusterID]));
return shouldFilter
})
}
}
}, populateL2IfHoisted: function populateL2IfHoisted(sortedDataSource) {
var that=this,
changed=false;
if (sortedDataSource.length > 1) {
PlatformJS.platformInitializedPromise.then(function _dynamicPano_905() {
var channelId=WinJS.Navigation.location.channelId;
PlatformJS.Navigation.mainNavigator.loadFeaturesConfigAsync().then(function loadFeatures_Complete() {
var featuredChannelId=PlatformJS.Navigation.getFeaturedChannelId(channelId);
if (channelId && channelId === that._state.dynamicInfo.id) {
var featuredChannel=that.getFeaturedChannel(featuredChannelId);
if (featuredChannel) {
if (featuredChannel.subChannels) {
changed = true;
featuredChannel.subChannels = [];
if (channelId !== featuredChannelId) {
that._getFeaturedSubchannels(featuredChannel).then(function _dynamicPano_919(featuredChannels) {
for (var featuredChannelIndex=0; featuredChannelIndex < featuredChannels.length; featuredChannelIndex++) {
featuredChannel.subChannels.push(featuredChannels[featuredChannelIndex])
}
that._addExtraChannelsFromConfig(featuredChannelId, featuredChannel);
that._applyAllowedAndBlockedLists(featuredChannelId, featuredChannel)
})
}
else {
for (var idx=0; idx < sortedDataSource.length; idx++) {
var item=sortedDataSource.getItem(idx);
if (item && item.data && item.data.clusterTitle && item.data.clusterKey && item.data.clusterKey.indexOf("AdsCluster") !== 0) {
var newChannel=DynamicPanoJS.DynamicPano.createSubChannelFromFeaturedParent(featuredChannel, item.data.clusterTitle, item.data.clusterKey, featuredChannelId);
featuredChannel.subChannels.push(newChannel)
}
}
that._addExtraChannelsFromConfig(featuredChannelId, featuredChannel);
that._applyAllowedAndBlockedLists(featuredChannelId, featuredChannel)
}
}
}
}
if (changed) {
PlatformJS.Navigation.mainNavigator.channelManager.featuredChannelChanged = true
}
})
})
}
}, _articleInfos: null, setArticleInfosOnDataSource: function setArticleInfosOnDataSource(dataSource, heroArticle) {
if (this._articleInfos) {
return
}
if (dataSource && dataSource.length) {
var articleInfos=[];
var articles=[];
var entityClusterIndex=0;
var articleIndex=0;
var heroCluster=dataSource.getItem(0);
if (heroCluster && heroCluster.data && heroCluster.data.clusterKey === "Hero") {
if (heroArticle && heroArticle.type === "article") {
var heroArticleInfo=this.getArticleInfo(heroArticle);
if (heroArticleInfo) {
heroArticle.articleIndex = articleIndex++;
articleInfos.push(heroArticleInfo);
articles.push(heroArticle)
}
}
entityClusterIndex++
}
for (; entityClusterIndex < dataSource.length; entityClusterIndex++) {
var dataItem=dataSource.getItem(entityClusterIndex);
if (dataItem && dataItem.data && dataItem.data.clusterContent && dataItem.data.clusterContent.contentOptions && dataItem.data.clusterContent.contentOptions.dataSet && dataItem.data.clusterContent.contentOptions.dataSet.newsItems && dataItem.data.clusterContent.contentOptions.dataSet.newsItems.length) {
var newsItems=dataItem.data.clusterContent.contentOptions.dataSet.newsItems;
for (var j=0; j < newsItems.length; j++) {
var newsItem=newsItems[j];
if (newsItem && newsItem.type === "article") {
var articleInfo=this.getArticleInfo(newsItem);
if (articleInfo) {
newsItem.articleIndex = articleIndex++;
articleInfos.push(articleInfo);
articles.push(newsItem)
}
}
}
}
}
this._articleInfos = articleInfos
}
}, _setArticleIndexForCurrentArticle: function _setArticleIndexForCurrentArticle(article) {
var articleInfos=article.clusterArticles.articleInfos;
if (articleInfos) {
for (var j=0; j < articleInfos.length; j++) {
var contentId=(articleInfos[j].articleId).split("/");
if (contentId) {
if (article.contentid === (contentId[1] ? contentId[1] : contentId[0])) {
article.articleIndex = j;
break
}
}
}
}
}, _processCategory: function _processCategory(categoryKey, categoryData, options) {
var originalCategoryCount=this._clusters.length,
that=this,
categoryName=categoryData.categoryName,
clusterTemplate=categoryData.template,
newsItems=[],
defaultMaxClusterColumns=options.defaultMaxClusterColumns,
clusterIndex=options.clusterIndex,
enableVideoAds=options.enableVideoAds,
theme=options.theme,
isAdEnabled=options.isAdEnabled,
providerId=options.providerId,
adLayoutOverrideKey=options.adLayoutOverrideKey,
categoryToRender=options.categoryToRender,
visibleClustersConfig=options.visibleClustersConfig,
clusterDeepLinksConfig=options.clusterDeepLinksConfig,
maxColumnCount=defaultMaxClusterColumns,
preLaunchVideo=this._preLaunchVideo.bind(this),
clusterId=this._state.dynamicInfo.id + "_" + categoryName;
var clusterInfo={
title: categoryName, thumbnail: {url: ""}, moduleInfo: {
height: "140px", width: "290px", templateId: "dynamicPanoSemanticTileNoImage"
}
};
if (defaultMaxClusterColumns > 0 && categoryData.maxColumnCount !== null && !isNaN(categoryData.maxColumnCount)) {
maxColumnCount = categoryData.maxColumnCount
}
if (options.clusterIndex > 0 && defaultMaxClusterColumns > 0 && this._isNYT()) {
maxColumnCount = defaultMaxClusterColumns
}
if (categoryData.entities) {
newsItems = categoryData.entities.reduceRight(function unshiftItems(previousValue, currentValue, index) {
if (currentValue) {
currentValue.categoryKey = categoryKey;
currentValue.categoryName = categoryData.categoryName;
if (index === 0) {
currentValue.isLead = true
}
var videoOptions=currentValue.thumbnail && currentValue.thumbnail.videoOptions;
if (videoOptions) {
videoOptions.preLaunch = preLaunchVideo;
videoOptions.checkPaywallState = that._showPaywallCardForVideoEntityBinding;
videoOptions.showPaywallMessageBar = that._showGrowlMessageBarVideoEntityBinding
}
previousValue.unshift(currentValue);
if (currentValue.semanticZoomThumbnail && currentValue.semanticZoomThumbnail.url) {
clusterInfo.thumbnail = {url: currentValue.semanticZoomThumbnail.url};
clusterInfo.moduleInfo.templateId = "dynamicPanoSemanticTile"
}
}
return previousValue
}, [])
}
if (newsItems.length > 0) {
if (this._paywallProviderPromise) {
this._paywallProviderPromise.then(function displayPaywallLocks(paywallProvider) {
newsItems.forEach(function checkReadingPermission(editorialArticle) {
if (editorialArticle) {
if (editorialArticle.type === "article" || editorialArticle.type === "slideshow") {
var articleIdPath=this.getEditorialArticleIdPath(editorialArticle);
if (articleIdPath) {
var paidArticle=editorialArticle.paywall === "Locked";
var isAllowed=paywallProvider.isAccessAllowed(articleIdPath, paidArticle);
editorialArticle.isLocked = !isAllowed
}
}
else if (editorialArticle.type === "video" && editorialArticle.thumbnail.videoOptions) {
var videoOptions=editorialArticle.thumbnail.videoOptions;
if (videoOptions.videoSource) {
var paidContent=editorialArticle.paywall === "Locked";
videoOptions.paidContent = paidContent;
var isAllowed=paywallProvider.isAccessAllowed(videoOptions.videoSource, paidContent);
editorialArticle.isLocked = videoOptions.isLocked = !isAllowed
}
}
}
}, that)
})
}
var info=null;
switch (clusterTemplate) {
case"CompactCluster":
info = {
clusterEntity: clusterInfo, clusterPosition: clusterIndex + 1, clusterKey: categoryKey, clusterTitle: "", onHeaderSelection: null, clusterContent: {
contentControl: "CommonJS.News.CompactCluster", contentOptions: {
data: newsItems, dataSet: {newsItems: newsItems}, title: categoryName, onitemclick: function onitemclick(e) {
that.itemInvoked(e)
}
}
}
};
break;
default:
var dataResults={newsItems: newsItems};
if (this.dataProvider.layoutCacheInfo) {
dataResults.clusterID = this._state.dynamicInfo.clusterID || categoryKey + "_limited";
dataResults.cacheID = this.dataProvider.layoutCacheInfo.cacheID;
dataResults.dataCacheID = this.dataProvider.layoutCacheInfo.cacheKey;
dataResults.uniqueResponseID = this._cmsData.uniqueResponseId
}
var subcategory=null;
if (this._isNYT()) {
subcategory = "otherSections"
}
var contentOptions={
theme: categoryData.isVideoCluster ? "dynamicPanoBoxedTheme" : theme, mode: CommonJS.News.ClusterMode.static, unitWidth: categoryData.isVideoCluster ? 22 : null, videoAdUnitId: this._state.dynamicInfo.videoAdUnitId, enableVideoAds: enableVideoAds, onitemclick: categoryKey === "videos" ? function _dynamicPano_1160(e) {
that.videoItemInvoked(e)
} : function(e) {
that.itemInvoked(e)
}, maxColumnCount: categoryKey === "featuredArticles" ? null : maxColumnCount, dataSet: dataResults, configObject: options.entityClusterConfig, newsQuery: {categoryKey: categoryKey}, instrumentationEntryPoint: this._state.dynamicInfo.isFeaturedSource ? Platform.Instrumentation.InstrumentationArticleEntryPoint.partnerPano : null, enableSeeMore: false, categoryName: categoryName, categoryKey: categoryKey, subcategory: subcategory, providerId: providerId, adLayoutOverrideKey: adLayoutOverrideKey
};
var onHeaderSlection=null;
var isCategorySelectionEnabled=this._getCategorySelectionEnabled(this._state.dynamicInfo.id, categoryKey, this.headerSelectionEnabled);
if (isCategorySelectionEnabled) {
onHeaderSlection = this.onHeaderSelection.bind(this);
var config=clusterDeepLinksConfig && (clusterDeepLinksConfig[categoryKey] || clusterDeepLinksConfig[clusterId]);
if (config && config.value) {
onHeaderSlection = PlatformJS.Navigation.navigateTo.bind(PlatformJS.Navigation, config.value)
}
}
info = {
clusterEntity: clusterInfo, clusterPosition: clusterIndex + 1, clusterKey: categoryKey, clusterTitle: categoryName, onHeaderSelection: onHeaderSlection, clusterContent: {
contentControl: "CommonJS.News.EntityCluster", contentOptions: contentOptions
}, isEntityCluster: true
};
this._subChannels.push(info);
break
}
if (info) {
if (categoryToRender && categoryToRender.length > 0) {
if (categoryKey === categoryToRender) {
this._clusters.push(info)
}
}
else if (visibleClustersConfig) {
if (visibleClustersConfig[clusterId] || visibleClustersConfig[categoryKey]) {
this._clusters.push(info)
}
}
else {
this._clusters.push(info)
}
}
}
return originalCategoryCount !== this._clusters.length
}, _categorySelectionEnabledDictionary: null, _getCategorySelectionEnabled: function _getCategorySelectionEnabled(partnerName, categoryKey, defaultValue) {
if (this._categorySelectionEnabledDictionary === null) {
this._categorySelectionEnabledDictionary = CommonJS.Partners.Config.getConfig(partnerName, "CategorySelectionEnabled", {})
}
if (this._categorySelectionEnabledDictionary && this._categorySelectionEnabledDictionary.getBool) {
return this._categorySelectionEnabledDictionary.getBool(categoryKey, defaultValue)
}
return defaultValue
}, populateHeroAndCategories: function populateHeroAndCategories() {
if (this._disposed) {
return
}
var that=this,
isAdEnabled=PlatformJS.Ads && PlatformJS.Ads.Config.instance.adManager.enableAds,
adUnitId="",
panoControl=this._panoControl,
heroVisible=false,
dynamicInfo=this._state.dynamicInfo;
if (!dynamicInfo) {
return
}
var theme=dynamicInfo.theme ? dynamicInfo.theme : "dynamicPanoUnboxedTheme",
numCategoryClusters=0,
categoryToRender=dynamicInfo.clusterToRender,
enableVideoAds=false;
if (dynamicInfo.isFeaturedSource) {
enableVideoAds = !!dynamicInfo.videoAdUnitId
}
this._clusters = new WinJS.Binding.List;
this._subChannels = new WinJS.Binding.List;
var defaultMaxClusterColumns=dynamicInfo.clusterColumnMax || (dynamicInfo.clusterToRender ? 0 : 3);
if (!dynamicInfo.clusterToRender) {
heroVisible = this.createHero()
}
if (this._cmsData && this._cmsData.categories && this._cmsData.categoryOrder) {
var categoryOrder=this._cmsData.categoryOrder;
if (categoryOrder && categoryOrder.length <= 1 && defaultMaxClusterColumns && !dynamicInfo.clusterColumnMax) {
defaultMaxClusterColumns = 0
}
if (categoryOrder && categoryOrder.length > 0) {
if (categoryOrder.length === 1) {
this.headerSelectionEnabled = false
}
this._authInfo = this._cmsData.authInfo;
if (this._authInfo) {
var authInfo=this._authInfo;
if (!this._paywallProviderPromise) {
try {
this._paywallProviderPromise = DynamicPanoJS.createPaywallProviderPromise(dynamicInfo.instrumentationId, authInfo)
}
catch(error) {
this._pageRendered = false;
return
}
}
this._showPaywallCardForVideoEntityBinding = this._showPaywallCardForVideoEntity.bind(this);
if (authInfo.meteringtype === "CountPerTime") {
this._showGrowlMessageBarVideoEntityBinding = this._showGrowlMessageBarVideoEntity.bind(this)
}
if (!this._paywallExtraConfigPromise) {
if (!authInfo.useinterstitialcard) {
try {
var queryService=new PlatformJS.DataService.QueryService("FeaturedSourcesExtraDataSource");
var options=new Platform.DataServices.QueryServiceOptions;
options.useCompatDataModel = true;
var queryParams=PlatformJS.Collections.createStringDictionary();
queryParams["market"] = (dynamicInfo.market || CommonJS.Globalization.getMarketStringForEditorial()).toUpperCase();
queryParams["previewparams"] = (PlatformJS.isDebug && CommonJS.State && CommonJS.State.isPreviewModeEnabled) ? "/" + PlatformJS.Services.appConfig.getString("CMSPreviewParam") : "";
queryParams["partner"] = dynamicInfo.instrumentationId;
this._paywallExtraConfigPromise = queryService.downloadDataAsync(queryParams, null, null, options).then(function _dynamicPano_1467(data) {
return data.dataString
}, function _dynamicPano_1470(queryError) {
return null
})
}
catch(error) {
console.log(error + " error reading paywall config from the datasource");
this._paywallExtraConfigPromise = WinJS.Promise.wrap(null)
}
}
else {
this._paywallExtraConfigPromise = WinJS.Promise.wrap(null)
}
}
if (this._paywallProviderPromise) {
this._paywallProviderPromise.done(function _dynamicPano_1484(paywallProvider) {
var instrumentationId=dynamicInfo.instrumentationId;
var refresh=function() {
that._refreshPage()
};
var dynamicPanoAccent=document.querySelector(".dynamicPanoAccent");
var dynamicPanoAccentColor=null;
if (dynamicPanoAccent) {
dynamicPanoAccentColor = window.getComputedStyle(dynamicPanoAccent).backgroundColor
}
CommonJS.Partners.Auth.defaultSettings.accentColor = dynamicPanoAccentColor;
DynamicPanoJS.setupLoginButton(paywallProvider, refresh, instrumentationId);
DynamicPanoJS.setupSubscribeButton(paywallProvider, refresh, instrumentationId, dynamicPanoAccentColor, that._elementPanoramaFragment);
that._hidePaywallSubscribeOnOverlap()
})
}
}
var visibleClustersConfig=CommonJS.Partners.Config.getConfig(dynamicInfo.id, "VisibleClusters", []),
clusterDeepLinksConfig=CommonJS.Partners.Config.getConfig(dynamicInfo.id, "ClusterDeepLinks", null);
if (visibleClustersConfig && visibleClustersConfig.length) {
visibleClustersConfig = visibleClustersConfig.map(function _dynamicPano_1510(item) {
return item.value
}).reduce(function _dynamicPano_1512(previousValue, currentValue) {
previousValue[currentValue] = true;
return previousValue
}, {})
}
else {
visibleClustersConfig = null
}
if (!clusterDeepLinksConfig || !clusterDeepLinksConfig.size) {
clusterDeepLinksConfig = null
}
var categoryOptions={
defaultMaxClusterColumns: defaultMaxClusterColumns, enableVideoAds: enableVideoAds, theme: theme, isAdEnabled: isAdEnabled, providerId: dynamicInfo.providerId, adLayoutOverrideKey: dynamicInfo.adLayoutOverrideKey || dynamicInfo.id, categoryToRender: categoryToRender, visibleClustersConfig: visibleClustersConfig, clusterDeepLinksConfig: clusterDeepLinksConfig, entityClusterConfig: this._getConfigObject()
};
categoryOrder.forEach(function gothroughCategoryOrder(categoryKey) {
var categoryData=this._cmsData.categories[categoryKey];
categoryOptions.clusterIndex = numCategoryClusters;
if (categoryData && this._processCategory(categoryKey, categoryData, categoryOptions)) {
numCategoryClusters++
}
}, this);
PlatformJS.Ads && PlatformJS.Ads.addOrderedAdsClusterConfig(this._clusters, null, dynamicInfo.id, null, dynamicInfo.providerId, dynamicInfo.adLayoutOverrideKey || dynamicInfo.id);
this.numCategoryClusters = numCategoryClusters;
if (panoControl) {
if (numCategoryClusters === 0 || numCategoryClusters === 1 && !heroVisible) {
panoControl.zoomOptions = {locked: true}
}
var sortedDataSource=this.getSortedClusterDataSource(this._clusters);
if (dynamicInfo.isFeaturedSource) {
if (this._subChannels) {
var sortedSubChannelDataSource=this.getSortedClusterDataSource(this._subChannels);
this.populateL2IfHoisted(sortedSubChannelDataSource)
}
else {
this.populateL2IfHoisted(sortedDataSource)
}
}
panoControl.panoramaState = this._panoramaState;
panoControl.clusterDataSource = sortedDataSource.dataSource;
var entitlementPromise;
if (this._paywallProviderPromise) {
entitlementPromise = this._paywallProviderPromise
}
else {
entitlementPromise = WinJS.Promise.wrap(true)
}
WinJS.Promise.join([entitlementPromise, this._lockUntilBindingComplete]).then(function instrumentDynamicPanoPage() {
var impression=PlatformJS.Navigation.mainNavigator.getCurrentImpression();
if (impression) {
that._getPaywallInstrumentationAsync().done(function _dynamicPano_1576(attributes) {
attributes.partnerId = dynamicInfo.id;
attributes.channelID = dynamicInfo.channelID;
attributes.partnerCode = dynamicInfo.instrumentationId;
impression.logContentWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, JSON.stringify(attributes))
})
}
});
if (this._cmsData.lastFetchedTime) {
var dateString="";
var dateFormatter;
var publisherName=dynamicInfo.panoTitle;
dateFormatter = CommonJS.Utils.DateTimeFormatting.getDateTimeFormatter(publisherName);
if (dateFormatter) {
dateString = dateFormatter(this._cmsData.lastFetchedTime, CommonJS.Utils.DateTimeFormatting.dateTimeFormat.panoWatermark)
}
if (!dateFormatter || !dateString) {
var fetchDate=new Date(this._cmsData.lastFetchedTime);
dateString = fetchDate.toLocaleDateString() + " " + fetchDate.toLocaleTimeString()
}
CommonJS.Watermark.setWatermarkHtml(["<div id=\"platformLastUpdatedTime\"><span class=\"platformLastUpdatedLabel\">", PlatformJS.Services.resourceLoader.getString("/platform/offline_lastUpdated").format(""), "</span>", "<span class=\"platformLastUpdated\">", dateString, "</span></div>"].join(""))
}
}
if (numCategoryClusters === 0 && !heroVisible) {
PlatformJS.Navigation.mainNavigator.returnHomeAndClearHistoryIfNecessary(true)
}
}
}
}, onHeaderSelection: function onHeaderSelection(clusterHeaderName) {
var headerName=null;
if (this.numCategoryClusters >= 2 && clusterHeaderName) {
headerName = clusterHeaderName
}
if (headerName && this.config && this.config.categorypage) {
var dynamicInfo=JSON.parse(JSON.stringify(this._state.dynamicInfo));
dynamicInfo.clusterID = headerName;
dynamicInfo.clusterToRender = headerName;
dynamicInfo.clusterTitle = this._cmsData.categories[headerName].categoryName;
var channelID=PlatformJS.Navigation.mainNavigator.channelIDInView;
var featuredChannel=this.getFeaturedChannel(channelID);
var channelIdToNavigate=(featuredChannel ? featuredChannel.id : channelID) + "_" + dynamicInfo.clusterTitle;
var state={
dynamicInfo: dynamicInfo, clusterAdsConfigPageId: channelID, articleReaderAdsConfigPageId: channelID
};
WinJS.Navigation.navigate({
channelId: channelIdToNavigate, fragment: this.config.categorypage.htmlPath, page: this.config.categorypage.controlName
}, state)
}
}, _sortedDataSource: null, getSortedClusterDataSource: function getSortedClusterDataSource(clusters) {
var sortedDataSource=null;
if (clusters) {
sortedDataSource = clusters.createSorted(function _dynamicPano_1654(l, r) {
if (l.clusterPosition < r.clusterPosition) {
return -1
}
else if (l.clusterPosition === r.clusterPosition) {
return 0
}
else {
return 1
}
})
}
return sortedDataSource
}, getAnchorMapping: function getAnchorMapping(mappingText) {
var fallBackAnchor="anchorLeft";
if (mappingText === "Top") {
return "anchorTop"
}
else if (mappingText === "Left") {
return "anchorLeft"
}
else if (mappingText === "Bottom") {
return "anchorBottom"
}
else if (mappingText === "Right") {
return "anchorRight"
}
else if (mappingText === "Middle") {
return "anchorMiddle"
}
else {
return fallBackAnchor
}
}, onPreviewToggle: function onPreviewToggle() {
this._refreshPage()
}, cmsHeroCluster: function cmsHeroCluster(editorial, heroList) {
editorial.isHero = true;
var date=PlatformJS.Services.resourceLoader.getString("TopStory");
var semanticZoomImageAvailable=editorial.semanticZoomThumbnail && editorial.semanticZoomThumbnail.url;
var clusterInfo={
title: date, thumbnail: {url: semanticZoomImageAvailable ? editorial.semanticZoomThumbnail.url : ""}, moduleInfo: {
height: "140px", width: "290px", templateId: semanticZoomImageAvailable ? "dynamicPanoSemanticTile" : "dynamicPanoSemanticTileNoImage"
}
};
var parser=window.DOMParser ? new window.DOMParser : null;
heroList.push({
moduleInfo: {
isInteractive: false, templateId: "panoHero", className: "leadStoryLayoutImage"
}, title: PlatformJS.Utilities.fixupBidiTextNodes(editorial.headline, parser), favicon: editorial.sourceImageUrl, faviconErrorHandler: WinJS.Utilities.markSupportedForProcessing(function _dynamicPano_1724(img) {
if (img && img.parentElement && img.parentElement.style) {
img.parentElement.style.display = "none"
}
}), publishTime: editorial.publishTime, snippet: PlatformJS.Utilities.fixupBidiTextNodes(editorial.abstract, parser), source: editorial.source
});
var backgroundImageData="";
if (editorial.thumbnail && editorial.thumbnail.url) {
if (editorial.thumbnailLowRes && editorial.thumbnailLowRes.url) {
backgroundImageData = {
lowResolutionUrl: editorial.thumbnailLowRes.url, highResolutionUrl: editorial.thumbnail.url
}
}
else {
backgroundImageData = editorial.thumbnail.url
}
}
this._clusters.push({
clusterEntity: clusterInfo, clusterPosition: 0, clusterKey: this._heroKey, clusterTitle: date, hideTitle: true, isSticky: true, titleClass: this._headerColor, clusterContent: {
contentControl: "CommonJS.Immersive.PlatformHeroControl", contentOptions: {
disableParallax: true, heroItems: heroList, primaryHeroImageData: {
backgroundImage: backgroundImageData, imageSize: {
width: editorial.thumbnail && editorial.thumbnail.width ? editorial.thumbnail.width : 0, height: editorial.thumbnail && editorial.thumbnail.height ? editorial.thumbnail.height : 0
}, attributionData: {
attributionText: editorial.imageAttribution, caption: editorial.caption
}, anchorPoint: this.getAnchorMapping(editorial.anchorpoint)
}, onitemclick: this.itemInvoked.bind(this, {item: editorial}), layoutId: CommonJS.Immersive.HERO_LAYOUT_ONE_ITEM
}
}
})
}, _helpButtonClicked: function _helpButtonClicked(e) {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(Microsoft.Bing.AppEx.Telemetry.ImpressionNavMethod.appBar);
CommonJS.Settings.onHelpCmd();
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.ActionContext.appBar, "Help button", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, "")
}, _getConfigObject: function _getConfigObject() {
var channelId=this._state.dynamicInfo.id;
var configValue=CommonJS.Partners.Config.getConfig(channelId, "EntityClusterConfig", "CommonJS.News.EntityClusterConfig.DefaultNews");
return PlatformJS.Utilities.getDeepObject(window, configValue)
}, _isNYT: function _isNYT() {
var panoClass=this._state.dynamicInfo.panoClass;
return panoClass === "NYT"
}, _isWSJ: function _isWSJ() {
var panoClass=this._state.dynamicInfo.panoClass;
return panoClass === "WSJ"
}, _heroKey: "Hero", handleCMS: function handleCMS(completedValue) {
if (completedValue) {
this._cmsData = completedValue
}
}, getArticleReaderNavigationInfo: function getArticleReaderNavigationInfo(article, articleIdPath, marketString, articleInfos, listInfo, themeOverride, adGroups, cssToInject) {
var navigation={
state: {}, pageInfo: {}
};
var providerType="AppEx.Common.ArticleReader.BedrockArticleProvider";
var providerConfiguration=PlatformJS.Collections.createStringDictionary();
var queryServiceId=this.config.articlereader.queryServiceID;
var fallbackQueryServiceId=this.config.articlereader.fallbackQueryServiceID;
providerConfiguration.insert("queryServiceId", queryServiceId);
providerConfiguration.insert("fallbackQueryServiceId", fallbackQueryServiceId);
providerConfiguration.insert("imageCacheId", "PlatformImageCache");
providerConfiguration.insert("market", marketString);
if (articleInfos) {
providerConfiguration.insert("articleInfos", articleInfos);
providerConfiguration.insert("indexBased", true)
}
var articleReaderTheme;
if (themeOverride !== null && themeOverride !== undefined) {
articleReaderTheme = themeOverride
}
else {
articleReaderTheme = this.config.articlereader.theme
}
var articleId=articleIdPath;
if (typeof article.articleIndex === "number") {
articleId = article.articleIndex
}
var partnerInstrumentationId=this._state.dynamicInfo.instrumentationId;
navigation.state = {
providerType: providerType, providerConfiguration: providerConfiguration, initialArticleId: articleId, enableSnap: true, enableSharing: true, adPartnerName: partnerInstrumentationId, theme: articleReaderTheme, market: marketString, instrumentation: listInfo.instrumentation, instrumentationId: partnerInstrumentationId, categoryKey: article.categoryKey, categoryName: article.categoryName, sectionName: listInfo.clusterTitle, paywallInstrumentationAttributesPromise: this._getPaywallInstrumentationAsync(true)
};
if (this._state.dynamicInfo.id && this._authInfo) {
navigation.state.authProvider = {
partnerId: this._state.dynamicInfo.id, authInfo: this._authInfo
}
}
if (cssToInject) {
navigation.state.css = cssToInject
}
if (adGroups) {
navigation.state.adGroups = adGroups
}
navigation.state.actionsHandlerType = "CommonJS.ArticleReader.ExternalActionsHandler";
if (typeof source === "number") {
navigation.state.source = source
}
else {
navigation.state.source = 2
}
navigation.state.entryPoint = listInfo.entryPoint;
navigation.pageInfo.channelId = null;
navigation.pageInfo.fragment = this.config.articlereader.htmlPath;
navigation.pageInfo.page = this.config.articlereader.controlName;
if (!PlatformJS.Utilities.hasInternetConnection()) {
var queryService=new PlatformJS.DataService.QueryService(queryServiceId);
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("market", marketString);
urlParams.insert("articleId", articleIdPath);
var fallbackQueryService=new PlatformJS.DataService.QueryService(fallbackQueryServiceId);
var fallbackUrlParams=PlatformJS.Collections.createStringDictionary();
fallbackUrlParams.insert("market", marketString);
fallbackUrlParams.insert("articleId", articleIdPath);
var promises=[];
promises.push(queryService.hasEntryAsync(urlParams, null));
promises.push(fallbackQueryService.hasEntryAsync(fallbackUrlParams, null));
navigation.dataAvailable = new WinJS.Promise(function _dynamicPano_1951(complete) {
WinJS.Promise.join(promises).then(function _dynamicPano_1952(results) {
if (results[0] || results[1]) {
complete(true)
}
else {
complete(false)
}
}, function _dynamicPano_1959(err) {
complete(false)
})
})
}
else {
navigation.dataAvailable = WinJS.Promise.wrap(true)
}
return navigation
}, populateArticleInfoAds: function populateArticleInfoAds(articleInfos) {
if (!PlatformJS.Ads) {
return
}
var dynamicInfo=this._state.dynamicInfo;
var category=dynamicInfo.id;
if (this._isWSJ()) {
category = dynamicInfo.clusterTitle;
if (category) {
category = category.toUpperCase()
}
else {
category = "FRONT SECTION"
}
}
if (articleInfos && articleInfos.articleInfos) {
PlatformJS.Utilities.annotateArticleInfosWithAdInfo(category, null, articleInfos.articleInfos, null, dynamicInfo.providerId, dynamicInfo.adLayoutOverrideKey || dynamicInfo.id)
}
}, _getPaywallInstrumentationAsync: function _getPaywallInstrumentationAsync(getAuthToken) {
var paywallPromise=this._paywallProviderPromise ? this._paywallProviderPromise : WinJS.Promise.wrap(null);
var instrumentationId=this._state.dynamicInfo.instrumentationId;
return paywallPromise.then(function _dynamicPano_2019(paywallProvider) {
return DynamicPanoJS.DynamicPano.getPaywallInstrumentationFromPaywallProvider(paywallProvider, instrumentationId, getAuthToken)
})
}, launchArticle: function launchArticle(article, listInfo, themeOverride, adGroups, extraOptions, cssToInject) {
var sourceMarket=(article.market && article.market.length > 0) ? article.market : (this.market || CommonJS.Globalization.getMarketStringForEditorial());
var that=this,
dynamicInfo=this._state.dynamicInfo || {},
authInfo=this._authInfo;
if (article.editorial) {
if (article.type === "slideshow") {
if (!sourceMarket) {
return
}
if (article.contentid && sourceMarket) {
if (article.isLocked && this._paywallProviderPromise) {
this._showLoginUI(article)
}
else {
var targetState={
slideshowId: article.contentid, market: sourceMarket
};
targetState.instrumentationEntryPoint = listInfo.entryPoint;
this._getPaywallInstrumentationAsync().done(function _dynamicPano_2061(attributes) {
attributes.partnerId = dynamicInfo.id;
attributes.channelID = dynamicInfo.channelID;
attributes.partnerCode = dynamicInfo.instrumentationId;
attributes.contentId = article.contentid;
PlatformJS.deferredTelemetry(function _logUserAction() {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "partnerPano", "slideshow launched", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(attributes))
})
});
this._paywallSettingsSlideShowPromise = WinJS.Promise.wrap(null);
if (this._paywallProviderPromise && authInfo) {
var articleIdPath=this.getEditorialArticleIdPath(article);
if (articleIdPath) {
var paidArticle=article.paywall === "Locked";
this._paywallSettingsSlideShowPromise = this._paywallProviderPromise.then(function dynamicPanoLauchSlideShow_markArticleAccessed(paywallProvider) {
paywallProvider.accessItem(articleIdPath, paidArticle);
if (authInfo.meteringtype === "CountPerTime") {
return DynamicPanoJS.getGrowlMessage(true, that.getPanoTitle(), that._paywallProviderPromise)
}
}).then(function dynamicPanoLauchSlideShow_showGrowlText(message) {
if (message) {
extraOptions = extraOptions || {};
extraOptions.dynamicPanoPaywallMessageFunction = function() {
that._createGrowlMessageBar(message, "growlTextSlideShow")
};
targetState.extraOptions = extraOptions
}
})
}
}
this._paywallSettingsSlideShowPromise.done(function dynamicPanoLauchSlideShow_navigateToSlideShow() {
if (extraOptions) {
targetState.extraOptions = extraOptions
}
WinJS.Navigation.navigate({
fragment: that.config.slideshow.htmlPath, page: that.config.slideshow.controlName
}, targetState)
})
}
}
}
else if (article.type === "article") {
var articleIdPath=this.getEditorialArticleIdPath(article);
var articleInfos;
if (!article.clusterArticles) {
if (!this._articleInfos) {
var sortedDataSource=this.getSortedClusterDataSource(this._clusters);
this.setArticleInfosOnDataSource(sortedDataSource, this._cmsData.hero)
}
article.clusterArticles = {articleInfos: this._articleInfos}
}
this._setArticleIndexForCurrentArticle(article);
this.populateArticleInfoAds(article.clusterArticles);
if (article.clusterArticles) {
articleInfos = JSON.stringify(article.clusterArticles)
}
var navigation=this.getArticleReaderNavigationInfo(article, articleIdPath, sourceMarket, articleInfos, listInfo, themeOverride, adGroups, cssToInject);
if (navigation && navigation.dataAvailable) {
var promise=WinJS.Promise.join([navigation.dataAvailable, this._paywallExtraConfigPromise || WinJS.Promise.wrap(null)]);
promise.then(function _dynamicPano_2129(results) {
if (results[0]) {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(Microsoft.Bing.AppEx.Telemetry.ImpressionNavMethod.cluster);
if (that._isNYT()) {
navigation.pageInfo.page = "NYTJS.ArticleReader.Page"
}
var extraConfig=null;
if (authInfo && authInfo.meteringtype === "CountPerTime") {
if (authInfo.useinterstitialcard) {
extraConfig = {
PaywallCardBackgroundImage: authInfo.interstitialbackground, PaywallCardLogoImage: authInfo.interstitiallogo
}
}
else {
try {
extraConfig = JSON.parse(results[1])
}
catch(err) {
console.log(err)
}
}
navigation.state.extraPaywallConfiguration = extraConfig;
if (extraConfig && !extraConfig.UseDwellTime) {
navigation.state.isPaywallCardEnabled = true
}
else {
navigation.state.showGrowlTextWithoutPaywallCard = true
}
}
WinJS.Navigation.navigate({
fragment: navigation.pageInfo.fragment, page: navigation.pageInfo.page
}, navigation.state)
}
else {
that.showToast(PlatformJS.Services.resourceLoader.getString("/platform/ArticleUnavailableOffline"))
}
})
}
}
else if (article.type === "partnerPano") {
PlatformJS.Navigation.navigateTo(article.destination)
}
}
}, itemInvoked: function itemInvoked(e) {
var item=e.item;
var source=null;
if (item) {
if (item.editorial) {
if (item.isHero) {
source = Platform.Instrumentation.InstrumentationEditorialSourceId.heroImage
}
else {
source = Platform.Instrumentation.InstrumentationEditorialSourceId.cluster
}
}
var articleReaderTheme=this._state && this._state.dynamicInfo ? this._state.dynamicInfo.articleTheme : null;
var extraOptions=this.extraOptions(item);
var clusterTitle=this._state.dynamicInfo.clusterTitle;
if (!clusterTitle) {
for (var i=0; i < this._clusters.length; i++) {
var currentCluster=this._clusters.getAt(i);
if (!currentCluster || item.categoryKey !== currentCluster.clusterKey) {
continue
}
if (currentCluster.clusterTitle) {
clusterTitle = currentCluster.clusterTitle;
break
}
var currentClusterContent=currentCluster.clusterContent;
if (currentClusterContent && currentClusterContent.contentOptions && currentClusterContent.contentOptions.title) {
clusterTitle = currentClusterContent.contentOptions.title;
break
}
}
}
var listInfo={
source: source, instrumentation: this._state.dynamicInfo.instrumentation, entryPoint: Platform.Instrumentation.InstrumentationArticleEntryPoint.partnerPano, clusterTitle: clusterTitle
};
this.launchArticle(item, listInfo, articleReaderTheme, null, extraOptions, this._cssData)
}
}, extraOptions: function extraOptions(item) {
return {}
}, videoItemInvoked: function videoItemInvoked(e){}, _preLaunchVideo: function _preLaunchVideo(videoOptions) {
var that=this;
if (this._showGrowlMessageBarVideoEntityBinding) {
var player=CommonJS.MediaApp.Controls.MediaPlayback.instance;
if (player) {
player.dynamicPanoPaywallMessageFunction = function() {
if (this._videoMessageBar) {
this._videoMessageBar.hide()
}
player.dynamicPanoPaywallMessageFunction = function(){}
}
}
}
return this._showPaywallCardForVideoEntity(videoOptions).then(function preLaunchVideo_afterCheckPaywallState(showVideo) {
that._getPaywallInstrumentationAsync().done(function dynamicPano_preLaunchVideo_logContent(attributes) {
attributes.partnerId = that._state.dynamicInfo.id;
attributes.channelID = that._state.dynamicInfo.channelID;
attributes.partnerCode = that._state.dynamicInfo.instrumentationId;
attributes.source = videoOptions.source;
attributes.title = videoOptions.title;
attributes.contentId = videoOptions.videoSource;
PlatformJS.deferredTelemetry(function _logUserAction() {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "mediaplayer", "Movie Playback Started", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(attributes))
})
});
return WinJS.Promise.wrap(showVideo)
})
}, _showPaywallCardForVideoEntity: function _showPaywallCardForVideoEntity(options) {
var that=this,
paywallProviderPromise=this._paywallProviderPromise;
if (paywallProviderPromise && !this._disposed) {
return paywallProviderPromise.then(function dynamicPano_checkAccessForTheVideoEntity(provider) {
var isAllowed=provider.isAccessAllowed(options.videoSource, options.paidContent);
if (!isAllowed) {
that._showLoginUI(true);
return WinJS.Promise.wrap(false)
}
else {
provider.accessItem(options.videoSource, options.paidContent);
return WinJS.Promise.wrap(true)
}
})
}
return WinJS.Promise.wrap(true)
}, _showGrowlMessageBarVideoEntity: function _showGrowlMessageBarVideoEntity() {
var that=this,
paywallProviderPromise=this._paywallProviderPromise;
if (paywallProviderPromise && !this._disposed) {
var showMessageBarPromise=that._showGrowlMessageBarPromise || WinJS.Promise.wrap(null);
that._showGrowlMessageBarPromise = showMessageBarPromise.then(function showGrowlMessageOnVideo_getGrowlMessage() {
return DynamicPanoJS.getGrowlMessage(true, that.getPanoTitle(), paywallProviderPromise)
}).then(function dynamicPanoLaunchVideo_showMessageBar(message) {
if (message) {
that._videoMessageBar = that._createGrowlMessageBar(message, "growlTextVideoControl")
}
})
}
return that._showGrowlMessageBarPromise || WinJS.Promise.wrap(null)
}, getPageState: function getPageState() {
if (this._panoControl) {
this._state.panoramaState = this._panoControl.getPanoramaState()
}
return this._state
}, getPanoTitle: function getPanoTitle() {
var title=this._state.dynamicInfo.panoTitle;
if (this._state.dynamicInfo.panoTitleResource) {
title = PlatformJS.Services.resourceLoader.getString(this._state.dynamicInfo.panoTitleResource)
}
return title
}, getPageData: function getPageData() {
var title=this.getPanoTitle();
return WinJS.Promise.wrap({
title: title, semanticZoomRenderer: WinJS.Utilities.markSupportedForProcessing(this.dynamicPanoSemanticZoomRenderer), headerOptions: this.commonHeaderOptions
})
}, _showLoginUI: function _showLoginUI(refreshOnCancel) {
var that=this,
paywallProviderPromise=this._paywallProviderPromise,
instrumentationId=this._state.dynamicInfo ? this._state.dynamicInfo.instrumentationId : null;
return paywallProviderPromise.done(function dynamicPano_showLoginUI(paywallProvider) {
var online=PlatformJS.Utilities.hasInternetConnection();
if (online) {
var paywallControl=CommonJS.Partners.Auth.PaywallControlFactory.createPaywallControl(paywallProvider, instrumentationId);
paywallControl.loginAsync().then(function showLoginUI_afterUserRespose(response) {
if (response.success) {
DynamicPanoJS.forceRefreshPano = true;
that._refreshPage()
}
}, function paywallError(e) {
console.log(e);
if (refreshOnCancel && e === "NotLoggedIn") {
DynamicPanoJS.forceRefreshPano = true;
that._refreshPage()
}
})
}
else {
DynamicPanoJS._showPaywallOfflineUI()
}
})
}, _createGrowlMessageBar: function _createGrowlMessageBar(message, className) {
if (message) {
var options={
autoHide: true, isSticky: false
};
var messageBar=new CommonJS.MessageBar("", options);
var messageBarDiv=WinJS.Utilities.query(".platformMessageBarText");
if (messageBarDiv.length > 0) {
messageBarDiv[0].innerHTML = message
}
className = "dynamicPanoMessageBar " + (className || "");
messageBar.show(className);
return messageBar
}
return null
}, dynamicPanoSemanticZoomRenderer: function dynamicPanoSemanticZoomRenderer(itemPromise) {
return {element: itemPromise.then(function _dynamicPano_2355(group) {
var div=document.createElement("div");
if (group.data.clusterEntity) {
WinJS.Utilities.addClass(div, "platformSemanticZoomItem");
var binding=group.data.clusterEntity;
CommonJS.setModuleSizeAndClass(binding.moduleInfo, div);
CommonJS.loadModule(binding.moduleInfo, binding, div).then()
}
return div
})}
}
}, {
loadPanoData: function loadPanoData(channel, market, bypassCache) {
bypassCache = bypassCache || false;
var options={
feedName: channel.state.dynamicInfo.feedName, dataProviderOptions: channel.state.dynamicInfo.dataProviderOptions, cssFeedUrl: channel.state.dynamicInfo.css, market: market
};
var dataProvider=new DynamicPanoJS.DynamicPanoProvider(options);
return dataProvider.fetchCacheData().then(DynamicPano.PartnerDynamicPanoPage._wrapFetchedData).then(function tryLoadDataFromNetwork(cachedResult) {
if (cachedResult) {
return WinJS.Promise.wrap(cachedResult)
}
var isSubPano=channel.state.dynamicInfo.clusterID ? true : false;
return dataProvider.fetchNetworkData(bypassCache, isSubPano).then(DynamicPano.PartnerDynamicPanoPage._wrapFetchedData)
})
}, createChannel: function createChannel(id, title, fragment, page, state, isDeepLink) {
return {
id: id, title: title, icon: "", subChannels: [], pageInfo: {
fragment: fragment, page: page, channelId: id
}, state: state, isDisplayValue: true, isDeepLink: !!isDeepLink
}
}, createSubChannelFromFeaturedParent: function createSubChannelFromFeaturedParent(featuredChannel, title, key, featuredChannelId) {
var newChannelId=featuredChannel.id + "_" + title;
var state=null;
var clusterDeepLinksConfig=CommonJS.Partners.Config.getConfig(featuredChannelId, "ClusterDeepLinks", null);
var deepLink=clusterDeepLinksConfig && (clusterDeepLinksConfig[key] || clusterDeepLinksConfig[newChannelId]);
var isDeepLink=false;
if (deepLink && deepLink.value) {
deepLink = deepLink.value;
isDeepLink = true
}
else {
state = JSON.parse(JSON.stringify(featuredChannel.state));
state.dynamicInfo.clusterID = key;
state.dynamicInfo.clusterToRender = key;
state.dynamicInfo.clusterTitle = title
}
var newChannel=DynamicPanoJS.DynamicPano.createChannel(newChannelId, title, isDeepLink ? deepLink : featuredChannel.pageInfo.fragment, isDeepLink ? null : featuredChannel.pageInfo.page, state, isDeepLink);
return newChannel
}, getPaywallInstrumentationFromPaywallProvider: function getPaywallInstrumentationFromPaywallProvider(paywallProvider, instrumentationId, getAuthToken) {
return {
authToken: DynamicPanoJS.DynamicPano._getAuthTokenFromPaywallProvider(paywallProvider, instrumentationId, getAuthToken), userType: DynamicPanoJS.DynamicPano._getUserTypeFromPaywallProvider(paywallProvider)
}
}, _getAuthTokenFromPaywallProvider: function _getAuthTokenFromPaywallProvider(paywallProvider, instrumentationId, getAuthToken) {
var authToken="Anonymous";
if (paywallProvider) {
if (getAuthToken) {
authToken = paywallProvider.authToken
}
else {
var paywallInstrumentationConfig=Platform.Configuration.ConfigurationManager.custom.getDictionary("EnableGetPaywallAuthToken");
getAuthToken = paywallInstrumentationConfig && paywallInstrumentationConfig.getBool(instrumentationId, false);
authToken = getAuthToken ? paywallProvider.authToken : authToken
}
}
return authToken
}, _getUserTypeFromPaywallProvider: function _getUserTypeFromPaywallProvider(paywallProvider) {
var paywallUserType=paywallProvider ? paywallProvider.currentLoginStatus.userType : null;
var userType;
switch (paywallUserType) {
case Platform.Paywall.UserType.registered:
userType = DynamicPanoJS.UserTypeEnum.Registered;
break;
case Platform.Paywall.UserType.subscriber:
userType = DynamicPanoJS.UserTypeEnum.Subscriber;
break;
default:
userType = DynamicPanoJS.UserTypeEnum.Anonymous;
break
}
return userType
}
}), _paywallGrowlTimeframeResourceKeys: ["/Platform/PaywallCardThisHour", "/Platform/PaywallCardToday", "/Platform/PaywallCardThisWeek", "/Platform/PaywallCardThisMonth", "/Platform/PaywallCardThisYear", ], _paywallQuotaReachedResourceKeys: ["/Platform/PaywallCardHour", "/Platform/PaywallCardDay", "/Platform/PaywallCardWeek", "/Platform/PaywallCardMonth", "/Platform/PaywallCardYear", ], _showPaywallOfflineUI: function _showPaywallOfflineUI() {
var msg=PlatformJS.Services.resourceLoader.getString("/platform/offline_noContent");
DynamicPanoJS.DynamicPano.prototype.showToast.call(this, msg)
}, setupSubscribeButton: function setupSubscribeButton(paywallProvider, refreshPageFunction, instrumentationId, accentColor, parentElement) {
if (!paywallProvider || document.getElementById("subscribeButton")) {
return
}
var subscribeButton=document.createElement("button");
subscribeButton.id = "subscribeButton";
WinJS.Utilities.addClass(subscribeButton, "subscribeButtonHidden");
subscribeButton.innerHTML = paywallProvider.paywallSettings.subscriptionpanodescription ? paywallProvider.paywallSettings.subscriptionpanodescription : PlatformJS.Services.resourceLoader.getString("/platform/subscribePanoButton");
if (accentColor) {
subscribeButton.style.color = accentColor
}
PlatformJS.Utilities.enablePointerUpDownAnimations(subscribeButton);
subscribeButton.onclick = function(event) {
PlatformJS.deferredTelemetry(function _logUserAction() {
var attributes=DynamicPanoJS.DynamicPano.getPaywallInstrumentationFromPaywallProvider(paywallProvider, instrumentationId);
attributes.partnerCode = instrumentationId;
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.ActionContext.paywall, "Top Right Subscribe Button", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(attributes))
});
var online=PlatformJS.Utilities.hasInternetConnection();
if (online) {
var paywallControl=CommonJS.Partners.Auth.PaywallControlFactory.createPaywallControl(paywallProvider, instrumentationId);
paywallControl.subscribeAsync().then(function _dynamicPano_2603(response) {
if (response.success && refreshPageFunction) {
DynamicPanoJS.forceRefreshPano = true;
refreshPageFunction()
}
}, function paywallError(e){})
}
else {
DynamicPanoJS._showPaywallOfflineUI()
}
};
function _updateSubscribeButtonAsync() {
if (!paywallProvider) {
return WinJS.Promise.wrap(null)
}
var isSubscriber=(paywallProvider.currentLoginStatus.userType === Platform.Paywall.UserType.subscriber);
if (isSubscriber) {
WinJS.Utilities.addClass(subscribeButton, "subscribeButtonHidden")
}
else {
WinJS.Utilities.removeClass(subscribeButton, "subscribeButtonHidden")
}
}
;
function _unsubscribeEventListeners() {
paywallProvider.removeEventListener("loginstatuschange", _updateSubscribeButtonAsync);
WinJS.Navigation.removeEventListener("navigated", _unsubscribeEventListeners)
}
paywallProvider.addEventListener("loginstatuschange", _updateSubscribeButtonAsync);
WinJS.Navigation.addEventListener("navigated", _unsubscribeEventListeners);
if (parentElement) {
parentElement.appendChild(subscribeButton)
}
else {
var page=document.querySelector(".platformPage");
page.appendChild(subscribeButton)
}
return _updateSubscribeButtonAsync()
}, setupLoginButton: function setupLoginButton(paywallProvider, refreshPageFunction, instrumentationId) {
if (!paywallProvider) {
return
}
if (document.getElementById("loginButton")) {
return
}
function _updateLoginButtonAsync() {
if (!paywallProvider) {
return WinJS.Promise.wrap(null)
}
var loggedIn=paywallProvider.currentLoginStatus.loggedIn;
loginCmd.hidden = loggedIn;
logoutCmd.hidden = !loggedIn;
return WinJS.Promise.wrap(null)
}
;
function _unsubscribeEventListeners() {
paywallProvider.removeEventListener("loginstatuschange", _updateLoginButtonAsync);
WinJS.Navigation.removeEventListener("navigated", _unsubscribeEventListeners)
}
if (paywallProvider) {
paywallProvider.addEventListener("loginstatuschange", _updateLoginButtonAsync);
WinJS.Navigation.addEventListener("navigated", _unsubscribeEventListeners)
}
var separator=new WinJS.UI.AppBarCommand(document.createElement("hr"), {type: "separator"});
var edgy=WinJS.Utilities.query(".newsActionEdgyRight");
if (!edgy || edgy.length === 0) {
edgy = WinJS.Utilities.query(".platformNewsActionEdgyRight")
}
if (edgy && edgy.length > 0) {
edgy = edgy[0]
}
else {
edgy = document.getElementById("bottomEdgy")
}
if (!edgy) {
return
}
edgy.appendChild(separator.element);
separator.element.id = "loginButtonSeparator";
var loginCmd=new WinJS.UI.AppBarCommand(document.createElement("button"), {
label: PlatformJS.Services.resourceLoader.getString("/Platform/Login"), icon: "\uE181", onclick: function onclick(event) {
PlatformJS.deferredTelemetry(function _logUserAction() {
var attributes=DynamicPanoJS.DynamicPano.getPaywallInstrumentationFromPaywallProvider(paywallProvider, instrumentationId);
attributes.partnerCode = instrumentationId;
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.ActionContext.bottomEdgy, "Login Button", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(attributes))
});
CommonJS.dismissAllEdgies();
var online=PlatformJS.Utilities.hasInternetConnection();
if (online) {
var paywallControl=CommonJS.Partners.Auth.PaywallControlFactory.createPaywallControl(paywallProvider, instrumentationId);
paywallControl.loginAsync().then(function _dynamicPano_2727(response) {
if (response.success && refreshPageFunction) {
DynamicPanoJS.forceRefreshPano = true;
refreshPageFunction()
}
return _updateLoginButtonAsync()
}, function paywallError(e){})
}
else {
DynamicPanoJS._showPaywallOfflineUI()
}
}, extraClass: "signInButton", hidden: true
});
loginCmd.element.id = "loginButton";
edgy.appendChild(loginCmd.element);
var logoutCmd=new WinJS.UI.AppBarCommand(document.createElement("button"), {
label: PlatformJS.Services.resourceLoader.getString("/Platform/Logout"), icon: "\uE181", onclick: function onclick(event) {
PlatformJS.deferredTelemetry(function _logUserAction() {
var attributes=DynamicPanoJS.DynamicPano.getPaywallInstrumentationFromPaywallProvider(paywallProvider, instrumentationId);
attributes.partnerCode = instrumentationId;
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.ActionContext.bottomEdgy, "Logout Button", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(attributes))
});
CommonJS.dismissAllEdgies();
var paywallControl=CommonJS.Partners.Auth.PaywallControlFactory.createPaywallControl(paywallProvider);
paywallControl.logoutAsync().then(function _dynamicPano_2768(response) {
if (refreshPageFunction) {
DynamicPanoJS.forceRefreshPano = true;
refreshPageFunction()
}
return _updateLoginButtonAsync()
}, function paywallError(e){})
}, extraClass: "signOutButton", hidden: true
});
logoutCmd.element.id = "logoutButton";
edgy.appendChild(logoutCmd.element);
return _updateLoginButtonAsync()
}, createPaywallProviderPromise: function createPaywallProviderPromise(instrumentationId, authInfo) {
var paywallInfo=new Windows.Foundation.Collections.PropertySet;
for (var name in authInfo) {
if (authInfo.hasOwnProperty(name)) {
paywallInfo.insert(name, authInfo[name])
}
}
var transformUrlConfig=Platform.Configuration.ConfigurationManager.custom.getString("PaywallTransformUrl");
Platform.Paywall.PaywallManager.instance.setConfiguration(transformUrlConfig);
return Platform.Paywall.PaywallManager.instance.createPaywallProviderAsync(instrumentationId, paywallInfo)
}, getPaywallQuotaTimeframeString: function getPaywallQuotaTimeframeString(milliseconds) {
var index=DynamicPanoJS.getPaywallResourceKeyIndex(milliseconds);
return PlatformJS.Services.resourceLoader.getString(DynamicPanoJS._paywallGrowlTimeframeResourceKeys[index])
}, getPaywallQuotaReachedString: function getPaywallQuotaReachedString(milliseconds) {
var index=DynamicPanoJS.getPaywallResourceKeyIndex(milliseconds);
return PlatformJS.Services.resourceLoader.getString(DynamicPanoJS._paywallQuotaReachedResourceKeys[index])
}, getPaywallResourceKeyIndex: function getPaywallResourceKeyIndex(milliseconds) {
var millisecondsPerHour=3600000;
var millisecondsPerDay=millisecondsPerHour * 24;
var millisecondsPerWeek=millisecondsPerDay * 7;
var millisecondsPerMonth=millisecondsPerDay * 31;
if (milliseconds <= millisecondsPerHour) {
return 0
}
else if (milliseconds <= millisecondsPerDay) {
return 1
}
else if (milliseconds <= millisecondsPerWeek) {
return 2
}
else if (milliseconds <= millisecondsPerMonth) {
return 3
}
return 4
}, getGrowlMessage: function getGrowlMessage(asHTML, partnerDisplayName, paywallProviderPromise) {
if (!paywallProviderPromise) {
return WinJS.Promise.wrap(null)
}
var that=this;
return paywallProviderPromise.then(function _dynamicPano_2869(provider) {
if (provider) {
var loginStatus=provider.currentLoginStatus;
if (loginStatus && loginStatus.loggedIn && loginStatus.userType === Platform.Paywall.UserType.subscriber) {
return WinJS.Promise.wrap(null)
}
var usedTokens=provider.currentMeterStatus.used;
var totalTokens=provider.currentMeterStatus.total;
var partnerName=partnerDisplayName ? partnerDisplayName : "";
var growlMessageTimeFrame=DynamicPanoJS.getPaywallQuotaTimeframeString(provider.paywallSettings.meteringtimems);
var growlMessageFormatString=PlatformJS.Services.resourceLoader.getString("/Platform/PaywallCardGrowlMessage");
if (growlMessageFormatString) {
var growlMessage=growlMessageFormatString.format(usedTokens, totalTokens, partnerName, growlMessageTimeFrame);
if (asHTML) {
var parts=growlMessage.split("+");
if (parts.length === 3) {
growlMessage = parts[0] + "<b>" + parts[1] + "</b>" + parts[2]
}
else {
growlMessage = growlMessage.replace(/\+/g, "")
}
}
else {
growlMessage = growlMessage.replace(/\+/g, "")
}
}
return toStaticHTML(growlMessage)
}
return WinJS.Promise.wrap(null)
})
}, forceRefreshPano: false
})
})();
(function _dynamicPano_2912() {
"use strict";
WinJS.Namespace.define("CommonJS.State", {isPreviewModeEnabled: false})
})();
(function _dynamicPano_2922() {
"use strict";
var enableDisableAppBars=function(value) {
var appbarDoms=WinJS.Utilities.query(".win-appbar");
if (!appbarDoms) {
return
}
for (var i=0, iLength=appbarDoms.length; i < iLength; i++) {
var appbarControl=appbarDoms[i] && appbarDoms[i].winControl;
if (appbarControl) {
appbarControl.disabled = !value
}
}
};
WinJS.Namespace.define("DynamicPanoJS", {MessageDialogHelper: WinJS.Class.define(function MessageDialogHelper_constructor(dynamicInfo) {
this._prepareData(dynamicInfo)
}, {
_id: null, _messageData: null, _messagePromise: null, _dialog: null, _messageSettingPrefix: "MessageDialog-", _getDefaultMessageData: function _getDefaultMessageData(id) {
var partnerList=PlatformJS.Services.configuration.getList("PartnerWithDefaultDisclaimer");
if (!partnerList || partnerList.length < 1) {
return null
}
var showDefaultData=false;
for (var i=0, iLength=partnerList.length; i < iLength; i++) {
if (!partnerList[i] || !partnerList[i].value) {
continue
}
if (partnerList[i].value.toLowerCase() === id) {
showDefaultData = true;
break
}
}
if (!showDefaultData) {
return null
}
var resourceLoader=PlatformJS.Services.resourceLoader;
return {
title: resourceLoader.getString(id + "MessageDialogTitle"), message: resourceLoader.getString(id + "MessageDialogMessage"), okButtonLabel: resourceLoader.getString(id + "MessageDialogAcceptLabel"), cancelButtonLabel: resourceLoader.getString(id + "MessageDialogCancelLabel")
}
}, _prepareData: function _prepareData(data) {
if (!data || !data.id) {
return
}
this._id = data.id.toLowerCase();
var messageData=data.messageData;
if (!messageData || !messageData.message) {
messageData = this._getDefaultMessageData(this._id)
}
if (!messageData || !messageData.message || Windows.Storage.ApplicationData.current.localSettings.values[this._messageSettingPrefix + this._id] === true) {
return
}
this._messageData = {
title: messageData.title, message: messageData.message, buttons: [{
label: messageData.okButtonLabel, clickHandler: this._onAcceptMessage.bind(this)
}, {
label: messageData.cancelButtonLabel, clickHandler: this._onCancelMessage.bind(this)
}]
}
}, _onAcceptMessage: function _onAcceptMessage() {
Windows.Storage.ApplicationData.current.localSettings.values[this._messageSettingPrefix + this._id] = true;
this._enableInteractiveComponents()
}, _onCancelMessage: function _onCancelMessage() {
this._enableInteractiveComponents();
if (!PlatformJS.Navigation || PlatformJS.Navigation.canGoBack) {
WinJS.Navigation.back()
}
else {
PlatformJS.Navigation.navigateToChannel("Home")
}
}, _enableInteractiveComponents: function _enableInteractiveComponents() {
enableDisableAppBars(true);
CommonJS.processListener.enableSearchOnType()
}, _disableInteractiveComponents: function _disableInteractiveComponents() {
enableDisableAppBars(false);
CommonJS.processListener.disableSearchOnType()
}, showMessageAsync: function showMessageAsync() {
if (!this._messageData) {
return WinJS.Promise.wrap()
}
if (this._messagePromise) {
this._messagePromise.cancel()
}
if (this._dialog) {
this._dialog.dispose()
}
this._disableInteractiveComponents();
this._dialog = new CommonJS.UI.MessageDialog(this._messageData);
this._messagePromise = this._dialog.showAsync();
return this._messagePromise
}, dispose: function dispose() {
this._enableInteractiveComponents();
if (this._messagePromise) {
this._messagePromise.cancel()
}
if (this._dialog) {
this._dialog.dispose()
}
}
})})
})();
(function _pinning_1() {
"use strict";
function setupPinFeaturedSourceButton(buttonElementId, dynamicInfo, onPinSection) {
if (typeof(buttonElementId) === "undefined") {
return
}
var logo=PlatformJS.Services.appConfig.getDictionary("PinLogo");
if (!(dynamicInfo && (dynamicInfo.clusterID || dynamicInfo.id))) {
return
}
var tileDisplayName=dynamicInfo.clusterToRender ? dynamicInfo.panoTitle + " - " + dynamicInfo.clusterTitle : dynamicInfo.panoTitle;
var tileId=CommonJS.Tile.newsSecondaryTile.makeDynamicPanoTileId(dynamicInfo.clusterToRender ? dynamicInfo.clusterID : dynamicInfo.id);
var tilePinLogos=dynamicInfo.pinLogoUrls;
var liveTileUrls=dynamicInfo.liveTileUrls;
var liveTileRecurrence=dynamicInfo.liveTileRecurrence;
return _setupPinButton(buttonElementId, PlatformJS.Services.resourceLoader.getString("/platform/pinToStart"), PlatformJS.Services.resourceLoader.getString("/platform/unpinFromStart"), PlatformJS.Services.resourceLoader.getString("NowPinningSource"), PlatformJS.Services.resourceLoader.getString("NowUnpinningSource"), "", "", tileId, tileDisplayName, tileDisplayName, "DynamicPano.DynamicCategoryPano", dynamicInfo, null, logo, tilePinLogos, liveTileUrls, liveTileRecurrence, onPinSection)
}
function _setupPinButton(buttonElementId, buttonTextForAddTile, buttonTextForRemoveTile, tileAddSuccessToastMessage, tileRemoveSuccessToastMessage, tileNotAddedToastMessage, tileNotRemovedToastMessage, tileId, tileShortName, tileDisplayName, tileLaunchTargetPage, tileLaunchArgument, existingArticles, tileLogo, tilePinLogos, liveTileUrls, liveTileRecurrence, onPinSection) {
var pinIcon="\uE015";
var unpinIcon="\uE016";
var pinElement=document.getElementById(buttonElementId);
var pinButton=pinElement.winControl;
var tileExceedsMaxMessage=PlatformJS.Services.resourceLoader.getString("PinExceeded");
var config=PlatformJS.Services.appConfig.getDictionary("Pinning");
var maxSecondaryTileCount=100;
var cleanedTileId=CommonJS.Tile.newsSecondaryTile.cleanIdName(tileId);
if (pinButton && pinButton.element) {
pinButton.extraClass = "appexSymbol";
CommonJS.Utilities.Pinning.findSecondaryTilesAsync(cleanedTileId).then(function _pinning_84(setupResult) {
if (setupResult.found) {
pinButton.label = buttonTextForRemoveTile;
pinButton.icon = unpinIcon
}
else {
pinButton.label = buttonTextForAddTile;
pinButton.icon = pinIcon
}
pinButton.tooltip = pinButton.label;
pinButton.onclick = function() {
stickEdgy(true);
var boundingClientRect=pinElement.getBoundingClientRect();
var tile=new CommonJS.Tile.newsSecondaryTile(cleanedTileId, tileShortName, tileDisplayName, tileLaunchTargetPage, tileLaunchArgument, tileLogo);
CommonJS.Utilities.Pinning.findSecondaryTilesAsync(cleanedTileId).then(function _pinning_110(result) {
if (!result.found && result.totalTileCount >= maxSecondaryTileCount) {
if (tileExceedsMaxMessage) {
CommonJS.Utilities.showToast(tileExceedsMaxMessage)
}
stickEdgy(false)
}
else {
if (result.found) {
tile.requestDeleteAsync(boundingClientRect.left, boundingClientRect.top + CommonJS.Utilities.Pinning.yAxisSpacer).then(function _pinning_121(isDeleted) {
if (isDeleted) {
pinButton.label = buttonTextForAddTile;
pinButton.tooltip = pinButton.label;
pinButton.icon = pinIcon;
if (tileRemoveSuccessToastMessage) {
CommonJS.Utilities.showToast(tileRemoveSuccessToastMessage)
}
}
else {
if (tileNotRemovedToastMessage) {
CommonJS.Utilities.showToast(tileNotRemovedToastMessage)
}
}
stickEdgy(false)
}, function _pinning_138(error) {
stickEdgy(false)
})
}
else {
tile.requestCreateAsync(boundingClientRect.left, boundingClientRect.top + CommonJS.Utilities.Pinning.yAxisSpacer, tilePinLogos, liveTileUrls, liveTileRecurrence).then(function _pinning_143(isAdded) {
if (isAdded) {
pinButton.label = buttonTextForRemoveTile;
pinButton.tooltip = pinButton.label;
pinButton.icon = unpinIcon;
if (tileAddSuccessToastMessage) {
CommonJS.Utilities.showToast(tileAddSuccessToastMessage)
}
if (onPinSection) {
onPinSection()
}
}
else {
if (tileNotAddedToastMessage) {
CommonJS.Utilities.showToast(tileNotAddedToastMessage)
}
}
stickEdgy(false)
}, function _pinning_164(error) {
stickEdgy(false)
})
}
}
}, function _pinning_170(error) {
stickEdgy(false)
})
}
}, function _pinning_176(error){})
}
}
function stickEdgy(sticky) {
var actionEdgyCtl=PlatformJS.Utilities.getControl("actionEdgy");
if (actionEdgyCtl) {
actionEdgyCtl.sticky = sticky;
if (!sticky) {
actionEdgyCtl.hide()
}
}
}
function findSecondaryTilesAsync(myTileId) {
return new WinJS.Promise(function _pinning_194(complete, error, progress) {
Windows.UI.StartScreen.SecondaryTile.findAllAsync().then(function _pinning_196(tiles) {
var found=false;
tiles.forEach(function _pinning_199(tile) {
if (myTileId === tile.tileId) {
found = true
}
});
complete({
found: found, totalTileCount: tiles.length
})
}, function _pinning_207(e) {
error(e)
})
})
}
WinJS.Namespace.define("CommonJS.Utilities.Pinning", {
setupPinFeaturedSourceButton: setupPinFeaturedSourceButton, findSecondaryTilesAsync: findSecondaryTilesAsync, yAxisSpacer: -5
})
})();
(function _pinning_221() {
"use strict";
WinJS.Namespace.define("CommonJS.Tile", {newsSecondaryTile: WinJS.Class.define(function _pinning_227(tileId, tileShortName, tileDisplayName, tileLaunchTargetPage, tileLaunchArgument, tileLogo) {
this._tileId = tileId;
this._tileShortName = tileShortName;
this._tileDisplayName = tileDisplayName;
this._tileLaunchTargetPage = tileLaunchTargetPage;
this._tileLaunchArgument = tileLaunchArgument;
this._tileLogo = tileLogo
}, {
requestDeleteAsync: function requestDeleteAsync(xLoc, yLoc) {
var that=this;
return (new Windows.UI.StartScreen.SecondaryTile(that._tileId)).requestDeleteAsync({
x: xLoc, y: yLoc
})
}, requestCreateAsync: function requestCreateAsync(xLoc, yLoc, tilePinLogos, liveTileUrls, liveTileRecurrence) {
var that=this;
var shortName=that._tileShortName;
var displayName=that._tileDisplayName;
var json=JSON.stringify({
target: that._tileLaunchTargetPage, data: that._tileLaunchArgument, context: [{activationContext: "pinnedTile"}]
});
var square150X150Logo=new Windows.Foundation.Uri("ms-appx:///" + that._tileLogo.getString("Square150X150"));
var secondaryTile=new Windows.UI.StartScreen.SecondaryTile(that._tileId, displayName, json, square150X150Logo, Windows.UI.StartScreen.TileSize.square150x150);
secondaryTile.visualElements.square150x150Logo = square150X150Logo;
secondaryTile.visualElements.showNameOnSquare150x150Logo = true;
secondaryTile.visualElements.square30x30Logo = new Windows.Foundation.Uri("ms-appx:///" + that._tileLogo.getString("Square30X30"));
secondaryTile.visualElements.square70x70Logo = new Windows.Foundation.Uri("ms-appx:///" + that._tileLogo.getString("Square70X70"));
return new WinJS.Promise(function _pinning_272(complete) {
secondaryTile.requestCreateAsync({
x: xLoc, y: yLoc
}).then(function _pinning_274(isAdded) {
if (isAdded) {
that._getModifiedName(shortName).then(function _pinning_277(modifiedName) {
that.setTemplates(modifiedName, tilePinLogos, liveTileUrls, liveTileRecurrence)
}, function _pinning_280(error) {
that.setTemplates(shortName, tilePinLogos, liveTileUrls, liveTileRecurrence)
})
}
return complete(isAdded)
})
})
}, setTemplates: function setTemplates(text, tilePinLogos, liveTileUrls, liveTileRecurrence) {
if (!text) {
return
}
var tileUpdater=Windows.UI.Notifications.TileUpdateManager.createTileUpdaterForSecondaryTile(this._tileId);
var squareTile=null,
tilePinLogoDpiSpecific=null,
logoUrl=null,
tileNotification;
tileUpdater.clear();
if (tilePinLogos) {
tilePinLogoDpiSpecific = tilePinLogos[Windows.Graphics.Display.DisplayProperties.resolutionScale]
}
if (tilePinLogoDpiSpecific) {
PlatformJS.Cache.CacheService.getInstance("CustomPanoPinningLogoCache").findEntry(tilePinLogoDpiSpecific, {fileNameOnly: true}).then(function logoCacheFetch_completion(response) {
var isCached;
if (response && !response.isStale() && response.dataValue) {
logoUrl = response.dataValue;
isCached = true
}
else {
logoUrl = tilePinLogoDpiSpecific;
isCached = false
}
if (!isCached && PlatformJS.Utilities.hasInternetConnection()) {
return PlatformJS.Utilities.fetchImage("CustomPanoPinningLogoCache", logoUrl, null)
}
else {
return WinJS.Promise.wrap(null)
}
}).done(function logoFetch_completion(finalResponse){}, function logoFetch_error(err){})
}
if (!liveTileUrls || !liveTileUrls.length) {
if (logoUrl) {
squareTile = PlatformJS.Utilities.getSquarePeekImageAndText04(logoUrl, text)
}
else {
squareTile = this._getTileSquareText04(text)
}
tileNotification = new Windows.UI.Notifications.TileNotification(squareTile);
tileNotification.expirationTime = null;
tileUpdater.update(tileNotification)
}
else {
var pollUrls=[];
for (var i=0; i < liveTileUrls.length; i++) {
try {
var url=new Windows.Foundation.Uri(liveTileUrls[i]);
pollUrls.push(url)
}
catch(e) {}
}
if (pollUrls.length) {
tileUpdater.enableNotificationQueue(true);
if (logoUrl) {
squareTile = PlatformJS.Utilities.getSquareImage(logoUrl);
tileNotification = new Windows.UI.Notifications.TileNotification(squareTile);
tileNotification.expirationTime = null;
tileNotification.tag = 1;
tileUpdater.update(tileNotification);
setTimeout(function startPeriodicUpdate() {
tileUpdater.startPeriodicUpdateBatch(pollUrls, liveTileRecurrence)
}, 15000)
}
else {
tileUpdater.startPeriodicUpdateBatch(pollUrls, liveTileRecurrence)
}
}
}
}, _getTileSquareText04: function _getTileSquareText04(text) {
var squareTileXml=Windows.UI.Notifications.TileUpdateManager.getTemplateContent(Windows.UI.Notifications.TileTemplateType.tileSquare150x150Text04);
var attributes=squareTileXml.getElementsByTagName("text");
if (attributes.length > 0) {
attributes[0].appendChild(squareTileXml.createTextNode(text))
}
return squareTileXml
}, _getModifiedName: function _getModifiedName(defaultName) {
var that=this;
var modifiedName=defaultName;
return new WinJS.Promise(function _pinning_391(complete, error) {
Windows.UI.StartScreen.SecondaryTile.findAllAsync().then(function _pinning_393(tiles) {
tiles.forEach(function _pinning_394(tile) {
if (that._tileId === tile.tileId && tile.shortName) {
modifiedName = tile.shortName
}
});
complete(modifiedName)
}, function _pinning_401(e) {
error(e)
})
})
}
}, {
cleanIdName: function cleanIdName(str) {
var id=str.replace(/[^a-zA-Z0-9._]/g, "");
return id
}, makeDynamicPanoTileId: function makeDynamicPanoTileId(str) {
var cleanedId=CommonJS.Tile.newsSecondaryTile.cleanIdName(str);
return cleanedId.substr(0, 32) + "DynamicPano.DynamicCategoryPano"
}, updateAllSecondaryTiles: function updateAllSecondaryTiles() {
Windows.UI.StartScreen.SecondaryTile.findAllAsync().then(function _pinning_424(tiles) {
if (tiles) {
tiles.forEach(function _pinning_426(tile) {
try {
var args=JSON.parse(tile.arguments);
var newsTile=new CommonJS.Tile.newsSecondaryTile(tile.tileId, tile.shortName, tile.displayName, args.target, args.data, tile.logo.rawUri);
var argsData=args && args.data;
var pinLogoUrls=argsData && argsData.pinLogoUrls;
var liveTileUrls=argsData && argsData.liveTileUrls;
var liveTileRecurrence=argsData && argsData.liveTileRecurrence;
newsTile.setTemplates(tile.displayName, pinLogoUrls, liveTileUrls, liveTileRecurrence)
}
catch(e) {}
})
}
})
}
})})
})()