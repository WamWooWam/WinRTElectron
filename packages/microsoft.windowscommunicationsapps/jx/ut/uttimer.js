
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx,Jx*/
/*jshint browser:true*/

(function () {
    "use strict";

    Tx.asyncTest("TimerTests.testTimer", function (tc) {
        tc.stop();

        var hasRun = false;
        var o = {}, a1 = {}, a2 = {};
        var t = new Jx.Timer(20, function (arg1, arg2) {
            tc.areEqual(this, o);
            tc.areEqual(a1, arg1);
            tc.areEqual(a2, arg2);
            tc.isFalse(hasRun);
            hasRun = true;

            tc.start();
            t.dispose();
        }, o, [a1, a2]);
    });


    Tx.test("TimerTests.testRunNow", function (tc) {
        var hasRun = false;
        var o = {}, a1 = {}, a2 = {};
        var t = new Jx.Timer(20, function (arg1, arg2) {
            tc.areEqual(this, o);
            tc.areEqual(a1, arg1);
            tc.areEqual(a2, arg2);
            tc.isFalse(hasRun);
            hasRun = true;
        }, o, [a1, a2]);
        t.runNow();
        t.runNow(); // does nothing
    });

    Tx.asyncTest("TimerTests.testAnimationFrame", function (tc) {
        tc.stop();

        var hasRun = false;
        var o = {}, a1 = {}, a2 = {};
        var t = new Jx.AnimationFrame(function (arg1, arg2) {
            tc.areEqual(this, o);
            tc.areEqual(a1, arg1);
            tc.areEqual(a2, arg2);
            tc.isFalse(hasRun);
            hasRun = true;

            tc.start();
            t.dispose();
        }, o, [a1, a2]);
    });

    Tx.test("TimerTests.testRunNow", function (tc) {
        var hasRun = false;
        var o = {}, a1 = {}, a2 = {};
        var t = new Jx.AnimationFrame(function (arg1, arg2) {
            tc.areEqual(this, o);
            tc.areEqual(a1, arg1);
            tc.areEqual(a2, arg2);
            tc.isFalse(hasRun);
            hasRun = true;
        }, o, [a1, a2]);
        t.runNow();
        t.runNow(); // does nothing
    });
})();