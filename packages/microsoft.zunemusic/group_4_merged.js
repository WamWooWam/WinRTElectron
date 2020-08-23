/* Copyright (C) Microsoft Corporation. All rights reserved. */
/* >>>>>>/controls/music1/searchresultsview.js:2 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p];
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    };

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var UI;
        (function(UI) {
            var Controls;
            (function(Controls) {
                MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls");
                var SearchResultsView = (function(_super) {
                        __extends(SearchResultsView, _super);
                        function SearchResultsView(element, options) {
                            _super.call(this, element, options);
                            UI.Framework.processDeclarativeControlContainer(this)
                        }
                        SearchResultsView.prototype.initialize = function() {
                            if (SearchResultsView._searchPageRefCount === 0)
                                WinJS.Utilities.addClass(document.body, "activepage-search");
                            if (this.enableAutoScroll)
                                this._enableFocusEventHandlers("details-layoutRoot");
                            SearchResultsView._searchPageRefCount++;
                            this._dataContextChangedEvents = Entertainment.Utilities.addEventHandlers(this, {dataContextChanged: this._onDataContextChanged.bind(this)}, true)
                        };
                        SearchResultsView.prototype._onDataContextChanged = function() {
                            if (this._pivotChangedEvents) {
                                this._pivotChangedEvents.cancel();
                                this._pivotChangedEvents
                            }
                            var viewModel = this.dataContext;
                            if (viewModel)
                                this._pivotChangedEvents = Entertainment.Utilities.addEventHandlers(viewModel.pivotsSelectionManager, {selectedItemChanged: this._onPivotChanged.bind(this)}, true)
                        };
                        SearchResultsView.prototype._onPivotChanged = function() {
                            this._refreshSelectionManager()
                        };
                        SearchResultsView.prototype.unload = function() {
                            _super.prototype.unload.call(this);
                            SearchResultsView._searchPageRefCount--;
                            if (SearchResultsView._searchPageRefCount === 0)
                                WinJS.Utilities.removeClass(document.body, "activepage-search");
                            if (this._pivotChangedEvents) {
                                this._pivotChangedEvents.cancel();
                                this._pivotChangedEvents
                            }
                            if (this._dataContextChangedEvents) {
                                this._dataContextChangedEvents.cancel();
                                this._dataContextChangedEvents
                            }
                        };
                        SearchResultsView.prototype.onAlbumsHeaderInvoked = function(event) {
                            var viewModel = this.dataContext;
                            this._executeModuleHeaderAction(viewModel.albums, event.target)
                        };
                        SearchResultsView.prototype.onArtistsHeaderInvoked = function(event) {
                            var viewModel = this.dataContext;
                            this._executeModuleHeaderAction(viewModel.artists, event.target)
                        };
                        SearchResultsView.prototype.onSongsHeaderInvoked = function(event) {
                            var viewModel = this.dataContext;
                            this._executeModuleHeaderAction(viewModel.songs, event.target)
                        };
                        SearchResultsView.prototype._executeModuleHeaderAction = function(invokedModule, referenceElement) {
                            var action = invokedModule && invokedModule.moduleAction;
                            if (action)
                                if (!event.keyCode || event.keyCode === WinJS.Utilities.Key.enter || event.keyCode === WinJS.Utilities.Key.space) {
                                    action.requeryCanExecute();
                                    if (action.isEnabled)
                                        action.execute(referenceElement)
                                }
                        };
                        SearchResultsView._searchPageRefCount = 0;
                        return SearchResultsView
                    })(Controls.PageViewBase);
                Controls.SearchResultsView = SearchResultsView
            })(Controls = UI.Controls || (UI.Controls = {}))
        })(UI = Entertainment.UI || (Entertainment.UI = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}));
WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.SearchResultsView)
})();
/* >>>>>>/viewmodels/searchviewmodelbase.js:95 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p];
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    };

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var ViewModels;
        (function(ViewModels) {
            (function(SearchResultsScopes) {
                SearchResultsScopes[SearchResultsScopes["collection"] = 0] = "collection";
                SearchResultsScopes[SearchResultsScopes["catalog"] = 1] = "catalog"
            })(ViewModels.SearchResultsScopes || (ViewModels.SearchResultsScopes = {}));
            var SearchResultsScopes = ViewModels.SearchResultsScopes;
            var SearchViewModelBase = (function(_super) {
                    __extends(SearchViewModelBase, _super);
                    function SearchViewModelBase(searchText, searchScope) {
                        _super.call(this);
                        this._catalogHeaderPivot = null;
                        this._catalogModules = [];
                        this._collectionHeaderPivot = null;
                        this._collectionModules = [];
                        this._bindings = [];
                        this._isMarketplaceEnabled = true;
                        this._pivotsSelectionManager = null;
                        this._searchText = String.empty;
                        this._searchResultText = String.empty;
                        this._searchScope = 0;
                        this._viewStateViewModel = null;
                        this._searchText = searchText;
                        this.searchResultsText = searchText;
                        this._searchScope = searchScope
                    }
                    Object.defineProperty(SearchViewModelBase.prototype, "isCatalogScope", {
                        get: function() {
                            return this._searchScope === 1
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(SearchViewModelBase.prototype, "isCollectionScope", {
                        get: function() {
                            return this._searchScope === 0
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(SearchViewModelBase.prototype, "isMarketplaceEnabled", {
                        get: function() {
                            return this._isMarketplaceEnabled
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(SearchViewModelBase.prototype, "pivotsSelectionManager", {
                        get: function() {
                            return this._pivotsSelectionManager
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(SearchViewModelBase.prototype, "searchResultsText", {
                        get: function() {
                            return this._searchResultText
                        }, set: function(value) {
                                this._searchResultText = String.load(SearchViewModelBase.RESULTS_STRING_FORMAT).format(value);
                                this.updateAndNotify("searchResultsText", this._searchResultText)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(SearchViewModelBase.prototype, "searchScope", {
                        get: function() {
                            return this._searchScope
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(SearchViewModelBase.prototype, "searchText", {
                        get: function() {
                            return this._searchText
                        }, enumerable: true, configurable: true
                    });
                    SearchViewModelBase.prototype.scheduledDelayInitialize = function() {
                        this.modules.forEach(function(searchModule) {
                            searchModule.delayInitialize()
                        })
                    };
                    SearchViewModelBase.prototype.dispose = function() {
                        this._bindings.forEach(function(binding) {
                            binding.cancel();
                            binding = null
                        });
                        if (this._pivotsSelectionManager) {
                            this._pivotsSelectionManager.dispose();
                            this._pivotsSelectionManager = null
                        }
                        _super.prototype.dispose.call(this)
                    };
                    SearchViewModelBase.prototype.navigatedBackTo = function() {
                        this.modules.forEach(function(searchModule) {
                            searchModule.refreshItems()
                        })
                    };
                    SearchViewModelBase.prototype.loadModules = function() {
                        if (!this.isOnline && this.isMarketplaceEnabled) {
                            this._searchScope = 0;
                            this._pivotsSelectionManager.selectedItem = this._collectionHeaderPivot
                        }
                        this._updateModuleSearchScope();
                        this.modules.forEach(function(searchModule) {
                            searchModule.load()
                        })
                    };
                    SearchViewModelBase.prototype._initializeModules = function() {
                        this.listenForModuleViewStateChanges()
                    };
                    SearchViewModelBase.prototype._addBinding = function(binding) {
                        this._bindings.push(binding)
                    };
                    SearchViewModelBase.prototype._addBindings = function(bindings) {
                        this._bindings = this._bindings.concat(bindings)
                    };
                    SearchViewModelBase.prototype._addCatalogModule = function(searchModule) {
                        this._catalogModules.push(searchModule);
                        this.modules = this._collectionModules.concat(this._catalogModules)
                    };
                    SearchViewModelBase.prototype._addCollectionModule = function(searchModule) {
                        this._collectionModules.push(searchModule);
                        this.modules = this._collectionModules.concat(this._catalogModules)
                    };
                    SearchViewModelBase.prototype._onPivotChanged = function() {
                        this.delayInitialize();
                        this._searchScope = this._collectionHeaderPivot.selected ? 0 : 1;
                        this._updateModuleSearchScope();
                        this._refreshEmptyViewState();
                        this.viewStateViewModel.viewState = -3
                    };
                    SearchViewModelBase.prototype._updateModuleSearchScope = function() {
                        var _this = this;
                        this._collectionModules.forEach(function(collectionModule) {
                            collectionModule.isExcludedFromPageState = _this.isCatalogScope
                        });
                        this._catalogModules.forEach(function(catalogModule) {
                            catalogModule.isExcludedFromPageState = _this.isCollectionScope
                        })
                    };
                    SearchViewModelBase.prototype._updatePivotCount = function(pivot, modules) {
                        var modulesCountable = modules.every(function(module) {
                                return module.moduleState === 2 || module.moduleState === 0
                            });
                        if (modulesCountable)
                            pivot.count = modules.map(function(module) {
                                return module.count
                            }).reduce(function(total, currentValue) {
                                return (total + currentValue)
                            });
                        else {
                            var isLoadCompleted = Entertainment.Utilities.ViewState.isStateCompleted(this.viewStateViewModel.viewState);
                            if (isLoadCompleted)
                                pivot.count = 0
                        }
                    };
                    SearchViewModelBase.prototype._updatePivotCounts = function() {
                        this._updatePivotCount(this._collectionHeaderPivot, this._collectionModules);
                        if (this.isMarketplaceEnabled)
                            this._updatePivotCount(this._catalogHeaderPivot, this._catalogModules)
                    };
                    SearchViewModelBase.CATALOG_PIVOT_ID = "catalog";
                    SearchViewModelBase.CATALOG_RESULT_COUNT_MAX_THRESHOLD = 1000;
                    SearchViewModelBase.COLLECTION_PIVOT_ID = "collection";
                    SearchViewModelBase.COLLECTION_RESULT_COUNT_MAX_THRESHOLD = 1000;
                    SearchViewModelBase.RESULTS_STRING_FORMAT = String.id.IDS_SEARCH_RESULT_TITLE_TC;
                    return SearchViewModelBase
                })(ViewModels.PageViewModelBase);
            ViewModels.SearchViewModelBase = SearchViewModelBase;
            var SearchResultHeaderPivotItem = (function(_super) {
                    __extends(SearchResultHeaderPivotItem, _super);
                    function SearchResultHeaderPivotItem(labelWithoutCountStringId, labelWithCountStringId, labelWithMaxCountStringId, maxCount, id) {
                        _super.call(this);
                        this._selected = false;
                        this._labelWithoutCount = String.empty;
                        this._labelWithCount = String.empty;
                        this._labelWithMaxCount = String.empty;
                        this._maxCount = 0;
                        this._label = String.empty;
                        this._id = String.empty;
                        this._label = this._labelWithoutCount = String.load(labelWithoutCountStringId);
                        this._labelWithCount = String.load(labelWithCountStringId);
                        this._labelWithMaxCount = String.load(labelWithMaxCountStringId).format(maxCount);
                        this._maxCount = maxCount;
                        this._id = id
                    }
                    Object.defineProperty(SearchResultHeaderPivotItem.prototype, "label", {
                        get: function() {
                            return this._label
                        }, set: function(value) {
                                this.updateAndNotify("label", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(SearchResultHeaderPivotItem.prototype, "selected", {
                        get: function() {
                            return this._selected
                        }, set: function(value) {
                                this.updateAndNotify("selected", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(SearchResultHeaderPivotItem.prototype, "id", {
                        get: function() {
                            return this._id
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(SearchResultHeaderPivotItem.prototype, "count", {
                        set: function(value) {
                            MS.Entertainment.ViewModels.assert(value >= 0, "Negative count values are not valid in a search pivot.");
                            var decimalNumberFormatter = Entertainment.ServiceLocator.getService(Entertainment.Services.dateTimeFormatters).decimalNumber;
                            var formattedCount = decimalNumberFormatter.format(value);
                            var label = this._labelWithoutCount;
                            if (value >= 0 && value < this._maxCount)
                                label = this._labelWithCount.format(formattedCount);
                            else if (value >= this._maxCount)
                                label = this._labelWithMaxCount;
                            this.label = label
                        }, enumerable: true, configurable: true
                    });
                    return SearchResultHeaderPivotItem
                })(Entertainment.UI.Framework.ObservableBase);
            ViewModels.SearchResultHeaderPivotItem = SearchResultHeaderPivotItem
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/music/musicsearchviewmodelbase.js:325 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p];
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    };

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var ViewModels;
        (function(ViewModels) {
            var MusicSearchViewModelBase = (function(_super) {
                    __extends(MusicSearchViewModelBase, _super);
                    function MusicSearchViewModelBase(searchText, searchScope) {
                        _super.call(this, searchText, searchScope);
                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        this._isMarketplaceEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace);
                        this.modules = [];
                        this._initializeModules();
                        this._initializePivots()
                    }
                    Object.defineProperty(MusicSearchViewModelBase.prototype, "viewStateViewModel", {
                        get: function() {
                            if (!this._viewStateViewModel) {
                                var viewStateItems = new Array;
                                viewStateItems[-2] = new ViewModels.ViewStateItem(String.load(String.id.IDS_MUSIC_OFFLINE_HEADER), String.load(String.id.IDS_MUSIC_OFFLINE_DETAILS), []);
                                viewStateItems[-1] = new ViewModels.ViewStateItem(String.load(String.id.IDS_MUSIC_ERROR_HEADER), String.load(String.id.IDS_MUSIC_ERROR_DETAILS), []);
                                viewStateItems[0] = new ViewModels.ViewStateItem(String.load(String.id.IDS_MUSIC_SEARCH_ALL_EMPTY_TITLE), String.load(String.id.IDS_MUSIC_SEARCH_ALL_EMPTY_DESC), []);
                                this._viewStateViewModel = new ViewModels.ViewStateViewModel(viewStateItems)
                            }
                            return this._viewStateViewModel
                        }, enumerable: true, configurable: true
                    });
                    MusicSearchViewModelBase.prototype._initializePivots = function() {
                        var _this = this;
                        if (this.isMarketplaceEnabled) {
                            this._collectionHeaderPivot = new ViewModels.SearchResultHeaderPivotItem(String.id.IDS_MUSIC_SEARCH_COLLECTION_FILTER_NO_COUNT, String.id.IDS_MUSIC_SEARCH_COLLECTION_FILTER, String.id.IDS_MUSIC_SEARCH_COLLECTION_FILTER_MAX_RESULTS, ViewModels.MusicSearchHubViewModelBase.COLLECTION_RESULT_COUNT_MAX_THRESHOLD, ViewModels.MusicSearchHubViewModelBase.COLLECTION_PIVOT_ID);
                            this._catalogHeaderPivot = new ViewModels.SearchResultHeaderPivotItem(String.id.IDS_MUSIC_SEARCH_CATALOG_FILTER_NO_COUNT, String.id.IDS_MUSIC_SEARCH_CATALOG_FILTER, String.id.IDS_MUSIC_SEARCH_CATALOG_FILTER_MAX_RESULTS, ViewModels.MusicSearchHubViewModelBase.CATALOG_RESULT_COUNT_MAX_THRESHOLD, ViewModels.MusicSearchHubViewModelBase.CATALOG_PIVOT_ID);
                            this._pivotsSelectionManager = new Entertainment.UI.Framework.SelectionManager([this._collectionHeaderPivot, this._catalogHeaderPivot]);
                            this._pivotsSelectionManager.selectedItem = (this._searchScope === 0) ? this._collectionHeaderPivot : this._catalogHeaderPivot;
                            var selectionBinding = Entertainment.UI.Framework.addEventHandlers(this._pivotsSelectionManager, {selectedItemChanged: this._onPivotChanged.bind(this)});
                            this._addBinding(selectionBinding);
                            var countChangeBindings = this.modules.map(function(searchModule) {
                                    return WinJS.Binding.bind(searchModule, {count: function() {
                                                return _this._updatePivotCounts()
                                            }})
                                });
                            this._addBindings(countChangeBindings)
                        }
                    };
                    MusicSearchViewModelBase.prototype._refreshEmptyViewState = function() {
                        if (this.isMarketplaceEnabled)
                            if (this.modules.map(function(m) {
                                return m.moduleState
                            }).every(function(state) {
                                return state === 0
                            })) {
                                this.viewStateViewModel.viewState = -3;
                                this.viewStateViewModel.viewStateItems[0] = new ViewModels.ViewStateItem(String.load(String.id.IDS_MUSIC_SEARCH_COLLECTION_AND_CATALOG_EMPTY_TITLE), String.load(String.id.IDS_MUSIC_SEARCH_ALL_EMPTY_DESC), []);
                                this.viewStateViewModel.viewState = 0
                            }
                            else
                                this.viewStateViewModel.viewStateItems[0] = new ViewModels.ViewStateItem(String.load(this.isCollectionScope ? String.id.IDS_MUSIC_SEARCH_COLLECTION_EMPTY_TITLE : String.id.IDS_MUSIC_SEARCH_CATALOG_EMPTY_TITLE), String.load(this.isCollectionScope ? String.id.IDS_MUSIC_SEARCH_COLLECTION_EMPTY_DESC : String.id.IDS_MUSIC_SEARCH_CATALOG_EMPTY_DESC), []);
                        else
                            this.viewStateViewModel.viewStateItems[0] = new ViewModels.ViewStateItem(String.load(String.id.IDS_MUSIC_SEARCH_COLLECTION_EMPTY_TITLE_NO_CATALOG), String.load(String.id.IDS_MUSIC_SEARCH_ALL_EMPTY_DESC), [])
                    };
                    return MusicSearchViewModelBase
                })(ViewModels.SearchViewModelBase);
            ViewModels.MusicSearchViewModelBase = MusicSearchViewModelBase
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
