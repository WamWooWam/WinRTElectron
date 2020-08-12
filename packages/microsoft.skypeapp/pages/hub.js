

(function () {
    "use strict";

    var RECENT_ITEM_WIDTH = 320,
        RECENT_ITEM_WIDTH_IN_SNAP = 320,
        LARGE_ITEM_HEIGHT = 270,
        STANDARD_RECENT_ITEM_HEIGHT = 90,
        LARGE_RECENT_ITEM_HEIGHT = 180,
        STANDARD_ITEM_HEIGHT = 135,
        VERTICAL_OFFSET = 180,
        FAVORITES_THROTTLE_IN_MS = 500,
        LCM_SHOW_TIMES = 3,
        LCM_SHOWN_TIMES_KEY = "skype." + Skype.Version.uiVersion(true) + ".welcomeLCM.showCount",
        AD_CONTAINER_VISIBLE = "ADCONTAINERVISIBLE",
        AD_CONTAINER_REMOVED = "AdContainerRemoved",
        AD_CONTAINER_ADDED = "AdContainerAdded",
        PX = "px",
        CLICK = "click",
        KEYDOWN = "keydown",
        LINK = "link",
        ITEM_INSERTED = "iteminserted",
        ITEM_REMOVED = "itemremoved",
        ITEM_INVOKED = "iteminvoked",
        LISTVIEW_LOADINGSTATE_CHANGED = "loadingstatechanged",
      	PEOPLE_LINK_LIMIT = 20,
        localSettings = Windows.Storage.ApplicationData.current.localSettings,
        listRepoMappings = [
            { name: "peopleList", repoRef: Skype.Model.ConversationsRepository },
            { name: "favoritesList", repoRef: Skype.Model.FavoriteConversationsRepository }
        ],

        
        updateFavouriteSelection = function(selection) {
            var selectedFavorites = [],
                i,
                length = selection.length;
            for (i = 0; i < length; i++) {
                selectedFavorites.push(selection[i].data);
            }
            Skype.UI.AppBar.instance.updateContext({ selectedFavorites: selectedFavorites });
            roboSky.write("Selection,changed");
        },
        pickMultipleContacts = function(conversations) {
            var conversation,
                i,
                length;
            
            if (conversations) {
                length = conversations.length;
                for (i = 0; i < length; i++) {
                    conversation = conversations.getItem(i).data;
                    conversation.libConversation.pinFirst();
                }
            }
            roboSky.write("PeoplePicker,closed");
        };
        

    var page = Skype.UI.Page.define("/pages/hub.html", "div.fragment.hub", {
        useOneInstance: true,
        isActive: false,
        _myself: null,
        _presenceBar: null,
        favoriteItemSize: null,
        useDenseFavouritesLayout: false,
        favoriteItemsInColumnVirtual: 0,
        recentsVM: {
            value: null,
            skipDispose: true,
            writable: true
        },

        _handleListViewFinished: function (name, event) {
            
            var listView = event.srcElement.winControl;

            if (listView.loadingState === "complete") {
                
                
                roboSky.write("completing " + name);
                this._renderFinishedSignals[name] && this._renderFinishedSignals[name].complete();
                this.unregEventListener(listView, LISTVIEW_LOADINGSTATE_CHANGED, this._handleListViewFinishedArr[name]);
            }
        },

        onPageEnteredAndAnimated: function() {
            var promises = [];
            for (var key in this._renderFinishedSignals) {
                promises.push(this._renderFinishedSignals[key].promise);
            }
            WinJS.Promise.join(promises)
                .then(this._logVisibleComplete());
        },
        
        _logVisibleComplete: function() {
            roboSky.write("Activation,scenario,StopTM");
            Skype.Diagnostics.PerfTrack.instance.writeLaunchStopEvent(Microsoft.PerfTrack.PerfTrackTimePoint.visibleComplete);
        },
    
        _logResponsive: function() {
            Skype.Diagnostics.PerfTrack.instance.writeLaunchStopEvent(Microsoft.PerfTrack.PerfTrackTimePoint.responsive);
        },

        hasLCM: false,

        lcmShownTimes: {
            get: function () {
                return localSettings.values[LCM_SHOWN_TIMES_KEY] || 0;
            },
            set: function (value) {
                localSettings.values[LCM_SHOWN_TIMES_KEY] = value;
            }
        },

        init: function () {
            log("hub page init()");
            this.listsLayoutInitialized = false;

            this._renderFinishedSignals = {
                recentsList: new WinJS._Signal(),
                peopleList: new WinJS._Signal(),
                favoritesList: new WinJS._Signal()
            };
        },

        onRender: function () {
            var element = this.element;
            this.recentsContainer = element.querySelector('div.categoryContainer.recents');

            var callBtn = this.element.querySelector('div.linksContainer div.callPhones');
            this.regEventListener(callBtn, CLICK, this.onCallClick);

            var newChatBtn = element.querySelector('div.linksContainer div.newChat');
            this.regEventListener(newChatBtn, CLICK, this.onNewChatClick);

            var searchContactsBtn = element.querySelector('div.linksContainer div.searchContacts');
            this.regEventListener(searchContactsBtn, CLICK, this.onSearchContactsClick);

            var recentTitle = element.querySelector('div.recents button.title');
            this.regEventListener(recentTitle, CLICK, this.onRecentTitleClicked);

            var favoritesTitle = element.querySelector('div.favorites button.title');
            this.regEventListener(favoritesTitle, CLICK, this.onFavoriteTitleClicked.bind(this));

            var peopleTitle = element.querySelector('div.people button.title');
            this.regEventListener(peopleTitle, CLICK, this.onPeopleClicked);

            this.surfaceEl = element.querySelector('div.surface');
            this.welcomeLCM = element.querySelector("div.categoryContainer.welcomeLCM");
            this.welcomeLCMMessage = this.welcomeLCM.querySelector("div.welcomeLCM > div.message");

            this.regEventListener(window, "resize", this.onWindowResize.bind(this));
            this.regEventListener(element, "mousewheel", this.onMouseWheel.bind(this));

            this.adContainerEl = element.querySelector(".displayAdsContainer");
            this.adContainerTabIndex = this.adContainerEl.tabIndex; 
            this.onAdContainerChange = this.onAdContainerChange.bind(this);
        },

        onCallClick: function (evt) {
            Skype.Statistics.sendStats(Skype.Statistics.event.hub_openDiler);
            Skype.UI.navigate("dialer");
        },

        onNewChatClick: function (evt) {
            Skype.Statistics.sendStats(Skype.Statistics.event.hub_openNewChat);
            Actions.invoke("createChat");
        },

        onSearchContactsClick: function (evt) {
            Skype.Statistics.sendStats(Skype.Statistics.event.hub_openSearch);
            Skype.UI.navigate("search", { reset: true });
        },

        onRecentTitleClicked: function (evt) {
            if (WinJS.Utilities.hasClass(evt.currentTarget, LINK)) {
                Skype.Statistics.sendStats(Skype.Statistics.event.hub_openRecentMessages);
                Skype.UI.navigate("allHistory", { switchToDefault: true });
            }
        },

        onPeopleClicked: function (evt) {
            Skype.Statistics.sendStats(Skype.Statistics.event.hub_openPeople);
            Skype.UI.navigate("contacts");
       },

        onMouseWheel: function (e) {
            this.element.querySelector("div.viewport").scrollLeft -= e.wheelDelta;
        },


        onReady: function () {
            var element = this.element;

            this.recents = this.recentsContainer.querySelector('div.recentsList').winControl;
            this.favorites = element.querySelector('div.categoryContainer.favorites div.favoritesList').winControl;
            this.people = element.querySelector('div.categoryContainer.people div.peopleList').winControl;
            this._presenceBar = element.querySelector('div.presenceBar').winControl;

            this.favorites.element.focus();

            this.recentsItemsContainer = this.recents.element.parentNode;
            this.favoritesItemsContainer = this.favorites.element.parentNode;
            this.peopleItemsContainer = this.people.element.parentNode;
            this._handleListViewFinishedArr = {};
            this._handleListViewFinishedArr["recentsList"] = this._handleListViewFinished.bind(this, "recentsList");
            this._handleListViewFinishedArr["favoritesList"] = this._handleListViewFinished.bind(this, "favoritesList");
            this._handleListViewFinishedArr["peopleList"] = this._handleListViewFinished.bind(this, "peopleList");

            this.fitLCM = this.fitLCM.bind(this);
            this.initListsLayout = this.initListsLayout.bind(this);
            this._updateRecentsDimensions = this._updateRecentsDimensions.bind(this);
            this._updateFavoritesDimensions = this._updateFavoritesDimensions.bind(this);
            this._updatePeopleDimensions = this._updatePeopleDimensions.bind(this);
            this._updatePeopleListWidth = this._updatePeopleListWidth.bind(this);
            this._navigateToConversation = this._navigateToConversation.bind(this);

            
            Skype.UI.Util.disableElementAnimation(element, this);

            this.regEventListener(this.recents, LISTVIEW_LOADINGSTATE_CHANGED, this._handleListViewFinishedArr["recentsList"]);
            this.regEventListener(this.favorites, LISTVIEW_LOADINGSTATE_CHANGED, this._handleListViewFinishedArr["favoritesList"]);
            this.regEventListener(this.people, LISTVIEW_LOADINGSTATE_CHANGED, this._handleListViewFinishedArr["peopleList"]);

            this.regEventListener(this.recents, ITEM_INVOKED, this._navigateToConversation);
            this.regEventListener(this.favorites, ITEM_INVOKED, this._navigateToConversation);
            this.regEventListener(this.favorites, "selectionchanged", this._favoriteSelectionChanged.bind(this));
            this.regEventListener(this.people, ITEM_INVOKED, this._navigateToConversation);

            
            this.regEventListener(element.querySelector(".peopleList"), KEYDOWN, this._preventListviewAction);
            this.regEventListener(element.querySelector(".favoritesList"), KEYDOWN, this._preventListviewAction);
            this.regEventListener(element.querySelector(".recentsList"), KEYDOWN, this._preventListviewAction);

            Skype.UI.Util.preventTextLinks(element);

            
            this.hasLCM = this.lcmShownTimes < LCM_SHOW_TIMES;
            if (this.hasLCM) {
                this.initLCM();
            }

            this.regImmediate(function () {
                document.querySelector(".fragment.hub").focus();
            });
        },

        initLCM: function () {
            var isUpdate = Skype.Version.previousVersions.length > 0;

            var messageEl = this.welcomeLCMMessage;
            var titleEl = messageEl.querySelector(".title");
            var textEl = messageEl.querySelector(".text");

            if (isUpdate) {
                titleEl.textContent = "hub_update_message_title_generic".translate();
                textEl.innerHTML = "hub_update_message_text".translate();
                messageEl.style.backgroundImage = "url(/images/svg/welcome_upgrade.svg)";
            } else {
                titleEl.textContent = "hub_welcome_message_title_generic".translate();
                textEl.textContent = "hub_welcome_message_text".translate();
                messageEl.style.backgroundImage = "url(/images/welcome_hand.png)";
            }

            
            this._myself = new Skype.Model.Contact(lib.getContactByIdentity(lib.myIdentity));
            this.regBind(this._myself, "name", function (name) {
                if (name && titleEl && this._myself.identity != name) {
                    titleEl.innerHTML = (isUpdate ? "hub_update_message_title" : "hub_welcome_message_title").translate(name); 
                    this.regImmediate(this.fitLCM);
                }
            }.bind(this));

            this.fitLCM();
        },

        fitLCM: function (noRetry) {
            if (Skype.Application.state.view.isVertical || !this.hasLCM) {
                return;
            }

            var messageEl = this.welcomeLCMMessage,
                availableHeight = messageEl.offsetHeight;
            if (availableHeight) { 
                var titleEl = messageEl.querySelector(".title");
                var textEl = messageEl.querySelector(".text");

                WinJS.Utilities.removeClass(messageEl, "small");

                var currentHeight = titleEl.offsetHeight + textEl.offsetHeight + 305; 
                if (currentHeight > availableHeight) {
                    
                    WinJS.Utilities.addClass(messageEl, "small");
                }

                
                if (!noRetry) {
                    this.regImmediate(this.fitLCM, true);
                }
            } else {
                
                this.regTimeout(this.fitLCM, 160);
            }
        },

        _favoriteSelectionChanged: function (evt) {
            this.favorites.selection.getItems().done(updateFavouriteSelection);
        },

        onFavoriteTitleClicked: function (evt) {
            if (!WinJS.Utilities.hasClass(evt.currentTarget, LINK)) {
                return;
            }
            this.hideAd();
            Skype.Statistics.sendStats(Skype.Statistics.event.hub_openFavorites);
            var notFavoriteContacts = Skype.Model.ContactsRepository.instance.getNotFavoriteContacts();
            Skype.UI.PeoplePicker.pickMultipleContactsAsync(notFavoriteContacts, null, "add_favorites".translate(), 
                                                            "aria_people_picker_window_label_favorites".translate()).then(pickMultipleContacts).then(this.restoreAd.bind(this));

        },

        restoreAd: function () {
            if (!Skype.Application.state.view.isVertical && !this.hasLCM) {
                this.showAd();
            }
        },

        onShow: function () {
            this.isActive = true;

            
            if (!Skype.Application.state.view.isVertical) {
                var element = document.querySelector("div.hub div.hubContainer:not(.HIDDEN) div.viewport");
                if (element) {
                    element.scrollTop = 0;
                }
            }
            

            
            !this.recentsVM && this.initVMs();
            if (!this.listsLayoutInitialized) {
                this.initListsLayout();
                
                
                this.recents.forceLayout();
            }

            this.refreshAdAndLCMState();
            this._logResponsive();
        },

        refreshAdAndLCMState: function () {
            if (Skype.Application.state.view.isVertical) {
                
                this.hideAd();
                this.hideLCM();
            } else {
                if (this.hasLCM) {
                    
                    if (!this.lcmShownTimes) {
                        this.lcmShownTimes = 1;
                    } else {
                        
                        this.lcmShownTimes++;

                        if (this.lcmShownTimes >= LCM_SHOW_TIMES) {
                            
                            this.hasLCM = false;
                        }
                    }

                    this.showLCM();
                } else {
                    this.hideLCM();
                    if (!WinJS.Utilities.hasClass(document.body, "PICKERACTIVE")) {
                        this.showAd();
                    }
                }
            }
        },

        onAdContainerChange: function(evt) {
            if (evt.type === AD_CONTAINER_REMOVED && this.adContainerEl.tabIndex !== -1) {
                WinJS.Utilities.removeClass(this.surfaceEl, "ADRENDERED");
                this.adContainerTabIndex = this.adContainerEl.tabIndex;
                this.adContainerEl.tabIndex = -1;
            } else if (evt.type === AD_CONTAINER_ADDED) {
                WinJS.Utilities.addClass(this.surfaceEl, "ADRENDERED");
                this.adContainerEl.tabIndex = this.adContainerTabIndex;
            }
        },

        onHide: function () {
            this.hideAd();
            this.favorites && this.favorites.selection.clear();

            this.isActive = false; 
        },

        onWindowResize: function (evt) {
            if (this.isActive) {
                this.refreshAdAndLCMState();

                
                
                this.regImmediate(this.initListsLayout);
            } else {
                
                this.listsLayoutInitialized = false;
            }
        },

        getColumnHeight: function () {
            if (Skype.Application.state.view.isVertical) {
                return STANDARD_ITEM_HEIGHT * 4;
            } else {
                var avaiableHeight = Skype.Application.state.view.size.height - VERTICAL_OFFSET; 
                
                return Math.floor(avaiableHeight / LARGE_ITEM_HEIGHT) * LARGE_ITEM_HEIGHT;
            }
        },

        setFavoritesItemSize: function () {
            var columnHeight = this.getColumnHeight();
            this.useDenseFavouritesLayout = this._hasManyFavorites(columnHeight, this.hubFavoritesVM.favorites.length);
            this.favoriteItemSize = this.useDenseFavouritesLayout ? STANDARD_ITEM_HEIGHT : LARGE_ITEM_HEIGHT;
            this.favoriteItemsInColumn = this.useDenseFavouritesLayout ? this.favoriteItemsInColumnVirtual * 2 : this.favoriteItemsInColumnVirtual;
        },

        initListsLayout: function () {
            var columnHeight = this.getColumnHeight(),
                applicationStateView = Skype.Application.state.view,
                isVertical = applicationStateView.isVertical,
                previousItemsInColumn = this.peopleItemsInColumn,
                sizeChanged;

            this.welcomeLCMMessage.style.height = "";
            this.recentsItemsContainer.style.height = "";
            this.favoritesItemsContainer.style.height = "";
            this.peopleItemsContainer.style.height = "";

            this.setFavoritesItemSize();
            this.peopleItemsInColumn = isVertical ? 4 : Math.floor(columnHeight / STANDARD_ITEM_HEIGHT);

            if (!this.peopleItemsInColumn) {
                
                log("WARNING EMPTY HUB: hub initListsLayout() columnHeight: {1}, favoriteItemsInColumn {2}, LARGEITEMHEIGHT: {3}".format(columnHeight, this.favoriteItemsInColumn, LARGE_ITEM_HEIGHT));
                this.favoriteItemsInColumn = 2;
                this.peopleItemsInColumn = 4;
            }

            this._updateContainersHeights();

            sizeChanged = previousItemsInColumn !== this.peopleItemsInColumn;
            if (sizeChanged && this.peopleHubVM) {
                this.peopleHubVM.resize(this.peopleItemsInColumn * 2);
            }


            this.recentsVM && this._updateRecentsDimensions();
            if (this.peopleHubVM) {
                this._updatePeopleDimensions();
            }
            
            if (this.hubFavoritesVM) {
                this._updateFavoritesDimensions();
            }

            this._updateRecentsLayout();

            if (this.people.layout.orientation !== applicationStateView.orientation) {
                this.people.layout.orientation = applicationStateView.orientation;
            }

            if (this.favorites.layout.orientation !== applicationStateView.orientation) {
                this.favorites.layout.orientation = applicationStateView.orientation;
            }

            this.listsLayoutInitialized = true;
        },
        
        _updateContainersHeights: function () {
            
            if (Skype.Application.state.view.isVertical) {
                return;
            }
            
            
            
            if (!this.favoriteItemSize || !this.favoriteItemsInColumn) {
                this.setFavoritesItemSize();
            }

            var strCroppedHeight = this.getColumnHeight() + PX;

            this.welcomeLCMMessage.style.height = strCroppedHeight;
            this.favoritesItemsContainer.style.height = strCroppedHeight;
            this.peopleItemsContainer.style.height = strCroppedHeight;
            this.recentsItemsContainer.style.height = this.recentsVM.itemsInColumn * LARGE_RECENT_ITEM_HEIGHT + PX;

            this.regImmediate(this.fitLCM);
        },
        
        _hasManyFavorites: function (columnHeight, favoritesLength){
            this.favoriteItemsInColumnVirtual = Math.floor(columnHeight / LARGE_ITEM_HEIGHT);
            
            var hasManyFavs = favoritesLength > this.favoriteItemsInColumnVirtual * 2;
            if (hasManyFavs) {
                WinJS.Utilities.addClass(this.element.querySelector(".categoryContainer.favorites"), "MANY");
            } else {
                WinJS.Utilities.removeClass(this.element.querySelector(".categoryContainer.favorites"), "MANY");
            }
            
            return hasManyFavs;
        },

        _updateRecentsLayout: function () {
            var needToSwitchLayout = false,
                UI = WinJS.UI,
                applicationStateView = Skype.Application.state.view;

            
            if (!applicationStateView.isVertical) {
                needToSwitchLayout = !(this.recents.layout instanceof UI.CellSpanningLayout);
                if (needToSwitchLayout) {
                    this.recents.layout = new UI.CellSpanningLayout({
                        groupInfo: {
                            enableCellSpanning: true,
                            cellWidth: RECENT_ITEM_WIDTH,
                            cellHeight: STANDARD_RECENT_ITEM_HEIGHT
                        },

                        itemInfo: function (itemIndex) {
                            var item = this.recentsVM.conversations.getAt(itemIndex);
                            return {
                                    width: RECENT_ITEM_WIDTH,
                                    height: item && item.isLarge ? LARGE_RECENT_ITEM_HEIGHT : STANDARD_RECENT_ITEM_HEIGHT
                            };
                        }.bind(this)
                    });
                }
            } else { 

                
                var numberOfColumns = Math.max(1, Math.floor(this.recentsItemsContainer.clientWidth / RECENT_ITEM_WIDTH_IN_SNAP));
                if (numberOfColumns < 2) {
                    needToSwitchLayout = !(this.recents.layout instanceof UI.ListLayout);
                    if (needToSwitchLayout) {
                        this.recents.layout = new UI.ListLayout();
                    }
                    return;
                }

                needToSwitchLayout = !(this.recents.layout instanceof UI.GridLayout);
                if (needToSwitchLayout) {
                    this.recents.layout = new UI.GridLayout({ orientation: applicationStateView.orientation });
                }
            }
        },

        initVMs: function () {
            this._initRecentsVM();
            this._initPeopleVM();
            this._initFavoritesVM();

            listRepoMappings.forEach(function (map) {
                if (map.repoRef.instance.conversations.length == 0) {
                    this._renderFinishedSignals[map.name].complete();
                }
            }, this);
        },
        _initRecentsVM: function () {
            this.recentsVM = new Skype.ViewModel.HubRecentsVM(LARGE_RECENT_ITEM_HEIGHT, LARGE_ITEM_HEIGHT, RECENT_ITEM_WIDTH);
            this.recentsVM.run();

            WinJS.Binding.processAll(this.recentsContainer, this.recentsVM);

            this.regEventListener(this.recentsVM.conversations, ITEM_INSERTED, this._updateRecentsDimensions);
            this.regEventListener(this.recentsVM.conversations, ITEM_REMOVED, this._updateRecentsDimensions);
            this._updateRecentsDimensions();

        },
        
        _initPeopleVM: function() {
            this.peopleHubVM = new Skype.ViewModel.HubPeopleVM(this.peopleItemsInColumn * 2, PEOPLE_LINK_LIMIT);
            this.peopleHubVM.run();
            
            WinJS.Binding.processAll(this.peopleItemsContainer, this.peopleHubVM);            

            this.regBind(this.peopleHubVM, "peopleLength", this._updatePeopleDimensions);                        
            this._updatePeopleDimensions();
        },

        _initFavoritesVM: function () {
            this.hubFavoritesVM = new Skype.ViewModel.HubFavoritesVM(PEOPLE_LINK_LIMIT);
            this.regBind(this.hubFavoritesVM.favorites, "length", this._handleFavoritesChanged.bind(this));

            WinJS.Binding.processAll(this.favoritesItemsContainer.parentNode, this.hubFavoritesVM);
            this.regBind(this.hubFavoritesVM, "allPeopleInFavorites", this._changePeopleVisibility.bind(this));
            
            this._updateFavoritesDimensions();
        },

        _changePeopleVisibility: function (args) {
            var element = this.peopleItemsContainer.parentNode;
            if (args) {
                WinJS.Utilities.addClass(element,"NOPEOPLE");
            } else {
                WinJS.Utilities.removeClass(element,"NOPEOPLE");
            }
        },

        _handleFavoritesChanged: function () {
            this._throttleResize();
        },

        _throttleResize: function () {
            this.throttle(FAVORITES_THROTTLE_IN_MS, this._updateFavoritesDimensions);
        },

        _preventListviewAction: function (evt) {
            var scrollTarget = document.querySelector(".page .kb-scrollTarget");
            if (evt.keyCode === WinJS.Utilities.Key.pageUp || evt.keyCode === WinJS.Utilities.Key.pageDown) {
                document.body.focus();
                evt.preventDefault();
                evt.stopPropagation();
                if (evt.keyCode === WinJS.Utilities.Key.pageUp) {
                    scrollTarget.scrollLeft = 0;
                }
                if (evt.keyCode === WinJS.Utilities.Key.pageDown) {
                    scrollTarget.scrollLeft = scrollTarget.scrollWidth;
                }
            }
        },

        _updateRecentsDimensions: function (evt) {
            var listEl = this.recents.element,
                convLen = this.recentsVM && this.recentsVM.conversations ? this.recentsVM.conversations.length : 0,
                newWidth;

            if (!Skype.Application.state.view.isVertical) {
                evt && this.regTimeout(this._updateRecentsDimensions, 1000);
                newWidth = convLen > this.recentsVM.itemsInColumn ? RECENT_ITEM_WIDTH * 2 : (convLen > 0 ? RECENT_ITEM_WIDTH : LARGE_ITEM_HEIGHT);
                if (listEl && newWidth !== parseInt(listEl.offsetWidth)) {
                    listEl.style.width = newWidth + PX;
                }
            } else {
                listEl.style.width = "100%";
            }
        },

        _updateFavoritesDimensions: function () {
            this.setFavoritesItemSize();
            if (Skype.Application.state.view.isVertical) {
                this.favorites.element.style.width = "";
            } else {
                var width = this.useDenseFavouritesLayout ? STANDARD_ITEM_HEIGHT : LARGE_ITEM_HEIGHT;
                var newWidth = Math.ceil(this.hubFavoritesVM.favorites.length / this.favoriteItemsInColumn) * width;
                if (newWidth !== parseInt(this.favorites.element.offsetWidth)) {
                    this.favorites.element.style.width = newWidth + PX;
                }
            }
            this.favorites.recalculateItemPosition();
            this._updateContainersHeights();
        },

        _updatePeopleDimensions: function (evt) {
            if (!Skype.Application.state.view.isVertical) {
                if (evt) {
                    
                    this.regTimeout(this._updatePeopleDimensions, 1000);
                } else {
                    this._updatePeopleListWidth(this.peopleHubVM.peopleLength, STANDARD_ITEM_HEIGHT, this.peopleItemsInColumn);
                }
            } else {
                this.people.element.style.width = "";
            }
        },

        _updatePeopleListWidth: function (listLen, itemWidth, itemsInColumn) {
            var listEl = this.people.element,
                newWidth = Math.ceil(listLen / itemsInColumn) * itemWidth,
                isPeopleInSuggestionsModeAndOverLimit;
            if (newWidth !== parseInt(listEl.offsetWidth)) {
                isPeopleInSuggestionsModeAndOverLimit = !this.peopleHubVM.showContactList && listLen > itemsInColumn * 2;
                if (!isPeopleInSuggestionsModeAndOverLimit) { 
                    listEl.style.width = newWidth + PX;
                }
            }
        },

        showAd: function () {
            var displayAdController = this.displayAdController;
            if (displayAdController) {
                
                displayAdController.resume();
                WinJS.Utilities.addClass(this.surfaceEl, AD_CONTAINER_VISIBLE);
            } else {
                if (Skype.Ads) {
                    displayAdController = this.displayAdController = new Skype.Ads.DisplayAdController({
                        el: this.adContainerEl
                    });
                    this.regEventListener(displayAdController, AD_CONTAINER_REMOVED, this.onAdContainerChange);
                    this.regEventListener(displayAdController, AD_CONTAINER_ADDED, this.onAdContainerChange);
                    displayAdController.createAds();
                    WinJS.Utilities.addClass(this.surfaceEl, AD_CONTAINER_VISIBLE);
                }
            }
        },

        hideAd: function () {
            this.displayAdController && this.displayAdController.suspend();
            WinJS.Utilities.removeClass(this.surfaceEl, AD_CONTAINER_VISIBLE);
        },

        showLCM: function () {
            WinJS.Utilities.addClass(this.surfaceEl, "LCMVISIBLE");
        },
        hideLCM: function () {
            WinJS.Utilities.removeClass(this.surfaceEl, "LCMVISIBLE");
        },

        _navigateToConversation: function (evt) {
            evt.detail.itemPromise.then(function (item) {
                var eventId = item.data.item ? Skype.Statistics.event.hub_openRecentConversation : Skype.Statistics.event.hub_openContact;
                Skype.Statistics.sendStats(eventId);
                var identity = item.data.item && item.data.item.identity || item.data.identity;
                Actions.invoke("focusConversation", identity);
            });
        }
    });
    

    
    window.traceClassMethods && window.traceClassMethods(page, page.__className, ["initVMs", "_initRecentsVM", "_initPeopleVM"]);

}());

