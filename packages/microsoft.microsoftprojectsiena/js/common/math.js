//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var Matrix = WinJS.Class.define(function Matrix_ctor(values) {
            this._values = typeof values == "undefined" ? [1, 0, 0, 1, 0, 0, ] : values
        }, {
            _values: null, multiply: function(other) {
                    var a = this._values,
                        b = other._values;
                    return this._values = [a[0] * b[0] + a[1] * b[2], a[0] * b[1] + a[1] * b[3], a[2] * b[0] + a[3] * b[2], a[2] * b[1] + a[3] * b[3], a[4] * b[0] + a[5] * b[2] + b[4], a[4] * b[1] + a[5] * b[3] + b[5], ], this
                }, transformPoint: function(point) {
                    return {
                            x: point.x * this._values[0] + point.y * this._values[2] + this._values[4], y: point.x * this._values[1] + point.y * this._values[3] + this._values[5]
                        }
                }
        }, {
            scale: function(x, y) {
                return new Matrix([x, 0, 0, y, 0, 0])
            }, translate: function(offsetX, offsetY) {
                    return new Matrix([1, 0, 0, 1, offsetX, offsetY])
                }
        }),
        RectangleUtil = {
            clamp: function(innerBounds, outerBounds) {
                innerBounds.right > outerBounds.right && RectangleUtil.offset(innerBounds, outerBounds.right - innerBounds.right, 0);
                innerBounds.left < 0 && RectangleUtil.offset(innerBounds, -innerBounds.left, 0);
                innerBounds.bottom > outerBounds.bottom && RectangleUtil.offset(innerBounds, 0, outerBounds.bottom - innerBounds.bottom);
                innerBounds.top < 0 && RectangleUtil.offset(innerBounds, 0, -innerBounds.top)
            }, clone: function(source) {
                    return {
                            left: source.left, top: source.top, right: source.right, bottom: source.bottom
                        }
                }, contains: function(first, second) {
                    return second.left >= first.left && second.left <= first.right && second.right >= first.left && second.right <= first.right && second.top >= first.top && second.top <= first.bottom && second.bottom >= first.top && second.bottom <= first.bottom
                }, equals: function(first, second) {
                    return first.left === second.left && first.top === second.top && first.right === second.right && first.bottom === second.bottom
                }, getSegment: function(source, segment) {
                    RectangleSegment.verify(segment);
                    switch (segment) {
                        case RectangleSegment.left:
                            return {
                                    left: source.left, top: source.top, right: source.left, bottom: source.bottom
                                };
                        case RectangleSegment.top:
                            return {
                                    left: source.left, top: source.top, right: source.right, bottom: source.top
                                };
                        case RectangleSegment.right:
                            return {
                                    left: source.right, top: source.top, right: source.right, bottom: source.bottom
                                };
                        case RectangleSegment.bottom:
                            return {
                                    left: source.left, top: source.bottom, right: source.right, bottom: source.bottom
                                };
                        case RectangleSegment.horizontalCenter:
                            var y = (source.top + source.bottom) / 2;
                            return {
                                    left: source.left, top: y, right: source.right, bottom: y
                                };
                        case RectangleSegment.verticalCenter:
                            var x = (source.left + source.right) / 2;
                            return {
                                    left: x, top: source.top, right: x, bottom: source.bottom
                                };
                        case RectangleSegment.x:
                            return RectangleUtil.clone(source);
                        case RectangleSegment.y:
                            return RectangleUtil.clone(source);
                        default:
                            break
                    }
                    return RectangleUtil.clone(source)
                }, getInfiniteSegment: function(source, segment) {
                    RectangleSegment.verify(segment);
                    switch (segment) {
                        case RectangleSegment.left:
                            return {
                                    left: source.left, top: -Infinity, right: source.left, bottom: Infinity
                                };
                        case RectangleSegment.top:
                            return {
                                    left: -Infinity, top: source.top, right: Infinity, bottom: source.top
                                };
                        case RectangleSegment.right:
                            return {
                                    left: source.right, top: -Infinity, right: source.right, bottom: Infinity
                                };
                        case RectangleSegment.bottom:
                            return {
                                    left: -Infinity, top: source.bottom, right: Infinity, bottom: source.bottom
                                };
                        case RectangleSegment.horizontalCenter:
                            var y = (source.top + source.bottom) / 2;
                            return {
                                    left: -Infinity, top: y, right: Infinity, bottom: y
                                };
                        case RectangleSegment.verticalCenter:
                            var x = (source.left + source.right) / 2;
                            return {
                                    left: x, top: -Infinity, right: x, bottom: Infinity
                                };
                        case RectangleSegment.x:
                            return {
                                    left: source.left, top: -Infinity, right: source.left, bottom: Infinity
                                };
                        case RectangleSegment.y:
                            return {
                                    left: -Infinity, top: source.top, right: Infinity, bottom: source.top
                                };
                        default:
                            break
                    }
                    return RectangleUtil.clone(source)
                }, intersects: function(first, second) {
                    return first.left <= second.right && first.right >= second.left && first.top <= second.bottom && first.bottom >= second.top
                }, offset: function(bounds, offsetX, offsetY) {
                    bounds.left += offsetX;
                    bounds.right += offsetX;
                    bounds.top += offsetY;
                    bounds.bottom += offsetY
                }, union: function(first, second) {
                    first.left = Math.min(first.left, second.left);
                    first.top = Math.min(first.top, second.top);
                    first.right = Math.max(first.right, second.right);
                    first.bottom = Math.max(first.bottom, second.bottom)
                }, areaOfIntersection: function(first, second) {
                    if (this.intersects(first, second)) {
                        var left = Math.max(first.left, second.left),
                            topPosition = Math.max(first.top, second.top),
                            right = Math.min(first.right, second.right),
                            bottom = Math.min(first.bottom, second.bottom),
                            area = (bottom - topPosition) * (right - left);
                        return area
                    }
                    else
                        return 0
                }, intersection: function(first, second) {
                    return this.intersects(first, second) ? {
                            left: Math.max(first.left, second.left), top: Math.max(first.top, second.top), right: Math.min(first.right, second.right), bottom: Math.min(first.bottom, second.bottom)
                        } : null
                }
        },
        RectangleSegment = {
            left: 1, top: 2, right: 4, bottom: 8, horizontalCenter: 16, verticalCenter: 32, x: 64, y: 128, toString: function(value) {
                    var names = [];
                    for (var memberName in RectangleSegment) {
                        var memberValue = RectangleSegment[memberName];
                        typeof memberValue == "number" && value & memberValue && names.push(memberName)
                    }
                    return names.join(" | ")
                }, verify: function(value) {
                    switch (value) {
                        case RectangleSegment.left:
                        case RectangleSegment.top:
                        case RectangleSegment.right:
                        case RectangleSegment.bottom:
                        case RectangleSegment.horizontalCenter:
                        case RectangleSegment.verticalCenter:
                        case RectangleSegment.x:
                        case RectangleSegment.y:
                            break;
                        default:
                            break
                    }
                }
        },
        RectangleSegmentGroups = {
            horizontal: RectangleSegment.top | RectangleSegment.bottom | RectangleSegment.y, vertical: RectangleSegment.left | RectangleSegment.right | RectangleSegment.x, allArray: [RectangleSegment.left, RectangleSegment.right, RectangleSegment.horizontalCenter, RectangleSegment.top, RectangleSegment.bottom, RectangleSegment.verticalCenter]
        };
    WinJS.Namespace.define("AppMagic.Math", {
        Matrix: Matrix, RectangleSegment: RectangleSegment, RectangleSegmentGroups: RectangleSegmentGroups, RectangleUtil: RectangleUtil
    })
})();