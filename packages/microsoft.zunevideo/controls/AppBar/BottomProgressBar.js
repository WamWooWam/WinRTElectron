/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Framework/corefx.js", "/Framework/utilities.js");
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {BottomProgressBar: MS.Entertainment.UI.Framework.defineUserControl("/Controls/AppBar/BottomProgressBar.html#Template", function(element, options) {
            this._bindingsToDetach = []
        }, {
            _initialized: false, _bindingsToDetach: null, initialize: function initialize() {
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
                }, _playbackSessionChanged: function _playbackSessionChanged() {
                    this._detachBindings();
                    if (this.playbackSession)
                        this._initializeBinding(this.playbackSession, "currentPosition", this._mediaPositionChanged.bind(this))
                }, _mediaPositionChanged: function _mediaPositionChanged() {
                    var durationMs = this.playbackSession.getProperty("duration");
                    var positionMs = this.playbackSession.getProperty("currentPosition");
                    this.value = Math.min(durationMs, positionMs);
                    this.max = durationMs;
                    this.min = 0
                }
        }, {
            min: 0, max: 100, value: 0, playbackSession: null, appBarVisible: false, onMouseEvent: function onMouseEvent(event) {
                    switch (event.type)
                    {
                        case"click":
                            MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar).show();
                            break
                    }
                }
        })})
})()
