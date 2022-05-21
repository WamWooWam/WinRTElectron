
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx,Tx*/

(function () {
    var BasePriority = Jx.Scheduler.BasePriority;

    function overrideTiming(scheduler, tc) {
        var time = 0;
        var timeout = null;
        var winjsJob = null;
        var queuedPriority = null;
        scheduler.testOverrideTiming({
            winjsSchedule: function (fn, pri, thisObj) {
                tc.areEqual(queuedPriority, null);
                tc.areEqual(winjsJob, null);
                queuedPriority = pri;
                winjsJob = {
                    fn: fn,
                    priority: pri,
                    thisObj: thisObj,
                    cancel: function () {
                        tc.areEqual(this, winjsJob);
                        tc.areEqual(this.priority, queuedPriority);
                        winjsJob = null;
                        queuedPriority = null;
                    }
                };
                winjsJob.cancel = winjsJob.cancel.bind(winjsJob);
                return winjsJob;
            },
            getTime: function () { return time; },
            setTimeout: function (fn) { timeout = fn; return 1; },
            clearTimeout: function () { timeout = null; }
        });

        return {
            get queuedPriority() { return queuedPriority; },
            set time(t) { time = t; },
            get time() { return time; },
            runWinJSSchedule: function () {
                tc.areNotEqual(winjsJob, null);
                tc.isTrue(Jx.isFunction(winjsJob.fn));
                var job = winjsJob;
                winjsJob = null;
                queuedPriority = null;
                job.fn.call(job.thisObj, {job : job});
            },
            runTimeout: function () {
                var fn = timeout;
                timeout = null;
                fn();
            },
            get idle() { return timeout === null && winjsJob === null; }
        };
    }


    Tx.test("SchedulerTests.testPriorities", function (tc) {

        var s = new Jx.Scheduler();
        var p1 = s.definePriorities({
            high:   { base: BasePriority.high, description: "Test Description" },
            normal: { base: BasePriority.normal },
            normal2: { base: BasePriority.normal },
            idle:     { base: BasePriority.idle }
        });
        tc.areEqual(p1.high._description, "Test Description");
        tc.areEqual(p1.normal._description, "normal");
        tc.areEqual(p1.high._value, 0);
        tc.areEqual(p1.normal._value, 1);
        tc.areEqual(p1.normal2._value, 2);
        tc.areEqual(p1.idle._value, 3);

        var p2 = s.definePriorities({
            high:   { base: BasePriority.high },
            high2:   { base: BasePriority.high },
            normal: { base: BasePriority.normal }
        });
        tc.areEqual(p1.high._value, 0);
        tc.areEqual(p2.high._value, 0);
        tc.areEqual(p2.high2._value, 1);
        tc.areEqual(p1.normal._value, 2);
        tc.areEqual(p2.normal._value, 2);
        tc.areEqual(p1.normal2._value, 3);
        tc.areEqual(p1.idle._value, 4);

        s.dispose();
    });

    Tx.asyncTest("SchedulerTests.testBasicJob", function (tc) {
        tc.stop();

        var s = new Jx.Scheduler();
        var p = s.definePriorities({ A: { base: BasePriority.normal } });
        var o = { }, a1 = { }, a2 = { };

        s.addJob(null, p.A, null, function (arg1, arg2) {
            tc.areEqual(this, o);
            tc.areEqual(a1, arg1);
            tc.areEqual(a2, arg2);

            s.dispose();

            tc.start();
        }, o, [ a1, a2 ]);
    });

    Tx.asyncTest("SchedulerTests.testTimerJob", function (tc) {
        tc.stop();

        var s = new Jx.Scheduler();
        var p = s.definePriorities({ A: { base: BasePriority.normal } });
        var o = {}, a1 = {}, a2 = {};

        s.addTimerJob(null, p.A, null, 20, function (arg1, arg2) {
            tc.areEqual(this, o);
            tc.areEqual(a1, arg1);
            tc.areEqual(a2, arg2);

            s.dispose();

            tc.start();
        }, o, [a1, a2]);
    });

    Tx.asyncTest("SchedulerTests.testQueue", function (tc) {
        tc.stop();

        var s = new Jx.Scheduler();
        var p = s.definePriorities({ A: { base: BasePriority.normal } });
        var state = 0;

        s.addJob(null, p.A, null, function () {
            tc.areEqual(++state, 1);
        });
        s.addJob(null, p.A, null, function () {
            tc.areEqual(++state, 2);
            s.dispose();
            tc.start();
        });
    });

    Tx.asyncTest("SchedulerTests.testJobPrioritization", function (tc) {
        tc.stop();

        var s = new Jx.Scheduler();
        var p = s.definePriorities({
            A: { base: BasePriority.normal },
            B: { base: BasePriority.normal },
            C: { base: BasePriority.normal }
        });
        var state = 0;

        s.addJob(null, p.B, null, function () { 
            tc.areEqual(++state, 2);
        });
        s.addJob(null, p.C, null, function () { 
            tc.areEqual(++state, 4);
            s.dispose();
            tc.start();
        });
        s.addJob(null, p.A, null, function () { 
            tc.areEqual(++state, 1);
        });
        s.addJob(null, p.B, null, function () { 
            tc.areEqual(++state, 3);
        });
    });

    Tx.asyncTest("SchedulerTests.testRepeatJob", function (tc) {
        tc.stop();

        var s = new Jx.Scheduler();
        var p = s.definePriorities({
            A: { base: BasePriority.high },
            B: { base: BasePriority.normal },
            C: { base: BasePriority.idle }
        });
        var state = 0;

        s.addJob(null, p.C, null, function () { 
            tc.areEqual(++state, 6);
            s.dispose();
            tc.start();
        });
        s.addJob(null, p.B, null, function () { 
            ++state;
            tc.isTrue(state === 1 || state === 2 || state === 4);
            if (state === 2) {
                s.addJob(null, p.A, null, function () {
                    tc.areEqual(++state, 3);
                });
            }
            return Jx.Scheduler.repeat(state !== 4);
        });
        s.addJob(null, p.B, null, function () {
            tc.areEqual(++state, 5);
        });
    });

    Tx.asyncTest("SchedulerTests.testCancelJob", function (tc) {
        tc.stop();

        var s = new Jx.Scheduler();
        var p = s.definePriorities({
            A: { base: BasePriority.high },
            B: { base: BasePriority.normal },
            C: { base: BasePriority.normal }
        });
        var state = 0;

        var j1 = s.addJob(null, p.A, null, function () {
            tc.areEqual(++state, 1);
            j1.dispose(); // Disposed during job
        });

        var j2 = s.addJob(null, p.A, null, function () {
            tc.areEqual(++state, 2);
            j2.dispose(); // Disposed during repeating job
            return Jx.Scheduler.repeat(true);
        });

        var j3 = s.addJob(null, p.A, null, function () {
            tc.error();
        });
        j3.dispose(); // Disposed after queueing
 
        var j4 = s.addJob(null, p.B, null, function () {
            tc.error();
        });
        var j5 = s.addJob(null, p.A, null, function () {
            tc.areEqual(++state, 3);
            j4.dispose(); // Disposed while running a different job
        });
        s.addJob(null, p.C, null, function () {
            tc.areEqual(++state, 4);
            j5.dispose(); // Disposed after running
        });
        s.addJob(null, p.C, null, function () {
            tc.areEqual(++state, 5);
            s.dispose();
            tc.start();
        });
        j4.dispose();
        j4.dispose(); // Disposed twice
    });

    Tx.asyncTest("SchedulerTests.testCancelTimerJob", function (tc) {
        tc.stop();

        var s = new Jx.Scheduler();
        var set1 = s.createJobSet(null, 5);
        var p = s.definePriorities({
            A: { base: BasePriority.high },
            B: { base: BasePriority.normal },
            C: { base: BasePriority.normal }
        });
        var state = 0;

        var j1 = s.addTimerJob(null, p.A, null, 20, function () {
            tc.areEqual(++state, 1);
            j1.dispose(); // Disposed during job
        });

        var j2 = s.addTimerJob(null, p.A, null, 20, function () {
            tc.areEqual(++state, 2);
            j2.dispose(); // Disposed during repeating job
            return Jx.Scheduler.repeat(true);
        });

        var j3 = s.addTimerJob(null, p.A, null, 20, function () {
            tc.error();
        });
        j3.dispose(); // Disposed after queueing

        var j4 = s.addTimerJob(null, p.B, null, 100, function () {
            tc.error();
        });
        var j5 = s.addTimerJob(null, p.A, null, 20, function () {
            tc.areEqual(++state, 3);
            j4.dispose(); // Disposed while running a different job
        });
        s.addTimerJob(null, p.C, null, 100, function () {
            tc.areEqual(++state, 4);
            j5.dispose(); // Disposed after running
        });
        var j6 = s.addTimerJob(null, p.B, null, 500, function () {
            tc.error();
        });
        j6._timer.runNow();  // Disposed after timer running
        j6.dispose();

        var j7 = s.addTimerJob(set1, p.B, null, 500, function () {
            tc.error();
        });
        j7._timer.runNow();  // Job set canceled after timer running
        set1.cancelJobs();
        set1.runSynchronous();

        var j8 = s.addTimerJob(set1, p.B, null, 500, function () {
            tc.error();
        });
        j8._timer.runNow();  // Job set disposed after timer running
        set1.dispose();

        s.addTimerJob(null, p.C, null, 120, function () {
            tc.areEqual(++state, 5);
            s.dispose();
            tc.start();
        });
        j4.dispose();
        j4.dispose(); // Disposed twice
    });

    Tx.asyncTest("SchedulerTests.testJobSetOrder", function (tc) {
        tc.stop();

        var s = new Jx.Scheduler();
        var p = s.definePriorities({ A: { base: BasePriority.normal } });
        var state = 0;
        var set1 = s.createJobSet(null, 5);
        var set2 = s.createJobSet(null, 10);
        var set1a = s.createJobSet(set1, 2);
        var set1b = s.createJobSet(set1, 12);
        var set2a = s.createJobSet(set2, 1);
        var set2b = s.createJobSet(set2, 6);

        s.addJob(null, p.A, null, function () { 
            tc.areEqual(++state, 1);
        });
        s.addJob(set1, p.A, null, function () {
            tc.areEqual(++state, 2);
        });
        s.addJob(set2a, p.A, null, function () {
            tc.areEqual(++state, 5);
        });
        s.addJob(set2, p.A, null, function () {
            tc.areEqual(++state, 6);
        });
        s.addJob(set1a, p.A, null, function () {
            tc.areEqual(++state, 3);
        });
        s.addJob(set1b, p.A, null, function () {
            tc.areEqual(++state, 4);
        });
        s.addJob(set2b, p.A, null, function () {
            tc.areEqual(++state, 7);
        });
        s.addJob(null, p.A, null, function () { 
            tc.areEqual(++state, 8);

            s.addJob(set1, p.A, null, function () {
                tc.areEqual(++state, 10);
                s.dispose();
                tc.start();
            });
            s.addJob(set2, p.A, null, function () {
                tc.areEqual(++state, 9);
            });
            set1.order = 100;
        });
    });

    Tx.asyncTest("SchedulerTests.testJobSetVisibility", function (tc) {
        tc.stop();

        var s = new Jx.Scheduler();
        var p = s.definePriorities({ A: { base: BasePriority.normal } });
        var state = 0;
        var set1 = s.createJobSet(); 
        var set2 = s.createJobSet();
        var set1a = s.createJobSet(set1);
        var set1b = s.createJobSet(set1); set1b.visible = false;
        var set1c = s.createJobSet(set1);
        var set2a = s.createJobSet(set2);
        var set2b = s.createJobSet(set2); set2b.visible = false;

        s.addJob(set1, p.A, null, function () {
            tc.areEqual(++state, 1);
        });
        s.addJob(set1a, p.A, null, function () {
            tc.areEqual(++state, 2);
        });
        s.addJob(set1b, p.A, null, function () {
            tc.areEqual(++state, 4);
        });
        s.addJob(set1c, p.A, null, function () {
            tc.areEqual(++state, 3);
            set1c.visible = false;
        });
        s.addJob(set1c, p.A, null, function () {
            tc.areEqual(++state, 5);
        });
        s.addJob(set2, p.A, null, function () {
            tc.areEqual(++state, 6);
        });
        s.addJob(set2a, p.A, null, function () {
            tc.areEqual(++state, 7);
        });
        s.addJob(set2b, p.A, null, function () {
            tc.areEqual(++state, 8);

            s.addJob(set2b, p.A, null, function () {
                tc.areEqual(++state, 10);
                s.dispose();
                tc.start();
            });
            s.addJob(set2a, p.A, null, function () {
                tc.areEqual(++state, 9);
            });
            set2.visible = true;
        });

        set2.visible = false;
    });

    Tx.asyncTest("SchedulerTests.testCancelJobSet", function (tc) {
        tc.stop();

        var s = new Jx.Scheduler();
        var p = s.definePriorities({ A: { base: BasePriority.normal } });
        var state = 0;
        var set1 = s.createJobSet();
        var set1a = s.createJobSet(set1);
        var set2 = s.createJobSet();

        s.addJob(set1, p.A, null, function () {
            tc.areEqual(++state, 1);
        });
        s.addJob(set2, p.A, null, function () {
            tc.areEqual(++state, 2);
            set1.cancelJobs();
            s.addJob(set1, p.A, null, function () {
                tc.areEqual(++state, 4);
                s.dispose();
                tc.start();
            });
        });
        s.addJob(set1, p.A, null, function () {
            tc.error();
        });
        s.addTimerJob(set1, p.A, null, 20, function () {
            tc.error();
        });
        s.addJob(set1a, p.A, null, function () {
            tc.error();
        });
        s.addJob(set2, p.A, null, function () {
            tc.areEqual(++state, 3);
            set2.cancelJobs();
        });
        s.addJob(set2, p.A, null, function () {
            tc.error();
        });
    });

    Tx.test("SchedulerTests.testCancelJobWithTimerSet", function (tc) {
        var s = new Jx.Scheduler();
        var p = s.definePriorities({ A: { base: BasePriority.normal } });
        var set1 = s.createJobSet();

        s.addTimerJob(set1, p.A, null, 20, function () {
            tc.error();
        });
        s.addTimerJob(set1, p.A, null, 20, function () {
            tc.error();
        });
        s.addTimerJob(set1, p.A, null, 20, function () {
            tc.error();
        });
        set1.cancelJobs();
    });

    Tx.asyncTest("SchedulerTests.testDisposeJobSet", function (tc) {
        tc.stop();

        var s = new Jx.Scheduler();
        var p = s.definePriorities({ A: { base: BasePriority.normal } });
        var state = 0;
        var set1 = s.createJobSet();
        var set1a = s.createJobSet(set1);
        var set2 = s.createJobSet();

        s.addJob(set1, p.A, null, function () {
            tc.areEqual(++state, 1);
        });
        s.addJob(set2, p.A, null, function () {
            tc.areEqual(++state, 2);
            set1.dispose();
        });
        s.addJob(set1, p.A, null, function () {
            tc.error();
        });
        s.addJob(set1a, p.A, null, function () {
            tc.error();
        });
        s.addTimerJob(set1a, p.A, null, 20, function () {
            tc.error();
        });
        s.addJob(set2, p.A, null, function () {
            tc.areEqual(++state, 3);
            s.dispose();
            tc.start();
        });
    });

    Tx.test("SchedulerTests.testSetTimeslice", function (tc) {
        var s = new Jx.Scheduler();
        var p = s.definePriorities({ A: { base: BasePriority.normal } });
        var t = overrideTiming(s, tc);

        s.setTimeSlice(1000);

        s.addJob(null, p.A, null, function () { 
            tc.areEqual(t.time, 0);
            t.time = 100;
        });
        tc.areEqual(t.queuedPriority, s._priorityMapping[p.A._base]);
        s.addJob(null, p.A, null, function () {
            tc.areEqual(t.time, 100); 
            t.time = 200;
        });
        s.addJob(null, p.A, null, function () { 
            tc.areEqual(t.time, 200); 
            t.time = 999;
        });
        s.addJob(null, p.A, null, function () { 
            tc.areEqual(t.time, 999); 
            t.time = 1001;
        });
        s.addJob(null, p.A, null, function () { 
            tc.areEqual(t.time, 1050); 
            t.time = 5000;
        });
        s.addJob(null, p.A, null, function () { 
            tc.areEqual(t.time, 5050); 
        });

        t.runWinJSSchedule();
        tc.areEqual(t.time, 1001);
        tc.areEqual(t.queuedPriority, s._priorityMapping[p.A._base]);

        t.time = 1050;
        t.runWinJSSchedule();
        tc.areEqual(t.time, 5000);

        t.time = 5050;
        t.runWinJSSchedule();
        tc.areEqual(t.time, 5050);
        tc.isTrue(t.idle);
    });

    Tx.test("SchedulerTests.testYield", function (tc) {
        var s = new Jx.Scheduler();
        var p = s.definePriorities({ A: { base: BasePriority.normal } });
        var t = overrideTiming(s, tc);
        var state = 0;

        s.addJob(null, p.A, null, function () {
            tc.areEqual(++state, 1);
        });
        tc.areEqual(t.queuedPriority, s._priorityMapping[p.A._base]);
        s.addJob(null, p.A, null, function () {
            tc.areEqual(++state, 2);
            s.yield();
        });
        s.addJob(null, p.A, null, function () {
            tc.areEqual(++state, 4);
        });

        t.runWinJSSchedule();

        tc.areEqual(++state, 3);
        t.runWinJSSchedule();
        
        tc.areEqual(++state, 5);
        tc.isTrue(t.idle);
    });

    Tx.test("SchedulerTests.testPause", function (tc) {
        var s = new Jx.Scheduler();
        var p = s.definePriorities({ A: { base: BasePriority.normal } });
        var t = overrideTiming(s, tc);
        var state = 0;

        s.addJob(null, p.A, null, function () {
            tc.areEqual(++state, 1);
        });
        s.addJob(null, p.A, null, function () {
            tc.areEqual(++state, 2);
            s.pause(); // Pause within job
        });
        s.addJob(null, p.A, null, function () {
            tc.areEqual(++state, 4);
        });

        t.runWinJSSchedule();

        tc.areEqual(++state, 3);
        tc.isTrue(t.idle);

        s.resume();
        t.runWinJSSchedule();

        tc.areEqual(++state, 5);
        tc.isTrue(t.idle);

        s.addJob(null, p.A, null, function () {
            tc.areEqual(++state, 6);
            t.time = 1000;
        });
        s.addJob(null, p.A, null, function () {
            tc.areEqual(++state, 9);
        });

        t.runWinJSSchedule();

        tc.areEqual(++state, 7);
        s.pause(); // Pause during yielded time
        t.runWinJSSchedule();

        tc.areEqual(++state, 8);
        tc.isTrue(t.idle);

        s.resume();
        t.runWinJSSchedule();
        tc.areEqual(++state, 10);
        tc.isTrue(t.idle);
    });

    Tx.test("SchedulerTests.testPrioritizeInvisible", function (tc) {
        var s = new Jx.Scheduler();
        var p = s.definePriorities({ A: { base: BasePriority.normal }, B: { base: BasePriority.normal }, C: { base: BasePriority.belowNormal } });
        var set1 = s.createJobSet();
        var set2 = s.createJobSet(); set2.visible = false;
        var t = overrideTiming(s, tc);
        var state = 0;

        // In normal "prefer visible" mode, the visible jobs (set 1, pri A and B) all come before the invisible jobs (set 2, pri A and B), which all come before the
        // too-low-to-care-about visibility jobs (set 1 and 2, pri C)
        s.addJob(set1, p.A, null, function () {
            tc.areEqual(++state, 1);
        });
        tc.areEqual(t.queuedPriority, s._priorityMapping[p.A._base]);
        s.addJob(set1, p.B, null, function () {
            tc.areEqual(++state, 2);
        });
        s.addJob(set1, p.C, null, function () {
            tc.areEqual(++state, 5);
        });
        s.addJob(set2, p.A, null, function () {
            tc.areEqual(++state, 3);
        });
        s.addJob(set2, p.B, null, function () {
            tc.areEqual(++state, 4);
        });
        s.addJob(set2, p.C, null, function () {
            tc.areEqual(++state, 6);
        });
        tc.areEqual(t.queuedPriority, s._priorityMapping[p.A._base]);
        t.runWinJSSchedule();
        tc.areEqual(++state, 7);
        tc.isTrue(t.idle);

        // In scrolling "prefer priority" mode, the jobs run in strict priority order.
        s.prioritizeInvisible();
        s.prioritizeInvisible(); // multiple calls are expected
        s.addJob(set1, p.A, null, function () {
            tc.areEqual(++state, 8);
        });
        tc.areEqual(t.queuedPriority, s._priorityMapping[p.A._base]);
        s.addJob(set1, p.B, null, function () {
            tc.areEqual(++state, 10);
        });
        s.addJob(set1, p.C, null, function () {
            tc.areEqual(++state, 12);
        });
        s.addJob(set2, p.A, null, function () {
            tc.areEqual(++state, 9);
        });
        s.addJob(set2, p.B, null, function () {
            tc.areEqual(++state, 11);
        });
        s.addJob(set2, p.C, null, function () {
            tc.areEqual(++state, 13);
        });
        tc.areEqual(t.queuedPriority, s._priorityMapping[p.A._base]);

        t.runWinJSSchedule();
        tc.areEqual(++state, 14);
        tc.areEqual(t.queuedPriority, null);

        // After some time, the jobs revert to normal ordering.
        t.runTimeout();
        s.addJob(set1, p.A, null, function () {
            tc.areEqual(++state, 15);
        });
        s.addJob(set1, p.B, null, function () {
            tc.areEqual(++state, 16);
        });
        s.addJob(set1, p.C, null, function () {
            tc.areEqual(++state, 19);
        });
        s.addJob(set2, p.A, null, function () {
            tc.areEqual(++state, 17);
        });
        s.addJob(set2, p.B, null, function () {
            tc.areEqual(++state, 18);
        });
        s.addJob(set2, p.C, null, function () {
            tc.areEqual(++state, 20);
        });
        tc.areEqual(t.queuedPriority, s._priorityMapping[p.A._base]);

        t.runWinJSSchedule();
        tc.areEqual(++state, 21);
        tc.areEqual(t.queuedPriority, null);
        tc.isTrue(t.idle);
    });

    Tx.test("SchedulerTests.testRunSynchronous", function (tc) {
        var s = new Jx.Scheduler();
        var p = s.definePriorities({ A: { base: BasePriority.high }, B: { base: BasePriority.normal }, C: { base: BasePriority.belowNormal } });
        var t = overrideTiming(s, tc);

        s.addJob(null, p.A, null, function () {
            tc.areEqual(t.time, 0);
            t.time = 1000;
        });
        tc.areEqual(t.queuedPriority, s._priorityMapping[p.A._base]);
        s.addJob(null, p.A, null, function () {
            tc.areEqual(t.time, 2000);
            t.time = 3000;
        });
        s.addJob(null, p.B, null, function () {
            tc.areEqual(t.time, 3000);
            t.time = 4000;
        });
        s.addJob(null, p.C, null, function () {
            tc.areEqual(t.time, 5000);
            t.time = 6000;
        });
        s.addJob(null, p.C, null, function () {
            tc.areEqual(t.time, 6000);
            t.time = 7000;
        });
        tc.areEqual(t.queuedPriority, s._priorityMapping[p.A._base]);

        t.runWinJSSchedule();
        tc.areEqual(t.queuedPriority, s._priorityMapping[p.A._base]);
        tc.areEqual(t.time, 1000);

        t.time = 2000;
        s.runSynchronous(p.B);
        tc.areEqual(t.time, 4000);
        // We first scheduled a job at pri A, then ran it synchronously, but our WinJS
        // job was still at pri A.  So we had to cancel this and requeue at pri B.
        tc.areEqual(t.queuedPriority, s._priorityMapping[p.C._base]);

        t.time = 5000;
        t.runWinJSSchedule();
        tc.areEqual(t.queuedPriority, s._priorityMapping[p.C._base]);

        tc.areEqual(t.time, 6000);
        t.runWinJSSchedule();
        tc.areEqual(t.time, 7000);
        tc.areEqual(t.queuedPriority, null);
        tc.isTrue(t.idle);

        s.addJob(null, p.A, null, function () {
            tc.areEqual(t.time, 8000);
            t.time = 9000;
        });
        tc.areEqual(t.queuedPriority, s._priorityMapping[p.A._base]);
        s.addJob(null, p.A, null, function () {
            tc.areEqual(t.time, 9000);
            t.time = 10000;
        });
        s.addJob(null, p.A, null, function () {
            tc.areEqual(t.time, 10000);
            t.time = 11000;
        });
        s.addJob(null, p.A, null, function () {
            tc.areEqual(t.time, 12000);
            t.time = 13000;
        });

        t.time = 8000;
        s.runSynchronous(null, 2500);
        tc.areEqual(t.queuedPriority, s._priorityMapping[p.A._base]);
        tc.areEqual(t.time, 11000);

        t.time = 12000;
        // We scheduled a job at pri A, but we already had another job scheduled at idle.  So we had to cancel that other job and schedule a new one at pri A.
        tc.areEqual(t.queuedPriority, s._priorityMapping[p.A._base]);
        t.runWinJSSchedule();
        tc.areEqual(t.time, 13000);
        tc.areEqual(t.queuedPriority, null);
        tc.isTrue(t.idle);

    });

    Tx.test("SchedulerTests.testRunEverythingSynchronous", function (tc) {
        var s = new Jx.Scheduler();
        var p = s.definePriorities({ A: { base: BasePriority.high }, B: { base: BasePriority.normal }, C: { base: BasePriority.belowNormal } });
        var t = overrideTiming(s, tc);

        s.addJob(null, p.A, null, function () {
            tc.areEqual(t.time, 0);
            t.time = 1000;
        });
        s.addJob(null, p.A, null, function () {
            tc.areEqual(t.time, 1000);
            t.time = 2000;
        });
        s.addJob(null, p.B, null, function () {
            tc.areEqual(t.time, 2000);
            t.time = 3000;
        });
        s.addJob(null, p.B, null, function () {
            tc.areEqual(t.time, 3000);
            t.time = 4000;
        });
        s.addJob(null, p.B, null, function () {
            tc.areEqual(t.time, 4000);
            t.time = 5000;
        });
        s.addJob(null, p.C, null, function () {
            tc.areEqual(t.time, 5000);
            t.time = 6000;
        });
        s.addJob(null, p.C, null, function () {
            tc.areEqual(t.time, 6000);
            t.time = 7000;
        });

        t.time = 0;
        s.runSynchronous(p.C, 10000);
        tc.areEqual(t.time, 7000);

        // There shouldn't still be any pending job.
        tc.areEqual(t.queuedPriority, null);
    });

    Tx.test("SchedulerTests.testSynchronousRepeatingJob", function (tc) {
        var s = new Jx.Scheduler();
        var p = s.definePriorities({ A: { base: BasePriority.normal }});
        var runCount = 0;
        var runMax = 5;
        var jobSet = s.createJobSet();
        var job = s.addJob(jobSet, p.A, null, function () {
            tc.isTrue(runCount < runMax);
            runCount++;
            return Jx.Scheduler.repeat(runCount < runMax);
        });
        tc.areEqual(runCount, 0);
        job.runIteration();
        tc.areEqual(runCount, 1);
        jobSet.runSynchronous();
        tc.areEqual(runCount, runMax);
        s.testFlush();
        s.dispose();
        tc.areEqual(runCount, runMax);
    });

    Tx.test("SchedulerTests.testJobRun", function (tc) {
        var s = new Jx.Scheduler();
        var p = s.definePriorities({ A: { base: BasePriority.normal }});
        var jobRunCount = 0;
        var job = s.addJob(null, p.A, null, function () {
            tc.isTrue(jobRunCount < 5);
            jobRunCount++;
            return Jx.Scheduler.repeat(jobRunCount < 5);
        });
        job.run();
        tc.isTrue(jobRunCount === 5);
        job.runIteration();  // should do nothing
        s.testFlush();
        s.dispose();
    });

    Tx.test("SchedulerTests.testJobRunIteration", function (tc) {
        var s = new Jx.Scheduler();
        var p = s.definePriorities({ A: { base: BasePriority.normal }});
        var jobRun = false;
        var job = s.addJob(null, p.A, null, function () {
            tc.isFalse(jobRun);
            jobRun = true;
        });
        job.runIteration();
        tc.isTrue(jobRun);
        job.runIteration();  // should do nothing
        s.testFlush();
        s.dispose();
    });

    Tx.test("SchedulerTests.testTimerJobRun", function (tc) {
        var s = new Jx.Scheduler();
        var p = s.definePriorities({ A: { base: BasePriority.normal } });
        var jobRun = false;
        var job = s.addTimerJob(null, p.A, null, 20, function () {
            tc.isFalse(jobRun);
            jobRun = true;
        });
        job.runIteration();
        tc.isTrue(jobRun);
        job.runIteration();  // should do nothing
        s.testFlush();
        s.dispose();
    });

    Tx.asyncTest("SchedulerTests.testTimerJobRunWithTimerCompleted", function (tc) {
        tc.stop();
        var s = new Jx.Scheduler();
        var p = s.definePriorities({ A: { base: BasePriority.normal } });
        var jobRun = false;
        var job = s.addTimerJob(null, p.A, null, 20, function () {
            tc.isFalse(jobRun);
            jobRun = true;
        });
        s.addTimerJob(null, p.A, null, 30, function () {
            tc.isTrue(jobRun);
            job.runIteration();
            s.dispose();
            tc.start();
        });
    });

    Tx.test("SchedulerTests.testDisposedJobRun", function (tc) {
        var s = new Jx.Scheduler();
        var p = s.definePriorities({ A: { base: BasePriority.normal }});
        var job = s.addJob(null, p.A, null, function () {
            tc.error("Job should not have run");
        });
        job.dispose();
        job.runIteration();
        s.testFlush();
        s.dispose();
    });

    Tx.test("SchedulerTests.testDisposedTimerJobRun", function (tc) {
        var s = new Jx.Scheduler();
        var p = s.definePriorities({ A: { base: BasePriority.normal } });
        var job = s.addTimerJob(null, p.A, null, 20, function () {
            tc.error("Job should not have run");
        });
        job.dispose();
        job.runIteration();
        s.testFlush();
        s.dispose();
    });

    Tx.test("SchedulerTests.testDisposedJobRun", function (tc) {
        var s = new Jx.Scheduler();
        var p = s.definePriorities({ A: { base: BasePriority.aboveNormal }, B: { base: BasePriority.high }, C: { base: BasePriority.normal }});
        var t = overrideTiming(s, tc);
        var invisibleJobSet = s.createJobSet();
        invisibleJobSet.visible = false;
        var visibleJobSet = s.createJobSet();
        var aRan = false,
            bRan = false,
            cRan = false;
        s.addJob(invisibleJobSet, p.A, null, function () {
            tc.areEqual(t.time, 200);
            t.time = 300;
            tc.isFalse(aRan);
            aRan = true;
            tc.isTrue(bRan);
            tc.isTrue(cRan);
        });
        // Assumes that BasePriority.belowNormal is the visibility threshold
        tc.areEqual(t.queuedPriority, s._priorityMapping[BasePriority.belowNormal]);
        s.addJob(visibleJobSet, p.B, null, function () {
            tc.areEqual(t.time, 0);
            t.time = 100;
            tc.isFalse(bRan);
            bRan = true;
            tc.isFalse(aRan);
            tc.isFalse(cRan);
        });
        tc.areEqual(t.queuedPriority, s._priorityMapping[p.B._base]);
        s.addJob(visibleJobSet, p.C, null, function () {
            tc.areEqual(t.time, 100);
            t.time = 200;
            tc.isFalse(cRan);
            cRan = true;
            tc.isFalse(aRan);
            tc.isTrue(cRan);
        });

        tc.areEqual(t.time, 0);
        tc.isFalse(bRan);
        tc.areEqual(t.queuedPriority, s._priorityMapping[p.B._base]);
        t.runWinJSSchedule();
        tc.isTrue(bRan);

        tc.areEqual(t.time, 100);
        tc.isFalse(cRan);
        tc.areEqual(t.queuedPriority, s._priorityMapping[p.A._base]);   // This isn't quite right because A is invisible.  Should be C.
        t.runWinJSSchedule();
        tc.isTrue(cRan);

        tc.areEqual(t.time, 200);
        tc.isFalse(aRan);
        tc.areEqual(t.queuedPriority, s._priorityMapping[p.A._base]);
        t.runWinJSSchedule();
        tc.isTrue(aRan);

        tc.areEqual(t.time, 300);
        tc.areEqual(t.queuedPriority, null);
        tc.isTrue(t.idle);

        s.testFlush();
        s.dispose();
    });
})();
