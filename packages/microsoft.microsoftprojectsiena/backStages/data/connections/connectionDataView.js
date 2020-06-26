//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var ColumnTypeConverterOptionsMenuSelector = ".data-connection-type-menu",
        ServiceConfig = AppMagic.Constants.Services.Config,
        DataSourceSelectorMenuSelector = ".data-source-selector-menu",
        DataSourceSelectorSelector = ".data-source-selector",
        ConnectionDataView = WinJS.Class.define(function ConnectionDataView_ctor(element) {
            this._columnMenu = element.querySelector(ColumnTypeConverterOptionsMenuSelector);
            var eventTracker = new AppMagic.Utility.EventTracker;
            eventTracker.add(element.viewModel, ServiceConfig.events.showcolumnmenu, this._showColumnMenu, this);
            ko.utils.domNodeDisposal.addDisposeCallback(element.children[0], function() {
                eventTracker.dispose()
            });
            ko.applyBindings(element.viewModel, element.children[0])
        }, {
            _columnMenu: null, _showColumnMenu: function(evt) {
                    this._columnMenu.winControl.show(evt.detail.anchor, "bottom", "left")
                }
        });
    AppMagic.UI.Pages.define("/backStages/data/connections/connectionDataView.html", ConnectionDataView)
})();