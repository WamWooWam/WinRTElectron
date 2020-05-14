/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
var delayPlatformInitialization=function() {
var localSettings=null;
try {
localSettings = Windows.Storage.ApplicationData.current.localSettings
}
catch(e) {
console.error("Unable to get local settings: " + e.message)
}
if (localSettings && localSettings.values) {
localSettings.values["delayPlatformInitialization"] = true
}
};
NewsJS.defaultJsLazyLoadPromise = WinJS.Promise.as();
var defaultJsLazyLoadTask=function _defaultJsLazyLoad() {
return NewsJS.defaultJsLazyLoadPromise = WinJS.UI.Fragments.renderCopy("/defaultLazy.html")
};
delayPlatformInitialization();
PlatformJS.initialize();
PlatformJS.platformInitializedPromise = PlatformJS.platformInitializedPromise.then(defaultJsLazyLoadTask).then(function() {
CommonJS.ArticleReader.ArticleReaderUtils.setRightSizeArticleReaderImages(false)
});
if (PlatformJS.isDebug) {
window.addEventListener("DOMContentLoaded", function() {
var testScriptElement=document.createElement("script");
testScriptElement.src = "/tests/init.js";
document.body.appendChild(testScriptElement)
})
}
WinJS.Application.start()
})()