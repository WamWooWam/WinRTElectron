

(function () {
    "use strict";

    WinJS.Namespace.define("Skype.Sounds", {
        SoundTypes: {
            
            Login: "sounds/login.vm",
            Logout: "sounds/logout.vm",
            CallInitiated: "sounds/call_initiated.vm",
            CallRingIn: "sounds/call_ringin.vm",
            CallRingOut: "sounds/call_ringout.vm",
            CallHangUp: "sounds/call_hangup.vm",
            CallKnockIn: "sounds/call_knocking.vm",
            ChatIM: "sounds/im.vm",
        },

        
        WhitelistMessageTypes: [
            LibWrap.Message.type_POSTED_TEXT,
            LibWrap.Message.type_POSTED_CONTACTS,
            LibWrap.Message.type_POSTED_EMOTE,
            LibWrap.Message.type_POSTED_FILES,
            LibWrap.Message.type_POSTED_SMS,
            LibWrap.Message.type_POSTED_VIDEO_MESSAGE]
    });
   

    var soundsManager = MvvmJS.Class.define(function () {
    }, {
        _liveConversationsRepository: null,
        _lastPlayback: {
            sound: null,
            time: 0
        },

        init: function () {
            
            
            

            
            
            this.regEventListener(Skype.Application.LoginHandlerManager.instance,
                Skype.Application.LoginHandlerManager.Events.LOGIN_READONLY, this._handleLogin.bind(this));
            this.regEventListener(Skype.Application.LoginHandlerManager.instance,
                Skype.Application.LoginHandlerManager.Events.LOGOUT, this._handleLogout.bind(this));
            this.regEventListener(lib, "incomingmessage", this._handleIM.bind(this));
            this.regBind(Skype.Application.state.focusedConversation, "identity", this._focusedConversationChanged.bind(this));
        },
        _handleLiveConversationInserted: function (event) {
            var conversation = event.detail.value;
            conversation.soundsRingOut = false;
            this.regBind(conversation, "liveStatus", this._handleConversationLiveStatusChanged.bind(this, conversation));
            this.regBind(conversation, "participants", this._handleConversationParticipantsChanged.bind(this, conversation));
        },

        _handleLiveConversationRemoved: function (event) {
            var conversation = event.detail.value;
            this._stopConversationSounds(conversation);
            this.unregObjectBinds(conversation);
        },

        _focusedConversationChanged: function () {
            var conversation = Skype.Application.state.focusedConversation;
            if (conversation && conversation.identity && Skype.Application.state.focusedConversation.state == Skype.UI.Conversation.State.INCOMMING_CALL) {
                var libConversation = lib.getConversationByIdentity(conversation.identity);
                this._playCallInSound(libConversation);
                libConversation.discard();
            }
        },

        _handleConversationLiveStatusChanged: function (conversation, status) {
            
            this.stop(conversation.id);

            switch (status) {
                case LibWrap.Conversation.local_LIVESTATUS_RECENTLY_LIVE:
                    conversation.soundsRingOut = false;
                    this.play(conversation.id, Skype.Sounds.SoundTypes.CallHangUp);
                    break;
                case LibWrap.Conversation.local_LIVESTATUS_RINGING_FOR_ME:
                    
                    
                    if (Skype.Application.state.focusedConversation.identity === conversation.identity) {
                        this._playCallInSound(conversation.libConversation);
                    }
                    break;
                case LibWrap.Conversation.local_LIVESTATUS_TRANSFERRING:
                    this.play(conversation.id, Skype.Sounds.SoundTypes.CallRingOut, true, true);
                    break;
            }
        },
        
        _playCallInSound: function (libConversation) {
            if (Skype.CallManager.otherConversationIsLive(libConversation)) {
                this.play(libConversation.getObjectID(), Skype.Sounds.SoundTypes.CallKnockIn, true);
            } else {
                this.play(libConversation.getObjectID(), Skype.Sounds.SoundTypes.CallRingIn, true);
            }
        },
        
        _handleConversationParticipantsChanged: function (conversation, newParticipants, oldParticipants) {
            if (oldParticipants) {
                Object.keys(oldParticipants).forEach(function (id) {
                    conversation.unregObjectBinds(oldParticipants[id]);
                }, this);
            }

            if (newParticipants) {
                Object.keys(newParticipants).forEach(function (id) {
                    var participant = newParticipants[id];
                    conversation.regBind(participant, "voiceStatus", this._handleParticipantVoiceStatusChange.bind(this, conversation, participant));
                }, this);
            }

        },

        _hasLiveParticipant: function (conversation) {
            
            var result = false;
            Object.keys(conversation.participants).forEach(function (id) {
                var participant = conversation.participants[id];
                var voiceStatus = participant.libParticipant.getIntProperty(LibWrap.PROPKEY.participant_VOICE_STATUS);
                if ([LibWrap.Participant.voice_STATUS_LISTENING, LibWrap.Participant.voice_STATUS_SPEAKING, LibWrap.Participant.voice_STATUS_VOICE_ON_HOLD].indexOf(voiceStatus) !== -1) {
                    result = true;
                }
            }, this);

            return result;
        },

        _handleParticipantVoiceStatusChange: function (conversation, participant, status) {
            
            
            
            
            
            

            
            if (this._hasLiveParticipant(conversation)) {
                this._stopConversationSounds(conversation);
                return;
            }

            var objectId = participant.id;
            this.stop(objectId);

            switch (status) {
                case LibWrap.Participant.voice_STATUS_VOICE_CONNECTING:
                    this.play(objectId, Skype.Sounds.SoundTypes.CallInitiated);
                    break;
                case LibWrap.Participant.voice_STATUS_RINGING:
                    var convStatus = conversation.libConversation.getIntProperty(LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS);
                    
                    
                    if (convStatus !== LibWrap.Conversation.local_LIVESTATUS_RINGING_FOR_ME && !conversation.soundsRingOut) {
                        conversation.soundsRingOut = true;
                        this.play(objectId, Skype.Sounds.SoundTypes.CallRingOut, true, true);
                    }
                    break;
            }
        },

        _handleIM: function (event) {
            
            
            
            
            
            

            if (!lib.loggedIn || !Skype.Model.Options.play_im_sounds) {
                roboSky.write("Sounds,DontPlay,PlayImSoundsDisabledOrLibLoggedOut");
                return;
            }

            if (Skype.Model.Options.mute_im_sounds_in_current_chat && this._isMessageForFocusedConversation(event.detail[3])) {     
                roboSky.write("Sounds,DontPlay,MutedIMSoundsInCurrentChat");
                return;
            }

            var libMessage = lib.getConversationMessage(event.detail[0]);
            if (libMessage) {
                var authorIsMe = lib.isMe(libMessage.getStrProperty(LibWrap.PROPKEY.message_AUTHOR));
                var hasMessageType = Skype.Sounds.WhitelistMessageTypes.contains(libMessage.getIntProperty(LibWrap.PROPKEY.message_TYPE));
                var isUnconsumedNormalMessage = libMessage.getIntProperty(LibWrap.PROPKEY.message_CONSUMPTION_STATUS) == LibWrap.Message.consumption_STATUS_UNCONSUMED_NORMAL;
                var isNewMessage = libMessage.getIntProperty(LibWrap.PROPKEY.message_TIMESTAMP) > (Skype.Application.state.startedResumedTimestamp / 1000);

                if (!authorIsMe && hasMessageType && isUnconsumedNormalMessage && isNewMessage) {
                    this.play(event.detail[0], Skype.Sounds.SoundTypes.ChatIM);
                    roboSky.write("Sounds,Play");
                } else {
                    roboSky.write("Sounds,DontPlay,NotMeOrNotProperMessageTypeOrConsumedOrNotNew");
                }
                libMessage.discard();
            }
        },
        
        _handleLogin: function (parameters) {
            
            
            
            
            
            

            
            this.regTimeout(function () {
                this.play(0, Skype.Sounds.SoundTypes.Login);
            }.bind(this), 0);
            
            this._liveConversationsRepository = new Skype.Model.LiveConversationsRepository();

            this.regEventListener(this._liveConversationsRepository.conversations, "iteminserted", this._handleLiveConversationInserted.bind(this));
            this.regEventListener(this._liveConversationsRepository.conversations, "itemremoved", this._handleLiveConversationRemoved.bind(this));

        },

        _isMessageForFocusedConversation: function(identity) {
            var libConv = lib.getConversation(identity);
            if (!libConv) {
                return false;
            }

            var result = Skype.Application.state.focusedConversation.identity === libConv.getIdentity();
            libConv.discard();
            return result;
        },
        
        _stopConversationSounds: function (conv) {
            conv.soundsRingOut = false;
            this.stop(conv.id);
            Object.keys(conv.participants).forEach(function (id) {
                this.stop(id);
            }, this);
        },

        _handleLogout: function () {
            this._liveConversationsRepository && this._liveConversationsRepository.conversations.forEach(this._stopConversationSounds.bind(this));
        },

        ///<disable>JS3049.UnresolvedType</disable>
        play: function (id, sound, loop, useCallOutDevice) {
            
            
            
            
            
            
            
            
            
            
            
            
            if (sound === undefined) {
                throw "Undefined sound!";
            }

            
            if (loop === undefined) {
                loop = false;
            }
            if (useCallOutDevice === undefined) {
                useCallOutDevice = true;
            }

            
            var now = Date.now();
            if ((now - this._lastPlayback.time < 1000) && (sound === this._lastPlayback.sound)) {
                log("Skype.Sounds.play: skip already playing [{0}]".format(sound));
                return;
            }
            this._lastPlayback.time = now;
            this._lastPlayback.sound = sound;
            
            log("Skype.Sounds.play: [{0}] [{1}]".format(id, sound));

            var soundFile = new LibWrap.Filename();
            soundFile.setFromString(sound);
            lib.playStartFromFile(id, soundFile, loop, useCallOutDevice);
        },
        stop: function (id) {
            
            
            
            
            
            

            log("Skype.Sounds.stop: [{0}]".format(id));
            lib.playStop(id);
        }
    });

    var instance = null;
    WinJS.Namespace.define("Skype.Sounds", {
        SoundsManager: WinJS.Class.mix(soundsManager, Skype.Class.disposableMixin),
        init: function () {
            if (!instance) {
                instance = new Skype.Sounds.SoundsManager();
                instance.init();
            }
        },
        play: function (id, sound, loop, useCallOutDevice) {
            Skype.Sounds.init();
            instance.play(id, sound, loop, useCallOutDevice);
        }
    });
    
    window.traceClassMethods && window.traceClassMethods(soundsManager, "SoundsManager", ["_handleLogin"]);
})();

