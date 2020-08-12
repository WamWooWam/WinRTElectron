

(function () {
    "use strict";

    var queryConversationRepository = MvvmJS.Class.define(function queryConversationRepository_constructor(conversationFactory) {

        assert(conversationFactory && conversationFactory.createConversation, "Incorrent usage of queryConversationRepository !");
        this.conversations = new WinJS.Binding.List();
        this._conversations2KeysMap = {};
        this._conversationFactory = conversationFactory;
    }, {
        conversations: null,

        _queryVector: null,
        _conversations2KeysMap: null,
        _conversationFactory: null,

        _removeConversation: function (conversationObjectId) {
            log("QueryConversationRepository: _removeConversation" + conversationObjectId);

            var conversationItem = this._conversations2KeysMap[conversationObjectId];
            if (!conversationItem) {
                log("QueryConversationRepository: _removeConversation Couldn't get conversation !");
                return;
            }
            conversationItem.dispose();
            this.conversations.splice(this.conversations.indexOf(conversationItem), 1);
            delete this._conversations2KeysMap[conversationObjectId];
        },

        _insertConversationItem: function (index, conversationItem) {
            if (index > this.conversations.length - 1) {
                this.conversations.push(conversationItem);
            } else {
                this.conversations.splice(index, 0, conversationItem); 
            }
            this._conversations2KeysMap[conversationItem.id] = conversationItem;
        },

        _addConversation: function (conversationObjectId, index) {
            log("QueryConversationRepository: _addConversations " + conversationObjectId);

            var conversationItem = this._conversationFactory.createConversation(conversationObjectId);
            if (!conversationItem) {
                log("QueryConversationRepository: _addConversation Couldn't create conversation !");
                return;
            }

            this._insertConversationItem(index, conversationItem);
        },

        _moveConversation: function (index, newIndex) {
            this.conversations.move(index, newIndex);
        },

        _isValidIndex: function (index) {
            return index >= 0 && index < this.conversations.length;
        },

        _outputListIds: function () {
            this.conversations.forEach(function (conversationItem, index) {
                log("conversationItem({0}) id {1}".format(index, conversationItem.id));
            });
        },

        

        _handleQueryReset: function (event) {
            this.conversations.forEach(function (conversationItem) {
                conversationItem.dispose();
            });
            this.conversations.splice(0, this.conversations.length); 
            this._conversations2KeysMap = {};

            var data = event.detail[0];
            log("QueryConversationRepository: _handleQueryReset data.length: {0}".format(data.length));

            for (var i = 0; i < data.length; i++) {
                this._addConversation(data[i], i);
            }
        },

        _handleQueryItemAdded: function (event) {
            var id = event.detail[0];
            var pos = event.detail[1];
            log("QueryConversationRepository: _handleQueryItemAdded id: {0} pos: {1}".format(id, pos));

            if (this._maxSlotCount == this.conversations.length) {
                log("QueryConversationRepository: _handleQueryItemAdded - adding over limit !");
            }

            if (this._conversations2KeysMap[id]) {
                log("QueryConversationRepository: _handleQueryItemAdded - adding duplicate !");
            }

            this._addConversation(id, pos);
        },

        _handleQueryItemRemoved: function (event) {
            var id = event.detail[0];
            var pos = event.detail[1];
            log("QueryConversationRepository: _handleQueryItemRemoved id: {0} pos: {1}".format(id, pos));

            if (!(this._isValidIndex(pos) && this.conversations.getAt(pos).id === id)) {
                log("QueryConversationRepository _handleQueryItemRemoved inconsistent state !".format(id, pos));
                this._outputListIds();
                return;
            }
            this._removeConversation(id);
        },

        _handleQueryItemMoved: function (event) {
            var id = event.detail[0];
            var newPos = event.detail[1];
            var oldPos = event.detail[2];
            log("QueryConversationRepository: _handleQueryItemMoved id: {0} newPos: {1} oldPos: {2}".format(id, newPos, oldPos));

            if (!(this._isValidIndex(newPos) && this._isValidIndex(oldPos) && this.conversations.getAt(oldPos).id === id)) {
                log("QueryConversationRepository _handleQueryItemMoved inconsistent state !");
                this._outputListIds();
                return;
            }
            this._moveConversation(oldPos, newPos);
        },

        

        run: function (query, maxSlotsCount) {
            
            
            

            log("QueryConversationRepository: run");
            this._maxSlotCount = maxSlotsCount;
            this._query = query;

            this.regEventListener(query, "recentsqueryreset", this._handleQueryReset.bind(this));
            this.regEventListener(query, "recentsqueryitemadded", this._handleQueryItemAdded.bind(this));
            this.regEventListener(query, "recentsqueryitemremoved", this._handleQueryItemRemoved.bind(this));
            this.regEventListener(query, "recentsqueryitemmoved", this._handleQueryItemMoved.bind(this));

            query.reload(maxSlotsCount);
        },

        resizeQuery: function (maxSlotsCount) {
            
            
            

            this._maxSlotCount = maxSlotsCount;
            this._query.resize(maxSlotsCount);
        },

    }, {
    });

    WinJS.Namespace.define("Skype.Model", {
        QueryConversationRepository: queryConversationRepository
    });
}());