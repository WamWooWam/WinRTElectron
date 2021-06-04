/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
WinJS.Namespace.define("WeatherAppJS.Controls.Clusters", {
HeroClusterControl: WinJS.Class.derive(CommonJS.Immersive.PlatformHeroControl, function(element, options) {
element = this.element = element ? element : document.createElement("div");
this.supportsContentRefresh = true;
element.winControl = this;
WinJS.Utilities.addClass(element, "currentConditionsHero " + CommonJS.RESPONSIVE_RESIZABLE_CLASS);
CommonJS.Immersive.PlatformHeroControl.call(this, element, null);
this._locId = options.locId;
this._isFre = options.isFre || false;
this._bypassCache = options.bypassCache || false;
this._isTianqi = options.isTianqi || false
}, {
_locId: null, _bypassCache: null, _isTianqi: null, _isFre: null, _id: "WeatherAppJS.Controls.Clusters.HeroClusterControl", uniqueRenderTag: null, _isFirstRender: true, _alertsPromise: null, render: function render(isDataRefreshed) {
var that=this;
var dataQuery;
var imageServicesQuery;
var moduleInfo={
isInteractive: true, className: "currentConditionsHeroModule"
};
CommonJS.Progress.showProgress(CommonJS.Progress.headerProgressType);
if (that._isTianqi) {
moduleInfo.renderer = WeatherAppJS.Utilities.Templates.getTianQiTemplate;
dataQuery = WeatherAppJS.LocationsManager.getTianQiDataForLocationAsync
}
else {
moduleInfo.renderer = WeatherAppJS.Utilities.Templates.getCurrentConditionsTemplate;
dataQuery = WeatherAppJS.LocationsManager.getCCDataForLocationAsync
}
imageServicesQuery = WeatherAppJS.LocationsManager.getImageServicesDataForLocationAsync;
return new WinJS.Promise(function(complete, error) {
WinJS.Promise.join([dataQuery(that._locId, that._bypassCache, that._isFre), imageServicesQuery(that._locId, that._bypassCache, that._isFre)]).then(function(locObj) {
if (locObj[0] && locObj[0]._currentConditions) {
that.renderProxy(moduleInfo, locObj).then(function() {
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
if (!that._isDisposed) {
if (isDataRefreshed) {
that.dispatchEvent(CommonJS.Immersive.ClusterControlRefreshedEvent, {isDataRefreshed: true})
}
else if (!WeatherAppJS.Utilities.Common.isStale(locObj[0]._currentConditions.lastUpdatedTime, WeatherAppJS.WarmBoot.Cache.getString("TimeBeforeStale"))) {
that.dispatchEvent(CommonJS.Immersive.ClusterControlRefreshedEvent, {isDataRefreshed: false})
}
}
complete()
})
}
else {
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
complete()
}
}, function(e) {
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
complete()
}, function(locObj) {
if (locObj[0] && locObj[0].getCurrentConditions()) {
that.renderProxy(moduleInfo, locObj[0]).then(function() {
complete()
})
}
})
}, function() {
WeatherAppJS.Controls.Utilities.cancelPromise(dataQuery);
WeatherAppJS.Controls.Utilities.cancelPromise(that._alertsPromise)
})
}, renderProxy: function renderProxy(moduleInfo, data) {
var that=this;
var locObj=data[0];
if (!locObj || !locObj.getCurrentConditions() || !that._currentHeroControl || locObj.getCurrentConditions().lastUpdatedTime === that.uniqueRenderTag) {
return WinJS.Promise.wrap(null)
}
var cc=locObj.getCurrentConditions();
var page=PlatformJS.Navigation.currentIPage;
if (page && page.displayLastUpdatedTime) {
page._lastUpdatedTime = cc.lastUpdatedTime;
WeatherAppJS.Utilities.Common.displayLastUpdatedTime(page)
}
that.uniqueRenderTag = cc.lastUpdatedTime;
var iconCode=cc.iconcode;
var dayNightIndicator=cc.dayNightIndicator;
var imgAndTheme=locObj.getHeroImageAndThemeData();
var themeManager=WeatherAppJS.Utilities.ThemeManager;
var morphedSkyCode=themeManager.getMorphedSkyCode(imgAndTheme, iconCode, dayNightIndicator);
var container=document.getElementById('mainContainer');
if (container) {
themeManager.applyTheme(container, imgAndTheme, morphedSkyCode)
}
var backgroundImageData=themeManager.getHeroImageForSkyCode(imgAndTheme, morphedSkyCode);
var focalAnchorPoint=themeManager.getfocalAnchorForSkyCode(imgAndTheme, morphedSkyCode);
themeManager.setCityPageImageAttribution(imgAndTheme, morphedSkyCode);
var heroItem={
moduleInfo: moduleInfo, data: {loc: locObj}
};
var imageData=backgroundImageData.image;
imageData.imageTag = "HeroImage" + locObj.id;
var primaryHeroImageData={
backgroundImage: imageData, imageSize: backgroundImageData.imageSize, imageSizeLowRes: backgroundImageData.imageSizeLowRes, focalPoint: focalAnchorPoint.focalPoint, focalPointLowRes: focalAnchorPoint.focalPointLowRes, anchorPoint: focalAnchorPoint.anchorPoint
};
var heroOptions={
layoutId: CommonJS.Immersive.HERO_LAYOUT_ONE_ITEM, heroItems: [heroItem], primaryHeroImageData: primaryHeroImageData
};
var platformHeroRenderPromise;
if (that._isFirstRender) {
that.setProperties(heroOptions);
that.renderLayout();
platformHeroRenderPromise = CommonJS.Immersive.PlatformHeroControl.prototype.render.call(that)
}
else {
platformHeroRenderPromise = CommonJS.Immersive.PlatformHeroControl.prototype.refresh.call(that, heroOptions)
}
if (container) {
var currentConditionsModule=container.querySelector(".currentConditionsModule");
if (currentConditionsModule) {
currentConditionsModule.tabIndex = -1
}
}
return platformHeroRenderPromise.then(function() {
if (!that._isFre) {
PlatformJS.platformInitializedPromise.then(function() {
that._alertsPromise = WeatherAppJS.LocationsManager.getAlertsDataForLocationAsync(that._locId, that._bypassCache).then(null, function(e){})
})
}
that._isFirstRender = false;
return WinJS.Promise.wrap(null)
})
}, onWindowResize: function onWindowResize(event) {
var uiUtilities=WeatherAppJS.Utilities.UI;
var viewManagement=Windows.UI.ViewManagement;
var layoutState=viewManagement.ApplicationView.value;
var forceMinimized=this._isTianqi;
var that=this;
var currentWidth=(event && event.new) ? event.new.width : window.innerWidth;
var isMinimized=WeatherAppJS.SettingsManager.isCCMinimized();
var showLimitedExperience=uiUtilities.showLimitedExperience(that._locId);
if (!showLimitedExperience) {
uiUtilities.setHeroClusterState(layoutState, null, forceMinimized, currentWidth);
uiUtilities.setSeeMoreStatus(that.element, null, isMinimized, layoutState)
}
var viewState=viewManagement.ApplicationViewState;
if ((layoutState === viewState.fullScreenLandscape || layoutState === viewState.filled) && !uiUtilities.isLayoutVertical(currentWidth)) {
uiUtilities.adjustHeroClusterForResolution(null, that._locId, currentWidth)
}
else {
var animationContainer=document.querySelector('.animationContainer');
if (animationContainer) {
if (isMinimized || forceMinimized || showLimitedExperience) {
animationContainer.style.width = uiUtilities.minimizedAnimationContainerWidth
}
else {
animationContainer.style.width = uiUtilities.maximizedAnimationContainerWidth
}
}
}
var locObj=WeatherAppJS.LocationsManager.getLocation(that._locId);
if (locObj && locObj.getCurrentConditions()) {
var that=this;
var cc=locObj.getCurrentConditions();
var iconCode=cc.iconcode;
var dayNightIndicator=cc.dayNightIndicator;
var imgAndTheme=locObj.getHeroImageAndThemeData();
var themeManager=WeatherAppJS.Utilities.ThemeManager;
var morphedSkyCode=themeManager.getMorphedSkyCode(imgAndTheme, iconCode, dayNightIndicator);
var focalAnchorpoint=themeManager.getfocalAnchorForSkyCode(imgAndTheme, morphedSkyCode);
that.anchorPoint = focalAnchorpoint.anchorPoint;
that.focalPoint = focalAnchorpoint.focalPoint;
that.focalPointLowRes = focalAnchorpoint.focalPointLowRes
}
WeatherAppJS.Utilities.UI.displayMainProviderName(currentWidth)
}, dispose: function dispose() {
this.cleanUp()
}, cleanUp: function cleanUp() {
var that=this;
if (that._isDisposed) {
return
}
that._isDisposed = true;
CommonJS.Immersive.PlatformHeroControl.prototype.dispose.call(that);
WeatherAppJS.Utilities.UI.setCurrentHeroImageAttribution(null);
that.uniqueRenderTag = null;
clearTimeout(WeatherAppJS.Utilities.UI._heroTemplateTimer)
}
}), SkiResortsHeroClusterControl: WinJS.Class.derive(CommonJS.Immersive.PlatformHeroControl, function(element, options) {
var that=this;
element = this.element = element ? element : document.createElement("div");
element.winControl = this;
this.supportsContentRefresh = true;
WinJS.Utilities.addClass(element, "currentConditionsHero " + CommonJS.RESPONSIVE_RESIZABLE_CLASS);
CommonJS.Immersive.PlatformHeroControl.call(this, element, null);
this._locId = options.locId;
this._bypassCache = options.bypassCache || false
}, {
_locId: null, _bypassCache: false, _id: "WeatherAppJS.Controls.Clusters.SkiResortsHeroClusterControl", _anchorLandscape: null, _anchorPortrait: null, _isFirstRender: true, _alertsPromise: null, _focalLandscape: null, _focalPortrait: null, _focalLowResLandscape: null, _focalLowResPortrait: null, uniqueRenderTag: null, render: function render() {
var that=this;
var skiDataPromise;
var moduleInfo={
isInteractive: true, className: "currentConditionsHeroModule"
};
CommonJS.Progress.showProgress(CommonJS.Progress.headerProgressType);
moduleInfo.renderer = WeatherAppJS.Utilities.Templates.getCurrentConditionsTemplate;
skiDataPromise = WeatherAppJS.LocationsManager.getSkiDetailsAsync(that._locId, that._bypassCache);
return new WinJS.Promise(function(complete, error) {
skiDataPromise.then(function(locObj) {
that.renderProxy(moduleInfo, locObj).then(function() {
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
if (!that._isDisposed) {
that.dispatchEvent(CommonJS.Immersive.ClusterControlRefreshedEvent, {isDataRefreshed: false})
}
complete()
})
}, function(e) {
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
complete()
}, function(locObj) {
that.renderProxy(moduleInfo, locObj).then(function() {
complete()
})
})
}, function() {
WeatherAppJS.Controls.Utilities.cancelPromise(skiDataPromise);
WeatherAppJS.Controls.Utilities.cancelPromise(that._alertsPromise)
})
}, renderProxy: function renderProxy(moduleInfo, locObj) {
var that=this;
var cc=locObj.getCurrentConditions();
if (!locObj || !locObj.getCurrentConditions() || !that._currentHeroControl || locObj.getCurrentConditions().lastUpdatedTime === that.uniqueRenderTag) {
return WinJS.Promise.wrap(null)
}
var cc=locObj.getCurrentConditions();
var page=PlatformJS.Navigation.currentIPage;
if (page && page.displayLastUpdatedTime) {
page._lastUpdatedTime = cc.lastUpdatedTime;
page.displayLastUpdatedTime()
}
that.uniqueRenderTag = cc.lastUpdatedTime;
var weatherData=locObj;
var skiHeroData=weatherData.getCurrentConditions();
that._anchorLandscape = skiHeroData.heroImageData.anchorPoint;
that._anchorPortrait = skiHeroData.heroImageData.anchorPointPortrait;
that._focalLandscape = skiHeroData.heroImageData.focalPoint;
that._focalPortrait = skiHeroData.heroImageData.focalPointPortrait;
that._focalLowResLandscape = skiHeroData.heroImageData.focalPointLowRes;
that._focalLowResPortrait = skiHeroData.heroImageData.focalPointLowResPortrait;
var backgroundImage={
lowResolutionUrl: skiHeroData.heroImageData.lowResolutionUrl ? skiHeroData.heroImageData.lowResolutionUrl : skiHeroData.heroImageData.highResolutionUrl, highResolutionUrl: skiHeroData.heroImageData.highResolutionUrl
};
var anchorPoint=that._getAnchor();
var focalPointData=that._getFocal();
var imageSize=skiHeroData.heroImageData.imageSize;
var imageSizeLowRes=skiHeroData.heroImageData.imageSizeLowRes;
var attributionLabel=WeatherAppJS.Utilities.Common.getSkiAttributionData(cc);
var attributionData={
attributionText: attributionLabel, caption: ""
};
var heroItem={
moduleInfo: moduleInfo, data: {loc: weatherData}
};
var primaryHeroImageData={
backgroundImage: backgroundImage, imageSize: imageSize, imageSizeLowRes: imageSizeLowRes, focalPoint: focalPointData.focalPoint, focalPointLowRes: focalPointData.focalPointLowRes, anchorPoint: anchorPoint, attributionData: attributionData
};
var heroOptions={
layoutId: CommonJS.Immersive.HERO_LAYOUT_ONE_ITEM, heroItems: [heroItem], primaryHeroImageData: primaryHeroImageData
};
var platformHeroRenderPromise;
if (that._isFirstRender) {
that.setProperties(heroOptions);
that.renderLayout();
platformHeroRenderPromise = CommonJS.Immersive.PlatformHeroControl.prototype.render.call(that)
}
else {
platformHeroRenderPromise = CommonJS.Immersive.PlatformHeroControl.prototype.refresh.call(that, heroOptions)
}
var container=document.getElementById('mainContainer');
if (container) {
var currentConditionsModule=container.querySelector(".currentConditionsModule");
if (currentConditionsModule) {
currentConditionsModule.tabIndex = -1
}
}
return platformHeroRenderPromise.then(function() {
that._alertsPromise = WeatherAppJS.LocationsManager.getAlertsDataForLocationAsync(that._locId, that._bypassCache).then(null, function(e){});
that._isFirstRender = false;
return WinJS.Promise.wrap(null)
})
}, onWindowResize: function onWindowResize(event) {
CommonJS.WindowEventManager.HandleWindowResizeEvent.call(this, event, function HandleWindowResize() {
var uiUtilities=WeatherAppJS.Utilities.UI;
var viewManagement=Windows.UI.ViewManagement;
var layoutState=viewManagement.ApplicationView.value;
var that=this;
var currentWidth=(event && event.new) ? event.new.width : window.innerWidth;
if (!uiUtilities.showLimitedExperience(that._locId)) {
uiUtilities.setHeroClusterState(layoutState, null, true, currentWidth);
uiUtilities.setSeeMoreStatus(that.element, null, true, layoutState)
}
var viewState=viewManagement.ApplicationViewState;
if ((layoutState === viewState.fullScreenLandscape || layoutState === viewState.filled) && !uiUtilities.isLayoutVertical(currentWidth)) {
uiUtilities.adjustHeroClusterForResolution(null, that._locId, currentWidth)
}
else {
var animationContainer=document.querySelector('.animationContainer');
if (animationContainer) {
animationContainer.style.width = uiUtilities.minimizedAnimationContainerWidth
}
}
that.anchorPoint = that._getAnchor();
var focalPointData=that._getFocal();
that.focalPoint = focalPointData.focalPoint;
that.focalPointLowRes = focalPointData.focalPointLowRes
})
}, _getAnchor: function _getAnchor() {
var that=this;
var anchor;
if (Windows.UI.ViewManagement.ApplicationView.value === Windows.UI.ViewManagement.ApplicationViewState.fullScreenPortrait) {
anchor = that._anchorPortrait
}
else {
anchor = that._anchorLandscape
}
return anchor
}, _getFocal: function _getFocal() {
var that=this;
var focalData={};
if (Windows.UI.ViewManagement.ApplicationView.value === Windows.UI.ViewManagement.ApplicationViewState.fullScreenPortrait) {
focalData = {
focalPoint: that._focalPortrait ? that._focalPortrait : null, focalPointLowRes: that._focalLowResPortrait ? that._focalLowResPortrait : null
}
}
else {
focalData = {
focalPoint: that._focalLandscape ? that._focalLandscape : null, focalPointLowRes: that._focalLowResLandscape ? that._focalLowResLandscape : null
}
}
return focalData
}, dispose: function dispose() {
this.cleanUp()
}, cleanUp: function cleanUp() {
var that=this;
if (that._isDisposed) {
return
}
that._isDisposed = true;
CommonJS.Immersive.PlatformHeroControl.prototype.dispose.call(that);
that.uniqueRenderTag = null;
clearTimeout(WeatherAppJS.Utilities.UI._heroTemplateTimer)
}
})
});
WinJS.Class.mix(WeatherAppJS.Controls.Clusters.HeroClusterControl, WinJS.Utilities.createEventProperties(CommonJS.Immersive.ClusterControlRefreshedEvent), WinJS.UI.DOMEventMixin);
WinJS.Class.mix(WeatherAppJS.Controls.Clusters.SkiResortsHeroClusterControl, WinJS.Utilities.createEventProperties(CommonJS.Immersive.ClusterControlRefreshedEvent), WinJS.UI.DOMEventMixin)
})()