

(function () {
    "use strict";

    var app = WinJS.Application,
        allHistoryState;

    var allHistoryVm = MvvmJS.Class.define(function () {
        app.sessionState.allHistory = app.sessionState.allHistory || {}; 
                                                                         
        allHistoryState = app.sessionState.allHistory;
    }, {
        unreadConversations: {
            value: null,
            writable: true,
            skipDispose: true
        },
        unreadConversationsCount: 0,

        run: function () {
            this.switchToDefault = this.switchToDefault.bind(this); 
            this.switchToUnread = this.switchToUnread.bind(this);

            switch (this.activeView) {
                case Skype.ViewModel.AllHistoryVM.Views.default:
                    this.switchToDefault(true);
                    break;
                case Skype.ViewModel.AllHistoryVM.Views.unread:
                    this.switchToUnread(true);
                    break;
            }

            this.unreadConversations = Skype.Model.RecentConversationsRepository.instance.unreadConversations;

            this.regBind(this.unreadConversations, "length", this._updateUnreadCount.bind(this));
            this._generateTabAriaLabels();
        },

        switchToUnread: function (isForced) {
            if (this.activeView === Skype.ViewModel.AllHistoryVM.Views.unread && !isForced) {
                return;
            }

            this.items = null; 
            this.items = Skype.Model.RecentConversationsRepository.instance.unreadConversations;
            this.activeView = Skype.ViewModel.AllHistoryVM.Views.unread;
        },

        switchToDefault: function (isForced) {
            if (this.activeView === Skype.ViewModel.AllHistoryVM.Views.default && !isForced) {
                return;
            }

            this.items = null; 
            this.items = Skype.Model.RecentConversationsRepository.instance.conversations;
            this.activeView = Skype.ViewModel.AllHistoryVM.Views.default;
        },

        _updateUnreadCount: function (value) {
            this.hasUnread = value !== 0;
            this.formattedUnreadCount = value !== 0 ? value : "";
            this._generateTabUnreadAriaLabel();
        },

        _generateTabUnreadAriaLabel: function () {
            this.formattedAriaUnreadCount = (this.activeView === Skype.ViewModel.AllHistoryVM.Views.unread) ? "aria_recent_unread_tab_selected".translate(this.formattedUnreadCount) : "aria_recent_unread_tab_unselected".translate(this.formattedUnreadCount);
        },

        _generateTabAriaLabels: function () {
            this.ariaFilterAll = (this.activeView === Skype.ViewModel.AllHistoryVM.Views.default) ? "aria_recent_recent_tab_selected".translate() : "aria_recent_recent_tab_unselected".translate();
            this._generateTabUnreadAriaLabel();
        },

        _onDispose: function () {

        }

    }, {
        items: {
            value: null,
            writable: true,
            skipDispose: true
        },
        formattedUnreadCount: "",
        formattedAriaUnreadCount: "",
        ariaFilterAll: "",
        hasUnread: false,
        activeView: {
            get: function () {
                return typeof allHistoryState.activeView !== 'undefined' ? allHistoryState.activeView : Skype.ViewModel.AllHistoryVM.Views.default;
            },
            set: function (value) {
                allHistoryState.activeView = value;
                this._generateTabAriaLabels();
            }
        }
    }, {
        Views: {
            "default": "DEFAULTVIEW",
            unread: "UNREADVIEW"
        }
    });

    WinJS.Namespace.define("Skype.ViewModel", {
        AllHistoryVM: WinJS.Class.mix(allHistoryVm, Skype.Class.disposableMixin)
    });

}());

