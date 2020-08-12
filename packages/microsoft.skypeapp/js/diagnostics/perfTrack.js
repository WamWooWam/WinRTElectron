

(function () {
    "use strict";

    var perfLogger;

    var perfTrack = WinJS.Class.define(function() {
    }, {
        _activationKind: null,

        init: function () {
            try {
                perfLogger = new Microsoft.PerfTrack.PerfTrackLogger(Microsoft.PerfTrack.PerfTrackLogger.windowsDataUploadEnabled);
                log("Logger created successfully");
            } catch (exception) {
                log("Failed to create logger. Exception: " + exception);
            }
        },

        writeResumeStopEvent: function () {
            if (perfLogger) {
                perfLogger.writeResumeStopEvent(Microsoft.PerfTrack.PerfTrackTimePoint.responsive);
            }
        },

        writeResizeStopEvent: function (orientationChange, width, height) {
            if (perfLogger) {
                perfLogger.writeResizeStopEvent(Microsoft.PerfTrack.PerfTrackTimePoint.responsive, false, orientationChange, width, height);
            }
        },

        writeLaunchStopEvent: function (timePoint) {
            if (perfLogger) {
                perfLogger.writeLaunchStopEvent(timePoint, this._activationKind);
            }
        },
        
        activationKind: {
            set: function(value) {
                this._activationKind = value;
            }
        }
    }, {
        instance: {
            get: function () {
                if (!instance) {
                    instance = new Skype.Diagnostics.PerfTrack();
                }
                return instance;
            }
        },
    });

    var instance;
    WinJS.Namespace.define("Skype.Diagnostics", {
        PerfTrack: perfTrack,
    });
}());