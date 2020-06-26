//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(Platform) {"use strict";
    var PublishRuntime = WinJS.Class.derive(AppMagic.RuntimeBase, function PublishRuntime_ctor(authBrokerManagerFactory, authCache, cookieManager, connectionStatusProvider, dispatcherFactory) {
            AppMagic.RuntimeBase.call(this, authBrokerManagerFactory, authCache, cookieManager, connectionStatusProvider, dispatcherFactory);
            this._outstandingServiceCalls = [];
            this._activeScreenIndex = ko.observable(AppMagic.Publish.Canvas.currentScreen);
            this._dataSourceProviderFactoriesByServiceName.setValue(AppMagic.Constants.DataConnections.Types.LocalTable, new AppMagic.PublishedApp.DataSources.PublishLocalTableProviderFactory)
        }, {
            _outstandingServiceCalls: null, isAuthoring: {get: function() {
                        return !1
                    }}, isO365ConnectorReconstructionRequired: function() {
                    return !1
                }, getDocumentId: function() {
                    return ""
                }, _addOutstandingServiceCall: function(p) {
                    this._outstandingServiceCalls.push(p)
                }, _removeOutstandingServiceCall: function(p) {
                    for (var i = 0, len = this._outstandingServiceCalls.length; i < len; i++)
                        if (this._outstandingServiceCalls[i] === p) {
                            this._outstandingServiceCalls.splice(i, 1);
                            break
                        }
                }, getOutstandingServiceCallsPromises: function() {
                    return this._outstandingServiceCalls
                }, configureServiceDataSource: function(serviceInfo) {
                    var rt = this;
                    return this.configureService(serviceInfo).then(rt._addServiceDataSource.bind(rt))
                }, configureService: function(serviceInfo) {
                    return WinJS.Promise.wrap(serviceInfo)
                }, _serviceDataSourceInfos: {}, _addDataSourceProvider: function(dataSourceInfo) {
                    var dsName = dataSourceInfo.name;
                    var publishedDataSourceReader = new AppMagic.Common.PublishedDataSourceInfoReader(dataSourceInfo),
                        factory = this._dataSourceProviderFactoriesByServiceName.getValue(dataSourceInfo.serviceName),
                        creator = new AppMagic.Common.PublishDataSourceProviderCreator(publishedDataSourceReader, factory, this);
                    return creator.createProvider().then(function(createResult) {
                            createResult.success ? this._processDataSourceProvider(dsName, dataSourceInfo.serviceName, createResult.result.provider) : this._processFailedDataSourceProvider(dsName, dataSourceInfo.serviceName, createResult.message)
                        }.bind(this))
                }, _refreshServiceDataSource: function(dsName) {
                    var info = this._serviceDataSourceInfos[dsName];
                    return info !== null && typeof info != "undefined" ? this._addServiceDataSource(info) : WinJS.Promise.as(!1)
                }, _addServiceDataSource: function(ds) {
                    var dsName = ds.name,
                        dsServiceName = ds.serviceName,
                        dsSourceName = ds.sourceName,
                        initialConfig = ds.configuration;
                    if (initialConfig.appInfo && !this.azureConnectionManager.clientAppInfo && (this.azureConnectionManager.clientAppInfo = initialConfig.appInfo), initialConfig.state)
                        return this._addDataSourceProvider(ds);
                    this._serviceDataSourceInfos[dsName] = ds;
                    var addMetadata = function(response) {
                            var dataSourceInfo = response.result;
                            response.success && (dataSourceInfo = response.result);
                            var meta = {};
                            AppMagic.Utility.createOrSetPrivate(meta, "name", dsName);
                            AppMagic.Utility.createOrSetPrivate(meta, "pluginType", dsServiceName);
                            AppMagic.Utility.createOrSetPrivate(meta, "dataSourceType", dsSourceName);
                            var data,
                                schema;
                            return response.success ? (data = response.result.result, schema = response.result.schema, AppMagic.Utility.createOrSetPrivate(meta, "configuration", response.result.configuration)) : (data = [], schema = AppMagic.Schema.createSchemaForArrayFromPointer([]), AppMagic.Utility.createOrSetPrivate(meta, this.errorProperty, "")), AppMagic.Utility.createOrSetPrivate(meta, "schema", schema), AppMagic.Utility.createOrSetPrivate(data, this.metaProperty, meta), AppMagic.Utility.createPrivateImmutable(data, this.collectionNameProperty, dsName), data instanceof Array && this.assignTableID(data), {
                                        success: response.success, data: data
                                    }
                        }.bind(this),
                        updateRuntime = function(response) {
                            return this._removeOutstandingServiceCall(dsCall), this._updateRuntimeAndJumpstartDataFlow(dsName, response.data), WinJS.Promise.as(response.success)
                        }.bind(this),
                        serviceCallArgs = this._getServiceQueryArgs(dsServiceName, dsSourceName, initialConfig),
                        queryFunctionName = serviceCallArgs.queryFunctionName,
                        authorizedDataSourceState = serviceCallArgs.authorizedDataSourceState,
                        ensureServiceSpecificAuthenticationPromise = serviceCallArgs.ensureServiceSpecificAuthenticationPromise,
                        dsCall = ensureServiceSpecificAuthenticationPromise.then(function() {
                            return this._staticServiceWorkerController.makeServiceCall(dsServiceName, queryFunctionName, [authorizedDataSourceState]).then(addMetadata).then(updateRuntime)
                        }.bind(this));
                    return this._addOutstandingServiceCall(dsCall), dsCall
                }, getParentScreenName: function(visualOrScreenName) {
                    return AppMagic.Publish.Canvas.getParentScreenName(visualOrScreenName)
                }, navigateTo: function(targetName, transition) {
                    var oldScreenName = AppMagic.Publish.Canvas.currentScreen,
                        oldScreenElement = document.getElementById(AppMagic.Publish.Canvas.buildContainerName(AppMagic.Publish.Canvas.screens[oldScreenName])),
                        oldScreenControl = OpenAjax.widget.byId(oldScreenName),
                        newScreenControl = OpenAjax.widget.byId(targetName);
                    AppMagic.Publish.Canvas.currentScreen = AppMagic.Publish.Canvas.getParentScreenName(targetName);
                    var newScreenElement = document.getElementById(AppMagic.Publish.Canvas.buildContainerName(AppMagic.Publish.Canvas.screens[AppMagic.Publish.Canvas.currentScreen]));
                    oldScreenControl.OpenAjax.fireEvent(AppMagic.AuthoringTool.OpenAjaxPropertyNames.OnHidden);
                    AppMagic.AuthoringTool.Animation.screenTransition(transition, newScreenElement, oldScreenElement).then(function() {
                        this._activeScreenIndex(AppMagic.Publish.Canvas.currentScreen);
                        newScreenControl.OpenAjax.fireEvent(AppMagic.AuthoringTool.OpenAjaxPropertyNames.OnVisible, newScreenControl)
                    }.bind(this))
                }, importMetaService: function(namespace, def) {
                    def.auths !== null && def.auths.forEach(function(auth) {
                        var clientAppInfo = this.azureConnectionManager.clientAppInfo || {};
                        return auth.id === AppMagic.Services.AzureConstants.AuthenticationProviderIds.office365 && auth.granttype.clientid && auth.granttype.authorizationendpoint.redirecturi ? (clientAppInfo.clientId = auth.granttype.clientid, clientAppInfo.redirectUri = auth.granttype.authorizationendpoint.redirecturi, this.azureConnectionManager.clientAppInfo = clientAppInfo) : auth.id === AppMagic.Services.AzureConstants.AuthenticationProviderIds.adGraph && def.functions.forEach(function(func) {
                                return typeof func.request != "undefined" && typeof func.request.auth != "undefined" && func.request.auth === AppMagic.Services.AzureConstants.AuthenticationProviderIds.adGraph ? (clientAppInfo.tenantId = func.request.url.base.split("/").pop(), this.azureConnectionManager.clientAppInfo = clientAppInfo, !1) : !0
                            }.bind(this)), !0
                    }.bind(this));
                    this._addMetaServiceToRuntime(namespace, def)
                }, _addMetaServiceToRuntime: function(serviceNamespace, def) {
                    AppMagic.RuntimeBase.prototype._addMetaServiceToRuntime.call(this, serviceNamespace, def, null, null)
                }, _getO365ClientId: function() {
                    return "unused"
                }, _logServiceFunctionCallTelemetry: function(serviceNamespace, functionName, success){}
        }, {});
    WinJS.Namespace.define("AppMagic.AuthoringTool", {Runtime: new PublishRuntime(AppMagic.Services.AuthenticationBrokerManagerFactory.instance, new AppMagic.Services.AuthenticationCache(AppMagic.Settings.instance), AppMagic.Services.CookieManager.instance, AppMagic.ConnectionStatusProvider.instance, new AppMagic.Workers.DispatcherFactory(new AppMagic.Workers.WebWorkerFactory))})
})(Windows);