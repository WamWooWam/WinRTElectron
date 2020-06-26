//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var util = AppMagic.Utility,
        Polygon = AppMagic.Controls.Shapes.Polygon,
        Shape = AppMagic.Controls.Shapes.Shape,
        BORDERTHICKNESS = 5,
        BORDERTHICKNESSBYTWO = BORDERTHICKNESS / 2,
        Arrow = WinJS.Class.derive(Shape, function Arrow_ctor(){}, {
            _strokeWidth: ko.observable(BORDERTHICKNESS), initView: function(container, controlContext) {
                    util.createOrSetPrivate(controlContext, "Fill", ko.computed(function() {
                        var fill = controlContext.properties.Fill();
                        return (controlContext.viewState.disabled() ? fill = controlContext.properties.DisabledFill() : controlContext.viewState.pressed() ? fill = controlContext.properties.PressedFill() : controlContext.viewState.hovering() && (fill = controlContext.properties.HoverFill()), fill === null || fill === "") ? "transparent" : fill
                    }));
                    var borderThicknessByTwo = this._strokeWidth() * .5,
                        halfWidth = controlContext.modelProperties.Width.getValue() * .5,
                        halfHeight = controlContext.modelProperties.Height.getValue() * .5,
                        outerCircle = {
                            cx: ko.observable(halfWidth), cy: ko.observable(halfHeight), rx: ko.observable(halfWidth - borderThicknessByTwo), ry: ko.observable(halfHeight - borderThicknessByTwo), strokeWidth: ko.observable(BORDERTHICKNESS)
                        },
                        points = ko.observable(this._getArrowPoints(controlContext));
                    Object.defineProperty(controlContext, "arrow", {
                        configurable: !1, enumerable: !0, value: {points: points}, writable: !0
                    });
                    Object.defineProperty(controlContext, "outerCircle", {
                        configurable: !1, enumerable: !0, value: outerCircle, writable: !0
                    });
                    this._drawCircle(controlContext);
                    Shape.prototype.initView.call(this, container, controlContext)
                }, draw: function(controlContext) {
                    controlContext.arrow.points(this._getArrowPoints(controlContext));
                    this._drawCircle(controlContext)
                }, _getArrowPoints: function(controlContext) {
                    var variant = controlContext.controlWidget.getControlInfo().variantName;
                    return variant === "backArrow" ? this._pointsForBackArrow(controlContext) : this._pointsForForwardArrow(controlContext)
                }, _drawCircle: function(controlContext) {
                    var borderThicknessByTwo = this._strokeWidth() * .5,
                        halfWidth = controlContext.modelProperties.Width.getValue() * .5,
                        halfHeight = controlContext.modelProperties.Height.getValue() * .5;
                    controlContext.outerCircle.cx(halfWidth);
                    controlContext.outerCircle.rx(halfWidth - borderThicknessByTwo);
                    controlContext.outerCircle.cy(halfHeight);
                    controlContext.outerCircle.ry(halfHeight - borderThicknessByTwo);
                    controlContext.outerCircle.strokeWidth(this._strokeWidth())
                }, _pointsForForwardArrow: function(controlContext) {
                    var width = controlContext.modelProperties.Width.getValue() - BORDERTHICKNESS,
                        height = controlContext.modelProperties.Height.getValue() - BORDERTHICKNESS,
                        p1x = width * .25 + BORDERTHICKNESSBYTWO,
                        p1y = height * .45 + BORDERTHICKNESSBYTWO,
                        p2x = width * .57 + BORDERTHICKNESSBYTWO,
                        p2y = p1y,
                        p3x = width * .42 + BORDERTHICKNESSBYTWO,
                        p3y = height * .3 + BORDERTHICKNESSBYTWO,
                        p4x = width * .57 + BORDERTHICKNESSBYTWO,
                        p4y = p3y,
                        p5x = width * .8 + BORDERTHICKNESSBYTWO,
                        p5y = height * .5 + BORDERTHICKNESSBYTWO,
                        p6x = p4x,
                        p6y = height * .7 + BORDERTHICKNESSBYTWO,
                        p7x = p3x,
                        p7y = p6y,
                        p8x = p2x,
                        p8y = height * .55 + BORDERTHICKNESSBYTWO,
                        p9x = p1x,
                        p9y = p8y;
                    return this._strokeWidth((p8y - p1y) / 2), Polygon.formatPoints([p1x, p2x, p3x, p4x, p5x, p6x, p7x, p8x, p9x], [p1y, p2y, p3y, p4y, p5y, p6y, p7y, p8y, p9y])
                }, _pointsForBackArrow: function(controlContext) {
                    var width = controlContext.modelProperties.Width.getValue() - BORDERTHICKNESS,
                        height = controlContext.modelProperties.Height.getValue() - BORDERTHICKNESS,
                        p1x = width * .2 + BORDERTHICKNESSBYTWO,
                        p1y = height * .5 + BORDERTHICKNESSBYTWO,
                        p2x = width * .42 + BORDERTHICKNESSBYTWO,
                        p2y = height * .3 + BORDERTHICKNESSBYTWO,
                        p3x = width * .57 + BORDERTHICKNESSBYTWO,
                        p3y = p2y,
                        p4x = width * .42 + BORDERTHICKNESSBYTWO,
                        p4y = height * .45 + BORDERTHICKNESSBYTWO,
                        p5x = width * .75 + BORDERTHICKNESSBYTWO,
                        p5y = p4y,
                        p6x = p5x,
                        p6y = height * .55 + BORDERTHICKNESSBYTWO,
                        p7x = p4x,
                        p7y = p6y,
                        p8x = p3x,
                        p8y = height * .7 + BORDERTHICKNESSBYTWO,
                        p9x = p2x,
                        p9y = p8y;
                    return this._strokeWidth((p6y - p4y) / 2), Polygon.formatPoints([p1x, p2x, p3x, p4x, p5x, p6x, p7x, p8x, p9x], [p1y, p2y, p3y, p4y, p5y, p6y, p7y, p8y, p9y])
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Controls.Shapes", {Arrow: Arrow})
})();