//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(Platform) {"use strict";
    var util = AppMagic.Utility,
        downloadAlreadySucceeded = !1,
        getFirstScreenName = function() {
            return Core.Utility.formatString(AppMagic.AuthoringStrings.ScreenNamingFormat, 1)
        },
        PropertyBags = WinJS.Class.define(function PropertyBags_ctor() {
            this.add = function(propertyName, view) {
                Object.defineProperty(this, propertyName, {
                    value: view, writable: !1, enumerable: !0, configurable: !0
                })
            };
            this.remove = function(propertyName) {
                delete this[propertyName]
            }
        }, {}, {}),
        Context = WinJS.Class.define(function Context_ctor() {
            this._views = new PropertyBags;
            this._documentViewModel = ko.observable(null);
            this._shellViewModel = new AppMagic.AuthoringTool.ViewModels.ShellViewModel(this._documentViewModel);
            this._currentFile = new AppMagic.AuthoringTool.ViewModels.CurrentFileTracker;
            this._imeManager = new AppMagic.AuthoringTool.IMEManager;
            this._eventTracker = new AppMagic.Utility.EventTracker;
            this._saveDocPromise = WinJS.Promise.wrap(!0);
            this._isLoading = ko.observable(!1);
            AppMagic.AuthoringTool.Utility.applyInteractiveLightDismiss();
            AppMagic.AuthoringTool.Utility.applyFlyoutWholePixelPositioning()
        }, {
            _views: null, _shellViewModel: null, _document: null, _documentViewModel: null, _currentFile: null, _eventTracker: null, _saveDocPromise: null, _imeManager: null, _isLoading: null, views: {get: function() {
                        return this._views
                    }}, document: {get: function() {
                        return this._document
                    }}, documentViewModel: {get: function() {
                        return this._documentViewModel()
                    }}, imeManager: {get: function() {
                        return this._imeManager
                    }}, isLoading: {get: function() {
                        return this._isLoading()
                    }}, shellViewModel: {get: function() {
                        return this._shellViewModel
                    }}, _removeListenersAndDisposeDocument: function() {
                    this._document !== null && (AppMagic.Popups.DialogManager.cancelAll(), this._document.removeAllDynamicDataSources(), this._eventTracker.removeAll(), this._documentViewModel().dispose(), this.dispatchEvent("documentdisposing"))
                }, _addListeners: function() {
                    var rt = AppMagic.AuthoringTool.Runtime;
                    this._eventTracker.add(this._document, "dynamicdatasourceevent", rt.dynamicDataSourceEvent, rt);
                    this._eventTracker.add(this._document, "entityadded", rt.entityAdded, rt);
                    this._eventTracker.add(this._document, "entityremoved", rt.entityRemoved, rt);
                    this._eventTracker.add(this._document, "entityrenamed", rt.entityRenamed, rt);
                    this._eventTracker.add(this._document, "publishevent", rt.publishEvent, rt);
                    this._eventTracker.add(this._document, "resetdataevent", rt.resetDataEvent, rt)
                }, _createDocument: function() {
                    this._removeListenersAndDisposeDocument();
                    AppMagic.AuthoringTool.Runtime.onNewDocument();
                    this._document = new Microsoft.AppMagic.Authoring.Document;
                    this._updateWindowTitle();
                    Microsoft.AppMagic.Common.TelemetrySession.telemetry.setDocument(this._document);
                    AppMagic.AuthoringTool.ScreenInitializer.initializeScreen(this._document, getFirstScreenName(), function() {
                        return AppMagic.AuthoringTool.Runtime.onAfterNewDocument(this._document).then(function() {
                                Microsoft.AppMagic.Authoring.Importers.ServiceImporterUtils.copyInstalledRestServicesPackageAsync().then(function() {
                                    return AppMagic.AuthoringTool.Runtime.importRESTServices(this._document)
                                }.bind(this))
                            }.bind(this))
                    }.bind(this));
                    AppMagic.Utility.blobManager.releaseAll();
                    AppMagic.Utility.clearKnownFilesList();
                    this._documentViewModel(new AppMagic.AuthoringTool.ViewModels.DocumentViewModel(this._document, this._shellViewModel));
                    this._documentViewModel().initialize();
                    this._addListeners();
                    this._documentViewModel().updateRuleFromDocument(getFirstScreenName());
                    this._documentViewModel().processAfterNew()
                }, _switchDocument: function(loadContext) {
                    this._removeListenersAndDisposeDocument();
                    AppMagic.AuthoringTool.Runtime.onNewDocument();
                    AppMagic.Utility.blobManager.releaseAll();
                    AppMagic.Utility.clearKnownFilesList();
                    var docVM = new AppMagic.AuthoringTool.ViewModels.DocumentViewModel(loadContext.document, this._shellViewModel);
                    this._document = docVM._document;
                    this._documentViewModel(docVM);
                    this._updateWindowTitle();
                    var context = this;
                    return AppMagic.AuthoringTool.Runtime.onAfterNewDocument(this._document).then(function() {
                            return AppMagic.AuthoringTool.Runtime.promptReuseCredentials().then(function() {
                                    return context._documentViewModel().initialize()
                                }).then(function() {
                                    context._addListeners()
                                })
                        })
                }, _updateWindowTitle: function() {
                    var documentName = this._document.properties.name;
                    documentName = documentName.substr(0, documentName.lastIndexOf(".")) || AppMagic.AuthoringStrings.DocumentSuggestedSaveName;
                    Platform.UI.ViewManagement.ApplicationView.getForCurrentView().title = documentName;
                    this.dispatchEvent("documentNameChanged")
                }, _loadContext: function(loadContext, fileToBeLoaded, isResuming) {
                    if (loadContext.document !== null) {
                        this.documentViewModel.controlManager.removeAllControls();
                        var promise = this._switchDocument(loadContext).then(function() {
                                var docVM = this._documentViewModel();
                                return this._shellViewModel.reset(), loadContext.processAll(), docVM.processAfterLoad(), docVM.focusToScreenCanvas(), isResuming ? null : loadContext.document.resourceManager.cleanupUnusedResources()
                            }.bind(this));
                        return this._currentFile.file = fileToBeLoaded, promise
                    }
                    else {
                        var content,
                            title;
                        return title = AppMagic.AuthoringStrings.OpenFileErrorTitle, content = loadContext.error.message + fileToBeLoaded.path, isResuming || AppMagic.AuthoringTool.PlatformHelpers.showMessage(title, content), this.document.resourceManager.cleanupUnusedResources()
                    }
                }, open: function(file) {
                    this._open(file, !1)
                }, _detachDynamicDataSources: function(sources) {
                    for (var detachStatus = {}, i = 0; i < sources.length; i++)
                        detachStatus[sources[i].name] = AppMagic.AuthoringTool.Runtime.unsubscribeDynamicDataSource(sources[i].name);
                    return detachStatus
                }, _reattachDynamicDataSources: function(sources, detachStatus) {
                    for (var i = 0; i < sources.length; i++)
                        detachStatus[sources[i].name] && AppMagic.AuthoringTool.Runtime.subscribeDynamicDataSource(sources[i].name, !1)
                }, _open: function(file, isResuming) {
                    var dynamicDataSources = AppMagic.Utility.enumerableToArray(this._document.dynamicDataSources);
                    var detachStatus = this._detachDynamicDataSources(dynamicDataSources),
                        newLoadContext = null,
                        promise;
                    if (file !== null) {
                        var shellVM = this._shellViewModel,
                            message = isResuming ? AppMagic.AuthoringStrings.ResumingMessage : AppMagic.AuthoringStrings.LoadingMessage,
                            messageDescriptionText = isResuming ? AppMagic.AuthoringStrings.ResumingDescription : AppMagic.AuthoringStrings.LoadingDescription;
                        this._isLoading(!0);
                        promise = shellVM.wait.startAsync(message, {descriptionText: messageDescriptionText}).then(function() {
                            return isResuming ? Microsoft.AppMagic.Authoring.Document.quickLoad(file) : Microsoft.AppMagic.Authoring.Document.load(file)
                        })
                    }
                    else
                        newLoadContext = Microsoft.AppMagic.Authoring.Document.createDocumentAndLoadContext(),
                        AppMagic.AuthoringTool.ScreenInitializer.initializeScreen(newLoadContext.document, getFirstScreenName()),
                        promise = WinJS.Promise.wrap(newLoadContext);
                    var wasDocumentConverted = !1;
                    return promise.then(function(loadContext) {
                            return wasDocumentConverted = loadContext.wasDocumentConverted, this._loadContext(loadContext, file, isResuming)
                        }.bind(this)).then(function() {
                            AppMagic.AuthoringTool.Runtime.activeScreenIndex(0);
                            file !== null && (Microsoft.AppMagic.Common.TelemetrySession.telemetry.setDocument(AppMagic.context.document), Microsoft.AppMagic.Common.TelemetrySession.telemetry.logOpen());
                            this._isLoading(!1);
                            this._shellViewModel.wait.stop();
                            this._document.hasErrors && wasDocumentConverted && AppMagic.AuthoringTool.PlatformHelpers.showMessage(AppMagic.AuthoringStrings.OpenDialogTitle, Core.Utility.formatString(AppMagic.AuthoringStrings.DocumentConvertedWithErrors, file.name))
                        }.bind(this), function() {
                            this._isLoading(!1);
                            this._shellViewModel.wait.stop();
                            this._reattachDynamicDataSources(dynamicDataSources, detachStatus)
                        }.bind(this))
                }, openFilePicker: function() {
                    if (AppMagic.AuthoringTool.Utility.canShowPicker()) {
                        var picker = new Windows.Storage.Pickers.FileOpenPicker;
                        picker.fileTypeFilter.append(AppMagic.AuthoringTool.Constants.DocumentFileFormat);
                        picker.pickSingleFileAsync().then(function(file) {
                            file && this.open(file)
                        }.bind(this))
                    }
                }, openFileDirect: function(file) {
                    this.documentViewModel.hasChanges ? this.documentViewModel.appBar.performNewOrOpen(!1, file) : AppMagic.context.open(file)
                }, reset: function() {
                    this.open(null)
                }, _persistIsDocumentDirtyOnSuspend: function(isDirty) {
                    Windows.Storage.ApplicationData.current.localSettings.values[AppMagic.AuthoringTool.Constants.WasDocumentDirtyOnSuspendSettingsKey] = isDirty
                }, wasDocumentDirtyOnLastSuspend: function() {
                    return !!Windows.Storage.ApplicationData.current.localSettings.values[AppMagic.AuthoringTool.Constants.WasDocumentDirtyOnSuspendSettingsKey]
                }, resumeFromTerminateAsync: function(suspendState) {
                    var folder = Platform.Storage.ApplicationData.current.localFolder,
                        promise = folder.getFileAsync(Microsoft.AppMagic.Authoring.Constants.documentSuspendFilename);
                    return promise.then(function(file) {
                            return this._open(file, !0).then(function() {
                                    return this._currentFile.resumeAsync(suspendState)
                                }.bind(this)).then(function() {
                                    return this._documentViewModel().resume(suspendState)
                                }.bind(this))
                        }.bind(this), function() {
                            return null
                        })
                }, resumeFromSuspendAsync: function(suspendState) {
                    this._documentViewModel().resumeDocument(suspendState.document)
                }, suspendAsync: function(suspendState) {
                    this._currentFile.suspend(suspendState);
                    this._documentViewModel().suspend(suspendState);
                    AppMagic.AuthoringTool.Runtime.onSuspend(suspendState);
                    var settingsPromise = AppMagic.Settings.instance.save(),
                        savePromise = Platform.Storage.ApplicationData.current.localFolder.createFileAsync(Microsoft.AppMagic.Authoring.Constants.documentSuspendFilename, Platform.Storage.CreationCollisionOption.replaceExisting).then(function(file) {
                            return this._document.quickSave(file)
                        }.bind(this)).then(function(saveResult) {
                            return this._persistIsDocumentDirtyOnSuspend(this._document.hasUnsavedChanges), saveResult
                        }.bind(this)),
                        promises = [settingsPromise, savePromise];
                    return WinJS.Promise.join(promises)
                }, _save: function(file) {
                    var shellVM = this._shellViewModel;
                    var oldId = this._document.properties.id;
                    return this._saveDocPromise = shellVM.wait.startAsync(AppMagic.AuthoringStrings.SavingMessage, {descriptionText: AppMagic.AuthoringStrings.SavingDescription}).then(function() {
                            return this._document.save(file)
                        }.bind(this)).then(function(saveSucceeded) {
                            var saveNotificationMsg;
                            shellVM.wait.stop();
                            saveSucceeded ? (saveNotificationMsg = AppMagic.AuthoringStrings.SaveSuccessText, this._currentFile.file = file, this._document.properties.id !== oldId && (AppMagic.AuthoringTool.Runtime.updateDocumentId(this._document.properties.id), Microsoft.AppMagic.Common.TelemetrySession.telemetry.setDocument(this._document), Microsoft.AppMagic.Common.TelemetrySession.telemetry.logSaveAs(oldId))) : saveNotificationMsg = AppMagic.AuthoringStrings.SaveFileErrorTitle;
                            var content = Core.Utility.formatString(saveNotificationMsg, file.name);
                            return AppMagic.AuthoringTool.PlatformHelpers.showNotification(AppMagic.AuthoringStrings.AppName, content), saveSucceeded
                        }.bind(this), function(error) {
                            if (shellVM.wait.stop(), error && typeof error.name != "undefined" && error.name !== "Canceled") {
                                var title = Core.Utility.formatString(AppMagic.AuthoringStrings.SaveFileErrorTitle, file.name),
                                    content = Core.Utility.formatString(AppMagic.AuthoringStrings.SaveFileErrorText, file.name);
                                AppMagic.AuthoringTool.PlatformHelpers.showMessage(title, content)
                            }
                            return !1
                        }.bind(this)), this._saveDocPromise
                }, helpLink: function(sampleUrl, sampleText) {
                    AppMagic.AuthoringTool.Utility.openLinkInBrowser(sampleUrl);
                    Microsoft.AppMagic.Common.TelemetrySession.telemetry.logHelp(sampleText)
                }, save: function() {
                    return this._currentFile.file !== null ? this._save(this._currentFile.file) : this.saveAs()
                }, saveAs: function() {
                    if (!AppMagic.AuthoringTool.Utility.canShowPicker())
                        return WinJS.Promise.wrap(!0);
                    var picker = new Windows.Storage.Pickers.FileSavePicker;
                    return picker.fileTypeChoices.insert(AppMagic.AuthoringStrings.DocumentFileDescription, [AppMagic.AuthoringTool.Constants.DocumentFileFormat]), picker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.documentsLibrary, picker.suggestedFileName = AppMagic.AuthoringStrings.DocumentSuggestedSaveName, WinJS.Promise.wrap().then(function() {
                                return picker.pickSaveFileAsync()
                            }).then(function(file) {
                                return file ? this._save(file) : !1
                            }.bind(this), function(error) {
                                return !1
                            }).then(function(result) {
                                return this._updateWindowTitle(), AppMagic.context.documentViewModel.focusToScreenCanvas(), result
                            }.bind(this))
                }, publish: function(publishContext) {
                    var shellVM = this._shellViewModel;
                    var waitDescriptionText = publishContext.publishResourcesLocally ? AppMagic.AuthoringStrings.PublishLocalDescriptionText : AppMagic.AuthoringStrings.PublishNormalDescriptionText,
                        cancelHandler = function() {
                            this._document.cancelPublish()
                        }.bind(this),
                        options = {
                            descriptionText: waitDescriptionText, showCancelButton: publishContext.publishResourcesLocally, cancelHandler: cancelHandler
                        },
                        message = Core.Utility.formatString(AppMagic.AuthoringStrings.PublishMessage, publishContext.applicationName);
                    shellVM.wait.startAsync(message, options).then(function() {
                        return this._document.publishAsync(publishContext)
                    }.bind(this)).done(function(publishResult) {
                        shellVM.wait.stop();
                        var PublishCompletionStatus = Microsoft.AppMagic.Authoring.PublishCompletionStatus;
                        publishResult.result === PublishCompletionStatus.succeeded ? (AppMagic.AuthoringTool.PlatformHelpers.showNotification(AppMagic.AuthoringStrings.Publish, publishResult.message), Microsoft.AppMagic.Common.TelemetrySession.telemetry.logPublish()) : (publishResult.result === PublishCompletionStatus.failed || publishResult.result === PublishCompletionStatus.succeededWithMissingResources) && AppMagic.AuthoringTool.PlatformHelpers.showMessage(Core.Utility.formatString(AppMagic.AuthoringStrings.Publishing, publishContext.applicationName), publishResult.message, !0)
                    }, function() {
                        shellVM.wait.stop();
                        AppMagic.AuthoringTool.PlatformHelpers.showMessage(AppMagic.AuthoringStrings.PublishError, AppMagic.AuthoringStrings.UnknownErrorWhilePublish)
                    })
                }, _shouldDownloadInstallerAsync: function(isPublishClicked) {
                    return isPublishClicked ? Microsoft.AppMagic.Importers.InstallAppDownloaderUtils.lastKnownGoodInstallerNotExistsAsync() : Microsoft.AppMagic.Importers.InstallAppDownloaderUtils.shouldDownloadInstallerAsync()
                }, _downloadInstallerAsync: function() {
                    var shellVM = this._shellViewModel;
                    var cancelHandler = function() {
                            Microsoft.AppMagic.Importers.InstallAppDownloaderUtils.cancelDownloadInstaller()
                        }.bind(this),
                        options = {
                            descriptionText: AppMagic.AuthoringStrings.InstallerDownloadingMessage, showCancelButton: !0, cancelHandler: cancelHandler
                        },
                        downloadClicked = !1,
                        md = new AppMagic.Popups.MessageDialog(AppMagic.AuthoringStrings.InstallerDownloadRequiredMessage, AppMagic.AuthoringStrings.InstallerDownloadRequiredTitle);
                    md.addButton(AppMagic.AuthoringStrings.Download, function() {
                        downloadClicked = !0
                    }.bind(this));
                    md.addButton(AppMagic.Strings.Cancel);
                    md.cancelCommandIndex = 1;
                    var onWaitDialogComplete = function() {
                            return Microsoft.AppMagic.Importers.InstallAppDownloaderUtils.downloadInstallerAsync()
                        }.bind(this),
                        onError = function() {
                            return shellVM.wait.stop(), WinJS.Promise.as(Microsoft.AppMagic.Authoring.DownloadResult.failed)
                        }.bind(this),
                        onDownloadComplete = function(downloadResult) {
                            return shellVM.wait.stop(), WinJS.Promise.as(downloadResult)
                        }.bind(this);
                    return md.showAsync().then(function() {
                            return downloadClicked ? shellVM.wait.startAsync(AppMagic.AuthoringStrings.InstallerDownloadingTitle, options).then(onWaitDialogComplete).then(onDownloadComplete).then(null, onError) : WinJS.Promise.as(Microsoft.AppMagic.Authoring.DownloadResult.canceled)
                        }.bind(this))
                }, checkAndDownloadInstaller: function(isPublishClicked) {
                    return this._shouldDownloadInstallerAsync(isPublishClicked).then(function(res) {
                            return downloadAlreadySucceeded = !res, res ? this._downloadInstallerAsync() : WinJS.Promise.as(Microsoft.AppMagic.Authoring.DownloadResult.succeeded)
                        }.bind(this)).then(function(downloadResult) {
                            return downloadResult === Microsoft.AppMagic.Authoring.DownloadResult.canceled ? !1 : downloadResult === Microsoft.AppMagic.Authoring.DownloadResult.succeeded ? (downloadAlreadySucceeded || AppMagic.AuthoringTool.PlatformHelpers.showNotification(AppMagic.AuthoringStrings.InstallerDownloadSuccessTitle, AppMagic.AuthoringStrings.InstallerDownloadSuccessMessage), !0) : isPublishClicked && downloadResult === Microsoft.AppMagic.Authoring.DownloadResult.useLastKnownGood ? this._showInstallerErrorDialog() : (AppMagic.AuthoringTool.PlatformHelpers.showMessage(AppMagic.AuthoringStrings.InstallerDownloadErrorTitle, AppMagic.AuthoringStrings.InstallerDownloadErrorMessage), !1)
                        }.bind(this))
                }, _showInstallerErrorDialog: function() {
                    var continuePublish = !1,
                        md = new AppMagic.Popups.MessageDialog(AppMagic.AuthoringStrings.InstallerDownloadErrorCanContinueMessage, AppMagic.AuthoringStrings.InstallerUpdateErrorTitle);
                    return md.addButton(AppMagic.AuthoringStrings.Publish, function() {
                            continuePublish = !0
                        }.bind(this)), md.addButton(AppMagic.Strings.Cancel), md.showAsync().then(function() {
                                return continuePublish
                            }.bind(this))
                }
        }, {});
    WinJS.Class.mix(Context, WinJS.Utilities.eventMixin);
    WinJS.Namespace.define("AppMagic", {context: new Context});
    AppMagic.context._createDocument()
})(Windows);