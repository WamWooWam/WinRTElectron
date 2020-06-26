//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var util = AppMagic.Utility,
        E_UNEXPECTED = -2147418113,
        E_NOTIMPL = -2147467263,
        PlaybackViewModel = WinJS.Class.derive(AppMagic.Utility.Disposable, function PlaybackViewModel_ctor(playback, controlContext, mediaFactory, container) {
            AppMagic.Utility.Disposable.call(this);
            this.track("_eventTracker", new AppMagic.Utility.EventTracker);
            this._mediaFactory = mediaFactory;
            this.trackObservable("_mediaObject", ko.observable(mediaFactory.createInitial()));
            this._container = container;
            this._playback = playback;
            this._controlContext = controlContext;
            this._properties = controlContext.properties;
            this._onBeforePauseHandler = this._onBeforePause.bind(this);
            this._onBeforePlayHandler = this._onBeforePlay.bind(this);
            this._onDurationChangeHandler = this._onDurationChange.bind(this);
            this._onEndedHandler = this._onEnded.bind(this);
            this._onErrorHandler = this._onError.bind(this);
            this._onLoadedMetadataHandler = this._onLoadedMetadata.bind(this);
            this._onPauseHandler = this._onPause.bind(this);
            this._onPlayHandler = this._onPlay.bind(this);
            this._onTimeUpdateHandler = this._onTimeUpdate.bind(this);
            this.track("isDisabled", ko.computed(function() {
                return this._controlContext.realized ? this.properties.Disabled() || this._controlContext.controlWidget.isParentDisabled(this._controlContext) : !1
            }, this));
            this.track("Fill", ko.computed(function() {
                return this.isDisabled() ? "rgba(119, 119, 119, 1)" : this.properties.Fill()
            }, this));
            this.track("_isMediaThrottling", ko.observable(!1));
            this.track("_isPlaying", ko.observable(!1))
        }, {
            isDisabled: null, audioControlsVisibility: null, _mediaFactory: null, _mediaObject: null, _container: null, _playback: null, _controlContext: null, _properties: null, _onBeforePauseHandler: null, _onBeforePlayHandler: null, _onDurationChangeHandler: null, _onEndedHandler: null, _onErrorHandler: null, _onLoadedMetadataHandler: null, _onPauseHandler: null, _onPlayHandler: null, _onTimeUpdateHandler: null, _lastTimeOutput: null, _timeOutputInterval: 500, _throttledMedia: null, _isMediaThrottling: null, _isPlaying: null, _media: null, _mediaValue: null, mediaObject: {get: function() {
                        return this._mediaObject ? this._mediaObject() : null
                    }}, properties: {get: function() {
                        return this._properties
                    }}, isPlaying: {get: function() {
                        return this._isPlaying()
                    }}, isDisabledDiv: {get: function() {
                        return this.isDisabled() ? !0 : AppMagic.AuthoringTool.Runtime.isAuthoring && !AppMagic.context.documentViewModel.isPreview && this._controlContext.controlWidget.isEditable(this._controlContext) && !this.isEditing() ? !0 : !1
                    }}, init: function() {
                    this.trackAnonymous(this.isDisabled.subscribe(function(newValue) {
                        this._mediaObject().disabled = !!newValue
                    }, this));
                    this.track("audioControlsVisibility", ko.computed(function() {
                        return {
                                playPause: !0, timers: this._properties.Width() > AppMagic.Constants.Audio.timerVisibilityThreshold, volume: this._properties.Width() > AppMagic.Constants.Audio.volumeVisibilityThreshold, seekbar: this._properties.Width() > AppMagic.Constants.Audio.seekbarVisibilityThreshold, verticalVolume: this._properties.Height() > AppMagic.Constants.Audio.verticalVolumeThreshold
                            }
                    }, this));
                    this._addPlayBackElementListeners();
                    this._playback.onChangeMediaThrottleTime > 0 ? (this.track("_throttledMedia", ko.computed(this.properties.Media).extend({throttle: this._playback.onChangeMediaThrottleTime})), this.track("_media", ko.computed(function() {
                        return this._isMediaThrottling() ? this._throttledMedia() : this.properties.Media()
                    }, this)), this.trackAnonymous(this._media.subscribe(this._onChangeMedia, this))) : this.trackAnonymous(this.properties.Media.subscribe(this._onChangeMedia, this))
                }, dispose: function() {
                    this._removePlayBackElementListeners();
                    AppMagic.Utility.Disposable.prototype.dispose.call(this)
                }, play: function() {
                    this._mediaObject().play()
                }, pause: function() {
                    this._mediaObject().pause()
                }, _onTimeUpdate: function() {
                    if (this._controlContext.realized) {
                        var shouldOutputTime = function() {
                                var now = (new Date).getTime();
                                return this._lastTimeOutput === null ? (this._lastTimeOutput = now, !0) : now - this._lastTimeOutput > this._timeOutputInterval ? (this._lastTimeOutput = now, !0) : !1
                            }.bind(this);
                        (this._mediaObject().isPaused || shouldOutputTime()) && (this._mediaObject().currentTime > this.properties.Duration() ? this.properties.Time(this.properties.Duration()) : this.properties.Time(this._mediaObject().currentTime))
                    }
                }, _onEnded: function() {
                    this._lastTimeOutput = null;
                    this.pause();
                    this._playback.OpenAjax.fireEvent("OnEnd", this._controlContext)
                }, _onPause: function() {
                    this._controlContext.realized && (this.properties.Paused(!0), this._mediaObject().currentTime > this.properties.Duration() ? this.properties.Time(this.properties.Duration()) : this.properties.Time(this._mediaObject().currentTime), this._playback.OpenAjax.fireEvent("OnPause", this._controlContext))
                }, _onPlay: function() {
                    this._controlContext.realized && (this._playback.OpenAjax.fireEvent("OnStart", this._controlContext), this.properties.Paused(!1))
                }, _onChangeMedia: function(newValue) {
                    if (this.dispatchEvent("onMediaChanged"), newValue !== this._mediaValue) {
                        this._mediaValue = newValue;
                        this._setMedia(this._mediaFactory.create("null"));
                        var mediaParseResult = this._mediaFactory.parse(newValue),
                            media = this._mediaFactory.create(mediaParseResult.template);
                        this._setMedia(media);
                        var startTime = this.properties.StartTime() || mediaParseResult.startTime || 0;
                        media.loadAsync(mediaParseResult.mediaId, startTime, this._container).then(function() {
                            media.loop = !!this.properties.Loop();
                            media.showControls = !!this.properties.ShowControls();
                            var newStartTime = this.properties.StartTime() || mediaParseResult.startTime || 0;
                            newStartTime !== startTime && (media.currentTime = newStartTime)
                        }.bind(this));
                        this._controlContext.realized && (this._controlContext.properties.Paused(media.isPaused), this._controlContext.properties.Time(media.currentTime))
                    }
                }, _setMedia: function(newMedia) {
                    var oldMedia = this._mediaObject();
                    this._removePlayBackElementListeners();
                    this._mediaObject(newMedia);
                    oldMedia.dispose();
                    this._addPlayBackElementListeners()
                }, _addPlayBackElementListeners: function() {
                    var media = this._mediaObject();
                    media.beforePause.subscribe(this._onBeforePauseHandler);
                    media.beforePlay.subscribe(this._onBeforePlayHandler);
                    media.durationChanged.subscribe(this._onDurationChangeHandler);
                    media.metadataLoaded.subscribe(this._onLoadedMetadataHandler);
                    media.timeUpdated.subscribe(this._onTimeUpdateHandler);
                    media.ended.subscribe(this._onEndedHandler);
                    media.paused.subscribe(this._onPauseHandler);
                    media.error.subscribe(this._onErrorHandler);
                    media.playing.subscribe(this._onPlayHandler)
                }, _removePlayBackElementListeners: function() {
                    var media = this._mediaObject();
                    media.beforePause.unsubscribe(this._onBeforePauseHandler);
                    media.beforePlay.unsubscribe(this._onBeforePlayHandler);
                    media.durationChanged.unsubscribe(this._onDurationChangeHandler);
                    media.metadataLoaded.unsubscribe(this._onLoadedMetadataHandler);
                    media.timeUpdated.unsubscribe(this._onTimeUpdateHandler);
                    media.ended.unsubscribe(this._onEndedHandler);
                    media.paused.unsubscribe(this._onPauseHandler);
                    media.error.unsubscribe(this._onErrorHandler);
                    media.playing.unsubscribe(this._onPlayHandler)
                }, _onError: function() {
                    this._onDurationChange()
                }, _onBeforePause: function() {
                    this._isPlaying(!1)
                }, _onBeforePlay: function() {
                    this._isPlaying(!0)
                }, _onDurationChange: function() {
                    var dur = this._mediaObject().duration;
                    isFinite(dur) ? typeof this.properties.Duration != "undefined" && this.properties.Duration(dur) : typeof this.properties.Duration != "undefined" && this.properties.Duration(0)
                }, _onLoadedMetadata: function() {
                    if (this._controlContext.realized) {
                        var start = this.properties.Start();
                        var autoStart = this.properties.AutoStart();
                        (start || autoStart) && this._controlContext.isParentScreenActive() ? this.play() : this.pause()
                    }
                }
        }, {});
    WinJS.Class.mix(PlaybackViewModel, WinJS.Utilities.eventMixin);
    WinJS.Namespace.define("AppMagic.Controls", {PlaybackViewModel: PlaybackViewModel})
})();