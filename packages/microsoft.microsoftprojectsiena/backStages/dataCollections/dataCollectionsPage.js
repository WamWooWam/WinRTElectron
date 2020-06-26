//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var collectionMenuSelector = ".collectionMenu",
        collectionMenuAnchorSelector = ".collectionMenuAnchor",
        DataCollectionsView = WinJS.Class.define(function DataCollectionsView_ctor(element) {
            this._element = element;
            this._viewModel = element.viewModel;
            ko.applyBindings(this._viewModel, element.children[0]);
            var events,
                eventTracker = new AppMagic.Utility.EventTracker;
            events = AppMagic.AuthoringTool.ViewModels.DataCollectionsViewModel.events;
            eventTracker.add(this._viewModel, events.clickcollectionselector, this._onClickCollectionSelector, this);
            eventTracker.add(this._viewModel, events.collectionoptionclicked, this._onCollectionOptionClicked, this);
            ko.utils.domNodeDisposal.addDisposeCallback(element.children[0], function() {
                eventTracker.dispose()
            })
        }, {
            _element: null, _viewModel: null, _onClickCollectionSelector: function() {
                    var collectionMenu = this._element.querySelector(collectionMenuSelector);
                    var collectionMenuAnchor = this._element.querySelector(collectionMenuAnchorSelector);
                    collectionMenu.winControl.show(collectionMenuAnchor, "bottom", "left")
                }, _getDataCollectionsPreviewElement: function() {
                    var element = this._element.getElementsByClassName("dataCollectionsPreview");
                    return element
                }, _onCollectionOptionClicked: function(ev) {
                    WinJS.UI.Animation.fadeOut(this._getDataCollectionsPreviewElement()).then(function() {
                        this._viewModel.setCollectionData(ev.detail.collectionOptionIndex);
                        WinJS.UI.Animation.enterContent(this._getDataCollectionsPreviewElement(), AppMagic.Constants.Animation.EnterContentAnimationOffset)
                    }.bind(this))
                }
        }, {});
    AppMagic.UI.Pages.define("/backStages/dataCollections/dataCollectionsPage.html", DataCollectionsView)
})();