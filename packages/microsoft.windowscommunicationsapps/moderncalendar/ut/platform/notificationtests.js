
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx,NativeTestCore,Microsoft*/

(function () {
    
    Tx.test("NotificationTests.testNotificationGetTimeString", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.notificationGetTimeString);
    });

    Tx.test("NotificationTests.testNotificationGetTileXml", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.notificationGetTileXml);
    });

    Tx.test("NotificationTests.testNotificationGetToastXml", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.notificationGetToastXml);
    });

    Tx.test("NotificationTests.testNotificationGetCurrentTileEvent", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.notificationGetCurrentTileEvent);
    });

    Tx.test("NotificationTests.testNotificationGetScheduleTimes", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.notificationGetScheduleTimes);
    });

    Tx.test("NotificationTests.testNotificationGetTileData", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.notificationGetTileData);
    });

    Tx.test("NotificationTests.testNotificationGetSubject", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.notificationGetSubject);
    });

})();
