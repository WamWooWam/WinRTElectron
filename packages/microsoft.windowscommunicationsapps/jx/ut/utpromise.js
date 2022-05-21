
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx,Tx,WinJS*/
(function () {

    var Promise = Jx.Promise;

    Tx.test("Promise.testForkComplete", function (tc) {
        var innerComplete,
            forkComplete = false;
        Promise.fork(new WinJS.Promise(function (c) {
            innerComplete = c;
        })).then(function () { forkComplete = true; });

        tc.areEqual(forkComplete, false);
        innerComplete();
        tc.areEqual(forkComplete, true);
    });

    Tx.test("Promise.testForkError", function (tc) {
        var innerError,
            forkComplete = false;
        Promise.fork(new WinJS.Promise(function (c, e) {
            innerError = e;
        })).then(function () { forkComplete = true; });

        tc.areEqual(forkComplete, false);
        innerError(new Error("Tragedy"));
        tc.areEqual(forkComplete, true);
    });

    Tx.test("Promise.testForkInnerCancel", function (tc) {
        var forkComplete = false;
        var innerPromise = new WinJS.Promise(function () { });
        Promise.fork(innerPromise).then(function () { forkComplete = true; });

        tc.areEqual(forkComplete, false);
        innerPromise.cancel();
        tc.areEqual(forkComplete, true);
    });

    Tx.test("Promise.testForkOuterCancel", function (tc) {
        var forkCanceled = false,
            innerCompleted = false,
            innerComplete;
        var innerPromise = new WinJS.Promise(function (c) { innerComplete = c; }, function () { tc.fail(); });
        var fork = Promise.fork(innerPromise).then(function () { tc.fail(); }, function (err) { tc.areEqual(err.name, "Canceled"); forkCanceled = true; });
        innerPromise.then(function () { innerCompleted = true; });

        tc.areEqual(forkCanceled, false);
        tc.areEqual(innerCompleted, false);
        fork.cancel();
        tc.areEqual(forkCanceled, true);
        tc.areEqual(innerCompleted, false);

        innerComplete();
        tc.areEqual(forkCanceled, true);
        tc.areEqual(innerCompleted, true);
    });

    Tx.test("Promise.testCancelable", function (tc) {
        var innerComplete,
            innerCanceled = false,
            outerCanceled = false;
        var cancelable = Promise.cancelable(new WinJS.Promise(function (c) {
            innerComplete = c;
        }, function () {
            innerCanceled = true;
            innerComplete();
        })).then(function () { tc.fail(); }, function (err) { tc.areEqual(err.name, "Canceled"); outerCanceled = true; });

        tc.areEqual(innerCanceled, false);
        tc.areEqual(outerCanceled, false);
        cancelable.cancel();
        tc.areEqual(innerCanceled, true);
        tc.areEqual(outerCanceled, true);
    });

    Tx.test("Promise.testCancelablePropagateSuccess", function (tc) {
        var innerComplete,
            outerCompleted = false;
        Promise.cancelable(new WinJS.Promise(function (c) {
            innerComplete = c;
        }, function () {
            tc.fail();
        })).then(function () { outerCompleted = true; });

        tc.areEqual(outerCompleted, false);
        innerComplete();
        tc.areEqual(outerCompleted, true);
    });

    Tx.test("Promise.testCancelablePropagateError", function (tc) {
        var innerError,
            outerErrored = false,
            error = new Error("test");
        Promise.cancelable(new WinJS.Promise(function (c, e) {
            innerError = e;
        }, function () {
            tc.fail();
        })).then(function () {
            tc.fail();
        }, function (err) {
            tc.areEqual(err, error);
            outerErrored = true;
        });

        tc.areEqual(outerErrored, false);
        innerError(error);
        tc.areEqual(outerErrored, true);
    });

    Tx.test("Promise.testCancelablePropagateCancelOutward", function (tc) {
        var innerCanceled = false,
            outerCanceled = false,
            innerPromise = new WinJS.Promise(function () { }, function () { innerCanceled = true; });

        Promise.cancelable(innerPromise).then(function () { tc.fail(); }, function (err) {
            tc.areEqual(err.name, "Canceled");
            outerCanceled = true;
        });

        tc.areEqual(innerCanceled, false);
        tc.areEqual(outerCanceled, false);
        innerPromise.cancel();
        tc.areEqual(innerCanceled, true);
        tc.areEqual(outerCanceled, true);
    });

    Tx.test("Promise.testSchedule", function (tc) {
        var priority = Jx.scheduler.definePriorities({
                test: { base: Jx.Scheduler.BasePriority.normal }
            }),
            completed = 0,
            promise = new Promise.schedule(null, priority.test, "Some description");
        promise.done(function () { completed++; });

        tc.areEqual(completed, 0);
        Jx.scheduler.testFlush();
        tc.areEqual(completed, 1);
    });

    Tx.test("Promise.testScheduleCancel", function (tc) {
        var priority = Jx.scheduler.definePriorities({
                test: { base: Jx.Scheduler.BasePriority.normal }
            }),
            canceled = 0,
            promise = new Promise.schedule(null, priority.test, null);
        promise.done(function () { tc.fail(); }, function (err) {
            tc.areEqual(err.name, "Canceled");
            canceled++;
        });

        tc.areEqual(canceled, 0);
        promise.cancel();
        tc.areEqual(canceled, 1);
        Jx.scheduler.testFlush();
        tc.areEqual(canceled, 1);
    });

    Tx.test("Promise.testScheduleJobSet", function (tc) {
        var priority = Jx.scheduler.definePriorities({
                test: { base: Jx.Scheduler.BasePriority.normal }
            }),
            jobSet = Jx.scheduler.createJobSet(),
            complete = 0,
            promise = new Promise.schedule(jobSet, priority.test, null);
        promise.done(function () { complete++; });

        tc.areEqual(complete, 0);
        jobSet.runSynchronous();
        tc.areEqual(complete, 1);
        Jx.scheduler.testFlush();
        tc.areEqual(complete, 1);

        jobSet.dispose();
    });
})();
