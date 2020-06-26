//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(Platform) {"use strict";
    var util = AppMagic.Utility,
        CLASS_NOT_REGISTERED_ERROR = -2147221164,
        Microphone = WinJS.Class.define(function Microphone_ctor(){}, {
            microphoneViewModel: null, initControlContext: function(controlContext) {
                    util.createOrSetPrivate(controlContext, "isControlLoaded", ko.observable(!1));
                    util.createOrSetPrivate(controlContext, "_isLoaded", !0);
                    var viewModel = new AppMagic.Controls.MicrophoneViewModel(controlContext);
                    util.createOrSetPrivate(controlContext, "microphoneViewModel", viewModel);
                    util.createOrSetPrivate(controlContext, "backgroundImage", ko.observable(""))
                }, disposeControlContext: function(controlContext) {
                    controlContext.microphoneViewModel.dispose();
                    controlContext.isControlLoaded = null;
                    controlContext._isLoaded = !1
                }, initView: function(container, controlContext) {
                    controlContext.viewState.disabled.subscribe(function(newValue) {
                        newValue && controlContext.microphoneViewModel.actionHandler(!0)
                    });
                    util.createOrSetPrivate(controlContext, "isDeviceAvailable", ko.computed(function() {
                        return controlContext.realized ? controlContext.microphoneViewModel.isDeviceAvailable && !controlContext.viewState.disabled() : !1
                    }));
                    util.createOrSetPrivate(controlContext, "label", ko.computed(function() {
                        return controlContext.isDeviceAvailable() ? controlContext.microphoneViewModel.isRecording ? controlContext.microphoneViewModel.recordTimeTotal : AppMagic.Strings.StartRecording : AppMagic.Strings.Unavailable
                    }));
                    util.createOrSetPrivate(controlContext, "onClick", this.onClick);
                    controlContext.microphoneViewModel.initialize(controlContext.isControlLoaded);
                    ko.applyBindings(controlContext, container)
                }, onClick: function(controlContext) {
                    controlContext.isControlLoaded() && !controlContext.viewState.disabled() && (controlContext.microphoneViewModel.actionHandler(!1), controlContext.behaviors.OnSelect())
                }, onChangeMic: function(evt, controlContext) {
                    if (evt.newValue !== null) {
                        controlContext.microphoneViewModel.microphoneId = controlContext.modelProperties.Mic.getValue();
                        var updateAvailableStatus = function() {
                                controlContext.microphoneViewModel.updateAvailableStatus()
                            }.bind(controlContext.microphoneViewModel);
                        updateAvailableStatus()
                    }
                }, onChangeImage: function(evt, controlContext) {
                    AppMagic.Utility.mediaUrlHelper(evt.oldValue, evt.newValue, !0).then(function(src) {
                        controlContext._isLoaded && controlContext.backgroundImage(src)
                    }, function(){})
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Controls", {Microphone: Microphone})
})(Windows);