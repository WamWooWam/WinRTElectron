
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx,NativeTestCore,Microsoft*/

(function () {
    
    Tx.test("SerializeTests.testSerializeSimple", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.serializeSimple);
    });

    Tx.test("SerializeTests.testSerializeRecurring", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.serializeRecurring);
    });

    Tx.test("SerializeTests.testSerializeSimpleToEvent", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.serializeSimpleToEvent);
    });

    Tx.test("SerializeTests.testSerializeRecurringToEvent", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.serializeRecurringToEvent);
    });

    Tx.test("SerializeTests.testSerializeInstanceToEvent", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.serializeInstanceToEvent);
    });

    Tx.test("SerializeTests.testSerializeDefaultValues", function (tc) {
        NativeTestCore.setupTest(tc);
        NativeTestCore.run(Microsoft.WindowsLive.Platform.Calendar.Tests.serializeDefaultValues);
    });
    
})();