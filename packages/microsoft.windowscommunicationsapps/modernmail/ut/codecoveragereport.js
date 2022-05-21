

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Tx, CodeCoverage*/

(function () {
    Tx.asyncTest("Code Coverage Report", { timeoutMs: 2000 }, function (tc) {
        tc.stop();
        CodeCoverage.mergeWithPreviousResults(function () {
            CodeCoverage.logCodeCoverageResult(tc);
            tc.start();
        });
    });
})();
