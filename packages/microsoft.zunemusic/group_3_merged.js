/* Copyright (C) Microsoft Corporation. All rights reserved. */
/* >>>>>>/components/music1/musiclxstatehandlers.js:2 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var ViewModels;
        (function(ViewModels) {
            var ArtistDetailsActionLocations = (function() {
                    function ArtistDetailsActionLocations(){}
                    ArtistDetailsActionLocations.primaryHeader = "primaryHeader";
                    ArtistDetailsActionLocations.localAlbums = "myAlbums";
                    ArtistDetailsActionLocations.topSongs = "topSongs";
                    return ArtistDetailsActionLocations
                })();
            ViewModels.ArtistDetailsActionLocations = ArtistDetailsActionLocations;
            var MusicLXStateHandlers = (function() {
                    function MusicLXStateHandlers(){}
                    MusicLXStateHandlers._getPinTile = function(appState, mediaItem) {
                        var pinTilePromise = null;
                        if (appState && appState.canPinToStartScreen) {
                            var pinToStartScreenService = Entertainment.ServiceLocator.getService(Entertainment.Services.pinToStartScreen);
                            pinTilePromise = pinToStartScreenService.getTileForMediaAsync(mediaItem)
                        }
                        return WinJS.Promise.as(pinTilePromise)
                    };
                    MusicLXStateHandlers._pushPinButton = function(existingPin, appState, buttons, engineButtons) {
                        if (appState && appState.canPinToStartScreen && buttons && engineButtons)
                            if (!existingPin)
                                buttons.push(engineButtons.pinToStartScreen);
                            else
                                buttons.push(engineButtons.unpinFromStartScreen)
                    };
                    MusicLXStateHandlers.createButtonListOverflow = function(engine, buttons, maxButtonListLength) {
                        if (buttons && buttons.smartButtons && buttons.smartButtons.length >= maxButtonListLength) {
                            engine.buttons.more.setSubActions(buttons.smartButtons.slice(maxButtonListLength - 1).map(function(item) {
                                return {action: item}
                            }));
                            buttons.smartButtons = buttons.smartButtons.slice(0, maxButtonListLength - 1).concat(engine.buttons.more)
                        }
                        return buttons
                    };
                    MusicLXStateHandlers.onPlaylistDetailsStateChanged = function(engine, stateInfo) {
                        var buttons = [];
                        var addToSubActions = [];
                        var appState = ViewModels._MusicState.getCurrentState(engine.media, stateInfo);
                        var pinTilePromise = MusicLXStateHandlers._getPinTile(appState, engine.media);
                        return pinTilePromise.then(function(existingTile) {
                                if ((stateInfo.collection.canPlayLocally || (appState.isOnline && stateInfo.collection.canPlayLocallyOrStreamFromCloud)) && engine.media.count > 0) {
                                    engine.buttons.genericPlay.wrap(engine.buttons.play);
                                    buttons.push(engine.buttons.genericPlay);
                                    if (appState.canAddToNowPlaying)
                                        addToSubActions.push(Entertainment.UI.Actions.AddTo.subMenuIds.addToNowPlaying);
                                    addToSubActions.push(Entertainment.UI.Actions.AddTo.subMenuIds.addToPlaylist)
                                }
                                else {
                                    engine.buttons.genericPlay.wrap(engine.buttons.playDisabled);
                                    buttons.push(engine.buttons.genericPlay)
                                }
                                if (addToSubActions.length > 0) {
                                    engine.buttons.addTo.setSubActions(addToSubActions);
                                    buttons.push(engine.buttons.addTo)
                                }
                                buttons.push(engine.buttons.renamePlaylist);
                                MusicLXStateHandlers._pushPinButton(existingTile, appState, buttons, engine.buttons);
                                buttons.push(engine.buttons.deleteMedia);
                                buttons = buttons.concat(ViewModels.MusicStateHelpers._getDownloadButtons(appState, engine.buttons, stateInfo, engine.media));
                                var requestButtons = MusicLXStateHandlers.createButtonListOverflow(engine, {
                                        smartButtons: buttons, appbarActions: []
                                    }, ViewModels.PlaylistDetailsViewModelBase.HEADER_BUTTON_LIST_LENGTH);
                                return WinJS.Promise.as(requestButtons)
                            })
                    };
                    MusicLXStateHandlers._getButtonsForAlbumDownloading = function(appState, stateInfo, isfromCollection, hasAddToMyMusicRights, albumButtons, media) {
                        MS.Entertainment.UI.assert(appState, "appState is required!");
                        MS.Entertainment.UI.assert(stateInfo, "stateInfo is required!");
                        MS.Entertainment.UI.assert(albumButtons, "albumButtons is required!");
                        var buttons = [];
                        var pinTilePromise = MusicLXStateHandlers._getPinTile(appState, media);
                        return pinTilePromise.then(function(existingTile) {
                                if (isfromCollection || hasAddToMyMusicRights)
                                    if (stateInfo.canPlay)
                                        albumButtons.genericPlay.wrap(albumButtons.play);
                                    else
                                        albumButtons.genericPlay.wrap(albumButtons.playDisabled);
                                else if (appState.isDTOMarket)
                                    albumButtons.genericPlay.wrap(albumButtons.playDisabled);
                                else
                                    albumButtons.genericPlay.wrap(albumButtons.albumPlayPreview);
                                buttons.push(albumButtons.genericPlay);
                                albumButtons.addTo.setSubActions(ViewModels.MusicStateHandlers._getAddToSubActionsForAlbum(appState, stateInfo, hasAddToMyMusicRights));
                                buttons.push(albumButtons.addTo);
                                if (appState.showArtistDetailsButton)
                                    buttons.push(albumButtons.artistDetails);
                                if (appState.canPlaySmartDJ)
                                    buttons.push(albumButtons.playArtistSmartDJ);
                                MusicLXStateHandlers._pushPinButton(existingTile, appState, buttons, albumButtons);
                                return {
                                        smartButtons: buttons, appbarActions: []
                                    }
                            })
                    };
                    MusicLXStateHandlers._getButtonsForAlbumDownloadFailed = function(appState, stateInfo, isfromCollection, hasAddToMyMusicRights, albumButtons, media) {
                        MS.Entertainment.UI.assert(appState, "appState is required!");
                        MS.Entertainment.UI.assert(stateInfo, "stateInfo is required!");
                        MS.Entertainment.UI.assert(albumButtons, "albumButtons is required!");
                        var buttons = [];
                        var pinTilePromise = MusicLXStateHandlers._getPinTile(appState, media);
                        return pinTilePromise.then(function(existingTile) {
                                if (isfromCollection || hasAddToMyMusicRights) {
                                    if (stateInfo.canPlay) {
                                        albumButtons.genericPlay.wrap(albumButtons.play);
                                        buttons.push(albumButtons.genericPlay)
                                    }
                                }
                                else {
                                    albumButtons.genericPlay.wrap(albumButtons.albumPlayPreview);
                                    buttons.push(albumButtons.genericPlay)
                                }
                                albumButtons.addTo.setSubActions(ViewModels.MusicStateHandlers._getAddToSubActionsForAlbum(appState, stateInfo, hasAddToMyMusicRights));
                                buttons.push(albumButtons.addTo);
                                if (stateInfo.download.hasRetryable)
                                    buttons.push(albumButtons.tryAgain);
                                else
                                    buttons.push(albumButtons.remove);
                                if (appState.showArtistDetailsButton)
                                    buttons.push(albumButtons.artistDetails);
                                if (appState.canPlaySmartDJ) {
                                    albumButtons.genericPlay.wrap(albumButtons.playArtistSmartDJ);
                                    buttons.push(albumButtons.genericPlay)
                                }
                                MusicLXStateHandlers._pushPinButton(existingTile, appState, buttons, albumButtons);
                                if (appState.canDelete)
                                    buttons.push(albumButtons.deleteMedia);
                                return {
                                        smartButtons: buttons, appbarActions: []
                                    }
                            })
                    };
                    MusicLXStateHandlers._getButtonsForAlbumDownloadPending = function(appState, stateInfo, isfromCollection, hasAddToMyMusicRights, albumButtons, media) {
                        MS.Entertainment.UI.assert(appState, "appState is required!");
                        MS.Entertainment.UI.assert(stateInfo, "stateInfo is required!");
                        MS.Entertainment.UI.assert(albumButtons, "albumButtons is required!");
                        var buttons = [];
                        var pinTilePromise = MusicLXStateHandlers._getPinTile(appState, media);
                        return pinTilePromise.then(function(existingTile) {
                                if (isfromCollection || hasAddToMyMusicRights) {
                                    if (stateInfo.canPlay) {
                                        albumButtons.genericPlay.wrap(albumButtons.play);
                                        buttons.push(albumButtons.genericPlay)
                                    }
                                }
                                else {
                                    albumButtons.genericPlay.wrap(albumButtons.albumPlayPreview);
                                    buttons.push(albumButtons.genericPlay)
                                }
                                albumButtons.addTo.setSubActions(ViewModels.MusicStateHandlers._getAddToSubActionsForAlbum(appState, stateInfo, hasAddToMyMusicRights));
                                buttons.push(albumButtons.addTo);
                                buttons.push(albumButtons.download);
                                if (appState.showArtistDetailsButton)
                                    buttons.push(albumButtons.artistDetails);
                                if (appState.canPlaySmartDJ)
                                    buttons.push(albumButtons.playArtistSmartDJ);
                                MusicLXStateHandlers._pushPinButton(existingTile, appState, buttons, albumButtons);
                                return {
                                        smartButtons: buttons, appbarActions: []
                                    }
                            })
                    };
                    MusicLXStateHandlers._getButtonsForMarketplaceAlbum = function(appState, stateInfo, albumButtons, rights, media) {
                        var buttons = [];
                        var addToSubActions = [];
                        var allowSubscriptionActions = appState.musicSubscriptionEnabled && appState.signedInUserHasSubscription;
                        var allowFreeStreamActions = appState.canFreeStream;
                        var allowSubscriptionOrFreeStreamActions = (allowSubscriptionActions || allowFreeStreamActions);
                        var hasSubscriptionDownloadRights = allowSubscriptionActions && rights.subscriptionDownload;
                        var hasSubscriptionStreamingRights = allowSubscriptionActions && rights.subscriptionStream;
                        var hasFreeStreamingRights = allowFreeStreamActions && rights.freeStream;
                        var hasAddToMyMusicRights = hasSubscriptionStreamingRights || hasFreeStreamingRights || hasSubscriptionDownloadRights;
                        var showMusicPassOptions = allowSubscriptionActions && (hasSubscriptionStreamingRights || hasSubscriptionDownloadRights);
                        var showFreeStreamOptions = allowFreeStreamActions && hasFreeStreamingRights;
                        var isContentBlocked = appState.isExplicitBlocked && rights.allTracksExplicit;
                        var canCollectionPlayLocally = stateInfo && stateInfo.collection && stateInfo.collection.canPlayLocally;
                        var canCollectionPlayFromCloud = stateInfo && stateInfo.collection && stateInfo.collection.canStreamFromCloud;
                        var pinTilePromise = MusicLXStateHandlers._getPinTile(appState, media);
                        return pinTilePromise.then(function(existingTile) {
                                if (showMusicPassOptions) {
                                    if ((rights.subscriptionStream && appState.isOnline && !isContentBlocked) || (media.inCollection && canCollectionPlayLocally) || (media.inCollection && canCollectionPlayFromCloud && appState.isOnline)) {
                                        albumButtons.genericPlay.wrap(albumButtons.play);
                                        buttons.push(albumButtons.genericPlay)
                                    }
                                    else
                                        buttons.push(albumButtons.playDisabled);
                                    if (appState.canAddToMyMusic && hasAddToMyMusicRights)
                                        addToSubActions.push(Entertainment.UI.Actions.AddTo.subMenuIds.addToMyMusic);
                                    if (appState.canAddToPlaylist && appState.isSignedIn)
                                        addToSubActions.push(Entertainment.UI.Actions.AddTo.subMenuIds.addToPlaylist);
                                    if (appState.canAddToNowPlaying)
                                        addToSubActions.push(Entertainment.UI.Actions.AddTo.subMenuIds.addToNowPlaying)
                                }
                                else if (showFreeStreamOptions) {
                                    if (appState.isOnline && !isContentBlocked) {
                                        albumButtons.genericPlay.wrap(albumButtons.play);
                                        buttons.push(albumButtons.genericPlay)
                                    }
                                    else
                                        buttons.push(albumButtons.playDisabled);
                                    if (appState.canAddToMyMusic && hasAddToMyMusicRights)
                                        addToSubActions.push(Entertainment.UI.Actions.AddTo.subMenuIds.addToMyMusic);
                                    if (appState.canAddToPlaylist && appState.isSignedIn)
                                        addToSubActions.push(Entertainment.UI.Actions.AddTo.subMenuIds.addToPlaylist);
                                    if (appState.canAddToNowPlaying && appState.isSignedIn)
                                        addToSubActions.push(Entertainment.UI.Actions.AddTo.subMenuIds.addToNowPlaying)
                                }
                                else {
                                    if (stateInfo.collection.canPlayLocallyOrStreamFromCloud || (stateInfo.marketplace.canStream && appState.isOnline && !isContentBlocked)) {
                                        albumButtons.genericPlay.wrap(albumButtons.play);
                                        buttons.push(albumButtons.genericPlay)
                                    }
                                    else if (!appState.isOnline || isContentBlocked)
                                        buttons.push(albumButtons.playDisabled);
                                    else if (rights.preview) {
                                        albumButtons.genericPlay.wrap(albumButtons.albumPlayPreview);
                                        buttons.push(albumButtons.genericPlay)
                                    }
                                    if (stateInfo.marketplace.hasPurchased && appState.cloudServiceEnabled)
                                        addToSubActions.push(Entertainment.UI.Actions.AddTo.subMenuIds.addToMyMusic)
                                }
                                if (addToSubActions.length > 0 && !isContentBlocked) {
                                    albumButtons.addTo.setSubActions(addToSubActions);
                                    buttons.push(albumButtons.addTo)
                                }
                                if (appState.showArtistDetailsButton)
                                    buttons.push(albumButtons.artistDetails);
                                if (appState.canDownloadPurchasedMedia && !isContentBlocked)
                                    buttons.push(albumButtons.download);
                                else if (showMusicPassOptions && rights.subscriptionDownload && !appState.downloadOnAddToMyMusicCloud)
                                    buttons.push(albumButtons.subscriptionDownload);
                                if (appState.canPlaySmartDJ)
                                    buttons.push(albumButtons.playArtistSmartDJ);
                                if (!buttons.length)
                                    buttons.push(albumButtons.contentNotAvailable);
                                if (!isContentBlocked)
                                    MusicLXStateHandlers._pushPinButton(existingTile, appState, buttons, albumButtons);
                                return WinJS.Promise.as({
                                        smartButtons: buttons, appbarActions: []
                                    })
                            })
                    };
                    MusicLXStateHandlers._getAlbumDetailsButtons = function(engine, stateInfo) {
                        MS.Entertainment.UI.assert(engine.media, "engine.media should be defined!");
                        var appState = ViewModels._MusicState.getCurrentState(engine.media, stateInfo);
                        var showCollectionDetails = ViewModels.MusicStateHandlers.shouldShowCollectionDetails(engine.media, stateInfo);
                        var buttons = [];
                        var addToSubActions = [];
                        var pinTilePromise = MusicLXStateHandlers._getPinTile(appState, engine.media);
                        return pinTilePromise.then(function(existingTile) {
                                if (stateInfo.download.hasActive)
                                    return ViewModels.MusicStateHandlers._getAddToMyMusicRights(appState, engine.media).then(function(hasAddToMyMusicRights) {
                                            return MusicLXStateHandlers._getButtonsForAlbumDownloading(appState, stateInfo, engine.media && engine.media.fromCollection, hasAddToMyMusicRights, engine.buttons, engine.media)
                                        });
                                else if (showCollectionDetails && (stateInfo.collection.canPlayLocallyOrStreamFromCloud || appState.isFreeLimitsExceeded)) {
                                    if (stateInfo.collection.canPlayLocally || (appState.isOnline && stateInfo.collection.canPlayLocallyOrStreamFromCloud))
                                        engine.buttons.genericPlay.wrap(engine.buttons.play);
                                    else
                                        engine.buttons.genericPlay.wrap(engine.buttons.playDisabled);
                                    buttons.push(engine.buttons.genericPlay);
                                    if (appState.canAddToCloud)
                                        addToSubActions.push(Entertainment.UI.Actions.AddTo.subMenuIds.addToCloud);
                                    if (appState.canAddToNowPlaying)
                                        addToSubActions.push(Entertainment.UI.Actions.AddTo.subMenuIds.addToNowPlaying);
                                    addToSubActions.push(Entertainment.UI.Actions.AddTo.subMenuIds.addToPlaylist);
                                    engine.buttons.addTo.setSubActions(addToSubActions);
                                    buttons.push(engine.buttons.addTo);
                                    if (appState.showArtistDetailsButton)
                                        buttons.push(engine.buttons.artistDetails);
                                    if (appState.canPlaySmartDJ)
                                        buttons.push(engine.buttons.playArtistSmartDJ);
                                    MusicLXStateHandlers._pushPinButton(existingTile, appState, buttons, engine.buttons);
                                    if (appState.canDelete)
                                        buttons.push(engine.buttons.deleteMedia);
                                    if (appState.canEdit)
                                        buttons.push(engine.buttons.editMetadata);
                                    if (appState.canFindAlbumInfo)
                                        buttons.push(engine.buttons.findAlbumInfo);
                                    buttons = buttons.concat(ViewModels.MusicStateHelpers._getDownloadButtons(appState, engine.buttons, stateInfo, engine.media))
                                }
                                else if (stateInfo.download.hasFailed)
                                    return ViewModels.MusicStateHandlers._getAddToMyMusicRights(appState, engine.media).then(function(hasAddToMyMusicRights) {
                                            return MusicLXStateHandlers._getButtonsForAlbumDownloadFailed(appState, stateInfo, engine.media && engine.media.fromCollection, hasAddToMyMusicRights, engine.buttons, engine.media)
                                        });
                                else if (stateInfo.download.hasPending)
                                    return ViewModels.MusicStateHandlers._getAddToMyMusicRights(appState, engine.media).then(function(hasAddToMyMusicRights) {
                                            return MusicLXStateHandlers._getButtonsForAlbumDownloadPending(appState, stateInfo, engine.media && engine.media.fromCollection, hasAddToMyMusicRights, engine.buttons, engine.media)
                                        });
                                else if (engine.media.location === Entertainment.Data.ItemLocation.collection) {
                                    if (appState.showArtistDetailsButton)
                                        buttons.push(engine.buttons.artistDetails);
                                    if (appState.canPlaySmartDJ)
                                        buttons.push(engine.buttons.playArtistSmartDJ);
                                    MusicLXStateHandlers._pushPinButton(existingTile, appState, buttons, engine.buttons);
                                    if (appState.canDelete)
                                        buttons.push(engine.buttons.deleteMedia)
                                }
                                else {
                                    if (!engine.media.hydrated || !engine.media.tracks)
                                        return WinJS.Promise.as(null);
                                    return ViewModels.MusicSmartBuyStateHandlers.getAlbumRights(engine.media).then(function(rights) {
                                            return MusicLXStateHandlers._getButtonsForMarketplaceAlbum(appState, stateInfo, engine.buttons, rights, engine.media)
                                        })
                                }
                                return WinJS.Promise.as({
                                        smartButtons: buttons, appbarActions: []
                                    })
                            })
                    };
                    MusicLXStateHandlers.albumDetailsTestHandler = function(engine, stateInfo) {
                        return WinJS.Promise.as({
                                smartButtons: [engine.buttons.play, engine.buttons.addTo, engine.buttons.download, engine.buttons.tryAgain, engine.buttons.remove], appbarActions: []
                            }).then(function(buttons) {
                                return MusicLXStateHandlers.createButtonListOverflow(engine, buttons, ViewModels.AlbumDetailsViewModel.HEADER_BUTTON_LIST_LENGTH)
                            })
                    };
                    MusicLXStateHandlers.onAlbumDetailsStateChanged = function(engine, stateInfo) {
                        return MusicLXStateHandlers._getAlbumDetailsButtons(engine, stateInfo).then(function(buttons) {
                                return MusicLXStateHandlers.createButtonListOverflow(engine, buttons, ViewModels.AlbumDetailsViewModel.HEADER_BUTTON_LIST_LENGTH)
                            })
                    };
                    MusicLXStateHandlers.onArtistDetailsStateChanged = function(engine, stateInfo) {
                        var addLocalAlbumsToSubActions = [];
                        var locationSpecificButtons = {};
                        var topSongsAddToSubActions = [];
                        var detailsHeader = locationSpecificButtons[ArtistDetailsActionLocations.primaryHeader] = [];
                        var myAlbumsHeader = locationSpecificButtons[ArtistDetailsActionLocations.localAlbums] = [];
                        var topSongsHeader = locationSpecificButtons[ArtistDetailsActionLocations.topSongs] = [];
                        var appState = ViewModels._MusicState.getCurrentState(engine.media, stateInfo);
                        var pinTilePromise = MusicLXStateHandlers._getPinTile(appState, engine.media);
                        return pinTilePromise.then(function(existingTile) {
                                if (appState.canPlaySmartDJ)
                                    detailsHeader.push(engine.buttons.playArtistSmartDJ);
                                else if (appState.smartDJEnabled && appState.hasSmartDJ)
                                    detailsHeader.push(engine.buttons.playArtistSmartDJDisabled);
                                MusicLXStateHandlers._pushPinButton(existingTile, appState, detailsHeader, engine.buttons);
                                if (stateInfo.collection.canPlayLocallyOrStreamFromCloud && engine.buttons.playLocalAlbums && engine.buttons.addLocalAlbumsTo) {
                                    if (appState.isOnline || engine.media.localTracksCount > 0)
                                        myAlbumsHeader.push(engine.buttons.playLocalAlbums);
                                    else
                                        myAlbumsHeader.push(engine.buttons.playDisabled);
                                    if (appState.canAddToNowPlaying)
                                        addLocalAlbumsToSubActions.push(Entertainment.UI.Actions.AddTo.subMenuIds.addToNowPlaying);
                                    addLocalAlbumsToSubActions.push(Entertainment.UI.Actions.AddTo.subMenuIds.addToPlaylist);
                                    engine.buttons.addLocalAlbumsTo.setSubActions(addLocalAlbumsToSubActions);
                                    myAlbumsHeader.push(engine.buttons.addLocalAlbumsTo)
                                }
                                var canFreeStream = appState.canFreeStream;
                                var canSubscriptionStream = (appState.signedInUserHasSubscription && appState.musicSubscriptionEnabled);
                                if (canFreeStream || canSubscriptionStream)
                                    topSongsHeader.push(engine.buttons.playTopSongs);
                                else
                                    topSongsHeader.push(engine.buttons.previewTopSongs);
                                if (!appState.isDTOMarket && appState.canAddToNowPlaying)
                                    topSongsAddToSubActions.push(Entertainment.UI.Actions.AddTo.subMenuIds.addMarketplaceArtistToNowPlaying);
                                if (!appState.isDTOMarket && appState.canAddToPlaylist && appState.isSignedIn)
                                    topSongsAddToSubActions.push(Entertainment.UI.Actions.AddTo.subMenuIds.addToPlaylist);
                                if (topSongsAddToSubActions.length > 0) {
                                    engine.buttons.addTopSongsTo.setSubActions(topSongsAddToSubActions);
                                    topSongsHeader.push(engine.buttons.addTopSongsTo)
                                }
                                return WinJS.Promise.as({
                                        appbarActions: [], locationSpecificButtons: locationSpecificButtons
                                    })
                            })
                    };
                    return MusicLXStateHandlers
                })();
            ViewModels.MusicLXStateHandlers = MusicLXStateHandlers
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}));
MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.musicStateHandler, function() {
    var useAlbumDetailsDownloadTestHandler = (new Microsoft.Entertainment.Configuration.ConfigurationManager).music.useAlbumDetailsDownloadTestHandler;
    return {
            onAlbumDetailsStateChanged: useAlbumDetailsDownloadTestHandler ? MS.Entertainment.ViewModels.MusicLXStateHandlers.albumDetailsTestHandler : MS.Entertainment.ViewModels.MusicLXStateHandlers.onAlbumDetailsStateChanged, onPlaylistDetailsStateChanged: MS.Entertainment.ViewModels.MusicLXStateHandlers.onPlaylistDetailsStateChanged
        }
})
})();
/* >>>>>>/framework/searchaction.js:389 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */

