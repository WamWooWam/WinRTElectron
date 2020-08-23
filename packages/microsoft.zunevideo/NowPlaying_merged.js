/* Copyright (C) Microsoft Corporation. All rights reserved. */
/* >>>>>>/controls/video_win/videowinnowplayingoverlays.js:2 */
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
    (function(Entertainment) {
        (function(UI) {
            (function(Controls) {
                var TransportStates = MS.Entertainment.Platform.Playback.TransportState;
                var VideoWinNowPlayingOverlays = (function(_super) {
                        __extends(VideoWinNowPlayingOverlays, _super);
                        function VideoWinNowPlayingOverlays(element, options) {
                            this.suppressUnload = true;
                            this.templateStorage = (options && options.templateStorage) || "/Controls/Video_Win/VideoWinNowPlayingOverlays.html";
                            this.templateName = "nowPlayingTemplate";
                            _super.call(this, element, options);
                            this._overlaysVisible = false;
                            this._overlaysVisiblePromise = null;
                            this._backVisible = true;
                            this._deferredUpdateTimer = null;
                            this._eventHandlers = null;
                            this._seekBarManipulating = false;
                            this._lastMousePos = {
                                x: -10, y: -10
                            };
                            this._volumeOverlay = null;
                            this._volumeControllerService = null;
                            this._volumeStateBinds = null;
                            this._dateTimeFormatters = null;
                            this._playToStateBinds = null;
                            this._volumeEnabled = false;
                            this._closedCaptionPickerOverlay = null;
                            this._audioTrackPickerOverlay = null;
                            this._closedCaptionsInitialized = false
                        }
                        Object.defineProperty(VideoWinNowPlayingOverlays.prototype, "_backButtonService", {
                            get: function() {
                                return MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.backButton)
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(VideoWinNowPlayingOverlays.prototype, "controlInitialized", {
                            get: function() {
                                return this._controlInitialized
                            }, set: function(value) {
                                    this.updateAndNotify("controlInitialized", value)
                                }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(VideoWinNowPlayingOverlays.prototype, "frozen", {
                            get: function() {
                                return this._frozen
                            }, set: function(value) {
                                    this.updateAndNotify("frozen", value)
                                }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(VideoWinNowPlayingOverlays.prototype, "playbackSession", {
                            get: function() {
                                return this._playbackSession
                            }, set: function(value) {
                                    this.updateAndNotify("playbackSession", value)
                                }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(VideoWinNowPlayingOverlays.prototype, "backVisible", {
                            get: function() {
                                return this._backVisible
                            }, set: function(value) {
                                    this.updateAndNotify("backVisible", value)
                                }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(VideoWinNowPlayingOverlays.prototype, "seekBarManipulating", {
                            get: function() {
                                return this._seekBarManipulating
                            }, set: function(value) {
                                    this.updateAndNotify("seekBarManipulating", value)
                                }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(VideoWinNowPlayingOverlays.prototype, "overlaysVisible", {
                            get: function() {
                                return this._overlaysVisible
                            }, set: function(value) {
                                    var _this = this;
                                    if (this._overlaysVisible !== value) {
                                        this._overlaysVisible = value;
                                        if (this._overlaysVisiblePromise) {
                                            this._overlaysVisiblePromise.cancel();
                                            this._overlaysVisiblePromise = null
                                        }
                                        this._overlaysVisiblePromise = this._updateVisibility(this._videoTransportControlsOverlayContainer, value).then(function() {
                                            _this._overlaysVisiblePromise = null
                                        }, function(){})
                                    }
                                }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(VideoWinNowPlayingOverlays.prototype, "ratingImageVisible", {
                            get: function() {
                                return this._ratingImageVisible
                            }, set: function(value) {
                                    var _this = this;
                                    if (this._ratingImageVisible !== value) {
                                        this._ratingImageVisible = value;
                                        if (this._ratingImageVisiblePromise) {
                                            this._ratingImageVisiblePromise.cancel();
                                            this._ratingImageVisiblePromise = null
                                        }
                                        this._ratingImageVisiblePromise = MS.Entertainment.Utilities.toggleDisplayCollapseElement(this._ratingImageContainer, value).then(function() {
                                            _this._ratingImageVisiblePromise = null
                                        }, function(){})
                                    }
                                }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(VideoWinNowPlayingOverlays.prototype, "ratingImage", {
                            get: function() {
                                return this._ratingImageUrl
                            }, set: function(value) {
                                    this._ratingImageUrl = value;
                                    this.updateAndNotify("videoRatingImage", value)
                                }, enumerable: true, configurable: true
                        });
                        VideoWinNowPlayingOverlays.prototype.initialize = function() {
                            this._allowedKeys = [WinJS.Utilities.Key.leftArrow, WinJS.Utilities.Key.lArrow, WinJS.Utilities.Key.lOtherArrow, WinJS.Utilities.Key.rightArrow, WinJS.Utilities.Key.rArrow, WinJS.Utilities.Key.rOtherArrow, WinJS.Utilities.Key.upArrow, WinJS.Utilities.Key.uArrow, WinJS.Utilities.Key.uOtherArrow, WinJS.Utilities.Key.downArrow, WinJS.Utilities.Key.dArrow, WinJS.Utilities.Key.dOtherArrow, WinJS.Utilities.Key.tab, WinJS.Utilities.Key.space, WinJS.Utilities.Key.invokeButton];
                            this._mainHeader = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.mainHeader);
                            this._sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                            this._keyHandlers = MS.Entertainment.Utilities.addEventHandlers(document, {
                                keydown: this.nowPlayingKeyDown.bind(this), keyup: this.nowPlayingKeyUp.bind(this)
                            }, false);
                            if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.volumeService)) {
                                var volumeControllerService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.volumeService);
                                this._volumeControllerService = volumeControllerService;
                                this._volumeStateBinds = WinJS.Binding.bind(volumeControllerService, {
                                    volume: this._onVolumeValueChange.bind(this), mute: this._onAudioEndpointStateChange.bind(this), isAudioEndpointAvailable: this._onAudioEndpointStateChange.bind(this)
                                })
                            }
                            this.controlInitialized = true;
                            this._playbackSessionBinds = WinJS.Binding.bind(this._sessionMgr, {playbackSession: this._playbackSessionChanged.bind(this)});
                            this._playToStateBinds = WinJS.Binding.bind(this._playbackSession, {isRemoteSessionRunning: this._playToStateChanged.bind(this)});
                            this._closedCaptionStateBinds = WinJS.Binding.bind(this.playbackSession, {ccLcid: function() {
                                    this._updateClosedCaptionButtonState()
                                }.bind(this)});
                            this._updateVolume();
                            this._updateRepeatButton();
                            this._updateClosedCaptionButtonState();
                            this._updateAudioTracksButtonState();
                            this.hideOverlays()
                        };
                        VideoWinNowPlayingOverlays.prototype.freeze = function() {
                            _super.prototype.freeze.call(this);
                            this._suspendControl();
                            this.frozen = true
                        };
                        VideoWinNowPlayingOverlays.prototype.thaw = function() {
                            _super.prototype.thaw.call(this);
                            this.showOverlays();
                            this.frozen = false;
                            this._resetAutoHideTimer();
                            if (this._mediaChangedWhileFrozen) {
                                this._playbackSessionChanged();
                                this._mediaChangedWhileFrozen = false
                            }
                            this._playbackSessionChanged();
                            if (!this._keyHandlers)
                                this._keyHandlers = MS.Entertainment.Utilities.addEventHandlers(document, {
                                    keydown: this.nowPlayingKeyDown.bind(this), keyup: this.nowPlayingKeyUp.bind(this)
                                }, false)
                        };
                        VideoWinNowPlayingOverlays.prototype.unload = function() {
                            _super.prototype.unload.call(this);
                            this.controlInitialized = false;
                            if (this._deferredUpdateTimer) {
                                this._deferredUpdateTimer.cancel();
                                this._deferredUpdateTimer = null
                            }
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isFullScreenVideo = false;
                            this._clearAutoHideTimer();
                            this._detachBindings();
                            if (this._keyHandlers) {
                                this._keyHandlers.cancel();
                                this._keyHandlers = null
                            }
                            if (this._playbackSessionBinds) {
                                this._playbackSessionBinds.cancel();
                                this._playbackSessionBinds = null
                            }
                            if (this._seekbarBinds) {
                                this._seekbarBinds.cancel();
                                this._seekbarBinds = null
                            }
                            if (this._volumeStateBinds) {
                                this._volumeStateBinds.cancel();
                                this._volumeStateBinds = null
                            }
                            if (this._playToStateBinds) {
                                this._playToStateBinds.cancel();
                                this._playToStateBinds = null
                            }
                            if (this._closedCaptionStateBinds) {
                                this._closedCaptionStateBinds.cancel();
                                this._closedCaptionStateBinds = null
                            }
                        };
                        VideoWinNowPlayingOverlays.prototype.nowPlayingMouseDown = function(event) {
                            if (event.button === 2)
                                return;
                            var srcElement = event.srcElement;
                            if (srcElement.className === String.empty || WinJS.Utilities.hasClass(srcElement, "seekBarScroller") || WinJS.Utilities.hasClass(srcElement, "cc_bodyDiv") || WinJS.Utilities.hasClass(srcElement, "cc_text") || WinJS.Utilities.hasClass(srcElement, "closedCaptionsContainer") || event.srcElement.tagName === "path" || event.srcElement.tagName === "rect" || event.srcElement.tagName === "svg") {
                                if (!this.overlaysVisible)
                                    this.showOverlays();
                                else
                                    this.hideOverlays();
                                this._lastMousePos.x = event.x;
                                this._lastMousePos.y = event.y
                            }
                        };
                        VideoWinNowPlayingOverlays.prototype.nowPlayingKeyUp = function(event) {
                            if (!this.controlInitialized || this.frozen)
                                return;
                            if (event && event.keyCode === WinJS.Utilities.Key.escape)
                                this.hideOverlays();
                            else if (event && this._allowedKeys && this._allowedKeys.indexOf(event.keyCode) >= 0)
                                this.showOverlays();
                            event.cancelBubble = true
                        };
                        VideoWinNowPlayingOverlays.prototype.nowPlayingKeyDown = function(event) {
                            if (event && event.keyCode === WinJS.Utilities.Key.dismissButton)
                                if (this.overlaysVisible) {
                                    this.hideOverlays();
                                    event.stopPropagation()
                                }
                        };
                        VideoWinNowPlayingOverlays.prototype.nowPlayingMouseMove = function(event) {
                            if (this._seekBar && this._seekBar.isManipulating || Math.abs(event.x - this._lastMousePos.x) < 10 && Math.abs(event.y - this._lastMousePos.y) < 10)
                                return;
                            this.showOverlays()
                        };
                        VideoWinNowPlayingOverlays.prototype.showOverlays = function() {
                            if (!this.controlInitialized)
                                return;
                            if (this.overlaysVisible) {
                                this._resetAutoHideTimer();
                                return
                            }
                            this.playbackSession.forceTimeUpdate();
                            this.playbackSession.enableTimeUpdate();
                            this.overlaysVisible = true;
                            this.showBackButton();
                            this._resetAutoHideTimer();
                            if (MS.Entertainment.Platform.PlaybackHelpers.shouldDisplayRatingImage())
                                this.ratingImageVisible = false;
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isFullScreenVideo = false;
                            this._updateCursorVisibility(true);
                            this._updateStates()
                        };
                        VideoWinNowPlayingOverlays.prototype.hideOverlays = function() {
                            if (this._playbackSession && (this._playbackSession.isRemoteSessionRunning || this._playbackSession.currentTransportState === TransportStates.paused))
                                return;
                            if (((this._seekBar && this._seekBar.isManipulating) && this.playbackSession.currentTransportState !== TransportStates.starting) || (this._volumeOverlay && this._volumeOverlay.visible))
                                return;
                            else {
                                if (!this.playbackSession.closedCaptionsOn)
                                    this.playbackSession.disableTimeUpdate();
                                if (this._closedCaptionPickerOverlay && this._closedCaptionPickerOverlay.visible)
                                    this._closedCaptionPickerOverlay.hide();
                                if (this._audioTrackPickerOverlay && this._audioTrackPickerOverlay.visible)
                                    this._audioTrackPickerOverlay.hide();
                                this.overlaysVisible = false;
                                if (this.playbackSession.currentTransportState === TransportStates.starting)
                                    this.showBackButton();
                                else
                                    this.hideBackButton();
                                this._clearAutoHideTimer();
                                if (MS.Entertainment.Platform.PlaybackHelpers.shouldDisplayRatingImage() && this.ratingImage !== String.empty)
                                    this.ratingImageVisible = true;
                                this._updateCursorVisibility(false);
                                this._updateStates()
                            }
                        };
                        VideoWinNowPlayingOverlays.prototype.hideBackButton = function() {
                            if (this._mainHeader && this.backVisible)
                                this.backVisible = false;
                            this._updateStates()
                        };
                        VideoWinNowPlayingOverlays.prototype.showBackButton = function() {
                            if (!this.backVisible)
                                this.backVisible = true;
                            this._updateStates()
                        };
                        VideoWinNowPlayingOverlays.prototype._detachBindings = function() {
                            if (this._eventHandlers) {
                                this._eventHandlers.cancel();
                                this._eventHandlers = null
                            }
                        };
                        VideoWinNowPlayingOverlays.prototype._suspendControl = function() {
                            this._detachBindings();
                            this.overlaysVisible = false;
                            if (this._keyHandlers) {
                                this._keyHandlers.cancel();
                                this._keyHandlers = null
                            }
                        };
                        VideoWinNowPlayingOverlays.prototype._resetAutoHideTimer = function() {
                            var _this = this;
                            this._clearAutoHideTimer();
                            var timeoutMs = MS.Entertainment.UI.Controls.VideoWinNowPlayingOverlays._autoHideOverlays;
                            var isHidden = !this.overlaysVisible && !this.backVisible;
                            if (timeoutMs > 0 && !isHidden)
                                this._autoHideTimeout = WinJS.Promise.timeout(timeoutMs).then(function() {
                                    _this.hideOverlays()
                                })
                        };
                        VideoWinNowPlayingOverlays.prototype._clearAutoHideTimer = function() {
                            if (this._autoHideTimeout) {
                                this._autoHideTimeout.cancel();
                                this._autoHideTimeout = null
                            }
                        };
                        VideoWinNowPlayingOverlays.prototype._seekBarManipulatingChanged = function() {
                            if (this.playbackSession)
                                this.seekBarManipulating = this._seekBar.isManipulating;
                            this.showOverlays()
                        };
                        VideoWinNowPlayingOverlays.prototype._volumeOverlayVisibilityChanged = function(value) {
                            this.hideOverlays()
                        };
                        VideoWinNowPlayingOverlays.prototype._onVolumeValueChange = function(newValue) {
                            if (!this.controlInitialized)
                                return;
                            if (this._volumeText && this._volumeControllerService.isAudioEndpointAvailable)
                                this._updateVolumeText(newValue)
                        };
                        VideoWinNowPlayingOverlays.prototype._updateVolumeText = function(volumeLevel) {
                            if (!this.controlInitialized)
                                return;
                            if (this._volumeText) {
                                var roundedLevel = (this._volumeControllerService.mute) ? 0 : Math.round(volumeLevel * 100);
                                this._volumeText.textContent = this._formatNumber(roundedLevel)
                            }
                        };
                        VideoWinNowPlayingOverlays.prototype._onAudioEndpointStateChange = function(newValue) {
                            if (!this.controlInitialized)
                                return;
                            this._updateVolume()
                        };
                        VideoWinNowPlayingOverlays.prototype._playToStateChanged = function(newState) {
                            if (this._unloaded)
                                return;
                            this._updateVolume();
                            WinJS.Promise.timeout(MS.Entertainment.UI.Controls.VideoWinNowPlayingOverlays._updateButtonTimeout).done(this._updateAudioTracksButtonState.bind(this))
                        };
                        VideoWinNowPlayingOverlays.prototype._updateStates = function() {
                            if (this._deferredUpdateTimer || this.frozen)
                                return;
                            this._deferredUpdateTimer = WinJS.Promise.timeout(MS.Entertainment.Platform.PlaybackHelpers.deferredUpdateTimeout).then(this._updateStatesDeferred.bind(this))
                        };
                        VideoWinNowPlayingOverlays.prototype._updateStatesDeferred = function() {
                            this._deferredUpdateTimer = null;
                            if (this.backVisible) {
                                this.ratingImageVisible = false;
                                this._backButtonService.showBackButton(true)
                            }
                            else
                                this._backButtonService.hideBackButton(true);
                            this._updatePlayPauseButton();
                            this._updateMetadata();
                            this._updateSeekbar()
                        };
                        VideoWinNowPlayingOverlays.prototype._mediaChanged = function() {
                            var _this = this;
                            if (!this.controlInitialized)
                                return;
                            else if (this.frozen) {
                                this._mediaChangedWhileFrozen = true;
                                return
                            }
                            if (this.playbackSession && this.playbackSession.currentMedia !== null) {
                                this._initializeClosedCaptionButtonState();
                                this._updateAudioTracksButtonState();
                                MS.Entertainment.Platform.PlaybackHelpers.getVideoRatingImageAsync().done(function(ratingImageUrl) {
                                    if (ratingImageUrl === String.empty) {
                                        _this.ratingImage = String.empty;
                                        _this.ratingImageVisible = false
                                    }
                                    else if (MS.Entertainment.Platform.PlaybackHelpers.shouldDisplayRatingImage())
                                        _this.ratingImage = ratingImageUrl
                                }, function(){})
                            }
                        };
                        VideoWinNowPlayingOverlays.prototype._mediaStateChanged = function(event) {
                            var newVal = event.detail.newValue;
                            var oldVal = event.detail.oldValue;
                            if (this.frozen || !this.controlInitialized)
                                return;
                            if (newVal === TransportStates.starting)
                                this.hideOverlays();
                            else if (newVal === TransportStates.paused)
                                this.showOverlays();
                            else if (oldVal)
                                if (newVal === TransportStates.stopped)
                                    if (MS.Entertainment.Utilities.isVideoApp1) {
                                        this.showOverlays();
                                        if (this.playbackSession.currentMedia && !this.playbackSession.currentMedia.hasServiceId && this.playbackSession.currentMedia.activationFilePath && this.playbackSession.currentTransportState === TransportStates.stopped)
                                            this._showVideoPostRoll()
                                    }
                            if (newVal === TransportStates.playing || newVal === TransportStates.paused)
                                this._updateAudioTracksButtonState();
                            this._updatePlayPauseButton()
                        };
                        VideoWinNowPlayingOverlays.prototype._playbackSessionChanged = function() {
                            this._detachBindings();
                            if (this.playbackSession) {
                                this._eventHandlers = MS.Entertainment.Utilities.addEvents(this.playbackSession, {
                                    currentMediaChanged: this._mediaChanged.bind(this), currentTransportStateChanged: this._mediaStateChanged.bind(this)
                                });
                                this._mediaChanged();
                                this._mediaStateChanged({detail: {newValue: this.playbackSession.currentTransportState}})
                            }
                            this._updateStates()
                        };
                        VideoWinNowPlayingOverlays.prototype._updateMetadata = function() {
                            if (!this.controlInitialized)
                                return;
                            var currentMedia = this.playbackSession.currentMedia;
                            if (currentMedia)
                                if (MS.Entertainment.Platform.PlaybackHelpers.isTVEpisode(currentMedia)) {
                                    if (currentMedia.seriesTitle)
                                        this._metadataTitle.textContent = currentMedia.seriesTitle;
                                    else if (currentMedia.ParentSeries)
                                        this._metadataTitle.textContent = currentMedia.ParentSeries.Name;
                                    if (currentMedia.seasonNumber > -1 && currentMedia.episodeNumber && currentMedia.name)
                                        this._metadataSubtitle.textContent = String.load(String.id.IDS_TV_NUMBERED_EPISODE_SEASON_TITLE).format(currentMedia.seasonNumber, currentMedia.episodeNumber, currentMedia.name);
                                    else if (currentMedia.name)
                                        this._metadataSubtitle.textContent = currentMedia.name
                                }
                                else {
                                    this._metadataTitle.textContent = currentMedia.title;
                                    this._metadataSubtitle.textContent = MS.Entertainment.Formatters.formatGenre(currentMedia);
                                    {}
                                }
                        };
                        VideoWinNowPlayingOverlays.prototype._updateSeekbar = function() {
                            if (this.playbackSession && this.playbackSession.currentMedia) {
                                if (!this._seekBar) {
                                    this._seekBarContainer.setAttribute("data-win-control", "MS.Entertainment.UI.Controls.PlaybackSeekBar");
                                    this._seekBar = new MS.Entertainment.UI.Controls.PlaybackSeekBar(this._seekBarContainer, {});
                                    this._seekBar.playbackSession = this.playbackSession;
                                    this._seekBar.initializeDuration();
                                    this._seekbarBinds = WinJS.Binding.bind(this._seekBar, {isManipulating: this._seekBarManipulatingChanged.bind(this)})
                                }
                                WinJS.Utilities.removeClass(this._seekBar.domElement, "hideFromDisplay")
                            }
                            if (this._seekBar)
                                this._seekBar.updateScrollerState()
                        };
                        VideoWinNowPlayingOverlays.prototype._updatePlayPauseButton = function() {
                            if (!this.playbackSession)
                                return;
                            if (this.playbackSession.targetTransportState !== TransportStates.playing) {
                                WinJS.Utilities.removeClass(this._playPauseButton, "icon-win-pause");
                                WinJS.Utilities.addClass(this._playPauseButton, "icon-win-play");
                                this._playPauseButton.setAttribute("aria-label", String.load(String.id.IDS_TRANSPORT_CONTROLS_PLAY_BUTTON))
                            }
                            else {
                                WinJS.Utilities.removeClass(this._playPauseButton, "icon-win-play");
                                WinJS.Utilities.addClass(this._playPauseButton, "icon-win-pause");
                                this._playPauseButton.setAttribute("aria-label", String.load(String.id.IDS_TRANSPORT_CONTROLS_PAUSE_BUTTON))
                            }
                        };
                        VideoWinNowPlayingOverlays.prototype._playPauseClick = function() {
                            if (!this.playbackSession)
                                return;
                            if (this.playbackSession.targetTransportState !== TransportStates.playing) {
                                this.playbackSession.targetTransportState = TransportStates.playing;
                                MS.Entertainment.Utilities.Telemetry.logTransportControlsCommand(MS.Entertainment.UI.AutomationIds.transportPlay, String.load(MS.Entertainment.UI.Controls.TransportControls.playButtonStringId));
                                MS.Entertainment.Utilities.Telemetry.logPlayClicked(this._playPauseButton.className)
                            }
                            else {
                                this.playbackSession.targetTransportState = TransportStates.paused;
                                MS.Entertainment.Utilities.Telemetry.logTransportControlsCommand(MS.Entertainment.UI.AutomationIds.transportPause, String.load(String.id.IDS_TRANSPORT_CONTROLS_PAUSE_BUTTON));
                                MS.Entertainment.Utilities.Telemetry.logPauseClicked(this._playPauseButton.className)
                            }
                        };
                        VideoWinNowPlayingOverlays.prototype._volumeKeyDown = function(event) {
                            switch (event.keyCode) {
                                case WinJS.Utilities.Key.enter:
                                case WinJS.Utilities.Key.space:
                                    this._volumeClick();
                                    break
                            }
                        };
                        VideoWinNowPlayingOverlays.prototype._updateVolume = function() {
                            if (!this._volumeControllerService || !this._volumeButton || !this._volumeText)
                                return;
                            this._volumeEnabled = false;
                            if (this._volumeControllerService.isAudioEndpointAvailable) {
                                WinJS.Utilities.removeClass(this._volumeButton, "icon-xbox-volumeDisabled");
                                if (this._volumeControllerService.mute) {
                                    WinJS.Utilities.removeClass(this._volumeButton, "icon-win-volume");
                                    WinJS.Utilities.addClass(this._volumeButton, "icon-win-mute");
                                    this._volumeContainer.setAttribute("aria-label", String.load(String.id.IDS_TRANSPORT_CONTROLS_VOLUME_MUTE_BUTTON))
                                }
                                else {
                                    WinJS.Utilities.removeClass(this._volumeButton, "icon-win-mute");
                                    WinJS.Utilities.addClass(this._volumeButton, "icon-win-volume");
                                    var formattedValue = this._formatNumber(Math.round(this._volumeControllerService.volume * 100));
                                    this._volumeContainer.setAttribute("aria-label", String.load(String.id.IDS_TRANSPORT_CONTROLS_VOLUME_BUTTON).format(formattedValue))
                                }
                                this._volumeEnabled = true;
                                if (this._playbackSession && this._playbackSession.isRemoteSessionRunning)
                                    this._volumeEnabled = false;
                                this._updateVolumeText(this._volumeControllerService.volume)
                            }
                            else {
                                WinJS.Utilities.removeClass(this._volumeButton, "icon-win-volume icon-win-mute");
                                WinJS.Utilities.addClass(this._volumeButton, "icon-xbox-volumeDisabled");
                                this._volumeText.textContent = String.empty
                            }
                            this._updateButton(this._volumeButton, this._volumeEnabled)
                        };
                        VideoWinNowPlayingOverlays.prototype._volumeClick = function() {
                            var _this = this;
                            if (!this._volumeEnabled)
                                return;
                            var position = WinJS.Utilities.getPosition(this._volumeContainer);
                            var distanceFromBottom = (MS.Entertainment.Utilities.getWindowHeight() - position.top);
                            var left = (position.left >= 0 && position.width >= 0) ? (position.left + Math.round((0.5 * position.width) - 33)) + "px" : "auto";
                            var top = "auto";
                            var right = "auto";
                            var bottom = "77px";
                            var customStyle = "volumeContainer";
                            if (!this._volumeOverlay) {
                                this._volumeOverlay = MS.Entertainment.UI.Shell.createOverlay("MS.Entertainment.UI.Controls.VolumeBar", {}, {
                                    right: right, top: top, left: left, bottom: bottom
                                });
                                this._volumeOverlay.customStyle = customStyle;
                                this._volumeOverlay.enableKeyboardLightDismiss = true;
                                this._volumeOverlay.show().done(function() {
                                    _this.hideOverlays();
                                    _this._volumeOverlay = null
                                }, function() {
                                    _this._volumeOverlay = null
                                })
                            }
                        };
                        VideoWinNowPlayingOverlays.prototype._closedCaptionClick = function() {
                            var _this = this;
                            var position = WinJS.Utilities.getPosition(this._closedCaptionButton);
                            var transportControlsPosition = WinJS.Utilities.getPosition(this._videoTransportControlsOverlayContainer);
                            var distanceFromBottom = (MS.Entertainment.Utilities.getWindowHeight() - transportControlsPosition.top);
                            var left = (position.left >= 0 && position.width >= 0) ? (position.left + Math.round((0.5 * position.width) - 70)) + "px" : "auto";
                            var top = "auto";
                            var right = "auto";
                            var bottom = (distanceFromBottom + 5) + "px";
                            if (!this._closedCaptionPickerOverlay) {
                                this._closedCaptionPickerOverlay = MS.Entertainment.UI.Shell.createOverlay("MS.Entertainment.UI.Controls.ClosedCaptionPicker", {}, {
                                    right: right, top: top, left: left, bottom: bottom
                                });
                                this._closedCaptionPickerOverlay.customStyle = "control-ClosedCaptionPicker-overlayAnchor";
                                this._closedCaptionPickerOverlay.enableKeyboardLightDismiss = true;
                                this._closedCaptionPickerOverlay.show().done(function() {
                                    _this._closedCaptionPickerOverlay = null;
                                    _this._updateClosedCaptionButtonState()
                                }, function() {
                                    _this._closedCaptionPickerOverlay = null
                                })
                            }
                        };
                        VideoWinNowPlayingOverlays.prototype._initializeClosedCaptionButtonState = function() {
                            if (this.playbackSession) {
                                if (!this._closedCaptionsInitialized) {
                                    MS.Entertainment.Platform.Playback.ClosedCaptions.Renderer.loadAndUpdateClosedCaptionStyleSettings();
                                    this._closedCaptionsInitialized = true
                                }
                                var filteredClosedCaptions = this.playbackSession.filterClosedCaptions(this.playbackSession.currentMedia);
                                this._updateButton(this._closedCaptionButton, filteredClosedCaptions.length > 0);
                                var savedCCLcid = MS.Entertainment.UI.Controls.ClosedCaptionPicker.loadCaptionsLcidFromSettings();
                                (savedCCLcid !== String.empty) ? this.playbackSession.closedCaptionsOn = true : this.playbackSession.closedCaptionsOn = false;
                                this.playbackSession.ccLcid = savedCCLcid
                            }
                        };
                        VideoWinNowPlayingOverlays.prototype._updateClosedCaptionButtonState = function() {
                            if (this.playbackSession) {
                                this._resetAutoHideTimer();
                                (this.playbackSession.closedCaptionsOn) ? WinJS.Utilities.addClass(this._closedCaptionButton, "closedCaptionsEnabled") : WinJS.Utilities.removeClass(this._closedCaptionButton, "closedCaptionsEnabled");
                                this._updateStates()
                            }
                        };
                        VideoWinNowPlayingOverlays.prototype._audioTracksClick = function() {
                            var _this = this;
                            var position = WinJS.Utilities.getPosition(this._audioTracksButton);
                            var transportControlsPosition = WinJS.Utilities.getPosition(this._videoTransportControlsOverlayContainer);
                            var distanceFromBottom = (MS.Entertainment.Utilities.getWindowHeight() - transportControlsPosition.top);
                            var left = (position.left >= 0 && position.width >= 0) ? (position.left + Math.round((0.5 * position.width) - 70)) + "px" : "auto";
                            var top = "auto";
                            var right = "auto";
                            var bottom = (distanceFromBottom + 5) + "px";
                            if (!this._audioTrackPickerOverlay) {
                                this._audioTrackPickerOverlay = MS.Entertainment.UI.Shell.createOverlay("MS.Entertainment.UI.Controls.AudioTrackPicker", {}, {
                                    right: right, top: top, left: left, bottom: bottom
                                });
                                this._audioTrackPickerOverlay.customStyle = "control-AudioTrackPicker-overlayAnchor";
                                this._audioTrackPickerOverlay.enableKeyboardLightDismiss = true;
                                this._audioTrackPickerOverlay.show().then(null, function(){}).done(function() {
                                    _this._audioTrackPickerOverlay = null
                                })
                            }
                        };
                        VideoWinNowPlayingOverlays.prototype._updateAudioTracksButtonState = function() {
                            var audioTracksButtonEnabled = true;
                            if (this.playbackSession && this.playbackSession.currentTransportState !== TransportStates.stopped) {
                                this._audioTracks = this.playbackSession.getAudioTracks();
                                this._audioTracksLength = this._audioTracks.length;
                                if (this.playbackSession.isRemoteSessionRunning || this._audioTracksLength === 0)
                                    audioTracksButtonEnabled = false;
                                else if (this._audioTracksLength > 1)
                                    WinJS.Utilities.removeClass(this._playbackControls, "controls-AudioTracksButtonRemoved");
                                else
                                    WinJS.Utilities.addClass(this._playbackControls, "controls-AudioTracksButtonRemoved");
                                this._updateButton(this._audioTracksButton, audioTracksButtonEnabled)
                            }
                        };
                        VideoWinNowPlayingOverlays.prototype._repeatClick = function() {
                            if (this._playbackSession) {
                                this._playbackSession.repeat = !this._playbackSession.repeat;
                                this._updateRepeatButton();
                                this._updateStates();
                                MS.Entertainment.Utilities.Telemetry.logTransportControlsCommand(MS.Entertainment.UI.AutomationIds.transportRepeat, String.load(String.id.IDS_TRANSPORT_CONTROLS_REPEAT_BUTTON))
                            }
                        };
                        VideoWinNowPlayingOverlays.prototype._updateRepeatButton = function() {
                            var sessionRepeat = this._playbackSession && this._playbackSession.canRepeat && this._playbackSession.repeat;
                            var repeatText = sessionRepeat ? String.load(String.id.IDS_TRANSPORT_CONTROLS_REPEAT_ON_BUTTON) : String.load(String.id.IDS_TRANSPORT_CONTROLS_REPEAT_OFF_BUTTON);
                            var repeatTooltipText = sessionRepeat ? String.load(String.id.IDS_TRANSPORT_CONTROLS_TURN_REPEAT_OFF_BUTTON) : String.load(String.id.IDS_TRANSPORT_CONTROLS_TURN_REPEAT_ON_BUTTON);
                            this._repeatButton.setAttribute("aria-label", repeatTooltipText);
                            this._repeatButton.title = repeatTooltipText;
                            sessionRepeat ? WinJS.Utilities.addClass(this._repeatButton, "repeatButtonOn") : WinJS.Utilities.removeClass(this._repeatButton, "repeatButtonOn")
                        };
                        VideoWinNowPlayingOverlays.prototype._metadataKeyDown = function(event) {
                            switch (event.keyCode) {
                                case WinJS.Utilities.Key.enter:
                                case WinJS.Utilities.Key.space:
                                    this._metadataClick(event);
                                    break
                            }
                        };
                        VideoWinNowPlayingOverlays.prototype._metadataClick = function(event) {
                            var showDetailsEvent = document.createEvent("Event");
                            showDetailsEvent.initEvent("NowPlaying_ShowDetails", true, false);
                            this.domElement.dispatchEvent(showDetailsEvent);
                            event.cancelBubble = true
                        };
                        VideoWinNowPlayingOverlays.prototype._updateVisibility = function(element, makeVisible) {
                            var timeout = 500;
                            var domElement = element;
                            if (element && element.domElement)
                                domElement = element.domElement;
                            if (!domElement)
                                return WinJS.Promise.as();
                            if (makeVisible) {
                                WinJS.Utilities.removeClass(domElement, VideoWinNowPlayingOverlays.nowPlayingControlsSlideDownClass);
                                WinJS.Utilities.addClass(domElement, VideoWinNowPlayingOverlays.nowPlayingControlsSlideUpClass);
                                return MS.Entertainment.Utilities.showElement(domElement)
                            }
                            else
                                return MS.Entertainment.Utilities.hideElement(domElement, timeout).then(null, function() {
                                        WinJS.Utilities.removeClass(domElement, VideoWinNowPlayingOverlays.nowPlayingControlsSlideUpClass);
                                        WinJS.Utilities.addClass(domElement, VideoWinNowPlayingOverlays.nowPlayingControlsSlideDownClass);
                                        WinJS.Utilities.addClass(domElement, "hideFromDisplay")
                                    })
                        };
                        VideoWinNowPlayingOverlays.prototype._updateCursorVisibility = function(makeVisible) {
                            var cursorStyle = makeVisible ? "default" : "none";
                            if (this.playbackSession && this.playbackSession._playbackControlHost && (!this.playbackSession.closedCaptionsOn || makeVisible) && this.playbackSession._playbackControlHost.style.cursor !== cursorStyle)
                                this.playbackSession._playbackControlHost.style.cursor = cursorStyle
                        };
                        VideoWinNowPlayingOverlays.prototype._showVideoPostRoll = function() {
                            var videoPostRollViewModel = new MS.Entertainment.ViewModels.VideoPostRollViewModel;
                            if (videoPostRollViewModel.isValid)
                                MS.Entertainment.UI.Controls.Video.VideoPostRoll.showVideoPostRollOverlay(videoPostRollViewModel)
                        };
                        VideoWinNowPlayingOverlays.prototype._formatNumber = function(num) {
                            if (!this._dateTimeFormatters) {
                                if (!MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.dateTimeFormatters))
                                    return String.empty;
                                this._dateTimeFormatters = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters)
                            }
                            return this._dateTimeFormatters.decimalNumber.format(num)
                        };
                        VideoWinNowPlayingOverlays.prototype._updateButton = function(button, enable) {
                            if (!button)
                                return;
                            if (enable !== true)
                                button.setAttribute("disabled", "disabled");
                            else
                                button.removeAttribute("disabled")
                        };
                        VideoWinNowPlayingOverlays._autoHideOverlays = 3000;
                        VideoWinNowPlayingOverlays._updateButtonTimeout = 100;
                        VideoWinNowPlayingOverlays.nowPlayingControlsSlideUpClass = "nowPlayingControlsSlideUp";
                        VideoWinNowPlayingOverlays.nowPlayingControlsSlideDownClass = "nowPlayingControlsSlideDown";
                        return VideoWinNowPlayingOverlays
                    })(UI.Framework.UserControl);
                Controls.VideoWinNowPlayingOverlays = VideoWinNowPlayingOverlays
            })(UI.Controls || (UI.Controls = {}));
            var Controls = UI.Controls
        })(Entertainment.UI || (Entertainment.UI = {}));
        var UI = Entertainment.UI
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}));
WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.VideoWinNowPlayingOverlays)
})();
