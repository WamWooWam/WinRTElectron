//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(Platform) {"use strict";
    var OpenAjaxPropertyNames = AppMagic.AuthoringTool.OpenAjaxPropertyNames,
        ErrorSchema = "e",
        ImportExportErrors = AppMagic.Constants.ImportExportErrors,
        Utility = AppMagic.Utility,
        Impex = WinJS.Class.define(function Impex_Ctor(){}, {
            onImpexClicked: function(controlContext) {
                controlContext.exportMode && controlContext.properties.Data() === null ? this._showImpexError(this._createErrorResult(AppMagic.Strings.ImpexExportErrorTitle, AppMagic.Strings.ExportNullDataError)) : controlContext.impexActive || (controlContext.impexActive = !0, this._pickFile(controlContext).then(this._doImpex.bind(this, controlContext), this._doImpexError.bind(this, controlContext)).done(function() {
                    controlContext.impexActive = !1
                }))
            }, _pickFile: function(controlContext) {
                    var data = controlContext.properties.Data();
                    var picker = controlContext.exportMode ? new Platform.Storage.Pickers.FileSavePicker : new Platform.Storage.Pickers.FileOpenPicker;
                    if (picker.suggestedStartLocation = Platform.Storage.Pickers.PickerLocationId.documentsLibrary, controlContext.exportMode) {
                        picker.fileTypeChoices.insert("ZIP", [".zip"]);
                        var defaultName = "data";
                        data instanceof Array && (defaultName = AppMagic.AuthoringTool.Runtime.getCollectionName(data) || defaultName);
                        picker.suggestedFileName = defaultName
                    }
                    else
                        picker.viewMode = Platform.Storage.Pickers.PickerViewMode.list,
                        picker.fileTypeFilter.clear(),
                        picker.fileTypeFilter.append(".zip");
                    return controlContext.exportMode ? picker.pickSaveFileAsync() : picker.pickSingleFileAsync()
                }, _doImpexError: function(controlContext, error) {
                    controlContext.exportMode || this.OpenAjax.controlManager.changeOutputType(this._thisControlId(), OpenAjaxPropertyNames.Data, AppMagic.Constants.Services.EmptyTableSchemaType);
                    this.OpenAjax.setPropertyValue("Error", error.toString(), this.bindingContext)
                }, _doImpexSuccess: function(controlContext, impexResult) {
                    var promise = this._showImpexError(impexResult);
                    return controlContext.exportMode || impexResult.result || this.OpenAjax.controlManager.changeOutputType(this._thisControlId(), OpenAjaxPropertyNames.Data, AppMagic.Constants.Services.EmptyTableSchemaType), promise.then(function() {
                            this.OpenAjax.setPropertyValue("Error", "", controlContext.bindingContext);
                            controlContext.behaviors.OnSelect()
                        }.bind(this))
                }, _showImpexError: function(impexResult) {
                    if (!impexResult.result) {
                        var md = new AppMagic.Popups.MessageDialog(impexResult.error.errorMessage, impexResult.error.errorTitle);
                        return md.showAsync()
                    }
                    return WinJS.Promise.as(!0)
                }, _doImpex: function(controlContext, file) {
                    file && (Platform.Storage.AccessCache.StorageApplicationPermissions.futureAccessList.add(file), (controlContext.exportMode ? this._doExport(file, controlContext) : this._doImport(file, controlContext)).then(this._doImpexSuccess.bind(this, controlContext), function(error) {
                        var errorTitle,
                            errorMessage;
                        return controlContext.exportMode ? (errorTitle = AppMagic.Strings.ImpexExportErrorTitle, errorMessage = AppMagic.Strings.ExportUnknownError) : (errorTitle = AppMagic.Strings.ImpexImportErrorTitle, errorMessage = AppMagic.Strings.ImportUnkownError), this._showImpexError(this._createErrorResult(errorTitle, errorMessage)).then(this._doImpexError.bind(this, error))
                    }.bind(this)))
                }, _doExport: function(file, controlContext) {
                    var data = controlContext.properties.Data();
                    if (data === null)
                        return WinJS.Promise.as(this._createErrorResult(AppMagic.Strings.ImpexExportErrorTitle, AppMagic.Strings.ExportNullDataError));
                    var schema = this.OpenAjax.controlManager.getInputDataTypeJSON(this._thisControlId(), OpenAjaxPropertyNames.Data);
                    return AppMagic.AuthoringTool.Runtime.createZip(data, schema).then(function(result) {
                            if (result.error)
                                return WinJS.Promise.as(this._createErrorResult(AppMagic.Strings.ImpexExportErrorTitle, AppMagic.Strings[result.error]));
                            var buffer = Platform.Security.Cryptography.CryptographicBuffer.decodeFromBase64String(result.base64String);
                            Platform.Storage.CachedFileManager.deferUpdates(file);
                            var completeUpdates = function() {
                                    return Platform.Storage.CachedFileManager.completeUpdatesAsync(file)
                                };
                            return Platform.Storage.FileIO.writeBufferAsync(file, buffer).then(completeUpdates.bind(this), completeUpdates.bind(this)).then(function(updateStatus) {
                                    return updateStatus === Platform.Storage.Provider.FileUpdateStatus.complete ? WinJS.Promise.as(this._createSuccessResult()) : WinJS.Promise.as(this._createErrorResult(AppMagic.Strings.ImpexExportErrorTitle, AppMagic.Strings.ExportUpdateError))
                                }.bind(this))
                        }.bind(this), function(err) {
                            return typeof err != "string" && (err = AppMagic.Strings.ExportUnknownError), WinJS.Promise.as(this._createErrorResult(AppMagic.Strings.ImpexExportErrorTitle, err))
                        }.bind(this))
                }, _doImport: function(file, controlContext) {
                    return this.OpenAjax.setPropertyValue(OpenAjaxPropertyNames.Data, null, controlContext.bindingContext), Platform.Storage.FileIO.readBufferAsync(file).then(function(buffer) {
                            var impexId = this._thisControlId();
                            return AppMagic.AuthoringTool.Runtime.loadZip(buffer, impexId).then(function(result) {
                                    if (result === null || typeof result != "object")
                                        return WinJS.Promise.as(this._createErrorResult(AppMagic.Strings.ImpexImportErrorTitle, AppMagic.Strings.ImportUnkownError));
                                    if (result.error)
                                        return WinJS.Promise.as(this._createErrorResult(AppMagic.Strings.ImpexImportErrorTitle, AppMagic.Strings[result.error]));
                                    var data = result.data,
                                        schema = result.schema;
                                    if (data === null || typeof data == "undefined" || schema === null || typeof schema != "string" || schema === "")
                                        return WinJS.Promise.as(this._createErrorResult(AppMagic.Strings.ImpexImportErrorTitle, AppMagic.Strings.ImportInvalidXMLError));
                                    if (schema === ErrorSchema) {
                                        var schemaArray = Utility.flattenSchema(Utility.createInferredSchemaFromArray(data));
                                        schema = Utility.stringizeSchema(schemaArray, !0)
                                    }
                                    return AppMagic.AuthoringTool.Runtime.assignTableID(data), result.locMap ? this.OpenAjax.controlManager.changeOutputTypeUsingDocType(this._thisControlId(), OpenAjaxPropertyNames.Data, result.locMap, schema) : this.OpenAjax.controlManager.changeOutputType(this._thisControlId(), OpenAjaxPropertyNames.Data, schema), this.OpenAjax.setPropertyValue(OpenAjaxPropertyNames.Data, data, controlContext.bindingContext), WinJS.Promise.as(this._createSuccessResult())
                                }.bind(this), function() {
                                    return WinJS.Promise.as(this._createErrorResult(AppMagic.Strings.ImpexImportErrorTitle, AppMagic.Strings.ImportUnkownError))
                                }.bind(this))
                        }.bind(this), function() {
                            return WinJS.Promise.as(this._createErrorResult(AppMagic.Strings.ImpexImportErrorTitle, AppMagic.Strings.ImportUnkownError))
                        }.bind(this))
                }, _thisControlId: function() {
                    return this.OpenAjax.getId()
                }, _createErrorResult: function(errorTitle, errorMessage) {
                    return {
                            result: !1, error: {
                                    errorTitle: errorTitle, errorMessage: errorMessage
                                }
                        }
                }, _createSuccessResult: function() {
                    return {result: !0}
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Controls", {Impex: Impex})
})(Windows);