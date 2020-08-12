

(function () {
    "use strict";

    var START_VIDEO_STATUSES = [LibWrap.Video.status_RUNNING, LibWrap.Video.status_CHECKING_SUBSCRIPTION, LibWrap.Video.status_AVAILABLE,
        LibWrap.Video.status_RENDERING, LibWrap.Video.status_STARTING, LibWrap.Video.status_SWITCHING_DEVICE, LibWrap.Video.status_PAUSED],
        MAX_VIDEO_STREAMS_PER_PARTICIPANT = 2,
        IN_CALL_STATES = [LibWrap.Participant.voice_STATUS_SPEAKING, LibWrap.Participant.voice_STATUS_LISTENING, LibWrap.Participant.voice_STATUS_VOICE_ON_HOLD, LibWrap.Participant.voice_STATUS_VOICE_CONNECTING, LibWrap.Participant.voice_STATUS_RINGING, LibWrap.Participant.voice_STATUS_EARLY_MEDIA],
        LIVE_STATES = [LibWrap.Participant.voice_STATUS_SPEAKING, LibWrap.Participant.voice_STATUS_LISTENING, LibWrap.Participant.voice_STATUS_VOICE_ON_HOLD],
        STATE = Skype.UI.Conversation.State,
        VIDEO_PERMISSION = Skype.UI.Conversation.VIDEO_PERMISSION,
        CALL_STATUS = {
            Unknown: "UNKNOWN",
            Connecting: "CONNECTING",
            Live: "LIVE",
            OnHold: "ONHOLD",
            Ending: "ENDING"
        };

    var conversationParticipant = MvvmJS.Class.define(
        function conversationParticipant_constructor(participantId, conversationWrapper, conversationSharedState) {
            this.id = participantId;
            this._conversation = conversationWrapper.libConversation;
            this._conversationWrapper = conversationWrapper;
            this._conversationSharedState = conversationSharedState;
            this._onLeavingGroupCallTimeoutEnd = this._onLeavingGroupCallTimeoutEnd.bind(this);
        }, {
            
            _conversation: null,
            _conversationWrapper: null,
            _conversationSharedState: null,
            _videoStreams: null,
            _liveSessionVideoIDs: null,
            _liveSessionVideos: null,
            _currentlyRunningVideos: null, 
            _leavingGroupCallTimer: null,
            _videoRequestNotification: null,
            _acceptPstnNotification: null,
            _addedRecently: false,
            id: 0,
            identity: "",
            libParticipant: null,

            
            _isScreenShareRunning: false,
            _hasRunningVideo: false,
            _isAlive: false,
            _isPstn: false,
            _status: "",
            
            hasRunningVideo: {
                get: function () {
                    return this._hasRunningVideo;
                },
                set: function (value) {
                    if (value !== this._hasRunningVideo) {
                        this._hasRunningVideo = value;
                        this.dispatchEvent(conversationParticipant.Events.VideoStarted, { started: this._hasRunningVideo });
                    }
                }
            },

            isLive: {
                get: function () {
                    return [CALL_STATUS.Live, CALL_STATUS.OnHold].contains(this.status);
                }
            },
            
            status: {
                get: function () {
                    return this._status;
                },
                set: function (value) {
                    if (this._status !== value) {
                        this._status = value;
                        this.dispatchEvent(conversationParticipant.Events.StatusChanged, { participant: this, status: value});
                    }
                },
            },

            _stopVideo: function (videoSession) {
                if (!videoSession || !videoSession.isRunning) {
                    log("ConversationParticipant: couldn't stop video !" + videoSession);
                    return;
                }

                videoSession.isRunning = false;
                videoSession.videoStream.stopVideoSession(); 

                
                if (this._videoStreams.length === MAX_VIDEO_STREAMS_PER_PARTICIPANT) {

                    
                    var anyScreenShareRunning = this._currentlyRunningVideos.first(function (vidSession) {
                        return vidSession.isScreenShare;
                    });

                    var hasAnyVideoRunning = this._videoStreams.first(function (videoStream) {
                        return videoStream.hasRunningVideo();
                    });

                    if (videoSession.isScreenShare || !anyScreenShareRunning || !hasAnyVideoRunning) {
                        this._removeVideoStream(videoSession.videoStream);
                    }
                }

                this._addRemoveRunningVideo(videoSession, false);
            },

            _addRemoveRunningVideo: function (videoSession, add) {
                if (add) {
                    this._currentlyRunningVideos.push(videoSession);
                } else {
                    this._currentlyRunningVideos.removeObject(videoSession);
                }
                this.hasRunningVideo = this._currentlyRunningVideos.length > 0;
            },

            _needAnotherStream: function () {
                return this._currentlyRunningVideos.length > this._videoStreams.length;
            },

            _getFreeVideoStream: function () {
                
                
                
                

                return this._videoStreams.first(function (videoStream) {
                    return !videoStream.hasRunningVideo();
                }); 
            },

            _startVideo: function (videoSession) {
                if (!videoSession.isRunning) {
                    videoSession.isRunning = true;
                    var videoStream, promise = WinJS.Promise.as();

                    this._addRemoveRunningVideo(videoSession, true);
                    if (this._needAnotherStream()) {
                        
                        promise = this._addParticipantStream(videoSession);
                        videoStream = this._videoStreams[this._videoStreams.length - 1]; 
                    } else {
                        
                        videoStream = this._getFreeVideoStream();
                    }
                    assert(!videoStream.hasRunningVideo(), "ConversationParticipant: overriding running video !");

                    videoSession.videoStream = videoStream;
                    videoStream.onVideoSessionChanged(videoSession);

                    if (videoSession.isScreenShare && this._videoStreams.length < MAX_VIDEO_STREAMS_PER_PARTICIPANT) {
                        this._addParticipantStream(null);  
                    }

                    promise.then(function () {
                        if (this._currentlyRunningVideos.contains(videoSession)) { 
                            videoStream.startVideoSession(videoSession);
                        }
                    }.bind(this));
                }
            },

            
            
            _onConversationStateChanged: function (newState) {
                if (newState === STATE.LIVE) {
                    this._updateVideoPermission();
                }
            },

            _onScreenShareChanged: function (videoSession) {
                videoSession.isScreenShare = videoSession.libVideoObject.getIntProperty(LibWrap.PROPKEY.video_MEDIA_TYPE) === LibWrap.Video.mediatype_MEDIA_SCREENSHARING;

                if (videoSession.isScreenShare && videoSession.isRunning && this._videoStreams.length < MAX_VIDEO_STREAMS_PER_PARTICIPANT) {
                    this._addParticipantStream(null);  
                }

                if (videoSession.videoStream) { 
                    videoSession.videoStream.onVideoSessionChanged(videoSession);
                }

                if (videoSession.isScreenShare && this._isScreenShareRunning !== videoSession.isRunning) { 
                    this._isScreenShareRunning = videoSession.isRunning;
                    this.dispatchEvent(conversationParticipant.Events.VideoScreenShareStarted, { started: videoSession.isRunning });
                }
            },

            _setVideoRunning: function (startVideo, newVideoSession) {

                if (!newVideoSession || !newVideoSession.libVideoObject) {
                    log("_setVideoRunning:  Running video that was not added !");
                    return;
                }

                if (startVideo === newVideoSession.isRunning) {
                    return; 
                }

                if (startVideo) {
                    this._startVideo(newVideoSession);
                } else { 
                    this._stopVideo(newVideoSession);
                }

                if (newVideoSession.isScreenShare) { 
                    this._onScreenShareChanged(newVideoSession);
                }
            },

            _updateVideoVisibility: function () {
                this._liveSessionVideoIDs.forEach(function (id) {
                    this._handleVideoStatusChange(this._liveSessionVideos[id]);
                }.bind(this));
            },

            _canStartAnyVideo: function () {
                var videoCanBeStarted = false;
                this._liveSessionVideoIDs.forEach(function (id) {
                    videoCanBeStarted = videoCanBeStarted || START_VIDEO_STATUSES.contains(this._liveSessionVideos[id].status);
                }.bind(this));

                return videoCanBeStarted;
            },

            _updateVideoPermission: function () {
                var canStartAnyVideo = this._canStartAnyVideo(),
                    showPermissionNotification = !Skype.Model.Options.incoming_video_autostart && this._conversationSharedState.state === STATE.LIVE 
                    && this._conversationSharedState.acceptIncomingVideos === VIDEO_PERMISSION.UNDECIDED && canStartAnyVideo;

                if (showPermissionNotification) {
                    this.dispatchEvent(conversationParticipant.Events.VideoStartRequested);
                }
            },

            _handleVideoStatusChange: function (videoSession) {
                var error,
                    startVideo;

                if (!videoSession) {
                    log("_handleVideoStatusChange: Calling with NULL videoSession !");
                    return;
                }
                error = videoSession.libVideoObject.getStrProperty(LibWrap.PROPKEY.video_ERROR).trim();
                if (error) {
                    log("Video error: " + error);
                }

                videoSession.status = videoSession.libVideoObject.getIntProperty(LibWrap.PROPKEY.video_STATUS);
                log('ConversationParticipant [' + this.identity + ', ' + videoSession.libVideoObject.getObjectID() + '] video status: ' + LibWrap.Video.statustoString(videoSession.status));

                startVideo = START_VIDEO_STATUSES.contains(videoSession.status);
                this._updateVideoPermission();

                if (startVideo) {
                    if (Skype.Model.Options.incoming_video_autostart || this._conversationSharedState.acceptIncomingVideos === VIDEO_PERMISSION.ACCEPTED) {
                        this._setVideoRunning(true, videoSession);
                    } else if (this._conversationSharedState.acceptIncomingVideos === VIDEO_PERMISSION.DECLINED) {
                        videoSession.libVideoObject.stop(); 
                        this._setVideoRunning(false, videoSession);
                    }
                } else {
                    this._setVideoRunning(false, videoSession);
                }
            },

            _handleVideoPropertyChange: function (videoSession, e) {
                if (e.detail[0] === LibWrap.PROPKEY.video_STATUS) {
                    this._handleVideoStatusChange(videoSession);
                } else if (e.detail[0] === LibWrap.PROPKEY.video_MEDIA_TYPE) {
                    this._onScreenShareChanged(videoSession);
                }
            },

            _shouldDisplayPstnApproval: function (participantVoicestatus) {
                if (this._conversationSharedState.state === Skype.UI.Conversation.State.LIVE &&
                    this._isPstn &&
                    participantVoicestatus === LibWrap.Participant.voice_STATUS_VOICE_UNKNOWN &&
                    !this._acceptPstnNotification &&
                    this._addedRecently) {
                    return this._conversationWrapper.libConversation.getStrProperty(LibWrap.PROPKEY.conversation_LIVE_HOST) === lib.myIdentity;
                }
                return false;
            },

            _updateParticipantStatus: function () {
                var participantVoicestatus = this.libParticipant.getIntProperty(LibWrap.PROPKEY.participant_VOICE_STATUS);
                
                var isInCall = IN_CALL_STATES.contains(participantVoicestatus);

                var wasStreamAdded = this._videoStreams.length > 0,
                    shouldBeAdded = isInCall && !wasStreamAdded,
                    shouldBeRemoved = !isInCall && wasStreamAdded && !this._leavingGroupCallTimer,
                    shouldRejoinCall = isInCall && wasStreamAdded && !!this._leavingGroupCallTimer,
                    isOnHold = LibWrap.Participant.voice_STATUS_VOICE_ON_HOLD === participantVoicestatus,
                    isConnecting = [LibWrap.Participant.voice_STATUS_RINGING,
                                    LibWrap.Participant.voice_STATUS_EARLY_MEDIA,
                                    LibWrap.Participant.voice_STATUS_VOICE_CONNECTING].contains(participantVoicestatus),
                    isLive = LIVE_STATES.contains(participantVoicestatus),
                    
                    
                    shouldLeaveCall = wasStreamAdded && LibWrap.Participant.voice_STATUS_VOICE_STOPPED === participantVoicestatus;

                if (shouldLeaveCall || shouldRejoinCall) {
                    this._clearLeavingGroupCallTimer();
                    if (shouldLeaveCall) {
                        this._leavingGroupCallTimer = this.regTimeout(this._onLeavingGroupCallTimeoutEnd, Skype.UI.ConversationParticipant.Config.LEAVING_GROUP_CALL_TIMEOUT);
                    }
                    
                    this._setStatus(shouldRejoinCall ? (isConnecting ? conversationParticipant.CallStatus.Connecting : conversationParticipant.CallStatus.Live) : conversationParticipant.CallStatus.Ending);
                    return;
                }

                if (isOnHold) {
                    this._setStatus(conversationParticipant.CallStatus.OnHold);
                } else if (isLive) {
                    this._setStatus(conversationParticipant.CallStatus.Live);
                } else if (isConnecting) {
                    this._setStatus(conversationParticipant.CallStatus.Connecting);
                } else {
                    warn("call status is unknown (" + this.identity + ")");
                    this._setStatus(conversationParticipant.CallStatus.Unknown);
                }

                if (this._shouldDisplayPstnApproval(participantVoicestatus)) {
                    this._acceptPstnNotification = this._showAcceptPstnNotification();
                }

                if (shouldBeAdded) {
                    
                    this._addInitialParticipantStream();
                } else if (shouldBeRemoved) {
                    this._clearAllVideoStreams(); 
                }
            },

            _showAcceptPstnNotification: function () {
                var notification;
                
                if (Skype.Application.state.policy.PSTN.enabled) {
                    notification = {
                        type: Skype.EventNotification.Manager.NotificationType.TWO_BUTTON_AND_TITLE,
                        isTransient: false,
                        isGlobal: false,
                        aria: "aria_notification_notification".translate(),
                        context: "conversation" + this._conversationSharedState.identity,
                        title: "notification_pstn_heading".translate(),
                        text: "notification_adding_pstn_number".translate("<strong>" + this.name + "</strong>"),
                        leftButtonLabel: "notification_accept_pstn".translate(),
                        rightButtonLabel: "notification_decline_pstn".translate(),
                        leftButtonAria: "aria_notification_accept_pstn".translate(),
                        rightButtonAria: "aria_notification_decline_pstn".translate(),
                        leftButtonHandler: Actions.invoke.bind(this, "ringParticipants", this._conversation.getIdentity(), { participants: [this.identity], video: false }),
                        rightButtonHandler: function () { }
                    };
                } else {
                    notification = {
                        type: Skype.EventNotification.Manager.NotificationType.ICON_TEXT,
                        aria: "aria_notification_notification".translate(),
                        isTransient: true,
                        isGlobal: false,
                        icon: "&#xE600;",
                        text: "notification_adding_ecs_number".translate("<strong>" + this.name + "</strong>"),
                    };
                }

                return Skype.EventNotification.Manager.instance.show(notification);
            },

            _handleParticipantVoiceStatusChange: function () {
                var participantVoicestatus = this.libParticipant.getIntProperty(LibWrap.PROPKEY.participant_VOICE_STATUS);
                log('_handleParticipantVoiceStatusChange: ' + LibWrap.Participant.voice_STATUSToString(participantVoicestatus) + " (" + this.identity + ")");

                this._updateParticipantStatus();

                this._addedRecently = false;
            },

            _setStatus: function (status) {
                
                this.status = status;

                
                for (var j = 0; j < this._videoStreams.length; j++) {
                    this._videoStreams[j].setStatus(status);
                }
            },

            _onLeavingGroupCallTimeoutEnd: function () {
                this._clearLeavingGroupCallTimer();
                this._clearAllVideoStreams();
                roboSky.write("ConversationLive,participant,left");
            },

            _clearLeavingGroupCallTimer: function () {
                if (this._leavingGroupCallTimer) {
                    this.unregTimeout(this._leavingGroupCallTimer);
                    this._leavingGroupCallTimer = null;
                }
            },

            _handleParticipantPropertyChange: function (e) {
                if (e.detail[0] === LibWrap.PROPKEY.participant_VOICE_STATUS) {
                    this._handleParticipantVoiceStatusChange();
                }
            },

            _removeLiveVideoSession: function (liveSessionVideoId) {
                var sessionToRemove = this._liveSessionVideos[liveSessionVideoId];
                if (!sessionToRemove) {
                    log("_removeLiveVideoSession: Couldn't remove video session and properly clean it !");
                    return;
                }
                if (this._currentlyRunningVideos.contains(sessionToRemove)) {
                    
                    this._setVideoRunning(false, sessionToRemove);
                }

                this.unregObjectEventListeners(sessionToRemove.libVideoObject);
                this._liveSessionVideos[liveSessionVideoId].libVideoObject.discard();
                delete this._liveSessionVideos[liveSessionVideoId];
            },

            _addLiveVideoSession: function (liveSessionVideoId) {
                var libVideoObject = lib.getVideo(liveSessionVideoId);
                if (libVideoObject) {
                    this._liveSessionVideos[liveSessionVideoId] = {
                        libVideoObject: libVideoObject, status: null,
                        isScreenShare: libVideoObject.getIntProperty(LibWrap.PROPKEY.video_MEDIA_TYPE) === LibWrap.Video.mediatype_MEDIA_SCREENSHARING,
                        isRunning: false, objectId: liveSessionVideoId
                    };
                    this._liveSessionVideoIDs.push(liveSessionVideoId);
                    this.regEventListener(libVideoObject, "propertychange", this._handleVideoPropertyChange.bind(this, this._liveSessionVideos[liveSessionVideoId]));
                    this._handleVideoStatusChange(this._liveSessionVideos[liveSessionVideoId]); 
                }
            },

            _handleLiveSessionVideosChanged: function () {
                var videos = new LibWrap.VectUnsignedInt(),
                    i,
                    videoId,
                    newVideosIDs = [],
                    nVideos;

                
                if (!this.libParticipant.getLiveSessionVideos(videos)) {
                    
                    for (i = 0; i < this._liveSessionVideoIDs.length; i++) {
                        this._removeLiveVideoSession(this._liveSessionVideoIDs[i]);
                        this._liveSessionVideoIDs.removeAt(i--);
                    }
                    
                    if (this._videoStreams.length === MAX_VIDEO_STREAMS_PER_PARTICIPANT) {
                        this._videoStreams.removeAt(MAX_VIDEO_STREAMS_PER_PARTICIPANT - 1);
                    }
                    return;
                }

                nVideos = videos.getCount();
                for (i = 0; i < nVideos ; i++) {
                    newVideosIDs.push(videos.get(i));
                }

                
                for (i = 0; i < this._liveSessionVideoIDs.length; i++) { 
                    if (!newVideosIDs.contains(this._liveSessionVideoIDs[i])) {
                        this._removeLiveVideoSession(this._liveSessionVideoIDs[i]);
                        this._liveSessionVideoIDs.removeAt(i--);
                    }
                }

                
                for (i = 0; i < nVideos ; i++) {
                    videoId = videos.get(i);
                    if (!this._liveSessionVideoIDs.contains(videoId)) {
                        this._addLiveVideoSession(videoId);
                    }
                }
            },

            _addParticipantStream: function (videoSession) {
                log("ConversationParticipant: Creating new videoStream " + this.id);
                var wrapperDiv = document.createElement("div");
                wrapperDiv.setAttribute("data-win-control", "explicit"); 

                var videoStream = new Skype.UI.ConversationParticipantStream(wrapperDiv, {
                    sharedState: this._conversationSharedState,
                    participantId: this.id
                });
                videoStream.isScreenShare = videoSession ? videoSession.isScreenShare : false;
                this._videoStreams.push(videoStream);

                var promise = videoStream.render();
                this.regPromise(promise);
                promise.then(function () {
                    
                    if (this._videoStreams.contains(videoStream)) {
                        Skype.Video.Mockup && this.regEventListener(wrapperDiv.firstElementChild, "dblclick", this._addParticipantStream.bind(this));
                        this.dispatchEvent(conversationParticipant.Events.ParticipantStreamAddedRemoved, { added: true, participantStream: videoStream, participant: this });
                        if (!this._conversationSharedState.isDialog) {
                            this._updateParticipantStatus();
                        }
                    }
                }.bind(this));

                return promise;
            },

            _removeVideoStream: function (videoStream) {
                videoStream.onRemove();
                var removedStreams = this._videoStreams.removeObject(videoStream);
                if (removedStreams.length > 0) {
                    
                    
                    this.dispatchEvent(conversationParticipant.Events.ParticipantStreamAddedRemoved, { added: false, participantStream: videoStream, participant: this });
                }
            },

            _clearAllVideoStreams: function () {
                this._videoStreams.forEach(function (videoStream) {
                    this._removeVideoStream(videoStream);
                }.bind(this));
            },

            _onDispose: function () {
                if (this._acceptPstnNotification) {
                    Skype.EventNotification.Manager.instance.hide(this._acceptPstnNotification);
                }

                Object.keys(this._liveSessionVideos).forEach(function (liveSessionVideo) {
                    if (liveSessionVideo.libVideoObject) {
                        liveSessionVideo.libVideoObject.discard();
                        liveSessionVideo.libVideoObject = null;
                    }
                });
                this._liveSessionVideos = null;
                
                this._currentlyRunningVideos.clear();
                this._currentlyRunningVideos = null;
                this._clearAllVideoStreams();
                this._videoStreams.clear();
                this._videoStreams = null;
            },

            _handleParticipantContactPropertyChange: function (event) {
                if (event.detail.indexOf(LibWrap.PROPKEY.contact_DISPLAYNAME) != -1) {
                    this.name = this.libParticipant.participantContact.getDisplayNameHtml();
                }
            },

            _onAlive: function () {
                if (!this._isAlive && !this.isDisposed) {
                    
                    this.regEventListener(this.libParticipant, "livesessionvideoschanged", this._handleLiveSessionVideosChanged.bind(this));
                    this.regEventListener(this.libParticipant.participantContact, "propertychange", this._handleParticipantContactPropertyChange.bind(this));
                    this._handleLiveSessionVideosChanged();
                    this._isAlive = true;
                }
            },

            _addInitialParticipantStream: function () {
                
                this._addParticipantStream(null).then(this._onAlive.bind(this));
            },

            
            alive: function () {
                log("ConversationParticipant: alive()");
                if (this.libParticipant) {
                    log("ConversationParticipant: re-entrant calling not supported !");
                    return;
                }

                this._addedRecently = true;

                this.libParticipant = lib.getParticipant(this.id);
                this.name = this.libParticipant.getDisplayNameHtml();
                this.identity = this.libParticipant.participantContact.getIdentity();
                this._isPstn = [LibWrap.Contact.type_PSTN, LibWrap.Contact.type_FREE_PSTN, LibWrap.Contact.type_UNDISCLOSED_PSTN].contains(lib.getContactType(this.identity));
                this._videoStreams = [];
                this._liveSessionVideoIDs = [];
                this._liveSessionVideos = {};
                this._currentlyRunningVideos = [];

                
                this.regBind(this._conversationSharedState, "state", this._onConversationStateChanged.bind(this));
                this.regBind(this._conversationSharedState, "acceptIncomingVideos", this._updateVideoVisibility.bind(this));

                if (this._conversationSharedState.isDialog) {
                    
                    
                    this._addInitialParticipantStream();
                } else {
                    
                    this.regEventListener(this.libParticipant, "propertychange", this._handleParticipantPropertyChange.bind(this));
                    this._handleParticipantVoiceStatusChange();
                }
            },

            onRemove: function () {
                log("ConversationParticipant: onRemove()");
                this.dispose();
            },

            getId: function () {
                return this.id;
            }
        }, { 
            name: "",
        }, {
            Events: {
                ParticipantStreamAddedRemoved: "ParticipantStreamAddedRemoved",
                StatusChanged: "StatusChanged",
                VideoStarted: "VideoStarted",
                VideoScreenShareStarted: "VideoScreenShareStarted",
                VideoStartRequested: "VideoStartRequested",
            },
            CallStatus: CALL_STATUS,
            Config: {
                LEAVING_GROUP_CALL_TIMEOUT: 3000
            }
        });

    WinJS.Namespace.define("Skype.UI", {
        ConversationParticipant: WinJS.Class.mix(conversationParticipant, Skype.Class.disposableMixin, WinJS.Utilities.eventMixin)
    });

}());