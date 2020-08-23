/* Copyright (C) Microsoft Corporation. All rights reserved. */
/* >>>>>>/controls/nowplaying/nowplayingplaylistmusic1templates.js:2 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";

    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {NowPlayingPlaylistTemplates: {
            marketplaceNowPlaying: {
                itemTemplate: "Components/Music/MusicSharedTemplates.html#verticalSongItemNowPlayingTemplate", layout: MS.Entertainment.UI.Controls.GalleryControl.Layout.list, galleryClass: "verticalListHost verticalListGutter"
            }, snappedNowPlaying: {
                    itemTemplate: "Components/Music/MusicSharedTemplates.html#verticalSongItemNowPlayingTemplate", layout: MS.Entertainment.UI.Controls.GalleryControl.Layout.list, galleryClass: "verticalListHost"
                }, topSongs: {
                    itemTemplate: "Components/Music/MusicSharedTemplates.html#verticalTopSongItemMarketplaceWithoutAlbumArtTemplate", layout: MS.Entertainment.UI.Controls.GalleryControl.Layout.list, galleryClass: "verticalListHost verticalListGutter"
                }, nonMarketplaceNowPlaying: {
                    itemTemplate: "Components/Music/MusicSharedTemplates.html#verticalSongItemNonMarketplaceNowPlayingTemplate", layout: MS.Entertainment.UI.Controls.GalleryControl.Layout.list, galleryClass: "verticalListHost verticalListGutter"
                }
        }});
    Object.defineProperty(MS.Entertainment.UI.Controls.NowPlayingPlaylistTemplates, "nowPlaying", {get: function() {
            var nowPlayingTemplate = MS.Entertainment.UI.Controls.NowPlayingPlaylistTemplates.marketplaceNowPlaying;
            var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
            if (featureEnablement && !featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace))
                nowPlayingTemplate = MS.Entertainment.UI.Controls.NowPlayingPlaylistTemplates.nonMarketplaceNowPlaying;
            return nowPlayingTemplate
        }})
})()
})();
/* >>>>>>/controls/nowplaying/nowplayingoverlays.js:28 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */

