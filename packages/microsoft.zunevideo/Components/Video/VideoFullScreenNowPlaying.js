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
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Video");
var Playback = MS.Entertainment.Platform.Playback;
var MS;
(function(MS) {
    (function(Entertainment) {
        (function(Video) {
            var VideoFullScreenNowPlaying = (function(_super) {
                    __extends(VideoFullScreenNowPlaying, _super);
                    function VideoFullScreenNowPlaying(element, options) {
                        var _this = this;
                        _super.call(this, element, options);
                        this.controlName = "VideoFullScreenNowPlaying";
                        this.frozen = false;
                        this._delayInitialize = true;
                        this._dontReclaimNowPlaying = false;
                        this._showSpinner = false;
                        var container = element.querySelector("[data-ent-member='_container']");
                        WinJS.UI.processAll(container).done(function() {
                            WinJS.Binding.processAll(container, _this)
                        })
                    }
                    VideoFullScreenNowPlaying.prototype.initialize = function() {
                        this._bindingsNowPlaying = WinJS.Binding.bind(this, {sessionManager: {nowPlayingSession: {currentTransportState: this._currentTransportStateChanged.bind(this)}}});
                        this._uiStateBindings = WinJS.Binding.bind(this.uiStateService, {isSnapped: this._onSnappedChanged.bind(this)});
                        this._onAppSuspending = this._onAppSuspending.bind(this);
                        Windows.UI.WebUI.WebUIApplication.addEventListener("suspending", this._onAppSuspending);
                        document.addEventListener("NowPlaying_ShowDetails", this._handleNowPlayingShowDetails.bind(this));
                        this._patchNavigateAway()
                    };
                    VideoFullScreenNowPlaying.prototype.unload = function() {
                        _super.prototype.unload.call(this);
                        if (this._bindings) {
                            this._bindings.cancel();
                            this._bindings = null
                        }
                        if (this._bindingsNowPlaying) {
                            this._bindingsNowPlaying.cancel();
                            this._bindingsNowPlaying = null
                        }
                        if (this._uiStateBindings) {
                            this._uiStateBindings.cancel();
                            this._uiStateBindings = null
                        }
                        if (this.currentPage) {
                            this.currentPage.onNavigatingAway = null;
                            this.currentPage.onNavigateAway = null
                        }
                        Windows.UI.WebUI.WebUIApplication.removeEventListener("suspending", this._onAppSuspending);
                        var nowPlayingSession = this.sessionManager && this.sessionManager.nowPlayingSession;
                        if (nowPlayingSession)
                            nowPlayingSession.targetTransportState = Playback.TransportState.stopped;
                        this.nowPlayingManager.releaseNowPlayingControl(Playback.WellKnownPlaybackSessionId.nowPlaying);
                        if (this._uiStateService) {
                            this.uiStateService.nowPlayingVisible = false;
                            this.uiStateService.isFullScreenVideo = false
                        }
                    };
                    VideoFullScreenNowPlaying.prototype.freeze = function() {
                        _super.prototype.freeze.call(this);
                        this._delayedInitialization();
                        if (this._nowPlayingManager)
                            this.nowPlayingManager.releaseNowPlayingControl(Playback.WellKnownPlaybackSessionId.nowPlaying);
                        this.uiStateService.nowPlayingVisible = false;
                        this.uiStateService.isFullScreenVideo = false;
                        this.frozen = true
                    };
                    VideoFullScreenNowPlaying.prototype.thaw = function() {
                        _super.prototype.thaw.call(this);
                        if (!this._dontReclaimNowPlaying) {
                            this._delayedInitialization();
                            this._reclaimNowPlayingControl()
                        }
                        this.frozen = false
                    };
                    Object.defineProperty(VideoFullScreenNowPlaying.prototype, "navigationService", {
                        get: function() {
                            if (!this._navigationService)
                                this._navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                            return this._navigationService
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(VideoFullScreenNowPlaying.prototype, "currentPage", {
                        get: function() {
                            if (!this._currentPage) {
                                var currentPage = WinJS.Binding.unwrap(this.navigationService.currentPage);
                                if (currentPage && currentPage.iaNode && currentPage.iaNode.moniker === MS.Entertainment.UI.Monikers.fullScreenNowPlaying)
                                    this._currentPage = currentPage
                            }
                            return this._currentPage
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(VideoFullScreenNowPlaying.prototype, "uiStateService", {
                        get: function() {
                            if (!this._uiStateService)
                                this._uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                            return this._uiStateService
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(VideoFullScreenNowPlaying.prototype, "sessionManager", {
                        get: function() {
                            if (!this._sessionManager)
                                this._sessionManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                            return this._sessionManager
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(VideoFullScreenNowPlaying.prototype, "nowPlayingManager", {
                        get: function() {
                            if (!this._nowPlayingManager)
                                this._nowPlayingManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.nowPlayingControlManager);
                            return this._nowPlayingManager
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(VideoFullScreenNowPlaying.prototype, "applicationStateManager", {
                        get: function() {
                            if (!this._applicationStateManager && MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.applicationStateManager))
                                this._applicationStateManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.applicationStateManager);
                            return this._applicationStateManager
                        }, enumerable: true, configurable: true
                    });
                    VideoFullScreenNowPlaying.prototype.onNavigateTo = function(){};
                    Object.defineProperty(VideoFullScreenNowPlaying.prototype, "showSpinner", {
                        get: function() {
                            return this._showSpinner
                        }, set: function(value) {
                                this.updateAndNotify("showSpinner", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(VideoFullScreenNowPlaying.prototype, "isPreviousPageDetailsPage", {
                        get: function() {
                            var isDetailsPage = false;
                            var previousLocation = this.navigationService.getPreviousLocation();
                            if (previousLocation && previousLocation.page && previousLocation.page.iaNode && previousLocation.page.iaNode.moniker) {
                                var moniker = previousLocation.page.iaNode.moniker;
                                isDetailsPage = (moniker === MS.Entertainment.UI.Monikers.immersiveDetails || moniker === MS.Entertainment.UI.Monikers.navigationPopover || moniker === MS.Entertainment.UI.Monikers.movieDetailsPage || moniker === MS.Entertainment.UI.Monikers.tvDetailsPage)
                            }
                            return isDetailsPage
                        }, enumerable: true, configurable: true
                    });
                    VideoFullScreenNowPlaying.prototype._onAppSuspending = function() {
                        this.sessionManager.clearCachedPBMState();
                        var playbackSession = this.sessionManager.primarySession;
                        if (playbackSession && playbackSession.currentMedia && this.mediaItem && !this.mediaItem.playPreviewOnly) {
                            var currentMediaFilePath = WinJS.Utilities.getMember("currentMedia.fileItem.path", playbackSession) || WinJS.Utilities.getMember("currentMedia.filePath", playbackSession);
                            var currentMediaServiceId = WinJS.Utilities.getMember("currentMedia.serviceId", playbackSession);
                            if (MS.Entertainment.Utilities.isEmptyGuid(currentMediaServiceId))
                                VideoFullScreenNowPlaying.pendingAutoResumeFilePath = currentMediaFilePath || String.empty
                        }
                        this.navigationService.navigateBack();
                        this._dontReclaimNowPlaying = true
                    };
                    VideoFullScreenNowPlaying.prototype._navigateToDetails = function() {
                        this._delayedInitialization();
                        if (!this.mediaItem || !this.mediaItem.hasServiceId)
                            return;
                        if (Entertainment.ServiceLocator.isServiceRegistered(Entertainment.Services.winJSNavigation) || this.isPreviousPageDetailsPage)
                            this.navigationService.navigateBack();
                        else {
                            this.navigationService.clearBackStackOnNextNavigate(true);
                            MS.Entertainment.Platform.PlaybackHelpers.showItemDetails({dataContext: {data: this.mediaItem}}, {forceDetails: true})
                        }
                    };
                    VideoFullScreenNowPlaying.prototype._delayedInitialization = function() {
                        if (!this._delayInitialize || this._unloaded || !this.currentPage || !this.currentPage.options || !this.currentPage.options.mediaItem)
                            return;
                        this._delayInitialize = false;
                        this.mediaItem = this.currentPage.options.mediaItem;
                        this.uiStateService.nowPlayingInset = false;
                        this.uiStateService.nowPlayingTileVisible = false;
                        if (this.applicationStateManager && this.mediaItem.hasServiceId)
                            this.applicationStateManager.savePlaybackState(this.mediaItem, {hasBackStack: true});
                        WinJS.Promise.timeout().then(this._reclaimNowPlayingControl.bind(this))
                    };
                    VideoFullScreenNowPlaying.prototype._setShowSpinnerState = function(currentTransportState) {
                        this.showSpinner = currentTransportState === Playback.TransportState.starting
                    };
                    VideoFullScreenNowPlaying.prototype._currentTransportStateChanged = function(value, oldValue) {
                        if (!value || this.frozen || this._unloaded)
                            return;
                        if (value !== Playback.TransportState.starting)
                            this._delayedInitialization();
                        this._setShowSpinnerState(value);
                        var isPlayToSessionRunning = (this.sessionManager && this.sessionManager.nowPlayingSession && this.sessionManager.nowPlayingSession.isPlayToReceiverSessionRunning);
                        if (value === Playback.TransportState.stopped && oldValue && !isPlayToSessionRunning && !this.uiStateService.isSnapped)
                            this._navigateToDetails()
                    };
                    VideoFullScreenNowPlaying.prototype._onSnappedChanged = function(val, oldVal) {
                        if (oldVal === undefined)
                            return;
                        if (!val && oldVal && this.sessionManager.nowPlayingSession.currentTransportState === Playback.TransportState.stopped)
                            this._navigateToDetails()
                    };
                    VideoFullScreenNowPlaying.prototype._handleNowPlayingShowDetails = function() {
                        if (this.frozen || this._unloaded)
                            return;
                        this._navigateToDetails()
                    };
                    VideoFullScreenNowPlaying.prototype._reclaimNowPlayingControl = function() {
                        var _this = this;
                        if (this._reclaimPromise)
                            return;
                        this.uiStateService.nowPlayingVisible = true;
                        this.uiStateService.isFullScreenVideo = true;
                        this._nowPlayingControl = this.nowPlayingManager.getNowPlayingControl(Playback.WellKnownPlaybackSessionId.nowPlaying);
                        this._reclaimPromise = MS.Entertainment.UI.Framework.waitForControlToInitialize(this._nowPlayingControl.domElement).then(function() {
                            var playbackSession = _this.sessionManager.nowPlayingSession;
                            _this._nowPlayingControl.playbackSession = playbackSession;
                            _this._nowPlayingControl.repossessNowPlaying();
                            if (_this._nowPlayingHostContainer) {
                                MS.Entertainment.Utilities.empty(_this._nowPlayingHostContainer);
                                _this._nowPlayingHostContainer.appendChild(_this._nowPlayingControl.domElement)
                            }
                        });
                        this._reclaimPromise.done(function() {
                            _this._reclaimPromise = null
                        })
                    };
                    VideoFullScreenNowPlaying.prototype._patchNavigateAway = function() {
                        var currentPage = this.currentPage;
                        currentPage.onNavigatingAway = function onVideoFullScreenNavigatingAway() {
                            var cancelNavigation = this._handleNavigateBack();
                            return cancelNavigation
                        }.bind(this);
                        var oldNavigateAway = currentPage.onNavigateAway || function(){};
                        currentPage.onNavigateAway = function onVideoFullScreenNavigateAway() {
                            this._delayedInitialization();
                            var cancelNavigation = false;
                            var playbackSession = this.sessionManager.getSession(Playback.WellKnownPlaybackSessionId.nowPlaying);
                            if (this.navigationService.navigationDirection === MS.Entertainment.Navigation.NavigationDirection.backward)
                                cancelNavigation = this._handleNavigateBack();
                            if (!cancelNavigation) {
                                if (playbackSession.currentMedia && this.mediaItem && !this.mediaItem.playPreviewOnly)
                                    playbackSession.setLastPlayedMedia(playbackSession.currentMedia);
                                this._removeMediaFromPlaybackSession()
                            }
                            oldNavigateAway();
                            return cancelNavigation
                        }.bind(this)
                    };
                    VideoFullScreenNowPlaying.prototype._handleNavigateBack = function() {
                        var _this = this;
                        var cancelNavigation = false;
                        var isPlayToSessionRunning = (this.sessionManager && this.sessionManager.nowPlayingSession && this.sessionManager.nowPlayingSession.isPlayToReceiverSessionRunning);
                        if (MS.Entertainment.Utilities.isVideoApp2 && this.mediaItem && !isPlayToSessionRunning)
                            if (!this.isPreviousPageDetailsPage && this.mediaItem.hasServiceId) {
                                this.navigationService.clearBackStackOnNextNavigate(true);
                                WinJS.Promise.timeout(1).done(function() {
                                    MS.Entertainment.Platform.PlaybackHelpers.showItemDetails({dataContext: {data: _this.mediaItem}}, {forceDetails: true})
                                });
                                cancelNavigation = true
                            }
                        return cancelNavigation
                    };
                    VideoFullScreenNowPlaying.prototype._removeMediaFromPlaybackSession = function() {
                        var playbackSession = this.sessionManager.getSession(Playback.WellKnownPlaybackSessionId.nowPlaying);
                        playbackSession.clear()
                    };
                    VideoFullScreenNowPlaying.pendingAutoResumeFilePath = String.empty;
                    return VideoFullScreenNowPlaying
                })(MS.Entertainment.UI.Framework.UserControl);
            Video.VideoFullScreenNowPlaying = VideoFullScreenNowPlaying
        })(Entertainment.Video || (Entertainment.Video = {}));
        var Video = Entertainment.Video
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
