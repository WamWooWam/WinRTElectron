
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx,Jx,self,window,WorkerGlobalScope,Window*/

(function () {
    /*jshint evil:true*/ // some UTs are using new Function()

    Tx.test("JxTests.testIsString", function (tc) {
        // strings
        tc.isTrue(Jx.isString(""));
        tc.isTrue(Jx.isString("a"));
        tc.isTrue(Jx.isString("abc"));
        tc.isTrue(Jx.isString(String()));
        tc.isTrue(Jx.isString(String("")));
        tc.isTrue(Jx.isString(String("1")));
        tc.isTrue(Jx.isString(String("123")));
        tc.isTrue(Jx.isString(Date()));

        // non-strings
        tc.isFalse(Jx.isString()); // undefined is not string
        tc.isFalse(Jx.isString(undefined));
        tc.isFalse(Jx.isString(null));
        tc.isFalse(Jx.isString(0));
        tc.isFalse(Jx.isString(1));
        tc.isFalse(Jx.isString({}));
        tc.isFalse(Jx.isString([]));
        tc.isFalse(Jx.isString(function () { }));
        tc.isFalse(Jx.isString(true));
        tc.isFalse(Jx.isString(false));
        tc.isFalse(Jx.isString(new String())); // is object
        tc.isFalse(Jx.isString(new String(""))); // is object
        tc.isFalse(Jx.isString(new String("abc"))); // is object
        tc.isFalse(Jx.isString(new Date())); // is object
    });

    Tx.test("JxTests.testIsNonEmptyString", function (tc) {
        // non-empty string
        tc.isTrue(Jx.isNonEmptyString("a"));
        tc.isTrue(Jx.isNonEmptyString("abc"));
        tc.isTrue(Jx.isNonEmptyString(String("1")));
        tc.isTrue(Jx.isNonEmptyString(String("123")));
        tc.isTrue(Jx.isNonEmptyString(Date()));

        // empty strings
        tc.isFalse(Jx.isNonEmptyString(""));
        tc.isFalse(Jx.isNonEmptyString(String()));
        tc.isFalse(Jx.isNonEmptyString(String("")));

        // non-strings
        tc.isFalse(Jx.isNonEmptyString()); // undefined is not string
        tc.isFalse(Jx.isNonEmptyString(undefined));
        tc.isFalse(Jx.isNonEmptyString(null));
        tc.isFalse(Jx.isNonEmptyString(0));
        tc.isFalse(Jx.isNonEmptyString(1));
        tc.isFalse(Jx.isNonEmptyString({}));
        tc.isFalse(Jx.isNonEmptyString([]));
        tc.isFalse(Jx.isNonEmptyString(function () { }));
        tc.isFalse(Jx.isNonEmptyString(true));
        tc.isFalse(Jx.isNonEmptyString(false));
        tc.isFalse(Jx.isNonEmptyString(new String())); // is object
        tc.isFalse(Jx.isNonEmptyString(new String(""))); // is object
        tc.isFalse(Jx.isNonEmptyString(new String("abc"))); // is object
        tc.isFalse(Jx.isNonEmptyString(new Date())); // is object
    });

    Tx.test("JxTests.testIsObject", function (tc) {
        // valid objects
        tc.isTrue(Jx.isObject({}));
        tc.isTrue(Jx.isObject(new String()));
        tc.isTrue(Jx.isObject(new Boolean()));
        tc.isTrue(Jx.isObject(new Number()));
        tc.isTrue(Jx.isObject(this));
        tc.isTrue(Jx.isObject(/a/)); // regular expressions
        tc.isTrue(Jx.isObject([]));
        tc.isTrue(Jx.isObject([1, 2, 3]));
        tc.isTrue(Jx.isObject(new Array()));
        tc.isTrue(Jx.isObject(new Date()));

        // invalid objects
        tc.isFalse(Jx.isObject());
        tc.isFalse(Jx.isObject(undefined));
        tc.isFalse(Jx.isObject(null)); // typeof null === "object"
        tc.isFalse(Jx.isObject(""));
        tc.isFalse(Jx.isObject("123"));
        tc.isFalse(Jx.isObject(0));
        tc.isFalse(Jx.isObject(123));
        tc.isFalse(Jx.isObject(Number()));
        tc.isFalse(Jx.isObject(Date()));
        tc.isFalse(Jx.isObject(true));
        tc.isFalse(Jx.isObject(false));
        tc.isFalse(Jx.isObject(function () { }));
    });

    Tx.test("JxTests.testIsInstanceOf", function (tc) {
        // temp classes for testing
        var Foo = function () { };
        var Bar = function () { };

        // valid objects
        tc.isTrue(Jx.isInstanceOf({}, Object));
        tc.isTrue(Jx.isInstanceOf(new String(), String));
        tc.isTrue(Jx.isInstanceOf(new Boolean(), Boolean));
        tc.isTrue(Jx.isInstanceOf(new Number(), Number));
        if (Jx.isWorker) {
            tc.isTrue(Jx.isInstanceOf(self, WorkerGlobalScope));
        } else {
            tc.isTrue(Jx.isInstanceOf(window, Window));
        }
        tc.isTrue(Jx.isInstanceOf([], Array));
        tc.isTrue(Jx.isInstanceOf([1, 2, 3], Array));
        tc.isTrue(Jx.isInstanceOf(new Array(), Array));
        tc.isTrue(Jx.isInstanceOf(new Date(), Date));
        tc.isTrue(Jx.isInstanceOf(new Foo(), Foo));


        // invalid objects
        tc.isFalse(Jx.isInstanceOf());
        tc.isFalse(Jx.isInstanceOf(undefined));
        tc.isFalse(Jx.isInstanceOf(null));
        tc.isFalse(Jx.isInstanceOf("", String));
        tc.isFalse(Jx.isInstanceOf("123", String));
        tc.isFalse(Jx.isInstanceOf(0, Number));
        tc.isFalse(Jx.isInstanceOf(123, Number));
        tc.isFalse(Jx.isInstanceOf(Number(), Number));
        tc.isFalse(Jx.isInstanceOf(Date(), Date));
        tc.isFalse(Jx.isInstanceOf(true, Boolean));
        tc.isFalse(Jx.isInstanceOf(false, Boolean));
        tc.isFalse(Jx.isInstanceOf(function () { }, Function));

        // incorrect types
        tc.isFalse(Jx.isInstanceOf({}, String));
        tc.isFalse(Jx.isInstanceOf(new String(), Boolean));
        tc.isFalse(Jx.isInstanceOf(new Boolean(), Number));
        tc.isFalse(Jx.isInstanceOf(new Number(), Date));
        tc.isFalse(Jx.isInstanceOf(this, Array));
        tc.isFalse(Jx.isInstanceOf([], Date));
        tc.isFalse(Jx.isInstanceOf([1, 2, 3], String));
        tc.isFalse(Jx.isInstanceOf(new Array(), Boolean));
        tc.isFalse(Jx.isInstanceOf(new Date(), Number));
        tc.isFalse(Jx.isInstanceOf(new Foo(), Bar));
    });

    Tx.test("JxTests.testIsArray", function (tc) {
        // valid arrays
        tc.isTrue(Jx.isArray([]));
        tc.isTrue(Jx.isArray([1, 2, 3]));
        tc.isTrue(Jx.isArray(new Array()));

        // invalid arrays
        tc.isFalse(Jx.isArray(new String()));
        tc.isFalse(Jx.isArray(new Boolean()));
        tc.isFalse(Jx.isArray(new Number()));
        tc.isFalse(Jx.isArray(Number()));
        tc.isFalse(Jx.isArray(new Date()));
        tc.isFalse(Jx.isArray(Date()));
        tc.isFalse(Jx.isArray(this));
        tc.isFalse(Jx.isArray(/a/)); // regular expressions
        tc.isFalse(Jx.isArray());
        tc.isFalse(Jx.isArray(undefined));
        tc.isFalse(Jx.isArray(null)); // typeof null === "object"
        tc.isFalse(Jx.isArray(""));
        tc.isFalse(Jx.isArray("123"));
        tc.isFalse(Jx.isArray(0));
        tc.isFalse(Jx.isArray(123));
        tc.isFalse(Jx.isArray(true));
        tc.isFalse(Jx.isArray(false));
        tc.isFalse(Jx.isArray(function () {}));
    });

    Tx.test("JxTests.testIsNumber", function (tc) {
        // Valid number types
        tc.isTrue(Jx.isNumber(0));
        tc.isTrue(Jx.isNumber(5));
        tc.isTrue(Jx.isNumber(-3));
        tc.isTrue(Jx.isNumber(8.3));
        tc.isTrue(Jx.isNumber(4e7));
        tc.isTrue(Jx.isNumber(Number()));
        tc.isTrue(Jx.isNumber(Number(5)));
        tc.isTrue(Jx.isNumber(Number.MAX_VALUE));
        tc.isTrue(Jx.isNumber(Number.MIN_VALUE));
        tc.isTrue(Jx.isNumber(Number.NEGATIVE_INFINITY));
        tc.isTrue(Jx.isNumber(Number.POSITIVE_INFINITY));
        tc.isTrue(Jx.isNumber(Infinity));
        tc.isTrue(Jx.isNumber(NaN)); // NaN (not a number) type's is number

        // Invalid number types
        tc.isFalse(Jx.isNumber(new Number())); // new Number() is an object
        tc.isFalse(Jx.isNumber(new Number(5))); // new Number() is an object
        tc.isFalse(Jx.isNumber([]));
        tc.isFalse(Jx.isNumber([1, 2, 3]));
        tc.isFalse(Jx.isNumber(new Array()));
        tc.isFalse(Jx.isNumber(new String()));
        tc.isFalse(Jx.isNumber(new Boolean()));
        tc.isFalse(Jx.isNumber(new Date()));
        tc.isFalse(Jx.isNumber(Date()));
        tc.isFalse(Jx.isNumber(this));
        tc.isFalse(Jx.isNumber(/a/)); // regular expressions
        tc.isFalse(Jx.isNumber());
        tc.isFalse(Jx.isNumber(undefined));
        tc.isFalse(Jx.isNumber(null));
        tc.isFalse(Jx.isNumber(""));
        tc.isFalse(Jx.isNumber("123"));
        tc.isFalse(Jx.isNumber(true));
        tc.isFalse(Jx.isNumber(false));
        tc.isFalse(Jx.isNumber(function () { }));
    });

    Tx.test("JxTests.testIsValidNumber", function (tc) {
        // Valid numbers
        tc.isTrue(Jx.isValidNumber(0));
        tc.isTrue(Jx.isValidNumber(5));
        tc.isTrue(Jx.isValidNumber(-3));
        tc.isTrue(Jx.isValidNumber(8.3));
        tc.isTrue(Jx.isValidNumber(4e7));
        tc.isTrue(Jx.isValidNumber(Number()));
        tc.isTrue(Jx.isValidNumber(Number(5)));
        tc.isTrue(Jx.isValidNumber(Number.MAX_VALUE));
        tc.isTrue(Jx.isValidNumber(Number.MIN_VALUE));

        // Invalid numbers
        tc.isFalse(Jx.isValidNumber(Number.NEGATIVE_INFINITY));
        tc.isFalse(Jx.isValidNumber(Number.POSITIVE_INFINITY));
        tc.isFalse(Jx.isValidNumber(Infinity));
        tc.isFalse(Jx.isValidNumber(NaN)); // NaN (not a number) type's is number
        tc.isFalse(Jx.isValidNumber(new Number())); // new Number() is an object
        tc.isFalse(Jx.isValidNumber(new Number(5))); // new Number() is an object
        tc.isFalse(Jx.isValidNumber([]));
        tc.isFalse(Jx.isValidNumber([1, 2, 3]));
        tc.isFalse(Jx.isValidNumber(new Array()));
        tc.isFalse(Jx.isValidNumber(new String()));
        tc.isFalse(Jx.isValidNumber(new Boolean()));
        tc.isFalse(Jx.isValidNumber(new Date()));
        tc.isFalse(Jx.isValidNumber(Date()));
        tc.isFalse(Jx.isValidNumber(this));
        tc.isFalse(Jx.isValidNumber(/a/)); // regular expressions
        tc.isFalse(Jx.isValidNumber());
        tc.isFalse(Jx.isValidNumber(undefined));
        tc.isFalse(Jx.isValidNumber(null));
        tc.isFalse(Jx.isValidNumber(""));
        tc.isFalse(Jx.isValidNumber("123"));
        tc.isFalse(Jx.isValidNumber(true));
        tc.isFalse(Jx.isValidNumber(false));
        tc.isFalse(Jx.isValidNumber(function () { }));
    });

    Tx.test("JxTests.testIsFunction", function (tc) {
        // Valid functions
        tc.isTrue(Jx.isFunction(function () {}));
        tc.isTrue(Jx.isFunction(new Function()));
        tc.isTrue(Jx.isFunction(this.toString));
        tc.isTrue(Jx.isFunction(Jx.mix));
        tc.isTrue(Jx.isFunction(isNaN));

        // Invalid functions
        tc.isFalse(Jx.isFunction(0));
        tc.isFalse(Jx.isFunction(5));
        tc.isFalse(Jx.isFunction(-3));
        tc.isFalse(Jx.isFunction(8.3));
        tc.isFalse(Jx.isFunction(4e7));
        tc.isFalse(Jx.isFunction(Number()));
        tc.isFalse(Jx.isFunction(Number(5)));
        tc.isFalse(Jx.isFunction(Number.MAX_VALUE));
        tc.isFalse(Jx.isFunction(Number.MIN_VALUE));
        tc.isFalse(Jx.isFunction(Number.NEGATIVE_INFINITY));
        tc.isFalse(Jx.isFunction(Number.POSITIVE_INFINITY));
        tc.isFalse(Jx.isFunction(Infinity));
        tc.isFalse(Jx.isFunction(NaN)); // NaN (not a number) type's is number
        tc.isFalse(Jx.isFunction(new Number())); // new Number() is an object
        tc.isFalse(Jx.isFunction(new Number(5))); // new Number() is an object
        tc.isFalse(Jx.isFunction([]));
        tc.isFalse(Jx.isFunction([1, 2, 3]));
        tc.isFalse(Jx.isFunction(new Array()));
        tc.isFalse(Jx.isFunction(new String()));
        tc.isFalse(Jx.isFunction(new Boolean()));
        tc.isFalse(Jx.isFunction(new Date()));
        tc.isFalse(Jx.isFunction(Date()));
        tc.isFalse(Jx.isFunction(this));
        tc.isFalse(Jx.isFunction(/a/)); // regular expressions
        tc.isFalse(Jx.isFunction());
        tc.isFalse(Jx.isFunction(undefined));
        tc.isFalse(Jx.isFunction(null));
        tc.isFalse(Jx.isFunction(""));
        tc.isFalse(Jx.isFunction("123"));
        tc.isFalse(Jx.isFunction(true));
        tc.isFalse(Jx.isFunction(false));
    });

    Tx.test("JxTests.testIsDefined", function (tc) {
        // true
        tc.isTrue(Jx.isDefined(0));
        tc.isTrue(Jx.isDefined(5));
        tc.isTrue(Jx.isDefined(-3));
        tc.isTrue(Jx.isDefined(8.3));
        tc.isTrue(Jx.isDefined(4e7));
        tc.isTrue(Jx.isDefined(Number()));
        tc.isTrue(Jx.isDefined(Number(5)));
        tc.isTrue(Jx.isDefined(Number.MAX_VALUE));
        tc.isTrue(Jx.isDefined(Number.MIN_VALUE));
        tc.isTrue(Jx.isDefined(Number.NEGATIVE_INFINITY));
        tc.isTrue(Jx.isDefined(Number.POSITIVE_INFINITY));
        tc.isTrue(Jx.isDefined(Infinity));
        tc.isTrue(Jx.isDefined(NaN)); // NaN (not a number) type's is number
        tc.isTrue(Jx.isDefined(new Number())); // new Number() is an object
        tc.isTrue(Jx.isDefined(new Number(5))); // new Number() is an object
        tc.isTrue(Jx.isDefined([]));
        tc.isTrue(Jx.isDefined([1, 2, 3]));
        tc.isTrue(Jx.isDefined(new Array()));
        tc.isTrue(Jx.isDefined(new String()));
        tc.isTrue(Jx.isDefined(new Boolean()));
        tc.isTrue(Jx.isDefined(new Date()));
        tc.isTrue(Jx.isDefined(Date()));
        tc.isTrue(Jx.isDefined(this));
        tc.isTrue(Jx.isDefined(/a/)); // regular expressions
        tc.isTrue(Jx.isDefined(""));
        tc.isTrue(Jx.isDefined("123"));
        tc.isTrue(Jx.isDefined(true));
        tc.isTrue(Jx.isDefined(false));
        tc.isTrue(Jx.isDefined(function () {}));
        /*jshint evil:true*/
        tc.isTrue(Jx.isDefined(new Function()));
        /*jshint evil:false*/
        tc.isTrue(Jx.isDefined(this.toString));
        tc.isTrue(Jx.isDefined(Jx.mix));
        tc.isTrue(Jx.isDefined(isNaN));

        // false
        tc.isFalse(Jx.isDefined());
        tc.isFalse(Jx.isDefined(null));
        tc.isFalse(Jx.isDefined(undefined));
    });

    Tx.test("JxTests.testIsNullOrUndefined", function (tc) {
        // Valid
        tc.isTrue(Jx.isNullOrUndefined());
        tc.isTrue(Jx.isNullOrUndefined(null));
        tc.isTrue(Jx.isNullOrUndefined(undefined));

        // Invalid
        tc.isFalse(Jx.isNullOrUndefined(0));
        tc.isFalse(Jx.isNullOrUndefined(5));
        tc.isFalse(Jx.isNullOrUndefined(-3));
        tc.isFalse(Jx.isNullOrUndefined(8.3));
        tc.isFalse(Jx.isNullOrUndefined(4e7));
        tc.isFalse(Jx.isNullOrUndefined(Number()));
        tc.isFalse(Jx.isNullOrUndefined(Number(5)));
        tc.isFalse(Jx.isNullOrUndefined(Number.MAX_VALUE));
        tc.isFalse(Jx.isNullOrUndefined(Number.MIN_VALUE));
        tc.isFalse(Jx.isNullOrUndefined(Number.NEGATIVE_INFINITY));
        tc.isFalse(Jx.isNullOrUndefined(Number.POSITIVE_INFINITY));
        tc.isFalse(Jx.isNullOrUndefined(Infinity));
        tc.isFalse(Jx.isNullOrUndefined(NaN)); // NaN (not a number) type's is number
        tc.isFalse(Jx.isNullOrUndefined(new Number())); // new Number() is an object
        tc.isFalse(Jx.isNullOrUndefined(new Number(5))); // new Number() is an object
        tc.isFalse(Jx.isNullOrUndefined([]));
        tc.isFalse(Jx.isNullOrUndefined([1, 2, 3]));
        tc.isFalse(Jx.isNullOrUndefined(new Array()));
        tc.isFalse(Jx.isNullOrUndefined(new String()));
        tc.isFalse(Jx.isNullOrUndefined(new Boolean()));
        tc.isFalse(Jx.isNullOrUndefined(new Date()));
        tc.isFalse(Jx.isNullOrUndefined(Date()));
        tc.isFalse(Jx.isNullOrUndefined(this));
        tc.isFalse(Jx.isNullOrUndefined(/a/)); // regular expressions
        tc.isFalse(Jx.isNullOrUndefined(""));
        tc.isFalse(Jx.isNullOrUndefined("123"));
        tc.isFalse(Jx.isNullOrUndefined(true));
        tc.isFalse(Jx.isNullOrUndefined(false));
        tc.isFalse(Jx.isNullOrUndefined(function () {}));
        tc.isFalse(Jx.isNullOrUndefined(new Function()));
        tc.isFalse(Jx.isNullOrUndefined(this.toString));
        tc.isFalse(Jx.isNullOrUndefined(Jx.mix));
        tc.isFalse(Jx.isNullOrUndefined(isNaN));
    });

    Tx.test("JxTests.testIsDate", function (tc) {
        // Valid
        tc.isTrue(Jx.isDate(new Date()));

        // Invalid
        tc.isFalse(Jx.isDate(Date()));
        tc.isFalse(Jx.isDate());
        tc.isFalse(Jx.isDate(null));
        tc.isFalse(Jx.isDate(undefined));
        tc.isFalse(Jx.isDate(0));
        tc.isFalse(Jx.isDate(5));
        tc.isFalse(Jx.isDate(-3));
        tc.isFalse(Jx.isDate(8.3));
        tc.isFalse(Jx.isDate(4e7));
        tc.isFalse(Jx.isDate(Number()));
        tc.isFalse(Jx.isDate(Number(5)));
        tc.isFalse(Jx.isDate(Number.MAX_VALUE));
        tc.isFalse(Jx.isDate(Number.MIN_VALUE));
        tc.isFalse(Jx.isDate(Number.NEGATIVE_INFINITY));
        tc.isFalse(Jx.isDate(Number.POSITIVE_INFINITY));
        tc.isFalse(Jx.isDate(Infinity));
        tc.isFalse(Jx.isDate(NaN)); // NaN (not a number) type's is number
        tc.isFalse(Jx.isDate(new Number())); // new Number() is an object
        tc.isFalse(Jx.isDate(new Number(5))); // new Number() is an object
        tc.isFalse(Jx.isDate([]));
        tc.isFalse(Jx.isDate([1, 2, 3]));
        tc.isFalse(Jx.isDate(new Array()));
        tc.isFalse(Jx.isDate(new String()));
        tc.isFalse(Jx.isDate(new Boolean()));
        tc.isFalse(Jx.isDate(this));
        tc.isFalse(Jx.isDate(/a/)); // regular expressions
        tc.isFalse(Jx.isDate(""));
        tc.isFalse(Jx.isDate("123"));
        tc.isFalse(Jx.isDate(true));
        tc.isFalse(Jx.isDate(false));
        tc.isFalse(Jx.isDate(function () {}));
        tc.isFalse(Jx.isDate(new Function()));
        tc.isFalse(Jx.isDate(this.toString));
        tc.isFalse(Jx.isDate(Jx.mix));
        tc.isFalse(Jx.isDate(isNaN));
    });

    Tx.test("JxTests.testIsUndefined", function (tc) {
        // Valid
        tc.isTrue(Jx.isUndefined());
        tc.isTrue(Jx.isUndefined(undefined));

        // Invalid
        tc.isFalse(Jx.isUndefined(null));
        tc.isFalse(Jx.isUndefined(0));
        tc.isFalse(Jx.isUndefined(5));
        tc.isFalse(Jx.isUndefined(-3));
        tc.isFalse(Jx.isUndefined(8.3));
        tc.isFalse(Jx.isUndefined(4e7));
        tc.isFalse(Jx.isUndefined(Number()));
        tc.isFalse(Jx.isUndefined(Number(5)));
        tc.isFalse(Jx.isUndefined(Number.MAX_VALUE));
        tc.isFalse(Jx.isUndefined(Number.MIN_VALUE));
        tc.isFalse(Jx.isUndefined(Number.NEGATIVE_INFINITY));
        tc.isFalse(Jx.isUndefined(Number.POSITIVE_INFINITY));
        tc.isFalse(Jx.isUndefined(Infinity));
        tc.isFalse(Jx.isUndefined(NaN)); // NaN (not a number) type's is number
        tc.isFalse(Jx.isUndefined(new Number())); // new Number() is an object
        tc.isFalse(Jx.isUndefined(new Number(5))); // new Number() is an object
        tc.isFalse(Jx.isUndefined([]));
        tc.isFalse(Jx.isUndefined([1, 2, 3]));
        tc.isFalse(Jx.isUndefined(new Array()));
        tc.isFalse(Jx.isUndefined(new String()));
        tc.isFalse(Jx.isUndefined(new Boolean()));
        tc.isFalse(Jx.isUndefined(new Date()));
        tc.isFalse(Jx.isUndefined(Date()));
        tc.isFalse(Jx.isUndefined(this));
        tc.isFalse(Jx.isUndefined(/a/)); // regular expressions
        tc.isFalse(Jx.isUndefined(""));
        tc.isFalse(Jx.isUndefined("123"));
        tc.isFalse(Jx.isUndefined(true));
        tc.isFalse(Jx.isUndefined(false));
        tc.isFalse(Jx.isUndefined(function () {}));
        tc.isFalse(Jx.isUndefined(new Function()));
        tc.isFalse(Jx.isUndefined(this.toString));
        tc.isFalse(Jx.isUndefined(Jx.mix));
        tc.isFalse(Jx.isUndefined(isNaN));
    });

    Tx.test("JxTests.testIsBoolean", function (tc) {
        // Valid
        tc.isTrue(Jx.isBoolean(true));
        tc.isTrue(Jx.isBoolean(false));

        // Invalid
        tc.isFalse(Jx.isBoolean());
        tc.isFalse(Jx.isBoolean(undefined));
        tc.isFalse(Jx.isBoolean(null));
        tc.isFalse(Jx.isBoolean(0));
        tc.isFalse(Jx.isBoolean(5));
        tc.isFalse(Jx.isBoolean(-3));
        tc.isFalse(Jx.isBoolean(8.3));
        tc.isFalse(Jx.isBoolean(4e7));
        tc.isFalse(Jx.isBoolean(Number()));
        tc.isFalse(Jx.isBoolean(Number(5)));
        tc.isFalse(Jx.isBoolean(Number.MAX_VALUE));
        tc.isFalse(Jx.isBoolean(Number.MIN_VALUE));
        tc.isFalse(Jx.isBoolean(Number.NEGATIVE_INFINITY));
        tc.isFalse(Jx.isBoolean(Number.POSITIVE_INFINITY));
        tc.isFalse(Jx.isBoolean(Infinity));
        tc.isFalse(Jx.isBoolean(NaN)); // NaN (not a number) type's is number
        tc.isFalse(Jx.isBoolean(new Number())); // new Number() is an object
        tc.isFalse(Jx.isBoolean(new Number(5))); // new Number() is an object
        tc.isFalse(Jx.isBoolean([]));
        tc.isFalse(Jx.isBoolean([1, 2, 3]));
        tc.isFalse(Jx.isBoolean(new Array()));
        tc.isFalse(Jx.isBoolean(new String()));
        tc.isFalse(Jx.isBoolean(new Boolean()));
        tc.isFalse(Jx.isBoolean(new Date()));
        tc.isFalse(Jx.isBoolean(Date()));
        tc.isFalse(Jx.isBoolean(this));
        tc.isFalse(Jx.isBoolean(/a/)); // regular expressions
        tc.isFalse(Jx.isBoolean(""));
        tc.isFalse(Jx.isBoolean("123"));
        tc.isFalse(Jx.isBoolean(function () {}));
        tc.isFalse(Jx.isBoolean(new Function()));
        tc.isFalse(Jx.isBoolean(this.toString));
        tc.isFalse(Jx.isBoolean(Jx.mix));
        tc.isFalse(Jx.isBoolean(isNaN));
    });

    // TODO:
    // Add tests for all property types: string, number, object, array, null, undefined, boolean, ...

})();
