//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(Platform) {"use strict";
    var GalleryTemplateName = "GalleryTemplate",
        GalleryControlName = "Gallery",
        GalleryVariantName = "imageGalleryWithCaptionHorizontal",
        OpenAjaxPropertyNames = AppMagic.AuthoringTool.OpenAjaxPropertyNames,
        AppBarControlView = WinJS.Class.define(function AppBarControlView_ctor(element) {
            this._macroBackStageVisible = ko.observable(!1);
            this._fileFlyoutVisible = ko.observable(!1);
            this._dataFlyoutVisible = ko.observable(!1);
            this._helpFlyoutVisible = ko.observable(!1);
            this._playFlyoutVisible = ko.observable(!1);
            this._activeDropTarget = ko.observable(-1);
            topAppBar.winControl.addEventListener("afterhide", function() {
                topAppBarFileFlyout.winControl.hide();
                topAppBarDataFlyout.winControl.hide();
                topAppBarHelpFlyout.winControl.hide();
                topAppBarPlayFlyout.winControl.hide()
            }.bind(this));
            topAppBar.winControl.addEventListener("aftershow", function() {
                this.viewModel.notifyAppBarShown()
            }.bind(this));
            topAppBarFileFlyout.winControl.addEventListener("afterhide", function() {
                this.appBarShortcuts.selectedIndex = 0;
                this.viewModel.fileFlyoutVisible = !1
            }.bind(this));
            topAppBarDataFlyout.winControl.addEventListener("afterhide", function() {
                this.appBarShortcuts.selectedIndex = 0;
                this._dataFlyoutVisible(!1)
            }.bind(this));
            topAppBarHelpFlyout.winControl.addEventListener("afterhide", function() {
                this.appBarShortcuts.selectedIndex = 0;
                this._helpFlyoutVisible(!1)
            }.bind(this));
            topAppBarPlayFlyout.winControl.addEventListener("afterhide", function() {
                this._playFlyoutVisible(!1)
            }.bind(this));
            this._element = element;
            this._appBarShortcuts = new AppMagic.AuthoringTool.Shortcuts.AppBarShortcutProvider(this);
            ko.applyBindings(this, element)
        }, {
            _screenSubscription: null, _macroBackStageVisible: null, _fileFlyoutVisible: null, _dataFlyoutVisible: null, _helpFlyoutVisible: null, _playFlyoutVisible: null, _activeDropTarget: null, _element: null, _appBarShortcuts: null, appBarShortcuts: {get: function() {
                        return this._appBarShortcuts
                    }}, activeDropTarget: {get: function() {
                        return this._activeDropTarget()
                    }}, viewModel: {get: function() {
                        return AppMagic.context.documentViewModel.appBar
                    }}, isDisabled: {get: function() {
                        return AppMagic.context.documentViewModel.backStage.visible || AppMagic.context.shellViewModel.firstRun.visible || AppMagic.Popups.DialogManager.getOpenDialogCount() > 0
                    }}, handleAppbarButtons: function(data) {
                    AppMagic.context.documentViewModel.backStage.visible || this[data.action](data.args)
                }, handleNewClicked: function() {
                    this._hideFileMenu();
                    AppMagic.context.documentViewModel.hasChanges ? this._performNewOrOpen(!0) : this.viewModel.newAction()
                }, _performNewOrOpen: function(isNew) {
                    this.viewModel.performNewOrOpen(isNew, null)
                }, handleAddScreenClicked: function() {
                    this.viewModel.handleAddScreenClicked()
                }, handleDataSourcesClicked: function() {
                    this._displayBackStagePage(AppMagic.AuthoringStrings.DataSources)
                }, handleDataCollectionsClicked: function() {
                    this._displayBackStagePage(AppMagic.AuthoringStrings.DataCollections)
                }, handleEmbeddedMediaClicked: function() {
                    this._displayBackStagePage(AppMagic.AuthoringStrings.EmbeddedMedia)
                }, handleMacroBackstageClicked: function() {
                    this._displayBackStagePage(AppMagic.AuthoringStrings.MacroBackstage)
                }, handlePublishClicked: function() {
                    this._displayBackStagePage(AppMagic.AuthoringStrings.Publish)
                }, handleAppSettingsClicked: function() {
                    this._displayBackStagePage(AppMagic.AuthoringStrings.AppSettings)
                }, handleHelpBuildSampleClicked: function() {
                    AppMagic.context.helpLink(AppMagic.AuthoringStrings.HelpBuildSampleUrl, "BuildSample")
                }, handleHelpClicked: function() {
                    AppMagic.context.helpLink(AppMagic.AuthoringStrings.HelpLearnMoreUrl, "LearnMore")
                }, handleHelpForumsClicked: function() {
                    AppMagic.context.helpLink(AppMagic.AuthoringStrings.HelpForumsUrl, "Forums")
                }, handleHelpHomeClicked: function() {
                    AppMagic.context.helpLink(AppMagic.AuthoringStrings.HelpHomeUrl, "Home")
                }, handleImportPicturesClicked: function() {
                    var picker = new Platform.Storage.Pickers.FileOpenPicker;
                    return picker.suggestedStartLocation = Platform.Storage.Pickers.PickerLocationId.picturesLibrary, picker.fileTypeFilter.replaceAll(AppMagic.AuthoringTool.Constants.ImageFormats), picker.pickMultipleFilesAsync().then(function(pickedFiles) {
                                if (pickedFiles.length > 0) {
                                    var importer = new PictureImporter;
                                    importer.import(pickedFiles)
                                }
                            })
                }, _displayBackStagePage: function(pageName) {
                    this._hideFileMenu();
                    AppMagic.context.documentViewModel.backStage.visible = !0;
                    AppMagic.context.documentViewModel.backStage.macroBackStageVisible = this._macroBackStageVisible();
                    AppMagic.context.documentViewModel.backStage.selectSettingByName(pageName);
                    AppMagic.context.shellViewModel.hideAppBars()
                }, fileFlyoutVisible: {get: function() {
                        return this.viewModel.fileFlyoutVisible
                    }}, dataFlyoutVisible: {get: function() {
                        return this._dataFlyoutVisible()
                    }}, helpFlyoutVisible: {get: function() {
                        return this._helpFlyoutVisible()
                    }}, playFlyoutVisible: {get: function() {
                        return this._playFlyoutVisible()
                    }}, handleTopAppBarFileButtonClicked: function() {
                    this.fileFlyoutVisible ? this._fileFlyoutVisible(!1) : (topAppBarFileFlyout.winControl.show(cmdFile, "bottom", "left"), this._fileFlyoutVisible(!0))
                }, handleTopAppBarAppDataButtonClicked: function() {
                    this._macroBackStageVisible(AppMagic.context.documentViewModel.hasMacros);
                    this.dataFlyoutVisible ? this._dataFlyoutVisible(!1) : (topAppBarDataFlyout.winControl.show(cmdAppData, "bottom", "left"), this._dataFlyoutVisible(!0))
                }, handleTopAppBarHelpButtonClicked: function() {
                    this.helpFlyoutVisible ? this._helpFlyoutVisible(!1) : (topAppBarHelpFlyout.winControl.show(cmdHelp, "bottom", "left"), this._helpFlyoutVisible(!0))
                }, handleTopAppBarPlayFlyoutClicked: function() {
                    this.playFlyoutVisible ? this._playFlyoutVisible(!1) : (topAppBarPlayFlyout.winControl.show(cmdPlayFlyout, "bottom", "right"), this._playFlyoutVisible(!0))
                }, handleOpenClicked: function() {
                    this._hideFileMenu();
                    AppMagic.context.documentViewModel.hasChanges ? this._performNewOrOpen(!1) : AppMagic.context.openFilePicker()
                }, handlePlayClicked: function(data) {
                    typeof data == "string" ? AppMagic.context.shellViewModel.togglePreview(data) : AppMagic.context.shellViewModel.togglePreview()
                }, handleScreenClicked: function(selectedScreen) {
                    AppMagic.context.shellViewModel.hideAppBars();
                    this.viewModel.handleScreenClicked(selectedScreen)
                }, showContextMenu: function(currentScreen, evt) {
                    if (!this.isPreview) {
                        var position = {
                                x: evt.clientX, y: evt.clientY
                            },
                            menu = this.viewModel.createContextMenu(currentScreen);
                        try {
                            menu.showAsync(position)
                        }
                        catch(e) {}
                    }
                }, handleScreenKeydown: function(selectedScreen) {
                    if (event.key === AppMagic.Constants.Keys.del)
                        return this.handleRemoveScreenClicked(selectedScreen), !1;
                    else if (event.key === AppMagic.Constants.Keys.enter)
                        return this.handleScreenClicked(selectedScreen), !1;
                    return !0
                }, handleRemoveScreenClicked: function(screenToRemove) {
                    this.viewModel.handleRemoveScreenClicked(screenToRemove)
                }, removeScreenVisible: {get: function() {
                        return this.viewModel.removeScreenVisible
                    }}, handleSaveClicked: function() {
                    this._hideFileMenu();
                    AppMagic.context.save()
                }, handleSaveAsClicked: function() {
                    this._hideFileMenu();
                    AppMagic.context.saveAs()
                }, isPreview: {get: function() {
                        return AppMagic.context.documentViewModel.isPreview
                    }}, draggableValue: {get: function() {
                        return AppMagic.context.documentViewModel.isPreview ? "false" : "true"
                    }}, smallLayout: {get: function() {
                        return AppMagic.context.shellViewModel.smallLayout
                    }}, handleDrop: function(item, evt) {
                    var targetScreen;
                    targetScreen = this._activeDropTarget() === this.viewModel.screens.length ? null : this.viewModel.screens[this._activeDropTarget()];
                    this.handleDragLeave();
                    var dataTransferData = evt.dataTransfer.getData("text");
                    dataTransferData !== null && this.viewModel.handleDrop(dataTransferData, targetScreen)
                }, handleDragLeave: function() {
                    this._activeDropTarget(-1)
                }, handleDragOver: function(index, isScreen, item, evt) {
                    if (isScreen) {
                        var elem = evt.srcElement;
                        var srcBounding = elem.getBoundingClientRect(),
                            halve = Math.round((evt.clientX - srcBounding.left) / srcBounding.width);
                        halve === 0 ? this._activeDropTarget(index) : this._activeDropTarget(index + 1)
                    }
                    else
                        this._activeDropTarget(index)
                }, handleDragStart: function(screenName, item, evt) {
                    return evt.dataTransfer.dropEffect = "move", evt.dataTransfer.setData("text", screenName), !0
                }, handleDragEnd: function() {
                    this.handleDragLeave()
                }, _hideFileMenu: function() {
                    topAppBarFileFlyout.winControl.hide()
                }, handleScrollBeforeShow: function() {
                    var listWidth = appBarScreenListContainer.clientWidth,
                        bufferWidth = appBarScreenList.children[0].clientWidth,
                        itemWidth = appBarScreenList.children[1].clientWidth,
                        totalItemWidth = bufferWidth + itemWidth;
                    var currentScreenIndex = this.viewModel.screens.indexOf(this.viewModel.currentScreen) + 1;
                    currentScreenIndex * totalItemWidth > listWidth && (appBarScreenListContainer.scrollLeft = (currentScreenIndex - 1) * totalItemWidth)
                }, macroBackStageVisible: {get: function() {
                        return this._macroBackStageVisible()
                    }}
        }, {}),
        PictureImporter = WinJS.Class.define(function PictureImporter_ctor(){}, {
            "import": function(files) {
                var tableName,
                    nameColumnName,
                    imageColumnName,
                    childrenTemplates = [],
                    docVM = AppMagic.context.documentViewModel,
                    cancelledByUser = !1,
                    importer = new Microsoft.AppMagic.Importers.LocalMediaImporter(AppMagic.context.document),
                    cancelHandler = function() {
                        cancelledByUser = !0;
                        importer.cancelImport()
                    },
                    options = {
                        descriptionText: AppMagic.AuthoringStrings.ImportingPicturesWaitMessage, showCancelButton: !0, cancelHandler: cancelHandler
                    };
                return AppMagic.context.shellViewModel.wait.startAsync(AppMagic.AuthoringStrings.ImportingPicturesWaitTitle, options).then(function() {
                        return importer.importPicturesAsync(files)
                    }).then(function(importResult) {
                        if (!importResult)
                            return AppMagic.context.shellViewModel.wait.stop(), files.length > 0 && !cancelledByUser && AppMagic.AuthoringTool.PlatformHelpers.showMessage(AppMagic.AuthoringStrings.ImportingPicturesErrorTitle, AppMagic.AuthoringStrings.ImportingPicturesErrorMessage), null;
                        var dataConnectionsViewModel = this._getDataConnectionViewModel(docVM),
                            connMan = dataConnectionsViewModel._connectionManager,
                            excelFile = importResult.excelFile;
                        tableName = importResult.tableName;
                        nameColumnName = importResult.nameColumnName;
                        imageColumnName = importResult.imageColumnName;
                        connMan.importStatic("excel", excelFile.path, excelFile, [tableName]);
                        for (var templateStore = Microsoft.AppMagic.Authoring.DocumentFactory.templateStore, galleryResult = templateStore.tryGetTemplate(GalleryTemplateName), template = galleryResult.template, templateName = GalleryTemplateName, getTemplateResult = templateStore.tryGetTemplate(templateName), controlTemplate = getTemplateResult.template, result = controlTemplate.tryGetControlVariant(GalleryVariantName), controlVariant = result.controlVariant, i = 0, len = controlVariant.childControlNames.length; i < len; i++) {
                            var childControlName = controlVariant.childControlNames[i];
                            var childControlInfo = controlVariant.childControls[childControlName];
                            var getChildTemplateResult = templateStore.tryGetTemplate(childControlInfo.template + "Template");
                            var childTemplate = getChildTemplateResult.template;
                            childrenTemplates.push({
                                info: childControlInfo, template: childTemplate
                            })
                        }
                        return docVM.selection.selectCanvas(null), docVM.controlGallery.addControlAsyncAndNotifyCompletion(GalleryControlName, controlTemplate, !0, GalleryVariantName, childrenTemplates)
                    }.bind(this)).then(function(control) {
                        return control === null ? WinJS.Promise.wrap() : docVM.controlGallery.waitForVisualInitialization(control.name).then(function() {
                                for (var promises = [], i = 0; i < childrenTemplates.length; i++)
                                    promises.push(docVM.controlGallery.waitForVisualInitialization(childrenTemplates[i].uniqueName));
                                return WinJS.Promise.join(promises)
                            }).then(function() {
                                var parentGallery = docVM.getEntityByName(childrenTemplates[0].uniqueName).parent,
                                    childImage = docVM.getEntityByName(childrenTemplates[0].uniqueName),
                                    childLabel = docVM.getEntityByName(childrenTemplates[1].uniqueName);
                                parentGallery.setRuleInvariant(OpenAjaxPropertyNames.Items, tableName);
                                childImage.setRuleInvariant(OpenAjaxPropertyNames.Image, imageColumnName);
                                childLabel.setRuleInvariant(OpenAjaxPropertyNames.Text, nameColumnName)
                            })
                    }).then(function() {
                        AppMagic.context.shellViewModel.wait.stop()
                    })
            }, _getDataConnectionViewModel: function getDataConnectionViewModel(documentViewModel) {
                    for (var dataConnectionsViewModel, bs = documentViewModel.backStage, i = 0, len = bs._settings.length; i < len; i++)
                        if (bs._settings[i].title === AppMagic.AuthoringStrings.DataSources) {
                            dataConnectionsViewModel = bs._settings[i].viewModel;
                            break
                        }
                    return dataConnectionsViewModel
                }
        });
    AppMagic.UI.Pages.define("/controls/appBar/appBarControl.html", AppBarControlView)
})(Windows);