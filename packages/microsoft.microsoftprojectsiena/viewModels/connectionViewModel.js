//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(Platform) {"use strict";
    var DCs = AppMagic.Constants.DataConnections,
        ServiceConfig = AppMagic.Constants.Services.Config,
        ConnectionViewModel = WinJS.Class.derive(AppMagic.Utility.Disposable, function ConnectionViewModel_ctor(connectionManager, id, serviceId, dataConnectionsViewModel) {
            AppMagic.Utility.Disposable.call(this);
            this._connectionManager = connectionManager;
            this._id = id;
            this._serviceId = serviceId;
            this._dataConnectionsViewModel = dataConnectionsViewModel;
            this._sources = ko.observableArray([]);
            this._selectedSource = ko.observable(null);
            this.track("_dataViewerViewModel", new AppMagic.AuthoringTool.ObjectViewer.DataViewerViewModel);
            this._dataViewerViewModel.hideDepthBand = serviceId === AppMagic.Constants.DataConnections.Types.Excel;
            this._columnTypeConverterOptions = ko.observableArray();
            this._errorMessage = ko.observable("");
            this._isDataVisible = ko.observable(!1);
            this._isWaitVisible = ko.observable(!1);
            this._isExpanded = ko.observable(!1);
            this._totalFirstLevelRows = ko.observable(null);
            this._changeColumnTypePromiseQueue = new Core.Promise.PromiseQueue
        }, {
            _connectionManager: null, _id: null, _serviceId: null, _dataConnectionsViewModel: null, _sources: null, _selectedSource: null, _dataViewerViewModel: null, _columnTypeConverterOptions: null, _errorMessage: null, _isDataVisible: null, _isWaitVisible: null, _totalFirstLevelRows: null, _setDataPromise: null, _changeColumnTypePromiseQueue: null, _isExpanded: null, previewTitle: {get: function() {
                        var firstLevelTotalRowCount = this._totalFirstLevelRows();
                        return firstLevelTotalRowCount !== null ? firstLevelTotalRowCount <= AppMagic.AuthoringTool.ObjectViewer.ObjectViewerViewModel.NumberOfPreviewRows ? Core.Utility.formatString(AppMagic.AuthoringStrings.BackStagePreviewLessThanSixTitle, firstLevelTotalRowCount) : Core.Utility.formatString(AppMagic.AuthoringStrings.BackStagePreviewMoreThanFiveTitle, firstLevelTotalRowCount) : Core.Utility.formatString(AppMagic.AuthoringStrings.BackStagePreviewTitle)
                    }}, totalFirstLevelRows: {
                    get: function() {
                        return this._totalFirstLevelRows()
                    }, set: function(value) {
                            this._totalFirstLevelRows(value)
                        }
                }, groupType: {get: function() {
                        return this._serviceId === AppMagic.Constants.DataConnections.Types.LocalTable ? AppMagic.Authoring.BackStage.ConnectionType.LocalTableConnection : AppMagic.Authoring.BackStage.ConnectionType.DataSourceGroup
                    }}, id: {get: function() {
                        return this._id
                    }}, icon: {get: function() {
                        return DCs.Icons[this._serviceId]
                    }}, icon_monochrome: {get: function() {
                        return DCs.Icons_monochrome[this._serviceId]
                    }}, label: {get: function() {
                        return ConnectionViewModel.getLabel(this._serviceId, this._id).label
                    }}, tooltip: {get: function() {
                        return ConnectionViewModel.getLabel(this._serviceId, this._id).tooltip
                    }}, isExpanded: {
                    get: function() {
                        return this._isExpanded()
                    }, set: function(value) {
                            this._isExpanded(value)
                        }
                }, toggleExpansionAndRetrieveData: function() {
                    this._isExpanded() ? this._isExpanded(!1) : (this._isExpanded(!0), this._selectedSource() || (this.ensureDataSourceSelected(), this._setData(this._selectedSource())), this._dataConnectionsViewModel.notifySelectConnection(this))
                }, serviceId: {get: function() {
                        return this._serviceId
                    }}, sources: {get: function() {
                        return this._sources()
                    }}, selectedSource: {
                    get: function() {
                        return this._selectedSource()
                    }, set: function(value) {
                            this._selectedSource(value)
                        }
                }, supportsRefresh: {get: function() {
                        return this.serviceId === DCs.Types.Excel
                    }}, supportsLaunchInExcel: {get: function() {
                        return this.serviceId === DCs.Types.Excel && this._id !== AppMagic.AuthoringStrings.UnknownExcelName
                    }}, errorMessage: {get: function() {
                        return this._errorMessage()
                    }}, isErrorVisible: {get: function() {
                        return this.errorMessage !== ""
                    }}, isDataVisible: {get: function() {
                        return this._isDataVisible()
                    }}, isWaitVisible: {get: function() {
                        return this._isWaitVisible()
                    }}, dataViewerViewModel: {get: function() {
                        return this._dataViewerViewModel
                    }}, columnTypeConverterOptions: {get: function() {
                        return this._columnTypeConverterOptions()
                    }}, dispose: function() {
                    this._changeColumnTypePromiseQueue.cancelAll();
                    AppMagic.Utility.Disposable.prototype.dispose.call(this)
                }, getSourceName: function(item) {
                    return item.name
                }, addMember: function(memberId) {
                    return this.addDataSource(memberId)
                }, addDataSource: function(dataSourceName) {
                    var source = {name: dataSourceName};
                    this._sources.push(source)
                }, removeMembers: function(dataSourceNames) {
                    for (var i = 0, len = dataSourceNames.length; i < len; i++)
                        this.removeDataSource(dataSourceNames[i])
                }, removeDataSource: function(dataSourceName) {
                    for (var sources = this._sources(), i = 0, len = sources.length; i < len; i++)
                        if (sources[i].name === dataSourceName) {
                            this._sources.splice(i, 1);
                            return
                        }
                }, removeSelectedSource: function() {
                    this._cancelAnySetDataPromise();
                    var source = this._selectedSource(),
                        sources = this._sources();
                    if (sources.length > 1) {
                        if (sources[0] === source)
                            this.onClickDataSource(sources[1]);
                        else
                            this.onClickDataSource(sources[0]);
                        this._dataConnectionsViewModel.notifyRemoveDataSource(source.name)
                    }
                    else
                        this.removeDataSourceGroup()
                }, notifyShow: function() {
                    this._dataViewerViewModel.notifyShow()
                }, _cancelAnySetDataPromise: function() {
                    this._setDataPromise && (this._setDataPromise.cancel(), this._setDataPromise = null)
                }, removeDataSourceGroup: function() {
                    this._cancelAnySetDataPromise();
                    this._dataConnectionsViewModel.notifyRemoveConnection(this);
                    var sources = this._sources();
                    sources.forEach(function(source) {
                        this._dataConnectionsViewModel.notifyRemoveDataSource(source.name)
                    }.bind(this))
                }, ensureDataSourceSelected: function() {
                    var currentlySelectedSource = this._selectedSource();
                    currentlySelectedSource || this._selectedSource(this._sources()[0])
                }, refreshSource: function() {
                    this._isExpanded(!0);
                    this.ensureDataSourceSelected();
                    this._dataConnectionsViewModel.notifySelectConnection(this);
                    var source = this.selectedSource;
                    if (source) {
                        var ds = this._dataConnectionsViewModel.getStaticSource(source.name);
                        var token = ds.futureAccessToken;
                        token && Platform.Storage.AccessCache.StorageApplicationPermissions.futureAccessList.containsItem(token) ? Platform.Storage.AccessCache.StorageApplicationPermissions.futureAccessList.getFileAsync(token).then(function(file) {
                            this._dataConnectionsViewModel.notifyRefreshConnectionSource({
                                target: DCs.Types.Excel, options: {file: file}
                            })
                        }.bind(this), function() {
                            var title = Core.Utility.formatString(AppMagic.AuthoringStrings.RefreshErrorTitle, this._id),
                                content = Core.Utility.formatString(AppMagic.AuthoringStrings.RefreshErrorFileNotFoundText, this._id);
                            AppMagic.AuthoringTool.PlatformHelpers.showMessage(title, content)
                        }.bind(this)) : AppMagic.AuthoringTool.PlatformHelpers.showMessage(AppMagic.AuthoringStrings.RefreshText, AppMagic.AuthoringStrings.RefreshErrorNoToken)
                    }
                }, launchInExcel: function() {
                    Platform.Storage.StorageFile.getFileFromPathAsync(this._id).then(function(file) {
                        Platform.System.Launcher.launchFileAsync(file)
                    }, function(error) {
                        var filename = this.label,
                            title = Core.Utility.formatString(AppMagic.AuthoringStrings.ExcelWorkbookNotFound, filename),
                            content = Core.Utility.formatString(AppMagic.AuthoringStrings.LaunchExcelErrorText, filename, error.message);
                        AppMagic.AuthoringTool.PlatformHelpers.showMessage(title, content)
                    }.bind(this))
                }, populateColumnTypeConverterOptions: function(columnName) {
                    for (var ds = this._dataConnectionsViewModel.getStaticSource(this.selectedSource.name), getColTypeResult = ds.tryGetColumnType(columnName), curColumnType = getColTypeResult.type.kind, iter = ds.getPossibleTypes(columnName).first(), options = []; iter.hasCurrent; iter.moveNext())
                        options.push({
                            name: columnName, type: iter.current, locKind: AppMagic.AuthoringStrings["DType".concat(iter.current.kind)], isCurrentColumnType: curColumnType === iter.current.kind
                        });
                    this._columnTypeConverterOptions(options)
                }, onColumnTypeSelect: function(item) {
                    var functionThatReturnsAPromise = function() {
                            var columnName = item.name,
                                newColumnType = item.type,
                                ds = this._dataConnectionsViewModel.getStaticSource(this.selectedSource.name);
                            var getColumnTypeResult = ds.tryGetColumnType(item.name);
                            var oldData;
                            if (getColumnTypeResult.type.kind !== newColumnType.kind)
                                if (this._isWaitVisible(!0), ds.changeColumnType(item.name, item.type))
                                    return AppMagic.AuthoringTool.Runtime.getData(ds.name).then(function() {
                                            this._setData(this.selectedSource);
                                            this._isWaitVisible(!1)
                                        }.bind(this));
                                else
                                    this._isWaitVisible(!1);
                            return WinJS.Promise.wrap()
                        };
                    this._changeColumnTypePromiseQueue.pushJob(functionThatReturnsAPromise.bind(this)).then(null, function(){})
                }, refreshData: function() {
                    this.selectedSource && this._setData(this.selectedSource)
                }, showColumnMenu: function(anchor) {
                    this.dispatchEvent(ServiceConfig.events.showcolumnmenu, {anchor: anchor})
                }, _setData: function(source) {
                    this._totalFirstLevelRows(null);
                    this._isWaitVisible(!0);
                    this._isDataVisible(!1);
                    this._errorMessage("");
                    this._cancelAnySetDataPromise();
                    this._setDataPromise = AppMagic.AuthoringTool.Runtime.getData(source.name).then(function(ds) {
                        return this._serviceId !== AppMagic.Constants.DataConnections.Types.REST && this._totalFirstLevelRows(ds.length), new WinJS.Promise(function(onComplete) {
                                setImmediate(function() {
                                    onComplete(ds)
                                })
                            })
                    }.bind(this)).then(function(ds) {
                        if (AppMagic.AuthoringTool.Runtime.dataSourceExists(source.name) && !AppMagic.AuthoringTool.Runtime.isDataSourceCollection(source.name)) {
                            var hasError = AppMagic.AuthoringTool.Runtime.hasError(source.name);
                            if (hasError) {
                                var errorMessage = AppMagic.AuthoringTool.Runtime.getDataSourceErrorMessage(source.name);
                                errorMessage = errorMessage || AppMagic.AuthoringStrings.DataSourcesPageUnknownError;
                                this._errorMessage(errorMessage)
                            }
                            else {
                                var meta = ds._meta;
                                if (meta.pluginType === DCs.Types.LocalTable) {
                                    var provider = new AppMagic.AuthoringTool.ObjectViewer.ServiceObjectViewerDataSource(meta.dataSourceProvider);
                                    this._dataViewerViewModel.setDataSourceProvider(source.name, provider, !0)
                                }
                                else {
                                    var schema,
                                        isConvertible;
                                    meta.pluginType === DCs.Types.Excel ? (isConvertible = !0, schema = this._dataConnectionsViewModel.getStaticSchema(source.name)) : (isConvertible = !1, schema = meta.schema);
                                    this._dataViewerViewModel.setData(source.name, ds, schema, isConvertible)
                                }
                                this._isDataVisible(!0)
                            }
                        }
                        this._isWaitVisible(!1);
                        this._setDataPromise = null
                    }.bind(this))
                }, showConnectionMember: function(dataSourceName) {
                    for (var dataSourceItems = this._sources(), i = 0, len = dataSourceItems.length; i < len; i++) {
                        var dataSourceItem = dataSourceItems[i],
                            dsName = dataSourceItem.name;
                        if (dsName === dataSourceName) {
                            this.onClickDataSource(dataSourceItem);
                            this._isExpanded(!0);
                            return
                        }
                    }
                }, onClickDataSource: function(dataSourceItem) {
                    this._selectedSource(dataSourceItem);
                    this._setData(dataSourceItem);
                    this._dataConnectionsViewModel.notifySelectConnection(this)
                }
        }, {
            events: {dataSourceSelected: "dataSourceSelected"}, getLabel: function(serviceId, id) {
                    if (serviceId === "excel") {
                        var index = id.lastIndexOf("\\");
                        if (index >= 0)
                            return {
                                    label: id.substr(index + 1), tooltip: id
                                }
                    }
                    return {
                            label: id, tooltip: id
                        }
                }
        });
    WinJS.Class.mix(ConnectionViewModel, WinJS.Utilities.eventMixin);
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {ConnectionViewModel: ConnectionViewModel})
})(Windows);