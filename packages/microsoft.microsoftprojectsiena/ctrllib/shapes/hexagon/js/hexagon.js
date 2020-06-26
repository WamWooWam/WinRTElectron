//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var Polygon = AppMagic.Controls.Shapes.Polygon,
        Hexagon = WinJS.Class.derive(Polygon, function Hexagon_ctor(){}, {
            initView: function(container, controlContext) {
                Polygon.prototype.initView.call(this, container, controlContext)
            }, _getPoints: function(controlContext) {
                    var width = controlContext.modelProperties.Width.getValue() || 0,
                        height = controlContext.modelProperties.Height.getValue() || 0,
                        p1x = width * .25,
                        p1y = 0,
                        p2x = 0,
                        p2y = height * .5,
                        p3x = width * .25,
                        p3y = height,
                        p4x = width * .75,
                        p4y = height,
                        p5x = width,
                        p5y = height * .5,
                        p6x = width * .75,
                        p6y = 0;
                    return Polygon.formatPoints([p1x, p2x, p3x, p4x, p5x, p6x], [p1y, p2y, p3y, p4y, p5y, p6y])
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Controls.Shapes", {Hexagon: Hexagon})
})();