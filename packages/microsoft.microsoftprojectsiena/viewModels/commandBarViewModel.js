//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var PropertyRuleCategory = Microsoft.AppMagic.Authoring.PropertyRuleCategory,
        CommandBarViewModel = WinJS.Class.derive(AppMagic.Utility.Disposable, function CommandBarViewModel_ctor(doc, entityManager, selectionManager, canvasManager, configuration, clipboardManager, zoom, isPreview, dataConnectionsVm, loadedPromise, rulePanelsInfo) {
            AppMagic.Utility.Disposable.call(this);
            this._zoom = zoom;
            this._canvasManager = canvasManager;
            this._isPreview = isPreview;
            this.track("_ruleButtonPanel", new AppMagic.AuthoringTool.ViewModels.RuleButtonPanel(doc, entityManager, selectionManager, dataConnectionsVm, loadedPromise, rulePanelsInfo));
            this._selectionManager = selectionManager;
            this._configuration = configuration;
            this._clipboardManager = clipboardManager;
            this._visible = ko.observable(!0);
            this._flyoutVisible = {
                align: ko.observable(!1), arrange: ko.observable(!1), copyPaste: ko.observable(!1), order: ko.observable(!1), zoom: ko.observable(!1)
            };
            this.track("_canCopyPasteObservable", AppMagic.AuthoringTool.Utility.changingComputed(function() {
                return this.canCopyPaste
            }, this));
            this.trackAnonymous(this._canCopyPasteObservable.subscribe(function() {
                this.dispatchEvent("categoryContentChanged")
            }, this));
            this.track("_canArrangeObservable", AppMagic.AuthoringTool.Utility.changingComputed(function() {
                return this.canArrange
            }, this));
            this.trackAnonymous(this._canArrangeObservable.subscribe(function() {
                this.dispatchEvent("categoryContentChanged")
            }, this));
            this._visualsShortcuts = new AppMagic.AuthoringTool.Shortcuts.VisualsShortcutProvider;
            this._commandBarShortcuts = new AppMagic.AuthoringTool.Shortcuts.CommandBarShortcutProvider(this)
        }, {
            _canvasManager: null, _isPreview: null, _ruleButtonPanel: null, _selectionManager: null, _configuration: null, _visible: null, _arrangeAnchor: null, _clipboardManager: null, _flyoutVisible: null, _zoom: null, _visualsShortcuts: null, _commandBarShortcuts: null, commandBarShortcuts: {get: function() {
                        return this._commandBarShortcuts
                    }}, editOptionButtons: {get: function() {
                        return this._editOptionButtons
                    }}, visualsShortcuts: {get: function() {
                        return this._visualsShortcuts
                    }}, alignSelectedHorizontal: function(position) {
                    var canvas = this._canvasManager.selectedVisualsCommonCanvas;
                    canvas.alignSelectedHorizontal(position);
                    alignFlyout.winControl.hide()
                }, alignSelectedVertical: function(position) {
                    var canvas = this._canvasManager.selectedVisualsCommonCanvas;
                    canvas.alignSelectedVertical(position);
                    alignFlyout.winControl.hide()
                }, changeSelectedZOrder: function(offset) {
                    var canvas = this._canvasManager.selectedVisualsCommonCanvas;
                    canvas.changeSelectedZOrder(offset);
                    orderFlyout.winControl.hide()
                }, distributeSelectedHorizontal: function() {
                    var canvas = this._canvasManager.selectedVisualsCommonCanvas;
                    canvas.distributeSelectedHorizontal();
                    alignFlyout.winControl.hide()
                }, distributeSelectedVertical: function() {
                    var canvas = this._canvasManager.selectedVisualsCommonCanvas;
                    canvas.distributeSelectedVertical();
                    alignFlyout.winControl.hide()
                }, handleEscape: function(data, evt) {
                    return evt.key === AppMagic.Constants.Keys.esc ? (this._element.winControl.hide(), !1) : !0
                }, handleArrangeClicked: function(data, evt) {
                    this._arrangeAnchor = this._getButtonClickFlyoutAnchor(evt);
                    this.showArrangeFlyout()
                }, handleZoomClicked: function(data, evt) {
                    var anchor = this._getButtonClickFlyoutAnchor(evt);
                    zoomFlyout.winControl.show(anchor)
                }, handleEscapeZoom: function(data, evt) {
                    return evt.key === AppMagic.Constants.Keys.esc ? (zoomFlyout.winControl.hide(), !1) : !0
                }, handleCopyPasteClicked: function(data, evt) {
                    var anchor = this._getButtonClickFlyoutAnchor(evt);
                    copyPasteFlyout.winControl.show(anchor)
                }, handleExpressView: function() {
                    AppMagic.context.documentViewModel.configuration.toggleVisibility()
                }, showAlignFlyout: function() {
                    alignFlyout.winControl.show(this._arrangeAnchor)
                }, showArrangeFlyout: function() {
                    arrangeFlyout.winControl.show(this._arrangeAnchor)
                }, showOrderFlyout: function() {
                    orderFlyout.winControl.show(this._arrangeAnchor)
                }, clipboardManager: {get: function() {
                        return this._clipboardManager
                    }}, handleCommandButtons: function(data) {
                    this[data.action](data.args)
                }, canGroup: {get: function() {
                        return this._selectionManager.selection.length > 1
                    }}, canUngroup: {get: function() {
                        return this._selectionManager.singleVisual !== null ? this._selectionManager.singleVisual.groupedVisuals.length > 1 : !1
                    }}, doGroup: function() {
                    return this._selectionManager.selection[0].group ? !1 : (AppMagic.context.documentViewModel.controlGallery.addGroup(), !0)
                }, doUngroup: function() {
                    var visual = this._selectionManager.singleVisual,
                        ungroupedVisuals = visual.groupedVisuals;
                    return visual.ungroup(), this._selectionManager.selectVisualsOrGroups(ungroupedVisuals), !0
                }, doCopy: function() {
                    copyPasteFlyout.winControl.hide();
                    this.clipboardManager.doCopy()
                }, doCut: function() {
                    this._clipboardManager.doCut()
                }, doPaste: function() {
                    this._clipboardManager.doPaste()
                }, doDelete: function() {
                    AppMagic.context.documentViewModel.removeSelectedVisuals()
                }, doUndo: function() {
                    AppMagic.context.documentViewModel.undoManager.undo()
                }, doRedo: function() {
                    AppMagic.context.documentViewModel.undoManager.redo()
                }, canCopyPaste: {get: function() {
                        return this.clipboardManager.isCutValid || this.clipboardManager.isCopyValid || this.clipboardManager.isPasteValid
                    }}, canDelete: {get: function() {
                        return AppMagic.context.documentViewModel.selection.visuals.length > 0
                    }}, canArrange: {get: function() {
                        return this._canvasManager.selectedVisualsCommonCanvas !== null
                    }}, flyoutVisible: {get: function() {
                        return this._flyoutVisible
                    }}, isPreview: {get: function() {
                        return this._isPreview()
                    }}, ruleButtonPanel: {get: function() {
                        return this._ruleButtonPanel
                    }}, visible: {
                    get: function() {
                        return this._visible()
                    }, set: function(value) {
                            this._visible(value)
                        }
                }, _getButtonClickFlyoutAnchor: function(evt) {
                    for (var anchor = evt.target; anchor && !WinJS.Utilities.hasClass(anchor, "button"); )
                        anchor = anchor.parentElement;
                    return anchor
                }, zoom: {get: function() {
                        return this._zoom
                    }}
        }, {});
    WinJS.Class.mix(CommandBarViewModel, WinJS.Utilities.eventMixin);
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {CommandBarViewModel: CommandBarViewModel})
})();