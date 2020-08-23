/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.Pages", {SnappedTvEpisodeDetailsOverview: MS.Entertainment.UI.Framework.defineUserControl("/Components/ImmersiveDetails/SnappedTvEpisodeDetails.html#tvEpisodeDetailsOverviewTemplate", function tvSeriesDetailsOverviewConstructor() {
            this._bindingsToDetach = []
        }, {
            _bindingsToDetach: null, initialize: function initialize() {
                    this.bind("mediaItem", this._modelChanged.bind(this));
                    var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                    this._initializeBinding(uiStateService, "nowPlayingVisible", function nowPlayingVisibleChanged() {
                        this.nowPlayingVisible = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).nowPlayingVisible
                    }.bind(this));
                    this._initializeBinding(uiStateService, "nowPlayingInset", function nowPlayingInsetChanged() {
                        this.nowPlayingInset = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).nowPlayingInset
                    }.bind(this));
                    MS.Entertainment.UI.Controls.Panel.raisePanelReady(this.domElement)
                }, _detachBindings: function _detachBindings() {
                    this._bindingsToDetach.forEach(function(e) {
                        e.source.unbind(e.name, e.action)
                    });
                    this._bindingsToDetach = []
                }, _initializeBinding: function _initializeBinding(source, name, action) {
                    source.bind(name, action);
                    this._bindingsToDetach.push({
                        source: source, name: name, action: action
                    })
                }, unload: function unload() {
                    this._detachBindings();
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, _modelChanged: function _modelChanged(newModel) {
                    if (newModel)
                        if (newModel.serviceId && !MS.Entertainment.Utilities.isEmptyGuid(newModel.serviceId))
                            MS.Entertainment.UI.Shell.ImageLoader.getServiceImageUrl(newModel).done(function imageUrl(url) {
                                this.boxArtImageUri = url
                            }.bind(this));
                        else if (newModel.imageUri) {
                            this.backgroundImageUri = newModel.imageUri;
                            this.boxArtImageUri = newModel.imageUri
                        }
                }
        }, {
            mediaItem: null, backgroundImageUri: null, boxArtImageUri: null, featuredInfoVisible: true, nowPlayingVisible: false, nowPlayingInset: false, overviewVisible: false, sessionId: null, playFeaturedClick: function playFeaturedClick(){}
        }, {})})
})()
