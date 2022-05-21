
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function () {
    var log = window.msWriteProfilerMark;

    window.getMailPlatform = function () {
        if (platform) {
            return platform;
        }

        log("getMailPlatform,StartTM,Mail");
        try {
            var wl = Microsoft.WindowsLive.Platform;
            platform = new wl.Client("mail", wl.ClientCreateOptions.delayResources | wl.ClientCreateOptions.failIfNoUser);
            hrPlatform = 0;
        } catch (ex) {
            // If we couldn't get the real platform, return null;
            log("Unable to make the real platform!");
            log("Name: " + ex.name);
            log("Message: " + ex.message);
            hrPlatform = ex.number;
        }
        log("getMailPlatform,StopTM,Mail");
        return platform;
    };

    window.getMailPlatformResult = function () {
        return hrPlatform;
    };

    
    if (document.location.hash.indexOf("#testMode") !== -1) {

        Debug.loadMockPlatform = function () {
            log("loadMockPlatform,StartTM,Mail");
            return Jx.loadScripts([
                "/Platform/MockPlatform.js",
                "/ModernMail/Mock/JSObjects/TestAppData.js"
            ]).then(function () {
                platform = Mail.makeTestAppPlatform();
                log("loadMockPlatform,StopTM,Mail");
                return platform;
            });
        };

        window.getMailPlatform = function () {
            return platform;
        };
    }
    

    var hrPlatform = -1, platform = window.getMailPlatform();

})();
