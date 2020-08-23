/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {VideoHubSharedData: MS.Entertainment.defineOptionalObservable(function() {
            this._setupBindings()
        }, {
            _localBindings: null, _signInBinding: null, _grovelingBinding: null, _delayRefreshPromise: null, _grovelTimeLimitPromise: null, _minMovies: 6, _minTv: 4, _setupBindings: function _setupBindings() {
                    if (this._localBindings) {
                        this._localBindings.cancel();
                        this._localBindings = null
                    }
                    if (this._signInBinding) {
                        this._signInBinding.cancel();
                        this._signInBinding = null
                    }
                    if (this._grovelingBinding) {
                        this._grovelingBinding.cancel();
                        this._grovelingBinding = null
                    }
                    var videoCountsChanged = this._videoCountsChanged.bind(this);
                    var onSignInChange = this._onSignInChange.bind(this);
                    this._localBindings = WinJS.Binding.bind(this, {
                        tvCount: videoCountsChanged, movieCount: videoCountsChanged, isSignedIn: onSignInChange
                    });
                    var appSignIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                    this._signInBinding = WinJS.Binding.bind(appSignIn, {
                        isSignedIn: onSignInChange, isApp2UserAvailable: onSignInChange, isSigningIn: this._onSigningInChange.bind(this)
                    });
                    var purchaseService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.purchaseHistory);
                    this._grovelingBinding = WinJS.Binding.bind(purchaseService, {isGroveling: this._onIsGrovelingChanged.bind(this)})
                }, unload: function unload() {
                    if (this._localBindings) {
                        this._localBindings.cancel();
                        this._localBindings = null
                    }
                    if (this._signInBinding) {
                        this._signInBinding.cancel();
                        this._signInBinding = null
                    }
                    if (this._grovelingBinding) {
                        this._grovelingBinding.cancel();
                        this._grovelingBinding = null
                    }
                }, _onSigningInChange: function _onSigningInChange(isSigningIn) {
                    this.isSigningIn = isSigningIn;
                    this._updateState()
                }, _onSignInChange: function _onSignInChange(isSignedIn) {
                    this.isSignedIn = isSignedIn;
                    this._updateState()
                }, _onIsGrovelingChanged: function _onIsGrovelingChanged(isGrovelling) {
                    this.isGrovelling = isGrovelling;
                    if (this._grovelTimeLimitPromise) {
                        this._grovelTimeLimitPromise.cancel();
                        this._grovelTimeLimitPromise = null
                    }
                    if (this.isGrovelling)
                        this._grovelTimeLimitPromise = WinJS.Promise.timeout(60000).then(function showLibraryContent() {
                            if (this.isGrovelling) {
                                this.hasGrovelledTooLong = true;
                                this._updateState()
                            }
                        }.bind(this));
                    this._updateState()
                }, _videoCountsChanged: function videoCountsChanged() {
                    this._updateState()
                }, _updateState: function _updateState() {
                    if (this._delayRefreshPromise) {
                        this._delayRefreshPromise.cancel();
                        this._delayRefreshPromise = null
                    }
                    this._delayRefreshPromise = WinJS.Promise.timeout(250).then(function delayRefresh() {
                        var isQuerying = (this.movieCount === -1 || this.tvCount === -1);
                        var isGrovelling = (this.isGrovelling && !this.hasGrovelledTooLong);
                        var hasMovies = (!isGrovelling && this.movieCount > 0) || (this.movieCount >= this._minMovies);
                        var hasTv = (!isGrovelling && this.tvCount > 0) || (this.tvCount >= this._minTv);
                        if (this.isSignedIn && !isQuerying) {
                            this.isQuerying = isQuerying;
                            this.showMovieCollection = hasMovies;
                            this.showTvCollection = hasTv;
                            this.showEmptyMessage = (!this.showMovieCollection && !this.showTvCollection)
                        }
                        else {
                            this.showMovieCollection = false;
                            this.showTvCollection = false;
                            this.showEmptyMessage = true
                        }
                    }.bind(this))
                }
        }, {
            tvCount: -1, movieCount: -1, showEmptyMessage: false, showMovieCollection: false, showTvCollection: false, isQuerying: true, isSigningIn: false, isSignedIn: false, isGrovelling: false, hasGrovelledTooLong: false
        })});
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {VideoHubCollectionPanelBase: MS.Entertainment.UI.Framework.define(function() {
            if (this.videoQuery) {
                this.videoQuery.chunkSize = 12;
                this.videoQuery.queryId = MS.Entertainment.UI.Monikers.videoCollectionPanel
            }
            if (this.browseAction) {
                var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                var browseAction = actionService.getAction(this.browseAction);
                if (MS.Entertainment.Utilities.isVideoApp2) {
                    browseAction.title = String.load(String.id.IDS_VIDEO2_MY_VIDEO_COLLECTION_ACTIONLINK);
                    browseAction.icon = MS.Entertainment.UI.Icon.genericVideo
                }
                this.panelAction = {action: browseAction};
                if (this.voicePhraseStringId)
                    this.panelAction.voicePhrase = String.load(this.voicePhraseStringId);
                if (this.voicePhoneticPhraseStringId)
                    this.panelAction.voicePhoneticPhrase = String.load(this.voicePhoneticPhraseStringId);
                if (this.voiceConfidenceStringId)
                    this.panelAction.voiceConfidence = String.load(this.voiceConfidenceStringId)
            }
            this.emptyLibraryModel = new MS.Entertainment.UI.Controls.DefaultFailedPanelModel;
            this.emptyLibraryModel.primaryStringId = this.emptyPrimaryStringId;
            if (MS.Entertainment.Utilities.isApp2)
                this.emptyLibraryModel.secondaryStringId = this.emptySecondaryStringId;
            if (this.hasEmptyDetails)
                this.emptyLibraryModel.details = this._getEmptyCollectionDetails()
        }, {
            hasEmptyDetails: false, browseAction: null, videoQuery: null, panelAction: null, emptyLibraryModel: null, doNotRaisePanelReady: true, _uiStateEventHandler: null, emptyPrimaryStringId: null, emptySecondaryStringId: null, libraryClicked: WinJS.Utilities.markSupportedForProcessing(function libraryClicked(item) {
                    if (this._uiStateEventHandler) {
                        this._uiStateEventHandler.cancel();
                        this._uiStateEventHandler = null
                    }
                    var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                    if (uiStateService.stageThreeActivated)
                        return MS.Entertainment.ViewModels.VideoHubCollectionPanelBase.libraryClickedInt(item);
                    else
                        this._uiStateEventHandler = MS.Entertainment.Utilities.addEventHandlers(uiStateService, {stageThreeActivatedChanged: function stageThreeActivatedChanged(activateEvent) {
                                if (activateEvent.detail.newValue)
                                    MS.Entertainment.ViewModels.VideoHubCollectionPanelBase.libraryClickedInt(item)
                            }.bind(this)})
                }), _getEmptyCollectionDetails: function _getEmptyCollectionDetails() {
                    var details = null;
                    if (MS.Entertainment.Utilities.isApp1) {
                        var isStorageLibrarySupported = WinJS.Utilities.getMember("Windows.Storage.StorageLibrary") ? true : false;
                        var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                        var openFileAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.openFile);
                        var onManageFoldersAction = isStorageLibrarySupported ? actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.manageFolders) : null;
                        var onMoreAboutLibrariesAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.launchApp);
                        onMoreAboutLibrariesAction.automationId = MS.Entertainment.UI.AutomationIds.launchAppMoreAboutLibraries;
                        onMoreAboutLibrariesAction.parameter = {
                            uri: MS.Entertainment.UI.FWLink.videoLibraries, appendSource: false
                        };
                        details = [{
                                stringId: String.id.IDS_COLLECTION_VIDEO_LIBRARY_EMPTY_2, linkStringId: isStorageLibrarySupported ? String.id.IDS_COLLECTION_VIDEO_MANAGE_FOLDERS_LINK : String.id.IDS_COLLECTION_VIDEO_MORE_LIBRARIES_LINK, linkAction: isStorageLibrarySupported ? onManageFoldersAction : onMoreAboutLibrariesAction, linkIcon: MS.Entertainment.UI.Icon.search
                            }, {
                                stringId: String.id.IDS_COLLECTION_VIDEO_LIBRARY_OPEN_FILE, linkStringId: String.id.IDS_COLLECTION_OPEN_FILES_LINK, linkAction: openFileAction, linkIcon: WinJS.UI.AppBarIcon.folder
                            }]
                    }
                    return details
                }
        }, {
            hideHubs: true, libraryClickedInt: function libraryClickedInt(item) {
                    var mediaItem = item.target;
                    if (mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.video && (mediaItem.videoType === Microsoft.Entertainment.Queries.VideoType.other || mediaItem.videoType === Microsoft.Entertainment.Queries.VideoType.musicVideo)) {
                        MS.Entertainment.Instrumentation.PerfTrack.setStartTime(MS.Entertainment.Instrumentation.PerfTrack.StartPoints.PlayCommand);
                        MS.Entertainment.Instrumentation.PerfTrack.enableScenarioPlayNonProtectedInApp();
                        MS.Entertainment.Platform.PlaybackHelpers.showImmersiveDetails(mediaItem, false, true)
                    }
                    else {
                        var popOverConstructor = null;
                        if (mediaItem.videoType === Microsoft.Entertainment.Queries.VideoType.tvEpisode || mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeason || mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeries)
                            popOverConstructor = MS.Entertainment.Utilities.getTvInlineDetailsPopoverControl();
                        else if (mediaItem.videoType === Microsoft.Entertainment.Queries.VideoType.movie)
                            popOverConstructor = "MS.Entertainment.Pages.MovieInlineDetails";
                        var popOverParameters = {itemConstructor: popOverConstructor};
                        popOverParameters.dataContext = {
                            data: mediaItem, location: MS.Entertainment.Data.ItemLocation.collection
                        };
                        MS.Entertainment.Platform.PlaybackHelpers.showItemDetails(popOverParameters)
                    }
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {MovieHubCollectionPanel: MS.Entertainment.UI.Framework.derive("MS.Entertainment.ViewModels.VideoHubCollectionPanelBase", function videoHubCollectionPanelConstructor() {
            this.videoQuery.sort = Microsoft.Entertainment.Queries.VideosSortBy.dateAddedDescending;
            MS.Entertainment.ViewModels.VideoHubCollectionPanelBase.prototype.constructor.call(this)
        }, {
            emptyPrimaryStringId: String.id.IDS_COLLECTION_MOVIE_EMPTY, emptySecondaryStringId: String.id.IDS_VIDEO_COLLECTION_EMPTY, browseAction: MS.Entertainment.UI.Actions.ActionIdentifiers.videoCollectionMovieNavigate, _videoQuery: null, videoQuery: {get: function videoquery_get() {
                        if (!this._videoQuery)
                            this._videoQuery = new MS.Entertainment.Data.Query.libraryVideoMovies;
                        return this._videoQuery
                    }}, itemsColumns: 2, hidePanelWhenEmpty: true
        })});
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {Video2MovieHubCollectionPanel: MS.Entertainment.UI.Framework.derive("MS.Entertainment.ViewModels.MovieHubCollectionPanel", function videoHubCollectionPanelConstructor() {
            MS.Entertainment.ViewModels.MovieHubCollectionPanel.prototype.constructor.call(this)
        }, {
            itemsColumns: 3, hidePanelWhenEmpty: false, voicePhraseStringId: String.id.IDS_VIDEO2_L1_MORE_MOVIES_BUTTON_VUI_ALM, voicePhoneticPhraseStringId: String.id.IDS_VIDEO2_L1_MORE_MOVIES_BUTTON_VUI_PRON, voiceConfidenceStringId: String.id.IDS_VIDEO2_L1_MORE_MOVIES_BUTTON_VUI_CONF
        })});
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {TvHubCollectionPanel: MS.Entertainment.UI.Framework.derive("MS.Entertainment.ViewModels.VideoHubCollectionPanelBase", function TvHubCollectionPanel() {
            this.videoQuery.sort = Microsoft.Entertainment.Queries.TVSeriesSortBy.dateLastEpisodeAddedDescending;
            MS.Entertainment.ViewModels.VideoHubCollectionPanelBase.prototype.constructor.call(this)
        }, {
            emptyPrimaryStringId: String.id.IDS_COLLECTION_TV_EMPTY, emptySecondaryStringId: String.id.IDS_VIDEO_COLLECTION_EMPTY, browseAction: MS.Entertainment.UI.Actions.ActionIdentifiers.videoCollectionTvNavigate, _videoQuery: null, videoQuery: {get: function videoquery_get() {
                        if (!this._videoQuery)
                            this._videoQuery = new MS.Entertainment.Data.Query.libraryTVSeries;
                        return this._videoQuery
                    }}, itemsColumns: 2, hidePanelWhenEmpty: true
        })});
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {Video2TvHubCollectionPanel: MS.Entertainment.UI.Framework.derive("MS.Entertainment.ViewModels.TvHubCollectionPanel", function Video2TvHubCollectionPanel() {
            MS.Entertainment.ViewModels.TvHubCollectionPanel.prototype.constructor.call(this)
        }, {
            itemsColumns: 2, hidePanelWhenEmpty: false, voicePhraseStringId: String.id.IDS_VIDEO2_L1_MORE_TV_BUTTON_VUI_ALM, voicePhoneticPhraseStringId: String.id.IDS_VIDEO2_L1_MORE_TV_BUTTON_VUI_PRON, voiceConfidenceStringId: String.id.IDS_VIDEO2_L1_MORE_TV_BUTTON_VUI_CONF
        })});
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {OtherHubCollectionPanel: MS.Entertainment.UI.Framework.derive("MS.Entertainment.ViewModels.VideoHubCollectionPanelBase", function videoHubCollectionPanelConstructor() {
            this.videoQuery.sort = Microsoft.Entertainment.Queries.VideosSortBy.dateAddedDescending;
            MS.Entertainment.ViewModels.VideoHubCollectionPanelBase.prototype.constructor.call(this)
        }, {
            emptyPrimaryStringId: String.id.IDS_COLLECTION_VIDEO_LIBRARY_EMPTY, emptySecondaryStringId: String.id.IDS_VIDEO_COLLECTION_EMPTY, browseAction: MS.Entertainment.UI.Actions.ActionIdentifiers.videoCollectionOtherNavigate, _videoQuery: null, videoQuery: {get: function videoquery_get() {
                        if (!this._videoQuery)
                            this._videoQuery = new MS.Entertainment.Data.Query.libraryVideoOther;
                        return this._videoQuery
                    }}, itemsColumns: 2, hidePanelWhenEmpty: false, hasEmptyDetails: true
        })})
})()
