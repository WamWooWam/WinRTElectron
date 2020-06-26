//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(Platform) {"use strict";
    var Util = AppMagic.Utility,
        AppBarViewModel = WinJS.Class.derive(Util.Disposable, function AppBarViewModel_ctor(doc, entityManager, selectionManager, controlManager) {
            this._document = doc;
            this._entityManager = entityManager;
            this._selectionManager = selectionManager;
            this._controlManager = controlManager;
            this._fileFlyoutVisible = ko.observable(!1);
            Util.Disposable.call(this);
            this.trackAnonymous(this._fileFlyoutVisible.subscribe(function(newValue) {
                newValue && topAppBarFileFlyout.winControl.show(cmdFile, "bottom", "left")
            }, this))
        }, {
            _document: null, _entityManager: null, _fileFlyoutVisible: null, _appbarShowPromise: null, _appbarShowPromiseComplete: null, _selectionManager: null, _controlManager: null, fileFlyoutVisible: {
                    get: function() {
                        this._fileFlyoutVisible()
                    }, set: function(value) {
                            this._fileFlyoutVisible(value)
                        }
                }, showFileFlyout: function() {
                    this._showAppBarAsync().then(function() {
                        this._fileFlyoutVisible(!0)
                    }.bind(this), function(){})
                }, notifyAppBarShown: function() {
                    this._appbarShowPromise && (this._appbarShowPromiseComplete(), this._appbarShowPromise = null, this._appbarShowPromiseComplete = null)
                }, _showAppBarAsync: function() {
                    return topAppBar.winControl.hidden ? (this._appbarShowPromise && this._appbarShowPromise.cancel(), this._appbarShowPromise = new WinJS.Promise(function(complete) {
                            this._appbarShowPromiseComplete = complete
                        }.bind(this)), topAppBar.winControl.show(), this._appbarShowPromise) : WinJS.Promise.as()
                }, performNewOrOpen: function(isNew, file) {
                    var dialog = new AppMagic.Popups.MessageDialog(AppMagic.AuthoringStrings.NewSaveFirstText, AppMagic.AuthoringStrings.AppName);
                    dialog.addButton(AppMagic.AuthoringStrings.Save, null, "s");
                    dialog.addButton(AppMagic.AuthoringStrings.DontSave, null, "n");
                    dialog.addButton(AppMagic.Strings.Cancel);
                    dialog.defaultCommandIndex = 0;
                    dialog.cancelCommandIndex = 2;
                    dialog.showAsync().then(function(dialogValue) {
                        switch (dialogValue) {
                            case AppMagic.AuthoringStrings.Save:
                                AppMagic.context.save().then(function(success) {
                                    success && (isNew ? this.newAction() : file ? AppMagic.context.open(file) : AppMagic.context.openFilePicker())
                                }.bind(this));
                                break;
                            case AppMagic.AuthoringStrings.DontSave:
                                isNew ? this.newAction() : file ? AppMagic.context.open(file) : AppMagic.context.openFilePicker();
                                break;
                            case AppMagic.Strings.Cancel:
                                break;
                            default:
                                break
                        }
                    }.bind(this))
                }, newAction: function() {
                    AppMagic.context.reset()
                }, addScreen: function(screenName) {
                    this._document.undoManager.createGroup("Add Screen");
                    try {
                        var screenTemplate = Microsoft.AppMagic.Authoring.ScreenTemplateFactory.create();
                        this._document.createControl(screenName, screenTemplate);
                        var screenViewModel = this._entityManager.getScreenByName(screenName);
                        AppMagic.AuthoringTool.Utility.setInitialScreenRules(screenViewModel);
                        screenViewModel.notifyCreationComplete();
                        Microsoft.AppMagic.Common.TelemetrySession.telemetry.logAddScreen()
                    }
                    finally {
                        this._document.undoManager.closeGroup()
                    }
                }, handleAddScreenClicked: function() {
                    for (var index = this.screens.length + 1, screenName = Core.Utility.formatString(AppMagic.AuthoringStrings.ScreenNamingFormat, index.toString()); !this._document.isNameAvailable(screenName); )
                        index++,
                        screenName = Core.Utility.formatString(AppMagic.AuthoringStrings.ScreenNamingFormat, index.toString());
                    this.addScreen(screenName)
                }, _createScreenWithDuplicateName: function(currentScreenName) {
                    var screenName = this._document.createUniqueName(currentScreenName);
                    this.addScreen(screenName);
                    var screenViewModel = this._entityManager.getScreenByName(screenName);
                    return screenViewModel
                }, handleRemoveScreenClicked: function(screenToRemove) {
                    AppMagic.context.documentViewModel.removeScreen(screenToRemove);
                    Microsoft.AppMagic.Common.TelemetrySession.telemetry.logDeleteScreen()
                }, screens: {get: function() {
                        return this._entityManager.screens()
                    }}, removeScreenVisible: {get: function() {
                        return this._entityManager.screens().length > 1
                    }}, visible: {get: function() {
                        return !topAppBar.winControl.hidden
                    }}, handleScreenClicked: function(selectedScreen) {
                    this._selectionManager.selectScreen(selectedScreen)
                }, currentScreen: {get: function() {
                        return this._selectionManager.screen
                    }}, handleDrop: function(screenToMoveName, targetScreen) {
                    var screenToMove = this._getScreenByName(screenToMoveName),
                        screenAfter = this._findScreenAfter(screenToMove);
                    this._reorderScreen(screenToMove, targetScreen, screenAfter)
                }, _reorderScreenByName: function(screenToMoveName, targetBeforeName, srcBeforeName) {
                    var screenToMove = this._getScreenByName(screenToMoveName),
                        targetBefore = this._getScreenByName(targetBeforeName),
                        srcBefore = this._getScreenByName(srcBeforeName);
                    this._reorderScreen(screenToMove, targetBefore, srcBefore)
                }, _reorderScreen: function(screenToMove, targetBefore, srcBefore) {
                    this._document.undoManager.createGroup("Move Screen");
                    try {
                        this._entityManager.reorderScreens(screenToMove, targetBefore);
                        var screenToMoveName = this._getScreenName(screenToMove),
                            srcBeforeName = this._getScreenName(srcBefore),
                            targetBeforeName = this._getScreenName(targetBefore);
                        this._document.undoManager.add(function() {
                            this._reorderScreenByName(screenToMoveName, srcBeforeName, targetBeforeName)
                        }.bind(this))
                    }
                    finally {
                        this._document.undoManager.closeGroup()
                    }
                }, _getScreenByName: function(screenName) {
                    return screenName !== null ? this._entityManager.getScreenByName(screenName) : null
                }, _getScreenName: function(screenViewModel) {
                    return screenViewModel !== null ? screenViewModel.name : null
                }, _findScreenAfter: function(targetScreen) {
                    var screens = this.screens,
                        index = screens.indexOf(targetScreen);
                    return index === screens.length - 1 ? null : screens[index + 1]
                }, createContextMenu: function(currentScreen) {
                    var index = this.screens.indexOf(currentScreen);
                    var screensLength = this.screens.length;
                    var menu = new Platform.UI.Popups.PopupMenu;
                    switch (index) {
                        case 0:
                            return this.screens.length > 1 && menu.commands.append(new Platform.UI.Popups.UICommand(AppMagic.AuthoringStrings.MoveRight, this._moveScreenRightOrLeft.bind(this, currentScreen, !0))), menu.commands.append(new Platform.UI.Popups.UICommand(AppMagic.AuthoringStrings.DuplicateScreen, this._duplicateScreenAsync.bind(this, currentScreen))), menu;
                        case screensLength - 1:
                            return menu.commands.append(new Platform.UI.Popups.UICommand(AppMagic.AuthoringStrings.MoveLeft, this._moveScreenRightOrLeft.bind(this, currentScreen, !1))), menu.commands.append(new Platform.UI.Popups.UICommand(AppMagic.AuthoringStrings.DuplicateScreen, this._duplicateScreenAsync.bind(this, currentScreen))), menu;
                        default:
                            return menu.commands.append(new Platform.UI.Popups.UICommand(AppMagic.AuthoringStrings.MoveRight, this._moveScreenRightOrLeft.bind(this, currentScreen, !0))), menu.commands.append(new Platform.UI.Popups.UICommand(AppMagic.AuthoringStrings.MoveLeft, this._moveScreenRightOrLeft.bind(this, currentScreen, !1))), menu.commands.append(new Platform.UI.Popups.UICommand(AppMagic.AuthoringStrings.DuplicateScreen, this._duplicateScreenAsync.bind(this, currentScreen))), menu
                    }
                }, _moveScreenRightOrLeft: function(currentScreen, isMoveRight) {
                    var screens = this.screens,
                        screenToMove,
                        beforeScreen,
                        undoGroupText,
                        index = screens.indexOf(currentScreen);
                    isMoveRight ? (screenToMove = screens[index + 1], beforeScreen = currentScreen, undoGroupText = "Move Screen Right") : (screenToMove = currentScreen, beforeScreen = screens[index - 1], undoGroupText = "Move Screen Left");
                    var screenAfter = this._findScreenAfter(screenToMove);
                    this._reorderScreen(screenToMove, beforeScreen, screenAfter)
                }, _duplicateScreenAsync: function(currentScreen) {
                    this._document.undoManager.createGroup("Duplicate Screen");
                    var entityDuplicator = new Microsoft.AppMagic.Authoring.EntityDuplicator(this._document);
                    var result = entityDuplicator.duplicateControl(currentScreen.name);
                    var controlNames = result.allPastedControlNames;
                    return this._waitForControlCreation(controlNames).then(function() {
                            return result.addRulesForDuplicatedControls()
                        }).then(function() {
                            this._refreshRulesForNestedControls(controlNames);
                            this._notifyVisualsCreationComplete(controlNames);
                            this._document.undoManager.closeGroup()
                        }.bind(this), function() {
                            this._document.undoManager.closeGroup()
                        }.bind(this))
                }, _waitForControlCreation: function(controls) {
                    for (var promises = [], it = controls.first(); it.hasCurrent; it.moveNext())
                        promises.push(this._controlManager.waitForControlCreation(it.current));
                    return WinJS.Promise.join(promises)
                }, _refreshRulesForNestedControls: function(controlNames) {
                    for (var it = controlNames.first(); it.hasCurrent; it.moveNext()) {
                        var entity = this._entityManager.getEntityByName(it.current);
                        entity.updateRules()
                    }
                }, _notifyVisualsCreationComplete: function(controlNames) {
                    for (var visuals = [], it = controlNames.first(); it.hasCurrent; it.moveNext())
                        visuals.push(this._entityManager.tryGetVisualByName(it.current));
                    this._entityManager.notifyVisualsCreationComplete(visuals)
                }
        }, {});
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {AppBarViewModel: AppBarViewModel})
})(Windows);