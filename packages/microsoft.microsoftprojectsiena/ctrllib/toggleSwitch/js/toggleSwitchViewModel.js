//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var util = Core.Utility,
        ToggleSwitchViewModel = WinJS.Class.define(function ToggleSwitchViewModel(controlContext) {
            this._controlContext = controlContext;
            this._properties = controlContext.properties;
            this._switchOff = new AppMagic.Controls.ObservableRectangle(0, 0, 0, 0);
            this._switchOn = new AppMagic.Controls.ObservableRectangle(0, 0, 0, 0);
            this._handle = new AppMagic.Controls.ObservableRectangle(0, 0, 0, 0);
            this._handlePosition = ko.observable(0);
            this._handleSize = AppMagic.Constants.Controls.toggleSwitchHandleSize;
            var elements = controlContext.container.getElementsByClassName("appmagic-toggleSwitch");
            this._element = elements[0];
            this._handlePositionSubscription = this._handlePosition.subscribe(this.updateRailsAndHandle.bind(this));
            this.updateRailsAndHandle();
            this._mouseUpHandler = this._onMouseUp.bind(this);
            this._mouseMoveHandler = this._onMouseMove.bind(this)
        }, {
            _controlContext: null, _properties: null, _switchOff: null, _switchOn: null, _handle: null, _handlePosition: null, _handleSize: null, _handlePositionSubscription: null, _switchBoundingRect: null, _mouseUpHandler: null, _mouseMoveHandler: null, _element: null, controlContext: {get: function() {
                        return this._controlContext
                    }}, properties: {get: function() {
                        return this._properties
                    }}, switchOff: {get: function() {
                        return this._switchOff
                    }}, switchOn: {get: function() {
                        return this._switchOn
                    }}, handle: {get: function() {
                        return this._handle
                    }}, handlePosition: {get: function() {
                        return this._handlePosition
                    }}, dispose: function() {
                    this._removeMouseHandlers();
                    this._handlePositionSubscription.dispose();
                    this._handlePositionSubscription = null
                }, normalizedWidth: {get: function() {
                        return this._getNormalizedValue(this.properties.Width)
                    }}, normalizedHeight: {get: function() {
                        return this._getNormalizedValue(this.properties.Height)
                    }}, normalizedValue: {get: function() {
                        return this._getNormalizedValue(this.properties.Value)
                    }}, _getNormalizedValue: function(observable) {
                    return observable() === null ? 0 : observable()
                }, updateRailsAndHandle: function() {
                    this.updateRails();
                    this.updateHandle()
                }, updateRails: function() {
                    var nearRailSize = this._getSwitchOffSize();
                    this._switchOff.set(0, 0, nearRailSize, this.normalizedHeight);
                    this._switchOn.set(nearRailSize, 0, this.normalizedWidth - nearRailSize, this.normalizedHeight)
                }, updateHandle: function() {
                    this._handle.set(this._getHandlePosition(this.normalizedWidth), 0, this._getHandleSize(this.normalizedWidth), this.normalizedHeight)
                }, updateSwitch: function() {
                    this.normalizedValue ? this.handlePosition(this.normalizedWidth) : this.handlePosition(0)
                }, railClick: function(viewModel, evt) {
                    this._controlContext.viewState.disabled() || this._setValue(evt.offsetX + evt.srcElement.offsetLeft)
                }, offOnRailClick: function(viewModel, evt) {
                    this._controlContext.viewState.disabled() || (this._animate(), this.properties.Value(!this.normalizedValue), this.normalizedValue ? this.handlePosition(this.normalizedWidth) : this.handlePosition(0), evt.preventDefault(), evt.stopPropagation())
                }, onRailMouseDown: function() {
                    if (!this._controlContext.viewState.disabled())
                        return this._controlContext.behaviors.OnSelect(), !0
                }, onMouseDown: function(controlContext, evt) {
                    if (this._controlContext.viewState.disabled())
                        return !0;
                    var toggleElement = evt.srcElement.parentElement;
                    return this._switchBoundingRect = toggleElement.getBoundingClientRect(), document.addEventListener("mouseup", this._mouseUpHandler, !0), document.addEventListener("mousemove", this._mouseMoveHandler, !0), !0
                }, _onMouseMove: function(evt) {
                    if (this._controlContext.realized && !this._controlContext.viewState.disabled()) {
                        var elementPosition = util.clamp(evt.clientX - this._switchBoundingRect.left, 0, this._switchBoundingRect.width);
                        var railPosition = Math.floor(elementPosition / this._getRailTransform(this._switchBoundingRect.width));
                        isNaN(railPosition) && (railPosition = 0);
                        this.handlePosition(railPosition)
                    }
                }, _onMouseUp: function(evt) {
                    if (this._removeMouseHandlers(), this._controlContext.realized)
                        return this._setValue(this.handlePosition()), !0
                }, _removeMouseHandlers: function() {
                    document.removeEventListener("mouseup", this._mouseUpHandler, !0);
                    document.removeEventListener("mousemove", this._mouseMoveHandler, !0)
                }, _setValue: function(elementPosition) {
                    if (this._controlContext.realized) {
                        this._animate();
                        var maxElementSize = this.normalizedWidth;
                        elementPosition = util.clamp(elementPosition, 0, maxElementSize);
                        elementPosition > this.normalizedWidth / 2 ? (this.properties.Value(!0), this.handlePosition(this.normalizedWidth)) : (this.properties.Value(!1), this.handlePosition(0))
                    }
                }, _getRailTransform: function(width) {
                    var range = this.normalizedWidth;
                    return range <= 0 ? 1 : width / range
                }, _getHandlePosition: function(railLength) {
                    var switchOffSize = this._getSwitchOffSize(),
                        handlePosition;
                    return switchOffSize < this._handleSize / 2 ? handlePosition = 0 : (handlePosition = switchOffSize - this._handleSize / 2, railLength - handlePosition < this._handleSize && (handlePosition = railLength - this._handleSize)), Math.floor(handlePosition)
                }, _getHandleSize: function(railLength) {
                    return Math.min(this.normalizedHeight, this._handleSize)
                }, _getSwitchOffSize: function() {
                    var railToElementFactor = this._getRailTransform(this.normalizedWidth),
                        elementSize = Math.max(0, railToElementFactor * this.handlePosition());
                    return Math.floor(elementSize)
                }, _animate: function() {
                    Array.prototype.forEach.call(this._element.childNodes, function(child) {
                        if (child.nodeType === Node.ELEMENT_NODE) {
                            var transitionEnd = function() {
                                    child.classList.remove("animate-toggle");
                                    child.removeEventListener("transitionend", transitionEnd)
                                };
                            child.addEventListener("transitionend", transitionEnd);
                            child.classList.add("animate-toggle")
                        }
                    })
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Controls", {ToggleSwitchViewModel: ToggleSwitchViewModel})
})();