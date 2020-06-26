//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var RestErrorPanelViewModel = WinJS.Class.define(function RestErrorPanelViewModel_ctor() {
            this._errors = ko.observableArray([])
        }, {
            _errors: null, errors: {get: function() {
                        return this._errors()
                    }}, addError: function(error) {
                    this._errors.push(error)
                }, dismissError: function(index) {
                    this._errors.splice(index, 1)
                }, dismissAllErrors: function() {
                    this._errors([])
                }
        }, {});
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {RestErrorPanelViewModel: RestErrorPanelViewModel})
})();