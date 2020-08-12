

(function () {
    "use strict";

    var conversationParticipantManager = MvvmJS.Class.define(
        function conversationParticipantManager_constructor(conversationWrapper, conversationSharedState) {
            this._conversation = conversationWrapper.libConversation;
            this._conversationWrapper = conversationWrapper;
            this._conversationSharedState = conversationSharedState;
            this._activeSpeakerManager = conversationSharedState.isDialog ? null : new Skype.Conversation.ActiveSpeakerManager(3);
            this._participants = [];
            this._liveParticipants = [];
        }, {

            _conversation: null,
            _conversationWrapper: null,
            _participants: null,
            _liveParticipants: null,
            _activeSpeakerManager: null,
            isAlive: false,

            _handleParticipantListChange: function () {
                var i, newParticipantsIDs = [], participantsIDs = [], participantId;

                for (i = 0; i < this._conversation.participants.length; i++) {
                    newParticipantsIDs.push(this._conversation.participants[i].getObjectID());
                }
                for (i = 0; i < this._participants.length; i++) {
                    participantsIDs.push(this._participants[i].getId());
                }
                log("ConversationParticipantManager _handleParticipantListChange - " + newParticipantsIDs);

                
                for (i = 0; i < this._participants.length; i++) {
                    if (!newParticipantsIDs.contains(this._participants[i].getId())) {
                        this._removeParticipant(this._participants[i]);
                        this._participants.removeAt(i);
                        i--;
                    }
                }
                
                for (i = 0; i < this._conversation.participants.length; i++) {
                    participantId = this._conversation.participants[i].getObjectID();
                    if (!participantsIDs.contains(participantId)) {
                        this._addParticipant(participantId);
                    }
                }

                this.dispatchEvent(conversationParticipantManager.Events.ParticipantListChanged);
            },

            _addParticipant: function (participantId) {
                var participant = new Skype.UI.ConversationParticipant(participantId, this._conversationWrapper, this._conversationSharedState);
                this._participants.push(participant);

                this.forwardEvent(participant, Skype.UI.ConversationParticipant.Events.ParticipantStreamAddedRemoved, this._onParticipantStreamAddedRemoved.bind(this));
                this.forwardEvent(participant, Skype.UI.ConversationParticipant.Events.VideoStarted);
                this.forwardEvent(participant, Skype.UI.ConversationParticipant.Events.VideoStartRequested);
                this.forwardEvent(participant, Skype.UI.ConversationParticipant.Events.VideoScreenShareStarted);
                this.forwardEvent(participant, Skype.UI.ConversationParticipant.Events.StatusChanged, this._onParticipantStatusChanged.bind(this));

                participant.alive();
            },

            _removeParticipant: function (participant) {
                this._activeSpeakerManager && this._activeSpeakerManager.removeParticipant(participant);
                this._addOrRemoveLiveParticipant(participant,true); 
                participant.onRemove();
                this.unregObjectEventListeners(participant); 
            },

            _onParticipantStreamAddedRemoved: function (event) {
                

                var participant = event.detail.participant,
                    added = event.detail.added;

                if (added) {
                    this._activeSpeakerManager && this._activeSpeakerManager.addParticipant(participant);
                } else {
                    this._activeSpeakerManager && this._activeSpeakerManager.removeParticipant(participant);
                }
            },

            _onParticipantStatusChanged: function(event) {
                var participant = event.detail.participant;
                this._addOrRemoveLiveParticipant(participant);
            },
            

            _addOrRemoveLiveParticipant: function (participant, forceRemove) {
                var isInLiveParticipants = this._liveParticipants.contains(participant),
                    shouldBeAdded = participant.isLive && !isInLiveParticipants,
                    shouldBeRemoved = (!participant.isLive || !!forceRemove) && isInLiveParticipants;

                if (shouldBeAdded) {
                    this._liveParticipants.push(participant);
                } else if (shouldBeRemoved) {
                    this._liveParticipants.removeObject(participant);
                }

                if (shouldBeAdded || shouldBeRemoved) {
                    this.dispatchEvent(conversationParticipantManager.Events.NumberOfLiveParticipantChanged, { numberOfLiveParticipant: this._liveParticipants.length });
                    roboSky.write("ConversationLive,participantList,changed");
                }
            },

            
            alive: function () {
                log("ConversationParticipantManager: alive()");
                this.isAlive = true;
                this.regEventListener(this._conversation, "participantlistchange", this._handleParticipantListChange.bind(this));
                this._handleParticipantListChange();
                this._activeSpeakerManager && this.forwardEvent(this._activeSpeakerManager, Skype.Conversation.ActiveSpeakerManager.Events.Update); 
            },

            handleLeaveActiveCall: function () {
                if (this.isAlive) {
                    this._participants.forEach(this._removeParticipant.bind(this));
                    this._participants.clear();
                    this._liveParticipants.clear();
                    this.cleanupEventListeners();
                    this.isAlive = false;
                }
            },

            getParticipants: function () {
                return this._participants;
            },

            getLiveParticipants: function () {
                return this._liveParticipants;
            },
        }, {

        }, {
            Events: {
                ParticipantListChanged: "ParticipantListChanged",
                NumberOfLiveParticipantChanged: "NumberOfLiveParticipantChanged"
            },
        });

    WinJS.Namespace.define("Skype.UI", {
        ConversationParticipantManager: WinJS.Class.mix(conversationParticipantManager, Skype.Class.disposableMixin, WinJS.Utilities.eventMixin)
    });

}());