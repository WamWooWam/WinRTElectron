
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx,Jx,Calendar*/

(function() {
    var App = Calendar.App; // for delayDefine

    var priorities = Jx.scheduler.definePriorities({
        idle: { base: Jx.Scheduler.BasePriority.idle },
    });

    var idle = priorities.idle;

    Tx.asyncTest("CalendarTests.testWorkQueue", function (tc) {
        tc.stop(2);

        tc.isTrue(Jx.isFunction(App));

        var workQueue = new Calendar.WorkQueue();
        var scheduledDelay = 12; // less than 11ms will load the multimedia timers
        var minDelay = 5; // minimum expected delay - IE timers are coalesced
        var context = {a:1};
        var args = [5,"f",9,null];
        var d0 = 0;
        var d1 = 0;
        var d2 = 0;

        workQueue.queue("work1", scheduledDelay, idle, function () {
            d1 = Date.now();
            tc.log("d1:" + d1 + " diff:" + (d1 - d0));
            tc.isTrue(d1 - d0 >= minDelay);
            tc.areEqual(this, context);
            tc.areEqual(arguments.length, args.length);
            tc.start();
        }, context, args);

        workQueue.queue("work2", scheduledDelay, idle, function () {
            d2 = Date.now();
            tc.log("d2:" + d2 + " diff:" + (d2 - d0));
            tc.isTrue(d2 - d0 >= minDelay);
            tc.areEqual(this, context);
            tc.areEqual(arguments.length, args.length);
            tc.start();
        }, context, args);

        d0 = Date.now();
        tc.log("d0:" + d0);
        workQueue.unlock();
    });

    // TODO: add more tests for lock/unlock
    // TODO: add tests for removing old work items
})();
