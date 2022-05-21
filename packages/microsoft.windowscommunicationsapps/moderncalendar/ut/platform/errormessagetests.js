
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx,NativeTestCore,Microsoft*/

(function () {

    Tx.test("ErrorMessageTests.testSyncFolderErrors", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncFolderErrors);
    });

    Tx.test("ErrorMessageTests.testUpSyncErrors", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.upSyncErrors);
    });

    Tx.test("ErrorMessageTests.testInviteResponseErrors", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.inviteResponseErrors);
    });

    Tx.test("ErrorMessageTests.testEventResponseErrors", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.eventResponseErrors);
    });

})();
