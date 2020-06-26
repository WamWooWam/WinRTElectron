//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var pxConverter = AppMagic.Controls.converters.pxConverter.view,
        NUMBERTIP_HORIZONTAL_HOVER = 15,
        NUMBERTIP_VERTICAL_HOVER = -15,
        FAR_RAIL_CLASS_NAME = "appmagic-slider-far-rail",
        HANDLE_CLASS_NAME = "appmagic-slider-handle",
        util = Core.Utility,
        SliderViewModel = WinJS.Class.define(function SliderViewModel_ctor(controlContext, sliderElement) {
            this._controlContext = controlContext;
            this._sliderElement = sliderElement;
            this._nearRailElement = sliderElement.children[0];
            this._handleElement = sliderElement.children[2];
            this._properties = controlContext.properties;
            this._nearRail = new AppMagic.Controls.ObservableRectangle(0, 0, 0, 0);
            this._farRail = new AppMagic.Controls.ObservableRectangle(0, 0, 0, 0);
            this._handle = new AppMagic.Controls.ObservableRectangle(0, 0, 0, 0);
            this._sliderBoundingRect = ko.observable({
                bottom: 0, height: 0, left: 0, right: 0, top: 0, width: 0
            });
            this._nearRailBoundingRect = ko.observable({
                bottom: 0, height: 0, left: 0, right: 0, top: 0, width: 0
            });
            this._numberTipBoundingClientRect = ko.observable({
                bottom: 0, height: 0, left: 0, right: 0, top: 0, width: 0
            });
            this._numberTipLeft = ko.computed(function() {
                var value = NUMBERTIP_VERTICAL_HOVER - this._numberTipBoundingClientRect().width + this._sliderBoundingRect().left;
                if (this._isHorizontal()) {
                    var numberTipCenter = (this._numberTipBoundingClientRect().right - this._numberTipBoundingClientRect().left) / 2;
                    value = Math.floor(this._nearRailBoundingRect().width - numberTipCenter + this._sliderBoundingRect().left)
                }
                return value
            }.bind(this));
            this._numberTipTop = ko.computed(function() {
                var value;
                if (this._isHorizontal())
                    value = this._nearRailBoundingRect().height + NUMBERTIP_HORIZONTAL_HOVER + this._sliderBoundingRect().top;
                else {
                    var numberTipCenter = (this._numberTipBoundingClientRect().top - this._numberTipBoundingClientRect().bottom) / 2;
                    value = Math.floor(this._sliderBoundingRect().bottom - this._nearRailBoundingRect().height + numberTipCenter)
                }
                return value
            }.bind(this));
            this._handleBackgroundColor = ko.computed(function() {
                var fill = null;
                return (controlContext.viewState.pressed() ? fill = controlContext.properties.HandleActiveFill() : controlContext.viewState.hovering() && (fill = controlContext.properties.HandleHoverFill()), fill === null) ? controlContext.properties.HandleFill() : fill
            }.bind(this));
            this._pointerDown = ko.observable(!1);
            this.updateRails();
            this.updateHandle();
            this._pointerUpHandler = this._onPointerUp.bind(this);
            this._pointerMoveHandler = this._onPointerMove.bind(this)
        }, {
            _controlContext: null, _properties: null, _nearRail: null, _farRail: null, _handle: null, _pointerDown: null, _initialValueBeforeDrag: null, _sliderBoundingRect: null, _nearRailBoundingRect: null, _processingPointerUp: !1, _pointerUpHandler: null, _pointerMoveHandler: null, _sliderElement: null, _nearRailElement: null, _numberTipLeft: null, _numberTipTop: null, controlContext: {get: function() {
                        return this._controlContext
                    }}, properties: {get: function() {
                        return this._properties
                    }}, nearRail: {get: function() {
                        return this._nearRail
                    }}, farRail: {get: function() {
                        return this._farRail
                    }}, handle: {get: function() {
                        return this._handle
                    }}, handleBackgroundColor: {get: function() {
                        return this._handleBackgroundColor()
                    }}, numberTipLeft: {get: function() {
                        return pxConverter(this._numberTipLeft())
                    }}, numberTipTop: {get: function() {
                        return pxConverter(this._numberTipTop())
                    }}, numberTipVisible: {get: function() {
                        return this._pointerDown() ? this.properties.ShowValue() : !1
                    }}, numberTipValue: {get: function() {
                        return AppMagic.Functions.text(this.properties.Value())
                    }}, dispose: function() {
                    this._removePointerHandlers()
                }, normalizedWidth: {get: function() {
                        return this._getNormalizedValue(this.properties.Width)
                    }}, normalizedHeight: {get: function() {
                        return this._getNormalizedValue(this.properties.Height)
                    }}, normalizedMin: {get: function() {
                        return this._getNormalizedValue(this.properties.Min)
                    }}, normalizedMax: {get: function() {
                        return this._getNormalizedValue(this.properties.Max)
                    }}, normalizedValue: {get: function() {
                        return this._getNormalizedValue(this.properties.Value)
                    }}, normalizedHandleSize: {get: function() {
                        return this._getNormalizedValue(this.properties.HandleSize)
                    }}, _getNormalizedValue: function(observable) {
                    return observable() === null ? 0 : observable()
                }, updateRails: function() {
                    var nearRailSize = this._getNearRailSize();
                    this._isHorizontal() ? (this._nearRail.set(0, 0, nearRailSize, this.normalizedHeight), this._farRail.set(nearRailSize, 0, this.normalizedWidth - nearRailSize, this.normalizedHeight)) : (this._nearRail.set(0, nearRailSize, this.normalizedWidth, this.normalizedHeight - nearRailSize), this._farRail.set(0, 0, this.normalizedWidth, nearRailSize))
                }, updateHandle: function() {
                    var handleSize;
                    this._isHorizontal() ? (handleSize = Math.min(this.normalizedWidth, this.normalizedHandleSize), this._handle.set(this._getHandlePosition(this.normalizedWidth), 0, handleSize, this.normalizedHeight)) : (handleSize = Math.min(this.normalizedHeight, this.normalizedHandleSize), this._handle.set(0, this._getHandlePosition(this.normalizedHeight), this.normalizedWidth, handleSize))
                }, railClick: function(viewModel, evt) {
                    if (this._initialValueBeforeDrag = this.normalizedValue, !this._controlContext.viewState.disabled()) {
                        if (!this._processingPointerUp && evt.srcElement.className !== HANDLE_CLASS_NAME) {
                            var farRailClicked = evt.srcElement.className === FAR_RAIL_CLASS_NAME;
                            this._isHorizontal() ? this._setValue(evt.offsetX + evt.srcElement.offsetLeft, farRailClicked ? 1 : 0) : this._setValue(evt.offsetY + evt.srcElement.offsetTop, farRailClicked ? 0 : 1)
                        }
                        this._controlContext.behaviors.OnSelect();
                        !this._processingPointerUp && this._isValueChanged() && this._controlContext.controlWidget.fireEvent("OnChange", this._controlContext);
                        this._processingPointerUp = !1
                    }
                }, onPointerDown: function(controlContext, evt) {
                    return (evt.preventDefault(), this._controlContext.viewState.disabled()) ? !0 : (this._initialValueBeforeDrag = this.normalizedValue, this._processingPointerUp = !1, this._pointerDown(!0), this._sliderBoundingRect(this._sliderElement.getBoundingClientRect()), this._nearRailBoundingRect(this._nearRailElement.getBoundingClientRect()), this._numberTipBoundingClientRect(this._controlContext._numberTipElement.getBoundingClientRect()), document.addEventListener("pointerup", this._pointerUpHandler, !0), document.addEventListener("pointermove", this._pointerMoveHandler, !0), !0)
                }, _onPointerMove: function(evt) {
                    if (evt.preventDefault(), this._controlContext.realized && !this._controlContext.viewState.disabled()) {
                        this._sliderBoundingRect(this._sliderElement.getBoundingClientRect());
                        this._nearRailBoundingRect(this._nearRailElement.getBoundingClientRect());
                        var elementPosition = this._getElementPosition(evt),
                            valueToSet,
                            railPosition = Math.round(elementPosition / this._getRailToScreenTransform());
                        isNaN(railPosition) && (railPosition = 0);
                        valueToSet = this.normalizedMax - railPosition;
                        this._isHorizontal() && (valueToSet = this.normalizedMin + railPosition);
                        valueToSet = util.clamp(valueToSet, this.normalizedMin, this.normalizedMax);
                        this.properties.Value(valueToSet);
                        this._numberTipBoundingClientRect(this._controlContext._numberTipElement.getBoundingClientRect())
                    }
                }, _onPointerUp: function(evt) {
                    if (this._pointerDown(!1), this._removePointerHandlers(), evt.preventDefault(), this._controlContext.realized)
                        return this._controlContext.viewState.disabled() || (this._processingPointerUp = !0), this._isValueChanged() && this._controlContext.controlWidget.fireEvent("OnChange", this._controlContext), !0
                }, _removePointerHandlers: function() {
                    document.removeEventListener("pointerup", this._pointerUpHandler, !0);
                    document.removeEventListener("pointermove", this._pointerMoveHandler, !0)
                }, _setValue: function(elementPosition, fencePostIndex) {
                    if (this._controlContext.realized) {
                        var maxElementSize = this._isHorizontal() ? this.normalizedWidth : this.normalizedHeight;
                        var valueToSet;
                        elementPosition = util.clamp(elementPosition, 0, maxElementSize);
                        var railPosition = Math.floor(elementPosition / this._getRailToElementTransform());
                        valueToSet = this.normalizedMax - railPosition - fencePostIndex;
                        this._isHorizontal() && (valueToSet = this.normalizedMin + railPosition + fencePostIndex);
                        this.properties.Value(valueToSet)
                    }
                }, _getHandlePosition: function(railLength) {
                    if (this.normalizedValue < this.normalizedMin || this.normalizedValue > this.normalizedMax)
                        return 0;
                    var nearRailSize = this._getNearRailSize(),
                        handlePosition;
                    return nearRailSize < this.normalizedHandleSize / 2 ? handlePosition = 0 : (handlePosition = nearRailSize - this.normalizedHandleSize / 2, railLength - handlePosition < this.normalizedHandleSize && (handlePosition = railLength - this.normalizedHandleSize)), Math.floor(handlePosition)
                }, _getNearRailSize: function() {
                    if (this.normalizedValue > this.normalizedMax || this.normalizedValue < this.normalizedMin)
                        return 0;
                    var railToElementFactor = this._getRailToElementTransform(),
                        elementSize = Math.max(0, railToElementFactor * (this.normalizedMax - this.normalizedValue));
                    return this._isHorizontal() && (elementSize = Math.max(0, railToElementFactor * (this.normalizedValue - this.normalizedMin))), Math.floor(elementSize)
                }, _getRailToElementTransform: function() {
                    return this._getRailTransform(this.normalizedWidth, this.normalizedHeight)
                }, _getRailToScreenTransform: function() {
                    return this._getRailTransform(this._sliderBoundingRect().width, this._sliderBoundingRect().height)
                }, _getRailTransform: function(width, height) {
                    var range = this.normalizedMax - this.normalizedMin;
                    return (range <= 0 && (range = 1), this._isHorizontal()) ? width / range : height / range
                }, _isHorizontal: function() {
                    return this.properties.Layout() === null || this.properties.Layout() === "horizontal" ? !0 : !1
                }, _isValueChanged: function() {
                    return Math.abs(this._initialValueBeforeDrag - this.normalizedValue) !== 0
                }, _getElementPosition: function(evt) {
                    return this._isHorizontal() ? util.clamp(evt.clientX - this._sliderBoundingRect().left, 0, this._sliderBoundingRect().width) : util.clamp(evt.clientY - this._sliderBoundingRect().top, 0, this._sliderBoundingRect().height)
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Controls", {SliderViewModel: SliderViewModel})
})();