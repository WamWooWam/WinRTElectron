/*  © Microsoft. All rights reserved. */
WinJS.Namespace.define('CommonJS', {Version: 'latest'});
(function _columnDefinition_7() {
"use strict";
WinJS.Namespace.define("CommonJS.Table", {ColumnDefinition: WinJS.Class.define(function _columnDefinition_10(options) {
this.headerTemplate = document.querySelector(".columnHeaderTemplate");
this.boundField = "title";
this.fieldTemplate = document.querySelector(".textFieldTemplate");
this.headerText = "not set";
this.priority = 0;
this.ID = Math.round(Math.random() * 1e9)
}, {
headerTemplate: null, fieldTemplate: null, boundField: null, priority: null, ID: null, headerText: null, isAutoSizeColumn: false, maxAutoSizeLength: null, isTextFormat: false, canWrap: false
})})
})();
CommonJS.groupPositionEnum = {
inline: "inline", top: "top"
};
(function _table_15() {
"use strict";
var STRINGS={ROW: CommonJS.resourceLoader.getString("/Platform/Row") || "Row"};
var IsRTL=document.dir === "rtl";
WinJS.Namespace.define("CommonJS.Table", {
EntityToken: {}, MarginLeft: IsRTL ? "marginRight" : "marginLeft", MarginRight: IsRTL ? "marginLeft" : "marginRight", Left: IsRTL ? "right" : "left", Right: IsRTL ? "left" : "right", Table: WinJS.Class.define(function _table_32(element, options) {
msWriteProfilerMark("Ecv:Table:ctor");
this._onRowKeyDownHandlerBind = this._onRowKeyDown.bind(this);
this._onRowClickedBind = this._onRowClicked.bind(this);
this.host = element;
this.tableDefinition = options;
element.winControl = this;
this._element = element;
if (options && options.existingState && options.existingState.sortDirection) {
this._selectedColumnSelectionCount = options.existingState.sortDirection
}
this._isTableCluster = element.className === "platformClusterContent"
}, {
host: null, hostContainer: null, _onRowKeyDownHandlerBind: null, _onRowClickedBind: null, _cssPrefix: "table-", _expandoQuerySelector: ".table-expando-viewport", _renderChunkSize: 20, _itemsRendered: 0, _rowHeight: 0, _desc: "sortdir-desc", _asc: "sortdir-asc", _selected: "sort-selected", _sortable: "column-sortable", _headerCSS: "top-header", _elemOffsetHeight: null, _lastScrollFire: null, _scrollTimeout: null, _approximateRenderedHeight: null, _element: null, _selectedColumnSelectionCount: 0, _containerHeight: null, _renderUIDelay: null, _scroller: null, _suppressCapture: null, _dataSource: null, _selectedColumnHeader: null, _minRenderHeight: null, _groupsRendered: 0, _hasFirstItemSetRendered: false, _isRenderComplete: false, _header: null, _manager: null, _containers: null, _groupHeader: null, _isRowClickable: true, expandos: null, table: null, tableMarginLeft: 0, containerHeight: {get: function get() {
if (!this._containerHeight) {
this._containerHeight = this.host.offsetHeight
}
return this._containerHeight
}}, tableDefinition: {
get: function get() {
return this._tableDefinition
}, set: function set(v) {
if (v) {
msWriteProfilerMark("Ecv:Table:tableDefinition:set:s");
this._tableDefinition = v;
this._buildAggregateTemplate();
if (this._manager) {
this._manager.tableDefinition = v
}
this._isRowClickable = v.isRowClickable;
this._expandColumnsIfNecessary(this.host, v);
msWriteProfilerMark("Ecv:Table:tableDefinition:set:e")
}
}
}, attachListeners: function attachListeners() {
if (this._manager) {
this._manager.attachListeners()
}
}, destroy: function destroy() {
if (this._manager) {
this._manager.destroy()
}
if (this._scrollTimeout) {
clearTimeout(this._scrollTimeout);
this._scrollTimeout = null
}
if (this._renderUIDelay) {
msClearImmediate(this._renderUIDelay)
}
if (this.hostContainer) {
this.hostContainer.onscroll = null
}
}, dataSource: {
get: function get() {
return this._dataSource
}, set: function set(v) {
this._clean();
this._dataSource = v;
this._onNewDataSource(v)
}
}, header: {get: function get() {
return this._header
}}, scroller: {get: function get() {
return this._scroller
}}, isInlineGroup: {get: function get() {
return this._isInlineGroup
}}, setSelectedSort: function setSelectedSort(sort) {
var selectedColumn=null;
var columns=this._tableDefinition.columns;
for (var index=columns.length - 1; index >= 0; index--) {
var column=columns[index];
if (column.sortIdentifier === sort) {
selectedColumn = column;
break
}
}
this._selectedColumnHeader = selectedColumn
}, setScrollPosition: function setScrollPosition(position) {
this._minRenderHeight = this.containerHeight + position;
this.table.style.minHeight = (this.containerHeight + position) + "px";
this._renderNextChunk();
this.viewport.scrollTop = position
}, cancelLayout: function cancelLayout(){}, addEventListener: function addEventListener(eventName, callback){}, initialize: function initialize() {
var pre=this._cssPrefix;
var ctr=document.createElement("div");
ctr.className = pre + "container";
ctr.setAttribute("role", "grid");
ctr.setAttribute("aria-labelledby", "filterBar_title");
if (!this._isInlineGroup) {
var header=this._createClassElement("div", pre + "header " + this._headerCSS);
ctr.appendChild(header);
this._header = header;
header.style.display = "none"
}
var scroller=this._createClassElement("div", pre + "scroller");
this._scroller = scroller;
var viewport=document.createElement("div");
viewport.className = pre + "viewport";
this._attachPreserveContext(viewport, "scroll");
var scrollingContainerAriaLabel=WinJS.Resources._getWinJSString("ui/listViewViewportAriaLabel").value || "Scrolling Container";
viewport.setAttribute("aria-label", scrollingContainerAriaLabel);
this.viewport = viewport;
viewport.appendChild(scroller);
ctr.appendChild(viewport);
var table=this._createClassElement("div", pre + "table");
scroller.appendChild(table);
this.host.appendChild(ctr);
this.table = table;
this._manager = new CommonJS.Table.TableManager(this.host, this.tableDefinition, this)
}, getPanAxis: function getPanAxis() {
return "vertical"
}, getCurrentItem: function getCurrentItem() {
var current=this._getItem(this.dataSource, 0);
var data={item: current};
data.position = {
left: 0, top: this.viewport.scrollTop, width: 100, height: 100
};
return WinJS.Promise.wrap(data)
}, configureForZoom: function configureForZoom(){}, zoomableView: {get: function get() {
return this
}}, setCurrentItem: function setCurrentItem(x, y){}, beginZoom: function beginZoom(){}, endZoom: function endZoom(isZoomedOut){}, positionItem: function positionItem(item, position) {
var host=this.host;
var child=null;
if (this._itemsRendered < item.data.index) {
var progressType=CommonJS.Progress.centerProgressType;
CommonJS.Progress.showProgress(progressType);
this._bindData(this.dataSource, this._itemsRendered, item.data.index + 50);
CommonJS.Progress.hideProgress(progressType)
}
if (!(child = host.querySelector("[row='" + item.data.group + "']"))) {
child = host.querySelector("[entity='" + item.data.index + "']")
}
if (!child) {
return WinJS.Promise.wrap({
x: 0, y: 0
})
}
var elem=child.parentNode;
var minimum=elem.parentNode.offsetTop;
var newHeight=elem.offsetTop - minimum;
this.viewport.scrollTop = newHeight;
return WinJS.Promise.wrap({
x: 0, y: newHeight
})
}, handlePointer: function handlePointer(pointer) {
if (!this._suppressCapture) {
this._scroller.focus();
this._scroller.msSetPointerCapture(pointer)
}
}, _expandColumnsIfNecessary: function _expandColumnsIfNecessary(host, tableDefinition) {
var className="table-expanded-container";
if (tableDefinition && host) {
if (tableDefinition.expandColumns) {
host.classList.add(className)
}
else {
host.classList.remove(className)
}
}
}, _getItem: function _getItem(collection, index) {
if (collection.length && !collection.getItem) {
return collection[index]
}
if (collection.list && collection.list.getItem) {
return collection.list.getItem(index)
}
return null
}, _loop: function _loop(collection, fn, start, end) {
if (!collection) {
return
}
var len=collection.length;
start = start ? Math.max(0, start) : 0;
end = end ? Math.min(len, end) : len;
var j;
if (collection.getItem) {
for (j = start; j < end; j++) {
if (fn(collection.getItem(j), j) === false) {
break
}
}
}
else {
for (j = start; j < end; j++) {
if (fn(collection[j], j) === false) {
break
}
}
}
}, _buildSelector: function _buildSelector(elem, attribute) {
var value=elem.getAttribute(attribute);
if (value) {
return "[" + attribute + "=\"" + value + "\"]"
}
return ""
}, _buildSelectorForElement: function _buildSelectorForElement(elem) {
var id,
className=null;
var attributes=["role", "aria-label", "column"];
if (elem) {
if (elem.id) {
id = elem.id.trim()
}
if (elem.className) {
className = elem.className.split(" ")[0]
}
var selector=(id ? "#" + id : "") + (className ? "." + className : "").replace(/ /gi, ".");
for (var i=0, l=attributes.length; i < l; i++) {
selector += this._buildSelector(elem, attributes[i])
}
return selector
}
else {
return null
}
}, _saveFocusedElement: function _saveFocusedElement() {
var elem=document.activeElement;
var selector=[];
while (elem !== this.host) {
if (elem === document.body) {
return
}
try {
selector.push(this._buildSelectorForElement(elem));
elem = elem.parentNode
}
catch(e) {
return
}
}
this._lastFocusedItem = selector.reverse().join(" ")
}, _focusLastFocusedElement: function _focusLastFocusedElement() {
var result=false;
if (this._lastFocusedItem) {
var elem=document.querySelector(this._lastFocusedItem);
if (elem && document.activeElement && elem !== document.activeElement) {
try {
elem.focus();
result = true
}
catch(e) {}
}
this._lastFocusedItem = null
}
return result
}, _onRowClicked: function _onRowClicked(event) {
var elem=event;
var index=elem.getAttribute("entity");
var entity=null;
if (index !== null) {
entity = this._getItem(this.dataSource, index).data
}
this._saveFocusedElement();
var def=this._tableDefinition;
var expando=null;
var expandoViewport=null;
var focusOnExpando=false;
if (entity) {
entity.detail = {itemIndex: entity.index};
if (def.hasExpando) {
if (this._getExpando(elem)) {
this._hideExpandoForContainer(elem);
elem.setAttribute("aria-expanded", false)
}
else {
expando = this._createExpandoForContainer(elem);
expandoViewport = expando.parentElement;
var that=this;
setImmediate(function setScrollLeftOnExpando() {
expandoViewport.scrollLeft = that.viewport.scrollLeft
});
elem.setAttribute("aria-expanded", true)
}
}
if (this._tableDefinition.onRowClicked) {
var result=this._tableDefinition.onRowClicked(entity, expando);
if (result && result.expandoData) {
this._renderEntityToRow(result.expandoData, elem);
var columns=this._tableDefinition.columns;
var numCols=columns.length;
for (index = 0; index < numCols; index++) {
var column=columns[index];
var colHeader=this._header.querySelector("[column='" + column.ID + "']");
var colExpandRow=elem.querySelector("[aria-label='" + column.ID + "']");
if (colHeader && colExpandRow && colHeader.getAttribute("selected") === "selected") {
colExpandRow.setAttribute("sorted", "sorted")
}
}
}
var renderExpandoPromise=result && result.renderExpandoPromise;
if (renderExpandoPromise) {
renderExpandoPromise.done(function renderExpandoPromiseComplete() {
expandoViewport.focus();
focusOnExpando = true
})
}
}
}
if (!focusOnExpando) {
this._focusLastFocusedElement()
}
}, _onNewDataSource: function _onNewDataSource(ds) {
this.viewport.scrollTop = 0;
this.host.style.minHeight = "auto";
this._buildContainers(ds.list.length, ds.list.groups.length);
this._itemsRendered = 0;
this._lastScrollFire = 0;
this._groupsRendered = 0;
this._hasFirstItemSetRendered = false;
this._isRenderComplete = false;
this._addTableHeader();
this._manager.update(true, ds);
this._buildAggregateTemplate();
this._bindData(ds, this._itemsRendered, this._renderChunkSize)
}, _clean: function _clean() {
var that=this;
var expando=this._getExpando(this.host);
if (!expando) {
return
}
if (!expando.length) {
expando = [expando]
}
this._loop(expando, function cleanExpando(item) {
var ctr=item.parentNode.children[0];
that._hideExpandoForContainer(ctr, true)
})
}, _bindData: function _bindData(ds, start, end) {
msWriteProfilerMark("Ecv:Table:_bindData:" + start + ":" + end + ":s");
var renderedGroups=this._groupsRendered;
var shouldRenderInlineGroups=this._isInlineGroup;
var lastGroup=null;
var numRendered=0;
if (start && start > 0 && shouldRenderInlineGroups) {
var lastGroupItem=this._getItem(ds, start - 1);
if (lastGroupItem && lastGroupItem.data) {
lastGroup = lastGroupItem.data.group
}
else {
return
}
}
if (end - start > 0) {
this._addTableHeader()
}
try {
var col=ds.list;
if (end > col.length) {
end = col.length
}
for (var index=start; index < end; index++) {
var listItem=col.getItem(index);
var item=listItem.data;
if (shouldRenderInlineGroups && item.group !== lastGroup) {
var groupContainer=this._getContainer(index + renderedGroups);
this._renderGroupHeader(item.group, groupContainer);
renderedGroups++
}
var container=this._getContainer(index + renderedGroups);
lastGroup = item.group;
this._renderEntityToRow.apply(this, [item, container, index]);
if (index === 0) {
this._rowHeight = container.offsetHeight
}
numRendered++
}
}
catch(err) {
console.log("Binding error: " + err)
}
this._manager.disableUpdates = false;
this._itemsRendered += numRendered;
this._groupsRendered = renderedGroups;
if (this._itemsRendered === 0) {
this._hideTableHeader()
}
else {
this._showTableHeader()
}
if (numRendered > 0) {
this._onPartialRenderComplete(numRendered)
}
else {
this._cleanUnusedContainers(this._itemsRendered + renderedGroups);
this._isRenderComplete = true;
this.table.style.minHeight = "auto";
this._onFirstItemSetRendered()
}
msWriteProfilerMark("Ecv:Table:_bindData:" + start + ":" + end + ":e")
}, _onFirstItemSetRendered: function _onFirstItemSetRendered() {
msWriteProfilerMark("Ecv:Table:_onFirstItemSetRendered");
if (!this._hasFirstItemSetRendered) {
this._hasFirstItemSetRendered = true;
if (this.onViewPortRenderComplete) {
this.onViewPortRenderComplete()
}
if (this.onRenderComplete) {
this.onRenderComplete()
}
}
this._expandColumnHeader()
}, _expandColumnHeader: function _expandColumnHeader() {
var tableHeaderExpanders=document.querySelectorAll(".table-header-expander");
if (tableHeaderExpanders) {
for (var i=0, length=tableHeaderExpanders.length; i < length; i++) {
var tableHeaderExpander=tableHeaderExpanders[i];
var tableColumnHeader=tableHeaderExpander.childNodes[0];
if (tableColumnHeader) {
tableHeaderExpander.style.backgroundColor = tableColumnHeader.currentStyle.backgroundColor
}
}
}
}, _addTableHeader: function _addTableHeader() {
if (this._header) {
this._header.innerHTML = "";
var headers=this._buildColumnHeaders(this._headerCSS);
this._header.appendChild(headers);
this._header.style.display = (this._isInlineGroup ? "none" : "block");
if (!this.isInlineGroup) {
this._groupHeader.style[CommonJS.Table.Left] = "-" + this.viewport.scrollLeft + "px"
}
}
}, _hideTableHeader: function _hideTableHeader() {
if (this._header) {
this._header.style.display = "none"
}
}, _showTableHeader: function _showTableHeader() {
if (this._header && !this._isInlineGroup) {
this._header.style.display = "block"
}
}, delayedLayoutUpdated: function delayedLayoutUpdated(isLayoutChanged) {
if (!this._tableDefinition || !this._tableDefinition.columns) {
return
}
if (isLayoutChanged) {
this._itemsRendered = 0;
this._groupsRendered = 0;
this._hasFirstItemSetRendered = false;
this._isRenderComplete = false;
this._cleanUnusedContainers(this._itemsRendered);
this._addTableHeader();
this._expandColumnHeader();
this._buildAggregateTemplate();
this._bindData(this._dataSource, this._itemsRendered, this._renderChunkSize)
}
if (this.dataSource) {
this._containerHeight = null;
var avgItemHeight=this._rowHeight;
this._approximateRenderedHeight = avgItemHeight * this._itemsRendered;
var scrollPos=this.viewport.scrollTop;
var minRenderHeight=Math.max(this.containerHeight, this._minRenderHeight ? this._minRenderHeight : 0) + scrollPos;
if (this._approximateRenderedHeight <= minRenderHeight) {
this._renderNextChunk()
}
}
}, _onPartialRenderComplete: function _onPartialRenderComplete(numRendered) {
if (this.isNextColClick) {
this.isNextColClick = false;
this._focusLastFocusedElement()
}
var avgItemHeight=this._rowHeight;
this._approximateRenderedHeight = avgItemHeight * this._itemsRendered;
var approximateTotalHeight=avgItemHeight * this.dataSource.list.length;
var scrollPos=this.viewport.scrollTop;
var minRenderHeight=Math.max(this.containerHeight, this._minRenderHeight ? this._minRenderHeight : 0) + scrollPos;
if (this._approximateRenderedHeight <= minRenderHeight) {
this._renderChunkSize += 3;
console.log("Increased this._renderChunkSize to " + this._renderChunkSize);
this._renderNextChunk();
return
}
else {
this._onFirstItemSetRendered()
}
this.table.style.minHeight = approximateTotalHeight + "px"
}, _renderNextChunk: function _renderNextChunk() {
return this._bindData(this.dataSource, this._itemsRendered, this._itemsRendered + this._renderChunkSize)
}, _cleanUnusedContainers: function _cleanUnusedContainers(lastUsed) {
this._loop(this._containers, function _table_673(item, index) {
item.innerHTML = "";
item.setAttribute("rowType", "none")
}, lastUsed)
}, _convertToSafeObject: function _convertToSafeObject(entity) {
var safeEntity={};
for (var property in entity) {
if (entity.hasOwnProperty(property)) {
safeEntity[property] = toStaticHTML(entity[property])
}
}
return safeEntity
}, _renderGroupHeader: function _renderGroupHeader(groupName, elem) {
var headers=this._buildColumnHeaders(groupName);
elem.setAttribute("rowType", "header");
elem.setAttribute("row", toStaticHTML(groupName) || "none");
elem.appendChild(headers)
}, _renderEntityByColumnToRow: function _renderEntityByColumnToRow(entity, elem, index) {
var html="",
i,
colHtml=[],
colAria=[],
colRole=[];
var config=this._tableDefinition;
var len=config.columns.length;
var columns=config.columns;
if (!config.columnRenderer) {
throw"can not do simple binding";
}
entity = this._convertToSafeObject(entity);
elem.innerHTML = "";
for (i = 0; i < len; i++) {
var id=columns[i].ID.toLowerCase();
var columnRenderer=config.columnRenderer[id];
var results=columnRenderer(entity);
colHtml.push(results[0]);
colAria.push((results.length > 1 ? results[1].replace(/"/g, '') : ""));
colRole.push((results.length > 2 ? results[2] : "gridcell"))
}
for (var i=0; i < len; i++) {
var column=columns[i];
html += [column.openingHtml, " role=\"", colRole[i], "\"", " aria-label=\"", colAria[i], "\"", ">", colHtml[i], column.closingHtml].join("")
}
if (typeof index !== "undefined") {
elem.setAttribute("entity", index);
var rowType=(entity.index % 2 === 0) ? "odd" : "even";
elem.setAttribute("rowType", rowType)
}
elem.setAttribute("row", entity.group);
elem.setAttribute("role", "listitem");
elem.setAttribute("aria-label", colAria.join(","));
WinJS.Utilities.setInnerHTMLUnsafe(elem, html)
}, _renderEntityToRow: function _renderEntityToRow(entity, elem, index) {
var that=this;
var config=this._tableDefinition;
if (config.columnRenderer) {
return this._renderEntityByColumnToRow(entity, elem, index)
}
elem.innerHTML = "";
var len=config.columns.length;
var columns=config.columns;
if (typeof index !== "undefined") {
elem.setAttribute("entity", index);
var rowType=(entity.index % 2 === 0) ? "odd" : "even";
elem.setAttribute("rowType", rowType)
}
elem.setAttribute("row", entity.group);
var backingObject={};
var backingIndex=0;
var info=this._rowBackingInfo;
for (var i=0; i < len; i++) {
var column=columns[i];
var fields=column.boundField;
if (!fields.push) {
fields = [fields]
}
var backingMap=info[i];
var indexOffset=backingIndex;
var numFields=backingMap.length;
for (var fieldIndex=0; fieldIndex < numFields; fieldIndex++) {
var item=backingMap[fieldIndex];
if (typeof item === "undefined") {
continue
}
var key=fields[fieldIndex];
var value;
if (typeof key === "function") {
value = key
}
else if (key === CommonJS.Table.EntityToken) {
value = entity
}
else {
value = entity[key]
}
var boundFieldIndex=item + indexOffset;
backingObject["bf" + boundFieldIndex] = value;
backingIndex++
}
;
}
;
if (config.bindRow) {
WinJS.Utilities.setInnerHTMLUnsafe(elem, this._rowTemplate._element.innerHTML);
config.bindRow(elem, backingObject);
this._addColIndexes(elem)
}
else {
return this._rowTemplate.render(backingObject, elem).then(function _table_797() {
that._addColIndexes(elem)
})
}
}, _addColIndexes: function _addColIndexes(row) {
var rowChildNodes=row.childNodes;
for (var i=0, colContainer, rowChildNodesLength=rowChildNodes.length; i < rowChildNodesLength; i++) {
colContainer = rowChildNodes[i];
if (colContainer && colContainer.childNodes.length > 0) {
colContainer.firstChild.setAttribute("index", i)
}
}
}, _buildColumnHeaders: function _buildColumnHeaders(groupType) {
var def=this._tableDefinition;
var cols=def.columns;
var colDivs=[];
var columnInfo;
var outerContainer=document.createElement("div");
outerContainer.className = "table-group-header";
if (!this.isInlineGroup) {
this._groupHeader = outerContainer
}
var headerContainer=document.createElement("div");
var inline=groupType !== this._headerCSS;
headerContainer.className = "table-column-headers " + def.groupPosition.toLowerCase();
if (inline && def.showGroupHeaders) {
var groupText=document.createElement("div");
groupText.setAttribute("class", "group-text");
groupText.innerHTML = groupType;
outerContainer.appendChild(groupText)
}
outerContainer.appendChild(headerContainer);
var lastHeaderText=null;
for (var i=0, l=cols.length; i < l; i++) {
var c=cols[i];
var displayString=c.hideHeader ? "" : cols[i].headerText;
var pri=c.priority;
var id=c.ID;
columnInfo = this._manager.getColumnInfo(id);
var isSelected=this._selectedColumnHeader && (c.sortIdentifier === this._selectedColumnHeader.sortIdentifier);
var sc=isSelected ? this._selectedColumnSelectionCount : 0;
var selected=c.selected || isSelected;
var colOptions={
pri: pri, id: id, displayString: displayString, selected: selected, sortable: c.sortIdentifier, initialSortDirDesc: c.initialSortDirDesc, sortCount: sc, classSpecifier: c.classSpecifier, headerTemplate: c.headerTemplate
};
if (columnInfo && columnInfo.forceWidth) {
colOptions.width = columnInfo.width
}
if (i > 0 && (displayString || lastHeaderText)) {
var border=document.createElement("div");
border.className = "table-header-border";
border.setAttribute("priority", "P" + pri);
headerContainer.appendChild(border)
}
var col=this._buildColumnHeader(colOptions);
headerContainer.appendChild(col);
lastHeaderText = displayString
}
return outerContainer
}, _getSortDir: function _getSortDir(defaultDescending, iteration) {
var isSame=((iteration || 0) + (defaultDescending ? 1 : 0)) % 2;
var classes=[this._asc, this._desc];
return classes[isSame]
}, _getSortDirIdentifier: function _getSortDirIdentifier(defaultDescending, iteration) {
var isSame=((iteration || 0) + (defaultDescending ? 1 : 0)) % 2;
var classes=["Ascending", "Descending"];
return classes[isSame]
}, _setSelectedColumnHeader: function _setSelectedColumnHeader(elem, col) {
var children=elem.parentNode.querySelectorAll(".table-column-header");
var len=children.len;
for (var index=0; index < len; index++) {
var item=children[index];
WinJS.Utilities.removeClass(item, this._selected);
WinJS.Utilities.removeClass(item, this._asc);
WinJS.Utilities.removeClass(item, this._desc);
item.removeAttribute("aria-sort")
}
;
var isDesc=col.initialSortDirDesc;
var elemRow=elem;
while (elemRow && !WinJS.Utilities.hasClass(elemRow, "table-row")) {
elemRow = elemRow.parentNode
}
var groupLabel=elemRow && elemRow.getAttribute("row");
var previous=this._selectedColumnHeader;
if (previous) {
var rows=this._scroller.querySelectorAll("[column='" + previous.ID + "']");
for (var i=0, l=rows.length; i < l; i++) {
var row=rows[i];
if (row.parentNode && row.parentNode.getAttribute("sorted")) {
var rowElem=row;
while (rowElem && !WinJS.Utilities.hasClass(rowElem, "table-row")) {
rowElem = rowElem.parentNode
}
var rowLabel=rowElem && rowElem.getAttribute("row");
if (!groupLabel || !rowLabel || rowLabel === groupLabel) {
row.parentNode.removeAttribute("sorted")
}
}
}
}
var iteration=0;
if (previous && previous.sortIdentifier === col.sortIdentifier) {
iteration = this._selectedColumnSelectionCount + 1
}
var direction=this._getSortDir(isDesc, iteration);
WinJS.Utilities.addClass(elem, this._selected + " " + direction);
var ariaDirection=direction === this._desc ? "descending" : "ascending";
elem.setAttribute("aria-sort", ariaDirection);
this._selectedColumnHeader = col;
this._selectedColumnSelectionCount = iteration
}, _buildColumnHeader: function _buildColumnHeader(colOptions) {
var that=this;
var id=colOptions.id;
var displayString=colOptions.displayString;
var sortable=colOptions.sortable;
var isSelected=colOptions.selected;
var expander=document.createElement("div");
WinJS.Utilities.addClass(expander, "table-header-expander");
expander.setAttribute("priority", "P" + colOptions.pri);
var columnHeader=document.createElement("div");
expander.appendChild(columnHeader);
var additionalClassName=" " + (sortable ? this._sortable : "") + " " + (isSelected ? this._selected : "");
if (sortable) {
additionalClassName += " " + this._getSortDir(colOptions.initialSortDirDesc, colOptions.sortCount);
PlatformJS.Utilities.enablePointerUpDownAnimations(columnHeader)
}
if (colOptions.classSpecifier) {
additionalClassName += " " + colOptions.classSpecifier
}
columnHeader.setAttribute("column", id);
columnHeader.setAttribute("class", "table-column-header " + additionalClassName);
columnHeader.setAttribute("role", "columnheader");
columnHeader.setAttribute("tabindex", 0);
if (colOptions.width) {
columnHeader.style.width = colOptions.width
}
var previous=this._selectedColumnHeader;
if (colOptions.selected) {
var dir=this._getSortDir(colOptions.initialSortDirDesc, colOptions.sortCount);
var ariaDirection=dir === this._desc ? "descending" : "ascending";
columnHeader.setAttribute("aria-sort", ariaDirection);
columnHeader.setAttribute("selected", "selected")
}
var itemToRender={backingField0: displayString};
var template=new WinJS.Binding.Template(colOptions.headerTemplate);
template.render(itemToRender, columnHeader);
var onColClick=function(e) {
var item=e.currentTarget;
var colId=item.getAttribute("column");
if (!colId && item.children.length > 0) {
colId = item.children[0].getAttribute("column")
}
if (!colId) {
return
}
var def=that._tableDefinition.columns;
var col=null;
for (var i=0, l=def.length; i < l; i++) {
col = def[i];
if (col.ID === colId) {
break
}
}
if (that._manager && that._manager.getColumnInfo(colId)) {
if (col.sortIdentifier) {
that._setSelectedColumnHeader(item, col)
}
item.setAttribute("selected", "selected");
that._saveFocusedElement();
that.isNextColClick = true;
that._tableDefinition.onColumnHeaderClick(item, col, col.initialSortDirDesc)
}
};
var onColKeyUp=function(e) {
switch (e.keyCode) {
case 13:
onColClick(e);
break;
default:
break
}
};
expander.addEventListener("click", onColClick);
columnHeader.addEventListener("keydown", this._onColHeaderKeyDown.bind(this));
columnHeader.addEventListener("keyup", onColKeyUp);
return expander
}, _escapeDoubleQuotes: function _escapeDoubleQuotes(text) {
return text.replace("\"", "\\\"")
}, _buildSimpleRowTemplates: function _buildSimpleRowTemplates() {
var columns=this._tableDefinition.columns;
var lastHeaderText=null;
for (var index=0, l=columns.length; index < l; index++) {
var column=columns[index];
if (!column) {
continue
}
var text="";
var pri=column.priority;
var columnInfo=this._manager.getColumnInfo(column.ID);
var headerText=this._escapeDoubleQuotes(column.headerText);
var html="";
var closingHtml="";
if (index > 0 && (headerText || lastHeaderText)) {
html += "<div class=\"table-grid-border\" priority=\"P" + pri + "\"></div>"
}
html += ["<div class=\"table-grid-expander\" aria-label=\"", headerText, "\" priority=\"P", pri, "\" index=", index].join("");
if (this._selectedColumnHeader && (column.sortIdentifier === this._selectedColumnHeader.sortIdentifier)) {
html += " sorted=\"sorted\""
}
html += " >";
closingHtml += "</div>";
html += ["<div class=\"table-column ", (column.classSpecifier ? column.classSpecifier : ""), "\" column=\"", column.ID, "\" tabindex=\"-1\" "].join("");
if (columnInfo && columnInfo.forceWidth) {
html += [" style=\" width: ", columnInfo.width, ";\""].join("")
}
closingHtml += "</div>";
column.openingHtml = html;
column.closingHtml = closingHtml;
lastHeaderText = headerText
}
;
if (!this.hostContainer) {
this.hostContainer = this.host.parentNode
}
if (this.hostContainer && !this.hostContainer.onscroll) {
this.hostContainer.onscroll = this._onHostContainerScroll.bind(this)
}
}, _buildAggregateTemplate: function _buildAggregateTemplate() {
if (this._tableDefinition.columnRenderer) {
this._buildSimpleRowTemplates();
return
}
var columns=this._tableDefinition.columns;
var aggregateTemplate=[];
var numBF=0;
var backingFieldMap=[];
var columnInfo;
var lastHeaderText=null;
var gridBorder=document.createElement("div");
gridBorder.setAttribute("class", "table-grid-border");
for (var index=0, l=columns.length; index < l; index++) {
var column=columns[index];
if (!column || !column.fieldTemplate) {
continue
}
var pri=column.priority;
columnInfo = this._manager.getColumnInfo(column.ID);
var colTemplate=column.fieldTemplate.innerHTML;
var bfRegex=/backingField(\d+)/gi;
var result=bfRegex.exec(colTemplate);
backingFieldMap[index] = [];
var fIndex=0;
while (result) {
var str=result[0];
var bfIndex=parseInt(result[1]);
backingFieldMap[index][bfIndex] = fIndex++;
colTemplate = colTemplate.replace(new RegExp(str + "(?!\\d)", "g"), "bf" + numBF);
result = bfRegex.exec(colTemplate);
numBF++
}
var elem=document.createElement("div");
elem.setAttribute("class", "table-column " + (column.classSpecifier ? column.classSpecifier : ""));
elem.setAttribute("column", column.ID);
elem.setAttribute("role", "gridcell");
if (colTemplate.toLowerCase().indexOf("tabindex") === -1) {
elem.setAttribute("tabindex", "-1")
}
elem.setAttribute("aria-label", column.headerText);
if (columnInfo && columnInfo.forceWidth) {
elem.style.width = columnInfo.width
}
WinJS.Utilities.setInnerHTMLUnsafe(elem, colTemplate);
var container=document.createElement("div");
var headerText=column.headerText;
container.setAttribute("class", "table-grid-expander");
container.appendChild(elem);
container.setAttribute("aria-label", headerText);
container.setAttribute("priority", "P" + pri);
if (this._selectedColumnHeader && (column.sortIdentifier === this._selectedColumnHeader.sortIdentifier)) {
container.setAttribute("sorted", "sorted")
}
if (index > 0 && (headerText || lastHeaderText)) {
gridBorder.setAttribute("priority", "P" + pri);
aggregateTemplate.push(gridBorder.outerHTML)
}
aggregateTemplate.push(container.outerHTML);
lastHeaderText = headerText
}
;
var templateHtml=document.createElement("div");
templateHtml.setAttribute("data-win-control", "WinJS.Binding.Template");
WinJS.Utilities.setInnerHTMLUnsafe(templateHtml, aggregateTemplate.join(""));
WinJS.UI.processAll(templateHtml);
this._rowTemplate = new WinJS.Binding.Template(templateHtml);
this._rowBackingInfo = backingFieldMap;
if (!this.hostContainer) {
this.hostContainer = this.host.parentNode
}
if (this.hostContainer && !this.hostContainer.onscroll) {
this.hostContainer.onscroll = this._onHostContainerScroll.bind(this)
}
}, _onHostContainerScroll: function _onHostContainerScroll(evt) {
var scrollLeft=this.hostContainer.scrollLeft;
this.viewport.style[CommonJS.Table.MarginLeft] = this.tableMarginLeft + scrollLeft + "px";
this.viewport.scrollLeft = scrollLeft
}, _isInlineGroup: {get: function get() {
return this._tableDefinition ? this._tableDefinition.GroupPosition === CommonJS.groupPositionEnum.inline : false
}}, _itemClickProxyHandler: function _itemClickProxyHandler(element) {
return WinJS.Utilities.hasClass(element, "table-row")
}, _setRowAttributesAndHooks: function _setRowAttributesAndHooks(row, index) {
row.setAttribute("index", index);
if (this._tableDefinition.hasExpando) {
row.setAttribute("aria-expanded", false)
}
;
row.setAttribute("aria-label", STRINGS.ROW + " " + (index + 1));
if (!this._isTableCluster) {
row.setAttribute("id", "row" + "_" + (index + 1))
}
row.setAttribute("tabindex", 0);
if (!row.rowHooked) {
if (this._isRowClickable) {
PlatformJS.Utilities.registerItemClickProxy(row, this._itemClickProxyHandler, this._onRowClickedBind, {actionContext: "Table"});
PlatformJS.Utilities.enablePointerUpDownAnimations(row)
}
row.addEventListener("keydown", this._onRowKeyDownHandlerBind);
row.rowHooked = true
}
row.innerHTML = ""
}, _getContainer: function _getContainer(index) {
var row=this._containers[index];
this._setRowAttributesAndHooks(row, index);
row.parentNode.style.display = "block";
return row
}, _buildContainers: function _buildContainers(numItems, numGroups) {
var index,
container,
placeHolderTable,
row,
prevContainers,
oldTable,
content="";
if (this._isInlineGroup) {
numItems += numGroups
}
if (!this._containers) {
this._containers = []
}
if (numItems === this._containers.length) {
for (index = 0; index < numItems; index++) {
container = this._containers[index];
container.innerHTML = "";
container.removeAttribute("entity");
container.removeAttribute("row");
container.removeAttribute("rowType");
container.removeAttribute("id");
container.removeAttribute("aria-label");
container.removeAttribute("index")
}
return
}
for (index = 0; index < numItems; index++) {
content += "<div class='table-container'><div class='table-row' role='listitem'></div></div>"
}
placeHolderTable = this._createClassElement("div", this._cssPrefix + "table");
WinJS.Utilities.setInnerHTML(placeHolderTable, toStaticHTML(content));
prevContainers = this._containers;
this._containers = [];
for (index = 0; index < numItems; index++) {
row = placeHolderTable.children[index].children[0];
this._containers.push(row)
}
oldTable = this.table;
this._scroller.removeChild(this.table);
this._scroller.appendChild(placeHolderTable);
this.table = placeHolderTable;
oldTable.innerHTML = "";
if (prevContainers) {
for (index = 0; index < prevContainers.length; index++) {
row = prevContainers[index];
try {
row.removeEventListener("keydown", this._onRowKeyDownHandlerBind);
if (this._isRowClickable) {
PlatformJS.Utilities.disablePointerUpDownAnimations(row)
}
}
catch(err) {}
row.innerHTML = ""
}
;
}
}, _getExpando: function _getExpando(container) {
var results=container.parentNode.querySelectorAll(this._expandoQuerySelector);
if (results.length && results.length === 1) {
return results[0]
}
if (results.length === 0) {
return null
}
return results
}, _hideExpandoForContainer: function _hideExpandoForContainer(container, isCleanOperation) {
var expando=this._getExpando(container);
var row=expando.parentNode.querySelector(".table-row");
var entityIndex=parseInt(row.getAttribute("entity"));
if (isNaN(entityIndex)) {
throw"error, entityIndex is out of bounds";
}
WinJS.Utilities.removeClass(container, "row-expando");
expando.parentNode.removeChild(expando);
this.expandos.remove(expando);
if (isCleanOperation) {
return
}
var item=this._getItem(this.dataSource, entityIndex).data;
this._renderEntityToRow(item, row)
}, _createExpandoForContainer: function _createExpandoForContainer(container) {
var expando=document.createElement("div");
expando.setAttribute("class", this._cssPrefix + "expando expando-collapsed");
expando.style.maxWidth = container.clientWidth + "px";
var that=this;
var capturedPtr=null;
var onSwipe=function(evt) {
if (!evt.isVertical) {
that._suppressCapture = true;
expando.focus();
that.disablePointerCapture = true;
try {
expando.msSetPointerCapture(evt.pointer.pointerId)
}
catch(e) {}
;
}
};
var leave=function() {
that._suppressCapture = false
};
PlatformJS.Utilities.registerSwipeProxy(expando, onSwipe, null, leave);
WinJS.Utilities.addClass(container, "row-expando");
var expandoViewport=document.createElement("div");
expandoViewport.setAttribute("class", "table-expando-viewport");
expandoViewport.style.width = Math.min(container.clientWidth, window.innerWidth) + "px";
expandoViewport.style[CommonJS.Table.MarginLeft] = this.viewport.scrollLeft + "px";
expandoViewport.appendChild(expando);
if (!this.expandos) {
this.expandos = new CommonJS.Immersive.RealizedList
}
this.expandos.push(expandoViewport);
container.parentNode.appendChild(expandoViewport);
expandoViewport.addEventListener("keydown", function _table_1353(event) {
switch (event.keyCode) {
case WinJS.Utilities.Key.rightArrow:
this.scrollLeft += 50;
break;
case WinJS.Utilities.Key.leftArrow:
this.scrollLeft -= 50;
break;
case WinJS.Utilities.Key.pageDown:
this.scrollLeft += this.clientWidth;
event.preventDefault();
break;
case WinJS.Utilities.Key.pageUp:
this.scrollLeft -= this.clientWidth;
event.preventDefault();
break;
case WinJS.Utilities.Key.home:
this.scrollLeft = 0;
event.preventDefault();
break;
case WinJS.Utilities.Key.end:
this.scrollLeft = this.scrollWidth;
event.preventDefault();
break;
default:
break
}
});
return expando
}, _createClassElement: function _createClassElement(type, className, id) {
var obj=document.createElement(type);
if (className) {
obj.setAttribute("class", className)
}
if (id) {
obj.setAttribute("id", id)
}
return obj
}, _attachPreserveContext: function _attachPreserveContext(dom, event, fn) {
var that=this;
if (!fn) {
fn = "_on" + event[0].toUpperCase() + event.slice(1)
}
dom.addEventListener(event, function _table_1404() {
that[fn].apply(that, arguments)
})
}, _onScroll: function _onScroll(event) {
var that=this;
var viewport=this.viewport;
var scrollLeft=viewport.scrollLeft;
var oldScrollLeft=viewport.oldScrollLeft ? viewport.oldScrollLeft : 0;
var delta=scrollLeft - oldScrollLeft;
if (delta !== 0) {
viewport.oldScrollLeft = scrollLeft;
if (!this.isInlineGroup) {
this._groupHeader.style[CommonJS.Table.Left] = this.hostContainer.scrollLeft - scrollLeft + "px"
}
var expandoViewports=this.expandos;
for (var i=0, l=expandoViewports && expandoViewports.length; i < l; i++) {
var expandoViewport=expandoViewports.fromIndex(i);
expandoViewport.style[CommonJS.Table.MarginLeft] = scrollLeft + "px";
expandoViewport.scrollLeft += delta
}
}
var now=new Date;
if (this._isRenderComplete) {
return
}
if (now - this._lastScrollTime < 400) {
if (!this._scrollTimeout) {
this._scrollTimeout = setTimeout(function _table_1442() {
that._scrollTimeout = null;
that._onScroll.call(that, event)
}, 200)
}
return
}
this._lastScrollTime = now;
var scrollTop=viewport.scrollTop;
if (that._lastScrollFire > scrollTop) {
return
}
var elemHeight=this._elemOffsetHeight;
if (!elemHeight) {
this._elemOffsetHeight = viewport.offsetHeight;
elemHeight = this._elemOffsetHeight
}
var thresh=elemHeight / 4;
if (scrollTop - this._lastScrollFire < thresh) {
return
}
if (this._scrollTimeout) {
clearTimeout(this._scrollTimeout);
this._scrollTimeout = null
}
this._lastScrollFire = scrollTop;
if (this._approximateRenderedHeight - scrollTop < 4 * elemHeight) {
this._renderUIDelay = msSetImmediate(that._renderNextChunk.bind(that))
}
}, _render: function _render(entities){}, _buildHeader: function _buildHeader(div){}, _onColHeaderKeyDown: function _onColHeaderKeyDown(event) {
if (event.keyCode === WinJS.Utilities.Key.tab) {
if (event.shiftKey) {
this._setFocusOnPreviousCluster()
}
else {
this._setFocusOnNextCluster()
}
}
else if (PlatformJS.Utilities.isCursorKey(event.keyCode)) {
event.preventDefault();
event.stopPropagation();
switch (event.keyCode) {
case WinJS.Utilities.Key.rightArrow:
this._setFocusOnNextColHeader(event.target);
break;
case WinJS.Utilities.Key.downArrow:
this._setFocusOnFirstRow();
break;
case WinJS.Utilities.Key.leftArrow:
this._setFocusOnPreviousColHeader(event.target);
break;
default:
break
}
}
}, _onRowKeyDown: function _onRowKeyDown(event) {
var role=event.target.getAttribute("role");
if (role === "gridcell") {
this._onGridCellKeyDown(event)
}
else {
var keyCode=event.keyCode;
if (PlatformJS.Utilities.isCursorKey(event.keyCode) || WinJS.Utilities.Key.space === keyCode) {
event.preventDefault();
event.stopPropagation();
switch (keyCode) {
case WinJS.Utilities.Key.upArrow:
this._setFocusOnPreviousRow(event.target);
break;
case WinJS.Utilities.Key.rightArrow:
this._setFocusOnNextCluster();
break;
case WinJS.Utilities.Key.downArrow:
this._setFocusOnNextRow(event.target);
break;
case WinJS.Utilities.Key.leftArrow:
this._setFocusOnPreviousCluster();
break;
default:
break
}
}
}
}, _onGridCellKeyDown: function _onGridCellKeyDown(event) {
var keyCode=event.keyCode;
if (keyCode === WinJS.Utilities.Key.tab) {
if (event.shiftKey) {
this._setFocusOnPreviousCluster()
}
else {
this._setFocusOnGridcellContent(event.target) || this._setFocusOnNextCluster()
}
}
else if (PlatformJS.Utilities.isCursorKey(keyCode) || WinJS.Utilities.Key.space === keyCode) {
event.preventDefault();
event.stopPropagation();
switch (keyCode) {
case WinJS.Utilities.Key.upArrow:
this._setFocusOnColAbove(event.target);
break;
case WinJS.Utilities.Key.rightArrow:
this._setFocusOnNextCol(event.target);
break;
case WinJS.Utilities.Key.downArrow:
this._setFocusOnColBelow(event.target);
break;
case WinJS.Utilities.Key.leftArrow:
this._setFocusOnPreviousCol(event.target);
break;
default:
break
}
}
}, _setFocusOnFirstColHeader: function _setFocusOnFirstColHeader() {
var firstColHeader=this._header.querySelector("[tabIndex='0']");
if (firstColHeader) {
firstColHeader.focus()
}
}, _setFocusOnColHeader: function _setFocusOnColHeader(colHeaderIndex) {
var colHeaders=this._header.querySelectorAll("[role='columnheader']");
if (colHeaders.length > 0) {
colHeaders[colHeaderIndex].focus()
}
}, _setFocusOnFirstRow: function _setFocusOnFirstRow() {
var firstRow=this._scroller.querySelector("[tabIndex='0']");
if (firstRow) {
firstRow.focus()
}
}, _setFocusOnNextCluster: function _setFocusOnNextCluster() {
CommonJS.NavigableView.dispatchBoundaryEvent(this._element, CommonJS.NavigableView.Direction.RIGHT)
}, _setFocusOnPreviousCluster: function _setFocusOnPreviousCluster() {
CommonJS.NavigableView.dispatchBoundaryEvent(this._element, CommonJS.NavigableView.Direction.LEFT)
}, _setFocusOnColAbove: function _setFocusOnColAbove(currentCol) {
var colIndex=currentCol.getAttribute("index") || 0,
currentRow=this._getCurrentRow(currentCol),
rowAbove=this._getPreviousRow(currentRow);
if (rowAbove) {
var column=this._getCol(rowAbove, colIndex);
if (column) {
column.focus()
}
}
else {
this._setFocusOnColHeader(colIndex)
}
}, _setFocusOnColBelow: function _setFocusOnColBelow(currentCol) {
var currentRow=this._getCurrentRow(currentCol),
rowBelow=this._getNextRow(currentRow);
if (rowBelow) {
var colIndex=currentCol.getAttribute("index") || 0,
column=this._getCol(rowBelow, colIndex);
if (column) {
column.focus()
}
}
else {}
}, _setFocusOnCurrentRow: function _setFocusOnCurrentRow(currentCol) {
var success=false,
currentRow=this._getCurrentRow(currentCol);
if (currentRow) {
currentRow.focus();
success = true
}
return success
}, _setFocusOnNextRow: function _setFocusOnNextRow(currentRow) {
var nextRow=this._getNextRow(currentRow);
if (nextRow) {
nextRow.focus()
}
else {}
}, _setFocusOnPreviousRow: function _setFocusOnPreviousRow(currentRow) {
var previousRow=this._getPreviousRow(currentRow);
if (previousRow) {
previousRow.focus()
}
else {
this._setFocusOnFirstColHeader()
}
}, _setFocusOnNextColHeader: function _setFocusOnNextColHeader(currentCol) {
var nextCol=this._getNextCol(currentCol);
if (nextCol) {
nextCol.focus()
}
else {
this._setFocusOnNextCluster()
}
}, _setFocusOnPreviousColHeader: function _setFocusOnPreviousColHeader(currentCol) {
var previousCol=this._getPreviousCol(currentCol);
if (previousCol) {
previousCol.focus()
}
else {
this._setFocusOnPreviousCluster()
}
}, _setFocusOnNextCol: function _setFocusOnNextCol(currentCol) {
var nextCol=this._getNextCol(currentCol);
if (nextCol && nextCol.tabIndex >= 0) {
nextCol.focus()
}
else {
this._setFocusOnCurrentRow(currentCol)
}
}, _setFocusOnPreviousCol: function _setFocusOnPreviousCol(currentCol) {
var previousCol=this._getPreviousCol(currentCol);
if (previousCol && previousCol.tabIndex >= 0) {
previousCol.focus()
}
else {
this._setFocusOnCurrentRow(currentCol)
}
}, _setFocusOnGridcellContent: function _setFocusOnGridcellContent(col) {
var success=false;
if (col) {
var content=col.querySelector("[tabIndex='0']");
if (content) {
content.focus();
success = true
}
}
return success
}, _getCol: function _getCol(row, colIndex) {
var column=null,
columnContainer=null,
columns=row.childNodes;
if ((columns.length > 0) && (colIndex < columns.length)) {
columnContainer = columns[colIndex];
column = columnContainer.firstChild
}
return column
}, _getCurrentRow: function _getCurrentRow(currentCol) {
var element=currentCol;
while (element && element.getAttribute("role") !== "listitem") {
element = element.parentElement
}
return element
}, _getPreviousRow: function _getPreviousRow(currentRow) {
var previousRow=null,
previousRowContainer=null;
if (currentRow && currentRow.parentElement) {
previousRowContainer = currentRow.parentElement.previousElementSibling;
if (previousRowContainer && previousRowContainer.childNodes.length > 0) {
previousRow = previousRowContainer.firstChild
}
}
return previousRow
}, _getNextRow: function _getNextRow(currentRow) {
var nextRow=null,
nextRowContainer=null;
if (currentRow && currentRow.parentElement) {
nextRowContainer = currentRow.parentElement.nextElementSibling;
if (nextRowContainer && nextRowContainer.childNodes.length > 0) {
nextRow = nextRowContainer.firstChild
}
}
return nextRow
}, _getNextCol: function _getNextCol(currentCol) {
var nextCol=null,
nextColContainer=currentCol.parentElement.nextElementSibling;
if (nextColContainer && nextColContainer.childNodes.length > 0) {
nextCol = nextColContainer.firstChild
}
return nextCol
}, _getPreviousCol: function _getPreviousCol(currentCol) {
var previousCol=null,
previousColContainer=currentCol.parentElement.previousElementSibling;
if (previousColContainer && previousColContainer.childNodes.length > 0) {
previousCol = previousColContainer.firstChild
}
return previousCol
}
})
})
})();
CommonJS.Table.GroupPosition = {
top: "top", inline: "inline"
};
(function _tableDefinition_7() {
"use strict";
WinJS.Namespace.define("CommonJS.Table", {TableDefinition: WinJS.Class.define(function _tableDefinition_10(options) {
this.itemSpacing = {
min: 0, max: 0
};
this.groupPosition = CommonJS.Table.GroupPosition.inline;
this.showColumnHeaders = false;
this.showGroupHeaders = true;
this.columns = [];
this.groupTemplate = document.querySelector(".listHeaderTemplate")
}, {
itemSpacing: null, columns: null, groupPosition: null, groupTemplate: null, rowSpacing: null, showGroupHeaders: null, showColumnHeaders: null, isAutoSizeTable: false, cssAllowList: [], lastFilterOnRight: false, allowColumnDropping: false, expandColumns: false, isRowClickable: true
})})
})();
CommonJS.Table.GroupPosition = {
top: "top", inline: "inline"
};
(function _tableManager_7() {
"use strict";
WinJS.Namespace.define("CommonJS.Table", {TableManager: WinJS.Class.define(function _tableManager_14(container, tableDefinition, tableController) {
this.container = container;
this.tableDefinition = tableDefinition;
this._initalizeMarketAvgCharWidth();
this.attachListeners();
this.tableController = tableController;
this._rules = {};
this._calcWidths = {};
this._oldCalcWidths = {};
this._tableMarginLeft = null;
this._tableMarginRight = null;
this._columnsByPriority = []
}, {
disableUpdates: true, tableDefinition: null, container: null, _calcWidths: null, _oldCalcWidths: null, _layoutUpdatedDelay: null, _layoutUpdatedPtr: null, _elemOffsetHeight: null, _lastMeasuredWidth: null, _rules: null, _columnsByPriority: null, _sortIconWidth: 20, _avgMarketCharWidth: 8, _autoSizingPaddingLeft: 10, _autoSizingPaddingRight: 10, _multiplierForBoldText: 1.20, _tableGutterWidth: 2, _tableMarginLeft: null, _tableMarginRight: null, _isDisposed: false, attachListeners: function attachListeners() {
if (!this._layoutUpdatedPtr) {
this._layoutUpdatedPtr = this.onLayoutUpdated.bind(this);
if (this.container.attachEvent) {
this.container.attachEvent("onresize", this._layoutUpdatedPtr)
}
else {
this.container.addEventListener("mselementresize", this._layoutUpdatedPtr)
}
this.update(false, this.tableController && this.tableController.dataSource)
}
}, destroy: function destroy() {
if (this._isDisposed) {
return
}
;
this._isDisposed = true;
if (this._layoutUpdatedPtr) {
if (this.container.detachEvent) {
this.container.detachEvent("onresize", this._layoutUpdatedPtr)
}
else {
this.container.removeEventListener("mselementresize", this._layoutUpdatedPtr)
}
this._layoutUpdatedPtr = null
}
if (this._layoutUpdatedDelay) {
msClearImmediate(this._layoutUpdatedDelay);
this._layoutUpdatedDelay = null
}
CommonJS.deleteStyle(".table-row");
CommonJS.deleteStyle(".table-scroller .table-container");
if (this._columnsByPriority.length > 0) {
this._removePriorityRules();
this._columnsByPriority = []
}
this.container = null;
this.tableController = null
}, onLayoutUpdated: function onLayoutUpdated() {
var that=this;
if (this._layoutUpdatedDelay) {
return
}
this._layoutUpdatedDelay = msSetImmediate(function delayedLayoutUpdate() {
that._layoutUpdatedDelay = null;
if (that._isDisposed) {
return
}
var isLayoutChanged=that.update(false, that.tableController && that.tableController.dataSource);
if (!isLayoutChanged && that.tableDefinition && that.tableDefinition.lastFilterOnRight) {
that.placeLastFilterOnRight()
}
that._elemOffsetHeight = null;
that.tableController.delayedLayoutUpdated.call(that.tableController, isLayoutChanged)
})
}, update: function update(forceRecalcOfColumns, ds) {
if (!this.tableDefinition) {
return
}
msWriteProfilerMark("Ecv:tableManager:update:s");
var containerWidth=this._getContainerWidth();
if (!forceRecalcOfColumns) {
if (this._lastMeasuredWidth === containerWidth || this.disableUpdates) {
msWriteProfilerMark("Ecv:tableManager:update:skip");
return
}
}
this._lastMeasuredWidth = containerWidth;
var td=this.tableDefinition;
var columnRules=td.columns;
var totalWidth=containerWidth - 1;
var isLayoutChanged=false;
var i,
l,
col;
var oldCalcWidths=this._oldCalcWidths;
var calcWidths=this._calcWidths;
for (i = 0, l = columnRules.length; i < l; i++) {
col = columnRules[i];
var colID=col.ID;
var calcWidth=calcWidths[colID];
oldCalcWidths[colID] = calcWidth && calcWidth.domWidth && calcWidth.domWidth.width
}
var minRowWidth=this._getRowWidth(forceRecalcOfColumns, columnRules, td, ds);
if (minRowWidth > totalWidth) {
minRowWidth = this._getRowWidth(forceRecalcOfColumns, columnRules, td, ds, true);
if (minRowWidth > totalWidth) {
minRowWidth = this._getRowWidth(forceRecalcOfColumns, columnRules, td, ds, true, true)
}
}
if (td.allowColumnDropping) {
msWriteProfilerMark("Ecv:tableManager:update:dropColumns:s");
minRowWidth = this._dropColumns(forceRecalcOfColumns, totalWidth);
msWriteProfilerMark("Ecv:tableManager:update:dropColumns:e")
}
for (i = 0, l = columnRules.length; i < l; i++) {
col = columnRules[i];
var oldCalcWidth=oldCalcWidths[col.ID];
if (!oldCalcWidth || oldCalcWidth !== calcWidths[col.ID].domWidth.width) {
isLayoutChanged = true;
break
}
}
var isAutoStyle=this.tableDefinition.expandColumns && minRowWidth < totalWidth;
this._setTableMargin(minRowWidth, totalWidth, isAutoStyle);
var styleObj="width: " + minRowWidth + "px";
var autoStyleObj="width: auto";
CommonJS.addStyle(".table-row", isAutoStyle ? autoStyleObj : styleObj);
CommonJS.addStyle(".table-scroller .table-container", isAutoStyle ? autoStyleObj : styleObj);
this.tableController.scroller.style.width = isAutoStyle ? "auto" : minRowWidth + "px";
this.tableController.table.style.width = isAutoStyle ? "auto" : minRowWidth + "px";
var expandoViewports=this.tableController.expandos;
var currentWindowWidth=window.innerWidth;
for (i = 0, l = expandoViewports && expandoViewports.length; i < l; i++) {
var expandoViewport=expandoViewports.fromIndex(i);
expandoViewport.style.width = Math.min(currentWindowWidth, parseInt(expandoViewport.parentNode.currentStyle.width)) + "px"
}
if (isLayoutChanged && this.tableDefinition && this.tableDefinition.lastFilterOnRight) {
this.placeLastFilterOnRight()
}
msWriteProfilerMark("Ecv:tableManager:update:e");
return isLayoutChanged
}, _dropColumns: function _dropColumns(forceRecalcOfColumns, totalWidth) {
if (forceRecalcOfColumns || this._columnsByPriority.length === 0) {
msWriteProfilerMark("Ecv:tableManager:makePriorityRules:s");
this._makePriorityRules();
msWriteProfilerMark("Ecv:tableManager:makePriorityRules:e")
}
var columnRules=this._columnsByPriority;
var minRowWidth=0;
var lastHeaderText=null;
var expandColumns=this.tableDefinition.expandColumns;
for (var i=0, l=columnRules.length; i < l; i++) {
var col=columnRules[i];
var pri=col.priorityRule;
var width=parseInt(this.getColumnInfo(col.ID).width);
var thisColWidth=width + (i === 0 || (!col.headerText && !lastHeaderText) ? 0 : this._tableGutterWidth) + this._autoSizingPaddingLeft + this._autoSizingPaddingRight;
if ((minRowWidth + thisColWidth) < totalWidth || i === 0) {
pri.style.display = expandColumns ? "-ms-flexbox" : "inline-block";
minRowWidth += thisColWidth;
lastHeaderText = col.headerText
}
else {
pri.style.display = "none"
}
}
return minRowWidth
}, placeLastFilterOnRight: function placeLastFilterOnRight() {
var immersiveFilterBar=document.getElementById("immersiveFilterBar");
if (!immersiveFilterBar) {
return
}
var filterGroupsScroller=immersiveFilterBar.querySelector(".immersiveFilterGroupsScroller");
var filterGroupsContainer=filterGroupsScroller && filterGroupsScroller.firstChild;
if (filterGroupsContainer && this.tableController && this.tableController.table && this.tableController.header) {
var outsideWidth=filterGroupsScroller.offsetWidth;
var insideWidth=filterGroupsContainer.scrollWidth;
var tableWidth=parseFloat(this.tableController.table.style.width);
if (!tableWidth || isNaN(tableWidth)) {
return
}
var isLtr=(document.dir !== "rtl");
var tableLeft=this.tableController.header.currentStyle[isLtr ? "marginLeft" : "marginRight"];
var filterBarLeft=immersiveFilterBar.currentStyle[isLtr ? "left" : "right"];
var offsetDiff=parseFloat(tableLeft) - parseFloat(filterBarLeft);
var targetWidth=tableWidth + offsetDiff;
var targetWidthValid=targetWidth >= insideWidth;
var filterGroupsContainerHasChildren=filterGroupsContainer.children && filterGroupsContainer.children.length;
if (outsideWidth < insideWidth || !targetWidthValid || !filterGroupsContainerHasChildren) {
WinJS.Utilities.removeClass(filterGroupsContainer, "lastFilterGroupOnRight");
filterGroupsContainer.style.width = ""
}
else {
WinJS.Utilities.addClass(filterGroupsContainer, "lastFilterGroupOnRight");
filterGroupsContainer.style.width = targetWidth + "px"
}
}
}, getColumnWidth: function getColumnWidth(col, td, ds, forceAutoSize, forceWrap) {
var width=null;
var calcWidths=this._calcWidths[col.ID];
if ((!forceAutoSize && !td.isAutoSizeTable && !col.isAutoSizeColumn) || (forceAutoSize && !col.isTextFormat)) {
width = calcWidths.cssWidth;
if (!width) {
width = this._getColumnCSSWidth(col.ID)
}
if (width) {
calcWidths.cssWidth = width;
return {
width: calcWidths.cssWidth, forceWidth: false
}
}
}
var colCalcInfo=null;
if (forceWrap && col.canWrap) {
if (!calcWidths.wrapWidth) {
colCalcInfo = this._calcWrappingWidth(col, ds);
width = (Math.max(colCalcInfo.dataItemWidth, colCalcInfo.titleWidth + this._sortIconWidth)) * this._multiplierForBoldText;
calcWidths.wrapWidth = !calcWidths.autoSizingWidth || calcWidths.autoSizingWidth > width ? width : calcWidths.autoSizingWidth
}
return {
width: calcWidths.wrapWidth, forceWidth: true
}
}
if (!calcWidths.autoSizingWidth) {
colCalcInfo = this._calcMinWidthChar(col, ds);
width = (Math.max(colCalcInfo.dataItemWidth, colCalcInfo.titleWidth + this._sortIconWidth)) * this._multiplierForBoldText;
calcWidths.autoSizingWidth = !calcWidths.cssWidth || calcWidths.cssWidth > width ? width : calcWidths.cssWidth
}
return {
width: calcWidths.autoSizingWidth, forceWidth: true
}
}, getColumnInfo: function getColumnInfo(id) {
return this._calcWidths[id] && this._calcWidths[id].domWidth
}, _setColumnInfo: function _setColumnInfo(id, width, forceWidth) {
this._calcWidths[id].domWidth = {
width: width, forceWidth: forceWidth
}
}, _setTableMargin: function _setTableMargin(minRowWidth, totalWidth, isAutoStyle) {
var currentWindowWidth=window.innerWidth;
var marginLeft=CommonJS.Table.MarginLeft;
var marginRight=CommonJS.Table.MarginRight;
var table_viewport=this.tableController.viewport;
if (table_viewport) {
table_viewport.style.width = isAutoStyle ? "auto" : Math.min(minRowWidth, currentWindowWidth) + "px";
table_viewport.style[marginLeft] = "";
table_viewport.style[marginRight] = "";
this._tableMarginLeft = table_viewport.currentStyle[marginLeft];
this._tableMarginRight = table_viewport.currentStyle[marginRight];
var tableMarginLeft=parseInt(this._tableMarginLeft) || 0;
var tableMarginRight=parseInt(this._tableMarginRight) || 0;
var table_top_header=this.tableController.isInlineGroup ? null : this.tableController.header;
if (minRowWidth > totalWidth - tableMarginLeft - tableMarginRight) {
if (table_top_header) {
table_top_header.style[marginRight] = "0px"
}
table_viewport.style[marginRight] = "0px";
if (minRowWidth > totalWidth - tableMarginLeft) {
var whiteSpace=(totalWidth - minRowWidth) / 2;
if (whiteSpace > 0) {
if (table_top_header) {
table_top_header.style[marginRight] = whiteSpace + "px";
table_top_header.style[marginLeft] = whiteSpace + "px"
}
this.tableController.tableMarginLeft = whiteSpace;
table_viewport.style[marginRight] = whiteSpace + "px";
table_viewport.style[marginLeft] = whiteSpace + this.tableController.host.parentNode.scrollLeft + "px"
}
else {
if (table_top_header) {
table_top_header.style[marginLeft] = "0px"
}
this.tableController.tableMarginLeft = 0;
table_viewport.style[marginLeft] = this.tableController.host.parentNode.scrollLeft + "px"
}
}
else {
if (table_top_header) {
table_top_header.style[marginLeft] = this._tableMarginLeft
}
this.tableController.tableMarginLeft = parseInt(this._tableMarginLeft);
table_viewport.style[marginLeft] = parseInt(this._tableMarginLeft) + this.tableController.host.parentNode.scrollLeft + "px"
}
}
else {
if (table_top_header) {
table_top_header.style[marginLeft] = this._tableMarginLeft;
table_top_header.style[marginRight] = this._tableMarginRight
}
this.tableController.tableMarginLeft = parseInt(this._tableMarginLeft);
table_viewport.style[marginLeft] = parseInt(this._tableMarginLeft) + this.tableController.host.parentNode.scrollLeft + "px";
table_viewport.style[marginRight] = this._tableMarginRight
}
}
}, _getRowWidth: function _getRowWidth(forceRecalcOfColumns, columnRules, td, ds, forceAutoSize, forceWrap) {
var minRowWidth=0;
var lastHeaderText=null;
for (var i=0, l=columnRules.length; i < l; i++) {
var col=columnRules[i];
if (!this._calcWidths[col.ID]) {
this._calcWidths[col.ID] = {}
}
this._calcWidths[col.ID].domWidth = {};
if (forceRecalcOfColumns) {
this._calcWidths[col.ID].autoSizingWidth = null;
this._calcWidths[col.ID].wrapWidth = null
}
var colCalc=this.getColumnWidth(col, td, ds, forceAutoSize, forceWrap);
var thisColWidth=colCalc.width + (i === 0 || (!col.headerText && !lastHeaderText) ? 0 : this._tableGutterWidth) + this._autoSizingPaddingLeft + this._autoSizingPaddingRight;
this._setColumnInfo(col.ID, colCalc.width + "px", colCalc.forceWidth);
minRowWidth += thisColWidth;
lastHeaderText = col.headerText
}
return minRowWidth
}, _getCSSColumnRule: function _getCSSColumnRule(ruleText, requiredStyle) {
var column=ruleText.toLowerCase();
var that=this;
if (this._rules[column]) {
return this._rules[column]
}
var possibleRules=[];
var cssSheets=document.styleSheets;
var isStringInPartialList=function(partialMatchList, testString) {
testString = testString.toLowerCase();
for (var i=0; i < partialMatchList.length; i++) {
if (testString.indexOf(partialMatchList[i].toLowerCase()) > -1) {
return true
}
}
return false
};
var excludeList=["winjs", "immersive", "articlereader.css", "autosuggest.css", "dateselector.css", "mediaplayback.css", "slideshow.css"];
for (var sheetIndex=cssSheets.length - 1; sheetIndex >= 0; sheetIndex--) {
var sheet=cssSheets[sheetIndex];
if (sheet.href) {
var href=sheet.href.toLowerCase();
if (isStringInPartialList(excludeList, href)) {
continue
}
var allowList=this.tableDefinition.cssAllowList;
if (allowList && allowList.length > 0) {
if (!isStringInPartialList(allowList, href)) {
continue
}
}
}
var rules=sheet.cssRules;
for (var ruleIndex=0, ruleLength=rules.length; ruleIndex < ruleLength; ruleIndex++) {
var rule=rules[ruleIndex];
var selector=rule.selectorText;
if (!selector) {
continue
}
selector = selector.toLowerCase();
if (selector && selector.indexOf(column) >= 0) {
var selectorText=rule.selectorText;
var element=that.container.querySelector(selectorText);
if (element) {
if (requiredStyle && rule.style[requiredStyle].length === 0) {
continue
}
possibleRules.push(rule)
}
}
}
if (possibleRules.length > 0) {
break
}
}
if (possibleRules.length === 0) {
return null
}
if (possibleRules.length === 1) {
this._rules[column] = possibleRules[0];
return this._rules[column]
}
var bestCssSpecificity=0;
var bestRule=null;
for (var i=0; i < possibleRules.length; i++) {
var specificity=this._calcCssSpecificity(possibleRules[i]);
if (specificity > bestCssSpecificity) {
bestCssSpecificity = specificity;
bestRule = possibleRules[i]
}
}
this._rules[column] = bestRule;
return bestRule
}, _calcCssSpecificity: function _calcCssSpecificity(cssRule) {
return cssRule.selectorText.length
}, _getColumnsByPriority: function _getColumnsByPriority() {
var cols=this.tableDefinition.columns;
var len=cols.length;
this._columnsByPriority = [];
for (var i=0; i < len; i++) {
this._columnsByPriority.push(cols[i])
}
this._columnsByPriority.sort(function _tableManager_494(a, b) {
var dir=a.priority - b.priority;
return dir
});
return this._columnsByPriority
}, _makePriorityRules: function _makePriorityRules() {
var cols=this._getColumnsByPriority();
for (var i=0; i < cols.length; i++) {
var prop="[priority=P" + cols[i].priority + "]";
cols[i].priorityRule = this._makeCssProperty(prop, "display:inline-block", cols[i].ID)
}
}, _makeCssProperty: function _makeCssProperty(selector, cssValue, id) {
var selectorText=".ecv .table-container " + selector;
var exists=CommonJS.getStyle(selectorText);
if (exists) {
return exists
}
CommonJS.addStyle(selectorText, cssValue);
var rule=CommonJS._layoutStyleElem && CommonJS._layoutStyleElem.sheet.cssRules && CommonJS._layoutStyleElem.sheet.cssRules[0];
if (rule && rule.selectorText.indexOf(selectorText) < 0) {
rule = CommonJS.getStyle(selectorText)
}
this._rules[selector.toLowerCase()] = rule;
return rule
}, _removePriorityRules: function _removePriorityRules() {
var cols=this._columnsByPriority;
for (var i=0; i < cols.length; i++) {
var priorityRule=cols[i].priorityRule;
if (priorityRule) {
CommonJS.deleteStyle(priorityRule.selectorText)
}
}
}, _getColumnCSSWidth: function _getColumnCSSWidth(ID) {
var rule=this._getCSSColumnRule("[column=" + ID.toLowerCase() + "]", "width");
return this._getRuleWidth(rule)
}, _getRuleWidth: function _getRuleWidth(rule) {
if (rule) {
var width=parseInt(rule.style.width);
return width
}
else {
return 0
}
}, _getContainerWidth: function _getContainerWidth() {
var ctr=this.container;
var minWidth=100;
var width=minWidth;
var itemWidth=ctr.offsetWidth;
var isTooSmall=true;
while (isTooSmall) {
if (!ctr.parentNode) {
break
}
ctr = ctr.parentNode;
var ctrWidth=ctr.offsetWidth;
if (ctrWidth > minWidth) {
isTooSmall = false
}
width = ctrWidth
}
return width
}, _calcWrappingWidth: function _calcWrappingWidth(col, dataSource) {
var id=col.ID;
var maxWidth=0;
var maxItem="";
if (dataSource) {
for (var j=0; j < dataSource._list.length; j++) {
var item=dataSource._list.getItem(j);
if (item && item.data && item.data[id]) {
var dataItem=item.data[id];
var length=dataItem.length;
if (length <= maxWidth) {
continue
}
var nextBoundary=dataItem.indexOf(" ", length / 2);
var prevBoundary=dataItem.lastIndexOf(" ", length / 2);
var dataItemWidth=length;
if (prevBoundary !== -1 && nextBoundary !== -1) {
dataItemWidth = Math.min(Math.max(prevBoundary, length - 1 - prevBoundary), Math.max(nextBoundary, length - 1 - nextBoundary))
}
else if (prevBoundary === -1 && nextBoundary !== -1) {
dataItemWidth = Math.max(nextBoundary, length - 1 - nextBoundary)
}
else if (prevBoundary !== -1 && nextBoundary === -1) {
dataItemWidth = Math.max(prevBoundary, length - 1 - prevBoundary)
}
if (dataItemWidth > maxWidth) {
maxWidth = dataItemWidth;
maxItem = dataItem
}
}
}
}
var avgCharWidth=this._getAvgCharWidth(id);
var results={
id: id, title: col.headerText, titleWidth: col.headerText.length * avgCharWidth, dataItem: maxItem, dataItemWidth: maxWidth * avgCharWidth
};
return results
}, _calcMinWidthChar: function _calcMinWidthChar(col, dataSource) {
var id=col.ID;
var maxWidth=0;
var maxItem="";
if (col.maxAutoSizeLength) {
maxWidth = col.maxAutoSizeLength
}
else {
if (dataSource) {
for (var j=0; j < dataSource._list.length; j++) {
var item=dataSource._list.getItem(j);
if (item && item.data && item.data[id]) {
var dataItemWidth=item.data[id].length;
if (dataItemWidth > maxWidth) {
maxWidth = dataItemWidth;
maxItem = item.data[id]
}
}
}
}
}
var avgCharWidth=this._getAvgCharWidth(id);
var results={
id: id, title: col.headerText, titleWidth: col.headerText.length * avgCharWidth, dataItem: maxItem, dataItemWidth: maxWidth * avgCharWidth
};
return results
}, _getAvgCharWidth: function _getAvgCharWidth(columnID) {
return this._avgMarketCharWidth
}, _initalizeMarketAvgCharWidth: function _initalizeMarketAvgCharWidth() {
var width=PlatformJS.Services.resourceLoader.getString("/Platform/AverageMarketCharacterSizePx");
if (width) {
width = parseInt(width);
if (!isNaN(width) && width > 2 && width < 20) {
this._avgMarketCharWidth = width
}
}
}
})})
})()