//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var EntityDropDownViewModel = WinJS.Class.derive(AppMagic.Utility.Disposable, function EntityDropDownViewModel_ctor(doc, selectionManager, canvasManager, entityManager, screensOnly, isPreview) {
            AppMagic.Utility.Disposable.call(this);
            this._selectionManager = selectionManager;
            this._visualDropDownVisible = ko.observable(!1);
            this.track("_entityNameTextBox", new AppMagic.AuthoringTool.ViewModels.EntityNameTextBox(doc, selectionManager, entityManager, screensOnly));
            this._screensOnly = screensOnly;
            this._canvasManager = canvasManager;
            this._entityManager = entityManager;
            this._isPreview = isPreview
        }, {
            _selectionManager: null, _visualDropDownVisible: null, _entityNameTextBox: null, _canvasManager: null, _entityManager: null, _screensOnly: !1, _isPreview: null, visualDropDownVisible: {
                    get: function() {
                        return this._visualDropDownVisible()
                    }, set: function(value) {
                            this._visualDropDownVisible(value)
                        }
                }, handleArrowClick: function(viewModel, evt) {
                    evt.type === "keydown" ? evt.key === AppMagic.Constants.Keys.enter && this._visualDropDownVisible(!1) : this._visualDropDownVisible(!this._visualDropDownVisible())
                }, handleEscKey: function() {
                    return this._visualDropDownVisible() && !this._isPreview() ? (this._visualDropDownVisible(!1), !0) : !1
                }, handleUpKey: function() {
                    if (!this._isPreview())
                        if (this._screensOnly) {
                            if (this._visualDropDownVisible()) {
                                var prevScreenIndex = this._entityManager.screens().indexOf(this.currentScreen) - 1;
                                return prevScreenIndex < 0 ? !0 : (this._selectionManager.selectScreen(this._entityManager.screens()[prevScreenIndex]), !0)
                            }
                        }
                        else if (this._visualDropDownVisible()) {
                            var visuals = this._processVisualList();
                            return this._selectionManager.selectVisual(visuals.previousVisual), !0
                        }
                    return !1
                }, handleDownKey: function() {
                    if (!this._isPreview())
                        if (this._screensOnly) {
                            if (this._visualDropDownVisible()) {
                                var nextScreenIndex = this._entityManager.screens().indexOf(this.currentScreen) + 1;
                                return nextScreenIndex >= this._entityManager.screens().length ? !0 : (this._selectionManager.selectScreen(this._entityManager.screens()[nextScreenIndex]), !0)
                            }
                        }
                        else if (this._visualDropDownVisible()) {
                            var visuals = this._processVisualList();
                            return this._selectionManager.selectVisual(visuals.nextVisual), !0
                        }
                    return !1
                }, _processVisualList: function() {
                    var nextVisual = this.currentVisual,
                        prevVisual = this.currentVisual,
                        currentSelectedVisual = this.currentVisual,
                        selectedFound = !1,
                        done = !1,
                        visual = null,
                        processVisuals = function(visuals) {
                            for (var i = 0, len = visuals.length; i < len; i++) {
                                if (visual = visuals[i], prevVisual === null && nextVisual === null)
                                    return prevVisual = visual, !0;
                                if (selectedFound)
                                    return !0;
                                visual === currentSelectedVisual ? (selectedFound = !0, nextVisual = visual) : prevVisual = visual
                            }
                            return !1
                        };
                    return this.selectedNestedCanvas && (done = processVisuals(this.selectedNestedCanvas.visuals)), done || (done = processVisuals(this.selectedVisualChildVisuals)), done || processVisuals(this.selectedScreenCanvas.visuals), {
                                previousVisual: prevVisual, nextVisual: visual
                            }
                }, selectVisual: function(visual) {
                    this._selectionManager.selectVisual(visual);
                    this._visualDropDownVisible(!1)
                }, entityNameTextBox: {get: function() {
                        return this._entityNameTextBox
                    }}, currentVisual: {get: function() {
                        return this._selectionManager.canvasOwnerOrSingleVisual
                    }}, selectedNestedCanvas: {get: function() {
                        var canvas = this._selectionManager.canvas || this._canvasManager.selectedVisualsCommonCanvas;
                        return canvas === this._canvasManager.selectedScreenCanvas ? null : canvas
                    }}, selectedVisualChildVisuals: {get: function() {
                        for (var result = [], i = 0, len = this._selectionManager.visuals.length; i < len; i++)
                            for (var parentVisual = this._selectionManager.visuals[i], k = 0; k < parentVisual.childEntities().length; k++) {
                                var childEntity = parentVisual.childEntities()[k];
                                childEntity.positionable && result.push(childEntity)
                            }
                        return result.sort(function(a, b) {
                                return a.zindex - b.zindex
                            }), result
                    }}, selectedScreenCanvas: {get: function() {
                        return this._canvasManager.selectedScreenCanvas
                    }}, currentScreen: {get: function() {
                        var currentScreen = this._selectionManager.screen;
                        return currentScreen
                    }}, selectScreenCanvas: function() {
                    this._selectionManager.clearVisuals();
                    this._selectionManager.selectCanvas(null);
                    this._visualDropDownVisible(!1)
                }, handleScreenClicked: function(selectedScreen) {
                    this._selectionManager.selectScreen(selectedScreen);
                    this.selectScreenCanvas()
                }
        }, {}),
        EntityNameTextBox = WinJS.Class.derive(AppMagic.Utility.Disposable, function EntityNameTextBox_ctor(doc, selectionManager, entityManager, screensOnly) {
            AppMagic.Utility.Disposable.call(this);
            this.track("_eventTracker", new AppMagic.Utility.EventTracker);
            this._document = doc;
            this._selectionManager = selectionManager;
            this._name = ko.observable("");
            this._readOnly = ko.observable(!1);
            this._eventTracker.add(entityManager, "entityrenamed", this._onEntityRenamed, this);
            this._eventTracker.add(selectionManager, "visualschanged", this._handleSelectionChanged, this);
            this._eventTracker.add(selectionManager, "screenchanged", this._handleSelectionChanged, this);
            this._eventTracker.add(selectionManager, "canvaschanged", this._handleSelectionChanged, this);
            this._screensOnly = screensOnly;
            this._updateRenameEntity()
        }, {
            _document: null, _selectionManager: null, _screensOnly: !1, _name: null, _readOnly: null, _renameEntity: null, handleBlur: function() {
                    this._performRename()
                }, handleKeyDown: function(viewModel, evt) {
                    return evt.key === AppMagic.Constants.Keys.enter ? (this._performRename(), evt.stopPropagation(), AppMagic.AuthoringTool.Runtime.isAuthoring && AppMagic.context.documentViewModel.focusToScreenCanvas(), !1) : !0
                }, name: {
                    get: function() {
                        return this._name()
                    }, set: function(value) {
                            this._name(value)
                        }
                }, readOnly: {get: function() {
                        return this._readOnly()
                    }}, _onEntityRenamed: function(evt) {
                    this._updateRenameEntity()
                }, _handleSelectionChanged: function() {
                    this._performRename();
                    this._updateRenameEntity()
                }, _performRename: function() {
                    if (this._renameEntity) {
                        var newName = this._name();
                        if (this._renameEntity.name === newName)
                            return;
                        AppMagic.AuthoringTool.Runtime.tryRenameEntity(this._document, this._renameEntity.name, newName) && newName.length !== 0 || this._name(this._renameEntity.name)
                    }
                }, _updateRenameEntity: function() {
                    this._renameEntity = this._screensOnly ? this._selectionManager.screen : this._selectionManager.canvasOwnerOrSingleVisual;
                    this._renameEntity ? (this._name(this._renameEntity.name), this._readOnly(!1)) : this._selectionManager.visuals.length > 1 ? (this._name(AppMagic.AuthoringStrings.Multiple), this._readOnly(!0)) : (this._name(""), this._readOnly(!0))
                }
        }, {});
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {
        EntityDropDownViewModel: EntityDropDownViewModel, EntityNameTextBox: EntityNameTextBox
    })
})();