

(function () {
    "use strict";

    var app = WinJS.Application,
        allPeopleState;

    var allPeopleVM = MvvmJS.Class.define(function () {
        app.sessionState.allPeople = app.sessionState.allPeople || {}; 
                                                                       
        allPeopleState = app.sessionState.allPeople;
    }, {
        all: {
            value: null,
            writable: true,
            skipDispose: true
        },

        online: {
            value: null,
            writable: true,
            skipDispose: true
        },

        groups: {
            value: null,
            writable: true,
            skipDispose: true
        },

        run: function () {
            this.switchToDefault = this.switchToDefault.bind(this); 
            this.switchToOnline = this.switchToOnline.bind(this);
            this.switchToGroups = this.switchToGroups.bind(this);

            this.all = Skype.Model.ContactsRepository.instance.all;
            this.online = Skype.Model.ContactsRepository.instance.online;
            this.groups = Skype.Model.ContactsRepository.instance.groups;

            switch (this.activeView) {
                case Skype.ViewModel.AllPeopleVM.Views.default:
                    this.switchToDefault(true);
                    break;
                case Skype.ViewModel.AllPeopleVM.Views.online:
                    this.switchToOnline(true);
                    break;
                case Skype.ViewModel.AllPeopleVM.Views.groups:
                    this.switchToGroups(true);
                    break;
            };
            this.regBind(this.online.contacts, "length", this._generateTabOnlineAriaLabel.bind(this));
            this.regBind(this.all.contacts, "length", this.checkItems.bind(this));
            this._generateTabAriaLabels();
        },

        switchToDefault: function (isForced) {
            if (this.activeView === Skype.ViewModel.AllPeopleVM.Views.default && !isForced) {
                return;
            }

            this.items = null; 
            this.items = this.all;
            this.activeView = Skype.ViewModel.AllPeopleVM.Views.default;
        },

        switchToOnline: function (isForced) {
            if (this.activeView === Skype.ViewModel.AllPeopleVM.Views.online && !isForced) {
                return;
            }

            this.items = null; 
            this.items = this.online;
            this.activeView = Skype.ViewModel.AllPeopleVM.Views.online;
        },

        switchToGroups: function (isForced) {
            if (this.activeView === Skype.ViewModel.AllPeopleVM.Views.groups && !isForced) {
                return;
            }

            this.items = null; 
            this.items = this.groups;
            this.activeView = Skype.ViewModel.AllPeopleVM.Views.groups;
        },
        
        checkItems: function() {
			this.hasNoItems = this.all._contactsLength === 0;
        },

        _generateTabOnlineAriaLabel: function () {
            this.ariaFilterOnline = (this.activeView === Skype.ViewModel.AllPeopleVM.Views.online) ? "aria_people_available_tab_selected".translate(this.online.formattedLength) : "aria_people_available_tab_unselected".translate(this.online.formattedLength);
        },

        _generateTabAriaLabels: function () {
            this.ariaFilterAll = (this.activeView === Skype.ViewModel.AllPeopleVM.Views.default) ? "aria_people_all_tab_selected".translate() : "aria_people_all_tab_unselected".translate();
            this._generateTabOnlineAriaLabel();
            this.ariaFilterGroups = (this.activeView === Skype.ViewModel.AllPeopleVM.Views.groups) ? "aria_people_groups_tab_selected".translate() : "aria_people_groups_tab_unselected".translate();
        },

    }, {
        items: {
            value: null,
            writable: true,
            skipDispose: true
        },

        activeView: {
            get: function () {
                return typeof allPeopleState.activeView !== 'undefined' ? allPeopleState.activeView : Skype.ViewModel.AllPeopleVM.Views.default;
            },
            set: function (value) {
                allPeopleState.activeView = value;
                this._generateTabAriaLabels();
            }
        },

        hasNoItems: false,

        ariaFilterAll: "",
        ariaFilterOnline:"",
        ariaFilterGroups: ""
    }, {
        Views: {
            "default": "DEFAULTVIEW",
            groups: "GROUPSVIEW",
            online: "ONLINEVIEW"
        }
    });

    WinJS.Namespace.define("Skype.ViewModel", {
        AllPeopleVM: allPeopleVM
    });


})();