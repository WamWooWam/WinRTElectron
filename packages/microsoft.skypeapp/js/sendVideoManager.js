

(function (Skype) {
    "use strict";

    var sendVideoManager = MvvmJS.Class.define(function () {
    }, {

        _conversationsSessions: null,
        _previewVideos: null,
        _listeners: null,
        _switchingCamera: false,
        RUNNING_VIDEO_STATUSES: [LibWrap.Video.status_STARTING, LibWrap.Video.status_RENDERING, LibWrap.Video.status_RUNNING, LibWrap.Video.status_CHECKING_SUBSCRIPTION], 

        _handleLogin: function () {
            this.regEventListener(lib, "availablevideodevicelistchange", this._handleVideoListChange);
        },

        _handlelogout: function () {
            this.unregEventListener(lib, "availablevideodevicelistchange", this._handleVideoListChange);
        },

        _handleVideoListChange: function () {
            var activeVideoDevice = lib.getActiveVideoDeviceHandle();
            var activeDevicesList = lib.getVideoDeviceHandles(), videoDevice;

            
            for (var i = this._conversationsSessions.length - 1; i >= 0; i--) {
                videoDevice = this._conversationsSessions[i].videoDevice;
                
                if (!activeDevicesList.indexOf(videoDevice).returnValue) {
                    if (activeVideoDevice) {
                        this.switchSendingCamera(this._conversationsSessions[i].conversationIdentity, activeVideoDevice);
                    } else {
                        this._notifyListener(this._conversationsSessions[i].conversationIdentity);
                    }
                }
            }
            Skype.Application.state.deviceListChanged.dispatch();
        },

        _getCachedConversationSession: function (conversationIdentity, videoDevice) {
            return this._conversationsSessions.first(function (item) {
                return item.conversationIdentity === conversationIdentity && (!videoDevice || item.videoDevice === videoDevice);
            });
        },

        _getConversationVideoDeviceHandle: function (conversationIdentity) {
            var conversation = lib.getConversationByIdentity(conversationIdentity);
            var videos, video, status, device = "";

            if (conversation && conversation.myself) {
                videos = new LibWrap.VectUnsignedInt();
                conversation.myself.getLiveSessionVideos(videos); 

                
                for (var j = 0; j < videos.getCount() ; j++) {
                    video = lib.getVideo(videos.get(j));
                    if (video) {
                        status = video.getIntProperty(LibWrap.PROPKEY.video_STATUS);
                        if (this.RUNNING_VIDEO_STATUSES.contains(status)) {
                            device = video.getVideoDeviceHandle();
                            video.discard();
                            break;
                        }
                        video.discard();
                    }
                }
            }
            conversation && conversation.discard();
            return device;
        },

        _getListener: function (conversationIdentity) {
            var listenerIndex = this._listeners.index(function (item) {
                return item.identity === conversationIdentity;
            });
            return listenerIndex > -1 ? this._listeners[listenerIndex] : null;
        },

        _notifyListener: function (conversationIdentity) {
            var clistener = this._getListener(conversationIdentity);

            if (clistener && clistener.listener.updateMyselfShowing) {
                clistener.listener.updateMyselfShowing(); 
            }
        },

        _removeConversationSession: function (evt) {
            var session = evt.detail;
            if (session) {
                session.discard();
                this.unregObjectEventListeners(session);
                this._conversationsSessions.removeObject(session);
                this._notifyListener(session.conversationIdentity);
            }
        },

        _addConversationSession: function (conversationIdentity, conversation, videoDevice) {
            
            log("sendVideoManager _addConversationSession(): conversationIdentity{0}, videoDevice{1} ".format(conversationIdentity, videoDevice));

            if (this._getCachedConversationSession(conversationIdentity, videoDevice)) {
                
                log("sendVideoManager _addConversationSession(): WARNING. session already exist !");
                return;
            }

            var session = new Skype.Video.StateMachine();
            this.regEventListener(session, Skype.Video.StateMachine.Events.SessionFinished, this._removeConversationSession.bind(this));
            this.regEventListener(session, Skype.Video.StateMachine.Events.StatusChanged, this._handleVideoStatusChanged.bind(this));
            this._conversationsSessions.push(session);
            session.init(conversation, videoDevice);
        },

        _handleVideoStatusChanged: function (evt) {
            var session = evt.detail;
            if (!session) {
                log("ERROR sendVideoManager _null session !");
                return;
            }

            log("sendVideoManager _handleVideoStatusChanged(): " + session.videoDevice);
            if (session.status === Skype.Video.StateMachine.VideoState.READY) {
                if (!session.video) {
                    log("ERROR sendVideoManager _null video, trying to recover !");
                    session.startVideo();
                    return;
                }
                log("sendVideoManager video.start() -" + session.videoDevice);
                session.video.start();
            } else if (session.status === Skype.Video.StateMachine.VideoState.STOPPED) {
                session.stopVideo();  
                this._removeConversationSession({ detail: session });
                return;
            }

            
            if (session.status !== Skype.Video.StateMachine.VideoState.UNRECOVERABLE_ERR) {
                this._notifyListener(session.conversationIdentity);
            }
        },

        _getDeviceOrientation: function (videoDeviceHandle) {
            if (!videoDeviceHandle) {
                log("_getDeviceOrientation: NULL input.");
                return null;
            }

            var videoObject = this.getVideoObjectByDeviceHandle(videoDeviceHandle);
            if (!videoObject) {
                log("_getDeviceOrientation: couldn't get video object !");
                return null;
            }
            return videoObject.getOrientation();
        },

        

        init: function () {
            
            
            
            this._conversationsSessions = [];
            this._previewVideos = [];
            this._listeners = [];

            this._handleVideoListChange = this._handleVideoListChange.bind(this);

            var loginHandlerManager = Skype.Application.LoginHandlerManager;

            this.regEventListener(loginHandlerManager.instance, loginHandlerManager.Events.LOGIN_READONLY, this._handleLogin.bind(this));
            this.regEventListener(loginHandlerManager.instance, loginHandlerManager.Events.LOGOUT, this._handlelogout.bind(this));
        },

        startSendingVideo: function (conversationIdentity, videoDevice) {
            
            
            
            
            
            
            
            
            

            if (!conversationIdentity) {
                log("sendVideoManager startSendingVideo() empty conversationIdentity - ERROR");
                return;
            }

            if (!videoDevice) {
                videoDevice = lib.getActiveVideoDeviceHandle();
            }
            if (!videoDevice) {
                log("sendVideoManager startSendingVideo() empty active video device - ERROR");
                return;
            }

            log("sendVideoManager startSendingVideo() - " + conversationIdentity + ", " + videoDevice);
            
            var prevConversationSession = this._getCachedConversationSession(conversationIdentity, videoDevice);
            if (prevConversationSession) {
                prevConversationSession.startVideo();
                return;
            }

            var conversation = lib.getConversationByIdentity(conversationIdentity); 
            if (!conversation) {
                log("sendVideoManager couldn't get conversation !");
                return;
            }

            if (!this._getCachedConversationSession(conversationIdentity)) {
                this._addConversationSession(conversationIdentity, conversation, videoDevice);
            } else {
                
                this.stopSendingVideo(conversationIdentity,
                    this._addConversationSession.bind(this, conversationIdentity, conversation, videoDevice));
            }
        },

        stopSendingVideo: function (conversationIdentity, stopCompleted) {
            
            
            
            
            
            
            
            
            

            log("sendVideoManager stopSendingVideo - " + conversationIdentity);

            if (!conversationIdentity) {
                log("sendVideoManager stopSendingVideo() empty conversationIdentity - ERROR");
                return false;
            }

            var session = this._getCachedConversationSession(conversationIdentity);
            if (!session) {
                log("sendVideoManager stopSendingVideo() No video started on " + conversationIdentity);
                return false;
            }

            if (session.status === Skype.Video.StateMachine.VideoState.STOPPING) {
                
                return false;
            }

            if (stopCompleted) {
                var that = this;
                this.regEventListener(session, Skype.Video.StateMachine.Events.StatusChanged, function (evt) {
                    var s = evt.detail;
                    if (s.status === Skype.Video.StateMachine.VideoState.RUNNING ||
                        s.status === Skype.Video.StateMachine.VideoState.READY ||
                        s.status === Skype.Video.StateMachine.VideoState.PAUSED ||
                        s.status === Skype.Video.StateMachine.VideoState.STOPPING) {
                        return;
                    }

                    that.unregEventListener(session, Skype.Video.StateMachine.Events.StatusChanged, this.listener);
                    stopCompleted();
                });
            }

            session.stopVideo();

            return true;
        },

        switchSendingCamera: function (conversationIdentity, videoDevice) {  
            
            
            
            
            
            
            
            
            

            log("sendVideoManager switchSendingCamera - " + conversationIdentity);
            if (!conversationIdentity) {
                log("sendVideoManager switchSendingCamera() empty conversationIdentity - ERROR");
                return;
            }

            this._switchingCamera = true;

            var currentDevice = "";
            var cachedConversation = this._getCachedConversationSession(conversationIdentity);

            if (cachedConversation) {
                currentDevice = cachedConversation.videoDevice;
            }
            
            if (!currentDevice) {
                currentDevice = this._getConversationVideoDeviceHandle(conversationIdentity);
            }

            
            var nextVideoDevice = videoDevice;
            if (!nextVideoDevice) {
                nextVideoDevice = Skype.Application.DeviceManager.getNextVideoDevice(currentDevice);
            }

            
            this.startSendingVideo(conversationIdentity, nextVideoDevice);

            this._notifyListener(conversationIdentity);
            this._switchingCamera = false;
        },

        registerVideoPreviewListener: function (conversationIdentity, listener) {
            
            
            
            
            

            var clistener = this._getListener(conversationIdentity);

            if (clistener) {
                
                clistener.listener = listener;
            } else {
                this._listeners.push({ identity: conversationIdentity, listener: listener });
            }
        },

        unregisterVideoPreviewListener: function (listener) {
            
            
            

            var listenerIndex = this._listeners.index(function (item) {
                return item.listener === listener;
            });

            if (listenerIndex !== -1) {
                this._listeners.removeAt(listenerIndex);
            }
        },

        getConversationVideoDevice: function (conversationIdentity) {
            
            
            

            var session = this._getCachedConversationSession(conversationIdentity);
            if (session) {
                if ([Skype.Video.StateMachine.VideoState.RINGING,
                    Skype.Video.StateMachine.VideoState.STARTING,
                    Skype.Video.StateMachine.VideoState.READY,
                    Skype.Video.StateMachine.VideoState.RUNNING].contains(session.status)) {

                    log("sendVideoManager(" + conversationIdentity + ") getConversationVideoDevice() videoDeviceHandle: " + session.videoDevice);
                    return session.videoDevice;
                } else {
                    log("sendVideoManager(" + conversationIdentity + ") getConversationVideoDevice() videoDeviceHandle: [no device/not showing/empty string]");
                    return "";
                }
            }

            
            var device = this._getConversationVideoDeviceHandle(conversationIdentity);
            log("sendVideoManager(" + conversationIdentity + ") _getConversationVideoDevice() videoDeviceHandle: " + (device || '[no device/not showing/empty string]'));
            return device;
        },

        startVideoPreview: function (videoDeviceHandle) {
            
            
            

            var previewVideo = lib.createPreviewVideo(videoDeviceHandle);
            if (!previewVideo) {
                return null;
            }
            var src = previewVideo.getVideoSrc();
            if (!src) {
                return null;
            }
            if (this._previewVideos[videoDeviceHandle]) {
                this._previewVideos[videoDeviceHandle].refCount++; 
            } else {
                log("sendVideoManager: starting video preview - videoDeviceHandle: " + videoDeviceHandle);
                previewVideo.start();
                this._previewVideos[videoDeviceHandle] = { video: previewVideo, refCount: 1 };
            }
            return src;
        },

        switchVideoPreview: function (oldDeviceHandle, newVideHandle) {
            
            
            
            

            this._switchingCamera = true;
            log("sendVideoManager: switching video preview - oldDeviceHandle {0}, newVideHandle {1}: ".format(oldDeviceHandle, newVideHandle));
            var oldPreview = this._previewVideos[oldDeviceHandle];

            if (!oldPreview) {
                return null;
            }

            this.stopVideoPreview(oldDeviceHandle, true);
            for (var i = 0; i < this._conversationsSessions.length; i++) {
                if (this._conversationsSessions[i].videoDevice == oldDeviceHandle) {
                    this.switchSendingCamera(this._conversationsSessions[i].conversationIdentity, newVideHandle);
                }
            }
            var src = this.startVideoPreview(newVideHandle);
            this._switchingCamera = false;
            return src;
        },

        getVideoObjectByDeviceHandle: function (videoDeviceHandle) {
            
            
            

            var previewVideo = this._previewVideos[videoDeviceHandle];
            return previewVideo ? previewVideo.video : null;
        },

        isSwitchingCamera: function () {
            
            
            
            return this._switchingCamera;
        },

        stopVideoPreview: function (videoDeviceHandle, force) {
            
            
            
            
            
            
            
            
            

            if (this._previewVideos[videoDeviceHandle]) {
                this._previewVideos[videoDeviceHandle].refCount--;
                if (force || !this._previewVideos[videoDeviceHandle].refCount) {
                    log("sendVideoManager: stopping video preview - videoDeviceHandle {0}".format(videoDeviceHandle));
                    this._previewVideos[videoDeviceHandle].video.stop();
                    this._previewVideos[videoDeviceHandle].video.discard();
                    this._previewVideos[videoDeviceHandle] = null;
                }
            }
        },

        shouldbeCameraFlippedX: function (videoDeviceHandle) {
            
            
            
            

            var videoOrientation = this._getDeviceOrientation(videoDeviceHandle);
            return videoOrientation && (videoOrientation === LibWrap.Video.orientation_FLIP_H || videoOrientation === LibWrap.Video.orientation_FLIP_H_V); 
        },

        shouldbeCameraFlippedY: function (videoDeviceHandle) {
            
            
            

            var videoOrientation = this._getDeviceOrientation(videoDeviceHandle);
            return videoOrientation && (videoOrientation === LibWrap.Video.orientation_FLIP_V || videoOrientation === LibWrap.Video.orientation_FLIP_H_V); 
        },

        isVideoPreviewRunning: function () {
          
          
          
          var list = lib.getVideoDeviceHandles();
          for (var i = 0; i < list.size; i++) {
            if (!!this._previewVideos[list[i]]) {
              return true;
            }
          }
          return false;
        },
    }, {}, {
        instance: {
            get: function () {
                if (!instance) {
                    instance = new Skype.SendVideoManager();
                }
                return instance;
            }
        }
    });

    var instance = null;
    WinJS.Namespace.define("Skype", {
        SendVideoManager: WinJS.Class.mix(sendVideoManager, Skype.Class.disposableMixin),
    });

    window.traceClassMethods && window.traceClassMethods(sendVideoManager, "SendVideoManager", ["_handleLogin", "_handleVideoListChange"]);

})(Skype);
