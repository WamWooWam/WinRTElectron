//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var ScreenWidget = WinJS.Class.define(function ScreenControl_ctor(){}, {
            _canvas: null, Fill: {get: function() {
                        return this._getCanvas().backgroundColor
                    }}, BackgroundImage: {get: function() {
                        return this._getCanvas().backgroundImage
                    }}, ImagePosition: {get: function() {
                        return this._getCanvas().imagePosition
                    }}, onChangeFill: function(evt) {
                    var canvas = this._getCanvas();
                    if (canvas) {
                        var cssColor = null;
                        if (evt.newValue !== null) {
                            var color = AppMagic.Utility.Color.create(evt.newValue);
                            cssColor = color.toCss()
                        }
                        canvas.backgroundColor = cssColor;
                        this._notifyPropertyChanged("Fill", evt.newValue)
                    }
                }, onChangeBackgroundImage: function(evt) {
                    var canvas = this._getCanvas();
                    canvas && (canvas.backgroundImage = evt.newValue, this._notifyPropertyChanged("BackgroundImage", evt.newValue))
                }, onChangeImagePosition: function(evt) {
                    var canvas = this._getCanvas();
                    if (canvas) {
                        var stretchValue = AppMagic.Controls.converters.imagePositionConverter.view(evt.newValue);
                        canvas.imagePosition = stretchValue;
                        this._notifyPropertyChanged("ImagePosition", evt.newValue)
                    }
                }, _getCanvas: function() {
                    if (!this._canvas && AppMagic.AuthoringTool.Runtime.isAuthoring) {
                        var documentViewModel = AppMagic.context.documentViewModel,
                            screenViewModel = documentViewModel.getScreenByName(this.OpenAjax.getId());
                        this._canvas = documentViewModel.canvasManager.getCanvasForScreen(screenViewModel)
                    }
                    return this._canvas
                }, _notifyPropertyChanged: function(propertyName, value) {
                    AppMagic.context.documentViewModel.notifyEntityPropertyChanged(this.OpenAjax.getId(), propertyName, value)
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Controls", {Screen: ScreenWidget})
})();