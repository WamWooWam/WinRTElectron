

(function () {
    "use strict";

    var LOGOUT_DELAY = 15000;

    var policyWarningVM = MvvmJS.Class.define(function () {
    }, {
        _retryDialog: null,
        _logoutDelay: null,

        
        init: function (retryDialog) {
            log('PolicyWarningVM: init()');
            this._retryDialog = retryDialog;
            this.skypeDisabled = !Skype.Application.state.policy.application.enabled;
            this.regEventListener(Skype.Application.PolicyManager.instance, Skype.Application.PolicyManager.Events.PolicyUpdate, this._onPolicyUpdate.bind(this));
        },

        _onPolicyUpdate: function () {
            this.isRetrying = false;
            if (this.skypeDisabled && Skype.Application.state.policy.application.enabled) {
                this.login();
            }
        },

        _updateDialogText: function (identity, blockedAction) {
            if (!identity) {
                this.dialogBodyText = "policy_dialog_skype_blocked_body_text".translate();
                return;
            }

            
            if (!Skype.Application.state.policy.calling.enabled) { 
                this.dialogBodyText = "policy_dialog_skype_call_body_text".translate();
            } else {
                assert(!Skype.Application.state.policy.PSTN.enabled, "Only PSTN can be disabled here !");

                var incommingCall = blockedAction && ["answerAction", "answerVideoAction"].contains(blockedAction);
                this.dialogBodyText = incommingCall ? "policy_dialog_pstn_receive_call_body_text".translate() : "policy_dialog_pstn_send_call_body_text".translate();
            }
        },

        _updateConversationName: function (identity) {
            if (!identity) {
                return;
            }
            var conversation = lib.getConversationByIdentity(identity); 
            if (conversation) {
                var conversationWrapper = Skype.Model.ConversationFactory.createConversation(conversation);
                this.conversationName = conversationWrapper.name;
                conversationWrapper.dispose();
            }
        },

        

        update: function (identity, blockedAction) {

            this._updateConversationName(identity);
            this._updateDialogText(identity, blockedAction);

            this.skypeDisabled = !Skype.Application.state.policy.application.enabled;

            if (this.skypeDisabled) {
                this.logout();
            }
        },

        logout: function () {
            if (lib && !this._logoutDelay) {  
                this._logoutDelay = WinJS.Promise.timeout(LOGOUT_DELAY).then(function () {
                    lib.logoutUser(true);
                    this._logoutDelay = null;
                }.bind(this));
            }
        },


        login: function () {
            this.skypeDisabled = !Skype.Application.state.policy.application.enabled;

            if (this._logoutDelay) {
                this._logoutDelay.cancel();
                this._logoutDelay = null;
                Skype.UI.navigate("hub");
            } else {
                Skype.UI.navigate("login", { state: "logout" });
            }
        },

        
        navigateBack: function () {
            Skype.UI.navigate("resumelastpage");
        },

        retry: function () {
            this.isRetrying = true;
            Skype.Application.PolicyManager.instance.update(true);
        },
    }, { 
        isRetrying: false,
        conversationName: "",
        dialogBodyText: "",
        skypeDisabled: true,
    });

    WinJS.Namespace.define("Skype.ViewModel", {
        PolicyWarningVM: WinJS.Class.mix(policyWarningVM, Skype.Class.disposableMixin)
    });

}());

