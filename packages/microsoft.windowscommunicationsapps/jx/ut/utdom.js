
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Dom UTs

/// <reference path="Dom.js" />

/*global Debug,ScriptEngineMajorVersion,document,window,Jx,Tx*/

(function () {

    // Verify that an assert fires when calling fn(). Do nothing in non-debug builds.
    function verifyAssert(tc, fn) {
        var lastError;
        if (Debug.hasOwnProperty("assert")) {
            try {
                Debug.throwOnAssert = true;
                fn();
            }
            catch (e) {
                Debug.throwOnAssert = false;
                lastError = e;
            }
            tc.isTrue(lastError instanceof Debug.AssertError);
        }
    }

    Tx.test("DomTests.testHosting", function (tc) {
        tc.isTrue(ScriptEngineMajorVersion() >= 11, "Not running JScript 11+");
        tc.isTrue(document.documentMode >= 11, "Document mode not IE11+ standards mode");
        tc.isTrue(window.toString() === "[object Window]", "FastDOM is not enabled");
    });

    Tx.test("DomTests.testIsHTMLElement", function (tc) {
        var div = document.createElement("div");

        tc.isTrue(Jx.isHTMLElement(div));

        tc.isFalse(Jx.isHTMLElement(0));
        tc.isFalse(Jx.isHTMLElement(5));
        tc.isFalse(Jx.isHTMLElement(-3));
        tc.isFalse(Jx.isHTMLElement(8.3));
        tc.isFalse(Jx.isHTMLElement(4e7));
        tc.isFalse(Jx.isHTMLElement(Number()));
        tc.isFalse(Jx.isHTMLElement(Number(5)));
        tc.isFalse(Jx.isHTMLElement(Number.MAX_VALUE));
        tc.isFalse(Jx.isHTMLElement(Number.MIN_VALUE));
        tc.isFalse(Jx.isHTMLElement(Number.NEGATIVE_INFINITY));
        tc.isFalse(Jx.isHTMLElement(Number.POSITIVE_INFINITY));
        tc.isFalse(Jx.isHTMLElement(Infinity));
        tc.isFalse(Jx.isHTMLElement(NaN)); // NaN (not a number) type's is number
        tc.isFalse(Jx.isHTMLElement(new Number())); // new Number() is an object
        tc.isFalse(Jx.isHTMLElement(new Number(5))); // new Number() is an object
        tc.isFalse(Jx.isHTMLElement([]));
        tc.isFalse(Jx.isHTMLElement([1, 2, 3]));
        tc.isFalse(Jx.isHTMLElement(new Array()));
        tc.isFalse(Jx.isHTMLElement(new String()));
        tc.isFalse(Jx.isHTMLElement(new Boolean()));
        tc.isFalse(Jx.isHTMLElement(new Date()));
        tc.isFalse(Jx.isHTMLElement(Date()));
        tc.isFalse(Jx.isHTMLElement(window));
        tc.isFalse(Jx.isHTMLElement(this));
        tc.isFalse(Jx.isHTMLElement(/a/)); // regular expressions
        tc.isFalse(Jx.isHTMLElement());
        tc.isFalse(Jx.isHTMLElement(undefined));
        tc.isFalse(Jx.isHTMLElement(null));
        tc.isFalse(Jx.isHTMLElement(""));
        tc.isFalse(Jx.isHTMLElement("123"));
        tc.isFalse(Jx.isHTMLElement(true));
        tc.isFalse(Jx.isHTMLElement(false));
        tc.isFalse(Jx.isHTMLElement(function () { }));
    });

    Tx.test("DomTests.testClassFunctions", function (tc) {
        var div = document.createElement("div");
        tc.isTrue(Jx.isHTMLElement(div));

        // Verify that none of the classes are there
        tc.isFalse(Jx.isNonEmptyString(div.className.trim()));
        tc.isFalse(Jx.hasClass(div, "class_a"));
        tc.isFalse(Jx.hasClass(div, "class_b"));
        tc.isFalse(Jx.hasClass(div, "class_c"));

        // Remove a class that isn't there.  Nothing should change.
        tc.isFalse(Jx.removeClass(div, "class_a"));
        tc.isFalse(Jx.isNonEmptyString(div.className.trim()));
        tc.isFalse(Jx.hasClass(div, "class_a"));
        tc.isFalse(Jx.hasClass(div, "class_b"));
        tc.isFalse(Jx.hasClass(div, "class_c"));

        // Add one class.  Only that one should be there.
        tc.isTrue(Jx.addClass(div, "class_a"));
        tc.isTrue(Jx.isNonEmptyString(div.className.trim()));
        tc.isTrue(Jx.hasClass(div, "class_a"));
        tc.isFalse(Jx.hasClass(div, "class_b"));
        tc.isFalse(Jx.hasClass(div, "class_c"));

        // Add the same class again. Nothing should change.
        var classNameBefore = div.className.trim();
        tc.isFalse(Jx.addClass(div, "class_a"));
        tc.isTrue(div.className.trim() === classNameBefore);

        // Add other classes.  They should all be there.
        tc.isTrue(Jx.addClass(div, "class_b"));
        tc.isTrue(Jx.addClass(div, "class_c"));
        tc.isTrue(Jx.isNonEmptyString(div.className.trim()));
        tc.isTrue(Jx.hasClass(div, "class_a"));
        tc.isTrue(Jx.hasClass(div, "class_b"));
        tc.isTrue(Jx.hasClass(div, "class_c"));

        // Remove one class.  It should be gone.  The others should still be there.
        tc.isTrue(Jx.removeClass(div, "class_b"));
        tc.isTrue(Jx.isNonEmptyString(div.className.trim()));
        tc.isTrue(Jx.hasClass(div, "class_a"));
        tc.isFalse(Jx.hasClass(div, "class_b"));
        tc.isTrue(Jx.hasClass(div, "class_c"));

        // Remove the other classes.  They should all be gone
        tc.isTrue(Jx.removeClass(div, "class_a"));
        tc.isTrue(Jx.removeClass(div, "class_c"));
        tc.isFalse(Jx.isNonEmptyString(div.className.trim()));
        tc.isFalse(Jx.hasClass(div, "class_a"));
        tc.isFalse(Jx.hasClass(div, "class_b"));
        tc.isFalse(Jx.hasClass(div, "class_c"));

        // Set class 'on' - ensure it's not there
        Jx.setClass(div, "class_a", false);
        tc.isFalse(Jx.hasClass(div, "class_a"));

        // Set class 'off' - ensure it's there
        Jx.setClass(div, "class_a", true);
        tc.isTrue(Jx.hasClass(div, "class_a"));
    });

    Tx.test("DomTests.testParseHash", function (tc) {
        var v, ph = Jx.parseHash;

        function len(o) {
            return Object.keys(o).length;
        }

        v = ph("");
        tc.areEqual(len(v), 0);

        v = ph("&&&&");
        tc.areEqual(len(v), 0);

        v = ph("=");
        tc.areEqual(len(v), 0);

        v = ph("a");
        tc.areEqual(len(v), 1);
        tc.areEqual(v.a, undefined);

        v = ph("foo=55");
        tc.areEqual(len(v), 1);
        tc.areEqual(v.foo, "55");

        v = ph("foo=bar");
        tc.areEqual(len(v), 1);
        tc.areEqual(v.foo, "bar");

        v = ph("x=1&y=x");
        tc.areEqual(len(v), 2);
        tc.areEqual(v.x, "1");
        tc.areEqual(v.y, "x");

        v = ph("x=1&z&y=x");
        tc.areEqual(len(v), 3);
        tc.areEqual(v.x, "1");
        tc.areEqual(v.y, "x");
        tc.areEqual(v.z, undefined);

        v = ph("&a=b&&");
        tc.areEqual(len(v), 1);
        tc.areEqual(v.a, "b");

        verifyAssert(tc, function () {
            v = ph("a=b=1");
        });
    });

    Tx.test("DomTests.testIsRtl", function (tc) {
        /// <summary>
        /// Tests that isRtl function is returning correct value based on direction
        /// </summary>

        // Save the original value for direction
        var originalDirection = document.body.currentStyle.direction;
        try {
            document.body.style.direction = "ltr";
            tc.isFalse(Jx.isRtl(), "Incorrect detection for LTR");
            document.body.style.direction = "rtl";
            tc.isTrue(Jx.isRtl(), "Incorrect detection for RTL");
        } finally {
            // Reset the value for direction
            document.body.style.direction = originalDirection;
        }
    });

    // TODO: fix this
    Tx.noop("DomTests.testSafeSetActive", function (tc) {
        /// <summary>
        /// Tests that safeSetActive() function passes and fails as expected, without throwing.
        /// </summary>

        var div = document.createElement("div");
        tc.isFalse(Jx.safeSetActive(div));

        document.body.appendChild(div);
        tc.isFalse(Jx.safeSetActive(div));

        div.setAttribute("tabIndex", 0);
        tc.isTrue(Jx.safeSetActive(div));
        tc.isTrue(document.activeElement === div);

        div.disabled = true;
        tc.isFalse(Jx.safeSetActive(div));
        tc.isTrue(document.activeElement !== div);

        div.disabled = false;
        Jx.addClass(div, "ut-dom-hidden");
        tc.isFalse(Jx.safeSetActive(div));

        verifyAssert(tc, function () { Jx.safeSetActive(); });
        verifyAssert(tc, function () { Jx.safeSetActive(null); });
        verifyAssert(tc, function () { Jx.safeSetActive(-1); });
        verifyAssert(tc, function () { Jx.safeSetActive("element"); });
        verifyAssert(tc, function () { Jx.safeSetActive({}); });
        verifyAssert(tc, function () { Jx.safeSetActive([]); });

        document.body.removeChild(div);
    });

    Tx.asyncTest("DomTests.testObserveAttribute", function (tc) {
        /// <summary>
        /// Tests that observeAttribute correctly invokes the callback on attribute change
        /// </summary>
        tc.stop();

        var element = document.createElement("div");
        element.setAttribute("ut-attribute", "old-value");

        var context = {}, async = false;
        var observer = Jx.observeAttribute(element, "ut-attribute", function (mutationRecords) {
            tc.areEqual(async, true);
            tc.areEqual(this, context);
            tc.areEqual(mutationRecords.length, 1);
            tc.areEqual(mutationRecords[0].type, "attributes");
            tc.areEqual(mutationRecords[0].attributeName, "ut-attribute");
            tc.areEqual(element.getAttribute("ut-attribute"), "new-value");

            observer.disconnect();
            tc.start();
        }, context);

        element.setAttribute("ut-attribute", "new-value");
        async = true;
    });

    Tx.asyncTest("DomTests.testObserveMutation", function (tc) {
        tc.stop();

        var element = document.createElement("div");

        var context = {};
        var observer = Jx.observeMutation(element, { childList: true }, function (mutationRecords) {
            tc.areEqual(this, context);
            tc.areEqual(mutationRecords.length, 1);
            tc.areEqual(mutationRecords[0].type, "childList");
            tc.areEqual(mutationRecords[0].addedNodes.length, 2);

            observer.disconnect();
            tc.start();
        }, context);

        element.innerHTML = "<div>Hello</div><div>World</div>";
    });
    
    function makeAddStyleToDocumentCleanupHelper(context) {
        /// <summary>
        /// Helper to cleanup dynamically created nodes from the addStyleToDocument tests
        /// </summary>

        // cleanup any nodes we still have in the tree

        if (context.node && context.node.parentNode) {
            context.node.parentNode.removeChild(context.node);
        }

        if (context.styleNode && context.styleNode.parentNode) {
            context.styleNode.parentNode.removeChild(context.styleNode);
        }

        if (context.iframe && context.iframe.parentNode) {
            context.iframe.parentNode.removeChild(context.iframe);
        }
    }

    function runAddStyleToDocumentStyleTest(tc, doc, context) {
        /// <summary>
        /// Shared code for the addStyleToDocument tests that inserts a new element, then the
        /// style (via the jx call) and validates that the style has taken effect.  The cleanup
        /// function makeAddStyleToDocumentCleanupHelper tidies up between tests.
        /// </summary>
        
        var style = ".testAddStyleToDocumentClass { color: red; }";

        // add a new (unstyled) element to the body
        var body = doc.body;
        var node = context.node = doc.createElement("div");
        node.classList.add("testAddStyleToDocumentClass");
        body.appendChild(node);

        // compute its style (shouldn't have a special color yet)
        var compStyle = window.getComputedStyle(node);
        var color = compStyle.color;
        tc.isTrue(color !== "rgb(255, 0, 0)");

        // add a style rule
        var styleNode = context.styleNode = Jx.addStyleToDocument(style, doc);
        tc.isTrue(Jx.isObject(styleNode));
        tc.isTrue(styleNode.parentNode === doc.head);

        // check its style again (it should be red)
        compStyle = window.getComputedStyle(node);
        color = compStyle.color;
        tc.isTrue(color === "rgb(255, 0, 0)");
    }

    Tx.test("DomTests.testAddStyleToDocument", { owner: "anselr" }, function (tc) {
        /// <summary>
        /// Tests inserting styles into the current document using addStyleToDocument
        /// </summary>

        var context = {
            node: null,
            styleNode: null,
        };

        tc.cleanup = makeAddStyleToDocumentCleanupHelper.bind(context);

        runAddStyleToDocumentStyleTest(tc, document, context);

        // let the context cleanup
    });
        
    Tx.test("DomTests.testAddStyleToDocumentWithIFrame", { owner: "anselr" }, function (tc) {
        /// <summary>
        /// Tests inserting styles into an iframe document using addStyleToDocument
        /// </summary>

        var context = {
            node: null,
            styleNode: null,
            iframe: null,
        };

        tc.cleanup = makeAddStyleToDocumentCleanupHelper.bind(context);

        // add an iframe to use in place of the document
        var outerBody = document.body;
        var iframe = context.iframe = document.createElement("iframe");
        outerBody.appendChild(iframe);

        runAddStyleToDocumentStyleTest(tc, iframe.contentDocument, context);

        // let the context cleanup
    });

}());
