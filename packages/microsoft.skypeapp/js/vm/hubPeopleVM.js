

(function () {
    "use strict";

    var peopleVM = MvvmJS.Class.define(function(maxSuggestionsCount, contactListLimit) {
        this.contactListLimit = contactListLimit;
        this.maxSuggestionsCount = maxSuggestionsCount || -1;
        this.regEventListener(Skype.Model.ConversationsRepository.instance.conversations, "iteminserted", this._onItemInserted.bind(this));
        this.regEventListener(Skype.Model.ConversationsRepository.instance.conversations, "itemremoved", this._onItemRemoved.bind(this));
    }, {
        contactListLimit: null,

        run: function() {
            this.showContactList = Skype.Model.ConversationsRepository.instance.conversations.length <= this.contactListLimit;
            if (this.showContactList) {
                this._loadContactList();
            } else {
                this._loadSuggestions();
            }
        },

        resize: function(updatedSuggestions) {
            this.maxSuggestionsCount = updatedSuggestions;
            this.run();
        },

        _onItemInserted: function() {
            if (this.showContactList && Skype.Model.ConversationsRepository.instance.conversations.length > this.contactListLimit) {
                this.run();
            }
        },

        _onItemRemoved: function() {
            if (!this.showContactList && Skype.Model.ConversationsRepository.instance.conversations.length <= this.contactListLimit) {
                this.run();
            }
        },

        _filterFunction: function(item) {
            return (item.isDialog && (item.contact.isSkypeContact || item.contact.isPstnContact)) || (!item.isDialog);
        },

        _disposeFilterContactList: function(filterContactList) {
            if (filterContactList) {
                if (filterContactList === Skype.Model.ConversationsRepository.instance.conversations) {
                    return;
                }
                this._disposeFilterContactList(filterContactList._list);
                filterContactList.dispose && filterContactList.dispose();
            }
        },

        _loadContactList: function() {
            this._disposeFilterContactList(this.people);

            this.people = Skype.Model.ConversationsRepository.instance.conversations
                .createFiltered(this._filterContactList)
                .createSorted(Skype.Model.ContactsRepository.compareByName);

            this.regBind(this.people, "length", this._onLengthChanged.bind(this));
        },

        _filterContactList: function(item) {
            return item.favoriteOrder <= 0;
        },

        _loadSuggestions: function() {
            this._disposeFilterContactList(this.people);

            this.people = new MvvmJS.Binding.ConstrainedListProjection(Skype.Model.ConversationsRepository.instance.conversations
                .createFiltered(this._filterSuggestion)
                .createSorted(this._compareByPopularityAndHistory), this.maxSuggestionsCount);

            this.regBind(this.people, "length", this._onLengthChanged.bind(this));
        },

        _onLengthChanged: function () {
            this.peopleLength = this.people.length;
        },

        _filterSuggestion: function(item) {
            if (item.isBlocked) {
                return false;
            }
            return item.favoriteOrder <= 0; 
        },

        _compareByPopularityAndHistory: function(item1, item2) {
            
            

            var popSort = (item1.contact ? item1.contact.popularity : -1) - (item2.contact ? item2.contact.popularity : -1);
            if (popSort !== 0) {
                return -popSort; 
            }

            var timeSort = item1.rawTime - item2.rawTime;
            if (timeSort !== 0) {
                return -timeSort; 
            }
            return 0;
        }
    }, {
        showContactList: null,
        people: null,
        peopleLength: 0
});

    WinJS.Namespace.define("Skype.ViewModel", {
        HubPeopleVM: WinJS.Class.mix(peopleVM, Skype.Class.disposableMixin)
    });
    
    window.traceClassMethods && window.traceClassMethods(peopleVM, "PeopleVM", ["_loadSuggestions", "_loadContactList"]);

}());

