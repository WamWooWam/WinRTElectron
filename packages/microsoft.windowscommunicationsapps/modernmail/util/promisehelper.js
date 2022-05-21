
//
// Copyright (C) Microsoft Corporation. All rights reserved.
//

/// <reference path="Namespaces.js" />

Jx.delayDefine(Mail, "Promises", function () {

    var Promises = Mail.Promises = {

        waitForEvent: function (source, type, predicate) {
            /// <param name="source">The object that will fire the event we are waiting for. Can be a
            /// DOM or WinRT object with addEventListener or Jx.Events object with addListener.</param>
            /// <param name="type" type="String">The name of the event we are waiting for.</param>
            /// <param name="predicate" optional="true">A function that can delay completion if additional
            /// filtering beyond event type is required.</param>
            /// <returns type="WinJS.Promise">A promise that completes when the event is fired.<returns>
            Debug.assert(Jx.isObject(source));
            Debug.assert(Jx.isNonEmptyString(type));
            Debug.assert(Jx.isUndefined(predicate) || Jx.isFunction(predicate));

            var hook = null;
            return new WinJS.Promise(function (complete) {
                hook = new Mail.EventHook(source, type, function (ev) {
                    if (!predicate || predicate(ev)) {
                        complete(ev);
                        hook.dispose();
                    }
                });
            },
            function () {
                Jx.dispose(hook);
            });
        },

        waitForEventWithTimeout: function (source, type, predicate, timeout) {
            /// <summary>Like waitForEvent but also fulfills successfully if we timeout before
            /// the desired waiter completes.</summary>
            var promise = Mail.Promises.waitForEvent(source, type, predicate);

            return WinJS.Promise.timeout(timeout || 5000, promise).then(
                function (ev) { return ev; }, // Propagate the original event that's returned
                Jx.fnEmpty // Empty cancel handler ensures timeouts don't propagate as errors
            );
        },

        wrapWithRAF: function (animation) {
            /// <summary>
            ///     Return a promise that fulfills after the given animation completes after being wrapped in a requestAnimationFrame call.
            /// </summary>
            /// <param name="animation" type="Function">A function that returns a Promise</param>
            Debug.assert(Jx.isFunction(animation));
            return new WinJS.Promise(function (complete) {
                /// <param name="complete" type="Function" />
                Debug.assert(Jx.isFunction(complete));
                var workItem = function () {
                    animation().done(function () {
                        complete();
                    });
                };
                requestAnimationFrame(workItem);
            });
        }
    };

    Promises.AsyncJob = function (func, context, args) {
        ///<summary>
        /// AsyncJob allows the caller to wraps a function into an object and allow other clients to
        /// subscribe to when the function by adding a then listener on the promise object
        ///</summary>
        Debug.assert(Jx.isFunction(func));
        Debug.assert(Jx.isNullOrUndefined(context) || Jx.isObject(context));
        Debug.assert(Jx.isNullOrUndefined(args) || Jx.isArray(args));
        this._func = func;
        this._context = context;
        this._args = args;
        this._promise = new WinJS.Promise(function (complete) {
            this._complete = complete;
        }.bind(this));
    };

    Promises.AsyncJob.prototype = {
        execute: function () {
            if (this._func) {
                this._func.apply(this._context, this._args);
                this._complete();
            }
        },
        dispose: function () {
            this._func = null;
            this._context = null;
            this._args = null;
            if (this._promise) {
                this._promise.cancel();
                this._promise = null;
            }
        },
        get promise() {
            return WinJS.Promise.as(this._promise);
        }
    };
});
