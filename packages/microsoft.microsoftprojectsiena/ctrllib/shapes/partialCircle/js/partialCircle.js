//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var Shape = AppMagic.Controls.Shapes.Shape,
        PartialCircle = WinJS.Class.derive(Shape, function PartialCircle_ctor(){}, {
            initView: function(container, controlContext) {
                var path = ko.observable(this._getPath(controlContext));
                Object.defineProperty(controlContext, "shape", {
                    configurable: !1, enumerable: !0, value: {path: path}, writable: !0
                });
                Shape.prototype.initView.call(this, container, controlContext)
            }, draw: function(controlContext) {
                    controlContext.shape.path(this._getPath(controlContext))
                }, _getPath: function(controlContext) {
                    var variant = controlContext.controlWidget.getControlInfo().variantName;
                    switch (variant) {
                        case"quarterCircle":
                            return this._getPathForQuarterCircle(controlContext);
                        case"threequarterCircle":
                            return this._getPathForThreeQuarterCircle(controlContext);
                        default:
                            return this._getPathForHalfCircle(controlContext)
                    }
                }, _getPathForHalfCircle: function(controlContext) {
                    var width = controlContext.properties.Width() || 0,
                        height = controlContext.properties.Height() || 0,
                        halfWidth = width * .5,
                        halfHeight = height * .5,
                        path = "M" + halfWidth + "," + height + " ";
                    return path += "v-" + height + " ", path += "a" + halfWidth + "," + halfHeight + " ", path += "0 ", path += "1,0 ", path += "0" + "," + height, path + "z"
                }, _getPathForQuarterCircle: function(controlContext) {
                    var width = controlContext.properties.Width() || 0,
                        height = controlContext.properties.Height() || 0,
                        halfWidth = width * .5,
                        halfHeight = height * .5,
                        path = "M" + halfWidth + "," + halfHeight + " ";
                    return path += "v-" + halfHeight + " ", path += "a" + halfWidth + "," + halfHeight + " ", path += "0 ", path += "0,0 ", path += "-" + halfWidth + "," + halfHeight + " ", path + "z"
                }, _getPathForThreeQuarterCircle: function(controlContext) {
                    var halfWidth = controlContext.modelProperties.Width.getValue() * .5,
                        halfHeight = controlContext.modelProperties.Height.getValue() * .5,
                        path = "M" + halfWidth + "," + halfHeight + " ";
                    return path += "v-" + halfHeight + " ", path += "a" + halfWidth + "," + halfHeight + " ", path += "0 ", path += "1,0 ", path += halfWidth + "," + halfHeight, path + "z"
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Controls.Shapes", {PartialCircle: PartialCircle})
})();