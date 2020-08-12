

(function () {
    "use strict";

    var HANGUP_STATUSES = [Skype.UI.ConversationParticipant.CallStatus.Live,
                           Skype.UI.ConversationParticipant.CallStatus.Connecting,
                           Skype.UI.ConversationParticipant.CallStatus.OnHold];

    var conversationParticipantListVM = MvvmJS.Class.define(function (participantListProvider, conversationSharedState) {
        this._participantListProvider = participantListProvider;
        this.sharedState = conversationSharedState;
        this.liveParticipants = new WinJS.Binding.List();
        this.nonLiveParticipants = new WinJS.Binding.List();

        this._updateRole = this._updateRole.bind(this);

        this._menuCommands = [{
            id: "ring",
            type: "button",
            hidden: true,
            isApplicable: function (participant) {
                var action = Actions.getAction("ringParticipants");
                return this._isHost && action.isApplicable(this._conversation, { participants: [participant.identity] });
            }.bind(this),
            label: "liveconversation_participant_list_call_again".translate(),
            _onclick: this._menuItemClicked.bind(this, "ringParticipants"),
            onclick: null
        }, {
            id: "hangupParticipants",
            type: "button",
            hidden: true,
            isApplicable: function (participant) {
                var action = Actions.getAction("hangupParticipants");
                return this._isHost && action.isApplicable(this._conversation, { participants: [participant.identity] }) &&
                    HANGUP_STATUSES.contains(participant.status);
            }.bind(this),
            label: "liveconversation_participant_list_hang_up".translate(),
            _onclick: this._menuItemClicked.bind(this, "hangupParticipants"),
            onclick: null  
        }, {
            id: "removeParticipants",
            type: "button",
            hidden: true,
            isApplicable: function (participant) {
                var action = Actions.getAction("removeParticipants");
                return this._canKick && action.isApplicable(this._conversation, { participants: [participant.identity] });
            }.bind(this),
            label: "liveconversation_participant_list_drop_from_conversation".translate(),
            _onclick: this._menuItemClicked.bind(this, "removeParticipants"),
            onclick: null
        }];

        this.participantMenu = Skype.UI.Menu.create();
        this.participantMenu.setAttribute("aria-label", "aria_liveconversation_participant_list_options_menu".translate());
    }, {
        sharedState: null,
        _participantListProvider: null,
        _conversation: null,

        liveParticipants: null,
        nonLiveParticipants: null,

        
        _isHost: false,
        _canKick: false,

        
        _menuCommands: null,
        participantMenu: null,
        participantsNotInCall: null,
        participantsInCall: null,

        
        _sortAlphabetically: function (first, second) {
            return first.name.localeCompare(second.name);
        },

        _wrap: function (participant) {
            var participantStatus;

            
            switch (participant.status) {
                case Skype.UI.ConversationParticipant.CallStatus.OnHold:
                    participantStatus = "liveconversation_participant_list_state_on_hold".translate();
                    break;
                case Skype.UI.ConversationParticipant.CallStatus.Connecting:
                    participantStatus = "liveconversation_participant_list_state_connecting".translate();
                    break;
                default:
                    participantStatus = "";
                    break;
            }

            var menuAvailable = this._menuAvailable(participant);

            return WinJS.Binding.as({
                participant: participant,
                participantStatus: participantStatus,
                hasMenu: menuAvailable,
                menuLabel: menuAvailable ? "aria_liveconversation_participant_list_options".translate() : "",
                showParticipantMenu: this.showParticipantMenu.bind(this, participant),
                keyPress: this.keyPress.bind(this, participant)
            });
        },

        _updateParticipants: function () {
            if (!this._isVisible) {
                return;
            }
            this.dispatchEvent(Skype.ViewModel.ConversationParticipantListVM.Events.TabConstrainerElementChange, true);
            this.liveParticipants.dataSource.beginEdits();
            this.nonLiveParticipants.dataSource.beginEdits();

            this.liveParticipants.splice(0, this.liveParticipants.length); 
            this.nonLiveParticipants.splice(0, this.nonLiveParticipants.length);
            var participants = this._participantListProvider.getParticipants(), list;
            participants.sort(this._sortAlphabetically);
            for (var i = 0; i < participants.length; i++) {
                list = participants[i].isLive ? this.liveParticipants : this.nonLiveParticipants;
                list.push(this._wrap(participants[i]));
            }

            this.liveParticipants.dataSource.endEdits();
            this.nonLiveParticipants.dataSource.endEdits();

            this.liveParticipantsHeader = this.liveParticipants.length ? "liveconversation_participant_list_number_of_participants_in_call".translate(this.liveParticipants.length) : "";
            this.nonLiveParticipantsHeader = this.nonLiveParticipants.length ? "liveconversation_participant_list_number_of_participants_in_other".translate(this.nonLiveParticipants.length) : "";
            this.participantCount = Skype.Globalization.formatNumericID("liveconversation_participant_list_participants_count", participants.length).translate(participants.length);
            this.dispatchEvent(Skype.ViewModel.ConversationParticipantListVM.Events.TabConstrainerElementChange, false);
        },

        _updateRole: function () {
            var caps = this._conversation.getCapabilities();
            this._canKick = caps.get(LibWrap.Conversation.capability_CAN_KICK);
            this._isHost = this._conversation.getStrProperty(LibWrap.PROPKEY.conversation_LIVE_HOST) === lib.myIdentity;
        },

        _updateMenuAvailibility: function (participant) {
            this._menuCommands.forEach(function (m) {
                m.hidden = !m.isApplicable(participant);
                m.onclick = m._onclick;
            }.bind(this));
        },

        _menuAvailable: function (participant) {
            return this._menuCommands.first(function (m) {
                return m.isApplicable(participant);
            }.bind(this)) != null;
        },

        _menuItemClicked: function (action) {
            Actions.invoke(action, this.sharedState.identity, { participants: [this._selectedParticipant] });
            this._sendStatistics(action);
        },

        _sendStatistics: function (eventName) {
            var name = this.sharedState.isVideoCall ? "call_video_" : "call_audio_";
            name += eventName;
            if (Skype.Statistics.event[name]) {
                Skype.Statistics.sendStats(Skype.Statistics.event[name], this.liveParticipants.length);
            }
        },

        _onDispose: function () {
			 this._conversation.discard();
        },

        

        alive: function () {
            this._conversation = lib.getConversationByIdentity(this.sharedState.identity);
            this.regEventListener(this._conversation, "capabilitieschanged", this._updateRole);
            this._updateRole();

            this.regEventListener(this._participantListProvider, Skype.UI.ConversationParticipant.Events.StatusChanged, this._updateParticipants.bind(this));
            this.regEventListener(this._participantListProvider, Skype.UI.ConversationParticipantManager.Events.ParticipantListChanged, this._updateParticipants.bind(this));
            this._updateParticipants();
        },

        
        showAddParticipants: function () {
            this.dispatchEvent(conversationParticipantListVM.Events.HideParticipantList);
            Actions.invoke("addParticipants", this.sharedState.identity, { addingFromLive: true });
            this._sendStatistics("addParticipants");
        },

        keyPress: function (participant, evt) {
            if (event.keyCode === WinJS.Utilities.Key.enter || event.keyCode === WinJS.Utilities.Key.space) {
                this.showParticipantMenu(participant, evt);
            }
        },

        showParticipantMenu: function (participant, evt) {
            if (this._menuAvailable(participant)) {
                this._updateMenuAvailibility(participant);

                this._selectedParticipant = participant.identity;

                if (this.participantMenu.hidden) {
                    this.participantMenu.commands = this._menuCommands;
                    this.participantMenu.show(evt.currentTarget, Skype.Globalization.isRightToLeft() ? "left" : "right", "center");
                }
            }
        },

        setVisible: function (isVisible) {
            
            this._isVisible = isVisible;
            if (isVisible) {
                if (this._conversation) {
                    this._updateRole();  
                }
                this._updateParticipants();
            }
        },

        hide: function () {
            this.dispatchEvent(conversationParticipantListVM.Events.HideParticipantList);
        }

    }, { 
        participantCount: "",
        liveParticipantsHeader: "",
        nonLiveParticipantsHeader: "",

    }, {
        Events: {
            HideParticipantList: "HideParticipantList",
            TabConstrainerElementChange: "TabConstrainerElementChange"
        }
    });

    WinJS.Namespace.define("Skype.ViewModel", {
        ConversationParticipantListVM: WinJS.Class.mix(conversationParticipantListVM, Skype.Class.disposableMixin, WinJS.Utilities.eventMixin)
    });

}());
