

(function () {
    "use strict";

    var autoId = 0;

    
    var conversationParticipantStream = Skype.UI.Control.define(
        function conversationParticipantStream_constructor(element, options) {
            this._participantId = options.participantId;
            this._sharedState = options.sharedState;
            this._id = autoId++;
        }, {
            
            _videoElement: null,
            _avatarContainer: null,
            _videoParticipant: null,

            
            _zoomedInVideoWanted: false,
            _tabIndex: -1,
            _sharedState: null,

            isScreenShare: false, 
            pinned: false,
            focusable: false,

            
            _viewModel: null,
            _participantId: null,
            _id: null,

            _onReady: function () {
                
                this._videoParticipant = this.element.querySelector("div.videoParticipant");
                this._videoElement = this._videoParticipant.querySelector("video.videoView"); 
                this._avatarContainer = this.element.querySelector("div.avatarCont");

                this._viewModel = new Skype.ViewModel.ConversationParticipantStreamVM(this._sharedState, this._avatarContainer);
                WinJS.Resources.processAll(this.element);

                return WinJS.Binding.processAll(this.element, this._viewModel).then(this._onBindingReady.bind(this));
            },

            _onBindingReady: function () {
                
                
                this.element.winControl = null;  
                this.element = this.element.querySelector("div.conversationParticipantStream");
                this.element.winControl = this;
                WinJS.Utilities.markDisposable(this.element, Skype.Class.disposableMixin.dispose.bind(this));   

                this.regEventListener(this._viewModel, Skype.ViewModel.ConversationParticipantStreamVM.Events.VideoStarted, this._onVideoStart.bind(this));

                this.regEventListener(this.element, "dblclick", this.toggle.bind(this));
                this.regEventListener(this.element, "keydown", this._keyDownHandler.bind(this));

                this.regEventListener(this._videoElement, "keydown", function (e) {
                    
                    if (e.keyCode !== WinJS.Utilities.Key.tab) {
                        e.preventDefault();  
                    }
                }); 
                this.regEventListener(this._videoParticipant, "pointerdown", this._gesturePointerDownHandler.bind(this));
                this.regEventListener(this._videoParticipant, "wheel", this._onWheelHandler.bind(this)); 
                this.regEventListener(this._videoParticipant, "MSGestureChange", this._gestureChangeHandler.bind(this)); 

                this._tabIndex = this.element.tabIndex;

                this.regBind(this._sharedState, "layout", this._updateTabIndex.bind(this));

                this._viewModel.init(this._participantId);
            },

            _updateTabIndex: function () {
                if (!this.element) {
                    return;
                }

                this.focusable = this._sharedState.layout == Skype.UI.Conversation.ConversationLayoutManager.Layout.ALL_PARTICIPANTS ||
                    this._sharedState.layout == Skype.UI.Conversation.ConversationLayoutManager.Layout.PINNED ||
                    (this._sharedState.layout == Skype.UI.Conversation.ConversationLayoutManager.Layout.PRESENTATION && !this.isScreenShare);

                this.element.tabIndex = this.focusable ? this._tabIndex : "-1";
                this._viewModel.updateFocus(this.focusable, this.pinned);
            },

            _keyDownHandler: function (evt) {
                if (evt.keyCode === WinJS.Utilities.Key.space || evt.keyCode === WinJS.Utilities.Key.enter) {
                    this.toggle();
                }
            },

            _gesturePointerDownHandler: function (evt) {
                var gestureObject = Skype.UI.Util.getGestureObjectForEvent(evt);
                gestureObject.target && gestureObject.addPointer(evt.pointerId);
            },

            _onWheelHandler: function (evt) {
                this._zoomedInVideoWanted = evt.deltaY < 0;
                this._updateVideoZoom();
            },

            _gestureChangeHandler: function (evt) {
                var scale = evt.scale;

                if (scale < conversationParticipantStream.VIDEO_SCALE_BOTTOM_LIMIT || scale > conversationParticipantStream.VIDEO_SCALE_TOP_LIMIT) {
                    this._zoomedInVideoWanted = scale > conversationParticipantStream.VIDEO_SCALE_TOP_LIMIT;
                    Skype.UI.Util.getGestureObjectForEvent(evt).stop(); 
                    this._updateVideoZoom();
                }
            },

            _onVideoStopped: function () {
                this._videoElement.style.width = '10px'; 
                this._videoElement.style.height = '10px';
            },

            _onVideoStart: function (event) {
                var play = event.detail ? event.detail.play : false;
                if (play) {
                    this._videoElement.style.width = '';
                    this._videoElement.style.height = '';
                    var src = event.detail.videoSrc;
                    this._videoElement.setAttribute('src', src);
                    this._videoElement.play();
                } else {
                    this._videoElement.pause();
                    this._videoElement.removeAttribute('src');
                    this._onVideoStopped();
                }
                roboSky.write("Conversation,incomingVideo,{0}".format(play ? "START" : "STOP"));
            },

            _onDispose: function () {
                
            },

            _updateVideoZoom: function () {
                
                this._videoElement.msZoom = this._zoomedInVideoWanted && !this.isScreenShare && !Skype.Application.state.view.isOnLockScreen;
            },

            

            startVideoSession: function (videoSession) {
                this._viewModel && this._viewModel.startVideoSession(videoSession);
            },

            stopVideoSession: function () {
                this._viewModel && this._viewModel.stopVideoSession();
            },

            hasRunningVideo: function () {
                return this._viewModel.isVideoRunning;
            },

            onVideoSessionChanged: function (videoSession) {
                this.isScreenShare = videoSession.isScreenShare;

                this._updateTabIndex();
            },

            render: function () {
                log("conversationParticipantStream: render()");
                return WinJS.UI.Fragments.renderCopy("/controls/conversation/conversationParticipantStream.html", this.element).then(this._onReady.bind(this));
            },

            onRemove: function () {
                log("ConversationParticipantStream: onRemove()");
                if (this._viewModel) {
                    
                    
                    
                    this._viewModel.stopVideoSession();
                }
                this._videoElement = null;
            },

            setUIPosition: function (uiPosition) {
                this._viewModel.setUIPosition(uiPosition);
            },

            setStatus: function (status) {
                this._viewModel && this._viewModel.setStatus(status);
            },

            toggle: function () {
                this.pinned = !this.pinned;
                this._viewModel.updateFocus(this.focusable, this.pinned);
                this.dispatchEvent(conversationParticipantStream.Events.ParticipantStreamToggled);
            },

            getEnding: function () {
                return this._viewModel.isEnding;
            },

            getId: function () {
                return this._id;
            },

            getParticipantId: function () {
                return this._participantId;
            }
        }, {
            VIDEO_SCALE_BOTTOM_LIMIT: 0.95,
            VIDEO_SCALE_TOP_LIMIT: 1.02,

            Events: {
                ParticipantStreamToggled: "ParticipantStreamToggled",
            },
        });

    WinJS.Namespace.define("Skype.UI", {
        ConversationParticipantStream: WinJS.Class.mix(conversationParticipantStream, WinJS.Utilities.eventMixin)
    });

}());