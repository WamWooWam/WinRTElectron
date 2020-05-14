/*  © Microsoft. All rights reserved. */
(function() {
var version=1.02;
function readStateFromStorage(identifier, market) {
var previewMode=PlatformJS.isDebug && NewsJS.StateHandler.instance.isPreviewModeEnabled;
return WinJS.Application.local.readText("state\\" + identifier + "." + market + (previewMode ? "_preview" : "")).then(function(contents) {
var stream={};
if (contents) {
try {
stream = JSON.parse(contents)
}
catch(ex) {
;
}
}
return (stream && stream.state && stream.version === version) ? stream.state : null
})
}
function setStateInStorage(identifier, market, state) {
var previewMode=PlatformJS.isDebug && NewsJS.StateHandler.instance.isPreviewModeEnabled ? true : false;
var contents={
state: state, version: version
};
var promise=WinJS.Application.local.writeText("state\\" + identifier + "." + market + (previewMode ? "_preview" : ""), JSON.stringify(contents));
WinJS.Application.checkpoint();
return promise
}
window.StateManager = {
get: readStateFromStorage, set: setStateInStorage
}
})()