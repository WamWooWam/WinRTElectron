//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var ColumnTypeConverterOptionsMenuSelector = ".data-connection-type-menu",
        ServiceConfig = AppMagic.Constants.Services.Config,
        DataSourceSelectorMenuSelector = ".data-source-selector-menu",
        DataSourceSelectorSelector = ".data-source-selector",
        ConnectionView = WinJS.Class.define(function ConnectionView_ctor(element) {
            this._element = element;
            ko.applyBindings(element.viewModel, element.children[0])
        }, {_element: null});
    AppMagic.UI.Pages.define("/backStages/data/connections/connectionView.html", ConnectionView)
})();