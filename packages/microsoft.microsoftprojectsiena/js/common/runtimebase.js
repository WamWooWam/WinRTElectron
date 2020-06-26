//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(Platform) {"use strict";
    var runtimeConstants = AppMagic.Constants.Runtime,
        RuntimeBase = WinJS.Class.define(function RuntimeBase_ctor(authBrokerManagerFactory, authCache, cookieManager, connectionStatusProvider, dispatcherFactory) {
            this._data = Object.create(null);
            this._workspaceData = Object.create(null);
            this._rules = Object.create(null);
            this._behaviorPromises = Object.create(null);
            this._behaviorPromiseQueues = Object.create(null);
            this._dataRulePromises = Object.create(null);
            this._dataTemplates = {};
            this._aliases = Object.create(null);
            this._resources = Object.create(null);
            this._documentId = "";
            this._nextId = 0;
            this._importedServices = {};
            this._notificationViewModel = new AppMagic.AuthoringTool.ViewModels.NotificationViewModel;
            this._progressIndicatorViewModel = new AppMagic.AuthoringTool.ViewModels.ProgressIndicatorViewModel;
            this._notificationViewModel.pageViewModel = this._progressIndicatorViewModel;
            this._authCache = authCache;
            this._brokerManagerFactory = authBrokerManagerFactory;
            this._cookieManager = cookieManager;
            this._connectionStatusProvider = connectionStatusProvider;
            this._dispatcherFactory = dispatcherFactory;
            this._createStaticServiceDispatcher();
            this._createDispatcherAndControllers();
            this._createAzureDispatcher();
            this._dynamicallyGeneratedFns = {
                SignIn: this._signInFnDef, SignOut: this._signOutFnDef
            };
            this._dataSourceProviderFactoriesByServiceName = new Collections.Generic.Dictionary;
            this._dataSourceProviders = Object.create(null)
        }, {
            activeScreenIndex: {get: function() {
                    return this._activeScreenIndex
                }}, rootNamespaceCache: {get: function() {
                        return this._rootNamespaceCache === null && (this._rootNamespaceCache = new AppMagic.Utility.RootNamespaceCache(AppMagic.Settings.instance.getValue(AppMagic.Utility.RootNamespaceCache.SettingsKey) || {}, AppMagic.Settings.instance, AppMagic.Utility.RootNamespaceCache.SettingsKey)), this._rootNamespaceCache
                    }}, cookieManager: {get: function() {
                        return this._cookieManager
                    }}, azureConnectionManager: {get: function() {
                        return this._azureConnectionManager === null && this._createAzureConnectionManager(), this._azureConnectionManager
                    }}, azureRefreshTokenStore: {get: function() {
                        return this._azureRefreshTokenStore === null && this._createAzureRefreshTokenStore(), this._azureRefreshTokenStore
                    }}, importedServices: {get: function() {
                        return this._importedServices
                    }}, progressIndicatorViewModel: {get: function() {
                        return this._progressIndicatorViewModel
                    }}, _azureConnectionManager: null, _azureController: null, _azureDispatcher: null, _azureRefreshTokenStore: null, _rootNamespaceCache: null, _authCache: null, _brokerManagerFactory: null, _cookieManager: null, _connectionStatusProvider: null, _importedServices: null, _dispatcher: null, _dispatcherFactory: null, _serviceDefinitionsById: null, _staticServiceDispatcher: null, _staticServiceWorkerController: null, _sharePointSyncController: null, _sharePointOnlineController: null, _impexWorkerController: null, _dataSourceProviders: null, _dataSourceProviderFactoriesByServiceName: null, _resources: null, _data: null, _rules: null, _behaviorPromises: null, _behaviorPromiseQueues: null, _dataRulePromises: null, _dataTemplates: null, _defaultBindingContextId: "_bindingContext_4a104b4c347040e78eaefcd77a7f151e", _aliases: null, _documentId: null, collectionNameProperty: runtimeConstants.collectionNameProperty, dynamicDataSourceNameProperty: "_dynamicDataSource", _maxChainedPromisesPerBehavior: 100, _getDataSourcePluginType: function(dataSource) {
                    return typeof dataSource[this.metaProperty] == "undefined" ? null : dataSource[this.metaProperty][this.pluginTypeProperty]
                }, getCollectionName: function(collection) {
                    return collection[this.collectionNameProperty]
                }, getdynamicDataSourceName: function(ds) {
                    return ds[this.dynamicDataSourceNameProperty]
                }, configurationProperty: runtimeConstants.configurationProperty, metaProperty: runtimeConstants.metaProperty, pluginTypeProperty: "pluginType", dataSourceProviderProperty: "dataSourceProvider", errorProperty: "_error", syncVersionProperty: runtimeConstants.syncVersionProperty, idProperty: runtimeConstants.idProperty, nameMapProperty: AppMagic.Constants.nameMapProperty, oldIdProperty: runtimeConstants.oldIdProperty, spIdProperty: AppMagic.Constants.Services.SpIdProperty, _reachabilitySuffix: ".Reachability_d4fe5b0bf89d4b5380ea356fbddf82b0", _nextId: null, _valueColumnName: "Value", _dynamicallyGeneratedFns: null, signInFnName: "SignIn", signOutFnName: "SignOut", _buildRuleID: function(controlName, propertyName) {
                    return controlName + "." + propertyName
                }, _notificationViewModel: null, _progressIndicatorViewModel: null, notificationViewModel: {get: function() {
                        return this._notificationViewModel
                    }}, _activeScreenIndex: null, _isOffice365Imported: function() {
                    var importedServices = this._importedServices;
                    var officeService = null;
                    return Object.keys(importedServices).forEach(function(serviceNamespace) {
                            var service = importedServices[serviceNamespace];
                            if (service.connectorDef !== null && service.connectorDef.id === AppMagic.Services.AzureConstants.ConnectorIds.office365) {
                                officeService = service;
                                return
                            }
                        }), officeService !== null
                }, hasError: function(dsName) {
                    return typeof this._data[dsName][this.metaProperty][this.errorProperty] != "undefined"
                }, runOptimizedReplicatedDataFlow: function(replicatingControlId, bindingContext, inputTable, outputTable) {
                    var lookupName = replicatingControlId + this._reachabilitySuffix;
                    return typeof this._rules[lookupName] == "function" ? this._rules[lookupName](inputTable, outputTable, bindingContext) : !1
                }, _scheduleAsyncRule: function(qualifiedPropertyName, bindingContextId, ruleFn) {
                    var ruleFnAsPromise = WinJS.Promise.wrap().then(ruleFn).then(null, function(){});
                    this._dataRulePromises[qualifiedPropertyName] || (this._dataRulePromises[qualifiedPropertyName] = {});
                    this._dataRulePromises[qualifiedPropertyName][bindingContextId] = ruleFnAsPromise
                }, _checkAndCancelAsyncRuleExecution: function(qualifiedPropertyName, bindingContextId) {
                    var dataRulePromise;
                    this._dataRulePromises && this._dataRulePromises[qualifiedPropertyName] && (dataRulePromise = this._dataRulePromises[qualifiedPropertyName][bindingContextId]) && (dataRulePromise.cancel(), delete this._dataRulePromises[qualifiedPropertyName][bindingContextId])
                }, execAsynchronousRule: function(entityName, propertyName, ruleFn, bc, isBehavior) {
                    if (bc instanceof Array) {
                        for (var i = 0; i < bc.length; i++)
                            this.execAsynchronousRule(entityName, propertyName, ruleFn, bc[i], isBehavior);
                        return
                    }
                    var qualifiedPropertyName = entityName + "." + propertyName;
                    if (!isBehavior) {
                        this._checkAndCancelAsyncRuleExecution(qualifiedPropertyName, bc.id);
                        var controlContext = bc.controlContexts[entityName];
                        typeof controlContext != "undefined" && (controlContext._asyncRules[propertyName] = this._scheduleAsyncRule.bind(this, qualifiedPropertyName, bc.id, ruleFn))
                    }
                    bc.isCached || isBehavior ? isBehavior && ruleFn() : this._scheduleAsyncRule(qualifiedPropertyName, bc.id, ruleFn)
                }, onValueChanged: function(controlName, propertyName, value, bindingContext) {
                    var dependency = controlName + "." + propertyName;
                    if (typeof this._rules[dependency] == "function")
                        if (this._behaviorPromises[dependency]) {
                            var promiseQueue,
                                bindingContextId = bindingContext ? bindingContext.id : this._defaultBindingContextId;
                            (promiseQueue = this._behaviorPromiseQueues[dependency][bindingContextId]) || (promiseQueue = new Core.Promise.PromiseQueue, this._behaviorPromiseQueues[dependency][bindingContextId] = promiseQueue);
                            promiseQueue.pushJob(function(ruleFn) {
                                return WinJS.Promise.wrap().then(function(documentId, result) {
                                        return documentId !== this._documentId ? null : ruleFn(bindingContext || null)
                                    }.bind(this, this._documentId)).then(null, function(err){})
                            }.bind(this, this._rules[dependency]))
                        }
                        else
                            this._rules[dependency](bindingContext || null)
                }, onAliasesChanged: function(screenName, keys) {
                    for (var i = 0, len = keys.length; i < len; i++)
                        this.onDataSourceChanged(screenName + "." + keys[i])
                }, onDataSourceChanged: function(dsName) {
                    var ruleFn = this._rules[dsName];
                    typeof ruleFn == "function" && ruleFn(AppMagic.Controls.GlobalContextManager.bindingContext)
                }, onEvent: function(controlName, eventName, bindingContext) {
                    this.onValueChanged(controlName, eventName, null, bindingContext)
                }, createErrorContext: function(entityName, propertyName){}, cloneAndUpdateErrorContext: function(errorContext, nodeId){}, setBehavior: function(dependency, code, isAsync) {
                    if (code === null) {
                        delete this._rules[dependency];
                        this._cleanUpBehaviorPromisesForDependency(dependency);
                        return
                    }
                    isAsync ? this._behaviorPromises[dependency] || (this._behaviorPromises[dependency] = new WinJS.Promise(function(complete, error){}).then(null, function(error) {
                        Core.Utility.isCanceledError(error) && this._cancelAllPendingBehaviorPromiseJobs(dependency)
                    }.bind(this)), this._behaviorPromiseQueues[dependency] = {}) : this._behaviorPromises[dependency] && this._cleanUpBehaviorPromisesForDependency(dependency);
                    this._rules[dependency] = code
                }, _cancelAllPendingBehaviorPromiseJobs: function(qualifiedPropertyName) {
                    var bindingContextToQueueMapping;
                    if (this._behaviorPromiseQueues && (bindingContextToQueueMapping = this._behaviorPromiseQueues[qualifiedPropertyName]))
                        for (var bindingContextIds = Object.keys(bindingContextToQueueMapping), i = 0, len = bindingContextIds.length; i < len; i++)
                            bindingContextToQueueMapping[bindingContextIds[i]].cancelAll()
                }, _cleanUpBehaviorPromisesForDependency: function(qualifiedPropertyName) {
                    var behaviorPromise;
                    this._behaviorPromises && (behaviorPromise = this._behaviorPromises[qualifiedPropertyName]) && (behaviorPromise.cancel(), delete this._behaviorPromises[qualifiedPropertyName], delete this._behaviorPromiseQueues[qualifiedPropertyName])
                }, reportRuntimeError: function(errorContext, errorMessage){}, getNamedObject: function(objName, bindingContext) {
                    var ds = this._data[objName];
                    if (Core.Utility.isDefined(ds))
                        if (this.hasDataSourceProvider(ds) && !this.hasError(objName)) {
                            var dataCopy = ds[this.metaProperty].dataSourceProvider.getDataWithRowIds();
                            return dataCopy[this.metaProperty] = ds[this.metaProperty], dataCopy
                        }
                        else
                            return ds;
                    var ctrl = OpenAjax.widget.byId(objName);
                    if (ctrl !== null)
                        return ctrl;
                    throw AppMagic.AuthoringTool.Runtime.Error.NamedObjectNotFound;
                }, getResourcePath: function(resourceName) {
                    var resource = this._resources[resourceName];
                    return typeof resource != "undefined" ? resource : null
                }, Error: {NamedObjectNotFound: "AppMagic.AuthoringTool.Runtime.Error.NamedObjectNotFound"}, setAliasValue: function(aliasPath, value) {
                    this._aliases[aliasPath] = value
                }, _setAliasValues: function(screenName, values) {
                    for (var newVars = Object.create(null), keys = Object.keys(values), i = 0, len = keys.length; i < len; i++) {
                        var key = keys[i],
                            dotPos = key.indexOf("."),
                            varName = key.substr(dotPos, key.length - dotPos),
                            newKey = screenName + varName;
                        this.setAliasValue(newKey, values[key]);
                        newVars[newKey] = !0
                    }
                    for (keys = Object.keys(newVars), i = 0, len = keys.length; i < len; i++)
                        this.onDataSourceChanged(keys[i])
                }, getAliasValue: function(aliasPath) {
                    var value = this._aliases[aliasPath];
                    return typeof value != "undefined" ? value : null
                }, _getAliasValues: function(screenName) {
                    for (var result = Object.create(null), keys = Object.keys(this._aliases), i = 0, len = keys.length; i < len; i++) {
                        var key = keys[i];
                        key.indexOf(screenName + ".") === 0 && (result[key] = this._aliases[key])
                    }
                    return result
                }, resetAliasValues: function(screenName) {
                    for (var keys = Object.keys(this._aliases), i = 0, len = keys.length; i < len; i++) {
                        var key = keys[i];
                        key.indexOf(screenName + ".") === 0 && (this._aliases[key] = null)
                    }
                }, _addCollection: function(dsName) {
                    var collection = [];
                    AppMagic.Utility.createPrivateImmutable(collection, this.collectionNameProperty, dsName);
                    this.assignTableID(collection);
                    this._data[dsName] = collection
                }, _resetCollection: function(dsName) {
                    var collection = this._data[dsName];
                    typeof collection != "undefined" && (AppMagic.Utility.releaseBlobs(collection), collection.length = 0, typeof collection[this.idProperty] != "undefined" && delete collection[this.idProperty], this.assignTableID(collection))
                }, _clearCollection: function(dsName) {
                    var collection = this._data[dsName];
                    typeof collection != "undefined" && (AppMagic.Utility.releaseBlobs(collection), collection.length = 0)
                }, _dynamicDataSourceErrorFunc: function(args){}, _addDynamicDataSource: function(dsName) {
                    var data = {};
                    AppMagic.Utility.createPrivateImmutable(data, this.dynamicDataSourceNameProperty, dsName);
                    this._data[dsName] = data
                }, enableDynamicDatasource: function(signalName) {
                    var data = this._data[signalName];
                    return data === null || typeof data == "undefined" ? !1 : this.subscribeDynamicDataSource(signalName, !0)
                }, disableDynamicDatasource: function(signalName) {
                    var data = this._data[signalName];
                    return data === null || typeof data == "undefined" ? !1 : this.unsubscribeDynamicDataSource(signalName)
                }, unsubscribeDynamicDataSource: function(signalName) {
                    var ds = AppMagic.DynamicDataSource.instance.getDynamicDataSource(signalName);
                    return ds === null || typeof ds == "undefined" ? !1 : ds.isEnabled ? (ds.unSubscribe(), !0) : !0
                }, subscribeDynamicDataSource: function(signalName, mustPopulate) {
                    var ds = AppMagic.DynamicDataSource.instance.getDynamicDataSource(signalName);
                    return ds === null || typeof ds == "undefined" ? !1 : ds.isEnabled ? !0 : (mustPopulate && ds.getData(this._dynamicDataSourceErrorFunc.bind(this)), ds.subscribe(), !0)
                }, _removeDynamicDataSource: function(dsName) {
                    var ds = AppMagic.DynamicDataSource.instance.getDynamicDataSource(dsName);
                    ds !== null && typeof ds != "undefined" && ds.isEnabled && ds.unSubscribe();
                    delete this._data[dsName]
                }, updateDynamicDatasource: function(signalName, newData) {
                    var oldData = this._data[signalName];
                    if (!AppMagic.Utility.deepCompare(oldData, newData)) {
                        AppMagic.Utility.createPrivateImmutable(newData, this.dynamicDataSourceNameProperty, signalName);
                        this._data[signalName] = newData;
                        this.onDataSourceChanged(signalName)
                    }
                }, _processDataSourceProvider: function(dsName, serviceName, dataSourceProvider) {
                    var data = [],
                        meta = {};
                    AppMagic.Utility.createOrSetPrivate(meta, "name", dsName);
                    AppMagic.Utility.createOrSetPrivate(meta, this.pluginTypeProperty, serviceName);
                    AppMagic.Utility.createOrSetPrivate(meta, this.dataSourceProviderProperty, dataSourceProvider);
                    AppMagic.Utility.createOrSetPrivate(meta, "schema", dataSourceProvider.schema);
                    AppMagic.Utility.createOrSetPrivate(data, this.metaProperty, meta);
                    AppMagic.Utility.createPrivateImmutable(data, this.collectionNameProperty, dsName);
                    data instanceof Array && this.assignTableID(data);
                    this._updateRuntimeAndJumpstartDataFlow(dsName, data)
                }, _processFailedDataSourceProvider: function(dsName, serviceName, errorMessage) {
                    var meta = {};
                    AppMagic.Utility.createOrSetPrivate(meta, "name", dsName);
                    AppMagic.Utility.createOrSetPrivate(meta, "pluginType", serviceName);
                    var data = [],
                        schema = AppMagic.Schema.createSchemaForArrayFromPointer([]);
                    AppMagic.Utility.createOrSetPrivate(meta, this.errorProperty, errorMessage);
                    AppMagic.Utility.createOrSetPrivate(meta, "schema", schema);
                    AppMagic.Utility.createOrSetPrivate(data, this.metaProperty, meta);
                    AppMagic.Utility.createPrivateImmutable(data, this.collectionNameProperty, dsName);
                    data instanceof Array && this.assignTableID(data);
                    this._updateRuntimeAndJumpstartDataFlow(dsName, data)
                }, _addStaticDataSource: function(data, dsName) {
                    this.assignTableID(data);
                    var meta = {};
                    AppMagic.Utility.createOrSetPrivate(data, this.metaProperty, meta);
                    AppMagic.Utility.createOrSetPrivate(meta, "name", dsName);
                    AppMagic.Utility.createOrSetPrivate(meta, "pluginType", "excel");
                    this._data[dsName] = data
                }, refreshDataSource: function(dsName) {
                    var data = this._data[dsName];
                    if (data === null || typeof data != "object")
                        return WinJS.Promise.as(!1);
                    var meta = data[this.metaProperty];
                    return typeof meta == "undefined" || meta.pluginType === AppMagic.Constants.DataConnections.Types.Excel ? WinJS.Promise.as(!1) : this._refreshServiceDataSource(meta.name)
                }, getDataSourceName: function(source) {
                    if (typeof source != "object")
                        return null;
                    var meta = source[this.metaProperty];
                    if (meta !== null && typeof meta != "undefined")
                        return meta.name;
                    var dsName = source[this.collectionNameProperty];
                    return typeof dsName == "string" ? dsName : (dsName = source[this.dynamicDataSourceNameProperty], typeof dsName == "string") ? dsName : null
                }, syncDataSource: function(dsName) {
                    var localData = this._data[dsName],
                        workspaceData = this._workspaceData[dsName];
                    var meta = localData[this.metaProperty],
                        pluginType = meta.pluginType,
                        dataSourceType = meta.dataSourceType,
                        configuration = meta.configuration;
                    var idProperty = this.idProperty,
                        spIdProperty = this.spIdProperty,
                        copiedData = localData.map(function(x) {
                            var copiedRow = {};
                            for (var objKey in x)
                                copiedRow[objKey] = x[objKey];
                            return copiedRow[idProperty] = x[idProperty], copiedRow
                        });
                    return this.syncSharePointDataSource(configuration, copiedData, workspaceData, pluginType).then(function(response) {
                            if (!response.success)
                                return response;
                            for (var workspaceIndex = 0, newData = response.result, i = 0, len = newData.length; i < len; i++) {
                                var row = newData[i],
                                    rowId = row[idProperty];
                                typeof rowId == "undefined" && (rowId = this.generateId(), row[idProperty] = rowId);
                                var spId = row[spIdProperty];
                                typeof spId != "undefined" && (workspaceData[workspaceIndex] = AppMagic.Utility.jsonClone(row), workspaceIndex++);
                                AppMagic.Utility.createPrivate(row, idProperty, rowId)
                            }
                            workspaceData.splice(workspaceIndex, workspaceData.length - workspaceIndex);
                            var table = this._data[dsName];
                            for (i = 0, len = newData.length; i < len; i++)
                                table[i] = newData[i];
                            table.splice(len, table.length - len);
                            this.onDataSourceChanged(dsName);
                            return {success: !0}
                        }.bind(this))
                }, syncSharePointDataSource: function(configuration, copiedData, workspaceData, pluginType) {
                    if (pluginType === AppMagic.Constants.DataConnections.Types.SharePoint)
                        return this._sharePointSyncController.synchronize(configuration, copiedData, workspaceData);
                    else if (pluginType === AppMagic.Constants.DataConnections.Types.SharePointOnline)
                        return this.sharePointOnlineBroker.getSharePointResource().then(function(response) {
                                return response.resultCode === AppMagic.Services.GetSharePointOnlineResourceResultCode.Success ? this._sharePointOnlineController.synchronize(configuration, copiedData, workspaceData, response.resource) : response.resultCode === AppMagic.Services.GetSharePointOnlineResourceResultCode.AuthFailure ? WinJs.Promise.wrap({
                                        success: !1, message: AppMagic.Strings.SharePointAuthenitcationFailure
                                    }) : WinJs.Promise.wrap({
                                        success: !1, message: AppMagic.Strings.UnknownErrorDiscoveringResources
                                    })
                            }.bind(this), function(error) {
                                return WinJs.Promise.wrap({
                                        success: !1, message: error.message
                                    })
                            });
                    else
                        return
                }, resolveDataSource: function(dsName, result) {
                    this._resolveDataSource(dsName, result);
                    typeof result.dataChanges == "object" && this._resolveDataSourceChanges(dsName, result.dataChanges)
                }, _resolveDataSource: function(dsName, syncResult) {
                    syncResult.configuration && this._resolveDataSourceConfiguration(dsName, syncResult.configuration)
                }, _resolveDataSourceConfiguration: function(dsName, configuration) {
                    var localData = this._data[dsName];
                    var meta = localData[this.metaProperty];
                    meta.configuration = configuration
                }, _resolveDataSourceChanges: function(dsName, dataChanges) {
                    for (var localData = this._data[dsName], addData = dataChanges.addData || [], editData = dataChanges.editData || {}, deleteData = dataChanges.deleteData || {}, versionUpdateData = dataChanges.versionUpdateData || {}, newSchema = dataChanges.schema, len, rowKey, i = localData.length - 1; i >= 0; i--) {
                        var datum = localData[i],
                            rowId = datum[AppMagic.AuthoringTool.Runtime.idProperty];
                        if (deleteData[rowId]) {
                            localData.splice(i, 1);
                            continue
                        }
                        var newRowData = editData[rowId];
                        if (newRowData) {
                            var unusedKeys = {};
                            Object.keys(datum).forEach(function(x) {
                                unusedKeys[x] = !0
                            });
                            for (rowKey in newRowData)
                                datum[rowKey] = newRowData[rowKey],
                                delete unusedKeys[rowKey];
                            for (var unusedKey in unusedKeys)
                                delete datum[unusedKey];
                            AppMagic.AuthoringTool.Runtime.assignRowID(datum);
                            continue
                        }
                        var newVersion = versionUpdateData[rowId];
                        if (typeof newVersion != "undefined") {
                            datum[this.syncVersionProperty] = newVersion;
                            continue
                        }
                    }
                    if (addData)
                        for (i = 0, len = addData.length; i < len; i++) {
                            var newDatum = addData[i];
                            AppMagic.AuthoringTool.Runtime.assignRowID(newDatum);
                            localData.push(newDatum)
                        }
                    var idProperty = this.idProperty;
                    this._workspaceData[dsName] = localData.map(function(x) {
                        var copiedRow = {};
                        for (rowKey in x)
                            copiedRow[rowKey] = x[rowKey];
                        return copiedRow[idProperty] = x[idProperty], copiedRow
                    });
                    this.onDataSourceChanged(dsName)
                }, getDataTemplates: function() {
                    return AppMagic.Utility.clone(this._dataTemplates)
                }, getPropertyValue: function(obj, invariantPropertyName, bindingContext) {
                    return obj === null || typeof obj == "undefined" ? null : AppMagic.Utility.isOpenAjaxControl(obj) ? obj.OpenAjax.getPropertyValue(invariantPropertyName, bindingContext) : obj.hasOwnProperty(invariantPropertyName) ? obj[invariantPropertyName] : null
                }, getFieldValue: function(obj, key) {
                    if (obj === null || typeof obj == "undefined" || AppMagic.Utility.isOpenAjaxControl(obj))
                        return null;
                    var result = obj[key];
                    return typeof result == "undefined" ? null : result
                }, _copyRowWithExpando: function(row, createExpando) {
                    if (row === null)
                        return null;
                    var result = {};
                    createExpando && (result._src = {});
                    for (var key in row) {
                        var value = row[key];
                        if (value instanceof Array) {
                            for (var tableCopy = [], i = 0; i < value.length; i++)
                                tableCopy.push(this._copyRowWithExpando(value[i], !1));
                            value = tableCopy
                        }
                        else
                            value === null || typeof value != "object" || AppMagic.Utility.isOpenAjaxControl(value) || (value = this._copyRowWithExpando(value, !1));
                        result[key] = value;
                        createExpando && (result._src[key] = value)
                    }
                    return AppMagic.Utility.copyId(row, result), result
                }, applyNameMap: function(data, nameMap, supportsExpando) {
                    if (data === null)
                        return null;
                    var result = null;
                    if (data instanceof Array) {
                        result = [];
                        for (var rowCount = data.length, i = 0; i < rowCount; i++) {
                            var row = data[i];
                            var newRow = this._copyRowWithExpando(row, supportsExpando);
                            this._doNameMapping(newRow, row, nameMap);
                            result.push(newRow)
                        }
                        AppMagic.Utility.copyId(data, result)
                    }
                    else
                        result = this._copyRowWithExpando(data, supportsExpando),
                        this._doNameMapping(result, data, nameMap);
                    return result[this.nameMapProperty] = nameMap, result
                }, _doNameMapping: function(mappedRow, origRow, nameMap) {
                    if (origRow !== null)
                        for (var sinkName in nameMap) {
                            var sourceName = nameMap[sinkName];
                            mappedRow[sinkName] = origRow[sourceName]
                        }
                }, makeExpando: function(data) {
                    if (data === null || typeof data == "undefined")
                        return null;
                    if (data instanceof Array) {
                        for (var result = [], rowCount = data.length, i = 0; i < rowCount; i++) {
                            var row = data[i];
                            var newRow = this._copyRowWithExpando(row, !0);
                            result.push(newRow)
                        }
                        return typeof data[this.idProperty] != "undefined" ? AppMagic.Utility.copyId(data, result) : this.assignTableID(result), result
                    }
                    else
                        return AppMagic.Utility.isOpenAjaxControl(data) ? data : this._copyRowWithExpando(data, !0)
                }, mergeExpando: function(data) {
                    if (data === null || typeof data == "undefined")
                        return null;
                    if (data instanceof Array) {
                        for (var result = [], i = 0, len = data.length; i < len; i++)
                            result.push(this.mergeExpandoRecord(data[i]));
                        return result
                    }
                    else if (typeof data == "object")
                        return this.mergeExpandoRecord(data);
                    return null
                }, mergeExpandoRecord: function(data) {
                    if (data === null || typeof data == "undefined")
                        return null;
                    if (AppMagic.Utility.isOpenAjaxControl(data))
                        return data;
                    var result = AppMagic.Utility.clone(data);
                    if (typeof data._src == "object")
                        for (var colName in data._src)
                            (typeof result[colName] == "undefined" || typeof result[colName] == "function") && (result[colName] = data._src[colName]);
                    for (var column in result) {
                        var rowEntry = result[column];
                        typeof rowEntry == "object" && (result[column] = this.mergeExpandoRecord(rowEntry));
                        rowEntry instanceof Array && (result[column] = this.mergeExpando(rowEntry))
                    }
                    return delete result._src, result
                }, getThisItem: function(bindingContext, nestLevel) {
                    return nestLevel > 0 && (bindingContext = this.getAncestorBindingContext(bindingContext, nestLevel)), this.mergeExpandoRecord({_src: bindingContext.thisItem})
                }, getAncestorBindingContext: function(bindingContext, nestLevel) {
                    for (; bindingContext && typeof bindingContext == "object" && nestLevel > 0; nestLevel--)
                        bindingContext = bindingContext.parent;
                    return bindingContext
                }, onSuspend: function(contextObj) {
                    contextObj.nextId = this._nextId;
                    contextObj.data = this._data;
                    contextObj.aliases = this._aliases;
                    contextObj.documentId = this._documentId
                }, onResumeFromTerminate: function(contextObj) {
                    this._nextId = contextObj.nextId;
                    this._data = contextObj.data;
                    this._aliases = contextObj.aliases;
                    this._documentId = contextObj.documentId
                }, assignTableID: function(table) {
                    if (table !== null && typeof table[this.idProperty] == "undefined") {
                        AppMagic.Utility.createOrSetPrivate(table, this.idProperty, this.generateId());
                        for (var i = 0, len = table.length; i < len; i++)
                            this.assignRowID(table[i])
                    }
                }, assignRowID: function(row, id) {
                    row && (typeof id == "undefined" && (id = this.generateId()), row[this.idProperty] && AppMagic.Utility.createOrSetPrivate(row, this.oldIdProperty, row[this.idProperty]), AppMagic.Utility.createOrSetPrivate(row, this.idProperty, id))
                }, copyNameMap: function(source, target) {
                    source.hasOwnProperty(this.nameMapProperty) && AppMagic.Utility.createOrSetPrivate(target, this.nameMapProperty, source[this.nameMapProperty])
                }, generateId: function() {
                    return this._nextId++
                }, makeColumn: function(args, tableId, columnName) {
                    (typeof columnName == "undefined" || columnName === null) && (columnName = this._valueColumnName);
                    var result = [],
                        argLen = args.length;
                    if (argLen < 1)
                        return result;
                    for (var rowIds = {}, i = 0; i < argLen; i++) {
                        for (var row = {}, arg = args[i], rowId = this._hashValue(arg); rowIds[rowId]; )
                            rowId = this.generateId();
                        rowIds[rowId] = !0;
                        row[columnName] = arg;
                        this.assignRowID(row, rowId);
                        result.push(row)
                    }
                    return tableId === 0 && (tableId = this.generateId()), AppMagic.Utility.createOrSetPrivate(result, this.idProperty, tableId), result
                }, _hashValue: function(arg) {
                    if (arg === null)
                        return 0;
                    switch (typeof arg) {
                        case"number":
                            return 1 + arg * 2;
                        case"string":
                            return 1 | this._hashStr(arg) << 1;
                        case"boolean":
                            return arg ? 3 : 1
                    }
                    return this.generateId() << 1
                }, _hashStr: function(arg) {
                    var argLen = arg.length,
                        hash = argLen;
                    if (argLen === 0)
                        return hash;
                    for (var i = 0; i < argLen; i++)
                        hash = (hash << 5 | hash >>> 27) ^ arg.charCodeAt(i);
                    return hash
                }, coerceTable: function(arg, coercer) {
                    if (arg === null)
                        return null;
                    for (var result = [], i = 0, argLen = arg.length; i < argLen; i++)
                        result.push(this.coerceRecord(arg[i], coercer));
                    return AppMagic.Utility.copyId(arg, result), this.copyNameMap(arg, result), result
                }, coerceRecord: function(arg, coercer) {
                    if (arg === null)
                        return arg;
                    for (var result = AppMagic.Utility.clone(arg, !0), keys = Object.keys(coercer), keyLen = keys.length, i = 0; i < keyLen; i++) {
                        var key = keys[i],
                            value = result[key];
                        typeof value != "undefined" && (result[key] = coercer[key](value))
                    }
                    return AppMagic.Utility.copyId(arg, result), result
                }, _updateRuntimeAndJumpstartDataFlow: function(dsName, data) {
                    this._data[dsName] = data;
                    var pluginType = data[this.metaProperty].pluginType;
                    if (AppMagic.Constants.Services.SharePointServices.indexOf(pluginType) >= 0) {
                        var idProperty = this.idProperty,
                            copiedData = data.map(function(x) {
                                var copiedRow = {};
                                for (var objKey in x)
                                    copiedRow[objKey] = x[objKey];
                                return copiedRow[idProperty] = x[idProperty], copiedRow
                            });
                        this._workspaceData[dsName] = copiedData
                    }
                    this.onDataSourceChanged(dsName)
                }, _createStaticServiceDispatcher: function() {
                    this._staticServiceDispatcher = this._dispatcherFactory.createDispatcher();
                    this._staticServiceWorkerController = new AppMagic.Services.StaticServiceWorkerController(this._staticServiceDispatcher);
                    var importer = AppMagic.Services.Importer.instance;
                    return importer.getServiceDefinitions().then(function(serviceDefinitions) {
                            this._serviceDefinitionsById = new Collections.Generic.Dictionary;
                            var initializationArgs = [];
                            serviceDefinitions.forEach(function(serviceDefinition) {
                                var serviceId = serviceDefinition.id;
                                this._serviceDefinitionsById.setValue(serviceId, serviceDefinition);
                                initializationArgs.push({
                                    dependencies: serviceDefinition.required.map(function(scriptDependency) {
                                        return AppMagic.IO.Path.getFullPath("services/" + serviceId + "/" + scriptDependency)
                                    }), classSpecifier: serviceDefinition.serviceClass.split("."), id: serviceId
                                })
                            }.bind(this));
                            initializationArgs.push({
                                dependencies: [], classSpecifier: ["AppMagic", "Services", "SharePointOnlineServiceWorker"], id: AppMagic.Constants.DataConnections.Types.SharePointOnline
                            });
                            this._staticServiceWorkerController.initialize(initializationArgs);
                            serviceDefinitions.forEach(function(serviceDefinition) {
                                var serviceName = serviceDefinition.id;
                                var types = Object.keys(serviceDefinition.dataSources);
                                types.forEach(function(type) {
                                    var typeDef = serviceDefinition.dataSources[type];
                                    this._dataTemplates[serviceName + "." + type] = {
                                        type: type, displayName: typeDef.displayName, serviceName: serviceName
                                    }
                                }.bind(this))
                            }.bind(this))
                        }.bind(this))
                }, _createAzureDispatcher: function() {
                    this._azureDispatcher = this._dispatcherFactory.createDispatcher()
                }, _createAzureConnectionManager: function() {
                    var mpfdh = new AppMagic.Utility.MultipartFormDataHelper;
                    this._azureController = new AppMagic.Services.Meta.RESTWorkerController(this._azureDispatcher, mpfdh);
                    this._azureController.initialize({serviceDefinition: {typesbyprefix: {}}});
                    var authoringToolAzureAppId = this._getO365ClientId.bind(this);
                    var brokerManager = this._brokerManagerFactory.getAzureBrokerManager();
                    this._azureConnectionManager = new AppMagic.Services.AzureConnectionManager(brokerManager, this._cookieManager, this._connectionStatusProvider, this._azureController, this.rootNamespaceCache, this._progressIndicatorViewModel, authoringToolAzureAppId)
                }, isAzureService: function(connectorDef) {
                    return connectorDef !== null ? connectorDef.id === AppMagic.Services.AzureConstants.ConnectorIds.office365 : !1
                }, isConnectedToCorpNet: function() {
                    var corpNetConnectionStatus = this._connectionStatusProvider.getCorpNetConnectionStatus();
                    return corpNetConnectionStatus === CorpNetConnectionStatus.Connected
                }, _getBrokerManager: function(connectorDef) {
                    return this.isAzureService(connectorDef) && this.isConnectedToCorpNet() ? this._brokerManagerFactory.getAzureBrokerManager() : this._brokerManagerFactory.getBrokerManager()
                }, _ensureAzureRedirectUri: function(def, connectorDef) {
                    this.isAzureService(connectorDef) && this.isConnectedToCorpNet() && def.auths !== null && def.auths.forEach(function(auth) {
                        auth.granttype.authorizationendpoint.redirecturi = AppMagic.Services.AzureConstants.Graph.sienaSidRedirectUri
                    })
                }, sendAzureLogoutRequest: function() {
                    var logOutQueryParameters = {},
                        AzureConstants = AppMagic.Services.AzureConstants;
                    logOutQueryParameters[AzureConstants.Graph.ParameterNames.postLogoutRedirectUri] = AzureConstants.Graph.sienaSidRedirectUri;
                    this._brokerManagerFactory.getAzureBrokerManager().requestAccessToken(AzureConstants.Graph.logOutUri, AzureConstants.Graph.sienaSidRedirectUri, logOutQueryParameters)
                }, _createAzureRefreshTokenStore: function() {
                    this._azureRefreshTokenStore = AppMagic.Services.AuthenticationStoreFactory.createOAuth2RefreshTokenStore(this.rootNamespaceCache, AppMagic.Services.AzureConstants.nsCacheKey)
                }, _createDispatcherAndControllers: function() {
                    this._dispatcher = this._dispatcherFactory.createDispatcher();
                    this._sharePointSyncController = new AppMagic.Services.SharePointSyncWorkerController(this._dispatcher);
                    this._sharePointOnlineController = new AppMagic.Services.SharePointOnlineWorkerController(this._dispatcher);
                    this._impexWorkerController = new AppMagic.Common.ImpexWorkerController(this._dispatcher)
                }, createZip: function(data, schema) {
                    return AppMagic.Utility.getBlobsInCollection(data).then(function(blobs) {
                            var clonedData = this._cloneAndFlattenOpenAjax(data),
                                root = {
                                    data: clonedData, schema: schema, blobs: blobs
                                };
                            return this._impexWorkerController.createZip(root)
                        }.bind(this))
                }, loadZip: function(buffer, impexID) {
                    return this._impexWorkerController.loadZip(buffer, impexID)
                }, _getServiceQueryArgs: function(dsServiceName, dsSourceName, initialDataSourceState) {
                    var copiedState = AppMagic.Utility.jsonClone(initialDataSourceState),
                        ensureServiceSpecificAuthenticationPromise;
                    dsServiceName === AppMagic.Constants.DataConnections.Types.SharePoint ? ensureServiceSpecificAuthenticationPromise = AppMagic.RuntimeBase.ensureSharePointAuthentication(copiedState.siteUri) : dsServiceName === AppMagic.Constants.DataConnections.Types.SharePointOnline ? (!this.sharePointOnlineBroker.resourceWebUrl && copiedState.siteUri && (this.sharePointOnlineBroker.resourceWebUrl = copiedState.siteUri), !this.azureConnectionManager.clientAppInfo && copiedState.appInfo && (this.azureConnectionManager.clientAppInfo = copiedState.appInfo), ensureServiceSpecificAuthenticationPromise = this.sharePointOnlineBroker.getSharePointResource().then(function(response) {
                            copiedState.resource = response.resultCode === AppMagic.Services.GetSharePointOnlineResourceResultCode.Success ? response.resource : null
                        })) : ensureServiceSpecificAuthenticationPromise = WinJS.Promise.wrap();
                    var queryFunctionName;
                    if (dsServiceName === AppMagic.Constants.DataConnections.Types.SharePointOnline)
                        queryFunctionName = AppMagic.Services.SharePointOnlineServiceWorker.FunctionName_querySharePointOnline;
                    else {
                        var serviceDefinition = this._serviceDefinitionsById.getValue(dsServiceName);
                        queryFunctionName = serviceDefinition.dataSources[dsSourceName].query
                    }
                    return {
                            ensureServiceSpecificAuthenticationPromise: ensureServiceSpecificAuthenticationPromise, authorizedDataSourceState: copiedState, queryFunctionName: queryFunctionName
                        }
                }, sharePointOnlineBroker: {get: function() {
                        return this.azureConnectionManager.sharePointOnlineBroker
                    }}, isSharePointOnlineMedia: function(url) {
                    return this.sharePointOnlineBroker === null ? !1 : this.sharePointOnlineBroker.isSharePointOnlineMedia(url)
                }, _cloneAndFlattenOpenAjax: function(data) {
                    var clonedData = AppMagic.Utility.clone(data, !0);
                    return this._removeOpenAjaxFromData(clonedData), clonedData
                }, _removeOpenAjaxFromData: function(data) {
                    if (data !== null)
                        if (data instanceof Array)
                            for (var i = 0; i < data.length; i++)
                                this._removeOpenAjaxFromData(data[i]);
                        else if (typeof data == "object") {
                            var keys = Object.keys(data);
                            for (i = 0; i < keys.length; i++) {
                                var key = keys[i];
                                AppMagic.Utility.isOpenAjaxControl(data[key]) ? data[key] = this._cloneOpenAjaxControl(data[key]) : (typeof data[key] == "object" || data[key] instanceof Array) && this._removeOpenAjaxFromData(data[key])
                            }
                        }
                }, _cloneOpenAjaxControl: function(openAjaxControl) {
                    var data = openAjaxControl.OpenAjax.getControlPropertyValues();
                    return this.mergeExpando(data)
                }, _addMetaServiceToRuntime: function(serviceNamespace, def, connectorDef, configStorageFile) {
                    var brokerManager = this._getBrokerManager(connectorDef);
                    this._ensureAzureRedirectUri(def, connectorDef);
                    var mpfdh = new AppMagic.Utility.MultipartFormDataHelper,
                        service = AppMagic.Services.ImportedService.createService(def, serviceNamespace, this.rootNamespaceCache, this._dispatcher, brokerManager, mpfdh, this.azureRefreshTokenStore);
                    var authStore = {};
                    def.auths.forEach(function(auth) {
                        authStore[auth.id] = AppMagic.Utility.clone(auth);
                        var authProvider = service.authenticationProviders[auth.id];
                        authStore[auth.id].authStore = authProvider.store;
                        authStore[auth.id].authProvider = authProvider
                    }.bind(this));
                    var authRequirementMap = {},
                        fnNames = Object.keys(service.functions);
                    fnNames.forEach(function(fnName) {
                        var serviceFunction = service.functions[fnName];
                        var fnDef = serviceFunction.functionDefinition;
                        authRequirementMap[fnDef.name] = fnDef.deftype === AppMagic.Services.ServiceConfigDeserialization.IRConstants.DefTypes.RestFunction ? fnDef.request.auth : null
                    }.bind(this));
                    this._importedServices[serviceNamespace] = {
                        service: service, authStore: authStore, authRequirementMap: authRequirementMap, promiseCollection: service.promiseCollection, configStorageFile: configStorageFile, connectorDef: connectorDef
                    }
                }, saveSessionAuthData: function() {
                    var sessionAuthData = AppMagic.Settings.instance.getValue(AppMagic.Constants.Services.AUTH_DOMAINS_KEY) || {};
                    var serviceNames = Object.keys(this._importedServices);
                    serviceNames.forEach(function(serviceName) {
                        var service = this._importedServices[serviceName];
                        var svcAuthData = sessionAuthData[serviceName];
                        typeof svcAuthData == "undefined" && (svcAuthData = {
                            hasUserAuthenticatedState: !1, domains: []
                        }, sessionAuthData[serviceName] = svcAuthData);
                        var serviceDomains = this._getAuthDomainsForService(service);
                        serviceDomains.forEach(function(svcDomain) {
                            svcAuthData.domains.indexOf(svcDomain) < 0 && svcAuthData.domains.push(svcDomain)
                        });
                        var hasUserAuthenticatedState = this._doesServiceHaveUserAuthenticatedState(service);
                        svcAuthData.hasUserAuthenticatedState = svcAuthData.hasUserAuthenticatedState || hasUserAuthenticatedState
                    }, this);
                    this.azureConnectionManager.saveSessionAuthData(sessionAuthData);
                    AppMagic.Settings.instance.setValue(AppMagic.Constants.Services.AUTH_DOMAINS_KEY, sessionAuthData)
                }, disposeSessionAuthData: function() {
                    var sessionAuthData = AppMagic.Settings.instance.getValue(AppMagic.Constants.Services.AUTH_DOMAINS_KEY) || {};
                    var serviceNames = Object.keys(sessionAuthData);
                    serviceNames.forEach(function(serviceName) {
                        var service = sessionAuthData[serviceName];
                        service.domains.forEach(function(domain) {
                            this._cookieManager.deleteCookies(domain)
                        }, this)
                    }, this);
                    this.azureConnectionManager.disconnect();
                    this.azureConnectionManager.disconnectSharePointOnline();
                    AppMagic.Settings.instance.setValue(AppMagic.Constants.Services.AUTH_DOMAINS_KEY, {});
                    this._authCache.clearTokens();
                    this.rootNamespaceCache.clear()
                }, _doesServiceHaveUserAuthenticatedState: function(service) {
                    var authStore = service.authStore;
                    var authIds = Object.keys(authStore);
                    return authIds.map(function(authId) {
                            return this._doesAuthHaveUserAuthenticatedState(authStore[authId])
                        }, this).reduce(function(a, b) {
                            return a || b
                        }, !1)
                }, _doesAuthHaveUserAuthenticatedState: function(authDesc) {
                    return authDesc.type === AppMagic.Constants.Services.AuthTypeNames.OAuth2 && authDesc.granttype === AppMagic.Constants.Services.OAuth2GrantType.ClientCredentials ? !1 : authDesc.authStore.isAuthenticated
                }, _getAuthDomainsForService: function(service) {
                    var authStore = service.authStore;
                    var authIds = Object.keys(authStore);
                    return authIds.map(function(authId) {
                            var authDesc = authStore[authId];
                            return authDesc.authStore.domains || []
                        }, this).reduce(function(a, b) {
                            return a.concat(b)
                        }, [])
                }, _disposeAuthForService: function(serviceNamespace) {
                    var authStore = this._importedServices[serviceNamespace].authStore;
                    var connectorDef = this.getConnectorDefinitionForService(serviceNamespace);
                    this.isAzureService(connectorDef) && (this.azureConnectionManager.clientAppInfo = null, this.azureConnectionManager.disconnect(), this.isConnectedToCorpNet() && this.sendAzureLogoutRequest());
                    var authIds = Object.keys(authStore);
                    authIds.forEach(function(authId) {
                        var authDesc = this._getAuthDescription(serviceNamespace, authId);
                        authDesc.authStore.clear(this._cookieManager);
                        authDesc.authProvider.grantType && authDesc.authProvider.grantType.refreshTokenStore && authDesc.authProvider.grantType.refreshTokenStore.deregisterService(serviceNamespace)
                    }.bind(this))
                }, _saveOAuth2State: function(serviceName, authId, response) {
                    var authDesc = this._getAuthDescription(serviceName, authId),
                        restConstants = AppMagic.Constants.Services.Rest;
                    if (authDesc.accessToken = response.result[restConstants.ResponseParamName_AccessToken], authDesc.expiresInMilliseconds = response.result[restConstants.ResponseParamName_ExpiresIn], typeof authDesc.expiresInMilliseconds == "string")
                        try {
                            authDesc.expiresInMilliseconds = parseInt(authDesc.expiresInMilliseconds, 10)
                        }
                        catch(e) {
                            authDesc.expiresInMilliseconds = restConstants.DefaultAccessTokenExpiration
                        }
                    typeof authDesc.expiresInMilliseconds != "number" && (authDesc.expiresInMilliseconds = restConstants.DefaultAccessTokenExpiration);
                    authDesc.expiresInMilliseconds *= 1e3;
                    authDesc.tokenStartTimeStamp = Date.now();
                    this._authCache.setToken(serviceName, authId, {
                        token: authDesc.accessToken, expiresIn: authDesc.expiresInMilliseconds, tokenStartTimeStamp: authDesc.tokenStartTimeStamp, domains: authDesc.domains
                    })
                }, requestOAuth2Token: function(authDesc, serviceName) {
                    if (authDesc.granttype === AppMagic.Constants.Services.OAuth2GrantType.ClientCredentials) {
                        var clientMethodFnInfo = this._importedServices[serviceName].service.controller.getHiddenFunctionInfo(authDesc.clientmethodref);
                        return clientMethodFnInfo.fn([], null)
                    }
                    else if (authDesc.granttype === AppMagic.Constants.Services.OAuth2GrantType.Implicit) {
                        var cachedToken = this._tryGetCachedToken(serviceName, authDesc.id);
                        if (cachedToken) {
                            authDesc.domains = cachedToken.domains;
                            var result = {};
                            return result[AppMagic.Constants.Services.Rest.ResponseParamName_AccessToken] = cachedToken.token, result[AppMagic.Constants.Services.Rest.ResponseParamName_ExpiresIn] = cachedToken.expiresIn, WinJS.Promise.wrap({
                                        success: !0, result: result
                                    })
                        }
                        var queryParameters = {};
                        return queryParameters.client_id = authDesc.clientid, queryParameters.redirect_uri = authDesc.callbackurl, queryParameters.response_type = "token", queryParameters.scope = authDesc.scope, this._brokerManagerFactory.getBrokerManager().requestAccessToken(authDesc.authurl, authDesc.callbackurl, queryParameters).then(function(response) {
                                    if (authDesc.domains = response.domains, !response.success)
                                        return response;
                                    var responseData = response.result;
                                    return RuntimeBase.parseOAuth2ResponseData(responseData)
                                })
                    }
                    else
                        return WinJS.Promise.wrap({
                                success: !1, message: AppMagic.Strings.Unimplemented
                            })
                }, _tryGetCachedToken: function(serviceName, authId) {
                    var cachedToken = this._authCache.getToken(serviceName, authId);
                    return cachedToken ? !cachedToken.expiresIn || cachedToken.expiresIn + cachedToken.tokenStartTimeStamp > Date.now() ? cachedToken : (this._authCache.removeToken(serviceName, authId), null) : null
                }, _getPromiseCollectionForService: function(serviceName) {
                    var importedService = this._importedServices[serviceName];
                    return importedService.promiseCollection
                }, _getAuthDescription: function(serviceName, authName) {
                    var importedService = this._importedServices[serviceName],
                        authStore = importedService.authStore,
                        authDesc = authStore[authName];
                    return authDesc
                }, getConnectorDefinitionForService: function(serviceNamespace) {
                    var service = this._importedServices[serviceNamespace];
                    return service.connectorDef
                }, isAuthExpired: function(serviceName, authName) {
                    var authDesc = this._getAuthDescription(serviceName, authName);
                    return Date.now() - authDesc.tokenStartTimeStamp >= authDesc.expiresInMilliseconds
                }, hasStub: function(serviceName) {
                    return typeof this._importedServices[serviceName] != "undefined"
                }, completeRestFunctionCallCore: function(result, progressIndicatorVm, actionId, errorContext, qualifiedFunctionName) {
                    return progressIndicatorVm.completeProgressAction(actionId), result.success ? result.result : null
                }, errorRestFunctionCallCore: function(error, progressIndicatorVm, actionId, promiseTimedOut, docId, errorContext, qualifiedFunctionName) {
                    if (Core.Utility.isCanceledError(error)) {
                        if (this._documentId !== docId)
                            throw new Error;
                        progressIndicatorVm.completeProgressAction(actionId)
                    }
                    return null
                }, getRestDataSourceFunction: function(serviceName, functionName) {
                    return AppMagic.AuthoringTool.Runtime.hasStub(serviceName) ? AppMagic.AuthoringTool.Runtime.getStubFunction(serviceName, functionName) : AppMagic.AuthoringTool.Runtime.getStaticDataSourceFunction(serviceName, functionName)
                }, getStaticDataSourceFunction: function(serviceName, functionName) {
                    var that = this;
                    return function() {
                            return that._staticServiceWorkerController.makeServiceCall(serviceName, functionName, that.shallowCopyArray(arguments, 0))
                        }
                }, getStubFunction: function(serviceName, functionName) {
                    var that = this,
                        promiseCollection = this._getPromiseCollectionForService(serviceName),
                        dynamicallyGeneratedFn = this._dynamicallyGeneratedFns[functionName];
                    if (typeof dynamicallyGeneratedFn == "function")
                        return function() {
                                return dynamicallyGeneratedFn.apply(that, [serviceName])
                            };
                    var promiseTimedOut = !1,
                        promise,
                        pivm = that._progressIndicatorViewModel,
                        promseCancelTimeout,
                        promiseCancelerRegisterer = function() {
                            promseCancelTimeout = setTimeout(function() {
                                promiseTimedOut = !0;
                                promise.cancel()
                            }, AppMagic.RuntimeBase._timeoutMillisecondsServiceFunctionCall)
                        },
                        promiseCancelerUnRegisterer = function() {
                            clearTimeout(promseCancelTimeout);
                            promseCancelTimeout = null;
                            promiseTimedOut = !1
                        },
                        docId = that._documentId,
                        actionId,
                        qualifiedFunctionName = serviceName + "!" + functionName,
                        completeRestFunctionCall = function(errorContext, result) {
                            return that.completeRestFunctionCallCore(result, pivm, actionId, errorContext, qualifiedFunctionName)
                        },
                        errorRestFunctionCall = function(errorContext, error) {
                            return that.errorRestFunctionCallCore(error, pivm, actionId, promiseTimedOut, docId, errorContext, qualifiedFunctionName)
                        },
                        functionInner = this.getStubFunctionInner(serviceName, functionName, promiseCancelerRegisterer, promiseCancelerUnRegisterer);
                    return function() {
                            var functionArguments = that.shallowCopyArray(arguments, 1),
                                errorContext = arguments[0],
                                functionInfo = that._importedServices[serviceName].service.controller.getFunctionInfo(functionName);
                            var fnThatReturnsPromise = function() {
                                    actionId = pivm.addProgressAction();
                                    for (var nullArgumentIndex = -1, i = 0, len = functionInfo.requiredParameters.length; i < len; i++)
                                        if (functionArguments[i] === null) {
                                            nullArgumentIndex = i;
                                            break
                                        }
                                    return nullArgumentIndex >= 0 && (functionInner = function() {
                                            return WinJS.Promise.wrap({
                                                    success: !1, message: Core.Utility.formatString(AppMagic.Strings.RestErrorNullParam, functionInfo.name, functionInfo.requiredParameters[nullArgumentIndex].name)
                                                })
                                        }.bind(that)), promise = functionInner.apply(null, functionArguments).then(completeRestFunctionCall.bind(this, errorContext), errorRestFunctionCall.bind(this, errorContext))
                                };
                            return promiseCollection.addJob(fnThatReturnsPromise)
                        }
                }, shallowCopyArray: function(array, startIndex) {
                    typeof startIndex == "undefined" && (startIndex = 0);
                    for (var len = array.length - startIndex, copy = new Array(len), i = 0; i < len; i++)
                        copy[i] = array[startIndex + i];
                    return copy
                }, applyDefaultValuesForOptionalParameters: function(serviceFunction, providedArgs) {
                    var functionInfo = serviceFunction.service.controller.getFunctionInfo(serviceFunction.name);
                    var optionalParamsIndex = functionInfo.requiredParameters.length,
                        optionalParamsProvided = providedArgs[optionalParamsIndex];
                    typeof optionalParamsProvided == "undefined" && (optionalParamsProvided = {});
                    for (var optionalParams = functionInfo.optionalParameters, i = 0; i < optionalParams.length; i++) {
                        var optionalParamInfo = optionalParams[i];
                        typeof optionalParamsProvided[optionalParamInfo.name] == "undefined" && optionalParamInfo.defaultValue !== null && (optionalParamsProvided[optionalParamInfo.name] = optionalParamInfo.defaultValue)
                    }
                    typeof providedArgs[optionalParamsIndex] == "undefined" && optionalParams.length > 0 && (providedArgs[optionalParamsIndex] = optionalParamsProvided)
                }, getStubFunctionInner: function(serviceName, functionName, onBeforeCall, onAfterCall) {
                    var that = this;
                    return function() {
                            var service = that._importedServices[serviceName].service;
                            var serviceFunction = service.functions[functionName];
                            var functionArguments = that.shallowCopyArray(arguments, 0);
                            that.applyDefaultValuesForOptionalParameters(serviceFunction, functionArguments);
                            var functionInfo = service.controller.getFunctionInfo(functionName);
                            var parameterValues = AppMagic.Services.generateArgMap(functionInfo.requiredParameters, functionInfo.optionalParameters, functionArguments);
                            return serviceFunction.runAsync(parameterValues, onBeforeCall, onAfterCall).then(function(functionResult) {
                                    return functionResult.success, that._logServiceFunctionCallTelemetry(serviceName, functionName, functionResult.success), functionResult
                                }, function(err) {
                                    if (Core.Utility.isCanceledError(err))
                                        throw err;
                                    return ServiceUtility.promiseErrorToAsyncResult(err)
                                })
                        }
                }, _signInFnDef: function(serviceNamespace) {
                    var authPromises = [],
                        authProviders = this._importedServices[serviceNamespace].service.authenticationProviders;
                    return Object.keys(authProviders).forEach(function(authProviderName) {
                            var authProvider = authProviders[authProviderName],
                                authPromise = authProvider.authenticateAsync(function(){}, function(){});
                            authPromises.push(authPromise)
                        }), WinJS.Promise.join(authPromises).then(function(responses) {
                            var allSuccessful = responses.every(function(response) {
                                    return response.success
                                });
                            return allSuccessful ? WinJS.Promise.wrap(!0) : WinJS.Promise.wrap(null)
                        }, function(responses) {
                            return WinJS.Promise.wrap(null)
                        })
                }, _signOutFnDef: function(serviceNamespace) {
                    var promiseCollection = this._getPromiseCollectionForService(serviceNamespace);
                    promiseCollection.cancelAll();
                    var connectorDef = this.getConnectorDefinitionForService(serviceNamespace);
                    this.isAzureService(connectorDef) && this.isConnectedToCorpNet() && this.sendAzureLogoutRequest();
                    var authProviders = this._importedServices[serviceNamespace].service.authenticationProviders;
                    return Object.keys(authProviders).forEach(function(authProviderName) {
                            var authProvider = authProviders[authProviderName];
                            authProvider.store.clear(this._cookieManager);
                            authProvider.grantType && authProvider.grantType.refreshTokenStore && authProvider.grantType.refreshTokenStore.deregisterService(serviceNamespace)
                        }.bind(this)), WinJS.Promise.wrap(!0)
                }, isDataSourceCollection: function(dsName) {
                    var ds = this._data[dsName];
                    var dsCollectionName = ds[this.collectionNameProperty];
                    return typeof dsCollectionName == "string" && typeof ds[this.metaProperty] == "undefined"
                }, dataSourceExists: function(dsName) {
                    return typeof this._data[dsName] != "undefined"
                }, hasDataSourceProvider: function(dataSource) {
                    return (dataSource instanceof Array) ? Core.Utility.isDefined(dataSource[this.metaProperty]) && this._dataSourceProviderFactoriesByServiceName.containsKey(this._getDataSourcePluginType(dataSource)) : !1
                }, hasSharePointOnlineDataSource: function() {
                    return Object.keys(this._data).some(function(dsName) {
                            return this._getDataSourcePluginType(this._data[dsName]) === AppMagic.Constants.DataConnections.Types.SharePointOnline
                        }, this)
                }
        }, {
            ensureSharePointAuthentication: function(sharePointSiteUrl) {
                return AppMagic.Services.xhr({url: sharePointSiteUrl}).then(function(){}, function(error) {
                        if (error.message === "Canceled")
                            throw error;
                    })
            }, parseOAuth2ResponseData: function(responseData) {
                    var RegexQueryStringParameter_AccessToken = /#([^=]*=[^&]*&)*?(access_token=(.*?))(&|$)/,
                        RegexQueryStringParameter_ExpiresIn = /#([^=]*=[^&]*&)*?(expires_in=(.*?))(&|$)/,
                        matches = responseData.match(RegexQueryStringParameter_AccessToken);
                    if (matches !== null) {
                        var accessToken = matches[3];
                        var decodedToken = decodeURIComponent(accessToken);
                        var constants = AppMagic.Constants.Services.Rest,
                            parsedResult = {};
                        return parsedResult[constants.ResponseParamName_AccessToken] = decodedToken, matches = responseData.match(RegexQueryStringParameter_ExpiresIn), matches !== null && (parsedResult[constants.ResponseParamName_ExpiresIn] = matches[3]), {
                                    success: !0, result: parsedResult
                                }
                    }
                    else
                        return {
                                success: !1, message: AppMagic.Strings.OAuth2ErrorInvalidResponseDataReturnedFromServer
                            }
                }, _timeoutMillisecondsServiceFunctionCall: 45e3
        });
    WinJS.Namespace.define("AppMagic", {RuntimeBase: RuntimeBase})
})(Windows);