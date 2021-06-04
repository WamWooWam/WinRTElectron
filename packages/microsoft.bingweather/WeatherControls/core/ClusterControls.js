/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
WinJS.Namespace.define("WeatherAppJS.Controls.Clusters", {
ClusterController: WinJS.Class.define(function ClusterController_constructor(element, config) {
if (!this._validateConfig(config)) {
WeatherAppJS.Controls.Utilities.interfaceException(this._name, "invalid cluster configuration")
}
WeatherAppJS.Controls.Utilities.writeProfilerMark(this._name, "constructor", "StartTM");
this._element = this.element = element ? element : document.createElement("div");
this.supportsContentRefresh = true;
WinJS.Utilities.addClass(this._element, "weatherClusterController");
this._config = config;
this._initializeModel(config);
this._initializeView(config);
this._hideTitleIfReq();
this._id = this._config.id ? this._config.id : "";
WeatherAppJS.Controls.Utilities.writeProfilerMark(this._name, "constructor", "StopTM")
}, {
_name: "WeatherAppJS.Controls.Clusters.ClusterController", _id: "WeatherAppJS.Controls.Clusters.ClusterController", _element: null, _config: null, element: null, _modelInstance: null, _viewHelper: null, _renderClusterPromise: null, _isFirstRefresh: true, _isDisposed: false, _validateConfig: function _validateConfig(config) {
if (!config || !config.model || !config.model.modelControl || !config.view) {
return false
}
return true
}, _initializeModel: function _initializeModel(config) {
var modelConfig=config.model;
this._modelInstance = PlatformJS.Utilities.createObject(modelConfig.modelControl, modelConfig.modelControlConfig);
if (!this._modelInstance) {
WeatherAppJS.Controls.Utilities.interfaceException(this._name, "unable to create model instance")
}
}, _cleanUpModel: function _cleanUpModel() {
if (this._modelInstance && typeof this._modelInstance.cleanUp === "function") {
return this._modelInstance.cleanUp()
}
}, _initializeView: function _initializeView(config) {
config.retryCallback = this._retryCallback.bind(this);
this._viewHelper = PlatformJS.Utilities.createObject("WeatherAppJS.Controls.Clusters.ClusterControllerViewHelper", this._element, config);
if (!this._viewHelper) {
WeatherAppJS.Controls.Utilities.interfaceException(this._name, "unable to create view instance")
}
}, _cleanUpView: function _cleanUpView() {
if (this._viewHelper && typeof this._viewHelper.cleanUp === "function") {
return this._viewHelper.cleanUp()
}
}, _hideTitleIfReq: function _hideTitleIfReq() {
var that=this;
if (!that._config.hideTitleUntilRender) {
return
}
var element=that._element;
var clusterNode=element.parentNode;
var titleNode=clusterNode ? clusterNode.querySelector(".platformClusterHeader") : null;
if (!titleNode) {
return
}
titleNode.style.visibility = "hidden";
that._isTitleHidden = true
}, _showTitleIfReq: function _showTitleIfReq() {
var that=this;
if (!that._isTitleHidden) {
return
}
var element=that._element;
var clusterNode=element.parentNode;
var titleNode=clusterNode ? clusterNode.querySelector(".platformClusterHeader") : null;
if (!titleNode) {
return
}
titleNode.style.visibility = "";
that._isTitleHidden = false
}, _retryCallback: function _retryCallback() {
this._refreshCluster()
}, _onClusterRenderComplete: function _onClusterRenderComplete(isDataRefreshed, isStaleData) {
if (isDataRefreshed) {
this.dispatchEvent(CommonJS.Immersive.ClusterControlRefreshedEvent, {isDataRefreshed: true})
}
else if (!(WeatherAppJS.Pages.DetailsPage.CityImpl._pushHourlyDuringWarmBoot && isStaleData)) {
this.dispatchEvent(CommonJS.Immersive.ClusterControlRefreshedEvent, {isDataRefreshed: false})
}
}, _fetchData: function _fetchData(params) {
if (this._modelInstance && typeof this._modelInstance.getData === "function") {
return this._modelInstance.getData(params)
}
WeatherAppJS.Controls.Utilities.interfaceException(this._name, "data model interface violation");
return WinJS.Promise.wrapError(null)
}, _renderView: function _renderView(response) {
if (this._viewHelper && typeof this._viewHelper.render === "function") {
return this._viewHelper.render(response)
}
WeatherAppJS.Controls.Utilities.interfaceException(this._name, "view helper interface violation");
return WinJS.Promise.wrapError({message: "invalid view helper"})
}, _renderCluster: function _renderCluster(isDataRefreshed) {
var that=this;
var isStaleData=false;
CommonJS.Progress.showProgress(CommonJS.Progress.headerProgressType);
WeatherAppJS.Controls.Utilities.writeProfilerMark(that._name, "_renderCluster", "StartTM");
var p=new WinJS.Promise(function ClusterController_renderClusterInit(complete, error) {
WeatherAppJS.Controls.Utilities.writeProfilerMark(that._name, "_fetchData", "StartTM");
that._renderClusterPromise = that._fetchData().then(function ClusterController_fetchDataCompleteHandler(response) {
WeatherAppJS.Controls.Utilities.writeProfilerMark(that._name, "_fetchData", "StopTM");
WeatherAppJS.Controls.Utilities.writeProfilerMark(that._name, "_renderView", "StartTM");
if (that._config.clusterKey === "cluster002" && WeatherAppJS.Utilities.Common.isStale(response._currentConditions.lastUpdatedTime, WeatherAppJS.WarmBoot.Cache.getString("TimeBeforeStale"))) {
isStaleData = true
}
return that._renderView(response)
}, function ClusterController_fetchDataErrorHandler(errorResponse) {
if (WeatherAppJS.Controls.Utilities.isCancellationError(errorResponse)) {
return WinJS.Promise.wrapError(errorResponse)
}
return that._renderView(errorResponse)
}, function ClusterController_fetchDataProgressHandler(response) {
return that._renderView(response)
}).then(function ClusterController_renderViewCompleteHandler() {
WeatherAppJS.Controls.Utilities.writeProfilerMark(that._name, "_renderView", "StopTM");
that._showTitleIfReq();
that._onClusterRenderComplete(isDataRefreshed, isStaleData);
WeatherAppJS.Controls.Utilities.writeProfilerMark(that._name, "_renderCluster", "StopTM");
complete(true);
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType)
}, function ClusterController_renderViewErrorHandler(errorMessage) {
that._removeCluster();
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
if (WeatherAppJS.Controls.Utilities.isCancellationError(errorMessage)) {
return
}
complete(false);
WeatherAppJS.Controls.Utilities.interfaceException(that._name, "something has gone wrong while rendering")
})
}, function() {
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
WeatherAppJS.Controls.Utilities.cancelPromise(that._renderClusterPromise)
});
return p
}, _refreshCluster: function _refreshCluster() {
this._isFirstRefresh = false;
return this._renderCluster()
}, render: function render(isDataRefreshed) {
if (this._isDisposed) {
return
}
return this._renderCluster(isDataRefreshed)
}, _removeCluster: function _removeCluster() {
var that=this;
var clusterKey=that._config.clusterKey;
if (clusterKey && that._config.currentIPage && that._config.currentIPage._data) {
that.dispose();
var clusters=that._config.currentIPage._data;
for (var i=0; i < clusters.length; i++) {
if (clusters.getItem(i).data.clusterKey === clusterKey) {
clusters.splice(i, 1);
break
}
}
}
return
}, dispose: function dispose() {
this.cleanUp()
}, cleanUp: function cleanUp() {
var that=this;
if (that._isDisposed) {
return
}
that._isDisposed = true;
var name=that._name;
WeatherAppJS.Controls.Utilities.writeProfilerMark(name, "cleanUp", "StartTM");
WeatherAppJS.Controls.Utilities.cancelPromise(this._renderClusterPromise);
that._element.innerHTML = "";
this._cleanUpModel();
this._cleanUpView();
WeatherAppJS.Controls.Utilities.writeProfilerMark(name, "cleanUp", "StopTM")
}
}), ClusterControllerViewHelper: WinJS.Class.define(function ClusterControllerViewHelper_constructor(element, config) {
if (!this._validateConfig(config) || !element) {
WeatherAppJS.Controls.Utilities.interfaceException(this._name, "invalid cluster view helper configuration")
}
this._element = element ? element : document.createElement("div");
this._config = config
}, {
_name: "WeatherAppJS.Controls.Clusters.ClusterControllerViewHelper", _element: null, _config: null, _viewPortElement: null, _isFirstRendering: true, _viewControl: null, _loadViewPromise: null, _validateConfig: function _validateConfig(config) {
if (!config || !config.retryCallback) {
return false
}
return true
}, _validateResponseAsync: function _validateResponseAsync(response) {
return WinJS.Promise.wrap(response)
}, _cleanupViewControl: function _cleanupViewControl(control) {
if (control && typeof control.cleanUp === "function") {
control.cleanUp()
}
}, _renderViewControl: function _renderViewControl(control, data) {
if (control && typeof control.render === "function") {
return control.render(data)
}
return WinJS.Promise.wrapError({message: "invalid view control"})
}, _createViewControlAsync: function _createViewControlAsync(config, element) {
return WeatherAppJS.Controls.Utilities.createViewControlAsync(config, element)
}, _loadView: function _loadView(response) {
this._cleanupViewControl(this._viewControl);
this._element.innerHTML = "";
this._viewPortElement = WeatherAppJS.Controls.Utilities.createDivWithClassName("weatherClusterViewBlock");
this._element.appendChild(this._viewPortElement);
this._loadViewPromise = this._createViewControlAsync(this._config, this._viewPortElement);
return this._loadViewPromise
}, _onRenderViewControlComplete: function _onRenderViewControlComplete(){}, _onRenderViewControlsError: function _onRenderViewControlsError(errorResponse) {
this._element.innerHTML = ""
}, _loadErrorModule: function _loadErrorModule(errorResponse) {
var errorModule=CommonJS.Error.getErrorModuleItem(WinJS.Utilities.markSupportedForProcessing(this._config.retryCallback));
if (errorModule) {
errorModule.errorContainerClassName += " weatherErrorItem";
errorModule.message = PlatformJS.Services.resourceLoader.getString("CouldNotLoadDataMsg");
if (!WeatherAppJS.Networking.isInternetAvailable) {
errorModule.errorContainerClassName += " weatherErrorItemOffline"
}
this._viewPortElement = WeatherAppJS.Controls.Utilities.createDivWithClassName("weatherClusterErrorViewBlock");
this._element.appendChild(this._viewPortElement);
return WeatherAppJS.Controls.Utilities.loadModule(errorModule.moduleInfo, errorModule, this._viewPortElement, null, null).then(function ClusterViewHelper_loadErrorModuleComplete(fragment) {
return WinJS.Resources.processAll(fragment)
})
}
return WinJS.Promise.wrapError(errorResponse)
}, render: function render(response) {
var that=this;
return that._validateResponseAsync(response).then(function ClusterControllerViewHelper_validateResponseComplete() {
return that._loadView(response)
}).then(function ClusterControllerViewHelper_loadViewCompleteHandler(viewControl) {
that._viewControl = viewControl;
return that._renderViewControl(viewControl, response)
}).then(function ClusterControllerViewHelper_renderViewControlsCompleteHandler() {
that._isFirstRendering = false;
that._onRenderViewControlComplete();
return WinJS.Promise.wrap(response)
})
}, cleanUp: function cleanUp() {
this._cleanupViewControl(this._viewControl);
WeatherAppJS.Controls.Utilities.setObjectPropertiesToNull(this)
}
})
});
WinJS.Class.mix(WeatherAppJS.Controls.Clusters.ClusterController, WinJS.Utilities.createEventProperties(CommonJS.Immersive.ClusterControlRefreshedEvent), WinJS.UI.DOMEventMixin)
})()