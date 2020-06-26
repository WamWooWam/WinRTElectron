//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var ExcelConfig = WinJS.Class.define(function ExcelConfig_ctor(element) {
            this._viewModel = element.viewModel;
            ko.applyBindings(this._viewModel, element.children[0])
        }, {_viewModel: null}, {});
    AppMagic.UI.Pages.define("/backStages/data/configPages/excel/excelConfig.html", ExcelConfig)
})();