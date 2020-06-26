//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(Platform) {"use strict";
    var DCs = AppMagic.Constants.DataConnections,
        ConnectionManager = WinJS.Class.derive(AppMagic.Utility.Disposable, function ConnectionManager_ctor(doc, rt, services, dataConnectionsViewModel, groupIdGenerators) {
            AppMagic.Utility.Disposable.call(this);
            this._dataSourceOriginalNameStore = new AppMagic.AuthoringTool.DataSourceOriginalNameStore(doc, groupIdGenerators);
            this._dataConnectionsViewModel = dataConnectionsViewModel;
            this._document = doc;
            this._runtime = rt;
            this._services = services;
            this._groupMap = {};
            this._vms = {};
            this._createStaticServiceImporterViewModels()
        }, {
            _document: null, _runtime: null, _services: null, _groupMap: null, _dataSourceOriginalNameStore: null, services: {get: function() {
                        return this._services
                    }}, notifyShow: function() {
                    this._dataSourceOriginalNameStore.beginTrackingNames()
                }, notifyClickBack: function() {
                    this._dataSourceOriginalNameStore.stopTrackingNames()
                }, getGroup: function(service, id) {
                    return this._groupMap[this._getGroupKey(service, id)]
                }, dispose: function() {
                    Object.keys(this._vms).forEach(function(serviceName) {
                        this._vms[serviceName].dispose && this._vms[serviceName].dispose()
                    }.bind(this))
                }, _createStaticServiceImporterViewModels: function() {
                    this._registerImporterViewModel(DCs.Types.AzureMobileServices, AppMagic.AuthoringTool.ViewModels.AzureConfigViewModel);
                    this._registerImporterViewModel(DCs.Types.RSS, AppMagic.AuthoringTool.ViewModels.RssConfigViewModel);
                    this._registerImporterViewModel(DCs.Types.REST, AppMagic.AuthoringTool.ViewModels.RestConfigViewModel);
                    this._registerSharePointImporterViewModel()
                }, _getImportDataSourcesFunction: function(serviceName) {
                    var that = this;
                    return function(importDataInfo) {
                            that._importServiceData(serviceName, importDataInfo);
                            that._dataConnectionsViewModel().resetSelectedConnectionType()
                        }
                }, _getPrivilegedImportDataSourceFunction: function() {
                    var that = this;
                    return function privilegedFunction(serviceName, importDataInfo) {
                            that._getImportDataSourcesFunction(serviceName)(importDataInfo)
                        }
                }, _registerImporterViewModel: function(serviceName, ViewModelCtor) {
                    var vm = new ViewModelCtor(this._runtime, this._dataSourceOriginalNameStore, this._getImportDataSourcesFunction(serviceName));
                    this._vms[serviceName] = vm
                }, _registerSharePointImporterViewModel: function() {
                    var vm = new AppMagic.AuthoringTool.ViewModels.SharePointConfigViewModel(this._runtime, this._dataSourceOriginalNameStore, this._getPrivilegedImportDataSourceFunction());
                    this._vms[DCs.Types.SharePoint] = vm
                }, resetVM: function(serviceId) {
                    if (typeof serviceId != "undefined" && (serviceId === DCs.Types.SharePoint || serviceId === DCs.Types.SharePointOnline)) {
                        var sharePointVM = this._vms[DCs.Types.SharePoint];
                        typeof sharePointVM != "undefined" && sharePointVM !== null && sharePointVM.reset()
                    }
                }, getImporterViewModel: function(serviceName) {
                    return this._vms[serviceName]
                }, refreshDataOnCompleteAdd: function(service, groupId) {
                    var group = this.getGroup(service, groupId);
                    group.supportsRefresh && group.refreshData()
                }, _importServiceData: function(service, importData) {
                    this._dataConnectionsViewModel().addDataSources(service, importData)
                }, importStatic: function(service, groupId, file, tables) {
                    var tableSet = Microsoft.AppMagic.Authoring.Importers.DictionaryWrapper();
                    tables.forEach(function(tableName) {
                        tableSet.setValue(tableName, null)
                    });
                    var tryGetResult = this._dataSourceOriginalNameStore.tryGetGroup(service, groupId);
                    if (tryGetResult.value) {
                        var group = tryGetResult.outValue;
                        Object.keys(group).forEach(function(dataSourceName) {
                            var tableName = group[dataSourceName];
                            tableSet.hasKey(tableName) && tableSet.setValue(tableName, dataSourceName)
                        })
                    }
                    var excelFile = file,
                        timeout = AppMagic.AuthoringTool.Constants.DataImportTimeout,
                        token = Platform.Storage.AccessCache.StorageApplicationPermissions.futureAccessList.add(file, groupId),
                        iter,
                        cur,
                        ds;
                    return Microsoft.AppMagic.Authoring.Importers.StaticDataImport.importTables(this._document, file, timeout, !1, tableSet, token).then(function(result) {
                            var onCompleted;
                            if (result.result !== Microsoft.AppMagic.Authoring.DataImportResult.failure) {
                                iter = result.tableNameToDataSourceNameMap.first();
                                for (var tableExceedsMaxRows = !1, promises = []; iter.hasCurrent; )
                                    cur = iter.current,
                                    iter.moveNext(),
                                    ds = this._document.getStaticDataSource(cur.value),
                                    ds.exceededLimit && (tableExceedsMaxRows = !0),
                                    promises.push(this._runtime.getData(cur.value));
                                onCompleted = WinJS.Promise.join(promises).then(function() {
                                    var showSuccess = !0;
                                    if (tableExceedsMaxRows) {
                                        showSuccess = !1;
                                        var ImportedWithErrorTitle = Core.Utility.formatString(AppMagic.AuthoringStrings.ImportedWithErrorTitle, excelFile.name);
                                        AppMagic.AuthoringTool.PlatformHelpers.showMessage(ImportedWithErrorTitle, AppMagic.AuthoringStrings.ExcelImportExceededMaxRowsText)
                                    }
                                    if (result.result === Microsoft.AppMagic.Authoring.DataImportResult.partialSuccess) {
                                        showSuccess = !1;
                                        var partialErrTitle = Core.Utility.formatString(AppMagic.AuthoringStrings.ImportErrorTitle, excelFile.name),
                                            partialErrContent = Core.Utility.formatString(result.error.message);
                                        AppMagic.AuthoringTool.PlatformHelpers.showMessage(partialErrTitle, partialErrContent)
                                    }
                                    return showSuccess && AppMagic.AuthoringTool.PlatformHelpers.showNotification(AppMagic.AuthoringStrings.AppName, Core.Utility.formatString(AppMagic.AuthoringStrings.ImportSuccessText, excelFile.name)), WinJS.Promise.wrap({
                                            importSuccessful: !0, tableNameToDatasourceNameMap: result.tableNameToDataSourceNameMap
                                        })
                                })
                            }
                            else {
                                var title = Core.Utility.formatString(AppMagic.AuthoringStrings.ImportErrorTitle, excelFile.name),
                                    content = Core.Utility.formatString(AppMagic.AuthoringStrings.ImportErrorText, excelFile.name, result.error.message);
                                AppMagic.AuthoringTool.PlatformHelpers.showMessage(title, content);
                                onCompleted = WinJS.Promise.wrap({
                                    importSuccessful: !1, tableNameToDatasourceNameMap: result.tableNameToDataSourceNameMap
                                })
                            }
                            return onCompleted
                        }.bind(this))
                }, removeSource: function(sourceName) {
                    this._document.removeDataSource(sourceName)
                }, refreshSource: function(service, options) {
                    this.dispatchEvent(ConnectionManager.events.navigateadd, {
                        target: service, options: options
                    })
                }, _getStaticDataGroup: function(ds) {
                    var entries = Platform.Storage.AccessCache.StorageApplicationPermissions.futureAccessList.entries.filter(function(entry) {
                            return entry.token === ds.futureAccessToken
                        });
                    var groupId = entries.length === 1 ? entries[0].metadata : AppMagic.AuthoringStrings.UnknownExcelName;
                    return this._getOrCreateGroup("excel", groupId)
                }, _createServiceDataSource: function(dsName, suggestedName, config, serviceName, sourceType) {
                    this._runtime.createServiceDataSource(this._document, dsName, suggestedName, config, serviceName, sourceType)
                }, _getOrCreateGroup: function(service, groupId) {
                    var group = this.getGroup(service, groupId);
                    return group || (group = new AppMagic.AuthoringTool.ViewModels.ConnectionViewModel(this, groupId, service)), group
                }, _getGroupKey: function(serviceId, groupId) {
                    return serviceId.length + "+" + groupId.length + "," + serviceId + groupId
                }
        }, {events: {
                refresh: "refresh", navigateadd: "navigateadd", connectiongroupadd: "connectiongroupadd", connectionadd: "connectionadd"
            }});
    WinJS.Class.mix(ConnectionManager, WinJS.Utilities.eventMixin);
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {ConnectionManager: ConnectionManager})
})(Windows);