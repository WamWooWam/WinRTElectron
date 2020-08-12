


(function viewmodel() {
    "use strict";
    var timeLimit = 180;
    var etw = new Skype.Diagnostics.ETW.Tracer("Skype.ViewModel.VideoMessageDialogVM");
    var EMPTY_URL = "";

    var States = {
        
        prepare: "PREPARE",
        preparePlayback: "PREPARE_PLAYBACK",
        premium: "PREMIUM",
        recording: "RECORDING",
        recorded: "RECORDED",
        playback: "PLAYBACK",
        sending: "SENDING",
        sent: "SENT",
        failed: "FAILED",
        error: "ERROR",
    };

    var Modes = {
        receive: "RECEIVE",
        send: "SEND"
    };

    var vimDialogVM = MvvmJS.Class.define(function (player, capturer, thumnailFactory, aLib, entitlementManager, deviceManager) {
        this._player = player;
        this._capturer = capturer || Skype.VideoMessaging.Capturer.current;
        this._thumnailFactory = thumnailFactory || Skype.VideoMessaging.thumbnailFactory;
        this._lib = aLib || lib;
        this._entitlementManager = entitlementManager || Skype.VideoMessageEntitlementsManager.instance;
        this._deviceManager = deviceManager || Skype.Application.DeviceManager;
        this._handleError = this._handleError.bind(this);
    }, {
        _conversation: Skype.Utilities.nondisposableProperty(),
        _entitlementManager: Skype.Utilities.nondisposableProperty(),
        _capturer: Skype.Utilities.nondisposableProperty(),
        _deviceManager: Skype.Utilities.nondisposableProperty(),
        _message: Skype.Utilities.nondisposableProperty(),

        
        _resetUrlSignal: null,

        
        _haveMultipleCameras: false,
        
        
        _errorPromise: null,

        
        initAsync: function (conversation, message) {
            
            
            
            

            this._init(conversation);

            if (message) {
                return this._initForPlaybackAsync(message);
            }
            return this._initForRecordAsync(conversation);
        },
        record: function () {
            if (!this.canRecord) {
                return WinJS.Promise.as();
            }

            this.canStop = false;
            this.canRecord = false;

            return this._cleanupAsync()
                .then(function () {
                    if (this._hasMessagesLeft()) {
                        this._changeStateTo(States.recording);

                        return this._capturer.startRecordAsync();
                    } else {
                        this._changeStateTo(States.premium);
                        return WinJS.Promise.as();
                    }
                }.bind(this))

                .then(function () {
                    this._startTimer();
                    this.canStop = true;
                    Skype.UI.Util.lockRotation(true);
                    this.dispatchEvent(Skype.ViewModel.VideoMessageDialogVM.Events.RecordingStarted);
                    roboSky.write("conversation,videomessage,startedRecording");
                }.bind(this))

                .then(null, this._handleError);
        },
        reRecord: function () {
            return this._cleanupAsync()
                .then(this._resetUrlAsync.bind(this))
                .then(this._startPreviewAsync.bind(this));
        },
        stop: function () {
            if (!this.canStop) {
                return WinJS.Promise.as();
            }

            this.canStop = false;
            this.canSend = false;

            this._changeStateTo(States.recorded);
            this._stopTimer();

            return this._capturer.stopRecordAsync()

                .then(function (data) {
                    this._setVideo(data.url);
                    this.videoFile = data.file;

                    if (!this.videoFile) {
                        throw "No video file recorded";
                    }

                    this.canSend = true;
                    Skype.UI.Util.lockRotation(false);
                    this.dispatchEvent(Skype.ViewModel.VideoMessageDialogVM.Events.RecordingStopped);
                    roboSky.write("conversation,videomessage,stoppedRecording");
                }.bind(this))

                .then(null, this._handleError);
        },
        delete: function () {
            return this._cleanupAsync();
        },
        switchCamera: function () {
            if (!this.canSwitchCamera) {
                return WinJS.Promise.as();
            }

            this.canSwitchCamera = false;
            return this._capturer.switchCameraAsync()
                .then(function (newDevice) {
                    if (newDevice) {
                        this.cameraPosition = this._deviceManager.getVideoDevicePosition(newDevice);
                        return this._resetUrlAsync()
                            .then(function () {
                                return this._startPreviewAsync();
                            }.bind(this));
                    }
                    return WinJS.Promise.as();
                }.bind(this))
                .then(null, this._handleError);
        },
        buyPremium: function () {
            Windows.System.Launcher.launchUriAsync(Windows.Foundation.Uri("http://skype.com/go/skypepremium?" + Skype.UI.Util.getTrackingParam("skypepremium")));
            this._changeStateTo(States.sent);
        },
        reply: function () {
            return this._initForRecordAsync();
        },
        send: function () {
            this.canSend = false;

            if (this.state === States.sending || !this.videoFile) {
                return WinJS.Promise.as();
            }
            this._changeStateTo(States.sending);

            var that = this;
            return this._thumnailFactory.createThumbnailFileAsync(that.videoFile)
                .then(function (file) {
                    that.thumbnailFile = file;
                })
                .then(this._sendMessage.bind(this))
                .then(this._changeStateTo.bind(this, States.sent))
                .then(null, this._handleError)
                .then(this._cleanupAsync.bind(this));
        },
        releaseAsync: function () {
            return this.stop()
                .then(this._resetUrlAsync.bind(this))
            .then(function () {
                    this._capturer && this._capturer.release();
            }.bind(this))            
                .then(this._cleanupAsync.bind(this));
        },

        
        _init: function (conversation) {
            
            assert(conversation, "missing conversation argument");

            this._conversation = conversation;

            this.regBind(this, "state", this._echoState);

            this._refreshTitle();

            this.regEventListener(this._lib, "availablevideodevicelistchange", this._handleVideoListChange.bind(this));
            this._handleVideoListChange();

            this.regBind(Skype.Application.state, "isApplicationActive", this._onIsApplicationActiveChange.bind(this));
        },

        _onDispose: function() {
            Skype.UI.Util.lockRotation(false);
        },

        _initForPlaybackAsync: function (message) {
            this._message = message;

            this.replyAction = new Actions.SendVideoMessage(this._conversation.libConversation);
            this.replyAction.alive();

            return this._startPlaybackAsync();
        },

        _initForRecordAsync: function () {
            return this._startPreviewAsync()
                 .then(function () {
                    if (!this._hasMessagesLeft()) {
                        this._changeStateTo(States.premium);
                    } else {
                        this._subscribeToDeviceOrientationChange();
                    }
                }.bind(this));
        },

        _subscribeToDeviceOrientationChange: function () {
            
            var handler = function () { };
            this.regBind(Skype.Application.state.view, "rotation", function (orientation) {
                handler(orientation);
            });
            handler = this._rotateDevice.bind(this);
        },

        _rotateDevice: function () {
            var canStartPreview = States.prepare === this.state;
            if (!canStartPreview) {
                return;
            }
            this._capturer.rotateDevice();
        },

        _changeStateTo: function (state) {
            this.state = state;
        },

        _echoState: function (newState) {
            log("ViM:switching state to {0}".format(newState));
        },

        _handleError: function (error) {
            error && log(error);
            this.cameraSwitchBtnEnabled = this.canSwitchCamera = this._haveMultipleCameras;

            if (this.state === States.error) {
                return;
            }

            if (this.mode === Modes.receive) {
                this.errorMessage = "videomessage_dialog_error_playback".translate();
            } else {
                this.releaseAsync();
                this.errorMessage = "videomessage_dialog_error_recording".translate();
            }

            this._changeStateTo(States.error);
        },

        _handleVideoListChange: function () {
            var videoDeviceHandles = this._lib.getVideoDeviceHandles();
            if (videoDeviceHandles) {
                this._haveMultipleCameras = videoDeviceHandles.length > 1;
                this.cameraSwitchBtnEnabled = this.canSwitchCamera = this._haveMultipleCameras;
            }
        },

        _startPreviewAsync: function () {
            this.canRecord = false;

            this.mode = Modes.send;
            this._changeStateTo(States.prepare);
            return this._capturer.startPreviewAsync()
                .then(function (url) {
                    log("ViM:setting preview url {0}".format(url));

                    this._playVideo(url);
                    this.canRecord = true;

                    roboSky.write("conversation,videomessage,startedPreview");
                }.bind(this))

                .then(null, this._handleError);
        },

        _refreshTitle: function () {
            this.formattedTitle = "videomessage_dialog_title".translate(this._conversation.name);
        },

        _startTimer: function () {
            this._stopTimer();

            this._updateTime();
            this.time--;

            this._timerId = this.regInterval(function () {
                this._updateTime();
                this.time--;
                if (this.time < 0) {
                    this.stop();
                }
            }.bind(this), 1000);
        },

        _stopTimer: function () {
            this.unregInterval(this._timerId);
            this._timerId = 0;
            this.time = timeLimit;
            this._updateTime();
        },

        _updateTime: function () {
            this.formattedTime = Skype.Utilities.formatDuration(this.time);
        },

        _sendMessage: function () {
            var vim = new LibWrap.VideoMessage();
            var path = this.videoFile.path;
            var thumbnailPath = this.thumbnailFile.path;
            var result1 = this._lib.createVideoMessageWithFile(path, "", "", vim, thumbnailPath, "");
            if (!result1) {
                throw "creating video message failed";
            }

            var result2 = this._conversation.libConversation.postVideoMessage(vim.getObjectID(), "videomessage_legacy".translate());
            if (!result2) {
                throw "sending video message failed";
            }
        },

        _cleanupAsync: function () {
            var videoFile = this.videoFile;
            this.videoFile = null;

            var thumbnailFile = this.thumbnailFile;
            this.thumbnailFile = null;

            function noop() { }

            return WinJS.Promise.join([
                videoFile && videoFile.deleteAsync().then(noop, noop),
                thumbnailFile && thumbnailFile.deleteAsync().then(noop, noop)
            ]);
        },

        _onIsApplicationActiveChange: function (isActive) {
            log("ViM:application is {0}".format(isActive ? "active" : "hidden"));
            if (!isActive) {
                this.stop();
            } else {
                log("ViM: url: {0} and state: {1}".format(this.url, this.state));
                if (this.url !== "") {
                    if (this.state === States.prepare || this.state === States.error) {
                        this._resetUrlAsync()
                            .then(function () {
                                this._startPreviewAsync();
                            }.bind(this))
                            .then(function () {
                                if (!this._hasMessagesLeft()) {
                                    this._changeStateTo(States.premium);
                                }
                            }.bind(this));
                    }
                }
            }
        },

        _hasMessagesLeft: function () {
            return this._entitlementManager.hasMessagesLeft;
        },

        _startPlaybackAsync: function () {
            this._changeStateTo(States.preparePlayback);
            this.mode = this._message.isIncoming ? Modes.receive : Modes.send;
            this.regBind(this._message, "vodPath", this._handleVodPathChanged.bind(this));
            this.regBind(this._message, "status", this._handleStatusChanged.bind(this));
            this.regBind(this._message, "vodStatus", this._handleVodStatusChanged.bind(this));

            return WinJS.Promise.as();
        },

        _handleStatusChanged: function (status) {
            switch (status) {
            case LibWrap.VideoMessage.status_DELETED:
            case LibWrap.VideoMessage.status_CANCELED:
            case LibWrap.VideoMessage.status_EXPIRED:
            case LibWrap.VideoMessage.status_FAILED:
            case LibWrap.VideoMessage.status_INVALID:
                this._handleError("message playback failed");
                break;
            }
        },

        _handleVodPathChanged: function (url) {
            if (this.state === States.preparePlayback) {
                if (this.url !== url) {
                    this.url = url;
                }
            }
        },

        _handleVodStatusChanged: function (vodStatus) {
            if ((vodStatus === LibWrap.VideoMessage.vod_STATUS_VOD_PLAYABLE) ||
                (vodStatus === LibWrap.VideoMessage.vod_STATUS_VOD_PLAYABLE_LOCAL)) {
                this._playVideo(this.url);
            }
        },

        _setVideo: function (url) {
            this.url = url;
            this._player.setVideo(url);
        },
        _playVideo: function (url) {
            this.url = url;
            this._player.playVideo(url);
        },

        _resetUrlAsync: function () {
            if (this.url !== EMPTY_URL) {
                this._resetUrlSignal = new WinJS._Signal();
                
                this._setVideo(EMPTY_URL);
                return WinJS.Promise.timeout(500, this._resetUrlSignal.promise);
            }
            return WinJS.Promise.as();
        },

        
        canplay: function (evt) {
            log("ViM: " + evt.type);
            
            
            
            this.cameraSwitchBtnEnabled = this.canSwitchCamera = this._haveMultipleCameras;
        },
        canplaythrough: function (evt) {
            log("ViM: " + evt.type);
        },
        durationchange: function (evt) {
            log("ViM: " + evt.type);
        },
        emptied: function (evt) {
            evt && log("ViM: " + evt.type);
            var signal = this._resetUrlSignal;
            signal && signal.complete();
            roboSky.write("conversation,videomessage,emptied");
        },
        ended: function (evt) {
            log("ViM: " + evt.type);
            roboSky.write("conversation,videomessage,ended");
        },
        error: function (evt) {
            log("ViM: " + evt.type + ":" + this.url);

            if (this.url === EMPTY_URL) {
                return;
            }

            if (this.state === States.playback) {
                this._handleError();
            } else {
                this._errorPromise && this._errorPromise.cancel();

                if (this.state !== States.recorded) { 
                    this._errorPromise = WinJS.Promise.timeout(500).then(function () {
                        this._handleError();
                    }.bind(this));
                }
            }
        },
        loadeddata: function (evt) {
            log("ViM: " + evt.type);
        },
        loadedmetadata: function (evt) {
            log("ViM: " + evt.type);
        },
        loadstart: function (evt) {
            log("ViM: " + evt.type);
            var signal = this._setUrlSignal;
            signal && signal.complete();
        },
        pause: function (evt) {
            log("ViM: " + evt.type);
            roboSky.write("conversation,videomessage,pause");
        },
        play: function (evt) {
            log("ViM: " + evt.type);
            roboSky.write("conversation,videomessage,play");
        },
        playing: function (evt) {
            log("ViM: " + evt.type);

            if (this._errorPromise) {
                this._errorPromise.cancel();
                this._errorPromise = null;
            }

            if (this.state === States.preparePlayback || this.mode === Modes.receive) {
                this._changeStateTo(States.playback);
            }
            roboSky.write("conversation,videomessage,playing");
        },
        progress: function (evt) {
            log("ViM: " + evt.type);
        },
        ratechange: function (evt) {
            log("ViM: " + evt.type);
        },
        seeked: function (evt) {
            log("ViM: " + evt.type);
        },
        seeking: function (evt) {
            log("ViM: " + evt.type);
        },
        stalled: function (evt) {
            log("ViM: " + evt.type);
            this._handleError();
        },
        suspend: function (evt) {
            log("ViM: " + evt.type);
        },
        timeupdate: function (evt) {
            
        },
        waiting: function (evt) {
            log("ViM: " + evt.type);
        },
    }, {
        mode: "RECEIVE",
        state: "PREPARE",

        canSend: false,
        canRecord: false,
        canStop: false,

        replyAction: null,

        time: timeLimit,
        formattedTime: Skype.Utilities.formatDuration(timeLimit),
        formattedTitle: "",
        errorMessage: "",
        videoFile: null,
        thumbnailFile: null,
        canSwitchCamera: true,
        cameraSwitchBtnEnabled: true,
        url: EMPTY_URL,
        showVideoControls: false,
        isReplyEnabled: true,
        cameraPosition: null        
    }, {
        States: States,
        Modes: Modes,
        Events: {
            RecordingStarted: "RecordingStarted",
            RecordingStopped: "RecordingStopped"
        }
    });


    WinJS.Namespace.define("Skype.ViewModel", {
        VideoMessageDialogVM: WinJS.Class.mix(vimDialogVM, Skype.Class.disposableMixin)
    });

}());
