//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var ServiceConfig = AppMagic.Constants.Services.Config,
        ExcelConfigViewModel = WinJS.Class.define(function ExcelConfigViewModel_ctor(connectionManager, doneImportingFn) {
            this._connectionManager = connectionManager;
            this._doneImportingFn = doneImportingFn;
            this._tableSelector = new AppMagic.AuthoringTool.ViewModels.TableSelectorViewModel;
            this._tableSelector.addEventListener(AppMagic.AuthoringTool.ViewModels.TableSelectorViewModel.events.import, this._addDataSource.bind(this));
            this._file = ko.observable(null);
            this._errorMessages = ko.observableArray([]);
            this._isImportEnabled = !0
        }, {
            _connectionManager: null, _tableSelector: null, _file: null, _errorMessages: null, _isImportEnabled: !0, reset: function(options) {
                    if (options && options.file)
                        return this._file(options.file), this._processExcelFileAsync(options.file).then(function(processingStatus) {
                                if ((!processingStatus.successful || processingStatus.partialSuccess) && options.showErrorOnProcessFail) {
                                    var errorMessageTitle = Core.Utility.formatString(AppMagic.AuthoringStrings.ImportErrorTitle, options.file.name),
                                        errorMessageContent = Core.Utility.formatString(AppMagic.AuthoringStrings.ImportErrorText, options.file.name, processingStatus.message);
                                    AppMagic.AuthoringTool.PlatformHelpers.showMessage(errorMessageTitle, errorMessageContent)
                                }
                                this._tableSelector.visible = !0;
                                this._errorMessages.removeAll()
                            }.bind(this));
                    else
                        this._file(null),
                        this._tableSelector.visible = !1;
                    return this._errorMessages.removeAll(), WinJS.Promise.wrap(null)
                }, notifyBeforeSelectAsync: function(options) {
                    return options.file ? WinJS.Promise.wrap(null) : this.browseFile()
                }, file: {get: function() {
                        return this._file()
                    }}, fileName: {get: function() {
                        var file = this.file;
                        return file ? file.name : ""
                    }}, filePath: {get: function() {
                        var file = this.file;
                        return file ? file.path : null
                    }}, tableSelector: {get: function() {
                        return this._tableSelector
                    }}, tableSelectorVisible: {get: function() {
                        return this.file !== null
                    }}, errorMessages: {get: function() {
                        return this._errorMessages()
                    }}, isErrorVisible: {get: function() {
                        return this.errorMessages.length !== 0
                    }}, browseFile: function() {
                    if (AppMagic.AuthoringTool.Utility.canShowPicker()) {
                        var picker = new Windows.Storage.Pickers.FileOpenPicker;
                        return picker.fileTypeFilter.append(AppMagic.AuthoringTool.Constants.DocumentImportFormat), picker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.documentsLibrary, picker.pickSingleFileAsync().then(function(file) {
                                    return file ? (this._file(file), this._processExcelFileAsync(file)) : WinJS.Promise.wrapError()
                                }.bind(this)).then(function(fileProcessingStatus) {
                                    var fileProcessingSuccessful = fileProcessingStatus.successful;
                                    if (!fileProcessingStatus.successful || fileProcessingStatus.partialSuccess) {
                                        var errorMessageTitle = Core.Utility.formatString(AppMagic.AuthoringStrings.ImportErrorTitle, this.file.name),
                                            errorMessageContent = Core.Utility.formatString(AppMagic.AuthoringStrings.ImportErrorText, this.file.name, fileProcessingStatus.message);
                                        AppMagic.AuthoringTool.PlatformHelpers.showMessage(errorMessageTitle, errorMessageContent, !1, this._showAddDataSourcePane.bind(this, this.file, fileProcessingSuccessful));
                                        this._resetFileInfo()
                                    }
                                    return fileProcessingSuccessful
                                }.bind(this))
                    }
                }, _showAddDataSourcePane: function(file, fileProcessingSuccessful) {
                    fileProcessingSuccessful && this.dispatchEvent(ServiceConfig.events.navigateadd, {
                        target: "excel", options: {
                                file: file, showErrorOnProcessFail: fileProcessingSuccessful
                            }
                    })
                }, _addDataSource: function(evt) {
                    if (this._isImportEnabled) {
                        var tables = evt.detail;
                        if (this._validateProperties(tables)) {
                            var groupId = this._getGroupId();
                            return this._isImportEnabled = !1, this._connectionManager.importStatic("excel", groupId, this.file, tables).then(function(result) {
                                    result.importSuccessful || this._resetFileInfo();
                                    var datasources = AppMagic.Utility.enumerableToArray(result.tableNameToDatasourceNameMap);
                                    this._doneImportingFn(datasources, result.importSuccessful);
                                    this._isImportEnabled = !0
                                }.bind(this), function(error) {
                                    this._isImportEnabled = !0
                                }.bind(this))
                        }
                    }
                }, _resetFileInfo: function() {
                    this._file(null);
                    this._tableSelector.setTables({})
                }, _validateProperties: function(tables) {
                    return this._errorMessages.removeAll(), this.file === null && this._errorMessages.push(AppMagic.AuthoringStrings.ExcelErrorNoFileSeleted), tables && tables.length !== 0 || this._errorMessages.push(AppMagic.AuthoringStrings.ExcelErrorNoSelectedTables), this._errorMessages().length === 0
                }, _processExcelFileAsync: function(file) {
                    var timeout = AppMagic.AuthoringTool.Constants.DataImportTimeout;
                    return Microsoft.AppMagic.Authoring.Importers.StaticDataImport.getExcelTables(file, timeout).then(function(result) {
                            var processingStatus = {successful: !0};
                            if (result.result === Microsoft.AppMagic.Authoring.DataImportResult.partialSuccess && (processingStatus.successful = !0, processingStatus.partialSuccess = !0, processingStatus.message = result.error.message), result.result === Microsoft.AppMagic.Authoring.DataImportResult.failure)
                                return processingStatus.successful = !1, processingStatus.message = result.error.message, processingStatus;
                            for (var iter = result.tableNames.first(), tables = {}, table; iter.hasCurrent; )
                                table = iter.current,
                                iter.moveNext(),
                                tables[table] = !0;
                            var group = this._getGroup();
                            return group && group.sources.forEach(function(source) {
                                    typeof tables[source.tableName] != "undefined" && (tables[source.tableName] = !0)
                                }), this._tableSelector.setTables(tables), processingStatus
                        }.bind(this))
                }, _getGroupId: function() {
                    return this.filePath
                }, _getGroup: function() {
                    var groupId = this._getGroupId();
                    return this._connectionManager.getGroup("excel", groupId)
                }
        }, {});
    WinJS.Class.mix(ExcelConfigViewModel, WinJS.Utilities.eventMixin);
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {ExcelConfigViewModel: ExcelConfigViewModel})
})();