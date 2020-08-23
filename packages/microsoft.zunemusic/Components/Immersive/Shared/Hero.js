/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/debug.js", "/Framework/Utilities.js", "/Components/Immersive/Shared/BaseImmersiveSummary.js");
(function() {
    var MSEPlatform = WinJS.Namespace.define("MS.Entertainment.Platform", null);
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {ImmersiveHero: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.BaseImmersiveSummary", "/Components/Immersive/Shared/Hero.html#ImmersiveHero", function immersiveHero() {
            this.uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState)
        }, {
            controlName: "ImmersiveHero", _eventHandler: null, _playbackSessionBindings: null, _bindings: null, _dataContextHandlers: null, _uiStateServiceHandlers: null, _nowPlayingControl: null, _nowPlayingRemoveTimeout: 2000, uiStateService: null, pendingImage: null, initialize: function initialize() {
                    MS.Entertainment.UI.Controls.BaseImmersiveSummary.prototype.initialize.call(this);
                    if (this.dataContext.sessionId)
                        this._createNowPlayingControl();
                    this._uiStateServiceHandlers = MS.Entertainment.Utilities.addEvents(this.uiStateService, {nowPlayingInsetChanged: this.onNowPlayingInsetChanged.bind(this)});
                    this.onNowPlayingInsetChanged({detail: {newValue: this.uiStateService.nowPlayingInset}});
                    this._bindings = WinJS.Binding.bind(this, {
                        backgroundVisible: this._backgroundVisibleChangedHandler.bind(this), dataContext: {sessionId: this._sessionIdChanged.bind(this)}, uiStateService: {nowPlayingVisible: function nowPlayingVisibleChanged(newVal, oldVal) {
                                    var showNowPlaying = (newVal || MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.winJSNavigation)) && !!this.dataContext.sessionId;
                                    var showHeroContent = !showNowPlaying;
                                    if (!this.frozen && !this.backgroundVisible && (!newVal || this.dataContext.sessionId === MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.remoteLRC || (this.playbackSession && this.playbackSession.isRemoteSession()))) {
                                        this._loadBackgroundImage();
                                        this._updateSecondaryText()
                                    }
                                    if (!this.frozen) {
                                        if (this.nowPlayingControlContainer)
                                            this.nowPlayingControlContainer.visibility = showNowPlaying;
                                        this._heroContent.visibility = showHeroContent;
                                        if (showNowPlaying)
                                            this._checkNowPlaying();
                                        else
                                            this._removeNowPlayingControl()
                                    }
                                }.bind(this)}
                    });
                    this._dataContextHandlers = MS.Entertainment.Utilities.addEvents(this.dataContext, {showplaylist: this._showPlaylist.bind(this)});
                    this.uiStateService.nowPlayingVisible = this._shouldShowNowPlaying()
                }, freeze: function immersiveHero_freeze() {
                    this.frozen = true;
                    if (this.uiStateService.isAppVisible) {
                        this.backgroundVisible = false;
                        this.playbackSession = null;
                        this._playbackSessionChanged();
                        this.uiStateService.nowPlayingVisible = false
                    }
                    MS.Entertainment.UI.Controls.BaseImmersiveSummary.prototype.freeze.call(this)
                }, thaw: function immersiveHero_thaw() {
                    MS.Entertainment.UI.Controls.BaseImmersiveSummary.prototype.thaw.call(this);
                    if (this.backgroundImageUri || this.backgroundFallbackImageUri)
                        this.backgroundVisible = true;
                    this.frozen = false;
                    if (this.dataContext.sessionId)
                        this._sessionIdChanged(this.dataContext.sessionId);
                    this.uiStateService.nowPlayingVisible = this._shouldShowNowPlaying();
                    if (!this.uiStateService.nowPlayingVisible) {
                        this._loadBackgroundImage();
                        this._updateSecondaryText();
                        this._removeNowPlayingControl()
                    }
                }, unload: function unload() {
                    if (this.dataContext.dispose)
                        this.dataContext.dispose();
                    if (this._uiStateServiceHandlers) {
                        this._uiStateServiceHandlers.cancel();
                        this._uiStateServiceHandlers = null
                    }
                    if (this._dataContextHandlers) {
                        this._dataContextHandlers.cancel();
                        this._dataContextHandlers = null
                    }
                    this._detachBindings();
                    if (this.dataContext.sessionId)
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.nowPlayingControlManager).releaseNowPlayingControl(this.dataContext.sessionId);
                    MS.Entertainment.UI.Controls.BaseImmersiveSummary.prototype.unload.call(this)
                }, onNowPlayingInsetChanged: function onNowPlayingInsetChanged(e) {
                    var newVal = e.detail.newValue;
                    var oldVal = e.detail.oldValue;
                    if (!this.frozen) {
                        this.frame.isFullScreen = !newVal;
                        if (newVal && this.playbackSession && this.playbackSession.currentMedia && !this.playbackSession.currentMedia.hasServiceId && !MS.Entertainment.Platform.PlaybackHelpers.isMusicTrack(this.playbackSession.currentMedia))
                            if (this.playbackSession.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.playing)
                                this.uiStateService.nowPlayingInset = false;
                            else
                                MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).navigateBack();
                        if (newVal) {
                            if (this.nowPlayingControlContainer && this.nowPlayingControlContainer.domElement)
                                WinJS.Utilities.removeClass(this.nowPlayingControlContainer.domElement, "fullScreen")
                        }
                        else if (this.nowPlayingControlContainer && this.nowPlayingControlContainer.domElement)
                            WinJS.Utilities.addClass(this.nowPlayingControlContainer.domElement, "fullScreen")
                    }
                }, _showPlaylist: function _showPlaylist() {
                    if (!this.playlistHost.visibility) {
                        var text = this.dataContext.isMarketplace ? String.load(String.id.IDS_DETAILS_TOP_SONGS) : String.load(String.id.IDS_MUSIC_SONGS_IN_COLLECTION);
                        var framePosition = WinJS.Utilities.getPosition(this.playlistHost.domElement);
                        var showPopOverResult = MS.Entertainment.UI.Controls.ImmersiveViewMore.showPopOver({
                                frame: {
                                    columnStyle: "immersivePlaylist", heading: text, viewMoreHeading: text
                                }, framePosition: framePosition, userControl: "MS.Entertainment.UI.Controls.NowPlayingPlaylist", userControlOptions: {
                                        dataSource: this.dataContext.playlist, playbackItemSource: this.dataContext.playbackItemSource, galleryTemplate: MS.Entertainment.UI.Controls.NowPlayingPlaylistTemplates.nowPlaying
                                    }
                            });
                        var uiStateEventHandler = MS.Entertainment.Utilities.addEventHandlers(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState), {isSnappedChanged: function isSnappedChanged(e) {
                                    if (e.detail.newValue && showPopOverResult && showPopOverResult.viewMore)
                                        showPopOverResult.viewMore.hide()
                                }});
                        showPopOverResult.completionPromise.then(null, function ignoreError(){}).done(function viewMorePopoverHidden() {
                            if (uiStateEventHandler) {
                                uiStateEventHandler.cancel();
                                uiStateEventHandler = null
                            }
                            showPopOverResult = null
                        }.bind(this))
                    }
                }, _removeNowPlayingControl: function _removeNowPlayingControl() {
                    if (!this._nowPlayingControl)
                        return;
                    if (this.dataContext.sessionId)
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.nowPlayingControlManager).releaseNowPlayingControl(this.dataContext.sessionId);
                    if (this.nowPlayingControlContainer && this.nowPlayingControlContainer.domElement)
                        MS.Entertainment.Utilities.empty(this.nowPlayingControlContainer.domElement);
                    this.uiStateService.nowPlayingVisible = false;
                    this._nowPlayingControl = null;
                    this.frame.isFullScreen = false
                }, _sessionIdChanged: function _sessionIdChanged(newVal, oldVal) {
                    if (!newVal)
                        return;
                    if (oldVal) {
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.nowPlayingControlManager).releaseNowPlayingControl(oldVal);
                        this._nowPlayingControl = null
                    }
                    var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    this.playbackSession = sessionMgr.getSession(this.dataContext.sessionId);
                    this._playbackSessionChanged()
                }, _detachBindings: function _detachBindings() {
                    this._detachPlaybackSessionBindings();
                    if (this._bindings) {
                        this._bindings.cancel();
                        this._bindings = null
                    }
                }, _detachPlaybackSessionBindings: function _detachPlaybackSessionBindings() {
                    if (this._playbackSessionBindings) {
                        this._playbackSessionBindings.cancel();
                        this._playbackSessionBindings = null
                    }
                }, _playbackSessionChanged: function playbackSessionChanged() {
                    this._detachPlaybackSessionBindings();
                    if (this.playbackSession)
                        this._playbackSessionBindings = WinJS.Binding.bind(this, {playbackSession: {
                                currentMedia: this._mediaStateChanged.bind(this), currentTransportState: this._mediaStateChanged.bind(this), canControlMedia: this._mediaStateChanged.bind(this), playerState: this._playerStateChanged.bind(this)
                            }});
                    else
                        this._removeNowPlayingControl()
                }, _createNowPlayingControl: function _createNowPlayingControl() {
                    if (this._nowPlayingControl || !this.nowPlayingControlContainer)
                        return false;
                    this._nowPlayingControl = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.nowPlayingControlManager).getNowPlayingControl(this.dataContext.sessionId);
                    this.nowPlayingControlContainer.domElement.appendChild(this._nowPlayingControl.domElement);
                    return true
                }, _startNowPlaying: function _startNowPlaying() {
                    if (this._nowPlayingControl && this._nowPlayingControl.initialized) {
                        this._nowPlayingControl.playbackSession = this.playbackSession;
                        this._nowPlayingControl.repossessNowPlaying();
                        var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                        sessionMgr.setPrimarySession(this.dataContext.sessionId);
                        if (this.nowPlayingControlContainer && this.nowPlayingControlContainer.domElement)
                            WinJS.Utilities.removeClass(this.nowPlayingControlContainer.domElement, "hideFromDisplay");
                        if (MS.Entertainment.Platform.PlaybackHelpers.isMusicTrack(this.playbackSession.currentMedia)) {
                            if (this.nowPlayingControlContainer && this.nowPlayingControlContainer.domElement)
                                WinJS.Utilities.addClass(this.nowPlayingControlContainer.domElement, "musicTrack")
                        }
                        else if (this.nowPlayingControlContainer && this.nowPlayingControlContainer.domElement)
                            WinJS.Utilities.removeClass(this.nowPlayingControlContainer.domElement, "musicTrack")
                    }
                }, _checkNowPlaying: function _checkNowPlaying() {
                    var shouldShowNowPlaying = this._shouldShowNowPlaying();
                    if (this.playbackSession && (this._isPreloadedMedia() || this.playbackSession.playerState !== MS.Entertainment.Platform.Playback.PlayerState.notReady) && shouldShowNowPlaying) {
                        this.uiStateService.nowPlayingVisible = true;
                        if (this._createNowPlayingControl() || (this._nowPlayingControl && !this._nowPlayingControl.initialized))
                            this._nowPlayingControl.bind("initialized", function initializedChanged(newVal) {
                                if (newVal) {
                                    this._startNowPlaying();
                                    this._updateNowPlaying(shouldShowNowPlaying);
                                    this.onNowPlayingInsetChanged({detail: {newValue: this.uiStateService.nowPlayingInset}})
                                }
                            }.bind(this));
                        else {
                            this._startNowPlaying();
                            this._updateNowPlaying(shouldShowNowPlaying);
                            this.onNowPlayingInsetChanged({detail: {newValue: this.uiStateService.nowPlayingInset}})
                        }
                    }
                }, _updateNowPlaying: function _updateNowPlaying(shouldShowNowPlaying) {
                    if (this.nowPlayingControlContainer && this.nowPlayingControlContainer.domElement)
                        if (this.playbackSession && MS.Entertainment.Platform.PlaybackHelpers.isMusicTrack(this.playbackSession.currentMedia))
                            WinJS.Utilities.addClass(this.nowPlayingControlContainer.domElement, "musicTrack");
                        else if (this.nowPlayingControlContainer && this.nowPlayingControlContainer.domElement)
                            WinJS.Utilities.removeClass(this.nowPlayingControlContainer.domElement, "musicTrack");
                    if (this.uiStateService.nowPlayingVisible && !shouldShowNowPlaying)
                        WinJS.Promise.timeout(this._nowPlayingRemoveTimeout).then(function _delay() {
                            if (!this.frozen)
                                this.uiStateService.nowPlayingVisible = this._shouldShowNowPlaying()
                        }.bind(this));
                    else
                        this.uiStateService.nowPlayingVisible = shouldShowNowPlaying
                }, _playerStateChanged: function _playerStateChanged(newVal, oldVal) {
                    if (!newVal || this.frozen || this.uiStateService.isSnapped)
                        return;
                    if (newVal === MS.Entertainment.Platform.Playback.PlayerState.error && oldVal !== undefined) {
                        if (!this.uiStateService.isSnapped)
                            this.uiStateService.nowPlayingInset = true;
                        this.frame.isFullScreen = false
                    }
                    else if (newVal === MS.Entertainment.Platform.Playback.PlayerState.notReady && oldVal !== undefined)
                        WinJS.Promise.timeout(this._nowPlayingRemoveTimeout).then(function _delay() {
                            if (!this.frozen && this.playbackSession && this.playbackSession.playerState === newVal === MS.Entertainment.Platform.Playback.PlayerState.notReady)
                                this._removeNowPlayingControl()
                        }.bind(this));
                    else
                        this._checkNowPlaying()
                }, _mediaStateChanged: function _mediaStateChanged(newVal, oldVal) {
                    if (!newVal || this.frozen)
                        return;
                    this._checkNowPlaying()
                }, _backgroundVisibleChangedHandler: function _backgroundVisibleChangedHandler(newVal, oldVal) {
                    if (this._heroContent)
                        if (newVal && !this.uiStateService.nowPlayingVisible)
                            MS.Entertainment.Utilities.showElement(this._heroContent.domElement);
                        else
                            MS.Entertainment.Utilities.hideElement(this._heroContent.domElement)
                }, _shouldShowNowPlaying: function _shouldShowNowPlaying() {
                    var setNowPlayingVisible = false;
                    var isMusicTrack = this.playbackSession && (MS.Entertainment.Platform.PlaybackHelpers.isMusicTrack(this.playbackSession.currentMedia) && (MS.Entertainment.Platform.PlaybackHelpers.isMusicOrMusicVideo(this.dataContext.mediaItem) || MS.Entertainment.Platform.PlaybackHelpers.isMusicArtist(this.dataContext.mediaItem)));
                    var validNowPlayingTransportState = this.playbackSession && (this.playbackSession.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.starting || (this.playbackSession.targetTransportState !== MS.Entertainment.Platform.Playback.TransportState.stopped && this.playbackSession.playerState !== MS.Entertainment.Platform.Playback.PlayerState.notReady));
                    var useNewMusicPage = MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.winJSNavigation);
                    if (this.playbackSession && this.playbackSession.currentMedia)
                        if (isMusicTrack && (this.uiStateService.isSnapped || this._isPreloadedMedia() || validNowPlayingTransportState || useNewMusicPage))
                            setNowPlayingVisible = true;
                        else if (this.playbackSession.canControlMedia)
                            if (this.playbackSession.currentMedia.isEqual(this.dataContext.mediaItem))
                                setNowPlayingVisible = true;
                    return setNowPlayingVisible && !this.frozen
                }, _loadFallbackBackgroundImage: function _loadFallbackBackgroundImage() {
                    this.backgroundImageUri = null
                }, _loadBackgroundImage: function _loadBackgroundImage() {
                    var promise;
                    if (this.dataContext.mediaItem.hydrate)
                        promise = this.dataContext.mediaItem.hydrate();
                    else
                        promise = WinJS.Promise.as();
                    promise.done(function onMediaItemHydrate() {
                        if (this.dataContext.mediaItem.backgroundImageUri) {
                            var imageUrl = MS.Entertainment.Utilities.UriFactory.appendQuery(this.dataContext.mediaItem.backgroundImageUri, {format: MS.Entertainment.ImageFormat.png});
                            MS.Entertainment.UI.Shell.ImageLoader.cacheImage(imageUrl, String.empty).done(function cacheImage(url) {
                                this.backgroundImageUri = url
                            }.bind(this), function useDefaultImage() {
                                this.backgroundImageUri = String.empty
                            }.bind(this))
                        }
                        else
                            this._loadFallbackBackgroundImage();
                        if (this.dataContext.mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.person)
                            this.mediaTypeClassName = "mediatype-artist";
                        else
                            this.mediaTypeClassName = String.empty;
                        if (this.domElement)
                            WinJS.Utilities.addClass(this.domElement, this.mediaTypeClassName)
                    }.bind(this), this._loadFallbackBackgroundImage.bind(this))
                }, _updateSecondaryText: function _updateSecondaryText() {
                    if (this.dataContext.mediaItem.primaryGenre)
                        this.secondaryText = this.dataContext.mediaItem.primaryGenre;
                    else if (this.dataContext.mediaItem.genre)
                        this.secondaryText = MS.Entertainment.Formatters.formatGenre(this.dataContext.mediaItem);
                    else
                        this.secondaryText = String.empty
                }, _isPreloadedMedia: function _isPreloadedMedia() {
                    return (MS.Entertainment.Utilities.isMusicApp && this.playbackSession.currentMedia !== null && this.playbackSession.currentOrdinal === null)
                }, _handleActionsReady: function _handleActionsReady(event) {
                    if (MS.Entertainment.Utilities.isApp2 && MS.Entertainment.UI.Framework.canMoveFocus(event.srcElement))
                        MS.Entertainment.UI.Framework.focusFirstInSubTree(event.srcElement)
                }
        }, {
            backgroundImageUri: String.empty, backgroundFallbackImageUri: null, backgroundVisible: false, mediaTypeClassName: String.empty, showStartingAnimation: false, secondaryText: "", playbackSession: null, frozen: false, showGenericIcon: false, smartBuyStateEngine: null
        }, {loadBackgroundImage: MS.Entertainment.Utilities.weakElementBindingInitializer(function loadBackgroundImage(value, destination, destinationProperty, source) {
                if (source.backgroundImageUri === String.empty) {
                    source.backgroundVisible = false;
                    return
                }
                MS.Entertainment.Utilities.empty(destination);
                source.pendingImage = new Image;
                var events;
                var doAddImage = function doAddImage(imageUri) {
                        destination.setAttribute("src", imageUri);
                        source.backgroundVisible = true;
                        source.pendingImage = null;
                        events.cancel()
                    };
                var handleFailedImage = function handleFailedImage() {
                        WinJS.Utilities.addClass(destination, "hidden");
                        MS.Entertainment.UI.Shell.ImageLoader.getServiceImageUrl(source.dataContext.mediaItem).then(function getUrl(url) {
                            switch (url) {
                                case MS.Entertainment.UI.Shell.ImageLoader.MediaDefaultUrls.artist:
                                    url = MS.Entertainment.UI.ImagePaths.genericMusicL3Hero;
                                    source.showGenericIcon = true;
                                    break;
                                default:
                                    source.showGenericIcon = false;
                                    break
                            }
                            source.backgroundFallbackImageUri = "url(" + url + ")";
                            source.backgroundVisible = true;
                            source.pendingImage = null
                        }.bind(this))
                    };
                var events = MS.Entertainment.Utilities.addEvents(source.pendingImage, {
                        load: function imageLoaded() {
                            if (source.pendingImage.width >= source.pendingImage.height && source.pendingImage.width >= 500)
                                doAddImage(source.pendingImage.src);
                            else
                                handleFailedImage()
                        }, error: function imageFailed() {
                                handleFailedImage()
                            }
                    });
                source.pendingImage.setAttribute("src", source.backgroundImageUri)
            })})})
})()
