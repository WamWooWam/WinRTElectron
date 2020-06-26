//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var util = AppMagic.Utility,
        Checkbox = WinJS.Class.define(function Checkbox_ctor(){}, {
            initControlContext: function(controlContext) {
                AppMagic.Utility.createOrSetPrivate(controlContext, "_previousState", null);
                var checked = controlContext.modelProperties.Value;
                (typeof checked == "undefined" || checked === null) && controlContext.properties.Value(controlContext.properties.Default())
            }, initView: function(container, controlContext) {
                    controlContext.handleChange = function(viewModel, evt) {
                        var checkbox = evt.target,
                            state = checkbox.checked;
                        return state === controlContext._previousState ? !0 : (state ? controlContext.behaviors.OnCheck() : controlContext.behaviors.OnUncheck(), controlContext._previousState = state, controlContext.modelProperties.Value.setValue(state), controlContext.behaviors.OnSelect(), !0)
                    };
                    ko.applyBindings(controlContext, container);
                    container.addEventListener("keydown", this._onKeyDown)
                }, disposeView: function(container, controlContext) {
                    container.removeEventListener("keydown", this._onKeyDown)
                }, _onKeyDown: function(evt) {
                    AppMagic.KeyboardHandlers.stopPropagationOfCursorNavigation(evt)
                }, onChangeValue: function(evt, controlContext) {
                    controlContext._previousState = null
                }, onChangeDefault: function(evt, controlContext) {
                    controlContext.modelProperties.Value.setValue(evt.newValue)
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Controls", {Checkbox: Checkbox})
})();