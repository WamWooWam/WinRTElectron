//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var util = AppMagic.Utility,
        Button = WinJS.Class.define(function Button_ctor(){}, {
            initView: function(container, controlContext) {
                util.createOrSetPrivate(controlContext, "handleClick", this._handleClick.bind(this, controlContext));
                util.createOrSetPrivate(controlContext, "handleMouseDown", this._handleMouseDown.bind(this, controlContext));
                util.createOrSetPrivate(controlContext, "handleMouseUp", this._handleMouseUpOrOut.bind(this, controlContext));
                util.createOrSetPrivate(controlContext, "handleMouseOut", this._handleMouseUpOrOut.bind(this, controlContext));
                container.addEventListener("keydown", this._onKeyDown);
                ko.applyBindings(controlContext, container)
            }, disposeView: function(container, controlContext) {
                    container.removeEventListener("keydown", this._onKeyDown)
                }, _onKeyDown: function(evt) {
                    AppMagic.KeyboardHandlers.stopPropagationOfCursorNavigation(evt)
                }, _handleClick: function(controlContext) {
                    return controlContext.viewState.disabled() || controlContext.behaviors.OnSelect(), !1
                }, _handleMouseDown: function(controlContext) {
                    return controlContext.viewState.disabled() || controlContext.properties.Pressed(!0), !0
                }, _handleMouseUpOrOut: function(controlContext) {
                    return controlContext.viewState.disabled() || controlContext.properties.Pressed(!1), !0
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Controls", {Button: Button})
})();