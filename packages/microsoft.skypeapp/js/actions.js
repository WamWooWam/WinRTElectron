

var Actions;

(function actionbase() {
    "use strict";

    
    var actionBase = MvvmJS.Class.define(function () {
    }, {
        invokeAsync: function () {
            

            throw "not implemented";
        },

        alive: function () {
            

            throw "not implemented";
        }
    }, {
        
        isApplicable: Skype.Utilities.cacheableProperty("isApplicable"),

        
        isEnabled: Skype.Utilities.cacheableProperty("isEnabled")
    }, {
        name: "ActionBase"
    });

    WinJS.Namespace.define("Skype.Actions", {
        ActionBase: actionBase
    });


    
}());

(function sendVideoMessage() {
    "use strict";

    var sendViMAction = MvvmJS.Class.derive(Skype.Actions.ActionBase, function (conversation, alib, callManager, entitlementManager) {
        this._conversation = lib.getConversationByIdentity(conversation.getIdentity()); 
        assert(this._conversation, "conversation");

        this._callManager = callManager || Skype.CallManager;
        assert(this._callManager, "callManager");

        this._lib = alib || lib;
        assert(this._lib, "lib");

        this._entitlementManager = entitlementManager || Skype.VideoMessageEntitlementsManager.instance;
        assert(this._entitlementManager, "entitlementManager");

        this._refreshIsEnabled();
        this._refreshIsApplicable();
    }, {
        _conversation: null,
        _callManager: Skype.Utilities.nondisposableProperty(null),
        _lib: Skype.Utilities.nondisposableProperty(null),
        _entitlementManager: Skype.Utilities.nondisposableProperty(null),

        _liveConversationsListener: null,

        _getIsEnabled: function () {
            return !this._callManager.liveConversationExists();
        },
        _refreshIsEnabled: function () {
            this.isEnabled = this._getIsEnabled();
        },

        _refreshIsApplicable: function () {
            this.isApplicable = this._getIsApplicable();
        },
        _getIsApplicable: function () {
            log('sendVideoMessageAction.isApplicable:');
            if (!this._lib.getActiveVideoDeviceHandle()) {
                log('lib.getActiveVideoDeviceHandle() FAILED');
                return false;
            }

            if (this._conversation.getIntProperty(LibWrap.PROPKEY.conversation_TYPE) !== LibWrap.Conversation.type_DIALOG) {
                log('conversation_TYPE != type_DIALOG');
                return false;
            }

            var caps = this._conversation.getCapabilities();
            if (caps && !caps.get(LibWrap.Conversation.capability_CAN_SEND_VIDEOMESSAGE)) {
                log('capability_CAN_SEND_VIDEOMESSAGE is FALSE');
                return false;
            }
            log('isEntitled: {0}'.format(this._entitlementManager.isEntitled));
            log('sendEnabled: {0}'.format(this._entitlementManager.sendEnabled));

            return this._entitlementManager.isEntitled && this._entitlementManager.sendEnabled;
        },

        invokeAsync: function () {
            var conversation = lib.getConversationByIdentity(this._conversation.getIdentity()); 
            var dialog = new Skype.UI.Conversation.VideoMessageDialog(document.createElement("div"), { conversation: conversation });
            return dialog.showAsync();
        },

        alive: function () {
            if (this._isAlive) {
                return;
            }
            this._isAlive = true;

            var that = this;
            this._liveConversationsListener = {
                liveConversationsChange: function () {
                    that._refreshIsEnabled();
                }
            };

            this._callManager.registerListener(this._liveConversationsListener);
            this._refreshIsEnabled();
        },

        _onDispose: function () {
            this._callManager.unregisterListener(this._liveConversationsListener);
            this._conversation.discard();
        }
    }, {
    }, {
        name: "sendVideoMessage"
    });

    WinJS.Namespace.define("Skype.Actions", {
        SendVideoMessageAction: sendViMAction
    });
}());


