//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var util = AppMagic.Utility,
        DropDownListItemViewModel = WinJS.Class.derive(util.Disposable, function DropDownItemViewModel_ctor(item, isSelected, controlContext) {
            util.Disposable.call(this);
            this._controlContext = controlContext;
            this._src = item._src;
            this._index = item.index;
            this._value = item.Value;
            this._selected = ko.observable(isSelected);
            this._hasFocus = ko.observable(!1);
            this._hovering = ko.observable(!1);
            this._pressed = ko.observable(!1);
            this.track("_backgroundColor", ko.computed(function() {
                return this.selected ? controlContext.properties.SelectionFill() : controlContext.properties.Fill()
            }.bind(this)));
            this.track("_textColor", ko.computed(function() {
                return this._pressed() ? controlContext.properties.PressedColor() : this._hovering() ? controlContext.properties.HoverColor() : this.selected ? controlContext.properties.SelectionColor() : controlContext.properties.Color()
            }.bind(this)))
        }, {
            _controlContext: null, _src: null, _index: null, _value: null, _selected: null, _hasFocus: null, _backgroundColor: null, _textColor: null, _hovering: null, _pressed: null, onMouseOver: function(dropDownListItemViewModel, evt) {
                    this._hovering(!0);
                    this._stopEventPropagation(evt)
                }, onMouseOut: function(dropDownListItemViewModel, evt) {
                    this._hovering(!1);
                    this._pressed(!1);
                    this._stopEventPropagation(evt)
                }, onMouseDown: function(dropDownListItemViewModel, evt) {
                    this._pressed(!0);
                    this._stopEventPropagation(evt)
                }, onMouseUp: function(dropDownListItemViewModel, evt) {
                    this._pressed(!1);
                    this._stopEventPropagation(evt)
                }, _stopEventPropagation: function(evt) {
                    try {
                        evt.stopPropagation()
                    }
                    finally {
                        return
                    }
                }, getTopBorderWidthCss: function(index, count) {
                    return index === 0 ? this._controlContext.properties.BorderThickness() : "0px"
                }, getBottomBorderWidthCss: function(index, count) {
                    return index === count - 1 ? this._controlContext.properties.BorderThickness() : "0px"
                }, index: {get: function() {
                        return this._index
                    }}, value: {get: function() {
                        return this._value
                    }}, selected: {
                    get: function() {
                        return this._selected()
                    }, set: function(value) {
                            this._selected(value)
                        }
                }, hasFocus: {
                    get: function() {
                        return this._hasFocus()
                    }, set: function(value) {
                            this._hasFocus(value)
                        }
                }, backgroundColor: {get: function() {
                        return this._backgroundColor()
                    }}, textColor: {get: function() {
                        return this._textColor()
                    }}
        });
    WinJS.Namespace.define("AppMagic.Controls", {DropDownListItemViewModel: DropDownListItemViewModel})
})();