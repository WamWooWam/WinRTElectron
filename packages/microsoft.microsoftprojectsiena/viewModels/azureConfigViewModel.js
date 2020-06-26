//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var TableSelectorViewModel = AppMagic.AuthoringTool.ViewModels.TableSelectorViewModel,
        ServiceConfig = AppMagic.Constants.Services.Config;
    function getBaseServiceUrl(url) {
        url = AppMagic.Services.canonicalizeUrl(url);
        var urlParts = AppMagic.Utility.getAzureTableServiceUrlParts(url);
        return urlParts.isValidUrl ? urlParts.baseUrl : url
    }
    var AzureConfigViewModel = WinJS.Class.define(function AzureConfigViewModel_ctor(runtime, dataSourceOriginalNameStore, importFn) {
            this._runtime = runtime;
            this._importFn = importFn;
            this._dataSourceOriginalNameStore = dataSourceOriginalNameStore;
            this._addDataSourceHandler = this._addDataSource.bind(this);
            this._tableSelector = new AppMagic.AuthoringTool.ViewModels.TableSelectorViewModel;
            this._tableSelector.addEventListener(AppMagic.AuthoringTool.ViewModels.TableSelectorViewModel.events.import, this._addDataSourceHandler);
            this._tableSelectorVisible = ko.observable(!1);
            this._serviceUrl = ko.observable("");
            this._appKey = ko.observable("");
            this._errorMessages = ko.observableArray([]);
            this._isWaitVisible = ko.observable(!1)
        }, {
            _runtime: null, _importFn: null, _dataSourceOriginalNameStore: null, _tableSelector: null, _tableSelectorVisible: null, _pendingSearch: null, _serviceUrl: null, _appKey: null, _searchedUrlCanonicalized: null, _searchedAppKey: null, _errorMessages: null, _addDataSourceHandler: null, _isWaitVisible: null, dispose: function() {
                    this._tableSelector.removeEventListener(AppMagic.AuthoringTool.ViewModels.TableSelectorViewModel.events.import, this._addDataSourceHandler)
                }, onload: function() {
                    this._loadState()
                }, reset: function() {
                    this._tableSelectorVisible(!1);
                    this._errorMessages.removeAll()
                }, serviceUrl: {
                    get: function() {
                        return this._serviceUrl()
                    }, set: function(value) {
                            this._serviceUrl(value)
                        }
                }, appKey: {
                    get: function() {
                        return this._appKey()
                    }, set: function(value) {
                            this._appKey(value)
                        }
                }, tableSelector: {get: function() {
                        return this._tableSelector
                    }}, tableSelectorVisible: {get: function() {
                        return this._tableSelectorVisible()
                    }}, errorMessages: {get: function() {
                        return this._errorMessages()
                    }}, isErrorVisible: {get: function() {
                        return this.errorMessages.length !== 0
                    }}, isWaitVisible: {get: function() {
                        return this._isWaitVisible()
                    }}, handleKeypress: function(vm, ev) {
                    return ev.key === AppMagic.Constants.Keys.enter ? (this.searchAzure(), !1) : !0
                }, searchAzure: function() {
                    if (this._isWaitVisible(!0), this._tableSelectorVisible(!1), this._searchedUrlCanonicalized = AppMagic.Services.canonicalizeUrl(this._serviceUrl()), this._searchedAppKey = this._appKey(), !this._validateSearchProperties()) {
                        this._isWaitVisible(!1);
                        return
                    }
                    this._pendingSearch && (this._pendingSearch.cancel(), this._pendingSearch = null);
                    this._saveState();
                    var urlParts = AppMagic.Utility.getAzureTableServiceUrlParts(this._searchedUrlCanonicalized);
                    if (urlParts.isValidUrl) {
                        var checkTableFn = this._runtime.getStaticDataSourceFunction(AppMagic.Constants.DataConnections.Types.AzureMobileServices, "checkTableExistence");
                        this._pendingSearch = checkTableFn(this._searchedUrlCanonicalized, this._searchedAppKey).then(function(response) {
                            var resultCode = response.result;
                            resultCode === AppMagic.Services.AmsQueryResultCode.Success ? this._processLists([{Value: urlParts.tableName}]) : this._processError(resultCode)
                        }.bind(this))
                    }
                    else {
                        var getTablesListFn = this._runtime.getStaticDataSourceFunction(AppMagic.Constants.DataConnections.Types.AzureMobileServices, "getTablesList");
                        this._pendingSearch = getTablesListFn(this._searchedUrlCanonicalized, this._searchedAppKey).then(function(response) {
                            var result = response.result;
                            result.resultCode === AppMagic.Services.AmsQueryResultCode.Success ? this._processLists(result.tables) : this._processError(result.resultCode)
                        }.bind(this))
                    }
                    this._pendingSearch = this._pendingSearch.then(function() {
                        this._pendingSearch = null;
                        this._isWaitVisible(!1)
                    }.bind(this), function(error) {
                        this._isWaitVisible(!1);
                        this._pendingSearch = null
                    }.bind(this))
                }, _processError: function(resultCode) {
                    switch (resultCode) {
                        case AppMagic.Services.AmsQueryResultCode.Success:
                            return;
                        case AppMagic.Services.AmsQueryResultCode.Unauthorized:
                            this._errorMessages.push(AppMagic.AuthoringStrings.AmsErrorUnauthorized);
                            return;
                        case AppMagic.Services.AmsQueryResultCode.UnknownError:
                            break;
                        default:
                            break
                    }
                    this._errorMessages.push(AppMagic.AuthoringStrings.AmsErrorServiceFailure)
                }, _processLists: function(lists) {
                    if (lists instanceof Array) {
                        var tables = {};
                        lists.forEach(function(list) {
                            var tableName = list.Value;
                            typeof tableName != "string" && (tableName = list.value);
                            typeof tableName == "string" && (tables[tableName] = !1)
                        });
                        var tryGetResult = this._tryGetGroupForSearchedUrl();
                        if (tryGetResult.value) {
                            var group = tryGetResult.outValue;
                            Object.keys(group).forEach(function(dataSourceName) {
                                var table = group[dataSourceName];
                                typeof tables[table] != "undefined" && (tables[table] = !0)
                            })
                        }
                        this._tableSelector.setTables(tables);
                        this._tableSelectorVisible(!0)
                    }
                }, _addDataSource: function(evt) {
                    var tables = evt.detail;
                    if (this._validateProperties(tables)) {
                        var existing = Object.create(null),
                            tryGetResult = this._tryGetGroupForSearchedUrl();
                        if (tryGetResult.value) {
                            var group = tryGetResult.outValue;
                            Object.keys(group).forEach(function(dataSourceName) {
                                var table = group[dataSourceName];
                                existing[table] = !0
                            })
                        }
                        for (var tableList = [], baseServiceUrl = getBaseServiceUrl(this._searchedUrlCanonicalized), i = 0, len = tables.length; i < len; i++) {
                            var tableName = tables[i];
                            if (!existing[tableName]) {
                                var config = {
                                        siteUri: baseServiceUrl, tableName: tableName
                                    };
                                this._searchedAppKey.length > 0 && (config.appKey = this._searchedAppKey);
                                tableList.push({
                                    suggestedName: tableName, configuration: config
                                })
                            }
                        }
                        this._importFn({
                            type: "table", list: tableList
                        })
                    }
                }, _validateBaseProperties: function() {
                    var serviceUrl = this.serviceUrl.trim();
                    serviceUrl.length === 0 ? this._errorMessages.push(AppMagic.AuthoringStrings.AmsErrorEndpointEmpty) : AppMagic.Utility.isValidAzureMobileServiceUrl(serviceUrl) || this._errorMessages.push(AppMagic.AuthoringStrings.AmsErrorInvalidUrl)
                }, _validateSearchProperties: function() {
                    return this._errorMessages.removeAll(), this._validateBaseProperties(), this._errorMessages().length === 0
                }, _validateProperties: function(tables) {
                    return this._errorMessages.removeAll(), this._validateBaseProperties(), tables && tables.length !== 0 || this._errorMessages.push(AppMagic.AuthoringStrings.AmsErrorNoSelectedTables), this._errorMessages().length === 0
                }, _loadState: function() {
                    var settings = AppMagic.Settings.instance.getValue(AppMagic.Constants.SettingsKey.AMS) || {},
                        serviceUrl = settings.uri || "",
                        appKey = settings.appKey || "";
                    this._serviceUrl(serviceUrl);
                    this._appKey(appKey)
                }, _saveState: function() {
                    var settings = {
                            uri: this.serviceUrl, appKey: this.appKey
                        };
                    AppMagic.Settings.instance.setValue(AppMagic.Constants.SettingsKey.AMS, settings)
                }, _tryGetGroupForSearchedUrl: function() {
                    var baseServiceUrl = getBaseServiceUrl(this._searchedUrlCanonicalized);
                    return this._dataSourceOriginalNameStore.tryGetGroup("azuremobile", baseServiceUrl)
                }
        }, {});
    WinJS.Class.mix(AzureConfigViewModel, WinJS.Utilities.eventMixin);
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {AzureConfigViewModel: AzureConfigViewModel})
})();