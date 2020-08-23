/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/imageloader.js", "/Framework/observablearray.js", "/Framework/serviceLocator.js", "/Framework/utilities.js");
(function(undefined) {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {MusicHubMusicPanel: MS.Entertainment.UI.Framework.define(function musicHubMusicPanelConstructor() {
            var query = new MS.Entertainment.Data.Query.MusicMediaDiscoverySpotlightQuery;
            query.queryId = MS.Entertainment.UI.Monikers.musicMarketplacePanel;
            var queryOverride = new MS.Entertainment.Data.Query.MusicHubsOverride;
            queryOverride.queryId = MS.Entertainment.UI.Monikers.musicMarketplacePanel;
            this.viewModel = new MS.Entertainment.ViewModels.FeaturedViewModel(query, queryOverride, this.overrideContentFilter);
            this.viewModel.maxItems = 9;
            var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
            var browseAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.navigate);
            browseAction.title = String.load(String.id.IDS_MUSIC_MARKETPLACE_DASHBOARD_TITLE);
            browseAction.parameter = {
                page: "musicMarketplace", hub: "musicMarketplaceFeatured"
            };
            browseAction.disableWhenOffline = true;
            browseAction.disableOnServicesDisabled = true;
            if (MS.Entertainment.Utilities.isMusicApp1)
                this.panelAction = {action: browseAction};
            else
                this.viewModel.panelAction = browseAction;
            this.viewModel.getItems()
        }, {
            viewModel: null, panelAction: null, doNotRaisePanelReady: true, overrideContentFilter: "music"
        })});
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {MusicHubTopAlbumsPanel: MS.Entertainment.UI.Framework.define(function musicHubTopAlbumsPanelConstructor() {
            this._refreshItemCount = this._refreshItemCount.bind(this);
            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).addEventListener("windowresize", this._refreshItemCount);
            var query = new MS.Entertainment.Data.Query.Music.TopAlbums;
            query.chunkSize = 10;
            query.chunked = false;
            query.queryId = MS.Entertainment.UI.Monikers.musicTopAlbumsPanel;
            this.viewModel = new MS.Entertainment.ViewModels.TopAlbumsViewModel(query);
            this.viewModel.maxItems = 2 * MS.Entertainment.Utilities.HIGH_RESOLUTION_ROWS;
            this._refreshItemCount();
            this.viewModel.getItems();
            var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
            var browseAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.navigate);
            browseAction.title = String.load(String.id.IDS_MUSIC_MOST_POPULAR_PANEL_HEADER);
            browseAction.parameter = {
                page: MS.Entertainment.UI.Monikers.musicTopMusic, hub: MS.Entertainment.UI.Monikers.musicPopularGallery
            };
            browseAction.disableWhenOffline = true;
            browseAction.disableOnServicesDisabled = true;
            this.panelAction = {action: browseAction}
        }, {
            viewModel: null, panelAction: null, doNotRaisePanelReady: true, _refreshItemCount: function _refreshItemCount() {
                    this.viewModel.numItemsToShow = 2 * MS.Entertainment.Utilities.getRowCountForResolution()
                }, dispose: function dispose() {
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).removeEventListener("windowresize", this._refreshItemCount)
                }, thaw: function thaw() {
                    if (this.viewModel && this.viewModel.thaw)
                        this.viewModel.thaw()
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {MusicHubTopArtistPanel: MS.Entertainment.UI.Framework.define(function musicHubTopArtistPanelConstructor() {
            this._refreshItemCount = this._refreshItemCount.bind(this);
            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).addEventListener("windowresize", this._refreshItemCount);
            var query = new MS.Entertainment.Data.Query.Music.TopArtists;
            query.chunkSize = 10;
            query.chunked = false;
            query.queryId = MS.Entertainment.UI.Monikers.musicTopArtistsPanel;
            this.viewModel = new MS.Entertainment.ViewModels.TopArtistViewModel(query);
            this.viewModel.maxItems = MS.Entertainment.Utilities.HIGH_RESOLUTION_ROWS;
            this._refreshItemCount();
            this.viewModel.getItems()
        }, {
            viewModel: null, panelAction: null, doNotRaisePanelReady: true, _refreshItemCount: function _refreshItemCount() {
                    this.viewModel.numItemsToShow = MS.Entertainment.Utilities.getRowCountForResolution()
                }, dispose: function dispose() {
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).removeEventListener("windowresize", this._refreshItemCount)
                }, thaw: function thaw() {
                    if (this.viewModel && this.viewModel.thaw)
                        this.viewModel.thaw()
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {MusicHubTopMusicPanel: MS.Entertainment.defineOptionalObservable(function musicHubTopArtistPanelConstructor() {
            this._albumsViewModel = new MS.Entertainment.ViewModels.MusicHubTopAlbumsPanel;
            this._artistsViewModel = new MS.Entertainment.ViewModels.MusicHubTopArtistPanel;
            this._albumBindings = WinJS.Binding.bind(this._albumsViewModel.viewModel, {bindableItems: this._updateItems.bind(this)});
            this._artistBindings = WinJS.Binding.bind(this._artistsViewModel.viewModel, {bindableItems: this._updateItems.bind(this)});
            this._bindingsInitialized = true
        }, {
            _bindingsInitialized: false, _albumsViewModel: null, _albumBindings: null, _artistsViewModel: null, _artistBindings: null, panelAction: null, _updateItems: function _updateItems() {
                    if (!this._bindingsInitialized)
                        return;
                    this.topItems = {
                        albums: this._albumsViewModel.viewModel, artists: this._artistsViewModel.viewModel, panelAction: this._albumsViewModel.panelAction && this._albumsViewModel.panelAction.action
                    }
                }, dispose: function dispose() {
                    if (this._albumBindings) {
                        this._albumBindings.cancel();
                        this._albumBindings = null
                    }
                    if (this._artistBindings) {
                        this._artistBindings.cancel();
                        this._artistBindings = null
                    }
                }, thaw: function thaw() {
                    if (this._albumsViewModel && this._albumsViewModel.thaw)
                        this._albumsViewModel.thaw();
                    if (this._artistsViewModel && this._artistsViewModel.thaw)
                        this._artistsViewModel.thaw()
                }
        }, {topItems: null})});
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {MusicHubNewReleasesPanel: MS.Entertainment.UI.Framework.define(function musicHubNewReleasesPanelConstructor() {
            var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
            var musicMarketplaceEditorialEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplaceEditorial);
            var query;
            if (musicMarketplaceEditorialEnabled)
                query = new MS.Entertainment.Data.Query.Music.BrowseFeaturedAlbums;
            else
                query = new MS.Entertainment.Data.Query.Music.NewAlbums;
            query.queryId = MS.Entertainment.UI.Monikers.musicNewReleasesPanel;
            query.chunked = false;
            query.chunkSize = 10;
            this.viewModel = new MS.Entertainment.ViewModels.NewReleasesViewModel(query);
            this.viewModel.maxItems = 3 * MS.Entertainment.Utilities.getRowCountForResolution();
            this.viewModel.getItems();
            var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
            var browseAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.navigate);
            browseAction.title = String.load(String.id.IDS_BROWSE_ACTION_TITLE);
            browseAction.parameter = {
                page: MS.Entertainment.UI.Monikers.musicNewReleases, hub: MS.Entertainment.UI.Monikers.musicNewReleasesGallery
            };
            browseAction.disableWhenOffline = true;
            browseAction.disableOnServicesDisabled = true;
            this.panelAction = {action: browseAction}
        }, {
            viewModel: null, panelAction: null, doNotRaisePanelReady: true, thaw: function thaw() {
                    if (this.viewModel && this.viewModel.thaw)
                        this.viewModel.thaw()
                }
        })})
})()
