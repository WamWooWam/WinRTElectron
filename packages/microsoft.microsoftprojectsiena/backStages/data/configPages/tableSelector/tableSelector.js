//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var TableSelector = WinJS.Class.define(function TableSelector_ctor(element) {
            this._viewModel = element.viewModel;
            ko.applyBindings(this._viewModel, element.children[0])
        }, {_viewModel: null}, {});
    AppMagic.UI.Pages.define("/backStages/data/configPages/tableSelector/tableSelector.html", TableSelector)
})();