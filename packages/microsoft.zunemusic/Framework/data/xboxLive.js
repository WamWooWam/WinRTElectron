/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/serviceLocator.js");
(function(MSE) {
    "use strict";
    WinJS.Namespace.defineWithParent(MSE, "Data", {XboxLive: MS.Entertainment.UI.Framework.define(function xboxLive(){}, {createUser: function createUser(xuid, gamerTag) {
                var user;
                if (xuid && gamerTag)
                    user = new Microsoft.Xbox.User(xuid, gamerTag);
                else if (xuid)
                    user = new Microsoft.Xbox.User(xuid);
                else
                    user = new Microsoft.Xbox.User;
                return user
            }}, {
            factory: function() {
                return new MSE.Data.XboxLive
            }, isHttpOfflineError: function(errorCode) {
                    var result = false;
                    if (errorCode === MS.Entertainment.Data.XboxLive.ErrorCodes.httpConnectionTimeout || errorCode === MS.Entertainment.Data.XboxLive.ErrorCodes.httpInternalServerError || errorCode === MS.Entertainment.Data.XboxLive.ErrorCodes.httpResourceNotFound)
                        result = true;
                    return result
                }, ErrorCodes: {
                    httpInvalidRequest: -2146697204, httpAuthRequired: -2146697207, httpForbidden: -2146697209, httpObjectNotFound: -2146697210, httpConnectionTimeout: -2146697205, httpInternalServerError: -2146697208, httpResourceNotFound: -2146697211
                }, MAX_TITLE_ACTIVITY_COUNT: 25000
        })});
    MSE.ServiceLocator.register(MSE.Services.xboxLive, MSE.Data.XboxLive.factory)
})(WinJS.Namespace.define("MS.Entertainment", null))
