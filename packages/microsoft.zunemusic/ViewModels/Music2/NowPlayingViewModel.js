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
var MS;
(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var ViewModels;
        (function(ViewModels) {
            MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");
            var Music2ChildNowPlayingVisualizationViewModel = (function(_super) {
                    __extends(Music2ChildNowPlayingVisualizationViewModel, _super);
                    function Music2ChildNowPlayingVisualizationViewModel(mediaItem, ordinal) {
                        _super.call(this, mediaItem, ordinal)
                    }
                    Object.defineProperty(Music2ChildNowPlayingVisualizationViewModel.prototype, "imageSize", {
                        get: function() {
                            return {
                                    x: 0, y: 0
                                }
                        }, enumerable: true, configurable: true
                    });
                    return Music2ChildNowPlayingVisualizationViewModel
                })(MS.Entertainment.ViewModels.BaseChildNowPlayingVisualizationViewModel);
            ViewModels.Music2ChildNowPlayingVisualizationViewModel = Music2ChildNowPlayingVisualizationViewModel;
            var Music2NowPlayingVisualizationViewModel = (function(_super) {
                    __extends(Music2NowPlayingVisualizationViewModel, _super);
                    function Music2NowPlayingVisualizationViewModel() {
                        _super.call(this);
                        this._lastPlaybackPosition = 0;
                        this._metaDataVisiblityDurationMs = 10000;
                        this._metaDataHideAfterPlaybackPosition = 0;
                        this._nowPlayingMetadataVisible = false;
                        this._playlistVisible = false;
                        this._eventHandlers = null;
                        this._loaded = false;
                        this.showNextTrackThresholdMS = 15000;
                        this.showPreviousTrackThresholdMS = 10000
                    }
                    Music2NowPlayingVisualizationViewModel.prototype.dispose = function() {
                        this._releaseBindings();
                        _super.prototype.dispose.call(this)
                    };
                    Object.defineProperty(Music2NowPlayingVisualizationViewModel.prototype, "nowPlayingMetadataVisible", {
                        get: function() {
                            return this._nowPlayingMetadataVisible
                        }, set: function(value) {
                                if (value !== this.nowPlayingMetadataVisible)
                                    this.updateAndNotify("nowPlayingMetadataVisible", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(Music2NowPlayingVisualizationViewModel.prototype, "playlistVisible", {
                        get: function() {
                            return this._playlistVisible
                        }, set: function(value) {
                                if (this._playlistVisible !== value) {
                                    if (!value)
                                        this.showNowPlayingMetadata();
                                    this.updateAndNotify("playlistVisible", value)
                                }
                                this._setMetadataVisibility()
                            }, enumerable: true, configurable: true
                    });
                    Music2NowPlayingVisualizationViewModel.prototype.delayInitialize = function() {
                        _super.prototype.delayInitialize.call(this)
                    };
                    Music2NowPlayingVisualizationViewModel.prototype.load = function() {
                        if (this._loaded) {
                            if (this.frozen)
                                this.onThaw();
                            return
                        }
                        this._loaded = true;
                        this._attachBindings();
                        return _super.prototype.load.call(this)
                    };
                    Music2NowPlayingVisualizationViewModel.prototype._releaseBindings = function() {
                        if (this._eventHandlers)
                            this._eventHandlers.forEach(function(eventHandler) {
                                eventHandler.cancel()
                            });
                        this._eventHandlers = []
                    };
                    Music2NowPlayingVisualizationViewModel.prototype._attachBindings = function() {
                        this._releaseBindings();
                        var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                        this._eventHandlers.push(Entertainment.Utilities.addEventHandlers(this.playbackSession, {
                            currentTransportStateChanged: this._onCurrentTransportStateChanged.bind(this), currentPositionChanged: this._setMetadataVisibility.bind(this)
                        }));
                        this._eventHandlers.push(Entertainment.Utilities.addEventHandlers(uiStateService, {
                            overlayVisibleChanged: this._setMetadataVisibility.bind(this), isFullScreenMusicChanged: this._setMetadataVisibility.bind(this), isSnappedChanged: this._setMetadataVisibility.bind(this)
                        }));
                        this._setMetadataVisibility()
                    };
                    Music2NowPlayingVisualizationViewModel.prototype._onCurrentTransportStateChanged = function() {
                        if (this.playbackSession.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.paused)
                            this.showNowPlayingMetadata();
                        this._setMetadataVisibility()
                    };
                    Music2NowPlayingVisualizationViewModel.prototype.createChildNowPlayingingVisualizationViewModel = function(mediaItem, ordinal) {
                        return new Music2ChildNowPlayingVisualizationViewModel(mediaItem, ordinal)
                    };
                    Music2NowPlayingVisualizationViewModel.prototype.showNowPlayingMetadata = function(duration) {
                        if (duration === undefined)
                            duration = this._metaDataVisiblityDurationMs;
                        if (this.playbackSession)
                            this._metaDataHideAfterPlaybackPosition = this.playbackSession.currentPosition + duration;
                        this._setMetadataVisibility()
                    };
                    Music2NowPlayingVisualizationViewModel.prototype._setMetadataVisibility = function() {
                        if (!this.currentChild || this.disposed)
                            return;
                        var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                        if (MS.Entertainment.Platform.PlaybackHelpers.isMusicVideo(this.currentChild.mediaItem)) {
                            if (this.playbackSession) {
                                this.nowPlayingMetadataVisible = !this.playlistVisible && !uiStateService.overlayVisible && (!uiStateService.isFullScreenMusic || uiStateService.isSnapped || this.playbackSession.currentTransportState !== MS.Entertainment.Platform.Playback.TransportState.playing || this.playbackSession.currentPosition <= this._metaDataHideAfterPlaybackPosition || this.playbackSession.currentPosition <= this._metaDataVisiblityDurationMs || this.playbackSession.currentPosition >= this.playbackSession.duration - this._metaDataVisiblityDurationMs);
                                if (this._lastPlaybackPosition - 2000 > this.playbackSession.currentPosition || this.playbackSession.currentPosition < 2000)
                                    this._metaDataHideAfterPlaybackPosition = 0
                            }
                        }
                        else
                            this.nowPlayingMetadataVisible = !uiStateService.overlayVisible && !this.playlistVisible;
                        this._lastPlaybackPosition = this.playbackSession.currentPosition
                    };
                    return Music2NowPlayingVisualizationViewModel
                })(MS.Entertainment.ViewModels.BaseNowPlayingVisualizationViewModel);
            ViewModels.Music2NowPlayingVisualizationViewModel = Music2NowPlayingVisualizationViewModel
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}));
MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.nowPlayingViewModel, function() {
    var viewModel = new MS.Entertainment.ViewModels.Music2NowPlayingVisualizationViewModel;
    return viewModel
}, true)
