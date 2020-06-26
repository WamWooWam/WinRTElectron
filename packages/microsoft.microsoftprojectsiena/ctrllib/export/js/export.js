//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(Platform) {"use strict";
    var util = AppMagic.Utility,
        Export = WinJS.Class.derive(AppMagic.Controls.Impex, function Export_ctor() {
            AppMagic.Controls.Impex.call(this)
        }, {
            initControlContext: function(controlContext) {
                util.createOrSetPrivate(controlContext, "clickHandler", function() {
                    if (!controlContext.viewState.disabled())
                        this.onImpexClicked(controlContext)
                }.bind(this));
                util.createOrSetPrivate(controlContext, "exportMode", !0);
                util.createOrSetPrivate(controlContext, "OpenAjax", controlContext.controlWidget);
                util.createOrSetPrivate(controlContext, "impexActive", !1)
            }, initView: function(container, controlContext) {
                    ko.applyBindings(controlContext, container);
                    container.addEventListener("keydown", this._onKeyDown)
                }, disposeView: function(container, controlContext) {
                    container.removeEventListener("keydown", this._onKeyDown)
                }, _onKeyDown: function(evt) {
                    AppMagic.KeyboardHandlers.stopPropagationOfCursorNavigation(evt)
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Controls", {Export: Export})
})(Windows);