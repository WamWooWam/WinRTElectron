//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(Platform) {"use strict";
    var EntityType = Microsoft.AppMagic.Authoring.EntityType,
        util = AppMagic.Utility,
        DocumentViewModel = WinJS.Class.derive(AppMagic.Utility.Disposable, function DocumentViewModel_ctor(doc, shell) {
            Contracts.checkValue(doc);
            Contracts.checkValue(shell);
            AppMagic.Utility.Disposable.call(this);
            this._canvasCreatedTestHook = new Core.Promise.createCompletablePromise;
            this._loadedPromise = new WinJS.Promise(function(complete) {
                this._loadedComplete = complete
            }.bind(this));
            this._loadedPromise.then(function() {
                this._entityManager.initGroups()
            }.bind(this)).then(this.detectConnectorsWithRevokedKeys.bind(this));
            this.track("_document", doc);
            this._isPreview = ko.observable(!1);
            this._shell = shell;
            this.track("_documentLayoutManager", AppMagic.DocumentLayout.instance.setDocument(doc));
            this.track("_zoom", new AppMagic.AuthoringTool.ViewModels.ZoomViewModel(this._documentLayoutManager));
            this.track("_requirementsManager", new AppMagic.Controls.AuthoringRequirementsManager);
            this.track("_controlManager", new AppMagic.Controls.AuthoringControlManager(this, doc, this._requirementsManager));
            this.track("_ruleValueFactory", new AppMagic.AuthoringTool.ViewModels.RuleValueFactory(this._documentLayoutManager));
            this.track("_ruleFactory", new AppMagic.AuthoringTool.ViewModels.RuleFactory(doc.intellisense, this._ruleValueFactory));
            this.track("_entityManager", new AppMagic.AuthoringTool.ViewModels.EntityManager(doc, this._controlManager, this._ruleFactory, this._zoom, this._loadedPromise, this._documentLayoutManager, this._shell));
            this.track("_eventTracker", new AppMagic.Utility.EventTracker);
            this._eventTracker.add(this._entityManager, AppMagic.AuthoringTool.ViewModels.EntityManager.events.screenadded, this._handleScreenAdded, this);
            this._eventTracker.add(this._entityManager, AppMagic.AuthoringTool.ViewModels.EntityManager.events.visualremoved, this._handleVisualRemoved, this);
            this._currentScreen = ko.observable(null);
            this.screens.length > 0 && this._currentScreen(this.screens[0]);
            this._isInitialized = !1;
            this.track("_entityNameFactory", new AppMagic.AuthoringTool.ViewModels.EntityNameFactory(this._document));
            this.track("_selectionManager", new AppMagic.AuthoringTool.ViewModels.SelectionManager(this._entityManager, this._currentScreen, this._isPreview));
            this.track("_undoManager", new AppMagic.AuthoringTool.ViewModels.UndoManager(this._document, this._document.undoManager, this._selectionManager, this._entityManager));
            this.track("_clipboardManager", new AppMagic.AuthoringTool.ViewModels.ClipboardManager(this._document, this._document.clipboardManager, this._selectionManager, this._entityManager, this._controlManager, this._entityNameFactory, this._undoManager));
            this.track("_canvasManager", new AppMagic.AuthoringTool.ViewModels.CanvasManager(this._entityManager, this._selectionManager, this._isPreview, this._zoom, this._undoManager, this._clipboardManager, this._documentLayoutManager));
            this._eventTracker.add(this._selectionManager, "screenchanged", this._handleScreenChanged, this);
            this.track("_smallLayout", ko.computed(function() {
                return this._shell.smallLayout
            }, this));
            this.track("_rulePanelsInfo", new AppMagic.AuthoringTool.ViewModels.RulePanelsInfo(doc, this._selectionManager, this._ruleFactory));
            this.track("_appBar", new AppMagic.AuthoringTool.ViewModels.AppBarViewModel(doc, this._entityManager, this._selectionManager, this._controlManager));
            this.track("_backStage", new AppMagic.AuthoringTool.ViewModels.BackStageViewModel(doc, AppMagic.AuthoringTool.Runtime, AppMagic.Services, this._undoManager, this._ruleValueFactory, this._documentLayoutManager, this._shell));
            this.track("_controlGallery", new AppMagic.AuthoringTool.ViewModels.ControlGalleryViewModel(doc, this._entityManager, this._controlManager, this._entityNameFactory, this._selectionManager, this._canvasManager, this._undoManager, this._requirementsManager, this._backStage));
            this.track("_configuration", new AppMagic.AuthoringTool.ViewModels.ConfigurationViewModel(this._selectionManager, this._smallLayout, this._controlGallery, this._rulePanelsInfo));
            this.track("backStageVisible", ko.computed(function() {
                return this._backStage.visible
            }, this));
            this.trackAnonymous(this.backStageVisible.subscribe(function(value) {
                value || this.focusToScreenCanvas()
            }, this));
            this.track("_commandBar", new AppMagic.AuthoringTool.ViewModels.CommandBarViewModel(doc, this._entityManager, this._selectionManager, this._canvasManager, this._configuration, this._clipboardManager, this._zoom, this._isPreview, this._backStage.dataConnectionsViewModel, this._loadedPromise, this._rulePanelsInfo));
            this.track("_visualDropDown", new AppMagic.AuthoringTool.ViewModels.EntityDropDownViewModel(this._document, this._selectionManager, this._canvasManager, this._entityManager, !1, this._isPreview));
            this.track("_screenDropDown", new AppMagic.AuthoringTool.ViewModels.EntityDropDownViewModel(this._document, this._selectionManager, this._canvasManager, this._entityManager, !0, this._isPreview));
            this.track("_blankPage", new AppMagic.AuthoringTool.ViewModels.BlankPageViewModel(shell, this._isPreview, this._entityManager, this._selectionManager, this._canvasManager, this._screenDropDown, this._visualDropDown, this._documentLayoutManager));
            this.track("_restErrorPanel", new AppMagic.AuthoringTool.ViewModels.RestErrorPanelViewModel);
            this.track("_ruleUpdateManager", new AppMagic.Entities.RuleUpdateManager(this._entityManager));
            AppMagic.Entities.DefaultRuleUpdaters.addUpdaters(this._ruleUpdateManager)
        }, {
            _document: null, _documentLayoutManager: null, _controlManager: null, _ruleFactory: null, _ruleValueFactory: null, _entityManager: null, _entityNameFactry: null, _currentScreen: null, _screenTransitionType: null, _shell: null, _eventTracker: null, _isPreview: null, _loadedPromise: null, _loadedComplete: null, _selectionManager: null, _canvasManager: null, _undoManager: null, _zoom: null, _appBar: null, _blankPage: null, _canvas: null, _commandBar: null, _configuration: null, _controlGallery: null, _clipboardManager: null, _visualDropDown: null, _screenDropDown: null, _restErrorPanel: null, _isInitialized: null, _canvasCreatedTestHook: null, initialize: function() {
                    for (var promises = [], it = this._document.dataSources.first(); it.hasCurrent; it.moveNext()) {
                        var dataSource = it.current;
                        switch (dataSource.kind) {
                            case Microsoft.AppMagic.Authoring.DataSourceKind.static:
                                promises.push(AppMagic.AuthoringTool.Runtime._addStaticDataSourceAsync(dataSource.name, dataSource, !0));
                                break;
                            case Microsoft.AppMagic.Authoring.DataSourceKind.collection:
                                AppMagic.AuthoringTool.Runtime._addCollection(dataSource.name);
                                break;
                            case Microsoft.AppMagic.Authoring.DataSourceKind.service:
                                promises.push(AppMagic.AuthoringTool.Runtime._addServiceDataSource(dataSource.name));
                                break;
                            case Microsoft.AppMagic.Authoring.DataSourceKind.resource:
                                AppMagic.AuthoringTool.Runtime._addResource(dataSource.name, dataSource.rootPath.absoluteUri);
                                break;
                            case Microsoft.AppMagic.Authoring.DataSourceKind.dynamic:
                                AppMagic.AuthoringTool.Runtime._addDynamicDataSource(dataSource.name);
                                break;
                            default:
                                Contracts.check(!1, "Unrecognized data source kind!");
                                break
                        }
                    }
                    for (var i = 0, len = this.screens.length; i < len; i++)
                        promises.push(this.screens[i].create());
                    return promises.push(this._canvasManager.initialize()), WinJS.Promise.join(promises).then(function() {
                            return this._isInitialized = !0, !0
                        }.bind(this))
                }, isInitialized: {get: function() {
                        return this._isInitialized
                    }}, rulePanelsInfo: {get: function() {
                        return this._rulePanelsInfo
                    }}, hasChanges: {get: function() {
                        return this._document.hasUnsavedChanges
                    }}, hasMacros: {get: function() {
                        return this._document.getMacroNames().first().hasCurrent
                    }}, detectConnectorsWithRevokedKeys: function() {
                    for (var servicesIter = this._document.getServices().first(); servicesIter.hasCurrent; servicesIter.moveNext()) {
                        var serviceInfo = servicesIter.current;
                        if (serviceInfo.hasConfig && serviceInfo.hasDefaultKeys) {
                            var areKeysRevoked = Microsoft.AppMagic.Authoring.Importers.ServiceImporterUtils.areConnectorDefaultTemplateValuesRevoked(serviceInfo.connectorId, serviceInfo.connectorVersionString);
                            if (areKeysRevoked) {
                                this._backStage.navigateToServiceConfig(serviceInfo.serviceNamespace);
                                return
                            }
                        }
                    }
                }, processAfterLoad: function() {
                    this.refreshRules();
                    this.processAfterNew()
                }, processAfterNew: function() {
                    this._undoManager.enable();
                    this._loadedComplete()
                }, containsVisualByName: function(visualName) {
                    return Contracts.checkNonEmpty(visualName), this._entityManager.containsVisualByName(visualName)
                }, focusToScreenCanvas: function() {
                    if (!this._appBar.visible) {
                        var canvas = this._canvasManager.selectedScreenCanvas;
                        canvas && canvas.focus()
                    }
                }, dequeueScreenTransitionType: function() {
                    var transition = this._screenTransitionType;
                    return this._screenTransitionType = null, transition
                }, getEntityByName: function(entityName) {
                    return Contracts.checkNonEmpty(entityName), this._entityManager.getEntityByName(entityName)
                }, getScreenByName: function(screenName) {
                    return Contracts.checkNonEmpty(screenName), this._entityManager.getScreenByName(screenName)
                }, getVisualByName: function(visualName) {
                    return Contracts.checkNonEmpty(visualName), this._entityManager.getVisualByName(visualName)
                }, tryGetEntityByName: function(entityName) {
                    var entity = this._entityManager.tryGetVisualByName(entityName);
                    return entity || (entity = this._entityManager.tryGetDataControlByName(entityName)), entity || (entity = this._entityManager.getScreenByName(entityName)), entity
                }, getParentScreenName: function(visualOrScreenName) {
                    Contracts.checkNonEmpty(visualOrScreenName);
                    var parentScreen = this._entityManager.getEntityScreenByName(visualOrScreenName);
                    return Contracts.checkValue(parentScreen), parentScreen.name
                }, getParentScreenIndex: function(visualOrScreenName) {
                    Contracts.checkNonEmpty(visualOrScreenName);
                    var screenViewModel = this._entityManager.getEntityScreenByName(visualOrScreenName);
                    return Contracts.checkValue(screenViewModel), screenViewModel.index
                }, handlePreview: function() {
                    AppMagic.context.shellViewModel.togglePreview()
                }, navigateTo: function(entityName, transition) {
                    Contracts.checkNonEmpty(entityName);
                    Contracts.checkString(transition);
                    var screenViewModel = this._entityManager.getEntityScreenByName(entityName);
                    Contracts.checkValue(screenViewModel);
                    this._screenTransitionType = transition;
                    this.currentScreen = screenViewModel
                }, navigateToExpressviewRule: function(screenName, controlName, propertyName) {
                    Contracts.checkString(screenName);
                    Contracts.checkStringOrNull(controlName);
                    Contracts.checkString(propertyName);
                    var entityVM = this._entityManager.getScreenByName(screenName);
                    Contracts.checkValue(entityVM);
                    this._selectionManager.selectScreen(entityVM);
                    controlName !== null && (entityVM = this._entityManager.getVisualByName(controlName), Contracts.checkValue(entityVM), this._selectionManager.selectVisual(entityVM));
                    var ruleVM = entityVM.getRuleByPropertyName(propertyName);
                    Contracts.checkValue(ruleVM);
                    ruleVM.focusInExpressView()
                }, notifyCanvasCreatedTestHook: function() {
                    this._canvasCreatedTestHook.complete()
                }, notifyEntityPropertyChanged: function(entityName, propertyName, newValue) {
                    Contracts.checkNonEmpty(entityName);
                    Contracts.checkNonEmpty(propertyName);
                    Contracts.checkDefined(newValue);
                    var entity = this.tryGetEntityByName(entityName);
                    Contracts.checkValue(entity);
                    entity.notifyPropertyChanged(propertyName, newValue);
                    entity.selected && this.selection.selection.length > 1 && this._rulePanelsInfo.propertyRuleMap[propertyName] && this._rulePanelsInfo.ruleButtonManager.notifyPropertyChanged(propertyName, newValue);
                    entity.group && entity.group.notifyPropertyChanged(propertyName, newValue)
                }, updatePropertyRule: function(controlName, propertyName, newValue) {
                    Contracts.checkNonEmpty(controlName);
                    Contracts.checkNonEmpty(propertyName);
                    Contracts.checkDefined(newValue);
                    var value = typeof newValue == "string" ? '"' + newValue.replace(/\"/g, '""') + '"' : Microsoft.AppMagic.Common.LocalizationHelper.convertToLocaleSpecific(newValue.toString(), null);
                    var visual = this.getVisualByName(controlName);
                    Contracts.checkValue(visual);
                    visual.setRule(propertyName, value)
                }, updateRuleFromDocument: function(controlName) {
                    var entity = this.tryGetEntityByName(controlName);
                    Contracts.checkValue(entity);
                    entity.updateRules()
                }, removeSelectedVisuals: function() {
                    this._undoManager.createGroup("Remove selected visuals");
                    try {
                        var selectedVisuals = this.selection.visuals;
                        this.selection.clearVisuals();
                        selectedVisuals.forEach(function(visual) {
                            visual.remove()
                        })
                    }
                    finally {
                        this._undoManager.closeGroup()
                    }
                }, removeScreen: function(screenToRemove) {
                    if (Contracts.checkValue(screenToRemove), this._entityManager.screens().length !== 1) {
                        var screenControl = this._document.getControlByName(screenToRemove.name);
                        Contracts.checkValue(screenControl);
                        this._document.removeControl(screenControl)
                    }
                }, removeSelectedEntities: function() {
                    if (this.selection.visuals.length > 0)
                        this.removeSelectedVisuals();
                    else {
                        var currentScreen = this.selection.screen;
                        this.removeScreen(currentScreen)
                    }
                }, resume: function(suspendState) {
                    (Contracts.checkObject(suspendState), typeof suspendState.configuration != "undefined") && (this._configuration.resume(suspendState.configuration), this._selectionManager.resume(suspendState.selection), this.resumeDocument(suspendState.document))
                }, resumeDocument: function(documentState) {
                    Contracts.checkValue(documentState);
                    Contracts.checkBoolean(documentState.hasUnsavedChanges);
                    this._document.onResume(documentState.hasUnsavedChanges)
                }, suspend: function(suspendState) {
                    Contracts.checkObject(suspendState);
                    suspendState.configuration = {};
                    suspendState.selection = {};
                    suspendState.document = {};
                    this._configuration.suspend(suspendState.configuration);
                    this._selectionManager.suspend(suspendState.selection);
                    this.suspendDocument(suspendState.document)
                }, suspendDocument: function(documentState) {
                    Contracts.checkObject(documentState);
                    documentState.hasUnsavedChanges = this.hasChanges;
                    var result = this._document.cancelPublish();
                    Contracts.checkBoolean(result);
                    result && AppMagic.AuthoringTool.PlatformHelpers.showNotification(AppMagic.AuthoringStrings.Publish, AppMagic.AuthoringStrings.UnknownErrorWhilePublish)
                }, waitForCanvasCreationTestHook: function() {
                    return this._canvasCreatedTestHook.promise
                }, canvasManager: {get: function() {
                        return this._canvasManager
                    }}, controlManager: {get: function() {
                        return this._controlManager
                    }}, backStage: {get: function() {
                        return this._backStage
                    }}, canvasText: {get: function() {
                        if (this.selection.canvas) {
                            var owner = this.selection.canvas.owner;
                            return owner.templateClassName === "AppMagic.Controls.Gallery.GalleryControl" ? Core.Utility.formatString(AppMagic.AuthoringStrings.BreadcrumbLabelSelectedOne, this.currentScreen.name, AppMagic.AuthoringStrings.CanvasComponentTemplateName) : Core.Utility.formatString(AppMagic.AuthoringStrings.BreadcrumbLabelSelectedOne, this.currentScreen.name, this.selection.canvas.owner.name)
                        }
                        else
                            return this.selection.visuals.length === 0 ? Core.Utility.formatString(AppMagic.AuthoringStrings.BreadcrumbLabelSelectedNone, this.currentScreen.name) : this.selection.visuals.length === 1 ? Core.Utility.formatString(AppMagic.AuthoringStrings.BreadcrumbLabelSelectedOne, this.currentScreen.name, this.selection.singleVisual.name) : Core.Utility.formatString(AppMagic.AuthoringStrings.BreadcrumbLabelSelectedMultiple, this.currentScreen.name)
                    }}, commandBar: {get: function() {
                        return this._commandBar
                    }}, configuration: {get: function() {
                        return this._configuration
                    }}, controlGallery: {get: function() {
                        return this._controlGallery
                    }}, currentScreen: {
                    get: function() {
                        return this._currentScreen()
                    }, set: function(value) {
                            Contracts.check(value === null || this._entityManager.containsScreen(value));
                            this._currentScreen(value)
                        }
                }, restErrorPanel: {get: function() {
                        return this._restErrorPanel
                    }}, appBar: {get: function() {
                        return this._appBar
                    }}, blankPage: {get: function() {
                        return this._blankPage
                    }}, documentLayoutManager: {get: function() {
                        return this._documentLayoutManager
                    }}, isPreview: {
                    get: function() {
                        return this._isPreview()
                    }, set: function(value) {
                            Contracts.checkBoolean(value);
                            this._isPreview(value)
                        }
                }, zoom: {get: function() {
                        return this._zoom
                    }}, screens: {get: function() {
                        return this._entityManager.screens()
                    }}, selection: {get: function() {
                        return this._selectionManager
                    }}, undoManager: {get: function() {
                        return this._undoManager
                    }}, clipboardManager: {get: function() {
                        return this._clipboardManager
                    }}, visuals: {get: function() {
                        return this._entityManager.visuals()
                    }}, refreshRules: function() {
                    this.screens.forEach(function(screenVM) {
                        screenVM.updateRules()
                    });
                    for (var i = 0, len = this.visuals.length; i < len; i++)
                        this.visuals[i].refreshRulesFromDocument()
                }, _handleScreenAdded: function(evt) {
                    Contracts.checkValue(evt);
                    Contracts.checkValue(evt.detail);
                    Contracts.checkValue(evt.detail.screen);
                    this._currentScreen() || this._currentScreen(evt.detail.screen)
                }, _handleVisualRemoved: function() {
                    document.activeElement || this.focusToScreenCanvas()
                }, _handleScreenChanged: function(evt) {
                    Contracts.checkValue(evt);
                    Contracts.checkValue(evt.detail);
                    Contracts.checkValue(evt.detail.newScreen);
                    AppMagic.AuthoringTool.Runtime.activeScreenIndex(evt.detail.newScreen.index)
                }, doCopy: function() {
                    this._clipboardManager.doCopy()
                }, doCut: function() {
                    this._clipboardManager.doCut()
                }, doPaste: function(position) {
                    Contracts.checkObjectOrUndefined(position);
                    this._clipboardManager.doPaste(position)
                }, visualDropDown: {get: function() {
                        return this._visualDropDown
                    }}, screenDropDown: {get: function() {
                        return this._screenDropDown
                    }}
        }, {}),
        CurrentFileTracker = WinJS.Class.define(function CurrentFileTracker_ctor() {
            this._futureAccessList = Platform.Storage.AccessCache.StorageApplicationPermissions.futureAccessList
        }, {
            _file: null, _futureAccessList: null, resumeAsync: function() {
                    return this._futureAccessList.containsItem(CurrentFileTracker.CurrentFileKey) ? this._futureAccessList.getFileAsync(CurrentFileTracker.CurrentFileKey).then(function(file) {
                            Contracts.checkObject(file);
                            this._file = file
                        }.bind(this), function() {
                            this._file = null
                        }.bind(this)) : (this._file = null, WinJS.Promise.wrap())
                }, suspend: function() {
                    this._file ? this._futureAccessList.addOrReplace(CurrentFileTracker.CurrentFileKey, this._file) : this._futureAccessList.containsItem(CurrentFileTracker.CurrentFileKey) && this._futureAccessList.remove(CurrentFileTracker.CurrentFileKey)
                }, file: {
                    get: function() {
                        return this._file
                    }, set: function(value) {
                            Contracts.checkDefined(value);
                            value instanceof Error ? this._file = null : (value && Contracts.checkString(value.path), this._file = value)
                        }
                }
        }, {CurrentFileKey: "currentFile"});
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {
        CurrentFileTracker: CurrentFileTracker, DocumentViewModel: DocumentViewModel
    })
})(Windows);