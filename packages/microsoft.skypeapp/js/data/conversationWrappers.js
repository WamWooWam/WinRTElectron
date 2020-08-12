

(function capabilities() {
    "use strict";

    var capabilities = WinJS.Class.define(function (libConv) {
        this.libConversation = libConv;
        this._capabilities = [];
    }, {
        get: function (capability) {
            
            
            
            
            
            
            if (!this._capabilities.length) {
                this._init();
            }
            return this._capabilities[capability];
        },
        
        _init: function () {
            log("Capabilities: _init " + this.libConversation.getIdentity());
            this.regEventListener(this.libConversation, "capabilitieschanged", this._refreshCapabilities.bind(this));
            this._refreshCapabilities();
        },
        
        _refreshCapabilities: function (event) {
            log("Capabilities: _refreshCapabilities " + this.libConversation.getIdentity());
            var caps = this.libConversation.getCapabilities();
            if (caps) {
                var i = LibWrap.Conversation.capability_CAPABILITY_COUNT;
                while (i--) {
                    this._capabilities[i] = caps.get(i);
                    log("Capabilities[{0}]: _refreshCapabilities - {1} is {2}".format(this.libConversation.getIdentity(), LibWrap.Conversation.capabilitytoString(i), this._capabilities[i]));
                }
            }
            
            event && this.dispatchEvent(Skype.Model.ConversationCapabilities.Events.CapabilitiesChanged);
        }
    }, {
        Events: {
            CapabilitiesChanged: "capabilitieschanged"
        }
    });
    WinJS.Namespace.define("Skype.Model", {
        
        
        
        
        ConversationCapabilities: WinJS.Class.mix(WinJS.Class.mix(capabilities, WinJS.Utilities.eventMixin), Skype.Class.disposableMixin)
    });
}());

(function conversationFactory() {
    "use strict";

    var conversationFactory = WinJS.Class.define(null, null, {

        _makeShareableWrapper: function (wrapper) {
            
            
            
            var oldDispose = wrapper.dispose;
            wrapper.dispose = function () {
                log("Preventing disposing from conversation subcontrol");
            };
            wrapper.conversationDispose = oldDispose;
        },

        createConversation: function (libconv, conversationType) {
            var type = libconv.getIntProperty(LibWrap.PROPKEY.conversation_TYPE);
            var isDialog = type === LibWrap.Conversation.type_DIALOG;
            var conversationWrapper;

            if (isDialog) {
                conversationWrapper = new Skype.Model.DialogConversation(libconv);
            } else {
                conversationWrapper = new Skype.Model.GroupConversation(libconv);
            }

            if (conversationType === conversationFactory.ConversationType.CONVERSATION_VIEW) {
                conversationFactory._makeShareableWrapper(conversationWrapper);
            }

            return conversationWrapper;
        },

        ConversationType: {
            DEFAULT: 0,
            CONVERSATION_VIEW: 1,
        }
    });

    WinJS.Namespace.define("Skype.Model", {
        ConversationFactory: conversationFactory
    });
}());

