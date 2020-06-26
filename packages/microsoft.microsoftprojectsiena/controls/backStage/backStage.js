//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var BackStageView = WinJS.Class.define(function BackStageView_ctor(element) {
            var viewModel = ko.computed(function() {
                    return this._viewModel
                }, this);
            ko.applyBindings(viewModel, element);
            var visible = ko.computed(function() {
                    return this._viewModel.visible
                }, this);
            visible.subscribe(this._handleVisibleChanged.bind(this));
            this._focusKeeper = new AppMagic.Utility.FocusKeeper(element)
        }, {
            _focusKeeper: null, _viewModel: {get: function() {
                        return AppMagic.context.documentViewModel.backStage
                    }}, _handleVisibleChanged: function() {
                    var viewModel = this._viewModel;
                    viewModel.visible ? (this._focusKeeper.addFocusOutHandler(), WinJS.UI.Animation.enterContent(backStage).then(function() {
                        viewModel.isDisposed || viewModel.notifyEnterComplete()
                    }.bind(this))) : (this._focusKeeper.removeFocusOutHandler(), WinJS.UI.Animation.exitContent(backStage))
                }
        });
    AppMagic.UI.Pages.define("/controls/backStage/backStage.html", BackStageView)
})();