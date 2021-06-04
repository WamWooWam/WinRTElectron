/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
WinJS.Namespace.define("WeatherAppJS.UI.Settings", {
_appVersion: "", _initDisplayUnitSettings: function _initDisplayUnitSettings() {
var useTianQi=Platform.Utilities.Globalization.isFeatureEnabled("UseTianQi");
if (useTianQi) {
var unitChangeElement=document.querySelector('#displayUnit');
if (unitChangeElement) {
unitChangeElement.style.display = "none"
}
}
else {
var displayUnit=WeatherAppJS.SettingsManager.getDisplayUnit();
var cunit=document.getElementById('cunit');
var funit=document.getElementById('funit');
if (displayUnit === "C") {
funit.checked = "false";
cunit.checked = "true"
}
else {
cunit.checked = "false";
funit.checked = "true"
}
}
}, _initEnableSearchHistorySetting: function _initEnableSearchHistorySetting(settingsDiv) {
var enableSearchHistory=WeatherAppJS.SettingsManager.getEnableSearchHistory();
var searchHistoryToggleSwitchControl=settingsDiv.querySelector('#enableSearchHistory').winControl;
searchHistoryToggleSwitchControl.checked = enableSearchHistory
}, _initMapsEnvironmentList: function _initMapsEnvironmentList(settingsDiv) {
var mapsEnvListElem=document.getElementById('mapsEnvironmentList');
var mapEnvs=WeatherAppJS.UI.Settings.tryGetMapsEnvironmentsList();
var currentEnv=WeatherAppJS.SettingsManager.getMapsEnvironment();
if (mapsEnvListElem && mapEnvs && mapEnvs.length > 0) {
var envLength=mapEnvs.length;
for (var j=0; j < envLength; j++) {
var envOptionElem=document.createElement("option");
envOptionElem.value = j;
envOptionElem.innerText = mapEnvs[j];
if (mapEnvs[j] === currentEnv) {
envOptionElem.selected = true
}
mapsEnvListElem.appendChild(envOptionElem)
}
}
}, tryGetMapsEnvironmentsList: function tryGetMapsEnvironmentsList() {
return WeatherAppJS.UI.Settings.getDictionaryKeys("MapEnvironments")
}, getDictionaryKeys: function getDictionaryKeys(dictionaryName) {
var keys=[];
if (!dictionaryName) {
return keys
}
var dictionary=PlatformJS.Services.appConfig.getDictionary(dictionaryName);
if (!dictionary) {
return keys
}
var dictKeys=Object.keys(dictionary);
for (var key in dictKeys) {
keys.push(dictKeys[key])
}
return keys
}, addMarketSpecificProvider: function addMarketSpecificProvider(aboutNode) {
PlatformJS.platformInitializedPromise.then(function() {
var appConfig=PlatformJS.Services.appConfig;
var resourceLoader=PlatformJS.Services.resourceLoader;
var singleProviderOnly=appConfig.getBool("SingleProviderOnly");
var bindingData=null;
var providerNode=aboutNode.querySelector(".localProvider");
if (singleProviderOnly && !providerNode) {
var providerData=appConfig.getDictionary("LocalProvider");
if (providerData && providerData.size === 0) {
return
}
var templateId=null;
var header=providerData.getString("Header");
var cssClass=providerData.getString("CssClass");
var providerName=providerData.getString("Name");
var logo=providerData.getString("Logo");
if (!logo) {
templateId = "providerTemplate";
bindingData = {
attributionHeading: resourceLoader.getString(header), providerName: resourceLoader.getString(providerName)
}
}
else {
templateId = "providerTemplateLink";
bindingData = {
attributionHeading: resourceLoader.getString(header), providerUrl: resourceLoader.getString(providerName + "Url"), providerLogo: logo
}
}
CommonJS.loadModule({
fragmentPath: "/html/delayedTemplate.html", templateId: templateId
}, bindingData, null, null, null).then(function(providerTemplate) {
if (cssClass) {
WinJS.Utilities.addClass(providerTemplate, cssClass)
}
aboutNode.appendChild(providerTemplate)
})
}
})
}, onShowSettingsCmd: function onShowSettingsCmd(ev) {
WeatherAppJS.UI.Settings.addShowSettingsPageFragment().then(function(settingsFlyout) {
if (settingsFlyout) {
settingsFlyout.show()
}
})
}, addShowSettingsPageFragment: function addShowSettingsPageFragment() {
var settingsDiv=document.getElementById("SettingsPageDiv");
if (!settingsDiv) {
settingsDiv = document.createElement("div");
settingsDiv.id = "SettingsPageDiv";
document.body.appendChild(settingsDiv)
}
var promise=new WinJS.Promise(function(complete) {
WinJS.UI.Fragments.renderCopy("/html/settingsFlyout.html", settingsDiv).then(function(doc) {
var dataContext={
optionsPageBackButtonclick: WinJS.Utilities.markSupportedForProcessing(WinJS.UI.SettingsFlyout.show), clearHistoryClickHandler: WinJS.Utilities.markSupportedForProcessing(WeatherAppJS.UI.Settings.onClearSearchHistory), displayUnitChangeHandler: WinJS.Utilities.markSupportedForProcessing(function(e) {
if (e && e.currentTarget) {
WeatherAppJS.UI.Settings.onDisplayUnitSet(e.currentTarget.value)
}
})
};
WinJS.UI.processAll(settingsDiv).then(function() {
WeatherAppJS.UI.Settings._initEnableSearchHistorySetting(settingsDiv);
WeatherAppJS.UI.Settings._initDisplayUnitSettings();
WeatherAppJS.UI.Settings._initMapsEnvironmentList()
});
WinJS.Binding.processAll(settingsDiv, dataContext);
WinJS.Resources.processAll(settingsDiv);
complete(PlatformJS.Utilities.getControl("SettingsPage"))
}, function(error) {
complete(null)
})
});
return promise
}, removeShowSettingsPageFragment: function removeShowSettingsPageFragment() {
var settingsDiv=document.getElementById("SettingsPageDiv");
if (settingsDiv) {
document.body.removeChild(settingsDiv)
}
}, onAboutCmd: function onAboutCmd(ev) {
WeatherAppJS.UI.Settings.addAboutPageFragment().then(function(aboutFlyout) {
if (aboutFlyout) {
aboutFlyout.show()
}
})
}, addAboutPageFragment: function addAboutPageFragment() {
var aboutElement=document.getElementById("AboutPageDiv");
if (!aboutElement) {
aboutElement = document.createElement("div");
aboutElement.id = "AboutPageDiv";
document.body.appendChild(aboutElement)
}
var promise=new WinJS.Promise(function(complete) {
WinJS.UI.Fragments.renderCopy("/html/aboutFlyout.html", aboutElement).then(function(doc) {
var displayTianQiAttrib="none";
var useTianQi=Platform.Utilities.Globalization.isFeatureEnabled("UseTianQi");
if (useTianQi) {
displayTianQiAttrib = ""
}
var tianQiAttributionDivs=aboutElement.querySelectorAll(".tianqiAttribution");
for (var i=0; i < tianQiAttributionDivs.length; i++) {
tianQiAttributionDivs[i].style.display = displayTianQiAttrib
}
WeatherAppJS.UI.Settings.addMarketSpecificProvider(aboutElement.querySelector("#providerAttribution"));
var weatherDotComUrl=aboutElement.querySelector("#weatherDotComUrl");
weatherDotComUrl.innerText = WeatherAppJS.Utilities.Common.getWeatherDotComBaseUrl();
weatherDotComUrl.setAttribute("href", WeatherAppJS.Utilities.Common.getWeatherDotComHomeUrl());
if (!PlatformJS.Services.appConfig.getBool("ShowWeatherTrendsAttribution")) {
var weatherTrendsContainer=aboutElement.querySelector('.weatherTrendsContainer');
WinJS.Utilities.addClass(weatherTrendsContainer, "hideWeatherTrendsContainer")
}
var imageAttributionDiv=aboutElement.querySelector('.imageCreditsContainer');
imageAttributionDiv.style.display = "none";
var imageAttributiontext=WeatherAppJS.Utilities.UI.getCurrentHeroImageAttribution();
if (imageAttributiontext) {
imageAttributionDiv.style.display = "";
var imageAttributionDiv=imageAttributionDiv.querySelector('.imageAttribution');
imageAttributionDiv.innerText = imageAttributiontext
}
var dataContext={
aboutPageBackButtonclick: WinJS.Utilities.markSupportedForProcessing(WinJS.UI.SettingsFlyout.show), helpText: CommonJS.resourceLoader.getString("/platform/HelpLabel"), onHelpClick: WinJS.Utilities.markSupportedForProcessing(CommonJS.Settings.onHelpCmd), onHelpKeyDown: WinJS.Utilities.markSupportedForProcessing(WeatherAppJS.UI.Settings.onHelpKeyDown), creditsText: CommonJS.resourceLoader.getString("/platform/creditsLink"), onCreditsClick: WinJS.Utilities.markSupportedForProcessing(CommonJS.Settings.onCreditsLinkFromSettingsCharm)
};
WeatherAppJS.UI.Settings.setAppVersion();
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.ActionContext.charms, "About", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0);
WinJS.UI.processAll(aboutElement).then();
WinJS.Binding.processAll(aboutElement, dataContext);
WinJS.Resources.processAll(aboutElement);
complete(PlatformJS.Utilities.getControl("AboutPage"))
}, function(error) {
complete(null)
})
});
return promise
}, onHelpKeyDown: function onHelpKeyDown(evt) {
if (evt && evt.keyCode && evt.keyCode !== WinJS.Utilities.Key.enter) {
return
}
else {
CommonJS.Settings.onHelpCmd()
}
}, removeAboutPageFragment: function removeAboutPageFragment() {
var aboutElement=document.getElementById("AboutPageDiv");
if (aboutElement) {
document.body.removeChild(aboutElement)
}
}, onCommandsRequested: function onCommandsRequested(e) {
var appSettings=Windows.UI.ApplicationSettings;
var vector=e.request.applicationCommands;
var settingsCmd=new appSettings.SettingsCommand("SettingsPage", PlatformJS.Services.resourceLoader.getString("/platform/optionsTitle"), WeatherAppJS.UI.Settings.onShowSettingsCmd);
vector.append(settingsCmd);
var aboutCmd=new appSettings.SettingsCommand("AboutPage", PlatformJS.Services.resourceLoader.getString("About"), WeatherAppJS.UI.Settings.onAboutCmd);
vector.append(aboutCmd);
CommonJS.Settings.addCommonButtons(vector)
}, onDisplayUnitSet: function onDisplayUnitSet(unit) {
WeatherAppJS.SettingsManager.setDisplayUnitAsync(unit, Microsoft.Bing.AppEx.Telemetry.ActionContext.charms).then(function(){}, function(e){})
}, onClearSearchHistory: function onClearSearchHistory() {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.ActionContext.charms, "Clear History Setting", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.select, PlatformJS.Utilities.getLastClickUserActionMethod(), 0);
WeatherAppJS.Utilities.Instrumentation.incrementInt32("NumTimesClearHistorySettingChanged");
CommonJS.Search.clearSearchHistory();
WeatherAppJS.SettingsManager.removeAllRecentLocationsAsync().then()
}, onEnableSearchHistory: function onEnableSearchHistory(event) {
if (event) {
var toggleControl=PlatformJS.Utilities.getControl(event.currentTarget);
if (toggleControl && (toggleControl.checked === true || toggleControl.checked === false)) {
WeatherAppJS.Utilities.Instrumentation.incrementInt32("EnableSearchHistorySettingChanged");
var eventAttr={change: toggleControl.checked ? "ON" : "OFF"};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.ActionContext.charms, "Search History Setting", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.select, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr));
WeatherAppJS.SettingsManager.setEnableSearchHistory(toggleControl.checked).then(function(){}, function() {
event.preventDefault()
})
}
else {
event.preventDefault()
}
var clearHistoryButton=document.querySelector('#searchHistory .buttonContainer');
if (!toggleControl.checked) {
CommonJS.Search.clearSearchHistory();
clearHistoryButton.disabled = "disabled";
WinJS.Utilities.addClass(clearHistoryButton, "disabled")
}
else {
clearHistoryButton.disabled = "";
WinJS.Utilities.removeClass(clearHistoryButton, "disabled")
}
}
}, onMapsEnvironmentChange: WinJS.UI.eventHandler(function(value) {
var mapEnvs=WeatherAppJS.UI.Settings.tryGetMapsEnvironmentsList();
if (mapEnvs && mapEnvs[value]) {
WeatherAppJS.SettingsManager.setMapsEnvironment(mapEnvs[value]);
PlatformJS.Navigation.navigateToChannel("Home")
}
}), getAppVersion: function getAppVersion() {
var that=WeatherAppJS.UI.Settings;
if (!that._appVersion) {
var version=Windows.ApplicationModel.Package.current.id.version;
var versionString=PlatformJS.Services.resourceLoader.getString("/platform/appVersion").format(version.major + "." + version.minor + "." + version.build + "." + version.revision);
that._appVersion = versionString
}
return that._appVersion
}, setAppVersion: function setAppVersion() {
var appVersion=document.getElementById('appVersion');
if (appVersion) {
appVersion.innerText = WeatherAppJS.UI.Settings.getAppVersion()
}
}, init: function init() {
var settingsPane=Windows.UI.ApplicationSettings.SettingsPane.getForCurrentView();
settingsPane.oncommandsrequested = WeatherAppJS.UI.Settings.onCommandsRequested
}
});
var markSupportedForProcessing=WinJS.Utilities.markSupportedForProcessing;
var weatherSettings=WeatherAppJS.UI.Settings;
markSupportedForProcessing(weatherSettings.onEnableSearchHistory)
})()