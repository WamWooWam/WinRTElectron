
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Tx.Events UTs

/*global Tx*/

Tx.test("Tx.Events: events, no handlers", function () {
    var o = Tx.mix({}, Tx.Events);

    o.initEvents();
    o.dispatchEvent({ type: "foo" });
    o.dispatchEvent({ type: "bar", x: 1 });
    o.disposeEvents();
});

Tx.test("Tx.Events: 1 event, 1 handler", function (tc) {
    var o = Tx.mix({}, Tx.Events);
    var f1Called = 0;
    var evFoo = { type: "foo", x: 1 };

    function f1(ev) {
        f1Called++;
        tc.areEqual(ev, evFoo, "validate callback args");
    }

    o.initEvents();
    o.addEventListener("foo", f1);
    o.dispatchEvent(evFoo);

    tc.areEqual(f1Called, 1, "f1 called");

    o.removeEventListener("foo", f1);
    o.dispatchEvent(evFoo);

    tc.areEqual(f1Called, 1, "f1 not called");

    o.disposeEvents();
});

Tx.test("Tx.Events: multiple events, multiple handlers", function (tc) {
    var o = Tx.mix({}, Tx.Events);
    var f1Called = 0;
    var f2Called = 0;
    var evFoo = { type: "foo", arg: "foo event arg" };
    var evBar = { type: "bar", arg: "bar event arg" };

    function f1(ev) {
        f1Called++;
        tc.areEqual(ev, evFoo, "validate callback args f1");
    }

    function f2(ev) {
        f2Called++;
        tc.areEqual(ev, evBar, "validate callback args f2");
    }

    o.initEvents();

    // 2 handlers, 1 event

    o.addEventListener("foo", f1);
    o.addEventListener("foo", f1);
    o.dispatchEvent(evFoo);

    tc.areEqual(f1Called, 2, "f1 called");

    // 4 handlers, 2 events

    o.addEventListener("bar", f2);
    o.addEventListener("bar", f2);
    o.dispatchEvent(evBar);

    tc.areEqual(f2Called, 2, "f2 called");

    // remove handlers

    o.removeEventListener("foo", f1);
    o.removeEventListener("foo", f1);
    o.dispatchEvent(evFoo);

    tc.areEqual(f1Called, 2, "f1 not called");

    o.removeEventListener("bar", f2);
    o.removeEventListener("bar", f2);
    o.dispatchEvent(evBar);

    tc.areEqual(f2Called, 2, "f2 not called");

    o.disposeEvents();
});

// TODO: add more tests