(function contactAriaLabelBinding() {
    "use strict";

    function handlePropertyChange(o, c, evt) {
        var propertyName = evt.detail;
        switch (propertyName) {
            case "favoriteOrder":
            case "name":
            case "isAvailable":
                o.label = makeLabel(c);
                break;
        }
    };
    function makeLabel(conversation) {
        if (conversation.favoriteOrder > 0) {
            return (conversation.isAvailable ? "aria_hub_favorite_available".translate(conversation.name) : "aria_hub_favorite".translate(conversation.name));
        } else {
            return (conversation.isAvailable ? "aria_hub_people_available".translate(conversation.name) : "aria_hub_people".translate(conversation.name));
        }
    }

    var sourcePropertyArray = ["label"];

    function contactAriaLabel(source, sourceProperty, dest, destProperties, value) {       
        if (!source) {
            return null;
        }

        
        var o = WinJS.Binding.as({
            label: makeLabel(source)
        });

        var handler = handlePropertyChange.bind(null, o, source);
        source.addEventListener("propertychanged", handler);

        
        var binding = WinJS.Binding.setAttribute(o, sourcePropertyArray, dest.parentNode, destProperties);

        
        var cancel = binding.cancel;
        binding.cancel = function () {
            source.removeEventListener("propertychanged", handler);
            cancel.call(binding);
        };

        return binding;
    }


    WinJS.Namespace.define("Skype.UI.Hub", {
        contactAriaLabel: WinJS.Binding.initializer(contactAriaLabel)
    });
})();