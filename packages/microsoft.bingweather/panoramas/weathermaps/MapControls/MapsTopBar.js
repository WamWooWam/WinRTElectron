/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
WinJS.Namespace.define("WeatherAppJS.Maps", {
MapsTopBar: WinJS.Class.define(function mapsTopBar_constructor(element, options) {
var that=this;
element = element || document.createElement("div");
element.winControl = this;
this._setOptions(options);
this._initConfigs();
this._init(element)
}, {
_domElement: null, _l1Bar: null, _l2Bar: null, _changeRegionList: null, _maps: [], _currentMap: null, _tempSelectedMap: null, _isShown: false, _l2Cache: [], _hideL2IfSingleItem: false, _promisesStack: [], _l1PagingBar: null, isMouseOver: false, _currentRegion: false, _setOptions: function _setOptions(options) {
var that=this;
that._maps = options.maps;
if (options.currentMap) {
that._currentMap = options.currentMap
}
else {
that._currentMap = that._maps[0]
}
that._tempSelectedMap = that._currentMap;
if (options.region) {
that._currentRegion = options.region
}
}, _initConfigs: function _initConfigs() {
var that=this;
that._hideL2IfSingleItem = PlatformJS.Services.appConfig.getBool("HideL2IfSingleItem", false)
}, _init: function _init(element) {
var that=this;
that._l2Cache = [];
that._domElement = element;
WinJS.Utilities.addClass(that._domElement, "WeatherMapsTopBar");
var template=that._buildSkeleton();
that._domElement.appendChild(template);
that._buildL1Bar();
that._buildL2Bar(that._currentMap.id);
that._buildChangeRegionList();
that._domElement.addEventListener("mouseover", that.mouseEventHandler.bind(that));
that._domElement.addEventListener("mouseout", that.mouseEventHandler.bind(that));
that._bindableMapsTopBarResizeFn = this.onMapsTopBarResize.bind(this);
CommonJS.WindowEventManager.addEventListener(CommonJS.WindowEventManager.Events.WINDOW_RESIZE, that._bindableMapsTopBarResizeFn, false)
}, onMapsTopBarResize: function onMapsTopBarResize() {
var barWidth=this._getMapTypesBarWidth();
this._l1PagingBar.drawLayout(barWidth)
}, _buildSkeleton: function _buildSkeleton() {
var tbContainer=document.createElement("div");
WinJS.Utilities.addClass(tbContainer, "WeatherMapsTopBarContainer");
var l1Bar=document.createElement("div");
WinJS.Utilities.addClass(l1Bar, "WeatherMapsL1Bar");
this._l1Bar = l1Bar;
var headerDiv=document.createElement("div");
var header=new CommonJS.Immersive.Header(headerDiv);
WinJS.Utilities.addClass(header, "WeatherMapsHeader immersiveHeader headerFontLight");
var typesContainer=document.createElement("div");
WinJS.Utilities.addClass(typesContainer, "WeatherMapTypesContainer");
var l2Bar=document.createElement("div");
WinJS.Utilities.addClass(l2Bar, "WeatherMapsL2Bar");
this._l2Bar = l2Bar;
var changeRegionList=document.createElement("div");
WinJS.Utilities.addClass(changeRegionList, "changeRegionList");
changeRegionList.style.display = "none";
this._changeRegionList = changeRegionList;
var subTypesContainer=document.createElement("div");
WinJS.Utilities.addClass(subTypesContainer, "WeatherMapSubTypesContainer");
l1Bar.appendChild(headerDiv);
l1Bar.appendChild(typesContainer);
l2Bar.appendChild(subTypesContainer);
tbContainer.appendChild(l1Bar);
tbContainer.appendChild(l2Bar);
tbContainer.appendChild(changeRegionList);
return tbContainer
}, _buildL1Bar: function _buildL1Bar() {
var that=this;
var mapTypesButtonContainer=that._domElement.querySelector(".WeatherMapTypesContainer");
var buttons=[];
var maps=that._getMapTypes();
for (var m in maps) {
var button=new WeatherAppJS.Maps.MapsL1BarButton(null, {map: maps[m]});
var buttonDiv=button.element;
buttonDiv.addEventListener("maptypeclicked", function mapsTopBar_onMapTypeClicked(event) {
var map=event.detail;
that._currentMap = map;
that._tempSelectedMap = map;
that._highlightL1Button(map.id);
var l2Bar=that._buildL2Bar(map.id);
that.showL2(l2Bar);
that.dispatchEvent("mapswitched", map)
});
buttons.push(button.element)
}
var barWidth=that._getMapTypesBarWidth();
var pagingTopBar=that._l1PagingBar = new WeatherAppJS.Maps.PagingTopBar(mapTypesButtonContainer, {
buttons: buttons, width: barWidth, buttonWidth: 130
});
return that._l1Bar
}, _buildL2Bar: function _buildL2Bar(typeId) {
var that=this;
typeId = typeId || "Temperature";
var mapSubTypesButtonContainer=that._getL2Cache(typeId);
if (mapSubTypesButtonContainer) {
return mapSubTypesButtonContainer
}
var maps=that._getMapsByType(typeId);
if (maps.length === 1 && that._hideL2IfSingleItem) {
that._cacheL2(typeId, null);
return null
}
mapSubTypesButtonContainer = document.createElement("div");
WinJS.Utilities.addClass(mapSubTypesButtonContainer, "WeatherMapSubTypesContainer");
for (var m in maps) {
var button=new WeatherAppJS.Maps.MapsL2BarButton(null, {map: maps[m]});
var buttonDiv=button.element;
mapSubTypesButtonContainer.appendChild(buttonDiv);
buttonDiv.addEventListener("mapsubtypeclicked", function mapsTopBar_onMapSwitched(event) {
that._currentMap = event.detail;
that._tempSelectedMap = that._currentMap;
that._highlightL2Button(that._currentMap.id, that._currentMap.subTypeId);
that.dispatchEvent("mapswitched", event.detail)
})
}
that._cacheL2(typeId, mapSubTypesButtonContainer);
return mapSubTypesButtonContainer
}, _buildChangeRegionList: function _buildChangeRegionList() {
var that=this;
var baseMapRegionsConfig=PlatformJS.Services.appConfig.getDictionary("BaseMapRegions");
for (var regionName in baseMapRegionsConfig) {
if (baseMapRegionsConfig.hasItem(regionName)) {
var regionData=JSON.parse(baseMapRegionsConfig[regionName].value);
var regionId=regionData.id;
var displayRegionId=regionData.displayId;
var resourceLoader=PlatformJS.Services.resourceLoader;
if (regionId !== 'World') {
var regionItemWrapper=document.createElement('div');
WinJS.Utilities.addClass(regionItemWrapper, "eachRegion");
regionItemWrapper.tabIndex = 0;
var regionItem=document.createElement('div');
var displayRegion=resourceLoader.getString(displayRegionId);
regionItem.innerText = displayRegion;
regionItemWrapper.addEventListener('click', (function(regionID) {
return function(evt) {
that.dispatchEvent("regionchanged", {region: regionID})
}
})(regionId));
regionItemWrapper.addEventListener('keydown', (function(regionID) {
return function(evt) {
if (evt.type === "keydown" && (evt.keyCode === WinJS.Utilities.Key.space || evt.keyCode === WinJS.Utilities.Key.enter)) {
that.dispatchEvent("regionchanged", {region: regionID})
}
}
})(regionId));
if (regionId === that._currentRegion) {
WinJS.Utilities.addClass(regionItemWrapper, "selectedRegion")
}
regionItemWrapper.appendChild(regionItem);
that._changeRegionList.appendChild(regionItemWrapper)
}
}
}
}, _getMapTypesBarWidth: function _getMapTypesBarWidth() {
var pageWidth=WinJS.Utilities.getTotalWidth(document.getElementById("platformPageArea"));
var barWidth=pageWidth - 95;
return barWidth
}, _cacheL2: function _cacheL2(typeId, l2Bar) {
var that=this;
var found=false;
for (var c in that._l2Cache) {
if (that._l2Cache[c].id === typeId) {
found = true;
break
}
}
if (found) {
that._l2Cache[c].l2 = l2Bar
}
else {
that._l2Cache.push({
id: typeId, l2: l2Bar
})
}
}, _getL2Cache: function _getL2Cache(typeId) {
var that=this;
for (var c in that._l2Cache) {
if (that._l2Cache[c].id === typeId) {
return that._l2Cache[c].l2
}
}
return null
}, _getMapTypes: function _getMapTypes() {
var that=this;
var maps=[];
for (var m in that._maps) {
var found=false;
for (var mm in maps) {
if (maps[mm].id === that._maps[m].id) {
found = true;
break
}
}
if (!found) {
maps.push(that._maps[m])
}
}
return maps
}, _getMapsByType: function _getMapsByType(typeId) {
var that=this;
var maps=[];
for (var m in that._maps) {
if (that._maps[m].id === typeId) {
maps.push(that._maps[m])
}
}
return maps
}, _getMapByTypeSubType: function _getMapByTypeSubType(typeId, subTypeId) {
var that=this;
var map=null;
for (var m in that._maps) {
if (that._maps[m].id === typeId && that._maps[m].subTypeId === subTypeId) {
map = that._maps[m]
}
}
return map
}, _highlightL1Button: function _highlightL1Button(typeId) {
var that=this;
var maps=that._getMapTypes();
var index=-1;
for (var m in maps) {
index++;
if (maps[m].id === typeId) {
break
}
}
var bIndex=-1;
var l1Buttons=that._l1Bar.querySelectorAll(".MapsL1BarButton");
for (var b in l1Buttons) {
bIndex++;
if (bIndex === index) {
WinJS.Utilities.addClass(l1Buttons[b], "selected")
}
else {
WinJS.Utilities.removeClass(l1Buttons[b], "selected")
}
}
}, _highlightL2Button: function _highlightL2Button(typeId, subTypeId) {
var that=this;
var index=-1;
var maps=that._getMapsByType(typeId);
for (var m in maps) {
index++;
if (maps[m].id === typeId && maps[m].subTypeId === subTypeId) {
break
}
}
var l2Buttons=that._l2Bar.querySelectorAll(".MapsL2BarButton");
var bIndex=-1;
for (var b in l2Buttons) {
bIndex++;
if (bIndex === index) {
WinJS.Utilities.addClass(l2Buttons[b], "selected")
}
else {
WinJS.Utilities.removeClass(l2Buttons[b], "selected")
}
}
}, _resetL2Selection: function _resetL2Selection() {
var that=this;
var l2Buttons=that._l2Bar.querySelectorAll(".MapsL2BarButton");
for (var b in l2Buttons) {
WinJS.Utilities.removeClass(l2Buttons[b], "selected")
}
}, isShown: {get: function get() {
return this._isShown
}}, show: function show() {
var that=this;
if (!that._isShown) {
var container=that._domElement.querySelector('.WeatherMapsTopBarContainer');
if (container) {
container.style.display = "-ms-grid";
that._l1PagingBar.setPage(that._l1PagingBar.currentPage);
var animPromise=WinJS.UI.Animation.fadeIn(container);
that._promisesStack.push(animPromise);
animPromise.then(function() {
that._highlightL1Button(that._currentMap.id);
that._isShown = true;
var l2Bar=that._getL2Cache(that._currentMap.id);
if (!l2Bar) {
that.hideL2()
}
else {
that.showL2(l2Bar)
}
})
}
}
}, hide: function hide() {
var that=this;
if (that._isShown) {
var container=that._domElement.querySelector('.WeatherMapsTopBarContainer');
if (container) {
var changeRegionButton=container.querySelector(".changeRegion");
var animPromise=WinJS.UI.Animation.fadeOut(container);
that._promisesStack.push(animPromise);
animPromise.then(function() {
if (container) {
container.style.display = "none";
that._isShown = false
}
if (that._changeRegionList) {
if (changeRegionButton) {
WinJS.Utilities.removeClass(changeRegionButton, "selected")
}
that._changeRegionList.style.display = "none"
}
})
}
}
}, mouseEventHandler: function mouseEventHandler() {
var that=this;
if (that.isMouseOver) {
that.isMouseOver = false
}
else {
that.isMouseOver = true
}
}, showL2: function showL2(newL2Bar) {
var that=this;
var l2=that._l2Bar;
that.hideL2();
if (newL2Bar) {
WinJS.Utilities.empty(l2);
l2.appendChild(newL2Bar);
l2.style.display = "block";
if (that._tempSelectedMap.id === that._currentMap.id) {
that._highlightL2Button(that._currentMap.id, that._currentMap.subTypeId)
}
else {
that._resetL2Selection()
}
}
}, hideL2: function hideL2() {
var l2=document.querySelector(".WeatherMapsL2Bar");
if (l2) {
l2.style.display = "none"
}
}, cleanUp: function cleanUp() {
WeatherAppJS.Utilities.Common.cleanupPromiseStack(this._promisesStack);
this._domElement.innerHTML = "";
this._maps = null;
this._l2Cache = null;
this._domElement.removeEventListener("mouseover", this.mouseEventHandler.bind(this));
this._domElement.removeEventListener("mouseout", this.mouseEventHandler.bind(this));
CommonJS.WindowEventManager.removeEventListener(CommonJS.WindowEventManager.Events.WINDOW_RESIZE, this._bindableMapsTopBarResizeFn, false);
this._bindableMapsTopBarResizeFn = null
}
}), PagingTopBar: WinJS.Class.define(function PagingTopBar_ctor(element, options) {
var that=this;
this.element = element || document.createElement("div");
this.element.winControl = this;
this._setOptions(options);
this._init(that.element)
}, {
width: null, buttonWidth: null, arrowWidth: null, buttons: null, _leftArrowContainer: null, _rightArrowContainer: null, _buttonsContainerElement: null, _buttonsContainerFullElement: null, _inAutoScroll: false, _isMouseOver: false, _pageIndicatorControl: null, _pageCount: null, pageCount: {
get: function get() {
return this._pageCount
}, set: function set(value) {
this._pageCount = value;
this._pageIndicatorControl.pageCount = value
}
}, _currentPage: null, currentPage: {
get: function get() {
return this._currentPage
}, set: function set(value) {
this._currentPage = value;
this._pageIndicatorControl.goto(value);
this._updateArrowVisibility()
}
}, _setOptions: function _setOptions(options) {
var that=this;
that.width = options.width;
that.buttonWidth = options.buttonWidth;
that.arrowWidth = options.arrowWidth ? options.arrowWidth : "20";
that.buttons = options.buttons
}, _init: function _init(element) {
var that=this;
that.element.style.width = that.width;
that.element.addEventListener("mouseover", this._onMouseOver.bind(this));
that.element.addEventListener("mouseout", this._onMouseOut.bind(this));
WinJS.Utilities.addClass(that.element, "PagingTopBarContainer");
var pageIndicator=document.createElement("div");
that._pageIndicatorControl = new WeatherAppJS.Maps.PageIndicator(pageIndicator);
var pagingTopBar=document.createElement("div");
WinJS.Utilities.addClass(pagingTopBar, "PagingTopBar");
var left=this._leftArrowContainer = document.createElement("div");
WinJS.Utilities.addClass(left, "PagingTopBarArrowContainer PagingTopBarLeftArrowContainer");
left.setAttribute("aria-label", PlatformJS.Services.resourceLoader.getString("/platform/scrollLeftAriaLabel"));
left.addEventListener("click", this._onClickLeft.bind(this));
var right=this._rightArrowContainer = document.createElement("div");
WinJS.Utilities.addClass(right, "PagingTopBarArrowContainer PagingTopBarRightArrowContainer");
right.setAttribute("aria-label", PlatformJS.Services.resourceLoader.getString("/platform/scrollRightAriaLabel"));
right.addEventListener("click", this._onClickRight.bind(this));
var buttonsContainer=that._buttonsContainerElement = document.createElement("div");
WinJS.Utilities.addClass(buttonsContainer, "PagingTopBarButtonsContainer");
buttonsContainer.addEventListener("scroll", this._onScroll.bind(this));
var buttonsContainerFull=that._buttonsContainerFullElement = document.createElement("div");
WinJS.Utilities.addClass(buttonsContainerFull, "PagingTopBarButtonsContainerFull");
for (var b in that.buttons) {
buttonsContainerFull.appendChild(that.buttons[b])
}
buttonsContainer.appendChild(buttonsContainerFull);
pagingTopBar.appendChild(left);
pagingTopBar.appendChild(buttonsContainer);
pagingTopBar.appendChild(right);
that.element.appendChild(pageIndicator);
that.element.appendChild(pagingTopBar);
that.element.appendChild(that._createChangeRegionButton());
that.drawLayout(that.width)
}, _createChangeRegionButton: function _createChangeRegionButton() {
var changeRegion=document.createElement('div');
WinJS.Utilities.addClass(changeRegion, "changeRegion");
var imageDiv=document.createElement("div");
WinJS.Utilities.addClass(imageDiv, "MapsTypeImage changeRegionIcon");
var titleDiv=document.createElement("div");
WinJS.Utilities.addClass(titleDiv, "MapsTypeTitle");
titleDiv.innerText = PlatformJS.Services.resourceLoader.getString('ChangeRegion');
changeRegion.appendChild(imageDiv);
changeRegion.appendChild(titleDiv);
changeRegion.addEventListener('click', this._onChangeRegionButtonClicked.bind(this), false);
changeRegion.addEventListener('keydown', this._onChangeRegionButtonClicked.bind(this), false);
changeRegion.tabIndex = 0;
changeRegion.id = "autoID_changeRegionButton";
return changeRegion
}, setPage: function setPage(pageNo) {
var that=this;
if (pageNo > that.pageCount) {
return
}
that._gotoWithoutAnimate(pageNo)
}, _gotoWithoutAnimate: function _gotoWithoutAnimate(pageNo) {
var that=this;
if (that._inAutoScroll) {
return
}
that.currentPage = pageNo;
that._scrollLeft = (pageNo - 1) * (that._pageWidth);
that._buttonsContainerElement.scrollLeft = that._scrollLeft
}, _goto: function _goto(pageNo) {
var that=this;
if (this._inAutoScroll) {
return
}
this.currentPage = pageNo;
this._scrollLeft = (pageNo - 1) * (this._pageWidth);
this._inAutoScroll = true;
var toValue=this._scrollLeft;
this._scrollAnimation = PlatformJS.Utilities.Transitions.applyTransitions(this._buttonsContainerElement, {
property: "scrollLeft", duration: 120, to: this._scrollLeft
});
this._scrollAnimation.done(function scroll_finished(e) {
that._inAutoScroll = false
}, function error_handler(e) {
that._inAutoScroll = false
})
}, drawLayout: function drawLayout(barWidth) {
var i,
container;
var pageWidth=barWidth - 2 * this.arrowWidth - 2 * 5 - 175;
var buttonWidth=this.buttonWidth;
var itemPerRow=Math.floor(pageWidth / buttonWidth);
var gap=0;
if (itemPerRow > 1) {
gap = Math.floor((pageWidth - (itemPerRow * buttonWidth)) / (itemPerRow - 1));
if (gap < 6) {
itemPerRow -= 1;
gap = Math.floor((pageWidth - (itemPerRow * buttonWidth)) / (itemPerRow - 1))
}
}
else {
gap = Math.floor(pageWidth - (itemPerRow * buttonWidth))
}
pageWidth = this._pageWidth = (buttonWidth + gap) * itemPerRow;
var gridColumnNum=1;
var totalSingleButtonSpace=this.buttons.length;
var button=null;
for (i = 0; i < this.buttons.length; i++) {
button = this.buttons[i].winControl;
button.element.style.msGridColumn = gridColumnNum++;
var rtl=(document.dir === "rtl");
if (!rtl) {
button.element.style.marginRight = (gap + "px");
button.element.style.marginLeft = ("0px")
}
else {
button.element.style.marginLeft = (gap + "px");
button.element.style.marginRight = ("0px")
}
}
var pageCount=Math.ceil(totalSingleButtonSpace / itemPerRow);
this.pageCount = pageCount;
container = this._buttonsContainerFullElement;
container.style.width = pageCount * pageWidth + "px";
container.style.msGridRows = "1fr";
container.style.msGridColumns = "(auto)(1fr)[{0}]".format(gridColumnNum - 1);
container.scrollLeft = 0;
this._buttonsContainerElement.style.msScrollSnapPointsX = "snapInterval(0px," + pageWidth + "px)";
this._scrollLeft = this._buttonsContainerElement.scrollLeft;
if (pageCount && pageCount > 1) {
this._buttonsContainerElement.style.overflowX = "auto";
this._buttonsContainerElement.style.overflowY = "hidden"
}
else {
this._buttonsContainerElement.style.overflowX = "hidden";
this._buttonsContainerElement.style.overflowY = "hidden"
}
this._goto(1)
}, _onClickLeft: function _onClickLeft(evt) {
this._goto(this.currentPage - 1)
}, _onClickRight: function _onClickRight(evt) {
this._goto(this.currentPage + 1)
}, _onChangeRegionButtonClicked: function _onChangeRegionButtonClicked(evt) {
var setFocus=false;
if (evt.type === "keydown" && (evt.keyCode !== WinJS.Utilities.Key.space && evt.keyCode !== WinJS.Utilities.Key.enter)) {
return
}
if (evt.type === "keydown") {
setFocus = true
}
var changeRegionList=document.querySelector('.changeRegionList');
var changeRegionButton=document.querySelector('.changeRegion');
if (changeRegionList) {
var displayAttr=changeRegionList.style.display;
if (displayAttr === "none") {
changeRegionList.style.display = "block";
if (changeRegionButton) {
WinJS.Utilities.addClass(changeRegionButton, "selected")
}
if (setFocus) {
changeRegionList.firstChild.focus()
}
}
else {
if (changeRegionButton) {
WinJS.Utilities.removeClass(changeRegionButton, "selected")
}
changeRegionList.style.display = "none"
}
}
}, _onMouseOver: function _onMouseOver(evt) {
this._isMouseOver = true;
this._updateArrowVisibility()
}, _onMouseOut: function _onMouseOut(evt) {
this._isMouseOver = false;
this._updateArrowVisibility()
}, _onScroll: function _onScroll(evt) {
var newPage;
var scrollLeft=this._buttonsContainerElement.scrollLeft;
var deltaHoriz=scrollLeft - this._scrollLeft;
if (deltaHoriz !== 0) {
this._scrollLeft = scrollLeft;
newPage = Math.round(this._scrollLeft / this._pageWidth) + 1;
if (newPage !== this.currentPage) {
this.currentPage = newPage
}
}
}, _updateArrowVisibility: function _updateArrowVisibility() {
this._updateLeftArrowVisibility();
this._updateRightArrowVisibility()
}, _updateLeftArrowVisibility: function _updateLeftArrowVisibility() {
if (this._isMouseOver) {
if (this.currentPage === 1) {
this._leftArrowContainer.style.visibility = "hidden"
}
else {
this._leftArrowContainer.style.visibility = ""
}
}
else {
this._leftArrowContainer.style.visibility = "hidden"
}
}, _updateRightArrowVisibility: function _updateRightArrowVisibility() {
if (this._isMouseOver) {
if (this.currentPage === this.pageCount) {
this._rightArrowContainer.style.visibility = "hidden"
}
else {
this._rightArrowContainer.style.visibility = ""
}
}
else {
this._rightArrowContainer.style.visibility = "hidden"
}
}
}), PageIndicator: WinJS.Class.define(function PageIndicator_ctor(element, options) {
var that=this;
that.element = element || document.createElement("div");
that.element.winControl = this;
that._setOptions(options);
that._init(that.element)
}, {
_paginationElement: null, _currentPage: null, currentPage: {
get: function get() {
return this._currentPage
}, set: function set(value) {
if (this._currentPage !== value) {
this._currentPage = value;
this.goto(value)
}
}
}, _pageCount: null, pageCount: {
get: function get() {
return this._pageCount
}, set: function set(value) {
if (this._pageCount !== value) {
this._pageCount = value;
this._reInit()
}
}
}, _setOptions: function _setOptions(options) {
var that=this;
that._currentPage = (options && options.currentPage) ? options.currentPage : 1;
that._pageCount = (options && options.pageCount) ? options.pageCount : 1
}, _init: function _init(element) {
var that=this;
WinJS.Utilities.addClass(that.element, "PageIndicator");
var paginationDiv=that._paginationElement = document.createElement("div");
WinJS.Utilities.addClass(paginationDiv, "pagination");
that.element.appendChild(paginationDiv);
paginationDiv.style.msGridColumns = "(auto)(1fr)[{0}]".format(that.pageCount);
var pageIndicatorContainer=document.createElement("div");
for (var i=0; i < that.pageCount; i++) {
var bar=document.createElement("div");
bar.style.msGridColumn = i + 1;
paginationDiv.appendChild(bar)
}
if (that.pageCount <= 1) {
that.element.style.visibility = "hidden"
}
else {
that.element.style.visibility = ""
}
}, _reInit: function _reInit() {
var that=this;
that.element.innerHTML = "";
that._init(that.element)
}, reset: function reset() {
this.goto(1)
}, goto: function goto(pageNo) {
var that=this;
that.currentPage = pageNo;
var currentBar=that._paginationElement.querySelector(".pageOn");
if (currentBar) {
WinJS.Utilities.removeClass(currentBar, "pageOn")
}
var children=that._paginationElement.childNodes;
var newPage=that.currentPage;
var curr=children[newPage - 1];
if (curr) {
WinJS.Utilities.addClass(curr, "pageOn")
}
}
}), MapsL1BarButton: WinJS.Class.define(function mapsL1BarButton_constructor(element, options) {
var that=this;
that.element = element || document.createElement("div");
that.element.winControl = this;
this._setOptions(options);
this._init(that.element)
}, {
_domElement: null, _map: null, _setOptions: function _setOptions(options) {
var that=this;
that._map = options.map
}, _init: function _init(element) {
var that=this;
that._domElement = element;
WinJS.Utilities.addClass(that._domElement, "MapsL1BarButton");
that._domElement.tabIndex = 0;
var addlClass="icon{0}MapType".format(that._map.id);
var imageDiv=document.createElement("div");
WinJS.Utilities.addClass(imageDiv, "MapsTypeImage");
WinJS.Utilities.addClass(imageDiv, addlClass);
var titleDiv=document.createElement("div");
WinJS.Utilities.addClass(titleDiv, "MapsTypeTitle");
titleDiv.innerText = PlatformJS.Services.resourceLoader.getString(that._map.id + 'Map').toUpperCase();
that._domElement.appendChild(imageDiv);
that._domElement.appendChild(titleDiv);
that._domElement.id = "autoID_" + that._map.id;
that._domElement.addEventListener("click", that._handleButtonClick.bind(that), true);
that._domElement.addEventListener("keydown", that._handleButtonClick.bind(that), true)
}, _handleButtonClick: function _handleButtonClick(event) {
if (event && (event.type === "click" || (event.type === "keydown" && (event.keyCode === WinJS.Utilities.Key.enter || event.keyCode === WinJS.Utilities.Key.space)))) {
this.dispatchEvent("maptypeclicked", this._map)
}
}
}), MapsL2BarButton: WinJS.Class.define(function mapsL1BarButton_constructor(element, options) {
var that=this;
element = element || document.createElement("div");
element.winControl = this;
this._setOptions(options);
this._init(element)
}, {
_domElement: null, _map: null, element: {get: function get() {
return this._domElement
}}, _setOptions: function _setOptions(options) {
var that=this;
that._map = options.map
}, _init: function _init(element) {
var that=this;
that._domElement = element;
WinJS.Utilities.addClass(that._domElement, "MapsL2BarButton");
that._domElement.tabIndex = 0;
var iconDiv=document.createElement("div");
WinJS.Utilities.addClass(iconDiv, "checkMarkContainer");
var iconSpan=document.createElement("span");
WinJS.Utilities.addClass(iconSpan, "checkGlyph");
iconDiv.appendChild(iconSpan);
var titleDiv=document.createElement("div");
WinJS.Utilities.addClass(titleDiv, "MapsTypeTitle");
titleDiv.innerText = PlatformJS.Services.resourceLoader.getString(that._map.subTypeId + "MapSubType");
that._domElement.appendChild(iconDiv);
that._domElement.appendChild(titleDiv);
that._domElement.id = "autoID_" + that._map.subTypeId;
that._domElement.addEventListener("click", that._handleButtonClick.bind(that), true);
that._domElement.addEventListener("keydown", that._handleButtonClick.bind(that), true)
}, _handleButtonClick: function _handleButtonClick(event) {
if (event && (event.type === "click" || (event.type === "keydown" && (event.keyCode === WinJS.Utilities.Key.enter || event.keyCode === WinJS.Utilities.Key.space)))) {
this.dispatchEvent("mapsubtypeclicked", this._map)
}
}
})
});
WinJS.Class.mix(WeatherAppJS.Maps.MapsTopBar, WinJS.Utilities.createEventProperties("mapswitched"), WinJS.UI.DOMEventMixin);
WinJS.Class.mix(WeatherAppJS.Maps.MapsTopBar, WinJS.Utilities.createEventProperties("regionchanged"), WinJS.UI.DOMEventMixin);
WinJS.Class.mix(WeatherAppJS.Maps.MapsL1BarButton, WinJS.Utilities.createEventProperties("maptypeclicked"), WinJS.UI.DOMEventMixin);
WinJS.Class.mix(WeatherAppJS.Maps.MapsL2BarButton, WinJS.Utilities.createEventProperties("mapsubtypeclicked"), WinJS.UI.DOMEventMixin)
})()