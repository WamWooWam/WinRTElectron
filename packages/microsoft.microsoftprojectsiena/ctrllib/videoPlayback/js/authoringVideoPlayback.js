//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(Platform) {"use strict";
    var AuthoringVideoPlayback = WinJS.Class.derive(AppMagic.Controls.VideoPlayback, function AuthoringVideoPlayback_ctor() {
            AppMagic.Controls.VideoPlayback.call(this);
            this.onChangeMediaThrottleTime = AppMagic.Constants.Controls.onChangeMediaThrottle
        }, {onModeChanged: function(evt, controlContext) {
                evt.newMode === "edit" ? controlContext.playbackViewModel._isMediaThrottling(!0) : controlContext.playbackViewModel._isMediaThrottling(!1);
                controlContext.playbackViewModel.isEditing(evt.newMode === "edit")
            }}, {});
    WinJS.Namespace.define("AppMagic.Controls", {AuthoringVideoPlayback: AuthoringVideoPlayback})
})(Windows);