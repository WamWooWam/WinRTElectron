

(function () {
    "use strict";

    var app = WinJS.Application,
        allPeopleState;

    Skype.UI.Page.define("/pages/contacts.html", "div.fragment.contacts", {
        useOneInstance: true,
        _scrollPositions: null,
        _snapHeaderMenu: null,

        inFirstRender: false,
        scrollRestoreDone: false,

        scrollLeft: {
            get: function () {
                return typeof allPeopleState.scrollLeft !== 'undefined' ? allPeopleState.scrollLeft : 0;
            },
            set: function (value) {
                allPeopleState.scrollLeft = value;
            }
        },

        scrollTop: { 
            get: function () {
                return typeof allPeopleState.scrollTop !== 'undefined' ? allPeopleState.scrollTop : 0;
            },
            set: function (value) {
                allPeopleState.scrollTop = value;
            }
        },

        onReady: function () {
            this.inFirstRender = true; 
            this._scrollPositions = this._scrollPositions || {};

            app.sessionState.allPeople = app.sessionState.allPeople || {}; 
            allPeopleState = app.sessionState.allPeople;

            this.onReadyLazyPart = this.onReadyLazyPart.bind(this);
            this.onTitleClick = this.onTitleClick.bind(this);
            this.onContactListContentAnimating = this.onContactListContentAnimating.bind(this);
            this.restoreScrollState = this.restoreScrollState.bind(this);
            this._resetToDefaultView = this._resetToDefaultView.bind(this);
        },

        onShow: function () {
            if (this.inFirstRender) {
                this.regEventListener(this.element.querySelector("button.backbutton"), "click", Skype.UI.navigateBack);
                this.regEventListener(this.element.querySelector("button.addContactButoon"), "click", this._onAddContactClick);

                this.regImmediate(this.onReadyLazyPart);
                this.inFirstRender = false;
            } else {
                
                
                
                this.regImmediate(function () {
                    this._resetToDefaultView();
                    this.peopleList.contactList.recalculateItemPosition();
                }.bind(this));
                this.sendStats();
            }
        },

        onReadyLazyPart: function () {
            
            this.peopleList = this.element.querySelector("div.contactList").winControl;
            this.titleFilterAllEl = this.element.querySelector('button.title.link.filterAll');
            this.titleFilterOnlineEl = this.element.querySelector('button.title.link.filterOnline');
            this.titleFilterGroupsEl = this.element.querySelector('button.title.link.filterGroups');

            this.vm = new Skype.ViewModel.AllPeopleVM();
            this.vm.run();

            this.regBind(Skype.Application.state.view, "orientation", this._updateAriaHasPopup.bind(this));
            this.regBind(this.vm, "activeView", this.onActiveViewChanged.bind(this));

            this.peopleList.initPromise

                .then(function () {
                    WinJS.Binding.processAll(this.element, this.vm);
                }.bind(this))

                .then(function () {
                    this.contactsListViewportEl = this.peopleList.element.querySelector('div.contacts.list div.win-viewport');
                    this.regEventListener(this.contactsListViewportEl, 'scroll', this.onContactsScroll.bind(this));

                    this.regEventListener(this.peopleList.contactList, "iteminvoked", this.onItemClicked.bind(this));
                    this.regEventListener(this.peopleList.contactList, 'contentanimating', this.onContactListContentAnimating);
                    this.regEventListener(this.element, "mousewheel", this.onMouseWheel.bind(this));

                    this.regEventListener(this.titleFilterAllEl, 'click', this.onTitleClick);
                    this.regEventListener(this.titleFilterOnlineEl, 'click', this.onTitleClick);
                    this.regEventListener(this.titleFilterGroupsEl, 'click', this.onTitleClick);

                    this._resetToDefaultView();
                }.bind(this));

            Skype.UI.Util.preventTextLinks(this.element);
        },

        _resetToDefaultView: function () {
            if (this.vm.activeView === Skype.ViewModel.AllPeopleVM.Views.groups && this.vm.groups.contacts.length === 0) { 
                this.vm.switchToDefault();
            }
        },

        onTitleClick: function (evt) {
            if (!Skype.Application.state.view.isVertical) {
                switch (evt.currentTarget) {
                    case this.titleFilterAllEl:
                        this._handleViewChange("Default");
                        break;
                    case this.titleFilterOnlineEl:
                        this._handleViewChange("Online");
                        break;
                    case this.titleFilterGroupsEl:
                        this._handleViewChange("Groups");
                        break;
                }
            } else { 
                var menuCommands = [{ 
                    id: 'all',
                    type: 'toggle',
                    selected: this.vm.activeView === Skype.ViewModel.AllPeopleVM.Views.default,
                    label: 'allpeople_filtertitle_all'.translate(),
                    onclick: this.vm.switchToDefault
                }, {
                    id: 'online',
                    type: 'toggle',
                    selected: this.vm.activeView === Skype.ViewModel.AllPeopleVM.Views.online,
                    disabled: !this.vm.online.contacts.length,
                    label: 'allpeople_filtertitle_available_menu'.translate(this.vm.online.formattedLength || 0),
                    onclick: this.vm.switchToOnline
                }];
                this.vm.groups.contacts.length && menuCommands.push({
                    id: 'groups',
                    type: 'toggle',
                    selected: this.vm.activeView === Skype.ViewModel.AllPeopleVM.Views.groups,
                    
                    label: 'allpeople_filtertitle_groups'.translate(),
                    onclick: this.vm.switchToGroups
                });
                this._snapHeaderMenu = this._snapHeaderMenu || Skype.UI.Menu.create();

                if (this._snapHeaderMenu.hidden) {
                    this._snapHeaderMenu.commands = menuCommands;
                    this._snapHeaderMenu.show(evt.currentTarget, "bottom", Skype.Globalization.isRightToLeft() ? "right" : "left");
                }
            }
        },
        
        _onAddContactClick: function () {
            Skype.UI.navigate("search", { directory: true, reset: true });
        },

        _updateAriaHasPopup: function () {
            this.titleFilterAllEl.setAttribute("aria-haspopup", Skype.Application.state.view.isVertical ? "true" : "false");
            this.titleFilterOnlineEl.setAttribute("aria-haspopup", (Skype.Application.state.view.isVertical ? "true" : "false"));
            this.titleFilterGroupsEl.setAttribute("aria-haspopup", (Skype.Application.state.view.isVertical ? "true" : "false"));
        },

        _handleViewChange: function (view) {
            this._scrollPositions[this.vm.activeView] = this.peopleList.contactList.scrollPosition;

            var methodName = "switchTo" + view;
            this.vm[methodName]();

            
            var that = this;

            var control = this.peopleList.contactList;
            var handler = function () {
                if (control.loadingState === "viewPortLoaded") {
                    var position = that._scrollPositions[that.vm.activeView] || 0;
                    control.scrollPosition = position;
                    that.unregEventListener(control, "loadingstatechanged", handler);
                }
            };

            this.regEventListener(control, "loadingstatechanged", handler);
        },

        onActiveViewChanged: function () {
            if (Skype.Application.state.view.isVertical) {
                if (this.vm.activeView === Skype.ViewModel.AllPeopleVM.Views.default) {
                    if ((document.activeElement == this.titleFilterOnlineEl) || (document.activeElement == this.titleFilterGroupsEl)) {
                        this.regImmediate(function () {
                            this.titleFilterAllEl.focus();
                        }.bind(this));
                    }
                }
                if (this.vm.activeView === Skype.ViewModel.AllPeopleVM.Views.online) {
                    if ((document.activeElement == this.titleFilterGroupsEl) || (document.activeElement == this.titleFilterAllEl)) {
                        this.regImmediate(function () {
                            this.titleFilterOnlineEl.focus();
                        }.bind(this));
                    }
                }
                if (this.vm.activeView === Skype.ViewModel.AllPeopleVM.Views.groups) {
                    if ((document.activeElement == this.titleFilterOnlineEl) || (document.activeElement == this.titleFilterAllEl)) {
                        this.regImmediate(function () {
                            this.titleFilterGroupsEl.focus();
                        }.bind(this));
                    }
                }
            }
            this.sendStats();
        },

        
        onMouseWheel: function (evt) {
            
            var direction = this.peopleList.contactList.layout.orientation == "horizontal" ? "scrollLeft" : "scrollTop";
            this.contactsListViewportEl[direction] -= evt.wheelDelta;
        },

        onItemClicked: function (e) {
            e.preventDefault();

            var index = e.detail.itemIndex;

            e.detail.itemPromise.then(function (item) {
                if (index >= 0 && item.data.isContact) {
                    Actions.invoke("focusConversation", item.data.identity);
                }
            });
        },

        onContactsScroll: function (evt) {
            this.scrollLeft = evt.target.scrollLeft;
            this.scrollTop = evt.target.scrollTop;
        },

        onContactListContentAnimating: function (evt) {
            !this.scrollRestoreDone && this.restoreScrollState();
        },

        restoreScrollState: function () {
            this.contactsListViewportEl.scrollLeft = this.scrollLeft;
            this.contactsListViewportEl.scrollTop = this.scrollTop; 
            this.scrollRestoreDone = true;
        },

        sendStats: function () {
            if (this.vm) {
                switch (this.vm.activeView) {
                    case Skype.ViewModel.AllPeopleVM.Views.default:
                        Skype.Statistics.sendStats(Skype.Statistics.event.contacts_allViewed);
                        break;
                    case Skype.ViewModel.AllPeopleVM.Views.online:
                        Skype.Statistics.sendStats(Skype.Statistics.event.contacts_onlineViewed);
                        break;
                }
            }
        }

    });
})();