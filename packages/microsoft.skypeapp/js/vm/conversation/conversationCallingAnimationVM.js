

(function () {
    "use strict";

    var conversationCallingAnimationVM = MvvmJS.Class.define(function (conversationWrapper, avatarControl) {
        this._conversationWrapper = conversationWrapper;
        this._avatarControl = avatarControl;
    }, {
        _conversationWrapper: null,
        _avatarControl: null,

        _handleEmergencyCountryChanged: function () {
            var emergencyCallingAllowed = Skype.Model.Options.emergencyCalling.emergencyCallingAllowed();
            this.emergencyContent = emergencyCallingAllowed ? ("liveconversation_emergency_call_" + Skype.Model.Options.emergencyCalling.emergencyCountry).translate() : "";
        },

        _handleConversationWrapperPropertyChange: function (e) {
            if (e.detail == "avatarUri") {
                this._avatarControl.updateAvatar();
            }
        },

        
        init: function () {
            log("ConversationCallingAnimationVM init()");
            this.regEventListener(Skype.Model.Options.emergencyCalling, "countryChanged", this._handleEmergencyCountryChanged.bind(this));
            this.regEventListener(this._conversationWrapper, "propertychanged", this._handleConversationWrapperPropertyChange.bind(this));

            this._handleEmergencyCountryChanged();
            this.isEmergencyContact = this._conversationWrapper.isDialog && this._conversationWrapper.contact.isEmergencyContact;
        },

    }, { 
        emergencyContent: "",
        isEmergencyContact: false,
    });

    WinJS.Namespace.define("Skype.ViewModel", {
        ConversationCallingAnimationVM: conversationCallingAnimationVM
    });
}());