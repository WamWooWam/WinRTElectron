
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Platform test
var PlatformTest = PlatformTest || {};

PlatformTest.defaultUser = "default@live.com";

PlatformTest.createPlatform = function (tc) {
    return PlatformTest.createPlatformForUser(tc, PlatformTest.defaultUser);
};

PlatformTest.createPlatformForUser = function (tc, userName) {
    var wlt = Microsoft.WindowsLive.Platform.Test;   

    var previousCleanup = tc.cleanup || Tx.fnEmpty;
    var platform = new wlt.ClientTestHarness("unittests", wlt.PluginsToStart.none, userName, Microsoft.WindowsLive.Platform.ClientCreateOptions.delayResources);
    tc.log("Test case user name:" + userName);
    tc.log("Test case user CID:" + platform.authenticator.getCid());
    tc.cleanup = function () {
        platform.dispose();
        previousCleanup();
    };

    return platform;
};
