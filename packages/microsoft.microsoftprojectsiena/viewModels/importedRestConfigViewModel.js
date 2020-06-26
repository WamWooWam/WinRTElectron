//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(Platform) {"use strict";
    var ConnectionViewModel = AppMagic.AuthoringTool.ViewModels.ConnectionViewModel,
        TimeoutMillisecondsRetrievingSampleTakingLong = 5e3,
        InitialColWidths = [200, 675],
        ImportedRestConfigViewModel = WinJS.Class.derive(AppMagic.Utility.Disposable, function ImportedRestConfigViewModel_ctor(serviceNamespace, connectorDef, fullPath, rt, restConfigImportHandler, icon, dataConnectionsViewModel) {
            AppMagic.Utility.Disposable.call(this);
            this._serviceNamespace = serviceNamespace;
            connectorDef !== null;
            this._connectorDef = connectorDef;
            this._fullPath = fullPath;
            this._runtime = rt;
            var splitResult = ImportedRestConfigViewModel.splitFullPathIntoParts(this._fullPath);
            this._filename = splitResult.filename;
            this._filePath = splitResult.filePath;
            this._functions = ko.observableArray();
            this._selectedFunction = ko.observable(null);
            this.track("_dataViewerViewModel", new AppMagic.AuthoringTool.ObjectViewer.DataViewerViewModel);
            this._restConfigImportHandler = restConfigImportHandler;
            this._errorMessage = ko.observable("");
            this._isDataVisible = ko.observable(!1);
            this._isWaitVisible = ko.observable(!1);
            this._isTryItVisible = ko.observable(!1);
            this._isServiceRefreshVisible = ko.observable(!1);
            this._sampleDataHeader = ko.observable("");
            this._isExpanded = ko.observable(!1);
            this._isServiceKeyConfigPageVisible = ko.observable(!1);
            this._detailColWidths = ko.observableArray(InitialColWidths);
            this._serviceKeyConfigViewModel = ko.observable(null);
            this._icon = icon;
            this._dataConnectionsViewModel = dataConnectionsViewModel;
            this._isRemoveEnabled = ko.observable(!0);
            this._restConfigImportHandler.hasConfigurableTemplateVariables && this._serviceKeyConfigViewModel(this._restConfigImportHandler.restServiceKeyConfigVm)
        }, {
            _runtime: null, _serviceNamespace: null, _connectorDef: null, _fullPath: null, _filePath: null, _filename: null, _functions: null, _selectedFunction: null, _dataViewerViewModel: null, _errorMessage: null, _isDataVisible: null, _isServiceRefreshVisible: null, _isWaitVisible: null, _isTryItVisible: null, _setDataPromise: null, _timeoutDataTakingLong: null, _detailColWidths: null, _blobUri: null, _sampleDataHeader: null, _isExpanded: null, _restConfigImportHandler: null, _serviceKeyConfigViewModel: null, _isServiceKeyConfigPageVisible: null, _icon: null, _dataConnectionsViewModel: null, groupType: {get: function() {
                        return AppMagic.Authoring.BackStage.ConnectionType.RestService
                    }}, hasKeys: {get: function() {
                        return this._restConfigImportHandler.hasConfigurableTemplateVariables
                    }}, notifyShow: function() {
                    this._dataViewerViewModel.notifyShow()
                }, icon: {get: function() {
                        return this._icon
                    }}, functions: {get: function() {
                        return this._functions()
                    }}, detailColWidths: {get: function() {
                        return this._detailColWidths()
                    }}, addFunction: function(functionName, description, parametersDescription, displayName) {
                    var fn = {
                            functionName: functionName, description: description, parametersDescription: parametersDescription, displayName: displayName
                        };
                    this._functions.push(fn);
                    this._functions().length === 1 && (this.selectedFunction = fn)
                }, selectedFunction: {
                    get: function() {
                        return this._selectedFunction()
                    }, set: function(value) {
                            this._cancelAndNullifySetDataPromise();
                            this._setErrorMessageAndHideData("");
                            this._selectedFunction(value);
                            var workerController = this._runtime.getImportedService(this._serviceNamespace),
                                functionInfo = workerController.getFunctionInfo(value.functionName);
                            this._isTryItVisible(!functionInfo.disableTryIt);
                            this._populateSampleUsageHeader(this._serviceNamespace, functionInfo)
                        }
                }, serviceNamespace: {get: function() {
                        return this._serviceNamespace
                    }}, connectorId: {get: function() {
                        return this._connectorDef === null ? null : this._connectorDef.id
                    }}, filename: {get: function() {
                        return this._filename
                    }}, filePath: {get: function() {
                        return this._filePath
                    }}, restConfigImportHandler: {get: function() {
                        return this._restConfigImportHandler
                    }}, errorMessage: {get: function() {
                        return this._errorMessage()
                    }}, isServiceKeyConfigPageVisible: {get: function() {
                        return this._isServiceKeyConfigPageVisible()
                    }}, isDataVisible: {get: function() {
                        return this._isDataVisible()
                    }}, isWaitVisible: {get: function() {
                        return this._isWaitVisible()
                    }}, isServiceRefreshVisible: {get: function() {
                        var serviceNamespace = this._serviceNamespace;
                        var service = this._runtime._importedServices[serviceNamespace];
                        return this._isServiceRefreshVisible(service.configStorageFile !== null), this._isServiceRefreshVisible()
                    }}, sampleDataHeader: {get: function() {
                        return this._sampleDataHeader()
                    }}, isTryItVisible: {get: function() {
                        return this._isTryItVisible()
                    }}, dataViewerViewModel: {get: function() {
                        return this._dataViewerViewModel
                    }}, serviceKeyConfigViewModel: {get: function() {
                        return this._serviceKeyConfigViewModel()
                    }}, isExpanded: {
                    get: function() {
                        return this._isExpanded()
                    }, set: function(value) {
                            this._isExpanded(value)
                        }
                }, onClickFunction: function() {
                    this._isServiceKeyConfigPageVisible() && (this._isServiceKeyConfigPageVisible(!1), this._dataConnectionsViewModel.notifySelectConnection(this), this.dispatchEvent(ImportedRestConfigViewModel.events.restconnectiondatavisible, {type: "function"}))
                }, onClickKeys: function() {
                    this.serviceKeyConfigViewModel.reset();
                    this._isServiceKeyConfigPageVisible() || (this._isServiceKeyConfigPageVisible(!0), this._dataConnectionsViewModel.notifySelectConnection(this), this.dispatchEvent(ImportedRestConfigViewModel.events.restconnectiondatavisible, {type: "keys"}))
                }, getColWidth: function(index) {
                    return this._detailColWidths()[index]
                }, setColWidth: function(index, width) {
                    this._detailColWidths.splice(index, 1, width)
                }, onMSPointerDownResizeColWidth: function(colIndex, data, evt) {
                    this.dispatchEvent(ImportedRestConfigViewModel.events.mspointerdownresizecolwidth, {
                        index: colIndex, event: evt
                    })
                }, _populateSampleUsageHeader: function(serviceNamespace, functionInfo) {
                    for (var requiredParameters = functionInfo.requiredParameters, parameter, missingDefaultNames = [], i = 0, len = requiredParameters.length; i < len; i++)
                        parameter = requiredParameters[i],
                        parameter.tryItValue === null && missingDefaultNames.push(Core.Utility.formatString(AppMagic.AuthoringStrings.RestConnectionErrorMissingSampleDefaultFormat, parameter.name));
                    if (missingDefaultNames.length > 0)
                        this._sampleDataHeader("");
                    else {
                        for (var requiredParametersSampleDefaultValues = [], requiredParametersIndex = 0; requiredParametersIndex < requiredParameters.length; requiredParametersIndex++)
                            parameter = requiredParameters[requiredParametersIndex],
                            requiredParametersSampleDefaultValues.push(JSON.stringify(parameter.tryItValue));
                        var optionalParametersStringFormatted = "",
                            optionalParametersSampleDefaultValues = [];
                        var optionalParameters = functionInfo.optionalParameters;
                        if (optionalParameters.length > 0)
                            for (var optionalArgs = {}, optionalParameterIdx = 0; optionalParameterIdx < optionalParameters.length; optionalParameterIdx++)
                                parameter = optionalParameters[optionalParameterIdx],
                                parameter.tryItValue !== null && optionalParametersSampleDefaultValues.push(Core.Utility.formatString("{0}: {1}", parameter.name, JSON.stringify(parameter.tryItValue)));
                        var selectedFunctionDisplayName = this._selectedFunction().displayName;
                        var requiredOptionalParametersSeparator = "";
                        requiredParametersSampleDefaultValues.length > 0 && optionalParametersSampleDefaultValues.length > 0 && (requiredOptionalParametersSeparator = ", ");
                        optionalParametersSampleDefaultValues.length > 0 && (optionalParametersStringFormatted = Core.Utility.formatString("{{0}}", optionalParametersSampleDefaultValues.join(", ")));
                        this._sampleDataHeader(Core.Utility.formatString("{0}: {1}!{2} ({3}{4}{5})", AppMagic.AuthoringStrings.RestSampleData, serviceNamespace, selectedFunctionDisplayName, requiredParametersSampleDefaultValues.join(", "), requiredOptionalParametersSeparator, optionalParametersStringFormatted))
                    }
                }, _cancelAndNullifySetDataPromise: function() {
                    this._setDataPromise && (this._setDataPromise.cancel(), this._setDataPromise = null, this._isWaitVisible(!1), clearTimeout(this._timeoutDataTakingLong), this._timeoutDataTakingLong = null)
                }, _setErrorMessageAndHideData: function(errorMessage) {
                    this._errorMessage(errorMessage);
                    this._isDataVisible(!1)
                }, onClickRestFunction: function(selectedFunction) {
                    this._cancelAndNullifySetDataPromise();
                    this._setErrorMessageAndHideData("");
                    this._selectedFunction(selectedFunction);
                    var workerController = this._runtime.getImportedService(this._serviceNamespace),
                        functionInfo = workerController.getFunctionInfo(selectedFunction.functionName);
                    this._isTryItVisible(!functionInfo.disableTryIt)
                }, toggleExpansionAndRetrieveData: function() {
                    this._isExpanded(!this._isExpanded());
                    var type = this._isServiceKeyConfigPageVisible() ? "function" : null;
                    this._isServiceKeyConfigPageVisible(!1);
                    this.dispatchEvent(ImportedRestConfigViewModel.events.restconnectiondatavisible, {type: type});
                    this._isExpanded() && this._dataConnectionsViewModel.notifySelectConnection(this)
                }, onClickTryIt: function() {
                    this._cancelAndNullifySetDataPromise();
                    for (var workerController = this._runtime.getImportedService(this._serviceNamespace), selectedFunctionName = this._selectedFunction().functionName, selectedFunctionDisplayName = this._selectedFunction().displayName, functionInfo = workerController.getFunctionInfo(selectedFunctionName), requiredParameters = functionInfo.requiredParameters, missingDefaultNames = [], parameter, i = 0, len = requiredParameters.length; i < len; i++)
                        parameter = functionInfo.requiredParameters[i],
                        parameter.tryItValue === null && missingDefaultNames.push(Core.Utility.formatString(AppMagic.AuthoringStrings.RestConnectionErrorMissingSampleDefaultFormat, parameter.name));
                    if (missingDefaultNames.length > 0) {
                        missingDefaultNames.unshift(AppMagic.AuthoringStrings.RestConnectionErrorInsufficientArguments);
                        var missingDefaultMessage = missingDefaultNames.join("");
                        this._setErrorMessageAndHideData(missingDefaultMessage);
                        this._isWaitVisible(!1)
                    }
                    else {
                        var sampleSchema = functionInfo.schema;
                        this._isWaitVisible(!0);
                        this._setErrorMessageAndHideData("");
                        for (var functionArguments = [], requiredParametersIndex = 0; requiredParametersIndex < requiredParameters.length; requiredParametersIndex++)
                            parameter = requiredParameters[requiredParametersIndex],
                            functionArguments.push(parameter.tryItValue);
                        var optionalParameters = functionInfo.optionalParameters;
                        if (optionalParameters.length > 0) {
                            for (var optionalArgs = {}, optionalParameterIdx = 0; optionalParameterIdx < optionalParameters.length; optionalParameterIdx++)
                                parameter = optionalParameters[optionalParameterIdx],
                                parameter.tryItValue !== null && (optionalArgs[parameter.name] = parameter.tryItValue);
                            functionArguments.push(optionalArgs)
                        }
                        var timeoutRegisterer = function() {
                                this._timeoutDataTakingLong = setTimeout(function() {
                                    this._errorMessage(AppMagic.AuthoringStrings.RestConnectionRetrievingSampleTakingLong);
                                    this._timeoutDataTakingLong = null
                                }.bind(this), TimeoutMillisecondsRetrievingSampleTakingLong)
                            }.bind(this),
                            timeoutUnRegisterer = function() {
                                this._errorMessage("");
                                clearTimeout(this._timeoutDataTakingLong);
                                this._timeoutDataTakingLong = null
                            }.bind(this),
                            functionInner = this._runtime.getStubFunctionInner(this._serviceNamespace, selectedFunctionName, timeoutRegisterer, timeoutUnRegisterer);
                        this._setDataPromise = functionInner.apply(null, functionArguments).then(function(result) {
                            if (result.success) {
                                this._errorMessage("");
                                var tableData,
                                    tableSchema,
                                    schemaType = sampleSchema[AppMagic.Schema.KeyType],
                                    primitiveDataKeyName = " ";
                                this._blobUri !== null && (AppMagic.Utility.blobManager.release(this._blobUri), this._blobUri = null);
                                switch (schemaType) {
                                    case AppMagic.Schema.TypeBoolean:
                                    case AppMagic.Schema.TypeNumber:
                                    case AppMagic.Schema.TypeString:
                                        tableData = {};
                                        tableData[primitiveDataKeyName] = result.result;
                                        tableSchema = AppMagic.Schema.createSchemaForObjectFromPointer([AppMagic.Schema.createSchemaForSimple(schemaType, primitiveDataKeyName)]);
                                        break;
                                    case AppMagic.Schema.TypeImage:
                                    case AppMagic.Schema.TypeMedia:
                                        this._blobUri = result.result;
                                        tableData = {};
                                        tableData[primitiveDataKeyName] = this._blobUri;
                                        tableSchema = AppMagic.Schema.createSchemaForObjectFromPointer([AppMagic.Schema.createSchemaForSimple(schemaType, primitiveDataKeyName)]);
                                        break;
                                    case AppMagic.Schema.TypeObject:
                                    case AppMagic.Schema.TypeArray:
                                        tableData = result.result;
                                        tableSchema = sampleSchema;
                                        break;
                                    default:
                                        break
                                }
                                this._dataViewerViewModel.setData(selectedFunctionDisplayName, tableData, tableSchema, !1);
                                this._isDataVisible(!0)
                            }
                            else {
                                var errorMessage = AppMagic.AuthoringStrings.RestConnectionErrorRetrievingSample;
                                if (result.message !== null && typeof result.message != "undefined" && typeof result.message == "string") {
                                    var matches = result.message.match(/<.*>(.*?)<\/.*>/),
                                        errorMessageFormat = AppMagic.AuthoringStrings.RestConnectionErrorRetrievingSampleFormat;
                                    errorMessage = matches !== null ? Core.Utility.formatString(errorMessageFormat, errorMessage, matches[1]) : Core.Utility.formatString(errorMessageFormat, errorMessage, result.message)
                                }
                                this._setErrorMessageAndHideData(errorMessage)
                            }
                            this._isWaitVisible(!1);
                            this._setDataPromise = null;
                            clearTimeout(this._timeoutDataTakingLong);
                            this._timeoutDataTakingLong = null
                        }.bind(this)).then(null, function(error) {
                            Core.Utility.isCanceledError(error)
                        })
                    }
                }, isRemoveEnabled: {get: function() {
                        return this._isRemoveEnabled()
                    }}, onClickRemoveConnection: function() {
                    this._isRemoveEnabled(!1);
                    this._cancelAndNullifySetDataPromise();
                    this._dataConnectionsViewModel.removeImportedConnection(this._serviceNamespace)
                }, onClickRefreshConnection: function() {
                    this._cancelAndNullifySetDataPromise();
                    this._dataConnectionsViewModel.refreshImportedConnection(this._serviceNamespace)
                }, showConnectionMember: function(memberId) {
                    this.toggleExpansionAndRetrieveData()
                }, addMember: function(memberId){}, removeMembers: function(memberIds){}
        }, {
            splitFullPathIntoParts: function(fullPath) {
                var matches = fullPath.match(/^(.*)(\\.*)/);
                return matches === null ? {
                        filePath: "", filename: fullPath
                    } : {
                        filePath: matches[1], filename: matches[2]
                    }
            }, events: {
                    mspointerdownresizecolwidth: "mspointerdownresizecolwidth", restconnectiondatavisible: "restconnectiondatavisible"
                }
        });
    WinJS.Class.mix(ImportedRestConfigViewModel, WinJS.Utilities.eventMixin);
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {ImportedRestConfigViewModel: ImportedRestConfigViewModel})
})(Windows);