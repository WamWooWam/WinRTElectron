//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var RestServiceKeyConfigView = WinJS.Class.define(function RestServiceKeyConfigView_ctor(element) {
            ko.applyBindings(element.viewModel, element.children[0])
        }, {}, {});
    AppMagic.UI.Pages.define("/backStages/data/configPages/rest/restServiceKeyConfig.html", RestServiceKeyConfigView)
})();