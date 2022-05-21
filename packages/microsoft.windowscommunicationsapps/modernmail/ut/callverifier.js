
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function () {

    var U = Mail.UnitTest = Mail.UnitTest || {};

    function ensureIndirect(object, name) {
        ///<summary>Sometimes code takes function objects as parameters.  We don't want that code to get a hold of one
        ///of our expect/doNotExpect functions, as the test should be able to change that behavior on the fly.  So we
        ///hand out an indirect function, that will in turn call our function (stashed in the .impl member)</summary>
        ///<param name="object">The mock object</param>
        ///<param name="name" type="String">The name of the method</param>
        var oldFunction = object[name];
        if (oldFunction === undefined || !("impl" in oldFunction)) {
            var newFunction = function () { return object[name].impl.apply(object, arguments); };
            newFunction.impl = oldFunction;
            object[name] = newFunction;
        }
    }

    function doNotExpect(tc, object, name) {
        ensureIndirect(object, name);
        object[name].impl = function () { tc.fail("Unexpected call to " + name); };
    }

    function compare(tc, expected, actual, visited) {
        if (!visited) {
            visited = [];
        }

        if (expected !== actual) { // short-circuit on reference equality
            if (expected !== null && expected !== undefined) {
                // deep compare object literals
                if (visited.indexOf(expected) !== -1) {
                    tc.fail("Recursion in argument");
                } else {
                    visited.push(expected);
                    if (expected.constructor === Object) {
                        for (var field in expected) {
                            compare(tc, expected[field], actual[field], visited);
                        }
                    } else if (expected.constructor === Array) {
                        tc.areEqual(expected.length, actual.length);
                        for (var i = 0; i < expected.length; i++) {
                            compare(tc, expected[i], actual[i], visited);
                        }
                    } else {
                        tc.areEqual(expected, actual);
                    }
                }
            } else {
                tc.areEqual(expected, actual); // This should always fail based on the check above, but produces nice errors
            }
        }
    }

    U.CallVerifier = /*@constructor*/function (tc) {
        this._expected = [];
        this._tc = tc;
    };
    U.CallVerifier.prototype.initialize = function (object, names) {
        ///<summary>Initializes a set of functions on the given object</summary>
        ///<param name="object">The mock object to populate</param>
        ///<param name="names" type="Array">The names of the methods</param>
        names.forEach(function (name) { doNotExpect(this._tc, object, name); }, this);
    };
    U.CallVerifier.prototype.expectOnce = function (object, name, expectedArguments, fn) {
        ///<summary>Sets up the given method to expect a single call</summary>
        ///<param name="object">The mock object</param>
        ///<param name="name" type="String">The name of the method</param>
        ///<param name="expectedArguments' type="Array" optional="true"/>
        ///<param name="fn" type="Function" optional="true">The function body</param>
        this.expectMany(1, object, name, expectedArguments, fn);
    };
    U.CallVerifier.prototype.expectMany = function (occurances, object, name, expectedArguments, fn) {
        ///<summary>Sets up the given method to expect a single call</summary>
        ///<param name="object">The mock object</param>
        ///<param name="name" type="String">The name of the method</param>
        ///<param name="expectedArguments' type="Array" optional="true"/>
        ///<param name="fn" type="Function" optional="true">The function body</param>
        var expected = this._expected, tc = this._tc;
        expected.push(name);

        ensureIndirect(object, name);
        object[name].impl = function() {

            if (--occurances === 0) {
                // Now that it has been called the specified number of times, the function is no longer expected
                expected.splice(expected.indexOf(name), 1);
                doNotExpect(tc, object, name);
            }

            // Verify the arguments
            if (expectedArguments !== null && expectedArguments !== undefined) {
                var actualArguments = arguments;
                tc.areEqual(expectedArguments.length, actualArguments.length);
                expectedArguments.forEach(function (expectedArgument, index) {
                    compare(tc, expectedArgument, actualArguments[index]);
                });
            }

            // Call the provided implementation
            if (fn) {
                return fn.apply(this, arguments);
            } else {
                return undefined;
            }
        };
    };
    U.CallVerifier.prototype.verify = function() {
        ///<summary>Verifies that all expected calls have been made</summary>
        this._tc.areEqual(0, this._expected.length, "Missed call to " + this._expected.join(", "));
    };
    U.CallVerifier.prototype.hookEvents = function(object, events) {
        ///<summary>Creates a mock listener object hooked to events on the specified object</summary>
        ///<param name="object">The object to listen to</param>
        ///<param name="events" type="Array">The events to listen on</param>
        var listener = {};
        events.forEach(function (evt) {
            doNotExpect(this._tc, listener, evt);
            if (object.addEventListener) {
                object.addEventListener(evt, listener[evt].bind(listener));
            } else if (object.addListener) {
                object.addListener(evt, listener[evt], listener);
            } else if (object.on) {
                object.on(evt, listener[evt], listener);
            } else {
                this._tc.fail(false);
            }
        }, this);
        return listener;
    };


})();
