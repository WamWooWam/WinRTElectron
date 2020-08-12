


(function () {
    "use strict";

    var chatNotificationsDialog = MvvmJS.Class.derive(Skype.UI.Dialogs.DialogBase, function (element) {
        this.base(element);
        this.name = "chatNotificationsDialog";
    }, {
        _conversation: null,

        onHide: function () {
            this._completeCallback({
                result: this._result
            });
        },
        
        onShow: function (title, ariaTitle, conversation) {
            this.vm.title = title;
            this.vm.ariaTitle = ariaTitle;

            this._conversation = conversation;

            
            this.vm.notificationsEnabled = (conversation.libConversation.getStrProperty(LibWrap.PROPKEY.conversation_ALERT_STRING)) ? false : true;
        },

        onInit: function () {
            this.vm = WinJS.Binding.as({
                title: "",
                ariaTitle: "",
                notificationsEnabled: true,
            });
        },


        chatNotificationsStateChange: function (e) {
            var state = e.target.winControl.checked;
            
            switch (state) {
                case this.notificationsSettings.on: 
                    this._conversation.libConversation.setAlertString('');
                    this.vm.notificationsEnabled = true;
                    break;
                case this.notificationsSettings.off: 
                    this._conversation.libConversation.setAlertString('=');
                    this.vm.notificationsEnabled = false;
                    break;
                default:
                    throw ("state: " + state);
            }
            roboSky.write("ChatNotificationsDialog,stateChanged");
        }
    }, {
        notificationsSettings: { 'on': true, 'off': false }
    });

    WinJS.Namespace.define("Skype.UI.Dialogs", {
        ChatNotificationsDialog: chatNotificationsDialog
    });
})();