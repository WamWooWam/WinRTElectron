//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var ExpectedIframeHostOrigin = "ms-appx-web://" + decodeURIComponent(document.domain),
        IframeMedia = WinJS.Class.derive(AppMagic.Controls.Media, function IframeMedia_ctor(template) {
            AppMagic.Controls.Media.call(this);
            this.track("_eventTracker", new AppMagic.Utility.EventTracker);
            this._template = template
        }, {
            _eventTracker: null, _channel: null, _element: null, _template: null, _duration: 0, _currentTime: 0, _loop: !1, _paused: !0, _showControls: !0, onNavigationStarting: function(data, evt) {
                    return evt.uri !== this._webViewUri && evt.preventDefault(), !0
                }, _loadFrameAsync: function() {
                    var src = this._webViewUri;
                    if (this._element.src === src)
                        return WinJS.Promise.as(!0);
                    else {
                        var complete,
                            promise = new WinJS.Promise(function(comp) {
                                complete = comp
                            }),
                            element = this._element,
                            onLoad = function() {
                                this._eventTracker.remove(element, "MSWebViewFrameDOMContentLoaded");
                                this.isDisposed || (this._channel && this._eventTracker.remove(this._channel, "message"), this.track("_channel", new WebViewChannel("onIframeMediaMessage", element)), this._eventTracker.add(this._channel, "message", this._onMessage, this));
                                complete()
                            };
                        return this._eventTracker.add(element, "MSWebViewFrameDOMContentLoaded", onLoad, this), this._element.src = src, promise
                    }
                }, dispose: function() {
                    this._disposeWebViewElement();
                    AppMagic.Utility.Disposable.prototype.dispose.call(this);
                    this._template = null;
                    this._channel = null;
                    this._eventTracker = null
                }, _disposeWebViewElement: function() {
                    if (this._element) {
                        var element = this._element;
                        this._element = null;
                        element.style.display = "none";
                        document.body.appendChild(element);
                        this._postMessageAsync({command: "dispose"}).then(function() {
                            ko.cleanNode(element);
                            element.removeNode()
                        }.bind(this))
                    }
                }, _onMessage: function(evt) {
                    var message = evt.detail;
                    switch (message.command) {
                        case"ended event":
                            this._loop ? this._postMessageAsync({command: "play"}) : this.ended.invoke();
                            break;
                        case"error event":
                            this.error.invoke();
                            break;
                        case"loaded event":
                            this.metadataLoaded.invoke();
                            break;
                        case"paused event":
                            this.paused.invoke();
                            break;
                        case"playing event":
                            this.playing.invoke();
                            break;
                        case"time update event":
                            this._currentTime = message.data.currentTime;
                            this._duration = message.data.duration;
                            this.durationChanged.invoke();
                            this.timeUpdated.invoke();
                            break;
                        default:
                            break
                    }
                }, _postMessageAsync: function(message) {
                    return this._channel ? this._channel.postMessageAsync(message) : WinJS.Promise.wrap(!1)
                }, _webViewUri: {get: function() {
                        return "ms-appx-web://" + window.location.hostname + "/ctrllib/videoPlayback/html/" + this._template + ".html"
                    }}, loadAsync: function(mediaId, startTime, container) {
                    var elements = container.getElementsByTagName("x-ms-webview");
                    return this._element = elements[0], this._loadFrameAsync().then(function() {
                            this._postMessageAsync({
                                command: "load", value: {
                                        mediaId: mediaId, startTime: startTime
                                    }
                            })
                        }.bind(this))
                }, play: function() {
                    this.beforePlay.invoke();
                    this._postMessageAsync({command: "play"})
                }, pause: function() {
                    this.beforePause.invoke();
                    this._postMessageAsync({command: "pause"})
                }, currentTime: {
                    get: function() {
                        return this._currentTime
                    }, set: function(value) {
                            this._postMessageAsync({
                                command: "set currentTime", value: value
                            })
                        }
                }, duration: {get: function() {
                        return this._duration
                    }}, isPaused: {get: function() {
                        return this._paused
                    }}, loop: {
                    get: function() {
                        return this._loop
                    }, set: function(value) {
                            this._loop = value
                        }
                }, showControls: {
                    get: function() {
                        return this._showControls
                    }, set: function(value) {
                            this._showControls = value;
                            this._postMessageAsync({
                                command: "set showControls", value: value
                            })
                        }
                }, template: {get: function() {
                        return this._template
                    }}
        }),
        WebViewChannel = WinJS.Class.derive(AppMagic.Utility.Disposable, function WebViewChannel_ctor(childHandlerName, element) {
            AppMagic.Utility.Disposable.call(this);
            this.track("_eventTracker", new AppMagic.Utility.EventTracker);
            this._childHandlerName = childHandlerName;
            this._element = element;
            this._eventTracker.add(element, "MSWebViewScriptNotify", function(evt) {
                var message = JSON.parse(evt.value);
                this.dispatchEvent("message", message)
            }, this)
        }, {
            _childHandlerName: null, _element: null, postMessageAsync: function(message) {
                    var jsonMessage = JSON.stringify(message),
                        completed,
                        error,
                        promise = new WinJS.Promise(function(c, e) {
                            completed = c;
                            error = e
                        }),
                        asyncOperation = this._element.invokeScriptAsync(this._childHandlerName, jsonMessage);
                    return asyncOperation.oncomplete = completed, asyncOperation.onerror = error, asyncOperation.start(), promise
                }
        });
    WinJS.Class.mix(WebViewChannel, WinJS.Utilities.eventMixin);
    WinJS.Namespace.define("AppMagic.Controls", {IframeMedia: IframeMedia})
})();