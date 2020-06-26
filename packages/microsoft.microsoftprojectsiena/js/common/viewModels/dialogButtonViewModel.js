//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var DialogButtonViewModel = WinJS.Class.define(function DialogButtonViewModel_ctor(title, clickFunction, shortcutLetter, isEnabledObservable) {
            this._clickFunction = clickFunction;
            this._title = title;
            this._shortcutLetter = shortcutLetter || null;
            this._isEnabled = isEnabledObservable || ko.observable(!0)
        }, {
            _clickFunction: null, _title: null, _isEnabled: null, _shortcutLetter: null, shortcutLetter: {get: function() {
                        return this._shortcutLetter
                    }}, title: {get: function() {
                        return this._title
                    }}, isEnabled: {get: function() {
                        return this._isEnabled()
                    }}, onButtonClick: function() {
                    return this._clickFunction(), !1
                }, onButtonKeyDown: function(e) {
                    return e.key === AppMagic.Constants.Keys.enter && !Core.Utility.isNullOrUndefined(this._clickFunction) ? (this._clickFunction(), !1) : !0
                }
        });
    WinJS.Namespace.define("AppMagic.Popups", {DialogButtonViewModel: DialogButtonViewModel})
})();