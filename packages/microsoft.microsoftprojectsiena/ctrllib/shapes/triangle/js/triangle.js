//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var Polygon = AppMagic.Controls.Shapes.Polygon,
        Triangle = WinJS.Class.derive(Polygon, function Triangle_ctor(){}, {
            initView: function(container, controlContext) {
                Polygon.prototype.initView.call(this, container, controlContext)
            }, _getPoints: function(controlContext) {
                    var variant = controlContext.controlWidget.getControlInfo().variantName;
                    return variant === "rightAngled" ? this._pointsForRightAngled(controlContext) : this._pointsForEquilateral(controlContext)
                }, _pointsForEquilateral: function(controlContext) {
                    var width = controlContext.modelProperties.Width.getValue() || 0,
                        height = controlContext.modelProperties.Height.getValue() || 0,
                        p1x = width * .5,
                        p1y = 0,
                        p2x = 0,
                        p2y = height,
                        p3x = width,
                        p3y = height;
                    return Polygon.formatPoints([p1x, p2x, p3x], [p1y, p2y, p3y])
                }, _pointsForRightAngled: function(controlContext) {
                    var width = controlContext.modelProperties.Width.getValue() || 0,
                        height = controlContext.modelProperties.Height.getValue() || 0,
                        p1x = 0,
                        p1y = 0,
                        p2x = 0,
                        p2y = height,
                        p3x = width,
                        p3y = height;
                    return Polygon.formatPoints([p1x, p2x, p3x], [p1y, p2y, p3y])
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Controls.Shapes", {Triangle: Triangle})
})();