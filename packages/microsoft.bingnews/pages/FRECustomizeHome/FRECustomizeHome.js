/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
WinJS.Namespace.define("NewsJS", {FRECustomizeHome: WinJS.Class.derive(NewsJS.NewsBasePage, function FRECustomizeHome_ctor(state) {
NewsJS.NewsBasePage.call(this, state);
if (!state) {
state = {}
}
state = JSON.parse(JSON.stringify(state));
var firstload=true;
if (state !== undefined && state.firstload !== undefined) {
firstload = state.firstload
}
if (firstload) {
state.firstload = false
}
this._pageState = state;
this.currentMarket = state.currentmarket || Platform.Globalization.Marketization.getCurrentMarket();
var tileContainer=document.getElementById("tileContainer");
if (tileContainer && tileContainer.winControl) {
this._tilesPanelControl = tileContainer.winControl;
this._onTileItemInvokeCallBack = this.onTileItemInvoke.bind(this);
this._tilesPanelControl.addEventListener("iteminvoked", this._onTileItemInvokeCallBack)
}
this._categoriesDataManager = NewsJS.Customization.getCategoriesDataManager()
}, {
_categoriesDataManager: null, _tilesPanelControl: null, _categoryData: null, _pageState: null, _categoriesDict: null, _numSelectedTiles: 0, _continueButton: null, currentMarket: null, _setContinueButtonState: function _setContinueButtonState(isEnabled) {
if (this._continueButton) {
var ctx={disabled: isEnabled};
WinJS.Binding.processAll(this._continueButton, ctx)
}
}, loadPageData: function loadPageData() {
var that=this;
this._categoriesDataManager.getDefaultAsync(this.currentMarket).then(function(categories) {
that._categoryData = {
categoryName: "Categories", categories: categories
};
if (that._categoryData && that._tilesPanelControl) {
that._tilesPanelControl.loadTileTemplatePromise.then(function() {
that.onContentReady()
})
}
else {
that._pageLoadFailed()
}
})
}, onContentReady: function onContentReady() {
this._categoriesDict = {};
this._numSelectedTiles = 0;
var categories=this._categoryData.categories;
for (var count=0; count < categories.length; count++) {
if (categories[count].data.id) {
categories[count].data.selected = categories[count].data.isPreselected;
if (categories[count].data.selected) {
this._numSelectedTiles++
}
this._categoriesDict[categories[count].data.id] = categories[count].data
}
}
if (this._tilesPanelControl) {
this._tilesPanelControl.isBrowse = false;
this._tilesPanelControl.dataSource = categories
}
var welcomeMessageDiv=document.getElementById("welcomeMessageHeading");
welcomeMessageDiv.innerText = PlatformJS.Services.resourceLoader.getString("FREWelcomeMessageHeading");
var welcomeMessageTextDiv=document.getElementById("welcomeMessageText");
welcomeMessageTextDiv.innerText = PlatformJS.Services.resourceLoader.getString("FREWelcomeMessageText");
this._continueButton = document.getElementById("continueButton");
if (this._continueButton) {
if (this._numSelectedTiles < 1) {
this._setContinueButtonState(true)
}
this._onButtonClickCallBack = this.onContinueClick.bind(this);
this._continueButton.addEventListener("click", this._onButtonClickCallBack)
}
CommonJS.disableAllEdgies(true);
this._pageLoadSucceeded()
}, onTileItemInvoke: function onTileItemInvoke(evt) {
var element=evt.detail.element,
tileId=evt.detail.id;
this.implementToggle(tileId, element)
}, implementToggle: function implementToggle(tileId, element) {
var item=this._categoriesDict[tileId];
if (item) {
var success=false;
WinJS.Utilities.toggleClass(element, 'selected');
item.selected = !item.selected;
if (!item.selected) {
if (--this._numSelectedTiles === 0) {
this._setContinueButtonState(true)
}
}
else {
if (++this._numSelectedTiles === 1) {
this._setContinueButtonState(false)
}
}
NewsJS.Telemetry.Customization.recordAddRemove(this.currentMarket, item, "Category", item.type)
}
}, onContinueClick: function onContinueClick(e) {
var selectedCategories=[];
var unSelectedCategories=[];
var categories=this._categoryData.categories;
for (var i=0; i < categories.length; i++) {
var currentCategory=categories[i];
if (currentCategory.data) {
var categoryId=currentCategory.data.id;
if (categoryId) {
var category=this._categoriesDict[categoryId];
if (category.selected) {
selectedCategories.push(category.cluster)
}
else {
unSelectedCategories.push(category.cluster.guid)
}
}
}
}
if (selectedCategories.length > 0) {
NewsJS.Customization.categoriesAdded = true
}
this._categoriesDataManager.updateManyAsync(selectedCategories, unSelectedCategories).then(function(success) {
console.log(success);
NewsJS.StateHandler.instance.isUserAlreadyWentThroughFRE = true;
NewsJS.Telemetry.Utilities.recordButtonClick("FRE Continue Button", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, e);
PlatformJS.Navigation.mainNavigator.returnHomeAndClearHistoryIfNecessary(true)
})
}, onNavigateAway: function onNavigateAway() {
if (this._tilesPanelControl) {
this._tilesPanelControl.removeEventListener("iteminvoked", this._onTileItemInvokeCallBack);
this._tilesPanelControl.dataSource = [];
this._tilesPanelControl.dispose()
}
if (this._continueButton) {
this._continueButton.removeEventListener("click", this._onButtonClickCallBack)
}
}, getPageState: function getPageState() {
return this._pageState
}, getPageData: function getPageData() {
this.loadPageData();
return WinJS.Promise.wrap({})
}
})})
})()