//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(Platform) {"use strict";
    var ViewModels = AppMagic.AuthoringTool.ViewModels,
        RestConfigImportHandler = WinJS.Class.define(function RestConfigImportHandler_ctor(serviceNamespace, connectorDef, serviceConfigXml, serviceIcon, configStorageFile, templateUserValues, doc, settings, dataConnectionsViewModel) {
            this._serviceNamespace = serviceNamespace;
            this._connectorDef = connectorDef;
            this._serviceConfigXml = serviceConfigXml;
            this._serviceIcon = serviceIcon;
            this._configStorageFile = configStorageFile;
            this._templateUserValues = templateUserValues;
            this._doc = doc;
            this._settings = settings;
            this._dataConnectionsViewModel = dataConnectionsViewModel
        }, {
            _serviceNamespace: null, _connectorDef: null, _serviceConfigXml: null, _serviceIcon: null, _configStorageFile: null, _templateUserValues: null, _doc: null, _settings: null, _isTemplateInitialized: !1, _templateDef: null, _connectorHasDefaultTemplateValues: !1, _restServiceKeyConfigVm: null, _languageVariableNameAndValues: null, _dataConnectionsViewModel: null, serviceNamespace: {
                    get: function() {
                        return this._serviceNamespace
                    }, set: function(value) {
                            this._serviceNamespace = value
                        }
                }, restServiceKeyConfigVm: {get: function() {
                        return this._restServiceKeyConfigVm
                    }}, isUpdateOperation: {get: function() {
                        return this.serviceNamespace !== null
                    }}, connectorId: {get: function() {
                        return this._connectorDef === null ? null : this._connectorDef.id
                    }}, connectorHasDefaultTemplateValues: {get: function() {
                        return this._connectorHasDefaultTemplateValues
                    }}, connectorDef: {get: function() {
                        return this._connectorDef
                    }}, hasConfigurableTemplateVariables: {get: function() {
                        return this._restServiceKeyConfigVm !== null
                    }}, getTemplateUserValues: function() {
                    return AppMagic.Utility.jsonClone(this._templateUserValues)
                }, initializeTemplateDefinition: function() {
                    this._initializeTemplateDefinition(!1)
                }, initializeTemplateDefinitionAndDetectErrors: function() {
                    return this._initializeTemplateDefinition(!0)
                }, _initializeTemplateDefinition: function(showMessageOnError) {
                    if (this._languageVariableNameAndValues = null, this._restServiceKeyConfigVm = null, this._connectorHasDefaultTemplateValues = !1, this._serviceConfigXml !== null) {
                        var parseTemplateDefResult = AppMagic.AuthoringTool.Runtime.parseTemplateDefinition(this._doc, this._serviceConfigXml);
                        if (!parseTemplateDefResult.success && showMessageOnError)
                            return AppMagic.Utility.endsWith(parseTemplateDefResult.errorMessage.content, AppMagic.Strings.ImportWadlUnsupportedVersion) ? AppMagic.AuthoringTool.PlatformHelpers.showMessageWithHelpButton(parseTemplateDefResult.errorMessage.title, parseTemplateDefResult.errorMessage.content, AppMagic.Strings.RestWadlAuthoringHelpUrl) : AppMagic.AuthoringTool.PlatformHelpers.showMessage(parseTemplateDefResult.errorMessage.title, parseTemplateDefResult.errorMessage.content), !1;
                        if (this._templateDef = parseTemplateDefResult.templateDef, this._templateDef !== null) {
                            if (this._connectorDef !== null) {
                                var hasDefaultTemplateValues = AppMagic.AuthoringTool.Runtime.doesConnectorHaveDefaultTemplateValues(this._connectorDef);
                                this._connectorHasDefaultTemplateValues = hasDefaultTemplateValues
                            }
                            var retVal = AppMagic.AuthoringTool.Runtime.parseLanguageVariables(this._templateDef.variables);
                            this._languageVariableNameAndValues = retVal.languageVariableNameAndValues;
                            retVal.onlyLangVars || (this._restServiceKeyConfigVm = this.connectorId === AppMagic.Services.AzureConstants.ConnectorIds.office365 ? new ViewModels.AzureServiceKeyConfigViewModel(this._templateDef, this._settings, this) : new ViewModels.RestServiceKeyConfigViewModel(this._templateDef, this._settings, this))
                        }
                    }
                    return this._isTemplateInitialized = !0, !0
                }, importConfigUsingDefaultTemplateValuesAsync: function(setShownConnection) {
                    return this.connectorId === AppMagic.Services.AzureConstants.ConnectorIds.office365 ? this._importO365ConfigAsync(setShownConnection) : this._connectWithDefaultKeysAsync(setShownConnection)
                }, _importO365ConfigAsync: function(setShownConnection) {
                    var azureConnectionManager = AppMagic.AuthoringTool.Runtime.azureConnectionManager;
                    if (azureConnectionManager.isUsingDefaultValues)
                        return this._connectWithDefaultKeysAsync(setShownConnection);
                    var appInfo = azureConnectionManager.clientAppInfo;
                    var Office365TemplateVariableNames = AppMagic.Services.AzureConstants.TemplateVariableNames.Office365,
                        templateValues = {};
                    return templateValues[Office365TemplateVariableNames.clientId] = appInfo.clientId, templateValues[Office365TemplateVariableNames.redirectUri] = appInfo.redirectUri, templateValues[Office365TemplateVariableNames.tenantId] = appInfo.tenantId, WinJS.Promise.wrap(this._importOrUpdate(templateValues, !1, setShownConnection))
                }, importConfigUsingUserTemplateValuesAsync: function(templateVariableValues, setShownConnection) {
                    var importResult = this._importOrUpdate(templateVariableValues, !1, setShownConnection);
                    return WinJS.Promise.wrap(importResult)
                }, onClearUserVariableValuesAsync: function() {
                    return this._connectWithDefaultKeysAsync(!0)
                }, _importOrUpdate: function(templateVariableValues, hasDefaultKeys, setShownConnection) {
                    if (this._templateDef !== null) {
                        templateVariableValues = AppMagic.Utility.jsonClone(templateVariableValues);
                        templateVariableValues = AppMagic.AuthoringTool.Runtime.addLangVarsToTemplateVars(templateVariableValues, this._languageVariableNameAndValues);
                        var varNames = Object.keys(this._templateDef.variables);
                        varNames.forEach(function(varName){})
                    }
                    var parseAndValidationResult = AppMagic.Services.Meta.RESTWorkerController.parseAndValidateConfigXml(this._doc, this._serviceConfigXml, templateVariableValues);
                    if (!parseAndValidationResult.success)
                        return AppMagic.AuthoringTool.PlatformHelpers.showMessage(parseAndValidationResult.errorMessage.title, parseAndValidationResult.errorMessage.content), {success: !1};
                    var templateUserValues = hasDefaultKeys ? null : templateVariableValues,
                        serviceNamespace,
                        importOrUpdateResult,
                        operationSuccess;
                    if (this.isUpdateOperation) {
                        var updateResult = AppMagic.AuthoringTool.Runtime.updateMetaService(this._serviceNamespace, parseAndValidationResult.def, templateUserValues, hasDefaultKeys, this._doc);
                        operationSuccess = updateResult.success;
                        serviceNamespace = this._serviceNamespace;
                        operationSuccess && (this._templateUserValues = templateUserValues)
                    }
                    else {
                        var configState = {
                                originalXML: this._serviceConfigXml, templateDefinition: this._templateDef, templateUserValues: templateUserValues, hasDefaultKeys: hasDefaultKeys
                            },
                            importResult = AppMagic.AuthoringTool.Runtime.importMetaService(parseAndValidationResult.def, this._connectorDef, this._configStorageFile, configState, this._doc);
                        operationSuccess = importResult.success;
                        serviceNamespace = importResult.serviceName
                    }
                    return operationSuccess ? (setShownConnection && this._dataConnectionsViewModel.setShownConnectionMember(serviceNamespace), {
                            success: !0, serviceName: serviceNamespace
                        }) : {success: !1}
                }, _connectWithDefaultKeysAsync: function(setShownConnection) {
                    return AppMagic.AuthoringTool.Runtime.getConnectorDefaultTemplateValuesAsync(this._connectorDef).then(function(templateVariableValues) {
                            if (templateVariableValues === null)
                                return WinJS.Promise.wrap({
                                        success: !1, message: "Unable to retrieve default template values."
                                    });
                            else {
                                var importResult = this._importOrUpdate(templateVariableValues, !0, setShownConnection);
                                return WinJS.Promise.wrap(importResult)
                            }
                        }.bind(this))
                }
        }, {
            TemplateDefinitionNameKey: "name", TemplateDefinitionTitleKey: "title", TemplateDefinitionValueKey: "value"
        });
    WinJS.Namespace.define("AppMagic.Services.Meta", {RestConfigImportHandler: RestConfigImportHandler})
})(Windows);