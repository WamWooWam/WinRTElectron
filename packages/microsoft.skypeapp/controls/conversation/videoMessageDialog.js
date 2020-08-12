

(function () {
    "use strict";
    var etw = new Skype.Diagnostics.ETW.Tracer("Skype.UI.Conversation.VideoMessageDialog");

    
    
    
    
    

    var videoMessageDialog = Skype.UI.ObservableControl.define(function (element, options) {
        this._conversation = Skype.Model.ConversationFactory.createConversation(options.conversation);
        assert(this._conversation, "missing conversation argument");
        this._message = options && options.message;
        
    }, {
        backBtn: null,
        xBtn: null,
        cancelBtn: null,
        retryBtn: null,
        video: null,
        videoContainer: null,
        lookingGood: null,
        _vimElement: null,
        _ariaLiveElement: null,

        _conversation:null,
        _message: {
            value: null,
            writable: true,
            skipDispose: true
        },
        

        showAsync: function () {
            return this._render()
                .then(this._show.bind(this))
                .then(function () {
                    return this;
                });
        },

        
        _render: function () {
            etw.write('init');
            Skype.UI.Conversation.VideoMessageDialog.closeAllDialogs();

            return WinJS.UI.Fragments.renderCopy("/controls/conversation/videoMessageDialog.html", this.element)
                .then(this._onReady.bind(this));
        },
        
        setVideo: function (uri) {
            this._videoElm.pause();
            
            if (uri && uri.length > 0) {
                this._videoElm.setAttribute("src", uri);
            } else {
                this._videoElm.removeAttribute("src");
            }
        },
        
        playVideo: function (uri) {
            this.setVideo(uri);
            
            if (uri && uri.length > 0) {
                this._videoElm.play();
            } 
        },

        _onReady: function (container) {
            this._vimElement = this.element.querySelector(".videoMessageDialog");
            document.body.appendChild(this.element);

            this._videoElm = this._vimElement.querySelector("VIDEO");
            assert(this._videoElm);

            this._vm = new Skype.ViewModel.VideoMessageDialogVM(this);
            this._vm.initAsync(this._conversation, this._message);
            this.regEventListener(this._vm, Skype.ViewModel.VideoMessageDialogVM.Events.RecordingStarted, this._recordingStarted.bind(this));
            this.regEventListener(this._vm, Skype.ViewModel.VideoMessageDialogVM.Events.RecordingStopped, this._recordingStopped.bind(this));

            this._ariaLiveElement = this._vimElement.querySelector("#videoMessageDialogAriaLive");
            this._ariaLiveElement.innerHTML = "aria_videomessage_dialog_title".translate(this._conversation.name);

            
            this.regEventListener(window, "keypress", this._handleKeyPress.bind(this));

            this.backBtn = this.element.querySelector(".backbutton");
            this.regEventListener(this.backBtn, "click", this.backBtnClick.bind(this));

            this.xBtn = this.element.querySelector("button.control.x");
            this.regEventListener(this.xBtn, "click", this.xClick.bind(this));
            
            this.cancelBtn = this.element.querySelector("button.cancel");
            this.regEventListener(this.cancelBtn, "click", this.cancelClick.bind(this));
            
            this.retryBtn = this.element.querySelector("button.retry");
            this.regEventListener(this.retryBtn, "click", this.retryClick.bind(this));

            WinJS.Utilities.query(".overlay button.cancel").forEach(function(elm, index) {
                this.regEventListener(elm, "click", this.cancelClick.bind(this));
            }.bind(this));

            this.video = this.element.querySelector("video");
            this.regEventListener(this.video, "loadedmetadata", this._videoSizeChange.bind(this), false);
            this.regEventListener(this.video, "MSVideoOptimalLayoutChanged", this._videoFullScreenChange.bind(this), false);

            this.regBind(Skype.Application.state.view, "size", this._scaleVideoContainer.bind(this));
            

            
            this.regEventListener(this.video, "keyup", this._handleKeyPress.bind(this));

            this.videoContainer = this.element.querySelector("div.video");
            this.lookingGood = this.element.querySelector("div.lookingGood");

            this.regBind(this._vm, "state", this._handleStateChanged.bind(this));
            this.regBind(this._vm, "cameraPosition", this._handleVideoTransformations.bind(this));
            return WinJS.UI.processAll(this.element.firstElementChild).then(function () {
                return WinJS.Resources.processAll(this.element)
                    .then(function () {
                        return WinJS.Binding.processAll(this.element, this._vm);
                    }.bind(this));
            }.bind(this));

        },

        _recordingStarted: function () {
            this._ariaLiveElement.innerHTML = "aria_videomessage_dialog_recording_started".translate();
        },
        
        _recordingStopped: function () {
            this._ariaLiveElement.innerHTML = "aria_videomessage_dialog_recording_stopped".translate();
        },

        _handleStateChanged: function (value) {
            switch (value) {
                case Skype.ViewModel.VideoMessageDialogVM.States.sent:
                    this.hide();
                    break;
                case 'RECORDING':
                    if (document.activeElement === this.element.querySelector("button.record.PREPARE")) {
                        this.regImmediate(function () {
                            this.element.querySelector("button.record.RECORDING").focus();
                        }.bind(this));
                    }
                    
                    break;
                case 'RECORDED':
                    
                    this.video.controls = true;
                    this.regImmediate(function () {     
                        this.element.querySelector("button.RECORDED").focus();
                    }.bind(this));
                    break;
                case 'PREPARE_PLAYBACK':
                    this._hideUIelements();
                    break;
                case 'PLAYBACK':
                    this.video.controls = true;
                    this._hideUIelements();
                    
                    this.regEventListener(this.video, "playing", this._hideUIelements.bind(this), false);
                    this.regEventListener(this.video, "ended", this._playbackShowUIelements.bind(this), false);
                    this.regEventListener(this.video, "pause", this._playbackShowUIelements.bind(this), false);
                    break;
                case 'PREPARE':
                    this.video.controls = false;
                    this._showUIelements();
                    this._showLookingGood();
                    this.regImmediate(function () {
                        this.element.querySelector("button.record.PREPARE").focus();
                    }.bind(this));
                    break;
                case 'ERROR':
                    this._hideUIelements();
                    this.regImmediate(function () {
                        this.element.querySelector("button.retry.SEND").focus();
                    }.bind(this));
                    break;
                default:
                    this.video.controls = false;
                    break;
            }
        },

        _handleVideoTransformations: function () {
            if (this._vm.cameraPosition !== Windows.Devices.Enumeration.Panel.back) {
                WinJS.Utilities.addClass(this.videoContainer, "FLIPPED");
            } else {
                WinJS.Utilities.removeClass(this.videoContainer, "FLIPPED");
            }
        },

        _show: function () {
            Skype.UI.AppBar && Skype.UI.AppBar.instance.disable(); 
            WinJS.Utilities.addClass(this._vimElement, "ACTIVE");
            this._handleVideoTransformations();
            this._vimElement.winControl.enable();
        },
        
        _hideUIelements: function (e) {
            switch (this._vm.state) {
                case "PREPARE_PLAYBACK":
                case "PLAYBACK":
                case "ERROR":
                    WinJS.Utilities.addClass(this._vimElement, "HIDEUI");
                    break;
            }
        },
        
        _playbackShowUIelements: function (e) {
            if (this._vm.mode == Skype.ViewModel.VideoMessageDialogVM.Modes.receive) {
                this._ariaLiveElement.innerHTML = "aria_videomessage_dialog_reply_notification".translate();
            }
            this._showUIelements(e);
        },
        
        _showUIelements: function (e) {
            WinJS.Utilities.removeClass(this._vimElement, "HIDEUI");
        },

        _handleKeyPress: function (e) {
            if (e.keyCode === WinJS.Utilities.Key.backspace) {
                this._vm.stop();
                this.hide();
                e.preventDefault();
            }
        },

        _onDispose: function () {
            etw.write('dispose');
        },

        _scaleVideoContainer: function () {
            if (!this.videoContainer) {
                return;
            }
            
            var isVertical = Skype.Application.state.view.isVertical;
            if (isVertical) {
                this.videoContainer.style.minWidth = "100%";
                this.videoContainer.style.width = "100%";
            } else {
                var videoWidth = this.video.clientWidth;
                if (window.outerWidth < videoWidth) { 
                    this.videoContainer.style.minWidth = window.outerWidth;
                    this.videoContainer.style.width = window.outerWidth;
                    this.video.width = window.outerWidth;
                } else {
                    this.videoContainer.style.minWidth = videoWidth + "px";
                    this.videoContainer.style.width = videoWidth + "px";
                }
            }
        },

        _videoSizeChange: function () {
            this._scaleVideoContainer();
        },
        
        _videoFullScreenChange: function (e) {
            this._scaleVideoContainer();
        },
        
        hide: function (force) {
            if (force) {
                this._hide();
                return;
            }

            
            switch (this._vm.state) {
                case Skype.ViewModel.VideoMessageDialogVM.States.prepare:
                case Skype.ViewModel.VideoMessageDialogVM.States.sent:
                case Skype.ViewModel.VideoMessageDialogVM.States.playback:
                case Skype.ViewModel.VideoMessageDialogVM.States.preparePlayback:
                case Skype.ViewModel.VideoMessageDialogVM.States.premium:
                case Skype.ViewModel.VideoMessageDialogVM.States.error:
                    this._hide();
                    break;
                default:
                    this._showConfirmation();
                    break;
            }
        },

        _showConfirmation: function () {
            Skype.UI.Dialogs.showTwoButtonDialogAsync(this.cancelBtn,
                "videomessage_dialog_cancel_recording".translate(),
                "videomessage_dialog_cancel_question".translate(),
                "videomessage_dialog_button_rerecord".translate(),
                "videomessage_dialog_delete".translate())
                .then(function (result) {
                    if (result !== null) { 
                        if (result) {
                            this._vm.reRecord();
                        } else {                            
                            this.hide(true);
                        }
                    }
                }.bind(this));
        },

        _hide: function () {
            etw.write('hiding');

            Skype.UI.AppBar && Skype.UI.AppBar.instance.enable(); 
            WinJS.Utilities.removeClass(this._vimElement, "ACTIVE");
            this._vimElement.winControl.disable();

            return this._vm.releaseAsync()
                .then(function () {                    
                    Skype.UI.Util.removeFromDOM(this.element);
                }.bind(this));
        },
        
        xClick: function (e) {
            this.hide();
        },
        
        backBtnClick: function (e) {
            this.hide();
        },
        
        cancelClick: function (e) {
            this.hide();
        },
        
        retryClick: function (e) {
            this._vm.reRecord();
        },

        _showLookingGood: function () {
            WinJS.Utilities.addClass(this.lookingGood, "VISIBLE");
            this.regTimeout(function () {
                this._hideLookingGood();
            }.bind(this), 4000);
        },

        _hideLookingGood: function () {
            WinJS.Utilities.removeClass(this.lookingGood, "VISIBLE");
        }
    }, {
    },{
        closeAllDialogs: function () {
            WinJS.Utilities.query(".videoMessageDialogContainer").forEach(function(dialogElm) {
                dialogElm.parentNode && dialogElm.parentNode.winControl && dialogElm.parentNode.winControl.hide(true);
            });
        },
        isActive: {
            get: function () {
                var element = document.body.querySelector(".videoMessageDialog");
                return element && WinJS.Utilities.hasClass(element, "ACTIVE");                
            },
        }
    });

    WinJS.Namespace.define("Skype.UI.Conversation", {
        VideoMessageDialog: videoMessageDialog
    });

})();