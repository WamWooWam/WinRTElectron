//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var util = Core.Utility,
        seekBarThumbSrcUrl = "controls/common/seekBar/images/seekBarThumb.svg",
        seekBarThumbSelectedSrcUrl = "controls/common/seekBar/images/seekBarThumbSelected.svg",
        seekBarTrackClassSelector = ".appmagic-seekbar-track",
        seekBarThumbClassSelector = ".appmagic-seekbar-thumb",
        seekBarFillSelector = ".appmagic-seekbar-fill",
        SeekBarView = WinJS.Class.define(function SeekBar_ctor(element) {
            this._element = element;
            this._seekBarTrack = this._element.querySelector(seekBarTrackClassSelector);
            this._seekBarThumb = this._element.querySelector(seekBarThumbClassSelector);
            this._seekBarFill = this._element.querySelector(seekBarFillSelector);
            this._onPointerEventHandler = this._onPointerEvent.bind(this);
            this._element.addEventListener("pointerdown", this._onPointerEventHandler, !0);
            this._element.addEventListener("pointerup", this._onPointerEventHandler, !0);
            this._element.addEventListener("pointermove", this._onPointerEventHandler, !0);
            this._seekBarThumbSrc = ko.observable(seekBarThumbSrcUrl);
            this._seekBarFillWidth = ko.observable();
            this._updateSeekBarFillWidth(element.value());
            this._element.value.subscribe(this._updateSeekBarFillWidth, this);
            this._element.min.subscribe(this._updateSeekBarFillWidth, this);
            this._element.max.subscribe(this._updateSeekBarFillWidth, this);
            ko.applyBindings(this, element.children[0])
        }, {
            _element: null, _seekBarTrack: null, _seekBarThumb: null, _seekBarThumbSrc: null, _seekBarFillWidth: null, _isManipulating: !1, _onPointerEventHandler: null, _updateSeekBarFillWidth: function(newValue) {
                    var min = this._element.min(),
                        max = this._element.max();
                    this._seekBarFillWidth(util.clamp((newValue - min) / (max - min) * 100, 0, 100).toString() + "%")
                }, seekBarFillWidth: {get: function() {
                        return this._seekBarFillWidth()
                    }}, seekBarThumbSrc: {get: function() {
                        return this._seekBarThumbSrc()
                    }}, _updateValue: function(e) {
                    var offsetX = e.offsetX;
                    e.target === this._seekBarThumb && (offsetX = this._seekBarThumb.offsetLeft + e.offsetX + this._seekBarThumb.width / 2);
                    var fractionWidth = offsetX / this._seekBarTrack.offsetWidth,
                        min = this._element.min(),
                        max = this._element.max();
                    this._element.value(util.clamp(fractionWidth * (max - min) + min, min, max))
                }, _onPointerEvent: function(e) {
                    switch (e.type) {
                        case"pointerdown":
                            e.preventDefault();
                            this._updateValue(e);
                            this._isManipulating = !0;
                            this._seekBarThumbSrc(seekBarThumbSelectedSrcUrl);
                            this._element.setPointerCapture(e.pointerId);
                            break;
                        case"pointerup":
                        case"pointercancel":
                            e.preventDefault();
                            this._isManipulating = !1;
                            e.cancelBubble = !0;
                            this._seekBarThumbSrc(seekBarThumbSrcUrl);
                            this._element.releasePointerCapture(e.pointerId);
                            break;
                        case"pointermove":
                            e.preventDefault();
                            this._isManipulating && this._updateValue(e);
                            e.cancelBubble = !0;
                            break
                    }
                    return !0
                }
        }, {});
    AppMagic.UI.Pages.define("/controls/common/seekBar/seekBar.html", SeekBarView)
})();