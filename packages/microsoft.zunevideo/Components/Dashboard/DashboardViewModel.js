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
var MS;
(function(MS) {
    (function(Entertainment) {
        (function(UI) {
            (function(Dashboard) {
                var DashboardViewModel = (function(_super) {
                        __extends(DashboardViewModel, _super);
                        function DashboardViewModel(disableRefresh) {
                            _super.call(this);
                            this._isInitialized = false;
                            this._isOnline = false;
                            this._networkStatusBinding = null;
                            this._dashboardRefreshEvents = null;
                            this._refreshOnDashboardThaw = false;
                            this._dashboardFrozen = false;
                            this._pageTypeId = MS.Entertainment.Utilities.Telemetry.PageTypeId.Dash;
                            var servicelocator = MS.Entertainment.ServiceLocator;
                            this._networkStatusBinding = WinJS.Binding.bind(servicelocator.getService(MS.Entertainment.Services.uiState), {networkStatus: this._onNetworkStatusChanged.bind(this)});
                            if (!disableRefresh)
                                this._dashboardRefreshEvents = MS.Entertainment.UI.Framework.addEventHandlers(servicelocator.getService(MS.Entertainment.Services.dashboardRefresher), {refreshDashboard: this._dashboardRefreshChanged.bind(this)});
                            this._isInitialized = true
                        }
                        DashboardViewModel.prototype.dispose = function() {
                            if (this._networkStatusBinding) {
                                this._networkStatusBinding.cancel();
                                this._networkStatusBinding = null
                            }
                            if (this._dashboardRefreshEvents) {
                                this._dashboardRefreshEvents.cancel();
                                this._dashboardRefreshEvents = null
                            }
                        };
                        DashboardViewModel.prototype.dashboardFreezeHandler = function() {
                            this._dashboardFrozen = true
                        };
                        DashboardViewModel.prototype.dashboardThawHandler = function() {
                            if (this._refreshOnDashboardThaw && this._isInitialized) {
                                this._refreshOnDashboardThaw = false;
                                WinJS.Promise.timeout(MS.Entertainment.UI.DashboardRefresherService.refreshDelayTime).done(function timeoutFunction() {
                                    this.getItems(true)
                                }.bind(this))
                            }
                            this._dashboardFrozen = false
                        };
                        DashboardViewModel.prototype.getItems = function(refreshing) {
                            return WinJS.Promise.wrapError("getItems must be implemented by derived classes")
                        };
                        DashboardViewModel.prototype.onOnScreen = function() {
                            this.dashboardThawHandler()
                        };
                        DashboardViewModel.prototype.onOffScreen = function() {
                            this._dashboardFrozen = true
                        };
                        DashboardViewModel.prototype._dashboardRefreshChanged = function() {
                            if (!this._isInitialized)
                                return;
                            if (!this._dashboardFrozen)
                                this._refreshData();
                            else
                                this._refreshOnDashboardThaw = true
                        };
                        DashboardViewModel.prototype._refreshData = function(){};
                        DashboardViewModel.prototype._onNetworkStatusChanged = function(newValue) {
                            var isOnline = false;
                            switch (newValue) {
                                case 0:
                                case 1:
                                case 2:
                                    isOnline = true;
                                    break;
                                case 3:
                                case 4:
                                case 5:
                                    isOnline = false;
                                    break
                            }
                            if (isOnline !== this._isOnline) {
                                this._isOnline = isOnline;
                                if (this._isOnline && this._isInitialized)
                                    this.getItems()
                            }
                        };
                        DashboardViewModel.areArraysEqual = function(first, second, comparer) {
                            if (!first || !second || first.length != second.length)
                                return false;
                            for (var i = 0; i < first.length; i++)
                                if (!comparer(first[i], second[i]))
                                    return false;
                            return true
                        };
                        DashboardViewModel._getPivotName = function(domElement) {
                            var currentElement = domElement;
                            var pivotName = String.empty;
                            while (currentElement && !pivotName) {
                                pivotName = currentElement.getAttribute("data-ent-pivotname") || String.empty;
                                currentElement = currentElement.parentElement
                            }
                            return pivotName
                        };
                        DashboardViewModel._getLocation = function(domElement) {
                            var pivotName = DashboardViewModel._getPivotName(domElement);
                            return MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).getUserLocation() + (pivotName ? "/" + pivotName : String.empty)
                        };
                        DashboardViewModel.prototype._wrapAction = function(action) {
                            var wrappedAction = new MS.Entertainment.UI.Actions.Action;
                            var getLocation = DashboardViewModel._getLocation;
                            var pageTypeId = this._pageTypeId;
                            wrappedAction.automationId = action.automationId;
                            wrappedAction.canExecute = function canExecute(params) {
                                return action.canExecute(params)
                            };
                            wrappedAction.executed = function executed(params) {
                                var domElement = this.referenceContainer && this.referenceContainer.domElement;
                                var pivotName = null;
                                if (domElement)
                                    var location = getLocation(domElement);
                                MS.Entertainment.Utilities.Telemetry.logPageAction({
                                    itemPropertyBag: {
                                        serviceId: action.automationId, catalogId: MS.Entertainment.Utilities.Telemetry.ContentCatalogId.App, sourceId: MS.Entertainment.Utilities.Telemetry.ContentSourceId.App, typeId: MS.Entertainment.Utilities.Telemetry.ContentTypeId.App
                                    }, domElement: domElement
                                }, {
                                    uri: getLocation(domElement), pageTypeId: pageTypeId
                                }, {
                                    uri: (action.parameter && action.parameter.page) || MS.Entertainment.UI.Monikers.fullScreenNowPlaying, pageTypeId: MS.Entertainment.Utilities.Telemetry.PageTypeId.Dash
                                });
                                action.execute()
                            };
                            return wrappedAction
                        };
                        return DashboardViewModel
                    })(MS.Entertainment.UI.Framework.ObservableBase);
                Dashboard.DashboardViewModel = DashboardViewModel
            })(UI.Dashboard || (UI.Dashboard = {}));
            var Dashboard = UI.Dashboard
        })(Entertainment.UI || (Entertainment.UI = {}));
        var UI = Entertainment.UI
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
