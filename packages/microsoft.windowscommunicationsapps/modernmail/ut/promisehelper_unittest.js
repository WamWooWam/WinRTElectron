
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Mail,Tx*/

(function () {

    Tx.test("PromiseHelper.test_asyncJob", {owner: "kepoon", priority: 0}, function (tc) {
        var isCalled = false,
            promiseFired = false,
            doSomething = function () {
                isCalled = true;
            },
            job = new Mail.Promises.AsyncJob(doSomething, null, []);

        job.promise.then(function () {
            tc.isTrue(isCalled);
            promiseFired = true;
        });
        job.execute();
        tc.isTrue(promiseFired);
    });

    Tx.test("PromiseHelper.test_asyncJob_cancel", { owner: "kepoon", priority: 0 }, function (tc) {
        var isCalled = false,
            completeFired = false,
            errorFired = false,
            doSomething = function () {
                isCalled = true;
            },
            job = new Mail.Promises.AsyncJob(doSomething, null, []);

        job.promise.then(function () {
            tc.isTrue(isCalled);
            completeFired = true;
        }, function (err) {
            errorFired = true;
            tc.areEqual(err.message, "Canceled");
        });

        job.dispose();
        tc.isTrue(errorFired);

        job.execute();
        tc.isFalse(isCalled);
        tc.isFalse(completeFired);
    });
})();
