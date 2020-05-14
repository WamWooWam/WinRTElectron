/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
var SemanticZoomPanorama=WinJS.Class.derive(CommonJS.Immersive.SemanticZoomPanorama, function(element, options) {
CommonJS.Immersive.SemanticZoomPanorama.call(this, element, options)
}, {_createOrchestrator: function _createOrchestrator(item, priorityModifier, isItemVisibleFn, id) {
if (CommonJS.commonSchedulerEnabled) {
return CommonJS.Immersive.Panorama.prototype._createOrchestrator.call(this, item, priorityModifier, isItemVisibleFn, id)
}
else {
return new NewsApp.Orchestration.ViewportOrchestrationProxy(this._panel, item)
}
}});
WinJS.Namespace.define("NewsApp.Panorama", {SemanticZoomPanorama: SemanticZoomPanorama})
})()