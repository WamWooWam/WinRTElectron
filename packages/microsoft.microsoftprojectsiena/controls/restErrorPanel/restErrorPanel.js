//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var RestErrorPanelView = WinJS.Class.define(function RestErrorPanelView_ctor(element) {
            var viewModel = ko.computed(function() {
                    return AppMagic.context.documentViewModel.restErrorPanel
                });
            ko.applyBindings(viewModel, element)
        }, {}, {});
    WinJS.UI.Pages.define("/controls/restErrorPanel/restErrorPanel.html", {ready: function(element, options) {
            new RestErrorPanelView(element)
        }})
})();