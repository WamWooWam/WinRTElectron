//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var AzureServiceKeyConfig = WinJS.Class.define(function AzureServiceKeyConfig_ctor(element) {
            this._viewModel = element.viewModel;
            ko.applyBindings(this._viewModel, element.children[0])
        }, {_viewModel: null}, {});
    AppMagic.UI.Pages.define("/backStages/data/configPages/azure/azureServiceKeyConfig.html", AzureServiceKeyConfig)
})();