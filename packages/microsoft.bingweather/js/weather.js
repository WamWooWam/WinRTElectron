/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
WinJS.Namespace.define("WeatherAppJS", {WeatherLocation: WinJS.Class.define(function(locID) {
if (!locID) {
return
}
this._currentConditions = null;
this._hourlyConditions = {};
this._dailyConditions = {};
this._alerts = null;
this._maps = null;
this._historicalWeather = null;
this._imageAndThemeData = null;
this._fForceUpdateAlerts = false;
this._fForceUpdateCC = false;
this._nearbyResorts = null;
this._skiOverview = null;
this._skiReviews = null;
this._skiDeals = null;
this._photosynthPanoramas = null;
this.maxDailyForecastDays = 0;
this._providers = {};
this.id = locID
}, {
setCurrentConditions: function setCurrentConditions(weatherData) {
var resourceFile=PlatformJS.Services.resourceLoader;
var currentWeather=weatherData.CurrentWeather;
if (currentWeather) {
if (!this._currentConditions) {
this._currentConditions = {}
}
var cc=this._currentConditions;
this._fForceUpdateCC = false;
cc.lastUpdatedTime = weatherData.LastUpdatedTime;
cc.provider = toStaticHTML(weatherData.CurrentConditionProvider);
var useTianQi=WeatherAppJS.WarmBoot.Cache.isFeatureEnabled("UseTianQi");
cc.tempunit = (!useTianQi) ? weatherData.TempUnit : "";
cc.displayTemp = (currentWeather.HasTemp) ? "" : "none";
cc.temperature = currentWeather.Temperature;
cc.tempCC = currentWeather.TemperatureWithoutUnit;
if (!useTianQi) {
cc.toolTipText = (weatherData.TempUnit === "F") ? resourceFile.getString("ToolTipTextC") : resourceFile.getString("ToolTipTextF")
}
cc.symbolPosition = WeatherAppJS.Utilities.Formatting.getSymbolPosition();
cc.tempHigh = currentWeather.TempHigh;
cc.tempHighWithoutUnit = currentWeather.TempHighWithoutUnit;
cc.tempLow = currentWeather.TempLow;
cc.tempLowWithoutUnit = currentWeather.TempLowWithoutUnit;
var showBoundary='none';
if (currentWeather.HasTempHigh && currentWeather.HasTempLow) {
showBoundary = ''
}
cc.displayTempBoundary = showBoundary;
var safeIconCode=currentWeather.IconCode;
cc.skycode = "/images/skycodes/89x89/" + safeIconCode + ".png";
if (currentWeather.Caption !== "") {
var ccCaption=resourceFile.getString(currentWeather.Caption);
cc.caption = ccCaption ? ccCaption : ""
}
else {
cc.caption = ""
}
cc.iconcode = safeIconCode;
cc.dayNightIndicator = currentWeather.DayNightIndicator;
cc.providerName = (toStaticHTML(weatherData.CurrentConditionProvider)) ? resourceFile.getString(toStaticHTML(weatherData.CurrentConditionProvider)) : "";
var feelsLikeValue=currentWeather.FeelsLike ? currentWeather.FeelsLike : WeatherAppJS.Utilities.Common.getNoDataString();
var feelsLikeSpan=document.createElement("span");
feelsLikeSpan.setAttribute("dir", WeatherAppJS.Utilities.Formatting.getSymbolPosition());
feelsLikeSpan.innerText = feelsLikeValue;
cc.feelslike = resourceFile.getString("FeelsLike").format(feelsLikeSpan.outerHTML);
cc.feelslikeTemp = currentWeather.FeelsLike;
cc.tempHighLow = resourceFile.getString("HighLowText").format(cc.tempHigh, cc.tempLow);
var noDataString=WeatherAppJS.Utilities.Common.getNoDataString();
cc.heroData = {};
var ccHeroData=cc.heroData;
ccHeroData.baseDepth = noDataString;
ccHeroData.newSnowDepth = noDataString;
ccHeroData.snowProviderData = noDataString;
if (currentWeather.Wind !== undefined) {
cc.wind = currentWeather.Wind
}
if (currentWeather.Humidity !== undefined) {
cc.humidity = currentWeather.Humidity
}
if (currentWeather.Precipitation !== undefined) {
cc.precipitation = currentWeather.Precipitation
}
if (currentWeather.SkyText) {
cc.caption = currentWeather.SkyText
}
this.handleAlerts(weatherData);
if (weatherData.IsTripPlanAvailable) {
cc.isTripPlanAvailable = weatherData.IsTripPlanAvailable
}
if (weatherData.IsMapsAvailable) {
cc.isMapsAvailable = weatherData.IsMapsAvailable
}
if (weatherData.HourlyListPerProvider) {
cc.isHourlyForecastAvailable = (weatherData.HourlyListPerProvider.length > 0) ? true : false
}
cc.IsDailyDrilldownEnabled = weatherData.IsDailyDrilldownEnabled;
this._providers[weatherData.CurrentConditionProvider] = '';
if (!cc.weatherProperties) {
cc.weatherProperties = {}
}
this._initializeWeatherProperties(currentWeather.WeatherProperties);
this._currentConditions = WinJS.Binding.as(cc)
}
}, getCurrentConditions: function getCurrentConditions() {
return WinJS.Binding.as(this._currentConditions)
}, _initializeWeatherProperties: function _initializeWeatherProperties(properties) {
var ccProp=this._currentConditions.weatherProperties;
ccProp.key0 = "";
ccProp.key1 = "";
ccProp.key2 = "";
ccProp.key3 = "";
ccProp.key4 = "";
ccProp.key5 = "";
ccProp.value0 = "";
ccProp.value1 = "";
ccProp.value2 = "";
ccProp.value3 = "";
ccProp.value4 = "";
ccProp.value5 = "";
ccProp.symbolPosition0 = "ltr";
ccProp.symbolPosition1 = "ltr";
ccProp.symbolPosition2 = "ltr";
ccProp.symbolPosition3 = "ltr";
ccProp.symbolPosition4 = "ltr";
ccProp.symbolPosition5 = "ltr";
if (!properties) {
return
}
var index=0;
this._currentConditions.reducedAdditionalConditions = false;
if (properties.length < 5) {
this._currentConditions.reducedAdditionalConditions = true
}
while (index < properties.length) {
switch (index) {
case 0:
ccProp.key0 = properties[index].Key;
ccProp.value0 = properties[index].Value;
ccProp.symbolPosition0 = properties[index].symbolPosition;
ccProp.ariaLabel0 = properties[index].ariaLabel;
break;
case 1:
ccProp.key1 = properties[index].Key;
ccProp.value1 = properties[index].Value;
ccProp.symbolPosition1 = properties[index].symbolPosition;
ccProp.ariaLabel1 = properties[index].ariaLabel;
break;
case 2:
ccProp.key2 = properties[index].Key;
ccProp.value2 = properties[index].Value;
ccProp.symbolPosition2 = properties[index].symbolPosition;
ccProp.ariaLabel2 = properties[index].ariaLabel;
break;
case 3:
ccProp.key3 = properties[index].Key;
ccProp.value3 = properties[index].Value;
ccProp.symbolPosition3 = properties[index].symbolPosition;
ccProp.ariaLabel3 = properties[index].ariaLabel;
break;
case 4:
ccProp.key4 = properties[index].Key;
ccProp.value4 = properties[index].Value;
ccProp.symbolPosition4 = properties[index].symbolPosition;
ccProp.ariaLabel4 = properties[index].ariaLabel;
break;
case 5:
ccProp.key5 = properties[index].Key;
ccProp.value5 = properties[index].Value;
ccProp.symbolPosition5 = properties[index].symbolPosition;
ccProp.ariaLabel5 = properties[index].ariaLabel;
break
}
index++
}
}, setDailyConditions: function setDailyConditions(weatherData) {
var resourceFile=PlatformJS.Services.resourceLoader;
if (weatherData.DailyForecast) {
var dc=this._dailyConditions = {};
this.maxDailyForecastDays = 0;
var symbolPosition=WeatherAppJS.Utilities.Formatting.getSymbolPosition();
for (var index in weatherData.DailyForecast) {
var provider=toStaticHTML(weatherData.DailyForecast[index].Provider);
var dailyData=weatherData.DailyForecast[index].DailyConditions;
if (dailyData.length > this.maxDailyForecastDays) {
this.maxDailyForecastDays = dailyData.length
}
var eachDC=dc[index] = {};
eachDC.provider = provider;
eachDC.forecasts = [];
eachDC.url = weatherData.DailyForecast[index].ProviderUrl ? toStaticHTML(weatherData.DailyForecast[index].ProviderUrl) : '';
eachDC.baseurl = weatherData.DailyForecast[index].BaseProviderUrl ? weatherData.DailyForecast[index].BaseProviderUrl : '';
for (var i=0; i < dailyData.length; i++) {
var eachDCForecast=eachDC.forecasts[i] = {};
var thisDailyData=dailyData[i];
eachDCForecast.symbolPosition = symbolPosition;
eachDCForecast.kiftime = thisDailyData.KifTime;
eachDCForecast.dayofyear = thisDailyData.DayOfYear;
eachDCForecast.day = thisDailyData.Day;
eachDCForecast.dayName = thisDailyData.DayName;
eachDCForecast.date = thisDailyData.Date;
eachDCForecast.fullDate = thisDailyData.FullDate;
if (thisDailyData.Caption !== "") {
var dcCaption=resourceFile.getString(thisDailyData.Caption);
eachDCForecast.caption = dcCaption ? dcCaption : ""
}
else {
eachDCForecast.caption = ""
}
eachDCForecast.temphigh = thisDailyData.TempHigh;
eachDCForecast.templow = thisDailyData.TempLow;
eachDCForecast.temphighWithoutUnit = thisDailyData.TempHighWithoutUnit;
eachDCForecast.templowWithoutUnit = thisDailyData.TempLowWithoutUnit;
var safeIconCode=thisDailyData.IconCode;
eachDCForecast.skycode = "/images/skycodes/66x62/" + safeIconCode + '.png';
eachDCForecast.skycodeSmall = "/images/skycodes/30x30/" + safeIconCode + '.png';
eachDCForecast.daySkycode = "/images/skycodes/89x89/" + safeIconCode + '.png';
eachDCForecast.precipitation = thisDailyData.PrecipChance;
eachDCForecast.daywindspeed = thisDailyData.DayWindSpeed;
eachDCForecast.humidity = thisDailyData.Humidity;
eachDCForecast.sunrise = thisDailyData.Sunrise;
eachDCForecast.sunset = thisDailyData.Sunset;
eachDCForecast.dayuv = thisDailyData.dayUV;
if (thisDailyData.NightCaption !== "") {
var nightCaption=resourceFile.getString(thisDailyData.NightCaption);
eachDCForecast.nightcaption = nightCaption ? nightCaption : ""
}
else {
eachDCForecast.nightcaption = ""
}
var nightSafeIconCode=thisDailyData.NightIconCode;
eachDCForecast.nightSkycode = "/images/skycodes/89x89/" + nightSafeIconCode + '.png';
eachDCForecast.nightprecipitation = thisDailyData.NightPrecipChance;
eachDCForecast.nightwindspeed = thisDailyData.NightWindSpeed;
eachDCForecast.nighthumidity = thisDailyData.NightHumidity;
eachDCForecast.showuvindex = "none";
if (eachDCForecast.dayuv !== "--") {
eachDCForecast.showuvindex = "block"
}
eachDCForecast.windspeed = (thisDailyData.WindSpeed) ? thisDailyData.WindSpeed : '';
if (thisDailyData.SkyText) {
eachDCForecast.caption = thisDailyData.SkyText
}
eachDCForecast.iconcode = (safeIconCode) ? safeIconCode : ''
}
this._dailyConditions[index] = WinJS.Binding.as(eachDC)
}
}
}, getDailyConditions: function getDailyConditions() {
return this._dailyConditions
}, setHourlyConditions: function setHourlyConditions(weatherData, isChinaExp) {
var resourceFile=PlatformJS.Services.resourceLoader;
var symbolPosition=WeatherAppJS.Utilities.Formatting.getSymbolPosition();
var weatherFormatting=WeatherAppJS.Utilities.Formatting;
if (weatherData.HourlyListPerProvider) {
this._hourlyConditions = {};
var hourly=weatherData.HourlyListPerProvider;
for (var eachProvider in weatherData.HourlyListPerProvider) {
var provider=toStaticHTML(weatherData.HourlyListPerProvider[eachProvider].ProviderName);
var hourlyData=weatherData.HourlyListPerProvider[eachProvider].HourlyConditionList;
if (!this._hourlyConditions[provider]) {
this._hourlyConditions[provider] = []
}
var hc=this._hourlyConditions[provider];
hc.dataAttributionText = PlatformJS.Services.resourceLoader.getString("DataAttribution");
hc.providerName = (provider) ? PlatformJS.Services.resourceLoader.getString(provider) : "";
hc.providerUrl = WeatherAppJS.Utilities.Common.getProviderAttributionUrl(provider);
for (var i=0; i < hourlyData.length; i++) {
if (!hc[i]) {
hc[i] = {}
}
var eachHC=hc[i];
var thisHourlyData=hourlyData[i];
eachHC.time = thisHourlyData.time;
eachHC.kifTime = thisHourlyData.kifTime;
eachHC.caption = thisHourlyData.caption;
eachHC.temperature = thisHourlyData.temperature;
eachHC.temperatureWithoutUnit = thisHourlyData.temperatureWithoutUnit;
eachHC.skycode = thisHourlyData.skycode;
eachHC.precipitation = thisHourlyData.precipitation;
eachHC.feelslike = thisHourlyData.feelslike;
eachHC.symbolPosition = symbolPosition;
eachHC.wind = weatherFormatting.getSpeedUnit(thisHourlyData.wind, weatherData.TempUnit).value;
if (isChinaExp) {
eachHC.wind = thisHourlyData.wind;
eachHC.tempHigh = thisHourlyData.tempHigh;
eachHC.tempLow = thisHourlyData.tempLow
}
this._hourlyConditions[provider][i] = WinJS.Binding.as(eachHC)
}
this._providers[provider] = ''
}
this._hourlyConditions.UTCOffset = weatherData.CurrentWeather.UTCOffset
}
}, getHourlyConditions: function getHourlyConditions() {
return this._hourlyConditions
}, handleAlerts: function handleAlerts(weatherData) {
var cc=this._currentConditions;
cc.alertsCCCount = weatherData.AlertsCount;
if (cc.alertsCCCount === 0) {
this._alerts = [];
this._alerts.lastUpdatedTime = weatherData.LastUpdatedTime;
cc.alertsCount = 0;
cc.displayAlert = 'none';
cc.displayAlertBgClass = "";
cc.displayAlertBgClassFav = "";
cc.alertText = "";
cc.alertTextFavTile = "";
cc.alertSnapText = ""
}
else {
cc.alertsCount = (cc.alertsCount === undefined) ? "" : cc.alertsCount;
cc.displayAlert = (cc.displayAlert === undefined) ? 'none' : cc.displayAlert;
cc.displayAlertBgClass = (cc.displayAlertBgClass === undefined) ? "" : cc.displayAlertBgClass;
cc.displayAlertBgClassFav = (cc.displayAlertBgClassFav === undefined) ? "" : cc.displayAlertBgClassFav;
cc.alertText = (cc.alertText === undefined) ? "" : cc.alertText;
cc.alertTextFavTile = (cc.alertTextFavTile === undefined) ? "" : cc.alertTextFavTile;
cc.alertSnapText = (cc.alertSnapText === undefined) ? "" : cc.alertSnapText;
cc.handleAlertsClick = (cc.handleAlertsClick === undefined) ? "" : cc.handleAlertsClick;
cc.handleKeyboardInvocation = WeatherAppJS.Utilities.TabIndexManager.HandleKeyboardInvocation;
this._fForceUpdateAlerts = true
}
}, setAlerts: function setAlerts(weatherData) {
if (weatherData.Alerts) {
this._fForceUpdateAlerts = false;
var noPrevAlerts=(this._alerts === null || this._alerts.length === 0);
this._alerts = [];
this._alerts.lastUpdatedTime = weatherData.LastUpdatedTime;
for (var i=0, j=weatherData.Alerts.length; i < j; i++) {
var _tmpAlert={
title: toStaticHTML(weatherData.Alerts[i].Title), createTime: weatherData.Alerts[i].CreateTime, expirationTime: weatherData.Alerts[i].ExpirationTime, croppedCreateTime: weatherData.Alerts[i].CroppedCreateTime, croppedExpirationTime: weatherData.Alerts[i].CroppedExpirationTime, description: toStaticHTML(weatherData.Alerts[i].Description)
};
this._alerts.push(_tmpAlert)
}
this._alerts.sort(function(alert1, alert2) {
if (alert1.title.toUpperCase().indexOf("WARNING") !== -1) {
return -1
}
else if (alert2.title.toUpperCase().indexOf("WARNING") !== -1) {
return 1
}
return 0
});
var alertBarColorClass='alertIndicator otherAlertFormat';
var alertBarColorClassFav='favAlerts otherAlertFormat';
if ((this._alerts.length > 0) && (this._alerts[0].title.toUpperCase().indexOf("WARNING") !== -1)) {
alertBarColorClass = 'alertIndicator warningAlertFormat';
alertBarColorClassFav = 'favAlerts warningAlertFormat'
}
var locationId=this.id;
var cc=this._currentConditions;
cc.alertsCount = this._alerts.length;
cc.displayAlert = (cc.alertsCount) ? '' : 'none';
cc.displayAlertBgClass = alertBarColorClass;
cc.displayAlertBgClassFav = alertBarColorClassFav;
var alertsText="";
var shortAlertsText="";
if (cc.alertsCount === 1) {
alertsText = PlatformJS.Services.resourceLoader.getString("AlertWarning").format(this._alerts[0].title, this._alerts[0].croppedCreateTime, this._alerts[0].croppedExpirationTime);
shortAlertsText = PlatformJS.Services.resourceLoader.getString("AlertShort").format(this._alerts[0].title)
}
else if (cc.alertsCount > 1) {
alertsText = PlatformJS.Services.resourceLoader.getString("AlertWarningWithCount").format(this._alerts[0].title, this._alerts[0].croppedCreateTime, this._alerts[0].croppedExpirationTime, '·', cc.alertsCount - 1);
shortAlertsText = PlatformJS.Services.resourceLoader.getString("AlertShortWithCount").format(this._alerts[0].title, '·', cc.alertsCount - 1)
}
if (noPrevAlerts && cc.alertsCount > 0) {
var eventAttr={
location: WeatherAppJS.GeocodeCache.getLocation(locationId).getFullDisplayName(), numberOfAlerts: cc.alertsCount
};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logAppActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Alerts", "Alert Toast", "appAlertsShown", 0, JSON.stringify(eventAttr))
}
cc.alertText = alertsText;
cc.alertTextFavTile = shortAlertsText;
cc.alertSnapText = shortAlertsText;
cc.handleAlertsClick = WinJS.UI.eventHandler(function() {
WeatherAppJS.Utilities.UI.LoadAlertsFlyout(locationId)
})
}
}, getAlerts: function getAlerts() {
return this._alerts
}, setHistoricalWeather: function setHistoricalWeather(weatherData) {
if (weatherData.MonthlyAggregatedData) {
if (!this._historicalWeather) {
this._historicalWeather = {}
}
var hw=this._historicalWeather;
hw.lastUpdatedTime = weatherData.LastUpdatedTime;
hw.curMonth = weatherData.CurrentMonth;
hw.tempUnit = weatherData.TempUnit;
if (weatherData.DefaultDataProvider) {
hw.defaultDataProvider = {
provider: toStaticHTML(weatherData.DefaultDataProvider.ProviderName), url: toStaticHTML(weatherData.DefaultDataProvider.ProviderUrl)
};
this._providers[weatherData.DefaultDataProvider.ProviderName] = ''
}
if (weatherData.SeaTempProvider) {
hw.seaTempProvider = {
provider: toStaticHTML(weatherData.SeaTempProvider.ProviderName), url: toStaticHTML(weatherData.SeaTempProvider.ProviderUrl)
};
this._providers[weatherData.SeaTempProvider.ProviderName] = ''
}
if (weatherData.SunshineHrsProvider) {
hw.sunshineHrsProvider = {
provider: toStaticHTML(weatherData.SunshineHrsProvider.ProviderName), url: toStaticHTML(weatherData.SunshineHrsProvider.ProviderUrl)
};
this._providers[weatherData.SunshineHrsProvider.ProviderName] = ''
}
if (!hw.monthlyData) {
hw.monthlyData = {}
}
for (var i=0; i < weatherData.MonthlyAggregatedData.length; i++) {
if (!this._historicalWeather.monthlyData[i]) {
this._historicalWeather.monthlyData[i] = {}
}
var monthlyHW=this._historicalWeather.monthlyData[i];
var monthlyAggData=weatherData.MonthlyAggregatedData[i];
monthlyHW.AvgSunshineHours = monthlyAggData.AvgSunshineHours;
monthlyHW.MaxTemp = monthlyAggData.MaxTemp;
monthlyHW.MinTemp = monthlyAggData.MinTemp;
monthlyHW.MinRecordedTemp = monthlyAggData.MinRecordedTemp;
monthlyHW.MaxRecordedTemp = monthlyAggData.MaxRecordedTemp;
monthlyHW.MinRecordedTempDate = monthlyAggData.MinRecordedTempDate;
monthlyHW.MaxRecordedTempDate = monthlyAggData.MaxRecordedTempDate;
monthlyHW.Precipitation = monthlyAggData.Precipitation;
monthlyHW.SnowyDayCount = monthlyAggData.SnowyDayCount;
monthlyHW.RainyDayCount = monthlyAggData.RainyDayCount;
monthlyHW.SeaTemp = monthlyAggData.SeaTemp
}
}
}, getHistoricalWeather: function getHistoricalWeather() {
return this._historicalWeather
}, setMaps: function setMaps(weatherData) {
if (weatherData && weatherData.MapCategoryList && weatherData.MapCategoryList instanceof Array) {
if (!this._maps) {
this._maps = {}
}
if (!this._maps.regionalMaps) {
this._maps.regionalMaps = []
}
if (!this._maps.nationalMaps) {
this._maps.nationalMaps = []
}
if (!this._maps.travelMaps) {
this._maps.travelMaps = []
}
this._maps.lastUpdatedTime = weatherData.LastUpdatedTime;
this._maps.tempunit = weatherData.TempUnit;
for (var cat in weatherData.MapCategoryList) {
switch (weatherData.MapCategoryList[cat].MapCategory) {
case"Regional":
this._setSelectedMaps(this._maps.regionalMaps, weatherData.MapCategoryList[cat], weatherData.MapProviderList);
break;
case"National":
this._setSelectedMaps(this._maps.nationalMaps, weatherData.MapCategoryList[cat], weatherData.MapProviderList);
break;
case"Travel":
this._setSelectedMaps(this._maps.travelMaps, weatherData.MapCategoryList[cat], weatherData.MapProviderList);
break
}
}
for (var p in weatherData.MapProviderList) {
var currentProvider=weatherData.MapProviderList[p];
if (currentProvider.DisplayName) {
this._providers[currentProvider.DisplayName] = ''
}
}
}
}, _setSelectedMaps: function _setSelectedMaps(maps, mapData, providers) {
var mapList=mapData.MapTypeList;
var resourceLoader=PlatformJS.Services.resourceLoader;
var altText=resourceLoader.getString("MapImageAltText");
if (mapList instanceof Array && maps instanceof Array) {
var getWeatherDotComIMapUrl=WeatherAppJS.Utilities.Common.getWeatherDotComIMapUrl;
for (var m in mapList) {
if (mapList[m].Type && mapList[m].ThumbnailUrl && mapList[m].MapList) {
var mapCategory=resourceLoader.getString(mapData.MapCategory);
var mapType="";
var mapFixedType=mapList[m].Type;
try {
if (mapList[m].Type === 'Precipitation') {
mapType = resourceLoader.getString('RainfallMap')
}
else {
mapType = resourceLoader.getString(mapList[m].Type)
}
}
catch(e) {
if (mapList[m].Type !== "") {
mapType = mapList[m].Type
}
else {
continue
}
}
if (!maps[m]) {
maps[m] = {}
}
var eachMap=maps[m];
eachMap.category = mapCategory;
eachMap.type = mapType;
eachMap.fixedType = mapFixedType;
eachMap.thumbnailUrl = mapList[m].ThumbnailUrl;
eachMap.isAnimated = mapList[m].IsAnimated;
eachMap.mapList = mapList[m].MapList;
eachMap.ProviderName = toStaticHTML(mapList[m].ProviderName);
eachMap.altText = altText;
if (!mapList[m].IsAnimated && mapList[m].ProviderName && providers[mapList[m].ProviderName] && mapList[m].ProviderName === resourceLoader.getString("Weather.com")) {
eachMap.attributionUrl = getWeatherDotComIMapUrl(providers[mapList[m].ProviderName].LocationCode)
}
else {
eachMap.attributionUrl = ""
}
maps[m] = WinJS.Binding.as(eachMap)
}
}
}
}, setSkiTileData: function setSkiTileData(response, tileResponseObj) {
var weatherFormatting=WeatherAppJS.Utilities.Formatting;
var noDataString=WeatherAppJS.Utilities.Common.getNoDataString();
var resourceFile=PlatformJS.Services.resourceLoader;
if (tileResponseObj) {
if (!this._currentConditions) {
this._currentConditions = {}
}
var cc=this._currentConditions;
cc.lastUpdatedTime = response.lastUpdateTime.getTime();
var useTianQi=Platform.Utilities.Globalization.isFeatureEnabled("UseTianQi");
if (!useTianQi) {
cc.tempunit = tileResponseObj.unit
}
cc.snowCC = (tileResponseObj.ns !== undefined) ? weatherFormatting.formatInt(tileResponseObj.ns) : noDataString;
cc.snowUnit = (tileResponseObj.ns !== undefined) ? weatherFormatting.formatSnowUnit(tileResponseObj.unit) : noDataString;
cc.toolTipText = (tileResponseObj.unit === "F") ? resourceFile.getString("ToolTipTextC") : resourceFile.getString("ToolTipTextF");
cc.symbolPosition = WeatherAppJS.Utilities.Formatting.getSymbolPosition();
cc.displayTemp = (tileResponseObj.tmp !== undefined) ? "" : "none";
cc.temperature = (tileResponseObj.tmp !== undefined) ? weatherFormatting.getTemperatureWithDegreeUnit(tileResponseObj.tmp) : noDataString;
cc.tempCC = (tileResponseObj.tmp !== undefined) ? weatherFormatting.formatInt(tileResponseObj.tmp) : noDataString;
cc.tempHigh = (tileResponseObj.th !== undefined) ? weatherFormatting.getTemperatureWithDegreeUnit(tileResponseObj.th) : noDataString;
cc.tempHighWithoutUnit = (tileResponseObj.th !== undefined) ? weatherFormatting.formatInt(tileResponseObj.th) : noDataString;
cc.tempLow = (tileResponseObj.tl !== undefined) ? weatherFormatting.getTemperatureWithDegreeUnit(tileResponseObj.tl) : noDataString;
cc.tempLowWithoutUnit = (tileResponseObj.tl !== undefined) ? weatherFormatting.formatInt(tileResponseObj.tl) : noDataString;
var showBoundary='none';
if ((tileResponseObj.th !== undefined) && (tileResponseObj.tl !== undefined)) {
showBoundary = ''
}
cc.displayTempBoundary = showBoundary;
cc.skycode = tileResponseObj.img.u;
cc.tempHighLow = resourceFile.getString("HighLowText").format(cc.tempHigh, cc.tempLow);
if (tileResponseObj.pc !== "") {
var ccCaption=resourceFile.getString(tileResponseObj.pc);
cc.caption = ccCaption ? ccCaption : ""
}
else {
cc.caption = ""
}
this._currentConditions = WinJS.Binding.as(cc)
}
}, getRegionalMaps: function getRegionalMaps() {
if (!this._maps) {
return null
}
return this._maps.regionalMaps
}, getNationalMaps: function getNationalMaps() {
if (!this._maps) {
return null
}
return this._maps.nationalMaps
}, getTravelMaps: function getTravelMaps() {
if (!this._maps) {
return null
}
return this._maps.travelMaps
}, setInteractiveMaps: function setInteractiveMaps(iMapsData) {
var weatherUtils=WeatherAppJS.Utilities.UI;
if (iMapsData && iMapsData.RegionName && iMapsData.MapTypes && iMapsData.MapTypes instanceof Array) {
if (!this._iMaps) {
this._iMaps = {}
}
this._iMaps.lastUpdatedTime = iMapsData.lastUpdatedTime;
var region=weatherUtils.getMapRegionByFetchId(iMapsData.RegionName);
this._iMaps.RegionName = region.id;
this._iMaps.tempunit = iMapsData.tempunit;
var mapTypes=[];
for (var m in iMapsData.MapTypes) {
var mapType=iMapsData.MapTypes[m];
var mapData=weatherUtils.getIdForMapTypeSubType(mapType.MapType, mapType.MapSubType);
mapType.MapType = mapData.id;
mapType.MapSubType = mapData.subTypeId;
mapTypes.push(mapType)
}
this._iMaps.MapTypes = mapTypes
}
}, getInteractiveMaps: function getInteractiveMaps() {
return this._iMaps
}, validateImageResponse: function validateImageResponse(response) {
if (!response || !response.imgBase || !response.cssBase) {
return false
}
var obj=response.imgs;
if (obj) {
for (var element in obj) {
if (obj.hasOwnProperty(element)) {
var iconcodeObj=obj[element];
if (!iconcodeObj["BW_HERO"] || !iconcodeObj["BW_HERO_LOWRES"] || !iconcodeObj["BW_TILE_PLACE"]) {
return false
}
}
}
return true
}
return false
}, setHeroImageAndThemeData: function setHeroImageAndThemeData(response, deseralizedResponse) {
if (!this._imageAndThemeData) {
this._imageAndThemeData = {}
}
if (response.lastUpdateTime) {
this._imageAndThemeData.lastUpdatedTime = response.lastUpdateTime.getTime()
}
else {
this._imageAndThemeData.lastUpdatedTime = PlatformJS.BootCache.instance.getEntry("timeHeroImage", function() {
return null
})
}
if (this.validateImageResponse(deseralizedResponse)) {
this._imageAndThemeData.cssBase = deseralizedResponse.cssBase;
this._imageAndThemeData.imgBase = deseralizedResponse.imgBase;
this._imageAndThemeData.iconcodeMaps = deseralizedResponse.imgs
}
else {
this._imageAndThemeData = null
}
}, getHeroImageAndThemeData: function getHeroImageAndThemeData() {
return this._imageAndThemeData
}, setTile: function setTile(weatherData) {
this.setCurrentConditions(weatherData);
this._fForceUpdateCC = true
}, getTile: function getTile() {
return this.getCurrentConditions()
}, getSkiHero: function getSkiHero() {
return this._currentConditions
}, getSkiOverview: function getSkiOverview() {
return this._skiOverview
}, getSkiDeals: function getSkiDeals() {
return this._skiDeals
}, getSkiReviews: function getSkiReviews() {
return this._skiReviews
}, getNearbyResorts: function getNearbyResorts() {
return this._nearbyResorts
}, getPhotosynthPanoramas: function getPhotosynthPanoramas() {
return this._photosynthPanoramas
}, setSkiOverview: function setSkiOverview(responseObj, lastUpdateTime, displayUnit) {
var resourceFile=PlatformJS.Services.resourceLoader;
var weatherFormatting=WeatherAppJS.Utilities.Formatting;
var weatherCommon=WeatherAppJS.Utilities.Common;
var elevationString=resourceFile.getString("UnitInPercentage");
var noDataString=weatherCommon.getNoDataString();
if (!this._currentConditions) {
this._currentConditions = {}
}
var cc=this._currentConditions;
cc.heroImageData = {};
var ccHeroImgData=cc.heroImageData;
var rspHeroImgData=responseObj.heroData.hrImg;
var rspLowResHeroImgData=responseObj.heroData.lwResHrImg;
ccHeroImgData.lowResolutionUrl = rspLowResHeroImgData.u;
ccHeroImgData.highResolutionUrl = rspHeroImgData.u;
var rspAnchor=rspHeroImgData.ancr;
if (rspAnchor === "Left") {
ccHeroImgData.anchorPoint = "anchorLeft"
}
else if (rspAnchor === "Middle") {
ccHeroImgData.anchorPoint = "anchorMiddle"
}
else if (rspAnchor === "Right") {
ccHeroImgData.anchorPoint = "anchorRight"
}
ccHeroImgData.anchorPoint = ccHeroImgData.anchorPoint || "anchorLeft";
ccHeroImgData.anchorPointPortrait = rspHeroImgData.pancr || "anchorLeft";
ccHeroImgData.attribution = rspHeroImgData.attr;
ccHeroImgData.caption = rspHeroImgData.cptn;
ccHeroImgData.focalPoint = rspHeroImgData.fp ? rspHeroImgData.fp : null;
ccHeroImgData.focalPointLowRes = rspLowResHeroImgData.fp ? rspLowResHeroImgData.fp : null;
ccHeroImgData.focalPointPortrait = rspHeroImgData.pfp ? rspHeroImgData.pfp : null;
ccHeroImgData.focalPointLowResPortrait = rspLowResHeroImgData.pfp ? rspLowResHeroImgData.pfp : null;
ccHeroImgData.imageSize = {
width: rspHeroImgData.w, height: rspHeroImgData.h
};
ccHeroImgData.imageSizeLowRes = {
width: rspLowResHeroImgData.w, height: rspLowResHeroImgData.h
};
cc.heroData = {};
var ccHeroData=cc.heroData;
ccHeroData.caption = resourceFile.getString("NewSnowHeader");
if (responseObj.heroData.frsSnw) {
ccHeroData.snowCC = weatherFormatting.formatInt(responseObj.heroData.frsSnw);
ccHeroData.displaySnowUnit = ""
}
else {
ccHeroData.snowCC = weatherCommon.getNoDataString();
ccHeroData.displaySnowUnit = "none"
}
ccHeroData.snowUnit = weatherFormatting.formatSnowUnit(displayUnit);
if (responseObj.heroData.cc) {
cc.displayTemp = (responseObj.heroData.cc.temp !== undefined) ? "" : "none";
cc.temperature = (responseObj.heroData.cc.temp !== undefined) ? weatherFormatting.getTemperatureWithDegreeUnit(responseObj.heroData.cc.temp) : noDataString;
cc.tempCC = (responseObj.heroData.cc.temp !== undefined) ? weatherFormatting.formatInt(responseObj.heroData.cc.temp) : noDataString;
if (responseObj.heroData.cc.cptn !== "") {
var ccCaption=resourceFile.getString(responseObj.heroData.cc.cptn);
cc.caption = ccCaption ? ccCaption : ""
}
else {
cc.caption = ""
}
cc.feelslike = noDataString;
if (responseObj.heroData.cc.provid) {
cc.AttrProvider = resourceFile.getString(responseObj.heroData.cc.provid);
cc.AttrProviderUrl = WeatherAppJS.Utilities.Common.getProviderAttributionUrl(responseObj.heroData.cc.provid)
}
}
else {
cc.displayTemp = "none";
cc.temperature = noDataString;
cc.tempCC = noDataString;
cc.caption = ""
}
if (responseObj.heroData.tImg) {
cc.skycode = responseObj.heroData.tImg.u
}
cc.snowUnit = ccHeroData.snowUnit;
cc.tempunit = responseObj.unit;
cc.snowCC = ccHeroData.snowCC;
cc.toolTipText = (responseObj.unit === "F") ? resourceFile.getString("ToolTipTextC") : resourceFile.getString("ToolTipTextF");
if (responseObj.dly) {
cc.dailyForecastProvider = resourceFile.getString(responseObj.dly.Provider);
cc.dailyForecastProviderUrl = WeatherAppJS.Utilities.Common.getProviderAttributionUrl(responseObj.dly.Provider)
}
var providerName=responseObj.attr.text ? responseObj.attr.text : resourceFile.getString("OnTheSnow");
var providerUrl=weatherFormatting.getSanitizedUrl(responseObj.attr.link);
var providerLinkClick=null;
if (!providerUrl) {
providerUrl = resourceFile.getString("OnTheSnowUrl")
}
providerLinkClick = WinJS.UI.eventHandler(function() {
var eventAttr={resort: responseObj.loc.nm + ", " + responseObj.loc.ct + ", " + responseObj.loc.co};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, WeatherAppJS.Instrumentation.PageContext.SkiOverview, "Ski Provider Link", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr));
weatherCommon.navigateToWebView(providerUrl, WeatherAppJS.Instrumentation.PageContext.SkiOverviewOTS)
});
ccHeroData.snowProviderData = providerName;
ccHeroData.snowProviderDataUrl = providerUrl;
ccHeroData.snowProviderDataClick = providerLinkClick;
ccHeroData.freshSnow = (responseObj.heroData.frsSnw !== undefined) ? "<span class='snowdaysGlyph'></span><span class='snowdaysText'>{0}</span>".format(weatherFormatting.getSnowDepthUnit(responseObj.heroData.frsSnw, displayUnit)) : '';
ccHeroData.providerName = providerName;
ccHeroData.baseDepth = responseObj.heroData.bsDpth ? weatherFormatting.getSnowDepthUnit(responseObj.heroData.bsDpth, displayUnit) : noDataString;
ccHeroData.newSnowDepth = responseObj.heroData.frsSnw ? weatherFormatting.getSnowDepthUnit(responseObj.heroData.frsSnw, displayUnit) : noDataString;
ccHeroData.dailyForeCast = weatherFormatting.formatSnowData(ccHeroData.freshSnow, responseObj.heroData.frcsts, displayUnit);
var getSnowData=function(data, unit) {
var snowData={};
if (data) {
for (var l=0; l < data.length; l++) {
var snowDate=weatherFormatting.getFormattedForecastSkiClusterKey(data[l].date);
snowData[snowDate] = weatherFormatting.getSnowDepthUnit(data[l].snfl, unit)
}
}
return snowData
};
ccHeroData.snowData = getSnowData(responseObj.heroData.frcsts, displayUnit);
if (!this._skiOverview) {
this._skiOverview = {}
}
var skiOverview=this._skiOverview;
skiOverview.tempunit = responseObj.unit;
skiOverview.isOverviewAvailable = true;
skiOverview.isDealsAndNewsAvailable = responseObj.nwsDlsData ? true : false;
skiOverview.isReviewsAvailable = responseObj.rvwData ? true : false;
skiOverview.isCamsAndPanosAvailable = responseObj.camPnrmData ? true : false;
skiOverview.isNearbyResortsAvailable = false;
var rspTrailMapData=responseObj.ovrwData.trailMapDt;
if (responseObj.ovrwData.trailMapDt) {
var state={
data: {slides: [{
image: {
url: rspTrailMapData.hiRsImg.u, width: rspTrailMapData.hiRsImg.w, height: rspTrailMapData.hiRsImg.h
}, thumbnail: {url: rspTrailMapData.loRsImg.u}, attribution: rspTrailMapData.prvd ? resourceFile.getString("TrailmapAttribution").format(rspTrailMapData.prvd) : ""
}]}, page: WeatherAppJS.Instrumentation.PageContext.SkiTrailMap, disableSemanticZoom: true, dontShowImageCount: true
};
var isTrailRunsAvailable;
if (responseObj.ovrwData.rnsDt.pBR !== undefined && responseObj.ovrwData.rnsDt.pIR !== undefined && responseObj.ovrwData.rnsDt.pAR !== undefined && responseObj.ovrwData.rnsDt.pER !== undefined) {
isTrailRunsAvailable = true
}
skiOverview.trail = {
trailMap: rspTrailMapData.loRsImg.u, trailMapImageText: resourceFile.getString("Trailmapimage"), buttonTrailClick: WinJS.UI.eventHandler(function(e) {
if ((e.type === "click") || (e.keyCode && (e.keyCode === WinJS.Utilities.Key.enter || e.keyCode === WinJS.Utilities.Key.space))) {
var eventAttr={resort: responseObj.loc.nm + ", " + responseObj.loc.ct + ", " + responseObj.loc.co};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, WeatherAppJS.Instrumentation.PageContext.SkiOverview, "Ski Trail Map", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr));
PlatformJS.Navigation.navigateToChannel('WeatherSlideshow', state)
}
}), percentageBeginnerRun: weatherFormatting.getPercentageUnit(responseObj.ovrwData.rnsDt.pBR).replace(' ', ''), percentageIntermediateRun: weatherFormatting.getPercentageUnit(responseObj.ovrwData.rnsDt.pIR).replace(' ', ''), percentageAdvancedRun: weatherFormatting.getPercentageUnit(responseObj.ovrwData.rnsDt.pAR).replace(' ', ''), percentageExpertRun: weatherFormatting.getPercentageUnit(responseObj.ovrwData.rnsDt.pER).replace(' ', ''), isTrailRunsAvailable: isTrailRunsAvailable
}
}
else {
skiOverview.trail = null
}
var introDesc=null;
if (responseObj.ovrwData.intrDt.dsc) {
introDesc = responseObj.ovrwData.intrDt.dsc
}
if (introDesc) {
if (introDesc.length > 275) {
introDesc = introDesc.substring(0, 275);
introDesc = introDesc + "\u2026 "
}
}
var skiWebsite=responseObj.ovrwData.intrDt.web;
var skiWebsiteDomain="";
if (skiWebsite) {
var urlComponents=skiWebsite.split("/");
if (urlComponents && urlComponents.length > 2) {
skiWebsiteDomain = urlComponents[2]
}
}
var address=responseObj.ovrwData.intrDt.adr;
skiOverview.introduction = {
introText: introDesc, moreClick: responseObj.ovrwData.intrDt.dscUrl ? WinJS.UI.eventHandler(function(e) {
if ((e.type === "click") || (e.keyCode && (e.keyCode === WinJS.Utilities.Key.enter || e.keyCode === WinJS.Utilities.Key.space))) {
var eventAttr={resort: WeatherAppJS.GeocodeCache.getLocation(responseObj.id).getFullDisplayName()};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, WeatherAppJS.Instrumentation.PageContext.SkiOverview, "More", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr));
weatherCommon.navigateToWebView(weatherFormatting.getSanitizedUrl(responseObj.ovrwData.intrDt.dscUrl), WeatherAppJS.Instrumentation.PageContext.SkiOverviewOTS)
}
}) : null, buttonMapClick: WinJS.UI.eventHandler(function(e) {
if ((e.type === "click") || (e.keyCode && (e.keyCode === WinJS.Utilities.Key.enter || e.keyCode === WinJS.Utilities.Key.space))) {
var eventAttr={resort: responseObj.loc.nm + ", " + responseObj.loc.ct + ", " + responseObj.loc.co};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, WeatherAppJS.Instrumentation.PageContext.SkiOverview, "Ski Direction", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr));
WeatherAppJS.Utilities.Common.navigateToMapApp(responseObj.loc.la, responseObj.loc.lo)
}
}), addressVisibility: address ? "visible" : "hidden", overfooter1: address ? address : weatherCommon.getNoDataString(), overfooter2: responseObj.ovrwData.intrDt.zip ? responseObj.ovrwData.intrDt.zip : weatherCommon.getNoDataString(), footerlink1: resourceFile.getString("WebsiteHeader"), footerlinkVisibility: responseObj.ovrwData.intrDt.web ? "visible" : "hidden", buttonWebClick: responseObj.ovrwData.intrDt.web ? WinJS.UI.eventHandler(function(e) {
if ((e.type === "click") || (e.keyCode && (e.keyCode === WinJS.Utilities.Key.enter || e.keyCode === WinJS.Utilities.Key.space))) {
weatherCommon.navigateToWebView(weatherFormatting.getSanitizedUrl(responseObj.ovrwData.intrDt.web), WeatherAppJS.Instrumentation.PageContext.SkiResortWebsite);
var eventAttr={resort: responseObj.loc.nm + ", " + responseObj.loc.ct + ", " + responseObj.loc.co};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, WeatherAppJS.Instrumentation.PageContext.SkiOverview, "Ski Resort Web Link", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr))
}
}) : null, elevation: {
base: " " + weatherFormatting.getElevationUnit(responseObj.ovrwData.intrDt.elvBs, displayUnit), summit: " " + weatherFormatting.getElevationUnit(responseObj.ovrwData.intrDt.elvTp, displayUnit), verticalDrop: " " + weatherFormatting.getElevationUnit(responseObj.ovrwData.intrDt.vDrp, displayUnit)
}
};
var symbolPosition=weatherFormatting.getSymbolPosition();
var snowdata=responseObj.ovrwData.snwDt;
var ofText=resourceFile.getString("ofText");
var labelTextSkiTerrain=weatherFormatting.formatSnowOpenLabel(displayUnit);
var snowUnit=weatherFormatting.formatSnowUnit(displayUnit);
skiOverview.currentInfo = {
statusLabel: resourceFile.getString("Status"), status: snowdata ? ((snowdata.stts === "TemporarilyClosed") ? "TempClosed" : snowdata.stts) : noDataString, trailsOpenLabel: resourceFile.getString("TrailsOpen"), trailsOpen: snowdata ? ((snowdata.opTrl !== undefined && snowdata.ttTrl !== undefined) ? ofText.format(weatherFormatting.formatInt(snowdata.opTrl), weatherFormatting.formatInt(snowdata.ttTrl)) : noDataString) : noDataString, liftOpenLabel: resourceFile.getString("LiftOpen"), liftOpen: snowdata ? ((snowdata.opLft !== undefined && snowdata.ttLft !== undefined) ? ofText.format(weatherFormatting.formatInt(snowdata.opLft), weatherFormatting.formatInt(snowdata.ttLft)) : noDataString) : noDataString, freshSnowLabel: resourceFile.getString("FreshSnow"), freshSnow: snowdata ? (weatherFormatting.formatInt(snowdata.frsSnw ? snowdata.frsSnw : noDataString)) : noDataString, snowUnit: snowdata ? (snowdata.frsSnw ? snowUnit : "") : "", symbolPosition: symbolPosition, baseDepthLabel: resourceFile.getString("BaseDepth"), baseDepth: snowdata ? (weatherFormatting.formatInt(snowdata.bsDpth ? snowdata.bsDpth : noDataString)) : noDataString, baseDepthUnit: snowdata ? (snowdata.bsDpth ? snowUnit : "") : "", acresOpenLabel: labelTextSkiTerrain, acresOpen: snowdata ? ((snowdata.opTrn !== undefined && snowdata.ttTrn !== undefined) ? ofText.format(weatherFormatting.formatInt(snowdata.opTrn), weatherFormatting.formatInt(snowdata.ttTrn)) : noDataString) : noDataString
};
skiOverview.currentInfo.boardingLabel = "";
skiOverview.currentInfo.boarding = "";
skiOverview.currentInfo.tubingLabel = "";
skiOverview.currentInfo.tubing = "";
skiOverview.currentInfo.crossCountryLabel = "";
skiOverview.currentInfo.crossCountry = "";
if (!introDesc) {
skiOverview.currentInfo.boardingLabel = resourceFile.getString("Boarding");
skiOverview.currentInfo.boarding = snowdata ? (snowdata.board ? resourceFile.getString(snowdata.board.toUpperCase()) : noDataString) : noDataString;
skiOverview.currentInfo.tubingLabel = resourceFile.getString("Tubing");
skiOverview.currentInfo.tubing = snowdata ? (snowdata.tube ? resourceFile.getString(snowdata.tube.toUpperCase()) : noDataString) : noDataString;
skiOverview.currentInfo.crossCountryLabel = resourceFile.getString("CrossCountry");
skiOverview.currentInfo.crossCountry = snowdata ? (snowdata.xCntry ? resourceFile.getString(snowdata.xCntry.toUpperCase()) : noDataString) : noDataString
}
;
var dataAttributionTxt=resourceFile.getString("DataAttribution");
var providerNameOvr=responseObj.attr.text ? responseObj.attr.text : "";
var attrVisibility=(providerNameOvr !== "") ? "visible" : "hidden";
skiOverview.extraInfo = {
attributionVisibility: attrVisibility, dataAttributionText: dataAttributionTxt, providerName: providerNameOvr, providerUrl: weatherFormatting.getSanitizedUrl(responseObj.attr.link), attributionClick: WinJS.UI.eventHandler(function() {
WeatherAppJS.Utilities.Instrumentation.onClickAttribution(providerNameOvr, WeatherAppJS.Instrumentation.PageContext.SkiOverview)
})
};
cc.symbolPosition = WeatherAppJS.Utilities.Formatting.getSymbolPosition();
this.handleAlerts(responseObj);
cc.lastUpdatedTime = lastUpdateTime.getTime();
cc.IsDailyDrilldownEnabled = (responseObj.IsHourlyForecastByDayAvailable === true) ? true : false;
cc.isMapsAvailable = true;
cc.isHourlyForecastAvailable = (!responseObj.hrly) ? false : true;
if (!cc.weatherProperties) {
cc.weatherProperties = {}
}
this._initializeWeatherProperties("");
this._currentConditions = WinJS.Binding.as(cc)
}, setSkiDailyConditions: function setSkiDailyConditions(weatherData, unit) {
var resourceFile=PlatformJS.Services.resourceLoader;
var weatherFormatter=WeatherAppJS.Utilities.Formatting;
var noDataString=WeatherAppJS.Utilities.Common.getNoDataString();
if (weatherData.dly) {
var dc=this._dailyConditions = {};
this.maxDailyForecastDays = 0;
var symbolPosition=WeatherAppJS.Utilities.Formatting.getSymbolPosition();
var provider=toStaticHTML(weatherData.dly.Provider);
var dailyData=weatherData.dly.DailyConditions;
if (dailyData.length > this.maxDailyForecastDays) {
this.maxDailyForecastDays = dailyData.length
}
var eachDC=dc[0] = {};
eachDC.provider = provider;
eachDC.forecasts = [];
eachDC.url = WeatherAppJS.Utilities.Common.getProviderAttributionUrl(provider);
eachDC.baseUrl = WeatherAppJS.Utilities.Common.getProviderAttributionUrl(provider);
for (var i=0; i < dailyData.length; i++) {
var eachDCForecast=eachDC.forecasts[i] = {};
var thisDailyData=dailyData[i];
eachDCForecast.symbolPosition = symbolPosition;
var dateDay=weatherFormatter.getFormattedDayName(thisDailyData.Date).split('|');
eachDCForecast.kiftime = thisDailyData.Date;
eachDCForecast.dayofyear = weatherFormatter.getDayOfYear(thisDailyData.Date);
eachDCForecast.day = dateDay[0];
eachDCForecast.dayName = dateDay[1];
eachDCForecast.date = weatherFormatter.getFormattedDailyTimeShort(thisDailyData.Date);
eachDCForecast.fullDate = weatherFormatter.getFormattedDailyTime(thisDailyData.Date);
if (thisDailyData.ProviderCaption !== "") {
eachDCForecast.caption = resourceFile.getString(thisDailyData.ProviderCaption)
}
else {
eachDCForecast.caption = ""
}
eachDCForecast.temphigh = (thisDailyData.TempHigh !== undefined) ? weatherFormatter.getTemperatureWithDegreeUnit(thisDailyData.TempHigh) : noDataString;
eachDCForecast.templow = (thisDailyData.TempLow !== undefined) ? weatherFormatter.getTemperatureWithDegreeUnit(thisDailyData.TempLow) : noDataString;
eachDCForecast.temphighWithoutUnit = (thisDailyData.TempHigh !== undefined) ? weatherFormatter.formatInt(thisDailyData.TempHigh) : noDataString;
eachDCForecast.templowWithoutUnit = (thisDailyData.TempLow !== undefined) ? weatherFormatter.formatInt(thisDailyData.TempLow) : noDataString;
var safeIconCode=thisDailyData.IconCode;
eachDCForecast.skycode = "/images/skycodes/66x62/" + safeIconCode + '.png';
eachDCForecast.skycodeSmall = "/images/skycodes/30x30/" + safeIconCode + '.png';
eachDCForecast.daySkycode = "/images/skycodes/89x89/" + safeIconCode + '.png';
eachDCForecast.precipitation = weatherFormatter.getPercentageUnit(thisDailyData.PrecipChance);
eachDCForecast.daywindspeed = weatherFormatter.getSpeedUnitAndDirection(thisDailyData.WindSpeed, thisDailyData.WindDirection, unit).value;
eachDCForecast.humidity = weatherFormatter.getPercentageUnit(thisDailyData.Humidity);
eachDCForecast.sunrise = weatherFormatter.getFormattedHourlyTime(thisDailyData.Sunrise);
eachDCForecast.sunset = weatherFormatter.getFormattedHourlyTime(thisDailyData.Sunset);
eachDCForecast.dayuv = (thisDailyData.UV !== undefined) ? weatherFormatter.getFormattedUvIndex(thisDailyData.UV) : noDataString;
eachDCForecast.showuvindex = "none";
if (thisDailyData.dayUV !== undefined) {
eachDCForecast.showuvindex = "block"
}
if (thisDailyData.NightProviderCaption !== "") {
eachDCForecast.nightcaption = resourceFile.getString(thisDailyData.NightProviderCaption)
}
else {
eachDCForecast.nightcaption = ""
}
var nightSafeIconCode=thisDailyData.NightIconCode;
eachDCForecast.nightSkycode = "/images/skycodes/89x89/" + nightSafeIconCode + '.png';
eachDCForecast.nightprecipitation = weatherFormatter.getPercentageUnit(thisDailyData.NightPrecipChance);
eachDCForecast.nightwindspeed = weatherFormatter.getSpeedUnitAndDirection(thisDailyData.NightWindSpeed, thisDailyData.NightWindDirection, unit).value;
eachDCForecast.nighthumidity = weatherFormatter.getPercentageUnit(thisDailyData.NightHumidity);
eachDCForecast.iconcode = (safeIconCode) ? safeIconCode : '';
this._dailyConditions[0] = WinJS.Binding.as(eachDC)
}
}
}, setSkiHourlyConditions: function setSkiHourlyConditions(weatherData, unit) {
var resourceFile=PlatformJS.Services.resourceLoader;
var symbolPosition=WeatherAppJS.Utilities.Formatting.getSymbolPosition();
var weatherFormatter=WeatherAppJS.Utilities.Formatting;
var noDataString=WeatherAppJS.Utilities.Common.getNoDataString();
if (weatherData.hrly) {
this._hourlyConditions = {};
var provider=toStaticHTML(weatherData.hrly.Provid);
var hourlyData=weatherData.hrly.Hrly;
if (!this._hourlyConditions[provider]) {
this._hourlyConditions[provider] = []
}
var hc=this._hourlyConditions[provider];
hc.dataAttributionText = PlatformJS.Services.resourceLoader.getString("DataAttribution");
hc.providerName = (provider) ? PlatformJS.Services.resourceLoader.getString(provider) : "";
hc.providerUrl = WeatherAppJS.Utilities.Common.getProviderAttributionUrl(provider);
for (var i=0; i < hourlyData.length; i++) {
if (!hc[i]) {
hc[i] = {}
}
var eachHC=hc[i];
var thisHourlyData=hourlyData[i];
eachHC.kifTime = thisHourlyData.Tm;
eachHC.time = weatherFormatter.getFormattedHourlyTime(thisHourlyData.Tm);
eachHC.caption = PlatformJS.Services.resourceLoader.getString(thisHourlyData.Cptn);
eachHC.temperature = (thisHourlyData.Temp !== undefined) ? weatherFormatter.getTemperatureWithDegreeUnit(thisHourlyData.Temp) : noDataString;
eachHC.temperatureWithoutUnit = thisHourlyData.Temp;
var safeIconCode=thisHourlyData.Icn;
eachHC.skycode = "/images/skycodes/48x48/" + safeIconCode + ".png";
eachHC.precipitation = weatherFormatter.getPercentageUnit(thisHourlyData.PrcpChnc);
eachHC.feelslike = (thisHourlyData.FlsLk !== undefined) ? weatherFormatter.getTemperatureWithDegreeUnit(thisHourlyData.FlsLk) : noDataString;
eachHC.symbolPosition = symbolPosition;
eachHC.wind = weatherFormatter.getSpeedUnit(thisHourlyData.wndSpd, unit).value;
this._hourlyConditions[provider][i] = WinJS.Binding.as(eachHC)
}
}
}, setSkiDeals: function setSkiDeals(response) {
var skiDeals;
var weatherFormatting=WeatherAppJS.Utilities.Formatting;
if (!this._skiDeals) {
this._skiDeals = {}
}
skiDeals = this._skiDeals;
skiDeals.deals = [];
if (response && response.nwsDlsData && response.nwsDlsData.nwsL instanceof Array) {
response.nwsDlsData.nwsL.forEach(function(newsDealsItem) {
skiDeals.deals.push({
dealTitle: newsDealsItem.hdLin, dealUrl: weatherFormatting.getSanitizedUrl(newsDealsItem.bckLnk), dealText: newsDealsItem.bdy, thumbnail: newsDealsItem.lwRsImg
})
})
}
}, setSkiReviews: function setSkiReviews(response) {
var skiReviews;
var weatherFormatting=WeatherAppJS.Utilities.Formatting;
if (!this._skiReviews) {
this._skiReviews = {}
}
skiReviews = this._skiReviews;
skiReviews.ratingsList = [];
skiReviews.reviewList = [];
if (response && response.rvwData && response.rvwData.reviews instanceof Array) {
skiReviews.ratingsList.push({
overAll: response.rvwData.avgRat, totalRatings: response.rvwData.ttlRvw, familyFriendly: response.rvwData.ffRat, ratingone: response.rvwData.r1, ratingtwo: response.rvwData.r2, ratingthree: response.rvwData.r3, ratingfour: response.rvwData.r4, ratingfive: response.rvwData.r5
});
response.rvwData.reviews.forEach(function(reviewItem) {
skiReviews.reviewList.push({
id: reviewItem.id, headline: reviewItem.title, date: weatherFormatting.getFormattedReviewDate(reviewItem.date), rating: reviewItem.rating, reviewText: reviewItem.text, reviewUrl: weatherFormatting.getSanitizedUrl(reviewItem.url)
})
});
if (response.rvwData.rvwsLink) {
skiReviews.reviewUrl = [];
skiReviews.reviewUrl.push({reviewUrlClick: WinJS.UI.eventHandler(function() {
var eventAttr={resort: response.loc.nm};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Ski Resorts Reviews", "Ski Reviews More", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr));
WeatherAppJS.Utilities.Common.navigateToWebView(weatherFormatting.getSanitizedUrl(response.rvwData.rvwsLink))
})})
}
}
}, setNearbyResorts: function setNearbyResorts(response, unit, lastUpdatedTime) {
var skiResorts;
if (!this._nearbyResorts) {
this._nearbyResorts = {}
}
skiResorts = this._nearbyResorts;
skiResorts.tempunit = unit;
skiResorts.lastUpdatedTime = lastUpdatedTime;
skiResorts.resorts = [];
var locType=WeatherAppJS.GeocodeLocation.locationType.skiLocation;
if (response && response.resorts && response.resorts instanceof Array) {
response.resorts.forEach(function(resortItem) {
if (resortItem.id && resortItem.loc) {
var loc={};
loc.id = resortItem.id;
loc.latitude = resortItem.loc.la;
loc.longitude = resortItem.loc.lo;
loc.name = resortItem.loc.nm;
loc.city = resortItem.loc.nm;
loc.state = resortItem.loc.st;
loc.country = resortItem.loc.co;
loc.isoCode = resortItem.loc.cc;
loc.fullName = [loc.city, loc.state, loc.country].join(", ");
loc.locType = locType;
loc.fetchByLatLong = true;
loc.source = "Nearby Resorts";
var geocodeLocation=WeatherAppJS.GeocodeLocation.createGeocodeLocation(loc);
if (geocodeLocation) {
WeatherAppJS.GeocodeCache.addLocation(geocodeLocation);
skiResorts.resorts.push({
resortId: geocodeLocation.getId(), thumbnail: resortItem.img && resortItem.img.u ? resortItem.img.u : 'ms-appx:///images/skiResorts/genericNearbyResortImage.jpg', resortName: resortItem.loc.nm, snow: (resortItem.ns !== undefined) ? WeatherAppJS.Utilities.Formatting.getSnowDepthUnit(resortItem.ns, unit) : WeatherAppJS.Utilities.Common.getNoDataString()
})
}
}
})
}
}, setPhotosynthPanoramas: function setPhotosynthPanoramas(responseObj) {
var resourceLoader=PlatformJS.Services.resourceLoader;
var photoSynthPanoramas;
if (!this._photosynthPanoramas) {
this._photosynthPanoramas = {}
}
photoSynthPanoramas = this._photosynthPanoramas;
photoSynthPanoramas.panos = [];
if (responseObj && responseObj.cam) {
photoSynthPanoramas.cams = []
}
var shortDateTimeFormat=PlatformJS.Services.resourceLoader.getString('ShortDateTimeFormatString');
if (responseObj && responseObj.cam && responseObj.cam.hiRsImgs instanceof Array) {
responseObj.cam.hiRsImgs.forEach(function(c) {
photoSynthPanoramas.cams.push({
title: c.cptn, thumbnail: c.u, date: WeatherAppJS.Utilities.Formatting.getShortDateTimeString(c.dtTim), height: c.h, width: c.w
})
})
}
if (responseObj && responseObj.pnrmData && responseObj.pnrmData.panos instanceof Array) {
responseObj.pnrmData.panos.forEach(function(p) {
photoSynthPanoramas.panos.push({
panoId: p.id, thumbnail: p.thumb, title: p.title
})
})
}
}
})})
})();
(function() {
WinJS.Namespace.define("WeatherAppJS.DataManager", {
_getPromiseToProcessDataAsync: function _getPromiseToProcessDataAsync(locId, unit, bypassCache, key, fetchData, validateData, processData, errorMsg, dropCacheFunction, skipPrefetchWait) {
var innerPromise;
return new WinJS.Promise(function(complete, error, progress) {
var appserverhost=WeatherAppJS.WarmBoot.Cache.getString("AppServerHost");
var appId=WeatherAppJS.WarmBoot.Cache.getString("AppID");
var mkt=WeatherAppJS.WarmBoot.Cache.getString("AppServerMarket");
var region=WeatherAppJS.WarmBoot.Cache.getString("AppServerRegion");
var loc=WeatherAppJS.GeocodeCache.getLocation(locId);
if (loc) {
if (!fetchData) {
error(errorMsg);
return
}
var cachedData=null;
var prefetchData=PlatformJS.BootCache.instance.getPrefetchRequest(key);
var prefetchLocId=null;
if (prefetchData) {
prefetchLocId = PlatformJS.BootCache.instance.getEntry(key + "PrefetchLocId", function() {
return null
});
if (prefetchLocId !== locId) {
prefetchData = null
}
}
if (prefetchData && !prefetchData.ready && !skipPrefetchWait && !PlatformJS.isPlatformInitialized) {
var timeOutValue=300;
if (Windows.Storage.ApplicationData.current.localSettings.values.hasKey("LaunchPrefetchTimeout")) {
timeOutValue = Windows.Storage.ApplicationData.current.localSettings.values["LaunchPrefetchTimeout"]
}
WinJS.Promise.any([PlatformJS.BootCache.instance.isPrefetchCompleteAsync(), WinJS.Promise.timeout(timeOutValue)]).then(function() {
WeatherAppJS.DataManager._getPromiseToProcessDataAsync(locId, unit, bypassCache, key, fetchData, validateData, processData, errorMsg, dropCacheFunction, true).then(function(validatedLocId) {
complete(validatedLocId)
}, function(errorObject) {
error(errorObject)
}, function(progressObject) {
progress(progressObject)
})
});
return
}
if (prefetchData && prefetchData.ready && !PlatformJS.isPlatformInitialized) {
cachedData = {
string: prefetchData.data, locId: prefetchLocId, lastUpdateTime: new Date
}
}
if (!cachedData) {
cachedData = PlatformJS.BootCache.instance.getEntry(key, function() {
return null
})
}
var locationObj=WeatherAppJS.LocationsManager.getLocation(locId);
if (cachedData && !PlatformJS.isPlatformInitialized && cachedData.locId === locId) {
var obj={};
obj.dataString = cachedData.string;
obj.lastUpdateTime = cachedData.lastUpdateTime;
var validatedLocId=WeatherAppJS.DataManager._parseValidateProcessData(appserverhost, appId, locId, unit, mkt, region, obj, validateData, processData, dropCacheFunction);
complete(validatedLocId)
}
else {
if (!PlatformJS.isPlatformInitialized) {
PlatformJS.startPlatformInitialization()
}
PlatformJS.platformInitializedPromise.then(function() {
innerPromise = fetchData(appserverhost, appId, locId, unit, mkt, region, bypassCache);
innerPromise.then(function(response) {
var returnedLocId=WeatherAppJS.DataManager._parseValidateProcessData(appserverhost, appId, locId, unit, mkt, region, response, validateData, processData, dropCacheFunction);
if (!returnedLocId) {
error(errorMsg);
return
}
var insert={};
insert.string = response.dataString;
insert.locId = locId;
PlatformJS.BootCache.instance.addOrUpdateEntry(key, insert);
PlatformJS.BootCache.instance.addOrUpdateEntry("time", response.lastUpdateTime.getTime());
complete(returnedLocId)
}, function(e) {
if (PlatformJS.Utilities.isPromiseCanceled(e)) {
return
}
if (parseInt(e.message) !== Platform.PlatformExceptionCode.cachedDataAvailable) {
error(e)
}
else {
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType)
}
}, function(p) {
if (p.statusCode === Platform.DataServices.QueryServiceStatusCode.cachedEntryFound) {
var returnedLocId=WeatherAppJS.DataManager._parseValidateProcessData(appserverhost, appId, locId, unit, mkt, region, p.cachedResponse, validateData, processData, dropCacheFunction);
if (!returnedLocId) {
error(errorMsg);
return
}
progress(returnedLocId)
}
})
})
}
}
}, function() {
if (innerPromise && innerPromise.cancel) {
innerPromise.cancel()
}
})
}, _parseValidateProcessData: function _parseValidateProcessData(appserverhost, appId, locId, unit, mkt, region, response, validateData, processData, dropCacheFunction) {
var isDataValid=false;
var deserializedObj=WeatherAppJS.DataManager._deserializeData(response);
if (deserializedObj) {
isDataValid = validateData(deserializedObj)
}
if (!deserializedObj || !isDataValid) {
dropCacheFunction(appserverhost, appId, locId, unit, mkt, region);
return null
}
var returnedLocId=processData(locId, response, deserializedObj);
return returnedLocId
}, getCCDataForLocationAsync: function getCCDataForLocationAsync(locId, unit, bypassCache, isFetchByName) {
var dataManager=WeatherAppJS.DataManager;
var fetchData,
dropCache;
var key=null;
if (isFetchByName) {
fetchData = dataManager.fetchCCAndForecastData;
dropCache = dataManager._dropCCAndForecastCacheByName
}
else {
fetchData = dataManager.fetchCCAndForecastDataByLatLong;
dropCache = dataManager._dropCCAndForecastCacheByLatLong;
key = "fetchCCAndForecastDataByLatLong"
}
return dataManager._getPromiseToProcessDataAsync(locId, unit, bypassCache, key, fetchData, dataManager._validateData, dataManager._processCCAndForecastData, "Processing CC data returned from datamanager failed", dropCache)
}, getImageServicesDataForLocationAsync: function getImageServicesDataForLocationAsync(locId, bypassCache) {
var dataManager=WeatherAppJS.DataManager;
var fetchData,
dropCache;
fetchData = dataManager.fetchImageDataByLatLong;
dropCache = dataManager._dropImageDataCacheByLatLong;
return dataManager._getPromiseToProcessDataAsync(locId, '', bypassCache, "fetchImageDataByLatLong", fetchData, dataManager._validateImageData, dataManager._processImageData, "Processing Image data returned from datamanager failed", dropCache)
}, getAlertsDataForLocationAsync: function getAlertsDataForLocationAsync(locId, unit, bypassCache, isFetchByName) {
var dataManager=WeatherAppJS.DataManager;
var fetchData,
dropCache;
if (isFetchByName) {
fetchData = dataManager.fetchAlertsData;
dropCache = dataManager._dropAlertsCacheByName
}
else {
fetchData = dataManager.fetchAlertsDataByLatLong;
dropCache = dataManager._dropAlertsCacheByLatLong
}
return dataManager._getPromiseToProcessDataAsync(locId, unit, bypassCache, null, fetchData, dataManager._validateData, dataManager._processAlertsData, "Processing Alerts data returned from datamanager failed", dropCache)
}, getMapsDataForLocationAsync: function getMapsDataForLocationAsync(locId, unit, bypassCache, isFetchByName) {
var dataManager=WeatherAppJS.DataManager;
var fetchData,
dropCache;
if (isFetchByName) {
fetchData = dataManager.fetchMapsData;
dropCache = dataManager._dropMapsCacheByName
}
else {
fetchData = dataManager.fetchMapsDataByLatLong;
dropCache = dataManager._dropMapsCacheByLatLong
}
return dataManager._getPromiseToProcessDataAsync(locId, unit, bypassCache, null, fetchData, dataManager._validateData, dataManager._processMapsData, "Processing Maps data returned from datamanager failed", dropCache)
}, getTianQiMapsDataAsync: function getTianQiMapsDataAsync(locId, unit, bypassCache) {
var dataManager=WeatherAppJS.DataManager;
return dataManager._getPromiseToProcessDataAsync(locId, unit, bypassCache, null, dataManager.fetchTianQiMapsData, dataManager._validateData, dataManager._processMapsData, "Processing Maps data returned from datamanager failed", dataManager._dropTianQiMapsCache)
}, getInteractiveMapsClusterDataForLocationAsync: function getInteractiveMapsClusterDataForLocationAsync(locId, isoCode, bypassCache) {
var that=this;
var middleTierHostMaps=PlatformJS.Services.appConfig.getString("MiddleTierHostMaps");
var mkt=Platform.Globalization.Marketization.getCurrentMarket().toLowerCase();
var unit=WeatherAppJS.SettingsManager.getDisplayUnit();
var urlParams=PlatformJS.Collections.createStringDictionary();
var loc=WeatherAppJS.GeocodeCache.getLocation(locId);
var latitude,
longitude;
if (loc && !isNaN(parseFloat(loc.latitude)) && isFinite(loc.latitude) && !isNaN(parseFloat(loc.longitude)) && isFinite(loc.longitude)) {
latitude = WeatherAppJS.Utilities.Common.trimLatLong(loc.latitude);
longitude = WeatherAppJS.Utilities.Common.trimLatLong(loc.longitude)
}
else {
return WinJS.Promise.wrapError("Invalid Latitude Longitude data")
}
urlParams.insert("middletierhostmaps", middleTierHostMaps);
urlParams.insert("latitude", WeatherAppJS.Utilities.Common.trimLatLong(latitude, 1));
urlParams.insert("longitude", WeatherAppJS.Utilities.Common.trimLatLong(longitude, 1));
urlParams.insert("isocode", isoCode);
urlParams.insert("market", mkt);
urlParams.insert("unit", unit);
urlParams.insert("fulldata", WeatherAppJS.Utilities.UI.fetchReducedMapsData());
var options=new Platform.DataServices.QueryServiceOptions;
options.useCompatDataModel = true;
options.bypassCache = bypassCache;
options.enableAutoRefresh = false;
var qsiMapsResponseForLocation=new PlatformJS.DataService.QueryService("WeatherInteractiveMapsClusterResponse");
return qsiMapsResponseForLocation.downloadDataAsync(urlParams, null, null, options).then(function(response) {
var responseObj=that._deserializeData(response);
if (responseObj) {
responseObj.tempunit = unit;
var locIdObj=that._processInteractiveMapsClusterData(locId, response, responseObj);
if (locIdObj) {
return WinJS.Promise.wrap(locIdObj)
}
}
qsiMapsResponseForLocation.deleteCacheEntryAsync(urlParams, null);
return WinJS.Promise.wrapError("Invalid maps response data")
})
}, getHWDataForLocationAsync: function getHWDataForLocationAsync(locId, unit, bypassCache, isFetchByName) {
var dataManager=WeatherAppJS.DataManager;
var fetchData,
dropCache;
if (isFetchByName) {
fetchData = dataManager.fetchHistoricData;
dropCache = dataManager._dropHWCacheByName
}
else {
fetchData = dataManager.fetchHistoricDataByLatLong;
dropCache = dataManager._dropHWCacheByLatLong
}
return dataManager._getPromiseToProcessDataAsync(locId, unit, bypassCache, null, fetchData, dataManager._validateData, dataManager._processHWData, "Processing historic data returned from datamanager failed", dropCache)
}, getHourlyForecastDataForLocationAsync: function getHourlyForecastDataForLocationAsync(locId, unit, bypassCache, isFetchByName) {
var dataManager=WeatherAppJS.DataManager;
return dataManager._getPromiseToProcessDataAsync(locId, unit, bypassCache, null, dataManager.fetchHourlyForecastDataByLatLong, dataManager._validateHourlyForecastData, dataManager._processHourlyForecastData, "Processing hourly forecast data returned from datamanager failed", dataManager._dropHourlyForecastCacheByLatLong)
}, getTileDataForLocationAsync: function getTileDataForLocationAsync(locId, unit, bypassCache, isFetchByName) {
var dataManager=WeatherAppJS.DataManager;
var fetchData,
dropCache;
if (isFetchByName) {
fetchData = dataManager.fetchTileData;
dropCache = dataManager._dropTileCacheByName
}
else {
fetchData = dataManager.fetchTileDataByLatLong;
dropCache = dataManager._dropTileCacheByLatLong
}
return dataManager._getPromiseToProcessDataAsync(locId, unit, bypassCache, null, fetchData, dataManager._validateData, dataManager._processTileData, "Processing tile data returned from datamanager failed", dropCache)
}, getTianQiDataForLocationAsync: function getTianQiDataForLocationAsync(locId, unit, bypassCache) {
var dataManager=WeatherAppJS.DataManager;
return dataManager._getPromiseToProcessDataAsync(locId, unit, bypassCache, "fetchTianQiDataForLocation", dataManager.fetchTianQiData, dataManager._validateData, dataManager._processTianQiData, "Processing TianQi data returned from datamanager failed", dataManager._dropTianQiCacheByName)
}, getTianQiTileDataForLocationAsync: function getTianQiTileDataForLocationAsync(locId, unit, bypassCache) {
var dataManager=WeatherAppJS.DataManager;
return dataManager._getPromiseToProcessDataAsync(locId, unit, bypassCache, null, dataManager.fetchTianQiTileData, dataManager._validateData, dataManager._processTianQiTileData, "Processing TianQi Tile data returned from datamanager failed", dataManager._dropTianQiTileCacheByLatLong)
}, getSkiTileDataForLocationAsync: function getSkiTileDataForLocationAsync(locId, unit, bypassCache) {
var locID=locId;
var appConfig=PlatformJS.Services.appConfig;
var middleTierHostSkiBeach=appConfig.getString("MiddleTierHostSkiBeach");
var mkt=appConfig.getString("AppServerMarket");
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("middletierhostskibeach", middleTierHostSkiBeach);
urlParams.insert("id", locID);
urlParams.insert("unit", unit);
urlParams.insert("mkt", mkt);
var options=new Platform.DataServices.QueryServiceOptions;
options.useCompatDataModel = true;
options.bypassCache = bypassCache;
options.enableAutoRefresh = false;
var qsSkiDetailsForLocation=new PlatformJS.DataService.QueryService("SkiTileById");
return qsSkiDetailsForLocation.downloadDataAsync(urlParams, null, null, options).then(function(response) {
var deserializedObj=WeatherAppJS.DataManager._deserializeData(response);
var loc=null;
try {
loc = WeatherAppJS.LocationsManager.getLocation(locId);
if (!loc) {
loc = new WeatherAppJS.WeatherLocation(locId)
}
loc.setSkiTileData(response, deserializedObj);
loc._fForceUpdateCC = true;
WeatherAppJS.LocationsManager.addLocation(loc);
return loc.id
}
catch(err) {
return null
}
})
}, getWorldWeatherDataForLocationsAsync: function getWorldWeatherDataForLocationsAsync(continent, locIdList, unit, bypassCache) {
var that=this;
var innerPromise;
return new WinJS.Promise(function(complete, error, progress) {
innerPromise = that.fetchWorldWeatherData(continent, unit, bypassCache);
innerPromise.then(function(response) {
var responseObj=that._deserializeData(response);
if (responseObj && responseObj.length > 0 && WeatherAppJS.DataManager._validateWorldWeatherData(responseObj)) {
var locationsDataObj=that._processWorldWeatherData(continent, locIdList, response, responseObj);
if (locationsDataObj) {
complete(locationsDataObj);
return
}
}
that._dropWorldWeatherCache(continent, unit);
error("Error processing world weather data.");
return
}, function(e) {
if (PlatformJS.Utilities.isPromiseCanceled(e)) {
return
}
error(e)
}, function(p) {
if (p.statusCode === Platform.DataServices.QueryServiceStatusCode.cachedEntryFound) {
var responseObj=that._deserializeData(p.cachedResponse);
if (responseObj && responseObj.length > 0 && WeatherAppJS.DataManager._validateWorldWeatherData(responseObj)) {
var locationsDataObj=that._processWorldWeatherData(continent, locIdList, p.cachedResponse, responseObj);
if (locationsDataObj) {
progress(locationsDataObj);
return
}
}
}
else if (p.statusCode === Platform.DataServices.QueryServiceStatusCode.suspending || p.statusCode === Platform.DataServices.QueryServiceStatusCode.resuming) {
progress(p)
}
})
}, function() {
if (innerPromise && innerPromise.cancel) {
innerPromise.cancel()
}
})
}, getSkiDetailsAsync: function getSkiDetailsAsync(resortID, unit, bypassCache) {
var locID=resortID;
var middleTierHostSkiBeach=PlatformJS.Services.appConfig.getString("MiddleTierHostSkiBeach");
var language=Platform.Globalization.Marketization.getQualifiedLanguageString();
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("middletierhostskibeach", middleTierHostSkiBeach);
urlParams.insert("resortid", resortID);
urlParams.insert("unit", unit);
urlParams.insert("language", language);
var options=new Platform.DataServices.QueryServiceOptions;
options.useCompatDataModel = true;
options.bypassCache = bypassCache;
options.enableAutoRefresh = false;
var processSkiDetailsData=function(response) {
var lastUpdateTime=response.lastUpdateTime;
try {
var isUpdateReq=true;
var responseObj=JSON.parse(response.dataString);
var locationObj=WeatherAppJS.LocationsManager.getLocation(locID);
if (!locationObj) {
locationObj = new WeatherAppJS.WeatherLocation(locID)
}
else {
var cc=locationObj.getCurrentConditions();
if (cc && cc.lastUpdatedTime === response.lastUpdateTime.getTime()) {
isUpdateReq = false
}
}
if (isUpdateReq) {
locationObj.setSkiOverview(responseObj, lastUpdateTime, unit);
locationObj.setSkiDailyConditions(responseObj, unit);
locationObj.setSkiHourlyConditions(responseObj, unit);
locationObj.setPhotosynthPanoramas(responseObj.camPnrmData);
locationObj.setSkiDeals(responseObj);
locationObj.setSkiReviews(responseObj);
WeatherAppJS.LocationsManager.addLocation(locationObj)
}
return locationObj
}
catch(ex) {
return null
}
};
var qsSkiDetailsForLocation=new PlatformJS.DataService.QueryService("SkiDetails");
var innerPromise;
return new WinJS.Promise(function(complete, error, progress) {
innerPromise = qsSkiDetailsForLocation.downloadDataAsync(urlParams, null, null, options).then(function(response) {
var locationObj=processSkiDetailsData(response);
if (!locationObj) {
qsSkiDetailsForLocation.deleteCacheEntryAsync(urlParams, null);
error()
}
complete(locationObj)
}, function(e) {
error(e)
}, function(response) {
if (response.statusCode === Platform.DataServices.QueryServiceStatusCode.cachedEntryFound) {
var locationObj=processSkiDetailsData(response.cachedResponse);
if (!locationObj) {
qsSkiDetailsForLocation.deleteCacheEntryAsync(urlParams, null);
error()
}
progress(locationObj)
}
})
}, function() {
if (innerPromise && innerPromise.cancel) {
innerPromise.cancel()
}
})
}, getNearbySkiResortsByIdAsync: function getNearbySkiResortsByIdAsync(resortID, unit, bypassCache, isoCode) {
var middleTierHostSkiBeach=PlatformJS.Services.appConfig.getString("MiddleTierHostSkiBeach");
var language=Platform.Globalization.Marketization.getQualifiedLanguageString();
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("middletierhostskibeach", middleTierHostSkiBeach);
urlParams.insert("resortid", resortID);
urlParams.insert("unit", unit);
urlParams.insert("language", language);
urlParams.insert("isocode", isoCode);
var options=new Platform.DataServices.QueryServiceOptions;
options.useCompatDataModel = true;
options.bypassCache = bypassCache;
options.enableAutoRefresh = false;
var qsNearbySkiResortsByIdForLocation=new PlatformJS.DataService.QueryService("NearbyResortsById");
return qsNearbySkiResortsByIdForLocation.downloadDataAsync(urlParams, null, null, options).then(function(response) {
try {
var lastUpdateTime=response.lastUpdateTime;
var resortsResponseObj=JSON.parse(response.dataString);
var locationObj=WeatherAppJS.LocationsManager.getLocation(resortID);
if (!locationObj) {
locationObj = new WeatherAppJS.WeatherLocation(resortID)
}
locationObj.setNearbyResorts(resortsResponseObj, unit, lastUpdateTime);
var skiResorts=locationObj.getNearbyResorts();
if (!skiResorts || !skiResorts.resorts || skiResorts.resorts.length < 1) {
return WinJS.Promise.wrapError(null)
}
WeatherAppJS.LocationsManager.addLocation(locationObj);
return WinJS.Promise.wrap(locationObj)
}
catch(ex) {
qsNearbySkiResortsByIdForLocation.deleteCacheEntryAsync(urlParams, null);
WinJS.Promise.wrapError(null)
}
})
}, getNearbySkiResortsByLatLongAsync: function getNearbySkiResortsByLatLongAsync(locID, unit, bypassCache, isoCode) {
var trimLatLong=WeatherAppJS.Utilities.Common.trimLatLong;
var geoLoc=WeatherAppJS.GeocodeCache.getLocation(locID);
var language=Platform.Globalization.Marketization.getQualifiedLanguageString();
var middleTierHostSkiBeach=PlatformJS.Services.appConfig.getString("MiddleTierHostSkiBeach");
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("middletierhostskibeach", middleTierHostSkiBeach);
urlParams.insert("latitude", trimLatLong(geoLoc.latitude, 1));
urlParams.insert("longitude", trimLatLong(geoLoc.longitude, 1));
urlParams.insert("unit", unit);
urlParams.insert("language", language);
urlParams.insert("isocode", isoCode);
var options=new Platform.DataServices.QueryServiceOptions;
options.useCompatDataModel = true;
options.bypassCache = bypassCache;
options.enableAutoRefresh = false;
var qsNearbySkiResortsForLocation=new PlatformJS.DataService.QueryService("NearbyResortsByLatLong");
return qsNearbySkiResortsForLocation.downloadDataAsync(urlParams, null, null, options).then(function(response) {
try {
var lastUpdateTime=response.lastUpdateTime;
var resortsResponseObj=JSON.parse(response.dataString);
var locationObj=WeatherAppJS.LocationsManager.getLocation(locID);
if (!locationObj) {
locationObj = new WeatherAppJS.WeatherLocation(locID)
}
locationObj.setNearbyResorts(resortsResponseObj, unit, lastUpdateTime);
var skiResorts=locationObj.getNearbyResorts();
if (!skiResorts || !skiResorts.resorts || skiResorts.resorts.length < 1) {
return WinJS.Promise.wrapError(null)
}
WeatherAppJS.LocationsManager.addLocation(locationObj);
return WinJS.Promise.wrap(locationObj)
}
catch(ex) {
qsNearbySkiResortsForLocation.deleteCacheEntryAsync(urlParams, null);
WinJS.Promise.wrapError(null)
}
})
}, getHeroThemeData: function getHeroThemeData(HeroImgAndTheme, morphedSkyCode, bypassCache) {
return new WinJS.Promise(function(complete, error, progress) {
var cachedData=null;
var key="themeCSS";
cachedData = PlatformJS.BootCache.instance.getEntry(key, function() {
return null
});
if (cachedData && !PlatformJS.isPlatformInitialized) {
complete(cachedData)
}
else {
PlatformJS.platformInitializedPromise.then(function() {
if (HeroImgAndTheme) {
var urlParams=PlatformJS.Collections.createStringDictionary();
var baseUrl=HeroImgAndTheme.cssBase;
var imageObj=null;
if (HeroImgAndTheme.iconcodeMaps[morphedSkyCode]) {
imageObj = HeroImgAndTheme.iconcodeMaps[morphedSkyCode]
}
else {
imageObj = HeroImgAndTheme.iconcodeMaps['44']
}
urlParams.insert("themebaseurl", baseUrl);
if (imageObj) {
urlParams.insert("theme", imageObj["BW_HERO"].thm)
}
else {
urlParams.insert("theme", "")
}
var options=new Platform.DataServices.QueryServiceOptions;
options.useCompatDataModel = true;
options.enableAutoRefresh = false;
options.bypassCache = bypassCache;
var innerPromise=new PlatformJS.DataService.QueryService("themeCSS");
return innerPromise.downloadDataAsync(urlParams, null, null, options).then(function(response) {
if (response) {
PlatformJS.BootCache.instance.addOrUpdateEntry(key, response.dataString);
complete(response.dataString)
}
}, function(error) {
return WinJS.Promise.wrap(null)
})
}
else {
complete(null)
}
})
}
}, function() {
if (innerPromise && innerPromise.cancel) {
innerPromise.cancel()
}
})
}, fetchCCAndForecastData: function fetchCCAndForecastData(appserverhost, appID, locID, unit, mkt, region, bypassCache) {
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("appserverhost", appserverhost);
urlParams.insert("appid", appID);
urlParams.insert("locationName", locID);
urlParams.insert("unit", unit);
urlParams.insert("mkt", mkt);
urlParams.insert("region", region);
var options=new Platform.DataServices.QueryServiceOptions;
options.useCompatDataModel = true;
options.bypassCache = bypassCache;
options.enableAutoRefresh = false;
var qsCCForLocation=new PlatformJS.DataService.QueryService("CurrentConditionsAndForecastForLocation");
return qsCCForLocation.downloadDataAsync(urlParams, null, null, options)
}, fetchAlertsData: function fetchAlertsData(appserverhost, appID, locID, unit, mkt, region, bypassCache) {
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("appserverhost", appserverhost);
urlParams.insert("appid", appID);
urlParams.insert("locationName", locID);
urlParams.insert("unit", unit);
urlParams.insert("mkt", mkt);
urlParams.insert("region", region);
var options=new Platform.DataServices.QueryServiceOptions;
options.useCompatDataModel = true;
options.bypassCache = bypassCache;
options.enableAutoRefresh = false;
var qsAlertsForLocation=new PlatformJS.DataService.QueryService("AlertsForLocation");
return qsAlertsForLocation.downloadDataAsync(urlParams, null, null, options)
}, fetchMapsData: function fetchMapsData(appserverhost, appID, locID, unit, mkt, region, bypassCache) {
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("appserverhost", appserverhost);
urlParams.insert("appid", appID);
urlParams.insert("locationName", locID);
urlParams.insert("unit", unit);
urlParams.insert("mkt", mkt);
urlParams.insert("region", region);
var options=new Platform.DataServices.QueryServiceOptions;
options.useCompatDataModel = true;
options.bypassCache = bypassCache;
options.enableAutoRefresh = false;
var qsMapsForLocation=new PlatformJS.DataService.QueryService("WeatherMapsForLocation");
return qsMapsForLocation.downloadDataAsync(urlParams, null, null, options)
}, fetchHistoricData: function fetchHistoricData(appserverhost, appID, locID, unit, mkt, region, bypassCache) {
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("appserverhost", appserverhost);
urlParams.insert("appid", appID);
urlParams.insert("locationName", locID);
urlParams.insert("unit", unit);
urlParams.insert("mkt", mkt);
urlParams.insert("region", region);
var options=new Platform.DataServices.QueryServiceOptions;
options.useCompatDataModel = true;
options.bypassCache = bypassCache;
options.enableAutoRefresh = false;
options.honorServerExpiryTime = false;
var qsHWForLocation=new PlatformJS.DataService.QueryService("HistoricalWeatherForLocation");
return qsHWForLocation.downloadDataAsync(urlParams, null, null, options)
}, fetchTileData: function fetchTileData(appserverhost, appID, locID, unit, mkt, region, bypassCache) {
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("appserverhost", appserverhost);
urlParams.insert("appid", appID);
urlParams.insert("locationName", locID);
urlParams.insert("unit", unit);
urlParams.insert("mkt", mkt);
urlParams.insert("region", region);
var options=new Platform.DataServices.QueryServiceOptions;
options.useCompatDataModel = true;
options.bypassCache = bypassCache;
options.enableAutoRefresh = false;
options.retryCount = 1;
var qsTileForLocation=new PlatformJS.DataService.QueryService("TileForLocation");
return qsTileForLocation.downloadDataAsync(urlParams, null, null, options)
}, getWorldWeatherUrlParams: function getWorldWeatherUrlParams(continent, unit, bypassCache) {
var middleTierHost=PlatformJS.Services.appConfig.getString("MiddleTierHost");
var appServerHost=PlatformJS.Services.appConfig.getString("AppServerHost");
var mkt=PlatformJS.Services.appConfig.getString("MiddleTierMarket");
var appId=PlatformJS.Services.appConfig.getString("AppID");
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("middletierhost", middleTierHost);
urlParams.insert("appserverhost", appServerHost);
urlParams.insert("continent", continent);
urlParams.insert("unit", unit);
urlParams.insert("mkt", mkt);
urlParams.insert("appid", appId);
var options=new Platform.DataServices.QueryServiceOptions;
options.useCompatDataModel = true;
options.bypassCache = bypassCache;
options.enableAutoRefresh = true;
return {
urlParams: urlParams, options: options
}
}, fetchHistoricalDataString: function fetchHistoricalDataString(lat, long, startDate, bypassCache) {
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("lat", lat);
urlParams.insert("long", long);
urlParams.insert("startdate", startDate);
var options=new Platform.DataServices.QueryServiceOptions;
options.useCompatDataModel = true;
options.bypassCache = bypassCache;
options.enableAutoRefresh = false;
var qs=new PlatformJS.DataService.QueryService("HistoricalDataString");
return qs.downloadDataAsync(urlParams, null, null, options)
}, fetchWorldWeatherData: function fetchWorldWeatherData(continent, unit, bypassCache) {
var params=this.getWorldWeatherUrlParams(continent, unit, bypassCache);
var qsWorldWeatherForContinent=new PlatformJS.DataService.QueryService("WorldWeatherForContinent");
return qsWorldWeatherForContinent.downloadDataAsync(params.urlParams, null, null, params.options)
}, getAdsAsync: function getAdsAsync(bypassCache) {
var options=new Platform.DataServices.QueryServiceOptions;
options.useCompatDataModel = true;
options.enableAutoRefresh = false;
options.retryCount = 1;
options.bypassCache = bypassCache;
var urlParams=PlatformJS.Collections.createStringDictionary();
var mkt=Platform.Globalization.Marketization.getCurrentMarket().toLowerCase();
urlParams.insert("market", mkt);
var qsAdsFeed=new PlatformJS.DataService.QueryService("TodayAdFeed");
if (WeatherAppJS.Utilities.Common.isAdsAvailable(mkt)) {
return qsAdsFeed.downloadDataAsync(urlParams, null, null, options).then(function(response) {
try {
var todayResponseObj=JSON.parse(response.dataString);
if (todayResponseObj.adsData) {
return WinJS.Promise.wrap(todayResponseObj.adsData)
}
else {
qsAdsFeed.deleteCacheEntryAsync(null, null);
return WinJS.Promise.wrapError(null)
}
}
catch(ex) {
qsAdsFeed.deleteCacheEntryAsync(null, null);
return WinJS.Promise.wrapError(null)
}
})
}
else {
return WinJS.Promise.wrapError(null)
}
}, updateWorldWeatherCache: function updateWorldWeatherCache(continent, unit) {
var params=this.getWorldWeatherUrlParams(continent, unit, false);
var qsWorldWeatherForContinent=new PlatformJS.DataService.QueryService("WorldWeatherForContinent");
qsWorldWeatherForContinent.hasEntryAsync(params.urlParams, null).then(function(hasEntry) {
if (!hasEntry) {
var options=new Platform.DataServices.PrefetchQueryServiceOptions;
options.priority = Platform.DataServices.QueryServicePriority.low;
qsWorldWeatherForContinent.prefetchData(params.urlParams, null, null, options, null, null)
}
})
}, getWorldWeatherLastUpdatedTime: function getWorldWeatherLastUpdatedTime(continent) {
var that=this;
var unit=WeatherAppJS.SettingsManager.getDisplayUnit();
var params=this.getWorldWeatherUrlParams(continent, unit, false);
return new WinJS.Promise(function(complete, error, progress) {
that.fetchWorldWeatherData(continent, unit, false).then(function(response) {
var lastUpdatedTime=null;
if (response && response.lastUpdateTime) {
lastUpdatedTime = response.lastUpdateTime
}
complete(lastUpdatedTime)
}, function(errorMessage) {
if (error) {
error(errorMessage)
}
}, function(response) {
var lastUpdatedTime=null;
if (response && response.cachedResponse && response.cachedResponse.lastUpdateTime) {
lastUpdatedTime = response.cachedResponse.lastUpdateTime;
if (lastUpdatedTime) {
progress(lastUpdatedTime)
}
}
})
})
}, fetchCCAndForecastDataByLatLong: function fetchCCAndForecastDataByLatLong(appserverhost, appId, locID, unit, mkt, region, bypassCache) {
var trimLatLong=WeatherAppJS.Utilities.Common.trimLatLong;
var locationObj=WeatherAppJS.GeocodeCache.getLocation(locID);
var locationName=locationObj.getFullName();
var latitude=locationObj.latitude;
var longitude=locationObj.longitude;
var appexserverhost="";
var dataSourceKey="CurrentConditionsAndForecastByLatLong";
if (WeatherAppJS.Utilities.Common.shouldUseAppexDataSource(locID)) {
appexserverhost = WeatherAppJS.WarmBoot.Cache.getString("AppexServerHost");
dataSourceKey = "CurrentConditionsAndForecastByLatLongAppex"
}
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("appserverhost", appserverhost);
urlParams.insert("appexserverhost", appexserverhost);
urlParams.insert("appid", appId);
urlParams.insert("locationName", locationName);
urlParams.insert("latitude", trimLatLong(latitude));
urlParams.insert("longitude", trimLatLong(longitude));
urlParams.insert("unit", unit);
urlParams.insert("mkt", mkt);
urlParams.insert("region", region);
var options=new Platform.DataServices.QueryServiceOptions;
options.useCompatDataModel = true;
options.bypassCache = bypassCache;
options.enableAutoRefresh = false;
var qsCCByLatLong=new PlatformJS.DataService.QueryService(dataSourceKey);
var url=qsCCByLatLong.getUrl(urlParams).trim();
PlatformJS.BootCache.instance.addorUpdatePrefetchUrl("fetchCCAndForecastDataByLatLong", url);
PlatformJS.BootCache.instance.addOrUpdateEntry("fetchCCAndForecastDataByLatLongPrefetchLocId", locID);
return qsCCByLatLong.downloadDataAsync(urlParams, null, null, options)
}, fetchImageDataByLatLong: function fetchImageDataByLatLong(appserverhost, appId, locID, unit, mkt, region, bypassCache) {
var middleTierHost=PlatformJS.Services.appConfig.getString("MiddleTierHostImageData");
var locationObj=WeatherAppJS.GeocodeCache.getLocation(locID);
var urlParams=PlatformJS.Collections.createStringDictionary();
var imageUriByLatLong=WeatherAppJS.WarmBoot.Cache.getBool("FetchImageUriByLatLong");
if (imageUriByLatLong) {
var trimLatLong=WeatherAppJS.Utilities.Common.trimLatLong;
var latitude=locationObj.latitude;
var longitude=locationObj.longitude;
var latlongTrimVal=WeatherAppJS.WarmBoot.Cache.getInt32("LatLongDecimalPlacesForImageServices");
urlParams.insert("latitude", trimLatLong(latitude, latlongTrimVal));
urlParams.insert("longitude", trimLatLong(longitude, latlongTrimVal))
}
else {
urlParams.insert("latitude", 0);
urlParams.insert("longitude", 0)
}
urlParams.insert("middletierhostimagedata", middleTierHost);
urlParams.insert("client", 'big');
var options=new Platform.DataServices.QueryServiceOptions;
options.useCompatDataModel = true;
options.bypassCache = false;
options.enableAutoRefresh = false;
var imgDataByLatLong=new PlatformJS.DataService.QueryService("ImageDataForLatLong");
var url=imgDataByLatLong.getUrl(urlParams).trim();
PlatformJS.BootCache.instance.addorUpdatePrefetchUrl("fetchImageDataByLatLong", url);
PlatformJS.BootCache.instance.addOrUpdateEntry("fetchImageDataByLatLongPrefetchLocId", locID);
return imgDataByLatLong.downloadDataAsync(urlParams, null, null, options)
}, fetchAlertsDataByLatLong: function fetchAlertsDataByLatLong(appserverhost, appId, locID, unit, mkt, region, bypassCache) {
var trimLatLong=WeatherAppJS.Utilities.Common.trimLatLong;
var locationObj=WeatherAppJS.GeocodeCache.getLocation(locID);
var latitude=locationObj.latitude;
var longitude=locationObj.longitude;
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("appserverhost", appserverhost);
urlParams.insert("appid", appId);
urlParams.insert("latitude", trimLatLong(latitude));
urlParams.insert("longitude", trimLatLong(longitude));
urlParams.insert("unit", unit);
urlParams.insert("mkt", mkt);
urlParams.insert("region", region);
var options=new Platform.DataServices.QueryServiceOptions;
options.useCompatDataModel = true;
options.bypassCache = bypassCache;
options.enableAutoRefresh = false;
var qsAlertsByLatLong=new PlatformJS.DataService.QueryService("AlertsByLatLong");
return qsAlertsByLatLong.downloadDataAsync(urlParams, null, null, options)
}, fetchMapsDataByLatLong: function fetchMapsDataByLatLong(appserverhost, appId, locID, unit, mkt, region, bypassCache) {
var trimLatLong=WeatherAppJS.Utilities.Common.trimLatLong;
var locationObj=WeatherAppJS.GeocodeCache.getLocation(locID);
var latitude=locationObj.latitude;
var longitude=locationObj.longitude;
var urlParams=PlatformJS.Collections.createStringDictionary();
var appexserverhost=WeatherAppJS.WarmBoot.Cache.getString("AppexServerHost");
urlParams.insert("appexserverhost", appexserverhost);
urlParams.insert("appid", appId);
urlParams.insert("latitude", trimLatLong(latitude));
urlParams.insert("longitude", trimLatLong(longitude));
urlParams.insert("unit", unit);
urlParams.insert("mkt", mkt);
urlParams.insert("region", region);
var options=new Platform.DataServices.QueryServiceOptions;
options.useCompatDataModel = true;
options.bypassCache = bypassCache;
options.enableAutoRefresh = false;
var qsMapsByLatLong=new PlatformJS.DataService.QueryService("WeatherMapsByLatLong");
return qsMapsByLatLong.downloadDataAsync(urlParams, null, null, options)
}, fetchTianQiMapsData: function fetchTianQiMapsData(appserverhost, appId, locID, unit, mkt, region, bypassCache) {
var trimLatLong=WeatherAppJS.Utilities.Common.trimLatLong;
var locationObj=WeatherAppJS.GeocodeCache.getLocation(locID);
var latitude=locationObj.latitude;
var longitude=locationObj.longitude;
var middleTierHost=PlatformJS.Services.appConfig.getString("MiddleTierHostForTianqi");
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("middletierhost", middleTierHost);
urlParams.insert("locationName", WeatherAppJS.Utilities.TianQi.getEncodedLocationNameForQuery(locationObj.getFullName()));
urlParams.insert("latitude", trimLatLong(latitude));
urlParams.insert("longitude", trimLatLong(longitude));
var options=new Platform.DataServices.QueryServiceOptions;
options.useCompatDataModel = true;
options.bypassCache = bypassCache;
options.enableAutoRefresh = false;
var qsMapsByLatLong=new PlatformJS.DataService.QueryService("TianQiWeatherMapsByLatLong");
return qsMapsByLatLong.downloadDataAsync(urlParams, null, null, options)
}, fetchHistoricDataByLatLong: function fetchHistoricDataByLatLong(appserverhost, appId, locID, unit, mkt, region, bypassCache) {
var trimLatLong=WeatherAppJS.Utilities.Common.trimLatLong;
var locationObj=WeatherAppJS.GeocodeCache.getLocation(locID);
var latitude=locationObj.latitude;
var longitude=locationObj.longitude;
var urlParams=PlatformJS.Collections.createStringDictionary();
var appexServerHost=WeatherAppJS.WarmBoot.Cache.getString("AppexServerHost");
urlParams.insert("appexserverhost", appexServerHost);
urlParams.insert("appid", appId);
urlParams.insert("latitude", trimLatLong(latitude));
urlParams.insert("longitude", trimLatLong(longitude));
urlParams.insert("unit", unit);
urlParams.insert("mkt", mkt);
urlParams.insert("region", region);
var options=new Platform.DataServices.QueryServiceOptions;
options.useCompatDataModel = true;
options.bypassCache = bypassCache;
options.enableAutoRefresh = false;
options.honorServerExpiryTime = false;
var qsHWByLatLong=new PlatformJS.DataService.QueryService("HistoricalWeatherByLatLong");
return qsHWByLatLong.downloadDataAsync(urlParams, null, null, options)
}, fetchHourlyForecastDataByLatLong: function fetchHourlyForecastDataByLatLong(appserverhost, appId, locID, unit, mkt, region, bypassCache) {
var trimLatLong=WeatherAppJS.Utilities.Common.trimLatLong;
var locationObj=WeatherAppJS.GeocodeCache.getLocation(locID);
var latitude=locationObj.latitude;
var longitude=locationObj.longitude;
var middletierhost=PlatformJS.Services.appConfig.getString("AppServerHost");
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("appserverhost", middletierhost);
urlParams.insert("appid", appId);
urlParams.insert("latitude", trimLatLong(latitude));
urlParams.insert("longitude", trimLatLong(longitude));
urlParams.insert("unit", unit);
urlParams.insert("mkt", mkt);
urlParams.insert("region", region);
var isFullData=WeatherAppJS.Utilities.UI.fetchReducedHourlyForecastData();
urlParams.insert("fulldata", isFullData);
var options=new Platform.DataServices.QueryServiceOptions;
options.useCompatDataModel = true;
options.bypassCache = bypassCache;
options.enableAutoRefresh = false;
var queryServiceId="HourlyForecastWeatherByLatLong";
if (locationObj.isSkiLocation) {
queryServiceId = "HourlyForecastWeatherByLatLongSkiResorts";
urlParams.insert("resortid", locationObj.getId())
}
var qs=new PlatformJS.DataService.QueryService(queryServiceId);
return qs.downloadDataAsync(urlParams, null, null, options)
}, prefetchHourlyForecastDataByLatLong: function prefetchHourlyForecastDataByLatLong(locId) {
var trimLatLong=WeatherAppJS.Utilities.Common.trimLatLong;
var urlParams=PlatformJS.Collections.createStringDictionary();
var loc=WeatherAppJS.GeocodeCache.getLocation(locId);
var latitude=loc.latitude;
var longitude=loc.longitude;
var appConfig=PlatformJS.Services.appConfig;
var middletierhost=appConfig.getString("AppServerHost");
var appId=appConfig.getString("AppID");
var mkt=appConfig.getString("AppServerMarket");
var region=appConfig.getString("AppServerRegion");
var unit=WeatherAppJS.SettingsManager.getDisplayUnit();
urlParams.insert("appserverhost", middletierhost);
urlParams.insert("appid", appId);
urlParams.insert("latitude", trimLatLong(latitude));
urlParams.insert("longitude", trimLatLong(longitude));
urlParams.insert("unit", unit);
urlParams.insert("mkt", mkt);
urlParams.insert("region", region);
var isFullData=WeatherAppJS.Utilities.UI.fetchReducedHourlyForecastData();
urlParams.insert("fulldata", isFullData);
var options=new Platform.DataServices.PrefetchQueryServiceOptions;
options.priority = Platform.DataServices.QueryServicePriority.low;
var queryServiceId="HourlyForecastWeatherByLatLong";
if (loc.isSkiLocation) {
queryServiceId = "HourlyForecastWeatherByLatLongSkiResorts";
urlParams.insert("resortid", loc.getId())
}
var qs=new PlatformJS.DataService.QueryService(queryServiceId);
return qs.prefetchData(urlParams, null, null, options, null, null)
}, fetchTileDataByLatLong: function fetchTileDataByLatLong(appserverhost, appId, locID, unit, mkt, region, bypassCache) {
var trimLatLong=WeatherAppJS.Utilities.Common.trimLatLong;
var locationObj=WeatherAppJS.GeocodeCache.getLocation(locID);
var latitude=locationObj.latitude;
var longitude=locationObj.longitude;
var appexserverhost="";
var dataSourceKey="TileByLatLong";
if (WeatherAppJS.Utilities.Common.shouldUseAppexDataSource(locID)) {
appexserverhost = WeatherAppJS.WarmBoot.Cache.getString("AppexServerHost");
dataSourceKey = "TileByLatLongAppex"
}
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("appserverhost", appserverhost);
urlParams.insert("appexserverhost", appexserverhost);
urlParams.insert("appid", appId);
urlParams.insert("latitude", trimLatLong(latitude));
urlParams.insert("longitude", trimLatLong(longitude));
urlParams.insert("unit", unit);
urlParams.insert("mkt", mkt);
urlParams.insert("region", region);
var options=new Platform.DataServices.QueryServiceOptions;
options.useCompatDataModel = true;
options.bypassCache = bypassCache;
options.enableAutoRefresh = false;
options.retryCount = 1;
var qsTileByLatLong=new PlatformJS.DataService.QueryService(dataSourceKey);
return qsTileByLatLong.downloadDataAsync(urlParams, null, null, options)
}, fetchTianQiData: function fetchTianQiData(appserverhost, appId, locID, unit, mkt, region, bypassCache) {
var loc=WeatherAppJS.GeocodeCache.getLocation(locID);
var trimLatLong=WeatherAppJS.Utilities.Common.trimLatLong;
var middletierhost=PlatformJS.Services.appConfig.getString("MiddleTierHostForTianqi");
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("middletierhost", middletierhost);
urlParams.insert("appid", appId);
urlParams.insert("locationName", WeatherAppJS.Utilities.TianQi.getEncodedLocationNameForQuery(loc.getFullName()));
urlParams.insert("latitude", trimLatLong(loc.latitude));
urlParams.insert("longitude", trimLatLong(loc.longitude));
var options=new Platform.DataServices.QueryServiceOptions;
options.useCompatDataModel = true;
options.bypassCache = bypassCache;
options.enableAutoRefresh = false;
var qsTianQiRequest=new PlatformJS.DataService.QueryService("TianQiWeatherByLocation");
return qsTianQiRequest.downloadDataAsync(urlParams, null, null, options)
}, fetchTianQiTileData: function fetchTianQiTileData(appserverhost, appId, locationName, unit, mkt, region, bypassCache) {
var trimLatLong=WeatherAppJS.Utilities.Common.trimLatLong;
var locationObj=WeatherAppJS.GeocodeCache.getLocation(locationName);
var latitude=locationObj.latitude;
var longitude=locationObj.longitude;
appserverhost = PlatformJS.Services.appConfig.getString("MiddleTierHostForTianqi");
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("middletierhost", appserverhost);
urlParams.insert("city", locationObj.city);
urlParams.insert("latitude", trimLatLong(latitude));
urlParams.insert("longitude", trimLatLong(longitude));
var options=new Platform.DataServices.QueryServiceOptions;
options.useCompatDataModel = true;
options.bypassCache = bypassCache;
options.enableAutoRefresh = false;
var qsTianQiRequest=new PlatformJS.DataService.QueryService("TianQiTileWeatherByLatLong");
return qsTianQiRequest.downloadDataAsync(urlParams, null, null, options)
}, _deserializeData: function _deserializeData(responseString) {
var responseObj={};
if (!responseString) {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logCustom(Microsoft.Bing.AppEx.Telemetry.LogLevel.high, "AppNoResponseReceived", "");
WeatherAppJS.Utilities.Instrumentation.incrementInt32('NumTimesNoResponseReceived');
return null
}
try {
responseObj = JSON.parse(responseString.dataString)
}
catch(err) {
WeatherAppJS.Utilities.Instrumentation.incrementInt32('NumTimesNoResponseReceived');
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logCustom(Microsoft.Bing.AppEx.Telemetry.LogLevel.high, "AppNoResponseReceived", "");
return null
}
return responseObj
}, _validateWorldWeatherData: function _validateWorldWeatherData(responseObj) {
if (!(responseObj && responseObj.length > 0)) {
WeatherAppJS.Utilities.Instrumentation.incrementInt32('NumTimesNoResponseReceived');
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logCustom(Microsoft.Bing.AppEx.Telemetry.LogLevel.high, "AppNoResponseReceived", "");
return false
}
return true
}, _validateData: function _validateData(responseObj) {
if (!(responseObj && responseObj.BdiGeneric_BingResponse_1_0 && responseObj.BdiGeneric_BingResponse_1_0.Responses && responseObj.BdiGeneric_BingResponse_1_0.Responses.length > 0)) {
WeatherAppJS.Utilities.Instrumentation.incrementInt32('NumTimesNoResponseReceived');
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logCustom(Microsoft.Bing.AppEx.Telemetry.LogLevel.high, "AppNoResponseReceived", "");
return false
}
return true
}, _validateImageData: function _validateImageData(responseObj) {
if (!(responseObj)) {
WeatherAppJS.Utilities.Instrumentation.incrementInt32('NumTimesNoResponseReceived');
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logCustom(Microsoft.Bing.AppEx.Telemetry.LogLevel.high, "AppNoResponseReceived", "");
return false
}
return true
}, _validateHourlyForecastData: function _validateHourlyForecastData(responseObj) {
if (!responseObj) {
WeatherAppJS.Utilities.Instrumentation.incrementInt32('NumTimesNoResponseReceived');
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logCustom(Microsoft.Bing.AppEx.Telemetry.LogLevel.high, "AppNoResponseReceived", "");
return false
}
return true
}, _processCCAndForecastData: function _processCCAndForecastData(locId, bdiResponse, ccResponseObj) {
var weatherData=null;
var loc=null;
try {
var isUpdateReq=true;
loc = WeatherAppJS.LocationsManager.getLocation(locId);
if (!loc) {
loc = new WeatherAppJS.WeatherLocation(locId)
}
else {
var cc=loc.getCurrentConditions();
if (bdiResponse.lastUpdateTime) {
var holder=bdiResponse.lastUpdateTime.getTime();
PlatformJS.BootCache.instance.addOrUpdateEntry("timeTmp", holder)
}
else {
holder = PlatformJS.BootCache.instance.getEntry("timeTmp", function() {
return null
})
}
if (cc && cc.lastUpdatedTime === holder) {
isUpdateReq = false
}
}
if (isUpdateReq) {
weatherData = WeatherAppJS.DataManager._cropOverViewData(bdiResponse, ccResponseObj);
loc.setCurrentConditions(weatherData);
loc.setHourlyConditions(weatherData);
loc.setDailyConditions(weatherData);
WeatherAppJS.LocationsManager.addLocation(loc)
}
return loc.id
}
catch(err) {
return null
}
}, _processImageData: function _processImageData(locId, response, deseralizedResponse) {
var weatherData=null;
var loc=null;
try {
var isUpdateReq=true;
loc = WeatherAppJS.LocationsManager.getLocation(locId);
if (!loc) {
loc = new WeatherAppJS.WeatherLocation(locId)
}
else {
var imgD=loc.getHeroImageAndThemeData();
if (response.lastUpdateTime) {
var holder=response.lastUpdateTime.getTime();
PlatformJS.BootCache.instance.addOrUpdateEntry("timeHeroImage", holder)
}
else {
holder = PlatformJS.BootCache.instance.getEntry("timeHeroImage", function() {
return null
})
}
if (imgD && imgD.lastUpdatedTime === holder) {
isUpdateReq = false
}
}
if (isUpdateReq) {
loc.setHeroImageAndThemeData(response, deseralizedResponse);
WeatherAppJS.LocationsManager.addLocation(loc)
}
return loc.id
}
catch(err) {
return null
}
}, _processAlertsData: function _processAlertsData(locId, bdiResponse, alertsResponseObj) {
var weatherData=null;
var loc=null;
try {
weatherData = WeatherAppJS.DataManager._cropAlertsData(bdiResponse, alertsResponseObj);
loc = WeatherAppJS.LocationsManager.getLocation(locId);
if (!loc) {
loc = new WeatherAppJS.WeatherLocation(locId)
}
loc.setAlerts(weatherData);
WeatherAppJS.LocationsManager.addLocation(loc);
return loc.id
}
catch(err) {
return null
}
}, _processMapsData: function _processMapsData(locId, bdiResponse, mapsResponseObj) {
var weatherData=null;
var loc=null;
try {
weatherData = WeatherAppJS.DataManager._cropMapsData(bdiResponse, mapsResponseObj);
loc = WeatherAppJS.LocationsManager.getLocation(locId);
if (!loc) {
loc = new WeatherAppJS.WeatherLocation(locId)
}
loc.setMaps(weatherData);
WeatherAppJS.LocationsManager.addLocation(loc);
return loc.id
}
catch(err) {
return null
}
}, _processInteractiveMapsClusterData: function _processInteractiveMapsClusterData(locId, mapsResponse, mapsResponseObj) {
var weatherData=null;
var loc=null;
try {
weatherData = WeatherAppJS.DataManager._cropInteractiveMapsData(mapsResponse, mapsResponseObj);
loc = WeatherAppJS.LocationsManager.getLocation(locId);
if (!loc) {
loc = new WeatherAppJS.WeatherLocation(locId)
}
loc.setInteractiveMaps(weatherData);
WeatherAppJS.LocationsManager.addLocation(loc);
return loc.id
}
catch(err) {
return null
}
}, _processHWData: function _processHWData(locId, bdiResponse, hwResponseObj) {
var weatherData=null;
var loc=null;
try {
weatherData = WeatherAppJS.DataManager._cropHistoricalData(bdiResponse, hwResponseObj);
loc = WeatherAppJS.LocationsManager.getLocation(locId);
if (!loc) {
loc = new WeatherAppJS.WeatherLocation(locId)
}
loc.setHistoricalWeather(weatherData);
WeatherAppJS.LocationsManager.addLocation(loc);
return loc.id
}
catch(err) {
return null
}
}, _processHourlyForecastData: function _processHourlyForecastData(locId, bdiResponse, hfResponseObj) {
var weatherData=null;
try {
weatherData = WeatherAppJS.DataManager._cropHourlyForecastData(bdiResponse, hfResponseObj);
return weatherData
}
catch(err) {
return null
}
}, _processTileData: function _processTileData(locId, bdiResponse, tileResponseObj) {
var weatherData=null;
var loc=null;
try {
weatherData = WeatherAppJS.DataManager._cropTileData(bdiResponse, tileResponseObj);
loc = WeatherAppJS.LocationsManager.getLocation(locId);
if (!loc) {
loc = new WeatherAppJS.WeatherLocation(locId)
}
loc.setTile(weatherData);
WeatherAppJS.LocationsManager.addLocation(loc);
return loc.id
}
catch(err) {
return null
}
}, _processTianQiTileData: function _processTianQiTileData(locId, bdiResponse, responseObj) {
var weatherData=null;
var loc=null;
try {
weatherData = WeatherAppJS.DataManager._cropTianQiTileData(bdiResponse, responseObj);
loc = WeatherAppJS.LocationsManager.getLocation(locId);
if (!loc) {
loc = new WeatherAppJS.WeatherLocation(locId)
}
loc.setCurrentConditions(weatherData);
WeatherAppJS.LocationsManager.addLocation(loc);
return loc.id
}
catch(err) {
return null
}
}, _processTianQiData: function _processTianQiData(locId, bdiResponse, responseObj) {
var weatherData=null;
var loc=null;
try {
var isUpdateReq=true;
loc = WeatherAppJS.LocationsManager.getLocation(locId);
if (!loc) {
loc = new WeatherAppJS.WeatherLocation(locId)
}
else {
var cc=loc.getCurrentConditions();
var savedLastUpdatedTime=null;
if (bdiResponse.lastUpdateTime) {
savedLastUpdatedTime = bdiResponse.lastUpdateTime.getTime();
PlatformJS.BootCache.instance.addOrUpdateEntry("lastUpdatedTime", savedLastUpdatedTime)
}
else {
savedLastUpdatedTime = PlatformJS.BootCache.instance.getEntry("lastUpdatedTime", function() {
return null
})
}
if (cc && cc.lastUpdatedTime === savedLastUpdatedTime) {
isUpdateReq = false
}
}
if (isUpdateReq) {
weatherData = WeatherAppJS.DataManager._cropTianQiData(bdiResponse, responseObj);
loc.setCurrentConditions(weatherData);
loc.setHourlyConditions(weatherData, true);
loc.setDailyConditions(weatherData);
WeatherAppJS.LocationsManager.addLocation(loc)
}
return loc.id
}
catch(err) {
return null
}
}, _processWorldWeatherData: function _processWorldWeatherData(continent, locIdList, bdiResponse, responseObj) {
var locationsData={};
var useTianQi=Platform.Utilities.Globalization.isFeatureEnabled("UseTianQi");
for (var l in responseObj) {
try {
var loc=null;
var locName=responseObj[l].Location.Name;
if (locIdList[locName]) {
var locId=locIdList[locName];
var locationResponseString=responseObj[l]["WeatherResponse"];
var locationResponseObj=JSON.parse(locationResponseString);
var locationBdiResponse={lastUpdateTime: new Date(responseObj[l]["FetchTime"])};
var isTianQiResponse=useTianQi && (locName === "Beijing" || locName === "Shanghai");
if (this._validateData(locationResponseObj)) {
var weatherData=(isTianQiResponse) ? this._cropTianQiTileData(locationBdiResponse, locationResponseObj) : this._cropTileData(locationBdiResponse, locationResponseObj);
loc = WeatherAppJS.LocationsManager.getLocation(locId);
if (!loc) {
loc = new WeatherAppJS.WeatherLocation(locId)
}
if (isTianQiResponse) {
loc.setCurrentConditions(weatherData)
}
else {
loc.setTile(weatherData)
}
WeatherAppJS.LocationsManager.addLocation(loc);
locationsData[loc.id] = loc
}
}
}
catch(err) {}
}
return locationsData
}, _cropOverViewData: function _cropOverViewData(bdiResponse, ccResponseObj) {
var weatherFormatting=WeatherAppJS.Utilities.Formatting;
var weatherCommon=WeatherAppJS.Utilities.Common;
var resourceLoader=PlatformJS.Services.resourceLoader;
var direction=weatherCommon.getDirection();
var symbolPosition=weatherFormatting.getSymbolPosition();
var overviewData={};
var currentConditionsResponse=ccResponseObj.BdiGeneric_BingResponse_1_0.Responses[0];
if (bdiResponse.lastUpdateTime) {
overviewData.LastUpdatedTime = bdiResponse.lastUpdateTime.getTime()
}
else {
overviewData.LastUpdatedTime = PlatformJS.BootCache.instance.getEntry("time", function() {
return null
})
}
overviewData.TempUnit = currentConditionsResponse.TempUnit;
var prioritizedProviders=WeatherAppJS.DataManager._getPrioritizedProvidersByDailyForecast(currentConditionsResponse);
if (prioritizedProviders.length === 0) {
WeatherAppJS.Utilities.Instrumentation.incrementInt32('NumTimesNoResponseReceived');
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logCustom(Microsoft.Bing.AppEx.Telemetry.LogLevel.high, "AppNoResponseReceived", "");
return null
}
var currentWeatherProvider=prioritizedProviders[0];
var currentWeather=WeatherAppJS.DataManager._getCurrentWeather(currentConditionsResponse, currentWeatherProvider);
var noDataString=WeatherAppJS.Utilities.Common.getNoDataString();
overviewData.CurrentWeather = {};
if (currentWeather) {
PlatformJS.BootCache.instance.addOrUpdateEntry("currentWeather", currentWeather)
}
else {
currentWeather = PlatformJS.BootCache.instance.getEntry("currentWeather", function() {
return null
})
}
overviewData.CurrentWeather.HasTemp = (currentWeather.Temperature !== undefined) ? true : false;
overviewData.CurrentWeather.Temperature = (overviewData.CurrentWeather.HasTemp) ? weatherFormatting.getTemperatureWithDegreeUnit(currentWeather.Temperature) : noDataString;
overviewData.CurrentWeather.TemperatureWithoutUnit = (overviewData.CurrentWeather.HasTemp) ? weatherFormatting.formatInt(currentWeather.Temperature) : noDataString;
overviewData.CurrentWeather.FeelsLike = (currentWeather.FeelsLike === undefined) ? noDataString : weatherFormatting.getTemperatureWithDegreeUnit(currentWeather.FeelsLike);
overviewData.CurrentWeather.UTCOffset = (currentWeather.ObservationTime && currentWeather.ObservationTime.UTCOffset) ? currentWeather.ObservationTime.UTCOffset : noDataString;
if (currentWeather.ProviderCaption) {
overviewData.CurrentWeather.Caption = currentWeather.ProviderCaption
}
else {
overviewData.CurrentWeather.Caption = currentWeather.Caption
}
overviewData.CurrentWeather.IconCode = currentWeather.IconCode;
overviewData.CurrentWeather.DayNightIndicator = (currentWeather.DayNightIndicator === 'd' || currentWeather.DayNightIndicator === 'n') ? currentWeather.DayNightIndicator : "";
var weatherProperties={};
var windspeed="";
overviewData.CurrentWeather.WeatherProperties = [];
if (currentWeather.WindSpeed !== undefined) {
if (!currentWeather.WindDirection || currentWeather.WindSpeed === 0) {
windspeed = weatherFormatting.getSpeedUnit(currentWeather.WindSpeed, currentConditionsResponse.TempUnit)
}
else {
windspeed = weatherFormatting.getSpeedUnitAndDirection(currentWeather.WindSpeed, currentWeather.WindDirection, currentConditionsResponse.TempUnit)
}
weatherProperties['Wind'] = {};
weatherProperties['Wind'][0] = windspeed.value;
weatherProperties['Wind'][1] = direction;
weatherProperties['Wind'][2] = windspeed.arialabel
}
if (currentWeather.Humidity !== undefined) {
weatherProperties['Humidity'] = {};
weatherProperties['Humidity'][0] = weatherFormatting.getPercentageUnit(currentWeather.Humidity);
weatherProperties['Humidity'][1] = symbolPosition
}
if (currentWeather.Visibility !== undefined) {
weatherProperties['Visibility'] = {};
weatherProperties['Visibility'][0] = weatherFormatting.getDistanceUnit(currentWeather.Visibility, currentConditionsResponse.TempUnit);
weatherProperties['Visibility'][1] = direction
}
if (currentWeather.Barometer !== undefined) {
weatherProperties['Barometer'] = {};
weatherProperties['Barometer'][0] = weatherFormatting.getPressureUnit(currentWeather.Barometer, currentConditionsResponse.TempUnit).value;
weatherProperties['Barometer'][1] = direction;
weatherProperties['Barometer'][2] = weatherFormatting.getPressureUnit(currentWeather.Barometer, currentConditionsResponse.TempUnit).arialabel
}
if (currentWeather.DewPoint !== undefined) {
weatherProperties['Dewpoint'] = {};
weatherProperties['Dewpoint'][0] = weatherFormatting.getTemperatureWithDegreeUnit(currentWeather.DewPoint);
weatherProperties['Dewpoint'][1] = symbolPosition
}
if (currentWeather.UV !== undefined) {
weatherProperties['UvIndex'] = {};
weatherProperties['UvIndex'][0] = weatherFormatting.getFormattedUvIndex(currentWeather.UV);
weatherProperties['UvIndex'][1] = direction
}
var keyOrder=WeatherAppJS.WarmBoot.Cache.getString("WeatherProperties").split(",");
for (var i=0; i < keyOrder.length; i++) {
if (weatherProperties[keyOrder[i]]) {
var keyorder=keyOrder[i];
overviewData.CurrentWeather.WeatherProperties.push({
Key: resourceLoader.getString(keyorder), Value: weatherProperties[keyorder][0], symbolPosition: weatherProperties[keyorder][1], ariaLabel: weatherProperties[keyorder][2] ? weatherProperties[keyorder][2] : ""
})
}
}
overviewData.CurrentConditionProvider = currentWeatherProvider;
overviewData.AlertsCount = currentConditionsResponse.AlertsCount;
overviewData.IsTripPlanAvailable = currentConditionsResponse.IsTripPlanAvailable;
overviewData.IsMapsAvailable = currentConditionsResponse.IsMapsAvailable;
overviewData.IsDailyDrilldownEnabled = false;
if (currentConditionsResponse.IsHourlyForecastByDayAvailable) {
overviewData.IsDailyDrilldownEnabled = true
}
overviewData.DailyForecast = [];
for (var p in prioritizedProviders) {
var perProvider=WeatherAppJS.DataManager._getDailyForecast(currentConditionsResponse, prioritizedProviders[p]);
var forecastPerProvider={};
forecastPerProvider.Provider = perProvider.Provider;
if (perProvider.Provider.toLowerCase() === "weather.com" && perProvider.CurrentLink && perProvider.CurrentLink.Url) {
forecastPerProvider.BaseProviderUrl = perProvider.CurrentLink.Url;
forecastPerProvider.ProviderUrl = weatherCommon.getWeatherDotComUrl(perProvider.CurrentLink.Url, "WeatherDotComOverviewUrl")
}
else if (perProvider.Provider.toLowerCase() === "weather service ltd") {
forecastPerProvider.BaseProviderUrl = '';
forecastPerProvider.ProviderUrl = ''
}
else if (perProvider.CurrentLink) {
forecastPerProvider.BaseProviderUrl = perProvider.CurrentLink.Url;
forecastPerProvider.ProviderUrl = perProvider.CurrentLink.Url
}
forecastPerProvider.DailyConditions = [];
if ((perProvider.Provider === currentWeatherProvider) && perProvider.DailyConditions && perProvider.DailyConditions.length > 0) {
overviewData.CurrentWeather.HasTempHigh = (perProvider.DailyConditions[0].TempHigh !== undefined) ? true : false;
overviewData.CurrentWeather.TempHigh = (overviewData.CurrentWeather.HasTempHigh) ? weatherFormatting.getTemperatureWithDegreeUnit(perProvider.DailyConditions[0].TempHigh) : noDataString;
overviewData.CurrentWeather.TempHighWithoutUnit = (overviewData.CurrentWeather.HasTempHigh) ? weatherFormatting.formatInt(perProvider.DailyConditions[0].TempHigh) : noDataString;
overviewData.CurrentWeather.HasTempLow = (perProvider.DailyConditions[0].TempLow !== undefined) ? true : false;
overviewData.CurrentWeather.TempLow = (overviewData.CurrentWeather.HasTempLow) ? weatherFormatting.getTemperatureWithDegreeUnit(perProvider.DailyConditions[0].TempLow) : noDataString;
overviewData.CurrentWeather.TempLowWithoutUnit = (overviewData.CurrentWeather.HasTempLow) ? weatherFormatting.formatInt(perProvider.DailyConditions[0].TempLow) : noDataString;
overviewData.CurrentWeather.PrecipChance = (perProvider.DailyConditions[0].PrecipChance !== undefined) ? weatherFormatting.getPercentageUnit(perProvider.DailyConditions[0].PrecipChance) : noDataString;
overviewData.CurrentWeather.Sunrise = perProvider.DailyConditions[0].Sunrise;
overviewData.CurrentWeather.Sunset = perProvider.DailyConditions[0].Sunset
}
var isDay1=true;
for (var d in perProvider.DailyConditions) {
var dc=perProvider.DailyConditions[d];
var dailyConditions={};
if (isDay1 && perProvider.Provider.toLowerCase() === "weather service ltd" && dc.TempHigh === undefined && dc.TempLow === undefined) {
continue
}
if (dc.ProviderCaption) {
dailyConditions.Caption = dc.ProviderCaption
}
else {
dailyConditions.Caption = dc.Caption
}
var tmp=weatherFormatting.getFormattedDayName(dc.Date);
var tmpArr=[];
if (tmp) {
tmpArr = tmp.split("|")
}
if (tmpArr.length === 2) {
dailyConditions.Day = tmpArr[0];
dailyConditions.DayName = tmpArr[1]
}
else {
dailyConditions.Day = '';
dailyConditions.DayName = ''
}
dailyConditions.KifTime = dc.Date;
dailyConditions.DayOfYear = weatherFormatting.getDayOfYear(dc.Date);
dailyConditions.Date = weatherFormatting.getFormattedDailyTimeShort(dc.Date);
dailyConditions.FullDate = weatherFormatting.getFormattedDailyTime(dc.Date);
dailyConditions.IconCode = dc.IconCode;
dailyConditions.TempHigh = (dc.TempHigh !== undefined) ? weatherFormatting.getTemperatureWithDegreeUnit(dc.TempHigh) : noDataString;
dailyConditions.TempLow = (dc.TempLow !== undefined) ? weatherFormatting.getTemperatureWithDegreeUnit(dc.TempLow) : noDataString;
dailyConditions.TempHighWithoutUnit = (dc.TempHigh !== undefined) ? weatherFormatting.formatInt(dc.TempHigh) : noDataString;
dailyConditions.TempLowWithoutUnit = (dc.TempLow !== undefined) ? weatherFormatting.formatInt(dc.TempLow) : noDataString;
dailyConditions.PrecipChance = (dc.PrecipChance !== undefined) ? weatherFormatting.getPercentageUnit(dc.PrecipChance) : noDataString;
dailyConditions.Humidity = (dc.Humidity !== undefined) ? weatherFormatting.getPercentageUnit(dc.Humidity) : noDataString;
dailyConditions.Sunrise = (dc.Sunrise !== undefined) ? weatherFormatting.getFormattedHourlyTime(dc.Sunrise) : noDataString;
dailyConditions.Sunset = (dc.Sunset !== undefined) ? weatherFormatting.getFormattedHourlyTime(dc.Sunset) : noDataString;
dailyConditions.dayUV = (dc.UV !== undefined) ? weatherFormatting.getFormattedUvIndex(dc.UV) : noDataString;
if (dc.WindSpeed !== undefined) {
if (!dc.WindDirection || dc.WindSpeed === 0) {
dailyConditions.DayWindSpeed = weatherFormatting.getSpeedUnit(dc.WindSpeed, currentConditionsResponse.TempUnit).value
}
else {
dailyConditions.DayWindSpeed = weatherFormatting.getSpeedUnitAndDirection(dc.WindSpeed, dc.WindDirection, currentConditionsResponse.TempUnit).value
}
}
else {
dailyConditions.DayWindSpeed = noDataString
}
dailyConditions.NightCaption = dc.NightProviderCaption;
dailyConditions.NightIconCode = dc.NightIconCode;
dailyConditions.NightPrecipChance = (dc.NightPrecipChance !== undefined) ? weatherFormatting.getPercentageUnit(dc.NightPrecipChance) : noDataString;
if (dc.NightWindSpeed !== undefined) {
if (!dc.NightWindDirection || dc.NightWindSpeed === 0) {
dailyConditions.NightWindSpeed = weatherFormatting.getSpeedUnit(dc.NightWindSpeed, currentConditionsResponse.TempUnit).value
}
else {
dailyConditions.NightWindSpeed = weatherFormatting.getSpeedUnitAndDirection(dc.NightWindSpeed, dc.NightWindDirection, currentConditionsResponse.TempUnit).value
}
}
else {
dailyConditions.NightWindSpeed = noDataString
}
dailyConditions.NightHumidity = (dc.NightHumidity !== undefined) ? weatherFormatting.getPercentageUnit(dc.NightHumidity) : noDataString;
forecastPerProvider.DailyConditions.push(dailyConditions);
isDay1 = false
}
overviewData.DailyForecast.push(forecastPerProvider)
}
overviewData.HourlyListPerProvider = [];
for (var hIndex in currentConditionsResponse.HourlyListPerProvider) {
var hData=currentConditionsResponse.HourlyListPerProvider[hIndex];
var hourlyDataPerProvider={};
hourlyDataPerProvider.ProviderName = hData.ProviderName;
hourlyDataPerProvider.HourlyTimeInterval = hData.HourlyTimeInterval;
hourlyDataPerProvider.HourlyConditionList = [];
for (var c in hData.HourlyConditionList) {
var hc=hData.HourlyConditionList[c];
var hourlyConditions=weatherFormatting.formatHourlyConditions(hc);
hourlyDataPerProvider.HourlyConditionList.push(hourlyConditions)
}
overviewData.HourlyListPerProvider.push(hourlyDataPerProvider)
}
return overviewData
}, _cropAlertsData: function _cropAlertsData(bdiResponse, alertsResponseObj) {
var alertsData={};
var alertsResponse=alertsResponseObj.BdiGeneric_BingResponse_1_0.Responses[0];
alertsData.LastUpdatedTime = bdiResponse.lastUpdateTime.getTime();
alertsData.Alerts = [];
var weatherAppCommon=WeatherAppJS.Utilities.Common;
var weatherFormatting=WeatherAppJS.Utilities.Formatting;
for (var a in alertsResponse.Alerts) {
var thisAlert=alertsResponse.Alerts[a];
var alertData={};
alertData.Title = thisAlert.Title;
alertData.Description = weatherAppCommon.formatAlertDescription(thisAlert.Description);
alertData.CreateTime = weatherFormatting.getFullDateTimeString(thisAlert.CreateTime);
alertData.ExpirationTime = weatherFormatting.getFullDateTimeString(thisAlert.ExpirationTime);
alertData.CroppedCreateTime = weatherFormatting.getShortDateTimeString(thisAlert.CreateTime, true);
alertData.CroppedExpirationTime = weatherFormatting.getShortDateTimeString(thisAlert.ExpirationTime, true);
alertsData.Alerts.push(alertData)
}
return alertsData
}, _cropMapsData: function _cropMapsData(bdiResponse, mapsResponseObj) {
var mapsData={};
var mapsResponse=mapsResponseObj.BdiGeneric_BingResponse_1_0.Responses[0];
mapsData.LastUpdatedTime = bdiResponse.lastUpdateTime.getTime();
mapsData.TempUnit = mapsResponse.TempUnit;
mapsData.MapCategoryList = [];
for (var c in mapsResponse.MapCategoryList) {
var category=mapsResponse.MapCategoryList[c];
if (category.MapCategory === "Regional" || category.MapCategory === "National" || category.MapCategory === "Travel") {
var newCategory={};
newCategory.MapCategory = category.MapCategory;
newCategory.MapTypeList = [];
for (var m in category.MapTypeList) {
var mapType=category.MapTypeList[m];
var newMapType={};
newMapType.Category = mapType.Category;
newMapType.IsAnimated = mapType.IsAnimated;
newMapType.ProviderName = mapType.ProviderName;
newMapType.ThumbnailUrl = mapType.ThumbnailUrl;
newMapType.Type = mapType.Type;
newMapType.MapList = [];
for (var n in mapType.MapList) {
var map=mapType.MapList[n];
var newMap={};
newMap.ImageUrl = map.ImageUrl;
newMap.SnapTime = map.SnapTime;
newMapType.MapList.push(newMap)
}
newCategory.MapTypeList.push(newMapType)
}
mapsData.MapCategoryList.push(newCategory)
}
}
mapsData.MapProviderList = {};
for (var p in mapsResponse.MapProviderList) {
var provider=mapsResponse.MapProviderList[p];
mapsData.MapProviderList[provider] = {}
}
for (var i=0; i < mapsResponse.ProviderList.length; i++) {
if (mapsResponse.ProviderList[i].DisplayName && mapsData.MapProviderList[mapsResponse.ProviderList[i].DisplayName]) {
var providerData=mapsData.MapProviderList[mapsResponse.ProviderList[i].DisplayName];
providerData.DisplayName = mapsResponse.ProviderList[i].DisplayName;
providerData.LocationCode = mapsResponse.ProviderList[i].LocationCode
}
}
return mapsData
}, _cropInteractiveMapsData: function _cropInteractiveMapsData(bdiResponse, mapsResponseObj) {
var mapsData={};
mapsData = mapsResponseObj;
mapsData.lastUpdatedTime = bdiResponse.lastUpdateTime.getTime();
mapsData.tempunit = mapsResponseObj.tempunit;
return mapsData
}, _cropHistoricalData: function _cropHistoricalData(bdiResponse, hwResponseObj) {
var historicalDataModel={};
var historicalWeatherResponse=hwResponseObj.BdiGeneric_BingResponse_1_0.Responses[0];
historicalDataModel.LastUpdatedTime = bdiResponse.lastUpdateTime.getTime();
historicalDataModel.TempUnit = historicalWeatherResponse.TempUnit;
historicalDataModel.WindUnit = historicalWeatherResponse.WindUnit;
if (historicalWeatherResponse.DataAttributions.DefaultDataProvider !== undefined) {
historicalDataModel.DefaultDataProvider = {};
historicalDataModel.DefaultDataProvider.ProviderName = historicalWeatherResponse.DataAttributions.DefaultDataProvider.ProviderName;
historicalDataModel.DefaultDataProvider.ProviderUrl = historicalWeatherResponse.DataAttributions.DefaultDataProvider.ProviderUrl
}
if (historicalWeatherResponse.DataAttributions.SeaTempProvider !== undefined) {
historicalDataModel.SeaTempProvider = {};
historicalDataModel.SeaTempProvider.ProviderName = historicalWeatherResponse.DataAttributions.SeaTempProvider.ProviderName;
historicalDataModel.SeaTempProvider.ProviderUrl = historicalWeatherResponse.DataAttributions.SeaTempProvider.ProviderUrl
}
if (historicalWeatherResponse.DataAttributions.SunshineHrsProvider !== undefined) {
historicalDataModel.SunshineHrsProvider = {};
historicalDataModel.SunshineHrsProvider.ProviderName = historicalWeatherResponse.DataAttributions.SunshineHrsProvider.ProviderName;
historicalDataModel.SunshineHrsProvider.ProviderUrl = historicalWeatherResponse.DataAttributions.SunshineHrsProvider.ProviderUrl
}
historicalDataModel.MonthlyAggregatedData = [];
var weatherFormatting=WeatherAppJS.Utilities.Formatting;
for (var m in historicalWeatherResponse.MonthlyAggregatedData) {
var monthlyAggregatedData=historicalWeatherResponse.MonthlyAggregatedData[m];
var formattedData=WeatherAppJS.DataManager._formatHistoricData(monthlyAggregatedData);
historicalDataModel.MonthlyAggregatedData.push(formattedData)
}
return historicalDataModel
}, _cropHourlyForecastData: function _cropHourlyForecastData(bdiResponse, hwResponseObj) {
var hfDataModel={};
var hfWeatherResponse=hwResponseObj;
hfDataModel.LastUpdatedTime = null;
if (bdiResponse && bdiResponse.lastUpdateTime) {
hfDataModel.LastUpdatedTime = bdiResponse.lastUpdateTime.getTime()
}
var weatherFormatting=WeatherAppJS.Utilities.Formatting;
hfDataModel.HistoricData = [];
hfDataModel.HourlyData = [];
if (hfWeatherResponse.hourly && hfWeatherResponse.hourly.Days) {
for (var h in hfWeatherResponse.hourly.Days) {
var hourly=hfWeatherResponse.hourly.Days[h].Hrly;
var dayOfYear=weatherFormatting.getDayOfYear(hfWeatherResponse.hourly.Days[h].Tm);
if (hourly) {
var formattedData=WeatherAppJS.DataManager._formatHourlyForecastData(hourly);
hfDataModel.HourlyData[dayOfYear] = formattedData;
if (hfWeatherResponse.historical && hfWeatherResponse.historical.Days) {
var historical=hfWeatherResponse.historical.Days[h];
var formattedHistoricalData=WeatherAppJS.DataManager._formatHistoricDailyData(historical);
hfDataModel.HistoricData[dayOfYear] = formattedHistoricalData
}
}
}
}
return hfDataModel
}, _formatHistoricData: function _formatHistoricData(data) {
var dailyData={};
var weatherFormatting=WeatherAppJS.Utilities.Formatting;
dailyData.AvgTemp = Math.round(data.AvgTemp * 100) / 100;
dailyData.MinTemp = Math.round(data.MinTemp * 100) / 100;
dailyData.MaxTemp = Math.round(data.MaxTemp * 100) / 100;
dailyData.MinRecordedTemp = Math.round(data.MinRecordedTemp * 100) / 100;
dailyData.MaxRecordedTemp = Math.round(data.MaxRecordedTemp * 100) / 100;
dailyData.MinRecordedTempDate = weatherFormatting.getFormattedYearFromKifTime(data.MinRecordedTempDate);
dailyData.MaxRecordedTempDate = weatherFormatting.getFormattedYearFromKifTime(data.MaxRecordedTempDate);
dailyData.Precipitation = (data.Precipitation !== undefined) ? Math.round(data.Precipitation * 100) / 100 : '';
dailyData.RainyDayCount = (data.RainyDayCount !== undefined) ? Math.round(data.RainyDayCount * 100) / 100 : '';
dailyData.SeaTemp = (data.SeaTemp !== undefined) ? Math.round(data.SeaTemp * 100) / 100 : '';
dailyData.SnowyDayCount = (data.SnowyDayCount !== undefined) ? Math.round(data.SnowyDayCount * 100) / 100 : '';
dailyData.AvgSunshineHours = (data.AvgSunshineHours !== undefined) ? Math.round(data.AvgSunshineHours * 100) / 100 : '';
dailyData.SnowDepth = (data.SnowDepth !== undefined) ? Math.round(data.SnowDepth * 100) / 100 : '';
return dailyData
}, _formatHistoricDailyData: function _formatHistoricDailyData(data) {
var dailyData=null;
var weatherFormatting=WeatherAppJS.Utilities.Formatting;
if (data) {
dailyData = {};
dailyData.MinTemp = (data.avglow !== undefined) ? Math.round(data.avglow * 100) / 100 : '';
dailyData.MaxTemp = (data.avghigh !== undefined) ? Math.round(data.avghigh * 100) / 100 : '';
dailyData.MinRecordedTemp = (data.maxlow !== undefined) ? Math.round(data.maxlow * 100) / 100 : '';
dailyData.MaxRecordedTemp = (data.maxhigh !== undefined) ? Math.round(data.maxhigh * 100) / 100 : '';
dailyData.MinRecordedTempDate = data.maxlowdate ? weatherFormatting.getFormattedYearFromKifTime(data.maxlowdate) : '';
dailyData.MaxRecordedTempDate = data.maxhighdate ? weatherFormatting.getFormattedYearFromKifTime(data.maxhighdate) : '';
dailyData.Precipitation = (data.avgpcpn !== undefined) ? Math.round(data.avgpcpn * 100) / 100 : '';
dailyData.MaxPrecipitation = (data.maxpcpn !== undefined) ? Math.round(data.maxpcpn * 100) / 100 : '';
dailyData.MaxRecordedPrecipitationDate = data.maxpcpndate ? weatherFormatting.getFormattedYearFromKifTime(data.maxpcpndate) : '';
dailyData.Snow = (data.avgsnow !== undefined) ? Math.round(data.avgsnow * 100) / 100 : '';
dailyData.MaxSnow = (data.maxsnow !== undefined) ? Math.round(data.maxsnow * 100) / 100 : '';
dailyData.MaxSnowRecordedDate = data.maxsnowdate ? weatherFormatting.getFormattedYearFromKifTime(data.maxsnowdate) : '';
if (data.strings && data.strings.length > 0) {
dailyData.historicalString = '';
var stringData=data.strings[0];
var dataType=stringData.datatype;
var resourceString=PlatformJS.Services.resourceLoader.getString("HistoricalStringFor" + dataType.toUpperCase());
if (resourceString) {
var yearValue=weatherFormatting.formatInt(stringData.yearvalue);
var dataValue=weatherFormatting.formatInt(stringData.datavalue);
dailyData.historicalString = resourceString.format(yearValue, dataValue, yearValue)
}
}
}
return dailyData
}, _formatHourlyForecastData: function _formatHourlyForecastData(hourlyDataList) {
var formattedHourlyList=[];
var weatherFormatting=WeatherAppJS.Utilities.Formatting;
for (var i in hourlyDataList) {
var hourlyItem={};
hourlyItem.Caption = hourlyDataList[i].Cptn;
hourlyItem.IconCode = hourlyDataList[i].Icn;
hourlyItem.Temp = hourlyDataList[i].Temp;
hourlyItem.Time = hourlyDataList[i].Tm;
hourlyItem.PrecipChance = hourlyDataList[i].PrcpChnc;
hourlyItem.FeelsLike = hourlyDataList[i].FlsLke;
var formattedHourlyItem=weatherFormatting.formatHourlyConditions(hourlyItem);
formattedHourlyList.push(formattedHourlyItem)
}
return formattedHourlyList
}, _cropTileData: function _cropTileData(bdiResponse, tileResponseObj) {
var weatherFormatting=WeatherAppJS.Utilities.Formatting;
var noDataString=WeatherAppJS.Utilities.Common.getNoDataString();
var tileData={};
var tileResponse=tileResponseObj.BdiGeneric_BingResponse_1_0.Responses[0];
tileData.LastUpdatedTime = bdiResponse.lastUpdateTime.getTime();
tileData.CurrentWeather = {};
tileData.CurrentConditionProvider = tileResponse.CurrentConditionProvider;
if (tileResponse.CurrentWeather.ProviderCaption) {
tileData.CurrentWeather.Caption = tileResponse.CurrentWeather.ProviderCaption
}
else {
tileData.CurrentWeather.Caption = tileResponse.CurrentWeather.Caption
}
tileData.CurrentWeather.IconCode = tileResponse.CurrentWeather.IconCode;
tileData.CurrentWeather.DayNightIndicator = (tileResponse.CurrentWeather.DayNightIndicator === 'd' || tileResponse.CurrentWeather.DayNightIndicator === 'n') ? tileResponse.CurrentWeather.DayNightIndicator : "";
tileData.CurrentWeather.HasTemp = (tileResponse.CurrentWeather.Temperature !== undefined) ? true : false;
tileData.CurrentWeather.Temperature = (tileData.CurrentWeather.HasTemp) ? weatherFormatting.getTemperatureWithDegreeUnit(tileResponse.CurrentWeather.Temperature) : noDataString;
tileData.CurrentWeather.TemperatureWithoutUnit = (tileData.CurrentWeather.HasTemp) ? weatherFormatting.formatInt(tileResponse.CurrentWeather.Temperature) : noDataString;
tileData.CurrentWeather.HasTempHigh = (tileResponse.TempHigh !== undefined) ? true : false;
tileData.CurrentWeather.TempHigh = (tileData.CurrentWeather.HasTempHigh) ? weatherFormatting.getTemperatureWithDegreeUnit(tileResponse.TempHigh) : noDataString;
tileData.CurrentWeather.TempHighWithoutUnit = (tileData.CurrentWeather.HasTempHigh) ? weatherFormatting.formatInt(tileResponse.TempHigh) : noDataString;
tileData.CurrentWeather.HasTempLow = (tileResponse.TempLow !== undefined) ? true : false;
tileData.CurrentWeather.TempLow = (tileData.CurrentWeather.HasTempLow) ? weatherFormatting.getTemperatureWithDegreeUnit(tileResponse.TempLow) : noDataString;
tileData.CurrentWeather.TempLowWithoutUnit = (tileData.CurrentWeather.HasTempLow) ? weatherFormatting.formatInt(tileResponse.TempLow) : noDataString;
tileData.TempUnit = tileResponse.TempUnit;
tileData.AlertsCount = tileResponse.AlertsCount;
return tileData
}, _cropTianQiData: function _cropTianQiData(bdiResponse, responseObj) {
var weatherFormatting=WeatherAppJS.Utilities.Formatting;
var noDataString=WeatherAppJS.Utilities.Common.getNoDataString();
var themeManager=WeatherAppJS.Utilities.ThemeManager;
var resourceLoader=PlatformJS.Services.resourceLoader;
var tianQiData={};
var tianQiResponse=responseObj.BdiGeneric_BingResponse_1_0.Responses[0];
if (bdiResponse.lastUpdateTime) {
tianQiData.LastUpdatedTime = bdiResponse.lastUpdateTime.getTime()
}
else {
tianQiData.LastUpdatedTime = PlatformJS.BootCache.instance.getEntry("time", function() {
return null
})
}
var currentWeather=tianQiResponse.CurrentWeather || {};
var providerName=tianQiResponse.CurrentConditionProvider ? tianQiResponse.CurrentConditionProvider : '';
var providerUrl=tianQiResponse.CurrentConditionLink ? tianQiResponse.CurrentConditionLink.Url : '';
tianQiData.CurrentWeather = {};
tianQiData.CurrentWeather.HasTemp = (currentWeather.Temperature !== undefined) ? true : false;
tianQiData.CurrentWeather.Temperature = (tianQiData.CurrentWeather.HasTemp) ? weatherFormatting.getTemperatureWithDegreeUnit(currentWeather.Temperature) : noDataString;
tianQiData.CurrentWeather.TemperatureWithoutUnit = (tianQiData.CurrentWeather.HasTemp) ? weatherFormatting.formatInt(currentWeather.Temperature) : noDataString;
tianQiData.CurrentWeather.HasTempHigh = false;
tianQiData.CurrentWeather.HasTempLow = false;
tianQiData.CurrentWeather.Caption = currentWeather.Caption || "";
tianQiData.CurrentWeather.SkyText = currentWeather.Caption || "";
tianQiData.CurrentWeather.IconCode = currentWeather.IconCode;
tianQiData.CurrentWeather.DayNightIndicator = (currentWeather.DayNightIndicator === 'd' || currentWeather.DayNightIndicator === 'n') ? currentWeather.DayNightIndicator : '';
var windSpeed=noDataString,
windDirection;
if (currentWeather.WindSpeed !== undefined) {
windDirection = '';
if (currentWeather.WindDirection !== undefined) {
windDirection = resourceLoader.getString('WindSpeedUnitFor' + currentWeather.WindDirection) || currentWeather.WindDirection;
windDirection = windDirection + ' '
}
windSpeed = windDirection + currentWeather.WindSpeed
}
tianQiData.CurrentWeather.Wind = windSpeed;
var humidity=(currentWeather.Humidity === undefined) ? noDataString : weatherFormatting.getPercentageUnit(currentWeather.Humidity);
tianQiData.CurrentWeather.Humidity = resourceLoader.getString('Humidity') + ' ' + humidity;
var precipitation=(currentWeather.Precipitation === undefined) ? noDataString : resourceLoader.getString('Precipitation') + ' ' + currentWeather.Precipitation;
tianQiData.CurrentWeather.Precipitation = precipitation;
tianQiData.CurrentConditionProvider = providerName;
tianQiData.IsTripPlanAvailable = tianQiResponse.IsTripPlanAvailable;
tianQiData.IsMapsAvailable = tianQiResponse.IsMapsAvailable;
tianQiData.IsDailyDrilldownEnabled = false;
tianQiData.AlertsCount = tianQiResponse.AlertsCount;
tianQiData.DailyForecast = [];
tianQiData.DailyForecast[0] = {};
var dailyConditions=tianQiData.DailyForecast[0].DailyConditions = [];
var forecasts;
if (tianQiResponse.DailyForecast && tianQiResponse.DailyForecast instanceof Array) {
forecasts = tianQiResponse.DailyForecast[0].DailyConditions
}
for (var day in forecasts) {
dailyConditions[day] = {};
var tianQiDay=forecasts[day];
var tmp=weatherFormatting.getFormattedDayName(tianQiDay.Date);
var tmpArr=[];
if (tmp) {
tmpArr = tmp.split("|")
}
if (tmpArr.length === 2) {
dailyConditions[day].Day = tmpArr[0];
dailyConditions[day].DayName = tmpArr[1]
}
else {
dailyConditions[day].Day = '';
dailyConditions[day].DayName = ''
}
dailyConditions[day].TempHigh = (tianQiDay.TempHigh !== undefined) ? weatherFormatting.getTemperatureWithDegreeUnit(tianQiDay.TempHigh) : noDataString;
dailyConditions[day].TempLow = (tianQiDay.TempLow !== undefined) ? weatherFormatting.getTemperatureWithDegreeUnit(tianQiDay.TempLow) : noDataString;
windSpeed = noDataString;
if (tianQiDay.WindSpeed !== undefined) {
windDirection = '';
if (tianQiDay.WindDirection !== undefined) {
windDirection = resourceLoader.getString('WindSpeedUnitFor' + tianQiDay.WindDirection) || tianQiDay.WindDirection;
windDirection = windDirection + ' '
}
windSpeed = windDirection + tianQiDay.WindSpeed
}
dailyConditions[day].IconCode = tianQiDay.IconCode;
dailyConditions[day].WindSpeed = windSpeed;
dailyConditions[day].KifTime = tianQiDay.Date;
dailyConditions[day].Date = weatherFormatting.getFormattedDailyTimeShort(tianQiDay.Date);
dailyConditions[day].SkyText = tianQiDay.Caption || '';
dailyConditions[day].Precipitation = ''
}
tianQiData.DailyForecast[0].Provider = providerName;
tianQiData.DailyForecast[0].ProviderUrl = providerUrl;
tianQiData.HourlyListPerProvider = [];
if (tianQiResponse.HourlyListPerProvider && tianQiResponse.HourlyListPerProvider instanceof Array) {
var hourlyResponse=tianQiResponse.HourlyListPerProvider[0];
var hourlyData={};
hourlyData.ProviderName = providerName;
hourlyData.HourlyTimeInterval = hourlyResponse.HourlyDataInterval;
hourlyData.HourlyConditionList = [];
for (var c in hourlyResponse.HourlyConditionList) {
var hc=hourlyResponse.HourlyConditionList[c];
var formattedHC={};
formattedHC.time = weatherFormatting.getFormattedHourlyTime(hc.Time);
formattedHC.kifTime = hc.Time;
formattedHC.caption = hc.ProviderCaption ? hc.ProviderCaption : hc.Caption;
formattedHC.tempHigh = (hc.TempHigh !== undefined && hc.TempHigh !== null) ? weatherFormatting.getTemperatureWithDegreeUnit(hc.TempHigh) : noDataString;
formattedHC.tempLow = (hc.TempLow !== undefined && hc.TempLow !== null) ? weatherFormatting.getTemperatureWithDegreeUnit(hc.TempLow) : noDataString;
var safeIconCode=hc.IconCode;
formattedHC.skycode = "/images/skycodes/48x48/" + safeIconCode + '.png';
windSpeed = noDataString;
if (hc.WindSpeed !== undefined) {
windDirection = '';
if (hc.WindDirection !== undefined) {
windDirection = resourceLoader.getString('WindSpeedUnitFor' + hc.WindDirection) || hc.WindDirection;
windDirection = windDirection + ' '
}
windSpeed = windDirection + hc.WindSpeed
}
formattedHC.wind = windSpeed;
hourlyData.HourlyConditionList.push(formattedHC)
}
tianQiData.HourlyListPerProvider.push(hourlyData)
}
return tianQiData
}, _cropTianQiTileData: function _cropTianQiTileData(bdiResponse, responseObj) {
var weatherFormatting=WeatherAppJS.Utilities.Formatting;
var noDataString=WeatherAppJS.Utilities.Common.getNoDataString();
var tianQiData={};
var tianQiResponse=responseObj.BdiGeneric_BingResponse_1_0.Responses[0];
tianQiData.LastUpdatedTime = bdiResponse.lastUpdateTime.getTime();
tianQiData.CurrentWeather = {};
tianQiData.CurrentConditionProvider = tianQiResponse.CurrentConditionProvider;
tianQiData.CurrentWeather.Caption = tianQiResponse.CurrentWeather.ProviderCaption || '';
tianQiData.CurrentWeather.SkyText = tianQiData.CurrentWeather.Caption;
tianQiData.CurrentWeather.IconCode = tianQiResponse.CurrentWeather.IconCode;
tianQiData.CurrentWeather.DayNightIndicator = (tianQiResponse.CurrentWeather.DayNightIndicator === 'd' || tianQiResponse.CurrentWeather.DayNightIndicator === 'n') ? tianQiResponse.CurrentWeather.DayNightIndicator : "";
tianQiData.CurrentWeather.HasTemp = (tianQiResponse.CurrentWeather.Temperature !== undefined) ? true : false;
tianQiData.CurrentWeather.Temperature = (tianQiData.CurrentWeather.HasTemp) ? weatherFormatting.getTemperatureWithDegreeUnit(tianQiResponse.CurrentWeather.Temperature) : noDataString;
tianQiData.CurrentWeather.TemperatureWithoutUnit = (tianQiResponse.CurrentWeather.HasTemp) ? weatherFormatting.formatInt(tianQiResponse.CurrentWeather.Temperature) : noDataString;
tianQiData.CurrentWeather.HasTempHigh = (tianQiResponse.TempHigh !== undefined) ? true : false;
tianQiData.CurrentWeather.TempHigh = (tianQiData.CurrentWeather.HasTempHigh) ? weatherFormatting.getTemperatureWithDegreeUnit(tianQiResponse.TempHigh) : noDataString;
tianQiData.CurrentWeather.TempHighWithoutUnit = (tianQiData.CurrentWeather.HasTempHigh) ? weatherFormatting.formatInt(tianQiResponse.TempHigh) : noDataString;
tianQiData.CurrentWeather.HasTempLow = (tianQiResponse.TempLow !== undefined) ? true : false;
tianQiData.CurrentWeather.TempLow = (tianQiData.CurrentWeather.HasTempLow) ? weatherFormatting.getTemperatureWithDegreeUnit(tianQiResponse.TempLow) : noDataString;
tianQiData.CurrentWeather.TempLowWithoutUnit = (tianQiData.CurrentWeather.HasTempLow) ? weatherFormatting.formatInt(tianQiResponse.TempLow) : noDataString;
tianQiData.TempUnit = tianQiResponse.TempUnit;
return tianQiData
}, _dropCCAndForecastCacheByName: function _dropCCAndForecastCacheByName(appserverhost, appId, locId, unit, mkt, region) {
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("appserverhost", appserverhost);
urlParams.insert("appid", appId);
urlParams.insert("locationName", locId);
urlParams.insert("unit", unit);
urlParams.insert("mkt", mkt);
urlParams.insert("region", region);
var qsCCForLocation=new PlatformJS.DataService.QueryService("CurrentConditionsAndForecastForLocation");
var url=qsCCForLocation.getUrl(urlParams);
qsCCForLocation.deleteCacheEntryAsync(urlParams, null).then(null, function(){})
}, _dropCCAndForecastCacheByLatLong: function _dropCCAndForecastCacheByLatLong(appserverhost, appId, locID, unit, mkt, region) {
var trimLatLong=WeatherAppJS.Utilities.Common.trimLatLong;
var locationObj=WeatherAppJS.GeocodeCache.getLocation(locID);
var locationName=locationObj.getFullName();
var latitude=locationObj.latitude;
var longitude=locationObj.longitude;
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("appserverhost", appserverhost);
urlParams.insert("appid", appId);
urlParams.insert("locationName", locationName);
urlParams.insert("latitude", trimLatLong(latitude));
urlParams.insert("longitude", trimLatLong(longitude));
urlParams.insert("unit", unit);
urlParams.insert("mkt", mkt);
urlParams.insert("region", region);
var qsCCByLatLong=new PlatformJS.DataService.QueryService("CurrentConditionsAndForecastByLatLong");
var url=qsCCByLatLong.getUrl(urlParams);
qsCCByLatLong.deleteCacheEntryAsync(urlParams, null).then(null, function(){})
}, _dropImageDataCacheByLatLong: function _dropImageDataCacheByLatLong(appserverhost, appId, locID, unit, mkt, region) {
var middleTierHost=PlatformJS.Services.appConfig.getString("MiddleTierHostImageData");
var locationObj=WeatherAppJS.GeocodeCache.getLocation(locID);
var urlParams=PlatformJS.Collections.createStringDictionary();
var imageUriByLatLong=WeatherAppJS.WarmBoot.Cache.getBool("FetchImageUriByLatLong");
if (imageUriByLatLong) {
var trimLatLong=WeatherAppJS.Utilities.Common.trimLatLong;
var latitude=locationObj.latitude;
var longitude=locationObj.longitude;
var latlongTrimVal=WeatherAppJS.WarmBoot.Cache.getInt32("LatLongDecimalPlacesForImageServices");
urlParams.insert("latitude", trimLatLong(latitude, latlongTrimVal));
urlParams.insert("longitude", trimLatLong(longitude, latlongTrimVal))
}
else {
urlParams.insert("latitude", 0);
urlParams.insert("longitude", 0)
}
urlParams.insert("middletierhostimagedata", middleTierHost);
urlParams.insert("client", 'big');
var imgDataByLatLong=new PlatformJS.DataService.QueryService("ImageDataForLatLong");
var url=imgDataByLatLong.getUrl(urlParams);
imgDataByLatLong.deleteCacheEntryAsync(urlParams, null).then(null, function(){})
}, _dropAlertsCacheByName: function _dropAlertsCacheByName(appserverhost, appId, locId, unit, mkt, region) {
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("appserverhost", appserverhost);
urlParams.insert("appid", appId);
urlParams.insert("locationName", locId);
urlParams.insert("unit", unit);
urlParams.insert("mkt", mkt);
urlParams.insert("region", region);
var qsAlertsForLocation=new PlatformJS.DataService.QueryService("AlertsForLocation");
var url=qsAlertsForLocation.getUrl(urlParams);
qsAlertsForLocation.deleteCacheEntryAsync(urlParams, null).then(null, function(){})
}, _dropAlertsCacheByLatLong: function _dropAlertsCacheByLatLong(appserverhost, appId, locID, unit, mkt, region) {
var trimLatLong=WeatherAppJS.Utilities.Common.trimLatLong;
var locationObj=WeatherAppJS.GeocodeCache.getLocation(locID);
var latitude=locationObj.latitude;
var longitude=locationObj.longitude;
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("appserverhost", appserverhost);
urlParams.insert("appid", appId);
urlParams.insert("latitude", trimLatLong(latitude));
urlParams.insert("longitude", trimLatLong(longitude));
urlParams.insert("unit", unit);
urlParams.insert("mkt", mkt);
urlParams.insert("region", region);
var qsAlertsByLatLong=new PlatformJS.DataService.QueryService("AlertsByLatLong");
var url=qsAlertsByLatLong.getUrl(urlParams);
qsAlertsByLatLong.deleteCacheEntryAsync(urlParams, null).then(null, function(){})
}, _dropMapsCacheByName: function _dropMapsCacheByName(appserverhost, appId, locId, unit, mkt, region) {
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("appserverhost", appserverhost);
urlParams.insert("appid", appId);
urlParams.insert("locationName", locId);
urlParams.insert("unit", unit);
urlParams.insert("mkt", mkt);
urlParams.insert("region", region);
var qsMapsForLocation=new PlatformJS.DataService.QueryService("WeatherMapsForLocation");
var url=qsMapsForLocation.getUrl(urlParams);
qsMapsForLocation.deleteCacheEntryAsync(urlParams, null).then(null, function(){})
}, _dropTianQiMapsCache: function _dropTianQiMapsCache(appserverhost, appId, locID, unit, mkt, region) {
var trimLatLong=WeatherAppJS.Utilities.Common.trimLatLong;
var locationObj=WeatherAppJS.GeocodeCache.getLocation(locID);
var latitude=locationObj.latitude;
var longitude=locationObj.longitude;
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("locationName", WeatherAppJS.Utilities.TianQi.getEncodedLocationNameForQuery(locationObj.getFullName()));
urlParams.insert("latitude", trimLatLong(latitude));
urlParams.insert("longitude", trimLatLong(longitude));
var qsMapsByLatLong=new PlatformJS.DataService.QueryService("TianQiWeatherMapsByLatLong");
var url=qsMapsByLatLong.getUrl(urlParams);
qsMapsByLatLong.deleteCacheEntryAsync(urlParams, null).then(null, function(){})
}, _dropMapsCacheByLatLong: function _dropMapsCacheByLatLong(appserverhost, appId, locID, unit, mkt, region) {
var trimLatLong=WeatherAppJS.Utilities.Common.trimLatLong;
var locationObj=WeatherAppJS.GeocodeCache.getLocation(locID);
var latitude=locationObj.latitude;
var longitude=locationObj.longitude;
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("appserverhost", appserverhost);
urlParams.insert("appid", appId);
urlParams.insert("latitude", trimLatLong(latitude));
urlParams.insert("longitude", trimLatLong(longitude));
urlParams.insert("unit", unit);
urlParams.insert("mkt", mkt);
urlParams.insert("region", region);
var qsMapsByLatLong=new PlatformJS.DataService.QueryService("WeatherMapsByLatLong");
var url=qsMapsByLatLong.getUrl(urlParams);
qsMapsByLatLong.deleteCacheEntryAsync(urlParams, null).then(null, function(){})
}, _dropHWCacheByName: function _dropHWCacheByName(appserverhost, appId, locId, unit, mkt, region) {
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("appserverhost", appserverhost);
urlParams.insert("appid", appId);
urlParams.insert("locationName", locId);
urlParams.insert("unit", unit);
urlParams.insert("mkt", mkt);
urlParams.insert("region", region);
var qsHWForLocation=new PlatformJS.DataService.QueryService("HistoricalWeatherForLocation");
var url=qsHWForLocation.getUrl(urlParams);
qsHWForLocation.deleteCacheEntryAsync(urlParams, null).then(null, function(){})
}, _dropHWCacheByLatLong: function _dropHWCacheByLatLong(appserverhost, appId, locID, unit, mkt, region) {
var trimLatLong=WeatherAppJS.Utilities.Common.trimLatLong;
var locationObj=WeatherAppJS.GeocodeCache.getLocation(locID);
var latitude=locationObj.latitude;
var longitude=locationObj.longitude;
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("appserverhost", appserverhost);
urlParams.insert("appid", appId);
urlParams.insert("latitude", trimLatLong(latitude));
urlParams.insert("longitude", trimLatLong(longitude));
urlParams.insert("unit", unit);
urlParams.insert("mkt", mkt);
urlParams.insert("region", region);
var qsHWByLatLong=new PlatformJS.DataService.QueryService("HistoricalWeatherByLatLong");
var url=qsHWByLatLong.getUrl(urlParams);
qsHWByLatLong.deleteCacheEntryAsync(urlParams, null).then(null, function(){})
}, _dropHourlyForecastCacheByLatLong: function _dropHourlyForecastCacheByLatLong(appserverhost, appId, locID, unit, mkt, region) {
var trimLatLong=WeatherAppJS.Utilities.Common.trimLatLong;
var locationObj=WeatherAppJS.GeocodeCache.getLocation(locID);
var latitude=locationObj.latitude;
var longitude=locationObj.longitude;
var middletierhost=PlatformJS.Services.appConfig.getString("MiddleTierHost");
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("appserverhost", appserverhost);
urlParams.insert("middletierhost", middletierhost);
urlParams.insert("appid", appId);
urlParams.insert("latitude", trimLatLong(latitude));
urlParams.insert("longitude", trimLatLong(longitude));
urlParams.insert("unit", unit);
urlParams.insert("mkt", mkt);
urlParams.insert("region", region);
var queryServiceId="HourlyForecastWeatherByLatLong";
if (locationObj.isSkiLocation) {
queryServiceId = "HourlyForecastWeatherByLatLongSkiResorts";
urlParams.insert("resortid", locationObj.getId())
}
var qs=new PlatformJS.DataService.QueryService(queryServiceId);
var url=qs.getUrl(urlParams);
qs.deleteCacheEntryAsync(urlParams, null).then(null, function(){})
}, _dropTileCacheByName: function _dropTileCacheByName(appserverhost, appId, locId, unit, mkt, region) {
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("appserverhost", appserverhost);
urlParams.insert("appid", appId);
urlParams.insert("locationName", locId);
urlParams.insert("unit", unit);
urlParams.insert("mkt", mkt);
urlParams.insert("region", region);
var qsTileForLocation=new PlatformJS.DataService.QueryService("TileForLocation");
var url=qsTileForLocation.getUrl(urlParams);
qsTileForLocation.deleteCacheEntryAsync(urlParams, null).then(null, function(){})
}, _dropTileCacheByLatLong: function _dropTileCacheByLatLong(appserverhost, appId, locID, unit, mkt, region) {
var trimLatLong=WeatherAppJS.Utilities.Common.trimLatLong;
var locationObj=WeatherAppJS.GeocodeCache.getLocation(locID);
var latitude=locationObj.latitude;
var longitude=locationObj.longitude;
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("appserverhost", appserverhost);
urlParams.insert("appid", appId);
urlParams.insert("latitude", trimLatLong(latitude));
urlParams.insert("longitude", trimLatLong(longitude));
urlParams.insert("unit", unit);
urlParams.insert("mkt", mkt);
urlParams.insert("region", region);
var qsTileByLatLong=new PlatformJS.DataService.QueryService("TileByLatLong");
var url=qsTileByLatLong.getUrl(urlParams);
qsTileByLatLong.deleteCacheEntryAsync(urlParams, null).then(null, function(){})
}, _dropTianQiCacheByName: function _dropTianQiCacheByName(appserverhost, appId, locId, unit, mkt, region) {
var loc=WeatherAppJS.GeocodeCache.getLocation(locId);
var trimLatLong=WeatherAppJS.Utilities.Common.trimLatLong;
var middletierhost=PlatformJS.Services.appConfig.getString("MiddleTierHost");
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("middletierhost", middletierhost);
urlParams.insert("appid", appId);
urlParams.insert("locationName", WeatherAppJS.Utilities.TianQi.getEncodedLocationNameForQuery(loc.getFullName()));
urlParams.insert("latitude", trimLatLong(loc.latitude));
urlParams.insert("longitude", trimLatLong(loc.longitude));
var qsTianQiForLocation=new PlatformJS.DataService.QueryService("TianQiWeatherByLocation");
var url=qsTianQiForLocation.getUrl(urlParams);
qsTianQiForLocation.deleteCacheEntryAsync(urlParams, null).then(null, function(){})
}, _dropTianQiTileCacheByLatLong: function _dropTianQiTileCacheByLatLong(appserverhost, appId, locId, unit, mkt, region) {
var trimLatLong=WeatherAppJS.Utilities.Common.trimLatLong;
appserverhost = PlatformJS.Services.appConfig.getString("MiddleTierHost");
var locationObj=WeatherAppJS.GeocodeCache.getLocation(locId);
var latitude=locationObj.latitude;
var longitude=locationObj.longitude;
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("middletierhost", appserverhost);
urlParams.insert("city", locationObj.city);
urlParams.insert("latitude", trimLatLong(latitude));
urlParams.insert("longitude", trimLatLong(longitude));
var qsTianQiForLocation=new PlatformJS.DataService.QueryService("TianQiTileWeatherByLatLong");
var url=qsTianQiForLocation.getUrl(urlParams);
qsTianQiForLocation.deleteCacheEntryAsync(urlParams, null).then(null, function(){})
}, _dropWorldWeatherCache: function _dropWorldWeatherCache(continent, unit) {
var middleTierHost=PlatformJS.Services.appConfig.getString("MiddleTierHost");
var appServerHost=PlatformJS.Services.appConfig.getString("AppServerHost");
var mkt=PlatformJS.Services.appConfig.getString("MiddleTierMarket");
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("middletierhost", middleTierHost);
urlParams.insert("continent", continent);
urlParams.insert("unit", unit);
urlParams.insert("mkt", mkt);
var qsWorldWeatherForContinent=new PlatformJS.DataService.QueryService("WorldWeatherForContinent");
var url=qsWorldWeatherForContinent.getUrl(urlParams);
qsWorldWeatherForContinent.deleteCacheEntryAsync(urlParams, null).then(null, function(){})
}, _getCurrentWeather: function _getCurrentWeather(ccResponse, provider) {
if (provider === ccResponse.CurrentConditionProvider) {
return ccResponse.CurrentWeather
}
for (var currentWeatherPerProvider in ccResponse.CurrentConditionListPerProvider) {
if (provider === ccResponse.CurrentConditionListPerProvider[currentWeatherPerProvider].ProviderName) {
return ccResponse.CurrentConditionListPerProvider[currentWeatherPerProvider].CurrentCondition
}
}
return null
}, _getPrioritizedProvidersByDailyForecast: function _getPrioritizedProvidersByDailyForecast(ccResponse) {
var providerToForecastedDaysMap=[];
if (ccResponse.DailyForecast) {
PlatformJS.BootCache.instance.addOrUpdateEntry("ccResponse.DailyForecast", ccResponse.DailyForecast)
}
else {
ccResponse.DailyForecast = PlatformJS.BootCache.instance.getEntry("ccResponse.DailyForecast", function() {
return null
})
}
for (var i=0, len=ccResponse.DailyForecast.length; i < len; i++) {
var tmpObj={
provider: '', count: 0
};
tmpObj.provider = ccResponse.DailyForecast[i].Provider;
tmpObj.count = ccResponse.DailyForecast[i].DailyConditions.length;
providerToForecastedDaysMap[i] = tmpObj
}
if (WeatherAppJS.WarmBoot.Cache.getBool("EnableProviderSorting")) {
providerToForecastedDaysMap.sort(function(left, right) {
return parseInt(right.count) - parseInt(left.count)
})
}
var prioritizedProviders=[];
var first=true;
var getCurrentWeather=WeatherAppJS.DataManager._getCurrentWeather;
for (var index=0; index < providerToForecastedDaysMap.length; index++) {
if (first) {
var currentWeather=getCurrentWeather(ccResponse, providerToForecastedDaysMap[index].provider);
if (currentWeather) {
first = false;
prioritizedProviders.unshift(providerToForecastedDaysMap[index].provider);
continue
}
}
prioritizedProviders[index] = providerToForecastedDaysMap[index].provider
}
return prioritizedProviders
}, _getDailyForecast: function _getDailyForecast(ccResponse, provider) {
for (var dailyForecastPerProvider in ccResponse.DailyForecast) {
if (provider === ccResponse.DailyForecast[dailyForecastPerProvider].Provider) {
return ccResponse.DailyForecast[dailyForecastPerProvider]
}
}
return null
}
})
})();
(function() {
WinJS.Namespace.define("WeatherAppJS.LocationsManager", {
_locations: {}, _default: WeatherAppJS.SettingsManager.getDefaultLocationId(), _isMarketBlockedByIP: false, _pageRefreshCallback: null, getDefaultLocation: function getDefaultLocation() {
return this._default
}, addLocation: function addLocation(loc) {
if (!this._locations[loc.id]) {
this._locations[loc.id] = loc
}
else {
this.updateLocationData(loc)
}
}, updateLocationData: function updateLocationData(loc) {
if (this._locations[loc.id]) {
this._locations[loc.id] = loc
}
}, getLocation: function getLocation(locID) {
return this._locations ? this._locations[locID] : null
}, isMarketBlockedByIP: {
get: function get() {
return this._isMarketBlockedByIP
}, set: function set(value) {
this._isMarketBlockedByIP = value
}
}, setLocationAsDefault: function setLocationAsDefault(event) {
if (event && event.detail) {
WeatherAppJS.LocationsManager._default = event.detail.getId()
}
}, init: function init() {
WeatherAppJS.SettingsManager.addEventListener('defaultlocationupdated', WeatherAppJS.LocationsManager.setLocationAsDefault, false)
}, tryFetchingCCDataAsync: function tryFetchingCCDataAsync(locationObject, bypassCache) {
if (locationObject && locationObject.fullName) {
return new WinJS.Promise(function(complete, error) {
var fetchSuccess=(function() {
return function(ccResponse) {
var responseAvailable=false;
var ccResponseObj=null;
try {
ccResponseObj = JSON.parse(ccResponse.dataString)
}
catch(err) {}
if (ccResponseObj && ccResponseObj.BdiGeneric_BingResponse_1_0 && ccResponseObj.BdiGeneric_BingResponse_1_0.Responses && ccResponseObj.BdiGeneric_BingResponse_1_0.Responses.length > 0) {
responseAvailable = true
}
if (responseAvailable) {
complete({locationObject: locationObject})
}
else {
error({locationObject: locationObject})
}
}
})();
var fetchError=(function() {
return function(e) {
if (PlatformJS.Utilities.isPromiseCanceled(e)) {
return
}
error({
locationObject: locationObject, e: e
})
}
})();
var appConfig=PlatformJS.Services.appConfig;
var appserverhost=appConfig.getString("AppServerHost");
var appId=appConfig.getString("AppID");
var mkt=appConfig.getString("AppServerMarket");
var region=appConfig.getString("AppServerRegion");
WeatherAppJS.GeocodeCache.addLocation(locationObject);
var useTianQi=Platform.Utilities.Globalization.isFeatureEnabled("UseTianQi");
if (useTianQi && locationObject.isTianQiSupportedLocation()) {
WeatherAppJS.DataManager.fetchTianQiData(appserverhost, appId, locationObject.getId(), WeatherAppJS.SettingsManager.getDisplayUnit(), mkt, region, bypassCache).then(fetchSuccess, fetchError)
}
else if (locationObject.isfetchByName()) {
WeatherAppJS.DataManager.fetchCCAndForecastData(appserverhost, appId, locationObject.fullName, WeatherAppJS.SettingsManager.getDisplayUnit(), mkt, region, bypassCache).then(fetchSuccess, fetchError)
}
else {
WeatherAppJS.DataManager.fetchCCAndForecastDataByLatLong(appserverhost, appId, locationObject.getId(), WeatherAppJS.SettingsManager.getDisplayUnit(), mkt, region, bypassCache).then(fetchSuccess, fetchError)
}
})
}
}, getCCDataForLocationAsync: function getCCDataForLocationAsync(locId, bypassCache, isFre) {
var displayUnit=WeatherAppJS.SettingsManager.getDisplayUnit();
var innerPromise;
var locationObj=WeatherAppJS.LocationsManager.getLocation(locId);
if ((!locationObj) || (!locationObj._currentConditions) || (!locationObj._dailyConditions) || (!locationObj._hourlyConditions) || (locationObj._currentConditions.tempunit !== displayUnit) || (WeatherAppJS.Utilities.Common.isStale(locationObj._currentConditions.lastUpdatedTime, WeatherAppJS.WarmBoot.Cache.getString("TimeBeforeStale"))) || (locationObj._fForceUpdateCC) || (bypassCache)) {
return new WinJS.Promise(function(complete, error, progress) {
if (isFre) {
innerPromise = WeatherAppJS.Utilities.FRE.getOverviewData()
}
else {
innerPromise = WinJS.Promise.wrap(WeatherAppJS.DataManager.getCCDataForLocationAsync(locId, displayUnit, bypassCache))
}
innerPromise.then(function() {
complete(WeatherAppJS.LocationsManager.getLocation(locId))
}, function(e) {
if (PlatformJS.Utilities.isPromiseCanceled(e)) {
return
}
error(e)
}, function(p) {
progress(WeatherAppJS.LocationsManager.getLocation(p))
})
}, function() {
if (innerPromise && innerPromise.cancel) {
innerPromise.cancel()
}
})
}
else {
return new WinJS.Promise(function(complete, error) {
complete(WeatherAppJS.LocationsManager.getLocation(locId))
})
}
}, getImageServicesDataForLocationAsync: function getImageServicesDataForLocationAsync(locId, bypassCache, isFre) {
var innerPromise;
var locationObj=WeatherAppJS.LocationsManager.getLocation(locId);
if ((!locationObj) || (!locationObj._imageAndThemeData) || (WeatherAppJS.Utilities.Common.isStale(locationObj._imageAndThemeData.lastUpdatedTime, WeatherAppJS.WarmBoot.Cache.getString("TimeBeforeStaleImageService")))) {
return new WinJS.Promise(function(complete, error, progress) {
innerPromise = WinJS.Promise.wrap(WeatherAppJS.DataManager.getImageServicesDataForLocationAsync(locId, bypassCache));
innerPromise.then(function() {
complete(WeatherAppJS.LocationsManager.getLocation(locId))
}, function(e) {
if (PlatformJS.Utilities.isPromiseCanceled(e)) {
return
}
complete(WeatherAppJS.LocationsManager.getLocation(locId));
error(e)
}, function(p) {
progress(WeatherAppJS.LocationsManager.getLocation(p))
})
}, function() {
if (innerPromise && innerPromise.cancel) {
innerPromise.cancel()
}
})
}
else {
return new WinJS.Promise(function(complete, error) {
complete(WeatherAppJS.LocationsManager.getLocation(locId))
})
}
}, getAlertsDataForLocationAsync: function getAlertsDataForLocationAsync(locId, bypassCache) {
var innerPromise;
var locationObj=WeatherAppJS.LocationsManager.getLocation(locId);
if ((!locationObj) || (!locationObj._alerts) || (WeatherAppJS.Utilities.Common.isStale(locationObj._alerts.lastUpdatedTime, WeatherAppJS.WarmBoot.Cache.getString("TimeBeforeStale"))) || (locationObj._fForceUpdateAlerts)) {
return new WinJS.Promise(function(complete, error, progress) {
innerPromise = WeatherAppJS.DataManager.getAlertsDataForLocationAsync(locId, WeatherAppJS.SettingsManager.getDisplayUnit(), bypassCache);
innerPromise.then(function() {
complete(WeatherAppJS.LocationsManager.getLocation(locId))
}, function(e) {
if (PlatformJS.Utilities.isPromiseCanceled(e)) {
return
}
error(e)
}, function(p) {
progress(WeatherAppJS.LocationsManager.getLocation(p))
})
}, function() {
if (innerPromise && innerPromise.cancel) {
innerPromise.cancel()
}
})
}
else {
return new WinJS.Promise(function(complete, error) {
complete(WeatherAppJS.LocationsManager.getLocation(locId))
})
}
}, getMapsDataForLocationAsync: function getMapsDataForLocationAsync(locId, bypassCache, isFre, isTianQi) {
var displayUnit=WeatherAppJS.SettingsManager.getDisplayUnit();
var innerPromise;
var locationObj=WeatherAppJS.LocationsManager.getLocation(locId);
if ((!locationObj) || (!locationObj._maps) || (locationObj._maps.tempunit !== displayUnit) || (WeatherAppJS.Utilities.Common.isStale(locationObj._maps.lastUpdatedTime, PlatformJS.Services.appConfig.getString("TimeBeforeStale"))) || (bypassCache)) {
return new WinJS.Promise(function(complete, error, progress) {
if (isFre) {
innerPromise = WeatherAppJS.Utilities.FRE.getMapsData()
}
else {
if (isTianQi) {
innerPromise = WinJS.Promise.wrap(WeatherAppJS.DataManager.getTianQiMapsDataAsync(locId, displayUnit, bypassCache))
}
else {
innerPromise = WinJS.Promise.wrap(WeatherAppJS.DataManager.getMapsDataForLocationAsync(locId, displayUnit, bypassCache))
}
}
innerPromise.then(function() {
complete(WeatherAppJS.LocationsManager.getLocation(locId))
}, function(e) {
if (PlatformJS.Utilities.isPromiseCanceled(e)) {
return
}
error(e)
}, function(p) {
progress(WeatherAppJS.LocationsManager.getLocation(p))
})
}, function() {
if (innerPromise && innerPromise.cancel) {
innerPromise.cancel()
}
})
}
else {
return new WinJS.Promise(function(complete, error) {
complete(WeatherAppJS.LocationsManager.getLocation(locId))
})
}
}, getInteractiveMapsClusterDataForLocationAsync: function getInteractiveMapsClusterDataForLocationAsync(locId, isoCode, bypassCache, isFre) {
var innerPromise;
var displayUnit=WeatherAppJS.SettingsManager.getDisplayUnit();
var locationObj=WeatherAppJS.LocationsManager.getLocation(locId);
if ((!locationObj) || (!locationObj._iMaps) || (locationObj._iMaps.tempunit !== displayUnit) || (WeatherAppJS.Utilities.Common.isStale(locationObj._iMaps.lastUpdatedTime, PlatformJS.Services.appConfig.getString("TimeBeforeStale"))) || (bypassCache)) {
return new WinJS.Promise(function(complete, error, progress) {
if (isFre) {
innerPromise = WeatherAppJS.Utilities.FRE.getInteractiveMapsClusterData()
}
else {
innerPromise = WeatherAppJS.DataManager.getInteractiveMapsClusterDataForLocationAsync(locId, isoCode, bypassCache)
}
innerPromise.then(function() {
complete(WeatherAppJS.LocationsManager.getLocation(locId))
}, function(e) {
if (PlatformJS.Utilities.isPromiseCanceled(e)) {
return
}
error(e)
}, function(p) {
progress(WeatherAppJS.LocationsManager.getLocation(p))
})
}, function() {
if (innerPromise && innerPromise.cancel) {
innerPromise.cancel()
}
})
}
else {
return new WinJS.Promise(function(complete, error) {
complete(WeatherAppJS.LocationsManager.getLocation(locId))
})
}
}, getHWDataForLocationAsync: function getHWDataForLocationAsync(locId, bypassCache, isFre) {
var displayUnit=WeatherAppJS.SettingsManager.getDisplayUnit();
var innerPromise;
var locationObj=WeatherAppJS.LocationsManager.getLocation(locId);
if ((!locationObj) || (!locationObj._historicalWeather) || (locationObj._historicalWeather.tempUnit !== displayUnit) || (WeatherAppJS.Utilities.Common.isStale(locationObj._historicalWeather.lastUpdatedTime, PlatformJS.Services.appConfig.getString("TimeBeforeStaleHW"))) || (bypassCache)) {
return new WinJS.Promise(function(complete, error, progress) {
if (isFre) {
innerPromise = WeatherAppJS.Utilities.FRE.getHistoricalWeatherData()
}
else {
innerPromise = WeatherAppJS.DataManager.getHWDataForLocationAsync(locId, displayUnit, bypassCache)
}
innerPromise.then(function() {
complete(WeatherAppJS.LocationsManager.getLocation(locId))
}, function(e) {
if (PlatformJS.Utilities.isPromiseCanceled(e)) {
return
}
error()
}, function(p) {
progress(WeatherAppJS.LocationsManager.getLocation(p))
})
}, function() {
if (innerPromise && innerPromise.cancel) {
innerPromise.cancel()
}
})
}
else {
return new WinJS.Promise(function(complete, error) {
complete(WeatherAppJS.LocationsManager.getLocation(locId))
})
}
}, getHourlyForecastDataForLocationAsync: function getHourlyForecastDataForLocationAsync(locId, bypassCache) {
var innerPromise;
return new WinJS.Promise(function(complete, error, progress) {
innerPromise = WeatherAppJS.DataManager.getHourlyForecastDataForLocationAsync(locId, WeatherAppJS.SettingsManager.getDisplayUnit(), bypassCache);
innerPromise.then(function(data) {
complete(data)
}, function(e) {
if (PlatformJS.Utilities.isPromiseCanceled(e)) {
return
}
error(e)
})
}, function() {
if (innerPromise && innerPromise.cancel) {
innerPromise.cancel()
}
})
}, getTileDataForLocationAsync: function getTileDataForLocationAsync(locId, bypassCache) {
var displayUnit=WeatherAppJS.SettingsManager.getDisplayUnit();
var innerTilePromise;
var innerCCPromise;
var locationObj=WeatherAppJS.LocationsManager.getLocation(locId);
if ((!locationObj) || (!locationObj._currentConditions) || (locationObj._currentConditions.tempunit !== displayUnit) || (WeatherAppJS.Utilities.Common.isStale(locationObj._currentConditions.lastUpdatedTime, PlatformJS.Services.appConfig.getString("TimeBeforeStale"))) || (bypassCache)) {
return new WinJS.Promise(function(complete, error, progress) {
var locObj=WeatherAppJS.LocationsManager.getLocation(locId);
if (locObj && locObj._currentConditions && (locObj._currentConditions.tempunit === displayUnit)) {
msSetImmediate(function() {
progress(locObj)
})
}
innerTilePromise = WeatherAppJS.DataManager.getTileDataForLocationAsync(locId, displayUnit, bypassCache);
innerTilePromise.then(function() {
complete(WeatherAppJS.LocationsManager.getLocation(locId))
}, function(e) {
if (PlatformJS.Utilities.isPromiseCanceled(e)) {
return
}
innerCCPromise = WeatherAppJS.DataManager.getCCDataForLocationAsync(locId, displayUnit, bypassCache);
innerCCPromise.then(function() {
complete(WeatherAppJS.LocationsManager.getLocation(locId))
}, function(e) {
if (PlatformJS.Utilities.isPromiseCanceled(e)) {
return
}
error(e)
}, function(p) {
progress(WeatherAppJS.LocationsManager.getLocation(p))
})
}, function(p) {
progress(WeatherAppJS.LocationsManager.getLocation(p))
})
}, function() {
if (innerTilePromise && innerTilePromise.cancel) {
innerTilePromise.cancel()
}
if (innerCCPromise && innerCCPromise.cancel) {
innerCCPromise.cancel()
}
})
}
else {
return new WinJS.Promise(function(complete, error) {
complete(WeatherAppJS.LocationsManager.getLocation(locId))
})
}
}, getTianQiDataForLocationAsync: function getTianQiDataForLocationAsync(locId, bypassCache, isFre) {
var displayUnit=WeatherAppJS.SettingsManager.getDisplayUnit();
var innerPromise;
var locationObj=WeatherAppJS.LocationsManager.getLocation(locId);
if ((!locationObj) || (!locationObj._currentConditions) || (!locationObj._hourlyConditions) || (locationObj._currentConditions.tempunit !== displayUnit) || (WeatherAppJS.Utilities.Common.isStale(locationObj._currentConditions.lastUpdatedTime, PlatformJS.Services.appConfig.getString("TimeBeforeStale"))) || (bypassCache)) {
return new WinJS.Promise(function(complete, error, progress) {
if (isFre) {
innerPromise = WeatherAppJS.Utilities.FRE.getOverviewData()
}
else {
innerPromise = WeatherAppJS.DataManager.getTianQiDataForLocationAsync(locId, displayUnit, bypassCache)
}
innerPromise.then(function() {
complete(WeatherAppJS.LocationsManager.getLocation(locId))
}, function(e) {
if (PlatformJS.Utilities.isPromiseCanceled(e)) {
return
}
error(e)
}, function(p) {
progress(WeatherAppJS.LocationsManager.getLocation(p))
})
}, function() {
if (innerPromise && innerPromise.cancel) {
innerPromise.cancel()
}
})
}
else {
return new WinJS.Promise(function(complete, error) {
complete(WeatherAppJS.LocationsManager.getLocation(locId))
})
}
}, getTianQiTileDataForLocationAsync: function getTianQiTileDataForLocationAsync(locId, bypassCache, isFre) {
var displayUnit=WeatherAppJS.SettingsManager.getDisplayUnit();
var innerPromise;
var locationObj=WeatherAppJS.LocationsManager.getLocation(locId);
if ((!locationObj) || (!locationObj._currentConditions) || (locationObj._currentConditions.tempunit !== displayUnit) || (WeatherAppJS.Utilities.Common.isStale(locationObj._currentConditions.lastUpdatedTime, PlatformJS.Services.appConfig.getString("TimeBeforeStale"))) || (bypassCache)) {
return new WinJS.Promise(function(complete, error, progress) {
if (isFre) {
innerPromise = WeatherAppJS.Utilities.FRE.getOverviewData()
}
else {
innerPromise = WeatherAppJS.DataManager.getTianQiTileDataForLocationAsync(locId, displayUnit, bypassCache)
}
innerPromise.then(function() {
complete(WeatherAppJS.LocationsManager.getLocation(locId))
}, function(e) {
if (PlatformJS.Utilities.isPromiseCanceled(e)) {
return
}
error(e)
}, function(p) {
progress(WeatherAppJS.LocationsManager.getLocation(p))
})
}, function() {
if (innerPromise && innerPromise.cancel) {
innerPromise.cancel()
}
})
}
else {
return new WinJS.Promise(function(complete, error) {
complete(WeatherAppJS.LocationsManager.getLocation(locId))
})
}
}, getSkiTileDataForLocationAsync: function getSkiTileDataForLocationAsync(locId, bypassCache) {
var displayUnit=WeatherAppJS.SettingsManager.getDisplayUnit();
var innerTilePromise;
var locationObj=WeatherAppJS.LocationsManager.getLocation(locId);
if ((!locationObj) || (!locationObj._currentConditions) || (locationObj._currentConditions.tempunit !== displayUnit) || (locationObj._currentConditions.snowUnit === undefined) || (WeatherAppJS.Utilities.Common.isStale(locationObj._currentConditions.lastUpdatedTime, PlatformJS.Services.appConfig.getString("TimeBeforeStale"))) || (bypassCache)) {
return new WinJS.Promise(function(complete, error, progress) {
var locObj=WeatherAppJS.LocationsManager.getLocation(locId);
if (locObj && locObj._currentConditions && (locObj._currentConditions.tempunit === displayUnit)) {
msSetImmediate(function() {
progress(locObj)
})
}
innerTilePromise = WeatherAppJS.DataManager.getSkiTileDataForLocationAsync(locId, displayUnit, bypassCache);
innerTilePromise.then(function() {
complete(WeatherAppJS.LocationsManager.getLocation(locId))
}, function(e) {
if (PlatformJS.Utilities.isPromiseCanceled(e)) {
return
}
}, function(p) {
progress(WeatherAppJS.LocationsManager.getLocation(p))
})
}, function() {
if (innerTilePromise && innerTilePromise.cancel) {
innerTilePromise.cancel()
}
})
}
else {
return new WinJS.Promise(function(complete, error) {
complete(WeatherAppJS.LocationsManager.getLocation(locId))
})
}
}, getWorldWeatherDataForLocationsAsync: function getWorldWeatherDataForLocationsAsync(continent, locIdList, bypassCache) {
var displayUnit=WeatherAppJS.SettingsManager.getDisplayUnit();
var fetchIdList={};
var locationsData={};
var innerPromise;
for (var i in locIdList) {
var locId=locIdList[i];
var locationObj=WeatherAppJS.LocationsManager.getLocation(locId);
if ((!locationObj) || (!locationObj._currentConditions) || (locationObj._currentConditions.tempunit !== displayUnit) || (WeatherAppJS.Utilities.Common.isStale(locationObj._currentConditions.lastUpdatedTime, PlatformJS.Services.appConfig.getString("TimeBeforeStale"))) || (bypassCache)) {
fetchIdList[i] = locIdList[i]
}
else {
locationsData[locId] = locationObj
}
}
if (Object.keys(fetchIdList).length > 0) {
return new WinJS.Promise(function(complete, error, progress) {
innerPromise = WeatherAppJS.DataManager.getWorldWeatherDataForLocationsAsync(continent, fetchIdList, displayUnit, bypassCache);
innerPromise.then(function(fetchedData) {
complete(mergeData(locationsData, fetchedData))
}, function(e) {
if (PlatformJS.Utilities.isPromiseCanceled(e)) {
return
}
error(e)
}, function(fetchedData) {
progress(mergeData(locationsData, fetchedData))
})
}, function() {
if (innerPromise && innerPromise.cancel) {
innerPromise.cancel()
}
})
}
else {
return new WinJS.Promise(function(complete, error) {
complete(locationsData)
})
}
function mergeData(allLocationsData, fetchedData) {
var mergedData={};
for (var locationsAttrName in allLocationsData) {
mergedData[locationsAttrName] = allLocationsData[locationsAttrName]
}
for (var attrname in fetchedData) {
mergedData[attrname] = fetchedData[attrname]
}
return mergedData
}
;
}, getSkiDetailsAsync: function getSkiDetailsAsync(resortID, bypassCache) {
var displayUnit=WeatherAppJS.SettingsManager.getDisplayUnit();
var locationObj=WeatherAppJS.LocationsManager.getLocation(resortID);
var innerTilePromise;
if ((!locationObj) || (!locationObj._skiOverview) || (locationObj._skiOverview.tempunit !== displayUnit) || (WeatherAppJS.Utilities.Common.isStale(locationObj._currentConditions.lastUpdatedTime, PlatformJS.Services.appConfig.getString("TimeBeforeStale"))) || (bypassCache)) {
return new WinJS.Promise(function(complete, error, progress) {
innerTilePromise = WeatherAppJS.DataManager.getSkiDetailsAsync(resortID, displayUnit, bypassCache);
innerTilePromise.then(function(response) {
complete(response)
}, function(e) {
error(e)
}, function(response) {
progress(response)
})
})
}
else {
return new WinJS.Promise(function(complete, error) {
complete(WeatherAppJS.LocationsManager.getLocation(resortID))
})
}
}, getNearbySkiResortsAsync: function getNearbySkiResortsAsync(locID, bypassCache, getById) {
var displayUnit=WeatherAppJS.SettingsManager.getDisplayUnit();
var locationObj=WeatherAppJS.LocationsManager.getLocation(locID);
var locInfo=WeatherAppJS.GeocodeCache.getLocation(locID);
var isoCode=(locInfo && locInfo.isoCode) ? locInfo.isoCode : "";
var innerTilePromise;
if ((!locationObj) || (!locationObj._nearbyResorts) || (locationObj._nearbyResorts.tempunit !== displayUnit) || (WeatherAppJS.Utilities.Common.isStale(locationObj._nearbyResorts.lastUpdatedTime, PlatformJS.Services.appConfig.getString("TimeBeforeStale"))) || (bypassCache)) {
return new WinJS.Promise(function(complete, error, progress) {
if (getById) {
innerTilePromise = WeatherAppJS.DataManager.getNearbySkiResortsByIdAsync(locID, displayUnit, bypassCache, isoCode)
}
else {
innerTilePromise = WeatherAppJS.DataManager.getNearbySkiResortsByLatLongAsync(locID, displayUnit, bypassCache, isoCode)
}
innerTilePromise.then(function(locObj) {
if (locObj && locObj.getNearbyResorts) {
complete(locObj.getNearbyResorts())
}
else {
complete()
}
}, function(e) {
error(e)
})
})
}
else {
if (locationObj && locationObj.getNearbyResorts) {
return WinJS.Promise.wrap(locationObj.getNearbyResorts())
}
}
}, getSkiDetailsOverviewAsync: function getSkiDetailsOverviewAsync(resortID, bypassCache) {
var innerPromise;
return new WinJS.Promise(function(complete, error, progress) {
innerPromise = WeatherAppJS.LocationsManager.getSkiDetailsAsync(resortID, bypassCache).then(function(locObj) {
complete(locObj.getSkiOverview())
}, function(e) {
error(e)
}, function(locObj) {
progress(locObj.getSkiOverview())
})
}, function() {
WeatherAppJS.Controls.Utilities.cancelPromise(innerPromise)
})
}, getSkiDetailsHourlyDataAsync: function getSkiDetailsHourlyDataAsync(resortID, bypassCache) {
var innerPromise;
return new WinJS.Promise(function(complete, error, progress) {
innerPromise = WeatherAppJS.LocationsManager.getSkiDetailsAsync(resortID, bypassCache).then(function(locObj) {
complete(locObj)
}, function(e) {
error(e)
}, function(locObj) {
progress(locObj)
})
}, function() {
WeatherAppJS.Controls.Utilities.cancelPromise(innerPromise)
})
}, getSkiDetailsDealsAndNewsAsync: function getSkiDetailsDealsAndNewsAsync(resortID, bypassCache) {
var innerPromise;
return new WinJS.Promise(function(complete, error, progress) {
innerPromise = WeatherAppJS.LocationsManager.getSkiDetailsAsync(resortID, bypassCache).then(function(locObj) {
complete(locObj.getSkiDeals())
}, function(e) {
error(e)
}, function(locObj) {
progress(locObj.getSkiDeals())
})
}, function() {
WeatherAppJS.Controls.Utilities.cancelPromise(innerPromise)
})
}, getSkiDetailsReviewsAsync: function getSkiDetailsReviewsAsync(resortID, bypassCache) {
var innerPromise;
return new WinJS.Promise(function(complete, error, progress) {
innerPromise = WeatherAppJS.LocationsManager.getSkiDetailsAsync(resortID, bypassCache).then(function(locObj) {
complete(locObj.getSkiReviews())
}, function(e) {
error(e)
}, function(locObj) {
progress(locObj.getSkiReviews())
})
}, function() {
WeatherAppJS.Controls.Utilities.cancelPromise(innerPromise)
})
}, getSkiDetailsPhotosynthPanoramasAsync: function getSkiDetailsPhotosynthPanoramasAsync(resortID, bypassCache) {
var innerPromise;
return new WinJS.Promise(function(complete, error, progress) {
innerPromise = WeatherAppJS.LocationsManager.getSkiDetailsAsync(resortID, bypassCache).then(function(locObj) {
complete(locObj.getPhotosynthPanoramas())
}, function(e) {
error(e)
}, function(locObj) {
progress(locObj.getPhotosynthPanoramas())
})
}, function() {
WeatherAppJS.Controls.Utilities.cancelPromise(innerPromise)
})
}
})
})();
WeatherAppJS.LocationsManager.init()