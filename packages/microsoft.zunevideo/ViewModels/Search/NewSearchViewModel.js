/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function(undefined) {
    "use strict";
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {NewSearchViewModel: MS.Entertainment.UI.Framework.derive("MS.Entertainment.ViewModels.QueryViewModel", function newSearchViewModelConstructor(searchType, marketplaceEnabled, updateTitleOnFailureOnly) {
            this._searchType = searchType;
            this._updateTitleOnFailureOnly = updateTitleOnFailureOnly;
            var currentPage = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).currentPage;
            this._searchBindings = WinJS.Binding.bind(currentPage, {options: this._keywordChanged.bind(this)});
            if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.mediaDeleted)) {
                var deleteService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.mediaDeleted);
                this._deletedEvents = MS.Entertainment.Utilities.addEventHandlers(deleteService, {mediaDeleted: this._refreshOnDelete.bind(this)})
            }
            MS.Entertainment.ViewModels.QueryViewModel.prototype.constructor.call(this, searchType)
        }, {
            _searchType: String.empty, _useEDS: true, _query: String.empty, _linguisticAlternatives: null, _startedQuery: false, _resultIndices: null, _resultPopulated: null, _enabled: false, _searchBindings: null, _deletedEvents: null, _isOnline: true, _hideHcrIfOffline: false, _hasSearchedAtLeastOnce: false, _maxResultCount: 100, _views: null, _searchViewModel: null, _searchCallbacks: null, _searchTypeResults: null, _chosenSuggestion: null, _hcrResult: null, _addHcrToResults: false, _searchItems: null, _frozen: false, _disposed: false, _updateTitleOnFailureOnly: false, _keepPivotOnEmpty: false, dispose: function dispose() {
                    MS.Entertainment.ViewModels.QueryViewModel.prototype.dispose.call(this);
                    if (this._searchBindings) {
                        this._searchBindings.cancel();
                        this._searchBindings = null
                    }
                    if (this._deletedEvents) {
                        this._deletedEvents.cancel();
                        this._deletedEvents = null
                    }
                    this._disposed = true
                }, freeze: function freeze() {
                    this._frozen = true
                }, thaw: function thaw() {
                    if (this.refreshOnThaw)
                        this.refresh();
                    this._frozen = false
                }, getViewDefinition: function getViewDefinition(view) {
                    return this._views[view]
                }, getModifierDefinition: function getModifierDefinition(view) {
                    MS.Entertainment.ViewModels.assert(false, "base.getModifierDefinition should never be called")
                }, createActionCells: function createActionCells() {
                    return this.selectedTemplate && this.selectedTemplate.showModifierActions ? this.createModifierActionCells(this.selectedTemplate.strings.modifierGroupHeader) : null
                }, hasSearchedAtLeastOnce: function hasSearchedAtLeastOnce() {
                    return this._hasSearchedAtLeastOnce
                }, _keywordChanged: function _keywordChanged(newValue, oldValue) {
                    var currentPage = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).currentPage;
                    if (this._query)
                        this.pivotSelectedIndexOverride = 0;
                    if (currentPage.options && currentPage.options.chosenSuggestion && currentPage.options.chosenSuggestion !== this._chosenSuggestion)
                        this._chosenSuggestion = currentPage.options.chosenSuggestion;
                    else
                        this._chosenSuggestion = null;
                    if (currentPage.options && currentPage.options.linguisticAlternatives)
                        this._linguisticAlternatives = currentPage.options.linguisticAlternatives;
                    else
                        this._linguisticAlternatives = null;
                    if (currentPage.options && currentPage.options.keyword) {
                        this._query = currentPage.options.keyword.trim();
                        this.titleFormatValues = this._query;
                        this.refresh()
                    }
                }, _refreshOnDelete: function _refreshOnDelete() {
                    if (this._frozen) {
                        var searchResultCounts = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.searchResultCounts);
                        searchResultCounts.clearOnRestore = true;
                        this.refreshOnThaw = true
                    }
                    else {
                        MS.Entertainment.UI.Controls.PopOver.dismissCurrentPopOver();
                        this.refresh()
                    }
                }, _handleBeginQuery: function _handleBeginQuery(view, pivot, modifier) {
                    if (this._disposed)
                        return;
                    this._isOnline = MS.Entertainment.UI.NetworkStatusService.isOnline();
                    this.isLoading = true;
                    if (this.items) {
                        var searchResultCounts = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.searchResultCounts);
                        searchResultCounts.clearCounts();
                        MS.Entertainment.ViewModels.SearchViewModel.SearchCurrentFilter = this.modifierSelectionManager.selectedIndex
                    }
                    this._setItems(null);
                    this._searchItems = new MS.Entertainment.Data.VirtualList;
                    this._clearSearch();
                    if (!this._query || this._query.length < 1)
                        this._searchCompleted();
                    else {
                        var typeLength = this._searchTypeResults[this.view].length;
                        var modelOptions;
                        if (this.modifierSelectionManager.selectedItem)
                            modelOptions = this.modifierSelectionManager.selectedItem.value.modelOptions;
                        else if (this.modifierSelectionManager.dataSource && this.modifierSelectionManager.dataSource.item(0))
                            modelOptions = this.modifierSelectionManager.dataSource.item(0).value.modelOptions;
                        else
                            modelOptions = {};
                        modelOptions.linguisticAlternatives = this._linguisticAlternatives;
                        for (var i = 0; i < typeLength; i++)
                            this[this._searchTypeResults[this.view][i].callFunction](this._query, i, modelOptions)
                    }
                }, _clearSearch: function _clearSearch() {
                    this.isFailed = false;
                    if (this._updateTitleOnFailureOnly)
                        this.titleOverride = String.empty;
                    else if (MS.Entertainment.Utilities.isVideoApp1) {
                        var stringId = String.id.IDS_VIDEO_SEARCH_ALL_RESULT_TITLE;
                        if (this._lastUsedModifierItem.id === MS.Entertainment.ViewModels.VideoSearchAutomationIds.videoSearchAll)
                            stringId = String.id.IDS_VIDEO_SEARCH_ALL_RESULT_TITLE;
                        else if (this._lastUsedModifierItem.id === MS.Entertainment.ViewModels.VideoSearchAutomationIds.videoSearchMovies)
                            stringId = String.id.IDS_VIDEO_SEARCH_MOVIE_RESULT_TITLE;
                        else if (this._lastUsedModifierItem.id === MS.Entertainment.ViewModels.VideoSearchAutomationIds.videoSearchTV)
                            stringId = String.id.IDS_VIDEO_SEARCH_TV_RESULT_TITLE;
                        this.titleOverride = String.load(stringId).format(this._query)
                    }
                    else if (MS.Entertainment.Utilities.isVideoApp2) {
                        var stringId = String.id.IDS_VIDEO2_SEARCH_ALL_RESULT_TITLE;
                        if (this._lastUsedModifierItem.id === MS.Entertainment.ViewModels.VideoSearchAutomationIds.videoSearchAll)
                            stringId = String.id.IDS_VIDEO2_SEARCH_ALL_RESULT_TITLE;
                        else if (this._lastUsedModifierItem.id === MS.Entertainment.ViewModels.VideoSearchAutomationIds.videoSearchMovies)
                            stringId = String.id.IDS_VIDEO2_SEARCH_MOVIE_RESULT_TITLE;
                        else if (this._lastUsedModifierItem.id === MS.Entertainment.ViewModels.VideoSearchAutomationIds.videoSearchTV)
                            stringId = String.id.IDS_VIDEO2_SEARCH_TV_RESULT_TITLE;
                        else if (this._lastUsedModifierItem.id === MS.Entertainment.ViewModels.VideoSearchAutomationIds.videoSearchCast)
                            stringId = String.id.IDS_VIDEO2_SEARCH_CAST_RESULT_TITLE;
                        this.titleOverride = String.load(stringId).format(this._query)
                    }
                    else
                        this.titleOverride = String.load(String.id.IDS_SEARCH_RESULT_TITLE).format(this._query);
                    this._searchCallbacks = [];
                    var searchTypeResult = this._searchTypeResults[this._searchType];
                    var typeLength = searchTypeResult.length;
                    this._resultPopulated = [];
                    this._resultIndices = [];
                    for (var i = 0; i < typeLength; i++)
                        this._resultIndices[i] = 0;
                    if (this._searchViewModel) {
                        this._searchViewModel.searchCompleted = null;
                        this._searchViewModel = null
                    }
                    if (this._hcrResult) {
                        this._hcrResult.searchCompleted = null;
                        this._hcrResult = null
                    }
                }, _getHCRResult: function _getHCRResult() {
                    MS.Entertainment.ViewModels.assert(false, "base._getHCRResult should never be called")
                }, _findHCR: function _findHCR(query, resultType, options) {
                    if (this._hideHcrIfOffline && !this._isOnline) {
                        this._setResultPopulated(resultType, 0, true);
                        return
                    }
                    if (this._chosenSuggestion) {
                        this._chosenSuggestion.isHCR = true;
                        MS.Entertainment.Data.VirtualList.wrapArray([this._chosenSuggestion]).then(function(result) {
                            if (this._addHcrToResults || options.showMarketplace || this._chosenSuggestion.inCollection)
                                this._addHcrResult(result, resultType);
                            else
                                this._setResultPopulated(resultType, 0, true)
                        }.bind(this))
                    }
                    else {
                        this._hcrResult = this._getHCRResult();
                        this._hcrResult.searchCompleted = function() {
                            if (this._hcrResult.hcrResult) {
                                var hcr = this._hcrResult.hcrResult;
                                hcr.isHCR = true;
                                MS.Entertainment.Data.VirtualList.wrapArray([hcr]).then(function(result) {
                                    if (this._addHcrToResults || options.showMarketplace || hcr.inCollection)
                                        this._addHcrResult(result, resultType);
                                    else
                                        this._setResultPopulated(resultType, 0, true)
                                }.bind(this))
                            }
                            else
                                this._setResultPopulated(resultType, 0, true)
                        }.bind(this);
                        this._hcrResult.startSearch(query, this._useEDS)
                    }
                }, _addSearchCallback: function _addSearchCallback(query, resultType, options, resultName, resultEnabled) {
                    if (resultEnabled) {
                        this._search(query, options);
                        this._searchCallbacks.push(function _searchCallbacksCallback() {
                            this._addResult(this._searchViewModel[resultName], resultType)
                        }.bind(this))
                    }
                    else
                        this._setResultPopulated(resultType, 0, false)
                }, _search: function _search(query, options) {
                    if (this._disposed)
                        return;
                    if (!this._searchViewModel) {
                        this._searchCallbacks = [];
                        this._searchViewModel = new MS.Entertainment.ViewModels.SearchViewModel(options);
                        this._searchViewModel._maxResultCount = this._maxResultCount;
                        this._searchViewModel.searchCompleted = function _searchViewModelCallback() {
                            var searchResultCounts = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.searchResultCounts);
                            if (searchResultCounts.allCount === -1)
                                this._updateResultCounts(options);
                            var callbacksLength = this._searchCallbacks.length;
                            for (var i = 0; i < callbacksLength; i++)
                                this._searchCallbacks[i]()
                        }.bind(this);
                        this._searchViewModel.startSearch(query)
                    }
                }, _addHcrResult: function _addHcrResult(result, type) {
                    if (this._disposed)
                        return;
                    if (!this._hideHeaderForHCR)
                        return this._addResult(result, type);
                    else {
                        if (!result || (Array.isArray(result) && result.length === 0)) {
                            if (!this._searchTypeResults[this._searchType][type].includesHcrResult)
                                this._setResultPopulated(type);
                            return
                        }
                        var maxResults = this._searchTypeResults[this._searchType][type].maxResults;
                        result.itemsFromIndex(0, 0, maxResults - 1).done(function addRange(items) {
                            var count = items.items.length;
                            if (count > 0) {
                                var length = this._resultIndices.length;
                                for (var i = type + 1; i < length; i++)
                                    this._resultIndices[i] += count;
                                this._setLargeItemIndex(0);
                                if (this._searchTypeResults[this._searchType][type].includesHcrResult) {
                                    items.items[0].data.isHCR = true;
                                    if (!this._hcrResult) {
                                        this._hcrResult = {};
                                        this._hcrResult.hcrResult = items.items[0].data
                                    }
                                }
                                var wrappedHcr = new MS.Entertainment.Data.Factory.ListNoHeaderItemWrapper(items.items[0].data);
                                this._searchItems.insertAt(this._searchItems.noHeaderIndexFromSourceIndex(0), wrappedHcr, {isSourceData: true})
                            }
                            if (!this._searchTypeResults[this._searchType][type].includesHcrResult)
                                this._setResultPopulated(type)
                        }.bind(this))
                    }
                }, _addResult: function _addResult(result, type) {
                    if (!result || (Array.isArray(result) && result.length === 0)) {
                        this._setResultPopulated(type);
                        return
                    }
                    var maxResults = this._searchTypeResults[this._searchType][type].maxResults;
                    result.toArray(0, maxResults).done(function addRange(array) {
                        if (this._searchTypeResults[this._searchType][type].includesHcrResult)
                            array.splice(0, 1);
                        var count = array.length;
                        if (count > 0) {
                            var length = this._resultIndices.length;
                            for (var i = type + 1; i < length; i++)
                                this._resultIndices[i] += count;
                            this._searchItems.insertRangeAt(this._searchItems.noHeaderIndexFromSourceIndex(this._resultIndices[type]), array, {isSourceData: true})
                        }
                        if (this._searchTypeResults[this._searchType][type].includesHcrResult)
                            this._addHcrResult(result, type);
                        this._setResultPopulated(type)
                    }.bind(this))
                }, _setResultPopulated: function _setResultPopulated(type) {
                    this._resultPopulated[type] = true;
                    this._checkSearchCompleted()
                }, _updateResultCounts: function _updateResultCounts(options) {
                    MS.Entertainment.ViewModels.assert(false, "base._updateResultCounts should never be called")
                }, _addResultCount: function _addResultCount(resultName, countName, maxResultCount) {
                    var count;
                    var results = this._searchViewModel[resultName];
                    if (results && results.count) {
                        count = results.count;
                        if (maxResultCount !== undefined)
                            count = Math.min(count, maxResultCount)
                    }
                    else
                        count = 0;
                    var searchResultCounts = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.searchResultCounts);
                    if (searchResultCounts[countName] === -1)
                        searchResultCounts[countName] = count;
                    else
                        searchResultCounts[countName] += count;
                    if (searchResultCounts.allCount === -1)
                        searchResultCounts.allCount = count;
                    else
                        searchResultCounts.allCount += count
                }, _checkSearchCompleted: function _checkSearchCompleted() {
                    if (this._disposed)
                        return;
                    var searchCompleted = true;
                    var resultsLength = this._searchTypeResults[this._searchType].length;
                    var waitingForRequiredResults = false;
                    for (var i = 0; i < resultsLength; i++)
                        if (!this._resultPopulated[i]) {
                            searchCompleted = false;
                            if (this._searchTypeResults[this._searchType][i].requiredForDisplay)
                                waitingForRequiredResults = true
                        }
                    if ((!waitingForRequiredResults && this._searchItems.count) || searchCompleted)
                        this._setItems(this._searchItems);
                    if (searchCompleted)
                        this._searchCompleted()
                }, _searchCompleted: function _searchCompleted() {
                    if (this._disposed)
                        return;
                    this.isLoading = false;
                    var eventProvider = new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell;
                    eventProvider.traceSearch_Completed();
                    var searchResultCounts = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.searchResultCounts);
                    if (this._searchItems.count === 0 && !this._keepPivotOnEmpty)
                        this.pivotSelectedIndexOverride = 0;
                    if (searchResultCounts.allCount === 0)
                        if (MS.Entertainment.Utilities.isVideoApp) {
                            var stringId = String.id.IDS_VIDEO_SEARCH_ALL_NORESULT_TITLE;
                            if (this._lastUsedModifierItem.id === MS.Entertainment.ViewModels.VideoSearchAutomationIds.videoSearchAll)
                                if (MS.Entertainment.Utilities.isVideoApp2)
                                    stringId = String.id.IDS_VIDEO2_SEARCH_ALL_NORESULT_TITLE;
                                else
                                    stringId = String.id.IDS_VIDEO_SEARCH_ALL_NORESULT_TITLE;
                            else if (this._lastUsedModifierItem.id === MS.Entertainment.ViewModels.VideoSearchAutomationIds.videoSearchMovies)
                                stringId = String.id.IDS_VIDEO_SEARCH_MOVIE_NORESULT_TITLE;
                            else if (this._lastUsedModifierItem.id === MS.Entertainment.ViewModels.VideoSearchAutomationIds.videoSearchTV)
                                stringId = String.id.IDS_VIDEO_SEARCH_TV_NORESULT_TITLE;
                            else if (this._lastUsedModifierItem.id === MS.Entertainment.ViewModels.VideoSearchAutomationIds.videoSearchCast)
                                stringId = String.id.IDS_VIDEO_SEARCH_CAST_NORESULT_TITLE;
                            this.failedGalleryModel = {primaryText: String.load(stringId).format(this._query)};
                            this.isFailed = true
                        }
                        else
                            this.titleOverride = String.load(String.id.IDS_SEARCH_NORESULT_TITLE).format(this._query);
                    else if (!this._updateTitleOnFailureOnly)
                        if (MS.Entertainment.Utilities.isVideoApp1) {
                            var stringId = String.id.IDS_VIDEO_SEARCH_ALL_RESULT_TITLE;
                            if (this._lastUsedModifierItem.id === MS.Entertainment.ViewModels.VideoSearchAutomationIds.videoSearchAll)
                                stringId = String.id.IDS_VIDEO_SEARCH_ALL_RESULT_TITLE;
                            else if (this._lastUsedModifierItem.id === MS.Entertainment.ViewModels.VideoSearchAutomationIds.videoSearchMovies)
                                stringId = String.id.IDS_VIDEO_SEARCH_MOVIE_RESULT_TITLE;
                            else if (this._lastUsedModifierItem.id === MS.Entertainment.ViewModels.VideoSearchAutomationIds.videoSearchTV)
                                stringId = String.id.IDS_VIDEO_SEARCH_TV_RESULT_TITLE;
                            this.titleOverride = String.load(stringId).format(this._query)
                        }
                        else if (MS.Entertainment.Utilities.isVideoApp2) {
                            var stringId = String.id.IDS_VIDEO2_SEARCH_ALL_RESULT_TITLE;
                            if (this._lastUsedModifierItem.id === MS.Entertainment.ViewModels.VideoSearchAutomationIds.videoSearchAll)
                                stringId = String.id.IDS_VIDEO2_SEARCH_ALL_RESULT_TITLE;
                            else if (this._lastUsedModifierItem.id === MS.Entertainment.ViewModels.VideoSearchAutomationIds.videoSearchMovies)
                                stringId = String.id.IDS_VIDEO2_SEARCH_MOVIE_RESULT_TITLE;
                            else if (this._lastUsedModifierItem.id === MS.Entertainment.ViewModels.VideoSearchAutomationIds.videoSearchTV)
                                stringId = String.id.IDS_VIDEO2_SEARCH_TV_RESULT_TITLE;
                            else if (this._lastUsedModifierItem.id === MS.Entertainment.ViewModels.VideoSearchAutomationIds.videoSearchCast)
                                stringId = String.id.IDS_VIDEO2_SEARCH_CAST_RESULT_TITLE;
                            this.titleOverride = String.load(stringId).format(this._query)
                        }
                        else
                            this.titleOverride = String.load(String.id.IDS_SEARCH_RESULT_TITLE).format(this._query);
                    var media = this._hcrResult && this._hcrResult.hcrResult;
                    MS.Entertainment.Utilities.Telemetry.logSearchEnter(media);
                    this._hasSearchedAtLeastOnce = true;
                    if (this.searchCompleted)
                        this.searchCompleted(this._searchItems.count)
                }
        }, {SearchCurrentFilter: 0})})
})()
