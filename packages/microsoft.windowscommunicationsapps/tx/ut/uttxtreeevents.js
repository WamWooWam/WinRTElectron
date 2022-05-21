
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Tx.TreeEvents UTs

/*global Tx*/

(function () {

    //
    // Simple object with events
    //

    function TE () {
        this.initTreeNode();
        this.initTreeEvents();
    }

    TE.prototype.dispose = function () {
        this.disposeTreeEvents();
        this.disposeTreeNode();
    };

    Tx.mix(TE.prototype, Tx.TreeEvents);
    Tx.mix(TE.prototype, Tx.TreeNode);

    //
    // Tests
    //

    Tx.test("Tx.TreeEvents: ctor/dispose", function () {
        var o = new TE();
        o.dispose();
    });

    Tx.test("Tx.TreeEvents: 1 event, 1 handler, depth 1, target", function (tc) {
        var o = new TE();
        var f1Called = 0;
        var evFoo = { type: "foo", x: 1 };

        function f1(ev) {
            f1Called++;
            tc.areEqual(ev, evFoo, "validate callback args");
        }

        o.addEventListener("foo", f1);
        o.dispatchEvent(evFoo);

        tc.areEqual(f1Called, 1, "f1 called");

        o.removeEventListener("foo", f1);
        o.dispatchEvent(evFoo);

        tc.areEqual(f1Called, 1, "f1 not called");

        o.dispose();
    });

    Tx.test("Tx.TreeEvents: 1 event, 2 handlers, depth 1, target", function (tc) {
        var o = new TE();
        var f1Called = 0;
        var f2Called = 0;
        var evFoo = { type: "foo", x: 1 };

        function f1(ev) {
            f1Called++;
            tc.areEqual(ev, evFoo, "validate f1 callback args");
        }

        function f2(ev) {
            f2Called++;
            tc.areEqual(ev, evFoo, "validate f2 callback args");
        }

        // add 2 handlers and dispatch
        o.addEventListener("foo", f1);
        o.addEventListener("foo", f2);
        o.dispatchEvent(evFoo);

        tc.areEqual(f1Called, 1);
        tc.areEqual(f2Called, 1);

        // remove one handler and dispatch
        o.removeEventListener("foo", f1);
        o.dispatchEvent(evFoo);

        tc.areEqual(f1Called, 1);
        tc.areEqual(f2Called, 2);

        // remove the second handler and dispatch
        o.removeEventListener("foo", f2);
        o.dispatchEvent(evFoo);

        tc.areEqual(f1Called, 1);
        tc.areEqual(f2Called, 2);

        o.dispose();
    });

    Tx.test("Tx.TreeEvents: 2 events, 1 handler, depth 1, target", function (tc) {
        var o = new TE();
        var f1FooCalled = 0;
        var f1BarCalled = 0;
        var evFoo = { type: "foo", x: 1 };
        var evBar = { type: "bar", y: 2 };

        function f1(ev) {
            if (ev.type === "foo") {
                tc.areEqual(ev, evFoo, "invalid foo event arg");
                f1FooCalled++;
            } else if (ev.type === "bar") {
                tc.areEqual(ev, evBar, "invalid bar event arg");
                f1BarCalled++;
            }
        }

        // add handlers and dispatch
        o.addEventListener("foo", f1);
        o.addEventListener("bar", f1);

        o.dispatchEvent(evFoo);
        tc.areEqual(f1FooCalled, 1);

        o.dispatchEvent(evBar);
        tc.areEqual(f1BarCalled, 1);

        // remove foo handler and dispatch
        o.removeEventListener("foo", f1);
        o.dispatchEvent(evFoo);

        tc.areEqual(f1FooCalled, 1);
        tc.areEqual(f1BarCalled, 1);

        // remove bar handler and dispatch
        o.removeEventListener("bar", f1);
        o.dispatchEvent(evBar);

        tc.areEqual(f1FooCalled, 1);
        tc.areEqual(f1BarCalled, 1);

        o.dispose();
    });

    Tx.test("Tx.TreeEvents: 1 event, 1 handler, depth 2, capture/bubble", function (tc) {
        // build the tree
        var parent = new TE();
        var child = new TE();
        parent.appendChild(child);

        var f1CaptureCalled = 0;
        var f1BubbleCalled = 0;
        var evFoo = { type: "foo", phase: "?", x: 1 };

        function f1(ev) {
            if (ev.phase === "capture") {
                f1CaptureCalled++;
                tc.areEqual(ev, evFoo, "invalid capture event arg");
            } else if (ev.phase === "bubble") {
                f1BubbleCalled++;
                tc.areEqual(ev, evFoo, "invalid bubble event arg");
            } else {
                tc.error("invalid event arg phase");
            }
        }

        parent.addEventListener("foo", f1);
        child.dispatchEvent(evFoo);

        tc.areEqual(f1CaptureCalled, 1, "unexpected f1CaptureCalled (a)");
        tc.areEqual(f1BubbleCalled, 1, "unexpected f1BubbleCalled (b)");

        parent.removeEventListener("foo", f1);
        child.dispatchEvent(evFoo);

        tc.areEqual(f1CaptureCalled, 1, "unexpected f1CaptureCalled (a)");
        tc.areEqual(f1BubbleCalled, 1, "unexpected f1BubbleCalled (b)");

        parent.dispose();
    });

    // TODO: capture, target, bubble
    // TODO: nodes without handlers
    // TODO: cancel
    // TODO: reentrancy - remove handler during dispatch

    // TODO: add more tests
})();
