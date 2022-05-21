
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Activation UTs

/// <reference path="../core/Activation.js" />

/*global Tx,Jx*/

(function () {
    // Test object instances
    Tx.test("ActivationTests.test1", function (/*tc*/) {
        var a = new Jx.Activation(), b;
        a.dispose();

        a = new Jx.Activation();
        a.dispose();

        a = new Jx.Activation();
        b = new Jx.Activation();
        a.dispose();
        b.dispose();
    });

    Tx.test("ActivationTests.testOnlyActivate", function (tc) {
        var a = new Jx.Activation();
        var activatedCalled = 0;

        function onActivatedEventCalled(ev) {
            tc.areEqual(ev, 11);
            activatedCalled++;
        }

        a.addListener(Jx.Activation.prototype.activated, onActivatedEventCalled);
        a.raiseEvent(Jx.Activation.prototype.activated, 11);
        tc.areEqual(activatedCalled, 1);

        a.dispose();
    });

    function _testContract(contractId, tc) {
        var a = new Jx.Activation();
        var onContractCalled = 0;

        function onContract(ev) {
            tc.areEqual(ev, 11);
            onContractCalled++;
        }

        a.addListener(contractId, onContract);
        a.raiseEvent(contractId, 11);
        tc.areEqual(onContractCalled, 1);

        a.dispose();
    }

    Tx.test("ActivationTests.testAppointmentsProvider", function (tc) {
        _testContract(Jx.Activation.prototype.appointmentsProvider, tc);
    });

    // Test account picture activation
    Tx.test("ActivationTests.testAccountPicture", function (tc) {
        _testContract(Jx.Activation.prototype.accountPictureProvider, tc);
    });

    // Test tile activation
    Tx.test("ActivationTests.testTile", function (tc) {
        _testContract(Jx.Activation.prototype.tile, tc);
    });

    // Test protocol activation
    Tx.test("ActivationTests.testProtocol", function (tc) {
        _testContract(Jx.Activation.prototype.protocol, tc);
    });

    // Test share target activation
    Tx.test("ActivationTests.testShare", function (tc) {
        _testContract(Jx.Activation.prototype.share, tc);
    });

    // Test autoplay file type activation
    Tx.test("ActivationTests.testAutoPlayFile", function (tc) {
        _testContract(Jx.Activation.prototype.autoPlayFile, tc);
    });

    // Test autoplay device type activation
    Tx.test("ActivationTests.testAutoPlayDevice", function (tc) {
        _testContract(Jx.Activation.prototype.autoPlayDevice, tc);
    });

    // Test search activation
    Tx.test("ActivationTests.testSearch", function (tc) {
        _testContract(Jx.Activation.prototype.search, tc);
    });

    // Test contact picker activation
    Tx.test("ActivationTests.testContactPicker", function (tc) {
        _testContract(Jx.Activation.prototype.contactPicker, tc);
    });

    // Test contact activation
    Tx.test("ActivationTests.testContact", function (tc) {
        _testContract(Jx.Activation.prototype.contact, tc);
    });

    // Test file save picker activation
    Tx.test("ActivationTests.testFileSavePicker", function (tc) {
        _testContract(Jx.Activation.prototype.fileSavePicker, tc);
    });

    // Test cached file updater activation
    Tx.test("ActivationTests.testCachedFileUpdater", function (tc) {
        _testContract(Jx.Activation.prototype.cachedFileUpdater, tc);
    });

    // Test file open picker activation
    Tx.test("ActivationTests.testFileOpenPicker", function (tc) {
        _testContract(Jx.Activation.prototype.fileOpenPicker, tc);
    });

    // Test suspending
    Tx.test("ActivationTests.testSuspending", function (tc) {
        _testContract(Jx.Activation.prototype.suspending, tc);
    });

    // Test resuming
    Tx.test("ActivationTests.testResuming", function (tc) {
        _testContract(Jx.Activation.prototype.resuming, tc);
    });

    // Test navigated
    Tx.test("ActivationTests.testNavigated", function (tc) {
        _testContract(Jx.Activation.prototype.navigated, tc);
    });

})();