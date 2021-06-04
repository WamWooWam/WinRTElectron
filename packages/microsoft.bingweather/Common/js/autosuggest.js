/*  © Microsoft. All rights reserved. */
WinJS.Namespace.define('CommonJS', {Version: 'latest'});
(function appexCommonControlsAutoSuggestInit() {
"use strict";
WinJS.Namespace.define("CommonJS", {
autoSuggestID: null, autoSuggest: null, AutoSuggest: WinJS.Class.define(function autoSuggest_ctor(element, options) {
var that=this;
this._displayData = PlatformJS.Utilities.getDisplayData();
this.element = element || document.createElement("input");
CommonJS.setAutomationId(this.element);
this.element.setAttribute("type", "search");
this.element.setAttribute("maxlength", "256");
WinJS.Utilities.addClass(this.element, "platformAutoSuggestTextBox");
var previousList=document.getElementById("platformAutoSuggestList");
if (previousList) {
this._platformAutoSuggestListDom = previousList
}
else {
this._platformAutoSuggestListDom = document.createElement("div");
WinJS.Utilities.addClass(this._platformAutoSuggestListDom, "platformAutoSuggestListBase");
this._platformAutoSuggestListDom.id = "platformAutoSuggestList";
this._platformAutoSuggestListDom.setAttribute("aria-label", "platformAutoSuggestList");
this._platformAutoSuggestListDom.setAttribute("role", "listbox");
this._platformAutoSuggestListDom.setAttribute("tabIndex", "-1");
this._platformAutoSuggestListDom.setAttribute("aria-expanded", "true")
}
this.element.addEventListener("focus", function autoSuggest_onFocus(event) {
that._focus(event)
});
this.element.addEventListener("blur", function autoSuggest_onBlur(event) {
that._blur()
});
this.element.addEventListener("keydown", function autoSuggest_onKeyDown(event) {
that._keydown(event)
});
this.element.addEventListener("input", function autoSuggest_onInput(event) {
if (that._inIME) {
return
}
if (!this._msCandidateWindowEventsRegistered) {
var context=that.element.msGetInputContext();
if (context) {
context.addEventListener("MSCandidateWindowShow", function autoSuggest_onMsCandidateWindowShowHandler(event) {
var rect=context.getCandidateWindowClientRect();
that._platformAutoSuggestListDom.style.paddingTop = (rect.bottom - rect.top) + "px"
});
context.addEventListener("MSCandidateWindowHide", function autoSuggest_onMsCandidateWindowHideHandler(event) {
that._platformAutoSuggestListDom.style.paddingTop = ""
});
this._msCandidateWindowEventsRegistered = true
}
}
if (escape(that.element.value).indexOf("%0A") >= 0) {
that.element.value = unescape(escape(that.element.value).replace(/%0A/ig, "%20"))
}
if (that.element.value.indexOf("<") >= 0 || that.element.value.indexOf(">") >= 0 || that.element.value.indexOf("{") >= 0 || that.element.value.indexOf("}") >= 0 || that.element.value.indexOf("[") >= 0 || that.element.value.indexOf("]") >= 0) {
that.element.value = that.element.value.replace(/[<>{}\[\]]/g, "")
}
if (that && that._panoramaID) {
var panorama=document.getElementById(CommonJS.autoSuggest._panoramaID);
if (panorama && panorama.winControl) {
if (that.element.getBoundingClientRect().right > that._displayData.clientWidth) {
panorama.winControl.currentClusterIndex = that._clusterIndex;
setTimeout(function autoSuggest_focusElementAfterClusterIndex() {
that.element.focus()
}, 50)
}
}
}
if (CommonJS.autoSuggest && this.value.length === 0) {
setTimeout(function autoSuggest_updateAndHideList() {
CommonJS.autoSuggest._updateList(null);
CommonJS.autoSuggest._hideList()
}, 250)
}
if (typeof that._keyup === "function") {
that._keyup(event)
}
});
this.element.addEventListener("compositionstart", function autoSuggest_onCompositionStart(event) {
if (CommonJS.autoSuggest) {
CommonJS.autoSuggest._inIME = true
}
});
this.element.addEventListener("compositionend", function autoSuggest_onCompositionEnd(event) {
if (CommonJS.autoSuggest) {
CommonJS.autoSuggest._inIME = false;
CommonJS.autoSuggest._dispatchInputEvent()
}
});
document.body.appendChild(this._platformAutoSuggestListDom);
this.element.winControl = this;
this.itemDataSource = null;
this.keyup = null;
this._clusterIndex = 0,
this._selectionMode = CommonJS.AutoSuggest.freeForm;
this._inputPane = Windows.UI.ViewManagement.InputPane.getForCurrentView();
this._selectedIndex = -1;
this._appViewType = Windows.UI.ViewManagement.ApplicationView.value;
this._windowEventManager = CommonJS.WindowEventManager.getInstance();
this._updateListWhenFocus = true;
this._staticVars = {
dropdownItemHeight: 40, maxDropdownListHeight: 199, autosuggestBarHeight: 68
};
WinJS.UI.setOptions(this, options)
}, {
_isInvalidEntry: false, _panoramaID: null, _clusterIndex: 0, _itemDataSource: null, _keyup: null, _userOnItemSelection: null, _submitOnBlur: false, _selectionMode: null, _inputPane: null, _isShowing: false, _selectedIndex: -1, _alreadyOnSelection: false, _forceDropdown: false, _inIME: false, _appViewType: null, _windowEventManager: null, _updateListWhenFocus: true, _staticVars: null, _widthElement: null, _dataDisplay: null, _msCandidateWindowEventsRegistered: false, zIndex: {set: function set(value) {
this._platformAutoSuggestListDom.style.zIndex = value
}}, hide: function hide() {
this._isShowing = true;
this._blur()
}, itemDataSource: {set: function set(value) {
if (!this._isInvalidEntry) {
this._itemDataSource = value;
this._updateList(value)
}
}}, selectionMode: {set: function set(value) {
this._selectionMode = value
}}, onItemSelection: {set: function set(value) {
this._userOnItemSelection = value
}}, isInvalidEntry: {get: function get() {
return this._isInvalidEntry
}}, panoramaID: {set: function set(value) {
this._panoramaID = value
}}, clusterIndex: {set: function set(value) {
this._clusterIndex = value
}}, keyup: {set: function set(value) {
this._keyup = value
}}, widthElement: {
get: function get() {
return this._widthElement || this.element
}, set: function set(value) {
this._widthElement = value
}
}, _onInputPaneShowing: function _onInputPaneShowing(event) {
var that=CommonJS.autoSuggest;
if (!document.activeElement) {
console.warn("document.activeElement is null, something goes wrong, at _onInputPaneShowing()");
return
}
if (!(that && that.element)) {
console.warn("autosuggest.element is null, something goes wrong, at _onInputPaneShowing()");
return
}
if (document.activeElement.uniqueID === that.element.uniqueID) {
var rectangle=event.occludedRect;
CommonJS.displacement = 0;
CommonJS.offsetToEnsureInputInView = 0;
var delta=rectangle.y - that._staticVars.autosuggestBarHeight - that.element.getBoundingClientRect().bottom;
if (delta < 0) {
CommonJS.offsetToEnsureInputInView = delta;
CommonJS.displacement = CommonJS.offsetToEnsureInputInView;
WinJS.UI.executeTransition(document.body.parentNode, {
property: "transform", delay: 0, duration: 200, timing: "linear", to: "translate(0px," + CommonJS.offsetToEnsureInputInView + "px)"
}).done(function elementTransformCompleteOnInputPaneShowing() {
if (event.srcElement) {
event.srcElement.focus()
}
});
that.element.value = that.element.value.trim();
that._dispatchInputEvent();
event.ensuredFocusedElementInView = true
}
else {
that._dispatchInputEvent()
}
}
that._showList()
}, _onInputPaneHiding: function _onInputPaneHiding(event) {
var that=CommonJS.autoSuggest;
if (CommonJS.displacement !== 0) {
that._hideList();
document.body.parentNode.style.msTransform = "translate(0px,0px)";
CommonJS.displacement = 0;
event.ensuredFocusedElementInView = true
}
that._isShowing = false;
if (document.activeElement === that.element && !that._alreadyOnSelection) {
that._forceDropdown = true;
that._showList()
}
else {
that._blur()
}
if (document.activeElement !== that.element) {
that._inputPane.removeEventListener("hiding", that._onInputPaneHiding, false)
}
}, _wireupEvents: function _wireupEvents() {
var that=this;
this._inputPane.addEventListener("showing", that._onInputPaneShowing, false);
this._inputPane.addEventListener("hiding", that._onInputPaneHiding, false);
this._windowEventManager.addEventListener(CommonJS.WindowEventManager.Events.MOUSE_BACK, that._dismissAutoSuggest);
this._windowEventManager.addEventListener(CommonJS.WindowEventManager.Events.MOUSE_FORWARD, that._dismissAutoSuggest);
this._windowEventManager.addEventListener(CommonJS.WindowEventManager.Events.WINDOW_RESIZE, that._onWindowResize);
window.addEventListener("scroll", that._dismissAutoSuggest);
window.addEventListener("mousewheel", that._mousewheel)
}, _dismissAutoSuggest: function _dismissAutoSuggest() {
if (CommonJS.autoSuggest) {
CommonJS.autoSuggest._hideList()
}
}, _mousewheel: function _mousewheel(event) {
if (CommonJS.autoSuggest && WinJS.Utilities.hasClass(CommonJS.autoSuggest._platformAutoSuggestListDom, "platformAutoSuggestList")) {
return
}
var childOfAutoSuggestDom=false;
var checkElement=event.srcElement;
while (checkElement) {
if (WinJS.Utilities.hasClass(checkElement, "platformAutoSuggestListBase")) {
childOfAutoSuggestDom = true;
break
}
checkElement = checkElement.parentElement
}
if (!childOfAutoSuggestDom && CommonJS.autoSuggest) {
CommonJS.autoSuggest._hideList()
}
}, _onWindowResize: function _onWindowResize(e) {
CommonJS.WindowEventManager.HandleWindowResizeEvent.call(this, e, function HandleWindowResize() {
if (CommonJS.autoSuggest) {
if (Windows.UI.ViewManagement.InputPane.getForCurrentView().occludedRect.height === 0 || CommonJS.autoSuggest._forceDropdown) {
CommonJS.autoSuggest._positionList()
}
if (CommonJS.autoSuggest._appViewType !== Windows.UI.ViewManagement.ApplicationView.value) {
CommonJS.autoSuggest._appViewType = Windows.UI.ViewManagement.ApplicationView.value;
if (CommonJS.autoSuggest._isShowing) {
CommonJS.autoSuggest._showList()
}
}
}
})
}, _removeEvents: function _removeEvents() {
var that=this;
this._inputPane.removeEventListener("showing", that._onInputPaneShowing, false);
this._windowEventManager.removeEventListener(CommonJS.WindowEventManager.Events.MOUSE_BACK, that._dismissAutoSuggest);
this._windowEventManager.removeEventListener(CommonJS.WindowEventManager.Events.MOUSE_FORWARD, that._dismissAutoSuggest);
window.removeEventListener("scroll", that._dismissAutoSuggest);
window.removeEventListener("mousewheel", that._mousewheel)
}, _updateList: function _updateList(data) {
var i;
this._platformAutoSuggestListDom.innerHTML = "";
this._selectedIndex = -1;
this._platformAutoSuggestListDom.setAttribute("onfocus", "CommonJS.autoSuggest._SetFocusBack();");
if (data && data.length > 0) {
if (this._selectionMode === CommonJS.AutoSuggest.forceSelection) {
this._selectedIndex = 0
}
var dropdownListHeight=this._staticVars.dropdownItemHeight * data.length < this._staticVars.maxDropdownListHeight ? this._staticVars.dropdownItemHeight * data.length : this._staticVars.maxDropdownListHeight;
this._platformAutoSuggestListDom.style.height = dropdownListHeight + "px";
for (i = 0; i < data.length; i++) {
if (i >= 20) {
break
}
var item=this._createItem(data[i], i);
if (item) {
item.id = "CommonJS.AutoSuggest_" + i;
item.setAttribute("data-index", i);
this._platformAutoSuggestListDom.appendChild(item)
}
}
if (this._selectionMode === CommonJS.AutoSuggest.forceSelection) {
this._platformAutoSuggestListDom.children[0].setAttribute("aria-selected", true)
}
if (!this._isShowing) {
this._showList()
}
}
else if (data) {
this._isShowing = false;
this._hideList()
}
msWriteProfilerMark("Platform:Autosuggest:suggestlistUpdated")
}, _createItem: function _createItem(itemData, i) {
var symbol=(itemData.Symbol) ? itemData.Symbol : "";
var title=(itemData.Title) ? itemData.Title : "";
var subtitle=(itemData.Subtitle) ? itemData.Subtitle : "";
var comment=(itemData.Comment) ? itemData.Comment : "";
if (symbol === "" && title === "" && subtitle === "" && comment === "") {
return null
}
var buttonItem=document.createElement("button"),
listItem=document.createElement("div"),
listItemIcon=document.createElement("image"),
listItemLabel=document.createElement("div"),
listItemTitle=document.createElement("div"),
listItemSubTitle=document.createElement("div");
var listItemComment=document.createElement("div");
WinJS.Utilities.addClass(buttonItem, "win-interactive");
WinJS.Utilities.addClass(listItem, "platformAutoSuggestListItem");
WinJS.Utilities.addClass(listItemIcon, "platformAutoSuggestListItemIcon");
WinJS.Utilities.addClass(listItemLabel, "platformAutoSuggestListItemLabel");
WinJS.Utilities.addClass(listItemTitle, "platformAutoSuggestListItemTitle");
WinJS.Utilities.addClass(listItemSubTitle, "platformAutoSuggestListItemSubTitle");
WinJS.Utilities.addClass(listItemComment, "platformAutoSuggestListItemComment");
listItemLabel.innerText = symbol;
listItemTitle.innerText = title;
listItemSubTitle.innerText = subtitle;
listItemComment.innerText = comment;
if (itemData.Icon) {
listItemIcon.src = itemData.Icon;
listItem.appendChild(listItemIcon)
}
buttonItem.setAttribute("onfocus", "CommonJS.autoSuggest._SetFocusBack();");
buttonItem.setAttribute("data-displayedText", itemData.displayedText ? itemData.displayedText : symbol + " " + title + " " + subtitle);
buttonItem.setAttribute("data-value", itemData.value ? itemData.value : symbol + " " + title + " " + title);
buttonItem.setAttribute("onmspointerup", "CommonJS.autoSuggest._selectedIndex = " + i + "; CommonJS.autoSuggest._onClick(event)");
buttonItem.setAttribute("role", "option");
listItem.appendChild(listItemLabel);
listItem.appendChild(listItemTitle);
listItem.appendChild(listItemSubTitle);
listItem.appendChild(listItemComment);
buttonItem.appendChild(listItem);
return buttonItem
}, _SetFocusBack: function _SetFocusBack() {
if (CommonJS.autoSuggest) {
CommonJS.autoSuggest._updateListWhenFocus = false;
CommonJS.autoSuggest.element.focus()
}
}, _onClick: function _onClick(event) {
CommonJS.autoSuggest._onItemSelection(CommonJS.autoSuggest._selectedIndex, event);
CommonJS.autoSuggest._hideList()
}, _keydown: function _keydown(event) {
if (this._inIME) {
return
}
if (event.key === "Enter") {
if (this._selectionMode === CommonJS.AutoSuggest.forceSelection || this._selectedIndex > -1) {
if (this._itemDataSource && this._itemDataSource.length > 0) {
var selectedItem=this._platformAutoSuggestListDom.children[this._selectedIndex];
if (selectedItem) {
this.element.setAttribute("data-value", selectedItem.getAttribute("data-value"));
this.element.value = selectedItem.getAttribute("data-displayedText");
this.element.blur();
this._onItemSelection(this._selectedIndex, event)
}
else {
this._selectedIndex = -1;
this._isInvalidEntry = true;
this.element.blur();
this._onItemSelection(-1, event)
}
}
else {
this.element.setAttribute("data-value", "");
this._selectedIndex = -1;
this._isInvalidEntry = true;
this.element.blur();
this._onItemSelection(-1, event)
}
}
else {
this.element.setAttribute("data-value", "");
this.element.blur()
}
}
else if (event.key === "Down") {
var downItemsLength=this._platformAutoSuggestListDom.children.length;
if (downItemsLength > 0) {
this._selectedIndex++;
if (this._selectedIndex >= downItemsLength) {
if (this._selectionMode === CommonJS.AutoSuggest.forceSelection) {
this._selectedIndex = 0
}
else {
this._selectedIndex = -1
}
}
this._updateSelectedItem(this._selectedIndex);
if (this._selectedIndex >= 0) {
this._ensureItemVisible(this._platformAutoSuggestListDom.children[this._selectedIndex])
}
}
event.cancelBubble = true
}
else if (event.key === "Up") {
var upItemsLength=this._platformAutoSuggestListDom.children.length;
if (upItemsLength > 0) {
this._selectedIndex--;
if (this._selectedIndex === -1) {
if (this._selectionMode === CommonJS.AutoSuggest.forceSelection) {
this._selectedIndex = upItemsLength - 1
}
}
if (this._selectedIndex < -1) {
this._selectedIndex = upItemsLength - 1
}
this._updateSelectedItem(this._selectedIndex);
if (this._selectedIndex >= 0) {
this._ensureItemVisible(this._platformAutoSuggestListDom.children[this._selectedIndex])
}
}
event.cancelBubble = true
}
else if (event.key === "Left" || event.key === "Right") {
event.cancelBubble = true
}
}, _ensureItemVisible: function _ensureItemVisible(element) {
var scrollTop=this._platformAutoSuggestListDom.scrollTop,
listHeight=this._platformAutoSuggestListDom.offsetHeight,
elementTop=element.offsetTop,
elementHeight=element.offsetHeight;
if (elementTop < scrollTop) {
this._platformAutoSuggestListDom.scrollTop = elementTop
}
else if (elementTop + elementHeight > scrollTop + listHeight) {
this._platformAutoSuggestListDom.scrollTop = (elementTop + elementHeight - listHeight)
}
}, _updateSelectedItem: function _updateSelectedItem(index) {
var i;
var itemsLength=CommonJS.autoSuggest._platformAutoSuggestListDom.children.length;
for (i = 0; i < itemsLength; i++) {
CommonJS.autoSuggest._platformAutoSuggestListDom.children[i].setAttribute("aria-selected", false)
}
if (index > -1) {
CommonJS.autoSuggest._platformAutoSuggestListDom.children[index].setAttribute("aria-selected", true);
CommonJS.autoSuggest.element.setAttribute("data-value", CommonJS.autoSuggest._platformAutoSuggestListDom.children[index].getAttribute("data-value"));
CommonJS.autoSuggest.element.value = CommonJS.autoSuggest._platformAutoSuggestListDom.children[index].getAttribute("data-displayedText")
}
}, _blur: function _blur() {
var that=this;
var childOfAutoSuggestDom=false;
var checkElement=document.activeElement;
while (checkElement) {
if (WinJS.Utilities.hasClass(checkElement, "platformAutoSuggestListBase")) {
childOfAutoSuggestDom = true;
break
}
checkElement = checkElement.parentElement
}
if (!childOfAutoSuggestDom) {
this._removeEvents();
this._hideList();
if (this._selectedIndex < 0) {
this.element.setAttribute("data-value", "")
}
else {
var selectedItem=this._platformAutoSuggestListDom.children[that._selectedIndex];
if (selectedItem) {
this.element.setAttribute("data-value", selectedItem.getAttribute("data-value"));
this.element.value = selectedItem.getAttribute("data-displayedText")
}
else {
console.warn("Could not find a selectedItem with valid index " + this._selectedIndex)
}
}
this.element.removeAttribute("role");
this.element.removeAttribute("aria-autocomplete");
this.element.removeAttribute("aria-owns");
this._updateListWhenFocus = true;
if (that._submitOnBlur) {
that._onItemSelection(that._selectedIndex, event)
}
}
if (that._panoramaID) {
var panorama=document.getElementById(that._panoramaID);
if (panorama) {
var viewport=panorama.querySelector(".platformPanoramaViewport");
if (viewport) {
viewport.removeEventListener("MSManipulationStateChanged", that._dismissAutoSuggest)
}
else {
console.warn("panorama viewport could not be found, something goes wrong, please check.")
}
}
}
}, _focus: function _focus(event) {
var that=this;
if (that._panoramaID) {
var panorama=document.getElementById(that._panoramaID);
if (panorama && panorama.winControl) {
if (that.element.getBoundingClientRect().right > this._displayData.clientWidth) {
panorama.winControl.currentClusterIndex = that._clusterIndex;
setTimeout(function autoSuggest_focusElement() {
that.element.focus()
}, 50)
}
var viewport=panorama.querySelector(".platformPanoramaViewport");
if (viewport) {
viewport.addEventListener("MSManipulationStateChanged", that._dismissAutoSuggest)
}
else {
console.warn("panorama viewport could not be found, something goes wrong, please check.")
}
}
}
this._alreadyOnSelection = false;
WinJS.Utilities.removeClass(this.element, "platformAutoSuggestTextBoxInvalid");
this._isInvalidEntry = false;
if (CommonJS.autoSuggest && CommonJS.autoSuggestID !== this.element.uniqueID) {
CommonJS.autoSuggest._removeEvents()
}
CommonJS.autoSuggest = this;
this._appViewType = Windows.UI.ViewManagement.ApplicationView.value;
this._wireupEvents();
CommonJS.autoSuggestID = this.element.uniqueID;
this.element.setAttribute("role", "combobox");
this.element.setAttribute("aria-autocomplete", "list");
this.element.setAttribute("aria-owns", "platformAutoSuggestList");
this.element.setAttribute("aria-live", "assertive");
this.element.setAttribute("aria-atomic", "true");
if (this._updateListWhenFocus) {
this._dispatchInputEvent()
}
var rectangle=Windows.UI.ViewManagement.InputPane.getForCurrentView().occludedRect;
if (rectangle && rectangle.height && rectangle.height > 0) {
var elementBottomY=this.element.getBoundingClientRect().bottom;
var delta=rectangle.y - elementBottomY;
if (delta < this._staticVars.autosuggestBarHeight) {
CommonJS.offsetToEnsureInputInView = CommonJS.offsetToEnsureInputInView + (rectangle.y - this._staticVars.autosuggestBarHeight - elementBottomY);
CommonJS.displacement = CommonJS.offsetToEnsureInputInView;
WinJS.UI.executeTransition(document.body.parentNode, {
property: "transform", delay: 0, duration: 200, timing: "linear", to: "translate(0px," + CommonJS.offsetToEnsureInputInView + "px)"
}).done(function elementTransformCompleteOnFocus() {
if (event.srcElement) {
event.srcElement.focus()
}
})
}
}
}, _showList: function _showList() {
if (!CommonJS.autoSuggest || !CommonJS.autoSuggest.element) {
return
}
if (!document.getElementById(CommonJS.autoSuggest.element.id)) {
return
}
var previousList=document.getElementById("platformAutoSuggestList");
if (previousList) {
WinJS.Utilities.removeClass(previousList, "platformAutoSuggestList");
WinJS.Utilities.removeClass(previousList, "platformAutoSuggestListNonTouch");
WinJS.Utilities.removeClass(previousList, "platformAutoSuggestListAnimation");
WinJS.Utilities.removeClass(previousList, "platformAutoSuggestListShow")
}
if (CommonJS.autoSuggest._platformAutoSuggestListDom.children.length === 0) {
CommonJS.autoSuggest._isShowing = false;
return
}
CommonJS.autoSuggest._isShowing = true;
if (Windows.UI.ViewManagement.InputPane.getForCurrentView().occludedRect.height === 0 || CommonJS.autoSuggest._forceDropdown) {
CommonJS.autoSuggest._forceDropdown = false;
WinJS.Utilities.removeClass(CommonJS.autoSuggest._platformAutoSuggestListDom, "platformAutoSuggestList");
WinJS.Utilities.addClass(CommonJS.autoSuggest._platformAutoSuggestListDom, "platformAutoSuggestListNonTouch");
WinJS.Utilities.addClass(CommonJS.autoSuggest._platformAutoSuggestListDom, "platformAutoSuggestListShow");
CommonJS.autoSuggest._positionList()
}
else {
var rectangle=Windows.UI.ViewManagement.InputPane.getForCurrentView().occludedRect;
CommonJS.autoSuggest._platformAutoSuggestListDom.style.left = "";
CommonJS.autoSuggest._platformAutoSuggestListDom.style.right = "";
CommonJS.autoSuggest._platformAutoSuggestListDom.style.top = "";
CommonJS.autoSuggest._platformAutoSuggestListDom.style.width = "";
if (CommonJS.displacement && CommonJS.displacement !== 0) {
CommonJS.autoSuggest._platformAutoSuggestListDom.style.bottom = rectangle.height - 14 + CommonJS.offsetToEnsureInputInView - window.pageYOffset + "px"
}
else {
CommonJS.autoSuggest._platformAutoSuggestListDom.style.bottom = rectangle.height - 14 - window.pageYOffset + "px"
}
WinJS.Utilities.removeClass(CommonJS.autoSuggest._platformAutoSuggestListDom, "platformAutoSuggestListNonTouch");
WinJS.Utilities.addClass(CommonJS.autoSuggest._platformAutoSuggestListDom, "platformAutoSuggestList");
WinJS.Utilities.addClass(CommonJS.autoSuggest._platformAutoSuggestListDom, "platformAutoSuggestListAnimation");
WinJS.Utilities.addClass(CommonJS.autoSuggest._platformAutoSuggestListDom, "platformAutoSuggestListShow")
}
}, _positionList: function _positionList() {
var rects=this.element.getClientRects()[0];
if (rects) {
var inputBox=WinJS.Utilities.getPosition(this.element, document.body);
var body=WinJS.Utilities.getPosition(document.body, window);
var down=((document.documentElement.clientHeight - rects.top) > this._staticVars.maxDropdownListHeight);
if (down) {
if (document.dir === "rtl") {
this._platformAutoSuggestListDom.setLeft((document.documentElement.clientWidth - rects.right) + "px")
}
else {
this._platformAutoSuggestListDom.setLeft((rects.left) + "px")
}
this._platformAutoSuggestListDom.style.top = (rects.top + rects.height - 2) + "px";
this._platformAutoSuggestListDom.style.bottom = "";
this._platformAutoSuggestListDom.style.width = this.widthElement.clientWidth + "px"
}
else {
if (document.dir === "rtl") {
this._platformAutoSuggestListDom.style.left = (document.documentElement.clientWidth - rects.right) + "px"
}
else {
this._platformAutoSuggestListDom.setLeft(rects.left + "px")
}
this._platformAutoSuggestListDom.style.top = "";
this._platformAutoSuggestListDom.style.bottom = (document.documentElement.clientHeight - rects.top) + "px";
this._platformAutoSuggestListDom.style.width = this.widthElement.clientWidth + "px"
}
}
}, _animate: function _animate(element, from, to) {
return WinJS.UI.executeAnimation(element, {
property: "-ms-transform", delay: 0, duration: 733, timing: "cubic-bezier(0.3, 0.9, 0.2, 1)", from: from, to: to
})
}, _onItemSelection: function _onItemSelection(index, event) {
if (!this._alreadyOnSelection) {
msWriteProfilerMark("Platform:Autosuggest:ItemSelected");
if (index < 0) {
this.element.setAttribute("data-value", "")
}
else {
var selectedItem=this._platformAutoSuggestListDom.children[index];
if (selectedItem) {
this.element.setAttribute("data-value", selectedItem.getAttribute("data-value"));
this.element.value = selectedItem.getAttribute("data-displayedText")
}
else {
console.warn("Could not find a selectedItem with valid index " + index)
}
}
this._isShowing = false;
this.element.blur();
if (typeof this._userOnItemSelection === "function") {
this._userOnItemSelection(index, event)
}
this._alreadyOnSelection = true
}
}, _hideList: function _hideList() {
var list=document.getElementById("platformAutoSuggestList");
if (list) {
WinJS.Utilities.removeClass(list, "platformAutoSuggestList");
WinJS.Utilities.removeClass(list, "platformAutoSuggestListNonTouch");
WinJS.Utilities.removeClass(list, "platformAutoSuggestListAnimation");
WinJS.Utilities.removeClass(list, "platformAutoSuggestListShow")
}
if (CommonJS.autoSuggest) {
CommonJS.autoSuggest._forceDropdown = false;
CommonJS.autoSuggest._isShowing = false
}
if (!CommonJS.autoSuggest || !document.getElementById(CommonJS.autoSuggest.element.id)) {
this._windowEventManager.removeEventListener(CommonJS.WindowEventManager.Events.WINDOW_RESIZE, this._onWindowResize)
}
}, _dispatchInputEvent: function _dispatchInputEvent() {
var ev=document.createEvent("HTMLEvents");
ev.initEvent("input", false, true);
this.element.dispatchEvent(ev)
}
}, {
forceSelection: "forceSelection", freeForm: "freeForm"
})
})
})()