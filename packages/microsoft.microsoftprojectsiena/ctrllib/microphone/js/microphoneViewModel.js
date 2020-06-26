//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(Platform) {"use strict";
    var util = AppMagic.Utility,
        CLASS_NOT_REGISTERED_ERROR = -2147221164,
        MicrophoneViewModel = WinJS.Class.define(function MicrophoneViewModel_ctor(controlContext) {
            this._controlContext = controlContext;
            this._microphoneId = controlContext.modelProperties.Mic.getValue();
            this._onStartFunction = controlContext.behaviors.OnStart;
            this._onStopFunction = controlContext.behaviors.OnStop;
            this._onFailedHandler = this._onFailed.bind(this);
            this._onRecordLimitationExceededHandler = this._onRecordLimitationExceeded.bind(this);
            this._stopDeviceBound = this._stopDevice.bind(this);
            this._startRecordBound = this._startRecord.bind(this);
            try {
                this._deviceClass = Platform.Devices.Enumeration.DeviceClass.audioCapture;
                this._encodingProfile = Platform.Media.MediaProperties.MediaEncodingProfile.createMp3(Platform.Media.MediaProperties.AudioEncodingQuality.auto);
                this._initializeSettings()
            }
            catch(e) {
                this._deviceClass = null;
                this._encodingProfile = null;
                this._settings = null
            }
            this._recordTimeTotal = ko.observable("");
            this._isRecording = ko.observable();
            this._isDeviceAvailable = ko.observable(!1);
            this._deviceList = []
        }, {
            _deviceList: null, _audioStream: null, _encodingProfile: null, _mediaCapture: null, _settings: null, _isRecording: null, _onFailedHandler: null, _onRecordLimitationExceededHandler: null, _stopDeviceBound: null, _startRecordBound: null, _isDeviceAvailable: null, _recordTimeStart: 0, _recordTimeTotal: null, _updateTimerId: null, _updateTimerInterval: 500, _deviceClass: null, _lastBlobUrl: "", _microphoneId: null, _disposed: !1, _initializeSettings: function() {
                    this._settings = new Platform.Media.Capture.MediaCaptureInitializationSettings;
                    this._settings.videoDeviceId = "";
                    this._settings.streamingCaptureMode = Platform.Media.Capture.StreamingCaptureMode.audio
                }, isDeviceAvailable: {get: function() {
                        return this._isDeviceAvailable()
                    }}, isRecording: {get: function() {
                        return this._isRecording()
                    }}, recordTimeTotal: {get: function() {
                        return this._recordTimeTotal()
                    }}, microphoneId: {
                    get: function() {
                        return this._microphoneId
                    }, set: function(value) {
                            this._microphoneId = value
                        }
                }, initialize: function(isControlLoadedObservable) {
                    util.enumerateDeviceIds(this._deviceClass, Platform).then(function(deviceIds) {
                        this._deviceList = deviceIds
                    }.bind(this)).then(null, function(err){}).then(function() {
                        !this._disposed && this._settings && this.updateAvailableStatus()
                    }.bind(this)).done(function() {
                        isControlLoadedObservable(!0)
                    })
                }, dispose: function() {
                    this._disposed = !0;
                    this._destroyMediaCapture();
                    this._stopDevice();
                    this._releaseBlobUrl("")
                }, updateAvailableStatus: function() {
                    if (this._deviceList.length > this._microphoneId && this._microphoneId >= 0) {
                        this._settings.audioDeviceId = this._deviceList[this._microphoneId];
                        this._destroyMediaCapture();
                        this._mediaCapture = new Platform.Media.Capture.MediaCapture;
                        this._mediaCapture.addEventListener("failed", this._onFailedHandler);
                        this._mediaCapture.addEventListener("recordlimitationexceeded", this._onRecordLimitationExceededHandler);
                        try {
                            return this._mediaCapture.initializeAsync(this._settings).then(function() {
                                    this._isDeviceAvailable(!0)
                                }.bind(this), function() {
                                    this._isDeviceAvailable(!1)
                                }.bind(this))
                        }
                        catch(e) {}
                    }
                    return WinJS.Promise.wrap().then(function() {
                            this._isDeviceAvailable(!1)
                        }.bind(this))
                }, actionHandler: function(isDisabled) {
                    if (isDisabled && this._isRecording()) {
                        this._stopRecord();
                        return
                    }
                    this._isRecording() ? this._stopRecord() : this._isDeviceAvailable() && this._startRecord().done(null, this._onFailedHandler)
                }, _destroyMediaCapture: function() {
                    this._mediaCapture && (this._mediaCapture.removeEventListener("failed", this._onFailedHandler), this._mediaCapture.removeEventListener("recordlimitationexceeded", this._onRecordLimitationExceededHandler), this._mediaCapture = null)
                }, _updateRecordTimeTotal: function(microphone) {
                    microphone._isRecording() && microphone._recordTimeTotal(util.secondsToHHMMSS(Math.floor((Date.now() - microphone._recordTimeStart) / 1e3)))
                }, _startRecord: function() {
                    this._audioStream = new Platform.Storage.Streams.InMemoryRandomAccessStream;
                    try {
                        return this._mediaCapture.startRecordToStreamAsync(this._encodingProfile, this._audioStream).then(function() {
                                this._recordTimeStart = Date.now();
                                this._isRecording(!0);
                                this._recordTimeTotal(util.secondsToHHMMSS(0));
                                this._updateTimerId = setInterval(this._updateRecordTimeTotal, this._updateTimerInterval, this);
                                this._onStartFunction()
                            }.bind(this), this._onFailedHandler)
                    }
                    catch(e) {
                        return WinJS.Promise.wrap(!1)
                    }
                }, _setStopRecordState: function() {
                    this._isRecording(!1);
                    this._updateTimerId !== null && (clearInterval(this._updateTimerId), this._updateTimerId = null)
                }, _stopRecord: function() {
                    try {
                        return this._mediaCapture.stopRecordAsync().then(function() {
                                this._setStopRecordState();
                                var mediaType = this._encodingProfile.audio.type.toLowerCase() + "/" + this._encodingProfile.audio.subtype.toLowerCase(),
                                    url = AppMagic.Utility.blobManager.create(mediaType, this._audioStream);
                                url && (AppMagic.Utility.blobManager.addRef(url), this._controlContext.modelProperties.Audio.setValue(url), this._releaseBlobUrl(url));
                                this._onStopFunction()
                            }.bind(this), this._onFailedHandler).then(this._stopDeviceBound).done(null, this._onFailedHandler)
                    }
                    catch(e) {
                        return WinJS.Promise.wrap(!1)
                    }
                }, _releaseBlobUrl: function(newUrl) {
                    this._lastBlobUrl && AppMagic.Utility.blobManager.release(this._lastBlobUrl);
                    this._lastBlobUrl = newUrl
                }, _stopDevice: function() {
                    this._audioStream && (this._audioStream.close(), this._audioStream = null)
                }, _onFailed: function(err) {
                    this._setStopRecordState();
                    this._stopDevice();
                    this.updateAvailableStatus()
                }, _onRecordLimitationExceeded: function(eventArgs) {
                    this._controlContext.onClick(this._controlContext)
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Controls", {MicrophoneViewModel: MicrophoneViewModel})
})(Windows);