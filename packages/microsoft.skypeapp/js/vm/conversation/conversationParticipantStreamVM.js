

(function () {
    "use strict";

    var VIDEO_LAYOUT_PLACEMENTS = [Skype.UI.LiveGroupConversation.LayoutPlacement.STAGE, Skype.UI.LiveGroupConversation.LayoutPlacement.PRESENTATION, Skype.UI.LiveGroupConversation.LayoutPlacement.PRESENTATION_SPEAKER];
    var PARTICIPANTSTATUSLABELMAP = {
            CONNECTING: "liveconversation_gvc_participant_connecting".translate(),
            LIVE: "",
            ONHOLD: "liveconversation_gvc_participant_onhold".translate(),
            ENDING: "liveconversation_gvc_participant_left".translate()
        },
        RECOVERING_VIDEO_STATES = [LibWrap.Video.status_PAUSED, LibWrap.Video.status_STARTING];
    var conversationParticipantStreamVM = WinJS.Class.mix(MvvmJS.Class.define(function (sharedState, avatarContainer) {
        this._sharedState = sharedState;
        this._avatarContainer = avatarContainer;
        this._updateVideoRenderingVisibility = this._updateVideoRenderingVisibility.bind(this);
    }, {

        _avatarContainer: null,

        
        _sharedState: null,
        _libParticipant: null,
        libVideoObject: null,
        videoObjectId: null,

        _unsubscribeTimeout: null,
        _isVideoPermitted: true,

        
        _avatar: null,
        _avatarSubscription: null,

        _startVideo: function () {
            var videoSrc = this.libVideoObject.getVideoSrc();
            this.libVideoObject.start();
            this._log("video status: available, setting src '{0}' on video element and playing".format(videoSrc));
            this.dispatchEvent(conversationParticipantStreamVM.Events.VideoStarted, { play: true, videoSrc: videoSrc });
        },

        _stopVideo: function () {
            this._log("video status: stopping video");
            this.dispatchEvent(conversationParticipantStreamVM.Events.VideoStarted, { play: false });
        },

        _handleVideoAspectRatioChanged: function (videoObjectID) {
            if (this.videoObjectId == videoObjectID) {
                log("conversationParticipantStreamVM _handleVideoAspectRatioChanged videoObjectId: {0}".format(videoObjectID));
                this.isVideoVisible = true;
                roboSky.write("Conversation,incomingVideo,DISPLAYED");
            }
        },

        _setVideoRunning: function (isRunning) {
            if (this.isVideoRunning !== isRunning) {
                this.isVideoRunning = isRunning;
                if (isRunning) {
                    this._startVideo();
                } else {
                    this._stopVideo();
                    this.isVideoVisible = false;
                }
            }
        },

        
        _log: function (logline) {
            var participantIdentity = this._avatar ? this._avatar.identity : "";
            log("ConversationParticipantStreamVM-{0}: {1}".format(participantIdentity, logline));
        },

        _updateVideoRenderingVisibility: function () {
            if (!this.libVideoObject || !this.isVideoRunning) {
                return;
            }
            var shouldBeVisible = this._isVideoPermitted && Skype.Application.state.isApplicationActive && !Skype.Application.state.isPeoplePickerOpened;
            var timeout = (this._sharedState.layout === Skype.UI.Conversation.ConversationLayoutManager.Layout.PINNED) ? Skype.ViewModel.ConversationParticipantStreamVM.VIDEO_PINNED_UNSUBSCRIBE_TIMEOUT : Skype.ViewModel.ConversationParticipantStreamVM.VIDEO_UNSUBSCRIBE_TIMEOUT;
            var videoUnsubsriptionEnabled = timeout >= 0;
            
            if (videoUnsubsriptionEnabled) {
                if (shouldBeVisible) {
                    if (this._unsubscribeTimeout) {
                        this.unregTimeout(this._unsubscribeTimeout);
                        this._unsubscribeTimeout = null;
                    } else {
                        this.libVideoObject.setIncomingTransmissionsDesired(true);
                    }
                } else {
                    if (!this._unsubscribeTimeout) {
                        this._unsubscribeTimeout = this.regTimeout(function () {
                            this.libVideoObject.setIncomingTransmissionsDesired(false);
                            this._unsubscribeTimeout = null;
                        }.bind(this), timeout);
                    }
                }
            }
        },

        _onDispose: function () {
            this._libParticipant.discard();
        },

        _handleParticipantContactPropertyChange: function (event) {
            if (event.detail.indexOf(LibWrap.PROPKEY.contact_DISPLAYNAME) != -1) {
                this.participantName = this._libParticipant.participantContact.getDisplayNameHtml();
            }
        },

        _handleLibParticipantPropertyChange: function (event) {
            if (this._sharedState.isDialog) {
                
                return;
            }
            if (event.detail[0] === LibWrap.PROPKEY.participant_SOUND_LEVEL) {
                var participant = event.target; 
                var level = participant.getIntProperty(LibWrap.PROPKEY.participant_SOUND_LEVEL);
                this.isSpeaking = level > conversationParticipantStreamVM.SOUND_LEVEL_TRESHOLD;
            }
        },

        _handleVideoStatusChange: function () {
            if (this.libVideoObject) {
                var videoStatus = this.libVideoObject.getIntProperty(LibWrap.PROPKEY.video_STATUS);
                this.isRecovering = RECOVERING_VIDEO_STATES.contains(videoStatus);
            }
        },

        _handleVideoPropertyChange: function (e) {
            if (e.detail[0] === LibWrap.PROPKEY.video_STATUS) {
                this._handleVideoStatusChange();
            }
        },

        


        init: function (participantId) {
            log("ConversationParticipantStreamVM: init()");

            
            this._libParticipant = lib.getParticipant(participantId);
            var participantIdentity = this._libParticipant.participantContact.getIdentity();
            this.participantName = this._libParticipant.participantContact.getDisplayNameHtml();

            this.regEventListener(lib, "videoaspectratiochanged", this._handleVideoAspectRatioChanged.bind(this));
            this.regBind(Skype.Application.state, "isApplicationActive", this._updateVideoRenderingVisibility);
            this.regBind(Skype.Application.state, "isPeoplePickerOpened", this._updateVideoRenderingVisibility);

            
            this._avatar = new Skype.UI.Avatar(this._avatarContainer, { identity: participantIdentity });
            this._avatar.updateAvatar();
            this._avatarSubscription = Skype.Model.AvatarUpdater.instance.subscribe(this._sharedState.identity, this._avatar.updateAvatar.bind(this._avatar));
            this.regEventListener(this._libParticipant, "propertychange", this._handleLibParticipantPropertyChange.bind(this));
            this.regEventListener(this._libParticipant.participantContact, "propertychange", this._handleParticipantContactPropertyChange.bind(this));
        },

        startVideoSession: function (videoSession) {
            this.libVideoObject = videoSession.libVideoObject;
            this.videoObjectId = this.libVideoObject.getObjectID();
            this.regEventListener(this.libVideoObject, "propertychange", this._handleVideoPropertyChange.bind(this));
            this._setVideoRunning(true);
        },

        stopVideoSession: function () {
            if (this._unsubscribeTimeout) {
                this.unregTimeout(this._unsubscribeTimeout);
                this._unsubscribeTimeout = null;
            }
            this.unregObjectEventListeners(this.libVideoObject);
            this.isRecovering = false;
            this._setVideoRunning(false);
            this.libVideoObject = null;
        },

        videoError: function (e) {
            Skype.Video.outputVideoError(e, "ConversationParticipantStreamVM", this.libVideoObject);
        },

        setUIPosition: function (layoutPlacement) {
            this._isVideoPermitted = VIDEO_LAYOUT_PLACEMENTS.contains(layoutPlacement);
            this._updateVideoRenderingVisibility();
        },

        setStatus: function (status) {
            this.participantStatus = status;
            this.updateparticipantStatusLabel(status);
        },

        updateparticipantStatusLabel: function (status) {
            this.participantStatusLabel = PARTICIPANTSTATUSLABELMAP[status];
        },

        updateFocus: function (focusable, pinned) {
            if (!focusable) {
                this.participantLabel = "";
                return;
            }

            this.participantLabel = pinned ? "aria_participant_name_unpin".translate(this.participantName) : "aria_participant_name_pin".translate(this.participantName);
        }


    }, { 
        isVideoRunning: false,
        isVideoVisible: false,
        isRecovering: false,
        isSpeaking: false,
        participantName: "",
        participantLabel: "",
        participantStatus: "",
        participantStatusLabel: "",
    }, {
        SOUND_LEVEL_TRESHOLD: 4, 
        VIDEO_UNSUBSCRIBE_TIMEOUT: 0,
        VIDEO_PINNED_UNSUBSCRIBE_TIMEOUT: 10000,

        Events: {
            VideoStarted: "VideoStarted"
        },

    }), WinJS.Utilities.eventMixin);

    WinJS.Namespace.define("Skype.ViewModel", {
        ConversationParticipantStreamVM: WinJS.Class.mix(conversationParticipantStreamVM, Skype.Class.disposableMixin)
    });

}());