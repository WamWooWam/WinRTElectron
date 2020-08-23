/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Components/Playback/Controls/playbackcontrol.js", "/Components/Playback/playbackhelpers.js", "/Framework/corefx.js", "/Framework/imageloader.js", "/Framework/servicelocator.js", "/Framework/utilities.js");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {HomeNowPlayingTile: MS.Entertainment.UI.Framework.defineUserControl("/Controls/NowPlaying/HomeNowPlayingTile.html#template", function(element, options){}, {
            _initialized: false, _playbackSessionBinding: null, _bindings: null, _musicVisualizationControl: null, _frozen: false, _uiStateService: null, _deferredUpdateTimer: null, _musicVisualizationDelay: 0, _musicVisualizationCellSize: {
                    width: 75, height: 75
                }, _minArtistImageWidth: 500, initialize: function initialize() {
                    var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    this._uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                    this._playbackSessionBinding = WinJS.Binding.bind(this, {playbackSession: this._playbackSessionChanged.bind(this)});
                    this.playbackSession = sessionMgr.primarySession;
                    this._initialized = true;
                    this._updateStates()
                }, freeze: function freeze() {
                    this._frozen = true;
                    this._detachBindings();
                    MS.Entertainment.UI.Framework.UserControl.prototype.freeze.call(this)
                }, thaw: function thaw() {
                    MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this);
                    this._frozen = false;
                    this._playbackSessionChanged();
                    if (this.playbackSession) {
                        this._updateMetadata();
                        this._mediaPositionChanged(true)
                    }
                }, _detachBindings: function _detachBindings() {
                    if (this._bindings) {
                        this._bindings.cancel();
                        this._bindings = null
                    }
                }, unload: function unload() {
                    if (this._playbackSessionBinding) {
                        this._playbackSessionBinding.cancel();
                        this._playbackSessionBinding = null
                    }
                    if (this._deferredUpdateTimer) {
                        this._deferredUpdateTimer.cancel();
                        this._deferredUpdateTimer = null
                    }
                    this._detachBindings();
                    this._frozen = true;
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, _createNowPlayingVisualization: function _createNowPlayingVisualization() {
                    var container = document.createElement("div");
                    container.setAttribute("data-win-control", "MS.Entertainment.UI.Controls.MusicVisualization");
                    WinJS.Utilities.addClass(container, "nowPlayingTileBackground");
                    this._clearNowPlayingVisualization();
                    this._musicVisualizationControl = new MS.Entertainment.UI.Controls.MusicVisualization(this._musicVisualizationContainer.domElement.appendChild(container), {});
                    this._musicVisualizationControl.minArtistImageWidth = this._minArtistImageWidth
                }, _clearNowPlayingVisualization: function _clearNowPlayingVisualization() {
                    if (this._musicVisualizationControl) {
                        this._musicVisualizationControl.unload();
                        MS.Entertainment.Utilities.empty(this._musicVisualizationContainer.domElement);
                        this._musicVisualizationControl = null
                    }
                }, _playbackSessionChanged: function _playbackSessionChanged() {
                    if (this._frozen)
                        return;
                    this._detachBindings();
                    if (this.playbackSession)
                        this._bindings = WinJS.Binding.bind(this, {
                            playbackSession: {
                                currentTitleId: this._updateMetadata.bind(this), sessionState: this._updateStates.bind(this), playerState: this._updateStates.bind(this), currentMedia: this._updateMetadata.bind(this), currentTransportState: this._updateStates.bind(this), currentPosition: this._mediaPositionChanged.bind(this), duration: this._mediaPositionChanged.bind(this), lastPlayedMedia: this._updateMetadata.bind(this)
                            }, _uiStateService: {
                                    isSnapped: this._updateMetadata.bind(this), isFullScreenVideo: this._updateStatesDeferred.bind(this), primarySessionId: this._updateStates.bind(this)
                                }
                        });
                    this._updateStates()
                }, _updateMetadata: function _updateMetadata() {
                    var nowPlayingImageMediaItem = null;
                    if (this._frozen)
                        return;
                    var spotlightMedia = this.playbackSession.currentMedia;
                    if (MS.Entertainment.Utilities.useModalNowPlaying)
                        spotlightMedia = this.playbackSession.lastPlayedMedia;
                    if (spotlightMedia) {
                        if (MS.Entertainment.Platform.PlaybackHelpers.isMusicTrack(spotlightMedia)) {
                            if (!this._musicVisualizationControl)
                                if (this._musicVisualizationDelay)
                                    WinJS.Promise.timeout(this._musicVisualizationDelay).then(function createDelayedNowPlayingVisualization() {
                                        this._createNowPlayingVisualization();
                                        this._updateMusicVisualization()
                                    }.bind(this));
                                else
                                    this._createNowPlayingVisualization();
                            this._updateMusicVisualization()
                        }
                        else {
                            this.musicVisualizationVisible = false;
                            this._clearNowPlayingVisualization()
                        }
                        if (spotlightMedia.serviceId && MS.Entertainment.Platform.PlaybackHelpers.isMusicTrack(spotlightMedia) && spotlightMedia.artistServiceId !== MS.Entertainment.Utilities.EMPTY_GUID)
                            if ((!this.nowPlayingImageMediaItem) || (this.nowPlayingImageMediaItem.serviceId !== spotlightMedia.artistServiceId)) {
                                var artistMediaItem = MS.Entertainment.Data.augment({id: spotlightMedia.artistServiceId}, MS.Entertainment.Data.Augmenter.Marketplace.Music.Artist);
                                nowPlayingImageMediaItem = artistMediaItem
                            }
                            else
                                nowPlayingImageMediaItem = this.nowPlayingImageMediaItem;
                        else
                            nowPlayingImageMediaItem = spotlightMedia;
                        this.companionTileContentVisible = false;
                        this.fullBleedArtUrl = "";
                        this.fullBleedTileVisible = false;
                        if (!MS.Entertainment.Platform.PlaybackHelpers.isMusicTrack(spotlightMedia) && spotlightMedia.backgroundImageUri && !(!spotlightMedia.isGame && spotlightMedia.edsMediaItemTypeString === "XboxApp")) {
                            var pendingBackgroundImage = new Image;
                            pendingBackgroundImage.addEventListener("load", function imageLoaded(event) {
                                if (pendingBackgroundImage.naturalWidth > pendingBackgroundImage.naturalHeight) {
                                    this.fullBleedArtUrl = pendingBackgroundImage.src;
                                    this.fullBleedTileVisible = true
                                }
                                this.companionTileContentVisible = true
                            }.bind(this), false);
                            pendingBackgroundImage.addEventListener("error", function imageError(event) {
                                this.companionTileContentVisible = true
                            }.bind(this), false);
                            pendingBackgroundImage.setAttribute("src", spotlightMedia.backgroundImageUri)
                        }
                        else
                            this.companionTileContentVisible = true;
                        if (MS.Entertainment.Platform.PlaybackHelpers.isGame(spotlightMedia))
                            this.gameThumbnailVisible = true;
                        else
                            this.gameThumbnailVisible = false;
                        if (MS.Entertainment.Platform.PlaybackHelpers.isMovie(spotlightMedia))
                            this.movieThumbnailVisible = true;
                        else
                            this.movieThumbnailVisible = false;
                        if (MS.Entertainment.Platform.PlaybackHelpers.isTVEpisode(spotlightMedia)) {
                            this.tvThumbnailVisible = true;
                            if (spotlightMedia.seriesTitle)
                                this.metadataTitle = spotlightMedia.seriesTitle;
                            else if (spotlightMedia.ParentSeries)
                                this.metadataTitle = spotlightMedia.ParentSeries.Name;
                            else
                                this.metadataTitle = String.load(String.id.IDS_UNKNOWN_VALUE);
                            if (spotlightMedia.seasonNumber > -1 && spotlightMedia.episodeNumber && spotlightMedia.name)
                                this.metadataGenre = String.load(String.id.IDS_TV_NUMBERED_EPISODE_SEASON_TITLE).format(spotlightMedia.seasonNumber, spotlightMedia.episodeNumber, spotlightMedia.name);
                            else if (spotlightMedia.name)
                                this.metadataGenre = spotlightMedia.name;
                            else
                                this.metadataGenre = MS.Entertainment.Formatters.formatGenre(spotlightMedia)
                        }
                        else {
                            this.tvThumbnailVisible = false;
                            this.metadataTitle = spotlightMedia.name;
                            this.metadataGenre = MS.Entertainment.Formatters.formatGenre(spotlightMedia)
                        }
                        this.nowPlayingImageMediaItem = nowPlayingImageMediaItem;
                        this.metadataDuration = MS.Entertainment.Utilities.millisecondsToTimeCode(this.playbackSession.duration);
                        this.artVisible = spotlightMedia.primaryImageUri;
                        if (MS.Entertainment.Platform.PlaybackHelpers.isMusicTrack(spotlightMedia)) {
                            this.metadataArtist = MS.Entertainment.Formatters.formatAlbumAndArtistHelper(spotlightMedia);
                            if (spotlightMedia.AlbumName)
                                this.metadataSource = spotlightMedia.AlbumName
                        }
                    }
                    if (this.playbackSession._sessionState === "disconnected" && spotlightMedia && spotlightMedia.titleId === 0) {
                        this.metadataTitle = String.load(String.id.IDS_COMPANION_HOME_NOW_PLAYING_EMPTY_TITLE);
                        this.metadataGenre = String.load(String.id.IDS_COMPANION_HOME_NOW_PLAYING_EMPTY);
                        this.xboxXenonBackgroundVisible = true
                    }
                    else
                        this.xboxXenonBackgroundVisible = false;
                    if (!this.metadataTitle)
                        this.metadataTitle = String.load(String.id.IDS_UNKNOWN_VALUE);
                    if (!this.metadataGenre)
                        this.metadataGenre = String.empty;
                    this._updateStates()
                }, _updateMusicVisualization: function _updateMusicVisualization() {
                    if (this._musicVisualizationControl) {
                        this._musicVisualizationControl.mediaItem = this.playbackSession.currentMedia;
                        this._musicVisualizationControl.cellSize = this._musicVisualizationCellSize;
                        this.metadataSubTitle = this.playbackSession.currentMedia.artistName;
                        this.musicVisualizationVisible = true
                    }
                }, _mediaPositionChanged: function _mediaPositionChanged(forceUpdate) {
                    if (MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isFullScreenVideo || this.playbackSession.currentPosition === undefined)
                        return;
                    var durationMs = MS.Entertainment.Utilities.useModalNowPlaying ? this.playbackSession.lastPlayedDuration : this.playbackSession.duration;
                    var positionMs = MS.Entertainment.Utilities.useModalNowPlaying ? this.playbackSession.lastPlayedPosition : this.playbackSession.currentPosition;
                    this.progressMax = durationMs;
                    this.progressValue = Math.min(durationMs, positionMs);
                    if (forceUpdate || (this.playbackSession.currentTransportState !== MS.Entertainment.Platform.Playback.TransportState.paused && this.playbackSession.currentTransportState !== MS.Entertainment.Platform.Playback.TransportState.stopped))
                        this.metadataClock = this.seekBarPositionText = MS.Entertainment.Utilities.millisecondsToTimeCode(this.progressValue);
                    var duration = MS.Entertainment.Utilities.formatTimeString(this.progressMax);
                    var progress = MS.Entertainment.Utilities.formatTimeString(this.progressValue);
                    var progressText = String.load(String.id.IDS_PROGRESS_NAR).format(progress, duration);
                    this._progressBar.setAttribute("aria-valuetext", progressText);
                    this._progressBar.setAttribute("aria-label", progressText);
                    if (this._companionFullBleedProgressBar) {
                        this._companionFullBleedProgressBar.setAttribute("aria-valuetext", progressText);
                        this._companionFullBleedProgressBar.setAttribute("aria-label", progressText)
                    }
                    this.metadataDuration = MS.Entertainment.Utilities.millisecondsToTimeCode(durationMs);
                    this.metadataClockAndDuration = this.metadataClock + "/" + this.metadataDuration
                }, _canJoinRemote: function _canJoinRemote() {
                    return this.playbackSession.currentMedia && this.playbackSession.currentMedia.mediaType !== Microsoft.Entertainment.Queries.ObjectType.game
                }, _updateStates: function _updateStates() {
                    if (this._deferredUpdateTimer)
                        return;
                    this._deferredUpdateTimer = WinJS.Promise.timeout(250).then(this._updateStatesDeferred.bind(this))
                }, _updateStatesDeferred: function _updateStatesDeferred() {
                    this._deferredUpdateTimer = null;
                    if (!this.playbackSession || MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isFullScreenVideo)
                        return;
                    if (this.playbackSession.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.paused || this.playbackSession.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.stopped) {
                        this.playVisible = true;
                        this.errorVisible = false;
                        this.progressBarVisible = false
                    }
                    else if (this.playbackSession.playerState === MS.Entertainment.Platform.Playback.PlayerState.error) {
                        this.errorVisible = true;
                        this.playVisible = false;
                        this.progressBarVisible = false
                    }
                    else {
                        this.playVisible = false;
                        this.errorVisible = false;
                        this.progressBarVisible = true
                    }
                    var spotlightMedia = this.playbackSession.currentMedia;
                    var shouldBeHidden = this.playbackSession.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.stopped;
                    if (MS.Entertainment.Utilities.useModalNowPlaying) {
                        spotlightMedia = this.playbackSession.lastPlayedMedia;
                        shouldBeHidden = this.playbackSession.lastPlayedMedia === null
                    }
                    if (!MS.Entertainment.Utilities.isMusicApp && shouldBeHidden)
                        this.visible = false;
                    else if (!this.visible && spotlightMedia)
                        this.visible = true;
                    else if (!MS.Entertainment.Utilities.isMusicApp && this.visible && !spotlightMedia)
                        this.visible = false;
                    if (!MS.Entertainment.Platform.PlaybackHelpers.isMusicTrack(spotlightMedia))
                        if (MS.Entertainment.Utilities.useModalNowPlaying) {
                            this.metadataSubTitle = String.load(String.id.IDS_HOME_NOW_PLAYING_RESUME);
                            if (spotlightMedia)
                                this._homeNowPlayingTile.setAttribute("aria-label", String.load(String.id.IDS_HOME_NOW_PLAYING_RESUME_ARIA).format(this.metadataTitle));
                            else
                                this._homeNowPlayingTile.setAttribute("aria-label", String.load(String.id.IDS_HOME_NOW_PLAYING_RESUME))
                        }
                        else
                            this.metadataSubTitle = String.load(String.id.IDS_HOME_NOW_PLAYING);
                    this.clockVisible = true
                }
        }, {
            visible: false, isRemoteSession: false, clockVisible: false, companionTileContentVisible: false, fullBleedArtUrl: "", fullBleedTileVisible: false, xboxXenonBackgroundVisible: false, playVisible: false, errorVisible: false, progressBarVisible: false, artVisible: true, movieThumbnailVisible: false, tvThumbnailVisible: false, gameThumbnailVisible: false, playbackSession: null, nowPlayingImageMediaItem: null, metadataTitle: "", metadataSource: "", metadataSubTitle: "", metadataClock: "", metadataDuration: "", metadataClockAndDuration: "", metadataArtist: "", metadataGenre: "", musicVisualizationVisible: false, progressMax: 100, progressValue: 0, thumbnailClick: function thumbnailClick() {
                    var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    if (this.isRemoteSession) {
                        sessionMgr.setPrimarySession(this.playbackSession.sessionId);
                        MS.Entertainment.Platform.PlaybackHelpers.showImmersive(null, {sessionId: this.playbackSession.sessionId})
                    }
                    else {
                        if (!this.playbackSession.currentMedia && this.playbackSession.lastPlayedMedia)
                            MS.Entertainment.Platform.PlaybackHelpers.showImmersiveDetails(this.playbackSession.lastPlayedMedia, false, true, undefined, undefined, undefined, undefined, undefined, undefined, this.playbackSession.lastPlayedMedia.libraryId === -1 ? this.playbackSession.lastPlayedPosition : undefined);
                        else {
                            sessionMgr.setPrimarySession(this.playbackSession.sessionId);
                            this.playbackSession.targetTransportState = MS.Entertainment.Platform.Playback.TransportState.playing;
                            MS.Entertainment.Platform.PlaybackHelpers.showImmersive(null, {
                                sessionId: this.playbackSession.sessionId, startFullScreen: true
                            })
                        }
                        MS.Entertainment.Utilities.Telemetry.logPlayClicked(this.domElement.className)
                    }
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {HomeNowPlayingTileLarge: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.HomeNowPlayingTile", "/Controls/NowPlaying/HomeNowPlayingTile.html#templateLarge")});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {HomeNowPlayingTilePoster: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.HomeNowPlayingTile", "/Controls/NowPlaying/HomeNowPlayingTile.html#templatePoster")});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {HomeNowPlayingTileCompanion: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.HomeNowPlayingTile", "/Controls/NowPlaying/HomeNowPlayingTile.html#templatePosterCompanion")});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {HomeNowPlayingTileMusic: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.HomeNowPlayingTile", null, function homeNowPlayingTileMusicConstructor() {
            this.thumbnailClick = MS.Entertainment.Utilities.bindAndMarkSupportedForProcessing(this._thumbnailClick, this)
        }, {_thumbnailClick: function _thumbnailClick() {
                var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                switch (this.playbackSession.currentTransportState) {
                    case MS.Entertainment.Platform.Playback.TransportState.playing:
                        if (!MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isSnapped) {
                            sessionMgr.setPrimarySession(this.playbackSession.sessionId);
                            MS.Entertainment.Platform.PlaybackHelpers.showImmersive(null, {
                                sessionId: this.playbackSession.sessionId, startFullScreen: false
                            })
                        }
                        break;
                    case MS.Entertainment.Platform.Playback.TransportState.stopped:
                        if (this.playbackSession.playerState === MS.Entertainment.Platform.Playback.PlayerState.error)
                            MS.Entertainment.Platform.PlaybackHelpers.showPlaybackError(this.playbackSession.errorDescriptor);
                        else
                            this.playbackSession.playAt(0);
                        break;
                    default:
                        this.playbackSession.targetTransportState = MS.Entertainment.Platform.Playback.TransportState.playing;
                        break
                }
            }})});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {HomeNowPlayingTileMusicSnapped: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.HomeNowPlayingTileMusic", "/Controls/NowPlaying/HomeNowPlayingTile.html#templateMusicSnapped", function homeNowPlayingTileMusicSnapped() {
            this._musicVisualizationDelay = 1000
        }, {
            _musicVisualizationCellSize: {
                width: 50, height: 50
            }, _mediaPositionChanged: function _mediaPositionChanged(forceUpdate) {
                    var durationMs = this.playbackSession.duration;
                    var positionMs = this.playbackSession.currentPosition;
                    this.progressMax = durationMs;
                    this.progressValue = Math.min(durationMs, positionMs);
                    if (forceUpdate || (this.playbackSession.currentTransportState !== MS.Entertainment.Platform.Playback.TransportState.paused && this.playbackSession.currentTransportState !== MS.Entertainment.Platform.Playback.TransportState.stopped))
                        this.metadataClock = this.seekBarPositionText = MS.Entertainment.Utilities.millisecondsToTimeCode(this.progressValue) + "/" + MS.Entertainment.Utilities.millisecondsToTimeCode(durationMs);
                    var duration = MS.Entertainment.Utilities.formatTimeString(this.progressMax);
                    var progress = MS.Entertainment.Utilities.formatTimeString(this.progressValue);
                    var progressText = String.load(String.id.IDS_PROGRESS_NAR).format(progress, duration);
                    this._progressBar.setAttribute("aria-valuetext", progressText);
                    this._progressBar.setAttribute("aria-label", progressText);
                    if (this._companionFullBleedProgressBar) {
                        this._companionFullBleedProgressBar.setAttribute("aria-valuetext", progressText);
                        this._companionFullBleedProgressBar.setAttribute("aria-label", progressText)
                    }
                }
        })})
})()
