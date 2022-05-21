
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global document,window,HTMLElement,HTMLDivElement,HTMLSpanElement,Event,Qx,Tx,$*/

(function () {

    // JSHint complains about using new BuiltInObject() and it can't be turned off yet.
    // So I commented these tests out until JSHint will provide an option. 

    // The unload event is not listed here since it will trigger an UT page unload.
    var _qxEvents = "blur focus focusin focusout load resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout change select keydown keypress keyup error contextmenu somecustomevent";
    var _div = document.createElement("div");

    //
    // UT utilities
    //

    function _addStyle(id, css) {
        var e = document.createElement("style");
        e.id = id;
        e.type = "text/css";
        e.innerText = css;
        document.head.appendChild(e);
    }

    function _removeStyle(id) {
        var e = document.getElementById(id);
        if (e) {
            document.head.removeChild(e);
        }
    }

    function _removeHTML(id) {
        var e = document.getElementById(id);
        if (e) {
            e.outerHTML = "";
        }
    }

    function _removeFixture() {
        var e = document.getElementById("idQxFixture");
        if (e) {
            e.outerHTML = "";
        }
    }

    function _setFixture(html) {
        // setup Qx fixture
        _removeFixture();
        document.body.insertAdjacentHTML("beforeEnd", '<div id="idQxFixture">' + html + '</div>');
    }

    // Extend Qx with a function to check the length
    // TODO: find a good way to remove it after the UTs
    $.fn.utVerifyLength = function (tc, expectedLength, msg) {
        tc.isTrue(this instanceof $, msg);
        tc.areEqual(this.length, expectedLength, msg);
        return this; // to allow chaining
    };

    // TODO: use it
    function tearDown() {
        _removeFixture();
        _removeHTML("idQxCtor2");
        _removeHTML("idQxCtorArray");
        _removeHTML("idQxCtorContext");
        _removeHTML("idQxTestCss");
        _removeHTML("idQxTestEvents1");
        _removeHTML("idQxTestEvents2");
        _removeHTML("idQxTestEvents3");
        _removeHTML("idQxTestTrigger1");
        _removeStyle("testCss");
        delete $.fn.utVerifyLength;
    }

    //
    // Test Qx utilities
    //

    Tx.test("TestQxCore.testIsNullOrUndefined", function (tc) {

        /*jshint eqnull:true */
        function _isNullOrUndef(v) {
            return v == null; // using just two equals is intentional
        }
        /*jshint eqnull:false */

        // Valid 
        tc.isTrue(_isNullOrUndef());
        tc.isTrue(_isNullOrUndef(null));
        tc.isTrue(_isNullOrUndef(undefined));

        // Invalid
        tc.isFalse(_isNullOrUndef(0));
        tc.isFalse(_isNullOrUndef(5));
        tc.isFalse(_isNullOrUndef(-3));
        tc.isFalse(_isNullOrUndef(8.3));
        tc.isFalse(_isNullOrUndef(4e7));
        tc.isFalse(_isNullOrUndef(Number()));
        tc.isFalse(_isNullOrUndef(Number(5)));
        tc.isFalse(_isNullOrUndef(Number.MAX_VALUE));
        tc.isFalse(_isNullOrUndef(Number.MIN_VALUE));
        tc.isFalse(_isNullOrUndef(Number.NEGATIVE_INFINITY));
        tc.isFalse(_isNullOrUndef(Number.POSITIVE_INFINITY));
        tc.isFalse(_isNullOrUndef(Infinity));
        tc.isFalse(_isNullOrUndef(NaN)); // NaN (not a number) type's is number
        // tc.isFalse(_isNullOrUndef(new Number())); // new Number() is an object
        // tc.isFalse(_isNullOrUndef(new Number(5))); // new Number() is an object
        tc.isFalse(_isNullOrUndef([]));
        tc.isFalse(_isNullOrUndef([1, 2, 3]));
        // tc.isFalse(_isNullOrUndef(new Array()));
        // tc.isFalse(_isNullOrUndef(new String()));
        // tc.isFalse(_isNullOrUndef(new Boolean()));
        tc.isFalse(_isNullOrUndef(new Date()));
        tc.isFalse(_isNullOrUndef(Date()));
        tc.isFalse(_isNullOrUndef(window));
        tc.isFalse(_isNullOrUndef(this));
        tc.isFalse(_isNullOrUndef(/a/)); // regular expressions
        tc.isFalse(_isNullOrUndef(""));
        tc.isFalse(_isNullOrUndef("123"));
        tc.isFalse(_isNullOrUndef(true));
        tc.isFalse(_isNullOrUndef(false));
        tc.isFalse(_isNullOrUndef(_div));
        tc.isFalse(_isNullOrUndef(function () { }));
        // tc.isFalse(_isNullOrUndef(new Function()));
        tc.isFalse(_isNullOrUndef(window.toString));
        tc.isFalse(_isNullOrUndef($.noop));
        tc.isFalse(_isNullOrUndef(isNaN));
    });

    Tx.test("TestQxCore.testExtend", function (tc) {
        var dest = { d1: 1, d2: 2 };
        var src = { s1: 11, s2: 12 };

        var merged = $.extend(dest, src);

        tc.isTrue(dest.s1 === 11);
        tc.isTrue(dest.s2 === 12);
        tc.isTrue(merged === dest);
    });

    Tx.test("TestQxCore.testIsArray", function (tc) {
        // valid arrays
        tc.isTrue($.isArray([]));
        tc.isTrue($.isArray([1, 2, 3]));
        tc.isTrue($.isArray(new Array(4)));

        // invalid arrays
        tc.isFalse($.isArray(Number()));
        tc.isFalse($.isArray(new Date()));
        tc.isFalse($.isArray(Date()));
        tc.isFalse($.isArray(window));
        tc.isFalse($.isArray(this));
        tc.isFalse($.isArray(/a/)); // regular expressions
        tc.isFalse($.isArray());
        tc.isFalse($.isArray(undefined));
        tc.isFalse($.isArray(null)); // typeof null === "object"
        tc.isFalse($.isArray(""));
        tc.isFalse($.isArray("123"));
        tc.isFalse($.isArray(0));
        tc.isFalse($.isArray(123));
        tc.isFalse($.isArray(true));
        tc.isFalse($.isArray(false));
        tc.isFalse($.isArray(function () { }));
        tc.isFalse($.isArray({ "0": 1, length: 1 }));
        tc.isFalse($.isArray($()));
    });

    Tx.test("TestQxCore.testIsObject", function (tc) {
        // valid objects
        tc.isTrue($.isObject({}));
        tc.isTrue($.isObject(window));
        tc.isTrue($.isObject(this));
        tc.isTrue($.isObject(/a/)); // regular expressions
        tc.isTrue($.isObject([]));
        tc.isTrue($.isObject([1, 2, 3]));
        tc.isTrue($.isObject(new Date()));
        tc.isTrue($.isObject(function () { }));
        tc.isTrue($.isObject(_div));

        // invalid objects
        tc.isFalse($.isObject());
        tc.isFalse($.isObject(undefined));
        tc.isFalse($.isObject(null)); // typeof null === "object"
        tc.isFalse($.isObject(""));
        tc.isFalse($.isObject("123"));
        tc.isFalse($.isObject(0));
        tc.isFalse($.isObject(123));
        tc.isFalse($.isObject(Number()));
        tc.isFalse($.isObject(Date()));
        tc.isFalse($.isObject(true));
        tc.isFalse($.isObject(false));
    });

    Tx.test("TestQxCore.testIsFunction", function (tc) {
        // Valid functions
        tc.isTrue($.isFunction(function () { }));
        tc.isTrue($.isFunction(window.toString));
        tc.isTrue($.isFunction($.noop));
        tc.isTrue($.isFunction(isNaN));

        // Invalid functions
        tc.isFalse($.isFunction(0));
        tc.isFalse($.isFunction(5));
        tc.isFalse($.isFunction(-3));
        tc.isFalse($.isFunction(8.3));
        tc.isFalse($.isFunction(4e7));
        tc.isFalse($.isFunction(Number()));
        tc.isFalse($.isFunction(Number(5)));
        tc.isFalse($.isFunction(Number.MAX_VALUE));
        tc.isFalse($.isFunction(Number.MIN_VALUE));
        tc.isFalse($.isFunction(Number.NEGATIVE_INFINITY));
        tc.isFalse($.isFunction(Number.POSITIVE_INFINITY));
        tc.isFalse($.isFunction(Infinity));
        tc.isFalse($.isFunction(NaN)); // NaN (not a number) type's is number
        tc.isFalse($.isFunction([]));
        tc.isFalse($.isFunction([1, 2, 3]));
        tc.isFalse($.isFunction(new Date()));
        tc.isFalse($.isFunction(Date()));
        tc.isFalse($.isFunction(window));
        tc.isFalse($.isFunction(this));
        tc.isFalse($.isFunction(/a/)); // regular expressions
        tc.isFalse($.isFunction());
        tc.isFalse($.isFunction(undefined));
        tc.isFalse($.isFunction(null));
        tc.isFalse($.isFunction(""));
        tc.isFalse($.isFunction("123"));
        tc.isFalse($.isFunction(true));
        tc.isFalse($.isFunction(false));
        tc.isFalse($.isFunction(_div));
    });

    Tx.test("TestQxCore.testNoop", function (tc) {
        tc.isTrue(typeof $.noop === "function");
        tc.areEqual($.noop(), undefined);
    });

    Tx.test("TestQxCore.testCopyArrayLike", function (tc) {
        var dest;

        // empty source
        dest = $._copyArrayLike({ length: 0 }, { length: 0 });
        tc.areEqual(dest.length, 0);

        // one element source
        dest = $._copyArrayLike({ length: 0 }, { length: 1, 0: 10 });
        tc.areEqual(dest.length, 1);
        tc.areEqual(dest[0], 10);

        // multiple element source
        dest = $._copyArrayLike({ length: 0 }, { length: 3, 0: 10, 1: 11, 2: 12 });
        tc.areEqual(dest.length, 3);
        tc.areEqual(dest[0], 10);
        tc.areEqual(dest[1], 11);
        tc.areEqual(dest[2], 12);

        // null and undefined in source
        dest = $._copyArrayLike({ length: 0 }, { length: 4, 0: 10, 1: null, 2: undefined, 3: 13 });
        tc.areEqual(dest.length, 2);
        tc.areEqual(dest[0], 10);
        tc.areEqual(dest[1], 13);

        // cleanup existing dest
        dest = $._copyArrayLike({ length: 4, 0: 1000, 1: 1001, 2: 1002, 3: 1003 }, { length: 1, 0: 10 });
        tc.areEqual(dest.length, 1);
        tc.areEqual(dest[0], 10);
        tc.areEqual(dest[1], undefined);
        tc.areEqual(dest[2], undefined);
        tc.areEqual(dest[3], undefined);
    });

    //
    // Test Qx constructor
    //

    Tx.test("TestQxCore.testQxCtor1", function (tc) {
        var qx;

        tc.areEqual($, Qx);

        qx = $();
        tc.isTrue(qx instanceof $);
        tc.areEqual(qx.length, 0);
        tc.areEqual(qx.size(), 0);
        tc.areEqual(qx.selector, "");

        qx = $(undefined);
        tc.areEqual(qx.length, 0);
        tc.areEqual(qx.selector, "");

        qx = $(null);
        tc.areEqual(qx.length, 0);
        tc.areEqual(qx.selector, "");

        qx = $("");
        tc.areEqual(qx.length, 0);
        tc.areEqual(qx.selector, "");

        qx = $(false);
        tc.areEqual(qx.length, 0);
        tc.areEqual(qx.selector, "");

        qx = $(true);
        tc.areEqual(qx.length, 0);
        tc.areEqual(qx.selector, "");

        // HTML Element
        qx = $(_div);
        tc.areEqual(qx.length, 1);
        tc.areEqual(qx.size(), 1);
        tc.areEqual(qx[0], _div);
        tc.areEqual(qx.selector, "");

        qx = $(document);
        tc.areEqual(qx.length, 1);
        tc.areEqual(qx[0], document);
        tc.areEqual(qx.selector, "");

        // document fragment
        var fragment = document.createDocumentFragment();
        var h1 = document.createElement("h1");
        h1.innerText = "my_h1";
        fragment.appendChild(h1);
        qx = $(fragment);
        tc.areEqual(qx.length, 1);
        tc.areEqual(qx[0], fragment);
        tc.areEqual(qx.selector, "");

        qx = $(window);
        tc.areEqual(qx.length, 1);
        tc.areEqual(qx[0], window);
        tc.areEqual(qx.selector, "");

        qx = $("body");
        tc.areEqual(qx.length, 1);
        tc.areEqual(qx[0], document.body);
        tc.areEqual(qx.selector, "body");

        // test cloning
        var qxwin = $(window);
        qx = $(qxwin);
        tc.areEqual(qx.length, 1);
        tc.areEqual(qx[0], window);
        tc.areNotEqual(qx, qxwin); // qxwin should be cloned
        tc.areEqual(qx.selector, "");

        var obj = {};
        qx = $(obj);
        tc.areEqual(qx.length, 1);
        tc.areEqual(qx[0], obj);
        tc.areEqual(qx.selector, "");
    });

    Tx.test("TestQxCore.testQxCtor2", function (tc) {
        var qx, qx2, e;

        // Create an HTML fragment for this test.
        // Ensure there are no other <abbr> elements is this document.
        document.body.insertAdjacentHTML("beforeEnd",
            '<div id="idQxCtor2">' +
                '<abbr></abbr>' +
                '<p></p>' +
                '<abbr class="QxCtor2-abbr"></abbr>' +
                '<p><span class="QxCtor2-span"></span></p>' +
            '</div>'
            );

        // element selector
        e = document.getElementById("idQxCtor2");
        qx = $(e);
        tc.areEqual(qx.length, 1);
        tc.areEqual(qx.size(), 1);
        tc.areEqual(qx[0], e);
        tc.areEqual(qx.selector, "");

        // "body" selector - special case
        qx = $("body");
        tc.areEqual(qx.length, 1);
        tc.areEqual(qx[0], document.body);
        tc.areEqual(qx.selector, "body");

        // ID selector
        qx = $("#idQxCtor2");
        tc.areEqual(qx.length, 1);
        tc.areEqual(qx[0], e);
        tc.areEqual(qx.selector, "#idQxCtor2");

        // selector returns multiple elements
        qx = $("abbr");
        tc.areEqual(qx.length, 2);
        tc.areEqual(qx.size(), 2);
        tc.areEqual(qx[0].tagName, "ABBR");
        tc.areEqual(qx[1].tagName, "ABBR");
        tc.areEqual(qx.selector, "abbr");

        // all caps selector
        qx = $("ABBR");
        tc.areEqual(qx.length, 2);
        tc.areEqual(qx[0].tagName, "ABBR");
        tc.areEqual(qx[1].tagName, "ABBR");
        tc.areEqual(qx.selector, "ABBR");

        // $.size
        tc.areEqual(qx.size(), 2);

        // non-trivial selector
        qx = $("p > span.QxCtor2-span");
        tc.areEqual(qx.length, 1);
        tc.areEqual(qx[0].tagName, "SPAN");
        tc.areEqual(qx.selector, "p > span.QxCtor2-span");

        // multiple Qx instances
        qx = $("abbr");
        qx2 = $("abbr.QxCtor2-abbr");
        tc.areEqual(qx.length, 2);
        tc.areEqual(qx2.length, 1);
        tc.areNotEqual(qx, qx2);
        tc.areEqual(qx.selector, "abbr");
        tc.areEqual(qx2.selector, "abbr.QxCtor2-abbr");

        _removeHTML("idQxCtor2");
    });

    Tx.test("TestQxCore.testQxCtorArray", function (tc) {
        var qx, e, arr;

        // Create an HTML fragment for this test.
        document.body.insertAdjacentHTML("beforeEnd",
            '<div id="idQxCtorArray">' +
                '<p></p>' +
            '</div>'
            );

        // array of one element
        e = document.getElementById("idQxCtorArray");
        arr = [e];
        qx = $(arr);
        tc.areEqual(qx.length, 1);
        tc.areEqual(qx[0], e);
        tc.areEqual(qx.selector, "");

        // array of two elements
        qx = $([e, e.firstChild]);
        tc.areEqual(qx.length, 2);
        tc.areEqual(qx[0], e);
        tc.areEqual(qx[1], e.firstChild);
        tc.areEqual(qx[1].tagName, "P");

        // array with null and undefined
        qx = $([e, undefined, e.firstChild, null]);
        tc.areEqual(qx.length, 2);
        tc.areEqual(qx[0], e);
        tc.areEqual(qx[1], e.firstChild);

        // $TODO test arrays with functions, regex, other arrays, numbers, strings, window, bools, ...

        _removeHTML("idQxCtorArray");
    });

    Tx.test("TestQxCore.testQxCtorContext", function (tc) {
        var qx, e;

        // Create an HTML fragment for this test.
        document.body.insertAdjacentHTML("beforeEnd",
            '<div id="idQxCtorContext">' +
                '<div></div>' +
                '<pre id="idQxCtorContext2">x</pre>' +
            '</div>'
            );

        // Constructor with context
        e = document.getElementById("idQxCtorContext");
        qx = $("div", e); // equivalent to  $(e).find("div")
        tc.areEqual(qx.length, 1);
        tc.areEqual(qx[0], e.firstChild);
        tc.areEqual(qx.selector, "");

        // $TODO Constructor with context array
        /*
        e = document.getElementById("idQxCtorContext");
        qx = $("div", [e, e]); // equivalent to  $([e,e]).find("div")
        tc.areEqual(qx.length, 1);
        tc.areEqual(qx[0], e.firstChild);
        */
        qx = $("#idQxCtorContext2", e);
        tc.areEqual(qx.length, 1);
        tc.areEqual(qx[0].tagName, "PRE");
        tc.areEqual(qx.selector, "");

        // $TODO test other types of contexts

        _removeHTML("idQxCtorContext");
    });

    //
    // Test Qx prototype methods and properties
    //

    Tx.test("TestQxCore.testCtorFragment", function (tc) {
        var qx;

        qx = $("<div>");
        tc.areEqual(qx.length, 1);
        tc.isTrue(qx[0] instanceof HTMLDivElement);
        tc.areEqual(qx.selector, "");

        qx = $("<div>foo</div>");
        tc.areEqual(qx.length, 1);
        tc.isTrue(qx[0] instanceof HTMLDivElement);
        tc.areEqual(qx[0].innerHTML, "foo");

        qx = $("<div>foo</div><span>bar</span>");
        tc.areEqual(qx.length, 2);
        tc.isTrue(qx[0] instanceof HTMLDivElement);
        tc.areEqual(qx[0].innerHTML, "foo");
        tc.isTrue(qx[1] instanceof HTMLSpanElement);
        tc.areEqual(qx[1].innerHTML, "bar");

        qx = $("<div>foo<b>bar</b>baz</div>");
        tc.areEqual(qx.length, 1);
        tc.isTrue(qx[0] instanceof HTMLDivElement);
        tc.areEqual(qx[0].innerHTML, "foo<b>bar</b>baz");
    });

    // Test Qx.fn extensibility
    Tx.test("TestQxCore.testFn", function (tc) {
        tc.areEqual($.fn, $.prototype);

        $.fn.utTestFn = "testFn";
        tc.areEqual($().utTestFn, "testFn");

        $.fn.utTestFn = function () {
            tc.isTrue(this instanceof $);
            tc.areEqual(this[0], document.body);
            return 99;
        };

        tc.areEqual($("body").utTestFn(), 99);

        delete $.fn.utTestFn;
    });

    Tx.test("TestQxCore.testReady", function (tc) {
        var qx, handlerCalled = 0;

        // $(fn) is equivalent to $(document).ready(fn)

        // in UTs at this point "DOMContentReady is already fired so the handler is called sync
        qx = $(function () {
            handlerCalled++;
            tc.isTrue(this === window);
            tc.isTrue(arguments.length === 0);
        });

        tc.areEqual(qx.length, 1);
        tc.areEqual(qx[0], document);
        tc.areEqual(qx.selector, "");
        // tc.areEqual(handlerCalled, 1); // $TODO make it async

        qx = $(document).ready(function () {
            handlerCalled++;
            tc.isTrue(this === window);
            tc.isTrue(arguments.length === 0);
        });

        tc.areEqual(qx.length, 1);
        tc.areEqual(qx[0], document);
        tc.areEqual(qx.selector, "");
        // tc.areEqual(handlerCalled, 2); // $TODO make it async
    });

    Tx.test("TestQxCore.testEach", function (tc) {
        var len = 0, div = document.createElement("div");
        div.innerHTML = '<span class="0"></span><p>b</p><span class="1">c</span>';

        $("span", div).each(function (i, e) {
            tc.isTrue(e instanceof HTMLSpanElement);
            tc.areEqual(e, this);
            tc.areEqual(e.className, String(i));
            len++;
        });

        tc.areEqual(len, 2);
    });

    Tx.test("TestQxCore.testGet", function (tc) {
        var qx, div = document.createElement("div"),
            p0 = document.createElement("p"),
            p1 = document.createElement("p");

        div.appendChild(p0);
        div.appendChild(p1);

        qx = $(div);
        tc.areEqual(qx.length, 1);
        tc.areEqual(qx.get(0), div);
        tc.areEqual(qx[0], div);

        qx = $("p", div);
        tc.areEqual(qx.length, 2);
        tc.areEqual(qx.get(0), p0);
        tc.areEqual(qx.get(1), p1);
        tc.areEqual(qx[0], p0);
        tc.areEqual(qx[1], p1);
    });

    Tx.test("TestQxCore.testPush", function (tc) {
        var qx,
            p0 = document.createElement("p"),
            p1 = document.createElement("p");

        qx = $();
        tc.areEqual(qx.length, 0);

        qx.push(p0);
        tc.areEqual(qx.length, 1);
        tc.areEqual(qx.get(0), p0);

        qx.push(p1);
        tc.areEqual(qx.length, 2);
        tc.areEqual(qx.get(0), p0);
        tc.areEqual(qx.get(1), p1);
    });

    Tx.test("TestQxCore.testFind", function (tc) {
        var qx, div = document.createElement("div"),
            p0 = document.createElement("p"),
            p1 = document.createElement("p"),
            span = document.createElement("span");

        div.appendChild(p0);
        div.appendChild(span);
        div.appendChild(p1);

        qx = $(div).find("p");
        tc.areEqual(qx.length, 2);
        tc.areEqual(qx[0], p0);
        tc.areEqual(qx[1], p1);

        qx = $(div).find("span");
        tc.areEqual(qx.length, 1);
        tc.areEqual(qx[0], span);

        qx = $(div).find("a");
        tc.areEqual(qx.length, 0);
    });

    Tx.test("TestQxCore.testEq", function (tc) {
        var qx, div = document.createElement("div"),
            p0 = document.createElement("p"),
            p1 = document.createElement("p");

        div.appendChild(p0);
        div.appendChild(p1);

        qx = $("p", div);
        tc.areEqual(qx.length, 2);
        tc.areEqual(qx[0], p0);
        tc.areEqual(qx[1], p1);

        // Reduce to p1
        qx = $("p", div).eq(1);
        tc.areEqual(qx.length, 1);
        tc.areEqual(qx[0], p1);

        // Reduce to non existent
        qx = $("p", div).eq(4);
        tc.areEqual(qx.length, 0);

        // Reduce to negative - not implemented yet
        // qx = $("p", div).eq(-1);
        // tc.areEqual(qx.length, 1);

        // Reduce an empty query
        qx = $().eq(0);
        tc.areEqual(qx.length, 0);
    });

    Tx.test("TestQxCore.testFirstLast", function (tc) {
        var qx, div = document.createElement("div"),
            p0 = document.createElement("p"),
            p1 = document.createElement("p"),
            p2 = document.createElement("p");

        div.appendChild(p0);
        div.appendChild(p1);
        div.appendChild(p2);

        qx = $("p", div);
        tc.areEqual(qx.length, 3);
        tc.areEqual(qx[0], p0);
        tc.areEqual(qx[1], p1);
        tc.areEqual(qx[2], p2);

        // Reduce to first
        qx = $("p", div).first();
        tc.areEqual(qx.length, 1);
        tc.areEqual(qx[0], p0);

        // Reduce to last
        qx = $("p", div).last();
        tc.areEqual(qx.length, 1);
        tc.areEqual(qx[0], p2);

        // Reduce an empty query
        qx = $().first();
        tc.areEqual(qx.length, 0);
        qx = $().last();
        tc.areEqual(qx.length, 0);
    });

    Tx.test("TestQxCore.testEmpty", function (tc) {
        var div = document.createElement("div");

        div.innerHTML = '<span>text1</span>x<p></p>';
        $("span", div).empty();
        tc.areEqual(div.outerHTML, "<div><span></span>x<p></p></div>");

        div.innerHTML = '<span><p>te<b>x</b>t1</p></span><span><p>text2</p></span>';
        $("p", div).empty();
        tc.areEqual(div.outerHTML, '<div><span><p></p></span><span><p></p></span></div>');
    });

    Tx.test("TestQxCore.testRemove", function (tc) {
        var div = document.createElement("div");

        div.innerHTML = '<span>text1</span>x<p></p>';
        $("span", div).remove();
        tc.areEqual(div.outerHTML, "<div>x<p></p></div>");

        div.innerHTML = '<span><p>text1</p></span><span><p>text2</p></span>';
        $("p", div).remove();
        tc.areEqual(div.outerHTML, '<div><span></span><span></span></div>');
    });

    Tx.test("TestQxCore.testHasClass", function (tc) {
        var div = document.createElement("div"),
            qx = $(div);

        // Verify hasClass on an empty Qx object
        tc.isFalse($().hasClass("foo"));

        // Verify that none of the classes are there
        tc.areEqual(div.className, "");
        tc.isFalse(qx.hasClass("class_a"));
        tc.isFalse(qx.hasClass("class_b"));
        tc.isFalse(qx.hasClass("class_c"));

        // Remove a class that isn't there. Nothing should change.
        qx.removeClass("class_a");
        tc.areEqual(div.className, "");
        tc.isFalse(qx.hasClass("class_a"));
        tc.isFalse(qx.hasClass("class_b"));
        tc.isFalse(qx.hasClass("class_c"));

        // Add one class. One that one should be there.
        qx.addClass("class_a");
        tc.areEqual(div.className, "class_a");
        tc.isTrue(qx.hasClass("class_a"));
        tc.isFalse(qx.hasClass("class_b"));
        tc.isFalse(qx.hasClass("class_c"));

        // Add other classes. They should all be there.
        qx.addClass("class_b");
        qx.addClass("class_c");
        tc.areEqual(div.className, "class_a class_b class_c");
        tc.isTrue(qx.hasClass("class_a"));
        tc.isTrue(qx.hasClass("class_b"));
        tc.isTrue(qx.hasClass("class_c"));

        // Remove one class.  It should be gone.  The others should still be there.
        qx.removeClass("class_b");
        tc.areEqual(div.className, "class_a class_c");
        tc.isTrue(qx.hasClass("class_a"));
        tc.isFalse(qx.hasClass("class_b"));
        tc.isTrue(qx.hasClass("class_c"));

        // Remove the other classes.  They should all be gone
        qx.removeClass("class_a");
        qx.removeClass("class_c");
        tc.areEqual(div.className, "");
        tc.isFalse(qx.hasClass("class_a"));
        tc.isFalse(qx.hasClass("class_b"));
        tc.isFalse(qx.hasClass("class_c"));

        // Toggle class
        qx.toggleClass("class_a");
        tc.areEqual(div.className, "class_a");
        qx.toggleClass("class_b");
        tc.areEqual(div.className, "class_a class_b");
        qx.toggleClass("class_a");
        tc.areEqual(div.className, "class_b");
        qx.toggleClass("class_b");
        tc.areEqual(div.className, "");

        // Toggle class with condition
        qx.toggleClass("class_a", false);
        tc.areEqual(div.className, "");
        qx.toggleClass("class_a", 5);
        tc.areEqual(div.className, "class_a");
        qx.toggleClass("class_a", "hello");
        tc.areEqual(div.className, "");
        qx.toggleClass("class_a", true);
        tc.areEqual(div.className, "class_a");
        qx.toggleClass("class_a", null);
        tc.areEqual(div.className, "class_a");
        qx.toggleClass("class_a", div);
        tc.areEqual(div.className, "");
    });

    Tx.test("TestQxCore.testHTML", function (tc) {
        var qx, div = document.createElement("div");

        // $TODO
        //qx = $().html();
        //tc.areEqual(qx, "");

        qx = $(div).html();
        tc.areEqual(qx, "");

        qx = $(div).html("<p>1</p><p>2</p>");
        tc.areEqual(div.outerHTML, "<div><p>1</p><p>2</p></div>");

        qx = $(div).html("<p>1</p><p>2</p>").find("p").html("#");
        tc.areEqual(div.outerHTML, "<div><p>#</p><p>#</p></div>");
    });

    Tx.test("TestQxCore.testText", function (tc) {
        var qx, div = document.createElement("div");

        // $TODO
        //qx = $().text();
        //tc.areEqual(qx, "");

        qx = $(div).text();
        tc.areEqual(qx, "");

        qx = $(div).text("1");
        tc.areEqual(div.outerHTML, "<div>1</div>");

        qx = $(div).html("<p>1</p><p>2</p>").find("p").text("#");
        tc.areEqual(div.outerHTML, "<div><p>#</p><p>#</p></div>");
    });

    Tx.test("TestQxCore.testVal", function (tc) {
        _setFixture(
            '<input id="idQxInput1" value="Foo"/>' +
            '<input id="idQxInput2" value="Baz"/>'
            );

        // test existing value
        tc.areEqual($("#idQxInput1").val(), "Foo", "Verify input value: Foo");

        // test set value
        $("#idQxInput1").val("Bar");
        tc.areEqual($("#idQxInput1").val(), "Bar", "Verify input value: Bar");

        // test set empty string value
        $("#idQxInput1").val("");
        tc.areEqual($("#idQxInput1").val(), "", "Verify input value: empty string");

        // test non existing element
        tc.areEqual($("#non_exiting_234876928").val(), undefined, "Verify value on non existing element");

        // test set value on multiple elements
        $("#idQxFixture input").val("aaa");
        tc.areEqual($("#idQxInput1").val(), "aaa", "Verify input value: 1 aaa");
        tc.areEqual($("#idQxInput2").val(), "aaa", "Verify input value: 2 aaa");

        // TODO: test <select>

        _removeFixture();
    });

    Tx.test("TestQxCore.testAttr", function (tc) {
        _setFixture(
            '<div id="idQxDiv1" class="attr-class" tabindex="99"></div>' +
            '<div id="idQxDiv2"></div>' + 
            '<a id="idQxA1"></a>'
            );

        // test existing attr
        tc.areEqual($("#idQxDiv1").attr("id"), "idQxDiv1", "Verify id");
        tc.areEqual($("#idQxDiv1").attr("class"), "attr-class", "Verify class");
        tc.areEqual($("#idQxDiv1").attr("tabindex"), "99", "Verify tabindex");

        // test set attr
        $("#idQxDiv1").attr("class", "AAA");
        tc.areEqual($("#idQxDiv1").attr("class"), "AAA", "Verify class AAA");
        $("#idQxDiv1").attr("tabindex", 44);
        tc.areEqual($("#idQxDiv1").attr("tabindex"), "44", "Verify tabindex 44");
        $("#idQxA1").attr("href", "/file.js");
        tc.areEqual($("#idQxA1").attr("href"), "/file.js", "Verify href /file.js");

        // test remove attr
        $("#idQxA1").removeAttr("href");
        tc.areEqual($("#idQxA1").attr("href"), null, "Verify remove href");
        $("#idQxA1").removeAttr("nonexisting3874628");

        // test non existing element
        tc.areEqual($("#non_exiting_234876928").attr("id"), undefined, "Verify attr on non existing element");

        // test attr on multiple elements
        $("#idQxFixture div").attr("class", "bbb");
        tc.areEqual($("#idQxDiv1").attr("class"), "bbb", "Verify div1 class bbb");
        tc.areEqual($("#idQxDiv2").attr("class"), "bbb", "Verify div2 class bbb");

        _removeFixture();
    });

    Tx.test("TestQxCore.testInsertHTML", function (tc) {
        var div = document.createElement("div");

        $(div).html('<p>#</p>').find("p").before("before").prepend("prepend").append("append").after("after");
        tc.areEqual(div.outerHTML, "<div>before<p>prepend#append</p>after</div>");

        div.innerHTML = "";

        $(div).html('<p>#</p><p>*</p>').find("p").before("1").prepend("2").append("3").after("4");
        tc.areEqual(div.outerHTML, "<div>1<p>2#3</p>41<p>2*3</p>4</div>");
    });

    Tx.test("TestQxCore.testCamelCase", function (tc) {
        tc.areEqual($._camelCase("color"), "color");
        tc.areEqual($._camelCase("overflow-y"), "overflowY");
        tc.areEqual($._camelCase("-ms-overflow-style"), "msOverflowStyle");
        // $TODO needs more tests
    });

    Tx.test("TestQxCore.testCss", function (tc) {
        var qx;

        // test empty Qx
        $().css();

        // $().css(""); // $TODO fix it

        $("body").append('<div id="idQxTestCss" class="cls1">Hello</div>');
        _addStyle("testCss", ".cls1 { font: 24px Tahoma; }");

        qx = $("#idQxTestCss");
        tc.areEqual(qx.css("font-size"), "24px");

        qx.css("color", "red");
        tc.areEqual(qx.css("color"), "red");

        qx.css({ width: "10px", height: "15px" });
        tc.areEqual(qx.css("width"), "10px");
        tc.areEqual(qx.css("height"), "15px");

        // $TODO investigate if there are styles that are not respecting the camel case rule

        // $TODO - needs more tests

        _removeHTML("idQxTestCss");
        _removeStyle("testCss");
    });

    Tx.test("TestQxCore.testId", function (tc) {
        // test non existing element id
        tc.areEqual($.id("non_existing_element_id_4276398127"), null);

        // test existing element id and name, case insensitive
        
        _setFixture('<div id="idQxTestId"><span></span></div>');
        $("#idQxTestId span")[0].name = "idQxTestId2";

        tc.isTrue($.id("idQxTestId") instanceof HTMLDivElement);
        tc.areEqual($.id("idqxtestid"), null); // case sensitive
        tc.areEqual($.id("idQxTestId2"), null); // name should not work
        tc.areEqual($.id("idqxtestid2"), null); // name should not work

        _removeFixture();
    });

    Tx.test("TestQxCore.testEvents", function (/*tc*/) {
        // test on/off args
        var qx = $("body");

        qx.on("", $.noop);
        qx.off("", $.noop);

        qx.on({});
        qx.off({});
    });

    Tx.test("TestQxCore.testEvents1", function (tc) {
        // one element, one event, one handler
        var handler1Called = 0,
            qx, elem1;

        $("body").append('<div id="idQxTestEvents1">1</div>');

        function handler1() {
            handler1Called++;
            tc.areEqual(this, elem1, "Verify this in handler1");
        }

        qx = $("#idQxTestEvents1");
        tc.areEqual(qx.length, 1);
        elem1 = qx[0];
        tc.areEqual(elem1.id, "idQxTestEvents1");

        // add one handler and click on the element
        qx.on("click", handler1);
        qx.click();
        tc.areEqual(handler1Called, 1, "Verify handler1Called is called");

        // remove the handler and click on the element
        qx.off("click", handler1);
        qx.click();
        tc.areEqual(handler1Called, 1, "Verify handler1Called is not called");

        _removeHTML("idQxTestEvents1");
    });

    Tx.test("TestQxCore.testEvents2", function (tc) {
        // two elements, one event, one handler
        var handler1Called = 0,
            qx, elem1, elem2;

        $("body").append('<div id="idQxTestEvents2"><div id="idQx11">11</div><div id="idQx22">22</div></div>');

        function handler1(ev) {
            handler1Called++;
            tc.areEqual(this, ev.target, "Verify ev.target in handler1");
            tc.isTrue(this === elem1 || this === elem2, "Verify this in handler1");
        }

        qx = $("div", "#idQxTestEvents2");
        tc.areEqual(qx.length, 2);
        elem1 = qx[0];
        elem2 = qx[1];
        tc.areEqual(elem1.id, "idQx11");
        tc.areEqual(elem2.id, "idQx22");

        // add one handler
        qx.on("click", handler1);

        // click elem1
        $(elem1).click();
        tc.areEqual(handler1Called, 1, "Verify handler1Called is called for elem1");

        // click elem2
        $(elem2).click();
        tc.areEqual(handler1Called, 2, "Verify handler1Called is called for elem2");

        // remove the handler and click on the elements
        qx.off("click", handler1);
        $(elem1).click();
        $(elem2).click();

        tc.areEqual(handler1Called, 2, "Verify handler1Called is not called");

        _removeHTML("idQxTestEvents2");
    });

    Tx.test("TestQxCore.testEvents3", function (tc) {
        // one element, event map with two events and two handlers
        var handler1Called = 0,
            handler2Called = 0,
            qx, elem1;

        $("body").append('<div id="idQxTestEvents3">333</div>');

        function handler1() {
            handler1Called++;
            tc.areEqual(this, elem1, "Verify this in handler1");
        }

        function handler2() {
            handler2Called++;
            tc.areEqual(this, elem1, "Verify this in handler2");
        }

        qx = $("#idQxTestEvents3");
        tc.areEqual(qx.length, 1);
        elem1 = qx[0];
        tc.areEqual(elem1.id, "idQxTestEvents3");

        // add one handler
        qx.on({ click: handler1, mousedown: handler2 });

        // click on the element
        qx.click();
        tc.areEqual(handler1Called, 1, "Verify handler1Called calls");
        tc.areEqual(handler2Called, 0, "Verify handler2Called calls");

        // mousedown on the element
        $(elem1).mousedown();
        tc.areEqual(handler1Called, 1, "Verify handler1Called calls");
        tc.areEqual(handler2Called, 1, "Verify handler2Called calls");

        // remove the handler and click on the element
        qx.off({ click: handler1, mousedown: handler2 });

        // fire events and verify handlers
        $(elem1).click().mousedown();
        tc.areEqual(handler1Called, 1, "Verify handler1Called calls");
        tc.areEqual(handler2Called, 1, "Verify handler2Called calls");

        _removeHTML("idQxTestEvents2");
    });

    Tx.test("TestQxCore.testQxEvent", function (tc) {
        var ev;

        ev = $.Event("click");
        tc.isTrue(ev instanceof Event);
        tc.areEqual(ev.bubbles, true);

        ev = $.Event("mouseover", { bubbles: true });
        tc.isTrue(ev instanceof Event);
        tc.areEqual(ev.bubbles, true);

        ev = $.Event("mousemove", { bubbles: false });
        tc.isTrue(ev instanceof Event);
        tc.areEqual(ev.bubbles, false);

        ev = $.Event("load", { bubbles: 0 });
        tc.isTrue(ev instanceof Event);
        tc.areEqual(ev.bubbles, false);

        ev = $.Event("resize", { bubbles: 1 });
        tc.isTrue(ev instanceof Event);
        tc.areEqual(ev.bubbles, true);
    });

    Tx.test("TestQxCore.testTrigger", function (tc) {
        var triggerCalls = 0;

        _qxEvents.split(" ").forEach(function (eventName) {
            var handlerCalled = 0;

            tc.log("event:" + eventName);

            $("body")
                .append('<button id="idQxTestTrigger1">1</button>')
                .find("#idQxTestTrigger1")
                .on(eventName, function () {
                    handlerCalled++;
                    triggerCalls++;
                    tc.isTrue(this instanceof HTMLElement);
                }).trigger(eventName);

            tc.areEqual(handlerCalled, 1);

            _removeHTML("idQxTestTrigger1");
        });

        tc.isTrue(triggerCalls > 10, "Not enough trigger calls?");
    });

    Tx.test("TestQxCore.testTriggerData", function (tc) {
        var triggerCalls = 0;

        _qxEvents.split(" ").forEach(function (eventName) {
            var handlerCalled = 0;

            tc.log("event:" + eventName);

            $("body")
                .append('<button id="idQxTestTrigger1">1</button>')
                .find("#idQxTestTrigger1")
                .on(eventName, function (ev) {
                    handlerCalled++;
                    triggerCalls++;
                    tc.isTrue(this instanceof HTMLElement);
                    tc.areEqual(ev.foo, 55);
                }).trigger(eventName, { foo: 55 });

            tc.areEqual(handlerCalled, 1);

            _removeHTML("idQxTestTrigger1");
        });

        tc.isTrue(triggerCalls > 10, "Not enough trigger calls?");
    });

    Tx.test("TestQxCore.testTrigger2", function (tc) {
        var triggerCalls = 0;

        $("body")
            .append('<div id="idQxTestTrigger1"><button>1</button><button>2</button></div>')
            .find("#idQxTestTrigger1 button")
            .utVerifyLength(tc, 2)
            .on("click", function () {
                triggerCalls++;
                tc.isTrue(this instanceof HTMLElement);
            })
            .trigger("click");

        tc.areEqual(triggerCalls, 2);

        _removeHTML("idQxTestTrigger1");
    });

    Tx.test("TestQxCore.testTriggerDelegate", function (tc) {
        var triggerCalls = 0;

        $("body")
            .append('<div id="idQxTestTrigger1"><button>1</button><button>2</button></div>')
            .find("#idQxTestTrigger1")
            .utVerifyLength(tc, 1)
            .on("click", function () {
                triggerCalls++;
                tc.isTrue(this instanceof HTMLElement);
            })
            .find("button")
            .utVerifyLength(tc, 2)
            .trigger("click");

        tc.areEqual(triggerCalls, 2);

        _removeHTML("idQxTestTrigger1");
    });

    Tx.test("TestQxCore.testKnownEvents", function (tc) {
        // one element, one event, one handler
        var handler1Called = 0,
            qx, elem1;

        _setFixture('<div id="idQxTest">1</div>');

        function handler1() {
            handler1Called++;
            tc.areEqual(this, elem1, "Verify this in handler1");
        }

        qx = $("#idQxTest").utVerifyLength(tc, 1);
        elem1 = qx[0];

        // add one handler using known events API and click on the element
        qx.click(handler1);
        qx.click();
        tc.areEqual(handler1Called, 1, "Verify handler1Called is called");

        qx.off("click", handler1);
        qx.click();
        tc.areEqual(handler1Called, 1, "Verify handler1Called is not called");

        _removeFixture();
    });

    // $TODO - needs more events tests

    // $TODO test that existing window.$ is not overriden
})();
