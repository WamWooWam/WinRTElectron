//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var ServiceIds = AppMagic.Constants.DataConnections.Types,
        ServiceConfig = AppMagic.Constants.Services.Config,
        SharePointConfigViewModel = WinJS.Class.define(function SharePointConfigViewModel_ctor(runtime, dataSourceOriginalNameStore, importFn) {
            this._runtime = runtime;
            this._importFn = importFn;
            this._dataSourceOriginalNameStore = dataSourceOriginalNameStore;
            this._addDataSourceHandler = this._addDataSource.bind(this);
            this._addResetHandler = this.reset.bind(this);
            this._tableSelector = new AppMagic.AuthoringTool.ViewModels.SharePointTableSelectorViewModel;
            this._tableSelector.addEventListener(AppMagic.AuthoringTool.ViewModels.SharePointTableSelectorViewModel.events.import, this._addDataSourceHandler);
            this._tableSelector.addEventListener(AppMagic.AuthoringTool.ViewModels.SharePointTableSelectorViewModel.events.reset, this._addResetHandler);
            this._tableSelectorVisible = ko.observable(!1);
            this._checkedValue = ko.observable(AppMagic.AuthoringStrings.SharepointOffice365);
            this._siteUrl = ko.observable("");
            this._errorMessages = ko.observableArray([]);
            this._isWaitVisible = ko.observable(!1)
        }, {
            _runtime: null, _importFn: null, _dataSourceOriginalNameStore: null, _tableSelector: null, _tableSelectorVisible: null, _checkedValue: null, _pendingSearch: null, _searchedUrlCanonicalized: null, _siteUrl: null, _discoveredSiteUrl: null, _discoveredSiteUrlCanonicalized: null, _errorMessages: null, _addDataSourceHandler: null, _importerState: null, _isWaitVisible: null, dispose: function() {
                    this._tableSelector.removeEventListener(AppMagic.AuthoringTool.ViewModels.SharePointTableSelectorViewModel.events.import, this._addDataSourceHandler);
                    this._tableSelector.removeEventListener(AppMagic.AuthoringTool.ViewModels.SharePointTableSelectorViewModel.events.reset, this._addResetHandler)
                }, onload: function() {
                    this._loadState()
                }, reset: function() {
                    this._tableSelectorVisible(!1);
                    this._checkedValue(AppMagic.AuthoringStrings.SharepointOffice365);
                    this._errorMessages.removeAll()
                }, siteUrl: {
                    get: function() {
                        return this._siteUrl()
                    }, set: function(value) {
                            this._siteUrl(value)
                        }
                }, searchedUrlCanonicalized: {get: function() {
                        return this._searchedUrlCanonicalized
                    }}, tableSelector: {get: function() {
                        return this._tableSelector
                    }}, tableSelectorVisible: {get: function() {
                        return this._tableSelectorVisible()
                    }}, isSharepointOnPremise: {get: function() {
                        return this._checkedValue() === AppMagic.AuthoringStrings.SharepointOnPremise
                    }}, checkedValue: {
                    get: function() {
                        return this._checkedValue()
                    }, set: function(value) {
                            this._checkedValue(value)
                        }
                }, errorMessages: {get: function() {
                        return this._errorMessages()
                    }}, isErrorVisible: {get: function() {
                        return this.errorMessages.length !== 0
                    }}, isWaitVisible: {get: function() {
                        return this._isWaitVisible()
                    }}, handleKeypress: function(vm, ev) {
                    return ev.key === AppMagic.Constants.Keys.enter ? (this.searchSharePoint(), !1) : !0
                }, _cancelAnyPendingSearch: function() {
                    this._pendingSearch && (this._pendingSearch.cancel(), this._pendingSearch = null)
                }, getSharePointOnlineLists: function() {
                    this._importerState = new AppMagic.Authoring.Backstage.SharePointOnlineListImporter(this, this._dataSourceOriginalNameStore);
                    this._cancelAnyPendingSearch();
                    this._errorMessages.removeAll();
                    var sharePointOnlineBroker = this._runtime.sharePointOnlineBroker;
                    sharePointOnlineBroker.resourceWebUrl = this.siteUrl;
                    this._pendingSearch = sharePointOnlineBroker.getSharePointResource().then(function(resourceResult) {
                        if (this._isWaitVisible(!0), resourceResult.resultCode === AppMagic.Services.GetSharePointOnlineResourceResultCode.Success)
                            return this._searchForOnlineLists(resourceResult.resource);
                        else {
                            this._errorMessages.push(AppMagic.AuthoringStrings.SharePointErrorSiteLists);
                            this._runtime.areThereOtherSharePointDataSources("") || sharePointOnlineBroker.disconnect(this._runtime.cookieManager);
                            return
                        }
                    }.bind(this)).then(function() {
                        this._isWaitVisible(!1);
                        this._pendingSearch = null
                    }.bind(this), function(error) {
                        this._isWaitVisible(!1);
                        this._pendingSearch = null
                    }.bind(this))
                }, _searchForOnlineLists: function(sharePointResource) {
                    this._errorMessages.removeAll();
                    var getListsFn = this._runtime.getStaticDataSourceFunction(AppMagic.Constants.DataConnections.Types.SharePointOnline, AppMagic.Services.SharePointOnlineServiceWorker.FunctionName_getLists);
                    return getListsFn(sharePointResource.serviceResourceId, sharePointResource.token).then(function(getListsResult) {
                            if (getListsResult.success)
                                this._importerState.processLists(getListsResult.result);
                            else {
                                this._errorMessages.push(AppMagic.AuthoringStrings.SharePointErrorSiteLists);
                                return
                            }
                        }.bind(this))
                }, searchSharePoint: function() {
                    this._isWaitVisible(!0);
                    this._importerState = new AppMagic.Authoring.Backstage.SharePointOnPremisisListImporter(this, this._dataSourceOriginalNameStore);
                    this._cancelAnyPendingSearch();
                    this._tableSelectorVisible(!1);
                    var urlToUse;
                    if (urlToUse = this._siteUrl(), this._searchedUrlCanonicalized = AppMagic.Services.canonicalizeUrl(urlToUse), !this._validateSearchProperties(urlToUse)) {
                        this._isWaitVisible(!1);
                        return
                    }
                    if (!this.isSharepointOnPremise)
                        return this.getSharePointOnlineLists();
                    this._saveState();
                    var getListsFn = AppMagic.AuthoringTool.Runtime.getStaticDataSourceFunction(ServiceIds.SharePoint, "getLists");
                    var promiseToEnsureSharePointAuthentication = AppMagic.RuntimeBase.ensureSharePointAuthentication(urlToUse);
                    this._pendingSearch = promiseToEnsureSharePointAuthentication.then(function() {
                        return getListsFn(urlToUse).then(function(getListsResponse) {
                                return getListsResponse.success ? this._processOnPremisisLists(getListsResponse.result) : this._getWebUrlFromPageUrlAndTryAgain(urlToUse)
                            }.bind(this)).then(function(response) {
                                this._isWaitVisible(!1);
                                this._pendingSearch = null
                            }.bind(this), function(error) {
                                this._isWaitVisible(!1);
                                this._pendingSearch = null
                            }.bind(this))
                    }.bind(this))
                }, _getWebUrlFromPageUrlAndTryAgain: function(urlToUse) {
                    var getWebUrlFromPageUrlFn = AppMagic.AuthoringTool.Runtime.getStaticDataSourceFunction(ServiceIds.SharePoint, "getWebUrlFromPageUrl");
                    return getWebUrlFromPageUrlFn(urlToUse).then(function(getWebUrlResponse) {
                            if (getWebUrlResponse.success) {
                                var discoveredUrl = getWebUrlResponse.result;
                                return this._searchSharePointSecondAttempt(discoveredUrl)
                            }
                            else {
                                this._errorMessages.push(AppMagic.AuthoringStrings.SharePointErrorSiteLists);
                                return
                            }
                        }.bind(this))
                }, _searchSharePointSecondAttempt: function(discoveredUrl) {
                    var getListsFn = AppMagic.AuthoringTool.Runtime.getStaticDataSourceFunction(ServiceIds.SharePoint, "getLists");
                    return getListsFn(discoveredUrl).then(function(getListsResponse) {
                            getListsResponse.success ? (this._siteUrl(discoveredUrl), this._searchedUrlCanonicalized = AppMagic.Services.canonicalizeUrl(discoveredUrl), this._saveState(), this._processOnPremisisLists(getListsResponse.result)) : this._errorMessages.push(AppMagic.AuthoringStrings.SharePointErrorSiteLists)
                        }.bind(this))
                }, _processOnPremisisLists: function(lists) {
                    var listNames = lists.map(function(list) {
                            return list.title
                        });
                    this._importerState.processLists(listNames)
                }, showTables: function(tables) {
                    this._tableSelector.setTables(tables);
                    this._tableSelectorVisible(!0)
                }, _addDataSource: function(evt) {
                    var tableNames = evt.detail;
                    this._validateTables(tableNames) && this._importerState.addTablesAsDataSources(tableNames)
                }, importSharePointOnPrem: function(importData) {
                    this._importFn(AppMagic.Constants.DataConnections.Types.SharePoint, importData)
                }, importSharePointOnline: function(importData) {
                    this._importFn(AppMagic.Constants.DataConnections.Types.SharePointOnline, importData)
                }, _validateBaseProperties: function(urlToUse) {
                    var siteUrl = urlToUse.trim();
                    siteUrl.length === 0 ? this._errorMessages.push(AppMagic.AuthoringStrings.SharePointErrorSiteUrlEmpty) : AppMagic.Utility.isValidSharePointSiteUrl(siteUrl) || this._errorMessages.push(AppMagic.AuthoringStrings.SharePointErrorSiteNotUrl)
                }, _validateSearchProperties: function(urlToUse) {
                    return this._errorMessages.removeAll(), this._validateBaseProperties(urlToUse), this._errorMessages().length === 0
                }, _validateTables: function(tables) {
                    return this._errorMessages.removeAll(), tables && tables.length !== 0 || this._errorMessages.push(AppMagic.AuthoringStrings.SharePointErrorNoSelectedTables), this._errorMessages().length === 0
                }, _loadState: function() {
                    var settings = AppMagic.Settings.instance.getValue(AppMagic.Constants.SettingsKey.SHAREPOINT) || {},
                        siteUrl = settings.uri || "";
                    this._siteUrl(siteUrl)
                }, _saveState: function() {
                    var settings = {uri: this.siteUrl};
                    AppMagic.Settings.instance.setValue(AppMagic.Constants.SettingsKey.SHAREPOINT, settings)
                }
        }, {});
    WinJS.Class.mix(SharePointConfigViewModel, WinJS.Utilities.eventMixin);
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {SharePointConfigViewModel: SharePointConfigViewModel})
})();