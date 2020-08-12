

(function () {
    "use strict";

    var participantListCommandsSet = WinJS.Class.derive(Skype.UI.AppBar.CommandsSet, function () {
        Skype.UI.AppBar.CommandsSet.prototype.constructor.call(this);
    }, {
        _selectedParticipants: null,
        _conversationIdentity: null,

        registerCommandsAndViews: function () {
            this.commands = [
                {
                    id: 'add',
                    label: 'appbar_add_participants'.translate(),
                    icon: '\uE415',
                    section: 'global',
                    onclick: this._handleAddClick.bind(this),
                    hidden: true
                },
                {
                    id: 'remove',
                    label: 'appbar_remove_participant'.translate(),
                    icon: '\uE414',
                    section: 'selection',
                    onclick: this._handleRemoveClick.bind(this),
                    hidden: true
                }
            ];

            this._views.participantList = true;
        },

        _updateContext: function (context) {
            this._selectedParticipants = context && context.selectedParticipants || null;
            this._conversationIdentity = context && context.conversationIdentity || null;

            if (this._bar && this._selectedParticipants) {
                this._showCommands(); 
                var participantSelected = !!(this._bar && this._selectedParticipants && this._selectedParticipants.length);
                this.setSticky(participantSelected);
                participantSelected ? this._bar.show() : this._bar.hide();
            }
        },

        _showCommands: function () {
            if (this._conversationIdentity) {
                if (Actions.isActionApplicable("addParticipants", this._conversationIdentity)) {
                    this._bar.showHideCommands(['add']);
                }

                this._bar.showHideCommands([], ['remove']);
                if (this._selectedParticipants && this._selectedParticipants.length > 0 && Actions.isActionApplicable("removeParticipants", this._conversationIdentity, { participants: this._selectedParticipants })) {
                    this._bar.showHideCommands(['remove']);
                    roboSky.write("AppBar,participantListPage,removeButton,show");
                }
            } else {
                this._bar.showHideCommands([], ['add', 'remove']);
            }
        },

        _handleAddClick: function (e) {
            this._bar.hide();
            Actions.invoke("addParticipants", this._conversationIdentity);
        },

        _handleRemoveClick: function (e) {
            Skype.UI.Dialogs.showConfirmDialogAsync(e.currentTarget,
                'appbar_remove_participant_confirm'.translate(),
                'appbar_remove_participant_confirm_yes'.translate(), 'noheading').then(function (result) {
                    if (result) {
                        Actions.invoke("removeParticipants", this._conversationIdentity, { participants: this._selectedParticipants });
                        this._bar.hide();
                    }
                }.bind(this));
        }
    });

    WinJS.Namespace.define("Skype.UI.AppBar", {
        ParticipantListCommandsSet: participantListCommandsSet
    });

    Skype.UI.AppBar.registerCommandSet(new Skype.UI.AppBar.ParticipantListCommandsSet());
})();
