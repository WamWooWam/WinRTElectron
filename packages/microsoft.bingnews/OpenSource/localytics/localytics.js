/*  © Microsoft. All rights reserved. */
/*!
 * Localytics HTML5/JavaScript Library
 * Copyright (C) 2009 Char Software Inc., DBA Localytics
 * 
 * This code is provided under the Localytics Modified BSD License.
 * A copy of this license is available at
 * http://www.localytics.com/docs/opensourceinfo/#license-documentation
 * 
 * Please visit www.localytics.com for more information.
 */
var LocalyticsSession=function(namespace) {
namespace = (namespace == null) ? "" : namespace + "_";
return (function() {
var CALLBACK_METHOD="localyticsSession.__callback__";
var LIB_VERSION="html5_2.3";
var MAX_UPLOAD_LENGTH=64000;
var PUBLIC_METHODS=['init', 'open', 'close', 'tagEvent', 'tagScreen', 'tagEvent', 'upload'];
var appKey;
var sessionTimeoutSeconds=30;
var closePollingTimeout=10000;
var uploadTimeout=60000;
var logger=false;
var appVersion;
var networkCarrier;
var maxLocalStorageSize=100000;
var ref={};
var INSTALL_UUID="__ll_" + namespace + "iu";
var EVENT_STORE="__ll_" + namespace + "es";
var CURRENT_HEADER="__ll_" + namespace + "ch";
var DEVICE_BIRTH_TIME="__ll_" + namespace + "pa";
var CURRENT_SESSION_UUID="__ll_" + namespace + "csu";
var CURRENT_SESSION_OPEN_TIME="__ll_" + namespace + "cst";
var CURRENT_SESSION_INDEX="__ll_" + namespace + "csi";
var CURRENT_SEQUENCE_INDEX="__ll_" + namespace + "csq";
var CURRENT_SESSION_IS_OPEN="__ll_" + namespace + "cso";
var UPLOAD_BUCKET="__ll_" + namespace + "ub";
var LAST_OPEN_TIME="__ll_" + namespace + "lot";
var LAST_CLOSE_TIME="__ll_" + namespace + "lct";
var CHARS_STORED="__ll_" + namespace + "chs";
var SCREEN_FLOWS="__ll_" + namespace + "fl";
var LOCALYTICS_CONSTANTS=[INSTALL_UUID, EVENT_STORE, CURRENT_HEADER, DEVICE_BIRTH_TIME, CURRENT_SESSION_UUID, CURRENT_SESSION_OPEN_TIME, CURRENT_SESSION_INDEX, CURRENT_SEQUENCE_INDEX, CURRENT_SESSION_IS_OPEN, UPLOAD_BUCKET, LAST_CLOSE_TIME, CHARS_STORED, SCREEN_FLOWS];
var SCRIPT_LOADED_PATTERN=/loaded|complete/;
var installUUID;
var eventStore;
var currentHeader;
var deviceBirthTime;
var currentSessionUUID;
var currentSessionOpenTime;
var currentSessionIndex;
var currentSequenceIndex;
var currentSessionIsOpen;
var uploadBucket;
var lastCloseTime;
var lastOpenTimeSeconds;
var charsStored;
var screenFlows;
var pollReference;
var uploadTime=[];
var storage;
var logFn=function(o) {
console.log(o)
};
var emptyFn=function(o) {
return
};
var log=emptyFn;
if (typeof(console) === "undefined") {
console = {}
}
if (console.log === undefined) {
console.log = function(){}
}
ref._switchLogger = function(on) {
log = on ? logFn : emptyFn
};
try {
if (localStorage.getItem) {
storage = window.localStorage
}
}
catch(e) {
log("Local Storage not supported!")
}
var userAgent=navigator.userAgent;
ref._getStore = function(key, parseJSON) {
if (storage) {
var ls=storage.getItem(key),
store;
if (ls != null) {
try {
if (parseJSON) {
store = JSON.parse(ls)
}
else {
store = ls
}
}
catch(err) {
log("Error parsing JSON from localStorage." + key)
}
}
return store
}
};
var writeCount=function(count) {
var oldLen=(ref._getStore(CHARS_STORED, false) || "").length;
var newLen=("" + count).length;
var delta=newLen - oldLen;
count += delta;
try {
storage.setItem(CHARS_STORED, count);
charsStored = count;
return count
}
catch(e) {
return undefined
}
};
var initStore=function() {
charsStored = generateCurrentStorageSize();
writeCount(charsStored)
};
ref._writeStore = function(key, o) {
if (storage) {
var oldSize,
newSize,
delta,
jsonStr,
curChars;
if (charsStored === undefined) {
charsStored = ref._getStore(CHARS_STORED, true);
if (!charsStored) {
initStore()
}
}
oldSize = ref._getStore(key, false);
oldSize = oldSize ? oldSize.length : 0;
try {
if (o == null) {
writeCount(charsStored - oldSize);
storage.removeItem(key)
}
else {
jsonStr = JSON.stringify(o);
newSize = jsonStr.length;
delta = newSize - oldSize;
if (delta) {
curChars = charsStored + delta;
if (delta < 0) {
if (writeCount(curChars) !== undefined) {
storage.setItem(key, jsonStr)
}
else {
log("Write aborted: delta was negative, but unable to update storage");
return undefined
}
}
else {
curChars += ("" + curChars).length - ("" + charsStored).length;
if (curChars < maxLocalStorageSize && (writeCount(curChars) !== undefined)) {
storage.setItem(key, jsonStr)
}
else {
log("Write aborted: writing would exceed storage limits");
return undefined
}
}
}
else {
storage.setItem(key, jsonStr)
}
}
return o
}
catch(e) {
log("Write to localStorage failed by exception.");
return undefined
}
}
};
var appendToStore=function(o) {
if (!eventStore) {
log("No event store found, searching localStorage");
eventStore = ref._getStore(EVENT_STORE, true);
if (!eventStore) {
log("No event storage in localStorage found, creating an empty array");
eventStore = []
}
}
log("Pushing event to event store");
eventStore.push(o);
ref._writeStore(EVENT_STORE, eventStore)
};
var winJSXHRSend=function(jsonData) {
var url="http:" + ref.__url__ + "api/v2/applications/" + encodeURIComponent(appKey) + "/uploads";
WinJS.xhr({
url: url, type: "POST", data: jsonData, headers: {"Content-Type": "application/json"}
}).done(ref.__callback__, ref.__callback__)
};
var jsonpSend=function(jsonData) {
var script=document.createElement("script"),
head=document.head || document.getElementsByTagName("head")[0] || document.documentElement,
src=ref.__url__ + "api/v2/applications/" + encodeURIComponent(appKey) + "/uploads?callback=" + CALLBACK_METHOD + "&client_date=" + ((new Date).getTime()) + "&data=" + encodeURIComponent(jsonData);
log("Uploading blob: \n" + jsonData);
log("Request length: " + src.length);
if (src.length > MAX_UPLOAD_LENGTH) {
log("Upload length exceeds maximum supported length.  Deleting data without uploading.");
ref._clearStoredUploads();
return
}
script.async = "async";
script.src = src;
script.onload = function() {
if (!script.readyState || SCRIPT_LOADED_PATTERN.test(script.readyState)) {
log("Unloading script tag from header");
script.onload = null;
if (head && script.parentNode) {
head.removeChild(script)
}
script = undefined
}
};
head.insertBefore(script, head.firstChild)
};
ref._send = (function() {
if (typeof WinJS !== 'undefined' && typeof WinJS.xhr === 'function') {
return function(jsonData) {
winJSXHRSend(jsonData)
}
}
else {
return function(jsonData) {
jsonpSend(jsonData)
}
}
}());
var generateCurrentStorageSize=function() {
var i,
len,
sum=0,
store;
for (i = 0, len = LOCALYTICS_CONSTANTS.length; i < len; i += 1) {
store = ref._getStore(LOCALYTICS_CONSTANTS[i], false);
if (store && store.length) {
sum += store.length
}
}
return sum
};
var generateUUID=function() {
var s4=function() {
return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
};
return (s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4())
};
var generateClientTime=function() {
return (new Date).getTime() / 1000 | 0
};
var generateClientTimeInMillis=function() {
return (new Date).getTime()
};
var generateFalse=function() {
return false
};
var generateArray=function() {
return []
};
var generateString=function() {
return ""
};
var generateZero=function() {
return 0
};
ref._getOrCreateProperty = function(property, key, generator, clear) {
if (clear) {
property = generator();
ref._writeStore(key, property)
}
else if (property == null) {
property = ref._getStore(key, true);
if (!property) {
property = generator();
ref._writeStore(key, property)
}
}
return property
};
var getInstallUUID=function() {
installUUID = ref._getOrCreateProperty(installUUID, INSTALL_UUID, generateUUID, false);
return installUUID
};
var getCurrentSessionUUID=function(clear) {
currentSessionUUID = ref._getOrCreateProperty(currentSessionUUID, CURRENT_SESSION_UUID, generateUUID, clear);
return currentSessionUUID
};
var getCurrentSessionOpenTime=function(clear) {
currentSessionOpenTime = ref._getOrCreateProperty(currentSessionOpenTime, CURRENT_SESSION_OPEN_TIME, generateClientTime, clear);
return currentSessionOpenTime
};
var getBirthDate=function() {
deviceBirthTime = ref._getOrCreateProperty(deviceBirthTime, DEVICE_BIRTH_TIME, generateClientTime, false);
return deviceBirthTime
};
ref._getSessionIndex = function() {
currentSessionIndex = ref._getOrCreateProperty(currentSessionIndex, CURRENT_SESSION_INDEX, generateZero, false);
return currentSessionIndex
};
var incrementCurrentSessionIndex=function() {
ref._getSessionIndex();
currentSessionIndex += 1;
ref._writeStore(CURRENT_SESSION_INDEX, currentSessionIndex);
return currentSessionIndex
};
var getAndIncrementSequenceNum=function() {
currentSequenceIndex = ref._getOrCreateProperty(currentSequenceIndex, CURRENT_SEQUENCE_INDEX, generateZero, false);
currentSequenceIndex += 1;
ref._writeStore(CURRENT_SEQUENCE_INDEX, currentSequenceIndex);
return currentSequenceIndex
};
var getCurrentSessionIsOpen=function() {
currentSessionIsOpen = ref._getOrCreateProperty(currentSessionIsOpen, CURRENT_SESSION_IS_OPEN, generateFalse, false);
return currentSessionIsOpen
};
ref._getOSVersion = function(userAgent) {
var parts=userAgent.split(/[)]?\s[(]?/),
i,
j,
k,
result,
matched,
major,
minor,
len=parts.length,
os=parts[1];
if (userAgent.match(/iPhone|iPad|iPod/)) {
matched = userAgent.match(/OS (\d+)\D(\d+)/);
if (matched && matched.length === 3) {
result = 'iOS ' + matched[1] + '.' + matched[2]
}
}
else if (os && os.match(/Macintosh/)) {
for (i = 2; i < len; i++) {
if (parts[i] == 'OS') {
var start=i - 1,
end=i + 2;
for (j = i - 1; j > 1; j--) {
if (parts[j].substr(-1) === ';' || parts[j] === 'Intel' || parts[j] === 'CPU') {
start = j + 1;
break
}
}
for (j = i + 1; j < i + 4; j++) {
if (parts[j].substr(-1) === ';') {
end = j;
break
}
else if (parts[j] === 'like') {
end = j - 1;
break
}
}
result = parts.splice(start, end - (start - 1)).join(' ');
result = result.replace(';', '').replace('_', '.').replace(/_\d$/, '').replace('Mac ', '');
break
}
}
}
else if (/^Android/.test(parts[3])) {
result = (parts[3] + ' ' + parts[4]).replace(';', '')
}
else if (matched = userAgent.match(/Windows NT (\d)\.(\d)/)) {
if (matched.length > 2) {
major = matched[1];
minor = matched[2];
if (major === '6' && minor === '2') {
result = 'Windows 8'
}
else if (major === '6' && minor === '1') {
result = 'Windows 7'
}
else if (major === '6' && minor === '0') {
result = 'Windows Vista'
}
else if (major === '5' && minor === '1') {
result = 'Windows XP'
}
else if (major === '5' && minor === '0') {
result = 'Windows 2000'
}
else if (major === '5' && minor === '2') {
result = 'Windows Server 2003'
}
}
}
else if (userAgent.match(/SymbOS/)) {
result = 'SymbOS'
}
else if (userAgent.match(/BlackBerry/) && (matched = userAgent.match(/Version\/(\d+)\./))) {
result = 'BlackBerry ' + matched[1]
}
return result
};
ref._generateHeader = function() {
log("Generating a new header");
var language=(navigator.language || navigator.userLanguage || '').toUpperCase();
var country;
if (language) {
if (language.match(/-/)) {
var parts=language.split(/-/);
language = parts[0];
country = parts[1]
}
else {
country = userAgent.match(new RegExp("^.*?\\(.*?" + language + "-(\\w\\w).*?\\).*?$", 'i'));
country = country && country[1]
}
}
var devicePlatform=navigator.platform,
deviceMake=navigator.vendor,
deviceModel=navigator.platform,
header={
dt: "h", pa: getBirthDate(), seq: getAndIncrementSequenceNum(), u: generateUUID()
},
attrs={
dt: "a", au: appKey, iu: getInstallUUID(), lv: LIB_VERSION, ua: userAgent
};
if (deviceModel) {
attrs.dmo = deviceModel
}
if (devicePlatform) {
attrs.dp = devicePlatform
}
if (language) {
attrs.dll = language
}
var osVersion=ref._getOSVersion(userAgent);
if (osVersion) {
attrs.dov = osVersion
}
if (appVersion) {
attrs.av = appVersion
}
if (networkCarrier) {
attrs.nc = networkCarrier
}
if (country) {
attrs.dc = country.toUpperCase()
}
if (deviceMake) {
attrs.dma = deviceMake
}
header.attrs = attrs;
return header
};
var getHeader=function(clear) {
currentHeader = ref._getOrCreateProperty(currentHeader, CURRENT_HEADER, ref._generateHeader, clear);
return currentHeader
};
var beginPollingForCloses=function() {
if (!pollReference) {
log("Beginning to poll for closes");
pollReference = window.setTimeout(pollForCloses, closePollingTimeout)
}
else {
log("Already polling.")
}
};
var stopPollingForCloses=function() {
if (pollReference) {
log("Stopping close polling");
window.clearTimeout(pollReference);
pollReference = null
}
else {
log("No polling to stop")
}
};
var pollForCloses=function() {
ref._markNewClose();
pollReference = window.setTimeout(pollForCloses, closePollingTimeout)
};
ref._markNewClose = function() {
log("Marking a new close.");
lastCloseTime = (new Date).getTime();
return ref._writeStore(LAST_CLOSE_TIME, lastCloseTime)
};
var generateClose=function() {
lastCloseTime = ref._getOrCreateProperty(lastCloseTime, LAST_CLOSE_TIME, generateClientTimeInMillis, false);
screenFlows = ref._getOrCreateProperty(screenFlows, SCREEN_FLOWS, generateArray, false);
var closeTime=(lastCloseTime / 1000) | 0;
var openTime=getCurrentSessionOpenTime();
var sessionLength=closeTime - openTime;
var closeJSON={
dt: "c", u: generateUUID(), ss: openTime, su: getCurrentSessionUUID(), ct: closeTime, ctl: sessionLength, cta: sessionLength
};
if (screenFlows.length > 0) {
closeJSON.fl = screenFlows
}
return closeJSON
};
var finalizeClose=function() {
log("Finalizing close with last polled close");
stopPollingForCloses();
appendToStore(generateClose());
screenFlows = [];
ref._writeStore(SCREEN_FLOWS, screenFlows);
ref._writeStore(CURRENT_SESSION_IS_OPEN, false)
};
ref._clearStoredUploads = function() {
uploadBucket = null;
ref._writeStore(UPLOAD_BUCKET, uploadBucket)
};
ref._init = function(app_uuid, options) {
var v;
appKey = app_uuid;
if (options) {
if (options.polling != null) {
if (!options.polling) {
closePollingTimeout = 0
}
else {
closePollingTimeout = +options.polling
}
}
if (options.uploadTimeout) {
uploadTimeout = options.uploadTimeout
}
if (options.appVersion) {
appVersion = "" + options.appVersion
}
else if (typeof Windows !== 'undefined') {
try {
v = Windows.ApplicationModel.Package.current.id.version;
appVersion = [v.major, v.minor, v.build, v.revision].join('.')
}
catch(e) {}
}
if (options.carrier) {
networkCarrier = "" + options.carrier
}
if (options.sessionTimeoutSeconds != null) {
if (!options.sessionTimeoutSeconds) {
sessionTimeoutSeconds = 0
}
else {
sessionTimeoutSeconds = +options.sessionTimeoutSeconds
}
}
else if (options.timeout != null) {
if (!options.timeout) {
sessionTimeoutSeconds = 0
}
else {
sessionTimeoutSeconds = (+options.timeout) / 1000
}
}
if (options.storage != null) {
if (!options.storage) {
maxLocalStorageSize = 0
}
else {
maxLocalStorageSize = +options.storage
}
}
if (options.logger != null) {
logger = !!options.logger
}
ref._switchLogger(logger)
}
initStore();
getHeader(true);
log("LocalyticsSession successfully initialized")
};
ref._open = function() {
var openObject;
lastCloseTime = ref._getStore(LAST_CLOSE_TIME, true) || 0;
if (((new Date).getTime() - lastCloseTime) < (1000 * sessionTimeoutSeconds)) {
log("Open called within timeout, resuming last session.")
}
else {
if (getCurrentSessionIsOpen()) {
finalizeClose()
}
incrementCurrentSessionIndex();
var sessionOpenTimeSeconds=getCurrentSessionOpenTime(true);
openObject = {
dt: "s", ct: sessionOpenTimeSeconds, u: getCurrentSessionUUID(true), nth: ref._getSessionIndex()
};
lastOpenTimeSeconds = lastOpenTimeSeconds || ref._getStore(LAST_OPEN_TIME, true) || 0;
if (lastOpenTimeSeconds && lastOpenTimeSeconds != 0) {
var timeSinceLastOpen=sessionOpenTimeSeconds - lastOpenTimeSeconds;
if (timeSinceLastOpen >= 1) {
openObject['sl'] = Math.round(timeSinceLastOpen)
}
}
lastOpenTimeSeconds = ref._writeStore(LAST_OPEN_TIME, sessionOpenTimeSeconds);
appendToStore(openObject);
currentSessionIsOpen = true;
ref._writeStore(CURRENT_SESSION_IS_OPEN, currentSessionIsOpen);
log("Appended open tag to event store")
}
if (closePollingTimeout) {
beginPollingForCloses()
}
else {
log("Polling timeout was set to 0; no close polling will be done.")
}
};
ref._tagEvent = function(eventName, attributes) {
if (!getCurrentSessionIsOpen()) {
log("Cannot tag event: either no session was opened, or it was already closed");
return
}
var s,
ea;
var eventObject={
dt: "e", ct: generateClientTime(), u: generateUUID(), su: getCurrentSessionUUID(), n: "" + eventName
};
if (attributes) {
ea = {};
for (s in attributes) {
if (attributes.hasOwnProperty(s)) {
ea[s] = "" + attributes[s]
}
}
eventObject.attrs = ea
}
appendToStore(eventObject);
log("Tagged event: '" + eventName + "' with attributes (JSON): '" + JSON.stringify(ea) + "'")
};
ref._tagScreen = function(screenName) {
if (!getCurrentSessionIsOpen()) {
log("Cannot tag screen: either no session was opened, or it was already closed");
return
}
screenFlows = ref._getOrCreateProperty(screenFlows, SCREEN_FLOWS, generateArray, false);
var len=screenFlows.length || 0;
var name="" + screenName;
if (screenFlows[len - 1] !== name) {
screenFlows.push(name);
ref._writeStore(SCREEN_FLOWS, screenFlows)
}
};
ref._close = function() {
if (!getCurrentSessionIsOpen()) {
log("Cannot close session: either no session was opened, or it was already closed");
return
}
stopPollingForCloses();
ref._markNewClose()
};
ref._upload = function() {
if (uploadTime.length > 0) {
if (((new Date).getTime() - uploadTime[0]) > uploadTimeout) {
console.log("Upload in progress, returning");
return
}
else {
uploadTime = []
}
}
eventStore = ref._getOrCreateProperty(eventStore, EVENT_STORE, generateArray, false);
uploadBucket = ref._getOrCreateProperty(uploadBucket, UPLOAD_BUCKET, generateString, false);
if ((!eventStore || eventStore.length === 0) && !uploadBucket) {
log("Nothing to upload, returning.");
return
}
var uploadObjects=eventStore.splice(0);
var blob="";
var i;
var len;
uploadObjects.unshift(getHeader(false));
for (i = 0, len = uploadObjects.length; i < len; i += 1) {
blob += JSON.stringify(uploadObjects[i]) + '\n'
}
uploadBucket += blob;
ref._writeStore(UPLOAD_BUCKET, uploadBucket);
eventStore = null;
ref._writeStore(EVENT_STORE, eventStore);
ref._send(uploadBucket);
getHeader(true)
};
ref.__callback__ = function(response) {
var rc=+(response.response_code || response.status);
uploadTime = [];
log("Callback called with response:");
if (rc) {
log("Response code: " + rc);
if (rc === 202 || rc === 200) {
log("Upload succeeded, clearing uploaded items.");
ref._clearStoredUploads()
}
else if (rc >= 400 && rc > 500) {
log("Response was 4XX, clearing items");
ref._clearStoredUploads()
}
else if (response.message) {
log("Upload failed with message:");
log(response.message)
}
}
};
ref.__url__ = "//analytics.localytics.com/";
var fallBackToSafe=function(fnName, e) {
console.log("> Call to Localytics client library failed .");
console.log("> localyticsSession." + fnName + " failed .");
console.log("> " + e);
console.log(e);
for (var fnName in PUBLIC_METHODS) {
ref[fnName] = emptyFn
}
};
(function() {
var i,
fnName,
len=PUBLIC_METHODS.length;
for (i = 0; i < len; i++) {
fnName = PUBLIC_METHODS[i];
ref[fnName] = (function(fn) {
return function() {
try {
ref['_' + fn].apply(ref, arguments)
}
catch(e) {
fallBackToSafe(fn, e)
}
}
})(fnName)
}
})();
return ref
})()
}