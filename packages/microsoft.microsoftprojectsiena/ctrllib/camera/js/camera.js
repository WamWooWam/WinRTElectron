//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Controls;
    (function(Controls) {
        var CameraDevice = function() {
                function CameraDevice(deviceId, container) {
                    this._isDisposed = !1;
                    this._disposedEvent = new EventObject;
                    this._stoppedEvent = new EventObject;
                    this._deviceId = deviceId;
                    this._container = container
                }
                return Object.defineProperty(CameraDevice.prototype, "disposedEvent", {
                        get: function() {
                            return this._disposedEvent
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(CameraDevice.prototype, "stoppedEvent", {
                        get: function() {
                            return this._stoppedEvent
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(CameraDevice.prototype, "active", {
                            get: function() {
                                return !1
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(CameraDevice.prototype, "horizontalMirror", {
                            get: function() {
                                return !1
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(CameraDevice.prototype, "supportsStreaming", {
                            get: function() {
                                return !0
                            }, enumerable: !0, configurable: !0
                        }), CameraDevice.prototype.setBrightness = function(brightnessValue){}, CameraDevice.prototype.setContrast = function(contrastValue){}, CameraDevice.prototype.setZoom = function(zoomValue){}, CameraDevice.prototype.capturePhotoAsync = function() {
                            return null
                        }, CameraDevice.prototype.startStreamAsync = function() {
                            return null
                        }, CameraDevice.prototype.stopStream = function(){}, CameraDevice.prototype.dispose = function() {
                            this._isDisposed || (this._isDisposed = !0, this._disposedEvent.dispatch(), this._disposedEvent.dispose(), this._stoppedEvent.dispose())
                        }, CameraDevice
            }();
        Controls.CameraDevice = CameraDevice
    })(Controls = AppMagic.Controls || (AppMagic.Controls = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            b.hasOwnProperty(p) && (d[p] = b[p]);
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    },
    AppMagic;
(function(AppMagic) {
    var Controls;
    (function(Controls) {
        var CanvasCameraDevice = function(_super) {
                __extends(CanvasCameraDevice, _super);
                function CanvasCameraDevice(deviceId, container) {
                    _super.call(this, deviceId, container);
                    this.QUALITY = 75;
                    this.WIDTH = 640;
                    this.HEIGHT = 480;
                    this._canvasElement = document.createElement("canvas");
                    this._canvasElement.className = "appmagic-camera-canvas";
                    this._container.appendChild(this._canvasElement)
                }
                return Object.defineProperty(CanvasCameraDevice.prototype, "active", {
                        get: function() {
                            return !0
                        }, enumerable: !0, configurable: !0
                    }), CanvasCameraDevice.prototype.dispose = function() {
                        _super.prototype.dispose.call(this);
                        this._canvasElement.parentNode.removeChild(this._canvasElement);
                        this._canvasElement = null
                    }, CanvasCameraDevice.prototype.setZoom = function(zoomValue){}, CanvasCameraDevice.prototype.setBrightness = function(brightnessValue){}, CanvasCameraDevice.prototype.setContrast = function(contrastValue){}, CanvasCameraDevice.prototype.capturePhotoAsync = function() {
                            var completablePromise = Core.Promise.createCompletablePromise();
                            return CanvasCamera.takePicture(function(result) {
                                    var imageData = "file://" + result.imageURI;
                                    completablePromise.complete(imageData)
                                }, completablePromise.error), completablePromise.promise
                        }, CanvasCameraDevice.prototype.startStreamAsync = function() {
                            CanvasCamera.initialize(this._canvasElement);
                            var completablePromise = Core.Promise.createCompletablePromise(),
                                opt = {
                                    quality: this.QUALITY, destinationType: CanvasCamera.DestinationType.FILE_URI, encodingType: CanvasCamera.EncodingType.JPEG, width: this.WIDTH, height: this.HEIGHT, position: this._deviceId
                                };
                            return CanvasCamera.start(opt, completablePromise.complete, completablePromise.error), completablePromise.promise
                        }, CanvasCameraDevice.prototype.stopStream = function() {
                            CanvasCamera.stop()
                        }, CanvasCameraDevice
            }(Controls.CameraDevice);
        Controls.CanvasCameraDevice = CanvasCameraDevice
    })(Controls = AppMagic.Controls || (AppMagic.Controls = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Controls;
    (function(Controls) {
        var CanvasCameraDeviceCollection = function() {
                function CanvasCameraDeviceCollection() {
                    this._deviceAvailableEvent = new EventObject
                }
                return Object.defineProperty(CanvasCameraDeviceCollection.prototype, "deviceAvailableEvent", {
                        get: function() {
                            return this._deviceAvailableEvent
                        }, enumerable: !0, configurable: !0
                    }), CanvasCameraDeviceCollection.prototype.getAvailableIndex = function() {
                        return CanvasCamera.CameraPosition.BACK
                    }, CanvasCameraDeviceCollection.prototype.acquireDevice = function(index, container) {
                            return new Controls.CanvasCameraDevice(index.toString(), container)
                        }, CanvasCameraDeviceCollection.prototype.startWatchingForDevices = function() {
                            this._deviceAvailableEvent.dispatch()
                        }, CanvasCameraDeviceCollection
            }();
        Controls.CanvasCameraDeviceCollection = CanvasCameraDeviceCollection
    })(Controls = AppMagic.Controls || (AppMagic.Controls = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Controls;
    (function(Controls) {
        var Html5CameraDeviceCollection = function() {
                function Html5CameraDeviceCollection() {
                    this._deviceAvailableEvent = new EventObject;
                    this._availableDevices = []
                }
                return Object.defineProperty(Html5CameraDeviceCollection.prototype, "deviceAvailableEvent", {
                        get: function() {
                            return this._deviceAvailableEvent
                        }, enumerable: !0, configurable: !0
                    }), Html5CameraDeviceCollection.prototype.getAvailableIndex = function() {
                        return 0
                    }, Html5CameraDeviceCollection.prototype.acquireDevice = function(index, container) {
                            return index >= this._availableDevices.length ? null : new Controls.Html5CameraDevice(this._availableDevices[index].id, container)
                        }, Html5CameraDeviceCollection.prototype.startWatchingForDevices = function() {
                            MediaStreamTrack.getSources(this._onGetSources.bind(this))
                        }, Html5CameraDeviceCollection.prototype._onGetSources = function(mediaSources) {
                            this._availableDevices = [];
                            for (var i = 0, len = mediaSources.length; i < len; i++)
                                mediaSources[i].kind === "video" && this._availableDevices.push(mediaSources[i]);
                            this._availableDevices.length > 0 && this._deviceAvailableEvent.dispatch()
                        }, Html5CameraDeviceCollection
            }();
        Controls.Html5CameraDeviceCollection = Html5CameraDeviceCollection
    })(Controls = AppMagic.Controls || (AppMagic.Controls = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Controls;
    (function(Controls) {
        var VideoCameraDevice = function(_super) {
                __extends(VideoCameraDevice, _super);
                function VideoCameraDevice(deviceId, container) {
                    _super.call(this, deviceId, container);
                    this._videoElement = document.createElement("video");
                    this._videoElement.className = "appmagic-camera-video";
                    this._container.appendChild(this._videoElement)
                }
                return Object.defineProperty(VideoCameraDevice.prototype, "videoElement", {
                        get: function() {
                            return this._videoElement
                        }, enumerable: !0, configurable: !0
                    }), VideoCameraDevice.prototype.dispose = function() {
                        _super.prototype.dispose.call(this);
                        this._videoElement.parentNode.removeChild(this._videoElement);
                        this._videoElement = null
                    }, VideoCameraDevice.prototype._playVideo = function(url) {
                            this._videoElement.src !== null && this._videoElement.src !== "" && URL.revokeObjectURL(this._videoElement.src);
                            try {
                                this._videoElement.src = url
                            }
                            catch(e) {
                                this._videoElement.src = url
                            }
                            this._videoElement.msHorizontalMirror = this.horizontalMirror;
                            url !== null && this._videoElement.play()
                        }, VideoCameraDevice
            }(Controls.CameraDevice);
        Controls.VideoCameraDevice = VideoCameraDevice
    })(Controls = AppMagic.Controls || (AppMagic.Controls = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Controls;
    (function(Controls) {
        var Html5CameraDevice = function(_super) {
                __extends(Html5CameraDevice, _super);
                function Html5CameraDevice(deviceId, container) {
                    _super.call(this, deviceId, container);
                    this._currentStream = null;
                    this._elementRenderer = new AppMagic.Utility.ElementRenderer
                }
                return Object.defineProperty(Html5CameraDevice.prototype, "active", {
                        get: function() {
                            return this._currentStream !== null
                        }, enumerable: !0, configurable: !0
                    }), Html5CameraDevice.prototype.setZoom = function(zoomValue){}, Html5CameraDevice.prototype.setBrightness = function(brightnessValue){}, Html5CameraDevice.prototype.setContrast = function(contrastValue){}, Html5CameraDevice.prototype.capturePhotoAsync = function() {
                            var videoWidth = this.videoElement.videoWidth,
                                videoHeight = this.videoElement.videoHeight,
                                url = this._elementRenderer.renderElementToDataUrl(this.videoElement, videoWidth, videoHeight);
                            return WinJS.Promise.as(url)
                        }, Html5CameraDevice.prototype.startStreamAsync = function() {
                            var _this = this,
                                completablePromise = Core.Promise.createCompletablePromise(),
                                constraints = {video: {optional: [{sourceId: this._deviceId}]}};
                            return navigator.getUserMedia(constraints, function(localMediaStream) {
                                    _this._currentStream = localMediaStream;
                                    var url = URL.createObjectURL(localMediaStream);
                                    _this.videoElement.src = url;
                                    _this.videoElement.play();
                                    completablePromise.complete()
                                }, function(err) {
                                    completablePromise.error(err)
                                }), completablePromise.promise
                        }, Html5CameraDevice.prototype.stopStream = function() {
                            this._currentStream && (this._currentStream.stop(), this._currentStream = null, this.videoElement.src = "", this._stoppedEvent.dispatch())
                        }, Html5CameraDevice.prototype.dispose = function() {
                            _super.prototype.dispose.call(this);
                            this._elementRenderer.dispose();
                            this._elementRenderer = null
                        }, Html5CameraDevice
            }(Controls.VideoCameraDevice);
        Controls.Html5CameraDevice = Html5CameraDevice
    })(Controls = AppMagic.Controls || (AppMagic.Controls = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Controls;
    (function(Controls) {
        var CordovaCameraDevice = function(_super) {
                __extends(CordovaCameraDevice, _super);
                function CordovaCameraDevice() {
                    _super.apply(this, arguments)
                }
                return Object.defineProperty(CordovaCameraDevice.prototype, "active", {
                        get: function() {
                            return !0
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(CordovaCameraDevice.prototype, "supportsStreaming", {
                        get: function() {
                            return !1
                        }, enumerable: !0, configurable: !0
                    }), CordovaCameraDevice.prototype.setZoom = function(zoomValue){}, CordovaCameraDevice.prototype.setBrightness = function(brightnessValue){}, CordovaCameraDevice.prototype.setContrast = function(contrastValue){}, CordovaCameraDevice.prototype.capturePhotoAsync = function() {
                            var completablePromise = Core.Promise.createCompletablePromise();
                            return navigator.camera.getPicture(function(imageData) {
                                    imageData = "data:image/jpeg;base64," + imageData;
                                    completablePromise.complete(imageData)
                                }, function(message) {
                                    completablePromise.error(message)
                                }, {
                                    destinationType: navigator.camera.DestinationType.DATA_URL, cameraDirection: this._deviceId, mediaType: navigator.camera.MediaType.PICTURE
                                }), completablePromise.promise
                        }, CordovaCameraDevice.prototype.startStreamAsync = function() {
                            return WinJS.Promise.wrap()
                        }, CordovaCameraDevice.prototype.stopStream = function(){}, CordovaCameraDevice
            }(Controls.CameraDevice);
        Controls.CordovaCameraDevice = CordovaCameraDevice
    })(Controls = AppMagic.Controls || (AppMagic.Controls = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Controls;
    (function(Controls) {
        var CameraDeviceCollectionFactory = function() {
                function CameraDeviceCollectionFactory(){}
                return CameraDeviceCollectionFactory.getInstance = function() {
                        return CameraDeviceCollectionFactory._instance || (CameraDeviceCollectionFactory._instance = CameraDeviceCollectionFactory._createInstance()), CameraDeviceCollectionFactory._instance
                    }, CameraDeviceCollectionFactory._createInstance = function() {
                        return WinJS.Utilities.hasWinRT ? new Controls.WindowsCameraDeviceCollection : CameraDeviceCollectionFactory._isGetUserMediaAvailable() ? new Controls.Html5CameraDeviceCollection : CameraDeviceCollectionFactory._isCanvasCameraAvailable() ? new Controls.CanvasCameraDeviceCollection : CameraDeviceCollectionFactory._isCordovaCapturePhotoAvailable() ? new Controls.CordovaCameraDeviceCollection : new Controls.NullCameraDeviceCollection
                    }, CameraDeviceCollectionFactory._isCanvasCameraAvailable = function() {
                            return !!CanvasCamera
                        }, CameraDeviceCollectionFactory._isCordovaCapturePhotoAvailable = function() {
                            return !!navigator.camera && !!navigator.camera.getPicture
                        }, CameraDeviceCollectionFactory._isGetUserMediaAvailable = function() {
                            return navigator.getUserMedia && window.MediaStreamTrack && window.MediaStreamTrack.getSources
                        }, CameraDeviceCollectionFactory
            }();
        Controls.CameraDeviceCollectionFactory = CameraDeviceCollectionFactory
    })(Controls = AppMagic.Controls || (AppMagic.Controls = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Controls;
    (function(Controls) {
        var NullCameraDeviceCollection = function() {
                function NullCameraDeviceCollection() {
                    this._deviceAvailable = new EventObject
                }
                return Object.defineProperty(NullCameraDeviceCollection.prototype, "deviceAvailableEvent", {
                        get: function() {
                            return this._deviceAvailable
                        }, enumerable: !0, configurable: !0
                    }), NullCameraDeviceCollection.prototype.getAvailableIndex = function() {
                        return -1
                    }, NullCameraDeviceCollection.prototype.acquireDevice = function(index) {
                            return null
                        }, NullCameraDeviceCollection.prototype.startWatchingForDevices = function(){}, NullCameraDeviceCollection
            }();
        Controls.NullCameraDeviceCollection = NullCameraDeviceCollection
    })(Controls = AppMagic.Controls || (AppMagic.Controls = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Controls;
    (function(Controls) {
        var CordovaCameraDeviceCollection = function() {
                function CordovaCameraDeviceCollection() {
                    this._deviceAvailableEvent = new EventObject
                }
                return Object.defineProperty(CordovaCameraDeviceCollection.prototype, "deviceAvailableEvent", {
                        get: function() {
                            return this._deviceAvailableEvent
                        }, enumerable: !0, configurable: !0
                    }), CordovaCameraDeviceCollection.prototype.getAvailableIndex = function() {
                        return navigator.camera.Direction.BACK
                    }, CordovaCameraDeviceCollection.prototype.acquireDevice = function(index, container) {
                            return new Controls.CordovaCameraDevice(index.toString(), container)
                        }, CordovaCameraDeviceCollection.prototype.startWatchingForDevices = function() {
                            this._deviceAvailableEvent.dispatch()
                        }, CordovaCameraDeviceCollection
            }();
        Controls.CordovaCameraDeviceCollection = CordovaCameraDeviceCollection
    })(Controls = AppMagic.Controls || (AppMagic.Controls = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Controls;
    (function(Controls) {
        var WindowsCameraDeviceCollection = function() {
                function WindowsCameraDeviceCollection(watcher) {
                    this._watcher = null;
                    this._devices = null;
                    watcher = watcher || Windows.Devices.Enumeration.DeviceInformation.createWatcher(Windows.Devices.Enumeration.DeviceClass.videoCapture);
                    this._watcher = watcher;
                    this._devices = [];
                    this._deviceAvailableEvent = new EventObject;
                    this._watcher.addEventListener("added", this._onAdded.bind(this));
                    this._watcher.addEventListener("removed", this._onRemoved.bind(this))
                }
                return Object.defineProperty(WindowsCameraDeviceCollection.prototype, "deviceAvailableEvent", {
                        get: function() {
                            return this._deviceAvailableEvent
                        }, enumerable: !0, configurable: !0
                    }), WindowsCameraDeviceCollection.prototype.acquireDevice = function(index, container) {
                        var entry = this._devices[index];
                        return entry && entry.device === null ? (entry.device = new Controls.WindowsCameraDevice(entry.info, container), entry.device.disposedEvent.addListener(function() {
                                entry.removing || (entry.device = null, this._deviceAvailableEvent.dispatch())
                            }.bind(this)), entry.device) : null
                    }, WindowsCameraDeviceCollection.prototype.startWatchingForDevices = function() {
                            this._watcher.status === Windows.Devices.Enumeration.DeviceWatcherStatus.created && this._watcher.start()
                        }, WindowsCameraDeviceCollection.prototype.getAvailableIndex = function() {
                            for (var i = 0, len = this._devices.length; i < len; i++)
                                if (this._devices[i] && this._devices[i].device === null)
                                    return i;
                            return i = this._devices.indexOf(null), i >= 0 ? i : len
                        }, WindowsCameraDeviceCollection.prototype._onAdded = function(deviceInfo) {
                            var entry = {
                                    info: deviceInfo, device: null, removing: !1
                                },
                                i = this._devices.indexOf(null);
                            i >= 0 ? this._devices[i] = entry : this._devices.push(entry);
                            this._deviceAvailableEvent.dispatch()
                        }, WindowsCameraDeviceCollection.prototype._onRemoved = function(deviceInfo) {
                            for (var i = 0, len = this._devices.length; i < len; i++) {
                                var entry = this._devices[i];
                                entry && entry.info.id === deviceInfo.id && (this._devices[i] = null, entry.removing = !0, entry.device && entry.device.dispose())
                            }
                        }, WindowsCameraDeviceCollection
            }();
        Controls.WindowsCameraDeviceCollection = WindowsCameraDeviceCollection
    })(Controls = AppMagic.Controls || (AppMagic.Controls = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Controls;
    (function(Controls) {
        var WINRT_INVALID_STATE_ERROR = -1072875854,
            CLASS_NOT_REGISTERED_ERROR = -2147221164,
            NormalizedPropertyRange = {
                min: 0, max: 100, "default": 50
            },
            WindowsCameraDevice = function(_super) {
                __extends(WindowsCameraDevice, _super);
                function WindowsCameraDevice(deviceInfo, container) {
                    _super.call(this, deviceInfo.id, container);
                    this._deviceInfo = null;
                    this._mediaCapture = null;
                    this._onFailedHandler = null;
                    this._photoProperties = null;
                    this._deviceInfo = deviceInfo;
                    this._mediaCapture = ko.observable(null);
                    this._onFailedHandler = this._onFailed.bind(this)
                }
                return Object.defineProperty(WindowsCameraDevice.prototype, "active", {
                        get: function() {
                            return this._mediaCapture() !== null
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(WindowsCameraDevice.prototype, "horizontalMirror", {
                        get: function() {
                            return this._deviceInfo.enclosureLocation ? this._deviceInfo.enclosureLocation.panel === Windows.Devices.Enumeration.Panel.front : !1
                        }, enumerable: !0, configurable: !0
                    }), WindowsCameraDevice.prototype.capturePhotoAsync = function() {
                            for (var imageMemoryStream = new Windows.Storage.Streams.InMemoryRandomAccessStream, NUM_TIMES_TO_TRY_AGAIN = 2, i = 0; i < NUM_TIMES_TO_TRY_AGAIN; i++)
                                try {
                                    return this._mediaCapture().capturePhotoToStreamAsync(this._photoProperties, imageMemoryStream).then(function() {
                                            var url = AppMagic.Utility.blobManager.create("image/jpeg", imageMemoryStream);
                                            return imageMemoryStream.close(), url ? (AppMagic.Utility.blobManager.addRef(url), WinJS.Promise.wrap(url)) : WinJS.Promise.wrapError()
                                        }.bind(this), function(error) {
                                            return imageMemoryStream.close(), WinJS.Promise.wrapError(error)
                                        })
                                }
                                catch(ex) {
                                    if (ex.number !== WINRT_INVALID_STATE_ERROR)
                                        return WinJS.Promise.wrapError(ex)
                                }
                            return WinJS.Promise.wrapError()
                        }, WindowsCameraDevice.prototype.dispose = function() {
                            this._isDisposed || (this.stopStream(), _super.prototype.dispose.call(this))
                        }, WindowsCameraDevice.prototype.setZoom = function(zoomValue) {
                            this.setProperty("zoom", zoomValue)
                        }, WindowsCameraDevice.prototype.setBrightness = function(brightnessValue) {
                            this.setProperty("brightness", brightnessValue)
                        }, WindowsCameraDevice.prototype.setContrast = function(contrastValue) {
                            this.setProperty("contrast", contrastValue)
                        }, WindowsCameraDevice.prototype.setProperty = function(propertyName, value) {
                            this._setProperty(propertyName, function(property) {
                                property.capabilities.supported && typeof value == "number" ? (value = WindowsCameraDevice.mapPropertyToDeviceValue(property.capabilities, value), property.trySetValue(value)) : property.trySetValue(property.capabilities.default)
                            }.bind(this))
                        }, WindowsCameraDevice.prototype.setPropertyAuto = function(propertyName, value) {
                            this._setProperty(propertyName, function(property) {
                                property.trySetAuto(value)
                            })
                        }, WindowsCameraDevice.prototype.startStreamAsync = function() {
                            var settings,
                                mediaCapture;
                            try {
                                settings = new Windows.Media.Capture.MediaCaptureInitializationSettings;
                                settings.audioDeviceId = "";
                                settings.videoDeviceId = this._deviceInfo.id;
                                settings.photoCaptureSource = Windows.Media.Capture.PhotoCaptureSource.videoPreview;
                                settings.streamingCaptureMode = Windows.Media.Capture.StreamingCaptureMode.video;
                                this._photoProperties = Windows.Media.MediaProperties.ImageEncodingProperties.createJpeg();
                                mediaCapture = new Windows.Media.Capture.MediaCapture
                            }
                            catch(e) {
                                return WinJS.Promise.wrapError(e)
                            }
                            return this._mediaCapture(mediaCapture), mediaCapture.addEventListener("failed", this._onFailedHandler), mediaCapture.initializeAsync(settings).then(function() {
                                        if (this._isDisposed)
                                            return WinJS.Promise.wrapError();
                                        this.setPropertyAuto("exposure", !0);
                                        var url = URL.createObjectURL(mediaCapture, {oneTimeOnly: !0});
                                        return this._playVideo(url), WinJS.Promise.wrap(null)
                                    }.bind(this)).then(null, function(error) {
                                        return this._isDisposed || this.stopStream(), WinJS.Promise.wrapError(error)
                                    }.bind(this))
                        }, WindowsCameraDevice.prototype.stopStream = function() {
                            this._mediaCapture() && (this._mediaCapture().removeEventListener("failed", this._onFailedHandler), this._mediaCapture(null), this._playVideo(null), this._stoppedEvent.dispatch())
                        }, WindowsCameraDevice.prototype._onFailed = function() {
                            this.stopStream()
                        }, WindowsCameraDevice.prototype._setProperty = function(propertyName, callback) {
                            try {
                                var videoController = this._mediaCapture().videoDeviceController;
                                var property = videoController[propertyName];
                                callback(property)
                            }
                            catch(err) {}
                        }, Object.defineProperty(WindowsCameraDevice.prototype, "deviceId", {
                            get: function() {
                                return this._deviceInfo.id
                            }, enumerable: !0, configurable: !0
                        }), WindowsCameraDevice.mapPropertyToDeviceValue = function(caps, value) {
                            value = Core.Utility.clamp(value, NormalizedPropertyRange.min, NormalizedPropertyRange.max);
                            var capsDefault = Core.Utility.clamp(caps.default, caps.min, caps.max);
                            return caps.min < caps.max ? value < NormalizedPropertyRange.default ? this._mapRange(value, NormalizedPropertyRange.min, NormalizedPropertyRange.default, caps.min, capsDefault) : this._mapRange(value, NormalizedPropertyRange.default, NormalizedPropertyRange.max, capsDefault, caps.max) : caps.min
                        }, WindowsCameraDevice._mapRange = function(value, min1, max1, min2, max2) {
                            return value = (value - min1) / (max1 - min1), value * (max2 - min2) + min2
                        }, WindowsCameraDevice
            }(Controls.VideoCameraDevice);
        Controls.WindowsCameraDevice = WindowsCameraDevice
    })(Controls = AppMagic.Controls || (AppMagic.Controls = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Controls;
    (function(Controls) {
        var Camera = function() {
                function Camera() {
                    this.cameraViewModel = null
                }
                return Camera.prototype.initView = function(container, controlContext) {
                        this.cameraViewModel = new AppMagic.Controls.CameraViewModel(this, controlContext, Controls.CameraDeviceCollectionFactory.getInstance());
                        AppMagic.Utility.createOrSetPrivate(controlContext, "cameraViewModel", this.cameraViewModel);
                        controlContext.cameraViewModel.init(container);
                        ko.applyBindings(controlContext.cameraViewModel, container)
                    }, Camera.prototype.disposeView = function(container, controlContext) {
                        controlContext.cameraViewModel.dispose(container)
                    }, Camera.prototype.onChangeBrightness = function(evt, controlContext) {
                            controlContext.realized && controlContext.cameraViewModel.changeBrightness(evt)
                        }, Camera.prototype.onChangeContrast = function(evt, controlContext) {
                            controlContext.realized && controlContext.cameraViewModel.changeContrast(evt)
                        }, Camera.prototype.onChangeZoom = function(evt, controlContext) {
                            controlContext.realized && controlContext.cameraViewModel.changeZoom(evt)
                        }, Camera.prototype.onChangeCamera = function(evt, controlContext) {
                            controlContext.realized && controlContext.cameraViewModel.changeCamera(evt)
                        }, Camera
            }();
        Controls.Camera = Camera
    })(Controls = AppMagic.Controls || (AppMagic.Controls = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Controls;
    (function(Controls) {
        var CameraViewModel = function() {
                function CameraViewModel(cameraView, controlContext, cameraDeviceCollection) {
                    this._device = null;
                    this._acquireAttempted = null;
                    this._onDeviceAvailableHandler = null;
                    this._onDeviceDisposedHandler = null;
                    this._onDeviceStoppedHandler = null;
                    this._onVisibilityChangeHandler = null;
                    this._onClickHandler = null;
                    this._controlId = null;
                    this._lastBlobUrl = "";
                    this._displayError = null;
                    this._camera = null;
                    this._controlContext = null;
                    this._properties = null;
                    this._camera = cameraView;
                    this._cameraDeviceCollection = cameraDeviceCollection;
                    this._controlContext = controlContext;
                    this._properties = this._controlContext.properties;
                    this._device = ko.observable(null);
                    this._acquireAttempted = ko.observable(!1);
                    this._onDeviceAvailableHandler = this._onDeviceAvailable.bind(this);
                    this._onDeviceDisposedHandler = this._onDeviceDisposed.bind(this);
                    this._onDeviceStoppedHandler = this._onDeviceStopped.bind(this);
                    this._onVisibilityChangeHandler = this._onVisibilityChange.bind(this);
                    this._onClickHandler = this.onClick.bind(this);
                    this._displayError = ko.observable(!1)
                }
                return Object.defineProperty(CameraViewModel.prototype, "isDisabled", {
                        get: function() {
                            return this._isDisabled()
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(CameraViewModel.prototype, "properties", {
                        get: function() {
                            return this._properties
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(CameraViewModel.prototype, "supportsStreaming", {
                            get: function() {
                                return this._supportsStreaming()
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(CameraViewModel.prototype, "state", {
                            get: function() {
                                if (this._displayError())
                                    return "error";
                                if (!this._acquireAttempted())
                                    return "active";
                                var device = this._device();
                                return device ? "active" : "error"
                            }, enumerable: !0, configurable: !0
                        }), CameraViewModel.prototype.init = function(container) {
                            this._isDisabled = ko.computed(function() {
                                var disabled = this._properties.Disabled(),
                                    parentDisabled = this._controlContext.controlWidget.isParentDisabled(this._controlContext),
                                    screenInactive = !this._controlContext.isParentScreenActive();
                                return disabled || parentDisabled || screenInactive
                            }.bind(this));
                            this._isDisabled.subscribe(function(newValue) {
                                newValue ? this._disposeDevice() : this._acquireDevice(null)
                            }.bind(this));
                            this._supportsStreaming = ko.computed(function() {
                                var device = this._device();
                                return device ? device.supportsStreaming : !0
                            }.bind(this));
                            container.addEventListener("click", this._onClickHandler);
                            this._properties.Photo("");
                            this._cameraDeviceCollection.deviceAvailableEvent.addListener(this._onDeviceAvailableHandler);
                            document.addEventListener("visibilitychange", this._onVisibilityChangeHandler, !1);
                            this._cameraDeviceCollection.startWatchingForDevices();
                            this._properties.Camera() !== -1 && this._acquireDevice(null)
                        }, CameraViewModel.prototype.dispose = function(container) {
                            container.removeEventListener("click", this._onClickHandler);
                            this._onClickHandler = null;
                            this._isDisabled.dispose();
                            this._isDisabled = null;
                            this._disposeDevice();
                            this._cameraDeviceCollection.deviceAvailableEvent.removeListener(this._onDeviceAvailableHandler);
                            document.removeEventListener("visibilitychange", this._onVisibilityChangeHandler, !1);
                            this._attachBlobUrl("")
                        }, CameraViewModel.prototype.changeBrightness = function(evt) {
                            var device = this._device();
                            device && device.active && device.setBrightness(evt.newValue)
                        }, CameraViewModel.prototype.changeContrast = function(evt) {
                            var device = this._device();
                            device && device.active && device.setContrast(evt.newValue)
                        }, CameraViewModel.prototype.changeZoom = function(evt) {
                            var device = this._device();
                            device && device.active && device.setZoom(evt.newValue)
                        }, CameraViewModel.prototype.changeCamera = function(evt) {
                            this._disposeDevice();
                            this._acquireDevice(null)
                        }, CameraViewModel.prototype.getDefaultScriptCamera = function() {
                            var index = this._cameraDeviceCollection.getAvailableIndex();
                            return index.toString()
                        }, CameraViewModel.prototype.onClick = function(evt) {
                            if (!this.isDisabled) {
                                var device = this._device();
                                if (!device || !device.active) {
                                    this._properties.Photo("");
                                    this._camera.OpenAjax.fireEvent("OnSelect", this._controlContext);
                                    return
                                }
                                device.capturePhotoAsync().then(function(url) {
                                    this._properties.Photo(url);
                                    this._attachBlobUrl(url);
                                    this._camera.OpenAjax.fireEvent("OnSelect", this._controlContext)
                                }.bind(this), function(){})
                            }
                        }, CameraViewModel.prototype._attachBlobUrl = function(newUrl) {
                            this._lastBlobUrl && AppMagic.Utility.blobManager.release(this._lastBlobUrl);
                            this._lastBlobUrl = newUrl
                        }, CameraViewModel.prototype._acquireDevice = function(indexOverride) {
                            if (this._device() === null && !this._isDisabled()) {
                                var index = indexOverride === null ? this._properties.Camera() : indexOverride;
                                if (typeof index == "number") {
                                    var streamContainer = this._controlContext.container.querySelector("div.appmagic-camera-stream");
                                    var device = this._cameraDeviceCollection.acquireDevice(index, streamContainer);
                                    device && (this._device(device), device.disposedEvent.addListener(this._onDeviceDisposedHandler), device.stoppedEvent.addListener(this._onDeviceStoppedHandler), this._startDevice())
                                }
                                this._acquireAttempted(!0)
                            }
                        }, CameraViewModel.prototype._disposeDevice = function() {
                            var device = this._device();
                            device !== null && (device.dispose(), this._device(null))
                        }, CameraViewModel.prototype._onDeviceAvailable = function() {
                            this._acquireDevice(null)
                        }, CameraViewModel.prototype._onDeviceDisposed = function() {
                            this._device(null)
                        }, CameraViewModel.prototype._onDeviceStopped = function() {
                            this._stopDevice()
                        }, CameraViewModel.prototype._onVisibilityChange = function() {
                            document.hidden || this._startDevice()
                        }, CameraViewModel.prototype._startDevice = function() {
                            var device = this._device();
                            device !== null && !this._properties.Disabled() && this.supportsStreaming && (this._stopDevice(), this._displayError(!1), device.startStreamAsync().then(function() {
                                    device.setBrightness(this._properties.Brightness());
                                    device.setContrast(this._properties.Contrast());
                                    device.setZoom(this._properties.Zoom());
                                    this._displayError(!1)
                                }.bind(this), function(error) {
                                    this._displayError(!0)
                                }.bind(this)))
                        }, CameraViewModel.prototype._stopDevice = function() {
                            var device = this._device();
                            device !== null && (device.stopStream(), this._displayError(!0))
                        }, CameraViewModel
            }();
        Controls.CameraViewModel = CameraViewModel
    })(Controls = AppMagic.Controls || (AppMagic.Controls = {}))
})(AppMagic || (AppMagic = {}));