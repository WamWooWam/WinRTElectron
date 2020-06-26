//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var util = AppMagic.Utility,
        Text = WinJS.Class.define(function Text_ctor(){}, {
            initControlContext: function(controlContext) {
                controlContext.modelProperties.Text.setValue(controlContext.modelProperties.Default.getValue())
            }, initView: function(container, controlContext) {
                    container.oninput = this._updateText.bind(this, controlContext);
                    ko.applyBindings(controlContext, container);
                    container.addEventListener("keydown", this._onKeyDown)
                }, disposeView: function(container, controlContext) {
                    container.removeEventListener("keydown", this._onKeyDown)
                }, _onKeyDown: function(evt) {
                    AppMagic.KeyboardHandlers.stopPropagationOfCursorNavigation(evt)
                }, onChangeAlign: function(evt, controlContext) {
                    this._redrawText(controlContext)
                }, onChangeMode: function(evt, controlContext) {
                    this._redrawText(controlContext)
                }, onChangeDefault: function(evt, controlContext) {
                    controlContext.modelProperties.Text.setValue(evt.newValue)
                }, _redrawText: function(controlContext) {
                    var saveText = controlContext.modelProperties.Text.getValue();
                    controlContext.modelProperties.Text.setValue("", !0);
                    controlContext.modelProperties.Text.setValue(saveText, !0)
                }, _updateText: function(controlContext, evt) {
                    evt.target.value !== controlContext.properties.Text() && AppMagic.Utility.executeImmediatelyAsync(function() {
                        controlContext.properties.Text(evt.target.value)
                    }.bind(this))
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Controls", {Text: Text})
})();