(function () {
    "use strict";

    var _actions = {};

    var Action = WinJS.Class.define();

    function initActions() {
        Actions = {};

        Actions.getAction = function (actionName) {
            return _actions[actionName];
        };

        Actions.invoke = function (action, target, params) {
            log("Actions.invoke('" + action + "', '" + target + "', " + params + ")");
            var a = Actions.getAction(action);
            if (!a) {
                log("Undefined action: " + action);
                return false;
            }

            var conversation = null;
            var actionRequiresConversation = a.invoke.length == 2;
            if (actionRequiresConversation) {
                conversation = Actions.getConversation(target);
                if (!conversation) {
                    log("Conversation not found for the action");
                    return false;
                }
            }

            if (a.isApplicable && !a.isApplicable(conversation, params)) {
                var stringiedParams;
                try {
                    stringiedParams = JSON.stringify(params);
                } catch (e) {
                    stringiedParams = "invalid JSON";
                }
                log("Action '" + action + "'.isApplicable returned false for (" + target + ", " + stringiedParams + ")");
                return false;
            }

            if (a.isEnabled && !a.isEnabled(conversation)) {
                log("Action '" + action + "'.isEnabled returned false");
                return false;
            }

            var invokeReturn;
            if (actionRequiresConversation) {
                invokeReturn = a.invoke(conversation, params);
            } else {
                invokeReturn = a.invoke(params);
            }

            if (!invokeReturn) {
                log("Actions.invoke returns '{0}' for '{1}', '{2}', '{3}'".format(invokeReturn, action, target, JSON.stringify(params)));
            }
            roboSky.write("Action," + action);
            conversation && conversation.discard(); 
            return invokeReturn;
        };

        Actions.isActionApplicable = function (action, target, params) {
            var a = Actions.getAction(action);
            if (!a) {
                log("Undefined action: " + action);
                return false;
            }
            var actionRequiresConversation = a.invoke.length == 2;
            var result = true;
            if (a.isApplicable) {
                if (actionRequiresConversation) {
                    var conversation = Actions.getConversation(target);
                    result = a.isApplicable(conversation, params);
                    conversation.discard();
                } else {
                    result = a.isApplicable(params);
                }
            }
            return result;
        };

        Actions.isActionEnabled = function (action, target, params) {
            var a = Actions.getAction(action);
            if (!a) {
                log("Undefined action: " + action);
                return false;
            }
            var actionRequiresConversation = a.invoke.length == 2;
            var result = true;
            if (a.isEnabled) {
                if (actionRequiresConversation) {
                    var conversation = Actions.getConversation(target);
                    result = a.isEnabled(conversation, params);
                    conversation.discard();
                } else {
                    result = a.isEnabled(params);
                }
            }
            return result;
        };

        Actions.getConversation = function (identities) {
            if (identities instanceof Array) {
                if (identities.length === 0) {
                    return null;
                }
                if (identities.length == 1) {
                    return lib.getConversationByIdentity(identities[0]);
                } else {
                    var c = new LibWrap.Conversation();
                    if (lib.getConversationByParticipants(new LibWrap.VectGIString(identities), c, true, true)) {
                        return c;
                    } else {
                        return null;
                    }
                }
            } else {
                if (identities === "") {
                    return null;
                }
                return lib.getConversationByIdentity(identities);
            }
        };

        Actions.getParticipantsFromConversation = function (conversation, identities) {
            var result = [];
            for (var i = 0; i < conversation.participants.length; i++) {
                if (identities.indexOf(conversation.participants[i].participantContact.getIdentity()) > -1) {
                    result.push(conversation.participants[i]);
                }
            }
            return result;
        };

        Actions.registerAction = function (actionName, action) {
            if (Actions.getAction(actionName)) {
                throw "Action " + actionName + " already registered";
            }
            _actions[actionName] = action;
        };

        function assignLiveIdentityToUse(conv, param) {
            if (!conv) {
                return;
            }
            if (conv.getIntProperty(LibWrap.PROPKEY.conversation_TYPE) !== LibWrap.Conversation.type_DIALOG) {
                return;
            }
            var identityToUse = "";
            if ((param) && (param.identityToUse)) {
                identityToUse = param.identityToUse;
            }
            if (Skype.Lib.validIdentity(identityToUse) || identityToUse === "") {
                conv.partner.setLiveIdentityToUse(identityToUse);
            }
        }

        function callPrevented(conv, params, action) {
            var pstnBlocked = !Skype.Application.state.policy.PSTN.enabled,
                callsBlocked = !Skype.Application.state.policy.calling.enabled,
                convIdentity = conv.getIdentity(),
                identityToUse = params && params.identityToUse ? params.identityToUse : convIdentity;

            if (action === "addParticipantsAction") {
                if (pstnBlocked && params) {
                    for (var i = 0; i < params.participants.length; i++) {
                        if (Skype.Lib.validPSTN(params.participants[i])) {
                            return true;
                        }
                    }
                }
                return false;
            }

            if (action === "ringParticipantsAction") {
                if (callsBlocked) {
                    return true;
                }
                if (pstnBlocked && params && params.participant) {
                    if ([LibWrap.Contact.type_FREE_PSTN, LibWrap.Contact.type_PSTN, LibWrap.Contact.type_UNDISCLOSED_PSTN].contains(params.participant.participantContact.getContactType())) {
                        return true;
                    }
                }
                return false;
            }

            return callsBlocked ||
                (pstnBlocked && Skype.Lib.validPSTN(identityToUse)) || 
                (pstnBlocked && Skype.Lib.conversationContainsPSTN(conv)); 
        }

        function rejectCall(convIdentity) {
            log("checkActionPolicy: will reject call");
            if (Skype.Application.state.view.isOnLockScreen) {
                setTimeout(function () {
                    Actions.invoke("reject", [convIdentity]);
                }, 10e3);
            } else {
                Actions.invoke("reject", [convIdentity]);
            }
        }

        
        function checkActionPolicy(conv, params, action) {
            

            var shouldPreventAction = callPrevented(conv, params, action);

            if (!Skype.Application.state.policy.application.enabled && action !== "hangup" && action !== "reject") {
                shouldPreventAction = true;
            }

            log("checkActionPolicy: " + shouldPreventAction);
            if (shouldPreventAction) {
                var goToLive = params && params.goDirectlyToLive;
                var incommingCall = ["answerAction", "answerVideoAction"].contains(action);
                if (incommingCall || goToLive) { 
                    rejectCall(conv.getIdentity());
                }
                if (Skype.Application.state.policy.application.enabled) {  
                    Skype.UI.navigate("policyWarning", { blockedAction: action, identity: conv.getIdentity() });
                }
                return false;
            }
            return true;
        }

        var callAction = new Action();
        callAction.invoke = function (conv, params) {
            if (!checkActionPolicy(conv, params, "callAction")) {
                return false;
            }

            if (params) {
                assignLiveIdentityToUse(conv, params);
            }
            Skype.CallManager.holdAllCalls();
            var status = conv.getIntProperty(LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS);
            log("  Actions in callAction.invoke() local livestatus: " + status + " (0-NONE, 10-RECLIVE, 2-RINGFORME, 3-IMLIVE)");
            var isVideoCall = params && typeof params.video !== 'undefined';
            if ([LibWrap.Conversation.local_LIVESTATUS_NONE, LibWrap.Conversation.local_LIVESTATUS_RECENTLY_LIVE].indexOf(status) > -1) {
                var origin = params && params.origin || "";
                conv.ringOthers(new LibWrap.VectGIString([]), isVideoCall, origin);
            } else if ([LibWrap.Conversation.local_LIVESTATUS_RINGING_FOR_ME, LibWrap.Conversation.local_LIVESTATUS_OTHERS_ARE_LIVE].indexOf(status) > -1) {
                conv.joinLiveSession("");
            }
            var identity = conv.getIdentity();
            if (isVideoCall) {
                Actions.invoke("startVideo", [identity]);
            }
            log("  Actions in callAction.invoke() starting call finished");
            Actions.invoke("focusConversation", [identity], { goDirectlyToLive: true });
            return true;
        };
        callAction.isApplicable = function (conv, params) {
            var liveStatus = conv.getIntProperty(LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS);
            return ([LibWrap.Conversation.local_LIVESTATUS_NONE, LibWrap.Conversation.local_LIVESTATUS_RECENTLY_LIVE,
                     LibWrap.Conversation.local_LIVESTATUS_OTHERS_ARE_LIVE, LibWrap.Conversation.local_LIVESTATUS_RINGING_FOR_ME].indexOf(liveStatus) > -1);
        };

        var videoCallAction = new Action();
        videoCallAction.invoke = function (conv, params) {
            if (!checkActionPolicy(conv, params, "videoCallAction")) {
                return false;
            }
            var identity = conv.getIdentity();
            Actions.invoke("call", [identity], { video: true });
        };
        videoCallAction.isApplicable = function (conv, params) {
            var isDialog = conv.getIntProperty(LibWrap.PROPKEY.conversation_TYPE) === LibWrap.Conversation.type_DIALOG;

            return callAction.isApplicable(conv, params);
        };

        var ringParticipantsAction = new Action();
        ringParticipantsAction.invoke = function (conv, params) {
            if (!params || !params.participants) {
                return false;
            }

            var participants = Actions.getParticipantsFromConversation(conv, params.participants);

            params.participant = participants[0]; 

            if (!params.participant || !checkActionPolicy(conv, params, "ringParticipantsAction")) {
                return false;
            }

            params.participant.ringIt(params.video);
            log("  Actions in ringParticipants.invoke() starting call finished");

            return true;
        };
        ringParticipantsAction.isApplicable = function (conv, params) {
            if (!params || !params.participants) {
                return false;
            }

            var participants = Actions.getParticipantsFromConversation(conv, params.participants);
            if (participants.length === 0) {
                return false;
            }

            var liveStatus = conv.getIntProperty(LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS);
            var isLive = [
                LibWrap.Participant.voice_STATUS_SPEAKING,
                LibWrap.Participant.voice_STATUS_LISTENING,
                LibWrap.Participant.voice_STATUS_VOICE_ON_HOLD,
                LibWrap.Participant.voice_STATUS_VOICE_CONNECTING,
                LibWrap.Participant.voice_STATUS_RINGING,
                LibWrap.Participant.voice_STATUS_EARLY_MEDIA
            ].contains(participants[0].getIntProperty(LibWrap.PROPKEY.participant_VOICE_STATUS));

            return (liveStatus === LibWrap.Conversation.local_LIVESTATUS_IM_LIVE && !isLive);
        };

        var focusConversationAction = new Action();
        focusConversationAction.invoke = function (conv, params) {
            var _params = params || {},
                liveDisabled = false;

            if (_params.goDirectlyToLive) {
                if (!Skype.Application.state.policy.application.enabled) {
                    rejectCall(conv.getIdentity());
                    return false;
                }

                if (callPrevented(conv, _params, "focusConversation")) {
                    rejectCall(conv.getIdentity());
                    _params.goDirectlyToLive = false;
                    liveDisabled = true;
                }
            }
            _params.id = conv.getIdentity();

            
            Skype.UI.Conversation.VideoMessageDialog.closeAllDialogs();
            Skype.UI.PeoplePicker.hide();

            var convNavig = Skype.UI.navigate('conversation', _params);

            if (liveDisabled && convNavig) {
                
                convNavig = convNavig.then(Skype.UI.navigate.bind(null, "policyWarning", { blockedAction: "focusConversation", identity: conv.getIdentity() }));
            }

            return convNavig;
        };

        var hangupAction = new Action();
        hangupAction.invoke = function (conv, params) {
            
            return conv.leaveLiveSession(false);
        };
        hangupAction.isApplicable = function (conv, params) {
            var liveStatus = conv.getIntProperty(LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS);
            return (liveStatus === LibWrap.Conversation.local_LIVESTATUS_STARTING) ||
                (liveStatus === LibWrap.Conversation.local_LIVESTATUS_IM_LIVE) ||
                (liveStatus === LibWrap.Conversation.local_LIVESTATUS_ON_HOLD_LOCALLY) ||
                (liveStatus === LibWrap.Conversation.local_LIVESTATUS_ON_HOLD_REMOTELY) ||
                (liveStatus === LibWrap.Conversation.local_LIVESTATUS_PLAYING_VOICE_MESSAGE) ||
                (liveStatus === LibWrap.Conversation.local_LIVESTATUS_RECORDING_VOICE_MESSAGE) ||
                (liveStatus === LibWrap.Conversation.local_LIVESTATUS_TRANSFERRING);
        };

        var rejectAction = new Action();
        rejectAction.invoke = function (conv, params) {
            conv.leaveLiveSession(false);  
        };
        rejectAction.isApplicable = function (conv, params) {
            var liveStatus = conv.getIntProperty(LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS);
            log("reject.isApplicable: live status " + liveStatus);
            return (liveStatus === LibWrap.Conversation.local_LIVESTATUS_RINGING_FOR_ME);
        };

        var answerAction = new Action();
        answerAction.invoke = function (conv, params) {
            if (!checkActionPolicy(conv, params, "answerAction")) {
                return false;
            }

            var identity = conv.getIdentity();
            Skype.CallManager.holdAllCalls(identity);
            var invokeReturn = conv.joinLiveSession("");
            roboSky.write("Conversation,acceptCall");
            if (params && params.focusConversation) {
                Actions.invoke("focusConversation", [identity], { goDirectlyToLive: true });
            }
            return invokeReturn;
        };
        answerAction.isApplicable = function (conv, params) {
            var liveStatus = conv.getIntProperty(LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS);
            return (liveStatus === LibWrap.Conversation.local_LIVESTATUS_RINGING_FOR_ME);
        };

        var answerVideoAction = new Action();
        answerVideoAction.invoke = function (conv, params) {
            if (!checkActionPolicy(conv, params, "answerVideoAction")) {
                return false;
            }

            var identity = conv.getIdentity();
            var result = Actions.invoke("answer", [identity], params);
            if (result) {
                
                Actions.invoke("startVideo", [identity]); 
            }
            return result;
        };
        answerVideoAction.isApplicable = function (conv, params) {
            var liveStatus = conv.getIntProperty(LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS);
            return (liveStatus === LibWrap.Conversation.local_LIVESTATUS_RINGING_FOR_ME);
        };

        var chatAction = new Action();
        chatAction.invoke = function (conv, params) {
            Actions.invoke("focusConversation", conv.getIdentity());
        };

        var callPhoneAction = new Action();
        callPhoneAction.invoke = function (conv, params) {
            
            
            

            
            Actions.invoke("call", conv.getIdentity(), params);
        };

        var homeAction = new Action();
        homeAction.invoke = function (params) {
            Skype.UI.navigate();
        };

        var startVideoAction = new Action();
        startVideoAction.invoke = function (conv, params) {
            var identity = conv.getIdentity();

            if (Skype.VideoMessaging && Skype.VideoMessaging.Capturer) {
                var releasedPromise = Skype.VideoMessaging.Capturer.current.getCapturerReleasedPromise();
                releasedPromise.done(function () {
                    Skype.SendVideoManager.instance.startSendingVideo(identity);
                });
            } else {
                Skype.SendVideoManager.instance.startSendingVideo(identity);
            }
            return true;
        };

        startVideoAction.isApplicable = function (conv, params) {
            
            var capabilities = conv.getCapabilities();
            return capabilities && capabilities.get(LibWrap.Conversation.capability_CAN_RING_VIDEO);
        };

        var switchCameraAction = new Action();
        switchCameraAction.invoke = function (conv, params) {
            Skype.SendVideoManager.instance.switchSendingCamera(conv.getIdentity());
            Skype.Statistics.sendStats(Skype.Statistics.event.call_switchCamera);
        };

        var stopVideoAction = new Action();
        stopVideoAction.invoke = function (conv, params) {
            return Skype.SendVideoManager.instance.stopSendingVideo(conv.getIdentity());
        };

        var resumeAction = new Action();
        resumeAction.invoke = function (conv, params) {
            Skype.CallManager.holdAllCalls();
            conv.resumeMyLiveSession();
        };
        resumeAction.isApplicable = function (conv, params) {
            var status = conv.getIntProperty(LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS);
            if (status != LibWrap.Conversation.local_LIVESTATUS_ON_HOLD_LOCALLY && status != LibWrap.Conversation.local_LIVESTATUS_ON_HOLD_REMOTELY) {
                return false;
            }
            return true;
        };

        var holdCallAction = new Action();
        holdCallAction.invoke = function (conv, params) {
            var localLiveStatus = conv.getIntProperty(LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS),
                holdActionResult = false;
            if ((localLiveStatus === LibWrap.Conversation.local_LIVESTATUS_IM_LIVE) || (localLiveStatus === LibWrap.Conversation.local_LIVESTATUS_ON_HOLD_REMOTELY)) {
                holdActionResult = conv.holdMyLiveSession();
                if (!holdActionResult) {
                    log("holdMyLiveSession() failed with result: " + holdActionResult);
                }
            }
            return holdActionResult;
        };

        var dialerAction = new Action();
        dialerAction.invoke = function (params) {
            Skype.UI.navigate("dialer", params);
        };

        var smsAction = new Action();
        smsAction.invoke = function (conv, params) {
            
            setImmediate(Skype.UI.navigate, "conversation", {
                id: conv.getIdentity(),
                smsMode: true
            });
            return true;
        };

        var removeParticipantsAction = new Action();
        removeParticipantsAction.invoke = function (conv, params) {
            var participants = Actions.getParticipantsFromConversation(conv, params.participants);
            var result = true;
            for (var i = participants.length - 1; i >= 0; i--) {
                if (!participants[i].retire()) {
                    result = false;
                }
            }
            return result;
        };
        removeParticipantsAction.isApplicable = function (conv, params) {
            if (!conv.myself) {
                return false;
            }
            var result = [LibWrap.Participant.rank_CREATOR, LibWrap.Participant.rank_ADMIN].indexOf(conv.myself.getIntProperty(LibWrap.PROPKEY.participant_RANK)) > -1;
            result = result && (conv.getIntProperty(LibWrap.PROPKEY.conversation_TYPE) !== LibWrap.Conversation.type_DIALOG);
            var participants = Actions.getParticipantsFromConversation(conv, params.participants);
            if (result) {
                for (var i = participants.length - 1; i >= 0; i--) {
                    if (participants[i].getIntProperty(LibWrap.PROPKEY.participant_RANK) == LibWrap.Participant.rank_CREATOR) {
                        result = false;
                        break;
                    }
                    ;
                }
            }
            return result;
        };

        var hangupParticipantsAction = new Action();
        hangupParticipantsAction.invoke = function (conv, params) {
            var participants = Actions.getParticipantsFromConversation(conv, params.participants);
            var result = true;
            for (var i = participants.length - 1; i >= 0; i--) {
                if (!participants[i].hangup()) {
                    result = false;
                }
            }
            return result;
        };
        hangupParticipantsAction.isApplicable = function (conv, params) {
            return conv.getStrProperty(LibWrap.PROPKEY.conversation_LIVE_HOST) === lib.myIdentity;
        };

        var leaveGroupConversationAction = new Action();
        leaveGroupConversationAction.invoke = function (conv, params) {
            var retireResult = conv.retireFrom();
            if (!retireResult) {
                log("leaveGroupConversation() failed");
            }
            return retireResult;
        };

        leaveGroupConversationAction.isApplicable = function (conv, params) {
            var caps = conv.getCapabilities();
            var canLeave = caps && caps.get(LibWrap.Conversation.capability_CAN_RETIRE);
            var isGroupChat = conv.getIntProperty(LibWrap.PROPKEY.conversation_TYPE) === LibWrap.Conversation.type_CONFERENCE;
            return isGroupChat && canLeave;
        };

        var addParticipantsAction = new Action();
        addParticipantsAction.invoke = function (outerConv, params) {
            var contactsToExclude = [], conv = lib.getConversationByIdentity(outerConv.getIdentity());

            for (var i = 0, len = conv.participants.length; i < len; i++) {
                contactsToExclude.push(conv.participants[i].participantContact.getIdentity());
            }

            Skype.UI.PeoplePicker.pickMultipleContactsAsync(Skype.Model.ContactsRepository.instance.getFilteredContacts(contactsToExclude), null, "add_participants".translate(), "aria_people_picker_window_label_participants".translate(), conv.getIdentity())
                .then(onPickerSelectionComplete);

            function onPickerSelectionComplete(conversations) {
                
                var pstnAddedCount = 0;

                if (conversations) {
                    var participants = [],
                        conversation,
                        allowed = [],
                        refused = [],
                        objID,
                        addingFromLive = params && params.addingFromLive,
                        acceptIncomingVideos = params ? params.acceptIncomingVideos : null; 

                    for (var j = 0, jLen = conversations.length; j < jLen; j++) {
                        conversation = conversations.getItem(j).data;
                        participants.push(conversation.identity);
                        
                        if (conversation.contact && conversation.contact.isPstnContact) {
                            pstnAddedCount++;
                        }
                    }
                    for (var k = 0, kLen = participants.length; k < kLen; k++) {
                        if (conv.canAddConsumersOrSpawn(new LibWrap.VectGIString([participants[k]]))) {
                            allowed.push(participants[k]);
                        } else {
                            refused.push(participants[k]);

                        }
                    }
                    if (allowed.length > 0) {
                        if (addingFromLive) {
                            params.participants = allowed;
                            if (!checkActionPolicy(conv, params, "addParticipantsAction")) {
                                roboSky.write("PeoplePicker,closed");
                                return;
                            }
                        }

                        var autoRingAddedParticipantsIfLive = true;
                        var allowedIdentities = new LibWrap.VectGIString(allowed);
                        if (conv.getIntProperty(LibWrap.PROPKEY.conversation_TYPE) == LibWrap.Conversation.type_DIALOG) {
                            objID = conv.spawnConference(allowedIdentities, autoRingAddedParticipantsIfLive);
                            if (objID) {
                                conv.discard();
                                conv = lib.getConversation(objID);
                            }
                        } else {
                            conv.addConsumers(allowedIdentities, autoRingAddedParticipantsIfLive);
                        }
                    }

                    Actions.invoke("focusConversation", conv.getIdentity(), { addContacts: { refused: refused, allowed: allowed }, goDirectlyToLive: addingFromLive, acceptIncomingVideos: acceptIncomingVideos });
                    conv.discard();
                }
                
                if (pstnAddedCount && addingFromLive) {
                    Skype.Statistics.sendStats(Skype.Statistics.event.call_addedPSTNContact, pstnAddedCount);
                }
                roboSky.write("PeoplePicker,closed");
            }
        };

        addParticipantsAction.isApplicable = function (conv, params) {
            if (!conv.myself) {
                return false;
            }
            return [LibWrap.Participant.rank_CREATOR, LibWrap.Participant.rank_ADMIN, LibWrap.Participant.rank_SPEAKER, LibWrap.Participant.rank_WRITER].indexOf(conv.myself.getIntProperty(LibWrap.PROPKEY.participant_RANK)) > -1;
        };

        var createChatAction = new Action();
        createChatAction.invoke = function () {
            Skype.UI.PeoplePicker.pickMultipleContactsAsync(Skype.Model.ContactsRepository.instance.all, null, "add_participants".translate(), "aria_people_picker_window_label_participants".translate())
                .then(function (conversations, params) {
                    if (!conversations) {
                        Skype.Statistics.sendStats(Skype.Statistics.event.hub_newChatParticipants, 0);
                        return;
                    }

                    Skype.Statistics.sendStats(Skype.Statistics.event.hub_newChatParticipants, conversations.length);

                    if (conversations.length === 1) {
                        Actions.invoke("focusConversation", conversations.getItem(0).data.identity);
                    } else {
                        var conv = lib.createConference();
                        if (!conv) {
                            log("CreateChatAction: Unable to create conference");
                            return;
                        }

                        var i, iLen, conversation,
                            participants = [],
                            allowed = [],
                            refused = [];

                        for (i = 0, iLen = conversations.length; i < iLen; i++) {
                            conversation = conversations.getItem(i).data;
                            participants.push(conversation.identity);
                        }
                        for (i = 0, iLen = participants.length; i < iLen; i++) {
                            if (conv.canAddConsumersOrSpawn(new LibWrap.VectGIString([participants[i]]))) {
                                allowed.push(participants[i]);
                            } else {
                                refused.push(participants[i]);
                            }
                        }
                        if (allowed.length > 0) {
                            var allowedIdentities = new LibWrap.VectGIString(allowed);
                            conv.addConsumers(allowedIdentities, false);
                        }

                        Actions.invoke("focusConversation", conv.getIdentity(), { addContacts: { refused: refused, allowed: allowed } });
                        conv.discard();
                    }

                });
        };

        createChatAction.isApplicable = function (conv, params) {
            return true;
        };

        var playbackVideoMessageAction = new Action();
        playbackVideoMessageAction.invoke = function (conv, params) {
            params = params || {};
            params.conversation = lib.getConversationByIdentity(conv.getIdentity()); 
            var dialog = new Skype.UI.Conversation.VideoMessageDialog(document.createElement("div"), params);
            return dialog.showAsync();
        };

        playbackVideoMessageAction.isApplicable = function (conv, params) {
            return true;
        };

        var sendVideoMessageAction = new Action();
        sendVideoMessageAction.invoke = function (conv, params) {
            var action = new Skype.Actions.SendVideoMessageAction(conv);
            var promise = action.invokeAsync();
            promise.then(function () {
                action.dispose(); 
            });
            return promise;
        };

        sendVideoMessageAction.isApplicable = function (conv, params) {
            var action = new Skype.Actions.SendVideoMessageAction(conv); 
            return action.isApplicable;
        };

        sendVideoMessageAction.isEnabled = function (conv) {
            var action = new Skype.Actions.SendVideoMessageAction(conv); 
            return action.isEnabled;
        };

        var removeFromContactsAction = new Action();
        removeFromContactsAction.invoke = function (conv, params) {
            if (conv.getIntProperty(LibWrap.PROPKEY.conversation_TYPE) === LibWrap.Conversation.type_DIALOG) {
                conv.partnerContact.setBuddyStatus(false, true);
            } else {
                conv.setBookmark(false);
            }
            conv.unPin();
        };

        removeFromContactsAction.isApplicable = function (conv, params) {
            if (conv.getIntProperty(LibWrap.PROPKEY.conversation_TYPE) === LibWrap.Conversation.type_DIALOG) {
                return conv.partnerContact.isMemberOfHardwiredGroup(LibWrap.ContactGroup.type_ALL_BUDDIES);
            } else {
                return conv.getIntProperty(LibWrap.PROPKEY.conversation_IS_BOOKMARKED);
            }
        };

        var blockContactAction = new Action();
        blockContactAction.invoke = function (conv, params) {
            if (conv.getIntProperty(LibWrap.PROPKEY.conversation_TYPE) === LibWrap.Conversation.type_DIALOG) {
                conv.partnerContact.setBlocked(true, params.spam);
                if (params.remove) {
                    conv.partnerContact.setBuddyStatus(false, true);
                    Skype.UI.navigateBack();
                }
            }
        };

        var unBlockContactAction = new Action();
        unBlockContactAction.invoke = function (conv, params) {
            if (conv.getIntProperty(LibWrap.PROPKEY.conversation_TYPE) === LibWrap.Conversation.type_DIALOG) {
                conv.partnerContact.setBlocked(false, false); 
            }
        };

        var createSendAuthRequestAction = new Action();
        createSendAuthRequestAction.invoke = function (conv, params) {
            if (params.name && params.avatarUri && params.libContact) {
                Skype.UI.Dialogs.showSendAuthRequestDialog(params.name, params.avatarUri, 400).then(function (value) {
                    if (value.result) {
                        var result = params.libContact.setBuddyStatus(true, true);
                        if (result) {
                            if (value.inputText != "") {
                                
                                result = params.libContact.sendAuthRequest(value.inputText, 0);
                            } else {
                                
                                result = params.libContact.sendAuthRequest("authrequest_placeholder".translate(params.name), 0);
                            }
                        }
                        if (!result) {
                            log("sending auth request was not successfull!");
                        }
                    }
                });
            }
        };
        createSendAuthRequestAction.isApplicable = function (conv, params) {
            return true;
        };

        var sendFilesAction = new Action();
        sendFilesAction.invoke = function (outerConv, params) {
            var conv = lib.getConversationByIdentity(outerConv.getIdentity());

            var promise = new WinJS.Promise(function (completed, error, progress) {
                var openPicker = new Windows.Storage.Pickers.FileOpenPicker();
                openPicker.viewMode = Windows.Storage.Pickers.PickerViewMode.list;
                openPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.computerFolder;
                openPicker.fileTypeFilter.replaceAll(["*"]);
                openPicker.commitButtonText = "transfer_picker_send".translate();
                openPicker.pickMultipleFilesAsync().then(function (files) {
                    if (files.size > 0) {
                        var messageGuid = Skype.Utilities.getGuid();
                        progress({ files: files, messageGuid: messageGuid }); 
                        Skype.SendingTempStorage.instance.copyFilesToTempStorage(files, conv.getObjectID()).then(function (filesInfo) {
                            var srcFilesMap = {};
                            var tmpFileNames = new LibWrap.VectGIFilename();
                            for (var i = 0; i < filesInfo.length; i++) {
                                if (!filesInfo[i]) {
                                    continue;
                                }
                                var filename = new LibWrap.Filename(filesInfo[i].tmpPath);
                                tmpFileNames.append(filename);
                                srcFilesMap[Skype.Utilities.extractLastSubfolder(filesInfo[i].tmpPath)] = filesInfo[i].srcFileAccessToken;
                            }
                            var errorFile = new LibWrap.Filename();
                            var postFilesResult = conv.postFiles(tmpFileNames, "", errorFile);
                            if (postFilesResult.error_code !== LibWrap.WrSkyLib.transfer_SENDFILE_ERROR_TRANSFER_OPEN_SUCCESS) {
                                log("postFiles failed with error " + LibWrap.WrSkyLib.transfer_SENDFILE_ERRORToString(postFilesResult.error_code));
                                error({ messageGuid: messageGuid, errorCode: postFilesResult.error_code });
                            } else {
                                Skype.SendingTempStorage.instance.onMessageSent(postFilesResult.messageObjectID, messageGuid);
                                var libMessage = lib.getConversationMessage(postFilesResult.messageObjectID);
                                if (libMessage) {
                                    Skype.FileTransfer.assignLocalFileNameFromMap(libMessage, srcFilesMap);
                                    libMessage.discard();
                                }
                                var statParam = "files={0}&receivers={1}&msgId={2}".format(filesInfo.length, conv.participants.size, postFilesResult.messageObjectID);
                                Skype.Statistics.sendStats(Skype.Statistics.event.fileTransfer_send, statParam);
                                conv.discard();
                                conv = null;
                                completed();
                            }
                        }).then(null, function (ex) {
                            log("copyFilesToTempStorage failed, exception = " + ex);
                            error({ messageGuid: messageGuid });
                            conv && conv.discard();
                        });
                    } else {
                        log("file picking cancelled");
                        conv.discard();
                    }
                });
            });
            return promise;
        };

        sendFilesAction.isApplicable = function (conv, params) {
            if (!conv) {
                return false;
            };

            var caps = conv.getCapabilities();
            if (caps && !caps.get(LibWrap.Conversation.capability_CAN_SEND_FILE)) {
                return false;
            }

            return true;
        };

        Actions.registerAction("call", callAction);
        Actions.registerAction("chat", chatAction);
        Actions.registerAction("focusConversation", focusConversationAction);
        Actions.registerAction("hangup", hangupAction);
        Actions.registerAction("reject", rejectAction);
        Actions.registerAction("answer", answerAction);
        Actions.registerAction("answerVideo", answerVideoAction);
        Actions.registerAction("callPhone", callPhoneAction);
        Actions.registerAction("home", homeAction);
        Actions.registerAction("startVideo", startVideoAction);
        Actions.registerAction("switchCamera", switchCameraAction);
        Actions.registerAction("stopVideo", stopVideoAction);
        Actions.registerAction("resume", resumeAction);
        Actions.registerAction("videoCall", videoCallAction);
        Actions.registerAction("holdCall", holdCallAction);
        Actions.registerAction("dialer", dialerAction);
        Actions.registerAction("sms", smsAction);
        Actions.registerAction("removeParticipants", removeParticipantsAction);
        Actions.registerAction("hangupParticipants", hangupParticipantsAction);
        Actions.registerAction("addParticipants", addParticipantsAction);
        Actions.registerAction("createChat", createChatAction);
        Actions.registerAction("leaveGroupConversation", leaveGroupConversationAction);
        Actions.registerAction("removeFromContacts", removeFromContactsAction);
        Actions.registerAction("blockContact", blockContactAction);
        Actions.registerAction("unBlockContact", unBlockContactAction);
        Actions.registerAction("createSendAuthRequestAction", createSendAuthRequestAction);
        Actions.registerAction("sendFilesAction", sendFilesAction);
        Actions.registerAction("playbackVideoMessage", playbackVideoMessageAction);
        Actions.registerAction("ringParticipants", ringParticipantsAction);

        Actions.registerActionNG = function (action) {
            var name = action.name;
            var ActionCtor = action;

            
            
            var actionDef = new Action();
            actionDef.invoke = function (conv, params) {
                var act = new ActionCtor(conv);
                var promise = act.invokeAsync();
                promise.then(function () {
                    act.dispose();
                });
                return promise;
            };

            actionDef.isApplicable = function (conv, params) {
                var act = new ActionCtor(conv);
                var isApplicable = act.isApplicable;
                act.dispose();
                return isApplicable;
            };

            actionDef.isEnabled = function (conv) {
                var act = new ActionCtor(conv);
                var isEnabled = act.isEnabled;
                act.dispose();
                return isEnabled;
            };
            Actions.registerAction(name, actionDef);

            
            
            
            

            
            
            

            
            

            
            
            
            
            

            
            

            
            
            

            
            
            
            
            
            Actions[name] = function () {
                var args = [];
                args.push(name);
                for (var i = 0; i < arguments.length; i++) {
                    args.push(arguments[i]);
                }
                
                return {
                    isApplicable: function () {
                        return Actions.isActionApplicable.apply(null, args);
                    },
                    isEnabled: function () {
                        return Actions.isActionEnabled.apply(null, args);
                    },
                    invoke: function () {
                        return Actions.invoke.apply(null, args);
                    }
                };
            };

            
            Actions[name.charAt(0).toUpperCase() + name.substr(1)] = ActionCtor;
        };

        Actions.registerActionNG(Skype.Actions.SendVideoMessageAction);
    }

    initActions();
}());


