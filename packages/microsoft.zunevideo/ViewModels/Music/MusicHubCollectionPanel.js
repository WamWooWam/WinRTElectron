/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function(undefined) {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {MusicHubCollectionPanel: MS.Entertainment.UI.Framework.define(function musicHubCollectionPanelConstructor() {
            var uiState = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
            var maxItemsPerRow = MS.Entertainment.Utilities.HIGH_RESOLUTION_ROWS;
            var maxItems = maxItemsPerRow * 3;
            var albumQuery = new MS.Entertainment.Data.Query.libraryAlbums;
            albumQuery.queryId = MS.Entertainment.UI.Monikers.musicCollection;
            albumQuery.sort = Microsoft.Entertainment.Queries.AlbumsSortBy.recentlyPlayedDescending;
            albumQuery.isLive = true;
            albumQuery.chunkSize = maxItems;
            var playlistQuery = new MS.Entertainment.Data.Query.libraryPlaylists;
            playlistQuery.queryId = MS.Entertainment.UI.Monikers.musicCollection;
            playlistQuery.sort = Microsoft.Entertainment.Queries.PlaylistsSortBy.recentlyPlayedDescending;
            playlistQuery.isLive = true;
            playlistQuery.chunkSize = maxItems;
            var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
            var musicSmartDJEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.smartDJMarketplace);
            var freeStreamEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicFreePlay);
            var subscriptionEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicSubscription);
            var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
            if (musicSmartDJEnabled && (subscriptionEnabled || freeStreamEnabled) && configurationManager.service.lastSignedInUserXuid) {
                var smartDJQuery = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.smartDJList);
                smartDJQuery.queryId = MS.Entertainment.UI.Monikers.musicCollection;
                this.musicQuery = [albumQuery, playlistQuery, smartDJQuery]
            }
            else
                this.musicQuery = [albumQuery, playlistQuery];
            var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
            var browseAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.musicCollectionNavigate);
            if (MS.Entertainment.Utilities.isMusicApp2) {
                browseAction.title = String.load(String.id.IDS_MY_MUSIC_BUTTON_DESC);
                browseAction.mediaType = "actionButton";
                browseAction.icon = MS.Entertainment.UI.Icon.flexhub;
                this.panelAction = browseAction
            }
            else
                browseAction.title = String.load(String.id.IDS_MUSIC_COLLECTION_PIVOT);
            this.panelAction = {action: browseAction};
            this._uiStateBindings = WinJS.Binding.bind(uiState, {networkStatus: this._onNetworkStatusChanged.bind(this)});
            this.emptyLibraryModel = new MS.Entertainment.UI.Controls.DefaultFailedPanelModel;
            this.emptyLibraryModel.primaryStringId = String.id.IDS_COLLECTION_MUSIC_EMPTY;
            this.emptyLibraryModel.details = this._getEmptyCollectionDetails()
        }, {
            musicQuery: null, panelAction: null, emptyLibraryModel: null, doNotRaisePanelReady: true, dispose: function dispose() {
                    if (this._uiStateBindings) {
                        this._uiStateBindings.cancel();
                        this._uiStateBindings = null
                    }
                }, _onNetworkStatusChanged: function _onNetworkStatusChanged() {
                    if (this._uiStateBindings && this.emptyLibraryModel)
                        this.emptyLibraryModel.details = this._getEmptyCollectionDetails()
                }, _getEmptyCollectionDetails: function _getEmptyCollectionDetails() {
                    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                    var onMoreAboutLibrariesAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.showLocalGrovelInfoDialog);
                    var details = [];
                    if (MS.Entertainment.Utilities.isMusicApp1)
                        details = [{
                                stringId: String.id.IDS_COLLECTION_MUSIC_EMPTY_2, linkStringId: String.id.IDS_COLLECTION_MUSIC_MORE_LIBRARIES_LINK, linkAction: onMoreAboutLibrariesAction, linkIcon: MS.Entertainment.UI.Icon.search
                            }];
                    var isMusicMarketplaceNetworkEnabled = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.networkStatus).isEnabled(MS.Entertainment.UI.NetworkStatusService.NetworkedFeature.musicMarketplace);
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    if (isMusicMarketplaceNetworkEnabled && featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace)) {
                        var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                        var navigateToMusicMarketplace = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.navigate);
                        navigateToMusicMarketplace.disableWhenOffline = true;
                        navigateToMusicMarketplace.disableOnServicesDisabled = true;
                        navigateToMusicMarketplace.parameter = MS.Entertainment.UI.Monikers.musicMarketplace;
                        details.push({
                            stringId: String.id.IDS_MUSIC_COLLECTION_EMPTY_DESC, linkStringId: String.id.IDS_COLLECTION_MUSIC_EMPTY_LINK, linkAction: navigateToMusicMarketplace, linkIcon: MS.Entertainment.UI.Icon.flexhub
                        })
                    }
                    return details
                }, libraryClicked: WinJS.Utilities.markSupportedForProcessing(function libraryClicked(item) {
                    var mediaItem = item.target;
                    if (mediaItem.smartDJ) {
                        var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                        var playSmartDJAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.playSmartDJ);
                        playSmartDJAction.automationId = MS.Entertainment.UI.AutomationIds.libraryPlaySmartDJ;
                        playSmartDJAction.parameter = {
                            mediaItem: mediaItem.artist, showAppBar: true
                        };
                        playSmartDJAction.execute()
                    }
                    else {
                        var popOverConstructor = null;
                        var collectionPanelData = {location: MS.Entertainment.Data.ItemLocation.collection};
                        if (mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.album)
                            popOverConstructor = "MS.Entertainment.Pages.MusicAlbumInlineDetails";
                        else
                            popOverConstructor = item.panelConstructor;
                        var popOverParameters = {itemConstructor: popOverConstructor};
                        popOverParameters.dataContext = {
                            data: mediaItem, location: MS.Entertainment.Data.ItemLocation.collection
                        };
                        popOverParameters.dataContext.data = mediaItem;
                        if (mediaItem.itemQuery)
                            if (Array.isArray(mediaItem.itemQuery))
                                mediaItem.itemQuery.forEach(function pauseQuery(query) {
                                    if (query.pause)
                                        query.pause()
                                });
                            else if (mediaItem.itemQuery.pause)
                                mediaItem.itemQuery.pause();
                        MS.Entertainment.UI.Controls.PopOver.showPopOver(popOverParameters).done(function unPauseQuery() {
                            if (mediaItem.itemQuery)
                                if (Array.isArray(mediaItem.itemQuery))
                                    mediaItem.itemQuery.forEach(function unPauseQuery(query) {
                                        if (query.unpause)
                                            query.unpause()
                                    });
                                else if (mediaItem.itemQuery.unpause)
                                    mediaItem.itemQuery.unpause()
                        })
                    }
                })
        })})
})()
