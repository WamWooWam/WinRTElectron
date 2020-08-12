

(function () {
    "use strict";

    var LayoutPlacement = Skype.UI.LiveGroupConversation.LayoutPlacement;

    var conversation1to1Layout = WinJS.Class.define(
        function conversation1to1Layout_constructor(layoutManager) {
            this._layoutManager = layoutManager;
        }, {
            _layoutManager: null,

            
            onItemAdded: function (item) {
                if (item.itemPosition !== LayoutPlacement.STAGE) { 
                    this._layoutManager.setItemPosition(item, LayoutPlacement.STAGE);
                }
                item.itemColumn = 1;
            },

            onItemRemoved: function (item) {
                
            },

            stageSpeakersChanged: function () {
                
            },

            onLayoutChanged: function () {
                
                assert(this._layoutManager.items.length === 1, "Why we have diferrent number ? We should switch to this layout at first place");

                var item = this._layoutManager.items[0];
                if (item.itemPosition !== LayoutPlacement.STAGE) {
                    this._layoutManager.setItemPosition(item, LayoutPlacement.STAGE);
                }
                item.itemColumn = 1; 
                this._layoutManager.updateStageGrid();
            },
        });

    WinJS.Namespace.define("Skype.UI.Conversation", {
        Conversation1to1Layout: conversation1to1Layout
    });

}());