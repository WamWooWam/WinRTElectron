

(function () {
    "use strict";

    var directorySearch = MvvmJS.Class.define(function () {
        this.status = directorySearch.SearchStatus.notStarted;
    }, {
        _searchTask: null,

        search: function (searchText) {
            this._disposeSearch();
            this._lastSearchText = searchText;

            this._searchTask = new LibWrap.ContactSearch();

            this._resetList();
            this.regEventListener(this._searchTask, "propertychange", this._handleSearchPropertyChange.bind(this));
            this.regEventListener(this._searchTask, "match", this._handleNewResult.bind(this));

            this.status = directorySearch.SearchStatus.searching;
            var ok = this._searchTask.search(searchText);
            if (!ok) {
                this._disposeSearch();
                return;
            }
        },
        cancel: function () {
            this.status = directorySearch.SearchStatus.notStarted;
            this._disposeSearch();
            this._resetList();
        },
        _handleSearchPropertyChange: function (evt) {
            if (evt.detail[0] === LibWrap.PROPKEY.contactsearch_CONTACT_SEARCH_STATUS) { 
                var status = this._searchTask.getIntProperty(LibWrap.PROPKEY.contactsearch_CONTACT_SEARCH_STATUS);
                if ([LibWrap.ContactSearch.status_FINISHED, LibWrap.ContactSearch.status_FAILED, LibWrap.ContactSearch.status_EXTENDABLE].indexOf(status) !== -1) {
                    
                    this.dispatchEvent(Skype.Model.DirectorySearch.Events.finished);
                }
            }
        },
        _handleNewResult: function (evt) {
            this.status = directorySearch.SearchStatus.hasResults;
            var match = evt.detail[0];
            this._loadContact(match);

            var firstItem = this.list.getItem(0);
            if (firstItem) {
                firstItem.showFocus = true;
                firstItem.hasFocus = true;
                this.firstItem = firstItem;
            }
        },

        _onDispose: function () {
            this._disposeSearch();
        },

        _disposeSearch: function () {
            if (this._searchTask) {
                this.unregObjectEventListeners(this._searchTask);
                this._searchTask.discard();
                this._searchTask = null;

                if (this.status === directorySearch.SearchStatus.searching) {
                    this.status = directorySearch.SearchStatus.noResults;
                } else {
                    this.status = directorySearch.SearchStatus.canceled;
                }
            }
        },

        _loadContact: function (match) {
            var libContact = match.target;
            var contactWrapper = new Skype.Model.SearchedContact(libContact);
            var matchInName = match.property === LibWrap.PROPKEY.conversation_DISPLAYNAME;

            contactWrapper.searchInfo = new Skype.Model.SearchInfo(matchInName, match.title);

            contactWrapper.alive();
            this._rawList.push(contactWrapper);
        },


        _resetList: function () {
            if (this.list) {
                this.list.dispose();
            }
            if (this._rawList) {
                this._rawList.forEach(function (wrapper) {
                    wrapper.dispose();
                });
            }
            this._rawList = new WinJS.Binding.List();
            this.list = this._rawList
                  .createFiltered(this._filter);
        },

        _filter: function (item) {
            return !item.isEchoService;
        }
    }, {
        _rawList: null,
        list: null,
        firstItem: {},

        isSearching: false,
        status: null
    }, {
        SearchStatus: {
            notStarted: "NOTSTARTED",
            searching: "SEARCHING",
            hasResults: "HASRESULTS",
            noResults: "NORESULTS",
            canceled: "CANCELED"
        },
        Events: {
            "finished": "finished"
        }
    });

    WinJS.Namespace.define("Skype.Model", {
        DirectorySearch: WinJS.Class.mix(directorySearch, Skype.Class.disposableMixin)
    });

}());

