//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var Label = WinJS.Class.define(function Label_ctor(){}, {
            initView: function(container, controlContext) {
                ko.applyBindings(controlContext, container);
                container.addEventListener("keydown", this.onKeyDown)
            }, onKeyDown: function(evt) {
                    (evt.key === "End" || evt.key === "Home") && evt.stopPropagation()
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Controls", {Label: Label})
})();