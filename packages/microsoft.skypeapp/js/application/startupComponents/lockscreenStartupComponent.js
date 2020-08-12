

(function (Skype) {
    "use strict";

    var lockScreen = WinJS.Class.define(function () {
        this._hideAPPCover = this._updateScreenCover.bind(this, false);
    }, {
        _coverElement: null,
        _activationArguments: null,

        _handleLockscreenStateChange: function () {
            log("LockScreenStartUpComponent:_handleLockscreenStateChange " + Skype.Application.state.view.isOnLockScreen);
            Skype.UI.Util.setClass(document.body, "LOCKSCREEN", Skype.Application.state.view.isOnLockScreen);
            if (!Skype.Application.state.view.isOnLockScreen) {
                this._updateScreenCover(false);
            }
        },

        _hadleStateViewPropertyChange: function (event) {
            if (event.detail == "isOnLockScreen") {
                this._handleLockscreenStateChange();
            }
        },

        _updateScreenCover: function (show) {
            this._coverElement = this._coverElement || document.getElementById("applicationLockScreenCover");
            Skype.UI.Util.setClass(this._coverElement, "VISIBLE", show);
            log("LockScreenStartUpComponent: {0} application cover for lockscreen".format(show ? "Showing" : "Hiding"));
        },

        _reset: function () {
            Skype.ViewModel.LockScreenCall.activatedConversationId = null;
            Skype.Application.state.view.isOnLockScreen = false;
            this._activationArguments = null;
        },

        

        handleActivationFinished: function () {
            
            
            

            log("LockScreenStartUpComponent: handleActivationFinished - creating VM " + this._activationArguments.id);
            var lockScreenCallVm = new Skype.ViewModel.LockScreenCallVM(
                this._activationArguments.id,
                this._activationArguments.callUI,
                this._activationArguments.answerType,
                { hideAPPCover: this._hideAPPCover });
            return lockScreenCallVm.answerCall();
        },

        handleActivationStart: function (activationParams) {
            
            
            
            
            
            

            
            if (activationParams.args.mode === "lockScreen" && activationParams.args.activateCall) {
                Skype.ViewModel.LockScreenCall.activatedConversationId = activationParams.args.id;
                Skype.Application.state.view.isOnLockScreen = true;
                this._updateScreenCover(true);
                this._activationArguments = activationParams.args;
            } else {
                this._reset();
            }
            log("LockScreenStartUpComponent: Application activated isOnLockScreen: '{0}' activatedConversationId: '{1}'".format(Skype.Application.state.view.isOnLockScreen, Skype.ViewModel.LockScreenCall.activatedConversationId));
        },

        getActivationArguments: function (launchParams, callUi) {
            
            
            
            
            
            
            
            
            

            var callParams = Skype.Notifications.parseLaunchParams(launchParams);
            var activationArgs = {
                id: callParams ? callParams.conversationId : "",
                answerType: callParams ? callParams.answerType : "",
                mode: "lockScreen",
                callUI: callUi,
                
                
                activateCall: callParams != null,
                handlePushNotification: callParams ? callParams.handlePushNotification : false,

            };
            log("LockScreenStartUpComponent: parsed params '{0}'".format(JSON.stringify(activationArgs)));

            return activationArgs;
        },

        init: function () {
            log("LockScreenStartUpComponent: Init");
            this.regEventListener(Skype.Application.state.view, "propertychanged", this._hadleStateViewPropertyChange.bind(this));
            this._handleLockscreenStateChange();
        },

    }, {
        instance: {
            get: function () {
                if (!instance) {
                    instance = new Skype.StartUpComponent.LockScreen();
                }
                return instance;
            }
        }
    });

    var instance = null;
    WinJS.Namespace.define("Skype.StartUpComponent", {
        LockScreen: WinJS.Class.mix(lockScreen, Skype.Class.disposableMixin),
    });
})(Skype);