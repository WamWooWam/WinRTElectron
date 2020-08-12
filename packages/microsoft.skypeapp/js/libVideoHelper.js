

(function (Skype) {
    "use strict";

    var VIDEO_ENGINE_ERROR_BASE = 0x838F0001;

    var ERRORS = [
        { name: "VE_UNKNOWN_ERROR", id: VIDEO_ENGINE_ERROR_BASE + 0 },
        { name: "VE_VIDEOENGINE_NOT_INITIALIZED", id: VIDEO_ENGINE_ERROR_BASE + 1 },
        { name: "VE_CANNOT_SETUP_VIDEO_SOURCE", id: VIDEO_ENGINE_ERROR_BASE + 2 },
        { name: "VE_NO_VIDEO_SOURCE_FOUND", id: VIDEO_ENGINE_ERROR_BASE + 3 },
        { name: "VE_NO_PREFERED_VIDEO_SOURCE_FOUND", id: VIDEO_ENGINE_ERROR_BASE + 4 },
        { name: "VE_UNKNOWN_CONTROL_PACKET", id: VIDEO_ENGINE_ERROR_BASE + 5 },
        { name: "VE_CANNOT_RENDER_THIS_FORMAT", id: VIDEO_ENGINE_ERROR_BASE + 6 },
        { name: "VE_CANNOT_PLAYBACK", id: VIDEO_ENGINE_ERROR_BASE + 7 },
        { name: "VE_OS_NOT_SUPPORTED", id: VIDEO_ENGINE_ERROR_BASE + 8 },
        { name: "VE_OLD_DIRECTX", id: VIDEO_ENGINE_ERROR_BASE + 9 },
        { name: "VE_CANNOT_START_CAPTURE", id: VIDEO_ENGINE_ERROR_BASE + 10 },
        { name: "VE_DEVICE_NOT_FOUND", id: VIDEO_ENGINE_ERROR_BASE + 11 },
        { name: "VE_BUFFER_TOO_SMALL", id: VIDEO_ENGINE_ERROR_BASE + 12 },
        { name: "VE_REMOTESTREAM_NOT_INITIALIZED", id: VIDEO_ENGINE_ERROR_BASE + 13 },
        { name: "VE_REMOTESTREAM_CANTHANDLE_FORMAT", id: VIDEO_ENGINE_ERROR_BASE + 14 },
        { name: "VE_LOCALSTREAM_NOT_INITIALIZED", id: VIDEO_ENGINE_ERROR_BASE + 15 },
        { name: "VE_LOCALSTREAM_CANTHANDLE_FORMAT", id: VIDEO_ENGINE_ERROR_BASE + 16 },
        { name: "VE_UNKNOWN_OBJECT_PROP", id: VIDEO_ENGINE_ERROR_BASE + 17 },
        { name: "VE_OBJECT_PROP_INVALID_DATATYPE", id: VIDEO_ENGINE_ERROR_BASE + 18 },
        { name: "VE_DEVICE_CAPABILITY_UNSUPPORTED", id: VIDEO_ENGINE_ERROR_BASE + 19 },
        { name: "VE_CANNOT_START_RENDERER", id: VIDEO_ENGINE_ERROR_BASE + 20 },
        { name: "VE_LOCALSTREAM_NO_CODEC_MATCH", id: VIDEO_ENGINE_ERROR_BASE + 21 }
    ];

    function getErrorType(/*@static_cast(string)*/error) {
        if (typeof error !== "string") {
            return null;
        }
        var errorNumber = parseInt(error.trim());
        if (isNaN(errorNumber)) {
            return null;
        }
        var errIndex = errorNumber - 0x838F0001;
        if (errIndex < 0 || errIndex >= ERRORS.length) {
            return null;
        }
        return ERRORS[errIndex];
    }

    function getNameForVideoError(/*@static_cast(string)*/error) {
        
        
        
        
        
        

        var errorType = getErrorType(error);
        if (!errorType) {
            return "";
        }
        return errorType.name;
    }

    function getMessageVideoError(/*@static_cast(string)*/error) {
        
        
        
        
        
        

        var errorType = getErrorType(error);
        if (errorType) {
            return "error_hint_video_" + errorType.name.toLowerCase();
        }
        return "error_hint_video_ve_unknown_error";
    }

    function hasMultipleCameras() {
        
        
        

        return lib.getVideoDeviceHandles().length > 1;
    }

    function outputVideoError(e, prefix, videoObject) {
        
        
        

        var error;
        switch (e.target.error.code) {
            case e.target.error.MEDIA_ERR_ABORTED:
                error = "MEDIA_ERR_ABORTED";
                break;
            case e.target.error.MEDIA_ERR_NETWORK:
                error = "MEDIA_ERR_NETWORK";
                break;
            case e.target.error.MEDIA_ERR_DECODE:
                error = "MEDIA_ERR_DECODE - The video playback was aborted due to a corruption problem or because the video used features your browser did not support.";
                break;
            case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                error = "MEDIA_ERR_SRC_NOT_SUPPORTED";
                break;
            default:
                error = "An unknown error occurred.";
                break;
        }
        log('{0} - Video error: {1} {2}'.format(prefix, error, videoObject ? videoObject.getObjectID() : ""));
    }

    function isVideoHeightAndWidthFlipped(videoOrientation) {
        
        
        
        
        
        

        return [LibWrap.Video.orientation_TRANSPOSE, LibWrap.Video.orientation_TRANSPOSE_FLIP_H,
        LibWrap.Video.orientation_TRANSPOSE_FLIP_V, LibWrap.Video.orientation_TRANSPOSE_FLIP_H_V].contains(videoOrientation);
    }

    WinJS.Namespace.define("Skype.Video", {
        getNameForVideoError: getNameForVideoError,
        outputVideoError: outputVideoError,
        getMessageVideoError: getMessageVideoError,
        hasMultipleCameras: hasMultipleCameras,
        isVideoHeightAndWidthFlipped: isVideoHeightAndWidthFlipped,
        Mockup: false,
    });

})(Skype);
