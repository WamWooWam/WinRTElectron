/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
WinJS.Namespace.define("WeatherAppJS.PageLoadTypes", {
loadPageByDefault: "Default", loadPageByRefresh: "AutoRefresh", loadPageBySettingsChange: "SettingsChange", loadPageByInternetChange: "NetworkChangeCallback"
});
WinJS.Namespace.define("WeatherAppJS", {Networking: new(WinJS.Class.mix(function(){}, {
internetAvailable: null, networkChangeCallback: null, init: function init() {
var that=this;
PlatformJS.platformInitializedPromise.then(function() {
that.internetAvailable = Platform.Networking.NetworkManager.instance.isNetworkAvailable;
WeatherAppJS.SettingsManager.readPDPDataAsync().then(function() {
WeatherAppJS.SettingsManager.IsPDPRead = true
}, function() {
WeatherAppJS.SettingsManager.IsPDPRead = true
});
Platform.Networking.NetworkManager.addEventListener("networkstatuschanged", WeatherAppJS.Networking.onNetworkStatusChange)
})
}, onNetworkStatusChange: function onNetworkStatusChange(event) {
var currentStatus=Platform.Networking.NetworkManager.instance.isNetworkAvailable;
var weatherAppNetworking=WeatherAppJS.Networking;
if (weatherAppNetworking.internetAvailable === true) {
if (currentStatus === false) {
weatherAppNetworking.internetAvailable = currentStatus;
weatherAppNetworking.dispatchEvent("networkoffline", true)
}
}
else {
if (currentStatus === true) {
weatherAppNetworking.internetAvailable = currentStatus;
if (weatherAppNetworking.networkChangeCallback) {
try {
weatherAppNetworking.networkChangeCallback()
}
catch(err) {}
}
weatherAppNetworking.dispatchEvent("networkonline", true)
}
}
}, updateNetworkStatus: function updateNetworkStatus() {
this.internetAvailable = Platform.Networking.NetworkManager.instance.isNetworkAvailable
}
}, WinJS.Utilities.eventMixin, WinJS.Utilities.createEventProperties('networkonline', 'networkoffline')))});
WeatherAppJS.Networking.init();
WinJS.Namespace.define("WeatherAppJS.Error", {
showMessageBar: function showMessageBar(message, isAutoHide) {
var messageBar=new CommonJS.MessageBar(message, {
level: CommonJS.MessageBarLevelWarning, autoHide: isAutoHide
});
var bLabel=PlatformJS.Services.resourceLoader.getString("CloseButtonLabel");
messageBar.addButton(bLabel, function() {
messageBar.hide()
});
messageBar.show();
if (message === PlatformJS.Services.resourceLoader.getString("MaxFavoritesLimitReached") || message === PlatformJS.Services.resourceLoader.getString("SetDefaultMaxLimitReached")) {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logAppAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, WeatherAppJS.Instrumentation.PageContext.MessageBar, "Max Favorites Limit Reached Message", "appShow", 0)
}
}, showMessageBarWithButton: function showMessageBarWithButton(message, isAutoHide, buttonLabel, buttonClickHandler) {
var messageBar=new CommonJS.MessageBar(message, {
level: CommonJS.MessageBarLevelWarning, autoHide: isAutoHide
});
var bLabel=PlatformJS.Services.resourceLoader.getString("CloseButtonLabel");
messageBar.addButton(buttonLabel, buttonClickHandler);
messageBar.addButton(bLabel, function() {
messageBar.hide()
});
messageBar.show()
}, isMarketBlockedError: function isMarketBlockedError(e) {
return (e && e.message && e.message === "104" && e.number && e.number === -2146233088)
}, createErrorModule: function createErrorModule(retryCallback, width, height, domElementToRender) {
var that=this;
var data;
var retryFunction=WinJS.Utilities.markSupportedForProcessing(retryCallback);
if (!PlatformJS.Utilities.hasInternetConnection()) {
data = CommonJS.Error.getErrorModuleItem(retryFunction, width, height, "/platform/offline_noContent", "platformOfflineErrorModule")
}
else {
data = CommonJS.Error.getErrorModuleItem(retryFunction, width, height)
}
var moduleInfo=data.moduleInfo;
var errorElt=document.createElement("div");
errorElt.className = "platformHide";
errorElt.style.width = moduleInfo.width;
errorElt.style.height = moduleInfo.height;
if (domElementToRender) {
domElementToRender.innerHTML = "";
domElementToRender.appendChild(errorElt)
}
CommonJS.loadModule(moduleInfo, data, errorElt);
return errorElt
}, createProgressModule: function createProgressModule(width, height, domElementToRender) {
var data=CommonJS.Error.getProgressModuleItem(width, height);
var moduleInfo=data.moduleInfo;
var progressElt=document.createElement("div");
WinJS.Utilities.addClass(progressElt, "platformHide");
WinJS.Utilities.addClass(progressElt, "weatherProgressModule");
progressElt.style.width = moduleInfo.width;
progressElt.style.height = moduleInfo.height;
if (domElementToRender) {
domElementToRender.appendChild(progressElt)
}
CommonJS.loadModule(moduleInfo, data, progressElt);
return progressElt
}
});
WinJS.Namespace.define("WeatherAppJS.Utilities.Templates", {
getCurrentConditionsTemplate: function getCurrentConditionsTemplate(item) {
var that=WeatherAppJS.Utilities.Templates;
var ui=WeatherAppJS.Utilities.UI;
var viewManagement=Windows.UI.ViewManagement;
var winjsAddClass=WinJS.Utilities.addClass;
var resourceLoader=PlatformJS.Services.resourceLoader;
var appConfig=PlatformJS.Services.appConfig;
var tempFormat=WeatherAppJS.WarmBoot.Cache.getString("TemperatureFormat");
var ccCluster=document.createElement("div");
winjsAddClass(ccCluster, "win-interactive currentConditionsModule");
var currentConditionsData=item.data.loc.getCurrentConditions();
var singleProviderOnly=WeatherAppJS.WarmBoot.Cache.getBool("SingleProviderOnly");
var ccProviderOverride=WeatherAppJS.WarmBoot.Cache.getString("CCProviderOverride");
var showDailyConditionsProvider=WeatherAppJS.WarmBoot.Cache.getBool("ShowDailyForecastAttribution");
if (!item.data.loc) {
return null
}
var locationID=item.data.loc.id;
var showLimitedExperience=ui.showLimitedExperience(locationID);
if (showLimitedExperience) {
winjsAddClass(ccCluster, "showLimitedExperience");
var showLimitedExperienceOverride=WeatherAppJS.WarmBoot.Cache.isFeatureEnabled("showLimitedExperienceOverride");
if (showLimitedExperienceOverride) {
winjsAddClass(ccCluster, "showLimitedExperienceOverride")
}
var showLimitedExperiencePrecipOverride=WeatherAppJS.WarmBoot.Cache.isFeatureEnabled("showLimitedExperiencePrecipOverride");
if (showLimitedExperiencePrecipOverride) {
winjsAddClass(ccCluster, "showLimitedExperiencePrecipOverride")
}
}
currentConditionsData.showMoreDailyConditionsDataText = resourceLoader.getString('moreDailyConditionsDataText');
currentConditionsData.showLessDailyConditionsDataText = resourceLoader.getString('lessDailyConditionsDataText');
var isSkiPano=false;
isSkiPano = WeatherAppJS.GeocodeCache.getLocation(locationID).isSkiLocation;
var useTianQi=WeatherAppJS.WarmBoot.Cache.isFeatureEnabled("UseTianQi");
msWriteProfilerMark("WeatherApp:HomePageLoad:CCTemplateLoad:s");
var ccHTML=that._createCCModuleHTMLForHero(currentConditionsData, isSkiPano, showLimitedExperience, useTianQi);
msWriteProfilerMark("WeatherApp:HomePageLoad:CCTemplateLoad:e");
var ccTemplate=document.createElement('div');
WinJS.Utilities.setInnerHTML(ccTemplate, toStaticHTML(ccHTML));
var snowConditionsProviderLink=ccTemplate.querySelector('.snowConditionsProviderLink');
if (snowConditionsProviderLink && currentConditionsData.heroData.snowProviderDataClick) {
snowConditionsProviderLink.addEventListener('click', currentConditionsData.heroData.snowProviderDataClick)
}
var pCCSlider=ccTemplate.querySelector('.pCCSlider');
if (pCCSlider) {
pCCSlider.addEventListener('click', WeatherAppJS.Utilities.UI.AnimatePortraitCurrentConditionsSlide)
}
var providerSlider=ccTemplate.querySelector('.providerSlider');
if (providerSlider) {
providerSlider.addEventListener('click', WeatherAppJS.Utilities.UI.AnimateCurrentConditionsSlide)
}
var alertIndicator=ccTemplate.querySelector('.alertIndicator');
alertIndicator.setAttribute('data-win-bind', 'style.display: displayAlert; className: displayAlertBgClass; onclick: handleAlertsClick; onkeyup: handleKeyboardInvocation');
var alertInfo=alertIndicator.querySelector('.alertInfo');
alertInfo.setAttribute('data-win-bind', 'innerHTML: alertText');
WinJS.Binding.processAll(alertIndicator, currentConditionsData);
var toolTipIndicator=ccTemplate.querySelector('.bTemp');
toolTipIndicator.setAttribute('data-win-control', 'WinJS.UI.Tooltip');
toolTipIndicator.setAttribute('data-win-bind', 'winControl.innerHTML: toolTipText');
WinJS.UI.processAll(toolTipIndicator);
WinJS.Binding.processAll(toolTipIndicator, currentConditionsData);
var alertNode=ccTemplate.querySelector(".infoWrapper div");
if (alertNode) {
alertNode.setAttribute("aria-labelledby", alertNode.querySelector(".alertInfo")["id"])
}
var ariaText=resourceLoader.getString("currentConditionsAriaText").format(currentConditionsData.tempCC + " °", currentConditionsData.caption, currentConditionsData.feelslikeTemp, currentConditionsData.provider);
if (!useTianQi) {
var ccElemCont=ccTemplate.querySelector(".bTemp");
winjsAddClass(ccElemCont, "bigTempContainer");
ccElemCont.addEventListener("click", WeatherAppJS.Utilities.UI.ChangeDisplayUnitonClick);
ccElemCont.onkeyup = function(event) {
WeatherAppJS.Utilities.UI.ChangeDisplayUnitonClick(event)
};
var unitAriaText=(currentConditionsData.tempunit === "F") ? resourceLoader.getString("AriaTextF") : resourceLoader.getString("AriaTextC");
unitAriaText = unitAriaText + ". ";
var toolTipAriaText=(currentConditionsData.tempunit === "F") ? resourceLoader.getString("ToolTipTextC") : resourceLoader.getString("ToolTipTextF");
ariaText = resourceLoader.getString("currentConditionsAriaText").format(currentConditionsData.tempCC + " °" + unitAriaText + toolTipAriaText, currentConditionsData.caption, currentConditionsData.feelslikeTemp, currentConditionsData.provider)
}
var ccElem=ccTemplate.querySelector(".bTemp");
ccElem.setAttribute("aria-label", ariaText);
var isMinimized=WeatherAppJS.SettingsManager.isCCMinimized();
if (!isMinimized) {
ccElem.setAttribute("aria-describedby", "ccExpanded")
}
var dailyData=ccTemplate.querySelector('.dailyModule');
var otherProviderDailyDataTemplates=ccTemplate.querySelectorAll('.dailyModuleSmall');
var mainProviderName=ccTemplate.querySelector('.ccProvider');
var otherProviderNames=ccTemplate.querySelectorAll('.dailyModuleOtherProviderName');
var otherProviderDailyData1=otherProviderDailyDataTemplates[0];
var otherProviderDailyData2=otherProviderDailyDataTemplates[1];
var otherProviderName1=otherProviderNames[0];
var otherProviderName2=otherProviderNames[1];
var forecastsWrapper=ccTemplate.querySelectorAll('.forecastsWrapper');
var precipitationWrapper=ccTemplate.querySelector('.precipitationWrapper');
var mainProviderForecastWrapper=forecastsWrapper[0];
var otherProviderForecastWrapper1=forecastsWrapper[1];
var otherProviderForecastWrapper2=forecastsWrapper[2];
var pDailyConditionsWrapper=ccTemplate.querySelector('.portraitDailyConditionsWrapper');
var pPrimaryProvider=pDailyConditionsWrapper.querySelector('.primaryProvider');
var pOtherProvider1=pDailyConditionsWrapper.querySelector('.secondaryProvider1');
var pOtherProvider2=pDailyConditionsWrapper.querySelector('.secondaryProvider2');
var pPrimaryProviderName=pDailyConditionsWrapper.querySelector('.primaryProviderName');
var pOtherProviderName1=pDailyConditionsWrapper.querySelector('.secondaryProviderName1');
var pOtherProviderName2=pDailyConditionsWrapper.querySelector('.secondaryProviderName2');
var animationContainer=pDailyConditionsWrapper.querySelector('.animationContainer');
if (animationContainer && (isMinimized || isSkiPano || showLimitedExperience)) {
animationContainer.style.width = ui.minimizedAnimationContainerWidth
}
var otherProvidersWrapper=ccTemplate.querySelector('.otherProvidersWrapper');
var otherProvider1=otherProvidersWrapper.querySelector('.primaryProvider');
var otherProvider2=otherProvidersWrapper.querySelector('.secondaryProvider1');
var OTSAttribution=ccTemplate.querySelector('#autoID_SnowProvider');
if (isSkiPano) {
var setImgAttributionClick=function(button) {
if (button) {
button.addEventListener('click', function(event) {
var attributionFlyout=document.querySelector('.platformAttributionFlyout');
if (attributionFlyout) {
attributionFlyout.setAttribute('aria-label', attributionFlyout.textContent)
}
})
}
};
setImgAttributionClick(document.querySelector('.platformInfoButtonOff'));
var ccWrapper=ccTemplate.querySelector('.ccWrapper');
if (ccWrapper) {
var skiAttributionButton=document.createElement("div");
skiAttributionButton.className = "platformHeroImageAttribution alignPlatformHeroAttribution";
var skiAttrLabel=WeatherAppJS.Utilities.Common.getSkiAttributionData(currentConditionsData);
var skiAttribution=new CommonJS.ImageAttribution(skiAttributionButton, {flyout: {
label: skiAttrLabel, placement: "top", alignment: (window.getComputedStyle(document.body).direction === "rtl") ? "left" : "right"
}});
setImgAttributionClick(skiAttributionButton.querySelector('.platformInfoButtonOff'));
ccWrapper.appendChild(skiAttributionButton)
}
}
var getProviderUrlHtml=function(provName, provUrl) {
if (provName === "Weather Service Ltd") {
provName = resourceLoader.getString("JWSAttributionValue");
winjsAddClass(pPrimaryProviderName, "primaryProviderNameJPmkt")
}
else if (provName !== "WDT") {
try {
provName = resourceLoader.getString(provName)
}
catch(e) {
provName = " "
}
}
if (provName === "weather.com") {
provName = WeatherAppJS.Utilities.Common.getWeatherDotComBaseUrl()
}
else if (provName === "WDT") {
provUrl = resourceLoader.getString("imap weatherUrl")
}
var displayProvUrl='';
if (provUrl) {
displayProvUrl = '<a class="dailyConditionsProviderLink" href="' + provUrl + '" tabIndex="0" >' + provName + '</a>'
}
else {
displayProvUrl = provName
}
return displayProvUrl
};
var dailyConditions=item.data.loc.getDailyConditions();
var dailyConditionsLength=Object.keys(dailyConditions).length;
var primaryDisplayProviderUrl="";
var providerName="",
providerUrl="";
if (ccProviderOverride && showLimitedExperience && !PlatformJS.mainProcessManager.retailModeEnabled && !(WeatherAppJS.Networking.internetAvailable === false && WeatherAppJS.SettingsManager.isFRE())) {
providerName = ccProviderOverride;
providerUrl = resourceLoader.getString(ccProviderOverride + "Url")
}
else if (dailyConditionsLength > 0) {
providerName = dailyConditions[0].provider;
providerUrl = dailyConditions[0].url
}
primaryDisplayProviderUrl = getProviderUrlHtml(providerName, providerUrl);
mainProviderName.innerHTML = primaryDisplayProviderUrl;
pPrimaryProviderName.innerHTML = primaryDisplayProviderUrl;
WeatherAppJS.Utilities.UI.setProviderDisplayFlag(mainProviderName, pPrimaryProviderName);
var counter=0;
var isWeatherDotCom=false;
var weatherDotComPosition=0;
var weatherDotComUrl='';
var overlayContainer=ccTemplate.querySelector(".overlayContainer");
ui._totalDailyForecasts = item.data.loc.maxDailyForecastDays;
var forecastSlider=ccTemplate.querySelector('.forecastSlider');
forecastSlider.addEventListener('click', (function(locName) {
return function() {
WeatherAppJS.Utilities.UI.AnimateForecastSlide(locName)
}
}(item.data.loc.id)), false);
mainProviderName.addEventListener('click', (function() {
WeatherAppJS.Utilities.Instrumentation.onClickAttribution(mainProviderName.textContent, WeatherAppJS.Instrumentation.PageContext.DailyForecast)
}));
otherProvider1.addEventListener('click', (function() {
WeatherAppJS.Utilities.Instrumentation.onClickAttribution(otherProvider1.textContent, WeatherAppJS.Instrumentation.PageContext.DailyForecast)
}));
otherProvider2.addEventListener('click', (function() {
WeatherAppJS.Utilities.Instrumentation.onClickAttribution(otherProvider2.textContent, WeatherAppJS.Instrumentation.PageContext.DailyForecast)
}));
pPrimaryProviderName.addEventListener('click', (function() {
WeatherAppJS.Utilities.Instrumentation.onClickAttribution(pPrimaryProviderName.textContent, WeatherAppJS.Instrumentation.PageContext.DailyForecast)
}));
pOtherProviderName1.addEventListener('click', (function() {
WeatherAppJS.Utilities.Instrumentation.onClickAttribution(pOtherProviderName1.textContent, WeatherAppJS.Instrumentation.PageContext.DailyForecast)
}));
pOtherProviderName2.addEventListener('click', (function() {
WeatherAppJS.Utilities.Instrumentation.onClickAttribution(pOtherProviderName2.textContent, WeatherAppJS.Instrumentation.PageContext.DailyForecast)
}));
OTSAttribution.addEventListener('click', (function() {
WeatherAppJS.Utilities.Instrumentation.onClickAttribution(OTSAttribution.textContent, WeatherAppJS.Instrumentation.PageContext.DailyForecast)
}));
var skiForecastMaxCount=0;
var skiForeCastData=null;
if (isSkiPano) {
skiForeCastData = currentConditionsData.heroData.dailyForeCast;
if (skiForeCastData) {
skiForecastMaxCount = Object.keys(skiForeCastData).length
}
ariaText = resourceLoader.getString("currentConditionsAriaText").format(currentConditionsData.tempCC + " °" + unitAriaText + toolTipAriaText, currentConditionsData.caption, '', currentConditionsData.AttrProvider);
ccElem.setAttribute("aria-label", ariaText);
showLimitedExperience = true
}
for (var index=0; index < dailyConditionsLength; index++) {
if (counter > 0 && showLimitedExperience) {
break
}
var displayProviderUrl=getProviderUrlHtml(dailyConditions[index].provider, dailyConditions[index].url);
var showLimitedExperienceOverrideFlag=WeatherAppJS.WarmBoot.Cache.isFeatureEnabled("showLimitedExperienceOverride");
if (showLimitedExperienceOverrideFlag && showLimitedExperience) {
pPrimaryProviderName.innerHTML = displayProviderUrl
}
if (dailyConditions[index].provider === "weather.com") {
isWeatherDotCom = true;
weatherDotComPosition = counter;
weatherDotComUrl = WeatherAppJS.Utilities.Common.getWeatherDotComUrl(dailyConditions[index].baseurl, "WeatherDotComTenDayUrl")
}
var totalConditions=0;
if (dailyConditions[index].forecasts) {
totalConditions = dailyConditions[index].forecasts.length
}
var eachDailyModuleTemplate=null;
var pEachDailyModuleTemplate=null;
var otherProviderDailyModuleTemplate=null;
var dailyModuleHtmlString='';
var portraitDailyModuleHtmlString='';
var eachDailyModuleSmallHtmlString='';
var eachDailyModuleSmallHtmlString2='';
var isDailyDrilldownEnabled=WeatherAppJS.Utilities.UI.isDailyDrilldownEnabled(item.data.loc.id);
var skiForecastDataMap={};
for (var eachSkiData in skiForeCastData) {
skiForecastDataMap[skiForeCastData[eachSkiData].date] = skiForeCastData[eachSkiData].freshSnow
}
for (var i=0; i < totalConditions; i++) {
var forecastData=dailyConditions[index].forecasts[i];
if (counter === 0) {
var ariaTextValues=that._getAriaTextForDailyConditions(dailyConditions, i);
if (skiForeCastData && currentConditionsData.heroData.snowData[forecastData.date]) {
ariaTextValues.ariaText += ", " + resourceLoader.getString("FreshSnow") + ", " + currentConditionsData.heroData.snowData[forecastData.date];
ariaTextValues.ariaTextExpanded += ", " + resourceLoader.getString("FreshSnow") + ", " + currentConditionsData.heroData.snowData[forecastData.date]
}
if (isDailyDrilldownEnabled) {
var overlay=document.createElement("div");
WinJS.Utilities.addClass(overlay, "overlay");
overlay.onmspointerover = function() {
ui.hideAllForecastOverlays()
};
overlayContainer.appendChild(overlay)
}
if (i === 0) {
msWriteProfilerMark("WeatherApp:HomePageLoad:eachDailyModule:s")
}
dailyModuleHtmlString = dailyModuleHtmlString + that._createPrimaryDailyForecastHTML(forecastData, currentConditionsData.symbolPosition, showDailyConditionsProvider, showLimitedExperience, displayProviderUrl, i, isSkiPano, isMinimized, ariaTextValues, freshSnowText, isDailyDrilldownEnabled, totalConditions, tempFormat);
if (i === totalConditions - 1) {
WinJS.Utilities.setInnerHTML(mainProviderForecastWrapper, toStaticHTML(dailyModuleHtmlString));
var templates=mainProviderForecastWrapper.querySelectorAll('.dailyModuleFirstProvider');
for (var elem in templates) {
if (elem !== 'length' && elem !== "item") {
var currentTemplate=templates[elem];
if (isDailyDrilldownEnabled) {
ui.attachFocusHandlerForDailyForecast(currentTemplate, elem, locationID)
}
}
}
if (ui._totalDailyForecasts <= ui._totalDailyForecastsShown) {
forecastSlider.style.display = "none"
}
else {
forecastSlider.style.display = "block"
}
msWriteProfilerMark("WeatherApp:HomePageLoad:eachDailyModule:e")
}
if (i === 0) {
msWriteProfilerMark("WeatherApp:HomePageLoad:pEachDailyModule:s")
}
var freshSnowText='';
if (skiForecastDataMap[forecastData.date]) {
freshSnowText = skiForecastDataMap[forecastData.date]
}
portraitDailyModuleHtmlString = portraitDailyModuleHtmlString + that._createPrimaryDailyForecastPortraitHTML(forecastData, currentConditionsData.symbolPosition, showDailyConditionsProvider, showLimitedExperience, displayProviderUrl, i, isSkiPano, isMinimized, ariaTextValues, freshSnowText, isDailyDrilldownEnabled, totalConditions, tempFormat);
if (i === totalConditions - 1) {
WinJS.Utilities.setInnerHTML(pPrimaryProvider, toStaticHTML(portraitDailyModuleHtmlString));
var pTemplates=pPrimaryProvider.querySelectorAll('.pDailyModuleFirstProvider');
for (var elem in pTemplates) {
var currentPTemplate=pTemplates[elem];
currentPTemplate.onmspointerover = function() {
ui.hideAllForecastOverlays()
};
if (isDailyDrilldownEnabled) {
ui.attachFocusHandlerForDailyForecast(currentPTemplate, elem, locationID);
ui.attachClickHandlerForForecast(currentPTemplate, locationID, elem)
}
}
msWriteProfilerMark("WeatherApp:HomePageLoad:pEachDailyModule:e")
}
}
else if (counter === 1) {
var displayProviderUrl1=displayProviderUrl;
if (i === 0) {
msWriteProfilerMark("WeatherApp:HomePageLoad:eachDailyModuleSmall:s")
}
eachDailyModuleSmallHtmlString += that._createSmallDailyModuleHTMLForHero(forecastData, tempFormat);
if (i === totalConditions - 1) {
eachDailyModuleSmallHtmlString += '<div class="clearFloats"></div>';
var staticTmpHtml=toStaticHTML(eachDailyModuleSmallHtmlString);
WinJS.Utilities.setInnerHTML(otherProviderForecastWrapper1, staticTmpHtml);
WinJS.Utilities.setInnerHTML(pOtherProvider1, staticTmpHtml);
otherProviderName1.innerHTML = displayProviderUrl1;
pOtherProviderName1.innerHTML = displayProviderUrl1;
msWriteProfilerMark("WeatherApp:HomePageLoad:eachDailyModuleSmall:e")
}
}
else {
var displayProviderUrl2=displayProviderUrl;
if (i === 0) {
msWriteProfilerMark("WeatherApp:HomePageLoad:eachDailyModuleSmall2:s")
}
eachDailyModuleSmallHtmlString2 += that._createSmallDailyModuleHTMLForHero(forecastData, tempFormat);
if (i === totalConditions - 1) {
eachDailyModuleSmallHtmlString2 += '<div class="clearFloats"></div>';
var staticTmpHtml2=toStaticHTML(eachDailyModuleSmallHtmlString2);
WinJS.Utilities.setInnerHTML(otherProviderForecastWrapper2, staticTmpHtml2);
WinJS.Utilities.setInnerHTML(pOtherProvider2, staticTmpHtml2);
otherProviderName2.innerHTML = displayProviderUrl2;
pOtherProviderName2.innerHTML = displayProviderUrl2;
msWriteProfilerMark("WeatherApp:HomePageLoad:eachDailyModuleSmall2:e")
}
}
}
counter++
}
var providers=Object.keys(dailyConditions);
var primaryProvider=providers[0];
var totalForecasts=dailyConditions[primaryProvider].forecasts.length;
msWriteProfilerMark("WeatherApp:HomePageLoad:PrecipModule:s");
var totalPrecipData='';
for (var i=0; i < totalForecasts; i++) {
var freshSnow='';
var currentDate=dailyConditions[primaryProvider].forecasts[i].date;
if (skiForecastDataMap[currentDate]) {
freshSnow = skiForecastDataMap[currentDate]
}
var precipData=that._createPrecipHTMLForHero(dailyConditions[primaryProvider].forecasts[i], currentConditionsData.symbolPosition, freshSnow);
totalPrecipData += precipData
}
precipitationWrapper.innerHTML = totalPrecipData + '<div class="clearFloats"></div>';
msWriteProfilerMark("WeatherApp:HomePageLoad:PrecipModule:e");
if (!ui.showLimitedExperience(locationID)) {
ui._isDailyForecastScrolled = false;
ui.setHeroClusterState(viewManagement.ApplicationView.value, ccTemplate, isSkiPano)
}
var currentConditionsSlider=ccTemplate.querySelector('.currentConditionsSlider');
if (currentConditionsSlider) {
currentConditionsSlider.style.width = "calc(87vw - 120px)"
}
var alertsInfoBox=ccTemplate.querySelector('.infoWrapper');
if (alertsInfoBox) {
alertsInfoBox.style.width = "calc(87vw - 120px)"
}
var viewState=viewManagement.ApplicationViewState;
if (viewManagement.ApplicationView.value === viewState.fullScreenLandscape || viewManagement.ApplicationView.value === viewState.filled) {
ui.adjustHeroClusterForResolution(ccTemplate, locationID)
}
if (!ui.showLimitedExperience(locationID) && isDailyDrilldownEnabled) {
WeatherAppJS.Utilities.TabIndexManager.setTabIndexOnDailyConditions(ccTemplate, true)
}
var animateButton=ccTemplate.querySelector(".forecastSlider .forecastAnimateButton");
winjsAddClass(animateButton, "buttonRight");
if (isWeatherDotCom) {
CommonJS.loadModule({
fragmentPath: "/html/templates.html", templateId: "seeMoreTemplate"
}, {}, null, null, null).then(function(seeMoreTemplate) {
var children=null;
var seeMore=seeMoreTemplate.querySelector('.weatherDotComSeeMoreText');
seeMore.setAttribute('href', weatherDotComUrl);
if (weatherDotComPosition === 0) {
children = mainProviderForecastWrapper.childNodes;
mainProviderForecastWrapper.insertBefore(seeMoreTemplate, children[children.length - 1])
}
else if (weatherDotComPosition === 1) {
children = otherProviderForecastWrapper1.childNodes;
otherProviderForecastWrapper1.insertBefore(seeMoreTemplate, children[children.length - 1])
}
else {
children = otherProviderForecastWrapper2.childNodes;
otherProviderForecastWrapper2.insertBefore(seeMoreTemplate, children[children.length - 1])
}
var dailyConditionsDefaultShown=ui.getDefaultDailyConditionsTotal();
if (children.length > dailyConditionsDefaultShown) {
seeMore.innerText = resourceLoader.getString("SeeMoreTruncatedText")
}
else {
seeMore.innerText = WeatherAppJS.Utilities.Common.getWeatherDotComSeeMoreText()
}
ui.setSeeMoreStatus(ccTemplate, seeMore, isMinimized, viewManagement.ApplicationViewState.fullScreenLandscape)
});
CommonJS.loadModule({
fragmentPath: "/html/templates.html", templateId: "pSeeMoreTemplate"
}, {}, null, null, null).then(function(pSeeMoreTemplate) {
var seeMore=pSeeMoreTemplate.querySelector('.weatherDotComSeeMoreText');
seeMore.setAttribute('href', weatherDotComUrl);
seeMore.innerText = WeatherAppJS.Utilities.Common.getWeatherDotComSeeMoreText();
if (weatherDotComPosition === 0) {
pPrimaryProvider.appendChild(pSeeMoreTemplate)
}
else if (weatherDotComPosition === 1) {
pOtherProvider1.appendChild(pSeeMoreTemplate)
}
else {
pOtherProvider2.appendChild(pSeeMoreTemplate)
}
ui.setSeeMoreStatus(ccTemplate, seeMore, isMinimized, viewManagement.ApplicationViewState.fullScreenPortrait)
})
}
if (isDailyDrilldownEnabled) {
var ccSlider=ccTemplate.querySelector('.currentTemp');
if (ccSlider) {
ui.attachClickHandlerForForecast(ccSlider, locationID)
}
}
ui._heroTemplateTimer = setTimeout(function() {
ccCluster.appendChild(ccTemplate);
WinJS.UI.Animation.enterContent(ccTemplate)
}, 100);
return ccCluster
}, _createCCModuleHTMLForHero: function _createCCModuleHTMLForHero(data, isSkiPano, showLimitedExperience, isTianQi) {
var resourceLoader=PlatformJS.Services.resourceLoader;
var dailyConditionsMarginBottomClass="";
var windTextWidth=null;
if (data.weatherProperties.key0 === "Wind") {
windTextWidth = WeatherAppJS.Utilities.UI.getPixelWidthFromString(data.weatherProperties.value0, "windTextWidthCalculator", true)
}
else if (data.weatherProperties.key1 === "Wind") {
windTextWidth = WeatherAppJS.Utilities.UI.getPixelWidthFromString(data.weatherProperties.value1, "windTextWidthCalculator", true)
}
if (windTextWidth && windTextWidth > 126) {
dailyConditionsMarginBottomClass = " dailyConditionsMarginBottom"
}
WeatherAppJS.Utilities.UI.hasReducedCCList = data.reducedAdditionalConditions;
var reducedConditionsClass=(data.reducedAdditionalConditions) ? 'reducedConditions' : '';
var ccHTML=['<div class="currentConditions">', '<div class="currentConditionsSlider">', '<div class="ccWrapper">', '<div class="currentTemp" role="document" id="autoID_CurrentDataModule">', '<div class="locWrapper ccSlider1">', '<div id="autoID_clickTempUnit" class="bTemp" tabindex="0" role="button" data-win-options="{position: \'' + 'top\'}">', '<span class="bigTempWrapper" dir="', data.symbolPosition, '">\n', '<span class="bigtemp">', data.tempCC, '</span>\n', '<span class="bigTempDegree" style="display:"', data.displayTemp, '">°</span>\n', (!isTianQi) ? ['<span class="bigTempUnit" style="display:"', data.displayTemp, '">', data.tempunit, '</span>\n'].join("") : "", '</span>', '</div>', '<div class="ccCaption cityCaption">', '<span>', data.caption, '</span>', '</div>', '<div class="feelsLikeWrapper">', '<div class="feelslike">', '<span>', data.feelslike, '</span>', '</div>', '</div>', (isSkiPano) ? ['<div class="newSnowDepth">', '<span class="baseDepthHeader"> ', resourceLoader.getString('NewSnowHeader'), '</span>', '<span class="baseDepthText"> ', data.heroData.newSnowDepth, '</span>', '</div>', '<div class="baseDepth">', '<span class="baseDepthHeader"> ', resourceLoader.getString('SnowDepthHeader'), '</span>', '<span class="baseDepthText"> ', data.heroData.baseDepth, '</span>', '</div>'].join('') : '', '<div class="providerWrapper">', '<div class="snowProvider" role="link" id="autoID_SnowProvider">', '<a class="snowConditionsProviderLink dailyConditionsProviderLink" tabindex="0">', data.heroData.snowProviderData, '</a>', '</div>', '<div class="ccProvider" role="link" id="autoID_PrimaryProvider"></div>', '</div>', '<div class="ccCollectionWrapper1">', '<div>', '<div class="ccKey">', data.weatherProperties.key0, '</div>', '<div class="ccValue" dir="', data.weatherProperties.symbolPosition0, '" aria-label="', data.weatherProperties.ariaLabel0, '">', data.weatherProperties.value0, '</div>', '</div>', '<div>', '<div class="ccKey">', data.weatherProperties.key1, '</div>', '<div class="ccValue" dir="', data.weatherProperties.symbolPosition1, '" aria-label="', data.weatherProperties.ariaLabel1, '">', data.weatherProperties.value1, '</div>', '</div>', '<div class="clearFloats"></div>', '</div>', (isSkiPano || showLimitedExperience) ? ['<div class="dailyModuleWrapper">', '<div class="dailyModule">', '<div class="forecastsWrapper animateSlide"></div>', '<div class="clearFloats"></div>', '</div>', '</div>', '<div class="dailyPrecipWrapper">', '<div class ="precipContainer">', '<div class="precipitationWrapper animateSlide"></div>', '</div>', '</div>', '<div class="overlayViewport">', '<div class="overlayContainer animateSlide"></div>', '</div>'].join("") : "", '</div>', '<div class="dailyConditionsContainer' + dailyConditionsMarginBottomClass + ' ccSlider2">', (!isSkiPano && !showLimitedExperience) ? ['<div class="dailyModuleWrapper">', '<div class="dailyModule">', '<div class="forecastsWrapper animateSlide"></div>', '<div class="clearFloats"></div>', '</div>', '</div>', '<div class="dailyPrecipWrapper">', '<div class ="precipContainer">', '<div class="precipitationWrapper animateSlide"></div>', '</div>', '</div>', '<div class="overlayViewport">', '<div class="overlayContainer animateSlide"></div>', '</div>', '<div class="ccActionButtons">', '<div class="forecastSlider" style="display: none;">', '<button id="autoID_ForecastsButton" class="forecastAnimateButton animateButton win-commandring" tabindex="0" aria-label="', resourceLoader.getString('nextDailyConditionsDataText'), '">', '</button>', '</div>', '</div>'].join("") : "", '</div>', '</div>', (isSkiPano || showLimitedExperience) ? ['<div class="ccActionButtons ccSlider1">', '<div class="forecastSlider" style="display: none;">', '<button id="autoID_ForecastsButton" class="forecastAnimateButton animateButton win-commandring" tabindex="0" aria-label="', resourceLoader.getString('nextDailyConditionsDataText'), '">', '</button>', '</div>', '</div>'].join("") : "", '</div>', '<div id="dcExpanded" class="dailyConditionsWrapper">', '<div id="ccExpanded" class="conditionsCollection ccSlider1" role="document">', '<div class="ccCollectionWrapper2">', '<div class="', reducedConditionsClass, '">', '<div class="ccKey">', data.weatherProperties.key2, '</div>', '<div class="ccValue" aria-label="', data.weatherProperties.ariaLabel2, '">', data.weatherProperties.value2, '</div>', '</div>', '<div class="', reducedConditionsClass, '">', '<div class="ccKey">', data.weatherProperties.key3, '</div>', '<div class="ccValue" dir="', data.weatherProperties.symbolPosition3, '" aria-label="', data.weatherProperties.ariaLabel3, '">', data.weatherProperties.value3, '</div>', '</div>', '<div class="clearFloats"></div>', '</div>', '<div class="ccCollectionWrapper2">', '<div>', '<div class="ccKey">', data.weatherProperties.key4, '</div>', '<div class="ccValue" aria-label="', data.weatherProperties.ariaLabel4, '">', data.weatherProperties.value4, '</div>', '</div>', '<div>', '<div class="ccKey">', data.weatherProperties.key5, '</div>', '<div class="ccValue" dir="', data.weatherProperties.symbolPosition5, '" aria-label="', data.weatherProperties.ariaLabel5, '">', data.weatherProperties.value5, '</div>', '</div>', '<div class="clearFloats"></div>', '</div>', '<div class="clearFloats"></div>', '</div>', '<div class="otherProvidersWrapper ccSlider2">', '<div class="dailyModuleOtherProviderName primaryProvider" id="autoID_MultiProvider1" role="link"></div>', '<div class="dailyModuleSmall otherForecast1" role="document" id="autoID_MultiProvider1Data">', '<div class="forecastsWrapper animateSlide"></div>', '<div class="clearFloats"></div>', '</div>', '<div class="dailyModuleOtherProviderName secondaryProvider1" id="autoID_MultiProvider2" role="link"></div>', '<div class="dailyModuleSmall otherForecast2" role="document" id="autoID_MultiProvider2Data">', '<div class="forecastsWrapper animateSlide"></div>', '<div class="clearFloats"></div>', '</div>', '</div>', '</div>', '<div class="portraitDailyConditionsWrapper">', '<div class="providersHeader">', '<div class="primaryProviderName" role="link" id="autoID_PrimaryProviderPortrait"></div>', '<div class="portraitOtherProviderNameWrapper">', '<div class="secondaryProviderName1 portraitCCSlide" id="autoID_MultiProvider1Portrait" role="link"></div>', '<div class="secondaryProviderName2 portraitCCSlide" id="autoID_MultiProvider2Portrait" role="link"></div>', '</div>', '</div>', '<div class="animationContainer">', '<div class="portraitMultiProviderWrapper">', '<div class="primaryProvider portraitForecastSlide"></div>', '<div class="portraitOtherProviderWrapper portraitForecastSlide">', '<div class="secondaryProvider1 portraitCCSlide" id="autoID_MultiProvider1DataPortrait" role="document"></div>', '<div class="secondaryProvider2 portraitCCSlide" id="autoID_MultiProvider2DataPortrait" role="document"></div>', '</div>', '</div>', '</div>', '</div>', '<div class="portraitSliders portraitCCSlide">', '<div class="pCCSlider">', '<button id="autoID_ProvidersButtonPortrait" class="forecastAnimateButton animateButton win-commandring" tabindex="0" aria-label="', resourceLoader.getString("moreDailyConditionsAriaText"), '">', '</button>', '</div>', '</div>', '</div>', '<div class="infoWrapper">', '<div style="display:', data.displayAlert, '" class="', data.displayAlertBgClass ? data.displayAlertBgClass : 'alertIndicator', '" tabindex="0" role="button" >', '<div class="alertInfo">', data.alertText, '</div>', '</div>', '</div>', '<div class="providerSlider' + dailyConditionsMarginBottomClass + '">', '<button id="autoID_ProvidersButton" class="dailyConditionsAnimateButton animateButton win-commandring" tabindex="0" aria-label="', resourceLoader.getString('moreDailyConditionsAriaText'), '">', '</button>', '</div>', '</div>'].join('');
return ccHTML
}, _createPrimaryDailyForecastHTML: function _createPrimaryDailyForecastHTML(data, symbolPosition, showDailyConditionsProvider, showLimitedExperience, displayProviderUrl, dailyForecastIndex, isSkiPano, isMinimized, ariaTextValues, freshSnow, isDailyDrilldownEnabled, totalConditions, tempFormat) {
var floater=(dailyForecastIndex === totalConditions - 1) ? '<div class="floater"></div>' : '';
var ariaLabel=(isMinimized || showLimitedExperience) ? ariaTextValues.ariaText : ariaTextValues.ariaTextExpanded;
var forecastProviderDisplay='';
var forecastProviderHtml='';
if (showDailyConditionsProvider) {
if (!showLimitedExperience || isSkiPano) {
forecastProviderDisplay = "none"
}
else if (dailyForecastIndex === 0) {
forecastProviderHtml = displayProviderUrl;
forecastProviderDisplay = "block"
}
else if (showLimitedExperience && dailyForecastIndex > 0) {
forecastProviderHtml = ''
}
}
else {
forecastProviderDisplay = "none"
}
var tempHTML=['<div class="tempContainer"><span class="tempHigh"> ', data.temphigh, '</span><span>/</span><span class="tempLow">', data.templow, '</span></div>'];
if (tempFormat === "MinMax") {
tempHTML = ['<div class="tempContainer"><span class="tempLow"> ', data.templow, '</span><span>/</span><span class="tempHigh">', data.temphigh, '</span></div>']
}
var primaryDailyForecastHTMLString=['<div class="win-template"><div class="dailyModuleFirstProvider" role="document" aria-label="', ariaLabel, '" data-ariaText="', ariaTextValues.ariaText, '" data-ariaTextExpanded="', ariaTextValues.ariaTextExpanded, '">', '<div>', '<div class="date">', data.date, '</div>', '<div class="skycode"><img class="skycodeImage" src="', data.skycode, '" alt="', data.caption, '" draggable="false" /></div>', '<div class="forecastProvider" style="display:', forecastProviderDisplay, '">', forecastProviderHtml, '</div>', tempHTML.join(''), '<div class="caption">', data.caption, '</div>', '</div>', '</div></div>', floater].join('');
return primaryDailyForecastHTMLString
}, _createSmallDailyModuleHTMLForHero: function _createSmallDailyModuleHTMLForHero(data, tempFormat) {
var resourceLoader=PlatformJS.Services.resourceLoader;
var tempHTML=['<span class="tempHigh" dir="', data.symbolPosition, '">', data.temphigh, '</span><span>/</span><span class="tempLow" dir="', data.symbolPosition, '">', data.templow, '</span>'];
if (tempFormat === "MinMax") {
tempHTML = ['<span class="tempLow" dir="', data.symbolPosition, '">', data.templow, '</span><span>/</span><span class="tempHigh" dir="', data.symbolPosition, '">', data.temphigh, '</span>']
}
var smallDailyModuleHTMLString=['<div class="win-template"><div class="dailyModuleOtherProvider">', '<div class="otherProviderTempWrapper">', '<div class="skycode"><img class="skycodeImage" src="', data.skycodeSmall, '" alt="', data.caption, '" draggable="false" /></div>', tempHTML.join(''), '<div class="precipWrapper">', '<span class="raindrop"> <span class="precipGlyph"> </span> </span> <span class="precip" dir="', data.symbolPosition, '">', data.precipitation, '</span>', '</div>', '</div>', '</div></div>'].join('');
return smallDailyModuleHTMLString
}, _createPrimaryDailyForecastPortraitHTML: function _createPrimaryDailyForecastPortraitHTML(data, symbolPosition, showDailyConditionsProvider, showLimitedExperience, displayProviderUrl, dailyForecastIndex, isSkiPano, isMinimized, ariaTextValues, freshSnow, isDailyDrilldownEnabled, totalConditions, tempFormat) {
var floater=(dailyForecastIndex === totalConditions - 1) ? '<div class="floater"></div>' : '';
var className=(isDailyDrilldownEnabled) ? 'pDailyModuleFirstProvider enablePortraitHoverEffect' : 'pDailyModuleFirstProvider';
var resourceLoader=PlatformJS.Services.resourceLoader;
var ariaLabel=(isMinimized || showLimitedExperience) ? ariaTextValues.ariaText : ariaTextValues.ariaTextExpanded;
var tempHTML=['<div class="tempContainer"><span class="tempHigh" dir="', data.symbolPosition, '">', data.temphigh, '</span><span>/</span><span class="tempLow" dir="', data.symbolPosition, '">', data.templow, '</span></div>'];
if (tempFormat === "MinMax") {
tempHTML = ['<div class="tempContainer"><span class="tempLow" dir="', data.symbolPosition, '">', data.templow, '</span><span>/</span><span class="tempHigh" dir="', data.symbolPosition, '">', data.temphigh, '</span></div>']
}
var primaryPDailyForecastHTMLString=['<div class="win-template"><div class="', className, '" tabindex="0" aria-label="', ariaLabel, '" data-ariaText="', ariaTextValues.ariaText, '" data-ariaTextExpanded="', ariaTextValues.ariaTextExpanded, '">', '<div class="date">', '<div class="day">', data.day, '</div>', '<div class="dayName">', data.dayName, '</div>', '</div>', '<div class="skycode"><img class="skycodeImage" src="', data.skycode, '" alt="', data.caption, '" draggable="false" /></div>', '<div class="tempWrapper">', tempHTML.join(''), '<div class="caption">', data.caption, '</div>', '<div class="precipWrapper">', (data.precipitation !== '--') ? '<span class="raindrop"> <span class="precipGlyph"> </span> </span> <span class="precip" dir="' + data.symbolPosition + '">' + data.precipitation + '</span> ' : '', (freshSnow) ? '<span class="snowFreshText">' + freshSnow + '</span>' : '', '</div>', '</div>', '</div></div>', floater].join('');
return primaryPDailyForecastHTMLString
}, _createPrecipHTMLForHero: function _createPrecipHTMLForHero(precipData, symbolPosition, freshSnow) {
var resourceLoader=PlatformJS.Services.resourceLoader;
var precipHTMLString=['<div class="win-template win-disposable"><div class="precipWrapper">', (precipData.precipitation && precipData.precipitation !== "--") ? '<span class="raindrop"> <span class="precipGlyph"> </span> </span> <div role="description" aria-label="' + precipData.fullDate + ' ' + resourceLoader.getString('precipitationAltText') + ' ' + precipData.precipitation + '" class="precip" dir="' + symbolPosition + '">' + precipData.precipitation + '</div> ' : '', (freshSnow) ? '<span class="snowFreshText">' + freshSnow + '</span>' : '', '</div></div>'].join('');
return precipHTMLString
}, _getAriaTextForDailyConditions: function _getAriaTextForDailyConditions(dailyConditions, index) {
var tempFormat=WeatherAppJS.WarmBoot.Cache.getString("TemperatureFormat");
if (!dailyConditions || index < 0) {
return ""
}
var providers=Object.keys(dailyConditions);
if (providers.length === 0 || dailyConditions[providers[0]].forecasts.length <= index) {
return ""
}
var firstProvider=dailyConditions[providers[0]].forecasts[index];
var resourceLoader=PlatformJS.Services.resourceLoader;
var ariaText=resourceLoader.getString(tempFormat === "MaxMin" ? "dailyForecast" : "dailyForecastMinMax").format(firstProvider.fullDate, tempFormat === "MaxMin" ? firstProvider.temphighWithoutUnit : firstProvider.templowWithoutUnit + " °", tempFormat === "MaxMin" ? firstProvider.templowWithoutUnit : firstProvider.temphighWithoutUnit + " °", firstProvider.caption, firstProvider.precipitation);
WeatherAppJS.Utilities.Instrumentation.dayOfWeek[index] = ((new Date).getDay() + index) % 7;
var ariaTextExpanded=ariaText;
var secondProvider;
var thirdProvider;
if (providers.length >= 3 && dailyConditions[providers[1]].forecasts.length > index && dailyConditions[providers[2]].forecasts.length > index) {
secondProvider = dailyConditions[providers[1]].forecasts[index];
thirdProvider = dailyConditions[providers[2]].forecasts[index];
ariaTextExpanded = resourceLoader.getString(tempFormat === "MaxMin" ? "dailyForecastExpanded2" : "dailyForecastMinMaxExpanded2").format(firstProvider.fullDate, tempFormat === "MaxMin" ? firstProvider.temphighWithoutUnit : firstProvider.templowWithoutUnit + " °", tempFormat === "MaxMin" ? firstProvider.templowWithoutUnit : firstProvider.temphighWithoutUnit + " °", firstProvider.caption, firstProvider.precipitation, tempFormat === "MaxMin" ? secondProvider.temphighWithoutUnit : secondProvider.templowWithoutUnit + " °", tempFormat === "MaxMin" ? secondProvider.templowWithoutUnit : secondProvider.temphighWithoutUnit + " °", providers[1], tempFormat === "MaxMin" ? thirdProvider.temphighWithoutUnit : thirdProvider.templowWithoutUnit + " °", tempFormat === "MaxMin" ? thirdProvider.templowWithoutUnit : thirdProvider.temphighWithoutUnit + " °", providers[2])
}
else if (providers.length >= 2 && dailyConditions[providers[1]].forecasts.length > index) {
secondProvider = dailyConditions[providers[1]].forecasts[index];
ariaTextExpanded = resourceLoader.getString(tempFormat === "MaxMin" ? "dailyForecastExpanded1" : "dailyForecastMinMaxExpanded1").format(firstProvider.fullDate, tempFormat === "MaxMin" ? firstProvider.temphighWithoutUnit : firstProvider.templowWithoutUnit + " °", tempFormat === "MaxMin" ? firstProvider.templowWithoutUnit : firstProvider.temphighWithoutUnit + " °", firstProvider.caption, firstProvider.precipitation, tempFormat === "MaxMin" ? secondProvider.temphighWithoutUnit : secondProvider.templowWithoutUnit + " °", tempFormat === "MaxMin" ? secondProvider.templowWithoutUnit : secondProvider.temphighWithoutUnit + " °", providers[1])
}
return {
ariaText: ariaText, ariaTextExpanded: ariaTextExpanded
}
}, getHourlyForecastTemplate: function getHourlyForecastTemplate(item) {
var hourlyConditionsData=item.data.hourlyConditionsData;
if (!hourlyConditionsData) {
return
}
var lastUpdatedTime=hourlyConditionsData.lastUpdatedTime;
var resourceLoader=PlatformJS.Services.resourceLoader;
var winjsAddClass=WinJS.Utilities.addClass;
var weatherUI=WeatherAppJS.Utilities.UI;
var hfCluster=document.createElement("div");
winjsAddClass(hfCluster, "win-interactive hourlyForecastCluster");
var hCluster=document.createElement("div");
winjsAddClass(hCluster, "hourlyForecastModule");
var hHeader=document.createElement("div");
winjsAddClass(hHeader, "hourlyForecastHeader");
var hRows=document.createElement("div");
winjsAddClass(hRows, "hourlyForecastRows");
hRows.addEventListener("mousewheel", CommonJS.Immersive.PanoramaPanel.verticalScrollHandler, false);
var isHourlyForecastScrolledDown=false;
var isHourlyForecastScrolledUp=false;
var lastScrollTop=0;
hRows.addEventListener('scroll', function handleScroll(event) {
var eventAttr={
location: WeatherAppJS.GeocodeCache.getLocation(item.data.location).getFullDisplayName(), dayIndex: item.data.index, dayOfWeek: item.data.dayOfWeek
};
if (this.scrollTop > lastScrollTop) {
if (!isHourlyForecastScrolledDown) {
isHourlyForecastScrolledDown = true;
isHourlyForecastScrolledUp = false;
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Day Drilldown", "Hourly Forecast", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.scroll, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr))
}
}
else if (!isHourlyForecastScrolledUp) {
isHourlyForecastScrolledUp = true;
isHourlyForecastScrolledDown = false;
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Day Drilldown", "Hourly Forecast", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.scroll, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr))
}
lastScrollTop = this.scrollTop
});
var hourlyConditionsDataPerProvider;
for (var provider in hourlyConditionsData) {
hourlyConditionsDataPerProvider = hourlyConditionsData[provider];
break
}
CommonJS.loadModule({
fragmentPath: item.data.fragmentPath, templateId: item.data.hourlyHeaderTemplate
}, {}, null, null, item).then(function(hhTemplate) {
hHeader.appendChild(hhTemplate);
var isSkiPano=WeatherAppJS.GeocodeCache.getLocation(item.data.location).isSkiLocation;
weatherUI.setHourlyHeaderCellWidth(hhTemplate.querySelector('.precip'), 'hourlyHeaderPrecipCalculator');
var feelsLikeHeader=hhTemplate.querySelector('.feelslike');
if (feelsLikeHeader) {
weatherUI.setHourlyHeaderCellWidth(feelsLikeHeader, 'hourlyHeaderFeelsLikeCalculator')
}
var templateId=item.data.hourlyRowTemplate;
var symbolPosition=WeatherAppJS.Utilities.Formatting.getSymbolPosition();
var hourlyFragment=document.createDocumentFragment();
var showHourlyDataFlag=false;
for (var i=0, j=hourlyConditionsDataPerProvider.length; i < j; i++) {
if (i % 2 === 0) {
hourlyConditionsDataPerProvider[i].className = "hourlyConditions row1"
}
else {
hourlyConditionsDataPerProvider[i].className = "hourlyConditions row2"
}
hourlyConditionsDataPerProvider[i].symbolPosition = symbolPosition;
var regex;
if (WeatherAppJS.Utilities.UI[templateId] && WeatherAppJS.Utilities.UI[templateId].querySelector('.hourlyConditions')) {
var hTemplate1=WeatherAppJS.Utilities.UI[templateId].cloneNode(true);
hTemplate1.querySelector('.hourlyConditions').className = hourlyConditionsDataPerProvider[i].className;
hTemplate1.querySelector('.hour').innerText = hourlyConditionsDataPerProvider[i].time;
hTemplate1.querySelector('.skycodeImage').src = hourlyConditionsDataPerProvider[i].skycode;
hTemplate1.querySelector('.skycodeImage').alt = hourlyConditionsDataPerProvider[i].caption;
hTemplate1.querySelector('.temperature').innerText = hourlyConditionsDataPerProvider[i].temperature;
hTemplate1.querySelector('.temperature').dir = hourlyConditionsDataPerProvider[i].symbolPosition;
hTemplate1.querySelector('.caption').innerText = hourlyConditionsDataPerProvider[i].caption;
var feelsLikeNode=hTemplate1.querySelector('.feelslike');
if (feelsLikeNode) {
feelsLikeNode.innerText = hourlyConditionsDataPerProvider[i].feelslike;
feelsLikeNode.dir = hourlyConditionsDataPerProvider[i].symbolPosition
}
hTemplate1.querySelector('.precipValue').innerText = hourlyConditionsDataPerProvider[i].precipitation;
var ariaText1=resourceLoader.getString("hourlyForecastAriaText").format(hourlyConditionsDataPerProvider[i].time, hourlyConditionsDataPerProvider[i].temperatureWithoutUnit + " °", hourlyConditionsDataPerProvider[i].caption, hourlyConditionsDataPerProvider[i].feelslike, hourlyConditionsDataPerProvider[i].precipitation);
if (isSkiPano) {
regex = new RegExp(resourceLoader.getString("HourlyForecastFeelsLikeTitle") + " " + hourlyConditionsDataPerProvider[i].feelslike + ",", 'i');
ariaText1 = ariaText1.replace(regex, "")
}
hTemplate1.querySelector(".hourlyConditions").setAttribute("aria-label", ariaText1);
hTemplate1.querySelector(".precipValue").setAttribute("dir", symbolPosition);
if (feelsLikeHeader) {
weatherUI.setHourlyHeaderCellWidth(hTemplate1.querySelector('.feelslike'), 'hourlyHeaderFeelsLikeCalculator')
}
if (i !== 0) {
hTemplate1.removeAttribute('tabindex')
}
hTemplate1.addEventListener('keydown', WeatherAppJS.Utilities.TabIndexManager.handleArrowKeyForAccessibility, false);
hourlyFragment.appendChild(hTemplate1)
}
else {
CommonJS.loadModule({
fragmentPath: "/html/templates.html", templateId: item.data.hourlyRowTemplate
}, hourlyConditionsDataPerProvider[i], null, null, item).then(function(hTemplate) {
WeatherAppJS.Utilities.UI[templateId] = hTemplate;
var ariaText=resourceLoader.getString("hourlyForecastAriaText").format(hourlyConditionsDataPerProvider[i].time, hourlyConditionsDataPerProvider[i].temperatureWithoutUnit + " °", hourlyConditionsDataPerProvider[i].caption, hourlyConditionsDataPerProvider[i].feelslike, hourlyConditionsDataPerProvider[i].precipitation);
if (isSkiPano) {
regex = new RegExp(resourceLoader.getString("HourlyForecastFeelsLikeTitle") + " " + hourlyConditionsDataPerProvider[i].feelslike + ",", 'i');
ariaText = ariaText.replace(regex, "")
}
hTemplate.querySelector(".hourlyConditions").setAttribute("aria-label", ariaText);
hTemplate.querySelector(".precipValue").setAttribute("dir", symbolPosition);
if (feelsLikeHeader) {
weatherUI.setHourlyHeaderCellWidth(hTemplate.querySelector('.feelslike'), 'hourlyHeaderFeelsLikeCalculator')
}
hTemplate.setAttribute('tabindex', '0');
hTemplate.addEventListener('keydown', WeatherAppJS.Utilities.TabIndexManager.handleArrowKeyForAccessibility, false);
hourlyFragment.appendChild(hTemplate)
})
}
}
hRows.appendChild(hourlyFragment)
});
hCluster.appendChild(hHeader);
hCluster.appendChild(hRows);
hfCluster.appendChild(hCluster);
return hfCluster
}, getHourlyForecastTemplate2: function getHourlyForecastTemplate2(data, options) {
msWriteProfilerMark("WeatherApp:HomePageLoad:HourlyCluster:s");
var isChinaExp=options.isChinaExp || false;
var isSkiPano=WeatherAppJS.GeocodeCache.getLocation(data.id).isSkiLocation;
var lastUpdatedTime=data._currentConditions.lastUpdatedTime;
var hourlyConditionsData=data.getHourlyConditions();
if (!hourlyConditionsData) {
return
}
var resourceLoader=PlatformJS.Services.resourceLoader;
var winjsAddClass=WinJS.Utilities.addClass;
var weatherUI=WeatherAppJS.Utilities.UI;
weatherUI.UTCOffset = data._hourlyConditions.UTCOffset;
var hfCluster=document.createElement("div");
winjsAddClass(hfCluster, "win-interactive hourlyForecastCluster");
var hCluster=document.createElement("div");
winjsAddClass(hCluster, "hourlyForecastModule");
var hHeader=document.createElement("div");
winjsAddClass(hHeader, "hourlyForecastHeader");
var hRows=document.createElement("div");
winjsAddClass(hRows, "hourlyForecastRows");
hRows.addEventListener("mousewheel", CommonJS.Immersive.PanoramaPanel.verticalScrollHandler, false);
var isHourlyForecastScrolledDown=false;
var isHourlyForecastScrolledUp=false;
var lastScrollTop=0;
hRows.addEventListener('scroll', function handleScroll(event) {
var eventAttr={location: WeatherAppJS.GeocodeCache.getLocation(data.id).getFullDisplayName()};
if (this.scrollTop > lastScrollTop) {
if (!isHourlyForecastScrolledDown) {
isHourlyForecastScrolledDown = true;
isHourlyForecastScrolledUp = false;
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Hourly Forecast", "Hourly Forecast", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.scroll, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr))
}
}
else if (!isHourlyForecastScrolledUp) {
isHourlyForecastScrolledUp = true;
isHourlyForecastScrolledDown = false;
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Hourly Forecast", "Hourly Forecast", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.scroll, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr))
}
lastScrollTop = this.scrollTop
});
var hourlyConditionsDataPerProvider;
for (var provider in hourlyConditionsData) {
hourlyConditionsDataPerProvider = hourlyConditionsData[provider];
break
}
var windHeaderCellWidth=0;
if (isSkiPano || isChinaExp) {
var hourlyConditionsDataLength=hourlyConditionsDataPerProvider.length;
var windHeaderWidth=hourlyConditionsDataPerProvider[hourlyConditionsDataLength - 1].wind;
for (var i=hourlyConditionsDataLength - 2; i >= 0; i--) {
if (windHeaderWidth.length < hourlyConditionsDataPerProvider[i].wind.length) {
windHeaderWidth = hourlyConditionsDataPerProvider[i].wind
}
}
windHeaderCellWidth = weatherUI.getPixelWidthFromString(windHeaderWidth, 'hourlyHeaderWindCalculator')
}
var hhTemplate=['<div class="hourlyHeader">', '<div class="hour">', resourceLoader.getString("HourlyForecastTimeTitle"), '</div>', '<div class="skycode"></div>', '<div class="tempContainer">', resourceLoader.getString("HourlyForecastForecastTitle"), '</div>', '<div class="feelslike">', resourceLoader.getString("HourlyForecastFeelsLikeTitle"), '</div>', '<div class="wind" style="width:' + windHeaderCellWidth + '">', resourceLoader.getString("HourlyForecastWindTitle"), '</div>', '<div class="precip">', resourceLoader.getString("HourlyForecastPrecipChanceTitle"), '</div>', '<div class="clearFloats"></div>', '</div>'].join('');
WinJS.Utilities.setInnerHTML(hHeader, toStaticHTML(hhTemplate));
weatherUI.setHourlyHeaderCellWidth(hHeader.querySelector('.precip'), 'hourlyHeaderPrecipCalculator');
var feelsLikeHeader=hHeader.querySelector('.feelslike');
if (feelsLikeHeader) {
weatherUI.setHourlyHeaderCellWidth(feelsLikeHeader, 'hourlyHeaderFeelsLikeCalculator')
}
var feelsLikeHeaderWidth=feelsLikeHeader.style.width;
var templateId=options.hourlyRowTemplate;
if (isChinaExp) {
templateId = templateId + "_China"
}
var symbolPosition=WeatherAppJS.Utilities.Formatting.getSymbolPosition();
var hourlyFragment='';
var showHourlyDataFlag=false;
var isFirstRow=true;
for (var i=0, j=hourlyConditionsDataPerProvider.length; i < j; i++) {
var className='';
if (i % 2 === 0) {
className = "hourlyConditions row1"
}
else {
className = "hourlyConditions row2"
}
var hData=hourlyConditionsDataPerProvider[i];
var canShowHourlyData=(!isSkiPano && !showHourlyDataFlag) ? WeatherAppJS.Utilities.Formatting._canShowHourlyData(hData.kifTime, lastUpdatedTime, weatherUI.UTCOffset) : true;
if (canShowHourlyData) {
showHourlyDataFlag = true;
var regex;
var ariaText;
var tempHTML='<span class="temperature" dir="' + symbolPosition + '">' + hData.temperature + '</span>';
if (isChinaExp) {
tempHTML = ['<span class="temperature" dir="', symbolPosition, '">', hData.tempLow, '</span>', '<span>~</span>', '<span class="temperature" dir="', symbolPosition, '">', hData.tempHigh, '</span>'].join('');
ariaText = resourceLoader.getString("hourlyForecastAriaText").format(hData.time, hData.tempLow, hData.tempHigh, hData.caption, hData.wind)
}
else {
ariaText = resourceLoader.getString("hourlyForecastAriaText").format(hData.time, hData.temperatureWithoutUnit + " °", hData.caption, hData.feelslike, hData.precipitation)
}
if (isSkiPano) {
regex = new RegExp(resourceLoader.getString("HourlyForecastFeelsLikeTitle") + " " + hData.feelslike + ",", 'i');
ariaText = ariaText.replace(regex, "")
}
var hourlyRow=['<div class="', className, '" aria-label="', ariaText, '"', (isFirstRow) ? (' tabindex="0"') : '', '>', '<div class="hour">', hData.time, '</div>', '<div class="skycode"><img class="skycodeImage" src="', hData.skycode, '" alt="', hData.caption, '" /></div>', '<div class="tempContainer">', tempHTML, '<span class="caption">', hData.caption, '</span>', '</div>', '<div class="feelslike"  dir="', symbolPosition, '" style="width:', feelsLikeHeaderWidth, '">', hData.feelslike, '</div>', (isSkiPano || isChinaExp) ? '<div class="wind" style="width:' + windHeaderCellWidth + '">' + hData.wind + '</div>' : '', '<div class="precip"><span class="raindrop"> <span class="precipGlyph"> </span> </span> <span class="precipValue" dir="', symbolPosition, '" >', hData.precipitation, '</span></div>', '<div class="clearFloats"></div>', '</div>'].join('');
isFirstRow = false;
hourlyFragment += hourlyRow
}
else {
showHourlyDataFlag = false
}
}
WinJS.Utilities.setInnerHTML(hRows, toStaticHTML(hourlyFragment));
var hConditions=hRows.querySelectorAll('.hourlyConditions');
for (var elem in hConditions) {
if (elem !== 'length' && elem !== 'item') {
hConditions[elem].addEventListener('keydown', WeatherAppJS.Utilities.TabIndexManager.handleArrowKeyForAccessibility)
}
}
hCluster.appendChild(hHeader);
hCluster.appendChild(hRows);
msSetImmediate(function() {
WinJS.UI.Animation.enterContent(hfCluster.appendChild(hCluster));
msWriteProfilerMark("WeatherApp:HomePageLoad:HourlyCluster:e")
});
return hfCluster
}, getHistoricalTemplate: function getHistoricalTemplate(loc) {
var hwData=loc.getHistoricalWeather();
var hwCluster=document.createElement('div');
WinJS.Utilities.addClass(hwCluster, "historicWrapper");
CommonJS.loadModule({
fragmentPath: "/html/delayedTemplate.html", templateId: "historicalWeather"
}, {}, null, null, null).then(function(hTemplate) {
hwCluster.appendChild(hTemplate);
msSetImmediate(function() {
WeatherAppJS.UI.HWChartManager.init(hTemplate, hwData, WeatherAppJS.GeocodeCache.getLocation(loc.id).getFullDisplayName())
})
});
return hwCluster
}, getSemanticZoomTemplate: WinJS.UI.eventHandler(function(itemPromise) {
return {element: itemPromise.then(function(itemObj) {
var div=document.createElement("div");
var clusterTitle=itemObj.data.clusterTitle;
if (!clusterTitle) {
clusterTitle = PlatformJS.Services.resourceLoader.getString("Overview")
}
WinJS.Utilities.addClass(div, "zoomedOutTemplate");
var currentPage=WeatherAppJS.Utilities.Common.getCurrentPage();
if (currentPage === "WeatherAppJS.DailyForecast") {
WinJS.Utilities.addClass(div, "ddSemanticZoom")
}
var uxInfo={
clusterTitle: clusterTitle, moduleInfo: {
fragmentPath: "/html/templates.html", templateId: "zoomedOutTemplate"
}
};
CommonJS.loadModule(uxInfo.moduleInfo, uxInfo, div).then();
return div
})}
}), getTianQiTemplate: function getTianQiTemplate(item) {
var that=WeatherAppJS.Utilities.Templates;
var ui=WeatherAppJS.Utilities.UI;
var viewManagement=Windows.UI.ViewManagement;
var winjsAddClass=WinJS.Utilities.addClass;
var resourceLoader=PlatformJS.Services.resourceLoader;
var appConfig=PlatformJS.Services.appConfig;
var ccCluster=document.createElement('div');
winjsAddClass(ccCluster, "win-interactive currentConditionsModule tianqiHeroCluster");
var currentConditionsData=item.data.loc.getCurrentConditions();
var dailyConditionsData=item.data.loc.getDailyConditions();
var locationID=item.data.loc.id;
ui._totalDailyForecasts = item.data.loc.maxDailyForecastDays;
CommonJS.loadModule({
fragmentPath: "/html/templates.html", templateId: "ccModule"
}, currentConditionsData, null, null, item).then(function(ccTemplate) {
var forecastSlider=ccTemplate.querySelector('.forecastSlider');
forecastSlider.addEventListener('click', (function(locName) {
return function() {
WeatherAppJS.Utilities.UI.AnimateForecastSlide(locName)
}
}(item.data.loc.id)), false);
var feelsLikeTemp=currentConditionsData.feelslikeTemp ? currentConditionsData.feelslikeTemp : "";
var ariaText=resourceLoader.getString("currentConditionsAriaText").format(currentConditionsData.tempCC + " °", currentConditionsData.caption, feelsLikeTemp, currentConditionsData.provider);
var ccElem=ccTemplate.querySelector(".bTemp");
ccElem.setAttribute("aria-label", ariaText);
var feelsLikeWrapper=ccTemplate.querySelector('.feelsLikeWrapper');
var wind=document.createElement('div');
winjsAddClass(wind, 'ccWind');
wind.innerText = currentConditionsData.wind;
feelsLikeWrapper.appendChild(wind);
var humidity=document.createElement('div');
winjsAddClass(humidity, 'ccHumidity');
humidity.innerText = currentConditionsData.humidity;
feelsLikeWrapper.appendChild(humidity);
if (currentConditionsData.precipitation !== WeatherAppJS.Utilities.Common.getNoDataString()) {
var precipitation=document.createElement('div');
winjsAddClass(precipitation, 'ccPrecipitation');
precipitation.innerText = currentConditionsData.precipitation;
ccTemplate.querySelector('.providerWrapper').appendChild(precipitation)
}
var dailyData=ccTemplate.querySelector('.dailyModule');
var forecastWrapper=ccTemplate.querySelector('.forecastsWrapper');
var pPrimaryProvider=ccTemplate.querySelector('.portraitDailyConditionsWrapper .primaryProvider');
var precipitationWrapper=ccTemplate.querySelector('.precipitationWrapper');
var dailyConditions=dailyConditionsData[0];
var eachDailyModuleTemplate=null;
var pEachDailyModuleTemplate=null;
var totalConditions=0;
if (dailyConditions.forecasts) {
totalConditions = dailyConditions.forecasts.length
}
var pPrimaryProviderName=ccTemplate.querySelector('.primaryProviderName');
var primaryProviderName=ccTemplate.querySelector('.ccProvider');
var providerName=dailyConditions.provider,
providerUrl=dailyConditions.url;
var displayProvUrl;
if (providerUrl) {
displayProvUrl = '<a class="dailyConditionsProviderLink" href="' + providerUrl + '" tabIndex="0" >' + providerName + '</a>'
}
else {
displayProvUrl = providerName
}
primaryProviderName.setAttribute('role', 'link');
primaryProviderName.setAttribute('id', 'autoID_PrimaryProviderChina');
primaryProviderName.innerHTML = displayProvUrl;
pPrimaryProviderName.innerHTML = displayProvUrl;
WeatherAppJS.Utilities.UI.setProviderDisplayFlag(primaryProviderName, pPrimaryProviderName);
primaryProviderName.addEventListener('click', function(event) {
WeatherAppJS.Utilities.Instrumentation.onClickAttribution(primaryProviderName.textContent, WeatherAppJS.Instrumentation.PageContext.DailyForecast)
});
pPrimaryProvider.addEventListener('click', function(event) {
WeatherAppJS.Utilities.Instrumentation.onClickAttribution(pPrimaryProvider.textContent, WeatherAppJS.Instrumentation.PageContext.DailyForecast)
});
var pDailyConditionsWrapper=ccTemplate.querySelector('.portraitDailyConditionsWrapper');
var animationContainer=pDailyConditionsWrapper.querySelector('.animationContainer');
if (animationContainer) {
animationContainer.style.width = ui.minimizedAnimationContainerWidth
}
for (var i=0; i < totalConditions; i++) {
var forecastData=dailyConditions.forecasts[i];
if (!eachDailyModuleTemplate) {
CommonJS.loadModule({
fragmentPath: "/html/templates.html", templateId: "eachDailyModule"
}, forecastData, null, null, item).then(function(dailyTemplate) {
eachDailyModuleTemplate = dailyTemplate;
forecastWrapper.appendChild(dailyTemplate)
})
}
else {
var thisDailyTemplate=eachDailyModuleTemplate.cloneNode(true);
thisDailyTemplate.querySelector('.date').innerText = forecastData.date;
thisDailyTemplate.querySelector('.tempHigh').innerText = forecastData.temphigh;
thisDailyTemplate.querySelector('.tempLow').innerText = forecastData.templow;
thisDailyTemplate.querySelector('.caption').innerText = forecastData.caption;
var skyCodeImage=thisDailyTemplate.querySelector('.skycodeImage');
skyCodeImage.alt = forecastData.caption;
skyCodeImage.src = forecastData.skycode;
forecastWrapper.appendChild(thisDailyTemplate)
}
if (!pEachDailyModuleTemplate) {
CommonJS.loadModule({
fragmentPath: "/html/templates.html", templateId: "pEachDailyModule"
}, forecastData, null, null, item).then(function(pDailyTemplate) {
pEachDailyModuleTemplate = pDailyTemplate;
pDailyTemplate.querySelector('.precipWrapper').innerText = forecastData.windspeed;
pPrimaryProvider.appendChild(pDailyTemplate)
})
}
else {
var thispDailyTemplate=pEachDailyModuleTemplate.cloneNode(true);
thispDailyTemplate.querySelector('.day').innerText = forecastData.day;
thispDailyTemplate.querySelector('.dayName').innerText = forecastData.dayName;
thispDailyTemplate.querySelector('.caption').innerText = forecastData.caption;
thispDailyTemplate.querySelector('.tempHigh').innerText = forecastData.temphigh;
thispDailyTemplate.querySelector('.tempLow').innerText = forecastData.templow;
thispDailyTemplate.querySelector('.precipWrapper').innerText = forecastData.windspeed;
var skycodeImage=thispDailyTemplate.querySelector('.skycodeImage');
skycodeImage.src = forecastData.skycode;
skycodeImage.alt = forecastData.caption;
pPrimaryProvider.appendChild(thispDailyTemplate)
}
if (i === totalConditions - 1) {
if (ui._totalDailyForecasts <= ui._totalDailyForecastsShown) {
forecastSlider.style.display = "none"
}
else {
forecastSlider.style.display = "block"
}
}
}
if (totalConditions > 0) {
CommonJS.loadModule({
fragmentPath: "/html/templates.html", templateId: "precipModule"
}, dailyConditions.forecasts[0], null, null, item).then(function(precipTemplate) {
var precipFragment=document.createDocumentFragment();
for (var i=0; i < totalConditions; i++) {
var currentPrecipTemplate=precipTemplate.cloneNode(true);
var precip=currentPrecipTemplate.querySelector('.precipWrapper');
precip.innerText = dailyConditions.forecasts[i].windspeed;
precipFragment.appendChild(precip)
}
var precipFloater=document.createElement('div');
winjsAddClass(precipFloater, "clearFloats");
precipFragment.appendChild(precipFloater);
precipitationWrapper.appendChild(precipFragment)
})
}
ui.setHeroClusterState(viewManagement.ApplicationView.value, ccTemplate, true);
var currentConditionsSlider=ccTemplate.querySelector('.currentConditionsSlider');
if (currentConditionsSlider) {
currentConditionsSlider.style.width = "calc(87vw - 120px)"
}
ccCluster.appendChild(ccTemplate);
var viewState=viewManagement.ApplicationViewState;
if (viewManagement.ApplicationView.value === viewState.fullScreenLandscape || viewManagement.ApplicationView.value === viewState.filled) {
ui.adjustHeroClusterForResolution(ccTemplate, locationID)
}
var animateButton=ccCluster.querySelector(".forecastSlider .forecastAnimateButton");
winjsAddClass(animateButton, "buttonRight")
});
return ccCluster
}, getHistoricDailyDataTemplate: function getHistoricDailyDataTemplate(item) {
var addlModulesClass=item.data.groupKey;
var addlModules=document.querySelector('.' + addlModulesClass);
if (addlModules) {
addlModules.innerHTML = ''
}
else {
addlModules = document.createElement('div');
WinJS.Utilities.addClass(addlModules, 'win-interactive addlModules ' + addlModulesClass)
}
var historicData=item.data.historicData;
var resLoader=PlatformJS.Services.resourceLoader;
if (historicData) {
var historicalString=historicData.historicalString;
var historicWrapper=document.createElement('div');
WinJS.Utilities.addClass(historicWrapper, 'historicWrapper');
var historicModule=document.createElement('div');
WinJS.Utilities.addClass(historicModule, 'historicModule');
var historicalHeading=document.createElement('div');
historicalHeading.innerText = resLoader.getString("HistoricalWeather");
WinJS.Utilities.addClass(historicalHeading, 'heading');
var historicalStringElem=null;
if (historicalString) {
historicalStringElem = document.createElement('div');
WinJS.Utilities.addClass(historicalStringElem, 'historicString');
historicalStringElem.innerText = historicalString
}
var formatting=WeatherAppJS.Utilities.Formatting;
var resourceFile=PlatformJS.Services.resourceLoader;
var noData=WeatherAppJS.Utilities.Common.getNoDataString();
var formattedData={};
if (historicData.MaxTemp === '') {
formattedData.MaxTemp = noData
}
else {
formattedData.MaxTemp = formatting.getTemperatureWithDegreeUnit(historicData.MaxTemp)
}
if (historicData.MinTemp === '') {
formattedData.MinTemp = noData
}
else {
formattedData.MinTemp = formatting.getTemperatureWithDegreeUnit(historicData.MinTemp)
}
if (historicData.MaxRecordedTemp === '') {
formattedData.MaxRecordedTemp = noData
}
else {
formattedData.MaxRecordedTemp = formatting.getTemperatureWithDegreeUnit(historicData.MaxRecordedTemp) + "<span class=\"recordedYear\">(" + historicData.MaxRecordedTempDate + ")</span>"
}
if (historicData.MinRecordedTemp === '') {
formattedData.MinRecordedTemp = noData
}
else {
formattedData.MinRecordedTemp = formatting.getTemperatureWithDegreeUnit(historicData.MinRecordedTemp) + "<span class=\"recordedYear\">(" + historicData.MinRecordedTempDate + ")</span>"
}
CommonJS.loadModule({
fragmentPath: '/html/secondaryTemplates.html', templateId: 'historicColumnTemplate'
}, formattedData, null, null, item).then(function(template) {
historicModule.appendChild(template);
var displayUnit=WeatherAppJS.SettingsManager.getDisplayUnit();
if (historicData.Precipitation !== '') {
var heading1=template.querySelector('.optionalKey1');
if (heading1) {
heading1.innerText = resourceFile.getString("AverageRainfall")
}
var value1=template.querySelector('.optionalValue1');
if (value1) {
value1.innerText = formatting.getLengthUnitForHW(historicData.Precipitation, displayUnit)
}
if (historicData.MaxPrecipitation !== '') {
var heading2=template.querySelector('.optionalKey2');
if (heading2) {
heading2.innerText = resourceFile.getString("MaximumRecordedRainfall")
}
var value2=template.querySelector('.optionalValue2');
if (value2) {
value2.innerHTML = formatting.getLengthUnitForHW(historicData.MaxPrecipitation, displayUnit) + "<span class=\"recordedYear\">(" + historicData.MaxRecordedPrecipitationDate + ")</span>"
}
}
}
if (addlModules) {
historicWrapper.appendChild(historicalHeading);
if (historicalStringElem) {
historicWrapper.appendChild(historicalStringElem)
}
historicWrapper.appendChild(historicModule);
addlModules.appendChild(historicWrapper);
WinJS.UI.Animation.enterContent(historicWrapper)
}
})
}
var hourlyCluster=WeatherAppJS.Utilities.Templates.getHourlyForecastTemplate(item);
if (hourlyCluster) {
var hourlyWrapper=document.createElement('div');
WinJS.Utilities.addClass(hourlyWrapper, 'hourlyWrapper');
var hourlyHeading=document.createElement('div');
hourlyHeading.innerText = resLoader.getString("HourlyForecast");
WinJS.Utilities.addClass(hourlyHeading, 'heading');
hourlyWrapper.appendChild(hourlyHeading);
var hourlyModule=hourlyCluster.querySelector('.hourlyForecastModule');
WinJS.Utilities.addClass(hourlyModule, 'hourlyForecastFullModule');
if (historicData) {
if (historicalString) {
WinJS.Utilities.addClass(hourlyModule, 'hourlyForecastRestrictedModule')
}
else {
WinJS.Utilities.addClass(hourlyModule, 'hourlyForecastMediumModule')
}
}
else {
WinJS.Utilities.addClass(hourlyModule, 'hourlyForecastShortModule')
}
var ui=WeatherAppJS.Utilities.UI;
if (!ui._historicDataDailyDrilldownHeight) {
var hd=document.querySelector('.historicalData');
if (hd) {
ui._historicDataDailyDrilldownHeight = hd.clientHeight
}
}
hourlyWrapper.appendChild(hourlyCluster);
var hourlyForecastRows=hourlyModule.querySelector('.hourlyForecastRows');
if (hourlyForecastRows.childNodes.length > 0) {
addlModules.appendChild(hourlyWrapper)
}
if (item.data.showEnterContentAnimation) {
WinJS.UI.Animation.enterContent(hourlyWrapper)
}
}
return addlModules
}, getDailyConditionsTemplate: function getDailyConditionsTemplate(item) {
var wrapper=document.createElement('div');
if (item.data && item.data.forecastData) {
var forecastData=item.data.forecastData;
var histClass=item.data.forecastData.histModuleClassName;
CommonJS.loadModule({
fragmentPath: "/html/secondaryTemplates.html", templateId: "dailyConditionTemplate"
}, forecastData, null, null, null).then(function(dailyConditionsTemplate) {
var histModule=dailyConditionsTemplate.querySelector('.histModule');
if (histModule) {
WinJS.Utilities.addClass(histModule, histClass)
}
wrapper.appendChild(dailyConditionsTemplate);
WinJS.UI.Animation.enterContent(dailyConditionsTemplate)
})
}
return wrapper
}
});
WinJS.Namespace.define("WeatherAppJS.Utilities.ClusterDefinition", {
StandardListView: function StandardListView(meta, options) {
this.clusterKey = meta.clusterKey;
this.clusterTitle = meta.clusterTitle;
this.clusterContent = {
contentControl: "WinJS.UI.ListView", contentOptions: {
itemDataSource: meta.itemDataSource, itemTemplate: meta.itemTemplate
}
};
this.gridLayout = {
multiSize: false, cellWidth: 20, cellHeight: 20, verticalSpacing: 0, horizontalSpacing: 0
};
this.selectionMode = "multi";
this.tapBehavior = "invoke";
if (options) {
WinJS.UI.setOptions(this.clusterContent.contentOptions, options)
}
}, AdvancedListView: function AdvancedListView(meta, options) {
this.clusterKey = meta.clusterKey;
this.clusterTitle = meta.clusterTitle;
this.clusterContent = {
contentControl: "CommonJS.UI.ResponsiveListView", contentOptions: {
itemDataSource: meta.itemDataSource, itemTemplate: meta.itemTemplate, enabledFeatures: meta.enabledFeatures, addTileItemTemplate: meta.addTileItemTemplate
}
};
this.gridLayout = {
multiSize: false, cellWidth: 20, cellHeight: 20, verticalSpacing: 0, horizontalSpacing: 0
};
this.selectionMode = "multi";
this.tapBehavior = "invoke";
if (options) {
WinJS.UI.setOptions(this.clusterContent.contentOptions, options)
}
}, ItemsContainer: function ItemsContainer(meta, options) {
this.clusterKey = meta.clusterKey;
this.clusterTitle = meta.clusterTitle;
this.supressTitleInHeader = meta.supressTitleInHeader;
this.width = meta.width;
this.clusterContent = {
contentControl: "CommonJS.Immersive.ItemsContainer", contentOptions: {itemDataSource: meta.dataSource}
};
if (options) {
WinJS.UI.setOptions(this.clusterContent.contentOptions, options)
}
}
});
WinJS.Namespace.define("WeatherAppJS.Utilities.Roaming", {
dataServiceUtility: null, pdpUpdateType: {
add: 1, remove: 2, defaultUpdate: 3
}, changeHomeType: {
favorite: 1, recent: 2, general: 3
}, getDataServiceUtilityInstance: function getDataServiceUtilityInstance() {
if (!WeatherAppJS.Utilities.Roaming.dataServiceUtility) {
WeatherAppJS.Utilities.Roaming.dataServiceUtility = new AppEx.WeatherApp.Services.PersonalizedDataServiceUtility
}
return WeatherAppJS.Utilities.Roaming.dataServiceUtility
}, getLocationDetails: function getLocationDetails(locObj) {
var locationDetails={
GeoCoordinates: {
Latitude: locObj.latitude, Longitude: locObj.longitude
}, City: locObj.city, State: locObj.state, CountryRegion: locObj.country, LocationType: locObj.locType, LocationTypeId: locObj.getId(), ISOCode: locObj.isoCode
};
return locationDetails
}, isPDPReadInProgress: false
});
WinJS.Namespace.define("WeatherAppJS.Utilities.UI", {
_heroTemplateTimer: null, minimizedAnimationContainerWidth: "316px", maximizedAnimationContainerWidth: "296px", hasReducedCCList: false, UTCOffset: '', ccProviderDisplay: true, setProviderDisplayFlag: function setProviderDisplayFlag(mainProvider, primaryProvider) {
if (mainProvider.innerHTML === primaryProvider.innerHTML) {
this.ccProviderDisplay = false
}
this.displayMainProviderName(null, mainProvider)
}, displayMainProviderName: function displayMainProviderName(newWidth, mainProvider) {
if (!mainProvider) {
mainProvider = document.querySelector(".ccProvider")
}
if (mainProvider) {
var isPortrait=this.isLayoutVertical(newWidth);
if (isPortrait && !this.ccProviderDisplay) {
WinJS.Utilities.addClass(mainProvider, "hideCCProvider")
}
else {
WinJS.Utilities.removeClass(mainProvider, "hideCCProvider")
}
}
}, setSeeMoreStatus: function setSeeMoreStatus(parentNode, seeMoreElement, isMinimized, layoutState) {
var isDisabled=isMinimized;
var viewState=Windows.UI.ViewManagement.ApplicationViewState;
parentNode = parentNode || document;
if (!layoutState) {
layoutState = Windows.UI.ViewManagement.ApplicationView.value
}
if (!seeMoreElement) {
if (layoutState === viewState.filled || layoutState === viewState.fullScreenLandscape) {
seeMoreElement = seeMoreElement || parentNode.querySelector(".seeMore .weatherDotComSeeMoreText")
}
else if (layoutState === viewState.fullScreenPortrait) {
seeMoreElement = seeMoreElement || parentNode.querySelector(".pSeeMore .weatherDotComSeeMoreText")
}
if (!seeMoreElement) {
return
}
}
if (!isDisabled) {
var forecastWrapper=null;
var childCount=-1;
var animateButton=null;
if (layoutState === viewState.filled || layoutState === viewState.fullScreenLandscape) {
forecastWrapper = seeMoreElement.parentNode.parentNode.parentNode;
if (forecastWrapper) {
childCount = forecastWrapper.childNodes.length - 1;
animateButton = parentNode.querySelector(".forecastAnimateButton");
if (animateButton) {
var isButtonRight=WinJS.Utilities.hasClass(animateButton, "buttonRight");
if ((childCount <= WeatherAppJS.Utilities.UI._totalDailyForecastsShown && !isButtonRight) || (childCount > WeatherAppJS.Utilities.UI._totalDailyForecastsShown && isButtonRight)) {
isDisabled = true
}
}
}
}
}
seeMoreElement.disabled = isDisabled
}, setSecondaryProviderLinkStatus: function setSecondaryProviderLinkStatus(parentNode, isMinimized) {
parentNode = parentNode || document;
var viewState=Windows.UI.ViewManagement.ApplicationViewState;
var layoutState=Windows.UI.ViewManagement.ApplicationView.value;
var otherProviderNames=null;
if (layoutState === viewState.filled || layoutState === viewState.fullScreenLandscape) {
otherProviderNames = parentNode.querySelectorAll(".otherProvidersWrapper .dailyConditionsProviderLink");
if (otherProviderNames[0]) {
otherProviderNames[0].disabled = isMinimized
}
if (otherProviderNames[1]) {
otherProviderNames[1].disabled = isMinimized
}
}
else if (layoutState === viewState.fullScreenPortrait) {
otherProviderNames = parentNode.querySelectorAll(".portraitOtherProviderNameWrapper .dailyConditionsProviderLink");
if (otherProviderNames[0]) {
otherProviderNames[0].disabled = isMinimized
}
if (otherProviderNames[1]) {
otherProviderNames[1].disabled = isMinimized
}
}
}, imageCardSource: WinJS.Binding.converter(function(url) {
return {
url: url, cacheId: "PlatformImageCache"
}
}), showLimitedExperience: function showLimitedExperience(locID) {
if (!locID) {
return false
}
var singleProviderOnly=WeatherAppJS.WarmBoot.Cache.getBool("SingleProviderOnly");
var showLimitedExperience=false;
var locationInfo=WeatherAppJS.GeocodeCache.getLocation(locID);
if (singleProviderOnly) {
if (locationInfo.isoCode) {
if (locationInfo.isoCode === WeatherAppJS.WarmBoot.Cache.getMarketLocation("isoCode")) {
showLimitedExperience = true
}
}
else {
var geographicRegion=new Windows.Globalization.GeographicRegion;
if (geographicRegion.nativeName === locationInfo.country || geographicRegion.displayName === locationInfo.country) {
showLimitedExperience = true
}
}
}
return showLimitedExperience
}, ShowFlyoutBackground: function ShowFlyoutBackground(show) {
var flyoutBackground=document.getElementById("flyoutBackground");
if (flyoutBackground) {
flyoutBackground.style.display = show ? "block" : "none"
}
}, LoadAlertsFlyout: function LoadAlertsFlyout(locationID) {
msWriteProfilerMark("WeatherApp:AlertsFlyoutLoad:s");
WeatherAppJS.Utilities.UI.ShowFlyoutBackground(false);
var winjsAddClass=WinJS.Utilities.addClass;
var resourceFile=PlatformJS.Services.resourceLoader;
var loc=WeatherAppJS.LocationsManager.getLocation(locationID);
var alertsData=loc.getAlerts();
var alertsCount=alertsData.length;
var alertsFlyout=document.getElementById('alertsFlyout');
var alertsContainer=null;
if (!alertsFlyout) {
alertsFlyout = document.createElement('div');
alertsFlyout.id = 'alertsFlyout';
alertsFlyout.setAttribute('data-win-control', 'WinJS.UI.Flyout');
alertsFlyout.setAttribute('aria-label', resourceFile.getString('alertsFlyoutAriaText'));
alertsContainer = document.createElement('div');
alertsContainer.id = 'alertsContainer';
alertsFlyout.appendChild(alertsContainer);
var mainContainer=document.getElementById('mainContainer');
if (mainContainer) {
mainContainer.appendChild(alertsFlyout)
}
WinJS.UI.processAll(alertsFlyout)
}
if (!alertsContainer) {
alertsContainer = alertsFlyout.querySelector('#alertsContainer')
}
alertsContainer.innerText = '';
var alertsFlyoutHeading=document.createElement('div');
winjsAddClass(alertsFlyoutHeading, "alertsFlyoutHeading");
alertsFlyoutHeading.innerText = resourceFile.getString((alertsCount === 1) ? "Single Alert Heading" : "Multiple Alerts Heading");
alertsContainer.appendChild(alertsFlyoutHeading);
if (alertsCount === 1) {
WeatherAppJS.Utilities.Instrumentation.incrementInt32("AlertFlyoutOpenedOnSingleAlert")
}
else {
WeatherAppJS.Utilities.Instrumentation.incrementInt32("AlertFlyoutOpenedOnMultipleAlerts")
}
var eventAttr={
location: WeatherAppJS.GeocodeCache.getLocation(loc.id).getFullDisplayName(), numOfAlerts: alertsCount
};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Alerts", "Alerts Flyout", Microsoft.Bing.AppEx.Telemetry.AppActionOperation.open, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr));
var alertHeadings=document.createElement('div');
winjsAddClass(alertHeadings, "alertHeadings");
for (var i=0; i < alertsCount; i++) {
var alertHeadingWrapper=document.createElement('div');
winjsAddClass(alertHeadingWrapper, "alertHeadingWrapper");
alertHeadingWrapper.setAttribute("tabindex", "0");
alertHeadingWrapper.setAttribute("role", "document");
alertHeadingWrapper.onkeyup = WeatherAppJS.Utilities.TabIndexManager.HandleKeyboardInvocation;
var alertHeading=document.createElement('span');
winjsAddClass(alertHeading, "alertHeading");
alertHeading.innerText = alertsData[i].title;
alertHeading.id = 'alert' + i;
alertHeadingWrapper.addEventListener('click', function(event) {
WeatherAppJS.Utilities.UI.ViewAlert(event, WeatherAppJS.GeocodeCache.getLocation(loc.id).getFullDisplayName())
}, false);
if (i === 0) {
winjsAddClass(alertHeadingWrapper, "addAlertHighlight")
}
if (alertsData[i].title.toLowerCase().indexOf("warning") !== -1) {
winjsAddClass(alertHeadingWrapper, 'warningAlertFormat')
}
else {
winjsAddClass(alertHeadingWrapper, 'otherAlertFormat')
}
alertHeadingWrapper.appendChild(alertHeading);
alertHeadings.appendChild(alertHeadingWrapper)
}
alertsContainer.appendChild(alertHeadings);
var alertDescriptions=document.createElement('div');
winjsAddClass(alertDescriptions, "alertDescriptions");
for (var j=0; j < alertsCount; j++) {
var alertTime=resourceFile.getString("FromToText").format(alertsData[j].createTime, alertsData[j].expirationTime);
alertsData[j].formattedAlertTime = alertTime;
if (j === 0) {
alertsData[j].displayType = 'block'
}
CommonJS.loadModule({
fragmentPath: '/html/delayedTemplate.html', templateId: 'alertModule'
}, alertsData[j], null, null, null).then(function(eachAlertTemplate) {
var desc=eachAlertTemplate.getElementsByClassName('alertDesc')[0].innerHTML;
desc = desc.replace(/&lt;br&gt;/g, "<br />");
eachAlertTemplate.getElementsByClassName('alertDesc')[0].innerHTML = desc;
var isAlertDescScrolledDown=false;
var isAlertDescScrolledUp=false;
var lastScrollTop=0;
eachAlertTemplate.getElementsByClassName('alertDesc')[0].addEventListener("scroll", function handleScroll(event) {
eventAttr = {
location: WeatherAppJS.GeocodeCache.getLocation(loc.id).getFullDisplayName(), alertTitle: eachAlertTemplate.getElementsByClassName('alertTitle')[0].innerText
};
if (this.scrollTop > lastScrollTop) {
if (!isAlertDescScrolledDown) {
isAlertDescScrolledDown = true;
isAlertDescScrolledUp = false;
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Alerts", "Alert Description", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.scroll, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr))
}
}
else if (!isAlertDescScrolledUp) {
isAlertDescScrolledUp = true;
isAlertDescScrolledDown = false;
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Alerts", "Alert Description", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.scroll, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr))
}
lastScrollTop = this.scrollTop
});
alertDescriptions.appendChild(eachAlertTemplate)
})
}
alertsContainer.appendChild(alertDescriptions);
var alertsFlyoutControl=alertsFlyout.winControl;
alertsFlyoutControl.addEventListener("afterhide", function() {
WeatherAppJS.Utilities.UI.ShowFlyoutBackground(false);
var alertIndicator=document.querySelector(".alertIndicator");
if (alertIndicator) {
alertIndicator.focus()
}
});
var alertsAnchor=document.querySelector('#flyoutAnchor');
if (alertsFlyoutControl && alertsFlyoutControl.hidden) {
alertsFlyoutControl.show(alertsAnchor);
WinJS.UI.Animation.showPopup(alertsFlyout)
}
msWriteProfilerMark("WeatherApp:AlertsFlyoutLoad:e")
}, ViewAlert: function ViewAlert(event, locn) {
var alertTitle=event.srcElement.querySelector(".alertHeading");
if (!alertTitle) {
alertTitle = event.srcElement
}
WeatherAppJS.Utilities.Instrumentation.incrementInt32("AlertTabsSwitch");
var eventAttr={
location: locn, alertTitle: alertTitle.textContent
};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Alerts", "Alert Tab", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr));
var alertNumber=parseInt(alertTitle.id.replace('alert', ''));
var alertsContainer=document.getElementById('alertsContainer');
var allAlerts=alertsContainer.getElementsByClassName('eachAlert');
var allAlertHeadings=alertsContainer.getElementsByClassName('alertHeadingWrapper');
var winjsUtils=WinJS.Utilities;
for (var i=0; i < allAlerts.length; i++) {
winjsUtils.removeClass(allAlertHeadings[i], "addAlertHighlight");
if (i === alertNumber) {
winjsUtils.addClass(allAlertHeadings[i], "addAlertHighlight");
allAlerts[i].style.display = "block"
}
else {
allAlerts[i].style.display = "none"
}
}
}, handleFavoritesClick: function handleFavoritesClick(locationObj) {
PlatformJS.Navigation.navigateToChannel('Home', {
locID: locationObj, geocodeLocation: WeatherAppJS.GeocodeCache.getLocation(locationObj), formCode: WeatherAppJS.Instrumentation.FormCodes.MyPlacesTile
})
}, disableNavigationBar: function disableNavigationBar() {
var navBar=document.querySelector("#platformNavigationBar").winControl;
if (navBar) {
navBar.disabled = true
}
}, enableNavigationBar: function enableNavigationBar() {
var navBar=document.querySelector("#platformNavigationBar").winControl;
if (navBar) {
navBar.disabled = false
}
}, disableBottomEdgy: function disableBottomEdgy(edgyId) {
var bEdgy=PlatformJS.Utilities.getControl(edgyId);
if (bEdgy) {
bEdgy.disabled = true
}
}, enableBottomEdgy: function enableBottomEdgy(edgyId) {
var bEdgy=PlatformJS.Utilities.getControl(edgyId);
if (bEdgy) {
bEdgy.disabled = false
}
}, getHoveredForecastIndex: function getHoveredForecastIndex(e) {
var ui=WeatherAppJS.Utilities.UI;
var layoutState=Windows.UI.ViewManagement.ApplicationView.value;
var hoveredForecastIndex=null;
var direction=WeatherAppJS.Utilities.Common.getDirection();
if (layoutState === Windows.UI.ViewManagement.ApplicationViewState.fullScreenPortrait || ui.isLayoutVertical()) {
return null
}
else {
var hoverPoint=0;
hoverPoint = e ? e.clientX : 0;
if (direction === "rtl") {
hoverPoint = window.innerWidth - hoverPoint
}
var initialPanoScrollPosition=0;
var panoScrollPosition=ui.getPanoScrollPosition();
if (panoScrollPosition < initialPanoScrollPosition) {
panoScrollPosition = initialPanoScrollPosition
}
hoverPoint = hoverPoint + (panoScrollPosition - initialPanoScrollPosition);
if (hoverPoint < 370) {
return null
}
if (e && e.target) {
var target=e.target;
if (WinJS.Utilities.hasClass(target, "overlay") || WinJS.Utilities.hasClass(target, "precipWrapper")) {
hoveredForecastIndex = Math.floor((hoverPoint - 370) / 147);
if (ui._isDailyForecastScrolled) {
var dailyModuleFirstProviders=document.querySelectorAll(".dailyModuleFirstProvider");
var totalElements=0;
var alreadyShownElements=WeatherAppJS.Utilities.UI._totalDailyForecastsShown;
if (dailyModuleFirstProviders) {
totalElements = dailyModuleFirstProviders.length
}
var offset=totalElements - alreadyShownElements;
hoveredForecastIndex = hoveredForecastIndex + offset
}
}
}
return hoveredForecastIndex
}
}, getPanoScrollPosition: function getPanoScrollPosition() {
var scrollPosition=0;
var panoElem=document.getElementById('mainPanorama');
if (panoElem) {
var panoControl=panoElem.winControl;
if (panoControl && panoControl._panel && panoControl._panel._scrollPosition) {
scrollPosition = panoControl._panel._scrollPosition
}
}
return scrollPosition
}, createBounceEffectOnForecastElement: function createBounceEffectOnForecastElement(forecastIndex, isBounceIn) {
var ui=WeatherAppJS.Utilities.UI;
var layoutState=Windows.UI.ViewManagement.ApplicationView.value;
if (layoutState === Windows.UI.ViewManagement.ApplicationViewState.fullScreenPortrait || ui.isLayoutVertical()) {
var pDailyModuleFirstProvider=document.querySelectorAll(".pDailyModuleFirstProvider");
if (pDailyModuleFirstProvider) {
var pCurrentDailyModule=pDailyModuleFirstProvider[forecastIndex];
ui.bounceInOutElement(pCurrentDailyModule, isBounceIn)
}
}
else {
var dailyModuleFirstProviders=document.querySelectorAll(".dailyModuleFirstProvider");
if (dailyModuleFirstProviders) {
var currentDailyModule=dailyModuleFirstProviders[forecastIndex];
ui.bounceInOutElement(currentDailyModule, isBounceIn)
}
var dailyPrecipWrapper=document.querySelectorAll(".precipWrapper");
if (dailyPrecipWrapper) {
var currentPrecip=dailyPrecipWrapper[forecastIndex];
ui.bounceInOutElement(currentPrecip, isBounceIn)
}
}
}, attachClickHandlerForForecast: function attachClickHandlerForForecast(element, locationID, childId) {
var ui=WeatherAppJS.Utilities.UI;
var common=WeatherAppJS.Utilities.Common;
if (element) {
element.onmspointerdown = function(e) {
if (e.button && (e.button === 1 || e.button === 2)) {
return
}
var forecastIndex=common.isNumeric(childId) ? childId : ui.getHoveredForecastIndex(e);
if (forecastIndex !== undefined && forecastIndex !== null) {
ui.createBounceEffectOnForecastElement(forecastIndex, true)
}
};
(function(locID, numClusters) {
element.onmspointerup = function(e) {
PlatformJS.execDeferredNavigate(function() {
if (e.button && (e.button === 1 || e.button === 2)) {
return
}
var forecastIndex=common.isNumeric(childId) ? childId : ui.getHoveredForecastIndex(e);
if (forecastIndex === undefined || forecastIndex === null || forecastIndex >= ui._totalDailyForecasts) {
return
}
ui.createBounceEffectOnForecastElement(forecastIndex, false);
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NumDailyForecastClick");
WeatherAppJS.Utilities.Instrumentation.incrementInt32Array("NumDailyDrilldownDayIndexTapped", forecastIndex, 10);
WeatherAppJS.Utilities.Instrumentation.logDayDrillDownDayClick(locID, forecastIndex);
var clusterWidth=ui.getDailyDrilldownClusterWidth();
WinJS.Navigation.navigate({
fragment: "/panoramas/dailyforecast/dailyForecast.html", page: "WeatherAppJS.DailyForecast"
}, {
locID: locID, scrollPosition: clusterWidth * forecastIndex, count: numClusters
})
})
}
})(locationID, ui._totalDailyForecasts);
element.onmspointerout = function(e) {
if (e.button && (e.button === 1 || e.button === 2)) {
return
}
var relatedTarget=e ? e.relatedTarget : null;
if (relatedTarget && (relatedTarget.className === "hoverEffect" || relatedTarget.className === "phoverEffect")) {
return
}
var forecastIndex=common.isNumeric(childId) ? childId : ui.getHoveredForecastIndex(e);
if (forecastIndex === undefined || forecastIndex === null) {
ui.toggleForecastHoverOverlay(forecastIndex, false);
return
}
ui.createBounceEffectOnForecastElement(forecastIndex, false);
ui.toggleForecastHoverOverlay(forecastIndex, false)
}
}
}, attachFocusHandlerForDailyForecast: function attachFocusHandlerForDailyForecast(dailyForecastNode, index, locationID) {
var ui=WeatherAppJS.Utilities.UI;
if (dailyForecastNode && locationID) {
if (!index) {
index = 0
}
(function(nodeIndex) {
dailyForecastNode.onfocus = function() {
ui.toggleForecastHoverOverlay(nodeIndex, true)
}
})(index);
(function(nodeIndex, locID, totalClusters) {
dailyForecastNode.onkeydown = function(e) {
PlatformJS.execDeferredNavigate(function() {
if (e.keyCode && (e.keyCode === WinJS.Utilities.Key.enter || e.keyCode === WinJS.Utilities.Key.space)) {
ui.toggleForecastHoverOverlay(nodeIndex, true);
ui.createBounceEffectOnForecastElement(nodeIndex, true);
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NumDailyForecastClick");
WeatherAppJS.Utilities.Instrumentation.incrementInt32Array("NumDailyDrilldownDayIndexTapped", nodeIndex, 10);
WeatherAppJS.Utilities.Instrumentation.logDayDrillDownDayClick(locID, parseInt(nodeIndex));
var clusterWidth=ui.getDailyDrilldownClusterWidth();
WinJS.Navigation.navigate({
fragment: "/panoramas/dailyforecast/dailyForecast.html", page: "WeatherAppJS.DailyForecast"
}, {
locID: locID, scrollPosition: clusterWidth * nodeIndex, count: totalClusters
})
}
})
}
})(index, locationID, ui._totalDailyForecasts);
dailyForecastNode.onblur = function() {
ui.toggleForecastHoverOverlay(index, false)
}
}
}, isLayoutVertical: function isLayoutVertical(currentScreenWidth) {
var screenWidth=currentScreenWidth ? currentScreenWidth : window.innerWidth;
if (screenWidth <= 1360) {
return true
}
return false
}, _isDailyForecastScrolled: false, _totalDailyForecastsShown: 0, _totalDailyForecasts: 0, _historicDataDailyDrilldownHeight: 0, toggleForecastHoverOverlay: function toggleForecastHoverOverlay(index, show) {
var ui=WeatherAppJS.Utilities.UI;
if (index === undefined) {
return
}
var layoutState=Windows.UI.ViewManagement.ApplicationView.value;
var overlays=null;
if (layoutState === Windows.UI.ViewManagement.ApplicationViewState.fullScreenPortrait || ui.isLayoutVertical()) {
overlays = document.querySelectorAll('.pDailyModuleFirstProvider')
}
else {
var overlayContainer=document.querySelector('.overlayContainer');
if (overlayContainer) {
overlays = overlayContainer.querySelectorAll('.overlay')
}
}
if (overlays && overlays[index]) {
if (show) {
WinJS.Utilities.addClass(overlays[index], 'hoverEffect')
}
else {
WinJS.Utilities.removeClass(overlays[index], 'hoverEffect')
}
}
}, hideAllForecastOverlays: function hideAllForecastOverlays() {
var layoutState=Windows.UI.ViewManagement.ApplicationView.value;
var overlays=null;
if (layoutState === Windows.UI.ViewManagement.ApplicationViewState.fullScreenPortrait || WeatherAppJS.Utilities.UI.isLayoutVertical()) {
overlays = document.querySelectorAll('.pDailyModuleFirstProvider')
}
else {
overlays = document.querySelectorAll('.overlay')
}
for (var i=0; i < overlays.length; i++) {
if (overlays[i]) {
WinJS.Utilities.removeClass(overlays[i], 'hoverEffect')
}
}
}, bounceInOutElement: function bounceInOutElement(element, isBounceIn) {
if (element) {
if (isBounceIn) {
WinJS.UI.Animation.pointerDown(element)
}
else {
WinJS.UI.Animation.pointerUp(element)
}
}
}, _getOffset: function _getOffset(forecastTables) {
var offset='';
var maxChildren=0;
for (var i=0, j=forecastTables.length; i < j; i++) {
var numCurrentChildren=forecastTables[i].childNodes.length - 1;
if (numCurrentChildren > maxChildren) {
maxChildren = numCurrentChildren
}
}
var singleElemOffset=152;
var currentlyShownChildrenNum=WeatherAppJS.Utilities.UI._totalDailyForecastsShown;
offset = ((maxChildren - currentlyShownChildrenNum) * singleElemOffset) + 'px';
return {
offset: offset, count: currentlyShownChildrenNum
}
}, _windowHeight: 0, getDailyDrilldownClusterWidth: function getDailyDrilldownClusterWidth() {
var layoutState=Windows.UI.ViewManagement.ApplicationView.value;
var clusterWidth=1220;
if (layoutState === Windows.UI.ViewManagement.ApplicationViewState.fullScreenPortrait || WeatherAppJS.Utilities.UI.isLayoutVertical()) {
var screenHeight=WinJS.Utilities.getTotalHeight(document.getElementById('platformPageArea'));
if (screenHeight > 805) {
clusterWidth = 680
}
}
return clusterWidth
}, ChangeDisplayUnitonClick: function ChangeDisplayUnitonClick(e) {
PlatformJS.execDeferredNavigate(function() {
var useTianQi=Platform.Utilities.Globalization.isFeatureEnabled("UseTianQi");
if (useTianQi) {
return
}
if (e.keyCode && (e.keyCode !== WinJS.Utilities.Key.enter && e.keyCode !== WinJS.Utilities.Key.space)) {
return
}
var defUnit=WeatherAppJS.SettingsManager.getDisplayUnit();
if (defUnit === "F") {
CommonJS.dismissAllEdgies();
WeatherAppJS.SettingsManager.setDisplayUnitAsync('C', "Hero").then()
}
else {
CommonJS.dismissAllEdgies();
WeatherAppJS.SettingsManager.setDisplayUnitAsync('F', "Hero").then()
}
})
}, AnimateForecastSlide: function AnimateForecastSlide(locationId, direction, animationRequired, template) {
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NumMoreDaysClick");
animationRequired = (animationRequired !== false) ? true : false;
if (animationRequired) {
var eventAttr={location: WeatherAppJS.GeocodeCache.getLocation(locationId).getFullDisplayName()};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Hero", "More Days Forecast", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr))
}
if (!template) {
template = document
}
var forecastTables=template.querySelectorAll('.animateSlide');
var overlayViewport=template.querySelector(".overlayViewport");
var winjsUtilities=WinJS.Utilities;
var uiUtilities=WeatherAppJS.Utilities.UI;
var isDailyDrilldownEnabled=uiUtilities.isDailyDrilldownEnabled(locationId);
if (forecastTables) {
var nextFocusItem=0;
var windowDirection=WeatherAppJS.Utilities.Common.getDirection();
var offsetList=uiUtilities._getOffset(forecastTables);
var maxOffset=offsetList.offset;
var offset="";
var buttonState1="block";
var buttonState2="none";
var animateButton=template.querySelector(".forecastSlider .forecastAnimateButton");
var leftButtonClass="buttonLeft";
var rightButtonClass="buttonRight";
if (!direction) {
direction = winjsUtilities.hasClass(animateButton, leftButtonClass) ? "right" : "left"
}
var resultClass=(direction && direction === "right") ? rightButtonClass : leftButtonClass;
if (direction === "left") {
if (windowDirection === "rtl") {
offset = maxOffset
}
else {
offset = '-' + maxOffset
}
uiUtilities._isDailyForecastScrolled = true;
var wrapper=template.querySelectorAll(".dailyModuleFirstProvider");
var totalCount=wrapper.length;
nextFocusItem = totalCount - uiUtilities._totalDailyForecastsShown
}
else if (direction === "right") {
offset = "0px";
uiUtilities._isDailyForecastScrolled = false
}
if (animationRequired) {
WinJS.UI.executeTransition(forecastTables, {
property: '-ms-transform', delay: 0, duration: 1000, timing: "ease-out", to: "translateX(" + offset + ")"
}).then(function() {
if (isDailyDrilldownEnabled) {
uiUtilities.hideAllForecastOverlays();
var dailyModuleFirstProvider=template.querySelectorAll(".dailyModuleFirstProvider");
if (dailyModuleFirstProvider && dailyModuleFirstProvider[nextFocusItem]) {
dailyModuleFirstProvider[nextFocusItem].focus()
}
}
})
}
else {
for (var sliderIndex=0; sliderIndex < forecastTables.length; sliderIndex++) {
forecastTables[sliderIndex].style['-ms-transform'] = "translateX(" + offset + ")"
}
if (isDailyDrilldownEnabled) {
uiUtilities.hideAllForecastOverlays()
}
}
if (animateButton) {
winjsUtilities.removeClass(animateButton, leftButtonClass);
winjsUtilities.removeClass(animateButton, rightButtonClass);
winjsUtilities.addClass(animateButton, resultClass)
}
var seeMoreText=template.querySelector('.weatherDotComSeeMoreText');
var dailyModule=null;
if (seeMoreText) {
dailyModule = seeMoreText.parentNode.parentNode.parentNode;
var dailyConditionsDefaultShown=uiUtilities.getDefaultDailyConditionsTotal();
var showFullAttribution=false;
if (dailyConditionsDefaultShown === 5) {
if ((dailyModule.childNodes.length - 1) > dailyConditionsDefaultShown) {
showFullAttribution = true
}
}
else {
if ((dailyModule.childNodes.length - 1) >= dailyConditionsDefaultShown) {
showFullAttribution = true
}
else {
showFullAttribution = false
}
}
if (direction === "left" && showFullAttribution) {
seeMoreText.innerText = WeatherAppJS.Utilities.Common.getWeatherDotComSeeMoreText()
}
else if (direction === "right" && dailyModule.childNodes.length > dailyConditionsDefaultShown) {
seeMoreText.innerText = PlatformJS.Services.resourceLoader.getString("SeeMoreTruncatedText")
}
uiUtilities.setSeeMoreStatus(template, seeMoreText, WeatherAppJS.SettingsManager.isCCMinimized())
}
uiUtilities.setCCAriaLabels(template);
if (isDailyDrilldownEnabled) {
WeatherAppJS.Utilities.TabIndexManager.setTabIndexOnDailyConditions(template)
}
}
}, _getCCOffsetForPortrait: function _getCCOffsetForPortrait(template, forceMinimized) {
if (!template) {
template = document
}
var winjsUtilities=WinJS.Utilities;
var windowDirection=WeatherAppJS.Utilities.Common.getDirection();
var buttonState1="block";
var buttonState2="none";
var animateButton=template.querySelector(".portraitSliders .forecastAnimateButton");
var leftButtonClass="buttonLeft";
var rightButtonClass="buttonRight";
var isMinimized=forceMinimized ? true : WeatherAppJS.SettingsManager.isCCMinimized();
var direction='';
var resultClass=null;
resultClass = (isMinimized) ? rightButtonClass : leftButtonClass;
direction = (isMinimized) ? "right" : "left";
if (animateButton) {
winjsUtilities.removeClass(animateButton, leftButtonClass);
winjsUtilities.removeClass(animateButton, rightButtonClass);
winjsUtilities.addClass(animateButton, resultClass)
}
var maxProviderOffset='225px';
var maxCCKeyValueOffset='250px';
var offset={};
if (direction === "left") {
offset["maxProviderOffset"] = '0px';
offset["maxCCKeyValueOffset"] = '0px'
}
else if (direction === "right") {
if (windowDirection === "rtl") {
offset["maxProviderOffset"] = maxProviderOffset;
offset["maxCCKeyValueOffset"] = maxCCKeyValueOffset
}
else {
offset["maxProviderOffset"] = '-' + maxProviderOffset;
offset["maxCCKeyValueOffset"] = '-' + maxCCKeyValueOffset
}
}
return offset
}, AnimatePortraitCurrentConditionsSlide: function AnimatePortraitCurrentConditionsSlide() {
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NumMultiProviderClick");
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Hero", "Multi Provider Forecast", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0);
var uiUtilities=WeatherAppJS.Utilities.UI;
var ccElem=document.querySelector(".bigTempWrapper");
var isMinimized=WeatherAppJS.SettingsManager.isCCMinimized();
if (isMinimized) {
WeatherAppJS.SettingsManager.setIsCCMinimizedAsync(false).then();
ccElem.setAttribute("aria-describedby", "ccExpanded")
}
else {
WeatherAppJS.SettingsManager.setIsCCMinimizedAsync(true).then();
ccElem.removeAttribute("aria-describedby")
}
var offset=uiUtilities._getCCOffsetForPortrait();
var animationContainer=document.querySelector('.animationContainer');
if (animationContainer) {
animationContainer.style.overflowY = 'hidden';
if (offset.maxProviderOffset === "0px") {
animationContainer.style.width = uiUtilities.maximizedAnimationContainerWidth
}
}
var tables=document.querySelectorAll('.portraitCCSlide');
if (tables) {
WinJS.UI.executeTransition(tables, {
property: '-ms-transform', delay: 0, duration: 500, timing: "ease-out", to: "translateX(" + offset['maxProviderOffset'] + ")"
}).then(function() {
if (animationContainer) {
animationContainer.style.overflowY = 'auto';
if (offset.maxProviderOffset !== "0px") {
animationContainer.style.width = uiUtilities.minimizedAnimationContainerWidth
}
}
})
}
var ccKeyValueTable=document.querySelectorAll('.conditionsCollection');
if (ccKeyValueTable) {
WinJS.UI.executeTransition(ccKeyValueTable, {
property: '-ms-transform', delay: 0, duration: 500, timing: "ease-out", to: "translate(" + offset['maxCCKeyValueOffset'] + ", 25px)"
}).then()
}
uiUtilities.setSecondaryProviderLinkStatus(document, !isMinimized);
uiUtilities.setSeeMoreStatus(document, null, !isMinimized);
uiUtilities.setCCAriaLabels(document)
}, AnimateCurrentConditionsSlide: function AnimateCurrentConditionsSlide(event) {
if (event) {
if (event.target && event.target.nodeName === "A") {
return
}
}
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NumMultiProviderClick");
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Hero", "Multi Provider Forecast", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0);
var uiUtilities=WeatherAppJS.Utilities.UI;
var ccSliders=document.querySelectorAll('.ccSlider1');
var ccOffset="";
var dcSliders=document.querySelectorAll('.ccSlider2');
var dcOffset="";
if (ccSliders && dcSliders) {
var ccElem=document.querySelector(".bigTempWrapper");
var buttonState1="block";
var buttonState2="none";
var isMinimized=WeatherAppJS.SettingsManager.isCCMinimized();
if (!isMinimized) {
ccOffset = "155px";
dcOffset = "155px";
WeatherAppJS.SettingsManager.setIsCCMinimizedAsync(true).then();
if (ccElem) {
ccElem.removeAttribute("aria-describedby")
}
}
else {
ccOffset = (WeatherAppJS.Utilities.UI.hasReducedCCList) ? "80px" : "25px";
dcOffset = "25px";
WeatherAppJS.SettingsManager.setIsCCMinimizedAsync(false).then();
ccElem.setAttribute("aria-describedby", "ccExpanded")
}
uiUtilities.toggleHeroButtons(!isMinimized);
uiUtilities.setSecondaryProviderLinkStatus(document, !isMinimized);
uiUtilities.setSeeMoreStatus(document, null, !isMinimized);
WinJS.UI.executeTransition(ccSliders, {
property: '-ms-transform', delay: 0, duration: 500, timing: "ease-out", to: "translateY(" + ccOffset + ")"
}).done();
WinJS.UI.executeTransition(dcSliders, {
property: '-ms-transform', delay: 0, duration: 500, timing: "ease-out", to: "translateY(" + dcOffset + ")"
}).done()
}
uiUtilities.setCCAriaLabels(document)
}, toggleStickyEdgy: function toggleStickyEdgy(edgy, show) {
if (edgy) {
if (show) {
edgy.sticky = true;
if (edgy.hidden) {
edgy.show()
}
}
else {
edgy.sticky = false;
if (!edgy.hidden) {
edgy.hide()
}
}
}
}, toggleShowButton: function toggleShowButton(b, show) {
if (b) {
if (show) {
b.style.display = ""
}
else {
b.style.display = "none"
}
}
}, setHeroClusterState: function setHeroClusterState(layoutState, template, forceMinimized, currentScreenWidth) {
if (!template) {
template = document
}
var screenWidth=currentScreenWidth ? currentScreenWidth : window.innerWidth;
var currentConditionsCluster=template.querySelector('.currentConditions');
if (currentConditionsCluster) {
var uiUtilities=WeatherAppJS.Utilities.UI;
var conditionsCollection=template.querySelector('.conditionsCollection');
var isMinimized=forceMinimized ? true : WeatherAppJS.SettingsManager.isCCMinimized();
if (layoutState === Windows.UI.ViewManagement.ApplicationViewState.fullScreenPortrait || uiUtilities.isLayoutVertical(screenWidth)) {
var offset=uiUtilities._getCCOffsetForPortrait(template, forceMinimized);
var pSliders=template.querySelectorAll('.portraitCCSlide');
for (var i=0; i < pSliders.length; i++) {
pSliders[i].style['-ms-transform'] = "translateX( " + offset['maxProviderOffset'] + ")"
}
var pCCSliders=template.querySelectorAll('.ccSlider1');
for (var pSliderIndex=0; pSliderIndex < pCCSliders.length; pSliderIndex++) {
pCCSliders[pSliderIndex].style['-ms-transform'] = "translateY(25px)"
}
if (isMinimized) {
if (conditionsCollection) {
conditionsCollection.style['-ms-transform'] = "translateX(" + offset['maxCCKeyValueOffset'] + ")"
}
}
uiUtilities.toggleHeroButtons(isMinimized, template)
}
else if (layoutState === Windows.UI.ViewManagement.ApplicationViewState.filled || layoutState === Windows.UI.ViewManagement.ApplicationViewState.fullScreenLandscape) {
var ccSliders=template.querySelectorAll('.ccSlider1');
var dcSliders=template.querySelectorAll('.ccSlider2');
if (isMinimized) {
for (var sliderIndex=0; sliderIndex < ccSliders.length; sliderIndex++) {
ccSliders[sliderIndex].style['-ms-transform'] = "translateY(155px)"
}
}
else {
for (var sliderIndex=0; sliderIndex < ccSliders.length; sliderIndex++) {
if (uiUtilities.hasReducedCCList) {
ccSliders[sliderIndex].style['-ms-transform'] = "translateY(80px)"
}
else {
ccSliders[sliderIndex].style['-ms-transform'] = "translateY(25px)"
}
}
for (var dcSliderIndex=0; dcSliderIndex < dcSliders.length; dcSliderIndex++) {
dcSliders[dcSliderIndex].style['-ms-transform'] = "translateY(25px)"
}
}
if (conditionsCollection) {
if (uiUtilities.hasReducedCCList) {
conditionsCollection.style['-ms-transform'] = "translate(0px 155px)"
}
else {
conditionsCollection.style['-ms-transform'] = "translate(0px 25px)"
}
}
uiUtilities.toggleHeroButtons(isMinimized, template)
}
uiUtilities.setSecondaryProviderLinkStatus(template, isMinimized);
uiUtilities.setCCAriaLabels(template, screenWidth)
}
}, adjustHeroClusterForResolution: function adjustHeroClusterForResolution(template, locID, width) {
if (!template) {
template = document
}
var currentConditionsCluster=template.querySelector('.currentConditions');
if (currentConditionsCluster) {
var wrapper=template.querySelector('.dailyModuleWrapper');
var precipWrapper=template.querySelector('.dailyPrecipWrapper');
var precipContainer=template.querySelector('.precipContainer');
var otherProvidersWrapper=template.querySelector('.otherProvidersWrapper');
var overlayViewport=template.querySelector('.overlayViewport');
var animateButton=template.querySelector('.dailyConditionsAnimateButton');
var screenWidth=width ? width : window.innerWidth;
var totalDaysVisible=0;
if (screenWidth === 1366) {
totalDaysVisible = 5
}
else {
var availableWidth=(screenWidth * 0.87) - (60 + 120 + 252);
totalDaysVisible = Math.floor(availableWidth / 152)
}
var ui=WeatherAppJS.Utilities.UI;
if (!ui.showLimitedExperience(locID)) {
var geoLoc=WeatherAppJS.GeocodeCache.getLocation(locID);
var isSkiLocation=geoLoc.isSkiLocation;
var isTianqiLocation=geoLoc.isTianQiSupportedLocation();
var viewState=Windows.UI.ViewManagement.ApplicationView.value;
ui.setHeroClusterState(Windows.UI.ViewManagement.ApplicationView.value, template, (isSkiLocation || isTianqiLocation), screenWidth)
}
ui._totalDailyForecastsShown = (totalDaysVisible >= ui._totalDailyForecasts) ? ui._totalDailyForecasts : totalDaysVisible;
var translateDirection="right";
ui.AnimateForecastSlide(locID, translateDirection, false, template);
var sliderButton=template.querySelector('.forecastSlider');
if (totalDaysVisible >= ui._totalDailyForecasts) {
totalDaysVisible = ui._totalDailyForecasts;
if (sliderButton) {
sliderButton.style.display = "none"
}
}
else {
if (sliderButton) {
sliderButton.style.display = "block"
}
}
var finalWidth=152 * totalDaysVisible;
wrapper.style.width = finalWidth + 'px';
precipWrapper.style.width = finalWidth + 'px';
precipContainer.style.width = finalWidth + 'px';
otherProvidersWrapper.style.width = finalWidth + 'px';
overlayViewport.style.width = finalWidth + 'px';
var providerSliderDiv=template.querySelector('.providerSlider');
var windowDirection=WeatherAppJS.Utilities.Common.getDirection();
if (windowDirection === "rtl") {
providerSliderDiv.style.right = finalWidth + 267 + 'px'
}
else {
providerSliderDiv.style.left = finalWidth + 267 + 'px'
}
}
}, setCCAriaLabels: function setCCAriaLabels(template, screenWidth) {
var viewState=Windows.UI.ViewManagement.ApplicationViewState;
var layoutState=Windows.UI.ViewManagement.ApplicationView.value;
var resourceLoader=CommonJS.resourceLoader;
var windowDirection=WeatherAppJS.Utilities.Common.getDirection();
var isMinimized=WeatherAppJS.SettingsManager.isCCMinimized();
var dailyConditions=null;
var utilities=WinJS.Utilities;
if (!template) {
template = document
}
if (layoutState === viewState.fullScreenPortrait || WeatherAppJS.Utilities.UI.isLayoutVertical(screenWidth)) {
var pProviderButton=template.querySelector(".portraitSliders .forecastAnimateButton");
if (pProviderButton) {
var pProviderAriaText=isMinimized ? "moreDailyConditionsAriaText" : "lessDailyConditionsAriaText";
pProviderButton.setAttribute("aria-label", resourceLoader.getString(pProviderAriaText))
}
dailyConditions = template.querySelectorAll(".pDailyModuleFirstProvider")
}
else if (layoutState === viewState.filled || layoutState === viewState.fullScreenLandscape) {
var providerButton=template.querySelector(".providerSlider .dailyConditionsAnimateButton");
if (providerButton) {
var providerAriaText=isMinimized ? "moreDailyConditionsAriaText" : "lessDailyConditionsAriaText";
providerButton.setAttribute("aria-label", resourceLoader.getString(providerAriaText))
}
var forecastButton=template.querySelector(".forecastSlider .forecastAnimateButton");
if (forecastButton) {
var direction=utilities.hasClass(forecastButton, windowDirection === "ltr" ? "buttonLeft" : "buttonRight");
var forecastAriaText=direction ? "prevDailyConditionsDataText" : "nextDailyConditionsDataText";
forecastButton.setAttribute("aria-label", resourceLoader.getString(forecastAriaText))
}
dailyConditions = template.querySelectorAll(".dailyModuleFirstProvider")
}
if (dailyConditions) {
var ariaKey=isMinimized ? "data-ariatext" : "data-ariatextExpanded";
var ariaLabel="";
for (var index=0, len=dailyConditions.length; index < len; index++) {
ariaLabel = dailyConditions[index].getAttribute(ariaKey);
dailyConditions[index].setAttribute("aria-label", ariaLabel)
}
}
}, toggleHeroButtons: function toggleHeroButtons(isMinimized, template) {
if (!template) {
template = document
}
var winjsUtilities=WinJS.Utilities;
var animateButton=template.querySelector(".dailyConditionsAnimateButton");
var buttonUpClass="buttonUp";
var buttonDownClass="buttonDown";
if (animateButton) {
winjsUtilities.removeClass(animateButton, buttonUpClass);
winjsUtilities.removeClass(animateButton, buttonDownClass);
winjsUtilities.addClass(animateButton, isMinimized ? buttonDownClass : buttonUpClass)
}
}, _hourlyScrollDetectTimer: null, getDefaultDailyConditionsTotal: function getDefaultDailyConditionsTotal() {
var dailyConditionsDisplayTotal=5;
return dailyConditionsDisplayTotal
}, setHourlyHeaderCellWidth: function setHourlyHeaderCellWidth(hourlyHeaderCellElem, elementId) {
if (hourlyHeaderCellElem) {
var hourlyHeaderCellWidth=WeatherAppJS.Utilities.UI.getPixelWidthFromString(hourlyHeaderCellElem.innerText, elementId);
hourlyHeaderCellElem.style.width = hourlyHeaderCellWidth
}
}, getPixelWidthFromString: function getPixelWidthFromString(str, id, withoutUnit) {
var stringId=id + "Width" + str.length;
var pixelWidth=PlatformJS.BootCache.instance.getEntry(stringId, function() {
return null
});
if (pixelWidth) {
return pixelWidth
}
else {
var ui=WeatherAppJS.Utilities.UI;
if (ui[stringId]) {
return ui[stringId]
}
var elem=document.querySelector('#' + stringId);
if (!elem) {
elem = document.createElement('div');
elem.id = id;
var body=document.getElementsByTagName('body')[0];
body.appendChild(elem);
elem.innerText = str
}
ui[stringId] = (withoutUnit) ? (elem.clientWidth + 1) : (elem.clientWidth + 1) + 'px';
PlatformJS.BootCache.instance.addOrUpdateEntry(stringId, ui[stringId]);
return ui[stringId]
}
}, setForecastNodeDisplayState: function setForecastNodeDisplayState(template, showDailyConditionsProvider, showLimitedExperience, displayProviderUrl, dailyForecastIndex, isSkiPano) {
if (template) {
var forecastNode=template.querySelector('.forecastProvider');
if (forecastNode) {
if (showDailyConditionsProvider) {
if (!showLimitedExperience || isSkiPano) {
forecastNode.style.display = "none"
}
else if (dailyForecastIndex === 0) {
forecastNode.innerHTML = displayProviderUrl;
forecastNode.style.display = "block"
}
else if (showLimitedExperience && dailyForecastIndex > 0) {
forecastNode.innerHTML = ''
}
}
else {
forecastNode.style.display = "none"
}
}
}
}, setForecastNodeAriaLabel: function setForecastNodeAriaLabel(node, isMinimized, showLimitedExperience, ariaTextValues) {
if (node) {
var utilities=WinJS.Utilities;
utilities.data(node).ariaText = ariaTextValues.ariaText;
utilities.data(node).ariaTextExpanded = ariaTextValues.ariaTextExpanded;
if (isMinimized || showLimitedExperience) {
node.setAttribute("aria-label", ariaTextValues.ariaText)
}
else {
node.setAttribute("aria-label", ariaTextValues.ariaTextExpanded)
}
}
}, fadeInAsync: function fadeInAsync(nodeList, durationOfAnimation) {
if (nodeList) {
if (!durationOfAnimation) {
durationOfAnimation = 500
}
return WinJS.UI.executeTransition(nodeList, {
property: 'opacity', delay: 0, duration: durationOfAnimation, timing: "linear", from: 0, to: 1
})
}
}, isDailyDrilldownEnabled: function isDailyDrilldownEnabled(locationId) {
if (!WeatherAppJS.SettingsManager.isFRE() && WeatherAppJS.LocationsManager.getDefaultLocation() && !PlatformJS.mainProcessManager.retailModeEnabled) {
if (locationId) {
var locationObj=WeatherAppJS.LocationsManager.getLocation(locationId);
var cc=locationObj ? locationObj.getCurrentConditions() : null;
if (cc && cc.IsDailyDrilldownEnabled) {
var isEnabledInConfig=WeatherAppJS.WarmBoot.Cache.isFeatureEnabled("DailyDrilldownPanorama");
if (isEnabledInConfig) {
return true
}
}
}
}
return false
}, fetchReducedHourlyForecastData: function fetchReducedHourlyForecastData() {
var getReducedHourlyDataConfig=PlatformJS.Services.appConfig.getBool("FetchReducedHourlyData");
if (getReducedHourlyDataConfig) {
var currentArchType=Windows.ApplicationModel.Package.current.id.architecture;
var archObject=Windows.System.ProcessorArchitecture;
if ((currentArchType === archObject.ARM) || (currentArchType === archObject.arm)) {
var isHighRes=WeatherAppJS.Utilities.UI.isHighRes();
var getFullHourlyDataForHighRes=PlatformJS.Services.appConfig.getBool("FetchFullHourlyDataForHighRes");
if (isHighRes && getFullHourlyDataForHighRes) {
return 1
}
else {
return 0
}
}
return 1
}
else {
return 1
}
}, _isPerfOptimizationEnabled: null, isPerfOptimizedExperience: function isPerfOptimizedExperience() {
if (this._isPerfOptimizationEnabled === null) {
var allowReducedExperience=PlatformJS.Services.appConfig.getBool("allowReducedExperience");
var currentArchType=Windows.ApplicationModel.Package.current.id.architecture;
var archObject=Windows.System.ProcessorArchitecture;
this._isPerfOptimizationEnabled = allowReducedExperience && ((currentArchType === archObject.ARM) || (currentArchType === archObject.arm))
}
return this._isPerfOptimizationEnabled
}, fetchReducedMapsData: function fetchReducedMapsData() {
var getReducedMapsDataConfig=PlatformJS.Services.appConfig.getBool("FetchReducedMapsData");
if (getReducedMapsDataConfig && WeatherAppJS.Utilities.UI.isPerfOptimizedExperience()) {
return 0
}
else {
return 1
}
}, isHighRes: function isHighRes() {
var isHighRes=null;
var heightToCheck=768;
var viewState=Windows.UI.ViewManagement.ApplicationViewState;
var layoutState=Windows.UI.ViewManagement.ApplicationView.value;
if (layoutState === viewState.fullScreenPortrait) {
heightToCheck = 1366
}
isHighRes = (window.screen.height > heightToCheck) ? true : false;
return isHighRes
}, dismissPlatformFlyout: function dismissPlatformFlyout() {
var platformFlyout=document.getElementById("platformFlyout");
if (platformFlyout && platformFlyout.winControl) {
platformFlyout.winControl.hide()
}
}, openInAppHelp: function openInAppHelp() {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(Microsoft.Bing.AppEx.Telemetry.ImpressionNavMethod.appBar);
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.ActionContext.appBar, "Help button", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0);
CommonJS.Settings.onHelpCmd()
}, addNewHomeLoc: function addNewHomeLoc() {
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NumChangeHomeAdd");
var eventAttr={currentHome: WeatherAppJS.SettingsManager.getDefaultLocation().getFullDisplayName()};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Change Home Flyout", "Add Location", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr));
if (WeatherAppJS.SettingsManager.isFavoritesMaxLimitReached()) {
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString("MaxFavoritesLimitReached"), false)
}
else if (WeatherAppJS.Networking.internetAvailable === false) {
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString("NoInternetConnectionError"), false)
}
else {
WeatherAppJS.Search.showQuickSearchDialog("mainPanorama", WeatherAppJS.Search.Actions.SetDefault, WeatherAppJS.Search.onAddLocationFlyoutHide);
var addButton=document.getElementById("SearchDialog_addButton");
if (addButton) {
addButton.innerText = PlatformJS.Services.resourceLoader.getString("ConfirmButtonTitle")
}
var title=document.querySelector('.platformSearchDialogPrompt');
if (title) {
title.innerText = PlatformJS.Services.resourceLoader.getString("ChangeHomeButtonTitle")
}
}
}, showAddLocationFlyout: function showAddLocationFlyout(locationObj, isFRE, flyoutHideCallback) {
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
WeatherAppJS.Search.showQuickSearchDialog("mainPanorama", WeatherAppJS.Search.Actions.DetectedLocationConfirm, flyoutHideCallback, locationObj, isFRE);
var searchBox=document.getElementById("SearchTextBox");
if (searchBox) {
searchBox.focus();
searchBox.value = WeatherAppJS.GeocodeCache.getFullDisplayName(locationObj.getId())
}
var addButton=document.getElementById("SearchDialog_addButton");
if (addButton) {
addButton.innerText = PlatformJS.Services.resourceLoader.getString("ConfirmButtonTitle")
}
if (isFRE) {
var title=document.querySelector('.platformSearchDialogPrompt');
if (title) {
title.innerText = PlatformJS.Services.resourceLoader.getString("SetHomeLocationTitle")
}
}
}, getMapTypesForRegion: function getMapTypesForRegion(region) {
var mapTypes=PlatformJS.Services.appConfig.getDictionary("MapTypesPerRegion");
try {
var regionData=mapTypes[region];
return JSON.parse(regionData.value)
}
catch(ex) {
return null
}
}, _allWeatherMapTypes: null, _mapTypeToIdMapping: null, _regionFetchIdToMapRegionMapping: null, _initWeatherMapTypesSubTypes: function _initWeatherMapTypesSubTypes() {
var allMapTypes=JSON.parse(WeatherAppJS.WarmBoot.Cache.getString("AllWeatherMapTypesSubTypes"));
this._allWeatherMapTypes = {};
this._mapTypeToIdMapping = {};
for (var m in allMapTypes) {
var map=allMapTypes[m];
if (map.id && map.mapType && map.mapSubTypes) {
if (!this._allWeatherMapTypes[map.id]) {
this._allWeatherMapTypes[map.id] = {};
this._mapTypeToIdMapping[map.mapType] = {}
}
for (var st in map.mapSubTypes) {
var mapSubType=map.mapSubTypes[st];
this._allWeatherMapTypes[map.id][mapSubType.id] = {
id: map.id, mapType: map.mapType, subTypeId: mapSubType.id, mapSubType: mapSubType.subType
};
this._mapTypeToIdMapping[map.mapType][mapSubType.subType] = this._allWeatherMapTypes[map.id][mapSubType.id];
if (st === "0") {
this._allWeatherMapTypes[map.id + "_default"] = {
id: map.id, mapType: map.mapType, subTypeId: mapSubType.id, mapSubType: mapSubType.subType
};
this._mapTypeToIdMapping[map.mapType + "_default"] = this._allWeatherMapTypes[map.id + "_default"]
}
}
}
}
}, getPageStateForMapType: function getPageStateForMapType(mapTypeId, mapSubTypeId) {
if (!this._allWeatherMapTypes) {
this._initWeatherMapTypesSubTypes()
}
if (mapTypeId) {
return (mapSubTypeId) ? this._allWeatherMapTypes[mapTypeId][mapSubTypeId] : this._allWeatherMapTypes[mapTypeId + "_default"]
}
}, getIdForMapTypeSubType: function getIdForMapTypeSubType(mapType, mapSubType) {
if (!this._mapTypeToIdMapping) {
this._initWeatherMapTypesSubTypes()
}
if (mapType) {
return (mapSubType) ? this._mapTypeToIdMapping[mapType][mapSubType] : this._mapTypeToIdMapping[mapType + "_default"]
}
}, getMapRegionByFetchId: function getMapRegionByFetchId(fetchId) {
if (!this._regionFetchIdToMapRegionMapping) {
this._regionFetchIdToMapRegionMapping = {};
var baseMapRegionsConfig=PlatformJS.Services.appConfig.getDictionary("BaseMapRegions");
for (var regionName in baseMapRegionsConfig) {
if (baseMapRegionsConfig.hasItem(regionName)) {
var regionData=JSON.parse(baseMapRegionsConfig[regionName].value);
this._regionFetchIdToMapRegionMapping[regionData.fetchId] = regionData
}
}
}
return this._regionFetchIdToMapRegionMapping[fetchId]
}, _isoCodeToRegionMap: null, getMapRegionDataForIsoCodeAsync: function getMapRegionDataForIsoCodeAsync(isocode) {
var that=this;
if (WeatherAppJS.Utilities.UI._isoCodeToRegionMap) {
return WinJS.Promise.wrap(WeatherAppJS.Utilities.UI._isoCodeToRegionMap[isocode])
}
else {
return that.createMapRegionToIsoCodeMappingAsync().then(function() {
if (that._isoCodeToRegionMap) {
return that._isoCodeToRegionMap[isocode]
}
}, function() {
return null
})
}
}, createMapRegionToIsoCodeMappingAsync: function createMapRegionToIsoCodeMappingAsync() {
var ui=WeatherAppJS.Utilities.UI;
var isoCodeRegionMap=ui._isoCodeToRegionMap;
if (!isoCodeRegionMap) {
var countryRegionCodesFile=PlatformJS.Services.appConfig.getString("CountryToMapRegionMappingFile");
return WinJS.xhr({url: countryRegionCodesFile}).then(function(request) {
try {
ui._isoCodeToRegionMap = JSON.parse(request.responseText);
return WinJS.Promise.wrap(null)
}
catch(ex) {
ui._isoCodeToRegionMap = {};
return WinJS.Promise.wrapError(null)
}
}, function(ex) {
ui._isoCodeToRegionMap = {};
return WinJS.Promise.wrapError(null)
})
}
else {
return WinJS.Promise.wrap(null)
}
}, _heroImageCredits: null, setCurrentHeroImageAttribution: function setCurrentHeroImageAttribution(attr) {
this._heroImageCredits = attr
}, getCurrentHeroImageAttribution: function getCurrentHeroImageAttribution() {
return this._heroImageCredits
}
});
WinJS.Namespace.define("WeatherAppJS.Services", {Utilities: AppEx.WeatherApp.Services.Utilities});
WinJS.Namespace.define("WeatherAppJS.Utilities.Common", {
_windowDirection: null, _latlongTrimValue: null, shouldUseAppexDataSource: function shouldUseAppexDataSource(locId) {
var isSpecialMarket=WeatherAppJS.WarmBoot.Cache.getBool("IsSpecialMarket");
if (isSpecialMarket) {
var locationObj=WeatherAppJS.GeocodeCache.getLocation(locId);
return locationObj.isCurrentMarketLocation()
}
return false
}, trimLatLong: function trimLatLong(value, decimalPlaces) {
var that=WeatherAppJS.Utilities.Common;
if (!that._latlongTrimValue) {
that._latlongTrimValue = WeatherAppJS.WarmBoot.Cache.getInt32("LatLongDecimalPlaces")
}
var places=(decimalPlaces) ? decimalPlaces : that._latlongTrimValue;
if (value) {
value = parseFloat(value).toFixed(places)
}
return value || ""
}, displayLastUpdatedTime: function displayLastUpdatedTime(page) {
if (((WeatherAppJS.SettingsManager.isFRE() && !WeatherAppJS.Networking.internetAvailable) || PlatformJS.mainProcessManager.retailModeEnabled)) {
page._lastUpdatedTime = null
}
page.displayLastUpdatedTime()
}, getDirection: function getDirection() {
var common=WeatherAppJS.Utilities.Common;
var direction=common._windowDirection;
if (!direction) {
common._windowDirection = window.getComputedStyle(document.body).direction
}
return common._windowDirection
}, isCurrentRegion: function isCurrentRegion(country) {
try {
var geographicRegion=new Windows.Globalization.GeographicRegion;
country = country.toUpperCase();
var nativeName=geographicRegion.nativeName.toUpperCase();
var displayName=geographicRegion.displayName.toUpperCase();
return (country === nativeName) || (country === displayName)
}
catch(Exception) {
return false
}
}, getNoDataString: function getNoDataString() {
return '--'
}, isStale: function isStale(lastUpdatedTimeInMs, freshTimeInMs) {
var currentTime=new Date;
var currentTimeInMs=currentTime.getTime();
if ((currentTimeInMs > lastUpdatedTimeInMs) && (currentTimeInMs - lastUpdatedTimeInMs >= freshTimeInMs)) {
return true
}
return false
}, formatAlertDescription: function formatAlertDescription(alertDescription) {
if (alertDescription) {
alertDescription = alertDescription.replace(/^(\s*<br \/>\s*)*/g, '')
}
return alertDescription
}, getProviderAttributionUrl: function getProviderAttributionUrl(providerName) {
var providerUrl='';
try {
if (providerName) {
var providerNameTmp=providerName.toLowerCase();
providerUrl = PlatformJS.Services.resourceLoader.getString(providerNameTmp + 'Url')
}
}
catch(err) {}
return providerUrl
}, getPresetDefaultLocation: function getPresetDefaultLocation() {
var resourceLoader=PlatformJS.Services.resourceLoader;
var presetDefaultLocation=WeatherAppJS.WarmBoot.Cache.getString("DefaultLocation");
var defaultLocation=JSON.parse(presetDefaultLocation);
var city=resourceLoader.getString(defaultLocation.city);
if (city) {
defaultLocation.city = city
}
var state=defaultLocation.state === "" ? "" : resourceLoader.getString(defaultLocation.state);
if (state) {
defaultLocation.state = state
}
defaultLocation.country = defaultLocation.countryORregion;
var country=resourceLoader.getString(defaultLocation.country);
if (country) {
defaultLocation.country = country
}
defaultLocation.fullName = [defaultLocation.city, defaultLocation.state, defaultLocation.country].join(", ");
var geoLoc=new WeatherAppJS.GeocodeLocation(defaultLocation);
WeatherAppJS.GeocodeCache.addLocation(geoLoc);
return geoLoc
}, isAppStateStale: function isAppStateStale() {
var currentTimeInMs=(new Date).getTime();
var lastSuspendTimeInMs=WeatherAppJS.SettingsManager.getLastSuspendTime();
var appStateStaleTime=WeatherAppJS.WarmBoot.Cache.getString("AppStateStaleTime");
return (lastSuspendTimeInMs && ((currentTimeInMs - lastSuspendTimeInMs) >= appStateStaleTime)) ? true : false
}, isAppDataStale: function isAppDataStale() {
var currentTimeInMs=(new Date).getTime();
var lastSuspendTimeInMs=WeatherAppJS.SettingsManager.getLastSuspendTime();
var appDataStaleTime=WeatherAppJS.WarmBoot.Cache.getString("TimeBeforeStale");
return (lastSuspendTimeInMs && ((currentTimeInMs - lastSuspendTimeInMs) >= appDataStaleTime)) ? true : false
}, getCurrentPage: function getCurrentPage() {
var page="";
try {
page = WinJS.Navigation.history.current.location.page
}
catch(e) {}
return page
}, weatherDotComRegion: null, getWeatherDotComRegion: function getWeatherDotComRegion() {
var weatherCommon=WeatherAppJS.Utilities.Common;
if (weatherCommon.weatherDotComRegion) {
return weatherCommon.weatherDotComRegion
}
var currentRegion=Windows.System.UserProfile.GlobalizationPreferences.homeGeographicRegion;
if (currentRegion) {
var regionList=PlatformJS.Services.appConfig.getList("WeatherDotComRegionList");
var regionDict=PlatformJS.Services.appConfig.getDictionary("WeatherDotComRegionsDict");
if (regionList && regionDict) {
for (var i=0; i < regionList.size; i++) {
var region=regionList[i].value;
if (region === currentRegion) {
weatherCommon.weatherDotComRegion = region;
break
}
else {
var regionValue=regionDict.getString(region);
var pos=regionValue.search(currentRegion);
if (pos !== -1) {
weatherCommon.weatherDotComRegion = region;
break
}
}
}
}
}
if (!weatherCommon.weatherDotComRegion) {
weatherCommon.weatherDotComRegion = "US"
}
return weatherCommon.weatherDotComRegion
}, isAdsAvailable: function isAdsAvailable(market) {
var adsMarkets=PlatformJS.Services.appConfig.getString("AdsMarketList");
var pos=adsMarkets.indexOf(market);
if (pos !== -1) {
return true
}
else {
return false
}
}, getWeatherDotComBaseUrl: function getWeatherDotComBaseUrl() {
var region=WeatherAppJS.Utilities.Common.getWeatherDotComRegion();
return PlatformJS.Services.appConfig.getString("WeatherDotComBaseUrl-" + region)
}, getWeatherDotComHomeUrl: function getWeatherDotComHomeUrl() {
var region=WeatherAppJS.Utilities.Common.getWeatherDotComRegion();
return PlatformJS.Services.appConfig.getString("WeatherDotComUrl-" + region)
}, getWeatherDotComSeeMoreText: function getWeatherDotComSeeMoreText() {
var seeMoreText=PlatformJS.Services.resourceLoader.getString("WeatherDotComSeeMoreText");
return seeMoreText.replace("weather.com", WeatherAppJS.Utilities.Common.getWeatherDotComBaseUrl())
}, getWeatherDotComUrl: function getWeatherDotComUrl(weatherDotComUrl, urlName) {
if (weatherDotComUrl && weatherDotComUrl.length > 0) {
var baseUrl=weatherDotComUrl.replace(/\?.*$/, '');
var locationIdIndex=baseUrl.lastIndexOf("/");
if (locationIdIndex !== -1) {
var locationId=baseUrl.substr(locationIdIndex + 1);
if (locationId) {
var urlConfigName=urlName + "-" + WeatherAppJS.Utilities.Common.getWeatherDotComRegion();
var mktUrl=PlatformJS.Services.appConfig.getString(urlConfigName);
return mktUrl.format(locationId)
}
}
}
return WeatherAppJS.Utilities.Common.getWeatherDotComHomeUrl()
}, getWeatherDotComIMapUrl: function getWeatherDotComIMapUrl(locationId) {
var appConfig=PlatformJS.Services.appConfig;
var weatherCommon=WeatherAppJS.Utilities.Common;
if (locationId) {
var mapsUrlPrefix=appConfig.getString("WeatherDotComMapsUrlPrefix-" + weatherCommon.getWeatherDotComRegion());
var mapsUrlSuffix=appConfig.getString("WeatherDotComMapsUrlSuffix-" + weatherCommon.getWeatherDotComRegion());
if (mapsUrlSuffix && mapsUrlSuffix.length > 0) {
return mapsUrlPrefix + locationId + mapsUrlSuffix
}
if (mapsUrlPrefix && mapsUrlPrefix.length > 0) {
return mapsUrlPrefix
}
}
return weatherCommon.getWeatherDotComHomeUrl()
}, cleanupPromiseStack: function cleanupPromiseStack(promises) {
if (!promises) {
return
}
while (promises.length > 0) {
var p=promises.pop();
if (p && p.cancel) {
p.cancel();
p = null
}
}
}, reinitialize: function reinitialize() {
this.weatherDotComRegion = null;
this._latlongTrimValue = null
}, instrumentLocation: function instrumentLocation(datapoint, latitude, longitude, locationName) {
var sliceParameter=PlatformJS.Services.appConfig.getInt32("LocationInstrumentationStringLength");
var trimLatLong=WeatherAppJS.Utilities.Common.trimLatLong;
latitude = (latitude) ? trimLatLong(latitude, 2) : "";
longitude = (longitude) ? trimLatLong(longitude, 2) : "";
var value=latitude + '*' + longitude + '*' + locationName;
WeatherAppJS.Utilities.Instrumentation.addString(datapoint, value.slice(0, sliceParameter))
}, navigateToMapApp: function navigateToMapApp(lat, long) {
var latLong="{0}~{1}".format(lat, long);
var mapAppUrl=PlatformJS.Services.appConfig.getString("MapAppUrl");
mapAppUrl = mapAppUrl.format(latLong);
var uri=new Windows.Foundation.Uri(mapAppUrl);
Windows.System.Launcher.launchUriAsync(uri)
}, navigateToWebView: WinJS.UI.eventHandler(function(destinationUrl, page) {
if (destinationUrl && destinationUrl !== undefined) {
var webpageArticleInfos=[];
webpageArticleInfos.push({
articleId: destinationUrl, articleType: "webpage"
});
var providerType="AppEx.Common.ArticleReader.WebpageProvider";
var providerConfiguration=PlatformJS.Collections.createStringDictionary();
providerConfiguration.insert("articleInfos", JSON.stringify({articleInfos: webpageArticleInfos}));
var state={};
state.providerType = providerType;
state.providerConfiguration = providerConfiguration;
state.initialArticleId = destinationUrl;
state.enableSharing = true;
if (state) {
PlatformJS.Navigation.navigateToChannel("WebViewArticleReader", state)
}
}
}), tryLatLongToPixel: function tryLatLongToPixel(latitude, longitude, zoomLevel) {
var mercatorLatitudeLimit=85.05112878;
var pixelX,
pixelY;
if (latitude > this.MercatorLatitudeLimit || latitude < -this.MercatorLatitudeLimit) {
return null
}
try {
var sinLatitude=Math.sin(latitude * Math.PI / 180);
pixelX = ((longitude + 180) / 360) * 256 * Math.pow(2, zoomLevel);
pixelY = (0.5 - (Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4.0 * Math.PI))) * 256 * Math.pow(2, zoomLevel);
return {
x: pixelX, y: pixelY
}
}
catch(e) {}
}, _fetchImageAsync: function _fetchImageAsync(imageSource, networkCallRequired) {
var imageUrl=imageSource.url;
var cacheId=imageSource.cacheId;
if (typeof imageUrl !== "string") {
return WinJS.Promise.wrap("")
}
else if (imageUrl.indexOf("/") === 0 || imageUrl.indexOf("ms-appdata://") === 0 || imageUrl.indexOf("ms-appx://") === 0) {
return WinJS.Promise.wrap(imageUrl)
}
else {
return PlatformJS.Utilities.fetchImage(cacheId, imageUrl, networkCallRequired)
}
}, _fetchImageFromCacheAsync: function _fetchImageFromCacheAsync(imageSource) {
var that=this;
var cacheId=imageSource.cacheId;
return PlatformJS.Cache.CacheService.getInstance(cacheId).findEntry(imageSource.url, {fileNameOnly: true}).then(function image_cache_completion(response) {
return response
})
}, fetchSingleResolutionImageAsync: function fetchSingleResolutionImageAsync(imageSource, bypassCache) {
var that=this;
if (!imageSource || !imageSource.url || !imageSource.cacheId) {
return WinJS.Promise.wrap(null)
}
var promise=(!bypassCache) ? this._fetchImageFromCacheAsync(imageSource) : WinJS.Promise.wrap(null);
return promise.then(function image_refresh(response) {
if (!response || response.isStale()) {
return that._fetchImageAsync(imageSource, null)
}
return WinJS.Promise.wrap(null)
}).then(function loadImageComplete(localUrl) {
return localUrl
})
}, prefetchImageService: null, prefetchImage: function prefetchImage(imageSource, queryServiceOptions) {
if (!imageSource || !imageSource.url || !imageSource.cacheId) {
return
}
if (!this.prefetchImageService) {
this.prefetchImageService = {}
}
if (!this.prefetchImageService[imageSource.cacheId]) {
this.prefetchImageService[imageSource.cacheId] = new Platform.ImageService(imageSource.cacheId)
}
if (!queryServiceOptions) {
queryServiceOptions = new Platform.DataServices.PrefetchQueryServiceOptions;
queryServiceOptions.priority = Platform.DataServices.QueryServicePriority.high
}
this.prefetchImageService[imageSource.cacheId].prefetchImage(imageSource.url, queryServiceOptions)
}, getSkiAttributionData: function getSkiAttributionData(currentConditionsData) {
var resourceLoader=PlatformJS.Services.resourceLoader;
var skiAttrLabel="";
var skiImageAttrText=currentConditionsData.heroImageData ? currentConditionsData.heroImageData.attribution : '';
if ((skiImageAttrText) && (skiImageAttrText !== '')) {
skiAttrLabel += '<span class="skiAttributionText">' + resourceLoader.getString("SkiDetailsImageAttribution").format(skiImageAttrText) + '</span>'
}
var skiSnowProvider=currentConditionsData.heroData ? currentConditionsData.heroData.snowProviderData : '';
if ((skiSnowProvider) && (skiSnowProvider !== '')) {
skiAttrLabel += '<span class="skiAttributionText"><span>' + resourceLoader.getString("SnowDataAttribution").format('') + '</span>';
var skiSnowProviderUrl=currentConditionsData.heroData.snowProviderDataUrl;
if (skiSnowProviderUrl) {
skiAttrLabel += '<a class="skiAttributionLink" href="' + skiSnowProviderUrl + '">' + skiSnowProvider + '</a>'
}
else {
skiAttrLabel += skiSnowProvider
}
skiAttrLabel += '</span>'
}
var skiCurrentCondProvider=(currentConditionsData.AttrProvider !== undefined) ? currentConditionsData.AttrProvider : '';
var skiForecastProvider=(currentConditionsData.dailyForecastProvider !== undefined) ? currentConditionsData.dailyForecastProvider : '';
if ((skiCurrentCondProvider !== '') && (skiForecastProvider !== '')) {
skiAttrLabel += '<span class="skiAttributionText">';
var langDirection=WeatherAppJS.Utilities.Common.getDirection();
var currentConditionProviderLink="";
var skiCurrentCondProviderUrl=(currentConditionsData.AttrProviderUrl !== undefined) ? currentConditionsData.AttrProviderUrl : '';
if (skiCurrentCondProviderUrl !== '') {
currentConditionProviderLink += '<a class="skiAttributionLink" href="' + skiCurrentCondProviderUrl + '">' + skiCurrentCondProvider + '</a>'
}
else {
currentConditionProviderLink += skiCurrentCondProvider
}
var dailyForecastProviderLink="";
var skiForecastProviderUrl=(currentConditionsData.dailyForecastProviderUrl !== undefined) ? currentConditionsData.dailyForecastProviderUrl : '';
if (skiForecastProviderUrl !== '') {
dailyForecastProviderLink += '<a class="skiAttributionLink" href="' + skiForecastProviderUrl + '">' + skiForecastProvider + '</a>'
}
else {
dailyForecastProviderLink += skiForecastProvider
}
if (skiCurrentCondProvider !== skiForecastProvider) {
skiAttrLabel += PlatformJS.Services.resourceLoader.getString('CCDailyAttribution2Providers').format(currentConditionProviderLink, dailyForecastProviderLink)
}
else {
skiAttrLabel += PlatformJS.Services.resourceLoader.getString('CCDailyAttribution1Provider').format(currentConditionProviderLink)
}
skiAttrLabel += '</span>'
}
return skiAttrLabel
}, isNumeric: function isNumeric(n) {
return !isNaN(parseFloat(n)) && isFinite(n)
}, addAd: function addAd(page, clusterPosition, category, subCategory) {
var adCluster=WeatherAppJS.Utilities.Common.getAdCluster(page, clusterPosition, category, subCategory);
if (adCluster !== null) {
page._data.splice(clusterPosition, 0, adCluster)
}
}, getAdCluster: function getAdCluster(page, clusterPosition, category, subCategory) {
var locationData=WeatherAppJS.GeocodeCache.getLocation(page._locID);
var locTagsArray=[{
key: "latitude", value: locationData.latitude
}, {
key: "longitude", value: locationData.longitude
}];
var clusterConfig={otherAdOptions: {adTags: locTagsArray}};
var appConfig=PlatformJS.Services.appConfig;
var providerId=appConfig.getString('AdProviderId');
return PlatformJS.Ads.getAdsClusterConfig(clusterConfig, clusterPosition, category, subCategory, providerId)
}, addAdsToPanoDatasource: function addAdsToPanoDatasource(page) {
var adPosition=PlatformJS.Ads.Config.instance.adManager.getPanoFrequency();
if (adPosition && adPosition.start > 0) {
var clusterPosition=adPosition.start;
var adClusterPosition=PlatformJS.Ads.getAdjustedAdClusterPosition(page._data, (clusterPosition - 1));
if (adClusterPosition > 0) {
var numClusters=page._data.length;
while (adClusterPosition <= numClusters) {
var category=(page && page._detailsImpl) ? page._detailsImpl._adCategory : "";
var subCategory=(page && page._detailsImpl) ? page._detailsImpl._adSubCategory : "";
WeatherAppJS.Utilities.Common.addAd(page, adClusterPosition, category, subCategory);
adClusterPosition = adClusterPosition + ((adPosition.repeat ? adPosition.repeat : 0) + 1)
}
}
}
}, addAllAds: function addAllAds(page) {
var that=page;
var defaultLocation=WeatherAppJS.LocationsManager.getDefaultLocation();
if (defaultLocation && !that._isPageDestroyed) {
WeatherAppJS.Utilities.Common.addAdsToPanoDatasource(page);
WinJS.UI.Fragments.renderCopy("/html/delayedTemplate.html", null).then()
}
}
});
WinJS.Namespace.define("WeatherAppJS.Utilities.Instrumentation", {
dayOfWeek: [], onClickAttribution: function onClickAttribution(attribution, type) {
var eventAttr={providerName: attribution};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, type, "Attribution", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr))
}, onClickHWFilter: function onClickHWFilter(filter, locationName) {
var eventAttr={location: locationName};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Historical Weather", filter, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr))
}, incrementInt32: function incrementInt32(datapoint) {
PlatformJS.deferredTelemetry(function() {
PlatformJS.Services.instrumentation.incrementInt32(PlatformJS.Services.appConfig.getDictionary("Instrumentation").getInt32("DataSetID"), PlatformJS.Services.appConfig.getDictionary("Instrumentation").getDictionary("DataPoints").getInt32(datapoint), 1)
})
}, addString: function addString(datapoint, value) {
PlatformJS.Services.instrumentation.addString(PlatformJS.Services.appConfig.getDictionary("Instrumentation").getInt32("NewDataSetID"), PlatformJS.Services.appConfig.getDictionary("Instrumentation").getDictionary("DataPoints").getInt32(datapoint), value)
}, logDayDrillDownDayClick: function logDayDrillDownDayClick(locID, forecastIndex) {
var eventAttr={
location: WeatherAppJS.GeocodeCache.getLocation(locID).getFullDisplayName(), dayIndex: forecastIndex, dayOfWeek: WeatherAppJS.Utilities.Instrumentation.dayOfWeek[forecastIndex]
};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Hero", "Day Drilldown Day", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr))
}, incrementInt32Array: function incrementInt32Array(datapoint, index, arraySize) {
PlatformJS.Services.instrumentation.incrementInt32Array(PlatformJS.Services.appConfig.getDictionary("Instrumentation").getInt32("DataSetID"), PlatformJS.Services.appConfig.getDictionary("Instrumentation").getDictionary("DataPoints").getInt32(datapoint), index, arraySize)
}
});
WinJS.Namespace.define("WeatherAppJS.Utilities.ThemeManager", {
getMorphedSkyCode: function getMorphedSkyCode(imgAndTheme, skycode, dayNightIndicator) {
var morphedSkyCode=dayNightIndicator ? skycode + "+" + dayNightIndicator : skycode;
var isFRE=WeatherAppJS.SettingsManager.isFRE();
if (isFRE) {
return morphedSkyCode
}
if (imgAndTheme) {
if (imgAndTheme.iconcodeMaps[morphedSkyCode]) {
return morphedSkyCode
}
else if (dayNightIndicator && imgAndTheme.iconcodeMaps[skycode]) {
return skycode
}
}
return "44"
}, getHeroImageForSkyCode: function getHeroImageForSkyCode(imgAndTheme, morphedSkyCode) {
var backgroundImageData={};
var isFRE=WeatherAppJS.SettingsManager.isFRE();
if (isFRE === true) {
backgroundImageData.image = "/images/panoramaBackgrounds/" + morphedSkyCode + ".jpg";
return backgroundImageData
}
if (imgAndTheme && imgAndTheme.iconcodeMaps[morphedSkyCode]) {
var baseUrl=imgAndTheme.imgBase;
var imageObj=imgAndTheme.iconcodeMaps[morphedSkyCode];
backgroundImageData.image = {
lowResolutionUrl: baseUrl + imageObj["BW_HERO_LOWRES"].path, highResolutionUrl: baseUrl + imageObj["BW_HERO"].path
};
backgroundImageData.imageSize = {
width: imageObj["BW_HERO"] && imageObj["BW_HERO"].w ? imageObj["BW_HERO"].w : 0, height: imageObj["BW_HERO"] && imageObj["BW_HERO"].h ? imageObj["BW_HERO"].h : 0
};
backgroundImageData.imageSizeLowRes = {
width: imageObj["BW_HERO_LOWRES"] && imageObj["BW_HERO_LOWRES"].w ? imageObj["BW_HERO_LOWRES"].w : 0, height: imageObj["BW_HERO_LOWRES"] && imageObj["BW_HERO_LOWRES"].h ? imageObj["BW_HERO_LOWRES"].h : 0
};
return backgroundImageData
}
else {
backgroundImageData.image = "/images/panoramaBackgrounds/" + morphedSkyCode + ".jpg";
return backgroundImageData
}
}, getTileImageForSkyCode: function getTileImageForSkyCode(imgAndTheme, skycode, dayNightIndicator) {
var morphedSkyCode=this.getMorphedSkyCode(imgAndTheme, skycode, dayNightIndicator);
if (imgAndTheme && imgAndTheme.iconcodeMaps[morphedSkyCode]) {
var baseUrl=imgAndTheme.imgBase;
var imageObj=imgAndTheme.iconcodeMaps[morphedSkyCode];
return 'url(' + baseUrl + imageObj["BW_TILE_PLACE"].path + ')'
}
}, setCityPageImageAttribution: function setCityPageImageAttribution(imgAndTheme, morphedSkyCode) {
if (imgAndTheme && imgAndTheme.iconcodeMaps[morphedSkyCode]) {
var imageObj=imgAndTheme.iconcodeMaps[morphedSkyCode];
var attr=imageObj["BW_HERO"] ? imageObj["BW_HERO"].attr : null;
WeatherAppJS.Utilities.UI.setCurrentHeroImageAttribution(attr)
}
}, getfocalAnchorForSkyCode: function getfocalAnchorForSkyCode(imgAndTheme, morphedSkyCode) {
var imageData={};
var anchorPoint="";
var isFRE=WeatherAppJS.SettingsManager.isFRE();
if (isFRE) {
imageData.anchorPoint = "anchorLeft";
return imageData
}
if (imgAndTheme && imgAndTheme.iconcodeMaps[morphedSkyCode]) {
var imageObj=imgAndTheme.iconcodeMaps[morphedSkyCode];
var viewManagement=Windows.UI.ViewManagement;
if (viewManagement.ApplicationView.value === viewManagement.ApplicationViewState.fullScreenPortrait) {
anchorPoint = imageObj["BW_HERO"].pap;
imageData = {
focalPoint: imageObj["BW_HERO"] && imageObj["BW_HERO"].pfp ? imageObj["BW_HERO"].pfp : null, focalPointLowRes: imageObj["BW_HERO_LOWRES"] && imageObj["BW_HERO_LOWRES"].pfp ? imageObj["BW_HERO_LOWRES"].pfp : null
}
}
else {
anchorPoint = imageObj["BW_HERO"].ap;
imageData = {
focalPoint: imageObj["BW_HERO"] && imageObj["BW_HERO"].fp ? imageObj["BW_HERO"].fp : null, focalPointLowRes: imageObj["BW_HERO_LOWRES"] && imageObj["BW_HERO_LOWRES"].fp ? imageObj["BW_HERO_LOWRES"].fp : null
}
}
}
if (!anchorPoint) {
anchorPoint = "anchorTop"
}
var windowDirection=WeatherAppJS.Utilities.Common.getDirection();
if (windowDirection === "rtl") {
if (anchorPoint === "anchorLeft") {
anchorPoint = "anchorRight"
}
else if (anchorPoint === "anchorRight") {
anchorPoint = "anchorLeft"
}
}
imageData.anchorPoint = anchorPoint;
return imageData
}, _themeClass: null, _getThemeForSkyCode: function _getThemeForSkyCode(morphedSkyCode, imgAndTheme) {
if (imgAndTheme && imgAndTheme.iconcodeMaps[morphedSkyCode]) {
var themeConfig=imgAndTheme.iconcodeMaps[morphedSkyCode];
this._themeClass = themeConfig["BW_HERO"].thmCls
}
else {
this._themeClass = "DefaultTheme"
}
return this._themeClass
}, _getThemeTypeForSkyCode: function _getThemeTypeForSkyCode(morphedSkyCode, imgAndTheme) {
if (imgAndTheme && imgAndTheme.iconcodeMaps[morphedSkyCode]) {
var themeConfig=imgAndTheme.iconcodeMaps[morphedSkyCode];
return themeConfig["BW_HERO"].thmTyp
}
return "darkTheme"
}, _clearTheme: function _clearTheme(elem) {
var classList="darkTheme lightTheme ";
var themes=this._themeClass;
if (themes) {
classList += themes
}
WinJS.Utilities.removeClass(elem, classList)
}, _applyTheme: function _applyTheme(elem, theme) {
WinJS.Utilities.addClass(elem, theme)
}, setDefaultHeroTheme: function setDefaultHeroTheme(elem) {
WinJS.Utilities.addClass(elem, "DefaultTheme")
}, loadThemeCSS: function loadThemeCSS(elementNode, HeroImgAndTheme, morphedSkyCode) {
var that=this;
var createUiTheme=function(response) {
var uiStyleElement=document.createElement("style");
if (uiStyleElement) {
uiStyleElement.type = "text/css";
uiStyleElement.sheet.cssText = response
}
return uiStyleElement
};
return new WinJS.Promise(function(complete, error) {
var innerPromise=WinJS.Promise.wrap(WeatherAppJS.DataManager.getHeroThemeData(HeroImgAndTheme, morphedSkyCode, false));
innerPromise.then(function(response) {
if (response) {
var uiStylesElement=createUiTheme(response);
if (uiStylesElement) {
elementNode.appendChild(uiStylesElement)
}
}
else {
that.setDefaultHeroTheme(elementNode)
}
}, function(err) {
that.setDefaultHeroTheme(elementNode)
})
}, function() {
WeatherAppJS.Controls.Utilities.cancelPromise(innerPromise)
})
}, applyTheme: function applyTheme(elementNode, HeroImgAndTheme, morphedSkyCode) {
if (elementNode) {
var elem=elementNode;
this._clearTheme(elem);
this.loadThemeCSS(elementNode, HeroImgAndTheme, morphedSkyCode);
this._applyTheme(elem, this._getThemeForSkyCode(morphedSkyCode, HeroImgAndTheme));
this._applyTheme(elem, this._getThemeTypeForSkyCode(morphedSkyCode, HeroImgAndTheme))
}
}
});
WinJS.Namespace.define("WeatherAppJS.Utilities.TabIndexManager", {HandleKeyboardInvocation: WinJS.UI.eventHandler(function(event) {
if (event) {
switch (event.keyCode) {
case WinJS.Utilities.Key.enter:
case WinJS.Utilities.Key.space:
if (event.target) {
event.target.click()
}
break;
default:
break
}
}
})});
WinJS.Namespace.define("WeatherAppJS.Utilities.TianQi", {
getEncodedLocationNameForQuery: function getEncodedLocationNameForQuery(locationName) {
var encodedLocationName=encodeURI(locationName.replace(/,.*$/, ''));
return (encodedLocationName + "%20" + "%e5%a4%a9%e6%b0%94")
}, getEncodedLocationName: function getEncodedLocationName(locationName) {
var encodedLocationName=encodeURI(locationName.replace(/,.*$/, ''));
return encodedLocationName
}
});
WinJS.Namespace.define("WeatherAppJS.Utilities.Formatting", {
_formatPattern: PlatformJS.Services.resourceLoader.getString('ShortDateTimeFormatString'), _dayFormatter: null, dayFormatter: {get: function get() {
if (!this._dayFormatter) {
this._dayFormatter = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("day")
}
return this._dayFormatter
}}, _reviewDateFormatter: null, reviewDateFormatter: {get: function get() {
if (!this._reviewDateFormatter) {
this._reviewDateFormatter = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("{day.integer(2)} {month.abbreviated}, {year.full}")
}
return this._reviewDateFormatter
}}, _canShowHourlyData: function _canShowHourlyData(kifTime, lastUpdatedTime, UTCOffset) {
var JSTime=this._convertKifToJSDate(kifTime);
var actualTime=JSTime.getTime();
var actualTimeOffset=JSTime.getTimezoneOffset();
var lastUpdatedTime=(UTCOffset && WeatherAppJS.Utilities.Common.isNumeric(UTCOffset)) ? (lastUpdatedTime + ((actualTimeOffset + UTCOffset) * 60000)) : lastUpdatedTime + (actualTimeOffset * 60000);
var diffTime=actualTime - lastUpdatedTime;
var HourlyForecastExpireTime=WeatherAppJS.WarmBoot.Cache.getString("HourlyForecastExpireTime");
if (diffTime > HourlyForecastExpireTime) {
return true
}
}, _dayOfWeekFormatterShort: null, dayOfWeekFormatterShort: {get: function get() {
if (!this._dayOfWeekFormatterShort) {
this._dayOfWeekFormatterShort = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("dayofweek.abbreviated")
}
return this._dayOfWeekFormatterShort
}}, _dayFormatReversed: null, dayFormatReversed: {get: function get() {
if (!this._dayFormatReversed) {
this._dayFormatReversed = WeatherAppJS.WarmBoot.Cache.getBool("DayFormatReversed")
}
return this._dayFormatReversed
}}, _dayOfWeekFormatter: null, dayOfWeekFormatter: {get: function get() {
if (!this._dayOfWeekFormatter) {
this._dayOfWeekFormatter = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("dayofweek")
}
return this._dayOfWeekFormatter
}}, _yearFormatter: null, yearFormatter: {get: function get() {
if (!this._yearFormatter) {
this._yearFormatter = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("year")
}
return this._yearFormatter
}}, _hourFormatter: null, hourFormatter: {get: function get() {
var formatting=Windows.Globalization.DateTimeFormatting;
if (!this._hourFormatter) {
this._hourFormatter = new formatting.DateTimeFormatter(formatting.HourFormat.default, formatting.MinuteFormat.default, formatting.SecondFormat.none)
}
return this._hourFormatter
}}, _intFormatter: null, intFormatter: {get: function get() {
if (!this._intFormatter) {
this._intFormatter = new Windows.Globalization.NumberFormatting.DecimalFormatter;
this._intFormatter.fractionDigits = 0
}
return this._intFormatter
}}, _forecastClusterKeyFormatter: null, forecastClusterKeyFormatter: {get: function get() {
var formatting=Windows.Globalization.DateTimeFormatting;
if (!this._forecastClusterKeyFormatter) {
this._forecastClusterKeyFormatter = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("dayofweek month day")
}
return this._forecastClusterKeyFormatter
}}, _timeDiff: 11644473600000, _convertKifToJSDate: function _convertKifToJSDate(kifTime) {
var jsMiliSeconds=(kifTime / 10000) - this._timeDiff;
var jsDate=new Date;
jsDate.setTime(jsMiliSeconds);
jsDate.setMinutes(jsDate.getMinutes() + jsDate.getTimezoneOffset());
return jsDate
}, convertUTCToLocalDate: function convertUTCToLocalDate(utcDateObj) {
var localDateObj=new Date;
localDateObj.setUTCFullYear(utcDateObj.getFullYear());
localDateObj.setUTCMonth(utcDateObj.getMonth());
localDateObj.setUTCDate(utcDateObj.getDate());
localDateObj.setUTCHours(utcDateObj.getHours());
localDateObj.setUTCMinutes(utcDateObj.getMinutes());
localDateObj.setUTCSeconds(utcDateObj.getSeconds());
return localDateObj
}, formatInt: function formatInt(val) {
return WeatherAppJS.Utilities.Formatting.intFormatter.format(val)
}, isRtlNumberFormat: function isRtlNumberFormat() {
var numeralSystem=WeatherAppJS.Utilities.Formatting.intFormatter.numeralSystem;
if (numeralSystem === "Arab" || numeralSystem === "ArabExt") {
return true
}
return false
}, _languageString: "", getQualifiedLanguageString: function getQualifiedLanguageString() {
if (this._languageString === "") {
this._languageString = WeatherAppJS.WarmBoot.Cache.getQualifiedLanguageString("languageString").toLowerCase()
}
return this._languageString
}, getSymbolPosition: function getSymbolPosition() {
var tag=this.getQualifiedLanguageString();
var result="ltr";
if (this.isRtlNumberFormat() && (tag !== "fa" && tag !== "sd-arab" && tag !== "pa-arab")) {
result = "rtl"
}
return result
}, _percentFormatter: null, percentFormatter: {get: function get() {
if (!this._percentFormatter) {
this._percentFormatter = new Windows.Globalization.NumberFormatting.PercentFormatter;
this._percentFormatter.fractionDigits = 0
}
return this._percentFormatter
}}, formatPercent: function formatPercent(val) {
return this.percentFormatter.format(val / 100)
}, getShortFormattedLastUpdateTime: function getShortFormattedLastUpdateTime(year, month, date, hour, minutes) {
var dateToFormat=new Date(year, month, date, hour, minutes);
var dateTimeFormatter=Windows.Globalization.DateTimeFormatting.DateTimeFormatter;
var formatPattern=this._formatPattern;
return formatPattern.format(dateTimeFormatter.longDate.format(dateToFormat), dateTimeFormatter.shortTime.format(dateToFormat))
}, getFormattedHourlyTime: function getFormattedHourlyTime(hourlytime) {
var jsDate=this._convertKifToJSDate(hourlytime);
return this.hourFormatter.format(jsDate)
}, getFormattedDailyTime: function getFormattedDailyTime(dailyTime) {
var formattedDateTime="";
try {
var jsDate=this._convertKifToJSDate(dailyTime);
if (this.dayFormatReversed) {
formattedDateTime = this._formatPattern.format(this.dayFormatter.format(jsDate), this.dayOfWeekFormatter.format(jsDate))
}
else {
formattedDateTime = this._formatPattern.format(this.dayOfWeekFormatter.format(jsDate), this.dayFormatter.format(jsDate))
}
}
catch(ex) {}
return formattedDateTime
}, getFormattedDailyTimeShort: function getFormattedDailyTimeShort(dailyTime) {
var formattedDateTime="";
try {
var jsDate=this._convertKifToJSDate(dailyTime);
if (this.dayFormatReversed) {
formattedDateTime = this._formatPattern.format(this.dayFormatter.format(jsDate), this.dayOfWeekFormatterShort.format(jsDate))
}
else {
formattedDateTime = this._formatPattern.format(this.dayOfWeekFormatterShort.format(jsDate), this.dayFormatter.format(jsDate))
}
}
catch(ex) {}
return formattedDateTime
}, getFormattedYearFromKifTime: function getFormattedYearFromKifTime(kifTime) {
var jsDate=this._convertKifToJSDate(kifTime);
var result=this.yearFormatter.format(jsDate);
return result
}, getFullDateTimeString: function getFullDateTimeString(kifTime, formatPattern) {
var dateTimeFormatter=Windows.Globalization.DateTimeFormatting.DateTimeFormatter;
formatPattern = formatPattern || this._formatPattern;
var jsDate=this._convertKifToJSDate(kifTime);
return formatPattern.format(dateTimeFormatter.longDate.format(jsDate), dateTimeFormatter.longTime.format(jsDate))
}, getFormattedMapSnapTime: function getFormattedMapSnapTime(kifTime, formatPattern) {
var dateTimeFormatter=Windows.Globalization.DateTimeFormatting.DateTimeFormatter;
formatPattern = formatPattern || this._formatPattern;
var jsDate=this._convertKifToJSDate(kifTime);
var result=formatPattern.format(dateTimeFormatter.longDate.format(jsDate), dateTimeFormatter.shortTime.format(jsDate));
return result
}, getShortDateTimeString: function getShortDateTimeString(val, isKifTime) {
var dateTimeFormatter=Windows.Globalization.DateTimeFormatting.DateTimeFormatter;
var formatPattern=this._formatPattern;
var jsDate;
if (isKifTime) {
jsDate = this._convertKifToJSDate(val)
}
else {
jsDate = new Date(val)
}
return formatPattern.format(dateTimeFormatter.shortDate.format(jsDate), dateTimeFormatter.shortTime.format(jsDate))
}, getFormattedDayName: function getFormattedDayName(kifTime) {
var jsDate=this._convertKifToJSDate(kifTime);
return this.dayFormatter.format(jsDate) + "|" + this.dayOfWeekFormatterShort.format(jsDate)
}, getFormattedForecastClusterKey: function getFormattedForecastClusterKey(kifTime) {
var jsDate=this._convertKifToJSDate(kifTime);
return this.forecastClusterKeyFormatter.format(jsDate)
}, getFormattedForecastSkiClusterKey: function getFormattedForecastSkiClusterKey(jsTime) {
var jsDate=new Date;
jsDate.setTime(jsTime);
jsDate.setMinutes(jsDate.getMinutes() + jsDate.getTimezoneOffset());
var formattedDateTime="";
try {
if (this.dayFormatReversed) {
formattedDateTime = this._formatPattern.format(this.dayFormatter.format(jsDate), this.dayOfWeekFormatterShort.format(jsDate))
}
else {
formattedDateTime = this._formatPattern.format(this.dayOfWeekFormatterShort.format(jsDate), this.dayFormatter.format(jsDate))
}
}
catch(ex) {}
return formattedDateTime
}, getDayOfYear: function getDayOfYear(kifTime) {
var jsDate=this._convertKifToJSDate(kifTime);
var dayOne=new Date(jsDate.getFullYear(), 0, 1);
return Math.ceil((jsDate - dayOne) / 86400000)
}, getYearFromKifTime: function getYearFromKifTime(kifTime) {
var jsDate=this._convertKifToJSDate(kifTime);
return jsDate.getFullYear()
}, getResourceString: function getResourceString(val) {
return PlatformJS.Services.resourceLoader.getString(val)
}, getDistanceUnit: function getDistanceUnit(val, displayUnit) {
var currentUnit;
if (displayUnit === "F") {
currentUnit = WeatherAppJS.WarmBoot.Cache.getString('DistanceUnitInFaren');
if (currentUnit !== "UnitInMiles") {
val = this.convertDefaultFarenDistanceUnit(val, currentUnit)
}
}
else {
currentUnit = WeatherAppJS.WarmBoot.Cache.getString('DistanceUnitInMetric');
if (currentUnit !== "UnitInKilometres") {
val = this.convertDefaultMetricDistanceUnit(val, currentUnit)
}
}
var formattedVal=this.formatInt(val);
var distUnit=this.getResourceString(currentUnit).format(formattedVal);
return distUnit
}, getSpeedUnit: function getSpeedUnit(val, displayUnit) {
var currentUnit;
if (displayUnit === "F") {
currentUnit = WeatherAppJS.WarmBoot.Cache.getString('SpeedUnitInFaren');
if (currentUnit !== "MilesPerHour") {
val = this.convertDefaultFarenSpeedUnit(val, currentUnit)
}
}
else {
currentUnit = WeatherAppJS.WarmBoot.Cache.getString('SpeedUnitInMetric');
if (currentUnit !== "KilometresPerHour") {
val = this.convertDefaultMetricSpeedUnit(val, currentUnit)
}
}
var formattedVal=this.formatInt(val);
var speedUnit={};
speedUnit.value = this.getResourceString(currentUnit).format(formattedVal);
speedUnit.arialabel = this.getResourceString(currentUnit + "AriaText") ? this.getResourceString(currentUnit + "AriaText").format(formattedVal) : "";
return speedUnit
}, getSpeedUnitAndDirection: function getSpeedUnitAndDirection(val, direction, displayUnit) {
var currentUnit;
if (displayUnit === "F") {
currentUnit = WeatherAppJS.WarmBoot.Cache.getString('SpeedWithDirectionUnitInFaren');
if (currentUnit !== "SpeedUnitsInMPHWithDirection") {
val = this.convertDefaultFarenSpeedWithDirectionUnit(val, currentUnit)
}
}
else {
currentUnit = WeatherAppJS.WarmBoot.Cache.getString('SpeedWithDirectionUnitInMetric');
if (currentUnit !== "SpeedUnitsInKMPHWithDirection") {
val = this.convertDefaultMetricSpeedWithDirectionUnit(val, currentUnit)
}
}
var formattedVal=this.formatInt(val);
var directionUnit=this.getResourceString("WindSpeedUnitFor" + direction);
var speedUnit={};
speedUnit.value = this.getResourceString(currentUnit).format(directionUnit, formattedVal);
speedUnit.arialabel = this.getResourceString(currentUnit + "AriaText") ? this.getResourceString(currentUnit + "AriaText").format(directionUnit, formattedVal) : "";
return speedUnit
}, getPressureUnit: function getPressureUnit(val, displayUnit) {
var currentUnit;
if (displayUnit === "F") {
currentUnit = WeatherAppJS.WarmBoot.Cache.getString('PressureUnitInFaren');
if (currentUnit !== "UnitInInches") {
val = this.convertDefaultFarenPressureUnit(val, currentUnit)
}
}
else {
currentUnit = WeatherAppJS.WarmBoot.Cache.getString('PressureUnitInMetric');
if (currentUnit !== "UnitInMillibars") {
val = this.convertDefaultMetricPressureUnit(val, currentUnit)
}
}
var formattedVal=this.formatInt(val);
var pressureUnit={};
pressureUnit.value = this.getResourceString(currentUnit).format(formattedVal);
pressureUnit.arialabel = this.getResourceString(currentUnit + "AriaText") ? this.getResourceString(currentUnit + "AriaText").format(formattedVal) : "";
return pressureUnit
}, getLengthUnitForHW: function getLengthUnitForHW(val, displayUnit) {
var currentUnit;
if (displayUnit === "F") {
currentUnit = WeatherAppJS.WarmBoot.Cache.getString('LengthUnitInFaren');
if (currentUnit !== "UnitInInches") {
val = this.convertDefaultFarenLengthUnit(val, currentUnit)
}
}
else {
currentUnit = WeatherAppJS.WarmBoot.Cache.getString('LengthUnitInMetric');
if (currentUnit !== "UnitInCentimetres") {
val = this.convertDefaultMetricLengthUnit(val, currentUnit)
}
}
var formattedVal=this.formatInt(val);
var lenUnit=this.getResourceString(currentUnit).format(formattedVal);
return lenUnit
}, getSnowDataUnit: function getSnowDataUnit(val, displayUnit) {
var formattedVal=this.formatInt(val);
var lenUnit=(displayUnit === "F") ? PlatformJS.Services.resourceLoader.getString('UnitInInches').format(formattedVal) : PlatformJS.Services.resourceLoader.getString('UnitInCentimetres').format(formattedVal);
return lenUnit
}, getSnowDepthUnit: function getSnowDepthUnit(val, displayUnit) {
var formattedVal=this.formatInt(val);
var currentUnit=(displayUnit === "F") ? PlatformJS.Services.appConfig.getString('SnowDepthUnitInFaren') : PlatformJS.Services.appConfig.getString('SnowDepthUnitInMetric');
var depUnit=this.getResourceString(currentUnit).format(formattedVal);
return depUnit
}, getTemperatureWithDegreeUnit: function getTemperatureWithDegreeUnit(val) {
var formattedVal=this.formatInt(val);
var tempValue=this.getResourceString('TemperatureWithDegreeUnit').format(formattedVal);
return tempValue
}, getDaysUnit: function getDaysUnit(val) {
var daysValue='';
var formattedVal=this.formatInt(val);
if (val === 1) {
daysValue = this.getResourceString('UnitInDay').format(formattedVal)
}
else {
daysValue = this.getResourceString('UnitInDays').format(formattedVal)
}
return daysValue
}, getHoursPerDayUnit: function getHoursPerDayUnit(val) {
var hoursPerDayValue='';
var formattedVal=this.formatInt(val);
if (val > 1) {
hoursPerDayValue = this.getResourceString('UnitInHoursPerDay').format(formattedVal)
}
else {
hoursPerDayValue = this.getResourceString('UnitInHourPerDay').format(formattedVal)
}
return hoursPerDayValue
}, getPercentageUnit: function getPercentageUnit(val) {
return this.formatPercent(val)
}, getPercentageValue: function getPercentageValue(val, totVal) {
var pctVal=Math.round((parseInt(val) / parseInt(totVal)) * 100);
return pctVal
}, getBarFill: function getBarFill(ArrStar) {
ArrStar.sort(function(a, b) {
return b - a
});
var ArrColor=["data firstColor", "data secondColor", "data thirdColor", "data fourthColor"];
var arrBarColor=[];
for (var i=0; i < ArrStar.length; i++) {
arrBarColor[ArrStar[i]] = ArrColor[i];
if (ArrStar[i] === ArrStar[i + 1]) {
i++
}
}
return arrBarColor
}, getBarHeight: WinJS.Binding.converter(function(ht) {
ht = (ht / 100) * 145;
ht = ht + "px";
return ht
}), constructBarHeight: WinJS.Binding.converter(function(ht) {
ht = 145 - ((ht / 100) * 145);
ht = ht + "px 0 0 0";
return ht
}), convertDefaultMetricLengthUnit: function convertDefaultMetricLengthUnit(val, currentUnit) {
switch (currentUnit) {
case"UnitInMillimeters":
val = val * 10;
break;
case"UnitInInches":
val = val * 0.393701;
break
}
val = parseFloat(val).toFixed(2);
return val
}, convertDefaultFarenLengthUnit: function convertDefaultFarenLengthUnit(val, currentUnit) {
switch (currentUnit) {
case"UnitInMillimeters":
val = val * 25.4;
break;
case"UnitInCentimetres":
val = val * 2.54;
break
}
val = parseFloat(val).toFixed(2);
return val
}, convertDefaultFarenSpeedUnit: function convertDefaultFarenSpeedUnit(val, currentUnit) {
switch (currentUnit) {
case"KilometresPerHour":
val = val * 1.60934;
break;
case"MeterPerSecond":
val = val * 0.44704;
break
}
val = parseFloat(val).toFixed(0);
return val
}, convertDefaultMetricSpeedUnit: function convertDefaultMetricSpeedUnit(val, currentUnit) {
switch (currentUnit) {
case"MeterPerSecond":
val = val * 0.278;
break;
case"MilesPerHour":
val = val * 0.6214;
break;
case"BeaufortScale":
val = this.convertKMPHtoBftScale(val);
break
}
val = parseFloat(val).toFixed(0);
return val
}, convertDefaultFarenSpeedWithDirectionUnit: function convertDefaultFarenSpeedWithDirectionUnit(val, currentUnit) {
switch (currentUnit) {
case"SpeedUnitsInKPHWithDirection":
val = val * 1.60934;
break;
case"SpeedUnitsInMPSWithDirection":
val = val * 0.44704;
break
}
val = parseFloat(val).toFixed(0);
return val
}, convertDefaultMetricSpeedWithDirectionUnit: function convertDefaultMetricSpeedWithDirectionUnit(val, currentUnit) {
switch (currentUnit) {
case"SpeedUnitsInMPSWithDirection":
val = val * 0.278;
break;
case"SpeedUnitsInMPHWithDirection":
val = val * 0.6214;
break;
case"SpeedUnitsInBFTWithDirection":
val = this.convertKMPHtoBftScale(val);
break
}
val = parseFloat(val).toFixed(0);
return val
}, convertDefaultMetricDistanceUnit: function convertDefaultMetricDistanceUnit(val, currentUnit) {
switch (currentUnit) {
case"UnitInMiles":
val = val * 0.6214;
break
}
val = parseFloat(val).toFixed(0);
return val
}, convertDefaultFarenDistanceUnit: function convertDefaultFarenDistanceUnit(val, currentUnit) {
switch (currentUnit) {
case"UnitInKilometres":
val = val * 1.60934;
break
}
val = parseFloat(val).toFixed(0);
return val
}, convertDefaultMetricPressureUnit: function convertDefaultMetricPressureUnit(val, currentUnit) {
switch (currentUnit) {
case"UnitInMillimetersHg":
val = val * 0.75;
break;
case"UnitInHectorPascal":
val = val * 1;
break;
case"UnitInInches":
val = val * 0.0295299830714;
break
}
val = parseFloat(val).toFixed(2);
return val
}, convertDefaultFarenPressureUnit: function convertDefaultFarenPressureUnit(val, currentUnit) {
switch (currentUnit) {
case"UnitInMillimetersHg":
val = val * 25.399999705005417;
break;
case"UnitInHectorPascal":
val = val * 33.863886666718315;
break;
case"UnitInMillibars":
val = val * 33.863886666718315;
break
}
val = parseFloat(val).toFixed(2);
return val
}, convertKMPHtoBftScale: function convertKMPHtoBftScale(val) {
var result;
if (val <= 1) {
result = 0
}
else if (val <= 5.5) {
result = 1
}
else if (val <= 11) {
result = 2
}
else if (val <= 19) {
result = 3
}
else if (val <= 28) {
result = 4
}
else if (val <= 38) {
result = 5
}
else if (val <= 49) {
result = 6
}
else if (val <= 61) {
result = 7
}
else if (val <= 74) {
result = 8
}
else if (val <= 88) {
result = 9
}
else if (val <= 102) {
result = 10
}
else if (val <= 117) {
result = 11
}
else {
result = 12
}
return result
}, formatHourlyConditions: function formatHourlyConditions(hourlyData) {
var formattedHourlyData={};
formattedHourlyData.time = WeatherAppJS.Utilities.Formatting.getFormattedHourlyTime(hourlyData.Time);
formattedHourlyData.kifTime = hourlyData.Time;
var caption=hourlyData.ProviderCaption;
if (!caption) {
caption = hourlyData.Caption
}
if (caption) {
var hrCaption=PlatformJS.Services.resourceLoader.getString(caption);
formattedHourlyData.caption = hrCaption ? hrCaption : ""
}
else {
formattedHourlyData.caption = ""
}
var formatting=WeatherAppJS.Utilities.Formatting;
var common=WeatherAppJS.Utilities.Common;
var noDataString=common.getNoDataString();
formattedHourlyData.temperature = (hourlyData.Temp !== undefined && hourlyData.Temp !== null) ? formatting.getTemperatureWithDegreeUnit(hourlyData.Temp) : noDataString;
formattedHourlyData.temperatureWithoutUnit = (hourlyData.Temp !== undefined && hourlyData.Temp !== null) ? formatting.formatInt(hourlyData.Temp) : noDataString;
var safeIconCode=hourlyData.IconCode;
formattedHourlyData.skycode = "/images/skycodes/48x48/" + safeIconCode + '.png';
formattedHourlyData.precipitation = (hourlyData.PrecipChance !== undefined && hourlyData.PrecipChance !== null) ? formatting.getPercentageUnit(hourlyData.PrecipChance) : noDataString;
formattedHourlyData.feelslike = (hourlyData.FeelsLike !== undefined && hourlyData.FeelsLike !== null) ? formatting.getTemperatureWithDegreeUnit(hourlyData.FeelsLike) : noDataString;
formattedHourlyData.wind = (hourlyData.WindSpeed !== undefined && hourlyData.WindSpeed !== null) ? hourlyData.WindSpeed : noDataString;
return formattedHourlyData
}, formatSnowOpenLabel: function formatSnowOpenLabel(displayUnit) {
var label;
var resourceLoader=PlatformJS.Services.resourceLoader;
label = (displayUnit === "F") ? resourceLoader.getString("AcresOpen") : resourceLoader.getString("HectaresOpen");
return label
}, formatSnowUnit: function formatSnowUnit(displayUnit) {
var unit;
var resourceLoader=PlatformJS.Services.resourceLoader;
unit = (displayUnit === "F") ? resourceLoader.getString('UnitInInches').format("") : resourceLoader.getString('UnitInCentimetres').format("");
return unit
}, formatSnowData: function formatSnowData(todaySnowData, snowData, displayUnit) {
var formattedSnowData={};
var listindex=0;
var constSnowData="<span class='snowdaysGlyph'></span><span class='snowdaysText'>{0}</span>";
if (snowData) {
for (var index=0; index < snowData.length; index++) {
var item={};
item.freshSnow = (snowData[index].snfl !== undefined) ? constSnowData.format(WeatherAppJS.Utilities.Formatting.getSnowDataUnit(snowData[index].snfl, displayUnit)) : '';
item.date = WeatherAppJS.Utilities.Formatting.getFormattedForecastSkiClusterKey(snowData[index].date);
formattedSnowData[listindex] = item;
listindex++
}
}
return formattedSnowData
}, visibilityConverter: WinJS.Binding.converter(function(obj) {
if (!(obj === null || typeof obj === 'undefined' || obj === "")) {
return 'visible'
}
else {
return 'hidden'
}
}), displayConverter: WinJS.Binding.converter(function(obj) {
if (!(obj === null || typeof obj === 'undefined' || obj === "")) {
return 'block'
}
else {
return 'none'
}
}), displayInlineConverter: WinJS.Binding.converter(function(obj) {
if (!(obj === null || typeof obj === 'undefined' || obj === "")) {
return 'inline'
}
else {
return 'none'
}
}), resortStatusConverter: WinJS.Binding.converter(function(resortStatus) {
var className="resortStatus ";
if (resortStatus !== WeatherAppJS.Utilities.Common.getNoDataString()) {
if (resortStatus === "Open") {
className += "open"
}
else if (resortStatus === "WeekendsOnly") {
className += "open weekendOnly"
}
else if (resortStatus === "TemporarilyClosed" || resortStatus === "TempClosed") {
className += "closed tempClosed"
}
else {
className += "closed"
}
}
return className
}), resortStatusStringConverter: WinJS.Binding.converter(function(resortStatus) {
var resStatus=resortStatus;
if (resortStatus !== WeatherAppJS.Utilities.Common.getNoDataString()) {
if (resortStatus === "TempClosed") {
resStatus = PlatformJS.Services.resourceLoader.getString(resortStatus)
}
else {
resStatus = PlatformJS.Services.resourceLoader.getString("ResortStatus" + resortStatus)
}
}
return resStatus
}), getElevationUnit: function getElevationUnit(val, displayUnit) {
var unit;
var resourceLoader=PlatformJS.Services.resourceLoader;
if (val) {
val = this.formatInt(Math.floor(val))
}
try {
var unitContainer="{0} <span>{1}</span>";
unit = (displayUnit === "F") ? unitContainer.format(val, resourceLoader.getString("Feet")) : unitContainer.format(val, resourceLoader.getString("Metres"))
}
catch(err) {}
return unit
}, getFormattedReviewDate: function getFormattedReviewDate(val) {
var jsDate=new Date(val);
return this.reviewDateFormatter.format(jsDate)
}, getSanitizedUrl: function getSanitizedUrl(url) {
if (url) {
var staticURL=toStaticHTML(url);
if (staticURL.indexOf("http://") !== 0) {
staticURL = "http://" + staticURL
}
return staticURL
}
return null
}, getFormattedUvIndex: function getFormattedUvIndex(val) {
var common=WeatherAppJS.Utilities.Common;
if (!common.isNumeric(val)) {
return null
}
var formattedVal=this.formatInt(val);
var resourceLoader=PlatformJS.Services.resourceLoader;
var uvindex="";
if (val >= 0 && val < 3) {
uvindex = resourceLoader.getString("UvLow").format(formattedVal)
}
else if (val < 6) {
uvindex = resourceLoader.getString("UvModerate").format(formattedVal)
}
else if (val < 8) {
uvindex = resourceLoader.getString("UvHigh").format(formattedVal)
}
else if (val < 11) {
uvindex = resourceLoader.getString("UvVeryHigh").format(formattedVal)
}
else if (val >= 11) {
uvindex = resourceLoader.getString("UvExtreme").format(formattedVal)
}
else {
uvindex = common.getNoDataString()
}
return uvindex
}
});
WinJS.Namespace.define("WeatherAppJS.Utilities.TabIndexManager", {
setTabIndexOnDailyConditions: function setTabIndexOnDailyConditions(parentNode, isPageLoad) {
var tm=WeatherAppJS.Utilities.TabIndexManager;
var lWrapperClass='.dailyModuleWrapper';
var lEachForecastNodeClass='.dailyModuleFirstProvider';
tm._setTabIndexes(parentNode, lWrapperClass, lEachForecastNodeClass)
}, handleArrowKeyForAccessibility: function handleArrowKeyForAccessibility(event, xAxis) {
if (!event || !event.srcElement) {
return
}
function focusItem(elem, isYaxis) {
if (elem) {
if (isYaxis) {
event.srcElement.tabIndex = -1
}
elem.tabIndex = 0;
elem.focus()
}
}
var isRTL=(WeatherAppJS.Utilities.Common.getDirection() === 'rtl') ? true : false;
var keyCode=event.keyCode;
if (keyCode === WinJS.Utilities.Key.rightArrow || keyCode === WinJS.Utilities.Key.leftArrow || keyCode === WinJS.Utilities.Key.upArrow || keyCode === WinJS.Utilities.Key.downArrow || keyCode === WinJS.Utilities.Key.pageUp || keyCode === WinJS.Utilities.Key.pageDown) {
event.stopImmediatePropagation();
event.preventDefault()
}
if (xAxis) {
switch (keyCode) {
case WinJS.Utilities.Key.rightArrow:
{
var nextElem=isRTL ? event.srcElement.previousElementSibling : event.srcElement.nextElementSibling;
if (!nextElem) {
CommonJS.NavigableView.dispatchBoundaryEvent(event.srcElement, CommonJS.NavigableView.Direction.RIGHT)
}
else {
focusItem(nextElem, false)
}
}
break;
case WinJS.Utilities.Key.leftArrow:
{
var nextElement=isRTL ? event.srcElement.nextElementSibling : event.srcElement.previousElementSibling;
if (!nextElement) {
CommonJS.NavigableView.dispatchBoundaryEvent(event.srcElement, CommonJS.NavigableView.Direction.LEFT)
}
else {
focusItem(nextElement, false)
}
}
break;
case WinJS.Utilities.Key.downArrow:
case WinJS.Utilities.Key.pageDown:
CommonJS.NavigableView.dispatchBoundaryEvent(event.srcElement, CommonJS.NavigableView.Direction.RIGHT);
break;
case WinJS.Utilities.Key.upArrow:
case WinJS.Utilities.Key.pageUp:
CommonJS.NavigableView.dispatchBoundaryEvent(event.srcElement, CommonJS.NavigableView.Direction.LEFT);
break
}
}
else {
switch (keyCode) {
case WinJS.Utilities.Key.downArrow:
focusItem(event.srcElement.nextElementSibling, true);
break;
case WinJS.Utilities.Key.upArrow:
focusItem(event.srcElement.previousElementSibling, true);
break;
case WinJS.Utilities.Key.rightArrow:
case WinJS.Utilities.Key.pageDown:
CommonJS.NavigableView.dispatchBoundaryEvent(event.srcElement, CommonJS.NavigableView.Direction.RIGHT);
break;
case WinJS.Utilities.Key.leftArrow:
case WinJS.Utilities.Key.pageUp:
CommonJS.NavigableView.dispatchBoundaryEvent(event.srcElement, CommonJS.NavigableView.Direction.LEFT);
break
}
}
}, _setTabIndexes: function _setTabIndexes(parentNode, wrapperIdentifier, forecastNodesIdentifier) {
var dailyConditionsWrapper=parentNode.querySelector(wrapperIdentifier);
if (dailyConditionsWrapper) {
var isScrolled=WeatherAppJS.Utilities.UI._isDailyForecastScrolled;
var dailyConditionsAll=dailyConditionsWrapper.querySelectorAll(forecastNodesIdentifier);
var dailyConditionsViewCount=WeatherAppJS.Utilities.UI._totalDailyForecastsShown;
var startIndex=0;
var endIndex=(dailyConditionsAll.length < dailyConditionsViewCount) ? dailyConditionsAll.length : dailyConditionsViewCount;
if (isScrolled) {
endIndex = dailyConditionsAll.length;
startIndex = endIndex - dailyConditionsViewCount
}
for (var hiddenIndex=0, len=dailyConditionsAll.length; hiddenIndex < len; hiddenIndex++) {
dailyConditionsAll[hiddenIndex].setAttribute("tabIndex", "-1")
}
for (var index=startIndex; index < endIndex; index++) {
dailyConditionsAll[index].setAttribute("tabIndex", "0")
}
}
}
});
WinJS.Namespace.define("WeatherAppJS.Storage.Memory", {
_dataStore: {}, cacheItem: function cacheItem(key, value) {
this._dataStore[key] = value
}, getItem: function getItem(key) {
if (this._dataStore[key]) {
return this._dataStore[key]
}
return null
}, removeItem: function removeItem(key) {
if (this._dataStore[key]) {
delete this._dataStore[key]
}
}
});
WinJS.Namespace.define("WeatherAppJS.Instrumentation.PageContext", {
ConfirmLocFlyout: "Confirm Location Flyout", SkiTrailMap: "/Ski Resorts/Trail Map", SkiOverviewOTS: "/Ski Resorts/OTS Overview Site", SkiResortWebsite: "/Ski Resorts/Website", SkiResortSlideshow: "/Ski Resorts/Slideshow", SkiResort360Pano: "/Ski Resorts/360Pano", SkiResortNews: "/Ski Resorts/Deals and News", SkiResortReview: "/Ski Resorts/Users Review", ArticleReader: "/Article Reader", Home: "/Home", DayDrilldown: "/Day Drilldown", CityDetails: "/City Details", SkiResorts: "/Ski Resorts", IFramePage: "/IFrame Page", MyPlaces: "/My Places", PhotoSynth: "/360Pano", SearchDisambiguation: "/Search Disambiguation", SkiResortsECV: "/Ski Resorts ECV", SlideShow: "/Slideshow", Snap: "/Snap", WorldWeather: "/World Weather", PartnerPano: "/Partner Pano", WeatherMapsChrome: "Weather Maps Chrome", WeatherMapsChromeTopBar: "Weather Maps Chrome top-bar", DailyForecast: "Daily Forecast", SkiOverview: "Ski Resorts Overview", MessageBar: "Message Bar", Favorites: "Favorites", Recent: "Recent"
});
WinJS.Namespace.define("WeatherAppJS.Instrumentation.FormCodes", {
AppLaunch: "APXW02", Search: "APXW03", PinnedTile: "APXW04", MyPlacesTile: "APXW05", TopEdgy: "APXW06", Default: "APXW01"
});
WinJS.Namespace.define("WeatherAppJS.WarmBoot.Cache", {
getBool: function getBool(key) {
var holder;
if (PlatformJS.isPlatformInitialized) {
holder = PlatformJS.Services.appConfig.getBool(key);
PlatformJS.BootCache.instance.addOrUpdateEntry(key, holder)
}
else {
holder = PlatformJS.BootCache.instance.getEntry(key, function() {
return PlatformJS.Services.appConfig.getBool(key)
})
}
return holder
}, isFeatureEnabled: function isFeatureEnabled(key) {
var holder;
if (PlatformJS.isPlatformInitialized) {
holder = Platform.Utilities.Globalization.isFeatureEnabled(key);
PlatformJS.BootCache.instance.addOrUpdateEntry(key, holder)
}
else {
holder = PlatformJS.BootCache.instance.getEntry(key, function() {
return Platform.Utilities.Globalization.isFeatureEnabled(key)
})
}
return holder
}, getString: function getString(key) {
var holder;
if (PlatformJS.isPlatformInitialized) {
holder = PlatformJS.Services.appConfig.getString(key);
PlatformJS.BootCache.instance.addOrUpdateEntry(key, holder)
}
else {
holder = PlatformJS.BootCache.instance.getEntry(key, function() {
return PlatformJS.Services.appConfig.getString(key)
})
}
return holder
}, getInt32: function getInt32(key) {
var holder;
if (PlatformJS.isPlatformInitialized) {
holder = PlatformJS.Services.appConfig.getInt32(key);
PlatformJS.BootCache.instance.addOrUpdateEntry(key, holder)
}
else {
holder = PlatformJS.BootCache.instance.getEntry(key, function() {
return PlatformJS.Services.appConfig.getInt32(key)
})
}
return holder
}, getMarketLocation: function getMarketLocation(key) {
var holder;
if (PlatformJS.isPlatformInitialized) {
holder = Platform.Globalization.Marketization.getMarketLocation();
PlatformJS.BootCache.instance.addOrUpdateEntry(key, holder)
}
else {
holder = PlatformJS.BootCache.instance.getEntry(key, function() {
return Platform.Globalization.Marketization.getMarketLocation()
})
}
return holder
}, isCurrentLanguageLocationValid: function isCurrentLanguageLocationValid(key) {
var holder;
if (PlatformJS.isPlatformInitialized) {
holder = Platform.Globalization.Marketization.isCurrentLanguageLocationValid();
PlatformJS.BootCache.instance.addOrUpdateEntry(key, holder)
}
else {
holder = PlatformJS.BootCache.instance.getEntry(key, function() {
return Platform.Globalization.Marketization.isCurrentLanguageLocationValid()
})
}
return holder
}, getDictionary: function getDictionary(key) {
var holder;
if (PlatformJS.isPlatformInitialized) {
holder = PlatformJS.Services.appConfig.getDictionary(key);
PlatformJS.BootCache.instance.addOrUpdateEntry(key, holder)
}
else {
holder = PlatformJS.BootCache.instance.getEntry(key, function() {
return PlatformJS.Services.appConfig.getDictionary(key)
})
}
return holder
}, getQualifiedLanguageString: function getQualifiedLanguageString(key) {
var holder;
if (PlatformJS.isPlatformInitialized) {
holder = Platform.Globalization.Marketization.getQualifiedLanguageString();
PlatformJS.BootCache.instance.addOrUpdateEntry(key, holder)
}
else {
holder = PlatformJS.BootCache.instance.getEntry(key, function() {
return Platform.Globalization.Marketization.getQualifiedLanguageString()
})
}
return holder
}, getCurrentMarket: function getCurrentMarket(key) {
var holder;
if (PlatformJS.isPlatformInitialized) {
holder = Platform.Globalization.Marketization.getCurrentMarket();
PlatformJS.BootCache.instance.addOrUpdateEntry(key, holder)
}
else {
holder = PlatformJS.BootCache.instance.getEntry(key, function() {
return Platform.Globalization.Marketization.getCurrentMarket()
})
}
return holder
}, configurationGetString: function configurationGetString(key) {
var holder;
if (PlatformJS.isPlatformInitialized) {
holder = PlatformJS.Services.configuration.getString(key);
PlatformJS.BootCache.instance.addOrUpdateEntry(key, holder)
}
else {
holder = PlatformJS.BootCache.instance.getEntry(key, function() {
return PlatformJS.Services.configuration.getString(key)
})
}
return holder
}, getStringFromDictionary: function getStringFromDictionary(key, dictionary) {
var holder;
if (PlatformJS.isPlatformInitialized) {
holder = dictionary.getString(key);
PlatformJS.BootCache.instance.addOrUpdateEntry(key, holder)
}
else {
holder = PlatformJS.BootCache.instance.getEntry(key, function() {
return dictionary.getString(key)
})
}
return holder
}, getBoolFromDictionary: function getBoolFromDictionary(key, dictionary) {
var holder;
if (PlatformJS.isPlatformInitialized) {
holder = dictionary.getBool(key);
PlatformJS.BootCache.instance.addOrUpdateEntry(key, holder)
}
else {
holder = PlatformJS.BootCache.instance.getEntry(key, function() {
return dictionary.getBool(key)
})
}
return holder
}, getValueWithKey: function getValueWithKey(key, getter) {
var holder;
if (PlatformJS.isPlatformInitialized) {
holder = getter(key);
PlatformJS.BootCache.instance.addOrUpdateEntry(key, holder)
}
else {
holder = PlatformJS.BootCache.instance.getEntry(key, function() {
return getter(key)
})
}
return holder
}, getValue: function getValue(key, getter) {
var holder;
if (PlatformJS.isPlatformInitialized) {
holder = getter;
PlatformJS.BootCache.instance.addOrUpdateEntry(key, holder)
}
else {
holder = PlatformJS.BootCache.instance.getEntry(key, function() {
return getter
})
}
return holder
}
})
})()