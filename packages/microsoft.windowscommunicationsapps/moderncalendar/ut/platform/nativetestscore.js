
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global TestCore*/

var NativeTestCore = {};

NativeTestCore.unittest = null;
NativeTestCore.errorCount = 0;

NativeTestCore.onError = function (ev) {
    TestCore.log("ERROR: " + ev.detail[0]);
    NativeTestCore.errorCount++;
};

NativeTestCore.onComment = function (ev) {
    TestCore.log(ev.detail[0]);
};

NativeTestCore.setupTest = function (tc, requiresCache) {
    
    TestCore.setupTest(tc, requiresCache);
    tc.cleanup = NativeTestCore.cleanupTest;
    
    NativeTestCore.unittest = TestCore.calendarManager.unitTest;
    NativeTestCore.unittest.addEventListener("onerror", NativeTestCore.onError);
    NativeTestCore.unittest.addEventListener("oncomment", NativeTestCore.onComment);
    NativeTestCore.unittest.setClient(TestCore.platform);
};

NativeTestCore.cleanupTest = function () {
    
    TestCore.cleanupTest();

    NativeTestCore.unittest.clearClient();
    NativeTestCore.unittest.removeEventListener("onerror", NativeTestCore.onError);
    NativeTestCore.unittest.removeEventListener("oncomment", NativeTestCore.onComment);
    NativeTestCore.unittest = null;
};

NativeTestCore.run = function(test) {
    
    NativeTestCore.errorCount = 0;
    NativeTestCore.unittest.runTest(test);
    TestCore.tc.areEqual(0, NativeTestCore.errorCount, "Errors were encountered");
};