//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var AppSettingsView = WinJS.Class.define(function AppSettingsView_ctor(element) {
            ko.applyBindings(element.viewModel, element.children[0])
        }, {}, {});
    AppMagic.UI.Pages.define("/backStages/appSettings/appSettingsPage.html", AppSettingsView)
})();