//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(Platform) {"use strict";
    var TypeNames = {};
    TypeNames[AppMagic.Schema.TypeImage] = AppMagic.AuthoringStrings.TypeNameImage;
    TypeNames[AppMagic.Schema.TypeString] = AppMagic.AuthoringStrings.TypeNameString;
    TypeNames[AppMagic.Schema.TypeNumber] = AppMagic.AuthoringStrings.TypeNameNumber;
    TypeNames[AppMagic.Schema.TypeBoolean] = AppMagic.AuthoringStrings.TypeNameBoolean;
    TypeNames[AppMagic.Schema.TypeMedia] = AppMagic.AuthoringStrings.TypeNameMedia;
    var DCs = AppMagic.Constants.DataConnections,
        ConnectionManager = AppMagic.AuthoringTool.ViewModels.ConnectionManager,
        ConnectionViewModel = AppMagic.AuthoringTool.ViewModels.ConnectionViewModel,
        ServiceConfig = AppMagic.Constants.Services.Config,
        DataConnectionType = WinJS.Class.define(function DataConnectionType_ctor(connectionManager, serviceId, displayName, iconUrl, pageUrl, pageViewModel) {
            this._selected = ko.observable(!1);
            this._id = serviceId;
            this._displayName = displayName;
            this._icon = iconUrl;
            this._pageUrl = pageUrl;
            this._vm = pageViewModel
        }, {
            _id: null, _displayName: null, _icon: null, _pageUrl: null, _selected: null, _vm: null, id: {get: function() {
                        return this._id
                    }}, title: {get: function() {
                        return this._displayName
                    }}, icon: {get: function() {
                        return this._icon
                    }}, pageUrl: {get: function() {
                        return this._pageUrl
                    }}, pageVM: {get: function() {
                        return this._vm
                    }}, selected: {
                    get: function() {
                        return this._selected()
                    }, set: function(value) {
                            return this._selected(value)
                        }
                }
        }),
        DataConnectionsViewModel = WinJS.Class.derive(AppMagic.Utility.Disposable, function DataConnectionsViewModel_ctor(doc, rt, services) {
            AppMagic.Utility.Disposable.call(this);
            this._document = doc;
            this._runtime = rt;
            this._connectionTypes = ko.observableArray([]);
            this._connections = ko.observableArray([]);
            this._createDataSourceGroupIdGeneratorsByServiceId();
            var getDcVM = function() {
                    return this
                }.bind(this),
                connectionManager = new AppMagic.AuthoringTool.ViewModels.ConnectionManager(doc, rt, services, getDcVM, this._groupIdGenerators);
            this.track("_connectionManager", connectionManager);
            this._refreshTypesHandler = this._refreshTypes.bind(this);
            this._importedConnections = ko.observableArray();
            this._selectedType = ko.observable(null);
            this._isAddDataSourcesPaneVisible = ko.observable(!0);
            this._selectedConnectionIsStale = ko.observable(!0);
            this._selectedConnectionVM = ko.observable(null);
            this._isSelectConnectionTypeInProgess = !1;
            this._combinedConnectionList = ko.observableArray([]);
            this.track("_eventTracker", new AppMagic.Utility.EventTracker);
            this.track("_disableFlyOutAction", this._disableFlyOut.bind(this));
            this.track("_navigateAction", this._navigateAdd.bind(this));
            this._createDataSourceGroupIdGeneratorsByServiceId();
            this._connectionListViewModel = new AppMagic.AuthoringTool.ViewModels.BackStage.ConnectionListViewModel(this._document, this, this._groupIdGenerators);
            this._connectionListViewModel.registerConnectionHandler(new AppMagic.Authoring.Backstage.StaticServiceDataSourceConnectionHandler(this._groupIdGenerators));
            this._connectionListViewModel.registerConnectionHandler(new AppMagic.Authoring.Backstage.ExcelConnectionHandler);
            this._connectionListViewModel.registerConnectionHandler(new AppMagic.Authoring.Backstage.RestServiceConnectionHandler(this._document, this._runtime));
            this._connectionListManager = new AppMagic.AuthoringTool.ConnectionListManager(this._document, this._connectionListViewModel);
            this._addDataSourcePromises = new AppMagic.Common.PromiseCollection
        }, {
            _document: null, _runtime: null, _addDataSourcePromises: null, _connectionManager: null, _eventTracker: null, _navigateAction: null, _refreshTypesHandler: null, _connectionTypes: null, _connections: null, _selectedType: null, _importedConnections: null, _isAddDataSourcesPaneVisible: null, _isSelectConnectionTypeInProgess: null, _isWaiting: null, _selectedConnectionIsStale: null, _dataViewerVM: null, _selectedConnectionVM: null, _combinedConnectionList: null, _connectionListViewModel: null, _connectionListManager: null, _groupIdGenerators: null, _isActive: !1, isActive: {get: function() {
                        return this._isActive
                    }}, isAddDataButtonDisabled: {get: function() {
                        return this._isAddDataSourcesPaneVisible() || this._connectionListViewModel.allConnections.length === 0
                    }}, isAddDataSourcesPaneVisible: {
                    get: function() {
                        return this._isAddDataSourcesPaneVisible()
                    }, set: function(value) {
                            this._isAddDataSourcesPaneVisible(value)
                        }
                }, connectionListManager: {get: function() {
                        return this._connectionListManager
                    }}, connectionTypes: {get: function() {
                        return this._connectionTypes()
                    }}, selectedType: {get: function() {
                        return this._selectedType()
                    }}, connectionListViewModel: {get: function() {
                        return this._connectionListViewModel
                    }}, runtime: {get: function() {
                        return this._runtime
                    }}, dispose: function() {
                    this._addDataSourcePromises.cancelAll();
                    AppMagic.Utility.Disposable.prototype.dispose.call(this)
                }, setShownConnectionMember: function(serviceNamespace) {
                    var memberInfo = AppMagic.Authoring.Backstage.RestServiceConnectionHandler.getConnectionMemberInfo(serviceNamespace);
                    this._showConnectionWhenAddedAndResetSelectedConnectionType(memberInfo.connectionId, memberInfo.connectionMemberId)
                }, _showConnectionWhenAddedAndResetSelectedConnectionType: function(connectionId, connectionMemberId) {
                    this._connectionListManager.showConnectionMemberWhenAdded(connectionId, connectionMemberId);
                    this.resetSelectedConnectionType()
                }, reload: function() {
                    this._isActive = !1;
                    this._connectionManager.notifyShow();
                    for (var connections = this._connections(), i = 0, len = connections.length; i < len; i++) {
                        var dataViewerViewModel = connections[i].dataViewerViewModel;
                        if (dataViewerViewModel.viewers.length > 1)
                            dataViewerViewModel.onClickDepthLevel(0)
                    }
                    this._refreshTypes();
                    var events = AppMagic.AuthoringTool.ConnectionListManager.events;
                    this._eventTracker.add(this._connectionListManager, events.connectiontoshowuponadd, this._selectNewlyAddedConnection, this);
                    this._connectionListManager.startManagingConnectionList();
                    connections = this._connections().concat(this._importedConnections());
                    connections.forEach(function(connection) {
                        connection.notifyShow()
                    }.bind(this))
                }, _selectNewlyAddedConnection: function(evt) {
                    this._setSelectedConnectionVM(evt.detail)
                }, selectedConnectionIsStale: {get: function() {
                        return this._selectedConnectionIsStale()
                    }}, selectedConnectionViewModel: {get: function() {
                        return this._selectedConnectionVM()
                    }}, notifyRemoveConnection: function(removedConnectionViewModel) {
                    var selected = this._selectedConnectionVM();
                    selected === removedConnectionViewModel && this.notifySelectConnection(null);
                    this._connectionManager.resetVM(removedConnectionViewModel._serviceId)
                }, notifySelectConnection: function(selectedConnectionViewModel) {
                    var selected = this._selectedConnectionVM();
                    selectedConnectionViewModel !== selected && (selected !== null && (selected.isExpanded = !1), this._setSelectedConnectionVM(selectedConnectionViewModel), this.dispatchEvent(DataConnectionsViewModel.events.dataViewVisible));
                    this._isAddDataSourcesPaneVisible(selectedConnectionViewModel === null)
                }, _createDataSourceGroupIdGeneratorsByServiceId: function() {
                    this._groupIdGenerators = new Collections.Generic.Dictionary;
                    this._groupIdGenerators.setValue(DCs.Types.AzureMobileServices, new AppMagic.Services.AzureMobileServicesGroupIdGenerator);
                    this._groupIdGenerators.setValue(DCs.Types.SharePoint, new AppMagic.Services.SharePointGroupIdGenerator);
                    this._groupIdGenerators.setValue(DCs.Types.RSS, new AppMagic.Services.RssGroupIdGenerator);
                    this._groupIdGenerators.setValue(DCs.Types.REST, new AppMagic.Services.RestGroupIdGenerator);
                    this._groupIdGenerators.setValue(DCs.Types.Excel, new AppMagic.Services.ExcelGroupIdGenerator);
                    this._groupIdGenerators.setValue(DCs.Types.SharePointOnline, new AppMagic.Services.SharePointOnlineGroupIdGenerator);
                    this._groupIdGenerators.setValue(DCs.Types.LocalTable, new AppMagic.Services.LocalTableGroupIdGenerator)
                }, notifyRemoveDataSource: function(dataSourceName) {
                    this._document.removeDataSource(dataSourceName)
                }, addDataSources: function(serviceName, importData) {
                    if (this.dispatchEvent(ServiceConfig.events.hideadd), importData.list.length > 0) {
                        var chosenDataSourceNames = this._addDataSourcesToDocument(serviceName, importData);
                        var groupIdGenerator = this._groupIdGenerators.getValue(serviceName),
                            connectionId = AppMagic.Services.ServiceConnectionIdGenerator.generateConnectionId(chosenDataSourceNames[0], serviceName, importData.list[0].configuration, groupIdGenerator);
                        this._showConnectionWhenAddedAndResetSelectedConnectionType(connectionId, chosenDataSourceNames[0])
                    }
                }, _addDataSourcesToDocument: function(serviceName, importData) {
                    var type = importData.type,
                        list = importData.list,
                        chosenUniqueDataSourceNames = [];
                    if (list.length > 0) {
                        var imported = [];
                        list.forEach(function(item) {
                            var suggestedName = item.suggestedName;
                            var dsName = this._document.createUniqueName(suggestedName);
                            chosenUniqueDataSourceNames.push(dsName);
                            var config = item.configuration;
                            this._createServiceDataSource(dsName, suggestedName, config, serviceName, type);
                            imported.push({
                                name: suggestedName, dsName: dsName
                            })
                        }, this);
                        for (var thereWereErrors = !1, promises = [], i = 0, len = imported.length; i < len; i++) {
                            var p = this._runtime.getData(imported[i].dsName).then(function(sourceName, data) {
                                    thereWereErrors = thereWereErrors || this._runtime.hasError(sourceName)
                                }.bind(this, imported[i].dsName));
                            if (thereWereErrors)
                                break;
                            promises.push(p)
                        }
                        var content = AppMagic.AuthoringStrings.DataSourcesPageUnableToAddSome;
                        thereWereErrors ? (promises.forEach(function(promise) {
                            promise.cancel()
                        }), AppMagic.AuthoringTool.PlatformHelpers.showNotification(AppMagic.AuthoringStrings.AppName, content)) : this._addDataSourcePromises.addJob(function() {
                            return WinJS.Promise.join(promises).then(function() {
                                    thereWereErrors || (content = AppMagic.AuthoringStrings.DataSourcesPageAllSelectedDataSourcesAdded);
                                    setImmediate(function() {
                                        AppMagic.AuthoringTool.PlatformHelpers.showNotification(AppMagic.AuthoringStrings.AppName, content)
                                    })
                                })
                        })
                    }
                    return chosenUniqueDataSourceNames
                }, _createServiceDataSource: function(dsName, suggestedName, config, serviceName, sourceType) {
                    this._runtime.createServiceDataSource(this._document, dsName, suggestedName, config, serviceName, sourceType)
                }, onShowData: function(evt) {
                    this.dispatchEvent(ServiceConfig.events.hideadd);
                    var currentlySelectedConnection = this._selectedConnectionVM();
                    if (currentlySelectedConnection === evt.detail.connectionViewModel)
                        return;
                    else
                        this._collapseCurrentConnection(),
                        this._setSelectedConnectionVM(evt.detail.connectionViewModel)
                }, notifyRefreshConnectionSource: function(details) {
                    this.dispatchEvent(ServiceConfig.events.navigateadd, details)
                }, notifyServiceDatasourceImported: function() {
                    this.dispatchEvent(ServiceConfig.events.hideadd);
                    this.resetSelectedConnectionType()
                }, notifyEnterComplete: function() {
                    this.dispatchEvent(DataConnectionsViewModel.events.entercomplete)
                }, notifyClickAdd: function() {
                    this._collapseCurrentConnection();
                    this.dispatchEvent(DataConnectionsViewModel.events.clickadd)
                }, notifyClickBack: function() {
                    return this._connectionManager.notifyClickBack(), this.resetSelectedConnectionType(), this._eventTracker.remove(this._connectionListManager, AppMagic.AuthoringTool.ConnectionListManager.events.connectiontoshowuponadd), this._connectionListManager.stopManagingConnectionList(), !0
                }, setConnectionTypeAsync: function(connectionType, options, afterConnectCallbackFn) {
                    this._isActive = !0;
                    var selectedType = this._selectedType();
                    selectedType && connectionType !== selectedType && (selectedType.selected = !1);
                    var vm = connectionType.pageVM;
                    return vm && typeof vm.reset == "function" && vm.reset(options), vm && typeof vm.setAfterConnectCallback == "function" && vm.setAfterConnectCallback(afterConnectCallbackFn), vm && typeof vm.notifyBeforeSelectAsync == "function" ? vm.notifyBeforeSelectAsync(options).then(function(result) {
                                result === null || result ? (this._selectedType(connectionType), connectionType.selected = !0) : this.resetSelectedConnectionType();
                                this._isSelectConnectionTypeInProgess = !1
                            }.bind(this), function() {
                                this.resetSelectedConnectionType();
                                this._isSelectConnectionTypeInProgess = !1
                            }.bind(this)) : (this._selectedType(connectionType), connectionType.selected = !0, this._isSelectConnectionTypeInProgess = !1, WinJS.Promise.wrap(!0))
                }, clickConnectionType: function(connectionType, options) {
                    if (connectionType !== this._selectedType()) {
                        var inProgress = this._isSelectConnectionTypeInProgess;
                        (this._isSelectConnectionTypeInProgess = !0, inProgress) || this.dispatchEvent(DataConnectionsViewModel.events.connectionTypeClicked, {
                            connectionType: connectionType, options: options
                        })
                    }
                }, changeSelectionByName: function(typeName, options) {
                    var types = this.connectionTypes.filter(function(type) {
                            return type.id === typeName
                        });
                    this.setConnectionTypeAsync(types[0], options, null)
                }, resetSelectedConnectionType: function() {
                    var selectedType = this._selectedType();
                    selectedType && (selectedType.selected = !1, this._selectedType(null))
                }, reset: function(){}, showHelp: function() {
                    var url = new Platform.Foundation.Uri(AppMagic.AuthoringStrings.DataConnnectionsMoreInfoUrl);
                    Platform.System.Launcher.launchUriAsync(url)
                }, removeImportedConnection: function(serviceNamespace) {
                    this._runtime.removeMetaServiceAndUnregisterWithDocument(serviceNamespace, this._document)
                }, refreshImportedConnection: function(serviceNamespace) {
                    this._runtime.refreshMetaService(serviceNamespace, this._document)
                }, _disableFlyOut: function(evt) {
                    this.dispatchEvent(ServiceConfig.events.hideadd)
                }, _navigateAdd: function(evt) {
                    this.dispatchEvent(ServiceConfig.events.navigateadd, evt.detail)
                }, _removeFromGlobalList: function(conn) {
                    this._combinedConnectionList.remove(function(item) {
                        return item.connectionVM === conn
                    })
                }, _createDataConnectionFromTemplate: function(cm, template) {
                    var serviceId = template.serviceName,
                        pageViewModel = cm.getImporterViewModel(serviceId);
                    return typeof pageViewModel.onload == "function" && pageViewModel.onload(), new DataConnectionType(cm, serviceId, template.displayName, DCs.Icons[serviceId], DCs.Pages[serviceId], pageViewModel)
                }, _refreshTypes: function() {
                    var curSet = {};
                    this.connectionTypes.forEach(function(x) {
                        curSet[x.id] = x
                    });
                    var navigateAction = this._navigateAction,
                        disableFlyOutAction = this._disableFlyOutAction,
                        cm = this._connectionManager,
                        eventTracker = this._eventTracker,
                        templates = this._runtime.getDataTemplates(),
                        cts = [],
                        ct;
                    Object.keys(templates).forEach(function(key) {
                        var template = templates[key],
                            id = template.serviceName,
                            cur = curSet[id];
                        cur ? (cts.push(cur), delete curSet[id]) : (ct = this._createDataConnectionFromTemplate(cm, template), eventTracker.add(ct.pageVM, ServiceConfig.events.navigateadd, navigateAction), cts.push(ct))
                    }, this);
                    var dynamicRestServices = this._runtime.dynamicRESTServices;
                    if (dynamicRestServices !== null)
                        for (var index = 0; index < dynamicRestServices.length; index++) {
                            var restServiceInfo = dynamicRestServices[index];
                            ct = curSet[restServiceInfo.connectorId];
                            ct && delete curSet[restServiceInfo.connectorId];
                            var pageViewModel = new AppMagic.AuthoringTool.ViewModels.RestServicePackageImportConfigViewModel(this._document, AppMagic.Settings.instance, restServiceInfo, this);
                            ct = new DataConnectionType(cm, restServiceInfo.connectorId, restServiceInfo.name, restServiceInfo.iconPath, "/backStages/data/configPages/rest/restServicePackageImportConfig.html", pageViewModel);
                            eventTracker.add(ct.pageVM, ServiceConfig.events.navigateadd, navigateAction);
                            eventTracker.add(ct.pageVM, ServiceConfig.events.hideadd, disableFlyOutAction);
                            cts.push(ct)
                        }
                    cts.sort(function(x, y) {
                        return x.title.localeCompare(y.title)
                    });
                    var doneImportingExcelFn = function(tableNameToDatasourceNameArray, importSuccessful) {
                            if (importSuccessful) {
                                this.dispatchEvent(ServiceConfig.events.hideadd);
                                var excelDataSource = this._document.getStaticDataSource(tableNameToDatasourceNameArray[0].value),
                                    connectionId = AppMagic.Services.ExcelConnectionIdGenerator.generateExcelConnectionId(excelDataSource);
                                this._showConnectionWhenAddedAndResetSelectedConnectionType(connectionId, tableNameToDatasourceNameArray[0].value);
                                var selectedConnectionVM = this._selectedConnectionVM();
                                selectedConnectionVM && selectedConnectionVM.selectedSource && tableNameToDatasourceNameArray.indexOf(selectedConnectionVM.selectedSource.name) >= 0 && this._selectedConnectionVM().refreshData()
                            }
                            else
                                this.resetSelectedConnectionType()
                        }.bind(this);
                    if (ct = curSet[DCs.Types.Excel], ct)
                        delete curSet[DCs.Types.Excel];
                    else {
                        var excelConfigViewModel = new AppMagic.AuthoringTool.ViewModels.ExcelConfigViewModel(cm, doneImportingExcelFn);
                        ct = new DataConnectionType(cm, DCs.Types.Excel, AppMagic.AuthoringStrings.DataConnectionNameExcel, DCs.Icons[DCs.Types.Excel], DCs.Pages[DCs.Types.Excel], excelConfigViewModel);
                        eventTracker.add(ct.pageVM, ServiceConfig.events.navigateadd, navigateAction)
                    }
                    cts.unshift(ct);
                    this._connectionTypes(cts);
                    Object.keys(curSet).forEach(function(id) {
                        eventTracker.remove(curSet[id].pageVM, ServiceConfig.events.complete);
                        eventTracker.remove(curSet[id].pageVM, ServiceConfig.events.navigateadd)
                    });
                    this._runtime.importRESTServices(this._document)
                }, doesConnectorRequireUserInteractionToImport: function(connectorId) {
                    var restConfigImportHandler = this._getRestConfigImportHandlerByConnectorId(connectorId);
                    return restConfigImportHandler !== null && restConfigImportHandler.hasConfigurableTemplateVariables && !restConfigImportHandler.connectorHasDefaultTemplateValues
                }, connectToRestServiceByConnectorIdAsync: function(connectorId, setShownConnection) {
                    return this._createRestConnectionByConnectorIdAsync(connectorId, setShownConnection)
                }, getRestConnectionByName: function(serviceNamespace) {
                    for (var connections = this._connectionListViewModel.allConnections, len = connections.length, i = 0; i < len; i++)
                        if (connections[i].serviceNamespace === serviceNamespace)
                            return connections[i];
                    return null
                }, getRestConnectionByConnectorId: function(connectorId) {
                    for (var connections = this._importedConnections(), len = connections.length, i = 0; i < len; i++)
                        if (connections[i].connectorId === connectorId)
                            return connections[i];
                    return null
                }, getConnectionTypeByConnectorId: function(connectorId) {
                    this._refreshTypes();
                    for (var connectionType = null, i = 0, len = this.connectionTypes.length; i < len; i++) {
                        var ct = this.connectionTypes[i];
                        if (ct.id === connectorId) {
                            connectionType = ct;
                            break
                        }
                    }
                    return connectionType
                }, _getRestConfigImportHandlerByConnectorId: function(connectorId) {
                    var connectionType = this.getConnectionTypeByConnectorId(connectorId);
                    return connectionType ? connectionType.pageVM.restConfigImportHandler : null
                }, _createRestConnectionByConnectorIdAsync: function(connectorId, setShownConnection) {
                    var restConfigImportHandler = this._getRestConfigImportHandlerByConnectorId(connectorId);
                    return restConfigImportHandler ? restConfigImportHandler.connectorHasDefaultTemplateValues ? restConfigImportHandler.importConfigUsingDefaultTemplateValuesAsync(setShownConnection) : restConfigImportHandler.importConfigUsingUserTemplateValuesAsync(null, setShownConnection) : WinJS.Promise.wrap({success: !1})
                }, _collapseCurrentConnection: function() {
                    var selectedConnection = this._selectedConnectionVM();
                    selectedConnection && selectedConnection.isExpanded && selectedConnection.toggleExpansionAndRetrieveData()
                }, _setSelectedConnectionVM: function(connectionVM) {
                    this._selectedConnectionVM() !== connectionVM && this._selectedConnectionIsStale(!0);
                    this._selectedConnectionVM(connectionVM);
                    this._selectedConnectionIsStale(!1)
                }, getStaticSchema: function(sourceName) {
                    for (var ds = this._document.getStaticDataSource(sourceName), columnsAndTypes = ds.type.getColumnsAndTypes(), iter = columnsAndTypes.first(), schema = {}, orderedSchema = []; iter.hasCurrent; iter.moveNext()) {
                        var columnName = iter.current.name,
                            columnInvariantName = iter.current.invariantName,
                            type = iter.current.dataType;
                        var schemaItem = {
                                name: columnName, invariantName: columnInvariantName, type: type.toString()
                            };
                        schema[columnName] = schemaItem
                    }
                    for (var orderedColumnNames = ds.orderedColumnNames, orderedColumnNamesIter = orderedColumnNames.first(); orderedColumnNamesIter.hasCurrent; orderedColumnNamesIter.moveNext()) {
                        var col = orderedColumnNamesIter.current;
                        orderedSchema.push(schema[col])
                    }
                    return AppMagic.Schema.createSchemaForArrayFromPointer(orderedSchema)
                }, getStaticSource: function(sourceName) {
                    var ds = this._document.getStaticDataSource(sourceName);
                    return ds
                }
        }, {events: {
                clickadd: "clickadd", entercomplete: "entercomplete", dataViewVisible: "dataViewVisible", connectionTypeClicked: "connectionTypeClicked"
            }});
    WinJS.Class.mix(DataConnectionsViewModel, WinJS.Utilities.eventMixin);
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {DataConnectionsViewModel: DataConnectionsViewModel})
})(Windows);