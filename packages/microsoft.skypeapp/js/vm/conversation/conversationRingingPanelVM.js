

(function () {
    "use strict";
    var conversationRingingPanelVM = MvvmJS.Class.define(function (conversationWrapper) {
        this._conversationWrapper = conversationWrapper;
        this._isPstnContact = conversationWrapper.contact && conversationWrapper.contact.isPstnContact;
    }, {
        
        _conversationWrapper: null,

        
        _isIncomingVideoCall: false,
        _isPstnContact: false,

        _updateCallStatusLabel: function () {
            this.headerCallStatus = this._isIncomingVideoCall ? "callnotification.video.note".translate() :
                "callnotification.note".translate();

            this.panelAriaLabel = this._isIncomingVideoCall ? "aria_notification_video_call".translate(this.conversationName) :
                "aria_notification_call".translate(this.conversationName);
        },

        _checkVideo: function () {
            this.answerVideoDisabled = this._isPstnContact || !this._isIncomingVideoCall ||
                !Skype.Application.DeviceManager.isVideoDevicePresent();
        },

        

        onShow: function () {
            this.conversationName = this._conversationWrapper.name;
            this._isIncomingVideoCall = this._conversationWrapper.isIncomingVideoCall();
            this._checkVideo();
            this._updateCallStatusLabel();
        },

        
        answer: function () {
            Actions.invoke("answer", [this._conversationWrapper.identity], { focusConversation: true });
        },

        answerVideo: function () {
            Actions.invoke("answerVideo", [this._conversationWrapper.identity], { focusConversation: true });
        },

        reject: function (evt) {
            Actions.invoke("reject", [this._conversationWrapper.identity]);
        },

        navigateBack: function () {
            Skype.UI.navigateBack();
        }

    }, { 
        conversationName: "",
        headerCallStatus: "",
        answerVideoDisabled: true,
        panelAriaLabel: "",
    });

    WinJS.Namespace.define("Skype.ViewModel", {
        ConversationRingingPanelVM: conversationRingingPanelVM
    });

}());
