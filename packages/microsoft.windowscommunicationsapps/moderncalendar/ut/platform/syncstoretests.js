
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx,NativeTestCore,Microsoft*/

(function () {
    
    Tx.test("SyncStoreTests.testSyncStoreRetrieve", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncStoreRetrieve);
    });

    Tx.test("SyncStoreTests.testSyncStoreGetFolder", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncStoreGetFolder);
    });

    /* Disabled due to intermittent failures, PS 474256 
    Tx.test("SyncStoreTests.testSyncStoreAccount", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.syncStoreAccount);
    });*/
    
})();