(function(undefined) {
    "use strict";
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Actions");
    WinJS.Namespace.define("MS.Entertainment.UI.Actions", {SearchAutomationIds: {
            search: "search", searchByContext: "searchByContext", resetSearchFilter: "resetSearchFilter"
        }});
    WinJS.Namespace.define("MS.Entertainment.UI.Actions", {
        SearchByContextAction: MS.Entertainment.deferredDerive("MS.Entertainment.UI.Actions.Action", function searchByContextActionConstructor() {
            this.base()
        }, {
            automationId: MS.Entertainment.UI.Actions.SearchAutomationIds.searchByContext, executed: function executed(param) {
                    if (this.canExecute(param)) {
                        var moniker = param.moniker;
                        if (moniker !== MS.Entertainment.UI.Monikers.searchPage)
                            if (MS.Entertainment.Utilities.isMusicApp)
                                if (moniker === MS.Entertainment.UI.Monikers.musicCollection)
                                    MS.Entertainment.ViewModels.SearchViewModel.SearchCurrentFilter = MS.Entertainment.ViewModels.SearchFilter.localCollection;
                                else
                                    MS.Entertainment.ViewModels.SearchViewModel.SearchCurrentFilter = MS.Entertainment.ViewModels.SearchFilter.all;
                            else if (MS.Entertainment.Utilities.isVideoApp)
                                if (param.defaultModifierIndex)
                                    MS.Entertainment.ViewModels.SearchViewModel.SearchCurrentFilter = param.defaultModifierIndex;
                                else
                                    MS.Entertainment.ViewModels.SearchViewModel.SearchCurrentFilter = MS.Entertainment.ViewModels.SearchFilter.all
                    }
                }, canExecute: function canExecute(param) {
                    return param != null && param != undefined && param.moniker != null
                }
        }), SearchAction: MS.Entertainment.deferredDerive("MS.Entertainment.UI.Actions.Action", function searchAction() {
                this.base()
            }, {
                defaultModifierIndex: null, automationId: MS.Entertainment.UI.Actions.SearchAutomationIds.search, executed: function execute(param) {
                        if (MS.Entertainment.Utilities.isApp2 && MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isSnapped)
                            return;
                        param = param || {};
                        var defaultModifierIndex = this.defaultModifierIndex || param.defaultModifierIndex || 0;
                        MS.Entertainment.UI.Actions.SearchAction.lastDefaultModifierIndex = defaultModifierIndex;
                        if (param && param.queryText) {
                            MS.Entertainment.ViewModels.SearchContractViewModel.init();
                            MS.Entertainment.ViewModels.SearchContractViewModel.current.searchKeywordSubmitted({
                                queryText: param.queryText, defaultModifierIndex: defaultModifierIndex
                            })
                        }
                        else {
                            var commandingPopOver = MS.Entertainment.UI.Controls.CommandingPopOver;
                            var searchActionCommandingPopoverHidden = function() {
                                    var existingQuery = String.empty;
                                    if (this.startWithExistingQuery) {
                                        var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                                        if (navigationService.checkUserLocation(MS.Entertainment.UI.Monikers.searchPage))
                                            existingQuery = MS.Entertainment.ViewModels.SearchContractViewModel.current.lastSearchedTerm
                                    }
                                    if (!MS.Entertainment.ViewModels.SearchContractViewModel.showSearchPane(existingQuery))
                                        MS.Entertainment.UI.Controls.TextInputOverlay.getTextInput({
                                            submitText: String.load(String.id.IDS_GLOBAL_COMMAND_SEARCH), watermark: String.load(String.id.IDS_GLOBAL_COMMAND_SEARCH), initialText: existingQuery || null
                                        }).done(function(query) {
                                            MS.Entertainment.ViewModels.SearchContractViewModel.init();
                                            MS.Entertainment.ViewModels.SearchContractViewModel.current.searchKeywordSubmitted({
                                                queryText: query, defaultModifierIndex: defaultModifierIndex
                                            })
                                        }.bind(this), function searchCancelled(){})
                                }.bind(this);
                            if (commandingPopOver)
                                commandingPopOver.hideCurrentCommandingPopover().done(searchActionCommandingPopoverHidden);
                            else
                                searchActionCommandingPopoverHidden()
                        }
                    }, canExecute: function canExecute() {
                        return true
                    }, startWithExistingQuery: false
            }, {lastDefaultModifierIndex: 0})
    });
    WinJS.Namespace.define("MS.Entertainment.UI.Actions", {ResetSearchFilterAction: MS.Entertainment.deferredDerive("MS.Entertainment.UI.Actions.Action", function resetSearchFilterActionConstructor() {
            this.base()
        }, {
            automationId: MS.Entertainment.UI.Actions.SearchAutomationIds.resetSearchFilter, executed: function executed(param) {
                    if (this.canExecute(param)) {
                        var viewModel = param.viewModel;
                        MS.Entertainment.ViewModels.SearchViewModel.SearchCurrentFilter = MS.Entertainment.ViewModels.SearchFilter.all;
                        viewModel.modifierSelectionManager.selectedIndex = MS.Entertainment.ViewModels.SearchViewModel.SearchCurrentFilter
                    }
                }, canExecute: function canExecute(param) {
                    return param !== null && param !== undefined && param.viewModel !== null
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.UI.Actions", {ResetSearchHubAction: MS.Entertainment.deferredDerive("MS.Entertainment.UI.Actions.Action", function resetSearchFilterActionConstructor() {
            this.base()
        }, {
            automationId: MS.Entertainment.UI.Actions.SearchAutomationIds.resetSearchFilter, executed: function executed(param) {
                    if (this.canExecute(param)) {
                        var viewModel = param.viewModel;
                        if (viewModel)
                            viewModel.pivotSelectedIndexOverride = 0
                    }
                }, canExecute: function canExecute(param) {
                    return param && param.viewModel !== null
                }
        })});
    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.search, function() {
        return new MS.Entertainment.UI.Actions.SearchAction
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.searchByContext, function() {
        return new MS.Entertainment.UI.Actions.SearchByContextAction
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.resetSearchFilter, function() {
        return new MS.Entertainment.UI.Actions.ResetSearchFilterAction
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.resetSearchHub, function() {
        return new MS.Entertainment.UI.Actions.ResetSearchHubAction
    })
})()
})();
/* >>>>>>/framework/data/virtuallistchangehandler.js:506 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var Data;
        (function(Data) {
            var VirtualListChangeHandler = (function() {
                    function VirtualListChangeHandler(virtualList) {
                        this._virtualList = virtualList;
                        this._eventHandlers = MS.Entertainment.Utilities.addEventHandlers(this._virtualList, {
                            itemChanged: this.onChanged.bind(this), itemInserted: this.onInserted.bind(this), itemMoved: this.onMoved.bind(this), itemRemoved: this.onRemoved.bind(this)
                        })
                    }
                    VirtualListChangeHandler.prototype.dispose = function() {
                        if (this._eventHandlers) {
                            this._eventHandlers.cancel();
                            this._eventHandlers = null
                        }
                        this._virtualList = null
                    };
                    Object.defineProperty(VirtualListChangeHandler.prototype, "virtualList", {
                        get: function() {
                            return this._virtualList
                        }, enumerable: true, configurable: true
                    });
                    VirtualListChangeHandler.prototype.onChanged = function(result){};
                    VirtualListChangeHandler.prototype.onMoved = function(result){};
                    VirtualListChangeHandler.prototype.onInserted = function(result){};
                    VirtualListChangeHandler.prototype.onRemoved = function(result){};
                    return VirtualListChangeHandler
                })();
            Data.VirtualListChangeHandler = VirtualListChangeHandler
        })(Data = Entertainment.Data || (Entertainment.Data = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
/* >>>>>>/components/moreaction.js:545 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p];
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    };

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var UI;
        (function(UI) {
            var Actions;
            (function(Actions) {
                var MoreAction = (function(_super) {
                        __extends(MoreAction, _super);
                        function MoreAction() {
                            _super.call(this);
                            this.hasSubActions = true
                        }
                        MoreAction.prototype.executed = function(param, referenceElement) {
                            if (referenceElement)
                                MS.Entertainment.Utilities.Telemetry.logPageAction({domElement: referenceElement}, {
                                    uri: MS.Entertainment.Utilities.getCurrentUserLocation(), pageTypeId: MS.Entertainment.Utilities.Telemetry.PageTypeId.Dash
                                })
                        };
                        MoreAction.prototype.canExecute = function(param) {
                            return true
                        };
                        return MoreAction
                    })(MS.Entertainment.UI.Actions.Action);
                Actions.MoreAction = MoreAction
            })(Actions = UI.Actions || (UI.Actions = {}))
        })(UI = Entertainment.UI || (Entertainment.UI = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}));
(function() {
    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.more, function() {
        return new MS.Entertainment.UI.Actions.MoreAction
    })
})()
})();
/* >>>>>>/viewmodels/detailspageviewmodelbase.js:595 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p];
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    };

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var ViewModels;
        (function(ViewModels) {
            var DetailsPageViewModelBase = (function(_super) {
                    __extends(DetailsPageViewModelBase, _super);
                    function DetailsPageViewModelBase() {
                        _super.apply(this, arguments);
                        this._delayInitialized = false;
                        this._delayInitializeSmartBuyEngine = true;
                        this._mediaItemHydratePromise = null;
                        this._viewStateViewModel = null;
                        this._smartBuyStateEngineType = ViewModels.SmartBuyStateEngine;
                        this._smartBuyStateEngineInitialized = false
                    }
                    Object.defineProperty(DetailsPageViewModelBase.prototype, "mediaItem", {
                        get: function() {
                            return this._mediaItem
                        }, set: function(value) {
                                if (value !== this._mediaItem) {
                                    this.updateAndNotify("mediaItem", value);
                                    this._shareMediaItem()
                                }
                                this._refreshDetailString()
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(DetailsPageViewModelBase.prototype, "mediaItemDetails", {
                        get: function() {
                            return this._mediaItemDetails
                        }, set: function(value) {
                                this.updateAndNotify("mediaItemDetails", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(DetailsPageViewModelBase.prototype, "mediaItemPurchaseDetails", {
                        get: function() {
                            return this._mediaItemPurchaseDetails
                        }, set: function(value) {
                                this.updateAndNotify("mediaItemPurchaseDetails", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(DetailsPageViewModelBase.prototype, "collectionFilter", {
                        get: function() {
                            return this._collectionFilter
                        }, set: function(value) {
                                this._collectionFilter = value;
                                this._applyValueToModules("filterValue", value);
                                if (this._mediaContext)
                                    this._mediaContext.collectionFilter = value
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(DetailsPageViewModelBase.prototype, "inCollection", {
                        get: function() {
                            return this.mediaItem && (this.mediaItem.inCollection || this.mediaItem.hasLibraryId)
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(DetailsPageViewModelBase.prototype, "hasServiceId", {
                        get: function() {
                            return this.mediaItem && this.mediaItem.hasServiceId
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(DetailsPageViewModelBase.prototype, "smartBuyButtons", {
                        get: function() {
                            return this._smartBuyButtons
                        }, set: function(value) {
                                this.updateAndNotify("smartBuyButtons", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(DetailsPageViewModelBase.prototype, "filterDetails", {
                        get: function() {
                            return this._filterDetails
                        }, enumerable: true, configurable: true
                    });
                    DetailsPageViewModelBase.prototype.dispose = function() {
                        _super.prototype.dispose.call(this);
                        this._disposeSmartBuyStateEngine();
                        this._unshareMediaItem();
                        this._cancelMediaItemHydration()
                    };
                    DetailsPageViewModelBase.prototype.delayInitialize = function() {
                        _super.prototype.delayInitialize.call(this);
                        if (this._delayInitializeSmartBuyEngine)
                            this._initializeSmartBuyStateEngine(false);
                        this.modules.forEach(function(detailsModule) {
                            if (detailsModule.delayInitialize)
                                detailsModule.delayInitialize()
                        });
                        this._delayInitialized = true;
                        this._shareMediaItem()
                    };
                    DetailsPageViewModelBase.prototype.clearFilter = function() {
                        this.applyFilter(Microsoft.Entertainment.Platform.MediaAvailability.available)
                    };
                    DetailsPageViewModelBase.prototype.applyFilter = function(newFilter) {
                        this.collectionFilter = newFilter;
                        this._createSmartBuyStateEngine();
                        this._reloadFilteredModules();
                        this._updateFilterDetails();
                        this._reinitializeNotificationList()
                    };
                    DetailsPageViewModelBase.prototype._getContainingMediaContextOptions = function() {
                        return null
                    };
                    DetailsPageViewModelBase.prototype._getSmartBuyEngineAppBarHandlers = function() {
                        ViewModels.fail("_getSmartBuyEngineAppBarHandlers() should be overridden by the subclass.");
                        return null
                    };
                    DetailsPageViewModelBase.prototype._getSmartBuyEngineEventHandler = function() {
                        ViewModels.fail("_getSmartBuyEngineEventHandler() should be overridden by the subclass.");
                        return null
                    };
                    DetailsPageViewModelBase.prototype._getSmartBuyEngineButtons = function() {
                        ViewModels.fail("_getSmartBuyEngineButtons() should be overridden by the subclass.");
                        return null
                    };
                    DetailsPageViewModelBase.prototype._getSmartBuyEngineOptions = function() {
                        return {invokeHandlerAsStatic: true}
                    };
                    DetailsPageViewModelBase.prototype._refreshDetailString = function() {
                        ViewModels.fail("_refreshDetailString() should be overridden by the subclass.")
                    };
                    DetailsPageViewModelBase.prototype._refreshPurchaseDetailsString = function(stateInfo){};
                    DetailsPageViewModelBase.prototype._reloadFilteredModules = function() {
                        ViewModels.fail("_reloadFilteredModules() should be overridden by the subclass.")
                    };
                    DetailsPageViewModelBase.prototype._updateFilterDetails = function() {
                        ViewModels.fail("_updateFilterDetails() should be overridden by the subclass.")
                    };
                    DetailsPageViewModelBase.prototype._updateCatalogDetails = function(){};
                    DetailsPageViewModelBase.prototype._cancelMediaItemHydration = function() {
                        if (this._mediaItemHydratePromise) {
                            this._mediaItemHydratePromise.cancel();
                            this._mediaItemHydratePromise = null
                        }
                    };
                    DetailsPageViewModelBase.prototype._disposeSmartBuyStateEngine = function() {
                        if (this._mediaContext) {
                            this._mediaContext.clearContext();
                            this._mediaContext = null
                        }
                        if (this._smartBuyStateEngineBinding) {
                            this._smartBuyStateEngineBinding.cancel();
                            this._smartBuyStateEngineBinding = null
                        }
                        if (this._smartBuyStateEngine) {
                            this._smartBuyStateEngine.unload();
                            this._smartBuyStateEngine = null;
                            this._smartBuyStateEngineInitialized = false
                        }
                    };
                    DetailsPageViewModelBase.prototype._getGenericSmartBuyButtons = function() {
                        return null
                    };
                    DetailsPageViewModelBase.prototype._createSmartBuyStateEngine = function() {
                        var _this = this;
                        this._disposeSmartBuyStateEngine();
                        if (!this.mediaItem)
                            return;
                        var buttons = this._getGenericSmartBuyButtons();
                        this._smartBuyStateEngine = new this._smartBuyStateEngineType(buttons);
                        this._smartBuyStateEngineBinding = WinJS.Binding.bind(this._smartBuyStateEngine, {
                            currentAppbarActions: function() {
                                return _this._onAppbarActionsChanged()
                            }, currentButtons: function() {
                                    return _this._onButtonsChanged()
                                }
                        })
                    };
                    DetailsPageViewModelBase.prototype._checkCanInitializeSmartBuyStateEngine = function() {
                        return true
                    };
                    DetailsPageViewModelBase.prototype._applyPropertiesToHydratedMedia = function(){};
                    DetailsPageViewModelBase.prototype._initializeSmartBuyStateEngine = function(initializeImmediately) {
                        var _this = this;
                        if (!initializeImmediately && !this._mediaItemHydratePromise || !this._checkCanInitializeSmartBuyStateEngine())
                            return;
                        if (!Entertainment.ServiceLocator.isServiceRegistered(Entertainment.Services.appToolbar)) {
                            ViewModels.fail("DetailsPageViewModelBase::_initializeSmartBuyStateEngine. Appbar service not registered");
                            return
                        }
                        var hydratePromise = this._mediaItemHydratePromise;
                        if (initializeImmediately)
                            hydratePromise = WinJS.Promise.as();
                        hydratePromise.done(function(hydratedMediaItem) {
                            if (_this.disposed)
                                return;
                            _this.mediaItem = hydratedMediaItem;
                            _this._applyPropertiesToHydratedMedia();
                            var appBarService = Entertainment.ServiceLocator.getService(Entertainment.Services.appToolbar);
                            var mediaContext = appBarService.pushMediaContext(_this.mediaItem, _this._getSmartBuyEngineAppBarHandlers(), _this._smartBuyStateEngine.currentAppbarActions, {executeLocation: Entertainment.UI.Actions.ExecutionLocation.canvas});
                            mediaContext.collectionFilter = _this.collectionFilter || Microsoft.Entertainment.Platform.MediaAvailability.available;
                            var containingMediaContextOptions = _this._getContainingMediaContextOptions();
                            if (containingMediaContextOptions)
                                mediaContext.containingMedia = containingMediaContextOptions;
                            _this._mediaContext = mediaContext;
                            _this._applyValueToModules("mediaContext", mediaContext);
                            _this._smartBuyStateEngine.initialize(_this.mediaItem, _this._getSmartBuyEngineButtons(), _this._getSmartBuyEngineEventHandler(), _this._getSmartBuyEngineOptions());
                            _this._smartBuyStateEngineInitialized = true;
                            _this._updateFilterDetails();
                            _this._updateCatalogDetails()
                        }, function(error) {
                            _this.viewStateViewModel.viewState = -1;
                            ViewModels.fail("DetailsPageViewModelBase::_initializeSmartBuyStateEngine. Hydration failed. Error message: " + (error && error.message))
                        })
                    };
                    DetailsPageViewModelBase.prototype._unshareMediaItem = function() {
                        if (this._shareOperation) {
                            this._shareOperation.cancel();
                            this._shareOperation = null
                        }
                    };
                    DetailsPageViewModelBase.prototype._shareMediaItem = function() {
                        if (!Entertainment.ServiceLocator.isServiceRegistered(Entertainment.Services.shareSender))
                            return;
                        this._unshareMediaItem();
                        if (this.mediaItem && this._delayInitialized) {
                            var sender = Entertainment.ServiceLocator.getService(Entertainment.Services.shareSender);
                            this._shareOperation = sender.pendingShare(this.mediaItem)
                        }
                    };
                    DetailsPageViewModelBase.prototype._applyValueToModules = function(propertyName, newValue) {
                        if (this.disposed || !this.modules)
                            return;
                        this.modules.forEach(function(detailsModule) {
                            var oldValue = WinJS.Utilities.getMember(propertyName, detailsModule);
                            if (oldValue !== undefined)
                                MS.Entertainment.Utilities.BindingAgnostic.setProperty(detailsModule, propertyName, newValue)
                        })
                    };
                    DetailsPageViewModelBase.prototype._onAppbarActionsChanged = function() {
                        if (!this.disposed && this._mediaContext && this._smartBuyStateEngine)
                            this._mediaContext.setToolbarActions(this._smartBuyStateEngine.currentAppbarActions)
                    };
                    DetailsPageViewModelBase.prototype._onButtonsChanged = function() {
                        if (!this.disposed && this._smartBuyStateEngine)
                            this.smartBuyButtons = this._smartBuyStateEngine.currentButtons
                    };
                    DetailsPageViewModelBase.HEADER_BUTTON_LIST_LENGTH = 4;
                    return DetailsPageViewModelBase
                })(ViewModels.PageViewModelBase);
            ViewModels.DetailsPageViewModelBase = DetailsPageViewModelBase
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/music/musicdetailspageviewmodelbase.js:854 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p];
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    };

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var ViewModels;
        (function(ViewModels) {
            var MusicDetailsPageViewModelBase = (function(_super) {
                    __extends(MusicDetailsPageViewModelBase, _super);
                    function MusicDetailsPageViewModelBase() {
                        _super.apply(this, arguments);
                        this._genericPlayButton = null;
                        this._allTracksLocal = false;
                        this._allTracksStreaming = false;
                        this._someTracksStreamingSomeLocal = false
                    }
                    MusicDetailsPageViewModelBase.prototype._getGenericSmartBuyButtons = function() {
                        if (!this._genericPlayButton)
                            this._genericPlayButton = ViewModels.SmartBuyButtons.createGenericPlayButton();
                        var enablePlayButton = this.inCollection || this.isOnline;
                        return (enablePlayButton) ? [this._genericPlayButton] : null
                    };
                    MusicDetailsPageViewModelBase.prototype._applyPropertiesToHydratedMedia = function() {
                        this.mediaItem.tracks = this._getTracksForSmartBuyEngine()
                    };
                    MusicDetailsPageViewModelBase.prototype._getTracksForSmartBuyEngine = function() {
                        ViewModels.fail("_getTracksForSmartBuyEngine() should be overridden by the subclass.");
                        return null
                    };
                    MusicDetailsPageViewModelBase.prototype._updateTrackLocationValues = function(playabilityCounts) {
                        if (playabilityCounts) {
                            this._allTracksLocal = playabilityCounts.localOnly > 0 && playabilityCounts.localOnly === playabilityCounts.localOrCloud;
                            this._allTracksStreaming = playabilityCounts.cloudOnly > 0 && playabilityCounts.cloudOnly === playabilityCounts.localOrCloud;
                            this._someTracksStreamingSomeLocal = playabilityCounts.cloudOnly > 0 && playabilityCounts.cloudOnly !== playabilityCounts.localOrCloud
                        }
                    };
                    return MusicDetailsPageViewModelBase
                })(ViewModels.DetailsPageViewModelBase);
            ViewModels.MusicDetailsPageViewModelBase = MusicDetailsPageViewModelBase
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/music/listeditactions.js:909 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p];
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    };
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var ViewModels;
        (function(ViewModels) {
            var EditListAction = (function(_super) {
                    __extends(EditListAction, _super);
                    function EditListAction() {
                        _super.apply(this, arguments);
                        this.__executing = false
                    }
                    Object.defineProperty(EditListAction.prototype, "action", {
                        get: function() {
                            return this
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(EditListAction.prototype, "title", {
                        get: function() {
                            return String.load(this.titleStringId)
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(EditListAction.prototype, "_executing", {
                        get: function() {
                            return this.__executing
                        }, set: function(value) {
                                if (this.__executing !== value) {
                                    this.__executing = value;
                                    this.requeryCanExecute()
                                }
                            }, enumerable: true, configurable: true
                    });
                    EditListAction.prototype.canExecute = function(param) {
                        var list = this._extractList();
                        var hasList = !!list;
                        var hasIndex = this._isValidIndex(this._extractIndex(), list);
                        this._updateListHandler(list);
                        return hasList && hasIndex && !this._executing
                    };
                    EditListAction.prototype._extractList = function() {
                        var list;
                        if (this.parameter && this.parameter.listViewModel && this.parameter.listViewModel.items && this.parameter.listViewModel.items instanceof MS.Entertainment.Data.VirtualList)
                            list = this.parameter.listViewModel.items;
                        else if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.appToolbar)) {
                            var mediaContext = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appToolbar).currentMediaContext;
                            if (mediaContext && mediaContext.options && mediaContext.options.containingMedia && mediaContext.options.containingMedia instanceof MS.Entertainment.UI.EditableContainingMedia)
                                list = (mediaContext.options.containingMedia).editableItemSource
                        }
                        if (list && !(list instanceof MS.Entertainment.Data.VirtualList)) {
                            MS.Entertainment.ViewModels.fail("List edit action only supports virtual lists");
                            list = null
                        }
                        return list
                    };
                    EditListAction.prototype._extractKey = function() {
                        var key = null;
                        if (this.parameter && this.parameter.key)
                            key = this.parameter.key;
                        return key
                    };
                    EditListAction.prototype._extractIndex = function() {
                        var index = -1;
                        var key = this._extractKey();
                        var list;
                        if (key)
                            list = this._extractList();
                        if (key && list && list.indexFromKey)
                            index = list.indexFromKey(key);
                        else if (this.parameter && this.parameter.index >= 0)
                            index = this.parameter.index;
                        else if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.appToolbar)) {
                            var mediaContext = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appToolbar).currentMediaContext;
                            index = mediaContext && mediaContext.options && mediaContext.options.containingMedia && mediaContext.options.containingMedia.playbackOffset
                        }
                        if (typeof index !== "number" || isNaN(index))
                            index = -1;
                        return index
                    };
                    EditListAction.prototype._extractMultiSelection = function() {
                        var mediaContext;
                        if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.appToolbar))
                            mediaContext = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appToolbar).currentMediaContext;
                        var selection = mediaContext && mediaContext.options && mediaContext.options.containingMedia && mediaContext.options.containingMedia.playbackSelectionRanges;
                        if (!Array.isArray(selection) || selection.length === 0)
                            selection = null;
                        return selection
                    };
                    EditListAction.prototype._dispatchAction = function() {
                        var mediaContext;
                        if (Entertainment.ServiceLocator.isServiceRegistered(Entertainment.Services.appToolbar))
                            mediaContext = Entertainment.ServiceLocator.getService(Entertainment.Services.appToolbar).currentMediaContext;
                        if (mediaContext && mediaContext.dispatchEvent)
                            mediaContext.dispatchEvent(this.id)
                    };
                    EditListAction.prototype._dispatchExecutingAction = function() {
                        var mediaContext;
                        if (Entertainment.ServiceLocator.isServiceRegistered(Entertainment.Services.appToolbar))
                            mediaContext = Entertainment.ServiceLocator.getService(Entertainment.Services.appToolbar).currentMediaContext;
                        if (mediaContext && mediaContext.dispatchEvent)
                            mediaContext.dispatchEvent(this.id + "Executing")
                    };
                    EditListAction.prototype._isValidIndex = function(index, list) {
                        MS.Entertainment.ViewModels.fail("Abstract method, _isValidIndex, must be defined");
                        return false
                    };
                    EditListAction.prototype._updateListHandler = function(list) {
                        if (this._listHandler) {
                            this._listHandler.cancel();
                            this._listHandler = null
                        }
                        if (list) {
                            var requeryCanExecute = this.requeryCanExecute.bind(this);
                            this._listHandler = MS.Entertainment.Utilities.addEventHandlers(list, {
                                itemInserted: requeryCanExecute, itemMoved: requeryCanExecute, itemRemoved: requeryCanExecute
                            })
                        }
                    };
                    return EditListAction
                })(MS.Entertainment.UI.Actions.Action);
            ViewModels.EditListAction = EditListAction;
            var DeleteListItem = (function(_super) {
                    __extends(DeleteListItem, _super);
                    function DeleteListItem() {
                        _super.apply(this, arguments);
                        this.titleStringId = String.id.IDS_PLAYLIST_REMOVE;
                        this.icon = WinJS.UI.AppBarIcon.remove;
                        this.id = MS.Entertainment.UI.AppBarActions.removeFromList;
                        this.automationId = MS.Entertainment.UI.AutomationIds.removeFromList
                    }
                    DeleteListItem.prototype.canExecute = function(param) {
                        var returnValue = false;
                        if (!!this._extractMultiSelection())
                            returnValue = !!this._extractList() && !this._executing;
                        else
                            returnValue = _super.prototype.canExecute.call(this, param);
                        return returnValue
                    };
                    DeleteListItem.prototype.executed = function(param) {
                        var selection = this._extractMultiSelection();
                        if (selection)
                            this._executeMultiSelection(param, selection);
                        else
                            this._executeSingleSelection(param)
                    };
                    DeleteListItem.prototype._onDeletionCompleted = function(param, indexToRemove, removed) {
                        if (param && param.postExecute)
                            param.postExecute(indexToRemove, removed);
                        var mediaContext;
                        if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.appToolbar))
                            mediaContext = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appToolbar).currentMediaContext;
                        if (mediaContext)
                            mediaContext.dispatchEvent(this.id, {
                                removedIndices: indexToRemove, complete: removed
                            })
                    };
                    DeleteListItem.prototype._executeMultiSelection = function(param, selection) {
                        var _this = this;
                        var list = this._extractList();
                        if (list && selection) {
                            this._executing = true;
                            list.removeRanges(selection).done(function() {
                                _this._executing = false;
                                _this._onDeletionCompleted(param, -1, true)
                            }, function(error) {
                                MS.Entertainment.ViewModels.fail("Remove from selection failed. error: " + (error && error.message));
                                _this._executing = false;
                                _this._onDeletionCompleted(param, -1, false)
                            })
                        }
                        else
                            this._onDeletionCompleted(param, -1, false)
                    };
                    DeleteListItem.prototype._executeSingleSelection = function(param) {
                        var _this = this;
                        var list = this._extractList();
                        var oldIndex = this._extractIndex();
                        if (list && this._isValidIndex(oldIndex, list)) {
                            this._executing = true;
                            list.removeAt(oldIndex).done(function() {
                                _this._executing = false;
                                _this._onDeletionCompleted(param, oldIndex, true)
                            }, function(error) {
                                MS.Entertainment.ViewModels.fail("Remove failed. index: " + oldIndex + " error: " + (error && error.message));
                                _this._executing = false;
                                _this._onDeletionCompleted(param, oldIndex, false)
                            })
                        }
                        else
                            this._onDeletionCompleted(param, oldIndex, false)
                    };
                    DeleteListItem.prototype._isValidIndex = function(index, list) {
                        var count = list && list.count;
                        return index >= 0 && index <= count
                    };
                    return DeleteListItem
                })(EditListAction);
            ViewModels.DeleteListItem = DeleteListItem;
            var MoveListItem = (function(_super) {
                    __extends(MoveListItem, _super);
                    function MoveListItem() {
                        _super.apply(this, arguments)
                    }
                    MoveListItem.prototype.executed = function(param) {
                        var _this = this;
                        var list = this._extractList();
                        var oldIndex = this._extractIndex();
                        var newIndex = this._getNewIndex(oldIndex);
                        var postAction = param && param.postExecute;
                        if (list && this._isValidIndex(oldIndex, list)) {
                            this._executing = true;
                            this._dispatchExecutingAction();
                            list.moveAt(oldIndex, newIndex).done(function(moveResult) {
                                MS.Entertainment.ViewModels.assert(moveResult && moveResult.data, "Move didn't return a valid result");
                                _this._dispatchAction();
                                _this._executing = false;
                                if (postAction)
                                    postAction(oldIndex, moveResult && moveResult.itemIndex)
                            }, function(error) {
                                MS.Entertainment.ViewModels.fail("Move failed. old index: " + oldIndex + " new index: " + newIndex + " error: " + (error && error.message));
                                _this._executing = false;
                                if (postAction)
                                    postAction(oldIndex, oldIndex)
                            })
                        }
                        else if (postAction)
                            postAction(oldIndex, oldIndex)
                    };
                    MoveListItem.prototype._getNewIndex = function(index) {
                        MS.Entertainment.ViewModels.fail("Abstract method, _getNewIndex, must be defined");
                        return index
                    };
                    return MoveListItem
                })(EditListAction);
            ViewModels.MoveListItem = MoveListItem;
            var MoveListItemUp = (function(_super) {
                    __extends(MoveListItemUp, _super);
                    function MoveListItemUp() {
                        _super.apply(this, arguments);
                        this.titleStringId = String.id.IDS_PLAYLIST_MOVE_UP_SC;
                        this.icon = MS.Entertainment.UI.Icon.chevronUp;
                        this.id = MS.Entertainment.UI.AppBarActions.moveListItemUp;
                        this.automationId = MS.Entertainment.UI.AutomationIds.moveListItemUp
                    }
                    MoveListItemUp.prototype._isValidIndex = function(index, list) {
                        var count = list && list.count;
                        return index > 0 && index <= count
                    };
                    MoveListItemUp.prototype._getNewIndex = function(index) {
                        return index - 1
                    };
                    return MoveListItemUp
                })(MoveListItem);
            ViewModels.MoveListItemUp = MoveListItemUp;
            var MoveListItemToBottom = (function(_super) {
                    __extends(MoveListItemToBottom, _super);
                    function MoveListItemToBottom() {
                        _super.apply(this, arguments);
                        this.titleStringId = String.id.IDS_PLAYLIST_MOVE_TO_BOTTOM_SC;
                        this.icon = MS.Entertainment.UI.Icon.moveToBottom;
                        this.iconInfo = {className: "icon-moveToBottom"};
                        this.id = MS.Entertainment.UI.AppBarActions.moveListItemToBottom;
                        this.automationId = MS.Entertainment.UI.AutomationIds.moveListItemToBottom
                    }
                    MoveListItemToBottom.prototype._isValidIndex = function(index, list) {
                        var count = list && list.count;
                        return index >= 0 && index < count - 1
                    };
                    MoveListItemToBottom.prototype._getNewIndex = function(index) {
                        var list = this._extractList();
                        return list.count
                    };
                    return MoveListItemToBottom
                })(MoveListItem);
            ViewModels.MoveListItemToBottom = MoveListItemToBottom;
            var MoveListItemToTop = (function(_super) {
                    __extends(MoveListItemToTop, _super);
                    function MoveListItemToTop() {
                        _super.apply(this, arguments);
                        this.titleStringId = String.id.IDS_PLAYLIST_MOVE_TO_TOP_SC;
                        this.icon = MS.Entertainment.UI.Icon.moveToTop;
                        this.iconInfo = {className: "icon-moveToTop"};
                        this.id = MS.Entertainment.UI.AppBarActions.moveListItemToTop;
                        this.automationId = MS.Entertainment.UI.AutomationIds.moveListItemToTop
                    }
                    MoveListItemToTop.prototype._isValidIndex = function(index, list) {
                        var count = list && list.count;
                        return index > 0 && index <= count
                    };
                    MoveListItemToTop.prototype._getNewIndex = function(index) {
                        return 0
                    };
                    return MoveListItemToTop
                })(MoveListItem);
            ViewModels.MoveListItemToTop = MoveListItemToTop;
            var MoveListItemDown = (function(_super) {
                    __extends(MoveListItemDown, _super);
                    function MoveListItemDown() {
                        _super.apply(this, arguments);
                        this.titleStringId = String.id.IDS_PLAYLIST_MOVE_DOWN_SC;
                        this.icon = MS.Entertainment.UI.Icon.chevronDown;
                        this.id = MS.Entertainment.UI.AppBarActions.moveListItemDown;
                        this.automationId = MS.Entertainment.UI.AutomationIds.moveListItemDown
                    }
                    MoveListItemDown.prototype._isValidIndex = function(index, list) {
                        var count = list && list.count;
                        return index >= 0 && index < count - 1
                    };
                    MoveListItemDown.prototype._getNewIndex = function(index) {
                        return index + 2
                    };
                    return MoveListItemDown
                })(MoveListItem);
            ViewModels.MoveListItemDown = MoveListItemDown;
            var DeletePlaylistItem = (function(_super) {
                    __extends(DeletePlaylistItem, _super);
                    function DeletePlaylistItem() {
                        _super.apply(this, arguments);
                        this.automationId = MS.Entertainment.UI.AutomationIds.playlistRemoveFromPlaylist
                    }
                    return DeletePlaylistItem
                })(DeleteListItem);
            ViewModels.DeletePlaylistItem = DeletePlaylistItem;
            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).register(MS.Entertainment.UI.Actions.ActionIdentifiers.removeFromList, function() {
                return new DeleteListItem
            });
            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).register(MS.Entertainment.UI.Actions.ActionIdentifiers.moveListItemDown, function() {
                return new MoveListItemDown
            });
            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).register(MS.Entertainment.UI.Actions.ActionIdentifiers.moveListItemToBottom, function() {
                return new MoveListItemToBottom
            });
            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).register(MS.Entertainment.UI.Actions.ActionIdentifiers.moveListItemToTop, function() {
                return new MoveListItemToTop
            });
            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).register(MS.Entertainment.UI.Actions.ActionIdentifiers.moveListItemUp, function() {
                return new MoveListItemUp
            })
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/music1/metadataeditactions.js:1264 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p];
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    };
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Actions");

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var UI;
        (function(UI) {
            var Actions;
            (function(Actions) {
                var ViewModels = MS.Entertainment.ViewModels;
                var MetadataEditedDetail = (function() {
                        function MetadataEditedDetail(editedMediaItem) {
                            this.editedMediaItem = editedMediaItem
                        }
                        return MetadataEditedDetail
                    })();
                Actions.MetadataEditedDetail = MetadataEditedDetail;
                var EditMetadata = (function(_super) {
                        __extends(EditMetadata, _super);
                        function EditMetadata() {
                            _super.apply(this, arguments);
                            this.titleStringId = String.id.IDS_MUSIC_EDIT_METADATA_ALBUM_ACTION;
                            this.icon = WinJS.UI.AppBarIcon.edit;
                            this.id = MS.Entertainment.UI.AppBarActions.editMetadata;
                            this.automationId = MS.Entertainment.UI.AutomationIds.editMetadata
                        }
                        Object.defineProperty(EditMetadata.prototype, "action", {
                            get: function() {
                                return this
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(EditMetadata.prototype, "title", {
                            get: function() {
                                return String.load(this.titleStringId)
                            }, enumerable: true, configurable: true
                        });
                        EditMetadata.prototype.canExecute = function(param) {
                            var mediaItem = this._extractMediaItem(param);
                            return mediaItem && (mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.album || mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.track)
                        };
                        EditMetadata.prototype.executed = function(param) {
                            var _this = this;
                            var mediaItem = this._extractMediaItem(param);
                            if (this._metadataEditor)
                                this._metadataEditor.dispose();
                            var showDialogPromise;
                            switch (mediaItem.mediaType) {
                                case Microsoft.Entertainment.Queries.ObjectType.album:
                                    showDialogPromise = this._showAlbumDialog(mediaItem);
                                    break;
                                case Microsoft.Entertainment.Queries.ObjectType.track:
                                    showDialogPromise = this._showTrackDialog(mediaItem);
                                    break;
                                default:
                                    showDialogPromise = WinJS.Promise.wrapError(new Error("EditMetadata::executed() Invalid media type. Please check canExecute, as we shouldn't have gotten here. mediaType " + mediaItem.mediaType))
                            }
                            showDialogPromise.then(null, function(error) {
                                MS.Entertainment.UI.Actions.fail("EditMetadata::executed() Something went really wrong when showing the metadata edit dialog. " + "Error: " + (error && error.message))
                            }).done(function() {
                                var mediaContext = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appToolbar).currentMediaContext;
                                if (_this._metadataEditor) {
                                    _this._metadataEditor.dispose();
                                    _this._metadataEditor = null
                                }
                                if (mediaContext)
                                    mediaContext.dispatchEvent(_this.id, new MetadataEditedDetail(mediaItem))
                            })
                        };
                        EditMetadata.prototype._showAlbumDialog = function(mediaItem) {
                            this._metadataEditor = new ViewModels.AlbumMetadataEditor(mediaItem);
                            this._metadataEditor.load().done(null, function(error) {
                                MS.Entertainment.UI.Actions.fail("EditMetadata::_showAlbumDialog() failed to load metadata. Error: " + (error && error.message))
                            });
                            return MS.Entertainment.UI.Shell.showDialog(String.load(String.id.IDS_MUSIC_EDIT_METADATA_ALBUM_DIALOG_TITLE), "MS.Entertainment.UI.Controls.AlbumMetadataEditDialogContent", {
                                    width: "100%", height: "410px", defaultButtonIndex: 0, buttons: [this._createSaveButton(), this._createCancelButton()], userControlOptions: {dataContext: this._metadataEditor}
                                }).then(null, function(error) {
                                    MS.Entertainment.UI.Actions.fail("EditMetadata::_showAlbumDialog. Failed to save metadata changed. Error: " + (error && error.message))
                                })
                        };
                        EditMetadata.prototype._showTrackDialog = function(mediaItem) {
                            this._metadataEditor = new ViewModels.TrackMetadataEditor(mediaItem);
                            this._metadataEditor.load().done(null, function(error) {
                                MS.Entertainment.UI.Actions.fail("EditMetadata::_showTrackDialog() failed to load metadata. Error: " + (error && error.message))
                            });
                            return MS.Entertainment.UI.Shell.showDialog(String.load(String.id.IDS_MUSIC_EDIT_METADATA_SONG_DIALOG_TITLE), "MS.Entertainment.UI.Controls.TrackMetadataEditDialogContent", {
                                    width: "100%", height: "410px", defaultButtonIndex: 0, buttons: [this._createSaveButton(), this._createCancelButton()], userControlOptions: {dataContext: this._metadataEditor}
                                }).then(null, function(error) {
                                    MS.Entertainment.UI.Actions.fail("EditMetadata::_showTrackDialog. Failed to save metadata changed. Error: " + (error && error.message))
                                })
                        };
                        EditMetadata.prototype._extractMediaItem = function(param) {
                            var mediaItem = null;
                            if (param && param.mediaItem)
                                mediaItem = param.mediaItem;
                            else {
                                var mediaContext = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appToolbar).currentMediaContext;
                                if (mediaContext && mediaContext.mediaItem instanceof MS.Entertainment.Data.VirtualList) {
                                    var list = mediaContext.mediaItem;
                                    if (list.count)
                                        list.itemsFromIndex(0, 0, 0).done(function(args) {
                                            mediaItem = args.items && args.items[0] && args.items[0].data
                                        }, function(){})
                                }
                                else if (mediaContext && mediaContext.mediaItem)
                                    mediaItem = (mediaContext.mediaItem)
                            }
                            if (Array.isArray(mediaItem))
                                mediaItem = mediaItem[0];
                            else if (MS.Entertainment.Data.List.isList(mediaItem)) {
                                var synchronous = false;
                                MS.Entertainment.Data.List.getData(mediaItem, 0).done(function(data) {
                                    synchronous = true;
                                    mediaItem = data
                                }, function(){});
                                MS.Entertainment.UI.Actions.assert(synchronous, "EditMetadata::_extractMediaItem() Getting list data was not synchronous")
                            }
                            return mediaItem
                        };
                        EditMetadata.prototype._createCancelButton = function() {
                            return {
                                    title: String.load(String.id.IDS_MUSIC_EDIT_METADATA_DIALOG_ACTION_CANCEL), execute: this._onCancel.bind(this)
                                }
                        };
                        EditMetadata.prototype._createSaveButton = function() {
                            return {
                                    title: String.load(String.id.IDS_MUSIC_EDIT_METADATA_DIALOG_ACTION_SAVE), execute: this._onSave.bind(this)
                                }
                        };
                        EditMetadata.prototype._onCancel = function(dialog) {
                            if (this._metadataEditor)
                                this._metadataEditor.cancel();
                            dialog.hide()
                        };
                        EditMetadata.prototype._onSave = function(dialog) {
                            if (this._metadataEditor) {
                                this._metadataEditor.validate();
                                if (this._metadataEditor.isValid)
                                    this._metadataEditor.save().then(null, function(error) {
                                        MS.Entertainment.UI.Actions.fail("EditMetadata::_onSave failed to save metadata. Error: " + (error && error.message))
                                    }).done(function() {
                                        dialog.hide()
                                    })
                            }
                        };
                        return EditMetadata
                    })(Actions.Action);
                Actions.EditMetadata = EditMetadata;
                var EditMetadataImage = (function(_super) {
                        __extends(EditMetadataImage, _super);
                        function EditMetadataImage() {
                            _super.apply(this, arguments);
                            this.titleStringId = String.id.IDS_MUSIC_EDIT_METADATA_DIALOG_ALBUM_ART_BUTTON;
                            this.id = MS.Entertainment.UI.AppBarActions.editMetadataImage;
                            this.automationId = MS.Entertainment.UI.AutomationIds.editMetadataImage
                        }
                        Object.defineProperty(EditMetadataImage.prototype, "action", {
                            get: function() {
                                return this
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(EditMetadataImage.prototype, "title", {
                            get: function() {
                                return String.load(this.titleStringId)
                            }, enumerable: true, configurable: true
                        });
                        EditMetadataImage.prototype.canExecute = function(param) {
                            var field = this._extractMetadataField(param);
                            return !!(field && field.value)
                        };
                        EditMetadataImage.prototype.executed = function(param) {
                            var openPicker = new Windows.Storage.Pickers.FileOpenPicker;
                            openPicker.viewMode = Windows.Storage.Pickers.PickerViewMode.thumbnail;
                            openPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.picturesLibrary;
                            var field = this._extractMetadataField(param);
                            openPicker.fileTypeFilter.replaceAll([".png", ".jpg", ".jpeg", ".jpe", ".jfif", ".bmp", ".dip", ".gif", ".tif", ".tiff", ".mp3", ".wma"]);
                            return openPicker.pickSingleFileAsync().then(function(file) {
                                    if (file) {
                                        var newValue = field.value.copy();
                                        newValue.storageFile = file;
                                        field.value = newValue
                                    }
                                }, function(){})
                        };
                        EditMetadataImage.prototype._extractMetadataField = function(param) {
                            var field = null;
                            if (param && param instanceof ViewModels.MetadataImageValueField)
                                field = param;
                            else if (param && param.field)
                                field = param.field;
                            return field
                        };
                        return EditMetadataImage
                    })(MS.Entertainment.UI.Actions.Action);
                Actions.EditMetadataImage = EditMetadataImage;
                var EditMetadataMatchAlbumInfo = (function(_super) {
                        __extends(EditMetadataMatchAlbumInfo, _super);
                        function EditMetadataMatchAlbumInfo() {
                            _super.apply(this, arguments);
                            this.titleStringId = String.id.IDS_MATCH_ALBUM_INFO_COMMAND;
                            this.id = MS.Entertainment.UI.AppBarActions.editMetadataMatchAlbumInfo;
                            this.automationId = MS.Entertainment.UI.AutomationIds.editMetadataMatchAlbumInfo
                        }
                        Object.defineProperty(EditMetadataMatchAlbumInfo.prototype, "_matchAlbumInfoAction", {
                            get: function() {
                                if (!this.__matchAlbumInfoAction) {
                                    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                                    this.__matchAlbumInfoAction = actionService.getAction(Actions.ActionIdentifiers.findAlbumInfo)
                                }
                                return this.__matchAlbumInfoAction
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(EditMetadataMatchAlbumInfo.prototype, "action", {
                            get: function() {
                                return this
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(EditMetadataMatchAlbumInfo.prototype, "title", {
                            get: function() {
                                return String.load(this.titleStringId)
                            }, enumerable: true, configurable: true
                        });
                        EditMetadataMatchAlbumInfo.prototype.canExecute = function(param) {
                            return this._matchAlbumInfoAction.canExecute(param)
                        };
                        EditMetadataMatchAlbumInfo.prototype.executed = function(param) {
                            var domEvent = document.createEvent("Event");
                            domEvent.initEvent("dismissoverlay", true, true);
                            var metadataEditDialog = WinJS.Binding.unwrap(param.referenceElement);
                            MS.Entertainment.UI.assert(metadataEditDialog, "Expected metadata editor in the DOM for this action.");
                            if (metadataEditDialog)
                                metadataEditDialog.dispatchEvent(domEvent);
                            this._matchAlbumInfoAction.executed(param)
                        };
                        return EditMetadataMatchAlbumInfo
                    })(Actions.Action);
                Actions.EditMetadataMatchAlbumInfo = EditMetadataMatchAlbumInfo;
                var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                if (actionService) {
                    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.editMetadata, function() {
                        return new MS.Entertainment.UI.Actions.EditMetadata
                    });
                    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.editMetadataImage, function() {
                        return new MS.Entertainment.UI.Actions.EditMetadataImage
                    });
                    actionService.register(Actions.ActionIdentifiers.editMetadataMatchAlbumInfo, function() {
                        return new MS.Entertainment.UI.Actions.EditMetadataMatchAlbumInfo
                    })
                }
            })(Actions = UI.Actions || (UI.Actions = {}))
        })(UI = Entertainment.UI || (Entertainment.UI = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/mediastoreservice.js:1530 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var ViewModels;
        (function(ViewModels) {
            var MediaStoreService = (function() {
                    function MediaStoreService(){}
                    MediaStoreService.createMediaStoreService = function() {
                        return new MediaStoreService
                    };
                    MediaStoreService.prototype.getPlaylistProvider = function() {
                        var mediaStore = new Microsoft.Entertainment.Platform.MediaStore;
                        return mediaStore.playlistProvider
                    };
                    return MediaStoreService
                })();
            ViewModels.MediaStoreService = MediaStoreService
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}));
MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.mediaStore, MS.Entertainment.ViewModels.MediaStoreService.createMediaStoreService)
})();
/* >>>>>>/viewmodels/syncmanagerservice.js:1557 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var ViewModels;
        (function(ViewModels) {
            var SyncManagerService = (function() {
                    function SyncManagerService(){}
                    SyncManagerService.createSyncManager = function() {
                        return new SyncManagerService
                    };
                    SyncManagerService.prototype.getSyncManager = function() {
                        return new Microsoft.Entertainment.Sync.SyncManager
                    };
                    return SyncManagerService
                })();
            ViewModels.SyncManagerService = SyncManagerService
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}));
MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.syncManager, MS.Entertainment.ViewModels.SyncManagerService.createSyncManager)
})();
/* >>>>>>/components/music/freeplaylimits.js:1583 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var Music;
        (function(Music) {
            MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Music");
            var FreePlayLimits = (function() {
                    function FreePlayLimits() {
                        this._musicLimitsManager = null;
                        this._listeners = {};
                        this._collectionFilterListeners = [];
                        this._isMonthlyFreeLimitExceeded = false;
                        this._isFreeTrialCompleted = false;
                        this._eventBindings = null;
                        this._queuedCollectionFilterEvent = null;
                        this._signInBindings = null;
                        this._signedInUserBindings = null;
                        this._initialized = false;
                        this._initializedTimeout = null;
                        this._sessionManager = null
                    }
                    FreePlayLimits.prototype.initialize = function() {
                        var _this = this;
                        if (!this._initialized) {
                            var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                            if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicFreePlay)) {
                                this._initialized = true;
                                this._musicLimitsManager = Microsoft.Entertainment.Limits.MusicLimitsManager;
                                this._isMonthlyFreeLimitExceeded = this._musicLimitsManager.isMonthlyFreeLimitExceeded;
                                this._isFreeTrialCompleted = this._musicLimitsManager.isFreeTrialCompleted;
                                this._sessionManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                                var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                                this._signInBindings = WinJS.Binding.bind(signIn, {isSignedIn: function() {
                                        return _this._onSignInStateChanged()
                                    }});
                                this._initializedTimeout = WinJS.Promise.timeout(3000)
                            }
                        }
                    };
                    FreePlayLimits.prototype._currentMediaChanged = function() {
                        if (!WinJS.Utilities.getMember("MS.Entertainment.Music2.UpsellDialogOverlay") || !WinJS.Utilities.getMember("_sessionManager.primarySession.currentMedia", this))
                            return;
                        var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                        if (signedInUser.xuid && !signedInUser.isSubscription)
                            this.getLimits().done(function(limits) {
                                var tracksLeft = limits.totalUnauthenticatedTrackAllowance - limits.totalUnauthenticatedTracksUsed;
                                if (tracksLeft > 0)
                                    MS.Entertainment.Music2.UpsellDialogOverlay.showTracksLeft(tracksLeft)
                            }, function(error) {
                                MS.Entertainment.Music.fail("getLimits query failed  " + (error && error.message))
                            })
                    };
                    FreePlayLimits.prototype.dispose = function() {
                        if (this._signInBindings) {
                            this._signInBindings.cancel();
                            this._signInBindings = null
                        }
                        if (this._signedInUserBindings) {
                            this._signedInUserBindings.cancel();
                            this._signedInUserBindings = null
                        }
                    };
                    Object.defineProperty(FreePlayLimits.prototype, "isMonthlyFreeLimitExceeded", {
                        get: function() {
                            return this._isMonthlyFreeLimitExceeded
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(FreePlayLimits.prototype, "isFreeTrialCompleted", {
                        get: function() {
                            return this._isFreeTrialCompleted
                        }, enumerable: true, configurable: true
                    });
                    FreePlayLimits.prototype.attachListener = function(serviceMediaId, listener) {
                        MS.Entertainment.Music.assert(!MS.Entertainment.Utilities.isEmptyGuid(serviceMediaId), "serviceMediaId param not valid");
                        MS.Entertainment.Music.assert(listener instanceof Function, "listener param is not a function");
                        var listeners = this._listeners[serviceMediaId];
                        if (!listeners)
                            this._listeners[serviceMediaId] = [listener];
                        else
                            listeners.push(listener)
                    };
                    FreePlayLimits.prototype.detachListener = function(serviceMediaId, listener) {
                        MS.Entertainment.Music.assert(!MS.Entertainment.Utilities.isEmptyGuid(serviceMediaId), "serviceMediaId param not valid");
                        MS.Entertainment.Music.assert(listener instanceof Function, "listener param is not a function");
                        var listeners = this._listeners[serviceMediaId];
                        if (listeners)
                            if (listeners.length === 1) {
                                MS.Entertainment.Music.assert(listeners[0] === listener, "listener not attached");
                                if (listeners[0] === listener)
                                    delete this._listeners[serviceMediaId]
                            }
                            else {
                                var index = listeners.indexOf(listener);
                                MS.Entertainment.Music.assert(index >= 0, "listener not attached");
                                if (index >= 0)
                                    listeners.splice(index, 1)
                            }
                    };
                    FreePlayLimits.prototype.addCollectionFilterListener = function(listener) {
                        var _this = this;
                        MS.Entertainment.Music.assert(listener instanceof Function, "listener param is not a function");
                        MS.Entertainment.Music.assert(this._collectionFilterListeners.indexOf(listener) === -1, "listener already attached");
                        this._collectionFilterListeners.push(listener);
                        if (this._queuedCollectionFilterEvent) {
                            this._sendCollectionFilterEvent(this._queuedCollectionFilterEvent);
                            this._queuedCollectionFilterEvent = null
                        }
                        return {cancel: function() {
                                    var index = _this._collectionFilterListeners.indexOf(listener);
                                    if (index >= 0)
                                        _this._collectionFilterListeners.splice(index, 1)
                                }}
                    };
                    FreePlayLimits.prototype.showFreeTrackLimitExceededDialog = function(mediaItem) {
                        var _this = this;
                        return this._hydrateMedia(mediaItem).then(function() {
                                MS.Entertainment.Music.Freeplay.sendTelemetryEvent(MS.Entertainment.Music.Freeplay.Events.freeTrackLimitExceeded);
                                var streamingTrackLimitDialogTitle = String.empty;
                                var streamingTrackLimitDialogBody = String.empty;
                                var purchasableMediaItem = null;
                                var actions = _this._getMediaItemActions(mediaItem);
                                var freeIndividualTrackAllowance = _this._musicLimitsManager.freeIndividualTrackAllowance;
                                var includeTrackAllowanceText = freeIndividualTrackAllowance > 0;
                                if (mediaItem && mediaItem.name && mediaItem.artistName && (actions.canBuyTrack || actions.canBuyAlbum)) {
                                    streamingTrackLimitDialogTitle = String.load(String.id.IDS_MUSIC_STREAMING_TRACK_LIMIT_TITLE).format(mediaItem.name, mediaItem.artistName);
                                    streamingTrackLimitDialogBody = includeTrackAllowanceText ? String.load(String.id.IDS_MUSIC_STREAMING_TRACK_LIMIT_BODY).format(freeIndividualTrackAllowance) : String.load(String.id.IDS_MUSIC_STREAMING_TRACK_LIMIT_BODY_NO_COUNT);
                                    purchasableMediaItem = actions.mediaItem
                                }
                                else {
                                    streamingTrackLimitDialogTitle = String.load(String.id.IDS_MUSIC_STREAMING_TRACK_LIMIT_MULTI_TITLE);
                                    streamingTrackLimitDialogBody = includeTrackAllowanceText ? String.load(String.id.IDS_MUSIC_STREAMING_TRACK_LIMIT_MULTI_BODY).format(freeIndividualTrackAllowance) : String.load(String.id.IDS_MUSIC_STREAMING_TRACK_LIMIT_MULTI_BODY_NO_COUNT)
                                }
                                return MS.Entertainment.Music.MusicBrandDialog.show(streamingTrackLimitDialogTitle, streamingTrackLimitDialogBody, null, actions.buttons, null, purchasableMediaItem)
                            })
                    };
                    FreePlayLimits.prototype.showMonthlyFreeLimitExceededDialog = function(mediaItem) {
                        var _this = this;
                        return this._hydrateMedia(mediaItem).then(function() {
                                MS.Entertainment.Music.Freeplay.sendTelemetryEvent(MS.Entertainment.Music.Freeplay.Events.monthlyFreeLimitExceeded);
                                var contentLink = null;
                                if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.navigation))
                                    contentLink = {
                                        title: String.load(String.id.IDS_MUSIC_STREAMING_MONTHLY_LIMIT_PC_FILTER_LINK), accessabilityTitle: String.load(String.id.IDS_MUSIC_STREAMING_MONTHLY_LIMIT_PC_FILTER_LINK), isEnabled: true, canExecute: function canExecute() {
                                                return true
                                            }, execute: function() {
                                                var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                                                var currentPage = navigationService.currentPage;
                                                var event = MS.Entertainment.ViewModels.MusicCollectionAutomationIds.collectionFilterAvailableOffline;
                                                if (currentPage && currentPage.iaNode && currentPage.iaNode.moniker !== MS.Entertainment.UI.Monikers.musicCollection) {
                                                    navigationService.navigateTo(MS.Entertainment.UI.Monikers.musicCollection, MS.Entertainment.UI.Monikers.musicCollectionByAlbum, null, {selectHub: true});
                                                    _this._queueCollectionFilterEvent(event)
                                                }
                                                else
                                                    _this._sendCollectionFilterEvent(event)
                                            }
                                    };
                                var actions = _this._getMediaItemActions(mediaItem);
                                var monthlyFreeHoursAllowance = _this._getMonthlyFreeHoursAllowance();
                                var dateFormatter = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).dayMonthYear;
                                var nextMonthlyFreeLimitResetDate = String.empty;
                                try {
                                    nextMonthlyFreeLimitResetDate = dateFormatter.format(new Date(_this._musicLimitsManager.nextMonthlyFreeLimitResetDate))
                                }
                                catch(error) {
                                    MS.Entertainment.Music.fail("showMonthlyFreeLimitExceededDialog has failed because date parse failed. Error message = " + (error && error.message))
                                }
                                var monthlyHoursPluralFormatString = MS.Entertainment.Utilities.Pluralization.getPluralizedString(String.id.IDS_MUSIC_STREAMING_MONTHLY_LIMIT_DESC_PLURAL, monthlyFreeHoursAllowance);
                                return MS.Entertainment.Music.MusicBrandDialog.show(String.load(String.id.IDS_MUSIC_STREAMING_MONTHLY_LIMIT_TITLE), monthlyHoursPluralFormatString.format(monthlyFreeHoursAllowance, nextMonthlyFreeLimitResetDate), contentLink, actions.buttons, null, actions.mediaItem)
                            })
                    };
                    FreePlayLimits.prototype.showTravelLimitExceededDialog = function() {
                        MS.Entertainment.Music.Freeplay.sendTelemetryEvent(MS.Entertainment.Music.Freeplay.Events.travelLimitReached);
                        return MS.Entertainment.Music.MusicBrandDialog.show(String.load(String.id.IDS_MUSIC_STREAMING_TRAVEL_LIMIT_TITLE), String.load(String.id.IDS_MUSIC_STREAMING_TRAVEL_LIMIT_DESC), null, [MS.Entertainment.Music.MusicBrandDialog.dialogButtonIds.subscribe, MS.Entertainment.Music.MusicBrandDialog.dialogButtonIds.ok])
                    };
                    FreePlayLimits.prototype.showUnauthenticatedFreeLimitExceededDialog = function() {
                        if (WinJS.Utilities.getMember("MS.Entertainment.Music2.UpsellDialogOverlay")) {
                            var music2 = MS.Entertainment;
                            music2 = music2.Music2;
                            return music2.UpsellDialogOverlay.showTracksLeft(0)
                        }
                        else {
                            MS.Entertainment.Music.Freeplay.sendTelemetryEvent(MS.Entertainment.Music.Freeplay.Events.unauthenticatedTrackLimitExceeded);
                            var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                            var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                            if (!featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicFreePlayAnonymous))
                                return MS.Entertainment.Music.MusicBrandDialog.show(String.load(String.id.IDS_MUSIC_STREAMING_SIGN_IN_TITLE), String.load(String.id.IDS_MUSIC_STREAMING_SIGN_IN_DESC), null, [MS.Entertainment.Music.MusicBrandDialog.dialogButtonIds.signUp, MS.Entertainment.Music.MusicBrandDialog.dialogButtonIds.cancel]);
                            else if (configurationManager.service.lastSignedInUserXuid)
                                return MS.Entertainment.Music.MusicBrandDialog.show(String.load(String.id.IDS_MUSIC_STREAMING_KEEP_PLAYING_EXISTING_USER_TITLE), String.load(String.id.IDS_MUSIC_STREAMING_SIGN_IN_DESC), null, [MS.Entertainment.Music.MusicBrandDialog.dialogButtonIds.signInNowForExistingUser, MS.Entertainment.Music.MusicBrandDialog.dialogButtonIds.cancel]);
                            else {
                                var adService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.adService);
                                var showMusicBrandDialog = function showBrandedDialog() {
                                        return MS.Entertainment.Music.MusicBrandDialog.show(String.load(String.id.IDS_MUSIC_STREAMING_KEEP_PLAYING_NEW_USER_TITLE), String.load(String.id.IDS_MUSIC_STREAMING_SIGN_IN_DESC), null, [MS.Entertainment.Music.MusicBrandDialog.dialogButtonIds.signInNowForNewUser, MS.Entertainment.Music.MusicBrandDialog.dialogButtonIds.cancel])
                                    };
                                if (!configurationManager.music.anonymousLimitReachedVideoShown && featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicFreePlayAnonAds)) {
                                    configurationManager.music.anonymousLimitReachedVideoShown = true;
                                    var showAdPromise;
                                    var uiStateChanged;
                                    var uiStateServiceBindings;
                                    var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                                    var signal = new MS.Entertainment.UI.Framework.Signal;
                                    uiStateChanged = function uiStateChanged() {
                                        if (uiStateService.isSnapped || !uiStateService.isAppVisible)
                                            return;
                                        if (uiStateServiceBindings) {
                                            uiStateServiceBindings.cancel();
                                            uiStateServiceBindings = null
                                        }
                                        signal.complete()
                                    };
                                    showAdPromise = function showAdPromise() {
                                        return adService.playVideoAd().then(function onAdPlayed(isSignedIn) {
                                                var returnPromise;
                                                var signinService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                                                if (!signinService.isSignedIn)
                                                    returnPromise = showMusicBrandDialog();
                                                return WinJS.Promise.as(returnPromise)
                                            })
                                    };
                                    if (uiStateService.isSnapped || !uiStateService.isAppVisible) {
                                        uiStateServiceBindings = WinJS.Binding.bind(uiStateService, {
                                            isSnapped: uiStateChanged, isAppVisible: uiStateChanged
                                        });
                                        return signal.promise.then(showAdPromise)
                                    }
                                    else
                                        return showAdPromise()
                                }
                                else
                                    return showMusicBrandDialog()
                            }
                        }
                    };
                    FreePlayLimits.prototype.getLimits = function() {
                        if (!this._initialized)
                            this.initialize();
                        if (!this._musicLimitsManager)
                            return WinJS.Promise.wrapError();
                        return this._initializedTimeout.then(function() {
                                var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                                if (!signIn.isSignedIn)
                                    return WinJS.Promise.wrapError()
                            }).then(this._musicLimitsManager.getLimitsAsync).then(function(limits) {
                                try {
                                    limits = JSON.parse(limits).result
                                }
                                catch(error) {
                                    MS.Entertainment.Music.fail("getLimitsAsync has failed because JSON.parse failed. error message = " + (error && error.message) + " json = " + limits);
                                    return WinJS.Promise.wrapError(error)
                                }
                                try {
                                    limits.nextMonthlyFreeLimitResetDate = MS.Entertainment.Data.Factory.date(limits.nextMonthlyFreeLimitResetDate)
                                }
                                catch(error) {
                                    MS.Entertainment.Music.fail("getLimitsAsync has failed because date parse failed. error message = " + (error && error.message) + " json = " + limits);
                                    return WinJS.Promise.wrapError(error)
                                }
                                return limits
                            })
                    };
                    FreePlayLimits.prototype.clearAppNotifications = function() {
                        var appNotification = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appNotification);
                        appNotification.removeNotificationByCategory(MS.Entertainment.Music.FreePlayLimits._notificationCategory)
                    };
                    FreePlayLimits.prototype._onSignInStateChanged = function() {
                        var _this = this;
                        var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                        var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                        if (signIn.isSignedIn && !signedInUser.isSubscription) {
                            if (!this._eventBindings) {
                                this._eventBindings = [];
                                this._eventBindings.push(MS.Entertainment.Utilities.addEventHandlers(this._musicLimitsManager, {
                                    monthlyfreelimitexceeded: this._onMonthlyFreeLimitExceeded.bind(this), monthlyfreelimitreset: this._onMonthlyFreeLimitReset.bind(this), freetrialstarted: this._onFreeTrialStarted.bind(this), freetrialcompleted: this._onFreeTrialCompleted.bind(this), trackfreelimitexceeded: this._onFreeTrackLimitExceeded.bind(this), trackfreelimitsreset: this._onFreeTrackLimitReset.bind(this)
                                }));
                                this._eventBindings.push(MS.Entertainment.Utilities.addEventHandlers(this._sessionManager.primarySession, {currentMediaChanged: this._currentMediaChanged.bind(this)}))
                            }
                            this._isMonthlyFreeLimitExceeded = this._musicLimitsManager.isMonthlyFreeLimitExceeded;
                            this._isFreeTrialCompleted = this._musicLimitsManager.isFreeTrialCompleted
                        }
                        else {
                            if (this._eventBindings) {
                                this._eventBindings.forEach(function(eventBinding) {
                                    eventBinding.cancel()
                                });
                                this._eventBindings = null
                            }
                            this._isMonthlyFreeLimitExceeded = false;
                            this._isFreeTrialCompleted = false
                        }
                        if (this._signedInUserBindings) {
                            this._signedInUserBindings.cancel();
                            this._signedInUserBindings = null
                        }
                        if (signIn.isSignedIn) {
                            this._musicLimitsManager.getLimitsAsync();
                            if (!signedInUser.isSubscription)
                                this._signedInUserBindings = WinJS.Binding.bind(signedInUser, {isSubscription: function(newValue, oldValue) {
                                        if (oldValue !== undefined)
                                            _this._onSignInStateChanged()
                                    }})
                        }
                        this._dispatchEvent(this.isMonthlyFreeLimitExceeded ? MS.Entertainment.Music.Freeplay.Events.monthlyFreeLimitExceeded : MS.Entertainment.Music.Freeplay.Events.monthlyFreeLimitReset)
                    };
                    FreePlayLimits.prototype._onMonthlyFreeLimitExceeded = function() {
                        var _this = this;
                        this._isMonthlyFreeLimitExceeded = true;
                        this._sendAppNotification(String.load(String.id.IDS_MUSIC_STREAMING_MONTHLY_LIMIT_NOTIFICATION_LINE1), String.load(String.id.IDS_MUSIC_STREAMING_MONTHLY_LIMIT_NOTIFICATION_LINE2), MS.Entertainment.UI.Icon.notification, function() {
                            _this.showMonthlyFreeLimitExceededDialog()
                        });
                        this._dispatchEvent(MS.Entertainment.Music.Freeplay.Events.monthlyFreeLimitExceeded)
                    };
                    FreePlayLimits.prototype._onMonthlyFreeLimitReset = function() {
                        this._isMonthlyFreeLimitExceeded = false;
                        var monthlyFreeHoursAllowance = this._getMonthlyFreeHoursAllowance();
                        if (monthlyFreeHoursAllowance > 0)
                            this._sendAppNotification(String.load(String.id.IDS_MUSIC_STREAMING_MONTHLY_RESET_NOTIFICATION_LINE1), String.load(String.id.IDS_MUSIC_STREAMING_MONTHLY_RESET_NOTIFICATION_LINE2).format(monthlyFreeHoursAllowance), MS.Entertainment.UI.Icon.notification);
                        this._dispatchEvent(MS.Entertainment.Music.Freeplay.Events.monthlyFreeLimitReset)
                    };
                    FreePlayLimits.prototype._onFreeTrialStarted = function() {
                        this._isFreeTrialCompleted = false;
                        this._dispatchEvent(MS.Entertainment.Music.Freeplay.Events.freeTrialStarted)
                    };
                    FreePlayLimits.prototype._onFreeTrialCompleted = function() {
                        var _this = this;
                        this._isFreeTrialCompleted = true;
                        if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.appNotification))
                            this._sendAppNotification(String.load(String.id.IDS_MUSIC_STREAMING_TRIAL_END_NOTIFICATION_LINE1), String.load(String.id.IDS_MUSIC_STREAMING_TRIAL_END_NOTIFICATION_LINE2), MS.Entertainment.UI.Icon.notification, WinJS.Utilities.markSupportedForProcessing(function() {
                                _this._showFreeTrialCompletedDialog()
                            }));
                        this._dispatchEvent(MS.Entertainment.Music.Freeplay.Events.freeTrialCompleted)
                    };
                    FreePlayLimits.prototype._onFreeTrackLimitExceeded = function(serviceMediaId) {
                        this._dispatchEvent(MS.Entertainment.Music.Freeplay.Events.freeTrackLimitExceeded, serviceMediaId)
                    };
                    FreePlayLimits.prototype._onFreeTrackLimitReset = function() {
                        this._dispatchEvent(MS.Entertainment.Music.Freeplay.Events.freeTrackLimitReset)
                    };
                    FreePlayLimits.prototype._dispatchEvent = function(event, serviceMediaId) {
                        var _this = this;
                        var dispatchEvent = function(serviceMediaId) {
                                var listeners = _this._listeners[serviceMediaId];
                                if (listeners)
                                    listeners.forEach(function(listener) {
                                        listener(event)
                                    })
                            };
                        if (serviceMediaId)
                            dispatchEvent(serviceMediaId);
                        else
                            for (var listener in this._listeners)
                                dispatchEvent(listener)
                    };
                    FreePlayLimits.prototype._sendAppNotification = function(title, subTitle, icon, action) {
                        var appNotification = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appNotification);
                        appNotification.send(new MS.Entertainment.UI.Notification({
                            notificationType: MS.Entertainment.UI.Notification.Type.Critical, title: title, subTitle: subTitle, moreDetails: null, icon: icon, action: action, category: MS.Entertainment.Music.FreePlayLimits._notificationCategory, isPersistent: true, dismissOnSignOut: true
                        }))
                    };
                    FreePlayLimits.prototype._queueCollectionFilterEvent = function(event) {
                        this._queuedCollectionFilterEvent = event
                    };
                    FreePlayLimits.prototype._sendCollectionFilterEvent = function(event) {
                        this._collectionFilterListeners.forEach(function sendCollectionFilterEvent(listener) {
                            listener(event)
                        })
                    };
                    FreePlayLimits.prototype._showFreeTrialCompletedDialog = function() {
                        MS.Entertainment.Music.Freeplay.sendTelemetryEvent(MS.Entertainment.Music.Freeplay.Events.freeTrialCompleted);
                        var monthlyFreeHoursAllowance = this._getMonthlyFreeHoursAllowance();
                        return MS.Entertainment.Music.MusicBrandDialog.show(String.load(String.id.IDS_MUSIC_STREAMING_TRIAL_END_TITLE), String.load(String.id.IDS_MUSIC_STREAMING_TRIAL_END_BODY).format(monthlyFreeHoursAllowance), null, [MS.Entertainment.Music.MusicBrandDialog.dialogButtonIds.subscribe, MS.Entertainment.Music.MusicBrandDialog.dialogButtonIds.ok])
                    };
                    FreePlayLimits.prototype._getMediaItemActions = function(mediaItem) {
                        var canBuyTrack = false;
                        var canBuyAlbum = false;
                        if (mediaItem && mediaItem.rights)
                            for (var i = 0; i < mediaItem.rights.length; i++) {
                                var right = mediaItem.rights[i];
                                if (right.licenseRight === MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.Purchase) {
                                    canBuyTrack = true;
                                    break
                                }
                                else if (right.licenseRight === MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.AlbumPurchase)
                                    canBuyAlbum = true
                            }
                        var buttons = [];
                        if (canBuyTrack)
                            buttons.push(MS.Entertainment.Music.MusicBrandDialog.dialogButtonIds.buyTrack);
                        else if (canBuyAlbum)
                            buttons.push(MS.Entertainment.Music.MusicBrandDialog.dialogButtonIds.buyAlbum);
                        buttons.push(MS.Entertainment.Music.MusicBrandDialog.dialogButtonIds.subscribe);
                        buttons.push(MS.Entertainment.Music.MusicBrandDialog.dialogButtonIds.ok);
                        return {
                                canBuyTrack: canBuyTrack, canBuyAlbum: canBuyAlbum, buttons: buttons, mediaItem: (mediaItem && canBuyAlbum) ? mediaItem.album : mediaItem
                            }
                    };
                    FreePlayLimits.prototype._getMonthlyFreeHoursAllowance = function() {
                        return Math.max(Math.floor(this._musicLimitsManager.monthlyFreeMinutesAllowance / 60), 0)
                    };
                    FreePlayLimits.prototype._hydrateMedia = function(mediaItem) {
                        var promise = WinJS.Promise.as();
                        if (mediaItem) {
                            var isOnline;
                            switch (MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).networkStatus) {
                                case 0:
                                case 1:
                                case 2:
                                case 3:
                                    isOnline = true;
                                    break;
                                case 4:
                                case 5:
                                    isOnline = false;
                                    break;
                                default:
                                    MS.Entertainment.Music.fail("unexpected network status value");
                                    break
                            }
                            if (isOnline && mediaItem.hydrate)
                                promise = mediaItem.hydrate({forceUpdate: true})
                        }
                        return promise
                    };
                    FreePlayLimits.isFreeStreamingTrack = function(mediaItem) {
                        return !!(mediaItem && mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.track && (mediaItem.canFreeStream || mediaItem.isFreeStreamRestrictedByIndividualLimit || mediaItem.isFreeStreamRestrictedByMonthlyLimit) && !mediaItem.hasPurchased && !mediaItem.canPlayLocally && !MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser).isSubscription)
                    };
                    FreePlayLimits.factory = function() {
                        return new MS.Entertainment.Music.FreePlayLimits
                    };
                    FreePlayLimits._notificationCategory = "AuthenticatedFreeStreamNotification";
                    return FreePlayLimits
                })();
            Music.FreePlayLimits = FreePlayLimits
        })(Music = Entertainment.Music || (Entertainment.Music = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}));
MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.freePlayLimits, MS.Entertainment.Music.FreePlayLimits.factory)
})();
/* >>>>>>/controls/music/mediapropertiesflyout.js:2023 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls");
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {MediaPropertiesFlyout: MS.Entertainment.UI.Framework.defineUserControl("Controls/Music/MediaPropertiesFlyout.html#mediaPropertiesFlyoutTemplate", function mediaPropertiesFlyoutConstructor(){}, {
            _dialog: null, _eventHandlers: null, mediaItem: null, overrideActionFunction: null, initialize: function initialize() {
                    this._eventHandlers = MS.Entertainment.Utilities.addEventHandlers(this.domElement, {
                        keypress: function onKeyPress(event) {
                            if (event.keyCode === WinJS.Utilities.Key.escape)
                                this._dialog.hide()
                        }.bind(this), keydown: function onKeyDown(event) {
                                if (event.keyCode === WinJS.Utilities.Key.dismissButton) {
                                    event.stopPropagation();
                                    this._dialog.hide()
                                }
                            }.bind(this)
                    });
                    if (!(new Microsoft.Entertainment.Configuration.ConfigurationManager).shell.retailExperience)
                        this.showBuyLink = this.mediaItem.hasNonMarketplaceImage;
                    var streamingSource = String.empty;
                    this.getCollectionState().then(function getCollectionState(state) {
                        if (state !== null && state !== undefined) {
                            this.cloudIcon = MS.Entertainment.Data.Factory.toCloudIcon(state);
                            this.cloudIconOpacity = MS.Entertainment.Data.Factory.toCloudIconOpacity(state);
                            this.cloudIconTooltip = MS.Entertainment.Data.Factory.toCloudIconTooltip(state);
                            streamingSource = MS.Entertainment.Data.Factory.toCloudStreamingSource(state)
                        }
                    }.bind(this), function getCollectionStateError(error) {
                        return WinJS.Promise.wrapError("Failed to get collection state. Error: " + (error && error.message))
                    }).then(function getTrackFiles() {
                        return this.getTrackFiles()
                    }.bind(this)).done(function getTrackFilesSuccess(trackFilesArray) {
                        if (trackFilesArray && trackFilesArray.length > 0) {
                            this.trackFiles = trackFilesArray;
                            this.showLocation = true
                        }
                        else {
                            var trackFileInfoArray = new Array;
                            var trackFile = {};
                            trackFile.url = streamingSource;
                            trackFile.hideCopyButton = true;
                            trackFileInfoArray[0] = trackFile;
                            this.trackFiles = trackFileInfoArray;
                            this.showLocation = (streamingSource !== String.empty)
                        }
                    }.bind(this), function getTrackFilesError(error) {
                        MS.Entertainment.UI.Controls.fail("Failed to get track files. Error: " + (error && error.message))
                    })
                }, getCollectionState: function getCollectionState() {
                    var promise;
                    if (this.mediaItem.inCollection && (this.mediaItem.collectionState === null || this.mediaItem.collectionState === undefined)) {
                        var trackQuery = new MS.Entertainment.Data.Query.libraryTracks;
                        trackQuery.trackId = this.mediaItem.libraryId;
                        trackQuery.chunkSize = 1;
                        trackQuery.aggregateChunks = false;
                        promise = trackQuery.getItemsArrayAndIgnoreErrors().then(function getTrack(trackArray) {
                            if (trackArray) {
                                MS.Entertainment.UI.Actions.assert(trackArray.length <= 1, "libraryTracks query using trackId should not return more then 1 items");
                                if (trackArray.length === 1)
                                    return trackArray[0].collectionState
                            }
                        })
                    }
                    else
                        promise = WinJS.Promise.as(this.mediaItem.collectionState);
                    return promise
                }, getTrackFiles: function getTrackFiles() {
                    var promise;
                    var getTrackFilesQuery = new MS.Entertainment.Data.Query.LibraryTrackFiles;
                    getTrackFilesQuery.trackId = this.mediaItem.libraryId;
                    promise = getTrackFilesQuery.execute().then(function getTrackFiles(queryResult) {
                        return queryResult.result && queryResult.result.itemsArray
                    });
                    return promise
                }, unload: function unload() {
                    if (this._eventHandlers) {
                        this._eventHandlers.cancel();
                        this._eventHandlers = null
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, setOverlay: function setOverlay(dialog) {
                    this._dialog = dialog;
                    dialog.setAccessibilityTitle(String.load(String.id.IDS_MUSIC_PROPERTIES_DIALOG_TEXT))
                }
        }, {
            showBuyLink: false, cloudIcon: null, cloudIconOpacity: null, cloudIconTooltip: null, trackFiles: null, showLocation: false
        })})
})()
})();
