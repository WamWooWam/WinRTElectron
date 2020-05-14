/*  © Microsoft. All rights reserved. */
WinJS.Namespace.define('CommonJS', {Version: 'latest'});
(function appexPlatformControlsButtonContainerInit() {
"use strict";
var NS=WinJS.Namespace.define("CommonJS", {ButtonContainer: WinJS.Class.define(function buttonContainer_ctor(element, options) {
this.element = element || document.createElement("div");
CommonJS.setAutomationId(this.element);
WinJS.Utilities.addClass(this.element, "platformActionBarItem");
this.element.winControl = this;
WinJS.UI.setOptions(this, options)
}, {
element: null, _buttons: null, _menu: null, _maxWidth: 0, _addMenu: function _addMenu() {
var container=document.getElementById("platformPageArea");
container.appendChild(this._menu.element)
}, _removeMenu: function _removeMenu() {
if (this._menu) {
var container=document.getElementById("platformPageArea");
container.removeChild(this._menu.element);
this._menu = null
}
}, _initButtonHandler: function _initButtonHandler(index) {
var that=this;
var button=new CommonJS.Button(CommonJS.createElement("button", this.element, "button" + index), this._buttons[index]);
button.element.className = "";
this._menu.element.appendChild(button.element);
button.element.addEventListener("onclick", function buttonContainer_onClick() {
that.menu.hide()
})
}, commands: {set: function set(value) {
msWriteProfilerMark("Platform:ButtonContainer:commands:s");
var i=0,
j=0,
button=null,
buttonWidth=0,
currentWidth=0,
lastButton=null,
that=this;
this._maxWidth = WinJS.Utilities.getTotalWidth(this.element);
this._buttons = value;
WinJS.Utilities.empty(this.element);
this._removeMenu();
for (i = 0; i < this._buttons.length; i++) {
button = new CommonJS.Button(CommonJS.createElement("button", this.element, "button" + i, this._buttons[i].channelId), this._buttons[i]);
this.element.appendChild(button.element);
buttonWidth = WinJS.Utilities.getTotalWidth(button.element);
if (currentWidth + buttonWidth > this._maxWidth) {
this.element.removeChild(button.element);
if (lastButton) {
this.element.removeChild(lastButton.element)
}
this._menu = new WinJS.UI.Flyout(CommonJS.createElement("div", this.element, "moreFlyout"));
WinJS.Utilities.addClass(this._menu.element, "platformButtonOverflow");
for (j = i - 1; j < this._buttons.length; j++) {
this._initButtonHandler(j)
}
button = new CommonJS.Button(CommonJS.createElement("button", this.element, "moreButton"), {
title: CommonJS.resourceLoader.getString("/platform/More"), icon: "iconMore", onclick: function buttonContainer_onClickIconMore() {
that._menu.show(button.element);
button.selected = true
}
});
this._menu.addEventListener("afterhide", function buttonContainer_onAfterHide() {
button.selected = false
});
button.element.setAttribute("aria-haspopup", true);
this.element.appendChild(button.element);
this._addMenu();
break
}
else {
lastButton = button;
currentWidth += buttonWidth
}
}
msWriteProfilerMark("Platform:ButtonContainer:commands:e")
}}
})})
})();
(function appexPlatformControlsButtonInit() {
"use strict";
var NS=WinJS.Namespace.define("CommonJS", {Button: WinJS.Class.define(function button_ctor(element, options) {
this.element = element || document.createElement("button");
this.element.winControl = this;
CommonJS.setAutomationId(this.element);
this._states = {};
WinJS.Utilities.addClass(this.element, "win-commandring win-commandicon roundUIBtnLight");
WinJS.Utilities.addClass(this.element, "win-disposable");
this.element.setAttribute("tabIndex", 0);
this._onMSPointerDownBind = this._onMSPointerDown.bind(this);
this.element.addEventListener("MSPointerDown", this._onMSPointerDownBind);
this._onMSPointerOutBind = this._onMSPointerOut.bind(this);
this.element.addEventListener("MSPointerOut", this._onMSPointerOutBind);
this._onMSPointerResetBind = this._onMSPointerReset.bind(this);
this.element.addEventListener("MSPointerUp", this._onMSPointerResetBind);
this.element.addEventListener("MSPointerCancel", this._onMSPointerResetBind);
this.element.addEventListener("blur", this._onMSPointerResetBind);
this.element.addEventListener("deactivate", this._onMSPointerResetBind);
this.element.addEventListener("MSLostPointerCapture", this._onMSPointerResetBind);
this._onClickHandlerBind = this._onClickHandler.bind(this);
this.element.addEventListener("click", this._onClickHandlerBind);
this._onKeyDownHandlerBind = this._onKeyDownHandler.bind(this);
this.element.addEventListener("keydown", this._onKeyDownHandlerBind);
this.isToggle = false;
this.mode = null;
this.selected = false;
this._currentState = null;
this._flyout = null;
this._actionBar = null;
this._flyoutShown = false;
WinJS.UI.setOptions(this, options)
}, {
selected: false, flyoutPlacement: null, element: null, mode: null, pressedIcon: null, _states: null, _currentState: null, _flyout: null, _actionBar: null, _flyoutShown: false, _iconRest: null, _isDisposed: false, _onKeyDownHandlerBind: null, _onClickHandlerBind: null, _onMSPointerDownBind: null, _onMSPointerResetBind: null, _onMSPointerOutBind: null, _sourceClickFunction: null, _onMSPointerDown: function _onMSPointerDown(event) {
if (this._isDisposed) {
return
}
if (this.pressedIcon && this.pressedIcon.length > 0) {
this._setIcon(this.pressedIcon)
}
this._pointerDown = true
}, _onMSPointerReset: function _onMSPointerReset(event) {
if (this._isDisposed) {
return
}
this._setIcon(this.icon);
this._pointerDown = false;
if (WinJS.Utilities.eventWithinElement(this.element, event)) {
console.log("MSPointerUP event registered")
}
}, _onMSPointerOut: function _onMSPointerOut(event) {
if (this._isDisposed) {
return
}
if (this._pointerDown) {
try {
this.element.msSetPointerCapture(event.pointerId)
}
catch(e) {}
;
}
}, _getParentActionBar: function _getParentActionBar() {
var appBarDom=this.element.parentNode;
if (appBarDom) {
var appBar=appBarDom.winControl;
if (appBar && appBar.hide) {
return appBar
}
}
}, disabled: {set: function set(value) {
if (value) {
this.element.disabled = "disabled"
}
else {
this.element.removeAttribute("disabled")
}
}}, theme: {set: function set(value) {
var ele=this.element;
if (value === "dark") {
WinJS.Utilities.removeClass(ele, "roundUIBtnLight");
WinJS.Utilities.addClass(ele, "roundUIBtnDark")
}
else if (value === "light") {
WinJS.Utilities.removeClass(ele, "roundUIBtnDark");
WinJS.Utilities.addClass(ele, "roundUIBtnLight")
}
else {
console.log("Incorrect platform button theme, possible values are: light|dark")
}
}}, icon: {
set: function set(value) {
this._iconRest = value;
this._setIcon(value)
}, get: function get() {
return this._iconRest
}
}, _setIcon: function _setIcon(value) {
if (value && value.substring(0, 4) === "url(") {
console.error("image icon button is not supported, please use appexFont: " + value)
}
else {
if (WinJS.UI.AppBarIcon[value]) {
this.element.textContent = WinJS.UI.AppBarIcon[value]
}
else {
WinJS.Utilities.addClass(this.element, value)
}
}
}, title: {set: function set(value) {
this.element.setAttribute("aria-label", value)
}}, _invokeButton: function _invokeButton(event) {
if (this._isDisposed) {
return
}
var parentActionBar=null;
if (this.mode === CommonJS.Button.Toggle) {
this.selected = !this.selected
}
if (this._flyout && !this._flyoutShown && this._flyout.hidden) {
this._flyoutShown = true;
this._flyout.show(this.element, this.flyoutPlacement || "top")
}
if (this._actionBar) {
parentActionBar = this._getParentActionBar();
if (parentActionBar) {
parentActionBar.hide()
}
this._actionBar.disabled = false;
this._actionBar.show()
}
if (this._sourceClickFunction) {
this._sourceClickFunction(event)
}
}, _onClickHandler: function _onClickHandler(event) {
if (this._isDisposed) {
return
}
if (event.offsetX > this.element.offsetWidth || event.offsetY > this.element.offsetHeight || event.offsetX < 0 || event.offsetY < 0) {
return
}
this._invokeButton(event)
}, _onKeyDownHandler: function _onKeyDownHandler(event) {
if (this._isDisposed) {
return
}
switch (event.keyCode) {
case WinJS.Utilities.Key.enter:
case WinJS.Utilities.Key.space:
this._invokeButton(event);
break;
default:
break
}
}, onclick: {set: function set(value) {
this._sourceClickFunction = value
}}, states: {set: function set(value) {
var i=0;
this._states = {};
for (i = 0; i < value.length; i++) {
this._states[value[i].id] = value[i]
}
}}, currentState: {
set: function set(value) {
if (this._isDisposed) {
return
}
var state=this._states[value];
if (!state) {
PlatformJS.Utilities.onError("Invalid state id");
return
}
this._currentState = value;
if (state.icon) {
this.icon = state.icon
}
if (state.iconRemove) {
WinJS.Utilities.removeClass(this.element, state.iconRemove)
}
if (state.iconAdd) {
WinJS.Utilities.addClass(this.element, state.iconAdd)
}
this.title = state.title;
if (!(typeof state.pressedIcon === "undefined")) {
this.pressedIcon = state.pressedIcon
}
}, get: function get() {
return this._currentState
}
}, flyout: {set: function set(value) {
var that=this;
this.element.setAttribute("aria-haspopup", true);
this._flyout = PlatformJS.Utilities.getControl(value);
if (this._flyout) {
this._flyout.addEventListener("afterhide", function button_onAfterHideFlyout() {
that._flyoutShown = false
})
}
}}, actionBar: {set: function set(value) {
var that=this;
this._actionBar = PlatformJS.Utilities.getControl(value);
if (this._actionBar) {
this._actionBar.addEventListener("afterhide", function button_onAfterHideActionBar() {
that._actionBar.disabled = true
})
}
}}, dispose: function dispose() {
if (this._isDisposed) {
return
}
this._isDisposed = true;
if (this.element) {
if (this._onClickHandlerBind) {
this.element.removeEventListener("click", this._onClickHandlerBind);
this._onClickHandlerBind = null
}
if (this._onKeyDownHandlerBind) {
this.element.removeEventListener("keydown", this._onKeyDownHandlerBind);
this._onKeyDownHandlerBind = null
}
if (this._onMSPointerDownBind) {
this.element.removeEventListener("MSPointerDown", this._onMSPointerDownBind);
this._onMSPointerDownBind = null
}
if (this._onMSPointerOutBind) {
this.element.removeEventListener("MSPointerOut", this._onMSPointerOutBind);
this._onMSPointerOutBind = null
}
if (this._onMSPointerResetBind) {
this.element.removeEventListener("MSPointerUp", this._onMSPointerResetBind);
this.element.removeEventListener("MSPointerCancel", this._onMSPointerResetBind);
this.element.removeEventListener("blur", this._onMSPointerResetBind);
this.element.removeEventListener("deactivate", this._onMSPointerResetBind);
this.element.removeEventListener("MSLostPointerCapture", this._onMSPointerResetBind);
this._onMSPointerResetBind = null
}
WinJS.Utilities.disposeSubTree(this.element);
this.element = null
}
this._flyout = null
}
}, {
Toggle: "Toggle", Radio: "Radio", Dynamic: "Dynamic", Simple: "Simple"
})})
})();
(function appexPlatformControlsMenuButtonInit() {
"use strict";
var NS=WinJS.Namespace.define("CommonJS", {MenuButton: WinJS.Class.define(function menuButton_ctor(element, options) {
var that=this;
this.element = element || document.createElement("div");
CommonJS.setAutomationId(element);
this.element.setAttribute("aria-haspopup", true);
WinJS.Utilities.addClass(this.element, "platformActionBarItem");
this._button = new CommonJS.Button(CommonJS.createElement("button", this.element, "button"), {
onclick: function menuButton_onClick() {
that._button.selected = true;
if (!that._flyoutShown && that._flyout.hidden) {
that._flyoutShown = true;
that._flyout.show(that._button.element, "top")
}
}, mode: CommonJS.Button.Toggle
});
this.element.appendChild(this._button.element);
this._flyout = new WinJS.UI.Flyout(null, {});
this._flyout.addEventListener("afterhide", function menuButton_onAfterHide() {
that._flyoutShown = false;
that._button.selected = false
});
CommonJS.setAutomationId(this._flyout.element, this.element, "flyout");
WinJS.Utilities.addClass(this._flyout.element, "platformMenu win-menu");
this._flyout.element.setAttribute("role", "menu");
document.getElementById("platformPageArea").appendChild(this._flyout.element);
this.element.winControl = this;
this._flyoutShown = false;
this._currentState = null;
this._states = null;
this.selectionMode = CommonJS.MenuButton.Single;
WinJS.UI.setOptions(this, options)
}, {
element: null, onStateChange: null, selectionMode: null, _flyoutShown: false, _currentState: null, _button: null, _flyout: null, _states: null, disabled: {set: function set(value) {
this._button.disabled = value
}}, states: {set: function set(value) {
msWriteProfilerMark("Platform:MenuButton:states:s");
var i=0,
state=null,
that=this;
this._states = {};
WinJS.Utilities.empty(that._flyout.element);
for (i = 0; i < value.length; i++) {
state = value[i];
if (typeof state.id === "undefined" || state.id === null) {
PlatformJS.Utilities.onError("ID must be included in a button state")
}
if (typeof state.title === "undefined" || state.title === null) {
PlatformJS.Utilities.onError("Title must be included in a button state")
}
this._states[state.id] = state;
this._initElements(state)
}
if (this._currentState) {
this.currentState = this._currentState
}
msWriteProfilerMark("Platform:MenuButton:states:e")
}}, _initElements: function _initElements(state) {
var s=null,
otherState=null,
that=this;
state.button = document.createElement("button");
CommonJS.setAutomationId(state.button, this.element, state.id);
WinJS.Utilities.addClass(state.button, "platformMenuItem");
state.button.setAttribute("role", "menuitem");
state.label = document.createElement("div");
state.label.textContent = state.title;
WinJS.Utilities.addClass(state.label, "platformMenuLabel");
state.button.appendChild(state.label);
state.check = document.createElement("div");
WinJS.Utilities.addClass(state.check, "platformMenuCheck");
state.button.appendChild(state.check);
state.button.onclick = function menuButton_stateButton_onclick(event) {
if (that.selectionMode === CommonJS.MenuButton.Menu) {
that._flyout.hide();
that._currentState = [state.id]
}
else {
if (that.selectionMode === CommonJS.MenuButton.Single) {
for (s in that._states) {
otherState = that._states[s];
if (otherState.isChecked) {
if (state !== otherState) {
otherState.isChecked = !otherState.isChecked;
WinJS.Utilities.toggleClass(otherState.check, "platformMenuLabelCheck")
}
break
}
}
}
state.isChecked = !state.isChecked;
WinJS.Utilities.toggleClass(state.check, "platformMenuLabelCheck");
that._currentState = [];
for (s in that._states) {
otherState = that._states[s];
if (otherState.isChecked) {
that._currentState.push(otherState.id)
}
}
}
if (that.onStateChange) {
that.onStateChange(that._currentState)
}
};
that._flyout.element.appendChild(state.button)
}, currentState: {
set: function set(value) {
msWriteProfilerMark("Platform:MenuButton:currentState:s");
var state=null,
i=0,
s=null;
this._currentState = value;
if (this.selectionMode !== CommonJS.MenuButton.Menu && this._states) {
for (s in this._states) {
state = this._states[s];
state.isChecked = false;
WinJS.Utilities.removeClass(state.check, "platformMenuLabelCheck")
}
for (i = 0; i < this._currentState.length; i++) {
state = this._states[this._currentState[i]];
if (state) {
state.isChecked = true;
WinJS.Utilities.addClass(state.check, "platformMenuLabelCheck")
}
else {
PlatformJS.Utilities.onError("Invalid button state id")
}
}
}
msWriteProfilerMark("Platform:MenuButton:currentState:e")
}, get: function get() {
return this._currentState
}
}, title: {set: function set(value) {
if (value) {
this._button.title = value
}
else {
PlatformJS.Utilities.onError("Button title must be non-null")
}
}}, icon: {set: function set(value) {
this._button.icon = value
}}
}, {
Multi: "Multi", Single: "Single", Menu: "Menu"
})})
})();
(function appexPlatformControlsSelectorButtonInit() {
"use strict";
WinJS.Namespace.define("CommonJS", {SelectorButton: WinJS.Class.mix(WinJS.Class.derive(WinJS.UI.AppBarCommand, function selectorButton_ctor(elt, options) {
WinJS.UI.AppBarCommand.call(this, elt, options);
var element=this._element;
var items=this._items = options.items;
for (var i=0, len=items.length; i < len; i++) {
var item=items[i];
if (item.selected) {
this.selectedIndex = i;
break
}
}
var clickListener=this._clickListener = this._onClick.bind(this);
element.addEventListener("click", clickListener);
Object.defineProperties(this, WinJS.Utilities.createEventProperties("selectionchanged"))
}, {
_items: null, _selectedIndex: null, _clickListener: null, dispose: function dispose() {
this._element.removeEventListener("click", this._clickListener);
WinJS.UI.AppBarCommand.prototype.dispose.call(this)
}, selectedIndex: {
get: function get() {
return this._selectedIndex
}, set: function set(value) {
var items=this._items;
var item=items[value];
if (item) {
this._selectedIndex = value;
var element=this._element;
element.querySelector(".win-commandimage").innerText = item.icon;
this.tooltip = item.label
}
}
}, _onClick: function _onClick(event) {
var selectedIndex=this._selectedIndex;
var items=this._items;
var len=items.length;
var newSelectedIndex=this.selectedIndex = (selectedIndex + 1) % len;
this.dispatchEvent("selectionchanged", newSelectedIndex)
}
}, {}), WinJS.Utilities.eventMixin)})
})();
(function _PaginatedViewManager_7() {
"use strict";
var leftArrowGlyph="&#57570;";
var rightArrowGlyph="&#57571;";
WinJS.Namespace.define("CommonJS", {PaginatedViewManager: WinJS.Class.define(function _PaginatedViewManager_18(options) {
var eventListeners=this._eventListeners = [];
this._setupButtons();
this._buttonFadePromise = null;
this._nextPageButtonPromise = null;
this._previousPageButtonPromise = null;
this._buttonsVisible = false;
this._touch = false;
this._flippersAlwaysVisible = options.flippersAlwaysVisible;
this._touchToShowFlippers = options.touchToShowFlippers
}, {
_elt: null, _eventListeners: null, _nextPageButton: null, _previousPageButton: null, _nextPageInvisibleButton: null, _previousPageInvisibleButton: null, _buttonFadePromise: null, _buttonsVisible: null, _nextPageButtonPromise: null, _previousPageButtonPromise: null, _pageButtonOnHover: null, _touch: null, _isDragging: false, _flippersAlwaysVisible: false, _touchToShowFlippers: false, _flippersFirstShown: false, attachEventListeners: function attachEventListeners(elt) {
this._attach(elt, "MSPointerHover", this._pointerHoverListener);
this._attach(elt, "MSPointerMove", this._pointerMoveListener);
this._attach(elt, "MSPointerDown", this._pointerDownListener);
this._attach(elt, "click", this._tapListener);
this._attach(elt, "MSManipulationStateChanged", this._manipulationListener)
}, dispose: function dispose() {
try {
var eventListeners=this._eventListeners;
for (var i=0, len=eventListeners.length; i < len; i++) {
var eventListener=eventListeners[i];
var elt=eventListener.elt;
var name=eventListener.name;
var listener=eventListener.listener;
elt.removeEventListener(name, listener)
}
}
catch(ex) {}
this._eventListeners = [];
var buttonFadePromise=this._buttonFadePromise;
if (buttonFadePromise) {
buttonFadePromise.cancel()
}
}, _attach: function _attach(elt, name, listener) {
var eventListeners=this._eventListeners;
var l=listener.bind(this);
elt.addEventListener(name, l);
eventListeners.push({
elt: elt, name: name, listener: l
})
}, _pointerHoverListener: function _pointerHoverListener(event) {
this._detectTouch(event);
this._maybeShowButtons(event)
}, _pointerMoveListener: function _pointerMoveListener(event) {
this._detectTouch(event);
this._maybeShowButtons(event)
}, _pointerDownListener: function _pointerDownListener(event) {
this._detectTouch(event);
if ((event.buttons & 4) !== 0) {
event.stopPropagation();
event.preventDefault()
}
}, _tapListener: function _tapListener(event) {
if (event.pointerType === 'touch' && this._touchToShowFlippers) {
var target=event.target;
if (target !== this._nextPageButton && target !== this._nextPageInvisibleButton && target !== this._previousPageButton && target !== this._previousPageInvisibleButton) {
this._showButtons(event)
}
}
}, _detectTouch: function _detectTouch(event) {
if (event.pointerType === "touch") {
this._touch = true
}
else {
this._touch = false
}
}, _maybeShowButtons: function _maybeShowButtons(event) {
if (event.pointerType !== "touch") {
this._showButtons()
}
}, _maybeUpdateButtons: function _maybeUpdateButtons() {
if (this._buttonsVisible) {
this._showButtons()
}
}, _showButtons: function _showButtons() {
this._fadeInButtons();
this._fadeOutButtons(false)
}, showButtons: function showButtons() {
if (this._flippersAlwaysVisible || this._touchToShowFlippers) {
if (!this._flippersFirstShown) {
this._fadeInButtons();
this._fadeOutButtons(false);
this._flippersFirstShown = true
}
}
}, _fadeInButtons: function _fadeInButtons() {
var hasNextPage=this._hasNext();
this._animateButton("next", hasNextPage);
var hasPreviousPage=this._hasPrevious();
this._animateButton("previous", hasPreviousPage);
this._buttonsVisible = true
}, _fadeOutButtons: function _fadeOutButtons(immediate) {
var that=this;
if (that._flippersAlwaysVisible) {
return
}
var buttonFadePromise=this._buttonFadePromise;
if (buttonFadePromise) {
buttonFadePromise.cancel();
this._buttonFadePromise = null
}
var pageButtonOnHover=this._pageButtonOnHover;
if (!pageButtonOnHover || (pageButtonOnHover === "next" && !this._hasNext()) || (pageButtonOnHover === "prev" && !this._hasPrevious())) {
this._buttonFadePromise = WinJS.Promise.timeout(immediate ? 0 : 2000).then(function _PaginatedViewManager_186() {
that._animateButton("next", false);
that._animateButton("previous", false);
that._buttonFadePromise = null;
that._buttonsVisible = false
})
}
}, _animateButton: function _animateButton(button, visible) {
var elt;
var promise;
switch (button) {
case"next":
elt = this._nextPageButton;
promise = this._nextPageButtonPromise;
break;
case"previous":
elt = this._previousPageButton;
promise = this._previousPageButtonPromise;
break
}
if (elt) {
if (promise) {
promise.cancel()
}
if (visible) {
elt.style.visibility = "visible";
promise = WinJS.UI.executeTransition(elt, {
property: "opacity", delay: 0, duration: 167, timing: "linear", to: 1
})
}
else {
promise = WinJS.UI.Animation.fadeOut(elt).then(function _PaginatedViewManager_230() {
elt.style.visibility = "hidden"
})
}
}
switch (button) {
case"next":
this._nextPageButtonPromise = promise;
break;
case"previous":
this._previousPageButtonPromise = promise;
break
}
}, _onPageButtonMouseOver: function _onPageButtonMouseOver(event) {
if (event.pointerType !== "touch") {
switch (event.target) {
case this._nextPageButton:
this._pageButtonOnHover = "next";
break;
case this._previousPageButton:
this._pageButtonOnHover = "prev";
break
}
}
}, _onPageButtonMouseOut: function _onPageButtonMouseOut(event) {
this._pageButtonOnHover = null
}, _manipulationListener: function _manipulationListener(event) {
if (event.currentState === MSManipulationEvent.MS_MANIPULATION_STATE_INERTIA || event.currentState === MSManipulationEvent.MS_MANIPULATION_STATE_ACTIVE) {
this._touch = true
}
else if (event.currentState === MSManipulationEvent.MS_MANIPULATION_STATE_STOPPED) {
this._touch = false
}
else {
this._touch = false
}
this._isDragging = (event.currentState === MSManipulationEvent.MS_MANIPULATION_STATE_ACTIVE);
if (this._isDragging) {
if (this._touchToShowFlippers === false) {
this._fadeOutButtons(true)
}
}
}, _getContainerElement: function _getContainerElement() {
throw"_getContainerElement() needs to be implemented by the subclass";
}, _hasNext: function _hasNext() {
throw"_hasNext() needs to be implemented by the subclass";
}, _hasPrevious: function _hasPrevious() {
throw"_hasPrevious() needs to be implemented by the subclass";
}, _onNextPageClick: function _onNextPageClick(event) {
throw"_onNextPageClick() needs to be implemented by the subclass";
}, _onPreviousPageClick: function _onPreviousPageClick(event) {
throw"_onPreviousPageClick() needs to be implemented by the subclass";
}, _setupButtons: function _setupButtons() {
var elt=this._elt = this._getContainerElement();
var rtl=window.getComputedStyle(elt, null).direction === "rtl";
var nextPageInvisibleButton=this._nextPageInvisibleButton = document.createElement("button");
nextPageInvisibleButton.setAttribute("tabIndex", -1);
nextPageInvisibleButton.setAttribute("aria-hidden", "true");
WinJS.Utilities.addClass(nextPageInvisibleButton, "win-invisible-navbutton");
WinJS.Utilities.addClass(nextPageInvisibleButton, rtl ? "win-invisible-navleft" : "win-invisible-navright");
elt.appendChild(nextPageInvisibleButton);
var nextPageButton=this._nextPageButton = document.createElement("button");
nextPageButton.style.visibility = "hidden";
nextPageButton.setAttribute("tabIndex", -1);
nextPageButton.setAttribute("aria-hidden", "true");
nextPageButton.innerHTML = rtl ? leftArrowGlyph : rightArrowGlyph;
WinJS.Utilities.addClass(nextPageButton, "win-navbutton");
WinJS.Utilities.addClass(nextPageButton, rtl ? "win-navleft" : "win-navright");
elt.appendChild(nextPageButton);
var previousPageInvisibleButton=this._previousPageInvisibleButton = document.createElement("button");
previousPageInvisibleButton.setAttribute("tabIndex", -1);
previousPageInvisibleButton.setAttribute("aria-hidden", "true");
WinJS.Utilities.addClass(previousPageInvisibleButton, "win-invisible-navbutton");
WinJS.Utilities.addClass(previousPageInvisibleButton, rtl ? "win-invisible-navright" : "win-invisible-navleft");
elt.appendChild(previousPageInvisibleButton);
var previousPageButton=this._previousPageButton = document.createElement("button");
previousPageButton.style.visibility = "hidden";
previousPageButton.setAttribute("tabIndex", -1);
previousPageButton.setAttribute("aria-hidden", "true");
previousPageButton.innerHTML = rtl ? rightArrowGlyph : leftArrowGlyph;
WinJS.Utilities.addClass(previousPageButton, "win-navbutton");
WinJS.Utilities.addClass(previousPageButton, rtl ? "win-navright" : "win-navleft");
elt.appendChild(previousPageButton);
this._attach(nextPageInvisibleButton, "click", this._onNextPageClick);
this._attach(nextPageButton, "click", this._onNextPageClick);
this._attach(nextPageButton, "MSPointerOver", this._onPageButtonMouseOver);
this._attach(nextPageButton, "MSPointerOut", this._onPageButtonMouseOut);
this._attach(previousPageInvisibleButton, "click", this._onPreviousPageClick);
this._attach(previousPageButton, "click", this._onPreviousPageClick);
this._attach(previousPageButton, "MSPointerOver", this._onPageButtonMouseOver);
this._attach(previousPageButton, "MSPointerOut", this._onPageButtonMouseOut)
}
})})
})();
(function appexFlightingManagerInit() {
var mergeDictionaries=function(src, tgt) {
var isOverwritten=false;
for (var p in src) {
if (src.hasOwnProperty(p)) {
if (!tgt.hasOwnProperty(p)) {
tgt[p] = JSON.parse(JSON.stringify(src[p]));
continue
}
if (typeof src[p] === "object") {
isOverwritten |= mergeDictionaries(src[p], tgt[p]);
continue
}
isOverwritten = true
}
}
return isOverwritten
};
var log=function(text) {
var __logger=LoggerJS.LocalFileLogger.get("flighting.log");
log = __logger.write.bind(__logger);
log(text)
};
WinJS.Namespace.define("CommonJS", {FlightingManager: WinJS.Class.define(function flightingManager_ctor() {
log("FlightManager:ctor");
this._assignedFlights = [];
this._flightConfig = {};
this._badFlights = {};
this._getUniqueId();
var version=Windows.ApplicationModel.Package.current.id.version;
this._version = {
major: version.major, minor: version.minor
};
this._settingsContainer = this._getFlightingManagerSettings();
this._loadLocalSettings();
if (PlatformJS.shouldClearState) {
if (PlatformJS.mainProcessManager.isRecoverMode()) {
for (var i=this._assignedFlights.length - 1; i >= 0; i--) {
this._badFlights[this._assignedFlights[i]] = "Crash"
}
}
else {
this._badFlights = {}
}
this._flightConfig = {};
this._assignedFlights = [];
this._saveLocalSettings(this._assignedFlights, this._flightConfig, this._badFlights);
this._setTelemetryFlights()
}
}, {
_isSessionConfigMutable: true, _uniqueId: null, _settingsContainer: null, _assignedFlights: null, _badFlights: null, _flightConfig: null, _version: null, _loadingPromise: null, hasPendingUpdate: false, dispose: function dispose() {
log("FlightingManager.dispose");
this._badFlights = {};
this._flightConfig = {};
this._assignedFlights = []
}, _applyFlightsIfMutable: function _applyFlightsIfMutable(assignedFlights, flightConfig) {
if (this._isSessionConfigMutable) {
this._assignedFlights = assignedFlights;
this._flightConfig = flightConfig;
log("Read and applied now AssignedFlights=" + JSON.stringify(assignedFlights));
log("Read and applied now FlightConfig=" + JSON.stringify(flightConfig));
this._setTelemetryFlights()
}
else {
log("Read for next launch AssignedFlights=" + JSON.stringify(assignedFlights));
log("Read for next launch FlightConfig=" + JSON.stringify(flightConfig))
}
}, _disableFlighting: function _disableFlighting() {
if (this._uniqueId) {
this._deleteUniqueId()
}
log('Disable flighting:s hasPendingUpdate=' + this.hasPendingUpdate);
this.hasPendingUpdate = this.hasPendingUpdate || JSON.stringify([]) !== JSON.stringify(this._assignedFlights) || JSON.stringify({}) !== JSON.stringify(this._flightConfig);
this._badFlights = {};
this._saveLocalSettings([], {}, {});
this._applyFlightsIfMutable([], {});
log('Disable flighting:e hasPendingUpdate=' + this.hasPendingUpdate)
}, _loadDebugAsync: function _loadDebugAsync() {
var localFolder=Windows.Storage.ApplicationData.current.localFolder;
return localFolder.getFileAsync("FlightingDebug.json").then(function readFlightingDebug(file) {
return Windows.Storage.FileIO.readTextAsync(file)
}).then(function processFlightingDebug(data) {
try {
data = JSON.parse(data);
if (typeof data !== "object") {
throw"bad file, its not json";
}
log("Loaded FlightingDebug.json file");
return data
}
catch(e) {
debugger;
log("Invalid FlightingDebug.json file");
return {}
}
}, function noFlightingDebug(e) {
log("No FlightingDebug.json file");
return {}
})
}, _isFlightAllowed: function _isFlightAllowed(flightId, flight) {
return (!!flight && !this._badFlights[flightId] && CommonJS.Utils.versionInRange(this._version, flight.minVersion, flight.maxVersion))
}, _parseFlightingFile: function _parseFlightingFile(jsonData) {
var experiments=JSON.parse(jsonData);
var numberLines=experiments.numberLine;
var flights=experiments.flights;
if (!experiments.version || experiments.version < 2) {
var oldFlights=flights;
flights = {};
var keys=Object.keys(oldFlights);
for (var i=keys.length - 1; i >= 0; i--) {
var key=keys[i];
if (!oldFlights.data) {
flights[key] = {
data: oldFlights[key], minVersion: null, maxVersion: null
}
}
}
}
return {
numberLine: numberLines, flights: flights
}
}, _readConfig: function _readConfig(data, debugData) {
var assignedFlights=[];
var flightConfig={};
var badFlights=[];
try {
var experiments={};
try {
experiments = this._parseFlightingFile(data.dataString)
}
catch(parseError) {
console.error("Invalid flighting manager config: " + parseError);
log("Invalid flighting manager config: " + parseError)
}
log("Flighting File = " + JSON.stringify(experiments));
var flightConfigs=[];
if (debugData.override) {
assignedFlights.push("debug");
flightConfigs.push(debugData.override)
}
;
if (experiments.numberLine && experiments.numberLine.length) {
var bucket=(typeof debugData.bucket === "number" ? debugData.bucket % experiments.numberLine.length : this._getNumberlineBucket(experiments.numberLine.length));
log("using numberline bucket " + bucket);
var flightIds=debugData.flightIds || experiments.numberLine[bucket];
if (flightIds && experiments.flights) {
flightIds = flightIds.split(",");
for (var i=flightIds.length - 1; i >= 0; i--) {
var flightId=flightIds[i];
var flight=experiments.flights[flightId];
if (flight && this._isFlightAllowed(flightId, flight)) {
assignedFlights.push(flightId);
flightConfigs.push(flight.data)
}
}
}
}
for (var j=flightConfigs.length - 1; j >= 0; j--) {
var mergeHasOverWrites=mergeDictionaries(flightConfigs[j], flightConfig);
if (mergeHasOverWrites) {
for (var b=flightIds.length - 1; b >= 0; b--) {
badFlights.push(flightIds[b])
}
assignedFlights = [];
flightConfig = {};
break
}
}
}
catch(e) {
debugger;
console.error(e);
log("Flighting:_Parse " + e)
}
return {
assignedFlights: assignedFlights, flightConfig: flightConfig, badFlights: badFlights
}
}, _processConfig: function _processConfig(configFileData, debugData) {
var configChanged=false;
log('FlightingManager:_processConfig:s hasPendingUpdate=' + this.hasPendingUpdate);
var newConfig=this._readConfig(configFileData, debugData);
if (newConfig.badFlights.length > 0) {
for (var i=newConfig.badFlights - 1; i >= 0; i--) {
this._badFlights[newConfig.badFlights[i]] = "OverWrite"
}
newConfig.assignedFlights = [];
newConfig.flightConfig = {};
configChanged = true
}
this.hasPendingUpdate = this.hasPendingUpdate || JSON.stringify(newConfig.assignedFlights) !== JSON.stringify(this._assignedFlights) || JSON.stringify(newConfig.flightConfig) !== JSON.stringify(this._flightConfig);
this._saveLocalSettings(newConfig.assignedFlights, newConfig.flightConfig, this._badFlights);
this._applyFlightsIfMutable(newConfig.assignedFlights, newConfig.flightConfig);
log('FlightingManager:_processConfig:e hasPendingUpdate=' + this.hasPendingUpdate);
log("Read for next launch BadFlights=" + JSON.stringify(this._badFlights));
return configChanged
}, _loadFlightingFile: function _loadFlightingFile(debugUrl) {
var queryParams=PlatformJS.Collections.createStringDictionary();
var market=(Platform.Utilities.Globalization.getCurrentMarket() || "").toLowerCase();
queryParams.insert("market", market);
var defaultUrl=PlatformJS.Services.configuration.getString("FlightingManagerUrl");
var url=debugUrl ? debugUrl : defaultUrl;
queryParams.insert("url", url);
log("flighting manager config query parameters (market):" + market);
log("flighting manager config query parameters (url):" + url);
var options=new Platform.DataServices.QueryServiceOptions;
options.useCompatDataModel = true;
options.bypassCache = true;
var queryService=new PlatformJS.DataService.QueryService("FlightingManagerDataSource");
return queryService.downloadDataAsync(queryParams, null, null, options)
}, _loadNewFlightingInfo: function _loadNewFlightingInfo() {
var that=this;
var promise=(PlatformJS.isDebug ? this._loadDebugAsync() : WinJS.Promise.wrap({}));
return promise.then(function flightingManagerFetchConfig(debugData) {
return that._loadFlightingFile(debugData.url).then(function flightingManagerProcessConfig(configFileData) {
log('FlightingManager:flightingManagerProcessConfig:s hasPendingUpdate=' + that.hasPendingUpdate);
return that._processConfig(configFileData, debugData)
}, function flightingManagerQueryErrorHandler(queryError) {
console.warn("Couldn't download flighting manager config:" + queryError);
log("Couldn't download flighting manager config:" + queryError);
that._setTelemetryFlights();
return false
})
}, function flightingManagerInit_ErrorHandler(platformError) {
console.error("Platform initialization failure: " + platformError);
log("Platform initialization failure: " + platformError);
return false
})
}, initializeAsync: function initializeAsync(force) {
if (!force && this._initialized) {
return
}
var that=this;
this._initialized = true;
this._loadingPromise = this._loadingPromise ? this._loadingPromise : PlatformJS.platformInitializedPromise;
this._loadingPromise = this._loadingPromise.then(function checkIfEnabled() {
var isCeip=Platform.Instrumentation && Platform.Instrumentation.InstrumentationManager && Platform.Instrumentation.InstrumentationManager.instance.IsCeipEnabled;
if (!PlatformJS.isFlightingEnabled || isCeip) {
that._disableFlighting();
return WinJS.Promise.wrap()
}
return that._loadNewFlightingInfo()
});
return this._loadingPromise
}, getFlightConfig: function getFlightConfig() {
this._isSessionConfigMutable = false;
return this._flightConfig
}, _getNumberlineBucket: function _getNumberlineBucket(numberLineLength) {
if (!this._uniqueId) {
this._generateUniqueId()
}
var str=this._uniqueId;
var hash=0;
for (var i=0; i < str.length; i++) {
var char=str.charCodeAt(i);
hash = ((hash << 5) - hash) + char;
hash = hash & hash
}
var myMod=function(m, n) {
return ((m % n) + n) % n
};
return myMod(hash, numberLineLength)
}, _getFlightingManagerSettings: function _getFlightingManagerSettings() {
var settingsContainer=null;
var localSettings=Windows.Storage.ApplicationData.current.localSettings;
if (localSettings && localSettings.values) {
settingsContainer = localSettings.createContainer("FlightingManager", Windows.Storage.ApplicationDataCreateDisposition.Always)
}
return settingsContainer
}, _loadLocalSettings: function _loadLocalSettings() {
log("Flighting Manager loading local settings");
log("Flighting is " + (PlatformJS.isFlightingEnabled ? "enabled" : "disabled"));
var settingsContainer=this._settingsContainer;
if (settingsContainer && settingsContainer.values && PlatformJS.isFlightingEnabled) {
var values=settingsContainer.values;
if (values.hasKey("AssignedFlights") && values.hasKey("FlightConfig")) {
try {
this._assignedFlights = JSON.parse(settingsContainer.values["AssignedFlights"]);
this._flightConfig = JSON.parse(settingsContainer.values["FlightConfig"])
}
catch(parseError) {
console.error("Unable to load flighting manager local settings: " + parseError);
log("Unable to load flighting manager local settings: " + parseError);
this._assignedFlights = [];
this._flightConfig = {};
this._saveLocalSettings(this._assignedFlights, this._flightConfig, this._badFlights)
}
this._setTelemetryFlights()
}
else {
log("Flighting Manager No assigned flights or configs")
}
if (values.hasKey("BadFlights")) {
try {
this._badFlights = JSON.parse(settingsContainer.values["BadFlights"]);
this._badFlights = (typeof this._badFlights === "object" ? this._badFlights : {})
}
catch(parseError) {
console.error("Unable to load Bad flights from flighting manager local settings: " + parseError);
log("Unable to load Bad flights from flighting manager local settings: " + parseError);
this._badFlights = {}
}
}
}
else {
log("Not loading local Settings, defaulting to no flighting")
}
log("loaded localSettings AssignedFlights=" + JSON.stringify(this._assignedFlights));
log("loaded localSettings FlightConfig=" + JSON.stringify(this._flightConfig));
log("loaded localSettings BadFlights=" + JSON.stringify(this._badFlights))
}, _saveLocalSettings: function _saveLocalSettings(assignedFlights, flightConfig, badFlights) {
badFlights = badFlights || {};
var settingsContainer=this._settingsContainer;
if (settingsContainer && settingsContainer.values) {
try {
settingsContainer.values["AssignedFlights"] = JSON.stringify(assignedFlights);
settingsContainer.values["FlightConfig"] = JSON.stringify(flightConfig);
settingsContainer.values["BadFlights"] = JSON.stringify(badFlights)
}
catch(stringifyError) {
console.error("Unable to save flighting manager local settings: " + stringifyError);
log("Unable to save flighting manager local settings: " + stringifyError);
settingsContainer.values["AssignedFlights"] = "[]";
settingsContainer.values["FlightConfig"] = "{}";
settingsContainer.values["BadFlights"] = "{}"
}
}
}, _setTelemetryFlights: function _setTelemetryFlights() {
var that=this;
log("Waiting on  platform initalization to set FlightRecorder.test = '" + this._assignedFlights + "'");
PlatformJS.platformInitializedPromise.then(function flightingManagerSetTelemetryFlights() {
try {
log("Setting FlightRecorder.test = '" + that._assignedFlights + "'");
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.tests = that._assignedFlights
}
catch(e) {
log("Error Setting FlightRecorder.test error = " + e.message)
}
}, function flightingManagerPlatformInitErrorHandler(platformError) {
log("Platform initialization failure: " + platformError);
console.error("Platform initialization failure: " + platformError)
})
}, _getRoamingSettings: function _getRoamingSettings() {
try {
return Windows.Storage.ApplicationData.current.roamingSettings
}
catch(e) {
console.error("was unable to get roaming settings e:" + e.message)
}
return null
}, _getUniqueId: function _getUniqueId() {
var idKey="FlightingManagerUniqueID";
var roamingSettings=this._getRoamingSettings();
var roamingSettingsValid=roamingSettings && roamingSettings.values;
if (roamingSettingsValid && roamingSettings.values[idKey]) {
this._uniqueId = roamingSettings.values[idKey]
}
else {
this._uniqueId = this._generateUniqueId();
if (roamingSettingsValid) {
roamingSettings.values[idKey] = this._uniqueId
}
}
log("FlightManager ID=" + this._uniqueId)
}, _deleteUniqueId: function _deleteUniqueId() {
var idKey="FlightingManagerUniqueID";
this._uniqueId = 0;
var roamingSettings=this._getRoamingSettings();
var roamingSettingsValid=roamingSettings && roamingSettings.values;
if (roamingSettingsValid) {
roamingSettings.values[idKey] = this._uniqueId
}
}, _generateUniqueId: function _generateUniqueId() {
var uniqueId=null;
var connectionProfiles=Windows.Networking.Connectivity.NetworkInformation.getConnectionProfiles();
if (connectionProfiles.length !== 0) {
var networkAdapter=connectionProfiles[0].networkAdapter;
if (networkAdapter) {
uniqueId = networkAdapter.networkAdapterId
}
}
if (!uniqueId) {
var localSettings=Windows.Storage.ApplicationData.current.localSettings;
if (localSettings && localSettings.values) {
uniqueId = localSettings.values["InstallationID"]
}
}
if (!uniqueId) {
uniqueId = (new Date).getTime()
}
return uniqueId
}
}, {
_instance: null, instance: {get: function get() {
if (!CommonJS.FlightingManager._instance) {
CommonJS.FlightingManager._instance = new CommonJS.FlightingManager
}
return CommonJS.FlightingManager._instance
}}, reset: function reset() {
log("FlightingManager.reset");
CommonJS.FlightingManager._instance.dispose();
CommonJS.FlightingManager._instance = null
}
})})
})();
(function configuration_init() {
"use strict";
var log=function(text) {
var __logger=LoggerJS.LocalFileLogger.get("flighting.log");
log = __logger.write.bind(__logger);
log(text)
};
WinJS.Namespace.define("CommonJS.Configuration", {OverridenConfiguration: WinJS.Class.define(function OverridenConfiguration_ctor(jsDictionary, csDictionary) {
log("OverridenConfiguration:ctor");
var that=this;
this._jsDictionary = jsDictionary ? jsDictionary : {};
if (WinJS.Promise.is(csDictionary)) {
this._csDictionaryPromise = csDictionary.then(function _configuration_599(dict) {
that._csDictionary = dict;
that._csDictionaryPromise = null;
return dict
})
}
else {
this._csDictionary = csDictionary
}
;
}, {
_jsDictionary: null, _csDictionary: null, _csDictionaryPromise: null, isReady: function isReady() {
return this._csDictionary !== null
}, setValue: function setValue(key, value) {
this._jsDictionary[key] = value
}, getDictionary: function getDictionary(key) {
var subCs=null;
if (this._csDictionary) {
subCs = this._csDictionary.getDictionary(key)
}
else {
if (this._csDictionaryPromise) {
subCs = this._csDictionaryPromise.then(function _configuration_629(dict) {
return WinJS.Promise.wrap(dict ? dict.getDictionary(key) : null)
})
}
}
var subJs=this._jsDictionary[key];
if (typeof subJs !== "object") {
subJs = {}
}
;
return new CommonJS.Configuration.OverridenConfiguration(subJs, subCs)
}, getString: function getString(key, defaultValue) {
if (key in this._jsDictionary) {
var value=this._jsDictionary[key];
switch (typeof value) {
case"string":
return value;
default:
debugger;
return ""
}
;
}
return (!this._csDictionary ? defaultValue : this._csDictionary.getString(key, defaultValue))
}, getBool: function getBool(key, defaultValue) {
if (key in this._jsDictionary) {
var value=this._jsDictionary[key];
switch (typeof value) {
case"boolean":
return value;
default:
debugger;
return false
}
;
}
return (!this._csDictionary ? defaultValue : this._csDictionary.getBool(key, defaultValue))
}, getInt32: function getInt32(key, defaultValue) {
if (key in this._jsDictionary) {
var value=this._jsDictionary[key];
switch (typeof value) {
case"number":
return Math.floor(value);
default:
debugger;
return 0
}
;
}
return (!this._csDictionary ? defaultValue : this._csDictionary.getInt32(key, defaultValue))
}, getList: function getList(key, defaultValue) {
if (key in this._jsDictionary) {
debugger;
throw"trying to get List " + key + " value of jsDictionary which is not supported";
}
return (!this._csDictionary ? defaultValue : this._csDictionary.getList(key, defaultValue))
}
})});
var _customConfigManager=null;
WinJS.Namespace.define("CommonJS.Configuration.ConfigurationManager", {
createCustomOverride: function createCustomOverride(jsDictionary) {
if (PlatformJS && PlatformJS.isPlatformInitialized && Platform && Platform.Configuration && Platform.Configuration.ConfigurationManager) {
var csDictionary=Platform.Configuration.ConfigurationManager.custom;
return new CommonJS.Configuration.OverridenConfiguration(jsDictionary, csDictionary)
}
var csDictionaryPromise=(PlatformJS && PlatformJS.platformInitializedPromise ? WinJS.Promise.wrap(null) : WinJS.Promise.timeout(1000)).then(function _configuration_704() {
return PlatformJS.platformInitializedPromise
}).then(function applyCSConfig() {
return WinJS.Promise.wrap(Platform.Configuration.ConfigurationManager.custom)
});
return new CommonJS.Configuration.OverridenConfiguration(jsDictionary, csDictionaryPromise)
}, custom: {get: function get() {
if (!_customConfigManager) {
var jsDictionary={};
if (CommonJS && CommonJS.FlightingManager) {
jsDictionary = CommonJS.FlightingManager.instance.getFlightConfig()
}
else {
console.warn("This app does not support a/b flighting");
log("This app does not support a/b flighting")
}
_customConfigManager = CommonJS.Configuration.ConfigurationManager.createCustomOverride(jsDictionary)
}
return _customConfigManager
}}, resetFlighting: function resetFlighting() {
CommonJS.FlightingManager.reset();
_customConfigManager = null
}
})
})();
(function OverideConfigTesterInit() {
"use strict";
WinJS.Namespace.define("CommonJS.Configuration.Test", {OverideConfigTester: WinJS.Class.define(function test_ctor(overriden, nonoverriden) {
this.overriden = overriden;
this.nonoverriden = nonoverriden
}, {
createDictionary: function createDictionary(jsDictionary) {
return CommonJS.Configuration.ConfigurationManager.createCustomOverride(jsDictionary)
}, testGet: function testGet(prefix, dict, key, expected) {
var result=null;
switch (typeof expected) {
case"string":
result = dict.getString(key);
break;
case"number":
result = dict.getInt32(key);
break;
case"boolean":
result = dict.getBool(key);
break
}
if (result !== expected) {
var msg="FAIL dict[" + prefix + (prefix ? "." : "") + key + "]=" + result + "  expected=" + expected;
throw msg;
}
}, testDictionary: function testDictionary(prefix, dict, tests) {
for (var key in tests) {
var value=tests[key];
if (typeof value !== "object") {
this.testGet(prefix, dict, key, value)
}
else {
if (!value.length) {
var subDict=dict.getDictionary(key);
var subPrefix=prefix + (prefix ? "." : "") + key;
this.testDictionary(subPrefix, subDict, value)
}
}
}
}, runTest: function runTest() {
var that=this;
var dict=this.createDictionary(this.overriden);
if (PlatformJS && PlatformJS.isPlatformInitialized) {
this.testDictionary("", dict, this.overriden);
this.testDictionary("", dict, this.nonoverriden);
return WinJS.Promise.wrap(null)
}
;
this.testDictionary("", dict, this.overriden);
var k="LiveTile";
var d=dict.getDictionary(k);
return WinJS.Promise.timeout(5000).then(function _configuration_801() {
return PlatformJS.platformInitializedPromise
}).then(function _configuration_802() {
return WinJS.Promise.timeout(500)
}).then(function _configuration_803() {
that.testDictionary("(LatePop)" + k, d, that.nonoverriden[k]);
that.testDictionary("", dict, that.nonoverriden);
return WinJS.Promise.wrap(null)
})
}
})})
})();
(function TestOverload() {
"use strict";
var overridenValues={
VideoAdsInterval: -10, EnableVideoAds: false, CannedDataDate: "None", LiveTile: {
secondaryTileCount: 1, TestValue: "Test"
}, TestStrOver: "test", TestIntOver: 3, TestBoolOver: true, TestDict: {Test: "Test"}
};
var addedValues={
LiveTile: {TestValue: "Test"}, TestStrOver: "test", TestIntOver: 3, TestBoolOver: true, TestDict: {Test: "Test"}
};
var baseValues={
VideoAdsInterval: 3, EnableVideoAds: true, CannedDataDate: "2009/03/01T20:30:00", LiveTile: {secondaryTileCount: 4}
};
var nonOverridenValues={
EnableNextSteps: true, LiveTile: {secondaryTileUpdateFrequency: 0}
}
})();
(function _scheduler_8() {
"use strict";
if (CommonJS && CommonJS.schedulerLoaded) {
return
}
function noop(){}
var traceEnabled=false;
var TaskPriority={
low: 0, normal: 1, high: 2
};
function trace(value, duration) {
if (traceEnabled) {
duration = duration || "";
msWriteProfilerMark(value);
var time=10000000 + (new Date % 100000);
console.error(time + "::" + value + "::" + duration)
}
}
;
function wrapPriority(priority) {
if (!priority) {
return function _scheduler_38() {
return TaskPriority.normal
}
}
if (typeof priority === "function") {
return priority
}
return function _scheduler_43() {
return priority
}
}
;
function schedulerTaskComparator(a, b) {
var diff=b.priorityFn() - a.priorityFn();
if (diff === 0) {
diff = a.relativeIndex - b.relativeIndex
}
return diff
}
;
var Task=WinJS.Class.define(function Task_ctor(delegate, priority, identifier) {
this.delegate = delegate;
this.priorityFn = wrapPriority(priority);
this.identifier = (identifier ? identifier : "Unknown task")
}, {dispose: function dispose(taskPriorityQueue) {
if (taskPriorityQueue) {
taskPriorityQueue.cancel(this)
}
this.delegate = null;
this.priorityFn = null
}});
var DynamicPriorityQueue=function(taskComparatorFn) {
var tasks=[],
taskRelativeIndex=0,
taskComparator=taskComparatorFn;
function getRelativeIndex() {
if (tasks.length === 0) {
taskRelativeIndex = 0
}
;
return taskRelativeIndex++
}
;
function push(task) {
if (task) {
task.relativeIndex = getRelativeIndex();
tasks.push(task)
}
}
;
function pop() {
if (tasks.length > 0) {
tasks.sort(taskComparator);
return tasks.shift()
}
return null
}
;
function cancel(task) {
var index=tasks.indexOf(task);
if (index > -1) {
trace("Cancel " + task.identifier);
tasks.splice(index, 1)
}
}
;
function isEmpty() {
return (tasks.length === 0)
}
;
function getLength() {
return tasks.length
}
;
return {
push: push, pop: pop, cancel: cancel, isEmpty: isEmpty, getLength: getLength, tasks: tasks
}
};
var Scheduler=function() {
var taskPriorityQueue=new DynamicPriorityQueue(schedulerTaskComparator),
taskRelativeIndex=0,
executeEnqueued=false,
blockingPromise=null,
maxPromiseLifetimeMs=1500;
function taskList() {
var taskIds=[];
var tasks=taskPriorityQueue.tasks;
for (var i=0; i < tasks.length; i++) {
var task=tasks[i];
taskIds.push(task.identifier)
}
return "[" + taskIds.join(", ") + "]"
}
function enableTrace(value) {
traceEnabled = value
}
;
function next() {
if (!taskPriorityQueue.isEmpty() && !executeEnqueued) {
executeEnqueued = true;
msSetImmediate(execute)
}
}
;
function setBlockingPromise(p) {
if (p === null) {
return
}
if (blockingPromise) {
blockingPromise = WinJS.Promise.join(blockingPromise, p)
}
else {
blockingPromise = p
}
;
}
;
function execute() {
if (taskPriorityQueue.isEmpty()) {
trace("Execute  :: EmptyQueue");
executeEnqueued = false;
return
}
var start,
task=null;
task = taskPriorityQueue.pop();
if (task) {
var priority=task.priorityFn(),
identifier=task.identifier;
if (traceEnabled) {
start = new Date;
trace("Execute  {0}::{1}:s".format(priority, identifier))
}
try {
task.delegate()
}
catch(e) {
console.error("Execute  :  Error thrown running task ::" + identifier + "  Error::" + e);
debugger
}
task.dispose();
if (blockingPromise && blockingPromise.done) {
var currentBlockingPromise=blockingPromise;
blockingPromise = null;
console.warn("Waiting on " + identifier);
if (traceEnabled) {
trace("Waiting on " + identifier)
}
var timeoutBlockingPromise=WinJS.Promise.timeout(maxPromiseLifetimeMs).then(function skipBlockingPromise() {
debugger;
console.error("Skip {0} blocking promise because it took > {1} seconds".format(identifier, maxPromiseLifetimeMs / 1000));
executeEnqueued = false;
next()
});
WinJS.Promise.as(currentBlockingPromise).done(function _scheduler_215() {
timeoutBlockingPromise.cancel();
if (traceEnabled) {
trace("Executed {0}::{1}:e took {2}ms".format(priority, identifier, (new Date - start)))
}
executeEnqueued = false;
next()
}, function _scheduler_222() {
timeoutBlockingPromise.cancel();
if (traceEnabled) {
trace("Errored {0}::{1}:e took {2}ms".format(priority, identifier, (new Date - start)))
}
executeEnqueued = false;
next()
});
return
}
if (traceEnabled) {
trace("Executed {0}::{1}:e took {2}ms".format(priority, identifier, (new Date - start)))
}
executeEnqueued = false;
next()
}
}
;
function schedule(delegate, priority, identifier) {
if (!CommonJS.commonSchedulerEnabled) {
var start;
if (traceEnabled) {
start = new Date;
trace("(SchedulerDisabled)Execute  ::" + identifier + ":s")
}
delegate();
if (traceEnabled) {
trace("(SchedulerDisabled)Executed ::" + identifier + ":e ", (new Date - start) + "ms")
}
return {
cancel: noop, identifier: identifier
}
}
var task=new Task(delegate, priority, identifier);
taskPriorityQueue.push(task);
if (traceEnabled) {
trace("Submit   {0}::{1}  now #tasks={2} in queue".format(task.priorityFn(), task.identifier, taskPriorityQueue.getLength()))
}
next();
return {
cancel: function cancel() {
task.dispose(taskPriorityQueue);
if (traceEnabled) {
trace("Canceled ::{0} now #tasks= {1} in queue".format(task.identifier, taskPriorityQueue.getLength()))
}
}, identifier: identifier
}
}
;
function submit(task) {
return schedule(task.execute, task.getPriority, task.identifier)
}
;
return {
schedule: schedule, submit: submit, setBlockingPromise: setBlockingPromise, enableTrace: enableTrace, taskList: taskList, maxPromiseLifetimeMs: maxPromiseLifetimeMs
}
};
var SchedulerProxy=WinJS.Class.define(function SchedulerProxy_ctor(priorityDecorator, visibilityManager, id) {
this._priorityDecorator = (priorityDecorator ? priorityDecorator : function(pFn) {
return pFn
});
this.id = id;
this._visibilityManager = visibilityManager
}, {
id: null, _priorityDecorator: null, _visibilityManager: null, _needToNotify: false, isVisible: {get: function get() {
return this._visibilityManager ? this._visibilityManager.isVisible : false
}}, visibilityManager: {get: function get() {
return this._visibilityManager
}}, schedule: function schedule(delegate, priority, identifier) {
var priority=(typeof priority === "object" ? priority : wrapPriority(priority));
return CommonJS.Scheduler.schedule(delegate, this._priorityDecorator.bind(priority), this.id + ":" + identifier)
}, submit: function submit(task) {
return this.schedule(task.execute, task.getPriority, task.identifier)
}, setBlockingPromise: function setBlockingPromise(promise) {
return this._scheduler.setBlockingPromise(promise)
}, recalcVisibility: function recalcVisibility() {
if (this._visibilityManager) {
var wasVisible=this.isVisible;
this._visibilityManager.recalcVisibility();
if (wasVisible !== this.isVisible) {
this._needToNotify = true
}
}
return this._needToNotify
}, notifyVisibilityChangeListeners: function notifyVisibilityChangeListeners() {
this._needToNotify = false;
this.dispatchEvent("visibilityChanged", {
isVisible: this.isVisible, id: this.id
})
}, dispose: function dispose() {
this._listeners = {};
if (this._visibilityManager && this._visibilityManager.dispose) {
this._visibilityManager.dispose()
}
this._visibilityManager = null;
this._priorityDecorator = function() {
return 0
}
}
});
WinJS.Class.mix(SchedulerProxy, WinJS.Utilities.eventMixin);
var SchedulePromise=function(scheduler, priority, identifier, resultValue) {
var taskHandle=null,
promise;
if (scheduler && CommonJS.commonSchedulerEnabled) {
promise = new WinJS.Promise(function SchedulerTaskExecuted(c, e, p) {
var releasePromiseTaskDelegate=function releasePromiseTaskDelegate() {
c(resultValue);
resultValue = null
};
taskHandle = scheduler.schedule(releasePromiseTaskDelegate, priority, identifier)
}, function SchedulerTaskCanceled() {
taskHandle.cancel();
resultValue = null
});
promise.taskHandle = taskHandle
}
else {
promise = WinJS.Promise.wrap(resultValue)
}
return promise
};
var ScheduleTask=function(scheduler, delegate, priority, identifier) {
if (scheduler && CommonJS.commonSchedulerEnabled) {
return scheduler.schedule(delegate, priority, identifier)
}
;
delegate();
return {
cancel: noop, identifier: identifier
}
};
var SetSchedulerBlockingPromise=function(scheduler, promise) {
if (scheduler && CommonJS.commonSchedulerEnabled) {
return scheduler.setBlockingPromise(promise)
}
;
};
var taskList=function() {
return CommonJS.Scheduler.taskList()
};
var setSchedulerPromiseTimeoutMs=function(msTimeOut) {
CommonJS.Scheduler.maxPromiseLifetimeMs = msTimeOut
};
WinJS.Namespace.define("CommonJS", {
commonSchedulerEnabled: false, alwaysPassOnScheduler: false, Scheduler: new Scheduler, SchedulePromise: SchedulePromise, ScheduleTask: ScheduleTask, SetSchedulerBlockingPromise: SetSchedulerBlockingPromise, schedulerLoaded: true, SchedulerProxy: SchedulerProxy, TaskPriority: TaskPriority, taskList: taskList, setSchedulerPromiseTimeoutMs: setSchedulerPromiseTimeoutMs
})
})();
(function _statemachine_7() {
"use strict";
function noop(){}
function require(label, object) {
if (!object) {
var msg="StateMachine needs a non null " + label + " parameter";
console.log(msg);
throw msg;
}
}
var AllState="*";
var StateMachine=function(identifier, stateMachineConfig, targetObject, stateMachineScheduler, initialState, stateMachineInstance) {
var state=initialState,
mapping={},
transitions=(stateMachineConfig.transitions || []),
handlers=(stateMachineConfig.handlers || []),
requiredTargetFunctions=(stateMachineConfig.requiredTargetFunctions || []),
_traceEnabled=false;
stateMachineInstance = (stateMachineInstance || {});
identifier = (identifier || "");
function validateTargetObject(target, fnList) {
var missingFns=[];
for (var i=0; i < fnList.length; i++) {
var fnName=fnList[i];
if (!target[fnName]) {
missingFns.push(fnName)
}
}
if (missingFns.length > 0) {
var exceptionMsg="targetObject missing required functions in stateMachine construction. Missing " + missingFns.join(",");
throw exceptionMsg;
}
}
;
stateMachineInstance.enableStateMachineTrace = function(value) {
_traceEnabled = value
};
function trace(txt) {
if (_traceEnabled) {
console.log(identifier + ":" + txt)
}
}
function get(method, prefix) {
return handlers["on" + (prefix || "") + method] || noop
}
function map() {
for (var i=0; i < transitions.length; i++) {
var transition=transitions[i],
event=transition.event;
mapping[event] = (mapping[event] || {});
mapping[event][transition.from] = transition.to
}
}
function mixin(sm) {
for (var i=0; i < transitions.length; i++) {
var transition=transitions[i],
event=transition.event;
sm[event] = (sm[event] || create(event))
}
return sm
}
function create(event) {
return function _statemachine_92() {
var promise,
params=[targetObject].concat(Array.prototype.slice.call(arguments)),
source=state,
target=(mapping[event][source] || mapping[event][AllState]);
if (!target) {
trace(event + " " + source + " -> No Target so Ignored");
return
}
trace(event + " " + source + " -> " + target);
if (source) {
get(source, "exit").call(stateMachineInstance, {setPromise: function(p) {
promise = p
}})
}
if (!promise) {
state = target;
get(target, "enter").apply(stateMachineInstance, params);
get(target).apply(stateMachineInstance, params)
}
else {
promise.done(function _statemachine_117() {
state = target;
get(target, "enter").apply(stateMachineInstance, params);
get(target).apply(stateMachineInstance, params)
})
}
}
}
if (PlatformJS.isDebug) {
validateTargetObject(targetObject, requiredTargetFunctions)
}
if (!stateMachineInstance.setStateMachine) {
stateMachineInstance.setStateMachine = function(value) {
this._scheduler = value
}
}
stateMachineInstance.setStateMachine(stateMachineScheduler);
map();
return mixin(stateMachineInstance)
};
WinJS.Namespace.define("CommonJS.StateMachines", {
StateMachine: StateMachine, AllState: AllState
})
})();
(function _baseStateMachines_7() {
"use strict";
function _(){}
var AllState=CommonJS.StateMachines.AllState;
var transitions=[{
event: "initalize", from: AllState, to: "waiting"
}, {
event: "draw", from: "waiting", to: "pending"
}, {
event: "draw", from: "pending", to: "pending"
}, {
event: "execute", from: "pending", to: "predrawing"
}, {
event: "draw", from: "predrawing", to: "pending"
}, {
event: "execute", from: "predrawing", to: "drawing"
}, {
event: "draw", from: "predrawing", to: "pending"
}, {
event: "draw", from: "drawing", to: "drawing"
}, {
event: "wait", from: "drawing", to: "waiting"
}, {
event: "complete", from: "drawing", to: "complete"
}, {
event: "complete", from: "error", to: "complete"
}, {
event: "wait", from: "complete", to: "waiting"
}, {
event: "error", from: AllState, to: "error"
}, {
event: "finalize", from: AllState, to: "final"
}, {
event: "draw", from: "final", to: "final"
}, ];
var handlers={
onenterwaiting: function onenterwaiting(targetObject) {
var stateMachine=this;
if (stateMachine._drawTaskHandle) {
stateMachine._drawTaskHandle.cancel();
stateMachine._drawTaskHandle = null
}
}, onwaiting: function onwaiting(targetObject){}, onpending: function onpending(targetObject, response, responseType) {
var stateMachine=this;
var delegate=function(taskHandle) {
return stateMachine.execute(response, responseType, taskHandle)
};
var priority=CommonJS.TaskPriority.normal;
var identifier="drawing (" + responseType + ")";
stateMachine._drawTaskHandle = CommonJS.ScheduleTask(stateMachine._scheduler, delegate, priority, identifier)
}, onexitpending: function onexitpending(targetObject) {
var stateMachine=this;
if (stateMachine._drawTaskHandle) {
stateMachine._drawTaskHandle.cancel();
stateMachine._drawTaskHandle = null
}
}, onpredrawing: function onpredrawing(targetObject, response, responseType, schedulerTaskHandle) {
var stateMachine=this;
try {
if (!targetObject) {
debugger;
stateMachine.execute(response, responseType, schedulerTaskHandle)
}
else {
if (targetObject.prerenderImplStateMachine) {
targetObject.prerenderImplStateMachine(response, responseType, schedulerTaskHandle);
var delegate=function(taskHandle) {
return stateMachine.execute(response, responseType, taskHandle)
};
var priority=CommonJS.TaskPriority.normal;
var identifier="drawing (" + responseType + ")";
stateMachine._drawTaskHandle = CommonJS.ScheduleTask(stateMachine._scheduler, delegate, priority, identifier)
}
else {
stateMachine.execute(response, responseType, schedulerTaskHandle)
}
}
}
catch(err) {
stateMachine.error(err)
}
}, ondrawing: function ondrawing(targetObject, response, responseType, schedulerTaskHandle) {
var stateMachine=this;
try {
stateMachine._renderOperation = targetObject.renderResponseImplStateMachine(response, responseType, schedulerTaskHandle)
}
catch(err) {
stateMachine.error(err)
}
}, onexitdrawing: function onexitdrawing(targetObject) {
var stateMachine=this;
if (stateMachine._renderOperation && stateMachine._renderOperation.cancel) {
stateMachine._renderOperation.cancel()
}
stateMachine._renderOperation = null
}, oncomplete: function oncomplete(targetObject) {
var stateMachine=this;
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
if (targetObject && targetObject.completeRenderPromise) {
targetObject.completeRenderPromise()
}
else {
debugger
}
stateMachine.wait()
}, onerror: function onerror(targetObject, exception) {
var stateMachine=this;
if (targetObject && targetObject.onRenderError) {
targetObject.onRenderError(exception)
}
else {
debugger
}
stateMachine.complete()
}, onfinal: function onfinal(targetObject) {
var stateMachine=this;
targetObject.completeRenderPromise()
}
};
var requiredTargetFunctions=["onRenderError", "renderResponseImplStateMachine", "completeRenderPromise", ];
WinJS.Namespace.define("CommonJS.StateMachines.Render", {
transitions: transitions, handlers: handlers, requiredTargetFunctions: requiredTargetFunctions
})
})();
(function appexPlatformUIInit() {
"use strict";
function closeTooltip(element) {
var elemData=WinJS.Utilities.data(element);
var tooltip=elemData.tooltip;
if (tooltip) {
elemData.tooltip = null;
tooltip.close();
tooltip.dispose()
}
}
var ssrg=WinJS.UI._ItemEventsHandler.prototype._startSelfRevealGesture;
var swipeLeftTip=null,
swipeDownTip=null;
var T=Microsoft.Bing.AppEx.Telemetry;
var logClickUserAction=function(actionContext, userAction) {
T.FlightRecorder.logUserAction(T.LogLevel.normal, actionContext, userAction, T.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0)
};
var logAppAction=function(element, operation) {
T.FlightRecorder.logAppAction(T.LogLevel.normal, T.ActionContext.AppNotice, element, operation, 0)
};
function loadSwipeTipsString() {
try {
swipeLeftTip = PlatformJS.Services.resourceLoader.getString("/platform/swipeLeftToolTip");
swipeDownTip = PlatformJS.Services.resourceLoader.getString("/platform/swipeDownToolTip")
}
catch(e) {
console.warn("failed to load swipe to select tooltip string")
}
}
WinJS.UI._ItemEventsHandler.prototype._startSelfRevealGesture = function() {
ssrg.apply(this, arguments);
if (this._selfRevealGesture) {
var element=this._site.pressedItemBox;
if (!swipeLeftTip || !swipeDownTip) {
loadSwipeTipsString()
}
var swipeTipString=this._site.horizontal ? swipeDownTip : swipeLeftTip;
if (swipeTipString) {
var directionGlyph=this._site.horizontal ? "&#xE1FD;" : "&#xE112;";
var tooltip=new WinJS.UI.Tooltip(element, {innerHTML: directionGlyph + swipeTipString});
tooltip.open();
setTimeout(closeTooltip.bind(null, element), 5000)
}
}
};
var esrg=WinJS.UI._ItemEventsHandler.prototype._endSelfRevealGesture;
WinJS.UI._ItemEventsHandler.prototype._endSelfRevealGesture = function() {
var element=this._site.pressedItemBox;
if (element) {
closeTooltip(element)
}
esrg.apply(this, arguments)
};
WinJS.Namespace.define("CommonJS", {
RESPONSIVE_RESIZABLE_CLASS: "responsiveResizable", getAppName: function getAppName() {
var appName="";
try {
appName = CommonJS.resourceLoader.getString("AppTitle")
}
catch(e) {
appName = CommonJS.resourceLoader.getString("/platform/AppTitle")
}
return appName
}, _elementIds: 0, _previousTheme: "", setTheme: function setTheme(className, hasDarkBackground) {
msWriteProfilerMark("Platform:SetTheme:s");
WinJS.Utilities.removeClass(document.body, CommonJS._previousTheme);
if (className) {
WinJS.Utilities.addClass(document.body, className);
CommonJS._previousTheme = className
}
if (hasDarkBackground) {
WinJS.Utilities.addClass(document.body, "platformDarkBackground")
}
else {
WinJS.Utilities.removeClass(document.body, "platformDarkBackground")
}
msWriteProfilerMark("Platform:SetTheme:e")
}, setAutomationId: function setAutomationId(domElement, parent, suffix, id) {
var str=null;
if (id && id !== "") {
str = id
}
else if (!domElement.id && !parent && !suffix) {
CommonJS._elementIds++;
str = "platformUAId" + CommonJS._elementIds
}
else if (parent && suffix) {
str = parent.id + "_" + suffix
}
if (str) {
domElement.id = CommonJS.sanitizeId(str)
}
}, sanitizeId: function sanitizeId(id) {
return id.toString().replace(/\.| /g, "_")
}, createElement: function createElement(elementType, parent, suffix, id) {
var e=document.createElement(elementType);
CommonJS.setAutomationId(e, parent, suffix, id);
return e
}, cacheDataPlaceHolder: "cacheDataPlaceholder", disableAllEdgies: function disableAllEdgies(disabled) {
this._forEachEdgy(function platformUI_foreachEdgyDisable(edgy) {
if (edgy) {
edgy.disabled = disabled
}
})
}, dismissAllEdgies: function dismissAllEdgies() {
this._forEachEdgy(function platformUI_foreachEdgyHide(edgy) {
if (edgy && !edgy.hidden && edgy.hide) {
edgy.hide()
}
})
}, _forEachEdgy: function _forEachEdgy(f) {
var appbarDoms=WinJS.Utilities.query(".win-appbar");
for (var i=0; i < appbarDoms.length; i++) {
f(appbarDoms[i].winControl)
}
}, _fragmentCache: new PlatformJS.Utilities.MemoryCache(2), _templateCache: new PlatformJS.Utilities.MemoryCache(20), cellSizeInPixels: 100, setModuleSizeAndClass: function setModuleSizeAndClass(moduleInfo, div, gridLayout) {
if (moduleInfo.width && moduleInfo.height) {
var cellHeight=CommonJS.cellSizeInPixels,
cellWidth=CommonJS.cellSizeInPixels,
verticalSpacing=0,
horizontalSpacing=0,
width=0,
height=0;
if (gridLayout) {
if (gridLayout.horizontalSpacing < 0) {
PlatformJS.Utilities.onError("Horizontal spacing must be greater than or equal to 0")
}
if (gridLayout.horizontalSpacing) {
horizontalSpacing = gridLayout.horizontalSpacing
}
if (gridLayout.horizontalSpacing < 0) {
PlatformJS.Utilities.onError("Vertical spacing must be greater than or equal to 0")
}
if (gridLayout.verticalSpacing) {
verticalSpacing = gridLayout.verticalSpacing
}
if (gridLayout.cellHeight <= 0) {
PlatformJS.Utilities.onError("Cell height must be greater than 0")
}
if (gridLayout.cellHeight) {
cellHeight = gridLayout.cellHeight
}
if (gridLayout.cellWidth <= 0) {
PlatformJS.Utilities.onError("Cell width must be greater than 0")
}
if (gridLayout.cellWidth) {
cellWidth = gridLayout.cellWidth
}
}
if (isNaN(moduleInfo.width)) {
width = moduleInfo.width
}
else {
if (moduleInfo.width <= 0) {
PlatformJS.Utilities.onError("ModuleInfo width must be greater than 0")
}
width = ((moduleInfo.width * cellWidth) + (moduleInfo.width - 1) * horizontalSpacing) + "px"
}
if (isNaN(moduleInfo.height)) {
height = moduleInfo.height
}
else {
if (moduleInfo.height <= 0) {
PlatformJS.Utilities.onError("ModuleInfo height must be greater than 0")
}
height = ((moduleInfo.height * cellHeight) + (moduleInfo.height - 1) * verticalSpacing) + "px"
}
div.style.width = width;
div.style.height = height
}
if (moduleInfo.className) {
WinJS.Utilities.addClass(div, moduleInfo.className)
}
}, _createPlaceholder: function _createPlaceholder(data, div) {
var placeHolderContainer=document.createElement("div");
WinJS.Utilities.addClass(placeHolderContainer, "platformModuleContainer platformPlaceHolderContainer " + data.placeHolder);
div.appendChild(placeHolderContainer);
CommonJS.classifyPlaceholder(div);
return placeHolderContainer
}, classifyPlaceholder: function classifyPlaceholder(div, classification) {
if (!classification) {
var height=div.offsetHeight;
if (height > 250) {
classification = "large"
}
else if (height > 150 && height <= 250) {
classification = "medium"
}
else if (height <= 150 && height > 49) {
classification = "small"
}
else {
classification = "tiny"
}
}
switch (classification) {
case"hidden":
WinJS.Utilities.addClass(div, "platformPlaceHolderHidden");
break;
case"tiny":
WinJS.Utilities.addClass(div, "platformPlaceHolderTiny");
break;
case"small":
WinJS.Utilities.addClass(div, "platformPlaceHolderSmall");
break;
case"large":
WinJS.Utilities.addClass(div, "platformPlaceHolderLarge");
break;
case"medium":
default:
WinJS.Utilities.addClass(div, "platformPlaceHolderMedium");
break
}
}, _renderFragment: function _renderFragment(fragmentPath, data, div, item) {
return new WinJS.Promise(function platformUI_renderFragmentPromiseInit(complete, error) {
var cover=null,
placeHolder=null;
if (data.placeHolder && data.placeHolder !== CommonJS.cacheDataPlaceHolder) {
placeHolder = CommonJS.document._createPlaceholder(data, div);
if (data.dataPromise) {
complete(div);
data.dataPromise.then(function platformUI_dataPromiseComplete(actualData) {
var container=document.createElement(container);
WinJS.UI.Fragments.renderCopy(fragmentPath, container).then(function platformUI_fragmentWithPlaceholderRenderCopyComplete() {
var fragments=WinJS.Utilities.query(".fragment", container);
var elementToBind=fragments.length > 0 ? fragments[0] : container;
WinJS.UI.processAll(elementToBind).then(function platformUI_fragmentWithPlaceholderProcessAllComplete() {
WinJS.Resources.processAll(elementToBind).then(function platformUI_fragmentWithPlaceholderResourcesProcessAllComplete() {
WinJS.Binding.processAll(elementToBind, actualData).then(function platformUI_fragmentWithPlaceholderBindingProcessAll() {
WinJS.Utilities.addClass(container, "platformModuleContainer");
div.appendChild(container);
if (typeof item === "undefined" || item.isOnScreen()) {
div.removeChild(placeHolder)
}
else {
div.removeChild(placeHolder)
}
}, PlatformJS.Utilities.onError)
}, PlatformJS.Utilities.onError)
}, PlatformJS.Utilities.onError)
}, PlatformJS.Utilities.onError)
})
}
else {
PlatformJS.Utilities.onError("No data promise provided")
}
}
else if (data.placeHolder && data.placeHolder === CommonJS.cacheDataPlaceHolder) {
placeHolder = document.createElement("div");
cover = document.createElement("div");
WinJS.Utilities.addClass(cover, "platformCachedCover platformModuleContainer");
WinJS.Utilities.addClass(placeHolder, "platformModuleContainer");
div.appendChild(placeHolder);
placeHolder.appendChild(cover);
WinJS.UI.Fragments.renderCopy(fragmentPath, placeHolder).then(function platformUI_fragmentWithCacheRenderCopyComplete() {
var fragments=WinJS.Utilities.query(".fragment", placeHolder);
var elementToBind=fragments.length > 0 ? fragments[0] : placeHolder;
WinJS.UI.processAll(elementToBind).then(function platformUI_fragmentWithCacheProcessAllComplete() {
WinJS.Resources.processAll(elementToBind).then(function platformUI_fragmentWithCacheResourcesProcessAllComplete() {
WinJS.Binding.processAll(elementToBind, data).then(function platformUI_fragmentWithCacheBindingProcessAllComplete() {
complete(div);
if (data.dataPromise) {
data.dataPromise.then(function platformUI_dataPromiseComplete(actualData) {
var container=document.createElement("div");
WinJS.UI.Fragments.renderCopy(fragmentPath, container).then(function platformUI_fragmentWithCacheRenderCopyToContainerComplete() {
var fragments=WinJS.Utilities.query(".fragment", container);
var elementToBind=fragments.length > 0 ? fragments[0] : container;
WinJS.Binding.processAll(elementToBind, actualData).then(function platformUI_fragmentWithCacheBindDataComplete() {
WinJS.Utilities.addClass(container, "platformModuleContainer");
container.style.zIndex = -1;
div.appendChild(container);
if (typeof item === "undefined" || item.isOnScreen()) {
WinJS.UI.Animation.crossFade(container, placeHolder).then(function platformUI_crossFadeComplete() {
div.removeChild(placeHolder)
})
}
else {
div.removeChild(placeHolder)
}
}, PlatformJS.Utilities.onError)
}, PlatformJS.Utilities.onError)
})
}
else {
PlatformJS.Utilities.onError("No data promise provided")
}
}, PlatformJS.Utilities.onError)
}, PlatformJS.Utilities.onError)
}, PlatformJS.Utilities.onError)
}, PlatformJS.Utilities.onError)
}
else {
WinJS.UI.Fragments.renderCopy(fragmentPath, div).then(function platformUI_normalFragmentRenderCopyComplete() {
var fragments=WinJS.Utilities.query(".fragment", div);
var elementToBind=fragments.length > 0 ? fragments[0] : div;
WinJS.UI.processAll(elementToBind).then(function platformUI_normalFragmentBindComplete() {
WinJS.Resources.processAll(elementToBind).then(function platformUI_normalFragmentResourcesProcessAllComplete() {
WinJS.Binding.processAll(elementToBind, data).then(function platformUI_normalFragmentBindDataComplete() {
complete(div)
}, PlatformJS.Utilities.onError)
}, PlatformJS.Utilities.onError)
}, PlatformJS.Utilities.onError)
}, PlatformJS.Utilities.onError)
}
})
}, _renderTemplate: function _renderTemplate(template, data, div, item) {
return new WinJS.Promise(function platformUI_renderTemplatePromiseInit(complete, error) {
var placeHolder=null,
cover=null;
if (data.placeHolder && data.placeHolder !== CommonJS.cacheDataPlaceHolder) {
placeHolder = CommonJS._createPlaceholder(data, div);
if (data.dataPromise) {
complete(div);
data.dataPromise.then(function platformUI_actualDataPromiseComplete(actualData) {
template.render(actualData, null).then(function platformUI_renderActualDataComplete(container) {
WinJS.Utilities.addClass(container, "platformModuleContainer");
div.appendChild(container);
if (typeof item === "undefined" || item.isOnScreen()) {
div.removeChild(placeHolder)
}
else {
div.removeChild(placeHolder)
}
}, PlatformJS.Utilities.onError)
})
}
else {
PlatformJS.Utilities.onError("No data promise provided")
}
}
else if (data.placeHolder && data.placeHolder === CommonJS.cacheDataPlaceHolder) {
placeHolder = document.createElement("div");
cover = document.createElement("div");
WinJS.Utilities.addClass(cover, "platformCachedCover platformModuleContainer");
WinJS.Utilities.addClass(placeHolder, "platformModuleContainer");
div.appendChild(placeHolder);
placeHolder.appendChild(cover);
template.render(data, placeHolder).then(function platformUI_renderDataToPlaceholderComplete() {
complete(div);
if (data.dataPromise) {
data.dataPromise.then(function platformUI_actualDataPromiseComplete(actualData) {
template.render(actualData, null).then(function platformUI_renderActualDataComplete(container) {
WinJS.Utilities.addClass(container, "platformModuleContainer");
container.style.zIndex = -1;
div.appendChild(container);
if (typeof item === "undefined" || item.isOnScreen()) {
WinJS.UI.Animation.crossFade(container, placeHolder).then(function platformUI_crossFadeComplete() {
div.removeChild(placeHolder)
})
}
else {
div.removeChild(placeHolder)
}
}, PlatformJS.Utilities.onError)
})
}
else {
PlatformJS.Utilities.onError("No data promise provided")
}
}, PlatformJS.Utilities.onError)
}
else {
template.render(data, div).then(function platformUI_normalRenderTemplateComplete(container) {
complete(div)
}, PlatformJS.Utilities.onError)
}
})
}, _getTemplateKey: function _getTemplateKey(moduleInfo) {
if (moduleInfo.fragmentPath && moduleInfo.templateId) {
return moduleInfo.fragmentPath + "/" + moduleInfo.templateId
}
else if (moduleInfo.templateId) {
return WinJS.Navigation.location.fragment + "/" + moduleInfo.templateId
}
else {
return moduleInfo.fragmentPath
}
}, loadModule: function loadModule(moduleInfo, data, div, gridLayout, item) {
var uniqueMarker=moduleInfo.templateId;
msWriteProfilerMark("Platform:loadModule:" + uniqueMarker + ":s");
return new WinJS.Promise(function platformUI_loadModulePromiseInit(complete, error) {
if (moduleInfo.fragmentPath && moduleInfo.templateId) {
if (!div) {
div = document.createElement("div");
CommonJS.setModuleSizeAndClass(moduleInfo, div, gridLayout)
}
var templatePromise=CommonJS._fetchModule(moduleInfo);
if (WinJS.Promise.is(templatePromise)) {
templatePromise.then(function platformUI_templatePromiseComplete(template) {
CommonJS._renderTemplate(template, data, div, item).then(function platformUI_renderTemplateFromPromiseComplete() {
msWriteProfilerMark("Platform:loadModule:" + uniqueMarker + ":e");
complete(div)
})
}, error)
}
else {
CommonJS._renderTemplate(templatePromise, data, div, item).then(function platformUI_renderTemplateComplete() {
msWriteProfilerMark("Platform:loadModule:" + uniqueMarker + ":e");
complete(div)
})
}
}
else if (moduleInfo.fragmentPath) {
CommonJS.setModuleSizeAndClass(moduleInfo, div, gridLayout);
CommonJS._renderFragment(moduleInfo.fragmentPath, data, div, item).then(function platformUI_renderModuleFragmentPathComplete(div) {
complete(div);
msWriteProfilerMark("Platform:loadModule:" + uniqueMarker + ":e")
})
}
else if (moduleInfo.templateId) {
var key=CommonJS._getTemplateKey(moduleInfo),
templateControl=CommonJS._templateCache.getItem(key);
if (templateControl) {
CommonJS._renderTemplate(templateControl, data, div, item).then(function platformUI_renderTemplateFromIdComplete() {
msWriteProfilerMark("Platform:loadModule:" + uniqueMarker + ":e");
complete(div)
}, PlatformJS.Utilities.onError)
}
else {
var template=document.getElementById(moduleInfo.templateId);
if (template && template.winControl) {
CommonJS._renderTemplate(template.winControl, data, div, item).then(function platformUI_renderTemplateFromIdComplete() {
CommonJS._templateCache.addItem(key, template.winControl);
template.parentElement.removeChild(template);
msWriteProfilerMark("Platform:loadModule:" + uniqueMarker + ":e");
complete(div)
}, PlatformJS.Utilities.onError)
}
else {
if (PlatformJS.isDebug) {
PlatformJS.Utilities.onError("Unable to find template. Check templateId")
}
else {
complete(div)
}
}
}
}
else {
PlatformJS.Utilities.onError("Invalid id and fragment path")
}
})
}, _lastFragmentPath: null, _lastFragment: null, _fetchModule: function _fetchModule(moduleInfo) {
var key=CommonJS._getTemplateKey(moduleInfo),
template=CommonJS._templateCache.getItem(key);
if (template) {
return template
}
var promise=new WinJS.Promise(function platformUI_fetchModulePromiseInit(complete, error) {
var fragPromise=null;
if (moduleInfo.fragmentPath === CommonJS._lastFragmentPath) {
fragPromise = WinJS.Promise.wrap(CommonJS._lastFragment)
}
else {
fragPromise = WinJS.UI.Fragments.renderCopy(moduleInfo.fragmentPath)
}
fragPromise.then(function platformUI_moduleFragmentComplete(frag) {
CommonJS._lastFragment = frag;
CommonJS._lastFragmentPath = moduleInfo.fragmentPath;
var collection=WinJS.Utilities.query("#" + moduleInfo.templateId, frag);
if (collection.length > 0) {
template = collection[0];
WinJS.UI.processAll(template).then(function platformUI_templateProcessAllComplete() {
WinJS.Resources.processAll(template).then(function platformUI_templateResourcesProcessAllComplete() {
complete(template.winControl)
}, PlatformJS.Utilities.onError)
}, PlatformJS.Utilities.onError)
}
else {
var errorMsg={message: "Unable to find template"};
try {
errorMsg.moduleInfo = JSON.stringify(moduleInfo)
}
catch(ex) {}
PlatformJS.Utilities.onError(errorMsg);
error(errorMsg)
}
}, function platformUI_moduleFragmentError(errorMessage) {
if (errorMessage && errorMessage.name === "Canceled") {
return
}
var errorMsg={
message: "Unable to load the fragment.", innerMessage: errorMessage
};
try {
errorMsg.moduleInfo = JSON.stringify(moduleInfo)
}
catch(ex) {}
return PlatformJS.Utilities.onError(errorMsg)
})
});
CommonJS._templateCache.addItem(key, promise);
promise.then(function platformUI_fetchModuleComplete(template) {
CommonJS._templateCache.addItem(key, template)
});
return promise
}, ModuleControl: WinJS.Class.define(function moduleControl_ctor(domElement, options) {
this._domElement = domElement ? domElement : document.createElement("div");
this._moduleInfo = null;
this._data = null;
this._loadMode = CommonJS.ModuleControl.LoadOnData;
this._domElement.winControl = this;
this.oneTimeBinding = false;
WinJS.UI.setOptions(this, options)
}, {
_domElement: null, _moduleInfo: null, _data: null, _loadMode: null, oneTimeBinding: false, renderPromise: null, moduleInfo: {
get: function get() {
return this._moduleInfo
}, set: function set(value) {
this._moduleInfo = value;
if (this._moduleInfo) {
CommonJS.setModuleSizeAndClass(this._moduleInfo, this._domElement);
this._loadMode = this._moduleInfo.loadMode ? this._moduleInfo.loadMode : CommonJS.ModuleControl.LoadOnData
}
this._loadModule()
}
}, data: {
get: function get() {
return this._data
}, set: function set(value) {
this._data = value;
this._loadModule()
}
}, _loadModule: function _loadModule() {
if (this._moduleInfo) {
var that=this;
if ((this._loadMode === CommonJS.ModuleControl.LoadOnData && this._data) || (this._loadMode === CommonJS.ModuleControl.LoadImmediate)) {
this.renderPromise = CommonJS.loadModule(this._moduleInfo, this._data, this._domElement, null, this._fragmentOptions);
this.renderPromise.then(function moduleControl_loadModuleRenderPromiseComplete() {
if (that.oneTimeBinding) {
var elements=WinJS.Utilities.query("[data-win-bind]", that._domElement),
element=null,
i=0,
len=elements.length;
for (i = 0; i < len; i++) {
element = elements[i];
element.removeAttribute("data-win-bind")
}
}
}, PlatformJS.Utilities.onError)
}
}
}
}, {
LoadOnData: "loadOnData", LoadImmediate: "loadImmediate"
}), forceRefresh: function forceRefresh() {
PlatformJS.Navigation.mainNavigator.populatePage(true)
}, VirtualizedDataSource: WinJS.Class.derive(WinJS.UI.VirtualizedDataSource, function virtualizedDataSource_ctor(listDataAdapter) {
this._baseDataSourceConstructor(listDataAdapter)
}), _layoutStyleElem: null, deleteStyle: function deleteStyle(selector) {
var styleElem=CommonJS._layoutStyleElem;
if (styleElem) {
var rules=styleElem.sheet.cssRules;
for (var j=0, ruleCount=rules.length; j < ruleCount; j++) {
if (rules[j].selectorText.indexOf(selector) !== -1) {
styleElem.sheet.deleteRule(j);
break
}
}
}
}, getStyle: function getStyle(selector) {
var styleElem=CommonJS._layoutStyleElem;
if (styleElem) {
var rules=styleElem.sheet.cssRules;
for (var j=0, ruleCount=rules.length; j < ruleCount; j++) {
if (rules[j].selectorText.indexOf(selector) !== -1) {
return rules[j]
}
}
}
return null
}, addStyle: function addStyle(selector, property) {
CommonJS.deleteStyle(selector);
var styleElem=CommonJS._layoutStyleElem;
if (!CommonJS._layoutStyleElem) {
styleElem = CommonJS._layoutStyleElem = document.createElement("style");
document.head.appendChild(styleElem)
}
var rule=selector + " { " + property + " }";
styleElem.sheet.insertRule(rule, 0)
}, getDimension: function getDimension(element, property) {
return WinJS.Utilities.convertToPixels(element, window.getComputedStyle(element, null)[property])
}, getMargins: function Layout_getMargins(element) {
return {
left: CommonJS.getDimension(element, "marginLeft"), right: CommonJS.getDimension(element, "marginRight"), top: CommonJS.getDimension(element, "marginTop"), bottom: CommonJS.getDimension(element, "marginBottom")
}
}, getOuter: function getOuter(side, element) {
return CommonJS.getDimension(element, "margin" + side) + CommonJS.getDimension(element, "border" + side + "Width") + CommonJS.getDimension(element, "padding" + side)
}, getOuterHeight: function getOuterHeight(element) {
return CommonJS.getOuter("Top", element) + CommonJS.getOuter("Bottom", element)
}, getOuterWidth: function getOuterWidth(element) {
return CommonJS.getOuter("Left", element) + CommonJS.getOuter("Right", element)
}, getTotalWidth: WinJS.Utilities.getTotalWidth, getTotalHeight: WinJS.Utilities.getTotalHeight, getContentWidth: WinJS.Utilities.getContentWidth, getContentHeight: WinJS.Utilities.getContentHeight, getPosition: WinJS.Utilities.getPosition, getRelativeLeft: function getRelativeLeft(elChild, elAncestor) {
var offsetLeft=elChild.offsetLeft,
elParent=elChild.offsetParent,
ancestorParent=elAncestor.offsetParent;
while (elParent) {
if (elParent === ancestorParent) {
offsetLeft -= elAncestor.offsetLeft;
break
}
else if (elParent === elAncestor) {
break
}
offsetLeft += elParent.offsetLeft;
elParent = elParent.offsetParent
}
return offsetLeft
}, getRelativeTop: function getRelativeTop(elChild, elAncestor) {
var offsetTop=elChild.offsetTop,
elParent=elChild.offsetParent,
ancestorParent=elAncestor.offsetParent;
while (elParent) {
if (elParent === ancestorParent) {
offsetTop -= elAncestor.offsetTop;
break
}
else if (elParent === elAncestor) {
break
}
offsetTop += elParent.offsetTop;
elParent = elParent.offsetParent
}
return offsetTop
}, getAncestorByClassName: function getAncestorByClassName(element, className) {
var elm=element.parentElement;
while (elm) {
if (WinJS.Utilities.hasClass(elm, className)) {
break
}
elm = elm.parentElement
}
return elm
}, _rtl: null, isRtl: function isRtl() {
if (CommonJS._rtl === null) {
CommonJS._rtl = window.getComputedStyle(document.body, null).direction === "rtl"
}
return CommonJS._rtl
}, _MIN_AUTOSCROLL_RATE: 150, _MAX_AUTOSCROLL_RATE: 1500, _AUTOSCROLL_THRESHOLD: 100, _AUTOSCROLL_DELAY: 50, checkAutoScroll: function checkAutoScroll(viewport, viewportWidth, viewX) {
var travelRate=0;
var x=CommonJS.isRtl() ? viewportWidth - viewX : viewX;
if (x < CommonJS._AUTOSCROLL_THRESHOLD) {
travelRate = x - CommonJS._AUTOSCROLL_THRESHOLD
}
else if (x > (viewportWidth - CommonJS._AUTOSCROLL_THRESHOLD)) {
travelRate = (x - (viewportWidth - CommonJS._AUTOSCROLL_THRESHOLD))
}
travelRate = (travelRate / CommonJS._AUTOSCROLL_THRESHOLD) * (CommonJS._MAX_AUTOSCROLL_RATE - CommonJS._MIN_AUTOSCROLL_RATE);
if (travelRate === 0) {
if (this._autoScrollDelay) {
clearTimeout(CommonJS._autoScrollDelay);
CommonJS._autoScrollDelay = 0
}
}
else {
if (!CommonJS._autoScrollDelay && !CommonJS._autoScrollFrame) {
CommonJS._autoScrollDelay = setTimeout(function _ui_1111() {
if (CommonJS._autoScrollRate) {
CommonJS._lastDragTimeout = performance.now();
var nextFrame=function() {
if (!CommonJS._autoScrollRate && CommonJS._autoScrollFrame) {
CommonJS.stopAutoScroll()
}
else {
var currentTime=performance.now();
var delta=CommonJS._autoScrollRate * ((currentTime - CommonJS._lastDragTimeout) / 1000);
try {
viewport.scrollLeft += delta;
CommonJS._lastDragTimeout = currentTime;
CommonJS._autoScrollFrame = requestAnimationFrame(nextFrame)
}
catch(e) {
CommonJS.stopAutoScroll()
}
}
};
CommonJS._autoScrollFrame = requestAnimationFrame(nextFrame)
}
}, CommonJS._AUTOSCROLL_DELAY)
}
}
CommonJS._autoScrollRate = travelRate
}, stopAutoScroll: function stopAutoScroll() {
if (CommonJS._autoScrollDelay) {
clearTimeout(CommonJS._autoScrollDelay);
CommonJS._autoScrollDelay = 0
}
CommonJS._autoScrollRate = 0;
CommonJS._autoScrollFrame = 0
}, _pxPerRem: 0, _remChangedListener: {}, _remChangedListenerId: 1, _updateRemLength: function _updateRemLength() {
var elem=CommonJS._remElement;
if (elem) {
CommonJS._pxPerRem = elem.offsetWidth / 1000
}
}, _onRemLengthChanged: function _onRemLengthChanged(e) {
CommonJS._pxPerRem = 0;
for (var id in CommonJS._remChangedListener) {
if (CommonJS._remChangedListener[id]) {
CommonJS._remChangedListener[id]()
}
}
}, addRemLengthChangedListener: function addRemLengthChangedListener(listener) {
if (listener) {
var id=CommonJS._remChangedListenerId;
CommonJS._remChangedListenerId++;
CommonJS._remChangedListener[id] = listener;
return id
}
else {
return null
}
}, removeRemLengthChangedListener: function removeRemLengthChangedListener(id) {
if (id) {
delete CommonJS._remChangedListener[id]
}
}, setRemLength: function setRemLength(px) {
if (typeof px === "number") {
CommonJS.addStyle("html.platformRemLengthRoot", " font-size: " + px + "px")
}
}, pxToRem: function pxToRem(px) {
if (!CommonJS._pxPerRem) {
CommonJS._updateRemLength()
}
if (CommonJS._pxPerRem) {
if (px === undefined || px === null) {
px = 1
}
return (px / CommonJS._pxPerRem)
}
else {
console.warn("CommonJS._pxPerRem could not initialized");
return 0
}
}, remToPx: function remToPx(rem) {
if (!CommonJS._pxPerRem) {
CommonJS._updateRemLength()
}
if (CommonJS._pxPerRem) {
if (rem === undefined || rem === null) {
rem = 1
}
return (rem * CommonJS._pxPerRem)
}
else {
console.warn("CommonJS._pxPerRem could not initialized");
return 0
}
}
});
WinJS.Utilities.ready(function CreateRemElement() {
if (!window.commonRemElement) {
var remElem=window.commonRemElement = document.createElement("div");
remElem.id = "platformRemDetection";
remElem.style.width = "1000rem";
remElem.style.height = "1rem";
remElem.style.border = "none";
remElem.style.padding = "0";
remElem.style.margin = "0";
remElem.style.position = "absolute";
remElem.style.visibility = "hidden";
if (CommonJS.isRtl()) {
remElem.style.right = "-1000rem"
}
else {
remElem.style.left = "-1000rem"
}
remElem.style.top = "-1rem";
document.body.appendChild(remElem);
WinJS.Utilities.addClass(document.documentElement, "platformRemLengthRoot");
CommonJS._remElement = remElem;
remElem.addEventListener("mselementresize", CommonJS._onRemLengthChanged)
}
}, true).done();
WinJS.Namespace.define("CommonJS.NetworkIndicator", {
_indicator: null, statusChange: function statusChange(event) {
var hasNetworkConnection=false;
if (PlatformJS.isPlatformInitialized) {
hasNetworkConnection = Platform.Networking.NetworkManager.instance.isNetworkAvailable
}
else {
hasNetworkConnection = PlatformJS.Utilities.hasInternetConnection()
}
if (!hasNetworkConnection || PlatformJS.mainProcessManager.retailModeEnabled) {
CommonJS.NetworkIndicator.show()
}
else {
CommonJS.NetworkIndicator.hide()
}
}, updateNetworkStatusChangedEventRegistration: function updateNetworkStatusChangedEventRegistration() {
Platform.Networking.NetworkManager.addEventListener("networkstatuschanged", CommonJS.NetworkIndicator.statusChange);
Windows.Networking.Connectivity.NetworkInformation.removeEventListener("networkstatuschanged", CommonJS.NetworkIndicator.statusChange)
}, _createRetailModeIndicator: function _createRetailModeIndicator(indicator) {
var demoModeText=document.createElement("div");
WinJS.Utilities.addClass(demoModeText, "platformRetailModeText");
demoModeText.innerText = CommonJS.resourceLoader.getString("/Platform/demoMode_label");
indicator.appendChild(demoModeText);
WinJS.Utilities.addClass(indicator, "platformRetailModeIndicator")
}, _createOfflineModeIndicator: function _createOfflineModeIndicator(indicator) {
var offlineText=document.createElement("div");
WinJS.Utilities.addClass(offlineText, "platformNetworkIndicatorText");
offlineText.innerText = CommonJS.resourceLoader.getString("/Platform/offline_label");
indicator.appendChild(offlineText);
var offlineIcon=document.createElement("div");
WinJS.Utilities.addClass(offlineIcon, "platformNetworkIndicatorIcon");
indicator.appendChild(offlineIcon);
var offlineIconCross=document.createElement("div");
WinJS.Utilities.addClass(offlineIconCross, "platformNetworkIndicatorIconCross");
indicator.appendChild(offlineIconCross)
}, _createAndShowNetworkIndicator: function _createAndShowNetworkIndicator() {
var networkIndicator=document.createElement("div");
if (PlatformJS.mainProcessManager.retailModeEnabled) {
CommonJS.NetworkIndicator._createRetailModeIndicator(networkIndicator)
}
else {
CommonJS.NetworkIndicator._createOfflineModeIndicator(networkIndicator)
}
document.body.appendChild(networkIndicator);
WinJS.Utilities.addClass(networkIndicator, "platformNetworkIndicator");
CommonJS.NetworkIndicator._indicator = networkIndicator
}, show: function show() {
var platformNetworkIndicator=CommonJS.NetworkIndicator;
if (!platformNetworkIndicator._indicator) {
WinJS.Utilities.ready(this._createAndShowNetworkIndicator(), true).done()
}
else {
WinJS.Utilities.removeClass(platformNetworkIndicator._indicator, "platformNetworkIndicatorHide")
}
}, hide: function hide() {
if (CommonJS.NetworkIndicator._indicator) {
WinJS.Utilities.addClass(CommonJS.NetworkIndicator._indicator, "platformNetworkIndicatorHide")
}
}, showNetworkMessage: function showNetworkMessage(resourceString) {
var localSettings=Windows.Storage.ApplicationData.current.localSettings;
var appName=CommonJS.getAppName();
var networkMessage=PlatformJS.Services.resourceLoader.getString(resourceString).format(appName);
var messageBar=new CommonJS.MessageBar(networkMessage);
messageBar.addButton(PlatformJS.Services.resourceLoader.getString("/platform/okButton"), function platformNetworkIndicator_onClose() {
messageBar.hide();
localSettings.values["networkStateDismissed"] = true
});
messageBar.show();
localSettings.values["networkStateDismissed"] = false;
localSettings.values["lastNetworkStateNotificationString"] = resourceString
}, navigated: function navigated() {
var localSettings=Windows.Storage.ApplicationData.current.localSettings;
var dismissed=localSettings.values["networkStateDismissed"];
if (dismissed === false) {
CommonJS.NetworkIndicator.showNetworkMessage(localSettings.values.lookup("lastNetworkStateNotificationString"))
}
}, checkNetworkState: function checkNetworkState() {
var currentTime=(new Date).getTime(),
overLimit=false,
roaming=false,
shouldCheck=true,
localSettings=null,
lastCheck=null;
var networkAvailable=Platform.Networking.NetworkManager.instance.isNetworkAvailable;
if (networkAvailable) {
overLimit = Platform.Networking.NetworkManager.instance.isOverDataLimit;
roaming = Platform.Networking.NetworkManager.instance.isRoaming;
localSettings = Windows.Storage.ApplicationData.current.localSettings;
if (overLimit || roaming) {
lastCheck = localSettings.values.lookup("lastNetworkStateNotification");
if (lastCheck !== null) {
shouldCheck = currentTime - lastCheck > PlatformJS.Services.configuration.getInt32("NetworkStateNotificationInterval", 30 * 60 * 1000)
}
if (shouldCheck) {
if (overLimit) {
CommonJS.NetworkIndicator.showNetworkMessage("/platform/overLimitMessage")
}
else {
CommonJS.NetworkIndicator.showNetworkMessage("/platform/roamingMessage")
}
localSettings.values["lastNetworkStateNotification"] = currentTime
}
}
else {
localSettings.values["networkStateDismissed"] = true
}
}
}
});
Windows.Networking.Connectivity.NetworkInformation.addEventListener("networkstatuschanged", CommonJS.NetworkIndicator.statusChange);
WinJS.Navigation.addEventListener("navigated", CommonJS.NetworkIndicator.navigated);
WinJS.Namespace.define("CommonJS.Update", {showForceUpdate: function showForceUpdate(storeUrl, forceUpdate) {
var buttons=[{
label: PlatformJS.Services.resourceLoader.getString("/platform/updateMessage_button1"), clickHandler: function platformUpdate_onForceUpdate(event) {
if (storeUrl) {
var launchOptions=new Windows.System.LauncherOptions;
launchOptions.desiredRemainingView = Windows.UI.ViewManagement.ViewSizePreference.useNone;
Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(storeUrl), launchOptions)
}
}
}];
if (!forceUpdate) {
buttons.push({
label: PlatformJS.Services.resourceLoader.getString("/platform/updateMessage_button2"), clickHandler: function platformUpdate_onCancel(event){}
})
}
;
var messageData={
title: CommonJS.resourceLoader.getString("/platform/updateTitle"), message: CommonJS.resourceLoader.getString("/platform/updateMessage").format(CommonJS.getAppName()), defaultFocusButtonIndex: 0, defaultCancelButtonIndex: 1, styleClass: "fre", buttons: buttons
};
var messageDialog=new CommonJS.UI.MessageDialog(messageData);
try {
messageDialog.showAsync()
}
catch(e) {}
;
}});
(function _ui_1440() {
var contextMain="Market change main dialog";
var contextClose="Market change close dialog";
var defaultMarket=null;
var suggestedMarket=null;
var isAnyDialogActive=false;
var selectDefaultMarket=function() {
isAnyDialogActive = false;
Platform.Globalization.Marketization.setCurrentMarket(defaultMarket.valueAsString);
logClickUserAction(contextMain, "Market Change: default Market selected")
};
var selectChangeToProposedMarket=function() {
isAnyDialogActive = false;
Platform.Globalization.Marketization.setCurrentMarket(suggestedMarket.valueAsString);
Platform.Globalization.Marketization.hasPendingUpdate = true;
logClickUserAction(contextMain, "Market Change: Started: changing from " + defaultMarket.valueAsString + " to " + suggestedMarket.valueAsString);
CommonJS.Settings.showCloseAppDialog(false)
};
var selectOtherMarket=function() {
isAnyDialogActive = false;
Platform.Globalization.Marketization.setCurrentMarket(defaultMarket.valueAsString);
CommonJS.MarketPicker.context = "messagedialog_marketchangeprompt";
PlatformJS.mainProcessManager.showSettings();
logClickUserAction(contextMain, "Market change: otherMarket option selected ")
};
var onCloseApp=function() {
isAnyDialogActive = false;
logClickUserAction(contextClose, "closeApp");
PlatformJS.mainProcessManager.resetBootCacheAsync().then(function updateMarketSettings() {
PlatformJS.mainProcessManager.forceSuspend();
PlatformJS.mainProcessManager.exitApplicationWithWorkarounds("OnMarketChange: A market update was detected. Closing app.", false)
});
logAppAction("Market change: Finalized: Changed from " + defaultMarket.valueAsString + " to " + CommonJS.MarketPicker.selectedMarket + ". Closing app.")
};
var onGoBack=function(eventinfo) {
isAnyDialogActive = false;
Platform.Globalization.Marketization.setCurrentMarket(defaultMarket.valueAsString);
Platform.Globalization.Marketization.hasPendingUpdate = false;
CommonJS.MarketPicker.context = "messagedialog_marketchangeprompt";
PlatformJS.mainProcessManager.showSettings();
logClickUserAction(contextClose, "Market Change: Reverted Market Change.Going Back to market Settings charm")
};
var onCloseAppCancel=function() {
isAnyDialogActive = false;
Platform.Globalization.Marketization.setCurrentMarket(defaultMarket.valueAsString);
Platform.Globalization.Marketization.hasPendingUpdate = false;
logClickUserAction(contextClose, "Market Change: Reverted Market Change. Market Change Cancelled" + defaultMarket.valueAsString)
};
var constructDialogData=function(dialogTitle, dialogMessage, buttonArray) {
var dialogData={
title: dialogTitle, message: dialogMessage, styleClass: "fre", buttons: buttonArray
};
return dialogData
};
WinJS.Namespace.define("CommonJS.Settings", {
isDialogActive: function isDialogActive() {
return isAnyDialogActive
}, showMarketChangeMsgDialog: function showMarketChangeMsgDialog(msgData) {
if (isAnyDialogActive) {
return
}
var msgDialog=new CommonJS.UI.MessageDialog(msgData);
isAnyDialogActive = true;
msgDialog.showAsync();
logAppAction(contextMain, "MarketChange: Displaying Market change dialog")
}, showCloseAppDialog: function showCloseAppDialog(isSettingsDialog) {
if (isAnyDialogActive) {
return
}
var closeDialog;
if (!defaultMarket) {
defaultMarket = Platform.Globalization.Marketization.getCurrentMarketInfo()
}
var buttonsArray=[];
buttonsArray.push({
label: CommonJS.resourceLoader.getString("/platform/closeAppButton"), clickHandler: onCloseApp
});
if (isSettingsDialog) {
buttonsArray.push({
label: CommonJS.resourceLoader.getString("/platform/GoBack"), clickHandler: onGoBack
});
closeDialog = new CommonJS.UI.MessageDialog(constructDialogData(CommonJS.resourceLoader.getString("/platform/marketChangePrompt"), null, buttonsArray))
}
else {
buttonsArray.push({
label: CommonJS.resourceLoader.getString("/platform/Cancel"), clickHandler: onCloseAppCancel
});
closeDialog = new CommonJS.UI.MessageDialog(constructDialogData(CommonJS.resourceLoader.getString("/platform/marketSelDialogTitle"), CommonJS.resourceLoader.getString("/platform/marketChangePrompt"), buttonsArray))
}
isAnyDialogActive = true;
closeDialog.showAsync();
logAppAction(contextClose, "OnMarketChange:Displaying close dialog")
}, showMarketNotification: function showMarketNotification() {
var marketPickerEnabled=PlatformJS.BootCache.instance.getEntry("App.MarketPickerEnabled", function isMarketPickerEnabled() {
return PlatformJS.Services.configuration.getBool("MarketPickerEnabled", true)
});
if (!marketPickerEnabled) {
return
}
var that=this;
Platform.Globalization.Marketization.checkForMarketValidityAsync().then(function validateMarketComplete(validationResponse) {
if (validationResponse.validationResult !== Platform.Globalization.MarketValidity.isValid) {
var buttonArray=[];
defaultMarket = Platform.Globalization.Marketization.getCurrentMarketInfo();
var notificationReason="";
for (var x in Platform.Globalization.MarketValidity) {
if (x && (Platform.Globalization.MarketValidity[x] === validationResponse.validationResult)) {
notificationReason = x
}
}
logAppAction(contextMain, "Market Change Notification: ReasonId: " + validationResponse.validationResult + " Reason: " + notificationReason + " default Market " + defaultMarket.valueAsString);
var defaultMarketRegion=Platform.Globalization.MarketResources.getLocalizedRegionDisplayName(defaultMarket.geographicRegion);
var defaultMarketLang=Platform.Globalization.MarketResources.getLocalizedLanguageDisplayName(defaultMarket.language);
buttonArray.push({
label: CommonJS.resourceLoader.getString("/platform/changeMarketTo").format(defaultMarketRegion, defaultMarketLang), clickHandler: selectDefaultMarket
});
if (validationResponse.candidateMarket) {
suggestedMarket = validationResponse.candidateMarket;
var suggestedMarketRegion=Platform.Globalization.MarketResources.getLocalizedRegionDisplayName(suggestedMarket.geographicRegion);
var suggestedMarketLang=Platform.Globalization.MarketResources.getLocalizedLanguageDisplayName(suggestedMarket.language);
buttonArray.push({
label: CommonJS.resourceLoader.getString("/platform/changeMarketTo").format(suggestedMarketRegion, suggestedMarketLang), clickHandler: selectChangeToProposedMarket
})
}
buttonArray.push({
label: CommonJS.resourceLoader.getString("/platform/other"), clickHandler: selectOtherMarket
});
if (buttonArray.length === 3) {
logAppAction(contextMain, "Market Change: Setting up Dialog with Suggested Market as " + suggestedMarket.valueAsString)
}
else {
logAppAction(contextMain, "Market Change: Setting up Dialog without Suggested Market")
}
that.showMarketChangeMsgDialog(constructDialogData(CommonJS.resourceLoader.getString("/platform/marketSelDialogTitle"), CommonJS.resourceLoader.getString("/platform/marketSelDialogMsg").format(defaultMarketRegion, defaultMarketLang) + " " + CommonJS.resourceLoader.getString("/platform/appRestart"), buttonArray))
}
}, function locationFromServer_Error(){})
}, getDefaultSettingsCommand: function getDefaultSettingsCommand() {
return new Windows.UI.ApplicationSettings.SettingsCommand("SettingsPage", CommonJS.resourceLoader.getString("/platform/optionsTitle"), function platformSettings_defaultSettings() {
CommonJS.Settings.showDefaultSettingsFlyout()
})
}, addCommonButtons: function addCommonButtons(vector) {
var appSettings=Windows.UI.ApplicationSettings;
var personalizationCmd=new appSettings.SettingsCommand("PersonalizationPage", CommonJS.resourceLoader.getString("/platform/TitleAccountsSettings"), CommonJS.PrivacySettings.onPrivacySettingsCmd);
vector.append(personalizationCmd);
if (PlatformJS.Services.isConfigurationInitialized) {
var feedbackEnabled=PlatformJS.Services.configuration.getDictionary("Feedback").getBool("FeedbackEnabled");
if (feedbackEnabled) {
var feedbackCmd=new appSettings.SettingsCommand("feedbackPage", CommonJS.resourceLoader.getString("/platform/sendFeedbackButtonLabel"), CommonJS.Feedback.onFeedbackCmd);
vector.append(feedbackCmd)
}
}
var touCmd=new appSettings.SettingsCommand("touPage", CommonJS.resourceLoader.getString("/platform/lca_serviceAgreement"), CommonJS.Settings.onTOUCmd);
vector.append(touCmd);
var privacyCmd=new appSettings.SettingsCommand("privacyPage", CommonJS.resourceLoader.getString("/platform/lca_privacy"), CommonJS.Settings.onPrivacyCmd);
vector.append(privacyCmd);
if (PlatformJS.Services.isConfigurationInitialized) {
var impLink=PlatformJS.Services.configuration.getDictionary("Setting").getString("ImpressumLink");
if (impLink) {
var impCmd=new appSettings.SettingsCommand("impPage", CommonJS.resourceLoader.getString("/platform/impressum"), CommonJS.Settings.onImpCmd);
vector.append(impCmd)
}
var governmentID=PlatformJS.Services.configuration.getDictionary("Setting").getString("GovernmentID");
if (governmentID) {
var text=governmentID;
var icpString=PlatformJS.Services.configuration.getDictionary("Setting").getString("ICPNumber");
if (icpString) {
text = text + '\n' + icpString
}
var governmentIDCmd=new appSettings.SettingsCommand("GovernmentIDPage", text, CommonJS.Settings.onGovernmentIDCmd);
vector.append(governmentIDCmd)
}
}
var adsSetting=null;
for (var i=0, len=vector.size; i < len; i++) {
adsSetting = vector.getAt(i);
if (adsSetting && adsSetting.id === "msaAdSettings") {
vector.removeAt(i);
vector.append(adsSetting);
break
}
}
}, onTOUCmd: function onTOUCmd(ev) {
logClickUserAction("About settings flyout", "Terms of Use link");
var link=PlatformJS.Services.configuration.getDictionary("Setting").getString("TermsOfUseLink");
if (link) {
window.open(link);
logAppAction("About settings flyout", "Terms of Use webpage shown")
}
}, onTOUCmdKeyDown: function onTOUCmdKeyDown(event) {
if (event && event.keyCode && event.keyCode === WinJS.Utilities.Key.enter) {
CommonJS.Settings.onTOUCmd(event)
}
}, onPrivacyCmd: function onPrivacyCmd(ev) {
logClickUserAction("About settings flyout", "Privacy Statement link");
var link=PlatformJS.Services.configuration.getDictionary("Setting").getString("PrivacyStatementLink");
if (link) {
window.open(link);
logAppAction("About settings flyout", "Privacy statement webpage shown")
}
}, onPrivacyCmdKeyDown: function onPrivacyCmdKeyDown(event) {
if (event && event.keyCode && event.keyCode === WinJS.Utilities.Key.enter) {
CommonJS.Settings.onPrivacyCmd(event)
}
}, onHelpCmd: function onHelpCmd(evt) {
if (!Platform.Networking.NetworkManager.instance.isNetworkAvailable) {
CommonJS.Error.showError(CommonJS.Error.NO_INTERNET, null, null, true);
CommonJS.dismissAllEdgies()
}
var link="";
if (PlatformJS.Services.appConfig) {
link = PlatformJS.Services.appConfig.getString("HelpURL")
}
if (!link) {
link = PlatformJS.Services.configuration.getDictionary("Setting").getString("HelpPageLink")
}
if (link) {
try {
var uri=new Windows.Foundation.Uri(link);
var options=new Windows.System.LauncherOptions;
options.desiredRemainingView = Windows.UI.ViewManagement.ViewSizePreference.useHalf;
Windows.System.Launcher.launchUriAsync(uri, options)
}
catch(e) {
console.warn("Failed to navigate to " + link + ", the exception: " + e)
}
}
else {
console.warn("This app does not provide a help website URL")
}
}, onHelpCmdFromSettingsCharm: function onHelpCmdFromSettingsCharm(evt) {
CommonJS.Settings.onHelpCmd();
T.FlightRecorder.logUserActionWithJsonAttributes(T.LogLevel.normal, T.ActionContext.charms, "Help link", T.UserActionOperation.click, T.UserActionMethod.unknown, 0, "")
}, onCreditsLinkFromSettingsCharm: function onCreditsLinkFromSettingsCharm(evt) {
if (!Platform.Networking.NetworkManager.instance.isNetworkAvailable) {
CommonJS.Error.showError(CommonJS.Error.NO_INTERNET, null, null, true);
CommonJS.dismissAllEdgies()
}
var link=PlatformJS.Services.configuration.getDictionary("Setting").getString("CreditsLink");
if (link) {
try {
var uri=new Windows.Foundation.Uri(link);
var options=new Windows.System.LauncherOptions;
options.desiredRemainingView = Windows.UI.ViewManagement.ViewSizePreference.useHalf;
Windows.System.Launcher.launchUriAsync(uri, options)
}
catch(e) {
console.warn("Failed to navigate to " + link + ", the exception: " + e)
}
}
else {
console.warn("This app does not provide a help website URL")
}
}, getHelpButton: function getHelpButton() {
var helpButton=document.createElement("button");
var helpButtonCommand=new WinJS.UI.AppBarCommand(helpButton, {
icon: "\uFF60", extraClass: "appexSymbol", label: PlatformJS.Services.resourceLoader.getString("/platform/HelpLabel")
});
helpButton.id = "helpButton";
helpButtonCommand.onclick = WinJS.Utilities.markSupportedForProcessing(function execute_helpButtonClick(e) {
CommonJS.Settings.onHelpCmd();
T.FlightRecorder.logUserActionWithJsonAttributes(T.LogLevel.normal, T.ActionContext.appBar, "Help button", T.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, "")
});
return helpButton
}, onImpCmd: function onImpCmd(ev) {
var link=PlatformJS.Services.configuration.getDictionary("Setting").getString("ImpressumLink");
if (link) {
window.open(link)
}
}, onGovernmentIDCmd: function onGovernmentIDCmd(ev){}, onICPCmd: function onICPCmd(ev){}, getTermsOfUseUrl: function getTermsOfUseUrl() {
return PlatformJS.Services.configuration.getDictionary("Urls").getString("TermsOfUse")
}, getPrivacyUrl: function getPrivacyUrl() {
return PlatformJS.Services.configuration.getDictionary("Urls").getString("PrivacyStatement")
}, showDefaultSettingsFlyout: function showDefaultSettingsFlyout() {
var page=PlatformJS.Utilities.getControl("platformSettingsPage");
if (page) {
page.show()
}
else {
var container=null;
WinJS.UI.Fragments.renderCopy("/common/html/configurationFragment.html", document.body).then(function platformSettings_configurationFragmentRenderComplete(doc) {
container = document.getElementById("platformSettingsPage");
var title=PlatformJS.Services.resourceLoader.getString("/platform/optionsTitle");
var optionsBackbuttonclick=WinJS.Utilities.markSupportedForProcessing(WinJS.UI.SettingsFlyout.show);
var dataContext={
pageTitle: title, optionsBackbuttonclick: optionsBackbuttonclick
};
return WinJS.Binding.processAll(container, dataContext)
}).then(function platformSettings_configurationFragmentBindingComplete() {
return WinJS.UI.processAll(container)
}).done(function platformSettings_configurationFragmentProcessAllComplete() {
var page=container.winControl;
page.addEventListener("afterhide", CommonJS.processListener.enableSearchOnType);
page.addEventListener("aftershow", CommonJS.processListener.disableSearchOnType);
page.show()
})
}
}
})
})()
})();
(function AppexWaterMarkInit() {
"use strict";
WinJS.Namespace.define("CommonJS.Watermark", {
Init: function Init() {
WinJS.Navigation.addEventListener("beforenavigate", function clearWatermarkReference() {
CommonJS.Watermark._element = null;
CommonJS.Watermark._messageCollections = [];
if (CommonJS.Watermark._dismissMessageTimeout) {
clearTimeout(CommonJS.Watermark._dismissMessageTimeout);
CommonJS.Watermark._dismissMessageTimeout = null
}
if (CommonJS.Watermark._eventManager) {
CommonJS.Watermark._eventManager.dispose();
CommonJS.Watermark._eventManager = null
}
})
}, setElement: function setElement(watermark) {
CommonJS.Watermark._element = watermark;
CommonJS.Watermark._registerCurrentChanged()
}, setWatermarkHtml: function setWatermarkHtml(innerHtml, startTime, duration, callback, priority) {
CommonJS.Watermark._setWatermark(innerHtml ? toStaticHTML(innerHtml) : null, CommonJS.Watermark.TYPE.HTML, startTime, duration, callback, priority)
}, setWatermarkText: function setWatermarkText(text, startTime, duration, callback, priority) {
var content=text;
if (PlatformJS.mainProcessManager.retailModeEnabled) {
content = CommonJS.resourceLoader.getString("/Platform/demoMode_lastUpdated")
}
CommonJS.Watermark._setWatermark(content, CommonJS.Watermark.TYPE.TEXT, startTime, duration, callback, priority)
}, STARTTIME: {
NOW: 1, NEXT: 2
}, TYPE: {
HTML: 1, TEXT: 2
}, PRIORITY: {
PRIVACYWARING: 1, SERVERMESSAGE: 3, APPMESSAGE: 5
}, _registerCurrentChanged: function _registerCurrentChanged() {
var panel=document.getElementsByClassName("platformPanorama");
panel = panel.length ? panel[0].winControl : null;
if (panel) {
if (!CommonJS.Watermark._eventManager) {
CommonJS.Watermark._eventManager = new CommonJS.Utils.EventListenerManager("WaterMark event listeners")
}
CommonJS.Watermark._eventManager.add(panel, "currentchanged", CommonJS.Watermark._onCurrentChanged, "WaterMark onCurrentChanged")
}
}, _getElement: function _getElement() {
if (!CommonJS.Watermark._element) {
var elements=document.getElementsByClassName("platformWatermark");
if (elements & elements.length) {
CommonJS.Watermark._element = elements[0];
CommonJS.Watermark._registerCurrentChanged()
}
}
return CommonJS.Watermark._element
}, _onCurrentChanged: function _onCurrentChanged(event) {
var current=event.detail,
element=CommonJS.Watermark._getElement();
if (element) {
if (current && current.index !== 0) {
WinJS.Utilities.addClass(element, "watermarkOnNormalClusters")
}
else {
WinJS.Utilities.removeClass(element, "watermarkOnNormalClusters")
}
}
}, _setWatermark: function _setWatermark(content, type, startTime, duration, callback, priority) {
content = content || "";
if (startTime !== CommonJS.Watermark.STARTTIME.NOW && startTime !== CommonJS.Watermark.STARTTIME.NEXT) {
startTime = CommonJS.Watermark.STARTTIME.NOW
}
duration = duration || 0;
if (!priority || isNaN(priority) || priority < CommonJS.Watermark.PRIORITY.PRIVACYWARING || priority > CommonJS.Watermark.PRIORITY.APPMESSAGE) {
priority = CommonJS.Watermark.PRIORITY.APPMESSAGE
}
var message={
content: content, type: type, startTime: startTime, duration: duration, callback: callback, priority: priority
},
collection=CommonJS.Watermark._getCollection(priority),
showNow=false,
firstAtPriority=false,
currentMessagePriority=CommonJS.Watermark._currentMessage ? CommonJS.Watermark._currentMessage.priority : CommonJS.Watermark.PRIORITY.APPMESSAGE + 1;
if (startTime === CommonJS.Watermark.STARTTIME.NOW) {
collection.length = 0
}
if (collection.length === 0) {
firstAtPriority = true
}
if (currentMessagePriority > priority) {
console.assert(firstAtPriority === true, "a higher priority message doesn't overwrite a lower priority message");
showNow = true
}
else if (currentMessagePriority === priority && firstAtPriority === true) {
showNow = true
}
if (startTime === CommonJS.Watermark.STARTTIME.NOW && duration) {
message.endTime = new Date((new Date).getTime() + duration)
}
collection.push(message);
if (showNow) {
CommonJS.Watermark._showMessage(message)
}
}, _getCollection: function _getCollection(priority) {
if (!CommonJS.Watermark._messageCollections[priority]) {
CommonJS.Watermark._messageCollections[priority] = []
}
return CommonJS.Watermark._messageCollections[priority]
}, _showMessage: function _showMessage(message) {
var element=CommonJS.Watermark._getElement();
CommonJS.Watermark._currentMessage = message;
if (element) {
element.innerHTML = "";
if (message) {
var content=message.content;
if (content) {
if (message.type === CommonJS.Watermark.TYPE.HTML) {
element.innerHTML = content
}
else {
element.textContent = content
}
element.tabIndex = 0
}
else {
element.tabIndex = -1
}
if (CommonJS.Watermark._dismissMessageTimeout) {
clearTimeout(CommonJS.Watermark._dismissMessageTimeout);
CommonJS.Watermark._dismissMessageTimeout = null
}
var duration=0;
if (message.endTime) {
duration = message.endTime.getTime() - (new Date).getTime()
}
else if (message.duration) {
duration = message.duration;
message.endTime = new Date((new Date).getTime() + duration)
}
if (duration) {
CommonJS.Watermark._dismissMessageTimeout = setTimeout(CommonJS.Watermark._dismissMessage, duration)
}
else if (!content) {
CommonJS.Watermark._dismissMessage()
}
if (message.callback) {
message.callback()
}
}
else {
element.tabIndex = -1
}
}
}, _dismissMessage: function _dismissMessage() {
var message=CommonJS.Watermark._currentMessage;
CommonJS.Watermark._dismissMessageTimeout = null;
var collection=CommonJS.Watermark._getCollection(message.priority);
if (collection && collection[0] === message) {
collection.shift()
}
CommonJS.Watermark._showMessage();
CommonJS.Watermark._updateMessage()
}, _updateMessage: function _updateMessage() {
var now=new Date,
messageToShow=null;
for (var priority in CommonJS.Watermark._messageCollections) {
var collection=CommonJS.Watermark._messageCollections[priority];
while (collection && collection.length) {
var message=collection[0];
if (!message || message.endTime < now) {
collection.shift()
}
else {
messageToShow = message;
break
}
}
if (messageToShow) {
CommonJS.Watermark._showMessage(messageToShow);
break
}
}
}, _element: null, _currentMessage: null, _messageCollections: [], _dismissMessageTimeout: null, _eventManager: null
})
})();
(function DOMProxyInit(WinJS) {
"use strict";
var NS=WinJS.Namespace.define("CommonJS", {DOMProxy: WinJS.Class.define(function domProxy_ctor(tag, options) {
this._tag = tag;
this._classNames = [];
this._styleString = "";
this._style = {};
this._attributes = [];
this._childNodes = []
}, {
_tag: "", _classNames: null, _styleString: "", _style: null, _attributes: null, _innerHTML: "", _outerHTML: "", _childNodes: null, _div: null, tag: {get: function get() {
return this._tag
}}, className: {
get: function get() {
return this._classNames.join(" ")
}, set: function set(className) {
this._classNames = [];
this._classNames.push(className);
this._outerHTML = ""
}
}, attributes: {get: function get() {
return this._attributes
}}, style: {get: function get() {
var styleObject=this._style;
if (this._styleString === "" && Object.keys(styleObject).length > 0) {
var styleString=[];
for (var key in styleObject) {
styleString.push(styleObject[key])
}
this._styleString = styleString.join(";") + ';'
}
return this._styleString
}}, getInnerHTMLTree: function getInnerHTMLTree() {
return window.toStaticHTML(this.innerHTML)
}, innerHTML: {
get: function get() {
if (this._innerHTML !== "") {
return this._innerHTML
}
var childNodes=this._childNodes;
var innerHTMLString=[];
for (var i=0, iLen=childNodes.length; i < iLen; i++) {
innerHTMLString.push(childNodes[i].outerHTML)
}
this._innerHTML = innerHTMLString.join("");
return this._innerHTML
}, set: function set(innerHTML) {
this._innerHTML = innerHTML
}
}, outerHTML: {
get: function get() {
if (this._outerHTML !== "") {
return this._outerHTML
}
var outerHTMLPrefix=["<", this._tag];
if (this._classNames.length > 0) {
outerHTMLPrefix.push(' class="', this.className, '"')
}
if (this.style !== "") {
outerHTMLPrefix = outerHTMLPrefix.concat(' style="', this.style, '"')
}
if (this._attributes.length > 0) {
outerHTMLPrefix.push(" ", this._attributes.join(" "))
}
outerHTMLPrefix.push(">");
var outerHTMLPostfix=["</", this._tag, ">"];
this._outerHTML = outerHTMLPrefix.concat(this.innerHTML, outerHTMLPostfix).join("");
return this._outerHTML
}, set: function set(outerHTML) {
this._outerHTML = outerHTML
}
}, innerText: {get: function get() {
var div=this._div;
if (!div) {
div = this._div = document.createElement("div")
}
div.innerHTML = this.innerHTML;
return div.innerText
}}, createDOM: function createDOM() {
var container=document.createElement("div");
container.innerHTML = this.outerHTML;
return container.childNodes[0]
}, childNodes: {get: function get() {
return this._childNodes
}}, addClass: function addClass(className) {
this._classNames.push(className);
this._outerHTML = ""
}, setAttribute: function setAttribute(attribute, value) {
var attributeString=attribute + '="' + value + '"';
this._attributes.push(attributeString);
this._outerHTML = ""
}, addStyle: function addStyle(styleKey, value) {
var styleString=styleKey + ":" + value;
this._style[styleKey] = styleString;
this._outerHTML = "";
this._styleString = ""
}, appendChild: function appendChild(childElement) {
if (childElement) {
this._childNodes.push(childElement);
this._innerHTML = "";
this._outerHTML = ""
}
}
})})
})(WinJS);
(function appexPlatformControlsResourceInit() {
"use strict";
WinJS.Namespace.define("CommonJS", {
_resourceLoader: null, resourceLoader: {get: function get() {
if (!CommonJS._resourceLoader) {
CommonJS._resourceLoader = (PlatformJS.Services && PlatformJS.Services.resourceLoader) ? PlatformJS.Services.resourceLoader : new Platform.Resources.StringResourceLoader
}
return CommonJS._resourceLoader
}}, reloadResourceLoader: function reloadResourceLoader() {
CommonJS._resourceLoader = (PlatformJS.Services && PlatformJS.Services.resourceLoader) ? PlatformJS.Services.resourceLoader : new Platform.Resources.StringResourceLoader
}, resourceTester: {tryGetString: function tryGetString(string) {
var result={
hasValue: false, value: null
};
try {
var resourceString=string.indexOf("/") > -1 ? string : ("resources/" + string);
result.value = Windows.ApplicationModel.Resources.Core.ResourceManager.current.mainResourceMap.lookup(resourceString).resolve().valueAsString;
result.hasValue = true
}
catch(e) {}
return result
}}
})
})();
(function appexPlatformControlsFeedbackInit() {
"use strict";
WinJS.Namespace.define("CommonJS.Feedback", {
_showSearchCharmOnKeyboardInput: true, showBdiReportForm: function showBdiReportForm(data) {
CommonJS.Feedback.addBdiReportFragment(data).then(function feedback_addBdiReportComplete(flyout) {
if (flyout) {
flyout.addEventListener("afterhide", function feedback_onAfterHideBdiReport(event) {
CommonJS.Feedback.removeBdiReportFragment()
});
flyout.show()
}
})
}, addBdiReportFragment: function addBdiReportFragment(data) {
var bdiReportDivId="BdiReportFragment";
var bdiReportDiv=document.getElementById(bdiReportDivId);
if (!bdiReportDiv) {
bdiReportDiv = document.createElement("div");
bdiReportDiv.id = bdiReportDivId;
document.body.appendChild(bdiReportDiv)
}
var promise=new WinJS.Promise(function feedback_addBdiReportPagePromiseInit(complete) {
WinJS.UI.Fragments.renderCopy("/common/html/bdiReportFragment.html", bdiReportDiv).then(function feedback_renderCopyBdiReportFragmentComplete(doc) {
var categoryText=CommonJS.resourceLoader.getString("/platform/feedbackButtonLabel");
var submitLabel=CommonJS.resourceLoader.getString("/platform/feedbackSubmitButtonLabel");
var dataContext={
categoryText: "What's wrong with this article?", submitLabel: submitLabel, data: data
};
WinJS.Binding.processAll(bdiReportDiv, dataContext);
WinJS.UI.processAll(bdiReportDiv);
WinJS.Resources.processAll(bdiReportDiv);
complete(PlatformJS.Utilities.getControl("SharedBdiReportPage"))
}, function feedback_fragmentRenderCopyError(error) {
complete(null)
})
});
return promise
}, removeBdiReportFragment: function removeBdiReportFragment() {
var bdiReportDiv=document.getElementById("BdiReportFragment");
if (bdiReportDiv) {
document.body.removeChild(bdiReportDiv)
}
}, onFeedbackCmd: function onFeedbackCmd(ev) {
console.log("onFeedbackCmd");
CommonJS.Feedback.addFeedbackPageFragment().then(function feedback_addFeedbackPageComplete(feedbackFlyout) {
if (feedbackFlyout) {
feedbackFlyout.addEventListener("afterhide", function feedbackFlyout_onAfterHide(event) {
CommonJS.Feedback.removeFeedbackPageFragment()
});
feedbackFlyout.addEventListener("aftershow", function feedbackFlyout_onAfterShow(event) {
var userSuggest=document.getElementById("userSuggest");
if (userSuggest) {
userSuggest.focus()
}
});
var question1=document.getElementById("question1");
var question2=document.getElementById("question2");
if (question1) {
question1.selectedIndex = -1
}
if (question2) {
question2.selectedIndex = -1
}
feedbackFlyout.show()
}
})
}, removeFeedbackPageFragment: function removeFeedbackPageFragment() {
CommonJS.processListener.enableSearchOnType();
var feedbackElement=document.getElementById("FeedbackPageDiv");
if (feedbackElement) {
document.body.removeChild(feedbackElement)
}
}, addFeedbackPageFragment: function addFeedbackPageFragment() {
CommonJS.processListener.disableSearchOnType();
var feedbackElement=document.getElementById("FeedbackPageDiv");
if (!feedbackElement) {
feedbackElement = document.createElement("div");
feedbackElement.id = "FeedbackPageDiv";
document.body.appendChild(feedbackElement)
}
var promise=new WinJS.Promise(function feedback_addFeedbackPagePromiseInit(complete) {
WinJS.UI.Fragments.renderCopy("/common/html/feedbackFragment.html", feedbackElement).then(function feedback_renderCopyFragmentComplete(doc) {
var categoryText=CommonJS.resourceLoader.getString("/platform/feedbackButtonLabel");
var questionTitle=CommonJS.resourceLoader.getString("/platform/feedbackCommentQuestion");
var autosavedComment="";
var currentTime=new Date;
if (CommonJS.feedbackAutosaveTime && (currentTime.getTime() - CommonJS.feedbackAutosaveTime) < 1000 * 60 * 30) {
if (CommonJS.feedbackAutosave) {
autosavedComment = CommonJS.feedbackAutosave;
CommonJS.feedbackAutosaveTime = currentTime.getTime()
}
}
var privacyStatementText=CommonJS.resourceLoader.getString("/platform/feedbackPrivacyStatementLabel");
var privacyStatementUrl=PlatformJS.Services.configuration.getDictionary("Setting").getString("PrivacyStatementLink");
var submitLabel=CommonJS.resourceLoader.getString("/platform/feedbackSubmitButtonLabel");
var freeformTextWarning=CommonJS.resourceLoader.getString("/platform/freeformTextWarning");
var feedbackBackbuttonclick=WinJS.Utilities.markSupportedForProcessing(WinJS.UI.SettingsFlyout.show);
var submitButtonclick=WinJS.Utilities.markSupportedForProcessing(CommonJS.Feedback.sendFeedback);
var dataContext={
submitLabel: submitLabel, categoryText: categoryText, questionTitle: questionTitle, autosavedComment: autosavedComment, privacyStatementUrl: privacyStatementUrl, privacyStatementText: privacyStatementText, feedbackBackbuttonclick: feedbackBackbuttonclick, submitButtonclick: submitButtonclick, freeformTextWarning: freeformTextWarning
};
for (var qIndex=1; qIndex <= 2; qIndex++) {
dataContext["question" + qIndex] = CommonJS.resourceLoader.getString("/platform/feedbackQuestion" + qIndex);
for (var i=1; i <= 5; i++) {
dataContext["question" + qIndex + "option" + i] = CommonJS.resourceLoader.getString("/platform/feedbackQ" + qIndex + "option" + i)
}
}
WinJS.Binding.processAll(feedbackElement, dataContext);
WinJS.UI.processAll(feedbackElement);
WinJS.Resources.processAll(feedbackElement);
complete(PlatformJS.Utilities.getControl("SharedFeedbackPage"))
}, function feedback_fragmentRenderCopyError(error) {
complete(null)
})
});
return promise
}
})
})();
(function appexPlatformControlsToggleGroupInit() {
"use strict";
WinJS.Namespace.define("CommonJS", {ToggleGroup: WinJS.Class.define(function toggleGroup_ctor(element, options) {
this.element = element || document.createElement("div");
this.element.setAttribute("role", "radiogroup");
CommonJS.setAutomationId(this.element);
WinJS.Utilities.addClass(this.element, "platformActionBarItem");
this.element.winControl = this;
this._states = {};
WinJS.UI.setOptions(this, options)
}, {
_states: null, _currentState: null, element: null, onStateChange: null, currentState: {
set: function set(value) {
if (this._currentState) {
this._states[this._currentState].button.selected = false
}
this._currentState = value;
if (this._states[this._currentState]) {
this._states[this._currentState].button.selected = true
}
else {
PlatformJS.Utilities.onError("Invalid button state id")
}
}, get: function get() {
return this._currentState
}
}, states: {set: function set(value) {
msWriteProfilerMark("Platform:ToggleGroup:states:s");
var i=0,
state=null,
that=this;
this._states = {};
for (i = 0; i < value.length; i++) {
state = value[i];
this._states[state.id] = state;
if (typeof state.id === "undefined" || state.id === null) {
PlatformJS.Utilities.onError("ID must be included in a button state")
}
(function toggleGroup_createStateChangeButton(state) {
state.button = new CommonJS.Button(CommonJS.createElement("button", that.element, state.id), {
title: state.title, onclick: function onclick(event) {
if (that.currentState !== state.id) {
that.currentState = state.id;
if (that.onStateChange) {
that.onStateChange(that.currentState)
}
}
}, mode: CommonJS.Button.Radio
});
state.button.element.setAttribute("role", "radio");
that.element.appendChild(state.button.element)
})(state)
}
msWriteProfilerMark("Platform:ToggleGroup:states:e")
}}
})})
})();
(function appexPlatformControlsFlyoutManagerInit(WinJS) {
"use strict";
var FlyoutManagerImpl=WinJS.Class.define(function flyoutManagerImpl_ctor() {
var container=document.getElementById("platformFlyoutContainer");
if (!container) {
container = this._createContainer()
}
this._container = container;
WinJS.Navigation.addEventListener("beforenavigate", this._onBeforeNavigate.bind(this))
}, {
_container: null, getFlyoutElement: function getFlyoutElement() {
var element=document.createElement("div");
this._container.appendChild(element);
return element
}, _createContainer: function _createContainer() {
var container=document.createElement("div");
container.id = "platformFlyoutContainer";
var parent=document.getElementById("platformPageArea").parentElement;
parent.appendChild(container);
return container
}, _onBeforeNavigate: function _onBeforeNavigate() {
var container=this._container;
WinJS.Utilities.empty(container)
}
});
var _instance=null;
WinJS.Namespace.define("CommonJS", {FlyoutManager: {get: function get() {
if (!_instance) {
_instance = new FlyoutManagerImpl
}
return _instance
}}})
})(WinJS);
(function appexPlatformControlsFullScreenInit() {
"use strict";
var FullScreenImpl=WinJS.Class.mix(WinJS.Class.define(function fullScreenImpl_ctor() {
this._element = document.getElementById("fullScreenContainer");
if (!this._element) {
this._element = document.createElement("div");
WinJS.Utilities.addClass(this._element, "platformFullScreenContainer");
this._element.id = "fullScreenContainer";
var fsContainerElement=document.getElementById("platformPageArea");
if (!fsContainerElement) {
return null
}
fsContainerElement = fsContainerElement.parentElement;
fsContainerElement.appendChild(this._element);
this._element.winControl = this;
var that=this
}
}, {
_fullScreenContentElement: null, canEnterFullScreen: function canEnterFullScreen() {
return !this._fullScreenContentElement
}, tryEnterFullScreen: function tryEnterFullScreen(fullScreenContentElement) {
if (this._fullScreenContentElement) {
return false
}
this._fullScreenContentElement = fullScreenContentElement;
fullScreenContentElement.inlineParentElement = fullScreenContentElement.parentElement;
fullScreenContentElement.parentElement.removeChild(fullScreenContentElement);
this._element.appendChild(fullScreenContentElement);
this._element.style.display = "block";
var that=this;
this.dispatchEvent("EnterFullScreen", this._fullScreenContentElement);
WinJS.UI.Animation.fadeIn(this._fullScreenContentElement).done(function _Miscellaneous_445() {
that.dispatchEvent("FullScreenEntered", that._fullScreenContentElement)
});
return true
}, tryLeaveFullScreen: function tryLeaveFullScreen() {
if (!this._fullScreenContentElement) {
return false
}
var that=this;
WinJS.UI.Animation.fadeOut(this._fullScreenContentElement).done(function afterFullScreenFadeOut() {
if (that._fullScreenContentElement) {
that._element.removeChild(that._fullScreenContentElement);
that._fullScreenContentElement.inlineParentElement.appendChild(that._fullScreenContentElement);
that._fullScreenContentElement.inlineParentElement = null;
var eventProperties=that._fullScreenContentElement;
that._element.style.display = "none";
that._fullScreenContentElement = null;
that.dispatchEvent("FullScreenExit", eventProperties)
}
});
return true
}
}), WinJS.Utilities.eventMixin);
var _instance=null;
WinJS.Namespace.define("CommonJS", {FullScreen: {get: function get() {
if (!_instance) {
_instance = new FullScreenImpl
}
return _instance
}}})
})();
(function appexPlatformControlsHTMLElementInit() {
"use strict";
function getDimensionLeft(element, property, mirror) {
var computedStyle=window.getComputedStyle(element),
targetProperty=property + (computedStyle.direction === "rtl" && !mirror ? "Right" : "Left"),
value=computedStyle[targetProperty];
return parseInt(value) || 0
}
HTMLElement.prototype.getOffset = function() {
return this.getOffsetLeft()
};
HTMLElement.prototype.getOffsetLeft = function() {
if (window.getComputedStyle(this).direction === "rtl") {
if (!this.offsetParent) {
return 0
}
var element=this;
var parent=element.offsetParent;
return parent.offsetWidth - element.offsetLeft - element.offsetWidth
}
else {
return this.offsetLeft
}
};
HTMLElement.prototype.setOffsetLeft = function(value) {
if (window.getComputedStyle(this).direction === "rtl") {
var element=this;
var parent=element.offsetParent;
this.offsetLeft = parent.offsetWidth - value - element.offsetWidth
}
else {
this.offsetLeft = value
}
};
HTMLElement.prototype.getMarginLeft = function() {
return getDimensionLeft(this, "margin")
};
HTMLElement.prototype.setMarginLeft = function(value) {
if (window.getComputedStyle(this).direction === "rtl") {
this.style.marginRight = value
}
else {
this.style.marginLeft = value
}
};
HTMLElement.prototype.getMarginRight = function() {
return getDimensionLeft(this, "margin", true)
};
HTMLElement.prototype.setMarginRight = function(value) {
if (window.getComputedStyle(this).direction === "rtl") {
this.style.marginLeft = value
}
else {
this.style.marginRight = value
}
};
HTMLElement.prototype.getPaddingLeft = function() {
return getDimensionLeft(this, "padding")
};
HTMLElement.prototype.setPaddingLeft = function(value) {
if (window.getComputedStyle(this).direction === "rtl") {
this.style.paddingRight = value
}
else {
this.style.paddingLeft = value
}
};
HTMLElement.prototype.getLeft = function() {
if (window.getComputedStyle(this).direction === "rtl") {
return this.style.right
}
else {
return this.style.left
}
};
HTMLElement.prototype.setLeft = function(value) {
if (window.getComputedStyle(this).direction === "rtl") {
this.style.right = value
}
else {
this.style.left = value
}
}
})();
(function appexPlatformErrorInit() {
"use strict";
WinJS.Namespace.define("CommonJS.Error", {
_errorControl: null, _callback: null, _type: null, NO_INTERNET: "noInternet", STANDARD_ERROR: "standardError", DEMO_MODE: "demoMode", errorExists: function errorExists() {
return this._errorControl !== null
}, errorType: function errorType() {
return this._type
}, invokeCallback: function invokeCallback() {
if (this._callback) {
this._callback()
}
}, removeError: function removeError(restoreProgress) {
if (CommonJS.Error._errorControl) {
var element=CommonJS.Error._errorControl.element;
if (element && element.parentNode) {
element.parentNode.removeChild(element)
}
CommonJS.Error._errorControl = null;
var elementsToShow=WinJS.Utilities.query(".platformHideableContent", document.body);
var i=0;
for (i = 0; i < elementsToShow.length; i++) {
WinJS.Utilities.removeClass(elementsToShow[i], "platformHide")
}
if (restoreProgress) {
for (var type in this._previousProgressCounts) {
for (i = 0; i < this._previousProgressCounts[type]; i++) {
CommonJS.Progress.showProgress(type)
}
}
}
}
}, _previousProgressCounts: [], showError: function showError(type, callback, customErrorControl, suspend, host, options) {
try {
throw new Error;
}
catch(error) {
PlatformJS.Telemetry.flightRecorder.logCodeError(PlatformJS.Telemetry.logLevel.normal, "error page shown", error.stack)
}
if (PlatformJS.mainProcessManager.retailModeEnabled) {
type = CommonJS.Error.DEMO_MODE
}
if (suspend) {
if (CommonJS.Error._errorControl) {
return
}
this._previousProgressCounts = [];
for (var progressType in CommonJS.Progress._counts) {
this._previousProgressCounts[progressType] = CommonJS.Progress._counts[progressType]
}
}
CommonJS.Progress.resetAll();
CommonJS.Error.removeError();
CommonJS.Error._type = type;
CommonJS.Error._callback = function errorControl_callback() {
CommonJS.Error.removeError();
if (callback) {
callback()
}
};
if (customErrorControl) {
CommonJS.Error._errorControl = customErrorControl
}
else {
options = options || {};
options.type = CommonJS.Error._type;
options.callback = CommonJS.Error._callback;
CommonJS.Error._errorControl = new CommonJS.ErrorControl(null, options)
}
var elementsToHide=WinJS.Utilities.query(".platformHideableContent");
for (var i=0; i < elementsToHide.length; i++) {
WinJS.Utilities.addClass(elementsToHide[i], "platformHide")
}
var parent=host || document.body;
parent.appendChild(CommonJS.Error._errorControl.element);
PlatformJS.mainProcessManager.afterFirstView()
}, showSystemMessage: function showSystemMessage(errorText, callback, isSticky, closeButtonHidden, additionalClass) {
CommonJS.dismissAllEdgies();
var div=document.createElement("div"),
flyout=null;
WinJS.Utilities.addClass(div, "platformSystemFlyout");
if (additionalClass) {
WinJS.Utilities.addClass(div, additionalClass)
}
flyout = new CommonJS.Flyout(div, {
buttonText: "", contentFragment: {
path: "/common/html/platform.html", id: "platformSystemMessage", data: {message: errorText}
}, isSticky: isSticky, closeButtonHidden: closeButtonHidden
});
flyout.onHide = callback;
PlatformJS.mainProcessManager.afterFirstView()
}, showMarketError: function showMarketError() {
var marketError=new Windows.UI.Popups.MessageDialog(PlatformJS.Services.resourceLoader.getString("/platform/marketError"));
marketError.commands.append(new Windows.UI.Popups.UICommand(PlatformJS.Services.resourceLoader.getString("/platform/okButton"), function platformError_showMarketError(){}));
PlatformJS.mainProcessManager.afterFirstView();
try {
marketError.showAsync()
}
catch(e) {}
;
}, showCatastrophicError: function showCatastrophicError(e) {
throw e;
}, getErrorModuleItem: function getErrorModuleItem(retryCallback, width, height, messageResource, errorContainerClassName) {
var messageLocation=messageResource || "/platform/standardErrorDescription";
return {
message: PlatformJS.Services.resourceLoader.getString(messageLocation), retryCallback: retryCallback, moduleInfo: {
width: width ? width : "250px", height: height ? height : "250px", isInteractive: true, disableHover: true, fragmentPath: "/common/html/platform.html", templateId: "platformErrorModule"
}, errorContainerClassName: errorContainerClassName ? "platformErrorModule " + errorContainerClassName : "platformErrorModule"
}
}, getProgressModuleItem: function getProgressModuleItem(width, height) {
return {moduleInfo: {
width: width ? width : "450px", height: height ? height : "100%", isInteractive: true, disableHover: true, fragmentPath: "/common/html/platform.html", templateId: "platformProgressModule"
}}
}, networkChangedHandler: function networkChangedHandler() {
try {
if (PlatformJS.Utilities.hasInternetConnection()) {
if (CommonJS.Error.errorExists() && CommonJS.Error.errorType() === CommonJS.Error.NO_INTERNET) {
CommonJS.Error.invokeCallback()
}
var errorModules=WinJS.Utilities.query(".platformRetryButton", document.body);
for (var i=0; i < errorModules.length; i++) {
var errorModule=errorModules.get(i);
if (errorModule.onclick) {
errorModule.onclick()
}
}
}
}
catch(e) {}
}, updateNetworkChangedHandler: function updateNetworkChangedHandler() {
Platform.Networking.NetworkManager.addEventListener("networkstatuschanged", CommonJS.Error.networkChangedHandler);
Windows.Networking.Connectivity.NetworkInformation.removeEventListener("networkstatuschanged", CommonJS.Error.networkChangedHandler)
}
});
WinJS.Navigation.addEventListener("navigating", CommonJS.Error.removeError);
Windows.Networking.Connectivity.NetworkInformation.addEventListener("networkstatuschanged", CommonJS.Error.networkChangedHandler)
})();
(function appexPlatformControlsErrorControlInit() {
"use strict";
var NS=WinJS.Namespace.define("CommonJS", {ErrorControl: WinJS.Class.define(function errorControl_ctor(element, options) {
var type=options.type;
if (type !== CommonJS.Error.STANDARD_ERROR && type !== CommonJS.Error.NO_INTERNET && type !== CommonJS.Error.DEMO_MODE) {
debugger;
PlatformJS.Utilities.onError("Invalid error type")
}
this.element = element || document.createElement("div");
this.element.winControl = this;
WinJS.Utilities.addClass(this.element, "platformErrorHost");
this.element.setAttribute("role", "alert");
var host=document.createElement("div");
WinJS.Utilities.addClass(host, "platformError");
this.element.appendChild(host);
CommonJS.setAutomationId(this.element);
if (type === CommonJS.Error.DEMO_MODE) {
var imgSrc=Platform.Configuration.ConfigurationManager.manifest.splashImage;
imgSrc = (imgSrc && imgSrc.indexOf("url(") === 0) ? imgSrc.substring(5, imgSrc.length - 2) : "";
this._icon = document.createElement("img");
this._icon.src = imgSrc;
WinJS.Utilities.addClass(this._icon, "platformErrorIcon iconRetailMode")
}
else {
this._icon = document.createElement("div");
WinJS.Utilities.addClass(this._icon, "platformErrorIcon");
var icon1=document.createElement("div");
WinJS.Utilities.addClass(icon1, "platformErrorIconGlyph1");
this._icon.appendChild(icon1);
var icon2=document.createElement("div");
WinJS.Utilities.addClass(icon2, "platformErrorIconGlyph2");
this._icon.appendChild(icon2);
WinJS.Utilities.addClass(this._icon, (type === CommonJS.Error.NO_INTERNET) ? "iconNoInternet" : "iconError")
}
host.appendChild(this._icon);
this._title = document.createElement("div");
WinJS.Utilities.addClass(this._title, "platformErrorTitle");
if (!options.altTitle) {
options.altTitle = CommonJS.resourceLoader.getString("/platform/" + type + "Title")
}
this._title.innerText = options.altTitle;
this.element.setAttribute("aria-label", this._title.innerText);
host.appendChild(this._title);
if (type !== CommonJS.Error.DEMO_MODE) {
this._description = document.createElement("div");
WinJS.Utilities.addClass(this._description, "platformErrorDescription");
if (!options.altDescription) {
options.altDescription = CommonJS.resourceLoader.getString("/platform/" + type + "Description")
}
this._description.innerText = options.altDescription;
host.appendChild(this._description)
}
if (type === CommonJS.Error.STANDARD_ERROR) {
this._buttonContainer = document.createElement("div");
WinJS.Utilities.addClass(this._buttonContainer, "platformErrorButtonContainer");
this._button = document.createElement("button");
WinJS.Utilities.addClass(this._button, "platformErrorButton");
this._button.onclick = options.callback;
if (!options.altButtonText) {
options.altButtonText = CommonJS.resourceLoader.getString("/platform/" + type + "Button")
}
this._button.innerText = options.altButtonText;
this._button.setAttribute("aria-label", this._button.innerText);
this._buttonContainer.appendChild(this._button);
host.appendChild(this._buttonContainer);
CommonJS.setAutomationId(this._button, this.element, "button")
}
}, {
_icon: null, _title: null, _description: null, _button: null, _buttonContainer: null, element: null
}, {})})
})();
(function appexPlatformProgressInit() {
"use strict";
WinJS.Namespace.define("CommonJS.Progress", {
_domElements: {}, _counts: {}, _splashDiv: null, _splashTimeout: null, _splashComplete: [], _canDestroySplash: true, _activationKind: null, headerProgressType: "headerProgressType", centerProgressType: "centerProgressType", _createElementIfNeeded: function _createElementIfNeeded(type) {
var element=CommonJS.Progress._domElements[type];
if (!element) {
if (type === CommonJS.Progress.headerProgressType) {
element = document.createElement("progress");
WinJS.Utilities.addClass(element, "platformProgressHeader");
element.setAttribute("role", "presentation")
}
else if (type === CommonJS.Progress.centerProgressType) {
element = document.createElement("div");
WinJS.Utilities.addClass(element, "platformProgressCenterWrapper");
var progressElement=document.createElement("div");
WinJS.Utilities.addClass(progressElement, "platformProgressCenter");
var progress=document.createElement("progress");
WinJS.Utilities.addClass(progress, "win-large win-ring");
progress.setAttribute("role", "presentation");
progressElement.appendChild(progress);
var loading=document.createElement("div");
WinJS.Utilities.addClass(loading, "platformProgressAlert");
loading.setAttribute("aria-label", PlatformJS.Services.resourceLoader.getString("/platform/progressAlertAriaLabel"));
loading.setAttribute("role", "alert");
loading.setAttribute("aria-atomic", true);
loading.innerText = PlatformJS.Services.resourceLoader.getString("/platform/Loading");
progressElement.appendChild(loading);
element.appendChild(progressElement)
}
else {
PlatformJS.Utilities.onError("Invalid progress type")
}
WinJS.Utilities.addClass(element, "platformProgress");
CommonJS.Progress._domElements[type] = element;
document.body.appendChild(element);
CommonJS.Progress._counts[type] = 0
}
return element
}, _deleteElement: function _deleteElement(type) {
var element=CommonJS.Progress._domElements[type];
if (element) {
if (element.parentElement) {
element.parentElement.removeChild(element)
}
CommonJS.Progress._domElements[type] = null
}
}, _updateAriaLiveRegion: function _updateAriaLiveRegion(type) {
var element=CommonJS.Progress._domElements[type];
if (element) {
var alertEl=element.querySelector(".platformProgressAlert");
if (alertEl) {
alertEl.innerText = PlatformJS.Services.resourceLoader.getString("/platform/Loading")
}
}
}, canDestroySplash: function canDestroySplash(loaded) {
this._canDestroySplash = loaded
}, showProgress: function showProgress(type) {
CommonJS.Progress._createElementIfNeeded(type);
CommonJS.Progress._updateAriaLiveRegion(type);
CommonJS.Progress._counts[type]++
}, hideProgress: function hideProgress(type) {
CommonJS.Progress._counts[type] = Math.max(0, CommonJS.Progress._counts[type] - 1);
if (CommonJS.Progress._counts[type] === 0) {
this._deleteElement(type);
CommonJS.Progress.destroySplash()
}
}, resetProgress: function resetProgress(type) {
this._deleteElement(type);
CommonJS.Progress._counts[type] = 0
}, resetAll: function resetAll() {
CommonJS.Progress.resetProgress(CommonJS.Progress.headerProgressType);
CommonJS.Progress.resetProgress(CommonJS.Progress.centerProgressType)
}, setActivationKind: function setActivationKind(activationKind) {
this._activationKind = activationKind
}, initializeExtendedSplash: function initializeExtendedSplash(splash, centerSplash) {
var that=this;
this.playingExtendedSplash = true;
msWriteProfilerMark("Platform:InitializeSplash:s");
this._onResize = function progress_onResize() {
try {
that.positionSplash(splash, centerSplash)
}
catch(err) {
debugger
}
};
if (!this._splashDiv) {
this._splashDiv = document.getElementById("splashContainer");
this._splashImageDiv = document.getElementById("splashImage");
this._splashProgress = document.getElementById("splashProgress")
}
if (this._splashDiv && !this._headerBackButton) {
var backButton=this._headerBackButton = document.createElement("button");
backButton.setAttribute("aria-label", CommonJS.resourceLoader.getString("/platform/GoBack"));
CommonJS.setAutomationId(backButton, this._domElement, "backButton");
WinJS.Utilities.addClass(this._headerBackButton, "win-backbutton immersiveBackButton splashBackButton platformHide");
this._headerBackButton.addEventListener("click", this._splashScreenBackButtonClick.bind(this));
this._splashDiv.appendChild(this._headerBackButton)
}
if (this._headerBackButton) {
if (WinJS.Navigation.canGoBack) {
this._headerBackButton.addEventListener("click", this._splashScreenBackButtonClick);
this._headerBackButton.disabled = false;
WinJS.Utilities.removeClass(this._headerBackButton, "platformHide")
}
else {
this._headerBackButton.disabled = true;
WinJS.Utilities.addClass(this._headerBackButton, "platformHide")
}
}
if (this._splashImageDiv) {
if (!this._splashImageSrc) {
this._splashImageSrc = this._splashImageDiv.src
}
if (splash.imageUri) {
this._splashImageDiv.src = splash.imageUri
}
}
if (this._splashDiv) {
if (!this._splashBackgroundColor) {
this._splashBackgroundColor = this._splashDiv.style.background
}
if (splash.backgroundColor) {
this._splashDiv.style.background = splash.backgroundColor
}
WinJS.Utilities.removeClass(CommonJS.Progress._splashDiv, "platformHide")
}
this._onResize();
this._splashDiv.addEventListener("mselementresize", this._onResize, false);
msWriteProfilerMark("Platform:InitializeSplash:e")
}, _splashScreenBackButtonClick: function _splashScreenBackButtonClick(event) {
if (!PlatformJS.Navigation || PlatformJS.Navigation.canGoBack) {
WinJS.Navigation.back()
}
else {
PlatformJS.Navigation.navigateToChannel("Home")
}
}, positionSplash: function positionSplash(splash, centerSplash) {
if (splash) {
var currentCoordinates=splash.imageLocation;
if (currentCoordinates) {
if (centerSplash) {
var displayData=PlatformJS.Utilities.getDisplayData();
currentCoordinates.x = (displayData.offsetWidth - currentCoordinates.width) / 2;
currentCoordinates.y = (displayData.offsetHeight - currentCoordinates.height) / 2
}
if (this._splashImageDiv) {
this._splashImageDiv.style.top = currentCoordinates.y + "px";
this._splashImageDiv.setLeft(currentCoordinates.x + "px");
this._splashImageDiv.style.width = currentCoordinates.width + "px";
this._splashImageDiv.style.height = currentCoordinates.height + "px"
}
if (this._splashProgress) {
this._splashProgress.style.top = currentCoordinates.y + currentCoordinates.height + "px"
}
}
}
}, destroySplash: function destroySplash(forceDestroy) {
if (this.playingExtendedSplash || this._systemSplash) {
var splashDestroyed=false;
var headerProgress=CommonJS.Progress._counts[CommonJS.Progress.headerProgressType] || 0;
var centerProgress=CommonJS.Progress._counts[CommonJS.Progress.centerProgressType] || 0;
if ((this._splashDiv || this._systemSplash) && (forceDestroy || (centerProgress === 0 && headerProgress === 0)) && this._canDestroySplash) {
msWriteProfilerMark("Platform:DestroySplash:s");
if (this._splashDiv) {
WinJS.Utilities.addClass(this._splashDiv, "platformHide");
if (this._headerBackButton) {
this._headerBackButton.removeEventListener("click", this._splashScreenBackButtonClick)
}
this._splashImageDiv.src = this._splashImageSrc;
this._splashDiv.style.background = this._splashBackgroundColor;
this.playingExtendedSplash = false;
if (CommonJS.Progress._splashTimeout) {
clearTimeout(CommonJS.Progress._splashTimeout);
CommonJS.Progress._splashTimeout = null
}
this._splashDiv.removeEventListener("mselementresize", this._onResize);
if (CommonJS.Progress._fadeinSplash) {
document.body.removeChild(CommonJS.Progress._fadeinSplash);
CommonJS.Progress._fadeinSplash = null
}
if (CommonJS.Progress._splashImageDiv) {
CommonJS.Progress._splashImageDiv.onload = null
}
splashDestroyed = true
}
else {
this.removeExtendedSplashElement()
}
if (this._systemSplash) {
this.destroySystemSplash();
splashDestroyed = true
}
if (splashDestroyed) {
if (!PlatformJS.modernPerfTrack.isLaunchFinished) {
PlatformJS.modernPerfTrack.addStage("RE");
PlatformJS.modernPerfTrack.writeLaunchStageStopEvent(PlatformJS.perfTrackScenario_Launch_Realization, "Realization")
}
var market=PlatformJS.Utilities.Globalization.getCurrentMarket();
var metadata=PlatformJS.modernPerfTrack.getLaunchStageTimingString() + ";" + PlatformJS.modernPerfTrack.activationArguments;
PlatformJS.modernPerfTrack.writeStopEventWithFlagsAndMetadata(PlatformJS.perfTrackScenario_Launch, "App Launch", PlatformJS.modernPerfTrack.appName, PlatformJS.modernPerfTrack.launchFlags, PlatformJS.modernPerfTrack.launchDetails, PlatformJS.modernPerfTrack.activationDetails, 0, 0, metadata, market);
PlatformJS.modernPerfTrack.writeLaunchStopEvent(Microsoft.PerfTrack.PerfTrackTimePoint.responsive, this._activationKind);
PlatformJS.modernPerfTrack.writeLaunchStopEvent(Microsoft.PerfTrack.PerfTrackTimePoint.visibleComplete, this._activationKind)
}
msWriteProfilerMark("Platform:DestroySplash:e");
if (CommonJS.Progress._splashComplete.length) {
CommonJS.Progress._splashComplete.forEach(function _Progress_320(splashComplete) {
splashComplete()
})
}
CommonJS.Progress._splashComplete = []
}
}
}, setSystemSplash: function setSystemSplash(systemSplash, splashComplete) {
this._systemSplash = systemSplash;
if (splashComplete) {
CommonJS.Progress._splashComplete.push(splashComplete)
}
}, isShowingSystemSplash: function isShowingSystemSplash() {
return this._systemSplash !== null
}, destroySystemSplash: function destroySystemSplash() {
if (this._systemSplash) {
this._systemSplash.complete();
this._systemSplash = null
}
}, removeExtendedSplashElement: function removeExtendedSplashElement() {
if (!this._splashDiv) {
this._splashDiv = document.getElementById("splashContainer")
}
if (this._splashDiv) {
this._splashDiv.parentNode.removeChild(this._splashDiv);
this._splashDiv = null
}
}, initCloudSplashScreen: function initCloudSplashScreen(splash) {
if (!splash) {
var splashData=PlatformJS.Services.configuration.getDictionary("CloudPanoSplash");
if (splashData.imageUri && splashData.height && splashData.width && splashData.backgroundColor) {
splash = {
imageUri: splashData.imageUri.value, imageLocation: {
height: splashData.height.value, width: splashData.width.value
}, backgroundColor: splashData.backgroundColor.value
}
}
}
if (splash && splash.imageUri && splash.imageLocation) {
CommonJS.Progress.initializeExtendedSplash(splash, true);
if (this._splashImageDiv) {
this._splashImageDiv.style.opacity = 0
}
if (this._splashDiv && this._splashImageDiv) {
var that=this;
var fadeinSplash=document.createElement("div");
fadeinSplash.style.position = "absolute";
fadeinSplash.style.top = this._splashImageDiv.style.top;
fadeinSplash.style.left = this._splashImageDiv.style.left;
fadeinSplash.style.width = "100%";
fadeinSplash.style.height = "100%";
fadeinSplash.style.zIndex = window.getComputedStyle(this._splashDiv).zIndex;
document.body.appendChild(fadeinSplash);
this._fadeinSplash = fadeinSplash;
this._splashImageDiv.onload = function() {
if (that._fadeinSplash && that._splashImageDiv) {
that._splashImageDiv.style.opacity = 0;
that._splashImageDiv.onload = null;
var cloneSplash=that._splashImageDiv.cloneNode(true);
cloneSplash.style.top = "0px";
cloneSplash.style.left = "0px";
that._fadeinSplash.appendChild(cloneSplash);
WinJS.UI.Animation.fadeIn(cloneSplash).then(function _Progress_412() {
if (that._splashImageDiv) {
that._splashImageDiv.style.opacity = 1
}
if (that._fadeinSplash) {
document.body.removeChild(that._fadeinSplash);
that._fadeinSplash = null
}
})
}
}
}
}
else {
CommonJS.Progress.showProgress(CommonJS.Progress.centerProgressType)
}
}
});
WinJS.Navigation.addEventListener("navigating", CommonJS.Progress.resetAll)
})();
(function sharingInit() {
"use strict";
WinJS.Namespace.define("CommonJS.Sharing", {
Slideshow: {
share: function share(request, state) {
CommonJS.Sharing.Telemetry.log("Slideshow");
var slideShowControl=PlatformJS.Utilities.getControl("ssView");
if (slideShowControl && slideShowControl.data) {
var slide=slideShowControl.data[slideShowControl.currentPage];
if (slide) {
if (slide.title) {
var titleFormat=PlatformJS.Services.resourceLoader.getString("/platform/win8ShareTitle");
request.data.properties.title = titleFormat.format(slide.title, CommonJS.getAppName())
}
else {
request.data.properties.title = CommonJS.getAppName()
}
request.data.properties.description = slide.desc || slide.attribution || "";
var slideshowId=state ? state.slideshowId : null;
var htmlFormat=this._getHtml(slide, slideshowId);
request.data.setHtmlFormat(htmlFormat)
}
}
}, _getShareApplicationLink: function _getShareApplicationLink(slideshowId) {
var uriBuilder=new Platform.Utilities.AppExUriBuilder;
uriBuilder.controllerId = "application";
uriBuilder.commandId = "view";
uriBuilder.queryParameters.insert("entitytype", "slideshow");
uriBuilder.queryParameters.insert("pageId", slideshowId);
uriBuilder.queryParameters.insert("referrer", "share");
var market=(Platform.Utilities.Globalization.getCurrentMarket() || "").toLowerCase();
uriBuilder.queryParameters.insert("market", market);
return uriBuilder.toString()
}, _getHtml: function _getHtml(slide, slideshowId) {
var source=slide.attribution;
var description=slide.desc;
var title=slide.title;
var image=(slide.thumbnail && slide.thumbnail.width <= 200 && slide.thumbnail.height <= 200) ? slide.thumbnail.url : null;
var html="";
if (title) {
html += "<h2><b>" + title + "</b></h2>"
}
if (source) {
html += "<p>" + source + "</p>"
}
if (image) {
html += "<img src='" + image + "'/>"
}
if (description) {
html += description
}
if (slideshowId) {
var url=this._getShareApplicationLink(slideshowId);
var win8ShareText=PlatformJS.Services.resourceLoader.getString("/platform/win8Share");
var win8ShareLinkText="<a href='" + url + "'>" + PlatformJS.Services.resourceLoader.getString("/platform/win8ShareLink").format(CommonJS.getAppName()) + "</a>";
var link=win8ShareText.format(PlatformJS.Services.resourceLoader.getString("/platform/win8Brand"), PlatformJS.Services.resourceLoader.getString("/platform/winPhone8Brand"), win8ShareLinkText);
html += "<p>" + link + "</p>"
}
html = Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.createHtmlFormat(html);
return html
}
}, Telemetry: {log: function log(source) {
var impression=PlatformJS.Navigation.mainNavigator.getCurrentImpression();
if (impression) {
impression.logContentShareWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, null, null, 1, JSON.stringify({shareSource: source}))
}
}}
})
})();
(function appexPlatformControlsMessageBarInit() {
"use strict";
var NS=WinJS.Namespace.define("CommonJS", {
messageBar: null, MessageBarLevelError: "MessageBarLevelError", MessageBarLevelWarning: "MessageBarLevelWarning", MessageBar: WinJS.Class.define(function messageBar_ctor(message, options) {
if (CommonJS.messageBar) {
CommonJS.messageBar._destroy()
}
CommonJS.messageBar = this;
this._domElement = document.createElement("div");
this._domElement.setAttribute("aria-hidden", true);
this._message = message;
this._buttons = [];
this._autoHide = false;
this._autoHideTimeout = 3000;
this._level = CommonJS.MessageBarLevelWarning;
this._isSticky = false;
this._destroyBinding = this._destroy.bind(this);
if (options) {
this._setOptions(options)
}
this._init(this._domElement)
}, {
_domElement: null, _message: null, _buttons: null, _autoHide: false, _autoHideTimeout: null, _level: null, _isSticky: false, _destroyBinding: null, _focusOnButtonOnShow: false, message: {
get: function get() {
return this._message
}, set: function set(value) {
this._message = value;
this._init(this._domElement)
}
}, show: function show(className) {
var that=this;
this._domElement.setAttribute("role", "alert");
this._domElement.setAttribute("aria-hidden", false);
msSetImmediate(function messageBar_setVisibleClass() {
className = "platformMessageBarVisible " + (className || "");
WinJS.Utilities.addClass(that._domElement, className);
if (that._focusOnButtonOnShow) {
var buttons=that._buttons;
if (buttons && buttons.length) {
buttons[0].focus()
}
}
if (that._autoHide) {
var timout=setTimeout(function messageBar_autoHideTimeout() {
that.hide()
}, that._autoHideTimeout)
}
})
}, hide: function hide() {
this._domElement.addEventListener("MSTransitionEnd", this._destroyBinding);
WinJS.Utilities.removeClass(this._domElement, "platformMessageBarVisible");
this._domElement.setAttribute("aria-hidden", true)
}, addButton: function addButton(label, callback) {
if (this._buttons.length < 3) {
var button=document.createElement("button");
button.innerText = label;
button.addEventListener("click", callback);
this._buttons.push(button);
this._domElement.appendChild(button);
CommonJS.setAutomationId(button, this._domElement, label)
}
else {
PlatformJS.Utilities.onError("The MessageBar can only contain up to 3 buttons")
}
}, _init: function _init(element) {
var messageDiv=document.createElement("div");
messageDiv.innerHTML = toStaticHTML(this.message);
WinJS.Utilities.addClass(this._domElement, "platformMessageBar");
WinJS.Utilities.addClass(messageDiv, "platformMessageBarText");
if (this._level === CommonJS.MessageBarLevelError) {
WinJS.Utilities.addClass(this._domElement, "platformMessageBarError")
}
this._domElement.appendChild(messageDiv);
document.body.appendChild(this._domElement);
CommonJS.setAutomationId(this._domElement);
if (!this._isSticky) {
WinJS.Navigation.addEventListener("beforenavigate", this._destroyBinding)
}
}, _setOptions: function _setOptions(options) {
if (options.autoHide) {
this._autoHide = options.autoHide
}
if (options.level) {
this._level = options.level
}
if (options.isSticky) {
this._isSticky = options.isSticky
}
if (options.autoHideTimeout) {
this._autoHideTimeout = options.autoHideTimeout
}
if (options.focusOnButtonOnShow) {
this._focusOnButtonOnShow = options.focusOnButtonOnShow
}
}, _destroy: function _destroy() {
if (this._destroyBinding) {
if (this._domElement) {
this._domElement.removeEventListener("MSTransitionEnd", this._destroyBinding);
this._domElement.outerHTML = ""
}
WinJS.Navigation.removeEventListener("beforenavigate", this._destroyBinding);
this._destroyBinding = null
}
if (CommonJS.messageBar === this) {
CommonJS.messageBar = null
}
}
})
})
})();
(function _MessageDialog_7() {
"use strict";
var createElement=PlatformJS.Utilities.createElement;
var decorateWithFocusGuard=function(root, defaultFocusIndex) {
if (!root) {
return
}
var tabNodes=root.querySelectorAll("[focusGauradIndex]");
if (!tabNodes || tabNodes.length < 1) {
return
}
var totalNodes=tabNodes.length;
var first=tabNodes[0];
var last=tabNodes[totalNodes - 1];
if (defaultFocusIndex < totalNodes) {
tabNodes[defaultFocusIndex].focus()
}
else {
tabNodes[0].focus()
}
last.onkeydown = function(e) {
if (e.keyCode === WinJS.Utilities.Key.tab && !(e.shiftKey && totalNodes > 1)) {
first.focus();
e.stopPropagation();
e.preventDefault()
}
};
if (totalNodes > 1) {
first.onkeydown = function(e) {
if (e.keyCode === WinJS.Utilities.Key.tab && e.shiftKey) {
last.focus();
e.stopPropagation();
e.preventDefault()
}
}
}
};
var disposeButtons=function(root) {
if (!root) {
return
}
var buttons=root.querySelectorAll(".command");
if (!buttons) {
return
}
for (var i=0, iLength=buttons.length; i < iLength; i++) {
buttons[i].onclick = null;
buttons[i].onkeydown = null
}
};
var createButton=function(btnData, index, container) {
var btn=createElement("button", "command command" + index, container);
btn.innerText = btnData.label;
btn.onclick = btnData.clickHandler;
btn.setAttribute("focusGauradIndex", index)
};
var defaultMessageDialogRenderer=function(data, parentNode) {
var contentNode=createElement("div", "messageDialogDefaultContent", parentNode);
contentNode.setAttribute("role", "alertdialog");
if (data.title) {
var title=createElement("div", "title textNode", contentNode, data.title);
contentNode.setAttribute("aria-labelledby", data.title)
}
if (data.message) {
var message=createElement("div", "message textNode", contentNode, data.message);
contentNode.setAttribute("aria-describedby", data.message)
}
var btnContainer=createElement("div", "buttonContainer", contentNode);
var buttons=data.buttons;
for (var i=0, iLength=buttons.length; i < iLength; i++) {
createButton(buttons[i], i + 1, btnContainer)
}
return contentNode
};
WinJS.Namespace.define("CommonJS.UI", {MessageDialog: WinJS.Class.define(function MessageDialog_constructor(messageData) {
messageData = messageData || {};
this._init(messageData)
}, {
_element: null, _viewElement: null, _message: "", _title: "", _buttons: null, _defaultFocusButtonIndex: 0, _defaultCancelButtonIndex: -1, _keydownHandlerBind: null, _styleClass: "", _init: function _init(messageData) {
this._setMessageData(messageData);
this._initDOM(messageData)
}, _initDOM: function _initDOM(messageData) {
this._element = createElement("div", "platformMessageDialog", document.body);
this._element.id = "platformMessageDialog";
this._element.setAttribute("role", "message dialog");
this._keydownHandlerBind = this._keydownHandler.bind(this);
this._element.addEventListener("keydown", this._keydownHandlerBind);
this._element.winControl = this;
this._viewElement = createElement("div", "platformMessageDialogViewBlock " + this._styleClass, this._element)
}, _keydownHandler: function _keydownHandler(event) {
switch (event.keyCode) {
case WinJS.Utilities.Key.enter:
case WinJS.Utilities.Key.space:
var element=event.srcElement;
if (element && element.onclick && WinJS.Utilities.hasClass(element, "command")) {
element.click()
}
break;
case WinJS.Utilities.Key.escape:
if (this._defaultCancelButtonIndex >= 0) {
this._buttons[this._defaultCancelButtonIndex].clickHandler(event)
}
break;
default:
break
}
}, _createClickHandler: function _createClickHandler(callback, disposeOnClick) {
var that=this;
var clickHandler=function(event) {
if (callback) {
callback(event)
}
that._enableSearchAndEdgies(true);
if (disposeOnClick !== false) {
that.dispose()
}
};
return clickHandler
}, _setMessageData: function _setMessageData(messageData) {
this._message = messageData.message || "";
this._title = messageData.title || "";
this._buttons = [];
this._styleClass = messageData.styleClass || "";
var buttons=messageData.buttons && messageData.buttons.length > 0 ? messageData.buttons : [{label: PlatformJS.Services.resourceLoader.getString("/platform/close")}];
for (var i=0, iLength=buttons.length; i < iLength; i++) {
this._buttons.push({
label: buttons[i].label || "", clickHandler: this._createClickHandler(buttons[i].clickHandler, buttons[i].disposeOnClick)
})
}
if (messageData.defaultFocusButtonIndex < this._buttons.length) {
this._defaultFocusButtonIndex = messageData.defaultFocusButtonIndex
}
if (messageData.defaultCancelButtonIndex < this._buttons.length) {
this._defaultCancelButtonIndex = messageData.defaultCancelButtonIndex
}
}, _enableSearchAndEdgies: function _enableSearchAndEdgies(enable) {
if (enable) {
CommonJS.processListener.enableSearchOnType()
}
else {
CommonJS.processListener.disableSearchOnType()
}
CommonJS.disableAllEdgies(!enable)
}, showAsync: function showAsync() {
var that=this;
return WinJS.Promise.wrap().then(function messageDialog_renderBegin() {
var data={
message: that._message, title: that._title, buttons: that._buttons
};
var contentNode=createElement("div", "platformMessageDialogContentBlock", that._viewElement);
return defaultMessageDialogRenderer(data, contentNode)
}).then(function messageDialog_renderComplete(item) {
if (!item) {
return WinJS.Promise.wrapError(false)
}
WinJS.Utilities.addClass(that._element, "show");
WinJS.Utilities.addClass(item, "item");
decorateWithFocusGuard(that._viewElement, that._defaultFocusButtonIndex);
that._enableSearchAndEdgies(false);
return WinJS.Promise.wrap(true)
}, function messageDialog_renderError(errorData) {
that.dispose();
return WinJS.Promise.wrapError(errorData)
})
}, dispose: function dispose() {
if (this._element) {
this._styleClass = null;
disposeButtons(this._element);
if (this._keydownHandlerBind) {
this._element.removeEventListener("keydown", this._keydownHandlerBind);
this._keydownHandlerBind = null
}
document.body.removeChild(this._element);
this._element = null
}
}
})})
})();
(function appexPlatformControlsWindowEventManagerInit() {
"use strict";
var instance=null;
var WindowEventManager=WinJS.Namespace.define("CommonJS.WindowEventManager", {
Events: {
PAGEUP: "pageup", PAGEDOWN: "pagedown", CURSORKEY: "cursorkey", TAB: "tab", MOUSE_BACK: "mouse_back", MOUSE_FORWARD: "mouse_forward", PLATFORM_RESIZE: "platform_resize", PAGE_RESIZE: "page_resize", WINDOW_RESIZE: "window_resize", AD_ENGAGE: "ad_engage", VIDEOAD_START: "videoad_start", VIDEOAD_COMPLETE: "videoad_complete", VIDEOAD_ERROR: "videoad_error", VIDEOAD_TIMEOUT_FINISH: "videoad_timeout_finish", VIDEO_COUNTDOWNUI_SHOW: "video_countdownui_show", VIDEO_COUNTDOWNUI_HIDE: "video_countdownui_hide", KEY_DOWN: "key_down"
}, getInstance: function getInstance() {
if (!instance) {
instance = new WindowEventManager._WindowEventManager
}
return instance
}, destroyInstance: function destroyInstance() {
if (instance) {
instance.destroy();
instance = null
}
}, addEventListener: function addEventListener(type, listener, useCapture) {
var instance=CommonJS.WindowEventManager.getInstance();
instance.addEventListener(type, listener, useCapture)
}, removeEventListener: function removeEventListener(type, listener, useCapture) {
var instance=CommonJS.WindowEventManager.getInstance();
instance.removeEventListener(type, listener, useCapture)
}, addResizeMetricsObserver: function addResizeMetricsObserver(observer) {
var instance=CommonJS.WindowEventManager.getInstance();
instance._resizeMetricsObserver = observer
}, removeResizeMetricsObserver: function removeResizeMetricsObserver(observer) {
var instance=CommonJS.WindowEventManager.getInstance();
if (instance._resizeMetricsObserver === observer) {
instance._resizeMetricsObserver = null
}
}, onResizeCompleted: function onResizeCompleted(observer) {
CommonJS.WindowEventManager.getInstance().onResizeCompleted(observer)
}, HandleWindowResizeEvent: function HandleWindowResizeEvent(event, fun) {
if (!event) {
fun.call(this)
}
else {
var eventResizeID=event.detail ? event.detail.resizeEventID : undefined;
if (typeof eventResizeID === "undefined") {
console.warn("this function is called from native window resize event handler. please use CommonJS.WindowEventManager.addEventListener(CommonJS.WindowEventManager.Events.WINDOW_RESIZE, function) instead");
debugger;
event.platFormDetail = CommonJS.WindowEventManager.getInstance().createResizeEventDetail(event.detail)
}
if (eventResizeID !== this._resizeID || typeof eventResizeID === "undefined") {
fun.call(this);
this._resizeID = eventResizeID
}
}
}, _WindowEventManager: WinJS.Class.mix(WinJS.Class.define(function windowEventManager_ctor() {
this._element = document.createElement("div");
this._pointerUpBinding = this._onWindowPointerUp.bind(this);
this._keyDownBinding = this._onWindowKeyDown.bind(this);
this._resizeBinding = this._resize.bind(this);
window.addEventListener("MSPointerUp", this._pointerUpBinding);
window.addEventListener("keydown", this._keyDownBinding);
window.addEventListener("resize", this._resizeBinding)
}, {
_element: null, _pointerUpBinding: null, _keyDownBinding: null, _resizeBinding: null, _resizeEventID: 0, _displayData: null, _resizeMetricsObserver: null, _resizeMetricsObserverCompleted: false, _inWindowResizeHandler: false, createResizeEventDetail: function createResizeEventDetail(data) {
if (!this._displayData) {
this._displayData = PlatformJS.Utilities.getDisplayData()
}
data = data || {};
data.resizeEventID = this._resizeEventID;
data.hasClientWidthChanged = this._displayData.hasClientWidthChanged();
data.hasClientHeightChanged = this._displayData.hasClientHeightChanged();
data.hasOffsetWidthChanged = this._displayData.hasOffsetWidthChanged();
data.hasOffsetHeightChanged = this._displayData.hasOffsetHeightChanged();
data.hasOuterHeightChanged = this._displayData.hasOuterHeightChanged();
data.hasOuterWidthChanged = this._displayData.hasOuterWidthChanged();
data.hasInnerHeightChanged = this._displayData.hasInnerHeightChanged();
data.hasInnerWidthChanged = this._displayData.hasInnerWidthChanged();
data.hasOrientationChanged = this._displayData.hasOrientationChanged();
data.hasFullScreenChanged = this._displayData.hasFullScreenChanged();
return data
}, _resize: function _resize(event) {
this._resizeEventID++;
this._resizeMetricsObserverCompleted = false;
this._inWindowResizeHandler = true;
if (this._resizeMetricsObserver) {
this._resizeMetricsObserver.beginResize()
}
if (!this.dispatchEvent(WindowEventManager.Events.PLATFORM_RESIZE, detail)) {
var detail=this.createResizeEventDetail();
this.dispatchEvent(WindowEventManager.Events.PAGE_RESIZE, detail) || this.dispatchEvent(WindowEventManager.Events.WINDOW_RESIZE, detail)
}
var displayData=PlatformJS.Utilities.getDisplayData();
var isLayoutChange=displayData.hasFullScreenChanged();
var isRotation=displayData.hasOrientationChanged();
var clientWidth=displayData.clientWidth;
var clientHeight=displayData.clientHeight;
PlatformJS.modernPerfTrack.writeResizeStopEvent(Microsoft.PerfTrack.PerfTrackTimePoint.responsive, isLayoutChange, isRotation, clientWidth, clientHeight);
if (!this._resizeMetricsObserver || this._resizeMetricsObserverCompleted) {
this._raiseResizeVisibleCompletedEvent()
}
this._inWindowResizeHandler = false
}, _raiseResizeVisibleCompletedEvent: function _raiseResizeVisibleCompletedEvent() {
var displayData=PlatformJS.Utilities.getDisplayData();
var isLayoutChange=displayData.hasFullScreenChanged();
var isRotation=displayData.hasOrientationChanged();
var clientWidth=displayData.clientWidth;
var clientHeight=displayData.clientHeight;
msSetImmediate(function writeResizeVisibleCompleteMarker() {
PlatformJS.modernPerfTrack.writeResizeStopEvent(Microsoft.PerfTrack.PerfTrackTimePoint.visibleComplete, isLayoutChange, isRotation, clientWidth, clientHeight)
})
}, _onWindowPointerUp: function _onWindowPointerUp(event) {
switch (event.button) {
case 3:
if (WinJS.Navigation.canGoBack) {
WinJS.Navigation.back();
this.dispatchEvent(WindowEventManager.Events.MOUSE_BACK, event)
}
break;
case 4:
if (WinJS.Navigation.canGoForward) {
WinJS.Navigation.forward();
this.dispatchEvent(WindowEventManager.Events.MOUSE_FORWARD, event)
}
break
}
}, _onWindowKeyDown: function _onWindowKeyDown(event) {
switch (event.keyCode) {
case WinJS.Utilities.Key.pageUp:
this.dispatchEvent(WindowEventManager.Events.PAGEUP, event);
break;
case WinJS.Utilities.Key.pageDown:
this.dispatchEvent(WindowEventManager.Events.PAGEDOWN, event);
break;
case WinJS.Utilities.Key.browserBack:
if (event.target.isContentEditable !== true) {
this._onShortcutKeyBack(event)
}
break;
case WinJS.Utilities.Key.leftArrow:
if (event.altKey) {
this._onShortcutKeyBack(event)
}
else {
this.dispatchEvent(WindowEventManager.Events.CURSORKEY, event)
}
break;
case WinJS.Utilities.Key.rightArrow:
if (!event.altKey) {
this.dispatchEvent(WindowEventManager.Events.CURSORKEY, event)
}
break;
case WinJS.Utilities.Key.upArrow:
case WinJS.Utilities.Key.downArrow:
this.dispatchEvent(WindowEventManager.Events.CURSORKEY, event);
break;
case WinJS.Utilities.Key.tab:
this.dispatchEvent(WindowEventManager.Events.TAB, event);
break;
default:
break
}
}, _onShortcutKeyBack: function _onShortcutKeyBack(event) {
if (WinJS.Navigation.canGoBack) {
WinJS.Navigation.back();
event.preventDefault();
event.stopImmediatePropagation()
}
}, destroy: function destroy() {
window.removeEventListener("MSPointerUp", this._pointerUpBinding);
window.removeEventListener("keydown", this._keyDownBinding);
window.removeEventListener("resize", this._resizeBinding)
}, onResizeCompleted: function onResizeCompleted(observer) {
if (observer === this._resizeMetricsObserver) {
if (!this._inWindowResizeHandler) {
this._raiseResizeVisibleCompletedEvent()
}
else {
this._resizeMetricsObserverCompleted = true
}
}
}
}), WinJS.Utilities.eventMixin)
})
})();
(function appexCommonControlsWebViewInit() {
"use strict";
WinJS.Namespace.define("CommonJS.UI", {WebView: WinJS.Class.mix(WinJS.Class.define(function webView_Ctor(elt, options) {
elt = this._elt = elt || document.createElement("div");
elt.winControl = this;
WinJS.Utilities.addClass(elt, "webView");
var webViewWrapper=this._webViewWrapper = document.createElement("div");
WinJS.Utilities.addClass(webViewWrapper, "webViewControlWrapper");
var webView=this._webView = document.createElement("x-ms-webview");
WinJS.Utilities.addClass(webView, "webViewControl");
webViewWrapper.appendChild(webView);
elt.appendChild(webViewWrapper);
this._isRendered = false;
this._modalElementId = options && options.modalElementId;
this._renderPromise = WinJS.Promise.wrap(null)
}, {
_elt: null, _webViewWrapper: null, _webView: null, _isRendered: null, _navigationCompletedHandler: null, _contentLoadedHandler: null, _disposed: false, _renderPromise: null, _modalElementId: null, element: {get: function get() {
return this._elt
}}, dispose: function dispose() {
if (!this._disposed) {
var webView=this._webView;
if (this._renderPromise) {
this._renderPromise.cancel();
this._renderPromise = null
}
if (webView) {
if (this._navigationCompletedHandler) {
webView.removeEventListener("MSWebViewNavigationCompleted", this._navigationCompletedHandler);
this._navigationCompletedHandler = null
}
if (this._contentLoadedHandler) {
webView.removeEventListener("MSWebViewDOMContentLoaded", this._contentLoadedHandler);
this._contentLoadedHandler = null
}
this._removeWebViewElement()
}
this._elt = null;
this._disposed = true
}
}, _removeWebViewElement: function _removeWebViewElement() {
var domElement=this._elt,
webViewWrapper=this._webViewWrapper,
webView=this._webView;
if (!this._disposed && webViewWrapper && webView) {
var removeElement=function(e) {
try {
webView.removeEventListener("MSWebViewNavigationCompleted", removeElement);
webViewWrapper.removeChild(webView)
}
catch(e) {
console.log("exception while removeChild")
}
};
webView.stop();
webView.addEventListener("MSWebViewNavigationCompleted", removeElement);
webView.navigateToString("<!DOCTYPE html><html><head></head><body></body></html>")
}
this._webViewWrapper = null;
this._webView = null
}, render: function render(url, renderOptions) {
if (!this._disposed) {
var elt=this._elt;
var that=this;
var renderPromise=this._renderPromise = this._renderPromise.then(function webView_renderPromise_then() {
return new WinJS.Promise(function webView_return_renderPromise(complete, error, progress) {
var webView=that._webView;
var webViewWrapper=that._webViewWrapper;
that._navigationCompletedHandler = function navigationCompleted(e) {
if (!that.diposed) {
if (!e.isSuccess) {
error(e)
}
else {
that._preprocessRenderData();
complete()
}
}
};
that._contentLoadedHandler = function contentLoaded(e) {
if (that._modalElementId) {
CommonJS.Utils.hideModalProgress(that._modalElementId)
}
};
webView.addEventListener("MSWebViewNavigationCompleted", that._navigationCompletedHandler);
webView.addEventListener("MSWebViewDOMContentLoaded", that._contentLoadedHandler);
that._setLayout(renderOptions.gridOptions);
webView.navigate(url)
})
}).then(function webViewNavigationCompleted() {
that._isRendered = true
}, function webViewNavigationError(e) {
if (PlatformJS.Utilities.isPromiseCanceled(e)) {
return
}
var tryAgainButtonCallback=function() {
var webView=that._webView;
if (webView) {
if (that._navigationCompletedHandler) {
webView.removeEventListener("MSWebViewNavigationCompleted", that._navigationCompletedHandler);
that._navigationCompletedHandler = null
}
if (that._contentLoadedHandler) {
webView.removeEventListener("MSWebViewDOMContentLoaded", that._contentLoadedHandler);
that._contentLoadedHandler = null
}
}
that.render(url, renderOptions)
};
var code=PlatformJS.Utilities.getPlatformErrorCode(e);
var errorCode=PlatformJS.Utilities.checkOfflineErrorCode(code);
CommonJS.Error.showError(errorCode, tryAgainButtonCallback)
});
return renderPromise
}
else {
return WinJS.Promise.wrap(null)
}
}, _setLayout: function _setLayout(gridOptions) {
if (gridOptions && gridOptions.leftMargin) {
var dir=window.getComputedStyle(this._elt).direction;
if (dir === "ltr") {
this._webViewWrapper.style.left = gridOptions.leftMargin + "px";
this._webViewWrapper.style.right = "0px"
}
else {
this._webViewWrapper.style.left = "0px";
this._webViewWrapper.style.right = gridOptions.leftMargin + "px"
}
}
}, _preprocessRenderData: function _preprocessRenderData(){}
}, {}), WinJS.Utilities.eventMixin)})
})();
(function _privacySettings_6() {
"use strict";
var privacySettings=WinJS.Namespace.define("CommonJS.PrivacySettings", {
pdpFactory: {
set: function set(value) {
privacySettings._pdpFactory = value
}, get: function get() {
var result;
try {
if (privacySettings._pdpFactory instanceof Function) {
privacySettings._pdpFactory = privacySettings._pdpFactory()
}
result = privacySettings._pdpFactory
}
catch(e) {
console.warn("get error when creating PDP factory object");
debugger;
result = null
}
return result
}
}, pdpConflictResolver: {
set: function set(value) {
privacySettings._pdpConflictResolver = value
}, get: function get() {
var result;
try {
if (privacySettings._pdpConflictResolver instanceof Function) {
privacySettings._pdpConflictResolver = privacySettings._pdpConflictResolver()
}
result = privacySettings._pdpConflictResolver
}
catch(e) {
console.warn("get error when creating PDP conflict resolver object");
debugger;
result = null
}
return result
}
}, onPrivacySettingsCmd: function onPrivacySettingsCmd(event) {
privacySettings.getPrivacySettingsFlyout().then(function addPrivacyPaneCallback(privacyFlyout) {
var flyoutControl=privacyFlyout && privacyFlyout.winControl;
if (flyoutControl) {
flyoutControl.show()
}
})
}, getPrivacySettingsFlyout: function getPrivacySettingsFlyout() {
if (privacySettings._privacySettingsFlyout) {
return WinJS.Promise.wrap(privacySettings._privacySettingsFlyout)
}
var promise=new WinJS.Promise(function privacySettings_renderFragment(complete) {
WinJS.UI.Fragments.renderCopy("/common/html/PrivacySettings.html").then(function privacySettings_renderFragmentComplete(fragment) {
if (fragment) {
document.body.appendChild(fragment)
}
var flyout=document.getElementById("privacySettingsPage");
if (flyout) {
var privacyStatementText=CommonJS.resourceLoader.getString("/platform/feedbackPrivacyStatementLabel"),
privacyStatementUrl=PlatformJS.Services.configuration.getDictionary("Setting").getString("PrivacyStatementLink"),
pageTitle=CommonJS.resourceLoader.getString("/platform/TitleAccountsSettings"),
userNameLabel=CommonJS.resourceLoader.getString("/platform/userName"),
accountNameLabel=CommonJS.resourceLoader.getString("/platform/MSAccountNameLabel"),
microsoftAccount=CommonJS.resourceLoader.getString("/platform/MicrosoftAccount"),
msaConnectionDescription=CommonJS.resourceLoader.getString("/platform/MessageMSAConnectionDescription"),
msaConnectionRemoveLink=CommonJS.resourceLoader.getString("/platform/MSAConnectionRemoveLink"),
microsoftAdvertisingPrivacyStatementTitle=CommonJS.resourceLoader.getString("/platform/TitleAdSettings"),
microsoftAdvertisingPrivacyLinkText=CommonJS.resourceLoader.getString("/platform/MicrosoftAdvertisingPrivacyLinkText"),
microsoftAdvertisingPrivacyLinkUrl=PlatformJS.Services.configuration.getDictionary("Setting").getString("MicrosoftAdvertisingPrivacyStatementLink"),
microsoftAdvertisingSettingsText=CommonJS.resourceLoader.getString("/platform/MicrosoftAdvertisingSettingsText");
privacySettings._msaConnectLabel = CommonJS.resourceLoader.getString("/platform/MSAConnectLabel");
privacySettings._msaConnectionTitleNotConnected = CommonJS.resourceLoader.getString("/platform/TitleMSAConnectionDescription");
privacySettings._msaConnectionTitleConnected = CommonJS.resourceLoader.getString("/platform/TitleMSAConnectedDescription");
var dataContext={
pageTitle: pageTitle, msaConnectionDescription: msaConnectionDescription, msaConnectionRemoveLink: msaConnectionRemoveLink, userNameLabel: userNameLabel, accountNameLabel: accountNameLabel, microsoftAccount: microsoftAccount, privacyStatementUrl: privacyStatementUrl, privacyStatementText: privacyStatementText, backbuttonclick: WinJS.Utilities.markSupportedForProcessing(privacySettings._backButtonClick), microsoftAdvertisingPrivacyStatementTitle: microsoftAdvertisingPrivacyStatementTitle, microsoftAdvertisingPrivacyStatement: microsoftAdvertisingSettingsText, microsoftAdvertisingPrivacyLinkUrl: microsoftAdvertisingPrivacyLinkUrl, microsoftAdvertisingPrivacyLinkText: microsoftAdvertisingPrivacyLinkText
};
WinJS.UI.processAll(flyout).then(function _privacySettings_99() {
WinJS.Resources.processAll(flyout)
}).then(function _privacySettings_101() {
WinJS.Binding.processAll(flyout, dataContext)
}).then(function _privacySettings_103() {
privacySettings._privacySettingsFlyout = flyout;
var flyoutControl=flyout && flyout.winControl;
var msaContainer=privacySettings._msaContainer = document.getElementById("msaContainer");
var msaConnectionRemoveLink=privacySettings._msaConnectionRemoveLink = document.getElementById("msaConnectionRemoveLink");
var privacyStatement=document.getElementById("privacyStatementUrl");
var msaConnectionLearnMore=document.getElementById("msaConnectionLearnMoreUrl");
if (privacySettings._eventListeners) {
privacySettings._eventListeners.dispose();
privacySettings._eventListeners = null
}
var eventListeners=privacySettings._eventListeners = new CommonJS.Utils.EventListenerManager("PrivacySettings EventManager");
privacySettings._privacySettingsPage1 = document.getElementById("privacySettingsPage1");
privacySettings._privacySettingsPage2 = document.getElementById("privacySettingsPage2");
privacySettings._page1UserIdDiv = document.getElementById("msaUserIdPage1");
privacySettings._page2UserIdDiv = document.getElementById("msaUserIdPage2");
privacySettings._msaConnectionTitleDiv = document.getElementById("msaConnectionTitle");
eventListeners.add(msaContainer, "click", privacySettings._msaContainerClick, "msaContainer onclick", true);
eventListeners.add(msaContainer, "keydown", privacySettings._msaContainerKeydown, "msaContainer onkeydown", true);
eventListeners.add(msaConnectionRemoveLink, "click", privacySettings._msaConnectionRemoveLinkClick, "msaConnectionRemoveLink onclick", true);
eventListeners.add(msaConnectionRemoveLink, "keydown", privacySettings._msaConnectionRemoveLinkKeydown, "msaConnectionRemoveLink onkeydown", true);
eventListeners.add(flyoutControl, "afterhide", privacySettings.clearPrivacySettingsFlyout, "privacySetting afterhide", true);
eventListeners.add(privacyStatement, "click", privacySettings._privacyStatementClick, "privacystatement click", true);
eventListeners.add(msaConnectionLearnMore, "click", privacySettings._msaAccountLearnMoreClick, "msaConnectionLearnMore click", true);
Platform.Storage.PersonalizedDataService.isConnectedAsync().then(function pdsIsConnected_Completed(connected) {
if (connected) {
privacySettings._msaUserName = Platform.Identity.UserProfile.currentUser.signInName;
privacySettings._MSAConnected = true;
if (Platform.Storage.PersonalizedDataService.isPersonalDataPlatformEnabled) {
privacySettings._syncAcrossDeviceEnabled = true
}
else {
privacySettings._syncAcrossDeviceEnabled = false
}
}
else {
privacySettings._msaUserName = null;
privacySettings._MSAConnected = false
}
privacySettings._showPage1()
});
complete(flyout)
})
}
else {
complete(null)
}
}, function feedback_fragmentRenderCopyError(error) {
complete(null)
})
});
return promise
}, clearPrivacySettingsFlyout: function clearPrivacySettingsFlyout() {
var flyout=privacySettings._privacySettingsFlyout,
flyoutWinControl=flyout && flyout.winControl,
eventManager=privacySettings._eventListeners;
if (flyout) {
if (eventManager) {
eventManager.dispose();
privacySettings._eventListeners = null
}
if (flyoutWinControl && flyoutWinControl.dispose) {
flyoutWinControl.dispose()
}
var parentNode=flyout.parentNode;
if (parentNode) {
parentNode.removeChild(flyout)
}
privacySettings._privacySettingsFlyout = null
}
}, _msaContainerKeydown: function _msaContainerKeydown(event) {
var keyCode=event.keyCode;
if (keyCode === WinJS.Utilities.Key.enter) {
privacySettings._msaContainerClick()
}
}, _msaContainerClick: function _msaContainerClick() {
var pds=null;
if (privacySettings._MSAConnected) {
if (privacySettings._syncAcrossDeviceEnabled) {
privacySettings._logUserAction("Account settings", "Microsoft account");
privacySettings._showPage2()
}
else {
privacySettings._logUserAction("Account settings", "Connect account");
Platform.Storage.PersonalizedDataService.isPersonalDataPlatformEnabled = true;
privacySettings._pds = null;
pds = privacySettings._getPDS();
if (pds) {
pds.setPersonalizationEnabled(true)
}
privacySettings._syncAcrossDeviceEnabled = true;
privacySettings._page1UserIdDiv.innerText = privacySettings._msaUserName;
privacySettings._msaConnectionTitleDiv.innerText = privacySettings._msaConnectionTitleConnected
}
}
else {
privacySettings._logUserAction("Account settings", "Connect device");
var staticPds=Platform.Storage.PersonalizedDataService;
staticPds.forceConnectionUI = true;
staticPds.isConnectedAsync().then(function staticPdsIsConnected_Completed(connected) {
staticPds.forceConnectionUI = false;
if (connected) {
Platform.Storage.PersonalizedDataService.isPersonalDataPlatformEnabled = true;
pds = privacySettings._getPDS();
if (pds) {
pds.setPersonalizationEnabled(true).then(function msaContainerClick_PersonalizationEnabled_Complete() {
var freSetSyncPersonalizationNeededKey="freSetSyncPersonalizationNeeded";
if (Windows.Storage.ApplicationData.current.localSettings.values[freSetSyncPersonalizationNeededKey]) {
Windows.Storage.ApplicationData.current.localSettings.values.remove(freSetSyncPersonalizationNeededKey)
}
})
}
privacySettings._msaUserName = Platform.Identity.UserProfile.currentUser.signInName;
privacySettings._syncAcrossDeviceEnabled = true;
privacySettings._MSAConnected = true;
privacySettings._page1UserIdDiv.innerText = privacySettings._msaUserName;
privacySettings._msaConnectionTitleDiv.innerText = privacySettings._msaConnectionTitleConnected;
CommonJS.PrivacySettings.onPrivacySettingsCmd()
}
else {
privacySettings._msaUserName = null;
privacySettings._MSAConnected = false
}
CommonJS.PrivacySettings.onPrivacySettingsCmd()
})
}
}, _msaConnectionRemoveLinkKeydown: function _msaConnectionRemoveLinkKeydown(event) {
var keyCode=event.keyCode;
if (keyCode === WinJS.Utilities.Key.enter) {
privacySettings._msaConnectionRemoveLinkClick()
}
}, _msaConnectionRemoveLinkClick: function _msaConnectionRemoveLinkClick() {
privacySettings._logUserAction("Account settings detail", "Remove button");
privacySettings._syncAcrossDeviceEnabled = false;
Platform.Storage.PersonalizedDataService.isPersonalDataPlatformEnabled = false;
privacySettings._showPage1()
}, _showPage1: function _showPage1() {
privacySettings._logAppAction("Account settings", "Account settings shown");
privacySettings._msaConnectionTitleDiv.innerText = privacySettings._msaConnectionTitleNotConnected;
if (privacySettings._MSAConnected) {
if (privacySettings._syncAcrossDeviceEnabled) {
privacySettings._page1UserIdDiv.innerText = privacySettings._msaUserName || privacySettings._msaConnectLabel;
privacySettings._msaConnectionTitleDiv.innerText = privacySettings._msaConnectionTitleConnected;
privacySettings._logAppAction("Account settings", "Account settings - Connected")
}
else {
privacySettings._page1UserIdDiv.innerText = privacySettings._msaConnectLabel;
privacySettings._logAppAction("Account settings", "Account settings - Not connected")
}
}
else {
privacySettings._page1UserIdDiv.innerText = privacySettings._msaConnectLabel;
privacySettings._logAppAction("Account settings", "Account settings - Not connected")
}
WinJS.Utilities.addClass(privacySettings._privacySettingsPage2, "platformDisplayNone");
WinJS.Utilities.removeClass(privacySettings._privacySettingsPage1, "platformDisplayNone");
privacySettings._page1 = true
}, _showPage2: function _showPage2() {
privacySettings._logAppAction("Account settings detail", "Account settings detail shown");
privacySettings._page2UserIdDiv.innerText = privacySettings._msaUserName || privacySettings._msaConnectLabel;
WinJS.Utilities.addClass(privacySettings._privacySettingsPage1, "platformDisplayNone");
WinJS.Utilities.removeClass(privacySettings._privacySettingsPage2, "platformDisplayNone");
privacySettings._page1 = false
}, _backButtonClick: function _backButtonClick() {
if (privacySettings._page1) {
privacySettings._logUserAction("Account settings", "Back button");
WinJS.UI.SettingsFlyout.show()
}
else {
privacySettings._logUserAction("Account settings detail", "Back button");
privacySettings._showPage1()
}
}, _getPDS: function _getPDS() {
var result=privacySettings._pds;
if (!result) {
var pdpConfig=PlatformJS.Services.configuration.getDictionary("PersonalDataPlatform"),
pdpDomain=pdpConfig && pdpConfig.getString("AppDomain"),
pdpFactory=privacySettings.pdpFactory,
pdpConflictResolver=privacySettings.pdpConflictResolver;
if (pdpDomain && pdpFactory) {
try {
result = new Platform.Storage.PersonalizedDataService(pdpDomain, pdpFactory, pdpConflictResolver)
}
catch(e) {
result = null
}
privacySettings._pds = result
}
}
if (!result) {
console.error("failed to create Platform.Storage.PersonalizedDataService instance");
debugger
}
return result
}, _privacyStatementClick: function _privacyStatementClick() {
privacySettings._logUserAction("Account settings", "Privacy statement link")
}, _msaAccountLearnMoreClick: function _msaAccountLearnMoreClick() {
privacySettings._logUserAction("Account settings", "Microsoft account learn more link")
}, _logUserAction: function _logUserAction(context, action) {
PlatformJS.deferredTelemetry(function _logUserAction() {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, context, action, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0)
})
}, _logAppAction: function _logAppAction(element, operation) {
PlatformJS.deferredTelemetry(function _logAppAction() {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logAppAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Account settings", element, operation, 0)
})
}, _privacySettingsPage1: null, _privacySettingsPage2: null, _page1UserIdDiv: null, _msaContainer: null, _msaConnectionRemoveLink: null, _page1: true, _msaUserName: null, _msaConnectLabel: null, _msaConnectionTitleNotConnected: null, _msaConnectionTitleConnected: null, _msaConnectionTitleDiv: null, _MSAConnected: false, _syncAcrossDeviceEnabled: false, _privacySettingsFlyout: null, _privacySettingsConnectToMSA: null, _eventListeners: null, _pdpFactory: null, _pdpConflictResolver: null, _pds: null
})
})();
(function appexCommonControlsUtilsInit(WinJS) {
"use strict";
var selfClosingTagRegEx=/<\s*(?!br)(?!wbr)(?!hr)([^\s>]+)\s*\/\s*>/ig;
var selfClosingTagReplacement="<$1></$1>";
function _getEstimatedStringLength(strLength, currentHeight, desiredHeight) {
return Math.floor(strLength * desiredHeight / currentHeight)
}
function getDateString(dateType, publisherName) {
var dateString="";
if (dateType && dateType.utctime) {
var utcTime=dateType.utctime;
var dateFormatter;
if (publisherName) {
dateFormatter = CommonJS.Utils.DateTimeFormatting.getDateTimeFormatter(publisherName)
}
if (dateFormatter) {
dateString = dateFormatter(dateType, CommonJS.Utils.DateTimeFormatting.dateTimeFormat.panoTile)
}
if (!dateFormatter || !dateString) {
var time=CommonJS.Utils.convertBDITimeToFriendlyTime(utcTime);
dateString = time && time.indexOf("NaN") < 0 ? time : ""
}
}
return dateString
}
var qualityMap=function buildQualityMap() {
var normalResLabel="NormalRes";
var highResLabel="HighRes";
var baseDefaultImageQuality="60";
var imageQualityMap={};
var resolution=calculateResolutionLabel();
function calculateResolutionLabel() {
var resolution=Windows.Graphics.Display.DisplayProperties.resolutionScale;
return (resolution < 120 ? normalResLabel : highResLabel)
}
function addQualityMapping(name, bootcacheKey, configKey) {
var that=this;
imageQualityMap[name] = {
value: null, bootCacheKey: bootcacheKey, configKey: configKey
}
}
;
addQualityMapping("Default", "DefaultImageQuality", "DefaultImageQuality");
addQualityMapping("FullScreen", "FullScreenImageQuality", "FullScreenImageQuality");
function loadQualityFromConfig(name) {
if (!PlatformJS.isPlatformInitialized) {
debugger;
return
}
var q=imageQualityMap[name];
var bootCacheKey=q.bootCacheKey + resolution;
var configKey=q.configKey + resolution;
var quality=PlatformJS.Services.appConfig.getString(configKey);
if (quality === null || quality.length === 0) {
quality = baseDefaultImageQuality
}
PlatformJS.BootCache.instance.addOrUpdateEntry(bootCacheKey, quality);
q.value = quality
}
;
function loadQualityFromBootCache(name) {
var q=imageQualityMap[name];
var bootCacheKey=q.bootCacheKey + resolution;
var quality=PlatformJS.BootCache.instance.getEntry(bootCacheKey);
if (quality === null || quality.length === 0) {
quality = baseDefaultImageQuality
}
q.value = quality;
PlatformJS.platformInitializedPromise.then(function getImageQualityAfterInit() {
loadQualityFromConfig(name)
})
}
;
function getQuality(name) {
var q=imageQualityMap[name];
if (!q) {
debugger;
return normalResLabel
}
if (!q.value) {
PlatformJS.isPlatformInitialized ? loadQualityFromConfig(name) : loadQualityFromBootCache(name)
}
return q.value
}
;
return {getQuality: getQuality}
}();
var qualityMapRegEx={
hasQualityParmas: /(?:_m\d|_w|_h|_p)/i, getExtensionName: /(.*)\.(.*)/i, hasQParma: /_q\d+/i, extractParams: /((?:.*)\/(?:[^_\.]*))?(?:_[mwh]\d+)*(_[^_\.]+)?(\..*)?/ig
};
var Utils=WinJS.Namespace.define("CommonJS.Utils", {
itemClickProxy: function itemClickProxy(control) {
return function utils_itemClickProxy(evt) {
var item=null;
var currentElt=evt.srcElement;
while (currentElt) {
if (WinJS.Utilities.hasClass(currentElt, "cluster-item")) {
item = currentElt.winControl.data;
break
}
currentElt = currentElt.parentElement
}
if (item) {
control.dispatchEvent("itemclick", {item: item})
}
}
}, removeImageUrlResizeTags: function removeImageUrlResizeTags(url) {
if (!url || !Utils.isUriUnderDomains(url, "msn.com") || url.indexOf("_") < 0) {
return url
}
var imageParamRe=qualityMapRegEx.imageParameter,
tokens=[],
name,
extension;
url.replace(qualityMapRegEx.extractParams, function getTokens(full, m1, m2, m3) {
if (m1 && !name) {
name = m1
}
if (m2) {
tokens.push(m2)
}
if (m3 && !extension) {
extension = m3
}
});
return name + tokens.join("") + extension
}, _resizableExtensions: ["jpg", "jpeg", "png", "bmp"], _nonQualityExtensions: ["png"], _getDefaultImageQuality: function _getDefaultImageQuality() {
return qualityMap.getQuality("Default")
}, _getDefaultFullScreenImageQuality: function _getDefaultFullScreenImageQuality() {
return qualityMap.getQuality("FullScreen")
}, _applyImageQuality: function _applyImageQuality(url, params, quality) {
if (quality !== "100" && !/_q\d+/i.test(url)) {
if (!quality) {
quality = this._getDefaultImageQuality()
}
if (quality) {
params.push("_q", quality)
}
}
}, getResizedImageUrl: function getResizedImageUrl(url, width, height, quality) {
var lowerCaseUrl=url.toLowerCase();
if (Utils.isUriUnderDomains(url, "msn.com") && !url.match(/_m\d+/i)) {
width = Math.round(width);
height = Math.round(height);
var imageNames=Utils._seperateImageExtension(url);
if (imageNames && imageNames[0] && imageNames[1]) {
var urlExtension=imageNames[1];
var canSetQuality=url.match(qualityMapRegEx.hasQParma) || Utils._canSetQuality(urlExtension);
var isResizable=Utils._isValidResizableExtension(urlExtension);
if (isResizable) {
var params=[imageNames[0]];
params.push("_m6_w", width, "_h", height);
if (canSetQuality) {
this._applyImageQuality(url, params, quality)
}
params.push(".", urlExtension);
return params.join("")
}
}
}
return url
}, _isValidResizableExtension: function _isValidResizableExtension(subUrl) {
var extensions=CommonJS.Utils._resizableExtensions;
subUrl = subUrl.toLowerCase();
for (var index=0; index < extensions.length; index++) {
if (subUrl === extensions[index]) {
return true
}
}
return false
}, _canSetQuality: function _canSetQuality(subUrl) {
var extensions=CommonJS.Utils._nonQualityExtensions;
subUrl = subUrl.toLowerCase();
for (var index=0; index < extensions.length; index++) {
if (subUrl === extensions[index]) {
return false
}
}
return true
}, _seperateImageExtension: function _seperateImageExtension(url) {
var match=qualityMapRegEx.getExtensionName.exec(url);
if (match) {
return match.slice(1)
}
else {
return null
}
}, getResizedImageUrlWithMode: function getResizedImageUrlWithMode(url, width, height, mode, quality) {
if (url && (width > 0) && (height > 0) && (mode >= 1 && mode <= 7)) {
if (Utils.isUriUnderDomains(url, "msn.com") && !url.match(qualityMapRegEx.hasQualityParmas)) {
width = Math.round(width);
height = Math.round(height);
var imageNames=Utils._seperateImageExtension(url);
if (imageNames && imageNames[0] && imageNames[1]) {
var urlExtension=imageNames[1];
var canSetQuality=url.match(qualityMapRegEx.hasQParma) || Utils._canSetQuality(urlExtension);
var isResizable=Utils._isValidResizableExtension(urlExtension);
if (isResizable) {
var params=[imageNames[0]];
params.push("_m", mode, "_w", width, "_h", height);
if (canSetQuality) {
this._applyImageQuality(url, params, quality)
}
params.push("." + urlExtension);
return params.join("")
}
}
}
}
return url
}, _getImageUrlWithQuality: function _getImageUrlWithQuality(url, quality) {
if (url) {
if (Utils.isUriUnderDomains(url, "msn.com") && !url.match(qualityMapRegEx.hasQParma) && !url.match(/_p/i)) {
var imageNames=Utils._seperateImageExtension(url);
if (imageNames && imageNames[0] && imageNames[1]) {
var params=[imageNames[0]];
this._applyImageQuality(url, params, quality);
params.push(".", imageNames[1]);
return params.join("")
}
}
}
return url
}, getResizedHeroImageUrl: function getResizedHeroImageUrl(url) {
var displayHeight=null,
displayWidth=null;
if (screen.height > screen.width) {
displayWidth = screen.height;
displayHeight = screen.width
}
else {
displayHeight = screen.height,
displayWidth = screen.width
}
var quality=this._getDefaultFullScreenImageQuality();
if (displayHeight <= 768) {
var imageHeight=768,
imageWidth=parseInt(CommonJS.Immersive.HERO_IMAGE_WIDTH_RATIO_LANDSCAPE * 1366) + 1;
url = CommonJS.Utils.getResizedImageUrlWithMode(url, imageWidth, imageHeight, 2, quality)
}
else {
url = CommonJS.Utils._getImageUrlWithQuality(url, quality)
}
return url
}, addParamsToThirdPartyVideoUrl: function addParamsToThirdPartyVideoUrl(url) {
var params={
fs: {
value: "true", overrideIfExists: false
}, app: {
value: "1", overrideIfExists: false
}
};
return CommonJS.Utils.appendUriParams(url, params)
}, convertRSSTimeToFriendlyTime: function convertRSSTimeToFriendlyTime(rssTime) {
var now=new Date;
var nowEpoch=now.getTime();
var date=new Date(rssTime);
var rssTimeEpoch=date.getTime();
if (isNaN(rssTimeEpoch)) {
rssTime = rssTime.replace("-", "/");
date = new Date(rssTime);
rssTimeEpoch = date.getTime()
}
if (!isNaN(rssTimeEpoch)) {
var delta=Math.max(0, nowEpoch - rssTimeEpoch);
return CommonJS.Utils.convertDeltaToFriendlyTime(delta)
}
return ""
}, getBDITimeDelta: function getBDITimeDelta(bdiTime) {
var nowEpoch=CommonJS.Utils.getCurrentBDITime();
var bdiTimeEpoch=(bdiTime / 10000) + Utils._bdiTimeOriginEpoch;
return nowEpoch - bdiTimeEpoch
}, getCurrentBDITime: function getCurrentBDITime() {
var now=new Date;
var nowEpoch=Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
return nowEpoch
}, convertBDITimeToFriendlyTime: function convertBDITimeToFriendlyTime(bdiTime) {
var delta=CommonJS.Utils.getBDITimeDelta(bdiTime);
delta = delta < 0 ? 0 : delta;
return CommonJS.Utils.convertDeltaToFriendlyTime(delta)
}, convertDeltaToFriendlyTime: function convertDeltaToFriendlyTime(delta) {
var friendlyTime="";
var resourceLoader=CommonJS.resourceLoader;
if (0 <= delta && delta < 120000) {
friendlyTime = resourceLoader.getString("/Platform/OneMinAgo")
}
else if (120000 <= delta && delta < 3600000) {
friendlyTime = resourceLoader.getString("/Platform/MinsAgo").format(Math.floor(delta / 60000))
}
else if (3600000 <= delta && delta < 7200000) {
friendlyTime = resourceLoader.getString("/Platform/OneHourAgo")
}
else if (7200000 <= delta && delta < 86400000) {
friendlyTime = resourceLoader.getString("/Platform/HoursAgo").format(Math.floor(delta / 3600000))
}
else if (86400000 <= delta && delta < 172800000) {
friendlyTime = resourceLoader.getString("/Platform/OneDayAgo")
}
else {
friendlyTime = resourceLoader.getString("/Platform/DaysAgo").format(Math.floor(delta / 86400000))
}
return friendlyTime
}, truncateString: function truncateString(str, len) {
return str.substr(0, len) + (len >= str.length ? "" : "...")
}, truncateMultilineText: function truncateMultilineText(multilineElt) {
msWriteProfilerMark("CommonControls:Utils:truncateMultilineText:s");
var parentElt=multilineElt.parentElement;
var parentHeight=parentElt.clientHeight;
var height=multilineElt.clientHeight;
if (height > parentHeight) {
var originalString=multilineElt.innerText;
var originalLength=originalString.length;
var initialLength=_getEstimatedStringLength(originalLength, height, parentHeight);
var nextWordBoundaryIndex=originalString.indexOf(" ", initialLength);
initialLength = (nextWordBoundaryIndex === -1 ? initialLength : nextWordBoundaryIndex);
var tryLength=initialLength;
var tryString=CommonJS.Utils.truncateString(originalString, tryLength);
multilineElt.innerText = tryString;
height = multilineElt.clientHeight;
while (height > parentHeight) {
var oneLessWordLength=originalString.lastIndexOf(" ", tryLength - 1);
tryLength = oneLessWordLength === -1 ? tryLength - 1 : oneLessWordLength;
if (tryLength <= 0) {
break
}
tryString = CommonJS.Utils.truncateString(originalString, tryLength);
multilineElt.innerText = tryString;
height = multilineElt.clientHeight
}
}
msWriteProfilerMark("CommonControls:Utils:truncateMultilineText:e")
}, getAppProtocol: function getAppProtocol() {
return PlatformJS.Services.appConfig.getString("AppProtocol", "bingnews")
}, parseCMSUriString: function parseCMSUriString(uriString, defaultMarket) {
var result=Utils.parseUriString(uriString, Utils.getAppProtocol(), defaultMarket);
if (result && result.path === "application/view") {
result.entitytype = result.params["entitytype"];
result.pageId = result.params["pageid"];
result.contentId = result.params["contentid"];
var marketParam=result.params["market"];
if (marketParam && marketParam.length > 0) {
result.market = marketParam
}
var externalUrlParam=result.params["externalurl"];
if (externalUrlParam && externalUrlParam.length > 0) {
result.externalUrl = externalUrlParam
}
var adNetworkIdParam=result.params["adnetworkid"];
if (adNetworkIdParam && adNetworkIdParam.length > 0) {
result.adNetworkId = adNetworkIdParam
}
}
else {
result = null
}
return result
}, parseUriString: function parseUriString(uriString, defaultProtocol, defaultMarket) {
var result=null;
if (uriString) {
if (0 >= uriString.indexOf(":") && defaultProtocol) {
uriString = defaultProtocol + ":" + uriString
}
try {
result = Utils.parseUri(new Windows.Foundation.Uri(uriString), defaultMarket)
}
catch(ex) {
;
}
}
return result
}, parseUri: function parseUri(uri, defaultMarket) {
var result=null;
if (uri) {
if (!uri.suspicious) {
var path=uri.path;
var host=uri.host;
var actualPath=null;
if (host) {
actualPath = host.toLowerCase();
if (path) {
var pathValue=path.toLowerCase();
if (pathValue !== "/") {
actualPath += path.toLowerCase()
}
}
}
else {
if (path) {
actualPath = path.toLowerCase()
}
}
if (actualPath) {
var urlParams=PlatformJS.Collections.createStringDictionary();
var queryParser=uri.queryParsed;
var len=queryParser ? queryParser.size : 0;
for (var idx=0; idx < len; idx++) {
var entry=queryParser.getAt(idx);
if (entry && entry.name && entry.name.length > 0 && entry.value && entry.value.length > 0) {
try {
urlParams[entry.name.toLowerCase()] = entry.value
}
catch(err) {
;
}
}
}
if (!urlParams["market"] && defaultMarket) {
urlParams["market"] = defaultMarket
}
result = {
protocol: uri.schemeName, params: urlParams, path: actualPath, uri: uri
}
}
}
}
return result
}, isUriUnderDomains: function isUriUnderDomains(uriString, domains) {
if (!uriString || !domains || !domains.length) {
return false
}
var domainStr=domains;
if (typeof domains !== "string") {
domainStr = "(?:" + domains.join("|") + ")"
}
domainStr = domainStr.replace(".", "\.").replace("/", "\/");
var domainRegExp=new RegExp("^(?:https?:\/\/)?[^\\s\/?:#]*\\.?" + domainStr, "i");
return domainRegExp.test(uriString.trim())
}, getUriParams: function getUriParams(str) {
var re=/[?&]([^\s=?&]+)=([^\s=?&]*)/g,
params={},
result=null,
found=false;
while ((result = re.exec(str)) !== null) {
if (result[0] && result[1]) {
found = true;
params[result[1].toLowerCase()] = result[2]
}
}
return found ? params : null
}, appendUriParams: function appendUriParams(uri, newParams) {
var params=CommonJS.Utils.getUriParams(uri) || {},
paramsArry=[],
keys=Object.keys(newParams),
i,
len,
uriStr=uri.match(/^[^\s?=]+/);
uriStr = uriStr && uriStr[0];
for (i = 0, len = keys.length; i < len; i++) {
var key=keys[i],
valueObj=newParams[key];
if (valueObj && typeof valueObj.value !== "undefined" && valueObj.value !== null && (!params[key] || (params[key] && valueObj.overrideIfExists))) {
params[key] = valueObj.value.toString()
}
}
keys = Object.keys(params);
for (i = 0, len = keys.length; i < len; i++) {
var key=keys[i],
value=params[key];
paramsArry.push(key + "=" + value)
}
if (paramsArry.length && uriStr) {
uriStr += "?" + paramsArry.join("&")
}
return uriStr
}, stripHTML: function stripHTML(string) {
if (string) {
return string.replace(/<(?:.|\n)*?>/gm, "")
}
else {
return null
}
}, replaceHTMLEncodedChars: function replaceHTMLEncodedChars(str) {
if (typeof(str) !== "string") {
return str
}
var ret=str.replace(/<(?:.|\n)*?>/gm, "");
ret = ret.replace(/&quot;|&#34;/g, "\"");
ret = ret.replace(/&lt;|&#60;/g, "<");
ret = ret.replace(/&gt;|&#62;/g, ">");
ret = ret.replace(/&nbsp;|&#160;/g, " ");
ret = ret.replace(/&amp;|&#38;/g, "&");
return ret
}, toStaticHTMLWithSelfClosingTags: function toStaticHTMLWithSelfClosingTags(html) {
var refreshedHTML=html.replace(selfClosingTagRegEx, selfClosingTagReplacement);
return toStaticHTML(refreshedHTML)
}, getFakeGUID: function getFakeGUID() {
var d=Date.now();
var uuid='xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function generateGuid(c) {
var r=(d + Math.random() * 16) % 16 | 0;
d = Math.floor(d / 16);
return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16)
});
return uuid
}, versionInRange: function versionInRange(version, minVersion, maxVersion) {
if (minVersion && typeof minVersion.major === "number") {
if (minVersion.major > version.major) {
return false
}
else {
if (minVersion.major === version.major) {
if (typeof minVersion.minor === "number" && minVersion.minor > version.minor) {
return false
}
}
}
}
if (maxVersion && typeof maxVersion.major === "number") {
if (maxVersion.major < version.major) {
return false
}
else {
if (maxVersion.major === version.major) {
if (typeof maxVersion.minor === "number" && maxVersion.minor < version.minor) {
return false
}
}
}
}
return true
}, _bdiTimeOriginEpoch: Date.UTC(1601, 0, 1, 0, 0, 0), convertCMSArticle: function convertCMSArticle(result, createURIFunction, options) {
var newsArticle={};
newsArticle.editorial = true;
newsArticle.lastModified = result.lastModified;
newsArticle.entityType = result.entityType;
if (result.isFREOffline) {
var abstract=result.content.abstract;
var headline=result.content.headline;
var FREOfflineTitleResourceKey=result.FREOfflineTitleResourceKey;
var FREOfflineSubtitleResourceKey=result.FREOfflineSubtitleResourceKey;
result.content.headline = headline.replace(FREOfflineTitleResourceKey, PlatformJS.Services.resourceLoader.getString(FREOfflineTitleResourceKey));
result.content.abstract = abstract.replace(FREOfflineSubtitleResourceKey, PlatformJS.Services.resourceLoader.getString(FREOfflineSubtitleResourceKey));
newsArticle.isFREOffline = true
}
if (result.heroImage) {
newsArticle.anchorpoint = result.heroImage.anchorPoint
}
var cmsImage=null;
if (result.heroImage && result.heroImage.image) {
cmsImage = result.heroImage.image
}
else {
cmsImage = result.image
}
if (cmsImage) {
newsArticle.imageAttribution = cmsImage.attribution ? cmsImage.attribution : "";
newsArticle.altText = cmsImage.altText ? cmsImage.altText : "";
newsArticle.caption = cmsImage.caption ? toStaticHTML(cmsImage.caption) : "";
var originalImage=null;
if (cmsImage.images) {
for (var i=0; i < cmsImage.images.length; i++) {
var img=cmsImage.images[i];
if (img.url) {
var imgName=img.name && img.name.toLowerCase ? img.name.toLowerCase() : "";
if (imgName === "original") {
newsArticle.thumbnail = {};
newsArticle.thumbnail.url = img.url;
newsArticle.thumbnail.width = img.width;
newsArticle.thumbnail.height = img.height;
newsArticle.thumbnail.name = "original";
if (result.heroImage) {
newsArticle.thumbnail.heroFocalPoint = img.heroFocalPoint
}
}
else if (imgName === "semanticzoom") {
newsArticle.semanticZoomThumbnail = {};
newsArticle.semanticZoomThumbnail.url = img.url;
newsArticle.semanticZoomThumbnail.width = img.width;
newsArticle.semanticZoomThumbnail.height = img.height;
newsArticle.semanticZoomThumbnail.name = "semanticZoom"
}
else if (imgName === "lowres") {
newsArticle.thumbnailLowRes = {};
newsArticle.thumbnailLowRes.url = img.url;
newsArticle.thumbnailLowRes.width = img.width;
newsArticle.thumbnailLowRes.height = img.height;
newsArticle.thumbnailLowRes.name = "lowRes";
if (result.heroImage) {
newsArticle.thumbnailLowRes.heroFocalPoint = img.heroFocalPoint
}
}
}
}
}
}
else {
newsArticle.imageAttribution = "";
newsArticle.altText = "";
newsArticle.caption = ""
}
newsArticle.sourceImageUrl = result.content.source && result.content.source.favicon ? result.content.source.favicon : "";
newsArticle.headline = result.content.headline ? toStaticHTML(result.content.headline) : "";
newsArticle.title = newsArticle.headline;
newsArticle.source = result.content.source && result.content.source.name ? result.content.source.name : "";
newsArticle.destination = result.destination || "";
Utils.resolveDestination(newsArticle, createURIFunction);
newsArticle.abstract = result.content.abstract ? toStaticHTML(result.content.abstract) : "";
newsArticle.snippet = newsArticle.abstract;
newsArticle.byline = result.content.byline || result.byline || "";
newsArticle.kicker = result.content.kicker || result.kicker || "";
var publicationDate=result.content.publicationDate;
if (publicationDate) {
newsArticle.updatedTime = getDateString(publicationDate.updated, newsArticle.source);
newsArticle.publishTime = getDateString(publicationDate.published, newsArticle.source)
}
newsArticle.template = result.template;
newsArticle.templateClass = result.templateClass;
if (options) {
if (options.useByline) {
newsArticle.source = newsArticle.byline
}
}
newsArticle.paywall = result.paywallState;
return newsArticle
}, resolveDestination: function resolveDestination(entity, createURIFunction) {
createURIFunction = createURIFunction || Utils.parseCMSUriString;
var newsUri=createURIFunction(entity.destination);
if (newsUri) {
entity.market = newsUri.market ? newsUri.market : null;
if (newsUri.entitytype === "article") {
entity.type = newsUri.entitytype;
entity.articleid = newsUri.pageId && newsUri.pageId.length > 0 ? newsUri.pageId : null;
entity.contentid = newsUri.contentId && newsUri.contentId.length > 0 ? newsUri.contentId : null
}
else if (newsUri.entitytype === "slideshow") {
entity.type = newsUri.entitytype;
entity.contentid = newsUri.pageId
}
else if (newsUri.entitytype === "video") {
entity.type = newsUri.entitytype;
var videoOptions={};
var videoSource=null;
if (newsUri.contentId && newsUri.contentId.length > 0) {
videoSource = newsUri.contentId
}
var strippedTitle=Utils.stripHTML(entity.headline || entity.title);
if (!entity.thumbnail) {
entity.thumbnail = {
width: 0, height: 0, url: "", name: ""
}
}
videoOptions.thumbnail = entity.thumbnail.url;
videoOptions.videoSource = videoSource;
videoOptions.source = entity.source;
videoOptions.sourceImageUrl = entity.sourceImageUrl;
videoOptions.title = strippedTitle;
var externalUrl=newsUri.externalUrl;
if (externalUrl && externalUrl.length > 0) {
videoOptions.externalVideoUrl = externalUrl
}
var adNetworkId=newsUri.adNetworkId;
if (adNetworkId && adNetworkId.length > 0) {
videoOptions.adNetworkId = adNetworkId
}
entity.thumbnail.videoOptions = videoOptions
}
else if (newsUri.entitytype === "partnerPano" || newsUri.entitytype === "pano") {
entity.type = newsUri.entitytype
}
}
}, markDisposable: function markDisposable(element, disposeImpl) {
if (!element) {
console.warn("CommonJS.Utils.markDisposable: element is not set.");
debugger;
return null
}
var winControl=element.winControl;
if (!winControl) {
console.warn("CommonJS.Utils.markDisposable: element.winControl is not set.");
return WinJS.Utilities.markDisposable(element, disposeImpl)
}
else {
if (winControl.disposeImplAdded) {
console.warn("CommonJS.Utils.markDisposable: it has been applied on this element");
debugger
}
winControl.disposeImplAdded = true;
var newDisposeImpl=(disposeImpl || winControl.dispose || function _utils_675(){}).bind(winControl);
return WinJS.Utilities.markDisposable(element, newDisposeImpl)
}
}, loadStyleSheets: function loadStyleSheets(cssUris) {
var buildLink=function(cssUri) {
var link=document.createElement("link");
link.setAttribute("href", cssUri);
link.setAttribute("rel", "stylesheet");
return link
};
if (cssUris && cssUris.length > 0) {
var head=document.head,
foreach=Array.prototype.forEach,
links={},
re=/^ms-appx:\/\/[^\s\/]*(\S*)/;
foreach.call(head.querySelectorAll("link"), function createLinksMap(link) {
var href=link.href.toLowerCase();
var match=re.exec(href);
if (match) {
href = match[1]
}
if (href) {
links[href] = true
}
});
cssUris = cssUris.filter(function onlyNewCss(cssUri) {
return !links[cssUri.toLowerCase()]
});
if (cssUris.length > 0) {
var fragment=document.createDocumentFragment();
for (var i=0, len=cssUris.length; i < len; i++) {
fragment.appendChild(buildLink(cssUris[i]))
}
head.appendChild(fragment)
}
}
;
}, loadDeferredStyleSheets: function loadDeferredStyleSheets() {
CommonJS.Utils.loadStyleSheets(CommonJS.Utils._deferredCssUris);
CommonJS.Utils._deferredCssUris = []
}, registerDeferredStyleSheets: function registerDeferredStyleSheets(sheets) {
if (!CommonJS.Utils._deferredCssUris) {
CommonJS.Utils._deferredCssUris = []
}
var deferredCssUris=CommonJS.Utils._deferredCssUris;
sheets = typeof sheets === "string" ? [sheets] : sheets;
for (var i=0; i < sheets.length; i++) {
deferredCssUris.push(sheets[i])
}
}, showModalProgress: function showModalProgress(modalElementId) {
var loadingScreen=document.getElementById(modalElementId);
if (loadingScreen) {
WinJS.Utilities.removeClass(loadingScreen, "platformHide")
}
CommonJS.Progress.showProgress(CommonJS.Progress.centerProgressType)
}, hideModalProgress: function hideModalProgress(modalElementId) {
var loadingScreen=document.getElementById(modalElementId);
if (loadingScreen) {
WinJS.Utilities.addClass(loadingScreen, "platformHide")
}
CommonJS.Progress.hideProgress(CommonJS.Progress.centerProgressType)
}, IdEntryCollection: WinJS.Class.define(function IdEntryCollection_ctor() {
this.clean()
}, {
_id: null, _count: null, _collection: null, addEntry: function addEntry(entry) {
var id=this._id++;
this._count++;
this._collection[id] = entry;
return id
}, removeEntry: function removeEntry(id) {
this._count--;
var result=this._collection[id] || null;
if (this.isEmpty()) {
this._collection = {}
}
else {
this._collection[id] = null
}
return result
}, updateEntry: function updateEntry(id, entry) {
if (!entry) {
return this._removeEntry(id)
}
else {
var result=this._collection[id];
this._collection[id] = entry;
return result
}
}, getIds: function getIds() {
var result=[];
this.doForEach(function collectIds(value, key) {
result.push(key)
});
return result
}, getEntry: function getEntry(id) {
return this._collection[id]
}, doForEach: function doForEach(operation, caller) {
var collection=this._collection;
for (var key in collection) {
if (collection.hasOwnProperty(key)) {
var value=collection[key];
if (value) {
operation.call(caller || this, value, key, collection)
}
}
}
}, clean: function clean() {
this._id = 0;
this._count = 0;
this._collection = {}
}, isEmpty: function isEmpty() {
return this._count === 0
}
}), _EVENTLISTENERCOLLECTION: "eventListenerManager(EB3FA3E6-82AA-483E-B2DC-873FE07DFA97)", getEventListenerManager: function getEventListenerManager(object, friendlyName) {
var manager=null;
if (object) {
var managerId=CommonJS.Utils._EVENTLISTENERCOLLECTION;
manager = object[managerId];
if (!manager) {
var _friendlyName=friendlyName || (object.constructor && object.constructor.toString().slice(0, 40)) || "";
manager = object[managerId] = new CommonJS.Utils.EventListenerManager(_friendlyName)
}
}
return manager
}, removeEventListenerManager: function removeEventListenerManager(object) {
if (object) {
var managerId=CommonJS.Utils._EVENTLISTENERCOLLECTION;
var manager=object[managerId];
if (manager) {
manager.dispose();
object[managerId] = null
}
}
}, _allEventListeners: null, getAllEventListeners: function getAllEventListeners() {
if (!CommonJS.Utils._allEventListenenrs) {
CommonJS.Utils._allEventListenenrs = new CommonJS.Utils.IdEntryCollection
}
return CommonJS.Utils._allEventListenenrs
}, EventListenerManager: WinJS.Class.define(function eventListenerManager_ctor(friendlyName) {
this._disposed = false;
this._listeners = new CommonJS.Utils.IdEntryCollection;
this._listenersId = CommonJS.Utils.getAllEventListeners().addEntry(this);
this._friendlyName = friendlyName
}, {
_listeners: null, _disposed: null, _friendlyName: "EventListenerManager", toString: function toString() {
return this._friendlyName
}, add: function add(host, name, listener, message, isCrossPage, capture) {
if (this._disposed) {
console.warn("This eventsManger has been disposed. This new added listener will not be unregistered. \n" + "To keep the function works, this listener will still be registered. But this bug has to be fixed to avoid memory leak. \n" + "If you need help, please contact CUX team");
debugger
}
if (host && name && listener) {
capture = capture ? true : false;
host.addEventListener(name, listener, capture);
if (!message) {
message = "";
if (host.id) {
message += host.id + " "
}
message += name
}
return this._listeners.addEntry({
host: host, name: name, listener: listener, message: message, isCrossPage: isCrossPage, capture: capture
})
}
else {
return -1
}
}, remove: function remove(id) {
if (!this._disposed) {
this._removeListener(this._listeners.removeEntry(id))
}
}, _removeListener: function _removeListener(entry) {
if (entry) {
var host=entry.host,
name=entry.name,
listener=entry.listener,
capture=entry.capture;
if (host && name && listener) {
try {
host.removeEventListener(name, listener, capture)
}
catch(e) {
console.warn("get an error message when removing event listener. event listener message: " + entry.message + "; exception: " + e);
debugger
}
}
}
}, getIds: function getIds() {
return this._listeners.getIds()
}, getEntry: function getEntry(id) {
return this._listeners.getEntry(id)
}, doForEach: function doForEach(operation, caller) {
this._listeners.doForEach(function goThroughEachEntry(entry, key) {
var host=entry.host,
name=entry.name,
listener=entry.listener;
operation.call(caller || this, key, host, name, listener)
})
}, removeListenerForHost: function removeListenerForHost(host) {
if (!this._disposed) {
var ids=[];
this.doForEach(function _collectIds(_id, _host, _name, _listener) {
if (host === _host) {
ids.push(_id)
}
});
ids.forEach(function _removeListener(id) {
this.remove(id)
}, this)
}
}, removeListenerForHostAndName: function removeListenerForHostAndName(host, name) {
if (!this._disposed) {
var ids=[];
this.doForEach(function _collectIds(_id, _host, _name, _listener) {
if (host === _host && _name === name) {
ids.push(_id)
}
});
ids.forEach(function _removeListener(id) {
this.remove(id)
}, this)
}
}, clear: function clear() {
if (!this._disposed) {
this._listeners.doForEach(function removeListeners(entry) {
this._removeListener(entry)
}, this)
}
}, dispose: function dispose() {
if (!this._disposed) {
this.clear();
CommonJS.Utils.getAllEventListeners().removeEntry(this._listenersId);
this._listeners = null;
this._listenersId = null;
this._disposed = true
}
}
}), Delayer: WinJS.Class.define(function ctor(callback, timeout, caller) {
this._callback = callback || function _utils_936() {
console.log("no callback function is passed into Delayer");
debugger
};
this._timeout = timeout || 500;
this._caller = caller || null;
if (this._caller) {
this._callbackBinding = this._callback.bind(this._caller)
}
else {
this._callbackBinding = this._callback
}
}, {
_timeout: 0, _callback: null, _callbackBinding: null, _caller: null, _timeoutid: null, _slice: Array.prototype.slice, _bind: Function.prototype.bind, delay: function delay() {
this._clearTimeout();
var callback=this._callbackBinding;
if (arguments.length) {
var argu=[this._caller].concat(this._slice.call(arguments));
callback = this._bind.apply(this._callback, argu)
}
this._timeoutid = setTimeout(callback, this._timeout)
}, delayWithTimeout: function delayWithTimeout(timeout) {
this._clearTimeout();
this.timeoutid = setTimeout(this._callbackBinding, timeout)
}, dispose: function dispose() {
this._clearTimeout()
}, _clearTimeout: function _clearTimeout() {
if (this._timeoutid) {
clearTimeout(this._timeoutid);
this._timeoutid = null
}
}
}), isFREDone: function isFREDone() {
return Windows.Storage.ApplicationData.current.localSettings.values.hasKey("FREDone")
}
});
var PageEventListenerManager=WinJS.Class.derive(CommonJS.Utils.EventListenerManager, function pageEventListenerManager_ctor() {
CommonJS.Utils.EventListenerManager.call(this, "Page EventListenerManager");
this.add(WinJS.Navigation, "navigating", function disposePageEventListenerManager() {
if (_PageEventListenerManagerInstance) {
_PageEventListenerManagerInstance.dispose();
_PageEventListenerManagerInstance = null
}
})
}, {}),
_PageEventListenerManagerInstance=null;
WinJS.Namespace.define("CommonJS.Utils.PageEventListenerManager", {getInstance: function getInstance() {
if (!_PageEventListenerManagerInstance) {
_PageEventListenerManagerInstance = new PageEventListenerManager
}
return _PageEventListenerManagerInstance
}});
if (!CommonJS.Utils._deferredCssUris) {
CommonJS.Utils.registerDeferredStyleSheets(["/css/default-deferred.css", "/common/css/common-deferred.css"])
}
;
})(WinJS);
(function appexLocalLoggerInit() {
"use strict";
var formatTime=function(date) {
var hours=("0" + date.getHours()).slice(-2);
var minutes=("0" + date.getMinutes()).slice(-2);
var seconds=("0" + date.getSeconds()).slice(-2);
var milliseconds=("00" + date.getMilliseconds()).slice(-3);
return [hours, minutes, seconds, milliseconds].join(":")
};
WinJS.Namespace.define("LoggerJS", {LocalFileLogger: WinJS.Class.define(function logger_ctor(filename, append) {
var that=this;
this._filename = filename;
this._cachedMessages = [];
this._processPromise = (PlatformJS && PlatformJS.platformInitializedPromise ? WinJS.Promise.wrap(null) : WinJS.Promise.timeout(5000));
this._processPromise = this._processPromise.then(function waitForPlatform() {
return PlatformJS.platformInitializedPromise
}).then(function openFile() {
if (!PlatformJS.isDebug) {
that.dispose();
return WinJS.Promise.wrap(null)
}
var localFolder=Windows.Storage.ApplicationData.current.localFolder;
var openFlag=append ? Windows.Storage.CreationCollisionOption.openIfExists : Windows.Storage.CreationCollisionOption.replaceExisting;
return localFolder.createFileAsync(that._filename, Windows.Storage.CreationCollisionOption.replaceExisting)
}).then(function fileOpened(fileHandle) {
if (fileHandle) {
that._fileHandle = fileHandle;
return that._writeCacheToFile()
}
else {
that.dispose()
}
}, function fileError(e) {
that.dispose()
})
}, {
_processPromise: null, _cachedMessages: null, _fileHandle: null, dispose: function dispose() {
this._cachedMessages.length = 0;
this.write = function(){};
this._writeCacheToFile = function(){};
this._fileHandle = null;
if (this._processPromise) {
this._processPromise.cancel()
}
}, write: function write(text) {
this._cachedMessages.push([new Date, text]);
if (this._cachedMessages.length === 1) {
var that=this;
this._processPromise = this._processPromise.then(function pause() {
return WinJS.Promise.timeout(500)
}).then(function writeCache() {
return that._writeCacheToFile()
})
}
}, _writeCacheToFile: function _writeCacheToFile() {
var len=this._cachedMessages.length;
if (this._fileHandle && this._cachedMessages.length) {
var that=this;
var text="";
for (var i=0; i < len; i++) {
var values=this._cachedMessages[i];
text += [formatTime(values[0]), " : ", values[1], "\r\n"].join("")
}
this._cachedMessages.length = 0;
return Windows.Storage.FileIO.appendTextAsync(that._fileHandle, text)
}
;
return WinJS.Promise.wrap(null)
}
}, {
get: function get(logName, append) {
logName = logName ? logName : "default.log";
var instance=LoggerJS._loggerInstances[logName];
if (!instance) {
instance = new LoggerJS.LocalFileLogger(logName, append);
LoggerJS._loggerInstances[logName] = instance;
LoggerJS._loggerNames.push(logName)
}
;
return instance
}, dispose: function dispose() {
for (var i=LoggerJS._loggerNames.length - 1; i >= 0; i--) {
var logName=LoggerJS._loggerNames[i];
LoggerJS._loggerInstances[logName].dispose()
}
LoggerJS._loggerInstances = {};
LoggerJS._loggerNames = []
}
})});
LoggerJS._loggerInstances = (LoggerJS._loggerInstances ? LoggerJS._loggerInstances : {});
LoggerJS._loggerNames = (LoggerJS._loggerNames ? LoggerJS._loggerNames : [])
})();
(function appexPlatformUtilitiesInit() {
"use strict";
WinJS.Namespace.define("CommonJS.Utils.DateTimeFormatting", {
dateTimeFormat: {
article: 1, panoTile: 2, panoWatermark: 3, video: 4
}, _dateTimeFormatters: {}, registerDateTimeFormatter: function registerDateTimeFormatter(key, formatter) {
CommonJS.Utils.DateTimeFormatting._dateTimeFormatters[key] = formatter
}, unregisterDateTimeFormatter: function unregisterDateTimeFormatter(key) {
CommonJS.Utils.DateTimeFormatting._dateTimeFormatters[key] = null
}, getDateTimeFormatter: function getDateTimeFormatter(key) {
return CommonJS.Utils.DateTimeFormatting._dateTimeFormatters[key]
}
})
})();
(function _FeaturedCluster_7() {
"use strict";
WinJS.Namespace.define("CommonJS", {FeaturedCluster: WinJS.Class.define(function _FeaturedCluster_15(domElement, options) {
this._domElement = domElement;
domElement.winControl = this;
CommonJS.Utils.markDisposable(domElement);
this._createContainerControl();
this._currentMarket = Platform.Utilities.Globalization.getCurrentMarket().toLocaleLowerCase();
WinJS.UI.setOptions(this, options)
}, {
_currentMarket: "en-us", _view: null, _clusterItems: null, featuredCategory: "", featuredSources: null, dataSet: null, render: function render() {
var that=this;
if (this.dataSet && this.dataSet.length > 0) {
return this._update(this.dataSet)
}
else {
return this._getQueryServicePromise().then(function renderSuccess(response) {
var parsedData=that._parseData(response);
return that._update(parsedData)
}, function renderFailure(error) {
return WinJS.Promise.wrapError({})
})
}
}, currentMarket: {set: function set(value) {
this._currentMarket = value
}}, featuredItemClick: function featuredItemClick(event) {
var item=event.detail.item.data;
if (item.pageInfo && item.state) {
if (item.state.dynamicInfo) {
item.state.dynamicInfo.entrypoint = "featuredsourcescluster"
}
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(Microsoft.Bing.AppEx.Telemetry.ImpressionNavMethod.featuredSourcesCluster);
WinJS.Navigation.navigate(item.pageInfo, item.state)
}
}, moduleInfo: {
isInteractive: false, fragmentPath: "/common/FeaturedCluster/html/featuredClusterTemplates.html", templateId: "moreSourceItemTemplate"
}, dispose: function dispose() {
if (this._view) {
this._view.dispose()
}
}, _getQueryServicePromise: function _getQueryServicePromise(urlParams, payloadParams, transformer, options) {
var that=this;
return new WinJS.Promise(function _FeaturedCluster_89(complete, error, progress) {
var cacheInstance=PlatformJS.Cache.CacheService.getInstance("ConfigurationCache");
var searchEntry=that._currentMarket + "-Features";
PlatformJS.Navigation.mainNavigator.channelManager.downloadFeaturesConfigAsync().then(function downloadComplete() {
cacheInstance.findEntry(searchEntry, {supportsInMemory: true}).then(function getFeaturesConfig_Complete(response) {
var returnValue=null;
if (response && response.dataValue) {
returnValue = response.dataValue
}
complete(returnValue)
}, function _FeaturedCluster_100() {
complete(null)
})
}, function downloadError() {
complete(null)
})
})
}, _parseData: function _parseData(jsonResponse) {
var that=this;
var featuredChannels=[];
var fc=this.featuredCategory;
var mn=PlatformJS.Navigation.mainNavigator.channelManager;
if (jsonResponse && jsonResponse.navbaritems && jsonResponse.sources) {
var featuredSources={};
var sources=jsonResponse.sources;
for (var idx=0, len=sources.length; idx < len; idx++) {
if (sources[idx] && sources[idx].id) {
var sourceId=sources[idx].id.toLowerCase();
featuredSources[sourceId] = sources[idx]
}
}
this.featuredSources = featuredSources;
jsonResponse.navbaritems.forEach(function _FeaturedCluster_128(navBarItem) {
if (navBarItem.destination.startsWith("//sources/")) {
var channelInfo=mn.parseChannel(navBarItem, jsonResponse.sources);
if (channelInfo) {
var sourceId=navBarItem.destination.substring(10).toLowerCase();
var sourceItem=that.featuredSources[sourceId];
if (sourceItem && sourceItem.clusterlogo && sourceItem.displayname) {
channelInfo.panoTitle = sourceItem.displayname;
channelInfo.panoDescription = sourceItem.description ? sourceItem.description : "";
channelInfo.clusterlogo = sourceItem.clusterlogo;
channelInfo.featured_url = sourceItem.featuredurl;
channelInfo.ad_unit_id = sourceItem.adunitid;
channelInfo.instrumentation_id = sourceItem.instrumentationid;
featuredChannels.push(channelInfo)
}
}
}
})
}
return featuredChannels.length > 0 ? featuredChannels : null
}, _createContainerControl: function _createContainerControl() {
var parent=document.createElement("div");
var child=document.createElement("div");
this._domElement.appendChild(parent);
var className="platformListLayout moreSourceList";
this._view = new CommonJS.Immersive.ItemsContainer(child, {
className: className, onitemclick: this.featuredItemClick.bind(this)
});
parent.appendChild(child)
}, _update: function _update(data) {
var that=this;
var view=this._view;
if (data && data.length > 0) {
this.featuredSources = data;
this._clusterItems = this._prepareFeaturedSources(data);
WinJS.UI.setOptions(view, {itemDataSource: this._clusterItems.dataSource});
return view.render()
}
return WinJS.Promise.wrap({})
}, _createSourceContent: function _createSourceContent(entity) {
if (entity.moduleInfo) {
return {
data: entity.data, moduleInfo: entity.moduleInfo
}
}
else {
return {
data: entity, moduleInfo: this.moduleInfo
}
}
}, _prepareFeaturedSources: function _prepareFeaturedSources(entities) {
var clusterItems=new WinJS.Binding.List;
for (var i=0; i < entities.length; i++) {
clusterItems.push(this._createSourceContent(entities[i]))
}
return clusterItems
}
})})
})();
(function appexCommonControlsECEdgyFlyoutInit() {
"use strict";
WinJS.Namespace.define("CommonJS", {EdgyFlyout: WinJS.Class.define(function edgyFlyout_ctor(element, options) {
this.element = element || document.createElement("button");
options.onclick = this._onClick.bind(this);
var appbarOptions={
type: "flyout", icon: options.icon, label: options.buttonText, id: options.id
};
if (options.extraClass) {
appbarOptions.extraClass = options.extraClass
}
this.appbarbtn = new WinJS.UI.AppBarCommand(this.element, appbarOptions);
WinJS.UI.setOptions(this, options)
}, {
_onClick: function _onClick() {
this.show()
}, _buildControl: function _buildControl() {
this._buildFlyout()
}, _buildFlyout: function _buildFlyout() {
if (this.flyoutContainer) {
return
}
var div=document.createElement("div");
div.className = "edgyFlyout";
document.body.appendChild(div);
var flyout=this.flyout = new WinJS.UI.Flyout(div);
this.flyoutContainer = div;
this.appbarbtn.flyout = flyout
}, show: function show(){}, hide: function hide() {
this.flyout.hide()
}, dispose: function dispose() {
if (this.flyout) {
this.flyoutContainer.innerHTML = "";
if (this.flyoutContainer.parentNode) {
this.flyoutContainer.parentNode.removeChild(this.flyoutContainer)
}
this.appbarbtn = null;
this.flyout = null
}
}
})})
})();
(function appexPlatformControlsFlyoutInit() {
"use strict";
var NS=WinJS.Namespace.define("CommonJS", {Flyout: WinJS.Class.define(function flyout_ctor(element, options) {
element = element || document.createElement("div");
element.winControl = this;
this._isSticky = false;
this._init(element);
WinJS.UI.setOptions(this, options)
}, {
_domElement: null, _contentFragment: null, _flyoutContentElement: null, _isSticky: false, _navEvent: null, onCloseButtonClick: null, onReady: null, onHide: null, onHiding: null, isSticky: {
set: function set(value) {
this._isSticky = value;
this._domElement.style.zIndex = 2500
}, get: function get() {
return this._isSticky
}
}, contentFragment: {
get: function get() {
return this._contentFragmentPath
}, set: function set(value) {
var that=this;
this._contentFragmentPath = value;
if (!value.path) {
PlatformJS.Utilities.onError("Fragment path must not be null")
}
CommonJS.loadModule({
fragmentPath: value.path, templateId: value.id
}, value.data, this._flyoutContentElement).then(function flyout_loadModuleComplete() {
that.show()
})
}
}, getContentElement: function getContentElement() {
return this._flyoutContentElement
}, _init: function _init(element) {
this._domElement = element;
element.id = "platformFlyout";
element.setAttribute("role", "alertdialog");
var that=this;
element.addEventListener("keydown", function flyout_onKeyDown(event) {
if (event.keyCode === 27) {
that.hide()
}
});
var flyoutContainer=document.createElement("div");
this._flyoutContentElement = document.createElement("div");
WinJS.Utilities.addClass(element, "platformFlyout");
WinJS.Utilities.addClass(flyoutContainer, "platformFlyoutContainer");
WinJS.Utilities.addClass(this._flyoutContentElement, "platformFlyoutContent");
flyoutContainer.appendChild(this._flyoutContentElement);
element.appendChild(flyoutContainer)
}, hide: function hide() {
if (this._navEvent) {
WinJS.Navigation.removeEventListener("navigating", this._navEvent)
}
if (this.onHiding) {
this.onHiding()
}
if (CommonJS._currentFlyout && this._domElement) {
WinJS.Utilities.removeClass(this._domElement, "platformFlyoutVisible");
this._domElement.outerHTML = ""
}
if (this.onHide) {
this.onHide()
}
CommonJS._currentFlyout = null
}, show: function show() {
if (!CommonJS._currentFlyout) {
CommonJS._currentFlyout = this;
document.body.appendChild(this._domElement);
WinJS.Utilities.addClass(this._domElement, "platformFlyoutVisible");
this._onReady();
if (!this.isSticky) {
var that=this;
this._navEvent = function() {
that.hide()
};
WinJS.Navigation.addEventListener("navigating", this._navEvent)
}
}
}, _onCloseButtonClick: function _onCloseButtonClick(event) {
if (!this.isSticky) {
this.hide()
}
if (this.onCloseButtonClick) {
this.onCloseButtonClick()
}
}, _onReady: function _onReady() {
if (typeof this.onReady === "function") {
this.onReady()
}
}, closeButtonHidden: {set: function set(value){}}
})})
})();
(function appexCommonControlsECSortFlyoutInit() {
"use strict";
WinJS.Namespace.define("CommonJS", {SortFlyout: WinJS.Class.derive(CommonJS.EdgyFlyout, function sortFlyout_ctor(element, options) {
CommonJS.EdgyFlyout.apply(this, [element, options]);
WinJS.UI.setOptions(this, options);
this._buildSortControl()
}, {
onSortChanged: {
get: function get() {
return this._onSortChanged || function sortFlyout_onSortChangedNoop(){}
}, set: function set(value) {
this._onSortChanged = value
}
}, Items: {
get: function get() {
return this.getItems()
}, set: function set(value) {
this.setItems(value)
}
}, selectionChanged: {
get: function get() {
return this._selectionChanged
}, set: function set(value) {
this._selectionChanged = value
}
}, flyoutHeader: {
get: function get() {
return this._flyoutHeader
}, set: function set(value) {
var div=document.createElement("div");
div.textContent = value;
this._flyoutHeader = div
}
}, setItems: function setItems(items) {
this._setItems(items)
}, _buildSortControl: function _buildSortControl() {
this._buildControl();
this._buildScrollList()
}, _selectionChange: function _selectionChange(event) {
console.log("edgy sort changed");
var indexStr=event.currentTarget.getAttribute("index");
var index=parseInt(indexStr);
var item=this._items[index];
item.selectedIndex = index;
var that=this;
setTimeout(function sortFlyout_afterSelectionChange() {
that.hide();
var appbars=document.querySelectorAll("[data-win-control='WinJS.UI.AppBar']");
if (appbars && appbars.length > 0) {
for (var i=0, l=appbars.length; i < l; i++) {
appbars[i].winControl.hide()
}
}
}, 500);
if (this.selectionChanged) {
this.selectionChanged(item)
}
}, _setItems: function _setItems(items) {
var itemsDiv=this.itemsDiv;
itemsDiv.innerHTML = "";
this._items = items;
for (var i=0, l=items.length; i < l; i++) {
var item=items[i];
item.index = i;
this._addItem(itemsDiv, "edgySort", item)
}
return itemsDiv
}, _buildScrollList: function _buildScrollList() {
var itemsDiv=document.createElement("div");
var that=this;
itemsDiv.className = "edgySelectableFilterItems";
itemsDiv.setAttribute("aria-role", "menu");
itemsDiv.addEventListener("change", function sortFlyout_onItemChange(event) {
that._selectionChange.call(that, event)
});
this._selectionContainer = itemsDiv;
this.flyout.element.appendChild(itemsDiv);
this.itemsDiv = itemsDiv
}, _deselectAll: function _deselectAll(index) {
var items=document.querySelectorAll("sort-item");
for (var i=0; i < items.length; i++) {
WinJS.Utilities.removeClass(items[i], "sort-checked")
}
}, _addItem: function _addItem(itemsContainer, filterName, item) {
var itemText=item.label;
var itemValue=item.value;
var checked=item.selected;
var index=item.index;
var that=this;
var row=document.createElement("div");
var validKeys={
13: true, 32: true
};
var onSelection=function(evt) {
if (evt.keyCode) {
if (!validKeys[evt.keyCode]) {
return
}
}
that._selectionChange.call(that, evt);
that._deselectAll(index);
WinJS.Utilities.addClass(evt.currentTarget, "sort-checked")
};
row.addEventListener("click", onSelection);
row.addEventListener("keyup", onSelection);
row.className = "sort-item";
row.setAttribute("tabindex", 0);
row.setAttribute("role", "menuitem");
row.setAttribute("value", itemValue);
row.setAttribute("index", index);
var check=document.createElement("div");
check.className = "sort-item-check";
row.appendChild(check);
if (checked) {
WinJS.Utilities.addClass(check, "sort-checked")
}
var text=document.createElement("div");
text.className = "sort-text";
text.textContent = itemText;
row.appendChild(text);
itemsContainer.appendChild(row)
}
})})
})();
(function appexPlatformControlsHeaderInit() {
"use strict";
var EventNS=CommonJS.WindowEventManager;
var NS=WinJS.Namespace.define("CommonJS.Immersive", {Header: WinJS.Class.define(function header_ctor(element, options) {
element = element || document.createElement("div");
element.winControl = this;
this._eventManager = EventNS.getInstance();
this._filterControls = [];
CommonJS.Utils.markDisposable(element);
this._headerBackButton = null;
this._init(element);
WinJS.UI.setOptions(this, options);
this._headerRenderComplete = true
}, {
_domElement: null, _dataSource: null, _headerTitleText: "", _headerTitleWidth: null, _headerSubTitleText: "", _headerSubTitleWidth: null, _headerBackButton: null, _platformHeaderSubTitle: null, _platformHeaderTitle: null, _fontColor: null, _headerTitleSentenceCasing: false, _filterBar: null, _filterBarData: null, _filterControls: null, _hasFilterRendered: false, _offsetWidth: null, _offsetHeight: null, _direction: null, _clippedElement: null, _eventManager: null, _onSubTitleClick: null, _onBackButtonBlurredHandler: null, _onBackButtonFocusedHandler: null, _onBackButtonClickHandler: null, _onKeyDownHandler: null, _subtitleClickHandlerHandler: null, _subtitleKeyUpHandlerHandler: null, _updateHeaderTitleWidthBinding: null, _disposed: false, dispose: function dispose() {
if (this._disposed) {
return
}
this._disposed = true;
if (this._onBackButtonBlurredHandler) {
this._headerBackButton.removeEventListener("blur", this._onBackButtonBlurredHandler);
this._onBackButtonBlurredHandler = null
}
if (this._onBackButtonFocusedHandler) {
this._headerBackButton.removeEventListener("focus", this._onBackButtonFocusedHandler);
this._onBackButtonFocusedHandler = null
}
if (this._onBackButtonClickHandler) {
this._headerBackButton.removeEventListener("click", this._onBackButtonClickHandler);
document.removeEventListener("keydown", this._onBackButtonClickHandler);
this._onBackButtonClickHandler = null
}
if (this._eventManager) {
if (this._onKeyDownHandler) {
this._eventManager.removeEventListener(EventNS.Events.KEY_DOWN, this._onKeyDownHandler, false)
}
this._eventManager = null
}
this._onKeyDownHandler = null;
if (this._subtitleClickHandlerHandler) {
this._platformHeaderSubTitle.removeEventListener("click", this._subtitleClickHandlerHandler);
this._subtitleClickHandlerHandler = null
}
if (this._subtitleKeyUpHandlerHandler) {
this._platformHeaderSubTitle.removeEventListener("keyup", this._subtitleKeyUpHandlerHandler);
this._subtitleKeyUpHandlerHandler = null
}
if (this._updateHeaderTitleWidthBinding) {
CommonJS.WindowEventManager.removeEventListener(CommonJS.WindowEventManager.Events.PAGE_RESIZE, this._updateHeaderTitleWidthBinding);
this._updateHeaderTitleWidthBinding = null
}
if (this._filterBar) {
this._filterBar.dispose();
this._filterBar = null
}
var domElement=this._domElement;
if (domElement) {
this._domElement = null;
domElement.winControl = null;
WinJS.Utilities.disposeSubTree(this._hgroup);
WinJS.Utilities.disposeSubTree(this._headerBackButton);
domElement.removeChild(this._hgroup);
domElement.removeChild(this._headerBackButton);
this._hgroup = null;
this._headerBackButton = null
}
this._onSubTitleClick = null
}, initFilterBar: function initFilterBar(filterDisplayUI) {
var filterBarDiv=document.createElement("div");
var options={};
filterBarDiv.setAttribute("role", "menubar");
filterBarDiv.setAttribute("aria-label", PlatformJS.Services.resourceLoader.getString("/platform/filterMenu"));
filterBarDiv.setAttribute("id", "immersiveFilterBar");
WinJS.Utilities.addClass(filterBarDiv, "immersiveFilterBar");
CommonJS.setAutomationId(filterBarDiv);
this._domElement.appendChild(filterBarDiv);
this._filterBar = new CommonJS.Filters.FilterMenu(filterBarDiv, options);
if (filterDisplayUI) {
this._filterBar.onFlyoutShowing = function(event) {
WinJS.Utilities.removeClass(filterDisplayUI, "ecvHide")
};
this._filterBar.onFlyoutHidden = function(event) {
WinJS.Utilities.addClass(filterDisplayUI, "ecvHide")
}
}
}, onSubTitleClick: {
get: function get() {
return this._onSubTitleClick
}, set: function set(onSubTitleClick) {
this._onSubTitleClick = onSubTitleClick
}
}, filterControls: {
get: function get() {
return this._filterBarData
}, set: function set(value) {
if (value && value.length > 0) {
this._filterBarData = value;
this._updateFilterBar()
}
}
}, headerTitleText: {
get: function get() {
return this._headerTitleText
}, set: function set(value) {
this._headerTitleText = value;
this._platformHeaderTitle.innerText = value;
if (value !== "") {
this._platformHeaderTitle.setAttribute("role", "heading");
this.headerImage = null
}
this._headerTitleWidth = this._platformHeaderTitle.clientWidth
}
}, _updateHeaderTitleWidth: function _updateHeaderTitleWidth() {
if (this._platformHeaderTitle) {
this._headerTitleWidth = this._platformHeaderTitle.clientWidth
}
}, headerSubTitleText: {
get: function get() {
return this._headerSubTitleText
}, set: function set(value) {
value = value.trim() || "";
var element=this._platformHeaderSubTitle;
element.innerHTML = value;
this._headerSubTitleText = value;
if (value.length === 0) {
element = this._platformHeaderTitle
}
else {
this._resetHeader(this._platformHeaderTitle);
this._platformHeaderSubTitle.setAttribute("role", "heading");
this.headerImage = null
}
this._offsetWidth = element.offsetWidth;
this._offsetHeight = element.offsetHeight;
this._clippedElement = element;
this._headerSubTitleWidth = this._platformHeaderSubTitle.clientWidth
}
}, headerImage: {
get: function get() {
return this._headerImage
}, set: function set(value) {
this._headerImage = value;
if (value && !this.headerTitleText && !this.headerSubTitleText) {
var valueType=typeof value;
if (valueType === "string") {
this._platformHeaderImage.src = value;
WinJS.Utilities.removeClass(this._platformHeaderImage, "platformVisibilityNone")
}
else if (valueType === "object" && value.url && typeof value.url === "string") {
this._platformHeaderImage.src = value.url;
if (value.width && value.height) {
this._platformHeaderImage.style.width = value.width + "px";
this._platformHeaderImage.style.height = value.height + "px"
}
WinJS.Utilities.removeClass(this._platformHeaderImage, "platformVisibilityNone")
}
else {
WinJS.Utilities.addClass(this._platformHeaderImage, "platformVisibilityNone")
}
}
else {
WinJS.Utilities.addClass(this._platformHeaderImage, "platformVisibilityNone")
}
}
}, headerTitleSentenceCasing: {set: function set(value) {
this._headerTitleSentenceCasing = value;
if (value && this._platformHeaderTitle) {
this._platformHeaderTitle.style.textTransform = "none"
}
}}, fontColor: {
get: function get() {
return this._fontColor
}, set: function set(value) {
if (this._domElement) {
var oldFontColor=this._fontColor;
this._fontColor = value;
if (oldFontColor) {
WinJS.Utilities.removeClass(this._domElement, oldFontColor)
}
if (this._fontColor) {
WinJS.Utilities.addClass(this._domElement, this._fontColor)
}
}
}
}, setTitleState: function setTitleState(hideTitle) {
if (hideTitle !== this._platformHeaderTitle.disabled) {
this._platformHeaderTitle.disabled = hideTitle;
if (hideTitle) {
this._platformHeaderTitle.style.visibility = "hidden"
}
else {
this._platformHeaderTitle.style.visibility = "visible"
}
}
}, getFilterControl: function getFilterControl(filterName) {
if (this._filterControls[filterName]) {
return this._filterControls[filterName]
}
else {
return null
}
}, getSubTitleWidth: function getSubTitleWidth() {
if (this._headerSubTitleWidth > 0) {
return this._headerSubTitleWidth
}
else {
return CommonJS.Immersive.Header.largeHeaderHeight / this._platformHeaderTitle.clientHeight * this._headerTitleWidth
}
}, getTitleWidth: function getTitleWidth() {
return this._headerTitleWidth
}, subTitleMaxWidth: {set: function set(value) {
if (value < CommonJS.Immersive.PanoramaPanel.minClusterWidth) {
value = CommonJS.Immersive.PanoramaPanel.minClusterWidth
}
this._platformHeaderSubTitle.style.maxWidth = value + "px"
}}, transitionHeader: function transitionHeader(currentPosition, nextClusterPosition) {
var offsetWidth=this._offsetWidth;
var divToClip=this._clippedElement;
var clipWidth=nextClusterPosition - currentPosition - CommonJS.Immersive.PanoramaPanel.clusterSpacing;
if (nextClusterPosition === Number.POSITIVE_INFINITY) {
this._resetHeader(divToClip)
}
else {
if (clipWidth >= 0) {
if (!divToClip.isVisible) {
WinJS.Utilities.removeClass(divToClip, "platformVisibilityNone");
divToClip.isVisible = true
}
if (offsetWidth > clipWidth) {
if (this._direction) {
var width=offsetWidth;
divToClip.style.clip = "rect(0px," + width + "px, " + this._offsetHeight + "px, " + (width - clipWidth) + "px)"
}
else {
divToClip.style.clip = "rect(0px," + clipWidth + "px, " + this._offsetHeight + "px, 0px)"
}
divToClip.style.opacity = clipWidth / offsetWidth;
divToClip.isClipped = true
}
else if (divToClip.isClipped) {
this._resetHeader(divToClip)
}
}
else {
if (divToClip.isVisible) {
WinJS.Utilities.addClass(divToClip, "platformVisibilityNone");
divToClip.isVisible = false
}
}
}
}, _init: function _init(element) {
this._domElement = element;
CommonJS.setAutomationId(element);
element.setAttribute("role", "banner");
var backButton=this._headerBackButton = document.createElement("button");
backButton.setAttribute("aria-label", CommonJS.resourceLoader.getString("/platform/GoBack"));
CommonJS.setAutomationId(backButton, element, "backButton");
var hgroup=this._hgroup = document.createElement("hgroup");
this._platformHeaderTitle = document.createElement("h1");
this._platformHeaderSubTitle = document.createElement("h2");
this._platformHeaderImage = document.createElement("img");
hgroup.setAttribute("role", "group");
this._platformHeaderTitle.setAttribute("role", "heading");
this._platformHeaderSubTitle.setAttribute("role", "heading");
this._platformHeaderImage.setAttribute("role", "heading");
WinJS.Utilities.addClass(backButton, "win-backbutton immersiveBackButton");
WinJS.Utilities.addClass(this._platformHeaderTitle, "immersiveHeaderTitle");
WinJS.Utilities.addClass(this._platformHeaderSubTitle, "immersiveHeaderSubTitle");
WinJS.Utilities.addClass(this._platformHeaderImage, "immersiveHeaderImage platformVisibilityNone");
WinJS.Utilities.addClass(element, "immersiveHeader");
WinJS.Utilities.addClass(element, "win-disposable");
CommonJS.setAutomationId(hgroup, element, "hgroup");
CommonJS.setAutomationId(this._platformHeaderTitle, element, "title");
CommonJS.setAutomationId(this._platformHeaderSubTitle, element, "subTitle");
CommonJS.setAutomationId(this._platformHeaderImage, element, "subTitle");
hgroup.setAttribute("aria-labelledby", this._platformHeaderTitle.id + " " + this._platformHeaderSubTitle.id);
element.setAttribute("aria-labelledby", this._platformHeaderTitle.id);
this._platformHeaderImage.onerror = function(e) {
WinJS.Utilities.addClass(e.target, "platformVisibilityNone")
};
hgroup.appendChild(this._platformHeaderTitle);
hgroup.appendChild(this._platformHeaderSubTitle);
hgroup.appendChild(this._platformHeaderImage);
element.appendChild(backButton);
element.appendChild(hgroup);
if (WinJS.Navigation.canGoBack) {
backButton.isfocused = false;
this._onBackButtonBlurredHandler = this._onBackButtonBlurred.bind(this);
this._onBackButtonFocusedHandler = this._onBackButtonFocused.bind(this);
this._onBackButtonClickHandler = this._onBackButtonClick.bind(this);
backButton.addEventListener("blur", this._onBackButtonBlurredHandler);
backButton.addEventListener("focus", this._onBackButtonFocusedHandler);
backButton.addEventListener("click", this._onBackButtonClickHandler);
document.addEventListener("keydown", this._onBackButtonClickHandler, false);
if (this._eventManager) {
this._onKeyDownHandler = this._onKeyDown.bind(this);
this._eventManager.addEventListener(EventNS.Events.KEY_DOWN, this._onKeyDownHandler, false)
}
}
else {
backButton.disabled = "disabled";
WinJS.Utilities.addClass(backButton, "platformHide")
}
this._subtitleClickHandlerHandler = this._subtitleClickHandler.bind(this);
this._subtitleKeyUpHandlerHandler = this._subtitleKeyUpHandler.bind(this);
this._platformHeaderSubTitle.addEventListener("click", this._subtitleClickHandlerHandler, false);
this._platformHeaderSubTitle.addEventListener("keyup", this._subtitleKeyUpHandlerHandler, false);
this._direction = (window.getComputedStyle(document.body).direction === "rtl");
if (!this._updateHeaderTitleWidthBinding) {
this._updateHeaderTitleWidthBinding = this._updateHeaderTitleWidth.bind(this);
CommonJS.WindowEventManager.addEventListener(CommonJS.WindowEventManager.Events.PAGE_RESIZE, this._updateHeaderTitleWidthBinding)
}
}, _updateFilterBar: function _updateFilterBar() {
msWriteProfilerMark("Platform:FilterBar:updateLayout:s");
if (!this._filterBar) {
this._initFilterBar()
}
if (this._filterBarData.length > 0) {
var onDismiss=this._filterBarData[0].onclosed;
this._filterBar.onDismiss = onDismiss;
this._filterBar.onSelectionChanged = this._filterBarData[0].onselectionchanged
}
this._filterBar.filterGroupModels = this._translateFilterModels(this._filterBarData);
msWriteProfilerMark("Platform:FilterBar:updateLayout:e")
}, _translateFilterModels: function _translateFilterModels(oldFilters) {
var filterGroups=[];
for (var i=0, l=oldFilters.length; i < l; i++) {
filterGroups.push(this._translateFilterModel(oldFilters[i]))
}
return filterGroups
}, _translateFilterModel: function _translateFilterModel(oldFilter) {
var FilterType=CommonJS.Filters.FilterType;
var items=oldFilter.filterItems;
var type=FilterType.DropDownSingleSelect;
if (oldFilter.filterType === FilterType.Toggle || oldFilter.filterType === FilterType.Custom || oldFilter.filterType === FilterType.TextBox) {
type = oldFilter.filterType
}
else if (oldFilter.selectionMode === "Multiple") {
type = FilterType.DropDownMultipleSelect
}
else if (oldFilter.selectionMode === "Slider") {
type = FilterType.Slider
}
var fg={};
var f={};
fg.filterModels = [f];
fg.summaryData = {label: oldFilter.filterLabel};
fg.key = oldFilter.filterValue;
fg.isRemovable = typeof oldFilter.isRemovable !== "undefined" ? oldFilter.isRemovable : true;
fg.hidden = oldFilter.hidden;
fg.displayText = oldFilter.filterName;
f.type = type;
f.key = oldFilter.filterValue;
f.displayText = oldFilter.filterName;
f.filterData = {};
f.minValue = oldFilter.minValue;
f.maxValue = oldFilter.maxValue;
f.ordinalToValue = oldFilter.ordinalToValue;
f.getValueText = oldFilter.getValueText;
f.hintFunction = oldFilter.hintFunction;
f.useWideTile = oldFilter.useWideTile;
f.viewOptions = oldFilter.viewOptions || null;
f.customView = (type === FilterType.Custom && oldFilter.customView) || null;
f.inlineRender = (type === FilterType.Toggle || type === FilterType.TextBox);
f.immediateRefresh = (f.inlineRender || type === FilterType.DropDownSingleSelect || oldFilter.immediateRefresh);
for (var i=0, l=items.length; i < l; i++) {
var item=items[i];
f.filterData[i] = {
isSelected: item.checked, key: item.value, index: i, displayText: item.text
}
}
return fg
}, _subtitleClickHandler: function _subtitleClickHandler(event) {
if (typeof this.onSubTitleClick === "function") {
this.onSubTitleClick(event)
}
}, _subtitleKeyUpHandler: function _subtitleKeyUpHandler(event) {
if (event.keyCode === WinJS.Utilities.Key.enter || event.keyCode === WinJS.Utilities.Key.space) {
this._subtitleClickHandler(event)
}
}, _onBackButtonBlurred: function _onBackButtonBlurred(event) {
this._headerBackButton.isfocused = false
}, _onBackButtonFocused: function _onBackButtonFocused(event) {
this._headerBackButton.isfocused = true
}, _onBackButtonClick: function _onBackButtonClick(event) {
if (!event.channel) {
event.channel = WinJS.Navigation.location.channelId;
event.page = WinJS.Navigation.location.page
}
if (this._ifNavigateBack(event)) {
var T=Microsoft.Bing.AppEx.Telemetry;
var clickUserActionMethod=PlatformJS.Utilities.getLastClickUserActionMethod();
if (event.type === "keydown" && clickUserActionMethod === T.UserActionMethod.unknown) {
clickUserActionMethod = T.UserActionMethod.keyboard
}
var jsonAttributes={};
if (event.channel) {
jsonAttributes.channel = event.channel
}
if (event.page) {
jsonAttributes.page = event.page
}
T.FlightRecorder.logUserActionWithJsonAttributes(T.LogLevel.normal, "", "Back Button", T.UserActionOperation.click, clickUserActionMethod, 0, JSON.stringify(jsonAttributes));
WinJS.Navigation.back()
}
}, _onKeyDown: function _onKeyDown(event) {
if (event.detail) {
this._onBackButtonClick(event.detail)
}
}, _ifNavigateBack: function _ifNavigateBack(event) {
var targetTagName=event.target.tagName;
var isBackButtonClicked=event.type === "click" && this._headerBackButton.isfocused;
var isBackSpacePressed=event.keyCode === WinJS.Utilities.Key.backspace && event.channel === WinJS.Navigation.location.channelId && event.page === WinJS.Navigation.location.page;
var isOnTextBox=targetTagName === "INPUT" || targetTagName === "TEXTAREA";
var isFullscreenVideoPlaying=CommonJS.MediaApp && CommonJS.MediaApp.Controls && CommonJS.MediaApp.Controls.MediaPlayback.isFullscreenVideoPlaying();
return this._headerBackButton && (isBackButtonClicked || (isBackSpacePressed && !isOnTextBox && !isFullscreenVideoPlaying)) && (!PlatformJS.Navigation || PlatformJS.Navigation.canGoBack)
}, _resetHeader: function _resetHeader(div) {
div.style.clip = "auto";
div.style.opacity = 1;
div.isClipped = false;
if (!div.isVisible) {
WinJS.Utilities.removeClass(div, "platformVisibilityNone");
div.isVisible = true
}
}
}, {
localProtocol: "ms-appx:///", largeHeaderHeight: 32
})})
})();
(function appexPlatformControlsImageAttributionInit() {
"use strict";
var flyoutLabelIndexId=0;
var NS=WinJS.Namespace.define("CommonJS", {ImageAttribution: WinJS.Class.define(function imageAttribution_ctor(element, options) {
if (!element) {
throw"ImageAttribution must be associated with an element that is parented in the DOM before construction.";
}
this.element = element;
element.winControl = this;
var title=PlatformJS.Services.resourceLoader.getString("/platform/imageAttribution");
var button=new CommonJS.Button(null, {
icon: "platformInfoButton", title: title, onclick: function onclick() {
button.currentState = "on"
}, states: [{
id: "on", title: title, iconRemove: "platformInfoButtonOff", iconAdd: "platformInfoButtonOn"
}, {
id: "off", title: title, iconRemove: "platformInfoButtonOn", iconAdd: "platformInfoButtonOff"
}]
});
button.currentState = "off";
element.appendChild(button.element);
var flyout=options.flyout;
if (options.flyout) {
var label=flyout.label;
var placement=flyout.placement;
var alignment=flyout.alignment;
var labelElt=this._labelElt = document.createElement("div");
WinJS.Utilities.addClass(labelElt, "platformAttributionLabel");
var flyoutLabelId="attributionLabel" + flyoutLabelIndexId++;
labelElt.id = flyoutLabelId;
labelElt.setAttribute("role", "contentinfo");
this.label = label;
var flyoutElt=CommonJS.FlyoutManager.getFlyoutElement();
flyoutElt.appendChild(labelElt);
WinJS.Utilities.addClass(flyoutElt, "platformAttributionFlyout");
var flyoutControl=new WinJS.UI.Flyout(flyoutElt, {alignment: alignment});
flyoutElt.setAttribute("aria-labelledby", flyoutLabelId);
this._flyoutAfterHideListener = function imageAttribution_onAfterHide() {
button.currentState = "off"
};
flyoutControl.addEventListener("afterhide", this._flyoutAfterHideListener);
button.flyout = flyoutControl.element;
button.flyoutPlacement = placement;
this._flyoutControl = flyoutControl
}
}, {
_labelElt: null, _isDisposed: false, _flyoutControl: null, _flyoutAfterHideListener: null, label: {set: function set(value) {
if (!this._isDisposed) {
PlatformJS.Utilities.setInnerHtml(this._labelElt, value)
}
}}, dispose: function dispose() {
if (this._isDisposed) {
return
}
if (this._flyoutControl && this._flyoutAfterHideListener) {
this._flyoutControl.removeEventListener("afterhide", this._flyoutAfterHideListener);
this._flyoutAfterHideListener = null
}
this._flyoutControl = null;
this._isDisposed = true
}
})})
})();
(function appexPlatformControlsImageCardInit() {
"use strict";
var NS=WinJS.Namespace.define("CommonJS", {ImageCard: WinJS.Class.mix(WinJS.Class.define(function imageCard_ctor(element, options) {
element = element || document.createElement("div");
element.winControl = this;
this._element = element;
options = options || {};
this.noIdentifier = options.noIdentifier || 0;
if (options.classification) {
this._classification = options.classification
}
if (options.defaultImageErrorHandler) {
this._defaultImageErrorHandler = options.defaultImageErrorHandler
}
if (options.preBuilt) {
this._initPreBuilt(element)
}
else {
this._init()
}
CommonJS.Utils.markDisposable(element);
WinJS.UI.setOptions(this, options);
Object.defineProperties(this, WinJS.Utilities.createEventProperties("imageloaded"))
}, {
_domElement: null, _dataSource: null, _imageCardUrl: null, _imgElement: null, _classification: null, _defaultImageErrorHandler: null, _networkStatusChangeHandler: null, _disposed: false, noIdentifier: 0, _cacheId: null, _alternateText: null, _element: null, _imageElement: null, _placeholderElement: null, _iconElement: null, _imageSource: null, _uniqueId: null, alternateText: {set: function set(value) {
this._alternateText = value;
this._element.setAttribute("aria-label", value)
}}, dispose: function dispose() {
this._disposed = true;
if (this._networkStatusChangeHandler) {
PlatformJS.Events.removeEventListener(this._uniqueId, "networkstatuschanged", this._networkStatusChangeHandler);
this._networkStatusChangeHandler = null
}
}, imageSource: {set: function set(value) {
var that=this;
if (WinJS.Promise.is(value)) {
value.then(function imageSourceReady(imageSource) {
that.imageSource = imageSource
})
}
else {
this._imageSource = value;
if (!this._uniqueId) {
this._uniqueId = PlatformJS.Utilities.generateUniqueId()
}
this._loadFromImageSource()
}
}}, imageErrorHandler: {
set: function set(value) {
this._imageErrorHandler = value
}, get: function get() {
switch (this._defaultImageErrorHandler) {
case"hide":
return this._imageErrorHandlerHideImage;
default:
return this._imageErrorHandler
}
}
}, _imageErrorHandlerHideImage: function _imageErrorHandlerHideImage(e) {
this._toggle(false)
}, _reloadImage: function _reloadImage() {
this._loadFromImageSource()
}, _loadFromImageSource: function _loadFromImageSource() {
if (!this._imageSource) {
return
}
else if (typeof this._imageSource === "string") {
this._loadFromUrl(this._imageSource)
}
else if (this._imageSource.lowResolutionUrl && this._imageSource.highResolutionUrl) {
if (PlatformJS.isPlatformInitialized) {
this._loadDualResolution(this._imageSource)
}
else {
this._loadSingleResolution({
cacheId: this._imageSource.cacheId, imageTag: this._imageSource.imageTag, url: this._imageSource.highResolutionUrl
})
}
}
else {
this._loadSingleResolution(this._imageSource)
}
}, _toggleElement: function _toggleElement(element, show) {
if (element) {
if (show) {
WinJS.Utilities.removeClass(element, "platformHide")
}
else {
WinJS.Utilities.addClass(element, "platformHide")
}
}
}, _toggle: function _toggle(show) {
this._toggleElement(this._element, show)
}, _toggleIcon: function _toggleIcon(show) {
this._toggleElement(this._iconElement, show)
}, _togglePlaceholder: function _togglePlaceholder(show) {
if (show) {
WinJS.Utilities.addClass(this._element, "platformNavbarPlaceholderShown")
}
else {
WinJS.Utilities.removeClass(this._element, "platformNavbarPlaceholderShown")
}
this._toggleElement(this._placeholderElement, show)
}, _init: function _init() {
var element=this._element;
WinJS.Utilities.addClass(element, "platformImageCard");
element.setAttribute("role", "img");
if (!this.noIdentifier) {
CommonJS.setAutomationId(element)
}
var placeholderElement=this._placeholderElement = document.createElement("div");
WinJS.Utilities.addClass(placeholderElement, "platformImageCardPlaceholder");
element.appendChild(placeholderElement);
this._togglePlaceholder(false);
var iconElement=this._iconElement = document.createElement("div");
WinJS.Utilities.addClass(iconElement, "platformImageCardPlaceholderIcon platformCameraIcon");
placeholderElement.appendChild(iconElement);
var imageElement=this._imageElement = document.createElement("div");
WinJS.Utilities.addClass(imageElement, "platformImageCardImage");
element.appendChild(imageElement);
CommonJS.classifyPlaceholder(element, this._classification)
}, _initPreBuilt: function _initPreBuilt(element) {
if (!this.noIdentifier) {
CommonJS.setAutomationId(element)
}
this._placeholderElement = element.querySelector(".platformImageCardPlaceholder");
this._iconElement = element.querySelector(".platformImageCardPlaceholderIcon");
this._imageElement = element.querySelector(".platformImageCardImage");
this._togglePlaceholder(false)
}, _loadFromUrl: function _loadFromUrl(url) {
this._loadSingleResolution({
cacheId: null, url: url
})
}, _loadSingleResolution: function _loadSingleResolution(imageSource, bypassCache) {
var lowResolution=imageSource.url;
this._cacheId = imageSource.cacheId;
var that=this;
if (!lowResolution) {
return WinJS.Promise.wrap(null)
}
if (PlatformJS.isPlatformInitialized) {
var promise=WinJS.Promise.wrap(null);
if (!bypassCache && this._cacheId) {
promise = PlatformJS.Cache.CacheService.getInstance(this._cacheId).findEntry(lowResolution, {fileNameOnly: true}).then(function image_cache_completion(response) {
if (response) {
that._setImage(response.dataValue, lowResolution)
}
return response
})
}
return promise.then(function image_refresh(response) {
if (!response || response.isStale()) {
return that._loadImage(lowResolution, that._showPlaceholder.bind(that))
}
return WinJS.Promise.wrap(null)
}).then(function imageCard_loadImageComplete(localUrl) {
if (localUrl) {
that._setImage(localUrl, lowResolution);
if (imageSource.imageTag) {
PlatformJS.Utilities.saveImageForBoot(lowResolution, imageSource, localUrl)
}
if (that._highResolutionImageElement && that._highResolutionImageElement.parent === that._element) {
that._element.removeChild(that._highResolutionImageElement);
that._highResolutionImageElement = null
}
}
return WinJS.Promise.wrap(null)
}, function imageCard_loadImageError(err) {
that._handleImageError(imageSource);
return WinJS.Promise.wrap(null)
})
}
else {
if (imageSource.imageTag) {
var entry=PlatformJS.BootCache.instance.getEntry(imageSource.imageTag);
if (entry && (entry.url === imageSource.url)) {
that._setImage(entry.localUrl, imageSource.url);
return WinJS.Promise.wrap(null)
}
}
that._setImage(imageSource.url, imageSource.url);
return WinJS.Promise.wrap(null)
}
}, _loadDualResolution: function _loadDualResolution(imageSource) {
var lowResolution=imageSource.lowResolutionUrl;
var highResolution=imageSource.highResolutionUrl;
var that=this;
var cacheId=imageSource.cacheId;
var imageService=new Platform.ImageService(cacheId);
var promise=WinJS.Promise.wrap(null);
if (cacheId) {
promise = PlatformJS.Cache.CacheService.getInstance(cacheId).findEntry(highResolution, {fileNameOnly: true}).then(function image_cache_completion(response) {
if (response) {
that._setImage(response.dataValue, highResolution)
}
return response
})
}
promise.then(function image_refresh(response) {
if (!response || response.isStale()) {
var lowResolutionMetadata={
url: lowResolution, cacheId: cacheId
};
that._loadSingleResolution(lowResolutionMetadata, true).then(function imageCard_loadSingleResolutionComplete() {
if (highResolution) {
that._loadImage(highResolution, null).then(function imageCard_loadImageComplete(localUrl) {
if (imageSource.imageTag) {
PlatformJS.Utilities.saveImageForBoot(highResolution, imageSource, localUrl)
}
if (that._highResolutionImageElement && that._highResolutionImageElement.parent === that._element) {
that._element.removeChild(that._highResolutionImageElement)
}
var imageElement=that._highResolutionImageElement = document.createElement("div");
WinJS.Utilities.addClass(imageElement, "platformImageCardImage");
imageElement.style.backgroundImage = "url('" + localUrl + "')";
that._element.appendChild(imageElement);
var imgStyle=window.getComputedStyle(imageElement);
imageElement.style.opacity = imgStyle ? imgStyle.opacity : "1"
}, function imageCard_loadImageError(err) {
that._handleImageError(imageSource)
})
}
})
}
})
}, _loadImage: function _loadImage(imageUrl, networkCallRequired) {
if (typeof imageUrl !== "string") {
return WinJS.Promise.wrap("")
}
else {
return PlatformJS.Utilities.fetchImage(this._cacheId, imageUrl, networkCallRequired)
}
}, _showPlaceholder: function _showPlaceholder() {
this._toggleIcon(true);
this._togglePlaceholder(true)
}, _setImage: function _setImage(url, imageSource) {
if (!this._alternateText && imageSource) {
this._element.setAttribute("aria-label", imageSource)
}
var that=this;
var imageElement=this._imageElement;
imageElement.style.backgroundImage = "url('" + url + "')";
var imgStyle=window.getComputedStyle(imageElement);
imageElement.style.opacity = imgStyle ? imgStyle.opacity : "1";
that.dispatchEvent("imageloaded", {
localUrl: url, imageSource: imageSource
});
this._transitionOutPlaceholder().then(function imageCard_transitionOutPlaceholderComplete() {
that._removePlaceholderImage()
}).then(null, function imageCard_removePlaceholderImageError(err){})
}, _transitionOutPlaceholder: function _transitionOutPlaceholder() {
var imageElement=this._imageElement;
var placeholderElement=this._placeholderElement;
if (placeholderElement && !WinJS.Utilities.hasClass(placeholderElement, "platformHide")) {
return WinJS.UI.Animation.crossFade(imageElement, placeholderElement)
}
else {
return WinJS.Promise.wrap({})
}
}, _handleImageError: function _handleImageError(imageSource) {
if (this._disposed) {
return
}
;
this._toggleIcon(true);
this._togglePlaceholder(true);
if (!this._networkStatusChangeHandler) {
var that=this;
this._networkStatusChangeHandler = function imageCard_onNetworkStatusChanged() {
var networkAvailable=(PlatformJS.isPlatformInitialized ? Platform.Networking.NetworkManager.instance.isNetworkAvailable : PlatformJS.Utilities.hasInternetConnection());
if (networkAvailable) {
PlatformJS.Events.removeEventListener(that._uniqueId, "networkstatuschanged", that._networkStatusChangeHander);
that._networkStatusChangeHander = null;
that._reloadImage()
}
;
};
PlatformJS.Events.addEventListener(that._uniqueId, "networkstatuschanged", this._networkStatusChangeHandler)
}
if (this.imageErrorHandler) {
this.imageErrorHandler(this._element)
}
}, _removePlaceholderImage: function _removePlaceholderImage() {
if (this._placeholderElement) {
var parent=this._placeholderElement.parentElement;
if (parent) {
parent.removeChild(this._placeholderElement)
}
if (this._element) {
WinJS.Utilities.removeClass(this._element, "platformNavbarPlaceholderShown")
}
this._placeholderElement = null
}
}
}, {populateDomProxyElement: function populateDomProxyElement(element, classification) {
var DOMProxy=CommonJS.DOMProxy;
element.addClass("platformImageCard");
element.addClass("lazyImageCard");
element.setAttribute("role", "img");
var placeholderElement=new DOMProxy("div");
placeholderElement.addClass("platformImageCardPlaceholder");
element.appendChild(placeholderElement);
var iconElement=new DOMProxy("div");
iconElement.addClass("platformImageCardPlaceholderIcon platformCameraIcon");
placeholderElement.appendChild(iconElement);
var imageElement=this._imageElement = new DOMProxy("div");
imageElement.addClass("platformImageCardImage");
element.appendChild(imageElement);
CommonJS.classifyPlaceholder(element, classification)
}}), WinJS.Utilities.eventMixin)})
})();
(function appexPlatformControlsTwoStepBindingImageCardInit() {
"use strict";
var NS=WinJS.Namespace.define("CommonJS", {TwoStepBindingImageCard: WinJS.Class.derive(CommonJS.ImageCard, function twoStepBindingImageCard_ctor(element, options) {
CommonJS.ImageCard.call(this, element, options);
this._lowResolutionUrl = null;
this._highResolutionUrl = null
}, {
_lowResolutionUrl: null, _highResolutionUrl: null, lowResolutionUrl: {set: function set(value) {
this._lowResolutionUrl = value
}}, highResolutionUrl: {set: function set(value) {
var cacheId;
var url;
if (typeof value === "string") {
url = value
}
else {
url = value.url;
cacheId = value.cacheId
}
var highResolutionUrl=this._highResolutionUrl = url;
var lowResolutionUrl=this._lowResolutionUrl;
if (lowResolutionUrl) {
this.imageSource = {
lowResolutionUrl: lowResolutionUrl, highResolutionUrl: highResolutionUrl, cacheId: cacheId
}
}
else {
this.imageSource = {
url: highResolutionUrl, cacheId: cacheId
}
}
}}
})})
})();
(function appexPlatformControlsItemsContainerInit() {
"use strict";
function deleteContainerStyle(className) {
staleClassNames.push(className)
}
var NS=WinJS.Namespace.define("CommonJS.Immersive", {ItemsContainer: WinJS.Class.mix(WinJS.Class.define(function itemsContainer_ctor(element, options) {
var that=this;
element = this.element = element ? element : document.createElement("div");
element.winControl = this;
CommonJS.Utils.markDisposable(element);
var cluster=PlatformJS.Utilities.getAncestorByClassName(element, "platformCluster");
if (cluster) {
var clusterLabelledBy=cluster.getAttribute("aria-labelledby");
if (clusterLabelledBy !== "") {
element.setAttribute("role", "listbox");
element.setAttribute("aria-labelledby", clusterLabelledBy)
}
}
WinJS.Utilities.addClass(this.element, "platformItemsContainer");
CommonJS.setAutomationId(element);
var idStr=element.id;
element.id = idStr.replace(/\./g, "_");
PlatformJS.Utilities.registerItemClickProxy(element, function itemsContainer_registerItemClickProxyPredicate(domElement) {
return WinJS.Utilities.hasClass(domElement, "platformClusterItem")
}, function itemsContainer_registerItemClickProxyCompletion(domElement) {
that._onItemClicked(domElement)
});
Object.defineProperties(this, WinJS.Utilities.createEventProperties("itemclick"));
this._bindingPromises = [];
this._elements = {};
this._gridElements = [];
if (options && options.gridInfo) {
this.gridInfo = options.gridInfo
}
WinJS.UI.setOptions(this, options)
}, {
_disposed: false, _scheduler: null, _renderPromise: null, _bindingPromises: null, _pointerDown: false, _dataSource: null, _elements: null, _navigableViewOrchestrator: null, _accRole: "option", onitemclick: null, scheduler: {
get: function get() {
return this._scheduler
}, set: function set(value) {
this._scheduler = value
}
}, accessibilityRole: {set: function set(value) {
this._accRole = value
}}, _onItemClicked: function _onItemClicked(domElement) {
if (domElement) {
var that=this;
var index=Array.prototype.indexOf.call(this.element.children, domElement);
this._listBinding.fromIndex(index).then(function itemsContainer_onItemClickedFromIndexComplete(model) {
that.dispatchEvent("itemclick", {item: model.data})
})
}
}, className: {set: function set(value) {
if (this.container) {
WinJS.Utilities.addClass(this.container, value)
}
}}, gridInfo: {set: function set(value) {
if (value) {
this._gridMinColumnWidth = value.minColumnWidth;
this._gridFixedColumnWidth = value.fixedColumnWidth;
this._gridMinCellHeight = value.minCellHeight;
if (typeof value.gridGap === "number") {
this._gridGap = value.gridGap
}
else {
this._gridGap = CommonJS.Immersive.ItemsContainer.DEFAULTGAPSIZE
}
if (typeof value.maxCellHeight === "number") {
this._gridMaxCellHeight = value.maxCellHeight
}
else {
this._gridMaxCellHeight = 0
}
if ((this._gridFixedColumnWidth || this._gridMinColumnWidth) && this._gridMinCellHeight) {
if (this._gridGap !== CommonJS.Immersive.ItemsContainer.DEFAULTGAPSIZE) {
var rtl=window.getComputedStyle(document.body, null).direction === "rtl";
this._marginSelector = ".platformListLayout#" + this.element.id + " .platformClusterItem";
var proerty=(rtl ? "margin-left: " : "margin-right: ") + this._gridGap + "px; " + "margin-bottom: " + this._gridGap + "px;";
CommonJS.addStyle(this._marginSelector, proerty)
}
this._gridEnabled = true;
WinJS.Utilities.addClass(this.element, CommonJS.RESPONSIVE_RESIZABLE_CLASS)
}
}
else {
this._gridEnabled = false;
WinJS.Utilities.removeClass(this.element, CommonJS.RESPONSIVE_RESIZABLE_CLASS)
}
}}, itemDataSource: {set: function set(value) {
this._dataSource = value;
var that=this;
var renderComplete=function() {
if (that.container) {
that.container.innerHTML = ""
}
if (that._listBinding) {
that._listBinding.release();
that._listBinding = null
}
if (that._dataSource) {
that._listBinding = that._dataSource.createListBinding(that)
}
};
if (this._renderPromise) {
this._renderPromise.then(renderComplete)
}
else {
renderComplete()
}
}}, dispose: function dispose() {
if (this._disposed) {
return
}
this._disposed = true;
var currentRenderPromise=this._renderPromise;
if (currentRenderPromise) {
this._renderPromise = null;
currentRenderPromise.cancel()
}
this._bindingPromises = null;
if (this._marginSelector) {
CommonJS.deleteStyle(this._marginSelector);
this._marginSelector = null
}
if (this._listBinding) {
this._listBinding.release();
this._listBinding = null
}
if (this.element) {
this.element.innerHTML = "";
this.element.winControl = null;
this.element = null
}
if (this._navigableViewOrchestrator) {
this._navigableViewOrchestrator.dispose();
this._navigableViewOrchestrator = null
}
this.elements = null;
this._scheduler = null;
this._gridElements = null;
this._dataSource = null
}, render: function render() {
if (this._disposed) {
return
}
msWriteProfilerMark("Platform:ItemsContainer:render:s");
this.container.innerHTML = "";
this._bindingPromises = [];
var that=this;
var listBinding=this._listBinding;
var dataSource=this._dataSource;
if (!dataSource || !listBinding) {
return
}
return new WinJS.Promise(function itemsContainer_renderPromiseInit(c, e) {
that.completionHandler = c;
that.errorHandler = e;
that.renderImpl()
})
}, renderImpl: function renderImpl() {
var that=this;
var fragment=document.createDocumentFragment();
var listBinding=this._listBinding;
var dataSource=this._dataSource;
this._updateGrid();
this._renderPromise = dataSource.getCount().then(function _ItemsContainer_247(itemCount) {
return CommonJS.SchedulePromise(that._scheduler, CommonJS.TaskPriority.normal, "ItemsContainer:RenderImpl:NextItems", itemCount)
}).then(function itemsContainer_dataSourceGetCountComplete(itemCount) {
var promise=WinJS.Promise.wrap(null);
for (var i=0; i < itemCount; i++) {
(function itemsContainer_renderNextItem(i) {
promise = promise.then(function itemsContainer_nextRenderPromiseComplete() {
return that._renderItem(i, listBinding, fragment)
})
})(i)
}
return promise
}).then(function _ItemsContainer_261() {
return CommonJS.SchedulePromise(that._scheduler, CommonJS.TaskPriority.normal, "ItemsContainer:RenderImpl:NextItems:Complete")
}).then(function itemsContainer_renderNextItemComplete() {
return WinJS.Promise.join(that._bindingPromises)
}).then(function _ItemsContainer_267() {
return CommonJS.SchedulePromise(that._scheduler, CommonJS.TaskPriority.normal, "ItemsContainer:RenderImpl:compleBinding")
}).then(function itemsContainer_bindingPromisesJoinComplete() {
that.container.appendChild(fragment);
that._createNavigableView();
msWriteProfilerMark("Platform:ItemsContainer:render:e");
that.completionHandler()
}, function itemsContainer_bindingPromisesJoinError(err) {
if (err.message !== "Canceled") {
that.errorHandler(err)
}
})
}, getContainerHeight: function getContainerHeight() {
return this.element.clientHeight
}, _updateGrid: function _updateGrid() {
var result=false;
if (this._gridEnabled && this.element) {
var containerHeight=this.getContainerHeight();
if (containerHeight) {
var oldCellHeight=this._cellHeight;
this._maxCellsPerColumn = Math.floor(containerHeight / (this._gridMinCellHeight + this._gridGap));
if (this._gridMaxCellHeight) {
this._minCellsPerColumn = Math.floor(containerHeight / (this._gridMaxCellHeight + this._gridGap))
}
else {
this._minCellsPerColumn = 0
}
this._cellHeight = Math.floor(containerHeight / this._maxCellsPerColumn - this._gridGap);
var list=this._dataSource && this._dataSource._list;
if (list) {
var columns=0,
columnLength=0,
maxColumnLength=0,
cellsPerColumn=this._maxCellsPerColumn,
item,
cellCount,
nonTop;
while (cellsPerColumn > this._minCellsPerColumn) {
columns = 0;
columnLength = 0;
maxColumnLength = 0;
for (var i=0, length=list.length; i < length; i++) {
item = list.getAt(i);
cellCount = item.moduleInfo && item.moduleInfo.cellCount;
nonTop = item.moduleInfo && item.moduleInfo.nonTop;
if (!cellCount) {
return
}
if (columnLength + cellCount > cellsPerColumn) {
if (maxColumnLength < columnLength) {
maxColumnLength = columnLength
}
if (nonTop) {
cellsPerColumn--;
break
}
else {
columnLength = 0;
columns++
}
}
columnLength += cellCount
}
if (i === length) {
if (this._maxCellsPerColumn !== maxColumnLength && columns > 0) {
this._maxCellsPerColumn = maxColumnLength;
this._cellHeight = Math.floor(containerHeight / this._maxCellsPerColumn - this._gridGap)
}
break
}
}
}
if (this._cellHeight < this._gridMinCellHeight) {
this._cellHeight = this._gridMinCellHeight
}
if (this._cellHeight > this._gridMaxCellHeight) {
this._cellHeight = this._gridMaxCellHeight
}
this._columnWidth = this._gridFixedColumnWidth || Math.floor(this._gridMinColumnWidth * this._cellHeight / this._gridMinCellHeight);
if (oldCellHeight !== this._cellHeight) {
result = true
}
}
}
return result
}, _renderItem: function _renderItem(i, listBinding, fragment) {
var that=this;
return listBinding.fromIndex(i).retain().then(function itemsContainer_renderItemRetainComplete(listItem) {
that._createItem(fragment, listItem)
})
}, _createNavigableView: function _createNavigableView() {
if (!this._disposed) {
this._navigableViewOrchestrator = new CommonJS.NavigableView.NavigableViewOrchestrator(this.element, this._elements)
}
else {
debugger
}
}, _createItem: function _createItem(fragment, item, insertBefore) {
var container=null;
var that=this;
try {
if (item && item.data && item.data.moduleInfo) {
var height=0,
cellCount=item.data.moduleInfo.cellCount;
if (item.data.moduleInfo.renderer) {
container = item.data.moduleInfo.renderer(item);
WinJS.Utilities.addClass(container, "platformClusterItem");
if (cellCount && this._gridEnabled) {
height = cellCount * this._cellHeight + (cellCount - 1) * this._gridGap;
container.style.height = height + "px";
container.style.width = this._columnWidth + "px";
this._gridElements.push({
element: container, cellCount: cellCount
})
}
if (!insertBefore) {
fragment.appendChild(container)
}
else {
fragment.insertBefore(container, insertBefore)
}
if (this._bindingPromises) {
this._bindingPromises.push(WinJS.Promise.wrap(null))
}
}
else {
container = document.createElement("div");
WinJS.Utilities.addClass(container, "platformClusterItem");
if (!insertBefore) {
fragment.appendChild(container)
}
else {
fragment.insertBefore(container, insertBefore)
}
CommonJS.setAutomationId(container, this.container, item.handle);
if (item.data.moduleInfo.className) {
WinJS.Utilities.addClass(container, item.data.moduleInfo.className)
}
if (item.data.moduleInfo.cssStyle) {
container.setAttribute("style", item.data.moduleInfo.cssStyle)
}
if (cellCount && this._gridEnabled) {
height = cellCount * this._cellHeight + (cellCount - 1) * this._gridGap;
container.style.height = height + "px";
container.style.width = this._columnWidth + "px";
this._gridElements.push({
element: container, cellCount: cellCount
})
}
else {
if (item.data.moduleInfo.height) {
container.style.height = item.data.moduleInfo.height
}
if (item.data.moduleInfo.width) {
container.style.width = item.data.moduleInfo.width
}
}
var renderPromise=WinJS.Promise.wrap(null).then(function itemsContainer_renderPromiseTimeoutComplete() {
return CommonJS.loadModule(item.data.moduleInfo, item.data, container)
}).then(null, function renderItemError(ex) {
if (PlatformJS.isDebug) {
debugger;
throw ex;
}
});
if (this._bindingPromises) {
this._bindingPromises.push(renderPromise)
}
}
var isInteractive=item.data.moduleInfo.isInteractive;
if (!isInteractive) {
PlatformJS.Utilities.enablePointerUpDownAnimations(container)
}
this._elements[item.handle] = container;
if (item.data.moduleInfo.tabIndex) {
container.tabIndex = item.data.moduleInfo.tabIndex
}
else {
container.tabIndex = 0
}
container.setAttribute("role", this._accRole)
}
}
catch(ex) {
if (PlatformJS.isDebug) {
debugger;
throw ex;
}
}
return container
}, _initItemInfos: function _initItemInfos(container, item){}, container: {get: function get() {
return this.element
}}, getNavigableViewOrchestrator: function getNavigableViewOrchestrator() {
return this._navigableViewOrchestrator
}, beginNotifications: function beginNotifications(){}, endNotifications: function endNotifications(){}, changed: function changed(){}, itemAvailable: function itemAvailable(){}, moved: function moved(){}, countChanged: function countChanged(newCount, oldCount){}, indexChanged: function indexChanged(handle, newIndex, oldIndex){}, inserted: function inserted(listItem, previousHandle, nextHandle) {
var that=this;
this._updateElementSize();
listItem.retain().then(function itemsContainer_insertedListItemRetainComplete(item) {
that._createItem(that.container, item, nextHandle && that._elements[nextHandle] ? that._elements[nextHandle] : null)
})
}, removed: function removed(handle, mirage) {
this._updateElementSize();
var theElement=this._elements[handle];
if (theElement) {
this.container.removeChild(theElement);
delete this._elements[handle]
}
}, _updateElementSize: function _updateElementSize() {
if (this._updateGrid() && this._gridElements && this._gridElements.length) {
this._gridElements.forEach(function _ItemsContainer_540(item) {
if (item) {
var cellCount=item.cellCount,
container=item.element,
height=cellCount * this._cellHeight + (cellCount - 1) * this._gridGap;
if (container) {
container.style.height = height + "px";
container.style.width = this._columnWidth + "px"
}
}
}, this);
var eventObject=document.createEvent("CustomEvent");
eventObject.initCustomEvent("responsivechanged", true, true, null);
var element=this.element;
msSetImmediate(function dispatchResponsiveEvent() {
element.dispatchEvent(eventObject)
})
}
}, onWindowResize: function onWindowResize(event) {
CommonJS.WindowEventManager.HandleWindowResizeEvent.call(this, event, function HandleWindowResize() {
var detail=event.detail || event.platFormDetail;
if (detail.hasClientHeightChanged && this._gridEnabled) {
this._updateElementSize()
}
if (this._navigableViewOrchestrator) {
this._navigableViewOrchestrator.onWindowResize(event)
}
})
}
}, {
reActivate: function reActivate(item) {
var itemsContainer=item.parentNode;
var itemsContainerControl=itemsContainer && itemsContainer.winControl;
if (itemsContainerControl) {
var navigableViewOrchestrator=itemsContainerControl.getNavigableViewOrchestrator();
var navigableView=navigableViewOrchestrator && navigableViewOrchestrator.navigableView;
if (navigableView) {
navigableView.isActivated = false
}
}
}, DEFAULTGAPSIZE: 10
}), WinJS.UI.DOMEventMixin)})
})();
(function ResponsiveListViewInit() {
"use strict";
var _left="left";
WinJS.Namespace.define("CommonJS.UI", {
ResponsiveGridLayout: WinJS.Class.derive(WinJS.UI.GridLayout, function responsiveGridLayout_ctor(options) {
this._responsiveListView = options.responsiveListView;
if (this._responsiveListView) {
this._responsiveListView.resetItemSize()
}
WinJS.UI.GridLayout.call(this, options)
}, {
layout: function layout(tree, changedRange, modifiedItems, modifiedGroups) {
if (this._responsiveListView) {
var sizes=this._sizes || {};
if (!(sizes.maxItemsContainerContentSize && sizes.containerMargins)) {
console.warn("GridLayout has no _sizes object.");
var viewport=this._responsiveListView._viewport;
var surface=this._responsiveListView._canvas;
var viewportContentHeight,
surfaceOuterHeight,
groupheader,
itemsContainer,
groupheaderHeight,
itemsContainerOuterHeight,
container;
var maxItemsContainerContentSize=0;
var containerMargins={
top: 0, bottom: 0, left: 0, right: 0
};
if (viewport && surface) {
groupheader = surface.getElementsByClassName("win-groupheadercontainer");
if (groupheader.length) {
groupheader = groupheader[0];
groupheaderHeight = CommonJS.getTotalHeight(groupheader)
}
else {
groupheaderHeight = 0
}
itemsContainer = surface.getElementsByClassName("win-itemscontainer");
if (itemsContainer.length) {
itemsContainer = itemsContainer[0];
itemsContainerOuterHeight = CommonJS.getOuterHeight(itemsContainer);
container = itemsContainer.getElementsByClassName(WinJS.UI._containerClass);
if (container.length) {
container = container[0];
containerMargins = CommonJS.getMargins("win-container")
}
}
else {
itemsContainerOuterHeight = 0
}
viewportContentHeight = CommonJS.getContentHeight(viewport);
surfaceOuterHeight = CommonJS.getOuterHeight(surface);
maxItemsContainerContentSize = viewportContentHeight - surfaceOuterHeight - groupheaderHeight - itemsContainerOuterHeight
}
sizes.maxItemsContainerContentSize = maxItemsContainerContentSize;
sizes.containerMargins = containerMargins
}
this._responsiveListView.refreshItemSize(sizes)
}
return WinJS.UI.GridLayout.prototype.layout.call(this, tree, changedRange, modifiedItems, modifiedGroups)
}, _responsiveListView: null
}), ResponsiveListView: WinJS.Class.derive(WinJS.UI.ListView, function responsiveListView_ctor(element, options) {
this._eventManager = CommonJS.Utils.getEventListenerManager(this, "ResponsiveListView listeners");
options = options || {};
this._list = null;
this._objectList = {};
this._deleteButtonList = {};
this._pinnedItemCount = 0;
this._handleOutOfOrderItems = CommonJS.UI.ResponsiveListView.HANDLEOUTOFORDERITEMS.REMOVE;
this._enabledFeatures = CommonJS.UI.ResponsiveListView.FEATURES.NONE;
this._disableEditModeOnBlurred = true;
this._itemTemplateRenderPromises = [];
if (options.handleOutOfOrderItems) {
this.handleOutOfOrderItems = options.handleOutOfOrderItems
}
if (options.enabledFeatures !== undefined) {
this.enabledFeatures = options.enabledFeatures
}
element = element || document.createElement("div");
CommonJS.setAutomationId(element);
var idStr=element.id.replace(/\./g, "_");
element.id = idStr;
this._selectorStr = ".ResponsiveListViewRoot#" + idStr + " .win-container";
if (options.minCellHeight) {
this.minCellHeight = options.minCellHeight
}
if (options.maxCellHeight) {
this.maxCellHeight = options.maxCellHeight
}
if (options.minCellWidth) {
this.minCellWidth = options.minCellWidth
}
if (options.fixedCellWidth) {
this.fixedCellWidth = options.fixedCellWidth
}
if (this._minCellHeight && (this._fixedCellWidth || this._minCellWidth)) {
if (options.layout) {
options.layout.type = CommonJS.UI.ResponsiveGridLayout;
options.layout.responsiveListView = this
}
else {
options.layout = {
type: CommonJS.UI.ResponsiveGridLayout, responsiveListView: this
}
}
}
if (options.itemDataSource) {
this._itemDataSource = options.itemDataSource;
options.itemDataSource = null
}
WinJS.UI.ListView.call(this, element, options);
options.itemDataSource = this._itemDataSource;
WinJS.Utilities.addClass(this._element, "CommonJSListView2");
this._element.winControl = this;
CommonJS.Utils.markDisposable(this._element);
this._initResponsiveListView(options)
}, {
disableAnimation: true, scheduler: {
get: function get() {
return this._scheduler
}, set: function set(value) {
this._scheduler = value
}
}, resetItemSize: function resetItemSize() {
var tmpWidth=(this._fixedCellWidth || this._minCellWidth);
if (this._minCellHeight && tmpWidth) {
this._responsiveEnabled = true;
WinJS.Utilities.addClass(this._element, "ResponsiveListViewRoot");
CommonJS.addStyle(this._selectorStr, this._sizeTemplate.format(tmpWidth, this._minCellHeight));
this._cellWidth = tmpWidth;
this._cellHeight = this._minCellHeight
}
}, refreshItemSize: function refreshItemSize(sizes) {
var result=false;
this._selfScrollable = null;
if (this._responsiveEnabled) {
var maxItemsContainerContentSize=sizes && sizes.maxItemsContainerContentSize;
var containerMargins=sizes && sizes.containerMargins;
if (maxItemsContainerContentSize && maxItemsContainerContentSize !== this._previousMaxItemsContainerContentSize && containerMargins) {
this._previousMaxItemsContainerContentSize = maxItemsContainerContentSize;
var verticalMargin=containerMargins.top + containerMargins.bottom,
horizontalMargin=containerMargins.left + containerMargins.right;
var countPerColumn=Math.floor(maxItemsContainerContentSize / (this._minCellHeight + verticalMargin));
var cellHeight=Math.floor(maxItemsContainerContentSize / countPerColumn - verticalMargin);
if (this._maxCellHeight && cellHeight > this._maxCellHeight) {
cellHeight = this._maxCellHeight
}
var cellWidth=this._fixedCellWidth || Math.floor(this._minCellWidth * cellHeight / this._minCellHeight);
if (cellWidth !== this._cellWidth || cellHeight !== this._cellHeight) {
CommonJS.addStyle(this._selectorStr, this._sizeTemplate.format(cellWidth, cellHeight));
this._cellHeight = cellHeight;
this._cellWidth = cellWidth;
if (this.layout._resetMeasurements) {
this.layout._resetMeasurements()
}
else {
console.warn("GridLayout has no _resetMeasurements function.");
var that=this;
msSetImmediate(function recalculateItemPosition() {
that.recalculateItemPosition()
})
}
var eventObject=document.createEvent("CustomEvent");
eventObject.initCustomEvent("responsivechanged", true, true, null);
var element=this._element;
msSetImmediate(function dispatchResponsiveEvent() {
element.dispatchEvent(eventObject)
});
result = true
}
}
}
return result
}, minCellHeight: {set: function set(value) {
this._minCellHeight = value
}}, maxCellHeight: {set: function set(value) {
this._maxCellHeight = value
}}, minCellWidth: {set: function set(value) {
this._minCellWidth = value
}}, fixedCellWidth: {set: function set(value) {
this._fixedCellWidth = value
}}, controlKey: {set: function set(value) {
this._controlKey = value
}}, friendlyName: {set: function set(value) {
this._friendlyName = value
}}, logContext: {set: function set(value) {
this._logContext = value
}}, enabledFeatures: {set: function set(value) {
this._enabledFeatures = value;
if (this._element) {
if (this._reorderEnabled()) {
this.itemsReorderable = true;
this.itemsDraggable = true
}
if (this._removeEnabled()) {
this._addEditButton()
}
}
}}, handleOutOfOrderItems: {set: function set(value) {
this._handleOutOfOrderItems = value
}}, addTileItemTemplate: {set: function set(value) {
this._addTileItemTemplate = value
}}, editButtonTemplate: {set: function set(value) {
this._editButtonTemplate = value
}}, saveOrder: function saveOrder() {
var result=false;
if (this._persistenceEnabled()) {
if (this._controlKey) {
var sort=JSON.stringify(this.getOrder());
if (sort) {
var localSettingKey=CommonJS.UI.ResponsiveListView.LOCALSETTINGSKEY + this._controlKey;
var localSettings=Windows.Storage.ApplicationData.current.localSettings;
localSettings.values[localSettingKey] = sort;
result = true
}
}
}
return result
}, getOrder: function getOrder() {
if (this._list) {
return this._list.filter(function _ResponsiveListView_277(data) {
return !!(data.itemKey)
}).map(function _ResponsiveListView_279(data) {
return data.itemKey
})
}
else {
return null
}
}, isEditMode: function isEditMode() {
return !this._nonEditMode
}, switchEditMode: function switchEditMode() {
if (!this._disposed2) {
if (this._removeEnabled()) {
this._nonEditMode = !this._nonEditMode;
if (this._nonEditMode) {
if (this._disableEditModeOnBlurred && this._element) {
this._eventManager.remove(this._editButtonFocusOutEventId)
}
WinJS.Utilities.removeClass(this._editButtonContainer, "inMode");
WinJS.Utilities.removeClass(this._canvas, "listView2EditMode");
WinJS.Utilities.addClass(this._canvas, "listView2NonEditMode");
this._enableStaticMode(false)
}
else {
this.selection.clear();
WinJS.Utilities.addClass(this._editButtonContainer, "inMode");
WinJS.Utilities.addClass(this._canvas, "listView2EditMode");
WinJS.Utilities.removeClass(this._canvas, "listView2NonEditMode");
this._enableStaticMode(true);
if (this._disableEditModeOnBlurred) {
this._editButtonFocusOutEventId = this._eventManager.add(this._element, "focusout", this._editButtonBlurred.bind(this), "RLV focusout")
}
}
}
}
}, enableEditMode: function enableEditMode() {
if (this._nonEditMode) {
this.switchEditMode()
}
}, disableEditMode: function disableEditMode() {
if (!this._nonEditMode) {
this.switchEditMode()
}
}, disableEditModeOnBlurred: {set: function set(value) {
this._disableEditModeOnBlurred = value
}}, itemDataSource: {
get: function get() {
if (!this._disposed2) {
if (!this._descriptor.itemDataSource) {
this._descriptor.itemDataSource = Object.getOwnPropertyDescriptor(WinJS.UI.ListView.prototype, "itemDataSource")
}
var descriptor=this._descriptor.itemDataSource;
return descriptor.get.call(this)
}
else {
return null
}
}, set: function set(value) {
if (!this._disposed2) {
if (this._scheduler) {
this._scheduler.schedule(this._setItemDataSource.bind(this, value), CommonJS.TaskPriority.normal, "ResponsiveListViewSetItemDataSource")
}
else {
this._setItemDataSource(value)
}
}
}
}, ensureVisible: function ensureVisible(value) {
if (this._isSelfScrollable()) {
return WinJS.UI.ListView.prototype.ensureVisible.call(this, value)
}
else {
var type=WinJS.UI.ObjectType.item,
itemIndex=value;
if (+value !== value) {
type = value.type;
itemIndex = value.index
}
if (itemIndex >= 0 && type === WinJS.UI.ObjectType.item) {
var element=this.elementFromIndex(itemIndex);
if (element) {
var parentNode=this._viewport.parentNode;
while (parentNode) {
if (parentNode && parentNode.winControl && parentNode.winControl.ensureElementVisible) {
parentNode.winControl.ensureElementVisible(element);
return
}
parentNode = parentNode.parentNode
}
element.scrollIntoView(false)
}
}
else {
debugger;
return WinJS.UI.ListView.prototype.ensureVisible.call(this, value)
}
}
}, render: function render() {
var that=this;
CommonJS.ScheduleTask(this.scheduler, function responsiveListView_renderTask() {
that.itemDataSource = that._itemDataSource
}, CommonJS.TaskPriority.normal, "ResponsiveListView_render_SetItemDataSource");
this._renderPromise = this._waitForControlRenderComplete();
return this._renderPromise
}, _waitForControlRenderComplete: function _waitForControlRenderComplete() {
var that=this;
return new WinJS.Promise(function responsiveListView_waitForControlRenderComplete_promise(complete) {
that._timeoutPromise = WinJS.Promise.timeout().then(function _ResponsiveListView_402() {
if (that._disposed2 || that.loadingState === "complete") {
complete();
return
}
var handler=function responsiveListView_waitForControlRenderComplete_loadingStateChangedHandler() {
if (that._disposed2) {
complete()
}
else if (that.loadingState === "complete") {
that.removeEventListener("loadingstatechanged", handler);
complete()
}
};
that.addEventListener("loadingstatechanged", handler)
})
})
}, _setItemDataSource: function _setItemDataSource(value) {
if (!this._descriptor.itemDataSource) {
this._descriptor.itemDataSource = Object.getOwnPropertyDescriptor(WinJS.UI.ListView.prototype, "itemDataSource")
}
var descriptor=this._descriptor.itemDataSource;
if (this._list && this._list.length) {
this._clearListBinding()
}
var list=value && value._list;
var that=this;
var item=null;
if (list) {
if (this._addEnabled()) {
var length=list.length;
if (length) {
var lastItem=list.getAt(length - 1);
if (!lastItem.isCommonJSAddTile) {
list.push(CommonJS.UI.ResponsiveListView.ADDTILEITEMOBJECT)
}
else {
lastItem.reusedCommonJSAddTile = true
}
}
else {
list.push(CommonJS.UI.ResponsiveListView.ADDTILEITEMOBJECT)
}
}
if (this._persistenceEnabled()) {
var order=this._readOrder();
if (order) {
var orderMap={};
order.forEach(function _ResponsiveListView_452(key, index) {
orderMap[key] = index + 1
});
var defaultOrder=0;
if (that._handleOutOfOrderItems === CommonJS.UI.ResponsiveListView.HANDLEOUTOFORDERITEMS.MOVETOBOTTOM) {
defaultOrder = order.length + 1
}
list.sort(function _ResponsiveListView_459(a, b) {
var aOrder=orderMap[a.itemKey] || defaultOrder;
var bOrder=orderMap[b.itemKey] || defaultOrder;
if (a.isCommonJSAddTile === true) {
aOrder = order.length + 2
}
if (b.isCommonJSAddTile === true) {
bOrder = order.length + 2
}
return aOrder - bOrder
});
if (that._handleOutOfOrderItems === CommonJS.UI.ResponsiveListView.HANDLEOUTOFORDERITEMS.REMOVE) {
for (var i=0; i < list.length; i++) {
item = list.getAt(i);
if (orderMap[item.itemKey] || item.isCommonJSAddTile === true) {
break
}
}
if (i > 0) {
list.splice(0, i)
}
}
}
}
for (var index=0, iLen=list.length; index < iLen; index++) {
item = list.getAt(index);
if (item.pinned) {
if (index !== this._pinnedItemCount) {
item.pinned = false
}
else {
this._pinnedItemCount++
}
}
}
if (this._addEnabled()) {
list.onitemmoved = that._listUpdatedHandler;
list.onitemmutated = that._listUpdatedHandler
}
list.onitemremoved = function ResponsiveListView_bindingListItemRemoved(e) {
if (!that._disposed2) {
if (e.detail && e.detail.value && e.detail.value.pinned) {
if (e.detail.index < that._pinnedItemCount) {
that._pinnedItemCount--
}
}
if (that._addEnabled()) {
that._listUpdatedHandler()
}
if (that._removeEnabled()) {
that._updateEditButton()
}
msSetImmediate(function FocusOnEditButtion() {
if (!that._nonEditMode && !document.activeElement && that._editButtonContainer) {
that._editButtonContainer.focus()
}
})
}
};
list.oniteminserted = function ResponsiveListView_bindingListItemInserted(e) {
if (!that._disposed2) {
if (e.detail && e.detail.value && e.detail.value.pinned) {
if (e.detail.index > that._pinnedItemCount) {
var itemData=list.getAt(e.detail.index);
itemData.pinned = false
}
else {
that._pinnedItemCount++
}
}
else if (that._addEnabled()) {
that._listUpdatedHandler()
}
if (that._removeEnabled()) {
that._updateEditButton()
}
}
that._setSaveOrderTimer(true)
};
this._list = list;
if (this._removeEnabled()) {
this._updateEditButton()
}
return descriptor.set.call(this, list.dataSource)
}
else {
return descriptor.set.call(this, value)
}
}, itemTemplate: {
get: function get() {
if (!this._disposed2) {
if (!this._descriptor.itemTemplate) {
this._descriptor.itemTemplate = Object.getOwnPropertyDescriptor(WinJS.UI.ListView.prototype, "itemTemplate")
}
var descriptor=this._descriptor.itemTemplate;
return descriptor.get.call(this)
}
else {
return null
}
}, set: function set(itemTemplate) {
if (!this._disposed2) {
var that=this;
var newItemTemplate=function ResponsiveListView_ItemTemplateRenderer(itemPromise) {
var itemRenderPromise=itemPromise.then(function _ResponsiveListView_567(item) {
return CommonJS.SchedulePromise(that._scheduler, CommonJS.TaskPriority.normal, "ResponsiveListView:itemTemplateRenderer", item)
}).then(function ResponsiveListView_ItemTemplateRenderer1stWrapper(item) {
if (that._disposed2) {
return null
}
var itemData=item.data;
if (that._addEnabled() && itemData.isCommonJSAddTile) {
var renderPromise=null;
if (that._addTileItemTemplate) {
renderPromise = that._getItemTemplatePromiseResult(that._addTileItemTemplate(itemPromise)).then(function _ResponsiveListView_579(element) {
if (that._disposed2) {
return null
}
if (element) {
that._eventManager.add(element, "keydown", that._addTileKeydownBinding, "RLV addTile keydown");
that._eventManager.add(element, "click", that._addTileClickedBinding, "RLV addTile click");
that._addTileElement = element
}
return element
})
}
else {
var addTile=CommonJS.createElement("div", that.element, "ListView2AddTile");
WinJS.Utilities.addClass(addTile, "addTileContainer");
addTile.setAttribute("aria-label", PlatformJS.Services.resourceLoader.getString("/Platform/Add"));
WinJS.Utilities.addClass(addTile, "win-nondraggable");
var addTileIcon=CommonJS.createElement("span", addTile, "AddIcon");
WinJS.Utilities.addClass(addTileIcon, "addTileIcon");
addTile.appendChild(addTileIcon);
that._addTileID = addTile.id;
that._eventManager.add(addTile, "keydown", that._addTileKeydownBinding, "RLV addTile keydown");
that._eventManager.add(addTile, "click", that._addTileClickedBinding, "RLV addTile click");
that._addTileElement = addTile;
renderPromise = WinJS.Promise.wrap(addTile)
}
return renderPromise
}
else {
var promise=that._getItemTemplatePromiseResult(itemTemplate(itemPromise));
return promise.then(function ResponsiveListView_ItemTemplateRenderer2ndWrapper(result) {
var callerRenderedTemplate=function(itemDiv) {
if (!itemDiv || that._disposed2) {
return null
}
if (!itemData || !itemData.itemKey) {
return itemDiv
}
if (!itemDiv.id) {
CommonJS.setAutomationId(itemDiv, that.element, "ResponsiveListView" + itemData.itemKey)
}
WinJS.Utilities.addClass(itemDiv, "listView2ItemDiv");
if (itemData.pinned) {
WinJS.Utilities.addClass(itemDiv, "listView2PinnedItem");
WinJS.Utilities.addClass(itemDiv, "win-nondraggable")
}
else if (that._removeEnabled()) {
var deleteButton=null;
if (!itemData.unremovable) {
deleteButton = CommonJS.createElement("button", itemDiv, "DeleteButton");
WinJS.Utilities.addClass(deleteButton, "listView2ItemDeleteButton");
deleteButton.setAttribute("aria-label", PlatformJS.Services.resourceLoader.getString("/Platform/Delete"));
deleteButton.title = PlatformJS.Services.resourceLoader.getString("/Platform/Delete");
var deleteButtonKeydownHandler=that._handleKeydown(that._removeItemByElement, [itemDiv]);
that._eventManager.add(deleteButton, "keydown", deleteButtonKeydownHandler, "RLV deletebutton keydown");
that._eventManager.add(deleteButton, "MSPointerUp", that._gestureTap.bind(that), "RLV pointerup");
itemDiv.appendChild(deleteButton);
that._deleteButtonList[deleteButton.id] = {
key: itemData.itemKey, button: deleteButton
}
}
that._objectList[itemDiv.id] = {
id: itemDiv.id, key: itemData.itemKey, element: itemDiv, deleteButton: deleteButton, data: itemData
}
}
return itemDiv
};
if (WinJS.Promise.is(result)) {
return result.then(callerRenderedTemplate)
}
else {
return callerRenderedTemplate(result)
}
})
}
});
that._itemTemplateRenderPromises.push(itemRenderPromise);
return itemRenderPromise
};
if (!this._descriptor.itemTemplate) {
this._descriptor.itemTemplate = Object.getOwnPropertyDescriptor(WinJS.UI.ListView.prototype, "itemTemplate")
}
var descriptor=this._descriptor.itemTemplate;
descriptor.set.call(this, newItemTemplate)
}
}
}, _clearListBinding: function _clearListBinding() {
var list=this._list;
if (list) {
list.onitemmoved = null;
list.onitemmutated = null;
list.onitemremoved = null;
list.oniteminserted = null;
var length=list.length;
if (length) {
var lastItem=list.getAt(length - 1);
if (lastItem.isCommonJSAddTile) {
if (lastItem.reusedCommonJSAddTile) {
lastItem.reusedCommonJSAddTile = false
}
else {
list.pop()
}
}
}
}
var eventManager=this._eventManager;
var addTileElement=this._addTileElement;
if (addTileElement) {
this._addTileElement = null;
if (eventManager) {
eventManager.removeListenerForHost(addTileElement)
}
}
this._addTileKeydownBinding = null;
this._addTileClickedBinding = null;
this._listUpdatedHandler = null;
if (this._removeEnabled()) {
var deleteButtonList=this._deleteButtonList;
for (var key in deleteButtonList) {
var deleteObject=deleteButtonList[key];
if (deleteObject) {
deleteButtonList[key] = null;
if (eventManager && deleteObject.button) {
eventManager.removeListenerForHost(deleteObject.button)
}
}
}
}
this._pinnedItemCount = 0;
this._objectList = {}
}, dispose: function dispose() {
if (!this._disposed2) {
try {
if (this._renderPromise) {
this._renderPromise.cancel()
}
if (this._timeoutPromise) {
this._timeoutPromise.cancel()
}
for (var i=0, iLen=this._itemTemplateRenderPromises.length; i < iLen; i++) {
this._itemTemplateRenderPromises[i].cancel()
}
this._itemTemplateRenderPromises = null;
this._clearListBinding();
if (this._responsiveEnabled) {
CommonJS.deleteStyle(this._selectorStr)
}
this._deleteButtonList = null;
this._addTileElement = null;
this._scheduler = null;
var editButtonContainer=this._editButtonContainer;
if (editButtonContainer) {
this._editButtonContainer = null;
this._element.removeChild(editButtonContainer)
}
if (this._persistenceEnabled()) {
this.saveOrder()
}
WinJS.UI.ListView.prototype.dispose.call(this)
}
catch(e) {}
if (this._eventManager) {
this._eventManager.dispose();
this._eventManager = null
}
this._disposed2 = true
}
}, _initResponsiveListView: function _initResponsiveListView(options) {
this._rtl2 = CommonJS.isRtl();
_left = !this._rtl2 ? "left" : "right";
if (!this._viewport) {
var viewport=document.getElementsByClassName("win-viewport");
if (viewport.length) {
this._viewport = viewport[0]
}
else {
console.warn("Can't find viewport element in ListView!");
debugger
}
}
if (!this._canvas) {
var canvas=document.getElementsByClassName("win-surface");
if (canvas.length) {
this._canvas = canvas[0]
}
else {
console.warn("Can't find surface element in ListView!");
debugger
}
}
WinJS.Utilities.addClass(this._canvas, "listView2NonEditMode");
this._nonEditMode = true;
if (this._removeEnabled()) {
this._addEditButton()
}
this._addTileClickedBinding = this._addTileClicked.bind(this);
this._addTileKeydownBinding = this._handleKeydown(this._addTileClicked);
this._savedTapBehavior = this.tapBehavior;
this._savedSelectionMode = this.selectionMode;
this._staticModeLevel = 0;
this._listUpdatedHandler = this._keepAddTileAtEnd.bind(this);
var element=this._element;
var eventManager=this._eventManager;
if (this._addEnabled()) {
eventManager.add(element, "selectionchanging", this._selectionChangingHandler.bind(this), "RLV selectionchanging")
}
if (this._reorderEnabled()) {
eventManager.add(element, "itemdragend", this._itemsMovedHandler.bind(this), "RLV itemdragend")
}
eventManager.add(element, "selectionchanged", this._selectionChangedHandler.bind(this), "RLV selectionchanged");
eventManager.add(element, "keyboardnavigating", this._onkeyboardnavigating.bind(this), "RLV keyboardnavigating");
eventManager.add(element, "keydown", this._handleArrowKeyNavigation.bind(this), "RLV keydown");
if (this._reorderEnabled()) {
eventManager.add(element, "itemdragbetween", this._preventDragAtInvaidatePosition.bind(this), "RLV keydown");
this._itemdragstartEventHandlerId = eventManager.add(element, "itemdragstart", this._registerScrollOnDrag.bind(this), "RLV itemdragstart")
}
}, _isSelfScrollable: function _isSelfScrollable() {
if (this._selfScrollable === null) {
this._selfScrollable = (this.layout.orientation === "horizontal" && this._viewport.currentStyle.width !== "auto") || (this.layout.orientation === "vertical" && this._viewport.currentStyle.height !== "auto")
}
return this._selfScrollable
}, _addEnabled: function _addEnabled() {
return !!(this._enabledFeatures & CommonJS.UI.ResponsiveListView.FEATURES.ADD)
}, _removeEnabled: function _removeEnabled() {
return !!(this._enabledFeatures & CommonJS.UI.ResponsiveListView.FEATURES.REMOVE)
}, _reorderEnabled: function _reorderEnabled() {
return !!(this._enabledFeatures & CommonJS.UI.ResponsiveListView.FEATURES.REORDER)
}, _persistenceEnabled: function _persistenceEnabled() {
return !!(this._enabledFeatures & CommonJS.UI.ResponsiveListView.FEATURES.PERSISTENCE)
}, _readOrder: function _readOrder() {
var result=null;
if (this._persistenceEnabled()) {
var localSettingKey=CommonJS.UI.ResponsiveListView.LOCALSETTINGSKEY + this._controlKey;
var localSettings=Windows.Storage.ApplicationData.current.localSettings;
var sortString=localSettings.values[localSettingKey];
if (sortString) {
result = JSON.parse(sortString)
}
}
return result
}, _addEditButton: function _addEditButton() {
var element=this._element;
if (element && this._viewport && !this._editButtonContainer) {
this._editButtonContainer = CommonJS.createElement("button", this._viewport, "EditButtonContainer");
this._editButtonContainer.setAttribute("aria-label", PlatformJS.Services.resourceLoader.getString("/Platform/Delete"));
WinJS.Utilities.addClass(this._editButtonContainer, "listView2EditButtonContainer");
if (this._editButtonTemplate) {
CommonJS.loadModule(this._editButtonTemplate.moduleInfo, this._editButtonTemplate.moduleData, this._editButtonContainer).done()
}
else {
var editButton=CommonJS.createElement("div", this._editButtonContainer);
WinJS.Utilities.addClass(editButton, "listView2EditButton");
this._editButtonContainer.appendChild(editButton)
}
var parent=CommonJS.getAncestorByClassName(element, "platformCluster") || element;
var topOffset=CommonJS.getRelativeTop(this._viewport, parent);
this._editButtonContainer.style.top = (topOffset - 27) + "px";
element.insertBefore(this._editButtonContainer, this._viewport);
var that=this;
this._editButtonContainer.onclick = function(event) {
var logContext=that._logContext || CommonJS.UI.ResponsiveListView.DEFAULTLOGCONTEXT;
var logElement=(that._friendlyName || that._controlKey || "ResponsiveListView") + " edit button";
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, logContext, logElement, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0);
that.switchEditMode()
};
this._eventManager.add(this._editButtonContainer, "keydown", this._handleKeydown(this.switchEditMode), "RLV editbutton keydown");
this._updateEditButton()
}
}, _itemsMovedHandler: function _itemsMovedHandler() {
var eventObject=document.createEvent("CustomEvent");
eventObject.initCustomEvent("listreordered", true, true, null);
var element=this._element;
element.dispatchEvent(eventObject);
var logContext=this._logContext || CommonJS.UI.ResponsiveListView.DEFAULTLOGCONTEXT;
var logElement=(this._friendlyName || this._controlKey || "ResponsiveListView") + " tile";
var logActionMethod=PlatformJS.Utilities.getLastClickUserActionMethod();
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, logContext, logElement, "Drag And Drop", logActionMethod, 0);
this._setSaveOrderTimer(true)
}, _updateEditButton: function _updateEditButton() {
if (this._editButtonContainer && this._list) {
if (this._list.length === 0 || (this._list.length === 1 && this._addEnabled())) {
WinJS.Utilities.addClass(this._editButtonContainer, "platformHide")
}
else {
WinJS.Utilities.removeClass(this._editButtonContainer, "platformHide")
}
}
}, _enableStaticMode: function _enableStaticMode(real) {
var oldLevel=this._staticModeLevel;
if (real) {
this._staticModeLevel++
}
else {
this._staticModeLevel--
}
if (this._staticModeLevel < 0) {
console.warn("ResponsiveListView: staticModeLevel < 0");
this._staticModeLevel = 0
}
if (this._staticModeLevel === 0) {
this.tapBehavior = this._savedTapBehavior;
this.selectionMode = this._savedSelectionMode
}
else {
if (oldLevel === 0 && this._staticModeLevel === 1) {
this._savedTapBehavior = this.tapBehavior;
this._savedSelectionMode = this.selectionMode;
this.tapBehavior = WinJS.UI.TapBehavior.none;
this.selectionMode = WinJS.UI.SelectionMode.none
}
}
}, _removeFromEditList: function _removeFromEditList(index) {
var element=this.elementFromIndex(index);
if (element && element.id) {
var deleteButton=element.getElementsByClassName("listView2ItemDeleteButton");
var deleteButtonId=null;
if (deleteButton && deleteButton.length) {
deleteButtonId = deleteButton[0].id;
element.removeChild(deleteButton[0])
}
this._objectList[element.id] = null;
if (deleteButtonId) {
var deleteObject=this._deleteButtonList[deleteButtonId];
if (deleteObject && deleteObject.button) {
this._eventManager.removeListenerForHost(deleteObject.button)
}
this._deleteButtonList[deleteButtonId] = null
}
WinJS.Utilities.addClass(element, "listView2PinnedItem")
}
}, _addTileClicked: function _addTileClicked(e) {
this.disableEditMode();
this.selection.clear();
var eventObject=document.createEvent("CustomEvent");
eventObject.initCustomEvent("additeminvoked", true, true, null);
var element=this._element;
var that=this;
var logContext=this._logContext || CommonJS.UI.ResponsiveListView.DEFAULTLOGCONTEXT;
var logElement=(this._friendlyName || this._controlKey || "ResponsiveListView") + " addButton";
var logActionMethod=PlatformJS.Utilities.getLastClickUserActionMethod();
msSetImmediate(function _ResponsiveListView_976() {
element.dispatchEvent(eventObject);
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, logContext, logElement, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, logActionMethod, 0)
})
}, _preventDragAtInvaidatePosition: function _preventDragAtInvaidatePosition(e) {
if (e.detail.insertAfterIndex < this._pinnedItemCount - 1 || (this._addEnabled() && e.detail.insertAfterIndex === this._list.length - 1)) {
e.preventDefault()
}
}, _gestureTap: function _gestureTap(e) {
var eventObject=null;
var tapKey=null;
var target=null;
var element=document.elementFromPoint(e.clientX, e.clientY);
var deleteButtonList=this._deleteButtonList;
var objectList=this._objectList;
while (element) {
var elementId=element.id,
deleteButton=deleteButtonList[elementId];
if (deleteButton) {
tapKey = deleteButton.key
}
var targetObject=objectList[elementId];
if (targetObject) {
target = targetObject;
break
}
element = element.parentElement
}
if (this._removeEnabled() && tapKey && target && target.element && this._list) {
this._removeItemByElement(target.element);
e.stopPropagation();
e.preventDefault()
}
}, _removeItemByElement: function _removeItemByElement(element) {
var index=this.indexOfElement(element);
var eventObject=null;
var removedItem=this._list.splice(index, 1);
removedItem = removedItem.length ? removedItem[0] : null;
var elementID=element.id;
var deleteButton=this._objectList[elementID].deleteButton;
if (deleteButton && this._deleteButtonList[deleteButton.id]) {
this._eventManager.removeListenerForHost(deleteButton);
this._deleteButtonList[deleteButton.id] = null
}
this._objectList[elementID] = null;
this._detectSelectionAllowed = false;
eventObject = document.createEvent("CustomEvent");
eventObject.initCustomEvent("itemdeleted", true, true, removedItem);
this._element.dispatchEvent(eventObject);
this._setSaveOrderTimer(true);
var logContext=this._logContext || CommonJS.UI.ResponsiveListView.DEFAULTLOGCONTEXT;
var logElement=(this._friendlyName || this._controlKey || "ResponsiveListView") + " tile";
var logActionMethod=PlatformJS.Utilities.getLastClickUserActionMethod();
var logAttributes=JSON.stringify({ElementId: elementID});
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, logContext, logElement, "Delete", logActionMethod, 0, logAttributes)
}, _setSaveOrderTimer: function _setSaveOrderTimer(result) {
if (this._persistenceEnabled() && result) {
if (!this._saveOrderTimer) {
var that=this;
this._saveOrderTimer = setTimeout(function _ResponsiveListView_1063() {
that.saveOrder();
that._saveOrderTimer = null
}, 200)
}
}
}, _keepAddTileAtEnd: function _keepAddTileAtEnd() {
if (!this._disposed2) {
var that=this;
var list=this._list;
msSetImmediate(function ResponsiveListView_keepAddTileAtEnd() {
if (list) {
var length=list.length;
if (length && !(list.getAt(length - 1).isCommonJSAddTile)) {
var sourceIndex=-1;
for (var index=0; index < length - 1; index++) {
if (list.getAt(index).isCommonJSAddTile === true) {
sourceIndex = index;
break
}
}
if (sourceIndex < 0) {
list.push(CommonJS.UI.ResponsiveListView.ADDTILEITEMOBJECT)
}
else {
list.move(sourceIndex, length - 1)
}
}
}
})
}
}, _handleKeydown: function _handleKeydown(command, parameters) {
var that=this;
return function ResponsiveListView_spaceEnterKeysHandler(event) {
if (!that._disposed2) {
if (event.keyCode && (event.keyCode === 32 || event.keyCode === 13)) {
command.apply(that, parameters);
event.stopPropagation();
event.preventDefault()
}
}
}
}, _selectionChangingHandler: function _selectionChangingHandler(e) {
if (!this._disposed2 && this._list && e && e.detail && e.detail.newSelection && e.detail.preventTapBehavior) {
if (this._inDrag) {
e.detail.newSelection.clear();
e.detail.preventTapBehavior()
}
else {
var addTileIndex=this._list.length - 1;
var indices=e.detail.newSelection.getIndices();
if (indices.indexOf(addTileIndex) !== -1) {
e.detail.newSelection.remove(addTileIndex);
e.detail.preventTapBehavior()
}
}
}
if (this._disposed2) {
e.preventDefault()
}
}, _selectionChangedHandler: function _selectionChangedHandler(e) {
if (!this._disposed2 && !this._target) {
if (this.selection.count() > 0) {
var logContext=this._logContext || CommonJS.UI.ResponsiveListView.DEFAULTLOGCONTEXT;
var logElement=(this._friendlyName || this._controlKey || "ResponsiveListView") + " tile";
var logActionMethod=PlatformJS.Utilities.getLastClickUserActionMethod();
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, logContext, logElement, "Selection Changed", logActionMethod, 0)
}
}
}, _editButtonBlurred: function _editButtonBlurred(evt) {
if (!this._disposed2 && !WinJS.Utilities.eventWithinElement(this._element, evt)) {
this.disableEditMode()
}
}, _getItemTemplatePromiseResult: function _getItemTemplatePromiseResult(itemTemplateResult) {
var promise=null;
if (WinJS.Promise.is(itemTemplateResult)) {
promise = itemTemplateResult
}
else if (itemTemplateResult.element && WinJS.Promise.is(itemTemplateResult.element)) {
promise = itemTemplateResult.element
}
else {
promise = WinJS.Promise.wrap(itemTemplateResult)
}
return promise
}, _onkeyboardnavigating: function _onkeyboardnavigating(e) {
this._keyboardNavigated = true
}, _handleArrowKeyNavigation: function _handleArrowKeyNavigation(e) {
if (!this._disposed2) {
var mode=this._mode;
var Key=WinJS.Utilities.Key;
var keyCode=e.keyCode;
if (this._keyboardNavigated) {
this._keyboardNavigated = false
}
else if (mode._keyboardNavigationHandlers[keyCode]) {
var direction=null;
var NV=CommonJS.NavigableView;
switch (keyCode) {
case Key.upArrow:
direction = NV.Direction.UP;
break;
case Key.downArrow:
direction = NV.Direction.DOWN;
break;
case Key.leftArrow:
direction = NV.Direction.LEFT;
break;
case Key.rightArrow:
direction = NV.Direction.RIGHT;
break
}
NV.dispatchBoundaryEvent(this._element, direction)
}
}
}, _registerScrollOnDrag: function _registerScrollOnDrag() {
if (!this._disposed2) {
if (!this._isSelfScrollable()) {
var parentNode=this._viewport.parentNode;
while (parentNode) {
if (parentNode && parentNode.winControl && parentNode.winControl.registerDragScroller) {
parentNode.winControl.registerDragScroller(this._viewport || this._element);
break
}
parentNode = parentNode.parentNode
}
}
this._eventManager.remove(this._itemdragstartEventHandlerId)
}
}, _eventManager: null, _scheduler: null, _selfScrollable: null, _selectorStr: null, _sizeTemplate: "width:{0}px; height:{1}px", _minCellHeight: 0, _maxCellHeight: 0, _minCellWidth: 0, _fixedCellWidth: 0, _responsiveEnabled: false, _cellHeight: 0, _cellWidth: 0, _previousMaxItemsContainerContentSize: 0, _list: null, _controlKey: null, _itemDataSource: null, _descriptor: {}, _objectList: null, _deleteButtonList: null, _detectSelectionAllowed: false, _handleOutOfOrderItems: null, _enabledFeatures: null, _editButtonTemplate: null, _pinnedItemCount: 0, _disposed2: false, _disableEditModeOnBlurred: true, _addTileElement: null, _addTileClickedBinding: null, _addTileKeydownBinding: null, _addTileTapped: false, _draggedElementRender: null, _rtl2: false, _keyboardNavigated: false, _friendlyName: null, _logContext: null, _renderPromise: null, _itemTemplateRenderPromises: null, _timeoutPromise: null
}, {
FEATURES: {
NONE: 0, ADD: 1, REMOVE: 2, REORDER: 4, PERSISTENCE: 8, ALL: 15
}, SELECTIONTHRESHOLD: 21, LOCALSETTINGSKEY: "ResponsiveListViewPERSISTENCE", ADDTILEITEMOBJECT: {isCommonJSAddTile: true}, HANDLEOUTOFORDERITEMS: {
REMOVE: 0, MOVETOTOP: 1, MOVETOBOTTOM: 2
}, DEFAULTLOGCONTEXT: "Entity Customization List"
})
})
})();
(function appexPlatformControlsMarketPicker() {
"use strict";
var isKeyboardNavigation=false;
var NS=WinJS.Namespace.define("CommonJS", {MarketPicker: WinJS.Class.define(function marketPicker_ctor(element, options) {
var attribute=null,
parentSettings=null,
that=this;
this.element = element ? element : document.createElement("div");
this.element.winControl = this;
options = options || {};
this._marketSelectorContainer = document.createElement("div");
this._marketSelectorContainer.setAttribute("id", "MarketList");
this._marketSelectorContainer.setAttribute("role", "group");
this._marketSelect = document.createElement("select");
this._marketSelect.setAttribute("id", "MarketDropDown");
if (PlatformJS.mainProcessManager.retailModeEnabled) {
this._marketSelect.disabled = true
}
WinJS.Utilities.addClass(this.element, "platformSettingsGroup");
WinJS.Utilities.addClass(this.element, "win-disposable");
WinJS.Utilities.addClass(this._marketSelect, "platformMarketSelect");
if (!options.hideLabel) {
this._marketLabel = document.createElement("div");
this._marketLabel.setAttribute("id", "MarketTitle");
WinJS.Utilities.addClass(this._marketLabel, "platformSettingsGroupLabel");
this.element.appendChild(this._marketLabel);
this._marketLabel.innerText = CommonJS.resourceLoader.getString("/platform/languageSetting")
}
this._marketSelectorContainer.appendChild(this._marketSelect);
this.element.appendChild(this._marketSelectorContainer);
parentSettings = this.element.parentElement;
while (parentSettings) {
attribute = parentSettings.attributes.getNamedItem("data-win-control");
if (attribute && attribute.nodeValue === "WinJS.UI.SettingsFlyout") {
break
}
parentSettings = parentSettings.parentElement
}
if (parentSettings) {
this._parentSettingsFlyout = parentSettings.winControl;
this._parentSettingsFlyoutBind = this._settingsFlyoutBeforeShow.bind(this);
this._parentSettingsFlyout.addEventListener("beforeshow", this._parentSettingsFlyoutBind)
}
this._keydownListenerBind = this._keydownListener.bind(this);
this._marketSelect.addEventListener("keydown", this._keydownListenerBind);
this._marketPickerOnChangeBind = this._marketChanged.bind(this);
this._marketSelect.addEventListener("change", this._marketPickerOnChangeBind);
this._setupFocusEvents();
WinJS.UI.setOptions(this, options);
this._context = CommonJS.MarketPicker.context;
CommonJS.MarketPicker.context = "default"
}, {
element: null, _marketSelect: null, _marketLabel: null, _marketSelectorContainer: null, _parentSettingsFlyout: null, _parentSettingsFlyoutBind: null, _currentMarket: null, _marketPickerOnChangeBind: null, _focusinHandler: null, _focusoutHandler: null, _context: null, _keydownListenerBind: null, dispose: function dispose() {
if (this._focusinHandler) {
this.element.removeEventListener("focusin", this._focusinHandler);
this._focusinHandler = null
}
if (this._focusoutHandler) {
this.element.removeEventListener("focusout", this._focusoutHandler);
this._focusoutHandler = null
}
if (this._marketSelect) {
if (this._keydownListenerBind) {
this._marketSelect.removeEventListener("keydown", this._keydownListenerBind);
this._keydownListenerBind = null
}
if (this._marketPickerOnChangeBind) {
this._marketSelect.removeEventListener("change", this._marketPickerOnChangeBind);
this._marketPickerOnChangeBind = null
}
}
if (this._parentSettingsFlyout && this._parentSettingsFlyoutBind) {
this._parentSettingsFlyout.removeEventListener("beforeshow", this._parentSettingsFlyoutBind);
this._parentSettingsFlyoutBind = null
}
WinJS.Utilities.disposeSubTree(this.element);
this._marketSelect = null;
this.element = null
}, _populate: function _populate() {
var data=Platform.Globalization.Marketization.getMarketsForCurrentLanguageAndLocation();
this._currentMarket = Platform.Globalization.Marketization.getCurrentMarket();
for (var i=0; i < data.length; i++) {
var marketInfo=data[i];
var option=document.createElement("option");
var item=marketInfo.valueAsString;
option.setAttribute("value", item);
option.setAttribute("id", item);
option.innerText = Platform.Globalization.Marketization.getLocalizedMarketInfoDisplayName(marketInfo) + "\n";
if (item === this._currentMarket) {
option.selected = true
}
this._marketSelect.appendChild(option)
}
}, _settingsFlyoutBeforeShow: function _settingsFlyoutBeforeShow(event) {
if (this._marketSelect) {
if (this._marketSelect.hasChildNodes()) {
CommonJS.MarketPicker.selectDefaultMarket()
}
else {
this._populate()
}
}
}, _marketChanged: function _marketChanged(event) {
if (isKeyboardNavigation) {
isKeyboardNavigation = false;
return
}
var previousMarket=Platform.Globalization.Marketization.getCurrentMarket();
Platform.Globalization.Marketization.hasPendingUpdate = true;
CommonJS.MarketPicker.selectedMarket = this._marketSelect.value;
Platform.Globalization.Marketization.setPersistedMarket(this._marketSelect.value);
Platform.Configuration.ConfigurationManager.partnerDataFeedUrl = "";
Windows.Storage.ApplicationData.current.localSettings.values["platform_resetHistory"] = true;
var T=Microsoft.Bing.AppEx.Telemetry;
T.FlightRecorder.logUserActionWithJsonAttributes(T.LogLevel.normal, "App Options", "Market Picker", T.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify({
context: this._context, previousMarket: previousMarket, marketSelected: this._marketSelect.value
}));
if (!CommonJS.Settings.isDialogActive()) {
CommonJS.Settings.showCloseAppDialog(true)
}
}, _keydownListener: function _keydownListener(event) {
switch (event.keyCode) {
case WinJS.Utilities.Key.upArrow:
case WinJS.Utilities.Key.downArrow:
isKeyboardNavigation = true;
break;
case WinJS.Utilities.Key.enter:
event.preventDefault();
event.stopImmediatePropagation();
isKeyboardNavigation = false;
CommonJS.Settings.showCloseAppDialog(true);
break;
default:
isKeyboardNavigation = true;
break
}
}, _setupFocusEvents: function _setupFocusEvents() {
this._focusinHandler = function marketpicker_focusin() {
CommonJS.processListener.disableSearchOnType()
};
this._focusoutHandler = function marketpicker_focusout() {
CommonJS.processListener.enableSearchOnType()
};
this.element.addEventListener("focusin", this._focusinHandler);
this.element.addEventListener("focusout", this._focusoutHandler)
}
}, {
context: "default", selectedMarket: "", selectDefaultMarket: function selectDefaultMarket() {
var platformMarketSelect=WinJS.Utilities.query(".platformMarketSelect");
if (platformMarketSelect.length === 0) {
return
}
var defaultMarket=Platform.Globalization.Marketization.getCurrentMarket();
var parentElem,
toSelectOption;
parentElem = platformMarketSelect.length > 1 ? platformMarketSelect[1] : platformMarketSelect[0];
toSelectOption = WinJS.Utilities.query("#" + defaultMarket, parentElem);
if (toSelectOption && toSelectOption[0]) {
toSelectOption[0].selected = true
}
}
})})
})();
(function _CustomizationView_6() {
"use strict";
var NS=WinJS.Namespace.define("CommonJS.Immersive", {
CustomizationView: WinJS.Class.define(function customizationViewCtor(element, options) {
this._eventManager = CommonJS.Utils.getEventListenerManager(this, "SemanticZoomPanorama listeners");
this._element = element || document.createElement("div");
WinJS.Utilities.addClass(this._element, "platformCustomizationView");
this._element.winControl = this;
CommonJS.Utils.markDisposable(this._element);
this._disposed = false;
this._initializeCustomizationViewInProgress = false;
this.setOptions(options);
this._init()
}, {
_initialized: false, _customizationList: null, _postCustomization: null, _customizationViewShown: null, _customizationStartIndex: null, _removedCustomizationItems: null, _animationPromise: null, _normalView: null, _forceHidden: null, _eventManager: null, _disposed: null, _initializeCustomizationViewInProgress: null, _clusterList: null, _customizationMode: null, _customizationUseVariableSizedTemplates: null, _customizationImageMap: null, _customizationTitle: null, _customizationHintText: null, _maxCustomizationClusterCount: -1, _customizationItemTemplate: null, _customizationAddButtonRenderer: null, _customizationAdd: null, _customizationAddButtonsOptions: null, _actionTray: null, _customizationInvisibleList: null, _customizationInvisibleListMap: null, customizationList: {get: function get() {
return this._customizationList
}}, hasInitialized: function hasInitialized() {
return this._initialized
}, hasShown: function hasShown() {
return this._customizationViewShown
}, setOptions: function setOptions(options) {
var optionKey=null,
OPTIONS=CommonJS.Immersive.CustomizationView.OPTIONS;
for (var key in options) {
if (options.hasOwnProperty(key) && key in OPTIONS) {
optionKey = OPTIONS[key];
this[optionKey] = options[key]
}
}
}, clusterList: {set: function set(value) {
this._clusterList = value
}}, postCustomization: {set: function set(value) {
this._postCustomization = value
}}, startIndex: {set: function set(value) {
this._customizationStartIndex = value;
if (this._customizationViewShown) {
this._scrollToIndex()
}
}}, maxCustomizationClusterCount: {set: function set(value) {
this._maxCustomizationClusterCount = value
}}, customizationImageMap: {
get: function get() {
if (this._customizationImageMap) {
return JSON.stringify(this._customizationImageMap)
}
else {
return ""
}
}, set: function set(value) {
if (value) {
this._customizationImageMap = JSON.parse(value)
}
}
}, show: function show(skipUpdateList) {
if (this._initialized && (this._customizationAdd || !this._haveCustomizationAdd()) && !this._disposed) {
this._customizationViewShown = true;
var eventObject=document.createEvent("CustomEvent");
eventObject.initCustomEvent("samePageNav", true, true, null);
CommonJS.WindowEventManager.getInstance().dispatchEvent("samePageNav", eventObject);
if (!skipUpdateList || !this._customizationList.length) {
this._updateCustomizationList()
}
this._scrollToIndex();
this._removedCustomizationItems = [];
this._customizationListView2.enableEditMode();
this._customizationListView2.tapBehavior = "invokeOnly";
this._updateCustomizationAddButton();
if (this._animationPromise) {
this._animationPromise.cancel();
this._animationPromise = null
}
this._animationPromise = this._showCustomizationViewAnimation();
return this._animationPromise
}
}, dispose: function dispose() {
if (!this._disposed) {
this.cancelCustomizationView();
if (this._customizationListView2) {
this._customizationListView2.dispose();
this._customizationListView2 = null
}
if (this._animationPromise) {
this._animationPromise.cancel();
this._animationPromise = null
}
this._unregisterCloseHandler();
if (this._eventManager) {
this._eventManager.dispose()
}
this._disposed = true
}
}, updateInvisibleList: function updateInvisibleList(itemData) {
if (itemData.platformInvisiblePermanentCluster && this._customizationInvisibleListMap && typeof this._customizationInvisibleListMap[itemData.clusterKey] === "number") {
this._customizationInvisibleList.splice(this._customizationInvisibleListMap[itemData.clusterKey], 1, null);
this._customizationInvisibleListMap[itemData.clusterKey] = null
}
}, _init: function _init() {
if (!this._initializeCustomizationViewInProgress) {
var that=this;
this._initializeCustomizationViewInProgress = true;
this._customizationProcessExitKeys = true;
if (!this._customizationMode) {
this._customizationMode = CommonJS.Immersive.CUSTOMIZATIONMODE.full
}
var enabledFeatues=CommonJS.UI.ResponsiveListView.FEATURES.REMOVE | CommonJS.UI.ResponsiveListView.FEATURES.REORDER;
if (this._customizationMode === CommonJS.Immersive.CUSTOMIZATIONMODE.sort) {
enabledFeatues = CommonJS.UI.ResponsiveListView.FEATURES.REORDER
}
var layout={
type: WinJS.UI.GridLayout, maximumRowsOrColumns: 1
};
if (this._customizationUseVariableSizedTemplates) {
enabledFeatues = enabledFeatues | CommonJS.UI.ResponsiveListView.FEATURES.ADD;
layout.groupInfo = {
enableCellSpanning: true, cellWidth: 60, cellHeight: 161
}
}
var listView2Element=CommonJS.createElement("div", this._element, "listview2container");
WinJS.Utilities.addClass(listView2Element, "listview2container");
this._customizationList = new WinJS.Binding.List;
this._customizationListView2 = new CommonJS.UI.ResponsiveListView(listView2Element, {
friendlyName: "cluster", logContext: "Cluster Customization View", selectionMode: "none", layout: layout, enabledFeatures: enabledFeatues, addTileItemTemplate: this._invisibleCustomizationAddTileItemTemplate, itemTemplate: this._customizationItemTemplate || this._defaultCustomizationItemTemplate.bind(this), itemDataSource: this._customizationList.dataSource, onitemdeleted: this._onCustomizationItemRemoved.bind(this), disableEditModeOnBlurred: false
});
this._customizationListView2.render();
this._element.appendChild(listView2Element);
var closeButton=this._customizationCloseButton = document.createElement("button");
closeButton.setAttribute("aria-label", CommonJS.resourceLoader.getString("/platform/GoBack"));
CommonJS.setAutomationId(closeButton, this._element, "closeButton");
WinJS.Utilities.addClass(closeButton, "win-backbutton immersiveBackButton");
this._element.appendChild(closeButton);
if (this._customizationTitle) {
var customizationTitle=CommonJS.createElement("h1", this._element, "title");
WinJS.Utilities.addClass(customizationTitle, "immersiveHeaderTitle");
customizationTitle.textContent = this._customizationTitle;
this._element.appendChild(customizationTitle)
}
if (this._customizationHintText) {
var customizationHintText=CommonJS.createElement("div", this._element, "hint");
WinJS.Utilities.addClass(customizationHintText, "customizationHintText");
customizationHintText.textContent = this._customizationHintText;
this._element.appendChild(customizationHintText)
}
var createActionTray=function() {
if (!that._actionTray) {
that._actionTray = CommonJS.createElement("div", that._element, "actionTray");
WinJS.Utilities.addClass(that._actionTray, "customizationActionTray");
that._element.appendChild(that._actionTray)
}
};
if (this._haveCustomizationAdd()) {
createActionTray();
this._customizationAddButtons = [];
for (var i=0, ilen=this._customizationAddButtonsOptions ? this._customizationAddButtonsOptions.length : 1; i < ilen; i++) {
var customizationAddButton=CommonJS.createElement("button", this._element, "addButton"),
customizationAddButtonOptions=this._customizationAddButtonsOptions ? this._customizationAddButtonsOptions[i] : null;
if (this._customizationAddButtonRenderer && ilen === 1) {
customizationAddButton.appendChild(this._customizationAddButtonRenderer())
}
else {
customizationAddButton.appendChild(this._defaultCustomizationAddButtonRenderer(customizationAddButton, customizationAddButtonOptions))
}
this._eventManager.add(customizationAddButton, "click", this._customizationAddClicked.bind(this));
WinJS.Utilities.addClass(customizationAddButton, "customizationAddButton");
this._actionTray.appendChild(customizationAddButton);
this._customizationAddButtons.push(customizationAddButton)
}
this._eventManager.add(CommonJS.WindowEventManager, CommonJS.WindowEventManager.Events.WINDOW_RESIZE, this._updateCustomizationAddButton.bind(this), "updateCustomizationAddButton")
}
this._initialized = true;
this._initializeCustomizationViewInProgress = false
}
}, _scrollToIndex: function _scrollToIndex() {
if (this._disposed) {
return
}
var listLength=this._customizationList.length;
if (listLength && typeof this._customizationStartIndex === "number" && !isNaN(this._customizationStartIndex)) {
if (this._customizationStartIndex > listLength) {
this._customizationStartIndex = listLength - 1
}
while (this._customizationStartIndex < 0) {
this._customizationStartIndex += listLength
}
this._customizationListView2._view.items.requestItem(this._customizationStartIndex).then(function Customiztion_scrollToIndex() {
this._customizationListView2.ensureVisible(this._customizationStartIndex);
this._customizationStartIndex = null
}.bind(this))
}
}, getCustomizationResult: function getCustomizationResult() {
var list=this._createCustomizationClusters();
if (this._customizationInvisibleList) {
var count=this._customizationInvisibleList.length;
var wholeListLength=list.length + count;
var previousPoint=0;
var insertPoint=0;
for (var index=0; index < count; index++) {
var invisibleItem=this._customizationInvisibleList[index];
if (invisibleItem && invisibleItem.data) {
insertPoint = invisibleItem.index;
if (insertPoint < 0) {
insertPoint = wholeListLength + invisibleItem.index
}
if (invisibleItem.data.platformInvisiblePermanentCluster) {
if (insertPoint < previousPoint) {
insertPoint = previousPoint
}
else if (insertPoint > list.length) {
insertPoint = list.length
}
previousPoint = insertPoint;
list.splice(insertPoint, 0, invisibleItem.data.clusterKey)
}
else {
if (insertPoint > previousPoint && insertPoint <= list.length) {
previousPoint = insertPoint;
list.splice(insertPoint, 0, invisibleItem.data.clusterKey)
}
else {
wholeListLength--
}
}
}
else {
wholeListLength--
}
}
}
return list
}, _registerCloseHandler: function _registerCloseHandler() {
if (!this._customziationSamePageNavEventId) {
var closeCustomizationViewHandlerBinding=this._closeCustomizationViewHandler.bind(this);
if (this._customizationCloseButton) {
this._customizationCloseButtonClickEventId = this._eventManager.add(this._customizationCloseButton, "click", closeCustomizationViewHandlerBinding)
}
this._customizationCloseButtonKeyDownEventId = this._eventManager.add(document, "keydown", closeCustomizationViewHandlerBinding);
this._customziationSamePageNavEventId = this._eventManager.add(CommonJS.WindowEventManager.getInstance(), "samePageNav", closeCustomizationViewHandlerBinding)
}
}, _unregisterCloseHandler: function _unregisterCloseHandler() {
if (this._customziationSamePageNavEventId) {
this._eventManager.remove(this._customziationSamePageNavEventId);
this._eventManager.remove(this._customizationCloseButtonKeyDownEventId);
this._eventManager.remove(this._customizationCloseButtonClickEventId);
this._customziationSamePageNavEventId = null
}
}, _invisibleCustomizationAddTileItemTemplate: function _invisibleCustomizationAddTileItemTemplate(itemPromise) {
return itemPromise.then(function renderInvisibleAddTile() {
var container=document.createElement("div");
WinJS.Utilities.addClass(container, "customizationItemContainer customizationItemContainerSmall invisibleAddTile");
container.style.visibility = "hidden";
return container
})
}, _defaultCustomizationItemTemplate: function _defaultCustomizationItemTemplate(itemPromise) {
var that=this;
var setDivBackgroundImage=function(div, image) {
div.style.backgroundImage = "url('" + image + "')"
};
return itemPromise.then(function customizationItemTemplateRenderer(result) {
var render=function(item) {
var container=document.createElement("div");
var itemData=(item && item.data) || null;
var title=(itemData && itemData.clusterTitle) || undefined;
container.title = title;
var defaultBackground="/common/images/customizationItemMedium.png";
WinJS.Utilities.addClass(container, "customizationItemContainer");
if (that._customizationUseVariableSizedTemplates) {
var itemSize=(itemData && itemData.itemSize) || null;
switch (itemSize) {
case CommonJS.Immersive.CUSTOMIZATIONTEMPLATESIZE.large:
WinJS.Utilities.addClass(container, "customizationItemContainerLarge");
defaultBackground = "/common/images/customizationItemLarge.png";
break;
case CommonJS.Immersive.CUSTOMIZATIONTEMPLATESIZE.small:
WinJS.Utilities.addClass(container, "customizationItemContainerSmall");
defaultBackground = "/common/images/customizationItemSmall.png";
break;
case CommonJS.Immersive.CUSTOMIZATIONTEMPLATESIZE.medium:
default:
WinJS.Utilities.addClass(container, "customizationItemContainerMedium");
break
}
}
else {
WinJS.Utilities.addClass(container, "customizationItemContainerMedium")
}
var titleElement=document.createElement("div");
WinJS.Utilities.addClass(titleElement, "customizationItemTitle");
titleElement.textContent = title;
container.appendChild(titleElement);
var imageDiv=document.createElement("div");
WinJS.Utilities.addClass(imageDiv, "customizationItemBackgroundImage");
var backgroundImage=null;
if (itemData) {
if (itemData.itemKey && that._customizationImageMap && that._customizationImageMap[itemData.itemKey]) {
backgroundImage = that._customizationImageMap[itemData.itemKey]
}
else {
backgroundImage = itemData.customizationItemBackgroundImage
}
}
if (!backgroundImage) {
if (itemData && itemData.isHero) {
backgroundImage = itemData.clusterContent && itemData.clusterContent.contentOptions && itemData.clusterContent.contentOptions.imageData && itemData.clusterContent.contentOptions.imageData.backgroundImage && itemData.clusterContent.contentOptions.imageData.backgroundImage.lowResolutionUrl;
backgroundImage = backgroundImage || defaultBackground
}
else {
backgroundImage = defaultBackground
}
}
if (backgroundImage) {
if (!that._customizationImageMap) {
that._customizationImageMap = {}
}
if (itemData && itemData.itemKey) {
that._customizationImageMap[itemData.itemKey] = backgroundImage
}
if (backgroundImage.indexOf("/") === 0 || backgroundImage.indexOf("ms-appdata://") === 0) {
setDivBackgroundImage(imageDiv, backgroundImage)
}
else {
WinJS.Utilities.addClass(imageDiv, "customizationItemOnlineBackgroundImage");
if (!PlatformJS.isPlatformInitialized && itemData.clusterContent && itemData.clusterContent.contentOptions && itemData.clusterContent.contentOptions.imageData && itemData.clusterContent.contentOptions.imageData.backgroundImage) {
var imageTag=itemData.clusterContent.contentOptions.imageData.backgroundImage.imageTag;
if (imageTag) {
var entry=PlatformJS.BootCache.instance.getEntry(imageTag);
if (entry && (entry.url === backgroundImage)) {
setDivBackgroundImage(imageDiv, entry.localUrl)
}
}
}
else if (PlatformJS.isPlatformInitialized) {
PlatformJS.Cache.CacheService.getInstance("PlatformImageCache").findEntry(backgroundImage, {fileNameOnly: true}).then(function _CustomizationView_444(response) {
if (!response || response.isStale()) {
PlatformJS.Utilities.fetchImage("PlatformImageCache", backgroundImage).then(function _CustomizationView_447(fetchResponse) {
setDivBackgroundImage(imageDiv, fetchResponse)
})
}
else {
setDivBackgroundImage(imageDiv, response.dataValue)
}
})
}
}
}
container.appendChild(imageDiv);
return container
};
if (WinJS.Promise.is(result)) {
return result.then(render)
}
else {
return render(result)
}
})
}, _defaultCustomizationAddButtonRenderer: function _defaultCustomizationAddButtonRenderer(button, options) {
if (options && options.title) {
var customizationAddButton=button,
customizationAddButtonOptions=options;
var addSectionContainer=CommonJS.createElement("div", customizationAddButton, "addSection");
WinJS.Utilities.addClass(addSectionContainer, "customizationAddSectionContainer");
var addSectionTitle=CommonJS.createElement("div", addSectionContainer, "addSectionTitle");
WinJS.Utilities.addClass(addSectionTitle, "customizationAddSectionTitle");
addSectionTitle.textContent = customizationAddButtonOptions.title;
addSectionContainer.appendChild(addSectionTitle);
if (customizationAddButtonOptions.content) {
var addSectionContent=CommonJS.createElement("div", addSectionContainer, "addSectionContent");
WinJS.Utilities.addClass(addSectionContent, "customizationAddSectionContent");
addSectionContent.textContent = customizationAddButtonOptions.content;
addSectionContainer.appendChild(addSectionContent)
}
var addSectionButton=CommonJS.createElement("span", addSectionContainer, "addSectionButton");
WinJS.Utilities.addClass(addSectionButton, "customizationAddSectionButton");
addSectionContainer.appendChild(addSectionButton);
return addSectionContainer
}
else {
var addButtonContentdiv=document.createElement("div");
WinJS.Utilities.addClass(addButtonContentdiv, "customizationAddButtonContent");
return addButtonContentdiv
}
}, _updateCustomizationAddButton: function _updateCustomizationAddButton() {
if (this._disposed) {
return
}
if (this._customizationViewShown) {
if (this._customizationListView2 && this._customizationListView2.element && this._actionTray) {
var topOffset=this._customizationListView2.element.offsetTop + this._customizationListView2.element.clientHeight + 40;
this._actionTray.style.top = topOffset + "px"
}
if (this._maxCustomizationClusterCount >= 0 && this._customizationAddButtons && this._customizationAddButtons.length > 0) {
for (i = 0, ilen = this._customizationAddButtons.length; i < ilen; i++) {
var customizationAddButton=this._customizationAddButtons[i];
var length=this._createCustomizationClusters().length;
if (length >= this._maxCustomizationClusterCount) {
customizationAddButton.disabled = true
}
else {
customizationAddButton.disabled = false
}
}
}
}
}, _onCustomizationItemRemoved: function _onCustomizationItemRemoved(e) {
if (this._customizationViewShown) {
if (this._removedCustomizationItems && e && e.detail && e.detail.itemKey) {
this._removedCustomizationItems.push(e.detail.itemKey)
}
this._updateCustomizationAddButton()
}
}, _closeCustomizationViewHandler: function _closeCustomizationViewHandler(e) {
var isBackButtonClicked=(e.type === "click" || e.type === "samePageNav");
var isBackSpacePressed=this._customizationProcessExitKeys && (e.keyCode === WinJS.Utilities.Key.backspace || e.keyCode === WinJS.Utilities.Key.escape);
if (isBackButtonClicked || isBackSpacePressed) {
var clickUserActionMethod=PlatformJS.Utilities.getClickUserActionMethod(e);
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Cluster Customization View", "Back Button", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, clickUserActionMethod, 0);
this.closeCustomizationView()
}
}, closeCustomizationView: function closeCustomizationView() {
this._customizationProcessExitKeys = true;
if (this._customizationViewShown) {
this._customizationViewShown = false;
this._hideCustomizationShowAnimation();
if (this._postCustomization) {
this._postCustomization()
}
}
}, cancelCustomizationView: function cancelCustomizationView() {
if (this._customizationViewShown) {
this._customizationViewShown = false;
if (this._animationPromise) {
this._animationPromise.cancel();
this._animationPromise = null
}
this._animationPromise = this._hideCustomizationShowAnimation()
}
}, _disableBottomEdgy: function _disableBottomEdgy(value) {
var appbarDoms=WinJS.Utilities.query(".win-appbar");
for (var i=0; i < appbarDoms.length; i++) {
var appbarControl=appbarDoms[i].winControl;
if (appbarControl && appbarControl.placement === "bottom") {
appbarControl.disabled = value
}
}
}, _showCustomizationViewAnimation: function _showCustomizationViewAnimation() {
var that=this;
CommonJS.dismissAllEdgies();
this._disableBottomEdgy(true);
this._element.style.visibility = "visible";
WinJS.UI.executeTransition(this._normalView, {
property: "opacity", delay: 0, duration: 300, timing: "ease", to: "0"
}).then(function hideNormalView() {
if (WinJS.Utilities.hasClass(that._normalView, "forceHidden")) {
that._forceHidden = false
}
else {
that._forceHidden = true;
WinJS.Utilities.addClass(that._normalView, "forceHidden")
}
});
return WinJS.UI.executeTransition(this._element, {
property: "transform", delay: 0, duration: 0, to: "scale(2)"
}).then(function _CustomizationView_602() {
return WinJS.UI.executeTransition(that._element, [{
property: "transform", delay: 0, duration: 300, timing: "ease", to: "scale(1)"
}, {
property: "opacity", delay: 0, duration: 300, timing: "ease", to: "1"
}])
}).then(function registerCloseCustomizationViewHandler() {
that._registerCloseHandler()
})
}, _hideCustomizationShowAnimation: function _hideCustomizationShowAnimation() {
var that=this;
if (this._forceHidden) {
WinJS.Utilities.removeClass(this._normalView, "forceHidden")
}
this._disableBottomEdgy(false);
WinJS.UI.executeTransition(this._normalView, {
property: "opacity", delay: 0, duration: 300, timing: "ease", to: "1"
});
return WinJS.UI.executeTransition(this._element, [{
property: "transform", delay: 0, duration: 300, timing: "ease", to: "scale(2)"
}, {
property: "opacity", delay: 0, duration: 300, timing: "ease", to: "0"
}]).then(function _CustomizationView_652() {
return WinJS.UI.executeTransition(that._element, {
property: "transform", delay: 0, duration: 0, to: "scale(1)"
})
}).then(function postHideCustomizationViewAnimation() {
if (that._element) {
that._element.style.visibility = "hidden"
}
}).then(function unregisterCloseHandler() {
that._unregisterCloseHandler()
})
}, _haveCustomizationAdd: function _haveCustomizationAdd() {
return !(this._customizationMode === CommonJS.Immersive.CUSTOMIZATIONMODE.sort || this._customizationMode === CommonJS.Immersive.CUSTOMIZATIONMODE.sortRemove)
}, _createCustomizationClusters: function _createCustomizationClusters() {
var list=this._customizationList.filter(function _CustomizationView_674(item) {
return item.itemKey && !item.isCommonJSAddTile
}).map(function _CustomizationView_676(item) {
return item.itemKey
});
return list
}, _updateCustomizationList: function _updateCustomizationList() {
if (this._customizationList.length) {
this._customizationList.splice(0, this._customizationList.length)
}
if (!this._customizationInvisibleList) {
this._customizationInvisibleList = [];
this._customizationInvisibleListMap = {}
}
var headPart=true;
for (var index=0, count=this._clusterList.length; index < count; index++) {
var data=this._clusterList.getAt(index);
data.itemKey = data.clusterKey;
data.title = data.clusterTitle;
if (data.isHero) {
data.pinned = true
}
if (!headPart && index !== count - 1 && data.platformInvisibleCluster) {
data.platformInvisiblePermanentCluster = false
}
if (data.platformInvisibleCluster) {
var invisibleIndex=index;
if (!data.platformInvisiblePermanentCluster || (data.platformInvisiblePermanentCluster && index === count - 1)) {
invisibleIndex = index - count
}
if (typeof this._customizationInvisibleListMap[data.clusterKey] !== "number") {
this._customizationInvisibleList.push({
index: invisibleIndex, key: data.clusterKey, data: data
});
this._customizationInvisibleListMap[data.clusterKey] = this._customizationInvisibleList.length - 1
}
else {
this._customizationInvisibleList.splice(this._customizationInvisibleListMap[data.clusterKey], 1, {
index: invisibleIndex, key: data.clusterKey, data: data
})
}
}
else {
this._customizationList.push(data)
}
headPart = headPart && data.pinned
}
}, _customizationAddClicked: function _customizationAddClicked(evt) {
if (this._customizationAdd) {
var list=this.getCustomizationResult(),
buttonIndex=0;
var target=evt ? evt.currentTarget : null;
if (target && target.parentNode && target.parentNode.childNodes) {
buttonIndex = Array.prototype.indexOf.call(target.parentNode.childNodes, target)
}
var elementLabel="addButton";
if (this._customizationAddButtonsOptions && this._customizationAddButtonsOptions.length > 1) {
elementLabel += (buttonIndex + 1)
}
var clickUserActionMethod=PlatformJS.Utilities.getClickUserActionMethod(evt);
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Cluster Customization View", elementLabel, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, clickUserActionMethod, 0);
this._customizationProcessExitKeys = false;
this._customizationAdd(list, this._removedCustomizationItems, this._postAddUIClosed.bind(this), buttonIndex)
}
}, _postAddUIClosed: function _postAddUIClosed(pickedItems) {
this._customizationProcessExitKeys = true;
if (pickedItems.length) {
var originalLength=this._customizationList.length;
var that=this;
pickedItems.forEach(function _CustomizationView_759(item) {
item.itemKey = item.clusterKey;
that._customizationList.push(item)
});
this._removedCustomizationItems = [];
WinJS.Utilities.query(".win-itemsblock", this._element).toggleClass("platformRefresh")
}
this._updateCustomizationAddButton()
}
}, {OPTIONS: {
clusterList: "clusterList", postCustomization: "postCustomization", startIndex: "startIndex", customizationImageMap: "customizationImageMap", maxCustomizationClusterCount: "maxCustomizationClusterCount", normalView: "_normalView", mode: "_customizationMode", useVariableSizedTemplates: "_customizationUseVariableSizedTemplates", title: "_customizationTitle", hintText: "_customizationHintText", itemTemplate: "_customizationItemTemplate", addButtonRenderer: "_customizationAddButtonRenderer", addCallback: "_customizationAdd", addButtonsOptions: "_customizationAddButtonsOptions"
}}), CUSTOMIZATIONMODE: {
full: "full", sortRemove: "sortRemove", sort: "sort"
}, CUSTOMIZATIONTEMPLATESIZE: {
large: "large", medium: "medium", small: "small"
}
})
})();
(function appexPlatformControlsRealizedListInit() {
"use strict";
var NS=WinJS.Namespace.define("CommonJS.Immersive", {RealizedList: WinJS.Class.define(function realizedList_ctor() {
this._realized = []
}, {
_realized: null, first: {get: function get() {
return this._realized[0]
}}, last: {get: function get() {
var realized=this._realized;
return realized[realized.length - 1]
}}, length: {get: function get() {
return this._realized.length
}}, insert: function insert(item, index) {
var realized=this._realized;
var count=realized.length - 1;
if (index > count) {
return this.push(item)
}
var previous=(index > 0) ? realized[index - 1] : null;
var next=(index <= count) ? realized[index] : null;
if (previous) {
previous.next = item
}
if (next) {
next.previous = item
}
item.previous = previous;
item.next = next;
realized.splice(index, 0, item);
var node=item;
while (node) {
node.index = index;
node = node.next;
index++
}
}, push: function push(item) {
var realized=this._realized;
var index=realized.length;
var last=this.last;
if (last) {
last.next = item;
item.previous = last
}
item.index = index;
realized.push(item)
}, remove: function remove(item) {
if (item) {
return this.removeAt(item.index)
}
}, removeAt: function removeAt(index) {
var realized=this._realized;
if (index < realized.length) {
var item=realized[index];
var previous=item.previous;
var next=item.next;
if (previous) {
previous.next = next
}
if (next) {
next.previous = previous
}
realized.splice(index, 1);
while (next) {
next.index = index;
next = next.next;
index++
}
}
}, addRange: function addRange(range) {
for (var i=0, ilen=range.length; i < ilen; i++) {
this.push(range[i])
}
}, fromIndex: function fromIndex(index) {
var realized=this._realized;
return realized.length > index ? realized[index] : null
}, fromHandle: function fromHandle(handle) {
var item=this.first;
while (item && item.handle !== handle) {
item = item.next
}
return item
}, fromKey: function fromKey(key) {
var item=this.first;
while (item && item.key !== key) {
item = item.next
}
return item
}
})})
})();
(function _Panorama_7() {
"use strict";
var NS=WinJS.Namespace.define("CommonJS.Immersive", {Panorama: WinJS.Class.mix(WinJS.Class.define(function panorama_ctor(element, options) {
options = options || {};
this._element = element;
this._eventManager = CommonJS.Utils.getEventListenerManager(this, "Panorama listeners");
CommonJS.setAutomationId(this._element);
element.winControl = this;
Object.defineProperties(this, WinJS.Utilities.createEventProperties("afterFirstView"));
CommonJS.Progress.canDestroySplash(false);
var displayData=PlatformJS.Utilities.getDisplayData();
this._viewWidth = displayData.offsetWidth;
this._viewHeight = displayData.offsetHeight;
this._eventManager.add(CommonJS.WindowEventManager, CommonJS.WindowEventManager.Events.WINDOW_RESIZE, this.onWindowResize.bind(this));
this._eventManager.add(CommonJS.WindowEventManager, CommonJS.WindowEventManager.Events.AD_ENGAGE, this._onAdEngageChanged.bind(this));
this._initialize(options)
}, {
_element: null, _watermarkElement: null, _panel: null, header: null, _eventManager: null, _watermark: null, _viewWidth: null, _viewHeight: null, _disposed: false, _virtualizer: null, _headerController: null, _surfaceSize: null, _focusManager: null, afterFirstView: null, _delayedResizeEvent: null, _isAdEngaged: false, currentClusterIndex: {set: function set(value) {
this._virtualizer.setCurrentIndex(value)
}}, _initialize: function _initialize(options) {
var element=this._element;
WinJS.Utilities.addClass(element, "win-disposable");
var headerElement=CommonJS.createElement("header", element, "header");
headerElement.id = "header";
var header=this.header = new CommonJS.Immersive.Header(headerElement);
header.onSubTitleClick = this._onHeaderSubtitleClick.bind(this);
element.appendChild(headerElement);
var panelElement=CommonJS.createElement("div", element, "panel");
var panel=this._panel = new NS.PanoramaPanel(panelElement, options);
panel._createOrchestrator = this._createOrchestrator.bind(this);
CommonJS.setAutomationId(panelElement, element, "panel");
element.appendChild(panelElement);
var focusManager=this._focusManager = new NS.PanoramaFocusManager(panel);
var virtualizer=this._virtualizer = new NS.PanoramaVirtualizer(panel, focusManager, this);
WinJS.UI.setOptions(virtualizer, options);
focusManager.virtualizer = virtualizer;
this._surfaceSize = new NS.SurfaceSizeObserver(panel, header, virtualizer);
this._headerController = new CommonJS.Immersive.HeaderOrchestrator.PanoramaHeaderOrchestrator(this, panel, header);
CommonJS.Immersive.HeaderOrchestrator.headerOrchestrator = this._headerController;
this._metrics = new NS.PanoramaMetricsObserver(panel, virtualizer);
var watermarkElement=this._watermarkElement = CommonJS.createElement("div", element, "watermark");
WinJS.Utilities.addClass(watermarkElement, "platformWatermark");
element.appendChild(watermarkElement);
CommonJS.Watermark.setElement(watermarkElement);
CommonJS.Watermark.setWatermarkText(this._watermark)
}, _createOrchestrator: function _createOrchestrator(item, priorityModifierFn, visibilityManager, id) {
return new CommonJS.SchedulerProxy(priorityModifierFn, visibilityManager, id)
}, _onHeaderSubtitleClick: function _onHeaderSubtitleClick(event) {
var item=this._panel.current;
var panoramaItem=item.data;
if (panoramaItem.onHeaderSelection) {
panoramaItem.onHeaderSelection(panoramaItem.clusterKey, item.index, this);
PlatformJS.Services.instrumentation.incrementInt32(Platform.Instrumentation.InstrumentationDataSetId.platform, Platform.Instrumentation.InstrumentationDataPointId.totalClusterHeaderTappedCount, 1)
}
}, getPanoramaState: function getPanoramaState() {
if (this._virtualizer) {
return this._virtualizer.getState()
}
else {
console.error("this._virtualizer is null or undefined.")
}
return null
}, getClusterContentControl: function getClusterContentControl(key) {
var item=this._virtualizer._realized ? this._virtualizer._realized.first : null;
while (item) {
if (item.key === key) {
return item.winControl
}
else {
item = item.next
}
}
return null
}, cancelPendingOperations: function cancelPendingOperations() {
this._virtualizer.cancelPendingOperations()
}, refresh: function refresh() {
this._panel.detach();
this._panel.current = null;
this._disposeAllClusters();
this._virtualizer.refresh()
}, panoramaState: {set: function set(value) {
if (this._virtualizer) {
this._virtualizer.panoramaState = value
}
}}, clusterDataSource: {set: function set(value) {
this._disposeAllClusters();
this._virtualizer.dataSource = value
}}, headerOptions: {set: function set(value) {
WinJS.UI.setOptions(this.header, value)
}}, showInertiaBackground: {
get: function get() {
return this._panel.showInertiaBackground
}, set: function set(value) {
this._panel.showInertiaBackground = value
}
}, compactPanorama: {
get: function get() {
return this._panel.compactPanorama
}, set: function set(value) {
this._panel.compactPanorama = value
}
}, zeroOffset: {get: function get() {
if (this._surfaceSize) {
return this._surfaceSize.zeroOffset
}
}}, zeroOffsetSnapPoints: {
get: function get() {
return this._panel.zeroOffsetSnapPoints
}, set: function set(value) {
this._panel.zeroOffsetSnapPoints = value
}
}, title: {set: function set(value) {
this.header.headerTitleText = value
}}, subTitle: {set: function set(value) {
this.header.headerSubTitleText = value
}}, headerImage: {set: function set(value) {
this.header.headerImage = value
}}, watermark: {
get: function get() {
return this._watermark
}, set: function set(value) {
this._watermark = value;
CommonJS.Watermark.setWatermarkText(value, this._watermarkElement)
}
}, current: {get: function get() {
return this._panel.current
}}, addScrollListener: function addScrollListener(scrollBinding) {
if (this._panel) {
this._panel.addEventListener("scroll", scrollBinding)
}
}, removeScrollListener: function removeScrollListener(scrollBinding) {
if (this._panel) {
this._panel.removeEventListener("scroll", scrollBinding)
}
}, onWindowResize: function onWindowResize(event) {
CommonJS.WindowEventManager.HandleWindowResizeEvent.call(this, event, function HandleWindowResize() {
if (this._isAdEngaged) {
this._delayedResizeEvent = event
}
else {
this._handleWindowResize(event);
this._delayedResizeEvent = null
}
})
}, _handleWindowResize: function _handleWindowResize(event) {
if (!this._disposed) {
var displayData=PlatformJS.Utilities.getDisplayData(),
oldWidth=this._viewWidth,
oldHeight=this._viewHeight;
var detail=event.detail || event.platFormDetail;
if (detail.hasOffsetWidthChanged || detail.hasOffsetHeightChanged) {
this._viewWidth = displayData.offsetWidth;
this._viewHeight = displayData.offsetHeight;
if (this._surfaceSize) {
this._surfaceSize._onWindowResize(event)
}
if (this._headerController) {
this._headerController._invalidateCheckpoints()
}
event.old = {
width: oldWidth, height: oldHeight
};
event.new = {
width: this._viewWidth, height: this._viewHeight
};
var surface=this._panel && this._panel._surface;
if (surface) {
var resizableElements=surface.getElementsByClassName(CommonJS.RESPONSIVE_RESIZABLE_CLASS);
var resizableElement,
index,
control;
for (index in resizableElements) {
resizableElement = resizableElements[index];
control = resizableElement && resizableElement.winControl;
if (control && control.onWindowResize) {
control.onWindowResize(event)
}
}
}
if (this._virtualizer && this._virtualizer.onWindowResize) {
this._virtualizer.onWindowResize(event)
}
}
}
}, _onAdEngageChanged: function _onAdEngageChanged(event) {
this._isAdEngaged = event.detail;
if (!this._isAdEngaged && this._delayedResizeEvent) {
this._handleWindowResize(this._delayedResizeEvent);
this._delayedResizeEvent = null
}
}, onDpiChange: function onDpiChange(event) {
if (this.semanticZoom) {
this.semanticZoom.forceLayout()
}
}, dispose: function dispose() {
if (!this._disposed) {
this._disposed = true;
if (this._virtualizer) {
this._disposeAllClusters();
this._virtualizer.dispose();
this._virtualizer = null
}
this.header.dispose();
this.header = null;
this._surfaceSize.dispose();
this._surfaceSize = null;
this._metrics.dispose();
this._metrics = null;
this._focusManager.dispose();
this._focusManager = null;
var panel=this._panel;
if (panel) {
this._panel = null;
panel.detach();
panel.clear();
panel.dispose()
}
if (this._headerController) {
this._headerController.dispose();
this._headerController = null
}
WinJS.Utilities.disposeSubTree(this._element);
if (this._eventManager) {
this._eventManager.dispose();
this._eventManager = null
}
this._delayedResizeEvent = null;
this._isAdEngaged = false;
this._element.winControl = null;
this._element = null
}
}, _disposeAllClusters: function _disposeAllClusters() {
if (this._virtualizer) {
this._virtualizer.disposeAllClusters()
}
if (this._surfaceSize) {
this._surfaceSize.clearStyle()
}
}, ensureElementVisible: function ensureElementVisible(element) {
if (this._panel) {
this._panel.ensureElementVisible(element)
}
}, registerDragScroller: function registerDragScroller(element) {
if (this._panel) {
this._panel.registerDragScroller(element)
}
}, unregisterDragScroller: function unregisterDragScroller(element) {
if (this._panel) {
this._panel.unregisterDragScroller(element)
}
}
}, {PanoramaItemMode: {
normal: 0, fullBleed: 1
}}), WinJS.Utilities.eventMixin)})
})();
(function appexPlatformPanoramaFocusManagerInit() {
"use strict";
var NS=WinJS.Namespace.define("CommonJS.Immersive", {PanoramaFocusManager: WinJS.Class.define(function panoramaFocusManager_ctor(panel) {
var WindowEventManager=CommonJS.WindowEventManager;
this._eventManager = CommonJS.Utils.getEventListenerManager(this, "PanoramaFocusManager listeners");
this._panel = panel;
this._eventManager.add(this._panel, "itembounds", this._onItemBounds.bind(this), "PanoramaFocusManager itemBounds");
if (this._panel._element) {
this._eventManager.add(this._panel._element, "focus", this._onPanelElementFocus.bind(this), "PanoramaFocusManager focus")
}
this._windowEventManager = WindowEventManager.getInstance();
this._eventManager.add(this._windowEventManager, WindowEventManager.Events.PAGEUP, this._onPageUp.bind(this), "PanoramaFocusManager pageup");
this._eventManager.add(this._windowEventManager, WindowEventManager.Events.PAGEDOWN, this._onPageDown.bind(this), "PanoramaFocusManager pagedown");
this._eventManager.add(this._windowEventManager, WindowEventManager.Events.CURSORKEY, this._onCursorKey.bind(this), "PanoramaFocusManager cursorkey");
this._eventManager.add(this._windowEventManager, WindowEventManager.Events.TAB, this._onTabKey.bind(this), "PanoramaFocusManager tab")
}, {
_eventManager: null, _windowEventManager: null, _postZoomFocusTarget: null, _panel: null, _onPanelElementFocus: function _onPanelElementFocus(event) {
if (this._postZoomFocusTarget) {
this._postZoomFocusTarget.focus();
this._postZoomFocusTarget = null
}
}, _onPageUp: function _onPageUp(event) {
var originalEvent=event.detail.originalEvent ? event.detail.originalEvent : event.detail;
if (this._panel && originalEvent.target.isContentEditable !== true && originalEvent.target.tagName.toLowerCase() !== "select") {
var previous=(this._panel._current) ? this._panel._current.previous : null;
if (previous) {
this._panel.scrollToWithAnimation(previous.offset, previous, this);
originalEvent.preventDefault();
originalEvent.stopImmediatePropagation()
}
}
}, _onPageDown: function _onPageDown(event) {
var originalEvent=event.detail.originalEvent ? event.detail.originalEvent : event.detail;
if (this._panel && originalEvent.target.isContentEditable !== true && originalEvent.target.tagName.toLowerCase() !== "select") {
var next=(this._panel._current) ? this._panel._current.next : null;
if (next) {
this._panel.scrollToWithAnimation(next.offset, next, this);
originalEvent.preventDefault();
originalEvent.stopImmediatePropagation()
}
}
}, _onCursorKey: function _onCursorKey(event) {
var originalEvent=event.detail.originalEvent ? event.detail.originalEvent : event.detail;
if (this._panel && (originalEvent.target.tagName.toLowerCase() === "body" || this._isNavigableElement(originalEvent.target) === false)) {
this.setFocusToFirstInPanel(this._panel._current);
originalEvent.preventDefault();
originalEvent.stopImmediatePropagation()
}
}, _isNavigableElement: function _isNavigableElement(element) {
var tagName=element.tagName.toLowerCase(),
role=element.getAttribute("role");
return this._isNavigableTagName(tagName) || this._isNavigableRole(role)
}, _isNavigableRole: function _isNavigableRole(role) {
var isNavigableRole=false;
switch (role) {
case"button":
case"link":
case"option":
case"menuitem":
case"gridcell":
case"tab":
case"listbox":
case"combobox":
isNavigableRole = true;
break;
default:
break
}
return isNavigableRole
}, _isNavigableTagName: function _isNavigableTagName(tagName) {
var isNavigableTagName=false;
switch (tagName) {
case"button":
case"a":
case"option":
case"input":
case"textarea":
case"select":
isNavigableTagName = true;
break;
default:
break
}
return isNavigableTagName
}, _onTabKey: function _onTabKey(event) {
this._checkRealization()
}, _onItemBounds: function _onItemBounds(event) {
var Direction=CommonJS.NavigableView.Direction,
item=event.detail.item,
direction=event.detail.direction,
isLtr=(document.dir !== "rtl");
var hasFocusedNext=false;
this._checkRealization();
while (item && !hasFocusedNext) {
hasFocusedNext = true;
if (event.detail.header) {
switch (direction) {
case Direction.RIGHT:
item = (isLtr) ? item.next : item.previous;
hasFocusedNext = this.setFocusToHeader(item) || this.setFocusToContent(item) || this.setFocusToFirstInCluster(item);
break;
case Direction.DOWN:
this.setFocusToContent(item) || this.setFocusToFirstInCluster(item);
break;
case Direction.LEFT:
item = (isLtr) ? item.previous : item.next;
hasFocusedNext = this.setFocusToHeader(item) || this.setFocusToContent(item) || this.setFocusToFirstInCluster(item);
break;
default:
break
}
}
else {
switch (direction) {
case Direction.UP:
this.setFocusToHeader(item);
break;
case Direction.RIGHT:
item = (isLtr) ? item.next : item.previous;
hasFocusedNext = this.setFocusToContent(item) || this.setFocusToFirstInCluster(item) || this.setFocusToHeader(item);
break;
case Direction.LEFT:
item = (isLtr) ? item.previous : item.next;
hasFocusedNext = this.setFocusToContent(item) || this.setFocusToFirstInCluster(item) || this.setFocusToHeader(item);
break;
default:
break
}
}
}
}, _checkRealization: function _checkRealization() {
if (this.virtualizer && this.virtualizer._isRealizationRequired()) {
this.virtualizer._realizeNextItems(1)
}
}, virtualizer: null, setFocusTo: function setFocusTo(item, ignoreAnimation) {
return this.setFocusToContent(item, ignoreAnimation) || this.setFocusToHeader(item, ignoreAnimation) || this.setFocusToFirstInCluster(item, ignoreAnimation)
}, setFocusToFirstInPanel: function setFocusToFirstInPanel(item) {
var success=false;
while (item && success === false) {
success = this.setFocusTo(item);
item = item.next
}
return success
}, setFocusToFirstInCluster: function setFocusToFirstInCluster(item) {
var success=false;
var firstTabIndexItem=null;
if (item && item.element) {
firstTabIndexItem = item.element.querySelector("*[tabIndex='0']");
if (firstTabIndexItem) {
CommonJS.Immersive.PanoramaFocusManager.animationToContent(firstTabIndexItem);
success = true;
this._postZoomFocusTarget = firstTabIndexItem
}
}
return success
}, setFocusToHeader: function setFocusToHeader(item) {
var success=false;
if (item && item.element) {
var headerElement=item.element.querySelector(".platformClusterHeader");
if (headerElement) {
var headerElementLink=headerElement.querySelector("*[role='link']");
if (headerElementLink && headerElementLink.getAttribute("tabIndex") === "0") {
CommonJS.Immersive.PanoramaFocusManager.animationToContent(headerElementLink);
success = true;
this._postZoomFocusTarget = headerElementLink
}
}
}
return success
}, setFocusToContent: function setFocusToContent(item, ignoreAnimation) {
var success=false;
if (item && item.winControl) {
var content=item.winControl._domElement || item.winControl.element;
if (content) {
var activeDescendant=content.querySelector("[tabIndex='0']")
}
}
if (activeDescendant) {
if (ignoreAnimation) {
activeDescendant.focus()
}
else {
CommonJS.Immersive.PanoramaFocusManager.animationToContent(activeDescendant)
}
success = true;
this._postZoomFocusTarget = activeDescendant
}
return success
}, dispose: function dispose() {
if (this._eventManager) {
this._eventManager.dispose();
this._eventManager = null
}
this._panel = null
}
}, {animationToContent: function animationToContent(nextItem) {
var nextElement=nextItem;
var nextElementOffset=0;
var nextElementOffsetCounting=0;
var startCounting=false;
var isRTL=(window.getComputedStyle(document.body, null).direction === "rtl");
var offset=0;
while (nextElement && !WinJS.Utilities.hasClass(nextElement, "platformPanorama") && !WinJS.Utilities.hasClass(nextElement, "platformMainContent")) {
if (WinJS.Utilities.hasClass(nextElement, "platformClusterContent") || startCounting) {
nextElementOffsetCounting += nextElement.offsetLeft;
startCounting = true
}
offset = nextElement.offsetLeft;
if (isRTL) {
offset = nextElement.offsetLeft + nextElement.clientWidth;
if (nextElement.offsetParent) {
offset -= nextElement.offsetParent.clientWidth
}
}
nextElementOffset += offset;
nextElement = nextElement.offsetParent
}
if (isRTL) {
nextElementOffset = -nextElementOffset
}
var viewport=document.querySelector(".platformPanoramaViewport");
var surface=document.querySelector(".platformPanoramaSurface");
if (viewport && surface && nextElement) {
var scrollLeft=viewport.scrollLeft;
var viewportWidth=viewport.clientWidth;
var scrollMin=parseInt(viewport.currentStyle.msScrollLimitXMin);
var surfaceOffset=surface.offsetLeft;
if (nextElementOffset <= scrollLeft + viewportWidth && nextElementOffset >= scrollLeft && nextElementOffset + nextItem.clientWidth <= scrollLeft + viewportWidth && nextElementOffset + nextItem.clientWidth >= scrollLeft) {
nextItem.focus();
return
}
var status="noHero";
if (scrollMin === nextElementOffsetCounting) {
nextElementOffset = viewportWidth;
status = "toHero"
}
var animationOffset=(status === "toHero") ? nextElementOffset - (scrollLeft + viewportWidth) + scrollMin : (nextElementOffset > scrollLeft ? (nextElementOffset + nextItem.clientWidth) - (scrollLeft + viewportWidth) : nextElementOffset - scrollLeft);
if (isRTL) {
animationOffset = -animationOffset
}
var animationDuration=Math.max(Math.min(0.4 * Math.abs(animationOffset) + 60, 300), 100);
var animation=WinJS.UI.executeAnimation(surface, {
property: "-ms-transform", delay: 0, duration: animationDuration, timing: "ease-out", from: "translateX(" + (animationOffset) + "px)", to: "none"
}).then(function _PanoramaFocusManager_364() {
nextItem.focus()
});
viewport.scrollLeft = (status === "toHero") ? scrollMin : (nextElementOffset > scrollLeft ? nextElementOffset + nextItem.clientWidth - viewport.clientWidth + 20 : nextElementOffset - 20)
}
else {
nextItem.focus()
}
}})})
})();
(function _PanoramaHeaderOrchestrator_7() {
"use strict";
function show(item) {
if (item) {
var element=item.headerElement;
if (element) {
WinJS.Utilities.removeClass(element, "platformVisibilityNone")
}
}
}
function collapse(item) {
if (item) {
var element=item.headerElement;
if (element) {
WinJS.Utilities.addClass(element, "platformVisibilityNone")
}
}
}
function forward(candidate, zero) {
return candidate.offset && (!candidate.next || candidate.next.offset > zero || !candidate.next.offset)
}
function backwards(candidate, zero) {
return candidate.offset <= zero
}
WinJS.Namespace.define("CommonJS.Immersive.HeaderOrchestrator", {
headerOrchestrator: null, PanoramaHeaderOrchestrator: WinJS.Class.define(function panoramaHeaderOrchestrator_ctor(panoramaControl, panoramaPanel, panoramaHeader) {
this._panorama = panoramaControl;
this._panel = panoramaPanel;
this._header = panoramaHeader;
this._initialize()
}, {
_panorama: null, _panel: null, _header: null, _lastScroll: 0, _zoomedIn: false, _searchBoxMinimize: null, _direction: true, _nextClusterPosition: null, _eventManager: null, _initialize: function _initialize() {
var panorama=this._panorama;
var panel=this._panel;
this._eventManager = CommonJS.Utils.getEventListenerManager(this, "PanoramaHeaderOrchestrator listeners");
this._eventManager.add(panorama, "zoomchanged", this._onSemanticZoomChanged.bind(this), "panoramaHeaderOrchestrator onZoomedChanged");
this._eventManager.add(panel, "scroll", this._onScroll.bind(this), "panoramaHeaderOrchestrator onScroll");
this._eventManager.add(panel, "currentchanged", this._onCurrentChanged.bind(this), "panoramaHeaderOrchestrator onCurrentChanged");
this._eventManager.add(panel, "itemrealized", this._invalidateCheckpoints.bind(this), "panoramaHeaderOrchestrator itemrealized");
this._eventManager.add(panel, "itemremoved", this._invalidateCheckpoints.bind(this), "panoramaHeaderOrchestrator itemremoved");
this._eventManager.add(panel, "itemresized", this._onItemResized.bind(this), "panoramaHeaderOrchestrator itemresized")
}, dispose: function dispose() {
this._panorama = null;
this._panel = null;
if (this._eventManager) {
this._eventManager.dispose();
this._eventManager = null
}
if (this._header && this._header.dispose) {
this._header.dispose()
}
this._header = null
}, _onCurrentChanged: function _onCurrentChanged(event) {
var header=this._header;
var current=event.detail;
var zoomedIn=this._zoomedIn;
if (current && !zoomedIn) {
this._invalidateCheckpoints();
this._updateHeader(current)
}
else {
this._updateHeader(null, Number.POSITIVE_INFINITY);
this._nextClusterPosition = null
}
}, _onItemResized: function _onItemResized(event) {
var panel=this._panel;
var current=panel.current;
if (!current) {
return
}
var item=event.detail;
var delta=item.deltaWidth || 0;
this._invalidateCheckpoints(event);
var direction=delta <= 0;
var affectsHeader=item.index < current.index;
if (direction !== this._direction && affectsHeader) {
this._direction = direction;
this._checkForCurrent(panel.scrollPosition, direction)
}
if (item.index <= (current.index + 1)) {
var header=this._header;
var zero=panel.scrollPosition;
this._updateHeader(panel.current, zero)
}
}, _invalidateCheckpoints: function _invalidateCheckpoints() {
var panel=this._panel;
var current=panel.current;
if (!current || current.offset === null) {
return
}
var direction=this._direction;
var operator=direction ? "next" : "previous";
var nextPosition=0;
if (direction) {
var nextItem=current[operator];
nextPosition = nextItem ? (nextItem.offset ? nextItem.offset : current.offset + current.width) : Number.POSITIVE_INFINITY
}
else {
nextPosition = current.offset || 0
}
this._nextClusterPosition = nextPosition
}, _checkForCurrent: function _checkForCurrent(zero, direction) {
var header=this._header;
var panel=this._panel;
var candidate=null;
if (direction !== this._direction) {
this._direction = direction;
this._invalidateCheckpoints()
}
var nextPosition=this._nextClusterPosition;
var check=direction ? function _PanoramaHeaderOrchestrator_179_1(a, b) {
return b && a >= b
} : function _PanoramaHeaderOrchestrator_179_2(a, b) {
return b && a < b
};
if (check(zero, nextPosition)) {
candidate = panel.current;
var dir=null;
var operation=null;
if (direction) {
dir = "next";
operation = forward
}
else {
dir = "previous";
operation = backwards
}
while (candidate) {
if (operation(candidate, zero)) {
break
}
else {
if (candidate[dir]) {
candidate = candidate[dir]
}
else {
break
}
}
}
}
if (candidate) {
panel.current = candidate
}
else {
this._updateHeader(panel.current, zero)
}
}, _onScroll: function _onScroll(evt) {
var panel=this._panel;
var lastScroll=this._lastScroll;
var zero=panel.scrollPosition;
var delta=zero - lastScroll;
this._checkForCurrent(zero, delta > 0);
this.updateSearchBox();
this._lastScroll = zero
}, updateSearchBox: function updateSearchBox(heroWidth) {
var scrollPosition=this._panel.scrollPosition;
var heroVisibleWidth=null;
if (!heroWidth) {
heroVisibleWidth = CommonJS.Immersive.PlatformHeroControl.getHeroVisibleWidth()
}
else {
heroVisibleWidth = heroWidth - scrollPosition
}
if (heroVisibleWidth) {
var searchTextBox=CommonJS.processListener.getSearchBoxInstance();
if (searchTextBox) {
var searchBoxMinimize=null;
if (heroVisibleWidth < 0 || ((window.innerWidth - heroVisibleWidth) > CommonJS.Search.SEARCH_BOX_WIDTH)) {
searchBoxMinimize = false
}
else {
searchBoxMinimize = true
}
if (searchBoxMinimize !== this._searchBoxMinimize) {
searchTextBox.setupVisualState(searchBoxMinimize);
this._searchBoxMinimize = searchBoxMinimize
}
}
}
}, getScrollPosition: function getScrollPosition() {
return this._panel.scrollPosition
}, _updateHeader: function _updateHeader(current, zero) {
var header=this._header;
var color=null;
var hideTitleText=false;
var titleWidth=header.getTitleWidth();
var zoomedIn=this._zoomedIn;
var activeCluster=current;
var scrollPosition=this._panel.scrollPosition;
if (scrollPosition && current) {
if ((current.width + current.offset - titleWidth) < (scrollPosition)) {
activeCluster = current.next
}
}
if (activeCluster && activeCluster.data && activeCluster.data.hidePanoTitle) {
hideTitleText = true
}
header.setTitleState(hideTitleText);
if (!zoomedIn && current && current.data) {
if (!zero) {
zero = this._panel.scrollPosition
}
if (!zero) {
color = current.data.titleClass
}
else if (current.data.titleClass && ((current.offset + current.width) - zero) > titleWidth) {
color = current.data.titleClass
}
}
if (header.fontColor !== color) {
header.fontColor = color
}
}, _onSemanticZoomChanged: function _onSemanticZoomChanged(event) {
var panel=this._panel;
var header=this._header;
var current=panel.current;
this._zoomedIn = event.detail;
if (event.detail) {
this._updateHeader(current, Number.POSITIVE_INFINITY);
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "", "", "zoomout", PlatformJS.Utilities.getLastClickUserActionMethod(), 0)
}
else {
this._invalidateCheckpoints();
this._updateHeader(current, panel.scrollPosition)
}
}
})
})
})();
(function _PanoramaMetricsObserver_7() {
"use strict";
var NS=WinJS.Namespace.define("CommonJS.Immersive", {PanoramaMetricsObserver: WinJS.Class.define(function panoramaMetricsObserver_ctor(panoramaPanel, panoramaVirtualizer) {
this._panel = panoramaPanel;
this._virtualizer = panoramaVirtualizer;
this._initialize()
}, {
_panel: null, _virtualizer: null, _eventManager: null, _itemRealizingEventId: null, _itemRealizedCompleteEventId: null, _itemRefreshedEventId: null, _isDisposed: false, _loadedClusters: null, _refreshedClusters: null, _resizedClusters: null, _raisedRefreshStartEvent: false, _initialize: function _initialize() {
this._eventManager = CommonJS.Utils.getEventListenerManager(this, "PanoramaMetricsObserver listeners");
var panel=this._panel;
this._loadedClusters = [];
this._refreshedClusters = [];
this._viewportWidth = PlatformJS.Utilities.getDisplayData().offsetWidth;
this._itemRealizingEventId = this._eventManager.add(panel, "itemrealizing", this._onItemRealizing.bind(this));
this._itemRealizedCompleteEventId = this._eventManager.add(panel, "itemrealizedcomplete", this._onItemRealizedComplete.bind(this));
this._itemRefreshedEventId = this._eventManager.add(panel, CommonJS.Immersive.PanoramaPanelItemRefreshedEvent, this._onItemRefreshed.bind(this));
this._eventManager.add(panel, "itemresized", this._onItemResized.bind(this));
CommonJS.WindowEventManager.addResizeMetricsObserver(this)
}, beginResize: function beginResize() {
this._resizedClusters = [];
this._viewportWidth = PlatformJS.Utilities.getDisplayData().offsetWidth
}, dispose: function dispose() {
if (this._isDisposed) {
return
}
this._isDisposed = true;
CommonJS.WindowEventManager.removeResizeMetricsObserver(this);
if (this._eventManager) {
this._eventManager.dispose();
this._eventManager = null
}
this._panel = null;
this._virtualizer = null
}, _onItemRealizedComplete: function _onItemRealizedComplete(event) {
if (this._isDisposed) {
return
}
var item=event.detail;
var total=this._virtualizer._totalCount();
var clusters=this._loadedClusters;
clusters[item.index] = true;
var lastLoaded=this._lastLoaded || 0;
for (var i=lastLoaded, l=clusters.length; i < l; i++) {
if (!clusters[i]) {
break
}
else {
lastLoaded = i
}
}
var lastItem=item;
if (clusters[lastLoaded] && typeof clusters[lastLoaded].measured === "undefined") {
while (lastItem !== null && lastItem.index > lastLoaded) {
lastItem = lastItem.previous
}
while (lastItem !== null && lastItem.index < lastLoaded) {
lastItem = lastItem.next
}
if (!lastItem || !lastItem.element) {
return
}
clusters[lastLoaded] = {measured: true};
if (lastLoaded >= total) {
debugger
}
else if (lastLoaded === total - 1) {
this._writeClusterLoadMark(lastItem)
}
else if (lastItem && lastItem.element) {
var screenWidth=this._viewportWidth;
var elemOffset=typeof lastItem.offset === "number" ? lastItem.offset : lastItem.element.getOffset(),
elemWidth=typeof lastItem.width === "number" ? lastItem.width : lastItem.element.offsetWidth;
if (elemOffset > screenWidth || elemOffset + elemWidth > screenWidth) {
this._writeClusterLoadMark(lastItem)
}
}
}
}, _writeClusterLoadMark: function _writeClusterLoadMark(lastItem) {
PlatformJS.modernPerfTrack.writeStopEventWithMetadata(PlatformJS.perfTrackScenario_PanoramaVisibleClustersLoaded, "Panorama Control Visible Clusters Loaded", this._panel._element.id, true);
msWriteProfilerMark("Performance:Panorama:VisibleClustersLoaded:e");
PlatformJS.Navigation.mainNavigator.notifyPageLoadComplete();
PlatformJS.mainProcessManager.afterFirstView();
this._eventManager.remove(this._itemRealizedCompleteEventId);
this._writeTimeToRefreshBeginMark(lastItem)
}, _writeTimeToRefreshBeginMark: function _writeTimeToRefreshBeginMark(lastItem) {
PlatformJS.modernPerfTrack.writeStartEvent(PlatformJS.perfTrackScenario_TimeToRefresh, "Time To Refresh", null);
this._raisedRefreshStartEvent = true;
if (!this._isOperationPending(this._refreshedClusters, lastItem.index)) {
this._raiseRefreshCompleteEvent()
}
}, _isOperationPending: function _isOperationPending(states, lastItemIndex) {
for (var i=0; i <= lastItemIndex; i++) {
if (!states[i]) {
return true
}
}
return false
}, _onItemRealizing: function _onItemRealizing(event) {
if (this._isDisposed) {
return
}
var item=event.detail;
this._loadedClusters[item.index] = false;
this._refreshedClusters[item.index] = false;
if (!item.winControl || !item.winControl.supportsContentRefresh) {
this._refreshedClusters[item.index] = true
}
}, _onItemRefreshed: function _onItemRefreshed(event) {
if (this._isDisposed) {
return
}
var item=event.detail.clusterItem;
this._refreshedClusters[item.index] = true;
if (!this._raisedRefreshStartEvent) {
return
}
var currentItem=this._findLastVisibleElement(item);
var currentIndex=currentItem.index;
if (!this._isOperationPending(this._refreshedClusters, currentIndex)) {
this._raiseRefreshCompleteEvent()
}
}, _onItemResized: function _onItemResized(event) {
if (this._isDisposed || this._resizedClusters === null) {
return
}
var item=event.detail;
this._resizedClusters[item.index] = true;
var currentItem=this._findLastVisibleElement(item);
var currentIndex=currentItem.index;
if (!this._isOperationPending(this._resizedClusters, currentIndex)) {
CommonJS.WindowEventManager.onResizeCompleted(this);
this._resizedClusters = null
}
}, _raiseRefreshCompleteEvent: function _raiseRefreshCompleteEvent() {
if (this._isDisposed) {
return
}
PlatformJS.modernPerfTrack.writeStopEventWithMetadata(PlatformJS.perfTrackScenario_TimeToRefresh, "Time To Refresh", null, false);
this._eventManager.remove(this._itemRefreshedEventId);
this._eventManager.remove(this._itemRealizingEventId)
}, _findLastVisibleElement: function _findLastVisibleElement(item) {
var currentItem=item;
var screenWidth=this._viewportWidth;
while (currentItem.next) {
if (currentItem.element) {
var elemOffset=typeof currentItem.offset === "number" ? currentItem.offset : currentItem.element.getOffset(),
elemWidth=typeof currentItem.width === "number" ? currentItem.width : currentItem.element.offsetWidth;
if (elemOffset >= screenWidth || elemOffset + currentItem.element.offsetWidth >= screenWidth) {
break
}
}
currentItem = currentItem.next
}
return currentItem
}
})})
})();
(function _PanoramaPanel_6() {
var ViewportPriority={
snappedLeftSide: 500, onScreen: 100, nearScreen: 50, offScreen: 0
},
calcVisibility=function(panel, item) {
var visibilityPriority=0,
displayData=PlatformJS.Utilities.getDisplayData();
if (panel && panel._viewport && item && item.element) {
var position=panel._scrollPosition,
width=displayData.clientWidth,
start=item.offset,
end=(start + item.width);
if (end >= position && start <= position + width) {
visibilityPriority = ViewportPriority.onScreen
}
else {
var dist=(end < position) ? position - end : start - (position + width);
visibilityPriority = (dist < width / 2) ? ViewportPriority.nearScreen : ViewportPriority.offScreen
}
return visibilityPriority + (1.0 / (start > 0 ? start : 1))
}
else {
return 0
}
};
var VisibilityManager=WinJS.Class.define(function VisibilityManager_ctor(panel, item, id) {
this._id = id;
this._panel = panel;
this._item = item;
this._priority = 0
}, {
_initialized: false, _panel: null, _item: null, _isVisible: false, _priority: 0, traceEnabled: false, isVisible: {get: function get() {
if (!this._initialized) {
this.recalcVisibility()
}
return this._isVisible
}}, priority: {get: function get() {
if (!this._initialized) {
this.recalcVisibility()
}
return this._priority
}}, item: {get: function get() {
return this._item
}}, dispose: function dispose() {
this._id = this._id + "(disposed)";
this._panel = null;
this._item = null;
this._isVisible = false;
this._priority = 0
}, recalcVisibility: function recalcVisibility() {
var priority=this._priority;
this._priority = calcVisibility(this._panel, this._item);
this._isVisible = this._priority >= ViewportPriority.onScreen;
if (this.traceEnabled && PlatformJS.isDebug && priority !== this._priority) {
console.log("Change  priority = {2} -> {3}   {0} V({1})".format(this._id, this._isVisible, priority, this._priority))
}
}
});
var NS=WinJS.Namespace.define("CommonJS.Immersive", {
CachedWidthManager: WinJS.Class.define(function CachedWidthManager_ctor() {
this._load();
this._displayData = PlatformJS.Utilities.getDisplayData();
this._defaultWidths = [{
label: "nextsteps", landscape: 375, portrait: 375
}, {
label: "tempcluster", landscape: 360, portrait: 360
}, {
label: "adswrappercontrol", landscape: 300, portrait: 300
}, {
label: "toolscluster", landscape: 340, portrait: 340
}, {
label: "acrossmarketcluster", landscape: 720, portrait: 720
}, {
label: "sources", landscape: 620, portrait: 310
}, {
label: "CategoryControl", landscape: 930, portrait: 930
}, {
label: "NewsMergedCluster", landscape: 930, portrait: 930
}, {
label: "hero", landscape: "87vw", portrait: "100vw"
}, ];
this._updateBootCacheDelayer = new CommonJS.Utils.Delayer(this._save, CommonJS.Immersive.CachedWidthManager._SAVE_DELAY_INTERVAL, this)
}, {
_cache: null, _displayData: null, _updateBootCacheTimer: null, _defaultWidths: null, _save: function _save() {
var serializedCache=JSON.stringify(this._cache);
PlatformJS.BootCache.instance.addOrUpdateEntry(CommonJS.Immersive.CachedWidthManager._BOOTCACHEKEY, serializedCache)
}, _load: function _load() {
var serializedCache=PlatformJS.BootCache.instance.getEntry(CommonJS.Immersive.CachedWidthManager._BOOTCACHEKEY, function _PanoramaPanel_35() {
return "{}"
});
if (serializedCache) {
try {
this._cache = JSON.parse(serializedCache)
}
catch(e) {
this._cache = {}
}
}
;
}, _buildKey: function _buildKey(panoramaPanelId, controlname, itemId) {
if (!panoramaPanelId || !controlname || !itemId) {
console.error("no panoramaPanelId or controlname or itemId to build cluster key");
debugger
}
var value=panoramaPanelId + ":" + controlname + ":" + itemId + ":" + this._displayData.outerWidth + ":" + this._displayData.outerHeight + ":" + this._displayData.orientation + ":" + this._displayData.scale;
value = value.toLowerCase();
return value
}, _defaultWidth: function _defaultWidth(key) {
key = key.toLowerCase();
for (var i=0; i < this._defaultWidths.length; i++) {
var value=this._defaultWidths[i];
if (key.indexOf(value.label.toLowerCase()) > -1) {
if (this._displayData.landscape) {
return value.landscape
}
return value.portrait
}
}
return this._displayData.clientWidth
}, _updateBootCacheDelayer: null, getWidth: function getWidth(panoramaPanelId, controlname, itemId, width) {
if (!this._cache) {
this._load()
}
;
var key=this._buildKey(panoramaPanelId, controlname, itemId);
var currentValue=this._cache[key];
var width=width || currentValue || this._defaultWidth(key);
if (currentValue !== width) {
this._cache[key] = width;
this._updateBootCacheDelayer.delay()
}
return width
}
}, {
_instanceHandle: null, _BOOTCACHEKEY: "CachedWidthManager", _SAVE_DELAY_INTERVAL: 10000, instance: {get: function get() {
if (!CommonJS.Immersive.CachedWidthManager._instanceHandle) {
CommonJS.Immersive.CachedWidthManager._instanceHandle = new CommonJS.Immersive.CachedWidthManager
}
return CommonJS.Immersive.CachedWidthManager._instanceHandle
}}
}), WidthUpdater: WinJS.Class.define(function WidthUpdaterCtor(panel) {
this._panel = panel;
this._unlockQueue = [];
this._beforeFirstViewQueue = [];
if (!CommonJS.Immersive.WidthUpdater._isAfterFirstView) {
this._afterFirstViewHandler = PlatformJS.mainProcessManager.addAfterFirstViewListener(this.afterFirstView.bind(this))
}
}, {
afterFirstView: function afterFirstView(e) {
CommonJS.Immersive.WidthUpdater._isAfterFirstView = true;
if (this._beforeFirstViewQueue.length) {
this._beforeFirstViewQueue.forEach(this._delayUnlock.bind(this))
}
this._beforeFirstViewQueue = []
}, updateItemWidth: function updateItemWidth(item) {
if (!item) {
return
}
var cachedWidthManager=CommonJS.Immersive.CachedWidthManager.instance,
width=cachedWidthManager.getWidth(item.panoramaPanelId, item.controlname, item.key, item.width),
element=item.element;
if (width) {
if (typeof width === "string") {
if (width.indexOf("vw") > -1) {
element.style.width = width;
item.width = parseInt(PlatformJS.Utilities.getDisplayData().clientWidth * parseFloat(width) / 100.0)
}
else if (width === "auto") {
element.style.width = width;
item.width = 0
}
}
else {
element.style.width = width + "px";
item.width = width
}
}
else {
debugger
}
item.marginLeft = CommonJS.isRtl() ? CommonJS.getDimension(element, "marginRight") : CommonJS.getDimension(element, "marginLeft");
item.marginRight = CommonJS.isRtl() ? CommonJS.getDimension(element, "marginLeft") : CommonJS.getDimension(element, "marginRight");
if (item.marginLeft === 0 && item.marginRight === 0) {
console.warn("Please check the margins of cluster " + item.key + ", make sure the margins are set when the page is load.")
}
item.outerWidth = item.marginLeft + item.width + item.marginRight;
item.fixedWidth = true;
this.updateItemOffset(item);
return this
}, updateItemOffset: function updateItemOffset(item, offset) {
if (typeof offset === "number") {
item.offset = offset
}
else {
this._calculateItemOffset(item)
}
return this
}, unlockWidth: function unlockWidth(item) {
if (!CommonJS.Immersive.WidthUpdater._isAfterFirstView) {
this._beforeFirstViewQueue.push(item)
}
else {
this._unlockImple(item)
}
}, dispose: function dispose() {
PlatformJS.mainProcessManager.removeAfterFirstViewListener(this._afterFirstViewHandler);
if (this._unlockQueueTimer) {
clearTimeout(this._unlockQueueTimer);
this._unlockQueueTimer = null
}
this._unlockQueue = [];
this._beforeFirstViewQueue = [];
CommonJS.Immersive.WidthUpdater._isAfterFirstView = true
}, _panel: null, _afterFirstViewHandler: null, _beforeFirstViewQueue: null, _unlockQueue: null, _unlockQueueTimer: null, _unlockQueueCallback: function _unlockQueueCallback() {
var visibleItems=[],
thisCalcVisibility=calcVisibility.bind(null, this._panel);
this._unlockQueue.forEach(function filterVisibleItems(item, index) {
if (this._isVisible(item)) {
visibleItems.unshift(index)
}
}, this);
if (visibleItems.length) {
visibleItems.forEach(function unlockVisibleItems(itemIndex) {
this._unlockImple(this._unlockQueue[itemIndex]);
this._unlockQueue.splice(itemIndex, 1)
}, this)
}
else {
var itemIndex=this._unlockQueue.reduce(function findItem(previous, item, index, array) {
if (thisCalcVisibility(array[previous]) < thisCalcVisibility(item)) {
return index
}
else {
return previous
}
}, 0);
this._unlockImple(this._unlockQueue[itemIndex]);
this._unlockQueue.splice(itemIndex, 1)
}
if (this._unlockQueue.length) {
this._unlockQueueTimer = setTimeout(this._unlockQueueCallback.bind(this), 500)
}
else {
this._unlockQueueTimer = null
}
}, _delayUnlock: function _delayUnlock(item) {
if (!CommonJS.commonSchedulerEnabled) {
this._unlockQueue.push(item);
if (!this._unlockQueueTimer) {
this._unlockQueueTimer = setTimeout(this._unlockQueueCallback.bind(this), 1000)
}
}
else {
CommonJS.Scheduler.schedule(this._unlockImple.bind(this, item), function unlockWidthSchedulerPriority() {
return calcVisibility.bind(null, this._panel, item) - ViewportPriority.onScreen
}.bind(this), item.key + "_unlockWidth")
}
}, _unlockImple: function _unlockImple(item) {
if (!item.isZombie && item.element && item.fixedWidth) {
item.element.style.width = "auto";
item.fixedWidth = false
}
}, _isVisible: function _isVisible(item) {
return calcVisibility(this._panel, item) >= ViewportPriority.onScreen
}, _calculateItemOffset: function _calculateItemOffset(item) {
var offsetFromPrevious=0;
if (typeof item.offset !== "number") {
if (item.previous) {
offsetFromPrevious = this._calculateItemOffset(item.previous)
}
else {
var surfaceSizer=CommonJS.Immersive.SurfaceSizeObserver.getCurrentInstance();
if (surfaceSizer) {
offsetFromPrevious = surfaceSizer.surfaceMargin
}
else {
debugger;
offsetFromPrevious = 0
}
}
item.offset = offsetFromPrevious + item.marginLeft
}
if (item.isZombie) {
return item.offset - item.marginLeft
}
else {
if (typeof item.width !== "number") {
this.updateItemWidth(item)
}
return item.offset + item.width + item.marginRight
}
}, _updateNextOffset: function _updateNextOffset(item, delta) {
if (item.offset) {
item.offset += delta
}
if (item.next && item.next.offset) {
this._updateNextOffset(item.next, delta)
}
}
}, {_isAfterFirstView: false}), ClusterControlRefreshedEvent: "contentrefreshed", PanoramaPanelItemRefreshedEvent: "itemrefreshed", PanoramaPanel: WinJS.Class.mix(WinJS.Class.define(function panoramaPanel_ctor(element, options) {
options = options || {};
this._element = element;
this._eventManager = CommonJS.Utils.getEventListenerManager(this, "PanoramaPanel listeners");
CommonJS.setAutomationId(element);
element.setAttribute("aria-label", element.id);
element.winControl = this;
CommonJS.Utils.markDisposable(element);
Object.defineProperties(this, WinJS.Utilities.createEventProperties("scroll"));
Object.defineProperties(this, WinJS.Utilities.createEventProperties("itemrealized"));
Object.defineProperties(this, WinJS.Utilities.createEventProperties("itemrealizing"));
Object.defineProperties(this, WinJS.Utilities.createEventProperties("itemrealizedcomplete"));
Object.defineProperties(this, WinJS.Utilities.createEventProperties("itemanimationcomplete"));
Object.defineProperties(this, WinJS.Utilities.createEventProperties("itemsrealizedcomplete"));
Object.defineProperties(this, WinJS.Utilities.createEventProperties(CommonJS.Immersive.PanoramaPanelItemRefreshedEvent));
Object.defineProperties(this, WinJS.Utilities.createEventProperties("itemresized"));
Object.defineProperties(this, WinJS.Utilities.createEventProperties("itemremoved"));
Object.defineProperties(this, WinJS.Utilities.createEventProperties("currentchanged"));
this._schedulers = [];
this._initialize(options)
}, {
_disposed: false, _schedulers: null, _isScrolling: false, _current: null, _lastScrollTimeStamp: null, _scrollPosition: 0, _targetScrollPosition: null, showInertiaBackground: false, _compactPanorama: false, _zeroOffsetSnapPoints: false, _progress: 0, _scrollDoneDelayer: null, _verticalScrollDelayer: null, _element: null, _surface: null, _viewport: null, _halo: null, _imageBleed: null, _dragSource: null, _dragSourceContainers: null, _autoScrollDelay: null, _autoScrollFrame: null, _lastDragTimeout: null, _zombieClusters: null, _widthUpdater: null, current: {
get: function get() {
return this._current
}, set: function set(value) {
if (value !== this._current) {
this._current = value;
this.dispatchEvent("currentchanged", value)
}
}
}, scrollPosition: {get: function get() {
return this._scrollPosition
}}, compactPanorama: {
get: function get() {
return this._compactPanorama
}, set: function set(value) {
this._compactPanorama = value
}
}, zeroOffsetSnapPoints: {
get: function get() {
return this._zeroOffsetSnapPoints
}, set: function set(value) {
this._zeroOffsetSnapPoints = value
}
}, _initialize: function _initialize(options) {
var element=this._element;
WinJS.Utilities.addClass(element, "platformPanorama");
this._setThemeColor();
var viewport=this._viewport = document.createElement("div");
viewport.className = "platformPanoramaViewport";
var appTitle=PlatformJS.BootCache.instance.getEntry("app.title", function _PanoramaPanel_286() {
return PlatformJS.Services.resourceLoader.getString("/platform/AppTitle")
});
viewport.setAttribute("aria-label", appTitle);
viewport.setAttribute("aria-hidden", "false");
viewport.setAttribute("id", appTitle);
element.appendChild(viewport);
this._eventManager.add(viewport, "scroll", this._onSurfaceScroll.bind(this));
this._eventManager.add(viewport, "wheel", this._onMouseWheel.bind(this));
this._eventManager.add(window, "mousewheel", this._onWindowScroll.bind(this));
var header=this._header = document.querySelector(".immersiveHeader");
if (header) {
header.parentNode.removeChild(header);
viewport.appendChild(header)
}
var surface=this._surface = document.createElement("div");
surface.className = "platformPanoramaSurface platformHideableContent";
viewport.appendChild(surface);
var imageBleed=this._imageBleed = document.createElement("div");
imageBleed.className = "platformImageBleed";
var halo=this._halo = document.createElement("div");
halo.className = "platformPanoramaHalo";
this._dragSourceContainers = {containersCount: 0};
this._scrollDoneDelayer = new CommonJS.Utils.Delayer(function panoramaPanel_scrollDoneTimer() {
if (this._viewport) {
this._isScrolling = false;
this._updateClusterVisibility();
this.dispatchEvent("scroll");
this._logTelemetryPanoViewed()
}
}, 250, this);
this._verticalScrollDelayer = new CommonJS.Utils.Delayer(function verticalScrollDetectTimer() {
CommonJS.Immersive.PanoramaPanel.isScrollCurrentTargetPanorama = false
}, CommonJS.Immersive.PanoramaPanel.verticalScrollDelay, this);
this._zombieClusters = {};
this._widthUpdater = new CommonJS.Immersive.WidthUpdater(this)
}, _setThemeColor: function _setThemeColor() {
var styleSheets=document.styleSheets;
var themeColor=null;
for (var i=0, l=styleSheets.length; i < l; i++) {
var styleSheet=styleSheets[i];
if (styleSheet.href && styleSheet.href.match("ui-light.css") && !styleSheet.disabled) {
themeColor = "platformPanoramaLight"
}
else if (styleSheet.href && styleSheet.href.match("ui-dark.css") && !styleSheet.disabled) {
themeColor = "platformPanoramaDark"
}
}
if (themeColor) {
WinJS.Utilities.addClass(this._element, themeColor)
}
}, dispose: function dispose() {
if (!this._disposed) {
this._disposed = true;
if (this._schedulers) {
for (var i=this._schedulers.length - 1; i >= 0; i--) {
var scheduler=this._schedulers[i];
if (scheduler && scheduler.dispose) {
scheduler.dispose()
}
}
this._schedulers.length = 0
}
if (this._scrollDoneDelayer) {
this._scrollDoneDelayer.dispose();
this._scrollDoneDelayer = null
}
if (this._eventManager) {
this._eventManager.dispose();
this._eventManager = null
}
if (this._dragoverEventId) {
CommonJS.stopAutoScroll()
}
var viewport=this._viewport;
if (viewport) {
WinJS.Utilities.disposeSubTree(viewport);
this._element.removeChild(viewport);
this._viewport = null
}
if (this._widthUpdater) {
this._widthUpdater.dispose();
this._widthUpdater = null
}
this._createOrchestrator = null;
this._surface = null;
this._halo = null;
this._imageBleed = null;
this._header = null;
this._current = null;
this._dragSource = null;
this._dragSourceContainers = null;
this._element.winControl = null;
this._element = null
}
}, realizeItems: function realizeItems(items, scrollPosition) {
var that=this,
promises=[];
this._createElements(items);
var queue=this._rankRealization(items, scrollPosition);
for (var i=0, ilen=queue.length; i < ilen; i++) {
var item=queue[i];
var renderPromise=this._realizeItem(item);
promises.push(renderPromise)
}
if (scrollPosition) {
this.scrollTo(scrollPosition)
}
return WinJS.Promise.join(promises).then(function panoramaPanel_renderPromiseJoinComplete() {
that.dispatchEvent("itemsrealizedcomplete", promises.length)
}, function panoramaPanel_renderPromiseJoinError() {
that.dispatchEvent("itemsrealizedcomplete", promises.length)
})
}, realizeItem: function realizeItem(item) {
this._createElements([item]);
return this._realizeItem(item)
}, removeItem: function removeItem(item) {
this._removeZombieItem(item);
this.disposeItem(item);
item.itemremoved = true;
this.dispatchEvent("itemremoved", item);
if (item === this.current) {
if (item.next) {
this.current = item.next
}
else if (item.previous) {
this.current = item.previous
}
else {
this.current = null
}
}
}, disposeItem: function disposeItem(item) {
var eventManager=this._eventManager;
if (eventManager) {
if (item._headerboundsEventId) {
eventManager.remove(item._headerboundsEventId);
item._headerboundsEventId = null
}
if (item._contentboundsEventId) {
eventManager.remove(item._contentboundsEventId);
item._contentboundsEventId = null
}
var headerElementLink=item.headerElementLink;
if (headerElementLink) {
eventManager.remove(item._headerElementLinkClickEventId);
eventManager.remove(item._headerElementKeyDownEventId)
}
if (item._ClusterControlRefreshedEventId) {
eventManager.remove(item._ClusterControlRefreshedEventId)
}
if (item._mselementresizeEventId) {
eventManager.remove(item._mselementresizeEventId)
}
}
var winControl=item.winControl;
if (winControl) {
item.winControl = null;
if (winControl.scheduler) {
winControl.scheduler = null
}
if (winControl.dispose) {
winControl.dispose()
}
}
if (item.element) {
if (item.element.parentNode) {
item.element.parentNode.removeChild(item.element)
}
item.element = null
}
item.contentElement = null;
item.headerElement = null;
if (item.scheduler) {
if (this._schedulers) {
var index=this._schedulers.indexOf(item.scheduler);
if (index > -1) {
this._schedulers.splice(index, 1)
}
}
item.scheduler.dispose();
item.scheduler = null
}
}, addZombieItem: function addZombieItem(item) {
this._zombieClusters[item.handle] = item
}, _removeZombieItem: function _removeZombieItem(item) {
this._zombieClusters[item.handle] = null
}, _getZombieElemntsCount: function _getZombieElemntsCount() {
var result=0;
for (var key in this._zombieClusters) {
var item=this._zombieClusters[key];
if (item && item.element) {
result++
}
}
return result
}, _createElements: function _createElements(items) {
if (this._disposed) {
return
}
var surface=this._surface;
if (surface) {
for (var i=0, ilen=items.length; i < ilen; i++) {
var item=items[i];
if (!this._zombieClusters[item.handle] && !item.element) {
var element=this._createElement(item),
zombieCount=this._getZombieElemntsCount();
if (item.index > (surface.children.length - 2 - zombieCount)) {
surface.appendChild(element)
}
else {
var siblingItem=item.next,
siblingElement=null,
inserted=false;
while (!inserted && siblingItem) {
siblingElement = siblingItem.element;
if (siblingElement) {
surface.insertBefore(element, siblingElement);
inserted = true
}
else {
siblingItem = siblingItem.next
}
}
siblingItem = item.previous;
while (!inserted && siblingItem) {
siblingElement = siblingItem.element;
if (siblingElement) {
surface.insertBefore(element, siblingElement.nextSibling);
inserted = true
}
else {
siblingItem = siblingItem.previous
}
}
if (!inserted) {
debugger;
surface.appendChild(element)
}
}
this._widthUpdater.updateItemWidth(item);
this.dispatchEvent("itemrealized", item)
}
}
}
}, _createElement: function _createElement(item) {
var that=this;
var panoramaItem=item.data;
var element=item.element = document.createElement("div");
element.setAttribute("role", "region");
element.id = panoramaItem.clusterContent.contentControl + "_" + item.key;
element.className = "platformCluster";
CommonJS.setAutomationId(element, "platformCluster" + item.key);
if (element.id.toLowerCase().indexOf("hero") > -1) {
WinJS.Utilities.addClass(element, "platformHero")
}
var panoramaPanelId=this._element.id;
item.panoramaPanelId = panoramaPanelId;
item.controlname = panoramaItem.clusterContent.contentControl;
var itemResizedHandler=function(evt) {
that._updateClusterVisibility();
if (item.itemrealizedcomplete && !item.itemremoved) {
that.dispatchEvent("itemresized", item)
}
};
item._mselementresizeEventId = this._eventManager.add(item.element, "mselementresize", itemResizedHandler);
var headerElement=item.headerElement = document.createElement("h2");
headerElement.setAttribute("role", "heading");
if (panoramaItem.titleClass) {
WinJS.Utilities.addClass(headerElement, panoramaItem.titleClass)
}
if (!panoramaItem.clusterKey) {
PlatformJS.Utilities.onError("Cluster Key cannot be null");
return element
}
CommonJS.setAutomationId(headerElement, element, "", panoramaItem.clusterKey);
element.setAttribute("aria-labelledby", headerElement.id);
WinJS.Utilities.addClass(headerElement, "platformClusterHeader");
if (panoramaItem.hideTitle) {
WinJS.Utilities.addClass(headerElement, "platformClusterNoHeader")
}
if (panoramaItem.onHeaderSelection) {
var headerElementLink=item.headerElementLink = document.createElement("div");
headerElementLink.tabIndex = 0;
headerElementLink.innerText = panoramaItem.clusterTitle || "";
headerElementLink.setAttribute("role", "link");
PlatformJS.Utilities.enablePointerUpDownAnimations(headerElementLink);
headerElement.appendChild(headerElementLink);
var moreIndicator=document.createElement("span");
moreIndicator.className = "platformClusterHeaderMoreIcon";
headerElementLink.appendChild(moreIndicator);
var headerElementLinkClick=function(event) {
panoramaItem.onHeaderSelection(panoramaItem.clusterKey, item.index, that);
PlatformJS.deferredTelemetry(function _PanoramaPanel_661() {
PlatformJS.Services.instrumentation.incrementInt32(Platform.Instrumentation.InstrumentationDataSetId.platform, Platform.Instrumentation.InstrumentationDataPointId.totalClusterHeaderTappedCount, 1);
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Cluster", panoramaItem.clusterTitle, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, event.type === "keydown" ? Microsoft.Bing.AppEx.Telemetry.UserActionMethod.keyboard : PlatformJS.Utilities.getLastClickUserActionMethod(), 0)
})
};
var headerElementNav=function(event, direction) {
event.stopImmediatePropagation();
event.preventDefault();
var e=document.createEvent("CustomEvent");
e.initCustomEvent("headerbounds", false, false, {
item: item, direction: direction
});
headerElement.dispatchEvent(e)
};
var headerElementKeyDown=function(event) {
switch (event.keyCode) {
case(WinJS.Utilities.Key.enter):
headerElementLinkClick(event);
break;
case(WinJS.Utilities.Key.space):
headerElementLinkClick(event);
break;
case(WinJS.Utilities.Key.upArrow):
headerElementNav(event, "up");
break;
case(WinJS.Utilities.Key.downArrow):
headerElementNav(event, "down");
break;
case(WinJS.Utilities.Key.leftArrow):
headerElementNav(event, "left");
break;
case(WinJS.Utilities.Key.rightArrow):
headerElementNav(event, "right");
break;
default:
break
}
};
item._headerElementLinkClickEventId = this._eventManager.add(headerElementLink, "click", headerElementLinkClick);
item._headerElementKeyDownEventId = this._eventManager.add(headerElementLink, "keydown", headerElementKeyDown)
}
else {
if (panoramaItem.supressTitleInHeader) {
headerElement.innerText = ""
}
else {
headerElement.innerText = panoramaItem.clusterTitle || "";
WinJS.Utilities.addClass(headerElement, "platformClusterHeaderNoLink")
}
}
element.appendChild(headerElement);
var contentElement=item.contentElement = document.createElement("div");
contentElement.id = (panoramaItem.clusterContent.contentControl + "_" + item.key + ".Content").replace(/\.| /g, "_");
contentElement.className = "platformClusterContent";
if (panoramaItem.itemMode === NS.Panorama.PanoramaItemMode.fullBleed) {
WinJS.Utilities.addClass(contentElement, "platformHeroCluster")
}
element.appendChild(contentElement);
if (PlatformJS.isDebug) {
var indicatorElement=document.createElement("div");
indicatorElement.className = "platformClusterPerformanceIndicator";
element.appendChild(indicatorElement);
if (panoramaItem.uiName) {
WinJS.Utilities.addClass(headerElement, "platformNTLClusterHeader");
PlatformJS.Utilities.enablePointerUpDownAnimations(headerElement);
PlatformJS.Utilities.registerItemClickProxy(headerElement, function _PanoramaPanel_733(domElement) {
return true
}, function _PanoramaPanel_735() {
var event=document.createEvent("CustomEvent");
event.initCustomEvent("headerinvoked", true, true, {
header: headerElement, uiName: panoramaItem.uiName
});
headerElement.dispatchEvent(event)
}, {actionContext: "Panorama"})
}
}
return element
}, _rankRealization: function _rankRealization(items, offset) {
if (!offset) {
return items
}
var output=[];
var firstIndex=0;
var i=0,
ilen=0;
for (i = 0, ilen = items.length; i < ilen; i++) {
var item=items[i];
if (item.offset <= offset && (!item.next || (item.next && item.next.offset > offset))) {
firstIndex = i;
break
}
}
for (i = firstIndex, ilen = items.length; i < ilen; i++) {
output.push(items[i])
}
for (i = (firstIndex - 1), ilen = -1; i > ilen; i--) {
output.push(items[i])
}
return output
}, _realizeItem: function _realizeItem(item) {
var that=this,
element=item.element,
panoramaItem=item.data,
itemDefinition=panoramaItem.clusterContent,
timestamp=null;
if (!element) {
return WinJS.Promise.wrap(null)
}
if (!this.current) {
this.current = item
}
item.realizeItemStartTime = (new Date).getTime();
var contentElement=item.contentElement,
headerElement=item.headerElement;
var renderPromise=null;
if (itemDefinition.contentControl) {
if (!panoramaItem.clusterKey) {
PlatformJS.Utilities.onError("Cluster Key cannot be null")
}
else {
element.id = (itemDefinition.contentControl + "_" + panoramaItem.clusterKey).replace(/\.| /g, "_");
var visibilityManager=new VisibilityManager(this, item, element.id);
var priorityModifierFn=function() {
return visibilityManager.priority
};
var scheduler=this._createOrchestrator(item, priorityModifierFn, visibilityManager, element.id);
item.scheduler = scheduler;
this._schedulers.push(scheduler);
var contentControl=itemDefinition.contentControl;
if (contentControl === "PlatformJS.Ads.AdsWrapperControl") {
var replaceControl=this._isSemanticZoomPanoramaPanel && !PlatformJS.mainProcessManager.isSemanticZoomFinished;
replaceControl = replaceControl || !PlatformJS.isPlatformInitialized;
contentControl = "PlatformJS.Ads.DelayedAdsWrapperControl";
itemDefinition.contentOptions.isInSemanticZoomPanoramaPanel = this._isSemanticZoomPanoramaPanel
}
var winControl=item.winControl = PlatformJS.Utilities.createObject(contentControl, contentElement, itemDefinition.contentOptions, scheduler);
if (!winControl) {
if (PlatformJS.isDebug) {
throw"Invalid cluster type metadata";
}
else {
winControl = {}
}
}
if (CommonJS.commonSchedulerEnabled || CommonJS.alwaysPassOnScheduler) {
winControl.scheduler = scheduler
}
if (winControl.supportsContentRefresh) {
item._ClusterControlRefreshedEventId = this._eventManager.add(winControl, CommonJS.Immersive.ClusterControlRefreshedEvent, function clusterControl_onContentRefreshed(event) {
that.dispatchEvent(CommonJS.Immersive.PanoramaPanelItemRefreshedEvent, {
clusterItem: item, newContent: event.detail
})
})
}
if (winControl.render) {
renderPromise = WinJS.Promise.timeout().then(function renderControl() {
var id=itemDefinition.contentControl + ":" + panoramaItem.clusterKey;
msWriteProfilerMark("Platform:Panorama:realizeItem:" + itemDefinition.contentControl + ":s");
that.dispatchEvent("itemrealizing", item);
timestamp = (new Date).getTime();
return WinJS.Promise.wrap(winControl.render()).then(function _PanoramaPanel_859(results) {
return WinJS.Promise.wrap(results)
})
})
}
else {
timestamp = (new Date).getTime();
renderPromise = WinJS.Promise.wrap(null)
}
}
}
else {
PlatformJS.Utilities.onError("Require content control property")
}
item._contentboundsEventId = this._eventManager.add(contentElement, "contentbounds", function panoramaPanel_onContentBounds(event) {
if (event.detail.direction) {
that.dispatchEvent("itembounds", {
item: item, direction: event.detail.direction, content: true
})
}
});
item._headerboundsEventId = this._eventManager.add(headerElement, "headerbounds", function panoramaPanel_onHeaderBounds(event) {
if (event.detail.direction) {
that.dispatchEvent("itembounds", {
item: item, direction: event.detail.direction, header: true
})
}
});
var clusterAnimationEnabled=!(contentElement.winControl && contentElement.winControl.disableAnimation);
clusterAnimationEnabled = clusterAnimationEnabled && PlatformJS.isAppBootComplete;
if (clusterAnimationEnabled) {
contentElement.style.opacity = 0
}
return renderPromise.then(function panoramaPanel_renderRealizeItemComplete() {
if (!that._disposed) {
if (clusterAnimationEnabled) {
if (winControl.scheduler) {
winControl.scheduler.recalcVisibility();
clusterAnimationEnabled = winControl.scheduler.isVisible
}
}
if (clusterAnimationEnabled) {
WinJS.UI.Animation.enterContent(contentElement, null).done(function panoramaPanel_renderAnimateItemComplete() {
if (!that._disposed) {
that.dispatchEvent("itemanimationcomplete", item)
}
})
}
else {
contentElement.style.opacity = 1
}
if (PlatformJS.isDebug && element.children.length > 2) {
var delta=(new Date).getTime() - timestamp;
element.children[2].innerText = delta + "ms"
}
msWriteProfilerMark("Platform:Panorama:realizeItem:" + itemDefinition.contentControl + ":e");
item.realizeItemEndTime = (new Date).getTime();
item.itemrealizedcomplete = true;
that.dispatchEvent("itemrealizedcomplete", item);
that._widthUpdater.unlockWidth(item)
}
})
}, scrollToWithAnimation: function scrollToWithAnimation(offset, item, panoramaFocusManager) {
if (!this._isScrolling && this._viewport) {
var scrollMin=parseInt(this._viewport.currentStyle.msScrollLimitXMin);
if (offset < scrollMin) {
offset = scrollMin
}
else if (offset > this._viewport.scrollWidth) {
offset = this._viewport.scrollWidth
}
this._targetScrollPosition = offset;
this._scrollPosition = offset;
var scrollLeft=this._viewport.scrollLeft;
var animationOffset=offset - scrollLeft;
var animationDuration=Math.max(Math.min(0.4 * Math.abs(animationOffset) + 60, 300), 100);
var animation=WinJS.UI.executeAnimation(this._surface, {
property: "-ms-transform", delay: 0, duration: animationDuration, timing: "ease", from: "translateX(" + (animationOffset) + "px)", to: "none"
}).then(function _PanoramaPanel_949() {
panoramaFocusManager.setFocusToContent(item, true)
});
this._viewport.scrollLeft = offset
}
}, scrollTo: function scrollTo(offset) {
if (!this._isScrolling && this._viewport) {
var scollPositionLimit=this._viewport.scrollWidth - PlatformJS.Utilities.getDisplayData().clientWidth;
if (offset < 0) {
offset = 0
}
else if (offset > scollPositionLimit) {
offset = scollPositionLimit
}
this._targetScrollPosition = offset;
this._scrollPosition = offset;
this._viewport.scrollLeft = offset
}
}, detach: function detach() {
var surface=this._surface;
if (surface) {
for (var i=0, ilen=surface.children.length; i < ilen; i++) {
var child=surface.children[i];
child.onresize = null
}
}
}, clear: function clear() {
var surface=this._surface;
if (surface) {
for (var i=0, ilen=surface.children.length; i < ilen; i++) {
var child=surface.children[i];
child.onresize = null
}
surface.innerHTML = "";
surface.appendChild(this._imageBleed);
this._zombieClusters = {};
this.current = null
}
}, _updateClusterVisibility: function _updateClusterVisibility() {
var i,
len,
updated=[];
for (i = 0, len = this._schedulers.length; i < len; i++) {
var scheduler=this._schedulers[i];
if (scheduler && scheduler.recalcVisibility) {
if (scheduler.recalcVisibility()) {
updated.push(scheduler)
}
}
}
for (i = 0, len = updated.length; i < len; i++) {
var scheduler=updated[i];
scheduler.notifyVisibilityChangeListeners();
if (scheduler.isVisible && PlatformJS.isPlatformInitialized) {
this._logContentViews(scheduler)
}
}
}, _logContentViews: function _logContentViews(scheduler) {
var clusterItem=scheduler.visibilityManager && scheduler.visibilityManager.item;
if (clusterItem) {
var cluster=clusterItem.winControl && clusterItem.winControl.control;
if (cluster && cluster.logContentView) {
cluster.logContentView()
}
else {
var impression=PlatformJS.Navigation.mainNavigator.getCurrentImpression();
var level=Microsoft.Bing.AppEx.Telemetry.LogLevel.normal;
var id=clusterItem && clusterItem.data && clusterItem.data.clusterTitle || null;
var type=scheduler.id;
if (!clusterItem.kIndex && impression) {
var kIndex=impression.addContent("", "", id, type, new Date, "", "", false, Microsoft.Bing.AppEx.Telemetry.ContentWorth.Normal, false, "");
clusterItem.kIndex = kIndex
}
if (impression) {
impression.logContentView(level, clusterItem.kIndex, "unknown", false, null)
}
}
}
}, _logTelemetryPanoViewed: function _logTelemetryPanoViewed() {
var viewport=this._viewport;
if (viewport) {
var progress=((this._scrollPosition + viewport.offsetWidth) / viewport.scrollWidth * 100);
var scrollDirection=this._progress < progress ? "right" : "left";
var customAttributes={
progress: progress.toFixed(0) + "%", direction: scrollDirection
};
this._progress = progress;
PlatformJS.deferredTelemetry(function deferred_logTelemetryPanoViewed() {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Panorama", "", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.scroll, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(customAttributes))
})
}
}, _onSurfaceScroll: function _onSurfaceScroll(evt) {
if (this._viewport) {
var scrollPosition=this._viewport.scrollLeft;
if (scrollPosition !== this._scrollPosition) {
this._scrollDoneDelayer.delay();
this._scrollPosition = scrollPosition;
if (this._scrollPosition === this._targetScrollPosition) {
this._isScrolling = false;
this._targetScrollPosition = null
}
else {
this._isScrolling = true
}
this.dispatchEvent("scroll", evt)
}
}
}, _onWindowScroll: function _onWindowScroll(evt) {
if (!evt.ctrlKey && evt.deltaY !== 0) {
var panoramaPanel=CommonJS.Immersive.PanoramaPanel;
panoramaPanel.isScrollCurrentTargetPanorama = true;
this._verticalScrollDelayer.delay()
}
}, _onMouseWheel: function _onMouseWheel(evt) {
if (!evt.ctrlKey && evt.deltaY !== 0 && evt.target === this._viewport) {
this.scrollTo(this._scrollPosition + evt.deltaY)
}
}, ensureElementVisible: function ensureElementVisible(element) {
if (this._viewport && this._surface && element) {
var left=CommonJS.getRelativeLeft(element, this._viewport),
width=element.offsetWidth,
viewportWidth=PlatformJS.Utilities.getDisplayData().clientWidth,
scrollLeft=this._scrollPosition;
if (CommonJS.isRtl()) {
left = viewportWidth - (left + width)
}
if (left < scrollLeft) {
this.scrollTo(left)
}
else if (left + width > scrollLeft + viewportWidth) {
this.scrollTo(left + width - viewportWidth)
}
}
}, registerDragScroller: function registerDragScroller(dragSourceContainer) {
if (dragSourceContainer) {
if (!dragSourceContainer.id) {
CommonJS.setAutomationId(dragSourceContainer)
}
if (!this._dragSourceContainers[dragSourceContainer.id]) {
this._dragSourceContainers[dragSourceContainer.id] = dragSourceContainer;
this._dragSourceContainers.containersCount++
}
if (this._dragSourceContainers.containersCount === 1) {
var eventManager=this._eventManager;
var viewport=this._viewport;
this._dragoverEventId = eventManager.add(viewport, "dragover", this._dragOverHandler.bind(this));
this._dragleaveEventId = eventManager.add(viewport, "dragleave", CommonJS.stopAutoScroll);
this._dragendEventId = eventManager.add(viewport, "dragend", CommonJS.stopAutoScroll);
this._dragdropEventId = eventManager.add(viewport, "dragdrop", CommonJS.stopAutoScroll)
}
}
}, unregisterDragScroller: function unregisterDragScroller(dragSourceContainer) {
if (dragSourceContainer && dragSourceContainer.id) {
if (this._dragSourceContainers[dragSourceContainer.id]) {
this._dragSourceContainers[dragSourceContainer.id] = null;
this._dragSourceContainers.containersCount--
}
if (this._dragSourceContainers.containersCount === 0 && this._dragOverHandlerBinding) {
var eventManager=this._eventManager;
eventManager.remove(this._dragoverEventId);
eventManager.remove(this._dragleaveEventId);
eventManager.remove(this._dragendEventId);
eventManager.remove(this._dragdropEventId);
this._dragoverEventId = this._dragleaveEventId = this._dragendEventId = this._dragdropEventId = null
}
}
}, saveScrollPosition: function saveScrollPosition() {
if (this._viewport) {
this._scrollPosition = this._viewport.scrollLeft
}
}, restoreScrollPosition: function restoreScrollPosition() {
if (this._viewport) {
this._viewport.scrollLeft = this._scrollPosition || 0
}
}, _dragOverHandler: function _dragOverHandler(e) {
var dragSource=e.srcElement;
var panoramaPanel=CommonJS.Immersive.PanoramaPanel;
function isAncestor(child, ancestor) {
var parentNode=child.parentNode,
result=false;
while (parentNode) {
if (parentNode === ancestor) {
result = true;
break
}
parentNode = parentNode.parentNode
}
return result
}
if (dragSource !== this._dragSource) {
for (var i in this._dragSourceContainers) {
var container=this._dragSourceContainers[i];
if (isAncestor(dragSource, container)) {
this._dragSource = dragSource;
this._viewportWidth = this._viewport.offsetWidth;
break
}
}
}
if (dragSource === this._dragSource) {
CommonJS.checkAutoScroll(this._viewport, this._viewportWidth, e.clientX)
}
}
}, {
leftMargin: 120, minClusterWidth: 200, clusterSpacing: 80, isScrollCurrentTargetPanorama: true, verticalScrollDelay: 800, verticalScrollHandler: function verticalScrollHandler(e) {
if (e) {
var panoramaPanel=CommonJS.Immersive.PanoramaPanel;
if (!panoramaPanel.isScrollCurrentTargetPanorama) {
e.stopPropagation()
}
else {
e.preventDefault();
var targetElement=e.currentTarget;
if (targetElement) {
var handler=panoramaPanel.verticalScrollHandler;
if (!targetElement.onscroll) {
targetElement.onscroll = handler
}
targetElement.style.overflowY = "hidden";
targetElement.removeEventListener("mousewheel", handler, false);
if (targetElement.verticalScrollTimer) {
clearTimeout(targetElement.verticalScrollTimer)
}
var that=this;
targetElement.verticalScrollTimer = setTimeout(function verticalScrollDelayTimer() {
targetElement.style.overflowY = "auto";
targetElement.addEventListener("mousewheel", handler, false);
targetElement.verticalScrollTimer = null
}, panoramaPanel.verticalScrollDelay)
}
}
}
}
}), WinJS.Utilities.eventMixin)
})
})();
(function _PanoramaVirtualizer_7() {
"use strict";
var realizationBufferSize=1;
function isRealizationRequired(virtualizer) {
var panel=virtualizer._panel,
totalCount=virtualizer._totalCount(),
realized=virtualizer._realized,
lastScrollPosition=virtualizer._lastScrollPosition,
list=virtualizer._dataSource && virtualizer._dataSource._list;
if (!panel || !panel._surface) {
return false
}
if (!document || !document.body) {
return false
}
if (totalCount === 0) {
return false
}
if (list) {
if (!list.length) {
return false
}
var last=list.getAt(list.length - 1);
if (realized.fromKey(last.clusterKey)) {
return false
}
}
else {
return false
}
var viewportWidth=PlatformJS.Utilities.getDisplayData().offsetWidth,
surfaceWidth=null,
scrollPosition=lastScrollPosition,
surfaceSize=CommonJS.Immersive.SurfaceSizeObserver.getCurrentInstance();
if (surfaceSize) {
surfaceWidth = surfaceSize.surfaceWidth
}
else {
surfaceWidth = panel._surface.offsetWidth
}
return surfaceWidth <= scrollPosition + (viewportWidth * (1 + realizationBufferSize))
}
function retainAndDecorateRange(indexes, realized, dataSource) {
var that=this,
promises=[],
pending=[];
for (var i=0, ilen=indexes.length; i < ilen; i++) {
var itemPromise=dataSource.fromIndex(indexes[i]).retain().then(function panoramaVirtualizer_retainComplete(listItem) {
if (!listItem) {
return null
}
var decorated=decorateClusterDefinition(listItem.index, listItem.handle, listItem.data);
pending.push(decorated)
});
promises.push(itemPromise)
}
return WinJS.Promise.join(promises).then(function panoramaVirtualizer_joinComplete() {
return WinJS.Promise.wrap(pending)
})
}
function decorateClusterDefinition(index, handle, data) {
return {
index: index, key: data.clusterKey, data: data, handle: handle, width: data.width, offset: null, previous: null, next: null, element: null, winControl: null
}
}
var NS=WinJS.Namespace.define("CommonJS.Immersive", {PanoramaVirtualizer: WinJS.Class.define(function panoramaVirtualizer_ctor(panoramaPanel, focusManager, panoramaEventManager) {
this._operation = WinJS.Promise.wrap({});
this.numClustersToLoad = PlatformJS.BootCache.instance.getEntry("Pano.NumClustersToLoad", function _PanoramaVirtualizer_102() {
return PlatformJS.Services.configuration.getDictionary("Panorama").getInt32("NumClustersToLoad")
});
this._displayAllClusters = CommonJS.commonSchedulerEnabled;
this._panel = panoramaPanel;
this._focusManager = focusManager;
this._panoramaEventManager = panoramaEventManager;
this._viewportWidth = PlatformJS.Utilities.getDisplayData().clientWidth;
this._initialize()
}, {
_panel: null, _focusManager: null, _panoramaEventManager: null, _displayAllClusters: false, _bind_afterRealizeFirstView: null, _realized: null, _dataSource: null, _lastScrollPosition: 0, _isRealizing: false, _panoramaState: null, _currentPromise: null, _scrollLimitMin: 0, _direction: null, _viewportWidth: null, _operation: null, _disposed: false, numClustersToLoad: 0, dataSource: {set: function set(value) {
var thisList=this._dataSource ? this._dataSource._list : "nullDataSource",
thatList=value ? value._list : "nullDataSource";
if (thisList !== thatList) {
var that=this;
if (this._dataSource !== null) {
this._dataSource.release();
this._dataSource = null
}
this._realized = new NS.RealizedList;
this._isRealizing = false;
this._direction = null;
this._lastScrollPosition = 0;
if (!this._disposed && value) {
var list=value._list;
PlatformJS.modernPerfTrack.writeStartEvent(PlatformJS.perfTrackScenario_PanoramaVisibleClustersLoaded, "Panorama Control Visible Clusters Loaded", this._panel._element.id);
this._dataSource = value.createListBinding(this);
this._realizeFirstView()
}
}
}}, disposeAllClusters: function disposeAllClusters() {
this.cancelPendingOperations();
var panel=this._panel;
if (panel) {
var item=this._realized ? this._realized.first : null;
while (item) {
panel.disposeItem(item);
item = item.next
}
}
this._panel.clear()
}, panoramaState: {set: function set(value) {
var displayData=PlatformJS.Utilities.getDisplayData();
if (value && value.width === displayData.clientWidth && value.height === displayData.clientHeight) {
value.useClusterWidth = true
}
this._panoramaState = value || null
}}, _initialize: function _initialize() {
this._eventManager = CommonJS.Utils.getEventListenerManager(this, "PanoramaVirtualizer listeners");
this._eventManager.add(this._panel, "scroll", this._onSmartScroll.bind(this));
this._bind_afterRealizeFirstView = this._afterRealizeFirstView.bind(this);
this._panel.addEventListener("firstviewitemsrealizedcomplete", this._bind_afterRealizeFirstView)
}, onWindowResize: function onWindowResize(event) {
var displayData=PlatformJS.Utilities.getDisplayData();
CommonJS.WindowEventManager.HandleWindowResizeEvent.call(this, event, function HandleWindowResize() {
this._viewportWidth = displayData.offsetWidth
})
}, dispose: function dispose() {
if (!this._disposed) {
this._disposed = true;
if (this._eventManager) {
this._eventManager.dispose();
this._eventManager = null
}
if (this._dataSource) {
this._dataSource.release();
this._dataSource = null
}
this.cancelPendingOperations();
if (this._panel && this._bind_afterRealizeFirstView) {
this._panel.removeEventListener("firstviewitemsrealizedcomplete", this._bind_afterRealizeFirstView);
this._bind_afterRealizeFirstView = null
}
this._panel = null;
this._focusManager = null;
this._panoramaEventManager = null;
this._panoramaState = null
}
}, _isRunning: false, _totalCount: function _totalCount() {
var result=0;
if (this._dataSource && this._dataSource._list) {
result = this._dataSource._list.length || 0
}
return result
}, _realizeFirstView: function _realizeFirstView() {
var that=this,
realized=this._realized,
state=this._panoramaState || {},
count=(state.count && state.scrollPosition > 0) ? state.count : 1,
firstViewVisibleClusterCount=Math.min(this._totalCount(), count),
last=this._displayAllClusters ? this._totalCount() : firstViewVisibleClusterCount,
indexes=[],
scrollPosition=state.scrollPosition,
dataSource=this._dataSource;
this._scrollLimitMin = parseInt(this._panel._viewport.currentStyle.msScrollLimitXMin);
for (var index=0; index < last; index++) {
indexes.push(index)
}
var operation=null;
var afterFirstViewNotifier=this._afterRealizeFirstView.bind(this);
if (indexes.length > 0) {
this._isRealizing = true;
this._operation = operation = this._operation.then(function panoramaVirtualizer_realizeFirstViewOperationComplete() {
return retainAndDecorateRange(indexes, realized, dataSource)
}).then(function panoramaVirtualizer_realizeFirstViewRetainAndDecorateRangeComplete(panoramaItems) {
that._spliceStateMetadata(panoramaItems);
realized.addRange(panoramaItems);
for (var i=0; i < firstViewVisibleClusterCount; i++) {
panoramaItems[i].isInFirstView = true
}
return that._panel.realizeItems(panoramaItems, scrollPosition)
}).then(function panoramaVirtualizer_realizeFirstViewRealizeItemsComplete() {
if (isRealizationRequired(that)) {
return that._realizeNextItems(that.numClustersToLoad)
}
else {
that._isRealizing = false;
return WinJS.Promise.wrap(null)
}
}).then(function _PanoramaVirtualizer_283() {
that._afterRealizeFirstView()
})
}
else {
that._afterRealizeFirstView()
}
return operation
}, _afterRealizeFirstView: function _afterRealizeFirstView() {
var manager=PlatformJS.mainProcessManager;
if (manager.afterFirstView) {
manager.afterFirstView()
}
var that=this;
PlatformJS.platformInitializedPromise.then(function _firePanoramaEventManagerAfterFirstView() {
if (that._panel && that._panoramaEventManager) {
that._panoramaEventManager.dispatchEvent("afterFirstView")
}
})
}, _spliceStateMetadata: function _spliceStateMetadata(pendingItems) {
var state=this._panoramaState || {};
for (var i=0, ilen=pendingItems.length; i < ilen; i++) {
var item=pendingItems[i];
var stateEntry=state[item.key];
if (stateEntry) {
if (state.useClusterWidth) {
item.offset = stateEntry.offset;
item.width = item.width || stateEntry.width
}
var options=item.data.clusterContent.contentOptions = (item.data.clusterContent.contentOptions || {});
options.state = stateEntry.state
}
}
}, _moveToItemByIndex: function _moveToItemByIndex(itemIndex, lastRealizedIndex, ignoreAnimation) {
if (itemIndex > lastRealizedIndex) {
return false
}
var realized=this._realized;
var list=this._dataSource && this._dataSource._list;
var listItem=list && list.getAt(itemIndex);
var item=listItem && realized.fromKey(listItem.clusterKey);
if (item) {
this._panel.scrollTo(item.offset);
this._focusManager.setFocusTo(item, ignoreAnimation)
}
return true
}, setCurrentIndex: function setCurrentIndex(itemIndex, ignoreAnimation) {
var that=this;
if (!this._disposed) {
this._operation = this._operation.then(function panoramaVirtualizer_setCurrentIndexOperationComplete() {
var lastRealizedIndex=that._getLastRealizedIndex();
if (that._moveToItemByIndex(itemIndex, lastRealizedIndex, ignoreAnimation)) {
return WinJS.Promise.wrap(null)
}
var indices=[];
for (var i=0, indexToRealize=lastRealizedIndex + 1; indexToRealize <= itemIndex; i++, indexToRealize++) {
indices[i] = indexToRealize
}
that._isRealizing = true;
var dataSource=that._dataSource;
var realized=that._realized;
return retainAndDecorateRange(indices, realized, dataSource).then(function panoramaVirtualizer_retainAndDecorateRangeComplete(panoramaItems) {
realized.addRange(panoramaItems);
return that._panel.realizeItems(panoramaItems)
}).then(function panoramaVirtualizer_realizeItemsComplete() {
that._isRealizing = false;
lastRealizedIndex = that._getLastRealizedIndex();
that._moveToItemByIndex(itemIndex, lastRealizedIndex, ignoreAnimation)
})
})
}
}, cancelPendingOperations: function cancelPendingOperations() {
if (this._operation) {
this._operation.then(function onPendingOperationComplete() {
console.log("cancelPendingOperatons.onComplete")
}, function onPendingOPerationCanceled(error) {
if (error.name === "Canceled") {
console.log("panorama virtualizer pending operations canceled")
}
});
this._operation.cancel();
this._operation = WinJS.Promise.wrap(null)
}
}, refresh: function refresh() {
this._realized = new NS.RealizedList;
this._realizeFirstView()
}, _bufferSize: 1, _onSmartScroll: function _onSmartScroll(evt) {
if (!this._disposed) {
var that=this,
scrollPosition=this._panel.scrollPosition,
delta=scrollPosition - this._lastScrollPosition,
last=this._realized.last,
surfaceWidth=null,
surfaceSize=CommonJS.Immersive.SurfaceSizeObserver.getCurrentInstance();
if (surfaceSize) {
surfaceWidth = surfaceSize.surfaceWidth
}
else {
surfaceWidth = panel._surface.offsetWidth
}
this._lastScrollPosition = scrollPosition;
if (this._isRealizing) {
return
}
if (!last || (this._getLastRealizedIndex() >= this._totalCount() - 1)) {
return
}
var nextRealizationPoint=surfaceWidth - this._viewportWidth - last.width - this._scrollLimitMin;
if (delta < 0) {
return
}
if (scrollPosition >= nextRealizationPoint) {
this._isRealizing = true;
this._operation = this._operation.then(function _PanoramaVirtualizer_444() {
return that._realizeNextItems(1)
})
}
}
}, _realizeNextItems: function _realizeNextItems(count) {
var that=this;
var realized=this._realized,
dataSource=this._dataSource,
index=that._getLastRealizedIndex() + 1;
var itemCount=Math.min((index + count), that._totalCount());
var indexes=[];
for (; index < itemCount; index++) {
indexes.push(index)
}
return retainAndDecorateRange(indexes, realized, dataSource).then(function panoramaVirtualizer_retainAndDecorateRangeComplete(panoramaItems) {
var realized=that._realized;
realized.addRange(panoramaItems);
return that._panel.realizeItems(panoramaItems)
}).then(function panoramaVirtualizer_realizeItemsComplete() {
if (isRealizationRequired(that)) {
return that._realizeNextItems(count)
}
else {
that._isRealizing = false;
return WinJS.Promise.wrap(null)
}
})
}, _getLastRealizedIndex: function _getLastRealizedIndex() {
var result=-1;
var last=this._realized && this._realized.last;
var list=this._dataSource && this._dataSource._list;
while (last && list) {
result = list.indexOfKey(last.handle);
if (result < 0) {
last = last.previous
}
else {
break
}
}
return result
}, _realizationRequired: function _realizationRequired(listItem) {
var buffer=2;
var screenWidth=this._viewportWidth;
var realized=this._realized;
var last=realized.last;
var scrollPosition=this._lastScrollPosition;
if (realized && listItem && realized.fromHandle(listItem.handle)) {
return false
}
if (!last) {
return true
}
if (listItem && (listItem.index <= this._getLastRealizedIndex())) {
return true
}
if (last && ((last.offset + last.width) - scrollPosition) < (screenWidth * (1 + buffer))) {
return true
}
return false
}, getState: function getState() {
var realized=this._realized,
displayData=PlatformJS.Utilities.getDisplayData();
if (!realized) {
return null
}
var first=realized.first;
if (!first) {
return null
}
var state={
scrollPosition: this._panel.scrollPosition, count: realized.length, width: displayData.clientWidth, height: displayData.clientHeight
};
var item=first;
while (item) {
var itemState={
index: item.index, offset: item.offset, width: item.width
};
if (item.winControl && item.winControl.getState) {
itemState.state = item.winControl.getState()
}
state[item.key] = itemState;
item = item.next
}
return state
}, _retainAndDecorateItem: function _retainAndDecorateItem(listItem) {
var that=this;
return listItem.retain().then(function panoramaVirtualizer_retainComplete(listItem) {
var decorated=decorateClusterDefinition(listItem.index, listItem.handle, listItem.data);
return WinJS.Promise.wrap(decorated)
})
}, _realizeItem: function _realizeItem(panoramaItem) {
var that=this;
var realized=this._realized;
var panel=this._panel;
if (realized && panel) {
realized.insert(panoramaItem, panoramaItem.index);
return panel.realizeItem(panoramaItem)
}
else {
return null
}
}, _isRealizationRequired: function _isRealizationRequired() {
return isRealizationRequired(this)
}, beginNotifications: function beginNotifications(){}, endNotifications: function endNotifications(){}, changed: function changed(){}, itemAvailable: function itemAvailable(){}, moved: function moved(){}, countChanged: function countChanged(newCount, oldCount){}, indexChanged: function indexChanged(handle, newIndex, oldIndex){}, inserted: function inserted(listItem, previousHandle, nextHandle) {
if (!this._disposed) {
var that=this;
listItem.retain();
this._operation = this._operation.then(function handleItemInserted() {
if (!that._realizationRequired(listItem)) {
return WinJS.Promise.wrap(null)
}
else {
return WinJS.Promise.wrap(null).then(function panoramaVirtualizer_insertedOperationComplete() {
return that._retainAndDecorateItem(listItem)
}).then(function panoramaVirtualizer_retainAndDecoratedItemComplete(decorated) {
return that._realizeItem(decorated)
})
}
})
}
}, removed: function removed(handle, mirage) {
if (!this._disposed) {
var that=this,
realized=this._realized;
if (realized) {
var item=realized.fromHandle(handle);
if (item) {
realized.removeAt(item.index);
item.isZombie = true;
this._panel.addZombieItem(item);
this._operation = this._operation.then(function handleItemRemoved() {
if (that._panel) {
that._panel.removeItem(item)
}
})
}
else {
console.info("Trying to remove an unrealized item " + handle)
}
}
}
}
})})
})();
(function _SemanticZoomPanorama_6() {
"use strict";
var NS=WinJS.Namespace.define("CommonJS.Immersive", {SemanticZoomPanorama: WinJS.Class.derive(CommonJS.Immersive.Panorama, function semanticZoomPanorama_ctor(element, options) {
CommonJS.Immersive.Panorama.call(this, element, options);
this._semanticZoomInitialized = false;
this._customizationOptions = {};
this._currentClusters = [];
Object.defineProperties(this, WinJS.Utilities.createEventProperties("zoomchanged"))
}, {
_semanticZoomElement: null, _semanticZoomOutElement: null, _zoomedOutItem: null, _semanticZoomInitialized: null, _customizationView: null, _customizationOptions: null, _semanticZoomedOutProjection: null, _queryClusterData: null, _currentClusters: null, _list: null, _disposed: false, _enableCustomization: false, _showCustomizationImmediate: false, _onsemanticZoomChangedBinding: null, _headerParent: null, _zoomEventManager: null, _initialize: function _initialize(options) {
msWriteProfilerMark("SemanticZoomPanorama:_initialize:s");
var element=this._element;
WinJS.Utilities.addClass(element, "win-disposable");
var eventManager=this._zoomEventManager = CommonJS.Utils.getEventListenerManager(this, "SemanticZoomPanorama listeners");
this._disposed = false;
this._headerElement = CommonJS.createElement("header", element, "header");
var header=this.header = new CommonJS.Immersive.Header(this._headerElement);
header.onSubTitleClick = this._onHeaderSubtitleClick.bind(this);
CommonJS.setAutomationId(this._headerElement, element, "header");
element.appendChild(this._headerElement);
var panelElement=CommonJS.createElement("div", element, "panel");
var panel=this._panel = new NS.SemanticZoomPanoramaPanel(panelElement, null);
panel._createOrchestrator = this._createOrchestrator.bind(this);
CommonJS.setAutomationId(panelElement, element, "panel");
eventManager.add(panel, "itemremoved", this._onItemRemoved.bind(this), "semanticZoomPanorma panel itemremoved");
var focusManager=this._focusManager = new NS.PanoramaFocusManager(panel);
var virtualizer=this._virtualizer = new NS.SemanticZoomPanoramaVirtualizer(panel, focusManager, this, this);
WinJS.UI.setOptions(virtualizer, options);
panel.zoomableView = virtualizer;
this._surfaceSize = new NS.SurfaceSizeObserver(panel, header, virtualizer);
this._headerController = new CommonJS.Immersive.HeaderOrchestrator.PanoramaHeaderOrchestrator(this, panel, header);
CommonJS.Immersive.HeaderOrchestrator.headerOrchestrator = this._headerController;
this._metrics = new NS.PanoramaMetricsObserver(panel, virtualizer);
var semanticZoomElement=this._semanticZoomElement = CommonJS.createElement("div", element, "semanticZoom");
CommonJS.setAutomationId(semanticZoomElement, element, "semanticZoom");
WinJS.Utilities.addClass(semanticZoomElement, "platformSemanticZoom");
element.appendChild(semanticZoomElement);
var semanticZoomOutElement=this._semanticZoomOutElement = CommonJS.createElement("div", element, "zoomOut");
semanticZoomOutElement.id = "zoomOut";
CommonJS.setAutomationId(semanticZoomOutElement, element, "zoomOut");
WinJS.Utilities.addClass(semanticZoomOutElement, "platformSemanticZoomOut");
semanticZoomOutElement.setAttribute("aria-labelledby", header._platformHeaderTitle.id);
semanticZoomElement.appendChild(panelElement);
semanticZoomElement.appendChild(semanticZoomOutElement);
this._zoomedOutItem = new WinJS.UI.ListView(semanticZoomOutElement, {selectionMode: "none"});
this._zoomedOutItem.itemTemplate = function(itemPromise) {
return {element: itemPromise.then(function semanticZoomPanorama_zoomedOutItemPromiseComplete(group) {
var div=document.createElement("div");
WinJS.Utilities.addClass(div, "platformSemanticZoomItem");
if (group.data) {
div.innerText = group.data.clusterTitle || ""
}
return div
})}
};
this._buildSemanticZoom = function() {
msWriteProfilerMark("SemanticZoomPanorama:_buildSemanticZoom:s");
this._panel.saveScrollPosition();
var semanticZoom=this.semanticZoom = new WinJS.UI.SemanticZoom(semanticZoomElement, options);
this._panel.restoreScrollPosition();
semanticZoom.locked = true;
eventManager.add(semanticZoom, "zoomchanged", this._onsemanticZoomChanged.bind(this), "semanticZoomPanorama semanticZoom zoomchanged");
if (this.semanticZoomOptions) {
WinJS.UI.setOptions(this.semanticZoom, this.semanticZoomOptions);
this.semanticZoomOptions = null
}
msWriteProfilerMark("SemanticZoomPanorama:_buildSemanticZoom:e");
PlatformJS.mainProcessManager.semanticZoomFinished();
this._buildSemanticZoom = function(){}
};
if (PlatformJS.isPlatformInitialized) {
this._buildSemanticZoom()
}
var watermarkElement=this._watermarkElement = CommonJS.createElement("div", element, "watermark");
WinJS.Utilities.addClass(watermarkElement, "platformWatermark");
element.appendChild(watermarkElement);
CommonJS.Watermark.setElement(watermarkElement);
CommonJS.Watermark.setWatermarkText(this._watermark);
msWriteProfilerMark("SemanticZoomPanorama:_initialize:e")
}, dispose: function dispose() {
if (!this._disposed) {
if (this.hasCustomizationViewShown()) {
this._postCustomization()
}
var _semanticZoom=this.semanticZoom;
if (_semanticZoom) {
_semanticZoom.locked = true;
_semanticZoom._clearTimeout(_semanticZoom._completeZoomTimer);
_semanticZoom._clearTimeout(_semanticZoom._TTFFTimer)
}
;
if (this._zoomedOutItem) {
if (this._zoomedOutItem.dispose) {
this._zoomedOutItem.dispose()
}
this._zoomedOutItem = null
}
this._semanticZoomElement = null;
this._semanticZoomOutElement = null;
this._headerElement = null;
this._headerParent = null;
this._list = null;
CommonJS.Immersive.Panorama.prototype.dispose.call(this);
if (this._zoomEventManager) {
this._zoomEventManager.dispose();
this._zoomEventManager = null
}
this._disposed = true
}
}, zoomOutOptions: {set: function set(value) {
WinJS.UI.setOptions(this._zoomedOutItem, value)
}}, zoomOptions: {set: function set(value) {
if (this._disposed) {
return
}
if (value) {
this._lockSeZo = value.locked;
if (value.locked) {
WinJS.Utilities.addClass(this._semanticZoomElement, "platformSemanticzoom-disabled")
}
else {
WinJS.Utilities.removeClass(this._semanticZoomElement, "platformSemanticzoom-disabled")
}
}
if (this.semanticZoom) {
WinJS.UI.setOptions(this.semanticZoom, value)
}
else {
this.semanticZoomOptions = value
}
}}, semanticZoomRenderer: {set: function set(value) {
this._zoomedOutItem.itemTemplate = value
}}, clusterDataSource: {set: function set(value) {
value = value || (new WinJS.Binding.List).dataSource;
if (this._list !== value.list) {
this._disposeAllClusters();
this._list = value.list;
this._customizationOptions.clusterList = this._list;
if (this._customizationView && !this.hasCustomizationViewShown()) {
this._customizationView.clusterList = this._list
}
var groupedProjection=this._getGroupedProjection(value);
var zoomedOutGroupedProjection=this._getZoomedOutGroupedProjection(value);
if (!this._semanticZoomedOutProjection) {
this._semanticZoomedOutProjection = zoomedOutGroupedProjection
}
if (!(this._enableCustomization && this._showCustomizationImmediate)) {
if (this._semanticZoomInitialized && this._zoomedOutItem) {
this._zoomedOutItem.itemDataSource = this._getZoomedOutDataSource(zoomedOutGroupedProjection.groups.dataSource)
}
if (this._panel) {
this._panel.clear()
}
if (this._virtualizer) {
this._virtualizer.dataSource = groupedProjection.dataSource;
if (this._focusManager) {
this._focusManager.virtualizer = this._virtualizer
}
}
}
else {
msSetImmediate(this.initializeCustomizationView.bind(this))
}
}
}}, initializeSemanticZoom: function initializeSemanticZoom() {
msWriteProfilerMark("SemanticZoomPanorama:initializeSemanticZoom:s");
if (!this._semanticZoomInitialized && !this._disposed) {
this._buildSemanticZoom();
this._semanticZoomInitialized = true;
var that=this,
semanticZoomElement=this._semanticZoomElement,
semanticZoomOutElement=this._semanticZoomOutElement;
WinJS.UI.setOptions(this, this._remainingOptions);
if (this._zoomedOutItem && !this._zoomedOutItem._disposed && this._semanticZoomedOutProjection) {
this._zoomedOutItem.itemDataSource = this._getZoomedOutDataSource(this._semanticZoomedOutProjection.groups.dataSource)
}
}
msWriteProfilerMark("SemanticZoomPanorama:initializeSemanticZoom:e")
}, enableCustomization: {set: function set(value) {
this._enableCustomization = value
}}, customizationMode: {set: function set(value) {
this._customizationOptions.mode = value
}}, customizationTitle: {set: function set(value) {
this._customizationOptions.title = value
}}, customizationHintText: {set: function set(value) {
this._customizationOptions.hintText = value
}}, customizationStartIndex: {set: function set(value) {
this._customizationOptions.startIndex = value;
if (this.hasCustomizationViewShown()) {
this._customizationView.startIndex = value
}
}}, maxCustomizationClusterCount: {set: function set(value) {
this._customizationOptions.maxCustomizationClusterCount = value;
if (this.hasCustomizationViewShown()) {
this._customizationView.maxCustomizationClusterCount = value
}
}}, customizationItemTemplate: {set: function set(value) {
this._customizationOptions.itemTemplate = value
}}, customizationAddButtonRenderer: {set: function set(value) {
this._customizationOptions.addButtonRenderer = value
}}, customizationAddCallback: {set: function set(value) {
this._customizationOptions.addCallback = value
}}, customizationAddButtonOptions: {set: function set(value) {
var addOptions=value;
if (value && !Array.isArray(value)) {
addOptions = [value]
}
this._customizationOptions.addButtonsOptions = addOptions
}}, customizationImageMap: {
get: function get() {
if (this._customizationImageMap) {
return JSON.stringify(this._customizationImageMap)
}
else {
return ""
}
}, set: function set(value) {
if (value) {
this._customizationImageMap = JSON.parse(value)
}
}
}, queryClusterData: {set: function set(value) {
this._queryClusterData = value
}}, onCustomizationCompleted: {set: function set(value) {
this._customizationCompletedCallback = value
}}, showCustomizationImmediate: {set: function set(value) {
this._showCustomizationImmediate = value;
if (value && !this.hasCustomizationViewInitialized()) {
WinJS.Utilities.addClass(this._headerElement, "platformHidden")
}
}}, hasCustomizationViewInitialized: function hasCustomizationViewInitialized() {
return !!(this._customizationView && this._customizationView.hasInitialized())
}, hasCustomizationViewShown: function hasCustomizationViewShown() {
return !!(this._customizationView && this._customizationView.hasShown())
}, initializeCustomizationView: function initializeCustomizationView() {
var that=this;
if (this._enableCustomization && !this.hasCustomizationViewInitialized() && !this._disposed) {
this._customizationOptions.normalView = this._semanticZoomElement;
this._customizationOptions.postCustomization = this._postCustomization.bind(this);
this._customizationElement = CommonJS.createElement("div", this._element, "customization");
this._customizationView = new CommonJS.Immersive.CustomizationView(this._customizationElement, this._customizationOptions);
this._element.appendChild(this._customizationElement);
msSetImmediate(function finishInitializeCustomizationView() {
if (!that._disposed) {
if (that._showCustomizationImmediate) {
that.showCustomizationView(false)
}
}
})
}
}, getCustomizationResult: function getCustomizationResult() {
var list=null;
if (this.hasCustomizationViewShown()) {
list = this._customizationView.getCustomizationResult()
}
else {
this._updateCurrentClusters();
list = this._currentClusters
}
return list
}, showCustomizationView: function showCustomizationView(skipUpdateList) {
var that=this;
if (this.hasCustomizationViewInitialized() && !this.hasCustomizationViewShown()) {
WinJS.Utilities.addClass(this._watermarkElement, "platformHidden");
this._customizationView.show(skipUpdateList).then(function postShowCustomizationAnimation() {
if (that._showCustomizationImmediate) {
WinJS.Utilities.removeClass(that._headerElement, "platformHidden")
}
});
return true
}
else {
if (!this.hasCustomizationViewInitialized()) {
this._showCustomizationImmediate = true;
this.initializeCustomizationView()
}
return false
}
}, _postCustomization: function _postCustomization() {
WinJS.Utilities.removeClass(this._watermarkElement, "platformHidden");
var list=this._customizationView.getCustomizationResult(),
customizationUpdateBindingList=this._list,
newListOrder={},
currentListOrder={},
promises=[],
that=this;
this._updateCurrentClusters();
if (!this._isListDifferent(list) && !this._showCustomizationImmediate) {
return WinJS.Promise.wrap(false)
}
this._showCustomizationImmediate = false;
list.forEach(function _SemanticZoomPanorama_441(item, index) {
newListOrder[item] = index + 1
});
this._currentClusters.forEach(function _SemanticZoomPanorama_444(item, index) {
currentListOrder[item] = index + 1
});
this.clusterDataSource = null;
list.forEach(function customizationUpdateBindingList_Add(item, index) {
if (!currentListOrder[item]) {
var fullData=null;
if (this._queryClusterData) {
fullData = this._queryClusterData(item)
}
if (!fullData) {
this._customizationView.customizationList.forEach(function customizationListFindEntry(cluster) {
if (cluster && cluster.clusterKey === item) {
fullData = cluster
}
})
}
(function postQueryCluster(queryResult) {
if (queryResult) {
if (WinJS.Promise.is(queryResult)) {
promises.push(queryResult.then(function _SemanticZoomPanorama_469(data) {
if (data) {
customizationUpdateBindingList.push(data)
}
}))
}
else {
customizationUpdateBindingList.push(queryResult)
}
}
})(fullData)
}
}, this);
return WinJS.Promise.join(promises).then(function customizationUpdateBindingList_SortRemove() {
customizationUpdateBindingList.sort(function customizationUpdateBindingList_Sort(a, b) {
var aOrder=newListOrder[a.clusterKey] || 0;
var bOrder=newListOrder[b.clusterKey] || 0;
return aOrder - bOrder
});
for (var index=0, count=customizationUpdateBindingList.length; index < count; index++) {
if (newListOrder[customizationUpdateBindingList.getAt(index).clusterKey]) {
break
}
}
customizationUpdateBindingList.splice(0, index);
that.clusterDataSource = customizationUpdateBindingList.dataSource;
if (that._customizationCompletedCallback) {
that._customizationCompletedCallback(list)
}
})
}, _isListDifferent: function _isListDifferent(list) {
if (list && list.length === this._currentClusters.length) {
for (var i=0, ilen=list.length; i < ilen; i++) {
if (list[i] !== this._currentClusters[i]) {
return true
}
}
return false
}
else {
return true
}
}, _updateCurrentClusters: function _updateCurrentClusters() {
this._currentClusters = [];
for (var index=0, count=this._list ? this._list.length : 0; index < count; index++) {
var data=this._list.getAt(index);
this._currentClusters.push(data.clusterKey)
}
}, _onItemRemoved: function _onItemRemoved(item) {
var itemData=item && item.detail && item.detail.data;
if (itemData.platformInvisiblePermanentCluster && this._customizationView) {
this._customizationView.updateInvisibleList(itemData)
}
}, _isSemanticZoomEnabled: function _isSemanticZoomEnabled(item) {
return !(item.platformInvisibleCluster)
}, _getZoomedOutGroupedProjection: function _getZoomedOutGroupedProjection(dataSource) {
var filteredList=dataSource.list.createFiltered(this._isSemanticZoomEnabled);
return this._getGroupedProjection(filteredList.dataSource)
}, _getGroupedProjection: function _getGroupedProjection(dataSource) {
return dataSource.list.createGrouped(function _SemanticZoomPanorama_547(item) {
return item.clusterKey
}, function _SemanticZoomPanorama_550(item) {
return item
}, function _SemanticZoomPanorama_553(left, right) {
return 0
})
}, _getZoomedOutDataSource: function _getZoomedOutDataSource(filteredDataSource) {
if (!filteredDataSource.oldItemFromKey) {
filteredDataSource.oldItemFromKey = filteredDataSource.itemFromKey;
filteredDataSource.itemFromKey = function itemFromKeyWrapper(key) {
var that=this;
try {
return this.oldItemFromKey(key)
}
catch(error) {
return this.itemFromIndex(0).then(function getFirstItemFromKey(item) {
return that.oldItemFromKey(item.key)
})
}
}
}
return filteredDataSource
}, _onsemanticZoomChanged: function _onsemanticZoomChanged(event) {
var zoomInViewport=this.semanticZoom && this.semanticZoom._viewportIn;
if (event.detail) {
if (this._headerElement && this._semanticZoomOutElement) {
this._headerParent = this._headerElement.parentNode;
this._semanticZoomOutElement.appendChild(this._headerElement)
}
if (this._watermarkElement) {
WinJS.Utilities.addClass(this._watermarkElement, "platformHidden")
}
if (zoomInViewport) {
WinJS.Utilities.addClass(zoomInViewport, "forceHidden")
}
}
else {
if (this._headerElement && this._headerParent) {
this._headerParent.appendChild(this._headerElement)
}
if (this._watermarkElement) {
WinJS.Utilities.removeClass(this._watermarkElement, "platformHidden")
}
if (zoomInViewport) {
WinJS.Utilities.removeClass(zoomInViewport, "forceHidden")
}
}
this.dispatchEvent("zoomchanged", event.detail)
}
})})
})();
(function _SurfaceSizeObserver_7() {
"use strict";
var NS=WinJS.Namespace.define("CommonJS.Immersive", {SurfaceSizeObserver: WinJS.Class.define(function surfaceSizeObserver_ctor(panoramaPanel, panoramaHeader, panoramaVirtualizer) {
this._displayData = PlatformJS.Utilities.getDisplayData();
this._panel = panoramaPanel;
this._header = panoramaHeader;
this._virtualizer = panoramaVirtualizer;
this._initialize()
}, {
_panel: null, _virtualizer: null, _header: null, _surfaceWidth: null, _surfaceMargin: null, _zeroOffset: null, _viewportWidth: null, _surfaceMinWidth: null, _handleResizeBinding: null, _handleResizeImmediate: null, _displayData: null, _updateSnapPointsDelayer: null, _updateWhitespaceDelayer: null, _initialize: function _initialize() {
var panel=this._panel;
this._viewportWidth = this._displayData.offsetWidth;
this._eventManager = CommonJS.Utils.getEventListenerManager(this, "SurfaceSizeObserver listeners");
this._eventManager.add(panel, "itemrealizedcomplete", this._onItemRealized.bind(this));
this._eventManager.add(panel, "itemresized", this._onItemResized.bind(this));
this._eventManager.add(panel, "itemremoved", this._onItemRemoved.bind(this));
this._handleResizeBinding = this._handleResize.bind(this);
this._updateSnapPointsDelayer = new CommonJS.Utils.Delayer(this._updateSnapPoints, 50, this);
this._updateWhitespaceDelayer = new CommonJS.Utils.Delayer(this._updateWhitespace, 50, this);
if (CommonJS.Immersive.SurfaceSizeObserver._currentInstance) {
debugger
}
CommonJS.Immersive.SurfaceSizeObserver._currentInstance = this
}, clearStyle: function clearStyle() {
if (this._panel) {
var viewport=this._panel._viewport,
surface=this._panel._surface;
if (viewport && viewport.style) {
viewport.style.msScrollSnapPointsX = ""
}
if (surface && surface.style) {
surface.style.minWidth = ""
}
this._surfaceWidth = null;
this._surfaceMargin = null;
this._zeroOffset = null;
this._surfaceMinWidth = null
}
}, surfaceWidth: {get: function get() {
if (!this._panel || !this._panel._surface) {
return 0
}
if (!this._surfaceWidth) {
this._surfaceWidth = this._panel._surface.offsetWidth
}
return Math.max(this._surfaceMinWidth, this._surfaceWidth)
}}, dispose: function dispose() {
var panel=this._panel;
this._handleResizeBinding = null;
this.clearStyle();
if (this._handleResizeImmediate) {
msClearImmediate(this._handleResizeImmediate);
this._handleResizeImmediate = null
}
if (this._updateSnapPointsDelayer) {
this._updateSnapPointsDelayer.dispose();
this._updateSnapPointsDelayer = null
}
if (this._updateWhitespaceDelayer) {
this._updateWhitespaceDelayer.dispose();
this._updateWhitespaceDelayer = null
}
if (this._eventManager) {
this._eventManager.dispose();
this._eventManager = null
}
this._panel = null;
this._virtualizer = null;
this._header = null;
CommonJS.Immersive.SurfaceSizeObserver._currentInstance = null
}, zeroOffset: {get: function get() {
if (this._zeroOffset === null) {
this._zeroOffset = this._computeZeroOffset()
}
return this._zeroOffset
}}, _computeZeroOffset: function _computeZeroOffset() {
var headerElement=document.querySelector(".immersiveHeaderTitle");
if (headerElement) {
return headerElement.getOffset()
}
else {
return 120
}
}, surfaceMargin: {get: function get() {
if (this._surfaceMargin === null) {
this._surfaceMargin = this._computeSurfaceMargin()
}
return this._surfaceMargin
}}, _computeSurfaceMargin: function _computeSurfaceMargin() {
var surface=this._panel && this._panel._surface;
return surface ? surface.getPaddingLeft() : 0
}, _computeSnapPointsOffset: function _computeSnapPointsOffset() {
var panel=this._panel,
zeroOffset=this.zeroOffset;
var snapPointsOffset=0;
if (panel && !panel.zeroOffsetSnapPoints) {
snapPointsOffset = zeroOffset
}
return snapPointsOffset
}, _onItemRealized: function _onItemRealized(event) {
var item=event.detail;
if (!item.isZombie) {
var last=this._updateFollowingItemsOffset(item);
this._surfaceWidth = Math.max(this._surfaceWidth, last.offset + last.width + last.marginRight);
this._updateSnapPointsDelayer.delay();
this._updateWhitespaceDelayer.delay(last)
}
}, _onItemResized: function _onItemResized(evt) {
var item=evt.detail,
delta=0,
element=item.element;
if (element) {
var previous=item.previous,
width=element.offsetWidth;
item.deltaWidth = delta = width - (item.width || 0);
if (item.width !== width) {
CommonJS.Immersive.CachedWidthManager.instance.getWidth(item.panoramaPanelId, item.controlname, item.key, width)
}
item.width = width;
item.outerWidth -= delta;
var last=this._updateFollowingItemsOffset(item, delta);
this._surfaceWidth += delta;
this._updateSnapPointsDelayer.delay();
this._updateWhitespaceDelayer.delay(last);
this._cancelScroll(item, delta)
}
}, _onItemRemoved: function _onItemRemoved(evt) {
var item=evt.detail,
delta=-item.outerWidth || 0,
candidate=item.next,
last=item.previous,
lastCandidate=null;
if (item.next && item.next.offset && item.next.offset > (item.offset + item.width)) {
lastCandidate = this._updateFollowingItemsOffset(item, delta);
this._surfaceWidth += delta
}
else {
lastCandidate = item;
while (lastCandidate.next) {
lastCandidate = lastCandidate.next
}
}
if (lastCandidate !== item) {
last = lastCandidate
}
this._updateSnapPointsDelayer.delay();
this._updateWhitespaceDelayer.delay(last);
this._cancelScroll(item, delta)
}, _updateFollowingItemsOffset: function _updateFollowingItemsOffset(item, delta) {
var last=item,
candidate=item.next;
while (candidate) {
last = candidate;
if (candidate.offset) {
if (delta) {
candidate.offset += delta
}
else {
var element=candidate.element;
if (element) {
var offset=element.getOffset();
delta = offset - candidate.offset;
candidate.offset = offset
}
else {
debugger
}
}
}
candidate = candidate.next
}
return last
}, _handleResize: function _handleResize(event) {
CommonJS.WindowEventManager.HandleWindowResizeEvent.call(this, event, function HandleWindowResize() {
this._viewportWidth = this._displayData.offsetWidth;
this._surfaceMargin = null;
this._zeroOffset = null;
var item=this._panel.current;
if (!item) {
return
}
while (item.next) {
item = item.next
}
this._updateSnapPointsDelayer.delay();
this._updateWhitespaceDelayer.delay(item)
})
}, _onWindowResize: function _onWindowResize(event) {
if (this._handleResizeImmediate) {
msClearImmediate(this._handleResizeImmediate);
this._handleResizeImmediate = null
}
this._handleResizeImmediate = msSetImmediate(this._handleResizeBinding)
}, _updateSnapPoints: function _updateSnapPoints() {
if (!this._virtualizer || !this._virtualizer._realized || !this._virtualizer._realized.first) {
return
}
var item=this._virtualizer._realized.first,
snapPointsOffset=this._computeSnapPointsOffset(),
snapPoints=[];
while (item) {
if (item.offset) {
snapPoints.push(Math.max(item.offset - snapPointsOffset, 0) + "px")
}
item = item.next
}
var panel=this._panel;
if (panel) {
var viewport=panel._viewport;
if (viewport) {
var scrollLimitSnap="";
if (viewport.currentStyle && viewport.currentStyle.msScrollLimitXMin && viewport.currentStyle.msScrollLimitXMin !== "auto") {
scrollLimitSnap = viewport.currentStyle.msScrollLimitXMin + ","
}
viewport.style.msScrollSnapPointsX = "snapList(" + scrollLimitSnap + snapPoints.join(",") + ")"
}
}
}, _updateWhitespace: function _updateWhitespace(lastItem) {
var surface=this._panel._surface;
if (surface) {
this._surfaceWidth = surface.offsetWidth;
var surfaceMargin=this.surfaceMargin;
var viewportWidth=this._viewportWidth;
var extraSpace=viewportWidth - surfaceMargin;
var lastWidth=lastItem ? lastItem.width + lastItem.marginRight : 0;
var lastOffset=lastItem ? lastItem.offset : 0;
if (lastItem && lastItem.previous && typeof lastItem.previous.offset === "number") {
lastOffset = lastItem.previous.offset;
lastWidth += lastItem.previous.width + lastItem.previous.marginRight
}
extraSpace = Math.max(extraSpace, lastWidth);
var desired=lastOffset + extraSpace;
var actual=this._panel.compactPanorama ? this._viewportWidth : Math.max(this._viewportWidth, desired);
if (this._surfaceMinWidth !== actual) {
surface.style.minWidth = actual + "px";
this._surfaceMinWidth = actual
}
msSetImmediate(function updateSurfaceWidth() {
this._surfaceWidth = surface.offsetWidth
}.bind(this))
}
}, _cancelScroll: function _cancelScroll(item, delta) {
var panel=this._panel;
if (!!delta && panel.current && item.index < panel.current.index) {
var scrollPosition=panel.scrollPosition;
scrollPosition += delta;
panel.scrollTo(scrollPosition)
}
}
}, {
_currentInstance: null, getCurrentInstance: function getCurrentInstance() {
return CommonJS.Immersive.SurfaceSizeObserver._currentInstance
}
})})
})();
(function appexPlatformControlsSemanticZoomPanoramaInit(WinJS) {
"use strict";
var NS=WinJS.Namespace.define("CommonJS.Immersive", {SemanticZoomPanoramaPanel: WinJS.Class.derive(CommonJS.Immersive.PanoramaPanel, function semanticZoomPanoramaPanel_ctor(element, options) {
CommonJS.Immersive.PanoramaPanel.call(this, element, options)
}, {
_zoomableView: null, _isSemanticZoomPanoramaPanel: true, zoomableView: {
get: function get() {
return this._zoomableView
}, set: function set(value) {
this._zoomableView = value
}
}, dispose: function dispose() {
this._zoomableView = null;
CommonJS.Immersive.PanoramaPanel.prototype.dispose.call(this)
}
})})
})(WinJS);
(function appexPlatformControlsSemanticZoomPanoramaInit(WinJS) {
"use strict";
var NS=WinJS.Namespace.define("CommonJS.Immersive", {SemanticZoomPanoramaVirtualizer: WinJS.Class.derive(CommonJS.Immersive.PanoramaVirtualizer, function semanticZoomPanoramaVirtualizer_ctor(panoramaPanel, focusManager, panoramaControl, panoramaEventManager) {
CommonJS.Immersive.PanoramaVirtualizer.call(this, panoramaPanel, focusManager, panoramaEventManager);
this._panoramaControl = panoramaControl
}, {
_isZoomedOut: null, _triggerZoom: null, _selectedIndex: null, _panoramaControl: null, _afterRealizeFirstView: function _afterRealizeFirstView() {
if (this._panoramaControl) {
this._panoramaControl.initializeSemanticZoom();
var sematicZoomControl=this._panoramaControl.semanticZoom;
if (sematicZoomControl) {
if (this._panoramaControl._lockSeZo) {
sematicZoomControl.locked = true
}
else {
sematicZoomControl.locked = false;
try {
sematicZoomControl._hideSemanticZoomButton(true)
}
catch(e) {
console.warn("exception is thrown from sematicZoomControl._hideSemanticZoomButton(true); error message: " + e);
debugger
}
}
}
this._panoramaControl.initializeCustomizationView();
CommonJS.Immersive.PanoramaVirtualizer.prototype._afterRealizeFirstView.call(this)
}
}, beginZoom: function beginZoom(){}, configureForZoom: function configureForZoom(isZoomedOut, isCurrentView, triggerZoom, prefectchedPages) {
this._isZoomedOut = isZoomedOut;
this._triggerZoom = triggerZoom
}, endZoom: function endZoom(isCurrentView, setFocus){}, dispose: function dispose() {
CommonJS.Immersive.PanoramaVirtualizer.prototype.dispose.call(this);
this._triggerZoom = null;
this._panoramaControl = null
}, getCurrentItem: function getCurrentItem() {
var panel=this._panel;
if (!panel) {
console.log("getCurrentItem: Null or undefined panel")
}
else {
var item=panel.current;
var dataSource=this._dataSource;
if (item) {
var pos={
left: item.offset, top: item.element.offsetTop, width: item.width, height: item.element.offsetHeight
};
return dataSource.fromIndex(item.index).then(function semanticZoomPanoramaVirtualizer_dataSourceFromIndexComplete(listItem) {
return WinJS.Promise.wrap({
item: listItem, position: pos
})
})
}
}
return null
}, getPanAxis: function getPanAxis() {
return "horizontal"
}, handlePointer: function handlePointer(pointerId){}, positionItem: function positionItem(listItem, position) {
var that=this;
return this._getItemIndexAsync(listItem).then(function positionFoundItem(index) {
that.setCurrentIndex(index, true);
that._selectedIndex = index;
return {
x: 0, y: 0
}
})
}, setCurrentItem: function setCurrentItem(x, y){}, _getItemIndexAsync: function _getItemIndexAsync(findItem) {
if (!findItem.data) {
return WinJS.Promise.wrap(findItem.firstItemIndexHint)
}
var clusterKey=findItem.data.clusterKey;
var promises=[];
for (var i=0; i < this._totalCount(); i++) {
promises.push(this._dataSource.fromIndex(i))
}
return WinJS.Promise.join(promises).then(function findMatchIndex(results) {
for (var index=0; index < results.length; index++) {
if (results[index] && results[index].data && results[index].data.clusterKey === clusterKey) {
return index
}
}
return findItem.firstItemIndexHint
})
}, dataSource: {set: function set(value) {
var panoramaControl=this._panoramaControl,
currentList=this._dataSource ? this._dataSource._list : null,
updatedList=value ? value._list : null,
list=updatedList ? updatedList._list : null;
var isNonZoomableCluster=(list && list.length === 1 && list.getItem(0).data.clusterKey === "nextSteps");
panoramaControl._lockSeZo = false;
if (panoramaControl) {
if (!currentList && list && list.length === 0) {
panoramaControl._lockSeZo = true
}
else if (isNonZoomableCluster) {
panoramaControl._lockSeZo = true
}
}
var parentDataSource=Object.getOwnPropertyDescriptor(CommonJS.Immersive.PanoramaVirtualizer.prototype, "dataSource");
parentDataSource.set.call(this, value)
}}
})})
})(WinJS);
(function appexPlatformCoordsNavigableViewInit() {
"use strict";
var NV=CommonJS.NavigableView;
WinJS.Namespace.define("CommonJS.NavigableView", {CoordsNavigableView: WinJS.Class.define(function coordsNavigableView_ctor(element, model) {
this._element = element || document.createElement("div");
this._model = model || this._buildModel(element);
var elementData=PlatformJS.Utilities.parseDataAttribute("data-platform-cnv", this.element);
if (elementData) {
this._numCols = elementData.numCols;
this._numRows = elementData.numRows
}
}, {
_element: null, _numCols: 0, _numRows: 0, _model: null, _modelIndex: null, element: {get: function get() {
return this._element
}}, isNavigableItem: function isNavigableItem(item) {
return item.getAttribute("data-platform-cnv")
}, getActiveItem: function getActiveItem() {
return this._element && this._element.querySelector("[tabIndex='0']")
}, getNavigableItems: function getNavigableItems() {
return this._element && this._element.querySelectorAll("[data-platform-cnv]")
}, getNextItem: function getNextItem(eventTarget, eventKeyCode) {
var currentItemData=PlatformJS.Utilities.parseDataAttribute("data-platform-cnv", eventTarget),
modelIndex={
col: currentItemData.col, row: currentItemData.row
};
switch (eventKeyCode) {
case WinJS.Utilities.Key.upArrow:
this._moveModelUp(modelIndex);
break;
case WinJS.Utilities.Key.rightArrow:
this._moveModelRight(modelIndex);
break;
case WinJS.Utilities.Key.downArrow:
this._moveModelDown(modelIndex);
break;
case WinJS.Utilities.Key.leftArrow:
this._moveModelLeft(modelIndex);
break;
default:
break
}
return this._model[modelIndex.col][modelIndex.row]
}, _buildModel: function _buildModel(element) {
var model=[],
navigableItems=this.getNavigableItems();
if (!navigableItems) {
return model
}
for (var i=0, navigableItemsLength=navigableItems.length; i < navigableItemsLength; i++) {
var navigableItem=navigableItems[i],
navigableItemData=PlatformJS.Utilities.parseDataAttribute("data-platform-cnv", navigableItem);
if (navigableItemData) {
var col=navigableItemData.col,
row=navigableItemData.row;
if (!model[col]) {
model[col] = []
}
model[col][row] = navigableItem
}
}
return model
}, _moveModelUp: function _moveModelUp(modelIndex) {
if (modelIndex.row === 0) {
NV.dispatchBoundaryEvent(this._element, NV.Direction.UP)
}
else {
modelIndex.row--
}
}, _moveModelRight: function _moveModelRight(modelIndex) {
if (modelIndex.col === this._numCols - 1) {
NV.dispatchBoundaryEvent(this._element, NV.Direction.RIGHT)
}
else {
modelIndex.col++
}
}, _moveModelDown: function _moveModelDown(modelIndex) {
if (modelIndex.row === this._numRows - 1) {
NV.dispatchBoundaryEvent(this._element, NV.Direction.DOWN)
}
else {
modelIndex.row++
}
}, _moveModelLeft: function _moveModelLeft(modelIndex) {
if (modelIndex.col === 0) {
NV.dispatchBoundaryEvent(this._element, NV.Direction.LEFT)
}
else {
modelIndex.col--
}
}
})})
})();
(function appexPlatformsNavigableViewInit() {
"use strict";
var NV=WinJS.Namespace.define("CommonJS.NavigableView", {
_elementIds: 0, ItemBounds: {
top: null, right: null, bottom: null, left: null
}, ItemPointers: {
up: null, right: null, down: null, left: null
}, ItemInfo: {
id: null, bounds: null, pointers: null
}, BoundaryEventDetail: {direction: null}, Direction: {
UP: "up", RIGHT: "right", DOWN: "down", LEFT: "left"
}, createItemId: function createItemId() {
return "pnv_" + NV._elementIds++
}, createItemInfo: function createItemInfo(id) {
return Object.create(NV.ItemInfo, {
id: {value: id || NV.createItemId()}, bounds: {value: Object.create(NV.ItemBounds)}, pointers: {value: Object.create(NV.ItemPointers)}
})
}, createItemInfos: function createItemInfos(elements) {
var itemInfos=[];
for (var elementKey in elements) {
if (elements[elementKey]) {
var element=elements[elementKey],
itemInfo=this.createItemInfo(element.id);
itemInfo.parentNode = element.parentNode;
itemInfo.className = element.className;
itemInfos[elementKey] = itemInfo
}
}
return itemInfos
}, getItemBounds: function getItemBounds(element) {
return Object.create(NV.ItemBounds, {
top: {value: element.offsetTop + 1}, right: {value: element.offsetLeft + element.offsetWidth - 1}, bottom: {value: element.offsetTop + element.offsetHeight - 1}, left: {value: element.offsetLeft + 1}
})
}, addBoundsMetaDataToItemInfos: function addBoundsMetaDataToItemInfos(itemInfos, elements) {
for (var key in itemInfos) {
var element=elements[key],
itemInfo=itemInfos[key];
if (itemInfo && element) {
var bounds=NV.getItemBounds(element);
itemInfo.bounds.top = bounds.top;
itemInfo.bounds.right = bounds.right;
itemInfo.bounds.bottom = bounds.bottom;
itemInfo.bounds.left = bounds.left
}
}
}, addPointersMetaDataToItemInfos: function addPointersMetaDataToItemInfos(itemInfos, isLtr, isGridBased, filter) {
for (var key in itemInfos) {
var itemInfo=itemInfos[key];
if (itemInfo && itemInfo.bounds) {
NV.addPointersMetaDataToItemInfo(itemInfo, itemInfos, isLtr, isGridBased, filter)
}
}
}, addPointersMetaDataToItemInfo: function addPointersMetaDataToItemInfo(itemInfo, itemInfos, isLtr, isGridBased, filter) {
var flipHorizontal=(!isLtr && isGridBased) ? true : false;
NV._addTopPointer(itemInfo, itemInfos, isLtr, filter);
NV._addRightPointer(itemInfo, itemInfos, isLtr, flipHorizontal, filter);
NV._addDownPointer(itemInfo, itemInfos, isLtr, filter);
NV._addLeftPointer(itemInfo, itemInfos, isLtr, flipHorizontal, filter)
}, addPnvDataAttributesToElements: function addPnvDataAttributesToElements(itemInfos, elements) {
for (var key in itemInfos) {
var element=elements[key],
itemInfo=itemInfos[key];
if (element && itemInfo && itemInfo.pointers) {
if (!element.id) {
element.id = itemInfo.id
}
element.setAttribute("data-platform-pnv", JSON.stringify(itemInfo.pointers))
}
}
}, isItemAbove: function isItemAbove(srcBounds, isAboveBounds) {
return isAboveBounds.bottom <= srcBounds.top
}, isItemToRight: function isItemToRight(srcBounds, isToRightBounds) {
return isToRightBounds.left >= srcBounds.right
}, isItemBelow: function isItemBelow(srcBounds, isBelowBounds) {
return isBelowBounds.top >= srcBounds.bottom
}, isItemToLeft: function isItemToLeft(srcBounds, isToLeftBounds) {
return isToLeftBounds.right <= srcBounds.left
}, dispatchBoundaryEvent: function dispatchBoundaryEvent(element, direction) {
var event=document.createEvent("CustomEvent");
while (element && !WinJS.Utilities.hasClass(element, "platformClusterContent")) {
element = element.parentElement
}
if (element) {
event.initCustomEvent("contentbounds", false, false, Object.create(NV.BoundaryEventDetail, {direction: {value: direction}}));
element.dispatchEvent(event)
}
}, convertElementsToPnvItems: function convertElementsToPnvItems(itemInfos, siblingElements, isLtr, isGridBased, filter) {
NV.addBoundsMetaDataToItemInfos(itemInfos, siblingElements);
NV.addPointersMetaDataToItemInfos(itemInfos, isLtr, isGridBased, filter);
NV.addPnvDataAttributesToElements(itemInfos, siblingElements)
}, _addTopPointer: function _addTopPointer(itemInfo, itemInfos, isLtr, filter) {
if (itemInfo.pointers.up === null) {
var itemAbove=NV._getItemAbove(itemInfo, itemInfos, isLtr, filter);
if (itemAbove) {
itemInfo.pointers.up = itemAbove.id;
if (itemAbove.pointers.down === null) {
itemAbove.pointers.down = itemInfo.id
}
}
}
}, _addRightPointer: function _addRightPointer(itemInfo, itemInfos, isLtr, horizontalFlip, filter) {
if (itemInfo.pointers.right === null) {
var itemToRight=NV._getItemToRight(itemInfo, itemInfos, isLtr, filter);
if (itemToRight) {
if (!horizontalFlip) {
itemInfo.pointers.right = itemToRight.id;
if (itemToRight.pointers.left === null) {
itemToRight.pointers.left = itemInfo.id
}
}
else {
itemInfo.pointers.left = itemToRight.id;
if (itemToRight.pointers.right === null) {
itemToRight.pointers.right = itemInfo.id
}
}
}
}
}, _addDownPointer: function _addDownPointer(itemInfo, itemInfos, isLtr, filter) {
if (itemInfo.pointers.down === null) {
var itemBelow=NV._getItemBelow(itemInfo, itemInfos, isLtr, filter);
if (itemBelow) {
itemInfo.pointers.down = itemBelow.id;
if (itemBelow.pointers.up === null) {
itemBelow.pointers.up = itemInfo.id
}
}
}
}, _addLeftPointer: function _addLeftPointer(itemInfo, itemInfos, isLtr, horizontalFlip, filter) {
if (itemInfo.pointers.left === null) {
var itemToLeft=NV._getItemToLeft(itemInfo, itemInfos, isLtr, filter);
if (itemToLeft) {
if (!horizontalFlip) {
itemInfo.pointers.left = itemToLeft.id;
if (itemToLeft.pointers.right === null) {
itemToLeft.pointers.right = itemInfo.id
}
}
else {
itemInfo.pointers.right = itemToLeft.id;
if (itemToLeft.pointers.left === null) {
itemToLeft.pointers.left = itemInfo.id
}
}
}
}
}, _getItemAbove: function _getItemAbove(currentItemInfo, itemInfos, isLtr, filter) {
var allItemsAbove=[],
currentItemBounds=currentItemInfo.bounds;
for (var i=0, otherItemInfo, otherItemBounds, itemInfosLength=itemInfos.length; i < itemInfosLength; i++) {
otherItemInfo = itemInfos[i];
if (otherItemInfo && otherItemInfo !== currentItemInfo && !otherItemInfo.isAd) {
otherItemBounds = otherItemInfo.bounds;
if (NV.isItemAbove(currentItemBounds, otherItemBounds) && !NV.isItemToLeft(currentItemBounds, otherItemBounds) && !NV.isItemToRight(currentItemBounds, otherItemBounds)) {
allItemsAbove.push(otherItemInfo)
}
}
}
if (filter) {
filter(currentItemInfo, allItemsAbove, itemInfos)
}
allItemsAbove.sort(function navigableView_allItemsAboveCompare(a, b) {
return b.bounds.top - a.bounds.top
});
return allItemsAbove[0] || null
}, _getItemToRight: function _getItemToRight(currentItemInfo, itemInfos, isLtr, filter) {
var allItemsToRight=[],
currentItemBounds=currentItemInfo.bounds;
for (var i=0, otherItemInfo, otherItemBounds, itemInfosLength=itemInfos.length; i < itemInfosLength; i++) {
otherItemInfo = itemInfos[i];
if (otherItemInfo && otherItemInfo !== currentItemInfo && !otherItemInfo.isAd) {
otherItemBounds = otherItemInfo.bounds;
if (NV.isItemToRight(currentItemBounds, otherItemBounds) && !NV.isItemAbove(currentItemBounds, otherItemBounds) && !NV.isItemBelow(currentItemBounds, otherItemBounds)) {
allItemsToRight.push(otherItemInfo)
}
}
}
if (filter) {
filter(currentItemInfo, allItemsToRight, itemInfos)
}
allItemsToRight.sort(function allItemsToRightCompareFunc(a, b) {
return a.bounds.left - b.bounds.left
});
return allItemsToRight[0] || null
}, _getItemBelow: function _getItemBelow(currentItemInfo, itemInfos, isLtr, filter) {
var allItemsBelow=[],
currentItemBounds=currentItemInfo.bounds;
for (var i=0, otherItemInfo, otherItemBounds, itemInfosLength=itemInfos.length; i < itemInfosLength; i++) {
otherItemInfo = itemInfos[i];
if (otherItemInfo && otherItemInfo !== currentItemInfo && !otherItemInfo.isAd) {
otherItemBounds = otherItemInfo.bounds;
if (NV.isItemBelow(currentItemBounds, otherItemBounds) && !NV.isItemToLeft(currentItemBounds, otherItemBounds) && !NV.isItemToRight(currentItemBounds, otherItemBounds)) {
allItemsBelow.push(otherItemInfo)
}
}
}
if (filter) {
filter(currentItemInfo, allItemsBelow, itemInfos)
}
allItemsBelow.sort(function allItemsBelowCompareFunc(a, b) {
return a.bounds.top - b.bounds.top
});
return allItemsBelow[0] || null
}, _getItemToLeft: function _getItemToLeft(currentItemInfo, itemInfos, isLtr, filter) {
var allItemsToLeft=[],
currentItemBounds=currentItemInfo.bounds;
for (var i=0, otherItemInfo, otherItemBounds, itemInfosLength=itemInfos.length; i < itemInfosLength; i++) {
otherItemInfo = itemInfos[i];
if (otherItemInfo && otherItemInfo !== currentItemInfo && !otherItemInfo.isAd) {
otherItemBounds = otherItemInfo.bounds;
if (NV.isItemToLeft(currentItemBounds, otherItemBounds) && !NV.isItemAbove(currentItemBounds, otherItemBounds) && !NV.isItemBelow(currentItemBounds, otherItemBounds)) {
allItemsToLeft.push(otherItemInfo)
}
}
}
if (filter) {
filter(currentItemInfo, allItemsToLeft, itemInfos)
}
allItemsToLeft.sort(function allItemsToLeftCompareFunc(a, b) {
return b.bounds.left - a.bounds.left
});
if (isLtr) {
allItemsToLeft.reverse()
}
return allItemsToLeft[0] || null
}, NavigableViewOrchestrator: WinJS.Class.define(function _NavigableViewOrchestrator_ctor(element, navigableChildren, filter) {
this._navigableView = new CommonJS.NavigableView.PointerNavigableView(element, navigableChildren);
this._focusManager = new CommonJS.NavigableView.RovingTabIndexManager(this._navigableView),
this._orientationManager = new CommonJS.NavigableView.NavigableViewOrientationManager;
this._filter = filter;
this._bindings.onNavigableViewActivated = this._onNavigableViewActivated.bind(this);
this._navigableView.addEventListener("activated", this._bindings.onNavigableViewActivated)
}, {
_bindings: {onNavigableViewActivated: null}, _navigableView: null, _focusManager: null, _orientationManager: null, _filter: null, _onNavigableViewActivated: function _onNavigableViewActivated() {
this._render()
}, _render: function _render(itemInfos) {
if (!this._navigableView) {
return
}
var elements=this._navigableView.getNavigableItems();
if (itemInfos) {
CommonJS.NavigableView.addPnvDataAttributesToElements(itemInfos, elements)
}
else {
itemInfos = CommonJS.NavigableView.createItemInfos(elements);
CommonJS.NavigableView.convertElementsToPnvItems(itemInfos, elements, null, null, this._filter);
this._orientationManager.itemInfos = itemInfos
}
}, navigableView: {get: function get() {
return this._navigableView
}}, onWindowResize: function onWindowResize(event) {
CommonJS.WindowEventManager.HandleWindowResizeEvent.call(this, event, function HandleWindowResize() {
var displayData=PlatformJS.Utilities.getDisplayData();
if (this._navigableView && this._navigableView.isActivated) {
var itemInfos=null;
var detail=event.detail || event.platFormDetail;
if (detail.hasOrientationChanged) {
itemInfos = this._orientationManager.itemInfos
}
else {
this._orientationManager.reset()
}
this._render(itemInfos)
}
})
}, dispose: function dispose() {
if (this._navigableView) {
this._navigableView.removeEventListener("activated", this._bindings.onNavigableViewActivated)
}
this._bindings.onNavigableViewActivated = null;
this._bindings = null;
this._navigableView = null;
this._focusManager.dispose();
this._focusManager = null;
this._orientationManager = null
}
}, {})
})
})();
(function appexPlatformPointerNavigableViewInit() {
"use strict";
var NV=CommonJS.NavigableView;
WinJS.Namespace.define("CommonJS.NavigableView", {PointerNavigableView: WinJS.Class.define(function pointerNavigableView_ctor(element, navigableChildren) {
this._element = element;
this._navigableItems = navigableChildren
}, {
_element: null, _navigableItems: null, isActivated: false, element: {get: function get() {
return this._element
}}, activate: function activate() {
this.isActivated = true;
this.dispatchEvent("activated")
}, isNavigableItem: function isNavigableItem(item) {
return item.getAttribute("data-platform-pnv")
}, getActiveItem: function getActiveItem() {
return this._element && this._element.querySelector("div[tabIndex='0']")
}, getNavigableItems: function getNavigableItems() {
return this._navigableItems
}, getNextItem: function getNextItem(eventTarget, eventKeyCode) {
var nextItem=null;
if (PlatformJS.Utilities.isCursorKey(event.keyCode)) {
if (this.isActivated === false) {
this.activate()
}
var pointerData=PlatformJS.Utilities.parseDataAttribute("data-platform-pnv", eventTarget);
switch (eventKeyCode) {
case WinJS.Utilities.Key.upArrow:
nextItem = this._onArrow(pointerData, NV.Direction.UP);
this._setPointer(nextItem, NV.Direction.DOWN, eventTarget.id);
break;
case WinJS.Utilities.Key.rightArrow:
nextItem = this._onArrow(pointerData, NV.Direction.RIGHT);
this._setPointer(nextItem, NV.Direction.LEFT, eventTarget.id);
break;
case WinJS.Utilities.Key.downArrow:
nextItem = this._onArrow(pointerData, NV.Direction.DOWN);
this._setPointer(nextItem, NV.Direction.UP, eventTarget.id);
break;
case WinJS.Utilities.Key.leftArrow:
nextItem = this._onArrow(pointerData, NV.Direction.LEFT);
this._setPointer(nextItem, NV.Direction.RIGHT, eventTarget.id);
break;
default:
break
}
}
return nextItem
}, _setPointer: function _setPointer(item, direction, id) {
if (item) {
var pointerData=PlatformJS.Utilities.parseDataAttribute("data-platform-pnv", item);
pointerData[direction] = id;
item.setAttribute("data-platform-pnv", JSON.stringify(pointerData))
}
}, _onArrow: function _onArrow(pointerData, direction) {
var nextItem=null;
if (pointerData !== null) {
var childId=pointerData[direction];
nextItem = document.getElementById(childId) || null
}
if (nextItem === null) {
NV.dispatchBoundaryEvent(this._element, direction)
}
return nextItem
}
})});
WinJS.Class.mix(CommonJS.NavigableView.PointerNavigableView, WinJS.Utilities.eventMixin);
WinJS.Class.mix(CommonJS.NavigableView.PointerNavigableView, WinJS.Utilities.createEventProperties("activated"))
})();
(function appexPlatformPointerNavigableViewOrientationManagerInit() {
"use strict";
var NV=CommonJS.NavigableView;
WinJS.Namespace.define("CommonJS.NavigableView", {
PointerNavigableViewOrientationManager: WinJS.Class.define(function pointerNavigableViewOrientationManager_ctor(navigableView, initialItemInfos, elements, isAssociativeElementArray) {
this._navigableView = navigableView;
this._itemInfos = {
orientation1: initialItemInfos, orientation2: null
},
this._elements = elements;
this._isAssociativeElementArray = isAssociativeElementArray || false
}, {
_elements: null, _itemInfos: {
orientation1: null, orientation2: null
}, _isOrientation1: true, toggleOrientation: function toggleOrientation() {
if (this._isOrientation1 === true) {
if (!this._itemInfos.orientation2) {
var isLtr=window.getComputedStyle(document.body).direction !== "rtl";
this._itemInfos.orientation2 = NV.createItemInfos(this._elements, this._isAssociativeElementArray);
NV.addBoundsMetaDataToItemInfos(this._itemInfos.orientation2, this._elements);
NV.addPointersMetaDataToItemInfos(this._itemInfos.orientation2, isLtr)
}
NV.addPnvDataAttributesToElements(this._itemInfos.orientation2, this._elements);
this._isOrientation1 = false
}
else {
NV.addPnvDataAttributesToElements(this._itemInfos.orientation1, this._elements);
this._isOrientation1 = true
}
}
}), NavigableViewOrientationManager: WinJS.Class.define(function navigableViewOrientationManager_ctor() {
this._landscapeItemInfos = null;
this._portraitItemInfos = null
}, {
_landscapeItemInfos: null, _portraitItemInfos: null, _isLandscape: function _isLandscape() {
var orientation=Windows.UI.ViewManagement.ApplicationView.value;
return orientation === Windows.UI.ViewManagement.ApplicationViewState.fullScreenLandscape || orientation === Windows.UI.ViewManagement.ApplicationViewState.filled
}, itemInfos: {
get: function get() {
return (this._isLandscape() === true) ? this._landscapeItemInfos : this._portraitItemInfos
}, set: function set(itemInfos) {
if (this._isLandscape()) {
this._landscapeItemInfos = itemInfos
}
else {
this._portraitItemInfos = itemInfos
}
}
}, reset: function reset() {
this._landscapeItemInfos = null;
this._portraitItemInfos = null
}
})
})
})();
(function appexPlatformRovingTabIndexManagerInit() {
"use strict";
var NV=CommonJS.NavigableView;
WinJS.Namespace.define("CommonJS.NavigableView", {RovingTabIndexManager: WinJS.Class.define(function rovingTabIndexManager_ctor(navigableView) {
this._navigableView = navigableView;
this._bindings.onKeyDown = this._onKeyDown.bind(this);
if (this._navigableView) {
var navigableItems=this._navigableView.getNavigableItems(),
activeItem=this._navigableView.getActiveItem() || null;
if (activeItem) {
this._disableNavigableItems(navigableItems, activeItem);
this._navigableView.element.addEventListener("keydown", this._bindings.onKeyDown)
}
}
}, {
_bindings: {onKeyDown: null}, _navigableView: null, _disableNavigableItems: function _disableNavigableItems(navigableItems, activeItem) {
for (var key in navigableItems) {
var navigableItem=navigableItems[key];
if (activeItem !== navigableItem) {
navigableItem.tabIndex = -1
}
}
;
}, _onKeyDown: function _onKeyDown(event) {
if (!event.altKey && PlatformJS.Utilities.isCursorKey(event.keyCode)) {
event.stopImmediatePropagation();
event.preventDefault();
var currentItem=event.target,
nextItem=this._navigableView && this._navigableView.getNextItem(currentItem, event.keyCode);
if (nextItem) {
currentItem.tabIndex = -1;
nextItem.tabIndex = 0;
CommonJS.Immersive.PanoramaFocusManager.animationToContent(nextItem)
}
}
}, dispose: function dispose() {
if (this._navigableView) {
this._navigableView.element.removeEventListener("keydown", this._bindings.onKeyDown)
}
this._bindings.onKeyDown = null
}
})})
})();
(function appexPlatformSequentialNavigableViewInit() {
"use strict";
var NV=CommonJS.NavigableView;
WinJS.Namespace.define("CommonJS.NavigableView", {SequentialNavigableView: WinJS.Class.define(function sequentialNavigableView_ctor(element) {
this.element = element;
NV._elementIds++
}, {
_element: null, element: {
get: function get() {
return this._element
}, set: function set(newElement) {
this._element = newElement
}
}, getNavigableItems: function getNavigableItems() {
var navigableItems=[];
for (var i=0, childrenLength=this._element.children.length; i < childrenLength; i++) {
var child=this._element.children[i];
if (this.isNavigableItem(child)) {
navigableItems.push(child)
}
}
return navigableItems
}, isNavigableItem: function isNavigableItem(item) {
return WinJS.Utilities.hasClass(item, "platformClusterItem")
}, getNextItem: function getNextItem(item, keyCode) {
var nextItem;
var rtl=(document.dir === "rtl");
switch (keyCode) {
case WinJS.Utilities.Key.upArrow:
nextItem = item.previousSibling;
break;
case WinJS.Utilities.Key.downArrow:
nextItem = item.nextSibling;
break;
case WinJS.Utilities.Key.leftArrow:
nextItem = rtl ? item.nextSibling : item.previousSibling;
break;
case WinJS.Utilities.Key.rightArrow:
nextItem = rtl ? item.previousSibling : item.nextSibling;
break;
default:
break
}
if (nextItem && !this.isNavigableItem(nextItem)) {
nextItem = this.getNextItem(nextItem, keyCode)
}
return nextItem
}
})})
})();
(function appexPlatformControlsSearchDialogInit() {
"use strict";
var NS=WinJS.Namespace.define("CommonJS", {SearchDialog: WinJS.Class.define(function searchDialog_ctor(flyout, options) {
var that=this;
var element=flyout.getContentElement();
this.element = element ? element : document.createElement("div");
WinJS.Utilities.addClass(this.element, "platformSearchDialog");
this._displayData = PlatformJS.Utilities.getDisplayData();
this._setupWidthMaintenance();
this._createSearchBox();
this._createStaticContents();
this._createButtons();
this._constructDialog();
this.autoSuggest = new CommonJS.AutoSuggest(this._searchBox);
this.onCloseButtonClick = function() {
that.searchVisible = false
};
WinJS.UI.setOptions(this, options);
this.flyout = flyout;
this.message = "";
this.searchVisible = true;
CommonJS.WindowEventManager.addEventListener(CommonJS.WindowEventManager.Events.WINDOW_RESIZE, this._onResize);
this._searchBox.focus()
}, {
_prompt: null, _searchBox: null, _progress: null, _message: null, _closeButton: null, _addButton: null, _isVisible: false, _flyout: null, _ignoreNextEnter: false, _appViewType: 0, element: null, autoSuggest: null, _displayData: null, flyout: {
set: function set(value) {
var that=this;
this._flyout = value;
value.onHide = function() {
CommonJS.WindowEventManager.removeEventListener(CommonJS.WindowEventManager.Events.WINDOW_RESIZE, that._onResize);
that.autoSuggest.hide();
if (that.onHide) {
that.onHide()
}
CommonJS.processListener.enableSearchOnType()
}
}, get: function get(value) {
return this._flyout
}
}, promptText: {set: function set(value) {
this._prompt.textContent = value
}}, closeButtonText: {set: function set(value) {
this._closeButton.textContent = value
}}, message: {set: function set(value) {
this._message.innerText = value
}}, searchVisible: {
set: function set(value) {
if (this._isVisible === value) {
return
}
this._isVisible = value;
if (!value) {
CommonJS.processListener.enableSearchOnType();
this.flyout.hide()
}
else {
CommonJS.processListener.disableSearchOnType();
this.flyout.show()
}
}, get: function get() {
return this._isVisible
}
}, extraButtons: {set: function set(value) {
for (var i=0, len=value.length; i < len; i++) {
var button=value[i];
if (button && button.icon && button.clickHandler) {
var theme=button.theme || "light";
var title=button.title || "untitled";
this._addExtraButton(button.icon, button.clickHandler, button.pressedIcon, theme, title)
}
}
}}, autoSuggestOptions: {set: function set(value) {
WinJS.UI.setOptions(this.autoSuggest, value)
}}, searchPlaceholderText: {set: function set(value) {
this._overlay.innerText = value
}}, maxLength: {set: function set(value) {
this._searchBox.maxLength = value
}}, searchBoxText: {
set: function set(value) {
this._searchBox.value = value
}, get: function get(value) {
return this._searchBox.value
}
}, searchSuggestions: {
set: function set(value) {
this.autoSuggest.itemDataSource = value.suggestions
}, get: function get() {
return this.autoSuggest._itemDataSource
}
}, onHide: null, onCloseButtonClick: {
set: function set(value) {
this._closeButton.onclick = value
}, get: function get(value) {
return this._closeButton.onclick
}
}, onSearchTextEntered: {set: function set(value) {
var that=this;
this.autoSuggest.onItemSelection = function(index, event) {
that._addButton.disabled = true;
value({
queryText: that.searchBoxText, src: that, index: index
}, that);
if (event && event.key === "Enter") {
that._ignoreNextEnter = true;
that.element.focus()
}
};
this._searchBox.addEventListener("keydown", function searchDialog_onKeyDown(event) {
if (!that._ignoreNextEnter && event.key === "Enter" && !that.autoSuggest._inIME) {
value({
queryText: that.searchBoxText, src: that
}, that)
}
that._ignoreNextEnter = false
});
this._addButton.addEventListener("click", function searchDialog_onClick() {
var evt=document.createEvent("KeyboardEvent");
evt.initKeyboardEvent("keydown", true, true, window, "Enter", 0, "", false, "");
that._searchBox.dispatchEvent(evt);
that._addButton.disabled = true
})
}}, onSearchSuggestionsRequested: {set: function set(value) {
var that=this;
this.autoSuggest.keyup = function(event) {
event.queryText = that.searchBoxText;
event.request = {getDeferral: function getDeferral() {
return {complete: function complete(){}}
}};
value(event, that)
}
}}, showSearchProgress: function showSearchProgress() {
WinJS.Utilities.removeClass(this._progress, "platformHide")
}, hideSearchProgress: function hideSearchProgress() {
WinJS.Utilities.addClass(this._progress, "platformHide")
}, _setupWidthMaintenance: function _setupWidthMaintenance() {
var that=this;
this.element.style.width = (this._displayData.clientWidth - CommonJS.SearchDialog._edgeOffset) + "px";
this._appViewType = Windows.UI.ViewManagement.ApplicationView.value;
this._onResize = function(event) {
if (that._appViewType !== Windows.UI.ViewManagement.ApplicationView.value) {
that._appViewType = Windows.UI.ViewManagement.ApplicationView.value
}
that.element.style.width = (that._displayData.clientWidth - CommonJS.SearchDialog._edgeOffset) + "px"
}
}, _createSearchBox: function _createSearchBox() {
var that=this;
this._searchBox = document.createElement("input");
this._searchBox.id = "SearchTextBox";
this._searchBox.type = "text";
this._searchBox.addEventListener("focus", function searchDialog_onFocus() {
that.message = "";
that._addButton.disabled = that.searchBoxText.length === 0
});
this._searchBox.addEventListener("input", function searchDialog_onInput() {
that._addButton.disabled = that.searchBoxText.length === 0;
if (this.value.length !== 0) {
that._overlay.style.visibility = "hidden"
}
else {
that._overlay.style.visibility = "visible"
}
});
this._searchBox.addEventListener("keydown", function searchDialog_onKeyDown(event) {
if (event.shiftKey && event.keyCode === WinJS.Utilities.Key.tab) {
event.preventDefault();
that._closeButton.focus()
}
});
WinJS.Utilities.addClass(this._searchBox, "platformSearchDialogSearchBox")
}, _createStaticContents: function _createStaticContents() {
this._message = document.createElement("div");
WinJS.Utilities.addClass(this._message, "platformSearchDialogMessage");
this._message.setAttribute("aria-label", CommonJS.resourceLoader.getString("/platform/progressAlertAriaLabel"));
this._message.setAttribute("role", "alert");
this._message.setAttribute("aria-atomic", "true");
this._progress = document.createElement("progress");
WinJS.Utilities.addClass(this._progress, "platformSearchDialogProgress platformHide");
this._prompt = document.createElement("div");
WinJS.Utilities.addClass(this._prompt, "platformSearchDialogPrompt");
this._overlay = document.createElement("div");
WinJS.Utilities.addClass(this._overlay, "platformSearchDialogOverlayDiv");
this._overlay.id = "SearchDialog_texboxOverlay"
}, _createButtons: function _createButtons() {
var that=this;
this._extraButtonContainer = document.createElement("div");
WinJS.Utilities.addClass(this._extraButtonContainer, "platformSearchDialogButtonContainer");
this._closeButton = document.createElement("button");
this._closeButton.setAttribute("role", "button");
this._closeButton.id = "SearchDialog_closeButton";
WinJS.Utilities.addClass(this._closeButton, "platformSearchButton rectUIBtnDark platformSearchDialogClose");
this._closeButton.textContent = CommonJS.resourceLoader.getString("/platform/cancel");
this._closeButton.addEventListener("keydown", function searchDialog_closeButton_onKeyDown(evt) {
if (evt.keyCode === WinJS.Utilities.Key.tab && !evt.shiftKey) {
evt.preventDefault();
that._searchBox.focus()
}
});
this._addButton = document.createElement("button");
this._addButton.setAttribute("role", "button");
this._addButton.id = "SearchDialog_addButton";
WinJS.Utilities.addClass(this._addButton, "platformSearchButton rectUIBtnDark platformSearchDialogAdd");
this._addButton.textContent = CommonJS.resourceLoader.getString("/platform/Add");
this._addButton.disabled = true
}, _constructDialog: function _constructDialog() {
var searchBoxContainer=document.createElement("div");
WinJS.Utilities.addClass(searchBoxContainer, "platformSearchDialogSearchBoxContainer");
searchBoxContainer.appendChild(this._searchBox);
searchBoxContainer.appendChild(this._overlay);
var mainRowContainer=document.createElement("div");
WinJS.Utilities.addClass(mainRowContainer, "platformSearchDialogMainRow");
mainRowContainer.appendChild(searchBoxContainer);
mainRowContainer.appendChild(this._extraButtonContainer);
mainRowContainer.appendChild(this._addButton);
mainRowContainer.appendChild(this._closeButton);
this.element.appendChild(this._prompt);
this.element.appendChild(mainRowContainer);
this.element.appendChild(this._progress);
this.element.appendChild(this._message)
}, _addExtraButton: function _addExtraButton(icon, clickHandler, pressedIcon, theme, title) {
var button;
if (pressedIcon) {
button = new CommonJS.Button(null, {
icon: icon, theme: theme, title: title, pressedIcon: pressedIcon, onclick: clickHandler
})
}
else {
button = new CommonJS.Button(null, {
icon: icon, theme: theme, title: title, onclick: clickHandler
})
}
this._extraButtonContainer.appendChild(button.element)
}
}, {
_edgeOffset: 5, show: function show(searchDialogOptions) {
var domElement=document.createElement("div");
WinJS.Utilities.addClass(domElement, "platformSearchDialogFlyout");
var flyout=new CommonJS.Flyout(domElement, {closeButtonHidden: true});
return new CommonJS.SearchDialog(flyout, searchDialogOptions)
}
})})
})();
(function _TempClusterDataProvider_7() {
"use strict";
WinJS.Namespace.define("CommonJS", {TempClusterDataProvider: WinJS.Class.define(function _TempClusterDataProvider_11(options) {
WinJS.UI.setOptions(this, options)
}, {
_gettingStartedCache: "GettingStartedCache", useLocalCache: false, fetchData: function fetchData(dataSourceId) {
var that=this;
return new WinJS.Promise(function _TempClusterDataProvider_20(complete, error, progress) {
if (that.useLocalCache) {
var fileName=that._getCacheFileName();
var response=PlatformJS.BootCache.instance.getEntry(fileName, null);
if (response) {
progress(response)
}
}
PlatformJS.platformInitializedPromise.then(function TempClusterDP_downloadData() {
that._downloadData(dataSourceId, complete)
})
})
}, _downloadData: function _downloadData(dataSourceId, complete) {
var queryService=new PlatformJS.DataService.QueryService(dataSourceId);
var queryParams=PlatformJS.Collections.createStringDictionary();
var market=Platform.Utilities.Globalization.getCurrentMarket();
queryParams.insert("market", market);
var options=new Platform.DataServices.QueryServiceOptions;
options.useCompatDataModel = true;
queryService.downloadDataAsync(queryParams, null, null, options).then(function gsDownloadSuccess(data) {
var result=null;
if (data) {
try {
result = JSON.parse(data.dataString)
}
catch(exp) {
console.log("Invalid json response for GettingStarted Cluster.")
}
}
return result
}, function _TempClusterDataProvider_58(error) {
return null
}).then(function _TempClusterDataProvider_61(result) {
complete(result)
})
}, parseData: function parseData(response) {
var result={};
if (response && response.clusters && response.clusters.length > 0) {
var cluster=response.clusters[0];
if (cluster.entityList && cluster.entityList.entities && cluster.entityList.entities.length > 0) {
var entities=cluster.entityList.entities;
result.clusterTitle = cluster.entityList.categoryName;
result.data = {};
if (entities[0].content && entities[0].content.abstract) {
result.data.messageText = this._stripHTML(entities[0].content.abstract)
}
result.data.contentSlots = [];
for (var index=1, len=entities.length; index < len; index++) {
var entity=entities[index];
if (entity && entity.content) {
var slot={};
slot.slotHeaderText = this._stripHTML(entity.content.headline);
slot.slotText = this._stripHTML(entity.content.abstract);
var icon=this._parseIcon(entity.content.byline);
slot.icon = icon;
slot.isAppExSymbolChar = icon !== false;
slot.destination = entity.destination;
if (entity.content.source && entity.content.source.name) {
slot.actionId = entity.content.source.name
}
result.data.contentSlots.push(slot)
}
}
}
}
if (this.isGettingStartedDataValid(result)) {
if (this.useLocalCache) {
var fileName=this._getCacheFileName();
if (fileName && result) {
PlatformJS.BootCache.instance.addOrUpdateEntry(fileName, result)
}
}
}
else {
result = {}
}
return result
}, _stripHTML: function _stripHTML(string) {
if (string) {
return string.replace(/<(?:.|\n)*?>/gm, "")
}
else {
return ""
}
}, _getCacheFileName: function _getCacheFileName() {
var market=Platform.Utilities.Globalization.getCurrentMarket();
return this._gettingStartedCache + "_" + market
}, _parseIcon: function _parseIcon(iconString) {
if (iconString) {
try {
return "&#" + parseInt(iconString, 16) + ";"
}
catch(exp) {}
}
return false
}, isGettingStartedDataValid: function isGettingStartedDataValid(clusterData) {
var result=false;
if (clusterData && clusterData.data && clusterData.data.contentSlots && clusterData.data.contentSlots.length > CommonJS.TempClusterDataProvider._minContentCount && clusterData.clusterTitle) {
result = true
}
return result
}, parseNextStepsData: function parseNextStepsData(response) {
var result={};
if (response && response.clusters && response.clusters.length > 0) {
var cluster=response.clusters[0];
if (cluster.entityList && cluster.entityList.entities && cluster.entityList.entities.length > 0) {
var entities=cluster.entityList.entities;
result.clusterTitle = cluster.entityList.categoryName;
result.data = {};
result.data.contentSlots = [];
for (var index=0, len=entities.length; index < len; index++) {
var entity=entities[index];
if (entity && entity.content) {
var slot={};
slot.slotHeaderText = this._stripHTML(entity.content.headline);
slot.destination = entity.destination;
var icon=this._parseIcon(entity.content.byline);
if (icon) {
slot.icon = icon;
slot.isAppExSymbolChar = icon !== false
}
if (entity.content.source && entity.content.source.name) {
slot.actionId = entity.content.source.name
}
result.data.contentSlots.push(slot)
}
}
}
}
return result
}
}, {_minContentCount: 1})})
})();
(function _TempCluster_7() {
"use strict";
WinJS.Namespace.define("CommonJS", {TempCluster: WinJS.Class.define(function _TempCluster_11(domElement, options) {
this._domElement = domElement || document.createElement("div");
this._domElement.winControl = this;
CommonJS.Utils.markDisposable(this._domElement);
WinJS.UI.setOptions(this, options);
this._updateMessageData();
this._rendererMap = {
gsTemplate: {
renderer: this._gsTemplateRenderer.bind(this), clusterName: "Getting Started", navMethodName: "Getting Started Cluster"
}, nsTemplate: {
renderer: this._nsTemplateRenderer.bind(this), clusterName: "Next Steps", navMethodName: "Next Steps Cluster"
}
}
}, {
_domElement: null, _removeCluster: null, _dismissAction: "dismiss", _renderPromise: null, _scheduler: null, clusterKey: null, clusterList: null, messageData: null, templateName: "", clusterClass: "", scheduler: {
get: function get() {
return this._scheduler
}, set: function set(value) {
this._scheduler = value
}
}, removeClusterHandler: {set: function set(value) {
this._removeCluster = value
}}, render: function render() {
var that=this;
var promise=WinJS.Promise.wrap(null);
var config=that._rendererMap[that.templateName];
if (config && config.renderer) {
promise = config.renderer()
}
return promise
}, _gsTemplateRenderer: function _gsTemplateRenderer() {
return this._renderTemplate("templateGSMessageHost", "slotIcon win-commandring win-commandicon")
}, _nsTemplateRenderer: function _nsTemplateRenderer() {
return this._renderTemplate("templateNSMessageHost", "slotIcon")
}, _renderTemplate: function _renderTemplate(containerClass, iconClass) {
var that=this;
return CommonJS.SchedulePromise(this._scheduler, CommonJS.TaskPriority.normal, "TempClusterRender").then(function TempClusterRenderComplete() {
if (!that._domElement) {
return
}
var host=that._createGSHost(containerClass, that.messageData);
var contentBlock=host.querySelector(".contentBlock");
var contentSlotDataList=that.messageData.contentSlots;
if (contentSlotDataList) {
for (var index=0, len=contentSlotDataList.length; index < len; index++) {
var contentData=contentSlotDataList[index];
var contentElement=that._createContentSlot(contentData, iconClass, index);
contentBlock.appendChild(contentElement)
}
}
if (that.clusterClass) {
var clusterNode=that._domElement.parentNode;
if (WinJS.Utilities.hasClass(clusterNode, "platformCluster")) {
WinJS.Utilities.addClass(clusterNode, that.clusterClass)
}
}
that._domElement.appendChild(host)
})
}, _createGSHost: function _createGSHost(containerClassName, data) {
var addClass=WinJS.Utilities.addClass;
var host=document.createElement("div");
addClass(host, containerClassName);
var messageContainer=document.createElement("div");
addClass(messageContainer, "messageContainer");
host.appendChild(messageContainer);
if (data.messageText) {
var headerBlock=document.createElement("div");
addClass(headerBlock, "headerBlock");
messageContainer.appendChild(headerBlock);
var headerMessage=document.createElement("div");
addClass(headerMessage, "headerMessage");
headerMessage.innerText = data.messageText;
headerBlock.appendChild(headerMessage)
}
var contentBlock=document.createElement("div");
addClass(contentBlock, "contentBlock");
messageContainer.appendChild(contentBlock);
return host
}, _createContentSlot: function _createContentSlot(data, iconClass, index) {
var addClass=WinJS.Utilities.addClass;
var slotContainer=document.createElement("div");
addClass(slotContainer, "slotContainer");
slotContainer.style.msGridRow = index + 1;
var borderElement=document.createElement("div");
addClass(borderElement, "borderElement");
slotContainer.appendChild(borderElement);
var slotContent=document.createElement("div");
addClass(slotContent, "slotContent");
if (data.destination) {
slotContent.setAttribute("role", "link")
}
slotContainer.appendChild(slotContent);
if (index === 0) {
slotContent.tabIndex = 0
}
if (PlatformJS.mainProcessManager.retailModeEnabled && data.actionId === "Take a Tour") {
var contentId=PlatformJS.Services.configuration.getString("GettingStartedRetailMode");
if (contentId) {
data.destination = contentId
}
}
if (PlatformJS.mainProcessManager.retailModeEnabled) {
var actionUrl=this._getActionUrl(data.destination);
if (actionUrl && actionUrl.indexOf(this._dismissAction) >= 0) {
slotContainer.style.opacity = 0.25
}
else {
this._setClickHandler(slotContainer, data, index)
}
}
else {
this._setClickHandler(slotContainer, data, index)
}
var slotIconText=document.createElement("div");
addClass(slotIconText, "slotIconText");
slotContent.appendChild(slotIconText);
if (data.icon) {
var slotIcon=document.createElement("div");
addClass(slotIcon, iconClass);
slotIconText.appendChild(slotIcon);
var span=document.createElement("span");
slotIcon.appendChild(span);
if (data.isAppExSymbolChar) {
span.innerHTML = data.icon
}
else {
WinJS.Utilities.addClass(span, data.icon)
}
}
var slotHeader=document.createElement("div");
addClass(slotHeader, "slotHeader");
slotHeader.innerText = data.slotHeaderText;
slotIconText.appendChild(slotHeader);
if (data.slotText) {
var slotText=document.createElement("div");
addClass(slotText, "slotText");
slotText.innerText = data.slotText;
slotIconText.appendChild(slotText)
}
return slotContainer
}, _setClickHandler: function _setClickHandler(slotContainer, slotData, index) {
var that=this;
var slotContent=WinJS.Utilities.query(".slotContent", slotContainer)[0];
PlatformJS.Utilities.enablePointerUpDownAnimations(slotContent);
slotContent.onclick = function slotClickHandler() {
that._performAction(slotData, index)
};
slotContent.addEventListener("keydown", function slotContentKeyDown(event) {
var winjsKey=WinJS.Utilities.Key;
switch (event.keyCode) {
case winjsKey.enter:
case winjsKey.space:
that._performAction(slotData, index);
break;
case winjsKey.upArrow:
case winjsKey.downArrow:
that._handleArrowKeys(event);
break;
case winjsKey.leftArrow:
case winjsKey.rightArrow:
that._dispatchBoundaryEvent(event);
break
}
})
}, _handleArrowKeys: function _handleArrowKeys(event) {
var currentNode=event.currentTarget;
var direction=event.keyCode;
var hasClass=WinJS.Utilities.hasClass;
var slotContainer=currentNode.parentNode;
if (direction === WinJS.Utilities.Key.upArrow) {
slotContainer = slotContainer.previousSibling;
while (slotContainer && !hasClass(slotContainer, "slotContainer")) {
slotContainer = slotContainer.previousSibling
}
}
else if (direction === WinJS.Utilities.Key.downArrow) {
slotContainer = slotContainer.nextSibling;
while (slotContainer && !hasClass(slotContainer, "slotContainer")) {
slotContainer = slotContainer.nextSibling
}
}
if (slotContainer) {
var slotContent=WinJS.Utilities.query(".slotContent", slotContainer);
if (slotContent && slotContent.length > 0) {
event.preventDefault();
event.stopImmediatePropagation();
currentNode.tabIndex = -1;
slotContent[0].tabIndex = 0;
slotContent[0].focus()
}
}
else {
this._dispatchBoundaryEvent(event)
}
}, _dispatchBoundaryEvent: function _dispatchBoundaryEvent(event) {
var Key=WinJS.Utilities.Key;
var keyCode=event.keyCode;
var direction=null;
var NV=CommonJS.NavigableView;
switch (keyCode) {
case Key.upArrow:
direction = NV.Direction.UP;
break;
case Key.downArrow:
direction = NV.Direction.DOWN;
break;
case Key.leftArrow:
direction = NV.Direction.LEFT;
break;
case Key.rightArrow:
direction = NV.Direction.RIGHT;
break
}
NV.dispatchBoundaryEvent(event.srcElement, direction);
event.preventDefault();
event.stopImmediatePropagation()
}, _closeHandler: function _closeHandler() {
var key=CommonJS.TempCluster.getShowSettingsKey();
Windows.Storage.ApplicationData.current.localSettings.values[key] = false;
if (this._removeCluster) {
this._removeCluster()
}
if (this.messageData) {
this.messageData.closeHandler = null
}
}, _performAction: function _performAction(slotData, contentIndex) {
if (!slotData || !slotData.destination) {
return
}
var clusterName=this._rendererMap[this.templateName].clusterName;
var navMethodName=this._rendererMap[this.templateName].navMethodName;
this._logUserAction(clusterName, slotData.actionId, contentIndex);
var actionUrl=this._getActionUrl(slotData.destination);
if (!actionUrl) {
PlatformJS.deferredTelemetry(function _TempCluster_351() {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(navMethodName)
});
PlatformJS.execDeferredNavigate(function _TempCluster_352() {
PlatformJS.Navigation.navigateTo(slotData.destination)
})
}
else {
if (actionUrl.indexOf(this._dismissAction) >= 0) {
this._closeHandler()
}
else {
PlatformJS.deferredTelemetry(function _TempCluster_358() {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(navMethodName)
});
PlatformJS.execDeferredNavigate(function _TempCluster_359() {
PlatformJS.Navigation.navigateTo(actionUrl)
})
}
}
}, _getActionUrl: function _getActionUrl(destinationUrl) {
var actionUrl=null;
if (destinationUrl) {
actionUrl = destinationUrl.replace(/pano&panoid=action_/ig, "")
}
return actionUrl
}, _updateMessageData: function _updateMessageData() {
if (this.messageData) {
this.messageData.closeHandler = WinJS.Utilities.markSupportedForProcessing(this._closeHandler.bind(this))
}
}, _logUserAction: function _logUserAction(actionContext, element, itemIndex) {
PlatformJS.deferredTelemetry(function _TempCluster_384() {
var telemetry=Microsoft.Bing.AppEx.Telemetry;
var customAttributes={itemIndex: itemIndex};
telemetry.FlightRecorder.logUserActionWithJsonAttributes(telemetry.LogLevel.normal, actionContext, element, telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(customAttributes))
})
}, dispose: function dispose() {
var currentRenderPromise=this._renderPromise;
this._renderPromise = null;
if (currentRenderPromise) {
currentRenderPromise.cancel()
}
if (this._domElement) {
this._domElement.winControl = null;
this._domElement = null
}
if (this.messageData) {
this.messageData.closeHandler = null
}
}
}, {
_gettingStartedDataSourceId: "GettingStarted", _nextStepsDataSourceId: "NextSteps", getShowSettingsKey: function getShowSettingsKey() {
return "showGettingStartedCluster"
}, _defaultRemoveCluster: function _defaultRemoveCluster(clusterList, clusterKey) {
if (clusterList) {
for (var index=0, len=clusterList.length; index < len; index++) {
var cluster=clusterList.getAt(index);
if (cluster.clusterKey === clusterKey) {
clusterList.splice(index, 1);
break
}
}
}
}, shouldShowTempCluster: function shouldShowTempCluster() {
var hasUserDismissed=Windows.Storage.ApplicationData.current.localSettings.values[CommonJS.TempCluster.getShowSettingsKey()];
var clusterEnabled=PlatformJS.BootCache.instance.getEntry("EnableGettingStarted", function _TempCluster_442() {
return PlatformJS.Services.configuration.getBool("EnableGettingStarted")
});
return (hasUserDismissed !== false) && clusterEnabled
}, insertClusterIfAllowed: function insertClusterIfAllowed(clusterList, config) {
var TempCluster=CommonJS.TempCluster;
var key=TempCluster.getShowSettingsKey();
var showCluster=TempCluster.shouldShowTempCluster();
var promise=WinJS.Promise.wrap(false);
if (showCluster && clusterList && config) {
if (!config.data) {
if (!config.dataProvider) {
var options={useLocalCache: config.useLocalCache};
config.dataProvider = new CommonJS.TempClusterDataProvider(options)
}
var dataSourceId=TempCluster._gettingStartedDataSourceId;
var clusterRendered=false;
promise = config.dataProvider.fetchData(dataSourceId).then(function gsFetchDataComplete(serverResponse) {
if (serverResponse && config && config.dataProvider) {
var clusterData=config.dataProvider.parseData(serverResponse);
if (clusterData && clusterData.data && !clusterRendered) {
config.data = clusterData.data;
config.clusterTitle = clusterData.clusterTitle;
TempCluster._insertCluster(clusterList, config);
return true
}
}
}, function gsFetchDataError(error){}, function gsFetchDataProgress(cacheData) {
if (cacheData) {
config.data = cacheData.data;
config.clusterTitle = cacheData.clusterTitle;
TempCluster._insertCluster(clusterList, config);
clusterRendered = true
}
})
}
else if (config.data) {
TempCluster._insertCluster(clusterList, config);
promise = WinJS.Promise.wrap(true)
}
}
return promise
}, insertNextStepsCluster: function insertNextStepsCluster(clusterList, config) {
var TempCluster=CommonJS.TempCluster;
var clusterEnabled=PlatformJS.BootCache.instance.getEntry("EnableNextSteps", function _TempCluster_515() {
return PlatformJS.Services.configuration.getBool("EnableNextSteps")
});
var promise=WinJS.Promise.wrap(false);
if (!clusterList || !config) {
console.log("Invalid input parameters to insertNextStepsCluster(). Not inserting the cluster");
return promise
}
if (!clusterEnabled) {
return promise
}
config.isLastCluster = true;
if (!config.data) {
if (!config.dataProvider) {
config.dataProvider = new CommonJS.TempClusterDataProvider
}
var dataSourceId=TempCluster._nextStepsDataSourceId;
promise = config.dataProvider.fetchData(dataSourceId).then(function gsFetchDataSuccess(serverResponse) {
if (serverResponse) {
var clusterData=config.dataProvider.parseNextStepsData(serverResponse);
if (clusterData && clusterData.data && clusterData.clusterTitle) {
config.data = clusterData.data;
config.clusterTitle = clusterData.clusterTitle;
config.clusterClass = "nextStepsCluster";
TempCluster.setCompactPanorama();
TempCluster._insertCluster(clusterList, config);
return true
}
}
})
}
else if (config.data) {
TempCluster._insertCluster(clusterList, config);
promise = WinJS.Promise.wrap(true)
}
return promise
}, setCompactPanorama: function setCompactPanorama() {
var panoNode=document.querySelector(".platformPanorama");
if (panoNode && panoNode.winControl) {
panoNode.winControl.compactPanorama = true
}
}, _insertCluster: function _insertCluster(clusterList, config) {
var clusterKey=config.clusterKey ? config.clusterKey : "tempCluster";
var clusterData={
clusterKey: clusterKey, clusterTitle: config.clusterTitle, clusterPosition: config.clusterPosition, clusterIndex: config.clusterPosition, clusterContent: {
contentControl: "CommonJS.TempCluster", contentOptions: {
clusterKey: clusterKey, clusterList: clusterList, messageData: config.data, templateName: config.templateName, removeClusterHandler: CommonJS.TempCluster._defaultRemoveCluster.bind(this, clusterList, clusterKey), clusterClass: config.clusterClass
}
}, isTempCluster: true, isLastCluster: config.isLastCluster, platformInvisibleCluster: true, platformInvisiblePermanentCluster: true
};
if (config.isLastCluster === true) {
config.clusterPosition = clusterList.length
}
var cluster;
for (var index=clusterList.length - 1; index >= 0; index--) {
cluster = clusterList.getAt(index);
if (cluster && cluster.clusterKey === clusterKey) {
if (index === config.clusterPosition) {
return
}
else {
clusterList.splice(index, 1)
}
}
}
clusterList.splice(config.clusterPosition, 0, clusterData)
}
})})
})();
(function appexFlightingManagerInit() {
"use strict"
})();
(function appexPlatformControlsHeroImageInit() {
"use strict";
function animateImageIn(imageElement) {
imageElement.style.opacity = 0.25;
return WinJS.UI.executeTransition(imageElement, {
property: "opacity", delay: 0, duration: 200, timing: "linear", from: 0.25, to: 1
})
}
function getCacheServiceInstance(cacheIdentifier) {
return cacheIdentifier ? PlatformJS.Cache.CacheService.getInstance(cacheIdentifier) : {findEntry: function() {
return WinJS.Promise.wrap(null)
}}
}
function storeImageToCache(imageUrl, imageSource, networkCallRequired) {
networkCallRequired = networkCallRequired || function _HeroImage_30(){};
if (imageUrl) {
var isLowResImage=imageSource.lowResolutionUrl && (imageSource.lowResolutionUrl === imageUrl && imageSource.lowResolutionUrl !== imageSource.highResolutionUrl);
if (imageUrl.indexOf("/") === 0 || imageUrl.indexOf("ms-appdata://") === 0) {
return WinJS.Promise.wrap({
url: imageUrl, isLocalResponse: true
})
}
else {
var resizedImageUrl=imageUrl;
if (!isLowResImage) {
resizedImageUrl = CommonJS.Utils.getResizedHeroImageUrl(imageUrl)
}
if (PlatformJS.isPlatformInitialized) {
var previousFetchPromise=null;
if (!isLowResImage && CommonJS.Immersive.HeroImage.fetchHighResImagePromise) {
previousFetchPromise = CommonJS.Immersive.HeroImage.fetchHighResImagePromise
}
else {
previousFetchPromise = WinJS.Promise.wrap({})
}
var fetchPromise=previousFetchPromise.then(function _HeroImage_56() {
return getCacheServiceInstance(imageSource.cacheId).findEntry(resizedImageUrl, {fileNameOnly: true})
}).then(function _HeroImage_60(response) {
if (!response || response.isStale()) {
return PlatformJS.Utilities.fetchImage(imageSource.cacheId, resizedImageUrl, networkCallRequired).then(function _HeroImage_63(fetchResponse) {
if (imageSource.imageTag && !isLowResImage) {
PlatformJS.Utilities.saveImageForBoot(imageUrl, imageSource, fetchResponse)
}
return WinJS.Promise.wrap({
url: fetchResponse, isLocalResponse: false
})
})
}
else {
return WinJS.Promise.wrap({
url: response.dataValue, isLocalResponse: true
})
}
}, function heroImage_storeImageToCache_erroHandler(err) {
console.log("HeroImage - Error fetching image " + err);
CommonJS.Immersive.HeroImage.fetchHighResImagePromise = null;
return WinJS.Promise.wrapError(err)
});
if (!isLowResImage) {
CommonJS.Immersive.HeroImage.fetchHighResImagePromise = fetchPromise
}
return fetchPromise
}
else {
var response=null;
if (imageSource.imageTag) {
var entry=PlatformJS.BootCache.instance.getEntry(imageSource.imageTag);
if (entry && (entry.url === imageUrl)) {
response = {
url: entry.localUrl, isLocalResponse: true
}
}
}
if (!response) {
response = {
url: resizedImageUrl, isLocalResponse: false
}
}
return WinJS.Promise.wrap(response)
}
}
}
return WinJS.Promise.wrap(null)
}
WinJS.Namespace.define("CommonJS.Immersive", {HeroImage: WinJS.Class.define(function heroImage_ctor(element, properties) {
this.element = element ? element : document.createElement("div");
this.element.winControl = this;
CommonJS.Utils.markDisposable(this.element);
if (properties && properties.heroParentElement) {
this._heroParentElement = properties.heroParentElement
}
this._init();
var that=this;
this._backgroundImageSetPromise = new WinJS.Promise(function _HeroImage_133(complete) {
that._backgroundImageSet = complete
});
this._onLayoutChangeEventBinding = this._layoutChange.bind(this);
this.element.addEventListener("mselementresize", this._onLayoutChangeEventBinding)
}, {
_currentImageElement: null, _stagingImageElement: null, _imageTags: null, _imageAttribution: null, _imageAttributionElt: null, _backgroundImageSet: null, _onLayoutChangeEventBinding: null, _bindings: null, _setBackgroundImageProperty: false, _backgroundImageSetPromise: null, _loadFromImageSourcePromise: null, _refreshPromise: null, _loadImageStartTime: null, _eventManager: null, _imageSize: null, _imageSizeLowRes: null, _imageSizeForDownloadedImage: null, _focalPoint: null, _focalPointLowRes: null, _anchorPoint: null, _backgroundImage: null, _init: function _init() {
var viewport=this.element;
WinJS.Utilities.addClass(viewport, "platformImageCard platformPlaceHolderLarge platformHeroImage");
var imageElement=this._currentImageElement = document.createElement("div");
imageElement.id = "platformHeroImage";
WinJS.Utilities.addClass(imageElement, "platformImageCardImage");
viewport.appendChild(imageElement);
var stagingImageElement=this._stagingImageElement = document.createElement("div");
stagingImageElement.id = "platformHeroStagingImage";
stagingImageElement.style.opacity = 0;
stagingImageElement.className = "platformImageCardImage";
viewport.appendChild(stagingImageElement);
var imageAttributionElt=this._imageAttributionElt = document.createElement("div");
imageAttributionElt.className = "platformHeroImageAttribution platformHide";
viewport.appendChild(imageAttributionElt);
this._bindings = [];
this._imageTags = [];
this._eventManager = CommonJS.Utils.getEventListenerManager(this, "HeroImage listeners");
this._eventManager.add(Windows.UI.WebUI.WebUIApplication, "suspending", this._onSuspending.bind(this), "hero image suspending")
}, _handleImageError: function _handleImageError(err) {
console.log("HeroImage - HandleImageError " + err);
this._releaseBackgroundImageSetPromise();
if (err && err.name === "Canceled") {
return WinJS.Promise.wrapError(err)
}
return WinJS.Promise.wrap(null)
}, _releaseBackgroundImageSetPromise: function _releaseBackgroundImageSetPromise() {
if (this._backgroundImageSet) {
var temp=this._backgroundImageSet;
this._backgroundImageSet = null;
temp.call(this)
}
}, getBackgroundImageSetPromise: function getBackgroundImageSetPromise() {
return this._backgroundImageSetPromise
}, getLoadFromImageSourcePromise: function getLoadFromImageSourcePromise() {
return this._loadFromImageSourcePromise
}, setProperties: function setProperties(options) {
if (options) {
for (var property in options) {
var prefixChar=property.substr(0, 1).toUpperCase();
var privateSetter="_set" + prefixChar + property.substr(1);
if (this[privateSetter]) {
this[privateSetter](options[property])
}
else {
this[property] = options[property]
}
}
}
}, attributionData: {set: function set(value) {
if (value) {
if (!this._imageAttribution) {
this._imageAttribution = new CommonJS.ImageAttribution(this._imageAttributionElt, {flyout: {
label: "", placement: "top", alignment: CommonJS.isRtl() ? "left" : "right"
}})
}
;
if (value.attributionText && value.attributionText.length > 0) {
WinJS.Utilities.removeClass(this._imageAttribution.element, "platformHide")
}
else {
WinJS.Utilities.addClass(this._imageAttribution.element, "platformHide")
}
this._imageAttribution.label = value.caption + " " + value.attributionText;
this._currentImageElement.alt = value.attributionText
}
else if (this._imageAttribution) {
this._currentImageElement.alt = "";
this._imageAttribution.label = "";
WinJS.Utilities.addClass(this._imageAttribution.element, "platformHide")
}
}}, imageData: {set: function set(value) {
if (value) {
var that=this,
backgroundImageSet=false;
if (value.bind) {
var bindableProperties=["imageSize", "imageSizeLowRes", "anchorPoint", "focalPoint", "focalPointLowRes", "attributionData", "backgroundImage"];
for (var i=0; i < bindableProperties.length; i++) {
(function itemsContainer_imageDataBindPropertyAndAction(propertyName) {
var bindingAction=function(value) {
var prefixChar=propertyName.substr(0, 1).toUpperCase();
var privateSetter="_set" + prefixChar + propertyName.substr(1);
if (that[privateSetter]) {
that[privateSetter](value);
if (propertyName === "backgroundImage") {
if (backgroundImageSet) {
debugger
}
that.loadHeroImage();
backgroundImageSet = true
}
}
else {
that[propertyName] = value
}
};
that._bindings.push({
observable: value, action: bindingAction
});
value.bind(propertyName, bindingAction)
})(bindableProperties[i])
}
}
else {
this.setProperties(value)
}
}
}}, _onSuspending: function _onSuspending() {
this._loadImageStartTime = null
}, _setImageSize: function _setImageSize(value) {
if (value && value.width > 0 && value.height > 0 && !this._disposed) {
this._imageSize = value
}
}, _setImageSizeLowRes: function _setImageSizeLowRes(value) {
if (value && value.width > 0 && value.height > 0 && !this._disposed) {
this._imageSizeLowRes = value
}
}, _setFocalPoint: function _setFocalPoint(value) {
this._focalPoint = value
}, _setFocalPointLowRes: function _setFocalPointLowRes(value) {
this._focalPointLowRes = value
}, _setAnchorPoint: function _setAnchorPoint(value) {
this._anchorPoint = value
}, _setBackgroundImage: function _setBackgroundImage(value) {
this._backgroundImage = value
}, _layoutChange: function _layoutChange(event) {
this._layoutHeroImage(this._currentImageElement)
}, loadHeroImage: function loadHeroImage() {
if (this._backgroundImage) {
var value=this._backgroundImage,
imageSource=value;
if (typeof value === "string") {
imageSource = {
url: value, cacheId: "PlatformImageCache"
}
}
else if (!imageSource.cacheId) {
imageSource.cacheId = "PlatformImageCache"
}
this._loadFromImageSource(imageSource);
this._setBackgroundImageProperty = true
}
else {
this._releaseBackgroundImageSetPromise()
}
}, refreshHeroImage: function refreshHeroImage(heroImageSource, imageAttributionData, heroContentRendererCallback) {
if (!this._setBackgroundImageProperty) {
debugger
}
this._releaseBackgroundImageSetPromise();
var currentImageElement=this._currentImageElement;
var stagingImageElement=this._stagingImageElement;
var imageSource=this._getImageSource(heroImageSource);
var that=this;
var localUrl=null;
if (!imageSource || !imageSource.url || !heroContentRendererCallback) {
if (!this._refreshPromise) {
this._refreshPromise = WinJS.Promise.wrap(null)
}
return this._refreshPromise
}
this._loadImageStartTime = performance.now();
var previousRefreshPromise=this._refreshPromise;
this._refreshPromise = storeImageToCache(imageSource.url, imageSource).then(function _HeroImage_393(response) {
if (!response) {
throw"refreshing the hero with invalid image";
}
localUrl = response;
if (!localUrl.isLocalResponse) {
that._logTelemetryHeroImageDownloadIfValid()
}
var promises=[];
if (that._loadFromImageSourcePromise) {
promises.push(that._loadFromImageSourcePromise)
}
if (previousRefreshPromise) {
promises.push(previousRefreshPromise)
}
return WinJS.Promise.join(promises)
}).then(function heroImageRefresh_loadHeroContent() {
that._loadImageIntoElement(stagingImageElement, localUrl.url, true);
return heroContentRendererCallback()
}).then(function heroRefresh_animateHeroImage() {
return animateImageIn(stagingImageElement)
}).then(function heroRefresh_setImageAttributionData() {
that.attributionData = imageAttributionData;
that._resetImageAndStagingImage(currentImageElement, stagingImageElement)
}).then(null, function onRefreshPromiseError(err) {
return that._handleImageError(err)
});
return this._refreshPromise
}, _reCalculateImageFocalPoint: function _reCalculateImageFocalPoint() {
if (this._imageSizeForDownloadedImage && this._imageSize) {
var imageSize=this._imageSize,
imageSizeForDownloadedImage=this._imageSizeForDownloadedImage;
if (imageSize.width !== imageSizeForDownloadedImage.width || imageSize.height !== imageSizeForDownloadedImage.height) {
var focalPoint=this._focalPoint;
if (focalPoint) {
var widthRatio=(imageSizeForDownloadedImage.width / imageSize.width),
heightRatio=(imageSizeForDownloadedImage.height / imageSize.height),
commonMultiplier=(widthRatio < heightRatio) ? heightRatio : widthRatio;
focalPoint.x = parseInt((commonMultiplier * focalPoint.x));
focalPoint.y = parseInt((commonMultiplier * focalPoint.y))
}
this._imageSize = this._imageSizeForDownloadedImage
}
}
}, _layoutHeroImage: function _layoutHeroImage(imageElement) {
this._reCalculateImageFocalPoint();
var viewport=imageElement;
var imageSize=this._hasHighResImage ? this._imageSize : this._imageSizeLowRes,
focalPoint=this._hasHighResImage ? this._focalPoint : this._focalPointLowRes;
if (imageSize) {
if (!focalPoint) {
focalPoint = this._anchorPointMapping()
}
if (focalPoint) {
var focalPointX=parseInt(focalPoint.x),
focalPointY=parseInt(focalPoint.y),
imageWidth=imageSize.width,
imageHeight=imageSize.height;
if (focalPointX >= 0 && focalPointX <= imageWidth && focalPointY >= 0 && focalPointY <= imageHeight) {
var imageRatio=(imageWidth / imageHeight),
viewportWidth=CommonJS.getTotalWidth(this.element),
viewportHeight=CommonJS.getTotalHeight(this.element);
var widthRatio=(viewportWidth / imageWidth),
heightRatio=(viewportHeight / imageHeight),
commonMultiplier=(widthRatio < heightRatio) ? heightRatio : widthRatio;
focalPointX = parseInt((commonMultiplier * focalPointX));
focalPointY = parseInt((commonMultiplier * focalPointY));
var offsetX=this._cropHeroImage(parseInt(imageWidth * commonMultiplier), viewportWidth, focalPointX),
offsetY=this._cropHeroImage(parseInt(imageHeight * commonMultiplier), viewportHeight, focalPointY);
viewport.style.backgroundPosition = "";
viewport.style.margin = offsetY.offset1 + "px " + offsetX.offset2 + "px " + offsetY.offset2 + "px " + offsetX.offset1 + "px";
return
}
}
}
viewport.style.backgroundPosition = "center"
}, _cropHeroImage: function _cropHeroImage(imageDimension, viewportDimension, focalPointDimension) {
var length1Margin=0,
length2Margin=0;
if (focalPointDimension && (imageDimension > viewportDimension)) {
var cropLength=imageDimension - viewportDimension,
length1=focalPointDimension,
length2=imageDimension - focalPointDimension;
var lengthDelta=0;
if (length1 > length2) {
lengthDelta = length1 - length2;
length1Margin = (cropLength > lengthDelta) ? lengthDelta : cropLength;
cropLength = cropLength - length1Margin
}
else if (length2 > length1) {
lengthDelta = length2 - length1;
length2Margin = (cropLength > lengthDelta) ? lengthDelta : cropLength;
cropLength = cropLength - length2Margin
}
if (cropLength) {
cropLength = cropLength / 2;
length1Margin += cropLength;
length2Margin += cropLength
}
}
return {
offset1: (length1Margin * -1), offset2: (length2Margin * -1)
}
}, _anchorPointMapping: function _anchorPointMapping() {
var anchorPoint=this._anchorPoint,
imageSize=this._hasHighResImage ? this._imageSize : this._imageSizeLowRes,
focalPoint=null;
switch (anchorPoint) {
case"anchorLeft":
focalPoint = {
x: (imageSize.width / 3), y: (imageSize.height / 3)
};
break;
case"anchorRight":
focalPoint = {
x: (imageSize.width * (2 / 3)), y: (imageSize.height / 3)
};
break;
case"anchorBottom":
focalPoint = {
x: (imageSize.width / 2), y: (imageSize.height * (2 / 3))
};
break;
default:
focalPoint = {
x: (imageSize.width / 2), y: (imageSize.height / 3)
};
break
}
return focalPoint
}, _loadFromImageSource: function _loadFromImageSource(source) {
if (source) {
var p=null;
if (source.lowResolutionUrl && source.highResolutionUrl) {
if (PlatformJS.isPlatformInitialized) {
p = this._loadDualResolution(source)
}
else {
var resizedImageUrl=CommonJS.Utils.getResizedHeroImageUrl(source.highResolutionUrl);
p = this._loadSingleResolution({
cacheId: source.cacheId, imageTag: source.imageTag, url: resizedImageUrl
})
}
}
else if (source.url) {
p = this._loadSingleResolution(source)
}
else {
this._releaseBackgroundImageSetPromise();
return
}
if (this._loadFromImageSourcePromise) {
this._loadFromImageSourcePromise = this._loadFromImageSourcePromise.then(function _HeroImage_551() {
return p
})
}
else {
this._loadFromImageSourcePromise = p
}
}
}, _startReleaseBackgroundImageSetPromiseTimer: function _startReleaseBackgroundImageSetPromiseTimer() {
var that=this;
window.setTimeout(function releaseBackgroundImage_timeout() {
that._releaseBackgroundImageSetPromise()
}, 200)
}, _loadSingleResolution: function _loadSingleResolution(imageSource, bypassCache, imageElement) {
imageElement = imageElement || this._currentImageElement;
var that=this;
this._loadImageStartTime = performance.now();
this._startReleaseBackgroundImageSetPromiseTimer();
return storeImageToCache(imageSource.url, imageSource).then(function _HeroImage_575(localUrl) {
if (!localUrl) {
throw"loading single resolution image with invalid image url";
}
if (!localUrl.isLocalResponse) {
that._logTelemetryHeroImageDownloadIfValid()
}
that._loadImageIntoElement(imageElement, localUrl.url, true, true)
}).then(null, function onLoadSingleResolutionError(err) {
return that._handleImageError(err)
})
}, _loadDualResolution: function _loadDualResolution(imageSource) {
var that=this;
var buffer=null;
var currentImageElement=this._currentImageElement,
stagingImageElement=this._stagingImageElement;
var lowResolution=imageSource.lowResolutionUrl,
highResolution=imageSource.highResolutionUrl,
cacheIdentifier=imageSource.cacheId;
var cacheService=getCacheServiceInstance(cacheIdentifier),
resizedImageUrl=CommonJS.Utils.getResizedHeroImageUrl(highResolution);
this._loadImageStartTime = performance.now();
msWriteProfilerMark("Platform:HeroImage:loadFirstAvailableImage:s");
var isHighResolutionRendered=false;
var isLowResolutionRendered=false;
this._startReleaseBackgroundImageSetPromiseTimer();
return cacheService.findEntry(resizedImageUrl, {fileNameOnly: true}).then(function heroImage_loadDualHeroImage(response) {
if (response && !response.isStale()) {
that._loadImageIntoElement(currentImageElement, response.dataValue, true, true);
isHighResolutionRendered = true;
return WinJS.Promise.wrap({})
}
else {
var highResLoadPromise=storeImageToCache(highResolution, imageSource).then(function highResolution_downloadComplete(response) {
if (!response) {
throw"loading high resolution image with invalid image url";
}
if (isLowResolutionRendered) {
that._loadImageIntoElement(stagingImageElement, response.url, true);
animateImageIn(stagingImageElement).then(function _HeroImage_638() {
that._resetImageAndStagingImage(currentImageElement, stagingImageElement)
})
}
else {
that._loadImageIntoElement(currentImageElement, response.url, true, true)
}
isHighResolutionRendered = true;
msWriteProfilerMark("Platform:HeroImage:loadFirstAvailableImage:e");
that._logTelemetryHeroImageDownloadIfValid()
}).then(null, function onLoadHighResolutionError(err) {
return that._handleImageError(err)
});
var lowResLoadPromise=storeImageToCache(lowResolution, imageSource).then(function lowResolutionImage_downloadComplete(response) {
return WinJS.Promise.timeout(150).then(function _HeroImage_657() {
if (!isHighResolutionRendered) {
if (!response) {
throw"loading low resolution image with invalid image url";
}
that._loadImageIntoElement(currentImageElement, response.url, false, true);
isLowResolutionRendered = true
}
})
}).then(null, function onLoadLowResolutionError(err) {
return that._handleImageError(err)
});
return WinJS.Promise.join([highResLoadPromise, lowResLoadPromise])
}
}).then(null, function _HeroImage_675(err) {
return that._handleImageError(err)
})
}, _loadImageIntoElement: function _loadImageIntoElement(imageElement, imageUrl, isHighResImage, releaseBackgroundImageSetPromise) {
this._hasHighResImage = isHighResImage;
imageElement.style.backgroundImage = "url('" + imageUrl + "');";
var imageTag=CommonJS.Immersive.HeroImage.highResImageTagElement;
if (isHighResImage && imageTag && (imageTag.src.toLowerCase() === imageUrl.toLowerCase())) {
if (imageTag.naturalHeight > 0 && imageTag.naturalWidth > 0) {
this._imageSizeForDownloadedImage = {
width: imageTag.naturalWidth, height: imageTag.naturalHeight
}
}
}
this._layoutHeroImage(imageElement);
if (releaseBackgroundImageSetPromise) {
console.log(performance.now() + " display hero image");
this._releaseBackgroundImageSetPromise()
}
}, _resetImageAndStagingImage: function _resetImageAndStagingImage(imageElement, stagingElement) {
var imageUrl=stagingElement.style.backgroundImage.substr(5, stagingElement.style.backgroundImage.length - 7);
imageElement.style.margin = stagingElement.style.margin;
imageElement.style.backgroundImage = "url('" + imageUrl + "');";
stagingElement.style.opacity = 0
}, _getImageSource: function _getImageSource(imageSource) {
if (typeof imageSource === "string") {
return {url: imageSource}
}
else if (imageSource.highResolutionUrl) {
return {
url: imageSource.highResolutionUrl, cacheId: imageSource.cacheId
}
}
else {
return imageSource
}
}, _logTelemetryHeroImageDownloadIfValid: function _logTelemetryHeroImageDownloadIfValid() {
var loadImageStartTime=this._loadImageStartTime;
if (loadImageStartTime) {
var loadImageEndTime=performance.now();
var loadImageElapsedTime=loadImageEndTime - loadImageStartTime;
this._logTelemetryHeroImageDownload(loadImageElapsedTime);
this._loadImageStartTime = null
}
}, _logTelemetryHeroImageDownload: function _logTelemetryHeroImageDownload(loadElapsedTime) {
var perfContext;
if (WinJS.Navigation.location) {
perfContext = WinJS.Navigation.location.page + "*" + WinJS.Navigation.location.channelId
}
PlatformJS.Telemetry.flightRecorder.logPerf(PlatformJS.Telemetry.logLevel.normal, "Platform:HeroImage:loadFirstAvailableImage", "HeroImageDownload", perfContext, loadElapsedTime)
}, dispose: function dispose() {
var bindings=this._bindings;
for (var i=0, ilen=bindings.length; i < ilen; i++) {
var binding=bindings[i];
binding.observable.unbind(binding.action)
}
this._bindings = null;
if (this._loadFromImageSourcePromise) {
this._loadFromImageSourcePromise.cancel();
this._loadFromImageSourcePromise = null
}
if (this._refreshPromise) {
this._refreshPromise.cancel();
this._refreshPromise = null
}
if (this._onLayoutChangeEventBinding) {
this.element.removeEventListener("mselementresize", this._onLayoutChangeEventBinding);
this._onLayoutChangeEventBinding = null
}
if (this._eventManager) {
this._eventManager.dispose();
this._eventManager = null
}
CommonJS.Immersive.HeroImage.highResImageTagElement = null;
CommonJS.Immersive.HeroImage.highResImageDiv = null;
CommonJS.Immersive.HeroImage.highResImageUrl = null;
if (CommonJS.Immersive.HeroImage.decodeHeroImagePromise) {
CommonJS.Immersive.HeroImage.decodeHeroImagePromise.cancel();
CommonJS.Immersive.HeroImage.decodeHeroImagePromise = null
}
if (CommonJS.Immersive.HeroImage.fetchHighResImagePromise) {
CommonJS.Immersive.HeroImage.fetchHighResImagePromise.cancel();
CommonJS.Immersive.HeroImage.fetchHighResImagePromise = null
}
}
}, {
highResImageTagElement: null, highResImageUrl: null, highResImageDiv: null, decodeHeroImagePromise: null, fetchHighResImagePromise: null, decodeHeroImage: function decodeHeroImage(backgroundImage, parentElement) {
if (backgroundImage) {
var imageSource=backgroundImage,
highResImageUrl=null;
if (typeof imageSource === "string") {
imageSource = {
url: imageSource, cacheId: "PlatformImageCache"
};
highResImageUrl = imageSource
}
else if (!imageSource.cacheId) {
imageSource.cacheId = "PlatformImageCache"
}
if (imageSource.highResolutionUrl) {
highResImageUrl = imageSource.highResolutionUrl
}
else if (imageSource.url) {
highResImageUrl = imageSource.url
}
var that=this,
parent=parentElement ? parentElement : document.body;
if (highResImageUrl && parent) {
var previousHeroImageUrl=CommonJS.Immersive.HeroImage.highResImageUrl;
if (!previousHeroImageUrl || (previousHeroImageUrl !== highResImageUrl.toLowerCase())) {
CommonJS.Immersive.HeroImage.highResImageUrl = highResImageUrl.toLowerCase();
CommonJS.Immersive.HeroImage.decodeHeroImagePromise = storeImageToCache(highResImageUrl, imageSource).then(function decodeHeroImage_getLocalImageUrl(response) {
if (response && response.url) {
var image=null,
imageDiv=null;
if (CommonJS.Immersive.HeroImage.highResImageTagElement && CommonJS.Immersive.HeroImage.highResImageDiv) {
image = CommonJS.Immersive.HeroImage.highResImageTagElement;
imageDiv = CommonJS.Immersive.HeroImage.highResImageDiv
}
else {
image = document.createElement("img");
imageDiv = document.createElement("div");
CommonJS.Immersive.HeroImage.highResImageTagElement = image;
CommonJS.Immersive.HeroImage.highResImageDiv = imageDiv;
parent.appendChild(image);
parent.appendChild(imageDiv)
}
imageDiv.style.backgroundImage = "url('" + response.url + "');";
imageDiv.style.width = "1px";
imageDiv.style.height = "1px";
imageDiv.style.visibility = "hidden";
imageDiv.style.position = "absolute";
image.width = 1;
image.height = 1;
image.style.display = "none";
image.src = response.url;
console.log(image.complete);
console.log(performance.now() + " decoding hero image")
}
return WinJS.Promise.wrap(null)
}).then(null, function decodeHeroImage_onError(err) {
if (err && err.name === "Canceled") {
return WinJS.Promise.wrapError(err)
}
return WinJS.Promise.wrap(null)
})
}
}
}
}
})})
})();
(function appexPlatformControlsPlatformHeroControlInit() {
"use strict";
function animateElementIn(itemsContainerElement) {
return WinJS.UI.executeTransition(itemsContainerElement, {
property: "opacity", delay: 0, duration: 400, timing: "cubic-bezier(0.1, 0.9, 0.2, 1)", from: 0, to: 1
})
}
function handlePromiseError(err) {
console.log("PlatformHeroControl - HandleError " + err);
if (err && err.name === "Canceled") {
return WinJS.Promise.wrapError(err)
}
return WinJS.Promise.wrap(null)
}
var HeroLayout=WinJS.Class.mix(WinJS.Class.define(function heroLayout_ctor(element, options) {
this.element = element ? element : document.createElement("div");
this._initItemClickedHandler();
this._init(options);
if (options) {
this.renderLayout()
}
}, {
_layoutId: CommonJS.Immersive.HERO_LAYOUT_ONE_ITEM, _fragmentPath: CommonJS.Immersive.HERO_LAYOUT_TEMPLATES_PATH, _primaryHeroImageData: null, _heroItems: null, _primaryHeroItemIndex: null, _heroDataAndElementMapping: null, _layoutRenderPromise: null, _renderHeroItemsPromises: null, _refreshPromise: null, _logUserContentPromise: null, _primaryHeroImageControl: null, _primaryHeroImageElement: null, _heroContentElement: null, disableAnimation: true, _init: function _init(options) {
this._heroItems = [];
this._heroDataAndElementMapping = [];
this.setProperties(options)
}, renderLayout: function renderLayout() {
if (this._heroItems.length < 1) {
return
}
this._layoutId = this._resolveLayoutId(this._layoutId);
if (this._layoutRenderPromise) {
this.clearLayout()
}
var renderer=this._getLayoutRendererName(this._layoutId),
layoutRenderPromise=null;
if (this[renderer]) {
layoutRenderPromise = this[renderer]()
}
else {
var moduleInfo={
className: "", fragmentPath: this._fragmentPath, templateId: this._layoutId
};
var heroItemData={imageData: this._primaryHeroImageData};
var that=this,
element=this.element;
layoutRenderPromise = CommonJS.loadModule(moduleInfo, heroItemData, element).then(function renderHeroLayout_loadPrimaryHeroImage() {
var heroImage=WinJS.Utilities.query("#primaryHeroImage", element);
if (heroImage.length > 0) {
that._primaryHeroImageElement = heroImage[0];
that._primaryHeroImageControl = heroImage[0].winControl;
that._primaryHeroImageControl.loadHeroImage()
}
var heroContent=WinJS.Utilities.query(".platformHeroContent", element);
if (heroContent.length > 0) {
that._heroContentElement = heroContent[0]
}
that._mapDataToElements();
return WinJS.Promise.wrap(null)
}).then(null, function renderHeroLayoutError(err) {
return handlePromiseError(err)
})
}
this._layoutRenderPromise = layoutRenderPromise
}, _getLayoutRendererName: function _getLayoutRendererName(templateId) {
return "_render" + templateId + "Layout"
}, _renderSingleStoryLayout: function _renderSingleStoryLayout() {
var element=this.element,
primaryHeroImageElement=this._primaryHeroImageElement = document.createElement("div");
primaryHeroImageElement.id = "heroCluster";
var primaryHeroImageControl=this._primaryHeroImageControl = new CommonJS.Immersive.HeroImage(primaryHeroImageElement);
primaryHeroImageControl.setProperties(this._primaryHeroImageData);
primaryHeroImageControl.loadHeroImage();
var primaryHeroContent=document.createElement("div");
primaryHeroContent.id = "primaryHeroContent";
WinJS.Utilities.addClass(primaryHeroContent, "heroContentOneItem platformHeroContent");
element.appendChild(primaryHeroImageElement);
element.appendChild(primaryHeroContent);
this._mapDataToElements();
this._heroContentElement = primaryHeroContent;
return WinJS.Promise.wrap(null)
}, _mapDataToElements: function _mapDataToElements() {
if (this._heroItems) {
var data=this._heroItems,
secondaryitems=0,
secondaryHeroElements=WinJS.Utilities.query(".secondaryHeroContent", this.element),
primaryHeroItems=0,
primaryHeroElements=WinJS.Utilities.query("#primaryHeroContent", this.element),
heroDataAndElementMapping=[],
cmsHeroEntityType=CommonJS.Immersive.PlatformHeroControl.CmsHeroEntityTypeEnum;
for (var i=0; i < data.length; i++) {
if (data[i].entityType === cmsHeroEntityType.Hero || data.length === 1) {
if (primaryHeroElements.length > primaryHeroItems) {
heroDataAndElementMapping.push({
element: primaryHeroElements[primaryHeroItems++], data: data[i], render: true
});
data[i].entityType = cmsHeroEntityType.Hero
}
}
else {
if (secondaryHeroElements.length > secondaryitems) {
heroDataAndElementMapping.push({
element: secondaryHeroElements[secondaryitems++], data: data[i], render: true
})
}
}
}
this._heroDataAndElementMapping = heroDataAndElementMapping
}
}, render: function render(animateContent) {
if (this._layoutRenderPromise && this._heroItems) {
var that=this,
isAppBootComplete=PlatformJS.isAppBootComplete,
promises=[],
renderPromise;
renderPromise = this._layoutRenderPromise.then(function heroContentRenderer_renderHeroItems() {
if (that._primaryHeroImageControl) {
promises.push(that._primaryHeroImageControl.getBackgroundImageSetPromise())
}
if (isAppBootComplete && animateContent && that._heroContentElement) {
that._heroContentElement.style.opacity = 0
}
promises.push(that._renderHeroItems());
return WinJS.Promise.join(promises)
}).then(function renderHeroContent_animateHeroItems() {
if (isAppBootComplete && animateContent) {
return that.animateInContent()
}
else {
return WinJS.Promise.wrap({})
}
});
that._logUserContentPromise = PlatformJS.platformInitializedPromise.then(function _PlatformHeroControl_209() {
that._logContentView()
});
return renderPromise
}
debugger;
return WinJS.Promise.wrap(null)
}, clearContent: function clearContent() {
var that=this;
if (this._heroContentElement) {
return WinJS.UI.Animation.exitContent(this._heroContentElement).then(function _PlatformHeroControl_224(){}).then(function _PlatformHeroControl_225() {
that._clearContent()
})
}
else {
return WinJS.Promise.wrap(null)
}
}, animateInContent: function animateInContent() {
if (this._heroContentElement) {
return WinJS.UI.Animation.enterContent(this._heroContentElement)
}
else {
return WinJS.Promise.wrap(null)
}
}, checkRefreshType: function checkRefreshType(options) {
var fullRefresh=true,
heroItems=options && options.heroItems ? options.heroItems : null,
layoutId=options && options.layoutId ? options.layoutId : "";
layoutId = this._resolveLayoutId(layoutId);
if (layoutId !== this._layoutId) {
return true
}
else {
if (heroItems && (this._primaryHeroItemIndex !== null)) {
var currentPrimaryItemIndex=this._extractPrimaryHeroItemIndex(heroItems);
if (currentPrimaryItemIndex !== null) {
var currentPrimaryItem=heroItems[currentPrimaryItemIndex];
var primaryItem=this._heroItems[this._primaryHeroItemIndex];
if (currentPrimaryItem && currentPrimaryItem.updated && primaryItem && primaryItem.updated) {
if (currentPrimaryItem.updated > primaryItem.updated) {
fullRefresh = true
}
else {
fullRefresh = false
}
}
}
}
}
return fullRefresh
}, refresh: function refresh(options, fullRefresh) {
var that=this;
if (fullRefresh) {
this.clearLayout();
this._init(options);
this.renderLayout();
this._refreshPromise = this._layoutRenderPromise.then(function _PlatformHeroControl_286() {
if (that._primaryHeroImageControl) {
return that._primaryHeroImageControl.getLoadFromImageSourcePromise()
}
}).then(function refreshLayout_renderHeroContent() {
var heroContent=that._heroContentElement;
if (heroContent) {
heroContent.style.opacity = 0;
return that.render(false)
}
}, function renderHeroItemsError_refreshHeroLayout(err) {
return handlePromiseError(err)
})
}
else {
var heroDataAndElementMapping=this._heroDataAndElementMapping,
cmsHeroEntityType=CommonJS.Immersive.PlatformHeroControl.CmsHeroEntityTypeEnum;
if (heroDataAndElementMapping) {
var secondaryItems=[];
for (var i=0; i < heroDataAndElementMapping.length; i++) {
if (heroDataAndElementMapping[i].data.entityType !== cmsHeroEntityType.Hero) {
secondaryItems.push(heroDataAndElementMapping[i].element)
}
}
this._refreshPromise = WinJS.Promise.join(this._renderHeroItemsPromises).then(function refreshLayout_animateOutHeroContent() {
return WinJS.UI.Animation.exitContent(secondaryItems)
}).then(function refreshLayout_clearContentAndRender() {
for (var i=0; i < secondaryItems.length; i++) {
secondaryItems[i].innerHTML = ""
}
that._heroItems = [];
that._heroDataAndElementMapping = [];
that.setProperties(options);
that._mapDataToElements();
heroDataAndElementMapping = that._heroDataAndElementMapping;
for (i = 0; i < heroDataAndElementMapping.length; i++) {
if (heroDataAndElementMapping[i].data.entityType === cmsHeroEntityType.Hero) {
heroDataAndElementMapping[i].render = false
}
}
return that._renderHeroItems()
}).then(function refreshLayout_animateInContent() {
return WinJS.UI.Animation.enterContent(secondaryItems)
}).then(null, function renderHeroItemsError_refreshHeroLayout(err) {
return handlePromiseError(err)
})
}
}
return this._refreshPromise ? this._refreshPromise : WinJS.Promise.wrap(null)
}, _clearContent: function _clearContent() {
var renderHeroItemsPromises=this._renderHeroItemsPromises;
if (renderHeroItemsPromises) {
for (var i=0; i < renderHeroItemsPromises.length; i++) {
renderHeroItemsPromises[i].cancel()
}
renderHeroItemsPromises.length = 0;
renderHeroItemsPromises = null
}
var heroDataAndElementMapping=this._heroDataAndElementMapping;
if (heroDataAndElementMapping) {
for (var i=0; i < heroDataAndElementMapping.length; i++) {
var heroData=heroDataAndElementMapping[i].data;
if (heroData) {
heroData.videoWrapper = null
}
}
}
var heroContentElement=this._heroContentElement;
if (heroContentElement) {
WinJS.Utilities.disposeSubTree(heroContentElement);
heroContentElement.innerHTML = "";
heroContentElement = null
}
}, clearLayout: function clearLayout() {
if (this._layoutRenderPromise) {
this._layoutRenderPromise.cancel();
this._layoutRenderPromise = null
}
if (this._refreshPromise) {
this._refreshPromise.cancel();
this._refreshPromise = null
}
if (this._primaryHeroImageControl) {
this._primaryHeroImageControl.dispose();
this._primaryHeroImageElement = null;
this._primaryHeroImageControl = null
}
this._clearContent();
WinJS.Utilities.disposeSubTree(this.element);
this.element.innerHTML = ""
}, dispose: function dispose() {
this.clearLayout();
this._heroItems = null;
this._heroDataAndElementMapping = null;
this._primaryHeroItemIndex = null
}, setProperties: function setProperties(options) {
if (options) {
this._layoutId = options.layoutId ? options.layoutId : CommonJS.Immersive.HERO_LAYOUT_ONE_ITEM;
if (options.primaryHeroImageData) {
this._primaryHeroImageData = options.primaryHeroImageData;
CommonJS.Immersive.HeroImage.decodeHeroImage(this._primaryHeroImageData.backgroundImage, this.element)
}
if (options.heroItems) {
this._heroItems = options.heroItems;
this._primaryHeroItemIndex = this._extractPrimaryHeroItemIndex(this._heroItems)
}
if (options.onitemclick) {
this.onitemclick = options.onitemclick
}
}
}, _extractPrimaryHeroItemIndex: function _extractPrimaryHeroItemIndex(heroItems) {
if (heroItems) {
if (heroItems.length === 1) {
return 0
}
else {
for (var i=0; i < heroItems.length; i++) {
if (heroItems[i].entityType === CommonJS.Immersive.PlatformHeroControl.CmsHeroEntityTypeEnum.Hero) {
return i
}
}
}
}
return null
}, _resolveLayoutId: function _resolveLayoutId(layoutId) {
var resolvedLayoutId=layoutId.toLowerCase();
if (resolvedLayoutId === CommonJS.Immersive.HERO_LAYOUT_ONE_ITEM.toLowerCase()) {
resolvedLayoutId = CommonJS.Immersive.HERO_LAYOUT_ONE_ITEM
}
else if (resolvedLayoutId === CommonJS.Immersive.HERO_LAYOUT_4_SMALL_ITEMS.toLowerCase()) {
resolvedLayoutId = CommonJS.Immersive.HERO_LAYOUT_4_SMALL_ITEMS
}
else if (resolvedLayoutId === CommonJS.Immersive.HERO_LAYOUT_MULTISTORY.toLowerCase()) {
resolvedLayoutId = CommonJS.Immersive.HERO_LAYOUT_4_SMALL_ITEMS
}
else {
if (this._heroItems.length === 1) {
resolvedLayoutId = CommonJS.Immersive.HERO_LAYOUT_ONE_ITEM
}
else {
resolvedLayoutId = CommonJS.Immersive.HERO_LAYOUT_4_SMALL_ITEMS
}
debugger
}
this._fragmentPath = CommonJS.Immersive.HERO_LAYOUT_TEMPLATES_PATH;
return resolvedLayoutId
}, _renderHeroItems: function _renderHeroItems() {
if (!this._renderHeroItemsPromises) {
this._renderHeroItemsPromises = []
}
var heroDataAndElementMapping=this._heroDataAndElementMapping;
if (heroDataAndElementMapping) {
for (var i=0; i < heroDataAndElementMapping.length; i++) {
if (heroDataAndElementMapping[i].element && heroDataAndElementMapping[i].data && heroDataAndElementMapping[i].render) {
var itemData=heroDataAndElementMapping[i].data,
moduleInfo=itemData.moduleInfo,
itemElem=heroDataAndElementMapping[i].element,
that=this;
var container=null;
if (moduleInfo) {
if (moduleInfo.renderer) {
container = moduleInfo.renderer(itemData)
}
else {
container = document.createElement("div");
var renderPromise=CommonJS.loadModule(moduleInfo, itemData, container).then(function renderHeroItems_checkThumbnail() {
that._decorateHeroTemplate(itemData, container, moduleInfo.templateId)
});
this._renderHeroItemsPromises.push(renderPromise)
}
if (moduleInfo.className) {
WinJS.Utilities.addClass(container, moduleInfo.className)
}
if (moduleInfo.tabIndex) {
container.tabIndex = moduleInfo.tabIndex
}
else {
container.tabIndex = 0
}
WinJS.Utilities.addClass(container, "platformClusterItem");
container.id = i.toString();
itemElem.appendChild(container)
}
}
}
}
else {
this._renderHeroItemsPromises.push(WinJS.Promise.wrap(null))
}
return WinJS.Promise.join(this._renderHeroItemsPromises)
}, _decorateHeroTemplate: function _decorateHeroTemplate(itemData, container, templateId) {
if (itemData && container) {
var heroTemplateEnum=CommonJS.Immersive.PlatformHeroControl.HeroControlTemplateIdEnum;
if (templateId === heroTemplateEnum.SecondaryHeroItem || templateId === heroTemplateEnum.SecondaryHeroItemWithThumbnailIcon) {
var imageSource=itemData.thumbnailImage,
thumbnailPresent=false;
if (imageSource) {
if ((typeof imageSource === "string") && (imageSource !== "")) {
thumbnailPresent = true
}
else if ((imageSource.lowResolutionUrl && imageSource.lowResolutionUrl !== "") || (imageSource.highResolutionUrl && imageSource.highResolutionUrl !== "") || (imageSource.url && imageSource.url !== "")) {
thumbnailPresent = true
}
}
if (!thumbnailPresent) {
var thumbnailDiv=WinJS.Utilities.query(".heroTileThumbnail", container);
if (thumbnailDiv.length > 0) {
thumbnailDiv = thumbnailDiv[0];
thumbnailDiv.style.height = "0px";
thumbnailDiv.style.width = "0px";
thumbnailDiv.style.margin = "0px"
}
}
if (thumbnailPresent && templateId === heroTemplateEnum.SecondaryHeroItemWithThumbnailIcon) {
var iconDev=WinJS.Utilities.query("#subHeroThumbnailIcon", container);
if (iconDev.length > 0) {
iconDev = iconDev[0];
switch (itemData.destinationEntityType) {
case"slideshow":
WinJS.Utilities.addClass(iconDev, "Slideshow");
break;
case"pano":
WinJS.Utilities.addClass(iconDev, "Photosynth");
break;
case"video":
WinJS.Utilities.addClass(iconDev, "Video");
break
}
}
}
}
}
}, _initItemClickedHandler: function _initItemClickedHandler() {
var that=this;
PlatformJS.Utilities.registerItemClickProxy(this.element, function itemsContainer_registerClusterItemClickProxyPredicate(domElement) {
return (WinJS.Utilities.hasClass(domElement, "platformClusterContent") || WinJS.Utilities.hasClass(domElement, "platformClusterItem"))
}, function itemsContainer_registerClusterItemClickProxyCompletion(domElement) {
that._onItemClicked(domElement)
}, {logUserAction: false});
Object.defineProperties(this, WinJS.Utilities.createEventProperties("itemclick"))
}, _onItemClicked: function _onItemClicked(domElement) {
if (PlatformJS.mainProcessManager.retailModeEnabled) {
PlatformJS.platformInitializedPromise.then(function onItemClicked_playDemoVideo() {
var videoSrc=PlatformJS.Services.configuration.getString("GettingStartedRetailMode");
if (videoSrc) {
PlatformJS.Navigation.navigateTo(videoSrc)
}
})
}
else {
var clusterItemElement=WinJS.Utilities.hasClass(domElement, "platformClusterItem") ? domElement : null;
if (clusterItemElement && this._heroDataAndElementMapping) {
var index=parseInt(clusterItemElement.id);
if (index < this._heroDataAndElementMapping.length) {
var model=this._heroDataAndElementMapping[index].data;
if (model.videoOptions && !model.videoWrapper) {
var container=this._heroDataAndElementMapping[index].element;
var videoWrapper=new CommonJS.VideoWrapper(container, {videoOptions: model.videoOptions});
if (videoWrapper) {
model.videoWrapper = videoWrapper;
videoWrapper._launchVideo()
}
}
if (model) {
this._logUserAction(model);
this.dispatchEvent("itemclick", {item: model})
}
}
}
}
}, _generateInstrumentationData: function _generateInstrumentationData(entity) {
var instrumentationData={};
if (entity.articleId) {
instrumentationData.contentId = entity.articleId;
instrumentationData.entityType = "article"
}
else if (entity.destination) {
var parseResult=Platform.Utilities.AppExUri.tryCreate(entity.destination);
if (parseResult && parseResult.appExUri && parseResult.appExUri.queryParameters) {
var params=parseResult.appExUri.queryParameters;
instrumentationData.contentId = params.contentId || params.pageId || params.panoid;
instrumentationData.entityType = params.entitytype
}
}
if (entity.title) {
instrumentationData.headline = CommonJS.Utils.stripHTML(entity.title)
}
return instrumentationData
}, _logUserAction: function _logUserAction(entity) {
var navMethod=PlatformJS.Utilities.getLastClickUserActionMethod(),
entityType=entity.entityType === CommonJS.Immersive.PlatformHeroControl.CmsHeroEntityTypeEnum.SubHero ? "Sub Hero" : "Main Hero",
that=this;
PlatformJS.deferredTelemetry(function deferredLogUserAction() {
var data=that._generateInstrumentationData(entity);
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(Microsoft.Bing.AppEx.Telemetry.ImpressionNavMethod.hero);
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Hero", entityType, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, navMethod, 0, JSON.stringify(data))
})
}, _logContentView: function _logContentView() {
var impression=PlatformJS.Navigation.mainNavigator.getCurrentImpression();
if (impression && this._heroItems && this._heroDataAndElementMapping) {
var kIndex=impression.addContent("Hero", "", "Layout id: {0}, Rendered hero items: {1}".format(this._layoutId, this._heroDataAndElementMapping.length), "unknown", new Date, "", "Number of all hero items: {0}".format(this._heroItems.length), false, Microsoft.Bing.AppEx.Telemetry.ContentWorth.Normal, false, "");
impression.logContentView(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, kIndex, Microsoft.Bing.AppEx.Telemetry.ContentViewMechanism.unknown, true, null)
}
}
}), WinJS.UI.DOMEventMixin);
var NS=WinJS.Namespace.define("CommonJS.Immersive", {
HERO_LAYOUT_ONE_ITEM: "SingleStory", HERO_LAYOUT_4_SMALL_ITEMS: "MultiStory4ItemSmall", HERO_LAYOUT_MULTISTORY: "Multiple_Stories_4", HERO_LAYOUT_TEMPLATES_PATH: "/common/Hero/html/HeroLayouts.html", HERO_IMAGE_WIDTH_RATIO_LANDSCAPE: .87, PlatformHeroControl: WinJS.Class.define(function platformHeroControl_ctor(element, options, scheduler) {
this.element = element ? element : document.createElement("div");
this.element.winControl = this;
CommonJS.Utils.markDisposable(this.element);
this.scheduler = scheduler;
this._init(options)
}, {
scheduler: null, _currentHeroControl: null, _stagingHeroControl: null, _currentHeroElement: null, _stagingHeroElement: null, _renderPromise: null, _refreshPromise: null, _titleGradient: null, _gradient: null, disableAnimation: true, _init: function _init(options) {
var element=this.element;
WinJS.Utilities.addClass(element, "platformHeroCluster fitHeroImageCover platformParallaxImageViewport");
var platformClusterElement=PlatformJS.Utilities.getAncestorByClassName(element, "platformCluster");
if (platformClusterElement) {
WinJS.Utilities.addClass(platformClusterElement, "platformHero")
}
var searchBox=CommonJS.processListener.getSearchBoxInstance();
if (searchBox && CommonJS.Immersive.HeaderOrchestrator.headerOrchestrator) {
CommonJS.Immersive.HeaderOrchestrator.headerOrchestrator.updateSearchBox(element.clientWidth)
}
this._currentHeroElement = document.createElement("div");
this._currentHeroElement.id = "currentHeroElement";
element.appendChild(this._currentHeroElement);
var titleGradient=this._titleGradient = document.createElement("div");
titleGradient.className = "platformTitleGradient";
element.appendChild(titleGradient);
var gradient=this._gradient = document.createElement("div");
gradient.className = "platformImageGradientContainer platformImageGradient platformHide";
element.appendChild(gradient);
this.showGradient = true;
this.showTitleGradient = true;
this.setProperties(options);
this._currentHeroControl = new HeroLayout(this._currentHeroElement, options)
}, setProperties: function setProperties(options) {
if (options) {
if (options.showGradient) {
this.showGradient = options.showGradient
}
if (options.showTitleGradient) {
this.showTitleGradient = options.showTitleGradient
}
if (options.scheduler) {
this.scheduler = options.scheduler
}
if (this._currentHeroControl) {
this._currentHeroControl.setProperties(options)
}
}
}, getPrimaryHeroImageControl: function getPrimaryHeroImageControl() {
var currentControl=this._currentHeroControl;
if (currentControl && currentControl._primaryHeroImageControl) {
return currentControl._primaryHeroImageControl
}
return null
}, renderLayout: function renderLayout() {
if (this._currentHeroControl) {
this._currentHeroControl.renderLayout()
}
else {
debugger
}
}, showTitleGradient: {set: function set(value) {
var titleGradient=this._titleGradient;
if (value && titleGradient) {
WinJS.Utilities.removeClass(this._titleGradient, "platformHide")
}
else if (titleGradient) {
WinJS.Utilities.addClass(this._titleGradient, "platformHide")
}
}}, showGradient: {set: function set(value) {
var gradient=this._gradient;
if (value && gradient) {
WinJS.Utilities.removeClass(this._gradient, "platformHide")
}
else if (gradient) {
WinJS.Utilities.addClass(this._gradient, "platformHide")
}
}}, refresh: function refresh(options) {
if (!this._currentHeroControl) {
return
}
if (options) {
var that=this;
var previousRefreshPromise=this._refreshPromise ? this._refreshPromise : WinJS.Promise.wrap(null);
var fullrefresh=this._currentHeroControl.checkRefreshType(options),
scheduler=this.scheduler,
stagingHeroElement=this._stagingHeroElement;
if (fullrefresh) {
if (!stagingHeroElement) {
stagingHeroElement = document.createElement("div");
stagingHeroElement.id = "stagingHeroElement";
this._stagingHeroElement = stagingHeroElement;
this.element.appendChild(stagingHeroElement);
stagingHeroElement.style.opacity = 0;
this._stagingHeroControl = new HeroLayout(stagingHeroElement, null)
}
if (!options.onitemclick && this._currentHeroControl.onitemclick) {
options.onitemclick = this._currentHeroControl.onitemclick
}
this._refreshPromise = previousRefreshPromise.then(function refreshHeroControl_scheduleRemoveOldContent() {
return CommonJS.SchedulePromise(scheduler, CommonJS.TaskPriority.high, "PlatformHeroControl:RefreshHero_RemoveOldText")
}).then(function refreshHeroControl_animateOutOldContent() {
if (that._currentHeroControl) {
return that._currentHeroControl.clearContent()
}
}).then(function refreshHeroControl_scheduleCreateLayout() {
return CommonJS.SchedulePromise(scheduler, CommonJS.TaskPriority.high, "PlatformHeroControl:RefreshHero_createNewLayout")
}).then(function refreshHeroControl_createLayout() {
if (that._stagingHeroControl) {
return that._stagingHeroControl.refresh(options, fullrefresh)
}
}).then(function refreshHeroControl_scheduleAnimateLayout() {
return CommonJS.SchedulePromise(scheduler, CommonJS.TaskPriority.high, "PlatformHeroControl:RefreshHero_animateNewImage")
}).then(function refreshHeroControl_animateNewLayoutWithImage() {
if (stagingHeroElement) {
return animateElementIn(stagingHeroElement)
}
}).then(function refreshHeroControl_scheduleAnimateInContent() {
return CommonJS.SchedulePromise(scheduler, CommonJS.TaskPriority.high, "PlatformHeroControl:RefreshHero_animateNewContent")
}).then(function refreshHeroControl_animateNewHeroContent() {
if (that._currentHeroElement && that._stagingHeroControl) {
that._currentHeroElement.style.opacity = 0;
return that._stagingHeroControl.animateInContent()
}
}).then(function refreshHeroControl_scheduleresetStagingControl() {
return CommonJS.SchedulePromise(scheduler, CommonJS.TaskPriority.normal, "PlatformHeroControl:RefreshHero_resetStagingControl")
}).then(function refreshHeroControl_resetStagingControl() {
that._resetHeroLayoutAndstagingLayout()
}).then(null, function refreshHeroErrorHandler(err) {
return handlePromiseError(err)
})
}
else {
this._refreshPromise = previousRefreshPromise.then(function refreshHeroControl_scheduleRefreshSecondaryItems() {
return CommonJS.SchedulePromise(scheduler, CommonJS.TaskPriority.high, "PlatformHeroControl:RefreshHero")
}).then(function refreshHeroControl_refreshSecondaryItems() {
if (that._currentHeroControl) {
return that._currentHeroControl.refresh(options, fullrefresh)
}
}).then(null, function refreshHeroErrorHandler(err) {
return handlePromiseError(err)
})
}
return this._refreshPromise
}
return WinJS.Promise.wrap(null)
}, _resetHeroLayoutAndstagingLayout: function _resetHeroLayoutAndstagingLayout() {
var oldHeroControl=this._currentHeroControl,
oldHeroElement=this._currentHeroElement;
if (this._currentHeroControl) {
oldHeroControl.clearLayout()
}
this._currentHeroControl = this._stagingHeroControl;
this._currentHeroElement = this._stagingHeroElement;
this._stagingHeroControl = oldHeroControl;
this._stagingHeroElement = oldHeroElement
}, render: function render(heroControl) {
var control=heroControl ? heroControl : this._currentHeroControl;
if (control) {
var scheduler=this.scheduler,
renderPromise=null;
if (this._renderPromise) {
var renderPromise=this._renderPromise.then(function platformHeroControl_scheduleHeroRender() {
return CommonJS.SchedulePromise(scheduler, CommonJS.TaskPriority.high, "PlatformHeroControl:RenderContent")
}).then(function platformHeroControl_renderContent() {
return control.render(true)
})
}
else {
var renderPromise=CommonJS.SchedulePromise(scheduler, CommonJS.TaskPriority.high, "PlatformHeroControl:RenderContent").then(function platformHeroControl_renderContent() {
return control.render(true)
})
}
this._renderPromise = renderPromise.then(null, function renderHeroErrorHandler(err) {
return handlePromiseError(err)
});
return this._renderPromise
}
return WinJS.Promise.wrap(null)
}, dispose: function dispose() {
if (this._renderPromise) {
this._renderPromise.cancel();
this._renderPromise = null
}
if (this._refreshPromise) {
this._refreshPromise.cancel();
this._refreshPromise = null
}
if (this._currentHeroControl) {
this._currentHeroControl.dispose();
this._currentHeroControl = null
}
if (this._stagingHeroControl) {
this._stagingHeroControl.dispose();
this._stagingHeroControl = null
}
this._titleGradient = null;
this._gradient = null
}
}, {
HeroControlTemplateIdEnum: {
MainHeroItem: "PrimaryHeroItemMultiStoryLayout", SecondaryHeroItem: "SecondaryHeroItemMultiStoryLayout", SecondaryHeroItemWithThumbnailIcon: "SecondaryHeroItemWithThumbnail"
}, CmsHeroEntityTypeEnum: {
SubHero: "SubHero", Hero: "Hero"
}, parseHeroContent: function parseHeroContent(response, createURIFunction) {
var clusters=response.clusters,
heroItems=[],
heroOptions={},
heroEntities=[],
layoutId=null,
lastModifiedOldHeroForm=null,
lastModified=null,
lastModifiedHeroEntityList=null,
cmsHeroEnityTypes=CommonJS.Immersive.PlatformHeroControl.CmsHeroEntityTypeEnum;
if (clusters) {
for (var i=0; i < clusters.length; i++) {
var cluster=clusters[i];
if (cluster.type === cmsHeroEnityTypes.Hero) {
heroEntities.push(cluster.hero);
layoutId = CommonJS.Immersive.HERO_LAYOUT_ONE_ITEM;
lastModifiedOldHeroForm = (cluster.lastModified && cluster.lastModified.utctime) ? cluster.lastModified.utctime : null;
break
}
}
if (heroEntities.length === 0) {
var subHeroCount=null,
subHeroParsed=0,
endParsing=false;
for (var i=0; (i < clusters.length) && (!endParsing); i++) {
var cluster=clusters[i];
if (cluster.type === "EntityList") {
var entityList=cluster.entityList.entities;
if (entityList) {
for (var j=0; (j < entityList.length); j++) {
var entity=entityList[j];
if (entity.entityType === cmsHeroEnityTypes.Hero) {
layoutId = cluster.entityList.template ? cluster.entityList.template : CommonJS.Immersive.HERO_LAYOUT_ONE_ITEM;
lastModifiedHeroEntityList = (cluster.lastModified && cluster.lastModified.utctime) ? cluster.lastModified.utctime : null;
if ((layoutId.toLowerCase()) === (CommonJS.Immersive.HERO_LAYOUT_ONE_ITEM.toLowerCase())) {
heroEntities.length = 0;
heroEntities.push(entity);
endParsing = true;
break
}
else {
subHeroCount = entity.relatedEntityCount ? entity.relatedEntityCount : null
}
heroEntities.push(entity)
}
else if (entity.entityType === cmsHeroEnityTypes.SubHero) {
subHeroParsed++;
if (subHeroCount && (subHeroCount <= subHeroParsed)) {
heroEntities.push(entity);
endParsing = true;
break
}
else {
heroEntities.push(entity)
}
}
}
}
}
}
}
if (heroEntities.length > 0) {
var latestUpdatedTime=null;
for (var i=0; i < heroEntities.length; i++) {
var result=heroEntities[i],
heroData=null;
if (typeof result.entityType === "undefined" || result.entityType === cmsHeroEnityTypes.Hero) {
heroData = CommonJS.Immersive.PlatformHeroControl.parseHeroItem(result, createURIFunction, cmsHeroEnityTypes.Hero);
heroOptions.primaryHeroImageData = CommonJS.Immersive.PlatformHeroControl.parseHeroImage(result);
heroData.entityType = CommonJS.Immersive.PlatformHeroControl.CmsHeroEntityTypeEnum.Hero
}
else {
heroData = CommonJS.Immersive.PlatformHeroControl.parseHeroItem(result, createURIFunction, cmsHeroEnityTypes.SubHero);
heroData.imageData = CommonJS.Immersive.PlatformHeroControl.parseHeroImage(result);
heroData.entityType = cmsHeroEnityTypes.SubHero
}
if (!lastModifiedOldHeroForm && heroData.updated) {
if (latestUpdatedTime) {
if (heroData.updated > latestUpdatedTime) {
latestUpdatedTime = heroData.updated
}
}
else {
latestUpdatedTime = heroData.updated
}
}
heroItems.push(heroData)
}
lastModified = latestUpdatedTime ? latestUpdatedTime : lastModifiedOldHeroForm;
if (!lastModified) {
lastModified = lastModifiedHeroEntityList
}
if (CommonJS.Utils.getBDITimeDelta(lastModified) < 0) {
lastModified = (CommonJS.Utils.getCurrentBDITime() - CommonJS.Utils._bdiTimeOriginEpoch) * 100000
}
heroOptions.heroItems = heroItems;
heroOptions.layoutId = layoutId;
heroOptions.lastModified = lastModified;
return heroOptions
}
}
return null
}, parseHeroItem: function parseHeroItem(heroItem, createURIFunction, heroType) {
var data=heroItem.content,
content={};
if (data) {
content.sourceImageUrl = data.source && data.source.favicon ? data.source.favicon : "";
var headline=data.headline ? toStaticHTML(data.headline) : "";
content.source = data.source && data.source.name ? data.source.name : "";
content.destination = heroItem.destination ? heroItem.destination : "";
if (createURIFunction) {
createURIFunction(content)
}
content.editorial = true;
content.abstract = data.abstract ? toStaticHTML(data.abstract) : "";
var snippet=content.abstract;
content.byline = data.byline ? data.byline : "";
var parser=window.DOMParser ? new window.DOMParser : null;
content.snippet = PlatformJS.Utilities.fixupBidiTextNodes(snippet, parser);
content.headline = PlatformJS.Utilities.fixupBidiTextNodes(headline, parser);
if (data.publicationDate && data.publicationDate.published && data.publicationDate.published.utctime) {
content.published = data.publicationDate.published;
var utcTime1=data.publicationDate.published.utctime;
var time1=CommonJS.Utils.convertBDITimeToFriendlyTime(utcTime1);
content.publishTime = time1 && time1.indexOf("NaN") < 0 ? time1 : ""
}
else {
content.publishTime = ""
}
if (data.publicationDate && data.publicationDate.updated && data.publicationDate.updated.utctime) {
content.updated = data.publicationDate.updated.utctime;
var utcTime2=data.publicationDate.updated.utctime;
var time2=CommonJS.Utils.convertBDITimeToFriendlyTime(utcTime2);
content.updatedTime = time2 && time2.indexOf("NaN") < 0 ? time2 : ""
}
else {
content.updatedTime = ""
}
content.moduleInfo = {
isInteractive: false, template: heroItem.template ? heroItem.template : ""
};
content.templateClass = heroItem.templateClass;
return content
}
else {
return null
}
}, parseHeroImage: function parseHeroImage(heroItem) {
if (heroItem.heroImage) {
var imageData={};
imageData.anchorPoint = heroItem.heroImage.anchorPoint;
var attributionData={
attributionText: heroItem.heroImage.image ? heroItem.heroImage.image.attribution : "", caption: heroItem.heroImage.image ? heroItem.heroImage.image.caption : ""
};
imageData.attributionData = attributionData;
var images=heroItem.heroImage.image && heroItem.heroImage.image.images ? heroItem.heroImage.image.images : null;
var backgroundImage={};
if (images) {
for (var i=0; i < images.length; i++) {
var image=images[i];
if (image.name === "original") {
imageData.focalPoint = image.heroFocalPoint;
imageData.imageSize = {
height: image.height, width: image.width
};
backgroundImage.highResolutionUrl = image.url
}
else if (image.name === "lowRes") {
imageData.focalPointLowRes = image.heroFocalPoint;
imageData.imageSizeLowRes = {
height: image.height, width: image.width
};
backgroundImage.lowResolutionUrl = image.url
}
}
imageData.backgroundImage = backgroundImage
}
return imageData
}
return null
}, getInstance: function getInstance() {
var heroCluster=WinJS.Utilities.query(".platformHeroCluster");
if (heroCluster.length > 0) {
return heroCluster[0].winControl
}
return null
}, getHeroVisibleWidth: function getHeroVisibleWidth() {
var platformHeroControl=CommonJS.Immersive.PlatformHeroControl.getInstance();
if (platformHeroControl && platformHeroControl.element) {
var heroWidth=platformHeroControl.element.clientWidth;
if (CommonJS.Immersive.HeaderOrchestrator.headerOrchestrator) {
var scrollPosition=CommonJS.Immersive.HeaderOrchestrator.headerOrchestrator.getScrollPosition();
return (heroWidth - scrollPosition)
}
}
}
})
})
})()