(function conversation() {
    "use strict";

    var conversationLiveStatuses = [
        LibWrap.Conversation.local_LIVESTATUS_IM_LIVE,
        LibWrap.Conversation.local_LIVESTATUS_ON_HOLD_LOCALLY,
        LibWrap.Conversation.local_LIVESTATUS_ON_HOLD_REMOTELY,
        LibWrap.Conversation.local_LIVESTATUS_PLAYING_VOICE_MESSAGE,
        LibWrap.Conversation.local_LIVESTATUS_RECORDING_VOICE_MESSAGE,
        LibWrap.Conversation.local_LIVESTATUS_TRANSFERRING
    ];

    function noop() { }

    var conversation = MvvmJS.Class.define(function (libConv) {
        this.libConversation = libConv;
        this.id = libConv.getObjectID();
        this.identity = libConv.getIdentity();
        this.type = this.libConversation.getIntProperty(LibWrap.PROPKEY.conversation_TYPE);
    }, {
        libConversation: null,

        identity: "",
        id: 0,
        type: 0,

        isDialog: {
            get: function () {
                return this.type === LibWrap.Conversation.type_DIALOG;
            }
        },
        isEchoService: {
            get: function () {
                return this.identity === "echo123";
            }
        },
        markAsRead: function () {
            var now = Math.ceil(new Date() / 1000); 
            this.libConversation.setConsumedHorizon(now, false);
        },
        _capabilities: null,
        capabilities: {
            get: function () {
                if (!this._capabilities) {
                    this._capabilities = new Skype.Model.ConversationCapabilities(this.libConversation);
                }
                return this._capabilities;
            }
        },
        _isAlive: false,
        alive: function () {
            if (this._isAlive) {
                return;
            }

            var prop2handlerMap = this._buildPropertyHandlerMap();

            this._propertyChangeSubscription = Skype.Utilities.subscribePropertyChanges(this.libConversation, prop2handlerMap);
            this._isAlive = true;

        },

        _buildPropertyHandlerMap: function () {
            var prop2handlerMap = {};
            prop2handlerMap[LibWrap.PROPKEY.conversation_INBOX_TIMESTAMP] = [this._refreshTime.bind(this)];
            prop2handlerMap[LibWrap.PROPKEY.conversation_PINNED_ORDER] = [this._refreshFavoriteOrder.bind(this)];
            prop2handlerMap[LibWrap.PROPKEY.conversation_DISPLAYNAME] = [this._refreshName.bind(this)];

            
            prop2handlerMap[LibWrap.PROPKEY.conversation_UNCONSUMED_NORMAL_MESSAGES] = [noop];
            prop2handlerMap[LibWrap.PROPKEY.conversation_UNCONSUMED_SUPPRESSED_MESSAGES] = [noop];
            prop2handlerMap[LibWrap.PROPKEY.conversation_CONSUMPTION_HORIZON] = [noop];
            prop2handlerMap[LibWrap.PROPKEY.conversation_INBOX_MESSAGE_ID] = [noop];
            prop2handlerMap[LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS] = [noop];

            return prop2handlerMap;
        },

        subscribePropertyChanges: function (prop2handlerMap) {
            if (!this._propertyChangeSubscription) {
                this.alive();
            }

            var map = this._propertyChangeSubscription.map;
            Object.keys(prop2handlerMap).forEach(function (name) {
                if (!map[name]) {
                    throw new "Conversation {0} doesn't have subscribed property {1}".format(this.identity, name);
                }
                map[name].push(prop2handlerMap[name]);
            });

            return this._propertyChangeSubscription;
        },

        _onDispose: function () {
            log("conversationWrappers: disposing conversation " + this.identity);

            this.libConversation && this.libConversation.discard();
        },

        toggleFavorite: function (afterConversationId) {
            if (this.favoriteOrder > 0) {
                this.libConversation.unPin();
            } else {
                if (afterConversationId !== null) {
                    this.libConversation.pinAfter(afterConversationId);
                } else {
                    this.libConversation.pinFirst();
                }
            }
        },

        bookmark: {
            get: function () {
                return this.libConversation.getIntProperty(LibWrap.PROPKEY.conversation_IS_BOOKMARKED);
            },
            set: function (value) {
                this.libConversation.setBookmark(value);
            }
        },


        _getRawTime: function () {
            return this.libConversation.getIntProperty(LibWrap.PROPKEY.conversation_INBOX_TIMESTAMP);
        },
        _getTime: function () {
            return new Date(this.rawTime * 1000);
        },
        _getHasHistory: function () {
            return this.rawTime > 0;
        },
        _refreshTime: function () {
            this.rawTime = this._getRawTime();
            this.time = this._getTime();
            this.hasHistory = this._getHasHistory();
        },

        _getFavoriteOrder: function () {
            var result = this.libConversation.getIntProperty(LibWrap.PROPKEY.conversation_PINNED_ORDER);
            if (!result) {
                result = 0;
            }
            return result;
        },
        _refreshFavoriteOrder: function () {
            this.favoriteOrder = this._getFavoriteOrder();
        },

        _getName: function () {
            var partnerContact = this.libConversation.partnerContact;
            var result = null;
            if (partnerContact) {
                var contactType = partnerContact.getContactType();
                switch (contactType) {
                    case LibWrap.Contact.type_EMERGENCY_PSTN:
                        result = "emergency_contact_name".translate(partnerContact.getIdentity());
                        break;
                    case LibWrap.Contact.type_FREE_PSTN:
                    case LibWrap.Contact.type_PSTN:
                        result = partnerContact.getDisplayNameHtml();
                        break;
                    case LibWrap.Contact.type_UNDISCLOSED_PSTN:
                        result = "undisclosed_contact_name".translate();
                        break;
                }
            }

            if (!result) {
                result = this.libConversation.getDisplayNameHtml();
            }

            if (!result) {
                result = window.toStaticHTML(result);
            }
            return result;
        },

        _refreshName: function () {
            var name = this._getName();

            if (this._characterGrouping) {
                this._characterGrouping = this._calculateCharacterGrouping(name);
            };
            this.name = name;
            this._refreshAriaLabel();
            this._refreshFormattedNameInline();
        },

        _getCharacterGrouping: function () {
            return this._calculateCharacterGrouping(this.name);
        },
        
        _calculateCharacterGrouping: function (input) {
            var name = input.toLocaleLowerCase();
            var letter = Skype.Globalization.getCharacterGroupingsLetter(name);
            return {
                letter: letter,
                index: Skype.Globalization.getCharacterGroupingsIndex(letter)
            };
        },

        _getPresenceAriaLabel: function () {
            if (this.mood && this.mood.length == 0) {
                if (!(this.isDialog && this.isMessengerContact)) {
                    return "";
                }
            }
            return (this.isAvailable ? "aria_me_available".translate() : "");
        },
        
        _refreshAriaLabel: function () {
            this.presenceAriaLabel = this._getPresenceAriaLabel();
        },

        _getFormattedNameInline: function () {
            return Skype.Utilities.trimHtmlNewlines(this.name, " ");
        },

        _refreshFormattedNameInline: function () {
            this.formattedNameInline = this._getFormattedNameInline();
        },


        _getLiveStatus: function () {
            return this.libConversation.getIntProperty(LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS);
        },

        _refreshLiveStatus: function () {
            this.liveStatus = this._getLiveStatus();
        },

        getLastMessage: function () {
            var ordinaryMessage = null;
            var inboxMsgDbId = this.libConversation.getIntProperty(LibWrap.PROPKEY.conversation_INBOX_MESSAGE_ID);
            var libMessage;
            if (inboxMsgDbId) {
                var inboxMsgId = lib.findObjectByDbID(LibWrap.WrSkyLib.objecttype_MESSAGE, inboxMsgDbId);
                if (inboxMsgId) {
                    libMessage = lib.getConversationMessage(inboxMsgId);
                    if (libMessage) {
                        ordinaryMessage = Skype.Model.MessageFactory.createMessage(libMessage);
                        libMessage.discard();
                    }
                }
            }
            return ordinaryMessage;
        },

        getTopicStrippedXML: function () {
            return this.libConversation.getStrPropertyWithXmlStripped(LibWrap.PROPKEY.conversation_META_TOPIC);
        }

    }, {
        name: Skype.Utilities.cacheableProperty("name"),
        characterGrouping: Skype.Utilities.cacheableProperty("characterGrouping"),
        rawTime: Skype.Utilities.cacheableProperty("rawTime"),
        time: Skype.Utilities.cacheableProperty("time"),
        hasHistory: Skype.Utilities.cacheableProperty("hasHistory"),
        favoriteOrder: Skype.Utilities.cacheableProperty("favoriteOrder"),
        presenceAriaLabel: Skype.Utilities.cacheableProperty("presenceAriaLabel"),
        liveStatus: Skype.Utilities.cacheableProperty("liveStatus"),
        formattedNameInline: Skype.Utilities.cacheableProperty("formattedNameInline"),

        avatarUri: null,
        isDefaultAvatar: null,

        topic: {
            get: function () {
                return this.libConversation.getTopicHtml();
            },
            set: function (value) {
                return this.libConversation.setTopic(value, true);
            }
        },

        mood: {
            get: function () {
                return this.topic;
            }
        },

        formattedMood: {
            get: function () {
                return this.mood;
            }
        },

        formattedMoodInline: {
            get: function () {
                return Skype.Utilities.trimHtmlNewlines(this.formattedMood, " ");
            }
        },

        presence: {
            get: function () {
                return "offline";
            }
        },
        isAvailable: false,
        isPstnOnly: false,
        isBlocked: false,


        duration: {
            get: function () {
                if (this.isLive) {
                    var liveStart = new Date();
                    var now = new Date();
                    var liveStartStamp = this.libConversation.getIntProperty(LibWrap.PROPKEY.conversation_LIVE_START_TIMESTAMP);
                    if (liveStartStamp == 0) { 
                        return 0;
                    }
                    var timestamp = liveStartStamp * 1000;
                    liveStart.setTime(timestamp);
                    var duration = now - liveStart;
                    return Math.floor(duration / 1000);
                } else {
                    return 0;
                }
            }
        },

        formattedDuration: {
            get: function () {
                if (this.isLive) {
                    return Skype.Utilities.formatDuration(this.duration);
                } else {
                    return "";
                }
            }
        },

        hasMultipleParticipants: {
            get: function () {
                return this.libConversation.participants.length == 1;
            }
        },

        isLive: {
            get: function () {
                var liveStatus = this.libConversation.getIntProperty(LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS);
                return conversationLiveStatuses.indexOf(liveStatus) !== -1 || this.isRecoveryMode;
            }
        },

        isRecoveryMode: {
            get: function () {
                
                return this.libConversation.partner ? !!this.libConversation.partner.getIntProperty(LibWrap.PROPKEY.participant_LIVESESSION_RECOVERY_IN_PROGRESS) : false;
            }
        },

        isIncomingVideoCall: function () {
            var video, nVideos, videos, result = false;

            this._refreshLiveStatus(); 

            if (this.liveStatus === LibWrap.Conversation.local_LIVESTATUS_RINGING_FOR_ME) {
                
                for (var i = 0; i < this.libConversation.participants.length && !result; i++) {
                    videos = new LibWrap.VectUnsignedInt();
                    this.libConversation.participants[i].getLiveSessionVideos(videos);
                    nVideos = videos.getCount();

                    for (var j = 0; j < nVideos && !result; j++) {
                        video = lib.getVideo(videos.get(j));
                        if (video) {
                            var status = video.getIntProperty(LibWrap.PROPKEY.video_STATUS);
                            result = status === LibWrap.Video.status_HINT_IS_VIDEOCALL_RECEIVED;
                            video.discard();
                        }
                    }
                }
            }
            return result;
        }
    });
    var conversation = WinJS.Class.mix(conversation, Skype.Class.disposableMixin);
    WinJS.Namespace.define("Skype.Model", {
        Conversation: conversation
    });
    


}());

