//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var RectangleSegment = AppMagic.Math.RectangleSegment,
        RectangleSegmentGroups = AppMagic.Math.RectangleSegmentGroups,
        VisualSnapper = WinJS.Class.define(function VisualSnapper_ctor(selectionManager, visuals, zoom) {
            this._selectionManager = selectionManager;
            this._visuals = visuals;
            this._zoom = zoom;
            this._paths = ko.observable(this._createPathsObject())
        }, {
            _selectionManager: null, _visuals: null, _zoom: null, _gridSize: null, _guides: null, _paths: null, _snappedGuides: null, render: function() {
                    var paths = this._createPathsObject();
                    this._renderGuides(this._snappedGuides, paths);
                    this._paths(paths)
                }, start: function() {
                    this._gridSize = this._zoom.gridSize;
                    this._buildGuides()
                }, stop: function() {
                    var paths = this._createPathsObject();
                    this._paths(paths);
                    this._guides = null
                }, snap: function(evt, bounds) {
                    evt.altKey ? this._snappedGuides = [] : (this._snappedGuides = this._guides.snap(bounds), this._snappedGuides.length === 0 && this._snapToMacroGrid(bounds), bounds.left = Math.round(bounds.left), bounds.right = Math.round(bounds.right), bounds.top = Math.round(bounds.top), bounds.bottom = Math.round(bounds.bottom))
                }, paths: {get: function() {
                        return this._paths()
                    }}, visible: {get: function() {
                        var paths = this._paths();
                        return paths.alignment.data !== "" || paths.spacing.data !== "" || paths.triangles.data !== ""
                    }}, _buildGuides: function() {
                    this._guides = new GuideCollection;
                    for (var visuals = this._visuals().filter(function(visual) {
                            return this._selectionManager.visuals.indexOf(visual) < 0
                        }, this), j, len = visuals.length, guide, i = 0; i < len; i++) {
                        var bounds = visuals[i].bounds;
                        this._guides.addAlignmentGuides(bounds)
                    }
                    var selectedBounds = this._getSelectedBounds();
                    if (selectedBounds)
                        for (i = 0; i < len; i++) {
                            var firstBounds = visuals[i].bounds;
                            for (j = i + 1; j < len; j++) {
                                var secondBounds = visuals[j].bounds;
                                this._guides.addSpacingGuides(firstBounds, secondBounds, selectedBounds)
                            }
                        }
                }, _createPathsObject: function() {
                    return {
                            alignment: new AppMagic.Common.SvgPath, spacing: new AppMagic.Common.SvgPath, triangles: new AppMagic.Common.SvgPath
                        }
                }, _getSelectedBounds: function() {
                    if (this._selectionManager.visuals.length === 0)
                        return null;
                    for (var selectedBounds = {
                            left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity
                        }, i = 0, len = this._selectionManager.visuals.length; i < len; i++) {
                        var bounds = this._selectionManager.visuals[i].bounds;
                        AppMagic.Math.RectangleUtil.union(selectedBounds, bounds)
                    }
                    return selectedBounds.width = selectedBounds.right - selectedBounds.left, selectedBounds.height = selectedBounds.bottom - selectedBounds.top, selectedBounds
                }, _renderGuides: function(guides, paths) {
                    var selectedBounds = this._getSelectedBounds();
                    if (selectedBounds) {
                        var spacingVerticalGuides = guides.filter(function(guide) {
                                return guide.type === GuideType.spacing && guide.isHorizontal
                            }, this),
                            spacingHorizontalGuides = guides.filter(function(guide) {
                                return guide.type === GuideType.spacing && !guide.isHorizontal
                            }, this);
                        spacingVerticalGuides.length === 1 && guides.push(spacingVerticalGuides[0].other);
                        spacingHorizontalGuides.length === 1 && guides.push(spacingHorizontalGuides[0].other);
                        for (var i = 0, len = guides.length; i < len; i++)
                            guides[i].render(this._zoom.adornerScale, selectedBounds, paths)
                    }
                }, _snapToMacroGrid: function(bounds) {
                    var width = bounds.right - bounds.left,
                        height = bounds.bottom - bounds.top;
                    bounds.left = Math.round(bounds.left / this._gridSize) * this._gridSize;
                    bounds.top = Math.round(bounds.top / this._gridSize) * this._gridSize;
                    bounds.right = bounds.left + width;
                    bounds.bottom = bounds.top + height
                }
        }, {boundsGuideExtension: 15}),
        Guide = WinJS.Class.define(function Guide_ctor(type, segments, bounds, visualBounds) {
            GuideType.verify(type);
            bounds.left === bounds.right;
            bounds.left === bounds.right;
            this._type = type;
            this._segments = segments;
            this._bounds = bounds;
            this._visualBounds = visualBounds;
            this._mergeKey = [type, segments, bounds.left, bounds.top, bounds.right, bounds.bottom].join(",")
        }, {
            _type: null, _segments: null, _bounds: null, _visualBounds: null, equals: function(other) {
                    return this._type === other._type && this._segments === other._segments && AppMagic.Math.RectangleUtil.equals(this._bounds, other._bounds) && AppMagic.Math.RectangleUtil.equals(this._visualBounds, other._visualBounds)
                }, getDistance: function(bounds, segment) {
                    if (this._segments & segment)
                        switch (segment) {
                            case RectangleSegment.x:
                            case RectangleSegment.left:
                                return Math.abs(bounds.left - this._bounds.left);
                            case RectangleSegment.y:
                            case RectangleSegment.top:
                                return Math.abs(bounds.top - this._bounds.top);
                            case RectangleSegment.right:
                                return Math.abs(bounds.right - this._bounds.right);
                            case RectangleSegment.bottom:
                                return Math.abs(bounds.bottom - this._bounds.bottom);
                            case RectangleSegment.horizontalCenter:
                                return Math.abs((bounds.top + bounds.bottom) / 2 - this._bounds.top);
                            case RectangleSegment.verticalCenter:
                                return Math.abs((bounds.left + bounds.right) / 2 - this._bounds.left);
                            default:
                                break
                        }
                    return Infinity
                }, render: function(adornerScale, selectedBounds, paths) {
                    var line;
                    switch (this._type) {
                        case GuideType.centerAlignment:
                        case GuideType.edgeAlignment:
                            this.isHorizontal ? (paths.alignment.moveTo(Math.min(this._visualBounds.left, selectedBounds.left) - VisualSnapper.boundsGuideExtension, this._visualBounds.top), paths.alignment.horizontalTo(Math.max(this._visualBounds.right, selectedBounds.right) + VisualSnapper.boundsGuideExtension)) : (paths.alignment.moveTo(this._visualBounds.left, Math.min(this._visualBounds.top, selectedBounds.top) - VisualSnapper.boundsGuideExtension), paths.alignment.verticalTo(Math.max(this._visualBounds.bottom, selectedBounds.bottom) + VisualSnapper.boundsGuideExtension));
                            break;
                        case GuideType.spacing:
                            var visualBoundsEdge,
                                selectedEdge,
                                triangleSize = adornerScale * Guide.triangleSize;
                            if (this.isHorizontal) {
                                var x = Math.max(this._visualBounds.right, selectedBounds.right) + VisualSnapper.boundsGuideExtension;
                                visualBoundsEdge = this._visualBounds.top > selectedBounds.bottom ? this._visualBounds.top : this._visualBounds.bottom;
                                selectedEdge = this._visualBounds.top > selectedBounds.bottom ? selectedBounds.bottom : selectedBounds.top;
                                paths.spacing.moveTo(this._visualBounds.right, visualBoundsEdge);
                                paths.spacing.horizontalTo(x);
                                line = {
                                    x1: x, x2: x, y1: this._visualBounds.top, y2: selectedEdge
                                };
                                paths.alignment.line(line);
                                paths.triangles.lineTriangles(triangleSize, line);
                                paths.spacing.moveTo(selectedBounds.right, selectedEdge);
                                paths.spacing.horizontalTo(x)
                            }
                            else {
                                var y = Math.max(this._visualBounds.bottom, selectedBounds.bottom) + VisualSnapper.boundsGuideExtension;
                                visualBoundsEdge = this._visualBounds.left > selectedBounds.right ? this._visualBounds.left : this._visualBounds.right;
                                selectedEdge = this._visualBounds.left > selectedBounds.right ? selectedBounds.right : selectedBounds.left;
                                paths.spacing.moveTo(visualBoundsEdge, this._visualBounds.bottom);
                                paths.spacing.verticalTo(y);
                                line = {
                                    x1: visualBoundsEdge, x2: selectedEdge, y1: y, y2: y
                                };
                                paths.alignment.line(line);
                                paths.triangles.lineTriangles(triangleSize, line);
                                paths.spacing.moveTo(selectedEdge, selectedBounds.bottom);
                                paths.spacing.verticalTo(y)
                            }
                            break;
                        default:
                            break
                    }
                }, merge: function(other) {
                    AppMagic.Math.RectangleUtil.union(this._visualBounds, other._visualBounds)
                }, type: {get: function() {
                        return this._type
                    }}, bounds: {get: function() {
                        return this._bounds
                    }}, visualBounds: {get: function() {
                        return this._visualBounds
                    }}, isHorizontal: {get: function() {
                        return this._bounds.left !== this._bounds.right
                    }}, mergeKey: {get: function() {
                        return this._mergeKey
                    }}
        }, {triangleSize: 7}),
        GuideCollection = WinJS.Class.define(function GuideCollection_ctor() {
            this._guides = {}
        }, {
            _guides: null, add: function(newGuide) {
                    var mergeKey = newGuide.mergeKey;
                    return this._guides[mergeKey] ? this._guides[mergeKey].merge(newGuide) : this._guides[mergeKey] = newGuide, newGuide
                }, addAlignmentGuides: function(bounds) {
                    this.add(new Guide(GuideType.edgeAlignment, RectangleSegmentGroups.vertical, AppMagic.Math.RectangleUtil.getInfiniteSegment(bounds, RectangleSegment.left), AppMagic.Math.RectangleUtil.getSegment(bounds, RectangleSegment.left)));
                    this.add(new Guide(GuideType.edgeAlignment, RectangleSegmentGroups.vertical, AppMagic.Math.RectangleUtil.getInfiniteSegment(bounds, RectangleSegment.right), AppMagic.Math.RectangleUtil.getSegment(bounds, RectangleSegment.right)));
                    this.add(new Guide(GuideType.centerAlignment, RectangleSegment.verticalCenter, AppMagic.Math.RectangleUtil.getInfiniteSegment(bounds, RectangleSegment.verticalCenter), AppMagic.Math.RectangleUtil.getSegment(bounds, RectangleSegment.verticalCenter)));
                    this.add(new Guide(GuideType.edgeAlignment, RectangleSegmentGroups.horizontal, AppMagic.Math.RectangleUtil.getInfiniteSegment(bounds, RectangleSegment.top), AppMagic.Math.RectangleUtil.getSegment(bounds, RectangleSegment.top)));
                    this.add(new Guide(GuideType.edgeAlignment, RectangleSegmentGroups.horizontal, AppMagic.Math.RectangleUtil.getInfiniteSegment(bounds, RectangleSegment.bottom), AppMagic.Math.RectangleUtil.getSegment(bounds, RectangleSegment.bottom)));
                    this.add(new Guide(GuideType.centerAlignment, RectangleSegment.horizontalCenter, AppMagic.Math.RectangleUtil.getInfiniteSegment(bounds, RectangleSegment.horizontalCenter), AppMagic.Math.RectangleUtil.getSegment(bounds, RectangleSegment.horizontalCenter)))
                }, addSpacingGuides: function(firstBounds, secondBounds, selectedBounds) {
                    if (!AppMagic.Math.RectangleUtil.intersects(firstBounds, secondBounds)) {
                        var leftBounds = firstBounds.right < secondBounds.left ? firstBounds : secondBounds,
                            rightBounds = firstBounds.right < secondBounds.left ? secondBounds : firstBounds,
                            topBounds = firstBounds.bottom < secondBounds.top ? firstBounds : secondBounds,
                            bottomBounds = firstBounds.bottom < secondBounds.top ? secondBounds : firstBounds,
                            horizontalSpace = rightBounds.left - leftBounds.right,
                            verticalSpace = bottomBounds.top - topBounds.bottom;
                        if (horizontalSpace > selectedBounds.width) {
                            var x1 = leftBounds.right + (horizontalSpace - selectedBounds.width) / 2,
                                x2 = x1 + selectedBounds.width,
                                leftSegment = this.add(new Guide(GuideType.spacing, RectangleSegment.left, {
                                    left: x1, top: -Infinity, right: x1, bottom: Infinity
                                }, AppMagic.Math.RectangleUtil.getSegment(leftBounds, RectangleSegment.right))),
                                rightSegment = this.add(new Guide(GuideType.spacing, RectangleSegment.right, {
                                    left: x2, top: -Infinity, right: x2, bottom: Infinity
                                }, AppMagic.Math.RectangleUtil.getSegment(rightBounds, RectangleSegment.left)));
                            leftSegment.other = rightSegment;
                            rightSegment.other = leftSegment
                        }
                        if (verticalSpace > selectedBounds.height) {
                            var y1 = topBounds.bottom + (verticalSpace - selectedBounds.height) / 2,
                                y2 = y1 + selectedBounds.height,
                                topSegment = this.add(new Guide(GuideType.spacing, RectangleSegment.top, {
                                    left: -Infinity, top: y1, right: Infinity, bottom: y1
                                }, AppMagic.Math.RectangleUtil.getSegment(topBounds, RectangleSegment.bottom))),
                                bottomSegment = this.add(new Guide(GuideType.spacing, RectangleSegment.bottom, {
                                    left: -Infinity, top: y2, right: Infinity, bottom: y2
                                }, AppMagic.Math.RectangleUtil.getSegment(bottomBounds, RectangleSegment.top)));
                            topSegment.other = bottomSegment;
                            bottomSegment.other = topSegment
                        }
                    }
                }, snap: function(bounds) {
                    var width = bounds.right - bounds.left,
                        height = bounds.bottom - bounds.top,
                        xsegments,
                        ysegments;
                    xsegments = width === 0 ? [RectangleSegment.x] : [RectangleSegment.left, RectangleSegment.right, RectangleSegment.verticalCenter];
                    ysegments = height === 0 ? [RectangleSegment.y] : [RectangleSegment.top, RectangleSegment.bottom, RectangleSegment.horizontalCenter];
                    var nearestHorizontal = this._findNearestGuide(bounds, ysegments),
                        nearestVertical = this._findNearestGuide(bounds, xsegments),
                        position;
                    return nearestVertical && (position = nearestVertical.guide.bounds.left, nearestVertical.segment === RectangleSegment.left || nearestVertical.segment === RectangleSegment.x ? (bounds.left = position, bounds.right = position + width) : nearestVertical.segment === RectangleSegment.right ? (bounds.left = position - width, bounds.right = position) : (bounds.left = position - width / 2, bounds.right = position + width / 2)), nearestHorizontal && (position = nearestHorizontal.guide.bounds.top, nearestHorizontal.segment === RectangleSegment.top || nearestHorizontal.segment === RectangleSegment.y ? (bounds.top = position, bounds.bottom = position + height) : nearestHorizontal.segment === RectangleSegment.bottom ? (bounds.top = position - height, bounds.bottom = position) : (bounds.top = position - height / 2, bounds.bottom = position + height / 2)), this._getDisplayGuides(bounds, height > 0, width > 0)
                }, _findNearestGuide: function(bounds, segments) {
                    var bestDistance = Infinity,
                        bestGuide = null,
                        bestSegment = null;
                    for (var mergeKey in this._guides)
                        for (var guide = this._guides[mergeKey], segmentIndex = 0, segmentsLength = segments.length; segmentIndex < segmentsLength; segmentIndex++) {
                            var segment = segments[segmentIndex],
                                distance = guide.getDistance(bounds, segment);
                            distance <= GuideCollection.snapDistance && distance < bestDistance && (bestDistance = distance, bestGuide = guide, bestSegment = segment)
                        }
                    return bestGuide === null ? null : {
                            guide: bestGuide, segment: bestSegment
                        }
                }, _getDisplayGuides: function(bounds, includeHorizontalSpacing, includeVerticalSpacing) {
                    var guides = [],
                        horizontalCenterAlignmentGuides = [],
                        verticalCenterAlignmentGuides = [],
                        horizontalEdgeAlignmentGuidesFound = !1,
                        verticalEdgeAlignmentGuidesFound = !1;
                    for (var mergeKey in this._guides) {
                        var guide = this._guides[mergeKey];
                        if (guide.type !== GuideType.spacing || (!guide.isHorizontal || includeHorizontalSpacing) && (guide.isHorizontal || includeVerticalSpacing))
                            for (var segmentIndex = 0, segmentLength = RectangleSegmentGroups.allArray.length; segmentIndex < segmentLength; segmentIndex++) {
                                var segment = RectangleSegmentGroups.allArray[segmentIndex],
                                    distance = guide.getDistance(bounds, segment);
                                if (distance === 0) {
                                    var target = guides;
                                    guide.type === GuideType.edgeAlignment ? guide.isHorizontal ? horizontalEdgeAlignmentGuidesFound = !0 : verticalEdgeAlignmentGuidesFound = !0 : guide.type === GuideType.centerAlignment && (target = guide.isHorizontal ? horizontalCenterAlignmentGuides : verticalCenterAlignmentGuides);
                                    target.push(guide);
                                    break
                                }
                            }
                    }
                    return horizontalEdgeAlignmentGuidesFound || (guides = guides.concat(horizontalCenterAlignmentGuides)), verticalEdgeAlignmentGuidesFound || (guides = guides.concat(verticalCenterAlignmentGuides)), guides
                }
        }, {snapDistance: 10}),
        GuideType = {
            centerAlignment: "centerAlignment", edgeAlignment: "edgeAlignment", spacing: "spacing", verify: function(value){}
        };
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {
        Guide: Guide, GuideCollection: GuideCollection, GuideType: GuideType, VisualSnapper: VisualSnapper
    })
})();