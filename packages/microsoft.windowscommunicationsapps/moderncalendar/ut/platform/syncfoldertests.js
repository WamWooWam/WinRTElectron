
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx,NativeTestCore,Microsoft*/

(function () {
    
    Tx.test("SyncFolderTests.testSyncFolderPurge", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncFolderPurge);
    });

    Tx.test("SyncFolderTests.testSyncFolderSimpleEvent", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncFolderSimpleEvent);
    });

    Tx.test("SyncFolderTests.testSyncFolderGlobalObjId", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncFolderGlobalObjId);
    });

    Tx.test("SyncFolderTests.testSyncFolderAttendees", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncFolderAttendees);
    });

    Tx.test("SyncFolderTests.testSyncFolderRecurringEvent", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncFolderRecurringEvent);
    });

    Tx.test("SyncFolderTests.testSyncFolderRecurringUTC13Event", function (tc) {
        NativeTestCore.setupTest(tc, true);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncFolderRecurringUTC13Event);
    });

    Tx.test("SyncFolderTests.testSyncFolderExplicit", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncFolderExplicit);
    });

    Tx.test("SyncFolderTests.testSyncFolderExceptions", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncFolderExceptions);
    });

    Tx.test("SyncFolderTests.testSyncFolderAttendeeExceptions", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncFolderAttendeeExceptions);
    });

    Tx.test("SyncFolderTests.testSyncFolderNonGregorian", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncFolderNonGregorian);
    });

    Tx.test("SyncFolderTests.testSyncFolderAttendeeChangeExceptions", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncFolderAttendeeChangeExceptions);
    });

})();