(function groupConversation() {
    "use strict";

    var groupConversation = MvvmJS.Class.derive(Skype.Model.Conversation, function (libConv) {
        Skype.Model.Conversation.call(this, libConv);
        this._refreshP2PMigrationStatus();
    }, {
        _avatarSubscription: null,
        _getAvatarUri: function (value) {
            var result = value ? value : Skype.Model.AvatarUpdater.instance.getAvatarURI(this.identity);
            return result;
        },
        _getIsDefaultAvatar: function () {
            return LibWrap.AvatarManager.isDefaultAvatarURI(this.avatarUri);
        },
        _refreshAvatarUri: function (value) {
            this.avatarUri = this._getAvatarUri(value);
            this.isDefaultAvatar = this._getIsDefaultAvatar();
        },

        alive: function () {
            Skype.Model.Conversation.prototype.alive.call(this);
            this._avatarSubscription = Skype.Model.AvatarUpdater.instance.subscribe(this.identity, this._refreshAvatarUri.bind(this));
        },
        _buildPropertyHandlerMap: function () {
            var map = Skype.Model.Conversation.prototype._buildPropertyHandlerMap.call(this);
            map[LibWrap.PROPKEY.conversation_IS_P2P_MIGRATED] = [this._refreshP2PMigrationStatus.bind(this)];
            return map;
        },
        _refreshP2PMigrationStatus: function () {
            this.p2pMigrated = this.libConversation.getIntProperty(LibWrap.PROPKEY.conversation_IS_P2P_MIGRATED);
        },
        participants: null 
    }, {
        avatarUri: Skype.Utilities.cacheableProperty("avatarUri"),
        isDefaultAvatar: Skype.Utilities.cacheableProperty("isDefaultAvatar"),
        p2pMigrated: false,
        mood: {
            get: function () {
                return "";
            }
        }
    });

    WinJS.Namespace.define("Skype.Model", {
        GroupConversation: groupConversation
    });

}());

