
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Base UTs

/// <reference path="../core/Base.js" />

/*global Jx,Tx*/

Tx.test("BaseTests.testNewBase", function (tc) {
    var A = function (name) {
        this.name = name;
    };

    Jx.augment(A, Jx.Base);

    var a = new A("a");

    tc.ok(a.name === "a");
});

Tx.test("BaseTests.testInitShutdown", function (tc) {
    var A = function () {};

    Jx.augment(A, Jx.Base);

    var a = new A();

    tc.ok(!a.isInit());
    tc.ok(!a.isShutdown());

    a.initBase();

    tc.ok(a.isInit());
    tc.ok(!a.isShutdown());

    a.shutdownBase();

    tc.ok(a.isInit());
    tc.ok(a.isShutdown());
});
