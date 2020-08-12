

(function () {
    "use strict";

    var recentConversationsRepository = MvvmJS.Class.derive(Skype.Model.ConversationsRepository, function () {
        this.base(LibWrap.Conversation.list_TYPE_INBOX_CONVERSATIONS);
    }, {
        unreadConversations: null,

        _initConversations: function () {
            Skype.Model.RecentConversationsRepository.base._initConversations.call(this);
            this.conversations = this._conversations.createSorted(this._compareByTime);
            this.unreadConversations = this.conversations.createFiltered(function (item) {
                return item.isUnread;
            });
        },

        _run: function () {
            Skype.Model.RecentConversationsRepository.base._run.call(this);
            this._loadAuthRequestConversations();
            this.regInterval(this._reformatTime.bind(this), 60 * 1000);
        },

        _loadAuthRequestConversations: function () {

            var authRequestsGroupId = lib.getHardwiredContactGroup(LibWrap.ContactGroup.type_CONTACTS_WAITING_MY_AUTHORIZATION);
            
            if (authRequestsGroupId !== 0) {
                this.authRequestsGroup = lib.getContactGroup(authRequestsGroupId);
                this.regEventListener(this.authRequestsGroup, "changeconversation", this._handleAuthRequestsGroupChange.bind(this));

                var ids = new LibWrap.VectUnsignedInt();
                this.authRequestsGroup.getConversations(ids);
                for (var i = 0, count = ids.getCount() ; i < count; i++) {
                    var id = ids.get(i);
                    var item = this._createConversation(id);
                    this._addConversation(item);
                }
            }
        },

        _handleAuthRequestsGroupChange: function (evt) {
            var id = evt.detail[0];
            var ids = new LibWrap.VectUnsignedInt();
            this.authRequestsGroup.getConversations(ids);
            var found = false;
            for (var i = 0, count = ids.getCount() ; i < count; i++) {
                var convId = ids.get(i);
                if (id === convId) {
                    found = true;
                    break;
                }
            }
            if (found) {
                var item = this._createConversation(id);
                this._addConversation(item);
            } else {
                
                this._removeConversation(id);
            }
        },

        _filterRelevantConversation: function (item) {
            return item.conversation.hasHistory;
        },

        _handlePropertyChanged: function (conversation, evt) {
            switch (evt.detail) {
                case "time":
                    this._updateConversations(conversation);
                    break;
                case "isUnread":
                    this._updateConversationsOverLimitCount(conversation);
                    break;
            }
        },

        _updateConversationsOverLimitCount: function (conv) {
            var pos = this.conversations.indexOf(conv);
            if (pos === -1) {
                return;
            }
            this.conversations.notifyMutated(pos);
        },

        markAllAsRead: function() {
            this.unreadConversations.forEach(function(item) {
                item.conversation.markAsRead();
            });
        },

        hasUnreadConversations: function () {
            return this.unreadConversations && this.unreadConversations.length > 0;
        },

        _createConversation: function (id) {
            var libConv = lib.getConversation(id);
            if (libConv) {
                return new Skype.Model.RecentConversation(libConv);
            }

            log("GetConversation(" + id + ") failed");
            return null;
        },

        _compareByTime: function (item1, item2) {
            var timeComp = item2.time - item1.time; 
            return timeComp;
        },

        _reformatTime: function () {
            this.conversations.forEach(function (conversationItem) {
                conversationItem.formatMessageFooter();
            });
        },

        _onDispose: function () {
            Skype.Model.RecentConversationsRepository.base._onDispose && Skype.Model.RecentConversationsRepository.base._onDispose.call(this);
            this.authRequestsGroup && this.authRequestsGroup.discard();
        }
    }, {
    }, {
        instance: {
            get: function () {
                if (!instance) {
                    instance = new Skype.Model.RecentConversationsRepository();
                }
                return instance;
            }
        },
        dispose: function () {
            instance && instance.dispose();
            instance = null;
        }
    });

    var instance;

    WinJS.Namespace.define("Skype.Model", {
        RecentConversationsRepository: recentConversationsRepository
    });
    
    window.traceClassMethods && window.traceClassMethods(recentConversationsRepository, "RecentConversationsRepository", ["_run", "_filterRelevantConversation", "_createConversation"]);

}());