(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {NowPlayingOverlays: MS.Entertainment.UI.Framework.defineUserControl("/Controls/NowPlaying/NowPlayingOverlays.html#nowPlayingTemplate", function(element, options){}, {
            autoHidePlaylist: 120000, positionChangedThreshold: 30000, _uiStateService: MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState), _bindings: null, _eventHandlers: null, _keyHandlers: null, _mainHeader: null, _sessionMgr: null, _uiSettings: new Windows.UI.ViewManagement.UISettings, _deferredUpdateTimer: null, _lastMousePos: {
                    x: -10, y: -10
                }, _useBranding: false, _freezeDelayPromise: null, _opportunityDelayTimeoutMS: 333, _opportunityTrackEndThresholdMS: 5000, _opportunityHidePromise: null, _engageHideOffsetMS: 500, _showOpportunityOnDismiss: false, _navigationService: null, _playlistOverlay: null, _brandingShowPromise: null, _backButtonServiceInternal: null, _mediaChangedWhileFrozen: false, _seekBarManipulatingChangedBound: null, _playbackSessionChangedBound: null, _overlaysVisible: false, _overlaysVisiblePromise: null, _resizeButtonVisible: false, _resizeButtonVisiblePromise: null, _seekBarVisible: false, _seekBarVisiblePromise: null, _transportControlsVisible: false, _transportControlsVisiblePromise: null, _backButtonService: {get: function backButtonService_get() {
                        if (!this._backButtonServiceInternal)
                            this._backButtonServiceInternal = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.backButton);
                        return this._backButtonServiceInternal
                    }}, _allowedKeys: null, _freezeDelayTimerMS: 1000, initialize: function initialize() {
                    this._allowedKeys = [WinJS.Utilities.Key.leftArrow, WinJS.Utilities.Key.lArrow, WinJS.Utilities.Key.lOtherArrow, WinJS.Utilities.Key.rightArrow, WinJS.Utilities.Key.rArrow, WinJS.Utilities.Key.rOtherArrow, WinJS.Utilities.Key.upArrow, WinJS.Utilities.Key.uArrow, WinJS.Utilities.Key.uOtherArrow, WinJS.Utilities.Key.downArrow, WinJS.Utilities.Key.dArrow, WinJS.Utilities.Key.dOtherArrow, WinJS.Utilities.Key.tab, WinJS.Utilities.Key.space, WinJS.Utilities.Key.invokeButton];
                    this.showBackButton = this.showBackButton.bind(this);
                    this.updateCurrentOpportunity = this.updateCurrentOpportunity.bind(this);
                    this._mainHeader = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.mainHeader);
                    this._sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    this._navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                    this._metadataControl.onPlaylistClicked = MS.Entertainment.Utilities.bindAndMarkSupportedForProcessing(this._onPlaylistClicked, this);
                    if (!this._seekBarManipulatingChangedBound) {
                        this._seekBarManipulatingChangedBound = this._seekBarManipulatingChanged.bind(this);
                        this._seekBar.bind("isManipulating", this._seekBarManipulatingChangedBound)
                    }
                    this.updateCursorVisibility(true);
                    this.initialized = true;
                    if (!this._playbackSessionChangedBound) {
                        this._playbackSessionChangedBound = this._playbackSessionChanged.bind(this);
                        this.bind("playbackSession", this._playbackSessionChangedBound)
                    }
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    this._useBranding = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace);
                    this.brandingTitle.innerText = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).applicationTitle;
                    if (this._uiStateService.nowPlayingTileVisible)
                        this.hideOverlays();
                    else
                        this.showOverlays(true);
                    var keyHandlerElement = MS.Entertainment.Utilities.isApp2 ? this.domElement : document;
                    this._keyHandlers = MS.Entertainment.Utilities.addEventHandlers(keyHandlerElement, {
                        keydown: this.nowPlayingKeyDown.bind(this), keyup: this.nowPlayingKeyUp.bind(this)
                    }, false)
                }, nowPlayingMouseDown: function nowPlayingMouseDown(event) {
                    if (event.button === 2)
                        return;
                    if (this._uiStateService.nowPlayingTileVisible)
                        return;
                    else if (event.srcElement.className === String.empty || event.srcElement.className === "nowPlayingTransportControlsContainer" || WinJS.Utilities.hasClass(event.srcElement, "seekBarScroller") || (this._opportunityContainer && event.srcElement === this._opportunityContainer) || (this._transportControls && event.srcElement === this._transportControls.domElement) || (this._nowPlayingOverlayContainer && event.srcElement === this._nowPlayingOverlayContainer.domElement) || event.srcElement.tagName === "path" || event.srcElement.tagName === "rect" || event.srcElement.tagName === "svg") {
                        if (WinJS.Utilities.hasClass(event.srcElement, "seekBarScroller") || !this.transportControlsVisible || !this.overlaysVisible)
                            this.showOverlays();
                        else
                            this.hideOverlays();
                        if (this.playlistVisible)
                            this.hidePlaylist();
                        this._lastMousePos.x = event.x;
                        this._lastMousePos.y = event.y
                    }
                    else if (WinJS.Utilities.hasClass(event.srcElement, "nowPlayingMetadataShowPlaylistButton")) {
                        this._lastMousePos.x = event.x;
                        this._lastMousePos.y = event.y
                    }
                    else if (!this._uiStateService.isSnapped && this.playlistVisible)
                        this.hidePlaylist()
                }, nowPlayingClick: function nowPlayingClick(event) {
                    if (this._uiStateService.nowPlayingTileVisible)
                        this.handleHomeNowPlayingTileClick()
                }, nowPlayingMouseMove: function nowPlayingMouseMove(event) {
                    if (this._uiStateService.nowPlayingTileVisible)
                        return;
                    else if (this._seekbar && this._seekBar.isManipulating || (Math.abs(event.x - this._lastMousePos.x) < 10 && Math.abs(event.y - this._lastMousePos.y) < 10))
                        return;
                    if (!this.playlistVisible && !this._uiStateService.isSnapped)
                        this.showOverlays(this._uiStateService.isSnapped);
                    this.updateCursorVisibility(true)
                }, nowPlayingKeyUp: function nowPlayingKeyUp(event) {
                    if (!this.initialized || this.frozen || this._freezeDelayPromise)
                        return;
                    if (this.playlistVisible) {
                        if (event && event.keyCode === WinJS.Utilities.Key.escape) {
                            this.hidePlaylist();
                            this.showOverlays()
                        }
                    }
                    else if (event && event.keyCode === WinJS.Utilities.Key.escape)
                        this.hideOverlays();
                    else if (this._uiStateService.nowPlayingTileVisible) {
                        if ((event.keyCode === WinJS.Utilities.Key.space || event.keyCode === WinJS.Utilities.Key.enter) && ((this._homeNowPlayingPlayButton && event.srcElement.parentElement === this._homeNowPlayingPlayButton.domElement) || WinJS.Utilities.hasClass(event.srcElement, "homeHubNowPlayingTile")))
                            this.handleHomeNowPlayingTileClick()
                    }
                    else if (event && this._allowedKeys && this._allowedKeys.indexOf(event.keyCode) >= 0)
                        this.showOverlays()
                }, nowPlayingKeyDown: function nowPlayingKeyDown(event) {
                    if (event && event.keyCode === WinJS.Utilities.Key.dismissButton) {
                        if (this.overlaysVisible)
                            this.hideOverlays();
                        event.stopPropagation()
                    }
                }, handleHomeNowPlayingTileClick: function handleHomeNowPlayingTileClick() {
                    var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    if (this.playbackSession)
                        switch (this.playbackSession.currentTransportState) {
                            case MS.Entertainment.Platform.Playback.TransportState.playing:
                                if (!MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isSnapped) {
                                    sessionMgr.setPrimarySession(this.playbackSession.sessionId);
                                    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                                    var action = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.showImmersiveDetails);
                                    action.parameter = {
                                        sessionId: this.playbackSession.sessionId, startFullScreen: false, showNowPlaying: true
                                    };
                                    action.title = action.parameter.sessionId;
                                    action.execute()
                                }
                                break;
                            case MS.Entertainment.Platform.Playback.TransportState.stopped:
                                if (this.playbackSession.playerState === MS.Entertainment.Platform.Playback.PlayerState.error)
                                    MS.Entertainment.Platform.PlaybackHelpers.showPlaybackError(this.playbackSession.errorDescriptor);
                                else if (this.opportunityVisible && this.currentOpportunity && this.currentOpportunity.action)
                                    this.opportunityButtonClick();
                                else {
                                    if (this.playbackSession.pendingOrdinal >= 0 && this.playbackSession.currentMedia)
                                        this.playbackSession.activate(document.createElement("div"), this.playbackSession.pendingOrdinal || 0);
                                    else if (this.playbackSession.currentOrdinal !== 0)
                                        this.playbackSession.playAt(0);
                                    else if (this._transportControls)
                                        this._transportControls.playButtonClick();
                                    this._updateTransportControlsVisibility(false)
                                }
                                break;
                            default:
                                if (this._transportControls)
                                    this._transportControls.playButtonClick();
                                this._updateTransportControlsVisibility(false);
                                break
                        }
                }, _detachBindings: function _detachBindings() {
                    if (this._bindings) {
                        this._bindings.cancel();
                        this._bindings = null
                    }
                    if (this._eventHandlers) {
                        this._eventHandlers.cancel();
                        this._eventHandlers = null
                    }
                }, freeze: function immersiveHero_freeze() {
                    if (this.frozen) {
                        MS.Entertainment.UI.Framework.UserControl.prototype.freeze.call(this);
                        return
                    }
                    this.frozen = true;
                    this.hidePlaylist(true);
                    if (this._freezeDelayPromise) {
                        this._freezeDelayPromise.cancel();
                        this._freezeDelayPromise = null
                    }
                    if (this._brandingShowPromise) {
                        this._brandingShowPromise.cancel();
                        this._brandingShowPromise = null
                    }
                    this._freezeDelayPromise = WinJS.Promise.timeout(this._freezeDelayTimerMS).then(function freezeControl() {
                        this.backVisible = true;
                        this._backButtonService.showBackButton(true);
                        this._freezeDelayPromise = null;
                        this._suspendControl()
                    }.bind(this));
                    MS.Entertainment.UI.Framework.UserControl.prototype.freeze.call(this)
                }, thaw: function immersiveHero_thaw() {
                    if (!this._uiStateService.nowPlayingVisible && !this._uiStateService.nowPlayingTileVisible && !this._uiStateService.isSnapped) {
                        MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this);
                        return
                    }
                    this.showOverlays(true);
                    this.frozen = false;
                    if (!this._uiStateService.nowPlayingTileVisible) {
                        this.updateBranding(true);
                        this._resetAutoHideTimer(false)
                    }
                    if (this._mediaChangedWhileFrozen) {
                        this._playbackSessionChanged();
                        this._mediaChangedWhileFrozen = false
                    }
                    if (this._freezeDelayPromise) {
                        this._freezeDelayPromise.cancel();
                        this._freezeDelayPromise = null;
                        MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this);
                        return
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this);
                    this._showTime = new Date;
                    this._playbackSessionChanged();
                    if (!this._keyHandlers) {
                        var keyHandlerElement = MS.Entertainment.Utilities.isApp2 ? this.domElement : document;
                        this._keyHandlers = MS.Entertainment.Utilities.addEventHandlers(keyHandlerElement, {
                            keydown: this.nowPlayingKeyDown.bind(this), keyup: this.nowPlayingKeyUp.bind(this)
                        }, false)
                    }
                }, _suspendControl: function _suspendControl() {
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isFullScreenVideo = false;
                    this.hideOpportunity();
                    this.updateCursorVisibility(true);
                    this._detachBindings();
                    this.hidePlaylist(true);
                    this.overlaysVisible = false;
                    this.resizeButtonVisible = false;
                    if (this._mainHeader)
                        this._mainHeader.visibility = true;
                    if (this._keyHandlers) {
                        this._keyHandlers.cancel();
                        this._keyHandlers = null
                    }
                }, unload: function unload() {
                    this.initialized = false;
                    if (this._deferredUpdateTimer) {
                        this._deferredUpdateTimer.cancel();
                        this._deferredUpdateTimer = null
                    }
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isFullScreenVideo = false;
                    this._resetAutoHideTimer(true);
                    if (this.autoHideCursorTimeout) {
                        clearTimeout(this.autoHideCursorTimeout);
                        this.autoHideCursorTimeout = null
                    }
                    if (this._mainHeader)
                        this._mainHeader.visibility = true;
                    this._detachBindings();
                    if (this._keyHandlers) {
                        this._keyHandlers.cancel();
                        this._keyHandlers = null
                    }
                    if (this._seekBarManipulatingChangedBound) {
                        this._seekBar.unbind("isManipulating", this._seekBarManipulatingChangedBound);
                        this._seekBarManipulatingChangedBound = null
                    }
                    if (this._playbackSessionChangedBound) {
                        this.unbind("playbackSession", this._playbackSessionChangedBound);
                        this._playbackSessionChangedBound = null
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, _playbackSessionChanged: function _playbackSessionChanged() {
                    this._detachBindings();
                    if (this.playbackSession) {
                        this._eventHandlers = MS.Entertainment.Utilities.addEvents(this.playbackSession, {
                            currentMediaChanged: this._mediaChanged.bind(this), currentTransportStateChanged: this._mediaStateChanged.bind(this), currentPositionChanged: this._mediaPositionChanged.bind(this)
                        });
                        this._mediaChanged({detail: {newValue: this.playbackSession.currentMedia}});
                        this._mediaStateChanged({detail: {newValue: this.playbackSession.currentTransportState}});
                        this._mediaPositionChanged({detail: {newValue: this.playbackSession.currentPosition}});
                        this._bindings = WinJS.Binding.bind(this, {_uiStateService: {
                                appBarVisible: this._appBarVisibleChanged.bind(this), isSnapped: this._isSnappedChanged.bind(this), isSettingsCharmVisible: this._settingsCharmVisibleChanged.bind(this), nowPlayingInset: this._updateStates.bind(this), nowPlayingTileVisible: this._nowPlayingTileVisibleChanged.bind(this)
                            }})
                    }
                    if (this.initialized) {
                        this._seekBar.playbackSession = this.playbackSession;
                        this._transportControls.playbackSession = this.playbackSession
                    }
                    this._updateStates()
                }, _appBarVisibleChanged: function _appBarVisibleChanged(newVal) {
                    if (this.frozen)
                        return;
                    if (newVal) {
                        this._updateMusicVisualizations(false);
                        this.hideBranding(true, true);
                        this._resetAutoHideTimer(true);
                        if (!this._uiStateService.nowPlayingTileVisible)
                            this._hideTransportControls()
                    }
                    else {
                        this._updateMusicVisualizations(true);
                        this._resetAutoHideTimer()
                    }
                    this._updateStates()
                }, _settingsCharmVisibleChanged: function _settingsCharmVisibleChanged(newVal) {
                    if (newVal)
                        this.showOverlays();
                    else
                        this._updateStates()
                }, _isSnappedChanged: function _isSnappedChanged(newVal, oldVal) {
                    if (this._playlistOverlay) {
                        this._playlistOverlay.hide();
                        this._playlistOverlay = null
                    }
                    if (this._uiStateService.isSnapped) {
                        WinJS.Utilities.removeClass(this.domElement, "engage");
                        this.showOverlays(true);
                        this._updateStates();
                        this.hideBackButton(true)
                    }
                    else if (!this.frozen && oldVal !== undefined)
                        this.showOverlays(true)
                }, _nowPlayingTileVisibleChanged: function _nowPlayingTileVisibleChanged(newVal, oldVal) {
                    if (this._uiStateService.nowPlayingTileVisible) {
                        this.hideBackButton();
                        this.hideOpportunity();
                        this.showOverlays()
                    }
                    else if (this._uiStateService.isSnapped) {
                        this.showOverlays(true);
                        this.hideBackButton(true)
                    }
                    this._updateStates()
                }, _hideTransportControls: function _hideTransportControls() {
                    if (this.playbackSession && !MS.Entertainment.Platform.PlaybackHelpers.isMusicTrack(this.playbackSession.currentMedia))
                        this.overlaysVisible = false;
                    else {
                        this.overlaysVisible = (this.playbackSession && MS.Entertainment.Platform.PlaybackHelpers.isMusicTrack(this.playbackSession.currentMedia) || this._uiStateService.isSnapped || this._uiStateService.nowPlayingTileVisible);
                        if (!this._uiStateService.isSnapped) {
                            this._updateTransportControlsVisibility(false);
                            if (this._seekBar)
                                this._seekBar.metadataVisible = false
                        }
                        if (this._metadataControl)
                            this._metadataControl.playlistButtonVisible = this._uiStateService.isSnapped;
                        if (this.playbackSession && MS.Entertainment.Platform.PlaybackHelpers.isMusicTrack(this.playbackSession.currentMedia))
                            this.resizeButtonVisible = this._uiStateService.appBarVisible && this._uiStateService.nowPlayingInset;
                        else
                            this.resizeButtonVisible = this._uiStateService.appBarVisible
                    }
                }, hideOverlays: function hideOverlays() {
                    if (!this._uiStateService.isSnapped && !this._uiStateService.nowPlayingTileVisible && (((this._seekbar && this._seekBar.isManipulating) && this.playbackSession.currentTransportState !== MS.Entertainment.Platform.Playback.TransportState.starting) || (!this._useBranding && this.playbackSession && this.playbackSession.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.stopped)))
                        this.showOverlays();
                    else {
                        this._resetAutoHideTimer(true);
                        this.hideBackButton();
                        this.hidePlaylist();
                        this._hideTransportControls();
                        this.updateCursorVisibility(false);
                        if (this.playbackSession && MS.Entertainment.Platform.PlaybackHelpers.isMusicTrack(this.playbackSession.currentMedia))
                            this.resizeButtonVisible = !this._uiStateService.isSnapped && this._uiStateService.nowPlayingInset && !this._uiStateService.isFullScreenMusic;
                        else
                            this.resizeButtonVisible = false;
                        this._updateStates();
                        this.hideBranding()
                    }
                }, hidePlaylist: function hidePlaylist(force) {
                    if (this._playlistOverlay) {
                        this._playlistOverlay.hide();
                        this._playlistOverlay = null
                    }
                }, updateCursorVisibility: function updateCursorVisibility(visibility) {
                    if (this._uiStateService.nowPlayingTileVisible) {
                        if (this._overlaysContainer)
                            this._overlaysContainer.style.cursor = "default"
                    }
                    else {
                        var cursorStyle = visibility ? "default" : "none";
                        if (this._overlaysContainer && this._overlaysContainer.style.cursor !== cursorStyle)
                            this._overlaysContainer.style.cursor = cursorStyle;
                        if (this.autoHideCursorTimeout) {
                            clearTimeout(this.autoHideCursorTimeout);
                            this.autoHideCursorTimeout = null
                        }
                        if (visibility) {
                            var autoHideDurationMs = this._uiSettings.messageDuration * 1000;
                            this.autoHideCursorTimeout = setTimeout(function nowPlayingCursorAutoHide() {
                                this.updateCursorVisibility(false)
                            }.bind(this), autoHideDurationMs)
                        }
                    }
                }, showOverlays: function showOverlays(showBranding) {
                    if (!this.initialized)
                        return;
                    if (!this.playlistVisible)
                        this.updateBranding(showBranding);
                    if (this.overlaysVisible && this.transportControlsVisible && !this._uiStateService.nowPlayingTileVisible) {
                        this._resetAutoHideTimer(false);
                        return
                    }
                    if (this._uiStateService.isSnapped) {
                        this._updateStates();
                        this._updateTransportControlsVisibility(true);
                        this.seekBarVisible = true;
                        this.playIconVisible = false;
                        this._resetAutoHideTimer(false);
                        return
                    }
                    this.overlaysVisible = !this.playlistVisible;
                    if (this._uiStateService.nowPlayingTileVisible) {
                        this._updateTransportControlsVisibility(false);
                        this.playIconVisible = this.playbackSession && this.playbackSession.currentMedia && this.playbackSession.targetTransportState !== MS.Entertainment.Platform.Playback.TransportState.playing && (this.playbackSession.targetTransportState !== MS.Entertainment.Platform.Playback.TransportState.unInitialize || this.playbackSession.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.stopped)
                    }
                    else {
                        this._updateTransportControlsVisibility(!this.playlistVisible);
                        this.playIconVisible = false
                    }
                    if (this.playbackSession && MS.Entertainment.Platform.PlaybackHelpers.isMusicTrack(this.playbackSession.currentMedia)) {
                        if (this._seekBar && !this._seekBar.isManipulating)
                            this._seekBar.metadataVisible = !this.playlistVisible;
                        if (this._metadataControl)
                            this._metadataControl.playlistButtonVisible = this._uiStateService.isSnapped;
                        if (this.playbackSession && this.playbackSession.currentMedia && this.playbackSession.currentMedia.hasServiceId && !this._uiStateService.nowPlayingTileVisible && !this._uiStateService.isFullScreenMusic)
                            this.resizeButtonVisible = true
                    }
                    this.updateCursorVisibility(true);
                    if (!this._useBranding || !showBranding)
                        this.showBackButton();
                    this._resetAutoHideTimer(false);
                    this._updateStates()
                }, updateBranding: function updateBranding(showBranding) {
                    if (!this.initialized)
                        return;
                    if (this._brandingShowPromise) {
                        this._brandingShowPromise.cancel();
                        this._brandingShowPromise = null
                    }
                    if (showBranding && this._useBranding && !this._uiStateService.nowPlayingTileVisible) {
                        if (!this.brandingVisible) {
                            this.hideBackButton(true);
                            this._brandingShowPromise = WinJS.Promise.timeout(500).then(function showBrandingDelayed() {
                                this.showBranding(true)
                            }.bind(this), function showBrandingDelayed(e) {
                                if (e.name !== "Canceled")
                                    this.showBranding(true)
                            }.bind(this))
                        }
                    }
                    else if (!this._uiStateService.isSnapped)
                        this.hideBranding(true);
                    else
                        this.hideBranding()
                }, hideBranding: function hideBranding(quickHide, forceShowBackButton) {
                    if (!this.initialized || !this._brandingContainer)
                        return WinJS.Promise.as();
                    this.brandingVisible = false;
                    var hidePromise = this._useBranding ? WinJS.Promise.timeout(500, MS.Entertainment.Utilities.hideElement(this._brandingContainer)) : WinJS.Promise.as();
                    if (!this._useBranding || quickHide)
                        this._brandingContainer.style.opacity = 0;
                    if (forceShowBackButton || (this._uiStateService.nowPlayingInset && !this._uiStateService.isSnapped))
                        return hidePromise.then(this.showBackButton, this.showBackButton);
                    return hidePromise
                }, showBranding: function showBranding(quickShow) {
                    if (!this.initialized || !this._brandingContainer)
                        return WinJS.Promise.as();
                    this._backButtonService.hideBackButton(true);
                    this.brandingVisible = true;
                    if (quickShow)
                        this._brandingContainer.style.opacity = 1;
                    return MS.Entertainment.Utilities.showElement(this._brandingContainer)
                }, hideBackButton: function hideBackButton(force) {
                    if (this._mainHeader && (force || this.brandingVisible || !this._uiStateService.nowPlayingInset))
                        this.backVisible = false;
                    this._updateStates()
                }, showBackButton: function showBackButton() {
                    if (!this._uiStateService.isSnapped && !this._uiStateService.nowPlayingTileVisible && !this.backVisible) {
                        if (this.playbackSession && MS.Entertainment.Platform.PlaybackHelpers.isMusicTrack(this.playbackSession.currentMedia) && this._isImmersiveNowPlaying())
                            this._backButtonService.showBackButton(true);
                        this.backVisible = true;
                        this._updateStates()
                    }
                }, showPlaylist: function showPlaylist() {
                    if (!this.playlistVisible) {
                        this.playlistVisible = true;
                        this.updateBranding(false);
                        MS.Entertainment.UI.Controls.MusicVisualization.freezeShapes();
                        var framePosition = WinJS.Utilities.getPosition(this._playlistControl);
                        var response = MS.Entertainment.UI.Controls.ImmersiveViewMore.showPopOver({
                                frame: {
                                    columnStyle: "immersivePlaylist", heading: String.load(String.id.IDS_HOME_NOW_PLAYING_LC), viewMoreHeading: String.load(String.id.IDS_HOME_NOW_PLAYING_LC)
                                }, framePosition: framePosition, userControl: "MS.Entertainment.UI.Controls.NowPlayingPlaylist", userControlOptions: {
                                        playbackSession: this.playbackSession, galleryTemplate: MS.Entertainment.UI.Controls.NowPlayingPlaylistTemplates.nowPlaying
                                    }
                            });
                        response.completionPromise.done(this.playlistClosed.bind(this), this.playlistClosed.bind(this));
                        this._playlistOverlay = response.viewMore;
                        this._resetAutoHideTimer(false);
                        this.updateCursorVisibility(true);
                        this._updateStates();
                        this.hideOpportunity(true)
                    }
                }, playlistClosed: function playlistClosed() {
                    this.playlistVisible = false;
                    MS.Entertainment.UI.Controls.MusicVisualization.thawShapes();
                    this._updateStates();
                    if (this._showOpportunityOnDismiss)
                        this.showOpportunity()
                }, hide: function hide() {
                    if (this.playlistVisible)
                        this.hideOverlays()
                }, updateCurrentOpportunity: function updateCurrentOpportunity(currentOpportunity) {
                    if (currentOpportunity && currentOpportunity.title) {
                        if (this._opportunityHidePromise) {
                            this._opportunityHidePromise.cancel();
                            this._opportunityHidePromise = null
                        }
                        this.currentOpportunity = currentOpportunity;
                        this.showOpportunity()
                    }
                    else
                        this.hideOpportunity()
                }, showOpportunity: function showOpportunity() {
                    if (!this.initialized)
                        return;
                    if (this.playlistVisible)
                        this._showOpportunityOnDismiss = true;
                    else if (this.playbackSession.currentMedia === null || this.playbackSession.duration === 0 || this.playbackSession.currentPosition < (this.playbackSession.duration - this._opportunityTrackEndThresholdMS)) {
                        this.opportunityVisible = true;
                        MS.Entertainment.Utilities.showElement(this._opportunityContainer)
                    }
                }, hideOpportunity: function hideOpportunity(showOnDismiss) {
                    if (!this.initialized)
                        return;
                    this._showOpportunityOnDismiss = showOnDismiss;
                    this.opportunityVisible = false;
                    MS.Entertainment.Utilities.hideElement(this._opportunityContainer);
                    this._opportunityHidePromise = WinJS.Promise.timeout(this._opportunityDelayTimeoutMS).then(function updateOpportunity() {
                        this.currentOpportunity = null;
                        this._opportunityHidePromise = null
                    }.bind(this))
                }, opportunityButtonClick: function opportunityButtonClick(e) {
                    if (this.currentOpportunity && this.currentOpportunity.action)
                        this.currentOpportunity.action.execute()
                }, _resetAutoHideTimer: function _resetAutoHideTimer(clear) {
                    if (this.autoHideTimeout) {
                        clearTimeout(this.autoHideTimeout);
                        this.autoHideTimeout = null
                    }
                    var autoHideDurationMs = this._uiSettings.messageDuration * 1000;
                    var timeoutMs = this.playlistVisible ? this.autoHidePlaylist : autoHideDurationMs;
                    var isHidden = !this.playlistVisible && !this.overlaysVisible && !this._uiStateService.appBarVisible && !this._uiStateService.isSettingsCharmVisible && !this.backVisible;
                    if (!clear && timeoutMs > 0 && !isHidden && !this._uiStateService.nowPlayingTileVisible)
                        this.autoHideTimeout = setTimeout(function nowPlayingAutoHide() {
                            if ((!this._seekBar || !this._seekBar.isManipulating) && (this._uiStateService.isSnapped || this._uiStateService.nowPlayingVisible))
                                this.hideOverlays()
                        }.bind(this), timeoutMs)
                }, _seekBarManipulatingChanged: function _seekBarManipulatingChanged() {
                    if (this.playbackSession && !MS.Entertainment.Platform.PlaybackHelpers.isMusicTrack(this.playbackSession.currentMedia))
                        this.seekBarManipulating = this._seekBar.isManipulating;
                    this.showOverlays()
                }, _mediaPositionChanged: function _mediaPositionChanged(e) {
                    var newVal = e.detail.newValue;
                    var oldVal = e.detail.oldValue;
                    if (this.frozen || !this.initialized)
                        return;
                    if (this.playbackSession && this.playbackSession.currentMedia && MS.Entertainment.Platform.PlaybackHelpers.isMusicTrack(this.playbackSession.currentMedia) && (this.playbackSession.targetTransportState !== MS.Entertainment.Platform.Playback.TransportState.unInitialize || this.playbackSession.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.stopped)) {
                        var durationMs = this.playbackSession.duration;
                        var positionMs = this.playbackSession.currentPosition;
                        var metadataClock = MS.Entertainment.Utilities.millisecondsToTimeCode(Math.min(durationMs, positionMs));
                        var duration = MS.Entertainment.Utilities.formatTimeString(durationMs);
                        var progress = MS.Entertainment.Utilities.formatTimeString(Math.min(durationMs, positionMs));
                        var progressText = String.load(String.id.IDS_PROGRESS_NAR).format(progress, duration);
                        var metadataDuration = MS.Entertainment.Utilities.millisecondsToTimeCode(durationMs);
                        this._metadataControl.durationText = metadataClock + "/" + metadataDuration
                    }
                    else
                        this._metadataControl.durationText = String.empty
                }, _mediaChanged: function _mediaChanged(e) {
                    var newVal = e.detail.newValue;
                    var oldVal = e.detail.oldValue;
                    if (!this.initialized)
                        return;
                    else if (this.frozen) {
                        this._mediaChangedWhileFrozen = true;
                        return
                    }
                    this.hideOpportunity();
                    this._metadataControl.modelItem = this.playbackSession.currentMedia;
                    WinJS.Utilities.addClass(this.domElement, "musicOverlay");
                    if (this._uiStateService.nowPlayingTileVisible && !this._uiStateService.isSnapped && !this.playbackSession.currentMedia)
                        WinJS.Utilities.addClass(this.domElement, "engage");
                    else if (this._uiStateService.isSnapped || !this._uiStateService.nowPlayingTileVisible)
                        WinJS.Utilities.removeClass(this.domElement, "engage");
                    if (newVal && (oldVal || this._uiStateService.nowPlayingTileVisible))
                        if (!oldVal)
                            WinJS.Promise.timeout(this._engageHideOffsetMS).then(function delayedShowOverlays() {
                                WinJS.Utilities.removeClass(this.domElement, "engage");
                                this.showOverlays(!this.transportControlsVisible)
                            }.bind(this));
                        else {
                            var showBranding = !this.transportControlsVisible || this._uiStateService.isSnapped;
                            this.showOverlays(showBranding)
                        }
                }, _mediaStateChanged: function _mediaStateChanged(e) {
                    var newVal = e.detail.newValue;
                    var oldVal = e.detail.oldValue;
                    if (this.frozen || !this.initialized)
                        return;
                    if (this._uiStateService.nowPlayingTileVisible)
                        this.showOverlays();
                    else if (newVal !== MS.Entertainment.Platform.Playback.TransportState.starting && oldVal)
                        this.showOverlays()
                }, _onPlaylistClicked: function _onPlaylistClicked() {
                    this.showPlaylist()
                }, _updateStates: function _updateStates() {
                    if (this._deferredUpdateTimer || this.frozen)
                        return;
                    this._deferredUpdateTimer = WinJS.Promise.timeout(MS.Entertainment.Platform.PlaybackHelpers.deferredUpdateTimeout).then(this._updateStatesDeferred.bind(this));
                    if (this._metadataControl)
                        this._metadataControl.playlistButtonVisible = this._uiStateService && this._uiStateService.isSnapped
                }, _updateStatesDeferred: function _updateStatesDeferred() {
                    this._deferredUpdateTimer = null;
                    if (!this.playbackSession || !this.initialized)
                        return;
                    var resizeButtonVisible = this.resizeButtonVisible;
                    this.overlaysVisible = (this._uiStateService.isSnapped || (!this.playlistVisible && MS.Entertainment.Platform.PlaybackHelpers.isMusicTrack(this.playbackSession.currentMedia)) || (!this.playlistVisible && this.overlaysVisible) || (this.playbackSession.isRemoteSession() && !MS.Entertainment.Utilities.isWindowsBlue && !MS.Entertainment.Platform.PlaybackHelpers.isMusicTrack(this.playbackSession.currentMedia)));
                    var showHeader = !this._isImmersiveNowPlaying() || (this.backVisible || this.overlaysVisible);
                    if (this._mainHeader && (!this.playbackSession || (!this._uiStateService.engageVisible && !MS.Entertainment.Platform.PlaybackHelpers.isMusicTrack(this.playbackSession.currentMedia))))
                        this._mainHeader.visibility = showHeader;
                    if (MS.Entertainment.Platform.PlaybackHelpers.isMusicTrack(this.playbackSession.currentMedia))
                        if (!this._isImmersiveNowPlaying() || (!this.brandingVisible && this.backVisible))
                            this._backButtonService.showBackButton(true);
                        else if (this._isImmersiveNowPlaying())
                            this._backButtonService.hideBackButton(true);
                    this.seekBarVisible = !this._uiStateService.isFullScreenMusic && !this._uiStateService.nowPlayingTileVisible && this.transportControlsVisible && !this.playlistVisible && this.playbackSession.duration > 0;
                    resizeButtonVisible = !this._uiStateService.isFullScreenMusic && !this._uiStateService.isSnapped && !this._uiStateService.nowPlayingTileVisible && ((!this.playlistVisible && this._uiStateService.nowPlayingInset && MS.Entertainment.Platform.PlaybackHelpers.isMusicTrack(this.playbackSession.currentMedia)) || (this.overlaysVisible && this.transportControlsVisible));
                    if (this.playbackSession.currentMedia && !this.playbackSession.currentMedia.hasServiceId && !MS.Entertainment.Platform.PlaybackHelpers.isMusicTrack(this.playbackSession.currentMedia)) {
                        this._uiStateService.nowPlayingInset = false;
                        resizeButtonVisible = false
                    }
                    this.resizeButtonVisible = !this._uiStateService.isSnapped && !this._uiStateService.nowPlayingTileVisible && !this._uiStateService.isFullScreenMusic && resizeButtonVisible;
                    this.resizeButtonIcon = this._uiStateService.nowPlayingInset ? MS.Entertainment.UI.Icon.fullScreen : MS.Entertainment.UI.Icon.screenNormal;
                    this._uiStateService.isFullScreenVideo = !this.frozen && !this._uiStateService.isSnapped && !this._uiStateService.appBarVisible && !this._uiStateService.isSettingsCharmVisible && !this.overlaysVisible
                }, _isImmersiveNowPlaying: function _isImmersiveNowPlaying() {
                    return !this._uiStateService.nowPlayingTileVisible && this._navigationService.currentPage && this._navigationService.currentPage.iaNode && this._navigationService.currentPage.iaNode.moniker === "immersiveDetails"
                }, _updateTransportControlsVisibility: function _updateTransportControlsVisibility(makeVisible) {
                    if (this.transportControlsVisible === makeVisible)
                        return;
                    this._updateMusicVisualizations(!makeVisible);
                    this.transportControlsVisible = makeVisible
                }, _updateMusicVisualizations: function _updateMusicVisualizations(enable) {
                    if (MS.Entertainment.Utilities.isMusicApp1 && window.clientInformation && window.clientInformation.cpuClass === "ARM")
                        if (this._uiStateService.isSnapped || (enable && !this._uiStateService.appBarVisible))
                            MS.Entertainment.UI.Controls.MusicVisualization.enableMusicVisualizations();
                        else
                            MS.Entertainment.UI.Controls.MusicVisualization.disableMusicVisualizations()
                }, _updateVisibility: function _updateVisibility(element, makeVisible) {
                    var timeout = 1500;
                    var domElement = element;
                    if (element && element.domElement)
                        domElement = element.domElement;
                    if (!domElement)
                        return WinJS.Promise.as();
                    if (makeVisible)
                        return MS.Entertainment.Utilities.showElement(domElement);
                    else
                        return MS.Entertainment.Utilities.hideElement(domElement, timeout).then(null, function onTimeout() {
                                WinJS.Utilities.addClass(domElement, "hideFromDisplay")
                            })
                }, overlaysVisible: {
                    get: function() {
                        return this._overlaysVisible
                    }, set: function(value) {
                            if (this._overlaysVisible !== value) {
                                this._overlaysVisible = value;
                                if (this._overlaysVisiblePromise) {
                                    this._overlaysVisiblePromise.cancel();
                                    this._overlaysVisiblePromise = null
                                }
                                this._overlaysVisiblePromise = this._updateVisibility(this._nowPlayingOverlayContainer, value).then(function clearPromise() {
                                    this._overlaysVisiblePromise = null
                                }.bind(this), function ignoreError(){})
                            }
                        }
                }, resizeButtonVisible: {
                    get: function() {
                        return this._resizeButtonVisible
                    }, set: function(value) {
                            if (this._resizeButtonVisible !== value) {
                                this._resizeButtonVisible = value;
                                if (this._resizeButtonVisiblePromise) {
                                    this._resizeButtonVisiblePromise.cancel();
                                    this._resizeButtonVisiblePromise = null
                                }
                                this._resizeButtonVisiblePromise = this._updateVisibility(this._resizeButton, value).then(function clearPromise() {
                                    this._resizeButtonVisiblePromise = null
                                }.bind(this), function ignoreError(){})
                            }
                        }
                }, seekBarVisible: {
                    get: function() {
                        return this._seekBarVisible
                    }, set: function(value) {
                            if (this._seekBarVisible !== value) {
                                this._seekBarVisible = value;
                                if (this._seekBarVisiblePromise) {
                                    this._seekBarVisiblePromise.cancel();
                                    this._seekBarVisiblePromise = null
                                }
                                this._seekBarVisiblePromise = this._updateVisibility(this._seekBar, value).then(function clearPromise() {
                                    this._seekBarVisiblePromise = null
                                }.bind(this), function ignoreError(){})
                            }
                        }
                }, transportControlsVisible: {
                    get: function() {
                        return this._transportControlsVisible
                    }, set: function(value) {
                            if (this._transportControlsVisible !== value) {
                                this._transportControlsVisible = value;
                                if (this._transportControlsVisiblePromise) {
                                    this._transportControlsVisiblePromise.cancel();
                                    this._transportControlsVisiblePromise = null
                                }
                                this._transportControlsVisiblePromise = this._updateVisibility(this._transportControls, value).then(function clearPromise() {
                                    this._transportControlsVisiblePromise = null
                                }.bind(this), function ignoreError(){})
                            }
                        }
                }
        }, {
            initialized: false, playbackSession: null, seekBarManipulating: false, brandingTitle: String.empty, brandingTitleIcon: String.empty, brandingVisible: false, playIconVisible: false, backVisible: true, playlistVisible: false, resizeButtonIcon: MS.Entertainment.UI.Icon.screenNormal, frozen: false, opportunityVisible: false, currentOpportunity: null, hideButtonClick: function hideButtonClick(event) {
                    this._uiStateService.nowPlayingInset = !this._uiStateService.nowPlayingInset;
                    if (!this.playlistVisible)
                        this.showOverlays();
                    event.cancelBubble = true
                }
        })})
})()
})();
