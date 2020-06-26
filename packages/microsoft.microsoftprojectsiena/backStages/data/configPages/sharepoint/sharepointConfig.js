//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var SharePointConfig = WinJS.Class.define(function SharePointConfig_ctor(element) {
            this._viewModel = ko.computed(function() {
                return element.viewModel
            });
            ko.applyBindings(this._viewModel(), element.children[0])
        }, {_viewModel: null}, {});
    AppMagic.UI.Pages.define("/backStages/data/configPages/sharepoint/sharepointConfig.html", SharePointConfig)
})();