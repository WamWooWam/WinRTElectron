/*  © Microsoft. All rights reserved. */
(function(global) {
'use strict';
WinJS.Namespace.define("WeatherAppJS.Services", {
mainProcessManager: null, ProcessManager: WinJS.Class.define(function ProcessManager_ctor(options) {
var that=this;
that._isImmediateLoad = options && options.isImmediateLoad ? options.isImmediateLoad : false;
that._init()
}, {
_processListener: null, processListener: {get: function get() {
if (this._processListener) {
return this._processListener
}
throw new Error("_processListener is not initialized");
}}, _init: function _init() {
var that=this;
msWriteProfilerMark("WeatherApp:Services:Init:s");
var processListeners=PlatformJS.mainProcessManager._processListeners;
for (var i=0; i < processListeners.length; i++) {
if (processListeners[i] instanceof WeatherAppJS.ProcessListener) {
that._processListener = processListeners[i];
break
}
}
var timeout=that._isImmediateLoad ? 0 : WeatherAppJS.WarmBoot.Cache.getString("FirstViewRealizeTimeout");
setTimeout(function() {
CommonJS.Progress.destroySplash(true);
WeatherAppJS.Services.mainProcessManager.processListener.onFirstViewRealized()
}, timeout);
msWriteProfilerMark("WeatherApp:Services:Init:e")
}
}), initialize: function initialize(isImmediateLoad) {
WeatherAppJS.Services.mainProcessManager = new WeatherAppJS.Services.ProcessManager({isImmediateLoad: isImmediateLoad})
}
})
})(WinJS)