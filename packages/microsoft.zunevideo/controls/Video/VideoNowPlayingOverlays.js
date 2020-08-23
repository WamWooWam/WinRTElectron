/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Components/Playback/Controls/PlaybackControl.js", "/Framework/corefx.js", "/Framework/data/queries/marketplacequeries.js", "/Framework/imageloader.js", "/Framework/servicelocator.js", "/Framework/utilities.js");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {NowPlayingOverlays: MS.Entertainment.UI.Framework.defineUserControl("/Controls/Video/VideoNowPlayingOverlays.html#nowPlayingTemplate", function(element, options){}, {
            autoHideVideoOverlays: 3000, positionChangedThreshold: 30000, _uiStateService: MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState), _bindings: null, _eventHandlers: null, _keyHandlers: null, _mainHeader: null, _sessionMgr: null, _uiSettings: new Windows.UI.ViewManagement.UISettings, _deferredUpdateTimer: null, _lastMousePos: {
                    x: -10, y: -10
                }, _freezeDelayPromise: null, _engageHideOffsetMS: 500, _navigationService: null, _backButtonServiceInternal: null, _mediaChangedWhileFrozen: false, _seekBarManipulatingChangedBound: null, _playbackSessionChangedBound: null, _ratingImageUrl: String.empty, _overlaysVisible: false, _overlaysVisiblePromise: null, _detailsButtonVisible: false, _detailsButtonVisiblePromise: null, _ratingImageVisible: false, _ratingImageVisiblePromise: null, _seekBarVisible: false, _seekBarVisiblePromise: null, _transportControlsVisible: false, _transportControlsVisiblePromise: null, _backButtonService: {get: function backButtonService_get() {
                        if (!this._backButtonServiceInternal)
                            this._backButtonServiceInternal = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.backButton);
                        return this._backButtonServiceInternal
                    }}, _allowedKeys: null, _freezeDelayTimerMS: 1000, initialize: function initialize() {
                    this._allowedKeys = [WinJS.Utilities.Key.leftArrow, WinJS.Utilities.Key.lArrow, WinJS.Utilities.Key.lOtherArrow, WinJS.Utilities.Key.rightArrow, WinJS.Utilities.Key.rArrow, WinJS.Utilities.Key.rOtherArrow, WinJS.Utilities.Key.upArrow, WinJS.Utilities.Key.uArrow, WinJS.Utilities.Key.uOtherArrow, WinJS.Utilities.Key.downArrow, WinJS.Utilities.Key.dArrow, WinJS.Utilities.Key.dOtherArrow, WinJS.Utilities.Key.tab, WinJS.Utilities.Key.space, WinJS.Utilities.Key.invokeButton];
                    this.showBackButton = this.showBackButton.bind(this);
                    this._mainHeader = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.mainHeader);
                    this._sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    this._navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
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
                    this.hideOverlays();
                    var keyHandlerElement = MS.Entertainment.Utilities.isApp2 ? this.domElement : document;
                    this._keyHandlers = MS.Entertainment.Utilities.addEventHandlers(keyHandlerElement, {
                        keydown: this.nowPlayingKeyDown.bind(this), keyup: this.nowPlayingKeyUp.bind(this)
                    }, false);
                    if (MS.Entertainment.Utilities.isVideoApp2 && !MS.Entertainment.UI.Framework.focusedItemInContainer(this._overlaysContainer))
                        MS.Entertainment.UI.Framework.focusElement(this._overlaysContainer)
                }, _showVideoPostRoll: function _showVideoPostRoll() {
                    var videoPostRollViewModel = new MS.Entertainment.ViewModels.VideoPostRollViewModel;
                    if (videoPostRollViewModel.isValid)
                        MS.Entertainment.UI.Controls.Video.VideoPostRoll.showVideoPostRollOverlay(videoPostRollViewModel)
                }, nowPlayingMouseDown: function nowPlayingMouseDown(event) {
                    if (event.button === 2)
                        return;
                    if (event.srcElement.className === String.empty || event.srcElement.className === "nowPlayingTransportControlsContainer" || WinJS.Utilities.hasClass(event.srcElement, "seekBarScroller") || (this._transportControls && event.srcElement === this._transportControls.domElement) || (this._nowPlayingOverlayContainer && event.srcElement === this._nowPlayingOverlayContainer.domElement) || event.srcElement.tagName === "path" || event.srcElement.tagName === "rect" || event.srcElement.tagName === "svg") {
                        if (WinJS.Utilities.hasClass(event.srcElement, "seekBarScroller") || !this.transportControlsVisible || !this.overlaysVisible)
                            this.showOverlays();
                        else
                            this.hideOverlays();
                        this._lastMousePos.x = event.x;
                        this._lastMousePos.y = event.y
                    }
                }, nowPlayingMouseMove: function nowPlayingMouseMove(event) {
                    if (this._seekbar && this._seekBar.isManipulating || (Math.abs(event.x - this._lastMousePos.x) < 10 && Math.abs(event.y - this._lastMousePos.y) < 10))
                        return;
                    if (!this._uiStateService.isSnapped)
                        this.showOverlays(this._uiStateService.isSnapped);
                    this.updateCursorVisibility(true)
                }, nowPlayingKeyUp: function nowPlayingKeyUp(event) {
                    if (!this.initialized || this.frozen || this._freezeDelayPromise)
                        return;
                    if (event && event.keyCode === WinJS.Utilities.Key.escape)
                        this.hideOverlays();
                    else if (event && this._allowedKeys && this._allowedKeys.indexOf(event.keyCode) >= 0)
                        this.showOverlays()
                }, nowPlayingKeyDown: function nowPlayingKeyDown(event) {
                    if (event && event.keyCode === WinJS.Utilities.Key.dismissButton)
                        if (this.overlaysVisible) {
                            this.hideOverlays();
                            event.stopPropagation()
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
                    this.frozen = true;
                    if (this._freezeDelayPromise) {
                        this._freezeDelayPromise.cancel();
                        this._freezeDelayPromise = null
                    }
                    this._freezeDelayPromise = WinJS.Promise.timeout(this._freezeDelayTimerMS).then(function freezeControl() {
                        this.backVisible = true;
                        this._backButtonService.showBackButton(true);
                        this._freezeDelayPromise = null;
                        this._suspendControl()
                    }.bind(this));
                    MS.Entertainment.UI.Framework.UserControl.prototype.freeze.call(this)
                }, thaw: function thaw() {
                    if (!this._uiStateService.nowPlayingVisible && !this._uiStateService.isSnapped) {
                        MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this);
                        return
                    }
                    this.showOverlays(true);
                    this.frozen = false;
                    this._resetAutoHideTimer(false);
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
                    this.updateCursorVisibility(true);
                    this._detachBindings();
                    this.overlaysVisible = false;
                    this.detailsButtonVisible = false;
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
                                appBarVisible: this._appBarVisibleChanged.bind(this), isSnapped: this._isSnappedChanged.bind(this), isSettingsCharmVisible: this._settingsCharmVisibleChanged.bind(this), nowPlayingInset: this._updateStates.bind(this)
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
                        this._resetAutoHideTimer(true);
                        if (!this._uiStateService.nowPlayingTileVisible)
                            this._hideTransportControls()
                    }
                    else
                        this._resetAutoHideTimer();
                    this._updateStates()
                }, _settingsCharmVisibleChanged: function _settingsCharmVisibleChanged(newVal) {
                    if (newVal)
                        this.showOverlays();
                    else
                        this._updateStates()
                }, _isSnappedChanged: function _isSnappedChanged(newVal, oldVal) {
                    if (this._uiStateService.isSnapped) {
                        WinJS.Utilities.removeClass(this.domElement, "engage");
                        this.showOverlays(true);
                        this._updateStates();
                        this.hideBackButton(true)
                    }
                    else if (!this.frozen && oldVal !== undefined)
                        this.showOverlays(true)
                }, _hideTransportControls: function _hideTransportControls() {
                    if (this.playbackSession)
                        this.overlaysVisible = false;
                    else {
                        this.overlaysVisible = this._uiStateService.isSnapped;
                        if (!this._uiStateService.isSnapped) {
                            this._updateTransportControlsVisibility(false);
                            if (this._seekBar)
                                this._seekBar.metadataVisible = false
                        }
                        this.detailsButtonVisible = this._uiStateService.appBarVisible;
                        if (MS.Entertainment.Platform.PlaybackHelpers.shouldDisplayRatingImage() && this._ratingImageUrl !== String.empty)
                            this.ratingImageVisible = true
                    }
                }, hideOverlays: function hideOverlays() {
                    if (!this._uiStateService.isSnapped && (((this._seekbar && this._seekBar.isManipulating) && this.playbackSession.currentTransportState !== MS.Entertainment.Platform.Playback.TransportState.starting) || (!this._useBranding && this.playbackSession && this.playbackSession.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.stopped)))
                        this.showOverlays();
                    else {
                        this._resetAutoHideTimer(true);
                        this.hideBackButton();
                        this._hideTransportControls();
                        this.updateCursorVisibility(false);
                        this.detailsButtonVisible = false;
                        if (MS.Entertainment.Platform.PlaybackHelpers.shouldDisplayRatingImage() && this._ratingImageUrl !== String.empty)
                            this.ratingImageVisible = true;
                        this._updateStates()
                    }
                }, updateCursorVisibility: function updateCursorVisibility(visibility) {
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
                }, showOverlays: function showOverlays() {
                    if (!this.initialized)
                        return;
                    if (this.overlaysVisible && this.transportControlsVisible) {
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
                    if (this.playbackSession && this.playbackSession.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.starting) {
                        this.hideOverlays();
                        return
                    }
                    this.overlaysVisible = true;
                    this._updateTransportControlsVisibility(true);
                    this.playIconVisible = false;
                    this.updateCursorVisibility(true);
                    this.showBackButton();
                    this._resetAutoHideTimer(false);
                    this._updateStates()
                }, hideBackButton: function hideBackButton(force) {
                    if (this._mainHeader && (force || !this._uiStateService.nowPlayingInset))
                        this.backVisible = false;
                    this._updateStates()
                }, showBackButton: function showBackButton() {
                    if (!this._uiStateService.isSnapped && !this.backVisible) {
                        this.backVisible = true;
                        this._updateStates()
                    }
                }, hide: function hide(){}, _resetAutoHideTimer: function _resetAutoHideTimer(clear) {
                    if (this.autoHideTimeout) {
                        clearTimeout(this.autoHideTimeout);
                        this.autoHideTimeout = null
                    }
                    var timeoutMs = this.autoHideVideoOverlays;
                    var isHidden = !this.overlaysVisible && !this._uiStateService.appBarVisible && !this._uiStateService.isSettingsCharmVisible && !this.backVisible;
                    if (!clear && timeoutMs > 0 && !isHidden)
                        this.autoHideTimeout = setTimeout(function nowPlayingAutoHide() {
                            if ((!this._seekBar || !this._seekBar.isManipulating) && (this._uiStateService.isSnapped || this._uiStateService.nowPlayingVisible))
                                this.hideOverlays()
                        }.bind(this), timeoutMs)
                }, _seekBarManipulatingChanged: function _seekBarManipulatingChanged() {
                    if (this.playbackSession)
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
                    this._metadataControl.modelItem = this.playbackSession.currentMedia;
                    if (this.playbackSession && this.playbackSession.currentMedia !== null)
                        MS.Entertainment.Platform.PlaybackHelpers.getVideoRatingImageAsync().done(function getVideoRatingImageComplete(ratingImage) {
                            if (ratingImage === String.empty) {
                                this.ratingImage = String.empty;
                                this.ratingImageVisible = false
                            }
                            else if (MS.Entertainment.Platform.PlaybackHelpers.shouldDisplayRatingImage()) {
                                this.ratingImage = ratingImage;
                                this.ratingImageVisible = true
                            }
                        }.bind(this), function getVideoRatingImageError(){})
                }, _mediaStateChanged: function _mediaStateChanged(e) {
                    var newVal = e.detail.newValue;
                    var oldVal = e.detail.oldValue;
                    if (this.frozen || !this.initialized)
                        return;
                    if (newVal === MS.Entertainment.Platform.Playback.TransportState.starting)
                        this.hideOverlays();
                    else if (oldVal)
                        if (newVal === MS.Entertainment.Platform.Playback.TransportState.stopped)
                            if (MS.Entertainment.Utilities.isVideoApp1) {
                                this.showOverlays();
                                if (this.playbackSession.currentMedia && !this.playbackSession.currentMedia.hasServiceId && this.playbackSession.currentMedia.activationFilePath && this.playbackSession.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.stopped)
                                    this._showVideoPostRoll()
                            }
                }, _updateStates: function _updateStates() {
                    if (this._deferredUpdateTimer || this.frozen)
                        return;
                    this._deferredUpdateTimer = WinJS.Promise.timeout(MS.Entertainment.Platform.PlaybackHelpers.deferredUpdateTimeout).then(this._updateStatesDeferred.bind(this))
                }, _updateStatesDeferred: function _updateStatesDeferred() {
                    this._deferredUpdateTimer = null;
                    if (!this.playbackSession || !this.initialized)
                        return;
                    var detailsButtonVisible = this.detailsButtonVisible;
                    this.overlaysVisible = this._uiStateService.isSnapped || this.overlaysVisible;
                    var showHeader = (this.backVisible || this.overlaysVisible);
                    if (this._mainHeader && (!this.playbackSession || (!this._uiStateService.engageVisible && !MS.Entertainment.Platform.PlaybackHelpers.isMusicTrack(this.playbackSession.currentMedia))))
                        this._mainHeader.visibility = showHeader;
                    if (this.backVisible)
                        this._backButtonService.showBackButton(true);
                    else
                        this._backButtonService.hideBackButton(true);
                    this.seekBarVisible = this.transportControlsVisible && this.playbackSession.duration > 0;
                    detailsButtonVisible = !MS.Entertainment.Utilities.isVideoApp2 && !this._uiStateService.isSnapped && (this.overlaysVisible && this.transportControlsVisible);
                    if (this.playbackSession.currentMedia && !this.playbackSession.currentMedia.hasServiceId) {
                        this._uiStateService.nowPlayingInset = false;
                        detailsButtonVisible = false
                    }
                    this.detailsButtonVisible = !this._uiStateService.isSnapped && !MS.Entertainment.Utilities.isVideoApp2 && detailsButtonVisible;
                    this.detailsButtonIcon = MS.Entertainment.UI.Icon.details;
                    if (this.overlaysVisible && this.transportControlsVisible && this.ratingImageVisible)
                        this.ratingImageVisible = false;
                    this._uiStateService.isFullScreenVideo = !this.frozen && !this._uiStateService.isSnapped && !this._uiStateService.appBarVisible && !this._uiStateService.isSettingsCharmVisible && !this.overlaysVisible;
                    if (this.transportControlsVisible && MS.Entertainment.Utilities.isVideoApp2)
                        MS.Entertainment.UI.Framework.focusFirstInSubTree(this._transportControls.domElement)
                }, _updateTransportControlsVisibility: function _updateTransportControlsVisibility(makeVisible) {
                    if (this.transportControlsVisible === makeVisible)
                        return;
                    this.transportControlsVisible = makeVisible
                }, _updateVisibility: function _updateVisibility(element, makeVisible) {
                    var timeout = 500;
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
                }, detailsButtonVisible: {
                    get: function() {
                        return this._detailsButtonVisible
                    }, set: function(value) {
                            if (this._detailsButtonVisible !== value) {
                                this._detailsButtonVisible = value;
                                if (this._detailsButtonVisiblePromise) {
                                    this._detailsButtonVisiblePromise.cancel();
                                    this._detailsButtonVisiblePromise = null
                                }
                                this._detailsButtonVisiblePromise = this._updateVisibility(this._detailsButton, value).then(function clearPromise() {
                                    this._detailsButtonVisiblePromise = null
                                }.bind(this), function ignoreError(){})
                            }
                        }
                }, ratingImageVisible: {
                    get: function() {
                        return this._ratingImageVisible
                    }, set: function(value) {
                            if (this._ratingImageVisible !== value) {
                                this._ratingImageVisible = value;
                                if (this._ratingImageVisiblePromise) {
                                    this._ratingImageVisiblePromise.cancel();
                                    this._ratingImageVisiblePromise = null
                                }
                                this._ratingImageVisiblePromise = MS.Entertainment.Utilities.toggleDisplayCollapseElement(this._ratingImageContainer, value).then(function clearPromise() {
                                    this._ratingImageVisiblePromise = null
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
                }, ratingImage: {
                    get: function() {
                        return this._ratingImage
                    }, set: function(value) {
                            this._ratingImageUrl = value;
                            this.updateAndNotify("videoRatingImage", value)
                        }
                }
        }, {
            initialized: false, playbackSession: null, seekBarManipulating: false, playIconVisible: false, backVisible: true, detailsButtonIcon: MS.Entertainment.UI.Icon.screenNormal, frozen: false, detailsButtonClick: function detailsButtonClick(event) {
                    var showDetailsEvent = document.createEvent("Event");
                    showDetailsEvent.initEvent("NowPlaying_ShowDetails", true, false);
                    this.domElement.dispatchEvent(showDetailsEvent);
                    event.cancelBubble = true
                }
        })})
})()