(function dialogConversation() {
    "use strict";

    var dialogConversation = MvvmJS.Class.derive(Skype.Model.Conversation, function (libConv) {
        Skype.Model.Conversation.call(this, libConv);

        var libContact = libConv.partnerContact;
        this.contact = new Skype.Model.Contact(libContact);
    }, {
        contact: null,
        
        alive: function () {
            Skype.Model.Conversation.prototype.alive.call(this);
            this.contact.alive(this._propertyChangeSubscription);
            this.regEventListener(this.contact, "propertychanged", this._handlePropertyChanged.bind(this));
        },
        _buildPropertyHandlerMap: function () {
            var map = Skype.Model.Conversation.prototype._buildPropertyHandlerMap.call(this);
            var contactsMap = this.contact.buildSubscriptionMap();
            Object.getOwnPropertyNames(contactsMap).forEach(function (x) {
                map[x] = contactsMap[x];
            });
            map[LibWrap.PROPKEY.contact_DISPLAYNAME] = [this._refreshName.bind(this)];
            return map;
        },

        _handlePropertyChanged: function (evt) {
            var propertyName = evt.detail;
            switch (propertyName) {
                case "mood":
                case "formattedMood":
                case "formattedMoodInline":
                case "avatarUri":
                case "isDefaultAvatar":
                case "isBlocked":
                    this.notify(propertyName);
                    break;
                    
                case "presence":
                case "isAvailable":
                    this.notify(propertyName);
                    this._refreshAriaLabel();
                    break;
            }
        },

        getLivePrice: function () {
            var livePrice = this.libConversation.partner.getStrProperty(LibWrap.PROPKEY.participant_LIVE_PRICE_FOR_ME);
            if (!livePrice) {
                return null;
            }

            var livePriceTokens = livePrice.split(" ");
            if (!livePriceTokens || livePriceTokens.length < 3) {
                return null;
            }

            var price = Number(livePriceTokens[0]),
                currency = livePriceTokens[1],
                fundingTypeToken = livePriceTokens[2];

            if (isNaN(price)) {
                return null;
            }

            if (!price || !currency || !fundingTypeToken) {
                return null;
            }

            var fundingType;
            if (fundingTypeToken === Skype.Model.DialogConversation.LivePriceFundingType.tbyb) {
                fundingType = Skype.Model.DialogConversation.LivePriceFundingType.tbyb;
            } else if (fundingTypeToken === Skype.Model.DialogConversation.LivePriceFundingType.package) {
                fundingType = Skype.Model.DialogConversation.LivePriceFundingType.package;
            } else if (fundingTypeToken === Skype.Model.DialogConversation.LivePriceFundingType.skypeout) {
                fundingType = Skype.Model.DialogConversation.LivePriceFundingType.skypeout;
            } else {
                return null; 
            }

            return {
                fundingType: fundingType,
                price: price,
                currency: currency
            };           
        }
    }, {
        mood: {
            get: function () {
                return this.contact.mood;
            }
        },
        formattedMood: {
            get: function () {
                return this.contact.formattedMood;
            }
        },
        formattedMoodInline: {
            get: function () {
                return this.contact.formattedMoodInline;
            }
        },
        avatarUri: {
            get: function () {
                return this.contact.avatarUri;
            }
        },
        isDefaultAvatar: {
            get: function () {
                return this.contact.isDefaultAvatar;
            }
        },
        presence: {
            get: function () {
                return this.contact.presence;
            }
        },
        isAvailable: {
            get: function () {
                return this.contact.isAvailable;
            }
        },
        isPstnContact: {
            get: function () {
                return this.contact.isPstnContact;
            }
        },
        isPstnOnly: {
            get: function () {
                return this.contact.isPstnOnly;
            }
        },
        isBlocked: {
            get: function () {
                return this.contact.isBlocked;
            }
        },
        isMessengerContact: {
            get: function () {
                return this.contact.isMessengerContact;
            }
        }

    },
    {
        LivePriceFundingType: {
            skypeout: 'skypeout',
            package: 'package',
            tbyb: 'tbyb'
        }
    });

    WinJS.Namespace.define("Skype.Model", {
        DialogConversation: dialogConversation
    });

    window.traceClassMethods && window.traceClassMethods(dialogConversation, "DialogConversation", ["alive"]);
}());

