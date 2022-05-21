
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Windows Blue # 49992 - Remove this file when jm.js is being shared from Chat

(function () {

    window.Jm = window.Jm || {};

    // Public API - Note that any method marked with $ is intended for internal Jm use only.
    // See UTs for full documentation.

    Jm.mock = function (objectLiteral) {
        return new Jm.MockObject(objectLiteral);
    };

    Jm.mockFn = function () {
        return Jm.createMockFn();
    };

    Jm.mockCtor = function () {
        return Jm.createMockCtor();
    };

    Jm.verify = function (mockBase, /*@optional*/prop) {
        return mockBase.$getVerifier(prop);
    };

    Jm.verifyNot = function (mockBase, /*@optional*/prop) {
        return mockBase.$getNotVerifier(prop);
    };

    Jm.when = function (mockBase) {
        return mockBase.$getWhen();
    };

    Jm.whenSet = function (mockBase, prop, value) {
        return mockBase.$getWhenSet(prop, value);
    };

    Jm.inOrder = function () {
        return new Jm.InOrder();
    };

    Jm.preserve = function (/*@dynamic*/ns, /*@dynamic*/names) {
        /// <param name="ns" type="Object" optional="true"></param>
        /// <param name="names" optional="true"></param>
        return new Jm.Preserve(ns, names);
    };

    // Verifiers

    Jm.Verifiers = {};

    Jm.Verifiers.deepCompare = function (obj, options) {
        /// <summary>Use a deep comparison for a given parameter</summary>
        /// <param name="obj" type="Object">
        /// Object to compare with. Default is to only require this object be a subset of the actual object.
        /// Pass option, subset=false, to ensure the this object has all the same parameters.
        /// </param>
        /// <param name="options" type="object" optional="true">
        ///  - name="subset" type="Boolean" - default is true, set to false to require the exact number of properties be equal
        ///  - name="depth" type="Number" - default is 1, determines how deep the comparison will go
        /// </param>
        return new Jm.Verifiers.DeepCompare(obj, options);
    };

}());

(function () {

    // Matches any set of parameters, 0 or more
    Jm.ANY = "{7bdebb9e-9b01-4b47-8be4-0c3cc6ce999c}";

}());

(function () {

    // Semi-private Jm functions. Shouldn't ever need these outside of Jm.

    // Jm deals with a lot of "arguments" variables which are not technically arrays, but act like them.
    // Use this instead of Jx.isArray to test that.
    Jm.$isArrayLike = function (obj) {
        return Jx.isNumber(obj.length) && !Jx.isString(obj);
    };

    // Jm.mockFn does not have a function name. Just use "anonymous instead.
    Jm.$getDescriptiveFnName = function (givenFunctionName) {
        return givenFunctionName.length > 0 ? givenFunctionName : "anonymous";
    };

    Jm.$callUtVerify = function (exp, /*@optional*/msg) {
        Debug.assert(Jx.isFunction(Jm.$utVerify),
            "UTs must first define a Jm.$utVerify(exp, /*@optional*/msg) function for the current UT implementation. See /modern/chat/app/jscomponents/ut/mockjxut.js.");
        Jm.$utVerify(exp, msg);
    };

}());

(function () {

    // Helps for reporting on failures:
    Jm.TraceBuilder = function () {
        this._msg = "";
    };

    var LINEBREAK = "\n";
    var tbProto = Jm.TraceBuilder.prototype;

    tbProto._msg = null;
    tbProto._steps = 0;

    tbProto.stepIn = function () {
        this._steps++;
    };

    tbProto.stepOut = function () {
        Debug.assert(this._steps >= 1);
        this._steps--;
    };

    tbProto.log = function (str) {
        this._msg += this._getIndent() + str + LINEBREAK;
    };

    tbProto.logEquality = function (prefix, expected, actual) {
        this.log(prefix + ": expected:" + expected + " actual:" + actual);
    };

    tbProto.printTrace = function () {
        Debug.assert(this._steps === 0);
        Jx.log.warning(this._msg);
    };

    tbProto._getIndent = function () {
        var indent = "";
        for (var i = 0; i < this._steps; i++) {
            indent += "  ";
        }
        return indent;
    };

}());

