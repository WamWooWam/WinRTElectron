//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var DataViewerControl = WinJS.Class.define(function DataViewerControl_ctor(element) {
            this._connectionViewModel = element.connectionViewModel;
            ko.applyBindings(element.viewModel, element.children[0]);
            var events = AppMagic.AuthoringTool.ObjectViewer.DataViewerViewModel.events;
            this._eventTracker = new AppMagic.Utility.EventTracker;
            this._eventTracker.add(element.viewModel, events.clickchildgridheader, this._onClickChildGridHeader, this);
            ko.utils.domNodeDisposal.addDisposeCallback(element.children[0], function() {
                this._eventTracker.dispose()
            }.bind(this))
        }, {
            _connectionViewModel: null, _eventTracker: null, _onClickChildGridHeader: function(evt) {
                    this._connectionViewModel.populateColumnTypeConverterOptions(evt.detail.header);
                    this._connectionViewModel.showColumnMenu(evt.detail.headerElement)
                }
        }, {});
    AppMagic.UI.Pages.define("/controls/dataSourceDataViewer/dataSourceDataViewerControl.html", DataViewerControl)
})();