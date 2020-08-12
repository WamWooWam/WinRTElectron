

(function () {
    "use strict";

    var LayoutPlacement = Skype.UI.LiveGroupConversation.LayoutPlacement;

    var conversationPinnedLayout = WinJS.Class.define(
        function conversationPinnedLayout_constructor(layoutManager) {
            this._layoutManager = layoutManager;
        }, {
            _layoutManager: null,

            
            onItemAdded: function (item) {
                this._layoutManager.setItemPosition(item, item.pinned ? LayoutPlacement.STAGE : LayoutPlacement.ROSTER);
                item.itemColumn = 1;
            },

            onItemRemoved: function (item) {
            },

            stageSpeakersChanged: function () {
                
            },

            onLayoutChanged: function () {
                this._layoutManager.items.forEach(function (item) {
                    this._layoutManager.setItemPosition(item, item.pinned ? LayoutPlacement.STAGE : LayoutPlacement.ROSTER);
                    item.itemColumn = 1;
                }.bind(this));                
            },
        });

    WinJS.Namespace.define("Skype.UI.Conversation", {
        ConversationPinnedLayout: conversationPinnedLayout
    });

}());