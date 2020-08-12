

(function () {
    "use strict";

    var instance = null;

    var contactsRepository = MvvmJS.Class.define(function () {
            
            this.contactIDsToFilterOut = null;
            this._init();
        },
        {
            all: null, 
            online: null,
            groups: null,

            _init: function () {
                this._initAllConversationsProjection();
                this._initOnlineConversationsProjection();
                this._initGropConversationsProjection();
            },
            
            _initAllConversationsProjection: function() {
                var allConversations = Skype.Model.ConversationsRepository.instance.conversations;
                this.all = new Skype.Model.ContactListProjection(allConversations);
            },
            _initOnlineConversationsProjection: function() {
                var allConversations = Skype.Model.ConversationsRepository.instance.conversations;
                this.online = new Skype.Model.ContactListProjection(allConversations, {
                    monitoredProperties: ["isAvailable"],
                    filterFunction: this._filterOnlineContacts
                });
            },
            _initGropConversationsProjection: function () {
                var allConversations = Skype.Model.ConversationsRepository.instance.conversations;
                this.groups = new Skype.Model.ContactListProjection(allConversations, {
                    monitoredProperties: null,
                    filterFunction: this._filterGroups
                });
            },
            
            noMessengerNoEchoContacts: {
                get : function () {
                    if(!this._noMessengerNoEchoContacts) {
                        var allConversations = Skype.Model.ConversationsRepository.instance.conversations;
                        this._noMessengerNoEchoContacts = new Skype.Model.ContactListProjection(allConversations, {
                            monitoredProperties: null,
                            filterFunction: function (conversation) {
                                return conversation.contact && !conversation.contact.isMessengerContact && !conversation.contact.isEchoService;
                            }
                        });
                    }
                    return this._noMessengerNoEchoContacts;
                }
            },
            
            _filterOnlineContacts: function (conversation) {
                return conversation.isAvailable;
            },

            _filterNotFavoriteContacts: function (conversation) {
                if (conversation.isBlocked) {
                    return false;
                }
                
                return !conversation._favoriteOrder; 
            },

            
            _filterGroups: function (conversation) {
                return !conversation.contact;
            },

            _filterOutSpecfiedContacts: function (conversation) {
                if(conversation.isBlocked) {
                    return false;
                }
                
                return conversation.contact && !conversation.contact.isLyncContact && !conversation.contact.isMessengerContact && !conversation.contact.isEchoService &&
                       (this.contactIDsToFilterOut.indexOf(conversation.contact.identity) == -1);
            },

            getFilteredContacts: function (contactIDsToLeaveOut) {
                var allConversations = Skype.Model.ConversationsRepository.instance.conversations;
                this.contactIDsToFilterOut = contactIDsToLeaveOut;
                return new Skype.Model.ContactListProjection(allConversations, {
                    monitoredProperties: null,
                    filterFunction: this._filterOutSpecfiedContacts.bind(this)
                });
            },

            getNotFavoriteContacts: function (contactIDsToLeaveOut) {
                return new Skype.Model.ContactListProjection(Skype.Model.ConversationsRepository.instance.conversations, {
                    monitoredProperties: null,
                    filterFunction: this._filterNotFavoriteContacts
                });
            },
        }, {
        }, {
            instance: {
                get: function () {
                    if (!instance) {
                        instance = new Skype.Model.ContactsRepository();
                    }
                    return instance;
                }
            },
            dispose: function () {
                instance && instance.dispose();
                instance = null;
            },
            

            compareByName: function (item1, item2) {
                var result = item1.characterGrouping.index - item2.characterGrouping.index;
                if (result !== 0) {
                    return result;
                }

                return Skype.Utilities.compareByLCaseName(item1, item2);
            },
        });

    WinJS.Namespace.define("Skype.Model", {
        ContactsRepository: WinJS.Class.mix(contactsRepository, Skype.Class.disposableMixin)
    });

    window.traceClassMethods && window.traceClassMethods(contactsRepository, "ContactsRepository",
        ["_initAllConversationsProjection", "_initOnlineConversationsProjection", "_initGropConversationsProjection"]);
}());