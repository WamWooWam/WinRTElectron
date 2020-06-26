//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var RestFunctionSelectorMenuSelector = ".rest-function-selector-menu",
        RestFunctionSelectorSelector = ".rest-function-selector",
        RestConnectionView = WinJS.Class.define(function RestConnectionView_ctor(element) {
            this._element = element;
            this._viewModel = element.viewModel;
            this._parentViewModel = element.parentViewModel;
            var eventTracker = new AppMagic.Utility.EventTracker;
            ko.utils.domNodeDisposal.addDisposeCallback(element.children[0], function() {
                eventTracker.dispose()
            });
            ko.applyBindings(element.viewModel, element.children[0])
        }, {
            _element: null, _viewModel: null, _parentViewModel: null
        });
    WinJS.UI.Pages.define("/backStages/data/restConnections/restConnectionView.html", {ready: function(element, options) {
            new RestConnectionView(element)
        }})
})();