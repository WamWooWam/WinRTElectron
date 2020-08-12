

(function () {
    "use strict";

    var unreadCommandSet = WinJS.Class.derive(Skype.UI.AppBar.CommandsSet, function () {
        Skype.UI.AppBar.CommandsSet.prototype.constructor.call(this);
    }, {

        registerCommandsAndViews: function () {
            this.commands = [
                {
                    id: 'mark_all_as_read',
                    label: 'mark_all_as_read'.translate(),
                    icon: '\uE412',
                    section: 'global',
                    onclick: this._handleMarkAllRead.bind(this),
                    hidden: true
                }
            ];

            this._views.allHistory = true;
        },

        _showCommands: function () {
            if (Skype.Model.RecentConversationsRepository.instance.hasUnreadConversations()) {
                this._bar.showHideCommands(['mark_all_as_read']);
            } else {
                this._bar.showHideCommands([], ['mark_all_as_read']);
            }
        },

        _handleMarkAllRead: function (e) {
            Skype.UI.Dialogs.showConfirmDialogAsync(e.currentTarget,
                "mark_all_as_read_confirm_title".translate(),
                'mark_all_as_read_confirm_action'.translate()).then(function (result) {
                    if (result) {
                        Skype.Model.RecentConversationsRepository.instance.markAllAsRead();
                        this._bar.hide();
                    }
                }.bind(this));
        },
    });

    WinJS.Namespace.define("Skype.UI.AppBar", {
        UnreadCommandSet: unreadCommandSet
    });

    Skype.UI.AppBar.registerCommandSet(new Skype.UI.AppBar.UnreadCommandSet());
})();