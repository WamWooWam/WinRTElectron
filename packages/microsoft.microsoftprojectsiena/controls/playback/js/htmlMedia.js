//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var util = AppMagic.Utility,
        E_UNEXPECTED = -2147418113,
        E_NOTIMPL = -2147467263,
        HtmlMedia = WinJS.Class.derive(AppMagic.Controls.Media, function HtmlMedia_ctor() {
            AppMagic.Controls.Media.call(this);
            this._mediaElement = new NullMediaElement;
            this._audioElementEnabled = ko.observable(!0);
            this._loop = ko.observable(!1);
            this._showControls = ko.observable(!0);
            this._volume = ko.observable(.5);
            this._overlayVisible = ko.observable(!1);
            this._wasVolumeButtonRecentlyClicked = ko.observable(!1);
            this._wasMouseRecentlyMoved = ko.observable(!1);
            this._isMuted = ko.observable(!1);
            this._seekBarDuration = ko.observable(this._getTimeFormattedString(0));
            this._seekBarTime = ko.observable(this._getTimeFormattedString(0));
            this._seekBarValue = ko.observable(0);
            this.durationChanged.subscribe(this._onDurationChanged.bind(this));
            this.timeUpdated.subscribe(this._onTimeUpdated.bind(this))
        }, {
            _container: null, _mediaElement: null, _audioElementEnabled: null, _overlayVisible: null, _loop: null, _showControls: null, _wasVolumeButtonRecentlyClicked: null, _wasMouseRecentlyMoved: null, _seekBar: null, _seekBarValue: null, _seekBarTime: null, _isMuted: null, _volume: null, _isScrubbing: !1, _hideControlsTimeout: AppMagic.Constants.Controls.controlsFadeDelay, _hideControlsTimeoutHandle: null, _hideVolumeTimeout: AppMagic.Constants.Controls.volumeSliderHideDelay, _hideVolumeTimeoutHandle: null, onClick: function() {
                    this.onPointerMove()
                }, onClickPlayPauseButton: function() {
                    this.disabled || (this.isPaused ? this.play() : this.pause())
                }, onClickVolumeMuteButton: function() {
                    this._isMuted(!this._isMuted())
                }, onClickVolumeButton: function() {
                    var wasVolumeButtonRecentlyClicked = this._wasVolumeButtonRecentlyClicked();
                    this._wasVolumeButtonRecentlyClicked(!wasVolumeButtonRecentlyClicked)
                }, _onDurationChanged: function() {
                    var dur = this._mediaElement.duration;
                    isFinite(dur) ? this._seekBarDuration(this._getTimeFormattedString(Math.round(dur))) : this._seekBarDuration(this._getTimeFormattedString(0))
                }, onPointerMove: function() {
                    if (!this.disabled) {
                        this._wasMouseRecentlyMoved(!0);
                        this._hideControlsTimeoutHandle !== null && (this._overlayVisible(!0), clearTimeout(this._hideControlsTimeoutHandle));
                        var that = this;
                        return this._hideControlsTimeoutHandle = setTimeout(function() {
                                that._wasMouseRecentlyMoved(!1);
                                that._wasVolumeButtonRecentlyClicked(!1);
                                that._hideControlsTimeoutHandle = null;
                                that._overlayVisible(!1)
                            }, this._hideControlsTimeout), !0
                    }
                }, onPlaybackSeekBarPointerDown: function(data, evt) {
                    return this._isScrubbing = !0, !0
                }, onPlaybackSeekBarPointerUp: function(data, evt) {
                    return this._isScrubbing = !1, this._updateTime(this._seekBarValue()), !0
                }, _onTimeUpdated: function() {
                    this._isScrubbing || this._refreshSeekBarValues()
                }, audioElementEnabled: {get: function() {
                        return this._audioElementEnabled()
                    }}, controlsIsVisible: {get: function() {
                        return this._wasMouseRecentlyMoved()
                    }}, isMuted: {get: function() {
                        return this._isMuted()
                    }}, isVolumeContainerVisible: {get: function() {
                        return this._wasMouseRecentlyMoved() && this._wasVolumeButtonRecentlyClicked()
                    }}, minVolume: 0, maxVolume: 100, seekBarMin: 0, seekBarMax: 100, overlayVisible: {get: function() {
                        return this._overlayVisible()
                    }}, seekBarDuration: {get: function() {
                        return this._seekBarDuration()
                    }}, seekBarTime: {get: function() {
                        return this._seekBarTime()
                    }}, seekBarValue: {get: function() {
                        return this._seekBarValue
                    }}, volume: {
                    get: function() {
                        return this._volume()
                    }, set: function(value) {
                            this._volume(value)
                        }
                }, volumeSliderValue: {
                    get: function() {
                        var sliderValue = this._volume() * (this.maxVolume - this.minVolume) + this.minVolume;
                        return sliderValue.toString()
                    }, set: function(value) {
                            var intVal = parseInt(value);
                            this._volume(intVal / (this.maxVolume - this.minVolume));
                            this._isMuted(intVal === this.minVolume)
                        }
                }, _getTimeFormattedString: function(seconds) {
                    return util.secondsToHHMMSS(seconds)
                }, _recreatePlaybackElement: function() {
                    this._audioElementEnabled(!1);
                    this._audioElementEnabled(!0);
                    this._updateMediaElement()
                }, _refreshSeekBarValues: function() {
                    var fraction = this.currentTime / this.duration;
                    this._seekBarTime(this._getTimeFormattedString(Math.round(this.currentTime)));
                    isFinite(fraction) ? this._seekBarValue(this.seekBarMin + fraction * (this.seekBarMax - this.seekBarMin)) : this._seekBarValue(this.seekBarMin)
                }, _setPlaybackSrc: function(src) {
                    try {
                        this._mediaElement.src = src
                    }
                    catch(e) {}
                }, _updateMediaElement: function() {
                    var videoElements = this._container.getElementsByTagName("video");
                    if (videoElements.length === 1)
                        this._mediaElement = videoElements[0];
                    else {
                        var audioElements = this._container.getElementsByTagName("audio");
                        this._mediaElement = audioElements[0]
                    }
                }, _updateTime: function(value) {
                    var duration = this.duration;
                    var currTime = duration * (value - this.seekBarMin) / (this.seekBarMax - this.seekBarMin);
                    isFinite(currTime) && (this.currentTime = currTime)
                }, loadAsync: function(mediaId, startTime, container) {
                    this._container = container;
                    this._updateMediaElement();
                    var oldValue = "";
                    oldValue = this._mediaElement.src;
                    this._setPlaybackSrc("");
                    this._recreatePlaybackElement();
                    var newValue = mediaId || "";
                    return AppMagic.Utility.mediaUrlHelper(oldValue, newValue).then(function(src) {
                            this._setPlaybackSrc(src)
                        }.bind(this), function(){}), this._seekBarDuration(this._getTimeFormattedString(0)), this._seekBarTime(this._getTimeFormattedString(0)), this._seekBarValue(this.seekBarMin), startTime !== 0 && (this.currentTime = startTime), WinJS.Promise.wrap(!0)
                }, play: function() {
                    this.beforePlay.invoke();
                    try {
                        this._mediaElement.play()
                    }
                    catch(err) {
                        if (!(err instanceof Error && err.number === this.E_UNEXPECTED))
                            throw err;
                    }
                }, pause: function() {
                    this.beforePause.invoke();
                    try {
                        this._mediaElement.pause()
                    }
                    catch(err) {
                        if (!(err instanceof Error && err.number === this.E_UNEXPECTED))
                            throw err;
                    }
                }, currentTime: {
                    get: function() {
                        return this._mediaElement.currentTime
                    }, set: function(value) {
                            if (this._mediaElement.readyState >= HTMLMediaElement.HAVE_METADATA)
                                this._mediaElement.currentTime = value;
                            else {
                                var loadedMetadataHandler = function() {
                                        this._mediaElement.currentTime = value;
                                        this._mediaElement.removeEventListener("loadedmetadata", loadedMetadataHandler)
                                    }.bind(this);
                                this._mediaElement.addEventListener("loadedmetadata", loadedMetadataHandler)
                            }
                        }
                }, duration: {get: function() {
                        return this._mediaElement.duration
                    }}, isPaused: {get: function() {
                        return this._mediaElement.paused
                    }}, loop: {
                    get: function() {
                        return this._loop()
                    }, set: function(value) {
                            this._loop(value)
                        }
                }, showControls: {
                    get: function() {
                        return this._showControls()
                    }, set: function(value) {
                            this._showControls(value)
                        }
                }, dispose: function() {
                    AppMagic.Utility.Disposable.prototype.dispose.call(this);
                    this._mediaElement && this._setPlaybackSrc("")
                }
        }),
        NullMediaElement = WinJS.Class.define(function NullMediaElement_ctor(){}, {
            play: function(){}, pause: function(){}, currentTime: {
                    get: function() {
                        return 0
                    }, set: function(value){}
                }, duration: {get: function() {
                        return 0
                    }}, loop: {
                    get: function() {
                        return !1
                    }, set: function(value){}
                }, paused: {get: function() {
                        return !0
                    }}, src: {
                    get: function() {
                        return ""
                    }, set: function(value){}
                }, readyState: {get: function() {
                        return HTMLMediaElement.HAVE_METADATA
                    }}
        }),
        AudioHtmlMedia = WinJS.Class.derive(HtmlMedia, function AudioHtmlMedia_ctor() {
            HtmlMedia.call(this)
        }, {template: {get: function() {
                    return "audio"
                }}}),
        VideoHtmlMedia = WinJS.Class.derive(HtmlMedia, function VideoHtmlMedia_ctor() {
            HtmlMedia.call(this)
        }, {template: {get: function() {
                    return "video"
                }}});
    WinJS.Namespace.define("AppMagic.Controls", {
        AudioHtmlMedia: AudioHtmlMedia, VideoHtmlMedia: VideoHtmlMedia
    })
})();