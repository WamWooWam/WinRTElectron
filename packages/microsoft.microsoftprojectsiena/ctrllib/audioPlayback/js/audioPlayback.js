//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(Platform) {"use strict";
    var AudioPlayback = WinJS.Class.derive(AppMagic.Controls.Playback, function AudioPlayback_ctor() {
            this._mediaFactory = new AppMagic.Controls.AudioMediaFactory;
            AppMagic.Controls.Playback.call(this)
        }, {
            _initHtmlElements: function(container, controlContext) {
                AppMagic.Utility.createOrSetPrivate(controlContext.playbackViewModel, "backgroundImage", ko.observable(""));
                this.onChangeImage({
                    oldValue: null, newValue: controlContext.properties.Image()
                }, controlContext)
            }, onChangeImage: function(evt, controlContext) {
                    controlContext.realized && AppMagic.Utility.mediaUrlHelper(evt.oldValue || null, evt.newValue, !0).then(function(src) {
                        controlContext._isLoaded && controlContext.playbackViewModel.backgroundImage(src)
                    }.bind(this), function(){})
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Controls", {AudioPlayback: AudioPlayback})
})(Windows);