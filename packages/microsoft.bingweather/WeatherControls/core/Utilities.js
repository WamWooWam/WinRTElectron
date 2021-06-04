/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
WinJS.Namespace.define("WeatherAppJS.Controls.Utilities", {
writeProfilerMark: function writeProfilerMark(controlName, functionName, type) {
msWriteProfilerMark("WeatherAppJS:" + controlName + ":" + functionName + "," + type)
}, getDataId: function getDataId(element) {
if (!element) {
return null
}
return element.getAttribute("data-weather-dataid")
}, interfaceException: function interfaceException(moduleName, msg) {
if (!PlatformJS.isDebug) {
return
}
try {
throw new Error(moduleName + msg);
}
catch(e) {}
}, isCancellationError: function isCancellationError(error) {
if (!error) {
return false
}
if (Array.isArray(error)) {
for (var kk=0; kk < error.length; kk++) {
if (error[kk] && error[kk].message === "Canceled") {
return true
}
}
}
else {
return (error && error.message === "Canceled")
}
}, cancelPromiseArray: function cancelPromiseArray(promises) {
if (!promises || !Array.isArray(promises)) {
return
}
for (var kk=0; kk < promises.length; kk++) {
var promise=promises[kk];
if (promise && promise.cancel && typeof promise.cancel === 'function') {
promise.cancel()
}
promises[kk] = "cancelled"
}
}, cancelPromise: function cancelPromise(promise) {
if (promise && promise.cancel && typeof promise.cancel === 'function') {
promise.cancel()
}
}, createDivWithClassName: function createDivWithClassName(className) {
var element=document.createElement('div');
WinJS.Utilities.addClass(element, className);
return element
}, getCurrentPagePanoControl: function getCurrentPagePanoControl() {
var panoControl=null;
var panoElement=document.querySelector(".mainPanorama");
if (!panoElement) {
panoElement = document.querySelector("#mainPanorama")
}
panoControl = panoElement !== null ? panoElement.winControl : null;
return panoControl
}, getClusterControlsInsidePagePano: function getClusterControlsInsidePagePano() {
var that=this;
var clusterControls=[];
var panoControl=WeatherAppJS.Controls.Utilities.getCurrentPagePanoControl();
if (panoControl) {
var panoSurface;
if (!panoControl || !panoControl._virtualizer || !panoControl._virtualizer._realized) {
return clusterControls
}
var item=panoControl._virtualizer._realized.first;
while (item) {
if (item.winControl) {
clusterControls.push(item.winControl)
}
item = item.next
}
}
return clusterControls
}, setObjectPropertiesToNull: function setObjectPropertiesToNull(obj) {
if (!obj) {
return
}
var keys=Object.keys(obj);
for (var kk=0; kk < keys.length; kk++) {
var key=keys[kk];
if (key === 'element' || key === '_domElement') {
continue
}
obj[keys[kk]] = null
}
obj.element = null;
obj._domElement = null
}, getViewControls: function getViewControls(viewFragment) {
var controls=[];
if (!viewFragment) {
WeatherAppJS.Controls.Utilities.interfaceException("WeatherAppJS.Controls.Utilities.getViewControls", "invalid view fragment");
return controls
}
var viewControlElements=viewFragment.querySelectorAll(".weatherViewControl");
for (var i=0, iLength=viewControlElements.length; i < iLength; i++) {
var viewElement=viewControlElements[i];
var viewControl=viewElement.winControl;
if (viewControl) {
if (typeof viewControl.render === "function" && typeof viewControl.cleanUp === "function") {
controls.push(viewControl)
}
else {
WeatherAppJS.Controls.Utilities.interfaceException("WeatherAppJS.Controls.Utilities.getViewControls", "invalid viewControl")
}
}
}
return controls
}, createViewControlAsync: function createViewControlAsync(config, element, blockingPromise) {
blockingPromise = blockingPromise ? blockingPromise : WinJS.Promise.wrap(true);
return blockingPromise.then(function(param) {
var viewFragmentPath=config.view.fragmentPath;
var controlName=config.view.control;
return WeatherAppJS.Controls.Utilities.createObjectAsync(controlName, viewFragmentPath, element, config)
})
}, createObjectAsync: function createObjectAsync(name, fragmentPath, arg1, arg2) {
if (!name) {
return WinJS.Promise.wrapError({message: "invalid class name"})
}
var fragmentLoadPromise=WinJS.Promise.wrap(true);
if (fragmentPath) {
fragmentLoadPromise = WinJS.UI.Fragments.cache(fragmentPath)
}
return fragmentLoadPromise.then(function WeatherClusterUtilities_createObjectAsyncFragmentCacheComplete() {
var obj=PlatformJS.Utilities.createObject.apply(this, [name, arg1, arg2]);
if (obj) {
return WinJS.Promise.wrap(obj)
}
return WinJS.Promise.wrapError({message: "unable to create object"})
})
}, getViewConfig: function getViewConfig(view) {
if (view) {
var namespace;
var namespaceParts=view.split(".");
if (namespaceParts && namespaceParts.length > 0) {
for (var i=0; i < namespaceParts.length; i++) {
if (i === 0) {
namespace = window[namespaceParts[0]]
}
else {
namespace = namespace[namespaceParts[i]]
}
if (!namespace) {
return null
}
}
return namespace
}
}
return null
}, loadModule: function loadModule(moduleInfo, data, parentElement) {
if (moduleInfo && moduleInfo.renderer) {
parentElement = parentElement ? parentElement : document.createElement("div");
var addToParentNode=function(moduleFragment) {
if (moduleFragment) {
parentElement.appendChild(moduleFragment)
}
else {
WeatherAppJS.Controls.Utilities.interfaceException("WeatherAppJS.Controls.Utilities.loadModule", "unable to render the module")
}
return WinJS.Promise.wrap(parentElement)
};
var renderedModule=moduleInfo.renderer(data, moduleInfo.options);
if (WinJS.Promise.is(renderedModule)) {
return renderedModule.then(addToParentNode)
}
else {
return addToParentNode(renderedModule)
}
}
return CommonJS.loadModule(moduleInfo, data, parentElement, null, null)
}, cloneOptions: function cloneOptions(inputOptions) {
if (!inputOptions) {
return {}
}
var clone=WeatherAppJS.Utilities.jsonParse(WeatherAppJS.Utilities.jsonStringify(inputOptions));
return clone ? clone : {}
}
})
})()