(function () {

    var Verifiers = Jm.Verifiers;

    Verifiers.VerifierBase = function () {
    };

    var vbProto = Verifiers.VerifierBase.prototype;

    vbProto.$jmVerifierId = {};

    vbProto.toString = function () {
        Debug.assert(false, "Custom verifiers should identify themselves");
    };


    Verifiers.$isVerifier = function (obj) {
        return obj && obj.$jmVerifierId === vbProto.$jmVerifierId;
    };

    Verifiers.$paramsEqual = function (expected, actual, trace) {
        Debug.assert(trace);
        var areEqual = false;

        trace.stepIn();
        if (Verifiers.$isVerifier(expected)) {
            areEqual = expected.$compareWith(actual);
        } else {
            areEqual = (expected === actual);
            if (areEqual) {
                trace.logEquality("parameter matches", expected, actual);
            } else {
                trace.logEquality("parameter does not match", expected, actual);
            }
        }
        trace.stepOut();

        return areEqual;
    };


    Verifiers.DeepCompare = function (obj, /*@optional*/options) {
        this._obj = obj;

        this._options = options || {};
        this._options.subset = Jx.isBoolean(this._options.subset) ? options.subset : true;
        this._options.depth = Jx.isNumber(this._options.depth) ? options.depth : 1;
    };
    Jx.augment(Verifiers.DeepCompare, Verifiers.VerifierBase);

    var dcProto = Verifiers.DeepCompare.prototype;

    dcProto._obj = null;
    dcProto._options = null;

    dcProto.toString = function () {
        return "DeepCompareVerfier";
    };

    dcProto.$compareWith = function (actual) {
        return this._compareWithHelper(this._obj, actual, 1);
    };

    dcProto._compareWithHelper = function (expected, actual, depth) {
        Debug.assert(Jx.isNumber(depth));
        Debug.assert(depth <= this._options.depth);
        var canGoDeeper = depth < this._options.depth;

        if (Jx.isNullOrUndefined(expected) !== Jx.isNullOrUndefined(actual)) {
            return false;
        }

        // If we aren't checking for a subset, ensure the count of properties is equal
        if (!this._options.subset && Object.keys(expected).length !== Object.keys(actual).length) {
            return false;
        }

        if (expected) {
            var keys = Object.keys(expected);
            for (var i in keys) {
                var key = keys[i];
                var val = expected[key];
                if (!canGoDeeper || !Jx.isObject(val)) {
                    if (expected[key] !== actual[key]) {
                        return false;
                    }
                } else {
                    if (!this._compareWithHelper(expected[key], actual[key], depth + 1)) {
                        return false;
                    }
                }
            }
        }

        return true;
    };
}());

(function () {

    var mcId = 0;
    Jm.MockCall = function (functionName, params) {
        this.id = ++mcId;
        this.name = functionName;
        this.params = params;
    };
    Jm.MockCall.prototype.id = null;
    Jm.MockCall.prototype.name = null;
    Jm.MockCall.prototype.params = null;

    Jm.ThenFn = function (functionName, params, fn) {
        this.name = functionName;
        this.params = params;
        this.fn = fn;
    };
    Jm.ThenFn.prototype.name = null;
    Jm.ThenFn.prototype.params = null;
    Jm.ThenFn.prototype.fn = null;

}());

