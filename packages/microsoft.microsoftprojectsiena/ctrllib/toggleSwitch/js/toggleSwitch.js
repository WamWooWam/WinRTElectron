//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var util = AppMagic.Utility,
        toggleSwitch = WinJS.Class.define(function ToggleSwitch_ctor(){}, {
            initControlContext: function(controlContext) {
                controlContext.modelProperties.Value.setValue(controlContext.modelProperties.Default.getValue())
            }, initView: function(container, controlContext) {
                    util.createOrSetPrivate(controlContext, "ToggleFill", ko.computed(function() {
                        return controlContext.viewState.disabled() ? controlContext.properties.ToggleDisabledFill() : controlContext.viewState.hovering() ? controlContext.properties.ToggleHoverFill() : controlContext.properties.ToggleFill()
                    }));
                    var toggleSwitchViewModel = new AppMagic.Controls.ToggleSwitchViewModel(controlContext, container);
                    util.createOrSetPrivate(controlContext, "_toggleSwitchViewModel", toggleSwitchViewModel);
                    util.createOrSetPrivate(controlContext, "_id", util.generateRandomId("toggleSwitch"));
                    this._updateRailsAndHandle(controlContext);
                    ko.applyBindings(toggleSwitchViewModel, container)
                }, disposeView: function(container, controlContext) {
                    controlContext._toggleSwitchViewModel.dispose();
                    controlContext._toggleSwitchViewModel = null
                }, onChangeDefault: function(evt, controlContext) {
                    var defaultValue = controlContext.modelProperties.Default.getValue() !== null ? controlContext.modelProperties.Default.getValue() : !1;
                    controlContext.modelProperties.Value.setValue(defaultValue);
                    this._updateOutputValue(controlContext)
                }, onChangeValue: function(evt, controlContext) {
                    if (controlContext.realized) {
                        var checked = controlContext.properties.Value();
                        controlContext.properties.Value(checked);
                        controlContext.behaviors.OnChange();
                        checked ? controlContext.behaviors.OnCheck() : controlContext.behaviors.OnUncheck();
                        this._updateRailsAndHandle(controlContext)
                    }
                }, onChangeHeight: function(evt, controlContext) {
                    controlContext.realized && this._updateRailsAndHandle(controlContext)
                }, onChangeWidth: function(evt, controlContext) {
                    controlContext.realized && this._updateRailsAndHandle(controlContext)
                }, _updateOutputValue: function(controlContext, value) {
                    var defaultValue = controlContext.modelProperties.Default.getValue() !== null ? controlContext.modelProperties.Default.getValue() : !1;
                    typeof value == "undefined" && (value = defaultValue);
                    value === null && (value = defaultValue !== null ? defaultValue : !1);
                    controlContext.modelProperties.Value.setValue(value)
                }, _updateRailsAndHandle: function(controlContext) {
                    controlContext.realized && (controlContext._toggleSwitchViewModel.updateRails(), controlContext._toggleSwitchViewModel.updateHandle(), controlContext._toggleSwitchViewModel.updateSwitch())
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Controls", {ToggleSwitch: toggleSwitch})
})();