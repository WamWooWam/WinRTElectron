
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Events UTs

/// <reference path="../core/Events.js" />

/*global Debug,Jx,Tx*/

(function () {

    function getListeners(target, type) {
        Debug.assert(Jx.isObject(target));
        Debug.assert(Jx.isNonEmptyString(type));
        return (target._jxev && target._jxev[type]) ? target._jxev[type].listeners : [];
    }

    Tx.test("EventsTests.testEventsApi", function (tc) {
        tc.isTrue(Jx.Events.hasOwnProperty("addListener"));
        tc.isTrue(Jx.Events.hasOwnProperty("removeListener"));
        tc.isTrue(Jx.Events.hasOwnProperty("raiseEvent"));
    });

    // Verify that mixing in Jx.Events works as expected
    Tx.test("EventsTests.testMix", function (tc) {
        var A = function () { },
            a = new A();

        Jx.mix(a, Jx.Events);

        tc.isTrue(a.hasOwnProperty("addListener"));
        tc.isTrue(a.hasOwnProperty("removeListener"));
        tc.isTrue(a.hasOwnProperty("raiseEvent"));
        tc.isFalse(a.hasOwnProperty("_jxev"));
    });

    // Verify that augmenting an object with Jx.Events works as expected
    Tx.test("EventsTests.testAugment", function (tc) {
        var A, a;

        A = function () { };
        A.prototype.aFunction = function () { };
        Jx.augment(A, Jx.Events);
        a = new A();

        // Verify properties on the object itself
        tc.isFalse(a.hasOwnProperty("addListener"));
        tc.isFalse(a.hasOwnProperty("aFunction"));

        // Verify properties on the prototype
        tc.areNotEqual(a.addListener, undefined);
        tc.areNotEqual(a.aFunction, undefined);
    });

    // Verify that an object can inherit from Jx.Events
    Tx.test("EventsTests.testInherit", function (tc) {
        var a, A = function () { };

        Jx.inherit(A, Jx.Events);

        a = new A();

        // The object doesn't have the Jx.Events properties on the object itself
        tc.isFalse(a.hasOwnProperty("addListener"));
        tc.isFalse(a.hasOwnProperty("removeListener"));
        tc.isFalse(a.hasOwnProperty("raiseEvent"));

        // But the object has the Jx.Events properties on the prototype
        tc.areNotEqual(a.addListener, undefined);
        tc.areNotEqual(a.removeListener, undefined);
        tc.areNotEqual(a.raiseEvent, undefined);
    });

    // Fire event when there are no listeners
    Tx.test("EventsTests.testFireNoListeners", function (/*tc*/) {
        var obj = {};

        Jx.mix(obj, Jx.Events);

        // Nothing to test just verify that it doesn't throw
        Debug.Events.define(obj, "ev1");
        obj.raiseEvent("ev1");

        // Verify fluent style
        obj.raiseEvent("ev1").raiseEvent("ev1");
    });

    // Fire one event when there is one listener
    Tx.test("EventsTests.testOneEventOneListener", function (tc) {
        var obj = {}, f1Called = 0, results = {};

        Jx.mix(obj, Jx.Events);

        Debug.Events.define(obj, "evf1");

        function f1() {
            ++f1Called;
        }

        // Verify f1 is called
        obj.addListener("evf1", f1).raiseEvent("evf1", null, results);
        tc.areEqual(f1Called, 1);
        tc.areEqual(results.listeners, 1);

        f1Called = 0;

        // Remove listener and verify that f1 is not called
        obj.removeListener("evf1", f1).raiseEvent("evf1", null, results);
        tc.areEqual(f1Called, 0);
        tc.areEqual(results.listeners, 0);

        tc.areEqual(getListeners(obj, "evf1").length, 0);
    });

    // Fire one event when there are two listeners
    Tx.test("EventsTests.testOneEventOneListenerTwice", function (tc) {
        var obj = {}, f1Called = 0, results = {};

        Jx.mix(obj, Jx.Events);

        Debug.Events.define(obj, "evf1");

        function f1() {
            ++f1Called;
        }

        // Verify f1 is called twice
        obj.addListener("evf1", f1).addListener("evf1", f1);
        obj.raiseEvent("evf1", null, results);
        tc.areEqual(f1Called, 2);
        tc.areEqual(results.listeners, 2);

        f1Called = 0;

        // Remove listeners and verify that f1 is not called
        obj.removeListener("evf1", f1).removeListener("evf1", f1);
        obj.raiseEvent("evf1", null, results);
        tc.areEqual(f1Called, 0);
        tc.areEqual(results.listeners, 0);

        tc.areEqual(getListeners(obj, "evf1").length, 0);
    });

    // Verify that fire event arguments are passed correctly to listeners
    Tx.test("EventsTests.testArgs", function (tc) {
        var obj = {}, f1Called = 0, f2Called = 0, results = {};

        Jx.mix(obj, Jx.Events);

        Debug.Events.define(obj, "evf1", "evf2");

        function f1(ev) {
            ++f1Called;
            tc.areEqual(ev.x, 555);
        }

        // Verify f1 is called
        obj.addListener("evf1", f1);
        obj.raiseEvent("evf1", { x: 555 }, results);
        tc.areEqual(f1Called, 1);
        tc.areEqual(results.listeners, 1);

        function f2(ev) {
            ++f2Called;
            tc.areEqual(ev, undefined);
        }

        // Verify f1 is called
        obj.addListener("evf2", f2);
        obj.raiseEvent("evf2");
        tc.areEqual(f2Called, 1);
    });

    // Fire two events when there is one listener
    Tx.test("EventsTests.testTwoEventsOneListener", function (tc) {
        var obj = {}, f1Called = 0, f2Called = 0;

        Jx.mix(obj, Jx.Events);

        Debug.Events.define(obj, "evf1", "evf2");

        function f1() {
            ++f1Called;
        }

        function f2() {
            ++f2Called;
        }

        // Verify f1 and f2 are called
        obj.addListener("evf1", f1).addListener("evf2", f2);

        obj.raiseEvent("evf1");
        tc.areEqual(f1Called, 1);

        obj.raiseEvent("evf2");
        tc.areEqual(f2Called, 1);

        f1Called = f2Called = 0;

        // Remove the listener for evf2 and verify that it's not called
        obj.removeListener("evf2", f2);
        obj.raiseEvent("evf2");
        tc.areEqual(f2Called, 0);

        tc.areEqual(getListeners(obj, "evf2").length, 0);

        // Remove the listener for evf1 and verify that it's not called
        obj.removeListener("evf1", f1);
        obj.raiseEvent("evf1");
        tc.areEqual(f1Called, 0);

        tc.areEqual(getListeners(obj, "evf1").length, 0);
    });

    // Fire one event when there is one listener registered twice
    Tx.test("EventsTests.testOneEventOneListenerTwice", function (tc) {
        var obj = {}, f1Called = 0;

        Jx.mix(obj, Jx.Events);

        Debug.Events.define(obj, "evf1");

        function f1() {
            ++f1Called;
        }

        // Verify f1 is called 2 times
        obj.addListener("evf1", f1);
        obj.addListener("evf1", f1);

        obj.raiseEvent("evf1");
        tc.areEqual(f1Called, 2);

        // Remove one listener for evf1 and verify that it's called once
        f1Called = 0;
        obj.removeListener("evf1", f1);
        obj.raiseEvent("evf1");
        tc.areEqual(f1Called, 1);

        // Remove the second listener for evf1 and verify that it's not called
        f1Called = 0;
        obj.removeListener("evf1", f1);
        obj.raiseEvent("evf1");
        tc.areEqual(f1Called, 0);

        tc.areEqual(getListeners(obj, "evf1").length, 0);
    });

    // From a listener remove the next listener 
    Tx.test("EventsTests.testReentrancy1", function (tc) {
        var obj = {}, f1Called = 0, f2Called = 0;

        Jx.mix(obj, Jx.Events);

        Debug.Events.define(obj, "ev");

        function f2() {
            ++f2Called;
        }

        function f1() {
            ++f1Called;
            obj.removeListener("ev", f2);
            
            // Reentrancy - the listener is not removed yet
            tc.areEqual(getListeners(obj, "ev").length, 2); 
        }

        obj.addListener("ev", f1);
        obj.addListener("ev", f2);

        // Verify f1 is called and f2 is not called
        obj.raiseEvent("ev");
        tc.areEqual(f1Called, 1);
        tc.areEqual(f2Called, 0);

        tc.areEqual(getListeners(obj, "ev").length, 1);

        obj.removeListener("ev", f1);
        tc.areEqual(getListeners(obj, "ev").length, 0);
    });

    // From a listener, remove itself and ensure that the subsequent listeners are invoked 
    Tx.test("EventsTests.testReentrancy2", function (tc) {
        var obj = {}, f1Called = 0, f2Called = 0;

        Jx.mix(obj, Jx.Events);

        Debug.Events.define(obj, "ev");

        function f1() {
            ++f1Called;
            obj.removeListener("ev", f1);

            // Reentrancy - the listener is not removed yet
            tc.areEqual(getListeners(obj, "ev").length, 2);
        }

        function f2() {
            ++f2Called;
        }

        obj.addListener("ev", f1);
        obj.addListener("ev", f2);

        // Verify f1 and f2 are called
        obj.raiseEvent("ev");
        tc.areEqual(f1Called, 1);
        tc.areEqual(f2Called, 1);

        tc.areEqual(getListeners(obj, "ev").length, 1);

        obj.removeListener("ev", f2);
        tc.areEqual(getListeners(obj, "ev").length, 0);
    });

    // Test event propagation when a listener throws an exception
    Tx.test("EventsTests.testListenerException", function (tc) {
        var obj = {}, f1Called = 0, f2Called = 0, oops = false;

        Jx.mix(obj, Jx.Events);

        Debug.Events.define(obj, "evf1");

        function f1() {
            ++f1Called;
            throw "oops";
        }

        function f2() {
            ++f2Called;
        }

        // Register listeners
        obj.addListener("evf1", f1);
        obj.addListener("evf1", f2);

        try {
            // Raise the event, Jx.Events doesn't catch exceptions
            obj.raiseEvent("evf1");
        } catch (e) {
            tc.areEqual(e, "oops", "Invalid exception");
            oops = true;
        }

        tc.isTrue(oops, "Exception not caught");

        // Ensure only the first listener is invoked
        tc.areEqual(f1Called, 1, "f1 - incorrect number of calls");
        tc.areEqual(f2Called, 0, "f2 - incorrect number of calls");

        Jx.disposeEvents(obj);
    });



    // Verify debug event utilities
    Tx.test("EventsTests.testDebug", function (tc) {
        var obj = {};

        Jx.mix(obj, Jx.Events);

        // Verify non-existing event
        tc.isFalse(Debug.Events.isDefined(obj, "invalid"));

        // Define and verify one event
        Debug.Events.define(obj, "ev1");
        tc.isTrue(Debug.Events.isDefined(obj, "ev1"));

        // Define and verify two events
        Debug.Events.define(obj, "ev2", "ev3");
        tc.isTrue(Debug.Events.isDefined(obj, "ev2"));
        tc.isTrue(Debug.Events.isDefined(obj, "ev3"));
    });



    // Verify Jx.addListener, Jx.removeListener, Jx.raiseEvent
    Tx.test("EventsTests.testJxEvents", function (tc) {
        var obj = {}, f1Called = 0;

        Debug.Events.define(obj, "evf1");

        function f1() {
            ++f1Called;
        }

        // Verify f1 is called
        tc.areEqual(Jx.addListener(obj, "evf1", f1), obj, "Jx.addListener invalid return");
        tc.areEqual(Jx.raiseEvent(obj, "evf1"), obj, "Jx.raiseEvent 1 invalid return");
        tc.areEqual(f1Called, 1, "f1Called invalid");

        f1Called = 0;

        // Remove listener and verify that f1 is not called
        tc.areEqual(Jx.removeListener(obj, "evf1", f1), obj, "Jx.removeListener invalid return");
        tc.areEqual(Jx.raiseEvent(obj, "evf1"), obj, "Jx.raiseEvent 2 invalid return");
        tc.areEqual(f1Called, 0, "f1Called invalid");
    });

    Tx.test("EventsTests.testDisposeEventsMix", function (tc) {
        var obj = {};

        Jx.mix(obj, Jx.Events);

        Debug.Events.define(obj, "evf1");

        obj.addListener("evf1", function () {});
        obj.disposeEvents();

        tc.areEqual(obj._jxev, null, "_jxev != null");

        tc.areEqual(obj._jxevdbg, null, "_jxevdbg != null");

    });

    Tx.test("EventsTests.testDisposeEventsJx", function (tc) {
        var obj = {};

        Debug.Events.define(obj, "evf1");

        Jx.addListener(obj, "evf1", function () {});
    
        Jx.disposeEvents(obj);

        tc.areEqual(obj._jxev, null, "_jxev != null");

        tc.areEqual(obj._jxevdbg, null, "_jxevdbg != null");

    });

    Tx.test("EventsTests.testInitEventsMix", function (tc) {
        var obj = {}, f1Called = 0;
        Jx.mix(obj, Jx.Events);
        Debug.Events.define(obj, "evf1");

        // Call initEvents, and then prevent any further manipulation of the object to confirm that initEvents has
        // prepared it adquately.
        obj.initEvents();
        Object.seal(obj); 

        function f1() {
            ++f1Called;
        }

        // Verify f1 is called
        obj.addListener("evf1", f1).raiseEvent("evf1");
        tc.areEqual(f1Called, 1);

        f1Called = 0;

        // Remove listener and verify that f1 is not called
        obj.removeListener("evf1", f1).raiseEvent("evf1");
        tc.areEqual(f1Called, 0);

        obj.disposeEvents();
    });

    Tx.test("EventsTests.testInitEventsJx", function (tc) {
        var obj = {}, f1Called = 0;
        Debug.Events.define(obj, "evf1");

        // Call initEvents, and then prevent any further manipulation of the object to confirm that initEvents has
        // prepared it adquately.
        Jx.initEvents(obj);
        Object.seal(obj); 

        function f1() {
            ++f1Called;
        }

        // Verify f1 is called
        Jx.addListener(obj, "evf1", f1);
        Jx.raiseEvent(obj, "evf1");
        tc.areEqual(f1Called, 1);

        f1Called = 0;

        // Remove listener and verify that f1 is not called
        Jx.removeListener(obj, "evf1", f1);
        Jx.raiseEvent(obj, "evf1");
        tc.areEqual(f1Called, 0);

        Jx.disposeEvents(obj);
    });

    Tx.test("EventsTests.testHasListener", function (tc) {
        var obj = {};
        Jx.mix(obj, Jx.Events);
        Debug.Events.define(obj, "ev");

        function fn() {
            tc.isTrue(obj.hasListener("ev"));
            obj.removeListener("ev", fn);
            tc.isFalse(obj.hasListener("ev"));
        }

        tc.isFalse(obj.hasListener("ev"));
        obj.addListener("ev", fn);
        tc.isTrue(obj.hasListener("ev"));

        obj.removeListener("ev", fn);
        tc.isFalse(obj.hasListener("ev"));

        obj.addListener("ev", fn);
        tc.isTrue(obj.hasListener("ev"));

        obj.raiseEvent("ev"); // Reentrantly remove the listener
        tc.isFalse(obj.hasListener("ev"));
    });
    
    Tx.test("EventsTests.testHasListenerJx", function (tc) {
        var obj = {};
        Debug.Events.define(obj, "ev");

        tc.isFalse(Jx.hasListener(obj, "ev"));

        Jx.addListener(obj, "ev", Jx.fnEmpty);
        tc.isTrue(Jx.hasListener(obj, "ev"));

        Jx.removeListener(obj, "ev", Jx.fnEmpty);
        tc.isFalse(Jx.hasListener(obj, "ev"));
    });
})();
