/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function(undefined) {
    "use strict";
    scriptValidator();
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Actions");
    WinJS.Namespace.define("MS.Entertainment.UI.Actions", {LaunchApp: MS.Entertainment.deferredDerive("MS.Entertainment.UI.Actions.Action", function launchAppConstructor() {
            this.base()
        }, {
            executed: function executed(param) {
                try {
                    var uri = new Windows.Foundation.Uri(param.uri);
                    var options = new Windows.System.LauncherOptions;
                    options.displayApplicationPicker = false;
                    options.treatAsUntrusted = false;
                    var preferredApplicationPackageFamilyName;
                    var preferredApplicationDisplayName;
                    if (param.familyName && param.displayName) {
                        preferredApplicationPackageFamilyName = param.familyName;
                        preferredApplicationDisplayName = param.displayName
                    }
                    else {
                        var parts = param.uri.split(":");
                        MS.Entertainment.UI.Actions.assert(parts && parts.length > 1, "uri is invalid");
                        if (parts && parts.length > 1)
                            switch (parts[0]) {
                                case"microsoftmusic":
                                    preferredApplicationPackageFamilyName = "Microsoft.ZuneMusic_8wekyb3d8bbwe";
                                    preferredApplicationDisplayName = String.load(String.id.IDS_MUSIC_APP_TITLE);
                                    break;
                                case"microsoftvideo":
                                    preferredApplicationPackageFamilyName = "Microsoft.ZuneVideo_8wekyb3d8bbwe";
                                    preferredApplicationDisplayName = String.load(String.id.IDS_VIDEO_APP_TITLE);
                                    break
                            }
                    }
                    if (preferredApplicationPackageFamilyName && preferredApplicationDisplayName) {
                        options.preferredApplicationDisplayName = preferredApplicationDisplayName;
                        options.preferredApplicationPackageFamilyName = preferredApplicationPackageFamilyName
                    }
                    if (param.appendGamerTag) {
                        var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                        if (signIn.isSignedIn) {
                            var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                            if (uri.rawUri.indexOf("?") === -1)
                                uri = new Windows.Foundation.Uri(uri.rawUri + "?gamerTag=" + signedInUser.gamerTag);
                            else
                                uri = new Windows.Foundation.Uri(uri.rawUri + "&gamerTag=" + signedInUser.gamerTag)
                        }
                    }
                    if (param.appendSource)
                        for (var appMode in Microsoft.Entertainment.Application.AppMode)
                            if (MS.Entertainment.appMode === Microsoft.Entertainment.Application.AppMode[appMode]) {
                                if (uri.rawUri.indexOf("?") === -1)
                                    uri = new Windows.Foundation.Uri(uri.rawUri + "?source=" + appMode);
                                else
                                    uri = new Windows.Foundation.Uri(uri.rawUri + "&source=" + appMode);
                                break
                            }
                    if (param.useFallback && preferredApplicationPackageFamilyName)
                        try {
                            options.fallbackUri = new Windows.Foundation.Uri("ms-windows-store:PDP?PFN=" + preferredApplicationPackageFamilyName)
                        }
                        catch(e) {}
                    Windows.System.Launcher.launchUriAsync(uri, options).then(function launchSuccess(s){}, function launchFailure(e){})
                }
                catch(error) {
                    MS.Entertainment.UI.Actions.assert(false, error)
                }
            }, canExecute: function canExecute(param) {
                    return (param && param.uri) && typeof param.uri === "string"
                }
        })});
    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.launchApp, function() {
        return new MS.Entertainment.UI.Actions.LaunchApp
    })
})()
