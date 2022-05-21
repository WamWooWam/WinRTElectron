
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// EventHook UTs

(function () {

    Tx.test("EventHook.testAddRemoveListener", function (tc) {
        var src = {
            addListener: function (ev, func, target) {
                this.ev = ev;
                this.func = func;
                this.target = target;
            },
            removeListener: function (ev, func, target) {
                this.ev = null;
                this.func = null;
                this.target = null;
            },
            addEventListener: function () {},
            removeEventListener: function () {},
            raise: function () { this.func.apply(this.target); }
        };

        var target = { called: 0 };
        var func = function () { this.called++; };

        // Verify the callback is setup correctly
        var hook = new Mail.EventHook(src, "ev", func, target);
        tc.areEqual(src.ev, "ev");
        tc.isTrue(Jx.isFunction(src.func));
        tc.ok(src.target);

        // Verify the target is called
        src.raise();
        tc.areEqual(target.called, 1);

        // Verify disposing tears down the listener
        hook.dispose();
        tc.areEqual(src.ev, null);
        tc.areEqual(src.func, null);
        tc.areEqual(src.target, null);
        tc.areEqual(target.called, 1);
    });

    Tx.test("EventHook.testAddRemoveEventListener", function (tc) {
        var src = {
            addEventListener: function (ev, func, capture) {
                this.ev = ev;
                this.func = func;
                this.capture = capture;
            },
            removeEventListener: function (ev, func, capture) {
                this.ev = null;
                this.func = null;
                this.capture = null;
            },
            raise: function () { this.func(); }
        };

        var target = { called: 0 };
        var func = function () { this.called++; };

        // Verify the callback is setup correctly with a re-bound function
        var hook = new Mail.EventHook(src, "ev", func, target);
        tc.areEqual(src.ev, "ev");
        tc.areNotEqual(src.func, func);
        tc.isTrue(Jx.isFunction(src.func));
        tc.areEqual(src.capture, false);

        // Verify the target is called
        src.raise();
        tc.areEqual(target.called, 1);

        // Verify disposing tears down the listener
        hook.dispose();
        tc.areEqual(src.ev, null);
        tc.areEqual(src.func, null);
        tc.areEqual(src.capture, null);
        tc.areEqual(target.called, 1);
    });

    Tx.test("EventHook.testJxEvents", function (tc) {
        var src = {}, results = {};
        Jx.mix(src, Jx.Events);
        Debug.Events.define(src, "ev");

        var target = { called: 0, fn: function () { this.called++; } };
        var hook = new Mail.EventHook(src, "ev", target.fn, target);

        // Verify the target hasn't been called yet
        tc.areEqual(target.called, 0);

        // Verify the target is called
        src.raiseEvent("ev", {}, results);
        tc.areEqual(target.called, 1);
        tc.areEqual(results.listeners, 1);

        // Verify the target is called again
        src.raiseEvent("ev", {}, results);
        tc.areEqual(target.called, 2);
        tc.areEqual(results.listeners, 1);

        // Verify the target is no longer called
        hook.dispose();
        src.raiseEvent("ev", {}, results);
        tc.areEqual(target.called, 2);
        tc.areEqual(results.listeners, 0);
    });

    Tx.test("EventHook.testDomEvents", function (tc) {
        var src = document.getElementById("sandbox");

        var target = { called: 0, fn: function () { this.called++;} };
        var hook = new Mail.EventHook(src, "ev", target.fn, target);

        // Verify the target hasn't been called yet
        tc.areEqual(target.called, 0);

        // Verify the target is called
        var ev = document.createEvent("Event");
        ev.initEvent("ev", true, true);
        src.dispatchEvent(ev);
        tc.areEqual(target.called, 1);

        // Verify the target is called again
        src.dispatchEvent(ev);
        tc.areEqual(target.called, 2);

        // Verify the target is no longer called
        hook.dispose();
        src.dispatchEvent(ev);
        tc.areEqual(target.called, 2);
    });

    Tx.test("EventHook.testRemoveDuringCallback", function (tc) {
        var src = document.getElementById("sandbox");

        var hook1, hook2,
            target1 = { called: 0, fn: function () { this.called++; hook2.dispose(); } },
            target2 = { called: 0, fn: function () { this.called++; } };

        hook1 = new Mail.EventHook(src, "ev", target1.fn, target1);
        hook2 = new Mail.EventHook(src, "ev", target2.fn, target2);

        // Verify the targets haven't been called
        tc.areEqual(target1.called, 0);
        tc.areEqual(target2.called, 0);

        // Verify only target1 is called because it disposes target2's hook in its handler
        var ev = document.createEvent("Event");
        ev.initEvent("ev", true, true);
        src.dispatchEvent(ev);
        tc.areEqual(target1.called, 1);
        tc.areEqual(target2.called, 0);

        // Verify the targets are no longer called
        hook1.dispose();
        src.dispatchEvent(ev);
        tc.areEqual(target1.called, 1);
        tc.areEqual(target2.called, 0);
    });

})();

