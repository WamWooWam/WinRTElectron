//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var Util = AppMagic.Utility,
        FlyoutMargin = 5,
        SourcesMaxSize = 4,
        ruleValueSelector = ".ruleValue",
        ExpressRuleTextBox = WinJS.Class.derive(AppMagic.AuthoringTool.Views.RuleTextBoxBase, function expressRuleTextBox_ctor(element) {
            (AppMagic.AuthoringTool.Views.RuleTextBoxBase.call(this, element, element.rule, element), element.rule.isDisposed) || (element.viewObject = this, this._configurationVM = element.configurationVM, this._view = element.view, this._configurationControl = document.getElementById("configurationHost"), this._contextMenuVisible = ko.observable(!1), this._visualIntellisenseVisible = ko.observable(!1), this._intellisenseTooltipVisible = ko.observable(!1), this._flyoutPosition = {
                    bottom: ko.observable(""), right: ko.observable(""), top: ko.observable("0")
                }, this._intellisenseTooltipPosition = {
                    bottom: ko.observable("0"), left: ko.observable("")
                }, ko.applyBindings(this, element.children[0]), this._ruleContextMenu = new ExpressRuleContextMenu(this._viewModel, this._element), this._eventTracker.add(this._ruleContextMenu, "finishContextOperation", this.finishContextOperation, this), this._eventTracker.add(this._ruleContextMenu, "finishContextOperationAndFocusOnRule", this.finishContextOperationAndFocusOnRule, this), this._eventTracker.add(this._ruleContextMenu, "repositionContextMenu", this.setFlyoutPosition, this), this.trackAnonymous(this._visualIntellisenseVisible.subscribe(function(newValue) {
                    var ruleValue = this._viewModel.presentationValue;
                    ruleValue && (newValue ? ruleValue.notifyBeforeShow() : ruleValue.notifyAfterHide())
                }, this)))
        }, {
            _configurationControl: null, _configurationVM: null, _contextMenuVisible: null, _flyoutPosition: null, _intellisenseTooltipPosition: null, _intellisenseTooltipVisible: null, _ruleContextMenu: null, _view: null, _visualIntellisenseVisible: null, tabDisabled: !1, _updateTitle: function(message) {
                    AppMagic.AuthoringTool.Views.RuleTextBoxBase.prototype._updateTitle.call(this, message)
                }, _showIntellisenseOnVisualIntellisenseSelection: function(){}, dispose: function() {
                    this._view = null;
                    this._configurationVM = null;
                    this._configurationControl = null;
                    this._flyoutPosition = null;
                    this._intellisenseTooltipPosition = null;
                    AppMagic.AuthoringTool.Views.RuleTextBoxBase.prototype.dispose.call(this)
                }, contextItems: {get: function() {
                        return this._ruleContextMenu.getContextItems()
                    }}, contextMenuVisible: {get: function() {
                        return this._contextMenuVisible()
                    }}, hideContextMenu: function() {
                    this._contextMenuVisible(!1)
                }, hideFlyout: function() {
                    this._visualIntellisenseVisible(!1);
                    this._fnDiscoveryPanelVisible(!1);
                    this._contextMenuVisible(!1);
                    this._intellisenseTooltipVisible(!1)
                }, flyoutVisible: {get: function() {
                        return this._editable() && (this._visualIntellisenseVisible() || this._contextMenuVisible() || this._fnDiscoveryPanelVisible())
                    }}, handleArrowClick: function(sinkName, sourcesContainerDiv) {
                    this._reset();
                    this._viewModel.setSourcesVisiblity(sinkName);
                    var nameMapSink = this._viewModel.nameMap[sinkName];
                    nameMapSink.sourcesVisible() && AppMagic.AuthoringTool.Utility.scrollElementToTop(sourcesContainerDiv, "sources", nameMapSink.source())
                }, handleBodyContainerClick: function() {
                    this._editable() || this._ruleTextArea.focus()
                }, handleSourceKeyDown: function(index, nameMapSink, sourcesDiv, source, evt) {
                    if (evt.key === AppMagic.Constants.Keys.tab)
                        return nameMapSink.sourcesVisible(!1), !0;
                    if (evt.key === AppMagic.Constants.Keys.enter)
                        this._viewModel.handleSourceClick(nameMapSink, source);
                    else {
                        var selectedText = AppMagic.AuthoringTool.Utility.tryGetTextOnSelectKeyUpDown(sourcesDiv, index, SourcesMaxSize, evt.key);
                        selectedText !== null && (nameMapSink.source(selectedText), evt.stopPropagation())
                    }
                    return !1
                }, handleSourcesKeyDown: function(sinkName, sourcesContainerDiv, data, evt) {
                    return evt.key === AppMagic.Constants.Keys.down ? (this.handleArrowClick(sinkName, sourcesContainerDiv), !1) : !0
                }, styledDisplayKey: {get: function() {
                        return Util.getSplitText(this._viewModel.getDisplayKey("expressView", this._isChildRule), this._configurationVM.ruleFilter.text)
                    }}, handleContextMenu: function() {
                    if (this._editable()) {
                        var contextMenu = Util.getFirstDescendantByClass("contextMenu", this._element);
                        this._contextMenuVisible(!0);
                        this._ruleContextMenu.updateSelection(this._ruleTextArea.selectionStart, this._ruleTextArea.selectionEnd);
                        this._ruleContextMenu.createMacroVisible() || this._ruleContextMenu.updateMacroVisible() || this._ruleContextMenu.cursorOnMacro() ? this._contextMenuVisible(!0) : this._contextMenuVisible(!1);
                        this._intellisenseVisible(!1);
                        this._fnDiscoveryPanelVisible(!1)
                    }
                    return !1
                }, finishContextOperation: function() {
                    this._intellisenseVisible(!1);
                    this._updateBracketHighlights();
                    this.updateErrors();
                    this._contextMenuVisible(!1)
                }, finishContextOperationAndFocusOnRule: function() {
                    this.finishContextOperation();
                    this._ruleTextArea.focus()
                }, hideVisualIntellisense: function() {
                    this._visualIntellisenseVisible(!1)
                }, intellisenseTooltipWidth: {get: function() {
                        return this._ruleTextArea.offsetWidth.toString() + "px"
                    }}, setintellisenseTooltipPosition: function() {
                    var elementLeft = this._element.querySelector(ruleValueSelector).getBoundingClientRect().left - this._element.getBoundingClientRect().left;
                    this._intellisenseTooltipPosition.left(elementLeft.toString() + "px");
                    var elementBottom = this._configurationControl.offsetHeight - this._element.getBoundingClientRect().top;
                    this._intellisenseTooltipPosition.bottom(elementBottom.toString() + "px")
                }, setFlyoutPosition: function() {
                    if (this.flyoutVisible) {
                        var flyoutContainer = Util.getFirstDescendantByClass("flyoutContainer", this._element);
                        var right = this._configurationVM.configurationCtrlWidth + FlyoutMargin;
                        this._flyoutPosition.right(right.toString() + "px");
                        var elementTop = this._element.getBoundingClientRect().top,
                            configControlHeight = this._configurationControl.offsetHeight,
                            deltaTop = configControlHeight - elementTop;
                        deltaTop < flyoutContainer.offsetHeight ? (this._flyoutPosition.bottom(FlyoutMargin.toString() + "px"), this._flyoutPosition.top("")) : (this._flyoutPosition.bottom(""), this._flyoutPosition.top(elementTop.toString() + "px"))
                    }
                }, tryShowVisualIntellisense: function() {
                    if (this._contextMenuVisible(!1), this._editable() && !this._visualIntellisenseVisible() && this._viewModel.presentationValue) {
                        this._visualIntellisenseVisible(!0);
                        var visualIntellisenseContainer = Util.getFirstDescendantByClass("visualIntellisensePage", this._element);
                        visualIntellisenseContainer.childElementCount === 0 ? setImmediate(this.setFlyoutPosition.bind(this)) : this.setFlyoutPosition()
                    }
                }, tryShowIntellisenseToolTip: function() {
                    this._intellisenseTooltipVisible(!0);
                    this.setintellisenseTooltipPosition()
                }, flyoutPosition: {get: function() {
                        return this._flyoutPosition
                    }}, intellisenseTooltipPosition: {get: function() {
                        return this._intellisenseTooltipPosition
                    }}, intellisenseTooltipVisible: {get: function() {
                        return this._intellisenseTooltipVisible()
                    }}, scrollIntoView: function() {
                    this._ruleTextArea.scrollIntoView()
                }, visualIntellisenseVisible: {get: function() {
                        return this._visualIntellisenseVisible()
                    }}
        }, {});
    WinJS.UI.Pages.define("/controls/intellisense/expressRuleTextBox.html", {ready: function(element, options) {
            new ExpressRuleTextBox(element);
            this.viewReady && this.viewReady()
        }});
    var ExpressRuleContextMenu = WinJS.Class.define(function ExpressRuleContextMenu_ctor(rule, element) {
            this.renameOverlayText = ko.observable("");
            this.renameNameVisible = ko.observable(!1);
            this.renameEditVisible = ko.observable(!1);
            this.renameBoxValue = ko.observable("");
            this.renameErrWidth = ko.observable("0px");
            this.createMacroVisible = ko.observable(!1);
            this.cursorOnMacro = ko.observable(!1);
            this.contextMenuHeading = ko.observable("");
            this.revertVisible = ko.observable(!0);
            this.updateText = ko.observable("");
            this.updateMacroVisible = ko.observable(!1);
            this._selStart = 0;
            this._selEnd = 0;
            this._editBox = null;
            this._element = element;
            this._lastMacroExpanded = null;
            this._macro = null;
            this._renameBox = null;
            this._rule = rule
        }, {
            _element: null, _lastMacroExpanded: null, _macro: null, _renameBox: null, _selStart: 0, _selEnd: 0, _rule: null, createMacroVisible: null, cursorOnMacro: null, contextMenuHeading: null, revertVisible: null, updateText: null, updateMacroVisible: null, renameOverlayText: null, renameNameVisible: null, renameEditVisible: null, renameBoxValue: null, renameErrWidth: null, _createItem: function(textOrObservable, handleClick, visible) {
                    var no_op = function() {
                            return !1
                        };
                    return {
                            text: textOrObservable, handleClick: handleClick.bind(this), canEdit: !1, visible: visible, editValue: !1, editVisible: !1, handleEditBlur: no_op, handleEditKeyup: no_op, handleEditKeydown: no_op, editError: !1, errorWidth: "0px", additionalClass: "", overlayClass: "item"
                        }
                }, _createEditItem: function(text, handleClick, visible, editValue, editVisible, handleEditBlur, handleEditKeyup, handleEditKeydown, errorWidth, additionalClass, overlayClass) {
                    return {
                            text: text, handleClick: handleClick.bind(this), canEdit: !0, visible: visible, editValue: editValue, editVisible: editVisible, handleEditBlur: handleEditBlur.bind(this), handleEditKeyup: handleEditKeyup.bind(this), handleEditKeydown: handleEditKeydown.bind(this), errorWidth: errorWidth, additionalClass: additionalClass, overlayClass: overlayClass
                        }
                }, getContextItems: function() {
                    return [this._createEditItem(this.renameOverlayText, this.handleRenameClick, this.renameNameVisible, this.renameBoxValue, this.renameEditVisible, this.submitRenameChange, this.handleRenameKeyup, this.handleRenameKeydown, this.renameErrWidth, "macroRenameBox", "macroRenameOverlay"), this._createItem(AppMagic.AuthoringStrings.Revert, this.handleRevertClick, this.revertVisible), this._createItem(this.updateText, this.handleUpdateClick, this.updateMacroVisible), this._createItem(AppMagic.AuthoringStrings.CreateMacro, this.handleCreateClick, this.createMacroVisible), this._createItem(AppMagic.AuthoringStrings.ExpandMacro, this.handleExpandClick, this.cursorOnMacro), this._createItem(AppMagic.AuthoringStrings.CollapseAllMacro, this.handleCollapseAllClick.bind(this), this.cursorOnMacro), this._createItem(AppMagic.AuthoringStrings.DeleteMacro, this.handleDeleteClick.bind(this), this.cursorOnMacro), this._createItem(AppMagic.AuthoringStrings.ViewAllMacros, this.handleViewAllClick.bind(this), this.cursorOnMacro)]
                }, handleCreateClick: function() {
                    this.refreshContextMenu(this._rule.macroCreate(this._selStart, this._selEnd))
                }, handleCollapseAllClick: function() {
                    var replacements = this._rule.macroCollapseAll(this._macro);
                    var message;
                    message = replacements > 1 ? Core.Utility.formatString(AppMagic.AuthoringStrings.CollapseAllMacroReplacements, replacements, this._macro) : replacements === 1 ? Core.Utility.formatString(AppMagic.AuthoringStrings.CollapseAllMacroReplacement, replacements, this._macro) : Core.Utility.formatString(AppMagic.AuthoringStrings.CollapseAllMacroNoReplacements, this._macro);
                    AppMagic.AuthoringTool.PlatformHelpers.showNotification(AppMagic.AuthoringStrings.CollapseAllMacro, message);
                    this.refreshContextMenu(this._macro)
                }, handleDeleteClick: function() {
                    this._rule.macroDelete(this._macro);
                    this.dispatchEvent("finishContextOperation")
                }, handleRevertClick: function() {
                    this._rule.resetValue();
                    this.dispatchEvent("finishContextOperation")
                }, handleExpandClick: function() {
                    this._lastMacroExpanded = this._macro;
                    this._rule.macroExpand(this._selStart);
                    this.dispatchEvent("finishContextOperation")
                }, handleUpdateClick: function() {
                    this._rule.macroUpdate(this._lastMacroExpanded, this._selStart, this._selEnd);
                    this.refreshContextMenu(this._lastMacroExpanded);
                    this._lastMacroExpanded = null
                }, handleRenameClick: function() {
                    this.refreshContextMenu(this._macro);
                    this.renameBoxValue(this._macro);
                    this.renameNameVisible(!1);
                    this.renameEditVisible(!0);
                    this._renameBox.focus()
                }, handleRenameKeyup: function() {
                    return this._macro === this.renameBoxValue() || this._rule.tryMacroRename(this._macro, this.renameBoxValue()) ? (this.renameErrWidth("0px"), this._macro = this.renameBoxValue()) : this.renameErrWidth(this._renameBox.createTextRange().getBoundingClientRect().width.toString() + "px"), !0
                }, handleRenameKeydown: function(element, e) {
                    return e.key === AppMagic.Constants.Keys.tab ? (this.dispatchEvent("finishContextOperationAndFocusOnRule"), !1) : (e.key === AppMagic.Constants.Keys.enter && this.submitRenameChange(), !0)
                }, handleViewAllClick: function() {
                    this.dispatchEvent("finishContextOperation");
                    AppMagic.context.documentViewModel.backStage.visible = !0;
                    AppMagic.context.documentViewModel.backStage.macroBackStageVisible = !0;
                    AppMagic.context.documentViewModel.backStage.selectSettingByName(AppMagic.AuthoringStrings.MacroBackstage);
                    AppMagic.context.shellViewModel.hideAppBars()
                }, submitRenameChange: function() {
                    this.refreshContextMenu(this._macro)
                }, refreshContextMenu: function(macroName) {
                    this._macro = macroName;
                    this._macro !== null && (this.renameOverlayText(this._macro), this.createMacroVisible(!1), this.updateMacroVisible(!1));
                    this.cursorOnMacro(this._macro !== null);
                    this.renameNameVisible(this.cursorOnMacro());
                    this.renameEditVisible(!1);
                    this.renameErrWidth("0px");
                    this.dispatchEvent("repositionContextMenu")
                }, updateSelection: function(start, end) {
                    this._selStart = start;
                    this._selEnd = end;
                    var highlightedText = this._rule.rhs.substring(start, end),
                        macro = null;
                    start === end && (macro = this._rule.getMacroNameAtCursor(start));
                    this._renameBox = Util.getFirstDescendantByClass("macroRenameBox", this._element);
                    var scriptIsValid = end > start && this._rule.isMacroScriptValid(start, end);
                    this.createMacroVisible(scriptIsValid);
                    this.updateMacroVisible(scriptIsValid && this._lastMacroExpanded !== null && !this._rule.macroUpdateCreatesCycle(this._lastMacroExpanded, highlightedText));
                    this.updateMacroVisible() && this.updateText(Core.Utility.formatString(AppMagic.AuthoringStrings.UpdateMacro, this._lastMacroExpanded));
                    this.refreshContextMenu(macro)
                }
        }, {});
    WinJS.Class.mix(ExpressRuleContextMenu, WinJS.Utilities.eventMixin)
})();