//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var RestServicePackageImportConfig = WinJS.Class.define(function RestServicePackageImportConfig_ctor(element) {
            this._viewModel = ko.computed(function() {
                return element.viewModel
            });
            ko.applyBindings(this._viewModel(), element.children[0])
        }, {_viewModel: null}, {});
    WinJS.UI.Pages.define("/backStages/data/configPages/rest/restServicePackageImportConfig.html", {ready: function(element, options) {
            new RestServicePackageImportConfig(element)
        }})
})();