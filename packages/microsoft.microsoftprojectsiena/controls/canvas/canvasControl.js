//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var CanvasControlView = WinJS.Class.derive(AppMagic.Utility.Disposable, function CanvasControlView_ctor(element) {
            AppMagic.Utility.Disposable.call(this);
            this._element = element;
            this.track("_viewModel", element.canvasViewModel);
            ko.applyBindings(this._viewModel, element.children[0]);
            this.track("_eventTracker", new AppMagic.Utility.EventTracker);
            this._eventTracker.add(this._viewModel, "focus", this._handleFocus, this);
            this.track("_gestureRecognizer", new Windows.UI.Input.GestureRecognizer);
            this._gestureRecognizer.showGestureFeedback = !1;
            this._gestureRecognizer.gestureSettings = Windows.UI.Input.GestureSettings.hold;
            this._eventTracker.add(this._gestureRecognizer, "holding", this._holdingHandler, this);
            this._eventTracker.add(this._element, "pointerdown", this._processDown, this);
            this._offset = {};
            ko.utils.domNodeDisposal.addDisposeCallback(element.children[0], function() {
                this.dispose()
            }.bind(this));
            AppMagic.context.documentViewModel.notifyCanvasCreatedTestHook()
        }, {
            _offset: null, _element: null, _viewModel: null, _gestureRecognizer: null, _eventTracker: null, _holdingHandler: function(evt) {
                    evt.holdingState === Windows.UI.Input.HoldingState.started && this._viewModel.showContextMenu(evt.position, this._offset)
                }, _processDown: function(evt) {
                    evt.pointerType === "touch" && (evt.altKey || evt.ctrlKey || evt.shiftKey || this._gestureRecognizer.isActive || evt.target.contentEditable !== "true" && (this._offset = {
                        x: evt.offsetX, y: evt.offsetY
                    }, this._processGesture(function() {
                        var pointerPoint = evt.getCurrentPoint(document.documentElement);
                        this._gestureRecognizer.processDownEvent(pointerPoint)
                    }), this._eventTracker.add(this._element, "pointermove", this._processMove, this), this._eventTracker.add(this._element, "pointerup", this._processUp, this), evt.stopImmediatePropagation(), evt.stopPropagation()))
                }, _processMove: function(evt) {
                    this._processGesture(function() {
                        var pointerPoints = evt.getIntermediatePoints(document.documentElement);
                        this._gestureRecognizer.processMoveEvents(pointerPoints)
                    });
                    evt.stopImmediatePropagation();
                    evt.stopPropagation()
                }, _processUp: function(evt) {
                    this._processGesture(function() {
                        var pointerPoint = evt.getCurrentPoint(document.documentElement);
                        this._gestureRecognizer.processUpEvent(pointerPoint);
                        this._gestureRecognizer.completeGesture()
                    });
                    this._eventTracker.remove(this._element, "pointermove");
                    this._eventTracker.remove(this._element, "pointerup");
                    evt.stopImmediatePropagation();
                    evt.stopPropagation()
                }, _handleFocus: function() {
                    AppMagic.Utility.ignoreExceptions(function() {
                        this._element.setActive()
                    }, this)
                }, _processGesture: function(callback) {
                    AppMagic.Utility.ignoreExceptions(callback, this)
                }, dispose: function() {
                    this._element.canvasViewModel = null;
                    this._element = null;
                    AppMagic.Utility.Disposable.prototype.dispose.call(this)
                }
        }, {});
    WinJS.UI.Pages.define("/controls/canvas/canvasControl.html", {ready: function(element, options) {
            var canvas = element.canvasViewModel;
            canvas.isDisposed || new CanvasControlView(element)
        }});
    window.addEventListener("blur", function() {
        AppMagic.context.documentViewModel.canvasManager.visualLabelsVisible = !1
    }, !0)
})();