//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(Platform) {"use strict";
    var ServiceConfig = AppMagic.Constants.Services.Config,
        RestServicePackageImportConfigViewModel = WinJS.Class.define(function RestServicePackageImportConfigViewModel_ctor(doc, settings, serviceInfo, dataConnectionsViewModel) {
            this._dataConnectionsViewModel = dataConnectionsViewModel;
            this._document = doc;
            this._settings = settings;
            this._buttonHasFocus = ko.observable(!1);
            this._serviceInfo = serviceInfo;
            this._restConfigImportHandler = new AppMagic.Services.Meta.RestConfigImportHandler(null, this.connectorDefinition, this._serviceInfo.configXml, this.serviceIcon, null, null, this._document, this._settings, this._dataConnectionsViewModel);
            this._restConfigImportHandler.initializeTemplateDefinition();
            this._showKeyConfig = this._restConfigImportHandler.hasConfigurableTemplateVariables && !this.restConfigImportHandler.connectorHasDefaultTemplateValues;
            this._restConfigImportHandler.hasConfigurableTemplateVariables && this._restConfigImportHandler.restServiceKeyConfigVm.setAfterConnectCallback(this._onAfterConnect.bind(this));
            this._afterConnectFn = null
        }, {
            _document: null, _settings: null, _restConfigImportHandler: null, _dataConnectionsViewModel: null, _serviceInfo: null, _connectorDef: null, _serviceIcon: null, _serviceConfigXml: null, _buttonHasFocus: null, _showKeyConfig: !1, _afterConnectFn: null, reset: function() {
                    this._afterConnectFn = null;
                    this._showKeyConfig && (this._restConfigImportHandler.restServiceKeyConfigVm.reset(), this._restConfigImportHandler.restServiceKeyConfigVm.setAfterConnectCallback(this._onAfterConnect.bind(this)))
                }, serviceInfo: {get: function() {
                        return this._serviceInfo
                    }}, restConfigImportHandler: {get: function() {
                        return this._restConfigImportHandler
                    }}, hasConfigurableTemplateVariables: {get: function() {
                        return this._restConfigImportHandler.hasConfigurableTemplateVariables
                    }}, serviceKeyConfigViewModel: {get: function() {
                        return this._restConfigImportHandler.restServiceKeyConfigVm
                    }}, buttonHasFocus: {
                    get: function() {
                        return this._buttonHasFocus()
                    }, set: function(value) {
                            this._buttonHasFocus(value)
                        }
                }, showKeyConfig: {get: function() {
                        return this._showKeyConfig
                    }}, connectorDefinition: {get: function() {
                        return this._connectorDef === null && (this._connectorDef = {
                                id: this._serviceInfo.connectorId, version: this._serviceInfo.connectorVersion
                            }), this._connectorDef
                    }}, serviceConfigXml: {get: function() {
                        if (this._serviceConfigXml === null) {
                            var configXml = this._serviceInfo.configXml;
                            this._serviceConfigXml = configXml
                        }
                        return this._serviceConfigXml
                    }}, serviceIcon: {get: function() {
                        if (this._serviceIcon === null) {
                            var icon = this._serviceInfo.iconPath;
                            this._serviceIcon = icon
                        }
                        return this._serviceIcon
                    }}, notifyBeforeSelectAsync: function() {
                    return this.showKeyConfig || this._buttonHasFocus(!0), WinJS.Promise.wrap(!0)
                }, onConnectWithDefaultKeysClick: function() {
                    var promise;
                    promise = this.restConfigImportHandler.connectorHasDefaultTemplateValues ? this.restConfigImportHandler.importConfigUsingDefaultTemplateValuesAsync(!0) : this.restConfigImportHandler.importConfigUsingUserTemplateValuesAsync(null, !0);
                    promise.then(function(importResult) {
                        importResult.success && this._onAfterConnect()
                    }.bind(this))
                }, onConnectWithDefaultKeysKeyDown: function(data, e) {
                    return e.key === AppMagic.Constants.Keys.enter ? (this.onConnectWithDefaultKeysClick(), !1) : !0
                }, setAfterConnectCallback: function(afterConnectFn) {
                    this._afterConnectFn = afterConnectFn
                }, _onAfterConnect: function() {
                    this._dataConnectionsViewModel.notifyServiceDatasourceImported();
                    this._afterConnectFn && this._afterConnectFn()
                }
        }, {});
    WinJS.Class.mix(RestServicePackageImportConfigViewModel, WinJS.Utilities.eventMixin);
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {RestServicePackageImportConfigViewModel: RestServicePackageImportConfigViewModel})
})(Windows);