/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
WinJS.Namespace.define("NewsJS", {SelectionPage: WinJS.Class.derive(NewsJS.NewsBasePage, function SelectionPage_ctor(state) {
if (!state) {
state = {}
}
state = JSON.parse(JSON.stringify(state));
state.features = state.features || ["Sources", "International", "Local"];
state.mode = state.mode || "Source";
state.isBrowse = state.isBrowse !== false ? true : false;
state.title = state.title || PlatformJS.Services.resourceLoader.getString("BrowseSourceTile");
state.guid = state.guid || "MySources";
this._state = state;
NewsJS.NewsBasePage.call(this, state);
this._state.sourcesMarket = state.sourcesMarket;
this._state.currentMarket = this._state.currentMarket || Platform.Globalization.Marketization.getCurrentMarket();
this._state.rightPanelScrollLeft = this._state.rightPanelScrollLeft || 0;
this._state.rightPanelScrollTop = this._state.rightPanelScrollTop || 0;
var root=document.getElementById("platformMainContent");
if (root && this._state.currentMarket) {
root.lang = PlatformJS.Utilities.convertMarketToLanguageCode(this._state.currentMarket)
}
var browseboxGhostText,
addboxGhostText,
addSourceboxGhostText;
this.dataProvider = new NewsJS.Customization.SelectionPageProvider({
mode: state.mode, isBrowse: state.isBrowse, features: state.features, title: state.title, guid: state.guid, appMarket: Platform.Globalization.Marketization.getCurrentMarket()
});
var that=this;
WinJS.Application.oncheckpoint = function(args) {
that.dataProvider.commitItems()
};
this._state.enableSearch = true;
this._state.enableMarketSelector = true;
this._state.enableTabs = true;
browseboxGhostText = CommonJS.resourceLoader.getString("TypeASource");
addboxGhostText = CommonJS.resourceLoader.getString("TypeSourceTopicOrRSS");
addSourceboxGhostText = CommonJS.resourceLoader.getString("TypeSourceOrRSS");
this._tileContainerEl = document.querySelector(".tileContainer");
var headerControl=PlatformJS.Utilities.getControl("filterBar");
if (headerControl) {
headerControl.headerTitleText = this._state.title
}
this._searchBox = document.getElementById("searchBox");
this._searchBoxPlaceHolder = document.getElementById("placeHolder");
if (this._searchBoxPlaceHolder) {
if (this._state.searchQuery) {
this._searchBoxPlaceHolder.style.display = "none"
}
if (this._state.isBrowse) {
this._searchBoxPlaceHolder.innerText = browseboxGhostText
}
else if (this._state.mode === "Source") {
this._searchBoxPlaceHolder.innerText = addSourceboxGhostText
}
else {
this._searchBoxPlaceHolder.innerText = addboxGhostText
}
}
this._onKeyDownHandler = this._onKeyDown.bind(this);
this._onMouseUpHandler = this._onMouseUp.bind(this);
this._onBlurHandler = this._onBlur.bind(this);
this._onSearchButtonClickHandler = this._onSearchButtonClick.bind(this);
this._onInputHandler = this._onInput.bind(this);
if (this._searchBox && this._searchBoxPlaceHolder && this._state.enableSearch) {
this._searchBox.addEventListener("input", this._onInputHandler);
this._lookupItem = function(key) {
var features=that._state.features;
if (Array.isArray(features)) {
if ((features.indexOf("Sources") > -1 || features.indexOf("Categories") > -1 || features.indexOf("International") > -1) && that._sourcesDictionary && that._sourcesDictionary[key]) {
return WinJS.Promise.wrap(that._sourcesDictionary[key])
}
else if (features.indexOf("Topics") > -1) {
return that.dataProvider.createSearchItemData(key, Platform.Globalization.Marketization.getCurrentMarket())
}
}
else {
return WinJS.Promise.wrap({})
}
};
this._initializeAutoSuggest(this._lookupItem)
}
var features=this._state.features;
if (!this._state.enableSearch) {
var searchHost=document.getElementById("searchHost");
WinJS.Utilities.addClass(searchHost, "hiddenCat")
}
if (!this._state.enableMarketSelector) {
var filterHost=document.getElementById("filterHost");
WinJS.Utilities.addClass(filterHost, "hiddenCat")
}
if (!this._state.enableTabs) {
var leftPanel=document.getElementById("leftPanel");
WinJS.Utilities.addClass(leftPanel, "noLeftPanel")
}
var tileContainer=document.getElementById("tileContainer");
if (tileContainer && tileContainer.winControl) {
this._tilesPanelControl = tileContainer.winControl;
this._onTileItemInvokeCallBack = this.onTileItemInvoke.bind(this);
this._tilesPanelControl.addEventListener("iteminvoked", this._onTileItemInvokeCallBack)
}
var categoriesTabs=document.getElementById("categoriesTabs");
if (categoriesTabs && categoriesTabs.winControl) {
this._categoriesTabs = categoriesTabs.winControl;
this._onCategoryChangeCallBack = this._onCategoryChange.bind(this);
this._categoriesTabs.addEventListener("itemselected", this._onCategoryChangeCallBack)
}
PlatformJS.platformInitializedPromise.then(function _startLazyLoad() {
WinJS.UI.Fragments.renderCopy("/bingDaily/lazyBingDaily.html").then(function(){})
})
}, {
_lookupItem: null, _type: null, _loaded: false, _tileContainerEl: null, _categories: null, _categoriesTabs: null, _tilesPanelControl: null, _topicResults: null, _sourcesDictionary: null, _sourcesList: null, _onInputHandler: null, _onKeyDownHandler: null, _onMouseUpHandler: null, _onBlurHandler: null, _onSearchButtonClickHandler: null, _onInput: function _onInput() {
if (this._searchBox.value.length !== 0) {
this._searchBoxPlaceHolder.style.display = "none"
}
else {
this._searchBoxPlaceHolder.style.display = ""
}
}, _onKeyDown: function _onKeyDown(enter) {
if (event.key === "Enter" && !this.autoSuggest._inIME) {
this._onSearchEntered(this._searchBox.value, this._lookupItem)
}
}, _onMouseUp: function _onMouseUp() {
var that=this;
var clear=true;
if (this._searchBox.value === "") {
clear = false
}
setImmediate(function() {
if (that._searchBox.value === "" && clear) {
that._clearSearch()
}
})
}, _onBlur: function _onBlur() {
if (this._searchBox.value === "") {
this._clearSearch()
}
}, _onSearchButtonClick: function _onSearchButtonClick() {
this._onSearchEntered(this._searchBox.value, this._lookupItem)
}, backingData: null, backingDataDict: null, searchDataDict: null, allLocationData: null, locationsDict: null, localSourcesCategoryKey: null, first: null, categoryFeaturedAdded: null, mainSectionMoved: null, isHomeMarket: false, onContentReady: function onContentReady(content) {
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
this._categories = [];
this._localTabData = {};
this._showLocalTab = false;
this.searchResultsData = [];
this.searchDataDict = {};
this.backingData = content;
this.backingDataDict = {};
this.allLocationData = [];
this.locationsDict = {};
var sourcesFeedMarket=NewsJS.Globalization.getMarketStringForSources();
if (content) {
this.isHomeMarket = this._state.sourcesMarket && sourcesFeedMarket === this._state.sourcesMarket.toUpperCase();
var localSourcesTileTitle=PlatformJS.Services.resourceLoader.getString("LocalSourcesTileTitle");
for (var categoryKey in content) {
if (categoryKey === NewsJS.Customization.SelectionPageProvider.LOCATIONS_IN_MARKET_TAG) {
var locationData=content[categoryKey];
if (locationData && locationData.length && locationData.length > 0) {
this._showLocalTab = true;
this.allLocationData[0] = locationData;
for (var cntLocation=0; cntLocation < locationData.length; ++cntLocation) {
this.locationsDict[locationData[cntLocation].name] = locationData[cntLocation]
}
}
continue
}
else if (categoryKey === localSourcesTileTitle) {
this.localSourcesCategoryKey = categoryKey;
continue
}
this._parseDataForCategoryList(content, categoryKey)
}
}
if (this._showLocalTab && this.localSourcesCategoryKey) {
this._categories.splice(1, 0, this.localSourcesCategoryKey)
}
if (this._tilesPanelControl) {
this._tilesPanelControl.dataSource = []
}
this.first = this.first || (this._categories ? this._categories[0] : null);
this.firstCategory = this.first;
if (this._state.enableSearch) {
this._buildSearch();
this._setSearchState();
if (this._searchBox && this._searchBox.value.length > 0) {
this._getSearchResult(this._searchBox.value, this._lookupItem)
}
else if (this._categoriesTabs) {
this._categoriesTabs.dataSource = this._categories
}
}
else if (this._categoriesTabs) {
this._categoriesTabs.dataSource = this._categories
}
this._setInitialCategory();
CommonJS.disableAllEdgies(false);
this._loaded = true;
this.first = null
}, appWentOnline: function appWentOnline() {
this._refreshPage()
}, _parseDataForCategoryList: function _parseDataForCategoryList(content, categoryKey) {
var data=content[categoryKey];
if (data && data.length > 0) {
var list=content[categoryKey];
if (categoryKey === PlatformJS.Services.resourceLoader.getString("Featured").toLowerCase()) {
this._categories.unshift(categoryKey);
this.categoryFeaturedAdded = true;
this.first = categoryKey
}
else if (Array.isArray(list) && list.length > 0 && list[0] && list[0].data && list[0].data.type && list[0].data.type === "marketCluster") {
if (this.isHomeMarket) {
this.mainSectionMoved = true;
if (this.categoryFeaturedAdded) {
this._categories.splice(1, 0, categoryKey)
}
else if (this._showLocalTab) {
this._categories.splice(2, 0, categoryKey)
}
else {
this._categories.unshift(categoryKey);
this.first = categoryKey
}
}
}
else if (Array.isArray(list) && list.length > 0 && list[0] && list[0].data && list[0].data.type && list[0].data.type === "InternationalBingDaily") {
NewsJS.SelectionPage.SEARCH_RESULTS_INTERNATIONAL_EDITIONS = this.internationalCategoryKey = categoryKey;
if (this.isHomeMarket) {
var pos=this.categoryFeaturedAdded ? (this._showLocalTab ? 2 : 1) : 0;
pos += this.mainSectionMoved ? (this._showLocalTab ? 2 : 1) : 0;
if (pos > 0) {
this._categories.splice(pos, 0, categoryKey)
}
else {
this._categories.unshift(categoryKey);
this.first = categoryKey
}
}
}
else {
this._categories.push(categoryKey)
}
for (var j=0; j < data.length; j++) {
if (data[j] && data[j].data) {
this.backingDataDict[data[j].data.id] = data[j].data
}
}
}
}, _onCategoryChange: function _onCategoryChange(evt) {
var category=evt.detail.categoryId;
if (category) {
this.setSelectedCategory(category);
var context=NewsJS.Telemetry.Customization.getActionContext(this._state);
NewsJS.Telemetry.Customization.recordCategorySelection(this._state.sourcesMarket, category, context)
}
}, _setSearchState: function _setSearchState() {
var that=this;
var searchQuery=this._state.searchQuery;
if (!searchQuery || !this._searchBox || !this._searchBoxPlaceHolder) {
return
}
var convert=null;
this._searchBox.value = searchQuery;
this._searchBoxPlaceHolder.style.display = "none"
}, _setInitialCategory: function _setInitialCategory() {
var previouslySelectedCategory=this._state.selectedCategory,
previouslySelectedSearchCategory=this._state.selectedSearchCategory,
categoryId=this.firstCategory;
if (previouslySelectedSearchCategory && this._state.searchQuery !== "") {
if (this.searchResultsData[previouslySelectedSearchCategory]) {
categoryId = previouslySelectedSearchCategory
}
else if (this.searchResultsData.length && this.searchResultsData.length > 0) {
categoryId = this.searchResultsData[0]
}
}
else {
if (previouslySelectedCategory) {
if (this.backingData[previouslySelectedCategory]) {
categoryId = previouslySelectedCategory
}
else if (this._state.selectedCategory === "internationalBingDailyTab" && this.internationalCategoryKey) {
categoryId = this.internationalCategoryKey
}
else if (this._state.selectedCategory === this.internationalCategoryKey) {
categoryId = this.internationalCategoryKey
}
}
}
if (this._categoriesTabs && categoryId) {
this._categoriesTabs.value = categoryId
}
}, getPageImpressionContext: function getPageImpressionContext() {
switch (this._state.mode) {
case"Source":
if (this._state.isBrowse) {
return NewsJS.Telemetry.String.ImpressionContext.browseSources
}
else {
return NewsJS.Telemetry.String.ImpressionContext.addSource
}
break;
case"Cluster":
return NewsJS.Telemetry.String.ImpressionContext.addCategory;
break;
default:
return NewsJS.Telemetry.String.ImpressionContext.selectionPage;
break
}
}, marketChanged: function marketChanged(market) {
CommonJS.Progress.showProgress(CommonJS.Progress.headerProgressType);
this._state.sourcesMarket = market;
this._state.selectedCategory = null;
this._getData();
var context=NewsJS.Telemetry.Customization.getActionContext(this._state);
NewsJS.Telemetry.Customization.recordMarketSelection(market, context)
}, onTileItemInvoke: function onTileItemInvoke(evt) {
var element=evt.detail.element,
tileId=evt.detail.id;
var host=document.getElementById("rightPanel");
if (host && this._state.isBrowse) {
if (host.scrollLeft) {
this._state.rightPanelScrollLeft = host.scrollLeft
}
if (host.scrollTop) {
this._state.rightPanelScrollTop = host.scrollTop
}
}
this.implementToggle(tileId, element)
}, implementToggle: function implementToggle(tileId, element) {
var that=this;
NewsJS.Telemetry.Customization.sourcesReported = false;
var sourceMarket=that._state.sourcesMarket || that._state.currentMarket;
var item=this.searchDataDict[tileId] || this.backingDataDict[tileId];
if (item) {
if (that._state.isBrowse) {
NewsJS.Telemetry.Customization.recordSourceClick(sourceMarket, item);
this.dataProvider.navigate(item, that._state.sourcesMarket)
}
else {
var success=false;
if (item.selected) {
success = this.unfollowItem(item)
}
else {
success = this.followItem(item)
}
success.then(function(result) {
if (result) {
WinJS.Utilities.toggleClass(element, 'selected');
item.selected = !item.selected;
var category=null;
if (item.type === "InternationalBingDaily" || item.type === "marketCluster") {
category = item.type
}
else if (item.featured) {
category = "Featured"
}
else if (item.newscategory) {
category = item.newscategory
}
var type="Source";
if (that._state.features.indexOf("Categories") > -1) {
type = "Category"
}
NewsJS.Telemetry.Customization.recordAddRemove(sourceMarket, item, type, category);
element.setAttribute("aria-selected", item.selected ? "true" : "false")
}
})
}
}
}, _generateLocationTilesData: function _generateLocationTilesData() {
var dataSet=[];
if (this.allLocationData && this.allLocationData[0]) {
for (var i=0; i < this.allLocationData[0].length; ++i) {
dataSet.push(this._constructLocationTile(this.allLocationData[0][i].name, this.allLocationData[0][i].name, ""))
}
return WinJS.Promise.wrap(dataSet)
}
}, followItem: function followItem(item) {
return this.dataProvider.followItem(item)
}, unfollowItem: function unfollowItem(item) {
return this.dataProvider.unfollowItem(item)
}, getSelectedCategory: function getSelectedCategory() {
return this._state.selectedCategory
}, _setBindingForTiles: function _setBindingForTiles(data) {
if (this._tilesPanelControl) {
this._tilesPanelControl.isBrowse = this._state.isBrowse;
this._tilesPanelControl.dataSource = data
}
var rightPanel=document.getElementById("rightPanel");
if (rightPanel) {
rightPanel.scrollLeft = this._state.rightPanelScrollLeft;
rightPanel.scrollTop = this._state.rightPanelScrollTop
}
this._state.rightPanelScrollLeft = 0;
this._state.rightPanelScrollTop = 0
}, setSelectedCategory: function setSelectedCategory(categoryID) {
var data=null;
if (this._searchBox.value.length > 0) {
this._state.selectedSearchCategory = categoryID;
data = this.searchResultsData[categoryID]
}
else {
this._state.selectedCategory = categoryID;
data = this.backingData[categoryID]
}
this._setBindingForTiles(data)
}, _validationPromise: null, _validateRss: function _validateRss(url) {
var that=this;
if (this._validationPromise !== null) {
this._validationPromise.cancel();
this._validationPromise = null
}
CommonJS.Progress.showProgress(CommonJS.Progress.headerProgressType);
return NewsJS.Utilities.RSS.urlAsSyndicationFeedAsync(url)
}, _onRssValidateCompleteHandler: function _onRssValidateCompleteHandler(rss) {
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
if (rss.valid === true) {
this._onValidRssHandler(rss.url, rss.syndicationFeed)
}
else {
if (this._tilesPanelControl) {
if (this.errorMessage === "Invalid URI") {
this._tilesPanelControl.showErrorMessage(NewsJS.SelectionPage.STRINGS.NO_SOURCE_FOUND)
}
else {
this._tilesPanelControl.showErrorMessage(NewsJS.SelectionPage.STRINGS.NO_RSS_FOUND)
}
}
}
}, _onValidRssHandler: function _onValidRssHandler(url, syndicationFeed) {
var backingData=this.backingDataDict[url];
if (!backingData) {
var newsSource=NewsJS.Utilities.RSS.syndicationFeedAsNewsSource(url, syndicationFeed);
var that=this;
var promise=this.dataProvider.createRSSItemData(Platform.Globalization.Marketization.getCurrentMarket(), JSON.parse(JSON.stringify(newsSource.data)));
promise.then(function(rssData) {
newsSource.data = rssData;
newsSource.data.isCustomRSS = true;
newsSource.data.source = true;
that._updateSearchResults([newsSource])
})
}
}, renderSearchResultsCategories: function renderSearchResultsCategories() {
var ctr=this.categoryHost;
var searchResultsCats=[NewsJS.SelectionPage.SEARCH_RESULTS_SOURCES, NewsJS.SelectionPage.SEARCH_RESULTS_INTERNATIONAL_EDITIONS, NewsJS.SelectionPage.SEARCH_RESULTS_CATEGORIES, NewsJS.SelectionPage.SEARCH_RESULTS_TOPICS];
searchResultsCats.forEach(function(i) {
var cat=this.buildCategory(i, null, true);
WinJS.Utilities.addClass(cat, "searchResultsCat");
ctr.appendChild(cat)
}.bind(this))
}, _buildSearch: function _buildSearch() {
var that=this;
var features=that._state.features;
if (Array.isArray(features)) {
if (features.indexOf("Sources") > -1 || features.indexOf("Categories") > -1 || features.indexOf("International") > -1) {
this._createSourcesList()
}
}
}, _initializeAutoSuggest: function _initializeAutoSuggest(lookupItem) {
var that=this;
if (this._searchBox) {
var onSuggestionSelected=function(index, event) {
that._onSuggestionSelected(index, that._searchBox.value, lookupItem)
};
this._searchBox.addEventListener("keydown", this._onKeyDownHandler);
this._searchBox.addEventListener("mouseup", this._onMouseUpHandler);
this._searchBox.addEventListener("blur", this._onBlurHandler);
var searchButton=document.getElementById("searchButton");
if (searchButton) {
searchButton.addEventListener("click", this._onSearchButtonClickHandler)
}
var onKeyUp=function(event) {
event.queryText = that._searchBox.value;
event.request = {getDeferral: function getDeferral() {
return {complete: function complete(){}}
}};
that._updateSuggestions(event)
};
var autoSuggest=this.autoSuggest = new CommonJS.AutoSuggest(this._searchBox, {
itemDataSource: [], onItemSelection: onSuggestionSelected, keyup: onKeyUp, selectionMode: CommonJS.AutoSuggest.freeForm
});
this._searchBox.type = "search"
}
}, _createSourcesList: function _createSourcesList() {
this._sourcesDictionary = {};
this._sourcesList = [];
for (var categoryKey in this.backingData) {
if (!this._categories || this._categories.indexOf(categoryKey) === -1) {
continue
}
var category=this.backingData[categoryKey];
if (!category) {
continue
}
for (var sourceKey in category) {
var source=category[sourceKey];
if (!source) {
continue
}
var displayname=source.data.displayname;
if (!this._sourcesDictionary[displayname]) {
this._sourcesDictionary[displayname] = source;
this._sourcesList.push({
displayname: displayname, alpha: displayname
})
}
}
}
}, _onSuggestionSelected: function _onSuggestionSelected(index, queryText, lookupItem) {
var that=this;
this._state.searchQuery = queryText;
var queryTerm=NewsJS.Utilities.trimString(queryText);
lookupItem(queryTerm).then(function(selectedItem) {
if (selectedItem) {
that._updateSearchResults([selectedItem]);
var experience=that.getPageImpressionContext().substr(1);
NewsJS.Telemetry.Customization.recordSourceSearch(queryText, that._state.sourcesMarket, 1, experience)
}
}, function(err) {
return null
})
}, _onSearchEntered: function _onSearchEntered(queryText, lookupItem) {
var that=this;
var queryText=NewsJS.Utilities.trimString(queryText);
var checkForRSS=false;
var features=that._state.features;
var hasSearchResults;
if (Array.isArray(features)) {
if (features.indexOf("Sources") > -1) {
checkForRSS = true
}
}
if (queryText.length > 0) {
if (checkForRSS) {
this._validateRss(queryText).done(function urlAsSyndicationFeedAsyncComplete(syndicationFeed) {
that._onRssValidateCompleteHandler({
valid: true, url: queryText, syndicationFeed: syndicationFeed
})
}, function urlAsSyndicationFeedAsyncError(error) {
if (error === "Invalid URI") {
that._getSearchResult(queryText, lookupItem)
}
for (var category in that.searchResultsData) {
if (that.searchResultsData[category].length > 0) {
hasSearchResults = true;
CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType);
break
}
}
if (error !== "Canceled" && !hasSearchResults) {
that.errorMessage = error;
that._onRssValidateCompleteHandler({
valid: false, url: queryText, syndicationFeed: null
})
}
})
}
else {
that._getSearchResult(queryText, lookupItem)
}
}
else {
this._clearSearch()
}
}, _getSearchResult: function _getSearchResult(queryText, lookupItem) {
this._state.searchQuery = queryText;
var promises=[],
that=this,
topicSearch,
features=this._state.features;
if (Array.isArray(features)) {
if (features.indexOf("Topics") > -1) {
topicSearch = true
}
}
this._getSuggestions(queryText).then(function(suggestionsList) {
for (var i in suggestionsList) {
var suggestion=suggestionsList[i];
promises.push(lookupItem(suggestion.Symbol))
}
}).then(function() {
if (!that._topicResults && topicSearch) {
var market=NewsJS.Globalization.getMarketStringForAutosuggest();
return that._getTopicsAsync(queryText, market)
}
}).then(function(topics) {
for (var i in topics) {
var topic=topics[i];
promises.push(lookupItem(topic))
}
if (promises.length < 1 && topicSearch) {
promises.push(lookupItem(queryText))
}
}).then(function() {
WinJS.Promise.join(promises).then(function(responses) {
that._updateSearchResults(responses);
var experience=that.getPageImpressionContext().substr(1);
NewsJS.Telemetry.Customization.recordSourceSearch(queryText, that._state.sourcesMarket, responses.length, experience)
})
})
}, _updateSearchResults: function _updateSearchResults(data) {
if (data) {
this._updateSearchResultsData(data)
}
}, _updateSearchResultsData: function _updateSearchResultsData(data) {
var dataLength=data.length,
selectedCategory;
this.searchDataDict = {};
this.searchResultsData = [];
this.searchResultsData[NewsJS.SelectionPage.SEARCH_RESULTS_INTERNATIONAL_EDITIONS] = [];
this.searchResultsData[NewsJS.SelectionPage.SEARCH_RESULTS_SOURCES] = [];
this.searchResultsData[NewsJS.SelectionPage.SEARCH_RESULTS_TOPICS] = [];
this.searchResultsData[NewsJS.SelectionPage.SEARCH_RESULTS_CATEGORIES] = [];
for (var i=0; i < dataLength; i++) {
if (data[i] && data[i].data) {
if (data[i].data.type && data[i].data.type === "InternationalBingDaily") {
this.searchResultsData[NewsJS.SelectionPage.SEARCH_RESULTS_INTERNATIONAL_EDITIONS].push(data[i]);
selectedCategory = selectedCategory || NewsJS.SelectionPage.SEARCH_RESULTS_INTERNATIONAL_EDITIONS
}
else if (data[i].data.topic) {
this.searchResultsData[NewsJS.SelectionPage.SEARCH_RESULTS_TOPICS].push(data[i]);
selectedCategory = selectedCategory || NewsJS.SelectionPage.SEARCH_RESULTS_TOPICS
}
else if (data[i].data.type && data[i].data.type === "marketCluster") {
this.searchResultsData[NewsJS.SelectionPage.SEARCH_RESULTS_CATEGORIES].push(data[i]);
selectedCategory = selectedCategory || NewsJS.SelectionPage.SEARCH_RESULTS_CATEGORIES
}
else {
this.searchResultsData[NewsJS.SelectionPage.SEARCH_RESULTS_SOURCES].push(data[i]);
selectedCategory = selectedCategory || NewsJS.SelectionPage.SEARCH_RESULTS_SOURCES
}
if (data[i].data.id) {
this.searchDataDict[data[i].data.id] = data[i].data
}
}
}
if (selectedCategory) {
var SearchResultsCategories=[];
for (var category in this.searchResultsData) {
if (this.searchResultsData[category].length > 0) {
SearchResultsCategories.push(category)
}
}
if (this.searchResultsData[this._state.selectedSearchCategory] && this.searchResultsData[this._state.selectedSearchCategory].length > 0) {
selectedCategory = this._state.selectedSearchCategory
}
if (this._categoriesTabs) {
this._categoriesTabs.dataSource = SearchResultsCategories;
this._state.selectedSearchCategory = selectedCategory;
this._categoriesTabs.value = selectedCategory
}
}
}, _clearSearch: function _clearSearch() {
this._state.searchQuery = "";
this._searchBox.value = "";
this.searchDataDict = {};
if (this._categoriesTabs) {
this._categoriesTabs.dataSource = this._categories;
this._categoriesTabs.value = this.firstCategory
}
}, _updateSuggestions: function _updateSuggestions(event) {
var that=this;
var text=event.srcElement.value;
var srcElement=document.getElementById(event.srcElement.id);
var autoSuggest=PlatformJS.Utilities.getControl(srcElement);
if (autoSuggest) {
that._getSuggestions(text).then(function(suggestionList) {
autoSuggest.itemDataSource = suggestionList
})
}
else {
console.log("Suggestion request received when autosuggest is inactive.")
}
}, _getSuggestions: function _getSuggestions(query, convert) {
var that=this;
this._topicResults = false;
return new WinJS.Promise(function(complete, error) {
if (query.length == 0) {
complete([]);
return
}
var features=that._state.features;
if (Array.isArray(features)) {
if (features.indexOf("Sources") > -1) {
that._getSourcesSuggestions(query, complete, convert)
}
else if (features.indexOf("Topics") > -1) {
that._getTopicsSuggestions(query, complete, convert)
}
}
})
}, _getSourcesSuggestions: function _getSourcesSuggestions(query, complete, convert) {
convert = convert || function(entity) {
return {
Symbol: entity.displayname, value: entity.id, displayedText: entity.displayname
}
};
var resultsArray=NewsJS.Autosuggest.findMatchingEntitiesUsingPartialMatch(this._sourcesList, query, true, convert);
var features=this._state.features;
if (resultsArray.length > 0) {
complete(resultsArray)
}
else if (Array.isArray(features) && features.indexOf("Topics") > -1) {
this._getTopicsSuggestions(query, complete, convert)
}
else {
complete([])
}
}, _getTopicsSuggestions: function _getTopicsSuggestions(query, complete, convert) {
var that=this,
marketString=NewsJS.Globalization.getMarketStringForAutosuggest();
this._getTopicsAsync(query, marketString).then(function(results) {
var resultsArray=[],
resultsLength=results.length;
if (results.indexOf(query) < 0) {
resultsArray.push({
Symbol: query, displayedText: query, value: query
})
}
for (var i=0; i < resultsLength; i++) {
var result=results[i],
resultObject={
Symbol: result, displayedText: result, value: result
};
resultsArray.push(resultObject)
}
that._topicResults = true;
complete(resultsArray)
})
}, _getTopicsAsync: function _getTopicsAsync(query, market) {
if (!market.length) {
return WinJS.Promise.wrap([])
}
else {
return new WinJS.Promise(function(complete, error, progress) {
NewsJS.Data.Bing.getQuerySuggestions(query, market).then(function(results) {
var resultsArray=[];
for (var i=0; i < results.dataObjectList.size; i++) {
var result=results.dataObjectList.getAt(i);
resultsArray.push(result)
}
complete(resultsArray)
}, function(e) {
complete([])
})
})
}
}, onNavigateAway: function onNavigateAway() {
this.dataProvider.commitItems();
if (this._tilesPanelControl) {
this._tilesPanelControl.removeEventListener("iteminvoked", this._onTileItemInvokeCallBack);
this._onTileItemInvokeCallBack = null;
this._tilesPanelControl.dataSource = [];
this._tilesPanelControl.dispose()
}
if (this._categoriesTabs) {
this._categoriesTabs.removeEventListener("itemselected", this._onCategoryChangeCallBack);
this._onCategoryChangeCallBack = null;
this._categoriesTabs.dataSource = [];
this._categoriesTabs.dispose()
}
if (this._searchBox) {
this._searchBox.removeEventListener("input", this._onInputHandler);
this._searchBox.removeEventListener("keydown", this._onKeyDownHandler);
this._searchBox.removeEventListener("mouseup", this._onMouseUpHandler);
this._searchBox.removeEventListener("blur", this._onBlurHandler);
this._onInputHandler = null;
this._onKeyDownHandler = null;
this._onMouseUpHandler = null;
this._onBlurHandler = null
}
var searchButton=document.getElementById("searchButton");
if (searchButton) {
searchButton.removeEventListener("click", this._onSearchButtonClickHandler);
this._onSearchButtonClickHandler = null
}
NewsJS.NewsBasePage.prototype.onNavigateAway.call(this)
}, onPreviewToggle: function onPreviewToggle(){}, onBindingComplete: function onBindingComplete() {
NewsJS.NewsBasePage.prototype.onBindingComplete.call(this)
}, getPageState: function getPageState() {
return this._state
}, loadPageData: function loadPageData() {
this.getPageData()
}, getPageData: function getPageData() {
var that=this;
CommonJS.Progress.showProgress(CommonJS.Progress.headerProgressType);
if (this._state.enableMarketSelector) {
var marketPicker=document.getElementById("marketPicker");
if (marketPicker && marketPicker.winControl) {
var marketControl=marketPicker.winControl;
marketControl._marketChangeCallback = this.marketChanged.bind(this);
marketControl.currentMarket = this._state.sourcesMarket;
return marketControl._populate().then(function(result) {
that._getData().then(function(success) {
that.onBindingComplete();
if (PlatformJS.mainProcessManager.afterFirstView) {
PlatformJS.mainProcessManager.afterFirstView()
}
}, null)
})
}
else {
debugger
}
}
else {
return this._getData()
}
}, _getData: function _getData() {
var that=this,
marketPicker=document.getElementById("marketPicker"),
marketControl=null,
market;
if (this._state.enableMarketSelector && marketPicker && marketPicker.winControl) {
marketControl = marketPicker.winControl
}
if (this._state.sourcesMarket) {
market = this._state.sourcesMarket;
if (marketControl) {
marketControl._marketSelect.value = market
}
}
if (this._state.enableMarketSelector && marketControl) {
market = this._state.sourcesMarket = marketControl._marketSelect.value
}
else {
market = this._state.currentMarket
}
var getContentForMarketFromPickerPromise;
if (NewsJS.Utilities.ParamChecks.isNull(market)) {
getContentForMarketFromPickerPromise = WinJS.Promise.wrap(null);
debugger
}
else {
getContentForMarketFromPickerPromise = this.dataProvider.getContent(market)
}
return getContentForMarketFromPickerPromise.then(function(val) {
that.hideFRE();
var searchBox=document.getElementById("searchBox");
if (val) {
that._pageLoadSucceeded();
that.onContentReady(val);
if (searchBox) {
searchBox.disabled = false
}
}
else {
that._pageLoadFailed();
that.onContentReady([]);
if (searchBox) {
searchBox.disabled = true;
searchBox.value = ""
}
}
PlatformJS.Navigation.mainNavigator.notifyPageLoadComplete()
}, function(err) {
that._pageDataPromise = null;
if (!NewsJS.Utilities.isCancellationError(err)) {
that.hideFRE();
that._pageLoadFailed()
}
PlatformJS.Navigation.mainNavigator.notifyPageLoadComplete()
}, function(progress) {
if (!that.FREShown) {
that._pageLoadSucceeded();
that.showCannedFRE();
that.FREShown = true
}
})
}, _scanSources: function _scanSources(sourceIdToLookup) {
if (this.backingData) {
for (var item in this.backingData) {
var sourceList=this.backingData[item];
if (sourceList) {
for (var i=0; i < sourceList.length; ++i) {
if (sourceList[i] && sourceList[i].data && sourceList[i].data.id && NewsJS.Utilities.ParamChecks.areStringsEqualCaseInsensitive(sourceList[i].data.id, sourceIdToLookup)) {
return sourceList[i]
}
}
}
}
}
return null
}, _constructLocationTile: function _constructLocationTile(location, id, description) {
return {
categoryKey: "sourcesContent", template: "sourceItemTemplate", data: {
freq: null, alpha: "01Location", displayname: location, win8_image: null, id: id, title: location, sourcedescription: description, rss_names: "", rss_urls: "", newscategory: "Local News", is_not_featured: false, featured_category: "", featured_url: "", channel_id: "", ad_unit_id: "", instrumentation_id: "", partner_header_logo: null, partner_header_logo_snap: null, tileType: "SearchResultTopic", hideToggle: true, source: false, selected: true
}
}
}
}, {
LOCAL_CITY_REGION_ELEMENT_ID: "newssource_more_userlocation", LOCAL_CURRENT_CITY_REGION: "", SEARCH_RESULTS_TOPICS: CommonJS.resourceLoader.getString("MyTopics"), SEARCH_RESULTS_SOURCES: CommonJS.resourceLoader.getString("MySources"), SEARCH_RESULTS_CATEGORIES: CommonJS.resourceLoader.getString("Categories"), SEARCH_RESULTS_INTERNATIONAL_EDITIONS: CommonJS.resourceLoader.getString("InternationalBingDailyTab"), STRINGS: {
NO_SOURCE_FOUND: CommonJS.resourceLoader.getString("NoResults"), NO_RSS_FOUND: CommonJS.resourceLoader.getString("CouldNotValidateRSS")
}
})})
})()