
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Mail,Jx,Windows,People,Microsoft,WinJS,MSApp */
/*jshint browser:true*/

Jx.delayDefine(Mail, "startRetailExperience", function () {
    "use strict";
    Mail.startRetailExperience = function (ev) {
        Debug.assert(Jx.isObject(ev));
        // do not block activation
        return WinJS.Promise.timeout().then(function () {
            var splashScreen = Mail.Globals.splashScreen;
            if (splashScreen) {
                splashScreen.dismiss();
            }
            
            // The app name used is 'retailapp' so that no plugins are started by default since the app is unrecognized
            var platform = new Microsoft.WindowsLive.Platform.Client("retailapp", Microsoft.WindowsLive.Platform.ClientCreateOptions.createRetailExperienceUser);
            var defaultAccount = platform.accountManager.defaultAccount;
            // Import data
            var verb = platform.createVerb("ImportRetailExperienceData", "");
            platform.runResourceVerb(defaultAccount, "retail", verb);
            // Wait for aggregation
            verb = platform.createVerb("ProcessUpdates", "");
            platform.runResourceVerb(defaultAccount, "peopleAggregator", verb);
            platform.runResourceVerb(defaultAccount, "calendar", verb);
            verb = platform.createVerb("ProcessUpdates", defaultAccount.objectId);
            platform.runResourceVerb(defaultAccount, "mailNotification", verb);
            // Populate tiles
            return populateTiles().then(function () {
                // Populate social
                if (!Jx.isNullOrUndefined(People.Social.populateDemoDataAsync)) {
                    return People.Social.populateDemoDataAsync("ms-appdata:///local/RetailExperience/Social_input.xml", platform);
                }})
                .then(function() { 
                  if (platform) { 
                      platform.dispose();
                  }
            });
        }).then(importSucceeded, importFailed)
          .then(function () {
            return ev;
        });
    };

    function importSucceeded () {
        Windows.Storage.ApplicationData.current.localFolder.getFileAsync("RetailExperienceResult.log")
            .then(function (file) { return file.deleteAsync(); }, function () { } )
            .done(MSApp.terminateApp);
    }

    function importFailed () {
        Windows.Storage.ApplicationData.current.localFolder.createFileAsync("RetailExperienceResult.log", Windows.Storage.CreationCollisionOption.replaceExisting)
            .then (function (/*@type(Windows.Storage.StorageFile)*/file) { return file.openAsync(Windows.Storage.FileAccessMode.readWrite); })
            .then (function (fileStream) { return fileStream.getOutputStreamAt(0); })
            .then (function (outputStream) {
                var writer = new Windows.Storage.Streams.DataWriter(outputStream);

                writer.unicodeEncoding = Windows.Storage.Streams.UnicodeEncoding.utf8;

                writer.writeString(Jx.res.getString("mailRetailExperienceFailureMessage"));
                return writer.storeAsync();
            })
            .done(MSApp.terminateApp);
    }

    function populateTiles () {
        var N = Windows.UI.Notifications,
            Dom = Windows.Data.Xml.Dom;

        return Windows.Storage.ApplicationData.current.localFolder.getFileAsync("RetailExperience\\Livecomm_Input.xml")
            .then(function (file) {
                return Dom.XmlDocument.loadFromFileAsync(file);
            }).then(function (/*@type(Dom.XmlDocument)*/xml) {
                // Push any tile notifications
                xml.selectNodes("/RetailExperience/TileData/Apps/App").forEach(function (/*@type(Dom.XmlElement)*/appNode) {
                    var updater = N.TileUpdateManager.createTileUpdaterForApplication(appNode.getAttribute("id"));
                    updater.enableNotificationQueue(true);
                    appNode.selectNodes("Tiles/tile").forEach(function (/*@type(Dom.XmlElement)*/tileNode) {
                        var doc = new Dom.XmlDocument();
                        doc.loadXml(tileNode.getXml());
                        updater.update(new N.TileNotification(doc));
                    });
                });
            });
    }
});
