//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(Platform) {"use strict";
    var gridElementQuery = ".appmagic-video-playback-grid",
        playbackClassName = "appmagic-video-playback",
        VideoPlayback = WinJS.Class.derive(AppMagic.Controls.Playback, function VideoPlayback_ctor() {
            this._mediaFactory = new AppMagic.Controls.VideoMediaFactory;
            AppMagic.Controls.Playback.call(this)
        }, {
            _maxHeight: null, _minHeight: null, _changingImage: !1, _initHtmlElements: function(container, controlContext) {
                    this._maxHeight = controlContext.properties.maximumHeight();
                    this._minHeight = controlContext.properties.minimumHeight();
                    AppMagic.Utility.createOrSetPrivate(controlContext, "_videoParentScreenActiveSubscription", null);
                    AppMagic.Utility.createOrSetPrivate(controlContext.playbackViewModel, "hideControls", ko.observable(!1));
                    AppMagic.Utility.createOrSetPrivate(controlContext.playbackViewModel, "isEditing", ko.observable(!1));
                    AppMagic.Utility.createOrSetPrivate(controlContext.playbackViewModel, "isFullscreen", ko.observable(!1));
                    AppMagic.Utility.createOrSetPrivate(controlContext.playbackViewModel, "onClickFullscreenButton", this.onClickFullscreenButton.bind(this, controlContext));
                    AppMagic.Utility.createOrSetPrivate(controlContext.playbackViewModel, "onKeyUp", this._onKeyUp.bind(this, controlContext));
                    AppMagic.Utility.createOrSetPrivate(controlContext.playbackViewModel, "poster", ko.observable(""));
                    AppMagic.Utility.createOrSetPrivate(controlContext.playbackViewModel, "scaleFactor", ko.observable(1));
                    AppMagic.Utility.createOrSetPrivate(controlContext, "_onMediaChangedHandler", this._onMediaChanged.bind(this, controlContext));
                    controlContext.playbackViewModel.addEventListener("onMediaChanged", controlContext._onMediaChangedHandler);
                    controlContext._videoParentScreenActiveSubscription = controlContext.isParentScreenActive.subscribe(function(newValue) {
                        this._exitFullScreen(controlContext)
                    }, this);
                    this._updateControls(controlContext);
                    this.onChangeImage({
                        oldValue: null, newValue: controlContext.properties.Image()
                    }, controlContext)
                }, _onMediaChanged: function(controlContext) {
                    this._exitFullScreen(controlContext)
                }, _exitFullScreen: function(controlContext) {
                    if (controlContext.playbackViewModel.isFullscreen())
                        this.onClickFullscreenButton(controlContext)
                }, disposeView: function(container, controlContext) {
                    controlContext._videoParentScreenActiveSubscription.dispose();
                    controlContext._videoParentScreenActiveSubscription = null;
                    this._exitFullScreen(controlContext);
                    controlContext.playbackViewModel.removeEventListener("onMediaChanged", controlContext._onMediaChangedHandler);
                    AppMagic.Controls.Playback.prototype.disposeView.call(this, container, controlContext)
                }, _onKeyUp: function(controlContext, e) {
                    e.key === AppMagic.Constants.Keys.esc && controlContext.playbackViewModel.onClickFullscreenButton();
                    e.stopPropagation()
                }, onClickFullscreenButton: function(controlContext) {
                    var playback = controlContext.container.children[0];
                    var isFullscreen = !controlContext.playbackViewModel.isFullscreen(),
                        fullscreenHost = this._getFullscreenHost(),
                        playbackGrid = this._getPlaybackGrid(controlContext, fullscreenHost);
                    isFullscreen ? (controlContext.playbackViewModel.originalNextSibling = playbackGrid.nextSibling, fullscreenHost.appendChild(playbackGrid), document.addEventListener("keyup", controlContext.playbackViewModel.onKeyUp, !0)) : (playback.insertBefore(playbackGrid, controlContext.playbackViewModel.originalNextSibling), document.removeEventListener("keyup", controlContext.playbackViewModel.onKeyUp, !0), controlContext.playbackViewModel.originalNextSibling = null);
                    controlContext.playbackViewModel.isFullscreen(isFullscreen)
                }, onChangeHeight: function(evt, controlContext) {
                    this._updateControls(controlContext)
                }, onChangeWidth: function(evt, controlContext) {
                    this._updateControls(controlContext)
                }, onChangeImage: function(evt, controlContext) {
                    controlContext.realized && AppMagic.Utility.mediaUrlHelper(evt.oldValue, evt.newValue, !1).then(function(src) {
                        if (controlContext._isLoaded && (controlContext.playbackViewModel.poster(src), !this._changingImage)) {
                            this._changingImage = !0;
                            var oldDisplay = controlContext.container.style.display;
                            controlContext.container.style.display = "none";
                            setImmediate(function() {
                                try {
                                    controlContext && controlContext._isLoaded && controlContext.container && (controlContext.container.style.display = oldDisplay)
                                }
                                finally {
                                    this._changingImage = !1
                                }
                            }.bind(this))
                        }
                    }.bind(this), function(){})
                }, _getFullscreenHost: function() {
                    var fullscreenHost = document.querySelector(".fullscreenHost");
                    return fullscreenHost
                }, _getPlaybackGrid: function(controlContext, fullscreenHost) {
                    var grid;
                    return controlContext.playbackViewModel.isFullscreen() ? fullscreenHost.querySelector(gridElementQuery) : controlContext.container.querySelector(gridElementQuery)
                }, _updateControls: function(controlContext) {
                    controlContext.realized && (controlContext.properties.Height() < AppMagic.Constants.Video.videoMinPlayerHeight || controlContext.properties.Width() < AppMagic.Constants.Video.videoMinPlayerWidth ? controlContext.playbackViewModel.hideControls(!0) : controlContext.playbackViewModel.hideControls(!1), this._updateScaleFactor(controlContext))
                }, _updateScaleFactor: function(controlContext) {
                    var height = controlContext.properties.Height();
                    if (this._maxHeight === this._minHeight) {
                        controlContext.playbackViewModel.scaleFactor(AppMagic.Constants.Video.defaultScaleFactor);
                        return
                    }
                    controlContext.playbackViewModel.scaleFactor((height - this._minHeight) * (2 / (this._maxHeight - this._minHeight)) + 3)
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Controls", {VideoPlayback: VideoPlayback})
})(Windows);