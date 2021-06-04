/*  © Microsoft. All rights reserved. */
'use strict';
WinJS.Namespace.define("AppexJS.PreInitialize", {doMarketOverrides: function doMarketOverrides() {
var locationDominantMarketInfo=PlatformJS.Utilities.Globalization.getDominantMarketForLocation();
var locationDominantMarketString=locationDominantMarketInfo.valueAsString;
var disablePrimaryLanguageOverride=true;
var geographicRegion=new Windows.Globalization.GeographicRegion;
if (locationDominantMarketInfo.geographicRegionTwoLetterCode === "CN") {
disablePrimaryLanguageOverride = false
}
return {
marketStringOverride: locationDominantMarketString, disablePrimaryLanguageOverride: disablePrimaryLanguageOverride
}
}});
window.$MapsNamespace = 'MicrosoftJS';
(function() {
var delayPlatformInitialization=function(delayPlatformInitializationFlag) {
Windows.Storage.ApplicationData.current.localSettings.values["delayPlatformInitialization"] = delayPlatformInitializationFlag
};
delayPlatformInitialization(true);
PlatformJS.initialize();
if (PlatformJS.isDebug) {
window.addEventListener("DOMContentLoaded", function() {
var testScriptElement=document.createElement("script");
testScriptElement.src = "/tests/init.js";
document.body.appendChild(testScriptElement)
})
}
WinJS.Application.start();
WinJS.UI.processAll();
WinJS.Resources.processAll()
})()