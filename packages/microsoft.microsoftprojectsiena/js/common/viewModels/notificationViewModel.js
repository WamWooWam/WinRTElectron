//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var NotificationViewModel = WinJS.Class.define(function NotificationViewModel_ctor() {
            this._pageViewModel = ko.observable(null)
        }, {
            _pageViewModel: null, pageViewModel: {
                    get: function() {
                        return this._pageViewModel()
                    }, set: function(value) {
                            this._pageViewModel(value)
                        }
                }
        }, {});
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {NotificationViewModel: NotificationViewModel})
})();