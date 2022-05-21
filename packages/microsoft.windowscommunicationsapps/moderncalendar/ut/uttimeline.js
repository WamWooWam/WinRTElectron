
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global document,Tx,Calendar,MockJobset,runSync*/

(function() {
    var dayview  = null,
        timeline = null;

    var jobset = null;

    var Timeline = Calendar.Controls.Timeline;

    //
    // Setup
    //

    function setup() {
        function dayRenderer(day) {
            return "<div class='day'>" + day + "</div>";
        }

        function dayRecycler(old, data) {
            data.el.innerHTML = data.item;
        }

        // add the timeline to the view
        dayview = document.getElementById("dayview");

        var body = document.body;
    
        for (var i = 0; i < body.childNodes.length; i++) {
            body.childNodes[i].display = "none";
        }

        // set up the timeline
        var now  = new Date(1985, 1, 16);
        var days = {
            left: function() {
                return 600;
            },

            right: function() {
                return 600;
            },

            getItem: function(index) {
                return new Date(now.getFullYear(), now.getMonth(), now.getDate() + index);
            }
        };

        jobset = new MockJobset();

        timeline = new Timeline(dayview, jobset, days, dayRenderer, dayRecycler, { hookMouse: true });
        timeline.initialize(0);
    }

    //
    // Teardown
    //

    function cleanup() {
        timeline.shutdown();
        timeline = null;

        jobset.dispose();
        jobset = null;

        dayview = null;
    }

    //
    // Tests
    //

    Tx.test("TimelineTests.testSetFocusedIndex", function (tc) {
        tc.cleanup = cleanup;
        setup();

        runSync(function() {
            timeline.setFocusedIndex(-1000);
            timeline._onScroll();
        });

        var els = timeline._realized;

        tc.areEqual(new Date(1983, 5, 27).toString(), els[0].el.innerHTML);
        tc.areEqual(new Date(1983, 5, 28).toString(), els[1].el.innerHTML);

        runSync(function() {
            timeline.setFocusedIndex(1000);
            timeline._onScroll();
        });

        tc.areEqual(new Date(1986, 9, 7).toString(),  els[0].el.innerHTML);
        tc.areEqual(new Date(1986, 9, 8).toString(), els[1].el.innerHTML);
        tc.areEqual(new Date(1986, 9, 9).toString(), els[2].el.innerHTML);

        runSync(function() {
            timeline.setFocusedIndex(0);
            timeline._onScroll();
        });

        tc.areEqual(new Date(1985, 1, 15).toString(), els[0].el.innerHTML);
        tc.areEqual(new Date(1985, 1, 16).toString(), els[1].el.innerHTML);
        tc.areEqual(new Date(1985, 1, 17).toString(), els[2].el.innerHTML);
    });

    var MAX_WIDTH;
    var MAX_SIDE;

    Tx.test("TimelineTests.testGetFocusedIndex", function (tc) {
        tc.cleanup = cleanup;
        setup();

        // update the canvas size
        MAX_WIDTH = Timeline.MAX_WIDTH;
        MAX_SIDE  = Timeline.MAX_SIDE;
        Timeline.MAX_WIDTH = 5000;
        Timeline.MAX_SIDE  = 2500;

        runSync(function() {
            timeline._resizeCanvas();
        });

        // forcibly scroll to the left
        runSync(function() {
            timeline._scroller.scrollLeft = -10000000;
            timeline._onScroll();
        });

        var itemWidth = timeline._realized[0].el.offsetWidth;
        var items = Math.floor(Timeline.MAX_SIDE / itemWidth);

        tc.areEqual(-items, timeline.getFocusedIndex());

        // reset the canvas size
        Timeline.MAX_SIDE  = MAX_SIDE;
        Timeline.MAX_WIDTH = MAX_WIDTH;
    });

    Tx.test("TimelineTests.testAddingDays", function (tc) {
        tc.cleanup = cleanup;
        setup();

        // update the canvas size
        MAX_WIDTH = Timeline.MAX_WIDTH;
        MAX_SIDE  = Timeline.MAX_SIDE;
        Timeline.MAX_WIDTH = 5000;
        Timeline.MAX_SIDE  = 2500;

        runSync(function() {
            timeline._resizeCanvas();
        });

        // forcibly scroll to the left
        runSync(function() {
            timeline._scroller.scrollLeft = -10000000;
            timeline._onScroll();
        });

        // the timeline control should have centered our days
        tc.isTrue(0 < timeline._scroller.scrollLeft, "Should have centered our days 1");

        // forcibly scroll to the right
        runSync(function() {
            timeline._scroller.scrollLeft = 10000000;
            timeline._onScroll();
        });

        // the timeline control should have centered our days
        tc.isTrue(timeline._scroller.scrollLeft <= timeline._scroller.scrollWidth - timeline._scroller.offsetWidth, "Should have centered our days 2");

        // reset the canvas size
        Timeline.MAX_SIDE  = MAX_SIDE;
        Timeline.MAX_WIDTH = MAX_WIDTH;
    });

    Tx.test("TimelineTests.testArrows", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var arrows, left, right;

        var ev = document.createEvent("MouseEvents");
        ev.initEvent("MSPointerMove", true, true);
        ev.pointerType = "mouse";

        arrows = document.querySelectorAll(".timelineArrow");
        tc.areEqual(0, arrows.length, "No Arrows By Default");

        timeline.setAlwaysShowArrows(true);

        arrows = document.querySelectorAll(".timelineArrow");
        tc.areEqual(2, arrows.length, "Arrows Shown When 'Always Show'");

        timeline.setAlwaysShowArrows(false);

        arrows = document.querySelectorAll(".timelineArrow");
        tc.areEqual(0, arrows.length, "Arrows Hidden When Not 'Always Show'");

        dayview.dispatchEvent(ev);
        arrows = document.querySelectorAll(".timelineArrow");

        tc.areEqual(2, arrows.length, "Arrows On Mouse Move");

        left  = arrows[0];
        right = arrows[1];

        tc.areEqual("", left.style.display,  "1. Left Arrow Showing");
        tc.areEqual("", right.style.display, "1. Right Arrow Showing");

        runSync(function() {
            timeline.setFocusedIndex(-1000);
            timeline._onScroll();
        });

        dayview.dispatchEvent(ev);

        tc.areNotEqual(null, left.parentNode,  "Left Arrow Still In DOM");
        tc.areNotEqual(null, right.parentNode, "Right Arrow Still In DOM");

        tc.areEqual("none", left.style.display,  "2. Left Arrow Hidden");
        tc.areEqual("",     right.style.display, "2. Right Arrow Showing");

        runSync(function() {
            timeline.setFocusedIndex(1000);
            timeline._onScroll();
        });

        runSync(function() {
            timeline._scroller.scrollLeft = 1000000;
            timeline._onScroll();
        });

        dayview.dispatchEvent(ev);

        tc.areEqual("",     left.style.display,  "3. Left Arrow Showing");
        tc.areEqual("none", right.style.display, "3. Right Arrow Hidden");

        runSync(function() {
            timeline.setFocusedIndex(10);
            timeline._onScroll();
        });

        dayview.dispatchEvent(ev);

        tc.areEqual("", left.style.display,  "4. Left Arrow Showing");
        tc.areEqual("", right.style.display, "4. Right Arrow Showing");
    });
})();