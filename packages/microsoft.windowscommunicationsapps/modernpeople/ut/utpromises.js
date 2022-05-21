
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,WinJS,window,Include*/

Include.initializeFileScope(function () {

    var P = window.People;

    var expectSuccess = function (tc) {
        tc.log("The promise returned successfully.");
    };
    var expectFailure = function (tc) {
        tc.log("The promise failed as expected.");
    };
    var unexpectSuccess = function (tc) {
        tc.fail("The promise returned without the expected failure.");
    };
    var unexpectFailure = function (tc) {
        tc.fail("An error was returned from the promise.");
    };


    Tx.asyncTest("promiseTests.testErrorIfTimeout", function (tc) {
        tc.stop();
 
        var timeoutTest = function(timeout) {
            return new WinJS.Promise(
                function runTest(complete, error) {
                    window.setTimeout(function () { complete(); }, timeout);
                });
        };

        var tests = [
            P.Promises.errorIfTimeout(timeoutTest(100), 200).then(expectSuccess.bind(window, tc), unexpectFailure.bind(window.tc)),
            P.Promises.errorIfTimeout(timeoutTest(200), 100).then(unexpectSuccess.bind(window, tc), expectFailure.bind(window, tc))
        ];

        var startAsyncTask = tc.start.bind(tc,1);

        WinJS.Promise.join(tests).done(startAsyncTask,
            (function testFail(errorMessage) {
                startAsyncTask(); 
                tc.fail(errorMessage);
            }));
    });

    Tx.asyncTest("promiseTests.testSynchronousPromise", function (tc) {
        tc.stop();

        var successFunction = function () {
            return;
        };
        var failFunction = function () {
            return new Error("Fail Test Please");
        };

        var tests = [
            P.Promises.synchronousPromise(successFunction).then(expectSuccess.bind(window, tc), unexpectFailure.bind(window, tc)),
            P.Promises.synchronousPromise(failFunction).then(unexpectSuccess.bind(window, tc), expectFailure.bind(window, tc))
        ];

        var startAsyncTask = tc.start.bind(tc,1);

        WinJS.Promise.join(tests).done(startAsyncTask,
            (function testFail(errorMessage) {
                startAsyncTask(); 
                tc.fail(errorMessage);
            }));
    });
});