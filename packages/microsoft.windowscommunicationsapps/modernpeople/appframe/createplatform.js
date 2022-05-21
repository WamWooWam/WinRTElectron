
//
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="CreatePlatform.ref.js"/>
/// <disable>JS2076.IdentifierIsMiscased</disable>
/// <dictionary>comm</dictionary>
(function () {

    var log = window.msWriteProfilerMark; // Jx is not yet loaded
    log("peopleFirstMarker");

    // Create the platform.  The goal is to do this as early as possible, so that while the UI thread is blocked creating
    // the process, Trident can be doing its predictive loading.  And when it is done being created and asynchronously
    // opening the database, we can be doing our early initialization (script parsing/activation/frame loading).
    window.createPlatform = function () {
        ///<summary>Attempts to create the platorm</summary>
        ///<returns type="CreatePlatformResult"/>
        log("peopleCreatePlatform_start");
        try {
            var ClientCreateOptions = Microsoft.WindowsLive.Platform.ClientCreateOptions;
            return {
                client: new Microsoft.WindowsLive.Platform.Client("people", ClientCreateOptions.delayResources | ClientCreateOptions.failIfNoUser | ClientCreateOptions.failIfUnverified),
                hr: 0
            };
        } catch (ex) {
            log("peopleCreatePlatform_error: " + ex.toString() + " (" + ex.number + ")");
            return {
                client: null,
                hr: ex.number
            };
        } finally {
            log("peopleCreatePlatform_end");
        }
    };
    window.initialPlatformResult = createPlatform();

})();

