

(function () {
    "use strict";

    var favoriteConversationsRepository = MvvmJS.Class.derive(Skype.Model.ConversationsRepository, function () {
        this.base(LibWrap.Conversation.list_TYPE_PINNED_CONVERSATIONS);
    }, {
        _initConversations: function () {
            Skype.Model.FavoriteConversationsRepository.base._initConversations.call(this);
            this.conversations = this._conversations
                  .createSorted(Skype.Model.ContactsRepository.compareByName);
        },

        toggleFavoriteConversation: function (conversation) {
            var favs = this.conversations;
            var convId = null;
            if (favs.length !== 0) {
                var lastItem = favs.getAt(favs.length - 1);
                convId = lastItem.id;
            }
            conversation.toggleFavorite(convId);
        },
        
        _handlePropertyChanged: function (conversation, evt) {
            switch (evt.detail) {
                case "favoriteOrder":
                    this._updateConversations(conversation);
                    break;
            }
        },
        
        onConversationAdd: function() {
            roboSky.write("FavoriteConversationsRepository,Conversation,Added");
        },
        
        onConversationRemove: function() {
            roboSky.write("FavoriteConversationsRepository,Conversation,Removed");
        }

    }, {
    }, {
        instance: {
            get: function () {
                if (!instance) {
                    instance = new Skype.Model.FavoriteConversationsRepository();
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
        FavoriteConversationsRepository: favoriteConversationsRepository
    });

    window.traceClassMethods && window.traceClassMethods(favoriteConversationsRepository, "FavoriteConversationsRepository", ["_run"]);

}());