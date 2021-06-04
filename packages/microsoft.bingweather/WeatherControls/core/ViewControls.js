/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
WinJS.Namespace.define("WeatherAppJS.Controls.ViewControls", {ViewControlInterface: WinJS.Class.define(function ViewControlInterface_constructor(element, config) {
this._element = element ? element : document.createElement("div");
WinJS.Utilities.addClass(this._element, "weatherViewControl");
this._element.winControl = this;
this._config = config ? config : {}
}, {
_name: "WeatherAppJS.Controls.ViewControls.ViewControlInterface", _element: null, _config: null, element: {
set: function set(value) {
this._element = value
}, get: function get() {
return this._element
}
}, render: function render(response) {
WeatherAppJS.Controls.Utilities.interfaceException(this._name, "render function is undefined");
return WinJS.Promise.wrapError({message: "undefined render behaviour"})
}, cleanUp: function cleanUp() {
WeatherAppJS.Controls.Utilities.interfaceException(this._name, "cleanUp function is undefined")
}
})});
WinJS.Namespace.define("WeatherAppJS.Controls.ViewControls", {
WeatherMultiViewControl: WinJS.Class.derive(WeatherAppJS.Controls.ViewControls.ViewControlInterface, function WeatherMultiViewControl_constructor(element, config) {
WeatherAppJS.Controls.ViewControls.ViewControlInterface.call(this, element, config);
if (!this._validateConfig(this._config)) {
WeatherAppJS.Utilities.interfaceException(this._name, "invalid view control configuration")
}
}, {
_name: "WeatherAppJS.Controls.ViewControls.WeatherMultiViewControl", _isFirstRendering: true, _controls: null, _loadViewPromise: null, _validateConfig: function _validateConfig(config) {
return true
}, _isValidResponse: function _isValidResponse(response) {
return true
}, _adaptResponse: function _adaptResponse(response) {
return response
}, _refreshView: function _refreshView(response) {
return this._loadViewPromise
}, _createView: function _createView(response) {
var that=this;
var controlPromises=[];
var controlDiv;
that._controls = [];
return new WinJS.Promise(function(c, e, p) {
var templatePromise=CommonJS.loadModule(that._config.view.moduleInfo, response, that.element);
templatePromise.then(function(template) {
var controls=template.querySelectorAll(".WeatherViewControl");
for (var i=0; i < controls.length; i++) {
controlDiv = controls[i];
var viewOptions=controlDiv.getAttribute("data-weather-view");
var view=WeatherAppJS.Controls.Utilities.getViewConfig(viewOptions);
var config={view: view};
var controlPromise=WeatherAppJS.Controls.Utilities.createViewControlAsync(config, controlDiv);
controlPromise.then(function(control) {
that._controls.push(control)
});
controlPromises.push(controlPromise)
}
WinJS.Promise.join(controlPromises).then(function() {
c(that._controls)
})
})
}, function(e){})
}, _onRenderViewControlsComplete: function _onRenderViewControlsComplete(){}, _cleanupControls: function _cleanupControls() {
if (this._controls) {
for (var i=0, iLength=this._controls.length; i < iLength; i++) {
var control=this._controls[i];
if (control.cleanUp && typeof control.cleanUp === "function") {
control.cleanUp()
}
else {
WeatherAppJS.Controls.Utilities.interfaceException(this._name, "invalid view control")
}
}
this._controls = null
}
}, _renderViewControl: function _renderViewControl(control, data, previousControlRenderPromise) {
var previousPromise=previousControlRenderPromise ? previousControlRenderPromise : WinJS.Promise.wrap(true);
return previousPromise.then(function WeatherMultiViewControl_timeoutComplete() {
return control.render(data)
})
}, _renderViewControlsInOrder: function _renderViewControlsInOrder(controls, response) {
var that=this;
var previousControlRenderPromise=WinJS.Promise.wrap(true);
if (controls) {
for (var i=0, iLength=controls.length; i < iLength; i++) {
var control=controls[i];
if (control.render && typeof control.render === "function") {
var dataId=WeatherAppJS.Controls.Utilities.getDataId(control.element);
var viewData=dataId && response[dataId] ? response[dataId] : {};
previousControlRenderPromise = that._renderViewControl(control, viewData, previousControlRenderPromise)
}
else {
WeatherAppJS.Controls.Utilities.interfaceException(this._name, "invalid view control")
}
}
}
return previousControlRenderPromise
}, _renderViewControls: function _renderViewControls(controls, response) {
return this._renderViewControlsInOrder(controls, response)
}, _loadView: function _loadView(response) {
this._cleanupControls();
this._element.innerHTML = "";
this._loadViewPromise = this._createView(response, this._element);
return this._loadViewPromise
}, render: function render(response) {
var that=this;
if (!that._isValidResponse(response)) {
return WinJS.Promise.wrapError({message: "invalid response"})
}
response = this._adaptResponse(response);
return that._loadView(response).then(function WeatherMultiViewControl_loadViewCompleteHandler(controls) {
return that._renderViewControls(controls, response)
}).then(function WeatherMultiViewControl_renderViewControlsComplete() {
that._onRenderViewControlsComplete();
return WinJS.Promise.wrap(true)
})
}, cleanUp: function cleanUp() {
this._cleanupControls();
WeatherAppJS.Controls.Utilities.setObjectPropertiesToNull(this)
}
}), WeatherSingleViewControl: WinJS.Class.derive(WeatherAppJS.Controls.ViewControls.ViewControlInterface, function WeatherSingleViewControl_constructor(element, config) {
WeatherJS.Controls.ViewControls.ViewControlInterface.call(this, element, config);
WinJS.Utilities.addClass(this._element, "weatherSingleViewControl")
}, {
_name: "WeatherAppJS.Controls.ViewControls.WeatherSingleViewControl", render: function render(response) {
this._element.innerHTML = "";
var moduleInfo=that._config.view.moduleInfo;
if (moduleInfo) {
return WeatherAppJS.Controls.Utilities.loadModule(moduleInfo, response, this._element)
}
return WinJS.Promise.wrapError({message: "module Info not found"})
}, cleanUp: function cleanUp() {
WeatherAppJS.Controls.Utilities.setObjectPropertiesToNull(this)
}
})
})
})()