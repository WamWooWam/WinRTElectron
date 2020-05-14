/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
var _PrefetchStateEnum={
NotStarted: "notStarted", Partial: "partial", Completed: "completed", CompletedWithError: "completedWithError"
};
var _currentlyDownloading=null;
var _queuedPanos=[];
var _firstArticleDownloaded=false;
var _isSessionPrefetchInProgress=false;
var _isInProgress=false;
var _isPrefetchManagerInitialized=false;
var _lastSuspendedTime=null;
var _prefetchLastUpdateTime=Windows.Storage.ApplicationData.current.localSettings.values["PrefetchLastUpdateTime"];
var _firstViewRealizationComplete=false;
var _prevIsOnline=null;
var _prefetchLastKnownState=function() {
var savedState=Windows.Storage.ApplicationData.current.localSettings.values["PrefetchLastKnownState"];
if (!savedState) {
savedState = _PrefetchStateEnum.NotStarted
}
return {
get: function get() {
return savedState
}, set: function set(value) {
Windows.Storage.ApplicationData.current.localSettings.values["PrefetchLastKnownState"] = value;
savedState = value
}
}
}();
function onAppGoingOnline(panoramaPrefetcher, options) {
var isNetworkAvailable=NewsJS.Utilities.CachedNetworkChecks.hasInternetConnection();
if (!isNetworkAvailable) {
_setLastUpdatedTime(false);
return
}
if (_isSessionPrefetchInProgress === true) {
var isPanoQueuedAlready=false;
for (var item in _queuedPanos) {
var pano=_queuedPanos[item];
if (pano.options.guid === options.guid) {
isPanoQueuedAlready = true;
break
}
}
if (!isPanoQueuedAlready) {
_forceStartPrefetch(panoramaPrefetcher, options)
}
}
else {
_forceStartPrefetch(panoramaPrefetcher, options)
}
}
function _forceStartPrefetch(panoramaPrefetcher, options) {
initializePrefetchManager(false);
add(panoramaPrefetcher, options)
}
function onPanoResuming(panoramaPrefetcher, options) {
var isNetworkAvailable=NewsJS.Utilities.CachedNetworkChecks.hasInternetConnection();
if (!isNetworkAvailable) {
_setLastUpdatedTime(false)
}
else {
_forceStartPrefetch(panoramaPrefetcher, options)
}
}
function onAppSuspending() {
_lastSuspendedTime = Date.now();
cancelPrefetch();
if (_isInProgress) {
panoCompleted(false)
}
_isPrefetchManagerInitialized = false;
_isSessionPrefetchInProgress = false;
NewsJS.PrefetchManager.isAppFirstViewRealizationComplete = false
}
function onPanoSuspending(){}
function add(panoramaPrefetcher, options) {
var isNetworkAvailable=NewsJS.Utilities.CachedNetworkChecks.hasInternetConnection();
if (!isNetworkAvailable) {
_setLastUpdatedTime(false);
return
}
if (!_shouldPrefetch()) {
_setLastUpdatedTime(true);
return
}
var panoConfig={
prefetcher: panoramaPrefetcher, options: options, currentCount: 0
};
_enqueuePano(panoConfig);
if (!_isSessionPrefetchInProgress) {
_isSessionPrefetchInProgress = true;
setTimeout(_prefetchPano(), 5000)
}
}
function _enqueuePano(panoConfig) {
var exists=false;
for (var item in _queuedPanos) {
var pano=_queuedPanos[item];
if (pano.guid === panoConfig.guid) {
exists = true;
break
}
}
if (!exists) {
_queuedPanos.push(panoConfig)
}
}
function _getPano(panoConfig) {
var prefetcher=PlatformJS.Utilities.createObject(panoConfig.prefetcher, panoConfig.options);
var pano={
prefetcher: prefetcher, guid: prefetcher.guid, delay: prefetcher.delay, panoramaId: prefetcher.panoramaId, market: prefetcher.market
};
return WinJS.Promise.wrap(pano)
}
function _prefetchPano() {
var nextPanoConfig=null;
if (_queuedPanos.length > 0) {
nextPanoConfig = _queuedPanos[0];
if (nextPanoConfig) {
_getPano(nextPanoConfig).then(function(panorama) {
_run(panorama)
})
}
}
}
function _run(panorama) {
_panoStarted(panorama);
panorama.prefetcher.request().then(function(metadata) {
if (metadata) {
var items=metadata.prefetchList;
console.log(metadata);
panorama.articleCount = items ? items.length : 0;
panorama.clusterDownloadRequestFailed = metadata.clusterDownloadFailure;
if (items) {
News.NewsUtil.instance.prefetchItems("bingdaily", items)
}
}
})
}
function _shouldPrefetch() {
if (!NewsJS.PrefetchManager.isPrefetchEnabled) {
return false
}
var costSuggestion=Platform.Networking.NetworkManager.instance.networkCostSuggestion;
var disabledCostNetworks=PlatformJS.Services.configuration.getDictionary("DownloadPano").getDictionary("DisableCostedNetworks");
if ((costSuggestion === Platform.Networking.NetworkCostSuggestion.highCost && disabledCostNetworks.getBool("High")) || (costSuggestion === Platform.Networking.NetworkCostSuggestion.conservative && disabledCostNetworks.getBool("Conservative"))) {
return false
}
return true
}
function _setLastUpdatedTime(useCurrentTimeOverride) {
var prefetchEnabled=NewsJS.PrefetchManager.isPrefetchEnabled;
var isNetworkAvailable=NewsJS.Utilities.CachedNetworkChecks.hasInternetConnection();
var useCurrentTime=useCurrentTimeOverride || (!prefetchEnabled && isNetworkAvailable);
if (useCurrentTime || !_prefetchLastUpdateTime) {
_prefetchLastUpdateTime = new Date;
Windows.Storage.ApplicationData.current.localSettings.values["PrefetchLastUpdateTime"] = _prefetchLastUpdateTime
}
var message=null;
if (prefetchEnabled) {
var prefetchStatus=_prefetchLastKnownState.get();
if (prefetchStatus === _PrefetchStateEnum.Partial) {
message = PlatformJS.Services.resourceLoader.getString("DownloadingArticlesErrorOffline")
}
else if (isNetworkAvailable) {
if (prefetchStatus === _PrefetchStateEnum.Completed) {
message = PlatformJS.Services.resourceLoader.getString("LastUpdatedBingDaily")
}
}
}
PlatformJS.Utilities.setLastUpdatedTime([_prefetchLastUpdateTime], message)
}
function _onConnectionChanged(evt) {
var isOnline=NewsJS.Utilities.CachedNetworkChecks.hasInternetConnection();
if (isOnline === null) {
isOnline = false
}
if (_prevIsOnline === null || _prevIsOnline != isOnline) {
_prevIsOnline = isOnline;
if (isOnline) {
if (_shouldPrefetch()) {
if (_isSessionPrefetchInProgress) {
initializePrefetchManager(false);
setTimeout(_prefetchPano(), 5000)
}
}
else {
_setLastUpdatedTime(false)
}
}
else {
if (_isSessionPrefetchInProgress) {
Platform.Process.registerPlatformUIEventHandler("prefetch_operation_completed", null);
_isPrefetchManagerInitialized = false;
if (_isInProgress) {
if (_currentlyDownloading) {
updateEndStateForPartial(_currentlyDownloading.guid)
}
cancelPrefetch();
panoCompleted(false)
}
else {
_setLastUpdatedTime(false)
}
}
else {
_setLastUpdatedTime(false)
}
}
}
}
function initializePrefetchManager(forcePrefetch) {
var isNetworkAvailable=NewsJS.Utilities.CachedNetworkChecks.hasInternetConnection();
if (isNetworkAvailable) {
_prefetchLastUpdateTime = new Date;
Windows.Storage.ApplicationData.current.localSettings.values["PrefetchLastUpdateTime"] = _prefetchLastUpdateTime
}
if (_isPrefetchManagerInitialized && !forcePrefetch) {
return
}
if (_shouldPrefetch() && isNetworkAvailable) {
_isPrefetchManagerInitialized = true;
if (_isSessionPrefetchInProgress === false) {
_queuedPanos = []
}
_prefetchLastKnownState.set(_PrefetchStateEnum.NotStarted);
_currentlyDownloading = null;
_isInProgress = false;
_firstArticleDownloaded = false;
PrefetchLogger.initialize();
var prefetchEnabled=NewsJS.PrefetchManager.isPrefetchEnabled;
Platform.QueryService.togglePrefetch(prefetchEnabled);
Platform.Networking.NetworkManager.addEventListener("networkstatuschanged", _onConnectionChanged);
Platform.Process.registerPlatformUIEventHandler("prefetch_operation_completed", function(eventName, obj) {
var obj=_parseToken(obj.message);
var valid=_currentlyDownloading && (_currentlyDownloading.guid == obj.group);
if (obj.group && obj.subgroup && valid) {
if (!_firstArticleDownloaded) {
if (_currentlyDownloading.prefetcher.shouldShowDownloadProgressBar()) {
_initPrefetchUX(_currentlyDownloading)
}
_firstArticleDownloaded = true;
_prefetchLastKnownState.set(_PrefetchStateEnum.Partial)
}
_incrementPrefetchUX(obj)
}
})
}
NewsJS.PrefetchManager._recordPrefetchPreferences()
}
function _parseToken(token) {
var vals=token.split(':');
var obj={
group: vals.length > 0 ? vals[0] : null, subgroup: vals.length > 1 ? vals[1] : null
};
return obj
}
function _incrementPrefetchUX(obj) {
log("Prefetch complete callback received for group:" + obj.group + " subgroup:" + obj.subgroup);
var update=_calculateUpdate(obj);
var progress=WinJS.Utilities.id("downloadProgress");
if (progress) {
progress.setAttribute("value", update)
}
}
function _calculateUpdate(obj) {
var count=_currentlyDownloading.articleCount;
_currentlyDownloading.currentCount++;
var displayValue=0;
if (count > 0) {
displayValue = _currentlyDownloading.currentCount / count * 100
}
console.log("Metrics \n" + "totalTasks = " + count + "\n" + "total items in progressList = " + _currentlyDownloading.currentCount + "\n" + "totalCompleted per subgroup calculation = " + _currentlyDownloading.currentCount + "\n" + "Calculated progress for " + obj.group + " = " + displayValue + "%");
if (count === _currentlyDownloading.currentCount) {
_consolidatePrefetchOutcome(obj)
}
return displayValue
}
function _consolidatePrefetchOutcome(obj) {
if (_isErrorInCompletedDownloads(obj.group) || _currentlyDownloading.clusterDownloadRequestFailed) {
_prefetchLastKnownState.set(_PrefetchStateEnum.CompletedWithError);
log("Percentage of errors encountered was greater than threshold. Setting this to completed with errors")
}
else {
_prefetchLastKnownState.set(_PrefetchStateEnum.Completed);
log("Percentage of errors encountered was less than threshold. Setting this to completed.")
}
log("================Consolidation of prefetch outcome complete for pano " + obj.group + "================");
panoCompleted(true)
}
function _isErrorInCompletedDownloads(guid) {
var isError=false;
var errorList=Platform.QueryService.getPrefetchErrors(guid);
var failingImagesCnt=0,
failingNonImageCnt=0,
percentImageFailure=0,
percentNonImageFailure=0;
log("=============================Logging Errors:Begin=============================");
for (var cnt=0; cnt < errorList.length; cnt++) {
if (errorList[cnt].isImage) {
failingImagesCnt++;
log("[" + cnt + "] " + " Image failure. Uri:" + errorList[cnt].uri + " PlatformExceptionCode:" + errorList[cnt].platformExceptionCode + " HttpStatusCode:" + errorList[cnt].httpStatusCode)
}
else {
failingNonImageCnt++;
log("[" + cnt + "] " + " NonImage failure. Uri:" + errorList[cnt].uri + " PlatformExceptionCode:" + errorList[cnt].platformExceptionCode + " HttpStatusCode:" + errorList[cnt].httpStatusCode)
}
}
log("Total image failures:" + failingImagesCnt + " Total non-image failures:" + failingNonImageCnt);
log("=============================Logging Errors:End=============================");
var progressList=Platform.QueryService.getPrefetchProgress(guid);
var successfulImagesCnt=0,
successfulNonImageCnt=0;
log("================Consolidating prefetch outcome for " + guid + "================");
for (var i=0; i < progressList.length; i++) {
var item=progressList[i];
successfulImagesCnt += item.completedImageTasks;
successfulNonImageCnt += item.completedNonImageTasks
}
log("Total image successful:" + successfulImagesCnt + " Total non-image successful:" + successfulNonImageCnt);
var errorMarginPercentForImage=PlatformJS.Services.appConfig.getInt32("PrefetchErrorMarginForImage");
var errorMarginPercentForNonImage=PlatformJS.Services.appConfig.getInt32("PrefetchErrorMarginForNonImage");
log("ErrorMarginPercentForImage:" + errorMarginPercentForImage + ". ErrorMarginPercentForNonImage:" + errorMarginPercentForNonImage);
if ((failingImagesCnt + successfulImagesCnt) != 0) {
percentImageFailure = (failingImagesCnt / (failingImagesCnt + successfulImagesCnt)) * 100
}
if ((failingNonImageCnt + successfulNonImageCnt) != 0) {
percentNonImageFailure = (failingNonImageCnt / (failingNonImageCnt + successfulNonImageCnt)) * 100
}
if (percentImageFailure > errorMarginPercentForImage || percentNonImageFailure > errorMarginPercentForNonImage) {
isError = true
}
return isError
}
function updateEndStateForPartial(guid) {
log("================ NETWORK CABLE YANKED. SCANNING TO GET STATUS: COMPLETED/ PARTIAL ================");
var subGroupPercentPendingDownload=0,
count=_currentlyDownloading.articleCount;
var errorMarginPercentForNonImage=PlatformJS.Services.appConfig.getInt32("PrefetchErrorMarginForNonImage");
if (_isErrorInCompletedDownloads(guid)) {
_prefetchLastKnownState.set(_PrefetchStateEnum.Partial);
log("Percentage of errors encountered in so far downloaded subgroups was greater than threshold. Hence, setting this to partial");
return
}
if (count > 0) {
subGroupPercentPendingDownload = ((count - _currentlyDownloading.currentCount) / count) * 100
}
if (subGroupPercentPendingDownload > errorMarginPercentForNonImage) {
_prefetchLastKnownState.set(_PrefetchStateEnum.Partial);
log("Percentage of pending download:" + subGroupPercentPendingDownload + " is greater than threshold for non-images:" + errorMarginPercentForNonImage + ". Hence, setting this to partial");
return
}
_prefetchLastKnownState.set(_PrefetchStateEnum.Completed)
}
function _initPrefetchUX(pano) {
var showDownloadIndicator=PlatformJS.Services.configuration.getDictionary("DownloadPano").getBool("ShowIndicator", true);
if (pano && showDownloadIndicator && !PlatformJS.mainProcessManager.retailModeEnabled) {
var template="<div id=\"downloadPanoContainer\"><span class=\"downloadLabel\" id=\"downloadLabel\">" + PlatformJS.Services.resourceLoader.getString("DownloadingArticles") + "</span>" + "<progress class=\"downloadProgress\" id=\"downloadProgress\" value=\"" + (_currentlyDownloading.currentCount / _currentlyDownloading.articleCount * 100) + "\" max=\"100\"></progress></div>";
CommonJS.Watermark.setWatermarkHtml(template)
}
}
function _showErrorUX(pano) {
if (pano && !PlatformJS.mainProcessManager.retailModeEnabled) {
var template="<div id=\"downloadPanoContainer\"><span class=\"downloadLabel\" id=\"downloadLabel\">\u26A0 " + PlatformJS.Services.resourceLoader.getString("DownloadingArticlesError") + "</span>" + "<progress class=\"downloadProgress\" id=\"downloadProgress\" value=\"0\" max=\"100\"></progress></div>";
CommonJS.Watermark.setWatermarkHtml(template)
}
}
function _hideElem(elem) {
if (elem) {
elem.style.display = "none"
}
}
function _panoStarted(pano) {
_firstArticleDownloaded = false;
_isInProgress = true;
_currentlyDownloading = pano;
_currentlyDownloading.currentCount = 0
}
function panoCompleted(startNext) {
_setStyleDone(true);
_markPrefetchComplete();
_panoCompleted_reset();
var isNetworkAvailable=NewsJS.Utilities.CachedNetworkChecks.hasInternetConnection();
if (isNetworkAvailable && startNext) {
_prefetchPano()
}
}
function _markPrefetchComplete() {
var prefetchStatus=_prefetchLastKnownState.get();
log("Prefetch Completed. Time: " + new Date);
switch (prefetchStatus) {
case _PrefetchStateEnum.Completed:
log("Prefetch Completed. State reported: COMPLETED. Consolidated report will be found in debug log.");
NewsJS.PrefetchManager._recordPrefetchState(NewsJS.Telemetry.BingDaily.PrefetchState.completed);
break;
case _PrefetchStateEnum.Partial:
log("Prefetch Completed. State reported: PARTIAL");
NewsJS.PrefetchManager._recordPrefetchState(NewsJS.Telemetry.BingDaily.PrefetchState.partial);
break;
case _PrefetchStateEnum.CompletedWithError:
log("Prefetch Completed with errors. State reported: COMPLETED. Consolidated report will be found in debug log.");
NewsJS.PrefetchManager._recordPrefetchState(NewsJS.Telemetry.BingDaily.PrefetchState.completedWithError);
break
}
PrefetchLogger.close()
}
function log(string) {
var _isDebug=Platform.Process.isDebug();
if (_isDebug) {
PrefetchLogger.log(string)
}
}
function _panoCompleted_reset() {
_isInProgress = false;
_currentlyDownloading = null;
_firstArticleDownloaded = false;
if (_prefetchLastKnownState.get() != _PrefetchStateEnum.Partial) {
_queuedPanos.splice(0, 1);
if (_queuedPanos.length === 0) {
_isPrefetchManagerInitialized = false;
_isSessionPrefetchInProgress = false
}
}
}
function _setStyleDone(useCurrentTimeStamp) {
var prefetchStatus=_prefetchLastKnownState.get();
if (prefetchStatus === _PrefetchStateEnum.CompletedWithError) {
_showErrorUX(_currentlyDownloading)
}
else {
_setLastUpdatedTime(useCurrentTimeStamp)
}
}
function cancelPrefetch() {
if (_currentlyDownloading) {
Platform.QueryService.cancelPrefetch(_currentlyDownloading.guid)
}
}
function _prefetchToggled(event) {
var toggleControl=PlatformJS.Utilities.getControl(event.currentTarget);
if (toggleControl && (toggleControl.checked === true || toggleControl.checked === false)) {
Windows.Storage.ApplicationData.current.localSettings.values["PrefetchState"] = toggleControl.checked;
Platform.QueryService.togglePrefetch(toggleControl.checked);
if (!toggleControl.checked) {
Platform.Process.registerPlatformUIEventHandler("prefetch_operation_completed", null);
if (_prefetchLastKnownState.get() !== _PrefetchStateEnum.NotStarted) {
var now=Date.now();
PlatformJS.Utilities.setLastUpdatedTime([now]);
cancelPrefetch();
panoCompleted(false)
}
}
NewsJS.PrefetchManager._recordPrefetchPreferences()
}
}
function showPrefetchStatus() {
if (_isInProgress) {
_initPrefetchUX(_currentlyDownloading)
}
else {
_setStyleDone(false)
}
}
WinJS.Namespace.define("NewsJS.PrefetchManager", {
add: add, onPanoResuming: onPanoResuming, onPanoSuspending: onPanoSuspending, onAppSuspending: onAppSuspending, onAppGoingOnline: onAppGoingOnline, initializePrefetchManager: initializePrefetchManager, cancel: cancelPrefetch, showPrefetchStatus: showPrefetchStatus, _PrefetchStateEnum: _PrefetchStateEnum, prefetchToggled: {get: function get() {
_prefetchToggled.supportedForProcessing = true;
return _prefetchToggled
}}, isPrefetchEnabled: {get: function get() {
var userState=Windows.Storage.ApplicationData.current.localSettings.values["PrefetchState"];
var cloudState=Platform.Utilities.FailSafeConfiguration.isEnabled("Application", "OfflineSync");
if (cloudState === false) {
return false
}
else if (userState === false) {
return false
}
return true
}}, isPrefetchCloudEnabled: {get: function get() {
var cloudState=Platform.Utilities.FailSafeConfiguration.isEnabled("Application", "OfflineSync");
if (cloudState === false) {
return false
}
else {
return true
}
}}, isPrefetchUserEnabled: {get: function get() {
var userState=Windows.Storage.ApplicationData.current.localSettings.values["PrefetchState"];
if (userState === null || typeof(userState) === "undefined") {
userState = true
}
return userState
}}, isAppFirstViewRealizationComplete: {
get: function get() {
return this._firstViewRealizationComplete
}, set: function set(value) {
this._firstViewRealizationComplete = value
}
}, _recordPrefetchPreferences: function _recordPrefetchPreferences() {
var prefetchPreferences={};
prefetchPreferences["Prefetch/IsEnabled"] = NewsJS.PrefetchManager.isPrefetchEnabled;
var jsonString=JSON.stringify(prefetchPreferences);
PlatformJS.Telemetry.flightRecorder.logPreferencesAsJson(PlatformJS.Telemetry.logLevel.normal, jsonString)
}, _recordPrefetchState: function _recordPrefetchState(prefetchState) {
if (prefetchState) {
Platform.Telemetry.FlightRecorder.logAppAction(Platform.Telemetry.LogLevel.normal, NewsJS.Telemetry.String.ActionContext.prefetch, null, prefetchState, 0)
}
}
});
var InitializationState={
NotStarted: "NotStarted", InProgress: "InProgress", Completed: "Completed"
};
var PrefetchLogger=WinJS.Class.define(function(){}, {}, {
_outputStream: null, _writer: null, _debug: false, _isInitialized: false, filename: "PrefetchDebugLog", fileExtension: ".txt", _isDebugMode: undefined, _initializationState: InitializationState.NotStarted, _logQueue: [], _flushInterval: 50, _logCounter: 0, _diskWriteInProgress: false, isDebug: function isDebug() {
if (this._isDebugMode === undefined)
this._isDebugMode = Platform.Process.isDebug();
return this._isDebugMode
}, getFileNameWithDate: function getFileNameWithDate(filename) {
var date=new Date;
var filenameWithDate=filename + "_" + date.getDate() + "_" + date.getMonth() + "_" + date.getYear() + "_" + date.getHours() + "_" + date.getMinutes() + "_" + date.getSeconds() + "_" + date.getMilliseconds();
return filenameWithDate
}, initialize: function initialize() {
if (!this.isDebug()) {
return WinJS.Promise.wrap({})
}
if (this._initializationState === InitializationState.Completed || this._initializationState === InitializationState.InProgress) {
this.log("Initialization called again even though prefetch manager is already initialized/ in process of initialization!");
return
}
this._initializationState = InitializationState.InProgress;
var that=this;
var fileNameWithDate=this.getFileNameWithDate(this.filename) + this.fileExtension;
var localFolder=Windows.Storage.ApplicationData.current.localFolder;
return localFolder.createFileAsync(fileNameWithDate, Windows.Storage.CreationCollisionOption.generateUniqueName).then(function(newFile) {
return newFile.openAsync(Windows.Storage.FileAccessMode.readWrite).then(function(stream) {
that._outputStream = stream.getOutputStreamAt(0);
that._writer = new Windows.Storage.Streams.DataWriter(that._outputStream);
that._initializationState = InitializationState.Completed;
that.log("Prefetch Logger initalized. Logs only in debug build!!! Current time: " + new Date)
})
});
this._initializationState = InitializationState.InProgress
}, log: function log(string) {
if (!this.isDebug()) {
return
}
this._logCounter++;
switch (this._initializationState) {
case InitializationState.NotStarted:
this.initialize();
this._logQueue.push(string);
break;
case InitializationState.InProgress:
this._logQueue.push(string);
break;
case InitializationState.Completed:
if (this._diskWriteInProgress === true) {
this._logQueue.push(string)
}
else {
while (this._logQueue.length > 0) {
this._writer.writeString(this._logQueue[0]);
this._writer.writeString("\r\n");
this._logQueue.shift()
}
this._writer.writeString(string);
this._writer.writeString("\r\n")
}
break;
default:
this._writer.writeString("Weird state of initialization");
this._writer.writeString("\r\n")
}
if (this._logCounter > this._flushInterval && this._diskWriteInProgress != true) {
this._diskWriteInProgress = true;
var that=this;
this._writer.storeAsync().then(function() {
that._diskWriteInProgress = false
});
this._logCounter = 0
}
}, close: function close() {
if (!this.isDebug()) {
return WinJS.Promise.wrap({})
}
while (this._logQueue.length > 0) {
this._writer.writeString(this._logQueue[0]);
this._writer.writeString("\r\n");
this._logQueue.shift()
}
;
this._logCounter = 0;
this._initializationState = InitializationState.NotStarted;
var that=this;
return this._writer.storeAsync().then(function() {
that._outputStream.flushAsync().then(function() {
that._writer.detachBuffer();
that._writer.detachStream();
that._writer.close();
that._outputStream.close()
})
})
}
})
})()