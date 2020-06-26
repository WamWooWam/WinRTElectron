//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var ServiceConfig = AppMagic.Constants.Services.Config,
        Setting = WinJS.Class.define(function Setting_ctor(title, pageUrl, viewModel) {
            this._title = title;
            this._pageUrl = pageUrl;
            this._viewModel = viewModel
        }, {
            _title: null, _pageUrl: null, _viewModel: null, pageUrl: {get: function() {
                        return this._pageUrl
                    }}, title: {get: function() {
                        return this._title
                    }}, viewModel: {get: function() {
                        return this._viewModel
                    }}
        }),
        BackStageViewModel = WinJS.Class.derive(AppMagic.Utility.Disposable, function BackStageViewModel_ctor(doc, rt, services, undoManager, ruleValueFactory, documentLayoutManager, shellVM, checkAndDownloadInstaller) {
            AppMagic.Utility.Disposable.call(this);
            this._document = doc;
            this._documentLayoutManager = documentLayoutManager;
            this._runtime = rt;
            this._services = services;
            this._undoManager = undoManager;
            this._ruleValueFactory = ruleValueFactory;
            this._shellVM = shellVM;
            this._current = ko.observable(new Setting("", ""));
            this._visible = ko.observable(!1);
            this._createSettings(checkAndDownloadInstaller);
            this._backStageShortcuts = new AppMagic.AuthoringTool.Shortcuts.BackStageShortcutProvider;
            this._macroBackStageVisible = ko.observable(!1)
        }, {
            _document: null, _documentLayoutManager: null, _runtime: null, _current: null, _previous: null, _next: null, _settings: null, _visible: null, _services: null, _undoManager: null, _ruleValueFactory: null, _embeddedMediaViewModel: null, _dataCollectionsViewModel: null, _dataConnectionsViewModel: null, _macroBackstageViewModel: null, _macroBackStageVisible: null, _publishViewModel: null, _backStageShortcuts: null, _shellVM: null, current: {get: function() {
                        return this._current()
                    }}, previous: {get: function() {
                        return this._previous
                    }}, next: {get: function() {
                        return this._next
                    }}, backStageShortcuts: {get: function() {
                        return this._backStageShortcuts
                    }}, _createSettings: function(checkAndDownloadInstaller) {
                    var ViewModels = AppMagic.AuthoringTool.ViewModels;
                    this.track("_embeddedMediaViewModel", new ViewModels.EmbeddedMediaViewModel(this._document));
                    this.track("_dataCollectionsViewModel", new ViewModels.DataCollectionsViewModel(this._document, this._runtime));
                    this.track("_dataConnectionsViewModel", new ViewModels.DataConnectionsViewModel(this._document, this._runtime, this._services));
                    this.track("_macroBackstageViewModel", new ViewModels.MacroBackstageViewModel(this._document, this._undoManager));
                    this.track("_publishViewModel", new AppMagic.AuthoringTool.ViewModels.PublishViewModel(this._document, this._ruleValueFactory, checkAndDownloadInstaller, this._documentLayoutManager));
                    this.track("_appSettingsViewModel", new AppMagic.AuthoringTool.ViewModels.AppSettingsViewModel(this._documentLayoutManager, this._shellVM));
                    this._settings = [new Setting(AppMagic.AuthoringStrings.DataSources, "/backStages/data/dataPage.html", this._dataConnectionsViewModel), new Setting(AppMagic.AuthoringStrings.EmbeddedMedia, "/backStages/embeddedMedia/embeddedMediaPage.html", this._embeddedMediaViewModel), new Setting(AppMagic.AuthoringStrings.DataCollections, "/backStages/dataCollections/dataCollectionsPage.html", this._dataCollectionsViewModel), new Setting(AppMagic.AuthoringStrings.MacroBackstage, "/backStages/macro/macroPage.html", this._macroBackstageViewModel), new Setting(AppMagic.AuthoringStrings.AppSettings, "/backStages/appSettings/appSettingsPage.html", this._appSettingsViewModel), new Setting(AppMagic.AuthoringStrings.Publish, "/backStages/publish/publishPage.html", this._publishViewModel)]
                }, dataConnectionsViewModel: {get: function() {
                        for (var i = 0, len = this._settings.length; i < len; i++) {
                            var setting = this._settings[i];
                            if (setting.title === AppMagic.AuthoringStrings.DataSources) {
                                var dataConnectionsViewModel = setting.viewModel;
                                break
                            }
                        }
                        return dataConnectionsViewModel
                    }}, navigateToConnectToConnector: function(connectorId, onConnectedCallback) {
                    var closeBackstageAfterConnected = !this.visible;
                    this.selectSettingByName(AppMagic.AuthoringStrings.DataSources);
                    this._dataConnectionsViewModel.notifySelectConnection(null);
                    this._visible(!0);
                    for (var connectionType = null, i = 0, len = this._dataConnectionsViewModel.connectionTypes.length; i < len; i++)
                        if (connectionType = this._dataConnectionsViewModel.connectionTypes[i], connectionType.id === connectorId)
                            break;
                    var onAfterConnect = function() {
                            closeBackstageAfterConnected && (this._dataConnectionsViewModel.notifyClickBack(), this.visible = !1);
                            onConnectedCallback !== null && onConnectedCallback()
                        }.bind(this);
                    this._dataConnectionsViewModel.setConnectionTypeAsync(connectionType, null, onAfterConnect)
                }, navigateToServiceConfig: function(serviceNamespace) {
                    this.selectSettingByName(AppMagic.AuthoringStrings.DataSources);
                    this._visible(!0);
                    var connection = this._dataConnectionsViewModel.getRestConnectionByName(serviceNamespace);
                    connection.isExpanded = !0;
                    connection.onClickKeys()
                }, onClickSetting: function(settingName) {
                    this._current().viewModel && this._current().viewModel.notifyClickBack && this._current().viewModel.notifyClickBack();
                    this._macroBackStageVisible(AppMagic.context.documentViewModel.hasMacros);
                    this.selectSettingByName(settingName)
                }, selectSettingByName: function(settingName) {
                    for (var i = 0, len = this._settings.length; i < len; i++) {
                        var setting = this._settings[i];
                        if (setting.title === settingName) {
                            if (this._current(setting), this._settings[i - 1]) {
                                var prev = this._settings[i - 1];
                                this._previous = prev
                            }
                            if (this._settings[i + 1]) {
                                var next = this._settings[i + 1];
                                this._next = next
                            }
                            setting.viewModel.reload();
                            return
                        }
                    }
                }, notifyEnterComplete: function() {
                    var viewModel = this._current().viewModel;
                    viewModel.notifyEnterComplete && viewModel.notifyEnterComplete()
                }, visible: {
                    get: function() {
                        return this._visible()
                    }, set: function(value) {
                            this._visible(value)
                        }
                }, handleBackButtonClick: function() {
                    this._current().viewModel.notifyClickBack() && this._visible(!1)
                }, connectToServiceByConnectorId: function(connectorId, onConnectedCallback) {
                    this.dataConnectionsViewModel.doesConnectorRequireUserInteractionToImport(connectorId) ? this.navigateToConnectToConnector(connectorId, onConnectedCallback) : this.dataConnectionsViewModel.connectToRestServiceByConnectorIdAsync(connectorId, !1).then(function(connectResult) {
                        connectResult && onConnectedCallback !== null && onConnectedCallback()
                    })
                }, getServiceNamespaceForConnectorId: function(connectorId) {
                    for (var iter = this._document.getServices().first(); iter.hasCurrent; iter.moveNext()) {
                        var service = iter.current;
                        if (service.connectorId === connectorId)
                            return service.serviceNamespace
                    }
                    return null
                }, macroBackStageVisible: {
                    get: function() {
                        return this._macroBackStageVisible()
                    }, set: function(value) {
                            this._macroBackStageVisible(value)
                        }
                }
        });
    WinJS.Class.mix(BackStageViewModel, WinJS.Utilities.eventMixin);
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {BackStageViewModel: BackStageViewModel})
})();