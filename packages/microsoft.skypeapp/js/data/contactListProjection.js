

(function () {
    "use strict";
    var letterGroupOther = "#";

    var itemType = {
        letter: 0,
        contact: 1
    };

    var contactListProjection = MvvmJS.Class.define(function (inputList, filterSettings) {
        this._init(inputList, filterSettings);
    }, {
        contacts: null,
        letters: null,

        _innerLetters: null,

        _inputList: null, 
        _innerList: null,
        _identityToItemMap: null,
        _letterToItemMap: null,

        _filterSettings: {
            monitoredProperties: null,
            filterFunction: null
        },
        _contactsLength: 0,

        _init: function (inputList, filterSettings) {
            this._inputList = inputList;
            if (filterSettings) {
                this._filterSettings = filterSettings;
            }

            this.regEventListener(this._inputList, "iteminserted", this._handleItemInserted.bind(this));
            this.regEventListener(this._inputList, "itemremoved", this._handleItemRemoved.bind(this));

            this._initLetters();
            this._initContacts();
        },

        _initContacts: function () {
            this._loadContacts();

            this.regEventListener(this.contacts, "iteminserted", this._handleFilteredItemInserted.bind(this));
            this.regEventListener(this.contacts, "itemremoved", this._handleFilteredItemRemoved.bind(this));
        },
        
        _loadContacts: function() {
            this._innerList = new WinJS.Binding.List();
            this._identityToItemMap = {};

            this.contacts = this._innerList
                .createFiltered(this._filterContacts.bind(this))
                .createSorted(this._compareByName)
                .createGrouped(
                    function (x) { return x.groupKey; },
                    function (x) { return this._createLetterItem(x.groupKey); }.bind(this),
                    this._compareLetters
                );


            this._inputList.forEach(this._addConversation.bind(this));
            
            this._updateContactsLength(this.contacts.length);

            
            this.contacts.groups.forEach(function (_, ix) { 
                var contactGroupItem = this.contacts.groups.getItem(ix);
                var key = contactGroupItem.key;
                var letterItem = this.letters.groups.getItemFromKey(key);
                letterItem.data.contactsCount = contactGroupItem.groupSize;
            }.bind(this));

            
            if (this.contacts.length) {
                this._updateGroupHints(this.contacts.getAt(0).groupKey);
            }

            this._initialLoad = false;
        },

        _initLetters: function () {
            var list = this._createAlphabetList();

            this.letters = list.createGrouped(
                function (x) { return x.groupKey; },
                function (x) { return x; },
                this._compareLetters
            );

            this._buildLettersMap();
        },
        _createAlphabetList: function () {
            var list = new WinJS.Binding.List();
            var that = this;
            function add(text) {
                var item = that._createLetterItem(text);
                list.push(item);
            }

            var groupings = Skype.Globalization.characterGroupings;
            var length = groupings.length;
            for (var i = 0; i < length; i++) {
                var label = groupings[i].label;
                if (label && label !== '&' && label !== '0 – 9') {
                    add(label);
                }
            }
            add(letterGroupOther);

            return list;
        },
        _buildLettersMap: function () {
            var map = {};
            this.letters.forEach(function (item, ix) {
                map[item.groupKey] = this.letters.getItem(ix);
            }.bind(this));
            this._letterToItemMap = map;
        },

        _initialLoad: true,
        _resetGroupHints: function () {
            if (this._initialLoad) {
                return;
            }

            var item, groupItem;
            for (var i = 0, length = this.letters.length; i < length; i++) {
                item = this.letters.getItem(i);
                item.groupKey = item.data.groupKey;

                groupItem = this.letters.groups.getItemFromKey(item.data.groupKey);
                if (groupItem) {
                    groupItem.firstItemIndexHint = this.contacts.indexOfKey(item.key);
                    if (groupItem.firstItemIndexHint === -1) {
                        groupItem.firstItemIndexHint = 0;
                    }
                } else {
                    log("error: Contact {0} with groupkey {1} has no group!".format(item.data.name, item.data.groupKey));
                }
            }
        },


        _handleItemInserted: function (event) {
            var conversation = event.detail.value;
            this._addConversation(conversation);
        },
        _addConversation: function (conversation) {
            this.regBind(conversation, "name", this._handleNameChange.bind(this, conversation));

            this._filterSettings.monitoredProperties && this._filterSettings.monitoredProperties.forEach(function (prop) {
                this.regBind(conversation, prop, this._handlePropertyChange.bind(this, prop, conversation.identity));
            }, this);

            conversation.alive();

            var item = this._createContactItem(conversation);
            this._addItem(item);
        },
        _addItem: function (item) {
            
            this._innerList.push(item);
            var listItem = this._innerList.getItem(this._innerList.length - 1);
            listItem.groupKey = item.groupKey;
            this._identityToItemMap[item.identity] = listItem;
            
        },
        _handleFilteredItemInserted: function (event) {
            var item = event.detail.value;
            this._updateContactsLength(1);

            this._updateLetterUsage(item.groupKey, 1);
        },

        _handleItemRemoved: function (event) {
            var conversation = event.detail.value;
            var identity = conversation.identity;

            var listItem = this._identityToItemMap[identity];
            if (!listItem) {
                throw "Item {0} to be removed not found!".format(identity);
            }

            var ixItem = this._innerList.indexOfKey(listItem.key);
            if (ixItem === -1) {
                throw "Item {0} to be removed not found!".format(identity);
            }
            this.unregObjectBinds(conversation);

            this._innerList.splice(ixItem, 1);
            this._identityToItemMap[identity] = null;
        },
        _handleFilteredItemRemoved: function (event) {
            var item = event.detail.value;
            this._updateContactsLength(-1);

            this._updateLetterUsage(item.groupKey, -1);
        },
        _updateContactsLength: function (delta) {
            this._contactsLength += delta;
            this.formattedLength = this._contactsLength ? this._contactsLength.toString() : "";
        },
        _handleNameChange: function (conversation) {
            var identity = conversation.identity;

            var listItem = this._identityToItemMap[identity];
            if (!listItem) {
                return;
            }

            var ixItem = this._innerList.indexOfKey(listItem.key);
            
            if (ixItem === -1) {
                throw "Item {0} in the map but not in list!".format(identity);
            }
            var item = this._innerList.getAt(ixItem);
            if (!item.isContact) {
                return;
            }

            this._updateLetterUsage(item.groupKey, -1);

            item.refresh();

            this._innerList.notifyMutated(ixItem);

            this._updateLetterUsage(item.groupKey, 1);

            
        },
        _handlePropertyChange: function (prop, identity) {

            var listItem = this._identityToItemMap[identity];
            if (!listItem) {
                return;
            }

            var ixItem = this._innerList.indexOfKey(listItem.key);
            
            if (ixItem === -1) {
                throw "Item {0} in the map but not in the list!".format(identity);
            }

            
            this._innerList.notifyMutated(ixItem);
            
        },

        _updateLetterUsage: function (key, increase) {
            var listItem = this._letterToItemMap[key];
            if (!listItem) {
                throw "No letter found for key: " + key;
            }

            var list = this.letters;
            var ixLetter = list.indexOfKey(listItem.key);
            if (ixLetter === -1) {
                throw "No letter found for key: " + key;
            }

            var letter = list.getAt(ixLetter);
            var oldCount = letter.contactsCount;
            letter.contactsCount = oldCount + increase;

            this._updateGroupHints(key);

            list.notifyMutated(ixLetter);
        },

        _updateGroupHints: function (key) {
            var startIndex = this.letters.groups.indexOfKey(key);
            for (var i = startIndex, length = this.letters.groups.length; i < length; i++) {
                this._updateGroupHint(this.letters.groups.getItem(i));
            }
        },
        _updateGroupHint: function (letterGroupItem) {
            assert(letterGroupItem, "letterGroupItem");
            
            var contactsGroupItem = this.contacts.groups.getItemFromKey(letterGroupItem.key);
            if (contactsGroupItem) {
                letterGroupItem.firstItemIndexHint = contactsGroupItem.firstItemIndexHint;
            } else {
                letterGroupItem.firstItemIndexHint = 0;
            }
        },

        _createLetterItem: function (key) {
            return new Skype.Model.LetterItem(key);
        },
        _createContactItem: function (conversation) {
            return new Skype.Model.ContactItem(conversation);
        },

        _filterContacts: function (item) {
            ///<disable>JS2015.PlaceOpeningBraceAtEndOfLine</disable>
            if (item.isContact && (!this._filterSettings.filterFunction || this._filterSettings.filterFunction(item.conversation))) {
                return true;
            }
            return false;
        },

        _compareLetters: function (left, right) {
            return Skype.Globalization.getCharacterGroupingsIndex(left) - Skype.Globalization.getCharacterGroupingsIndex(right);
        },

        _compareByName: function (left, right) {
            var result = left.groupIndex - right.groupIndex;
            if (result !== 0) {
                return result;
            }

            if (left.isLetter) {
                return -1;
            }
            if (right.isLetter) {
                return 1;
            }

            return left.nameLowerCased.localeCompare(right.nameLowerCased);
        }

    }, {
        formattedLength: ""
    }, {
        ItemType: itemType
    });

    WinJS.Namespace.define("Skype.Model", {
        ContactListProjection: WinJS.Class.mix(contactListProjection, Skype.Class.disposableMixin)
    });

    var letterItem = MvvmJS.Class.define(function (key) {
        this.identity = key;
        this.isLongKey = key.length > 1;
        this.nameLowerCased = this.identity.toLocaleLowerCase();
        this.groupKey = key;
        this.groupIndex = Skype.Globalization.getCharacterGroupingsIndex(this.groupKey);
    }, {
        type: Skype.Model.ContactListProjection.ItemType.letter,
        isLetter: true,
        identity: null,
        name: {
            get: function () {
                return this.identity;
            }
        },
        nameLowerCased: null,
        isLongKey: false,
        groupKey: null,
        groupIndex: 0
    }, {
        contactsCount: 0
    });

    var contactItem = MvvmJS.Class.define(function (conversation) {
        this.conversation = conversation;

        this.refresh();
    }, {
        type: Skype.Model.ContactListProjection.ItemType.contact,
        isContact: true,
        conversation: null,
        identity: {
            get: function () {
                return this.conversation.identity;
            }
        },
        name: {
            get: function () {
                return this.conversation.name;
            }
        },
        nameLowerCased: null,
        isLongKey: false,
        groupKey: null,
        groupIndex: 0,

        refresh: function () {
            this.nameLowerCased = this.name.toLocaleLowerCase();
            this.groupKey = Skype.Globalization.getCharacterGroupingsLetter(this.nameLowerCased);
            this.groupIndex = Skype.Globalization.getCharacterGroupingsIndex(this.groupKey);
        }
    }, {
        contactsCount: 0
    });

    WinJS.Namespace.define("Skype.Model", {
        LetterItem: letterItem,
        ContactItem: contactItem
    });
}());
