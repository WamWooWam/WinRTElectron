//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var Polygon = AppMagic.Controls.Shapes.Polygon,
        Rectangle = WinJS.Class.derive(Polygon, function Rectangle_ctor(){}, {
            initView: function(container, controlContext) {
                Polygon.prototype.initView.call(this, container, controlContext)
            }, _getPoints: function(controlContext) {
                    var width = controlContext.modelProperties.Width.getValue() || 0,
                        height = controlContext.modelProperties.Height.getValue() || 0,
                        p1x = 0,
                        p1y = 0,
                        p2x = 0,
                        p2y = height,
                        p3x = width,
                        p3y = height,
                        p4x = width,
                        p4y = 0;
                    return Polygon.formatPoints([p1x, p2x, p3x, p4x], [p1y, p2y, p3y, p4y])
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Controls.Shapes", {Rectangle: Rectangle})
})();