/*  © Microsoft. All rights reserved. */
WinJS.Namespace.define('CommonJS', {Version: 'latest'});
(function filtersInit() {
"use strict";
WinJS.Namespace.define("CommonJS.Filters", {drawerView: WinJS.Class.define(function drawerView_ctor(element, options) {
WinJS.UI.setOptions(this, options);
this.container = element;
element.winControl = this;
this._initialize()
}, {
onDismiss: null, onFlyoutShowing: null, onFlyoutHidden: null, getFilterContainer: function getFilterContainer(key) {
if (!this._ProvidedContainers) {
this._ProvidedContainers = {}
}
var ctr=document.createElement("div");
ctr.className = "immersiveFilterDrawerContainer";
this.drawerElement.appendChild(ctr);
return ctr
}, clear: function clear() {
this.drawerElement.innerHTML = ""
}, destroy: function destroy() {
if (this._flyout) {
this._flyout.removeEventListener("afterhide", this._afterHideHandler);
this._flyout.removeEventListener("beforeshow", this._onBeforeShowHandler);
this._flyout.removeEventListener("beforehide", this._onBeforeHideHandler);
this._flyout.hide()
}
if (this._drawer) {
this._drawer.removeEventListener("mouseup", this._drawerViewMouseUpBinding, false);
this._drawer.removeEventListener("mselementresize", this._drawerViewResizeBinding, false)
}
}, invalidate: function invalidate(filters){}, show: function show() {
this._flyout.show();
this._flyout._element.focus();
this.isShowing = true;
this._moveCaret();
var eatingDivs=document.querySelectorAll(".win-flyoutmenuclickeater");
for (var i=0, l=eatingDivs.length; i < l; i++) {
var div=eatingDivs[i];
div.parentNode.removeChild(div)
}
}, hide: function hide() {
this._flyout.hide();
this.isShowing = false
}, _initialize: function _initialize() {
var drawer=this._drawer = document.createElement("div");
var caret=this._caret = document.createElement("div");
caret.className = "immersiveDrawerCaret";
drawer.appendChild(caret);
drawer.setAttribute("id", Math.random() * 1e7);
var caretAccent=document.createElement("div");
caret.appendChild(caretAccent);
this._flyout = new WinJS.UI.Flyout(drawer);
this._flyout.anchor = this.container;
var that=this;
this._afterHideHandler = function(event) {
if (that.onDismiss) {
that.onDismiss(arguments)
}
that.isShowing = false
};
this._flyout.addEventListener("afterhide", this._afterHideHandler);
this._onBeforeShowHandler = function(event) {
if (that.onFlyoutShowing) {
that.onFlyoutShowing()
}
that.isShowing = true
};
this._flyout.addEventListener("beforeshow", this._onBeforeShowHandler);
this._onBeforeHideHandler = function(event) {
if (that.onFlyoutHidden) {
that.onFlyoutHidden()
}
};
this._flyout.addEventListener("beforehide", this._onBeforeHideHandler);
drawer.className = "immersiveFilterDrawer ";
var handle=document.createElement("div");
handle.className = "immersiveFilterDrawerHandle";
var drawerElement=document.createElement("div");
this.drawerElement = drawerElement;
drawerElement.className = "immersiveFilterDrawerChild";
this.container.appendChild(drawer);
drawer.appendChild(drawerElement);
drawer.appendChild(handle);
this._drawerViewMouseUpBinding = this._onDrawerViewMouseUp.bind(this);
this._drawerViewResizeBinding = this._onDrawerViewResize.bind(this);
drawer.addEventListener("mouseup", this._drawerViewMouseUpBinding, false);
drawer.addEventListener("mselementresize", this._drawerViewResizeBinding, false)
}, _onDrawerViewMouseUp: function _onDrawerViewMouseUp(event) {
event.preventDefault();
event.cancelBubble = true;
return false
}, _onDrawerViewResize: function _onDrawerViewResize() {
var positionLeft=this._moveCaret();
positionLeft = parseInt(positionLeft) + parseInt(this._caret.currentStyle[document.dir === "rtl" ? "marginRight" : "marginLeft"]) + this._caret.offsetWidth;
if (positionLeft > window.innerWidth || positionLeft < 0) {
this.hide()
}
}, _moveCaret: function _moveCaret() {
var elem=this.container;
var offsetLeft=0;
var offsetWidth=this.container.offsetWidth;
do {
offsetLeft += elem.getOffset();
elem = elem.offsetParent
} while (elem.offsetParent !== document.body && elem !== this._flyout._element.offsetParent);
var scrollOffset=this.container.parentNode.parentNode.scrollLeft;
var left=offsetLeft + 0.5 * offsetWidth - (0.5 * this._caret.offsetWidth) - scrollOffset + "px";
this._caret.style[document.dir === "rtl" ? "right" : "left"] = left;
return left
}
})})
})();
(function filtersInit() {
"use strict";
WinJS.Namespace.define("CommonJS.Filters", {FilterController: WinJS.Class.define(function filterController_ctor(element, options) {
WinJS.UI.setOptions(this, options);
this.container = element;
element.winControl = this;
this._modelCounter = 0;
this.initialize()
}, {
type: {
get: function get() {
return this._filterType
}, set: function set(value) {
this._filterType = value
}
}, model: {set: function set(options) {
WinJS.UI.setOptions(this, options);
this._modelCounter++
}}, key: {
get: function get() {
return this._key
}, set: function set(value) {
this._key = value
}
}, displayText: {
get: function get() {
return this._displayText
}, set: function set(value) {
this._displayText = value
}
}, filterData: {
get: function get() {
return this._filterData
}, set: function set(value) {
this._filterData = value
}
}, onSelectionChanged: {
get: function get() {
return this._onSelectionChanged
}, set: function set(value) {
this._onSelectionChanged = value
}
}, onDismiss: {
get: function get() {
return this._onDismiss
}, set: function set(value) {
this._onDismiss = value
}
}, _setView: function _setView() {
var viewOptions=this.viewOptions || {};
viewOptions.onSelectionChanged = this.onSelectionChangedHandler.bind(this);
switch (this.type) {
case CommonJS.Filters.FilterType.DropDownSingleSelect:
viewOptions.singleSelect = true;
viewOptions.useWideTile = this.useWideTile;
this.view = new CommonJS.Filters.ItemsFilterView(this.container, viewOptions);
break;
case CommonJS.Filters.FilterType.Toggle:
viewOptions.singleSelect = true;
viewOptions.useWideTile = this.useWideTile;
this.view = new CommonJS.Filters.ToggleFilterView(this.container, viewOptions);
break;
case CommonJS.Filters.FilterType.DropDownMultipleSelect:
viewOptions.singleSelect = false;
viewOptions.useWideTile = this.useWideTile;
this.view = new CommonJS.Filters.ItemsFilterView(this.container, viewOptions);
break;
case CommonJS.Filters.FilterType.Slider:
this.view = new CommonJS.Filters.SliderFilterView(this.container, viewOptions);
break;
case CommonJS.Filters.FilterType.TextBox:
this.view = new CommonJS.Filters.TextBoxFilterView(this.container, viewOptions);
break;
case CommonJS.Filters.FilterType.Custom:
if (this.customView) {
this.view = new this.customView(this.container, viewOptions)
}
else {
throw"custom filter type with no customView set";
}
break;
default:
throw"invalid filter type specified for filter";
break
}
}, onSelectionChangedHandler: function onSelectionChangedHandler(event) {
var oldState=this._state || {nostate: true};
if (this._isDropDown()) {
this._dropDownSelectionHandler(event)
}
else if (this._isSlider()) {
this._sliderSelectionHandler(event)
}
else if (this._isToggle()) {
this._toggleSelectionHandler(event)
}
else if (this._isTextBox()) {
this._textBoxSelectionHandler(event)
}
var tmpState=this.getState();
var newState=tmpState;
var isNewState=!CommonJS.Filters.Utilities.areStatesEqual(oldState, newState);
if (this.onSelectionChanged && isNewState) {
this.onSelectionChanged(newState)
}
this._state = newState
}, getState: function getState() {
var newState=null;
if (this._isDropDown()) {
newState = this._getDropDownState()
}
else if (this._isSlider()) {
newState = this._getSliderState()
}
else if (this._isToggle()) {
newState = this._getToggleState()
}
else if (this._isCustom()) {
newState = this._getCustomState()
}
else if (this._isTextBox()) {
newState = this._getTextBoxState()
}
var state={
key: this.key, type: this.type, state: newState, modelCounter: this._modelCounter
};
return state
}, _getDropDownState: function _getDropDownState() {
var aggregateState={};
if (!this.filterData) {
return {}
}
for (var key in this.filterData) {
var item=this.filterData[key];
if (item.isSelected) {
aggregateState[item.key] = item
}
}
return aggregateState
}, _getSliderState: function _getSliderState() {
return this.filterData
}, _getTextBoxState: function _getTextBoxState() {
return {queryText: (this.filterData && this.filterData[0] && typeof this.filterData[0].key === "string") ? this.filterData[0].key : null}
}, _getCustomState: function _getCustomState() {
var ret={};
if (this.view.getState) {
ret = this.view.getState(this.filterData)
}
return ret
}, _getToggleState: function _getToggleState() {
return this._getDropDownState()
}, _dropDownSelectionHandler: function _dropDownSelectionHandler(event) {
var item=event.item;
var key=item.index;
if (this.type === CommonJS.Filters.FilterType.DropDownSingleSelect || this.type === CommonJS.Filters.FilterType.Toggle) {
for (var filterKey in this.filterData) {
this.filterData[filterKey].isSelected = false
}
}
this.filterData[key].isSelected = event.selected
}, _sliderSelectionHandler: function _sliderSelectionHandler(event) {
var item=event.item;
var key=event.key;
this.filterData = item.range
}, _toggleSelectionHandler: function _toggleSelectionHandler(event) {
this._dropDownSelectionHandler(event)
}, _textBoxSelectionHandler: function _textBoxSelectionHandler(event) {
this.filterData[0].key = event
}, _isDropDown: function _isDropDown() {
return (this.type === CommonJS.Filters.FilterType.DropDownSingleSelect || this.type === CommonJS.Filters.FilterType.DropDownMultipleSelect)
}, _isSlider: function _isSlider() {
return this.type === CommonJS.Filters.FilterType.Slider
}, _isToggle: function _isToggle() {
return this.type === CommonJS.Filters.FilterType.Toggle
}, _isCustom: function _isCustom() {
return this.type === CommonJS.Filters.FilterType.Custom
}, _isTextBox: function _isTextBox() {
return this.type === CommonJS.Filters.FilterType.TextBox
}, initialize: function initialize() {
this._setView()
}, destroy: function destroy(){}, invalidate: function invalidate() {
var tmpState=this.getState();
if (CommonJS.Filters.Utilities.areStatesEqual(tmpState, this._state)) {
return
}
this._state = tmpState;
this.view.invalidate(this)
}
})})
})();
(function filtersInit() {
"use strict";
WinJS.Namespace.define("CommonJS.Filters", {FilterGroup: WinJS.Class.define(function filterGroup_ctor(element, options) {
WinJS.UI.setOptions(this, options);
this.container = element;
element.winControl = this;
var that=this;
this._filterStates = {};
var summaryOptions={};
summaryOptions.onClick = this._onSummaryClicked.bind(this);
var selectionOptions={};
selectionOptions.onDismiss = function() {
if (that.hasNewState) {
that._onFilterDismissedHandler.call(that, that._filterStates)
}
that.hasNewState = false
};
selectionOptions.onFlyoutShowing = function(event) {
if (that.summaryView) {
that.summaryView.setPressedState.call(that.summaryView, true)
}
if (that.onFlyoutShowing) {
return that.onFlyoutShowing.call(that)
}
};
selectionOptions.onFlyoutHidden = function(event) {
if (that.summaryView) {
that.summaryView.setPressedState.call(that.summaryView, false)
}
if (that.onFlyoutHidden) {
return that.onFlyoutHidden.call(that)
}
};
if (this.filterModels.length === 1 && this.filterModels[0].inlineRender) {
this.selectionView = new CommonJS.Filters.inlineRenderView(this.container, {makeAccessibleContainer: this.filterModels[0].type === CommonJS.Filters.FilterType.Toggle})
}
else {
this.summaryView = new CommonJS.Filters.keyValueSummaryView(this.container, summaryOptions);
this.selectionView = new CommonJS.Filters.drawerView(this.summaryView.anchor, selectionOptions);
this.summaryView.setSelectionView(this.selectionView)
}
}, {
filterModels: {
get: function get() {
return this._filterModels
}, set: function set(value) {
this._filterModels = value
}
}, model: {set: function set(options) {
WinJS.UI.setOptions(this, options)
}}, hidden: {
get: function get() {
if (this.isRemovable) {
return this._hidden
}
return false
}, set: function set(v) {
this._hidden = v
}
}, key: {
get: function get() {
return this._key
}, set: function set(value) {
this._key = value
}
}, filters: {
get: function get() {
return this._filters
}, set: function set(value) {
this._filters = value
}
}, summaryView: {
get: function get() {
return this._summaryView
}, set: function set(value) {
this._summaryView = value
}
}, selectionView: {
get: function get() {
return this._selectionView
}, set: function set(value) {
this._selectionView = value
}
}, onSelectionChanged: {
get: function get() {
return this._onSelectionChanged
}, set: function set(value) {
this._onSelectionChanged = value
}
}, onDismiss: {
get: function get() {
return this._onDismiss
}, set: function set(value) {
this._onDismiss = value
}
}, getSummaryData: function getSummaryData() {
var that=this;
var filters=that.filters;
var summary={
displayText: that.displayText, key: that.key
};
summary.filterStates = [];
for (var key in filters) {
var filter=filters[key];
var state=filter.getState();
summary.filterStates.push(state)
}
return summary
}, _onFilterSelectionChanged: function _onFilterSelectionChanged(filter, newState) {
this.hasNewState = true;
this.setState(filter, newState);
if (filter.immediateRefresh) {
this._onFilterDismissedHandler(this._filterStates);
this.hasNewState = false;
if (filter.type === CommonJS.Filters.FilterType.DropDownSingleSelect) {
this.selectionView.hide()
}
}
}, setState: function setState(filter, newState) {
this._filterStates[filter.key] = newState
}, getState: function getState() {
return this._filterStates
}, invalidateFilterModels: function invalidateFilterModels() {
var that=this;
var models=this.filterModels;
if (!models) {
models = []
}
var modelsDictionary={};
for (var i=0, l=models.length; i < l; i++) {
var m=models[i];
modelsDictionary[m.key] = m
}
if (!this.filters) {
this.filters = {}
}
var filters=this.filters;
for (var key in modelsDictionary) {
var model=modelsDictionary[key];
model.onSelectionChanged = function(state) {
that._onFilterSelectionChanged.apply(that, [model, state])
};
if (filters[key]) {
filters[key].model = model
}
else {
filters[key] = new CommonJS.Filters.FilterController(this.selectionView.getFilterContainer(key), model)
}
}
for (var key2 in filters) {
var filter=modelsDictionary[key2];
if (!filter) {
filters[key2].destroyOnInvalidate = true
}
}
}, invalidateFilters: function invalidateFilters() {
if (!this.filters) {
return
}
var filters=this.filters;
for (var key in filters) {
var filter=filters[key];
if (filter.destroyOnInvalidate) {
filter.destroy();
delete this.filters[key]
}
else {
filter.invalidate();
this._filterStates[filter.key] = filter.getState()
}
}
}, invalidate: function invalidate() {
this.invalidateFilterModels();
this.invalidateFilters();
if (this.selectionView) {
this.selectionView.invalidate(this.filters)
}
if (this.summaryView) {
this.summaryView.invalidate(this.getSummaryData())
}
}, destroy: function destroy() {
if (this.summaryView) {
this.summaryView.destroy()
}
if (this.selectionView) {
this.selectionView.destroy()
}
}, _onFilterDismissedHandler: function _onFilterDismissedHandler(element) {
this.invalidate();
this.onDismiss(this, element)
}, _onSummaryClicked: function _onSummaryClicked(element) {
var v=this.selectionView;
if (v) {
if (v.isShowing) {
v.hide()
}
else {
v.show()
}
}
}
})})
})();
(function filtersInit() {
"use strict";
WinJS.Namespace.define("CommonJS.Filters", {FilterMenu: WinJS.Class.define(function filterMenu_ctor(element, options) {
WinJS.UI.setOptions(this, options);
this.container = element;
this._filterGroupStates = {};
this.initialize()
}, {
container: {
get: function get() {
return this._container
}, set: function set(value) {
this._container = value
}
}, filterGroupModels: {set: function set(value) {
this._filterGroupModels = value;
this.invalidate()
}}, title: {
get: function get() {
return this._title
}, set: function set(value) {
if (this._title !== value) {
this.setTitle(value)
}
this._title = value
}
}, onFGDismissedHandler: function onFGDismissedHandler(group, groupStates) {
this._filterGroupStates[group.key] = {
key: group.key, state: groupStates
};
if (this.onDismiss) {
this.onDismiss(this._filterGroupStates)
}
}, onStateChanged: {
get: function get() {
return this._onStateChanged
}, set: function set(value) {
this._onStateChanged = value
}
}, onValueChanged: {
get: function get() {
return this._onValueChanged
}, set: function set(value) {
this._onValueChanged = value
}
}, filterGroups: {
get: function get() {
return this._filterGroups
}, set: function set(value) {
this._filterGroups = value
}
}, view: {
get: function get() {
return this._view
}, set: function set(value) {
this._view = value
}
}, setTitle: function setTitle(title) {
this.view.setTitle(title)
}, getState: function getState() {
return this._filterGroupStates
}, toggleAddRemoveFiltersMenu: function toggleAddRemoveFiltersMenu(hide){}, _onFlyoutShowing: function _onFlyoutShowing(event) {
if (this.onFlyoutShowing) {
this.onFlyoutShowing(event)
}
}, _onFlyoutHidden: function _onFlyoutHidden(event) {
if (this.onFlyoutHidden) {
this.onFlyoutHidden(event)
}
}, initialize: function initialize() {
this.view = new CommonJS.Filters.FilterMenuView(this.container);
this.filterGroupsContainer = this.view.initialize()
}, invalidate: function invalidate() {
this.invalidateModels();
this.invalidateFilterGroups();
this.view.invalidate(this.filterGroups)
}, invalidateModels: function invalidateModels() {
var that=this;
var models=this._filterGroupModels;
if (!models) {
models = []
}
var modelsDictionary={};
for (var i=0, l=models.length; i < l; i++) {
var m=models[i];
modelsDictionary[m.key] = m
}
if (!this.filterGroups) {
this.filterGroups = {}
}
var groups=this.filterGroups;
var key=null;
for (key in modelsDictionary) {
var model=modelsDictionary[key];
model.onDismiss = function() {
that.onFGDismissedHandler.apply(that, arguments)
};
model.onFlyoutHidden = function() {
that._onFlyoutHidden.apply(that, arguments)
};
model.onFlyoutShowing = function() {
that._onFlyoutShowing.apply(that, arguments)
};
if (groups[key]) {
groups[key].model = model
}
else {
groups[key] = new CommonJS.Filters.FilterGroup(this.filterGroupsContainer, model)
}
}
for (key in groups) {
var group=modelsDictionary[key];
if (!group) {
groups[key].destroyOnInvalidate = true
}
}
}, invalidateFilterGroups: function invalidateFilterGroups() {
if (!this.filterGroups) {
return
}
var groups=this.filterGroups;
for (var key in groups) {
var group=groups[key];
if (group.destroyOnInvalidate) {
group.destroy();
delete this.filterGroups[key]
}
else {
group.invalidate();
this._filterGroupStates[group.key] = {
key: group.key, state: group.getState()
}
}
}
}, dispose: function dispose() {
var groups=this.filterGroups;
if (groups) {
for (var key in groups) {
var group=groups[key];
if (group && group.destroy) {
group.destroy()
}
}
}
this.container.innerHTML = "";
this.view.dispose()
}
})})
})();
(function filtersInit() {
"use strict";
WinJS.Namespace.define("CommonJS.Filters", {FilterMenuView: WinJS.Class.define(function filterMenuView_ctor(element, options) {
WinJS.UI.setOptions(this, options);
this.container = element;
element.winControl = this
}, {
setTitle: function setTitle(title) {
this.filterMenuTitle.innerHTML = title
}, dispose: function dispose() {
CommonJS.WindowEventManager.removeEventListener(CommonJS.WindowEventManager.Events.WINDOW_RESIZE, this._resizeHandler);
if (this.left && this.right && this._onBtnClick) {
this.left.removeEventListener("click", this._onBtnClick);
this.right.removeEventListener("click", this._onBtnClick)
}
}, invalidate: function invalidate(models) {
var left=this.left;
var right=this.right;
var menu=this.menu;
var hideableItems=[];
var hasHidden=false;
for (var group in models) {
var item=models[group];
var hidden=item.hidden;
hasHidden = hasHidden || hidden;
if (item.isRemovable) {
hideableItems.push(item)
}
var summaryView=this.container.querySelector('[groupkey="' + item.key + '"]');
if (summaryView) {
if (hidden) {
WinJS.Utilities.addClass(summaryView, "filterGroupHide")
}
else {
WinJS.Utilities.removeClass(summaryView, "filterGroupHide")
}
}
}
if (hasHidden) {
WinJS.Utilities.removeClass(menu, "filterGroupHide");
menu.setAttribute("aria-hidden", "false")
}
else {
WinJS.Utilities.addClass(menu, "filterGroupHide");
menu.setAttribute("aria-hidden", "true")
}
this._reevaluateButtons();
this._setMoreMenuItems(hideableItems);
this._model = models
}, _showFilterMenuItem: function _showFilterMenuItem(key) {
this._model[key].hidden = false;
this.invalidate(this._model)
}, _hideFilterMenuItem: function _hideFilterMenuItem(key) {
this._model[key].hidden = true;
this.invalidate(this._model)
}, _makeMoreFilterItem: function _makeMoreFilterItem(item, ctr) {
var _onMoreFilterItemClick=function(event) {
if (item.hidden) {
this._showFilterMenuItem(item.key)
}
else {
this._hideFilterMenuItem(item.key)
}
};
var div=CommonJS.Filters.Utilities.makeAccessibleContainer(_onMoreFilterItemClick.bind(this));
var textContent=document.createElement("div");
div.appendChild(textContent);
textContent.textContent = item.displayText;
textContent.className = "filterMenuItemText";
var selectionIndicator=document.createElement("div");
selectionIndicator.className = "filterMenuItemHiddenIndicator";
div.appendChild(textContent);
div.appendChild(selectionIndicator);
var className="immersiveMoreFilterItem immersiveFilterItem filterItemLarge ";
if (item.hidden) {
className += "filtergroup-hidden"
}
else {
className += "filtergroup-showing"
}
div.className = className;
ctr.appendChild(div)
}, _setMoreMenuItems: function _setMoreMenuItems(items) {
var drawer=this.showMoreFlyout;
drawer.clear();
var addRemove=drawer.getFilterContainer("text");
addRemove.textContent = PlatformJS.Services.resourceLoader.getString("/platform/addMoreFilters");
var ctr=drawer.getFilterContainer("menu");
WinJS.Utilities.addClass(ctr, "immersiveFilterItemContainer");
for (var i=0; i < items.length; i++) {
var item=items[i];
this._makeMoreFilterItem(item, ctr)
}
}, _hideElement: function _hideElement(element, hide) {
if (!element) {
return
}
if (hide) {
WinJS.Utilities.addClass(element, "filterGroupHide");
element.setAttribute("aria-hidden", "true")
}
else {
WinJS.Utilities.removeClass(element, "filterGroupHide");
element.setAttribute("aria-hidden", "false")
}
}, _reevaluateButtons: function _reevaluateButtons() {
var filterChildren=this.filterGroupsScroller.children;
if (!filterChildren || filterChildren.length === 0) {
return
}
this._hideElement(this.left, true);
this._hideElement(this.right, true);
var outsideWidth=this.filterGroupsScroller.offsetWidth;
var insideWidth=filterChildren[0].scrollWidth;
if (outsideWidth < insideWidth) {
this._hideElement(this.paginationControls, false);
this._hideElement(this.left, false);
this._hideElement(this.right, false)
}
else {
if (WinJS.Utilities.hasClass(this.menu, "filterGroupHide")) {
this._hideElement(this.paginationControls, true)
}
}
}, createPaginationControls: function createPaginationControls() {
var that=this;
var onBtnClick=this._onBtnClick = function(event) {
var isLeft=event.currentTarget.getAttribute("id") === "filtermenu-Left";
var scroller=that.filterGroupsScroller;
var scrollerOffsetWidth=scroller.offsetWidth;
var filterOffset=scroller.getOffset();
var container=scroller.children[0];
var currentLeft=scroller.scrollLeft;
var numChildren=container.children.length;
var firstVisibleChildIndex=0;
var lastVisibleChildIndex=numChildren - 1;
for (var i=0; i < numChildren; i++) {
var offset=Math.max(container.children[i].getOffset() - filterOffset, 0);
if (offset >= currentLeft) {
firstVisibleChildIndex = i;
break
}
}
for (var i2=1; i2 < container.children.length; i2++) {
var curChild=container.children[i2];
if (curChild.getOffset() + curChild.offsetWidth > scrollerOffsetWidth + currentLeft) {
lastVisibleChildIndex = i2 - 1;
break
}
}
;
var scrollPos=0;
if (isLeft) {
scrollPos = container.children[Math.max(0, firstVisibleChildIndex - 1)].getOffset()
}
else {
var child=container.children[Math.min(lastVisibleChildIndex + 1, container.children.length - 1)];
scrollPos = child.getOffset() + child.offsetWidth;
scrollPos -= scrollerOffsetWidth
}
scroller.scrollLeft = scrollPos
};
var makeButton=function(direction) {
var btn=CommonJS.Filters.Utilities.makeAccessibleContainer(onBtnClick);
btn.className = "immersiveFilterMenuButton menu" + direction + "Button filterGroupHide immersiveFilterGroup immersiveDropDownFilter";
btn.setAttribute("id", "filtermenu-" + direction);
direction = (document.dir === "ltr" ? direction : (direction === "Left" ? "Right" : "Left"));
if (direction === "Left") {
btn.textContent = " \uE016 "
}
else {
btn.textContent = " \uE017 "
}
btn.setAttribute("aria-hidden", "true");
return btn
};
var ctr=document.createElement("div");
ctr.setAttribute("class", "immersiveFilterPaginationControls");
var menu=this.menu = CommonJS.Filters.Utilities.makeAccessibleContainer(this._onMoreFiltersClick.bind(this));
var left=this.left = makeButton("Left");
var right=this.right = makeButton("Right");
menu.className = " immersiveFilterMenuButton menuAddButton filterGroupHide immersiveFilterGroup immersiveDropDownFilter";
menu.setAttribute("aria-hidden", "true");
menu.textContent = PlatformJS.Services.resourceLoader.getString("/platform/More");
var selectionOptions={};
selectionOptions.onDismiss = function() {
that.moreFiltersFlyoutShowing = false
};
selectionOptions.onFlyoutShowing = function(event) {
if (that.onFlyoutShowing) {
return that.onFlyoutShowing.call(that)
}
};
selectionOptions.onFlyoutHidden = function(event) {
if (that.onFlyoutHidden) {
return that.onFlyoutHidden.call(that)
}
};
this.showMoreFlyout = new CommonJS.Filters.drawerView(menu, selectionOptions);
ctr.appendChild(menu);
ctr.appendChild(left);
ctr.appendChild(right);
return ctr
}, _onMoreFiltersClick: function _onMoreFiltersClick() {
if (!this.moreFiltersFlyoutShowing) {
this.moreFiltersFlyoutShowing = true;
this._showMoreFilters()
}
else {
this.moreFiltersFlyoutShowing = false;
this._hideMoreFilters()
}
}, _showMoreFilters: function _showMoreFilters() {
this.showMoreFlyout.show()
}, _hideMoreFilters: function _hideMoreFilters() {
this.showMoreFlyout.hide()
}, initialize: function initialize(model) {
var c=this.container;
var filterMenuTitle=this.filterMenuTitle = document.createElement("div");
WinJS.Utilities.addClass(filterMenuTitle, "immersiveFilterBarTitle");
var filterGroupsScroller=this.filterGroupsScroller = document.createElement("div");
filterGroupsScroller.className = "immersiveFilterGroupsScroller";
var filterGroupsDiv=this.groupsContainer = document.createElement("div");
WinJS.Utilities.addClass(filterGroupsDiv, "immersiveFilterGroupsContainer");
var resizeHandler=this._resizeHandler = this._reevaluateButtons.bind(this);
CommonJS.WindowEventManager.addEventListener(CommonJS.WindowEventManager.Events.WINDOW_RESIZE, resizeHandler);
var paginationControls=this.paginationControls = this.createPaginationControls(model);
c.appendChild(filterMenuTitle);
filterGroupsScroller.appendChild(filterGroupsDiv);
c.appendChild(filterGroupsScroller);
c.appendChild(paginationControls);
return filterGroupsDiv
}
})})
})();
(function filtersInit() {
"use strict";
WinJS.Namespace.define("CommonJS.Filters", {FilterType: {
Toggle: "Toggle", DropDownSingleSelect: "Single", DropDownMultipleSelect: "Multiple", Slider: "Slider", TextBox: "TextBox", Custom: "Custom"
}})
})();
(function filtersInit() {
"use strict";
WinJS.Namespace.define("CommonJS.Filters", {FilterView: WinJS.Class.define(function filterView_ctor(element, options) {
WinJS.UI.setOptions(this, options);
this.container = element;
element.winControl = this
}, {
_onItemSelected: function _onItemSelected(item) {
var selectedText="filter-selected";
var selected=false;
var key=item.getAttribute("key");
var modelItem=this.cachedItems[key];
if (modelItem) {
if (WinJS.Utilities.hasClass(item, selectedText)) {
WinJS.Utilities.removeClass(item, selectedText)
}
else {
WinJS.Utilities.addClass(item, selectedText);
selected = true
}
item.setAttribute("aria-checked", selected ? "true" : "false");
if (this.onSelectionChanged) {
this.onSelectionChanged({
item: modelItem, selected: selected
})
}
}
if (this.singleSelect) {
var others=this.itemsList.querySelectorAll("." + this.itemClass + ':not([key="' + key + '"])');
for (var i=0, l=others.length; i < l; i++) {
var deselectableItem=others[i];
WinJS.Utilities.removeClass(deselectableItem, selectedText);
deselectableItem.setAttribute("aria-checked", "false")
}
}
return false
}, invalidate: function invalidate(model) {
this.itemsList.innerHTML = "";
var items=model.filterData;
this.cachedItems = items;
for (var key in items) {
this._makeItem(items[key])
}
var children=this.itemsList.children;
if (children.length > 1) {
children[children.length - 1].addEventListener("keydown", this._onLastItemTab);
children[0].addEventListener("keydown", this._onFirstItemTab)
}
}, _onLastItemTab: function _onLastItemTab(event) {
if (event.key === "Tab" && !event.shiftKey) {
var firstChild=event.currentTarget.parentNode.children[0];
firstChild.focus();
event.preventDefault();
event.cancelBubble = true;
return false
}
}, _onFirstItemTab: function _onFirstItemTab(event) {
if (event.key === "Tab" && event.shiftKey) {
var children=event.currentTarget.parentNode.children;
var lastChild=children[children.length - 1];
lastChild.focus();
event.preventDefault();
event.cancelBubble = true;
return false
}
}, initialize: function initialize() {
var itemsList=this.itemsList = document.createElement("ul");
itemsList.className = this.itemClass + "Container";
itemsList.setAttribute("role", "menu");
this.container.appendChild(itemsList);
var itemMargin=document.createElement("div");
itemMargin.className = "immersiveFilterDrawerBottomMargin";
this.container.appendChild(itemMargin)
}, _makeItem: function _makeItem(item, index) {
var accessibleCtr=document.createElement("div");
var that=this;
PlatformJS.Utilities.registerItemClickProxy(accessibleCtr, function filterView_registerItemClickProxyFilterButtonPredicate(element) {
if (WinJS.Utilities.hasClass(element, "filterButton")) {
return true
}
}, function filterView_registerItemClickProxyFilterButtonCompletion(element, event) {
event.preventDefault();
that._onItemSelected.call(that, element)
});
var centerDiv=document.createElement("div");
centerDiv.innerHTML = item.displayText;
centerDiv.className = "filterMenuItemText";
accessibleCtr.appendChild(centerDiv);
accessibleCtr.setAttribute("key", item.index);
accessibleCtr.setAttribute("tabIndex", 0);
accessibleCtr.setAttribute("role", "menuitemcheckbox");
accessibleCtr.setAttribute("aria-checked", item.isSelected ? "true" : "false");
accessibleCtr.setAttribute("aria-labelledby", item.displayText);
var checkBox=document.createElement("div");
checkBox.className = "filterItemCheckBox";
accessibleCtr.appendChild(checkBox);
var content=document.createElement("div");
content.className = "checkBoxContent";
checkBox.appendChild(content);
accessibleCtr.className = "filterButton";
if (this.useWideTile) {
accessibleCtr.className += " filterItemLarge"
}
this.itemsList.appendChild(accessibleCtr);
var className=this.itemClass;
if (item.isSelected) {
className += " filter-selected"
}
WinJS.Utilities.addClass(accessibleCtr, className);
PlatformJS.Utilities.enablePointerUpDownAnimations(accessibleCtr);
PlatformJS.Utilities.enableArrowKeyNavigation(accessibleCtr, false);
return accessibleCtr
}
})})
})();
(function filtersInit() {
"use strict";
WinJS.Namespace.define("CommonJS.Filters", {inlineRenderView: WinJS.Class.define(function inlineRenderView_ctor(element, options) {
WinJS.UI.setOptions(this, options);
this.container = element;
element.winControl = this;
this.initialize()
}, {
makeAccessibleContainer: false, getFilterContainer: function getFilterContainer(key) {
var ctr=this.renderElement = this.makeAccessibleContainer ? CommonJS.Filters.Utilities.makeAccessibleContainer() : document.createElement("div");
this.container.appendChild(ctr);
return ctr
}, hide: function hide() {
WinJS.Utilities.addClass(this.renderElement, "filterGroupHide")
}, show: function show() {
WinJS.Utilities.removeClass(this.renderElement, "filterGroupHide")
}, setResultHintText: function setResultHintText(){}, _disposeTree: function _disposeTree(element) {
if (element) {
if (element.winControl && element.winControl.dispose) {
element.winControl.dispose()
}
if (element.children && element.children.length) {
for (var childIdx=0; childIdx < element.children.length; childIdx++) {
this._disposeTree(element.children[childIdx])
}
}
}
}, destroy: function destroy() {
if (!this._destroyed) {
this._destroyed = true;
this._disposeTree(this.container)
}
}, invalidate: function invalidate(filters){}, initialize: function initialize(){}
})})
})();
(function filtersInit() {
"use strict";
WinJS.Namespace.define("CommonJS.Filters", {ItemsFilterView: WinJS.Class.derive(CommonJS.Filters.FilterView, function itemsFilterView_ctor(element, options) {
CommonJS.Filters.FilterView.apply(this, arguments);
this.itemClass = "immersiveFilterItem";
this.initialize()
}, {singleSelect: {
get: function get() {
return this._singleSelect
}, set: function set(value) {
this._singleSelect = value
}
}})})
})();
(function filtersInit() {
"use strict";
WinJS.Namespace.define("CommonJS.Filters", {keyValueSummaryView: WinJS.Class.define(function keyValueSummaryView_ctor(element, options) {
WinJS.UI.setOptions(this, options);
this.container = element;
element.winControl = this;
this.button = this.initialize()
}, {
invalidate: function invalidate(data) {
this.keyctr.textContent = data.displayText;
this._setSummaryValue(data.filterStates);
this.button.setAttribute("groupkey", data.key)
}, setPressedState: function setPressedState(pressed) {
if (pressed) {
WinJS.Utilities.addClass(this._btnCtr, "filter-active")
}
else {
WinJS.Utilities.removeClass(this._btnCtr, "filter-active")
}
}, _setSummaryValue: function _setSummaryValue(filtersStates) {
var starSymbol="\ue082";
var isSymbolClass="isSymbol";
var textContent="";
var additionalTextContent="";
WinJS.Utilities.removeClass(this._additionalSelected, "hasContent");
if (filtersStates && filtersStates[0] && filtersStates[0].type === "Custom" && filtersStates[0].state) {
textContent = filtersStates[0].state.label || ""
}
else {
var numSelected=0;
var firstSelected=null;
for (var state in filtersStates) {
var filterState=filtersStates[state];
var singleFilterState=filterState.state;
for (var selection in singleFilterState) {
if (!firstSelected) {
firstSelected = singleFilterState[selection].displayText
}
numSelected++
}
}
if (numSelected === 0) {
textContent = PlatformJS.Services.resourceLoader.getString("/platform/FilterAll");
WinJS.Utilities.removeClass(this.valuectr, isSymbolClass)
}
else {
if (firstSelected.indexOf(starSymbol) !== -1) {
WinJS.Utilities.addClass(this.valuectr, isSymbolClass)
}
else {
WinJS.Utilities.removeClass(this.valuectr, isSymbolClass)
}
if (numSelected === 1) {
textContent = firstSelected
}
else {
textContent = firstSelected;
additionalTextContent = " +" + (numSelected - 1);
WinJS.Utilities.addClass(this._additionalSelected, "hasContent")
}
}
}
this.valuectr.textContent = textContent;
this._additionalSelected.textContent = additionalTextContent;
WinJS.Utilities.toggleClass(this.renderElement, "platformRefresh")
}, onClick: {
get: function get() {
return this._onClick
}, set: function set(value) {
this._onClick = value
}
}, initialize: function initialize() {
var keyctr=document.createElement("div");
WinJS.Utilities.addClass(keyctr, "immersiveDropDownFilterBarLabel");
var valuectr=document.createElement("div");
valuectr.className = "immersiveDropDownFilterSelection";
var colonCtr=document.createElement("div");
colonCtr.className = "immersiveDropDownFilterBarColon";
var additionalSelected=this._additionalSelected = document.createElement("div");
additionalSelected.className = "immersiveDropDownAdditionalSelected";
var caretctr=document.createElement("div");
caretctr.className = "immersiveDropDownFilterCaret";
var ctr=this.renderElement = document.createElement("div");
ctr.className = "immersiveDropDownFilterContainer ";
var buttonDiv=this._buttonDiv = CommonJS.Filters.Utilities.makeAccessibleContainer(this.onClick);
buttonDiv.className = "immersiveDropDownFilter immersiveFilterGroup";
buttonDiv.setAttribute("aria-haspopup", "true");
buttonDiv.appendChild(keyctr);
buttonDiv.appendChild(colonCtr);
buttonDiv.appendChild(valuectr);
buttonDiv.appendChild(additionalSelected);
buttonDiv.appendChild(caretctr);
ctr.appendChild(buttonDiv);
this._btnCtr = ctr;
this.keyctr = keyctr;
this.valuectr = valuectr;
this.container.appendChild(ctr);
return ctr
}, setSelectionView: function setSelectionView(view) {
if (view && view.drawerElement) {
var selectionID=view.drawerElement.getAttribute("id");
this._buttonDiv.setAttribute("aria-owns", selectionID)
}
}, hide: function hide() {
WinJS.Utilities.addClass(this.renderElement, "filterGroupHide")
}, show: function show() {
WinJS.Utilities.removeClass(this.renderElement, "filterGroupHide")
}, destroy: function destroy(){}, anchor: {get: function get() {
return this.renderElement
}}
})})
})();
(function filtersInit() {
"use strict";
WinJS.Namespace.define("CommonJS.Filters", {SliderFilterView: WinJS.Class.define(function sliderFilterView_ctor(element, options) {
WinJS.UI.setOptions(this, options);
this.container = element;
element.winControl = this;
this.initialize()
}, {
minValue: {
get: function get() {
return this._minValue
}, set: function set(value) {
this._minValue = value
}
}, maxValue: {
get: function get() {
return this._maxValue
}, set: function set(value) {
this._maxValue = value
}
}, invalidate: function invalidate(model) {
this._setValue(this.left, this.minValue);
this._setValue(this.right, this.maxValue)
}, _makeSliderSide: function _makeSliderSide(id, onChange) {
var div=document.createElement("div");
div.className = "sliderDiv";
var range=document.createElement("input");
range.setAttribute("id", id);
range.setAttribute("type", "range");
this._setValue(range, null, 0, 100);
range.addEventListener("change", onChange);
div.appendChild(range);
return {
div: div, control: range
}
}, _setValue: function _setValue(range, value, min, max) {
if (min) {
range.setAttribute("min", min)
}
if (max) {
range.setAttribute("max", max)
}
if (value) {
range.setAttribute("value", value)
}
}, onChange: function onChange(event) {
var leftval=this.left.valueAsNumber;
var rightval=this.right.valueAsNumber;
var range={
min: leftval, max: rightval
};
var item={key: this.key};
item.range = range;
this.onSelectionChanged({item: item});
return;
var testText=this.getValueText(50);
var testMap=this.ordinalToValue(50)
}, initialize: function initialize() {
var t=this;
var _leftChange=function(event) {
if (this.valueAsNumber <= document.getElementById("slider-right").valueAsNumber) {
this.value = document.getElementById("slider-right").valueAsNumber + 1
}
return t.onChange.call(t, event)
};
var _rightChange=function(event) {
if (this.valueAsNumber >= document.getElementById("slider-left").valueAsNumber) {
this.value = document.getElementById("slider-left").valueAsNumber - 1
}
document.getElementById("slider-right").parentNode.style.width = this.value + "px";
return t.onChange.call(t, event)
};
var ctr=document.createElement("div");
ctr.className = "sliderContainer";
var left=this._makeSliderSide("slider-left", _leftChange);
var right=this._makeSliderSide("slider-right", _rightChange);
ctr.appendChild(left.div);
ctr.appendChild(right.div);
this.left = left.control;
this.right = right.control;
this.container.appendChild(ctr)
}, displayTextRenderer: {
get: function get() {
return this._displayTextRenderer
}, set: function set(value) {
this._displayTextRenderer = value
}
}
})})
})();
(function filtersInit() {
"use strict";
WinJS.Namespace.define("CommonJS.Filters", {TextBoxFilterView: WinJS.Class.define(function toggleFilterView_ctor(element, options) {
WinJS.UI.setOptions(this, options);
this.element = element || document.createElement("div");
this.element.winControl = this;
this.searchbox = new WinJS.UI.SearchBox(null, {
searchHistoryDisabled: !!this.searchHistoryDisabled, placeholderText: this.placeholderText, focusOnKeyboardInput: true
});
var inputs=this.searchbox.element.getElementsByTagName("input");
this.searchboxInput = inputs && inputs[0] || null;
this._queryChangedBinding = this._queryChangedHandler.bind(this);
this._querySubmittedBinding = this._querySubmittedHandler.bind(this);
this._focusInBinding = this._focusInHandler.bind(this);
this.initialize()
}, {
element: null, searchbox: null, searchboxInput: null, updateOnQueryChanged: null, onSelectionChanged: null, searchHistoryDisabled: true, placeholderText: "", timeoutMillis: 500, _timeoutHandle: null, _queryChangedBinding: null, _querySubmittedBinding: null, _focusInBinding: null, _getQueryTextFromEvent: function _getQueryTextFromEvent(event) {
return (event && event.detail && (typeof event.detail.queryText === "string")) ? event.detail.queryText.trim() : null
}, _queryHandlerHelper: function _queryHandlerHelper(queryText) {
if (this._timeoutHandle) {
clearTimeout(this._timeoutHandle);
this._timeoutHandle = null
}
if (queryText !== null) {
var that=this;
this._timeoutHandle = setTimeout(function queryHandlerHelperTimeout() {
if (that.onSelectionChanged) {
that.onSelectionChanged(queryText)
}
that._timeoutHandle = null
}, this.timeoutMillis)
}
}, _focusInHandler: function _focusInHandler(event) {
var fgScroller=document.querySelector(".immersiveFilterGroupsScroller");
if (!fgScroller) {
return
}
var offset=this.element.getOffset();
var scrollLeft=fgScroller.scrollLeft;
var fgScrollerWidth=fgScroller.offsetWidth;
if (fgScrollerWidth < fgScroller.scrollWidth) {
var rightEdge=offset + this.element.offsetWidth;
if (rightEdge > fgScrollerWidth + scrollLeft) {
fgScroller.scrollLeft = rightEdge - fgScrollerWidth
}
else if (offset - fgScroller.getOffset() < scrollLeft) {
fgScroller.scrollLeft = offset
}
}
}, _queryChangedHandler: function _queryChangedHandler(event) {
var queryText=this._getQueryTextFromEvent(event);
if (!this.updateOnQueryChanged) {
return
}
;
this._queryHandlerHelper(queryText)
}, _querySubmittedHandler: function _querySubmittedHandler(event) {
this._queryHandlerHelper(this._getQueryTextFromEvent(event))
}, invalidate: function invalidate(model) {
if (!model.filterData) {
return
}
;
var filterData=model.filterData;
var data=null;
if (!this.searchbox.queryText) {
for (var key in filterData) {
data = filterData[key];
if (data.isSelected && typeof data.key === "string") {
this.searchbox.queryText = data.key;
return
}
}
;
}
;
if (filterData && filterData[0] && filterData[0].key === "") {
this.searchbox.queryText = ""
}
}, initialize: function initialize() {
WinJS.Utilities.addClass(this.element, "textBoxFilterContainer cux-searchtextbox");
this.element.appendChild(this.searchbox.element);
this.searchbox.addEventListener("querychanged", this._queryChangedBinding);
this.searchbox.addEventListener("querysubmitted", this._querySubmittedBinding);
this.searchbox.element.addEventListener("focusin", this._focusInBinding)
}, dispose: function dispose() {
if (!this._disposed) {
this._disposed = true;
if (!this.searchbox) {
return
}
if (this._queryChangedBinding) {
this.searchbox.removeEventListener("querychanged", this._queryChangedBinding)
}
if (this._querySubmittedBinding) {
this.searchbox.removeEventListener("querysubmitted", this._querySubmittedBinding)
}
if (this._focusInBinding) {
this.searchbox.element.removeEventListener("focusin", this._focusInBinding)
}
if (this._timeoutHandle) {
clearTimeout(this._timeoutHandle);
this._timeoutHandle = null
}
}
}
})})
})();
(function filtersInit() {
"use strict";
WinJS.Namespace.define("CommonJS.Filters", {ToggleFilterView: WinJS.Class.derive(CommonJS.Filters.FilterView, function toggleFilterView_ctor(element, options) {
CommonJS.Filters.FilterView.apply(this, arguments);
this.itemClass = "immersiveToggleItem";
this.initialize()
}, {
onSelectionChanged: {
get: function get() {
return this._onSelectionChanged
}, set: function set(value) {
this._onSelectionChanged = value
}
}, _makeItem: function(item) {
var that=this;
var filterSelected="filter-selected";
var accessibleCtr=CommonJS.Filters.Utilities.makeAccessibleContainer(function toggleFilterView_accessibleCtrFunc(event) {
if (WinJS.Utilities.hasClass(event.currentTarget, filterSelected) === false) {
that._onItemSelected.call(that, event.currentTarget)
}
event.preventDefault()
});
accessibleCtr.innerHTML = item.displayText;
accessibleCtr.setAttribute("key", item.index);
this.itemsList.appendChild(accessibleCtr);
var className=this.itemClass;
if (item.isSelected) {
className += " " + filterSelected
}
WinJS.Utilities.addClass(accessibleCtr, className);
CommonJS.Filters.Utilities.makeKBNavigable(accessibleCtr)
}, invalidate: function invalidate(model) {
this.itemsList.innerHTML = "";
this.itemsList.setAttribute("aria-label", model.displayText);
var items=model.filterData;
this.cachedItems = items;
for (var key in items) {
this._makeItem(items[key])
}
this.itemsList.setAttribute("groupkey", model.key)
}, initialize: function initialize() {
var itemsList=this.itemsList = document.createElement("ul");
itemsList.className = this.itemClass + "Container";
this.container.appendChild(itemsList)
}
})})
})();
(function filtersInit() {
"use strict";
WinJS.Namespace.define("CommonJS.Filters", {Utilities: WinJS.Class.define(function utilities_ctor(element, options){}, {}, {
makeAccessibleContainer: function utilities_makeAccessibleContainerHandler(onClick) {
var ctr=document.createElement("div");
ctr.setAttribute("tabIndex", 0);
if (onClick) {
ctr.addEventListener("mouseup", function utilities_onMouseUpContainer(event) {
if (event.button === 0) {
onClick(event)
}
});
ctr.addEventListener("keyup", function utilities_onKeyUpContainer(event) {
if (event.keyCode === 13 || event.keyCode === 32) {
onClick(event)
}
})
}
return ctr
}, makeKBNavigable: function makeKBNavigable(element) {
element.addEventListener("keyup", function utilities_onKeyUpElement(event) {
var left=event.keyCode === 37;
var right=event.keyCode === 39;
var elemToFocus=null;
if (left) {
elemToFocus = element.previousSibling
}
else if (right) {
elemToFocus = element.nextSibling
}
if (elemToFocus) {
elemToFocus.focus()
}
})
}, areStatesEqual: function areStatesEqual(a, b) {
return CommonJS.Filters.Utilities.makeHash(a) === CommonJS.Filters.Utilities.makeHash(b)
}, makeHash: function makeHash(obj, rcount) {
if (!obj) {
return obj
}
var hash=[];
for (var key in obj) {
var val=obj[key];
if (val && typeof val === "object" && (rcount ? rcount < 5 : true) && !val.push) {
hash.push(CommonJS.Filters.Utilities.makeHash(val), rcount ? ++rcount : 1)
}
else if (val && val.push && val.length > 0) {
for (var i=0, l=val.length; i < l; i++) {
hash.push(CommonJS.Filters.Utilities.makeHash(val), rcount)
}
}
else {
hash.push(key + ":" + val + ",")
}
}
return hash.join()
}
})})
})()