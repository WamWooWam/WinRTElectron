

(function () {
    "use strict";

    var conversationsRepository = MvvmJS.Class.define(function (filterType) {
        this._initConversations();
        this._libFilterType = filterType || LibWrap.Conversation.list_TYPE_BOOKMARKED_CONVERSATIONS;
        this._run();
        
    },
        {
            _conversations: null, 
            conversations: null,

            _initConversations: function () {
                this._conversations = new WinJS.Binding.List();
                this.conversations = this._conversations;
            },

            _run: function () {
                this._loadConversations();
                this.regEventListener(lib, "conversationlistchange", this._handleConversationListChange.bind(this));
            },

            _onDispose: function () {
                var lastId;
                while (this._conversations && this._conversations.length > 0) {
                    var id = this._conversations.getAt(0).id;
                    if (lastId === id) {
                        throw "Disposing same conversation twice!";
                    }
                    this._removeConversation(id);
                    lastId = id;
                }
            },

            _loadConversations: function (map) {
                var id, item;
                var conversationIds = new LibWrap.VectUnsignedInt();
                this._loadConversationList(conversationIds);
                for (var i = 0, count = conversationIds.getCount() ; i < count; i++) {
                    id = conversationIds.get(i);
                    if (!map || !map[id]) {
                        item = this._createConversation(id);
                        this._addConversation(item);
                    } else {
                        delete map[id];
                    }
                }
                this.length = this.conversations.length;
                this.hasItems = this.conversations.length > 0;
            },
            
            _loadConversationList: function (conversationIds) {
                lib.getConversationList(conversationIds, this._libFilterType);
            },

            _reload: function () {
                var map = {};
                this._conversations.forEach(function (item) {
                    map[item.id] = item;
                });

                this._loadConversations(map);

                Object.keys(map).forEach(this._removeConversation.bind(this));
            },

            _filterRelevantConversation: function (item) {
                return true;
            },
            
            onConversationAdd: function() {
                roboSky.write("Contact,add");
            },
            
            _addConversation: function (conversation) {
                if (!conversation) {
                    return;
                }

                log("Conversation list changed event. ADD:{0}/{1}, ".format(conversation.id, conversation.identity));

                if (!this._filterRelevantConversation(conversation)) {
                    conversation.dispose();
                    return;
                }
                conversation.alive();

                var handler = this._handlePropertyChanged.bind(this, conversation);
                this.regEventListener(conversation, "propertychanged", handler);
                if (conversation.contact) {
                    this.regEventListener(conversation.contact, "propertychanged", handler);
                }
                this._updateConversations(conversation);

                this.onConversationAdd && this.onConversationAdd();
            },

            _removeConversation: function (conversationObjectId) {
                log("Conversation list changed event. REMOVE:{0}, ".format(conversationObjectId));

                var index = this._indexById(conversationObjectId);
                if (index !== -1) {

                    var conversation = this._conversations.getAt(index);
                    if (!conversation) {
                        return;
                    }

                    conversation.contact && this.unregObjectEventListeners(conversation.contact);
                    this.unregObjectEventListeners(conversation);

                    this._conversations.splice(index, 1);
                    delete this.conversations2KeysMap[conversationObjectId];

                    roboSky.write("Contact,remove");

                    conversation.dispose();
                    this.onConversationRemove && this.onConversationRemove();
                }

            },

            _handlePropertyChanged: function (conversation, evt) {
                this._updateConversations(conversation);
            },

            _updateConversations: function (conv) {
                var id = conv.id;
                var oldPos = this._indexById(id);
                
                var convFound = oldPos !== -1;
                if (convFound) {
                    this._conversations.notifyMutated(oldPos);
                } else {
                    this._conversations.push(conv);
                    this.conversations2KeysMap[id] = this._conversations.getItem(this._conversations.length - 1).key;
                }
            },
            conversations2KeysMap: {
                get : function () {
                    if(!this._conversations2KeysMap) {
                        this._conversations2KeysMap = { };
                    }
                    return this._conversations2KeysMap;
                }
            },

            _handleConversationListChange: function (args) {
                var conversationObjectId = args.detail[0];
                var filterType = args.detail[1];
                var added = args.detail[2];

                if (filterType !== this._libFilterType) {
                    return;
                }

                
                if (conversationObjectId === 0) {
                    this._reload();
                    return;
                }

                
                if (added) {
                    var item = this._createConversation(conversationObjectId);
                    this._addConversation(item);
                } else {
                    
                    this._removeConversation(conversationObjectId);
                }
                this.length = this.conversations.length;
                this.hasItems = this.conversations.length > 0;
            },

            _createConversation: function (id) {
                var libConv = lib.getConversation(id);
                if (libConv) {
                    return Skype.Model.ConversationFactory.createConversation(libConv);
                }

                log("GetConversation(" + id + ") failed");
                return null;
            },

            _itemById: function (id) {
                var ix = this._indexById(id);
                if (ix === -1) {
                    return null;
                }
                return this._conversations.getAt(ix);
            },

            _indexById: function (id) {
                var index;
                if (this.conversations2KeysMap[id] !== undefined) {
                    var key = this.conversations2KeysMap[id];
                    index = this._conversations.indexOfKey(key);
                }

                
                
                
                
                
                return index === undefined ? - 1 : index;
            }
        }, {
            length: 0,
            hasItems: false
        }, {
            instance: {
                get: function () {
                    if (!instance) {
                        instance = createBookmarkedConversationRepository();
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
    function createBookmarkedConversationRepository() {
        return new Skype.Model.ConversationsRepository();
    }
    window.traceFunction && (createBookmarkedConversationRepository = window.traceFunction(createBookmarkedConversationRepository, "ConversationRepository,BookmarkedConversations"));
    
    conversationsRepository = WinJS.Class.mix(conversationsRepository, Skype.Class.disposableMixin);
    WinJS.Namespace.define("Skype.Model", {
        ConversationsRepository: conversationsRepository
    });

    window.traceClassMethods && window.traceClassMethods(conversationsRepository, "ConversationsRepository", 
        ["_createConversation", "_addConversation", "_run", "_loadConversationList", "_updateConversations"]);
    
    
    
}());


(function() {
    "use strict";

    WinJS.Namespace.define("Skype.Model", {
        LiveConversationsRepository: MvvmJS.Class.derive(Skype.Model.ConversationsRepository, function () {
            this.base(LibWrap.Conversation.list_TYPE_LIVE_CONVERSATIONS);
        }, {
            _createConversation: function (id) {
                var libConv = lib.getConversation(id);
                if (libConv) {
                    return new Skype.Model.LiveConversation(libConv);
                }

                log("GetConversation(" + id + ") failed");
                return null;
            },
            
            _run: function() {
                Skype.Model.LiveConversationsRepository.base._run.call(this);
            }
        })
    });

    window.traceClassMethods && window.traceClassMethods(Skype.Model.LiveConversationsRepository,"LiveConversationsRepository", ["_run"]);

}());
