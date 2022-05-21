
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Attr UTs

/// <reference path="../core/Attr.js" />

/*global Tx,Jx*/

(function() {
    // Define a simple test constructor
    var TestAttr = function (tc) {
        tc.ok(this instanceof TestAttr);
        this.initAttr();
    };

    Jx.augment(TestAttr, Jx.Attr);
      
    TestAttr.prototype.shutdown = function () {
        this.shutdownAttr();
    };

    function len(o) {
        return Object.keys(o).length;
    }

    // Tests

    Tx.test("AttrTests.testSetter", function (tc) {
        var x = new TestAttr(tc);

        // Verify non-existing attribute
        tc.ok(x.getAttr("a") === undefined);
        tc.ok(x.getAttr("b") === undefined);
        tc.ok(x.getAttr("c") === undefined);
        
        // Verify setter - simple function
        function setSimple(value, name) {
            tc.ok(name === "a");
            tc.ok(this === x);
            return value + 10000;
        }

        x.attr("a", { value: 77, set: setSimple });
        tc.ok(x.getAttr("a") === 10077);
        tc.ok(x.setAttr("a", 222));
        tc.ok(x.getAttr("a") === 10222);

        // Verify setter - object method
        x.setObj = function (value, name) {
            tc.ok(name === "b");
            tc.ok(this === x);
            return value * 10;
        };

        x.attr("b", { value: 44, set: x.setObj });
        tc.ok(x.getAttr("b") === 440);
        tc.ok(x.setAttr("b", 11));
        tc.ok(x.getAttr("b") === 110);
        
        // Verify setter returning invalid value
        x.setInvalid = function (value, name) {
            tc.ok(name === "c");
            tc.ok(this === x);
            return Jx.ATTR_INVALID_VALUE;
        };

        x.attr("c", { value: 4, set: x.setInvalid });
        tc.ok(x.getAttr("c") === 4);
        tc.ok(!x.setAttr("c", 0)); // invalid
        tc.ok(x.getAttr("c") === 4);
        
        x.shutdown();
    });
    
    Tx.test("AttrTests.testValidator", function (tc) {
        var x = new TestAttr(tc);

        // Verify non-existing attribute
        tc.ok(x.getAttr("a") === undefined);
        tc.ok(x.getAttr("b") === undefined);
        
        // Verify validator - simple function
        function validSimple(value, name) {
            tc.ok(name === "a");
            tc.ok(this === x);
            return value < 0; // positive values are invalid
        }

        x.attr("a", { value: -1, valid: validSimple });
        tc.ok(x.getAttr("a") === -1);
        tc.ok(!x.setAttr("a", 12)); // invalid value
        tc.ok(x.getAttr("a") === -1);
        tc.ok(x.setAttr("a", -100)); // valid value
        tc.ok(x.getAttr("a") === -100);

         // Verify validator - object method
        x.validObj = function (value, name) {
            tc.ok(name === "b");
            tc.ok(this === x);
            return value >= 0; // negative values are invalid
        };

        x.attr("b", { value: 2, valid: x.validObj });
        tc.ok(x.getAttr("b") === 2);
        tc.ok(!x.setAttr("b", -5)); // invalid value
        tc.ok(x.getAttr("b") === 2);
        tc.ok(x.setAttr("b", 8)); // valid value
        tc.ok(x.getAttr("b") === 8);

        x.shutdown();
    });
    
    Tx.test("AttrTests.test1", function (tc) {         
        var x = new TestAttr(tc);

        // verify non-existing attribute
        tc.ok(x.getAttr("a") === undefined);

        // verify simple values
        x.attr("a", { value: 88 });
        tc.ok(x.getAttr("a") === 88);

        tc.ok(x.setAttr("a", 99));
        tc.ok(x.getAttr("a") === 99);

        // verify getter
        x.getB = function (name) {
            tc.ok(name === "b");
            tc.ok(this === x);
            return 22;
        };

        x.attr("b", { value: 55, get: x.getB });
        tc.ok(x.getAttr("b") === 22);

        // verify setter - simple function
        function setW(value, name) {
            tc.ok(name === "c");
            tc.ok(this === x);
            return value + 10000;
        }

        x.attr("c", { value: 77, set: setW });
        tc.ok(x.getAttr("c") === 10077);
        tc.ok(x.setAttr("c", 222));
        tc.ok(x.getAttr("c") === 10222);

        // verify setter - object method
        x.setD = function (value, name) {
            tc.ok(name === "d");
            tc.ok(this === x);
            return value * 10;
        };

        x.attr("d", { value: 44, set: x.setD });
        tc.ok(x.getAttr("d") === 440);
        tc.ok(x.setAttr("d", 11));
        tc.ok(x.getAttr("d") === 110);

        // verify validator - object method
        x.validE = function (value, name) {
            tc.ok(name === "e");
            tc.ok(this === x);
            return value >= 0; // negative values are invalid
        };

        x.attr("e", { value: 2, valid: x.validE });
        tc.ok(x.getAttr("e") === 2);
        tc.ok(!x.setAttr("e", -5)); // invalid value
        tc.ok(x.getAttr("e") === 2);
        tc.ok(x.setAttr("e", 8)); // valid value
        tc.ok(x.getAttr("e") === 8);

        // verify setter returning invalid value
        x.setF = function (value, name) {
            tc.ok(name === "f");
            tc.ok(this === x);
            return Jx.ATTR_INVALID_VALUE;
        };

        x.attr("f", { value: 4, set: x.setF });
        tc.ok(x.getAttr("f") === 4);
        tc.ok(!x.setAttr("f", 0)); // invalid
        tc.ok(x.getAttr("f") === 4);

        // verify property change event
        x.attr("g", { value: 1 });

        var gChanged = "g" + Jx.ATTR_EVENT_CHANGED;
        
        Jx.EventManager.addListener(x, gChanged, function (e) {
            tc.ok(e.source === x);
            tc.ok(e.type === gChanged);
            tc.ok(!e.routes);
            tc.ok(!e.bubbles);
            tc.ok(e.stage === Jx.EventManager.Stages.direct);
            tc.ok(!e.handled);
            tc.ok(!e.cancel);
            tc.ok(e.data.name === "g");
            tc.ok(e.data.oldValue === 1);
            tc.ok(e.data.newValue === 2);
        });

        tc.ok(x.getAttr("g") === 1);
        tc.ok(x.setAttr("g", 2)); // fires property changed

        // verify undefined desc
        x.attr("h");
        tc.ok(x.isAttr("h"));
        tc.ok(x.getAttr("h") === undefined);

        tc.ok(x.setAttr("h", 99));
        tc.ok(x.getAttr("h") === 99);

        // verify null desc
        x.attr("i", null);
        tc.ok(x.isAttr("i"));
        tc.ok(x.getAttr("i") === undefined);

        tc.ok(x.setAttr("i", 99));
        tc.ok(x.getAttr("i") === 99);

        // verify empty desc
        x.attr("j", {}); // force an attr fixup

        // verify falsely value
        x.attr("k", { value: "" });
        tc.ok(x.isAttr("k"));
        tc.ok(x.getAttr("k") === "");

        tc.ok(x.setAttr("k", "hello"));
        tc.ok(x.getAttr("k") === "hello");

        // done
        x.shutdown();
    });
    
    // Verify that setting the same value will not call the setter, the validator and 
    // it won't fire attribute changed events.
    Tx.test("AttrTests.testNoChangeSet", function (tc) { 
        var a = new TestAttr(tc);

        var setterCalled = 0;
        function set_x(value) {
            setterCalled++;
            return value;
        }

        var validCalled = 0;
        function valid_x() {
            validCalled++;
            return true;
        }

        var changedCalled = 0;
        function changed_x() {
            changedCalled++;
        }

        var onChangedCalled = 0;
        function on_xChanged() {
            onChangedCalled++;
        }

        a.attr("x", { value: 7, set: set_x, valid: valid_x, changed: changed_x });

        tc.ok(setterCalled === 1);
        tc.ok(validCalled === 1);
        tc.ok(changedCalled === 1);

        Jx.EventManager.addListener(a, "x" + Jx.ATTR_EVENT_CHANGED, on_xChanged);

        tc.ok(a.setAttr("x", 7));

        tc.ok(setterCalled === 1);
        tc.ok(validCalled === 1);
        tc.ok(changedCalled === 1);
        tc.ok(onChangedCalled === 0);

        a.shutdown();
    });
    
    Tx.test("AttrTests.testSelfBind", function (tc) { 
        var a = new TestAttr(tc);

        a.attr("x", { value: 1 });

        // Bind to itself 1 way
        a.bindAttr("x", a, "x");

        // Verify that there are no bindings
        tc.ok(a._attr.get("x", Jx.ATTR_BIND_DEST) === undefined);
        tc.ok(a._attr.get("x", Jx.ATTR_BIND_SRC) === undefined);

        // Bind to itself 2 way
        a.bindAttr2Way("x", a, "x");

        // Verify that there are no bindings
        tc.ok(a._attr.get("x", Jx.ATTR_BIND_DEST) === undefined);
        tc.ok(a._attr.get("x", Jx.ATTR_BIND_SRC) === undefined);

        a.shutdown();
    });
    
    Tx.test("AttrTests.testBindOneWay", function (tc) { 
        var T = TestAttr;

        var a = new T(tc);
        var b = new T(tc);

        a.attr("a", { value: 1 });
        b.attr("b", { value: 2 });

        // Verify value before bind
        tc.ok(b.getAttr("b") === 2);

        // Bind
        a.bindAttr("a", b, "b");

        // B should be updated after the bind call
        tc.ok(b.getAttr("b") === 1);

        // Changing A should change B
        tc.ok(a.setAttr("a", 8));
        tc.ok(b.getAttr("b") === 8);

        // Changing B should not change A
        tc.ok(b.setAttr("b", 5));
        tc.ok(a.getAttr("a") === 8);

        a.shutdown();
        b.shutdown();
    });
    
    Tx.test("AttrTests.testBindTwoWays", function (tc) { 
        var T = TestAttr;

        var a = new T(tc);
        var b = new T(tc);

        a.attr("a", { value: 1 });
        b.attr("b", { value: 2 });

        // Verify value before bind
        tc.ok(b.getAttr("b") === 2);

        // Bind
        a.bindAttr2Way("a", b, "b");

        // B should be updated after the bind call
        tc.ok(b.getAttr("b") === 1);

        // Changing A should change B
        tc.ok(a.setAttr("a", 3));
        tc.ok(b.getAttr("b") === 3);

        // Changing B should change A
        tc.ok(b.setAttr("b", 4));
        tc.ok(a.getAttr("a") === 4);

        a.shutdown();
        b.shutdown();
    });
    
    Tx.test("AttrTests.testBindDup", function (tc) {
        var T = TestAttr;

        var a = new T(tc);
        var b = new T(tc);

        a.attr("x", { value: 1 });
        b.attr("y", { value: 2 });

        // Bind 2 times
        a.bindAttr("x", b, "y");
        a.bindAttr("x", b, "y");

        // Verify that the dup bind is ignored
        tc.ok(a._attr.get("x", Jx.ATTR_BIND_DEST).length === 1);
        tc.ok(a._attr.get("x", Jx.ATTR_BIND_SRC) === undefined);
        tc.ok(b._attr.get("y", Jx.ATTR_BIND_DEST) === undefined);
        tc.ok(b._attr.get("y", Jx.ATTR_BIND_SRC).length === 1);

        a.shutdown();
        b.shutdown();
    });

    Tx.test("AttrTests.testUnBind1", function (tc) {
        var T = TestAttr;

        var a = new T(tc);
        var b = new T(tc);

        a.attr("x", { value: 1 });
        b.attr("y", { value: 2 });

        // Bind
        a.bindAttr("x", b, "y");

        // Unbind
        a.unbindAttr("x", b, "y");

        // Verify that there are no bindings
        tc.ok(a._attr.get("x", Jx.ATTR_BIND_DEST).length === 0);
        tc.ok(a._attr.get("x", Jx.ATTR_BIND_SRC) === undefined);
        tc.ok(b._attr.get("y", Jx.ATTR_BIND_DEST) === undefined);
        tc.ok(b._attr.get("y", Jx.ATTR_BIND_SRC).length === 0);

        a.shutdown();
        b.shutdown();
    });

    Tx.test("AttrTests.testUnBind2", function (tc) {
        var T = TestAttr;

        var a = new T(tc);
        var b = new T(tc);

        a.attr("x", { value: 1 });
        b.attr("y", { value: 2 });

        // Bind
        a.bindAttr2Way("x", b, "y");

        // Unbind
        a.unbindAttr2Way("x", b, "y");

        // Verify that there are no bindings
        tc.ok(a._attr.get("x", Jx.ATTR_BIND_DEST).length === 0);
        tc.ok(a._attr.get("x", Jx.ATTR_BIND_SRC).length === 0);
        tc.ok(b._attr.get("y", Jx.ATTR_BIND_DEST).length === 0);
        tc.ok(b._attr.get("y", Jx.ATTR_BIND_SRC).length === 0);

        a.shutdown();
        b.shutdown();
    });

    Tx.test("AttrTests.testGetAttrValues", function (tc) {
        var a = new TestAttr(tc);

        a.attr("x", { value: 1 });
        a.attr("y", { value: 2 });

        var values = a.getAttrValues();

        tc.ok(values.x === a.getAttr("x"));
        tc.ok(values.y === a.getAttr("y"));

        a.shutdown();
    });

    Tx.test("AttrTests.testResetAttr", function (tc) {
        var a = new TestAttr(tc);

       tc.ok(!a.isAttr("x"));

        a.resetAttr();
       tc.ok(!a.isAttr("x"));

        a.attr("x", { value: 1 });
        tc.ok(a.isAttr("x"));

        a.resetAttr();
       tc.ok(!a.isAttr("x"));

        a.shutdown();
    });

    Tx.test("AttrTests.testDef1", function (tc) {
        var x = new TestAttr(tc);

        // verify non-existing attribute
        tc.ok(x.getAttr("a") === undefined);

        // simple attr with no description
        x.attr("a");
        tc.ok(x.getAttr("a") === undefined);

        tc.ok(x.setAttr("a", 99));
        tc.ok(x.getAttr("a") === 99);

        // set default value
        x.attr("a", { value: 55 });
        tc.ok(x.getAttr("a") === 55);

        x.attr("a", { value: undefined });
        tc.ok(x.getAttr("a") === undefined);

        x.shutdown();
    });

    Tx.test("AttrTests.testDef2", function (tc) {
        var x = new TestAttr(tc);

        // verify non-existing attribute
        tc.ok(x.getAttr("a") === undefined);

        // simple attr with no description
        x.attr("a");
        tc.ok(x.getAttr("a") === undefined);

        tc.ok(x.setAttr("a", 99));
        tc.ok(x.getAttr("a") === 99);

        // set default value
        x.attr("a", { value: 55 });
        tc.ok(x.getAttr("a") === 55);

        x.attr("a", { value: undefined });
        tc.ok(x.getAttr("a") === undefined);

        x.shutdown();
    });

    Tx.test("AttrTests.testIsAttrObject", function (tc) {
        var a = new TestAttr(tc);

        // Verify valid Attr object
        tc.ok(Jx.isAttrObject(Jx.Attr.prototype));
        tc.ok(Jx.isAttrObject(a));

        // Verify Attr look-alike
        tc.ok(Jx.isAttrObject({attr:1}));

        // Verify invalid Attr object
        tc.ok(!Jx.isAttrObject(Jx.Attr));
        tc.ok(!Jx.isAttrObject(undefined));
        tc.ok(!Jx.isAttrObject(null));
        tc.ok(!Jx.isAttrObject({}));

        a.shutdown();
    });

    Tx.test("AttrTests.testSetAttrs", function (tc) {
        var a = new TestAttr(tc);
        var data = a._attr._data;

        // Verify setting empty items
        tc.areEqual(len(data), 0);
        a.setAttrs({});
        tc.areEqual(len(data), 0);

        // Verify setting one item
        tc.areEqual(len(data), 0);
        a.setAttrs({x:55});
        tc.areEqual(len(data), 1);
        tc.ok(a.isAttr("x"));
        tc.areEqual(a.getAttr("x"), 55);

        // Verify setting more item
        a.setAttrs({y:66, z:77});
        tc.areEqual(len(data), 3);
        tc.ok(a.isAttr("y"));
        tc.areEqual(a.getAttr("y"), 66);
        tc.ok(a.isAttr("z"));
        tc.areEqual(a.getAttr("z"), 77);

        a.shutdown();
    });

    // TODO: WI 322272
    // Test change handler
    // Test fixup attr
})();