//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var ScreenWidget = WinJS.Class.define(function ScreenControl_ctor(){}, {
            _backgroundColor: 0, _backgroundImage: "", _imagePosition: "Fit", Fill: {get: function() {
                        return this._backgroundColor
                    }}, backgroundImage: {get: function() {
                        return this._backgroundImage
                    }}, imagePosition: {get: function() {
                        return this._imagePosition
                    }}, onChangeFill: function(evt) {
                    this._backgroundColor = evt.newValue;
                    this._ensureScreenStyles()
                }, onChangeBackgroundImage: function(evt) {
                    AppMagic.Utility.mediaUrlHelper(evt.oldValue, evt.newValue, !1).then(function(src) {
                        this._backgroundImage = src;
                        this._ensureScreenStyles()
                    }.bind(this), function(){})
                }, onChangeImagePosition: function(evt) {
                    var stretchValue = AppMagic.Controls.converters.imagePositionConverter.view(evt.newValue);
                    this._imagePosition = stretchValue;
                    this._ensureScreenStyles()
                }, _ensureScreenStyles: function() {
                    var elm = document.getElementById(AppMagic.Publish.Canvas.buildContainerName(this.OpenAjax.getId()));
                    elm.style.width = "100%";
                    elm.style.height = "100%";
                    elm.style.backgroundPosition = this._imagePosition.position;
                    elm.style.backgroundRepeat = this._imagePosition.repeat;
                    elm.style.backgroundSize = this._imagePosition.size;
                    var bgColor = AppMagic.Utility.Color.create(this._backgroundColor).toCss();
                    elm.style.backgroundColor = "RGBA(255, 255, 255, 1)";
                    elm.style.backgroundImage = 'url("' + this._backgroundImage + '"), linear-gradient(' + bgColor + " 0%, " + bgColor + " 100%)";
                    elm.style.backgroundImage = 'url("' + this._backgroundImage + '"), -webkit-linear-gradient(' + bgColor + " 0%, " + bgColor + " 100%)"
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Controls", {Screen: ScreenWidget})
})();