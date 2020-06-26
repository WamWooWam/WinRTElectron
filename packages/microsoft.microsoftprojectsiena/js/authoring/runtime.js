//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(Platform, global) {"use strict";
    var ServiceImporterUtils = Microsoft.AppMagic.Authoring.Importers.ServiceImporterUtils,
        AuthoringToolRuntime = WinJS.Class.derive(AppMagic.RuntimeBase, function AuthoringToolRuntime_ctor(authBrokerManagerFactory, authCache, cookieManager, connectionStatusProvider, dispatcherFactory) {
            AppMagic.RuntimeBase.call(this, authBrokerManagerFactory, authCache, cookieManager, connectionStatusProvider, dispatcherFactory);
            this._activeScreenIndex = ko.observable(0);
            this._pendingAddDataSourcePromises = new AppMagic.Common.PromiseCollection;
            this._dataSourcePreparersByServiceName = new Collections.Generic.Dictionary;
            this._dataSourcePreparersByServiceName.setValue(AppMagic.Constants.DataConnections.Types.CloudTable, new AppMagic.Authoring.Services.CloudTable.CloudTableDataSourceProviderPreparer(this._staticServiceDispatcher));
            this._dataSourceProviderFactoriesByServiceName.setValue(AppMagic.Constants.DataConnections.Types.LocalTable, new AppMagic.Authoring.LocalTableProviderFactory(this))
        }, {
            _connectorRESTServicesPackage: null, _dataSourcePreparersByServiceName: null, _pendingAddDataSourcePromises: null, dynamicRESTServices: {get: function() {
                        return this._connectorRESTServicesPackage === null ? null : this._connectorRESTServicesPackage.services
                    }}, isAuthoring: {get: function() {
                        return !global.disableAuthoring
                    }}, onSuspend: function() {
                    this.saveSessionAuthData()
                }, onNewSessionAsync: function() {
                    return AppMagic.Settings.instance.load().then(function() {
                            this.disposeSessionAuthData()
                        }.bind(this))
                }, isO365ConnectorReconstructionRequired: function() {
                    return this._isOffice365Imported() ? !1 : !0
                }, getStaticServiceDispatcher: function() {
                    return this._staticServiceDispatcher
                }, promptReuseCredentials: function() {
                    var sessionAuthData = AppMagic.Settings.instance.getValue(AppMagic.Constants.Services.AUTH_DOMAINS_KEY) || {};
                    var authenticatedServiceNames = Object.keys(sessionAuthData);
                    var serviceNamesWithState = [];
                    if (authenticatedServiceNames.forEach(function(svcName) {
                        var authenticatedSvcAuthData = sessionAuthData[svcName];
                        authenticatedSvcAuthData.hasUserAuthenticatedState && serviceNamesWithState.push(svcName)
                    }), serviceNamesWithState.length === 0)
                        return WinJS.Promise.wrap();
                    var dialog = new AppMagic.Popups.CachedAuthDialog(AppMagic.AuthoringStrings.LoggedIntoServices, AppMagic.AuthoringStrings.StayLoggedIntoServices, serviceNamesWithState);
                    return dialog.showAsync()
                }, onNewDocument: function() {
                    if (this._data = Object.create(null), this._workspaceData = Object.create(null), this._rules = Object.create(null), this._aliases = Object.create(null), this._resources = Object.create(null), this._documentId = "", this._progressIndicatorViewModel = new AppMagic.AuthoringTool.ViewModels.ProgressIndicatorViewModel, this._notificationViewModel.pageViewModel = null, this._notificationViewModel.pageViewModel = this._progressIndicatorViewModel, this._dispatcher) {
                        var serviceNamespaces = Object.keys(this._importedServices);
                        serviceNamespaces.forEach(function(serviceNamespace) {
                            var promiseCollection = this._getPromiseCollectionForService(serviceNamespace);
                            promiseCollection.cancelAll()
                        }.bind(this));
                        this.saveSessionAuthData();
                        this._importedServices = {};
                        this._dispatcher.terminate();
                        this._dispatcher = null
                    }
                    this._pendingAddDataSourcePromises.cancelAll();
                    this._cleanUpBehaviorPromises();
                    this._cleanUpDataRulePromises()
                }, _cleanUpBehaviorPromises: function() {
                    for (var dependencies = Object.keys(this._behaviorPromises), i = 0; i < dependencies.length; i++)
                        this._cleanUpBehaviorPromisesForDependency(dependencies[i]);
                    this._behaviorPromises = Object.create(null);
                    this._behaviorPromiseQueues = Object.create(null)
                }, _cleanUpDataRulePromises: function() {
                    for (var qualifiedPropertyNames = Object.keys(this._dataRulePromises), i = 0, len = qualifiedPropertyNames.length; i < len; i++)
                        this._checkAndCancelAsyncRuleExecutionsForProperty(qualifiedPropertyNames[i]);
                    this._dataRulePromises = Object.create(null)
                }, _addStaticServicesToDocument: function(theNewDocument) {
                    this._servicesImported.then(function() {
                        this._serviceDefinitionsById.keys.forEach(function(serviceId) {
                            for (var def = this._serviceDefinitionsById.getValue(serviceId), reqs = def.required, serviceTemplate = new Microsoft.AppMagic.Authoring.ServiceTemplate(def.serviceClass), i = 0, len = reqs.length; i < len; i++)
                                serviceTemplate.addRequirement(reqs[i]);
                            serviceTemplate.setPath(Windows.ApplicationModel.Package.current.installedLocation.path + "\\services\\" + serviceId);
                            theNewDocument.registerService(serviceId, serviceTemplate)
                        }.bind(this))
                    }.bind(this))
                }, _createStaticServiceDispatcher: function() {
                    return this._servicesImported = new WinJS.Promise(function(complete) {
                            this._servicesImportedCompleteFunction = complete
                        }.bind(this)), AppMagic.RuntimeBase.prototype._createStaticServiceDispatcher.call(this, arguments).then(function() {
                            this._servicesImportedCompleteFunction();
                            this._servicesImportedCompleteFunction = null
                        }.bind(this))
                }, _servicesImportedCompleteFunction: null, _servicesImported: null, onAfterNewDocument: function(theNewDocument) {
                    this.updateDocumentId(theNewDocument.properties.id);
                    var alreadyAddedNamespaces;
                    this._addStaticServicesToDocument(theNewDocument);
                    this._createDispatcherAndControllers();
                    for (var addServiceToRuntimePromises = new Core.Promise.PromiseQueue, promises = [], servicesIter = theNewDocument.getServices().first(); servicesIter.hasCurrent; servicesIter.moveNext())
                        servicesIter.current.hasConfig && function(serviceInfo) {
                            addServiceToRuntimePromises.pushJob(function() {
                                var connectorDef = null;
                                typeof serviceInfo.connectorId !== undefined && serviceInfo.connectorId !== null && (connectorDef = {
                                    id: serviceInfo.connectorId, version: serviceInfo.connectorVersionString
                                });
                                var promiseToAcquireTemplateVariables = serviceInfo.hasDefaultKeys ? this.getConnectorDefaultTemplateValuesAsync(connectorDef) : WinJS.Promise.wrap(serviceInfo.templateUserValuesJSON === "" ? null : JSON.parse(serviceInfo.templateUserValuesJSON));
                                var promise = promiseToAcquireTemplateVariables.then(function(templateVariables) {
                                        var AzureConstants = AppMagic.Services.AzureConstants;
                                        if (connectorDef !== null && connectorDef.id === AzureConstants.ConnectorIds.office365) {
                                            var templateValuesToUse = templateVariables;
                                            if (templateValuesToUse === null) {
                                                templateValuesToUse = {};
                                                var templateVariableNames = Object.keys(JSON.parse(serviceInfo.templateDefinitionJSON).variables);
                                                templateVariableNames.forEach(function(templateVariableName) {
                                                    templateValuesToUse[templateVariableName] = "unavailable"
                                                })
                                            }
                                            else
                                                this.azureConnectionManager.connectWithTemplateVariableValues(templateVariables)
                                        }
                                        var parseTemplateDefResult = this.parseTemplateDefinition(theNewDocument, serviceInfo.originalXML);
                                        var parseAndValidationResult = this._prepareTemplateVariablesAndParseConfigXml(theNewDocument, serviceInfo.originalXML, templateVariables, parseTemplateDefResult);
                                        this._addMetaServiceToRuntime(serviceInfo.serviceNamespace, parseAndValidationResult.def, connectorDef, null)
                                    }.bind(this));
                                return promises.push(promise), promise
                            }.bind(this))
                        }.bind(this)(servicesIter.current);
                    return promises.length === 0 ? WinJS.Promise.wrap() : promises[promises.length - 1]
                }, parseLanguageVariables: function(templateFormVariableDescriptions) {
                    for (var retValue = {}, languageVariableNameAndValues = {}, onlyLangVars = !0, varNames = Object.keys(templateFormVariableDescriptions), i = 0; i < varNames.length; i++) {
                        var varName = varNames[i],
                            variableDef = templateFormVariableDescriptions[varName];
                        if (variableDef.deftype === AppMagic.Constants.Services.Rest.DefinitionType_LanguageVariable) {
                            var langVar = this._chooseLanguageVariableValue(varName, variableDef);
                            languageVariableNameAndValues[langVar.name] = langVar.value;
                            delete templateFormVariableDescriptions[varName]
                        }
                        else
                            onlyLangVars = !1
                    }
                    return {
                            languageVariableNameAndValues: languageVariableNameAndValues, onlyLangVars: onlyLangVars
                        }
                }, addLangVarsToTemplateVars: function(templateVarValues, langVariableValues) {
                    var concatenatedList = templateVarValues;
                    if (langVariableValues !== null)
                        if (concatenatedList === null)
                            concatenatedList = langVariableValues;
                        else
                            for (var keys = Object.keys(langVariableValues), i = 0; i < keys.length; i++)
                                concatenatedList[keys[i]] = langVariableValues[keys[i]];
                    return concatenatedList
                }, doesConnectorHaveDefaultTemplateValues: function(connectorDef) {
                    if (connectorDef.id === AppMagic.Services.AzureConstants.ConnectorIds.office365)
                        return !0;
                    var defaultTemplateValues = this._getStaticConnectorDefaultTemplateValues(connectorDef);
                    return defaultTemplateValues !== null
                }, getConnectorDefaultTemplateValuesAsync: function(connectorDef) {
                    if (connectorDef.id === AppMagic.Services.AzureConstants.ConnectorIds.office365)
                        return this.azureConnectionManager.connectAsync(!0).then(function(registrationResult) {
                                var Office365TemplateVariableNames = AppMagic.Services.AzureConstants.TemplateVariableNames.Office365;
                                if (registrationResult.success) {
                                    var appInfo = registrationResult.result;
                                    var defaultValues = {};
                                    return defaultValues[Office365TemplateVariableNames.clientId] = appInfo.clientId, defaultValues[Office365TemplateVariableNames.redirectUri] = appInfo.redirectUri, defaultValues[Office365TemplateVariableNames.tenantId] = appInfo.tenantId, defaultValues
                                }
                                else
                                    return null
                            }.bind(this));
                    var templateValues = this._getStaticConnectorDefaultTemplateValues(connectorDef);
                    return WinJS.Promise.wrap(templateValues)
                }, _getStaticConnectorDefaultTemplateValues: function(connectorDef) {
                    var templateValuesJSON = ServiceImporterUtils.getConnectorDefaultTemplateValues(connectorDef.id, connectorDef.version);
                    var templateValues = JSON.parse(templateValuesJSON);
                    return templateValues
                }, parseTemplateDefinition: function(doc, configXml) {
                    var templateDefinition = null,
                        jsonParseFailed = !1,
                        errorMessage = AppMagic.Strings.RestConfigFileErrorDetailUnsupportedFileFormat;
                    try {
                        var configResult = ServiceImporterUtils.parseConfigTemplateDefinition(configXml);
                        if (configResult.success) {
                            var configJSON = configResult.configJSON;
                            templateDefinition = typeof configJSON != "string" || configJSON.length <= 0 ? null : JSON.parse(configJSON)
                        }
                        else
                            jsonParseFailed = !0,
                            errorMessage = configResult.message
                    }
                    catch(e) {
                        jsonParseFailed = !0;
                        var msg = "An unhandled exception was caught while calling ServiceImporterUtils.ParseConfigTemplateDefinition.";
                        typeof e != "undefined" && typeof e.message != "undefined" && (msg = msg + " " + e.message)
                    }
                    return jsonParseFailed ? {
                            success: !1, errorMessage: {
                                    title: AppMagic.Strings.RestConfigFileParseError, content: errorMessage
                                }
                        } : {
                            success: !0, templateDef: templateDefinition
                        }
                }, updateDocumentId: function(documentId) {
                    this._documentId = documentId
                }, getDocumentId: function() {
                    return this._documentId
                }, entityAdded: function(args) {
                    args.entityType === Microsoft.AppMagic.Authoring.EntityType.staticDataSource ? (this._addStaticDataSourceAsync(args.name, args.entity, !0), args.entity.isSampleData || Microsoft.AppMagic.Common.TelemetrySession.telemetry.logAddDataSource("Excel")) : args.entityType === Microsoft.AppMagic.Authoring.EntityType.serviceDataSource ? (this._addServiceDataSource(args.name), Microsoft.AppMagic.Common.TelemetrySession.telemetry.logAddDataSource(args.entity.serviceName)) : args.entityType === Microsoft.AppMagic.Authoring.EntityType.service ? this._logServiceTelemetry(args, !0) : args.entityType === Microsoft.AppMagic.Authoring.EntityType.collection ? (this._addCollection(args.name), Microsoft.AppMagic.Common.TelemetrySession.telemetry.logCreateCollection()) : args.entityType === Microsoft.AppMagic.Authoring.EntityType.resource ? this._addResource(args.name, args.entity.rootPath.absoluteUri) : args.entityType === Microsoft.AppMagic.Authoring.EntityType.dynamicDataSource && this._addDynamicDataSource(args.name)
                }, _chooseLanguageVariableValue: function(langVarName, templateVariableDef) {
                    for (var docLanguage = Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleName.toLowerCase(), k = 0; k < templateVariableDef.languages.length; k++)
                        if (templateVariableDef.languages[k] === docLanguage)
                            return {
                                    name: langVarName, value: docLanguage
                                };
                    var docUiLanguage = Microsoft.AppMagic.Common.LocalizationHelper.currentUILanguageName.toLowerCase();
                    if (docUiLanguage !== docLanguage)
                        for (k = 0; k < templateVariableDef.languages.length; k++)
                            if (templateVariableDef.languages[k] === docUiLanguage)
                                return {
                                        name: langVarName, value: docUiLanguage
                                    };
                    return {
                            name: langVarName, value: templateVariableDef.languages[0]
                        }
                }, _logServiceTelemetry: function(args, added) {
                    args.entity.hasConfig && (added ? args.entity.configName.length === 0 ? Microsoft.AppMagic.Common.TelemetrySession.telemetry.logAddDataSource(args.name) : Microsoft.AppMagic.Common.TelemetrySession.telemetry.logAddDataSource("CustomREST") : args.entity.configName.length === 0 ? Microsoft.AppMagic.Common.TelemetrySession.telemetry.logDeleteDataSource(args.name) : Microsoft.AppMagic.Common.TelemetrySession.telemetry.logDeleteDataSource("CustomREST"))
                }, _clearBlobMapForStaticDataSource: function(ds, data) {
                    ds.orderedColumnNames.forEach(function(columnName) {
                        var result = ds.tryGetColumnType(columnName);
                        (result.type.kind === AppMagic.Constants.DKind.Image || result.type.kind === AppMagic.Constants.DKind.Media) && data.forEach(function(row) {
                            var uri = row[columnName];
                            uri && AppMagic.Utility.removeUriFromLocalFileCache(uri)
                        })
                    })
                }, areThereOtherSharePointDataSources: function(dataSource) {
                    for (var key in this._data)
                        if (this._data[key]._collectionName !== dataSource._collectionName && this._getDataSourcePluginType(this._data[key]) === AppMagic.Constants.DataConnections.Types.SharePointOnline)
                            return !0;
                    return !1
                }, _cleanAuthForStaticDataSources: function(dataSource) {
                    if (typeof dataSource != "undefined" && dataSource !== null) {
                        var pluginType = this._getDataSourcePluginType(dataSource);
                        pluginType !== AppMagic.Constants.DataConnections.Types.SharePointOnline || this.areThereOtherSharePointDataSources(dataSource) || this.azureConnectionManager.sharePointOnlineBroker.disconnect(this._cookieManager)
                    }
                }, entityRemoved: function(args) {
                    args.entityType === Microsoft.AppMagic.Authoring.EntityType.collection ? (this._clearCollection(args.name), delete this._data[args.name], Microsoft.AppMagic.Common.TelemetrySession.telemetry.logDeleteCollection()) : args.entityType === Microsoft.AppMagic.Authoring.EntityType.staticDataSource ? (AppMagic.Utility.releaseBlobs(this._data[args.name]), delete this._data[args.name], args.entity.isSampleData || Microsoft.AppMagic.Common.TelemetrySession.telemetry.logDeleteDataSource("Excel")) : args.entityType === Microsoft.AppMagic.Authoring.EntityType.serviceDataSource ? (AppMagic.Utility.releaseBlobs(this._data[args.name]), this._cleanAuthForStaticDataSources(this._data[args.name]), delete this._data[args.name], Microsoft.AppMagic.Common.TelemetrySession.telemetry.logDeleteDataSource(args.entity.serviceName)) : args.entityType === Microsoft.AppMagic.Authoring.EntityType.service ? this._logServiceTelemetry(args, !1) : args.entityType === Microsoft.AppMagic.Authoring.EntityType.resource ? delete this._resources[args.name] : args.entityType === Microsoft.AppMagic.Authoring.EntityType.dynamicDataSource && this._removeDynamicDataSource(args.name)
                }, entityRenamed: function(args) {
                    if (args.entityType === Microsoft.AppMagic.Authoring.EntityType.staticDataSource || args.entityType === Microsoft.AppMagic.Authoring.EntityType.serviceDataSource || args.entityType === Microsoft.AppMagic.Authoring.EntityType.collection) {
                        var ds = this._data[args.oldName];
                        this._data[args.name] = ds;
                        delete this._data[args.oldName]
                    }
                    else
                        args.entityType === Microsoft.AppMagic.Authoring.EntityType.dynamicDataSource
                }, onDataSourceChanged: function(dsName) {
                    var ds = AppMagic.context.document.getServiceDataSource(dsName);
                    if (ds !== null && !this.hasError(dsName) && this.hasDataSourceProvider(this._data[dsName]))
                        var dataSourceProvider = this._data[dsName][this.metaProperty][this.dataSourceProviderProperty],
                            success = ds.setSchema(dataSourceProvider.schemaString);
                    AppMagic.RuntimeBase.prototype.onDataSourceChanged.call(this, dsName)
                }, _refreshServiceDataSource: function(dsName) {
                    var ds = AppMagic.context.document.getServiceDataSource(dsName);
                    return ds ? this._addServiceDataSource(dsName).then(function(result) {
                            return result
                        }, function(error) {
                            return !1
                        }) : WinJS.Promise.as(!1)
                }, addDataSourceToDocument: function(dsName, serviceName, internalConfiguration) {
                    var config = {
                            state: AppMagic.Common.DataSourceSetupState.Unready, serviceName: serviceName, internalConfiguration: internalConfiguration
                        };
                    this.createServiceDataSource(AppMagic.context.document, dsName, dsName, config, serviceName, "unused")
                }, _addDataSourceProvider: function(dataSourceInfo) {
                    var dsName = dataSourceInfo.name;
                    var configuration = JSON.parse(dataSourceInfo.configuration);
                    var preparer,
                        tryGetPreparer = this._dataSourcePreparersByServiceName.tryGetValue(dataSourceInfo.serviceName);
                    preparer = tryGetPreparer.value ? tryGetPreparer.outValue : new AppMagic.Authoring.DefaultDataSourceProviderPreparer;
                    var factory = this._dataSourceProviderFactoriesByServiceName.getValue(dataSourceInfo.serviceName),
                        creator = new AppMagic.Authoring.AuthoringDataSourceProviderCreator(dataSourceInfo, preparer, factory, this);
                    return creator.createProvider().then(function(createResult) {
                            if (createResult.success) {
                                var ds = AppMagic.context.document.getServiceDataSource(dsName);
                                if (ds === null)
                                    return;
                                dataSourceInfo.configuration = JSON.stringify(createResult.result.configuration);
                                var provider = createResult.result.provider,
                                    schema = provider.schema,
                                    success = dataSourceInfo.setSchema(AppMagic.Schema.getSchemaString(schema));
                                this._processDataSourceProvider(dsName, dataSourceInfo.serviceName, createResult.result.provider)
                            }
                            else
                                this._processFailedDataSourceProvider(dsName, dataSourceInfo.serviceName, createResult.message);
                            this.dispatchEvent(AuthoringToolRuntime.events.dataadded, dsName)
                        }.bind(this))
                }, _addServiceDataSource: function(dsName) {
                    var ds = AppMagic.context.document.getServiceDataSource(dsName);
                    var dsServiceName = ds.serviceName,
                        dsSourceName = ds.sourceName,
                        dsConfiguration = ds.configuration;
                    var initialConfig = JSON.parse(dsConfiguration);
                    if (initialConfig.state)
                        return this._addDataSourceProvider(ds);
                    var updateDocument = function(response) {
                            if (!response.success)
                                return typeof response.message == "string" && response.message.length > 0 ? response.message === AppMagic.AuthoringStrings.SharePointOnlineUnauthorized && (ds = AppMagic.context.document.getServiceDataSource(dsName), ds.setSchema(AppMagic.Constants.Services.EmptyTableSchemaType)) : response.message = AppMagic.AuthoringStrings.DataSourcesPageUnknownError, response;
                            var dataSourceInfo = response.result;
                            if (typeof dataSourceInfo.schema == "undefined")
                                return {
                                        success: !1, message: AppMagic.AuthoringStrings.DataSourcesPageErrorServiceFailedToReturnValidData
                                    };
                            if (ds = AppMagic.context.document.getServiceDataSource(dsName), ds === null)
                                return {
                                        success: !1, message: AppMagic.AuthoringStrings.DataSourcesPageErrorDataSourceWasRemoved
                                    };
                            var configurationToSaveAndUse = dataSourceInfo.configuration || initialConfig;
                            configurationToSaveAndUse.appInfo = initialConfig.appInfo;
                            var isTable = AppMagic.Schema.isSchemaOfTypeArray(dataSourceInfo.schema);
                            var schemaString = AppMagic.Utility.stringizeSchema(dataSourceInfo.schema[AppMagic.Schema.KeyPtr], isTable);
                            return schemaString === null ? {
                                    success: !1, message: AppMagic.AuthoringStrings.DataSourcesPageErrorInvalidSchema
                                } : (ds.configuration = JSON.stringify(configurationToSaveAndUse), !ds.setSchema(schemaString)) ? {
                                    success: !1, message: AppMagic.AuthoringStrings.DataSourcesPageErrorInvalidSchema
                                } : typeof dataSourceInfo.result == "undefined" ? {
                                    success: !1, schema: dataSourceInfo.schema, message: AppMagic.AuthoringStrings.DataSourcesPageErrorServiceFailedToReturnValidData
                                } : {
                                    success: !0, result: dataSourceInfo.result, schema: dataSourceInfo.schema, configuration: configurationToSaveAndUse
                                }
                        },
                        addMetadata = function(response) {
                            var meta = {};
                            AppMagic.Utility.createOrSetPrivate(meta, "name", dsName);
                            AppMagic.Utility.createOrSetPrivate(meta, "pluginType", dsServiceName);
                            AppMagic.Utility.createOrSetPrivate(meta, "dataSourceType", dsSourceName);
                            var data,
                                schema;
                            return response.success ? (data = response.result, schema = response.schema, AppMagic.Utility.createOrSetPrivate(meta, "configuration", response.configuration)) : (data = [], schema = AppMagic.Schema.createSchemaForArrayFromPointer([]), AppMagic.Utility.createOrSetPrivate(meta, this.errorProperty, response.message)), AppMagic.Utility.createOrSetPrivate(meta, "schema", schema), AppMagic.Utility.createOrSetPrivate(data, this.metaProperty, meta), AppMagic.Utility.createPrivateImmutable(data, this.collectionNameProperty, dsName), data instanceof Array && this.assignTableID(data), {
                                        success: response.success, data: data
                                    }
                        }.bind(this),
                        updateRuntime = function(response) {
                            return this._updateRuntimeAndJumpstartDataFlow(dsName, response.data), this.dispatchEvent(AuthoringToolRuntime.events.dataadded, dsName), WinJS.Promise.as(response.success)
                        }.bind(this),
                        serviceCallArgs = this._getServiceQueryArgs(dsServiceName, dsSourceName, initialConfig),
                        queryFunctionName = serviceCallArgs.queryFunctionName,
                        authorizedDataSourceState = serviceCallArgs.authorizedDataSourceState,
                        ensureServiceSpecificAuthenticationPromise = serviceCallArgs.ensureServiceSpecificAuthenticationPromise;
                    return this._pendingAddDataSourcePromises.addJob(function() {
                            return ensureServiceSpecificAuthenticationPromise.then(function() {
                                    return this._staticServiceWorkerController.makeServiceCall(dsServiceName, queryFunctionName, [authorizedDataSourceState]).then(updateDocument).then(addMetadata).then(updateRuntime)
                                }.bind(this))
                        }.bind(this))
                }, _addStaticDataSourceAsync: function(dsName, ds, ensureDefined) {
                    var onError = function(err) {
                            var onErrorResult = {success: !1};
                            return onErrorResult.message = typeof err.message == "string" && err.message.length > 0 ? err.message : AppMagic.AuthoringStrings.DataSourcesPageUnknownError, WinJS.Promise.as(onErrorResult)
                        }.bind(this),
                        onDataRetrieved = function(jsonData) {
                            var data = JSON.parse(jsonData);
                            return this._clearBlobMapForStaticDataSource(ds, data), WinJS.Promise.wrap(data)
                        }.bind(this),
                        addMetadata = function(data) {
                            this.assignTableID(data);
                            var meta = {};
                            AppMagic.Utility.createOrSetPrivate(data, this.metaProperty, meta);
                            AppMagic.Utility.createOrSetPrivate(meta, "name", dsName);
                            AppMagic.Utility.createOrSetPrivate(meta, "pluginType", "excel");
                            this._data[dsName] = data
                        }.bind(this),
                        updateRuntime = function() {
                            this.onDataSourceChanged(dsName);
                            this.dispatchEvent(AuthoringToolRuntime.events.dataadded, dsName)
                        }.bind(this);
                    return ensureDefined && typeof this._data[dsName] == "undefined" && addMetadata([]), ds.getJsonDataAsync().then(onDataRetrieved, onError).then(addMetadata).then(updateRuntime)
                }, getDataSourceErrorMessage: function(dsName) {
                    return this._data[dsName][this.metaProperty][this.errorProperty]
                }, _addResource: function(resourceName, localPath) {
                    this._resources[resourceName] = localPath
                }, createServiceDataSource: function(doc, dsName, suggestedName, configuration, serviceName, sourceName) {
                    var config = JSON.stringify(configuration);
                    var isWritable = AppMagic.Constants.Services.WritableStaticServices.indexOf(serviceName) >= 0,
                        success = doc.addServiceDataSource(dsName, suggestedName, serviceName, sourceName, config, isWritable)
                }, _resolveDataSource: function(dsName, syncResult) {
                    syncResult.dataChanges && syncResult.dataChanges.schema instanceof Array && this._resolveDataSourceSchema(dsName, syncResult.dataChanges.schema);
                    AppMagic.RuntimeBase.prototype._resolveDataSource.call(this, dsName, syncResult)
                }, _resolveDataSourceSchema: function(dsName, schema) {
                    var ds = AppMagic.context.document.getServiceDataSource(dsName);
                    var schemaString = AppMagic.Utility.stringizeSchema(schema, !0),
                        successSetSchema = ds.setSchema(schemaString)
                }, _resolveDataSourceConfiguration: function(dsName, configuration) {
                    var ds = AppMagic.context.document.getServiceDataSource(dsName);
                    ds.configuration = JSON.stringify(configuration);
                    AppMagic.RuntimeBase.prototype._resolveDataSourceConfiguration.call(this, dsName, configuration)
                }, getData: function(dsName) {
                    var existingDs = this._data[dsName];
                    return existingDs ? WinJS.Promise.as(existingDs) : new WinJS.Promise(function(onComplete, onError, onCancel) {
                            var fn = function(evt) {
                                    evt.detail === dsName && (this.removeEventListener(AuthoringToolRuntime.events.dataadded, fn), onComplete(this._data[dsName]))
                                }.bind(this);
                            this.addEventListener(AuthoringToolRuntime.events.dataadded, fn)
                        }.bind(this))
                }, getCurrentData: function(dsName) {
                    var existingDs = this._data[dsName];
                    return existingDs ? existingDs : null
                }, _refreshStaticDataAsync: function(ds) {
                    return delete this._data[ds.name], this._addStaticDataSourceAsync(ds.name, ds, !1)
                }, createLocalCopyOfDataSources: function() {
                    for (var result = !0, keys = Object.keys(this._data), i = 0, len = keys.length; i < len; i++) {
                        var dsName = keys[i];
                        var data = this._data[dsName];
                        var ds;
                        if (typeof data._meta != "undefined")
                            switch (data._meta.pluginType) {
                                case AppMagic.Constants.DataConnections.Types.SharePoint:
                                case AppMagic.Constants.DataConnections.Types.AzureMobileServices:
                                    ds = AppMagic.context.document.getServiceDataSource(dsName);
                                    try {
                                        result &= ds.setDataSnapshot(JSON.stringify({data: data}))
                                    }
                                    catch(e) {
                                        result = !1
                                    }
                                    break;
                                case AppMagic.Constants.DataConnections.Types.RSS:
                                case AppMagic.Constants.DataConnections.Types.REST:
                                case AppMagic.Constants.DataConnections.Types.Excel:
                                default:
                                    break
                            }
                    }
                    return result
                }, resetDataEvent: function(args) {
                    var dataFlow = !1,
                        p = null;
                    if (args.entityType === Microsoft.AppMagic.Authoring.EntityType.collection) {
                        var old = this._data[args.name];
                        old instanceof Array && old.length === 0 || (this._resetCollection(args.name), dataFlow = !0)
                    }
                    else
                        args.entityType === Microsoft.AppMagic.Authoring.EntityType.alias ? this.getAliasValue(args.name) !== null && (this.setAliasValue(args.name, null), dataFlow = !0) : args.entityType === Microsoft.AppMagic.Authoring.EntityType.staticDataSource && (this._refreshStaticDataAsync(AppMagic.context.document.getStaticDataSource(args.name)), dataFlow = !1);
                    if (dataFlow)
                        try {
                            this.onDataSourceChanged(args.name)
                        }
                        catch(e) {
                            if (e !== AppMagic.AuthoringTool.Runtime.Error.NamedObjectNotFound)
                                throw e;
                        }
                }, publishEvent: function(args) {
                    if (args.code === "null") {
                        this.applyRule("undefined", args);
                        return
                    }
                    args.dependency !== "" ? this.applyRule(args.code, args) : args.evaluateRule && this.applyConstants(args.code, args.qualifiedPropertyName, args.isBehaviorRule)
                }, dynamicDataSourceEvent: function(args) {
                    switch (args.eventType) {
                        case Microsoft.AppMagic.Authoring.DynamicDataSourceEventType.subscribe:
                            var enabled = this.enableDynamicDatasource(args.name);
                            break;
                        case Microsoft.AppMagic.Authoring.DynamicDataSourceEventType.unSubscribe:
                            var disabled = this.disableDynamicDatasource(args.name);
                            break;
                        default:
                            break
                    }
                }, _checkAndCancelAsyncRuleExecutionsForProperty: function(qualifiedPropertyName) {
                    var bindingContextToPromiseMapping;
                    if (qualifiedPropertyName !== "" && this._dataRulePromises && (bindingContextToPromiseMapping = this._dataRulePromises[qualifiedPropertyName])) {
                        for (var bindingContextIds = Object.keys(bindingContextToPromiseMapping), i = 0, len = bindingContextIds.length; i < len; i++)
                            bindingContextToPromiseMapping[bindingContextIds[i]].cancel();
                        delete this._dataRulePromises[qualifiedPropertyName]
                    }
                }, applyRule: function(rule, args) {
                    var dependency = args.dependency,
                        evaluateRule = args.evaluateRule,
                        qualifiedPropertyName = args.qualifiedPropertyName,
                        isBehaviorRule = args.isBehaviorRule,
                        isReachabilityChange = args.isReachabilityChange;
                    try {
                        if (eval('this._rules["' + Microsoft.AppMagic.CharacterUtils.escape(dependency) + '"] = ' + rule), evaluateRule && typeof this._rules[dependency] == "function" && (isBehaviorRule || this._checkAndCancelAsyncRuleExecutionsForProperty(qualifiedPropertyName), this._rules[dependency](AppMagic.Controls.GlobalContextManager.bindingContext)), isReachabilityChange) {
                            var controlId = dependency.substr(0, dependency.length - this._reachabilitySuffix.length);
                            var control = this.getNamedObject(controlId);
                            control && control.OpenAjax.notifyNestedReachabilityChangedInternal()
                        }
                    }
                    catch(e) {
                        if (e !== AppMagic.AuthoringTool.Runtime.Error.NamedObjectNotFound)
                            throw e;
                    }
                }, applyConstants: function(rule, qualifiedPropertyName, isBehaviorRule) {
                    if (rule !== "")
                        try {
                            var fn;
                            eval("fn = " + rule);
                            isBehaviorRule || this._checkAndCancelAsyncRuleExecutionsForProperty(qualifiedPropertyName);
                            fn(AppMagic.Controls.GlobalContextManager.bindingContext)
                        }
                        catch(e) {
                            if (e !== AppMagic.AuthoringTool.Runtime.Error.NamedObjectNotFound)
                                throw e;
                        }
                }, getParentScreenName: function(visualOrScreenName) {
                    return AppMagic.context.documentViewModel.getParentScreenName(visualOrScreenName)
                }, getParentScreenIndex: function(visualOrScreenName) {
                    return AppMagic.context.documentViewModel.getParentScreenIndex(visualOrScreenName)
                }, navigateTo: function(targetName, transition) {
                    return this._activeScreenIndex(this.getParentScreenIndex(targetName)), AppMagic.context.documentViewModel.navigateTo(targetName, transition)
                }, removeMetaServiceAndUnregisterWithDocument: function(serviceNamespace, doc) {
                    this.removeMetaService(serviceNamespace);
                    var success = doc.unregisterService(serviceNamespace)
                }, refreshMetaService: function(serviceNamespace, doc) {
                    var configStorageFile = this._importedServices[serviceNamespace].configStorageFile;
                    var success = doc.tryGetService(serviceNamespace);
                    var serviceInfo = success.info;
                    var userVariableValuesJSON = serviceInfo.templateUserValuesJSON;
                    var originalServiceXML = serviceInfo.originalXML;
                    var originalServiceDef = this._importedServices[serviceNamespace].service._serviceDef;
                    var configStateOriginal = this._buildConfigState(originalServiceXML, userVariableValuesJSON, doc);
                    this.removeMetaServiceAndUnregisterWithDocument(serviceNamespace, doc);
                    var errorTitle = null,
                        errorContent = null;
                    return Platform.Storage.FileIO.readTextAsync(configStorageFile).then(function(fileContents) {
                            var refreshSuccess = !1,
                                configStateNew = null,
                                updatedServiceDef = null,
                                parseTemplateDefResultOriginal = this.parseTemplateDefinition(doc, originalServiceXML);
                            var parseTemplateDefResultNew = this.parseTemplateDefinition(doc, fileContents);
                            if (parseTemplateDefResultNew.success)
                                if (this._areTemplateVariablesModified(parseTemplateDefResultOriginal, parseTemplateDefResultNew))
                                    errorTitle = AppMagic.AuthoringStrings.RefreshServiceFailedDueToTemplateTitle,
                                    errorContent = AppMagic.AuthoringStrings.RefreshServiceFailedDueToTemplateText,
                                    refreshSuccess = !1;
                                else {
                                    var templateVariables = userVariableValuesJSON === "" ? null : JSON.parse(userVariableValuesJSON),
                                        parseAndValidationResult = this._prepareTemplateVariablesAndParseConfigXml(doc, fileContents, templateVariables, parseTemplateDefResultNew);
                                    parseAndValidationResult.success ? (updatedServiceDef = parseAndValidationResult.def, configStateNew = this._buildConfigState(fileContents, userVariableValuesJSON, doc), refreshSuccess = !0) : (errorTitle = parseAndValidationResult.errorMessage.title, errorContent = parseAndValidationResult.errorMessage.content, refreshSuccess = !1)
                                }
                            else
                                errorTitle = parseTemplateDefResultNew.errorMessage.title,
                                errorContent = parseTemplateDefResultNew.errorMessage.content,
                                refreshSuccess = !1;
                            return refreshSuccess ? {
                                    success: !0, serviceDef: updatedServiceDef, configState: configStateNew
                                } : {
                                    success: !1, serviceDef: originalServiceDef, configState: configStateOriginal, errorTitle: errorTitle, errorContent: errorContent
                                }
                        }.bind(this), function(error) {
                            return error.number === AppMagic.Constants.Services.Rest.NoUnicodeCharacterMappingErrorNumber ? (errorTitle = AppMagic.Strings.RestConfigFileParseError, errorContent = AppMagic.AuthoringStrings.RestConfigFileErrorDetailInvalidCharForFileEncoding) : error.number === AppMagic.Constants.Services.Rest.FileNotFoundErrorNumber && (errorTitle = AppMagic.Strings.RestConfigFileParseError, errorContent = AppMagic.AuthoringStrings.RestConfigFileErrorFileDoesNotExist), {
                                    success: !1, serviceDef: originalServiceDef, configState: configStateOriginal, errorTitle: errorTitle, errorContent: errorContent
                                }
                        }.bind(this)).then(function(result) {
                            result.success || AppMagic.AuthoringTool.PlatformHelpers.showMessage(result.errorTitle, result.errorContent);
                            this._addMetaServiceToRuntimeAndRegisterWithDocument(serviceNamespace, result.serviceDef, null, configStorageFile, result.configState, doc);
                            var dcv = AppMagic.context.documentViewModel.backStage.dataConnectionsViewModel;
                            return dcv.setShownConnectionMember(serviceNamespace), result.success
                        }.bind(this))
                }, _areTemplateVariablesModified: function(parseTemplateDefResultOriginal, parseTemplateDefResultNew) {
                    return parseTemplateDefResultNew.templateDef === null && parseTemplateDefResultOriginal.templateDef === null ? !1 : parseTemplateDefResultNew.templateDef === null && parseTemplateDefResultOriginal.templateDef !== null || parseTemplateDefResultNew.templateDef !== null && parseTemplateDefResultOriginal.templateDef === null ? !0 : JSON.stringify(parseTemplateDefResultNew.templateDef.variables) !== JSON.stringify(parseTemplateDefResultOriginal.templateDef.variables) ? !0 : !1
                }, _prepareTemplateVariablesAndParseConfigXml: function(doc, configXml, templateVariables, parseTemplateDefResult) {
                    var langNameAndValues = {};
                    if (parseTemplateDefResult.success && parseTemplateDefResult.templateDef) {
                        var langVars = this.parseLanguageVariables(parseTemplateDefResult.templateDef.variables);
                        langNameAndValues = langVars.languageVariableNameAndValues
                    }
                    this.addLangVarsToTemplateVars(templateVariables, langNameAndValues);
                    var parseAndValidationResult = AppMagic.Services.Meta.RESTWorkerController.parseAndValidateConfigXml(doc, configXml, templateVariables);
                    return parseAndValidationResult
                }, _buildConfigState: function(fileContents, userVariableValuesJSON, doc) {
                    var parseTemplateDefResult = this.parseTemplateDefinition(doc, fileContents);
                    var templateUserValues = userVariableValuesJSON === "" ? null : JSON.parse(userVariableValuesJSON);
                    return {
                            originalXML: fileContents, templateDefinition: parseTemplateDefResult.templateDef, templateUserValues: templateUserValues, hasDefaultKeys: !1
                        }
                }, removeMetaService: function(serviceNamespace) {
                    var promiseCollection = this._getPromiseCollectionForService(serviceNamespace);
                    promiseCollection.cancelAll();
                    this._disposeAuthForService(serviceNamespace);
                    this._importedServices[serviceNamespace].service.controller.terminate();
                    delete this._importedServices[serviceNamespace]
                }, importMetaService: function(def, connectorDef, file, configState, doc) {
                    var uniqueNamespace = doc.createUniqueName(def.serviceid),
                        success = this._addMetaServiceToRuntimeAndRegisterWithDocument(uniqueNamespace, def, connectorDef, file, configState, doc);
                    return {
                            success: success, serviceName: uniqueNamespace
                        }
                }, updateMetaService: function(serviceNamespace, def, templateVariableValues, hasDefaultKeys, doc) {
                    var configStorageFile = this._importedServices[serviceNamespace].configStorageFile;
                    var connectorDef = this._importedServices[serviceNamespace].connectorDef;
                    this.removeMetaService(serviceNamespace);
                    var success = doc.updateMetaService(serviceNamespace, JSON.stringify(def), JSON.stringify(templateVariableValues), hasDefaultKeys);
                    return this._addMetaServiceToRuntime(serviceNamespace, def, connectorDef, configStorageFile), {success: success}
                }, _addMetaServiceToRuntimeAndRegisterWithDocument: function(serviceNamespace, def, connectorDef, configStorageFile, configState, doc) {
                    this._addMetaServiceToRuntime(serviceNamespace, def, connectorDef, configStorageFile);
                    var dictionaryTemplate = this._buildDictionaryTemplate(def.docdictionary),
                        serviceTemplate = this._buildServiceTemplate(def, dictionaryTemplate, serviceNamespace),
                        connectorId,
                        connectorVersion;
                    connectorDef !== null ? (connectorId = connectorDef.id, connectorVersion = connectorDef.version) : (connectorId = null, connectorVersion = null);
                    var templateDefinitionJSON = JSON.stringify(configState.templateDefinition),
                        templateUserValuesJSON = JSON.stringify(configState.templateUserValues),
                        filePath = configStorageFile !== null ? configStorageFile.path : "",
                        success = doc.registerMetaService(serviceNamespace, serviceTemplate, connectorId, connectorVersion, filePath, JSON.stringify(def), configState.originalXML, templateDefinitionJSON, templateUserValuesJSON, configState.hasDefaultKeys);
                    return success
                }, _buildDictionaryTemplate: function(docDict) {
                    var constants = AppMagic.Constants.Services.Rest,
                        dctTmpl = new Microsoft.AppMagic.Authoring.ServiceLanguageDictionaryTemplate;
                    return Object.keys(docDict).forEach(function(langVal) {
                            var langObj = docDict[langVal];
                            Object.keys(langObj).forEach(function(docIdKey) {
                                var locDoc = langObj[docIdKey],
                                    title,
                                    displayName;
                                title = typeof locDoc[constants.DocTitleKey] == "string" ? locDoc[constants.DocTitleKey] : "";
                                displayName = typeof locDoc[constants.DocDisplayNameKey] == "string" ? locDoc[constants.DocDisplayNameKey] : "";
                                dctTmpl.addEntry(langVal, docIdKey, title, displayName)
                            })
                        }), dctTmpl
                }, _buildServiceTemplate: function(def, dictionaryTemplate, serviceNamespace) {
                    var restServiceTemplateBuilder = new AppMagic.Authoring.Services.RestServiceTemplateBuilder(dictionaryTemplate, this._importedServices[serviceNamespace].service);
                    return restServiceTemplateBuilder.buildServiceTemplate()
                }, importRESTServices: function(doc) {
                    return ServiceImporterUtils.getRestServicesPackageAsync().then(function(restServicesPackage) {
                            if (restServicesPackage !== null && !this._isPackageProcessedAlready(restServicesPackage))
                                return this._parseRESTServicesAndImportIntoRuntime(doc, restServicesPackage.versionString, restServicesPackage.serviceConfigInfos)
                        }.bind(this), function(err){})
                }, _parseRESTServicesAndImportIntoRuntime: function(doc, packageVersion, serviceConfigInfos) {
                    for (var services = [], parseAndStoreService = function(serviceInfo) {
                            return Platform.Storage.StorageFile.getFileFromPathAsync(serviceInfo.configFilePath).then(Platform.Storage.FileIO.readTextAsync).then(function(fileContents) {
                                    var parseAndValidationResult = AppMagic.Services.Meta.RESTWorkerController.parseAndValidateConfigXml(doc, fileContents, null);
                                    parseAndValidationResult.success && services.push({
                                        connectorId: serviceInfo.id, connectorVersion: packageVersion, name: serviceInfo.name, serviceId: parseAndValidationResult.def.serviceid, serviceName: serviceInfo.name, configXml: fileContents, iconPath: serviceInfo.iconUrlString
                                    })
                                })
                        }, promises = [], servicesConfigInfosIter = serviceConfigInfos.first(); servicesConfigInfosIter.hasCurrent; servicesConfigInfosIter.moveNext()) {
                        var svcInfo = servicesConfigInfosIter.current;
                        promises.push(parseAndStoreService(svcInfo))
                    }
                    return WinJS.Promise.join(promises).then(function() {
                            this._connectorRESTServicesPackage = {
                                version: packageVersion, services: services
                            }
                        }.bind(this))
                }, _isPackageProcessedAlready: function(restServicesPackage) {
                    return this._connectorRESTServicesPackage === null ? !1 : this._connectorRESTServicesPackage.version === restServicesPackage.versionString
                }, getImportedService: function(serviceNamespace) {
                    return this._importedServices[serviceNamespace].service.controller
                }, reportRuntimeError: function(errorContext, errorMessage) {
                    errorContext !== null && this.dispatchEvent(AuthoringToolRuntime.events.setRuntimeError, {
                        errorContext: errorContext, errorMessage: errorMessage
                    })
                }, _resetRuntimeError: function(errorContext) {
                    errorContext !== null && this.dispatchEvent(AuthoringToolRuntime.events.resetRuntimeError, {errorContext: errorContext})
                }, completeRestFunctionCallCore: function(result, progressIndicatorVm, actionId, errorContext, qualifiedFunctionName) {
                    var response = AppMagic.RuntimeBase.prototype.completeRestFunctionCallCore.call(this, result, progressIndicatorVm, actionId, errorContext, qualifiedFunctionName);
                    if (!result.success) {
                        var message = AppMagic.Strings.RestErrorUnknown;
                        typeof result.message == "string" && /\S/.test(result.message) && (message = result.message);
                        var errorMessage = Core.Utility.formatString("{0}: {1}: {2}", AppMagic.AuthoringStrings.RestErrorServiceErrorMessage, qualifiedFunctionName, message);
                        this.reportRuntimeError(errorContext, errorMessage)
                    }
                    return response
                }, errorRestFunctionCallCore: function(error, progressIndicatorVm, actionId, promiseTimedOut, docId, errorContext, qualifiedFunctionName) {
                    var response = AppMagic.RuntimeBase.prototype.errorRestFunctionCallCore.call(this, error, progressIndicatorVm, actionId, promiseTimedOut, docId, errorContext, qualifiedFunctionName);
                    if (promiseTimedOut && Core.Utility.isCanceledError(error) && this._documentId === docId) {
                        var serviceErrorMessage = Core.Utility.formatString(AppMagic.Strings.RestErrorTimeout, Math.round(AppMagic.RuntimeBase._timeoutMillisecondsServiceFunctionCall / 1e3)),
                            errorMessage = Core.Utility.formatString("{0}: {1}: {2}", AppMagic.AuthoringStrings.RestErrorServiceErrorMessage, qualifiedFunctionName, serviceErrorMessage);
                        this.reportRuntimeError(errorContext, errorMessage)
                    }
                    return response
                }, createErrorContext: function(entityName, propertyName) {
                    var errorContext = {
                            entityName: entityName, propertyName: propertyName, id: this.generateId()
                        };
                    return this._resetRuntimeError(errorContext), errorContext
                }, cloneAndUpdateErrorContext: function(errorContext, nodeId) {
                    var clonedErrorContext = AppMagic.Utility.clone(errorContext, !0);
                    return clonedErrorContext.nodeId = nodeId, clonedErrorContext
                }, tryRenameEntity: function(doc, oldName, newName) {
                    var oldAliases = this._getAliasValues(oldName),
                        result = doc.tryRename(oldName, newName);
                    return result && Object.keys(oldAliases).length > 0 && this._setAliasValues(newName, oldAliases), result
                }, _getO365ClientId: function() {
                    var azureConstants = AppMagic.Services.AzureConstants,
                        o365ConnectorDef = {
                            id: azureConstants.ConnectorIds.office365, version: azureConstants.ConnectorVersions.office365
                        },
                        defaultTemplateValues = this._getStaticConnectorDefaultTemplateValues(o365ConnectorDef);
                    return defaultTemplateValues[azureConstants.TemplateVariableNames.Office365.clientId]
                }, _logServiceFunctionCallTelemetry: function(serviceNamespace, functionName, success) {
                    var service = AppMagic.context.document.getServiceByServiceNamespace(serviceNamespace);
                    service !== null && service.connectorId !== null && Microsoft.AppMagic.Common.TelemetrySession.telemetry.logRestFunctionCall(service.connectorId, service.connectorVersionString, functionName, service.hasDefaultKeys, success)
                }
        }, {events: {
                dataadded: "dataadded", setRuntimeError: "setRuntimeError", resetRuntimeError: "resetRuntimeerror"
            }});
    WinJS.Class.mix(AuthoringToolRuntime, WinJS.Utilities.eventMixin);
    WinJS.Namespace.define("AppMagic.AuthoringTool", {
        Runtime: new AuthoringToolRuntime(AppMagic.Services.AuthenticationBrokerManagerFactory.instance, new AppMagic.Services.AuthenticationCache(AppMagic.Settings.instance), AppMagic.Services.CookieManager.instance, AppMagic.ConnectionStatusProvider.instance, new AppMagic.Workers.DispatcherFactory(new AppMagic.Workers.WebWorkerFactory)), AuthoringToolRuntime: AuthoringToolRuntime
    })
})(Windows, this);