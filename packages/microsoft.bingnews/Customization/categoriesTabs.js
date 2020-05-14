/*  © Microsoft. All rights reserved. */
(function(WinJS) {
var _events=["rendercompeted", "itemselected"];
WinJS.Namespace.define("NewsJS.Customization", {CategoriesTabs: WinJS.Class.define(function(element, options) {
if (!element)
throw"element must be provided";
options = options || {};
this._element = element;
this._element.winControl = this;
this._buildVisualTree();
WinJS.UI.setOptions(this, options);
this._onResizeCallBack = this._onResize.bind(this);
CommonJS.WindowEventManager.addEventListener(CommonJS.WindowEventManager.Events.WINDOW_RESIZE, this._onResizeCallBack, false)
}, {
_element: null, _selectButton: null, _selectButtonText: null, _select: null, _dataSource: null, _scrollContainer: null, _categories: null, _clickEater: null, _preventToggleDropDown: false, _onResizeCallBack: null, _selectChangeHandler: null, _scrollContainerChangeHandler: null, _categoriesFocusHandler: null, _buildVisualTree: function _buildVisualTree() {
this._select = document.createElement("SELECT");
this._select.className = "catSelect";
this._select.size = 1;
this._selectChangeHandler = this._selectChange.bind(this);
this._select.addEventListener("change", this._selectChangeHandler, false);
this._element.appendChild(this._select);
this._scrollContainer = document.createElement("div");
this._scrollContainer.className = "catScrollContainer";
this._scrollContainerChangeHandler = this._selectChange.bind(this);
this._scrollContainer.addEventListener("change", this._scrollContainerChangeHandler, false);
this._element.appendChild(this._scrollContainer);
this._categories = document.createElement("ul");
this._categories.className = "categories";
this._categoriesFocusHandler = this._selectFocus.bind(this);
this._categories.addEventListener("focus", this._categoriesFocusHandler, true);
this._scrollContainer.appendChild(this._categories)
}, _onResize: function _onResize(evt) {
if (window.innerWidth > 600) {
this._scrollIntoView()
}
}, _selectChange: function _selectChange(evt) {
this.value = evt.srcElement.value;
this._element.setActive();
this._scrollIntoView();
if (this._focusHandler) {
msClearImmediate(this._focusHandler)
}
this._focusHandler = msSetImmediate(function _searchDialog_setFocusCategoryTextBoxTimeout() {
if (evt && evt.srcElement) {
evt.srcElement.setActive();
evt.srcElement.focus()
}
})
}, _selectFocus: function _selectFocus(evt) {
window.scrollTo(0, 0);
document.body.scrollTop = 0
}, _scrollIntoView: function _scrollIntoView() {
if (this._select && this._select.length && this._select.length > 0) {
var index=this._select.selectedIndex;
var itemHeight=this._categories.scrollHeight / this._select.length;
var containerHeight=this._scrollContainer.clientHeight;
var itemPosition=(index + 1) * itemHeight;
var scrollTop=this._scrollContainer.scrollTop;
if (itemPosition > containerHeight + scrollTop) {
this._scrollContainer.scrollTop = itemPosition - containerHeight
}
else if (itemPosition - itemHeight < scrollTop) {
this._scrollContainer.scrollTop = itemPosition - itemHeight
}
}
}, _renderItems: function _renderItems(items) {
var categories=document.createDocumentFragment(),
options=document.createDocumentFragment();
this._select.innerHTML = "";
this._categories.innerHTML = "";
if (items) {
for (var i=0; i < items.length; i++) {
var item=items[i];
var id="cat" + i;
var radio=document.createElement("INPUT");
radio.type = "radio";
radio.id = id;
radio.name = "categories";
radio.setAttribute("data-category", item);
radio.value = item;
var label=document.createElement("LABEL");
label.setAttribute("for", id);
label.setAttribute("name", "categories");
label.innerHTML = item;
label.className = "category";
var option=document.createElement("OPTION");
option.text = item;
option.value = item;
options.appendChild(option);
var listItem=document.createElement("li");
listItem.appendChild(radio);
listItem.appendChild(label);
categories.appendChild(listItem)
}
}
this._select.appendChild(options);
this._categories.appendChild(categories);
this.dispatchEvent("rendercompeted", {})
}, element: {get: function get() {
return this._element
}}, value: {
get: function get() {
return this._select.value
}, set: function set(v) {
if (!v) {
v = ""
}
var vEscaped=v.replace("'", "\\'");
var cat=this._categories.querySelector("input[data-category= '" + vEscaped + "']");
if (cat) {
this._select.value = v;
cat.checked = true;
var detail={};
detail.categoryId = v;
this.dispatchEvent("itemselected", detail)
}
}
}, dataSource: {
get: function get() {
return this._dataSource
}, set: function set(v) {
this._dataSource = v;
this._renderItems(v ? v : [])
}
}, dispose: function dispose() {
CommonJS.WindowEventManager.removeEventListener(CommonJS.WindowEventManager.Events.WINDOW_RESIZE, this._onResizeCallBack, false);
this._onResizeCallBack = null;
if (this._select) {
this._select.removeEventListener("change", this._selectChangeHandler, false);
this._selectChangeHandler = null
}
if (this._scrollContainer) {
this._scrollContainer.removeEventListener("change", this._scrollContainerChangeHandler, false);
this._scrollContainerChangeHandler = null
}
if (this._categories) {
this._categories.removeEventListener("focus", this._categoriesFocusHandler, false);
this._categoriesFocusHandler = null
}
}
})});
WinJS.Class.mix(NewsJS.Customization.CategoriesTabs, WinJS.UI.DOMEventMixin);
WinJS.Class.mix(NewsJS.Customization.CategoriesTabs, WinJS.Utilities.createEventProperties(_events))
}(WinJS))