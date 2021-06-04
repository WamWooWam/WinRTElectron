/*  © Microsoft. All rights reserved. */
WinJS.Namespace.define('CommonJS', {Version: 'latest'});
(function _dynamicArticleReader_1() {
"use strict";
WinJS.Namespace.define("DynamicPanoJS", {DynamicArticleReaderPage: WinJS.Class.derive(CommonJS.ArticleReaderPage, function _dynamicArticleReader_6(state) {
var that=this;
if (state.isPaywallCardEnabled || state.showGrowlTextWithoutPaywallCard) {
state.paywallGrowlMessageFunction = this._getGrowlMessage.bind(this);
this._arrivedFromPano = true
}
state.getPaywallProviderPromise = this._getPaywallProviderPromise.bind(this);
CommonJS.ArticleReaderPage.call(this, state);
if (state.isPaywallCardEnabled) {
var contentHost=document.querySelector(".viewport");
if (contentHost) {
this._orchestrator.paywallCardTemplatePromise = WinJS.UI.Fragments.renderCopy("/common/DynamicPano/html/PaywallCard.html", contentHost);
this._orchestrator.updatePaywallCardFunction = this._tryShowPaywallCard.bind(this)
}
}
if (state.authProvider && state.instrumentationId) {
var partnerId=state.instrumentationId;
this._paywallProviderPromise = DynamicPanoJS.createPaywallProviderPromise(partnerId, state.authProvider.authInfo);
this._paywallProviderPromise.done(function _dynamicArticleReader_35(paywallProvider) {
DynamicPanoJS.setupLoginButton(paywallProvider, that._userSignInStatusChanged.bind(that, paywallProvider), partnerId);
var loginStatus=paywallProvider.currentLoginStatus;
if (loginStatus && loginStatus.loggedIn && loginStatus.userType === Platform.Paywall.UserType.subscriber) {
that._isCurrentUserSubscriber = true
}
})
}
this._nextArticleVisible = function(event) {
var articleId=event.detail.detail;
var articleManager=that._articleManager;
var isAd=articleManager && articleManager.getArticleMetadata(articleId).isAd;
var currentArticleId=articleManager && articleManager.currentArticleId;
that.checkPermissionForArticle(articleId, isAd, currentArticleId)
};
this._articleChanged = function(event) {
var articleManager=that._articleManager;
var isAd=articleManager && articleManager.getCurrentArticleMetadata().isAd;
that.checkPermissionForCurrentArticle(isAd);
if (!state.authProvider && state.isPaywallCardEnabled) {
console.error("Paywall card is enabled for this partner but no auth configuration data was provided.");
that._renderCurrentArticle()
}
else if (state.isPaywallCardEnabled && that._paywallProviderPromise) {
if (that._arrivedFromPano) {
that._markArticleAsAccessed().then(function articleChanged_renderCurrentArticle(isAllowed) {
if (isAllowed) {
that._renderCurrentArticle()
}
else {
that._tryShowPaywallCard()
}
})
}
else {
that._tryShowPaywallCard()
}
}
else if (that._allowMarkAsRead && state.showGrowlTextWithoutPaywallCard && !that._isCurrentUserSubscriber) {
that._markArticleAsAccessed().then(function articleChanged_updateGrowlText(isAllowed) {
if (isAllowed) {
var currentArticlReader=that._orchestrator.getCurrentArticleReader();
if (currentArticlReader) {
currentArticlReader.updateGrowlText()
}
}
})
}
that._arrivedFromPano = false
};
if (this._articleManager.addEventListener) {
this._articleManager.addEventListener("articlechanged", this._articleChanged);
this._articleManager.addEventListener("nextarticlevisible", this._nextArticleVisible)
}
this.market = state.market || CommonJS.Globalization.getMarketStringForEditorial();
this._dynamicPanoCssLink = document.createElement("link");
this._dynamicPanoCssLink.setAttribute("href", "/common/DynamicPano/css/dynamicPano.css");
this._dynamicPanoCssLink.setAttribute("rel", "stylesheet");
var head=document.getElementsByTagName("HEAD")[0].appendChild(this._dynamicPanoCssLink);
this._startingLocationFragment = WinJS.Navigation.history.current.location.fragment
}, {
_configLoadAuthValue: null, _dynamicPanoCssLink: null, _loadAuthProviderAttempted: false, _disposed: false, _paywallProviderPromise: null, _arrivedFromPano: false, _deferredInstrumentationData: null, _authInfoPromise: null, _isCurrentUserSubscriber: null, dispose: function dispose() {
if (this._disposed) {
return
}
this._disposed = true;
if (this._dynamicPanoCssLink && this._dynamicPanoCssLink.parentNode) {
this._dynamicPanoCssLink.parentNode.removeChild(this._dynamicPanoCssLink);
this._dynamicPanoCssLink = null
}
if (this._authInfoPromise) {
this._authInfoPromise.cancel();
this._authInfoPromise = null
}
CommonJS.ArticleReaderPage.prototype.dispose.call(this);
if (this._state) {
this._state.paywallGrowlMessageFunction = null;
if (this._state.getPaywallProviderPromise) {
if (this._state.getPaywallProviderPromise.cancel) {
this._state.getPaywallProviderPromise.cancel()
}
this._state.getPaywallProviderPromise = null
}
}
var subscribeButton=document.querySelector(".paywallSubscribeButton");
if (subscribeButton) {
subscribeButton.onclick = null
}
var loginButton=document.querySelector(".paywallSignInButton");
if (loginButton) {
loginButton.onclick = null
}
var readArticleButton=document.querySelector(".readArticle");
if (readArticleButton) {
readArticleButton.onclick = null
}
}, _setupPaywallProviderPromise: function _setupPaywallProviderPromise() {
if (this._state.authProvider && this._state.instrumentationId) {
var partnerId=this._state.instrumentationId;
var that=this;
this._paywallProviderPromise = DynamicPanoJS.createPaywallProviderPromise(partnerId, this._state.authProvider.authInfo).then(function _dynamicArticleReader_175(provider) {
if (that._state.extraPaywallConfiguration) {
var customStyle=that._state.extraPaywallConfiguration;
provider.paywallSettings.logo = customStyle.LoginPageLogoImage ? customStyle.LoginPageLogoImage : provider.paywallSettings.logo;
provider.paywallSettings.cardBackgroundImage = customStyle.PaywallCardBackgroundImage ? customStyle.PaywallCardBackgroundImage : provider.paywallSettings.backgroundImage;
provider.paywallSettings.cardLogoImage = customStyle.PaywallCardLogoImage ? customStyle.PaywallCardLogoImage : provider.paywallSettings.cardLogoImage
}
return provider
})
}
}, _setupPage: function _setupPage() {
if (!this._paywallProviderPromise) {
this._setupPaywallProviderPromise()
}
if (this._paywallProviderPromise) {
var that=this;
this._paywallProviderPromise.done(function _dynamicArticleReader_198(paywallProvider) {
var instrumentationId=that._state.instrumentationId;
var refresh=function() {
that._sortedDataSource = null
};
DynamicPanoJS.setupLoginButton(paywallProvider, refresh, instrumentationId)
})
}
}, _setupBottomEdgy: function _setupBottomEdgy() {
var that=this;
CommonJS.ArticleReaderPage.prototype._setupBottomEdgy.call(that);
this._setupPage()
}, goBack: function goBack() {
if (WinJS.Navigation.history.current.location.fragment === this._startingLocationFragment) {
if (WinJS.Navigation.canGoBack) {
WinJS.Navigation.back()
}
else {
PlatformJS.Navigation.mainNavigator.resetApp(new Error("DynamicArticleReaderPage cant go back"))
}
}
}, _updateContentforInstrumentation: function _updateContentforInstrumentation(content) {
var updatedContentPromise=CommonJS.ArticleReaderPage.prototype._updateContentforInstrumentation.call(this, content);
if (this._paywallProviderPromise) {
var that=this;
return WinJS.Promise.join([this._paywallProviderPromise, updatedContentPromise]).then(function updatePaywalInstrumentationContent(results) {
var paywallProvider=results[0];
var updatedContent=results[1];
updatedContent.paywallProvider = paywallProvider;
if (paywallProvider && updatedContent && that._state.isPaywallCardEnabled && that._state.authProvider) {
var articleMetadata=that._articleManager.getCurrentArticleMetadata();
var isPaidArticle=!articleMetadata.free;
updatedContent.accessibility = paywallProvider.checkArticleAccessibility(articleMetadata.articleId, isPaidArticle);
if (!that._arrivedFromPano && updatedContent.accessibility === Platform.Paywall.ArticleAccessibility.accessAllowedMeterQuotaAvailable) {
updatedContent.worth = paywallProvider.currentMeterStatus.used < paywallProvider.currentMeterStatus.total ? "free" : "locked";
updatedContent.type = Microsoft.Bing.AppEx.Telemetry.ActionContext.interstitialCard;
updatedContent.isSummary = true
}
}
return updatedContent
})
}
return updatedContentPromise
}, _getArticleViewAttributes: function _getArticleViewAttributes(impression, instrumentationData, content) {
var updateViewAttributesPromise=CommonJS.ArticleReaderPage.prototype._getArticleViewAttributes.call(this, impression, instrumentationData, content),
paywallProvider=content.paywallProvider,
that=this;
updateViewAttributesPromise = updateViewAttributesPromise.then(function dynamicearticlereader_updateviewattributes(viewAttributes) {
if (content.partnerUri) {
viewAttributes.URL = content.partnerUri
}
if (content.slug) {
viewAttributes.headline = content.slug
}
if (content.customId) {
viewAttributes.customId = content.customId
}
if (content.customType) {
viewAttributes.customType = content.customType
}
var sectionName=that._state.sectionName;
if (sectionName) {
viewAttributes["Section Name"] = sectionName
}
return that._getPartnerTelemetryAttributes(viewAttributes)
});
if (instrumentationData.content.type === Microsoft.Bing.AppEx.Telemetry.ActionContext.interstitialCard) {
updateViewAttributesPromise = WinJS.Promise.join([this._getGrowlMessage(false), updateViewAttributesPromise]).then(function dynamicearticlereader_updatemetercount(results) {
var message=results[0];
var resultViewAttributes=results[1];
resultViewAttributes.meterDuration = DynamicPanoJS.getPaywallQuotaReachedString(paywallProvider.paywallSettings.meteringtimems);
resultViewAttributes.meterCount = message;
return resultViewAttributes
})
}
return updateViewAttributesPromise
}, _getTelemetryAttributes: function _getTelemetryAttributes(attributes) {
attributes = attributes || {};
return this._getPartnerTelemetryAttributes(attributes)
}, _getPartnerTelemetryAttributes: function _getPartnerTelemetryAttributes(attributes) {
var partnerInfoAttributePromise=this._state.paywallInstrumentationAttributesPromise || WinJS.Promise.wrap({});
var state=this._state;
return partnerInfoAttributePromise.then(function dynamicArticleReader_getPartnerTelemetryAttributes(paywallAttributes) {
var userType=paywallAttributes.userType || state.userType || "Anonymous",
authToken=paywallAttributes.authToken || state.authToken || "Anonymous";
attributes.userType = userType;
attributes.authToken = authToken;
return attributes
})
}, _recordArticleView: function _recordArticleView(instrumentationData) {
var that=this;
this._deferredInstrumentationData = null;
if (this._orchestrator.isCurrentArticleShowingPaywallCard) {
this._deferredInstrumentationData = instrumentationData;
return WinJS.Promise.wrap(null)
}
else {
var articleManager=this._articleManager,
articleId=articleManager && articleManager.getCurrentClientArticleId(),
authInfoPromise=this._getAuthInfoPromise(articleId);
if (!authInfoPromise) {
return CommonJS.ArticleReaderPage.prototype._recordArticleView.call(this, instrumentationData)
}
else {
return authInfoPromise.then(function _dynamicArticleReader_338(paywallProvider) {
if (!paywallProvider) {
return CommonJS.ArticleReaderPage.prototype._recordArticleView.call(that, instrumentationData)
}
var articleMetadata=that._articleManager.getArticleMetadata(articleId);
var isPaidArticle=!articleMetadata.free;
var isAllowed=paywallProvider.isAccessAllowed(articleMetadata.articleId, isPaidArticle);
if (isAllowed) {
return CommonJS.ArticleReaderPage.prototype._recordArticleView.call(that, instrumentationData)
}
else {
that._deferredInstrumentationData = instrumentationData;
return WinJS.Promise.wrap(null)
}
})
}
}
}, _isAdPage: function _isAdPage(articleData) {
return !!(articleData && articleData.metadata && articleData.metadata.adMetadata)
}, _getPaywallProviderPromise: function _getPaywallProviderPromise() {
return this._paywallProviderPromise
}, _tryShowPaywallCard: function _tryShowPaywallCard(articleId, paywallCard, header) {
var that=this;
var logo=null;
var paywallInfo={};
var usedTokens;
var totalTokens;
paywallInfo.readArticleText = PlatformJS.Services.resourceLoader.getString("/Platform/PaywallCardReadArticle");
paywallInfo.unlimitedAccessText = PlatformJS.Services.resourceLoader.getString("/Platform/PaywallCardUnlimitedAccess");
paywallInfo.subscribeText = PlatformJS.Services.resourceLoader.getString("/Platform/PaywallCardSubscribe");
paywallInfo.signInText = PlatformJS.Services.resourceLoader.getString("/Platform/PaywallCardSignIn");
articleId = (typeof articleId === "undefined") ? that._articleManager.getCurrentClientArticleId() : articleId;
if (this._paywallProviderPromise) {
this._paywallProviderPromise.then(function showPaywallCardWithProvider(provider) {
if (provider) {
if (articleId === null) {
debugger;
return
}
var articleMetadata=that._articleManager.getArticleMetadata(articleId);
var isPaidArticle=!articleMetadata.free;
var accessibility=provider.checkArticleAccessibility(articleMetadata.articleId, isPaidArticle);
if (accessibility === Platform.Paywall.ArticleAccessibility.accessAllowedPreviouslyReadArticle || accessibility === Platform.Paywall.ArticleAccessibility.accessAllowedUserAuthenticated) {
that._renderCurrentArticle();
return
}
paywallCard = paywallCard || that._orchestrator.getArticlePaywallCard(articleId);
if (!paywallCard) {
debugger;
return
}
usedTokens = provider.currentMeterStatus.used;
totalTokens = provider.currentMeterStatus.total;
var quotaReachedTimeFrame=DynamicPanoJS.getPaywallQuotaReachedString(provider.paywallSettings.meteringtimems);
logo = provider.paywallSettings.logo;
if (logo) {
paywallInfo.partnerLogoImage = logo
}
else {
that._hideElement(".partnerLogo", paywallCard)
}
paywallInfo.cardBackgroundImage = provider.paywallSettings.cardBackgroundImage ? "url('" + provider.paywallSettings.cardBackgroundImage + "')" : "none";
paywallInfo.cardLogoImage = provider.paywallSettings.cardLogoImage ? provider.paywallSettings.cardLogoImage : logo;
that._getGrowlMessage(true, header).then(function _dynamicArticleReader_426(message) {
paywallInfo.paywallGrowlMessageHtml = message
});
var subscribeButton=paywallCard.querySelector(".paywallSubscribeButton");
if (subscribeButton && !subscribeButton.onclick) {
subscribeButton.onclick = function paywallSubscribeButtonClicked(e) {
that._logPaywallUserAction(provider, "Subscribe Button");
var paywallControl=CommonJS.Partners.Auth.PaywallControlFactory.createPaywallControl(provider, that._state.instrumentationId);
paywallControl.subscribeAsync().then(function _dynamicArticleReader_439(response) {
if (response.success && provider.isAccessAllowed(articleMetadata.articleId, isPaidArticle)) {
that._renderCurrentArticle();
that._logPaywallUserAction(provider, "Subscribe Button Success")
}
}, function paywallError(e) {
console.log("Paywall subscribe cancelled.");
that._logPaywallUserAction(provider, "Subscribe Button Cancelled")
})
}
}
var loginButton=paywallCard.querySelector(".paywallSignInButton");
if (loginButton && !loginButton.onclick) {
loginButton.onclick = function paywallLoginButtonClicked(e) {
that._logPaywallUserAction(provider, "Login Button");
CommonJS.dismissAllEdgies();
var paywallControl=CommonJS.Partners.Auth.PaywallControlFactory.createPaywallControl(provider, that._state.instrumentationId);
paywallControl.loginAsync().then(function _dynamicArticleReader_461(response) {
if (response.success && provider.isAccessAllowed(articleMetadata.articleId, isPaidArticle)) {
that._renderCurrentArticle();
that._logPaywallUserAction(provider, "Login Button Success")
}
}, function paywallError(e) {
console.log("Paywall login cancelled.");
that._logPaywallUserAction(provider, "Login Button Cancelled")
})
}
}
var tokensLeft=(totalTokens - usedTokens) > 0;
if (tokensLeft) {
var readArticleButton=paywallCard.querySelector(".readArticle");
if (readArticleButton && !readArticleButton.onclick) {
readArticleButton.onclick = function markArticleReadFromPaywallCard(e) {
provider.accessItem(articleMetadata.articleId, isPaidArticle);
that._logPaywallUserAction(provider, "Read Article Button");
that._renderCurrentArticle()
}
}
var titleDiv=paywallCard.querySelector(".paywallCardHeadline");
if (titleDiv && !titleDiv.onclick) {
titleDiv.onclick = function markArticleReadFromPaywallCardTitle(e) {
provider.accessItem(articleMetadata.articleId, isPaidArticle);
that._logPaywallUserAction(provider, "Title Click");
that._renderCurrentArticle()
}
}
header = header || that._articleManager.getHeader(articleId);
if (header) {
paywallInfo.headlineText = header.headline;
var kickerElement=paywallCard.querySelector(".paywallKicker");
if (header.kicker) {
paywallInfo.kickerText = header.kicker;
kickerElement.style.display = "block"
}
else {
kickerElement.style.display = "none"
}
var authorString=PlatformJS.Services.resourceLoader.getString("/Platform/PaywallCardByAuthor");
if (authorString && header.author) {
paywallInfo.authorText = authorString.format(header.author)
}
else {
paywallInfo.authorText = ""
}
paywallInfo.dateText = header.date;
var abstractElement=paywallCard.querySelector(".paywallAbstract");
if (header.abstract) {
abstractElement.innerHTML = toStaticHTML(header.abstract);
abstractElement.style.display = "block"
}
else {
abstractElement.style.display = "none"
}
}
else {
that._articleManager._showError(null, CommonJS.Error.STANDARD_ERROR, null)
}
}
else {
var quotaReachedString=PlatformJS.Services.resourceLoader.getString("/Platform/PaywallCardQuotaReachedMessage");
if (quotaReachedString) {
paywallInfo.headlineText = quotaReachedString.format(totalTokens, quotaReachedTimeFrame)
}
that._hideElement(".readArticle", paywallCard);
that._hideElement(".paywallKicker", paywallCard);
that._hideElement(".paywallAbstract", paywallCard);
that._hideElement(".paywallCardByline", paywallCard)
}
WinJS.Binding.processAll(paywallCard, paywallInfo)
}
})
}
}, _markArticleAsAccessed: function _markArticleAsAccessed() {
if (!this._paywallProviderPromise) {
return WinJS.Promise.wrap(null)
}
var that=this;
return this._paywallProviderPromise.then(function dynamicArticleReader_markArticleAsAccessed(provider) {
var articleManager=that._articleManager;
var articleMetadata=articleManager.getCurrentArticleMetadata();
var isPaidArticle=!articleMetadata.free;
var isAllowed=provider.isAccessAllowed(articleMetadata.articleId, isPaidArticle);
if (isAllowed) {
provider.accessItem(articleMetadata.articleId, isPaidArticle)
}
return WinJS.Promise.wrap(isAllowed)
})
}, _getGrowlMessage: function _getGrowlMessage(asHTML, header) {
if (!this._paywallProviderPromise) {
return WinJS.Promise.wrap(null)
}
header = header || this._articleManager.getHeader();
return DynamicPanoJS.getGrowlMessage(asHTML, header.publisherName, this._paywallProviderPromise)
}, _hideElement: function _hideElement(query, parentNode) {
if (query) {
var element=parentNode.querySelector(query);
if (element) {
element.style.display = 'none'
}
}
}, _userSignInStatusChanged: function _userSignInStatusChanged(provider) {
if (this._isDisposed) {
return
}
var loginStatus=provider.currentLoginStatus;
if (loginStatus && loginStatus.loggedIn && loginStatus.userType === Platform.Paywall.UserType.subscriber) {
this._orchestrator.hidePaywallCard();
this._orchestrator.relayout();
this._isCurrentUserSubscriber = true
}
else {
this._tryShowPaywallCard();
this._orchestrator.relayout();
this._isCurrentUserSubscriber = false
}
}, _renderCurrentArticle: function _renderCurrentArticle() {
if (this._isDisposed) {
return
}
if (this._orchestrator.isCurrentArticleShowingPaywallCard) {
this._orchestrator.hidePaywallCard();
var that=this;
this._orchestrator.relayout().then(function dynamicarticlereader_recorddeferredtelemetry() {
if (that._deferredInstrumentationData) {
that._recordArticleView(that._deferredInstrumentationData).then(function _dynamicArticleReader_619() {
that._deferredInstrumentationData = null
})
}
})
}
}, _logPaywallUserAction: function _logPaywallUserAction(provider, elementName) {
var customAttributes={meterDuration: DynamicPanoJS.getPaywallQuotaTimeframeString(provider.paywallSettings.meteringtimems)};
this._getGrowlMessage(false).then(function _dynamicArticleReader_642(message) {
customAttributes.meterCount = message
});
var actionContext=Microsoft.Bing.AppEx.Telemetry.ActionContext.interstitialCard;
if (provider.currentMeterStatus.used >= provider.currentMeterStatus.total) {
actionContext = Microsoft.Bing.AppEx.Telemetry.ActionContext.upsellCard
}
CommonJS.ArticleReader.ArticleReaderUtils.logUserAction(actionContext, elementName, null, customAttributes)
}, _allowMarkAsRead: false, checkPermissionForCurrentArticle: function checkPermissionForCurrentArticle(isAd) {
var articleManager=this._articleManager;
var currentArticleId=articleManager && articleManager.getCurrentClientArticleId();
this.checkPermissionForArticle(currentArticleId, isAd)
}, checkPermissionForArticle: function checkPermissionForArticle(articleId, isAd) {
var that=this;
if (isAd) {
this._allowMarkAsRead = false;
return
}
var auth=CommonJS.Partners && CommonJS.Partners.Auth;
var promptControl=auth && auth.BaseAuthControl && auth.BaseAuthControl.promptControl;
if (promptControl && promptControl.isShowing) {
return
}
var authInfoPromise=this._authInfoPromise || WinJS.Promise.wrap({});
authInfoPromise = authInfoPromise.then(this._getAuthInfoPromise.bind(this, articleId));
this._authInfoPromise = authInfoPromise.then(function performAuthentication(paywallProvider) {
if (!paywallProvider) {
return
}
if (that._saveButton) {
that._saveButton.disabled = true
}
var articleMetadata=that._articleManager.getArticleMetadata(articleId);
var isPaidArticle=!articleMetadata.free;
var isAllowed=paywallProvider.isAccessAllowed(articleMetadata.articleId, isPaidArticle);
that._allowMarkAsRead = isAllowed;
var accessibility=paywallProvider.checkArticleAccessibility(articleMetadata.articleId, isPaidArticle);
var locked=accessibility !== Platform.Paywall.ArticleAccessibility.accessAllowedFreeArticle;
var articleAttributes={
currentArticleId: articleMetadata.articleId, entitled: isAllowed, partner: that._state.instrumentationId, locked: locked
};
if (!isAllowed) {
if (that._state.isPaywallCardEnabled) {
that._tryShowPaywallCard(articleId)
}
else {
var paywallControl=CommonJS.Partners.Auth.PaywallControlFactory.createPaywallControl(paywallProvider);
return paywallControl.loginAsync().then(function _dynamicArticleReader_717(response) {
isAllowed = response.success && paywallProvider.isAccessAllowed(articleMetadata.articleId, isPaidArticle);
articleAttributes["entitled"] = isAllowed;
CommonJS.Partners.Auth.PaywallControlBase.logPaywallAppAction("appaccesspaywallarticle", articleAttributes);
if (!isAllowed) {
that.goBack()
}
else {
that._allowMarkAsRead = true
}
}, function paywallLoginError(e) {
CommonJS.Partners.Auth.PaywallControlBase.logPaywallAppAction("appaccesspaywallarticle", articleAttributes);
that.goBack()
})
}
}
else {
if (that._saveButton) {
that._saveButton.disabled = false
}
CommonJS.Partners.Auth.PaywallControlBase.logPaywallAppAction("appaccesspaywallarticle", articleAttributes)
}
})
}, _getAuthInfoPromise: function _getAuthInfoPromise(articleId) {
var authInfoPromise=null;
if (this._paywallProviderPromise) {
authInfoPromise = this._paywallProviderPromise
}
else {
var articleMetadata=this._articleManager.getArticleMetadata(articleId);
if (!articleMetadata.free) {
var loadPaywallAuthInfo=this._isloadAuthProviderEnabled();
if (loadPaywallAuthInfo) {
authInfoPromise = this._loadAuthProvider(articleMetadata)
}
}
}
return authInfoPromise
}, onBindingComplete: function onBindingComplete() {
CommonJS.ArticleReaderPage.prototype.onBindingComplete.call(this);
if (this._state.css) {
var mainContent=document.querySelector(".fragment.articleReaderPage");
if (mainContent) {
WinJS.Utilities.addClass(mainContent, "dynamicArticleReader");
var styleElement=document.createElement("style");
if (styleElement) {
styleElement.setAttribute("type", "text/css");
styleElement.setAttribute("id", "partnerStyleAnchor");
styleElement.sheet.cssText = toStaticHTML(this._state.css);
var firstChild=mainContent.firstChild;
if (firstChild) {
mainContent.insertBefore(styleElement, firstChild)
}
else {
mainContent.appendChild(styleElement)
}
}
}
}
}, onNavigateAway: function onNavigateAway() {
CommonJS.ArticleReaderPage.prototype.onNavigateAway.call(this);
if (this._articleManager.removeEventListener) {
this._articleManager.removeEventListener("articlechanged", this._articleChanged);
this._articleManager.removeEventListener("nextarticlevisible", this._nextArticleVisible)
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
}, dismissSignInPrompt: function dismissSignInPrompt() {
var that=this;
if (!that.authProvider) {
return
}
that.authProvider.dismissSignInPrompt()
}, onWindowResize: function onWindowResize(event) {
CommonJS.WindowEventManager.HandleWindowResizeEvent.call(this, event, function HandleWindowResize() {
CommonJS.ArticleReaderPage.prototype.onWindowResize.call(this, event);
if (!this.authProvider) {
return
}
var isAd=false;
if (this._articleManager && this._articleManager._articleDatas && this._articleManager.currentArticleId) {
isAd = this._isAdPage(this._articleManager._articleDatas[this._articleManager.currentArticleId])
}
this.checkPermissionForCurrentArticle(isAd)
})
}, handleShareRequest: function handleShareRequest(request) {
var that=this;
var articleMetadata=this._articleManager.getCurrentArticleMetadata();
var options={
articleMetadata: articleMetadata, preferWebUrl: false
};
if (articleMetadata.free) {
this._handleArticleShareRequest(request, options)
}
else if (this._paywallProviderPromise) {
this._paywallProviderPromise.then(function handleShareRequest_paywallProvider(provider) {
options.preferWebUrl = true;
that._handleArticleShareRequest(request, options)
})
}
else if (articleMetadata.webUrl) {
this._handleArticleShareRequest(request, options)
}
}, _isloadAuthProviderEnabled: function _isloadAuthProviderEnabled() {
if (!this._configLoadAuthValue) {
this._configLoadAuthValue = Platform.Configuration.ConfigurationManager.custom.getBool("EnablePaywallReaderLoadAuth")
}
var enabled=this._configLoadAuthValue;
return enabled && !this._state.disablePaywall
}, _loadAuthProvider: function _loadAuthProvider(articleMetadata) {
var that=this;
var channelManager=PlatformJS.Navigation.mainNavigator.channelManager;
if (!that._loadAuthProviderAttempted) {
if (channelManager && channelManager.featuredChannels && articleMetadata.instrumentationId) {
for (var i=0; i < channelManager.featuredChannels.length; i++) {
var channel=channelManager.featuredChannels[i];
if (channel.state.dynamicInfo && channel.state.dynamicInfo.instrumentationId === articleMetadata.instrumentationId) {
var options={
dataSourceName: channel.state.dynamicInfo.dataSourceName, feedName: channel.state.dynamicInfo.feedName, feedMarket: channel.state.dynamicInfo.feedMarket, dataProviderOptions: channel.state.dynamicInfo.dataProviderOptions, cssFeedUrl: channel.state.dynamicInfo.css, channelId: channel.state.channelId, market: this.market
};
var dataProvider=new DynamicPanoJS.DynamicPanoProvider(options);
return dataProvider.getDynamicPanoFeed(false, options.dataSourceName, options.feedName, options.feedMarket).then(function _dynamicArticleReader_922(cmsData) {
that._loadAuthProviderAttempted = true;
if (cmsData && cmsData.data.authInfo) {
that._paywallProviderPromise = DynamicPanoJS.createPaywallProviderPromise(that._state.instrumentationId, cmsData.data.authInfo);
return that._paywallProviderPromise
}
return WinJS.Promise.wrap(null)
})
}
}
}
}
return WinJS.Promise.wrap(null)
}
})})
})()