(function () {

    Jm.StubValue = /*@constructor*/function (valueName, params, parentBuilder) {
        Debug.assert(Jx.isString(valueName));
        Debug.assert(Jm.$isArrayLike(params));
        Debug.assert(Boolean(params));

        this.name = valueName;
        this.params = params;
        this.parentBuilder = parentBuilder;
        this._values = [];
    };
    var stubProto = Jm.StubValue.prototype;

    stubProto.name = null;
    stubProto.params = null;

    // Keep track of the StubBuilder that built this so we can accurately chain thenReturn calls
    stubProto.parentBuilder = null;

    // If there is more than 1 value, we will cycle through them using i
    stubProto._i = 0;
    stubProto._values = null;

    stubProto.addValues = function (values) {
        Debug.assert(Jm.$isArrayLike(values));
        for (var i = 0; i < values.length; i++) {
            this._values.push(values[i]);
        }
    };

    stubProto.nextValue = function () {
        var val = this._values[this._i];

        // Special case - if there is just one value, don't increment past it
        if (this._values.length > 1) {
            this._i++;
        }

        return val;
    };
}());

(function () {

    // Shared by MockObject and MockFn
    Jm.MockBase = function () {
        this.$queue = [];
        this._stubValues = [];
        this._thenFns = [];
    };

    var mockBaseProto = Jm.MockBase.prototype;

    mockBaseProto.$addStubValue = function (valueName, params, values, builder) {
        Debug.assert(Jx.isString(valueName));
        Debug.assert(Boolean(builder));
        // First see if there's a matching params, as in we're chaining
        var stub = null;
        for (var i = 0; i < this._stubValues.length; i++) {
            var testStub = this._stubValues[i];
            // We use the parent stub builder to match this instead of looking at the params.
            // This is because we want to separate the following calls:
            //   1. Jm.mock(obj).thenReturn(1).thenReturn(2) // Should chain
            //   2. Jm.mock(obj).thenReturn(2); Jm.mock(obj).thenReturn(2); // Should override
            if (testStub.parentBuilder === builder) {
                stub = testStub;
                break;
            }
        }

        if (!stub) {
            stub = new Jm.StubValue(valueName, params, builder);
            this._stubValues.push(stub);
        }
        stub.addValues(values);
    };

    mockBaseProto.$getStub = function (valueName, params) {
        var stub = null;
        var index = this._indexOfNameParamEntry(this._stubValues, valueName, params, false, new Jm.TraceBuilder());
        if (index !== -1) {
            stub = this._stubValues[index];
        }
        return stub;
    };

    mockBaseProto.$getStubValue = function (valueName, params) {
        // Mimic method that doesn't return anything unless the test explicitly told us otherwise
        /// <disable>JS2042.DoNotAssignUndefined</disable>
        var value = undefined;

        var stub = this.$getStub(valueName, params);
        if (stub) {
            value = stub.nextValue();
        }

        return value;
    };

    mockBaseProto.$addThenFn = function (functionName, params, fn) {
        this._thenFns.push(new Jm.ThenFn(functionName, params, fn));
    };

    mockBaseProto.$getThenFn = function (functionName, params) {
        /// <returns type="Function" />
        var index = this._indexOfNameParamEntry(this._thenFns, functionName, params, false, new Jm.TraceBuilder());
        if (index !== -1) {
            return this._thenFns[index].fn;
        }

        return null;
    };

    mockBaseProto.$removeMockCall = function (functionName, params, minIndex, trace) {
        Debug.assert(trace);

        var index = this._indexOfNameParamEntry(this.$queue, functionName, params, true, trace, minIndex);
        if (index !== -1) {
            var mockCall = this.$queue[index];
            this.$queue.splice(index, 1);
            return mockCall;
        }

        return null;
    };

    mockBaseProto.$getVerifier = function () {
        Debug.assert(false);
    };

    mockBaseProto.$getNotVerifier = function () {
        Debug.assert(false);
    };

    mockBaseProto.$getInOrderVerifier = function () {
        Debug.assert(false);
    };

    mockBaseProto.$getInOrderNotVerifier = function () {
        Debug.assert(false);
    };

    mockBaseProto.$getWhen = function () {
        Debug.assert(false);
    };

    mockBaseProto.$getWhenSet = function () {
        Debug.assert(false);
    };

    /// <disable>JS3054.NotAllCodePathsReturnValue</disable>
    mockBaseProto._functionImpl = function (functionName, params, returns) {
        this.$queue.push(new Jm.MockCall(functionName, params));

        var thenFn = this.$getThenFn(functionName, params),
            thenFnRetVal = null;
        if (thenFn) {
            thenFnRetVal = thenFn.apply(null, params);
        }

        if (returns) {
            // return value priority:
            //   1. stub return val
            //   2. thenFn return val
            var retVal = this.$getStubValue(functionName, params);
            return !Jx.isUndefined(retVal) ? retVal : thenFnRetVal;
        }
    };
    /// <enable>JS3054.NotAllCodePathsReturnValue</enable>

    mockBaseProto._indexOfNameParamEntry = function (array, functionName, params, arrayIsActual, trace, minIndex) {
        /// <param name="array" type="Array">Array of parameter sets to search through</param>
        /// <param name="functionName" type="String">Name of the function we're searching for</param>
        /// <param name="params">Set of params we're looking for</param>
        /// <param name="arrayIsActual" type="Boolean">
        /// Either the array are the real params (given from product code) or the params are the real ones.
        /// We need to know here because that determines which set of parameters could have special properties
        /// like "Jm.ANY" or special verifiers.
        /// </param>
        /// <param name="trace"></param>
        /// <param name="minIndex" optional="True">Minimum index to allow our search to go</param>
        Debug.assert(Jm.$isArrayLike(array));
        Debug.assert(Jx.isString(functionName));
        Debug.assert(params);
        Debug.assert(Jx.isBoolean(arrayIsActual));
        Debug.assert(trace);

        var index = -1;

        trace.stepIn();
        var fnName = Jm.$getDescriptiveFnName(functionName);
        trace.log("Searching for matching parameters for function:" + fnName);

        minIndex = minIndex || 0;

        // Search in reverse order because latest pushes should have highest priority (allows for overrides)
        for (var i = array.length - 1; i >= minIndex; i--) {
            if (array[i].name === functionName) {

                // arrayIsActual tells us which params came from product code, and which came from test code.
                // This tells the _paramsMatch method which params to search for special values.
                var arrayParams = array[i].params,
                    actualParams = arrayIsActual ? arrayParams : params,
                    expectedParams = arrayIsActual ? params : arrayParams;
                if (_paramsMatch(expectedParams, actualParams, trace)) {
                    trace.log("found matching params for function:" + fnName);
                    index = i;
                    break;
                }
            }
        }

        if (index === -1) {
            var expectedParams = arrayIsActual ? params : arrayParams,
                args = "";

            if (expectedParams) {
                args = Array.prototype.map.call(expectedParams, function (v) {
                    var log = String(v);
                    return (log.length > 20) ? (log.substr(0, 20) + "...") : log;
                }).join(",");
            }
            trace.log("did not find matching params for function:" + fnName + "(" + args + ")");
        }

        trace.stepOut();

        return index;
    };


    Jm.MockObject = function (objectLiteral) {
        Jm.MockBase.call(this);

        _copyPropertiesToMe(this, objectLiteral, true);
    };
    Jx.augment(Jm.MockObject, Jm.MockBase);

    Jm.MockObject.prototype.$getVerifier = function (/*@optional*/prop) {
        return new Jm.VerifyObject(this, prop);
    };

    Jm.MockObject.prototype.$getNotVerifier = function (/*@optional*/prop) {
        return new Jm.VerifyNotObject(this, prop);
    };

    Jm.MockObject.prototype.$getInOrderVerifier = function (inOrder) {
        return new Jm.InOrderVerifyObject(inOrder, this);
    };

    Jm.MockObject.prototype.$getInOrderNotVerifier = function (inOrder) {
        return new Jm.InOrderVerifyNotObject(inOrder, this);
    };

    Jm.MockObject.prototype.$getWhen = function () {
        return new Jm.WhenObject(this);
    };

    Jm.MockObject.prototype.$getWhenSet = function (prop, value) {
        Debug.assert(prop in this);
        return new Jm.StubBuilder(this, prop, [value]);
    };

    Jm.MockObject.prototype._getFunctionImpl = function (functionName, returns) {
        var that = this;
        return function () {
            return that._functionImpl(functionName, arguments, returns);
        };
    };


    var verifyHelper = function (mockObj, not, functionName, args, minIndex) {
        /// <summary>Fails if the expected outcome is not true. Else, returns the mockCall found.</summary>
        Debug.assert(Boolean(mockObj));
        Debug.assert(Jx.isBoolean(not));
        Debug.assert(Jx.isString(functionName));

        var trace = new Jm.TraceBuilder();
        var fnName = Jm.$getDescriptiveFnName(functionName);
        var type = not ? "Jm.verifyNot" : "Jm.verify";
        trace.log(type + " - " + fnName);

        var mockCall = mockObj.$removeMockCall(functionName, args, minIndex, trace);
        var succeeded = (not === !Boolean(mockCall));

        if (!succeeded) {
            trace.printTrace();
            Jm.$callUtVerify(succeeded, type + " failure" + "\n" + trace._msg);
        }

        return mockCall;
    };


    Jm.VerifyObject = function (mockObj, prop) {
        Debug.assert(Jx.isObject(mockObj));

        this._mockObj = mockObj;

        if (Jx.isNullOrUndefined(prop)) {
            _copyPropertiesToMe(this, mockObj);
        } else {
            Debug.assert(prop in mockObj);
            this.set = this._getFunctionImpl(prop, null, 1);
        }
    };

    Jm.VerifyObject.prototype._getFunctionImpl = function (functionName, throwAway, /*@optional*/expectedArgsLength) {
        Debug.assert(Jx.isNonEmptyString(functionName));
        return function () {
            Debug.assert(Jx.isNullOrUndefined(expectedArgsLength) || arguments.length === expectedArgsLength, "Expected exactly 1 argument");
            verifyHelper(this._mockObj, false, functionName, arguments, 0);
        };
    };

    Jm.VerifyNotObject = function (mockObj, prop) {
        Debug.assert(Jx.isObject(mockObj));

        this._mockObj = mockObj;

        if (Jx.isNullOrUndefined(prop)) {
            _copyPropertiesToMe(this, mockObj);
        } else {
            Debug.assert(prop in mockObj);
            this.set = this._getFunctionImpl(prop, null, 1);
        }
    };
    Jm.VerifyNotObject.prototype._mockObj = null;

    Jm.VerifyNotObject.prototype._getFunctionImpl = function (functionName, throwAway, /*@optional*/expectedArgsLength) {
        Debug.assert(Jx.isNonEmptyString(functionName));
        return function () {
            Debug.assert(Jx.isNullOrUndefined(expectedArgsLength) || arguments.length === expectedArgsLength, "Expected exactly 1 argument");
            verifyHelper(this._mockObj, true, functionName, arguments, 0);
        };
    };


    Jm.WhenObject = function (mockObj) {
        this._mockObj = mockObj;

        _copyPropertiesToMe(this, mockObj);
    };
    Jm.WhenObject.prototype._mockObj = null;

    Jm.WhenObject.prototype._getFunctionImpl = function (functionName) {
        var mockObj = this._mockObj;
        return function () {
            return new Jm.StubBuilder(mockObj, functionName, arguments);
        };
    };


    Jm.MockFnBase = function () {
        Jm.MockBase.call(this);
    };
    Jx.augment(Jm.MockFnBase, Jm.MockBase);

    var mockFnBaseProto = Jm.MockFnBase.prototype;

    mockFnBaseProto.$getVerifier = function (/*@optional*/prop) {
        Debug.assert(!Boolean(prop), "properties not supported on mockFn");

        var that = this;
        return function () {
            verifyHelper(that, false, "", arguments, 0);
        };
    };

    mockFnBaseProto.$getNotVerifier = function (/*@optional*/prop) {
        Debug.assert(!Boolean(prop), "properties not supported on mockFn");

        var that = this;
        return function () {
            verifyHelper(that, true, "", arguments, 0);
        };
    };

    mockFnBaseProto.$getInOrderVerifier = function (inOrder) {
        var that = this;
        return function () {
            inOrder.$verifyCall(that, false, "", arguments);
        };
    };

    mockFnBaseProto.$getInOrderNotVerifier = function (inOrder) {
        var that = this;
        return function () {
            inOrder.$verifyCall(that, true, "", arguments);
        };
    };

    mockFnBaseProto.$getWhen = function () {
        var that = this;
        return function () {
            return new Jm.StubBuilder(that, "", arguments);
        };
    };

    mockFnBaseProto.$getWhenSet = function () {
        Debug.assert(false, "properties not supported on mockFn");
    };


    Jm.createMockFn = function () {
        var mockFn = function () {
            return mockFn._functionImpl("", arguments, true);
        };

        Jx.mix(mockFn, Jm.MockFnBase.prototype);
        Jm.MockFnBase.call(mockFn);

        return mockFn;
    };


    Jm.createMockCtor = function () {
        // A mock fn that ensures it was call with "new"
        var mockCtor = function () {
            Jm.$callUtVerify(this instanceof mockCtor, "Jm.createMockCtor - use new");
            return mockCtor._functionImpl("", arguments, true);
        };

        Jx.mix(mockCtor, Jm.MockFnBase.prototype);
        Jm.MockFnBase.call(mockCtor);

        return mockCtor;
    };


    Jm.StubBuilder = function (mockBase, functionName, params) {
        /// <param name="mockBase" type="Jm.MockBase" />
        this._mockBase = mockBase;
        this._name = functionName;
        this._params = params;
    };
    Jm.StubBuilder.prototype._mockBase = null;
    Jm.StubBuilder.prototype._name = null;
    Jm.StubBuilder.prototype._params = null;

    Jm.StubBuilder.prototype.thenReturn = function () {
        this._mockBase.$addStubValue(this._name, this._params, arguments, this);

        return this;
    };

    // Takes an array as a single argument and applies it to thenReturn (thenReturnAll([1, 2, 3]) is equivalent to thenReturn(1, 2, 3)
    Jm.StubBuilder.prototype.thenReturnAll = function (arrArg) {
        Debug.assert(Jx.isArray(arrArg));
        return this.thenReturn.apply(this, arrArg);
    };

    Jm.StubBuilder.prototype.then = function (fn) {
        this._mockBase.$addThenFn(this._name, this._params, fn);

        return this;
    };


    Jm.InOrder = function () {
    };
    Jm.InOrder.prototype._lastId = 0;

    Jm.InOrder.prototype.verify = function (mockBase) {
        return mockBase.$getInOrderVerifier(this);
    };

    Jm.InOrder.prototype.verifyNot = function (mockBase) {
        return mockBase.$getInOrderNotVerifier(this);
    };

    Jm.InOrder.prototype.$verifyCall = function (mockBase, not, functionName, params) {
        // Find position of lastId
        var minIndex = Number.MAX_VALUE;
        for (var i in mockBase.$queue) {
            if (mockBase.$queue[i].id > this._lastId) {
                minIndex = i;
                break;
            }
        }

        var mockCall = verifyHelper(mockBase, not, functionName, params, minIndex);
        if (Boolean(mockCall)) {
            this._lastId = mockCall.id;
        }
    };


    Jm.InOrderVerifyObject = function (inOrder, mockObj) {
        this._inOrder = inOrder;
        this._mockObj = mockObj;

        _copyPropertiesToMe(this, mockObj);
    };
    Jm.InOrderVerifyObject.prototype._inOrder = null;
    Jm.InOrderVerifyObject.prototype._mockObj = null;

    Jm.InOrderVerifyObject.prototype._getFunctionImpl = function (functionName) {
        var inOrder = this._inOrder;
        var mockObj = this._mockObj;
        return function () {
            inOrder.$verifyCall(mockObj, false, functionName, arguments);
        };
    };

    Jm.InOrderVerifyNotObject = function (inOrder, mockObj) {
        this._inOrder = inOrder;
        this._mockObj = mockObj;

        _copyPropertiesToMe(this, mockObj);
    };
    Jm.InOrderVerifyNotObject.prototype._inOrder = null;
    Jm.InOrderVerifyNotObject.prototype._mockObj = null;

    Jm.InOrderVerifyNotObject.prototype._getFunctionImpl = function (functionName) {
        var inOrder = this._inOrder;
        var mockObj = this._mockObj;
        return function () {
            inOrder.$verifyCall(mockObj, true, functionName, arguments);
        };
    };


    Jm.Preserve = function (/*@optional*/ns, /*@optional*/names) {
        this._objs = [];
        if (Boolean(ns)) {
            this.preserve(ns, names);
        }
    };
    Jm.Preserve.prototype._objs = null;

    Jm.Preserve.prototype.preserve = function (ns, names) {
        if (Jx.isArray(names)) {
            for (var i in names) {
                this._objs.push(new Jm.Preserve.Info(ns, names[i]));
                ns[names[i]] = null;
            }
        } else {
            this._objs.push(new Jm.Preserve.Info(ns, names));
            ns[names] = null;
        }
        return this; // for preserve chaining
    };

    Jm.Preserve.prototype.restore = function () {
        for (var i in this._objs) {
            var info = this._objs[i];
            info.ns[info.name] = info.value;
        }
    };

    Jm.Preserve.Info = function (ns, infoName) {
        this.ns = ns;
        this.name = infoName;
        this.value = ns[infoName];
    };
    Jm.Preserve.Info.prototype.ns = null;
    Jm.Preserve.Info.prototype.name = null;
    Jm.Preserve.Info.prototype.value = null;


    var _copyPropertiesToMe = function (me, objectLiteral, followPrototypeChain) {
        /// <param name="followPrototypeChain" optional="true" />

        var props = Object.getOwnPropertyNames(objectLiteral).filter(function (prop) { return prop !== "prototype"; });

        for (var i in props) {
            var prop = props[i];
            var descrip = Object.getOwnPropertyDescriptor(objectLiteral, prop);
            var newDescrip = { enumerable: true, configurable: true };

            if ("value" in descrip && Jx.isFunction(descrip.value)) {
                newDescrip.value = me._getFunctionImpl(prop, true);
            } else {
                if ("get" in descrip || ("value" in descrip && !Jx.isFunction(descrip.value))) {
                    newDescrip.get = me._getFunctionImpl(prop, true);
                }
                if ("set" in descrip || descrip.writable) {
                    newDescrip.set = me._getFunctionImpl(prop, false);
                }
            }
            Object.defineProperty(me, prop, newDescrip);
        }

        if (followPrototypeChain) {
            // Attempt to copy down the prototype chain
            var proto1 = Object.getPrototypeOf(objectLiteral),
                proto2 = objectLiteral.prototype;
            if (Boolean(proto1)) {
                _copyPropertiesToMe(me, proto1, followPrototypeChain);
            }
            if (Boolean(proto2) && proto1 !== proto2) {
                _copyPropertiesToMe(me, proto2, followPrototypeChain);
            }
        }
    };

    var _paramsMatch = function (expected, actual, trace) {
        Debug.assert(trace);
        var match = true;

        trace.stepIn();
        if (expected.length === 1 && expected[0] === Jm.ANY) {
            // ANY always returns true
            trace.log("parameters match with Jm.ANY");
            match = true;
        } else if (actual.length !== expected.length) {
            trace.logEquality("parameter lengths do not match", expected.length, actual.length);
            match = false;
        } else {
            trace.log("matching parameter sets");

            var paramsEqual = Jm.Verifiers.$paramsEqual;

            for (var i in actual) {
                if (!paramsEqual(expected[i], actual[i], trace)) {
                    match = false;
                    break;
                }
            }

            if (match) {
                trace.log("parameter sets match");
            }
        }
        trace.stepOut();

        return match;
    };

}());
