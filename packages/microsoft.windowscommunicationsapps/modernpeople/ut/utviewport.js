
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,Jx,People,Mocks,MockJobSet*/

Include.initializeFileScope(function () {

    var P = People;

    var divPlayArea = null;

    function setup () {
        if (!Jx.app) {
            Jx.app = new Jx.Application();
        }
        divPlayArea = document.createElement("div");
        document.body.appendChild(divPlayArea);
    }

    function cleanup () {
        if (divPlayArea !== null) {
            document.body.removeChild(divPlayArea);
            divPlayArea = null;
        }
    }

    Tx.asyncTest("viewportTests.testScrollingViewport", function (tc) {
        // Async test should call tc.stop to specify how many semiphores to wait on. There are 5 async callbacks in this test. 
        tc.stop(5);

        tc.cleanup = cleanup;
        setup();

        var calls = new Mocks.CallVerifier(tc);

        // A test component that will be the child of the viewport
        var child = {};
        Jx.mix(child, Jx.Component.prototype);
        calls.initialize(child, ["getUI", "hydrateExtent", "hydratePosition", "dehydrate", "scroll"]);

        // Create the viewport
        Jx.addStyle(".viewport-horizontal { width:200px; height:200px; overflow-x: scroll }");
        var viewport = Jx.root = new P.ScrollingViewport(new MockJobSet(), child, P.Orientation.horizontal);

        calls.expectOnce(child, "getUI", null, function (ui) {
            ui.html = "<div id='childElement' style='width:1000px;height:100%'></div>";
        });
        Jx.app.initUI(divPlayArea);
        calls.verify();

        // When we create the viewport, we will first be hydrated
        calls.expectOnce(child, "hydrateExtent", null, function () {
            this.getParent().extentChanged(this, 0, 1000);
            calls.expectOnce(child, "hydratePosition", null, function() {
                calls.expectOnce(child, "scroll", null, function () { 
                    calls.expectOnce(child, "render");
                });
                this.getParent().setScrollPosition(52);
            });
        });
        viewport.hydrate();
        calls.verify();

        // Verify that the viewport was created, sized and scrolled correctly
        var viewportElement = divPlayArea.children[0];
        tc.areEqual(52, viewportElement.scrollLeft);
        tc.areEqual(200, viewportElement.offsetWidth);
        tc.areEqual(200, viewportElement.offsetHeight);
        tc.areEqual(1000, viewportElement.scrollWidth);
        tc.areEqual(200, viewport.getViewportExtent());

        // Scrolling to the same position will generate no events
        viewport.setScrollPosition(52);

        // But scrolling to a new position will generate an asynchronous event
        function expectScroll(expectedPosition, expectedChange, continuation) {
            calls.expectOnce(child, "scroll", [expectedPosition, expectedChange], (function () {
                // Async callback needs to call tc.start
                tc.areEqual(expectedPosition, viewport.getScrollPosition());
                tc.areEqual(viewportElement.scrollLeft, expectedPosition);
                continuation();
                tc.start();
            }));
        }
        expectScroll(196, 196-52, function() {

            // Scrolling back to the original location will generate a new event
            expectScroll(52, 52-196, function() {

                // Scrolling too far will clip
                expectScroll(800, 800-52, function() {

                    // Repeated attempts to scroll too far will have no effect
                    viewport.setScrollPosition(1100);
                    viewport.setScrollPosition(800);
                    viewport.setScrollPosition(801);

                    // Scrolling negatively will also clip
                    expectScroll(0, -800, function() {

                        // Setting the scroll position directly on the viewport also generates events
                        expectScroll(236, 236, function() {

                            // Test dehydration
                            calls.expectOnce(child, "dehydrate", [true], function (shouldDehydratePosition) {
                                tc.areEqual(236, this.getParent().getScrollPosition());
                                return "Flibbertygibbit";
                            });
                            tc.areEqual(viewport.dehydrate(), "Flibbertygibbit");
                            
                            // Test complete

                        });
                        viewportElement.scrollLeft = 236;
                    });
                    viewport.setScrollPosition(-100);
                });
                viewport.setScrollPosition(900);
            });
            viewport.setScrollPosition(52);
        });
        viewport.setScrollPosition(196);
    });

    Tx.test("viewportTests.testOffsetViewport", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var calls = new Mocks.CallVerifier(tc);

        // A test component that will be the child of the viewport
        var child = {};
        Jx.mix(child, Jx.Component.prototype);
        calls.initialize(child, ["render", "scroll"]);

        // A test component that will be the parent of the viewport
        var parent = {};
        Jx.mix(parent, Jx.Component.prototype);
        calls.initialize(parent, ["widthChanged", "setScrollPosition", "getScrollPosition"]);

        // Create the viewport
        var viewport = new P.OffsetViewport(new MockJobSet(), child);
        parent.appendChild(viewport);

        // Scrolling or offsetting the viewport will have no effect
        viewport.scroll(100, 100);
        viewport.scroll(50, -50);
        viewport.setOffset(1000);
        tc.areEqual(1000, viewport.getOffset());

        // We must render the viewport before any scroll events will be received
        calls.expectOnce(parent, "getScrollPosition", [], function() { 
            calls.expectOnce(parent, "getScrollPosition", [], function() { 
                return 50;
            });
            return 50;
        });
        calls.expectOnce(child, "render", []);
        viewport.render();
        calls.verify();

        // Now the scroll position should be correct
        tc.areEqual(-950, viewport.getScrollPosition());

        // And we should get events when it scrolls
        calls.expectOnce(child, "scroll", [12, 962], function () {
            tc.areEqual(12, viewport.getScrollPosition());
        });
        calls.expectOnce(parent, "getScrollPosition", [], function() { 
            return 1012;
        });
        viewport.scroll(1012, 962);
        calls.verify();

        // We should also get events when the offset changes
        calls.expectOnce(child, "scroll", [512, 500], function () {
            tc.areEqual(512, viewport.getScrollPosition());
        });
        calls.expectOnce(parent, "getScrollPosition", [], function() { 
            return 1012;
        });
        viewport.setOffset(500);
        calls.verify();

        // When we suppress events, nothing should generate them
        var suppression1 = viewport.suppressScrollEvents();
        var suppression2 = viewport.suppressScrollEvents();
        viewport.setOffset(2600);
        viewport.scroll(2400, 1388);
        suppression1.enableScrollEvents();

        // But they should come in when we finally unsuppress
        calls.expectOnce(child, "scroll", [-200, -712], function () {
            tc.areEqual(-200, viewport.getScrollPosition());
        });
        calls.expectOnce(parent, "getScrollPosition", [], function() { 
            return 2400;
        });
        suppression2.enableScrollEvents();
        calls.verify();
    });
    //this.testOffsetViewport["Owner"] = "jspivey";
});
