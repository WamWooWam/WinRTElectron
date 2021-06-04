/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
WinJS.Namespace.define("WeatherAppJS.Share", {
init: function init() {
var that=this;
var dataTransferManager=Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
dataTransferManager.addEventListener("datarequested", that.shareDataRequestedEventHandler);
PlatformJS.platformInitializedPromise.then(function() {
PlatformJS.Utilities.addAppexUriScheme("bingweather")
});
var placesController={default: function(args) {
return PlatformJS.Navigation.createNavigationAction({channelId: "MyPlaces"})
}};
var weatherMapsController={default: function(args) {
var channelInfo=PlatformJS.Navigation.mainNavigator.channelManager.resolveChannel("WeatherMaps", "standard");
if (channelInfo && channelInfo.pageInfo) {
return PlatformJS.Navigation.createNavigationAction({
channelId: channelInfo.id, state: channelInfo.state
})
}
else {
return PlatformJS.Navigation.createCommand("application", "default")
}
}};
var skiResortsController={default: function(args) {
var channelInfo=PlatformJS.Navigation.mainNavigator.channelManager.resolveChannel("SkiResorts", "standard");
if (channelInfo && channelInfo.pageInfo) {
return PlatformJS.Navigation.createNavigationAction({
channelId: channelInfo.id, state: channelInfo.state
})
}
else {
return PlatformJS.Navigation.createCommand("application", "default")
}
}};
var worldWeatherController={default: function(args) {
return PlatformJS.Navigation.createNavigationAction({channelId: "WorldWeather"})
}};
var helpController={default: function(args) {
msSetImmediate(CommonJS.Settings.onHelpCmd);
return PlatformJS.Navigation.createNoopAction()
}};
var getLocationViewCommand=this.getLocationViewCommand.bind(this);
PlatformJS.Navigation.addDefaultController();
PlatformJS.Navigation.addController("places", placesController);
PlatformJS.Navigation.addController("weathermaps", weatherMapsController);
PlatformJS.Navigation.addController("skiresorts", skiResortsController);
PlatformJS.Navigation.addController("worldweather", worldWeatherController);
PlatformJS.Navigation.addController("help", helpController);
PlatformJS.Navigation.addEntityView("location", getLocationViewCommand);
PlatformJS.Navigation.addEntityView("ski", getLocationViewCommand);
PlatformJS.Navigation.addEntityView("article", this.articleEntityView);
PlatformJS.Navigation.addEntityView("pano", this.panoView);
PlatformJS.Navigation.addEntityView("geolocation", getLocationViewCommand);
PlatformJS.Navigation.addCommonEntityViews();
PlatformJS.Navigation.addPartnerPanoEntityView()
}, panoView: function panoView(args) {
var navAction=PlatformJS.Navigation.createCommand("application", "default");
var channelInfo;
var panoId=args.panoid ? args.panoid : null;
if (panoId) {
switch (panoId) {
case"places":
navAction = PlatformJS.Navigation.createNavigationAction({channelId: "MyPlaces"});
break;
case"weathermaps":
channelInfo = PlatformJS.Navigation.mainNavigator.channelManager.resolveChannel("WeatherMaps", "standard");
if (channelInfo && channelInfo.pageInfo) {
navAction = PlatformJS.Navigation.createNavigationAction({
channelId: channelInfo.id, state: channelInfo.state
})
}
else {
navAction = PlatformJS.Navigation.createCommand("application", "default")
}
break;
case"skiresorts":
channelInfo = PlatformJS.Navigation.mainNavigator.channelManager.resolveChannel("SkiResorts", "standard");
if (channelInfo && channelInfo.pageInfo) {
navAction = PlatformJS.Navigation.createNavigationAction({
channelId: channelInfo.id, state: channelInfo.state
})
}
else {
navAction = PlatformJS.Navigation.createCommand("application", "default")
}
break;
case"worldweather":
navAction = PlatformJS.Navigation.createNavigationAction({channelId: "WorldWeather"});
break;
case"help":
msSetImmediate(CommonJS.Settings.onHelpCmd);
navAction = PlatformJS.Navigation.createNoopAction();
break;
case"addfavorite":
navAction = PlatformJS.Navigation.createNavigationAction({
channelId: "MyPlaces", state: {action: 'onAddFavoriteClick'}
});
break;
case"changehome":
navAction = PlatformJS.Navigation.createNavigationAction({
channelId: "MyPlaces", state: {action: 'onChangeHomeClick'}
});
break;
default:
break
}
}
return navAction
}, articleEntityView: function articleEntityView(args) {
var providerConfiguration=PlatformJS.Collections.createStringDictionary();
var mkt=args.market ? args.market : Platform.Globalization.Marketization.getMarketLocation().toLowerCase();
providerConfiguration.insert("queryServiceId", "RenderProxy_CustomPanoDataSource");
providerConfiguration.insert("fallbackQueryServiceId", "CustomPanoDataSource");
providerConfiguration.insert("market", mkt);
var arConfig={
providerType: "AppEx.Common.ArticleReader.BedrockArticleProvider", providerConfiguration: providerConfiguration
};
var articleId=null;
if (args.articleid) {
articleId = args.articleid
}
else if (args.pageid) {
articleId = args.pageid + (args.contentid ? "/" + args.contentid : "")
}
if (articleId) {
var entityItem={
providerType: arConfig.providerType, providerConfiguration: arConfig.providerConfiguration, initialArticleId: articleId, market: args.market, source: 2, enableSharing: true
};
return PlatformJS.Navigation.createNavigationAction({
channelId: "ArticleReader", state: entityItem
})
}
return PlatformJS.Navigation.createCommand("application", "default")
}, getLocationViewCommand: function getLocationViewCommand(args) {
CommonJS.Progress.showProgress(CommonJS.Progress.headerProgressType);
return this.parseLocationViewArgsAsync(args).then(function(responseData) {
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
if (responseData && responseData.locationObject) {
var geoLoc=responseData.locationObject;
var state,
targetPage="Home";
if (geoLoc.getId() !== WeatherAppJS.SettingsManager.getDefaultLocationId()) {
targetPage = "Home";
state = {
locID: geoLoc.getId(), geocodeLocation: geoLoc, searchingLocation: false, isHome: false
}
}
return PlatformJS.Navigation.createNavigationAction({
channelId: targetPage, state: state
})
}
else {
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString("ShareDataNotAvailableError"), false);
return null
}
}, function(err) {
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
if (PlatformJS.Utilities.isPromiseCanceled(err)) {
return
}
else if (!WeatherAppJS.Networking.internetAvailable) {
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString("NoInternetConnectionError"), false)
}
else {
WeatherAppJS.Error.showMessageBar(PlatformJS.Services.resourceLoader.getString("ShareDataNotAvailableError"), false)
}
})
}, shareDataRequestedEventHandler: function shareDataRequestedEventHandler(e) {
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NumTimesDataShared");
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.ActionContext.charms, "Share", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0);
var request=e.request;
var videoPlayer=CommonJS.MediaApp.Controls.MediaPlayback.instance;
if (videoPlayer && videoPlayer.isPlaying && videoPlayer.handleShareRequest) {
videoPlayer.handleShareRequest(request)
}
else {
var currentIPage=PlatformJS.Navigation.currentIPage;
var pageName=WeatherAppJS.Utilities.Common.getCurrentPage();
var pageState=currentIPage ? currentIPage.getPageState() : null;
if ((pageName === "WeatherAppJS.DailyForecast" || pageName === "WeatherAppJS.Pages.Home") && (!WeatherAppJS.SettingsManager.isFRE() && WeatherAppJS.LocationsManager.getDefaultLocation()) && !WeatherAppJS.LocationsManager.isMarketBlockedByIP && currentIPage) {
var locID=null;
if (pageState && pageState.locID) {
locID = pageState.locID
}
else {
locID = WeatherAppJS.SettingsManager.getDefaultLocationId()
}
var geoLoc=WeatherAppJS.GeocodeCache.getLocation(locID);
if (geoLoc) {
var that=WeatherAppJS.Share;
var standardDataFormats=Windows.ApplicationModel.DataTransfer.StandardDataFormats;
var title=PlatformJS.Services.resourceLoader.getString("SharePageTitle").format(geoLoc.getShortDisplayName());
request.data.properties.title = title;
request.data.properties.description = "";
request.data.setDataProvider(standardDataFormats.html, function(providerRequest) {
that.onDeferredDataRequested(providerRequest, geoLoc, standardDataFormats.html)
});
request.data.setDataProvider(standardDataFormats.text, function(providerRequest) {
that.onDeferredDataRequested(providerRequest, geoLoc, standardDataFormats.text)
});
request.data.setDataProvider(standardDataFormats.applicationLink, function(providerRequest) {
that.onDeferredDataRequested(providerRequest, geoLoc, standardDataFormats.applicationLink)
});
that.getGeocodeLocationForSharingAsync(geoLoc).then()
}
}
else if (pageName === "WeatherAppJS.ArticleReaderPage" || pageName === "CommonJS.WebViewArticleReaderPage" || pageName === "WeatherAppJS.Pages.SlideshowPage" || pageName === "CommonJS.Slideshow.SlideshowPage") {
if (currentIPage && currentIPage.handleShareRequest) {
if (!currentIPage.canShareRequest || currentIPage.canShareRequest()) {
currentIPage.handleShareRequest(request)
}
}
}
else {
request.failWithDisplayText(PlatformJS.Services.resourceLoader.getString("ShareInvalidSharePageMessage"))
}
}
}, onDeferredDataRequested: function onDeferredDataRequested(request, geoLoc, format) {
var deferral=request.getDeferral();
function setShareData(uriString) {
try {
if (!uriString) {
var uriBuilder=new Platform.Utilities.AppExUriBuilder;
uriBuilder.controllerId = "application";
uriString = uriBuilder.toString()
}
if (format === Windows.ApplicationModel.DataTransfer.StandardDataFormats.html) {
CommonJS.loadModule({
fragmentPath: "/html/delayedTemplate.html", templateId: "shareTemplate"
}, {}).then(function(template) {
var resourceFile=PlatformJS.Services.resourceLoader;
var locationNameText=geoLoc.getShortDisplayName();
var snippetText=resourceFile.getString("ShareSnippet").format(geoLoc.getShortDisplayName());
var elem=document.createElement("a");
elem.href = uriString;
elem.innerText = resourceFile.getString("/platform/win8ShareLink").format(resourceFile.getString("AppTitle"));
elem.style.cssText = "color: rgb(0, 130, 153);";
var deepLinkHTML=resourceFile.getString("/platform/win8Share").format(resourceFile.getString("/platform/win8Brand"), resourceFile.getString("/platform/winPhone8Brand"), elem.outerHTML);
template.querySelector("#locationName").innerText = locationNameText;
template.querySelector("#snippet").innerText = snippetText;
template.querySelector("#deepLink").innerHTML = deepLinkHTML;
var html=Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.createHtmlFormat(template.innerHTML);
request.setData(html);
deferral.complete()
}, function(error) {
deferral.complete()
})
}
else if (format === Windows.ApplicationModel.DataTransfer.StandardDataFormats.text) {
request.setData(uriString);
deferral.complete()
}
else if (format === Windows.ApplicationModel.DataTransfer.StandardDataFormats.applicationLink) {
var uri=new Windows.Foundation.Uri(uriString);
request.setData(uri);
deferral.complete()
}
else {
deferral.complete()
}
}
catch(error) {
deferral.complete()
}
}
WeatherAppJS.Share.getGeocodeLocationForSharingAsync(geoLoc).then(function(invariantLoc) {
if (invariantLoc) {
var uriBuilder=new Platform.Utilities.AppExUriBuilder;
uriBuilder.controllerId = "application";
uriBuilder.commandId = "view";
uriBuilder.queryParameters.insert("entityType", invariantLoc.getLocTypeString());
if (invariantLoc.locType === WeatherAppJS.GeocodeLocation.locationType.skiLocation) {
uriBuilder.queryParameters.insert("id", invariantLoc.getId())
}
else {
uriBuilder.queryParameters.insert("id", invariantLoc.getQueryName())
}
if (invariantLoc.locType !== WeatherAppJS.GeocodeLocation.locationType.skiLocation) {
var trimLatLong=WeatherAppJS.Utilities.Common.trimLatLong;
var la=trimLatLong(invariantLoc.latitude);
var lo=trimLatLong(invariantLoc.longitude);
uriBuilder.queryParameters.insert("la", la);
uriBuilder.queryParameters.insert("lo", lo)
}
uriBuilder.queryParameters.insert("iso2", invariantLoc.isoCode);
var uriString=uriBuilder.toString();
setShareData(uriString)
}
else {
setShareData(null)
}
}, function(error) {
setShareData(null)
})
}, parseLocationViewArgsAsync: function parseLocationViewArgsAsync(args) {
try {
if (args && args.id) {
var latitude=args.la || "";
var longitude=args.lo || "";
var isoCode=args.iso2 || "";
var locName=args.id;
var locType=WeatherAppJS.GeocodeLocation.getLocTypeFromString(args.entityType);
return this.getGeocodeLocationFromSharedLinkAsync(locName, latitude, longitude, isoCode, locType).then(function(geoLoc) {
if (geoLoc) {
return WeatherAppJS.LocationsManager.tryFetchingCCDataAsync(geoLoc, false)
}
else {
return WinJS.Promise.wrap(null)
}
})
}
else if (args) {
latitude = args.lat || args.la || "";
longitude = args.long || args.lo || "";
return this.getLocationDataAsync(latitude, longitude).then(function(geoLoc) {
if (geoLoc) {
return WeatherAppJS.LocationsManager.tryFetchingCCDataAsync(geoLoc, false)
}
else {
return WinJS.Promise.wrap(null)
}
})
}
}
catch(e) {}
return WinJS.Promise.wrap(null)
}, getLocationDataAsync: function getLocationDataAsync(latitude, longitude) {
var that=WeatherAppJS.LocationTracking;
return new WinJS.Promise(function(complete, error) {
CommonJS.Progress.showProgress(CommonJS.Progress.headerProgressType);
that.getLocationDataByLatLongAsync(latitude, longitude).then(function(locationObj) {
complete(locationObj)
}, function(err) {
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
error(err)
})
})
}, getGeocodeLocationFromSharedLinkAsync: function getGeocodeLocationFromSharedLinkAsync(locName, latitude, longitude, isoCode, locType) {
var culture=WeatherAppJS.LocationSuggest.getVECultureCode();
var useTianQi=Platform.Utilities.Globalization.isFeatureEnabled("UseTianQi");
if (useTianQi && (locType === WeatherAppJS.GeocodeLocation.locationType.skiLocation)) {
return WinJS.Promise.wrap(null)
}
if (locType !== WeatherAppJS.GeocodeLocation.locationType.skiLocation) {
var isGeocodingAPIEnabled=Platform.Utilities.Globalization.isFeatureEnabled("VEGeocodingAPISuggestions");
if (isGeocodingAPIEnabled && locName) {
return WeatherAppJS.LocationSuggest.getLocalizedGeocodeLocationAync(locName, latitude, longitude, isoCode).then(function(loc) {
if (!loc) {
return WeatherAppJS.LocationSuggest.getLocationByLatLongAsync(latitude, longitude, locName, locType, culture)
}
else {
return WinJS.Promise.wrap(loc)
}
})
}
else if (!isGeocodingAPIEnabled && latitude !== undefined && longitude !== undefined) {
return WeatherAppJS.LocationSuggest.getLocationByLatLongAsync(latitude, longitude, locName, locType, culture)
}
}
else {
return WeatherAppJS.LocationSuggest.getLocationByLatLongAsync(latitude, longitude, locName, locType, culture)
}
return WinJS.Promise.wrap(null)
}, getGeocodeLocationForSharingAsync: function getGeocodeLocationForSharingAsync(geoLoc) {
if (geoLoc) {
if (geoLoc.locType !== WeatherAppJS.GeocodeLocation.locationType.skiLocation) {
var isGeocodingAPIEnabled=Platform.Utilities.Globalization.isFeatureEnabled("VEGeocodingAPISuggestions");
if (isGeocodingAPIEnabled) {
return WeatherAppJS.LocationSuggest.getInvariantGeocodeLocationAync(geoLoc.getQueryName(), geoLoc.latitude, geoLoc.longitude, geoLoc.isoCode).then(function(iLoc) {
if (!iLoc) {
return WeatherAppJS.LocationSuggest.getInvariantLocationByLatLongAsync(geoLoc.latitude, geoLoc.longitude, geoLoc.id, geoLoc.locType)
}
else {
return WinJS.Promise.wrap(iLoc)
}
}, function(err) {
return WinJS.Promise.wrap(null)
})
}
else {
return WeatherAppJS.LocationSuggest.getInvariantLocationByLatLongAsync(geoLoc.latitude, geoLoc.longitude, geoLoc.id, geoLoc.locType)
}
}
else {
return WeatherAppJS.LocationSuggest.getInvariantLocationByLatLongAsync(geoLoc.latitude, geoLoc.longitude, geoLoc.id, geoLoc.locType)
}
}
return WinJS.Promise.wrap(null)
}
});
WeatherAppJS.Share.init()
})()