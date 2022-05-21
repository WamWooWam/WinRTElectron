
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
//

(function () {

    function setup (tc) {
        tc.cleanup = function () {
            Mail.UnitTest.disposeGlobals();
            Mail.UnitTest.restoreJx();
        };

        Mail.UnitTest.stubJx(tc, "appData");
        Mail.UnitTest.stubJx(tc, "activation");
        Mail.UnitTest.initGlobals(tc);
    }

    Tx.test("PostStartupQueue.test", function (tc) {
        setup(tc);

        var one, two, three, four, eventContext,
            mockSplashScreen = {
                addListener: function (event, callback, context) {
                    tc.areEqual(Mail.SplashScreen.Events.dismissed, event);
                    tc.areEqual(Mail.PostStartupQueue.prototype.onSplashScreenDismissed, callback);
                    eventContext = context;

                },
                removeListener : Jx.fnEmpty,
                isShown : true,
                mockedType: Mail.SplashScreen
            },
            queue = new Mail.PostStartupQueue(mockSplashScreen);
        tc.areEqual(queue, eventContext);
        Mail.UnitTest.ensureSynchronous( function () {
            queue.queue("one", function () { one = 1; });
            queue.queue("two", function () { two = 2; });
            queue.queue("three", function () { three = 3; });
            queue.queue("four", function () { four = 4; });
            queue.queue("final", function () {
                tc.areEqual(1, one);
                tc.areEqual(2, two);
                tc.areEqual(3, three);
                tc.areEqual(4, four);
            });
            tc.areEqual(undefined, one);
            tc.areEqual(undefined, two);
            tc.areEqual(undefined, three);
            tc.areEqual(undefined, four);

            Mail.PostStartupQueue.waitBetweenJobs = 0;
            Mail.PostStartupQueue.initialWait = 0;
            queue.onSplashScreenDismissed();
        });
    });
})();
