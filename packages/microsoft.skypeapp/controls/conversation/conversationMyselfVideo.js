

(function () {
    "use strict";

    var GVC_MYSELF_VIDEO_HEIGHT = 120;

    var conversationMyselfVideo = Skype.UI.Control.define(
        function conversationMyselfVideo_constructor() {
            this.initPromise = new WinJS.Promise(function () { });
        }, {
            
            _videoElement: null,

            
            _viewModel: null,
            _dragHandler: null,

            
            _chatOpen: false,

            initPromise: null,

            _onReady: function (conversationSharedState) {
                
                var identity = conversationSharedState ? conversationSharedState.identity : null;

                
                this._videoElement = this.element.querySelector("video.pip");

                
                this.regEventListener(this.element, 'MSAnimationEnd', this._onFlipAnimEnd.bind(this));
                this.regEventListener(this._videoElement, "keydown", function (e) {
                    if (e.keyCode !== WinJS.Utilities.Key.tab) {
                        e.preventDefault();  
                    }
                }); 

                this.options.ribbonHeight = GVC_MYSELF_VIDEO_HEIGHT;
                if (conversationSharedState) {
                    this.options.isDialog = conversationSharedState.isDialog;
                }
                this._dragHandler = new Skype.UI.Conversation.MyselfVideoDragHandler(this.element, conversationSharedState);
                this._viewModel = new Skype.ViewModel.ConversationMyselfVideoVM(identity, this.options);
                this.forwardEvent(this._viewModel, Skype.UI.Conversation.ConversationMyselfVideo.Events.ControlInitialized);
                this.forwardEvent(this._viewModel, Skype.UI.Conversation.ConversationMyselfVideo.Events.PiPIsSwitching);

                
                this.initPromise = WinJS.Binding.processAll(this.element, this._viewModel, true).then(this._onBindingReady.bind(this, conversationSharedState));
                return this.initPromise;
            },

            _onBindingReady: function (conversationSharedState) {
                this.regEventListener(window, 'resize', this._checkPIPParentVisibility.bind(this));
                this.regEventListener(this._viewModel, Skype.ViewModel.ConversationMyselfVideoVM.Events.VideoStart, this._onVideoStart.bind(this));
                this.regBind(this._viewModel, "mirrorVideo", function (mirror) {
                    this._videoElement.msHorizontalMirror = mirror;
                }.bind(this));
                this._viewModel.init(this._dragHandler);
            },

            _onVideoStart: function (event) {
                var play = event.detail ? event.detail.play : false;
                if (play) {
                    this._videoElement.setAttribute('src', event.detail.src);
                    this._videoElement.play();
                } else {
                    this._videoElement.pause();
                    this._videoElement.removeAttribute('src');
                }
            },

            _onFlipAnimEnd: function (e) {
                if (e.animationName.startsWith("FLIP_START")) {
                    this._viewModel.onFlipAnimationEnd();
                }
            },

            _checkPIPParentVisibility: function () {
                var pipVisible = !(this._chatOpen && Skype.Application.state.view.isVertical);
                this._dragHandler.onVideoVisibilityChanged(pipVisible);
                this._viewModel.preventPiPSwitching = !pipVisible;
            },

            
            init: function (conversationSharedState) {
                
                
                

                log("ConversationMyselfVideo: init()");
                return WinJS.UI.Fragments.renderCopy("/controls/conversation/conversationMyselfVideo.html", this.element).then(this._onReady.bind(this, conversationSharedState));
            },
            
            isSwitchingCamera: function () {
                return this._viewModel && this._viewModel.isSwitchingCamera;
            },

            onChatToggled: function (chatOpen) {
                
                
                

                this._chatOpen = chatOpen;
                this._viewModel && this._checkPIPParentVisibility();
            },

            isRunning: function () {
                
                
                

                return this._viewModel && this._viewModel.myselfVideoRunning;
            },

            updateMyselfShowing: function () {
                
                
                

                this._viewModel && this._viewModel.updateMyselfShowing();
            },

            startVideo: function (videoDeviceHandle) {
                
                
                
                
                
                

                return this._viewModel.startVideo(videoDeviceHandle);
            },


            stopVideo: function () {
                
                
                

                return this._viewModel.stopVideo();
            },

            resize: function (width, height) {
                
                
                

                this._width = width;
                this._viewModel.updateVideoDimensions();
            },

            switchCamera: function () {
                
                
                

                this._viewModel.switchCamera();
            }
        }, {
            MYSELFVIDEOMARGIN: 10,
            MYSELFVIDEOWIDTH: 300,

            MYSELFVIDEOWIDTH_VERTICAL: 210,
            MYSELFVIDEOMARGIN_VERTICAL: 10,
            
            Events: {
                ControlInitialized: "ControlInitialized",
                PiPIsSwitching: "PiPIsSwitching"
            }
        });

    WinJS.Namespace.define("Skype.UI.Conversation", {
        ConversationMyselfVideo: WinJS.Class.mix(conversationMyselfVideo, WinJS.Utilities.eventMixin)
    });
}());