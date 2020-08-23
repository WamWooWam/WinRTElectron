/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/iaservice.js", "/Framework/serviceLocator.js", "/Monikers.js");
(function() {
    "use strict";
    if (!MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.informationArchitecture)) {
        Trace.fail("VideoStartup - Information Architecture not registered. This should be impossible, but is always fatal");
        throw new Error("VideoStartup - Information Architecture not registered");
    }
    var ia = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.informationArchitecture);
    var videoStartupIA = function videoStartupIA() {
            var fullScreenVideoNowPlaying = ia.createNode(String.empty, MS.Entertainment.UI.Monikers.fullScreenNowPlaying);
            var postRollEnabled = !!WinJS.UI.AutomaticFocus;
            var nowPlayingPageFragmentUrl = postRollEnabled ? "/Components/Video/VideoPostRollPage.html" : "/Components/Video/VideoFullScreenNowPlaying.html";
            MS.Entertainment.InformationArchitecture.Node.overridePageFragmentUrl(fullScreenVideoNowPlaying, nowPlayingPageFragmentUrl)
        };
    videoStartupIA();
    ia.addIAHandler(videoStartupIA, true)
})()
