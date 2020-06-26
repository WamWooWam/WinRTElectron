//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var PublishView = WinJS.Class.define(function PublishView_ctor(element) {
            ko.applyBindings(element.viewModel, element.children[0])
        }, {}, {});
    AppMagic.UI.Pages.define("/backStages/publish/publishPage.html", PublishView)
})();