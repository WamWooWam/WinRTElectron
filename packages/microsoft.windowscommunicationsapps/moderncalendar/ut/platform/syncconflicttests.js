
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx,NativeTestCore,Microsoft*/

(function () {
    
    Tx.test("SyncConflictTests.testSyncConflictSimple", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncConflictSimple);
    });

    Tx.test("SyncConflictTests.testSyncConflictImplicit", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncConflictImplicit);
    });

    Tx.test("SyncConflictTests.testSyncConflictMultiple", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncConflictMultiple);
    });

    Tx.test("SyncConflictTests.testSyncConflictDelete", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncConflictDelete);
    });

    Tx.test("SyncConflictTests.testSyncConflictRecurringServerEnables", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncConflictRecurringServerEnables);
    });

    Tx.test("SyncConflictTests.testSyncConflictRecurringServerDisables", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncConflictRecurringServerDisables);
    });

    Tx.test("SyncConflictTests.testSyncConflictRecurringClientEnables", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncConflictRecurringClientEnables);
    });

    Tx.test("SyncConflictTests.testSyncConflictRecurringClientDisables", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncConflictRecurringClientDisables);
    });

    Tx.test("SyncConflictTests.testSyncConflictRecurringServerChangesType", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncConflictRecurringServerChangesType);
    });

    Tx.test("SyncConflictTests.testSyncConflictRecurringClientChangesType", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncConflictRecurringClientChangesType);
    });

    Tx.test("SyncConflictTests.testSyncConflictRecurringResolveConflict", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncConflictRecurringResolveConflict);
    });

    Tx.test("SyncConflictTests.testSyncConflictAddAttendees", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncConflictAddAttendees);
    });

    Tx.test("SyncConflictTests.testSyncConflictDeleteAttendees", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncConflictDeleteAttendees);
    });

    Tx.test("SyncConflictTests.testSyncConflictChangeAttendees", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncConflictChangeAttendees);
    });

    Tx.test("SyncConflictTests.testSyncConflictAddException", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncConflictAddException);
    });

    Tx.test("SyncConflictTests.testSyncConflictRecurrenceChangeDeletesExceptions", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncConflictRecurrenceChangeDeletesExceptions);
    });

    Tx.test("SyncConflictTests.testSyncConflictDeletionExceptions", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncConflictDeletionExceptions);
    });

    Tx.test("SyncConflictTests.testSyncConflictDeletedException", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncConflictDeletedException);
    });

    Tx.test("SyncConflictTests.testSyncConflictChangeException", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncConflictChangeException);
    });

    Tx.test("SyncConflictTests.testSyncConflictExceptionAttendees", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncConflictExceptionAttendees);
    });

    Tx.test("SyncConflictTests.testSyncConflictMax", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncConflictMax);
    });
    
})();