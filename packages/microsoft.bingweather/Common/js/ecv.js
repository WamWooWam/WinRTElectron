/*  © Microsoft. All rights reserved. */
WinJS.Namespace.define('CommonJS', {Version: 'latest'});
(function appexCommonControlsECErrorControlInit() {
"use strict";
WinJS.Namespace.define("CommonJS", {GenericErrorControl: WinJS.Class.derive(CommonJS.ErrorControl, function genericErrorControl_ctor(element, options) {
var that=this;
var onErrorClick=function(args) {
that.actionCallback.call(that, args)
};
var baseOptions={};
baseOptions.type = CommonJS.Error.STANDARD_ERROR;
baseOptions.callback = onErrorClick;
CommonJS.ErrorControl.apply(this, [element, baseOptions]);
WinJS.UI.setOptions(this, options)
}, {
actionCallback: {
get: function get() {
return this._actionCallback || function _errorControl_25(){}
}, set: function set(value) {
this._actionCallback = value
}
}, title: {set: function set(value) {
this._title.innerText = value;
this.element.setAttribute("aria-label", this._title.innerText)
}}, buttonText: {set: function set(value) {
this._button.innerText = value;
this._button.setAttribute("aria-label", this._button.innerText)
}}, description: {set: function set(value) {
this._description.innerText = value
}}, icon: {set: function set(value) {
this._icon.className = this._icon.className.replace("iconError", "");
this._icon.innerText = value
}}, show: function show() {
CommonJS.Error.showError(CommonJS.Error.STANDARD_ERROR, this.actionCallback, this)
}
})})
})();
(function _Viewbase_7() {
"use strict";
WinJS.Namespace.define("CommonJS.EntityCollection", {Viewbase: WinJS.Class.define(function viewbase_ctor(options) {
WinJS.UI.setOptions(this, options);
this.storedAnimations = {}
}, {
controller: null, Type: {
get: function get() {
return this._type
}, set: function set(value) {
this._type = value
}
}, getSelectedItems: function getSelectedItems() {
throw"Not Implemented";
}, onNavigateAway: function onNavigateAway(){}, setCurrentSort: function setCurrentSort(sortidentifier){}, getScrollPosition: function getScrollPosition() {
return this.view.scrollPosition
}, setScrollPosition: function setScrollPosition(position) {
this.view.scrollPosition = position
}, getItemById: function getItemById(id) {
var item=this.view.elementFromIndex(id);
return item
}, cancelLayout: function cancelLayout(){}, updateLayout: function updateLayout(){}, _selectionChanging: function _selectionChanging(eventargs) {
var aboutToBeSelected=[];
var that=this;
var g=this.view;
eventargs.detail.newSelection.getItems().then(function viewbase_newSelectionGetItemsComplete(items) {
for (var i=0, len=items.length; i < len; i++) {
var item=items[i];
var data=item.data;
data.uniqueID = item.index;
aboutToBeSelected.push(data)
}
if (that.controller.selectionChanging) {
eventargs.cancel = that.controller.selectionChanging(aboutToBeSelected)
}
})
}, _selectionChanged: function _selectionChanged(eventargs) {
var g=this.view;
var that=this;
g.selection.getItems().then(function viewbase_selectionGetItemsComplete(selectedItems) {
var selectedDataItems=[];
for (var i=0, len=selectedItems.length; i < len; i++) {
var item=selectedItems[i];
var data=item.data;
data.uniqueID = item.index;
selectedDataItems.push(data)
}
if (that.controller.selectionChanged) {
that.controller.selectionChanged(selectedDataItems)
}
})
}, _onKeydown: function _onKeydown(eventargs) {
if (this.controller && this.controller.onKeydown) {
this.controller.onKeydown(eventargs)
}
}, invalidate: function invalidate() {
this.dataset = null
}
})})
})();
(function appexCommonControlsECGridInit() {
"use strict";
WinJS.Namespace.define("CommonJS.EntityCollection", {Grid: WinJS.Class.derive(CommonJS.EntityCollection.Viewbase, function grid_ctor(options, controller) {
CommonJS.EntityCollection.Viewbase.call(this, options);
this.options = options;
this.controller = controller;
this.Type = CommonJS.EntityCollection.Views.Grid
}, {
_moduleClickHandler: null, Initialize: function Initialize() {
var sa=function(element, key, value) {
element.setAttribute(key, value)
};
var element=document.querySelector("#viewspace");
element.innerHTML = "";
var ecv=document.querySelector(".ecv");
WinJS.Utilities.addClass(ecv, "gridview");
var sz=this._SeZoElement = document.createElement("div");
sa(sz, "id", "semanticZoom");
sa(sz, "class", "landingPage");
sz.setAttribute("aria-labelledby", "filterBar_title");
var zi=document.createElement("div");
sa(zi, "id", "ZoomedIn");
sa(zi, "class", "landinglist");
zi.setAttribute("aria-labelledby", "filterBar_title");
var zo=document.createElement("div");
sa(zo, "id", "ZoomedOut");
zo.setAttribute("aria-labelledby", "filterBar_title");
sz.appendChild(zi);
sz.appendChild(zo);
element.appendChild(sz);
var itemSelectionMode=this.options.itemSelectionMode || "none";
var zoomedIn=new CommonJS.UI.ResponsiveListView(zi, {
selectionMode: itemSelectionMode, minCellHeight: this.options.minCellHeight, maxCellHeight: this.options.maxCellHeight, minCellWidth: this.options.minCellWidth
});
var zoomedOut=new WinJS.UI.ListView(zo, {
selectionMode: "none", crossSlide: "none"
});
var semanticZoom=this._SeZo = new WinJS.UI.SemanticZoom(sz);
this._onSemanticZoom = function(e) {
if (e && e.detail) {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "", "", "zoomout", PlatformJS.Utilities.getLastClickUserActionMethod(), 0)
}
};
this._SeZo.addEventListener("zoomchanged", this._onSemanticZoom, false);
semanticZoom._locked = true;
var that=this;
var g=document.querySelector("#ZoomedIn");
if (g) {
var grid=g.winControl;
this.grid = this.view = grid;
WinJS.UI.setOptions(grid, this.options);
this._onWheel = function(event) {
if (event.deltaY !== 0) {
grid._viewport.scrollLeft += event.deltaY
}
};
grid._viewport.addEventListener("wheel", this._onWheel, false);
if (itemSelectionMode !== "none") {
this._onSelectionChangingHandler = function(a) {
that._selectionChanging.apply(that, arguments)
};
this.grid.addEventListener("selectionchanging", this._onSelectionChangingHandler);
this._onSelectionChangedHandler = function(a) {
that._selectionChanged.apply(that, arguments)
};
this.grid.addEventListener("selectionchanged", this._onSelectionChangedHandler)
}
if (this.options.enableKeydownHandler) {
this._onKeydownHandler = function(event) {
that._onKeydown.apply(that, arguments)
};
this.grid.addEventListener("keydown", this._onKeydownHandler)
}
}
return WinJS.Promise.wrap(null)
}, getScrollPosition: function getScrollPosition() {
return document.querySelector("#ZoomedIn").winControl.scrollPosition
}, setScrollPosition: function setScrollPosition(position) {
var grid=document.querySelector("#ZoomedIn");
if (grid) {
var gridControl=grid.winControl;
gridControl.scrollPosition = position
}
}, empty: function empty(controller) {
this._renderFirstTime([], controller)
}, onNavigateAway: function onNavigateAway() {
this.view = null;
this.grid = null;
if (this.groupedData) {
this.groupedData.dispose()
}
this.groupedData = null;
this.dataset = null;
this.controller = null;
this._SeZoElement = null;
if (this._SeZo) {
this._SeZo.removeEventListener("zoomchanged", this._onSemanticZoom);
this._onSemanticZoom = null
}
this._SeZo = null;
this.existingState = null;
this.options = null;
var grid=document.querySelector("#ZoomedIn");
if (grid) {
var g=grid.winControl;
g._element.removeEventListener("loadingstatechanged", this._onLoadingStateChangedHandler);
this._onLoadingStateChangedHandler = null;
g._viewport.removeEventListener("wheel", this._onWheel);
g.removeEventListener("selectionchanging", this._onSelectionChangingHandler);
this._onSelectionChangingHandler = null;
g.removeEventListener("selectionchanged", this._onSelectionChangedHandler);
this._onSelectionChangedHandler = null;
if (this._moduleClickHandler) {
g.removeEventListener("iteminvoked", this._moduleClickHandler);
this._moduleClickHandler = null
}
g.removeEventListener("keydown", this._onKeydownHandler);
this._onKeydownHandler = null;
g.itemDataSource = null;
g.groupDataSource = null;
g.itemTemplate = null;
g.groupHeaderTemplate = null;
g.oniteminvoked = null
}
var grid2=document.querySelector("#ZoomedOut");
if (grid2) {
var g2=grid2.winControl;
g2.itemDataSource = null;
g2.itemTemplate = null
}
if (g.dispose) {
g.dispose()
}
if (g2.dispose) {
g2.dispose()
}
WinJS.UI._disposeControls();
this._empty(document.querySelector("#semanticZoom"))
}, render: function render(entities, controller, isUpdate) {
if (this.dataset && isUpdate) {
this._renderSubsequent(entities, controller)
}
else {
this._renderFirstTime(entities, controller)
}
}, getSelectedItems: function getSelectedItems() {
return this.grid.selection
}, clearSelection: function clearSelection() {
this.grid.selection.clear();
this.controller.selectionChanged([])
}, _renderFirstTime: function _renderFirstTime(entities, controller) {
var pageData=entities;
var ds=this.dataset = new WinJS.Binding.List(pageData);
var charPostfix="A";
var groupSort=null;
var groupLength=0;
if (controller.collection && controller.collection.Groups && controller.collection.Groups.length) {
groupLength = controller.collection.Groups.length + 2;
groupSort = {};
groupSort[charPostfix] = controller.collection.Groups.length + 1;
controller.collection.Groups.forEach(function grid_foreachGroup(value, index) {
groupSort[value.identifier + charPostfix] = index + 1
})
}
var grouped=this.groupedData = ds.createGrouped(function _Grid_229(item) {
if (item) {
return item.group + charPostfix
}
return charPostfix
}, function _Grid_235(item) {
return item
}, function _Grid_238(l, r) {
if (groupSort && groupLength) {
var keyl=groupSort[l] || groupLength;
var keyr=groupSort[r] || groupLength;
return keyl < keyr ? -1 : keyl === keyr ? 0 : 1
}
else {
return l < r ? -1 : l === r ? 0 : 1
}
});
var groups=grouped.groups;
var semanticDataSource=grouped.dataSource;
var groupDataSource=groups.dataSource;
var itemRendererPromise=WinJS.Promise.as(controller.UIConfig.GetEntityTemplate(this.Type));
var headerRenderer=controller.UIConfig.GetHeaderTemplate(this.Type);
var listRenderer=controller.UIConfig.GetListRendererTemplate(this.Type);
var semanticEntity=controller.UIConfig.GetSemanticZoomEntityTemplate(this.Type);
var that=this;
var sz=this._SeZoElement;
var cGrid=document.querySelector("#ZoomedIn");
if (cGrid) {
var ctl=cGrid.winControl;
this._onLoadingStateChangedHandler = function() {
switch (ctl._loadingState) {
case"viewPortLoaded":
if (that.isQueryComplete && that.onViewPortRenderComplete) {
that.onViewPortRenderComplete();
that.onViewPortRenderComplete = null
}
break;
case"complete":
if (that.isQueryComplete && that.onRenderComplete) {
that.onRenderComplete();
if (!that.options.disableSemanticZoom) {
that._SeZo._locked = false;
WinJS.Utilities.removeClass(sz, "semanticzoom-disabled")
}
else if (that.options.disableSemanticZoom) {
WinJS.Utilities.addClass(sz, "semanticzoom-disabled")
}
that.onRenderComplete = null;
ctl._element.removeEventListener("loadingstatechanged", that._onLoadingStateChangedHandler)
}
break
}
;
};
var ecvRenderItem=function(promise) {
return itemRendererPromise.then(function _Grid_288(itemRenderer) {
return promise.then(function _Grid_289(result) {
var div=document.createElement("div");
var data=result.data;
if (controller.UIConfig.bindItem) {
WinJS.Utilities.setInnerHTMLUnsafe(div, itemRenderer.innerHTML);
controller.UIConfig.bindItem(div, data);
return WinJS.Promise.wrap(div)
}
else {
var t=new WinJS.Binding.Template(itemRenderer);
return t.render(data, div)
}
})
})
};
ctl._element.addEventListener("loadingstatechanged", this._onLoadingStateChangedHandler);
if (this._moduleClickHandler) {
ctl.removeEventListener("iteminvoked", this._moduleClickHandler)
}
this._moduleClickHandler = controller.onModuleClick.bind(controller);
ctl.addEventListener("iteminvoked", this._moduleClickHandler);
WinJS.UI.setOptions(ctl, {
groupHeaderTemplate: function groupHeaderTemplate(promise) {
return promise.then(function _renderFirstTime_groupHeaderTemplate_promiseComplete(result) {
var div=document.createElement("div");
var t=new WinJS.Binding.Template(headerRenderer);
var data=result.data;
return t.render(data, div)
})
}, groupDataSource: groupDataSource, itemTemplate: ecvRenderItem, itemDataSource: semanticDataSource
})
}
;
var s=document.querySelector("#ZoomedOut");
if (s) {
var semantic=s.winControl;
WinJS.UI.setOptions(semantic, {
itemTemplate: function itemTemplate(promise) {
return promise.then(function _renderFirstTime_itemTemplate_promiseComplete(result) {
var div=document.createElement("div");
var t=new WinJS.Binding.Template(semanticEntity);
var data=result.data;
return t.render(data, div)
})
}, itemDataSource: groupDataSource
})
}
}, _renderSubsequent: function _renderSubsequent(entities, controller) {
var grid=document.querySelector("#ZoomedIn");
if (grid) {
var gridControl=grid.winControl;
gridControl.itemDataSource.beginEdits();
var list=gridControl.itemDataSource.list;
var newLength=entities.length;
var oldLength=list.length;
if (oldLength > newLength) {
list.splice(newLength, oldLength - newLength)
}
else if (oldLength < newLength) {
var added=entities.slice(oldLength);
list.push.apply(list, added)
}
for (var i=0; i < newLength; i++) {
list.setAt(i, entities[i])
}
gridControl.itemDataSource.endEdits()
}
}, _empty: function _empty(node) {
if (node) {
while (node.children.length > 0) {
this._empty(node.children[0])
}
node.parentNode.removeChild(node)
}
}
})})
})();
(function _List_6() {
"use strict";
WinJS.Namespace.define("CommonJS.EntityCollection", {List: WinJS.Class.derive(CommonJS.EntityCollection.Viewbase, function list_ctor(options, controller) {
CommonJS.EntityCollection.Viewbase.call(this, options);
WinJS.UI.setOptions(this, options);
this.Type = CommonJS.EntityCollection.Views.List;
this.container = document.querySelector("#viewspace");
this.controller = controller;
this.options = options;
this.groupPosition = CommonJS.Table.GroupPosition;
this._existingState = options.existingState
}, {
container: null, options: null, groupPosition: null, _exisitingState: null, dataset: null, _loadingPromise: null, _currentHeaderSort: null, _existingState: null, _table: null, _hasRendered: false, view: null, totalItems: null, Initialize: function Initialize(options) {
var that=this;
msWriteProfilerMark("Ecv:List:initalize:s");
this.container.innerHTML = "";
this.dataset = null;
var lvDiv=document.createElement("div");
lvDiv.setAttribute("class", "list-table");
var ecv=document.querySelector(".ecv");
WinJS.Utilities.addClass(ecv, "listview");
var me=function(element, className, id) {
var ctr=document.createElement(element);
if (className) {
ctr.setAttribute("class", className)
}
if (id) {
ctr.setAttribute("id", id)
}
return ctr
};
var sz=me("div", "listviewsemanticZoom", "semanticZoom");
sz.setAttribute("aria-labelledby", "filterBar_title");
var zi=me("div", "listview zoomedin", "ZoomedIn");
zi.setAttribute("aria-labelledby", "filterBar_title");
var zo=me("div", "listview zoomedout", "ZoomedOut");
zo.setAttribute("aria-labelledby", "filterBar_title");
sz.appendChild(zi);
sz.appendChild(zo);
this.container.appendChild(sz);
var zoomedOut=new WinJS.UI.ListView(zo, {
selectionMode: "none", crossSlide: "none"
});
var lvOptions={
layout: {
type: WinJS.UI.ListLayout, groupHeaderPosition: "left"
}, selectionMode: "none", tapBehavior: this.options.disableTap ? "none" : "invokeOnly", swipeBehavior: "none"
};
var path=(options && options.templatePath) ? options.templatePath : "/common/Table/html/tableTemplates.html";
msWriteProfilerMark("Ecv:List:loadTemplates:s");
this._loadingPromise = this._loadTemplates(path).then(function _List_82() {
msWriteProfilerMark("Ecv:List:loadTemplates:e");
that._table = that.view = new CommonJS.Table.Table(zi, null);
WinJS.UI.setOptions(that._table, that.options);
that._table.initialize();
that._table.addEventListener("selectionchanging", function list_onSelectionChanging(a, b, c) {
that._selectionChanging.apply(that, arguments)
});
that._table.addEventListener("selectionchanged", function list_onSelectionChanged(a, b, c) {
that._selectionChanged.apply(that, arguments)
});
var semanticZoom=new WinJS.UI.SemanticZoom(sz);
that._table.onViewPortRenderComplete = function() {
if (that.onViewPortRenderComplete) {
that.onViewPortRenderComplete();
that.onViewPortRenderComplete = null
}
},
that._table.onRenderComplete = function() {
msWriteProfilerMark("Ecv:Table:onRenderComplete");
if (that.onRenderComplete) {
that.onRenderComplete();
if (that.options && !that.options.disableSemanticZoom) {
semanticZoom._locked = false;
WinJS.Utilities.removeClass(sz, "semanticzoom-disabled")
}
else if (that.options && that.options.disableSemanticZoom) {
WinJS.Utilities.addClass(sz, "semanticzoom-disabled")
}
}
};
semanticZoom._locked = true;
msWriteProfilerMark("Ecv:List:initalize:e")
});
return this._loadingPromise
}, onItemRendered: function onItemRendered(item){}, setCurrentSort: function setCurrentSort(sort) {
this._selectedSort = sort
}, empty: function empty(controller) {
this.dataset = null;
if (this._hasRendered) {
this._render([], controller)
}
}, render: function render(entities, controller, isUpdate) {
var that=this;
that._hasRendered = true;
that._loadingPromise.then(function list_renderLoadingPromiseComplete() {
msWriteProfilerMark("Ecv:List:render:s");
that._setIndex(entities);
var tableDefinition=controller.UIConfig.GetTableDefinition(entities);
that._supplementTableDef(tableDefinition);
that.view.tableDefinition = tableDefinition;
if (that._selectedSort) {
that._table.setSelectedSort(that._selectedSort)
}
that.totalItems = entities.length;
var lastGroup=null;
var renderGroup=false;
that._render(entities, controller);
msWriteProfilerMark("Ecv:List:render:e")
})
}, onNavigateAway: function onNavigateAway() {
var that=this;
if (that && that.onLoadingChanged && that._table && that._table._element) {
that._table._element.removeEventListener("loadingstatechanged", that.onLoadingChanged)
}
if (that._table) {
that._table.destroy()
}
}, cancelLayout: function cancelLayout() {
if (this._table) {
this._table.cancelLayout()
}
}, clearSelection: function clearSelection(items) {
this.view.selection.clear()
}, getScrollPosition: function getScrollPosition() {
if (this._table && this._table.viewport) {
return this._table.viewport.scrollTop
}
return 0
}, setScrollPosition: function setScrollPosition(position) {
this._table.setScrollPosition(position)
}, _loadTemplates: function _loadTemplates(path) {
var host=this.container;
return WinJS.UI.Fragments.renderCopy(path, host).then(function list_loadTemplatesRenderCopyComplete() {
return WinJS.UI.processAll(host)
})
}, _supplementTableDef: function _supplementTableDef(def) {
def.onColumnHeaderClick = this.controller.onColHeaderClick.bind(this.controller);
def.onRowClicked = this.controller.onModuleClick.bind(this.controller);
def.existingState = this._existingState
}, _onHeaderClick: function _onHeaderClick(e) {
var desc="desc";
var asc="asc";
if (!this._currentHeaderSort) {
this._currentHeaderSort = {
col: e.currentTarget.getAttribute("column"), dir: desc
}
}
else {
var dir=this._currentHeaderSort.dir;
this._currentHeaderSort.dir = (dir === desc) ? asc : desc
}
}, _setIndex: function _setIndex(entities) {
for (var i=0, l=entities.length; i < l; i++) {
entities[i].index = i
}
}, _render: function _render(entities, controller) {
if (false && this.dataset) {
this._renderSubsequent(entities, controller)
}
else {
this._renderFirstTime(entities, controller)
}
}, _renderFirstTime: function _renderFirstTime(entities, controller) {
msWriteProfilerMark("Ecv:List:_renderFirstTime:s");
console.log("render called for " + entities.length + " entities");
var ds=new WinJS.Binding.List(entities);
var grouped=ds.createGrouped(function list_getGroupLabel(item) {
if (item) {
return item.group + "A"
}
return "A"
}, function list_getGroupItem(item) {
return item
}, function list_compareGroup(a, b) {
return 0
});
var groups=grouped.groups;
var semanticDataSource=grouped.dataSource;
var groupDataSource=groups.dataSource;
var itemRenderer=controller.UIConfig.GetEntityTemplate(this.Type);
var headerRenderer=controller.UIConfig.GetHeaderTemplate(this.Type);
var listRenderer=controller.UIConfig.GetListRendererTemplate(this.Type);
var semanticEntity=controller.UIConfig.GetSemanticZoomEntityTemplate(this.Type);
var s=document.querySelector("#ZoomedOut");
if (s) {
var semantic=s.winControl;
WinJS.UI.setOptions(semantic, {
itemTemplate: semanticEntity, itemDataSource: groupDataSource
})
}
msWriteProfilerMark("Ecv:List:_renderFirstTime:setDataSource");
this._table.dataSource = semanticDataSource;
msWriteProfilerMark("Ecv:List:_renderFirstTime:e")
}
})})
})();
(function appexCommonControlsECControllerInit() {
"use strict";
WinJS.Namespace.define("CommonJS.EntityCollection", {Controller: WinJS.Class.mix(WinJS.Class.define(function controller_ctor(options) {
var that=this;
this.currentView = {};
this._views = [];
this._appliedFilters = [];
if (options && options._value) {
options = options._value
}
if (!options || !options.key) {
throw"Class and Key must be defined in your appmanifest.xml. see controller.js for example";
}
this._options = JSON.parse(JSON.stringify(options));
var header=this._filterBar = document.querySelector("#filterBar").winControl;
this._customErrorHost = document.querySelector(".ecv");
header.initFilterBar(document.querySelector("#filtersDisplayedStyle"));
var cf=document.querySelector("#clearFilters");
cf.winControl.label = PlatformJS.Services.resourceLoader.getString("/platform/clearFiltersLabel");
cf.addEventListener("click", this._onClearFiltersClick.bind(this));
var da=document.querySelector("#dataAttribution");
da.winControl.label = PlatformJS.Services.resourceLoader.getString("/platform/aboutLabel");
da.addEventListener("click", this._onDataAttributionClick.bind(this));
if (options.appliedFilters) {
this._appliedFilters = this._processFilterGroups(options.appliedFilters);
if (this._appliedFilters.length === 0) {
this._appliedFilters = null
}
}
if (options.selectedSort) {
this._selectedSort = options.selectedSort;
if (options.sortDirection) {
this._sortDirection = options.sortDirection
}
}
this._collection = PlatformJS.Utilities.createObject(options.class, options.key);
this._collection.invalidateView = this.invalidate.bind(this);
this._collection.queryCancel = function controller_queryCancel() {
that.queryCancel()
};
if (this._collection.impressionContext) {
this.getPageImpressionContext = function() {
return that._collection.impressionContext
}
}
else if (this._collection.getPageImpressionContext && typeof this._collection.getPageImpressionContext === "function") {
this.getPageImpressionContext = function() {
return that._collection.getPageImpressionContext(that.options.state)
}
}
var appbarElement=this._appbarElement = document.querySelector(".entityappbar");
if (appbarElement) {
var toggleCF_bound=this._toggleCF_bound = this._toggleCF.bind(this);
appbarElement.addEventListener("afterhide", toggleCF_bound, false);
appbarElement.addEventListener("beforeshow", toggleCF_bound, false)
}
Object.defineProperties(this, WinJS.Utilities.createEventProperties(CommonJS.EntityCollection.Controller.QUERY_ERROR_EVENT))
}, {
options: {get: function get() {
return this._options
}}, collection: {get: function get() {
return this._collection
}}, currentView: null, UIConfig: null, currentSort: {
get: function get() {
return this._currentSort
}, set: function set(v) {
this._currentSort = v;
this._refresh(true)
}
}, appliedFilters: {
get: function get() {
return this._appliedFilters
}, set: function set(v) {
this._appliedFilters = v;
this._refresh(true)
}
}, filters: {
get: function get() {
return this._filters
}, set: function set(value) {
if (value) {
this._filters = value
}
if (this._filters) {
this._populateFilters(this._filters)
}
}
}, Sort: {
get: function get() {
return this._sort
}, set: function set(value) {
if (value && value.length > 0) {
this._sort = value
}
if (this._sort) {
this._sort = value;
this._selectedSort = null;
for (var i=0; i < value.length; i++) {
if (value[i].selected) {
this._selectedSort = value[i].identifier;
this._options.selectedSort = this._selectedSort;
if (this.currentView) {
this.currentView.setCurrentSort(this._selectedSort)
}
}
}
this._populateSort(this._sort)
}
}
}, _dataConfig: null, _sort: null, _filters: null, _currentSort: null, _views: null, _appliedFilters: null, _isFullRefresh: true, _abandonSession: false, _filterBar: null, _selectedSort: null, _options: null, _collection: null, _customErrorHost: null, _appBarShowing: false, _sortDirection: null, _onModuleClickInvoked: false, _timer: null, _queryUIDelay: null, _queryPromise: null, _viewInitializePromise: null, _initializePromise: null, _locPrefix: null, _appbarElement: null, _toggleCF_bound: null, invalidate: function invalidate() {
this._refresh(true)
}, onResuming: function onResuming(event) {
this._abandonSession = false
}, queryCancel: function queryCancel() {
if (this._queryPromise) {
this._queryPromise.cancel();
this._queryPromise = null
}
}, dispose: function dispose() {
this.queryCancel();
this._listeners = null;
var appBarElement=this._appbarElement;
if (appBarElement) {
this._appbarElement = null;
var toggleCF_bound=this._toggleCF_bound;
this._toggleCF_bound = null;
appBarElement.removeEventListener("afterhide", toggleCF_bound, false);
appBarElement.removeEventListener("beforeshow", toggleCF_bound, false);
var appBarControl=appBarElement.winControl;
if (appBarControl) {
appBarControl.disabled = true;
if (appBarControl.dispose) {
appBarControl.dispose()
}
}
}
var selectionAppBar=document.getElementById("selectionAppBar");
if (selectionAppBar) {
var selectionAppBarControl=selectionAppBar.wincontrol;
if (selectionAppBarControl && selectionAppBarControl.dispose) {
selectionAppBarControl.dispose()
}
}
var edgySort=this.edgySortControl;
if (edgySort) {
this.edgySortControl = null;
edgySort.dispose()
}
if (this._filterBar) {
if (this._filterBar.dispose) {
this._filterBar.dispose()
}
this._filterBar = null
}
this._collection = null;
this._options = null;
this._views = null;
this._appliedFilters = null;
this._customErrorHost = null
}, onNavigateAway: function onNavigateAway() {
this._abandonSession = true;
if (this._timer) {
clearTimeout(this._timer)
}
if (this._queryUIDelay) {
msClearImmediate(this._queryUIDelay);
this._queryUIDelay = null
}
this.queryCancel();
if (this._initializePromise) {
this._initializePromise.cancel();
this._initializePromise = null
}
if (this._viewInitializePromise) {
this._viewInitializePromise.cancel();
_viewInitializePromise = null
}
var currentView=this.currentView;
if (currentView) {
this.currentView = null;
if (currentView.onNavigateAway) {
currentView.onNavigateAway()
}
}
var thisUIConfig=this.UIConfig;
if (thisUIConfig) {
this.UIConfig = null;
if (thisUIConfig.onNavigateAway) {
thisUIConfig.onNavigateAway()
}
}
CommonJS.Progress.resetAll();
this._collection.ClearEntities();
this.dispose()
}, selectionChanging: function selectionChanging(changingItems) {
if (this.UIConfig.onSelectionChanging) {
return this.UIConfig.onSelectionChanging(changingItems, this)
}
else {
return null
}
}, selectionChanged: function selectionChanged(changedItems) {
if (!changedItems || changedItems.length === 0) {
this.hideBottomAppBar()
}
else if (!this.isBottomAppBarShowing()) {
this.showBottomAppBar()
}
this.UIConfig.onSelectionChanged(changedItems, this)
}, onKeydown: function onKeydown(eventargs) {
if (this.UIConfig && this.UIConfig.onKeydown) {
this.UIConfig.onKeydown(this, eventargs)
}
}, hideBottomAppBar: function hideBottomAppBar() {
var bottom=document.getElementById("selectionAppBar");
if (bottom) {
this._appBarShowing = false;
try {
bottom.winControl.hide();
bottom.style.display = "none";
this._showDefaultAppBar()
}
catch(e) {
console.error("appbar hiding error: " + e)
}
}
}, isBottomAppBarShowing: function isBottomAppBarShowing() {
return this._appBarShowing
}, showBottomAppBar: function showBottomAppBar() {
var bottom=document.getElementById("selectionAppBar");
if (bottom) {
this._appBarShowing = true;
try {
bottom.style.display = "block";
this._appbarElement.style.display = "none";
bottom.winControl.show()
}
catch(e) {
console.error("appbar showing error: " + e)
}
}
}, getPageState: function getPageState() {
try {
if (this.currentView) {
this._options.scrollPosition = this.currentView.getScrollPosition()
}
}
catch(e) {}
return this._options
}, getPageData: function getPageData() {
var that=this;
var p=new WinJS.Promise(function controller_getPageDataPromiseInit(complete) {
var pageData={};
var title=that._options.title;
var locString=CommonJS.resourceTester.tryGetString(title);
if (locString.hasValue) {
title = locString.value
}
pageData.title = title;
complete(pageData)
});
that._initialize(that._collection);
return p
}, getSearchBoxData: function getSearchBoxData() {
if (this._collection.isSearchBoxEnabled) {
return new WinJS.Promise.wrap(this._collection.searchBoxData)
}
return new WinJS.Promise.wrap(null)
}, onBindingComplete: function onBindingComplete(){}, onWindowResize: function onWindowResize(event) {
CommonJS.WindowEventManager.HandleWindowResizeEvent.call(this, event, function HandleWindowResize() {
if (this.UIConfig && this.UIConfig.onWindowResize) {
return this.UIConfig.onWindowResize(event)
}
})
}, itemsFromIndex: function itemsFromIndex(index, countBefore, countAfter) {
return WinJS.Promise.wrap({
absoluteIndex: index, items: this._data, offset: index, totalCount: this._data.length
})
}, getCount: function getCount() {
return WinJS.Promise.wrap(this._data.length)
}, _getLocPrefix: function _getLocPrefix() {
if (!this._locPrefix) {
this._locPrefix = this.UIConfig.getLocalizedStringPrefix()
}
return this._locPrefix
}, _onClearFiltersClick: function _onClearFiltersClick(event) {
var that=this;
if (WinJS.Utilities.hasClass(document.getElementById("clearFilters"), "enabled") === false) {
return
}
if (this.UIConfig.OnClearFiltersClick) {
this.UIConfig.OnClearFiltersClick()
}
var appbar=this._appbarElement;
if (appbar) {
var appbarCtl=appbar.winControl;
if (appbarCtl) {
appbarCtl.hide()
}
}
PlatformJS.Utilities.getControl("platformNavigationBar").hide();
msSetImmediate(function controller_afterOnCFClick() {
that._clearFilters()
})
}, _onDataAttributionClick: function _onDataAttributionClick() {
var flyout=document.querySelector("#dataAttribFlyout");
WinJS.Utilities.setInnerHTMLUnsafe(flyout, this.UIConfig.GetDataAttributionText());
flyout.winControl.show(document.querySelector("#dataAttribution"))
}, _clearFilters: function _clearFilters() {
this._options.appliedFilters = null;
this._options._selectedSort = null;
this._options._sortDirection = null;
this._appliedFilters = [];
this._refresh(true)
}, _toggleCF: function _toggleCF(evt) {
if (evt.type === "beforeshow" && this._appliedFilters && this._appliedFilters.length > 0) {
WinJS.Utilities.addClass(document.getElementById("clearFilters"), "enabled")
}
else {
WinJS.Utilities.removeClass(document.getElementById("clearFilters"), "enabled")
}
}, _hideDefaultAppBarIfEmpty: function _hideDefaultAppBarIfEmpty() {
var appBar=this._appbarElement;
if (!appBar.winControl.disabled) {
var commands=appBar.childNodes;
for (var i=0, l=commands.length; i < l; i++) {
var command=commands[i];
if (command.nodeName !== "#text") {
var style=getComputedStyle(command);
if (command.winControl && !(style["display"] === "none" || style["opacity"] === "0")) {
return
}
}
}
this._hideDefaultAppBar()
}
}, _initialize: function _initialize(collection) {
var c=this._collection = collection;
var that=this;
var progressType=CommonJS.Progress.centerProgressType;
if (c.showProgress) {
c.showProgress(progressType)
}
this._initializePromise = null;
return new WinJS.Promise(function controller_initializePromiseInit(complete) {
msWriteProfilerMark("CommonControls:EntityCollection:providerInitialize:s");
that._initializePromise = c.Initialize(that._options.state);
that._initializePromise.done(function controller_initializePromiseComplete(r) {
msWriteProfilerMark("CommonControls:EntityCollection:providerInitialize:e");
if (c.hideProgress) {
c.hideProgress(progressType)
}
if (that._abandonSession) {
return
}
that._dataConfig = c.DataConfig;
that.UIConfig = c.UIConfig;
that._initializeViews(c.UIConfig);
that._setAppBarItems(c.UIConfig)
}, function controller_initializePromiseError(error) {
var winjsCancelText="Canceled";
if (error.message === winjsCancelText) {
return
}
console.error("******error initializing provider.******");
console.error("err message: " + error.message);
console.error("err description: " + error.description);
console.error("err stack: " + error.stack);
console.error("******this error is unrecoverable. displaying error dialog******");
if (c.hideProgress) {
c.hideProgress(progressType)
}
var code=PlatformJS.Utilities.getPlatformErrorCode(error);
var errorCode=PlatformJS.Utilities.checkOfflineErrorCode(code);
CommonJS.Error.showError(errorCode, function controller_initializeShowError(a) {
PlatformJS.Navigation.navigateToChannel("Home")
})
})
})
}, _setAppBarItems: function _setAppBarItems(config) {
var items=config.GetAppBarItems(this);
var appBar=this._appbarElement;
for (var i=0, l=items.length; i < l; i++) {
var item=items[i];
if (item.label && item.icon) {
var button=new WinJS.UI.AppBarCommand(null, item);
appBar.appendChild(button.element)
}
}
var views=config.GetSupportedViews()
}, _setViewsInAppBar: function _setViewsInAppBar() {
var viewContainer=document.querySelector(".viewcontainer");
if (!viewContainer) {
viewContainer = document.createElement("div");
viewContainer.setAttribute("class", "viewcontainer");
var appBar=this._appbarElement;
appBar.insertBefore(viewContainer, appBar.firstChild)
}
viewContainer.innerHTML = "";
var currentView=this.currentView;
var views=this.UIConfig.GetSupportedViews().list;
var that=this;
if (views.length === 1) {
return
}
for (var view=0, l=views.length; view < l; view++) {
var viewConfig={};
var v=views[currentView];
if (v === view.Type) {
viewConfig.selected = true;
viewConfig.mode = CommonJS.Button.Radio
}
switch (v) {
case CommonJS.EntityCollection.Views.Grid:
viewConfig.icon = "iconGrid";
viewConfig.title = PlatformJS.Services.resourceLoader.getString(this._getLocPrefix() + "GridView");
viewConfig.onclick = function(e) {
that._setActiveView(that._views[CommonJS.EntityCollection.Views.Grid])
};
break;
case CommonJS.EntityCollection.Views.List:
viewConfig.icon = "iconList";
viewConfig.title = PlatformJS.Services.resourceLoader.getString(this._getLocPrefix() + "ListView");
viewConfig.onclick = function(e) {
that._setActiveView(that._views[CommonJS.EntityCollection.Views.List])
};
break;
default:
throw"The specified view \"" + v + "\" is not supported";
}
var button=new CommonJS.Button(null, viewConfig);
viewContainer.appendChild(button.element)
}
}, _initializeViews: function _initializeViews(config) {
var supportedViews=config.GetSupportedViews();
var views=supportedViews.list;
var defaultView=supportedViews.defaultView || 1;
var currentView=null;
for (var view=0, l=views.length; view < l; view++) {
var v=views[view];
var instantiatedView=null;
var viewOptions=config.GetViewOptions(v);
viewOptions.existingState = this._options;
switch (v) {
case CommonJS.EntityCollection.Views.Grid:
instantiatedView = new CommonJS.EntityCollection.Grid(viewOptions, this);
break;
case CommonJS.EntityCollection.Views.List:
instantiatedView = new CommonJS.EntityCollection.List(viewOptions, this);
break;
default:
throw"The specified view \"" + v + "\" is not supported";
}
if (this._options.view === v || v === defaultView) {
currentView = instantiatedView
}
this._views[instantiatedView.Type] = (instantiatedView)
}
this._setActiveView(currentView);
this._populateBottomAppBar(this.currentSort, this._appliedFilters);
var clear=document.getElementById("clearSelection");
if (clear) {
clear.addEventListener("click", this._onClearSelection.bind(this))
}
}, _processViewOptions: function _processViewOptions() {
var type=this.currentView.Type;
var options=this.UIConfig.GetViewOptions(type);
var optionKeys=["disableClearFilters", "hasAttribution"];
var optionDefaults=[false, false];
for (var i=0, len=optionKeys.length; i < len; i++) {
var key=optionKeys[i];
var value=options[key];
if (typeof value === "undefined") {
value = optionDefaults[i]
}
var display;
switch (key) {
case"disableClearFilters":
display = value ? "none" : "inline-block";
document.getElementById("clearFilters").style.display = display;
break;
case"hasAttribution":
display = !value ? "none" : "inline-block";
document.getElementById("dataAttribution").style.display = display;
break
}
}
}, _setActiveView: function _setActiveView(view) {
var that=this;
that.currentView = view;
that.hideBottomAppBar();
that._processViewOptions();
if (that._viewInitializePromise) {
that._viewInitializePromise.cancel()
}
that._viewInitializePromise = view.Initialize();
that._viewInitializePromise.done(function controller_viewInitializePromiseComplete() {
if (that._abandonSession) {
return
}
that._refresh(false);
that._setViewsInAppBar();
that._appbarElement.style.display = that.UIConfig.HideAppBar(view.Type) ? "none" : "block";
that._viewInitializePromise = null;
PlatformJS.mainProcessManager.afterFirstView()
})
}, _showDefaultAppBar: function _showDefaultAppBar() {
var view=this.currentView;
var appBar=this._appbarElement;
if (!this.UIConfig.HideAppBar(view.Type)) {
appBar.style.display = "block";
appBar.winControl.disabled = false
}
else {
appBar.winControl.disabled = true;
appBar.style.display = "none"
}
}, _hideDefaultAppBar: function _hideDefaultAppBar() {
var appBar=this._appbarElement;
appBar.winControl.disabled = true;
appBar.style.display = "none"
}, _showNoResults: function _showNoResults(filters, error) {
var appbar=this._appbarElement.winControl;
appbar.disabled = true;
error = error || {};
var hasFilters=filters && filters.length > 0;
var that=this;
var fnMask=PlatformJS.Services.resourceLoader;
var prefix=that._getLocPrefix();
var cannedTitle=fnMask.getString(prefix + "ECVNoResultsTitle");
var cannedActionText=fnMask.getString(prefix + "ECVNoResultsActionFilters");
var cannedDescription=fnMask.getString(prefix + "ECVNoResultsDescriptionFilters");
var action=function() {
that._clearFilters();
that._showDefaultAppBar();
appbar.disabled = false
};
if (!hasFilters) {
cannedActionText = fnMask.getString(prefix + "ECVNoResultsActionNoFilters");
cannedDescription = fnMask.getString(prefix + "ECVNoResultsDescriptionNoFilters");
action = function() {
WinJS.Navigation.back()
}
}
var viewportDiv=document.createElement("div");
var errorDialog=new CommonJS.GenericErrorControl(viewportDiv);
WinJS.Utilities.addClass(errorDialog.element, "noResultsError");
errorDialog.title = error.title || cannedTitle;
errorDialog.buttonText = error.actionText || cannedActionText;
errorDialog.description = error.message || cannedDescription;
errorDialog.actionCallback = action;
errorDialog.show();
var element=errorDialog.element;
element.parentNode.removeChild(element);
that._customErrorHost.appendChild(element)
}, _restoreViewScrollPosition: function _restoreViewScrollPosition() {
if (this._options.scrollPosition && this.currentView.setScrollPosition) {
this.currentView.setScrollPosition(this._options.scrollPosition);
this._options.scrollPosition = null
}
}, _onViewPortRenderComplete: function _onViewPortRenderComplete() {
PlatformJS.Navigation.mainNavigator.notifyPageLoadComplete()
}, _onViewRenderComplete: function _onViewRenderComplete() {
this._restoreViewScrollPosition()
}, _refresh: function _refresh(invalidateTimer) {
var that=this;
this.queryCancel();
if (this._abandonSession) {
return
}
this.currentView.cancelLayout();
CommonJS.Error.removeError();
if (invalidateTimer) {
this.currentView.invalidate()
}
return new WinJS.Promise(function controller_refreshPromiseInit(complete, errorCallback) {
if (invalidateTimer && that._timer) {
clearTimeout(that._timer)
}
var c=that._collection;
var isFirstQueryProgress=true;
var progressType=CommonJS.Progress.headerProgressType;
if (that._isFullRefresh) {
progressType = CommonJS.Progress.centerProgressType
}
that.currentView.onRenderComplete = function onRenderComplete() {
that._onViewRenderComplete()
};
that.currentView.onViewPortRenderComplete = function onViewPortRenderComplete() {
that._onViewPortRenderComplete()
};
var setSortsFilters=function() {
c.GetSorts().done(function controller_getSortsComplete(s) {
that.Sort = s
});
c.GetFilters().done(function controller_getFiltersComplete(filters) {
that.filters = filters
})
};
var onQueryProgress=function(isComplete) {
if (that._abandonSession) {
return
}
if (isFirstQueryProgress) {
if (c.resetProgress) {
c.resetProgress(progressType)
}
progressType = CommonJS.Progress.headerProgressType;
if (c.showProgress & !isComplete) {
c.showProgress(progressType)
}
isFirstQueryProgress = false
}
c.GetEntities().done(function getEntitiesComplete(e) {
if (that._abandonSession) {
return
}
that.currentView.isQueryComplete = !!isComplete;
setSortsFilters();
if (e) {
that.currentView.render(e, that, !that._isFullRefresh);
that._isFullRefresh = false
}
if (isComplete) {
var listElm=document.querySelector(".landinglist");
if (e.length === 0) {
that._showNoResults(that.appliedFilters);
WinJS.Utilities.removeClass(document.getElementById("clearFilters"), "enabled");
if (listElm) {
WinJS.Utilities.addClass(listElm, "platformHide")
}
}
else {
that._showDefaultAppBar();
if (listElm) {
WinJS.Utilities.removeClass(listElm, "platformHide")
}
}
that._hideDefaultAppBarIfEmpty();
that._isFullRefresh = true;
that._populateBottomAppBar(that._selectedSort, that.appliedFilters)
}
})
};
var onQueryComplete=function() {
onQueryProgress(true);
endQueryBehavior()
};
var endQueryBehavior=function() {
CommonJS.Progress.resetProgress(progressType);
if (that._abandonSession) {
if (c.hideProgress) {
c.hideProgress(progressType)
}
return
}
var sleepInterval=that.UIConfig.getSleepDuration();
if (sleepInterval > 0) {
that._timer = setTimeout(function controller_afterEndQueryBehavior() {
if (that._timer) {
that._isFullRefresh = false;
that._refresh()
}
}, sleepInterval)
}
complete()
};
var onQueryError=function(error) {
if (c.hideProgress) {
c.hideProgress(progressType)
}
var winjsCancelText="Canceled";
if (error.message === winjsCancelText) {
return
}
that._isFullRefresh = true;
error = error || {};
that.dispatchEvent(CommonJS.EntityCollection.Controller.QUERY_ERROR_EVENT, error);
var fnMask=PlatformJS.Services.resourceLoader;
var prefix=that._getLocPrefix().toString();
var viewportDiv=document.createElement("div");
var errorDialog=new CommonJS.GenericErrorControl(viewportDiv);
WinJS.Utilities.addClass(errorDialog.element, "appErrorDialog");
if (error.actionText) {
errorDialog.title = error.title;
errorDialog.buttonText = error.actionText;
errorDialog.description = error.message
}
else {
errorDialog.title = fnMask.getString(prefix + "defaultECVErrorTitle");
errorDialog.buttonText = fnMask.getString(prefix + "defaultECVErrorAction");
errorDialog.description = fnMask.getString(prefix + "defaultECVErrorDescription")
}
var retryAction=that._refresh.bind(that);
if (error.customAction) {
errorDialog.actionCallback = error.customAction
}
else {
errorDialog.actionCallback = retryAction
}
that.currentView.empty(that);
if (!Platform.Networking.NetworkManager.instance.isNetworkAvailable) {
var errorCode=CommonJS.Error.NO_INTERNET;
CommonJS.Error.showError(errorCode, retryAction)
}
else {
errorDialog.show();
var element=errorDialog.element;
element.parentNode.removeChild(element);
that._customErrorHost.appendChild(element)
}
endQueryBehavior()
};
if (that.appliedFilters) {
var appliedFiltersStr="Applied Filters: ";
for (var i=0, l=that.appliedFilters.length; i < l; i++) {
var f=that.appliedFilters[i];
var vals=f.value;
appliedFiltersStr += f.attribute + ": ";
for (var val in vals) {
appliedFiltersStr += "[" + val + "/" + (vals[val] ? vals[val] : "null") + "]"
}
appliedFiltersStr += "| "
}
}
else {
console.log("no filters applied.")
}
that._Entities = [];
that._queryUIDelay = msSetImmediate(function controller_afterQueryUIDelay() {
if (c.showProgress) {
c.showProgress(progressType)
}
that._queryPromise = c.Query({
identifier: that._selectedSort, sortDirection: that._sortDirection || 0
}, that.appliedFilters).then(onQueryComplete, onQueryError, onQueryProgress)
})
})
}, _populateBottomAppBar: function _populateBottomAppBar(sort, filters) {
var bottom=document.getElementById("selectionAppBar");
if (this.UIConfig.setSelectionAppBar) {
this.UIConfig.setSelectionAppBar(bottom, sort, filters, this)
}
}, _onClearSelection: function _onClearSelection() {
this.currentView.clearSelection()
}, _populateSort: function _populateSort(sort) {
var sortFilter={};
var convertedSort=[];
if (sort) {
var hasSelected=false;
for (var i=0; i < sort.length; i++) {
var selected=false;
if (sort[i].identifier === this._selectedSort) {
selected = true;
hasSelected = true
}
convertedSort[i] = {
value: sort[i].identifier, label: sort[i].label, selected: selected
}
}
if (!hasSelected && convertedSort[0]) {
convertedSort[0].selected = true
}
}
sortFilter.items = convertedSort;
sortFilter.isSort = true;
sortFilter.name = "Sort";
sortFilter.label = "Sort";
sortFilter.attribute = PlatformJS.Services.resourceLoader.getString("/platform/sortText");
this._populateEdgySort(sortFilter.items, this._onSortChanged.bind(this))
}, _populateFilters: function _populateFilters(filterArray) {
filterArray = filterArray || [];
var filters=[];
var osc=this._onSortChanged.bind(this);
var ofc=this._onFilterChanged.bind(this);
var filterList=filterArray;
for (var i=0, l=filterList.length; i < l; i++) {
var f=filterList[i];
this._collection.UIConfig.SetFilterType(f);
var sm=f.selectionMode ? f.selectionMode : "Multiple";
var onSelection=f.isSort ? osc : ofc;
var onClose=ofc;
var filterObj={
filterName: f.name, filterValue: f.attribute, filterType: f.type, filterLabel: f.name, selectionMode: sm, filterItems: [], onselectionchanged: onSelection, onclosed: onClose, minValue: f.minValue, maxValue: f.maxValue, ordinalToValue: f.ordinalToValue, getValueText: f.getValueText, hintFunction: f.hintFunction, useWideTile: f.useWideTile, customView: (f.type === CommonJS.Filters.FilterType.Custom && f.customView) || null, viewOptions: f.viewOptions, immediateRefresh: f.immediateRefresh
};
for (var j=0, iLength=f.items.length; j < iLength; j++) {
var item=f.items[j];
if (item.label.length > 0) {
filterObj.filterItems.push({
text: item.label, value: item.value, checked: item.selected ? true : false
})
}
}
filters.push(filterObj)
}
if (filters && filters.length > 0) {
this._filterBar.filterControls = filters
}
}, _populateEdgySort: function _populateEdgySort(sort, selectionChanged) {
var elem=document.querySelector(".table-edgy-sort");
if (!sort || sort.length === 0) {
if (elem) {
elem.style.display = "none"
}
return
}
else if (elem) {
elem.style.display = "inline-block"
}
var sortControl=this.edgySortControl;
if (!sortControl) {
sortControl = this._createSortControl(selectionChanged)
}
sortControl.setItems(sort)
}, _createSortControl: function _createSortControl(selectionChanged) {
var sortText=PlatformJS.Services.resourceLoader.getString("/platform/sortLabel");
var ctorOptions={};
ctorOptions.buttonText = sortText;
ctorOptions.icon = "sort";
ctorOptions.flyoutHeader = "Sort By";
ctorOptions.selectionChanged = selectionChanged;
var edgySortControl=this.edgySortControl = new CommonJS.SortFlyout(null, ctorOptions);
var edgySortControlElement=edgySortControl.element;
WinJS.Utilities.addClass(edgySortControlElement, "table-edgy-sort");
var appbarElement=this._appbarElement;
if (appbarElement) {
var helpButton=appbarElement.querySelector("#helpButton");
if (helpButton) {
appbarElement.insertBefore(edgySortControlElement, helpButton)
}
else {
appbarElement.appendChild(edgySortControlElement)
}
}
return edgySortControl
}, _onEntityClick: function _onEntityClick(entityDOM) {
if (this._collection && this._collection.onEntityClick) {
this._collection.onEntityClick(entityDOM)
}
}, onColHeaderClick: function onColHeaderClick(header, column, direction) {
if (column.sortIdentifier) {
var sortstr=column.sortIdentifier;
if (this._selectedSort === column.sortIdentifier) {
if (this._sortDirection === null && direction === 1) {
this._sortDirection = 0
}
else if (this._sortDirection === 0) {
this._sortDirection = 1
}
else if (this._sortDirection === 1) {
this._sortDirection = 0
}
else {
this._sortDirection = 1
}
}
else {
this._sortDirection = direction ? 1 : 0
}
this._options.sortDirection = this._sortDirection;
this._selectedSort = sortstr;
this._refresh(true)
}
}, onModuleClick: function onModuleClick(entity, expando) {
msWriteProfilerMark("CommonControls:EntityCollection:itemClicked:s");
var index=entity.detail.itemIndex;
var object=entity.detail.itemPromise ? entity.detail.itemPromise._value.data : entity;
if (!object) {
return
}
object.uniqueID = index;
if (this.UIConfig.OnItemClicked) {
var result=this.UIConfig.OnItemClicked(object, expando);
if (result) {
return result
}
}
if (!this._onModuleClickInvoked && this._options && this._options.entityView) {
this._onModuleClickInvoked = true;
PlatformJS.Navigation.navigateToChannel(this._options.entityView, {
config: this._options, entity: object
})
}
}, _onSortChanged: function _onSortChanged(sort) {
var newSortIndex=sort.selectedIndex;
var items=this.Sort;
for (var i=0; i < items.length; i++) {
items[i].selected = false;
if (i === newSortIndex) {
items[i].selected = true
}
}
this.Sort = items;
this._refresh(true)
}, _onFilterChanged: function _onFilterChanged(rawState) {
var processedState=this._processFilterGroups(rawState);
this._options.appliedFilters = rawState;
this.appliedFilters = processedState
}, _processFilterGroups: function _processFilterGroups(filterMenuState) {
var state=[];
for (var key in filterMenuState) {
var gState=this._processFilterGroup(filterMenuState[key]);
if (gState.length > 0) {
state.push(gState)
}
}
var flatFilterState=[];
for (var i=0, l=state.length; i < l; i++) {
var group=state[i];
for (var j=0, k=group.length; j < k; j++) {
flatFilterState.push(group[j])
}
}
return flatFilterState
}, _processFilterGroup: function _processFilterGroup(filterGroup) {
var groupState=[];
var filters=filterGroup.state;
for (var filter in filters) {
var filterResult=this._processFilter(filters[filter]);
if (filterResult !== null) {
groupState.push(filterResult)
}
}
return groupState
}, _processFilter: function _processFilter(filter) {
switch (filter.type) {
case CommonJS.Filters.FilterType.DropDownSingleSelect:
case CommonJS.Filters.FilterType.DropDownMultipleSelect:
case CommonJS.Filters.FilterType.Toggle:
return this._processDropDown(filter);
case CommonJS.Filters.FilterType.Slider:
return this._processSlider(filter);
case CommonJS.Filters.FilterType.TextBox:
return this._processTextBox(filter);
case CommonJS.Filters.FilterType.Custom:
return this._processCustom(filter)
}
console.warn("_processFilter gets an unknown filter type.");
return null
}, _processSlider: function _processSlider(filter) {
var min=filter.state.min;
var max=filter.state.max;
var af=new AppEx.Common.EntityCollection.Query.AttributeFilter;
af.attribute = filter.key;
af.setAttributeValue(min);
af.setAttributeValue(max);
return af
}, _processCustom: function _processCustom(filter) {
var af=null;
if (filter.state && filter.state.value) {
af = new AppEx.Common.EntityCollection.Query.AttributeFilter;
af.attribute = filter.key;
var values=[].concat(filter.state.value);
for (var i=0, length=values.length; i < length; i++) {
af.setAttributeValue(values[i])
}
}
return af
}, _processDropDown: function _processDropDown(filter) {
var state=filter.state;
var selected=[];
var queryObject=null;
for (var filterKey in state) {
var item=state[filterKey];
if (item.isSelected) {
selected.push(item.key)
}
}
if (selected.length > 0) {
var af=new AppEx.Common.EntityCollection.Query.AttributeFilter;
af.attribute = filter.key;
for (var val=0; val < selected.length; val++) {
var value=selected[val];
af.setAttributeValue(value)
}
queryObject = af
}
return queryObject
}, _processTextBox: function _processTextBox(filter) {
if (!(filter && filter.key && filter.state && filter.state.queryText)) {
return null
}
var af=new AppEx.Common.EntityCollection.Query.AttributeFilter;
af.attribute = filter.key;
af.setAttributeValue(filter.state.queryText);
return af
}, _render: function _render(){}, _clear: function _clear(){}
}, {QUERY_ERROR_EVENT: "providerqueryerror"}), WinJS.Utilities.eventMixin)})
})();
(function appexCommonControlsECDataConfigInit() {
"use strict";
WinJS.Namespace.define("CommonJS.EntityCollection", {DataConfig: WinJS.Class.define(function dataConfig_ctor(options){}, {})})
})();
(function appexCommonControlsECUIConfigInit() {
"use strict";
WinJS.Namespace.define("CommonJS.EntityCollection", {UIConfig: WinJS.Class.define(function uiConfig_ctor(options) {
WinJS.UI.setOptions(this, options)
}, {
GetEntityTemplate: function GetEntityTemplate(view) {
return document.querySelector(".itemTemplate")
}, GetDataAttributionText: function GetDataAttributionText() {
return "<h3>this is an attribution</h3>"
}, GetHeaderTemplate: function GetHeaderTemplate(view) {
switch (view) {
case CommonJS.EntityCollection.Views.Grid:
return document.querySelector(".headerTemplate");
default:
return document.querySelector(".listHeaderTemplate")
}
}, HideAppBar: function HideAppBar() {
return false
}, GetSemanticZoomEntityTemplate: function GetSemanticZoomEntityTemplate(view) {
return document.querySelector("#semanticZoomTemplate")
}, GetListRendererTemplate: function GetListRendererTemplate(view) {
return document.querySelector(".listTemplate")
}, GetViewOptions: function GetViewOptions(view) {
var options={};
switch (view) {
case CommonJS.EntityCollection.Views.Grid:
options.minCellHeight = this.minCellHeight;
options.maxCellHeight = this.maxCellHeight;
options.minCellWidth = this.minCellWidth;
break
}
return options
}, GetAppBarItems: function GetAppBarItems(controller) {
var buttons=[];
var onSampleItemClicked=function(item) {
var items=controller.currentView.getSelectedItems();
controller.currentView.clearSelection();
console.log("test button clicked")
};
var multiSelect={
icon: "iconHome", title: "test button", onclick: onSampleItemClicked
};
return buttons
}, getLocalizedStringPrefix: function getLocalizedStringPrefix() {
return ""
}, onNavigateAway: function onNavigateAway(){}, setSelectionAppBar: function setSelectionAppBar(domElement, sort, filters, controller){}, onSelectionChanged: function onSelectionChanged(changedItems) {
console.log(changedItems.length + " items are selected")
}, onSelectionChanging: function onSelectionChanging(changingItems) {
console.log(changingItems.length + " items are changing")
}, getSleepDuration: function getSleepDuration() {
return 0
}, OnItemClicked: function OnItemClicked() {
console.log("item clicked");
return false
}, GetSupportedViews: function GetSupportedViews() {
return {
list: [CommonJS.EntityCollection.Views.Grid], defaultView: CommonJS.EntityCollection.Views.Grid
}
}, GetTableDefinition: function GetTableDefinition(entities) {
var td=new CommonJS.Table.TableDefinition;
var testFields=["title", "id", "group"];
for (var i=0, len=testFields.length; i < len; i++) {
var colDefinition=new CommonJS.Table.ColumnDefinition;
colDefinition.headerText = testFields[i];
colDefinition.priority = i;
colDefinition.boundField = testFields[i];
colDefinition.ID = testFields[i];
td.columns.push(colDefinition)
}
var imgDefinition=new CommonJS.Table.ColumnDefinition;
imgDefinition.fieldTemplate = document.querySelector(".imageFieldTemplate");
imgDefinition.priority = 100;
imgDefinition.boundField = "image";
imgDefinition.ID = "image";
td.columns.push(imgDefinition);
td.groupPosition = "top";
return td
}, SetFilterType: function SetFilterType(filter) {
filter.type = "DropDown";
if (filter.attribute !== "Sort") {
filter.selectionMode = "Multiple"
}
else {
filter.selectionMode = "SingleToggle"
}
}
})});
CommonJS.EntityCollection.Views = {
Grid: 1, List: 2, Map: 4
}
})();
(function appexCommonControlsECCollectionInit() {
"use strict";
WinJS.Namespace.define("CommonJS.EntityCollection", {Collection: WinJS.Class.define(function collection_ctor(options){}, {
Initialize: function Initialize(config) {
throw"Method Must be implemented by derived classes";
}, onEntityClick: function onEntityClick(entity) {
console.log("entity was clicked")
}, UIConfig: {
get: function get() {
if (!this._UI) {
throw"UIConfig configuration must be set during initialization";
}
return this._UI
}, set: function set(v) {
this._UI = v
}
}, DataConfig: {
get: function get() {
if (!this._Data) {
throw"Data configuration must be set during initialization";
}
return this._Data
}, set: function set(v) {
this._Data = v
}
}, copy: function copy(nativeObjects) {
if (!nativeObjects || nativeObjects.length === 0) {
return []
}
var jsObjArr=[];
for (var i=0; i < nativeObjects.length; i++) {
var obj=nativeObjects[i];
var jsobj={};
for (var p in obj) {
var val=null;
if (p === "attributes") {
continue
}
try {
val = obj[p]
}
catch(e) {}
jsobj[p] = val
}
var attrib=obj.attributes;
if (attrib) {
var count=0;
var len=attrib.size;
while (count++ < len) {
var item=attrib.first().current;
jsobj[item.key] = item.value;
attrib.remove(attrib.first().current.key)
}
}
jsObjArr.push(jsobj)
}
return jsObjArr
}, GetFilters: function GetFilters() {
return WinJS.Promise.wrap(this.Filters)
}, GetEntities: function GetEntities() {
return WinJS.Promise.wrap(this.Entities)
}, ClearEntities: function ClearEntities() {
this.Entities = null
}, GetSorts: function GetSorts() {
return WinJS.Promise.wrap(this.Sorts)
}, showProgress: function showProgress(progressType) {
CommonJS.Progress.showProgress(progressType)
}, resetProgress: function resetProgress(progressType) {
CommonJS.Progress.resetProgress(progressType)
}, hideProgress: function hideProgress(progressType) {
CommonJS.Progress.hideProgress(progressType)
}, onBeforeQuery: function onBeforeQuery(query) {
return WinJS.Promise.wrap(null)
}, onQueryReturned: function onQueryReturned(entities, sorts, groups, filters) {
return WinJS.Promise.wrap(null)
}, Query: function Query(sort, filters) {
var that=this;
var isQueryComplete=false;
var logStr="Query(): Selected Sort: " + (sort ? sort.identifier : " none") + ", Selected Filters: ";
var p=new WinJS.Promise(function collection_queryPromiseInit(complete, error, progress) {
var onQueryUpdate=function(jsonStr) {
var result={};
var dataset=null;
try {
dataset = JSON.parse(jsonStr);
jsonStr = null
}
catch(e) {
error(e);
return
}
var e=dataset.entities;
that.Sorts = dataset.sorts;
var g=that.Groups = dataset.groups;
that.Filters = dataset.filters;
var groupsDictionary={};
for (var i=0; i < g.length; i++) {
var key=g[i].identifier;
groupsDictionary[key] = g[i].count
}
for (var j=0; j < e.length; j++) {
e[j].groupCount = groupsDictionary[e[j].group]
}
try {
that.onQueryReturned(e, that.Sorts, that.Groups, that.Filters).done(function collection_onQueryReturnedComplete() {
that.Entities = e;
if (isQueryComplete) {
if (that.onQueryComplete) {
that.onQueryComplete(e)
}
complete()
}
else {
progress()
}
})
}
catch(e) {
error(e)
}
};
var onQueryProgress=function(dataset) {
isQueryComplete = false;
onQueryUpdate(dataset)
};
var onQueryComplete=function(dataset) {
isQueryComplete = true;
msWriteProfilerMark("CommonControls:EntityCollection:providerQuery:e");
onQueryUpdate(dataset)
};
var q=new AppEx.Common.EntityCollection.Query.EntityQuery;
if (filters) {
for (var ii=0; ii < filters.length; ii++) {
q.filters.append(filters[ii]);
logStr += "[" + filters[ii].attribute + ":";
for (var jj=0; jj < filters[ii].value.length; jj++) {
var val=filters[ii].value[jj];
logStr += val + ";"
}
logStr += "] "
}
}
if (sort && sort.identifier) {
q.sortIdentifier = sort.identifier;
q.sortDirection = sort.sortDirection
}
that.onBeforeQuery(q).done(function collection_onBeforeQueryComplete() {
var jsonShim=new AppEx.Common.EntityCollection.JSONCollectionProvider(that.Provider);
msWriteProfilerMark("CommonControls:EntityCollection:providerQuery:s");
jsonShim.queryAsync(q).done(onQueryComplete, error, onQueryProgress)
})
});
return WinJS.Promise.wrap(p)
}, QueryFromState: function QueryFromState(config) {
var that=this;
var p=new WinJS.Promise(function collection_queryFromStatePromiseInit(complete) {
that.getPageData(config).then(function collection_getPageDataComplete(result) {
if (!result || result.error) {
throw"Error Retrieving data " + result;
}
var nativeObjects=result.listSource[0];
that.Filters = that.copy(result.dataset.filters);
var jsObjArr=that.copy(nativeObjects);
that.Entities = jsObjArr;
that.Groups = result.Groups;
complete()
})
});
return p
}, getPageData: function getPageData(themes) {
var that=this;
var p=new WinJS.Promise(function collection_getPageDataPromiseInit(complete) {
var ds={title: that.options.label};
var onQueryComplete=function(dataset) {
ds.dataset = dataset;
that._data.push(dataset.entities);
ds.listSource = that._data;
complete(ds)
};
var queryForTheme=function() {
var provider=that.Provider;
var q=new AppEx.Common.EntityCollection.Query.Query;
var config=PlatformJS.Collections.createStringDictionary();
config.insert("collection", that.options.collection);
config.insert("theme", that.options.theme);
provider.queryAsync(q).then(onQueryComplete)
}
});
return p
}
})})
})();
PlatformHelper = {};
PlatformHelper.Binding = {};
PlatformHelper.Binding.Cacheable = WinJS.Utilities.markSupportedForProcessing(function _module_9(source, sourceProperty, dest, destProperty) {
var src=source[sourceProperty];
var destField=destProperty[0];
var onFail=function(fail) {
var missing=source["missing"];
if (missing) {
dest[destField] = missing
}
};
dest.addEventListener("error", onFail);
if (src) {
dest[destField] = src
}
});
PlatformHelper.Binding.PassThroughBinding = WinJS.Utilities.markSupportedForProcessing(function _module_26(source, sourceProperty, dest, destProperty) {
var control=destProperty[0];
var key=destProperty[1];
dest[control][key] = source
});
(function appexCommonControlsECModuleInit() {
"use strict";
var ce=function(type, className) {
var e=document.createElement(type);
e.className = className;
return e
};
var ac=function(myParent, children) {
if (children.length) {
for (var i=0; i < children.length; i++) {
myParent.appendChild(children[i])
}
}
else {
myParent.appendChild(children)
}
return myParent
};
var Control=WinJS.Class.define(null, {raiseEvent: function raiseEvent(type, details) {
this.dispatchEvent(type, details)
}});
WinJS.Class.mix(Control, WinJS.UI.DOMEventMixin);
WinJS.Namespace.define("CommonJS", {Module: WinJS.Class.derive(Control, function module_ctor(element, options) {
element = element || document.createElement("div");
this.title = "Not Set";
this.Name = "Module";
this.image = null;
this.subtitle = null;
this.Images = "";
this.SlideshowDelay = 3 * 1000;
this.TransitionEffect = WinJS.UI.Animation.crossFade;
this._setElement(element);
this._timer = null;
var that=this;
var _onClick=function(item) {
if (options && options.OnClick) {
options.OnClick.call(that, item, options)
}
};
element.addEventListener("click", _onClick);
Object.defineProperties(this, WinJS.Utilities.createEventProperties("moduleInvoked"));
if (options) {
this._setOptions(options)
}
}, {
_setElement: function _setElement(element) {
this._domElement = element;
WinJS.Utilities.addClass(this._domElement, "appex-module")
}, OnClick: function OnClick(item) {
console.log("module click")
}, _setOptions: function _setOptions(value) {
this._options = value;
WinJS.UI.setOptions(this, value);
this.image = value.image;
this.title = value.title;
this.subtitle = value.subtitle;
if (typeof this.image === "string") {
this.Images = [this.image]
}
else {
this.Images = this.image
}
this._setData(value)
}, _setData: function _setData(options) {
this._render()
}, _clear: function _clear() {
this._domElement.innerHTML = ""
}, _cycle: function _cycle(from, to){}, _onTimeout: function _onTimeout() {
var selected=WinJS.Utilities.query(".appex-module-image.selected")[0];
var index=selected.getAttribute("data-index");
var nextIndex=(index + 1) % this.Images.length;
if (nextIndex !== index) {
var next=WinJS.Utilities.query(".appex-module-image[data-index='" + nextIndex + "']")[0];
WinJS.Utilities.removeClass(selected, "selected");
WinJS.Utilities.addClass(next, "selected");
this._cycle(selected, next)
}
}, _render: function _render() {
this._clear();
var title=ce("div", "appex-module-title");
var subtitle=ce("div", "appex-module-subtitle");
var titleOverlay=ce("div", "appex-module-title-overlay");
var imgContainer=ce("div", "appex-module-image-container");
for (var i=0, l=this.Images && this.Images.length; i < l; i++) {
var options={src: this.Images[i]};
options.missing = "../images/mlb_blank.png";
var img=ce("img", "appex-module-image");
img.setAttribute("data-win-bind", "src: src PlatformHelper.Binding.Cacheable");
if (i === 0) {
WinJS.Utilities.addClass(img, "selected")
}
ac(imgContainer, img);
WinJS.Binding.processAll(img, options)
}
title.innerText = this.title;
ac(titleOverlay, [title]);
if (this.subtitle) {
subtitle.innerText = this.subtitle;
ac(titleOverlay, [subtitle])
}
ac(this._domElement, imgContainer);
ac(this._domElement, titleOverlay)
}
})})
})()