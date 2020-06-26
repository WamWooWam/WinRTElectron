//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var IntellisenseMaxSize = 2,
        IntellisenseMinBottom = "-95px",
        SuggestionHeight = 35,
        SuggestionListMargin = 4,
        SuggestionListSize = 3,
        TextAreaMargin = 10,
        Util = AppMagic.Utility,
        RuleTextBoxBase = WinJS.Class.derive(Util.Disposable, function RuleTextBoxBase_ctor(element, viewModel, container) {
            if (Util.Disposable.call(this), !viewModel.isDisposed) {
                this._element = element;
                this._viewModel = viewModel;
                this._container = container;
                this._isChildRule = element.isChildRule || !1;
                this._ruleTextArea = Util.getFirstDescendantByClass("ruleValue", element);
                this._nonEditableRuleDiv = Util.getFirstDescendantByClass("nonEditable", element);
                this.track("_eventTracker", new AppMagic.Utility.EventTracker);
                this._editable = ko.observable(!1);
                this._fnDiscoveryPanelVisible = ko.observable(!1);
                this._intellisenseVisible = ko.observable(!1);
                this._intellisenseVm = viewModel.intellisenseVM;
                this._fnDiscoveryPanel = this._intellisenseVm.fnDiscoveryPanel;
                this._lastIntellisenseCaretPos = -1;
                this._lastIntellisenseText = "";
                this._ruleDecorationManager = new AppMagic.AuthoringTool.ViewModels.RuleDecorationManager(element, this._ruleTextArea);
                this._textAreaHeight = ko.observable("0px");
                this.track("_textObservable", ko.computed(function() {
                    return this._viewModel.rhs
                }.bind(this)));
                this.track("_hasErrorsObservable", ko.computed(function() {
                    return this._viewModel.hasErrors
                }.bind(this)));
                this.track("_fnCategoriesVisible", ko.computed(function() {
                    return this._fnDiscoveryPanel.categoriesVisible
                }.bind(this)));
                this.trackAnonymous(this._textObservable.subscribe(function() {
                    this._ruleTextArea.value !== this._viewModel.rhs && (this._ruleTextArea.value = this._viewModel.rhs);
                    this._nonEditableRuleDiv.innerText = this._viewModel.rhs.length > 0 ? this._viewModel.rhs : ".";
                    this._updateRuleView();
                    setImmediate(function() {
                        this._updateRuleView()
                    }.bind(this));
                    this._updateBracketHighlights();
                    this._refreshIntellisense(!1)
                }, this));
                this.trackAnonymous(this._hasErrorsObservable.subscribe(function() {
                    this.updateErrors()
                }, this));
                this.trackAnonymous(this._editable.subscribe(function(val) {
                    val ? (this._updateRuleView(), this._docHasMouseEventListener || (this._eventTracker.addCapture(document, "mousedown", this._handleClickOnDoc, this), this._eventTracker.addCapture(document, "click", this._handleClickOnDoc, this), this._docHasMouseEventListener = !0), this._hasOpenUndoGroup || (AppMagic.context.documentViewModel.undoManager.createUndoableGroup("Rule Edit Group for Property: " + this._viewModel.propertyName), this._hasOpenUndoGroup = !0)) : (this._docHasMouseEventListener && (this._eventTracker.remove(document, "mousedown"), this._eventTracker.remove(document, "click"), this._docHasMouseEventListener = !1), this._viewModel.isDisposed || this._viewModel.finalizeRule(this._viewModel.rhs, this._viewModel.rhs.length), this._hasOpenUndoGroup && this._closeUndoGroup())
                }.bind(this)));
                var fnDiscoveryClickHandler = this._handleFnDiscoveryClickOnDoc.bind(this);
                this.trackAnonymous(this._fnCategoriesVisible.subscribe(function(newValue) {
                    newValue ? document.addEventListener("click", fnDiscoveryClickHandler, !1) : document.removeEventListener("click", fnDiscoveryClickHandler, !1)
                }, this));
                this.trackAnonymous(this._fnDiscoveryPanelVisible.subscribe(function(newValue) {
                    newValue || (this._fnDiscoveryPanel.categoriesVisible = !1)
                }, this));
                ko.utils.domNodeDisposal.addDisposeCallback(element, this.dispose.bind(this));
                setImmediate(function() {
                    this._updateRuleView()
                }.bind(this))
            }
        }, {
            _cachedInitialText: null, _container: null, _docHasMouseEventListener: !1, _editable: null, _element: null, _fnCategoriesVisible: null, _fnDiscoveryPanel: null, _fnDiscoveryPanelVisible: null, _hasErrorsObservable: null, _hasOpenUndoGroup: !1, _intellisenseVisible: null, _intellisenseVm: null, _isChildRule: null, _lastIntellisenseCaretPos: null, _lastIntellisenseText: null, _nonEditableRuleDiv: null, _ruleDecorationManager: null, _ruleTextArea: null, _textAreaHeight: null, _textObservable: null, _viewModel: null, dispose: function() {
                    this._hasOpenUndoGroup && this._closeUndoGroup();
                    Util.Disposable.prototype.dispose.call(this)
                }, _getSuggestionList: function() {
                    var suggestionList = Util.getFirstDescendantByClass("suggestions", this._element);
                    return suggestionList
                }, _handleArrowDown: function() {
                    var suggestionList = this._getSuggestionList(),
                        children = suggestionList.children,
                        len = children.length;
                    this._intellisenseVm.selectedIndex < len - 1 && (this._intellisenseVm.selectedIndex++, children[this._intellisenseVm.selectedIndex].offsetTop >= suggestionList.scrollTop + suggestionList.offsetHeight - SuggestionListMargin && (suggestionList.scrollTop += children[this._intellisenseVm.selectedIndex - 1].offsetHeight))
                }, _handleArrowUp: function() {
                    var suggestionList = this._getSuggestionList();
                    if (this._intellisenseVm.selectedIndex > 0) {
                        var children = suggestionList.children;
                        this._intellisenseVm.selectedIndex--;
                        children[this._intellisenseVm.selectedIndex].offsetTop < suggestionList.scrollTop && (suggestionList.scrollTop -= children[this._intellisenseVm.selectedIndex + 1].offsetHeight)
                    }
                }, _handlePageDown: function() {
                    var suggestionList = this._getSuggestionList(),
                        children = suggestionList.children,
                        len = children.length,
                        index;
                    len - this._intellisenseVm.selectedIndex >= SuggestionListSize ? (index = this._intellisenseVm.selectedIndex, this._intellisenseVm.selectedIndex += SuggestionListSize - 1) : (index = len > SuggestionListSize ? len - SuggestionListSize : 0, this._intellisenseVm.selectedIndex = len - 1);
                    suggestionList.scrollTop = children[index].offsetTop
                }, _handlePageUp: function() {
                    var suggestionList = this._getSuggestionList(),
                        children = suggestionList.children;
                    this._intellisenseVm.selectedIndex >= SuggestionListSize ? this._intellisenseVm.selectedIndex -= SuggestionListSize - 1 : this._intellisenseVm.selectedIndex = 0;
                    suggestionList.scrollTop = children[this._intellisenseVm.selectedIndex].offsetTop
                }, _handleClickOnDoc: function(evt) {
                    var clickTarget = evt.target;
                    this._container.contains(clickTarget) || this._reset();
                    var fnDiscoveryPanelContainer = this._container.getElementsByClassName("fnDiscoveryPanel"),
                        ruleTextBoxContainer = this._container.getElementsByClassName("bodyContainer");
                    (fnDiscoveryPanelContainer.length === 0 || !fnDiscoveryPanelContainer[0].contains(clickTarget)) && WinJS.Utilities.hasClass(clickTarget, "ruleValue") && WinJS.Utilities.hasClass(clickTarget, "fnDiscoveryButton") && this._fnDiscoveryPanelVisible(!1)
                }, _handleFnDiscoveryClickOnDoc: function(evt) {
                    var categeryContainer = this._container.getElementsByClassName("FunctionDiscoveryPanel"),
                        len = categeryContainer.length;
                    len !== 1 || categeryContainer[0].contains(evt.target) || (this._fnDiscoveryPanel.categoriesVisible = !1)
                }, _isIdentBreakEvent: function(e) {
                    switch (e.key) {
                        case"Spacebar":
                        case"Divide":
                        case"Multiply":
                        case"Subtract":
                        case"Add":
                        case"(":
                        case")":
                        case"[":
                        case"]":
                        case"{":
                        case"}":
                        case",":
                        case";":
                        case"+":
                        case"-":
                        case"*":
                        case"%":
                        case"!":
                        case"/":
                        case"|":
                        case"&":
                        case">":
                        case"<":
                            return !0;
                        default:
                            return !1
                    }
                    return !1
                }, _refreshIntellisense: function(forceRefresh, functionCategory) {
                    if (this._editable() && document.activeElement === this._ruleTextArea) {
                        var caretPosition = Math.min(this._ruleTextArea.selectionEnd, this._ruleTextArea.value.length);
                        (forceRefresh || caretPosition !== this._lastIntellisenseCaretPos || this._lastIntellisenseText !== this._ruleTextArea.value) && (this._viewModel.refreshIntellisense(this._ruleTextArea.value, caretPosition, functionCategory), this._lastIntellisenseCaretPos = caretPosition, this._lastIntellisenseText = this._ruleTextArea.value, this._intellisenseVisible(!0))
                    }
                    else
                        this._intellisenseVisible(!1)
                }, _reset: function() {
                    this._editable(!1);
                    this._intellisenseVisible(!1);
                    this._cachedInitialText = null;
                    this.hideFlyout()
                }, _closeUndoGroup: function() {
                    this._hasOpenUndoGroup = !1;
                    AppMagic.context.documentViewModel.undoManager.closeUndoableGroup()
                }, _updateBracketHighlights: function() {
                    var bracketIndices = this._intellisenseVm.getBracketIndices(this._ruleTextArea.value, this._ruleTextArea.selectionEnd);
                    this._ruleDecorationManager.updateBracketHighlights(bracketIndices)
                }, _insertTextInRhs: function(replacement) {
                    this._ruleTextArea.value = replacement.updatedText;
                    this._ruleTextArea.focus();
                    this._ruleTextArea.selectionStart = replacement.startIndex + replacement.endIndex;
                    this._ruleTextArea.selectionEnd = this._ruleTextArea.selectionStart;
                    this._viewModel.rhs = replacement.updatedText
                }, _updateRuleView: function() {
                    this.isDisposed || this._viewModel.isDisposed || (this._textAreaHeight(this._nonEditableRuleDiv.offsetHeight.toString() + "px"), this._editable() && this.setFlyoutPosition(), this.updateErrors())
                }, _updateTitle: function(message) {
                    this._ruleTextArea.title = message
                }, editable: {get: function() {
                        return this._editable()
                    }}, fnDiscoveryPanel: {get: function() {
                        return this._fnDiscoveryPanel
                    }}, fnDiscoveryPanelVisible: {get: function() {
                        return this._fnDiscoveryPanelVisible()
                    }}, handleClick: function() {
                    this.setEditable();
                    this._refreshIntellisense(!1);
                    this._updateBracketHighlights();
                    this.tryShowVisualIntellisense();
                    this.tryShowIntellisenseToolTip()
                }, handleFnDiscoveryButtonClick: function() {
                    this.hideContextMenu();
                    this._fnDiscoveryPanel.refreshFunctions();
                    this._fnDiscoveryPanelVisible(!this._fnDiscoveryPanelVisible());
                    this.setFlyoutPosition()
                }, handleFnDiscoveryCloseButtonClick: function() {
                    this._fnDiscoveryPanelVisible(!1)
                }, handleFnNameDblClick: function() {
                    var selectedFn = this._fnDiscoveryPanel.selectedFunction,
                        text = selectedFn.qualifiedName,
                        selectionStart = this._ruleTextArea.selectionStart,
                        replacementLength = this._ruleTextArea.selectionEnd - selectionStart;
                    var replacement = this._intellisenseVm.replaceText(this._viewModel.rhs, text, selectionStart, replacementLength, !0, !1);
                    this._editable() || this.setEditable();
                    this._insertTextInRhs(replacement);
                    this._refreshIntellisense(!0, selectedFn.functionCategoriesMask)
                }, handleFnNameKeyDown: function(element, evt) {
                    var key = evt.key;
                    key === AppMagic.Constants.Keys.down || key === AppMagic.Constants.Keys.up ? this._fnDiscoveryPanel.handleFnArrowDownUpKey(key) : (key === AppMagic.Constants.Keys.enter || key === AppMagic.Constants.Keys.tab) && this.handleFnNameDblClick()
                }, handleKeyDown: function(element, e) {
                    if (this._fnDiscoveryPanelVisible(!1), this.hideContextMenu(), this.tryShowIntellisenseToolTip(), this._intellisenseVisible() && this._intellisenseVm.selectedIndex >= 0) {
                        if (e.key === AppMagic.Constants.Keys.tab || e.key === AppMagic.Constants.Keys.enter)
                            return e.key === AppMagic.Constants.Keys.enter && this._viewModel.rhs.match(/^\d+$/) ? (this._reset(), AppMagic.context.documentViewModel.focusToScreenCanvas(), !1) : (this.selectSuggestion(this._intellisenseVm.suggestions[this._intellisenseVm.selectedIndex]), !1);
                        if (e.key === AppMagic.Constants.Keys.esc)
                            return this._intellisenseVisible(!1), !1;
                        if (e.key === AppMagic.Constants.Keys.down)
                            return this._handleArrowDown(), !1;
                        if (e.key === AppMagic.Constants.Keys.up)
                            return this._handleArrowUp(), !1;
                        if (e.key === AppMagic.Constants.Keys.pageDown)
                            return this._handlePageDown(), !1;
                        if (e.key === AppMagic.Constants.Keys.pageUp)
                            return this._handlePageUp(), !1
                    }
                    var caretPosition = Math.min(this._ruleTextArea.selectionEnd, this._ruleTextArea.value.length);
                    if (e.key === AppMagic.Constants.Keys.esc)
                        return this._viewModel.rhs = this._cachedInitialText, this._reset(), e.stopPropagation(), AppMagic.context.documentViewModel.focusToScreenCanvas(), !1;
                    if (e.key === AppMagic.Constants.Keys.tab)
                        this._reset();
                    else if (e.key === AppMagic.Constants.Keys.enter) {
                        if (!AppMagic.context.imeManager.imeActive)
                            return this._reset(), AppMagic.context.documentViewModel.focusToScreenCanvas(), !1
                    }
                    else
                        this._isIdentBreakEvent(e) && (this._ruleTextArea.selectionEnd = this._viewModel.autoCorrectIdentifier(this._ruleTextArea.value, caretPosition));
                    return this._ruleTextArea.focus(), this.updateErrors(), !0
                }, handleKeyUp: function(element, e) {
                    return e.key !== AppMagic.Constants.Keys.tab && e.key !== AppMagic.Constants.Keys.esc && this._refreshIntellisense(!1), this._updateBracketHighlights(), !0
                }, handleMouseMove: function(element, e) {
                    for (var message = "", errorMessages = this._ruleDecorationManager.errorMessages, i = 0, len = errorMessages.length; i < len; i++) {
                        var errorMessage = errorMessages[i];
                        if (errorMessage.left <= e.clientX && e.clientX <= errorMessage.right && errorMessage.top <= e.clientY && e.clientY <= errorMessage.bottom) {
                            message = errorMessage.message;
                            break
                        }
                    }
                    this._updateTitle(message)
                }, intellisenseBottom: {get: function() {
                        var len = this._intellisenseVm.suggestions.length;
                        return len > IntellisenseMaxSize ? IntellisenseMinBottom : (TextAreaMargin - len * SuggestionHeight).toString() + "px"
                    }}, intellisenseVisible: {get: function() {
                        return this._intellisenseVisible()
                    }}, isChildRule: {get: function() {
                        return this._isChildRule
                    }}, ruleDecorationManager: {get: function() {
                        return this._ruleDecorationManager
                    }}, selectSuggestion: function(selectedOption) {
                    var viewModel = this._viewModel,
                        replacement = this._intellisenseVm.replaceSuggestionText(viewModel.rhs, selectedOption);
                    this._insertTextInRhs(replacement);
                    this._intellisenseVisible(!1);
                    (selectedOption.kind === Microsoft.AppMagic.Authoring.SuggestionKind.function || selectedOption.kind === Microsoft.AppMagic.Authoring.SuggestionKind.serviceFunctionOption || selectedOption.kind === Microsoft.AppMagic.Authoring.SuggestionKind.service) && this._refreshIntellisense(!0)
                }, setEditable: function() {
                    return this._editable() || (this._cachedInitialText = this._ruleTextArea.value, this._editable(!0), this.tryShowVisualIntellisense(), document.activeElement !== this._ruleTextArea && this._ruleTextArea.focus()), !0
                }, textAreaHeight: {get: function() {
                        return this._textAreaHeight()
                    }}, updateErrors: function() {
                    this._ruleDecorationManager.updateErrors(this._viewModel.errors)
                }, viewModel: {get: function() {
                        return this._viewModel
                    }}
        }, {});
    WinJS.Namespace.define("AppMagic.AuthoringTool.Views", {RuleTextBoxBase: RuleTextBoxBase})
})();