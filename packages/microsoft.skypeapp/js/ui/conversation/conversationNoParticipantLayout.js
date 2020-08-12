

(function () {
    "use strict";
    
    var conversationNoParticipantLayout = WinJS.Class.define(
        function conversationNoParticipantLayout_constructor(layoutManager) {
            this._layoutManager = layoutManager;
        }, {
            _layoutManager: null,

            
            onItemAdded: function (item) {
                
            },

            onItemRemoved: function (item) {
				
            },

            onLayoutChanged: function () {
                assert(this._layoutManager.items.length == 0, "Why we have diferrent number ? Are we switching to proper layout?");
            },
            
            stageSpeakersChanged: function () {
                
            }
        });

    WinJS.Namespace.define("Skype.UI.Conversation", {
        ConversationNoParticipantLayout: WinJS.Class.mix(conversationNoParticipantLayout, Skype.Class.disposableMixin)
    });

}());