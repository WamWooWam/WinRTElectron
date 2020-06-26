//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var Polygon = AppMagic.Controls.Shapes.Polygon,
        Octagon = WinJS.Class.derive(Polygon, function Octagon_ctor(){}, {
            initView: function(container, controlContext) {
                Polygon.prototype.initView.call(this, container, controlContext)
            }, _getPoints: function(controlContext) {
                    var width = controlContext.modelProperties.Width.getValue() || 0,
                        height = controlContext.modelProperties.Height.getValue() || 0,
                        thirtyPercentWidth = width * .3,
                        thirtyPercentHeight = height * .3,
                        seventyPercentWidth = width * .7,
                        seventyPercentHeight = height * .7,
                        p1x = thirtyPercentWidth,
                        p1y = 0,
                        p2x = 0,
                        p2y = thirtyPercentHeight,
                        p3x = 0,
                        p3y = seventyPercentHeight,
                        p4x = thirtyPercentWidth,
                        p4y = height,
                        p5x = seventyPercentWidth,
                        p5y = height,
                        p6x = width,
                        p6y = seventyPercentHeight,
                        p7x = width,
                        p7y = thirtyPercentHeight,
                        p8x = seventyPercentWidth,
                        p8y = 0;
                    return Polygon.formatPoints([p1x, p2x, p3x, p4x, p5x, p6x, p7x, p8x], [p1y, p2y, p3y, p4y, p5y, p6y, p7y, p8y])
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Controls.Shapes", {Octagon: Octagon})
})();