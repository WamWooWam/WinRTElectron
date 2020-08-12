

(function () {
    "use strict";

    var contactsCommandsSet = WinJS.Class.derive(Skype.UI.AppBar.CommandsSet, function () {
        Skype.UI.AppBar.CommandsSet.prototype.constructor.call(this);
    }, {
        registerCommandsAndViews: function () {
            this.commands = [
                {
                    id: 'addContact',
                    label: 'appbar_add_contact'.translate(),
                    icon: '\uE201',
                    section: 'global',
                    onclick: this._handleAddContact.bind(this),
                    hidden: true
                },
                {
                    id: 'saveNumber',
                    label: 'appbar_save_number'.translate(),
                    icon: '\uE118',
                    section: 'global',
                    onclick: this._handleSaveNumber.bind(this),
                    hidden: true
                }
            ];

            this._views.hub = true;
            this._views.contacts = true;
            this._views.allHistory = true;
            this._views.addPeople = true;
        },

        _showCommands: function () {
            this._bar.showHideCommands(['addContact', 'saveNumber'], []);
        },

        hided: function () {
            Skype.UI.AppBar.CommandsSet.prototype.hided.call(this);
        },

        _handleAddContact: function () {
            this._bar.hide();

            Skype.UI.navigate("search", { reset: true, directory: true, mode: "addContact" });
        },

        _handleSaveNumber: function (evt) {
            Skype.UI.Dialogs.showAddPstnContactDialog(evt.currentTarget).then(function (value) {
                if (value.result) {
                    var identity = Skype.Lib.savePSTNContact(value.number, value.prefix, value.phoneType, value.contactName);
                    if (identity) {
                        this._bar.hide();
                        Actions.invoke("focusConversation", identity);
                    }
                }
            }.bind(this));
        }
    });

    WinJS.Namespace.define("Skype.UI.AppBar", {
        ContactsCommandsSet: contactsCommandsSet
    });

    Skype.UI.AppBar.registerCommandSet(new Skype.UI.AppBar.ContactsCommandsSet());
})();