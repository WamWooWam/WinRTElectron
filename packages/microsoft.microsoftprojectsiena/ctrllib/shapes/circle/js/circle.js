//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var Shape = AppMagic.Controls.Shapes.Shape,
        Circle = WinJS.Class.derive(Shape, function Circle_ctor(){}, {
            initView: function(container, controlContext) {
                var halfWidth = controlContext.modelProperties.Width.getValue() * .5,
                    halfHeight = controlContext.modelProperties.Height.getValue() * .5,
                    shape = {
                        cx: ko.observable(halfWidth), cy: ko.observable(halfHeight), rx: ko.observable(halfWidth), ry: ko.observable(halfHeight)
                    };
                Object.defineProperty(controlContext, "shape", {
                    configurable: !1, enumerable: !0, value: shape, writable: !0
                });
                Shape.prototype.initView.call(this, container, controlContext)
            }, draw: function(controlContext) {
                    var halfWidth = controlContext.modelProperties.Width.getValue() * .5,
                        halfHeight = controlContext.modelProperties.Height.getValue() * .5;
                    controlContext.shape.cx(halfWidth);
                    controlContext.shape.rx(halfWidth);
                    controlContext.shape.cy(halfHeight);
                    controlContext.shape.ry(halfHeight)
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Controls.Shapes", {Circle: Circle})
})();