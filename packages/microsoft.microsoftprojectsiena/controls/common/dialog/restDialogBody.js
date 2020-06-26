//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var RestDialogBodyView = WinJS.Class.define(function RestDialogBodyView_ctor(element) {
            ko.applyBindings(element.viewModel, element.children[0])
        }, {}, {});
    WinJS.UI.Pages.define("/controls/common/dialog/restDialogBody.html", {ready: function(element, options) {
            new RestDialogBodyView(element)
        }})
})();