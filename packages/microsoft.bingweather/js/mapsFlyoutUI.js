/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
WinJS.Namespace.define("WeatherAppJS.Utilities.UI.MapsFlyout", {
imageHolder: null, isShown: false, isSliderInitialized: false, thumbnailUrl: "", loadMapsFlyout: function loadMapsFlyout(mapdata, mapCategory, sourceTile) {
WeatherAppJS.Utilities.UI.MapsFlyout.isSliderInitialized = false;
var resourceLoader=PlatformJS.Services.resourceLoader;
if (!mapdata || !mapdata.mapList || !mapdata.mapList[0] || !mapdata.mapList[0].ImageUrl) {
return
}
WeatherAppJS.Utilities.UI.MapsFlyout.imageHolder = document.createElement('div');
var flyoutAnchor=document.getElementById("mapsFlyoutAnchor");
var flyoutNode=flyoutAnchor.querySelector("#mapsFlyout");
var p=WinJS.Promise.wrap(true);
if (!flyoutNode) {
p = CommonJS.loadModule({
fragmentPath: "/html/mapsTemplate.html", templateId: "mapsFlyoutTemplate"
}, {}, null, null, null).then(function(template) {
flyoutNode = template.querySelector("#mapsFlyout");
flyoutAnchor.appendChild(template)
})
}
p.then(function() {
var weatherFormatting=WeatherAppJS.Utilities.Formatting;
var shortDateTimeFormat=PlatformJS.Services.resourceLoader.getString('ShortDateTimeFormatString');
var that=WeatherAppJS.Utilities.UI.MapsFlyout;
var snapTime=weatherFormatting.getFormattedMapSnapTime(mapdata.mapList[0].SnapTime, shortDateTimeFormat);
var ariaText=resourceLoader.getString("MapFlyoutAriaText").format(mapdata.type, mapCategory, snapTime);
flyoutNode.setAttribute("aria-label", ariaText);
WeatherAppJS.Utilities.UI.ShowFlyoutBackground(false);
WeatherAppJS.Utilities.Instrumentation.incrementInt32("MapsTileTapped");
msWriteProfilerMark("WeatherApp:MapsFlyoutLoad:s");
var mapsHeaderDiv=flyoutNode.querySelector("#mapsFlyoutHeaderDiv");
mapsHeaderDiv.innerText = '';
var mapsHeader=document.createElement("h2");
mapsHeader.innerText = mapdata.type;
WinJS.Utilities.addClass(mapsHeader, "mapsFlyoutHeader");
mapsHeaderDiv.appendChild(mapsHeader);
var mapsColorCodeTextDiv=flyoutNode.querySelector("#mapsFlyoutColorCodeTextDiv");
var mapsColorCodeImageDiv=flyoutNode.querySelector("#mapsFlyoutColorCodeImageDiv");
var mapsColorCodeImage=mapsColorCodeImageDiv.querySelector("#colorCodeImg");
if (mapdata.type === resourceLoader.getString("DopplerRadar")) {
mapsColorCodeTextDiv.style.display = "block";
mapsColorCodeImageDiv.style.display = "block";
mapsColorCodeImage.src = "/images/mapsFlyout/dopplerlegend.png"
}
else if (mapdata.type === resourceLoader.getString("Precipitation")) {
mapsColorCodeTextDiv.style.display = "block";
mapsColorCodeImageDiv.style.display = "block";
mapsColorCodeImage.src = "/images/mapsFlyout/preciplegend.png"
}
else {
mapsColorCodeTextDiv.style.display = "none";
mapsColorCodeImageDiv.style.display = "none"
}
var attributionElem=flyoutNode.querySelector("#mapsFlyoutAttribution");
var weatherDotCom=resourceLoader.getString("Weather.com");
if (mapdata.attributionUrl && mapdata.ProviderName === weatherDotCom) {
var attributionLinkElem=document.createElement("a");
attributionLinkElem.setAttribute("href", mapdata.attributionUrl);
attributionLinkElem.innerText = WeatherAppJS.Utilities.Common.getWeatherDotComBaseUrl();
attributionElem.innerHTML = resourceLoader.getString("WeatherDotComMapsAttribution").format(attributionLinkElem.outerHTML);
attributionElem.style.display = "block"
}
else {
attributionElem.style.display = "none"
}
that.thumbnailUrl = mapdata.thumbnailUrl;
document.getElementById("mapsFlyoutError").style.display = "none";
var mapsFlyout=flyoutNode.winControl;
mapsFlyout.addEventListener("beforehide", function mapsFlyout_beforeHide(event) {
var progress=CommonJS.Progress;
progress.hideProgress(progress.centerProgressType)
});
mapsFlyout.addEventListener("afterhide", function mapsFlyout_afterHide(event) {
that.resetFlyout();
sourceTile.focus()
});
var anchor=document.getElementById('mapsFlyoutAnchor');
if (mapsFlyout && mapsFlyout.hidden) {
var viewId=mapdata.type + '_' + mapCategory;
that.addMapView(viewId, mapdata.mapList);
mapsFlyout.show(anchor);
if (mapdata.isAnimated) {
WinJS.UI.Animation.showPopup(flyoutNode).done(function() {
that.initMapsAnimation();
changeWamView(viewId)
})
}
else {
wamStaticMapDisplay(viewId);
WinJS.UI.Animation.showPopup(flyoutNode)
}
}
that.isShown = true;
msWriteProfilerMark("WeatherApp:MapsFlyoutLoad:e")
}, function(err) {
return
})
}, addMapView: function addMapView(view, mapList) {
var maxviews=0;
var wt_indx=0;
var twt="";
var numOfImages=0;
var snapTime=PlatformJS.Services.resourceLoader.getString("SnapTime");
var weatherFormatting=WeatherAppJS.Utilities.Formatting;
var shortDateTimeFormat=PlatformJS.Services.resourceLoader.getString('ShortDateTimeFormatString');
if (mapList && mapList.length > 0) {
wamviews[view] = {};
wamviews[view].button = wamconsts.buttonString;
wamviews[view].imgs = [];
wt_indx = 0;
numOfImages = mapList.length;
for (var tempmap in mapList) {
wamviews[view].imgs[wt_indx] = {};
wamviews[view].imgs[wt_indx].url = mapList[tempmap].ImageUrl;
wamviews[view].imgs[wt_indx].status = wamconsts.NOTLOADED;
var mapSnapTime=weatherFormatting.getFormattedMapSnapTime(mapList[tempmap].SnapTime, shortDateTimeFormat);
twt = snapTime.format(mapSnapTime);
wamviews[view].imgs[wt_indx].timestamp = twt;
wt_indx++
}
wamviews[view].imagesToLoad = wt_indx;
wamviews[view].imgs[0].status = wamconsts.LOADED;
wamviews[view].maximgs = wt_indx;
wamobj.viewid = view
}
}, initMapsAnimation: function initMapsAnimation() {
if (jQuery) {
if ($('#slider-range-min > div').size() === 0) {
$(document).ready(function() {
if ((typeof(wamDocumentReady) !== "undefined")) {
WeatherAppJS.Utilities.UI.MapsFlyout.isSliderInitialized = true;
wamDocumentReady();
resetWamParams()
}
})
}
}
}, resetFlyout: function resetFlyout() {
var that=WeatherAppJS.Utilities.UI.MapsFlyout;
if (!that.isShown) {
return
}
WeatherAppJS.Utilities.UI.ShowFlyoutBackground(false);
var mapsImg=document.getElementById("mapsFlyoutImageb0");
if (mapsImg) {
mapsImg.src = wamconsts.clearImgUrl
}
clearInterval(wam_timer_key);
var mapsSlider=document.getElementById('mapsFlyoutSliderDiv');
if (mapsSlider) {
mapsSlider.style.display = ''
}
resetWamParams();
if (WeatherAppJS.Utilities.UI.MapsFlyout.isSliderInitialized) {
destroySlider()
}
CommonJS.Progress.resetProgress(CommonJS.Progress.centerProgressType);
that.imageHolder.innerHTML = "";
that.isShown = false
}, mapsPlayHandler: function mapsPlayHandler() {
wamPlay()
}
});
var wamconsts={
PLAY: 0, PAUSE: 1, STOP: 2, LOADED: 0, NOTLOADED: 1, ERROR: 2, numImgThread: 20, buttonString: "mapsFlyoutImageb", clearImgUrl: "/images/mapsFlyout/a_clear.gif", img_tick: 512, timer_tick: 1 << 5, slider_inc: 1 << 5
};
var wamparams={imgNumThreshold: 20};
var wamobj={
viewid: null, error: false
};
var wamviews=[];
var wam_timer_key;
var waminit;
function wamDisplayError() {
var img=document.createElement('img');
WeatherAppJS.Utilities.UI.MapsFlyout.imageHolder.appendChild(img);
$(img).attr('src', WeatherAppJS.Utilities.UI.MapsFlyout.thumbnailUrl);
$(img).load(function() {
document.getElementById(wamviews[wamobj.viewid].button + "0").src = WeatherAppJS.Utilities.UI.MapsFlyout.thumbnailUrl
});
$(img).error(function() {
document.getElementById(wamviews[wamobj.viewid].button + "0").style.display = "none"
});
document.getElementById(wamviews[wamobj.viewid].button + "ts").innerText = "";
document.getElementById("mapsFlyoutError").style.display = ""
}
function wamDisplay(index) {
if (index === wamviews[wamobj.viewid].maximgs) {
return
}
if (wamobj.img_index !== index) {
var bid=wamviews[wamobj.viewid].button;
var ts="#" + bid + index;
if (wamviews[wamobj.viewid] && wamviews[wamobj.viewid].imgs && wamviews[wamobj.viewid].imgs[index]) {
document.getElementById(wamviews[wamobj.viewid].button + "0").src = wamviews[wamobj.viewid].imgs[index].url;
document.getElementById(wamviews[wamobj.viewid].button + "ts").innerText = wamviews[wamobj.viewid].imgs[index].timestamp;
document.getElementById(wamviews[wamobj.viewid].button + "0").style.display = "block";
wamobj.img_index = index
}
}
}
function wamStaticMapDisplay(viewId) {
document.getElementById('mapsFlyoutSliderDiv').style.display = 'none';
wamobj.viewid = viewId;
wamobj.img_index = -1;
var img=document.createElement('img');
WeatherAppJS.Utilities.UI.MapsFlyout.imageHolder.appendChild(img);
if ($) {
$(img).load(function(){});
$(img).error(function() {
wamDisplayError();
return
})
}
if (wamviews[viewId] && wamviews[viewId].imgs && wamviews[viewId].imgs.length > 0) {
$(img).attr('src', wamviews[viewId].imgs[0].url)
}
wamDisplay(0)
}
function resetWamParams() {
wamobj.img_index = 0;
wamobj.slider_state = wamconsts.PAUSE;
wamobj.error = false;
wamparams.slider_max = (wamviews[wamobj.viewid].maximgs - 1) * (wamconsts.img_tick);
if (WeatherAppJS.Utilities.UI.MapsFlyout.isSliderInitialized) {
resetSlider()
}
}
function cleanOldViewState(viewId) {
endImgLoadingEffect(viewId)
}
function changeWamView(viewId) {
clearInterval(wam_timer_key);
wamobj.viewid = viewId;
wamobj.img_index = -1;
startImgLoadingEffect(viewId);
showFirstImage();
resetWamParams();
wamPlay()
}
function showFirstImage() {
var index=0;
if (wamobj.img_index !== index) {
var bid=wamviews[wamobj.viewid].button;
var ts="#" + bid + index;
if (wamviews[wamobj.viewid] && wamviews[wamobj.viewid].imgs && wamviews[wamobj.viewid].imgs[index]) {
var img=document.createElement('img');
WeatherAppJS.Utilities.UI.MapsFlyout.imageHolder.appendChild(img);
$(img).attr('src', wamviews[wamobj.viewid].imgs[index].url);
$(img).load(function() {
document.getElementById(wamviews[wamobj.viewid].button + "0").src = wamviews[wamobj.viewid].imgs[index].url;
document.getElementById(wamviews[wamobj.viewid].button + "ts").innerText = wamviews[wamobj.viewid].imgs[index].timestamp;
document.getElementById(wamviews[wamobj.viewid].button + "0").style.display = "block";
wamobj.img_index = index
});
$(img).error(function() {
endImgLoadingEffect(wamobj.viewid);
wamDisplayError()
})
}
}
}
function resetSlider() {
$("#slider-range-min").slider("option", "max", wamparams.slider_max);
$("#slider-range-min").trigger("onsliderinit");
if (wamviews[wamobj.viewid].imagesToLoad !== 0) {
$("#slider-range-min").slider("disable")
}
else {
$("#slider-range-min").slider("enable")
}
wamSetBtState("play")
}
function destroySlider() {
var sliderDiv=$("#slider-range-min");
if (sliderDiv) {
sliderDiv.slider("destroy");
sliderDiv.unbind()
}
}
function triggerSlider() {
$("#slider-range-min").trigger("ontimertick")
}
function wamDocumentReady() {
$("#slider-range-min").slider({
range: "min", value: 0, min: 0, max: wamparams.slider_max, animate: false, disabled: true, start: function start(event, ui) {
clearInterval(wam_timer_key);
if (getSliderState() === wamconsts.STOP) {
setSliderState(wamconsts.PAUSE)
}
}, slide: function slide(event, ui) {
var index=Math.floor(ui.value / wamconsts.img_tick);
clearInterval(wam_timer_key);
wamDisplay(index)
}, change: function change(event, ui) {
var index=Math.floor(ui.value / wamconsts.img_tick);
wamDisplay(index);
if (index === (wamviews[wamobj.viewid].maximgs - 1)) {
clearInterval(wam_timer_key);
setSliderState(wamconsts.STOP)
}
}, stop: function stop(event, ui) {
var tmp_index=wamconsts.slider_inc * Math.round(ui.value / wamconsts.slider_inc);
var index=0;
ui.value = tmp_index;
index = Math.floor(ui.value / wamconsts.img_tick);
$(this).slider('value', ui.value);
wamDisplay(index);
if (getSliderState() === wamconsts.PLAY) {
wam_timer_key = setInterval(triggerSlider, wamconsts.timer_tick)
}
}
});
$("#slider-range-min").bind('ontimertick', function(e) {
$("#slider-range-min").each(function(e, ui) {
var tmp=$(this).slider('value') + wamconsts.slider_inc;
if (tmp > wamparams.slider_max) {
tmp = wamparams.slider_max
}
$(this).slider('value', tmp)
})
});
$("#slider-range-min").bind('onsliderinit', function(e) {
$("#slider-range-min").each(function(e, ui) {
$(this).slider('value', 0)
})
})
}
function wamSetBtState(state) {
var button="#wam_bt";
$(button).attr("aria-label", PlatformJS.Services.resourceLoader.getString(state));
$(button).removeClass("loading play pause");
$(button).addClass(state)
}
function wamPlay() {
var button="#wam_bt";
if ($(button).hasClass("play")) {
if (wamviews[wamobj.viewid].imagesToLoad > 0) {
wamSetBtState("loading");
preLoadAnimImages(wamobj.viewid)
}
else {
wamSetBtState("pause");
sliderCmdPlay()
}
}
else if ($(button).hasClass("pause")) {
wamSetBtState("play");
sliderCmdPause()
}
else if ($(button).hasClass("loading")) {
abortLoadImage(wamobj.viewid);
wamSetBtState("play");
$(button).attr("alt", PlatformJS.Services.resourceLoader.getString("loading"))
}
}
function wamImgLoad(source, viewId, imageId) {
wamviews[viewId].imgs[imageId].status = wamconsts.LOADED;
wamviews[viewId].imagesToLoad -= 1;
if (wamviews[viewId].imagesToLoad === 0) {
endImgLoadingEffect(viewId);
if (viewId === wamobj.viewid) {
if (wamobj.error) {
wamDisplayError();
return
}
wamSetBtState("pause");
sliderCmdPlay()
}
}
}
function wamImgError(source, viewId, imageId) {
wamobj.error = true;
wamviews[viewId].imgs[imageId].status = wamconsts.ERROR;
wamviews[viewId].imagesToLoad -= 1;
if (wamviews[viewId].imagesToLoad === 0) {
endImgLoadingEffect(viewId);
if (viewId === wamobj.viewid) {
if (wamobj.error) {
wamDisplayError();
return
}
wamSetBtState("pause");
sliderCmdPlay()
}
}
}
function abortLoadImage(viewId) {
wamviews[viewId].imagesToLoad = wamviews[viewId].maximgs;
endImgLoadingEffect(viewId)
}
function dispatchParallerImageLoad(viewId, max) {
for (var i=0; (i < wamconsts.numImgThread) && (i < max); i++) {
loadImage(viewId, i, max)
}
}
function loadImage(viewId, index, max) {
if (viewId !== wamobj.viewid || !WeatherAppJS.Utilities.UI.MapsFlyout.isShown) {
abortLoadImage(viewId);
return
}
if (index < max) {
msWriteProfilerMark("WeatherApp:MapsImageLoad:s");
var img=document.createElement('img');
WeatherAppJS.Utilities.UI.MapsFlyout.imageHolder.appendChild(img);
$(img).load(function() {
wamImgLoad(this, viewId, index);
msWriteProfilerMark("WeatherApp:MapsImageLoad:e");
loadImage(viewId, index + wamconsts.numImgThread, max)
});
$(img).error(function() {
wamImgError(this, viewId, index);
msWriteProfilerMark("WeatherApp:MapsImageLoad:e");
loadImage(viewId, index + wamconsts.numImgThread, max)
});
if (wamviews[viewId] && wamviews[viewId].imgs && wamviews[viewId].imgs[index]) {
$(img).attr('src', wamviews[viewId].imgs[index].url)
}
}
}
function dispSpinner(viewId) {
var progress=CommonJS.Progress;
progress.showProgress(progress.centerProgressType)
}
function unDispSpinner(viewId) {
var progress=CommonJS.Progress;
progress.hideProgress(progress.centerProgressType)
}
function endImgLoadingEffect(viewId) {
unDispSpinner(viewId)
}
function startImgLoadingEffect(viewId) {
dispSpinner(viewId)
}
function preLoadAnimImages(viewId) {
if (wamviews[viewId].imagesToLoad === 0) {
return
}
else {
dispatchParallerImageLoad(viewId, wamviews[viewId].maximgs)
}
}
function setSliderState(state) {
if ((wamobj.slider_state === wamconsts.STOP) && (state === wamconsts.PLAY)) {
$("#slider-range-min").trigger("onsliderinit")
}
wamobj.slider_state = state;
if (state === wamconsts.STOP || state === wamconsts.PAUSE) {
wamSetBtState("play")
}
else {
wamSetBtState("pause")
}
}
function getSliderState() {
return (wamobj.slider_state)
}
function sliderCmdPlay() {
$("#slider-range-min").slider("enable");
setSliderState(wamconsts.PLAY);
if (wamviews[wamobj.viewid].maximgs > 1) {
wam_timer_key = setInterval(triggerSlider, wamconsts.timer_tick)
}
}
function sliderCmdPause() {
setSliderState(wamconsts.PAUSE);
clearInterval(wam_timer_key)
}
})()