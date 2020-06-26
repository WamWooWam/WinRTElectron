//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var util = AppMagic.Utility,
        Shape = WinJS.Class.define(function Shape_ctor(){}, {
            initView: function(container, controlContext) {
                util.createOrSetPrivate(controlContext, "Fill", ko.computed(function() {
                    var fill = null;
                    return (controlContext.viewState.disabled() ? fill = controlContext.properties.DisabledFill() : controlContext.viewState.pressed() ? fill = controlContext.properties.PressedFill() : controlContext.viewState.hovering() && (fill = controlContext.properties.HoverFill()), fill === null || fill === "") ? controlContext.properties.Fill() : fill
                }));
                util.createOrSetPrivate(controlContext, "onClickHandler", function() {
                    controlContext.viewState.disabled() || controlContext.behaviors.OnSelect()
                });
                var viewBox = ko.observable("0 0 " + controlContext.properties.Width() + " " + controlContext.properties.Height());
                Object.defineProperty(controlContext, "viewBox", {
                    configurable: !1, enumerable: !0, value: viewBox, writable: !0
                });
                ko.applyBindings(controlContext, container)
            }, onChangeBorderStyle: function(evt, controlContext) {
                    controlContext.realized && this.draw(controlContext)
                }, disposeView: function(container, controlContext){}, onChangeWidth: function(evt, controlContext) {
                    this._updateViewBoxAndDraw(controlContext)
                }, onChangeHeight: function(evt, controlContext) {
                    this._updateViewBoxAndDraw(controlContext)
                }, onChangeBorderThickness: function(evt, controlContext) {
                    controlContext.realized && this.draw(controlContext)
                }, _updateViewBoxAndDraw: function(controlContext) {
                    controlContext.realized && (controlContext.viewBox("0 0 " + controlContext.properties.Width() + " " + controlContext.properties.Height()), this.draw(controlContext))
                }, draw: function(controlContext){}
        }, {}),
        Polygon = WinJS.Class.derive(Shape, function Polygon_ctor() {
            Shape.call(this)
        }, {
            initView: function(container, controlContext) {
                var points = ko.observable(this._getPoints(controlContext));
                Object.defineProperty(controlContext, "shape", {
                    configurable: !1, enumerable: !0, value: {points: points}, writable: !0
                });
                Shape.prototype.initView.call(this, container, controlContext)
            }, draw: function(controlContext) {
                    controlContext.shape.points(this._getPoints(controlContext))
                }, _getPoints: function(controlContext){}
        }, {formatPoints: function(xcoords, ycoords) {
                for (var splitter = " ", xysplitter = ",", output = xcoords[0] + xysplitter + ycoords[0], i = 1; i < xcoords.length && i < ycoords.length; i++)
                    output += splitter,
                    output += xcoords[i] + xysplitter + ycoords[i];
                return output
            }});
    WinJS.Namespace.define("AppMagic.Controls.Shapes", {
        Shape: Shape, Polygon: Polygon
    })
})();