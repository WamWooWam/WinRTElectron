
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Disposer UTs

/*jshint browser:true*/
/*global Mail,Jx,Tx*/

(function () {

    Tx.test("Disposer.testApi", function (tc) {
        var disposer = new Mail.Disposer();
        tc.isTrue(Tx.isFunction(disposer.dispose));
        tc.isTrue(Tx.isFunction(disposer.addMany));
        tc.isTrue(Tx.isFunction(disposer.disposeNow));
        tc.isTrue(Tx.isFunction(disposer.removeDisposable));
        disposer.dispose();
    });

    // Verify that augmenting in Mail.Disposer works as expected
    Tx.test("Disposer.testAugment", function (tc) {
        var A, a;

        A = function () { };
        A.prototype.foo = function () { };
        Jx.augment(A, Mail.Disposer);
        a = new A();

        // Verify properties on the object itself
        tc.isFalse(a.hasOwnProperty("dispose"));
        tc.isFalse(a.hasOwnProperty("foo"));

        // Verify properties on the prototype
        tc.isTrue(Tx.isFunction(a.dispose));
        tc.isTrue(Tx.isFunction(a.foo));

        a.dispose();
    });

    Tx.test("Disposer.testDisposeItem", function (tc) {
        var A, a, obj;

        obj = { called: 0, dispose: function () { this.called++; } };
        A = function () { this.addMany(obj); };
        Jx.augment(A, Mail.Disposer);
        a = new A();

        // Verify the object hasn't been disposed yet
        tc.areEqual(obj.called, 0);

        // Verify the object gets disposed when a is disposed
        a.dispose();
        tc.areEqual(obj.called, 1);

        // Verify the object doesn't get disposed again
        a.dispose();
        tc.areEqual(obj.called, 1);
    });

    Tx.test("Disposer.testDisposeArray", function (tc) {
        var A, a, obj1, obj2, arr;

        obj1 = { called: 0, dispose: function () { this.called++; } };
        obj2 = { called: 0, dispose: function () { this.called++; } };
        arr = [obj1, obj2];
        A = function () { this.addMany(arr); };
        Jx.augment(A, Mail.Disposer);
        a = new A();

        // Verify the objects haven't been disposed
        tc.areEqual(obj1.called, 0);
        tc.areEqual(obj2.called, 0);

        // Remove obj1 from the array and verify only obj2 is disposed
        arr.splice(0, 1);
        a.dispose();
        tc.areEqual(obj1.called, 0);
        tc.areEqual(obj2.called, 1);

        // Add back obj1, verify neither get disposed again
        arr.splice(0, 0, obj1);
        a.dispose();
        tc.areEqual(obj1.called, 0);
        tc.areEqual(obj2.called, 1);
    });

    Tx.test("Disposer.testDisposeMultiple", function (tc) {
        var A, a, obj1, obj2;

        obj1 = { called: 0, dispose: function () { this.called++; } };
        obj2 = { called: 0, dispose: function () { this.called++; } };
        A = function () { this.addMany([obj1], obj2); };
        Jx.augment(A, Mail.Disposer);
        a = new A();

        // Verify the objects haven't been disposed
        tc.areEqual(obj1.called, 0);
        tc.areEqual(obj2.called, 0);

        // Verify both get disposed
        a.dispose();
        tc.areEqual(obj1.called, 1);
        tc.areEqual(obj2.called, 1);

        // Verify neither get disposed again
        a.dispose();
        tc.areEqual(obj1.called, 1);
        tc.areEqual(obj2.called, 1);
    });

    Tx.test("Disposer.testDisposeNowItem", function (tc) {
        var d, obj;

        obj = { called: 0, dispose: function () { this.called++; } };
        d = new Mail.Disposer(obj);

        // Verify the object hasn't been disposed yet
        tc.areEqual(obj.called, 0);

        // Verify the object gets disposed early
        d.disposeNow(obj);
        tc.areEqual(obj.called, 1);

        // Verify the object doesn't get disposed again
        d.dispose();
        tc.areEqual(obj.called, 1);
    });

    Tx.test("Disposer.testDisposeNowArray", function (tc) {
        var d, obj1, obj2, arr;

        obj1 = { called: 0, dispose: function () { this.called++; } };
        obj2 = { called: 0, dispose: function () { this.called++; } };
        arr = [obj1, obj2];
        d = new Mail.Disposer(arr);

        // Verify the objects haven't been disposed
        tc.areEqual(obj1.called, 0);
        tc.areEqual(obj2.called, 0);

        // Remove obj1 from the array and verify only obj2 is disposed
        arr.splice(0, 1);
        d.disposeNow(arr);
        tc.areEqual(obj1.called, 0);
        tc.areEqual(obj2.called, 1);

        // Add back obj1, verify neither get disposed again
        arr.splice(0, 0, obj1);
        d.dispose();
        tc.areEqual(obj1.called, 0);
        tc.areEqual(obj2.called, 1);
    });

    Tx.test("Disposer.testRemoveItem", function (tc) {
        var A, a, obj;

        obj = { called: 0, dispose: function () { this.called++; } };
        A = function () { this.addMany(obj); };
        A.prototype.remove = function () { this.removeDisposable(obj); };
        Jx.augment(A, Mail.Disposer);
        a = new A();

        // Verify the object hasn't been disposed yet
        tc.areEqual(obj.called, 0);

        // Verify the object gets removed but not disposed
        a.remove();
        tc.areEqual(obj.called, 0);

        // Verify the object still doesn't get disposed
        a.dispose();
        tc.areEqual(obj.called, 0);
    });

    Tx.test("Disposer.testRemoveArray", function (tc) {
        var A, a, obj1, obj2, arr;

        obj1 = { called: 0, dispose: function () { this.called++; } };
        obj2 = { called: 0, dispose: function () { this.called++; } };
        arr = [obj1, obj2];
        A = function () { this.addMany(arr); };
        A.prototype.remove = function () { this.removeDisposable(arr); };
        Jx.augment(A, Mail.Disposer);
        a = new A();

        // Verify the objects haven't been disposed
        tc.areEqual(obj1.called, 0);
        tc.areEqual(obj2.called, 0);

        // Verify the array is removed but not disposed
        a.remove();
        tc.areEqual(obj1.called, 0);
        tc.areEqual(obj2.called, 0);

        a.dispose();
        tc.areEqual(obj1.called, 0);
        tc.areEqual(obj2.called, 0);
    });

    Tx.test("Disposer.testReentrancyItem", function (tc) {
        var A, a, obj;

        obj = { called: 0, dispose: function () { this.called++; a.recurse(); } };
        A = function () { this.called = 0; this.addMany(obj); };
        A.prototype.recurse = function () { this.called++; this.dispose(); };
        Jx.augment(A, Mail.Disposer);
        a = new A();

        // Verify the object hasn't been disposed yet
        tc.areEqual(obj.called, 0);

        // Verify the object gets disposed only once even though we re-entrantly call dispose
        a.dispose();
        tc.areEqual(obj.called, 1);
        tc.areEqual(a.called, 1);

        // Verify the object doesn't get disposed again
        a.dispose();
        tc.areEqual(obj.called, 1);
        tc.areEqual(a.called, 1);
    });

    Tx.test("Disposer.testReentrancyArray", function (tc) {
        var A, a, obj1, obj2, arr;

        obj1 = { called: 0, dispose: function () { this.called++; a.recurse(); } };
        obj2 = { called: 0, dispose: function () { this.called++; a.recurse(); } };
        arr = [obj1, obj2];
        A = function () { this.called = 0; this.addMany(arr); };
        A.prototype.recurse = function () { this.called++; this.dispose(); };
        Jx.augment(A, Mail.Disposer);
        a = new A();

        // Verify the objects haven't been disposed
        tc.areEqual(obj1.called, 0);
        tc.areEqual(obj2.called, 0);

        // Verify both are only disposed once
        a.dispose();
        tc.areEqual(obj1.called, 1);
        tc.areEqual(obj2.called, 1);
        tc.areEqual(a.called, 2);

        // Verify the items aren't disposed again
        a.dispose();
        tc.areEqual(obj1.called, 1);
        tc.areEqual(obj2.called, 1);
        tc.areEqual(a.called, 2);
    });

    Tx.test("Disposer.add", function (tc) {
        var d, obj;

        obj = { called: 0, dispose: function () { this.called++; } };
        d = new Mail.Disposer();

        tc.areEqual(d.add(obj), obj);

        // Verify the object hasn't been disposed yet
        tc.areEqual(obj.called, 0);

        // Verify the object gets disposed early
        d.disposeNow(obj);
        tc.areEqual(obj.called, 1);

        // Verify the object doesn't get disposed again
        d.dispose();
        tc.areEqual(obj.called, 1);
    });

    Tx.test("Disposer.testDisposable", function (tc) {
        var obj = { called: 0, foo: function () { this.called++; } };
        var d = new Mail.Disposable(obj, "foo");
        tc.areEqual(obj.called, 0);
        d.dispose();
        tc.areEqual(obj.called, 1);
        d.dispose();
        tc.areEqual(obj.called, 1);
    });

})();

