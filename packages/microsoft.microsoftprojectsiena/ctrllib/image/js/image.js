//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var util = AppMagic.Utility,
        converters = AppMagic.Controls.converters,
        Image = WinJS.Class.define(function Image_ctor(){}, {
            initControlContext: function(controlContext) {
                util.createOrSetPrivate(controlContext, "imageUrl", ko.observable(""));
                util.createOrSetPrivate(controlContext, "_isLoaded", !0)
            }, disposeControlContext: function(controlContext) {
                    controlContext._isLoaded = !1;
                    delete controlContext.imageUrl
                }, initView: function(container, controlContext) {
                    util.createOrSetPrivate(controlContext, "onClickHandler", function() {
                        controlContext.viewState.disabled() || controlContext.behaviors.OnSelect()
                    });
                    ko.applyBindings(controlContext, container)
                }, onChangeImage: function(evt, controlContext) {
                    util.mediaUrlHelper(evt.oldValue, evt.newValue, !0).then(function(src) {
                        controlContext._isLoaded && controlContext.imageUrl(src)
                    }, function(){})
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Controls", {Image: Image})
})();