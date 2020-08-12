

(function () {
    "use strict";

    var using = {
        RecentsQuery: LibWrap.VM.RecentsQuery
    };

    var MAX_SLOTS_COUNT = 10,
        REFRESH_TIME_THRESHOLD = 1 * 60 * 1000;

    var conversationSwitcherCommandsSetVM = MvvmJS.Class.define(function (conversationListWinControl, hideBarProvider) {
        this._hideBarProvider = hideBarProvider;
        this._conversationListWinControl = conversationListWinControl;
    }, {

        _repository: null,
        _query: null,
        _hideBarProvider: null,
        
        conversations: null,

        _handleRecentsCountChanged: function (event) {
            var recentsCount = event.detail[0];
            this.hasConversationsOverLimit = recentsCount > MAX_SLOTS_COUNT;
        },

        _handleConversationClicked: function (evt) {
            evt.detail.itemPromise.then(function (item) {
                Actions.invoke("focusConversation", item.data.item.identity);
            });
        },

        
        _createConversation: function (id) {
            var libConv = lib.getConversation(id);
            if (libConv) {
                var conversation = new Skype.Model.RecentConversation(libConv); 
                conversation.alive();
                return WinJS.Binding.as({
                    item: conversation,
                    id: conversation.id,
                    dispose: function () {
                        conversation.dispose();
                    }
                });
            }

            log("GetConversation(" + id + ") failed");
            return null;
        },

        _reformatTime: function () {
            this.conversations.forEach(function (conversationItem) {
                conversationItem.item.formatMessageFooter();
            });
        },

        

        run: function () {
            log("ConversationSwitcherCommandsSetVM: run");
            assert(!this._query && !this.conversations && !this._repository, "Re-running VM that already has data !");

            this._query = new using.RecentsQuery(lib);
            this._repository = new Skype.Model.QueryConversationRepository({ createConversation: this._createConversation.bind(this) });
            this.conversations = this._repository.conversations;

            this.regEventListener(this._query, "recentscountchanged", this._handleRecentsCountChanged.bind(this));
            this.regEventListener(this._conversationListWinControl, "iteminvoked", this._handleConversationClicked.bind(this));
            this._repository.run(this._query, MAX_SLOTS_COUNT);
            this.regInterval(this._reformatTime.bind(this), REFRESH_TIME_THRESHOLD);
        },

        softDispose: function () {
            
            
            

            this.cleanupEventListeners();
            this._repository && this._repository.dispose(); 
            this.conversations = null;
            this._query = null;
            this._repository = null;
        },

        

        navigateToHub: function () {
            this._hideBarProvider.hide();
            if (Skype.Application.state.page.name !== "hub") {
                Skype.UI.navigate("hub");
            }
        },

        navigateToAllHistory: function () {
            Skype.UI.navigate("allHistory", { switchToDefault: true });
            if (Skype.Application.state.page.name === "allHistory") {
                this._hideBarProvider.hide();
            }
        },

    }, {
        
        hasConversationsOverLimit: false,
    }, {
        external: using
    });

    WinJS.Namespace.define("Skype.ViewModel", {
        ConversationSwitcherCommandsSetVM: conversationSwitcherCommandsSetVM
    });

}());