//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var util = AppMagic.Utility,
        Slider = WinJS.Class.define(function Slider_ctor(){}, {
            initControlContext: function(controlContext) {
                controlContext.modelProperties.Value.setValue(controlContext.modelProperties.Default.getValue())
            }, initView: function(container, controlContext) {
                    var numberTipElement = this._createNumberTipElement();
                    util.createOrSetPrivate(controlContext, "_numberTipElement", numberTipElement);
                    this._appendNumberTipElementToDom(numberTipElement);
                    util.createOrSetPrivate(controlContext, "RailFill", ko.computed(function() {
                        return controlContext.viewState.hovering() ? controlContext.properties.RailHoverFill() : controlContext.properties.RailFill()
                    }));
                    util.createOrSetPrivate(controlContext, "ValueFill", ko.computed(function() {
                        return controlContext.viewState.hovering() ? controlContext.properties.ValueHoverFill() : controlContext.properties.ValueFill()
                    }));
                    var sliderViewModel = new AppMagic.Controls.SliderViewModel(controlContext, container.children[0]);
                    util.createOrSetPrivate(controlContext, "_sliderViewModel", sliderViewModel);
                    ko.applyBindings(sliderViewModel, container);
                    ko.applyBindings(sliderViewModel, numberTipElement)
                }, disposeView: function(container, controlContext) {
                    controlContext._numberTipElement && controlContext._numberTipElement.parentNode && controlContext._numberTipElement.parentNode.removeChild(controlContext._numberTipElement);
                    controlContext._sliderViewModel.dispose();
                    controlContext._sliderViewModel = null
                }, onChangeMin: function(evt, controlContext) {
                    controlContext.realized && (this._updateOutputValue(controlContext), this._updateRailsAndHandle(controlContext))
                }, onChangeMax: function(evt, controlContext) {
                    controlContext.realized && (this._updateOutputValue(controlContext), this._updateRailsAndHandle(controlContext))
                }, onChangeDefault: function(evt, controlContext) {
                    controlContext.modelProperties.Value.setValue(controlContext.modelProperties.Default.getValue());
                    this._updateOutputValue(controlContext)
                }, onChangeValue: function(evt, controlContext) {
                    controlContext.realized && this._updateRailsAndHandle(controlContext)
                }, onChangeHeight: function(evt, controlContext) {
                    controlContext.realized && this._updateRailsAndHandle(controlContext)
                }, onChangeWidth: function(evt, controlContext) {
                    controlContext.realized && this._updateRailsAndHandle(controlContext)
                }, onChangeLayout: function(evt, controlContext) {
                    controlContext.realized && this._updateRailsAndHandle(controlContext)
                }, onChangeHandleSize: function(evt, controlContext) {
                    controlContext.realized && controlContext._sliderViewModel.updateHandle()
                }, onChangeShowValue: function(evt, controlContext) {
                    !controlContext.realized
                }, _updateOutputValue: function(controlContext, value) {
                    var defaultValue = controlContext.modelProperties.Default.getValue(),
                        minValue = controlContext.modelProperties.Min.getValue(),
                        maxValue = controlContext.modelProperties.Max.getValue();
                    typeof value == "undefined" && (value = defaultValue);
                    value === null && (value = defaultValue !== null ? defaultValue : minValue !== null ? minValue : 0);
                    minValue !== null && value < minValue ? value = minValue : maxValue !== null && value > maxValue && (value = maxValue);
                    controlContext.modelProperties.Value.setValue(value);
                    this.OpenAjax.fireEvent("OnChange", controlContext)
                }, _updateRailsAndHandle: function(controlContext) {
                    controlContext._sliderViewModel.updateRails();
                    controlContext._sliderViewModel.updateHandle()
                }, _createNumberTipElement: function() {
                    var id = util.generateRandomId("slider"),
                        element = document.createElement("div");
                    return WinJS.Utilities.addClass(element, Slider.NUMBERTIP_CLASS_NAME), element.id = Slider.NUMBERTIP_CLASS_NAME + id, element.setAttribute("data-bind", "visible: numberTipVisible, text: numberTipValue, style: { left: numberTipLeft, top: numberTipTop, }"), element
                }, _appendNumberTipElementToDom: function(numberTipElement) {
                    document.body.appendChild(numberTipElement)
                }
        }, {
            Clamp: function(value, min, max) {
                return value < min ? min : value > max ? max : value
            }, NUMBERTIP_CLASS_NAME: "appmagic-slider-numbertip"
        });
    WinJS.Namespace.define("AppMagic.Controls", {Slider: Slider})
})();