(function participant() {
    "use strict";


    var participant = MvvmJS.Class.define(function (libParticipant) {
        this.libParticipant = libParticipant;
        this.id = this.libParticipant.getObjectID();
    }, {
        libParticipant: null,
        id: 0,

        _subscription: null,
        _isAlive: false,
        alive: function () {
            if (this._isAlive) {
                return;
            }

            var prop2HandlerMap = {};
            prop2HandlerMap[LibWrap.PROPKEY.participant_VOICE_STATUS] = [this._refreshVoiceStatus.bind(this)];
            this._subscription = Skype.Utilities.subscribePropertyChanges(this.libParticipant, prop2HandlerMap);

            this._isAlive = true;
        },
        _onDispose: function () {
            log("conversationWrappers: disposing participant " + this.id);

            this.libParticipant.discard();
        },

        _getVoiceStatus: function () {
            return this.libParticipant.getIntProperty(LibWrap.PROPKEY.participant_VOICE_STATUS);
        },
        _refreshVoiceStatus: function () {
            this.voiceStatus = this._getVoiceStatus();
        }

    }, {
        voiceStatus: Skype.Utilities.cacheableProperty("voiceStatus")

    });

    WinJS.Namespace.define("Skype.Model", {
        Participant: WinJS.Class.mix(participant, Skype.Class.disposableMixin)
    });
}());

