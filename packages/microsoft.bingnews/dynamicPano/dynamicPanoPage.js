/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
WinJS.Namespace.define("DynamicPano", {
DynamicPanoPage: WinJS.Class.derive(NewsJS.NewsBasePage, function dynamicPanoPage_ctor(state) {
if (!state && NewsJS.Partners.Config.isPartnerApp) {
state = NewsJS.Partners.WhiteLabelProcessListener.defaultAppState
}
if (state && state.dynamicInfo) {
var defaultProviderIdFromConfig=NewsJS.Utilities.defaultProviderId();
if (!state.dynamicInfo.adUnitId && PlatformJS.Ads) {
var adsConfig=PlatformJS.Ads.getAdsConfig(state.categoryKey, null, defaultProviderIdFromConfig);
if (adsConfig) {
state.dynamicInfo.adUnitId = adsConfig.adUnitId
}
}
else {
state.dynamicInfo.providerId = state.dynamicInfo.providerId || defaultProviderIdFromConfig
}
}
if (state && state.dynamicInfo && state.dynamicInfo.market) {
state.dynamicInfo.market = state.dynamicInfo.market.toLowerCase()
}
state = JSON.parse(JSON.stringify(state));
this._state = state;
NewsJS.NewsBasePage.call(this, state);
this.pano = new DynamicPanoJS.DynamicPano(state);
if (state.canGoBack === false) {
var backButton=document.querySelector(".immersiveBackButton");
if (backButton) {
WinJS.Utilities.addClass(backButton, "hidden")
}
}
if (NewsJS.Partners.Config.isPartnerApp) {
var newsActionEdgyRight=document.querySelector(".newsActionEdgyRight");
if (newsActionEdgyRight) {
var helpButton=document.getElementById("helpButton");
if (helpButton) {
newsActionEdgyRight.removeChild(helpButton)
}
}
}
var edgy=PlatformJS.Utilities.getControl("actionEdgy");
this._onEdgyBeforeShowHandler = this._onEdgyBeforeShow.bind(this);
if (state.dynamicInfo && state.dynamicInfo.id && !state.dynamicInfo.clusterID) {
edgy.addEventListener("beforeshow", this._onEdgyBeforeShowHandler)
}
PlatformJS.platformInitializedPromise.then(function _startLazyLoad() {
var pageToLazyLoad=PlatformJS.Services.appConfig.getString("DynamicPanoPageLazyLoad");
if (pageToLazyLoad) {
WinJS.UI.Fragments.renderCopy(pageToLazyLoad).then(function(){})
}
})
}, {
onNavigateAway: function onNavigateAway(event) {
NewsJS.NewsBasePage.prototype.onNavigateAway.call(this);
NewsJS.Utilities.cancelPromise(this.logoPromises);
this.pano.onNavigateAway()
}, dispose: function dispose() {
var templateHost=document.getElementById('templateHost');
if (templateHost && templateHost.parentElement) {
templateHost.parentElement.removeChild(templateHost)
}
var edgy=PlatformJS.Utilities.getControl("actionEdgy");
if (edgy) {
edgy.removeEventListener("beforeshow", this._onEdgyBeforeShowHandler);
this._onEdgyBeforeShowHandler = null
}
this.pano.dispose();
NewsJS.NewsBasePage.prototype.dispose.call(this)
}, onPreviewToggle: function onPreviewToggle() {
this.pano.onPreviewToggle()
}, onBindingComplete: function onBindingComplete() {
NewsJS.NewsBasePage.prototype.onBindingComplete.call(this);
this.pano.onBindingComplete()
}, onWindowResize: function onWindowResize(event) {
CommonJS.WindowEventManager.HandleWindowResizeEvent.call(this, event, function HandleWindowResize() {
var pano=this.pano;
if (pano && pano.onWindowResize) {
pano.onWindowResize(event)
}
})
}, onHeaderSelection: function onHeaderSelection(clusterHeaderName) {
if (this.numCategoryClusters >= 2 && clusterHeaderName && clusterHeaderName.length > 0) {
var dynamicInfo=JSON.parse(JSON.stringify(this._state.dynamicInfo));
dynamicInfo.clusterID = clusterHeaderName;
dynamicInfo.clusterToRender = clusterHeaderName;
var channelID=PlatformJS.Navigation.mainNavigator.getChannelIDInView();
var channelConfigData=this.getChannelConfigData(channelID);
var channelIdToNavigate=channelConfigData ? channelConfigData.id + "_" + this._cmsData.categories[clusterHeaderName].categoryName : "";
dynamicInfo.clusterTitle = channelConfigData ? this._cmsData.categories[clusterHeaderName].categoryName : PlatformJS.Services.resourceLoader.getString("/partners/Home");
WinJS.Navigation.navigate({
channelId: channelIdToNavigate, fragment: "/dynamicPano/dynamicPano.html", page: "DynamicPano.DynamicPanoPage"
}, {dynamicInfo: dynamicInfo})
}
}, getPageState: function getPageState() {
var panoControl=PlatformJS.Utilities.getControl("news_Panorama");
if (panoControl) {
this._state.panoramaState = panoControl.getPanoramaState()
}
this._state.snappedHeaderColor = this._snappedHeaderColor;
return this._state
}, getPageData: function getPageData() {
var that=this;
return CommonJS.loadModule({fragmentPath: "/html/templates.html"}, {}, document.getElementById('templateHost')).then(function partnerPano_loadTemplateComplete() {
return that.pano.getPageData()
})
}, getPageImpressionContext: function getPageImpressionContext() {
if (this._state.dynamicInfo.isFeaturedSource) {
if (this._state.dynamicInfo.clusterToRender) {
return NewsJS.Telemetry.String.ImpressionContext.subPartnerPano
}
else {
return NewsJS.Telemetry.String.ImpressionContext.partnerPano
}
}
else if (this._state.dynamicInfo.telemetry) {
return this._state.dynamicInfo.telemetry.contextString
}
else {
return NewsJS.Telemetry.String.ImpressionContext.partnerPano
}
}, getPageImpressionPartnerCodeAndAttributes: function getPageImpressionPartnerCodeAndAttributes() {
return this.pano.getPageImpressionPartnerCodeAndAttributes()
}, onVisibilityChange: function onVisibilityChange(event) {
NewsJS.NewsBasePage.prototype.onVisibilityChange.call(this, event);
if (this._state.dynamicInfo.panoClass === "NYT" && document && !document.msHidden) {
PlatformJS.deferredTelemetry(DynamicPano.DynamicPanoPage._recordNytLaunch)
}
}, _onEdgyBeforeShow: function _onEdgyBeforeShow() {
var state=this._state;
var panoClass=state.dynamicInfo.panoClass;
if (panoClass === "NYT" || panoClass === "WSJ") {
return
}
NewsJS.Utilities.setupAddSectionButton(NewsJS.Personalization.Utilities.sectionType.Sources, {
type: "partner", market: state.dynamicInfo.market || CommonJS.Globalization.getMarketStringForEditorial(), appMarket: NewsJS.Globalization.getMarketString(), source: state.dynamicInfo
})
}
}, {_recordNytLaunch: function _recordNytLaunch() {
try {
NYT.UPT.instance.recordLaunch()
}
catch(e) {
console.warn("Error occurred when logging NYT session with UPT.")
}
}}), PartnerDynamicPanoPage: WinJS.Class.derive(NewsJS.NewsBasePage, function partnerDynamicPanoPage_ctor(state){}, {
onNavigateAway: function onNavigateAway() {
NewsJS.NewsBasePage.prototype.onNavigateAway.call(this);
var platformPageElement=document.querySelector(".platformPage");
if (platformPageElement) {
WinJS.Utilities.removeClass(platformPageElement, "platformPage")
}
}, getPageState: function getPageState() {
return this.getPanoramaControl()
}, getPageData: function getPageData() {
var market=Platform.Globalization.Marketization.getCurrentMarket();
var partnerName=DynamicPano.PartnerDynamicPanoPage._getPartnerName();
var channelManager=new PlatformJS.Navigation.ChannelManager;
var navigateToPanoPromise=this._navigateToDynamicPano;
return DynamicPano.PartnerDynamicPanoPage.getPartnersData(market, partnerName, channelManager).then(function navigateToDesiredChannel(partnersData) {
var channel=null;
if (partnersData) {
if (partnersData.dataString) {
channel = DynamicPano.PartnerDynamicPanoPage.parseDesiredChannelFromPartnerData(partnersData.dataString, partnerName, channelManager)
}
else {
channel = partnersData
}
}
DynamicPano.PartnerDynamicPanoPage.populateTopEdgy(channel, partnerName, channelManager, market);
return navigateToPanoPromise(channel, partnerName)
})
}, _navigateToDynamicPano: function _navigateToDynamicPano(channel, partnerName) {
if (channel && channel.pageInfo && channel.state) {
var channelToNavigate=NewsJS.Utilities.clone(channel);
channelToNavigate.state.canGoBack = false;
if (channelToNavigate.state.dynamicInfo) {
channelToNavigate.state.dynamicInfo.clusterID = channelToNavigate.id
}
if (partnerName === "NYT") {
var defaultMarket=PlatformJS.Services.configuration.getString("DefaultMarket", "en-us");
Platform.Globalization.Marketization.setCurrentMarket(defaultMarket);
if (channelToNavigate.state && channelToNavigate.state.dynamicInfo) {
channelToNavigate.state.dynamicInfo.market = defaultMarket
}
}
return WinJS.Navigation.navigate(channelToNavigate.pageInfo, channelToNavigate.state)
}
return WinJS.Promise.wrap({})
}
}, {
populateTopEdgy: function populateTopEdgy(channel, partnerName, channelManager, market) {
if (channel) {
DynamicPano.PartnerDynamicPanoPage.loadPanoData(channel, market, false).then(function processCmsData(data) {
var channelArray=NewsJS.Partners.BaseProcessListener.getChannelArray(partnerName);
var lookupChannelId=channel.id;
channelArray.splice(0, channelArray.length);
for (var i=0; i < data.categoryOrder.length; i++) {
var categoryKey=data.categoryOrder[i];
var category=data.categories[categoryKey];
var newChannel;
if (partnerName === "WSJ") {
newChannel = DynamicPano.PartnerDynamicPanoPage.createWsjChannel(categoryKey, category, partnerName, channel)
}
else if (partnerName === "NYT") {
newChannel = DynamicPano.PartnerDynamicPanoPage.createNytChannel(categoryKey, category, partnerName, channel)
}
else {
newChannel = DynamicPano.PartnerDynamicPanoPage.createChannel(categoryKey, categoryKey, category, category.categoryName, partnerName, channel)
}
if (newChannel) {
channelArray.push(newChannel)
}
}
var extraChannels=NewsJS.Partners.Config.getExtraChannelsFromConfig(lookupChannelId);
if (extraChannels && extraChannels.length) {
for (var i=0; i < extraChannels.length; i++) {
var extraChannel=extraChannels[i];
extraChannel.state = extraChannel.state || {};
extraChannel.state.authInfo = data.authInfo;
var menuIndex=extraChannel.menuIndex;
if (menuIndex !== null && !isNaN(menuIndex) && menuIndex >= 0) {
channelArray.splice(menuIndex, 0, extraChannel)
}
else {
channelArray.push(extraChannel)
}
}
}
})
}
}, loadPanoData: function loadPanoData(channel, market, bypassCache) {
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
}, createChannel: function createChannel(id, categoryKey, category, title, partner, parentChannel) {
var section=NewsJS.Partners.Config.getSectionName(partner, categoryKey);
var clusterDeepLinksConfig=CommonJS.Partners.Config.getConfig(parentChannel.id, "ClusterDeepLinks", null);
var deepLink=clusterDeepLinksConfig && clusterDeepLinksConfig[id];
if (deepLink && deepLink.value) {
deepLink = deepLink.value;
id = parentChannel.id + "_" + title;
return {
id: id, title: title, icon: NewsJS.Partners.Config.getSectionImage(partner, section), subChannels: [], pageInfo: NewsJS.Partners.Config.getDynamicPanoPageInfo(id, true, deepLink), state: null, isDisplayValue: true, isDeepLink: true
}
}
var channel={
icon: NewsJS.Partners.Config.getSectionImage(partner, section), id: id, pageInfo: NewsJS.Partners.Config.getDynamicPanoPageInfo(id, false, deepLink), subChannels: [], title: title, visible: true, isDisplayValue: true, isDeepLink: false
};
channel.state = JSON.parse(JSON.stringify(parentChannel.state));
if (channel.state) {
channel.state.feedIdentifierValue = section;
channel.state.feedType = "section";
channel.state.theme = partner;
if (channel.state.dynamicInfo) {
channel.state.dynamicInfo.clusterID = id;
channel.state.dynamicInfo.clusterToRender = id;
channel.state.dynamicInfo.clusterTitle = title;
channel.state.dynamicInfo.channelID = id;
channel.state.dynamicInfo.id = parentChannel.id
}
}
return channel
}, createNytChannel: function createNytChannel(categoryKey, category, partner, parentChannel) {
var id=categoryKey;
var title=category.categoryName;
var channel=DynamicPano.PartnerDynamicPanoPage.createChannel(id, categoryKey, category, title, partner, parentChannel);
if (channel.id === "NYTPremium_TopNews") {
channel.id = "Home";
channel.state.dynamicInfo.clusterToRender = null
}
if (channel && channel.state) {
channel.state.pinLogoUrls = {
"100": "/images/NYT_pin.scale-100.png", "140": "/images/NYT_pin.scale-140.png", "180": "/images/NYT_pin.scale-180.png"
}
}
channel.visible = category.entities && category.entities.length > 0;
return channel
}, createWsjChannel: function createWsjChannel(categoryKey, category, partner, parentChannel) {
if (categoryKey === "WallStreetJournal_WhatsNews") {
return null
}
var section=NewsJS.Partners.Config.getSectionName(partner, categoryKey);
var id=categoryKey;
var title=PlatformJS.Services.resourceLoader.getString("/wsj/" + WSJJS.ArticleManager.getSectionTitle(section));
if (categoryKey === "WallStreetJournal_Front") {
var parentClone=NewsJS.Utilities.clone(parentChannel);
parentClone.icon = NewsJS.Partners.Config.getSectionImage(partner, section);
parentClone.title = title;
parentClone.images = null;
parentClone.id = "Home";
return parentClone
}
var channel=DynamicPano.PartnerDynamicPanoPage.createChannel(id, categoryKey, category, title, partner, parentChannel);
if (channel && channel.state) {
channel.state.pinLogoUrls = {
"100": "/images/wsj_pin.scale-100.png", "140": "/images/wsj_pin.scale-140.png", "180": "/images/wsj_pin.scale-180.png"
};
channel.state.dynamicInfo.pinLogoUrls = {
"100": "/images/wsj_pin.scale-100.png", "140": "/images/wsj_pin.scale-140.png", "180": "/images/wsj_pin.scale-180.png"
}
}
channel.visible = category.entities && category.entities.length > 0;
return channel
}, getPartnersData: function getPartnersData(market, partnerName, channelManager) {
if (!market || !partnerName) {
return WinJS.Promise.wrap(null)
}
var standardChannels=channelManager.standardChannels;
for (var i=0; i < standardChannels.length; i++) {
var channel=standardChannels[i];
if (channel && channel.id && channel.id.toUpperCase().indexOf(partnerName) > -1) {
return WinJS.Promise.wrap(channel)
}
}
var infoQueryService=new PlatformJS.DataService.QueryService("PartnersDataSource");
var infoParams=PlatformJS.Collections.createStringDictionary();
infoParams.insert("market", market.toLowerCase());
if (PlatformJS.isDebug && NewsJS && NewsJS.StateHandler && NewsJS.StateHandler.instance && NewsJS.StateHandler.instance.isPreviewModeEnabled) {
infoParams["previewparams"] = "/" + PlatformJS.Services.appConfig.getString("CMSPreviewParam")
}
else {
infoParams["previewparams"] = ""
}
var options=new Platform.DataServices.QueryServiceOptions;
options.bypassCache = false;
return infoQueryService.downloadDataAsync(infoParams, null, null, options)
}, parseDesiredChannelFromPartnerData: function parseDesiredChannelFromPartnerData(responseData, partnerName, channelManager) {
if (!partnerName || !responseData) {
debugger
}
var desiredChannel=null;
var response=JSON.parse(responseData);
if (response.navbaritems) {
for (var i=0; i < response.navbaritems.length; i++) {
var channelInfo=channelManager.parseChannel(response.navbaritems[i], response.sources);
if (channelInfo && channelInfo.id && channelInfo.id.toUpperCase().indexOf(partnerName) > -1) {
desiredChannel = channelInfo;
break
}
}
}
if (desiredChannel) {
channelManager.standardChannels.push(desiredChannel)
}
return desiredChannel
}, _getPartnerName: function _getPartnerName() {
return PlatformJS.Services.appConfig.getString("AppConfig").toUpperCase()
}, _wrapFetchedData: function _wrapFetchedData(fetched) {
return WinJS.Promise.wrap(fetched && fetched.cmsData ? fetched.cmsData : null)
}
})
})
})()