//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(Platform) {"use strict";
    var AuthoringAudioPlayback = WinJS.Class.derive(AppMagic.Controls.AudioPlayback, function AuthoringAudioPlayback_ctor() {
            AppMagic.Controls.AudioPlayback.call(this);
            this.onChangeMediaThrottleTime = AppMagic.Constants.Controls.onChangeMediaThrottle
        }, {onModeChanged: function(evt, controlContext) {
                evt.newMode === "edit" ? controlContext.playbackViewModel._isMediaThrottling(!0) : controlContext.playbackViewModel._isMediaThrottling(!1)
            }}, {});
    WinJS.Namespace.define("AppMagic.Controls", {AuthoringAudioPlayback: AuthoringAudioPlayback})
})(Windows);