(function LiveConversation() {
    "use strict";

    WinJS.Namespace.define("Skype.Model", {
        LiveConversation: MvvmJS.Class.derive(Skype.Model.Conversation, function (libConv) {
            this.base(libConv);
        }, {
            alive: function () {
                if (this._isAlive) {
                    return;
                }
                Skype.Model.Conversation.prototype.alive.call(this);

                this.regEventListener(this.libConversation, "participantlistchange", this._refreshParticipantList.bind(this));
                this._refreshParticipantList(this);
            },

            _buildPropertyHandlerMap: function () {
                var prop2HandlerMap = {};
                prop2HandlerMap[LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS] = [this._refreshLiveStatus.bind(this)];

                return prop2HandlerMap;
            },
            _refreshParticipantList: function (parameters) {
                
                
                
                
                
                

                var participantsMap = {};


                var participantsIds = new LibWrap.VectUnsignedInt();
                this.libConversation.getParticipants(participantsIds, LibWrap.Conversation.participantfilter_OTHER_CONSUMERS);
                var participantsCount = participantsIds.getCount();
                for (var i = 0; i < participantsCount; i++) {
                    var objectId = participantsIds.get(i);
                    var libParticipant = lib.getParticipant(objectId);
                    var participant = new Skype.Model.Participant(libParticipant);
                    participant.alive();
                    participantsMap[objectId] = participant;
                }

                if (this.participants) {
                    Object.keys(this.participants).forEach(function (id) {
                        var participant = this.participants[id];
                        participant && participant.dispose();
                    }, this);
                }

                this.participants = participantsMap;
            }
        }, {
            participants: null
        })
    });

}());