//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var MessageDialogBodyView = WinJS.Class.define(function MessageDialogBodyView_ctor(element) {
            ko.applyBindings(element.viewModel, element.children[0])
        }, {}, {});
    AppMagic.UI.Pages.define("/controls/common/dialog/messageDialogBody.html", MessageDialogBodyView)
})();