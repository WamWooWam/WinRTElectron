
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx,NativeTestCore,Microsoft*/


(function () {
    
    Tx.test("UpSyncTests.testUpSyncSimpleEvent", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.upSyncSimpleEvent);
    });

    Tx.test("UpSyncTests.testUpSyncMultipleEvents", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.upSyncMultipleEvents);
    });

    Tx.test("UpSyncTests.testUpSyncAttendees", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.upSyncAttendees);
    });

    Tx.test("UpSyncTests.testUpSyncRecurringEvent", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.upSyncRecurringEvent);
    });

    Tx.test("UpSyncTests.testUpSyncExceptions", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.upSyncExceptions);
    });

    Tx.test("UpSyncTests.testUpSyncAttendeeExceptions", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.upSyncAttendeeExceptions);
    });

    Tx.test("UpSyncTests.testUpSyncCategories", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.upSyncCategories);
    });

    Tx.test("UpSyncTests.testUpSyncDeleteMeetingResponse", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.upSyncDeleteMeetingResponse);
    });
    
})();