

(function () {
    "use strict";


    var LibWrap;
    var Skype;

    function use(dependencies) {
        LibWrap = (dependencies && dependencies.LibWrap) || window.LibWrap;
        Skype = (dependencies && dependencies.Skype) || window.Skype;
    }
    use();

    var SearchStatus = {
        notStarted: "NOTSTARTED",
        notDirOnlyStarted: "NOTDIRONLYSTARTED",
        searching: "SEARCHING",
        hasResults: "HASRESULTS",
        noLocalResults: "NOLOCALRESULTS",
        noDirectoryResults: "NODIRECTORYRESULTS",
    };

    var GroupKey = {
        other: "other",
        group: "group",
        dialog: "dialog",
        more: "more"
    };

    var Source = {
        local: "local",
        directory: "directory",
        directorySpinner: "directorySpinner",
        directorySearchButton: "directorySearchButton"
    };


    var searchVm = MvvmJS.Class.define(function (conversationFactory) {
        this._convFactory = conversationFactory || Skype.Model.ConversationFactory;
        this._dirSearch = new Skype.Model.DirectorySearch();

        this.regEventListener(this._dirSearch, "finished", this._handleDirectorySearchFinished.bind(this));

        this.regBind(this, "isVertical", this._updateCurrentSearchLabel.bind(this));
    }, {
        _list: null,

        _queryText: null,

        _convFactory: null,

        _convSearchId: 0,
        _localSearch: null,
        _dirSearch: null,

        _dirSearchIsFinished: false,
        _localSearchIsFinished: false,

        _identityMap: null,

        
        searchAsync: function (queryText) {
            
            if (!queryText || (queryText.trim() === "")) {
                return WinJS.Promise.as();
            }

            
            if (!this._localSearch) {
                this._localSearch = new LibWrap.ConversationSearch();
                this.regEventListener(this._localSearch, "done", this._handleLocalSearchFinished.bind(this));
            }
            
            return this._resetAsync().then(function () {
                this._queryText = queryText;
                this._switchToSearching();
                
                this._convSearchId = this._localSearch.start(queryText);
            }.bind(this));
        },
        cancelDirectorySearch: function () {
            this._dirSearch.cancel();
            this.status = searchVm.SearchStatus.notStarted;
        },
        searchDirectoryOnly: function (queryText) {
            
            this.status = searchVm.SearchStatus.notDirOnlyStarted;
            if (!queryText || (queryText.trim() === "")) {
                return WinJS.Promise.as();
            }
            var that = this;
            return this._resetAsync().then(function () {
                that.status = searchVm.SearchStatus.notDirOnlyStarted;
                that._queryText = queryText;
                that._searchDirectoryOnly(queryText);
            });
        },
        searchDirectory: function () {
            if (this._queryText) {
                this._removeAllDirectoryItems();
                this._addDirSearchSpinner();
                this._switchToDirectorySearching();
                this._dirSearch.search(this._queryText);
                
                Skype.Statistics.sendStats(Skype.Statistics.event.search_directorySearchInvoked);
            }
        },
        resetAsync: function () {
            return this._resetAsync().then(function () {
                this._disposeLocalSearch();
                this.status = searchVm.SearchStatus.notStarted;
            }.bind(this));
        },


        
        _handleLocalSearchFinished: function (evt) {
            var idx = evt.detail[0];
            if (idx != this._convSearchId) {
                return;
            }
            var matches = evt.detail[1];
            this._addLocalSearchResults(matches);

            this._addDirSearchButton();
            roboSky.write("LocalSearch,finished");
        },
        _handleDirectorySearchFinished: function () {
            this._dirSearchIsFinished = true;
            this._addDirectoryMatchResults();
            roboSky.write("DirectorySearch,finished");
        },

        
        _getGroupKey: function (dataItem) {
            switch (dataItem.source) {
                case "localDialog":
                    return GroupKey.dialog;
                case "localGroup":
                    return GroupKey.group;
                default:
                    return (dataItem.groupKey ? dataItem.groupKey : GroupKey.more);
            }
        },

        _addDirectoryMatchResults: function () {
            this._removeAllDirectoryItems();

            this._dirSearch.list.forEach(this._addDirectoryMatchResult, this);
            this._switchToFinished();
        },
        _addDirectoryMatchResult: function (item) {
            var conversationAlreadyInResult = this._identityMap[item.identity];
            if (conversationAlreadyInResult) {
                return;
            }

            this._attachMatchResultInfo(item, Source.directory);
            this._list.push(item);
        },

        _addDirSearchSpinner: function () {
            var item = {};
            this._attachMatchResultInfo(item, Source.directorySpinner);
            this._list.push(item);
        },
        _addDirSearchButton: function () {
            var item = { groupKey: GroupKey.other };
            this._attachMatchResultInfo(item, Source.directorySearchButton);
            var that = this;
            item.dispose = function () {
                item.isDisposed = true;
            };
            item.run = function (evt) {
                if (!item.isDisposed) {
                    this.regImmediate(function () {
                        that.searchDirectory();
                    });
                }
            }.bind(this);
            this._list.push(item);
        },
        _removeAllDirectoryItems: function () {
            while (this._list && this._list.length) {
                var lastIndex = this._list.length - 1;
                var groupKey = this._list.getAt(lastIndex).groupKey;
                if (groupKey === GroupKey.dialog || groupKey === GroupKey.group) {
                    return;
                }
                this._list.splice(lastIndex, 1);
            }
        },
        _addLocalSearchResults: function (matches) {
            this._localSearchIsFinished = true;
            matches.forEach(this._addLocalSearchResult, this);
            this._switchToFinished();
        },
        _addLocalSearchResult: function (searchResultItem) {
            var item = this._convFactory.createConversation(searchResultItem.conv);
            this._attachMatchResultInfo(item, "local");

            this._updateLocalMatchItemInfo(item, searchResultItem);

            item.alive();
            this._identityMap[item.identity] = true;
            this._list.push(item);
        },

        _updateLocalMatchItemInfo: function (item, match) {
            
            var length;

            item.searchInfo.description = ""; 
            item.searchInfo.title = "";


            switch (match.property) {
                case LibWrap.PROPKEY.conversation_DISPLAYNAME:
                    item.searchInfo.matchInName = true;
                    item.searchInfo.title = match.title;
                    item.searchInfo.name = "";
                    if (!item.isDialog) {
                        length = item.libConversation.participants.length;
                        item.searchInfo.description = Skype.Globalization.formatNumericID("search_groupnamematch", length).translate(length);
                    }
                    break;
                case LibWrap.PROPKEY.conversation_IDENTITY:
                case LibWrap.PROPKEY.contact_DISPLAYNAME:
                case LibWrap.PROPKEY.participant_IDENTITY:
                    if (item.isDialog) {
                        item.searchInfo.name = match.title;
                        item.searchInfo.description = match.description;
                    } else {
                        item.searchInfo.title = match.title;
                        length = item.libConversation.participants.length;
                        item.searchInfo.description = Skype.Globalization.formatNumericID("search_match_participant", length).translate(length, match.description);
                    }
                    break;
                case LibWrap.PROPKEY.contact_PHONE_HOME:
                case LibWrap.PROPKEY.contact_PHONE_OFFICE:
                case LibWrap.PROPKEY.contact_PHONE_MOBILE:
                case LibWrap.PROPKEY.contact_ASSIGNED_PHONE1:
                case LibWrap.PROPKEY.contact_ASSIGNED_PHONE2:
                case LibWrap.PROPKEY.contact_ASSIGNED_PHONE3:
                    var phoneType = item.contact.getPhoneTypeOfProperty(match.property);
                    var phoneTypeName = Skype.Model.PhoneType.asArray[phoneType];
                    item.searchInfo.name = match.title;
                    if (phoneTypeName) {
                        item.searchInfo.description = ("search_phone_" + phoneTypeName.name).translate(match.description);
                    }
                    break;
            }
        },
        _attachMatchResultInfo: function (item, source) {
            var isDialog = item.isDialog;
            item.source = source + (isDialog !== undefined ? (isDialog ? "Dialog" : "Group") : "");
            if (!item.searchInfo) {
                item.searchInfo = new Skype.Model.SearchInfo();
            }
            item.groupKey = this._getGroupKey(item);
        },


        _updateCurrentSearchLabel: function () {
            var safeText = Skype.Utilities.escapeHTML(this._queryText);
            switch (this.status) {
                case searchVm.SearchStatus.noLocalResults:
                    this.currentSearchLabel = "search_no_local_search_results_title".translate(safeText);
                    break;
                case searchVm.SearchStatus.noDirectoryResults:
                    this.currentSearchLabel = "search_no_search_results_title".translate(safeText);
                    break;
                default:
                    this.currentSearchLabel = this.isVertical ? "search_search_title_snap".translate(safeText) : "search_search_title".translate(safeText);
                    break;
            }
        },

        _switchToSearching: function () {
            this.status = searchVm.SearchStatus.searching;

            this._updateCurrentSearchLabel();
            this.isSearching = true;
        },
        _switchToDirectorySearching: function () {
            this.status = searchVm.SearchStatus.searching;
        },
        _switchToFinished: function () {
            this.isSearching = false;

            if (this._list.length === 0) {
                this.status = this._dirSearchIsFinished ? searchVm.SearchStatus.noDirectoryResults : searchVm.SearchStatus.noLocalResults;
            } else {
                this.status = searchVm.SearchStatus.hasResults;
            }
            this._updateCurrentSearchLabel();
        },

        _searchDirectoryOnly: function (searchQuery) {
            this._queryText = searchQuery;
            this.isSearching = true;
            this.status = searchVm.SearchStatus.notDirOnlyStarted; 
            this._updateCurrentSearchLabel();
            this.searchDirectory();
        },

        _disposeLocalSearch: function () {
            if (this._localSearch) {
                this.unregObjectEventListeners(this._localSearch);
                this._localSearch.cancel();
                this._localSearch = null;
            }
        },

        _disposeList: function (deep) {
            
            deep = deep || false;

            if (this._list) {
                this._list.forEach(function (wrapper) {
                    if (!deep && wrapper.source !== "directory") {
                        if (wrapper.libConversation) {
                            wrapper.libConversation = null;
                        }
                        if (wrapper.contact && wrapper.contact.libContact) {
                            wrapper.contact.libContact = null;
                        }
                    }
                    wrapper.dispose && wrapper.dispose();
                });
            }
        },
        _resetAsync: function (deep) {
            this._queryText = "";
            this._identityMap = {};
            this._localSearchIsFinished = false;
            this._dirSearchIsFinished = false;

            this._localSearch && this._localSearch.cancel();

            var oldList = this.list;

            this._disposeList(deep);
            this._list = new WinJS.Binding.List();
            this.list = this._list.createGrouped(this._getDataItemGroupKey, this._getGroupData, this._compareGroups.bind(this));

            return WinJS.Promise.as(function() {
                oldList && oldList.dispose();
            });
        },

        
        _compareGroups: function (left, right) {
            return this._groupToOrder(left) - this._groupToOrder(right);
        },

        _groupToOrder: function (key) {
            switch (key) {
                case GroupKey.dialog:
                    return 1;
                case GroupKey.group:
                    return 2;
                default:
                    return 3;
            }
        },

        
        _getDataItemGroupKey: function (dataItem) {
            return dataItem.groupKey;
        },

        
        _getGroupData: function (dataItem) {
            if (dataItem.isDisposed) {
                return "";
            }

            return {
                title: ("search_title_" + (dataItem.groupKey === GroupKey.other ? GroupKey.more : dataItem.groupKey)).translate()
            };
        },


        
        _sortByTypeAndName: function (left, right) {
            
            
            
            var result = left.rankValue - right.rankValue;
            if (result !== 0) {
                return result;
            }

            result = (left.contact ? left.contact.popularity : -1) - (right.contact ? right.contact.popularity : -1);
            if (result !== 0) {
                return result;
            }
            return Skype.Utilities.compareByLCaseName(left, right);
        },


        _onDispose: function () {
            this._disposeLocalSearch();
        }
    }, {
        

        
        list: null,

        currentSearchLabel: "",

        isSearching: false,
        status: SearchStatus.notStarted,

        isVertical: false
    }, {
        
        SearchStatus: SearchStatus,
        GroupKey: GroupKey,
        Source: Source,

        use: use
    });


    WinJS.Namespace.define("Skype.ViewModel", {
        SearchVM: WinJS.Class.mix(searchVm, Skype.Class.disposableMixin),
    });

}());