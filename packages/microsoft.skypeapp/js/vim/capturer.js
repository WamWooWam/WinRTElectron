

(function () {
    "use strict";

    var encodingProfile,
        tmpFileName = "videomessage";

    var Capturer = WinJS.Class.mix(WinJS.Class.define(function (deviceManager, mediaCapture) {
        this._deviceManager = deviceManager || Skype.Application.DeviceManager;
        this._mediaCapture = mediaCapture || Windows.Media.Capture.MediaCapture;
        this._failedEventHandler = this._failedEventHandler.bind(this);
        this._recordLimitationExceededEventHandler = this._recordLimitationExceededEventHandler.bind(this);
        Skype.Diagnostics.ETW.Debug && Skype.Diagnostics.ETW.Debug.addAutoTracingToObject(this, this.__className);
    }, {
        _mediaCaptureMgr: null,
        _captureInitSettings: null,

        _deviceIndex: -1,
        _devices: null,

        _capturerReleasedPromise: null,

        isRecording: false,

        _getActiveVideDevicePath: function () {
            this._activeVideoDevice = this._activeVideoDevice || this._deviceManager.getActiveVideoDeviceHandle();
            var videoPath, previousDevice;

            while (previousDevice !== this._activeVideoDevice) {

                previousDevice = this._activeVideoDevice;
                videoPath = lib.getVideoDevicePath(this._activeVideoDevice);

                if (videoPath && videoPath.length !== 0) {
                    return videoPath;
                }

                this._activeVideoDevice = this._deviceManager.getNextVideoDevice();
            }

            return null;
        },

        _resetCaptureSettingsAsync: function () {
            var videoPath = this._getActiveVideDevicePath();
            if (!videoPath || videoPath.length === 0) {
                this._captureInitSettings = null;
                return WinJS.Promise.as();
            }

            return this._deviceManager.getSelectedMicDeviceIdAsync().then(function (micDeviceId) {
                log("ViMCapturer: Camera settings: {0}, path: {1}".format(this._activeVideoDevice, videoPath));
                log("ViMCapturer: Mic settings: {0}".format(micDeviceId));

                this._captureInitSettings = new Windows.Media.Capture.MediaCaptureInitializationSettings();
                this._captureInitSettings.audioDeviceId = micDeviceId;

                this._captureInitSettings.videoDeviceId = videoPath;

                this._captureInitSettings.photoCaptureSource = Windows.Media.Capture.PhotoCaptureSource.auto;
                this._captureInitSettings.streamingCaptureMode = Windows.Media.Capture.StreamingCaptureMode.audioAndVideo;
            }.bind(this));
        },

        _startDeviceAsync: function () {
            this._resetMediaCapture();
            
            return this._resetCaptureSettingsAsync().then(function () {
                this._mediaCaptureMgr = new this._mediaCapture();
                this.regEventListener(this._mediaCaptureMgr, "recordlimitationexceeded", this._recordLimitationExceededEventHandler);
                this.regEventListener(this._mediaCaptureMgr, "failed", this._failedEventHandler);

                if (this._captureInitSettings) {
                    var that = this;
                    return WinJS.Promise.as()

                        .then(function () {
                            return this._mediaCaptureMgr.initializeAsync(this._captureInitSettings);
                        }.bind(this))

                        .then(function () {
                            this.rotateDevice();
                        }.bind(this))

                        .then(function () {
                            log("ViMCapturer: camera initialized");
                            this._echoStreamProperties();
                        }.bind(this), function (error) {
                            log("ViMCapturer: error while initializeAsync");
                            return that._errorHandler(error);
                        }.bind(this));
                } else {
                    return WinJS.Promise.wrapError("No video device available!");
                }
            }.bind(this));
        },

        _echoStreamProperties: function () {
            var x = this._mediaCaptureMgr.videoDeviceController.getMediaStreamProperties(Windows.Media.Capture.MediaStreamType.videoPreview);

            var props = ["bitrate", "height", "subtype", "type", "width"];

            log("ViMCapturer: Video stream properties");
            for (var i = 0; i < props.length; i++) {
                var name = props[i];
                log("ViMCapturer: {0}:{1}".format(name, x[name]));
            }
        },
        
        rotateDevice: function() {
            var rotation = this._convertToRotation(Skype.Application.state.view.rotation);
            this._mediaCaptureMgr.setRecordRotation(rotation);
            this._mediaCaptureMgr.setPreviewRotation(rotation);
        },

        startPreviewAsync: function () {
            return this._startDeviceAsync()
                .then(function () {
                    log("ViMCapturer: building preview url");
                    this.uri = URL.createObjectURL(this._mediaCaptureMgr, { oneTimeOnly: true });
                    return this.uri;
                }.bind(this))

                .then(null, function (error) {
                    return WinJS.Promise.join([
                        WinJS.Promise.wrapError(error)
                    ]);
                });
        },

        startRecordAsync: function () {
            if (!this.isRecording) {
                var that = this;

                return Windows.Storage.ApplicationData.current.localFolder.createFileAsync(tmpFileName + ".mp4", Windows.Storage.CreationCollisionOption.generateUniqueName)
                    .then(function (file) {
                        that.videoFile = file;

                        log("ViMCapturer: starting to record");
                        var streamProps = that._mediaCaptureMgr.videoDeviceController.getMediaStreamProperties(Windows.Media.Capture.MediaStreamType.videoPreview);
                        encodingProfile = Windows.Media.MediaProperties.MediaEncodingProfile.createMp4(Windows.Media.MediaProperties.VideoEncodingQuality.hd1080p);
                        encodingProfile.video.height = 480;
                        encodingProfile.video.width = Math.ceil(480 * streamProps.width / streamProps.height);
                        encodingProfile.video.bitrate = 800000;
                        that.isRecording = true;
                        that._capturerReleasedPromise = new WinJS.Promise(function () { });
                        return that._mediaCaptureMgr.startRecordToStorageFileAsync(encodingProfile, that.videoFile);
                    })

                    .then(null, function (error) {
                        log("ViMCapturer: startRecordToStorageFileAsync failed");
                        return WinJS.Promise.join([
                            that.videoFile.deleteAsync(),
                            WinJS.Promise.wrapError(error)
                        ]);
                    });
            }

            return WinJS.Promise.wrapError("recording already started!");
        },

        stopRecordAsync: function () {
            return this._mediaCaptureMgr.stopRecordAsync()
                .then(function () {
                    log("ViMCapturer: _mediaCaptureMgr.stopRecordAsync");
                    return {
                        url: URL.createObjectURL(this.videoFile, { oneTimeOnly: true }),
                        file: this.videoFile
                    };
                }.bind(this))
            .then(null, function (error) {
                log("ViMCapturer: _mediaCaptureMgr.stopRecordAsync failed");
                return WinJS.Promise.join([
                    this.videoFile && this.videoFile.deleteAsync(),
                    WinJS.Promise.wrapError(error)
                ]);
            }.bind(this))
                .then(this._finalizeStop.bind(this),
                    function (error) {
                        this._finalizeStop();
                        return error;
                    }.bind(this)
                );
        },

        _finalizeStop: function () {
            this.videoFile = null;
            this.isRecording = false;
            return arguments.length ? arguments[0] : null;

        },

        switchCameraAsync: function () {
            var currentDevice = this._activeVideoDevice;
            var nextDevice = this._deviceManager.getNextVideoDevice(this._activeVideoDevice);
            if (currentDevice !== nextDevice) {
                this._activeVideoDevice = nextDevice;
                return WinJS.Promise.as(this._activeVideoDevice);
            }
            return WinJS.Promise.as();
        },

        release: function () {
            this._activeVideoDevice = null; 
            this._resetMediaCapture();
            if (this._capturerReleasedPromise) {
                this._capturerReleasedPromise.complete();
            }
        },

        getCapturerReleasedPromise: function () {
            if (this._capturerReleasedPromise) {
                return this._capturerReleasedPromise;
            }
            return WinJS.Promise.as();
        },

        _resetMediaCapture: function () {
            this._mediaCaptureMgr && this._mediaCaptureMgr.removeEventListener("recordlimitationexceeded", this._recordLimitationExceededEventHandler);
            this._mediaCaptureMgr && this._mediaCaptureMgr.removeEventListener("failed", this._failedEventHandler);
            this._mediaCaptureMgr && this._mediaCaptureMgr.close();
            this._mediaCaptureMgr = null;
        },

        _recordLimitationExceededEventHandler: function () {
            if (this.isRecording) {
                this.stopRecord();
            }
        },

        _failedEventHandler: function (e) {
            log("ViMCapturer: Exception: " + e.message + ":" + e.code);
            this.dispatchEvent("error", { code: e.code, message: e.message });
            return true;
        },

        _errorHandler: function (e) {
            log("ViMCapturer: Exception: " + e.message);

            return WinJS.Promise.wrapError(e.message);
        },

        _convertToRotation: function (orientation) {
            var cameraPosition = this._deviceManager.getVideoDevicePosition(this._activeVideoDevice);

            switch (orientation) {
                case Windows.Devices.Sensors.SimpleOrientation.rotated180DegreesCounterclockwise:
                    return Windows.Media.Capture.VideoRotation.clockwise180Degrees;
                case Windows.Devices.Sensors.SimpleOrientation.rotated270DegreesCounterclockwise:
                    return cameraPosition !== Windows.Devices.Enumeration.Panel.back ? Windows.Media.Capture.VideoRotation.clockwise270Degrees : Windows.Media.Capture.VideoRotation.clockwise90Degrees; 
                case Windows.Devices.Sensors.SimpleOrientation.rotated90DegreesCounterclockwise:
                    return cameraPosition !== Windows.Devices.Enumeration.Panel.back ? Windows.Media.Capture.VideoRotation.clockwise90Degrees : Windows.Media.Capture.VideoRotation.clockwise270Degrees; 
                default:
                    return Windows.Media.Capture.VideoRotation.none;
            }
        }
    }, {
        current: {
            get: function () {
                if (!instance) {
                    instance = new Skype.VideoMessaging.Capturer();
                }
                return instance;
            },
            set: function (value) {
                instance = value;
            }
        },

        cleanupViMsAsync: function () {
            var options = new Windows.Storage.Search.QueryOptions(Windows.Storage.Search.CommonFileQuery.defaultQuery, [".mp4"]);
            options.userSearchFilter = '~"' + tmpFileName + '*.mp4"';
            var localFolder = Windows.Storage.ApplicationData.current.localFolder;
            var fileQuery = localFolder.createFileQueryWithOptions(options);
            return fileQuery.getFilesAsync()
            .then(function (files) {
                var promises = [];
                files.forEach(function (file) {
                    promises.push(file.deleteAsync());
                });
                return WinJS.Promise.join(promises)
                    .then(null, function (e) {
                    log("ViMCapturer.cleanupViMsAsync: file deletion failed");
                });
            });
        }
    }), Skype.Class.disposableMixin, WinJS.Utilities.eventMixin);

    var instance;

    WinJS.Namespace.define("Skype.VideoMessaging", {
        Capturer: Capturer
    });

})();