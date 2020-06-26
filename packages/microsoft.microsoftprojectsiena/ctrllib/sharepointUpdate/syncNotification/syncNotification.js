//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var SyncNotificationView = WinJS.Class.define(function SyncNotificationView_ctor(element) {
            this._element = element;
            ko.applyBindings(element.viewModel, element.children[0])
        }, {_element: null}, {});
    AppMagic.UI.Pages.define("/ctrllib/sharePointUpdate/syncNotification/syncNotification.html", SyncNotificationView)
})();