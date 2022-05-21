
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx*/

Tx.test("Tx.Model: mixin literal", function (tc) {
    var o = Tx.mix({}, Tx.Model.mixin);
    o.initModel({bar:0});
    o.set("bar", 5);
    tc.areEqual(o.get("bar"), 5);
    o.disposeModel();
});

Tx.test("Tx.Model: mixin constructor events", function (tc) {
    function Foo(data) {
        this.initModel(data);
    }

    Foo.prototype = {
        dispose: function () {
            this.disposeModel();
        }
    };
    
    Tx.mix(Foo.prototype, Tx.Model.mixin);

    var foo = new Foo({a:0});
    
    var changeHandlerCalled = 0;

    var callbacks = new Tx.Callbacks().ael(foo, "change:a", function (ev) {
        changeHandlerCalled++;
        tc.areEqual(ev.type, "change:a");
        });

    foo.set("a", 111);
    tc.areEqual(foo.get("a"), 111);
    tc.areEqual(changeHandlerCalled, 1);

    foo.set("a", 111);
    tc.areEqual(foo.get("a"), 111);
    tc.areEqual(changeHandlerCalled, 1);

    foo.set("a", 222);
    tc.areEqual(foo.get("a"), 222);
    tc.areEqual(changeHandlerCalled, 2);
    
    foo.set("a", 333, true); // quiet, no handler called
    tc.areEqual(foo.get("a"), 333);
    tc.areEqual(changeHandlerCalled, 2);

    callbacks.dispose();
    foo.dispose();
});

Tx.test("Tx.Model: strict", function (tc) {
    // strict is true by default
    var m = new Tx.Model({a:5});
    tc.areEqual(m.get("a"), 5);

    m.set("a", 8);
    tc.areEqual(m.get("a"), 8);
    
    // should assert on non-existing props
    tc.expectTxAssert(function () {
        m.set("x", 88);
    });

    m.dispose();

    m = new Tx.Model({a:5, strict:true});
    tc.areEqual(m.get("a"), 5);

    m.set("a", 8);
    tc.areEqual(m.get("a"), 8);
    
    // should assert on non-existing props
    tc.expectTxAssert(function () {
        m.set("x", 88);
    });

    m.dispose();
});

Tx.test("Tx.Model: not strict", function (tc) {
    var m = new Tx.Model({a:5, strict:false});
    
    // should not assert on non-existing props
    tc.areEqual(m.get("a"), 5);

    m.set("a", 8);
    tc.areEqual(m.get("a"), 8);

    m.dispose();
});


// TODO: add more tests
