

(function () {
    "use strict";
    var STATE = Skype.UI.Conversation.State,
        VIDEO_PERMISSION = Skype.UI.Conversation.VIDEO_PERMISSION;

    var liveGroupConversationVM = MvvmJS.Class.define(function (conversationWrapper, conversationSharedState, bottomHolder) {
        this._conversationIdentity = conversationWrapper.identity;
        this._conversation = conversationWrapper.libConversation;
        this._conversationWrapper = conversationWrapper;
        this.sharedState = conversationSharedState;
        this._updateProps = this._updateProps.bind(this);
        this._dialpadVM = WinJS.Binding.as({
            dialpadHistoryStr: ""
        });
        this._bottomHolder = bottomHolder;
        this._updateProps(); 
    }, {
        
        _conversationIdentity: null,
        _conversation: null,
        _conversationWrapper: null,

        
        _conversationParticipantManager: null,
        myselfVideoControl: null, 
        liveAriaRegionControl: null, 
        contextMenu: null,
        cameraMenu: null,
        participantListPanel: null,
        _messageBubbleControl: null,
        _groupAvatarControl: null,
        _callStatusControl: null,
        _dialpadVM: null,
        _bottomHolder: null,
        _dialogPlacement: {
            get: function () {
                return (this.sharedState.isChatOpenInLive && Skype.Application.state.view.isVertical) ? "bottom" : "top";
            }
        },

        
        flyoutVisible: false,
        _myselfVideoRunning: false,
        _previousImmersiveMode: false,
        _isMyselfVideoInitialized: false,

        
        _numberOfRunningVideos: 0,

        NONLIVE_STATUSES: [LibWrap.Conversation.local_LIVESTATUS_NONE, LibWrap.Conversation.local_LIVESTATUS_RECENTLY_LIVE],

        _updateMuteState: function () {
            this.showMuted = !!this._conversation.getIntProperty(LibWrap.PROPKEY.conversation_LIVE_IS_MUTED);
            this.muteIcon = this.showMuted ? '&#xE107;' : '&#xE106;';
            this.audioSwitchButtonArialLabel = this.showMuted ? "aria_call_connection_unmute".translate() : "aria_call_connection_mute".translate();
            roboSky.write("liveGroupConversationVM,AudioMuteStateChange," + (this.showMuted ? "muted" : "unmuted"));
        },

        _updateVideoAria: function () {
            if (this.myselfVideoRunning) {
                if (Skype.Video.hasMultipleCameras()) {
                    this.videoMainSwitchButtonArialLabel = "aria_call_connection_moreVideoCams".translate();
                } else {
                    this.videoMainSwitchButtonArialLabel = "aria_call_connection_video_off".translate();
                }
            } else {
                this.videoMainSwitchButtonArialLabel = "aria_call_connection_video_on".translate();
            }
        },

        _onParticipantVideoStarted: function (event) {
            var started = event.detail.started;
            this._numberOfRunningVideos += started ? 1 : -1;
            this.isReceivingVideo = this._numberOfRunningVideos > 0;
            this._checkIsVideoCall();
        },

        _showAcceptVideoNotification: function (acceptCallback, declineCallback) {
            var notification = {
                type: Skype.EventNotification.Manager.NotificationType.TWO_BUTTON_AND_TITLE,
                isTransient: false,
                isGlobal: false,
                context: "conversation" + this.sharedState.identity,
                aria: "aria_notification_notification".translate(),
                title: "notification_accept_video_header".translate(),
                text: "notification_accept_video_body".translate(),
                leftButtonLabel: "accept_video_button".translate(),
                rightButtonLabel: "decline_video_button".translate(),
                leftButtonAria: "aria_notification_accept_video_button".translate(),
                rightButtonAria: "aria_notification_decline_video_button".translate(),
                leftButtonHandler: acceptCallback,
                rightButtonHandler: declineCallback
            };

            Skype.EventNotification.Manager.instance.show(notification);
            return notification;
        },


        _onVideoAcceptedDeclined: function (accepted) {
            this.sharedState.acceptIncomingVideos = accepted ? VIDEO_PERMISSION.ACCEPTED : VIDEO_PERMISSION.DECLINED;
            this._videoRequestNotification = null;
        },

        _clearNotification: function () {
            if (this._videoRequestNotification) {
                Skype.EventNotification.Manager.instance.hide(this._videoRequestNotification);
                this._videoRequestNotification = null;
            }
        },

        _onParticipantVideoStartRequested: function () {
            this.sharedState.acceptIncomingVideos = VIDEO_PERMISSION.DECIDING;
            this._videoRequestNotification = this._showAcceptVideoNotification(this._onVideoAcceptedDeclined.bind(this, true), this._onVideoAcceptedDeclined.bind(this, false));
        },

        _onScreenShareChanged: function (event) {
            this.sharedState.isScreenShare = event.detail.started;
        },

        _onNumberOfLiveParticipantChanged: function (event) {
            if (!this.sharedState.isDialog) {
                this._callStatusControl.onNumberOfLiveParticipantsChanged(event.detail.numberOfLiveParticipant);
            }
        },

        _handleConversationPropertyChange: function (e) {
            if (e.detail[0].indexOf(LibWrap.PROPKEY.conversation_LIVE_IS_MUTED).returnValue) {
                this._updateMuteState();
            }
        },

        _onDispose: function () {
            log('LiveGroupConversationVM _onDispose()');
            Skype.SendVideoManager.instance.unregisterVideoPreviewListener(this);
            this._clearNotification();
        },

        _checkMessageInBubble: function () {
            
            var allowBubbleMessages = !this.sharedState.isChatOpenInLive &&
                 [STATE.LIVE, STATE.LIVE_HOLD_LOCAL, STATE.LIVE_HOLD_REMOTE].contains(this.sharedState.state);
            if (allowBubbleMessages) {
                this._messageBubbleControl.startListeningAsync();
            } else {
                this._messageBubbleControl.stopListeningAsync();
            }
        },

        _initializeParticipants: function () {
            
            if (!this.participantInitialized) {
                this._conversationParticipantManager.alive(); 
                this.participantInitialized = true;
            }
        },

        _updateMyselfVideo: function () {
            if (!this.myselfVideoControl) {
                log("LiveGroupConversationVM updateMyselfVideo: cannot update !");
                return;
            }
            this.myselfVideoControl.updateMyselfShowing();
            this.myselfVideoRunning = this.myselfVideoControl.isRunning();
            this._updateVideoAria();
        },

        _checkCamera: function () {
            var caps = this._conversation.getCapabilities(),
                videoDevicePresent = Skype.Application.DeviceManager.isVideoDevicePresent(),
                convoSendVideoEnabled = caps && caps.get(LibWrap.Conversation.capability_CAN_RING_VIDEO);

            this.cameraHidden = !convoSendVideoEnabled || !videoDevicePresent || (this.isLivePstn && this.sharedState.isDialog);
        },

        _updateProps: function () {
            var isDialog = this.sharedState.isDialog;
            var contactWrapper = this._conversationWrapper.contact,
                isEmergencyContact = isDialog && contactWrapper.isEmergencyContact,
                isPstnContact = isDialog && contactWrapper.isPstnContact,
                isLyncContact = isDialog && contactWrapper.isLyncContact;

            this.contextMenuHidden = isEmergencyContact || isPstnContact || isLyncContact;
            this.chatHidden = isEmergencyContact || !this.contextMenuHidden;
            this.participantListHidden = this.sharedState.isDialog;

            this._updatePartnerLiveIdentity();
            this._checkCamera();
        },

        _onNavigated: function () {
            
            this.participantListPanel && this.participantListPanel.hideAsync();
        },

        _updateFileTransferMenuItem: function () {
            var liveIdentity;
            if (this._conversation && this._conversation.partner) {
                liveIdentity = this._conversation.partner.getStrProperty(LibWrap.PROPKEY.participant_LIVE_IDENTITY);
            } else {
                liveIdentity = this._conversationIdentity;
            }
            this.fileTransferInapplicable = !Actions.isActionApplicable("sendFilesAction", liveIdentity ? liveIdentity : this._conversationIdentity); 
        },

        _closeChat: function () {
            if (this.sharedState.isChatOpenInLive) {
                this.toggleChat();
            }
        },

        _onLiveEnding: function () {
            
            
            this._initializeParticipants();
            this._dialpadVM.dialpadHistoryStr = "";
            this._closeChat();
            this.participantListPanel.hideAsync(); 
        },

        _handleVideoListChange: function () {
            this._updateVideoAria();
        },

        _updatePartnerLiveIdentity: function () {
            if (this._conversation.partner) {
                var identity = this._conversation.partner.getStrProperty(LibWrap.PROPKEY.participant_LIVE_IDENTITY);
                var type = lib.getContactType(identity);
                this.isLivePstn = [LibWrap.Contact.type_PSTN, LibWrap.Contact.type_FREE_PSTN, LibWrap.Contact.type_UNDISCLOSED_PSTN].contains(type);
            }
        },

        _handleParticipantPropertyChange: function (e) {
            var prop = e ? e.detail[0] : null;
            if (!prop) {
                return;
            }
            switch (prop) {
                case LibWrap.PROPKEY.participant_LIVESESSION_RECOVERY_IN_PROGRESS:
                    this.recoveryMode = this.sharedState.isDialog ?
                        !!this._conversation.partner.getIntProperty(LibWrap.PROPKEY.participant_LIVESESSION_RECOVERY_IN_PROGRESS) :
                        false;
                    break;
                case LibWrap.PROPKEY.participant_LIVE_IDENTITY:
                    this._updateProps();
                    break;
            }
        },

        _flyoutShowHideHandler: function (show, menu) {
            this.flyoutVisible = show;
            if (show) {
                roboSky.write("ConversationLive," + menu + ",show");
            } else {
                roboSky.write("ConversationLive," + menu + ",hide");
            }
            this.dispatchEvent(liveGroupConversationVM.Events.FlyoutVisible, { visible: show }); 
        },

        _checkIsVideoCall: function () {
            var videoRunning = this.isReceivingVideo || this.previewVisible;
            this.sharedState.hasEverBeenVideoCall = this.sharedState.hasEverBeenVideoCall || videoRunning;
            this.sharedState.isVideoCall = videoRunning;
        },

        _handleConversationWrapperPropertyChange: function (e) {
            if (e.detail == "avatarUri") {
                this._groupAvatarControl.updateAvatar();
            }
        },

        _myselfVideoInitialized: function () {
            this._isMyselfVideoInitialized = true;
            this._updateMyselfVideo();
            roboSky.write("liveGroupConversationVM,myselfVideo,initialized");
        },

        _updateSwitchingCamera: function () {
            this.isSwitchingCamera = this.myselfVideoControl.isSwitchingCamera();
        },

        _leaveActiveCall: function () {
            this.participantInitialized = false;
            this._conversationParticipantManager.handleLeaveActiveCall();
        },

        _onConversationStateChanged: function (state, previousState) {
            switch (state) {
                case STATE.LIVE_ENDING:
                case STATE.ERROR_IN_LIVE: 
                    this._onLiveEnding();
                    break;
                case STATE.LIVE:
                    this._updateFileTransferMenuItem();
                    break;
                case STATE.CHAT:
                case STATE.CHAT_CAN_JOIN:
                    this.sharedState.acceptIncomingVideos = VIDEO_PERMISSION.UNDECIDED;
                    this._clearNotification();
                    if (this.participantInitialized) {
                        this._leaveActiveCall();
                    }
                    break;
            }

            if (this.sharedState.isInFullLive) { 
                this._initializeParticipants();

                
                if (!Skype.UI.Conversation.isLiveState(previousState)) {
                    this.sharedState.hasEverBeenVideoCall = false;
                }
            } else {
                this._closeChat(); 
            }

            this.isOnHold = [STATE.LIVE_HOLD_LOCAL, STATE.LIVE_HOLD_REMOTE].contains(state);
            this._checkMessageInBubble();
        },

        _setImmersiveMode: function () {
            log("LiveGroupConversationVM setting IMMERSIVE '{0}'".format(this.sharedState.immersiveMode));
            
            if (this.sharedState.immersiveMode === this._previousImmersiveMode) {
                return;
            }
            this._previousImmersiveMode = this.sharedState.immersiveMode;

            this._callStatusControl.setVisible(!this.sharedState.immersiveMode);
        },

        _initEvents: function () {
            this._conversation.subscribePropChanges([LibWrap.PROPKEY.conversation_LIVE_IS_MUTED]);
            this.regEventListener(this._conversation, "propertieschanged", this._handleConversationPropertyChange.bind(this));
            this._conversationWrapper.alive();
            if (this._groupAvatarControl) {
                this.regEventListener(this._conversationWrapper, "propertychanged", this._handleConversationWrapperPropertyChange.bind(this));
            }

            this.forwardEvent(this._conversationParticipantManager, Skype.UI.ConversationParticipant.Events.ParticipantStreamAddedRemoved);
            this.forwardEvent(this._conversationParticipantManager, Skype.UI.ConversationParticipant.Events.VideoScreenShareStarted, this._onScreenShareChanged.bind(this));
            this.regEventListener(this._conversationParticipantManager, Skype.UI.ConversationParticipantManager.Events.NumberOfLiveParticipantChanged, this._onNumberOfLiveParticipantChanged.bind(this));
            this.regEventListener(this._conversationParticipantManager, Skype.UI.ConversationParticipant.Events.VideoStarted, this._onParticipantVideoStarted.bind(this));
            this.regEventListener(this._conversationParticipantManager, Skype.UI.ConversationParticipant.Events.VideoStartRequested, this._onParticipantVideoStartRequested.bind(this));

            this.forwardEvent(this._conversationParticipantManager, Skype.Conversation.ActiveSpeakerManager.Events.Update);

            Skype.SendVideoManager.instance.registerVideoPreviewListener(this._conversationIdentity, this);
            this.regEventListener(Skype.Application.state, "deviceListChanged", this._updateProps);
            this.regEventListener(Skype.Application.state, "navigated", this._onNavigated.bind(this));
            this.regBind(this.sharedState, "state", this._onConversationStateChanged.bind(this));
            this.regBind(this.sharedState, "immersiveMode", this._setImmersiveMode.bind(this));
            this.regEventListener(this.sharedState, Skype.UI.Conversation.ConversationStateMachine.Events.PreLiveTimeout, Actions.invoke.bind(this, "stopVideo", this._conversationIdentity));

            this.regEventListener(this._messageBubbleControl, Skype.UI.Conversation.MessageNotification.Events.Click, this.toggleChat.bind(this));
            this.regEventListener(lib, "availablevideodevicelistchange", this._handleVideoListChange.bind(this));
            this.regEventListener(this._conversationWrapper.capabilities, Skype.Model.ConversationCapabilities.Events.CapabilitiesChanged, this._checkCamera.bind(this));

            if (this._conversation.partner) { 
                this.regEventListener(this._conversation.partner, "propertychange", this._handleParticipantPropertyChange.bind(this));
            }
            this.regEventListener(this.contextMenu, "aftershow", this._flyoutShowHideHandler.bind(this, true, "contextMenu"));
            this.regEventListener(this.contextMenu, "afterhide", this._flyoutShowHideHandler.bind(this, false, "contextMenu"));
            this.regEventListener(this.cameraMenu, "aftershow", this._flyoutShowHideHandler.bind(this, true, "cameraMenu"));
            this.regEventListener(this.cameraMenu, "afterhide", this._flyoutShowHideHandler.bind(this, false, "cameraMenu"));

            this.regEventListener(this.myselfVideoControl, Skype.UI.Conversation.ConversationMyselfVideo.Events.ControlInitialized, this._myselfVideoInitialized.bind(this));
            this.regEventListener(this.myselfVideoControl, Skype.UI.Conversation.ConversationMyselfVideo.Events.PiPIsSwitching, this._updateSwitchingCamera.bind(this));
        },

        _sendStatistics: function (eventName, videoFlagNeeded) {
            var name = "call_";
            if (videoFlagNeeded) {
                name += this.sharedState.isVideoCall ? "video_" : "audio_";
            }
            name += eventName;
            if (Skype.Statistics.event[name]) {
                Skype.Statistics.sendStats(Skype.Statistics.event[name], this.sharedState.isDialog ? 1 : this._conversationParticipantManager.getLiveParticipants().length);
            }
        },

        
        init: function (messageBubbleControl, callStatusControl, groupAvatarControl) {
            
            this._conversationParticipantManager = new Skype.UI.ConversationParticipantManager(this._conversationWrapper, this.sharedState);
            this._callStatusControl = callStatusControl;
            this._messageBubbleControl = messageBubbleControl;
            this._groupAvatarControl = groupAvatarControl;

            this.participantListHidden = this.sharedState.isDialog;

            this._initEvents();

            
            this.liveAriaRegionControl.init(this._conversationParticipantManager, this.sharedState);
            this.myselfVideoControl.init(this.sharedState).then(function () {
                this._updateMuteState();
                this._updateMyselfVideo();
            }.bind(this));
        },

        updateMyselfShowing: function () { 
            this._updateMyselfVideo();
        },

        updateRibbonItemsCount: function (rosterItemsCount, presentationSpeakerCount) {
            this.rosterItemsCount = rosterItemsCount;
            this.presentationSpeakerVisible = presentationSpeakerCount > 0;
        },

        myselfVideoRunning: {
            get: function () {
                return this._myselfVideoRunning;
            },
            set: function (running) {
                this._updateSwitchingCamera();
                if (running !== this._myselfVideoRunning && this._isMyselfVideoInitialized) {
                    

                    this._myselfVideoRunning = running;
                    
                    this.cameraIcon = running ? "&#xE102;" : "&#xE103;";
                    this.previewVisible = running;
                    this._checkIsVideoCall();
                    if (this.myselfVideoRunning) {
                        this.showVideoOff = false;
                    }
                }
            }
        },

        
        muteCall: function () {
            if (this._conversation.getIntProperty(LibWrap.PROPKEY.conversation_LIVE_IS_MUTED)) {
                this._conversation.unmuteMyMicrophone();
                this._sendStatistics("muteOff", true);
            } else {
                this._conversation.muteMyMicrophone();
                this._sendStatistics("muteOn", true);
            }
        },

        sendVideo: function (evt) {
            if (this.myselfVideoRunning && Skype.Video.hasMultipleCameras()) {
                this.showCameraMenu(evt);
            } else {
                this.showVideoOff = this.myselfVideoRunning;
                this.myselfVideoRunning ? this._sendStatistics("videoDisabled") : this._sendStatistics("videoEnabled");
                Actions.invoke(this.myselfVideoRunning ? "stopVideo" : "startVideo", this._conversationIdentity);
            };
            this._updateVideoAria();
        },

        turnOffVideo: function (evt) {
            if (this.myselfVideoRunning) {
                Actions.invoke("stopVideo", this._conversationIdentity);
                this.showVideoOff = true;
                this._sendStatistics("videoDisabled");
            };
            this._updateVideoAria();
        },

        switchCamera: function () {
            if (this.myselfVideoRunning && this.myselfVideoControl) {
                this.myselfVideoControl.switchCamera();
            }
        },

        hangUp: function () {
            this._initializeParticipants(); 
            var didHangUp = Actions.invoke("hangup", [this._conversationIdentity]);
            if (!didHangUp || this.sharedState !== STATE.LIVE) {
                this.dispatchEvent(Skype.UI.LiveGroupConversation.Events.DismissLiveConversation);
            }
        },

        showDialPad: function (evt) {
            
            var promise = Skype.UI.Dialogs.showDialpadDialog(this._bottomHolder, this._conversation, this._dialpadVM, this._dialogPlacement);
            promise.eventsProvider.onAfterShow = this._flyoutShowHideHandler.bind(this, true, "dialPad");
            promise.eventsProvider.onAfterHide = this._flyoutShowHideHandler.bind(this, false, "dialPad");
        },

        showDialPadFromCallMenu: function (evt) {
            this.showDialPad();
            Skype.Statistics.sendStats(Skype.Statistics.event.call_menu_executeCommand, "showDialPad");
        },

        toggleChat: function () {
            this.participantListPanel.hideAsync(); 
            this.sharedState.isChatOpenInLive = !this.sharedState.isChatOpenInLive;
            this._checkMessageInBubble();
            this.myselfVideoControl.onChatToggled(this.sharedState.isChatOpenInLive);
        },

        toggleChatFromCallMenu: function () {
            this.toggleChat();
            Skype.Statistics.sendStats(Skype.Statistics.event.call_menu_executeCommand, "toggleChat");
        },

        showCameraMenu: function (e) {
            this.cameraMenu.show(e.currentTarget, this._dialogPlacement);
        },

        showParticipantList: function () {
            
            this.participantListPanel.showAsync(this._conversationParticipantManager, this.sharedState);

        },

        showParticipantListFromMenu: function () {
            this.showParticipantList();
            Skype.Statistics.sendStats(Skype.Statistics.event.call_menu_executeCommand, "showParticipantList");
        },

        showContextMenu: function (e) {
            this.contextMenu.show(e.currentTarget, this._dialogPlacement);
            Skype.Statistics.sendStats(Skype.Statistics.event.call_menu_show);
        },

        resume: function () {
            Actions.invoke("resume", [this._conversationIdentity]);
        },

        showAddParticipants: function () {
            Actions.invoke("addParticipants", this._conversationIdentity, { addingFromLive: true, acceptIncomingVideos: this.sharedState.acceptIncomingVideos });
            Skype.Statistics.sendStats(Skype.Statistics.event.call_menu_executeCommand, "showAddParticipants");
        },

        sendFiles: function () {
            var promise = Actions.invoke("sendFilesAction", [this._conversationIdentity]);
            this.dispatchEvent(liveGroupConversationVM.Events.FileSent, { promise: promise });

            Skype.Statistics.sendStats(Skype.Statistics.event.call_menu_executeCommand, "sendFiles");
        },

        navigateBack: function () {
            Skype.UI.navigateBack();
            Skype.Statistics.sendStats(Skype.Statistics.event.call_backButton);
        }
    }, { 
        
        cameraIcon: '&#xE103;',
        muteIcon: '&#xE106;',
        camOffMenuItemLabel: 'liveconversation_cameramenu_turnoff'.translate(),
        camSwitchMenuItemLabel: 'liveconversation_cameramenu_switch'.translate(),
        imMenuItemLabel: 'liveconversation_contextualmenu_instantmessage'.translate(),
        dialpadMenuItemLabel: 'liveconversation_contextualmenu_dialpad'.translate(),
        addParticipantsMenuItemLabel: 'plus_menu_item_add_participants'.translate(),
        sendFilesMenuItemLabel: 'plus_menu_item_send_files'.translate(),
        participantListMenuItemLabel: "liveconversation_contextualmenu_participants".translate(),

        videoMainSwitchButtonArialLabel: "",
        audioSwitchButtonArialLabel: "",

        
        previewVisible: false,
        isSwitchingCamera: false,
        contextMenuHidden: true,
        chatHidden: true,
        cameraHidden: true,
        fileTransferInapplicable: false,
        participantListHidden: true,
        showMuted: false,
        showVideoOff: false,
        isLivePstn: false,
        recoveryMode: false,
        isOnHold: false,
        isReceivingVideo: false,
        participantInitialized: false,
        rosterItemsCount: 0, 
        presentationSpeakerVisible: false,
    }, {
        Events: {
            FlyoutVisible: "FlyoutVisible",
            FileSent: "FileSent"
        }
    });

    WinJS.Namespace.define("Skype.ViewModel", {
        LiveGroupConversationVM: WinJS.Class.mix(liveGroupConversationVM, Skype.Class.disposableMixin, WinJS.Utilities.eventMixin)
    });

}());

