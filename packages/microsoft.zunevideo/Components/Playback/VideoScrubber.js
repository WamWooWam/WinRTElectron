/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Components/Playback/Controls/PlaybackControl.js", "/Framework/utilities.js");
(function() {
    "use strict";
    var MSEPlatform = WinJS.Namespace.define("MS.Entertainment.Platform", null);
    WinJS.Namespace.defineWithParent(MSEPlatform, "Playback", {VideoScrubberObservables: MS.Entertainment.defineObservable(function VideoScrubberObservables_constructor() {
            var _this = this;
            this.bind("scrubActive", function scrubActiveChanged(activate) {
                _this._toggleScrub(activate)
            })
        }, {
            canScrub: false, scrubActive: false
        })});
    WinJS.Namespace.defineWithParent(MSEPlatform, "Playback", {VideoScrubber: MS.Entertainment.UI.Framework.derive("MSEPlatform.Playback.VideoScrubberObservables", function VideoScrubber_constructor(playbackControl) {
            if (!playbackControl)
                return;
            MSEPlatform.Playback.VideoScrubberObservables.prototype.constructor.call(this);
            this._iPlaybackControl = playbackControl;
            this._parkedThumbnailDiv = document.createElement("div");
            WinJS.Utilities.addClass(this._parkedThumbnailDiv, "removeFromDisplay");
            document.body.appendChild(this._parkedThumbnailDiv);
            var videoScrubber = this;
            playbackControl.bind("currentMedia", function(newMedia) {
                videoScrubber._onMediaChanged(newMedia, videoScrubber)
            })
        }, {
            pausePlaybackWhileScrubbing: true, minScrubStep: 5000, thumbnailDiv: {set: function VideoScrubber_thumbnailDiv_set(value) {
                        this._onThumbnailDivChanged(value)
                    }}, scrubPosition: {
                    get: function VideoScrubber_scrubPosition_get() {
                        return this._scrubPosition
                    }, set: function VideoScrubber_scrubPosition_set(value) {
                            this._onScrubPositionChanged(value)
                        }
                }, _toggleScrub: function VideoScrubber_toggleScrub(activate) {
                    if (activate) {
                        if (this._iPlaybackControl) {
                            this._transportStateBeforeScrub = this._iPlaybackControl.currentTransportState;
                            if (this.pausePlaybackWhileScrubbing)
                                this._iPlaybackControl.targetTransportState = MSEPlatform.Playback.TransportState.paused
                        }
                    }
                    else if (this._iPlaybackControl && this._thumbnailPlayer) {
                        this._iPlaybackControl.seekToPosition(this._thumbnailPlayer.currentTime * 1000);
                        this._iPlaybackControl.targetTransportState = this._transportStateBeforeScrub
                    }
                }, _onMediaChanged: function VideoScrubber_onMediaChanged(newMedia, _this) {
                    _this._reset();
                    _this._thumbnailPlayer = _this._thumbnailGenerator.start(newMedia, _this._onThumbnailCacheReady, _this);
                    if (_this._thumbnailPlayer && _this._thumbnailDiv)
                        _this._thumbnailDiv.appendChild(_this._thumbnailPlayer)
                }, _onThumbnailCacheReady: function VideoScrubber_onThumbnailCacheReady(_this) {
                    try {
                        _this._thumbnailPlayer.currentTime = 1;
                        _this.canScrub = true
                    }
                    catch(e) {
                        if (e.code !== e.INDEX_SIZE_ERR)
                            throw(e);
                        else {
                            _this._initialSeekRetryCount++;
                            if (_this._initialSeekRetryCount > 3)
                                throw(e);
                            else
                                WinJS.Promise.timeout(10).then(function retryInitialSeek() {
                                    _this._onThumbnailCacheReady(_this)
                                })
                        }
                    }
                }, _onThumbnailDivChanged: function VideoScrubber_onThumbnailDivChanged(newDiv) {
                    if (this._thumbnailPlayer && newDiv) {
                        newDiv.appendChild(this._thumbnailPlayer);
                        this._thumbnailPlayer.pause();
                        this._thumbnailDiv = newDiv
                    }
                }, _onScrubPositionChanged: function VideoScrubber_onScrubPositionChanged(newScrubPos) {
                    if (this._verifyScrubability(newScrubPos))
                        this._presentThumbnail(newScrubPos)
                }, _verifyScrubability: function VideoScrubber_verifyScrubability(newScrubPos) {
                    return (this.scrubActive && this.canScrub && (Math.abs(newScrubPos - this._scrubPosition) >= this.minScrubStep))
                }, _presentThumbnail: function VideoScrubber_presentThumbnail(newScrubPos) {
                    if (!this._thumbnailPlayer)
                        return;
                    try {
                        var scrubPos = newScrubPos / 1000;
                        if (scrubPos < 0)
                            scrubPos = 0;
                        if (scrubPos > this._thumbnailPlayer.duration)
                            scrubPos = this._thumbnailPlayer.duration;
                        this._thumbnailPlayer.currentTime = scrubPos;
                        this._scrubPosition = newScrubPos
                    }
                    catch(e) {
                        if (e.code !== e.INDEX_SIZE_ERR)
                            throw(e);
                    }
                }, _reset: function VideoScrubber_reset() {
                    this.canScrub = false;
                    this.scrubActive = false;
                    this._transportStateBeforeScrub = MSEPlatform.Playback.TransportState.playing;
                    this._scrubPosition = 0;
                    this._initialSeekRetryCount = 0
                }, _scrubPosition: 0, _iPlaybackControl: null, _thumbnailPlayer: null, _thumbnailDiv: null, _transportStateBeforeScrub: null, _initialSeekRetryCount: 0, _parkedThumbnailDiv: null, _thumbnailGenerator: {
                    _thumbnailCache: null, start: function thumbnailGenerator_start(media, thumbnailReadyCallback, scrubberInstance) {
                            if (!media || !thumbnailReadyCallback)
                                return null;
                            if (media.mediaType === Microsoft.Entertainment.Queries.ObjectType.track)
                                return null;
                            if (!this._isThumbnailEnabled())
                                return null;
                            if (this._thumbnailCache) {
                                this._thumbnailCache.removeEventListener("loadeddata", thumbnailReadyCallback);
                                this._thumbnailCache.removeAttribute("src")
                            }
                            this._thumbnailCache = document.createElement("video");
                            this._thumbnailCache.autobuffer = true;
                            this._thumbnailCache.msRealTime = true;
                            this._thumbnailCache.muted = true;
                            this._thumbnailCache.src = media.source;
                            scrubberInstance._parkedThumbnailDiv.appendChild(this._thumbnailCache);
                            this._thumbnailCache.addEventListener("loadeddata", function() {
                                thumbnailReadyCallback(scrubberInstance)
                            });
                            this._thumbnailCache.style.width = "100%";
                            this._thumbnailCache.style.height = "100%";
                            return this._thumbnailCache
                        }, _isThumbnailEnabled: (function thumbnailGenerator_isEnabled() {
                            var configurationManager;
                            return function _isThumbnailEnabled() {
                                    if (!configurationManager)
                                        configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                                    return configurationManager.playback.enableVideoScrubbing
                                }
                        })()
                }
        }, {})})
})()
