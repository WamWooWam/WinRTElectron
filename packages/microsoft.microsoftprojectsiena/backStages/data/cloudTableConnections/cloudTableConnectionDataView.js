//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var ConnectionDataView = WinJS.Class.define(function ConnectionDataView_ctor(element) {
            ko.applyBindings(element.viewModel, element.children[0])
        }, {});
    AppMagic.UI.Pages.define("/backStages/data/cloudTableConnections/cloudTableConnectionDataView.html", ConnectionDataView)
})();