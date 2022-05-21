
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Mail,Jx,Debug*/

Jx.delayDefine(Mail, ["Disposer","Disposable"], function () {
    "use strict";

    // You should instantiate a standalone disposer and optionally pass it the
    // initial set of things to later dispose.
    //
    //      var a = new A();
    //      var disposer = new Mail.Disposer(a);
    //      var b = disposer.add(new B());
    //      disposer.dispose();
    //

    var Disposer = Mail.Disposer = function (/*variadic*/) {
        this.addMany.apply(this, arguments);
        Debug.only(Object.seal(this));
    };

    // Performs the actual dispose on the object (non-recursive if an array)
    function dispose(obj) {
        if (obj.dispose) {
            obj.dispose();
        } else {
            Debug.assert(Jx.isArray(obj));
            obj.forEach(Jx.dispose);
        }
    }

    Disposer.prototype = {

        // Disposes all outstanding references that were added via calls to addMany. This is performed
        // in reverse (e.g. LIFO) since that generally correlates to disposing newer objects first which
        // should happen before older ones.
        dispose: function () {
            var disposables = this._disposables;
            if (disposables) {
                this._disposables = null;
                for (var i = disposables.length; i--;) {
                    dispose(disposables[i]);
                }
            }
        },

        // Adds arguments to the list of pending objects to be cleaned-up during Disposer.dispose.
        // The object is returned back to the caller.
        add: function (disposableObject) {
            Debug.assert(arguments.length === 1);
            Debug.assert(Jx.isArray(disposableObject) || Jx.isFunction(disposableObject.dispose));
            var disposables = this._disposables = (this._disposables || []);
            disposables.push(disposableObject);
            return disposableObject;
        },

        // Adds arguments to the list of pending objects to be cleaned-up during Disposer.dispose. Each
        // argument is expected to be an object with a dispose method or an array of objects with dispose
        // methods. In the case of an array this is NOT recursive.
        addMany: function (/*variadic*/) {
            Debug.call(Array.prototype.forEach, arguments, function (arg) {
                Debug.assert(arg.dispose || Jx.isArray(arg));
                if (Jx.isArray(arg)) {
                    arg.forEach(function (obj) { Debug.assert(obj.dispose); });
                }
            });

            var disposables = this._disposables = (this._disposables || []);
            disposables.push.apply(disposables, arguments);
        },

        // Explicitly disposes an object that was previously provided to addMany
        disposeNow: function (obj) {
            if (obj) {
                this.removeDisposable(obj);
                dispose(obj);
            }
        },

        // Explicitly disposes an object that was previously provided to addMany, replacing it
        // with the new instance and returning it
        replace: function (previous, replacement) {
            this.disposeNow(previous);
            if (replacement) {
                this.addMany(replacement);
            }
            return replacement;
        },

        // Removes an object from our list of pending disposable objects without actually disposing
        // it. Allows for transferring ownership of clean-up of said object to someone else.
        removeDisposable: function (obj) {
            var index = this._disposables.indexOf(obj);
            Debug.assert(index !== -1);
            if (index !== -1) {
                this._disposables.splice(index, 1);
            }
        }
    };

    var Disposable = Mail.Disposable = function (obj, methodName) {
        Debug.assert(Jx.isObject(obj));
        Debug.assert(Jx.isNonEmptyString(methodName));
        Debug.assert(Jx.isFunction(obj[methodName]));
        this._obj = obj;
        this._methodName = methodName;
        Debug.only(Object.seal(this));
    };
    Disposable.prototype = {
        dispose: function () {
            var obj = this._obj;
            if (obj) {
                this._obj = null;
                obj[this._methodName]();
            }
        }
    };

});

