//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var MacroView = WinJS.Class.derive(AppMagic.Utility.Disposable, function MacroView_ctor(element) {
            AppMagic.Utility.Disposable.call(this);
            this._element = element;
            this._viewModel = element.viewModel;
            this.track("_eventTracker", new AppMagic.Utility.EventTracker);
            this._eventTracker.add(document, "mousedown", this._handleClickOnDoc, this);
            var events = AppMagic.AuthoringTool.ViewModels.MacroBackstageViewModel.events;
            this._eventTracker.add(this._viewModel, events.clickmacroname, this._onClickMacroName, this);
            this._eventTracker.add(this._viewModel, events.keydownnameedit, this._onKeyDownNameEdit, this);
            this._eventTracker.add(this._viewModel, events.failedmacrorename, this._onFailedMacroRename, this);
            ko.utils.domNodeDisposal.addDisposeCallback(element.children[0], function() {
                this.dispose()
            }.bind(this));
            ko.applyBindings(this._viewModel, element.children[0])
        }, {
            _element: null, _editBox: null, _viewModel: null, _eventTracker: null, _handleClickOnDoc: function(evt) {
                    return this._editBox === null || this._editBox.contains(evt.target) || (this._editBox = null, this._viewModel.currentIndexEditing = !1), !0
                }, _onClickMacroName: function() {
                    this._editBox = AppMagic.Utility.getFirstDescendantByClass("macroListHeadingEditor", this._element);
                    this._editBox.focus();
                    this._editBox.selectionStart = 0;
                    this._editBox.selectionEnd = this._viewModel.nameEditValue.length
                }, _onKeyDownNameEdit: function(evt) {
                    evt.detail.key === AppMagic.Constants.Keys.enter && (this._editBox = null, this._viewModel.currentIndexEditing = !1)
                }, _onFailedMacroRename: function() {
                    var maxWidth = this._editBox.clientWidth - 20,
                        rangeWidth = this._editBox.createTextRange().getBoundingClientRect().width,
                        finalWidth = maxWidth < rangeWidth ? maxWidth : rangeWidth;
                    this._viewModel.squiggleWidth = finalWidth.toString() + "px"
                }
        }, {});
    AppMagic.UI.Pages.define("/backStages/macro/macroPage.html", MacroView)
})();