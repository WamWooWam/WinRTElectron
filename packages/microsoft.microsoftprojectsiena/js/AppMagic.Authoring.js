//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var ConnectionStatusProvider;
    (function(ConnectionStatusProvider) {
        var AuthoringConnectionStatusProvider = function() {
                function AuthoringConnectionStatusProvider(){}
                return AuthoringConnectionStatusProvider.prototype.getInternetConnectionStatus = function() {
                        var connectionProfile = Windows.Networking.Connectivity.NetworkInformation.getInternetConnectionProfile();
                        return connectionProfile === null ? 1 : connectionProfile.getNetworkConnectivityLevel() === Windows.Networking.Connectivity.NetworkConnectivityLevel.internetAccess ? 0 : 1
                    }, AuthoringConnectionStatusProvider.prototype.getCorpNetConnectionStatus = function() {
                        var hostNames = Windows.Networking.Connectivity.NetworkInformation.getHostNames();
                        if (hostNames === null)
                            return 1;
                        var canonicalHostNames = hostNames.map(function(hostName) {
                                return hostName.canonicalName
                            }),
                            corpNetHostNames = canonicalHostNames.filter(function(canonicalHostName) {
                                return canonicalHostName.indexOf(AuthoringConnectionStatusProvider.MicrosoftCorporateNetworkDomain) >= 0
                            }),
                            isMsftDomainJoined = corpNetHostNames.length > 0;
                        return isMsftDomainJoined ? 0 : 1
                    }, AuthoringConnectionStatusProvider.MicrosoftCorporateNetworkDomain = "corp.microsoft.com", AuthoringConnectionStatusProvider
            }();
        ConnectionStatusProvider.AuthoringConnectionStatusProvider = AuthoringConnectionStatusProvider
    })(ConnectionStatusProvider = AppMagic.ConnectionStatusProvider || (AppMagic.ConnectionStatusProvider = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Authoring;
    (function(Authoring) {
        var DataSourceSetupState = AppMagic.Common.DataSourceSetupState,
            AuthoringDataSourceProviderCreator = function() {
                function AuthoringDataSourceProviderCreator(dataSource, providerPreparer, providerFactory, runtime) {
                    this._dataSource = dataSource;
                    this._providerPreparer = providerPreparer;
                    this._providerFactory = providerFactory;
                    this._runtime = runtime
                }
                return AuthoringDataSourceProviderCreator.prototype.createProvider = function() {
                        var _this = this,
                            currentConfiguration = JSON.parse(this._dataSource.configuration);
                        return this._getReadyState(currentConfiguration).then(function(getReadyResult) {
                                if (!getReadyResult.success)
                                    return WinJS.Promise.wrap({
                                            success: !1, message: AppMagic.AuthoringStrings.DataSourceProviderError_UnableToPrepare
                                        });
                                var configurationToInitialize = getReadyResult.configuration !== null ? getReadyResult.configuration : currentConfiguration;
                                var dataSourceInfo = {
                                        name: _this._dataSourceName(), configuration: JSON.stringify(configurationToInitialize)
                                    },
                                    creator = new AppMagic.Common.PublishDataSourceProviderCreator(dataSourceInfo, _this._providerFactory, _this._runtime);
                                return creator.createProvider()
                            })
                    }, AuthoringDataSourceProviderCreator.prototype._dataSourceName = function() {
                        return this._dataSource.name
                    }, AuthoringDataSourceProviderCreator.prototype._getReadyState = function(currentConfiguration) {
                            return currentConfiguration.state === DataSourceSetupState.Unready ? this._providerPreparer.createProviderReadyState(currentConfiguration.internalConfiguration).then(function(prepareResult) {
                                    if (prepareResult.success) {
                                        var newConfiguration = {
                                                state: DataSourceSetupState.Ready, serviceName: currentConfiguration.serviceName, internalConfiguration: prepareResult.internalConfiguration
                                            };
                                        return WinJS.Promise.wrap({
                                                success: !0, configuration: newConfiguration
                                            })
                                    }
                                    else
                                        return WinJS.Promise.wrap({
                                                success: !1, configuration: null
                                            })
                                }) : WinJS.Promise.wrap({
                                    success: !0, configuration: null
                                })
                        }, AuthoringDataSourceProviderCreator
            }();
        Authoring.AuthoringDataSourceProviderCreator = AuthoringDataSourceProviderCreator
    })(Authoring = AppMagic.Authoring || (AppMagic.Authoring = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AuthoringToolOpenAjax;
(function(AuthoringToolOpenAjax) {
    function mapOpenAjaxPropertyName(propertyName) {
        Contracts.checkNonEmpty(propertyName);
        switch (propertyName) {
            case"x":
            case AppMagic.AuthoringTool.OpenAjaxPropertyNames.X:
                return "x";
            case"y":
            case AppMagic.AuthoringTool.OpenAjaxPropertyNames.Y:
                return "y";
            case"width":
            case AppMagic.AuthoringTool.OpenAjaxPropertyNames.Width:
                return "width";
            case"height":
            case AppMagic.AuthoringTool.OpenAjaxPropertyNames.Height:
                return "height";
            default:
                return Contracts.check(!1, "Unknown property name " + propertyName), propertyName
        }
    }
    AuthoringToolOpenAjax.mapOpenAjaxPropertyName = mapOpenAjaxPropertyName;
    function isBoundsProperty(propertyName) {
        Contracts.checkString(propertyName);
        switch (propertyName) {
            case AppMagic.AuthoringTool.OpenAjaxPropertyNames.X:
            case AppMagic.AuthoringTool.OpenAjaxPropertyNames.Y:
            case AppMagic.AuthoringTool.OpenAjaxPropertyNames.Width:
            case AppMagic.AuthoringTool.OpenAjaxPropertyNames.Height:
            case AppMagic.AuthoringTool.OpenAjaxPropertyNames.ZIndex:
                return !0;
            default:
                return !1
        }
    }
    AuthoringToolOpenAjax.isBoundsProperty = isBoundsProperty
})(AuthoringToolOpenAjax || (AuthoringToolOpenAjax = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Authoring;
    (function(Authoring) {
        var Backstage;
        (function(Backstage) {
            var StaticServiceDataSourceConnectionHandler = function() {
                    function StaticServiceDataSourceConnectionHandler(groupIdGenerators) {
                        this._groupIdGenerators = groupIdGenerators
                    }
                    return StaticServiceDataSourceConnectionHandler.prototype.getConnectionMemberInfo = function(entity) {
                            var serviceName = entity.serviceName;
                            if (!AppMagic.Utility.isString(serviceName) || !this._groupIdGenerators.containsKey(serviceName))
                                return null;
                            var configuration = JSON.parse(entity.configuration),
                                groupIdGenerator = this._groupIdGenerators.getValue(serviceName),
                                connectionId = AppMagic.Services.ServiceConnectionIdGenerator.generateConnectionId(entity.name, serviceName, configuration, groupIdGenerator);
                            return {
                                    connectionId: connectionId, connectionMemberId: entity.name
                                }
                        }, StaticServiceDataSourceConnectionHandler.prototype.createConnectionViewModel = function(entity, dataConnectionsViewModel) {
                            var memberInfo = this.getConnectionMemberInfo(entity),
                                serviceName = entity.serviceName,
                                configuration = JSON.parse(entity.configuration),
                                groupIdGenerator = this._groupIdGenerators.getValue(serviceName),
                                connectionDisplayTitle = groupIdGenerator.generateGroupId(entity.name, configuration);
                            return new AppMagic.AuthoringTool.ViewModels.ConnectionViewModel({}, connectionDisplayTitle, entity.serviceName, dataConnectionsViewModel)
                        }, StaticServiceDataSourceConnectionHandler
                }();
            Backstage.StaticServiceDataSourceConnectionHandler = StaticServiceDataSourceConnectionHandler
        })(Backstage = Authoring.Backstage || (Authoring.Backstage = {}))
    })(Authoring = AppMagic.Authoring || (AppMagic.Authoring = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Authoring;
    (function(Authoring) {
        var BackStage;
        (function(BackStage) {
            (function(ConnectionType) {
                ConnectionType[ConnectionType.RestService = 0] = "RestService";
                ConnectionType[ConnectionType.DataSourceGroup = 1] = "DataSourceGroup";
                ConnectionType[ConnectionType.LocalTableConnection = 2] = "LocalTableConnection"
            })(BackStage.ConnectionType || (BackStage.ConnectionType = {}));
            var ConnectionType = BackStage.ConnectionType
        })(BackStage = Authoring.BackStage || (Authoring.BackStage = {}))
    })(Authoring = AppMagic.Authoring || (AppMagic.Authoring = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Authoring;
    (function(Authoring) {
        var Backstage;
        (function(Backstage) {
            var ExcelConnectionHandler = function() {
                    function ExcelConnectionHandler(){}
                    return ExcelConnectionHandler.prototype.getConnectionMemberInfo = function(entity) {
                            if (entity.kind !== Microsoft.AppMagic.Authoring.DataSourceKind.static || typeof entity.isSampleData != "boolean" || entity.isSampleData)
                                return null;
                            var serviceName = AppMagic.Constants.DataConnections.Types.Excel,
                                groupIdGenerator = new AppMagic.Services.ExcelGroupIdGenerator,
                                connectionId = AppMagic.Services.ServiceConnectionIdGenerator.generateConnectionId(entity.name, serviceName, entity, groupIdGenerator);
                            return {
                                    connectionId: connectionId, connectionMemberId: entity.name
                                }
                        }, ExcelConnectionHandler.prototype.createConnectionViewModel = function(entity, dataConnectionsViewModel) {
                            var memberInfo = this.getConnectionMemberInfo(entity),
                                serviceName = AppMagic.Constants.DataConnections.Types.Excel,
                                groupIdGenerator = new AppMagic.Services.ExcelGroupIdGenerator,
                                connectionId = AppMagic.Services.ServiceConnectionIdGenerator.generateConnectionId(entity.name, serviceName, entity, groupIdGenerator),
                                connectionDisplayTitle = groupIdGenerator.generateGroupId(entity.name, entity);
                            return new AppMagic.AuthoringTool.ViewModels.ConnectionViewModel({}, connectionDisplayTitle, serviceName, dataConnectionsViewModel)
                        }, ExcelConnectionHandler
                }();
            Backstage.ExcelConnectionHandler = ExcelConnectionHandler
        })(Backstage = Authoring.Backstage || (Authoring.Backstage = {}))
    })(Authoring = AppMagic.Authoring || (AppMagic.Authoring = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Authoring;
    (function(Authoring) {
        var Backstage;
        (function(Backstage) {
            var RestServiceConnectionHandler = function() {
                    function RestServiceConnectionHandler(doc, runtime) {
                        this._document = doc;
                        this._runtime = runtime
                    }
                    return RestServiceConnectionHandler.getConnectionMemberInfo = function(serviceNamespace) {
                            var connectionId = serviceNamespace.length.toString() + "+" + serviceNamespace;
                            return {
                                    connectionId: connectionId, connectionMemberId: serviceNamespace
                                }
                        }, RestServiceConnectionHandler.prototype.getConnectionMemberInfo = function(entity) {
                            return typeof entity.serviceNamespace != "string" || typeof entity.hasConfig != "boolean" || !entity.hasConfig ? null : RestServiceConnectionHandler.getConnectionMemberInfo(entity.serviceNamespace)
                        }, RestServiceConnectionHandler.prototype.createConnectionViewModel = function(serviceInfo, dataConnectionsViewModel) {
                                var _this = this,
                                    serviceNamespace = serviceInfo.serviceNamespace,
                                    connectorDef = serviceInfo.connectorId === null ? null : {
                                        id: serviceInfo.connectorId, version: serviceInfo.connectorVersionString
                                    };
                                var fullPath = serviceInfo.configName,
                                    templateUserValues = serviceInfo.templateUserValuesJSON.length === 0 ? null : JSON.parse(serviceInfo.templateUserValuesJSON),
                                    originalXml = serviceInfo.originalXML.length === 0 ? null : serviceInfo.originalXML,
                                    DC = AppMagic.Constants.DataConnections,
                                    dcv = AppMagic.context.documentViewModel.backStage.dataConnectionsViewModel;
                                var restConfigImportHandler = new AppMagic.Services.Meta.RestConfigImportHandler(serviceNamespace, connectorDef, originalXml, DC.Icons[DC.Types.REST], null, templateUserValues, this._document, AppMagic.Settings.instance, dcv);
                                restConfigImportHandler.initializeTemplateDefinition();
                                var icon = this._findIconForServiceInfo(serviceInfo),
                                    importedConnection = new AppMagic.AuthoringTool.ViewModels.ImportedRestConfigViewModel(serviceNamespace, connectorDef, fullPath, this._runtime, restConfigImportHandler, icon, dataConnectionsViewModel),
                                    workerController = this._runtime.getImportedService(serviceNamespace),
                                    result = this._document.tryGetServiceDocumentation(serviceNamespace);
                                var currServiceDictionary = result.documentationInfo;
                                var dctTmpl = new Microsoft.AppMagic.Authoring.ServiceLanguageDictionaryTemplate(currServiceDictionary),
                                    fnListing = workerController.functions.slice(0),
                                    nameSort = function(fnObj0, fnObj1) {
                                        return fnObj0.name.localeCompare(fnObj1.name)
                                    };
                                return fnListing.sort(nameSort).forEach(function(x) {
                                        if (!x.hideFromBackstage) {
                                            var optionalParametersDescription = x.optionalParameters.map(function(parameter) {
                                                    return _this._parameterJoin(parameter, dctTmpl)
                                                }).join("\r\n"),
                                                requiredParametersDescription = x.requiredParameters.map(function(parameter) {
                                                    return _this._parameterJoin(parameter, dctTmpl)
                                                }).join("\r\n"),
                                                requiredOptionalParametersSeparator = x.requiredParameters.length > 0 && x.optionalParameters.length > 0 ? "\r\n" : "";
                                            var parametersDescription = requiredParametersDescription + requiredOptionalParametersSeparator + optionalParametersDescription,
                                                displayName = x.docId === null ? x.name : dctTmpl.getLocaleSpecificDisplayNameOrDefault(x.docId, x.name),
                                                desc = x.docId === null ? "" : dctTmpl.getLocaleSpecificTitleOrDefault(x.docId, "");
                                            importedConnection.addFunction(x.name, desc, parametersDescription, displayName)
                                        }
                                    }), importedConnection
                            }, RestServiceConnectionHandler.prototype._findIconForServiceInfo = function(serviceInfo) {
                                for (var restServices = this._runtime.dynamicRESTServices, j = 0, svcLen = restServices.length; j < svcLen; j++) {
                                    var svc = restServices[j];
                                    if (serviceInfo.connectorId === svc.connectorId)
                                        return svc.iconPath
                                }
                                var DC = AppMagic.Constants.DataConnections;
                                return DC.Icons[DC.Types.REST]
                            }, RestServiceConnectionHandler.prototype._parameterJoin = function(parameter, dctTmpl) {
                                var TypeNames = {};
                                TypeNames[AppMagic.Schema.TypeBoolean] = AppMagic.AuthoringStrings.TypeNameBoolean;
                                TypeNames[AppMagic.Schema.TypeNumber] = AppMagic.AuthoringStrings.TypeNameNumber;
                                TypeNames[AppMagic.Schema.TypeString] = AppMagic.AuthoringStrings.TypeNameString;
                                TypeNames[AppMagic.Schema.TypeHyperlink] = AppMagic.AuthoringStrings.TypeNameHyperlink;
                                TypeNames[AppMagic.Schema.TypeImage] = AppMagic.AuthoringStrings.TypeNameImage;
                                TypeNames[AppMagic.Schema.TypeMedia] = AppMagic.AuthoringStrings.TypeNameMedia;
                                TypeNames[AppMagic.Schema.TypeArray] = AppMagic.AuthoringStrings.TypeNameTable;
                                TypeNames[AppMagic.Schema.TypeObject] = AppMagic.AuthoringStrings.TypeNameRecord;
                                var parameterSchema = parameter.getSchema(0);
                                var dtype = parameterSchema.type,
                                    typeName = TypeNames[dtype];
                                var requirednessSpecifier = parameter.isRequired ? " (" + AppMagic.AuthoringStrings.RestConnectionFunctionParameterRequiredText + ")" : "",
                                    docText = Core.Utility.formatString("- {0}{1}: {2}", parameter.name, requirednessSpecifier, typeName);
                                var paramDescription = parameter.docId === null ? "" : dctTmpl.getLocaleSpecificTitleOrDefault(parameter.docId, "");
                                if (paramDescription !== "" && (docText += "\r\n" + paramDescription), parameter.defaultValue !== null) {
                                    var defaultValue = parameter.defaultValue;
                                    (dtype === AppMagic.Schema.TypeString || dtype === AppMagic.Schema.TypeHyperlink) && (defaultValue = '"' + defaultValue.replace('"', '""') + '"');
                                    docText += Core.Utility.formatString("\r\nDefault Value: {0}", defaultValue)
                                }
                                return docText + "\r\n"
                            }, RestServiceConnectionHandler
                }();
            Backstage.RestServiceConnectionHandler = RestServiceConnectionHandler
        })(Backstage = Authoring.Backstage || (Authoring.Backstage = {}))
    })(Authoring = AppMagic.Authoring || (AppMagic.Authoring = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Authoring;
    (function(Authoring) {
        var Backstage;
        (function(Backstage) {
            var SharePointListImporter = function() {
                    function SharePointListImporter(sharePointImportViewModel) {
                        this._sharePointImportViewModel = sharePointImportViewModel
                    }
                    return SharePointListImporter.prototype.processLists = function(listNames) {
                            var tables = Object.create(null);
                            listNames.forEach(function(listName) {
                                tables[listName] = !1
                            });
                            var tryGetResult = this._tryGetGroup();
                            if (tryGetResult.value) {
                                var group = tryGetResult.outValue;
                                Object.keys(group).forEach(function(dataSourceName) {
                                    var tableName = group[dataSourceName];
                                    Core.Utility.isDefined(tables[tableName]) && (tables[tableName] = !0)
                                })
                            }
                            this._sharePointImportViewModel.showTables(tables)
                        }, SharePointListImporter.prototype.addTablesAsDataSources = function(tableNames) {
                            var existing = this._computeExistingTableSet();
                            this._addTablesAsDataSources(tableNames, existing)
                        }, SharePointListImporter.prototype._computeExistingTableSet = function() {
                                var existing = Object.create(null),
                                    tryGetResult = this._tryGetGroup();
                                if (tryGetResult.value) {
                                    var group = tryGetResult.outValue;
                                    Object.keys(group).forEach(function(dataSourceName) {
                                        var table = group[dataSourceName];
                                        existing[table] = !0
                                    })
                                }
                                return existing
                            }, SharePointListImporter.prototype._tryGetGroup = function() {
                                return null
                            }, SharePointListImporter.prototype._addTablesAsDataSources = function(tableNames, existingTables) {
                                return null
                            }, SharePointListImporter
                }();
            Backstage.SharePointListImporter = SharePointListImporter
        })(Backstage = Authoring.Backstage || (Authoring.Backstage = {}))
    })(Authoring = AppMagic.Authoring || (AppMagic.Authoring = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var DCs = AppMagic.Constants.DataConnections,
            DataSourceOriginalNameStore = function() {
                function DataSourceOriginalNameStore(doc, groupIdGenerators) {
                    this._document = doc;
                    this._groupIdGenerators = groupIdGenerators;
                    this._eventTracker = null;
                    this._dataSourceNameToOriginalNameByServiceAndGroupId = null
                }
                return DataSourceOriginalNameStore.prototype.beginTrackingNames = function() {
                        this._dataSourceNameToOriginalNameByServiceAndGroupId = new Collections.Generic.TwoKeyDictionary;
                        this._eventTracker = new AppMagic.Utility.EventTracker;
                        for (var iter = this._document.dataSources.first(); iter.hasCurrent; ) {
                            var dataSource = iter.current;
                            iter.moveNext();
                            dataSource.kind === Microsoft.AppMagic.Authoring.DataSourceKind.service ? this._isOriginalNameTrackableDataSource(dataSource) && this._addServiceDataSource(dataSource) : dataSource.kind !== Microsoft.AppMagic.Authoring.DataSourceKind.static || dataSource.isSampleData || this._addStaticDataSource(dataSource)
                        }
                        this._eventTracker.add(this._document, "entityadded", this._entityAdded, this);
                        this._eventTracker.add(this._document, "entityremoved", this._entityRemoved, this)
                    }, DataSourceOriginalNameStore.prototype.stopTrackingNames = function() {
                        this._eventTracker.dispose();
                        this._eventTracker = null;
                        this._dataSourceNameToOriginalNameByServiceAndGroupId = null
                    }, DataSourceOriginalNameStore.prototype._addDataSource = function(serviceId, groupId, dataSourceName, originalName) {
                            var dataSourceNameToOriginalName,
                                tryGetResult = this._dataSourceNameToOriginalNameByServiceAndGroupId.tryGetValue(serviceId, groupId);
                            tryGetResult.value ? dataSourceNameToOriginalName = tryGetResult.outValue : (dataSourceNameToOriginalName = Object.create(null), this._dataSourceNameToOriginalNameByServiceAndGroupId.setValue(serviceId, groupId, dataSourceNameToOriginalName));
                            dataSourceNameToOriginalName[dataSourceName] = originalName
                        }, DataSourceOriginalNameStore.prototype._addServiceDataSource = function(dataSource) {
                            var serviceId = dataSource.serviceName,
                                configuration = JSON.parse(dataSource.configuration),
                                groupId = this._groupIdGenerators.getValue(serviceId).generateGroupId(dataSource.name, configuration);
                            this._addDataSource(serviceId, groupId, dataSource.name, dataSource.originalName)
                        }, DataSourceOriginalNameStore.prototype._addStaticDataSource = function(dataSource) {
                            var serviceId = DCs.Types.Excel,
                                entries = Windows.Storage.AccessCache.StorageApplicationPermissions.futureAccessList.entries.filter(function(entry) {
                                    return entry.token === dataSource.futureAccessToken
                                });
                            var groupId = entries.length === 1 ? entries[0].metadata : AppMagic.AuthoringStrings.UnknownExcelName;
                            this._addDataSource(serviceId, groupId, dataSource.name, dataSource.originalName)
                        }, DataSourceOriginalNameStore.prototype._isOriginalNameTrackableDataSource = function(dataSource) {
                            return this._groupIdGenerators.containsKey(dataSource.serviceName)
                        }, DataSourceOriginalNameStore.prototype._isOriginalNameTrackableEntityEvent = function(evt) {
                            return evt.entityType === Microsoft.AppMagic.Authoring.EntityType.serviceDataSource && this._isOriginalNameTrackableDataSource(evt.entity)
                        }, DataSourceOriginalNameStore.prototype._entityAdded = function(evt) {
                            evt.entityType !== Microsoft.AppMagic.Authoring.EntityType.staticDataSource || evt.entity.isSampleData ? this._isOriginalNameTrackableEntityEvent(evt) && this._addServiceDataSource(evt.entity) : this._addStaticDataSource(evt.entity)
                        }, DataSourceOriginalNameStore.prototype._entityRemoved = function(evt) {
                            if (evt.entityType !== Microsoft.AppMagic.Authoring.EntityType.staticDataSource || evt.entity.isSampleData) {
                                if (this._isOriginalNameTrackableEntityEvent(evt)) {
                                    var serviceId = evt.entity.serviceName,
                                        configuration = JSON.parse(evt.entity.configuration),
                                        groupId = this._groupIdGenerators.getValue(serviceId).generateGroupId(evt.entity.name, configuration);
                                    delete this._dataSourceNameToOriginalNameByServiceAndGroupId.getValue(serviceId, groupId)[evt.entity.name];
                                    this._deleteNameMappingIfEmpty(serviceId, groupId)
                                }
                            }
                            else {
                                var groupId = (new AppMagic.Services.ExcelGroupIdGenerator).generateGroupId(evt.entity.name, evt.entity);
                                delete this._dataSourceNameToOriginalNameByServiceAndGroupId.getValue(AppMagic.Constants.DataConnections.Types.Excel, groupId)[evt.entity.name];
                                this._deleteNameMappingIfEmpty(AppMagic.Constants.DataConnections.Types.Excel, groupId)
                            }
                        }, DataSourceOriginalNameStore.prototype._deleteNameMappingIfEmpty = function(serviceId, groupId) {
                            var nameMapping = this._dataSourceNameToOriginalNameByServiceAndGroupId.getValue(serviceId, groupId);
                            Object.keys(nameMapping).length === 0 && this._dataSourceNameToOriginalNameByServiceAndGroupId.deleteValue(serviceId, groupId)
                        }, DataSourceOriginalNameStore.prototype.tryGetGroup = function(serviceId, groupId) {
                            if (!this._dataSourceNameToOriginalNameByServiceAndGroupId)
                                return {
                                        value: !1, outValue: null
                                    };
                            var tryGetResult = this._dataSourceNameToOriginalNameByServiceAndGroupId.tryGetValue(serviceId, groupId);
                            return {
                                    value: tryGetResult.value, outValue: AppMagic.Utility.jsonClone(tryGetResult.outValue)
                                }
                        }, DataSourceOriginalNameStore
            }();
        AuthoringTool.DataSourceOriginalNameStore = DataSourceOriginalNameStore
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            b.hasOwnProperty(p) && (d[p] = b[p]);
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    },
    AppMagic;
(function(AppMagic) {
    var Authoring;
    (function(Authoring) {
        var Backstage;
        (function(Backstage) {
            var SharePointOnlineListImporter = function(_super) {
                    __extends(SharePointOnlineListImporter, _super);
                    function SharePointOnlineListImporter(sharePointImportViewModel, dataSourceOriginalNameStore) {
                        _super.call(this, sharePointImportViewModel);
                        this._dataSourceOriginalNameStore = dataSourceOriginalNameStore
                    }
                    return SharePointOnlineListImporter.prototype._tryGetGroup = function() {
                            var groupId = AppMagic.AuthoringStrings.BackStageSharepointOnlineTitle;
                            return this._dataSourceOriginalNameStore.tryGetGroup(AppMagic.Constants.DataConnections.Types.SharePointOnline, groupId)
                        }, SharePointOnlineListImporter.prototype._addTablesAsDataSources = function(tableNames, existingTables) {
                            for (var tableList = [], i = 0, len = tableNames.length; i < len; i++) {
                                var tableName = tableNames[i];
                                existingTables[tableName] || tableList.push({
                                    suggestedName: tableName, configuration: {
                                            listName: tableName, appInfo: AppMagic.AuthoringTool.Runtime.azureConnectionManager.clientAppInfo
                                        }
                                })
                            }
                            this._sharePointImportViewModel.importSharePointOnline({
                                type: "onlinelist", list: tableList
                            })
                        }, SharePointOnlineListImporter
                }(Backstage.SharePointListImporter);
            Backstage.SharePointOnlineListImporter = SharePointOnlineListImporter
        })(Backstage = Authoring.Backstage || (Authoring.Backstage = {}))
    })(Authoring = AppMagic.Authoring || (AppMagic.Authoring = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Authoring;
    (function(Authoring) {
        var Backstage;
        (function(Backstage) {
            var SharePointOnPremisisListImporter = function(_super) {
                    __extends(SharePointOnPremisisListImporter, _super);
                    function SharePointOnPremisisListImporter(sharePointImportViewModel, dataSourceOriginalNameStore) {
                        _super.call(this, sharePointImportViewModel);
                        this._dataSourceOriginalNameStore = dataSourceOriginalNameStore
                    }
                    return SharePointOnPremisisListImporter.prototype._tryGetGroup = function() {
                            var groupId = this._sharePointImportViewModel.searchedUrlCanonicalized;
                            return this._dataSourceOriginalNameStore.tryGetGroup(AppMagic.Constants.DataConnections.Types.SharePoint, groupId)
                        }, SharePointOnPremisisListImporter.prototype._addTablesAsDataSources = function(tableNames, existingTables) {
                            for (var tableList = [], i = 0, len = tableNames.length; i < len; i++) {
                                var tableName = tableNames[i];
                                existingTables[tableName] || tableList.push({
                                    suggestedName: tableName, configuration: {
                                            siteUri: this._sharePointImportViewModel.searchedUrlCanonicalized, listName: tableName
                                        }
                                })
                            }
                            this._sharePointImportViewModel.importSharePointOnPrem({
                                type: "list", list: tableList
                            })
                        }, SharePointOnPremisisListImporter
                }(Backstage.SharePointListImporter);
            Backstage.SharePointOnPremisisListImporter = SharePointOnPremisisListImporter
        })(Backstage = Authoring.Backstage || (Authoring.Backstage = {}))
    })(Authoring = AppMagic.Authoring || (AppMagic.Authoring = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var BulkRuleUpdater = function() {
                function BulkRuleUpdater(doc) {
                    this._rulesToUpdate = [];
                    this._ruleVms = [];
                    this._doc = doc
                }
                return BulkRuleUpdater.prototype.addRuleUpdate = function(controlName, invariantPropertyName, ruleValue, ruleVm) {
                        Contracts.checkNonEmpty(controlName);
                        Contracts.checkNonEmpty(invariantPropertyName);
                        Contracts.checkString(ruleValue);
                        Contracts.checkObject(ruleVm);
                        this._rulesToUpdate.push(new Microsoft.AppMagic.Authoring.ScriptContext(this._doc, controlName, invariantPropertyName, ruleValue));
                        this._ruleVms.push(ruleVm)
                    }, BulkRuleUpdater.prototype.bulkUpdateRules = function() {
                        this._doc.addRules(this._rulesToUpdate);
                        this._ruleVms.forEach(function(ruleVm) {
                            ruleVm.refreshRuleFromDocument()
                        });
                        this._rulesToUpdate = [];
                        this._ruleVms = []
                    }, BulkRuleUpdater
            }();
        AuthoringTool.BulkRuleUpdater = BulkRuleUpdater
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ViewModels;
        (function(ViewModels) {
            var CanvasManager = function(_super) {
                    __extends(CanvasManager, _super);
                    function CanvasManager(entityManager, selectionManager, isPreview, zoom, undoManager, clipboardManager, documentLayoutManager) {
                        _super.call(this);
                        this._clipboardManager = null;
                        this._undoManager = null;
                        this._entityManager = null;
                        this._selectionManager = null;
                        this._isPreview = null;
                        this._visualLabelsVisible = ko.observable(!1);
                        this._zoom = null;
                        this._screenCanvasBindings = [];
                        this._screenCanvases = ko.observableArray();
                        this._selectedScreenCanvas = ko.observable(null);
                        this._nestedCanvasBindings = [];
                        this._selectedVisualsCommonCanvas = ko.observable(null);
                        this._initialized = !1;
                        Contracts.checkValue(entityManager);
                        Contracts.checkValue(selectionManager);
                        Contracts.checkObservable(isPreview);
                        Contracts.checkValue(zoom);
                        Contracts.checkValue(undoManager);
                        Contracts.checkValue(clipboardManager);
                        Contracts.checkValue(documentLayoutManager);
                        AppMagic.Utility.Disposable.call(this);
                        this.track("_eventTracker", new AppMagic.Utility.EventTracker);
                        this._entityManager = entityManager;
                        this._selectionManager = selectionManager;
                        this._isPreview = isPreview;
                        this._zoom = zoom;
                        this._undoManager = undoManager;
                        this._clipboardManager = clipboardManager;
                        this._documentLayoutManager = documentLayoutManager;
                        this._eventTracker.add(entityManager, "screenadded", this._handleScreenAdded, this);
                        this._eventTracker.add(entityManager, "screenremoved", this._handleScreenRemoved, this);
                        this._eventTracker.add(selectionManager, "canvaschanged", this._updateSelectedVisualsCommonCanvas, this);
                        this._eventTracker.add(selectionManager, "screenchanged", this._handleSelectedScreenChanged, this);
                        this._eventTracker.add(selectionManager, "visualschanged", this._updateSelectedVisualsCommonCanvas, this);
                        this._populateInitialScreens()
                    }
                    return CanvasManager.prototype.createNestedCanvas = function(parentVisual, id, width, height, options) {
                            Contracts.check(this._entityManager.containsVisual(parentVisual));
                            Contracts.checkRange(id, 0, CanvasManager.maximumCanvasId, "Nested canvas ID out of range.");
                            Contracts.checkObservableNumber(width);
                            Contracts.checkObservableNumber(height);
                            Contracts.checkObjectOrUndefined(options);
                            for (var binding, i = 0, len = this._nestedCanvasBindings.length; i < len; i++)
                                if (binding = this._nestedCanvasBindings[i], binding.canvas.owner === parentVisual && binding.canvas.id === id)
                                    throw new Error("Nested canvas with ID " + id.toString() + " already exists for this visual.");
                            var visuals = this._entityManager.createFilteredVisuals(function(visual) {
                                    return visual.parent === parentVisual && visual.canvasId === id
                                }),
                                canvas = new AppMagic.AuthoringTool.ViewModels.CanvasViewModel(this._selectionManager, parentVisual, id, visuals, null, width, height, this._documentLayoutManager, !0, this._isPreview, this._zoom, this._undoManager, this._clipboardManager, options);
                            return this.trackAnonymous(canvas), binding = new CanvasBinding(canvas, visuals), this._nestedCanvasBindings.push(binding), options && options.originOffsetX && options.originOffsetY && options.templateWidth && options.templateHeight && options.resizeCanvas && parentVisual.initNestedCanvas(options.originOffsetX, options.originOffsetY, options.templateWidth, options.templateHeight, options.resizeCanvas), canvas
                        }, CanvasManager.prototype.getCanvasForScreen = function(screenViewModel) {
                            Contracts.check(this._entityManager.containsScreen(screenViewModel));
                            var canvas = this._tryGetCanvasForScreen(screenViewModel);
                            return Contracts.checkValue(canvas), canvas
                        }, CanvasManager.prototype.hideVisualLabels = function() {
                                this._visualLabelsVisible(!1)
                            }, CanvasManager.prototype.initialize = function() {
                                var canvases = [];
                                if (!this._initialized) {
                                    this._initialized = !0;
                                    for (var i = 0, len = this._screenCanvasBindings.length; i < len; i++) {
                                        var binding = this._screenCanvasBindings[i];
                                        canvases.push(binding.canvas.initialize())
                                    }
                                }
                                return WinJS.Promise.join(canvases)
                            }, CanvasManager.prototype.removeNestedCanvas = function(parentVisual, id) {
                                Contracts.check(this._entityManager.containsVisual(parentVisual));
                                Contracts.checkRange(id, 0, CanvasManager.maximumCanvasId, "Nested canvas ID out of range.");
                                for (var i = 0, len = this._nestedCanvasBindings.length; i < len; i++) {
                                    var binding = this._nestedCanvasBindings[i];
                                    if (binding.canvas.owner === parentVisual && binding.canvas.id === id) {
                                        this._nestedCanvasBindings.splice(i, 1);
                                        binding.canvas.dispose();
                                        return
                                    }
                                }
                                throw new Error("Nested canvas not found.");
                            }, CanvasManager.prototype.selectCurrentCanvasVisuals = function() {
                                if (this._selectionManager.canvas)
                                    this._selectionManager.selectVisualsOrGroups(this._selectionManager.canvas.visuals);
                                else {
                                    var commonCanvas = this._selectedVisualsCommonCanvas();
                                    commonCanvas ? this._selectionManager.selectVisualsOrGroups(commonCanvas.visuals) : this._selectionManager.selectCurrentScreenVisuals()
                                }
                            }, Object.defineProperty(CanvasManager.prototype, "selectedScreenCanvas", {
                                get: function() {
                                    return this._selectedScreenCanvas()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(CanvasManager.prototype, "selectedVisualsCommonCanvas", {
                                get: function() {
                                    return this._selectedVisualsCommonCanvas()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(CanvasManager.prototype, "screenCanvases", {
                                get: function() {
                                    return this._screenCanvases()
                                }, enumerable: !0, configurable: !0
                            }), CanvasManager.prototype.tryGetNestedCanvasForVisual = function(visualViewModel, canvasId) {
                                Contracts.checkValue(visualViewModel);
                                Contracts.checkRange(canvasId, 0, CanvasManager.maximumCanvasId, "Nested canvas ID out of range.");
                                for (var i = 0, len = this._nestedCanvasBindings.length; i < len; i++) {
                                    var binding = this._nestedCanvasBindings[i];
                                    if (binding.canvas.owner === visualViewModel && binding.canvas.id === canvasId)
                                        return binding.canvas
                                }
                                return null
                            }, Object.defineProperty(CanvasManager.prototype, "visualLabelsVisible", {
                                get: function() {
                                    return !this._isPreview() && this._visualLabelsVisible()
                                }, set: function(value) {
                                        Contracts.checkBoolean(value);
                                        this._visualLabelsVisible(value)
                                    }, enumerable: !0, configurable: !0
                            }), CanvasManager.prototype.getParentCanvasForVisual = function(visual) {
                                return this._getParentCanvasForVisual(visual)
                            }, CanvasManager.prototype._getParentCanvasForVisual = function(visual) {
                                Contracts.checkValue(visual);
                                var canvas = null;
                                return visual.parent && (canvas = this._entityManager.tryGetVisualByName(visual.parent.name) ? this.tryGetNestedCanvasForVisual(visual.parent, visual.canvasId) : this.getCanvasForScreen(visual.parent)), canvas
                            }, CanvasManager.prototype._handleScreenAdded = function(evt) {
                                Contracts.checkValue(evt);
                                Contracts.checkValue(evt.detail);
                                Contracts.checkValue(evt.detail.screen);
                                var screenViewModel = evt.detail.screen,
                                    visuals = this._createFilteredVisuals(screenViewModel),
                                    nestedVisuals = this._createFilteredNestedVisuals(screenViewModel),
                                    canvas = new AppMagic.AuthoringTool.ViewModels.CanvasViewModel(this._selectionManager, screenViewModel, 0, visuals, nestedVisuals, ko.observable(this._documentLayoutManager.width), ko.observable(this._documentLayoutManager.height), this._documentLayoutManager, !1, this._isPreview, this._zoom, this._undoManager, this._clipboardManager);
                                this.trackAnonymous(canvas);
                                var binding = new CanvasBinding(canvas, visuals);
                                this._screenCanvasBindings.push(binding);
                                this._screenCanvases.push(canvas);
                                this._selectionManager.screen === screenViewModel && this._selectedScreenCanvas(canvas)
                            }, CanvasManager.prototype._createFilteredVisuals = function(screenViewModel) {
                                return this._entityManager.createFilteredVisuals(function(visual) {
                                        return visual.parent === screenViewModel
                                    })
                            }, CanvasManager.prototype._createFilteredNestedVisuals = function(screenViewModel) {
                                return this._entityManager.createFilteredVisuals(function(visual) {
                                        for (var iteratingEntity = visual.parent; iteratingEntity instanceof ViewModels.VisualViewModel; ) {
                                            if (iteratingEntity.parent === screenViewModel)
                                                return !0;
                                            iteratingEntity = iteratingEntity.parent
                                        }
                                        return !1
                                    })
                            }, CanvasManager.prototype._handleScreenRemoved = function(evt) {
                                Contracts.checkValue(evt);
                                Contracts.checkValue(evt.detail);
                                Contracts.checkValue(evt.detail.screen);
                                for (var screenViewModel = evt.detail.screen, i = 0, len = this._screenCanvasBindings.length; i < len; i++) {
                                    var binding = this._screenCanvasBindings[i];
                                    if (binding.canvas.owner === screenViewModel) {
                                        this._entityManager.removeFilteredVisuals(binding.visuals);
                                        this._screenCanvasBindings.splice(i, 1);
                                        this._screenCanvases.splice(i, 1);
                                        binding.canvas.dispose();
                                        return
                                    }
                                }
                                Contracts.check(!1, "Unknown screen.")
                            }, CanvasManager.prototype._handleSelectedScreenChanged = function(evt) {
                                Contracts.checkValue(evt);
                                Contracts.checkValue(evt.detail);
                                Contracts.checkValue(evt.detail.newScreen);
                                var canvas = this._tryGetCanvasForScreen(evt.detail.newScreen);
                                canvas && this._selectedScreenCanvas(canvas)
                            }, CanvasManager.prototype._populateInitialScreens = function() {
                                for (var screens = this._entityManager.screens(), i = 0, len = screens.length; i < len; i++)
                                    this._handleScreenAdded({detail: {screen: screens[i]}})
                            }, CanvasManager.prototype._tryGetCanvasForScreen = function(screenViewModel) {
                                Contracts.checkValue(screenViewModel);
                                for (var i = 0, len = this._screenCanvasBindings.length; i < len; i++) {
                                    var binding = this._screenCanvasBindings[i];
                                    if (binding.canvas.owner === screenViewModel)
                                        return binding.canvas
                                }
                                return null
                            }, CanvasManager.prototype._updateSelectedVisualsCommonCanvas = function() {
                                var commonCanvas = null,
                                    visuals = this._selectionManager.visuals;
                                if (visuals.length > 0) {
                                    commonCanvas = this._getParentCanvasForVisual(visuals[0]);
                                    var sameCanvases = visuals.every(function(visual) {
                                            var canvas = this._getParentCanvasForVisual(visual);
                                            return canvas === commonCanvas
                                        }.bind(this));
                                    sameCanvases || (commonCanvas = null)
                                }
                                this._selectedVisualsCommonCanvas(commonCanvas)
                            }, CanvasManager.maximumCanvasId = 10, CanvasManager
                }(AppMagic.Utility.Disposable);
            ViewModels.CanvasManager = CanvasManager;
            var CanvasBinding = function() {
                    function CanvasBinding(canvas, visuals) {
                        this._canvas = null;
                        this._visuals = null;
                        Contracts.checkValue(canvas);
                        Contracts.checkValue(visuals);
                        this._canvas = canvas;
                        this._visuals = visuals
                    }
                    return Object.defineProperty(CanvasBinding.prototype, "canvas", {
                            get: function() {
                                return this._canvas
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(CanvasBinding.prototype, "visuals", {
                            get: function() {
                                return this._visuals
                            }, enumerable: !0, configurable: !0
                        }), CanvasBinding
                }()
        })(ViewModels = AuthoringTool.ViewModels || (AuthoringTool.ViewModels = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ContentEditableTextBinding = function(_super) {
                __extends(ContentEditableTextBinding, _super);
                function ContentEditableTextBinding(element, observableValue) {
                    _super.call(this);
                    this._element = null;
                    this._observableValue = null;
                    this._element = element;
                    this._observableValue = observableValue;
                    var onElementChanged = this._onElementChanged.bind(this);
                    element.onkeyup = onElementChanged;
                    element.onkeypress = onElementChanged;
                    this.trackAnonymous(observableValue.subscribe(this._onValueChanged, this));
                    this._onValueChanged();
                    element.focus();
                    ko.utils.domNodeDisposal.addDisposeCallback(element, this.dispose.bind(this))
                }
                return ContentEditableTextBinding.prototype.dispose = function() {
                        _super.prototype.dispose.call(this);
                        this._element.blur();
                        this._element.onkeyup = null;
                        this._element.onkeypress = null;
                        this._element = null
                    }, ContentEditableTextBinding.prototype._onElementChanged = function() {
                        this.isDisposed || this._observableValue(this._element.innerText)
                    }, ContentEditableTextBinding.prototype._onValueChanged = function() {
                            this._element.innerText = this._observableValue()
                        }, ContentEditableTextBinding
            }(AppMagic.Utility.Disposable);
        AuthoringTool.ContentEditableTextBinding = ContentEditableTextBinding;
        ko.bindingHandlers.contentEditableText = {init: function(element, valueAccessor) {
                new ContentEditableTextBinding(element, valueAccessor())
            }}
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ContextMenuProvider = function() {
                function ContextMenuProvider() {
                    this._commandData = ko.observable(null);
                    this._menuElement = null;
                    this._onAfterHideFunction = null;
                    this._onAfterHideFunction = this._onAfterHide.bind(this)
                }
                return Object.defineProperty(ContextMenuProvider.prototype, "commandData", {
                        get: function() {
                            return this._commandData()
                        }, enumerable: !0, configurable: !0
                    }), ContextMenuProvider.prototype.setView = function(menuElement) {
                        Contracts.checkObject(menuElement);
                        Contracts.checkObject(menuElement.winControl);
                        Contracts.checkNull(this._menuElement);
                        this._menuElement = menuElement;
                        menuElement.winControl.addEventListener("afterhide", this._onAfterHideFunction)
                    }, ContextMenuProvider.prototype.clearView = function() {
                            Contracts.checkNonNull(this._menuElement);
                            this._menuElement.winControl.removeEventListener("afterhide", this._onAfterHideFunction);
                            this._menuElement = null
                        }, ContextMenuProvider.prototype.show = function(anchor, placement, alignment, commandData) {
                            Contracts.checkObject(anchor);
                            Contracts.checkNonNull(this._menuElement);
                            this._commandData(commandData);
                            this._menuElement.winControl.show(anchor, placement, alignment)
                        }, ContextMenuProvider.prototype._onAfterHide = function() {
                            this._commandData(null)
                        }, ContextMenuProvider
            }();
        AuthoringTool.ContextMenuProvider = ContextMenuProvider;
        var ContextMenuBinding = function(_super) {
                __extends(ContextMenuBinding, _super);
                function ContextMenuBinding(element) {
                    _super.call(this);
                    this._element = null;
                    this._value = null;
                    Contracts.checkObject(element);
                    this._element = element;
                    element.oncontextmenu = this._onContextMenu.bind(this);
                    ko.utils.domNodeDisposal.addDisposeCallback(element, this.dispose.bind(this))
                }
                return ContextMenuBinding.prototype.dispose = function() {
                        _super.prototype.dispose.call(this);
                        this._element.oncontextmenu = null;
                        this._element = null
                    }, ContextMenuBinding.prototype.update = function(value) {
                        this._value = value
                    }, ContextMenuBinding.prototype._onContextMenu = function(evt) {
                            this._value && !this._value.disabled && (this._value.provider.show(this._element, this._value.placement, this._value.alignment, this._value.commandData), evt.preventDefault())
                        }, ContextMenuBinding.domDataKey = "ContextMenuBinding", ContextMenuBinding
            }(AppMagic.Utility.Disposable);
        AuthoringTool.ContextMenuBinding = ContextMenuBinding;
        ko.bindingHandlers.contextmenu = {update: function(element, valueAccessor) {
                Contracts.checkObject(element);
                Contracts.checkFunction(valueAccessor);
                var binding = ko.utils.domData.get(element, ContextMenuBinding.domDataKey);
                binding || (binding = new ContextMenuBinding(element), ko.utils.domData.set(element, ContextMenuBinding.domDataKey, binding));
                var value = ko.utils.unwrapObservable(valueAccessor());
                binding.update(value)
            }};
        ko.bindingHandlers.contextmenuprovider = {init: function(element, valueAccessor) {
                Contracts.checkObject(element);
                Contracts.checkFunction(valueAccessor);
                var provider = ko.utils.unwrapObservable(valueAccessor());
                Contracts.checkObject(provider);
                provider.setView(element);
                ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                    provider.clearView()
                })
            }}
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Authoring;
    (function(Authoring) {
        var DefaultDataSourceProviderPreparer = function() {
                function DefaultDataSourceProviderPreparer(){}
                return DefaultDataSourceProviderPreparer.prototype.createProviderReadyState = function(unreadyState, detail) {
                        var passThroughResult = {
                                internalConfiguration: unreadyState, success: !0
                            };
                        return WinJS.Promise.wrap(passThroughResult)
                    }, DefaultDataSourceProviderPreparer
            }();
        Authoring.DefaultDataSourceProviderPreparer = DefaultDataSourceProviderPreparer
    })(Authoring = AppMagic.Authoring || (AppMagic.Authoring = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Authoring;
    (function(Authoring) {
        var LocalTableProvider = AppMagic.DataSources.LocalTableProvider,
            LocalTableProviderFactory = function() {
                function LocalTableProviderFactory(){}
                return LocalTableProviderFactory.prototype.createDataSourceProvider = function(configuration, dataSourceName, runtime) {
                        var doc = this._getDocument(),
                            dataSource = doc.getServiceDataSource(dataSourceName);
                        var readWriter = new Authoring.TableDataSourceReaderWriter(dataSource);
                        return new LocalTableProvider(runtime, readWriter)
                    }, LocalTableProviderFactory.prototype._getDocument = function() {
                        return AppMagic.context.document
                    }, LocalTableProviderFactory
            }();
        Authoring.LocalTableProviderFactory = LocalTableProviderFactory
    })(Authoring = AppMagic.Authoring || (AppMagic.Authoring = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ObjectViewer;
        (function(ObjectViewer) {
            (function(NumberedNameGeneratorOptions) {
                NumberedNameGeneratorOptions[NumberedNameGeneratorOptions.none = 0] = "none";
                NumberedNameGeneratorOptions[NumberedNameGeneratorOptions.includeBaseName = 1 << 1] = "includeBaseName"
            })(ObjectViewer.NumberedNameGeneratorOptions || (ObjectViewer.NumberedNameGeneratorOptions = {}));
            var NumberedNameGeneratorOptions = ObjectViewer.NumberedNameGeneratorOptions,
                NumberedNameGenerator = function() {
                    function NumberedNameGenerator(){}
                    return NumberedNameGenerator.create = function(baseName, options, isValid) {
                            if (Contracts.checkString(baseName), Contracts.checkNumber(options), Contracts.checkFunction(isValid), options & NumberedNameGeneratorOptions.includeBaseName && isValid(baseName))
                                return baseName;
                            var index = 1,
                                match = /^.*_(\d+)$/.exec(baseName);
                            match && (index = parseInt(match[1]), index <= NumberedNameGenerator.maximumSeed ? baseName = baseName.substr(0, baseName.length - match[1].length - 1) : index = 1);
                            var name = null;
                            do
                                name = Core.Utility.formatString(AppMagic.AuthoringStrings.NumberedNameGenerator_NameFormat, baseName, index),
                                index++;
                            while (!isValid(name));
                            return name
                        }, NumberedNameGenerator.maximumSeed = 1e3, NumberedNameGenerator
                }();
            ObjectViewer.NumberedNameGenerator = NumberedNameGenerator
        })(ObjectViewer = AuthoringTool.ObjectViewer || (AuthoringTool.ObjectViewer = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ViewModels;
        (function(ViewModels) {
            var Util = AppMagic.Utility,
                RuleCategoriesAndFilterBuilder = function() {
                    function RuleCategoriesAndFilterBuilder(entities, propertyRuleMap) {
                        this._ruleCategories = null;
                        this._ruleFilter = null;
                        Contracts.checkValue(entities);
                        Contracts.checkValue(propertyRuleMap);
                        this._initRuleCategoriesAndFilter(entities, propertyRuleMap)
                    }
                    return RuleCategoriesAndFilterBuilder.prototype._initRuleCategoriesAndFilter = function(entities, propertyRuleMap) {
                            var childEntitiesRuleProvider = new ViewModels.NullChildEntitiesRuleManager,
                                allRules = [];
                            this._ruleCategories = entities[0].ruleCategories.map(function(ruleCategory) {
                                var rulesGroupMap = {},
                                    rules = [];
                                return ruleCategory.rules.forEach(function(rule) {
                                        var multipleRule = propertyRuleMap[rule.propertyName];
                                        multipleRule && (ViewModels.RuleCategoryHelper.addRuleToGroup(rule.group, multipleRule, rulesGroupMap), rules.push(multipleRule), allRules.push(multipleRule))
                                    }), new ViewModels.RuleCategory("MultipleSelection", ruleCategory.categoryId, rules, ViewModels.RuleCategoryHelper.createGroups(rulesGroupMap), childEntitiesRuleProvider)
                            });
                            this._ruleFilter = new ViewModels.RuleFilter("MultipleSelection", allRules, childEntitiesRuleProvider)
                        }, Object.defineProperty(RuleCategoriesAndFilterBuilder.prototype, "ruleCategories", {
                            get: function() {
                                return this._ruleCategories
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(RuleCategoriesAndFilterBuilder.prototype, "ruleFilter", {
                                get: function() {
                                    return this._ruleFilter
                                }, enumerable: !0, configurable: !0
                            }), RuleCategoriesAndFilterBuilder
                }();
            ViewModels.RuleCategoriesAndFilterBuilder = RuleCategoriesAndFilterBuilder
        })(ViewModels = AuthoringTool.ViewModels || (AuthoringTool.ViewModels = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ViewModels;
        (function(ViewModels) {
            var PropertyRuleCategory = Microsoft.AppMagic.Authoring.PropertyRuleCategory,
                RulePanelsInfo = function(_super) {
                    __extends(RulePanelsInfo, _super);
                    function RulePanelsInfo(doc, selectionManager, ruleFactory) {
                        _super.call(this);
                        this._childEntitiesRuleProvider = null;
                        this._propertyRuleBinder = null;
                        this._propertyRuleMap = null;
                        this._ruleButtonManager = null;
                        this._ruleCategories = null;
                        this._ruleFilter = null;
                        this._entitySelection = null;
                        Contracts.checkValue(doc);
                        Contracts.checkValue(selectionManager);
                        Contracts.checkValue(ruleFactory);
                        this._propertyRuleBinder = new AppMagic.AuthoringTool.ViewModels.PropertyRuleBinder(doc, ruleFactory);
                        this._init(selectionManager.screen);
                        this.track("_entitySelection", ko.computed(function() {
                            return selectionManager.selection
                        }, this));
                        this.trackAnonymous(this._entitySelection.subscribe(function() {
                            this._handleSelectionChanged()
                        }, this))
                    }
                    return RulePanelsInfo.prototype._init = function(currentScreen) {
                            Contracts.checkValue(currentScreen);
                            this._propertyRuleMap = new ViewModels.PropertyRuleMap(currentScreen.propertyRuleMap, !1);
                            this._ruleButtonManager = currentScreen.ruleButtonManager;
                            this._ruleCategories = currentScreen.ruleCategories;
                            this._ruleFilter = currentScreen.ruleFilter;
                            this._childEntitiesRuleProvider = new ViewModels.NullChildEntitiesRuleManager
                        }, RulePanelsInfo.prototype._handleSelectionChanged = function() {
                            var selection = this._entitySelection(),
                                oldPropertyRuleMap = this._propertyRuleMap;
                            if (this._propertyRuleMap = this._propertyRuleBinder.createMap(selection), oldPropertyRuleMap.dispose(), selection.length === 1) {
                                var entity = selection[0];
                                this._ruleButtonManager = entity.ruleButtonManager;
                                this._ruleCategories = entity.ruleCategories;
                                this._ruleFilter = entity.ruleFilter
                            }
                            else
                                this._ruleButtonManager = new AppMagic.AuthoringTool.ViewModels.RuleButtonManager(this._propertyRuleMap.map),
                                this._initializeDesignTabs(selection),
                                this._initRuleCategoriesAndFilter(selection, this._propertyRuleMap.map);
                            this.dispatchEvent("rulepanelsinfochanged")
                        }, RulePanelsInfo.prototype._initializeDesignTabs = function(entities) {
                                var firstEntity = entities[0];
                                for (var propertyName in this._propertyRuleMap.map)
                                    if (this._propertyRuleMap.map[propertyName].rhs) {
                                        var value = firstEntity.ruleButtonManager.getDesignTabValue(propertyName);
                                        this._ruleButtonManager.notifyPropertyChanged(propertyName, value)
                                    }
                            }, RulePanelsInfo.prototype._initRuleCategoriesAndFilter = function(entities, propertyRuleMap) {
                                var ruleCategoriesAndFilterBuilder = new ViewModels.RuleCategoriesAndFilterBuilder(entities, propertyRuleMap);
                                this._ruleCategories = ruleCategoriesAndFilterBuilder.ruleCategories;
                                this._ruleFilter = ruleCategoriesAndFilterBuilder.ruleFilter
                            }, Object.defineProperty(RulePanelsInfo.prototype, "ruleCategories", {
                                get: function() {
                                    return this._entitySelection(), this._ruleCategories
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(RulePanelsInfo.prototype, "ruleFilter", {
                                get: function() {
                                    return this._entitySelection(), this._ruleFilter
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(RulePanelsInfo.prototype, "propertyRuleMap", {
                                get: function() {
                                    return this._propertyRuleMap.map
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(RulePanelsInfo.prototype, "ruleButtonManager", {
                                get: function() {
                                    return this._ruleButtonManager
                                }, enumerable: !0, configurable: !0
                            }), RulePanelsInfo
                }(AppMagic.Utility.Disposable);
            ViewModels.RulePanelsInfo = RulePanelsInfo;
            WinJS.Class.mix(RulePanelsInfo, WinJS.Utilities.eventMixin)
        })(ViewModels = AuthoringTool.ViewModels || (AuthoringTool.ViewModels = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ViewModels;
        (function(ViewModels) {
            var PropertyRuleBinder = function() {
                    function PropertyRuleBinder(doc, ruleFactory) {
                        this._document = null;
                        this._ruleFactory = null;
                        Contracts.checkValue(doc);
                        Contracts.checkValue(ruleFactory);
                        this._document = doc;
                        this._ruleFactory = ruleFactory
                    }
                    return PropertyRuleBinder.prototype.createMap = function(entities) {
                            var firstEntity = entities[0];
                            if (entities.length === 1)
                                return new PropertyRuleMap(firstEntity.propertyRuleMap, !1);
                            var propertyRuleMap = {};
                            for (var propertyName in firstEntity.propertyRuleMap) {
                                var multipleRule = this._tryCreateMultipleRule(propertyName, entities);
                                multipleRule && (propertyRuleMap[propertyName] = multipleRule)
                            }
                            return new PropertyRuleMap(propertyRuleMap, !0)
                        }, PropertyRuleBinder.prototype._tryCreateMultipleRule = function(propertyName, entities) {
                            var sharedRules = [],
                                firstVisual = entities[0],
                                firstRule = firstVisual.propertyRuleMap[propertyName],
                                firstProperty = firstRule.property;
                            sharedRules.push(firstRule);
                            for (var i = 1, len = entities.length; i < len; i++) {
                                var map = entities[i].propertyRuleMap;
                                if (typeof map[propertyName] == "undefined")
                                    return null;
                                sharedRules.push(map[propertyName])
                            }
                            return this._createMultipleRule(firstVisual, firstProperty, sharedRules)
                        }, PropertyRuleBinder.prototype._createMultipleRule = function(firstVisual, property, sharedRules) {
                                var propertyDisplayInfo = new AppMagic.AuthoringTool.ViewModels.PropertyDisplayInfo(property);
                                return this._ruleFactory.createMultiple(this._document, firstVisual._control, propertyDisplayInfo, sharedRules)
                            }, PropertyRuleBinder
                }();
            ViewModels.PropertyRuleBinder = PropertyRuleBinder;
            var PropertyRuleMap = function() {
                    function PropertyRuleMap(map, disposable) {
                        this.map = null;
                        this.map = map;
                        disposable || (this.dispose = this._nullDispose)
                    }
                    return PropertyRuleMap.prototype.dispose = function() {
                            for (var property in this.map)
                                this.map[property].dispose()
                        }, PropertyRuleMap.prototype._nullDispose = function(){}, PropertyRuleMap
                }();
            ViewModels.PropertyRuleMap = PropertyRuleMap
        })(ViewModels = AuthoringTool.ViewModels || (AuthoringTool.ViewModels = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ViewModels;
        (function(ViewModels) {
            var PropertyRuleCategory = Microsoft.AppMagic.Authoring.PropertyRuleCategory,
                Util = AppMagic.Utility,
                EntityViewModel = function(_super) {
                    __extends(EntityViewModel, _super);
                    function EntityViewModel(doc, entityManager, control, controlManager, ruleFactory, zoom) {
                        _super.call(this);
                        this._childEntities = ko.observableArray([]);
                        this._childEntitiesRuleManager = null;
                        this._descendantCanvasSelected = ko.observableArray([]);
                        this._directChildCanvasSelected = ko.observableArray([]);
                        this._descendantOutlineIncompatible = null;
                        this._descendantSelected = ko.observable(!1);
                        this._errorTracker = null;
                        this._errorCss = ko.observable(null);
                        this._hasErrors = null;
                        this._autoBindOnRuleChangeDisabled = !1;
                        this._name = null;
                        this._primaryDataRuleInputPropertyName = "";
                        this._properties = null;
                        this._shouldInitializeChildEntities = !0;
                        this._updatingRules = 0;
                        this._control = null;
                        this._controlManager = null;
                        this._document = null;
                        this._entityManager = null;
                        this._eventTracker = null;
                        this._propertyRuleMap = null;
                        this._ruleCategories = null;
                        this._ruleButtonManager = null;
                        this._ruleFilter = null;
                        this._ruleFactory = null;
                        this._zoom = null;
                        this._document = doc;
                        this._entityManager = entityManager;
                        this._control = control;
                        this._controlManager = controlManager;
                        this._ruleFactory = ruleFactory;
                        this._zoom = zoom;
                        this.track("_childEntitiesRuleManager", new ViewModels.ChildEntitiesRuleManager(this));
                        this._name = ko.observable(control.name);
                        this.track("_eventTracker", new Util.EventTracker);
                        this._initialize();
                        this.track("_hasErrors", ko.computed(function() {
                            return this.errorTracker.hasErrors
                        }, this));
                        this.trackAnonymous(this._hasErrors.subscribe(function() {
                            this.errorTracker.hasErrors && this._updateErrorCss()
                        }, this));
                        this._descendantOutlineIncompatible = ko.observable(this._calculateDescendantOutlineIncompatible());
                        this._updateErrorCss()
                    }
                    return EntityViewModel.prototype._initialize = function() {
                            this._initializeProperties();
                            this._initializeRules()
                        }, EntityViewModel.prototype._initializeProperties = function() {
                            this._properties = [];
                            this._properties = this._control.template.inputProperties;
                            this._properties.sort(function(a, b) {
                                return a.propertyName.localeCompare(b.propertyName)
                            })
                        }, EntityViewModel.prototype._initializeRules = function() {
                                this._propertyRuleMap = {};
                                var rules = [];
                                this._ruleCategories = [];
                                for (var behaviorRules = [], dataRules = [], designRules = [], behaviorGroupRulesMap = {}, dataGroupRulesMap = {}, designGroupRulesMap = {}, i = 0, len = this._properties.length; i < len; i++) {
                                    var property = this._properties[i],
                                        category = property.propertyCategory,
                                        propertyName = property.propertyName,
                                        group = property.commandBar.group,
                                        propertyGroup = group ? group : Microsoft.AppMagic.Authoring.PropertyGroup.none,
                                        result = this._control.tryGetRule(propertyName),
                                        rule = result.value ? result.rule : null,
                                        ruleVm = this._ruleFactory.create(this._document, this._control, property, rule);
                                    if (rules.push(ruleVm), this._propertyRuleMap[propertyName] = ruleVm, !property.hidden)
                                        switch (category) {
                                            case PropertyRuleCategory.behavior:
                                                ViewModels.RuleCategoryHelper.addRuleToGroup(propertyGroup, ruleVm, behaviorGroupRulesMap);
                                                behaviorRules.push(ruleVm);
                                                break;
                                            case PropertyRuleCategory.data:
                                                ViewModels.RuleCategoryHelper.addRuleToGroup(propertyGroup, ruleVm, dataGroupRulesMap);
                                                dataRules.push(ruleVm);
                                                property.isPrimaryInputProperty && (this._primaryDataRuleInputPropertyName, this._primaryDataRuleInputPropertyName = property.propertyName);
                                                break;
                                            case PropertyRuleCategory.design:
                                                propertyGroup === Microsoft.AppMagic.Authoring.PropertyGroup.none && (propertyGroup = Microsoft.AppMagic.Authoring.PropertyGroup.options);
                                                ViewModels.RuleCategoryHelper.addRuleToGroup(propertyGroup, ruleVm, designGroupRulesMap);
                                                designRules.push(ruleVm);
                                                break;
                                            default:
                                                break
                                        }
                                    this._eventTracker.add(ruleVm, "valueTypeChanged", this._autoBindOnRuleChange, this)
                                }
                                var behaviorGroups = ViewModels.RuleCategoryHelper.createGroups(behaviorGroupRulesMap),
                                    dataGroups = ViewModels.RuleCategoryHelper.createGroups(dataGroupRulesMap),
                                    designGroups = ViewModels.RuleCategoryHelper.createGroups(designGroupRulesMap);
                                this.track("_ruleFilter", new ViewModels.RuleFilter(this._control.template.className, rules, this._childEntitiesRuleManager));
                                this._ruleCategories[PropertyRuleCategory.behavior] = new ViewModels.RuleCategory(this._control.template.className, PropertyRuleCategory.behavior, behaviorRules, behaviorGroups, this._childEntitiesRuleManager);
                                this._ruleCategories[PropertyRuleCategory.data] = new ViewModels.RuleCategory(this._control.template.className, PropertyRuleCategory.data, dataRules, dataGroups, this._childEntitiesRuleManager);
                                this._ruleCategories[PropertyRuleCategory.design] = new ViewModels.RuleCategory(this._control.template.className, PropertyRuleCategory.design, designRules, designGroups, this._childEntitiesRuleManager);
                                this.trackAnonymous(this._ruleCategories[PropertyRuleCategory.behavior]);
                                this.trackAnonymous(this._ruleCategories[PropertyRuleCategory.data]);
                                this.trackAnonymous(this._ruleCategories[PropertyRuleCategory.design])
                            }, Object.defineProperty(EntityViewModel.prototype, "errorTracker", {
                                get: function() {
                                    return this._errorTracker || this.track("_errorTracker", new ViewModels.EntityErrorTracker(this._propertyRuleMap, this.ruleCategories)), this._errorTracker
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(EntityViewModel.prototype, "groupBorderVisible", {
                                get: function() {
                                    return !1
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(EntityViewModel.prototype, "errorCss", {
                                get: function() {
                                    return this._errorCss()
                                }, enumerable: !0, configurable: !0
                            }), EntityViewModel.prototype.notifyCreationComplete = function(){}, EntityViewModel.prototype.notifyPropertyChanged = function(propertyName, newValue) {
                                this.ruleButtonManager.notifyPropertyChanged(propertyName, newValue)
                            }, EntityViewModel.prototype.getChildRules = function(categoryId) {
                                return []
                            }, EntityViewModel.prototype.autoBindChild = function(childEntity) {
                                if (childEntity._control.isReplicable)
                                    for (var propertyName in this._propertyRuleMap) {
                                        var rule = this._propertyRuleMap[propertyName];
                                        if (rule.category === PropertyRuleCategory.data) {
                                            var binder = new AppMagic.AuthoringTool.ViewModels.DataPropertyBinder(this._entityManager, this, rule.propertyName, this._getSuggestedBinding.bind(this));
                                            binder.autoBindChild(childEntity)
                                        }
                                    }
                            }, Object.defineProperty(EntityViewModel.prototype, "childEntities", {
                                get: function() {
                                    return this._tryInitializeChildEntities(), this._childEntities
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(EntityViewModel.prototype, "primaryDataPropertyName", {
                                get: function() {
                                    return this._primaryDataRuleInputPropertyName
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(EntityViewModel.prototype, "autoBindOnRuleChangeDisabled", {
                                get: function() {
                                    return this._autoBindOnRuleChangeDisabled
                                }, set: function(value) {
                                        this._autoBindOnRuleChangeDisabled = value
                                    }, enumerable: !0, configurable: !0
                            }), EntityViewModel.prototype._autoBindOnRuleChange = function(evt) {
                                var rule = evt.target;
                                if (!this._autoBindOnRuleChangeDisabled && rule.property.isAggregate && !rule.hasErrors && this._updatingRules === 0) {
                                    var binder = new AppMagic.AuthoringTool.ViewModels.DataPropertyBinder(this._entityManager, this, rule.propertyName, this._getSuggestedBinding.bind(this));
                                    binder.autoBind()
                                }
                            }, EntityViewModel.prototype._getSuggestedBinding = function(desiredType, expression) {
                                return Microsoft.AppMagic.BindingHelper.tryGetSuggestedBinding(this._document, desiredType, expression)
                            }, EntityViewModel.prototype._tryInitializeChildEntities = function() {
                                return this._shouldInitializeChildEntities ? (this._initializeChildEntities(), this._shouldInitializeChildEntities = !1, !0) : !1
                            }, EntityViewModel.prototype._initializeChildEntities = function() {
                                this._childEntities.removeAll();
                                for (var childIt = this._control.children.first(); childIt.hasCurrent; childIt.moveNext()) {
                                    var childEntity = this._entityManager.getEntityByName(childIt.current.name);
                                    this._childEntities.push(childEntity)
                                }
                                this._updateDescendantOutlineIncompatible()
                            }, EntityViewModel.prototype.setDirectChildCanvasSelected = function(canvasId, selected) {
                                var index = this._directChildCanvasSelected.indexOf(canvasId);
                                selected ? index < 0 && this._directChildCanvasSelected.push(canvasId) : index >= 0 && this._directChildCanvasSelected.splice(index, 1)
                            }, EntityViewModel.prototype.setDescendantCanvasSelected = function(canvasId, selected) {
                                var index = this._descendantCanvasSelected.indexOf(canvasId);
                                selected ? index < 0 && this._descendantCanvasSelected.push(canvasId) : index >= 0 && this._descendantCanvasSelected.splice(index, 1)
                            }, Object.defineProperty(EntityViewModel.prototype, "descendantSelected", {
                                get: function() {
                                    return this._descendantSelected()
                                }, set: function(value) {
                                        this._descendantSelected(value)
                                    }, enumerable: !0, configurable: !0
                            }), EntityViewModel.prototype._getControlPropertyByInvariantName = function(propertyInvariantName) {
                                var result = this._control.template.tryGetPropertyInvariant(propertyInvariantName);
                                return result.property
                            }, EntityViewModel.prototype._tryGetControlPropertyByInvariantName = function(propertyInvariantName) {
                                var result = this._control.template.tryGetPropertyInvariant(propertyInvariantName);
                                return result === null ? null : result.property
                            }, EntityViewModel.prototype.getRuleByPropertyInvariantName = function(propertyInvariantName) {
                                var property = this._getControlPropertyByInvariantName(propertyInvariantName);
                                return this.getRuleByPropertyName(property.propertyName)
                            }, EntityViewModel.prototype.tryGetRuleByPropertyInvariantName = function(propertyInvariantName) {
                                var property = this._tryGetControlPropertyByInvariantName(propertyInvariantName);
                                return property === null ? null : this.tryGetRuleByPropertyName(property.propertyName)
                            }, EntityViewModel.prototype.getRuleByPropertyName = function(propertyName) {
                                var ruleVm = this._propertyRuleMap[propertyName];
                                return ruleVm
                            }, EntityViewModel.prototype.tryGetRuleByPropertyName = function(propertyName) {
                                var ruleVm = this._propertyRuleMap[propertyName];
                                return typeof ruleVm == "undefined" ? null : ruleVm
                            }, EntityViewModel.prototype.getLocalizedPropertyNameForInvariantPropertyName = function(invariantName) {
                                var property = this._getControlPropertyByInvariantName(invariantName);
                                return property.propertyName
                            }, Object.defineProperty(EntityViewModel.prototype, "descendantHasErrors", {
                                get: function() {
                                    if (this.errorTracker.hasErrors)
                                        return !0;
                                    for (var i = 0, len = this._childEntities().length; i < len; i++) {
                                        var entity = this._childEntities()[i];
                                        if (entity.descendantHasErrors)
                                            return !0
                                    }
                                    return !1
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(EntityViewModel.prototype, "descendantOutlineIncompatible", {
                                get: function() {
                                    return this._descendantOutlineIncompatible()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(EntityViewModel.prototype, "hasErrors", {
                                get: function() {
                                    return this.errorTracker.hasErrors
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(EntityViewModel.prototype, "hasBehaviorErrors", {
                                get: function() {
                                    return this.errorTracker.hasBehaviorErrors
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(EntityViewModel.prototype, "hasDataErrors", {
                                get: function() {
                                    return this.errorTracker.hasDataErrors
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(EntityViewModel.prototype, "hasDesignErrors", {
                                get: function() {
                                    return this.errorTracker.hasDesignErrors
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(EntityViewModel.prototype, "hasMoreBehaviorErrors", {
                                get: function() {
                                    return this.errorTracker.hasMoreBehaviorErrors
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(EntityViewModel.prototype, "hasMoreDataErrors", {
                                get: function() {
                                    return this.errorTracker.hasMoreDataErrors
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(EntityViewModel.prototype, "hasMoreDesignErrors", {
                                get: function() {
                                    return this.errorTracker.hasMoreDesignErrors
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(EntityViewModel.prototype, "errorMessage", {
                                get: function() {
                                    return this._errorTracker.errorRule ? this.errorTracker.errorRule.errorMessage : ""
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(EntityViewModel.prototype, "name", {
                                get: function() {
                                    return this._name()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(EntityViewModel.prototype, "descendantCanvasSelected", {
                                get: function() {
                                    return this._descendantCanvasSelected()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(EntityViewModel.prototype, "directChildCanvasSelected", {
                                get: function() {
                                    return this._directChildCanvasSelected()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(EntityViewModel.prototype, "ruleButtonManager", {
                                get: function() {
                                    return this._ruleButtonManager || this.track("_ruleButtonManager", new AppMagic.AuthoringTool.ViewModels.RuleButtonManager(this._propertyRuleMap)), this._ruleButtonManager
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(EntityViewModel.prototype, "ruleCategories", {
                                get: function() {
                                    return this._ruleCategories
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(EntityViewModel.prototype, "ruleFilter", {
                                get: function() {
                                    return this._ruleFilter
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(EntityViewModel.prototype, "propertyRuleMap", {
                                get: function() {
                                    return this._propertyRuleMap
                                }, enumerable: !0, configurable: !0
                            }), EntityViewModel.prototype.setRule = function(propertyName, rhs, autoBind) {
                                var ruleVm = this.getRuleByPropertyName(propertyName);
                                return (!autoBind || ruleVm.autoBindEnabled) && (ruleVm.rhs = rhs), ruleVm
                            }, EntityViewModel.prototype.setRuleInvariant = function(propertyInvariantName, rhs, nameMap) {
                                var ruleVm = this.getRuleByPropertyInvariantName(propertyInvariantName);
                                return ruleVm.setRhsAndNameMap(rhs, nameMap), ruleVm
                            }, Object.defineProperty(EntityViewModel.prototype, "positionable", {
                                get: function() {
                                    return this._control.template.positionable
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(EntityViewModel.prototype, "templateName", {
                                get: function() {
                                    return this._control.template.name
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(EntityViewModel.prototype, "templateClassName", {
                                get: function() {
                                    return this._control.template.className
                                }, enumerable: !0, configurable: !0
                            }), EntityViewModel.prototype.updateOnRename = function() {
                                var oldName = this._name(),
                                    newName = this._control.name;
                                this._controlManager.updateName(oldName, newName)
                            }, EntityViewModel.prototype.updateViewOnRename = function() {
                                this._name(this._control.name)
                            }, EntityViewModel.prototype.updateRules = function() {
                                this._updatingRules++;
                                try {
                                    for (var propertyName in this._propertyRuleMap) {
                                        var ruleVm = this._propertyRuleMap[propertyName];
                                        ruleVm.refreshRuleFromDocument()
                                    }
                                }
                                finally {
                                    this._updatingRules--
                                }
                            }, EntityViewModel.prototype.addToChildEntities = function(entity) {
                                this._tryInitializeChildEntities();
                                var index = this._childEntities().indexOf(entity);
                                index < 0 && (this._childEntities.push(entity), this._updateDescendantOutlineIncompatible())
                            }, EntityViewModel.prototype._addVisualToModel = function(visual, control) {
                                this.addToChildEntities(visual);
                                this._control.addChildControl(control);
                                this._entityManager.notifyVisualChanged(visual)
                            }, EntityViewModel.prototype.removeFromChildEntities = function(entity) {
                                if (!this._tryInitializeChildEntities()) {
                                    var index = this._childEntities().indexOf(entity);
                                    this._childEntities.splice(index, 1);
                                    this._updateDescendantOutlineIncompatible()
                                }
                            }, EntityViewModel.prototype._removeVisualFromModel = function(visual, control) {
                                this.removeFromChildEntities(visual);
                                this._control.removeChildControl(control);
                                this._entityManager.notifyVisualChanged(visual)
                            }, EntityViewModel.prototype._calculateDescendantOutlineIncompatible = function() {
                                return this._childEntities().some(function(entity) {
                                        return entity.descendantOutlineIncompatible
                                    })
                            }, EntityViewModel.prototype._updateErrorCss = function() {
                                var adornerScale = this._zoom.adornerScale;
                                this._errorCss({
                                    offset: AppMagic.AuthoringTool.Constants.CanvasErrorIconOffset * adornerScale, size: AppMagic.AuthoringTool.Constants.CanvasErrorIconSize * adornerScale
                                })
                            }, EntityViewModel.prototype._updateDescendantOutlineIncompatible = function() {
                                var result = this._calculateDescendantOutlineIncompatible();
                                this._descendantOutlineIncompatible(result)
                            }, EntityViewModel.prototype.reportRuntimeError = function(propertyName, errorMessage, id, nodeId) {
                                var ruleVM = this.tryGetRuleByPropertyInvariantName(propertyName);
                                ruleVM !== null && ruleVM.showRuntimeError(errorMessage, id, nodeId)
                            }, EntityViewModel.prototype.resetRuntimeError = function(propertyName, id) {
                                var ruleVM = this.tryGetRuleByPropertyInvariantName(propertyName);
                                ruleVM !== null && ruleVM.resetRuntimeError(id)
                            }, EntityViewModel
                }(AppMagic.Utility.Disposable);
            ViewModels.EntityViewModel = EntityViewModel
        })(ViewModels = AuthoringTool.ViewModels || (AuthoringTool.ViewModels = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ViewModels;
        (function(ViewModels) {
            var PropertyRuleCategory = Microsoft.AppMagic.Authoring.PropertyRuleCategory;
            ViewModels.NestedPropertyDisplayMode = {
                nestedCanvasOnly: "nestedCanvasOnly", nestedCanvasAndOwner: "nestedCanvasAndOwner", verify: function(value) {
                        Contracts.check(value === ViewModels.NestedPropertyDisplayMode.nestedCanvasOnly || value === ViewModels.NestedPropertyDisplayMode.nestedCanvasAndOwner)
                    }
            };
            var NestedProperties = [{
                        prefix: "Template", displayMode: ViewModels.NestedPropertyDisplayMode.nestedCanvasAndOwner
                    }, ],
                VisualViewModel = function(_super) {
                    __extends(VisualViewModel, _super);
                    function VisualViewModel(doc, entityManager, control, controlManager, ruleFactory, zoom) {
                        _super.call(this, doc, entityManager, control, controlManager, ruleFactory, zoom);
                        this._nestedOriginX = null;
                        this._nestedOriginY = null;
                        this._nestedWidth = null;
                        this._nestedHeight = null;
                        this._resizeNestedCanvas = null;
                        this._parentCanvas = null;
                        this._adornerCss = null;
                        this._bounds = null;
                        this._canvasId = null;
                        this._computedCanvasAdornersHidden = null;
                        this._computedPosition = null;
                        this._computedSize = null;
                        this._controlElement = null;
                        this._visualElement = null;
                        this._cssZindex = null;
                        this._group = null;
                        this._isComplete = null;
                        this._isErrorWithinParentContainer = null;
                        this._selected = null;
                        this._visible = null;
                        this._visualVisible = null;
                        this._zindex = null;
                        Contracts.checkValue(doc);
                        Contracts.checkValue(entityManager);
                        Contracts.checkValue(control);
                        Contracts.checkValue(controlManager);
                        Contracts.checkValue(ruleFactory);
                        Contracts.checkValue(zoom);
                        this._isComplete = ko.observable(!1);
                        var boundRules = {
                                x: this.getRuleByPropertyInvariantName("X"), y: this.getRuleByPropertyInvariantName("Y"), height: this.getRuleByPropertyInvariantName("Height"), width: this.getRuleByPropertyInvariantName("Width")
                            };
                        this._visualVisible = ko.observable(!0);
                        this._isErrorWithinParentContainer = ko.observable(!0);
                        this.track("_bounds", new AppMagic.AuthoringTool.ViewModels.PixelBoundsViewModel(control, boundRules));
                        this._controlElement = ko.observable(null);
                        this._visualElement = ko.observable(null);
                        this._selected = ko.observable(!1);
                        this._canvasId = ko.observable(control.index);
                        this._zindex = ko.observable(0);
                        this.track("_cssZindex", ko.computed(function() {
                            return VisualViewModel.maximumZindex - this._zindex() - 1
                        }, this));
                        this._nestedOriginX = ko.observable(0);
                        this._nestedOriginY = ko.observable(0);
                        this._nestedWidth = ko.observable(0);
                        this._nestedHeight = ko.observable(0);
                        this._parentCanvas = ko.observable(null);
                        this._adornerCss = ko.observable(null);
                        this._updateAdornerCss();
                        this._eventTracker.add(zoom, "afterZoomChange", this._onZoomChange.bind(this));
                        this.trackAnonymous(this._selected.subscribe(function() {
                            var openAjaxControl = OpenAjax.widget.byId(this.name);
                            openAjaxControl && openAjaxControl.OpenAjax.requestModeChange(this._selected() ? "edit" : "view");
                            this._selected() && this._updateAdornerCss()
                        }, this));
                        this.track("_visible", ko.computed(function() {
                            return this._isComplete() && (this._visualVisible() || this._selected() || AppMagic.context.documentViewModel.canvasManager.visualLabelsVisible)
                        }.bind(this)))
                    }
                    return VisualViewModel.prototype.addUpdater = function(updater) {
                            Contracts.checkObject(updater);
                            this.trackAnonymous(updater)
                        }, VisualViewModel.prototype.updateBeforeCreation = function(){}, VisualViewModel.prototype.updateAfterCreation = function() {
                                this.updateRules();
                                this.setContainerSize(this._parentCanvas().width, this._parentCanvas().height, !0);
                                this.setBoundRules(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
                                this.parent && this.parent.autoBindChild(this)
                            }, VisualViewModel.prototype.setBoundRules = function(x, y, width, height) {
                                var localize = Microsoft.AppMagic.Common.LocalizationHelper.convertToLocaleSpecific;
                                this.setRuleInvariant(AppMagic.AuthoringTool.OpenAjaxPropertyNames.X, localize(x.toString(), null));
                                this.setRuleInvariant(AppMagic.AuthoringTool.OpenAjaxPropertyNames.Y, localize(y.toString(), null));
                                this.setRuleInvariant(AppMagic.AuthoringTool.OpenAjaxPropertyNames.Width, localize(width.toString(), null));
                                this.setRuleInvariant(AppMagic.AuthoringTool.OpenAjaxPropertyNames.Height, localize(height.toString(), null))
                            }, Object.defineProperty(VisualViewModel.prototype, "adornerCss", {
                                get: function() {
                                    return this._adornerCss()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(VisualViewModel.prototype, "nestedX", {
                                get: function() {
                                    return this._nestedOriginX()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(VisualViewModel.prototype, "nestedY", {
                                get: function() {
                                    return this._nestedOriginY()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(VisualViewModel.prototype, "nestedWidth", {
                                get: function() {
                                    return this._nestedWidth()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(VisualViewModel.prototype, "nestedHeight", {
                                get: function() {
                                    return this._nestedHeight()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(VisualViewModel.prototype, "x", {
                                get: function() {
                                    var x = this._bounds.x;
                                    return this.parent instanceof VisualViewModel && (x += this.parent.x + this.parent._nestedOriginX()), x
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(VisualViewModel.prototype, "y", {
                                get: function() {
                                    var y = this._bounds.y;
                                    return this.parent instanceof VisualViewModel && (y += this.parent.y + this.parent._nestedOriginY()), y
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(VisualViewModel.prototype, "isErrorWithinParentContainer", {
                                get: function() {
                                    return this._isErrorWithinParentContainer()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(VisualViewModel.prototype, "bounds", {
                                get: function() {
                                    return Core.Utility.isNullOrUndefined(this.screen) || (this._bounds.gridVisual.screen = this.screen.name), this._bounds
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(VisualViewModel.prototype, "cssBounds", {
                                get: function() {
                                    return this._bounds.css
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(VisualViewModel.prototype, "cssZindex", {
                                get: function() {
                                    return this._cssZindex()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(VisualViewModel.prototype, "depth", {
                                get: function() {
                                    for (var i = 0, control = this._control; control.parent !== null; i++)
                                        control = control.parent;
                                    return i
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(VisualViewModel.prototype, "group", {
                                get: function() {
                                    return this._group
                                }, set: function(group) {
                                        Contracts.checkDefined(group);
                                        this._group = group
                                    }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(VisualViewModel.prototype, "groupedVisuals", {
                                get: function() {
                                    return []
                                }, set: function(visuals) {
                                        Contracts.check(!1, "non-group visuals don't have any visuals inside them")
                                    }, enumerable: !0, configurable: !0
                            }), VisualViewModel.prototype.alignGroupedVisuals = function(visualPositionMap, propertyName){}, VisualViewModel.prototype.initGroup = function(){}, VisualViewModel.prototype.setGroupedVisualsBounds = function(visualBoundsMap, scaleX, scaleY){}, VisualViewModel.prototype.ungroup = function(){}, Object.defineProperty(VisualViewModel.prototype, "outlineIncompatible", {
                                get: function() {
                                    return this._control.template.outlineIncompatible && this._control.isReplicable
                                }, enumerable: !0, configurable: !0
                            }), VisualViewModel.prototype.remove = function() {
                                Microsoft.AppMagic.Common.TelemetrySession.telemetry.logDeleteControl(this._control.template.className, this._control.variantName);
                                this._document.removeControl(this._control)
                            }, VisualViewModel.prototype._removeGroupedVisuals = function() {
                                this.groupedVisuals.forEach(function(groupedVisual) {
                                    groupedVisual.group = null;
                                    groupedVisual.remove()
                                })
                            }, Object.defineProperty(VisualViewModel.prototype, "visible", {
                                get: function() {
                                    return this._visible()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(VisualViewModel.prototype, "visualVisible", {
                                get: function() {
                                    return this._visualVisible()
                                }, enumerable: !0, configurable: !0
                            }), VisualViewModel.prototype.create = function(canvasManager, isCopyUndoInProgress) {
                                var _this = this;
                                if (isCopyUndoInProgress = isCopyUndoInProgress || !1, !this._controlElement()) {
                                    var container = document.createElement("div");
                                    container.className = "content";
                                    this.controlElement = container;
                                    var childCreate = function() {
                                            for (var childVisuals = [], it = _this._control.children.first(); it.hasCurrent; it.moveNext()) {
                                                var child = it.current;
                                                Contracts.checkValue(child);
                                                var childEntity = _this._entityManager.tryGetVisualByName(child.name);
                                                childEntity ? childVisuals.push(childEntity.create(canvasManager)) : (childEntity = _this._entityManager.tryGetDataControlByName(child.name), childEntity.create(canvasManager))
                                            }
                                            return WinJS.Promise.join(childVisuals)
                                        };
                                    return this._controlManager.create(container, this._control).then(childCreate).then(function() {
                                            isCopyUndoInProgress || this._setInitialBounds();
                                            this._parentCanvas(canvasManager.getParentCanvasForVisual(this))
                                        }.bind(this))
                                }
                            }, VisualViewModel.prototype.initNestedCanvas = function(x, y, width, height, resizeCanvas) {
                                var _this = this;
                                this._nestedOriginX(x());
                                this._nestedOriginY(y());
                                this._nestedWidth(width());
                                this._nestedHeight(height());
                                x.subscribe(function(value) {
                                    return _this._nestedOriginX(value)
                                });
                                y.subscribe(function(value) {
                                    return _this._nestedOriginY(value)
                                });
                                width.subscribe(function(value) {
                                    return _this._nestedWidth(value)
                                });
                                height.subscribe(function(value) {
                                    return _this._nestedHeight(value)
                                });
                                this._resizeNestedCanvas = resizeCanvas
                            }, VisualViewModel.prototype.resizeNestedCanvas = function(cornerPoint, newX, newY) {
                                if (Contracts.check(cornerPoint === "n" || cornerPoint === "ne" || cornerPoint === "e" || cornerPoint === "se" || cornerPoint === "s" || cornerPoint === "sw" || cornerPoint === "w" || cornerPoint === "nw"), Contracts.checkNumber(newX), Contracts.checkNumber(newY), typeof this._resizeNestedCanvas == "function") {
                                    this.bounds.containerSize && (newX = Core.Utility.clamp(newX, 0, this.bounds.containerSize.width), newY = Core.Utility.clamp(newY, 0, this.bounds.containerSize.height));
                                    var x = this.nestedCanvasX,
                                        y = this.nestedCanvasY,
                                        right = x + this._nestedWidth(),
                                        bottom = y + this._nestedHeight();
                                    cornerPoint.indexOf("n") >= 0 ? y = Math.min(newY, bottom) : cornerPoint.indexOf("s") >= 0 && (bottom = Math.max(newY, y));
                                    cornerPoint.indexOf("w") >= 0 ? x = Math.min(newX, right) : cornerPoint.indexOf("e") >= 0 && (right = Math.max(newX, x));
                                    var width = right - x,
                                        height = bottom - y;
                                    this._resizeNestedCanvas(x, y, width, height)
                                }
                            }, VisualViewModel.prototype.clampNestedCanvasToVisualBounds = function() {
                                typeof this._resizeNestedCanvas == "function" && this._resizeNestedCanvas(this.nestedCanvasX, this.nestedCanvasY, this._nestedWidth(), this._nestedHeight())
                            }, VisualViewModel.prototype.getChildRules = function(categoryId) {
                                return Contracts.checkValue(categoryId), categoryId === PropertyRuleCategory.data ? this.ruleCategories[categoryId].rules : []
                            }, Object.defineProperty(VisualViewModel.prototype, "nestedCanvasX", {
                                get: function() {
                                    return this._bounds.left + this._nestedOriginX()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(VisualViewModel.prototype, "nestedCanvasY", {
                                get: function() {
                                    return this._bounds.top + this._nestedOriginY()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(VisualViewModel.prototype, "nestedCanvasWidth", {
                                get: function() {
                                    return this._nestedWidth()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(VisualViewModel.prototype, "nestedCanvasHeight", {
                                get: function() {
                                    return this._nestedHeight()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(VisualViewModel.prototype, "supportsNestedControls", {
                                get: function() {
                                    return this._control.template.supportsNestedControls
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(VisualViewModel.prototype, "nestedCanvas", {
                                get: function() {
                                    return AppMagic.context.documentViewModel.canvasManager.tryGetNestedCanvasForVisual(this, this._canvasId())
                                }, enumerable: !0, configurable: !0
                            }), VisualViewModel.prototype.lazyCanvasBind = function(fnName) {
                                for (var _this = this, argArray = [], _i = 1; _i < arguments.length; _i++)
                                    argArray[_i - 1] = arguments[_i];
                                return function() {
                                        for (var innerArgs = [], _i = 0; _i < arguments.length; _i++)
                                            innerArgs[+_i] = arguments[_i];
                                        var canvas = _this._parentCanvas();
                                        if (canvas)
                                            return canvas[fnName].apply(canvas, argArray.concat(innerArgs))
                                    }
                            }, Object.defineProperty(VisualViewModel.prototype, "canvasIsManipulating", {
                                get: function() {
                                    return this._parentCanvas() ? this._parentCanvas().isManipulating : !1
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(VisualViewModel.prototype, "canvasAdornersHidden", {
                                get: function() {
                                    return this._parentCanvas() ? this._parentCanvas().adornersHidden : !1
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(VisualViewModel.prototype, "canvasId", {
                                get: function() {
                                    return this._canvasId()
                                }, set: function(value) {
                                        Contracts.checkNumber(value);
                                        this._canvasId(value);
                                        this._control.index = value;
                                        this._entityManager.notifyVisualChanged(this)
                                    }, enumerable: !0, configurable: !0
                            }), VisualViewModel.prototype.setCanvasInfo = function(canvasId) {
                                Contracts.checkNumber(canvasId);
                                this.canvasId = canvasId
                            }, Object.defineProperty(VisualViewModel.prototype, "controlElement", {
                                get: function() {
                                    return this._controlElement()
                                }, set: function(value) {
                                        Contracts.checkDefined(value);
                                        this._controlElement(value)
                                    }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(VisualViewModel.prototype, "visualElement", {
                                get: function() {
                                    return this._visualElement()
                                }, set: function(value) {
                                        Contracts.checkDefined(value);
                                        this._visualElement(value)
                                    }, enumerable: !0, configurable: !0
                            }), VisualViewModel.prototype.notifyCreationComplete = function() {
                                var _this = this;
                                this.track("_computedPosition", ko.computed(function() {
                                    return _this.x + _this.y * 1e3
                                }));
                                this.track("_computedSize", ko.computed(function() {
                                    return _this._bounds.width + _this._bounds.height * 1e3
                                }));
                                this.track("_computedCanvasAdornersHidden", ko.computed(function() {
                                    return _this.canvasAdornersHidden
                                }));
                                var notifyBoundsChanged = function() {
                                        _this.group && !_this.canvasAdornersHidden && _this.group.updateBoundsBasedOnGroupedVisuals()
                                    };
                                this.trackAnonymous(this._computedPosition.subscribe(function() {
                                    notifyBoundsChanged();
                                    _this._checkErrorWithinParentBounds()
                                }));
                                this.trackAnonymous(this._computedSize.subscribe(function() {
                                    notifyBoundsChanged()
                                }));
                                this.trackAnonymous(this._computedCanvasAdornersHidden.subscribe(function(newValue) {
                                    newValue || notifyBoundsChanged()
                                }));
                                this._isComplete(!0)
                            }, VisualViewModel.prototype.updateBounds = function(dimension, value) {
                                if (Contracts.checkNonEmpty(dimension), Contracts.checkDefined(value), dimension === AppMagic.AuthoringTool.OpenAjaxPropertyNames.ZIndex)
                                    value || (value = 0),
                                    this._updateZIndex(value);
                                else if (dimension === AppMagic.AuthoringTool.OpenAjaxPropertyNames.Visible)
                                    this._visualVisible(value);
                                else {
                                    var property = AuthoringToolOpenAjax.mapOpenAjaxPropertyName(dimension);
                                    this._bounds.updateDimension(property, value)
                                }
                            }, VisualViewModel.prototype.updateBoundsBasedOnGroupedVisuals = function() {
                                Contracts.check(!1, "updateBoundsBasedOnGroupedVisuals should not be called for non-group visuals")
                            }, VisualViewModel.prototype.setContainerSize = function(width, height, refreshNested) {
                                Contracts.check(width >= 0);
                                Contracts.check(height >= 0);
                                Contracts.checkBooleanOrUndefined(refreshNested);
                                this._bounds.setContainerSize(width, height);
                                this._bounds.refreshAfterContainerSizeChange(refreshNested)
                            }, Object.defineProperty(VisualViewModel.prototype, "parent", {
                                get: function() {
                                    var parentModel = this._control.parent;
                                    return parentModel ? parentModel.template.className === AppMagic.Constants.ScreenClass ? this._entityManager.screenFromModel(parentModel) : this._entityManager.visualFromModel(parentModel) : null
                                }, set: function(newParentViewModel) {
                                        Contracts.checkDefined(newParentViewModel);
                                        Contracts.check(newParentViewModel !== this);
                                        var oldParentViewModel = this.parent;
                                        oldParentViewModel && oldParentViewModel._removeVisualFromModel(this, this._control);
                                        newParentViewModel && newParentViewModel._addVisualToModel(this, this._control);
                                        this._updateDescendantOutlineIncompatible()
                                    }, enumerable: !0, configurable: !0
                            }), VisualViewModel.prototype._calculateDescendantOutlineIncompatible = function() {
                                return this.outlineIncompatible ? !0 : _super.prototype._calculateDescendantOutlineIncompatible.call(this)
                            }, VisualViewModel.prototype._updateDescendantOutlineIncompatible = function() {
                                _super.prototype._updateDescendantOutlineIncompatible.call(this);
                                var parentEntity = this.parent;
                                parentEntity && parentEntity._updateDescendantOutlineIncompatible()
                            }, Object.defineProperty(VisualViewModel.prototype, "screen", {
                                get: function() {
                                    var parentModel = this._control.parent;
                                    if (parentModel) {
                                        while (parentModel.parent)
                                            parentModel = parentModel.parent;
                                        if (parentModel.template.className === AppMagic.Constants.ScreenClass)
                                            return this._entityManager.screenFromModel(parentModel)
                                    }
                                    return null
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(VisualViewModel.prototype, "selected", {
                                get: function() {
                                    return this._selected()
                                }, set: function(value) {
                                        Contracts.checkValue(value);
                                        this._selected(value)
                                    }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(VisualViewModel.prototype, "zindex", {
                                get: function() {
                                    return this._zindex()
                                }, set: function(value) {
                                        Contracts.checkRange(value, 0, VisualViewModel.maximumZindex - 1);
                                        this._zindex(value);
                                        var ruleVM = this.tryGetRuleByPropertyName("ZIndex");
                                        ruleVM && (ruleVM.rhs = value.toString())
                                    }, enumerable: !0, configurable: !0
                            }), VisualViewModel.prototype._onZoomChange = function() {
                                this._selected() && this._updateAdornerCss()
                            }, VisualViewModel.prototype._checkErrorWithinParentBounds = function() {
                                var parent = this.parent;
                                if (parent && parent instanceof VisualViewModel) {
                                    var xWithOffset = this.x - this.errorCss.offset,
                                        yWithOffset = this.y - this.errorCss.offset;
                                    this._isErrorWithinParentContainer(parent._bounds.left <= xWithOffset && xWithOffset <= parent._bounds.right && parent._bounds.top <= yWithOffset && yWithOffset <= parent._bounds.bottom)
                                }
                            }, VisualViewModel.prototype._updateAdornerCss = function() {
                                var adornerScale = this._zoom.adornerScale;
                                this._adornerCss({
                                    negativeValue: -AppMagic.AuthoringTool.Constants.CanvasAdornerFillSize * adornerScale, positiveValue: AppMagic.AuthoringTool.Constants.CanvasAdornerFillSize * adornerScale, marginValue: -AppMagic.AuthoringTool.Constants.CanvasAdornerMargin * adornerScale, borderValue: AppMagic.AuthoringTool.Constants.CanvasAdornerBorderWidth * adornerScale, sizeValue: AppMagic.AuthoringTool.Constants.CanvasAdornerSize * adornerScale, marginInnerValue: AppMagic.AuthoringTool.Constants.CanvasAdornerInnerMargin * adornerScale, dimensionValue: AppMagic.AuthoringTool.Constants.CanvasAdornerOuterDimension * adornerScale
                                })
                            }, VisualViewModel.prototype._updateZIndex = function(value) {
                                Contracts.checkNumber(value);
                                this._zindex(value)
                            }, VisualViewModel.prototype._getSizeConstraints = function() {
                                var defaultWidth = AppMagic.AuthoringTool.Constants.ControlInitialBounds.width,
                                    defaultHeight = AppMagic.AuthoringTool.Constants.ControlInitialBounds.height,
                                    minimumWidth = AppMagic.AuthoringTool.Constants.ControlMinimumWidth,
                                    minimumHeight = AppMagic.AuthoringTool.Constants.ControlMinimumHeight;
                                if (typeof OpenAjax != "undefined" && typeof OpenAjax.widget != "undefined") {
                                    var openAjaxControl = OpenAjax.widget.byId(this.name);
                                    Contracts.checkValue(openAjaxControl);
                                    defaultWidth = openAjaxControl.OpenAjax.getPropertyValue(AppMagic.AuthoringTool.OpenAjaxPropertyNames.Width) || defaultWidth;
                                    defaultHeight = openAjaxControl.OpenAjax.getPropertyValue(AppMagic.AuthoringTool.OpenAjaxPropertyNames.Height) || defaultHeight;
                                    minimumWidth = openAjaxControl.OpenAjax.getPropertyValue("minimumWidth") || minimumWidth;
                                    minimumHeight = openAjaxControl.OpenAjax.getPropertyValue("minimumHeight") || minimumHeight
                                }
                                return {
                                        defaultWidth: defaultWidth, defaultHeight: defaultHeight, minimumWidth: minimumWidth, minimumHeight: minimumHeight
                                    }
                            }, VisualViewModel.prototype._setInitialBounds = function() {
                                if (this._bounds.x === 0 && this._bounds.y === 0) {
                                    var constraints = this._getSizeConstraints();
                                    this._bounds.setMinimumSize(constraints.minimumWidth, constraints.minimumHeight);
                                    var offset = {
                                            x: AppMagic.AuthoringTool.Constants.ControlInitialBounds.x, y: AppMagic.AuthoringTool.Constants.ControlInitialBounds.y
                                        };
                                    offset = this._findOffset(offset);
                                    offset.x = this._bounds.clampX(offset.x, constraints.defaultWidth);
                                    offset.y = this._bounds.clampY(offset.y, constraints.defaultHeight);
                                    this._bounds.updateDimension("x", offset.x);
                                    this._bounds.updateDimension("y", offset.y);
                                    this._bounds.updateDimension("width", constraints.defaultWidth);
                                    this._bounds.updateDimension("height", constraints.defaultHeight)
                                }
                            }, VisualViewModel.prototype._findOffset = function(offset) {
                                for (Contracts.checkObject(offset), Contracts.checkNumber(offset.x), Contracts.checkNumber(offset.y); !this._checkOffset(offset); )
                                    offset.x += AppMagic.AuthoringTool.Constants.PasteOffset,
                                    offset.y += AppMagic.AuthoringTool.Constants.PasteOffset;
                                return offset
                            }, VisualViewModel.prototype._checkOffset = function(offset) {
                                if (Contracts.checkObject(offset), Contracts.checkNumber(offset.x), Contracts.checkNumber(offset.y), this.parent === null)
                                    return !0;
                                for (var i = 0, len = this.parent.childEntities().length; i < len; i++) {
                                    var entity = this.parent.childEntities()[i];
                                    if (entity.positionable && entity.bounds.x === offset.x && entity.bounds.y === offset.y)
                                        return !1
                                }
                                return !0
                            }, VisualViewModel.prototype.refreshRulesFromDocument = function() {
                                this.updateRules();
                                this._bounds.refreshFromDocument()
                            }, VisualViewModel.getNestedCanvasPropertyNames = function(properties, displayMode) {
                                Contracts.checkArray(properties);
                                typeof displayMode != "undefined" && ViewModels.NestedPropertyDisplayMode.verify(displayMode);
                                for (var names = [], nestedProperties = this.getNestedCanvasProperties(properties, displayMode), idx = 0, propLength = nestedProperties.length; idx < propLength; idx++)
                                    names.push(nestedProperties[idx].propertyName);
                                return names.sort(), names
                            }, VisualViewModel.getNestedCanvasProperties = function(properties, displayMode) {
                                Contracts.checkArray(properties);
                                typeof displayMode != "undefined" && ViewModels.NestedPropertyDisplayMode.verify(displayMode);
                                var nestedProperties = [];
                                Contracts.checkArray(properties);
                                for (var propertyIndex = 0, propertyLength = properties.length; propertyIndex < propertyLength; propertyIndex++)
                                    for (var property = properties[propertyIndex], nestedPropertyIndex = 0, nestedPropertyLength = NestedProperties.length; nestedPropertyIndex < nestedPropertyLength; nestedPropertyIndex++) {
                                        var nestedProperty = NestedProperties[nestedPropertyIndex];
                                        displayMode && nestedProperty.displayMode !== displayMode || property.propertyInvariantName.indexOf(nestedProperty.prefix) === 0 && property.propertyInvariantName.length > nestedProperty.prefix.length && nestedProperties.push(property)
                                    }
                                return nestedProperties.sort(function(a, b) {
                                        return a.propertyName.localeCompare(b.propertyName)
                                    }), nestedProperties
                            }, VisualViewModel.maximumZindex = AppMagic.Constants.zIndex.visualMaximum, VisualViewModel
                }(AppMagic.AuthoringTool.ViewModels.EntityViewModel);
            ViewModels.VisualViewModel = VisualViewModel
        })(ViewModels = AuthoringTool.ViewModels || (AuthoringTool.ViewModels = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ViewModels;
        (function(ViewModels) {
            var GroupViewModel = function(_super) {
                    __extends(GroupViewModel, _super);
                    function GroupViewModel(doc, entityManager, control, controlManager, ruleFactory, zoom) {
                        _super.call(this, doc, entityManager, control, controlManager, ruleFactory, zoom);
                        this._groupedVisuals = ko.observableArray([]);
                        this._groupPropertyRuleMap = null;
                        this._control = control
                    }
                    return GroupViewModel.prototype.updateBeforeCreation = function() {
                            this._initGroupedVisuals();
                            this._initRulesInfo()
                        }, GroupViewModel.prototype.updateAfterCreation = function() {
                            _super.prototype.updateAfterCreation.call(this);
                            this.initGroup()
                        }, GroupViewModel.prototype.initGroup = function() {
                                this._initGroupedVisuals();
                                this._updateRulesInfoAndBounds()
                            }, GroupViewModel.prototype._initGroupedVisuals = function() {
                                for (var it = this._control.groupedControls.first(); it.hasCurrent; it.moveNext()) {
                                    var visual = this._entityManager.getVisualByName(it.current.name);
                                    this._groupedVisuals.indexOf(visual) < 0 && this._groupedVisuals.push(visual);
                                    visual.group = this
                                }
                            }, GroupViewModel.prototype._updateRulesInfoAndBounds = function() {
                                this._initRulesInfo();
                                this.updateBoundsBasedOnGroupedVisuals()
                            }, GroupViewModel.prototype._initRulesInfo = function() {
                                this.groupedVisuals.length > 1 && (this._createGroupPropertyRuleMap(), this._initRuleButtonManager(), this._initRuleCategoriesAndFilter())
                            }, GroupViewModel.prototype._createGroupPropertyRuleMap = function() {
                                Contracts.check(this.groupedVisuals.length > 1);
                                this._groupPropertyRuleMap != null && this._groupPropertyRuleMap.dispose();
                                var propertyRuleBinder = new AppMagic.AuthoringTool.ViewModels.PropertyRuleBinder(this._document, this._ruleFactory);
                                this._groupPropertyRuleMap = propertyRuleBinder.createMap(this.groupedVisuals)
                            }, GroupViewModel.prototype._initRuleButtonManager = function() {
                                this._ruleButtonManager = new AppMagic.AuthoringTool.ViewModels.RuleButtonManager(this.propertyRuleMap);
                                Contracts.check(this.groupedVisuals.length > 1);
                                var visual = this.groupedVisuals[0];
                                for (var propertyName in this.propertyRuleMap)
                                    if (this.propertyRuleMap[propertyName].rhs) {
                                        var value = visual.ruleButtonManager.getDesignTabValue(propertyName);
                                        this._ruleButtonManager.notifyPropertyChanged(propertyName, value)
                                    }
                            }, GroupViewModel.prototype._initRuleCategoriesAndFilter = function() {
                                Contracts.check(this.groupedVisuals.length > 1);
                                var ruleCategoriesAndFilterBuilder = new ViewModels.RuleCategoriesAndFilterBuilder(this.groupedVisuals, this.propertyRuleMap);
                                this._ruleCategories = ruleCategoriesAndFilterBuilder.ruleCategories;
                                this._ruleFilter = ruleCategoriesAndFilterBuilder.ruleFilter
                            }, GroupViewModel.prototype.alignGroupedVisuals = function(visualPositionMap, propertyName) {
                                Contracts.check(propertyName === "x" || propertyName === "y");
                                var oldPosition = visualPositionMap[this.name],
                                    offset = propertyName === "x" ? this.bounds.x - oldPosition.x : this.bounds.y - oldPosition.y;
                                this.groupedVisuals.forEach(function(groupedVisual) {
                                    var value = groupedVisual.bounds[propertyName] + offset;
                                    groupedVisual.bounds[propertyName] = value
                                })
                            }, GroupViewModel.prototype.notifyPropertyChanged = function(propertyName, value) {
                                if (this.propertyRuleMap[propertyName]) {
                                    for (var i = 0, len = this.groupedVisuals.length; i < len; i++) {
                                        var visual = this.groupedVisuals[i];
                                        if (visual.ruleButtonManager.getDesignTabValue(propertyName) !== value) {
                                            value = null;
                                            break
                                        }
                                    }
                                    this._ruleButtonManager.notifyPropertyChanged(propertyName, value)
                                }
                            }, GroupViewModel.prototype.ungroup = function() {
                                this._document.ungroup(this._control)
                            }, GroupViewModel.prototype.addVisualToGroup = function(visual) {
                                Contracts.checkValue(visual);
                                var index = this._groupedVisuals.indexOf(visual);
                                Contracts.check(index < 0);
                                this._groupedVisuals.push(visual);
                                this._updateRulesInfoAndBounds()
                            }, GroupViewModel.prototype.removeVisualFromGroup = function(visual) {
                                Contracts.checkValue(visual);
                                var index = this._groupedVisuals.indexOf(visual);
                                Contracts.check(index >= 0);
                                this._groupedVisuals.splice(index, 1);
                                this._updateRulesInfoAndBounds()
                            }, GroupViewModel.prototype.setGroupedVisualsBounds = function(visualBoundsMap, scaleX, scaleY) {
                                var _this = this,
                                    groupInitialBounds = visualBoundsMap[this.name];
                                groupInitialBounds.width >= this.bounds.minimumSize.width && groupInitialBounds.height >= this.bounds.minimumSize.height && this.groupedVisuals.forEach(function(groupedVisual) {
                                    var initialBounds = visualBoundsMap[groupedVisual.name],
                                        bounds = groupedVisual.bounds,
                                        x = _this.bounds.x + (initialBounds.x - groupInitialBounds.x) * scaleX,
                                        y = _this.bounds.y + (initialBounds.y - groupInitialBounds.y) * scaleY,
                                        width = initialBounds.width * scaleX,
                                        height = initialBounds.height * scaleY;
                                    groupedVisual.setBoundRules(x, y, width, height)
                                })
                            }, GroupViewModel.prototype.updateBoundsBasedOnGroupedVisuals = function() {
                                var groupedVisualsLen = this.groupedVisuals.length;
                                if (!(groupedVisualsLen <= 1)) {
                                    for (var firstVisual = this.groupedVisuals[0], selectedBounds = new AppMagic.Rectangle(firstVisual.bounds.x, firstVisual.bounds.y, firstVisual.bounds.width, firstVisual.bounds.height), i = 1; i < groupedVisualsLen; i++) {
                                        var visual = this.groupedVisuals[i],
                                            bounds = new AppMagic.Rectangle(visual.bounds.x, visual.bounds.y, visual.bounds.width, visual.bounds.height);
                                        selectedBounds.union(bounds)
                                    }
                                    this.setBoundRules(selectedBounds.x, selectedBounds.y, Math.max(selectedBounds.width, this.bounds.minimumSize.width), Math.max(selectedBounds.height, this.bounds.minimumSize.height))
                                }
                            }, Object.defineProperty(GroupViewModel.prototype, "groupBorderVisible", {
                                get: function() {
                                    return !this.selected && this._groupedVisuals().some(function(visual) {
                                            return visual.selected
                                        })
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(GroupViewModel.prototype, "groupedVisuals", {
                                get: function() {
                                    return this._groupedVisuals.peek()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(GroupViewModel.prototype, "propertyRuleMap", {
                                get: function() {
                                    return this._groupPropertyRuleMap ? this._groupPropertyRuleMap.map : {}
                                }, enumerable: !0, configurable: !0
                            }), GroupViewModel.prototype.dispose = function() {
                                this._groupPropertyRuleMap.dispose();
                                for (var propertyName in this._propertyRuleMap)
                                    this._propertyRuleMap[propertyName].dispose();
                                _super.prototype.dispose.call(this)
                            }, GroupViewModel
                }(ViewModels.VisualViewModel);
            ViewModels.GroupViewModel = GroupViewModel
        })(ViewModels = AuthoringTool.ViewModels || (AuthoringTool.ViewModels = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ViewModels;
        (function(ViewModels) {
            var PropertyHelperUI = Microsoft.AppMagic.Authoring.PropertyHelperUI,
                RuleViewModel = function(_super) {
                    __extends(RuleViewModel, _super);
                    function RuleViewModel(doc, control, property, ruleValueFactory, intellisense) {
                        _super.call(this);
                        this._document = null;
                        this._control = null;
                        this._eventTracker = null;
                        this._intellisense = null;
                        this._intellisenseVM = null;
                        this._presentationValue = null;
                        this._property = null;
                        this._rhs = null;
                        this._rhsUserEdit = null;
                        this._ruleValueFactory = null;
                        this._document = doc;
                        this._control = control;
                        this._property = property;
                        this._ruleValueFactory = ruleValueFactory;
                        this._intellisense = intellisense;
                        this.trackObservable("_rhs", ko.observable(""));
                        this.trackObservable("_presentationValue", ko.observable(null));
                        this.track("_eventTracker", new AppMagic.Utility.EventTracker)
                    }
                    return Object.defineProperty(RuleViewModel.prototype, "category", {
                            get: function() {
                                return this._property.propertyCategory
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(RuleViewModel.prototype, "group", {
                            get: function() {
                                return this._property.commandBar.group
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(RuleViewModel.prototype, "intellisenseVM", {
                                get: function() {
                                    return this._intellisenseVM || this.track("_intellisenseVM", new AppMagic.AuthoringTool.ViewModels.IntellisenseViewModel(this._intellisense, this.category)), this._intellisenseVM
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(RuleViewModel.prototype, "presentationValue", {
                                get: function() {
                                    return this._presentationValue()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(RuleViewModel.prototype, "property", {
                                get: function() {
                                    return this._property
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(RuleViewModel.prototype, "propertyInvariantName", {
                                get: function() {
                                    return this._property.propertyInvariantName
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(RuleViewModel.prototype, "propertyName", {
                                get: function() {
                                    return this._property.propertyName
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(RuleViewModel.prototype, "tooltip", {
                                get: function() {
                                    return this._property.tooltip
                                }, enumerable: !0, configurable: !0
                            }), RuleViewModel.prototype.getPresentationValueForTemplate = function(template) {
                                var value = this._presentationValue();
                                return value && value.template === template ? value : null
                            }, RuleViewModel.prototype.autoCorrectIdentifier = function(ruleText, cursor) {
                                var updatedCursor = cursor,
                                    ruleLength = ruleText.length;
                                var intelliContext = new Microsoft.AppMagic.Authoring.IntellisenseContext(this.propertyName, ruleText, cursor, this._control.topParentOrSelf.name, this._control.name),
                                    suggestResult = this.intellisenseVM.suggest(intelliContext);
                                var result = this.intellisenseVM.autoCorrectIdentifier(suggestResult.suggestions, ruleText, cursor, suggestResult.replacementStartIndex, suggestResult.replacementLength);
                                return result.nameFixed && (updatedCursor = result.startIndex + result.endIndex, this._rhs(result.updatedText)), updatedCursor
                            }, RuleViewModel.prototype.finalizeRule = function(ruleText, cursor) {
                                var ruleLength = ruleText.length;
                                var intelliContext = new Microsoft.AppMagic.Authoring.IntellisenseContext(this.propertyName, ruleText, cursor, this._control.topParentOrSelf.name, this._control.name),
                                    result = this.intellisenseVM.finalizeRule(intelliContext, ruleText, cursor);
                                return result.nameFixed && this._rhs(result.updatedText), result.nameFixed
                            }, RuleViewModel.prototype.refreshIntellisense = function(textAreaValue, caretPosition, functionCategory) {
                                var currentEntityName = this._control.name,
                                    context = typeof functionCategory == "undefined" ? new Microsoft.AppMagic.Authoring.IntellisenseContext(this.propertyName, textAreaValue, caretPosition, this._control.topParentOrSelf.name, currentEntityName) : new Microsoft.AppMagic.Authoring.IntellisenseContext(this.propertyName, textAreaValue, caretPosition, this._control.topParentOrSelf.name, currentEntityName, functionCategory);
                                this.intellisenseVM.refresh(context)
                            }, RuleViewModel.prototype._ensureRhsUserEdit = function() {
                                var _this = this;
                                this._rhsUserEdit || this.track("_rhsUserEdit", ko.computed({
                                    read: function() {
                                        return _this.rhsUserEdit
                                    }, write: function(computedValue) {
                                            _this.rhsUserEdit = computedValue
                                        }
                                }))
                            }, RuleViewModel.prototype._setPresentationValue = function() {
                                var value = null;
                                this._property.propertyHelperUI !== PropertyHelperUI.none && (this._ensureRhsUserEdit(), value = this._ruleValueFactory.create(this._property.propertyHelperUI, this._rhsUserEdit));
                                this._presentationValue(value)
                            }, Object.defineProperty(RuleViewModel.prototype, "rhs", {
                                get: function() {
                                    return this._rhs()
                                }, set: function(value) {
                                        this._rhs(value)
                                    }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(RuleViewModel.prototype, "rhsUserEdit", {
                                get: function() {
                                    return this._rhs()
                                }, set: function(value) {
                                        this._rhs(value)
                                    }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(RuleViewModel.prototype, "isDataControlProperty", {
                                get: function() {
                                    return this._control && this._control.isDataControl
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(RuleViewModel.prototype, "controlName", {
                                get: function() {
                                    return this._control.name
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(RuleViewModel.prototype, "errorMessage", {
                                get: function() {
                                    return ""
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(RuleViewModel.prototype, "errors", {
                                get: function() {
                                    return []
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(RuleViewModel.prototype, "hasErrors", {
                                get: function() {
                                    return !1
                                }, enumerable: !0, configurable: !0
                            }), RuleViewModel
                }(AppMagic.Utility.Disposable);
            ViewModels.RuleViewModel = RuleViewModel;
            WinJS.Class.mix(RuleViewModel, WinJS.Utilities.eventMixin)
        })(ViewModels = AuthoringTool.ViewModels || (AuthoringTool.ViewModels = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ViewModels;
        (function(ViewModels) {
            var MultipleRuleViewModel = function(_super) {
                    __extends(MultipleRuleViewModel, _super);
                    function MultipleRuleViewModel(doc, control, property, ruleValueFactory, intellisense, sharedRules) {
                        var _this = this;
                        _super.call(this, doc, control, property, ruleValueFactory, intellisense);
                        this._shouldUpdateSharedRules = !0;
                        this._sharedRules = null;
                        this._sharedRhsSubscriptions = null;
                        this._sharedRules = sharedRules;
                        this._initRhs();
                        this.trackAnonymous(this._rhs.subscribe(function(rhs) {
                            _this._document.undoManager.createGroup("Commit Rule for Property : " + _this.propertyName);
                            try {
                                _this._shouldUpdateSharedRules && _this._sharedRules.forEach(function(rule) {
                                    rule.rhsUserEdit = rhs
                                })
                            }
                            finally {
                                _this._document.undoManager.closeGroup()
                            }
                        }));
                        this.track("_sharedRhsSubscriptions", []);
                        this._sharedRules.forEach(function(rule) {
                            var rhsComputed = ko.computed(function() {
                                    return rule.rhs
                                });
                            _this._sharedRhsSubscriptions.push(rhsComputed);
                            _this.trackAnonymous(rhsComputed.subscribe(function(value) {
                                if (_this._rhs() !== value)
                                    try {
                                        _this._shouldUpdateSharedRules = !1;
                                        _this._initRhs()
                                    }
                                    finally {
                                        _this._shouldUpdateSharedRules = !0
                                    }
                            }))
                        });
                        this._setPresentationValue()
                    }
                    return MultipleRuleViewModel.prototype._initRhs = function() {
                            try {
                                var value = this._sharedRules[0].rhs,
                                    rhsNotShared = this._sharedRules.some(function(rule) {
                                        return rule.rhs !== value
                                    });
                                rhsNotShared && (value = "");
                                this._rhs(value)
                            }
                            catch(e) {}
                        }, MultipleRuleViewModel.prototype.getDisplayKey = function(viewType, isChildRule) {
                            return viewType === "expressView" ? this.propertyName : this._property.displayName
                        }, Object.defineProperty(MultipleRuleViewModel.prototype, "isDataControlProperty", {
                                get: function() {
                                    return !1
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(MultipleRuleViewModel.prototype, "controlName", {
                                get: function() {
                                    return ""
                                }, enumerable: !0, configurable: !0
                            }), MultipleRuleViewModel.prototype.getInvocations = function() {
                                return null
                            }, Object.defineProperty(MultipleRuleViewModel.prototype, "errorMessage", {
                                get: function() {
                                    return this.rhs ? this._sharedRules[0].errorMessage : ""
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(MultipleRuleViewModel.prototype, "errors", {
                                get: function() {
                                    return this.rhs ? this._sharedRules[0].errors : []
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(MultipleRuleViewModel.prototype, "hasErrors", {
                                get: function() {
                                    return this.rhs ? this._sharedRules[0].hasErrors : !1
                                }, enumerable: !0, configurable: !0
                            }), MultipleRuleViewModel
                }(ViewModels.RuleViewModel);
            ViewModels.MultipleRuleViewModel = MultipleRuleViewModel
        })(ViewModels = AuthoringTool.ViewModels || (AuthoringTool.ViewModels = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ObjectViewer;
        (function(ObjectViewer) {
            var CellPosition = function() {
                    function CellPosition(row, column) {
                        row === void 0 && (row = 0);
                        column === void 0 && (column = 0);
                        this.row = row;
                        this.column = column
                    }
                    return CellPosition
                }();
            ObjectViewer.CellPosition = CellPosition
        })(ObjectViewer = AuthoringTool.ObjectViewer || (AuthoringTool.ObjectViewer = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var DataSourceItem = function() {
                function DataSourceItem(ruleExpression, displayName) {
                    this._displayName = displayName || ruleExpression;
                    this._ruleExpression = ruleExpression
                }
                return Object.defineProperty(DataSourceItem.prototype, "displayName", {
                        get: function() {
                            return this._displayName
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(DataSourceItem.prototype, "ruleExpression", {
                        get: function() {
                            return this._ruleExpression
                        }, enumerable: !0, configurable: !0
                    }), DataSourceItem.compareDisplayName = function(a, b) {
                            return a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase())
                        }, DataSourceItem
            }();
        AuthoringTool.DataSourceItem = DataSourceItem
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ObjectViewer;
        (function(ObjectViewer) {
            var DataViewerViewModel = function(_super) {
                    __extends(DataViewerViewModel, _super);
                    function DataViewerViewModel() {
                        _super.call(this);
                        this._viewers = null;
                        this._hideDepthBand = ko.observable(!1);
                        this.track("_eventTracker", new AppMagic.Utility.EventTracker);
                        this.trackObservable("_viewers", ko.observableArray([]))
                    }
                    return Object.defineProperty(DataViewerViewModel.prototype, "viewers", {
                            get: function() {
                                return this._viewers()
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(DataViewerViewModel.prototype, "showDepthBand", {
                            get: function() {
                                return !this._hideDepthBand() && this._viewers().length > 0
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(DataViewerViewModel.prototype, "hideDepthBand", {
                                get: function() {
                                    return this._hideDepthBand()
                                }, set: function(val) {
                                        this._hideDepthBand(val)
                                    }, enumerable: !0, configurable: !0
                            }), DataViewerViewModel.prototype.clearData = function() {
                                this._viewers([])
                            }, DataViewerViewModel.prototype.notifyShow = function() {
                                this._viewers().forEach(function(viewerItem) {
                                    viewerItem.dispatchEvent(AppMagic.AuthoringTool.ObjectViewer.ObjectViewerViewModel.events.notifyshow)
                                })
                            }, DataViewerViewModel.prototype.setData = function(dataName, data, schema, isShowingTypeConvertibleData) {
                                var isArray = data instanceof Array,
                                    dataSource = new ObjectViewer.MemoryObjectViewerDataSource(isArray ? data.slice(0, ObjectViewer.ObjectViewerViewModel.NumberOfPreviewRows) : data, schema, !1);
                                return this.setDataSourceProvider(dataName, dataSource, isShowingTypeConvertibleData)
                            }, DataViewerViewModel.prototype.setDataSourceProvider = function(dataName, dataSource, isShowingTypeConvertibleData) {
                                this._viewers([]);
                                var objectData = new ObjectViewer.ObjectViewerData(dataSource),
                                    viewer = new AppMagic.AuthoringTool.ObjectViewer.ObjectViewerViewModel(0, dataName, objectData, isShowingTypeConvertibleData);
                                this._pushViewer(viewer)
                            }, DataViewerViewModel.prototype.notifyClickCellArrayOrObject = function(clickInfo) {
                                this._descendIntoNestedData(clickInfo)
                            }, DataViewerViewModel.prototype._descendIntoNestedData = function(descensionInfo) {
                                var viewerIndex = descensionInfo.viewerIndex,
                                    viewers = this._viewers(),
                                    viewer = viewers[viewerIndex],
                                    indexOfFirstViewerToSplice = viewerIndex + 1,
                                    newViewer = viewer.createChildViewer(indexOfFirstViewerToSplice, descensionInfo.position);
                                this._pushViewer(newViewer)
                            }, DataViewerViewModel.prototype._pushViewer = function(viewer) {
                                var _this = this;
                                var events = AppMagic.AuthoringTool.ObjectViewer.ObjectViewerViewModel.events;
                                this._eventTracker.add(viewer, events.clickcellarrayorobject, function(evt) {
                                    _this._descendIntoNestedData(evt.detail)
                                });
                                this._eventTracker.add(viewer, events.clickgridheader, function(evt) {
                                    var headerElement = evt.detail.event.currentTarget;
                                    _this.dispatchEvent(DataViewerViewModel.events.clickchildgridheader, {
                                        header: evt.detail.header, headerElement: headerElement
                                    })
                                });
                                this._viewers.push(viewer)
                            }, DataViewerViewModel.prototype._popViewers = function(depth) {
                                var deleteCount = this._viewers().length - 1 - depth;
                                this._viewers.splice(depth + 1, deleteCount);
                                this.notifyShow()
                            }, DataViewerViewModel.prototype.onClickDepthLevel = function(depth) {
                                this._popViewers(depth)
                            }, DataViewerViewModel.prototype.onClickHelpLink = function() {
                                AppMagic.AuthoringTool.Utility.openLinkInBrowser(AppMagic.AuthoringStrings.DataViewerHelpUrl)
                            }, DataViewerViewModel.events = {clickchildgridheader: "clickchildgridheader"}, DataViewerViewModel
                }(AppMagic.Utility.Disposable);
            ObjectViewer.DataViewerViewModel = DataViewerViewModel;
            WinJS.Class.mix(DataViewerViewModel, WinJS.Utilities.eventMixin)
        })(ObjectViewer = AuthoringTool.ObjectViewer || (AuthoringTool.ObjectViewer = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Entities;
    (function(Entities) {
        var DefaultRuleUpdaters = function() {
                function DefaultRuleUpdaters(){}
                return DefaultRuleUpdaters.addUpdaters = function(manager) {
                        manager.addUpdater(Entities.ConstrainToContainerRuleUpdater);
                        manager.addUpdater(Entities.SliderLayoutRuleUpdater)
                    }, DefaultRuleUpdaters
            }();
        Entities.DefaultRuleUpdaters = DefaultRuleUpdaters
    })(Entities = AppMagic.Entities || (AppMagic.Entities = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var DocumentLayoutManager = function(_super) {
                __extends(DocumentLayoutManager, _super);
                function DocumentLayoutManager(doc) {
                    var _this = this;
                    _super.call(this);
                    this._aspectRatioMultiplier = ko.observable(1);
                    this.layoutEngineActive = !1;
                    doc ? this.setDocument(doc) : (this._width = ko.observable(1366), this._height = ko.observable(768), this._orientation = ko.observable(0));
                    this._layoutEngine = new AppMagic.DocumentLayout.LayoutEngine(this);
                    this._aspectRatioMultiplier.subscribe(function() {
                        _this.dispatchEvent("aspectratiochanged")
                    }, this)
                }
                return DocumentLayoutManager.prototype.setDocument = function(doc) {
                        return this._document = doc, this._width = ko.observable(this._document.properties.canvasWidth), this._height = ko.observable(this._document.properties.canvasHeight), this._orientation = ko.observable(this._document.properties.canvasOrientation), this._aspectRatioMultiplier(1), this
                    }, DocumentLayoutManager.prototype.setDimensions = function(width, height, orientation) {
                        this._orientation(orientation);
                        this._width(width);
                        this._height(height);
                        this.dispatchEvent("layoutenginechange")
                    }, Object.defineProperty(DocumentLayoutManager.prototype, "width", {
                            get: function() {
                                return this._width()
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(DocumentLayoutManager.prototype, "height", {
                            get: function() {
                                return this._height()
                            }, enumerable: !0, configurable: !0
                        }), DocumentLayoutManager.prototype.getDimensions = function() {
                            return this._orientation() === 1 ? {
                                    width: this._height(), height: this._width()
                                } : {
                                    width: this._width(), height: this._height()
                                }
                        }, Object.defineProperty(DocumentLayoutManager.prototype, "orientation", {
                            get: function() {
                                return this._orientation()
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(DocumentLayoutManager.prototype, "layoutEngine", {
                            get: function() {
                                return this._layoutEngine
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(DocumentLayoutManager.prototype, "aspectRatioMultiplier", {
                            get: function() {
                                return this._aspectRatioMultiplier()
                            }, enumerable: !0, configurable: !0
                        }), DocumentLayoutManager.prototype.changeDimensions = function(landscapeWidth, landscapeHeight) {
                            this._document.undoManager.createGroup("User change of the canvas dimension.");
                            try {
                                this._orientation() === 0 ? (this._updateAspectRatioMultiplier(this._width(), landscapeWidth), this._width(landscapeWidth), this._height(landscapeHeight), this._updateDocument(landscapeWidth, landscapeHeight, null)) : this._orientation() === 1 && (this._updateAspectRatioMultiplier(this._height(), landscapeWidth), this._width(landscapeHeight), this._height(landscapeWidth), this._updateDocument(landscapeHeight, landscapeWidth, null))
                            }
                            finally {
                                this._document.undoManager.closeGroup()
                            }
                        }, DocumentLayoutManager.prototype.changeOrientation = function(orientation) {
                            if (this._orientation() !== orientation)
                                try {
                                    this._document.undoManager.createGroup("User change of the canvas orientation.");
                                    this._orientation(orientation);
                                    var tempWidth = this._width();
                                    this._width(this._height());
                                    this._height(tempWidth);
                                    this._updateDocument(this._width(), this._height(), this._orientation())
                                }
                                finally {
                                    this._document.undoManager.closeGroup()
                                }
                        }, DocumentLayoutManager.prototype._updateDocument = function(width, height, orientation) {
                            width !== null && (this._document.properties.canvasWidth = width);
                            height !== null && (this._document.properties.canvasHeight = height);
                            orientation !== null && (this._document.properties.canvasOrientation = orientation);
                            this.dispatchEvent("documentlayoutchanged")
                        }, DocumentLayoutManager.prototype._updateAspectRatioMultiplier = function(current, target) {
                            Contracts.checkNumber(current);
                            Contracts.checkNumber(target);
                            Contracts.check(current > 0);
                            Contracts.check(target > 0);
                            this._aspectRatioMultiplier(target / current)
                        }, DocumentLayoutManager
            }(AppMagic.Utility.Disposable);
        AuthoringTool.DocumentLayoutManager = DocumentLayoutManager;
        WinJS.Class.mix(DocumentLayoutManager, WinJS.Utilities.eventMixin)
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ViewModels;
        (function(ViewModels) {
            var EntityType = Microsoft.AppMagic.Authoring.EntityType,
                EventOp = Microsoft.AppMagic.Authoring.EventOp,
                PropertyRuleCategory = Microsoft.AppMagic.Authoring.PropertyRuleCategory,
                EntityManager = function(_super) {
                    __extends(EntityManager, _super);
                    function EntityManager(doc, controlManager, ruleFactory, zoom, loadedPromise, documentLayoutManager, shellViewModel) {
                        var _this = this;
                        _super.call(this);
                        this._visualUpdatesSuspendCount = 0;
                        this._visualFactory = null;
                        Contracts.checkValue(doc);
                        Contracts.checkValue(controlManager);
                        Contracts.checkValue(ruleFactory);
                        Contracts.checkValue(zoom);
                        Contracts.checkValue(loadedPromise);
                        this._document = doc;
                        this._controlManager = controlManager;
                        this._documentLayoutManager = documentLayoutManager;
                        this._loadedPromise = loadedPromise;
                        this._ruleFactory = ruleFactory;
                        this._zoom = zoom;
                        this.track("_eventTracker", new AppMagic.Utility.EventTracker);
                        this._eventTracker.add(doc, "entityadded", this._onEntityAdded, this);
                        this._eventTracker.add(doc, "entityremoved", this._onEntityRemoved, this);
                        this._eventTracker.add(doc, "entityrenamed", this._onEntityRenamed, this);
                        this._eventTracker.add(doc, "ruleevent", this._onRuleEvent, this);
                        this._eventTracker.add(doc, "groupcontrolevent", this._onGroupControlEvent, this);
                        this._eventTracker.add(AppMagic.AuthoringTool.Runtime, AppMagic.AuthoringTool.AuthoringToolRuntime.events.setRuntimeError, this._onRuntimeErrorEvent, this);
                        this._eventTracker.add(AppMagic.AuthoringTool.Runtime, AppMagic.AuthoringTool.AuthoringToolRuntime.events.resetRuntimeError, this._onResetRuntimeErrorEvent, this);
                        this._eventTracker.add(shellViewModel, "previewstart", this.handlePreviewStart, this);
                        this._eventTracker.add(shellViewModel, "previewend", this.handlePreviewEnd, this);
                        this._eventTracker.add(documentLayoutManager, "aspectratiochanged", this.handleDocumentLayoutChange, this);
                        this._visualFactory = new AppMagic.AuthoringTool.ViewModels.VisualFactory(doc, this, controlManager, ruleFactory, zoom);
                        this._visuals = ko.observableArray(this._buildVisuals());
                        this._visualsMap = this._buildMap(this._visuals());
                        this._screens = ko.observableArray(this._buildScreens());
                        this._screensMap = this._buildMap(this._screens());
                        this._dataControls = ko.observableArray(this._buildDataControls());
                        this._dataControlsMap = this._buildMap(this._dataControls());
                        this._filteredVisuals = [];
                        this._updateSuspendedVisuals = [];
                        this._loadedPromise.then(function() {
                            _this._visuals().forEach(function(visual) {
                                visual.notifyCreationComplete()
                            });
                            _this._screens().forEach(function(screenVisual) {
                                screenVisual.notifyCreationComplete()
                            })
                        })
                    }
                    return EntityManager.prototype.handlePreviewStart = function() {
                            var gridVisuals = [];
                            this._visuals().forEach(function(value) {
                                gridVisuals.unshift(value.bounds.gridVisual)
                            });
                            this._documentLayoutManager.layoutEngine.initialize(gridVisuals)
                        }, EntityManager.prototype.handlePreviewEnd = function() {
                            this._documentLayoutManager.layoutEngine.clean()
                        }, EntityManager.prototype.handleDocumentLayoutChange = function() {
                                var _this = this,
                                    bulkRuleUpdater = new AppMagic.AuthoringTool.BulkRuleUpdater(this._document),
                                    propertiesToUpdate = [new AspectRatioRule(AppMagic.AuthoringTool.OpenAjaxPropertyNames.Size, null)],
                                    shapeNotCircleCheck = function(visual, openAjaxControl) {
                                        return visual.templateClassName !== "AppMagic.Controls.Shapes.Arrow" && visual.templateClassName !== "AppMagic.Controls.Shapes.Circle"
                                    };
                                if (this._documentLayoutManager.orientation === 0) {
                                    var landscapeVerticalGalleryCheck = function(visual, openAjaxControl) {
                                            return visual.templateClassName === "AppMagic.Controls.Gallery.GalleryControl" && openAjaxControl.OpenAjax.getPropertyValue(AppMagic.AuthoringTool.OpenAjaxPropertyNames.Layout) === "vertical"
                                        };
                                    propertiesToUpdate.push(new AspectRatioRule(AppMagic.AuthoringTool.OpenAjaxPropertyNames.TemplateSize, landscapeVerticalGalleryCheck));
                                    propertiesToUpdate.push(new AspectRatioRule(AppMagic.AuthoringTool.OpenAjaxPropertyNames.TemplatePadding, landscapeVerticalGalleryCheck));
                                    propertiesToUpdate.push(new AspectRatioRule(AppMagic.AuthoringTool.OpenAjaxPropertyNames.PaddingTop, null));
                                    propertiesToUpdate.push(new AspectRatioRule(AppMagic.AuthoringTool.OpenAjaxPropertyNames.PaddingRight, null));
                                    propertiesToUpdate.push(new AspectRatioRule(AppMagic.AuthoringTool.OpenAjaxPropertyNames.X, null));
                                    propertiesToUpdate.push(new AspectRatioRule(AppMagic.AuthoringTool.OpenAjaxPropertyNames.Width, null));
                                    propertiesToUpdate.push(new AspectRatioRule(AppMagic.AuthoringTool.OpenAjaxPropertyNames.Height, shapeNotCircleCheck))
                                }
                                else {
                                    var portraitHorizontalGalleryCheck = function(visual, openAjaxControl) {
                                            return visual.templateClassName === "AppMagic.Controls.Gallery.GalleryControl" && openAjaxControl.OpenAjax.getPropertyValue(AppMagic.AuthoringTool.OpenAjaxPropertyNames.Layout) === "horizontal"
                                        };
                                    propertiesToUpdate.push(new AspectRatioRule(AppMagic.AuthoringTool.OpenAjaxPropertyNames.TemplateSize, portraitHorizontalGalleryCheck));
                                    propertiesToUpdate.push(new AspectRatioRule(AppMagic.AuthoringTool.OpenAjaxPropertyNames.TemplatePadding, portraitHorizontalGalleryCheck));
                                    propertiesToUpdate.push(new AspectRatioRule(AppMagic.AuthoringTool.OpenAjaxPropertyNames.PaddingLeft, null));
                                    propertiesToUpdate.push(new AspectRatioRule(AppMagic.AuthoringTool.OpenAjaxPropertyNames.PaddingBottom, null));
                                    propertiesToUpdate.push(new AspectRatioRule(AppMagic.AuthoringTool.OpenAjaxPropertyNames.Y, null));
                                    propertiesToUpdate.push(new AspectRatioRule(AppMagic.AuthoringTool.OpenAjaxPropertyNames.Height, null));
                                    propertiesToUpdate.push(new AspectRatioRule(AppMagic.AuthoringTool.OpenAjaxPropertyNames.Width, shapeNotCircleCheck))
                                }
                                var aspectRatioMultiplier = this._documentLayoutManager.aspectRatioMultiplier;
                                this._visuals().forEach(function(visual) {
                                    var openAjaxControl = OpenAjax.widget.byId(visual.name);
                                    propertiesToUpdate.forEach(function(property) {
                                        if (visual.tryGetRuleByPropertyInvariantName(property.propertyInvariantName) !== null) {
                                            if (property.checkFunction && property.checkFunction(visual, openAjaxControl))
                                                return;
                                            var propertyValue = openAjaxControl.OpenAjax.getPropertyValue(property.propertyInvariantName);
                                            typeof propertyValue == "number" && bulkRuleUpdater.addRuleUpdate(visual.name, property.propertyInvariantName, Microsoft.AppMagic.Common.LocalizationHelper.convertToLocaleSpecific((propertyValue * aspectRatioMultiplier).toFixed(2), null), visual.getRuleByPropertyInvariantName(property.propertyInvariantName))
                                        }
                                    }, _this)
                                }, this);
                                bulkRuleUpdater.bulkUpdateRules()
                            }, EntityManager.prototype.containsScreen = function(value) {
                                return Contracts.checkValue(value), this._screens.indexOf(value) >= 0
                            }, EntityManager.prototype.containsVisual = function(value) {
                                return Contracts.checkValue(value), this._visuals.indexOf(value) >= 0
                            }, EntityManager.prototype.containsScreenByName = function(screenName) {
                                Contracts.checkNonEmpty(screenName);
                                var ascreen = this._screensMap[screenName];
                                return typeof ascreen != "undefined" ? !0 : !1
                            }, EntityManager.prototype.containsVisualByName = function(visualName) {
                                Contracts.checkNonEmpty(visualName);
                                var visual = this._visualsMap[visualName];
                                return typeof visual != "undefined" ? !0 : !1
                            }, EntityManager.prototype.createFilteredVisuals = function(filter) {
                                Contracts.checkFunction(filter);
                                var filteredVisuals = new FilteredVisuals(this._visuals(), filter, this._visualUpdatesSuspendCount);
                                return this._filteredVisuals.push(filteredVisuals), filteredVisuals.visuals
                            }, EntityManager.prototype.getEntityByName = function(entityName) {
                                Contracts.checkNonEmpty(entityName);
                                var entity = this.tryGetVisualByName(entityName);
                                return entity || (entity = this.tryGetDataControlByName(entityName)), entity || (entity = this.getScreenByName(entityName)), entity
                            }, EntityManager.prototype._tryGetEntityByName = function(entityName) {
                                Contracts.checkNonEmpty(entityName);
                                var entity = this.tryGetVisualByName(entityName);
                                return entity ? entity : this._tryGetScreenByName(entityName)
                            }, EntityManager.prototype.getScreenByName = function(screenName) {
                                Contracts.checkNonEmpty(screenName);
                                var ascreen = this._screensMap[screenName];
                                if (typeof ascreen != "undefined")
                                    return ascreen;
                                else
                                    throw new Error("View model not found.");
                            }, EntityManager.prototype.getFirstScreenName = function() {
                                return Contracts.check(this._screens().length > 0), this._screens()[0].name
                            }, EntityManager.prototype.getVisualByName = function(visualName) {
                                Contracts.checkNonEmpty(visualName);
                                var visual = this._visualsMap[visualName];
                                if (typeof visual != "undefined")
                                    return visual;
                                else
                                    throw new Error("View model not found.");
                            }, EntityManager.prototype.notifyVisualChanged = function(visual) {
                                Contracts.checkValue(visual);
                                for (var i = 0, len = this._filteredVisuals.length; i < len; i++) {
                                    var filteredVisuals = this._filteredVisuals[i];
                                    filteredVisuals.notifyVisualChanged(visual)
                                }
                            }, EntityManager.prototype.notifyResumeVisualUpdate = function(visual, isUndoOperation) {
                                Contracts.checkValue(visual);
                                Contracts.checkBoolean(isUndoOperation);
                                Contracts.check(this._visualUpdatesSuspendCount > 0);
                                this._updateSuspendedVisuals.push(visual);
                                this._visualUpdatesSuspendCount--;
                                for (var i = 0, len = this._filteredVisuals.length; i < len; i++) {
                                    var filteredVisuals = this._filteredVisuals[i];
                                    filteredVisuals.resumeUpdates(this._updateSuspendedVisuals, isUndoOperation)
                                }
                                this._visualUpdatesSuspendCount === 0 && (this._updateSuspendedVisuals = [])
                            }, EntityManager.prototype.removeFilteredVisuals = function(visuals) {
                                Contracts.checkValue(visuals);
                                for (var i = 0, len = this._filteredVisuals.length; i < len; i++) {
                                    var filteredVisuals = this._filteredVisuals[i];
                                    if (filteredVisuals.visuals === visuals) {
                                        this._filteredVisuals.splice(i, 1);
                                        return
                                    }
                                }
                                Contracts.check(!1, "visuals wasn't created using createFilteredVisuals.")
                            }, EntityManager.prototype.getEntityScreenByName = function(entityName) {
                                Contracts.checkNonEmpty(entityName);
                                var ascreen = this._screensMap[entityName];
                                if (typeof ascreen != "undefined")
                                    return ascreen;
                                var visual = this._visualsMap[entityName];
                                if (typeof visual != "undefined")
                                    return visual.screen;
                                throw new Error("Unknown entity name.");
                            }, EntityManager.prototype.screenFromModel = function(model) {
                                Contracts.checkValue(model);
                                var ascreen = this._screensMap[model.name];
                                return Contracts.checkValue(ascreen), ascreen
                            }, EntityManager.prototype.tryGetVisualByName = function(visualName) {
                                Contracts.checkNonEmpty(visualName);
                                var visual = this._visualsMap[visualName];
                                return typeof visual != "undefined" ? visual : null
                            }, EntityManager.prototype.tryGetDataControlByName = function(dataControlName) {
                                Contracts.checkNonEmpty(dataControlName);
                                var dataControl = this._dataControlsMap[dataControlName];
                                return typeof dataControl != "undefined" ? dataControl : null
                            }, EntityManager.prototype._tryGetScreenByName = function(screenName) {
                                Contracts.checkNonEmpty(screenName);
                                var ascreen = this._screensMap[screenName];
                                return typeof ascreen != "undefined" ? ascreen : null
                            }, EntityManager.prototype.visualFromModel = function(model) {
                                Contracts.checkValue(model);
                                var visual = this._visualsMap[model.name];
                                return Contracts.checkValue(visual), visual
                            }, Object.defineProperty(EntityManager.prototype, "screens", {
                                get: function() {
                                    return this._screens
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(EntityManager.prototype, "dataControls", {
                                get: function() {
                                    return this._dataControls
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(EntityManager.prototype, "visuals", {
                                get: function() {
                                    return this._visuals
                                }, enumerable: !0, configurable: !0
                            }), EntityManager.prototype.notifyVisualsCreationComplete = function(visuals) {
                                var notifyVisualCreationComplete = function(visual) {
                                        if (visual) {
                                            visual.notifyCreationComplete();
                                            var childEntities = visual.childEntities();
                                            childEntities.forEach(function(childEntity) {
                                                notifyVisualCreationComplete(childEntity)
                                            })
                                        }
                                    };
                                visuals.forEach(function(visual) {
                                    notifyVisualCreationComplete(visual)
                                })
                            }, EntityManager.prototype._buildMap = function(visualsOrScreens) {
                                Contracts.checkValue(visualsOrScreens);
                                var map = Object.create(null);
                                Contracts.checkUndefined(map.toString);
                                for (var i = 0, len = visualsOrScreens.length; i < len; i++) {
                                    var item = visualsOrScreens[i];
                                    map[item.name] = item
                                }
                                return map
                            }, EntityManager.prototype._addItemToMap = function(map, item, newName) {
                                Contracts.checkValue(map);
                                Contracts.checkValue(item);
                                typeof newName == "undefined" && (newName = item.name);
                                Contracts.check(typeof map[newName] == "undefined");
                                map[newName] = item
                            }, EntityManager.prototype._removeItemFromMap = function(map, item) {
                                Contracts.checkValue(map);
                                Contracts.checkValue(item);
                                Contracts.check(typeof map[item.name] != "undefined");
                                delete map[item.name]
                            }, EntityManager.prototype._buildScreens = function() {
                                for (var screens = [], it = this._document.controls.first(); it.hasCurrent; it.moveNext()) {
                                    var screenModel = it.current;
                                    if (this._isScreen(screenModel)) {
                                        var screenViewModel = new AppMagic.AuthoringTool.ViewModels.ScreenViewModel(this._document, this, screenModel, this._controlManager, this._ruleFactory, this._zoom, this._loadedPromise);
                                        this.trackAnonymous(screenViewModel);
                                        screens.push(screenViewModel)
                                    }
                                }
                                return screens.sort(AppMagic.AuthoringTool.Utility.compareScreenIndex), screens
                            }, EntityManager.prototype._buildDataControls = function() {
                                for (var dataControls = [], it = this._document.controls.first(); it.hasCurrent; it.moveNext()) {
                                    var dataControlModel = it.current;
                                    if (this._isDataControl(dataControlModel)) {
                                        var dataControlViewModel = new AppMagic.AuthoringTool.ViewModels.DataControlViewModel(this._document, this, dataControlModel, this._controlManager, this._ruleFactory, this._zoom);
                                        dataControls.push(dataControlViewModel)
                                    }
                                }
                                return dataControls
                            }, EntityManager.prototype.initGroups = function() {
                                this._visuals().forEach(function(visual) {
                                    visual.initGroup()
                                })
                            }, EntityManager.prototype.reorderScreens = function(moveScreen, beforeScreen) {
                                if (Contracts.checkValue(moveScreen), Contracts.checkDefined(beforeScreen), Contracts.check(moveScreen instanceof AppMagic.AuthoringTool.ViewModels.ScreenViewModel), Contracts.check(beforeScreen instanceof AppMagic.AuthoringTool.ViewModels.ScreenViewModel || beforeScreen === null), moveScreen !== beforeScreen) {
                                    var oldActiveScreen = null;
                                    moveScreen && AppMagic.AuthoringTool.Runtime.activeScreenIndex() === moveScreen.index ? oldActiveScreen = moveScreen : beforeScreen && AppMagic.AuthoringTool.Runtime.activeScreenIndex() === beforeScreen.index && (oldActiveScreen = beforeScreen);
                                    var removeIndex = this._screens().indexOf(moveScreen);
                                    Contracts.check(removeIndex >= 0);
                                    this._screens.valueWillMutate();
                                    this._screens.peek().splice(removeIndex, 1);
                                    var insertIndex = beforeScreen ? this._screens().indexOf(beforeScreen) : this._screens().length;
                                    this._screens.peek().splice(insertIndex, 0, moveScreen);
                                    this._assignScreenIndices();
                                    oldActiveScreen && AppMagic.AuthoringTool.Runtime.activeScreenIndex(oldActiveScreen.index);
                                    this._screens.valueHasMutated()
                                }
                            }, EntityManager.prototype._buildVisuals = function() {
                                for (var visuals = [], it = this._document.controls.first(); it.hasCurrent; it.moveNext()) {
                                    var control = it.current;
                                    if (Contracts.checkValue(control), control.parent === null) {
                                        if (!this._isScreen(control) && !this._isDataControl(control)) {
                                            var visual = this._visualFactory.create(control);
                                            visuals.push(visual)
                                        }
                                        this._buildChildrenVisuals(control, visuals)
                                    }
                                }
                                return visuals
                            }, EntityManager.prototype._buildChildrenVisuals = function(control, visuals) {
                                Contracts.checkValue(control);
                                Contracts.checkArray(visuals);
                                for (var it = control.children.first(); it.hasCurrent; it.moveNext()) {
                                    var childControl = it.current;
                                    if (Contracts.checkValue(childControl), !this._isDataControl(childControl)) {
                                        var childVisual = this._visualFactory.create(childControl);
                                        visuals.push(childVisual);
                                        childControl.hasChildren && this._buildChildrenVisuals(childControl, visuals)
                                    }
                                }
                            }, EntityManager.prototype._isScreen = function(control) {
                                return Contracts.checkValue(control), Contracts.checkValue(control.template), control.template.className === AppMagic.Constants.ScreenClass
                            }, EntityManager.prototype._isDataControl = function(control) {
                                return Contracts.checkValue(control), Contracts.checkValue(control.template), !control.template.authorableVisual
                            }, EntityManager.prototype._getViewModelIndexByName = function(viewModels, viewModelName) {
                                var i = this._tryGetViewModelIndexByName(viewModels, viewModelName);
                                if (i < 0)
                                    throw new Error("View model not found.");
                                return i
                            }, EntityManager.prototype._tryGetViewModelIndexByName = function(viewModels, viewModelName) {
                                Contracts.checkArray(viewModels);
                                Contracts.checkNonEmpty(viewModelName);
                                for (var i = 0, len = viewModels.length; i < len; i++) {
                                    var viewModel = viewModels[i];
                                    if (viewModel.name === viewModelName)
                                        return i
                                }
                                return -1
                            }, EntityManager.prototype._handleScreenAdded = function(screenControl, changeType) {
                                Contracts.checkObject(screenControl);
                                Contracts.checkValue(changeType);
                                Contracts.checkNull(screenControl.parent);
                                var screenViewModel = new AppMagic.AuthoringTool.ViewModels.ScreenViewModel(this._document, this, screenControl, this._controlManager, this._ruleFactory, this._zoom, this._loadedPromise);
                                if (this.trackAnonymous(screenViewModel), changeType === Microsoft.AppMagic.Authoring.EntityChangeType.undoRedo) {
                                    var insertionIndex = screenViewModel.index;
                                    Contracts.check(insertionIndex >= 0);
                                    this._screens.splice(insertionIndex, 0, screenViewModel);
                                    this._assignScreenIndices()
                                }
                                else
                                    screenViewModel.index = this._screens().length,
                                    this._screens.push(screenViewModel);
                                this._addItemToMap(this._screensMap, screenViewModel);
                                screenViewModel.create();
                                this.dispatchEvent(EntityManager.events.screenadded, {
                                    screen: screenViewModel, changeType: changeType
                                })
                            }, EntityManager.prototype._handleDataControlAdded = function(dataControlModel, changeType) {
                                Contracts.checkObject(dataControlModel);
                                Contracts.checkValue(changeType);
                                Contracts.checkObject(dataControlModel.parent);
                                var dataControlViewModel = new AppMagic.AuthoringTool.ViewModels.DataControlViewModel(this._document, this, dataControlModel, this._controlManager, this._ruleFactory, this._zoom);
                                this._dataControls.push(dataControlViewModel);
                                this._addItemToMap(this._dataControlsMap, dataControlViewModel);
                                dataControlViewModel.create();
                                this.dispatchEvent(EntityManager.events.datacontroladded, {
                                    dataControl: dataControlViewModel, changeType: changeType
                                })
                            }, EntityManager.prototype._handleVisualAdded = function(visualControlModel, changeType) {
                                Contracts.checkObject(visualControlModel);
                                Contracts.checkValue(changeType);
                                var visual = this._visualFactory.create(visualControlModel);
                                visual.updateBeforeCreation();
                                this._visuals.unshift(visual);
                                this._addItemToMap(this._visualsMap, visual);
                                this._visualUpdatesSuspendCount++;
                                for (var i = 0, len = this._filteredVisuals.length; i < len; i++)
                                    this._filteredVisuals[i].suspendUpdates(),
                                    this._filteredVisuals[i].notifyVisualAdded(visual);
                                var parentEntity = visual.parent;
                                parentEntity && parentEntity.addToChildEntities(visual);
                                this.dispatchEvent(EntityManager.events.visualadded, {
                                    visual: visual, control: visualControlModel, changeType: changeType
                                })
                            }, EntityManager.prototype._onEntityAdded = function(args) {
                                Contracts.checkValue(args);
                                Contracts.checkValue(args.name);
                                Contracts.checkValue(args.entityType);
                                Contracts.checkValue(args.entityChangeType);
                                switch (args.entityType) {
                                    case EntityType.control:
                                        var controlModel = args.entity;
                                        Contracts.checkValue(controlModel);
                                        this._isScreen(controlModel) ? this._handleScreenAdded(controlModel, args.entityChangeType) : this._isDataControl(controlModel) ? this._handleDataControlAdded(controlModel, args.entityChangeType) : this._handleVisualAdded(controlModel, args.entityChangeType);
                                        break;
                                    default:
                                        break
                                }
                            }, EntityManager.prototype._onRuleEvent = function(args) {
                                Contracts.checkValue(args);
                                Contracts.checkValue(args.entity);
                                Contracts.checkNonEmpty(args.entityName);
                                Contracts.checkValue(args.entityType);
                                Contracts.checkValue(args.category);
                                Contracts.check(args.category === PropertyRuleCategory.data || args.category === PropertyRuleCategory.behavior || args.category === PropertyRuleCategory.design);
                                Contracts.checkNonEmpty(args.propertyName);
                                Contracts.checkValue(args.eventOpType);
                                var entity = this.getEntityByName(args.entityName);
                                Contracts.checkValue(entity);
                                var ruleVm = entity.getRuleByPropertyName(args.propertyName);
                                if (Contracts.checkValue(ruleVm), args.entityType === EntityType.control)
                                    switch (args.eventOpType) {
                                        case EventOp.added:
                                            var control = args.entity,
                                                result = control.tryGetRule(args.propertyName),
                                                rule = result.rule;
                                            result.value && ruleVm.refreshRuleFromDocument();
                                            break;
                                        case EventOp.removed:
                                        case EventOp.changed:
                                            ruleVm.refreshRuleFromDocument();
                                            break
                                    }
                            }, EntityManager.prototype._onGroupControlEvent = function(args) {
                                Contracts.checkValue(args);
                                Contracts.checkValue(args.eventOpType);
                                Contracts.checkNonEmpty(args.groupControlName);
                                Contracts.checkNonEmpty(args.controlName);
                                var group = this.getVisualByName(args.groupControlName),
                                    visual = this.getVisualByName(args.controlName);
                                Contracts.checkValue(group);
                                Contracts.checkValue(visual);
                                args.eventOpType === Microsoft.AppMagic.Authoring.EventOp.added ? (visual.group = group, group.addVisualToGroup(visual)) : args.eventOpType === Microsoft.AppMagic.Authoring.EventOp.removed && (visual.group = group, visual.group.removeVisualFromGroup(visual))
                            }, EntityManager.prototype._handleScreenRemoved = function(screenName, changeType) {
                                Contracts.checkNonEmpty(screenName);
                                Contracts.checkValue(changeType);
                                var deleteIndex = this._getViewModelIndexByName(this._screens(), screenName);
                                Contracts.check(this._screens().length > 1);
                                var screenViewModel = this._screens()[deleteIndex];
                                Contracts.checkObject(screenViewModel);
                                this._removeItemFromMap(this._screensMap, screenViewModel);
                                this.dispatchEvent(EntityManager.events.screenremoved, {
                                    screen: screenViewModel, changeType: changeType
                                });
                                this._screens.splice(deleteIndex, 1);
                                this._assignScreenIndices()
                            }, EntityManager.prototype._handleDataControlRemoved = function(dataControlName, changeType) {
                                Contracts.checkNonEmpty(dataControlName);
                                Contracts.checkValue(changeType);
                                var deleteIndex = this._getViewModelIndexByName(this._dataControls(), dataControlName),
                                    dataControlViewModel = this._dataControls()[deleteIndex];
                                Contracts.checkObject(dataControlViewModel);
                                this._removeItemFromMap(this._dataControlsMap, dataControlViewModel);
                                this.dispatchEvent(EntityManager.events.datacontrolremoved, {
                                    dataControl: dataControlViewModel, changeType: changeType
                                });
                                this._dataControls.splice(deleteIndex, 1)
                            }, EntityManager.prototype._handleVisualRemoved = function(visualName, changeType, control) {
                                Contracts.checkNonEmpty(visualName);
                                Contracts.checkValue(changeType);
                                Contracts.checkValue(control);
                                for (var deleteIndex = this._getViewModelIndexByName(this._visuals(), visualName), it = control.groupedControls.first(); it.hasCurrent; it.moveNext()) {
                                    var groupedVisual = this.getVisualByName(it.current.name);
                                    groupedVisual.group = null
                                }
                                var visual = this._visuals()[deleteIndex];
                                Contracts.checkObject(visual);
                                this._removeItemFromMap(this._visualsMap, visual);
                                var parentEntity = visual.parent;
                                parentEntity && parentEntity.removeFromChildEntities(visual);
                                this.dispatchEvent(EntityManager.events.visualremoved, {
                                    visual: visual, changeType: changeType
                                });
                                for (var i = 0, len = this._filteredVisuals.length; i < len; i++)
                                    this._filteredVisuals[i].notifyVisualRemoved(visual);
                                this._visuals.splice(deleteIndex, 1);
                                visual.dispose()
                            }, EntityManager.prototype._onEntityRemoved = function(args) {
                                Contracts.checkValue(args);
                                Contracts.checkNonEmpty(args.name);
                                Contracts.checkValue(args.entityType);
                                Contracts.checkValue(args.entity);
                                switch (args.entityType) {
                                    case EntityType.control:
                                        this._controlManager.removeControl(args.name);
                                        this._isScreen(args.entity) ? this._handleScreenRemoved(args.name, args.entityChangeType) : this._isDataControl(args.entity) ? this._handleDataControlRemoved(args.name, args.entityChangeType) : this._handleVisualRemoved(args.name, args.entityChangeType, args.entity);
                                        break;
                                    default:
                                        break
                                }
                            }, EntityManager.prototype._onRuntimeErrorEvent = function(args) {
                                Contracts.checkValue(args);
                                Contracts.checkValue(args.detail);
                                Contracts.checkValue(args.detail.errorContext);
                                Contracts.checkNonEmpty(args.detail.errorContext.entityName);
                                Contracts.checkNonEmpty(args.detail.errorContext.propertyName);
                                Contracts.checkNumber(args.detail.errorContext.id);
                                Contracts.checkNumber(args.detail.errorContext.nodeId);
                                Contracts.checkNonEmpty(args.detail.errorMessage);
                                var errorContext = args.detail.errorContext,
                                    entityName = errorContext.entityName,
                                    entity = this._tryGetEntityByName(entityName);
                                entity && (Contracts.checkValue(entity), entity.reportRuntimeError(errorContext.propertyName, args.detail.errorMessage, errorContext.id, args.detail.errorContext.nodeId))
                            }, EntityManager.prototype._onResetRuntimeErrorEvent = function(args) {
                                Contracts.checkValue(args);
                                Contracts.checkValue(args.detail);
                                Contracts.checkValue(args.detail.errorContext);
                                Contracts.checkNonEmpty(args.detail.errorContext.entityName);
                                Contracts.checkNonEmpty(args.detail.errorContext.propertyName);
                                Contracts.checkNumber(args.detail.errorContext.id);
                                var errorContext = args.detail.errorContext,
                                    entityName = errorContext.entityName,
                                    entity = this._tryGetEntityByName(entityName);
                                entity && (Contracts.checkValue(entity), entity.resetRuntimeError(errorContext.propertyName, errorContext.id))
                            }, EntityManager.prototype._assignScreenIndices = function() {
                                for (var i = 0, len = this._screens().length; i < len; i++)
                                    this._screens()[i].index = i
                            }, EntityManager.prototype._onEntityRenamed = function(args) {
                                Contracts.checkValue(args);
                                Contracts.checkValue(args.name);
                                Contracts.checkValue(args.oldName);
                                Contracts.checkValue(args.entityType);
                                Contracts.checkValue(args.entity);
                                switch (args.entityType) {
                                    case EntityType.control:
                                        if (this._isScreen(args.entity)) {
                                            var ascreen = this.getScreenByName(args.oldName);
                                            this._removeItemFromMap(this._screensMap, ascreen);
                                            ascreen.updateOnRename();
                                            this._addItemToMap(this._screensMap, ascreen, args.name);
                                            ascreen.updateViewOnRename()
                                        }
                                        else {
                                            var visual = this.getVisualByName(args.oldName);
                                            this._removeItemFromMap(this._visualsMap, visual);
                                            visual.updateOnRename();
                                            this._addItemToMap(this._visualsMap, visual, args.name);
                                            visual.updateViewOnRename()
                                        }
                                        this.dispatchEvent(EntityManager.events.entityrenamed, {
                                            entity: args.entity, oldName: args.oldName, changeType: args.entityChangeType
                                        });
                                        break;
                                    default:
                                        break
                                }
                            }, EntityManager.events = {
                                screenadded: "screenadded", screenremoved: "screenremoved", datacontroladded: "datacontroladded", datacontrolremoved: "datacontrolremoved", visualadded: "visualadded", visualremoved: "visualremoved", entityrenamed: "entityrenamed"
                            }, EntityManager
                }(AppMagic.Utility.Disposable);
            ViewModels.EntityManager = EntityManager;
            var FilteredVisuals = function() {
                    function FilteredVisuals(initialVisuals, filter, visualUpdatesSuspendCount) {
                        this._visualUpdatesSuspendCount = 0;
                        this._isRemoving = !1;
                        Contracts.checkArray(initialVisuals);
                        Contracts.checkFunction(filter);
                        Contracts.checkNumber(visualUpdatesSuspendCount);
                        this._filter = filter;
                        this._visualUpdatesSuspendCount = visualUpdatesSuspendCount;
                        var visuals = initialVisuals.filter(filter);
                        this._visuals = ko.observableArray(visuals);
                        this._subscribeVisuals()
                    }
                    return FilteredVisuals.prototype._subscribeVisuals = function() {
                            this._visuals.subscribe(function() {
                                this._visualUpdatesSuspendCount === 0 && this._assignIndices()
                            }.bind(this))
                        }, Object.defineProperty(FilteredVisuals.prototype, "visuals", {
                            get: function() {
                                return this._visuals
                            }, enumerable: !0, configurable: !0
                        }), FilteredVisuals.prototype.notifyVisualAdded = function(visual) {
                                Contracts.checkValue(visual);
                                this._filter(visual) && this._addVisual(visual)
                            }, FilteredVisuals.prototype.resumeUpdates = function(visuals, isUndoOperation) {
                                (Contracts.checkArray(visuals), Contracts.checkBoolean(isUndoOperation), this._visualUpdatesSuspendCount--, this._visualUpdatesSuspendCount > 0) || visuals.forEach(function(visual) {
                                    Contracts.checkValue(visual);
                                    this._filter(visual) && !isUndoOperation && this._assignIndices()
                                }.bind(this))
                            }, FilteredVisuals.prototype.suspendUpdates = function() {
                                this._visualUpdatesSuspendCount++
                            }, FilteredVisuals.prototype.notifyVisualRemoved = function(visual) {
                                Contracts.checkValue(visual);
                                this._removeVisual(visual)
                            }, FilteredVisuals.prototype.notifyVisualChanged = function(visual) {
                                if (Contracts.checkValue(visual), this._filter(visual)) {
                                    var contains = this._visuals.indexOf(visual) >= 0;
                                    contains || this._addVisual(visual)
                                }
                                else
                                    this._removeVisual(visual)
                            }, FilteredVisuals.prototype._addVisual = function(visual) {
                                Contracts.checkValue(visual);
                                Contracts.check(visual.zindex >= 0);
                                var visuals = this._visuals(),
                                    visualsLen = visuals.length;
                                if (visuals.length === 0 || visuals[visualsLen - 1].zindex !== 0)
                                    this._visuals.push(visual);
                                else {
                                    for (var index = visualsLen - 1; index > 0 && visuals[index - 1].zindex === 0; )
                                        index--;
                                    this._visuals.splice(index, 0, visual)
                                }
                            }, FilteredVisuals.prototype._assignIndices = function() {
                                if (!this._isRemoving) {
                                    var existingVisuals = this._visuals().filter(function(visual) {
                                            return visual.zindex !== 0
                                        }),
                                        newVisuals = this._visuals().filter(function(visual) {
                                            return visual.zindex === 0
                                        });
                                    existingVisuals.sort(AppMagic.AuthoringTool.Utility.compareVisualZIndex);
                                    var zindex = 1;
                                    newVisuals.forEach(function(visual) {
                                        visual.zindex = zindex++
                                    });
                                    existingVisuals.forEach(function(visual) {
                                        visual.zindex = zindex++
                                    })
                                }
                            }, FilteredVisuals.prototype._removeVisual = function(visual) {
                                Contracts.checkValue(visual);
                                Contracts.check(!this._isRemoving);
                                this._isRemoving = !0;
                                try {
                                    var i = this._visuals().indexOf(visual);
                                    i >= 0 && this._visuals.splice(i, 1)
                                }
                                finally {
                                    this._isRemoving = !1
                                }
                            }, FilteredVisuals
                }();
            ViewModels.FilteredVisuals = FilteredVisuals;
            var AspectRatioRule = function() {
                    function AspectRatioRule(propertyInvariantName, checkFunction) {
                        Contracts.checkNonEmpty(propertyInvariantName);
                        Contracts.checkFunctionOrNull(checkFunction);
                        this.propertyInvariantName = propertyInvariantName;
                        this.checkFunction = checkFunction
                    }
                    return AspectRatioRule
                }();
            WinJS.Class.mix(EntityManager, WinJS.Utilities.eventMixin)
        })(ViewModels = AuthoringTool.ViewModels || (AuthoringTool.ViewModels = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var IMEManager = function(_super) {
                __extends(IMEManager, _super);
                function IMEManager(eventDispatcher) {
                    eventDispatcher === void 0 && (eventDispatcher = window);
                    _super.call(this);
                    this._imeActive = !1;
                    AppMagic.Utility.Disposable.call(this);
                    this.track("_eventTracker", new AppMagic.Utility.EventTracker);
                    this._eventTracker.add(eventDispatcher, "compositionstart", this._handleCompositionEvent, this);
                    this._eventTracker.add(eventDispatcher, "compositionend", this._handleCompositionEvent, this)
                }
                return IMEManager.prototype._handleCompositionEvent = function(evt) {
                        this._imeActive = evt.type === "compositionstart" ? !0 : !1
                    }, Object.defineProperty(IMEManager.prototype, "imeActive", {
                        get: function() {
                            return this._imeActive
                        }, enumerable: !0, configurable: !0
                    }), IMEManager
            }(AppMagic.Utility.Disposable);
        AuthoringTool.IMEManager = IMEManager
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ObjectViewer;
        (function(ObjectViewer) {
            var ObjectViewerDataSourceEvents = function() {
                    function ObjectViewerDataSourceEvents(){}
                    return ObjectViewerDataSourceEvents.columnchanged = "columnchanged", ObjectViewerDataSourceEvents.columnremoved = "columnremoved", ObjectViewerDataSourceEvents.rowchanged = "rowchanged", ObjectViewerDataSourceEvents.rowremoved = "rowremoved", ObjectViewerDataSourceEvents
                }();
            ObjectViewer.ObjectViewerDataSourceEvents = ObjectViewerDataSourceEvents
        })(ObjectViewer = AuthoringTool.ObjectViewer || (AuthoringTool.ObjectViewer = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ObjectViewer;
        (function(ObjectViewer) {
            var LengthHeap = function() {
                    function LengthHeap(lengths) {
                        this._dataOffset = null;
                        this._heap = null;
                        var buildResult = LengthHeap.buildLengthHeap(lengths);
                        this._heap = buildResult.heap;
                        this._dataOffset = buildResult.dataOffset
                    }
                    return LengthHeap.prototype.setLength = function(len, arrayIndex) {
                            var numHeapNodes = this._heap.length,
                                numLengths = numHeapNodes + 1 >> 1;
                            var logBase2 = Math.log(numHeapNodes) / Math.LN2,
                                heapIndex = numHeapNodes - numLengths + ((1 << Math.ceil(logBase2) - 1) + arrayIndex) % numLengths;
                            this._heap[heapIndex] = len;
                            for (var current = (heapIndex + heapIndex % 2) / 2 - 1; current >= 0; ) {
                                var leftIndex = current * 2 + 1;
                                this._heap[current] = this._heap[leftIndex] + this._heap[leftIndex + 1];
                                current = (current + current % 2) / 2 - 1
                            }
                        }, LengthHeap.prototype.getVisibleRange = function(beginPixel, numPixelsShown, resizerThickness) {
                            if (this._heap.length === 0)
                                return {
                                        beginIndex: 0, numShown: 0
                                    };
                            var leftPick = this._pickPixel(beginPixel, resizerThickness),
                                numLengths = (this._heap.length + 1) / 2,
                                beginIndex = (2 * numLengths - this._heap.length + leftPick - this._dataOffset) % numLengths,
                                numShown = 0;
                            if (numPixelsShown > 0) {
                                var rightPick = this._pickPixel(beginPixel + numPixelsShown - 1, resizerThickness);
                                numShown = (rightPick - leftPick + numLengths) % numLengths + 1
                            }
                            return {
                                    beginIndex: beginIndex, numShown: numShown
                                }
                        }, LengthHeap.prototype._pickPixel = function(pixel, resizerThickness) {
                                for (var numHeapNodes = this._heap.length, numLengthLeavesCurrent = (numHeapNodes + 1) / 2, base = 0, heapIndex = 0, leftIndex = heapIndex * 2 + 1; leftIndex < numHeapNodes; ) {
                                    var left = this._heap[leftIndex],
                                        numOnLeft,
                                        powerOfTwoDirectlyLesserOrEqual = 1 << Math.floor(Math.log(numLengthLeavesCurrent) / Math.LN2),
                                        halfOfPowerOfTwoDirectlyLesserOrEqual = powerOfTwoDirectlyLesserOrEqual >> 1;
                                    numOnLeft = numLengthLeavesCurrent - powerOfTwoDirectlyLesserOrEqual > halfOfPowerOfTwoDirectlyLesserOrEqual ? powerOfTwoDirectlyLesserOrEqual : numLengthLeavesCurrent - halfOfPowerOfTwoDirectlyLesserOrEqual;
                                    var resizerThicknesses = numOnLeft * resizerThickness;
                                    pixel < left + base + resizerThicknesses ? (heapIndex = leftIndex, numLengthLeavesCurrent = numOnLeft) : (base += left + resizerThicknesses, heapIndex = leftIndex + 1, numLengthLeavesCurrent = numLengthLeavesCurrent - numOnLeft);
                                    leftIndex = heapIndex * 2 + 1
                                }
                                return heapIndex
                            }, LengthHeap.buildLengthHeapSubtree = function(heap, index) {
                                if (!heap[index] && heap[index] !== 0) {
                                    var leftSum = LengthHeap.buildLengthHeapSubtree(heap, index * 2 + 1),
                                        rightSum = LengthHeap.buildLengthHeapSubtree(heap, index * 2 + 2);
                                    heap[index] = leftSum + rightSum
                                }
                                return heap[index]
                            }, LengthHeap.buildLengthHeap = function(lengths) {
                                if (lengths.length === 0)
                                    return {
                                            heap: [], dataOffset: 0
                                        };
                                var heap,
                                    dataOffset,
                                    i,
                                    len,
                                    numLengths = lengths.length,
                                    numHeapNodes = numLengths * 2 - 1;
                                if (heap = new Array(numHeapNodes), numHeapNodes === 1)
                                    dataOffset = 0;
                                else {
                                    var logBase2 = Math.log(numHeapNodes) / Math.LN2;
                                    dataOffset = (1 << Math.ceil(logBase2) - 1) - numLengths
                                }
                                for (i = 0, len = numLengths; i < len; i++)
                                    heap[numHeapNodes - len + i] = lengths[(numLengths + i - dataOffset) % numLengths];
                                return LengthHeap.buildLengthHeapSubtree(heap, 0), {
                                        heap: heap, dataOffset: dataOffset
                                    }
                            }, LengthHeap
                }();
            ObjectViewer.LengthHeap = LengthHeap
        })(ObjectViewer = AuthoringTool.ObjectViewer || (AuthoringTool.ObjectViewer = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ObjectViewer;
        (function(ObjectViewer) {
            var MemoryObjectViewerDataSource = function() {
                    function MemoryObjectViewerDataSource(data, schema, canWrite) {
                        this._keyProperty = null;
                        this._rows = null;
                        this._schema = null;
                        this._isArray = !1;
                        this._canWrite = !1;
                        Contracts.check(typeof data == "object");
                        Contracts.checkObject(schema);
                        Contracts.checkArray(schema.ptr);
                        this._keyProperty = Math.random().toString();
                        this._isArray = data instanceof Array;
                        this._canWrite = canWrite;
                        this._rows = this._isArray ? AppMagic.Utility.clone(data, !0) : [AppMagic.Utility.clone(data, !0)];
                        this._schema = schema;
                        for (var i = 0, len = this._rows.length; i < len; i++) {
                            var row = this._rows[i];
                            row !== null && this._assignKey(row)
                        }
                    }
                    return MemoryObjectViewerDataSource.prototype.addRow = function(row) {
                            Contracts.checkDefined(row);
                            Contracts.check(this._isArray);
                            this._verifyCanWrite();
                            row = AppMagic.Utility.clone(row, !0);
                            var key = this._assignKey(row);
                            return this._rows.push(row), this.dispatchEvent(ObjectViewer.ObjectViewerDataSourceEvents.rowchanged, key), key
                        }, MemoryObjectViewerDataSource.prototype.updateRowProperty = function(key, propertyName, value) {
                            this._verifyCanWrite();
                            var index = this._indexOfRow(key);
                            Contracts.checkRange(index, 0, this._rows.length - 1);
                            this._setRowColumnValue(this._rows[index], propertyName, value);
                            this.dispatchEvent(ObjectViewer.ObjectViewerDataSourceEvents.rowchanged, key)
                        }, MemoryObjectViewerDataSource.prototype.deleteRow = function(key) {
                                Contracts.checkNonEmpty(key);
                                this._verifyCanWrite();
                                var index = this._indexOfRow(key);
                                Contracts.checkRange(index, 0, this._rows.length - 1);
                                this._rows.splice(index, 1);
                                this.dispatchEvent(ObjectViewer.ObjectViewerDataSourceEvents.rowremoved, key)
                            }, MemoryObjectViewerDataSource.prototype.getRowByKey = function(key) {
                                Contracts.checkNonEmpty(key);
                                var index = this._indexOfRow(key);
                                return index < 0 ? undefined : (Contracts.checkRange(index, 0, this._rows.length - 1), AppMagic.Utility.clone(this._rows[index], !0))
                            }, MemoryObjectViewerDataSource.prototype.getRowKey = function(row) {
                                if (row === null)
                                    return null;
                                Contracts.checkDefined(row);
                                var key = row[this._keyProperty];
                                return typeof key == "undefined" ? null : key
                            }, MemoryObjectViewerDataSource.prototype.getRows = function() {
                                return AppMagic.Utility.clone(this._rows, !0)
                            }, MemoryObjectViewerDataSource.prototype.getSchema = function() {
                                return this._schema
                            }, MemoryObjectViewerDataSource.prototype.getNestedData = function(key, column) {
                                Contracts.checkNonEmpty(key);
                                Contracts.checkNonEmpty(column);
                                var index = this._indexOfRow(key),
                                    row = this._rows[index],
                                    data = this._getRowColumnValue(row, column),
                                    schema = AppMagic.Schema.getSchemaOfProperty(this._schema, column),
                                    numberOfRowsToPreview = AppMagic.AuthoringTool.ObjectViewer.ObjectViewerViewModel.NumberOfPreviewRows,
                                    previewData = data instanceof Array ? data.slice(0, numberOfRowsToPreview) : data;
                                return new MemoryObjectViewerDataSource(previewData, schema, this._canWrite)
                            }, Object.defineProperty(MemoryObjectViewerDataSource.prototype, "isArray", {
                                get: function() {
                                    return this._isArray
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(MemoryObjectViewerDataSource.prototype, "canWrite", {
                                get: function() {
                                    return this._canWrite
                                }, enumerable: !0, configurable: !0
                            }), MemoryObjectViewerDataSource.prototype.addColumn = function(name, type) {
                                Contracts.checkNonEmpty(name);
                                Contracts.checkNonEmpty(type);
                                this._verifyCanWrite();
                                AppMagic.Schema.addSchemaMember(this._schema, name, type);
                                this.dispatchEvent(ObjectViewer.ObjectViewerDataSourceEvents.columnchanged, {
                                    name: name, type: type
                                })
                            }, MemoryObjectViewerDataSource.prototype.removeColumn = function(name) {
                                Contracts.checkNonEmpty(name);
                                this._verifyCanWrite();
                                AppMagic.Schema.removeSchemaMember(this._schema, name);
                                this.dispatchEvent(ObjectViewer.ObjectViewerDataSourceEvents.columnremoved, name)
                            }, MemoryObjectViewerDataSource.prototype.setColumnType = function(name, type) {
                                Contracts.checkNonEmpty(name);
                                Contracts.checkNonEmpty(type);
                                this._verifyCanWrite();
                                Contracts.check(AppMagic.Schema.containsSchemaMember(this._schema, name));
                                var columnSchema = AppMagic.Schema.getSchemaOfProperty(this._schema, name);
                                columnSchema.type = type
                            }, Object.defineProperty(MemoryObjectViewerDataSource.prototype, "columnTypes", {
                                get: function() {
                                    return []
                                }, enumerable: !0, configurable: !0
                            }), MemoryObjectViewerDataSource.prototype.setRowColumnValue = function(key, propertyName, value) {
                                var index = this._indexOfRow(key);
                                this._setRowColumnValue(this._rows[index], propertyName, value)
                            }, MemoryObjectViewerDataSource.prototype.getRowColumnValue = function(key, propertyName) {
                                var index = this._indexOfRow(key);
                                return this._getRowColumnValue(this._rows[index], propertyName)
                            }, MemoryObjectViewerDataSource.prototype._assignKey = function(row, key) {
                                return Contracts.checkDefined(row), typeof key == "undefined" && (key = Math.random().toString()), row[this._keyProperty] = key, key
                            }, MemoryObjectViewerDataSource.prototype._indexOfRow = function(key) {
                                Contracts.checkNonEmpty(key);
                                for (var i = 0, len = this._rows.length; i < len; i++) {
                                    var rowKey = this.getRowKey(this._rows[i]);
                                    if (key === rowKey)
                                        return i
                                }
                                return -1
                            }, MemoryObjectViewerDataSource.prototype._setRowColumnValue = function(row, propertyName, value) {
                                row.OpenAjax ? row.OpenAjax.setPropertyValue(propertyName, value) : row[propertyName] = value
                            }, MemoryObjectViewerDataSource.prototype._getRowColumnValue = function(row, propertyName) {
                                return row.OpenAjax ? row.OpenAjax.getPropertyValue(propertyName) : row[propertyName]
                            }, MemoryObjectViewerDataSource.prototype._verifyCanWrite = function() {
                                Contracts.check(this._canWrite, "Data source is not writeable.")
                            }, MemoryObjectViewerDataSource
                }();
            ObjectViewer.MemoryObjectViewerDataSource = MemoryObjectViewerDataSource;
            WinJS.Class.mix(MemoryObjectViewerDataSource, WinJS.Utilities.eventMixin)
        })(ObjectViewer = AuthoringTool.ObjectViewer || (AuthoringTool.ObjectViewer = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ViewModels;
        (function(ViewModels) {
            var NameMapSourceEnumerator = function() {
                    function NameMapSourceEnumerator(sourceAggregateType) {
                        this._lastAllocatedSource = null;
                        this._sourceAggregateType = null;
                        this._sourceUsageCount = null;
                        this._sourceAggregateType = sourceAggregateType;
                        this._sourceUsageCount = Object.create(null)
                    }
                    return NameMapSourceEnumerator.prototype.getCoercibleSources = function(sinkType) {
                            return this._getSourcesCore(sinkType, !0)
                        }, NameMapSourceEnumerator.prototype.pickSource = function(sinkType) {
                            var source = this._pickSource(this._getExactSources(sinkType));
                            return source || (source = this._pickSource(this.getCoercibleSources(sinkType))), source
                        }, NameMapSourceEnumerator.prototype._getExactSources = function(sinkType) {
                                return this._getSourcesCore(sinkType, !1)
                            }, NameMapSourceEnumerator.prototype._getSourcesCore = function(sinkType, coerceMatches) {
                                var sources = [];
                                if (this._sourceAggregateType)
                                    for (var columns = this._sourceAggregateType.getColumnsOfType(sinkType, coerceMatches), it = columns.first(); it.hasCurrent; it.moveNext())
                                        sources.push(it.current);
                                return sources
                            }, NameMapSourceEnumerator.prototype._pickSource = function(sources) {
                                for (var minimumSource = null, minimumUsageCount = Infinity, i = 0, len = sources.length; i < len; i++) {
                                    var source = sources[i],
                                        usageCount = this._sourceUsageCount[source] || 0;
                                    usageCount < minimumUsageCount && source !== this._lastAllocatedSource && (minimumSource = source, minimumUsageCount = usageCount)
                                }
                                return minimumSource || (this._lastAllocatedSource = minimumSource), minimumSource && (this._lastAllocatedSource = minimumSource, this._sourceUsageCount[minimumSource] = minimumUsageCount + 1), minimumSource
                            }, NameMapSourceEnumerator
                }();
            ViewModels.NameMapSourceEnumerator = NameMapSourceEnumerator
        })(ViewModels = AuthoringTool.ViewModels || (AuthoringTool.ViewModels = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ObjectViewer;
        (function(ObjectViewer) {
            var ObjectViewerEditContext = function() {
                    function ObjectViewerEditContext(container) {
                        this._container = null;
                        this._completePromise = null;
                        this._container = container
                    }
                    return ObjectViewerEditContext.prototype.startAsync = function() {
                            var currentContext = this._container();
                            return currentContext && currentContext.cancel(), this._container(this), this._completePromise = Core.Promise.createCompletablePromise(), this._completePromise.promise
                        }, ObjectViewerEditContext.prototype._complete = function(value) {
                            this._container(null);
                            this._completePromise.complete(value)
                        }, ObjectViewerEditContext
                }();
            ObjectViewer.ObjectViewerEditContext = ObjectViewerEditContext
        })(ObjectViewer = AuthoringTool.ObjectViewer || (AuthoringTool.ObjectViewer = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ObjectViewer;
        (function(ObjectViewer) {
            var ObjectViewerAddColumnContext = function(_super) {
                    __extends(ObjectViewerAddColumnContext, _super);
                    function ObjectViewerAddColumnContext(container, data, position) {
                        _super.call(this, container);
                        this._data = null;
                        this._name = null;
                        this._position = null;
                        this._hasFocus = ko.observable(!0);
                        this._data = data;
                        this._position = ko.observable(position);
                        this._name = ko.observable(this._generateDefaultName())
                    }
                    return Object.defineProperty(ObjectViewerAddColumnContext.prototype, "hasFocus", {
                            get: function() {
                                return this._hasFocus()
                            }, enumerable: !0, configurable: !0
                        }), ObjectViewerAddColumnContext.prototype.commit = function() {
                            this._data.addColumn(this._generateCommitName(), "s");
                            this._hasFocus(!1);
                            this._complete(!0)
                        }, ObjectViewerAddColumnContext.prototype.cancel = function() {
                                this._hasFocus(!1);
                                this._complete(!1)
                            }, Object.defineProperty(ObjectViewerAddColumnContext.prototype, "observableName", {
                                get: function() {
                                    return this._name
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(ObjectViewerAddColumnContext.prototype, "position", {
                                get: function() {
                                    return this._position()
                                }, set: function(newPosition) {
                                        this._position(newPosition)
                                    }, enumerable: !0, configurable: !0
                            }), ObjectViewerAddColumnContext.prototype.onKeyDown = function(data, evt) {
                                switch (evt.key) {
                                    case"Enter":
                                        return this.commit(), evt.stopPropagation(), !1;
                                    case"Esc":
                                        return this.cancel(), evt.stopPropagation(), !1
                                }
                                return !0
                            }, ObjectViewerAddColumnContext.prototype._generateDefaultName = function() {
                                return ObjectViewer.NumberedNameGenerator.create(AppMagic.AuthoringStrings.ObjectViewerControl_NewColumnName, 0, this._createValidNamePredicate())
                            }, ObjectViewerAddColumnContext.prototype._generateCommitName = function() {
                                var baseName = this._name().trim(),
                                    options = ObjectViewer.NumberedNameGeneratorOptions.includeBaseName;
                                return baseName === "" && (baseName = AppMagic.AuthoringStrings.ObjectViewerControl_NewColumnName, options = 0), ObjectViewer.NumberedNameGenerator.create(baseName, options, this._createValidNamePredicate())
                            }, ObjectViewerAddColumnContext.prototype._createValidNamePredicate = function() {
                                var schema = this._data.getSchema();
                                return function(name) {
                                        return !AppMagic.Schema.containsSchemaMember(schema, name)
                                    }
                            }, ObjectViewerAddColumnContext
                }(ObjectViewer.ObjectViewerEditContext);
            ObjectViewer.ObjectViewerAddColumnContext = ObjectViewerAddColumnContext
        })(ObjectViewer = AuthoringTool.ObjectViewer || (AuthoringTool.ObjectViewer = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ObjectViewer;
        (function(ObjectViewer) {
            var ObjectViewerColumn = function() {
                    function ObjectViewerColumn(name, type, invariantName) {
                        this._name = name;
                        this._type = type;
                        this._invariantName = invariantName || name
                    }
                    return Object.defineProperty(ObjectViewerColumn.prototype, "name", {
                            get: function() {
                                return this._name
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(ObjectViewerColumn.prototype, "invariantName", {
                            get: function() {
                                return this._invariantName
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(ObjectViewerColumn.prototype, "type", {
                                get: function() {
                                    return this._type
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(ObjectViewerColumn.prototype, "isAddColumn", {
                                get: function() {
                                    return this._type === "addcolumn"
                                }, enumerable: !0, configurable: !0
                            }), ObjectViewerColumn.createAddColumn = function() {
                                return new ObjectViewerColumn(AppMagic.AuthoringStrings.ObjectViewerControl_AddColumn, "addcolumn")
                            }, ObjectViewerColumn
                }();
            ObjectViewer.ObjectViewerColumn = ObjectViewerColumn;
            var ObjectViewerColumnMetrics = function() {
                    function ObjectViewerColumnMetrics(){}
                    return ObjectViewerColumnMetrics
                }();
            ObjectViewer.ObjectViewerColumnMetrics = ObjectViewerColumnMetrics
        })(ObjectViewer = AuthoringTool.ObjectViewer || (AuthoringTool.ObjectViewer = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ObjectViewer;
        (function(ObjectViewer) {
            var numAutoWidthSizedRows = 100,
                ObjectViewerData = function(_super) {
                    __extends(ObjectViewerData, _super);
                    function ObjectViewerData(data) {
                        var _this = this;
                        _super.call(this);
                        this._eventTracker = null;
                        this._data = null;
                        this._tableHeaders = ko.observableArray([]);
                        this._tableRows = ko.observableArray();
                        Contracts.checkObject(data);
                        this.track("_eventTracker", new AppMagic.Utility.EventTracker);
                        this._data = data;
                        this._tableHeaders(this._buildHeaders());
                        this._tableRows(this._buildRows());
                        this._eventTracker.add(data, ObjectViewer.ObjectViewerDataSourceEvents.columnchanged, function(evt) {
                            _this._onColumnChanged(evt.detail.name, evt.detail.type)
                        });
                        this._eventTracker.add(data, ObjectViewer.ObjectViewerDataSourceEvents.columnremoved, function(evt) {
                            _this._onColumnRemoved(evt.detail)
                        });
                        this._eventTracker.add(data, ObjectViewer.ObjectViewerDataSourceEvents.rowchanged, function(evt) {
                            _this._onRowChanged(evt.detail)
                        });
                        this._eventTracker.add(data, ObjectViewer.ObjectViewerDataSourceEvents.rowremoved, function(evt) {
                            _this._onRowRemoved(evt.detail)
                        })
                    }
                    return Object.defineProperty(ObjectViewerData.prototype, "canEdit", {
                            get: function() {
                                return this._data.canWrite
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(ObjectViewerData.prototype, "schema", {
                            get: function() {
                                return this._data.getSchema()
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(ObjectViewerData.prototype, "tableHeaders", {
                                get: function() {
                                    return this._tableHeaders()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(ObjectViewerData.prototype, "tableRows", {
                                get: function() {
                                    return this._tableRows()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(ObjectViewerData.prototype, "typeIndicatorLeft", {
                                get: function() {
                                    return this._data.isArray ? "[" : "{"
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(ObjectViewerData.prototype, "typeIndicatorRight", {
                                get: function() {
                                    return this._data.isArray ? "]" : "}"
                                }, enumerable: !0, configurable: !0
                            }), ObjectViewerData.prototype.createChildData = function(position) {
                                Contracts.checkObject(position);
                                var cell = this._getCellData(position),
                                    nestedData = this._data.getNestedData(cell.rowKey, cell.columnName);
                                return new ObjectViewerData(nestedData)
                            }, ObjectViewerData.prototype.addColumn = function(container, position) {
                                Contracts.checkObservable(container);
                                this._verifyCanWrite();
                                var context = new ObjectViewer.ObjectViewerAddColumnContext(container, this._data, position);
                                context.startAsync()
                            }, ObjectViewerData.prototype.editCell = function(container, position) {
                                var _this = this;
                                if (Contracts.checkObservable(container), Contracts.checkObject(position), this._verifyCanWrite(), !this._tableHeaders()[position.column].isAddColumn) {
                                    var cell = this._getCellData(position),
                                        editingPlaceholder = cell.rowKey === null;
                                    editingPlaceholder && (this._tableRows.splice(position.row, 1), cell.rowKey = this._data.addRow({}), position.row = this._findRowIndex(cell.rowKey));
                                    var context = new ObjectViewer.ObjectViewerEditCellContext(container, this._data, cell.rowKey, cell.columnName, position);
                                    context.startAsync().then(function() {
                                        editingPlaceholder && (_this._tableRows.push({}), _this.dispatchEvent(ObjectViewerData.events.rowadded, _this._tableRows().length - 1))
                                    })
                                }
                            }, ObjectViewerData.prototype.removeColumn = function(columnIndex) {
                                this._verifyCanWrite();
                                this._verifyDataColumnIndex(columnIndex);
                                this._data.removeColumn(this._tableHeaders()[columnIndex].name)
                            }, ObjectViewerData.prototype.removeRow = function(rowIndex) {
                                this._verifyCanWrite();
                                this._verifyDataRowIndex(rowIndex);
                                var row = this._tableRows()[rowIndex],
                                    rowKey = this._data.getRowKey(row);
                                this._data.deleteRow(rowKey)
                            }, ObjectViewerData.prototype.setColumnType = function(columnIndex, type) {
                                this._verifyCanWrite();
                                this._verifyDataColumnIndex(columnIndex);
                                this._data.setColumnType(this._tableHeaders()[columnIndex].name, type)
                            }, Object.defineProperty(ObjectViewerData.prototype, "columnTypes", {
                                get: function() {
                                    return this._data.columnTypes
                                }, enumerable: !0, configurable: !0
                            }), ObjectViewerData.prototype.getCellValue = function(position) {
                                this._assertPosition(position);
                                var cell = this._getCellData(position);
                                if (cell.row === null || !Core.Utility.isDefined(cell.row[cell.columnName]) && !Core.Utility.isDefined(cell.row.OpenAjax) || typeof cell.row.hasOwnProperty == "function" && !cell.row.hasOwnProperty(cell.columnName) && !Core.Utility.isDefined(cell.row.OpenAjax))
                                    return null;
                                var cellRowValue = cell.row.OpenAjax ? cell.row.OpenAjax.getPropertyValue(cell.columnName) : cell.row[cell.columnName];
                                return ObjectViewer.ObjectViewerTypeConverter.valueToString(cellRowValue, this._tableHeaders()[position.column].type)
                            }, ObjectViewerData.prototype.getFormatType = function(position) {
                                this._assertPosition(position);
                                var tableHeader = this._tableHeaders()[position.column];
                                if (tableHeader.isAddColumn)
                                    return "none";
                                var type = tableHeader.type,
                                    format,
                                    cellValue;
                                switch (type) {
                                    case"h":
                                        cellValue = this.getCellValue(position);
                                        format = typeof cellValue == "string" && AppMagic.Utility.isImageUrl(cellValue) ? "image" : "text";
                                        break;
                                    case"m":
                                        cellValue = this.getCellValue(position);
                                        format = typeof cellValue == "string" && cellValue.indexOf("blob:") === 0 ? "media" : "text";
                                        break;
                                    case"b":
                                    case"c":
                                    case"d":
                                    case"n":
                                    case"$":
                                    case"s":
                                        format = "text";
                                        break;
                                    case"i":
                                    case"p":
                                        format = "image";
                                        break;
                                    case"v":
                                    case"object":
                                    case"array":
                                        cellValue = this.getCellValue(position);
                                        format = cellValue !== null ? "button" : "text";
                                        break
                                }
                                return Contracts.checkNonEmpty(format, "Unknown type: " + type), format
                            }, ObjectViewerData.prototype.getImageSrc = function(position, element) {
                                this._assertPosition(position);
                                Contracts.checkValue(element);
                                var header = this._tableHeaders()[position.column];
                                if (header.type !== "i" && header.type !== "h" && header.type !== "p")
                                    return "";
                                var value = this.getCellValue(position);
                                return AppMagic.Utility.mediaUrlHelper(null, value, !1).then(function(src) {
                                        Contracts.checkStringOrNull(src);
                                        try {
                                            element.src = src
                                        }
                                        catch(e) {
                                            element.src = ""
                                        }
                                    }, function(){}), element.src
                            }, ObjectViewerData.prototype.measureColumn = function(headerIndex, measurer, initMaxTextWidth, widthFromDownCaretCaretMargin) {
                                Contracts.checkRange(headerIndex, 0, this._tableHeaders().length - 1);
                                Contracts.checkObject(measurer);
                                Contracts.checkNumber(initMaxTextWidth);
                                Contracts.checkNumber(widthFromDownCaretCaretMargin);
                                var constants = AppMagic.Constants.Controls.ObjectViewerControl,
                                    columnPadding = 2 * constants.GridCellHeaderPaddingLeftRightPixels,
                                    tableHeader = this._tableHeaders()[headerIndex],
                                    header = tableHeader.name,
                                    type = tableHeader.type,
                                    metrics = new ObjectViewer.ObjectViewerColumnMetrics;
                                metrics.headerTextLength = header.length;
                                metrics.headerWidth = measurer.measure(header).width;
                                var widthForHeader = metrics.headerWidth + widthFromDownCaretCaretMargin;
                                var type = tableHeader.type;
                                if (type === "i")
                                    metrics.totalWidth = constants.GridCellImageMaxWidthPixels + columnPadding;
                                else {
                                    if (type !== "object" && type !== "array")
                                        for (var rowIndex = 0, numRows = this._tableRows().length; rowIndex < numRows && rowIndex < numAutoWidthSizedRows && widthForHeader < initMaxTextWidth; rowIndex++) {
                                            var cellValue = this.getCellValue(new ObjectViewer.CellPosition(rowIndex, headerIndex));
                                            if (typeof cellValue != "undefined" && cellValue !== null && cellValue !== "") {
                                                var cellWidth = measurer.measure(cellValue.toString()).width;
                                                widthForHeader = Math.max(widthForHeader, cellWidth)
                                            }
                                        }
                                    metrics.totalWidth = Core.Utility.clamp(widthForHeader + columnPadding, constants.GridMinColWidthPixels, constants.GridInitialMaxColWidthPixels)
                                }
                                return metrics
                            }, ObjectViewerData.prototype._assertPosition = function(position) {
                                Contracts.checkObject(position);
                                Contracts.checkRange(position.column, 0, this._tableHeaders().length - 1);
                                Contracts.checkRange(position.row, 0, this._tableRows().length - 1)
                            }, ObjectViewerData.prototype._buildHeaders = function() {
                                for (var schema = this._data.getSchema(), propertiesSchema = schema.ptr, tableHeaders = [], i = 0, len = propertiesSchema.length; i < len; i++) {
                                    var header = propertiesSchema[i].name,
                                        invariantName = propertiesSchema[i].invariantName,
                                        type = propertiesSchema[i].type;
                                    Contracts.checkString(header);
                                    Contracts.checkNonEmpty(type);
                                    var column = new ObjectViewer.ObjectViewerColumn(header, type, invariantName);
                                    tableHeaders.push(column)
                                }
                                return this._data.canWrite && tableHeaders.push(ObjectViewer.ObjectViewerColumn.createAddColumn()), tableHeaders
                            }, ObjectViewerData.prototype._buildRows = function() {
                                var rows = this._data.getRows();
                                return this._data.canWrite && rows.push({}), rows
                            }, ObjectViewerData.prototype._getCellData = function(position) {
                                Contracts.checkObject(position);
                                var row = this._tableRows()[position.row],
                                    rowKey = this._data.getRowKey(row),
                                    columnName = this._tableHeaders()[position.column].invariantName;
                                return new CellData(position, row, rowKey, columnName)
                            }, ObjectViewerData.prototype._findRowIndex = function(rowKey) {
                                Contracts.checkNonEmpty(rowKey);
                                for (var i = 0, len = this._tableRows().length; i < len; i++) {
                                    var row = this._tableRows()[i];
                                    if (this._data.getRowKey(row) === rowKey)
                                        return i
                                }
                                return -1
                            }, ObjectViewerData.prototype._onColumnChanged = function(name, type) {
                                var _this = this;
                                Contracts.checkNonEmpty(name);
                                Contracts.checkNonEmpty(type);
                                this._tableHeaders().forEach(function(header) {
                                    header.name === name && (header.type = type, _this._tableHeaders.valueHasMutated())
                                });
                                var lastIndex = this._tableHeaders().length - 1,
                                    lastColumn = this._tableHeaders()[lastIndex],
                                    insertIndex = lastColumn.isAddColumn ? lastIndex : lastIndex + 1,
                                    column = new ObjectViewer.ObjectViewerColumn(name, type);
                                this._tableHeaders.splice(insertIndex, 0, column);
                                this.dispatchEvent(ObjectViewerData.events.columnadded, insertIndex)
                            }, ObjectViewerData.prototype._onColumnRemoved = function(name) {
                                Contracts.checkNonEmpty(name);
                                for (var i = 0, len = this._tableHeaders().length; i < len; i++) {
                                    var column = this._tableHeaders()[i];
                                    if (column.name === name) {
                                        this._tableHeaders.splice(i, 1);
                                        this.dispatchEvent(ObjectViewerData.events.columnremoved, i);
                                        return
                                    }
                                }
                                Contracts.check(!1, "Column doesn't exist.")
                            }, ObjectViewerData.prototype._onRowChanged = function(rowKey) {
                                Contracts.checkNonEmpty(rowKey);
                                var row = this._data.getRowByKey(rowKey),
                                    rowIndex = this._findRowIndex(rowKey);
                                if (rowIndex < 0) {
                                    var lastIndex = this._tableRows().length - 1,
                                        lastRowIsPlaceholder = lastIndex >= 0 && this._data.getRowKey(this._tableRows()[lastIndex]) === null,
                                        insertIndex = lastRowIsPlaceholder ? lastIndex : lastIndex + 1;
                                    this._tableRows.splice(insertIndex, 0, row);
                                    this.dispatchEvent(ObjectViewerData.events.rowadded, insertIndex)
                                }
                                else
                                    this._tableRows.splice(rowIndex, 1, row)
                            }, ObjectViewerData.prototype._onRowRemoved = function(rowKey) {
                                Contracts.checkNonEmpty(rowKey);
                                var rowIndex = this._findRowIndex(rowKey);
                                Contracts.check(rowIndex >= 0, "Row not found.");
                                this._tableRows.splice(rowIndex, 1);
                                this.dispatchEvent(ObjectViewerData.events.rowremoved, rowIndex)
                            }, ObjectViewerData.prototype._verifyCanWrite = function() {
                                Contracts.check(this._data.canWrite, "Data source is not writeable.")
                            }, ObjectViewerData.prototype._verifyDataColumnIndex = function(columnIndex) {
                                var lastValidIndex = this._tableHeaders().length - 1;
                                this._data.canWrite && lastValidIndex--;
                                Contracts.checkRange(columnIndex, 0, lastValidIndex)
                            }, ObjectViewerData.prototype._verifyDataRowIndex = function(rowIndex) {
                                var lastValidIndex = this._tableRows().length - 1;
                                this._data.canWrite && lastValidIndex--;
                                Contracts.checkRange(rowIndex, 0, lastValidIndex)
                            }, ObjectViewerData.empty = new ObjectViewerData(new ObjectViewer.MemoryObjectViewerDataSource({}, AppMagic.Schema.createSchemaForObjectFromPointer([]), !1)), ObjectViewerData.events = {
                                columnadded: "columnadded", columnremoved: "columnremoved", rowadded: "rowadded", rowremoved: "rowremoved"
                            }, ObjectViewerData
                }(AppMagic.Utility.Disposable);
            ObjectViewer.ObjectViewerData = ObjectViewerData;
            WinJS.Class.mix(ObjectViewerData, WinJS.Utilities.eventMixin);
            var CellData = function() {
                    function CellData(position, row, rowKey, columnName) {
                        Contracts.checkObject(position);
                        Contracts.checkDefined(row);
                        Contracts.checkStringOrNull(rowKey);
                        Contracts.checkNonEmpty(columnName);
                        this.position = position;
                        this.row = row;
                        this.rowKey = rowKey;
                        this.columnName = columnName
                    }
                    return CellData
                }()
        })(ObjectViewer = AuthoringTool.ObjectViewer || (AuthoringTool.ObjectViewer = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ObjectViewer;
        (function(ObjectViewer) {
            var ObjectViewerEditCellContext = function(_super) {
                    __extends(ObjectViewerEditCellContext, _super);
                    function ObjectViewerEditCellContext(container, data, rowKey, columnName, position) {
                        _super.call(this, container);
                        this._data = null;
                        this._rowKey = null;
                        this._columnName = null;
                        this._columnType = null;
                        this._position = null;
                        this._stringValue = ko.observable("");
                        this._data = data;
                        this._rowKey = rowKey;
                        this._columnName = columnName;
                        this._position = position;
                        var columnSchema = AppMagic.Schema.getSchemaOfProperty(data.getSchema(), columnName);
                        Contracts.checkObject(columnSchema);
                        this._columnType = columnSchema.type;
                        var row = data.getRowByKey(rowKey),
                            value = row[columnName];
                        Core.Utility.isDefined(value) || (value = null);
                        this._stringValue = ko.observable(ObjectViewer.ObjectViewerTypeConverter.valueToString(value, this._columnType))
                    }
                    return ObjectViewerEditCellContext.prototype.cancel = function() {
                            this._complete(!1)
                        }, ObjectViewerEditCellContext.prototype.commit = function() {
                            var row = this._data.getRowByKey(this._rowKey);
                            if (row) {
                                var value = ObjectViewer.ObjectViewerTypeConverter.stringToValue(this._stringValue(), this._columnType);
                                this._data.updateRowProperty(this._rowKey, this._columnName, value)
                            }
                            this._complete(!0)
                        }, Object.defineProperty(ObjectViewerEditCellContext.prototype, "position", {
                                get: function() {
                                    return this._position
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(ObjectViewerEditCellContext.prototype, "observableValue", {
                                get: function() {
                                    return this._stringValue
                                }, enumerable: !0, configurable: !0
                            }), ObjectViewerEditCellContext.prototype.onKeyDown = function(data, evt) {
                                switch (evt.key) {
                                    case"Enter":
                                        return this.commit(), evt.stopPropagation(), !1;
                                    case"Esc":
                                        return this.cancel(), evt.stopPropagation(), !1
                                }
                                return !0
                            }, ObjectViewerEditCellContext
                }(ObjectViewer.ObjectViewerEditContext);
            ObjectViewer.ObjectViewerEditCellContext = ObjectViewerEditCellContext
        })(ObjectViewer = AuthoringTool.ObjectViewer || (AuthoringTool.ObjectViewer = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ObjectViewer;
        (function(ObjectViewer) {
            var ObjectViewerTypeConverter = function() {
                    function ObjectViewerTypeConverter() {
                        Contracts.check(!1, "Static class.")
                    }
                    return ObjectViewerTypeConverter.valueToString = function(value, type) {
                            if (Contracts.checkNonEmpty(type), typeof value != "undefined" && AppMagic.Utility.isOpenAjaxControl(value))
                                return "[" + value.OpenAjax.getId() + "]";
                            switch (type) {
                                case"b":
                                    switch (value) {
                                        case!0:
                                            return AppMagic.Strings.True;
                                        case!1:
                                            return AppMagic.Strings.False
                                    }
                                    return "";
                                case"n":
                                    return typeof value != "number" ? "" : AppMagic.Functions.text(value);
                                case"c":
                                    return typeof value != "number" ? "" : AppMagic.Utility.Color.create(value).toRuleValue();
                                case"$":
                                    return typeof value != "number" ? "" : Microsoft.AppMagic.Common.LocalizationHelper.getFormattedCurrencyValue(value);
                                case"d":
                                    return AppMagic.Functions.text(typeof value != "number" ? null : value, "'shortdatetime'");
                                case"v":
                                case"object":
                                case"array":
                                    return value;
                                case"s":
                                case"h":
                                case"m":
                                case"i":
                                case"p":
                                    return typeof value != "string" ? "" : value;
                                default:
                                    return Contracts.check(!1, "Unsupported data type."), ""
                            }
                        }, ObjectViewerTypeConverter.stringToValue = function(value, type) {
                            Contracts.checkString(value);
                            Contracts.checkNonEmpty(type);
                            switch (type) {
                                case"b":
                                    switch (value.toLocaleLowerCase()) {
                                        case AppMagic.Strings.True.toLocaleLowerCase():
                                            return !0;
                                        case AppMagic.Strings.False.toLocaleLowerCase():
                                            return !1
                                    }
                                    return null;
                                case"n":
                                    return AppMagic.Functions.value(value);
                                case"s":
                                case"h":
                                    return value;
                                default:
                                    return Contracts.check(!1, "Unsupported data type."), ""
                            }
                        }, ObjectViewerTypeConverter
                }();
            ObjectViewer.ObjectViewerTypeConverter = ObjectViewerTypeConverter
        })(ObjectViewer = AuthoringTool.ObjectViewer || (AuthoringTool.ObjectViewer = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ObjectViewer;
        (function(ObjectViewer) {
            var numAutoWidthSizedCols = 100,
                ObjectViewerViewModel = function(_super) {
                    __extends(ObjectViewerViewModel, _super);
                    function ObjectViewerViewModel(viewerIndex, name, data, isShowingTypeConvertibleData) {
                        _super.call(this);
                        this._eventTracker = null;
                        this._textMeasurer = null;
                        this._viewerIndex = null;
                        this._name = null;
                        this._data = null;
                        this._addColumnContext = ko.observable(null);
                        this._editCellContext = ko.observable(null);
                        this._shownCellsInfo = ko.observable({
                            colsShown: [], rowsShown: [], addColumn: -1, placeholderRow: -1
                        });
                        this._widths = ko.observableArray([]);
                        this._heights = ko.observableArray([]);
                        this._widthHeap = null;
                        this._heightHeap = null;
                        this._isShowingTypeConvertibleData = !1;
                        this._columnContextMenu = new AuthoringTool.ContextMenuProvider;
                        this._rowContextMenu = new AuthoringTool.ContextMenuProvider;
                        Contracts.checkNumber(viewerIndex);
                        Contracts.checkNonEmpty(name);
                        Contracts.checkObject(data);
                        Contracts.checkBoolean(isShowingTypeConvertibleData);
                        this.track("_eventTracker", new AppMagic.Utility.EventTracker);
                        this._viewerIndex = viewerIndex;
                        this._name = name;
                        this.track("_data", data);
                        this._isShowingTypeConvertibleData = isShowingTypeConvertibleData;
                        this._setWidths(this._createZeroArray(data.tableHeaders.length));
                        this._setHeights(this._createZeroArray(data.tableRows.length));
                        this._columnCommands = data.columnTypes;
                        this._columnCommands.push({
                            name: AppMagic.AuthoringStrings.ObjectViewerControl_RemoveColumn, isRemoveColumn: !0
                        });
                        this._registerDataEvents()
                    }
                    return Object.defineProperty(ObjectViewerViewModel.prototype, "msGridColumnsStyle", {
                            get: function() {
                                var controls = AppMagic.Constants.Controls;
                                return controls.ObjectViewerControl.GridWidthResizerThicknessPixels - 1 + "px " + this._widths().join("px " + controls.ObjectViewerControl.GridWidthResizerThicknessPixels + "px ") + "px " + controls.ObjectViewerControl.GridWidthResizerThicknessPixels + "px 0px"
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(ObjectViewerViewModel.prototype, "msGridRowsStyle", {
                            get: function() {
                                var controls = AppMagic.Constants.Controls;
                                return this._heights().join("px " + controls.ObjectViewerControl.GridHeightResizerThicknessPixels + "px ") + "px " + controls.ObjectViewerControl.GridHeightResizerThicknessPixels + "px 0px"
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(ObjectViewerViewModel.prototype, "name", {
                                get: function() {
                                    return this._name
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(ObjectViewerViewModel.prototype, "data", {
                                get: function() {
                                    return this._data
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(ObjectViewerViewModel.prototype, "addColumnContext", {
                                get: function() {
                                    return this._addColumnContext()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(ObjectViewerViewModel.prototype, "editCellContext", {
                                get: function() {
                                    return this._editCellContext()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(ObjectViewerViewModel.prototype, "shownCellsInfo", {
                                get: function() {
                                    var shown = this._shownCellsInfo(),
                                        columnCount = this._data.tableHeaders.length,
                                        rowCount = this._data.tableRows.length;
                                    return shown.colsShown = shown.colsShown.filter(function(columnIndex) {
                                            return columnIndex < columnCount
                                        }), shown.rowsShown = shown.rowsShown.filter(function(rowIndex) {
                                            return rowIndex < rowCount
                                        }), shown
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(ObjectViewerViewModel.prototype, "isShowingTypeConvertibleData", {
                                get: function() {
                                    return this._isShowingTypeConvertibleData
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(ObjectViewerViewModel.prototype, "columnContextMenu", {
                                get: function() {
                                    return this._columnContextMenu
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(ObjectViewerViewModel.prototype, "rowContextMenu", {
                                get: function() {
                                    return this._rowContextMenu
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(ObjectViewerViewModel.prototype, "columnCommands", {
                                get: function() {
                                    return this._columnCommands
                                }, enumerable: !0, configurable: !0
                            }), ObjectViewerViewModel.prototype.getCellTemplate = function(position) {
                                return "object-viewer-control-grid-cell-" + this._data.getFormatType(position) + "-template"
                            }, ObjectViewerViewModel.prototype._createZeroArray = function(length) {
                                for (var array = new Array(length), i = 0; i < length; i++)
                                    array[i] = 0;
                                return array
                            }, ObjectViewerViewModel.prototype._setWidths = function(widths) {
                                Contracts.checkArray(widths);
                                Contracts.check(widths.length === this._data.tableHeaders.length);
                                this._widthHeap = new ObjectViewer.LengthHeap(widths);
                                this._widths(widths)
                            }, ObjectViewerViewModel.prototype.getColWidth = function(index) {
                                return Contracts.checkNumber(index), Contracts.checkRange(index, 0, this._widths().length - 1), this._widths()[index]
                            }, ObjectViewerViewModel.prototype.setColWidth = function(index, width) {
                                Contracts.checkNumber(index);
                                Contracts.checkRange(index, 0, this._widths().length - 1);
                                Contracts.checkNumber(width);
                                this._widthHeap.setLength(width, index);
                                this._widths()[index] = width;
                                this._widths.valueHasMutated()
                            }, ObjectViewerViewModel.prototype._setHeights = function(heights) {
                                Contracts.checkArray(heights);
                                Contracts.check(heights.length === this._data.tableRows.length);
                                this._heightHeap = new ObjectViewer.LengthHeap(heights);
                                this._heights(heights)
                            }, ObjectViewerViewModel.prototype.getRowHeight = function(index) {
                                return Contracts.checkNumber(index), Contracts.checkRange(index, 0, this._heights().length - 1), this._heights()[index]
                            }, ObjectViewerViewModel.prototype.setRowHeight = function(index, height) {
                                Contracts.checkNumber(index);
                                Contracts.checkRange(index, 0, this._heights().length - 1);
                                Contracts.checkNumber(height);
                                this._heightHeap.setLength(height, index);
                                this._heights()[index] = height;
                                this._heights.valueHasMutated()
                            }, ObjectViewerViewModel.prototype.createChildViewer = function(viewerIndex, position) {
                                var tableHeaders = this._data.tableHeaders[position.column];
                                Contracts.checkObject(tableHeaders);
                                var header = tableHeaders.name;
                                Contracts.checkNonEmpty(header);
                                var objectData = this._data.createChildData(position);
                                return new AppMagic.AuthoringTool.ObjectViewer.ObjectViewerViewModel(viewerIndex, header, objectData, this._isShowingTypeConvertibleData)
                            }, ObjectViewerViewModel.prototype.initializeSizes = function(measurer) {
                                Contracts.checkObject(measurer);
                                this._textMeasurer = measurer;
                                var headerIndex,
                                    numHeaders,
                                    rowIndex,
                                    numRows,
                                    widths = new Array(this._data.tableHeaders.length),
                                    tableHeaders = this._data.tableHeaders,
                                    tableRows = this._data.tableRows,
                                    totalChars = 0,
                                    totalLength = 0,
                                    dataHasImages = !1,
                                    constants = AppMagic.Constants.Controls.ObjectViewerControl,
                                    columnPadding = 2 * constants.GridCellHeaderPaddingLeftRightPixels,
                                    initMaxTextWidth = constants.GridInitialMaxColWidthPixels - columnPadding,
                                    widthFromDownCaretCaretMargin = 0;
                                for (this._isShowingTypeConvertibleData && (widthFromDownCaretCaretMargin = constants.GridHeaderDownCaretWidthPixels + constants.GridHeaderDownCaretMarginLeftPixels, initMaxTextWidth -= widthFromDownCaretCaretMargin), headerIndex = 0, numHeaders = tableHeaders.length; headerIndex < numHeaders && headerIndex < numAutoWidthSizedCols; headerIndex++) {
                                    var tableHeader = tableHeaders[headerIndex];
                                    dataHasImages = dataHasImages || tableHeader.type === "i";
                                    var metrics = this._data.measureColumn(headerIndex, measurer, initMaxTextWidth, widthFromDownCaretCaretMargin);
                                    totalChars += metrics.headerTextLength;
                                    totalLength += metrics.headerWidth;
                                    widths[headerIndex] = metrics.totalWidth
                                }
                                if (headerIndex < numHeaders)
                                    for (var averageLengthPerChar = totalLength / totalChars; headerIndex < numHeaders; headerIndex++)
                                        widths[headerIndex] = Math.max(constants.GridMinColWidthPixels, Math.ceil(tableHeaders[headerIndex].name.length * averageLengthPerChar));
                                this._setWidths(widths);
                                var heights;
                                if (dataHasImages) {
                                    var imageMaxHeight = constants.GridCellImageMaxHeightPixels,
                                        paddingTopBottomSum = 2 * constants.GridCellPaddingTopBottomPixels,
                                        initialRowHeight = imageMaxHeight + paddingTopBottomSum;
                                    heights = this._data.tableRows.map(function() {
                                        return initialRowHeight
                                    })
                                }
                                else
                                    heights = this._data.tableRows.map(function() {
                                        return constants.GridCellRowHeightPixels
                                    });
                                this._setHeights(heights)
                            }, ObjectViewerViewModel.prototype.realizeCells = function(beginPixelX, beginPixelY, width, height, resizerThicknessX, resizerThicknessY) {
                                Contracts.checkNumber(beginPixelX);
                                Contracts.checkNumber(beginPixelY);
                                Contracts.checkNumber(width);
                                Contracts.checkNumber(height);
                                Contracts.check(width >= 0);
                                Contracts.check(height >= 0);
                                Contracts.checkNumber(resizerThicknessX);
                                Contracts.checkNumber(resizerThicknessY);
                                var colBeginIndex = -1,
                                    numColsShown = 0,
                                    colInfo = this._widthHeap.getVisibleRange(beginPixelX, width, resizerThicknessX);
                                colBeginIndex = colInfo.beginIndex;
                                numColsShown = colInfo.numShown;
                                var rowBeginIndex = -1,
                                    numRowsShown = 0,
                                    rowInfo = this._heightHeap.getVisibleRange(beginPixelY, height, resizerThicknessY);
                                rowBeginIndex = rowInfo.beginIndex;
                                numRowsShown = rowInfo.numShown;
                                for (var colsShown = new Array(numColsShown), rowsShown = new Array(numRowsShown), i = 0, len = numColsShown; i < len; i++)
                                    colsShown[i] = i + colBeginIndex;
                                for (i = 0, len = numRowsShown; i < len; i++)
                                    rowsShown[i] = i + rowBeginIndex;
                                this._shownCellsInfo({
                                    colsShown: colsShown, rowsShown: rowsShown, addColumn: this._data.canEdit ? this._data.tableHeaders.length - 1 : -1, placeholderRow: this._data.canEdit ? this._data.tableRows.length - 1 : -1
                                })
                            }, ObjectViewerViewModel.prototype.onClickCell = function(position) {
                                Contracts.checkObject(position);
                                this._data.canEdit && this._data.editCell(this._editCellContext, position)
                            }, ObjectViewerViewModel.prototype.onClickCellArrayOrObject = function(position, evt) {
                                var _this = this;
                                Contracts.checkObject(position);
                                Contracts.checkObject(evt);
                                Contracts.check(function() {
                                    var shownCellsInfo = _this.shownCellsInfo,
                                        colsShown = shownCellsInfo.colsShown,
                                        rowsShown = shownCellsInfo.rowsShown;
                                    return Contracts.checkRange(position.column, colsShown[0], colsShown[colsShown.length - 1]), Contracts.checkRange(position.row, rowsShown[0], rowsShown[rowsShown.length - 1]), !0
                                }());
                                this.dispatchEvent(ObjectViewerViewModel.events.clickcellarrayorobject, {
                                    position: position, viewerIndex: this._viewerIndex, event: evt
                                })
                            }, ObjectViewerViewModel.prototype.onMSPointerDownResizeColWidth = function(colIndex, evt) {
                                Contracts.checkNumber(colIndex);
                                Contracts.checkObject(evt);
                                this.dispatchEvent(ObjectViewerViewModel.events.mspointerdownresizecolwidth, {
                                    index: colIndex, event: evt
                                })
                            }, ObjectViewerViewModel.prototype.onMSPointerDownResizeRowHeight = function(rowIndex, evt) {
                                Contracts.checkNumber(rowIndex);
                                Contracts.checkObject(evt);
                                this.dispatchEvent(ObjectViewerViewModel.events.mspointerdownresizerowheight, {
                                    index: rowIndex, event: evt
                                })
                            }, ObjectViewerViewModel.prototype.onClickGridHeader = function(headerIndex, clickEvent) {
                                Contracts.checkNumber(headerIndex);
                                Contracts.checkObject(clickEvent);
                                Contracts.checkRange(headerIndex, 0, this._data.tableHeaders.length - 1);
                                var column = this._data.tableHeaders[headerIndex];
                                if (column.isAddColumn) {
                                    var position = new ObjectViewer.CellPosition(0, this._data.tableHeaders.length - 1);
                                    this._data.addColumn(this._addColumnContext, position)
                                }
                                else
                                    this._data.canEdit ? this._columnContextMenu.show(clickEvent.currentTarget, "bottom", "right", headerIndex) : !this._data.canEdit && this.isShowingTypeConvertibleData && this.dispatchEvent(ObjectViewerViewModel.events.clickgridheader, {
                                        header: this._data.tableHeaders[headerIndex].name, event: clickEvent
                                    })
                            }, ObjectViewerViewModel.prototype.onColumnCommand = function(columnIndex, command) {
                                Contracts.checkRange(columnIndex, 0, this._data.tableHeaders.length - 1);
                                Contracts.check(this._data.canEdit, "Data source is not writeable.");
                                command.isRemoveColumn ? this._data.removeColumn(columnIndex) : this._data.setColumnType(columnIndex, command.type)
                            }, ObjectViewerViewModel.prototype.onRemoveRow = function(position) {
                                Contracts.checkObject(position);
                                this._data.removeRow(position.row)
                            }, ObjectViewerViewModel.prototype._registerDataEvents = function() {
                                this._eventTracker.add(this._data, ObjectViewer.ObjectViewerData.events.columnadded, this._onDataColumnAdded, this);
                                this._eventTracker.add(this._data, ObjectViewer.ObjectViewerData.events.columnremoved, this._onDataColumnRemoved, this);
                                this._eventTracker.add(this._data, ObjectViewer.ObjectViewerData.events.rowadded, this._onDataRowAdded, this);
                                this._eventTracker.add(this._data, ObjectViewer.ObjectViewerData.events.rowremoved, this._onDataRowRemoved, this)
                            }, ObjectViewerViewModel.prototype._onDataColumnAdded = function(evt) {
                                var insertIndex = evt.detail;
                                Contracts.checkRange(insertIndex, 0, this._widths().length);
                                var columnWidth = AppMagic.Constants.Controls.ObjectViewerControl.GridInitialMaxColWidthPixels;
                                if (this._textMeasurer) {
                                    var constants = AppMagic.Constants.Controls.ObjectViewerControl,
                                        widthFromDownCaretCaretMargin = constants.GridHeaderDownCaretWidthPixels + constants.GridHeaderDownCaretMarginLeftPixels;
                                    this._textMeasurer.showContainer();
                                    columnWidth = this._data.measureColumn(insertIndex, this._textMeasurer, AppMagic.Constants.Controls.ObjectViewerControl.GridInitialMaxColWidthPixels, widthFromDownCaretCaretMargin).totalWidth;
                                    this._textMeasurer.hideContainer()
                                }
                                this._widths.splice(insertIndex, 0, columnWidth);
                                this._widthHeap = new ObjectViewer.LengthHeap(this._widths());
                                this.dispatchEvent(ObjectViewerViewModel.events.datachanged)
                            }, ObjectViewerViewModel.prototype._onDataColumnRemoved = function(evt) {
                                var columnIndex = evt.detail;
                                Contracts.checkRange(columnIndex, 0, this._widths().length - 1);
                                this._widths.splice(columnIndex, 1);
                                this._widthHeap = new ObjectViewer.LengthHeap(this._widths());
                                this._addColumnContext() && (this._addColumnContext().position = new ObjectViewer.CellPosition(0, this._data.tableHeaders.length - 1));
                                this.dispatchEvent(ObjectViewerViewModel.events.datachanged)
                            }, ObjectViewerViewModel.prototype._onDataRowAdded = function(evt) {
                                var insertIndex = evt.detail;
                                Contracts.checkRange(insertIndex, 0, this._heights().length);
                                this._heights.splice(insertIndex, 0, AppMagic.Constants.Controls.ObjectViewerControl.GridCellRowHeightPixels);
                                this._heightHeap = new ObjectViewer.LengthHeap(this._heights());
                                this.dispatchEvent(ObjectViewerViewModel.events.datachanged)
                            }, ObjectViewerViewModel.prototype._onDataRowRemoved = function(evt) {
                                var rowIndex = evt.detail;
                                Contracts.checkRange(rowIndex, 0, this._heights().length - 1);
                                this._heights.splice(rowIndex, 1);
                                this._heightHeap = new ObjectViewer.LengthHeap(this._heights());
                                this.dispatchEvent(ObjectViewerViewModel.events.datachanged)
                            }, ObjectViewerViewModel.events = {
                                clickcellarrayorobject: "clickcellarrayorobject", clickgridheader: "clickgridheader", datachanged: "datachanged", mspointerdownresizecolwidth: "mspointerdownresizecolwidth", mspointerdownresizerowheight: "mspointerdownresizerowheight", notifyshow: "notifyshow"
                            }, ObjectViewerViewModel.NumberOfPreviewRows = 5, ObjectViewerViewModel
                }(AppMagic.Utility.Disposable);
            ObjectViewer.ObjectViewerViewModel = ObjectViewerViewModel;
            WinJS.Class.mix(ObjectViewerViewModel, WinJS.Utilities.eventMixin)
        })(ObjectViewer = AuthoringTool.ObjectViewer || (AuthoringTool.ObjectViewer = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ViewModels;
        (function(ViewModels) {
            var Util = AppMagic.Utility,
                RuleCategoryHelper = function() {
                    function RuleCategoryHelper(){}
                    return RuleCategoryHelper.addRuleToGroup = function(group, rule, groupRulesMap) {
                            groupRulesMap[group] || (groupRulesMap[group] = {
                                id: group, rules: []
                            });
                            groupRulesMap[group].rules.push(rule)
                        }, RuleCategoryHelper.createGroups = function(groupRulesMap) {
                            var groups = [];
                            for (var groupName in groupRulesMap) {
                                var group = groupRulesMap[groupName],
                                    groupInfo = Util.getPropertyGroupInfo(group.id);
                                groups.push({
                                    id: group.id, displayName: groupInfo.displayName, position: groupInfo.position, rules: group.rules
                                })
                            }
                            return groups.sort(Util.propertyGroupComparator), groups
                        }, RuleCategoryHelper
                }();
            ViewModels.RuleCategoryHelper = RuleCategoryHelper
        })(ViewModels = AuthoringTool.ViewModels || (AuthoringTool.ViewModels = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ViewModels;
        (function(ViewModels) {
            var RuleFactory = function() {
                    function RuleFactory(intellisense, ruleValueFactory) {
                        this._intellisense = null;
                        this._ruleValueFactory = null;
                        this._intellisense = intellisense;
                        this._ruleValueFactory = ruleValueFactory
                    }
                    return RuleFactory.prototype.create = function(doc, control, property, initialRule) {
                            return new AppMagic.AuthoringTool.ViewModels.SingleRuleViewModel(doc, control, this._ruleValueFactory, this._intellisense, property, initialRule)
                        }, RuleFactory.prototype.createMultiple = function(doc, control, property, sharedRules) {
                            return new AppMagic.AuthoringTool.ViewModels.MultipleRuleViewModel(doc, control, property, this._ruleValueFactory, this._intellisense, sharedRules)
                        }, RuleFactory
                }();
            ViewModels.RuleFactory = RuleFactory
        })(ViewModels = AuthoringTool.ViewModels || (AuthoringTool.ViewModels = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ObjectViewer;
        (function(ObjectViewer) {
            var ServiceObjectViewerDataSource = function() {
                    function ServiceObjectViewerDataSource(provider) {
                        this._provider = provider
                    }
                    return ServiceObjectViewerDataSource.prototype.addRow = function(row) {
                            var key = this._provider.addRow(row);
                            return this.dispatchEvent(ObjectViewer.ObjectViewerDataSourceEvents.rowchanged, key), key
                        }, ServiceObjectViewerDataSource.prototype.updateRowProperty = function(key, propertyName, value) {
                            this._provider.editRowProperty(key, propertyName, value);
                            this.dispatchEvent(ObjectViewer.ObjectViewerDataSourceEvents.rowchanged, key)
                        }, ServiceObjectViewerDataSource.prototype.deleteRow = function(key) {
                                this._provider.removeRow(key);
                                this.dispatchEvent(ObjectViewer.ObjectViewerDataSourceEvents.rowremoved, key)
                            }, ServiceObjectViewerDataSource.prototype.getRowByKey = function(key) {
                                return this._provider.getRowByHandle(key)
                            }, ServiceObjectViewerDataSource.prototype.getRowKey = function(row) {
                                return row === null ? null : this._provider.getRowHandle(row)
                            }, ServiceObjectViewerDataSource.prototype.getRows = function() {
                                return this._provider.getDataWithRowHandles()
                            }, ServiceObjectViewerDataSource.prototype.getSchema = function() {
                                return this._provider.schema
                            }, ServiceObjectViewerDataSource.prototype.getNestedData = function(key, column) {
                                throw"Not supported.";
                                return null
                            }, Object.defineProperty(ServiceObjectViewerDataSource.prototype, "isArray", {
                                get: function() {
                                    return !0
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(ServiceObjectViewerDataSource.prototype, "canWrite", {
                                get: function() {
                                    return !0
                                }, enumerable: !0, configurable: !0
                            }), ServiceObjectViewerDataSource.prototype.addColumn = function(name, type) {
                                var schema = this._provider.schema;
                                AppMagic.Schema.addSchemaMember(schema, name, type);
                                this._provider.setSchema(schema);
                                this.dispatchEvent(ObjectViewer.ObjectViewerDataSourceEvents.columnchanged, {
                                    name: name, type: type
                                })
                            }, ServiceObjectViewerDataSource.prototype.removeColumn = function(name) {
                                var schema = this._provider.schema;
                                AppMagic.Schema.removeSchemaMember(schema, name);
                                this._provider.setSchema(schema);
                                this.dispatchEvent(ObjectViewer.ObjectViewerDataSourceEvents.columnremoved, name)
                            }, ServiceObjectViewerDataSource.prototype.setColumnType = function(name, type) {
                                var _this = this;
                                var schema = this._provider.schema,
                                    columnSchema = AppMagic.Schema.getSchemaOfProperty(schema, name);
                                Contracts.checkObject(columnSchema, "Column doesn't exist.");
                                columnSchema.type = type;
                                this._provider.setSchema(schema);
                                this._provider.forEachRowHandle(function(rowHandle) {
                                    _this.dispatchEvent(ObjectViewer.ObjectViewerDataSourceEvents.rowchanged, rowHandle)
                                })
                            }, Object.defineProperty(ServiceObjectViewerDataSource.prototype, "columnTypes", {
                                get: function() {
                                    return [{
                                                name: AppMagic.AuthoringStrings.DTypeBoolean, type: "b"
                                            }, {
                                                name: AppMagic.AuthoringStrings.DTypeNumber, type: "n"
                                            }, {
                                                name: AppMagic.AuthoringStrings.DTypeText, type: "s"
                                            }, {
                                                name: AppMagic.AuthoringStrings.DTypeHyperlink, type: "h"
                                            }, ]
                                }, enumerable: !0, configurable: !0
                            }), ServiceObjectViewerDataSource
                }();
            ObjectViewer.ServiceObjectViewerDataSource = ServiceObjectViewerDataSource;
            WinJS.Class.mix(ServiceObjectViewerDataSource, WinJS.Utilities.eventMixin)
        })(ObjectViewer = AuthoringTool.ObjectViewer || (AuthoringTool.ObjectViewer = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Entities;
    (function(Entities) {
        var RuleUpdateContext = function(_super) {
                __extends(RuleUpdateContext, _super);
                function RuleUpdateContext(visual) {
                    _super.call(this);
                    this._visual = null;
                    this.track("_eventTracker", new AppMagic.Utility.EventTracker);
                    this._visual = visual
                }
                return RuleUpdateContext.prototype.addRuleUserEditHandler = function(propertyName, handler) {
                        Contracts.checkNonEmpty(propertyName);
                        Contracts.checkFunction(handler);
                        var rule = this._visual.getRuleByPropertyInvariantName(propertyName);
                        this._eventTracker.add(rule, "rhsUserEditChanged", handler)
                    }, RuleUpdateContext.prototype.getRule = function(propertyName) {
                        return Contracts.checkNonEmpty(propertyName), this._visual.getRuleByPropertyInvariantName(propertyName).rhs
                    }, RuleUpdateContext.prototype.setRule = function(propertyName, localizedExpression) {
                            Contracts.checkNonEmpty(propertyName);
                            Contracts.checkString(localizedExpression);
                            this._visual.setRuleInvariant(propertyName, localizedExpression)
                        }, Object.defineProperty(RuleUpdateContext.prototype, "containerSize", {
                            get: function() {
                                return this._visual.bounds.containerSize
                            }, enumerable: !0, configurable: !0
                        }), RuleUpdateContext
            }(AppMagic.Utility.Disposable);
        Entities.RuleUpdateContext = RuleUpdateContext
    })(Entities = AppMagic.Entities || (AppMagic.Entities = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Entities;
    (function(Entities) {
        var RuleUpdateManager = function(_super) {
                __extends(RuleUpdateManager, _super);
                function RuleUpdateManager(entityManager) {
                    _super.call(this);
                    this._updaters = {};
                    this.track("_eventTracker", new AppMagic.Utility.EventTracker);
                    this._eventTracker.add(entityManager, "visualadded", this._onVisualAdded, this)
                }
                return RuleUpdateManager.prototype.addUpdater = function(updaterType) {
                        var collection = this._updaters[updaterType.templateName];
                        collection || (collection = this._updaters[updaterType.templateName] = new RuleUpdaterCollection);
                        collection.addUpdater(updaterType)
                    }, RuleUpdateManager.prototype._onVisualAdded = function(evt) {
                        var visual = evt.detail.visual;
                        var collection = this._updaters[visual.templateName];
                        collection && collection.notifyVisualAdded(visual);
                        collection = this._updaters[""];
                        collection && collection.notifyVisualAdded(visual)
                    }, RuleUpdateManager
            }(AppMagic.Utility.Disposable);
        Entities.RuleUpdateManager = RuleUpdateManager;
        var RuleUpdaterCollection = function() {
                function RuleUpdaterCollection() {
                    this._updaters = []
                }
                return RuleUpdaterCollection.prototype.addUpdater = function(updaterType) {
                        this._updaters.push(updaterType)
                    }, RuleUpdaterCollection.prototype.notifyVisualAdded = function(visual) {
                        this._updaters.forEach(function(updaterType) {
                            var context = new Entities.RuleUpdateContext(visual),
                                updater = new updaterType(context);
                            visual.addUpdater(updater)
                        })
                    }, RuleUpdaterCollection
            }()
    })(Entities = AppMagic.Entities || (AppMagic.Entities = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var MarkupService;
    (function(MarkupService) {
        var FileSystemMarkupService = function() {
                function FileSystemMarkupService(){}
                return FileSystemMarkupService.prototype.injectMarkup = function(uri) {
                        return WinJS.UI.Fragments.renderCopy(this._getAbsoluteUri(uri)).then(function(markup) {
                                var script = document.createElement("script");
                                script.type = "text/html";
                                script.appendChild(markup);
                                document.head.appendChild(script)
                            })
                    }, FileSystemMarkupService.prototype.associateView = function(uri, viewConstructor) {
                        WinJS.UI.Pages.define(uri, {ready: function(element) {
                                new viewConstructor(element)
                            }})
                    }, FileSystemMarkupService.prototype.render = function(uri, element) {
                            var _this = this;
                            var completionFunction = null,
                                promise = new WinJS.Promise(function(complete) {
                                    completionFunction = complete
                                }),
                                Ctor = WinJS.UI.Pages.get(uri);
                            return new Ctor(element, {uri: uri}, function(page) {
                                    _this.addReadyCompletePromise(page);
                                    page.readyComplete.then(function() {
                                        completionFunction(!0)
                                    })
                                }), promise.then(function() {
                                    return element
                                })
                        }, FileSystemMarkupService.prototype.addReadyCompletePromise = function(page) {
                            var prototype = Object.getPrototypeOf(page);
                            typeof prototype._innerReady == "undefined" && (prototype._innerReady = prototype.ready, prototype.ready = function(element, options) {
                                this._innerReady(element, options);
                                this._readyComplete()
                            });
                            page.readyComplete = new WinJS.Promise(function(complete, error) {
                                page._readyComplete = complete
                            })
                        }, FileSystemMarkupService.prototype._getAbsoluteUri = function(uri) {
                            var a = document.createElement("a");
                            return a.href = uri, a.href.toLowerCase()
                        }, FileSystemMarkupService
            }();
        MarkupService.FileSystemMarkupService = FileSystemMarkupService
    })(MarkupService = AppMagic.MarkupService || (AppMagic.MarkupService = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var appLoc = Windows.ApplicationModel.Package.current.installedLocation,
            FileSystemServiceImporter = function() {
                function FileSystemServiceImporter(){}
                return FileSystemServiceImporter.prototype._readFile = function(file) {
                        return Windows.Storage.FileIO.readTextAsync(file)
                    }, FileSystemServiceImporter.prototype._loadPackage = function(folder) {
                        return folder.getFileAsync("package.json")
                    }, FileSystemServiceImporter.prototype.getServiceDefinitions = function() {
                            return WinJS.Promise.join([this._getServiceDefinition("rss"), this._getServiceDefinition("AzureMobile"), this._getServiceDefinition("SharePoint"), this._getServiceDefinition("rest")])
                        }, FileSystemServiceImporter.prototype._getServiceDefinition = function(serviceName) {
                            return appLoc.getFolderAsync("services\\" + serviceName).then(this._loadPackage).then(this._readFile).then(function(fileContents) {
                                    return WinJS.Promise.wrap(JSON.parse(fileContents))
                                })
                        }, FileSystemServiceImporter
            }();
        Services.FileSystemServiceImporter = FileSystemServiceImporter
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
AppMagic.Services.CookieManager.instance = new AppMagic.Services.WindowsCookieManager;
AppMagic.Services.Importer.instance = new AppMagic.Services.FileSystemServiceImporter;
AppMagic.Settings.instance = new AppMagic.Settings.WindowsSettingsProvider;
AppMagic.MarkupService.instance = new AppMagic.MarkupService.FileSystemMarkupService;
AppMagic.DynamicDataSource.instance = new AppMagic.DynamicDataSource.WindowsDynamicDataSourceFactory;
AppMagic.Encryption.instance = new AppMagic.Encryption.WindowsEncryptionProvider;
AppMagic.DocumentLayout.instance = new AppMagic.AuthoringTool.DocumentLayoutManager;
AppMagic.ConnectionStatusProvider.instance = new AppMagic.ConnectionStatusProvider.AuthoringConnectionStatusProvider;
AppMagic.Services.AuthenticationBrokerManagerFactory.instance = new AppMagic.Services.WindowsAuthenticationBrokerManagerFactory(new AppMagic.Services.WebViewAuthenticationBroker, new AppMagic.Services.WindowsAuthenticationBroker({forceAzureFormsAuth: !0}), AppMagic.ConnectionStatusProvider.instance);
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Authoring;
    (function(Authoring) {
        var Services;
        (function(Services) {
            var CloudTable;
            (function(CloudTable) {
                var CloudTableDataSourceProviderPreparer = function() {
                        function CloudTableDataSourceProviderPreparer(dispatcher) {
                            this._dispatcher = dispatcher;
                            this._cloudTableWorkerController = new AppMagic.Services.CloudTableWorkerController(this._dispatcher)
                        }
                        return CloudTableDataSourceProviderPreparer.prototype.createProviderReadyState = function(unreadyState, detail) {
                                return this._cloudTableWorkerController.createCloudTableWithUniqueName(CloudTableDataSourceProviderPreparer.DefaultSuggestedTableName, unreadyState.accountName, unreadyState.baseUri, unreadyState.accountResource, unreadyState.keyBase64).then(function(response) {
                                        if (response.success) {
                                            var readyState = AppMagic.Utility.jsonClone(unreadyState);
                                            return readyState.tableName = response.result, WinJS.Promise.wrap({
                                                    success: !0, internalConfiguration: readyState
                                                })
                                        }
                                        else
                                            return WinJS.Promise.wrap({
                                                    success: !1, internalConfiguration: null
                                                })
                                    })
                            }, CloudTableDataSourceProviderPreparer.DefaultSuggestedTableName = "SienaCloudTable", CloudTableDataSourceProviderPreparer
                    }();
                CloudTable.CloudTableDataSourceProviderPreparer = CloudTableDataSourceProviderPreparer
            })(CloudTable = Services.CloudTable || (Services.CloudTable = {}))
        })(Services = Authoring.Services || (Authoring.Services = {}))
    })(Authoring = AppMagic.Authoring || (AppMagic.Authoring = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Authoring;
    (function(Authoring) {
        var Services;
        (function(Services) {
            var RestServiceTemplateBuilder = function() {
                    function RestServiceTemplateBuilder(dictionaryTemplate, importedService) {
                        this._dictionaryTemplate = dictionaryTemplate;
                        this._importedService = importedService
                    }
                    return RestServiceTemplateBuilder.prototype.buildServiceTemplate = function() {
                            var svcTmpl = new Microsoft.AppMagic.Authoring.ServiceTemplate("meta", this._dictionaryTemplate, this._importedService.hasAuthentication);
                            return this._addFunctionTemplatesToServiceTemplate(svcTmpl, this._dictionaryTemplate), svcTmpl
                        }, RestServiceTemplateBuilder.prototype._addFunctionTemplatesToServiceTemplate = function(serviceTemplate, dictionaryTemplate) {
                            var _this = this,
                                fns = this._importedService.controller.functions;
                            fns.forEach(function(fn) {
                                var fnTmpl,
                                    fnDocId = fn.docId;
                                fnTmpl = fnDocId === null ? new Microsoft.AppMagic.Authoring.ServiceFunctionTemplate(fn.name, fn.schemaString, fn.isBehaviorOnly) : new Microsoft.AppMagic.Authoring.ServiceFunctionTemplate(fn.name, fn.schemaString, fn.isBehaviorOnly, fnDocId);
                                fn.serviceFunction.parameters.forEach(function(parameter) {
                                    _this._addArgumentToFunctionTemplate(fnTmpl, dictionaryTemplate, parameter)
                                });
                                var success = serviceTemplate.addFunction(fnTmpl)
                            })
                        }, RestServiceTemplateBuilder.prototype._addArgumentToFunctionTemplate = function(functionTemplate, dictionaryTemplate, parameter) {
                                var valueSchema = parameter.getSchema(AppMagic.Services.Meta.RESTWorkerController.MaxSchemaDepth),
                                    schemaString = AppMagic.Schema.getSchemaString(valueSchema);
                                var isOptional = !parameter.isRequired,
                                    success;
                                if (parameter.docId === null)
                                    success = parameter.defaultValue === null ? functionTemplate.addArgument(parameter.name, schemaString, isOptional, parameter.options) : functionTemplate.addArgument(parameter.name, schemaString, isOptional, parameter.options, parameter.defaultValue);
                                else {
                                    var paramDescription = dictionaryTemplate.getLocaleSpecificTitleOrDefault(parameter.docId, "");
                                    success = parameter.defaultValue === null ? functionTemplate.addArgument(parameter.name, schemaString, isOptional, parameter.options, paramDescription, parameter.docId) : functionTemplate.addArgument(parameter.name, schemaString, isOptional, parameter.options, parameter.defaultValue, paramDescription, parameter.docId)
                                }
                            }, RestServiceTemplateBuilder
                }();
            Services.RestServiceTemplateBuilder = RestServiceTemplateBuilder
        })(Services = Authoring.Services || (Authoring.Services = {}))
    })(Authoring = AppMagic.Authoring || (AppMagic.Authoring = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var Shortcuts;
        (function(Shortcuts) {
            var ShortcutUtility = function() {
                    function ShortcutUtility(){}
                    return ShortcutUtility.isEditableContent = function() {
                            var activeElement = document.activeElement;
                            return activeElement && !activeElement.isContentEditable && !(activeElement.tagName === "INPUT" || activeElement.tagName === "SELECT")
                        }, ShortcutUtility
                }();
            Shortcuts.ShortcutUtility = ShortcutUtility
        })(Shortcuts = AuthoringTool.Shortcuts || (AuthoringTool.Shortcuts = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation. All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ViewModels;
        (function(ViewModels) {
            var ControlTemplateExtensions = AppMagic.AuthoringTool.Extensions.ControlTemplate,
                SingleRuleViewModel = function(_super) {
                    __extends(SingleRuleViewModel, _super);
                    function SingleRuleViewModel(doc, control, ruleValueFactory, intellisense, property, initialRule) {
                        _super.call(this, doc, control, property, ruleValueFactory, intellisense);
                        this._intermediateNameMap = null;
                        this._loopOverSinksComplete = null;
                        this._defaultValue = null;
                        this._delayFirePromise = null;
                        this._docNameMap = null;
                        this._documentErrors = [];
                        this._errorMessage = null;
                        this._hasDocumentErrors = null;
                        this._hasRuntimeErrors = null;
                        this._propertyName = null;
                        this._inReset = !1;
                        this._isAsyncGetter = null;
                        this._lastProcessedRuntimeId = -1;
                        this._nameMap = null;
                        this._nameMapSinks = null;
                        this._rule = null;
                        this._runtimeErrors = [];
                        this._sampleDataSourceName = null;
                        this._shouldCommit = !0;
                        this._valueTypeString = "";
                        this._valueTypeStringExceptError = "";
                        this._textSpanGetterForTest = null;
                        this._intermediateNameMap = null;
                        this._loopOverSinksComplete = !0;
                        this._propertyName = property.propertyName;
                        this.trackObservable("_rule", ko.observable(initialRule));
                        this._tryUpdatePropertyForVariantControls();
                        this._nameMapSinks = this._getNameMapSinks();
                        this._nameMap = this._createNameMap(initialRule);
                        initialRule && this._rhs(initialRule.script);
                        this._defaultValue = this._getPropertyDefaultValue();
                        this.trackObservable("_errorMessage", ko.observable(null));
                        this.trackObservable("_hasDocumentErrors", ko.observable(!1));
                        this.trackObservable("_hasRuntimeErrors", ko.observable(!1));
                        this._updateDocumentErrors();
                        initialRule && this._eventTracker.add(initialRule, "invalidated", this._onRuleInvalidated, this);
                        this.trackAnonymous(this._rhs.subscribe(function() {
                            if (this._shouldCommit) {
                                this._document.undoManager.createGroup("Commit Rule for Property : " + this._propertyName);
                                try {
                                    this._commitText()
                                }
                                finally {
                                    this._document.undoManager.closeGroup()
                                }
                            }
                        }, this));
                        this._setPresentationValue();
                        this._hasSampleData = this._property.hasSampleData;
                        this._sampleDataSourceName = this._hasSampleData ? this._property.sampleDataSourceName : ""
                    }
                    return SingleRuleViewModel.prototype._tryUpdatePropertyForVariantControls = function() {
                            if (this._control.isVariant) {
                                var result = this._control.template.tryGetControlVariant(this._control.variantName);
                                if (result.value) {
                                    var variant = result.controlVariant,
                                        propertyResult = variant.tryGetPropertyInvariant(this._propertyName);
                                    propertyResult.value && (this._property = propertyResult.property)
                                }
                            }
                        }, SingleRuleViewModel.prototype._getPropertyDefaultValue = function() {
                            var defaultValue = this._property.isExpr ? this._property.defaultValue.replace(/%CONTROL\.ID%/g, this._control.name) : this._property.defaultValue;
                            return Microsoft.AppMagic.Common.LocalizationHelper.convertToLocaleSpecific(defaultValue, this._document)
                        }, Object.defineProperty(SingleRuleViewModel.prototype, "_isAsync", {
                                get: function() {
                                    return this._isAsyncGetter ? this._isAsyncGetter() : this._rhs() !== "" && this._rule() !== null && this._rule().isAsync
                                }, enumerable: !0, configurable: !0
                            }), SingleRuleViewModel.prototype._addControlRule = function(ruleScript, ruleAdditionCategory) {
                                var nameMapGenerated = !1,
                                    ruleAddSuccessful;
                                return this._docNameMap || this.category !== Microsoft.AppMagic.Authoring.PropertyRuleCategory.data || (nameMapGenerated = !0, ruleAdditionCategory |= Microsoft.AppMagic.Authoring.RuleAdditionCategories.generateMapping), ruleAddSuccessful = this._control.addRule(this._propertyName, ruleScript, this.category, this._docNameMap, ruleAdditionCategory), {
                                            ruleAddSuccessful: ruleAddSuccessful, nameMapGenerated: nameMapGenerated
                                        }
                            }, SingleRuleViewModel.prototype._addToDocument = function() {
                                var ruleAdditionCategory = Microsoft.AppMagic.Authoring.RuleAdditionCategories.overwriteExisting;
                                this._isAsync && (ruleAdditionCategory |= Microsoft.AppMagic.Authoring.RuleAdditionCategories.analysisOnly);
                                var result = this._addControlRule(this._rhs(), ruleAdditionCategory);
                                var nameMapGenerated = result.nameMapGenerated;
                                result = this._control.tryGetRule(this._propertyName);
                                nameMapGenerated && result.rule.nameMap && (this._docNameMap = result.rule.nameMap);
                                this._updateRule(result.rule)
                            }, SingleRuleViewModel.prototype._tryRefreshRule = function(ruleScript) {
                                var result = this._control.tryGetRule(this._propertyName);
                                if (result.value && this._rhs() === ruleScript && this._isSameAsDocRule(result.rule, ruleScript, this._nameMap, this._nameMapSinks))
                                    var ruleRefreshSuccessful = this._control.tryRefreshRule(this._propertyName)
                            }, SingleRuleViewModel.prototype._commitText = function() {
                                var result = this._control.tryGetRule(this._propertyName);
                                if (this._resetRuntimeError(), this._cancelDelayFiring(), this._rhs().length > 0) {
                                    if (!result.value || !this._isSameAsDocRule(result.rule, this._rhs(), this._nameMap, this._nameMapSinks)) {
                                        var wasRuleAsync = this._isAsync;
                                        this._document.undoManager.createGroup("Add rule group");
                                        this._addToDocument();
                                        var isCurrentRuleAsync = this._isAsync;
                                        if (wasRuleAsync) {
                                            var ruleScript = this._rhs();
                                            this._controlPropertyState != null && !this._controlPropertyState.autoBindingEnabled && isCurrentRuleAsync ? this._delayFirePromise = WinJS.Promise.timeout(AppMagic.AuthoringTool.ViewModels.SingleRuleViewModel.DelayFireTimeOutInMilliSeconds).then(this._tryRefreshRule.bind(this, ruleScript), function(){}) : this._tryRefreshRule(ruleScript)
                                        }
                                        this._document.undoManager.closeGroup()
                                    }
                                }
                                else
                                    result.value && this._control.removeRule(this._propertyName),
                                    this._updateRule(null)
                            }, SingleRuleViewModel.prototype._isSameAsDocRule = function(rule, rhs, nameMap, nameMapSinks) {
                                if (rule.script !== rhs)
                                    return !1;
                                if (nameMap === null)
                                    return !0;
                                if (rule.nameMap === null)
                                    return !1;
                                var vmNameMapLen = nameMapSinks.length,
                                    docNameMapLen = rule.nameMap.sinkCount;
                                if (vmNameMapLen !== docNameMapLen)
                                    return !1;
                                for (var i = 0, len = vmNameMapLen; i < len; i++) {
                                    var sink = nameMapSinks[i].name,
                                        source = rule.nameMap.tryMapSinkToSource(sink).mappedName,
                                        nameMapSource = nameMap[sink];
                                    if (nameMapSource.source() !== source)
                                        return !1
                                }
                                return !0
                            }, SingleRuleViewModel.prototype._getNameMapSinks = function() {
                                var sinks = [];
                                if (!this._property.isEnum)
                                    for (var sinkIt = this._property.getColumnsAndInvariants().first(); sinkIt.hasCurrent; sinkIt.moveNext())
                                        sinks.push({
                                            name: sinkIt.current.key, invariantName: sinkIt.current.value
                                        });
                                return sinks
                            }, SingleRuleViewModel.prototype._getSinkType = function(sinkName) {
                                return this._property.getSubPropertyType(sinkName)
                            }, SingleRuleViewModel.prototype._handleDocClick = function(evt) {
                                if (typeof evt.target.className != "string" || evt.target.className.indexOf("sources") < 0 && evt.target.className.indexOf("sourceItem") < 0 && evt.target.className.indexOf("sourceText") < 0 && evt.target.className.indexOf("dropArrow") < 0 && evt.target.className.indexOf("dropArrowImg") < 0)
                                    for (var nameMapSink in this._nameMap)
                                        this._nameMap[nameMapSink].sourcesVisible(!1)
                            }, SingleRuleViewModel.prototype._hasErrors = function() {
                                return this._hasDocumentErrors() || this._hasRuntimeErrors()
                            }, SingleRuleViewModel.prototype._updateDocumentErrors = function() {
                                if (!this._hasRuntimeErrors()) {
                                    for (var oldHasErrors = this._documentErrors.length > 0, i = 0, len = this._nameMapSinks.length; i < len; i++) {
                                        var sinkName = this._nameMapSinks[i].name;
                                        this._nameMap[sinkName].hasErrors(!1)
                                    }
                                    var rule = this._rule(),
                                        errors = [];
                                    if (rule)
                                        for (var errorIt = rule.errors.first(); errorIt.hasCurrent; errorIt.moveNext()) {
                                            var error = errorIt.current;
                                            errors.push(error);
                                            for (var sinkIt = error.sinkTypeErrors.first(); sinkIt.hasCurrent; sinkIt.moveNext()) {
                                                var hasErrors = this._nameMap[sinkIt.current].hasErrors;
                                                hasErrors(!0)
                                            }
                                        }
                                    this._documentErrors = errors;
                                    this._hasDocumentErrors(errors.length > 0);
                                    oldHasErrors !== this._hasErrors() && this.dispatchEvent("hasErrorsChanged", this._hasErrors());
                                    this._hasErrors() ? this._errorMessage(this.errors[0].message) : this._errorMessage("")
                                }
                            }, SingleRuleViewModel.prototype._onRuleInvalidated = function() {
                                var result = this._control.tryGetRule(this._propertyName);
                                var rule = result.rule;
                                this._shouldCommit = !1;
                                (!rule.hasServiceFunctionInvocations || rule.hasErrors) && this._resetRuntimeError();
                                this._rhs(rule.script);
                                this._updateRule(rule);
                                this._shouldCommit = !0
                            }, SingleRuleViewModel.prototype.showRuntimeError = function(message, id, nodeId) {
                                if (!(this._lastProcessedRuntimeId > id)) {
                                    if (!this._isAsync) {
                                        this._lastProcessedRuntimeId = id;
                                        return
                                    }
                                    if (this._hasDocumentErrors()) {
                                        this._lastProcessedRuntimeId = id;
                                        return
                                    }
                                    if (this._hasRuntimeErrors()) {
                                        if (this._lastProcessedRuntimeId === id)
                                            return;
                                        this._resetRuntimeError()
                                    }
                                    this._lastProcessedRuntimeId = id;
                                    this._updateDocumentErrors();
                                    var errors = [],
                                        lim = this.rhs.length;
                                    if (!(lim <= 0)) {
                                        var textSpan = this._getTextSpan(nodeId);
                                        textSpan || (textSpan = {
                                            min: 0, lim: lim
                                        });
                                        errors.push({
                                            message: message, textSpan: textSpan
                                        });
                                        this._runtimeErrors = errors;
                                        this._hasRuntimeErrors(!0);
                                        this._errorMessage(this.errors[0].message);
                                        this.dispatchEvent("hasErrorsChanged", this._hasErrors())
                                    }
                                }
                            }, SingleRuleViewModel.prototype._getTextSpan = function(nodeId) {
                                if (this._textSpanGetterForTest)
                                    return this._textSpanGetterForTest();
                                var result = this._control.tryGetRule(this._propertyName),
                                    textSpanResult;
                                return !result || !(textSpanResult = result.rule.tryGetTextSpanForInvocation(nodeId)) ? null : textSpanResult.textSpan
                            }, SingleRuleViewModel.prototype.resetRuntimeError = function(id) {
                                this._lastProcessedRuntimeId >= id || (this._lastProcessedRuntimeId = id, this._resetRuntimeError())
                            }, SingleRuleViewModel.prototype._resetRuntimeError = function() {
                                this._hasRuntimeErrors() && (this._hasRuntimeErrors(!1), this._runtimeErrors = [], this.dispatchEvent("hasErrorsChanged", this._hasErrors()), this._errorMessage(""))
                            }, SingleRuleViewModel.prototype._createNameMap = function(initialRule) {
                                var initialNameMap = initialRule ? initialRule.nameMap : null,
                                    sinksLen = this._nameMapSinks.length;
                                if (sinksLen > 0) {
                                    for (var nameMap = {}, i = 0; i < sinksLen; i++) {
                                        var sinkName = this._nameMapSinks[i].name,
                                            sinkInvariantNameName = this._nameMapSinks[i].invariantName,
                                            sinkType = this._getSinkType(sinkName);
                                        nameMap[sinkName] = this._createNameMapSink(initialNameMap, sinkName, sinkInvariantNameName, sinkType)
                                    }
                                    return nameMap
                                }
                                return null
                            }, SingleRuleViewModel.prototype._createNameMapSink = function(initialNameMap, sinkName, sinkInvariantNameName, sinkType) {
                                var sources = ko.observableArray(),
                                    initialSource = "";
                                initialNameMap && (initialSource = initialNameMap.tryMapSinkToSource(sinkName).mappedName, initialSource !== "" && sources.push(initialSource));
                                var source = ko.observable(initialSource);
                                this.trackAnonymous(source.subscribe(function(newSource) {
                                    this._updateIntermediateNameMap(sinkName, sinkInvariantNameName, newSource);
                                    this._loopOverSinksComplete && (this._docNameMap = this._intermediateNameMap, this._commitText())
                                }, this));
                                var sourcesVisible = ko.observable(!1);
                                return this.trackAnonymous(sourcesVisible.subscribe(function(newValue) {
                                        newValue ? document.addEventListener("click", this._handleDocClick.bind(this), !1) : document.removeEventListener("click", this._handleDocClick.bind(this), !1)
                                    }, this)), {
                                        hasErrors: ko.observable(!1), sinkType: sinkType, source: source, sources: sources, sourcesVisible: sourcesVisible
                                    }
                            }, SingleRuleViewModel.prototype._updateIntermediateNameMap = function(sink, invariantSink, source) {
                                var nameMapBuilder = null,
                                    existingNameMap = this._intermediateNameMap,
                                    rule = this._rule();
                                rule && !existingNameMap && (existingNameMap = rule.nameMap);
                                nameMapBuilder = existingNameMap === null ? new Microsoft.AppMagic.Authoring.NameMapBuilder : new Microsoft.AppMagic.Authoring.NameMapBuilder(existingNameMap);
                                nameMapBuilder.removeMapping(sink);
                                source && source.length > 0 && nameMapBuilder.addMapping(sink, invariantSink, source);
                                this._intermediateNameMap = nameMapBuilder.create()
                            }, SingleRuleViewModel.prototype._updateRule = function(rule) {
                                var oldRule = this._rule();
                                oldRule && this._eventTracker.remove(oldRule, "invalidated");
                                this._rule(rule);
                                this._rule() && this._eventTracker.add(rule, "invalidated", this._onRuleInvalidated, this);
                                this._updateDocumentErrors();
                                this._nameMap && this._updateNameMapSources();
                                var previousValueTypeString = this._valueTypeStringExceptError;
                                !this.hasErrors && rule && (this._valueTypeStringExceptError = rule.type.toString());
                                this._shouldCommit && (this._inReset || previousValueTypeString !== this._valueTypeStringExceptError) && this.dispatchEvent("valueTypeChanged")
                            }, SingleRuleViewModel.prototype._updateNameMapSources = function() {
                                var rule = this._rule(),
                                    sink;
                                if (this._loopOverSinksComplete = !1, rule) {
                                    var nameMap = rule.nameMap,
                                        sourceEnumerator = new ViewModels.NameMapSourceEnumerator(rule.type),
                                        counter = 0;
                                    for (sink in this._nameMap) {
                                        counter++;
                                        this._updateloopOverSinksComplete(counter);
                                        var sinkType = this._nameMap[sink].sinkType,
                                            sources = sourceEnumerator.getCoercibleSources(sinkType),
                                            source = "";
                                        sources.length !== 0 && (nameMap && (source = nameMap.tryMapSinkToSource(sink).mappedName), source !== "" && this._isValidSource(rule.type, sink, source) || (source = sourceEnumerator.pickSource(sinkType)));
                                        this._nameMap[sink].sources(sources);
                                        this._nameMap[sink].source(source)
                                    }
                                }
                                else {
                                    var counter = 0;
                                    for (sink in this._nameMap)
                                        counter++,
                                        this._updateloopOverSinksComplete(counter),
                                        this._nameMap[sink].sources([]),
                                        this._nameMap[sink].source("")
                                }
                                this._loopOverSinksComplete = !0
                            }, SingleRuleViewModel.prototype._updateloopOverSinksComplete = function(counter) {
                                try {
                                    counter === Object.keys(this._nameMap).length && (this._loopOverSinksComplete = !0)
                                }
                                catch(e) {
                                    this._loopOverSinksComplete = !0
                                }
                            }, SingleRuleViewModel.prototype._isValidSource = function(ruleType, sink, source) {
                                for (var sources = ruleType.getColumnsOfType(this._nameMap[sink].sinkType, !0), it = sources.first(); it.hasCurrent; it.moveNext())
                                    if (source === it.current)
                                        return !0;
                                return !1
                            }, Object.defineProperty(SingleRuleViewModel.prototype, "_controlPropertyState", {
                                get: function() {
                                    var controlPropertyState = this._control.getControlPropertyState(this._propertyName);
                                    return controlPropertyState ? controlPropertyState : (this._control.setControlPropertyState(this._propertyName, new Microsoft.AppMagic.Authoring.ControlPropertyState(!0, "")), this._control.getControlPropertyState(this._propertyName))
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(SingleRuleViewModel.prototype, "autoBindEnabled", {
                                get: function() {
                                    return this._controlPropertyState.autoBindingEnabled
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(SingleRuleViewModel.prototype, "defaultValue", {
                                get: function() {
                                    return this._defaultValue
                                }, enumerable: !0, configurable: !0
                            }), SingleRuleViewModel.prototype.getDisplayKey = function(viewType, isChildRule) {
                                var displayKey = viewType === "expressView" ? this.propertyName : this._property.displayName;
                                return isChildRule && !this.isDataControlProperty ? Core.Utility.formatString(AppMagic.AuthoringStrings.LiftedPropertyDisplayName, this.controlName, displayKey) : displayKey
                            }, Object.defineProperty(SingleRuleViewModel.prototype, "errors", {
                                get: function() {
                                    return this._documentErrors.length > 0 ? this._documentErrors : this._runtimeErrors
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(SingleRuleViewModel.prototype, "runtimeErrors", {
                                get: function() {
                                    return this._runtimeErrors
                                }, enumerable: !0, configurable: !0
                            }), SingleRuleViewModel.prototype.fireDataSourceSelectedEvent = function() {
                                this.dispatchEvent("dataSourceSelected")
                            }, SingleRuleViewModel.prototype.focus = function() {
                                AppMagic.context.documentViewModel.commandBar.ruleButtonPanel.showRuleFlyoutTrigger.tryInvoke(this) || this.focusInExpressView()
                            }, SingleRuleViewModel.prototype.focusInExpressView = function() {
                                var configuration = AppMagic.context.documentViewModel.configuration;
                                configuration.ensureVisible();
                                this._invokeTrigger(configuration.focusRuleTrigger)
                            }, SingleRuleViewModel.prototype.scrollIntoViewInExpressView = function() {
                                this._invokeTrigger(AppMagic.context.documentViewModel.configuration.scrollIntoViewTrigger)
                            }, SingleRuleViewModel.prototype._invokeTrigger = function(trigger) {
                                var configuration = AppMagic.context.documentViewModel.configuration;
                                configuration.layoutState === AppMagic.AuthoringTool.ViewModels.ConfigurationLayoutState.visible && (configuration.ensureExpandedView(this.category), !trigger.tryInvoke(this) && configuration.ruleFilter && (configuration.ruleFilter.text = "", trigger.tryInvoke(this)))
                            }, SingleRuleViewModel.prototype.getBindableExpressions = function(sinkName) {
                                var sinkTypeString = null,
                                    sourceAggregateExpression = this._rhs(),
                                    sourceAggregateType = this._rule() ? this._rule().type : null;
                                if (sinkName)
                                    sinkTypeString = this._nameMap[sinkName].sinkType;
                                else if (sinkTypeString = this._property.propertyType, this._control.isReplicable) {
                                    sourceAggregateExpression = Microsoft.AppMagic.Common.LocalizationHelper.getCurrentLocaleKeyword("ThisItem");
                                    var controlParent = this._control.parent;
                                    sourceAggregateType = controlParent.getRuleType(controlParent.template.thisItemInputName)
                                }
                                else if (!sourceAggregateType || !sourceAggregateType.isAggregate) {
                                    var sourceExpression = sourceAggregateExpression,
                                        parsedSourceExpression = AppMagic.AuthoringTool.Utility.tryParseDottedExpression(sourceExpression);
                                    parsedSourceExpression && parsedSourceExpression.length >= 2 ? (sourceAggregateExpression = parsedSourceExpression.complete[parsedSourceExpression.length - 2], sourceAggregateType = this._getTemporaryRuleType(sourceAggregateExpression)) : sourceAggregateType && sourceAggregateType.isControl || (sourceAggregateExpression = null, sourceAggregateType = null)
                                }
                                var values = [];
                                if (sourceAggregateExpression && sourceAggregateType)
                                    for (var isReplicableTable = this._control.isReplicable && this._property.isTable, columns = isReplicableTable ? sourceAggregateType.getColumnsOfTableType() : sourceAggregateType.getColumnsOfType(sinkTypeString, !0), it = columns.first(); it.hasCurrent; it.moveNext()) {
                                        var expression = sinkName === null ? sourceAggregateExpression + "!" + Microsoft.AppMagic.Common.LanguageHelper.escapeName(it.current) : it.current;
                                        var value = {
                                                displayName: it.current, expression: expression
                                            };
                                        values.push(value)
                                    }
                                return values
                            }, SingleRuleViewModel.prototype._getTemporaryRuleType = function(temporaryRhs) {
                                var cachedRhs = this._rhs();
                                try {
                                    this._rhs(temporaryRhs);
                                    var ruleType = this._rule().type
                                }
                                finally {
                                    this._rhs(cachedRhs)
                                }
                                return ruleType
                            }, SingleRuleViewModel.prototype.getInvocations = function() {
                                if (this._rule()) {
                                    var invocations = [],
                                        result = this._rule().getTopLevelInvocations();
                                    if (result.value)
                                        for (var fnIt = result.invocations.first(); fnIt.hasCurrent; fnIt.moveNext())
                                            invocations.push(fnIt.current);
                                    return invocations
                                }
                                return null
                            }, SingleRuleViewModel.prototype.getMacroNameAtCursor = function(cur) {
                                if (cur < 0 || cur >= this.rhs.length)
                                    return null;
                                var result = this._document.tryGetMacroAtPosition(this.rhs, cur);
                                return result.value ? result.macroName : null
                            }, SingleRuleViewModel.prototype.getMacroScript = function(macroName) {
                                return this._document.safeMacroScript(macroName)
                            }, SingleRuleViewModel.prototype.handleSourceClick = function(nameMapSink, source) {
                                nameMapSink.source(source);
                                nameMapSink.sourcesVisible(!1)
                            }, Object.defineProperty(SingleRuleViewModel.prototype, "hasErrors", {
                                get: function() {
                                    return this._hasErrors()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(SingleRuleViewModel.prototype, "hasRuntimeErrors", {
                                get: function() {
                                    return this._hasRuntimeErrors()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(SingleRuleViewModel.prototype, "errorMessage", {
                                get: function() {
                                    return this._errorMessage()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(SingleRuleViewModel.prototype, "isResetVisible", {
                                get: function() {
                                    var rhs = this._rhs();
                                    return this._hasSampleData ? rhs !== this._sampleDataSourceName : rhs !== this._defaultValue
                                }, enumerable: !0, configurable: !0
                            }), SingleRuleViewModel.prototype.macroUpdateCreatesCycle = function(macroName, macroScript) {
                                return this._document.macroUpdateCreatesCycle(macroName, macroScript)
                            }, SingleRuleViewModel.prototype.isMacroNameAvailable = function(newName) {
                                return this._document.isNameAvailable(newName)
                            }, SingleRuleViewModel.prototype.isMacroScriptValid = function(start, end) {
                                return this._document.substringIsValidMacro(this.rhs, start, end - start)
                            }, SingleRuleViewModel.prototype.macroCreate = function(selStart, selEnd) {
                                var macroName;
                                this._document.undoManager.createGroup("Create Macro");
                                try {
                                    macroName = this._document.addMacro(this.rhs.substring(selStart, selEnd));
                                    this._document.collapseMacro(this.controlName, this.propertyName, selStart, selEnd - selStart, macroName)
                                }
                                finally {
                                    this._document.undoManager.closeGroup()
                                }
                                return macroName
                            }, SingleRuleViewModel.prototype.macroCollapseAll = function(macroName) {
                                return this._document.collapseAll(macroName)
                            }, SingleRuleViewModel.prototype.macroDelete = function(macroName) {
                                this._document.removeMacro(macroName, !0)
                            }, SingleRuleViewModel.prototype.macroExpand = function(cur) {
                                this._document.expandMacro(this.controlName, this.propertyName, cur)
                            }, SingleRuleViewModel.prototype.macroUpdate = function(macroName, selStart, selEnd) {
                                var macroScript = this.rhs.substring(selStart, selEnd);
                                this._document.undoManager.createGroup("Update Macro");
                                try {
                                    this._document.updateMacro(macroName, macroScript) && this._document.collapseMacro(this.controlName, this.propertyName, selStart, selEnd - selStart, macroName)
                                }
                                finally {
                                    this._document.undoManager.closeGroup()
                                }
                            }, SingleRuleViewModel.prototype.setSourcesVisiblity = function(sinkName) {
                                var sourcesVisible = this._nameMap[sinkName].sourcesVisible();
                                for (var entry in this._nameMap) {
                                    var nameMapSink = this._nameMap[entry];
                                    entry === sinkName ? nameMapSink.sources().length > 0 && nameMapSink.sourcesVisible(!sourcesVisible) : nameMapSink.sourcesVisible(!1)
                                }
                            }, SingleRuleViewModel.prototype.tryMacroRename = function(oldMacroName, newMacroName) {
                                return this._document.tryRenameMacro(oldMacroName, newMacroName)
                            }, Object.defineProperty(SingleRuleViewModel.prototype, "nameMap", {
                                get: function() {
                                    return this._nameMap
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(SingleRuleViewModel.prototype, "nameMapSinks", {
                                get: function() {
                                    return this._nameMapSinks.map(function(sink) {
                                            return sink.name
                                        })
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(SingleRuleViewModel.prototype, "isNumberLiteral", {
                                get: function() {
                                    return this._rule() !== null && this._rule().isNumberLiteral
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(SingleRuleViewModel.prototype, "propertyTypeString", {
                                get: function() {
                                    return this._property.propertyType
                                }, enumerable: !0, configurable: !0
                            }), SingleRuleViewModel.prototype.refreshRuleFromDocument = function() {
                                var result = this._control.tryGetRule(this.propertyName);
                                this._shouldCommit = !1;
                                result.value ? (this._rhs(result.rule.script), this._updateRule(result.rule)) : (this._rhs(""), this._updateRule(null));
                                this._shouldCommit = !0
                            }, SingleRuleViewModel.prototype.resetValue = function() {
                                try {
                                    this._inReset = !0;
                                    this._hasSampleData ? this._rhs(this._sampleDataSourceName) : this._rhs(this._defaultValue ? this._defaultValue : "")
                                }
                                finally {
                                    this._inReset = !1
                                }
                            }, Object.defineProperty(SingleRuleViewModel.prototype, "rhs", {
                                get: function() {
                                    return this._rhs()
                                }, set: function(value) {
                                        value === this._controlPropertyState.autoBindingScript && this._control.setControlPropertyState(this._propertyName, new Microsoft.AppMagic.Authoring.ControlPropertyState(!0, ""));
                                        this._rhs(value)
                                    }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(SingleRuleViewModel.prototype, "rhsUserEdit", {
                                get: function() {
                                    return this._rhs()
                                }, set: function(value) {
                                        this._controlPropertyState.autoBindingEnabled && this._control.setControlPropertyState(this._propertyName, new Microsoft.AppMagic.Authoring.ControlPropertyState(!1, this._rhs()));
                                        this._document.undoManager.createGroup("User update of rule: " + this._propertyName);
                                        try {
                                            this.rhs = value;
                                            this.dispatchEvent("rhsUserEditChanged")
                                        }
                                        finally {
                                            this._document.undoManager.closeGroup()
                                        }
                                    }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(SingleRuleViewModel.prototype, "rhsChanged", {
                                get: function() {
                                    return this._rhs() !== Microsoft.AppMagic.Common.LocalizationHelper.convertToLocaleSpecific(this._defaultValue, null)
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(SingleRuleViewModel.prototype, "ruleType", {
                                get: function() {
                                    return this._rule() ? this._rule().type : null
                                }, enumerable: !0, configurable: !0
                            }), SingleRuleViewModel.prototype.setRhsAndNameMap = function(rhs, nameMap) {
                                if (this.rhs = rhs, nameMap)
                                    for (var sink in nameMap)
                                        nameMap.hasOwnProperty(sink) && this.updateSource(sink, nameMap[sink])
                            }, SingleRuleViewModel.prototype.updateSource = function(sink, source) {
                                this._nameMap[sink].source(source)
                            }, Object.defineProperty(SingleRuleViewModel.prototype, "valueTypeString", {
                                get: function() {
                                    return this._valueTypeStringExceptError
                                }, enumerable: !0, configurable: !0
                            }), SingleRuleViewModel.prototype._cancelDelayFiring = function() {
                                this._delayFirePromise !== null && (this._delayFirePromise.cancel(), this._delayFirePromise = null)
                            }, SingleRuleViewModel.DelayFireTimeOutInMilliSeconds = 2e3, SingleRuleViewModel
                }(ViewModels.RuleViewModel);
            ViewModels.SingleRuleViewModel = SingleRuleViewModel
        })(ViewModels = AuthoringTool.ViewModels || (AuthoringTool.ViewModels = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var Shortcuts;
        (function(Shortcuts) {
            var AppBarShortcutProvider = function(_super) {
                    __extends(AppBarShortcutProvider, _super);
                    function AppBarShortcutProvider(appBarControl) {
                        _super.call(this);
                        this._selectedIndex = ko.observable(0);
                        this._current = ko.observable();
                        this._appBarControl = appBarControl;
                        this._buildShortcutKeys()
                    }
                    return AppBarShortcutProvider.prototype.getFileMenuOptions = function() {
                            return [{
                                        text: AppMagic.AuthoringStrings.New, title: AppMagic.AuthoringStrings.NewButtonTooltip, action: "handleNewClicked"
                                    }, {
                                        text: AppMagic.AuthoringStrings.Open, title: AppMagic.AuthoringStrings.OpenButtonTooltip, action: "handleOpenClicked"
                                    }, {
                                        text: AppMagic.AuthoringStrings.SaveMenuItem, title: AppMagic.AuthoringStrings.SaveButtonTooltip, action: "handleSaveClicked"
                                    }, {
                                        text: AppMagic.AuthoringStrings.SaveAs, title: AppMagic.AuthoringStrings.SaveAsButtonTooltip, action: "handleSaveAsClicked"
                                    }, {
                                        text: AppMagic.AuthoringStrings.AppSettings, title: AppMagic.AuthoringStrings.AppSettingsButtonTooltip, action: "handleAppSettingsClicked"
                                    }, {
                                        text: AppMagic.AuthoringStrings.PublishMenuItem, title: AppMagic.AuthoringStrings.PublishButtonTooltip, action: "handlePublishClicked"
                                    }, ]
                        }, AppBarShortcutProvider.prototype.getAppDataMenuOptions = function() {
                            return [{
                                        text: AppMagic.AuthoringStrings.QuickstartPictures, visible: !0, action: "handleImportPicturesClicked"
                                    }, {
                                        text: AppMagic.AuthoringStrings.DataSourcesMenuItem, visible: !0, action: "handleDataSourcesClicked"
                                    }, {
                                        text: AppMagic.AuthoringStrings.EmbeddedMediaMenuItem, visible: !0, action: "handleEmbeddedMediaClicked"
                                    }, {
                                        text: AppMagic.AuthoringStrings.DataCollectionsMenuItem, visible: !0, action: "handleDataCollectionsClicked"
                                    }, {
                                        text: AppMagic.AuthoringStrings.MacroBackstageMenuItem, visible: this._appBarControl.macroBackStageVisible, action: "handleMacroBackstageClicked"
                                    }, ].filter(function(item) {
                                    return item.visible === !0
                                })
                        }, AppBarShortcutProvider.prototype.getHelpMenuOptions = function() {
                                return [{
                                            text: AppMagic.AuthoringStrings.HelpBuildSampleApp, action: "handleHelpBuildSampleClicked"
                                        }, {
                                            text: AppMagic.AuthoringStrings.HelpLearnMore, action: "handleHelpClicked"
                                        }, {
                                            text: AppMagic.AuthoringStrings.HelpForums, action: "handleHelpForumsClicked"
                                        }, {
                                            text: AppMagic.AuthoringStrings.HelpHome, action: "handleHelpHomeClicked"
                                        }, ]
                            }, AppBarShortcutProvider.prototype.onMouseOver = function(data, evt) {
                                var id = evt.target.parentElement.parentElement.id,
                                    items = this._selectItems(id);
                                this._mouseOverAppBarOption(items, evt.target.innerText)
                            }, AppBarShortcutProvider.prototype.getPreviewMenuOptions = function() {
                                if (Core.Utility.isNullOrUndefined(this._previewMenuOptions)) {
                                    this._previewMenuOptions = [];
                                    for (var platform in AppMagic.DocumentLayout.Constants.Platforms) {
                                        var platformSettings = {
                                                text: AppMagic.DocumentLayout.Constants.Platforms[platform].displayName, args: platform, action: "handlePlayClicked"
                                            };
                                        this._previewMenuOptions.push(platformSettings)
                                    }
                                }
                                return this._previewMenuOptions
                            }, Object.defineProperty(AppBarShortcutProvider.prototype, "selectedIndex", {
                                get: function() {
                                    return this._selectedIndex()
                                }, set: function(value) {
                                        this._selectedIndex(value)
                                    }, enumerable: !0, configurable: !0
                            }), AppBarShortcutProvider.prototype._buildShortcutKeys = function() {
                                var _this = this;
                                this.addShortcutKey("Tab", function() {
                                    return _this._moveDirection("down")
                                });
                                this.addShortcutKey("Shift+Tab", function() {
                                    return _this._moveDirection("up")
                                });
                                this.addShortcutKey("Down", function() {
                                    return _this._moveDirection("down")
                                });
                                this.addShortcutKey("Up", function() {
                                    return _this._moveDirection("up")
                                });
                                this.addShortcutKey("Enter", function() {
                                    return _this._enterKeyDownCallback()
                                });
                                this.addShortcutKey("up: Esc", function() {
                                    return _this._escKeyDownCallback()
                                });
                                this.addShortcutKey("d", this._dataSourcesAppBarCallback);
                                this.addShortcutKey("p", this._publishAppBarCallback)
                            }, AppBarShortcutProvider.prototype._enterKeyDownCallback = function() {
                                var items = this._selectItems(event.currentTarget.id);
                                return typeof this._current() == "undefined" ? this._selectOptionByIndex(items, 0) : this._selectOptionByIndex(items, this._selectedIndex()), this._appBarControl.handleAppbarButtons(this._current()), !0
                            }, AppBarShortcutProvider.prototype._escKeyDownCallback = function() {
                                switch (event.currentTarget.id) {
                                    case"topAppBarFileFlyout":
                                        topAppBar.winControl.hidden || topAppBarFileFlyout.winControl.hidden || topAppBarFileFlyout.winControl.hide();
                                        break;
                                    case"topAppBarDataFlyout":
                                        topAppBar.winControl.hidden || topAppBarDataFlyout.winControl.hidden || topAppBarDataFlyout.winControl.hide();
                                        break;
                                    case"topAppBarHelpFlyout":
                                        topAppBar.winControl.hidden || topAppBarHelpFlyout.winControl.hidden || topAppBarHelpFlyout.winControl.hide();
                                        break;
                                    case"topAppBarPlayFlyout":
                                        topAppBar.winControl.hidden || topAppBarPlayFlyout.winControl.hidden || topAppBarPlayFlyout.winControl.hide();
                                        break
                                }
                                return !0
                            }, AppBarShortcutProvider.prototype._selectOptionByIndex = function(items, index) {
                                var setting = items[index];
                                this._selectedIndex(index);
                                this._current(setting)
                            }, AppBarShortcutProvider.prototype._selectItems = function(id) {
                                var items = [];
                                switch (id) {
                                    case"topAppBarFileFlyout":
                                        items = this.getFileMenuOptions();
                                        break;
                                    case"topAppBarDataFlyout":
                                        items = this.getAppDataMenuOptions();
                                        break;
                                    case"topAppBarHelpFlyout":
                                        items = this.getHelpMenuOptions();
                                        break;
                                    case"topAppBarPlayFlyout":
                                        items = this.getPreviewMenuOptions();
                                        break;
                                    default:
                                        Contracts.check(!1);
                                        break
                                }
                                return items
                            }, AppBarShortcutProvider.prototype._moveDirection = function(direction, id) {
                                Core.Utility.isNullOrUndefined(id) && (id = event.currentTarget.id);
                                var items = this._selectItems(id);
                                return this._appBarOptions(items, direction), !0
                            }, AppBarShortcutProvider.prototype._appBarOptions = function(items, direction) {
                                var current = this._selectedIndex(),
                                    len = items.length;
                                direction === "down" ? (current < len && current++, current === len && (current = 0)) : direction === "up" && (current > 0 ? current-- : current === 0 && (current = len - 1));
                                current === -1 && (current = 0);
                                this._selectOptionByIndex(items, current)
                            }, AppBarShortcutProvider.prototype._mouseOverAppBarOption = function(items, target) {
                                for (var i = 0; i < items.length; i++)
                                    if (items[i].text === target) {
                                        this._selectOptionByIndex(items, i);
                                        break
                                    }
                            }, AppBarShortcutProvider.prototype._dataSourcesAppBarCallback = function() {
                                return !topAppBar.winControl.hidden && !topAppBarDataFlyout.winControl.hidden ? (AppMagic.context.shellViewModel.displayBackStagePage(AppMagic.AuthoringStrings.DataSources), topAppBarFileFlyout.winControl.hide(), topAppBar.winControl.hide(), !0) : !1
                            }, AppBarShortcutProvider.prototype._publishAppBarCallback = function() {
                                return !topAppBar.winControl.hidden && !topAppBarFileFlyout.winControl.hidden ? (AppMagic.context.shellViewModel.displayBackStagePage(AppMagic.AuthoringStrings.Publish), topAppBarFileFlyout.winControl.hide(), topAppBar.winControl.hide(), !0) : !1
                            }, AppBarShortcutProvider
                }(AppMagic.Common.Shortcuts.BaseShortcutProvider);
            Shortcuts.AppBarShortcutProvider = AppBarShortcutProvider
        })(Shortcuts = AuthoringTool.Shortcuts || (AuthoringTool.Shortcuts = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var Shortcuts;
        (function(Shortcuts) {
            var localizationHelper = Microsoft.AppMagic.Common.LocalizationHelper,
                VisualsShortcutProvider = function(_super) {
                    __extends(VisualsShortcutProvider, _super);
                    function VisualsShortcutProvider() {
                        _super.call(this);
                        this._buildShortcutKeys()
                    }
                    return VisualsShortcutProvider.prototype._buildShortcutKeys = function() {
                            var _this = this;
                            this.addShortcutKey("Ctrl+c", this._doCopyCallback);
                            this.addShortcutKey("Ctrl+b", this._doBoldCallback);
                            this.addShortcutKey("Ctrl+i", function() {
                                return _this._doItalicUnderlineCallback("Italic")
                            });
                            this.addShortcutKey("Ctrl+u", function() {
                                return _this._doItalicUnderlineCallback("Underline")
                            });
                            this.addShortcutKey("Ctrl+x", this._doCutCallback);
                            this.addShortcutKey("Ctrl+v", this._doPasteCallback);
                            this.addShortcutKey("Ctrl+a", this._doSelectAllCallback);
                            this.addShortcutKey("Backspace", function() {
                                return _this._deleteSelectedVisuals()
                            });
                            this.addShortcutKey("Del", function() {
                                return _this._deleteSelectedVisuals()
                            });
                            this.addShortcutKey("Alt+Shift", this._hideVisualLabelCallback);
                            this.addShortcutKey("Alt+Ctrl", this._hideVisualLabelCallback)
                        }, VisualsShortcutProvider.prototype._hideVisualLabelCallback = function() {
                            return AppMagic.context.documentViewModel.canvasManager.visualLabelsVisible = !1, !1
                        }, VisualsShortcutProvider.prototype._doCopyCallback = function() {
                                return this._isEntityShortcutValid() ? (AppMagic.context.documentViewModel.doCopy(), !0) : !1
                            }, VisualsShortcutProvider.prototype._doBoldCallback = function() {
                                for (var topFontWeights = AppMagic.AuthoringTool.VisualIntellisense.TopFontWeights, index = -1, i = 0, lastIndex = topFontWeights.length - 1; i <= lastIndex; i++) {
                                    var selectedVisualStyle = AppMagic.context.documentViewModel.rulePanelsInfo.propertyRuleMap.FontWeight;
                                    if (typeof selectedVisualStyle != "undefined") {
                                        if (selectedVisualStyle.rhs === "")
                                            return selectedVisualStyle.rhsUserEdit = Microsoft.AppMagic.Common.LocalizationHelper.convertToLocaleSpecific(topFontWeights[i].text, null), !0;
                                        if (selectedVisualStyle.rhs === Microsoft.AppMagic.Common.LocalizationHelper.convertToLocaleSpecific(topFontWeights[i].text, null))
                                            return index = i, i === lastIndex && (index = -1), selectedVisualStyle.rhsUserEdit = topFontWeights[++index].text, !0
                                    }
                                }
                                return !1
                            }, VisualsShortcutProvider.prototype._doItalicUnderlineCallback = function(style) {
                                var selectedVisualStyle = AppMagic.context.documentViewModel.rulePanelsInfo.propertyRuleMap[style];
                                if (typeof selectedVisualStyle != "undefined") {
                                    var value = selectedVisualStyle.rhs === localizationHelper.currentLocaleTrueKeyword ? localizationHelper.currentLocaleFalseKeyword : localizationHelper.currentLocaleTrueKeyword;
                                    selectedVisualStyle.rhsUserEdit = value
                                }
                                return !0
                            }, VisualsShortcutProvider.prototype._doPasteCallback = function() {
                                return this._isEntityShortcutValid() ? (AppMagic.context.documentViewModel.doPaste(), !0) : !1
                            }, VisualsShortcutProvider.prototype._doCutCallback = function() {
                                return this._isEntityShortcutValid() ? (AppMagic.context.documentViewModel.doCut(), !0) : !1
                            }, VisualsShortcutProvider.prototype._doSelectAllCallback = function() {
                                return this._isEntityShortcutValid() ? (AppMagic.context.documentViewModel.canvasManager.selectCurrentCanvasVisuals(), !0) : !1
                            }, VisualsShortcutProvider.prototype._deleteSelectedVisuals = function() {
                                var element = document.activeElement;
                                return !element || !element.isContentEditable && (typeof element.className != "string" || element.className.indexOf("expressView source") < 0) ? (AppMagic.context.documentViewModel.controlGallery.waitForVisualAdded().then(function() {
                                        AppMagic.context.documentViewModel.removeSelectedVisuals()
                                    }), !0) : !1
                            }, VisualsShortcutProvider.prototype._isEntityShortcutValid = function() {
                                return document.activeElement && !document.activeElement.isContentEditable && !AppMagic.context.documentViewModel.isPreview
                            }, VisualsShortcutProvider
                }(AppMagic.Common.Shortcuts.BaseShortcutProvider);
            Shortcuts.VisualsShortcutProvider = VisualsShortcutProvider
        })(Shortcuts = AuthoringTool.Shortcuts || (AuthoringTool.Shortcuts = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var Shortcuts;
        (function(Shortcuts) {
            var BlankPageShortcutProvider = function(_super) {
                    __extends(BlankPageShortcutProvider, _super);
                    function BlankPageShortcutProvider(blankPageViewModel) {
                        _super.call(this);
                        this._blankPageViewModel = blankPageViewModel;
                        this._buildBlankPageShortcutKeys()
                    }
                    return BlankPageShortcutProvider.prototype._buildBlankPageShortcutKeys = function() {
                            var _this = this;
                            this.addShortcutKey("Left", function() {
                                return _this._moveSelected(-1 * AppMagic.context.documentViewModel.zoom.adornerScale, 0)
                            });
                            this.addShortcutKey("Right", function() {
                                return _this._moveSelected(1 * AppMagic.context.documentViewModel.zoom.adornerScale, 0)
                            });
                            this.addShortcutKey("Alt+Left", function() {
                                return _this._alignSelected("horizontal", -1)
                            });
                            this.addShortcutKey("Alt+Right", function() {
                                return _this._alignSelected("horizontal", 1)
                            });
                            this.addShortcutKey("Alt+Up", function() {
                                return _this._alignSelected("vertical", -1)
                            });
                            this.addShortcutKey("Alt+Down", function() {
                                return _this._alignSelected("vertical", 1)
                            });
                            this.addShortcutKey("Alt+Shift+Left", function() {
                                return _this._alignSelected("horizontal", 0)
                            });
                            this.addShortcutKey("Alt+Shift+Right", function() {
                                return _this._alignSelected("horizontal", 0)
                            });
                            this.addShortcutKey("Alt+Shift+Up", function() {
                                return _this._alignSelected("vertical", 0)
                            });
                            this.addShortcutKey("Alt+Shift+Down", function() {
                                return _this._alignSelected("vertical", 0)
                            });
                            this.addShortcutKey("Ctrl+Up", function() {
                                return this._changeSelectedZOrder(-1)
                            });
                            this.addShortcutKey("Ctrl+Shift+Up", function() {
                                return _this._changeSelectedZOrder(-Infinity)
                            });
                            this.addShortcutKey("Ctrl+Down", function() {
                                return _this._changeSelectedZOrder(1)
                            });
                            this.addShortcutKey("Ctrl+Shift+Down", function() {
                                return _this._changeSelectedZOrder(Infinity)
                            });
                            this.addShortcutKey("Ctrl+Shift+f", function() {
                                return _this._changeSelectedZOrder(-1)
                            });
                            this.addShortcutKey("Ctrl+Shift+b", function() {
                                return _this._changeSelectedZOrder(1)
                            });
                            this.addShortcutKey("Ctrl+Shift+r", function() {
                                return _this._changeSelectedZOrder(Infinity)
                            });
                            this.addShortcutKey("Ctrl+Shift+k", function() {
                                return _this._changeSelectedZOrder(-Infinity)
                            });
                            this.addShortcutKey("Ctrl+g", function() {
                                return _this._toggleGroupUngroup()
                            });
                            this.addShortcutKey("Ctrl+Shift+g", function() {
                                return _this._toggleGroupUngroup()
                            });
                            this.addShortcutKey("Up", this._moveVisualUpCallback);
                            this.addShortcutKey("Down", this._moveVisualDownCallback);
                            this.addShortcutKey("up: Esc", this._hideVisualEscCallback);
                            this.addShortcutKey("Esc", this._escapeCallback)
                        }, BlankPageShortcutProvider.prototype._escapeCallback = function() {
                            return AppMagic.context.documentViewModel.isPreview && AppMagic.context.shellViewModel.stopPreview(), !0
                        }, BlankPageShortcutProvider.prototype._hideVisualEscCallback = function() {
                                return AppMagic.context.documentViewModel.screenDropDown.handleEscKey() ? !0 : AppMagic.context.documentViewModel.visualDropDown.handleEscKey()
                            }, BlankPageShortcutProvider.prototype._moveVisualUpCallback = function() {
                                if (AppMagic.context.documentViewModel.screenDropDown.handleUpKey())
                                    return !0;
                                else if (AppMagic.context.documentViewModel.visualDropDown.handleUpKey())
                                    return !0;
                                return this._moveSelected(0, -1 * AppMagic.context.documentViewModel.zoom.adornerScale)
                            }, BlankPageShortcutProvider.prototype._moveVisualDownCallback = function() {
                                if (AppMagic.context.documentViewModel.screenDropDown.handleDownKey())
                                    return !0;
                                else if (AppMagic.context.documentViewModel.visualDropDown.handleDownKey())
                                    return !0;
                                return this._moveSelected(0, 1 * AppMagic.context.documentViewModel.zoom.adornerScale)
                            }, BlankPageShortcutProvider.prototype._moveSelected = function(xoffset, yoffset) {
                                var canvas = AppMagic.context.documentViewModel.canvasManager.selectedVisualsCommonCanvas;
                                return canvas && Shortcuts.ShortcutUtility.isEditableContent() ? (canvas.moveSelected(xoffset, yoffset), !0) : !1
                            }, BlankPageShortcutProvider.prototype._alignSelected = function(direction, position) {
                                var canvas = AppMagic.context.documentViewModel.canvasManager.selectedVisualsCommonCanvas;
                                return canvas ? (direction === "horizontal" ? canvas.alignSelectedHorizontal(position) : canvas.alignSelectedVertical(position), !0) : !1
                            }, BlankPageShortcutProvider.prototype._changeSelectedZOrder = function(offset) {
                                var canvas = AppMagic.context.documentViewModel.canvasManager.selectedVisualsCommonCanvas;
                                return canvas ? (canvas.changeSelectedZOrder(offset), !0) : !1
                            }, BlankPageShortcutProvider.prototype._toggleGroupUngroup = function() {
                                return this._canGroup ? this._group() : this._ungroup(), !0
                            }, Object.defineProperty(BlankPageShortcutProvider.prototype, "_canGroup", {
                                get: function() {
                                    return AppMagic.context.documentViewModel._selectionManager.selection.length > 1
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(BlankPageShortcutProvider.prototype, "_canUngroup", {
                                get: function() {
                                    var selectionManager = AppMagic.context.documentViewModel._selectionManager;
                                    return selectionManager.singleVisual !== null ? selectionManager.singleVisual.groupedVisuals.length > 1 : !1
                                }, enumerable: !0, configurable: !0
                            }), BlankPageShortcutProvider.prototype._group = function() {
                                return AppMagic.context.documentViewModel.selection.selection.length === 1 ? !1 : AppMagic.context.documentViewModel.selection.selection[0].group ? !1 : (AppMagic.context.documentViewModel.controlGallery.addGroup(), !0)
                            }, BlankPageShortcutProvider.prototype._ungroup = function() {
                                var visual = AppMagic.context.documentViewModel.selection.singleVisual;
                                if (visual === null)
                                    return !1;
                                var ungroupedVisuals = visual.groupedVisuals;
                                return visual.ungroup(), AppMagic.context.documentViewModel.selection.selectVisualsOrGroups(ungroupedVisuals), !0
                            }, BlankPageShortcutProvider
                }(AppMagic.AuthoringTool.Shortcuts.VisualsShortcutProvider);
            Shortcuts.BlankPageShortcutProvider = BlankPageShortcutProvider
        })(Shortcuts = AuthoringTool.Shortcuts || (AuthoringTool.Shortcuts = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var Shortcuts;
        (function(Shortcuts) {
            var BackStageShortcutProvider = function(_super) {
                    __extends(BackStageShortcutProvider, _super);
                    function BackStageShortcutProvider() {
                        _super.call(this);
                        this._buildConnectionShortcutkeys()
                    }
                    return BackStageShortcutProvider.prototype._buildConnectionShortcutkeys = function() {
                            var _this = this;
                            this.addShortcutKey("Up", function() {
                                return _this._moveCursorUpCallback()
                            });
                            this.addShortcutKey("Down", function() {
                                return _this._moveCursorDownCallback()
                            });
                            this.addShortcutKey("Esc", this._escapeCallback)
                        }, BackStageShortcutProvider.prototype._moveCursorUpCallback = function() {
                            var current = AppMagic.context.documentViewModel.backStage.previous;
                            if (current !== null && Shortcuts.ShortcutUtility.isEditableContent())
                                AppMagic.context.documentViewModel.backStage.onClickSetting(current.title);
                            return !1
                        }, BackStageShortcutProvider.prototype._moveCursorDownCallback = function() {
                                var current = AppMagic.context.documentViewModel.backStage.next;
                                if (current !== null && Shortcuts.ShortcutUtility.isEditableContent())
                                    AppMagic.context.documentViewModel.backStage.onClickSetting(current.title);
                                return !1
                            }, BackStageShortcutProvider.prototype._escapeCallback = function() {
                                return AppMagic.context.documentViewModel.backStage.handleBackButtonClick(), !0
                            }, BackStageShortcutProvider
                }(AppMagic.Common.Shortcuts.BaseShortcutProvider);
            Shortcuts.BackStageShortcutProvider = BackStageShortcutProvider
        })(Shortcuts = AuthoringTool.Shortcuts || (AuthoringTool.Shortcuts = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var Shortcuts;
        (function(Shortcuts) {
            var CommandBarShortcutProvider = function(_super) {
                    __extends(CommandBarShortcutProvider, _super);
                    function CommandBarShortcutProvider(commandBarViewModel) {
                        _super.call(this);
                        this.selectedIndex = ko.observable(-1);
                        this._current = ko.observable();
                        this._commandBarViewModel = commandBarViewModel;
                        this._buildShortcutKeys()
                    }
                    return CommandBarShortcutProvider.prototype.getEditFlyoutOptions = function() {
                            return [{
                                        title: AppMagic.AuthoringStrings.UndoButtonTooltip, text: AppMagic.AuthoringStrings.UndoButtonLabel, visible: !0, image: "/images/undoicon.svg", action: "doUndo"
                                    }, {
                                        title: AppMagic.AuthoringStrings.RedoButtonTooltip, text: AppMagic.AuthoringStrings.RedoButtonLabel, visible: !0, image: "/images/redoicon.svg", action: "doRedo"
                                    }, {
                                        title: AppMagic.AuthoringStrings.CutButtonTooltip, text: AppMagic.AuthoringStrings.Cut, visible: this._commandBarViewModel.clipboardManager.isCutValid, image: "/images/cut_icon.svg", action: "doCut"
                                    }, {
                                        title: AppMagic.AuthoringStrings.CopyButtonTooltip, text: AppMagic.AuthoringStrings.Copy, visible: this._commandBarViewModel.clipboardManager.isCopyValid, image: "/images/copy_icon.svg", action: "doCopy"
                                    }, {
                                        title: AppMagic.AuthoringStrings.PasteButtonTooltip, text: AppMagic.AuthoringStrings.Paste, visible: this._commandBarViewModel.clipboardManager.isPasteValid, image: "/images/paste_icon.svg", action: "doPaste"
                                    }, {
                                        title: AppMagic.AuthoringStrings.DeleteButtonTooltip, text: AppMagic.AuthoringStrings.Delete, visible: this._commandBarViewModel.canDelete, image: "/images/icon_delete_18x18.svg", action: "doDelete"
                                    }, {
                                        title: AppMagic.AuthoringStrings.GroupButtonTooltip, text: AppMagic.AuthoringStrings.Group, visible: this._commandBarViewModel.canGroup, image: "/images/group_icon.svg", action: "doGroup"
                                    }, {
                                        title: AppMagic.AuthoringStrings.UngroupButtonTooltip, text: AppMagic.AuthoringStrings.Ungroup, visible: this._commandBarViewModel.canUngroup, image: "/images/ungroup_icon.svg", action: "doUngroup"
                                    }, ].filter(function(item) {
                                    return item.visible === !0
                                })
                        }, CommandBarShortcutProvider.prototype.getArrangeFlyoutOptions = function() {
                            return [{
                                        title: AppMagic.AuthoringStrings.OrderTooltip, text: AppMagic.AuthoringStrings.Order, image: "/images/order_icon.svg", action: "showOrderFlyout"
                                    }, {
                                        title: AppMagic.AuthoringStrings.AlignTooltip, text: AppMagic.AuthoringStrings.Align, image: "/images/align_icon.svg", action: "showAlignFlyout"
                                    }, ]
                        }, CommandBarShortcutProvider.prototype.getAlignFlyoutOptions = function() {
                                return [{
                                            title: AppMagic.AuthoringStrings.TooltipAlignLeft, text: AppMagic.AuthoringStrings.AlignLeft, image: "/images/alignLeft_icon.svg", action: "alignSelectedHorizontal", args: -1
                                        }, {
                                            title: AppMagic.AuthoringStrings.TooltipAlignCenter, text: AppMagic.AuthoringStrings.AlignCenter, image: "/images/alignCenterHorz_icon.svg", action: "alignSelectedHorizontal", args: 0
                                        }, {
                                            title: AppMagic.AuthoringStrings.TooltipAlignRight, text: AppMagic.AuthoringStrings.AlignRight, image: "/images/alignRight_icon.svg", action: "alignSelectedHorizontal", args: 1
                                        }, {
                                            title: AppMagic.AuthoringStrings.TooltipAlignTop, text: AppMagic.AuthoringStrings.AlignTop, image: "/images/AlignTop_icon.svg", action: "alignSelectedVertical", args: -1
                                        }, {
                                            title: AppMagic.AuthoringStrings.TooltipAlignMiddle, text: AppMagic.AuthoringStrings.AlignMiddle, image: "/images/alignCenterVert_icon.svg", action: "alignSelectedVertical", args: 0
                                        }, {
                                            title: AppMagic.AuthoringStrings.TooltipAlignBottom, text: AppMagic.AuthoringStrings.AlignBottom, image: "/images/AlignBottom_icon.svg", action: "alignSelectedVertical", args: 1
                                        }, {
                                            title: AppMagic.AuthoringStrings.TooltipDistributeHorizontal, text: AppMagic.AuthoringStrings.DistributeHorizontal, image: "/images/distributeHorz_icon.svg", action: "distributeSelectedHorizontal"
                                        }, {
                                            title: AppMagic.AuthoringStrings.TooltipDistributeVertical, text: AppMagic.AuthoringStrings.DistributeVertical, image: "/images/distributeVert_icon.svg", action: "distributeSelectedVertical"
                                        }, ]
                            }, CommandBarShortcutProvider.prototype.getOrderFlyoutOptions = function() {
                                return [{
                                            title: AppMagic.AuthoringStrings.TooltipBringToFront, text: AppMagic.AuthoringStrings.BringToFront, image: "/images/bringtofront_icon.svg", action: "changeSelectedZOrder", args: -Infinity
                                        }, {
                                            title: AppMagic.AuthoringStrings.TooltipSendToBack, text: AppMagic.AuthoringStrings.SendToBack, image: "/images/sendtoback_icon.svg", action: "changeSelectedZOrder", args: Infinity
                                        }, {
                                            title: AppMagic.AuthoringStrings.TooltipBringForward, text: AppMagic.AuthoringStrings.BringForward, image: "/images/bringforward_icon.svg", action: "changeSelectedZOrder", args: -1
                                        }, {
                                            title: AppMagic.AuthoringStrings.TooltipSendBackward, text: AppMagic.AuthoringStrings.SendBackward, image: "/images/sendbackward_icon.svg", action: "changeSelectedZOrder", args: 1
                                        }, ]
                            }, CommandBarShortcutProvider.prototype._buildShortcutKeys = function() {
                                var _this = this;
                                this.addShortcutKey("Tab", function() {
                                    return _this._moveDirection("down")
                                });
                                this.addShortcutKey("Shift+Tab", function() {
                                    return _this._moveDirection("up")
                                });
                                this.addShortcutKey("Down", function() {
                                    return _this._moveDirection("down")
                                });
                                this.addShortcutKey("Up", function() {
                                    return _this._moveDirection("up")
                                });
                                this.addShortcutKey("Enter", function() {
                                    return _this._enterKeyDownCallback()
                                });
                                this.addShortcutKey("up: Esc", function() {
                                    return _this._escKeyDownCallback()
                                })
                            }, CommandBarShortcutProvider.prototype._enterKeyDownCallback = function() {
                                return this._current() && this._commandBarViewModel.handleCommandButtons(this._current()), !0
                            }, CommandBarShortcutProvider.prototype._escKeyDownCallback = function() {
                                var id = event.currentTarget.id;
                                switch (id) {
                                    case"alignFlyout":
                                        alignFlyout.winControl.hidden || alignFlyout.winControl.hide();
                                        break;
                                    case"copyPasteFlyout":
                                        copyPasteFlyout.winControl.hidden || copyPasteFlyout.winControl.hide();
                                        break;
                                    case"arrangeFlyout":
                                        arrangeFlyout.winControl.hidden || arrangeFlyout.winControl.hide();
                                        break;
                                    case"orderFlyout":
                                        orderFlyout.winControl.hidden || orderFlyout.winControl.hide();
                                        break
                                }
                                return !0
                            }, CommandBarShortcutProvider.prototype._selectOptionByName = function(index) {
                                for (var i = 0, len = this._commandBarMenuItems.length; i < len; i++) {
                                    var setting = this._commandBarMenuItems[i];
                                    if (i === index) {
                                        this.selectedIndex(i);
                                        this._current(setting);
                                        return
                                    }
                                }
                                return !0
                            }, CommandBarShortcutProvider.prototype._moveDirection = function(direction) {
                                var id = event.currentTarget.id,
                                    items = [];
                                switch (id) {
                                    case"alignFlyout":
                                        items = this.getAlignFlyoutOptions();
                                        this._commandBarOptions(items, direction);
                                        break;
                                    case"copyPasteFlyout":
                                        items = this.getEditFlyoutOptions().filter(function(item) {
                                            return item.visible === !0
                                        });
                                        this._commandBarOptions(items, direction);
                                        break;
                                    case"arrangeFlyout":
                                        items = this.getArrangeFlyoutOptions();
                                        this._commandBarOptions(items, direction);
                                        break;
                                    case"orderFlyout":
                                        items = this.getOrderFlyoutOptions();
                                        this._commandBarOptions(items, direction);
                                        break;
                                    default:
                                        Contracts.checkNonEmptyArray(items);
                                        break
                                }
                                return !0
                            }, CommandBarShortcutProvider.prototype._commandBarOptions = function(items, direction) {
                                var current = this.selectedIndex();
                                this._commandBarMenuItems = items;
                                var len = items.length,
                                    moveTo = current;
                                direction === "down" ? (current < len && current++, current === len && (current = 0)) : direction === "up" && (current > 0 ? current-- : current === 0 && (current = len - 1));
                                current === -1 && (current = 0);
                                moveTo = current;
                                this._selectOptionByName(moveTo)
                            }, CommandBarShortcutProvider
                }(AppMagic.Common.Shortcuts.BaseShortcutProvider);
            Shortcuts.CommandBarShortcutProvider = CommandBarShortcutProvider
        })(Shortcuts = AuthoringTool.Shortcuts || (AuthoringTool.Shortcuts = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var Shortcuts;
        (function(Shortcuts) {
            var ShellShortcutProvider = function(_super) {
                    __extends(ShellShortcutProvider, _super);
                    function ShellShortcutProvider(shellViewModel) {
                        _super.call(this);
                        this._shellViewModel = shellViewModel;
                        this._buildShortcutKeys()
                    }
                    return ShellShortcutProvider.prototype._buildShortcutKeys = function() {
                            var _this = this;
                            this.addShortcutKey("Ctrl+s", function() {
                                return AppMagic.context.save(), !0
                            });
                            this.addShortcutKey("Ctrl+Shift+s", function() {
                                return AppMagic.context.saveAs(), !0
                            });
                            this.addShortcutKey("Alt+p", function() {
                                return _this._shellViewModel.displayBackStagePage(AppMagic.AuthoringStrings.Publish), !0
                            });
                            this.addShortcutKey("Alt+d", function() {
                                return _this._shellViewModel.displayBackStagePage(AppMagic.AuthoringStrings.DataSources), !0
                            });
                            this.addShortcutKey("F12", function() {
                                return AppMagic.context.saveAs(), !0
                            });
                            this.addShortcutKey("Alt+f", function() {
                                return AppMagic.context.documentViewModel.appBar.showFileFlyout(), !0
                            });
                            this.addShortcutKey("Alt+v", function() {
                                return AppMagic.context.documentViewModel.controlGallery.toggleVisualGallery(), !0
                            });
                            this.addShortcutKey("F1", function() {
                                return AppMagic.context.helpLink(AppMagic.AuthoringStrings.HelpLearnMoreUrl, "LearnMore"), !0
                            });
                            this.addShortcutKey("F5", function() {
                                return AppMagic.context.shellViewModel.togglePreview(), !0
                            });
                            this.addShortcutKey("Ctrl+=", function() {
                                return AppMagic.context.documentViewModel.zoom.zoomIn(), !0
                            });
                            this.addShortcutKey("Ctrl+-", function() {
                                return AppMagic.context.documentViewModel.zoom.zoomOut(), !0
                            });
                            this.addShortcutKey("Ctrl+Shift+=", function() {
                                return AppMagic.context.documentViewModel.zoom.zoomIn(), !0
                            });
                            this.addShortcutKey("Ctrl+Shift+-", function() {
                                return AppMagic.context.documentViewModel.zoom.zoomOut(), !0
                            });
                            this.addShortcutKey("Ctrl+0", function() {
                                return AppMagic.context.documentViewModel.zoom.fitToPage(AppMagic.AuthoringTool.Constants.Zoom.Source.userInvoked), !0
                            });
                            this.addShortcutKey("Ctrl+n", this._newDocumentCallback);
                            this.addShortcutKey("Ctrl+o", this._openDocumentCallback);
                            this.addShortcutKey("Alt+e", this._expressViewCallback);
                            this.addShortcutKey("Ctrl+m", this._newScreenCallback);
                            this.addShortcutKey("Ctrl+z", function() {
                                return AppMagic.context.documentViewModel.backStage.visible ? !1 : AppMagic.context.documentViewModel.undoManager.undo()
                            });
                            this.addShortcutKey("Ctrl+y", function() {
                                return AppMagic.context.documentViewModel.backStage.visible ? !1 : AppMagic.context.documentViewModel.undoManager.redo()
                            });
                            this.addShortcutKey("down: Alt", function() {
                                return AppMagic.context.documentViewModel.canvasManager.visualLabelsVisible = !0, !1
                            });
                            this.addShortcutKey("up: Alt", function() {
                                return AppMagic.context.documentViewModel.canvasManager.visualLabelsVisible = !1, !1
                            })
                        }, ShellShortcutProvider.prototype._newDocumentCallback = function() {
                            return AppMagic.context.documentViewModel.focusToScreenCanvas(), AppMagic.context.documentViewModel.hasChanges ? AppMagic.context.documentViewModel.appBar.performNewOrOpen(!0, null) : AppMagic.context.documentViewModel.appBar.newAction(), !0
                        }, ShellShortcutProvider.prototype._openDocumentCallback = function() {
                                return AppMagic.context.documentViewModel.hasChanges ? AppMagic.context.documentViewModel.appBar.performNewOrOpen(!1, null) : AppMagic.context.openFilePicker(), !0
                            }, ShellShortcutProvider.prototype._expressViewCallback = function() {
                                var activeElement = document.activeElement;
                                return activeElement !== null && activeElement.id === "controlGalleryFilterInput" && AppMagic.context.documentViewModel.focusToScreenCanvas(), AppMagic.context.documentViewModel.configuration.toggleVisibility(), AppMagic.context.documentViewModel.controlGallery.visible = !1, AppMagic.context.shellViewModel.hideAppBars(), !0
                            }, ShellShortcutProvider.prototype._newScreenCallback = function() {
                                return topAppBar.winControl.hidden ? !1 : (AppMagic.context.documentViewModel.appBar.handleAddScreenClicked(), !0)
                            }, ShellShortcutProvider
                }(AppMagic.Common.Shortcuts.BaseShortcutProvider);
            Shortcuts.ShellShortcutProvider = ShellShortcutProvider
        })(Shortcuts = AuthoringTool.Shortcuts || (AuthoringTool.Shortcuts = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Authoring;
    (function(Authoring) {
        var TableDataSourceReaderWriter = function() {
                function TableDataSourceReaderWriter(dataSource) {
                    this._dataSource = dataSource
                }
                return TableDataSourceReaderWriter.prototype._getConfigurationAndInternalConfiguration = function() {
                        var configuration = JSON.parse(this._dataSource.configuration);
                        return {
                                configuration: configuration, internalConfiguration: configuration.internalConfiguration
                            }
                    }, Object.defineProperty(TableDataSourceReaderWriter.prototype, "name", {
                        get: function() {
                            return this._dataSource.name
                        }, enumerable: !0, configurable: !0
                    }), TableDataSourceReaderWriter.prototype.getData = function() {
                            var internalConfig = this._getConfigurationAndInternalConfiguration().internalConfiguration;
                            return internalConfig.data
                        }, TableDataSourceReaderWriter.prototype.getSchema = function() {
                            var internalConfig = this._getConfigurationAndInternalConfiguration().internalConfiguration;
                            return internalConfig.schema
                        }, TableDataSourceReaderWriter.prototype.setSchema = function(schema) {
                            var configAndInternalConfig = this._getConfigurationAndInternalConfiguration();
                            configAndInternalConfig.internalConfiguration.schema = schema;
                            this._dataSource.configuration = JSON.stringify(configAndInternalConfig.configuration)
                        }, TableDataSourceReaderWriter.prototype.setData = function(data) {
                            var configAndInternalConfig = this._getConfigurationAndInternalConfiguration();
                            configAndInternalConfig.internalConfiguration.data = data;
                            this._dataSource.configuration = JSON.stringify(configAndInternalConfig.configuration)
                        }, TableDataSourceReaderWriter
            }();
        Authoring.TableDataSourceReaderWriter = TableDataSourceReaderWriter
    })(Authoring = AppMagic.Authoring || (AppMagic.Authoring = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Authoring;
    (function(Authoring) {
        var TopAppBar = function() {
                function TopAppBar(){}
                return Object.defineProperty(TopAppBar.prototype, "disabled", {
                        get: function() {
                            return topAppBar.disabled
                        }, set: function(value) {
                                value && topAppBar.winControl.hide();
                                topAppBar.disabled = value
                            }, enumerable: !0, configurable: !0
                    }), TopAppBar
            }();
        Authoring.TopAppBar = TopAppBar
    })(Authoring = AppMagic.Authoring || (AppMagic.Authoring = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ViewModels;
        (function(ViewModels) {
            var RestServiceKeyConfigViewModel = function() {
                    function RestServiceKeyConfigViewModel(templateDefinition, settings, restConfigImportHandler, preferredLang) {
                        var serviceId = templateDefinition.serviceid,
                            templateFormVariableDescriptions = templateDefinition.variables,
                            dictionary = templateDefinition.docdictionary;
                        this._serviceId = serviceId;
                        this._settings = settings;
                        this._restConfigImportHandler = restConfigImportHandler;
                        this._afterConnectFn = null;
                        var userVariableNameValueMap = [];
                        for (var varName in templateFormVariableDescriptions) {
                            var templateVariableDef = templateFormVariableDescriptions[varName];
                            var varTitle = AppMagic.Services.Meta.RESTWorkerController.getDocTitleOrDefault(templateVariableDef, varName, dictionary, preferredLang);
                            userVariableNameValueMap.push({
                                name: varName, title: varTitle, inputtype: templateVariableDef.issecret ? "password" : "text", initialValue: ko.observable(null), value: ko.observable(null)
                            })
                        }
                        this._userVariables = ko.observableArray(userVariableNameValueMap);
                        this._syncVariableValuesWithDocument()
                    }
                    return Object.defineProperty(RestServiceKeyConfigViewModel.prototype, "serviceId", {
                            get: function() {
                                return this._serviceId
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(RestServiceKeyConfigViewModel.prototype, "userVariables", {
                            get: function() {
                                return this._userVariables()
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(RestServiceKeyConfigViewModel.prototype, "isConnectEnabled", {
                                get: function() {
                                    return this.userVariables.every(function(userVariable) {
                                            return userVariable.value().length > 0
                                        }) && this.userVariables.some(function(userVariable) {
                                            return userVariable.value() !== userVariable.initialValue()
                                        })
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(RestServiceKeyConfigViewModel.prototype, "isClearVisible", {
                                get: function() {
                                    return this._restConfigImportHandler.connectorHasDefaultTemplateValues
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(RestServiceKeyConfigViewModel.prototype, "isClearEnabled", {
                                get: function() {
                                    return this.userVariables.some(function(userVariable) {
                                            return userVariable.initialValue().length > 0
                                        })
                                }, enumerable: !0, configurable: !0
                            }), RestServiceKeyConfigViewModel.prototype.reset = function() {
                                this._syncVariableValuesWithDocument();
                                this._afterConnectFn = null
                            }, RestServiceKeyConfigViewModel.prototype.onHelpLinkClick = function() {
                                AppMagic.AuthoringTool.Utility.openLinkInBrowser(AppMagic.Strings.RestDialogHelpUrl)
                            }, RestServiceKeyConfigViewModel.prototype._syncVariableValuesWithDocument = function() {
                                var initialValues,
                                    values;
                                this._restConfigImportHandler.isUpdateOperation ? (initialValues = this._restConfigImportHandler.getTemplateUserValues() || {}, values = initialValues) : (initialValues = {}, values = this._getMostRecentlyUpdatedTemplateUserValuesFromSettings() || {});
                                var userVariables = this.userVariables;
                                userVariables.forEach(function(userVariable) {
                                    var initialValue = initialValues[userVariable.name] || "",
                                        value = values[userVariable.name] || "";
                                    userVariable.initialValue(initialValue);
                                    userVariable.value(value)
                                })
                            }, RestServiceKeyConfigViewModel.prototype._getUserVariableNamesAndValues = function() {
                                for (var userVariables = this.userVariables, namesAndValues = {}, i = 0, len = userVariables.length; i < len; i++) {
                                    var variableObj = userVariables[i];
                                    namesAndValues[variableObj.name] = variableObj.value()
                                }
                                return namesAndValues
                            }, RestServiceKeyConfigViewModel.prototype.onClickConnect = function() {
                                var _this = this,
                                    namesAndValues = this._getUserVariableNamesAndValues();
                                this._restConfigImportHandler.importConfigUsingUserTemplateValuesAsync(namesAndValues, !0).then(function(importResult) {
                                    if (importResult.success) {
                                        _this._syncVariableValuesWithDocument();
                                        _this._setMostRecentlyUpdatedTemplateUserValuesFromSettings(namesAndValues);
                                        _this.onAfterConnect(namesAndValues)
                                    }
                                })
                            }, RestServiceKeyConfigViewModel.prototype.onAfterConnect = function(namesAndValues) {
                                this._afterConnectFn && this._afterConnectFn()
                            }, RestServiceKeyConfigViewModel.prototype.onClickClear = function() {
                                var _this = this;
                                this._restConfigImportHandler.onClearUserVariableValuesAsync().then(function(result) {
                                    var success = result.success;
                                    if (success) {
                                        _this._syncVariableValuesWithDocument();
                                        _this.onAfterConnect(null)
                                    }
                                }, function(error){})
                            }, RestServiceKeyConfigViewModel.prototype.setAfterConnectCallback = function(fn) {
                                this._afterConnectFn = fn
                            }, RestServiceKeyConfigViewModel.prototype._setMostRecentlyUpdatedTemplateUserValuesFromSettings = function(mruTemplateUserValues) {
                                this._setSettingsData({templateVariableInitialValues: mruTemplateUserValues})
                            }, RestServiceKeyConfigViewModel.prototype._setSettingsData = function(settingsData) {
                                var settingsMarker = RestServiceKeyConfigViewModel.SettingsMarkerImportedRestServicePackage,
                                    importedRestServicesData = this._settings.getValue(settingsMarker);
                                importedRestServicesData = typeof importedRestServicesData == "undefined" ? {} : importedRestServicesData;
                                importedRestServicesData[this._serviceId] = settingsData;
                                this._settings.setValue(settingsMarker, importedRestServicesData)
                            }, RestServiceKeyConfigViewModel.prototype._getMostRecentlyUpdatedTemplateUserValuesFromSettings = function() {
                                var importedRestServicesData = this._settings.getValue(RestServiceKeyConfigViewModel.SettingsMarkerImportedRestServicePackage);
                                return typeof importedRestServicesData == "undefined" || typeof importedRestServicesData[this._serviceId] == "undefined" ? {} : importedRestServicesData[this._serviceId].templateVariableInitialValues
                            }, RestServiceKeyConfigViewModel.prototype._clearSettingsData = function() {
                                var settingsMarker = RestServiceKeyConfigViewModel.SettingsMarkerImportedRestServicePackage,
                                    importedRestServicesData = this._settings.getValue(settingsMarker);
                                importedRestServicesData && (delete importedRestServicesData[this._serviceId], this._settings.setValue(settingsMarker, importedRestServicesData))
                            }, RestServiceKeyConfigViewModel.SettingsMarkerImportedRestServicePackage = "IMPORTED_SERVICE_SAVED_TEMPLATE_VALUES", RestServiceKeyConfigViewModel
                }();
            ViewModels.RestServiceKeyConfigViewModel = RestServiceKeyConfigViewModel
        })(ViewModels = AuthoringTool.ViewModels || (AuthoringTool.ViewModels = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ViewModels;
        (function(ViewModels) {
            var AzureServiceKeyConfigViewModel = function(_super) {
                    __extends(AzureServiceKeyConfigViewModel, _super);
                    function AzureServiceKeyConfigViewModel(templateDefinition, settings, restConfigImportHandler, preferredLang) {
                        _super.call(this, templateDefinition, settings, restConfigImportHandler, preferredLang);
                        this._registrationSuccessVisible = ko.observable(!1)
                    }
                    return Object.defineProperty(AzureServiceKeyConfigViewModel.prototype, "registrationSuccessVisible", {
                            get: function() {
                                return this._registrationSuccessVisible()
                            }, enumerable: !0, configurable: !0
                        }), AzureServiceKeyConfigViewModel.prototype.onAfterConnect = function(namesAndValues) {
                            this._updateAzureConnectionManager(namesAndValues);
                            _super.prototype.onAfterConnect.call(this, namesAndValues)
                        }, AzureServiceKeyConfigViewModel.prototype.onRegistrationLinkClick = function() {
                                var _this = this,
                                    connectionManager = AppMagic.AuthoringTool.Runtime.azureConnectionManager;
                                connectionManager.clientAppInfo = null;
                                connectionManager.disconnect();
                                connectionManager.connectAsync(!1).then(function(connectResult) {
                                    connectResult.success && (_this._applyRegistrationValues(connectResult.result), _this.onClickConnect(), _this._updateAzureConnectionManagerWithAppInfo(connectResult.result))
                                }, function(error){})
                            }, AzureServiceKeyConfigViewModel.prototype._applyRegistrationValues = function(result) {
                                var _this = this;
                                var values = {};
                                values[AppMagic.Services.AzureConstants.TemplateVariableNames.Office365.clientId] = result.clientId;
                                values[AppMagic.Services.AzureConstants.TemplateVariableNames.Office365.redirectUri] = result.redirectUri;
                                values[AppMagic.Services.AzureConstants.TemplateVariableNames.Office365.tenantId] = result.tenantId;
                                var userVariables = this.userVariables;
                                userVariables.forEach(function(userVariable) {
                                    var value = values[userVariable.name] || "";
                                    userVariable.value(value)
                                });
                                this._registrationSuccessVisible(!0);
                                setTimeout(function() {
                                    _this._registrationSuccessVisible(!1)
                                }, 5e3)
                            }, AzureServiceKeyConfigViewModel.prototype._updateAzureConnectionManagerWithAppInfo = function(appInfo) {
                                var Office365Constants = AppMagic.Services.AzureConstants.TemplateVariableNames.Office365,
                                    templateValues = {};
                                templateValues[Office365Constants.clientId] = appInfo.clientId;
                                templateValues[Office365Constants.tenantId] = appInfo.tenantId;
                                templateValues[Office365Constants.redirectUri] = appInfo.redirectUri;
                                this._updateAzureConnectionManager(templateValues)
                            }, AzureServiceKeyConfigViewModel.prototype._updateAzureConnectionManager = function(templateValues) {
                                var azureConnectionManager = AppMagic.AuthoringTool.Runtime.azureConnectionManager;
                                azureConnectionManager.connectWithTemplateVariableValues(templateValues)
                            }, AzureServiceKeyConfigViewModel
                }(ViewModels.RestServiceKeyConfigViewModel);
            ViewModels.AzureServiceKeyConfigViewModel = AzureServiceKeyConfigViewModel
        })(ViewModels = AuthoringTool.ViewModels || (AuthoringTool.ViewModels = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ViewModels;
        (function(ViewModels) {
            var LocalTableConfigViewModel = function() {
                    function LocalTableConfigViewModel(document, runtime, importCallback) {
                        this._errorMessages = ko.observableArray([]);
                        this._isInEditMode = ko.observable(!1);
                        this._tableName = ko.observable("");
                        this._document = document;
                        this._runtime = runtime;
                        this._importCallback = importCallback
                    }
                    return LocalTableConfigViewModel.prototype._validateProperties = function() {
                            return this._errorMessages.removeAll(), this.tableName && this.tableName.trim().length !== 0 ? this._document.isNameAvailable(this.tableName) || this._errorMessages.push(AppMagic.AuthoringStrings.BackStageLocalTableErrorTableNameNotAvailable) : this._errorMessages.push(AppMagic.AuthoringStrings.BackStageLocalTableErrorEmptyName), this._errorMessages().length === 0
                        }, LocalTableConfigViewModel.prototype.createTable = function() {
                            this._validateProperties() && (this._importCallback([{
                                    suggestedName: this.tableName, configuration: {
                                            data: [], schema: AppMagic.Schema.createSchemaForArrayFromPointer([])
                                        }
                                }]), this.reset())
                        }, LocalTableConfigViewModel.prototype.reset = function() {
                                this._tableName("");
                                this._isInEditMode(!1);
                                this._errorMessages.removeAll()
                            }, Object.defineProperty(LocalTableConfigViewModel.prototype, "tableName", {
                                get: function() {
                                    return this._tableName()
                                }, set: function(tableName) {
                                        this._tableName(tableName)
                                    }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(LocalTableConfigViewModel.prototype, "isInEditMode", {
                                get: function() {
                                    return this._isInEditMode()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(LocalTableConfigViewModel.prototype, "errorMessages", {
                                get: function() {
                                    return this._errorMessages()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(LocalTableConfigViewModel.prototype, "isErrorVisible", {
                                get: function() {
                                    return this.errorMessages.length !== 0
                                }, enumerable: !0, configurable: !0
                            }), LocalTableConfigViewModel.prototype.enterEditMode = function() {
                                this._isInEditMode(!0)
                            }, LocalTableConfigViewModel
                }();
            ViewModels.LocalTableConfigViewModel = LocalTableConfigViewModel
        })(ViewModels = AuthoringTool.ViewModels || (AuthoringTool.ViewModels = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ViewModels;
        (function(ViewModels) {
            var MacroBackstageViewModel = function(_super) {
                    __extends(MacroBackstageViewModel, _super);
                    function MacroBackstageViewModel(doc, undoManager) {
                        var _this = this;
                        _super.call(this);
                        this._allMacros = ko.observableArray([]);
                        this._currentIndex = ko.observable(0);
                        this._currentIndexEditing = ko.observable(!1);
                        this._doc = null;
                        this._macroListValues = ko.observableArray([]);
                        this._macroName = ko.observable("");
                        this._nameEditValue = ko.observable("");
                        this._ruleViewerValues = ko.observableArray([]);
                        this._squiggleWidth = ko.observable("0px");
                        this._squiggleVisible = ko.observable(!1);
                        this._undoManager = null;
                        this._doc = doc;
                        this._undoManager = undoManager;
                        this.track("_macroListValues", ko.computed(function() {
                            return _this._allMacros()
                        }))
                    }
                    return Object.defineProperty(MacroBackstageViewModel.prototype, "currentIndex", {
                            get: function() {
                                return this._currentIndex()
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(MacroBackstageViewModel.prototype, "currentIndexEditing", {
                            get: function() {
                                return this._currentIndexEditing()
                            }, set: function(value) {
                                    this._currentIndexEditing(value)
                                }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(MacroBackstageViewModel.prototype, "macroListValues", {
                                get: function() {
                                    return this._macroListValues()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(MacroBackstageViewModel.prototype, "macroName", {
                                get: function() {
                                    return this._macroName()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(MacroBackstageViewModel.prototype, "nameEditValue", {
                                get: function() {
                                    return this._nameEditValue
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(MacroBackstageViewModel.prototype, "ruleViewerValues", {
                                get: function() {
                                    return this._ruleViewerValues()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(MacroBackstageViewModel.prototype, "squiggleVisible", {
                                get: function() {
                                    return this._squiggleVisible()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(MacroBackstageViewModel.prototype, "squiggleWidth", {
                                get: function() {
                                    return this._squiggleWidth()
                                }, set: function(value) {
                                        this._squiggleWidth(value)
                                    }, enumerable: !0, configurable: !0
                            }), MacroBackstageViewModel.prototype.reload = function() {
                                this._updateMacroList()
                            }, MacroBackstageViewModel.prototype._navigateToExpressviewRule = function(screenName, controlNames, propertyName) {
                                return screenName !== null && controlNames !== null && propertyName !== null && (this._currentIndex(0), this._updateMacroList(), this.navigateToExpressviewRule(screenName, controlNames, propertyName)), !0
                            }, MacroBackstageViewModel.prototype._refreshAndSelect = function(macroName) {
                                var _this = this;
                                this._currentIndexEditing(!1);
                                this._currentIndex(0);
                                this._updateMacroList();
                                this._macroListValues().some(function(macroListValue, index) {
                                    return macroListValue.name() === macroName && (_this._currentIndex(index), _this._updateMacroList()), macroListValue.name() === macroName
                                })
                            }, MacroBackstageViewModel.prototype.handleDeleteClick = function(indexObservable) {
                                var index = indexObservable(),
                                    len = this._macroListValues().length;
                                var macroName = this._macroListValues()[index].name();
                                this.handleMacroClick(indexObservable);
                                this.removeMacro(macroName, this._refreshAndSelect.bind(this));
                                this._currentIndexEditing(!1);
                                index === len - 1 && len > 1 && this._currentIndex(this._currentIndex() - 1);
                                this._updateMacroList()
                            }, MacroBackstageViewModel.prototype.handleMacroClick = function(indexObservable) {
                                var index = indexObservable();
                                return this._currentIndex() !== index && (this._currentIndex(index), this._updateMacroUses()), !0
                            }, MacroBackstageViewModel.prototype._resetList = function() {
                                this._currentIndex(0);
                                this._updateMacroUses()
                            }, MacroBackstageViewModel.prototype.handleNameClick = function(indexObservable) {
                                var index = indexObservable();
                                var currentIndex = this._currentIndex(),
                                    openEditBox = index === currentIndex;
                                return this.handleMacroClick(indexObservable), openEditBox && (this._squiggleVisible(!1), this._currentIndexEditing(!0), this._nameEditValue(this._macroListValues()[currentIndex].name()), this.dispatchEvent(MacroBackstageViewModel.events.clickmacroname)), !0
                            }, MacroBackstageViewModel.prototype.handleNameEditKeyup = function() {
                                var current = this._macroListValues()[this._currentIndex()];
                                var currentName = current.name(),
                                    nameEditValue = this._nameEditValue();
                                if (currentName === nameEditValue)
                                    this._squiggleVisible(!1);
                                else {
                                    var success = this.tryMacroRename(currentName, nameEditValue, this._refreshAndSelect.bind(this));
                                    success ? (this._squiggleVisible(!1), current.name(nameEditValue), this._updateMacroUses()) : (this.dispatchEvent(MacroBackstageViewModel.events.failedmacrorename), this._squiggleVisible(!0))
                                }
                                return !0
                            }, MacroBackstageViewModel.prototype.handleNameEditKeydown = function(data, e) {
                                return this.dispatchEvent(MacroBackstageViewModel.events.keydownnameedit, {key: e.key}), !0
                            }, MacroBackstageViewModel.prototype.handleRuleHeadingClick = function(indexObservable) {
                                var index = indexObservable();
                                var current = this._ruleViewerValues()[index];
                                current.screen !== null ? this._navigateToExpressviewRule(current.screen, current.control, current.property) : this._refreshAndSelect(current.name)
                            }, MacroBackstageViewModel.prototype._updateMacroList = function() {
                                var _this = this;
                                this._allMacros.removeAll();
                                var macroArr = this.getMacros();
                                macroArr.sort(function(first, second) {
                                    return first.name.localeCompare(second.name)
                                });
                                macroArr.forEach(function(macro) {
                                    _this._allMacros.push({
                                        name: ko.observable(macro.name), script: _this._buildHighlightedRuleArray(macro.script)
                                    })
                                });
                                this._updateMacroUses()
                            }, MacroBackstageViewModel.prototype._updateMacroUses = function() {
                                var _this = this;
                                this._ruleViewerValues.removeAll();
                                var currentIndex = this._currentIndex();
                                if (!(currentIndex >= this._macroListValues().length)) {
                                    var macroName = this._macroListValues()[currentIndex].name();
                                    this._macroName(macroName);
                                    var uses = this.getMacroUsesInRules(macroName);
                                    uses.forEach(function(use) {
                                        _this._ruleViewerValues.push({
                                            name: use.name.join(" > "), screen: use.name[0], property: use.name[use.name.length - 1], control: use.name.slice(1, use.name.length - 1), script: _this._buildHighlightedRuleArray(use.script)
                                        })
                                    });
                                    uses = this.getMacroUsesInMacros(macroName);
                                    uses.forEach(function(use) {
                                        _this._ruleViewerValues.push({
                                            name: use.name.join(" > "), screen: null, property: null, control: null, script: _this._buildHighlightedRuleArray(use.script)
                                        })
                                    })
                                }
                            }, MacroBackstageViewModel.prototype._buildHighlightedRuleArray = function(script) {
                                var spans = this.getMacroLocations(script);
                                var cur = 0,
                                    result = [];
                                return spans.forEach(function(span) {
                                        cur !== span.min && result.push({
                                            text: script.substring(cur, span.min), highlight: !1
                                        });
                                        result.push({
                                            text: script.substring(span.min, span.lim), highlight: !0
                                        });
                                        cur = span.lim
                                    }), cur < script.length && result.push({
                                        text: script.substring(cur, script.length), highlight: !1
                                    }), result
                            }, MacroBackstageViewModel.prototype.getMacros = function() {
                                var _this = this,
                                    macroNames = AppMagic.Utility.enumerableToArray(this._doc.getMacroNames()),
                                    macros = [];
                                return macroNames.forEach(function(macro) {
                                        macros.push({
                                            name: macro, script: _this._doc.safeMacroScript(macro)
                                        })
                                    }), macros
                            }, MacroBackstageViewModel.prototype.getMacroLocations = function(script) {
                                return AppMagic.Utility.enumerableToArray(this._doc.getMacroLocations(script))
                            }, MacroBackstageViewModel.prototype.getMacroUsesInRules = function(macroName) {
                                var macroUsesInRules = AppMagic.Utility.enumerableToArray(this._doc.getMacroUses(macroName, !0, !1)),
                                    macros = [];
                                return macroUsesInRules.forEach(function(macro) {
                                        macros.push({
                                            name: AppMagic.Utility.enumerableToArray(macro.name), script: macro.script
                                        })
                                    }), macros
                            }, MacroBackstageViewModel.prototype.getMacroUsesInMacros = function(macroName) {
                                var macroUsesInMacros = AppMagic.Utility.enumerableToArray(this._doc.getMacroUses(macroName, !1, !0)),
                                    macros = [];
                                return macroUsesInMacros.forEach(function(macro) {
                                        macros.push({
                                            name: [macro.name.first().current], script: macro.script
                                        })
                                    }), macros
                            }, MacroBackstageViewModel.prototype.navigateToExpressviewRule = function(screenName, controlNames, propertyName) {
                                var controlName = null;
                                controlNames.length !== 0 && (controlName = controlNames[controlNames.length - 1]);
                                AppMagic.context.documentViewModel.backStage.handleBackButtonClick();
                                AppMagic.context.documentViewModel.navigateToExpressviewRule(screenName, controlName, propertyName)
                            }, MacroBackstageViewModel.prototype.removeMacro = function(macroName, callback) {
                                this._undoManager.performUndoableAction(function() {
                                    return this._doc.removeMacro(macroName, !0), !0
                                }.bind(this), function() {
                                    callback(macroName)
                                }, function() {
                                    callback(macroName)
                                })
                            }, MacroBackstageViewModel.prototype.tryMacroRename = function(oldMacroName, newMacroName, callback) {
                                if (!this._doc.isMacroRenameValid(oldMacroName, newMacroName))
                                    return !1;
                                var success = this._undoManager.performUndoableAction(function() {
                                        return this._doc.tryRenameMacro(oldMacroName, newMacroName)
                                    }.bind(this), function() {
                                        callback(oldMacroName)
                                    }, function() {
                                        callback(newMacroName)
                                    });
                                return success
                            }, MacroBackstageViewModel.prototype.notifyClickBack = function() {
                                return !0
                            }, MacroBackstageViewModel.events = {
                                clickmacroname: "clickmacroname", failedmacrorename: "failedmacrorename", keydownnameedit: "keydownnameedit"
                            }, MacroBackstageViewModel
                }(AppMagic.Utility.Disposable);
            ViewModels.MacroBackstageViewModel = MacroBackstageViewModel;
            WinJS.Class.mix(MacroBackstageViewModel, WinJS.Utilities.eventMixin)
        })(ViewModels = AuthoringTool.ViewModels || (AuthoringTool.ViewModels = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ViewModels;
        (function(ViewModels) {
            var CloudTableConfigViewModel = function() {
                    function CloudTableConfigViewModel(runtime, importCallback) {
                        this._accountCredentials = {
                            accountName: "devstoreaccount1", baseUri: "http://127.0.0.1:10002", accountResource: "/devstoreaccount1", keyBase64: "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw=="
                        };
                        this._clientId = ko.observable("");
                        this._redirectUri = ko.observable("");
                        this._errorMessages = ko.observableArray([]);
                        this._isCloudTableSelectorVisible = ko.observable(!1);
                        this._runtime = runtime;
                        this._importCallback = importCallback;
                        this._accountRetrievalPromise = null;
                        var dispatcher = this._runtime.getStaticServiceDispatcher();
                        this._cloudTableWorkerController = new AppMagic.Services.CloudTableWorkerController(dispatcher)
                    }
                    return CloudTableConfigViewModel.prototype.searchAzure = function() {
                            var tableName = "mytable" + Date.now();
                            return this._runtime.addDataSourceToDocument(tableName, "cloudtable", this._accountCredentials), tableName
                        }, CloudTableConfigViewModel.prototype.generateGroupId = function(config, dataSourceName) {
                            return dataSourceName
                        }, CloudTableConfigViewModel.prototype._validateProperties = function() {
                                return this._errorMessages.removeAll(), this._clientId().length === 0 && this._errorMessages.push(AppMagic.AuthoringStrings.BackStageCloudTableErrorInvalidClientId), this._redirectUri().length === 0 && this._errorMessages.push(AppMagic.AuthoringStrings.BackStageCloudTableErrorInvalidRedirectUri), this._errorMessages().length === 0
                            }, Object.defineProperty(CloudTableConfigViewModel.prototype, "clientId", {
                                get: function() {
                                    return this._clientId()
                                }, set: function(value) {
                                        this._clientId(value)
                                    }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(CloudTableConfigViewModel.prototype, "redirectUri", {
                                get: function() {
                                    return this._redirectUri()
                                }, set: function(value) {
                                        this._redirectUri(value)
                                    }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(CloudTableConfigViewModel.prototype, "isCloudTableSelectorVisible", {
                                get: function() {
                                    return this._isCloudTableSelectorVisible()
                                }, enumerable: !0, configurable: !0
                            }), CloudTableConfigViewModel.prototype.showAuthForm = function() {
                                this._isCloudTableSelectorVisible(!1)
                            }, CloudTableConfigViewModel.prototype.connect = function() {
                                var _this = this;
                                if (this._validateProperties()) {
                                    this._accountRetrievalPromise !== null && this._accountRetrievalPromise.cancel();
                                    var connectionManager = this._runtime.azureConnectionManager;
                                    var provider = connectionManager.cloudTableAccountProvider;
                                    this._accountRetrievalPromise = provider.getCloudTableAccountAsync().then(function(accountResult) {
                                        if (!accountResult.success) {
                                            _this._errorMessages.push(AppMagic.AuthoringStrings.BackStageCloudTableErrorCannotRetrieveStorageAccounts);
                                            return
                                        }
                                        var accountInfo = accountResult.result,
                                            tableName = "mytable" + Date.now();
                                        _this._accountCredentials = {
                                            accountName: accountInfo.accountName, baseUri: Core.Utility.formatString(AppMagic.Services.CloudTableAccountProvider.tableUriFormatString, accountInfo.accountName), keyBase64: accountInfo.keyBase64, accountResource: ""
                                        };
                                        _this._accountRetrievalPromise = null
                                    }, function(error) {
                                        _this._accountRetrievalPromise = null;
                                        _this._errorMessages.push(AppMagic.AuthoringStrings.BackStageCloudTableErrorCannotRetrieveStorageAccounts)
                                    });
                                    this._isCloudTableSelectorVisible(!0)
                                }
                            }, CloudTableConfigViewModel.prototype.useAzureSubscription = function(){}, CloudTableConfigViewModel.prototype.newTable = function() {
                                this._importCallback(this.searchAzure())
                            }, CloudTableConfigViewModel.prototype.newTableFromExcel = function(){}, CloudTableConfigViewModel
                }();
            ViewModels.CloudTableConfigViewModel = CloudTableConfigViewModel;
            WinJS.Class.mix(CloudTableConfigViewModel, WinJS.Utilities.eventMixin)
        })(ViewModels = AuthoringTool.ViewModels || (AuthoringTool.ViewModels = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ViewModels;
        (function(ViewModels) {
            var AppSettingsViewModel = function(_super) {
                    __extends(AppSettingsViewModel, _super);
                    function AppSettingsViewModel(documentLayoutManager, shellViewModel) {
                        var _this = this;
                        _super.call(this);
                        this._orientations = [{
                                displayName: AppMagic.AuthoringStrings.AppSettingsPageOrientationLandscape, imageUrl: "/images/appsetting_landscape.svg", value: 0
                            }, {
                                displayName: AppMagic.AuthoringStrings.AppSettingsPageOrientationPortrait, imageUrl: "/images/appsetting_portrait.svg", value: 1
                            }];
                        Contracts.checkObject(documentLayoutManager);
                        Contracts.checkObject(shellViewModel);
                        this._documentLayoutManager = documentLayoutManager;
                        this._shellVM = shellViewModel;
                        this._currentOrientation = ko.observable(this._documentLayoutManager.orientation);
                        this._currentAspectRatio = ko.observable(this._documentLayoutManager.getDimensions());
                        this._canApply = ko.observable(!1);
                        this.track("_customAspectRatioWidth", ko.observable(this._documentLayoutManager.width).extend({numeric: this.customRangeRestriciton}));
                        this.track("_customAspectRatioHeight", ko.observable(this._documentLayoutManager.height).extend({numeric: this.customRangeRestriciton}));
                        this.trackAnonymous(this._currentAspectRatio.subscribe(function(newValue) {
                            _this._currentOrientation() === 0 ? (_this._customAspectRatioWidth(newValue.width), _this._customAspectRatioHeight(newValue.height)) : (_this._customAspectRatioWidth(newValue.height), _this._customAspectRatioHeight(newValue.width))
                        }, this));
                        this.trackAnonymous(this._currentOrientation.subscribe(function() {
                            var tempWidthHolding = _this._customAspectRatioHeight();
                            _this._customAspectRatioHeight(_this._customAspectRatioWidth());
                            _this._customAspectRatioWidth(tempWidthHolding)
                        }, this));
                        this._isCustomAspectRatio = ko.observable(this._isCurrentCustomAspectRatio());
                        this.track("_eventTracker", new AppMagic.Utility.EventTracker);
                        this._eventTracker.add(documentLayoutManager, "documentlayoutchanged", this.layoutChanged.bind(this))
                    }
                    return Object.defineProperty(AppSettingsViewModel.prototype, "orientations", {
                            get: function() {
                                return this._orientations
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(AppSettingsViewModel.prototype, "aspectRatios", {
                            get: function() {
                                if (Core.Utility.isNullOrUndefined(this._aspectRatio)) {
                                    this._aspectRatio = [];
                                    for (var platform in AppMagic.DocumentLayout.Constants.Platforms)
                                        this._aspectRatio.push(AppMagic.DocumentLayout.Constants.Platforms[platform])
                                }
                                return this._aspectRatio
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(AppSettingsViewModel.prototype, "customAspectRatioWidth", {
                                get: function() {
                                    return this._customAspectRatioWidth
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(AppSettingsViewModel.prototype, "customAspectRatioHeight", {
                                get: function() {
                                    return this._customAspectRatioHeight
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(AppSettingsViewModel.prototype, "isCustomAspectRatio", {
                                get: function() {
                                    return this._isCustomAspectRatio()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(AppSettingsViewModel.prototype, "canApply", {
                                get: function() {
                                    return this._canApply
                                }, enumerable: !0, configurable: !0
                            }), AppSettingsViewModel.prototype.isSelectedOrientation = function(value) {
                                return this._currentOrientation() === value
                            }, AppSettingsViewModel.prototype.isSelectedAspectRatio = function(width, height) {
                                return this._currentAspectRatio().width === width && this._currentAspectRatio().height === height
                            }, AppSettingsViewModel.prototype.previewWidth = function(width, height) {
                                return this._currentOrientation() === 0 ? width / height * 100 + "px" : height / width * 150 + "px"
                            }, AppSettingsViewModel.prototype.previewHeight = function() {
                                return this._currentOrientation() === 0 ? 100 + "px" : 150 + "px"
                            }, AppSettingsViewModel.prototype.reload = function(){}, AppSettingsViewModel.prototype.onClickApply = function() {
                                var _this = this;
                                if (this._isCustomAspectRatio())
                                    this._canApply(!1),
                                    this._documentLayoutManager.changeDimensions(this._customAspectRatioWidth(), this._customAspectRatioHeight());
                                else {
                                    if (this._documentLayoutManager.getDimensions().width !== this._currentAspectRatio().width || this._documentLayoutManager.getDimensions().height !== this._currentAspectRatio().height) {
                                        this._canApply(!1);
                                        var options = {
                                                descriptionText: AppMagic.AuthoringStrings.AppSettingsPageAspectRatioWaitDescriptionText, showCancelButton: !1, skipAnimationDelay: !0
                                            };
                                        this._shellVM.wait.startAsync(AppMagic.AuthoringStrings.AppSettingsPageAspectRatioWaitMessageText, options).then(function() {
                                            return WinJS.Promise.timeout(500).then(function() {
                                                    _this._documentLayoutManager.changeDimensions(_this._currentAspectRatio().width, _this._currentAspectRatio().height)
                                                })
                                        }).done(function() {
                                            _this._shellVM.wait.stop()
                                        })
                                    }
                                    this._documentLayoutManager.orientation !== this._currentOrientation() && (this._canApply(!1), this._documentLayoutManager.changeOrientation(this._currentOrientation()))
                                }
                            }, AppSettingsViewModel.prototype.layoutChanged = function() {
                                this._checkCanApply()
                            }, AppSettingsViewModel.prototype.notifyClickBack = function() {
                                return !0
                            }, AppSettingsViewModel.prototype.onOrientationClick = function(value) {
                                this._currentOrientation(value);
                                this._checkCanApply()
                            }, AppSettingsViewModel.prototype.onAspectRatioClick = function(width, height) {
                                this._isCustomAspectRatio(!1);
                                this._currentAspectRatio({
                                    width: width, height: height
                                });
                                this._checkCanApply()
                            }, AppSettingsViewModel.prototype.focusInputBox = function(element) {
                                this._isCustomAspectRatio(!0);
                                element.children["custom-input"].focus()
                            }, AppSettingsViewModel.prototype.customRangeRestriciton = function(value) {
                                return Core.Utility.clamp(value, AppMagic.DocumentLayout.Constants.CustomLimits.Min, AppMagic.DocumentLayout.Constants.CustomLimits.Max)
                            }, AppSettingsViewModel.prototype._isCurrentCustomAspectRatio = function() {
                                for (var i = 0, len = this.aspectRatios.length; i < len; i++) {
                                    var value = this.aspectRatios[i];
                                    if (this.isSelectedAspectRatio(value.width, value.height))
                                        return !1
                                }
                                return !0
                            }, AppSettingsViewModel.prototype._checkCanApply = function() {
                                this._canApply(this._documentLayoutManager.getDimensions().width !== this._currentAspectRatio().width || this._documentLayoutManager.getDimensions().height !== this._currentAspectRatio().height || this._documentLayoutManager.orientation !== this._currentOrientation())
                            }, AppSettingsViewModel
                }(AppMagic.Utility.Disposable);
            ViewModels.AppSettingsViewModel = AppSettingsViewModel
        })(ViewModels = AuthoringTool.ViewModels || (AuthoringTool.ViewModels = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ObjectViewer;
        (function(ObjectViewer) {
            var TextMeasurer = function() {
                    function TextMeasurer(container) {
                        this._container = container
                    }
                    return TextMeasurer.prototype.measure = function(text) {
                            return this._container.innerText = text, new AppMagic.Size(this._container.offsetWidth + 1, this._container.offsetHeight)
                        }, TextMeasurer.prototype.hideContainer = function() {
                            this._container.style.display = "none"
                        }, TextMeasurer.prototype.showContainer = function() {
                                this._container.style.display = "block"
                            }, TextMeasurer
                }();
            ObjectViewer.TextMeasurer = TextMeasurer
        })(ObjectViewer = AuthoringTool.ObjectViewer || (AuthoringTool.ObjectViewer = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ViewModels;
        (function(ViewModels) {
            var PixelBoundsViewModel = function(_super) {
                    __extends(PixelBoundsViewModel, _super);
                    function PixelBoundsViewModel(control, rules) {
                        _super.call(this);
                        this._css = null;
                        this._minimumSize = {
                            width: 0, height: 0
                        };
                        Contracts.checkValue(control);
                        Contracts.checkValue(rules);
                        this._control = control;
                        this._rules = rules;
                        this._x = ko.observable(this._getDefaultValue(AppMagic.AuthoringTool.OpenAjaxPropertyNames.X));
                        this._y = ko.observable(this._getDefaultValue(AppMagic.AuthoringTool.OpenAjaxPropertyNames.Y));
                        this._width = ko.observable(this._getDefaultValue(AppMagic.AuthoringTool.OpenAjaxPropertyNames.Width));
                        this._height = ko.observable(this._getDefaultValue(AppMagic.AuthoringTool.OpenAjaxPropertyNames.Height));
                        this._gridVisual = new AppMagic.DocumentLayout.LayoutGridVisual(this._x, this._y, this._width, this._height, control.template.className);
                        this.trackObjectProperties("_css", {
                            x: ko.computed(function() {
                                return this._gridVisual.x.toString() + "px"
                            }, this), y: ko.computed(function() {
                                    return this._gridVisual.y.toString() + "px"
                                }, this), width: ko.computed(function() {
                                    return this._gridVisual.width.toString() + "px"
                                }, this), height: ko.computed(function() {
                                    return this._gridVisual.height.toString() + "px"
                                }, this)
                        })
                    }
                    return PixelBoundsViewModel.prototype._getDefaultValue = function(propertyName) {
                            Contracts.checkNonEmpty(propertyName);
                            var result = this._control.template.tryGetPropertyInvariant(propertyName);
                            return result.value ? (Contracts.check(!isNaN(parseInt(result.property.defaultValue))), parseInt(result.property.defaultValue)) : 0
                        }, PixelBoundsViewModel.prototype.alignHorizontal = function(position, value) {
                            Contracts.checkRange(position, -1, 1);
                            Contracts.checkNumber(value);
                            this.x = position < 0 ? value : position > 0 ? value - this._width() : value - this._width() / 2
                        }, PixelBoundsViewModel.prototype.alignVertical = function(position, value) {
                                Contracts.checkRange(position, -1, 1);
                                Contracts.checkNumber(value);
                                this.y = position < 0 ? value : position > 0 ? value - this._height() : value - this._height() / 2
                            }, PixelBoundsViewModel.prototype.resize = function(cornerPoint, newX, newY) {
                                Contracts.check(cornerPoint === "n" || cornerPoint === "ne" || cornerPoint === "e" || cornerPoint === "se" || cornerPoint === "s" || cornerPoint === "sw" || cornerPoint === "w" || cornerPoint === "nw");
                                Contracts.checkNumber(newX);
                                Contracts.checkNumber(newY);
                                this._containerSize && (newX = Core.Utility.clamp(newX, 0, this._containerSize.width), newY = Core.Utility.clamp(newY, 0, this._containerSize.height));
                                var x = this.left,
                                    y = this.top,
                                    right = this.right,
                                    bottom = this.bottom;
                                cornerPoint.indexOf("n") >= 0 ? y = Math.min(newY, bottom - this._minimumSize.height) : cornerPoint.indexOf("s") >= 0 && (bottom = Math.max(newY, y + this._minimumSize.height));
                                cornerPoint.indexOf("w") >= 0 ? x = Math.min(newX, right - this._minimumSize.width) : cornerPoint.indexOf("e") >= 0 && (right = Math.max(newX, x + this._minimumSize.width));
                                var width = right - x,
                                    height = bottom - y;
                                cornerPoint.indexOf("n") >= 0 ? this._setYAndHeightTogether(y, height) : cornerPoint.indexOf("s") >= 0 && (this.height = height);
                                cornerPoint.indexOf("w") >= 0 ? this._setXAndWidthTogether(x, width) : cornerPoint.indexOf("e") >= 0 && (this.width = width)
                            }, PixelBoundsViewModel.prototype.resizeScale = function(cornerPoint, originalWidth, originalHeight, scaleX, scaleY) {
                                Contracts.check(cornerPoint === "n" || cornerPoint === "ne" || cornerPoint === "e" || cornerPoint === "se" || cornerPoint === "s" || cornerPoint === "sw" || cornerPoint === "w" || cornerPoint === "nw");
                                Contracts.checkNumber(originalWidth);
                                Contracts.checkNumber(originalHeight);
                                Contracts.checkNumber(scaleX);
                                Contracts.checkNumber(scaleY);
                                var scaledWidth = originalWidth * scaleX,
                                    scaledHeight = originalHeight * scaleY,
                                    newX,
                                    newY;
                                newY = cornerPoint.indexOf("n") >= 0 ? this.bottom - scaledHeight : this.top + scaledHeight;
                                newX = cornerPoint.indexOf("w") >= 0 ? this.right - scaledWidth : this.left + scaledWidth;
                                this.resize(cornerPoint, newX, newY)
                            }, PixelBoundsViewModel.prototype.setContainerSize = function(width, height) {
                                Contracts.check(width >= 0);
                                Contracts.check(height >= 0);
                                this._containerSize = {
                                    width: width, height: height
                                }
                            }, PixelBoundsViewModel.prototype.setMinimumSize = function(width, height) {
                                Contracts.check(width >= 0);
                                Contracts.check(height >= 0);
                                this._minimumSize = {
                                    width: width, height: height
                                }
                            }, Object.defineProperty(PixelBoundsViewModel.prototype, "containerSize", {
                                get: function() {
                                    return this._containerSize
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(PixelBoundsViewModel.prototype, "x", {
                                get: function() {
                                    return this._x()
                                }, set: function(value) {
                                        this._clampAndSetX(value, this._width())
                                    }, enumerable: !0, configurable: !0
                            }), PixelBoundsViewModel.prototype.clampX = function(value, width) {
                                if (Contracts.checkNumber(value), Contracts.checkNumber(width), this._containerSize) {
                                    var maxValue = Math.max(0, this._containerSize.width - width);
                                    value = Core.Utility.clamp(value, 0, maxValue)
                                }
                                return value
                            }, PixelBoundsViewModel.prototype._clampAndSetX = function(value, width) {
                                Contracts.checkNumber(value);
                                Contracts.checkNumber(width);
                                var clampValue = this.clampX(value, width);
                                (clampValue !== value || this._x() !== clampValue) && (this._updateRule(this._rules.x, clampValue), this._x(clampValue))
                            }, Object.defineProperty(PixelBoundsViewModel.prototype, "y", {
                                get: function() {
                                    return this._y()
                                }, set: function(value) {
                                        this._clampAndSetY(value, this._height())
                                    }, enumerable: !0, configurable: !0
                            }), PixelBoundsViewModel.prototype.clampY = function(value, height) {
                                if (Contracts.checkNumber(value), Contracts.checkNumber(height), this._containerSize) {
                                    var maxValue = Math.max(0, this._containerSize.height - height);
                                    value = Core.Utility.clamp(value, 0, maxValue)
                                }
                                return value
                            }, PixelBoundsViewModel.prototype._clampAndSetY = function(value, height) {
                                Contracts.checkNumber(value);
                                Contracts.checkNumber(height);
                                var clampValue = this.clampY(value, height);
                                (clampValue !== value || this._y() !== clampValue) && (this._updateRule(this._rules.y, clampValue), this._y(clampValue))
                            }, Object.defineProperty(PixelBoundsViewModel.prototype, "minimumSize", {
                                get: function() {
                                    return this._minimumSize
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(PixelBoundsViewModel.prototype, "width", {
                                get: function() {
                                    return this._width()
                                }, set: function(value) {
                                        this._setWidth(value, this._x())
                                    }, enumerable: !0, configurable: !0
                            }), PixelBoundsViewModel.prototype._setWidth = function(value, x) {
                                Contracts.checkNumber(value);
                                Contracts.checkNumber(x);
                                this._containerSize && (value = Math.min(value, this._containerSize.width - x));
                                value = Math.max(value, this._minimumSize.width);
                                this._updateRule(this._rules.width, value);
                                this._width(value)
                            }, Object.defineProperty(PixelBoundsViewModel.prototype, "height", {
                                get: function() {
                                    return this._height()
                                }, set: function(value) {
                                        this._setHeight(value, this._y())
                                    }, enumerable: !0, configurable: !0
                            }), PixelBoundsViewModel.prototype._setHeight = function(value, y) {
                                Contracts.checkNumber(value);
                                Contracts.checkNumber(y);
                                this._containerSize && (value = Math.min(value, this._containerSize.height - y));
                                value = Math.max(value, this._minimumSize.height);
                                this._updateRule(this._rules.height, value);
                                this._height(value)
                            }, PixelBoundsViewModel.prototype._setXAndWidthTogether = function(x, width) {
                                Contracts.checkNumber(x);
                                Contracts.checkNumber(width);
                                this._setWidth(width, x);
                                this._clampAndSetX(x, this._width())
                            }, PixelBoundsViewModel.prototype._setYAndHeightTogether = function(y, height) {
                                Contracts.checkNumber(y);
                                Contracts.checkNumber(height);
                                this._setHeight(height, y);
                                this._clampAndSetY(y, this._height())
                            }, PixelBoundsViewModel.prototype.updateDimension = function(dimension, value) {
                                Contracts.checkNonEmpty(dimension);
                                Contracts.check(dimension === "x" || dimension === "y" || dimension === "height" || dimension === "width");
                                Contracts.checkNumberOrNull(value);
                                value !== null && this["_" + dimension](value)
                            }, PixelBoundsViewModel.prototype._updateRule = function(ruleVm, value) {
                                Contracts.checkDefined(ruleVm);
                                Contracts.checkNumber(value);
                                ruleVm.rhs = Microsoft.AppMagic.Common.LocalizationHelper.convertToLocaleSpecific(value.toString(), null)
                            }, Object.defineProperty(PixelBoundsViewModel.prototype, "left", {
                                get: function() {
                                    return this._x()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(PixelBoundsViewModel.prototype, "top", {
                                get: function() {
                                    return this._y()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(PixelBoundsViewModel.prototype, "right", {
                                get: function() {
                                    return this._x() + this._width()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(PixelBoundsViewModel.prototype, "bottom", {
                                get: function() {
                                    return this._y() + this._height()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(PixelBoundsViewModel.prototype, "gridVisual", {
                                get: function() {
                                    return this._gridVisual
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(PixelBoundsViewModel.prototype, "css", {
                                get: function() {
                                    return this._css
                                }, enumerable: !0, configurable: !0
                            }), PixelBoundsViewModel.prototype.refreshFromDocument = function() {
                                var openAjaxControl = OpenAjax.widget.byId(this._control.name);
                                if (openAjaxControl !== null) {
                                    var value = openAjaxControl.OpenAjax.getPropertyValue(AppMagic.AuthoringTool.OpenAjaxPropertyNames.X);
                                    Contracts.checkNumberOrNull(value);
                                    this.updateDimension("x", value);
                                    value = openAjaxControl.OpenAjax.getPropertyValue(AppMagic.AuthoringTool.OpenAjaxPropertyNames.Y);
                                    Contracts.checkNumberOrNull(value);
                                    this.updateDimension("y", value);
                                    value = openAjaxControl.OpenAjax.getPropertyValue(AppMagic.AuthoringTool.OpenAjaxPropertyNames.Width);
                                    Contracts.checkNumberOrNull(value);
                                    this.updateDimension("width", value);
                                    value = openAjaxControl.OpenAjax.getPropertyValue(AppMagic.AuthoringTool.OpenAjaxPropertyNames.Height);
                                    Contracts.checkNumberOrNull(value);
                                    this.updateDimension("height", value)
                                }
                            }, PixelBoundsViewModel.prototype.refreshAfterContainerSizeChange = function(refreshNested) {
                                Contracts.checkBooleanOrUndefined(refreshNested);
                                this._control.parent && (refreshNested || AppMagic.Utility.isScreen(this._control.parent.template.className)) && this._containerSize && (this._clampAndSetX(this._x(), this._width()), this._clampAndSetY(this._y(), this._height()), this._width() + this._x() > this._containerSize.width && (this.width = this._width() + (this._containerSize.width - (this._width() + this._x()))), this._height() + this._y() > this._containerSize.height && (this.height = this._height() + (this._containerSize.height - (this._height() + this._y()))))
                            }, PixelBoundsViewModel
                }(AppMagic.Utility.Disposable);
            ViewModels.PixelBoundsViewModel = PixelBoundsViewModel
        })(ViewModels = AuthoringTool.ViewModels || (AuthoringTool.ViewModels = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ViewModels;
        (function(ViewModels) {
            var ScreenViewModel = function(_super) {
                    __extends(ScreenViewModel, _super);
                    function ScreenViewModel(doc, entityManager, screenModel, controlManager, ruleFactory, zoom, loadedPromise) {
                        _super.call(this, doc, entityManager, screenModel, controlManager, ruleFactory, zoom);
                        this._created = !1;
                        this._index = ko.observable(0);
                        this._isCreationComplete = ko.observable(!1);
                        this._loadedPromise = loadedPromise;
                        this._index = ko.observable(this._control.index)
                    }
                    return ScreenViewModel.prototype.create = function() {
                            return this._created = !0, this._controlManager.create(null, this._control)
                        }, Object.defineProperty(ScreenViewModel.prototype, "index", {
                            get: function() {
                                return this._index()
                            }, set: function(value) {
                                    this._control.index = value;
                                    this._index(value)
                                }, enumerable: !0, configurable: !0
                        }), ScreenViewModel.prototype.notifyCreationComplete = function() {
                                this._isCreationComplete(!0)
                            }, Object.defineProperty(ScreenViewModel.prototype, "canvasErrorVisible", {
                                get: function() {
                                    return this._isCreationComplete() && this.hasErrors && !AppMagic.context.documentViewModel.isPreview
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(ScreenViewModel.prototype, "appBarErrorVisible", {
                                get: function() {
                                    return this._isCreationComplete() && this.descendantHasErrors
                                }, enumerable: !0, configurable: !0
                            }), ScreenViewModel.prototype.onHidden = function() {
                                var screenControl = OpenAjax.widget.byId(this._control.name);
                                screenControl !== null && screenControl.OpenAjax.fireEvent(AppMagic.AuthoringTool.OpenAjaxPropertyNames.OnHidden, screenControl)
                            }, ScreenViewModel.prototype.onVisible = function() {
                                this._loadedPromise.then(function() {
                                    var screenControl = OpenAjax.widget.byId(this._control.name);
                                    screenControl.OpenAjax.fireEvent(AppMagic.AuthoringTool.OpenAjaxPropertyNames.OnVisible, screenControl)
                                }.bind(this))
                            }, ScreenViewModel
                }(ViewModels.EntityViewModel);
            ViewModels.ScreenViewModel = ScreenViewModel
        })(ViewModels = AuthoringTool.ViewModels || (AuthoringTool.ViewModels = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ViewModels;
        (function(ViewModels) {
            var BackStage;
            (function(BackStage) {
                var ConnectionListViewModel = function() {
                        function ConnectionListViewModel(doc, dataConnectionsViewModel) {
                            this._document = doc;
                            this._dataConnectionsViewModel = dataConnectionsViewModel;
                            this._connectionList = ko.observableArray([]);
                            this._connectionHandlers = []
                        }
                        return Object.defineProperty(ConnectionListViewModel.prototype, "allConnections", {
                                get: function() {
                                    return this._connectionList().map(function(x) {
                                            return x.connectionViewModel
                                        })
                                }, enumerable: !0, configurable: !0
                            }), ConnectionListViewModel.prototype.showConnectionMember = function(memberInfo) {
                                for (var connections = this._connectionList(), i = 0, len = connections.length; i < len; i++) {
                                    var connection = connections[i];
                                    if (connection.connectionId === memberInfo.connectionId)
                                        return connection.connectionViewModel.showConnectionMember(memberInfo.connectionMemberId), connection.connectionViewModel
                                }
                                return null
                            }, ConnectionListViewModel.prototype.registerConnectionHandler = function(handler) {
                                    this._connectionHandlers.push(handler)
                                }, ConnectionListViewModel.prototype.refreshConnections = function() {
                                    for (var connectionList = this._connectionList(), connectionIdsOfExisting = new Collections.Generic.Dictionary, connectionCreationInfoByMemberIds = new Collections.Generic.Dictionary, entityIters = [this._document.dataSources.first(), this._document.getServices().first()], i = 0, len = entityIters.length; i < len; i++)
                                        for (var iter = entityIters[i]; iter.hasCurrent; ) {
                                            for (var j = 0, jlen = this._connectionHandlers.length; j < jlen; j++) {
                                                var handler = this._connectionHandlers[j],
                                                    entity = iter.current,
                                                    memberInfo = handler.getConnectionMemberInfo(entity);
                                                if (memberInfo !== null) {
                                                    connectionIdsOfExisting.setValue(memberInfo.connectionId, !0);
                                                    connectionCreationInfoByMemberIds.setValue(memberInfo.connectionMemberId, {
                                                        connectionId: memberInfo.connectionId, handler: handler, entity: entity
                                                    });
                                                    break
                                                }
                                            }
                                            iter.moveNext()
                                        }
                                    for (var currentConnections = new Collections.Generic.Dictionary, i = connectionList.length - 1; i >= 0; i--) {
                                        var connectionListItem = connectionList[i],
                                            connectionId = connectionListItem.connectionId;
                                        if (connectionIdsOfExisting.containsKey(connectionId)) {
                                            currentConnections.setValue(connectionId, connectionListItem);
                                            for (var connectionMemberIds = connectionListItem.connectionMemberIds.keys, itemsToBeRemoved = [], j = 0, jlen = connectionMemberIds.length; j < jlen; j++) {
                                                var connectionMemberId = connectionMemberIds[j];
                                                connectionCreationInfoByMemberIds.containsKey(connectionMemberId) ? connectionCreationInfoByMemberIds.deleteValue(connectionMemberId) : (itemsToBeRemoved.push(connectionMemberId), connectionListItem.connectionMemberIds.deleteValue(connectionMemberId))
                                            }
                                            connectionListItem.connectionViewModel.removeMembers(itemsToBeRemoved)
                                        }
                                        else {
                                            var connectionToBeRemoved = connectionList.splice(i, 1)[0];
                                            this._dataConnectionsViewModel.notifyRemoveConnection(connectionToBeRemoved.connectionViewModel)
                                        }
                                    }
                                    this._createNewConnectionsAndMembers(currentConnections, connectionCreationInfoByMemberIds);
                                    this._connectionList.valueHasMutated()
                                }, ConnectionListViewModel.prototype._createNewConnectionsAndMembers = function(currentConnections, newConnectionsByMemberId) {
                                    for (var connectionList = this._connectionList(), newMemberIds = newConnectionsByMemberId.keys, i = 0, len = newMemberIds.length; i < len; i++) {
                                        var newMemberId = newMemberIds[i],
                                            connectionId = newConnectionsByMemberId.getValue(newMemberId).connectionId,
                                            connectionListItem;
                                        if (currentConnections.containsKey(connectionId))
                                            connectionListItem = currentConnections.getValue(connectionId);
                                        else {
                                            var handler = newConnectionsByMemberId.getValue(newMemberId).handler,
                                                entity = newConnectionsByMemberId.getValue(newMemberId).entity,
                                                vm = handler.createConnectionViewModel(entity, this._dataConnectionsViewModel);
                                            connectionListItem = {
                                                connectionViewModel: vm, connectionId: connectionId, connectionMemberIds: new Collections.Generic.Dictionary
                                            };
                                            currentConnections.setValue(connectionId, connectionListItem);
                                            connectionList.unshift(connectionListItem)
                                        }
                                        connectionListItem.connectionMemberIds.setValue(newMemberId, !0);
                                        connectionListItem.connectionViewModel.addMember(newMemberId)
                                    }
                                }, ConnectionListViewModel.prototype.notifySelectConnection = function(connectionViewModel) {
                                    this._dataConnectionsViewModel.notifySelectConnection(connectionViewModel)
                                }, ConnectionListViewModel
                    }();
                BackStage.ConnectionListViewModel = ConnectionListViewModel
            })(BackStage = ViewModels.BackStage || (ViewModels.BackStage = {}))
        })(ViewModels = AuthoringTool.ViewModels || (AuthoringTool.ViewModels = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ConnectionListManager = function() {
                function ConnectionListManager(doc, connectionListViewModel) {
                    this._isStarted = !1;
                    this._document = doc;
                    this._connectionListViewModel = connectionListViewModel;
                    this._numCallsToRefreshConnectionList = 0;
                    this._connectionMemberToShowWhenAdded = null;
                    this._eventTracker = new AppMagic.Utility.EventTracker
                }
                return ConnectionListManager.prototype.showConnectionMemberWhenAdded = function(connectionId, memberId) {
                        this._connectionMemberToShowWhenAdded = {
                            connectionId: connectionId, connectionMemberId: memberId
                        }
                    }, ConnectionListManager.prototype.startManagingConnectionList = function() {
                        this._isStarted = !0;
                        this._eventTracker.add(this._document, "entityadded", this._entityAddedOrRemoved, this);
                        this._eventTracker.add(this._document, "entityremoved", this._entityAddedOrRemoved, this);
                        this._refreshConnectionList()
                    }, ConnectionListManager.prototype.stopManagingConnectionList = function() {
                            this._isStarted = !1;
                            this._eventTracker.remove(this._document, "entityadded");
                            this._eventTracker.remove(this._document, "entityremoved")
                        }, ConnectionListManager.prototype._entityAddedOrRemoved = function(evt) {
                            var _this = this;
                            evt.entityType !== Microsoft.AppMagic.Authoring.EntityType.service && evt.entityType !== Microsoft.AppMagic.Authoring.EntityType.serviceDataSource && (evt.entityType !== Microsoft.AppMagic.Authoring.EntityType.staticDataSource || evt.entity.isSampleData) || (this._numCallsToRefreshConnectionList === 0 && setImmediate(function() {
                                _this._refreshConnectionList()
                            }), this._numCallsToRefreshConnectionList++)
                        }, ConnectionListManager.prototype._refreshConnectionList = function() {
                            if (this._connectionListViewModel.refreshConnections(), this._connectionMemberToShowWhenAdded !== null) {
                                var shownConnection = this._connectionListViewModel.showConnectionMember(this._connectionMemberToShowWhenAdded);
                                shownConnection !== null && this.dispatchEvent(ConnectionListManager.events.connectiontoshowuponadd, shownConnection)
                            }
                            this._connectionMemberToShowWhenAdded = null;
                            this._numCallsToRefreshConnectionList = 0
                        }, ConnectionListManager.events = {connectiontoshowuponadd: "connectiontoshowuponadd"}, ConnectionListManager
            }();
        AuthoringTool.ConnectionListManager = ConnectionListManager;
        WinJS.Class.mix(ConnectionListManager, WinJS.Utilities.eventMixin)
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ViewModels;
        (function(ViewModels) {
            var TopAppBar = AppMagic.Authoring.TopAppBar,
                ShellViewModel = function() {
                    function ShellViewModel(documentViewModel, topAppBar) {
                        var _this = this;
                        this._previousZoomValue = 100;
                        this._topAppBar = topAppBar || new TopAppBar;
                        this._controlGallery = new AppMagic.AuthoringTool.ViewModels.ShellControlGalleryViewModel;
                        this._azure = new AppMagic.AuthoringTool.ViewModels.AzureViewModel;
                        this._wait = new AppMagic.AuthoringTool.ViewModels.WaitViewModel;
                        this._smallLayout = ko.observable(!1);
                        this._firstRun = new AppMagic.AuthoringTool.ViewModels.FirstLaunchViewModel;
                        this._globalShortcuts = new AppMagic.AuthoringTool.Shortcuts.ShellShortcutProvider(this);
                        var visible = ko.computed(function() {
                                if (documentViewModel() !== null)
                                    return documentViewModel().controlGallery.visible
                            }, this);
                        visible.subscribe(function(value) {
                            value && _this.hideAppBars()
                        });
                        this._eventTracker = new AppMagic.Utility.EventTracker;
                        this._eventTracker.add(this._wait, ViewModels.WaitViewModel.events.start, this._disableTopAppBar, this);
                        this._eventTracker.add(this._wait, ViewModels.WaitViewModel.events.stop, this._enableTopAppBar, this);
                        window.addEventListener("resize", function() {
                            var small = document.body.offsetWidth < AppMagic.AuthoringTool.Constants.SmallLayoutSize.width || document.body.offsetHeight < AppMagic.AuthoringTool.Constants.SmallLayoutSize.height;
                            this._smallLayout(small)
                        }.bind(this), !1)
                    }
                    return Object.defineProperty(ShellViewModel.prototype, "globalShortcuts", {
                            get: function() {
                                return this._globalShortcuts
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(ShellViewModel.prototype, "wait", {
                            get: function() {
                                return this._wait
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(ShellViewModel.prototype, "controlGallery", {
                                get: function() {
                                    return this._controlGallery
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(ShellViewModel.prototype, "azure", {
                                get: function() {
                                    return this._azure
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(ShellViewModel.prototype, "firstRun", {
                                get: function() {
                                    return this._firstRun
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(ShellViewModel.prototype, "smallLayout", {
                                get: function() {
                                    return this._smallLayout()
                                }, enumerable: !0, configurable: !0
                            }), ShellViewModel.prototype.reset = function() {
                                this.hideAppBars();
                                this.stopPreview()
                            }, ShellViewModel.prototype.hideAppBars = function() {
                                typeof topAppBar != "undefined" && topAppBar.winControl.hide()
                            }, ShellViewModel.prototype.startPreview = function() {
                                AppMagic.context.documentViewModel.isPreview || (this._previousZoomValue = AppMagic.context.documentViewModel.zoom.value, AppMagic.context.documentViewModel.zoom.setValue(100, AppMagic.AuthoringTool.Constants.Zoom.Source.automatic), this.hideAppBars(), AppMagic.context.documentViewModel.isPreview = !0, AppMagic.context.documentViewModel.controlGallery.visible = !1, this.dispatchEvent("previewstart"))
                            }, ShellViewModel.prototype.stopPreview = function() {
                                AppMagic.context.documentViewModel.isPreview && (this.hideAppBars(), AppMagic.context.documentViewModel.isPreview = !1, this.dispatchEvent("previewend"), AppMagic.context.documentViewModel.zoom.setValue(this._previousZoomValue, AppMagic.AuthoringTool.Constants.Zoom.Source.automatic))
                            }, ShellViewModel.prototype.togglePreview = function(targetPlatform) {
                                if (targetPlatform === void 0 && (targetPlatform = ""), AppMagic.context.documentViewModel.isPreview)
                                    this.stopPreview();
                                else {
                                    if (targetPlatform !== "") {
                                        var targetConstants = AppMagic.DocumentLayout.Constants.Platforms[targetPlatform];
                                        AppMagic.context.documentViewModel.documentLayoutManager.layoutEngine.setDesiredLayout(targetConstants.width, targetConstants.height)
                                    }
                                    else
                                        AppMagic.context.documentViewModel.documentLayoutManager.layoutEngine.setDesiredLayout(AppMagic.context.documentViewModel.documentLayoutManager.width, AppMagic.context.documentViewModel.documentLayoutManager.height);
                                    this.startPreview()
                                }
                            }, ShellViewModel.prototype.displayBackStagePage = function(pageName) {
                                AppMagic.context.documentViewModel.backStage.visible = !0;
                                AppMagic.context.documentViewModel.backStage.macroBackStageVisible = AppMagic.context.documentViewModel.hasMacros;
                                AppMagic.context.documentViewModel.backStage.selectSettingByName(pageName);
                                AppMagic.context.shellViewModel.hideAppBars()
                            }, ShellViewModel.prototype.shellShortcutsEnabled = function(key) {
                                return key === "Esc" && AppMagic.context.documentViewModel.isPreview ? !0 : !AppMagic.context.documentViewModel.isPreview && !this._wait.active
                            }, ShellViewModel.prototype._disableTopAppBar = function() {
                                this._topAppBar.disabled = !0
                            }, ShellViewModel.prototype._enableTopAppBar = function() {
                                this._topAppBar.disabled = !1
                            }, ShellViewModel
                }();
            ViewModels.ShellViewModel = ShellViewModel;
            WinJS.Class.mix(ShellViewModel, WinJS.Utilities.eventMixin)
        })(ViewModels = AuthoringTool.ViewModels || (AuthoringTool.ViewModels = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ViewModels;
        (function(ViewModels) {
            var FirstLaunchViewModel = function() {
                    function FirstLaunchViewModel() {
                        this._visible = ko.observable(!1);
                        this._videoSrc = ko.observable("");
                        this._onEndedHandler = this._onEnded.bind(this)
                    }
                    return Object.defineProperty(FirstLaunchViewModel.prototype, "visible", {
                            get: function() {
                                return this._visible()
                            }, enumerable: !0, configurable: !0
                        }), FirstLaunchViewModel.prototype.handleSkipTour = function() {
                            this._videoSrc("");
                            this._onEnded();
                            typeof topAppBar != "undefined" && topAppBar.winControl.show();
                            Microsoft.AppMagic.Common.TelemetrySession.telemetry.logFirstRunExperience("Skip")
                        }, Object.defineProperty(FirstLaunchViewModel.prototype, "videoSrc", {
                                get: function() {
                                    return this._videoSrc()
                                }, enumerable: !0, configurable: !0
                            }), FirstLaunchViewModel.prototype.checkIfShowFirstRunExperience = function() {
                                var currentLocale = Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleName;
                                return currentLocale.toLowerCase().indexOf("en") !== 0 ? WinJS.Promise.wrap(null) : WinJS.Application.local.exists(FirstLaunchViewModel.FirstLaunchFileName).then(function(exists) {
                                        return exists ? WinJS.Promise.wrap(null) : (Microsoft.AppMagic.Common.TelemetrySession.telemetry.logFirstRunExperience("Start"), this._visible(!0), this._videoSrc(AppMagic.AuthoringStrings.FirstLaunchUri), WinJS.Application.local.writeText(FirstLaunchViewModel.FirstLaunchFileName, "1"))
                                    }.bind(this))
                            }, FirstLaunchViewModel.prototype.showFirstRunExperience = function() {
                                this._visible(!0);
                                this._videoSrc(AppMagic.AuthoringStrings.FirstLaunchUri)
                            }, FirstLaunchViewModel.prototype._onEnded = function() {
                                this._visible(!1)
                            }, FirstLaunchViewModel.FirstLaunchFileName = "introShown2.txt", FirstLaunchViewModel
                }();
            ViewModels.FirstLaunchViewModel = FirstLaunchViewModel
        })(ViewModels = AuthoringTool.ViewModels || (AuthoringTool.ViewModels = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Entities;
    (function(Entities) {
        var ConstraintType;
        (function(ConstraintType) {
            ConstraintType[ConstraintType.position = 0] = "position";
            ConstraintType[ConstraintType.size = 1] = "size"
        })(ConstraintType || (ConstraintType = {}));
        var ConstrainToContainerRuleUpdater = function(_super) {
                __extends(ConstrainToContainerRuleUpdater, _super);
                function ConstrainToContainerRuleUpdater(context) {
                    _super.call(this);
                    this.track("_context", context);
                    context.addRuleUserEditHandler("X", this._constrainX.bind(this));
                    context.addRuleUserEditHandler("Y", this._constrainY.bind(this));
                    context.addRuleUserEditHandler("Width", this._constrainWidth.bind(this));
                    context.addRuleUserEditHandler("Height", this._constrainHeight.bind(this))
                }
                return ConstrainToContainerRuleUpdater.prototype._constrainX = function() {
                        this._context.containerSize && this._constrainDimension("X", "Width", this._context.containerSize.width, 0)
                    }, ConstrainToContainerRuleUpdater.prototype._constrainY = function() {
                        this._context.containerSize && this._constrainDimension("Y", "Height", this._context.containerSize.height, 0)
                    }, ConstrainToContainerRuleUpdater.prototype._constrainWidth = function() {
                            this._context.containerSize && this._constrainDimension("X", "Width", this._context.containerSize.width, 1)
                        }, ConstrainToContainerRuleUpdater.prototype._constrainHeight = function() {
                            this._context.containerSize && this._constrainDimension("Y", "Height", this._context.containerSize.height, 1)
                        }, ConstrainToContainerRuleUpdater.prototype._constrainDimension = function(positionPropertyName, sizePropertyName, containerSize, constraintType) {
                            var position = this._tryParseNumberFromExpression(this._context.getRule(positionPropertyName)),
                                size = this._tryParseNumberFromExpression(this._context.getRule(sizePropertyName)),
                                minimumConstraintExceeded = position < 0,
                                maximumConstraintExceeded = position + size > containerSize,
                                constraintExceeded = minimumConstraintExceeded || maximumConstraintExceeded;
                            if (position !== null && size !== null && constraintExceeded)
                                switch (constraintType) {
                                    case 0:
                                        var updatedPosition = minimumConstraintExceeded ? 0 : Math.max(0, containerSize - size);
                                        position !== updatedPosition && this._setNumberRule(positionPropertyName, updatedPosition);
                                        break;
                                    case 1:
                                        var updatedSize = Math.max(0, containerSize - position);
                                        size !== updatedSize && this._setNumberRule(sizePropertyName, updatedSize);
                                        break;
                                    default:
                                }
                        }, ConstrainToContainerRuleUpdater.prototype._setNumberRule = function(propertyName, value) {
                            var localizedExpression = Microsoft.AppMagic.Common.LocalizationHelper.convertToLocaleSpecific(value.toString(), null);
                            this._context.setRule(propertyName, localizedExpression)
                        }, ConstrainToContainerRuleUpdater.prototype._tryParseNumberFromExpression = function(localizedExpression) {
                            return AppMagic.Functions.value(localizedExpression)
                        }, ConstrainToContainerRuleUpdater.templateName = "", ConstrainToContainerRuleUpdater
            }(AppMagic.Utility.Disposable);
        Entities.ConstrainToContainerRuleUpdater = ConstrainToContainerRuleUpdater
    })(Entities = AppMagic.Entities || (AppMagic.Entities = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Entities;
    (function(Entities) {
        var Layout;
        (function(Layout) {
            Layout[Layout.Horizontal = 0] = "Horizontal";
            Layout[Layout.Vertical = 1] = "Vertical"
        })(Layout || (Layout = {}));
        var SliderLayoutRuleUpdater = function(_super) {
                __extends(SliderLayoutRuleUpdater, _super);
                function SliderLayoutRuleUpdater(context) {
                    _super.call(this);
                    this.track("_context", context);
                    this._layout = this._getNormalizedLayout();
                    context.addRuleUserEditHandler("Layout", this._onLayoutChanged.bind(this))
                }
                return SliderLayoutRuleUpdater.prototype._onLayoutChanged = function() {
                        var newLayout = this._getNormalizedLayout();
                        if (newLayout !== null) {
                            if (this._layout !== null && this._layout !== newLayout) {
                                var width = this._context.getRule("Width"),
                                    height = this._context.getRule("Height");
                                this._context.setRule("Width", height);
                                this._context.setRule("Height", width)
                            }
                            this._layout = newLayout
                        }
                    }, SliderLayoutRuleUpdater.prototype._getNormalizedLayout = function() {
                        var ruleScript = this._context.getRule("Layout").trim();
                        switch (ruleScript) {
                            case SliderLayoutRuleUpdater.Horizontal:
                            case SliderLayoutRuleUpdater.LayoutHorizontal:
                                return 0;
                            case SliderLayoutRuleUpdater.Vertical:
                            case SliderLayoutRuleUpdater.LayoutVertical:
                                return 1;
                            default:
                                return null
                        }
                    }, SliderLayoutRuleUpdater.templateName = "slider", SliderLayoutRuleUpdater.Horizontal = Microsoft.AppMagic.Common.LocalizationHelper.convertToLocaleSpecific("Horizontal", null), SliderLayoutRuleUpdater.Vertical = Microsoft.AppMagic.Common.LocalizationHelper.convertToLocaleSpecific("Vertical", null), SliderLayoutRuleUpdater.LayoutHorizontal = Microsoft.AppMagic.Common.LocalizationHelper.convertToLocaleSpecific("Layout!Horizontal", null), SliderLayoutRuleUpdater.LayoutVertical = Microsoft.AppMagic.Common.LocalizationHelper.convertToLocaleSpecific("Layout!Vertical", null), SliderLayoutRuleUpdater
            }(AppMagic.Utility.Disposable);
        Entities.SliderLayoutRuleUpdater = SliderLayoutRuleUpdater
    })(Entities = AppMagic.Entities || (AppMagic.Entities = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ViewModels;
        (function(ViewModels) {
            var SelectionManager = function(_super) {
                    __extends(SelectionManager, _super);
                    function SelectionManager(entityManager, currentScreen, isPreview) {
                        _super.call(this);
                        this._entityManager = null;
                        this._previousScreen = null;
                        this._selectedCanvas = null;
                        this._selectedScreen = null;
                        this._selectedVisuals = null;
                        this._selectedDescendants = null;
                        Contracts.checkValue(entityManager);
                        Contracts.checkObservable(currentScreen);
                        Contracts.checkObservable(isPreview);
                        AppMagic.Utility.Disposable.call(this);
                        this.track("_eventTracker", new AppMagic.Utility.EventTracker);
                        this._entityManager = entityManager;
                        this._previousScreen = currentScreen();
                        this._selectedCanvas = ko.observable(null);
                        this._selectedScreen = currentScreen;
                        this._selectedVisuals = ko.observableArray();
                        this._selectedDescendants = Object.create(null);
                        this._eventTracker.add(entityManager, "visualremoved", this._handleVisualRemoved, this);
                        this._eventTracker.add(entityManager, "screenremoved", this._handleScreenRemoved, this);
                        this.trackAnonymous(this._selectedCanvas.subscribe(function() {
                            this._selectedCanvas() && this.clearVisuals();
                            this.dispatchEvent("canvaschanged")
                        }, this));
                        this.trackAnonymous(this._selectedScreen.subscribe(function(screenViewModel) {
                            if (Contracts.checkValue(screenViewModel), this._previousScreen !== screenViewModel) {
                                var eventDetails = {
                                        oldScreen: this._previousScreen, newScreen: screenViewModel
                                    };
                                this.clearVisuals();
                                this.selectCanvas(null);
                                this._previousScreen = screenViewModel;
                                this.dispatchEvent("screenchanged", eventDetails)
                            }
                        }, this));
                        this.trackAnonymous(this._selectedVisuals.subscribe(function() {
                            this._selectedVisuals().length > 0 && this.selectCanvas(null);
                            this.dispatchEvent("visualschanged")
                        }, this));
                        this.trackAnonymous(isPreview.subscribe(function(value) {
                            Contracts.checkBoolean(value);
                            value && this.clearVisuals()
                        }, this))
                    }
                    return SelectionManager.prototype.addVisual = function(visual) {
                            Contracts.check(this._entityManager.containsVisual(visual));
                            var parentOfCurrentlySelected = this._retrieveSelectionParent([visual]);
                            if (this._selectedVisuals.indexOf(visual) < 0 && parentOfCurrentlySelected === visual.parent) {
                                if (this._tryUnselectGroupAndSelectVisual(visual))
                                    return;
                                if (this._trySelectGroupWhenNoCommonGroup(visual))
                                    return;
                                this._unflattenSelectedVisualsWithDifferentGroup(visual.group);
                                visual.selected = !0;
                                this._selectedVisuals.push(visual);
                                this._updateDescendantSelected(visual, visual.parent, visual, !0)
                            }
                        }, SelectionManager.prototype._tryUnselectGroupAndSelectVisual = function(visual) {
                            Contracts.checkValue(visual);
                            var groupVisual = visual.group;
                            return groupVisual && groupVisual.selected ? (this.singleVisual === groupVisual && this.selectVisualOrGroup(visual), !0) : !1
                        }, SelectionManager.prototype._trySelectGroupWhenNoCommonGroup = function(visual) {
                                Contracts.checkValue(visual);
                                var groupVisual = visual.group;
                                return groupVisual && this._someSelectedNotInGroup(groupVisual) ? (this.addVisual(groupVisual), !0) : !1
                            }, SelectionManager.prototype._unflattenSelectedVisualsWithDifferentGroup = function(group) {
                                var _this = this,
                                    visuals = this._selectedVisuals().slice(0),
                                    selectedGroup = visuals.length > 0 ? visuals[0].group : null;
                                selectedGroup && (!group || selectedGroup !== group) && (visuals.forEach(function(visual) {
                                    Contracts.check(visual.group === selectedGroup);
                                    _this.removeVisual(visual)
                                }), this.selectVisualOrGroup(selectedGroup))
                            }, SelectionManager.prototype.addVisuals = function(visuals) {
                                var _this = this;
                                Contracts.checkArray(visuals);
                                var visualsToBeSelected = [],
                                    parentOfCurrentlySelected = this._retrieveSelectionParent(visuals);
                                visuals.forEach(function(visual) {
                                    var visualToBeAdded = null;
                                    if (_this._selectedVisuals.indexOf(visual) < 0 && parentOfCurrentlySelected === visual.parent) {
                                        var group = visual.group;
                                        group ? _this._selectedVisuals.indexOf(group) < 0 && (visualToBeAdded = group) : visualToBeAdded = visual;
                                        visualToBeAdded && visualsToBeSelected.indexOf(visualToBeAdded) < 0 && (visualToBeAdded.selected = !0, visualsToBeSelected.push(visualToBeAdded), _this._updateDescendantSelected(visualToBeAdded, visualToBeAdded.parent, visualToBeAdded, !0))
                                    }
                                });
                                visualsToBeSelected.length > 0 && (visualsToBeSelected = visualsToBeSelected.concat(this._selectedVisuals()), this._selectedVisuals(visualsToBeSelected))
                            }, SelectionManager.prototype.clearVisuals = function() {
                                var visuals = this._selectedVisuals();
                                visuals.length > 0 && (this._setSelectedFalse(visuals), this._selectedVisuals([]))
                            }, SelectionManager.prototype.removeVisual = function(visual) {
                                Contracts.checkValue(visual);
                                var i = this._selectedVisuals.indexOf(visual);
                                i >= 0 && (Contracts.check(visual.selected), visual.selected = !1, this._selectedVisuals.splice(i, 1), this._updateDescendantSelected(visual, visual.parent, visual, !1))
                            }, SelectionManager.prototype.resume = function(suspendState) {
                                Contracts.checkObject(suspendState);
                                Contracts.checkNonEmpty(suspendState.screen);
                                Contracts.checkArray(suspendState.visuals);
                                var screenViewModel = this._entityManager.getScreenByName(suspendState.screen);
                                this.selectScreen(screenViewModel);
                                var visuals = suspendState.visuals.map(function(visualName) {
                                        return Contracts.checkNonEmpty(visualName), this._entityManager.getVisualByName(visualName)
                                    }, this);
                                this.selectVisualsOrGroups(visuals)
                            }, SelectionManager.prototype.suspend = function(suspendState) {
                                Contracts.checkObject(suspendState);
                                suspendState.screen = this._selectedScreen().name;
                                suspendState.visuals = this._selectedVisuals().map(function(visual) {
                                    return visual.name
                                }, this)
                            }, SelectionManager.prototype.selectCanvas = function(canvas) {
                                Contracts.check(!canvas || canvas.canSelect);
                                var selectedCanvas = this._selectedCanvas();
                                if (selectedCanvas !== canvas) {
                                    var previousCanvas = selectedCanvas;
                                    previousCanvas && (previousCanvas.selected = !1, previousCanvas.owner.setDescendantCanvasSelected(previousCanvas.id, !1), previousCanvas.owner.setDirectChildCanvasSelected(previousCanvas.id, !1), this._updateDescendantSelected(null, previousCanvas.owner, previousCanvas, !1));
                                    this._selectedCanvas(canvas);
                                    canvas && (canvas.selected = !0, canvas.owner.setDescendantCanvasSelected(canvas.id, !0), canvas.owner.setDirectChildCanvasSelected(canvas.id, !0), this._updateDescendantSelected(null, canvas.owner, canvas, !0))
                                }
                            }, SelectionManager.prototype.selectCurrentScreenVisuals = function() {
                                var visuals = this._entityManager.visuals();
                                Contracts.checkArray(visuals);
                                for (var selectedVisuals = [], i = 0; i < visuals.length; i++)
                                    visuals[i].parent.name === this._selectedScreen().name && selectedVisuals.push(visuals[i]);
                                this.selectVisualsOrGroups(selectedVisuals)
                            }, SelectionManager.prototype.selectScreen = function(screenViewModel) {
                                Contracts.check(this._entityManager.containsScreen(screenViewModel));
                                this._selectedScreen(screenViewModel)
                            }, SelectionManager.prototype.selectVisualOrGroup = function(visual) {
                                Contracts.check(this._entityManager.containsVisual(visual));
                                var singleVisual = this.singleVisual;
                                if (singleVisual !== visual) {
                                    var groupVisual = visual.group;
                                    if (groupVisual && singleVisual !== groupVisual && this._someSelectedNotInGroup(groupVisual)) {
                                        this.selectVisualOrGroup(groupVisual);
                                        return
                                    }
                                    this.selectVisual(visual)
                                }
                            }, SelectionManager.prototype.selectVisual = function(visual) {
                                Contracts.check(this._entityManager.containsVisual(visual));
                                var singleVisual = this.singleVisual;
                                singleVisual !== visual && (this._setSelectedFalse(this._selectedVisuals()), visual.selected = !0, this._selectedVisuals([visual]), this._updateDescendantSelected(visual, visual.parent, visual, !0))
                            }, SelectionManager.prototype._someSelectedNotInGroup = function(group) {
                                Contracts.checkValue(group);
                                var selection = this.selection,
                                    groupedVisuals = group.groupedVisuals;
                                return selection.some(function(visual) {
                                        return groupedVisuals.indexOf(visual) < 0
                                    })
                            }, SelectionManager.prototype.selectVisualsOrGroups = function(visuals) {
                                if ((Contracts.checkArray(visuals), this._selectedVisuals().length !== 0 || visuals.length !== 0) && !this._isSameSetOfVisuals(visuals, this._selectedVisuals())) {
                                    if (visuals.length === 1) {
                                        this.selectVisualOrGroup(visuals[0]);
                                        return
                                    }
                                    visuals = this._replaceGroupedVisualsWithGroup(visuals);
                                    this._selectVisuals(visuals)
                                }
                            }, SelectionManager.prototype.selectVisualsOnUndo = function(visuals) {
                                if (Contracts.checkArray(visuals), this._selectedVisuals().length !== 0 || visuals.length !== 0) {
                                    var group = this._getFirstGroup(visuals);
                                    if (!group) {
                                        this._selectVisuals(visuals);
                                        return
                                    }
                                    var sameGroup = visuals.every(function(visual) {
                                            return visual === group || visual.group === group
                                        });
                                    if (!sameGroup) {
                                        this.selectVisualsOrGroups(visuals);
                                        return
                                    }
                                    var index = visuals.indexOf(group);
                                    if (visuals.length === group.groupedVisuals.length + 1) {
                                        Contracts.check(index >= 0);
                                        this.selectVisual(group);
                                        return
                                    }
                                    index >= 0 && visuals.splice(index, 1);
                                    this._selectVisuals(visuals)
                                }
                            }, SelectionManager.prototype._getFirstGroup = function(visuals) {
                                for (var i = 0, len = visuals.length; i < len; i++) {
                                    var group = visuals[i].group;
                                    if (group)
                                        return group
                                }
                                return null
                            }, SelectionManager.prototype._selectVisuals = function(visuals) {
                                this._setSelectedFalse(this._selectedVisuals());
                                var currentScreen = this._selectedScreen();
                                for (var visualIndex in visuals) {
                                    var visual = visuals[visualIndex];
                                    if (visual.parent instanceof ViewModels.ScreenViewModel && visual.parent !== currentScreen || visual.parent instanceof ViewModels.VisualViewModel && (visual.screen !== currentScreen || visuals.indexOf(visual.parent) >= 0)) {
                                        this._setSelectedFalse(visuals);
                                        this._selectedVisuals([]);
                                        return
                                    }
                                    visual.selected = !0;
                                    this._updateDescendantSelected(visual, visual.parent, visual, !0)
                                }
                                this._selectedVisuals(visuals)
                            }, SelectionManager.prototype._retrieveSelectionParent = function(visuals) {
                                if (Contracts.checkArray(visuals), this._selectedVisuals().length > 0)
                                    return this._selectedVisuals()[0].parent;
                                else if (visuals.length > 0)
                                    return visuals[0].parent;
                                return null
                            }, SelectionManager.prototype._replaceGroupedVisualsWithGroup = function(visuals) {
                                var unflattenedVisuals = [];
                                return visuals.forEach(function(visual) {
                                        var group = visual.group,
                                            visualToAdd = null;
                                        visualToAdd = group ? group : visual;
                                        unflattenedVisuals.indexOf(visualToAdd) < 0 && unflattenedVisuals.push(visualToAdd)
                                    }), unflattenedVisuals
                            }, SelectionManager.prototype._isSameSetOfVisuals = function(visuals, selectedVisuals) {
                                if (Contracts.checkArray(visuals), Contracts.checkArray(selectedVisuals), visuals.length !== selectedVisuals.length)
                                    return !1;
                                var visualNames = visuals.map(function(visual) {
                                        return visual.name
                                    });
                                visualNames.sort();
                                var selectedVisualsNames = selectedVisuals.map(function(selectedVisual) {
                                        return selectedVisual.name
                                    });
                                selectedVisualsNames.sort();
                                for (var index in visualNames)
                                    if (visualNames[index] !== selectedVisualsNames[index])
                                        return !1;
                                return !0
                            }, SelectionManager.prototype.toggleVisual = function(visual) {
                                Contracts.check(this._entityManager.containsVisual(visual));
                                visual.selected ? this.removeVisual(visual) : this.addVisual(visual)
                            }, Object.defineProperty(SelectionManager.prototype, "selection", {
                                get: function() {
                                    var selectedCanvas = this._selectedCanvas();
                                    if (selectedCanvas)
                                        return [selectedCanvas.owner];
                                    var visuals = this._selectedVisuals();
                                    return visuals.length === 0 ? [this._selectedScreen()] : visuals
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(SelectionManager.prototype, "canvas", {
                                get: function() {
                                    return this._selectedCanvas()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(SelectionManager.prototype, "canvasOwnerOrSingleVisualOrScreen", {
                                get: function() {
                                    var selectedCanvas = this._selectedCanvas();
                                    return selectedCanvas ? selectedCanvas.owner : this.singleVisualOrScreen
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(SelectionManager.prototype, "canvasOwnerOrSingleVisual", {
                                get: function() {
                                    var selectedCanvas = this._selectedCanvas();
                                    return selectedCanvas ? selectedCanvas.owner : this.singleVisual
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(SelectionManager.prototype, "screen", {
                                get: function() {
                                    return this._selectedScreen()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(SelectionManager.prototype, "singleVisual", {
                                get: function() {
                                    var visuals = this._selectedVisuals();
                                    return visuals.length === 1 ? visuals[0] : null
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(SelectionManager.prototype, "singleVisualOrScreen", {
                                get: function() {
                                    var visuals = this._selectedVisuals();
                                    switch (visuals.length) {
                                        case 0:
                                            return this._selectedScreen();
                                        case 1:
                                            return visuals[0];
                                        default:
                                            return null
                                    }
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(SelectionManager.prototype, "visuals", {
                                get: function() {
                                    return this._selectedVisuals()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(SelectionManager.prototype, "selectedCenter", {
                                get: function() {
                                    if (this.visuals.length === 0)
                                        return null;
                                    var bounds = this.selectedBounds;
                                    return {
                                            x: (bounds.left + bounds.right) * .5, y: (bounds.top + bounds.bottom) * .5
                                        }
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(SelectionManager.prototype, "selectedBounds", {
                                get: function() {
                                    for (var bounds = {
                                            left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity
                                        }, i = 0, len = this.visuals.length; i < len; i++) {
                                        var visual = this.visuals[i];
                                        bounds.left = Math.min(bounds.left, visual.bounds.left);
                                        bounds.right = Math.max(bounds.right, visual.bounds.right);
                                        bounds.top = Math.min(bounds.top, visual.bounds.top);
                                        bounds.bottom = Math.max(bounds.bottom, visual.bounds.bottom)
                                    }
                                    return bounds
                                }, enumerable: !0, configurable: !0
                            }), SelectionManager.prototype._setSelectedFalse = function(visuals) {
                                Contracts.checkArray(visuals);
                                for (var i = 0, len = visuals.length; i < len; i++) {
                                    var visual = visuals[i];
                                    visual.selected = !1;
                                    this._updateDescendantSelected(visual, visual.parent, visual, !1)
                                }
                            }, SelectionManager.prototype._handleVisualRemoved = function(evt) {
                                Contracts.checkObject(evt);
                                Contracts.checkObject(evt.detail);
                                var visual = evt.detail.visual;
                                Contracts.checkObject(visual);
                                var canvas = this._selectedCanvas();
                                canvas !== null && canvas.owner === visual && this.selectCanvas(null);
                                this.removeVisual(visual)
                            }, SelectionManager.prototype._handleScreenRemoved = function(evt) {
                                if (Contracts.checkValue(evt), Contracts.checkValue(evt.detail), Contracts.checkValue(evt.detail.screen), this._selectedScreen() === evt.detail.screen) {
                                    var deleteIndex = this._entityManager.screens().indexOf(evt.detail.screen),
                                        lim = this._entityManager.screens().length - 1;
                                    Contracts.checkRange(deleteIndex, 0, lim);
                                    var selectionIndex = deleteIndex === lim ? deleteIndex - 1 : deleteIndex + 1;
                                    this.selectScreen(this._entityManager.screens()[selectionIndex])
                                }
                            }, SelectionManager.prototype._updateDescendantSelected = function(child, ancestor, entity, selected) {
                                for (Contracts.checkDefined(ancestor), Contracts.checkValue(entity), Contracts.checkValue(selected); ancestor; ) {
                                    var selectedDescendants = this._selectedDescendants[ancestor.name];
                                    if (selected)
                                        selectedDescendants ? selectedDescendants.push(entity) : (selectedDescendants = [entity], this._selectedDescendants[ancestor.name] = selectedDescendants),
                                        ancestor.descendantSelected = !0,
                                        child && ancestor.setDescendantCanvasSelected(child.canvasId, !0);
                                    else if (selectedDescendants) {
                                        var i = selectedDescendants.indexOf(entity);
                                        i >= 0 && (selectedDescendants.splice(i, 1), selectedDescendants.length === 0 && (delete this._selectedDescendants[ancestor.name], ancestor.descendantSelected = !1, child && ancestor.setDescendantCanvasSelected(child.canvasId, !1)))
                                    }
                                    child = ancestor;
                                    ancestor = ancestor.parent
                                }
                            }, SelectionManager
                }(AppMagic.Utility.Disposable);
            ViewModels.SelectionManager = SelectionManager;
            WinJS.Class.mix(SelectionManager, WinJS.Utilities.eventMixin)
        })(ViewModels = AuthoringTool.ViewModels || (AuthoringTool.ViewModels = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var Constants = function() {
                function Constants(){}
                return Constants.ScreenDefaultFill = function() {
                        return new AppMagic.Utility.Color(0, 0, 0, 0)
                    }, Constants.ScreenDefaultStretch = Microsoft.AppMagic.Common.LocalizationHelper.convertToLocaleSpecific("ImagePosition!Fit", null), Constants.ScreenDefaultStretchValue = "fit", Constants.ScreenFillPropertyName = "Fill", Constants.ScreenStretchPropertyName = "ImagePosition", Constants.DataImportTimeout = 3e3, Constants.DocumentImportFormat = ".xlsx", Constants.DocumentFileFormat = ".siena", Constants.DocumentFileFormatServiceConfiguration = ".xml", Constants.WasDocumentDirtyOnSuspendSettingsKey = "wasDocumentDirtyOnSuspend", Constants.ControlInitialBounds = {
                            x: 40, y: 40, width: 100, height: 100
                        }, Constants.ControlMinimumWidth = 20, Constants.ControlMinimumHeight = 20, Constants.CanvasGridSize = 5, Constants.CanvasAdornerMinimumZoom = 40, Constants.CanvasAdornerFillSize = 15, Constants.CanvasAdornerMargin = 15, Constants.CanvasAdornerInnerMargin = 5, Constants.CanvasAdornerBorderWidth = 10, Constants.CanvasAdornerOuterDimension = 15, Constants.CanvasAdornerSize = 6, Constants.CanvasErrorIconOffset = -8, Constants.CanvasErrorIconSize = 16, Constants.ImageFormats = [".jpg", ".jpeg", ".gif", ".png", ".bmp", ".tif", ".tiff", ".svg"], Constants.MediaFormats = [".wav", ".mp3", ".mp4", ".wma", ".wmv"], Constants.AudioFormats = [".wav", ".mp3", ".wma"], Constants.VideoFormats = [".mp4", ".wmv"], Constants.PasteOffset = 20, Constants.PunctuatorBang = "!", Constants.ScreenId = "http://microsoft.com/appmagic/screen", Constants.ScreenVersion = "1.0", Constants.ScreenName = "screen", Constants.ScreenCanvasMargin = 35, Constants.SmallLayoutSize = {
                            width: 1024, height: 768
                        }, Constants.LabelTemplateName = "Label", Constants.GroupTemplateName = "group", Constants.LabelTextPropertyName = "Text", Constants.SampleDataCount = 10, Constants.Zoom = {
                            SliderMin: 0, Step: 10, SliderMax: 100, ValueMax: 400, ValueMin: 10, Source: {
                                    automatic: "automatic", userInvoked: "userInvoked", verify: function(value){}
                                }
                        }, Constants.PublishDefaultImageFile = "publish\\images\\default_icon.png", Constants.PublishDefaultLogoFile = "publish\\images\\logo.png", Constants.PublishDefaultWideLogoFile = "publish\\images\\widelogo.png", Constants.PublishDefaultStoreLogoFile = "publish\\images\\storelogo.png", Constants.PublishDefaultSmallLogoFile = "publish\\images\\smalllogo.png", Constants.PublishDefaultNotificationLogoFile = "publish\\images\\notificationlogo.png", Constants.PublishDefaultSplashscreenFile = "publish\\images\\splashscreen.png", Constants.PublishDefaultCertFile = "publish\\AuthoringTool_StoreKey.pfx", Constants.PublishDefaultPublisherIdentity = "CN=SienaPublisherBeta", Constants.PublishLogoMaxHeight = 300, Constants.PublishLogoMaxWidth = 300, Constants.PublishLogoMaxSizeInKilobytes = 128, Constants.PublishImageMaxSize = 200, Constants.BackstagePanelItems = ["Data Sources", "Embedded Media", "Collections"], Constants
            }();
        AuthoringTool.Constants = Constants
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ViewModels;
        (function(ViewModels) {
            var ChildEntitiesRuleManager = function() {
                    function ChildEntitiesRuleManager(entity) {
                        this._entity = null;
                        this._entity = entity
                    }
                    return ChildEntitiesRuleManager.prototype.getChildRules = function(categoryId) {
                            for (var rules = [], childEntities = this._entity.childEntities(), i = 0, len = childEntities.length; i < len; i++)
                                rules = rules.concat(childEntities[i].getChildRules(categoryId));
                            return rules
                        }, ChildEntitiesRuleManager
                }();
            ViewModels.ChildEntitiesRuleManager = ChildEntitiesRuleManager;
            var NullChildEntitiesRuleManager = function() {
                    function NullChildEntitiesRuleManager(){}
                    return NullChildEntitiesRuleManager.prototype.getChildRules = function(categoryId) {
                            return []
                        }, NullChildEntitiesRuleManager
                }();
            ViewModels.NullChildEntitiesRuleManager = NullChildEntitiesRuleManager
        })(ViewModels = AuthoringTool.ViewModels || (AuthoringTool.ViewModels = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ViewModels;
        (function(ViewModels) {
            var PropertyRuleCategory = Microsoft.AppMagic.Authoring.PropertyRuleCategory,
                Util = AppMagic.Utility,
                EntityErrorTracker = function(_super) {
                    __extends(EntityErrorTracker, _super);
                    function EntityErrorTracker(propertyRuleMap, ruleCategories) {
                        _super.call(this);
                        this._eventTracker = null;
                        this._errorCounts = {
                            behavior: 0, data: 0, design: 0
                        };
                        this._hasErrors = {
                            any: ko.observable(!1), behavior: ko.observable(!1), data: ko.observable(!1), design: ko.observable(!1)
                        };
                        this._hasMoreErrors = {
                            behavior: ko.observable(!1), data: ko.observable(!1), design: ko.observable(!1)
                        };
                        this._moreErrorCounts = {
                            behavior: 0, data: 0, design: 0
                        };
                        this._propertyRuleMap = null;
                        this._ruleCategories = null;
                        this._errorRule = ko.observable(null);
                        this.track("_eventTracker", new Util.EventTracker);
                        this._ruleCategories = ruleCategories;
                        this._propertyRuleMap = propertyRuleMap;
                        for (var propertyName in propertyRuleMap) {
                            var rule = propertyRuleMap[propertyName],
                                updateFn = this._updateErrors.bind(this, rule);
                            this._eventTracker.add(rule, "hasErrorsChanged", updateFn);
                            rule.hasErrors && this._updateErrors(rule)
                        }
                    }
                    return Object.defineProperty(EntityErrorTracker.prototype, "errorRule", {
                            get: function() {
                                return this._errorRule()
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(EntityErrorTracker.prototype, "hasErrors", {
                            get: function() {
                                return this._hasErrors.any()
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(EntityErrorTracker.prototype, "hasBehaviorErrors", {
                                get: function() {
                                    return this._hasErrors.behavior()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(EntityErrorTracker.prototype, "hasDataErrors", {
                                get: function() {
                                    return this._hasErrors.data()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(EntityErrorTracker.prototype, "hasDesignErrors", {
                                get: function() {
                                    return this._hasErrors.design()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(EntityErrorTracker.prototype, "hasMoreBehaviorErrors", {
                                get: function() {
                                    return this._hasMoreErrors.behavior()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(EntityErrorTracker.prototype, "hasMoreDataErrors", {
                                get: function() {
                                    return this._hasMoreErrors.data()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(EntityErrorTracker.prototype, "hasMoreDesignErrors", {
                                get: function() {
                                    return this._hasMoreErrors.design()
                                }, enumerable: !0, configurable: !0
                            }), EntityErrorTracker.prototype._findErrorRule = function() {
                                for (var propertyName in this._propertyRuleMap) {
                                    var rule = this._propertyRuleMap[propertyName];
                                    if (rule.hasErrors)
                                        return rule
                                }
                                return null
                            }, EntityErrorTracker.prototype._updateErrors = function(rule) {
                                var deltaCount = rule.hasErrors ? 1 : -1;
                                switch (rule.category) {
                                    case PropertyRuleCategory.behavior:
                                        this._errorCounts.behavior += deltaCount;
                                        this._hasErrors.behavior(this._errorCounts.behavior > 0);
                                        this._ruleCategories[PropertyRuleCategory.behavior].topRules.indexOf(rule) < 0 && (this._moreErrorCounts.behavior += deltaCount, this._hasMoreErrors.behavior(this._moreErrorCounts.behavior > 0));
                                        break;
                                    case PropertyRuleCategory.data:
                                        this._errorCounts.data += deltaCount;
                                        this._hasErrors.data(this._errorCounts.data > 0);
                                        this._ruleCategories[PropertyRuleCategory.data].topRules.indexOf(rule) < 0 && (this._moreErrorCounts.data += deltaCount, this._hasMoreErrors.data(this._moreErrorCounts.data > 0));
                                        break;
                                    case PropertyRuleCategory.design:
                                        this._errorCounts.design += deltaCount;
                                        this._hasErrors.design(this._errorCounts.design > 0);
                                        this._ruleCategories[PropertyRuleCategory.design].topRules.indexOf(rule) < 0 && (this._moreErrorCounts.design += deltaCount, this._hasMoreErrors.design(this._moreErrorCounts.design > 0));
                                        break;
                                    default:
                                        break
                                }
                                rule.hasErrors ? this._errorRule() === null && this._errorRule(rule) : rule === this._errorRule() && this._errorRule(this._findErrorRule());
                                this._hasErrors.any(this._errorCounts.behavior > 0 || this._errorCounts.data > 0 || this._errorCounts.design > 0)
                            }, EntityErrorTracker
                }(AppMagic.Utility.Disposable);
            ViewModels.EntityErrorTracker = EntityErrorTracker
        })(ViewModels = AuthoringTool.ViewModels || (AuthoringTool.ViewModels = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ViewModels;
        (function(ViewModels) {
            var PropertyRuleCategory = Microsoft.AppMagic.Authoring.PropertyRuleCategory,
                Util = AppMagic.Utility,
                TopRulesCount = 3,
                RuleCategory = function(_super) {
                    __extends(RuleCategory, _super);
                    function RuleCategory(controlTemplateClass, categoryId, rules, propertyGroups, childEntitiesRuleManager) {
                        _super.call(this);
                        this._categoryId = null;
                        this._childDataRules = null;
                        this._childDesignRules = null;
                        this._controlTemplateClass = null;
                        this._propertyGroups = null;
                        this._rules = null;
                        this._rulesCount = null;
                        this._topChildRules = null;
                        this._topRules = null;
                        this._controlTemplateClass = controlTemplateClass;
                        this._categoryId = categoryId;
                        this._propertyGroups = propertyGroups;
                        this._rules = rules;
                        this._rulesCount = this._rules.length;
                        categoryId === PropertyRuleCategory.data && this.track("_childDataRules", ko.computed(function() {
                            return Util.isScreen(controlTemplateClass) ? [] : childEntitiesRuleManager.getChildRules(PropertyRuleCategory.data)
                        }, this, {deferEvaluation: !0}));
                        categoryId === PropertyRuleCategory.design && this.track("_childDesignRules", ko.computed(function() {
                            return Util.isScreen(controlTemplateClass) ? [] : childEntitiesRuleManager.getChildRules(PropertyRuleCategory.design)
                        }, this, {deferEvaluation: !0}));
                        this.track("_topRules", ko.computed(function() {
                            return this._rules.length > TopRulesCount ? this._rules.slice(0, TopRulesCount) : this._rules
                        }, this));
                        this.track("_topChildRules", ko.computed(function() {
                            var len = this._topRules().length,
                                childRules = this.childRules;
                            if (len < TopRulesCount) {
                                var remainingLen = TopRulesCount - len;
                                return this.childRules.length > remainingLen ? childRules.slice(0, TopRulesCount - len) : childRules
                            }
                            return []
                        }, this, {deferEvaluation: !0}))
                    }
                    return Object.defineProperty(RuleCategory.prototype, "categoryId", {
                            get: function() {
                                return this._categoryId
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(RuleCategory.prototype, "childRules", {
                            get: function() {
                                switch (this._categoryId) {
                                    case PropertyRuleCategory.behavior:
                                        return [];
                                    case PropertyRuleCategory.data:
                                        return this._childDataRules();
                                    case PropertyRuleCategory.design:
                                        return this._childDesignRules();
                                    default:
                                        break
                                }
                                return []
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(RuleCategory.prototype, "groups", {
                                get: function() {
                                    return this._propertyGroups
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(RuleCategory.prototype, "hasMoreRules", {
                                get: function() {
                                    return this._rulesCount + this.childRules.length > TopRulesCount ? !0 : !1
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(RuleCategory.prototype, "name", {
                                get: function() {
                                    switch (this._categoryId) {
                                        case PropertyRuleCategory.behavior:
                                            return AppMagic.AuthoringStrings.Behavior;
                                        case PropertyRuleCategory.data:
                                            return AppMagic.AuthoringStrings.Data;
                                        case PropertyRuleCategory.design:
                                            return AppMagic.AuthoringStrings.Design;
                                        default:
                                            break
                                    }
                                    return ""
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(RuleCategory.prototype, "rules", {
                                get: function() {
                                    return this._rules
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(RuleCategory.prototype, "topChildRules", {
                                get: function() {
                                    return this._topChildRules()
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(RuleCategory.prototype, "topGroup", {
                                get: function() {
                                    return {
                                            id: Microsoft.AppMagic.Authoring.PropertyGroup.none, displayName: "", rules: this._topRules()
                                        }
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(RuleCategory.prototype, "topRules", {
                                get: function() {
                                    return this._topRules()
                                }, enumerable: !0, configurable: !0
                            }), RuleCategory
                }(AppMagic.Utility.Disposable);
            ViewModels.RuleCategory = RuleCategory
        })(ViewModels = AuthoringTool.ViewModels || (AuthoringTool.ViewModels = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ViewModels;
        (function(ViewModels) {
            var PropertyRuleCategory = Microsoft.AppMagic.Authoring.PropertyRuleCategory,
                Util = AppMagic.Utility,
                RuleFilter = function(_super) {
                    __extends(RuleFilter, _super);
                    function RuleFilter(controlTemplateClass, rules, childEntitiesRuleManager) {
                        _super.call(this);
                        this._childEntitiesRuleManager = null;
                        this._controlTemplateClass = null;
                        this._editable = ko.observable(!1);
                        this._rules = null;
                        this._text = ko.observable("");
                        this._view = null;
                        this._controlTemplateClass = controlTemplateClass;
                        this.track("_rules", rules);
                        this._childEntitiesRuleManager = childEntitiesRuleManager;
                        this.track("_view", ko.computed(function() {
                            return this._editable() && this._text().trim() !== "" ? "all" : "category"
                        }, this))
                    }
                    return RuleFilter.prototype._getFilteredRules = function(rules, isChildRule) {
                            for (var propertyStartMatch = [], propertySubsequentMatch = [], controlNameStartMatch = [], controlNameSubsequentMatch = [], text = this._text().toLowerCase(), i = 0, len = rules.length; i < len; i++) {
                                var ruleVm = rules[i];
                                if (!ruleVm.property.hidden) {
                                    var propertyName = ruleVm.propertyName.toLowerCase(),
                                        index = propertyName.indexOf(text);
                                    if (index === 0 ? propertyStartMatch.push(ruleVm) : index !== -1 && propertySubsequentMatch.push(ruleVm), isChildRule && !ruleVm.isDataControlProperty) {
                                        var controlName = ruleVm.controlName.toLowerCase();
                                        index = controlName.indexOf(text);
                                        index === 0 ? controlNameStartMatch.push(ruleVm) : index !== -1 && controlNameSubsequentMatch.push(ruleVm)
                                    }
                                }
                            }
                            return propertyStartMatch.concat(propertySubsequentMatch, controlNameStartMatch, controlNameSubsequentMatch)
                        }, Object.defineProperty(RuleFilter.prototype, "editable", {
                            get: function() {
                                return this._editable()
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(RuleFilter.prototype, "filteredChildRules", {
                                get: function() {
                                    if (Util.isScreen(this._controlTemplateClass))
                                        return [];
                                    var childDataRules = this._childEntitiesRuleManager.getChildRules(PropertyRuleCategory.data),
                                        childDesignRules = this._childEntitiesRuleManager.getChildRules(PropertyRuleCategory.design),
                                        childRules = childDataRules.concat(childDesignRules);
                                    return this._getFilteredRules(childRules, !0)
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(RuleFilter.prototype, "filteredRules", {
                                get: function() {
                                    return this._getFilteredRules(this._rules, !1)
                                }, enumerable: !0, configurable: !0
                            }), RuleFilter.prototype.handleBlur = function() {
                                this.resetEditable();
                                document.activeElement !== null && document.activeElement.className.indexOf("filter") >= 0 && AppMagic.context.documentViewModel.focusToScreenCanvas()
                            }, RuleFilter.prototype.handleFocus = function() {
                                return this._editable(!0), !0
                            }, RuleFilter.prototype.handleInputChange = function() {
                                var filterElement = document.getElementById("ruleFilter");
                                filterElement.value !== this._text() && this._text(filterElement.value)
                            }, RuleFilter.prototype.resetEditable = function() {
                                this._text() === "" && this._editable(!1)
                            }, Object.defineProperty(RuleFilter.prototype, "text", {
                                get: function() {
                                    return this._text()
                                }, set: function(value) {
                                        this._text(value)
                                    }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(RuleFilter.prototype, "view", {
                                get: function() {
                                    return this._view()
                                }, enumerable: !0, configurable: !0
                            }), RuleFilter
                }(AppMagic.Utility.Disposable);
            ViewModels.RuleFilter = RuleFilter
        })(ViewModels = AuthoringTool.ViewModels || (AuthoringTool.ViewModels = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ViewModels;
        (function(ViewModels) {
            var PropertyDisplayInfo = function() {
                    function PropertyDisplayInfo(property) {
                        this._propertyType = "";
                        this._propertyName = "";
                        this._propertyInvariantName = "";
                        this._displayName = "";
                        this._propertyCategory = "";
                        this._propertyHelperUI = "";
                        this._tooltip = "";
                        this._hidden = "";
                        this._commandBar = null;
                        this._propertyType = property.propertyType;
                        this._propertyName = property.propertyName;
                        this._propertyInvariantName = property.propertyInvariantName;
                        this._displayName = property.displayName;
                        this._propertyCategory = property.propertyCategory;
                        this._propertyHelperUI = property.propertyHelperUI;
                        this._tooltip = property.tooltip;
                        this._hidden = property.hidden;
                        this._commandBar = {
                            group: property.commandBar.group, visible: property.commandBar.visible, iconPath: property.commandBar.iconPath, position: property.commandBar.position
                        }
                    }
                    return Object.defineProperty(PropertyDisplayInfo.prototype, "propertyType", {
                            get: function() {
                                return this._propertyType
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(PropertyDisplayInfo.prototype, "propertyName", {
                            get: function() {
                                return this._propertyName
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(PropertyDisplayInfo.prototype, "propertyInvariantName", {
                                get: function() {
                                    return this._propertyInvariantName
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(PropertyDisplayInfo.prototype, "displayName", {
                                get: function() {
                                    return this._displayName
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(PropertyDisplayInfo.prototype, "propertyCategory", {
                                get: function() {
                                    return this._propertyCategory
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(PropertyDisplayInfo.prototype, "propertyHelperUI", {
                                get: function() {
                                    return this._propertyHelperUI
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(PropertyDisplayInfo.prototype, "tooltip", {
                                get: function() {
                                    return this._tooltip
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(PropertyDisplayInfo.prototype, "hidden", {
                                get: function() {
                                    return this._hidden
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(PropertyDisplayInfo.prototype, "commandBar", {
                                get: function() {
                                    return this._commandBar
                                }, enumerable: !0, configurable: !0
                            }), PropertyDisplayInfo
                }();
            ViewModels.PropertyDisplayInfo = PropertyDisplayInfo
        })(ViewModels = AuthoringTool.ViewModels || (AuthoringTool.ViewModels = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ScreenInitializer = function() {
                function ScreenInitializer(){}
                return ScreenInitializer.initializeScreen = function(document, firstScreenName, setupBeforeRulesInitialization) {
                        var screen = ScreenInitializer._createFirstScreenOnNewDocument(document, firstScreenName);
                        setupBeforeRulesInitialization && setupBeforeRulesInitialization();
                        ScreenInitializer._initializeFirstScreenRules(screen)
                    }, ScreenInitializer._createFirstScreenOnNewDocument = function(doc, firstScreenName) {
                        var firstScreen = doc.createControl(firstScreenName, ScreenInitializer._screenTemplate);
                        return firstScreen
                    }, ScreenInitializer._initializeFirstScreenRules = function(firstScreen) {
                            var addRuleSuccessful,
                                screenDefaultFill = AppMagic.AuthoringTool.Constants.ScreenDefaultFill();
                            var fillProp = ScreenInitializer._screenTemplate.tryGetPropertyInvariant(AppMagic.AuthoringTool.Constants.ScreenFillPropertyName);
                            addRuleSuccessful = firstScreen.addRule(fillProp.property.propertyName, screenDefaultFill.toRuleValue(), AppMagic.Constants.PropertyRuleCategory.design, !0);
                            var stretchProp = ScreenInitializer._screenTemplate.tryGetPropertyInvariant(AppMagic.AuthoringTool.Constants.ScreenStretchPropertyName);
                            addRuleSuccessful = firstScreen.addRule(stretchProp.property.propertyName, AppMagic.AuthoringTool.Constants.ScreenDefaultStretch, AppMagic.Constants.PropertyRuleCategory.design, !0)
                        }, ScreenInitializer._screenTemplate = Microsoft.AppMagic.Authoring.ScreenTemplateFactory.create(), ScreenInitializer
            }();
        AuthoringTool.ScreenInitializer = ScreenInitializer
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var AuthoringTool;
    (function(AuthoringTool) {
        var ViewModels;
        (function(ViewModels) {
            var VisualFactory = function() {
                    function VisualFactory(document, entityManager, controlManager, ruleFactory, zoom) {
                        this._document = null;
                        this._entityManager = null;
                        this._controlManager = null;
                        this._ruleFactory = null;
                        this._zoom = null;
                        this._document = document;
                        this._entityManager = entityManager;
                        this._controlManager = controlManager;
                        this._ruleFactory = ruleFactory;
                        this._zoom = zoom
                    }
                    return VisualFactory.prototype.create = function(control) {
                            return control.template.name === AppMagic.AuthoringTool.Constants.GroupTemplateName ? new AppMagic.AuthoringTool.ViewModels.GroupViewModel(this._document, this._entityManager, control, this._controlManager, this._ruleFactory, this._zoom) : new AppMagic.AuthoringTool.ViewModels.VisualViewModel(this._document, this._entityManager, control, this._controlManager, this._ruleFactory, this._zoom)
                        }, VisualFactory
                }();
            ViewModels.VisualFactory = VisualFactory
        })(ViewModels = AuthoringTool.ViewModels || (AuthoringTool.ViewModels = {}))
    })(AuthoringTool = AppMagic.AuthoringTool || (AppMagic.AuthoringTool = {}))
})(AppMagic || (AppMagic = {}));