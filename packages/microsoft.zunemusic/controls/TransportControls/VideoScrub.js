/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {VideoScrub: MS.Entertainment.UI.Framework.defineUserControl("/Controls/TransportControls/VideoScrub.html#videoScrubTemplate", function(element, options) {
            this._bindingsToDetach = []
        }, {
            _initialized: false, _toUninitialize: null, _scrubPositionMs: 0, _lastScrubPositionSec: 0, initialize: function initialize() {
                    this.bind("playbackSession", this._playbackSessionChanged.bind(this));
                    this._initialized = true
                }, _detachBindings: function _detachBindings() {
                    this._bindingsToDetach.forEach(function(e) {
                        e.source.unbind(e.name, e.action)
                    });
                    this._bindingsToDetach = []
                }, _initializeBinding: function _initializeBinding(source, name, action) {
                    source.bind(name, action);
                    this._bindingsToDetach.push({
                        source: source, name: name, action: action
                    })
                }, unload: function unload() {
                    this._detachBindings();
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, _playbackSessionChanged: function _playbackSessionChanged() {
                    this._detachBindings();
                    if (this.playbackSession) {
                        this.playbackSession.pausePlaybackWhileScrubbing = false;
                        this.playbackSession.minScrubStep = 5000
                    }
                    this._updateValues()
                }, startScrubbing: function startScrubbing() {
                    if (this.playbackSession && this.playbackSession.canScrub) {
                        this.playbackSession.scrubActive = true;
                        this.playbackSession.thumbnailDiv = this.videoScrubThumbnail;
                        this.playbackSession.scrubPosition = this.playbackSession.currentPosition;
                        this.videoScrubActive = true
                    }
                    else
                        this.videoScrubActive = false
                }, stopScrubbing: function stopScrubbing() {
                    this.videoScrubActive = false;
                    if (this.playbackSession)
                        this.playbackSession.scrubActive = false
                }, setScrubPosition: function setScrubPosition(value) {
                    if (this._lastScrubPositionSec !== parseInt(value / 1000)) {
                        this._lastScrubPositionSec = parseInt(value / 1000);
                        this._scrubPositionMs = value;
                        if (this.playbackSession)
                            this.playbackSession.scrubPosition = value;
                        this._updateValues()
                    }
                }, _updateValues: function _updateValues() {
                    if (!this._initialized)
                        return;
                    var newVal = MS.Entertainment.Utilities.millisecondsToTimeCode(this._scrubPositionMs);
                    if (this.scrubPositionText.textContent !== newVal)
                        this.scrubPositionText.textContent = newVal
                }
        }, {
            playbackSession: null, videoScrubActive: false
        })})
})()
