//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var ZoomStep = AppMagic.AuthoringTool.Constants.Zoom.Step,
        ZoomValueMin = AppMagic.AuthoringTool.Constants.Zoom.ValueMin,
        ZoomValueMax = AppMagic.AuthoringTool.Constants.Zoom.ValueMax,
        ZoomSource = AppMagic.AuthoringTool.Constants.Zoom.Source,
        ZoomFitMode = {
            allowAutomatic: "allowAutomatic", allowAutomaticLimit100: "allowAutomaticLimit100", disallowAutomatic: "disallowAutomatic"
        };
    function zoomToSliderValueConverter(value) {
        return value <= 100 ? Math.round(-.00138889 * Math.pow(value, 2) + .708333 * value - 6.94444) : Math.round(-.000416667 * Math.pow(value, 2) + .375 * value + 16.6667)
    }
    function sliderToZoomValueConverter(value) {
        return value <= 50 ? Math.round(.008 * Math.pow(value, 2) + 1.4 * value + 10) : Math.round(.08 * Math.pow(value, 2) - 6 * value + 200)
    }
    var ZoomViewModel = WinJS.Class.derive(AppMagic.Utility.Disposable, function ZoomViewModel_ctor(documentLayoutManager) {
            AppMagic.Utility.Disposable.call(this);
            this._value = ko.observable(100);
            this._adornerScale = ko.observable(1);
            this._adornerVisible = ko.observable(!0);
            this._documentLayoutManager = documentLayoutManager;
            this.track("_eventTracker", new AppMagic.Utility.EventTracker);
            this.track("_sliderValue", ko.computed({
                owner: this, read: function() {
                        return zoomToSliderValueConverter(this._value()).toString()
                    }, write: function(value) {
                        var convertedValue = sliderToZoomValueConverter(parseInt(value, 10));
                        this.setValue(convertedValue, ZoomSource.userInvoked)
                    }
            }));
            this._eventTracker.add(documentLayoutManager, "documentlayoutchanged", this.fitToPage.bind(this, AppMagic.AuthoringTool.Constants.Zoom.Source.automatic))
        }, {
            _documentLayoutManager: null, _eventTracker: null, _value: null, _adornerScale: null, _adornerVisible: null, _sliderValue: null, _mode: ZoomFitMode.allowAutomaticLimit100, gridSize: AppMagic.AuthoringTool.Constants.CanvasGridSize, adornerScale: {get: function() {
                        return this._adornerScale()
                    }}, adornerVisible: {get: function() {
                        return this._adornerVisible()
                    }}, outlineColor: {get: function() {
                        return this.value >= 100 ? "invert" : "black"
                    }}, sliderValue: {
                    get: function() {
                        return this._sliderValue()
                    }, set: function(value) {
                            this._sliderValue(value)
                        }
                }, value: {get: function() {
                        return this._value()
                    }}, zoomScale: {get: function() {
                        return this._value() / 100
                    }}, setValue: function(value, source) {
                    ZoomSource.verify(source);
                    this.dispatchEvent("beforeZoomChange");
                    value = Math.round(value);
                    this._value(value);
                    source === ZoomSource.userInvoked && (this._mode = ZoomFitMode.disallowAutomatic);
                    this._adornerVisible(value >= AppMagic.AuthoringTool.Constants.CanvasAdornerMinimumZoom);
                    var adornerScale = 100 / value;
                    this._adornerScale(adornerScale);
                    var canvasGridSize = AppMagic.AuthoringTool.Constants.CanvasGridSize;
                    this.gridSize = Math.round(adornerScale <= 1 ? canvasGridSize * adornerScale : canvasGridSize / adornerScale);
                    this.dispatchEvent("afterZoomChange")
                }, fit: function(source, width, height) {
                    if (ZoomSource.verify(source), this._mode !== ZoomFitMode.disallowAutomatic || source !== ZoomSource.automatic) {
                        source === ZoomSource.userInvoked && (this._mode = ZoomFitMode.allowAutomatic);
                        var xScale = (width - AppMagic.AuthoringTool.Constants.ScreenCanvasMargin * 2) / this._documentLayoutManager.width,
                            yScale = (height - AppMagic.AuthoringTool.Constants.ScreenCanvasMargin * 2) / this._documentLayoutManager.height,
                            minScale = Math.min(xScale, yScale) * 10;
                        minScale = Math.floor(minScale);
                        minScale *= 10;
                        this._mode === ZoomFitMode.allowAutomaticLimit100 && (minScale = Math.min(100, minScale));
                        minScale = Math.min(minScale, ZoomValueMax);
                        minScale = Math.max(minScale, ZoomValueMin);
                        this.setValue(minScale, ZoomSource.automatic)
                    }
                }, fitToPage: function(source) {
                    ZoomSource.verify(source);
                    this.fit(source, canvasGrid.offsetWidth, canvasGrid.offsetHeight - blankPageHeader.offsetHeight)
                }, zoomIn: function() {
                    var value = this._value() + ZoomStep;
                    value > ZoomValueMax && (value = ZoomValueMax);
                    this.setValue(value, ZoomSource.userInvoked)
                }, zoomOut: function() {
                    var value = this._value() - ZoomStep;
                    value < ZoomValueMin && (value = ZoomValueMin);
                    this.setValue(value, ZoomSource.userInvoked)
                }, handleKeyDown: function(element, evt) {
                    switch (evt.key) {
                        case AppMagic.Constants.Keys.down:
                            return this.zoomOut(), !1;
                        case AppMagic.Constants.Keys.up:
                            return this.zoomIn(), !1;
                        default:
                            return !0
                    }
                }
        }, {});
    WinJS.Class.mix(ZoomViewModel, WinJS.Utilities.eventMixin);
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {
        ZoomViewModel: ZoomViewModel, _sliderToZoomValueConverter: sliderToZoomValueConverter, _zoomToSliderValueConverter: zoomToSliderValueConverter, _ZoomFitMode: ZoomFitMode
    })
})();