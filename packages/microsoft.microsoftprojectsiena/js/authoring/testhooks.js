//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    function getDataConnectionViewModel(documentViewModel) {
        for (var dataConnectionsViewModel, bs = documentViewModel.backStage, i = 0, len = bs._settings.length; i < len; i++)
            if (bs._settings[i].title === AppMagic.AuthoringStrings.DataSources) {
                dataConnectionsViewModel = bs._settings[i].viewModel;
                break
            }
        return dataConnectionsViewModel
    }
    var TestHooks = WinJS.Class.define(function TestHooks_ctor(){}, {
            _entityNameFactory: null, _publishlogo: null, entityNameFactory: {get: function() {
                        return this._entityNameFactory === null && (this._entityNameFactory = new TestEntityNameFactory(this.context.documentViewModel.controlGallery._entityNameFactory)), this._entityNameFactory
                    }}, context: {get: function() {
                        return AppMagic.context
                    }}, document: {get: function() {
                        return AppMagic.context.document
                    }}, documentId: {get: function() {
                        return AppMagic.context.document.properties.fileID
                    }}, expandAllRuleCategories: function() {
                    for (var configuration = this.context.documentViewModel.configuration, collapsedCategories = configuration._collapsedCategories, i = 0, len = collapsedCategories.length; i < len; i++)
                        collapsedCategories[i](!1)
                }, setPrimaryLanguageOverride: function(locale) {
                    Windows.Globalization.ApplicationLanguages.primaryLanguageOverride = locale
                }, addRule: function(propertyName, rhs) {
                    var currentVisual = AppMagic.context.documentViewModel.selection.singleVisualOrScreen;
                    currentVisual.setRule(propertyName, rhs)
                }, loadDocumentAsync: function(docFile) {
                    var folder = Windows.Storage.KnownFolders.picturesLibrary;
                    return folder.getFileAsync(docFile).then(function(file) {
                            file && this.context.open(file)
                        }.bind(this)).done()
                }, loadFromString: function(input) {
                    this.context._loadContext(Microsoft.AppMagic.Authoring.Document.loadFromString(input), null, !1)
                }, saveToString: function() {
                    return this.document.saveToString()
                }, skipTour: function() {
                    this.context.shellViewModel.firstRun.handleSkipTour()
                }, addImportControlAndImportData: function(file) {
                    var importControl = null,
                        pathLocation = Windows.Storage.ApplicationData.current.localFolder,
                        result = Microsoft.AppMagic.Authoring.DocumentFactory.templateStore.tryGetTemplate("ImportTemplate");
                    AppMagic.context.documentViewModel.controlGallery.addControlAsyncAndNotifyCompletion("Import", result.template, !0).then(function(control) {
                        return AppMagic.context.documentViewModel.controlManager.waitForControlCreation(control.name)
                    }).then(function(control) {
                        return importControl = control, pathLocation.getFileAsync(file)
                    }).then(function(zipFile) {
                        return importControl.OpenAjax._control._doImport(zipFile, importControl.OpenAjax.globalControlContext)
                    })
                }, disableToastNotifications: function() {
                    AppMagic.AuthoringTool.PlatformHelpers.showNotification = function(title, content){}
                }, disablePromptReuseCredentials: function() {
                    AppMagic.AuthoringTool.Runtime.promptReuseCredentials = function() {
                        return WinJS.Promise.wrap()
                    }
                }, disableCorpNetConnection: function() {
                    AppMagic.ConnectionStatusProvider.instance.getCorpNetConnectionStatus = function() {
                        return CorpNetConnectionStatus.Disconnected
                    };
                    AppMagic.AuthoringTool.Runtime._azureController = null;
                    AppMagic.AuthoringTool.Runtime._azureConnectionManager = null;
                    AppMagic.AuthoringTool.Runtime._createAzureConnectionManager()
                }, setAzureAppInfo: function(appInfoJson) {
                    AppMagic.AuthoringTool.Runtime.azureConnectionManager.clientAppInfo = JSON.parse(appInfoJson);
                    AppMagic.AuthoringTool.Runtime.azureConnectionManager._isUsingDefaultValues = !1
                }, getErrors: function() {
                    for (var returnError = "", errorIter = this.document.errors.first(); errorIter.hasCurrent; ) {
                        var currErr = errorIter.current;
                        returnError += Core.Utility.formatString("[Document] {0}!{1}: {2}\n", currErr.parent, currErr.entity, currErr.message);
                        errorIter.moveNext()
                    }
                    return returnError
                }, getRuntimeErrors: function() {
                    for (var returnError = "", iter = document.testHooks.document.controls.first(); iter.hasCurrent; iter.moveNext()) {
                        var entityName = iter.current.name,
                            entity = this.context.documentViewModel.getEntityByName(entityName);
                        Object.keys(entity.propertyRuleMap).forEach(function(propKey) {
                            var rule = entity.propertyRuleMap[propKey];
                            if (rule.hasRuntimeErrors) {
                                var runtimeErrors = rule.runtimeErrors;
                                runtimeErrors.forEach(function(runtimeError) {
                                    returnError += Core.Utility.formatString("[Runtime] {0}!{1}: {2}\n", entityName, propKey, runtimeError.message)
                                })
                            }
                        })
                    }
                    return returnError
                }, isVisual: function(elementId) {
                    try {
                        var visual = AppMagic.context.documentViewModel.getVisualByName(elementId)
                    }
                    catch(e) {
                        return !1
                    }
                    return visual === null ? !1 : !0
                }, isScreenName: function(screenName) {
                    for (var i = 0, len = document.testHooks.context.documentViewModel.screens.length; i < len; i++)
                        if (document.testHooks.context.documentViewModel.screens[i].name === screenName)
                            return !0;
                    return !1
                }, runCommandOnYoutubeWebview: function(elementId, scriptName, commandName) {
                    var youtubeElement = AppMagic.context.documentViewModel.getVisualByName(elementId);
                    var webview = youtubeElement.controlElement.getElementsByClassName("appmagic-video-playback-iframe")[0];
                    webview.invokeScriptAsync(scriptName, commandName).start()
                }, publish: function(applicationName, copyLocalResources, publishAsWindowsApp) {
                    this._setPublishDefaults().then(function() {
                        var publishTarget = this._getPublishTargetByName(publishAsWindowsApp ? AppMagic.Constants.Publish.WindowsPublishKey : AppMagic.Constants.Publish.WebPublishKey);
                        var context = new Microsoft.AppMagic.Authoring.PublishContext(applicationName, !1, Windows.Storage.ApplicationData.current.localFolder, this._publishlogo, Microsoft.AppMagic.Authoring.PublishForegroundColor.light, Microsoft.AppMagic.Common.LocalizationHelper.convertToLocaleSpecific("RGBA(0,127,0,1)", null), 100, 100, 100, 100, 200, !1, copyLocalResources, publishTarget, AppMagic.Utility.getLocalFilesReferenced(), !0, !0),
                            result = !0;
                        copyLocalResources && (result = AppMagic.AuthoringTool.Runtime.createLocalCopyOfDataSources());
                        result && this.context.publish(context)
                    }.bind(this)).done()
                }, _getPublishTargetByName: function(publishDisplayName) {
                    for (var publishTargets = (new Microsoft.AppMagic.Authoring.Publish.PublishFactory).publishTargets, i = 0, len = publishTargets.length; i < len; i++)
                        if (publishTargets[i].key.indexOf(publishDisplayName) >= 0)
                            return publishTargets[i];
                    return null
                }, importExcelData: function(fileName, tableName, useAppInstallationFolder) {
                    tableName = tableName || "";
                    useAppInstallationFolder = useAppInstallationFolder || !1;
                    var pathLocation = Windows.Storage.ApplicationData.current.localFolder,
                        tables = [];
                    useAppInstallationFolder && (pathLocation = Windows.ApplicationModel.Package.current.installedLocation);
                    var excelFile;
                    return pathLocation.getFileAsync(fileName).then(function(file) {
                            var dataImportTimeout = AppMagic.AuthoringTool.Constants.DataImportTimeout;
                            return excelFile = file, Microsoft.AppMagic.Authoring.Importers.StaticDataImport.getExcelTables(excelFile, dataImportTimeout).then(function(getResult) {
                                    for (var iterTables = getResult.tableNames.first(); iterTables.hasCurrent; iterTables.moveNext()) {
                                        var table = iterTables.current;
                                        (tableName === "" || tableName === table) && tables.push(table)
                                    }
                                    var dataConnectionsViewModel = getDataConnectionViewModel(AppMagic.context.documentViewModel),
                                        connMan = dataConnectionsViewModel._connectionManager;
                                    return connMan.notifyShow(), connMan.importStatic("excel", fileName, excelFile, tables).then(function(result) {
                                            return connMan.notifyClickBack(), WinJS.Promise.wrap(result)
                                        }, function(error) {
                                            connMan.notifyClickBack();
                                            throw error;
                                        })
                                })
                        })
                }, addFileToResourceManagerAsync: function(relativeFileName) {
                    Windows.Storage.ApplicationData.current.localFolder.getFileAsync(relativeFileName).then(function(file) {
                        return this.document.resourceManager.createResourceAsync(file, !1)
                    }.bind(this)).then(function(resource) {
                        return resource.name
                    }.bind(this))
                }, getResourceCount: function() {
                    for (var resourceCount = 0, resourceIter = this.document.resourceManager.resources.first(); resourceIter.hasCurrent; )
                        resourceCount++,
                        resourceIter.moveNext();
                    return resourceCount
                }, localFolder: {get: function() {
                        return Windows.Storage.ApplicationData.current.localFolder.path
                    }}, language: {get: function() {
                        return AppMagic.Globalization.language
                    }}, decimalSeparator: {get: function() {
                        return Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleDecimalSeparator
                    }}, listSeparator: {get: function() {
                        return Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleListSeparator
                    }}, chainingOperator: {get: function() {
                        return Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleChainingOperator
                    }}, appInstallationFolder: {get: function() {
                        return Windows.ApplicationModel.Package.current.installedLocation.path
                    }}, dataTablesCount: {get: function() {
                        return Object.keys(AppMagic.AuthoringTool.Runtime._data).length
                    }}, dataServicesCount: {get: function() {
                        return Object.keys(AppMagic.AuthoringTool.Runtime._importedServices).length
                    }}, deleteDataSource: function(source, id, sourceName) {
                    var dataConnectionsViewModel = getDataConnectionViewModel(AppMagic.context.documentViewModel);
                    dataConnectionsViewModel.notifyRemoveDataSource(sourceName)
                }, deleteRestConfigDataSource: function(serviceName) {
                    var dataConnectionsViewModel = getDataConnectionViewModel(AppMagic.context.documentViewModel);
                    dataConnectionsViewModel.removeImportedConnection(serviceName)
                }, setServiceCallsTimeout: function(timeout) {
                    AppMagic.RuntimeBase._timeoutMillisecondsServiceFunctionCall = timeout * 1e3
                }, createAzureEntity: function(tableName, searchUrl, searchAppKey) {
                    var dataConnectionsViewModel = getDataConnectionViewModel(AppMagic.context.documentViewModel),
                        connMan = dataConnectionsViewModel._connectionManager;
                    connMan._importServiceData("azuremobile", {
                        type: "table", list: [{
                                    suggestedName: tableName, configuration: {
                                            siteUri: searchUrl, appKey: searchAppKey, tableName: tableName
                                        }
                                }]
                    })
                }, _getRestViewModel: function() {
                    var dataConnectionsViewModel = getDataConnectionViewModel(AppMagic.context.documentViewModel),
                        connTypes = dataConnectionsViewModel.connectionTypes;
                    var restVM = null;
                    return connTypes.some(function(connType) {
                            return connType.id === AppMagic.Constants.DataConnections.Types.REST ? (restVM = connType._vm, !0) : !1
                        }), restVM
                }, createRestEntity: function(restUrl) {
                    var restVM = this._getRestViewModel();
                    restVM.endpointUrl = restUrl;
                    restVM.addDataSource()
                }, createRestConfigDataSource: function(configPath) {
                    var restVM = this._getRestViewModel(),
                        pathLocation = Windows.Storage.ApplicationData.current.localFolder;
                    return pathLocation.getFileAsync(configPath).then(function(file) {
                            file && restVM._afterPickedFile(file)
                        })
                }, createSharePointEntity: function(listName, siteUri) {
                    var dataConnectionsViewModel = getDataConnectionViewModel(AppMagic.context.documentViewModel),
                        connMan = dataConnectionsViewModel._connectionManager;
                    connMan._importServiceData("sharepoint", {
                        type: "list", list: [{
                                    suggestedName: listName, configuration: {
                                            siteUri: siteUri, listName: listName
                                        }
                                }]
                    })
                }, generateUIAutomation: function(filename) {
                    var squigglyCheckVariableName = "squigglyCheck",
                        fileBody = function() {
                            var content = [];
                            return {
                                    addLine: function(line) {
                                        line === null || line === "" ? content.push("") : content.push("            " + line)
                                    }, addLines: function(lines) {
                                            lines.forEach(function(line) {
                                                line === null || line === "" ? content.push("") : content.push("            " + line)
                                            })
                                        }, getLines: function() {
                                            return content
                                        }
                                }
                        }();
                    function getPositiveHash(str) {
                        for (var hash = 0, strIndex = 0; strIndex < str.length; strIndex++)
                            hash += str.charCodeAt(strIndex);
                        return hash |= 0, hash >>> 0
                    }
                    function parseControlName(input) {
                        return AppMagic.Utility.replaceAllNonAlphanumerics(input, "_", !0) + "_" + getPositiveHash(input).toString()
                    }
                    function formatCreateControl(control) {
                        var controlType = control.template.className.split(".").pop(),
                            parsedControlName = parseControlName(control.name),
                            nestedVisualLine = "",
                            formattedCreateControl;
                        if (control.parent.parent === null)
                            formattedCreateControl = "_canvas.Add" + (controlType === "GalleryControl" ? "Gallery" : controlType) + "Visual()";
                        else {
                            var parsedParentName = parseControlName(control.parent.name);
                            if (controlType === "GalleryControl") {
                                var nestedVisualVariableName = parsedParentName + "_" + parsedControlName;
                                nestedVisualLine = "var " + nestedVisualVariableName + " = _canvas.AddNestedVisual(" + parsedParentName + ", VisualTypes.GalleryHorizontal);";
                                formattedCreateControl = "new GalleryLfm(new GalleryPom(" + nestedVisualVariableName + ".ObjectModel.HTMLElement, " + nestedVisualVariableName + ".ObjectModel.VisualElement))"
                            }
                            else
                                formattedCreateControl = "_canvas.AddNestedVisual(" + parsedParentName + ", VisualTypes." + controlType + ")"
                        }
                        var createControlLines = [];
                        return nestedVisualLine !== "" && createControlLines.push(nestedVisualLine), createControlLines.push("var " + parsedControlName + " = " + formattedCreateControl + ";"), createControlLines
                    }
                    function formatAddRule(variableName, propertyName, value) {
                        return variableName + '.AddRule("' + propertyName + " = " + AppMagic.Utility.replaceAllDoubleQuotes(value, '\\"') + '", false, ' + squigglyCheckVariableName + ", UIActionType.API);"
                    }
                    function generateRules(control) {
                        var controlVariableName = control.parent === null ? "_canvas" : parseControlName(control.name),
                            rulesToAdd = [],
                            ruleCategories = [Microsoft.AppMagic.Authoring.PropertyRuleCategory.data, Microsoft.AppMagic.Authoring.PropertyRuleCategory.design, Microsoft.AppMagic.Authoring.PropertyRuleCategory.behavior];
                        if (ruleCategories.forEach(function(ruleCategory) {
                            for (var rulesIter = control.getRules(ruleCategory).first(); rulesIter.hasCurrent; )
                                rulesIter.current.key !== "maximumHeight" && rulesIter.current.key !== "maximumWidth" && rulesIter.current.key !== "minimumHeight" && rulesIter.current.key !== "minimumWidth" && rulesIter.current.key !== "ZIndex" && rulesToAdd.push(rulesIter.current),
                                rulesIter.moveNext()
                        }), control.template.className.split(".").pop() === "GalleryControl") {
                            for (var templateControl = null, galleryIter = control.children.first(); galleryIter.hasCurrent; ) {
                                if (galleryIter.current.template.className.split(".").pop() === "Template") {
                                    templateControl = galleryIter.current;
                                    break
                                }
                                galleryIter.moveNext()
                            }
                            templateControl !== null && ruleCategories.forEach(function(ruleCategory) {
                                for (var rulesIter = templateControl.getRules(ruleCategory).first(); rulesIter.hasCurrent; )
                                    rulesToAdd.push(rulesIter.current),
                                    rulesIter.moveNext()
                            })
                        }
                        rulesToAdd.sort(function(a, b) {
                            return a.key < b.key ? -1 : a.key > b.key ? 1 : 0
                        });
                        rulesToAdd.forEach(function(ruletoAdd) {
                            fileBody.addLine(formatAddRule(controlVariableName, ruletoAdd.key, ruletoAdd.value.description))
                        })
                    }
                    function generateControls(parentControl) {
                        for (var parentChildren = [], parentChildrenIter = parentControl.children.first(); parentChildrenIter.hasCurrent; )
                            parentChildren.push(parentChildrenIter.current),
                            parentChildrenIter.moveNext();
                        parentChildren.sort(function(a, b) {
                            return b.zindex - a.zindex
                        });
                        parentChildren.forEach(function(currentControl) {
                            if (currentControl.template.className.split(".").pop() !== "Template") {
                                fileBody.addLine('_app.ObjectModel.AppMagicTestHook.setNextVisualName("' + currentControl.name + '");');
                                var createControlLines = formatCreateControl(currentControl);
                                fileBody.addLines(createControlLines);
                                generateRules(currentControl);
                                fileBody.addLine("");
                                generateControls(currentControl)
                            }
                        })
                    }
                    var createdFilename = "ScenarioTests.cs";
                    return filename !== null && typeof filename == "string" && filename !== "" && (createdFilename = filename, createdFilename.split(".").pop().toUpperCase() !== "CS" && (createdFilename += ".cs")), Windows.Storage.ApplicationData.current.localFolder.createFileAsync(createdFilename, Windows.Storage.CreationCollisionOption.replaceExisting).then(function(outputFile) {
                            for (var fileHeader = ["//------------------------------------------------------------------------------", '// <copyright file="' + createdFilename + '" company="Microsoft Corporation">', "//     Copyright (c) Microsoft Corporation.  All rights reserved.", "// <\/copyright>", "//------------------------------------------------------------------------------", "using AppMagicTestCommon;", "using AppMagicTestFramework;", "using AppMagicTestFramework.Lfm.Controls;", "using AppMagicTestFramework.Pom.Controls;", "using Microsoft.VisualStudio.TestTools.UnitTesting;", "", "namespace AppMagic.Test.Lab.AppCreator", "{", "    [TestClass]", '    [DeploymentItem("TestData", "TestData")]', "    public sealed class ScenarioTests : AppMagicBaseTest", "    {", "        [ClassInitialize]", "        public static void ClassInit(TestContext testContext)", "        {", "            // Use the Clipboard to copy and paste the rules since typing out long rules can take a really long time.", "            AppMagicTestFramework.Helpers.UIHelper.UseClipboardToSetText = true;", "", "            // Disable selecting the control each time a rule is added. This saves time during execution.", "            AppMagicTestFramework.Lfm.ControlLfm.SelectControlBeforeAddingRule = false;", "        }", "", "        [ClassCleanup]", "        public static void ClassCleanup()", "        {", "            // Set the UIHelper back to using regular text input.", "            AppMagicTestFramework.Helpers.UIHelper.UseClipboardToSetText = false;", "", "            // Enable selecting the control each time a rule is added.", "            AppMagicTestFramework.Lfm.ControlLfm.SelectControlBeforeAddingRule = true;", "        }", "", "        [TestMethod]", "        [Timeout(3600000)]", "        public void ScenarioTest()", "        {", "            // Use a test hook that allows specifying the name of the next created visual.", "            _app.ObjectModel.AppMagicTestHook.useVisualsManualNaming(null);", ""], fileFooter = ["        }", "    }", "}"], restConfigIter = document.testHooks.context.document.getServices().first(); restConfigIter.hasCurrent; )
                                restConfigIter.current.hasConfig && fileBody.addLine("// TODO: Add REST Config data source: " + restConfigIter.current.serviceNamespace),
                                restConfigIter.moveNext();
                            for (var serviceDataSourcesLines = [], dataSourcesIter = document.testHooks.context.document.dataSources.first(); dataSourcesIter.hasCurrent; ) {
                                if (dataSourcesIter.current.kind === Microsoft.AppMagic.Authoring.DataSourceKind.static)
                                    dataSourcesIter.current.isSampleData || fileBody.addLine("// TODO: Add Static data source: " + dataSourcesIter.current.name);
                                else if (dataSourcesIter.current.kind === Microsoft.AppMagic.Authoring.DataSourceKind.service) {
                                    var serviceName = dataSourcesIter.current.serviceName.toUpperCase(),
                                        serviceDataName = dataSourcesIter.current.name;
                                    switch (serviceName) {
                                        case"AZUREMOBILE":
                                            serviceDataSourcesLines.push('_app.AddDataSource("' + serviceDataName + '", "' + serviceDataName + '");');
                                            break;
                                        case"SHAREPOINT":
                                            var sharePointConfig = JSON.parse(dataSourcesIter.current.configuration);
                                            serviceDataSourcesLines.push('_app.AddSharePointDataSource("' + sharePointConfig.listName + '", "' + sharePointConfig.siteUri + '");');
                                            break;
                                        default:
                                            fileBody.addLine("// TODO: Add Service data source: " + serviceName + " - " + serviceDataName);
                                            break
                                    }
                                }
                                dataSourcesIter.moveNext()
                            }
                            fileBody.addLine("");
                            serviceDataSourcesLines.length > 0 && (fileBody.addLines(serviceDataSourcesLines), fileBody.addLine(""));
                            fileBody.addLine("// Disable squiggly checks since we may be " + "referencing resources that are not created yet.");
                            fileBody.addLine("bool " + squigglyCheckVariableName + " = false;");
                            fileBody.addLine("");
                            for (var allScreens = [], allControlsIter = document.testHooks.document.controls.first(); allControlsIter.hasCurrent; allControlsIter.moveNext())
                                allControlsIter.current.template.className === AppMagic.Constants.ScreenClass && allScreens.push(allControlsIter.current);
                            allScreens.sort(function(a, b) {
                                return a.index - b.index
                            });
                            fileBody.addLine("// Create and name all the screens first so Navigate actions are valid.");
                            var firstScreen = !0;
                            allScreens.forEach(function(eachScreen) {
                                firstScreen ? firstScreen = !1 : fileBody.addLine("_app.AddScreen();");
                                fileBody.addLine('_canvas.RenameScreen("' + eachScreen.name + '");')
                            });
                            fileBody.addLine("");
                            allScreens.forEach(function(eachScreen, screenIndex) {
                                fileBody.addLine("//");
                                fileBody.addLine("// Set the rules for the '" + eachScreen.name + "' screen and create all nested controls.");
                                fileBody.addLine("//");
                                fileBody.addLine("_app.SelectScreen(" + screenIndex.toString() + ", UIActionType.API);");
                                generateRules(eachScreen);
                                fileBody.addLine("");
                                generateControls(eachScreen)
                            });
                            fileBody.addLine('SaveReopenDocument("ScenarioTestsApp.siena");');
                            fileBody.addLine("");
                            fileBody.addLine('BasicPublishValidation("ScenarioTestsApp");');
                            var temp = fileBody.getLines();
                            return Windows.Storage.FileIO.writeLinesAsync(outputFile, fileHeader.concat(fileBody.getLines(), fileFooter))
                        }).done(function(){}), "Sucessfully created file: " + Windows.Storage.ApplicationData.current.localFolder.path + "\\" + createdFilename
                }, useVisualsManualNaming: function() {
                    this.context.documentViewModel.controlGallery._entityNameFactory = this.entityNameFactory
                }, setNextVisualName: function(nextVisualName) {
                    this.entityNameFactory.nextName = nextVisualName
                }, _setPublishDefaults: function() {
                    var app = Windows.ApplicationModel.Package.current.installedLocation;
                    return app.getFileAsync(AppMagic.AuthoringTool.Constants.PublishDefaultLogoFile).then(function(logofile) {
                            this._publishlogo = logofile
                        }.bind(this))
                }
        }, {}),
        TestEntityNameFactory = WinJS.Class.define(function TestEntityNameFactory_ctor(innerNameFactory) {
            this._inner = innerNameFactory
        }, {
            _inner: null, _nextName: "", getName: function(baseName, generateUniqueName) {
                    if (this._nextName === "")
                        return this._inner.getName(baseName, generateUniqueName);
                    else {
                        var nextName = this._nextName;
                        return this._nextName = "", nextName
                    }
                }, nextName: {
                    get: function() {
                        return this._nextName
                    }, set: function(value) {
                            this._nextName = value
                        }
                }
        });
    WinJS.Application.addEventListener("ready", function() {
        document.testHooks = new TestHooks
    })
})();