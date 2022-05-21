
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,Jx,People,Mocks,MockJobSet*/

Include.initializeFileScope(function () {

    var P = People;

    Tx.test("stitcherTests.testStitching", function (tc) {

        var calls = new Mocks.CallVerifier(tc);

        // A set of test components that will be the child of the stitcher
        var children = [];
        for (var i = 0; i < 5; i++) {
            var child = {};
            Jx.mix(child, Jx.Component.prototype);
            child.name = "child" + i;
            calls.initialize(child, ["hydrateExtent", "hydratePosition", "dehydrate", "scroll"]);
            children.push(child);
        }

        // A component that will be the parent of the stitcher
        var parent = {
            getJobSet: function() { return new MockJobSet(); }
        };
        Jx.mix(parent, Jx.Component.prototype);
        calls.initialize(parent, ["extentChanged", "extentReady"]);

        // Create the stitcher
        var stitcher = new P.Stitcher();
        parent.appendChild(stitcher);
        children.forEach(function (child) { stitcher.addChild(child); });

        // Extent hydration is broadcast
        children.forEach(function(child, index) {
            calls.expectOnce(child, "hydrateExtent", null, function (data) { 
                tc.areEqual(index*index-1, data.value);
            });
        });
        stitcher.hydrateExtent({ sections: { child0: { value: -1 }, child1: { value: 0 }, child2: { value: 3 }, child3: { value: 8 }, child4: { value: 15 } }});
        calls.verify();

        // Position hydration is single-cast
        calls.expectOnce(children[3], "hydratePosition", null, function(data) {
            tc.areEqual("catamaran", data.boat);
        });
        stitcher.hydratePosition({ lastVisibleSection: "child3", sections: { child3: { boat: "catamaran" } }});

        // Render goes to the first child, since no extents are yet ready
        parent.getScrollPosition = function() { return 0; };
        calls.expectOnce(children[0], "render", null, function () {
            tc.areEqual(0, this.getParent().getOffset());
        });
        stitcher.render();
        calls.verify();

        // Other children can fix their extent, but nothing happens
        function expectExtentChange(expectedOrigin, expectedChange, continuation) {
            calls.expectOnce(parent, "extentChanged", [stitcher, expectedOrigin, expectedChange], continuation);
        }
        expectExtentChange(0, 1000);
        children[2].getParent().extentChanged(children[2], 0, 1000);
        calls.verify();
        children[2].getParent().extentReady(children[2]);
        expectExtentChange(1000, 500);
        children[3].getParent().extentChanged(children[3], 0, 500);
        calls.verify();
        children[3].getParent().extentReady(children[3]);

        // And the first section can change his extent as much as he likes
        expectExtentChange(0, 100);
        children[0].getParent().extentChanged(children[0], 0, 100);
        calls.verify();
        expectExtentChange(0, 200);
        children[0].getParent().extentChanged(children[0], 0, 200);
        calls.verify();
        expectExtentChange(0, 200);
        children[0].getParent().extentChanged(children[0], 0, 200);
        calls.verify();

        // But once that section has fixed his extent, the next section will get a render call 
        calls.expectOnce(children[1], "render", null, function () { 
            tc.areEqual(-500, this.getParent().getScrollPosition());
        });
        children[0].getParent().extentReady(children[0]);

        // And now if the first section's extent changes, the child will receive a scroll event
        function expectScroll(child, expectedPosition, expectedChange) {
            calls.expectOnce(child, "scroll", [expectedPosition, expectedChange]);
        }
        expectScroll(children[1], -400, 100);
        expectExtentChange(0, -100);
        children[0].getParent().extentChanged(children[0], 0, -100);
        calls.verify();

        // And if we scroll, the first two sections get a scroll event
        parent.getScrollPosition = function () { return 100; };
        expectScroll(children[0], 100, 100);
        expectScroll(children[1], -300, 100);
        stitcher.scroll(100, 100);
        calls.verify();

        // Now extent changes to the first item off the edge of the viewport are corrected for.  The second item does
        // not scroll.  The first item does.
        expectScroll(children[0], 150, 50);
        expectExtentChange(0, 50, function () {
            parent.getScrollPosition = function () { return 150; };
            stitcher.scroll(150, 50);
        });
        children[0].getParent().extentChanged(children[0], 0, 50);
        calls.verify();

        // When the second item's extent is ready, all of the rest will render.
        expectExtentChange(450, 250);
        children[1].getParent().extentChanged(children[1], 0, 250);
        calls.verify();
        calls.expectOnce(children[2], "render");
        calls.expectOnce(children[3], "render");
        calls.expectOnce(children[4], "render");
        children[1].getParent().extentReady(children[1]);
        calls.verify();

        // And everyone ends up at the right position.
        tc.areEqual(150, children[0].getParent().getScrollPosition());
        tc.areEqual(-300, children[1].getParent().getScrollPosition());
        tc.areEqual(-550, children[2].getParent().getScrollPosition());
        tc.areEqual(-1550, children[3].getParent().getScrollPosition());

        // When the last child's extent is ready, the parent is notified
        calls.expectOnce(parent, "extentReady");
        children[4].getParent().extentReady(children[4]);
        calls.verify();
    });
    //this.testStitching["Owner"] = "jspivey";

});