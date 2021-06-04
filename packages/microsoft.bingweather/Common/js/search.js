/*  © Microsoft. All rights reserved. */
WinJS.Namespace.define('CommonJS', {Version: 'latest'});
(function appexPlatformControlsSearchTextBoxInit() {
"use strict";
var _minimumFullWidth=871;
var _typeToSearchControl=null;
WinJS.Namespace.define("CommonJS.Search", {
SEARCH_BOX_WIDTH: 370, SearchSuggestion: WinJS.Class.define(function searchSuggestion_ctor(type, text, detailText, tag, image, imageAlternateText) {
this.type = type;
this.text = text;
this.detailText = detailText;
this.tag = tag;
this.image = image;
this.imageAlternateText = imageAlternateText
}, {
type: null, text: null, detailText: null, tag: null, image: null, imageAlternateText: null
}, {SearchResultTypes: Object.freeze({
QUERY: 0, RESULT: 1, SEPARATOR: 2
})}), clearSearchHistory: function clearSearchHistory() {
var tempSearchSuggestionManager=new Windows.ApplicationModel.Search.Core.SearchSuggestionManager;
tempSearchSuggestionManager.clearHistory()
}, disableTypeToSearch: function disableTypeToSearch() {
if (_typeToSearchControl) {
_typeToSearchControl.focusOnKeyboardInput = false
}
}, enableTypeToSearch: function enableTypeToSearch() {
if (_typeToSearchControl) {
_typeToSearchControl.focusOnKeyboardInput = true
}
}, SearchTextBox: WinJS.Class.define(function searchTexBox_ctor(element, options) {
options = options || {};
this.element = element || document.createElement("div");
this.element.winControl = this;
CommonJS.Utils.markDisposable(this.element);
this.element.id = options.automationId ? options.automationId : "searchTextBox";
this._buttonBackgroundElement = document.createElement("div");
this.element.appendChild(this._buttonBackgroundElement);
this._searchBoxElement = document.createElement("div");
this.element.appendChild(this._searchBoxElement);
this._init(options);
this.setupVisualState();
var headerTitle=WinJS.Utilities.query(".immersiveHeaderTitle");
if (headerTitle.length > 0) {
WinJS.Utilities.addClass(headerTitle[0], "searchBoxHeaderText")
}
}, {
element: null, _isPageSearch: false, _startMinimized: false, _isMinimized: false, _minimizeExpanded: false, _touchFocusingEvent: false, _autoSuggestionList: null, _autoSuggestionLength: 0, _autoSuggestionRequestAsyncPromise: null, _buttonBackgroundElement: null, _searchBoxElement: null, _searchBoxControl: null, _searchQueryText: null, _searchQueryLanguage: null, _queryInputElement: null, _queryGlyphElement: null, _queryFlyoutElement: null, _isDisposed: false, _searchHandler: null, _suggestionChosenHandler: null, _queryChangedBinding: null, _querySubmittedBinding: null, _searchSuggestionRequestedBinding: null, _resultSuggestionChosenBinding: null, _prepareForFocusOnKeyboardBinding: null, _onResizeBinding: null, _onFocusInBinding: null, _onFocusOutBinding: null, _expandCollapseHandle: null, _inputPointerDownHandlerBinding: null, _inputPointerUpHandlerBinding: null, _inputPointerLeaveHandlerBinding: null, _inputPointerEnterHandlerBinding: null, _isFocusedIn: false, autoSuggestionDataProvider: null, isPageSearch: {set: function set(value) {
if (value === true) {
this._isPageSearch = true;
WinJS.Utilities.addClass(this.element, "cux-searchtextbox-pagesearch")
}
}}, startMinimized: {set: function set(value) {
this._startMinimized = !!value
}}, focusOnKeyboardInput: {
get: function get() {
return this._searchBoxControl.focusOnKeyboardInput
}, set: function set(value) {
if (!value) {
_typeToSearchControl = null
}
else if (!!value) {
if (_typeToSearchControl && _typeToSearchControl !== this._searchBoxControl) {
_typeToSearchControl.focusOnKeyboardInput = false;
debugger
}
_typeToSearchControl = this._searchBoxControl
}
this._searchBoxControl.focusOnKeyboardInput = !!value
}
}, searchHandler: {set: function set(handler) {
if (this._searchHandler) {
this.removeEventListener("search", this._searchHandler)
}
this._searchHandler = handler;
this.addEventListener("search", handler)
}}, suggestionChosenHandler: {set: function set(handler) {
if (this._suggestionChosenHandler) {
this.removeEventListener("suggestionChosen", this._suggestionChosenHandler)
}
this._suggestionChosenHandler = handler;
this.addEventListener("suggestionChosen", handler)
}}, queryText: {
set: function set(value) {
if (this._searchBoxControl) {
this._searchBoxControl.queryText = value
}
}, get: function get() {
return (this._searchBoxControl) ? this._searchBoxControl.queryText : ""
}
}, dispose: function dispose() {
if (this._isDisposed) {
return
}
this._isDisposed = true;
if (this._searchHandler) {
this.removeEventListener("search", this._searchHandler);
this._searchHandler = null
}
if (this._suggestionChosenHandler) {
this.removeEventListener("suggestionChosen", this._suggestionChosenHandler);
this._suggestionChosenHandler = null
}
if (this._searchBoxControl) {
if (_typeToSearchControl === this._searchBoxControl) {
_typeToSearchControl = null
}
if (this._queryChangedBinding) {
this._searchBoxControl.removeEventListener("querychanged", this._queryChangedBinding);
this._queryChangedBinding = null
}
if (this._querySubmittedBinding) {
this._searchBoxControl.removeEventListener("querysubmitted", this._querySubmittedBinding);
this._querySubmittedBinding = null
}
if (this._searchSuggestionRequestedBinding) {
this._searchBoxControl.removeEventListener("suggestionsrequested", this._searchSuggestionRequestedBinding);
this._searchSuggestionRequestedBinding = null
}
if (this._resultSuggestionChosenBinding) {
this._searchBoxControl.removeEventListener("resultsuggestionchosen", this._resultSuggestionChosenBinding);
this._resultSuggestionChosenBinding = null
}
if (this._prepareForFocusOnKeyboardBinding) {
this._searchBoxControl.removeEventListener("receivingfocusonkeyboardinput", this._prepareForFocusOnKeyboardBinding);
this._prepareForFocusOnKeyboardBinding = null
}
if (this._searchBoxControl.dispose) {
this._searchBoxControl.dispose()
}
this._searchBoxControl = null
}
if (this._onResizeBinding) {
CommonJS.WindowEventManager.removeEventListener(CommonJS.WindowEventManager.Events.WINDOW_RESIZE, this._onResizeBinding);
this._onResizeBinding = null
}
if (this._queryInputElement) {
if (this._inputPointerDownHandlerBinding) {
this._queryInputElement.removeEventListener("MSPointerDown", this._inputPointerDownHandlerBinding);
this._inputPointerDownHandlerBinding = null
}
if (this._inputPointerUpHandlerBinding) {
this._queryInputElement.removeEventListener("MSPointerUp", this._inputPointerUpHandlerBinding);
this._inputPointerUpHandlerBinding = null
}
if (this._inputPointerLeaveHandlerBinding) {
this._queryInputElement.removeEventListener("MSPointerLeave", this._inputPointerLeaveHandlerBinding);
this._inputPointerLeaveHandlerBinding = null
}
if (this._inputPointerEnterHandlerBinding) {
this._queryInputElement.removeEventListener("MSPointerEnter", this._inputPointerEnterHandlerBinding);
this._inputPointerEnterHandlerBinding = null
}
if (this._inputKeyDownHandlerBinding) {
this._queryInputElement.removeEventListener("keydown", this._inputKeyDownHandlerBinding);
this._inputKeyDownHandlerBinding = null
}
}
if (this._searchBoxElement) {
if (this._onFocusInBinding) {
this._searchBoxElement.removeEventListener("focusin", this._onFocusInBinding);
this._onFocusInBinding = null
}
if (this._onFocusOutBinding) {
this._searchBoxElement.removeEventListener("focusout", this._onFocusOutBinding);
this._onFocusOutBinding = null
}
}
if (this._autoSuggestionRequestAsyncPromise) {
this._autoSuggestionRequestAsyncPromise.cancel();
this._autoSuggestionRequestAsyncPromise = null
}
}, _init: function _init(options) {
if (options.disabled) {
this.element.style.opacity = 0.25
}
WinJS.Utilities.addClass(this.element, "cux-searchtextbox");
WinJS.Utilities.addClass(this.element, "win-disposable");
this._checkOptions(options);
this._searchBoxControl = new WinJS.UI.SearchBox(this._searchBoxElement, options);
this._searchQueryText = this._searchBoxControl.queryText;
this._queryInputElement = this._searchBoxElement.querySelector("input");
CommonJS.setAutomationId(this._queryInputElement, this.element, "searchBox");
this._queryGlyphElement = this._searchBoxElement.querySelector(".win-searchbox-button");
CommonJS.setAutomationId(this._queryGlyphElement, this.element, "searchButton");
this._queryFlyoutElement = this._searchBoxElement.querySelector(".win-searchbox-flyout");
this._queryInputElement.setAttribute("tabindex", 0);
WinJS.Utilities.addClass(this._buttonBackgroundElement, "win-searchbox-button");
WinJS.Utilities.addClass(this._buttonBackgroundElement, "cux-buttonbackground");
WinJS.Utilities.addClass(this._buttonBackgroundElement, "cux-searchtextbox-button-hide");
this._initEvents();
this._applyOptions(options)
}, _applyOptions: function _applyOptions(options) {
if (options.autoSuggestionDataProvider) {
this.autoSuggestionDataProvider = options.autoSuggestionDataProvider
}
if (options.isPageSearch) {
this.isPageSearch = options.isPageSearch
}
if (options.startMinimized) {
this.startMinimized = options.startMinimized
}
if (options.focusOnKeyboardInput) {
this.focusOnKeyboardInput = options.focusOnKeyboardInput
}
if (options.searchHandler) {
this.searchHandler = options.searchHandler
}
if (options.suggestionChosenHandler) {
this.suggestionChosenHandler = options.suggestionChosenHandler
}
}, _initEvents: function _initEvents() {
this._queryChangedBinding = this._queryChanged.bind(this);
this._querySubmittedBinding = this._querySubmitted.bind(this);
this._searchSuggestionRequestedBinding = this._searchSuggestionsRequested.bind(this);
this._resultSuggestionChosenBinding = this._resultSuggestionChosen.bind(this);
this._prepareForFocusOnKeyboardBinding = this._prepareForFocusOnKeyboard.bind(this);
this._searchBoxControl.addEventListener("querychanged", this._queryChangedBinding);
this._searchBoxControl.addEventListener("querysubmitted", this._querySubmittedBinding);
this._searchBoxControl.addEventListener("suggestionsrequested", this._searchSuggestionRequestedBinding);
this._searchBoxControl.addEventListener("resultsuggestionchosen", this._resultSuggestionChosenBinding);
this._searchBoxControl.addEventListener("receivingfocusonkeyboardinput", this._prepareForFocusOnKeyboardBinding);
this._onResizeBinding = this._onResize.bind(this);
CommonJS.WindowEventManager.addEventListener(CommonJS.WindowEventManager.Events.WINDOW_RESIZE, this._onResizeBinding);
this._onFocusInBinding = this._focusIn.bind(this);
this._onFocusOutBinding = this._focusOut.bind(this);
if (this._searchBoxElement) {
this._searchBoxElement.addEventListener("focusin", this._onFocusInBinding);
this._searchBoxElement.addEventListener("focusout", this._onFocusOutBinding)
}
this._inputPointerDownHandlerBinding = this._inputPointerDownHandler.bind(this);
this._inputPointerUpHandlerBinding = this._inputPointerUpHandler.bind(this);
this._inputPointerLeaveHandlerBinding = this._inputPointerLeaveHandler.bind(this);
this._inputPointerEnterHandlerBinding = this._inputPointerEnterHandler.bind(this);
this._inputKeyDownHandlerBinding = this._inputKeyDownHandler.bind(this);
if (this._queryInputElement) {
this._queryInputElement.addEventListener("MSPointerDown", this._inputPointerDownHandlerBinding);
this._queryInputElement.addEventListener("MSPointerUp", this._inputPointerUpHandlerBinding);
this._queryInputElement.addEventListener("MSPointerEnter", this._inputPointerEnterHandlerBinding);
this._queryInputElement.addEventListener("MSPointerLeave", this._inputPointerLeaveHandlerBinding);
this._queryInputElement.addEventListener("keydown", this._inputKeyDownHandlerBinding)
}
}, _checkOptions: function _checkOptions(options) {
if (options.focusOnKeyboardInput !== true) {
options.focusOnKeyboardInput = false
}
else {
if (_typeToSearchControl && _typeToSearchControl !== this._searchBoxControl) {
_typeToSearchControl.focusOnKeyboardInput = false;
debugger
}
}
}, setupVisualState: function setupVisualState(minimize) {
if (minimize || this._startMinimized || (this._isPageSearch && window.innerWidth < _minimumFullWidth)) {
this._setupMinimizedState()
}
else if (this._isMinimized && !this._startMinimized) {
this._expandSearchTextBox()
}
}, _queryChanged: function _queryChanged(eventInfo) {
this._searchQueryText = eventInfo.detail.queryText;
this._searchQueryLanguage = eventInfo.detail.language
}, _querySubmitted: function _querySubmitted(eventInfo) {
PlatformJS.Utilities.setLastClickUserActionMethodWithNavMethod(Microsoft.Bing.AppEx.Telemetry.UserActionMethod.keyboard);
this._logInstrumentationDetails(JSON.stringify({
NumberOfCharactersTyped: this._searchQueryText.length, QueryText: eventInfo.detail.queryText, NumberOfSuggestions: this._autoSuggestionLength
}));
msSetImmediate(this.dispatchEvent.bind(this, "search", {
query: eventInfo.detail.queryText, language: eventInfo.detail.language
}))
}, _searchSuggestionsRequested: function _searchSuggestionsRequested(eventInfo) {
var that=this;
if (!this._isFocusedIn) {
return
}
if (this.autoSuggestionDataProvider && eventInfo.detail && eventInfo.detail.searchSuggestionCollection) {
var startTime=new Date;
var updateSuggestionCollection=function(suggestions) {
var endTime=new Date;
that._logInstrumentationDetails(JSON.stringify({TimeToFetchAutosuggest: endTime.getTime() - startTime.getTime()}));
that._autoSuggestionList = {};
that._autoSuggestionLength = 0;
if (suggestions) {
suggestions.forEach(function searchTextBox_appendSuggestion(suggestion) {
switch (suggestion.type) {
case CommonJS.Search.SearchSuggestion.SearchResultTypes.QUERY:
eventInfo.detail.searchSuggestionCollection.appendQuerySuggestion(suggestion.text);
break;
case CommonJS.Search.SearchSuggestion.SearchResultTypes.SEPARATOR:
eventInfo.detail.searchSuggestionCollection.appendSearchSeparator(suggestion.text);
break;
case CommonJS.Search.SearchSuggestion.SearchResultTypes.RESULT:
that._autoSuggestionLength++;
that._autoSuggestionList[suggestion.tag] = {
index: that._autoSuggestionLength, data: suggestion
};
eventInfo.detail.searchSuggestionCollection.appendResultSuggestion(suggestion.text, suggestion.detailText, suggestion.tag, suggestion.image, suggestion.imageAlternateText);
break
}
})
}
};
if (this.autoSuggestionDataProvider.getSuggestionsAsync) {
if (eventInfo.detail.setPromise) {
if (this._autoSuggestionRequestAsyncPromise) {
this._autoSuggestionRequestAsyncPromise.cancel()
}
this._autoSuggestionRequestAsyncPromise = this.autoSuggestionDataProvider.getSuggestionsAsync(this._searchQueryText, this._searchQueryLanguage).then(updateSuggestionCollection);
eventInfo.detail.setPromise(this._autoSuggestionRequestAsyncPromise)
}
}
else if (this.autoSuggestionDataProvider.getSuggestions) {
updateSuggestionCollection(this.autoSuggestionDataProvider.getSuggestions(this._searchQueryText, this._searchQueryLanguage))
}
}
}, _resultSuggestionChosen: function _resultSuggestionChosen(eventInfo) {
var suggestionTag=eventInfo.detail.tag;
var autoSuggestDetail=this._autoSuggestionList[suggestionTag];
if (autoSuggestDetail && autoSuggestDetail.data) {
this._logInstrumentationDetails(JSON.stringify({
SelectedSuggestionText: autoSuggestDetail.data.text, SelectedSuggestionPosition: autoSuggestDetail.index, NumberOfSuggestions: this._autoSuggestionLength
}))
}
this.dispatchEvent("suggestionChosen", {
tag: suggestionTag, data: autoSuggestDetail ? autoSuggestDetail.data : null
})
}, _prepareForFocusOnKeyboard: function _prepareForFocusOnKeyboard(eventInfo) {
PlatformJS.Utilities.setLastClickUserActionMethodWithNavMethod(Microsoft.Bing.AppEx.Telemetry.UserActionMethod.keyboard);
this._logInstrumentationDetails(JSON.stringify({SearchBoxInvoked: true}));
if (this._isMinimized && !this._minimizeExpanded) {
this._expandSearchTextBox()
}
}, _onResize: function _onResize(eventInfo) {
if (eventInfo.detail && eventInfo.detail.hasInnerWidthChanged === false) {
return
}
if (this._isPageSearch) {
var heroVisibleWidth=CommonJS.Immersive.PlatformHeroControl.getHeroVisibleWidth();
var windowInnerWidth=window.innerWidth;
if (windowInnerWidth < _minimumFullWidth || (heroVisibleWidth > 0 && ((windowInnerWidth - heroVisibleWidth) < CommonJS.Search.SEARCH_BOX_WIDTH))) {
if (this._isMinimized === false) {
this._setupMinimizedState()
}
else {
if (this._minimizeExpanded === true) {
if (windowInnerWidth < _minimumFullWidth) {
WinJS.Utilities.addClass(this.element, "cux-searchtextbox-pagesearch-small-expanded")
}
else {
WinJS.Utilities.removeClass(this.element, "cux-searchtextbox-pagesearch-small-expanded")
}
}
}
}
else {
if (this._isMinimized === true) {
WinJS.Utilities.removeClass(this.element, "cux-searchtextbox-pagesearch-small");
WinJS.Utilities.removeClass(this.element, "cux-searchtextbox-pagesearch-small-expanded");
WinJS.Utilities.addClass(this._buttonBackgroundElement, "cux-searchtextbox-button-hide");
WinJS.Utilities.removeClass(this._queryGlyphElement, "cux-searchtextbox-button-hide");
this._isMinimized = false;
this._minimizeExpanded = false
}
if (this._startMinimized === true) {
this._setupMinimizedState()
}
}
}
}, _focusIn: function _focusIn(eventInfo) {
this._isFocusedIn = true;
if (this._touchFocusingEvent) {
return
}
if (this._isMinimized && !this._minimizeExpanded) {
this._setupExpansion()
}
}, _focusOut: function _focusOut(eventInfo) {
var relatedTarget=eventInfo.relatedTarget;
if (!relatedTarget) {
return
}
if (relatedTarget === this._queryGlyphElement) {
return
}
if (relatedTarget === this._queryFlyoutElement) {
return
}
if (relatedTarget === this._searchBoxElement) {
return
}
if (relatedTarget === this._queryInputElement) {
return
}
if (this._isMinimized && this._minimizeExpanded) {
if (this._expandCollapseHandle) {
msClearImmediate(this._expandCollapseHandle)
}
this._collapseSearchTextBox()
}
this._touchFocusingEvent = null;
this._isFocusedIn = false
}, _setupExpansion: function _setupExpansion() {
if (this._expandCollapseHandle) {
msClearImmediate(this._expandCollapseHandle)
}
this._expandCollapseHandle = msSetImmediate(this._expandSearchTextBox.bind(this))
}, _inputPointerDownHandler: function _inputPointerDownHandler(eventInfo) {
PlatformJS.Utilities.setLastClickUserActionMethodWithEvent(eventInfo);
if (this._isMinimized && !this._minimizeExpanded && eventInfo.pointerType === "touch") {
this._touchFocusingEvent = eventInfo
}
}, _inputPointerUpHandler: function _inputPointerUpHandler(eventInfo) {
if (this._isMinimized && !this._minimizeExpanded && eventInfo.pointerType === "touch" && this._touchFocusingEvent) {
this._setupExpansion()
}
}, _inputPointerLeaveHandler: function _inputPointerLeaveHandler(eventInfo) {
if (this._isMinimized && !this._minimizeExpanded && this._isFocusedIn && eventInfo.pointerType === "touch" && this._touchFocusingEvent) {
this._setupExpansion()
}
this._touchFocusingEvent = null;
if (this._buttonBackgroundElement && this._isMinimized) {
WinJS.Utilities.removeClass(this._buttonBackgroundElement, "cux-searchtextbox-glyph-hover")
}
}, _inputPointerEnterHandler: function _inputPointerEnterHandler(eventInfo) {
if (this._buttonBackgroundElement && this._isMinimized) {
WinJS.Utilities.addClass(this._buttonBackgroundElement, "cux-searchtextbox-glyph-hover")
}
}, _inputKeyDownHandler: function _inputKeyDownHandler(eventInfo) {
if (eventInfo.keyCode === WinJS.Utilities.Key.enter) {
eventInfo.preventDefault()
}
PlatformJS.Utilities.setLastClickUserActionMethodWithNavMethod(Microsoft.Bing.AppEx.Telemetry.UserActionMethod.keyboard)
}, _setupMinimizedState: function _setupMinimizedState() {
this._isMinimized = true;
var activeElement=document.activeElement;
if (activeElement === this._queryInputElement || activeElement === this._queryFlyoutElement || activeElement === this._queryGlyphElement) {
this._expandSearchTextBox()
}
else {
this._collapseSearchTextBox()
}
}, _expandSearchTextBox: function _expandSearchTextBox() {
this._minimizeExpanded = true;
WinJS.Utilities.removeClass(this.element, "cux-searchtextbox-pagesearch-small");
if (window.innerWidth < _minimumFullWidth) {
WinJS.Utilities.addClass(this.element, "cux-searchtextbox-pagesearch-small-expanded")
}
WinJS.Utilities.addClass(this._buttonBackgroundElement, "cux-searchtextbox-button-hide");
WinJS.Utilities.removeClass(this._queryGlyphElement, "cux-searchtextbox-button-hide");
this._logInstrumentationDetails(JSON.stringify({SearchBoxInvoked: true}));
this._touchFocusingEvent = null
}, _collapseSearchTextBox: function _collapseSearchTextBox() {
this._minimizeExpanded = false;
WinJS.Utilities.removeClass(this.element, "cux-searchtextbox-pagesearch-small-expanded");
WinJS.Utilities.addClass(this.element, "cux-searchtextbox-pagesearch-small");
WinJS.Utilities.removeClass(this._buttonBackgroundElement, "cux-searchtextbox-button-hide");
WinJS.Utilities.addClass(this._queryGlyphElement, "cux-searchtextbox-button-hide");
if (this._autoSuggestionRequestAsyncPromise) {
this._autoSuggestionRequestAsyncPromise.cancel()
}
}, _logInstrumentationDetails: function _logInstrumentationDetails(jsonAttributes) {
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "SearchBox", "SearchTextBox", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, jsonAttributes)
}
}, {})
});
WinJS.Class.mix(CommonJS.Search.SearchTextBox, WinJS.UI.DOMEventMixin)
})()