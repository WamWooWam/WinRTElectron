/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {VolumeBar: MS.Entertainment.UI.Framework.defineUserControl("/Controls/TransportControls/VolumeBar.html#volumeControl", function volumeBarConstructor(element, options) {
            if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.volumeService)) {
                this._volumeControllerService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.volumeService);
                this.volumeValue = this._volumeControllerService.volume * 100;
                this.iconType = this._volumeControllerService.mute ? WinJS.UI.AppBarIcon.mute : WinJS.UI.AppBarIcon.volume;
                if (!MS.Entertainment.Utilities.isMusicApp1)
                    this._systemVolumeBinding = WinJS.Binding.bind(this._volumeControllerService, {
                        volume: this._onSystemVolumeValueChange.bind(this), mute: this._onSystemMuteStateChange.bind(this)
                    });
                this._uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                this._uiStateEventHandlers = MS.Entertainment.Utilities.addEventHandlers(this._uiStateService, {
                    windowresize: this._onUiStateChange.bind(this), isSnappedChanged: this._onUiStateChange.bind(this), isSettingsCharmVisibleChanged: this._onUiStateChange.bind(this), appBarVisibleChanged: this._onUiStateChange.bind(this)
                });
                var localMuteAction = new MS.Entertainment.UI.ToolbarAction;
                localMuteAction.automationId = MS.Entertainment.UI.AutomationIds.muteVolume;
                localMuteAction.id = "muteVolume";
                localMuteAction.executed = function MuteExecuted() {
                    this.onStateChange()
                }.bind(this);
                this._muteAction = localMuteAction
            }
            else
                MS.Entertainment.UI.Controls.assert(this._volumeControllerService, "Volume service not registered.")
        }, {
            _volumeControllerService: null, _systemVolumeBinding: null, _mouseWheelEventHandler: null, muteButton: null, _uiStateService: null, _uiStateEventHandlers: null, _autoHideDuration: 3000, initialize: function initialize() {
                    this._mouseWheelEventHandler = MS.Entertainment.Utilities.addEventHandlers(document.body, {mousewheel: this.onMouseWheelMove.bind(this)});
                    this._resetAutoHideTimer()
                }, _onSystemVolumeValueChange: function _onSystemVolumeValueChange() {
                    if (this.volumeValue !== (this._volumeControllerService.volume * 100)) {
                        var oldValue = this.volumeValue;
                        this.volumeValue = this._volumeControllerService.volume * 100;
                        this.notify("volumeValue", this.volumeValue, oldValue)
                    }
                }, _onSystemMuteStateChange: function _onSystemMuteStateChange() {
                    var oldValue = this.iconType;
                    this.iconType = this._volumeControllerService.mute ? WinJS.UI.AppBarIcon.mute : WinJS.UI.AppBarIcon.volume;
                    this.notify("iconType", this.iconType, oldValue)
                }, _onUiStateChange: function _onUiStateChange() {
                    this._closeOverlay()
                }, onMouseWheelMove: function onMouseWheelMove(args) {
                    var mouseWheelNormalizedDelta = Math.floor(args.wheelDelta / MS.Entertainment.UI.Controls.VolumeBar.MOUSE_WHEEL_DELTA_COEFFICIENT);
                    var delta = mouseWheelNormalizedDelta * MS.Entertainment.UI.Controls.VolumeBar.MOUSE_WHEEL_VOLUME_STEP;
                    var newVolume = (this._volumeControllerService.volume * 100) + delta;
                    if (newVolume > 100)
                        newVolume = 100;
                    else if (newVolume < 0)
                        newVolume = 0;
                    this._updateValue(newVolume);
                    this._onSystemVolumeValueChange()
                }, onValueChange: function onValueChange(args) {
                    this._updateValue(args.target.value);
                    this._resetAutoHideTimer()
                }, _updateValue: function _updateValue(newVolumeValue) {
                    if (this._volumeControllerService) {
                        if (this._volumeControllerService.mute)
                            this.onStateChange();
                        this._volumeControllerService.volume = (newVolumeValue) / 100
                    }
                }, onStateChange: function onStateChange(args) {
                    if (this._volumeControllerService) {
                        this._volumeControllerService.mute = !this._volumeControllerService.mute;
                        var oldValue = this.iconType;
                        this.iconType = this._volumeControllerService.mute ? WinJS.UI.AppBarIcon.mute : WinJS.UI.AppBarIcon.volume;
                        this.notify("iconType", this.iconType, oldValue);
                        this.muteButton.isChecked = this._volumeControllerService.mute;
                        this.muteButton._button.setAttribute("aria-live", "assertive");
                        this.muteButton._button.removeAttribute("aria-live")
                    }
                }, _closeOverlay: function _closeOverlay() {
                    if (this._unloaded)
                        return;
                    var domEvent = document.createEvent("Event");
                    domEvent.initEvent("dismissoverlay", true, true);
                    this.domElement.dispatchEvent(domEvent);
                    this._clearAutoHideTimer()
                }, _resetAutoHideTimer: function _resetAutoHideTimer() {
                    this._clearAutoHideTimer();
                    if (this._autoHideDuration > 0)
                        this.autoHideTimeout = WinJS.Promise.timeout(this._autoHideDuration).then(function volumeControlAutoHide() {
                            this._closeOverlay()
                        }.bind(this))
                }, _clearAutoHideTimer: function _clearAutoHideTimer() {
                    if (this.autoHideTimeout) {
                        this.autoHideTimeout.cancel();
                        this.autoHideTimeout = null
                    }
                }, unload: function unload() {
                    if (this._volumeControllerService) {
                        MS.Entertainment.Utilities.Telemetry.logVolumeSelected(this._volumeControllerService.volume);
                        MS.Entertainment.Utilities.Telemetry.logMuteStateSelected(this._volumeControllerService.mute);
                        var appBar = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar);
                        if (appBar && appBar.hide)
                            appBar.sticky = false;
                        if (this._systemVolumeBinding) {
                            this._systemVolumeBinding.cancel();
                            this._systemVolumeBinding = null
                        }
                        if (this._uiStateEventHandlers) {
                            this._uiStateEventHandlers.cancel();
                            this._uiStateEventHandlers = null
                        }
                        if (this._mouseWheelEventHandler) {
                            this._mouseWheelEventHandler.cancel();
                            this._mouseWheelEventHandler = null
                        }
                        this._clearAutoHideTimer()
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }
        }, null, {
            MOUSE_WHEEL_DELTA_COEFFICIENT: 30, MOUSE_WHEEL_VOLUME_STEP: 2
        })})
})()
