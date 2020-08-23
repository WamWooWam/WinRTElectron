/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Controls/TransportControls/TransportControls.js", "/Framework/corefx.js");
(function(undefined) {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {NowPlayingTransportControls: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.TransportControls", "/Controls/NowPlaying/NowPlayingTransportControls.html#transportControlsTemplate", function nowPlayingTransportControls() {
            this._isNowPlayingControls = true
        }, {initialize: function initialize() {
                MS.Entertainment.UI.Controls.TransportControls.prototype.initialize.call(this);
                this._skipBackAction.automationId = MS.Entertainment.UI.AutomationIds.nowPlayingTransportSkipBack;
                this._skipBackHoldAction.automationId = MS.Entertainment.UI.AutomationIds.nowPlayingTransportSkipBackHold;
                this._playAction.automationId = MS.Entertainment.UI.AutomationIds.nowPlayingTransportPlay;
                this._pauseAction.automationId = MS.Entertainment.UI.AutomationIds.nowPlayingTransportPause;
                this._skipForwardAction.automationId = MS.Entertainment.UI.AutomationIds.nowPlayingTransportSkipForward;
                this._skipForwardHoldAction.automationId = MS.Entertainment.UI.AutomationIds.nowPlayingTransportSkipForwardHold;
                if (this._volumeAction) {
                    this._volumeAction.automationId = MS.Entertainment.UI.AutomationIds.nowPlayingTransportVolume;
                    this._volumeHoldAction.automationId = MS.Entertainment.UI.AutomationIds.nowPlayingTransportVolumeHold
                }
                this._skipBackAction.icon = null;
                this._skipBackHoldAction.icon = null;
                this._playAction.icon = null;
                this._pauseAction.icon = null;
                this._skipForwardAction.icon = null;
                this._skipForwardHoldAction.icon = null;
                if (this._volumeAction) {
                    this._volumeAction.icon = null;
                    this._volumeHoldAction.icon = null
                }
                this._skipBackAction.title = null;
                this._skipBackHoldAction.title = null;
                this._playAction.title = String.load(String.id.IDS_TRANSPORT_CONTROLS_PLAY_BUTTON);
                this._pauseAction.title = String.load(String.id.IDS_TRANSPORT_CONTROLS_PAUSE_BUTTON);
                this._skipForwardAction.title = null;
                this._skipForwardHoldAction.title = null;
                if (this._volumeAction) {
                    this._volumeAction.title = null;
                    this._volumeHoldAction.title = null
                }
                if (MS.Entertainment.Utilities.isMusicApp2) {
                    this.nowPlayingSkipBackVisible = true;
                    this.nowPlayingSkipForwardVisible = true;
                    this._skipForwardAction.title = String.load(String.id.IDS_MUSIC2_APP_MENU_NEXT_SONG_BUTTON_VUI_GUI);
                    this._skipBackAction.title = String.load(String.id.IDS_MUSIC2_APP_MENU_PREVIOUS_SONG_BUTTON_VUI_GUI)
                }
            }})})
})()
