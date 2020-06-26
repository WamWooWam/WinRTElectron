//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var Util = AppMagic.Utility,
        FnIconWidth = 57,
        CommandRuleTextBox = WinJS.Class.derive(AppMagic.AuthoringTool.Views.RuleTextBoxBase, function CommandRuleTextBox_ctor(element) {
            element.setEditable = this.setEditable.bind(this);
            AppMagic.AuthoringTool.Views.RuleTextBoxBase.call(this, element, element.rule(), element.container);
            this._squigglyContainer = Util.getFirstDescendantByClass("squigglyContainer", element);
            ko.applyBindings(this, element.children[0]);
            this._eventTracker.add(document, "aftershow", function(evt) {
                evt.target.contains(this._element) && this.updateErrors()
            }, this);
            this._eventTracker.add(this._viewModel, "dataSourceSelected", function(evt) {
                this._showIntellisenseOnVisualIntellisenseSelection()
            }, this)
        }, {
            _squigglyContainer: null, tabDisabled: !0, _updateTitle: function(message) {
                    AppMagic.AuthoringTool.Views.RuleTextBoxBase.prototype._updateTitle.call(this, message);
                    this._squigglyContainer.title = message
                }, _showIntellisenseOnVisualIntellisenseSelection: function() {
                    this._intellisenseVisible() || this._viewModel.rhs.indexOf("!") !== this._viewModel.rhs.length - 1 || (this._ruleTextArea.focus(), this._ruleTextArea.setSelectionRange(this._ruleTextArea.value.length, this._ruleTextArea.value.length), this.handleClick(), this._intellisenseVisible(!0))
                }, fnDiscoveryPanelWidth: {get: function() {
                        return this._container.offsetWidth.toString() + "px"
                    }}, fxIconPath: {get: function() {
                        return this.fnDiscoveryPanelVisible ? "../../images/fndiscovery_onicon.svg" : "../../images/fndiscovery_officon.svg"
                    }}, handleRuleClick: function() {
                    this._editable() && this.handleClick()
                }, hideContextMenu: function(){}, hideFlyout: function() {
                    this._fnDiscoveryPanelVisible(!1)
                }, setFlyoutPosition: function(){}, tooltipPosition: {get: function() {
                        return {
                                left: (this._element.offsetWidth - FnIconWidth).toString() + "px", top: this._ruleTextArea.offsetTop.toString() + "px"
                            }
                    }}, tryShowVisualIntellisense: function(){}, tryShowIntellisenseToolTip: function(){}
        }, {});
    WinJS.UI.Pages.define("/controls/intellisense/commandRuleTextBox.html", {ready: function(element, options) {
            var rule = element.rule();
            rule.isDisposed || new CommandRuleTextBox(element)
        }})
})();