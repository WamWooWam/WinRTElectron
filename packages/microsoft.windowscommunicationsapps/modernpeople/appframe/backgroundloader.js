
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/// <reference path="../Shared/JsUtil/Include.js"/>
/// <reference path="../Shared/JsUtil/Namespace.js"/>
/// <reference path="../AddressBook/Controls/Scheduler/JobSet.js"/>

Jx.delayDefine(People, "startBackgroundLoading", function () {

    var P = window.People;
    P.startBackgroundLoading = function (jobSet) {
        ///<summary>Schedules background file downloads.  Files are loaded in the background to speed up later navigations.
        ///Files are loaded one at a time, at low priority to avoid blocking interactivty</summary>
        ///<param name="jobSet" type="P.JobSet"/>

        var files = [
            // Try to put occasionally needed files lower in the list and frequently needed files higher to increase
            // the odds that they are loaded when the user takes an action.

            // IC interaction
            "$(peopleShared)/IdentityControl/IdentityControlActions.js",

            // Social pages (the social model is already loaded for the notification count)
            "$(socialRoot)/Social.UI.Core.js",
            "$(socialRoot)/Social.UI.Host.js",
            "$(socialRoot)/Social.UI.Feed.js",
            "$(socialRoot)/Social.UI.Photos.js",
            "$(socialRoot)/Social.UI.Notifications.js",
            "$(socialRoot)/Social.UI.SelfPage.js",
            "$(socialRoot)/Social.UI.Share.js",
            "$(cssResources)/Social.css",

            // Landing page
            "$(cssResources)/LandingPage.css",
            "$(peopleRoot)/Profile/Controls/LandingPage/PanelView.js",
            "$(peopleShared)/ShareSource/ShareSource.js",
            "$(peopleRoot)/Profile/Controls/LandingPage/LandingPage.js",
            "$(peopleRoot)/Profile/Controls/LandingPage/DisambiguatedCommandButton.js",
            "$(peopleRoot)/Profile/Controls/landingPage/ContactPanel.js",
            "$(peopleShared)/ContactForm/ContactForm.js",
            "$(peopleShared)/ContactForm/Location.js",
            "$(peopleShared)/AppTile/Pinning.js",
            "$(peopleRoot)/Profile/Controls/ContactCommands.js",
            "$(peopleShared)/Navigation/Protocols.js",

            // Modern canvas - for the Me Page
            "$(canvasRoot)/moderncanvas.css"

            // Not every feature is represented here.  We want to avoid burning battery and increasing working set to
            // optimize occasional-use features like account settings, me profile details, profile picture editing.
        ];

        files.forEach(function (url) {
            jobSet.addUIJob(null, loadFile, [ url ], P.Priority.backgroundLoad);
        });

        // TODO: fix the background loader to execute the globals code
    };

    function loadFile(url) {
        ///<summary>Loads a file in the background.</summary>
        ///<param name="url" type="String">The file to load</param>
        Include.includeOneFile(url
        
        , "Dependency detected in background load.\n" +
          "Dependencies should be properly ordered in BackgroundLoader.js to avoid blocking the UI while loading multiple files.\n"
        
        );
    }

});
