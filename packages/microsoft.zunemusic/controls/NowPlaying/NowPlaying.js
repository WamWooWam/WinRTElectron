/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {
        NowPlaying: MS.Entertainment.UI.Framework.defineUserControl("/Controls/NowPlaying/NowPlaying.html#nowPlayingTemplate", function(element, options){}, {
            hostAudioVideoControl: true, _mediaStoppedTimeout: 1500, _mediaStoppedGoBackTimeout: 10000, _uiStateService: MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState), _bindings: null, _eventHandlers: null, _musicVisualizationControl: null, _musicVisualizationBindings: null, _nowPlayingOverlaysControl: null, _shareOperation: null, _sessionMgr: null, _deferredUpdateTimer: null, _pointerHandlers: null, _freezeDelayPromise: null, _navigateBackOnUnSnap: false, _seekBarManipulatingChangedBound: null, _uiStateEventHandlers: null, _nowPlayingViewModel: null, _playbackSessionHandler: null, _freezeDelayTimerMS: 1000, suppressUnload: true, initialize: function initialize() {
                    this._sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    if (MS.Entertainment.Utilities.isMusicApp2)
                        this._nowPlayingViewModel = new MS.Entertainment.ViewModels.Music2NowPlayingVisualizationViewModel;
                    this._playbackSessionHandler = WinJS.Binding.bind(this, {playbackSession: this._playbackSessionChanged.bind(this)});
                    if (!this.hostAudioVideoControl) {
                        var uiState = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                        this._uiStateEventHandlers = MS.Entertainment.Utilities.addEventHandlers(uiState, {primarySessionIdChanged: this._primarySessionIdChanged.bind(this)});
                        this._primarySessionIdChanged()
                    }
                    if ((MS.Entertainment.Utilities.isMusicApp2 && !this.hostAudioVideoControl) || (MS.Entertainment.Utilities.isMusicApp1 && (this._uiStateService.nowPlayingTileVisible || this._uiStateService.isSnapped))) {
                        this._createOverlays();
                        this._updatePointerHandlers()
                    }
                    this.initialized = true
                }, onReparented: function onReparented() {
                    if (this._nowPlayingOverlaysControl && this._nowPlayingOverlaysControl.onReparented)
                        this._nowPlayingOverlaysControl.onReparented()
                }, nowPlayingMouseDown: function nowPlayingMouseDown(event) {
                    if (this._nowPlayingOverlaysControl)
                        this._nowPlayingOverlaysControl.nowPlayingMouseDown(event)
                }, nowPlayingMouseUp: function nowPlayingMouseUp(event) {
                    if (this._nowPlayingOverlaysControl && this._nowPlayingOverlaysControl.nowPlayingMouseUp)
                        this._nowPlayingOverlaysControl.nowPlayingMouseUp(event)
                }, nowPlayingMouseMove: function nowPlayingMouseMove(event) {
                    if (this._nowPlayingOverlaysControl)
                        this._nowPlayingOverlaysControl.nowPlayingMouseMove(event)
                }, nowPlayingMouseHover: function nowPlayingMouseHover(event) {
                    if (this._nowPlayingOverlaysControl && this._nowPlayingOverlaysControl.nowPlayingMouseHover)
                        this._nowPlayingOverlaysControl.nowPlayingMouseHover(event)
                }, nowPlayingClick: function nowPlayingClick(event) {
                    if ((!this._uiStateService.nowPlayingTileVisible || !event) && this._nowPlayingOverlaysControl && this._nowPlayingOverlaysControl.nowPlayingClick)
                        this._nowPlayingOverlaysControl.nowPlayingClick(event)
                }, _nowPlayingTileVisibleChanged: function _nowPlayingTileVisibleChanged() {
                    if (this._nowPlayingContainer)
                        if (this._uiStateService.nowPlayingTileVisible)
                            this._nowPlayingContainer.setAttribute("role", "button");
                        else
                            this._nowPlayingContainer.removeAttribute("role")
                }, _fullScreenVideoChanged: function _fullScreenVideoChanged(isFullScreenVideo) {
                    if (this.playbackSession && MS.Entertainment.Utilities.isVideoApp)
                        if (isFullScreenVideo && MS.Entertainment.Utilities.isVideoApp1) {
                            if (!this.playbackSession.closedCaptionsOn)
                                this.playbackSession.disableTimeUpdate()
                        }
                        else {
                            this.playbackSession.forceTimeUpdate();
                            this.playbackSession.enableTimeUpdate()
                        }
                }, _updatePointerHandlers: function _updatePointerHandlers() {
                    if (!this._pointerHandlers && this._nowPlayingContainer) {
                        var handlePointerDown = this.nowPlayingMouseDown.bind(this);
                        var handlePointerUp = this.nowPlayingMouseUp.bind(this);
                        var handlePointerMove = this.nowPlayingMouseMove.bind(this);
                        var handlePointerHover = this.nowPlayingMouseHover.bind(this);
                        this._pointerHandlers = MS.Entertainment.Utilities.addEventHandlers(this._nowPlayingContainer, {
                            MSPointerDown: handlePointerDown, pointerdown: handlePointerDown, MSPointerUp: handlePointerUp, pointerup: handlePointerUp, MSPointerMove: handlePointerMove, pointermove: handlePointerMove, MSPointerHover: handlePointerHover, pointerhover: handlePointerHover, click: this.nowPlayingClick.bind(this)
                        })
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
                }, freeze: function freeze() {
                    if (this.frozen) {
                        MS.Entertainment.UI.Framework.UserControl.prototype.freeze.call(this);
                        return
                    }
                    if (this._freezeDelayPromise) {
                        this._freezeDelayPromise.cancel();
                        this._freezeDelayPromise = null
                    }
                    this._freezeDelayPromise = WinJS.Promise.timeout(this._freezeDelayTimerMS).then(function freezeControl() {
                        WinJS.Utilities.addClass(this.domElement, "removeFromDisplay");
                        this._suspendControl();
                        this.frozen = true;
                        this._freezeDelayPromise = null
                    }.bind(this));
                    MS.Entertainment.UI.Framework.UserControl.prototype.freeze.call(this)
                }, thaw: function thaw() {
                    WinJS.Utilities.removeClass(this.domElement, "removeFromDisplay");
                    MS.Entertainment.Utilities.showElement(this.domElement);
                    if (this._freezeDelayPromise) {
                        this._freezeDelayPromise.cancel();
                        this._freezeDelayPromise = null;
                        if (!this._pointerHandlers)
                            this._updatePointerHandlers();
                        MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this);
                        return
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this);
                    if (this.frozen) {
                        this.frozen = false;
                        this._updatePointerHandlers();
                        if (!this._nowPlayingOverlaysControl && this._initialized) {
                            this._createOverlays();
                            this._nowPlayingOverlaysControl.playbackSession = this.playbackSession
                        }
                        this._playbackSessionChanged()
                    }
                }, _suspendControl: function _suspendControl() {
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isFullScreenVideo = false;
                    if (this.playbackSession && MS.Entertainment.Utilities.isVideoApp) {
                        this.playbackSession.forceTimeUpdate();
                        this.playbackSession.enableTimeUpdate()
                    }
                    if (this._pointerHandlers) {
                        this._pointerHandlers.cancel();
                        this._pointerHandlers = null
                    }
                    this._cancelShareMedia();
                    this._detachBindings()
                }, unload: function unload() {
                    this.initialized = false;
                    if (this._deferredUpdateTimer) {
                        this._deferredUpdateTimer.cancel();
                        this._deferredUpdateTimer = null
                    }
                    this._suspendControl();
                    if (this._musicVisualizationBindings) {
                        this._musicVisualizationBindings.cancel();
                        this._musicVisualizationBindings = null
                    }
                    if (this._musicVisualizationControl) {
                        this._musicVisualizationControl.unload();
                        this._musicVisualizationControl = null
                    }
                    if (this._seekBarManipulatingChangedBound) {
                        this._nowPlayingOverlaysControl.unbind("seekBarManipulating", this._seekBarManipulatingChangedBound);
                        this._seekBarManipulatingChangedBound = null
                    }
                    if (this._uiStateEventHandlers) {
                        this._uiStateEventHandlers.cancel();
                        this._uiStateEventHandlers = null
                    }
                    if (this._nowPlayingViewModel) {
                        this._nowPlayingViewModel.dispose();
                        this._nowPlayingViewModel = null
                    }
                    if (this._nowPlayingOverlaysControl) {
                        this._nowPlayingOverlaysControl.unload();
                        this._nowPlayingOverlaysControl = null
                    }
                    if (this._playbackSessionHandler) {
                        this._playbackSessionHandler.cancel();
                        this._playbackSessionHandler = null
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, _primarySessionIdChanged: function _primarySessionIdChanged(newValue) {
                    this.playbackSession = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager).primarySession
                }, _playbackSessionChanged: function _playbackSessionChanged() {
                    this._detachBindings();
                    if (this.playbackSession) {
                        this._eventHandlers = MS.Entertainment.Utilities.addEvents(this.playbackSession, {
                            currentMediaChanged: this._mediaChanged.bind(this), currentTransportStateChanged: this._mediaStateChanged.bind(this)
                        });
                        this._mediaChanged();
                        this._mediaStateChanged({detail: {newValue: this.playbackSession.currentTransportState}});
                        this._bindings = WinJS.Binding.bind(this, {
                            enableShare: this._shareMedia.bind(this), _uiStateService: {
                                    isFullScreenVideo: this._fullScreenVideoChanged.bind(this), nowPlayingTileVisible: this._nowPlayingTileVisibleChanged.bind(this), isSnapped: function isSnappedChanged(newVal, oldVal) {
                                            if (this._navigateBackOnUnSnap && !newVal) {
                                                MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).navigateBack();
                                                this._navigateBackOnUnSnap = false
                                            }
                                        }.bind(this)
                                }
                        })
                    }
                    if (this._nowPlayingOverlaysControl)
                        this._nowPlayingOverlaysControl.playbackSession = this.playbackSession;
                    this._updateStates()
                }, repossessNowPlaying: function repossessNowPlaying() {
                    if (MS.Entertainment.Utilities.isMusicApp)
                        return;
                    if (this.hostAudioVideoControl && this._playbackContainer && this._playbackContainer.domElement && this._playbackContainer.domElement.children.length === 0)
                        this._sessionMgr.relocateSession(this._playbackContainer.domElement, false);
                    this._mediaChanged();
                    if (((MS.Entertainment.Utilities.isMusicApp2 && !this.hostAudioVideoControl) || (MS.Entertainment.Utilities.isMusicApp1 && (this._uiStateService.nowPlayingTileVisible || this._uiStateService.isSnapped))) || !this._nowPlayingOverlaysControl) {
                        this._createOverlays();
                        this._nowPlayingOverlaysControl.playbackSession = this.playbackSession
                    }
                }, _mediaChanged: function _mediaChanged(e) {
                    if (this.frozen || this._unloaded)
                        return;
                    if (MS.Entertainment.Platform.PlaybackHelpers.isMusicTrackOrMusicVideo(this.playbackSession.currentMedia) || this._uiStateService.nowPlayingTileVisible) {
                        this._updateNowPlayingArt();
                        this.videoVisible = false;
                        this.musicVisualizationVisible = true
                    }
                    else {
                        if (this._playbackContainer && this._playbackContainer.domElement)
                            WinJS.Utilities.removeClass(this._playbackContainer.domElement, "hideFromDisplay");
                        this.videoVisible = true;
                        this.musicVisualizationVisible = false;
                        if (this._musicVisualizationControl)
                            this._musicVisualizationControl.albumIdList = null
                    }
                    this._shareMedia()
                }, _createOverlays: function _createOverlays() {
                    if (this._nowPlayingOverlaysContainer) {
                        var controlElement = document.createElement("div");
                        if (window.onNewVideoPage) {
                            controlElement.setAttribute("data-win-control", "MS.Entertainment.UI.Controls.VideoWinNowPlayingOverlays");
                            this._nowPlayingOverlaysContainer.domElement.appendChild(controlElement);
                            this._nowPlayingOverlaysControl = new MS.Entertainment.UI.Controls.VideoWinNowPlayingOverlays(controlElement, {})
                        }
                        else {
                            controlElement.setAttribute("data-win-control", "MS.Entertainment.UI.Controls.NowPlayingOverlays");
                            this._nowPlayingOverlaysContainer.domElement.appendChild(controlElement);
                            this._nowPlayingOverlaysControl = new MS.Entertainment.UI.Controls.NowPlayingOverlays(controlElement, {})
                        }
                        this._nowPlayingOverlaysControl.dataContext = this._nowPlayingViewModel;
                        this._updateStates();
                        if (!MS.Entertainment.Utilities.isMusicApp2 && !this._seekBarManipulatingChangedBound) {
                            this._seekBarManipulatingChangedBound = this._seekBarManipulatingChanged.bind(this);
                            this._nowPlayingOverlaysControl.bind("seekBarManipulating", this._seekBarManipulatingChangedBound)
                        }
                        if (!this.hostAudioVideoControl && this.playbackSession)
                            this._nowPlayingOverlaysControl.playbackSession = this.playbackSession
                    }
                }, _createNowPlayingVisualization: function _createNowPlayingVisualization() {
                    var controlElement = document.createElement("div");
                    controlElement.setAttribute("data-win-control", "MS.Entertainment.UI.Controls.Music2NowPlayingVisualization");
                    WinJS.Utilities.addClass(controlElement, "musicVisualization");
                    this._musicVisualizationContainer.domElement.appendChild(controlElement);
                    this._musicVisualizationControl = new MS.Entertainment.UI.Controls.Music2NowPlayingVisualization(controlElement, {});
                    this._musicVisualizationControl.dataContext = this._nowPlayingViewModel;
                    this._nowPlayingViewModel.load();
                    this._updateStates()
                }, _updateNowPlayingArt: function _updateNowPlayingArt() {
                    var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    if (configurationManager.playback.enableMusicVisualization)
                        if (!this._musicVisualizationControl)
                            this._createNowPlayingVisualization()
                }, _seekBarManipulatingChanged: function _seekBarManipulatingChanged(newVal) {
                    if (newVal) {
                        if (this._pointerHandlers) {
                            this._pointerHandlers.cancel();
                            this._pointerHandlers = null
                        }
                        if (this._musicVisualizationControl)
                            this._musicVisualizationControl.pause()
                    }
                    else {
                        this._updatePointerHandlers();
                        if (this._musicVisualizationControl)
                            this._musicVisualizationControl.play()
                    }
                }, _mediaStateChanged: function _mediaStateChanged(e) {
                    var newVal = e.detail.newValue;
                    var oldVal = e.detail.oldValue;
                    if (this.frozen)
                        return;
                    if (oldVal && newVal === MS.Entertainment.Platform.Playback.TransportState.stopped) {
                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        if (!MS.Entertainment.Utilities.isMusicApp || featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace))
                            WinJS.Promise.timeout(this._mediaStoppedTimeout).then(function _delay() {
                                if (!this.frozen && this.playbackSession.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.stopped && MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).nowPlayingVisible)
                                    if (this.playbackSession.currentMedia && this.playbackSession.currentMedia.hasServiceId && !this._uiStateService.nowPlayingConstrainedMode) {
                                        if (!this._uiStateService.isSnapped) {
                                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).nowPlayingInset = true;
                                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).nowPlayingVisible = false;
                                            this._nowPlayingOverlaysControl.showBackButton()
                                        }
                                    }
                                    else if (this.playbackSession.currentMedia && !this.playbackSession.currentMedia.hasServiceId && MS.Entertainment.Utilities.isVideoApp) {
                                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).nowPlayingInset = false;
                                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).nowPlayingVisible = true
                                    }
                                    else if (oldVal !== newVal)
                                        if (!this._uiStateService.isSnapped)
                                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).navigateBack();
                                        else
                                            this._navigateBackOnUnSnap = true
                            }.bind(this));
                        else
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).navigateBack()
                    }
                }, _updateStates: function _updateStates() {
                    if (this._deferredUpdateTimer)
                        return;
                    this._deferredUpdateTimer = WinJS.Promise.timeout(MS.Entertainment.Platform.PlaybackHelpers.deferredUpdateTimeout).then(this._updateStatesDeferred.bind(this))
                }, _updateStatesDeferred: function _updateStatesDeferred() {
                    this._deferredUpdateTimer = null;
                    if (!this.playbackSession) {
                        if (this._uiStateService.nowPlayingTileVisible)
                            this.backgroundVisible = true;
                        return
                    }
                    if (this.playbackSession && this.playbackSession.isRemoteSession)
                        this.backgroundVisible = MS.Entertainment.Utilities.isWindowsBlue || !this.playbackSession.isRemoteSession() || MS.Entertainment.Platform.PlaybackHelpers.isMusicTrackOrMusicVideo(this.playbackSession.currentMedia);
                    else
                        this.backgroundVisible = false
                }, _shareMedia: function _shareMedia() {
                    if (this._uiStateService.nowPlayingTileVisible || !MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.shareSender))
                        return;
                    this._cancelShareMedia();
                    if (this.enableSharing && this.playbackSession && this.playbackSession.currentMedia) {
                        var sender = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.shareSender);
                        this._shareOperation = sender.pendingShare(this.playbackSession.currentMedia)
                    }
                }, _cancelShareMedia: function _cancelShareMedia() {
                    if (this._shareOperation) {
                        this._shareOperation.cancel();
                        this._shareOperation = null
                    }
                }
        }, {
            initialized: false, playbackSession: null, videoVisible: false, backgroundVisible: true, musicVisualizationVisible: false, enableSharing: true, frozen: false
        }), NowPlayingControlManager: MS.Entertainment.UI.Framework.define(function nowPlayingControlManager() {
                this._nowPlayingControls = {};
                this._parkedNowPlayingHosts = {};
                this._nowPlayingControlTimers = {}
            }, {
                controlCleanupTimeout: 1800000, cleanupTimerEnabled: false, _parkedNowPlayingHosts: null, _nowPlayingControls: null, _nowPlayingControlTimers: null, preloadNowPlayingControls: function preloadNowPlayingControls(force) {
                        this.getNowPlayingControl(MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying, true)
                    }, getNowPlayingControl: function getNowPlayingControl(sessionId, preload) {
                        if (preload && this._nowPlayingControls[sessionId])
                            return this._nowPlayingControls[sessionId];
                        if (!this._parkedNowPlayingHosts[sessionId] || this._parkedNowPlayingHosts[sessionId].children.length === 0) {
                            var parkedNowPlayingHost = document.createElement("div");
                            parkedNowPlayingHost.style.position = "absolute";
                            parkedNowPlayingHost.style.zIndex = -1;
                            WinJS.Utilities.addClass(parkedNowPlayingHost, "removeFromDisplay");
                            document.body.appendChild(parkedNowPlayingHost);
                            this._parkedNowPlayingHosts[sessionId] = parkedNowPlayingHost;
                            if (MS.Entertainment.Utilities.isMusicApp2)
                                this._nowPlayingControls[sessionId] = parkedNowPlayingHost;
                            else {
                                var controlElement = document.createElement("div");
                                controlElement.setAttribute("class", "nowPlayingControl");
                                controlElement.setAttribute("data-win-control", "MS.Entertainment.UI.Controls.NowPlaying");
                                this._nowPlayingControls[sessionId] = new MS.Entertainment.UI.Controls.NowPlaying(controlElement, {});
                                this.releaseNowPlayingControl(sessionId);
                                var onInitialize = function onInitialize(newVal) {
                                        if (newVal) {
                                            this._nowPlayingControls[sessionId].unbind("initialized", onInitialize);
                                            var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                                            this._nowPlayingControls[sessionId].playbackSession = sessionMgr.getSession(sessionId);
                                            if (this._parkedNowPlayingHosts[sessionId].children.length > 0)
                                                MS.Entertainment.Utilities.freezeControlsInSubtree(this._parkedNowPlayingHosts[sessionId])
                                        }
                                    };
                                this._nowPlayingControls[sessionId].bind("initialized", onInitialize.bind(this))
                            }
                        }
                        else if (!MS.Entertainment.Utilities.isMusicApp2)
                            MS.Entertainment.Utilities.thawControlsInSubtree(this._parkedNowPlayingHosts[sessionId]);
                        if (!preload && this._nowPlayingControlTimers[sessionId]) {
                            this._nowPlayingControlTimers[sessionId].cancel();
                            this._nowPlayingControlTimers[sessionId] = null
                        }
                        return this._nowPlayingControls[sessionId]
                    }, releaseNowPlayingControl: function releaseNowPlayingControl(sessionId) {
                        if (!this._parkedNowPlayingHosts || !this._parkedNowPlayingHosts[sessionId] || this._parkedNowPlayingHosts[sessionId].children.length > 0 || !this._nowPlayingControls || !this._nowPlayingControls[sessionId])
                            return;
                        MS.Entertainment.Utilities.freezeControlsInSubtree(this._nowPlayingControls[sessionId].domElement);
                        this._parkedNowPlayingHosts[sessionId].appendChild(this._nowPlayingControls[sessionId].domElement);
                        if (this._nowPlayingControlTimers[sessionId]) {
                            this._nowPlayingControlTimers[sessionId].cancel();
                            this._nowPlayingControlTimers[sessionId] = null
                        }
                        if (this.cleanupTimerEnabled)
                            this._nowPlayingControlTimers[sessionId] = WinJS.Promise.timeout(this.controlCleanupTimeout).then(function _delay() {
                                this._releaseControl(sessionId)
                            }.bind(this))
                    }, releaseNowPlayingControls: function releaseNowPlayingControls() {
                        if (this._nowPlayingControlTimers[MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying])
                            this._releaseControl(MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying)
                    }, _releaseControl: function releaseControl(sessionId) {
                        if (this._nowPlayingControlTimers[sessionId]) {
                            this._nowPlayingControlTimers[sessionId].cancel();
                            this._nowPlayingControlTimers[sessionId] = null
                        }
                        document.body.removeChild(this._parkedNowPlayingHosts[sessionId]);
                        MS.Entertainment.Utilities.empty(this._parkedNowPlayingHosts[sessionId]);
                        this._parkedNowPlayingHosts[sessionId] = null;
                        if (this._nowPlayingControls[sessionId] && this._nowPlayingControls[sessionId].unload) {
                            this._nowPlayingControls[sessionId].suppressUnload = false;
                            this._nowPlayingControls[sessionId].unload();
                            this._nowPlayingControls[sessionId] = null
                        }
                    }
            })
    });
    MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.nowPlayingControlManager, function nowPlayingControlManagerFactory() {
        return new MS.Entertainment.UI.Controls.NowPlayingControlManager
    })
})()
