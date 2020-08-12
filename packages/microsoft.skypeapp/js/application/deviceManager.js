

(function () {
    "use strict";

    var audioDeviceWatcher = null;
    var audioVideoPresence = {
        audio: false,
    };

    var speakerDeviceHandles = new LibWrap.VectGIString();
    var speakerDeviceNames = new LibWrap.VectGIString();
    var micDeviceHandles = new LibWrap.VectGIString();
    var micDeviceNames = new LibWrap.VectGIString();
    var audioDevicePromise = WinJS.Promise.as();
    var videoDevicesInfo = null;

    function handleDeviceListChangeAsync(e) {
        var micProductIDs = new LibWrap.VectGIString();
        var speakerProductIDs = new LibWrap.VectGIString();
        audioDevicePromise = WinJS.Promise.join([
            lib.getAvailableOutputDevicesAsync(speakerDeviceHandles, speakerDeviceNames, speakerProductIDs),
            lib.getAvailableRecordingDevicesAsync(micDeviceHandles, micDeviceNames, micProductIDs)]);

        return audioDevicePromise;
    }
    window.traceFunction && (handleDeviceListChangeAsync = window.traceFunction(handleDeviceListChangeAsync, "DeviceManager,handleDeviceListChangeAsync"));


    function libLoginEvent() {
        lib.addEventListener("availabledevicelistchange", updateSkypeAudioSettingsAsync);
        updateSkypeAudioSettingsAsync();
    }
    window.traceFunction && (libLoginEvent = window.traceFunction(libLoginEvent, "DeviceManager,libLoginEvent"));

    function libLogout() {
        lib.removeEventListener("availabledevicelistchange", updateSkypeAudioSettingsAsync); 
    }

    function init() {
        audioDeviceWatcher = startWatcher(Windows.Devices.Enumeration.DeviceClass.audioCapture, audioChangeEvent);
    }

    function alive() {
        var loginHandlerManager = Skype.Application.LoginHandlerManager;

        loginHandlerManager.instance.addEventListener(loginHandlerManager.Events.LOGIN_READONLY, libLoginEvent);
        loginHandlerManager.instance.addEventListener(loginHandlerManager.Events.LOGOUT, libLogout);
    }
    window.traceFunction && (alive = window.traceFunction(alive, "DeviceManager,alive"));

    function startWatcher(deviceClass, eventListenerFunc) {
        var watcher = Windows.Devices.Enumeration.DeviceInformation.createWatcher(deviceClass);
        watcher.addEventListener("removed", eventListenerFunc);
        watcher.addEventListener("added", eventListenerFunc);
        watcher.addEventListener("updated", eventListenerFunc);
        watcher.start();
        return watcher;
    }

    function deviceChangeEvent(eventArgs, type) {
        if (eventArgs.target && eventArgs.target.status === Windows.Devices.Enumeration.DeviceWatcherStatus.enumerationCompleted) {
            Skype.Permissions.requestMicrophoneWebcamAccess();
        }
        audioVideoPresence[type] = eventArgs.type === "added" || eventArgs.type === "updated";
        Skype.Application.state.deviceListChanged.dispatch();
    }

    function audioChangeEvent(eventArgs) {
        deviceChangeEvent(eventArgs, "audio");
    }

    function getDeviceEnum(deviceClass) {
        return Windows.Devices.Enumeration.DeviceInformation.findAllAsync(deviceClass)
            .then(function (devinfoCollection) {
                if (deviceClass === Windows.Devices.Enumeration.DeviceClass.videoCapture) {
                    videoDevicesInfo = devinfoCollection;
                    for (var i = 0; i < videoDevicesInfo.size; i++) {
                        var panel = videoDevicesInfo[i].enclosureLocation ? videoDevicesInfo[i].enclosureLocation.panel : "uknown";
                        log("VideoDeviceInfo: " + videoDevicesInfo[i].name + " " + panel);
                    }
                }
                return devinfoCollection.size !== 0;
            });
    }

    
    
    
    
    function getVideoDevicePosition(videoDeviceHandle) {
        
        var videoPath = lib.getVideoDevicePath(videoDeviceHandle);

        if (videoDevicesInfo && videoPath) {
            for (var i = 0; i < videoDevicesInfo.size; i++) {
                if (videoDevicesInfo[i].enclosureLocation && videoDevicesInfo[i].id === videoPath) {
                    return videoDevicesInfo[i].enclosureLocation.panel;
                }
            }
        }
        return null;
    }

    function inputDeviceExists() {
        var audioDevices = getDeviceEnum(Windows.Devices.Enumeration.DeviceClass.audioCapture);
        var videoDevices = getDeviceEnum(Windows.Devices.Enumeration.DeviceClass.videoCapture);

        return WinJS.Promise.join([audioDevices, videoDevices]).then(
            function (results) {
                return results[0] || results[1];
            });
    }

    
    
    
    function isAudioDevicePresent() {
        return audioVideoPresence.audio;
    }

    
    
    
    function isVideoDevicePresent() {
        return lib.getActiveVideoDeviceHandle() !== "";
    }

    function updateSkypeAudioSettingsAsync() {
        if (!lib.setup) { 
            return;
        }
        return handleDeviceListChangeAsync().then(function () {
            var speakerDevice = Skype.Model.Options.speaker_device;
            var micDevice = Skype.Model.Options.mic_device;
            log("DeviceManager.updateSkypeAudioSettings");
            log("DeviceManager.updateSkypeAudioSettings speakerDeviceName: " + speakerDevice);
            log("DeviceManager.updateSkypeAudioSettings micDeviceName: " + micDevice);
            var micDeviceHandle = "";
            var speakerDeviceHandle = "";
            var i;
            for (i = 0; i < micDeviceNames.getCount() ; i++) {
                if (micDevice === micDeviceNames.get(i)) {
                    micDeviceHandle = micDeviceHandles.get(i);
                    break;
                }
            }
            for (i = 0; i < speakerDeviceNames.getCount() ; i++) {
                if (speakerDevice === speakerDeviceNames.get(i)) {
                    speakerDeviceHandle = speakerDeviceHandles.get(i);
                    break;
                }
            }
            lib.selectSoundDevices(micDeviceHandle, speakerDeviceHandle, speakerDeviceHandle);
        });
    }

    function getSpeakerDeviceNamesAsync() {
        return audioDevicePromise.then(function () {
            return WinJS.Promise.as(speakerDeviceNames);
        });
    }

    function getMicDeviceNamesAsync() {
        return audioDevicePromise.then(function () {
            return WinJS.Promise.as(micDeviceNames);
        });
    }

    function getSelectedSpeakerDeviceNameAsync() {
        return audioDevicePromise.then(function () {
            var result = Skype.Model.Options.speaker_device;
            for (var i = 0; i < speakerDeviceNames.getCount() ; i++) {
                if (result === speakerDeviceNames.get(i)) {
                    return WinJS.Promise.as(result);
                }
            }
            return WinJS.Promise.as("");
        });
    }

    function setSelectedSpeakerDeviceName(name) {
        Skype.Model.Options.speaker_device = name;
        updateSkypeAudioSettingsAsync();
    }

    function getSelectedMicDeviceNameAsync() {
        return audioDevicePromise.then(function () {
            var result = Skype.Model.Options.mic_device;
            for (var i = 0; i < micDeviceNames.getCount() ; i++) {
                if (result === micDeviceNames.get(i)) {
                    return WinJS.Promise.as(result);
                }
            }
            return WinJS.Promise.as("");
        });
    }

    function getSelectedMicDeviceIdAsync() {
        return audioDevicePromise.then(function () {
            var defaultMic = Skype.Model.Options.mic_device;

            if (defaultMic && defaultMic.length !== 0) {
                for (var i = 0; i < micDeviceNames.getCount() ; i++) {
                    if (micDeviceNames.get(i) === defaultMic) {
                        return WinJS.Promise.as(micDeviceHandles.get(i));
                    }
                }
            }

            if (micDeviceHandles.getCount() > 0) {
                return WinJS.Promise.as(micDeviceHandles.get(0));
            }
            return WinJS.Promise.as("");
        });
    }

    function setSelectedMicDeviceName(name) {
        Skype.Model.Options.mic_device = name;
        updateSkypeAudioSettingsAsync();
    }


    function getNextVideoDevice(videoDeviceName) {
        
        
        

        var list = lib.getVideoDeviceHandles();
        var current = list.indexOf(videoDeviceName);

        var nextIndex = (current.index + 1) % list.length;
        return list[nextIndex];
    }

    function getActiveVideoDeviceHandle() {
        return lib.getActiveVideoDeviceHandle();
    }

    WinJS.Namespace.define("Skype.Application.DeviceManager", {
        init: init,
        alive: alive,
        inputDeviceExists: inputDeviceExists,
        isVideoDevicePresent: isVideoDevicePresent,
        isAudioDevicePresent: isAudioDevicePresent,
        updateSkypeAudioSettingsAsync: updateSkypeAudioSettingsAsync,
        speakerDeviceNamesAsync: getSpeakerDeviceNamesAsync,
        micDeviceNamesAsync: getMicDeviceNamesAsync,
        getSelectedMicDeviceNameAsync: getSelectedMicDeviceNameAsync,
        getSelectedSpeakerDeviceNameAsync: getSelectedSpeakerDeviceNameAsync,
        setSelectedMicDeviceName: setSelectedMicDeviceName,
        getSelectedMicDeviceIdAsync: getSelectedMicDeviceIdAsync,
        setSelectedSpeakerDeviceName: setSelectedSpeakerDeviceName,
        getVideoDevicePosition: getVideoDevicePosition,
        getNextVideoDevice: getNextVideoDevice,
        getActiveVideoDeviceHandle: getActiveVideoDeviceHandle
    });
})();
