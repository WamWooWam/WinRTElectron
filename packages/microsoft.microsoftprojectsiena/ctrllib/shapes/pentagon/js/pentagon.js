//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var Polygon = AppMagic.Controls.Shapes.Polygon,
        Pentagon = WinJS.Class.derive(Polygon, function Pentagon_ctor(){}, {
            initView: function(container, controlContext) {
                Polygon.prototype.initView.call(this, container, controlContext)
            }, _getPoints: function(controlContext) {
                    var width = controlContext.modelProperties.Width.getValue() || 0,
                        height = controlContext.modelProperties.Height.getValue() || 0,
                        p1x = width * .5,
                        p1y = 0,
                        p2x = 0,
                        p2y = height * .4,
                        p3x = width * .2,
                        p3y = height,
                        p4x = width * .8,
                        p4y = height,
                        p5x = width,
                        p5y = height * .4;
                    return Polygon.formatPoints([p1x, p2x, p3x, p4x, p5x], [p1y, p2y, p3y, p4y, p5y])
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Controls.Shapes", {Pentagon: Pentagon})
})();