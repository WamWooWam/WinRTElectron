//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var MouseButtons = {left: 0},
        CanvasViewModel = WinJS.Class.derive(AppMagic.Utility.Disposable, function CanvasViewModel_ctor(selectionManager, owner, id, visuals, nestedVisuals, width, height, documentLayoutManager, canSelect, isPreview, zoom, undoManager, clipboardManager, options) {
            AppMagic.Utility.Disposable.call(this);
            this.track("_eventTracker", new AppMagic.Utility.EventTracker);
            this._selectionManager = selectionManager;
            this._undoManager = undoManager;
            this._owner = owner;
            this._id = id;
            this._visuals = visuals;
            this._nestedVisuals = nestedVisuals;
            this._isPreview = isPreview;
            this._zoom = zoom;
            this._clipboardManager = clipboardManager;
            options && (this._childCanvasId = options.childCanvasId, this._replicateControls = options.replicateControls);
            this.track("_snapper", new AppMagic.AuthoringTool.ViewModels.VisualSnapper(selectionManager, visuals, zoom));
            this.track("_dragger", new VisualDragger(this, undoManager, this._snapper));
            this.track("_resizer", new VisualResizer(this, undoManager, this._snapper));
            this.track("_nestedNestedCanvasResizer", new NestedCanvasResizer(this, undoManager));
            this.track("_selectionBox", new SelectionBox(this, undoManager, selectionManager, visuals));
            this._backgroundColor = ko.observable("transparent");
            this._backgroundImage = ko.observable("");
            this._imagePosition = ko.observable({
                size: "contain", repeat: "no-repeat", position: "center"
            });
            this._canSelect = canSelect;
            this._selected = ko.observable(!1);
            this._documentLayoutManager = documentLayoutManager;
            this._width = width;
            this._height = height;
            this.trackAnonymous(width.subscribe(this._handleSizeChanged, this));
            this.trackAnonymous(height.subscribe(this._handleSizeChanged, this));
            this._eventTracker.add(selectionManager, "visualschanged", this._handleSelectionChanged, this);
            this.isNested || this._eventTracker.add(documentLayoutManager, "documentlayoutchanged", this._handleDocumentSizeChanged, this);
            this._handleSizeChanged()
        }, {
            _undoManager: null, _selectionManager: null, _clipboardManager: null, _documentLayoutManager: null, _owner: null, _id: 0, _visuals: null, _nestedVisuals: null, _isPreview: null, _zoom: null, _initialized: !1, _snapper: null, _dragger: null, _resizer: null, _nestedNestedCanvasResizer: null, _selectionBox: null, _backgroundColor: null, _backgroundImage: null, _imagePosition: null, _canSelect: !1, _selected: null, _width: null, _height: null, _childCanvasId: -1, _replicateControls: !1, initialize: function() {
                    var controls = [];
                    if (!this._initialized) {
                        this._initialized = !0;
                        for (var visuals = this._visuals(), i = 0, len = visuals.length; i < len; i++)
                            controls.push(visuals[i].create(AppMagic.context.documentViewModel.canvasManager))
                    }
                    return WinJS.Promise.join(controls)
                }, alignSelectedHorizontal: function(position) {
                    this._alignSelected(position, "left", "right", "alignHorizontal")
                }, alignSelectedVertical: function(position) {
                    this._alignSelected(position, "top", "bottom", "alignVertical")
                }, changeSelectedZOrder: function(offset) {
                    var selectedVisualNames = this._getSelectedVisuals().map(function(visual) {
                            return visual.name
                        });
                    this._undoManager.createGroup("Reorder Visuals");
                    try {
                        this._undoManager.add(this._undoManager.onZIndexChange.bind(this._undoManager, selectedVisualNames));
                        var visuals = this._visuals(),
                            manipulator = new ZIndexManipulator(visuals, this._getFlattenedSelectedVisuals());
                        manipulator.manipulateSelected(offset);
                        this._moveGroupsToBack(visuals);
                        this._undoManager.add(this._undoManager.queueOnZIndexChange.bind(this._undoManager, selectedVisualNames))
                    }
                    finally {
                        this._undoManager.closeGroup()
                    }
                }, _moveGroupsToBack: function(visuals) {
                    Contracts.checkArray(visuals);
                    var groupVisuals = visuals.filter(function(visual) {
                            return visual.templateName === AppMagic.AuthoringTool.Constants.GroupTemplateName
                        }),
                        manipulator = new ZIndexManipulator(visuals, groupVisuals);
                    manipulator.manipulateSelected(Infinity)
                }, distributeSelectedHorizontal: function() {
                    this._distributeSelected("x", "right", "width")
                }, distributeSelectedVertical: function() {
                    this._distributeSelected("y", "bottom", "height")
                }, focus: function() {
                    this.dispatchEvent("focus")
                }, handleAddVisualClicked: function() {
                    return AppMagic.context.documentViewModel.controlGallery.showVisualGallery(), this._canSelect && this._selectionManager.selectCanvas(this), !0
                }, handleCanvasPointerDown: function(data, evt) {
                    return this._isPreview() || this._selectionBox.start(evt.currentTarget, evt), this._canSelect && !this._isPreview() && (this._selectionManager.selectCanvas(this), evt.stopPropagation()), !0
                }, handleDisabledCoverMouseDown: function(data, evt) {
                    evt.stopPropagation()
                }, handleCanvasKeyDown: function(data, evt) {
                    return evt.key === AppMagic.Constants.Keys.esc && !AppMagic.context.documentViewModel.screenDropDown.handleEscKey() && !AppMagic.context.documentViewModel.visualDropDown.handleEscKey() ? (AppMagic.context.documentViewModel.selection.clearVisuals(), AppMagic.context.shellViewModel.stopPreview(), !1) : !0
                }, _isControlView: function(element) {
                    while (element !== null) {
                        if (WinJS.Utilities.hasClass(element, "appmagic-control-view"))
                            return !0;
                        element = element.parentNode
                    }
                    return !1
                }, handlePointerDown: function(source, visual, evt) {
                    if (!this._isPreview())
                        if (evt.ctrlKey)
                            this._selectionManager.toggleVisual(visual);
                        else if (visual.selected)
                            switch (source) {
                                case"drag":
                                    this._dragger.start(visual.visualElement, evt, this._getFlattenedSelectedVisuals());
                                    break;
                                case"visual":
                                    break;
                                default:
                                    break
                            }
                        else
                            this._selectionManager.selectVisualOrGroup(visual),
                            this._isControlView(evt.target) || this._dragger.start(visual.visualElement, evt, this._getFlattenedSelectedVisuals());
                    return evt.stopPropagation(), !0
                }, handleNestedCanvasPointerDown: function(source, visual, evt) {
                    if (!this._isPreview())
                        if (evt.ctrlKey)
                            this._selectionManager.toggleVisual(visual);
                        else
                            switch (source) {
                                case"drag":
                                    this._dragger.start(this._getNestedCanvasElement(evt.currentTarget), evt, [visual]);
                                    break;
                                case"visual":
                                    break;
                                default:
                                    break
                            }
                    return evt.stopPropagation(), !0
                }, handleResizeDown: function(cornerPoint, visual, evt) {
                    this._resizer.start(visual.visualElement, evt, this._getSelectedVisuals(), cornerPoint, visual);
                    evt.stopPropagation()
                }, handleNestedCanvasResizeDown: function(cornerPoint, visual, evt) {
                    this._nestedNestedCanvasResizer.start(this._getNestedCanvasElement(evt.currentTarget), evt, cornerPoint, visual);
                    evt.stopPropagation()
                }, handleLabelClick: function(visual, evt) {
                    visual.selected || this._selectionManager.selectVisual(visual);
                    evt.stopPropagation()
                }, handleErrorIconClick: function(visual, evt) {
                    visual.selected || this._selectionManager.selectVisual(visual);
                    var rule = visual.errorTracker.errorRule;
                    rule && rule.focus();
                    evt.stopPropagation()
                }, stopErrorAndLabelDragging: function(visual, evt) {
                    evt.stopPropagation()
                }, moveSelected: function(xoffset, yoffset) {
                    for (var visuals = this._getFlattenedSelectedVisuals(), i = 0, len = visuals.length; i < len; i++) {
                        var visual = visuals[i];
                        visual.bounds.x += xoffset;
                        visual.bounds.y += yoffset
                    }
                }, showContextMenu: function(position, relativeOffset) {
                    if (!this._isPreview()) {
                        var menu = new Windows.UI.Popups.PopupMenu;
                        if (this._clipboardManager.isCutValid && menu.commands.append(new Windows.UI.Popups.UICommand(AppMagic.AuthoringStrings.Cut, this._clipboardManager.doCut.bind(this._clipboardManager))), this._clipboardManager.isCopyValid && menu.commands.append(new Windows.UI.Popups.UICommand(AppMagic.AuthoringStrings.Copy, this._clipboardManager.doCopy.bind(this._clipboardManager))), this._clipboardManager.isPasteValid && menu.commands.append(new Windows.UI.Popups.UICommand(AppMagic.AuthoringStrings.Paste, function() {
                                this._clipboardManager.doPaste(relativeOffset)
                            }.bind(this))), this._selectionManager.visuals.length > 0 || this._clipboardManager.isCutValid) {
                            var documentViewModel = AppMagic.context.documentViewModel;
                            menu.commands.append(new Windows.UI.Popups.UICommand(AppMagic.AuthoringStrings.Delete, documentViewModel.removeSelectedEntities.bind(documentViewModel)))
                        }
                        try {
                            menu.showAsync(position)
                        }
                        catch(e) {}
                    }
                }, backgroundColor: {
                    get: function() {
                        return this._backgroundColor()
                    }, set: function(value) {
                            this._backgroundColor(value)
                        }
                }, backgroundImage: {
                    get: function() {
                        return this._backgroundImage()
                    }, set: function(value) {
                            AppMagic.Utility.mediaUrlHelper(this._backgroundImage(), value, !0).then(function(src) {
                                this._backgroundImage(src)
                            }.bind(this), function(){})
                        }
                }, _screenHasBackgroundImage: function() {
                    var result = !1;
                    return this._backgroundImage() && this._backgroundImage().length > 0
                }, addVisualVisible: {get: function() {
                        return !this._isPreview() && this.visuals.length === 0 && !this._screenHasBackgroundImage()
                    }}, childCanvasId: {get: function() {
                        return this._childCanvasId
                    }}, isNested: {get: function() {
                        return !AppMagic.Utility.isScreen(this.owner.templateClassName)
                    }}, imagePosition: {
                    get: function() {
                        return this._imagePosition()
                    }, set: function(value) {
                            this._imagePosition(value)
                        }
                }, canSelect: {get: function() {
                        return this._canSelect
                    }}, adornersHidden: {get: function() {
                        return this._dragger.isActive || this._resizer.isActive || this._nestedNestedCanvasResizer.isActive || !this._zoom.adornerVisible
                    }}, zoom: {get: function() {
                        return this._zoom
                    }}, cssOutlineColor: {get: function() {
                        return this.owner.parent && this.owner.descendantSelected && this._isPreview() ? this.zoom.outlineColor : ""
                    }}, id: {get: function() {
                        return this._id
                    }}, replicateControls: {get: function() {
                        return this._replicateControls
                    }}, isManipulating: {get: function() {
                        return this._dragger.isActive || this._resizer.isActive
                    }}, owner: {get: function() {
                        return this._owner
                    }}, selected: {
                    get: function() {
                        return this._selected()
                    }, set: function(value) {
                            this._selected(value)
                        }
                }, selectionBox: {get: function() {
                        return this._selectionBox
                    }}, snapper: {get: function() {
                        return this._snapper
                    }}, sortedVisuals: {get: function() {
                        var visuals = this._visuals().slice(0);
                        return visuals.sort(AppMagic.AuthoringTool.Utility.compareVisualZIndex), visuals
                    }}, screenParentVisuals: {get: function() {
                        return this.screenVisuals.filter(function(visual) {
                                return visual.supportsNestedControls
                            })
                    }}, screenVisuals: {get: function() {
                        return this._visuals().concat(this._nestedVisuals())
                    }}, visuals: {get: function() {
                        return this._visuals()
                    }}, width: {get: function() {
                        return this._width()
                    }}, height: {get: function() {
                        return this._height()
                    }}, _alignSelected: function(position, minProperty, maxProperty, alignMethod) {
                    var visuals = this._getSelectedVisuals(),
                        value,
                        maxValue,
                        visualPositionMap = this._createVisualPositionMap(visuals);
                    if (visuals.length === 1) {
                        var singleVisual = visuals[0];
                        if (!singleVisual.bounds.containerSize)
                            return;
                        maxValue = alignMethod === "alignVertical" ? singleVisual.bounds.containerSize.height : singleVisual.bounds.containerSize.width;
                        value = position < 0 ? 0 : position > 0 ? maxValue : maxValue / 2
                    }
                    else if (position < 0)
                        value = Math.min.apply(Math, visuals.map(function(visual) {
                            return visual.bounds[minProperty]
                        }));
                    else if (position > 0)
                        value = Math.max.apply(Math, visuals.map(function(visual) {
                            return visual.bounds[maxProperty]
                        }));
                    else {
                        var minValue = Math.min.apply(Math, visuals.map(function(visual) {
                                return visual.bounds[minProperty]
                            }));
                        maxValue = Math.max.apply(Math, visuals.map(function(visual) {
                            return visual.bounds[maxProperty]
                        }));
                        value = (maxValue - minValue) / 2 + minValue
                    }
                    this._undoManager.createGroup("Align operation");
                    try {
                        visuals.forEach(function(visual) {
                            visual.bounds[alignMethod](position, value);
                            visual.alignGroupedVisuals(visualPositionMap, alignMethod === "alignVertical" ? "y" : "x")
                        }.bind(this))
                    }
                    finally {
                        this._undoManager.closeGroup()
                    }
                }, _createVisualPositionMap: function(visuals) {
                    Contracts.checkArray(visuals);
                    var visualPositionMap = {};
                    return visuals.forEach(function(visual) {
                            visualPositionMap[visual.name] = {
                                x: visual.bounds.x, y: visual.bounds.y
                            }
                        }), visualPositionMap
                }, _changeZOrder: function(visualName, zindexDelta) {
                    var oldZindex = this._indexOfVisual(visualName);
                    var visuals = this._visuals(),
                        visual = visuals[oldZindex];
                    var newZindex = Core.Utility.clamp(oldZindex + zindexDelta, 0, visuals.length - 1);
                    this._visuals.valueWillMutate();
                    this._visuals.peek().splice(oldZindex, 1);
                    this._visuals.peek().splice(newZindex, 0, visual);
                    this._visuals.valueHasMutated()
                }, _changeZOrderAbsolute: function(visualName, newZindex) {
                    var oldZindex = this._indexOfVisual(visualName);
                    var visuals = this._visuals(),
                        visual = visuals[oldZindex];
                    var newZindexClamped = Core.Utility.clamp(newZindex, 0, visuals.length - 1);
                    this._visuals.valueWillMutate();
                    this._visuals.peek().splice(oldZindex, 1);
                    this._visuals.peek().splice(newZindexClamped, 0, visual);
                    this._visuals.valueHasMutated()
                }, _distributeSelected: function(minProperty, maxProperty, sizeProperty) {
                    var visuals = this._getSelectedVisuals();
                    if (!(visuals.length < 2)) {
                        var visualPositionMap = this._createVisualPositionMap(visuals);
                        visuals.sort(function(a, b) {
                            var centerA = a.bounds[minProperty] + a.bounds[sizeProperty] / 2,
                                centerB = b.bounds[minProperty] + b.bounds[sizeProperty] / 2;
                            return AppMagic.AuthoringTool.Utility.compareNumbersAscending(centerA, centerB)
                        });
                        for (var availableSpace = visuals[visuals.length - 1].bounds[minProperty] - visuals[0].bounds[maxProperty], totalVisualSpace = 0, i = 1, len = visuals.length - 1; i < len; i++)
                            totalVisualSpace += visuals[i].bounds[sizeProperty];
                        var gapSize = (availableSpace - totalVisualSpace) / (visuals.length - 1);
                        for (i = 1, len = visuals.length - 1; i < len; i++) {
                            var previousBounds = visuals[i - 1].bounds,
                                visual = visuals[i];
                            visual.bounds[minProperty] = previousBounds[maxProperty] + gapSize;
                            visual.alignGroupedVisuals(visualPositionMap, minProperty)
                        }
                    }
                }, _getSelectedVisuals: function() {
                    return this._visuals().filter(function(visual) {
                            return visual.selected
                        })
                }, _getFlattenedSelectedVisuals: function() {
                    var visuals = this._getSelectedVisuals(),
                        flattenedVisuals = [];
                    return visuals.forEach(function(visual) {
                            flattenedVisuals.push(visual);
                            flattenedVisuals = flattenedVisuals.concat(visual.groupedVisuals)
                        }), flattenedVisuals
                }, _getNestedCanvasElement: function(element) {
                    while (!WinJS.Utilities.hasClass(element, "nestedCanvas"))
                        element = element.parentElement;
                    return element
                }, _handleSelectionChanged: function() {
                    this.focus();
                    this._dragger.stop(null);
                    this._resizer.stop(null);
                    this._nestedNestedCanvasResizer.stop(null)
                }, _handleSizeChanged: function() {
                    var visuals = this._visuals(),
                        width = this._width(),
                        height = this._height();
                    width = Math.max(width, 0);
                    height = Math.max(height, 0);
                    for (var i = 0, len = visuals.length; i < len; i++)
                        visuals[i].setContainerSize(width, height)
                }, _handleDocumentSizeChanged: function() {
                    this._width(this._documentLayoutManager.width);
                    this._height(this._documentLayoutManager.height)
                }
        }, {}),
        CanvasManipulator = WinJS.Class.derive(AppMagic.Utility.Disposable, function CanvasManipulator_ctor(canvas, undoManager) {
            AppMagic.Utility.Disposable.call(this);
            this._canvas = canvas;
            this._undoManager = undoManager;
            this._handlePointerUpListener = this._handlePointerUp.bind(this);
            this._handlePointerMoveListener = function(evt) {
                this._inputEvent(evt)
            }.bind(this);
            this._inputEvent = ko.observable(null);
            this.track("_throttledInputEvent", ko.computed(function() {
                return this._inputEvent()
            }, this));
            this._throttledInputEvent.extend({throttle: 1});
            this.trackAnonymous(this._throttledInputEvent.subscribe(function(evt) {
                evt && this._isActive() && this._handlePointerMove(evt)
            }.bind(this)));
            this._isActive = ko.observable(!1)
        }, {
            _inputEvent: null, _throttledInputEvent: null, _canvas: null, _captureElement: null, _undoManager: null, _handlePointerUpListener: null, _handlePointerMoveListener: null, _isActive: null, isActive: {get: function() {
                        return this._isActive()
                    }}, start: function(captureElement, evt) {
                    this._isActive() && this.stop(this._getPointFromEvent(evt));
                    this._captureElement = captureElement;
                    window.setTimeout(function() {
                        Core.Utility.isNullOrUndefined(this._captureElement) || (this._captureElement.setCapture(), document.addEventListener("mousemove", this._handlePointerMoveListener, !1))
                    }.bind(this), 0);
                    this._undoManager.createGroup();
                    this._isActive(!0);
                    document.addEventListener("mouseup", this._handlePointerUpListener, !1)
                }, _getPointFromEvent: function(evt) {
                    return {
                            x: evt.offsetX, y: evt.offsetY
                        }
                }, _handlePointerUp: function(evt) {
                    evt.button === MouseButtons.left && (evt.stopPropagation(), this.stop(this._getPointFromEvent(evt)))
                }, stop: function(point) {
                    this._captureElement.releaseCapture();
                    this._captureElement = null;
                    this._isActive(!1);
                    this._inputEvent(null);
                    document.removeEventListener("mouseup", this._handlePointerUpListener, !1);
                    document.removeEventListener("mousemove", this._handlePointerMoveListener, !1);
                    this._undoManager.closeGroup()
                }, _handlePointerMove: function(evt) {
                    evt.stopPropagation()
                }
        }, {}),
        SelectionBox = WinJS.Class.derive(CanvasManipulator, function SelectionBox_ctor(canvas, undoManager, selectionManager, visuals) {
            CanvasManipulator.call(this, canvas, undoManager);
            this._path = ko.observable("");
            this._selectionManager = selectionManager;
            this._visible = ko.observable(!1);
            this._visuals = visuals
        }, {
            _path: null, _selectionManager: null, _startPoint: null, _visible: null, _visuals: null, _width: null, _height: null, start: function(element, evt) {
                    evt.button === MouseButtons.left && (CanvasManipulator.prototype.start.call(this, element, evt), this._startPoint = {
                        x: evt.offsetX, y: evt.offsetY
                    }, this._path(""), this._visible(!0))
                }, path: {get: function() {
                        return this._path()
                    }}, visible: {get: function() {
                        return this._visible()
                    }}, _getSelectionBounds: function(point) {
                    return point === null ? {
                            left: 0, top: 0, right: 0, bottom: 0
                        } : {
                            left: Math.min(this._startPoint.x, point.x), top: Math.min(this._startPoint.y, point.y), right: Math.max(this._startPoint.x, point.x), bottom: Math.max(this._startPoint.y, point.y)
                        }
                }, stop: function(point) {
                    CanvasManipulator.prototype.stop.call(this, point);
                    this._visible(!1);
                    for (var selectionBounds = this._getSelectionBounds(point), selectedVisuals = [], i = 0, len = this._visuals().length; i < len; i++) {
                        var visual = this._visuals()[i];
                        this._shouldSelectVisual(selectionBounds, visual) && selectedVisuals.push(visual)
                    }
                    this._selectionManager.addVisuals(selectedVisuals)
                }, _shouldSelectVisual: function(selectionBounds, visual) {
                    var visualArea = visual.bounds.width * visual.bounds.height,
                        overlap = 0;
                    if (visualArea === 0)
                        if (AppMagic.Math.RectangleUtil.contains(selectionBounds, visual.bounds))
                            overlap = 1;
                        else {
                            var visualLength = visual.bounds.top - visual.bounds.bottom + visual.bounds.right - visual.bounds.left,
                                intersection = AppMagic.Math.RectangleUtil.intersection(selectionBounds, visual.bounds),
                                overlappingLength = intersection ? intersection.top - intersection.bottom + (intersection.right - intersection.left) : 0;
                            overlap = overlappingLength > 0 && visualLength > 0 ? overlappingLength / visualLength : 0
                        }
                    else
                        overlap = AppMagic.Math.RectangleUtil.areaOfIntersection(selectionBounds, visual.bounds) / visualArea;
                    return overlap >= .5
                }, _handlePointerMove: function(evt) {
                    CanvasManipulator.prototype._handlePointerMove.call(this, evt);
                    var selectionBounds = this._getSelectionBounds(this._getPointFromEvent(evt)),
                        path = new AppMagic.Common.SvgPath;
                    path.rectangle(selectionBounds);
                    this._path(path.data)
                }
        }, {}),
        VisualManipulator = WinJS.Class.derive(CanvasManipulator, function VisualManipulator_ctor(canvas, undoManager, snapper) {
            CanvasManipulator.call(this, canvas, undoManager);
            this._snapper = snapper
        }, {
            _snapper: null, _visuals: null, start: function(captureElement, evt, visuals) {
                    CanvasManipulator.prototype.start.call(this, captureElement, evt);
                    this._snapper.start();
                    this._visuals = visuals
                }, stop: function(point) {
                    CanvasManipulator.prototype.stop.call(this, point);
                    this._snapper.stop();
                    this._visuals = null
                }
        }, {}),
        VisualDragger = WinJS.Class.derive(VisualManipulator, function VisualDragger_ctor(canvas, undoManager, snapper) {
            VisualManipulator.call(this, canvas, undoManager, snapper)
        }, {
            _groupBounds: null, _pointerToCanvasTransform: null, _visualToGroupTransforms: null, _moved: !1, start: function(element, evt, visuals) {
                    if (this._canvas.focus(), evt.button === MouseButtons.left) {
                        VisualManipulator.prototype.start.call(this, element, evt, visuals);
                        this._groupBounds = VisualDragger._getEnclosingBounds(visuals);
                        this._pointerToCanvasTransform = AppMagic.Math.Matrix.translate(-evt.clientX, -evt.clientY);
                        this._pointerToCanvasTransform.multiply(AppMagic.Math.Matrix.scale(this._canvas.zoom.adornerScale, this._canvas.zoom.adornerScale));
                        this._pointerToCanvasTransform.multiply(AppMagic.Math.Matrix.translate(this._groupBounds.left, this._groupBounds.top));
                        this._visualToGroupTransforms = [];
                        for (var i = 0, len = visuals.length; i < len; i++) {
                            var bounds = visuals[i].bounds;
                            this._visualToGroupTransforms[i] = AppMagic.Math.Matrix.translate(bounds.x - this._groupBounds.left, bounds.y - this._groupBounds.top)
                        }
                    }
                }, stop: function(point) {
                    this._isActive() && (VisualManipulator.prototype.stop.call(this, point), this._groupBounds = null, this._pointerToCanvasTransform = null, this._visualToGroupTransforms = null, this._moved = !1)
                }, _handlePointerMove: function(evt) {
                    VisualManipulator.prototype._handlePointerMove.call(this, evt);
                    var point = this._pointerToCanvasTransform.transformPoint({
                            x: evt.clientX, y: evt.clientY
                        }),
                        snappedGroupBounds = {
                            left: point.x, top: point.y, right: point.x + this._groupBounds.right - this._groupBounds.left, bottom: point.y + this._groupBounds.bottom - this._groupBounds.top
                        };
                    this._snapper.snap(evt, snappedGroupBounds);
                    AppMagic.Math.RectangleUtil.clamp(snappedGroupBounds, {
                        left: 0, top: 0, right: this._canvas.width, bottom: this._canvas.height
                    });
                    var origin = {
                            x: 0, y: 0
                        };
                    if (this._groupBounds.left !== snappedGroupBounds.left || this._groupBounds.top !== snappedGroupBounds.top) {
                        this._moved = !0;
                        this._groupBounds = snappedGroupBounds;
                        for (var i = 0, len = this._visuals.length; i < len; i++) {
                            var bounds = this._visuals[i].bounds;
                            point = this._visualToGroupTransforms[i].transformPoint(origin);
                            point.x += this._groupBounds.left;
                            point.y += this._groupBounds.top;
                            bounds.x = point.x;
                            bounds.y = point.y
                        }
                    }
                    this._snapper.render()
                }
        }, {_getEnclosingBounds: function(visuals) {
                for (var enclosingBounds = {
                        left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity
                    }, i = 0, len = visuals.length; i < len; i++) {
                    var bounds = visuals[i].bounds;
                    AppMagic.Math.RectangleUtil.union(enclosingBounds, bounds)
                }
                return enclosingBounds
            }}),
        VisualResizer = WinJS.Class.derive(VisualManipulator, function VisualResizer_ctor(canvas, undoManager, snapper) {
            VisualManipulator.call(this, canvas, undoManager, snapper)
        }, {
            _cornerPoint: null, _adorner: null, _primaryVisual: null, _primaryVisualInitialSize: null, _pointerToPrimaryVisualTransform: null, _visualBoundsMap: null, start: function(element, evt, visuals, cornerPoint, primaryVisual) {
                    if (this._canvas.focus(), evt.button === MouseButtons.left) {
                        VisualManipulator.prototype.start.call(this, element, evt, visuals);
                        this._cornerPoint = cornerPoint;
                        this._adorner = evt.currentTarget;
                        this._primaryVisual = primaryVisual;
                        this._primaryVisualInitialSize = {
                            width: primaryVisual.bounds.right - primaryVisual.bounds.left, height: primaryVisual.bounds.bottom - primaryVisual.bounds.top
                        };
                        this._pointerToPrimaryVisualTransform = AppMagic.Math.Matrix.translate(-evt.clientX, -evt.clientY);
                        this._pointerToPrimaryVisualTransform.multiply(AppMagic.Math.Matrix.scale(this._canvas.zoom.adornerScale, this._canvas.zoom.adornerScale));
                        this._cornerPoint.indexOf("n") >= 0 ? this._pointerToPrimaryVisualTransform.multiply(AppMagic.Math.Matrix.translate(0, primaryVisual.bounds.top)) : this._cornerPoint.indexOf("s") >= 0 && this._pointerToPrimaryVisualTransform.multiply(AppMagic.Math.Matrix.translate(0, primaryVisual.bounds.bottom));
                        this._cornerPoint.indexOf("w") >= 0 ? this._pointerToPrimaryVisualTransform.multiply(AppMagic.Math.Matrix.translate(primaryVisual.bounds.left, 0)) : this._cornerPoint.indexOf("e") >= 0 && this._pointerToPrimaryVisualTransform.multiply(AppMagic.Math.Matrix.translate(primaryVisual.bounds.right, 0));
                        this._visualBoundsMap = {};
                        for (var i = 0, len = visuals.length; i < len; i++) {
                            var visual = visuals[i],
                                bounds = visual.bounds;
                            this._visualBoundsMap[visual.name] = {
                                x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height
                            };
                            visual.groupedVisuals.forEach(function(groupedVisual) {
                                bounds = groupedVisual.bounds;
                                this._visualBoundsMap[groupedVisual.name] = {
                                    x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height
                                }
                            }.bind(this))
                        }
                    }
                }, stop: function(point) {
                    this._isActive() && (VisualManipulator.prototype.stop.call(this, point), this._cornerPoint = null, this._adorner = null, this._primaryVisual = null, this._primaryVisualInitialSize = null, this._pointerToPrimaryVisualTransform = null, this._visualBoundsMap = null)
                }, _handlePointerMove: function(evt) {
                    VisualManipulator.prototype._handlePointerMove.call(this, evt);
                    var point = this._pointerToPrimaryVisualTransform.transformPoint({
                            x: evt.clientX, y: evt.clientY
                        }),
                        bounds = {
                            left: point.x, top: point.y, right: point.x, bottom: point.y
                        };
                    this._snapper.snap(evt, bounds);
                    this._primaryVisual.bounds.resize(this._cornerPoint, bounds.left, bounds.top);
                    this._primaryVisual.clampNestedCanvasToVisualBounds();
                    var scaleX = this._primaryVisual.bounds.width / this._primaryVisualInitialSize.width,
                        scaleY = this._primaryVisual.bounds.height / this._primaryVisualInitialSize.height;
                    evt.shiftKey && (scaleX = scaleY = Math.max(scaleX, scaleY), this._primaryVisual.bounds.resizeScale(this._cornerPoint, this._primaryVisualInitialSize.width, this._primaryVisualInitialSize.height, scaleX, scaleY));
                    this._primaryVisual.setGroupedVisualsBounds(this._visualBoundsMap, scaleX, scaleY);
                    this._snapper.render();
                    this._primaryVisualInitialSize.width > 0 && this._primaryVisualInitialSize.height > 0 && this._visuals.forEach(function(visual) {
                        visual !== this._primaryVisual && (visual.bounds.resizeScale(this._cornerPoint, this._visualBoundsMap[visual.name].width, this._visualBoundsMap[visual.name].height, scaleX, scaleY), visual.setGroupedVisualsBounds(this._visualBoundsMap, scaleX, scaleY))
                    }.bind(this))
                }
        }, {}),
        NestedCanvasResizer = WinJS.Class.derive(CanvasManipulator, function NestedCanvasResizer_ctor(canvas, undoManager) {
            CanvasManipulator.call(this, canvas, undoManager)
        }, {
            _cornerPoint: null, _adorner: null, _primaryVisual: null, _nestedCanvasInitialSize: null, _pointerToPrimaryVisualTransform: null, start: function(element, evt, cornerPoint, primaryVisual) {
                    (this._canvas.focus(), evt.button === MouseButtons.left) && (CanvasManipulator.prototype.start.call(this, element, evt), this._cornerPoint = cornerPoint, this._adorner = evt.currentTarget, this._primaryVisual = primaryVisual, this._nestedCanvasInitialSize = {
                            width: primaryVisual.nestedCanvasWidth, height: primaryVisual.nestedCanvasHeight
                        }, this._pointerToPrimaryVisualTransform = AppMagic.Math.Matrix.translate(-evt.clientX, -evt.clientY), this._pointerToPrimaryVisualTransform.multiply(AppMagic.Math.Matrix.scale(this._canvas.zoom.adornerScale, this._canvas.zoom.adornerScale)), this._cornerPoint.indexOf("n") >= 0 ? this._pointerToPrimaryVisualTransform.multiply(AppMagic.Math.Matrix.translate(0, primaryVisual.nestedCanvasY)) : this._cornerPoint.indexOf("s") >= 0 && this._pointerToPrimaryVisualTransform.multiply(AppMagic.Math.Matrix.translate(0, primaryVisual.nestedCanvasY + primaryVisual.nestedCanvasHeight)), this._cornerPoint.indexOf("w") >= 0 ? this._pointerToPrimaryVisualTransform.multiply(AppMagic.Math.Matrix.translate(primaryVisual.nestedCanvasX, 0)) : this._cornerPoint.indexOf("e") >= 0 && this._pointerToPrimaryVisualTransform.multiply(AppMagic.Math.Matrix.translate(primaryVisual.nestedCanvasX + primaryVisual.nestedCanvasWidth, 0)))
                }, stop: function(point) {
                    this._isActive() && (CanvasManipulator.prototype.stop.call(this, point), this._cornerPoint = null, this._adorner = null, this._primaryVisual = null, this._nestedCanvasInitialSize = null, this._pointerToPrimaryVisualTransform = null, this._visualSizes = null)
                }, _handlePointerMove: function(evt) {
                    VisualManipulator.prototype._handlePointerMove.call(this, evt);
                    var point = this._pointerToPrimaryVisualTransform.transformPoint({
                            x: evt.clientX, y: evt.clientY
                        });
                    this._primaryVisual.resizeNestedCanvas(this._cornerPoint, point.x, point.y)
                }
        }, {});
    WinJS.Class.mix(CanvasViewModel, WinJS.Utilities.eventMixin);
    var ZIndexManipulator = WinJS.Class.define(function ZIndexManipulator_ctor(items, selectedItems) {
            this._items = items.slice(0);
            this._selectedItems = selectedItems.slice(0);
            this._unselectedItems = this._items.filter(function(item) {
                return selectedItems.indexOf(item) < 0
            });
            this._items.sort(AppMagic.AuthoringTool.Utility.compareVisualZIndex);
            this._selectedItems.sort(AppMagic.AuthoringTool.Utility.compareVisualZIndex);
            this._unselectedItems.sort(AppMagic.AuthoringTool.Utility.compareVisualZIndex)
        }, {
            _items: null, _selectedItems: null, _unselectedItems: null, manipulateSelected: function(offset) {
                    var i,
                        item,
                        itemSelected,
                        nextItem,
                        nextItemSelected,
                        previousItem,
                        previousItemSelected,
                        swapped = !1;
                    if (offset === -Infinity)
                        this._items = this._selectedItems.concat(this._unselectedItems);
                    else if (offset === Infinity)
                        this._items = this._unselectedItems.concat(this._selectedItems);
                    else if (offset === -1) {
                        for (i = 1; i < this._items.length; i++)
                            item = this._items[i],
                            previousItem = this._items[i - 1],
                            itemSelected = this._selectedItems.indexOf(item) >= 0,
                            previousItemSelected = this._selectedItems.indexOf(previousItem) >= 0,
                            itemSelected && !previousItemSelected && (this._swap(i, i - 1), swapped = !0);
                        swapped || this._rotate(this._items, offset, 0, this._selectedItems.length - 1)
                    }
                    else if (offset === 1) {
                        for (i = this._items.length - 2; i >= 0; i--)
                            item = this._items[i],
                            nextItem = this._items[i + 1],
                            itemSelected = this._selectedItems.indexOf(item) >= 0,
                            nextItemSelected = this._selectedItems.indexOf(nextItem) >= 0,
                            itemSelected && !nextItemSelected && (this._swap(i, i + 1), swapped = !0);
                        swapped || this._rotate(this._items, offset, this._items.length - this._selectedItems.length, this._items.length - 1)
                    }
                    this._assignIndices()
                }, _assignIndices: function() {
                    for (var i = 0; i < this._items.length; i++)
                        this._items[i].zindex = i + 1
                }, _rotate: function(array, offset, firstIndex, lastIndex) {
                    var items;
                    offset === -1 ? (items = array.splice(firstIndex, 1), array.splice(lastIndex, 0, items[0])) : (items = array.splice(lastIndex, 1), array.splice(firstIndex, 0, items[0]))
                }, _swap: function(firstIndex, secondIndex) {
                    var first = this._items[firstIndex],
                        second = this._items[secondIndex];
                    this._items[firstIndex] = second;
                    this._items[secondIndex] = first
                }
        });
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {
        CanvasViewModel: CanvasViewModel, ZIndexManipulator: ZIndexManipulator
    })
})();