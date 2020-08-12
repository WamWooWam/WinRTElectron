

(function () {
    "use strict";

    var FLIP_ANIM_DURATION = 250,
        FLIP_END_DELAY = 1000;

    var conversationMyselfVideoVM = MvvmJS.Class.define(function (conversationIdentity, controlOptions) {
        this._conversationIdentity = conversationIdentity;
        if (controlOptions) {
            this._fixedVideoSize = controlOptions.fixedVideoSize; 
            this._fixedVideoWidth = controlOptions.videoWidth;
            this._preventCameraSwitching = controlOptions.preventCameraSwitching;

            if (controlOptions.ribbonHeight) {
                this._myselfVideoHeight = controlOptions.ribbonHeight;
            }
        }
        this._updateVideoRenderingVisibility = this._updateVideoRenderingVisibility.bind(this);
    }, {
        _conversationIdentity: null,
        _myselfVideoDevice: null,
        _videoSrc: "",
        videoObject: null,
        _videoObjectId: null,
        _myselfVideoHeight: 120,
        _dragProvider: null,

        
        myselfVideoRunning: false,
        _isSwitchingCamera: false,
        _preventCameraSwitching: false,
        _flipStartPromise: null,

        _onDispose: function () {
            if (this._myselfVideoDevice) {
                this.stopVideo();
            }
        },

        _handleVideoAspectRatioChanged: function (videoObjectID) {
            if (this._videoObjectId == videoObjectID) {
                log("conversationMyselfVideoVM _handleVideoAspectRatioChanged videoObjectId: {0}".format(videoObjectID));
                this.isVideoVisible = true;
                this.isControlInitialized = true;
                this.dispatchEvent(Skype.UI.Conversation.ConversationMyselfVideo.Events.ControlInitialized);
                this.updateVideoDimensions();
            }
        },

        _updateVideoRenderingVisibility: function () {
            if (!this.videoObject) {
                return;
            }
            var shouldBeVisible = Skype.Application.state.isApplicationActive && !Skype.Application.state.isPeoplePickerOpened;
            this.videoObject.setVisible(shouldBeVisible);
        },

        _getAspectRatio: function () {
            var previewVideoObject = this.myselfVideoDevice ? lib.createPreviewVideo(this.myselfVideoDevice) : null; 
            if (previewVideoObject) {
                var aspectRatio = previewVideoObject.getAspectRatio();
                previewVideoObject.discard();
                return aspectRatio;
            } else {
                log("_getAspectRatio: couldn't get preview video; using default aspect ratio - 4:3");
            }
            return 1.33; 
        },

        
        init: function (dragProvider) {
            this.regEventListener(lib, "videoaspectratiochanged", this._handleVideoAspectRatioChanged.bind(this));
            this.regBind(Skype.Application.state, "isRTL", this.updateVideoDimensions.bind(this));
            this.regBind(Skype.Application.state.view, "orientation", this.updateVideoDimensions.bind(this));
            this.regBind(Skype.Application.state, "isApplicationActive", this._updateVideoRenderingVisibility);
            this.regBind(Skype.Application.state, "isPeoplePickerOpened", this._updateVideoRenderingVisibility);

            this._dragProvider = dragProvider;
        },

        startVideo: function (myVideoDevice) {
            if (!!myVideoDevice) {
                this._myselfVideoDevice = myVideoDevice;
                this._videoSrc = Skype.SendVideoManager.instance.startVideoPreview(myVideoDevice);
                this.videoObject = Skype.SendVideoManager.instance.getVideoObjectByDeviceHandle(myVideoDevice);
                this._videoObjectId = this.videoObject ? this.videoObject.getObjectID() : -1;
                log("conversationMyselfVideoVM startVideo videoObjectId: '{0}' videoSrc: '{1}' videoDevice: '{2}'".format(this._videoObjectId, this._videoSrc, this._myselfVideoDevice));
                this.dispatchEvent(conversationMyselfVideoVM.Events.VideoStart, { play: true, src: this._videoSrc });
            }
        },

        stopVideo: function () {
            Skype.SendVideoManager.instance.stopVideoPreview(this._myselfVideoDevice);
            log("conversationMyselfVideoVM videoObjectId: '{0}' videoSrc: '{1}' videoDevice: '{2}'".format(this._videoObjectId, this._videoSrc, this._myselfVideoDevice));
            this._videoSrc = "";
            this._myselfVideoDevice = "";
            this.videoObject = null;
            this._videoObjectId = null;
            this.isVideoVisible = false; 
            this.dispatchEvent(conversationMyselfVideoVM.Events.VideoStart, { play: false, src: this._videoSrc });
        },

        updateVideoDimensions: function () {
            if (!this.videoObject || !this.isVideoVisible) { 
                log("MyselfVideoVM _updateVideoDimensions: couldn't update dimensions !");
                return;
            }
            var videoAspectRatio = this.videoObject.getAspectRatio();
            var videoOrientation = this.videoObject.getOrientation();

            this.isVideoRotated = Skype.Video.isVideoHeightAndWidthFlipped(videoOrientation);

            if (this._fixedVideoWidth) { 
                this.containerHeight = Math.ceil(this._fixedVideoWidth / videoAspectRatio) + 'px';
                this.containerWidth = this._fixedVideoWidth + 'px';
            } else {
                
                this.containerHeight = this._myselfVideoHeight + 'px';
                if (this.isVideoRotated) {
                    this.containerWidth = Math.floor(this._myselfVideoHeight / videoAspectRatio) + 'px';
                } else {
                    this.containerWidth = Math.floor(this._myselfVideoHeight * videoAspectRatio) + 'px';
                }
            }

            this.mirrorVideo = [LibWrap.Video.orientation_FLIP_H,
                                LibWrap.Video.orientation_FLIP_V,
                                LibWrap.Video.orientation_TRANSPOSE,
                                LibWrap.Video.orientation_TRANSPOSE_FLIP_H_V].contains(videoOrientation);
        },

        onVideoError: function (e) {
            Skype.Video.outputVideoError(e, "ConversationMyselfVideoVM", null);
        },

        updateMyselfShowing: function () {
            var newVideoDevice = Skype.SendVideoManager.instance.getConversationVideoDevice(this._conversationIdentity);

            var showMyselfVideo = newVideoDevice !== "";
            if (this.myselfVideoRunning === showMyselfVideo) {
                
                return;
            }

            this.myselfVideoRunning = showMyselfVideo;
            
            if (showMyselfVideo) {
                this.startVideo(newVideoDevice);
            } else {
                this.stopVideo();
            }
        },

        isSwitchingCamera: {
            get: function () {
                return this._isSwitchingCamera;
            },

            set: function (value) {
                if (this._dragProvider.isDragging && value) {
                    return;  
                }

                if (this._isSwitchingCamera !== value) {
                    this._isSwitchingCamera = value;
                    

                    if (value) {
                        this.switchingCameraClass = "FLIP_START";
                        this._flipStartPromise = WinJS.Promise.timeout(FLIP_ANIM_DURATION);
                        this._flipStartPromise.then(this.onFlipAnimationEnd.bind(this));
                    } else {
                        this.switchingCameraClass = "";
                    }
                    this.dispatchEvent(Skype.UI.Conversation.ConversationMyselfVideo.Events.PiPIsSwitching);
                }
            }
        },

        onFlipAnimationEnd: function () {
            if (this._flipStartPromise) {
                this._flipStartPromise.cancel();
                this._flipStartPromise = null;
            }

            if (this.switchingCameraClass !== "FLIP_START") {
                return;  
            }

            this.regTimeout(function () {
                this.isSwitchingCamera = false;  
            }.bind(this), FLIP_END_DELAY + FLIP_ANIM_DURATION); 

            this.isVideoVisible = false;
            this.switchingCameraClass = "FLIP_END";
            this.regImmediate(function () { 
                Actions.invoke("switchCamera", this._conversationIdentity);
            }.bind(this));
        },

        switchCamera: function () {
            
            if (!this._preventCameraSwitching && Skype.Video.hasMultipleCameras()) {
                this.isSwitchingCamera = true;
            }
        },

        
        onVideoPreviewClicked: function () {
            if (!this.preventPiPSwitching) { this.switchCamera(); }
        }

    }, {

        switchingCameraClass: "",
        mirrorVideo: false,

        containerWidth: 0,
        containerHeight: 0,

        isVideoVisible: false,
        isControlInitialized: false,
        isVideoRotated: false,
        preventPiPSwitching: false,
    }, {
        Events: {
            VideoStart: "VideoStart"
        }
    });

    WinJS.Namespace.define("Skype.ViewModel", {
        ConversationMyselfVideoVM: WinJS.Class.mix(conversationMyselfVideoVM, Skype.Class.disposableMixin, WinJS.Utilities.eventMixin)
    });

}());

