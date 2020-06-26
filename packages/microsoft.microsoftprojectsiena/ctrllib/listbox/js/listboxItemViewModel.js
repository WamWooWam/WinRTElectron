//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var util = AppMagic.Utility,
        ListboxItemViewModel = WinJS.Class.define(function ListboxItemViewModel_ctor(data, parentViewModel, isSelected, controlContext) {
            this._controlContext = controlContext;
            this._src = data._src;
            this._parentViewModel = parentViewModel;
            this._id = data._id;
            this._value = ko.observable(data.Value);
            this._selected = ko.observable(isSelected);
            this._hasFocus = ko.observable(!1);
            this._hovering = ko.observable(!1);
            this._pressed = ko.observable(!1);
            this._backgroundColor = ko.computed(function() {
                return controlContext.viewState.disabled() ? controlContext.properties.DisabledFill() : this.selected() ? controlContext.properties.SelectionFill() : controlContext.properties.Fill()
            }.bind(this));
            this._textColor = ko.computed(function() {
                return controlContext.viewState.disabled() ? controlContext.properties.DisabledColor() : this._pressed() ? controlContext.properties.PressedColor() : this._hovering() ? controlContext.properties.HoverColor() : this.selected() ? controlContext.properties.SelectionColor() : controlContext.properties.Color()
            }.bind(this))
        }, {
            _controlContext: null, _src: null, _parentViewModel: null, _id: null, _value: null, _selected: null, _hasFocus: null, _backgroundColor: null, _textColor: null, _hovering: null, _pressed: null, onMouseOver: function() {
                    this._hovering(!0)
                }, onMouseOut: function() {
                    this._hovering(!1);
                    this._pressed(!1)
                }, onMouseDown: function() {
                    this._pressed(!0)
                }, onMouseUp: function() {
                    this._pressed(!1)
                }, controlContext: {get: function() {
                        return this._controlContext
                    }}, id: {get: function() {
                        return this._id
                    }}, parentViewModel: {get: function() {
                        return this._parentViewModel
                    }}, value: {get: function() {
                        return this._value
                    }}, selected: {get: function() {
                        return this._selected
                    }}, hasFocus: {get: function() {
                        return this._hasFocus
                    }}, backgroundColor: {get: function() {
                        return this._backgroundColor()
                    }}, textColor: {get: function() {
                        return this._textColor()
                    }}, dispose: function() {
                    this._backgroundColor.dispose();
                    this._textColor.dispose()
                }
        });
    WinJS.Namespace.define("AppMagic.Controls", {ListboxItemViewModel: ListboxItemViewModel})
})();