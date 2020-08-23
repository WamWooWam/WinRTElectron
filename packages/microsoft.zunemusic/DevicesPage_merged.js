/* Copyright (C) Microsoft Corporation. All rights reserved. */
/* >>>>>>/controls/music1/devicespageview.js:2 */
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
                var DevicesPageView = (function(_super) {
                        __extends(DevicesPageView, _super);
                        function DevicesPageView(element, options) {
                            _super.call(this, element, options);
                            this.loadModulesImmediately = true;
                            MS.Entertainment.UI.Framework.processDeclarativeControlContainer(this)
                        }
                        DevicesPageView.prototype.onMusicPassSignUpClick = function(event) {
                            var viewModel = this.dataContext;
                            this.invokeActionForEvent(event, viewModel && viewModel.upsell && viewModel.upsell.action)
                        };
                        return DevicesPageView
                    })(Controls.PageViewBase);
                Controls.DevicesPageView = DevicesPageView
            })(Controls = UI.Controls || (UI.Controls = {}))
        })(UI = Entertainment.UI || (Entertainment.UI = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}));
WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.DevicesPageView)
})();
/* >>>>>>/viewmodels/music1/devicegallerymodulebase.js:43 */
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
            MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");
            var ViewState = MS.Entertainment.UI.ViewState;
            var DeviceGalleryModuleBase = (function(_super) {
                    __extends(DeviceGalleryModuleBase, _super);
                    function DeviceGalleryModuleBase(view, resetFilterSaves) {
                        this._isExcludedFromPageState = false;
                        this._moduleState = -3;
                        this._resetFilterSavesOnce = resetFilterSaves;
                        _super.call(this, view);
                        this.applyNotificationFiltering = false
                    }
                    Object.defineProperty(DeviceGalleryModuleBase.prototype, "count", {
                        get: function() {
                            return this.totalCount
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(DeviceGalleryModuleBase.prototype, "isExcludedFromPageState", {
                        get: function() {
                            return this._isExcludedFromPageState
                        }, set: function(value) {
                                this.updateAndNotify("isExcludedFromPageState", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(DeviceGalleryModuleBase.prototype, "moduleState", {
                        get: function() {
                            return this._moduleState
                        }, set: function(value) {
                                this.updateAndNotify("moduleState", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(DeviceGalleryModuleBase.prototype, "selectedFilter", {
                        get: function() {
                            return this.filterSelectionManager && this.filterSelectionManager.selectedItem
                        }, enumerable: true, configurable: true
                    });
                    DeviceGalleryModuleBase.prototype.freeze = function(){};
                    DeviceGalleryModuleBase.prototype.thaw = function() {
                        if (this.filterSelectionManager)
                            this.filterSelectionManager.saveSelection()
                    };
                    DeviceGalleryModuleBase.prototype.getFilterDefinition = function(view) {
                        if (!this._filters)
                            this._filters = new DeviceFilterDefinition;
                        return this._filters
                    };
                    DeviceGalleryModuleBase.prototype.getFilterOptions = function(view) {
                        var result = {
                                settingsKey: DeviceGalleryModuleBase._deviceFilterSettingsKey, isRoamingSetting: false
                            };
                        if (this._resetFilterSavesOnce) {
                            this._resetFilterSavesOnce = false;
                            result.selectedIndex = 0
                        }
                        return result
                    };
                    DeviceGalleryModuleBase.prototype.load = function() {
                        var promise;
                        if (this.isOnline) {
                            if (this.moduleState !== 1) {
                                this.moduleState = 1;
                                promise = this.refresh()
                            }
                        }
                        else
                            this.moduleState = -1;
                        return WinJS.Promise.as(promise)
                    };
                    DeviceGalleryModuleBase.prototype.reload = function() {
                        return this.refresh()
                    };
                    DeviceGalleryModuleBase.prototype.refreshItems = function(){};
                    DeviceGalleryModuleBase.prototype.getQueryType = function(view, pivot, modifier) {
                        return this.isOnline ? _super.prototype.getQueryType.call(this, view, pivot, modifier) : null
                    };
                    DeviceGalleryModuleBase.prototype._onQueryCompleted = function(query) {
                        _super.prototype._onQueryCompleted.call(this, query);
                        this._updateCount(this.totalCount, NaN)
                    };
                    DeviceGalleryModuleBase.prototype._onQueryFailed = function(error) {
                        _super.prototype._onQueryFailed.call(this, error);
                        if (!WinJS.Promise.isCanceledError(error))
                            this.moduleState = -1
                    };
                    DeviceGalleryModuleBase.prototype._onTotalCountChanged = function(newValue, oldValue) {
                        _super.prototype._onTotalCountChanged.call(this, newValue, oldValue);
                        this._updateCount(newValue, oldValue)
                    };
                    DeviceGalleryModuleBase.prototype._updateCount = function(newValue, oldValue) {
                        if (newValue !== oldValue)
                            this.dispatchChangeAndNotify("count", newValue, oldValue);
                        if (this.isOnline)
                            this.moduleState = newValue > 0 ? 2 : 0;
                        else
                            this.moduleState = -1
                    };
                    DeviceGalleryModuleBase._deviceFilterSettingsKey = "DeviceFilters";
                    return DeviceGalleryModuleBase
                })(ViewModels.MusicCollectionLX);
            ViewModels.DeviceGalleryModuleBase = DeviceGalleryModuleBase;
            var DeviceFilterDefinition = (function() {
                    function DeviceFilterDefinition(){}
                    DeviceFilterDefinition.prototype.itemFactory = function() {
                        var windowsCategory = new DeviceCategoryNode(DeviceFilterDefinition.WINDOWS_CATEGORY_ID, String.id.IDS_MUSIC_DEVICES_CATEGORY1_FREE, new DeviceWindowsNodeValue);
                        var consolePhoneCategory = new DeviceCategoryNode(DeviceFilterDefinition.CONSOLE_PHONE_CATEGORY_ID, String.id.IDS_MUSIC_DEVICES_CATEGORY2_FREE, new DeviceConsolePhoneNodeValue);
                        return [windowsCategory, consolePhoneCategory]
                    };
                    DeviceFilterDefinition.WINDOWS_CATEGORY_ID = "windows";
                    DeviceFilterDefinition.CONSOLE_PHONE_CATEGORY_ID = "consolePhone";
                    return DeviceFilterDefinition
                })();
            ViewModels.DeviceFilterDefinition = DeviceFilterDefinition;
            var DeviceCategoryNode = (function(_super) {
                    __extends(DeviceCategoryNode, _super);
                    function DeviceCategoryNode(id, descriptionId, value) {
                        _super.call(this, id, descriptionId, value);
                        this._description = descriptionId ? String.load(descriptionId) : String.empty
                    }
                    Object.defineProperty(DeviceCategoryNode.prototype, "description", {
                        get: function() {
                            return this._description
                        }, set: function(value) {
                                this.updateAndNotify("description", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(DeviceCategoryNode.prototype, "isWindowsNode", {
                        get: function() {
                            return this.id === DeviceFilterDefinition.WINDOWS_CATEGORY_ID
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(DeviceCategoryNode.prototype, "isConsolePhoneNode", {
                        get: function() {
                            return this.id === DeviceFilterDefinition.CONSOLE_PHONE_CATEGORY_ID
                        }, enumerable: true, configurable: true
                    });
                    return DeviceCategoryNode
                })(MS.Entertainment.ViewModels.Node);
            ViewModels.DeviceCategoryNode = DeviceCategoryNode;
            var DeviceNodeValueBase = (function(_super) {
                    __extends(DeviceNodeValueBase, _super);
                    function DeviceNodeValueBase() {
                        _super.call(this);
                        this.queryOptions = {mediaAvailability: Microsoft.Entertainment.Platform.MediaAvailability.availableFromCloud};
                        this.modelOptions = {showLocalEmptyAction: false};
                        this.trackQueryOptions = {
                            mediaAvailability: Microsoft.Entertainment.Platform.MediaAvailability.availableFromCloud, acquisitionData: new Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.collection, Microsoft.Entertainment.Platform.AcquisitionContextType.playAll)
                        }
                    }
                    return DeviceNodeValueBase
                })(MS.Entertainment.ViewModels.NodeValues);
            ViewModels.DeviceNodeValueBase = DeviceNodeValueBase;
            var DeviceWindowsNodeValue = (function(_super) {
                    __extends(DeviceWindowsNodeValue, _super);
                    function DeviceWindowsNodeValue() {
                        _super.call(this);
                        this.modelOptions = this.modelOptions || {};
                        this.modelOptions.forceEmpty = false
                    }
                    return DeviceWindowsNodeValue
                })(DeviceNodeValueBase);
            ViewModels.DeviceWindowsNodeValue = DeviceWindowsNodeValue;
            var DeviceConsolePhoneNodeValue = (function(_super) {
                    __extends(DeviceConsolePhoneNodeValue, _super);
                    function DeviceConsolePhoneNodeValue() {
                        _super.call(this);
                        this.modelOptions = this.modelOptions || {};
                        this.modelOptions.forceEmpty = true
                    }
                    return DeviceConsolePhoneNodeValue
                })(MS.Entertainment.ViewModels.NodeValues);
            ViewModels.DeviceConsolePhoneNodeValue = DeviceConsolePhoneNodeValue
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/music1/devicepagebase.js:236 */
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
            MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");
            var ViewState = Entertainment.UI.ViewState;
            (function(DevicesPageModuleKeys) {
                DevicesPageModuleKeys[DevicesPageModuleKeys["galleryModule"] = 0] = "galleryModule";
                DevicesPageModuleKeys[DevicesPageModuleKeys["numModuleKeys"] = 1] = "numModuleKeys"
            })(ViewModels.DevicesPageModuleKeys || (ViewModels.DevicesPageModuleKeys = {}));
            var DevicesPageModuleKeys = ViewModels.DevicesPageModuleKeys;
            var DevicesPageBase = (function(_super) {
                    __extends(DevicesPageBase, _super);
                    function DevicesPageBase() {
                        var _this = this;
                        _super.call(this);
                        this._signInBinding = null;
                        this._subscriptionBinding = null;
                        this._shouldShowUpsell = false;
                        this._showSignIn = false;
                        this._showGalleryModifier = false;
                        this._upsellViewModel = null;
                        this._viewStateViewModel = null;
                        this._emptyViewActions = null;
                        this._initializeModules();
                        this._upsellViewModel = new ViewModels.UpsellViewModel(true);
                        var signIn = Entertainment.ServiceLocator.getService(Entertainment.Services.signIn);
                        this._signInBinding = Entertainment.Utilities.addEventHandlers(signIn, {isSignedInChanged: function() {
                                return _this._onUserStatusChanged()
                            }});
                        var signedInUser = Entertainment.ServiceLocator.getService(Entertainment.Services.signedInUser);
                        this._subscriptionBinding = Entertainment.Utilities.addEventHandlers(signedInUser, {isSubscriptionChanged: function() {
                                return _this._onUserStatusChanged()
                            }})
                    }
                    Object.defineProperty(DevicesPageBase.prototype, "galleryModule", {
                        get: function() {
                            return this.modules && this.modules[0]
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(DevicesPageBase.prototype, "title", {
                        get: function() {
                            return this._title
                        }, set: function(value) {
                                this.updateAndNotify("title", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(DevicesPageBase.prototype, "primarySubtitle", {
                        get: function() {
                            return this._primarySubtitle
                        }, set: function(value) {
                                this.updateAndNotify("primarySubtitle", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(DevicesPageBase.prototype, "secondarySubtitle", {
                        get: function() {
                            return this._secondarySubtitle
                        }, set: function(value) {
                                this.updateAndNotify("secondarySubtitle", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(DevicesPageBase.prototype, "shouldShowHeaderCategory", {
                        get: function() {
                            return this._shouldShowHeaderCategory
                        }, set: function(value) {
                                this.updateAndNotify("shouldShowHeaderCategory", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(DevicesPageBase.prototype, "categorySelectionManager", {
                        get: function() {
                            return this.galleryModule && this.galleryModule.filterSelectionManager
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(DevicesPageBase.prototype, "isFreeStreamingMarket", {
                        get: function() {
                            var featureEnablement = Entertainment.ServiceLocator.getService(Entertainment.Services.featureEnablement);
                            return featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicFreePlay)
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(DevicesPageBase.prototype, "isSubscriptionSigned", {
                        get: function() {
                            return Entertainment.ServiceLocator.getService(Entertainment.Services.signedInUser).isSubscription
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(DevicesPageBase.prototype, "shouldShowUpsell", {
                        get: function() {
                            return this._shouldShowUpsell
                        }, set: function(value) {
                                this.updateAndNotify("shouldShowUpsell", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(DevicesPageBase.prototype, "upsell", {
                        get: function() {
                            return this._upsellViewModel
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(DevicesPageBase.prototype, "showSignIn", {
                        get: function() {
                            return this._showSignIn
                        }, set: function(value) {
                                this.updateAndNotify("showSignIn", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(DevicesPageBase.prototype, "showGalleryModifier", {
                        get: function() {
                            return this._showGalleryModifier
                        }, set: function(value) {
                                this.updateAndNotify("showGalleryModifier", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(DevicesPageBase.prototype, "collectionNavigateAction", {
                        get: function() {
                            return this._collectionNavigateAction
                        }, set: function(value) {
                                this.updateAndNotify("collectionNavigateAction", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(DevicesPageBase.prototype, "viewStateViewModel", {
                        get: function() {
                            if (!this._viewStateViewModel) {
                                var viewStateItems = new Array;
                                viewStateItems[-2] = new ViewModels.ViewStateItem(String.load(String.id.IDS_MUSIC_OFFLINE_HEADER), String.load(String.id.IDS_MUSIC_OFFLINE_DETAILS), []);
                                viewStateItems[-1] = new ViewModels.ViewStateItem(String.load(String.id.IDS_MUSIC_ERROR_HEADER), String.load(String.id.IDS_MUSIC_ERROR_DETAILS), []);
                                viewStateItems[0] = this._getEmptyViewStateItem();
                                this._viewStateViewModel = new ViewModels.ViewStateViewModel(viewStateItems)
                            }
                            return this._viewStateViewModel
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(DevicesPageBase.prototype, "isDevicesPage", {
                        get: function() {
                            return true
                        }, enumerable: true, configurable: true
                    });
                    DevicesPageBase.prototype.delayInitialize = function() {
                        _super.prototype.delayInitialize.call(this);
                        if (this.galleryModule)
                            this.galleryModule.delayInitialize();
                        this._initializeEmptyViewStateActions()
                    };
                    DevicesPageBase.prototype.dispose = function() {
                        _super.prototype.dispose.call(this);
                        this._releaseModules();
                        if (this._signInBinding) {
                            this._signInBinding.cancel();
                            this._signInBinding = null
                        }
                        if (this._subscriptionBinding) {
                            this._subscriptionBinding.cancel();
                            this._subscriptionBinding = null
                        }
                        if (this._upsellViewModel) {
                            this._upsellViewModel.dispose();
                            this._upsellViewModel = null
                        }
                    };
                    DevicesPageBase.prototype.loadModules = function() {
                        _super.prototype.loadModules.call(this);
                        var isSignedIn = Entertainment.ServiceLocator.getService(Entertainment.Services.signIn).isSignedIn;
                        this.showSignIn = this.isOnline && !isSignedIn;
                        this._updateShouldShowUpsell();
                        if (this.showSignIn) {
                            this.primarySubtitle = String.load(String.id.IDS_MUSIC_DEVICES_SUBTITLE_LINE1_UNAUTH);
                            this.secondarySubtitle = String.empty;
                            this.shouldShowHeaderCategory = false
                        }
                        else if (this.isFreeStreamingMarket && !this.isSubscriptionSigned) {
                            this.primarySubtitle = String.load(String.id.IDS_MUSIC_DEVICES_SUBTITLE_LINE1_FREE);
                            this.secondarySubtitle = String.load(String.id.IDS_MUSIC_DEVICES_SUBTITLE_LINE2_FREE);
                            this.shouldShowHeaderCategory = true
                        }
                        else {
                            this.primarySubtitle = String.load(String.id.IDS_MUSIC_DEVICES_SUBTITLE_LINE1_PASS);
                            this.secondarySubtitle = String.empty;
                            this.shouldShowHeaderCategory = false
                        }
                        if (this.galleryModule)
                            this.galleryModule.load()
                    };
                    DevicesPageBase.prototype._initializeModules = function() {
                        var _this = this;
                        this._releaseModules();
                        this.modules = new Array(1);
                        this.modules[0] = this._createGalleryModule();
                        this.listenForModuleViewStateChanges();
                        if (this.galleryModule)
                            this._categorySelectionBinding = WinJS.Binding.bind(this.galleryModule, {filterSelectionManager: {selectedItem: function() {
                                        return _this._updateShouldShowUpsell()
                                    }}})
                    };
                    DevicesPageBase.prototype._createGalleryModule = function() {
                        return null
                    };
                    DevicesPageBase.prototype._refreshEmptyViewState = function() {
                        this.viewStateViewModel.viewStateItems[0] = this._getEmptyViewStateItem()
                    };
                    DevicesPageBase.prototype._updateShouldShowUpsell = function() {
                        var currentCategory = this.galleryModule && this.galleryModule.selectedFilter;
                        this.shouldShowUpsell = this.isOnline && currentCategory && currentCategory.isConsolePhoneNode
                    };
                    DevicesPageBase.prototype._getEmptyViewStateItem = function() {
                        var viewStateItem;
                        var cloudCollectionService = Entertainment.ServiceLocator.getService(Entertainment.Services.cloudCollection);
                        if (cloudCollectionService.isCloudMatchOptedIn)
                            viewStateItem = new ViewModels.ViewStateItem(String.load(String.id.IDS_COLLECTION_MUSIC_EMPTY_TITLE), String.load(String.id.IDS_COLLECTION_MUSIC_EMPTY_SUBTITLE), []);
                        else
                            viewStateItem = new ViewModels.ViewStateItem(String.load(String.id.IDS_MUSIC_DEVICES_EMPTY_MATCHING_HEADER), String.load(String.id.IDS_MUSIC_DEVICES_EMPTY_MATCHING_BODY), this._initializeEmptyViewStateActions());
                        return viewStateItem
                    };
                    DevicesPageBase.prototype._releaseModules = function() {
                        if (this.galleryModule) {
                            this.galleryModule.dispose();
                            this.galleryModule = null
                        }
                        if (this._categorySelectionBinding) {
                            this._categorySelectionBinding.cancel();
                            this._categorySelectionBinding = null
                        }
                    };
                    DevicesPageBase.prototype._onUserStatusChanged = function() {
                        this.loadModules()
                    };
                    DevicesPageBase.prototype._onNetworkUnavailable = function() {
                        _super.prototype._onNetworkUnavailable.call(this);
                        this.galleryModule.clear();
                        this.viewStateViewModel.viewState = -2
                    };
                    DevicesPageBase.prototype._initializeEmptyViewStateActions = function() {
                        if (!this._emptyViewActions)
                            this._emptyViewActions = new Entertainment.ObservableArray;
                        if (this.isDelayInitialized && this._emptyViewActions.length === 0)
                            this._populateObservableArrayWithEmptyActions(this._emptyViewActions);
                        return this._emptyViewActions
                    };
                    DevicesPageBase.prototype._populateObservableArrayWithEmptyActions = function(array) {
                        var actions = this._createEmptyViewStateActions();
                        if (actions && actions.length)
                            array.spliceArray(0, 0, actions)
                    };
                    DevicesPageBase.prototype._createEmptyViewStateActions = function() {
                        var emptyActions = [];
                        var actionService = Entertainment.ServiceLocator.getService(Entertainment.Services.actions);
                        var action = actionService.getAction(Entertainment.UI.Actions.ActionIdentifiers.notificationCloudContent);
                        action.consentDialog = true;
                        action.parameter = {category: Entertainment.UI.NotificationCategoryEnum.cloudContent};
                        emptyActions.push(new ViewModels.ActionItem(String.empty, String.id.IDS_MUSIC_DEVICES_EMPTY_MATCHING_LINK, action, null));
                        return emptyActions
                    };
                    return DevicesPageBase
                })(ViewModels.PageViewModelBase);
            ViewModels.DevicesPageBase = DevicesPageBase
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/music1/devicegallerymodule.js:506 */
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
    var Entertainment;
    (function(Entertainment) {
        var ViewModels;
        (function(ViewModels) {
            var DeviceGalleryModule = (function(_super) {
                    __extends(DeviceGalleryModule, _super);
                    function DeviceGalleryModule() {
                        _super.call(this, ViewModels.MusicCollectionLX.ViewTypes.cloudCollection, true)
                    }
                    DeviceGalleryModule.prototype._createModifiers = function() {
                        return new MS.Entertainment.ViewModels.MusicCollectionModifiers.Modifiers(true)
                    };
                    return DeviceGalleryModule
                })(ViewModels.DeviceGalleryModuleBase);
            ViewModels.DeviceGalleryModule = DeviceGalleryModule
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/music1/deviceshubviewmodel.js:541 */
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
    var Entertainment;
    (function(Entertainment) {
        var ViewModels;
        (function(ViewModels) {
            var DevicesHubViewModel = (function(_super) {
                    __extends(DevicesHubViewModel, _super);
                    function DevicesHubViewModel() {
                        _super.call(this);
                        this.title = String.load(String.id.IDS_MUSIC_DEVICES_TITLE);
                        this._notificationFilterOperation = Entertainment.UI.ListNotificationService.applyCustonNotificationFilter(this._notificationFilter.bind(this))
                    }
                    DevicesHubViewModel.prototype.dispose = function() {
                        _super.prototype.dispose.call(this);
                        if (this._notificationFilterOperation) {
                            this._notificationFilterOperation.cancel();
                            this._notificationFilterOperation = null
                        }
                    };
                    DevicesHubViewModel.prototype.loadModules = function() {
                        var isSignedIn = Entertainment.ServiceLocator.getService(Entertainment.Services.signIn).isSignedIn;
                        this.showSignIn = this.isOnline && !isSignedIn;
                        this.showGalleryModifier = this.isOnline;
                        _super.prototype.loadModules.call(this)
                    };
                    DevicesHubViewModel.prototype._createGalleryModule = function() {
                        return new ViewModels.DeviceGalleryModule
                    };
                    DevicesHubViewModel.prototype._notificationFilter = function(notification) {
                        return notification && notification.category.name === Entertainment.UI.NotificationCategoryNames[4] && notification.title !== String.load(String.id.IDS_MUSIC_CLOUD_POPULATED_NOTIFICATION_TITLE) && notification.title !== String.load(String.id.IDS_MUSIC_SCAN_MATCH_OPT_IN_NOTIFICATION_LINE_1)
                    };
                    return DevicesHubViewModel
                })(ViewModels.DevicesPageBase);
            ViewModels.DevicesHubViewModel = DevicesHubViewModel
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/music1/devicesalbumdetailsviewmodel.js:594 */
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
    var Entertainment;
    (function(Entertainment) {
        var ViewModels;
        (function(ViewModels) {
            var MusicNavigation = MS.Entertainment.UI.Actions.MusicNavigation;
            var DevicesAlbumDetailsViewModel = (function(_super) {
                    __extends(DevicesAlbumDetailsViewModel, _super);
                    function DevicesAlbumDetailsViewModel(album) {
                        this._album = album;
                        this.title = album.name;
                        _super.call(this);
                        var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                        this.collectionNavigateAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.albumDetailsNavigate);
                        this.collectionNavigateAction.title = String.load(String.id.IDS_MUSIC_DEVICES_VIEW_ALBUM_LINK);
                        this.collectionNavigateAction.parameter = {
                            data: this._album, pivotMoniker: 3
                        };
                        this.collectionNavigateAction.requeryCanExecute()
                    }
                    DevicesAlbumDetailsViewModel.prototype._createGalleryModule = function() {
                        return new ViewModels.DevicesAlbumDetailsGalleryViewModel(this._album)
                    };
                    return DevicesAlbumDetailsViewModel
                })(ViewModels.DevicesPageBase);
            ViewModels.DevicesAlbumDetailsViewModel = DevicesAlbumDetailsViewModel
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/music1/devicesalbumdetailsgalleryviewmodel.js:639 */
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
    var Entertainment;
    (function(Entertainment) {
        var ViewModels;
        (function(ViewModels) {
            var DevicesAlbumDetailsGalleryViewModel = (function(_super) {
                    __extends(DevicesAlbumDetailsGalleryViewModel, _super);
                    function DevicesAlbumDetailsGalleryViewModel(album) {
                        MS.Entertainment.ViewModels.assert(album, "An album media item is required.");
                        if (album)
                            this._album = album.clone();
                        _super.call(this, MS.Entertainment.ViewModels.MusicCollectionLX.ViewTypes.cloudCollectionAlbum);
                        this.selectedTemplate = MS.Entertainment.ViewModels.DevicesAlbumDetailsGalleryTemplates.songs
                    }
                    DevicesAlbumDetailsGalleryViewModel.prototype.getPivotDefinition = function(view) {
                        return null
                    };
                    DevicesAlbumDetailsGalleryViewModel.prototype.getModifierDefinition = function(view) {
                        return null
                    };
                    DevicesAlbumDetailsGalleryViewModel.prototype.getModifierOptions = function(view) {
                        return null
                    };
                    DevicesAlbumDetailsGalleryViewModel.prototype._onBeginQuery = function(query) {
                        MS.Entertainment.ViewModels.assert(this._album, "An album media item is required.");
                        if (this._album)
                            query.albumId = this._album.libraryId;
                        query.acquisitionData = new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.collection, Microsoft.Entertainment.Platform.AcquisitionContextType.album);
                        _super.prototype._onBeginQuery.call(this, query)
                    };
                    return DevicesAlbumDetailsGalleryViewModel
                })(MS.Entertainment.ViewModels.DeviceGalleryModuleBase);
            ViewModels.DevicesAlbumDetailsGalleryViewModel = DevicesAlbumDetailsGalleryViewModel;
            var DevicesAlbumDetailsGalleryTemplates = (function() {
                    function DevicesAlbumDetailsGalleryTemplates(){}
                    DevicesAlbumDetailsGalleryTemplates.songs = {
                        debugId: "songs", itemTemplate: "select(.templateid-devicesAlbumDetailsSong)", zoomedOutTemplate: null, tap: MS.Entertainment.UI.Controls.GalleryControl && MS.Entertainment.UI.Controls.GalleryControl.Tap.invokeOnly, layout: MS.Entertainment.UI.Controls.GalleryControl && MS.Entertainment.UI.Controls.GalleryControl.Layout.list, orientation: MS.Entertainment.UI.Controls.GalleryControl && MS.Entertainment.UI.Controls.GalleryControl.Orientation.vertical, zoomedOutLayout: MS.Entertainment.UI.Controls.GalleryControl && MS.Entertainment.UI.Controls.GalleryControl.ZoomedOutLayout.list, invokeBehavior: MS.Entertainment.UI.Controls.GalleryControl && MS.Entertainment.UI.Controls.GalleryControl.InvokeBehavior.inline, invokeHelperFactory: MS.Entertainment.UI.Controls.GalleryControlInvocationHelper.create, actionOptions: MS.Entertainment.UI.Actions.ActionIdentifiers.albumDeviceDetailsNavigate, itemsDraggable: true, forceInteractive: true, maxRows: NaN, minimumListLength: 1, grouperItemThreshold: -1, grouped: false, hideShadow: true, allowZoom: false, allowSelectAll: false, delayHydrateLibraryId: false, selectionStyleFilled: false, grouperKeyAsData: true, swipeBehavior: MS.Entertainment.UI.Controls.GalleryControl && MS.Entertainment.UI.Controls.GalleryControl.swipeBehavior.select, selectionMode: MS.Entertainment.UI.Controls.GalleryControl && MS.Entertainment.UI.Controls.GalleryControl.SelectionMode.multi, strings: {countFormatStringId: String.id.IDS_MUSIC_TYPE_TRACK_PLURAL}, listViewClassName: "gallery-songs"
                    };
                    return DevicesAlbumDetailsGalleryTemplates
                })();
            ViewModels.DevicesAlbumDetailsGalleryTemplates = DevicesAlbumDetailsGalleryTemplates
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
