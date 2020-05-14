/*  © Microsoft. All rights reserved. */
(function(WinJS) {
var _events=["rendercompeted", "renderstarted", "iteminvoked"];
WinJS.Namespace.define("NewsJS.Customization", {TilesPanel: WinJS.Class.define(function(element, options) {
if (!element)
throw"element must be provided";
options = options || {};
this._element = element;
this._element.winControl = this;
WinJS.UI.setOptions(this, options);
this._buildVisualTree();
this._renderTemplatesFragment();
this._onResizeCallBack = this._onResize.bind(this);
CommonJS.WindowEventManager.addEventListener(CommonJS.WindowEventManager.Events.WINDOW_RESIZE, this._onResizeCallBack, false)
}, {
_element: null, _dataSource: null, _isBrowse: false, _loadTileTemplatePromise: null, _template: null, _templateWithToggle: null, _fillerTemplate: null, _baseTemplate: null, _buildVisualTree: function _buildVisualTree() {
this._clickHandler = this._click.bind(this);
this._element.addEventListener("click", this._clickHandler, false)
}, _onResize: function _onResize(evt) {
if (window.innerWidth <= 600) {
this._element.parentElement.scrollLeft = 0
}
}, _click: function _click(evt) {
if (evt.srcElement.tagName === "BUTTON") {
var detail={};
detail.id = evt.srcElement.attributes["data-source"].value;
detail.element = evt.srcElement;
if (!this._isBrowse) {
detail.selected = WinJS.Utilities.hasClass(evt.srcElement, "selected")
}
this.dispatchEvent("iteminvoked", detail)
}
}, _setTemplate: function _setTemplate() {
this._templateWithToggle = document.getElementById("tileTemplateWithToggle");
this._fillerTemplate = document.getElementById("fillerTileTemplate");
this._baseTemplate = document.getElementById("tileTemplate");
if (this._isBrowse) {
if (this._baseTemplate && this._baseTemplate.winControl) {
this._template = this._baseTemplate.winControl
}
}
else {
if (this._templateWithToggle && this._templateWithToggle.winControl) {
this._template = this._templateWithToggle.winControl
}
}
if (this._fillerTemplate && this._fillerTemplate.winControl) {
this._fillerTemplate = this._fillerTemplate.winControl
}
return this._template
}, _renderTemplatesFragment: function _renderTemplatesFragment() {
var that=this;
this._loadTileTemplatePromise = WinJS.UI.Fragments.renderCopy("/customization/tilespanel.html", this._element.parentElement);
this._loadTileTemplatePromise.then(function(fragment) {
WinJS.UI.processAll(fragment)
})
}, _renderItems: function _renderItems(source) {
var that=this,
promises=[],
panel=document.createDocumentFragment(),
template=this._template,
fillerTemplate=this._fillerTemplate,
addedString=CommonJS.resourceLoader.getString("Added"),
sourceLength=source.length;
if (!template || !fillerTemplate) {
return WinJS.Promise.wrap()
}
for (var i=0; i < sourceLength; i++) {
source[i].data.added = addedString;
if (source[i].data.hideToggle) {
promises.push(this._baseTemplate.winControl.render(source[i].data))
}
else {
promises.push(template.render(source[i].data))
}
}
for (var j=0; j < 10; j++) {
promises.push(fillerTemplate.render())
}
return WinJS.Promise.join(promises).then(function(elements) {
for (var i=0, ilen=elements.length; i < ilen; i++) {
var element=elements[i].children[0];
panel.appendChild(element)
}
that._element.appendChild(panel)
})
}, element: {get: function get() {
return this._element
}}, loadTileTemplatePromise: {get: function get() {
return this._loadTileTemplatePromise
}}, isBrowse: {
get: function get() {
return this._isBrowse
}, set: function set(v) {
this._isBrowse = v;
this._setTemplate()
}
}, dataSource: {
get: function get() {
return this._dataSource
}, set: function set(v) {
this._dataSource = v;
var that=this;
WinJS.Utilities.empty(this._element);
if (v && v.length && v.length > 0) {
this._renderItems(v).then(function(){})
}
}
}, showErrorMessage: function showErrorMessage(message) {
this._element.innerHTML = "";
var errorDiv=document.createElement("div");
WinJS.Utilities.addClass(errorDiv, "tilesPanelError");
errorDiv.innerText = message;
this._element.appendChild(errorDiv)
}, dispose: function dispose() {
CommonJS.WindowEventManager.removeEventListener(CommonJS.WindowEventManager.Events.WINDOW_RESIZE, this._onResizeCallBack, false);
this._onResizeCallBack = null;
if (this._element) {
this._element.removeEventListener("click", this._clickHandler);
this._clickHandler = null
}
}
}, {
nullConverter: WinJS.Binding.converter(function(data) {
if (data) {
return data
}
else {
return ""
}
}), imageConverter: WinJS.Binding.converter(function(image) {
if (image) {
return "block"
}
else {
return "none"
}
}), urlToImageConverter: WinJS.Binding.converter(function(url) {
if (url) {
return "url('" + url + "')"
}
else {
return "none"
}
}), selectedConverter: WinJS.Binding.converter(function(selected) {
if (selected) {
return "tile selected"
}
else {
return "tile"
}
}), ariaLabelConverter: WinJS.Binding.converter(function(selected) {
if (selected) {
return "selected"
}
else {
return "unselected"
}
})
})});
WinJS.Class.mix(NewsJS.Customization.TilesPanel, WinJS.UI.DOMEventMixin);
WinJS.Class.mix(NewsJS.Customization.TilesPanel, WinJS.Utilities.createEventProperties(_events))
}(WinJS))