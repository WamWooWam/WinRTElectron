//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var ServiceConfig = AppMagic.Constants.Services.Config,
        DataView = WinJS.Class.define(function DataView_ctor(element) {
            this._element = element;
            this._viewModel = element.viewModel;
            var events,
                eventTracker = new AppMagic.Utility.EventTracker;
            events = AppMagic.AuthoringTool.ViewModels.DataConnectionsViewModel.events;
            eventTracker.add(this._viewModel, events.clickadd, this._onClickAdd, this);
            eventTracker.add(this._viewModel, events.entercomplete, this._onEnterComplete, this);
            eventTracker.add(this._viewModel, ServiceConfig.events.hideadd, this._hideAddDataSourcesPane.bind(this));
            eventTracker.add(this._viewModel, ServiceConfig.events.navigateadd, this._navigateAddDataSourcesPane.bind(this));
            eventTracker.add(this._viewModel, events.dataViewVisible, this._onDataViewVisible.bind(this));
            eventTracker.add(this._viewModel, events.connectionTypeClicked, this._onConnectionTypeClicked.bind(this));
            ko.utils.domNodeDisposal.addDisposeCallback(element.children[0], function() {
                eventTracker.dispose()
            }.bind(this));
            ko.applyBindings(this._viewModel, this._element.children[0])
        }, {
            _element: null, _viewModel: null, _hideAddDataSourcesPane: function() {
                    this._viewModel.isAddDataSourcesPaneVisible = !1
                }, _navigateAddDataSourcesPane: function(ev) {
                    this._viewModel.changeSelectionByName(ev.detail.target, ev.detail.options || {});
                    this._viewModel.isAddDataSourcesPaneVisible = !0
                }, _onDataViewVisible: function() {
                    this._runEnterContentAnimation("dataViewer")
                }, _runEnterContentAnimation: function(elementClassName) {
                    var element = this._element.getElementsByClassName(elementClassName);
                    WinJS.UI.Animation.enterContent(element, AppMagic.Constants.Animation.EnterContentAnimationOffset)
                }, _onConnectionTypeClicked: function(ev) {
                    var element = this._element.getElementsByClassName("dc-type-config-pane");
                    WinJS.UI.Animation.fadeOut(element).then(function() {
                        this._viewModel.setConnectionTypeAsync(ev.detail.connectionType, ev.detail.options, null).then(function() {
                            this._runEnterContentAnimation("dc-type-config-pane")
                        }.bind(this))
                    }.bind(this))
                }, _onClickAdd: function() {
                    this._viewModel.resetSelectedConnectionType();
                    this._viewModel.isAddDataSourcesPaneVisible || (this._viewModel.isAddDataSourcesPaneVisible = !0, this._runEnterContentAnimation("dc-types-pane"))
                }, _onEnterComplete: function() {
                    this._viewModel.isActive || this._viewModel.connectionListViewModel.allConnections.length !== 0 || this._onClickAdd()
                }
        }, {});
    AppMagic.UI.Pages.define("/backStages/data/dataPage.html", DataView)
})();