/* Copyright (C) Microsoft Corporation. All rights reserved. */
/* >>>>>>/framework/scriptutilities.js:2 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */

(function(MS) {
    (function(Entertainment) {
        (function(Framework) {
            (function(ScriptUtilities) {
                function setOptions(target, options, setPublicMembersOnly) {
                    if (!target || !options || typeof options !== "object")
                        return;
                    Object.keys(options).forEach(function(key) {
                        var privateKey = "_" + key;
                        var value = options[key];
                        if (privateKey in target && !setPublicMembersOnly)
                            target[privateKey] = value;
                        else if (key in target)
                            target[key] = value
                    })
                }
                ScriptUtilities.setOptions = setOptions;
                function waitForSnappedIfNeeded(disallowUserDismiss) {
                    var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                    var waitForSnappedPromise = WinJS.Promise.as();
                    if (uiStateService.isSnapped)
                        waitForSnappedPromise = Entertainment.UI.Framework.loadTemplate("/Controls/PleaseResizeDialog.html", "pleaseResizeDialog", true).then(function() {
                            return Entertainment.UI.Controls.PleaseResizeDialog.waitForWindowResize(!!disallowUserDismiss)
                        });
                    return waitForSnappedPromise
                }
                ScriptUtilities.waitForSnappedIfNeeded = waitForSnappedIfNeeded;
                function _getTabStopsForElementsSubtree(element, includeNegativeTabStops) {
                    var tabStops = WinJS.Utilities.query("*", element).filter(function(candidateTabstop) {
                            if ((candidateTabstop.tabIndex < 0) && !includeNegativeTabStops)
                                return false;
                            if (candidateTabstop.hasAttribute("tabindex"))
                                return true;
                            switch (candidateTabstop.tagName.toLocaleLowerCase()) {
                                case"button":
                                    return true;
                                default:
                                    return false
                            }
                        });
                    return tabStops
                }
                function suppressTabbing(element) {
                    _getTabStopsForElementsSubtree(element, false).forEach(function(item) {
                        item.previousTabIndex = item.tabIndex;
                        item.tabIndex = -1
                    })
                }
                ScriptUtilities.suppressTabbing = suppressTabbing;
                function restoreTabbing(element) {
                    _getTabStopsForElementsSubtree(element, true).forEach(function(item) {
                        if (item.previousTabIndex === undefined)
                            return;
                        item.tabIndex = item.previousTabIndex;
                        item.previousTabIndex = undefined
                    })
                }
                ScriptUtilities.restoreTabbing = restoreTabbing;
                function initializeControlWithDeclarativeControls(control) {
                    Framework.assert(Entertainment.Utilities.isApp2, "initializeControlWithDeclarativeControls should only be called in app2");
                    var members = control.domElement.querySelectorAll("[data-win-blockbinding]");
                    var promises = [WinJS.UI.processAll(control.domElement.firstElementChild), function() {
                                return WinJS.UI.processAll(control.domElement)
                            }];
                    for (var i = members.length - 1; i >= 0; i--)
                        ScriptUtilities.addConstructionPromisesForElementTree(members[i], promises);
                    promises.push(function() {
                        MS.Entertainment.UI.Framework.processDeclMembers(control.domElement, control)
                    });
                    for (var i = 0; i < members.length; i++)
                        ScriptUtilities.addBindingsForElementTreePromise(members[i], promises);
                    ScriptUtilities.addBindingProcessPromise(control.domElement, promises);
                    for (var i = 0; i < members.length; i++)
                        ScriptUtilities.addBindingProcessPromise(members[i], promises);
                    return promises.reduce(function(current, next) {
                            return current.then(next)
                        }).then(null, function(error) {
                            Framework.fail("Error binding declarative controls: " + (error && error.message))
                        })
                }
                ScriptUtilities.initializeControlWithDeclarativeControls = initializeControlWithDeclarativeControls;
                function addConstructionPromisesForElementTree(element, promises) {
                    promises.push(function() {
                        return WinJS.UI.processAll(element.firstElementChild)
                    });
                    promises.push(function() {
                        return WinJS.UI.processAll(element)
                    });
                    promises.push(function() {
                        MS.Entertainment.UI.Framework.processDeclMembers(element, element.winControl)
                    });
                    promises.push(function() {
                        MS.Entertainment.UI.Framework.processDeclEvents(element)
                    })
                }
                ScriptUtilities.addConstructionPromisesForElementTree = addConstructionPromisesForElementTree;
                function addBindingsForElementTreePromise(element, promises) {
                    promises.push(function() {
                        var firstParentElement = element.parentElement;
                        while (firstParentElement && !firstParentElement.getAttribute("data-win-control"))
                            firstParentElement = firstParentElement.parentElement;
                        var promise = WinJS.Promise.as();
                        if (firstParentElement) {
                            var parentControl = firstParentElement.winControl;
                            var blockBinding = element.getAttribute("data-win-blockbinding");
                            var binds = blockBinding.split(';');
                            binds.forEach(function(bindingPairString) {
                                var bindingPair = bindingPairString.split(':');
                                if (bindingPair.length > 1) {
                                    var paths = bindingPair[1].trim().split('.');
                                    var bindingPath = {};
                                    var workingPath = bindingPath;
                                    for (var j = 0; j < paths.length - 1; j++) {
                                        workingPath[paths[j]] = {};
                                        workingPath = workingPath[paths[j]]
                                    }
                                    workingPath[paths[paths.length - 1]] = function(newValue) {
                                        element.winControl[bindingPair[0].trim()] = newValue;
                                        element.winControl.notify(bindingPair[0].trim(), newValue)
                                    };
                                    WinJS.Binding.bind(parentControl, bindingPath)
                                }
                                else if (bindingPair.length > 2)
                                    Framework.fail("Binding block format is incorrect.")
                            })
                        }
                        return WinJS.Promise.as()
                    })
                }
                ScriptUtilities.addBindingsForElementTreePromise = addBindingsForElementTreePromise;
                function addBindingProcessPromise(element, promises) {
                    promises.push(function() {
                        WinJS.Binding.processAll(element.firstElementChild, element.winControl)
                    })
                }
                ScriptUtilities.addBindingProcessPromise = addBindingProcessPromise
            })(Framework.ScriptUtilities || (Framework.ScriptUtilities = {}));
            var ScriptUtilities = Framework.ScriptUtilities;
            (function(PlayValidation) {
                var MediaPlayValidation = (function() {
                        function MediaPlayValidation(){}
                        MediaPlayValidation.prototype.validatePlayMedia = function(mediaItemToPlay) {
                            var _this = this;
                            return this.getSigningInPromise().then(function() {
                                    return _this.mediaPlaybackPromise(mediaItemToPlay)
                                })
                        };
                        MediaPlayValidation.prototype.getSigningInPromise = function() {
                            var signIn = Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                            var signedInSignal = new MS.Entertainment.UI.Framework.Signal;
                            var signInBindings;
                            var signInPromise = WinJS.Promise.wrap();
                            var cleanupSignInBindings = function() {
                                    if (!signInBindings)
                                        return;
                                    signInBindings.cancel();
                                    signInBindings = null;
                                    if (signedInSignal)
                                        signedInSignal.complete()
                                };
                            if (signIn.isSigningIn) {
                                signInBindings = WinJS.Binding.bind(signIn, {isSigningIn: cleanupSignInBindings});
                                signInPromise = signedInSignal.promise
                            }
                            return signInPromise
                        };
                        MediaPlayValidation.prototype.mediaPlaybackPromise = function(invokedMedia) {
                            if (!Entertainment.ServiceLocator.isServiceRegistered(Entertainment.Services.adService))
                                return WinJS.Promise.wrap();
                            var signal = new Entertainment.UI.Framework.Signal;
                            var adService = Entertainment.ServiceLocator.getService(Entertainment.Services.adService);
                            adService.isStreamingBlocked(invokedMedia).done(function(signInNeeded) {
                                var dialogDismissedSignal = new Entertainment.UI.Framework.Signal;
                                var dialogDismissed = function() {
                                        dialogDismissedSignal.complete()
                                    };
                                dialogDismissedSignal.promise.then(function() {
                                    var signIn = Entertainment.ServiceLocator.getService(Entertainment.Services.signIn);
                                    return (!signInNeeded || signIn.isSignedIn) ? adService.playVideoAdIfRequired(invokedMedia, null) : false
                                }).then(function(adPlayedIfNeeded) {
                                    if (adPlayedIfNeeded)
                                        signal.complete();
                                    else
                                        signal.promise.cancel();
                                    return WinJS.Promise.as()
                                }, function(error) {
                                    Entertainment.ViewModels.fail("playVideoAdIfRequired_failed: " + (error && error.message));
                                    signal.complete()
                                });
                                if (signInNeeded) {
                                    var featureEnablement = Entertainment.ServiceLocator.getService(Entertainment.Services.featureEnablement);
                                    var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                                    if (!featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicFreePlayAnonymous))
                                        Entertainment.Music.MusicBrandDialog.show(String.load(String.id.IDS_MUSIC_STREAMING_SIGN_IN_TITLE), String.load(String.id.IDS_MUSIC_STREAMING_SIGN_IN_DESC), null, [Entertainment.Music.MusicBrandDialog.dialogButtonIds.signUp, Entertainment.Music.MusicBrandDialog.dialogButtonIds.cancel], dialogDismissed);
                                    else if (configurationManager.service.lastSignedInUserXuid)
                                        Entertainment.Music.MusicBrandDialog.show(String.load(String.id.IDS_MUSIC_STREAMING_KEEP_PLAYING_EXISTING_USER_TITLE), String.load(String.id.IDS_MUSIC_STREAMING_SIGN_IN_DESC), null, [Entertainment.Music.MusicBrandDialog.dialogButtonIds.signInNowForExistingUser, Entertainment.Music.MusicBrandDialog.dialogButtonIds.cancel], dialogDismissed);
                                    else
                                        Entertainment.Music.MusicBrandDialog.show(String.load(String.id.IDS_MUSIC_STREAMING_KEEP_PLAYING_NEW_USER_TITLE), String.load(String.id.IDS_MUSIC_STREAMING_SIGN_IN_DESC), null, [Entertainment.Music.MusicBrandDialog.dialogButtonIds.signInNowForNewUser, Entertainment.Music.MusicBrandDialog.dialogButtonIds.cancel], dialogDismissed)
                                }
                                else
                                    dialogDismissed()
                            }, function(error) {
                                Entertainment.ViewModels.fail("isStreamingBlocked_failed: " + (error && error.message));
                                signal.error(error)
                            });
                            return signal.promise
                        };
                        return MediaPlayValidation
                    })();
                PlayValidation.MediaPlayValidation = MediaPlayValidation
            })(Framework.PlayValidation || (Framework.PlayValidation = {}));
            var PlayValidation = Framework.PlayValidation
        })(Entertainment.Framework || (Entertainment.Framework = {}));
        var Framework = Entertainment.Framework
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/searchviewmodelbase.js:224 */
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
    (function(Entertainment) {
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
        })(Entertainment.ViewModels || (Entertainment.ViewModels = {}));
        var ViewModels = Entertainment.ViewModels
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/searchgalleryviewmodelbase.js:454 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */

(function(MS) {
    (function(Entertainment) {
        (function(ViewModels) {
            (function(SearchGalleryViewModelModuleKeys) {
                SearchGalleryViewModelModuleKeys[SearchGalleryViewModelModuleKeys["collectionSearchModule"] = 0] = "collectionSearchModule";
                SearchGalleryViewModelModuleKeys[SearchGalleryViewModelModuleKeys["catalogSearchModule"] = 1] = "catalogSearchModule"
            })(ViewModels.SearchGalleryViewModelModuleKeys || (ViewModels.SearchGalleryViewModelModuleKeys = {}));
            var SearchGalleryViewModelModuleKeys = ViewModels.SearchGalleryViewModelModuleKeys
        })(Entertainment.ViewModels || (Entertainment.ViewModels = {}));
        var ViewModels = Entertainment.ViewModels
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/searchmodule.js:472 */
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
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");

(function(MS) {
    (function(Entertainment) {
        (function(ViewModels) {
            var SearchModule = (function(_super) {
                    __extends(SearchModule, _super);
                    function SearchModule(view, options) {
                        _super.call(this, view);
                        this._count = 0;
                        this._isExcludedFromPageState = false;
                        this._mediaContext = null;
                        this._searchText = null;
                        this._moduleState = -3;
                        Entertainment.Framework.ScriptUtilities.setOptions(this, options)
                    }
                    Object.defineProperty(SearchModule.prototype, "count", {
                        get: function() {
                            return this._count
                        }, set: function(value) {
                                this.updateAndNotify("count", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(SearchModule.prototype, "isExcludedFromPageState", {
                        get: function() {
                            return this._isExcludedFromPageState
                        }, set: function(value) {
                                this.updateAndNotify("isExcludedFromPageState", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(SearchModule.prototype, "mediaContext", {
                        get: function() {
                            return this._mediaContext
                        }, set: function(value) {
                                this.updateAndNotify("mediaContext", value);
                                if (this._mediaContext && this._mediaContext.containingMedia)
                                    this.containingMedia = this._mediaContext.containingMedia
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(SearchModule.prototype, "searchText", {
                        get: function() {
                            return this._searchText
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(SearchModule.prototype, "moduleState", {
                        get: function() {
                            return this._moduleState
                        }, set: function(value) {
                                this.updateAndNotify("moduleState", value)
                            }, enumerable: true, configurable: true
                    });
                    SearchModule.prototype.cloneCurrentQuery = function() {
                        if (!this._lastUsedQuery || !this._lastUsedQuery.clone)
                            return null;
                        return this._lastUsedQuery.clone()
                    };
                    SearchModule.prototype.dispose = function() {
                        _super.prototype.dispose.call(this);
                        this._releaseResultsChangeHandler()
                    };
                    SearchModule.prototype.load = function() {
                        return this.refresh()
                    };
                    SearchModule.prototype.reload = function() {
                        return this.refresh()
                    };
                    SearchModule.prototype._listenForResultChanges = function() {
                        var _this = this;
                        this._releaseResultsChangeHandler();
                        this._resultsChangedBinding = Entertainment.Utilities.addEventHandlers(this.items, {countChanged: function(result) {
                                if (result && result.detail) {
                                    var newCount = result.detail.newValue;
                                    if (newCount === 0)
                                        _this.moduleState = 0;
                                    else
                                        _this.moduleState = 2;
                                    _this.count = newCount
                                }
                            }})
                    };
                    SearchModule.prototype._onBeginQuery = function(lastUsedQuery) {
                        ViewModels.assert(this.searchText || this.searchText === String.empty, "Expected search query terms to be defined before searching.");
                        lastUsedQuery.keyword = this.searchText;
                        lastUsedQuery.search = this.searchText;
                        this.moduleState = 1
                    };
                    SearchModule.prototype._onQueryCompleted = function(query, useItemsCount) {
                        _super.prototype._onQueryCompleted.call(this, query);
                        if (!query || !query.result)
                            this.moduleState = -1;
                        else {
                            var count = useItemsCount ? query.result.items && query.result.items.count : query.result.totalCount;
                            if (count <= 0) {
                                this.moduleState = 0;
                                this.count = 0
                            }
                            else {
                                this.moduleState = 2;
                                this.count = count
                            }
                        }
                        this._listenForResultChanges()
                    };
                    SearchModule.prototype._onQueryFailed = function(error) {
                        _super.prototype._onQueryFailed.call(this, error);
                        this.moduleState = -1
                    };
                    SearchModule.prototype._releaseResultsChangeHandler = function() {
                        if (this._resultsChangedBinding) {
                            this._resultsChangedBinding.cancel();
                            this._resultsChangedBinding = null
                        }
                    };
                    return SearchModule
                })(ViewModels.QueryViewModel);
            ViewModels.SearchModule = SearchModule
        })(Entertainment.ViewModels || (Entertainment.ViewModels = {}));
        var ViewModels = Entertainment.ViewModels
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/video_win/videosearchviewmodelbase.js:607 */
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
    (function(Entertainment) {
        (function(ViewModels) {
            var VideoSearchViewModelBase = (function(_super) {
                    __extends(VideoSearchViewModelBase, _super);
                    function VideoSearchViewModelBase(searchText, searchScope) {
                        _super.call(this, searchText, searchScope);
                        this._collectionSelectionManager = null;
                        this._catalogSelectionManager = null;
                        var featureEnablement = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.featureEnablement);
                        this._isMarketplaceEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace) || featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace);
                        this.modules = [];
                        this._initializeModules();
                        this._initializePivots();
                        this._initializeModifiers()
                    }
                    Object.defineProperty(VideoSearchViewModelBase.prototype, "viewStateViewModel", {
                        get: function() {
                            if (!this._viewStateViewModel) {
                                var viewStateItems = new Array;
                                viewStateItems[-2] = new ViewModels.ViewStateItem(String.load(String.id.IDS_VIDEO_OFFLINE_HEADER), String.load(String.id.IDS_VIDEO_OFFLINE_DETAILS), []);
                                viewStateItems[-1] = new ViewModels.ViewStateItem(String.load(String.id.IDS_VIDEO_ERROR_HEADER), String.load(String.id.IDS_VIDEO_ERROR_DETAILS), []);
                                viewStateItems[0] = new ViewModels.ViewStateItem(String.load(String.id.IDS_VIDEO_LX_SEARCH_ALL_EMPTY_TITLE), String.load(String.id.IDS_VIDEO_LX_SEARCH_ALL_EMPTY_DESC), []);
                                this._viewStateViewModel = new ViewModels.ViewStateViewModel(viewStateItems)
                            }
                            return this._viewStateViewModel
                        }, enumerable: true, configurable: true
                    });
                    VideoSearchViewModelBase.prototype._initializePivots = function() {
                        var _this = this;
                        if (this.isMarketplaceEnabled) {
                            this._collectionHeaderPivot = new ViewModels.SearchResultHeaderPivotItem(String.id.IDS_VIDEO_LX_SEARCH_COLLECTION_FILTER_NO_COUNT, String.id.IDS_VIDEO_LX_SEARCH_COLLECTION_FILTER, String.id.IDS_VIDEO_LX_SEARCH_COLLECTION_FILTER_MAX_RESULTS, 1000, "collection");
                            this._catalogHeaderPivot = new ViewModels.SearchResultHeaderPivotItem(String.id.IDS_VIDEO_LX_SEARCH_STORE_FILTER_NO_COUNT, String.id.IDS_VIDEO_LX_SEARCH_STORE_FILTER, String.id.IDS_VIDEO_LX_SEARCH_STORE_FILTER_MAX_RESULTS, 1000, "catalog");
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
                    VideoSearchViewModelBase.prototype._initializeModifiers = function() {
                        var _this = this;
                        var modifierSelectionChangedBindings = this.modules.map(function(searchModule) {
                                return WinJS.Binding.bind(searchModule, {modifierSelectionManager: function() {
                                            return _this._updateModifierSelectionBindings()
                                        }})
                            });
                        this._addBindings(modifierSelectionChangedBindings)
                    };
                    VideoSearchViewModelBase.prototype._updateModifierSelectionBindings = function() {
                        var collectionSearchModule = this.modules[0];
                        var catalogSearchModule = this.modules[1];
                        if (collectionSearchModule && collectionSearchModule.modifierSelectionManager && !this._collectionSelectionManager) {
                            this._collectionSelectionManager = collectionSearchModule.modifierSelectionManager;
                            this._collectionSelectionManager.selectedIndex = 0;
                            var collectionSelectionBinding = Entertainment.UI.Framework.addEventHandlers(this._collectionSelectionManager, {selectedItemChanged: this._onModifierChanged.bind(this)});
                            this._addBinding(collectionSelectionBinding)
                        }
                        if (catalogSearchModule && catalogSearchModule.modifierSelectionManager && !this._catalogSelectionManager) {
                            this._catalogSelectionManager = catalogSearchModule.modifierSelectionManager;
                            this._catalogSelectionManager.selectedIndex = 0;
                            var catalogSelectionBinding = Entertainment.UI.Framework.addEventHandlers(this._catalogSelectionManager, {selectedItemChanged: this._onModifierChanged.bind(this)});
                            this._addBinding(catalogSelectionBinding)
                        }
                    };
                    VideoSearchViewModelBase.prototype._updateSelectedModifier = function(updateCurrent) {
                        var currentKey = this.isCollectionScope ? 0 : 1;
                        var previousKey = currentKey === 0 ? 1 : 0;
                        var currentSelectionManager = this.modules[currentKey].modifierSelectionManager;
                        var previousSelectionManager = this.modules[previousKey].modifierSelectionManager;
                        if (updateCurrent)
                            currentSelectionManager.selectedIndex = previousSelectionManager.selectedIndex;
                        else
                            previousSelectionManager.selectedIndex = currentSelectionManager.selectedIndex
                    };
                    VideoSearchViewModelBase.prototype._onModifierChanged = function() {
                        this._updateSelectedModifier(false)
                    };
                    VideoSearchViewModelBase.prototype._refreshEmptyViewState = function() {
                        if (this.isMarketplaceEnabled)
                            if (this.modules.map(function(m) {
                                return m.moduleState
                            }).every(function(state) {
                                return state === 0
                            })) {
                                this.viewStateViewModel.viewState = -3;
                                this.viewStateViewModel.viewStateItems[0] = new ViewModels.ViewStateItem(String.load(String.id.IDS_VIDEO_LX_SEARCH_COLLECTION_AND_CATALOG_EMPTY_TITLE), String.load(String.id.IDS_VIDEO_LX_SEARCH_ALL_EMPTY_DESC), []);
                                this.viewStateViewModel.viewState = 0
                            }
                            else
                                this.viewStateViewModel.viewStateItems[0] = new ViewModels.ViewStateItem(String.load(this.isCollectionScope ? String.id.IDS_VIDEO_LX_SEARCH_COLLECTION_EMPTY_TITLE : String.id.IDS_VIDEO_LX_SEARCH_CATALOG_EMPTY_TITLE), String.load(this.isCollectionScope ? String.id.IDS_VIDEO_LX_SEARCH_COLLECTION_EMPTY_DESC : String.id.IDS_VIDEO_LX_SEARCH_CATALOG_EMPTY_DESC), []);
                        else
                            this.viewStateViewModel.viewStateItems[0] = new ViewModels.ViewStateItem(String.load(String.id.IDS_VIDEO_LX_SEARCH_COLLECTION_EMPTY_TITLE_NO_CATALOG), String.load(String.id.IDS_VIDEO_LX_SEARCH_ALL_EMPTY_DESC), [])
                    };
                    return VideoSearchViewModelBase
                })(ViewModels.SearchViewModelBase);
            ViewModels.VideoSearchViewModelBase = VideoSearchViewModelBase
        })(Entertainment.ViewModels || (Entertainment.ViewModels = {}));
        var ViewModels = Entertainment.ViewModels
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/video_win/videosearchmodule.js:729 */
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
    (function(Entertainment) {
        (function(ViewModels) {
            var VideoSearchCollectionTemplate = (function() {
                    function VideoSearchCollectionTemplate() {
                        this.itemTemplate = "select(.templateid-collectionMovieVerticalTile)";
                        this.tap = Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.Tap.invokeOnly;
                        this.layout = Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.Layout.grid;
                        this.orientation = Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.Orientation.vertical;
                        this.zoomedOutLayout = Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.ZoomedOutLayout.list;
                        this.invokeHelperFactory = Entertainment.UI.Controls.GalleryControlInvocationHelper.create;
                        this.invokeBehavior = Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.InvokeBehavior.action;
                        this.actionOptions = {id: Entertainment.UI.Actions.ActionIdentifiers.navigateToVideoDetails};
                        this.forceInteractive = true;
                        this.minimumListLength = 1;
                        this.maxRows = NaN;
                        this.grouped = false;
                        this.hideShadow = true;
                        this.allowZoom = false;
                        this.allowSelectAll = false;
                        this.delayHydrateLibraryId = false;
                        this.selectionStyleFilled = false;
                        this.itemsDraggable = false;
                        this.swipeBehavior = Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.swipeBehavior.none;
                        this.selectionMode = Entertainment.UI.Controls.GalleryControl && Entertainment.UI.Controls.GalleryControl.SelectionMode.none
                    }
                    return VideoSearchCollectionTemplate
                })();
            ViewModels.VideoSearchCollectionTemplate = VideoSearchCollectionTemplate;
            var VideoSearchCollectionMoviesTemplate = (function(_super) {
                    __extends(VideoSearchCollectionMoviesTemplate, _super);
                    function VideoSearchCollectionMoviesTemplate() {
                        _super.apply(this, arguments);
                        this.itemTemplate = "/Components/Video_Win/SearchResultsPage.html#collectionMovieVerticalTile";
                        this.listViewClassName = "gallery-movies"
                    }
                    return VideoSearchCollectionMoviesTemplate
                })(VideoSearchCollectionTemplate);
            ViewModels.VideoSearchCollectionMoviesTemplate = VideoSearchCollectionMoviesTemplate;
            var VideoSearchCollectionTvTemplate = (function(_super) {
                    __extends(VideoSearchCollectionTvTemplate, _super);
                    function VideoSearchCollectionTvTemplate() {
                        _super.apply(this, arguments);
                        this.itemTemplate = "/Components/Video_Win/SearchResultsPage.html#collectionTvVerticalTile";
                        this.listViewClassName = "gallery-tv"
                    }
                    return VideoSearchCollectionTvTemplate
                })(VideoSearchCollectionTemplate);
            ViewModels.VideoSearchCollectionTvTemplate = VideoSearchCollectionTvTemplate;
            var VideoSearchCollectionPersonalVideosTemplate = (function(_super) {
                    __extends(VideoSearchCollectionPersonalVideosTemplate, _super);
                    function VideoSearchCollectionPersonalVideosTemplate() {
                        _super.apply(this, arguments);
                        this.itemTemplate = "/Components/Video_Win/SearchResultsPage.html#collectionOtherVerticalTile";
                        this.actionOptions = {id: Entertainment.UI.Actions.ActionIdentifiers.personalVideoNavigate};
                        this.listViewClassName = "gallery-personal"
                    }
                    return VideoSearchCollectionPersonalVideosTemplate
                })(VideoSearchCollectionTemplate);
            ViewModels.VideoSearchCollectionPersonalVideosTemplate = VideoSearchCollectionPersonalVideosTemplate;
            var VideoSearchCollectionTemplateSelector = (function(_super) {
                    __extends(VideoSearchCollectionTemplateSelector, _super);
                    function VideoSearchCollectionTemplateSelector(collectionView) {
                        _super.call(this);
                        this.addTemplate("collectionMovie", "/Components/Video_Win/SearchResultsPage.html#collectionMovieVerticalTile");
                        this.addTemplate("collectionTv", "/Components/Video_Win/SearchResultsPage.html#collectionTvVerticalTile");
                        this.addTemplate("collectionPersonalVideo", "/Components/Video_Win/SearchResultsPage.html#collectionOtherVerticalTile")
                    }
                    VideoSearchCollectionTemplateSelector.prototype.onSelectTemplate = function(item) {
                        var template = null;
                        if (item && item.data)
                            switch (item.data.mediaType) {
                                case Microsoft.Entertainment.Queries.ObjectType.video:
                                    template = item.data.videoType && item.data.videoType === Microsoft.Entertainment.Queries.VideoType.movie ? "collectionMovie" : "collectionPersonalVideo";
                                    break;
                                case Microsoft.Entertainment.Queries.ObjectType.tvSeries:
                                    template = "collectionTv";
                                    break
                            }
                        this.ensureTemplatesLoaded([template]);
                        return _super.prototype.getTemplateProvider.call(this, template)
                    };
                    return VideoSearchCollectionTemplateSelector
                })(Entertainment.UI.Controls.GalleryTemplateSelector);
            ViewModels.VideoSearchCollectionTemplateSelector = VideoSearchCollectionTemplateSelector;
            var VideoSearchCollectionAllTemplate = (function(_super) {
                    __extends(VideoSearchCollectionAllTemplate, _super);
                    function VideoSearchCollectionAllTemplate() {
                        _super.apply(this, arguments);
                        this.templateSelectorConstructor = VideoSearchCollectionTemplateSelector;
                        this.listViewClassName = "gallery-mixed"
                    }
                    return VideoSearchCollectionAllTemplate
                })(VideoSearchCollectionTemplate);
            ViewModels.VideoSearchCollectionAllTemplate = VideoSearchCollectionAllTemplate;
            var VideoSearchCatalogTemplate = (function(_super) {
                    __extends(VideoSearchCatalogTemplate, _super);
                    function VideoSearchCatalogTemplate() {
                        _super.apply(this, arguments);
                        this.itemTemplate = "select(.templateid-movieVerticalTile)";
                        this.delayHydrateLibraryId = true
                    }
                    return VideoSearchCatalogTemplate
                })(VideoSearchCollectionTemplate);
            ViewModels.VideoSearchCatalogTemplate = VideoSearchCatalogTemplate;
            var VideoSearchCatalogMoviesTemplate = (function(_super) {
                    __extends(VideoSearchCatalogMoviesTemplate, _super);
                    function VideoSearchCatalogMoviesTemplate() {
                        _super.apply(this, arguments);
                        this.itemTemplate = "/Components/Video_Win/SearchResultsPage.html#movieVerticalTile";
                        this.listViewClassName = "gallery-movies"
                    }
                    return VideoSearchCatalogMoviesTemplate
                })(VideoSearchCatalogTemplate);
            ViewModels.VideoSearchCatalogMoviesTemplate = VideoSearchCatalogMoviesTemplate;
            var VideoSearchCatalogTvTemplate = (function(_super) {
                    __extends(VideoSearchCatalogTvTemplate, _super);
                    function VideoSearchCatalogTvTemplate() {
                        _super.apply(this, arguments);
                        this.itemTemplate = "/Components/Video_Win/SearchResultsPage.html#tvVerticalTile";
                        this.listViewClassName = "gallery-tv"
                    }
                    return VideoSearchCatalogTvTemplate
                })(VideoSearchCatalogTemplate);
            ViewModels.VideoSearchCatalogTvTemplate = VideoSearchCatalogTvTemplate;
            var VideoSearchCatalogTemplateSelector = (function(_super) {
                    __extends(VideoSearchCatalogTemplateSelector, _super);
                    function VideoSearchCatalogTemplateSelector(collectionView) {
                        _super.call(this);
                        this.addTemplate("catalogMovie", "/Components/Video_Win/SearchResultsPage.html#movieVerticalTile");
                        this.addTemplate("catalogTv", "/Components/Video_Win/SearchResultsPage.html#tvVerticalTile")
                    }
                    VideoSearchCatalogTemplateSelector.prototype.onSelectTemplate = function(item) {
                        var template = null;
                        if (item && item.data)
                            switch (item.data.mediaType) {
                                case Microsoft.Entertainment.Queries.ObjectType.video:
                                    template = "catalogMovie";
                                    break;
                                case Microsoft.Entertainment.Queries.ObjectType.tvSeries:
                                    template = "catalogTv";
                                    break;
                                default:
                                    Trace.fail("Unknown media type passed to VideoSearchCatalogTemplateSelector.onSelectTemplate");
                                    break
                            }
                        this.ensureTemplatesLoaded([template]);
                        return _super.prototype.getTemplateProvider.call(this, template)
                    };
                    return VideoSearchCatalogTemplateSelector
                })(Entertainment.UI.Controls.GalleryTemplateSelector);
            ViewModels.VideoSearchCatalogTemplateSelector = VideoSearchCatalogTemplateSelector;
            var VideoSearchCatalogAllTemplate = (function(_super) {
                    __extends(VideoSearchCatalogAllTemplate, _super);
                    function VideoSearchCatalogAllTemplate() {
                        _super.apply(this, arguments);
                        this.templateSelectorConstructor = VideoSearchCatalogTemplateSelector;
                        this.listViewClassName = "gallery-mixed"
                    }
                    return VideoSearchCatalogAllTemplate
                })(VideoSearchCatalogTemplate);
            ViewModels.VideoSearchCatalogAllTemplate = VideoSearchCatalogAllTemplate;
            var VideoSearchModule = (function(_super) {
                    __extends(VideoSearchModule, _super);
                    function VideoSearchModule(view, options) {
                        _super.call(this, view, options);
                        this.selectedTemplate = new VideoSearchCollectionTemplate
                    }
                    Object.defineProperty(VideoSearchModule.prototype, "enableDelayInitialize", {
                        get: function() {
                            return true
                        }, enumerable: true, configurable: true
                    });
                    VideoSearchModule.prototype.createSelectionHandlers = function() {
                        return []
                    };
                    VideoSearchModule.prototype.delayInitialize = function() {
                        _super.prototype.delayInitialize.call(this);
                        this._raiseDelayLoadedEvent()
                    };
                    VideoSearchModule.prototype.refreshItems = function(){};
                    VideoSearchModule.prototype._onQueryCompleted = function(query) {
                        _super.prototype._onQueryCompleted.call(this, query, true)
                    };
                    VideoSearchModule.prototype.getViewDefinition = function(view) {
                        return VideoSearchModule.Views[view]
                    };
                    VideoSearchModule.prototype.getModifierDefinition = function(view) {
                        this._modifiers = this._modifiers || this._createModifiers();
                        return this._modifiers[view]
                    };
                    VideoSearchModule.prototype._createModifiers = function() {
                        return new VideoSearchModuleModifiers.Modifiers
                    };
                    VideoSearchModule.ViewTypes = {
                        searchCollection: "searchCollection", searchCatalog: "searchCatalog"
                    };
                    VideoSearchModule.Views = {
                        searchCollection: ViewModels.NodeValues.create({
                            queryOptions: {
                                chunkSize: 25, aggregateChunks: false
                            }, modifierOptions: {settingsKey: "search-collection-modifier-selection"}
                        }), searchCatalog: ViewModels.NodeValues.create({
                                queryOptions: {
                                    chunkSize: 25, aggregateChunks: false
                                }, modifierOptions: {settingsKey: "search-catalog-modifier-selection"}
                            })
                    };
                    return VideoSearchModule
                })(ViewModels.SearchModule);
            ViewModels.VideoSearchModule = VideoSearchModule;
            (function(VideoSearchModuleModifiers) {
                var Modifiers = (function() {
                        function Modifiers(){}
                        Object.defineProperty(Modifiers.prototype, "searchCollection", {
                            get: function() {
                                this._collection = this._collection || new VideoSearchModuleModifiers.Collection;
                                return this._collection
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(Modifiers.prototype, "searchCatalog", {
                            get: function() {
                                this._catalog = this._catalog || new VideoSearchModuleModifiers.Catalog;
                                return this._catalog
                            }, enumerable: true, configurable: true
                        });
                        return Modifiers
                    })();
                VideoSearchModuleModifiers.Modifiers = Modifiers;
                var Collection = (function() {
                        function Collection(){}
                        Collection.prototype.itemFactory = function() {
                            return [new MS.Entertainment.ViewModels.Node(Entertainment.UI.AutomationIds.videoSearchFilterAll, String.id.IDS_VIDEO_LX_SEARCH_MODIFIER_ALL, new MS.Entertainment.ViewModels.NodeValues(Entertainment.Data.Query.libraryMovieTVSeriesOther, {}, {selectedTemplate: new VideoSearchCollectionAllTemplate})), new MS.Entertainment.ViewModels.Node(Entertainment.UI.AutomationIds.videoSearchFilterMovies, String.id.IDS_VIDEO_LX_SEARCH_MODIFIER_MOVIES, new MS.Entertainment.ViewModels.NodeValues(Entertainment.Data.Query.libraryVideoMovies, {}, {selectedTemplate: new VideoSearchCollectionMoviesTemplate})), new MS.Entertainment.ViewModels.Node(Entertainment.UI.AutomationIds.videoSearchFilterTv, String.id.IDS_VIDEO_LX_SEARCH_MODIFIER_TV, new MS.Entertainment.ViewModels.NodeValues(Entertainment.Data.Query.libraryTVSeries, {}, {selectedTemplate: new VideoSearchCollectionTvTemplate}))]
                        };
                        return Collection
                    })();
                VideoSearchModuleModifiers.Collection = Collection;
                var Catalog = (function() {
                        function Catalog(){}
                        Catalog.prototype.itemFactory = function() {
                            return [new MS.Entertainment.ViewModels.Node(Entertainment.UI.AutomationIds.videoSearchFilterAll, String.id.IDS_VIDEO_LX_SEARCH_MODIFIER_ALL, new MS.Entertainment.ViewModels.NodeValues(Entertainment.Data.Query.Video.EdsCrossVideoSearch, {}, {selectedTemplate: new VideoSearchCatalogAllTemplate})), new MS.Entertainment.ViewModels.Node(Entertainment.UI.AutomationIds.videoSearchFilterMovies, String.id.IDS_VIDEO_LX_SEARCH_MODIFIER_MOVIES, new MS.Entertainment.ViewModels.NodeValues(Entertainment.Data.Query.Video.EdsSearchMovies, {}, {selectedTemplate: new VideoSearchCatalogMoviesTemplate})), new MS.Entertainment.ViewModels.Node(Entertainment.UI.AutomationIds.videoSearchFilterTv, String.id.IDS_VIDEO_LX_SEARCH_MODIFIER_TV, new MS.Entertainment.ViewModels.NodeValues(Entertainment.Data.Query.Video.EdsSearchTVSeries, {}, {selectedTemplate: new VideoSearchCatalogTvTemplate}))]
                        };
                        return Catalog
                    })();
                VideoSearchModuleModifiers.Catalog = Catalog
            })(ViewModels.VideoSearchModuleModifiers || (ViewModels.VideoSearchModuleModifiers = {}));
            var VideoSearchModuleModifiers = ViewModels.VideoSearchModuleModifiers
        })(Entertainment.ViewModels || (Entertainment.ViewModels = {}));
        var ViewModels = Entertainment.ViewModels
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/video_win/videosearchgalleryviewmodelbase.js:996 */
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
    (function(Entertainment) {
        (function(ViewModels) {
            var VideoSearchGalleryViewModelBase = (function(_super) {
                    __extends(VideoSearchGalleryViewModelBase, _super);
                    function VideoSearchGalleryViewModelBase(searchText, searchScope) {
                        _super.call(this, searchText, searchScope)
                    }
                    Object.defineProperty(VideoSearchGalleryViewModelBase.prototype, "searchResults", {
                        get: function() {
                            var key = this.isCollectionScope ? 0 : 1;
                            return this.modules[key]
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(VideoSearchGalleryViewModelBase.prototype, "searchModifierSelectionManager", {
                        get: function() {
                            this._updateSelectedModifier(true);
                            var key = this.isCollectionScope ? 0 : 1;
                            return this.modules[key].modifierSelectionManager
                        }, enumerable: true, configurable: true
                    });
                    VideoSearchGalleryViewModelBase.prototype._onPivotChanged = function() {
                        var _this = this;
                        _super.prototype._onPivotChanged.call(this);
                        this.dispatchChangeAndNotify("searchResults", this.searchResults, this.searchResults);
                        this.dispatchChangeAndNotify("searchModifierSelectionManager", this.searchModifierSelectionManager, this.searchModifierSelectionManager);
                        var waitForBindings = WinJS.Binding.bind(this, {searchResults: function() {
                                    if (waitForBindings) {
                                        waitForBindings.cancel();
                                        _this.refreshViewState()
                                    }
                                }})
                    };
                    VideoSearchGalleryViewModelBase.prototype._initializeModules = function() {
                        var options = {searchText: this.searchText};
                        this._addCollectionModule(new ViewModels.VideoSearchModule(ViewModels.VideoSearchModule.ViewTypes.searchCollection, options));
                        if (this.isMarketplaceEnabled)
                            this._addCatalogModule(new ViewModels.VideoSearchModule(ViewModels.VideoSearchModule.ViewTypes.searchCatalog, options));
                        _super.prototype._initializeModules.call(this)
                    };
                    return VideoSearchGalleryViewModelBase
                })(ViewModels.VideoSearchViewModelBase);
            ViewModels.VideoSearchGalleryViewModelBase = VideoSearchGalleryViewModelBase
        })(Entertainment.ViewModels || (Entertainment.ViewModels = {}));
        var ViewModels = Entertainment.ViewModels
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
})();
