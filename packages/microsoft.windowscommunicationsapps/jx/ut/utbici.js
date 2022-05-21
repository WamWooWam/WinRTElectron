
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../core/Bici.js" />
/// <reference path="../core/Transaction.js" />

/*global Tx,Jx*/

Tx.test("BiciTests.test1", function (tc) {
    // Initialize logging
    Jx.log = new Jx.Log();
    Jx.log.enabled = true;
    Jx.log.level = Jx.LOG_VERBOSE;

    var b = new Jx.Bici();

    if (Jx.isWWA) {
        tc.areNotEqual(b._bici, null);
    } else {
        tc.areEqual(b._bici, null);
    }

    b.startExperience();

    // Simple datapoints
    b.set(1000, 100);
    b.setString(1001, "The truth is out there");

    // Simple datapoint - Arithmetic
    b.increment(1000, 1);

    // Stream datapoints
    b.addToStream(1005, "one", "two", "three", "1", "2", "3", 1, 2, 3);

    // Construct TransactionContext
    var txContext = new Jx.TransactionContext(37, 1033);
    var serializedTxContext = txContext.toBase64String();
    var txId = txContext.getTransactionId();
    var txContextNext = txContext.getNextTransactionContext(3);

    if (Jx.isWWA) {
        tc.areNotEqual(txContext._txContext, null);
        tc.areNotEqual(serializedTxContext, null);
        tc.areNotEqual(txId, null);
        tc.areNotEqual(txContextNext, null);
    } else {
        tc.areEqual(txContext._txContext, null);
        tc.areEqual(serializedTxContext, null);
        tc.areEqual(txId, null);
        tc.areEqual(txContextNext, null);
    }

    b.recordQosStream(50200, 2, 3, 4, 5, 6, txId, "arg11", "arg12");

    b.recordQosStream(50200, 2, 3, 3, 4, 0, txId, "arg21", "arg22");
    b.recordDependentApiQos(50200, 3, 4, 5, 10, 0, 0, txId, "arg31", "arg32");
    b.recordIncomingApiQos(50200, 2, 3, 5, 10, 0, 0, txId, "arg41", "arg42");
    b.recordInternalApiQos(50200, 2, 5, 10, 0, 0, txId, "arg51", "arg52");
    b.recordScenarioQos(50200, 15, 10, 1, 1, txId, "arg61", "arg62");

    // Transfer to web
    if (Jx.isWWA) {
        var token = "wlexpid";
        var token2 = "wlrefapp";
        var resultUrl;
        b.setErrorsFound(false);
        // good URL HTTP, both tokens, case-insensitive
        resultUrl = b.transferExperienceToWeb("http://test.LIVE.com/query");
        tc.areNotEqual(resultUrl.indexOf(token), -1, "wlexpid token not found in " + resultUrl);
        resultUrl = b.transferExperienceToWeb("http://test.microsoft.COM/query");
        tc.areNotEqual(resultUrl.indexOf(token2), -1, "wlrefapp token not found in " + resultUrl);
        tc.areEqual(b.getErrorsFound(), false, "transferExperienceToWeb 1");
        // good URL HTTPS
        resultUrl = b.transferExperienceToWeb("https://live.com/query?a=1");
        tc.areNotEqual(resultUrl.indexOf(token), -1, "wlexpid token not found in " + resultUrl);
        tc.areEqual(b.getErrorsFound(), false, "transferExperienceToWeb 2");
        // good URL no query
        resultUrl = b.transferExperienceToWeb("http://test-2.live.com");
        tc.areNotEqual(resultUrl.indexOf(token), -1, "wlexpid token not found in " + resultUrl);
        tc.areEqual(b.getErrorsFound(), false, "transferExperienceToWeb 3");
        // bad URL - sub domain
        resultUrl = b.transferExperienceToWeb("http://test.live.com.tw/query");
        tc.areEqual(resultUrl, "http://test.live.com.tw/query");
        tc.areEqual(b.getErrorsFound(), true, "transferExperienceToWeb 4");
        b.setErrorsFound(false);
        // bad URL - part of domain name
        resultUrl = b.transferExperienceToWeb("http://testlive.com/query");
        tc.areEqual(resultUrl, "http://testlive.com/query");
        tc.areEqual(b.getErrorsFound(), true, "transferExperienceToWeb 5");
        b.setErrorsFound(false);
    } else {
        // just test that these APIs are not throwing
        b.transferExperienceToWeb("http://test.LIVE.com/query");
        b.setErrorsFound(false);
        tc.areEqual(b.getErrorsFound(), false, "transferExperienceToWeb 6");
    }

    // reload config
    b.reloadConfig();

    var expId = b.getExperienceId();

    if (Jx.isWWA) {
        tc.areNotEqual(expId, null, "getExperienceId returned null");
    } else {
        tc.areEqual(expId, null, "getExperienceId returned " + expId);
    }

    var appId = b.getApplicationId();

    if (Jx.isWWA) {
        tc.areNotEqual(appId, null, "getApplicationId returned null");
    } else {
        tc.areEqual(appId, null, "getApplicationId returned " + appId);
    }

    b.pauseExperience();
    b.continueExperience();
    b.endExperience();

    b.dispose();
    tc.areEqual(b._bici, null, "bici is not null after dispose");
});
