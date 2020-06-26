//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var NotificationView = WinJS.Class.define(function NotificationView_ctor(element) {
            ko.applyBindings(AppMagic.AuthoringTool.Runtime.notificationViewModel, element)
        }, {}, {});
    AppMagic.UI.Pages.define("/controls/common/notification/notification.html", NotificationView)
})();