

(function (global) {
    "use strict";

    var using = {
        PathIO: Windows.Storage.PathIO
    };

    WinJS.Namespace.define("Skype.Version", {
        
        external: using,

        
        
        
        
        
        
        
        
        skypeVersion: null,

        
        
        previousVersions: null,

        
        
        
        uiVersion: function (justMajorAndMinor) {
            var appVersion = Windows.ApplicationModel.Package.current.id.version;
            if (justMajorAndMinor) {
                return "{0}.{1}".format(appVersion.major, appVersion.minor);
            } else {
                return "{0}.{1}.{2}.{3}".format(appVersion.major, appVersion.minor, appVersion.build, appVersion.revision);
            }
        },

        getPlatformId: function () {
            var platformIdX86 = 9;
            var platformIdArm = 10;
            if (Windows.ApplicationModel.Package.current.id.architecture === Windows.System.ProcessorArchitecture.arm) {
                return platformIdArm;
            } else {
                return platformIdX86;
            }
        },

        
        
        init: function () {
            if (!Skype.Version._loadVersionPromise) {
                Skype.Version.skypeVersion = "{0}/{1}".format(Skype.Version.getPlatformId(), Skype.Version.uiVersion());
                Skype.Version._loadVersionPromise = using.PathIO.readTextAsync("ms-appx://{0}/microsoft.system.package.metadata/custom.data".format(Windows.ApplicationModel.Package.current.id.name)).then(
                    function (content) {
                        Skype.Version._parseOEMFile(content);
                    },
                    function (error) {
                        log("Skype.Version.init: no OEM CDF (reading error [{0}]) use regular version [{1}]".format(error, Skype.Version.skypeVersion));
                    }).then(function () {
                        
                        var versions = Windows.Storage.ApplicationData.current.localSettings.values["versionsCache"];
                        if (versions === undefined) {
                            versions = [];
                        } else {
                            versions = JSON.parse(versions);
                        }

                        
                        var current = versions.indexOf(Skype.Version.skypeVersion);
                        if (current === -1) {
                            current = versions.push(Skype.Version.skypeVersion) - 1;
                            Windows.Storage.ApplicationData.current.localSettings.values["versionsCache"] = JSON.stringify(versions);
                        }

                        
                        versions.removeAt(current, current + 1);
                        Skype.Version.previousVersions = versions;
                        
                        log("Skype version: " + Skype.Version.skypeVersion);
                    });
            }

            return Skype.Version._loadVersionPromise;
        },

        _loadVersionPromise: null,

        
        
        _parseOEMFile: function (content) {
            if (content.length) {
                var oemID = Number(content);
                if (!isNaN(oemID)) {
                    Skype.Version.skypeVersion = "{0}/{1}".format(Skype.Version.skypeVersion, oemID);
                    log("Skype.Version._parseOEMFile: OEM ID found, use tagged version [{0}]".format(Skype.Version.skypeVersion));
                } else {
                    log("Skype.Version._parseOEMFile: OEM custom data file does not contain numeric ID, use regular version [{0}]".format(Skype.Version.skypeVersion));
                }
            } else {
                log("Skype.Version._parseOEMFile: OEM custom data file is empty, use regular version [{0}]".format(Skype.Version.skypeVersion));
            }
        }
    });

    global.traceStaticClassMethods && global.traceStaticClassMethods(Skype.Version, "Version", ["init"]);

})(this || window);
