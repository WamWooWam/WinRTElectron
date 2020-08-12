

(function() {
    "use strict";


    var recentCallConversation = MvvmJS.Class.derive(Skype.Model.RecentConversation, function(libConversation) {
        this.base(libConversation);
    }, {
        _updateLastMessage: function(libMessage) {
            var message = Skype.Model.MessageFactory.createMessage(libMessage);
            if (message && message.type === Skype.Model.MessageType.call) {
                Skype.Model.RecentCallConversation.base._updateLastMessage.call(this, libMessage);
            }
        },

        formatTime: function () {
            if (this.message) {
                this.formattedMessageFooter = Skype.Utilities.dateAsRecentConversationTime(new Date(this.message.timestamp * 1000));
            }
        }
    });
    
    WinJS.Namespace.define("Skype.Model", {
        RecentCallConversation: recentCallConversation,
    });

}());