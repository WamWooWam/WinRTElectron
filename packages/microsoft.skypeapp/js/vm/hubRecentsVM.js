

(function () {
    "use strict";

    var HEADERHEIGHT = 180 + 15, 
        NUMBEROFCOLUMNS = 2,
        REFRESH_TIME_THRESHOLD = 1 * 60 * 1000; 

    var using = {
        RecentsQuery: LibWrap.VM.RecentsQuery
    };

    var hubRecentsVM = MvvmJS.Class.define(function (recentItemHeight, largeItemHeight, recentItemWidth) {
        
        this.largeItemHeight = largeItemHeight;
        this.recentItemHeight = recentItemHeight;
        this.recentItemWidth = recentItemWidth;
        this._recalculate();
        this._query = new using.RecentsQuery(lib);
        this._repository = new Skype.Model.QueryConversationRepository({ createConversation: this._createConversation.bind(this) });
        this.conversations = this._repository.conversations;
    }, {

        _repository: null,
        _query: null,
        _largeSlotsCountLimit: 0,
        _maxSlotsCount: 0,
        slotsInColumn: null,
        largeItemHeight: null,
        recentItemHeight: null,
        
        conversations: Skype.Utilities.nondisposableProperty(), 

        _recalculate: function () {
            var maxHeight = Skype.Application.state.view.isPortrait ? Skype.Application.state.view.size.width : Skype.Application.state.view.size.height;
            var availableHeight = maxHeight - HEADERHEIGHT,
                slotsInOneColumn = Math.floor(availableHeight / this.recentItemHeight),
                bigSlotsInOneColumn = Math.floor(availableHeight / this.largeItemHeight);
            
            if (bigSlotsInOneColumn * this.largeItemHeight < slotsInOneColumn * this.recentItemHeight) { 
                slotsInOneColumn--;
            }
            this.itemsInColumn = slotsInOneColumn;
            this._largeSlotsCountLimit = Skype.Application.state.view.isVertical ? 1 : slotsInOneColumn * NUMBEROFCOLUMNS; 
            this._maxSlotsCount = slotsInOneColumn * 3; 

            if (Skype.Application.state.view.isVertical) {
                var numberOfColumns = Math.max(1, Math.floor(Skype.Application.state.view.size.width / this.recentItemWidth)),
                    overflowItems = this._maxSlotsCount % numberOfColumns;
                this._maxSlotsCount = this._maxSlotsCount - overflowItems;
            }
        },

        
        _handleUnreadCountChanged: function (event) {
            var unreadCount = event.detail[0];
            this.hasUnread = unreadCount > 0;
            log("HubRecentsVM: _handleUnreadCountChanged " + unreadCount);

            if (unreadCount > 99) {
                this.formattedUnreadCount = "9+";
            } else {
                this.formattedUnreadCount = unreadCount > 0 ? unreadCount : "";
            }
            this.formattedAriaHubRecentLabel = "aria_hub_recent_heading".translate(unreadCount);
            roboSky.write("HubRecentsVM,UnreadCountChanged");
        },

        _handleRecentsCountChanged: function (event) {
            var recentsCount = event.detail[0];
            this.hasConversationsOverLimit = recentsCount > this._maxSlotsCount;
            this.hasItems = recentsCount > 0;
        },

        _initEvents: function () {
            this.regEventListener(this.conversations, "iteminserted", this._handleListChanged.bind(this));
            this.regEventListener(this.conversations, "itemremoved", this._handleListChanged.bind(this));
            this.regEventListener(this.conversations, "itemmoved", this._handleListChanged.bind(this)); 
            this.regEventListener(this._query, "unreadcountchanged", this._handleUnreadCountChanged.bind(this));
            this.regEventListener(this._query, "recentscountchanged", this._handleRecentsCountChanged.bind(this));
            this.regEventListener(window, "resize", this.resize.bind(this));
        },

        _handleListChanged: function () {
            this._recalculateStyle();
            roboSky.write("HubRecentList,changed");
        },

        _reformatTime: function () {
            this.conversations.forEach(function (conversationItem) {
                conversationItem.item.formatMessageFooter();
            });
        },

        _recalculateStyle: function () {
            

            var currentLimit = Math.min(this.conversations.length, this._maxSlotsCount),
                indexOfFirstSmallWhenFullyPopulated = Skype.Application.state.view.isVertical ? 0 : this._largeSlotsCountLimit - (currentLimit - this._largeSlotsCountLimit); 

            this.conversations.forEach(function (conversationItem, index) {
                var wasLarge = conversationItem.isLarge;
                conversationItem.isLarge = index < indexOfFirstSmallWhenFullyPopulated;

                if (wasLarge !== conversationItem.isLarge) {
                    this.notifyMutated(index);
                }
            }.bind(this.conversations));
        },

        
        _createConversation: function (id) {
            var libConv = lib.getConversation(id);
            if (libConv) {
                var conversation = new Skype.Model.RecentConversation(libConv); 
                conversation.alive();
                return WinJS.Binding.as({
                    item: conversation,
                    isLarge: false,
                    id: conversation.id,
                    dispose: function () {
                        conversation.dispose();
                    }
                });
            }

            log("GetConversation(" + id + ") failed");
            return null;
        },

        

        run: function () {
            
            
            

            log("HubRecentsVM: run");

            this._initEvents();
            this._repository.run(this._query, this._maxSlotsCount);
            this.regInterval(this._reformatTime.bind(this), REFRESH_TIME_THRESHOLD);
        },

        resize: function () {
            var prevLargeSlotsCountLimit = this._largeSlotsCountLimit;
            this._recalculate();

            this._repository.resizeQuery(this._maxSlotsCount);

            var limitChanged = prevLargeSlotsCountLimit !== this._largeSlotsCountLimit;
            if (limitChanged) {
                this._recalculateStyle();
            }
        }
    }, {
        
        hasItems: true, 

        
        hasUnread: false,

        
        formattedUnreadCount: "",

        
        hasConversationsOverLimit: false,

        
        formattedAriaHubRecentLabel: "",

        itemsInColumn: null,
    }, {
        external: using
    });

    WinJS.Namespace.define("Skype.ViewModel", {
        HubRecentsVM: hubRecentsVM
    });

}());