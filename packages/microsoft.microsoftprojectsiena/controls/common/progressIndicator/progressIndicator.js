//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var ProgressIndicatorView = WinJS.Class.define(function ProgressIndicatorView_ctor(element) {
            ko.applyBindings(element.viewModel, element.children[0])
        }, {}, {});
    AppMagic.UI.Pages.define("/controls/common/progressIndicator/progressIndicator.html", ProgressIndicatorView)
})();