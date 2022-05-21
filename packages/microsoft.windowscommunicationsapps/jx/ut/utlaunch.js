
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../core/Launch.js" />

/*global Jx,Tx*/

Tx.test("LaunchTests.testIsVersionGreater", function (tc) {
    // Verify that version comparison is valid.
    var launch = new Jx.Launch(Jx.AppId.testapp1);

    tc.isTrue(launch._isVersionGreater("16.2.0.0", "16.1.0.0"));
    tc.isFalse(launch._isVersionGreater("16.0.0.0", "16.1.0.0"));
    tc.isTrue(launch._isVersionGreater("16.1.0.1", "16.1.0.0"));
    tc.isFalse(launch._isVersionGreater("16.1.0.0", "16.1.0.0"));
});
