//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var Media = WinJS.Class.derive(AppMagic.Utility.Disposable, function Media_ctor() {
            AppMagic.Utility.Disposable.call(this);
            this.beforePause = new EventObject;
            this.beforePlay = new EventObject;
            this.durationChanged = new EventObject;
            this.ended = new EventObject;
            this.error = new EventObject;
            this.metadataLoaded = new EventObject;
            this.paused = new EventObject;
            this.playing = new EventObject;
            this.timeUpdated = new EventObject
        }, {
            _disabled: !1, beforePause: null, beforePlay: null, durationChanged: null, ended: null, error: null, metadataLoaded: null, paused: null, playing: null, timeUpdated: null, loadAsync: function(mediaId, startTime, container) {
                    return WinJS.Promise.wrap(!0)
                }, play: function(){}, pause: function(){}, currentTime: {
                    get: function() {
                        return 0
                    }, set: function(value){}
                }, disabled: {
                    get: function() {
                        return this._disabled
                    }, set: function(value) {
                            this._disabled = value
                        }
                }, duration: {get: function() {
                        return 0
                    }}, isPaused: {get: function() {
                        return !0
                    }}, loop: {
                    get: function() {
                        return !1
                    }, set: function(value){}
                }, showControls: {
                    get: function() {
                        return !0
                    }, set: function(value){}
                }, template: {get: function() {
                        return "null"
                    }}
        }),
        EventObject = WinJS.Class.define(function EventObject_ctor() {
            this._listeners = [];
            this._invokeFn = this._invoke.bind(this)
        }, {
            _listeners: null, _invokeFn: null, subscribe: function(listener) {
                    this._listeners.push(listener)
                }, unsubscribe: function(listener) {
                    var index = this._listeners.indexOf(listener);
                    index >= 0 && this._listeners.splice(index, 1)
                }, invoke: {get: function() {
                        return this._invokeFn
                    }}, _invoke: function() {
                    var args = arguments;
                    this._listeners.forEach(function(listener) {
                        listener.apply(null, args)
                    })
                }
        });
    WinJS.Namespace.define("AppMagic.Controls", {
        EventObject: EventObject, Media: Media
    })
})();