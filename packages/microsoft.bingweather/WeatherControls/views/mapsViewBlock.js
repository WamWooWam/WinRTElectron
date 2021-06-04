/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
WinJS.Namespace.define("WeatherAppJS.Controls.ViewBlocks", {
MapsItemsContainerView: WinJS.Class.derive(WeatherAppJS.Controls.ViewBlocks.WeatherItemsContainerView, function MapsItemsContainerView_constructor(element, options) {
WeatherAppJS.Controls.ViewBlocks.WeatherItemsContainerView.call(this, element, options)
}, {
_name: "WeatherAppJS.Controls.ViewBlocks.MapsItemsContainerView", isValidResponse: function isValidResponse(response) {
return true
}, render: function render(response) {
var that=this;
if (!that.isValidResponse(response)) {
return WinJS.Promise.wrapError({message: "invalid response"})
}
var adaptedResponse=that.adaptResponse(response);
return this._createView(adaptedResponse)
}, adaptResponse: function adaptResponse(response) {
var that=this;
var locName=that.locationName;
var maps=[];
var regionalMaps=response.getRegionalMaps();
if (regionalMaps && regionalMaps.length > 0) {
for (var regionalMap in regionalMaps) {
maps.push({
map: regionalMaps[regionalMap], moduleInfo: {
fragmentPath: "/html/mapsTemplate.html", templateId: "mapModule"
}, clickHandler: function clickHandler(data, event) {
msWriteProfilerMark("WeatherApp:HomePage:MapClicked");
WeatherAppJS.Utilities.UI.MapsFlyout.loadMapsFlyout(data.map, data.map.category, event.target);
var eventAttr={
location: locName, mapType: data.map.category + '-' + data.map.type
};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Maps Cluster", "Map Tile", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr))
}
})
}
}
var nationalMaps=response.getNationalMaps();
if (nationalMaps && nationalMaps.length > 0) {
for (var nationalMap in nationalMaps) {
maps.push({
map: nationalMaps[nationalMap], moduleInfo: {
fragmentPath: "/html/mapsTemplate.html", templateId: "mapModule"
}, clickHandler: function clickHandler(data, event) {
msWriteProfilerMark("WeatherApp:HomePage:MapClicked");
WeatherAppJS.Utilities.UI.MapsFlyout.loadMapsFlyout(data.map, data.map.category, event.target);
var eventAttr={
location: locName, mapType: data.map.category + '-' + data.map.type
};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Maps Cluster", "Map Tile", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr))
}
})
}
}
return maps
}
}), SkiSlideshowContainerView: WinJS.Class.derive(WeatherAppJS.Controls.ViewBlocks.WeatherItemsContainerView, function SkiSlideshowContainerView_constructor(element, options) {
WeatherAppJS.Controls.ViewBlocks.WeatherItemsContainerView.call(this, element, options)
}, {
_name: "WeatherAppJS.Controls.ViewBlocks.SkiSlideshowContainerView", isValidResponse: function isValidResponse(response) {
if (response && ((response.cams && response.cams instanceof Array && response.cams.length > 0) || (response.panos && response.panos instanceof Array && response.panos.length > 0))) {
return true
}
return false
}, adaptResponse: function adaptResponse(response) {
var that=this;
var locName="";
locName = that.locationName;
var itemSlides=[];
var data=[];
if (response.cams) {
for (var i=0; i < response.cams.length; i++) {
var item=response.cams[i];
itemSlides.push({
image: {
url: item.thumbnail, width: item.width, height: item.height
}, thumbnail: {url: item.thumbnail}, title: item.title ? item.title : "", desc: item.desc ? item.desc : "", uniqueIdentifier: item.uId ? item.uId : "", attribution: item.attr ? item.attr : ""
})
}
var firstElement=response.cams[0];
data.push({
thumbnail: firstElement.thumbnail, date: firstElement.date, moduleInfo: that._config.view.moduleInfo, clickHandler: function clickHandler(data, event) {
var state={
data: {
title: firstElement.title ? firstElement.title : "", desc: firstElement.desc ? firstElement.desc : "", slides: itemSlides
}, page: WeatherAppJS.Instrumentation.PageContext.SkiResortSlideshow
};
var eventAttr={resort: locName};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Ski Resorts Cams and 360Pano", "Ski Webcam", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr));
PlatformJS.Navigation.navigateToChannel("WeatherSlideshow", state)
}
})
}
if (response.panos) {
for (var i=0; i < response.panos.length; i++) {
var item=response.panos[i];
data.push({
title: item.title ? item.title : "", thumbnail: item.thumbnail, panoId: item.panoId, moduleInfo: {
fragmentPath: "/html/secondaryTemplates.html", templateId: "photosynthItemTemplate"
}, clickHandler: function clickHandler(data, event) {
PlatformJS.Navigation.navigateToChannel('Photosynth', {
panoId: data.panoId, page: WeatherAppJS.Instrumentation.PageContext.SkiResort360Pano
});
var eventAttr={resort: locName};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Ski Resorts Cams and 360Pano", "Ski 360Pano", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr))
}
})
}
}
return data
}
}), SkiDealsContainerView: WinJS.Class.derive(WeatherAppJS.Controls.ViewBlocks.WeatherItemsContainerView, function SkiDealsContainerView_constructor(element, options) {
WeatherAppJS.Controls.ViewBlocks.WeatherItemsContainerView.call(this, element, options)
}, {
_name: "WeatherAppJS.Controls.ViewBlocks.SkiDealsContainerView", isValidResponse: function isValidResponse(response) {
if (response && response.deals && response.deals instanceof Array && response.deals.length > 0) {
return true
}
return false
}, adaptResponse: function adaptResponse(response) {
var that=this;
var locName=that.locationName;
var data=[];
for (var i=0; i < response.deals.length; i++) {
var item=response.deals[i];
data.push({
thumbnail: item.thumbnail, dealTitle: item.dealTitle, dealText: item.dealText, dealUrl: item.dealUrl, moduleInfo: that._config.view.moduleInfo, clickHandler: function clickHandler(data, event) {
if (data.dealUrl) {
WeatherAppJS.Utilities.Common.navigateToWebView(data.dealUrl, WeatherAppJS.Instrumentation.PageContext.SkiResortNews)
}
var eventAttr={resort: locName};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Ski Resorts Deals", "Ski Deals and News", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr))
}
})
}
return data
}
}), SkiReviewContainerView: WinJS.Class.derive(WeatherAppJS.Controls.ViewBlocks.WeatherItemsContainerView, function SkiReviewContainerView_constructor(element, options) {
WeatherAppJS.Controls.ViewBlocks.WeatherItemsContainerView.call(this, element, options)
}, {
_name: "WeatherAppJS.Controls.ViewBlocks.SkiReviewContainerView", isValidResponse: function isValidResponse(response) {
if (response && response.reviewList && response.reviewList instanceof Array && response.reviewList.length > 0) {
return true
}
return false
}, adaptResponse: function adaptResponse(response) {
var that=this;
var weatherFormatting=WeatherAppJS.Utilities.Formatting;
var resourceLoader=PlatformJS.Services.resourceLoader;
var locName=that.locationName;
var data=[];
var diffPercent=100;
for (var i=0; i < response.ratingsList.length; i++) {
var item=response.ratingsList[i];
var threeStarPct=0;
var twoStarPct=0;
var fiveStarPct=weatherFormatting.getPercentageValue(item.ratingfive, item.totalRatings);
diffPercent = diffPercent - fiveStarPct;
var fourStarPct=weatherFormatting.getPercentageValue(item.ratingfour, item.totalRatings);
if (diffPercent > fourStarPct) {
diffPercent = diffPercent - fourStarPct;
threeStarPct = weatherFormatting.getPercentageValue(item.ratingthree, item.totalRatings);
if (diffPercent > threeStarPct) {
diffPercent = diffPercent - threeStarPct;
twoStarPct = weatherFormatting.getPercentageValue((item.ratingtwo + item.ratingone), item.totalRatings);
;
if (diffPercent < twoStarPct) {
twoStarPct = diffPercent
}
}
else {
threeStarPct = diffPercent
}
}
else {
fourStarPct = diffPercent
}
var ArrStar=[fiveStarPct, fourStarPct, threeStarPct, twoStarPct];
var arrBarChartColors=weatherFormatting.getBarFill(ArrStar);
var overall=Math.round(item.overAll);
var familyFriendly=Math.round(item.familyFriendly);
data.push({
overAllRating: overall, overAllStarRating: resourceLoader.getString('SkiReviewOverAllRating').format(overall), familyRating: familyFriendly, familyStarRating: resourceLoader.getString('SkiReviewOverAllRating').format(familyFriendly), totalRatings: resourceLoader.getString('SkiReviewRatings').format(item.totalRatings), ratingFiveValue: weatherFormatting.formatPercent(fiveStarPct), ratingFourValue: weatherFormatting.formatPercent(fourStarPct), ratingThreeValue: weatherFormatting.formatPercent(threeStarPct), ratingTwoValue: weatherFormatting.formatPercent(twoStarPct), ratingFiveNum: fiveStarPct, ratingFourNum: fourStarPct, ratingThreeNum: threeStarPct, ratingTwoNum: twoStarPct, ratingFiveBarColor: arrBarChartColors[fiveStarPct] ? arrBarChartColors[fiveStarPct] : "", ratingFourBarColor: arrBarChartColors[fourStarPct] ? arrBarChartColors[fourStarPct] : "", ratingThreeBarColor: arrBarChartColors[threeStarPct] ? arrBarChartColors[threeStarPct] : "", ratingTwoBarColor: arrBarChartColors[twoStarPct] ? arrBarChartColors[twoStarPct] : "", moduleInfo: {
fragmentPath: "/html/secondaryTemplates.html", templateId: "skiDetailsResortReviewChart"
}
})
}
for (var i=0; i < response.reviewList.length; i++) {
var item=response.reviewList[i];
data.push({
headline: item.headline, date: item.date, rating: item.rating, reviewText: item.reviewText, reviewUrl: item.reviewUrl, index: i, moduleInfo: {
fragmentPath: "/html/secondaryTemplates.html", templateId: "skiDetailsResortReview"
}, clickHandler: function clickHandler(data, event) {
if (data.reviewUrl) {
WeatherAppJS.Utilities.Common.navigateToWebView(data.reviewUrl, WeatherAppJS.Instrumentation.PageContext.SkiResortReview)
}
var eventAttr={
resort: locName, reviewIndex: data.index
};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Ski Resorts Reviews", "Ski Review", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr))
}
})
}
return data
}, render: function render(response) {
var that=this;
if (!that.isValidResponse(response)) {
return WinJS.Promise.wrapError({message: "invalid response"})
}
var adaptedResponse=that.adaptResponse(response);
var renderViewPromise=this._createView(adaptedResponse);
return renderViewPromise.then(function WeatherItemsContainerView_renderViewComplete() {
var ratingsChart=document.querySelector('.skiDetailsResortReviewChart');
if (ratingsChart) {
var resourceLoader=PlatformJS.Services.resourceLoader;
var skiRatingsTemplate="{0}," + resourceLoader.getString("SkiReviewOverAllText") + ", {1}, " + resourceLoader.getString("SkiReviewFamilyFriendly") + ", {2}," + resourceLoader.getString("SkiReviewFiveStarsText") + ", {3}," + resourceLoader.getString("SkiReviewFourStarsText") + ", {4}," + resourceLoader.getString("SkiReviewThreeStarsText") + ", {5}," + resourceLoader.getString("SkiReviewTwoStarsText") + ", {6},";
var ariaText=skiRatingsTemplate.format(adaptedResponse[0].totalRatings, adaptedResponse[0].overAllStarRating, adaptedResponse[0].familyStarRating, adaptedResponse[0].ratingFiveValue, adaptedResponse[0].ratingFourValue, adaptedResponse[0].ratingThreeValue, adaptedResponse[0].ratingTwoValue);
ratingsChart.setAttribute('role', 'region');
ratingsChart.setAttribute('aria-label', ariaText);
var ratingsContainer=document.getElementsByClassName('skiReviewDetailsList')[0];
var ratingsSection=ratingsContainer.childNodes[0];
if (ratingsSection) {
ratingsSection.setAttribute('aria-label', ariaText)
}
}
var ratingPlatformClusterItem=document.querySelector(".skiDetailsResortReviewChart");
if (ratingPlatformClusterItem) {
ratingPlatformClusterItem.parentNode.removeEventListener("MSLostPointerCapture", PlatformJS.Utilities.pointerEventListenersMap["MSLostPointerCapture"], false);
ratingPlatformClusterItem.parentNode.removeEventListener("MSPointerCancel", PlatformJS.Utilities.pointerEventListenersMap["MSPointerCancel"], false);
ratingPlatformClusterItem.parentNode.removeEventListener("MSPointerUp", PlatformJS.Utilities.pointerEventListenersMap["MSPointerUp"], false);
ratingPlatformClusterItem.parentNode.removeEventListener("MSPointerDown", PlatformJS.Utilities.pointerEventListenersMap["MSPointerDown"], false);
ratingPlatformClusterItem.parentNode.removeEventListener("MSPointerOut", PlatformJS.Utilities.pointerEventListenersMap["MSPointerOut"], false)
}
return WinJS.Promise.wrap(true)
})
}
}), NearbyResortsContainerView: WinJS.Class.derive(WeatherAppJS.Controls.ViewBlocks.WeatherItemsContainerView, function NearbyResortsContainerView_constructor(element, options) {
WeatherAppJS.Controls.ViewBlocks.WeatherItemsContainerView.call(this, element, options)
}, {
_name: "WeatherAppJS.Controls.ViewBlocks.NearbyResortsContainerView", isValidResponse: function isValidResponse(response) {
if (response && response.resorts && response.resorts instanceof Array && response.resorts.length > 0) {
return true
}
return false
}, adaptResponse: function adaptResponse(response) {
var that=this;
var locName=that.locationName;
var data=[];
for (var i=0; i < response.resorts.length; i++) {
var item=response.resorts[i];
data.push({
resortid: item.resortId, thumbnail: item.thumbnail, name: item.resortName, snow: item.snow, moduleInfo: that._config.view.moduleInfo, clickHandler: function clickHandler(data, event) {
var geocodeLocation=WeatherAppJS.GeocodeCache.getLocation(data.resortid);
var eventAttr={
currentLocation: locName, resortClicked: geocodeLocation.getFullDisplayName()
};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Nearby Resorts", "Ski Resort", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr));
PlatformJS.Navigation.navigateToChannel("Home", {
locID: geocodeLocation.getId(), geocodeLocation: geocodeLocation
})
}
})
}
return data
}
}), PhotosynthContainerView: WinJS.Class.derive(WeatherAppJS.Controls.ViewBlocks.WeatherItemsContainerView, function MapsItemsContainerView_constructor(element, options) {
WeatherAppJS.Controls.ViewBlocks.WeatherItemsContainerView.call(this, element, options)
}, {
_name: "WeatherAppJS.Controls.ViewBlocks.PhotosynthContainerView", isValidResponse: function isValidResponse(response) {
if (response && response.panos && response.panos instanceof Array && response.panos.length > 0) {
return true
}
return false
}, adaptResponse: function adaptResponse(response) {
var that=this;
var data=[];
for (var i=0; i < response.panos.length; i++) {
var item=response.panos[i];
data.push({
title: item.title ? item.title : "", thumbnail: item.thumbnail, panoId: item.panoId, moduleInfo: that._config.view.moduleInfo, clickHandler: function clickHandler(data, event) {
PlatformJS.Navigation.navigateToChannel('Photosynth', {panoId: data.panoId})
}
})
}
return data
}
})
})
})()