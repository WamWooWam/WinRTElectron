//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(Platform) {"use strict";
    var util = AppMagic.Utility,
        CommandBarButtonsCount = 2,
        CommandBarButtonWidth = 50,
        MaxRetryCount = 3,
        CommandBarButtonPenModesWidth = 171,
        InkControl = WinJS.Class.define(function InkControl_ctor(){}, {
            _colorMru: new AppMagic.RuleValues.ColorMru, DrawingMode: "draw", EraserMode: "erase", SelectionMode: "select", ContextRound: "round", StrokesOutput: "Strokes", ImageOutput: "Image", initControlContext: function(controlContext) {
                    util.createOrSetPrivate(controlContext, "_inkManager", null);
                    util.createOrSetPrivate(controlContext, "_drawingAttributes", null);
                    util.createOrSetPrivate(controlContext, "_canvas", null);
                    util.createOrSetPrivate(controlContext, "_context", null);
                    util.createOrSetPrivate(controlContext, "_currentProperty", ko.observable(null));
                    util.createOrSetPrivate(controlContext, "_value", ko.observable(null));
                    util.createOrSetPrivate(controlContext, "rule", ko.observable(null));
                    util.createOrSetPrivate(controlContext, "_flyoutElement", null);
                    util.createOrSetPrivate(controlContext, "_buttonElement", null);
                    util.createOrSetPrivate(controlContext, "_canvasDivElement", null);
                    util.createOrSetPrivate(controlContext, "_contentContainerElement", null);
                    util.createOrSetPrivate(controlContext, "_contentContainerZIndex", null);
                    util.createOrSetPrivate(controlContext, "_flyoutHidden", ko.observable(!0));
                    util.createOrSetPrivate(controlContext, "_commandBarButtons", ko.observableArray([{
                            propertyName: "Size", image: "", visible: ko.observable(!0)
                        }, {
                            propertyName: "Color", image: "../images/pencommandbarcoloricon.svg", visible: ko.observable(!0)
                        }, {
                            propertyName: "More", image: "", visible: ko.observable(!1)
                        }]));
                    util.createOrSetPrivate(controlContext, "_overflowProperties", ko.observableArray([]));
                    util.createOrSetPrivate(controlContext, "_isOverflowPropertyClicked", ko.observable(!1));
                    util.createOrSetPrivate(controlContext, "_isOverFlowButtonClicked", ko.observable(!1));
                    util.createOrSetPrivate(controlContext, "_penID", -1);
                    util.createOrSetPrivate(controlContext, "_mode", "draw");
                    util.createOrSetPrivate(controlContext, "_lastBlobUrl", ["", ""]);
                    util.createOrSetPrivate(controlContext, "_recognizing", !1);
                    util.createOrSetPrivate(controlContext, "_pendingRecognition", !1);
                    util.createOrSetPrivate(controlContext, "_onmspointerdownHandler", this.onPointerDown.bind(this, controlContext));
                    util.createOrSetPrivate(controlContext, "_onmspointermoveHandler", this.onPointerMove.bind(this, controlContext));
                    util.createOrSetPrivate(controlContext, "_onmspointerupHandler", this.onPointerUp.bind(this, controlContext));
                    util.createOrSetPrivate(controlContext, "_onmspointeroutHandler", this.onPointerOut.bind(this, controlContext));
                    util.createOrSetPrivate(controlContext, "handleButtonClicked", this.handleButtonClicked.bind(this));
                    util.createOrSetPrivate(controlContext, "handlePropertyClicked", this.handlePropertyClicked.bind(this));
                    util.createOrSetPrivate(controlContext, "handleModeClicked", this.handleModeClicked.bind(this));
                    util.createOrSetPrivate(controlContext, "handleClearClicked", this.handleClearClicked.bind(this));
                    util.createOrSetPrivate(controlContext, "_hideFlyoutHandler", this._hideFlyoutEvent.bind(this, controlContext));
                    util.createOrSetPrivate(controlContext, "isShowingPropertyFlyout", this.isShowingPropertyFlyout.bind(this));
                    util.createOrSetPrivate(controlContext, "_isLoaded", !0);
                    util.createOrSetPrivate(controlContext, "_recognizeRetryCount", 0);
                    this._createInkManager(controlContext);
                    controlContext._drawingAttributes = new Platform.UI.Input.Inking.InkDrawingAttributes
                }, disposeControlContext: function(controlContext) {
                    this._attachBlobUrl(this.StrokesOutput, "", controlContext);
                    this._attachBlobUrl(this.ImageOutput, "", controlContext);
                    controlContext._inkManager = null;
                    controlContext._drawingAttributes = null;
                    controlContext._isLoaded = !1
                }, initView: function(container, controlContext) {
                    util.createOrSetPrivate(controlContext, "isDisabled", ko.computed(function() {
                        return controlContext.properties.Disabled() || controlContext.controlWidget.isParentDisabled(controlContext)
                    }));
                    var inkControl = container.children[0];
                    WinJS.UI.processAll(container);
                    controlContext._contentContainerElement = this._getContentContainer(container);
                    controlContext._contentContainerZIndex = controlContext._contentContainerElement.style.zIndex;
                    var inkControlFlyouts = inkControl.getElementsByClassName("appmagic-inkControl-flyout");
                    controlContext._flyoutElement = inkControlFlyouts[0];
                    controlContext._flyoutElement.winControl._sticky = !0;
                    document.addEventListener("mousedown", controlContext._hideFlyoutHandler, !0);
                    document.addEventListener("scroll", controlContext._hideFlyoutHandler, !0);
                    controlContext._currentProperty.subscribe(this._updateRule.bind(this, controlContext));
                    this._updateRule(controlContext);
                    var canvasDivs = inkControl.getElementsByClassName("canvasDiv");
                    controlContext._canvasDivElement = canvasDivs[0];
                    controlContext._canvasDivElement.onmspointerdown = controlContext._onmspointerdownHandler;
                    var canvasElems = inkControl.getElementsByClassName("appmagic-inkControl-draw-canvas");
                    controlContext._canvas = canvasElems[0];
                    controlContext._context = controlContext._canvas.getContext("2d");
                    this._setContextInfoFromMode(controlContext);
                    controlContext.properties.Strokes() !== null && controlContext.properties.Strokes() !== "" && this._loadFromObjectURL(controlContext.properties.Strokes(), controlContext).then(function() {
                        controlContext.realized && this._redrawAll(controlContext)
                    }.bind(this));
                    controlContext._fillSubscription = controlContext.properties.Fill.subscribe(this.onChangeFillWithView.bind(this, controlContext));
                    controlContext._colorSubscription = controlContext.properties.Color.subscribe(this.onChangeColorWithView.bind(this, controlContext));
                    controlContext._modeSubscription = controlContext.properties.Mode.subscribe(this.onChangeModeWithView.bind(this, controlContext));
                    controlContext._sizeSubscription = controlContext.properties.Size.subscribe(this.onChangeSizeWithView.bind(this, controlContext));
                    controlContext._clearSubscription = controlContext.properties.Clear.subscribe(this.onChangeClearWithView.bind(this, controlContext));
                    controlContext._defaultStrokesSubscription = controlContext.properties.DefaultStrokes.subscribe(this.onChangeDefaultStrokesWithView.bind(this, controlContext));
                    this.onChangeFillWithView(controlContext);
                    this.onChangeColorWithView(controlContext);
                    this.onChangeModeWithView(controlContext);
                    this.onChangeSizeWithView(controlContext);
                    this.onChangeClearWithView(controlContext);
                    this.onChangeDefaultStrokesWithView(controlContext);
                    ko.applyBindings(controlContext, container)
                }, disposeView: function(container, controlContext) {
                    controlContext.isDisabled.dispose();
                    controlContext.isDisabled = null;
                    controlContext._canvasDivElement.onmspointerdown = null;
                    controlContext._canvasDivElement.onmspointermove = null;
                    controlContext._canvasDivElement.onmspointerup = null;
                    controlContext._canvasDivElement.onmspointerout = null;
                    document.removeEventListener("mousedown", controlContext._hideFlyoutHandler, !0);
                    document.removeEventListener("scroll", controlContext._hideFlyoutHandler, !0);
                    controlContext._fillSubscription.dispose();
                    controlContext._fillSubscription = null;
                    controlContext._colorSubscription.dispose();
                    controlContext._colorSubscription = null;
                    controlContext._clearSubscription.dispose();
                    controlContext._clearSubscription = null;
                    controlContext._modeSubscription.dispose();
                    controlContext._modeSubscription = null;
                    controlContext._sizeSubscription.dispose();
                    controlContext._sizeSubscription = null;
                    controlContext._defaultStrokesSubscription.dispose();
                    controlContext._defaultStrokesSubscription = null
                }, onChangeFillWithView: function(controlContext) {
                    this._redrawAll(controlContext)
                }, onChangeColorWithView: function(controlContext) {
                    var colorNewValue = controlContext.properties.Color();
                    colorNewValue !== null && this._updateDrawingAttribute("color", this._toColorStruct(colorNewValue), controlContext)
                }, onChangeModeWithView: function(controlContext) {
                    var modeNewValue = controlContext.properties.Mode();
                    if (controlContext._mode === this.SelectionMode && this._clearSelection(controlContext), typeof modeNewValue != "string")
                        controlContext._mode = this.DrawingMode;
                    else {
                        var lowerModeValue = modeNewValue.toLowerCase();
                        controlContext._mode = lowerModeValue === this.EraserMode || lowerModeValue === this.SelectionMode ? lowerModeValue : this.DrawingMode
                    }
                    this._setContextInfoFromMode(controlContext)
                }, onChangeSizeWithView: function(controlContext) {
                    var sizeNewValue = controlContext.properties.Size();
                    if (sizeNewValue !== null) {
                        var newPenSize = controlContext._drawingAttributes.size;
                        newPenSize.height = newPenSize.width = sizeNewValue;
                        this._updateDrawingAttribute("size", newPenSize, controlContext)
                    }
                }, onChangeClearWithView: function(controlContext) {
                    var clearNewValue = controlContext.properties.Clear();
                    clearNewValue && this._clearAllStrokes(controlContext)
                }, onChangeDefaultStrokesWithView: function(controlContext) {
                    var defaultStrokesNewValue = controlContext.properties.DefaultStrokes();
                    defaultStrokesNewValue !== null && defaultStrokesNewValue !== "" && (controlContext._canvas.width <= 0 || controlContext._canvas.height <= 0 || this._loadFromObjectURL(defaultStrokesNewValue, controlContext).then(function() {
                        controlContext.realized && this._redrawAll(controlContext)
                    }.bind(this)))
                }, onChangeWidth: function(evt, controlContext) {
                    var widthNewValue = controlContext.modelProperties.Width.getValue() - CommandBarButtonPenModesWidth;
                    if (widthNewValue) {
                        for (var visibleButtonsCount = Math.floor(widthNewValue / CommandBarButtonWidth), commandBarButtons = controlContext._commandBarButtons(), overflowProperties = [], i = 0, len = commandBarButtons.length; i < len; i++)
                            i >= visibleButtonsCount - 1 && visibleButtonsCount < CommandBarButtonsCount ? commandBarButtons[i].propertyName === "More" ? commandBarButtons[i].visible(!0) : (commandBarButtons[i].visible(!1), overflowProperties.push(commandBarButtons[i])) : commandBarButtons[i].propertyName === "More" ? commandBarButtons[i].visible(!1) : commandBarButtons[i].visible(!0);
                        controlContext._overflowProperties(overflowProperties)
                    }
                    this._hideFlyout(controlContext);
                    controlContext.realized && this.updateView(controlContext)
                }, onChangeHeight: function(evt, controlContext) {
                    this._hideFlyout(controlContext);
                    controlContext.realized && this.updateView(controlContext)
                }, updateView: function(controlContext) {
                    this._setContextInfoFromMode(controlContext);
                    this._renderAllStrokes(controlContext)
                }, onPointerDown: function(controlContext, evt) {
                    if (controlContext.properties.Size() <= 0 && controlContext._mode === this.DrawingMode || controlContext.modelProperties.Disabled.getValue() || controlContext._penID !== -1)
                        return !0;
                    if (controlContext._canvasDivElement.onmspointermove = controlContext._onmspointermoveHandler, controlContext._canvasDivElement.onmspointerup = controlContext._onmspointerupHandler, controlContext._canvasDivElement.onmspointerout = controlContext._onmspointeroutHandler, evt.pointerType === "pen" && (controlContext.properties.Input() & AppMagic.Constants.PenType.pen) === AppMagic.Constants.PenType.pen || evt.pointerType === "touch" && (controlContext.properties.Input() & AppMagic.Constants.PenType.touch) === AppMagic.Constants.PenType.touch || evt.pointerType === "mouse" && (controlContext.properties.Input() & AppMagic.Constants.PenType.mouse) === AppMagic.Constants.PenType.mouse && evt.button === 0) {
                        var pt = {
                                x: 0, y: 0
                            };
                        controlContext._inkManager.selectWithLine(pt, pt);
                        pt = evt.currentPoint;
                        pt.properties.isEraser || controlContext._mode === this.EraserMode ? (controlContext._inkManager.mode = Platform.UI.Input.Inking.InkManipulationMode.erasing, pt.properties.isEraser && this._setErasingContextInfo(controlContext)) : controlContext._mode === this.SelectionMode ? (controlContext._inkManager.mode = Platform.UI.Input.Inking.InkManipulationMode.selecting, this._setSelectionContextInfo(controlContext)) : (controlContext._inkManager.mode = Platform.UI.Input.Inking.InkManipulationMode.inking, this._setDrawingContextInfo(controlContext));
                        controlContext._context.beginPath();
                        controlContext._context.moveTo(pt.rawPosition.x, pt.rawPosition.y);
                        controlContext._inkManager.processPointerDown(pt);
                        controlContext._penID = evt.pointerId
                    }
                    return !0
                }, onPointerMove: function(controlContext, evt) {
                    if (!controlContext.modelProperties.Disabled.getValue() && controlContext._penID !== -1 && evt.pointerId === controlContext._penID) {
                        var pt = evt.currentPoint;
                        controlContext._context.lineTo(pt.rawPosition.x, pt.rawPosition.y);
                        controlContext._context.stroke();
                        for (var pts = evt.intermediatePoints, i = pts.length - 1; i >= 0; i--) {
                            var rect = controlContext._inkManager.processPointerUpdate(pts[i]);
                            controlContext._inkManager.mode !== Platform.UI.Input.Inking.InkManipulationMode.erasing || AppMagic.Utility.RectUtil.isZero(rect) || this._redrawAll(controlContext)
                        }
                    }
                }, onPointerUp: function(controlContext, evt) {
                    controlContext.modelProperties.Disabled.getValue() || this.processPointerUp(controlContext, evt)
                }, onPointerOut: function(controlContext, evt) {
                    controlContext.modelProperties.Disabled.getValue() || this.processPointerUp(controlContext, evt)
                }, processPointerUp: function(controlContext, evt) {
                    if (controlContext._penID !== -1 && evt.pointerId === controlContext._penID) {
                        controlContext._canvasDivElement.onmspointermove = null;
                        controlContext._canvasDivElement.onmspointerup = null;
                        controlContext._canvasDivElement.onmspointerout = null;
                        controlContext._penID = -1;
                        var pt = evt.currentPoint;
                        controlContext._context.lineTo(pt.rawPosition.x, pt.rawPosition.y);
                        controlContext._context.stroke();
                        controlContext._context.closePath();
                        var rect = controlContext._inkManager.processPointerUp(pt);
                        pt.properties.isEraser && this._setContextInfoFromMode(controlContext);
                        this._redrawAll(controlContext).then(function() {
                            controlContext.realized && controlContext.behaviors.OnSelect()
                        }, function(err){})
                    }
                }, _setContextInfoFromMode: function(controlContext) {
                    switch (controlContext._mode) {
                        case this.SelectionMode:
                            this._setSelectionContextInfo(controlContext);
                            break;
                        case this.EraserMode:
                            this._setErasingContextInfo(controlContext);
                            break;
                        default:
                            this._setDrawingContextInfo(controlContext);
                            break
                    }
                }, _setDrawingContextInfo: function(controlContext) {
                    controlContext._context.lineWidth = controlContext.properties.Size();
                    controlContext._context.lineCap = this.ContextRound;
                    controlContext._context.strokeStyle = controlContext._context.fillStyle = controlContext.properties.Color()
                }, _setSelectionContextInfo: function(controlContext) {
                    controlContext._context.lineWidth = controlContext.properties.SelectionThickness();
                    controlContext._context.strokeStyle = controlContext.properties.SelectionColor();
                    controlContext._context.lineCap = this.ContextRound;
                    controlContext._context.lineJoin = this.ContextRound
                }, _setErasingContextInfo: function(controlContext) {
                    controlContext._context.lineWidth = 0;
                    controlContext._context.strokeStyle = "RGBA(0, 0, 0, 0)";
                    controlContext._context.lineCap = this.ContextRound;
                    controlContext._context.lineJoin = this.ContextRound
                }, _createInkManager: function(controlContext) {
                    controlContext._inkManager || (controlContext._inkManager = new Platform.UI.Input.Inking.InkManager)
                }, _updateDrawingAttribute: function(property, newValue, controlContext) {
                    if (controlContext._drawingAttributes[property] = newValue, controlContext._inkManager.setDefaultDrawingAttributes(controlContext._drawingAttributes), controlContext._mode === this.DrawingMode)
                        this._setDrawingContextInfo(controlContext);
                    else if (controlContext._mode === this.SelectionMode) {
                        var redraw = !1;
                        controlContext._inkManager.getStrokes().forEach(function(stroke) {
                            if (stroke.selected && stroke.drawingAttributes[property] !== newValue) {
                                var attributes = stroke.drawingAttributes;
                                attributes[property] = newValue;
                                stroke.drawingAttributes = attributes;
                                redraw = !0
                            }
                        });
                        redraw && (this._renderAllStrokes(controlContext), this._saveStrokesToObjectURL(controlContext), this._saveCanvasToObjectURL(controlContext))
                    }
                }, _renderAllStrokes: function(controlContext) {
                    controlContext._context.clearRect(0, 0, controlContext._canvas.width, controlContext._canvas.height);
                    var colorFill = controlContext.properties.Fill();
                    colorFill !== "rgba(0, 0, 0, 0)" && (controlContext._context.fillStyle = colorFill, controlContext._context.fillRect(0, 0, controlContext._canvas.width, controlContext._canvas.height));
                    controlContext._inkManager.getStrokes().forEach(function(stroke) {
                        var att = stroke.drawingAttributes;
                        var color = this._toColorString(att.color),
                            strokeSize = att.size,
                            lineShape = this.ContextRound;
                        if (stroke.selected) {
                            this._renderStroke(stroke, color, strokeSize.width * 2, lineShape, controlContext);
                            var stripe = "White";
                            this._renderStroke(stroke, stripe, strokeSize.width - 1, lineShape, controlContext)
                        }
                        else
                            this._renderStroke(stroke, color, strokeSize.width, lineShape, controlContext)
                    }.bind(this))
                }, _renderStroke: function(stroke, argbColor, width, lineShape, controlContext) {
                    width < 0 && (width = 0);
                    controlContext._context.save();
                    try {
                        controlContext._context.beginPath();
                        controlContext._context.strokeStyle = controlContext._context.fillStyle = argbColor;
                        controlContext._context.lineWidth = width;
                        controlContext._context.lineCap = lineShape;
                        controlContext._context.lineJoin = lineShape;
                        var first = !0;
                        var renderingSegments = stroke.getRenderingSegments();
                        renderingSegments.forEach(function(segment) {
                            first ? (controlContext._context.moveTo(segment.position.x, segment.position.y), first = !1) : controlContext._context.bezierCurveTo(segment.bezierControlPoint1.x, segment.bezierControlPoint1.y, segment.bezierControlPoint2.x, segment.bezierControlPoint2.y, segment.position.x, segment.position.y)
                        }.bind(this));
                        renderingSegments.size === 2 && renderingSegments[0].x === renderingSegments[1].x && renderingSegments[0].y === renderingSegments[1].y && (controlContext._context.beginPath(), controlContext._context.arc(renderingSegments[0].position.x, renderingSegments[0].position.y, 1, 0, 2 * Math.PI, !0), controlContext._context.fill());
                        controlContext._context.stroke();
                        controlContext._context.closePath()
                    }
                    finally {
                        controlContext._context.restore()
                    }
                }, _recognize: function(controlContext) {
                    controlContext._pendingRecognition = !1;
                    controlContext._inkManager.getStrokes().length > 0 ? controlContext._recognizing ? (controlContext._pendingRecognition = !0, setImmediate(this._recognize.bind(this, controlContext))) : (controlContext._recognizing = !0, controlContext._inkManager.recognizeAsync(this._anySelected(controlContext) ? Platform.UI.Input.Inking.InkRecognitionTarget.selected : Platform.UI.Input.Inking.InkRecognitionTarget.all).done(function(results) {
                        if (controlContext._recognizeRetryCount = 0, !controlContext._isLoaded) {
                            controlContext._recognizing = !1;
                            return
                        }
                        controlContext._inkManager.updateRecognitionResults(results);
                        for (var alternates = "", c = results.length, i = 0; i < c; i++) {
                            var alts = results[i].getTextCandidates();
                            alternates = alternates.length > 0 ? alternates + " " + alts[0] : alts[0]
                        }
                        controlContext.modelProperties.RecognizedText.setValue(alternates);
                        controlContext._recognizing = !1
                    }.bind(this), function(e) {
                        controlContext._isLoaded && (controlContext._recognizing = !1, controlContext._recognizeRetryCount < MaxRetryCount ? (controlContext._recognizeRetryCount++, setImmediate(this._recognize.bind(this, controlContext))) : controlContext._recognizeRetryCount = 0)
                    }.bind(this))) : controlContext.modelProperties.RecognizedText.setValue("")
                }, _saveStrokesToObjectURL: function(controlContext) {
                    if (controlContext._inkManager.getStrokes().length > 0) {
                        var inMemoryRandomAccessStream = new Platform.Storage.Streams.InMemoryRandomAccessStream;
                        return controlContext._inkManager.saveAsync(inMemoryRandomAccessStream).then(function() {
                                var url = AppMagic.Utility.blobManager.create("image/gif", inMemoryRandomAccessStream);
                                url && (AppMagic.Utility.blobManager.addRef(url), controlContext.modelProperties.Strokes.setValue(url), this._attachBlobUrl(this.StrokesOutput, url, controlContext));
                                inMemoryRandomAccessStream.close()
                            }.bind(this), function(err) {
                                inMemoryRandomAccessStream.close()
                            })
                    }
                    else
                        return controlContext.modelProperties.Strokes.setValue(""), this._attachBlobUrl(this.StrokesOutput, "", controlContext), WinJS.Promise.wrap(!0)
                }, _saveCanvasToObjectURL: function(controlContext) {
                    var canvas = controlContext._canvas;
                    return canvas.width <= 0 || canvas.height <= 0 ? WinJS.Promise.wrap(!0) : controlContext._inkManager.getStrokes().length > 0 ? this._getImageUriFromCanvasAsync(controlContext._context).then(function(url) {
                            controlContext._isLoaded && url && (controlContext.modelProperties.Image.setValue(url), this._attachBlobUrl(this.ImageOutput, url, controlContext))
                        }.bind(this), function(err) {
                            this._attachBlobUrl(this.ImageOutput, "", controlContext)
                        }.bind(this)) : (controlContext.modelProperties.Image.setValue(""), this._attachBlobUrl(this.ImageOutput, "", controlContext), WinJS.Promise.wrap(!0))
                }, _getImageUriFromCanvasAsync: function(context) {
                    var canvas = context.canvas,
                        inMemoryRandomAccessStream = new Platform.Storage.Streams.InMemoryRandomAccessStream;
                    return inMemoryRandomAccessStream.size = 0, Platform.Graphics.Imaging.BitmapEncoder.createAsync(Platform.Graphics.Imaging.BitmapEncoder.pngEncoderId, inMemoryRandomAccessStream).then(function(encoder) {
                            var width = canvas.width,
                                height = canvas.height,
                                outputPixelData = context.getImageData(0, 0, width, height);
                            return encoder.setPixelData(Platform.Graphics.Imaging.BitmapPixelFormat.rgba8, Platform.Graphics.Imaging.BitmapAlphaMode.straight, width, height, 96, 96, outputPixelData.data), encoder.flushAsync().then(function() {
                                    var url = AppMagic.Utility.blobManager.create("image/png", inMemoryRandomAccessStream);
                                    return AppMagic.Utility.blobManager.addRef(url), inMemoryRandomAccessStream.close(), WinJS.Promise.wrap(url)
                                })
                        }.bind(this), function(err) {
                            inMemoryRandomAccessStream.close()
                        })
                }, _loadFromObjectURL: function(url, controlContext) {
                    return AppMagic.Utility.streamFromUriAsync(url).then(function(stream) {
                            try {
                                return controlContext._inkManager.loadAsync(stream).then(function() {
                                        stream.close()
                                    }, function() {
                                        stream.close()
                                    })
                            }
                            catch(err) {
                                stream.close()
                            }
                        }, function(err){})
                }, _attachBlobUrl: function(output, newUrl, controlContext) {
                    controlContext._lastBlobUrl[output] && AppMagic.Utility.blobManager.release(controlContext._lastBlobUrl[output]);
                    controlContext._lastBlobUrl[output] = newUrl
                }, _anySelected: function(controlContext) {
                    for (var strokes = controlContext._inkManager.getStrokes(), len = strokes.length, i = 0; i < len; i++)
                        if (strokes[i].selected)
                            return !0;
                    return !1
                }, _clearSelection: function(controlContext) {
                    for (var strokes = controlContext._inkManager.getStrokes(), len = strokes.length, i = 0; i < len; i++)
                        strokes[i].selected = !1
                }, _clearAllStrokes: function(controlContext) {
                    var strokes = controlContext._inkManager.getStrokes(),
                        len = strokes.length;
                    if (len > 0) {
                        for (var i = 0; i < len; i++)
                            strokes[i].selected = !0;
                        controlContext._inkManager.deleteSelected();
                        this._redrawAll(controlContext)
                    }
                }, _redrawAll: function(controlContext) {
                    this._renderAllStrokes(controlContext);
                    var promises = [];
                    return promises.push(this._saveStrokesToObjectURL(controlContext)), promises.push(this._saveCanvasToObjectURL(controlContext)), controlContext._pendingRecognition || this._recognize(controlContext), WinJS.Promise.join(promises)
                }, _toColorString: function(color) {
                    return "RGBA(" + color.r + "," + color.g + "," + color.b + "," + (color.a / 255).toString(10) + ")"
                }, _toColorStruct: function(color) {
                    color = color.toLowerCase();
                    for (var current in Windows.UI.Colors)
                        if (current.toLowerCase() === color)
                            return Windows.UI.Colors[current];
                    var patt = /\s/g;
                    color = color.replace(patt, "");
                    var rgba = color.match(/^rgba\((\d*),(\d*),(\d*),(\d\.?\d*)/);
                    return rgba instanceof Array && rgba.length === 5 && rgba[0].substring(0, 5) === "rgba(" ? Platform.UI.ColorHelper.fromArgb(Math.round(rgba[4] * 255), rgba[1], rgba[2], rgba[3]) : Platform.UI.Colors.black
                }, handleButtonClicked: function(propertyName, controlContext, evt) {
                    if (!controlContext.modelProperties.Disabled.getValue()) {
                        var isOverflow = propertyName === "More" ? !0 : !1;
                        controlContext._buttonElement = this._getButtonClickFlyoutAnchor(evt);
                        var mode = controlContext.controlWidget.mode();
                        mode === "edit" && (controlContext._flyoutElement.winControl.onbeforeshow = function() {
                            controlContext._contentContainerZIndex = controlContext._contentContainerElement.style.zIndex;
                            controlContext._contentContainerElement.style.zIndex = AppMagic.Constants.zIndex.topmost + 1
                        });
                        controlContext._flyoutHidden() ? (isOverflow ? controlContext._isOverFlowButtonClicked(!0) : (controlContext._currentProperty(propertyName), controlContext._isOverFlowButtonClicked(!1)), controlContext._flyoutElement.winControl.show(controlContext._buttonElement)) : (controlContext._flyoutElement.winControl.onafterhide = function() {
                            isOverflow ? controlContext._isOverFlowButtonClicked(!0) : (controlContext._currentProperty(propertyName), controlContext._isOverFlowButtonClicked(!1));
                            mode === "edit" && (controlContext._contentContainerElement.style.zIndex = controlContext._contentContainerZIndex);
                            controlContext._flyoutElement.winControl.show(controlContext._buttonElement);
                            controlContext._flyoutElement.winControl.onafterhide = null
                        }, controlContext._flyoutElement.winControl.hide());
                        controlContext._flyoutHidden(!1);
                        controlContext._isOverflowPropertyClicked(!1)
                    }
                }, handlePropertyClicked: function(propertyName, controlContext) {
                    controlContext._isOverflowPropertyClicked(!0);
                    controlContext._isOverFlowButtonClicked(!1);
                    controlContext._currentProperty(propertyName)
                }, handleModeClicked: function(mode, controlContext) {
                    controlContext.properties.Mode(mode)
                }, handleClearClicked: function(controlContext) {
                    this._clearAllStrokes(controlContext)
                }, isShowingPropertyFlyout: function(propertyName, controlContext) {
                    return !controlContext._flyoutHidden() && (propertyName === "More" && (controlContext._isOverFlowButtonClicked() || controlContext._isOverflowPropertyClicked()) || controlContext._currentProperty() === propertyName && !controlContext._isOverFlowButtonClicked()) ? !0 : !1
                }, _getButtonClickFlyoutAnchor: function(evt) {
                    for (var anchor = evt.target; anchor && !WinJS.Utilities.hasClass(anchor, "button"); )
                        anchor = anchor.parentElement;
                    return anchor
                }, _hideFlyout: function(controlContext) {
                    if (!controlContext._flyoutHidden()) {
                        controlContext._flyoutElement.winControl.hide();
                        controlContext._flyoutHidden(!0);
                        var mode = controlContext.controlWidget.mode();
                        mode === "edit" && (controlContext._contentContainerElement.style.zIndex = controlContext._contentContainerZIndex)
                    }
                }, _hideFlyoutEvent: function(controlContext, evt) {
                    if (evt.target.parentElement !== null && !controlContext._flyoutHidden()) {
                        var isFlyoutElement = WinJS.Utilities.hasClass(evt.target.parentElement, "appmagic-inkControl-flyoutMenuItem") || WinJS.Utilities.hasClass(evt.target.parentElement, "appmagic-inkControl-flyoutContent") || controlContext._flyoutElement.contains(evt.target);
                        !controlContext._buttonElement || controlContext._buttonElement.contains(evt.target) || isFlyoutElement || this._hideFlyout(controlContext)
                    }
                }, _updateRule: function(controlContext) {
                    var value = null,
                        valueTemplate = null,
                        currentProperty = controlContext._currentProperty();
                    if (currentProperty) {
                        var property = controlContext.properties[currentProperty];
                        switch (currentProperty) {
                            case"Color":
                                var penColorValue = ko.computed({
                                        read: function() {
                                            var colorPropertyValue = property();
                                            if (colorPropertyValue === null)
                                                return "";
                                            return colorPropertyValue.toUpperCase()
                                        }, write: function(colorValue) {
                                                var color = AppMagic.Utility.Color.parseRuleValue(colorValue);
                                                property(color.toNumber())
                                            }
                                    });
                                value = new AppMagic.RuleValues.ColorRuleValue(this._colorMru, penColorValue);
                                valueTemplate = "color";
                                break;
                            case"Size":
                                var penThicknessValue = ko.computed({
                                        read: function() {
                                            var thicknessPropertyValue = property();
                                            if (thicknessPropertyValue === null)
                                                return "0";
                                            var stringThicknessValue = thicknessPropertyValue.toString();
                                            return stringThicknessValue
                                        }, write: function(thicknessValue) {
                                                var integerValue = parseInt(thicknessValue);
                                                property(integerValue)
                                            }, owner: this
                                    });
                                value = new AppMagic.RuleValues.RangeRuleValue("range", penThicknessValue, AppMagic.AuthoringTool.VisualIntellisense.PenThickness);
                                valueTemplate = "range";
                                break
                        }
                    }
                    controlContext._value() && controlContext._value().dispose();
                    controlContext._value(value);
                    var rule = null;
                    value && (rule = {getPresentationValueForTemplate: function(template) {
                            return template === valueTemplate ? value : null
                        }});
                    controlContext.rule(rule)
                }, _getContentContainer: function(element) {
                    while (element && !element.classList.contains("content") && !element.classList.contains("canvasContentDiv"))
                        element = element.parentElement;
                    return element
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Controls", {InkControl: InkControl})
})(Windows);