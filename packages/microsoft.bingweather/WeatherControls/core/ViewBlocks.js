/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
WinJS.Namespace.define("WeatherAppJS.Controls.ViewBlocks", {ViewBlockBase: WinJS.Class.define(function ViewBlockBase_constructor(element, options) {
this._element = element || document.createElement("div");
WinJS.Utilities.addClass(this._element, "weatherViewBlock");
this._element.winControl = this;
this._config = options ? options : {}
}, {
_name: "WeatherAppJS.Controls.ViewBlocks.ViewBlockBase", _element: null, _viewPortElement: null, _config: null, element: {
set: function set(value) {
this._element = value
}, get: function get() {
return this._element
}
}, viewPortElement: {
set: function set(value) {
this._viewPortElement = value
}, get: function get() {
if (!this._viewPortElement) {
WeatherAppJS.Controls.Utilities.interfaceException(this._name, "_viewPortElement is undefined")
}
return this._viewPortElement
}
}, render: function render(response) {
WeatherAppJS.Controls.Utilities.interfaceException(this._name, "render function is undefined");
return WinJS.Promise.wrapError({message: "cleanUp function is undefined"})
}, cleanUp: function cleanUp() {
WeatherAppJS.Controls.Utilities.interfaceException(this._name, "cleanUp function is undefined")
}
})});
WinJS.Namespace.define("WeatherAppJS.Controls.ViewBlocks", {
WeatherChromeView: WinJS.Class.derive(WeatherAppJS.Controls.ViewBlocks.ViewBlockBase, function WeatherChromeView_constructor(element, options) {
WeatherAppJS.Controls.ViewBlocks.ViewBlockBase.call(this, element, options);
WinJS.Utilities.addClass(this._element, "weatherChromeViewBlock");
this._viewPortElement = WeatherAppJS.Controls.Utilities.createDivWithClassName("weatherChromeContainer");
this._element.appendChild(this._viewPortElement)
}, {
_name: "WeatherAppJS.Controls.ViewBlocks.WeatherChromeView", _isValidResponse: function _isValidResponse(response) {
return response ? true : false
}, _createView: function _createView(response) {
this.viewPortElement.innerHTML = "";
var moduleInfo=this._config.view.moduleInfo;
return WeatherAppJS.Controls.Utilities.loadModule(moduleInfo, response, this._viewPortElement, null, null)
}, _refreshView: function _refreshView(response) {
this.viewPortElement.innerHTML = "";
return this._createView(response)
}, render: function render(response) {
if (this._isValidResponse(response)) {
return this._createView(response)
}
return WinJS.Promise.wrapError({message: "invalid response"})
}, cleanUp: function cleanUp() {
WeatherAppJS.Controls.Utilities.setObjectPropertiesToNull(this)
}
}), WeatherItemsContainerView: WinJS.Class.derive(WeatherAppJS.Controls.ViewBlocks.ViewBlockBase, function WeatherItemsContainerView_constructor(element, options) {
WeatherAppJS.Controls.ViewBlocks.ViewBlockBase.call(this, element, options);
WinJS.Utilities.addClass(this._element, "weatherItemsContainerViewBlock");
this._listControl = this._createListControl(this._config);
this._viewPortElement = this._listControl.element;
this._element.appendChild(this._listControl.element);
this.locationName = WeatherAppJS.GeocodeCache.getLocation(options.currentIPage._locID).getFullDisplayName()
}, {
_name: "WeatherAppJS.Controls.ViewBlocks.WeatherItemsContainerView", _listControl: null, _listDataSource: null, _isFirstRendering: true, _setListControlOptions: function _setListControlOptions(control, options) {
var that=this;
WinJS.UI.setOptions(control, {
className: options && options.view.controlOptions.innerListContainerClass ? options.view.controlOptions.innerListContainerClass : "", onitemclick: function onitemclick(element) {
if (element && element.item) {
that._onItemClick.apply(that, [element, {data: element.item}])
}
}
})
}, _createListControl: function _createListControl(options) {
var control=new CommonJS.Immersive.ItemsContainer;
this._setListControlOptions(control, options);
return control
}, _onItemClick: function _onItemClick(element, item) {
if (!item || !item.data) {
return
}
if (item.data.clickTarget) {
PlatformJS.Navigation.navigateTo(item.data.clickTarget)
}
else if (item.data.clickHandler && typeof item.data.clickHandler === "function") {
item.data.clickHandler(item.data, element)
}
}, _createItem: function _createItem(itemConfig) {
return WeatherAppJS.Controls.Utilities.loadModule(itemConfig.moduleInfo, itemConfig.data, itemConfig.parentElement, null, null)
}, isValidResponse: function isValidResponse(response) {
return true
}, adaptResponse: function adaptResponse(response) {
return response
}, _createView: function _createView(response) {
var observableResponse=response;
if (!this._config.disableBinding) {
observableResponse = [];
for (var i=0, iLength=response.length; i < iLength; i++) {
observableResponse.push(WinJS.Binding.as(response[i]))
}
}
var bindingList=new WinJS.Binding.List(observableResponse);
this._listControl.itemDataSource = this._listDataSource = bindingList.dataSource;
return this._listControl.render()
}, render: function render(response) {
var that=this;
if (!that.isValidResponse(response)) {
return WinJS.Promise.wrapError({message: "invalid response"})
}
response = that.adaptResponse(response);
var renderViewPromise=that._createView(response);
return renderViewPromise.then(function WeatherItemsContainerView_renderViewComplete() {
return WinJS.Promise.wrap(true)
})
}, cleanUp: function cleanUp() {
this._listControl.dispose();
WeatherAppJS.Controls.Utilities.setObjectPropertiesToNull(this)
}
})
})
})()