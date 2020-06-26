//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var Polygon = AppMagic.Controls.Shapes.Polygon,
        Star = WinJS.Class.derive(Polygon, function Star_ctor(){}, {
            initView: function(container, controlContext) {
                Polygon.prototype.initView.call(this, container, controlContext)
            }, _getPoints: function(controlContext) {
                    var variant = controlContext.controlWidget.getControlInfo().variantName;
                    switch (variant) {
                        case"star6":
                            return this._getPointsSixStar(controlContext);
                        case"star8":
                            return this._getPointsEightStar(controlContext);
                        case"star12":
                            return this._getPointsTwelveStar(controlContext);
                        default:
                            return this._getPointsFiveStar(controlContext)
                    }
                }, _getPointsFiveStar: function(controlContext) {
                    var width = controlContext.modelProperties.Width.getValue() || 0,
                        height = controlContext.modelProperties.Height.getValue() || 0,
                        p1x = width * .5,
                        p1y = 0,
                        p2x = width * .38,
                        p2y = height * .38,
                        p3x = 0,
                        p3y = height * .38,
                        p4x = width * .31,
                        p4y = height * .62,
                        p5x = width * .19,
                        p5y = height,
                        p6x = width * .5,
                        p6y = height * .76,
                        p7x = width * .81,
                        p7y = height,
                        p8x = width * .69,
                        p8y = height * .62,
                        p9x = width,
                        p9y = height * .38,
                        p10x = width * .62,
                        p10y = height * .38;
                    return Polygon.formatPoints([p1x, p2x, p3x, p4x, p5x, p6x, p7x, p8x, p9x, p10x], [p1y, p2y, p3y, p4y, p5y, p6y, p7y, p8y, p9y, p10y])
                }, _getPointsSixStar: function(controlContext) {
                    var width = controlContext.modelProperties.Width.getValue() || 0,
                        height = controlContext.modelProperties.Height.getValue() || 0,
                        p1x = width * .5,
                        p1y = 0,
                        p2x = width * .35,
                        p2y = height * .25,
                        p3x = width * .07,
                        p3y = height * .25,
                        p4x = width * .21,
                        p4y = height * .5,
                        p5x = width * .07,
                        p5y = height * .75,
                        p6x = width * .35,
                        p6y = height * .75,
                        p7x = width * .5,
                        p7y = height,
                        p8x = width * .65,
                        p8y = height * .75,
                        p9x = width * .93,
                        p9y = height * .75,
                        p10x = width * .79,
                        p10y = height * .5,
                        p11x = width * .93,
                        p11y = height * .25,
                        p12x = width * .65,
                        p12y = height * .25;
                    return Polygon.formatPoints([p1x, p2x, p3x, p4x, p5x, p6x, p7x, p8x, p9x, p10x, p11x, p12x], [p1y, p2y, p3y, p4y, p5y, p6y, p7y, p8y, p9y, p10y, p11y, p12y])
                }, _getPointsEightStar: function(controlContext) {
                    var width = controlContext.modelProperties.Width.getValue() || 0,
                        height = controlContext.modelProperties.Height.getValue() || 0,
                        p1x = width * .5,
                        p1y = 0,
                        p2x = width * .41,
                        p2y = height * .28,
                        p3x = width * .15,
                        p3y = height * .15,
                        p4x = width * .28,
                        p4y = height * .41,
                        p5x = 0,
                        p5y = height * .5,
                        p6x = width * .28,
                        p6y = height * .59,
                        p7x = width * .15,
                        p7y = height * .85,
                        p8x = width * .41,
                        p8y = height * .72,
                        p9x = width * .5,
                        p9y = height,
                        p10x = width * .59,
                        p10y = height * .72,
                        p11x = width * .85,
                        p11y = height * .85,
                        p12x = width * .72,
                        p12y = height * .59,
                        p13x = width,
                        p13y = height * .5,
                        p14x = width * .72,
                        p14y = height * .41,
                        p15x = width * .85,
                        p15y = height * .15,
                        p16x = width * .59,
                        p16y = height * .28;
                    return Polygon.formatPoints([p1x, p2x, p3x, p4x, p5x, p6x, p7x, p8x, p9x, p10x, p11x, p12x, p13x, p14x, p15x, p16x], [p1y, p2y, p3y, p4y, p5y, p6y, p7y, p8y, p9y, p10y, p11y, p12y, p13y, p14y, p15y, p16y])
                }, _getPointsTwelveStar: function(controlContext) {
                    var width = controlContext.modelProperties.Width.getValue() || 0,
                        height = controlContext.modelProperties.Height.getValue() || 0,
                        p1x = width * .5,
                        p1y = 0,
                        p2x = width * .42,
                        p2y = height * .2,
                        p3x = width * .25,
                        p3y = height * .07,
                        p4x = width * .28,
                        p4y = height * .28,
                        p5x = width * .07,
                        p5y = height * .25,
                        p6x = width * .2,
                        p6y = height * .42,
                        p7x = 0,
                        p7y = height * .5,
                        p8x = width * .2,
                        p8y = height * .58,
                        p9x = width * .07,
                        p9y = height * .75,
                        p10x = width * .28,
                        p10y = height * .72,
                        p11x = width * .25,
                        p11y = height * .93,
                        p12x = width * .42,
                        p12y = height * .8,
                        p13x = width * .5,
                        p13y = height,
                        p14x = width * .58,
                        p14y = height * .8,
                        p15x = width * .75,
                        p15y = height * .93,
                        p16x = width * .72,
                        p16y = height * .72,
                        p17x = width * .93,
                        p17y = height * .75,
                        p18x = width * .8,
                        p18y = height * .58,
                        p19x = width,
                        p19y = height * .5,
                        p20x = width * .8,
                        p20y = height * .42,
                        p21x = width * .93,
                        p21y = height * .25,
                        p22x = width * .72,
                        p22y = height * .28,
                        p23x = width * .75,
                        p23y = height * .07,
                        p24x = width * .58,
                        p24y = height * .2;
                    return Polygon.formatPoints([p1x, p2x, p3x, p4x, p5x, p6x, p7x, p8x, p9x, p10x, p11x, p12x, p13x, p14x, p15x, p16x, p17x, p18x, p19x, p20x, p21x, p22x, p23x, p24x], [p1y, p2y, p3y, p4y, p5y, p6y, p7y, p8y, p9y, p10y, p11y, p12y, p13y, p14y, p15y, p16y, p17y, p18y, p19y, p20y, p21y, p22y, p23y, p24y])
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Controls.Shapes", {Star: Star})
})();