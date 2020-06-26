//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var util = AppMagic.Utility,
        Playback = WinJS.Class.define(function Playback_ctor(){}, {
            onChangeMediaThrottleTime: 0, initControlContext: function(controlContext) {
                    util.createOrSetPrivate(controlContext, "_isLoaded", !0)
                }, disposeControlContext: function(controlContext) {
                    controlContext._isLoaded = !1
                }, initView: function(container, controlContext) {
                    var playbackViewModel = new AppMagic.Controls.PlaybackViewModel(this, controlContext, this._mediaFactory, container);
                    util.createOrSetPrivate(controlContext, "playbackViewModel", playbackViewModel);
                    util.createOrSetPrivate(controlContext, "_parentScreenActiveSubscription", null);
                    controlContext.properties.Time(0);
                    controlContext.properties.Duration(0);
                    this._initHtmlElements(container, controlContext);
                    playbackViewModel.init();
                    var mediaSource = controlContext.properties.Media();
                    ko.applyBindings(playbackViewModel, container);
                    playbackViewModel._onChangeMedia(mediaSource);
                    controlContext._parentScreenActiveSubscription = controlContext.isParentScreenActive.subscribe(function(newValue) {
                        controlContext.realized && this._playOrPause(controlContext, newValue)
                    }, this);
                    controlContext.isParentScreenActive() && controlContext.properties.Paused(!controlContext.properties.AutoStart())
                }, disposeView: function(container, controlContext) {
                    controlContext._parentScreenActiveSubscription.dispose();
                    controlContext._parentScreenActiveSubscription = null;
                    controlContext.playbackViewModel.dispose();
                    controlContext.playbackViewModel = null
                }, onChangeAutoStart: function(evt, controlContext) {
                    evt.newValue !== null && controlContext.realized && this._playOrPause(controlContext, controlContext.isParentScreenActive())
                }, onChangeLoop: function(evt, controlContext) {
                    controlContext.realized && (controlContext.playbackViewModel._mediaObject().loop = evt.newValue === null ? !1 : evt.newValue)
                }, onChangeStartTime: function(evt, controlContext) {
                    evt.newValue !== null && controlContext.realized && (controlContext.playbackViewModel._mediaObject().currentTime = evt.newValue < controlContext.properties.Duration() ? evt.newValue : controlContext.properties.Duration())
                }, onChangeShowControls: function(evt, controlContext) {
                    controlContext.realized && (controlContext.playbackViewModel._mediaObject().showControls = evt.newValue === null ? !1 : evt.newValue)
                }, onChangeStart: function(evt, controlContext) {
                    controlContext.realized && evt.newValue !== null && (evt.newValue ? controlContext.playbackViewModel.play() : controlContext.playbackViewModel.pause())
                }, _playOrPause: function(controlContext, newValue) {
                    controlContext.properties.AutoStart() && newValue && controlContext.playbackViewModel.play();
                    controlContext.properties.AutoPause() && !newValue && controlContext.playbackViewModel.pause()
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Controls", {Playback: Playback})
})();