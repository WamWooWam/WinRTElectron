

(function () {
    "use strict";

    var BackgroundAccessStatus = Windows.ApplicationModel.Background.BackgroundAccessStatus;

    
    var accessStatusLookupTable = [];
    accessStatusLookupTable[BackgroundAccessStatus.unspecified] = "unspecified";
    accessStatusLookupTable[BackgroundAccessStatus.allowedMayUseActiveRealTimeConnectivity] = "allowedMayUseActiveRealTimeConnectivity";
    accessStatusLookupTable[BackgroundAccessStatus.allowedWithAlwaysOnRealTimeConnectivity] = "allowedWithAlwaysOnRealTimeConnectivity";
    accessStatusLookupTable[BackgroundAccessStatus.denied] = "denied";

    var devicesAccessStatuses = {
        allowed: "allowed",
        blocked: "blocked",
        noDevices: "noDevices",
        error: "error",
    };

    
    
    
    function requestAll() {
        return new WinJS.Promise(
            function (onCompleted) {
                log("Skype.Permissions.requestAll");
                requestDevicesAccess()
                    .then(function requestDevicesAccessCompleted(deviceAccessStatus) {
                        log("Skype.Permissions._requestMicrophoneWebcamAccess: " + deviceAccessStatus);
                        roboSky.write("Permissions,devices");
                        return requestLockScreenAccess();
                    })
                    .done(function requestLockScreenAccessCompleted(accessStatus) {
                        log("Skype.Permissions._requestLockScreenAccess: " + accessStatusLookupTable[accessStatus]);
                        roboSky.write("Permissions,lockScreen");
                        Skype.Statistics.sendStats(Skype.Statistics.event.startup, accessStatus);
                        onCompleted();
                    });
            }
        );
    }

    function getAudioVideoCaptureSettings() {
        var captureSettings = new Windows.Media.Capture.MediaCaptureInitializationSettings();
        captureSettings.audioDeviceId = "";
        captureSettings.videoDeviceId = "";
        captureSettings.streamingCaptureMode = Windows.Media.Capture.StreamingCaptureMode.audioAndVideo;
        captureSettings.photoCaptureSource = Windows.Media.Capture.PhotoCaptureSource.videoPreview;
        return captureSettings;
    }

    function getAudioCaptureSettings() {
        var captureSettings = new Windows.Media.Capture.MediaCaptureInitializationSettings();
        captureSettings.audioDeviceId = "";
        captureSettings.streamingCaptureMode = Windows.Media.Capture.StreamingCaptureMode.audio;
        return captureSettings;
    }

    function initDevicesAsync(captureSettings) {
        return new WinJS.Promise(
            function (onCompleted) {
                
                
                try {
                    var mediaCapture = new Skype.Permissions.ExternalAPI.MediaCapture();
                    mediaCapture.initializeAsync(captureSettings)
                        .done(function () {
                            onCompleted(devicesAccessStatuses.allowed);
                        }, function onError() {
                            onCompleted(devicesAccessStatuses.blocked);
                        });
                } catch (e) {
                    onCompleted(devicesAccessStatuses.error);
                }
            });
    }

    function getMicStatusAsync() {
        return initDevicesAsync(getAudioCaptureSettings());
    }

    
    
    
    function requestDevicesAccess() {
        return new WinJS.Promise(
            function (onCompleted) {
                Skype.Application.DeviceManager.inputDeviceExists()
                    .then(function (inputDeviceExists) {
                        if (!inputDeviceExists) {
                            return WinJS.Promise.as(devicesAccessStatuses.noDevices);
                        }
                        return initDevicesAsync(getAudioVideoCaptureSettings());
                    })
                    .done(function (deviceAccessStatus) {
                        onCompleted(deviceAccessStatus);
                    });
            });
    }

    function getLockScreenAccessStatus() {
        var accessStatus = Skype.Permissions.ExternalAPI.BackgroundExecutionManager.getAccessStatus();
        if (accessStatus === BackgroundAccessStatus.unspecified) {
            return Skype.Permissions.ExternalAPI.BackgroundExecutionManager.requestAccessAsync();
        }
        return WinJS.Promise.as(accessStatus);
    }

    
    function requestLockScreenAccess() {
        return new WinJS.Promise(function (onCompleted) {
            
            try {
                getLockScreenAccessStatus()
                    .then(function (accessStatus) {
                        var accessStatusName = accessStatusLookupTable[accessStatus];
                        if (!accessStatusName) {
                            
                            log("Skype.Permissions._requestLockScreenAccess: unexpected value " + accessStatus);
                            accessStatus = BackgroundAccessStatus.unspecified;
                        }
                        onCompleted(accessStatus);
                    });
            } catch (e) {
                log("Skype.Permissions._requestLockScreenAccess: failed with exception {0} ({1})".format(e.number, e.message));
                onCompleted(Skype.Permissions.ExternalAPI.ExtendedBackgroundAccessStatus.error);
            }
        });
    }

    function backgroundTasksEnabled() {
        try {
            var accessStatus = Skype.Permissions.ExternalAPI.BackgroundExecutionManager.getAccessStatus();
            switch (accessStatus) {
                case Windows.ApplicationModel.Background.BackgroundAccessStatus.allowedMayUseActiveRealTimeConnectivit:
                case Windows.ApplicationModel.Background.BackgroundAccessStatus.allowedWithAlwaysOnRealTimeConnectivity:
                    return true;
                default:
                    return false;
            }
        } catch (ex) {
            log("Skype.Permissions.backgroundTasksEnabled error:" + JSON.stringify(ex));
            return false;
        }
    }

    WinJS.Namespace.define("Skype.Permissions", {
        requestAll: requestAll,
        requestMicrophoneWebcamAccess: requestDevicesAccess,
        backgroundTasksEnabled: backgroundTasksEnabled,
        getMicStatusAsync: getMicStatusAsync,
        DevicesAccessStatuses: devicesAccessStatuses,

        ExternalAPI: {
            BackgroundExecutionManager: Windows.ApplicationModel.Background.BackgroundExecutionManager,
            MediaCapture: Windows.Media.Capture.MediaCapture,
            ExtendedBackgroundAccessStatus: {
                error: -1
            }
        }
    });
})();