

(function () {
    "use strict";

    ///<disable>JS2028</disable>
    

    
    ///<enable>JS2028</enable>


    var videoStateMachine = WinJS.Class.mix(MvvmJS.Class.define(function () {
        this._onVideoPropertyChanged = this._onVideoPropertyChanged.bind(this);
        this._onConversationPropertiesChanged = this._onConversationPropertiesChanged.bind(this);
    }, {
        _status: false,

        _id: "",
        _video: null,
        _videoDeviceName: "",

        _conversation: null,
        _conversationIdentity: "",

        _loggedVideoStatus: -1,

        NONLIVE_STATUSES: [LibWrap.Conversation.local_LIVESTATUS_NONE, LibWrap.Conversation.local_LIVESTATUS_RECENTLY_LIVE, LibWrap.Conversation.local_LIVESTATUS_OTHERS_ARE_LIVE, LibWrap.Conversation.local_LIVESTATUS_OTHERS_ARE_LIVE_FULL],

        
        _onVideoStatusChanged: function () {
            var videoStatus = this._video.getIntProperty(LibWrap.PROPKEY.video_STATUS);

            if (this._loggedVideoStatus != videoStatus) {
                log("VideoStateMachine[{0}]: _onVideoStatusChanged: video({1}) status: {2}"
                    .format(this._id, this._video.getObjectID(), LibWrap.Video.statustoString(videoStatus)));
                this._loggedVideoStatus = videoStatus;

                var newStatus = this._videoTransition(videoStatus);
                if (newStatus) {
                    this._changeStatus(newStatus);
                }
            }
        },

        _onVideoError: function () {
            var videoError = this._video.getStrProperty(LibWrap.PROPKEY.video_ERROR);
            if (videoError) {
                log("VideoStateMachine[{0}]: _onVideoError: video({1}) error: {2}".format(this._id, this._video.getObjectID(), videoError));
            }
        },

        _onVideoPropertyChanged: function (event) {
            if (event.detail.contains(LibWrap.PROPKEY.video_ERROR)) {
                this._onVideoError();
            }

            if (event.detail.contains(LibWrap.PROPKEY.video_STATUS)) {
                this._onVideoStatusChanged();
            }
        },

        _assignConversation: function (conversation) {
            var isFirstAssigment = true;

            if (this._conversation) {
                log("VideoStateMachine[{0}]: disposing previous conversation".format(this._id));
                this.unregObjectEventListeners(this._conversation);
                this._conversation.discard();
                isFirstAssigment = false;
            }

            this._conversation = conversation;
            this._conversationIdentity = conversation.getIdentity();
            this._id = this._conversationIdentity + " - " + this._videoDeviceName;
            log("VideoStateMachine[{0}]: _assignConversation".format(this._id));

            this._conversation.subscribePropChanges([LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS]);
            this.regEventListener(this._conversation, "propertieschanged", this._onConversationPropertiesChanged);
            if (isFirstAssigment) {
                
                this.regEventListener(this._conversation, "spawnedconference", this._handleSpawnConference.bind(this));
                this._onConversationPropertiesChanged();
            }
        },

        _handleSpawnConference: function (e) {
            log("VideoStateMachine[{0}]: _handleSpawnConference".format(this._id));

            var newConversation = lib.getConversation(e.detail[0]);
            if (newConversation) {
                this._assignConversation(newConversation);
            }
        },

        _onConversationPropertiesChanged: function () {
            if (!this._conversation) {
                log("VideoStateMachine[{0}] getting listener for empty conversation !".format(this._id));
                return;
            }

            var liveStatus = this._conversation.getIntProperty(LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS);

            log("VideoStateMachine[{0}]: _onConversationPropertiesChanged, live status: {1}".format(this._id, LibWrap.Conversation.local_LIVESTATUSToString(liveStatus)));

            if (this._status && this._status !== Skype.Video.StateMachine.VideoState.OFF && this.NONLIVE_STATUSES.contains(liveStatus)) {
                log("VideoStateMachine[{0}] quitting session ...".format(this._id));
                this.discard(); 
                this.dispatchEvent(Skype.Video.StateMachine.Events.SessionFinished, this);
                return;
            }

            var newStatus = this._conversationTransition(liveStatus);
            if (newStatus) {
                this._changeStatus(newStatus);

                
                if (this._status === Skype.Video.StateMachine.VideoState.STARTING) {
                    this._onVideoStatusChanged();
                }
            }
        },

        _startAttachedVideo: function () {
            var videos = new LibWrap.VectUnsignedInt();
            var video;
            this._conversation.myself.getLiveSessionVideos(videos);

            for (var j = 0; j < videos.getCount() ; j++) {
                video = lib.getVideo(videos.get(j));
                if (video && video.getVideoDeviceHandle() === this._videoDeviceName) {
                    if (!this._video || this._video.getObjectID() !== video.getObjectID()) {
                        if (this._video) {
                            log("VideoStateMachine[{0}]: switching from {1} to {2}".format(this._id, this._video.getVideoDeviceHandle(), video.getVideoDeviceHandle()));
                            this._video.discard();
                        }
                        this._video = video;  
                        this.regEventListener(this._video, "propertychange", this._onVideoPropertyChanged);
                    }
                    return true;  
                }
                video.discard();
            }
            return false;
        },

        _startNewVideo: function () {
            this._video = lib.createLocalVideo(this._videoDeviceName);

            if (!this._video) {
                return false;
            }

            if (this._conversation.attachVideoToLiveSession(this._video.getObjectID())) {
                this.regEventListener(this._video, "propertychange", this._onVideoPropertyChanged);
                return true;
            } else {
                this._video.discard();
                this._video = null;
                return false;
            }
        },

        
        _changeStatus: function (newStatus) {
            var oldStatus = this._status;

            if (newStatus === Skype.Video.StateMachine.VideoState.STOP_ERR) {
                if (this._video) {
                    this._video.stop();
                    return;  
                }
            }

            if (newStatus === Skype.Video.StateMachine.VideoState.STARTING) {
                if (!this._video) {
                    if (this._startAttachedVideo()) {
                        newStatus = Skype.Video.StateMachine.VideoState.READY;
                    } else if (!this._startNewVideo()) {
                        log("VideoStateMachine[{0}] ERROR - Cannot open video device".format(this._id));
                        newStatus = Skype.Video.StateMachine.VideoState.UNRECOVERABLE_ERR;
                    }
                } else {
                    newStatus = Skype.Video.StateMachine.VideoState.READY;
                }
                if (newStatus != Skype.Video.StateMachine.VideoState.STARTING) {
                    log("VideoStateMachine[{0}]: auto-replacing status {1} by {2}; video: {3}".format(this._id, Skype.Video.StateMachine.VideoState.STARTING, newStatus, !!this._video ? "set" : "null"));
                }
            } else if (newStatus === Skype.Video.StateMachine.VideoState.UNRECOVERABLE_ERR) {
                if (this._video) {
                    this.unregEventListener(this._video, "propertychange", this._onVideoPropertyChanged);
                    this._video.discard();
                    this._video = null;
                }
            }

            log("VideoStateMachine[{0}]: changing status from {1} to {2}; video: {3}".format(this._id, oldStatus, newStatus, !!this._video ? "set" : "null"));
            this._status = newStatus;

            if (newStatus !== Skype.Video.StateMachine.VideoState.OFF || oldStatus) {
                roboSky.write("Conversation,outgoingVideo," + newStatus);
                this.dispatchEvent(Skype.Video.StateMachine.Events.StatusChanged, this);
            }
        },

        
        _videoTransition: function (videoStatus) {
            switch (this._status) {
                case Skype.Video.StateMachine.VideoState.STARTING:
                    switch (videoStatus) {
                        case LibWrap.Video.status_AVAILABLE:
                        case LibWrap.Video.status_CHECKING_SUBSCRIPTION: return Skype.Video.StateMachine.VideoState.READY;
                        case LibWrap.Video.status_NOT_AVAILABLE: return Skype.Video.StateMachine.VideoState.UNRECOVERABLE_ERR;
                    }
                    return false;
                case Skype.Video.StateMachine.VideoState.READY:
                    switch (videoStatus) {
                        case LibWrap.Video.status_RENDERING:
                        case LibWrap.Video.status_RUNNING: return Skype.Video.StateMachine.VideoState.RUNNING;
                        case LibWrap.Video.status_NOT_AVAILABLE:
                        case LibWrap.Video.status_NOT_STARTED: return Skype.Video.StateMachine.VideoState.UNRECOVERABLE_ERR;
                        case LibWrap.Video.status_AVAILABLE: return Skype.Video.StateMachine.VideoState.STOPPED; 
                        case LibWrap.Video.status_REJECTED: return Skype.Video.StateMachine.VideoState.DECLINED;
                        case LibWrap.Video.status_PAUSED: return Skype.Video.StateMachine.VideoState.PAUSED;
                    }
                    
                    return false;

                case Skype.Video.StateMachine.VideoState.RUNNING:
                    switch (videoStatus) {
                        case LibWrap.Video.status_AVAILABLE: return Skype.Video.StateMachine.VideoState.CONN_ERR;
                        case LibWrap.Video.status_NOT_AVAILABLE: return Skype.Video.StateMachine.VideoState.UNRECOVERABLE_ERR;
                        case LibWrap.Video.status_UNKNOWN: return Skype.Video.StateMachine.VideoState.STOPPED;  
                        case LibWrap.Video.status_PAUSED: return Skype.Video.StateMachine.VideoState.PAUSED;
                    }
                    return false;

                case Skype.Video.StateMachine.VideoState.PAUSED:
                    switch (videoStatus) {
                        case LibWrap.Video.status_AVAILABLE: return Skype.Video.StateMachine.VideoState.STARTING;
                        case LibWrap.Video.status_RENDERING:
                        case LibWrap.Video.status_RUNNING:
                        case LibWrap.Video.status_STARTING: return Skype.Video.StateMachine.VideoState.RUNNING;
                        case LibWrap.Video.status_UNKNOWN: return Skype.Video.StateMachine.VideoState.STOPPED;  
                    }
                    return false;

                case Skype.Video.StateMachine.VideoState.STOPPING:
                    switch (videoStatus) {
                        case LibWrap.Video.status_AVAILABLE:
                        case LibWrap.Video.status_UNKNOWN:
                        case LibWrap.Video.status_NOT_STARTED: return Skype.Video.StateMachine.VideoState.STOPPED;
                        case LibWrap.Video.status_NOT_AVAILABLE: return Skype.Video.StateMachine.VideoState.UNRECOVERABLE_ERR;
                        case LibWrap.Video.status_STARTING:
                        case LibWrap.Video.status_RUNNING:
                        case LibWrap.Video.status_RENDERING: return Skype.Video.StateMachine.VideoState.STOP_ERR;
                    }
                    return false;

                case Skype.Video.StateMachine.VideoState.STOPPED:
                    if ([LibWrap.Video.status_STARTING, LibWrap.Video.status_RENDERING, LibWrap.Video.status_RUNNING].contains(videoStatus)) {
                        return Skype.Video.StateMachine.VideoState.RUNNING;
                    }
                    return false;

                case Skype.Video.StateMachine.VideoState.CONN_ERR:
                    if (videoStatus == LibWrap.Video.status_RUNNING) {
                        return Skype.Video.StateMachine.VideoState.RUNNING;
                    }
                    return false;
                default:  
                    return false;
            }
        },

        
        _conversationTransition: function (liveStatus) {
            switch (this._status) {
                case false:
                    
                    if (liveStatus == LibWrap.Conversation.local_LIVESTATUS_IM_LIVE) {  
                        return Skype.Video.StateMachine.VideoState.STARTING;
                    }
                    if (!this.NONLIVE_STATUSES.contains(liveStatus)) {
                        return Skype.Video.StateMachine.VideoState.RINGING;
                    }
                    return Skype.Video.StateMachine.VideoState.OFF;
                case Skype.Video.StateMachine.VideoState.OFF:
                    if (liveStatus == LibWrap.Conversation.local_LIVESTATUS_IM_LIVE) {  
                        return Skype.Video.StateMachine.VideoState.STARTING;
                    }
                    if (!this.NONLIVE_STATUSES.contains(liveStatus)) {
                        return Skype.Video.StateMachine.VideoState.RINGING;
                    }
                    return false;
                case Skype.Video.StateMachine.VideoState.RINGING:
                    if (liveStatus == LibWrap.Conversation.local_LIVESTATUS_IM_LIVE) {
                        return Skype.Video.StateMachine.VideoState.STARTING;
                    }
                    return false;
                case Skype.Video.StateMachine.VideoState.CONN_ERR:
                    
                default:
                    return false;
            }
        },

        
        video: {
            get: function () {
                return this._video;
            }
        },

        videoDevice: {
            get: function () {
                return this._videoDeviceName;
            }
        },

        conversation: {
            get: function () {
                return this._conversation;
            }
        },

        conversationIdentity: {
            get: function () {
                return this._conversationIdentity;
            }
        },

        status: {
            get: function () {
                return this._status;
            }
        },

        init: function (conversation, videoDevice) {
            
            
            

            log("VideoStateMachine init");
            this._videoDeviceName = videoDevice;
            this._assignConversation(conversation);
        },

        stopVideo: function () {
            
            
            

            
            if (this._status === Skype.Video.StateMachine.VideoState.STOPPING) {
                return;
            }

            
            if ((this._status == Skype.Video.StateMachine.VideoState.READY ||
                this.status == Skype.Video.StateMachine.VideoState.RUNNING ||
                this.status == Skype.Video.StateMachine.VideoState.PAUSED)) {
                this._changeStatus(Skype.Video.StateMachine.VideoState.STOPPING);
            } else {
                if (this._status != Skype.Video.StateMachine.VideoState.STOPPED) {
                    this._changeStatus(Skype.Video.StateMachine.VideoState.STOPPED);
                }
            }

            if (this._video) {
                log("VideoStateMachine[{0}] stopping video".format(this._id));
                this._video.stop();
            }
        },

        startVideo: function () {
            
            
            

            if (this._status != Skype.Video.StateMachine.VideoState.DECLINED &&
                this._status != Skype.Video.StateMachine.VideoState.RINGING &&
                this._status != Skype.Video.StateMachine.VideoState.STARTING) {
                this._changeStatus(Skype.Video.StateMachine.VideoState.STARTING);
            }
        },

        discard: function () {
            log("VideoStateMachine[{0}] discard".format(this._id));
            if (this._video) {
                this.unregEventListener(this._video, "propertychange", this._onVideoPropertyChanged);
                log("VideoStateMachine[{0}] stopping video".format(this._id));
                this._video.stop();
                this._video.discard();
                this._video = null;
            }
            if (this._conversation) {
                this.unregEventListener(this._conversation, "propertieschanged", this._onConversationPropertiesChanged);
                this._conversation.discard();
                this._conversation = null;
            }
        },
    },
    
    {}, { 
        STOP_VIDEO_TIMEOUT: 3000,

        VideoState: {
            OFF: "OFF",                              
            RINGING: "RINGING",                      
            STARTING: "STARTING",                    
            READY: "READY",                          
            RUNNING: "RUNNING",                      
            PAUSED: "PAUSED",                        
            STOPPING: "STOPPING",                    
            UNRECOVERABLE_ERR: "UNRECOVERABLE_ERR",  
            DECLINED: "DECLINED",                    
            STOPPED: "STOPPED",                      
            CONN_ERR: "CONN_ERR",                    
            STOP_ERR: "STOP_ERR"                     
        },

        Events: {
            SessionFinished: "SessionFinished",
            StatusChanged: "StatusChanged"
        }

    }
    ), WinJS.Utilities.eventMixin);

    WinJS.Namespace.define("Skype.Video", {
        StateMachine: WinJS.Class.mix(videoStateMachine, Skype.Class.disposableMixin)
    });
})();
