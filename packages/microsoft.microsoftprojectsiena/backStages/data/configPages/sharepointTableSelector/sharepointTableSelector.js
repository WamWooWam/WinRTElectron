//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var SharepointTableSelector = WinJS.Class.define(function SharepointTableSelector_ctor(element) {
            this._viewModel = element.viewModel;
            ko.applyBindings(this._viewModel, element.children[0])
        }, {_viewModel: null}, {});
    AppMagic.UI.Pages.define("/backStages/data/configPages/sharepointTableSelector/sharepointTableSelector.html", SharepointTableSelector)
})();