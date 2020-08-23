/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.Pages", {SnappedMovieDetailsOverview: MS.Entertainment.UI.Framework.defineUserControl("Components/ImmersiveDetails/SnappedMovieDetails.html#movieDetailsOverviewTemplate", function movieDetailsOverviewConstructor() {
            this._bindingsToDetach = [];
            this.smartBuyStateEngine = new MS.Entertainment.ViewModels.VideoSmartBuyStateEngine
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
                    this.bind("showPlayFeatured", this._updatePlayTrailerVisible.bind(this));
                    this.bind("featuredInfoVisible", this._updatePlayTrailerVisible.bind(this));
                    if (this.mediaItem.videoType === Microsoft.Entertainment.Queries.VideoType.movie || this.mediaItem.videoType === Microsoft.Entertainment.Queries.VideoType.tvEpisode)
                        this.smartBuyStateEngine.initialize(this.mediaItem, MS.Entertainment.ViewModels.SmartBuyButtons.getVideoDetailsButtons(this.mediaItem, MS.Entertainment.UI.Actions.ExecutionLocation.canvas), MS.Entertainment.ViewModels.VideoSmartBuyStateEngine.prototype.onVideoDetailsTwoButtonStateChanged);
                    MS.Entertainment.UI.Controls.Panel.raisePanelReady(this.domElement)
                }, _updatePlayTrailerVisible: function _updatePlayTrailerVisible() {
                    this.playTrailerVisible = this.showPlayFeatured && this.featuredInfoVisible
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
                    if (this.smartBuyStateEngine)
                        this.smartBuyStateEngine.unload();
                    this._detachBindings();
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, _modelChanged: function _modelChanged() {
                    if (this.mediaItem) {
                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        this.showPlayFeatured = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.movieTrailersMarketplace) && this.mediaItem.hasZuneId && MS.Entertainment.ViewModels.SmartBuyStateHandlers._mediaHasAnyRight(this.mediaItem, MS.Entertainment.Utilities.defaultClientTypeFromApp, [MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.Preview, MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.PreviewStream]);
                        if (this.mediaItem.serviceId && !MS.Entertainment.Utilities.isEmptyGuid(this.mediaItem.serviceId))
                            MS.Entertainment.UI.Shell.ImageLoader.getServiceImageUrl(this.mediaItem).done(function imageUrl(url) {
                                this.boxArtImageUri = url
                            }.bind(this));
                        else if (this.mediaItem.imageUri) {
                            this.backgroundImageUri = this.mediaItem.imageUri;
                            this.boxArtImageUri = this.mediaItem.imageUri
                        }
                    }
                    else {
                        this.showPlayFeatured = false;
                        this.backgroundImageUri = null;
                        this.boxArtImageUri = null
                    }
                }
        }, {
            mediaItem: null, smartBuyStateEngine: null, backgroundImageUri: null, boxArtImageUri: null, onPlayClicked: null, playTrailerVisible: false, featuredInfoVisible: true, nowPlayingVisible: false, nowPlayingInset: false, overviewVisible: false, showPlayFeatured: true, sessionId: null, hidePlayTrailer: false, playTrailerClick: function playTrailerClick() {
                    MS.Entertainment.Utilities.Telemetry.logPlayPreview(this.mediaItem, false);
                    if (this.onPlayClicked) {
                        MS.Entertainment.UI.Controls.assert(this.mediaItem, "playTrailerClick.  this.mediaItem is not valid");
                        if (this.mediaItem) {
                            this.mediaItem.playPreviewOnly = true;
                            this.onPlayClicked()
                        }
                    }
                }
        })})
})()
