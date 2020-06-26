//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var CachedAuthDialogBodyView = WinJS.Class.define(function CachedAuthDialogBodyView_ctor(element) {
            ko.applyBindings(element.viewModel, element.children[0])
        }, {}, {});
    AppMagic.UI.Pages.define("/controls/common/dialog/cachedAuthDialog.html", CachedAuthDialogBodyView)
})();