
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global document,Tx,Calendar,MockJobset,runSync*/

(function () {
    //
    // Globals
    //

    var dayview  = null;
    var timeline = null;

    var jobset = null;

    var Timeline = Calendar.Controls.Timeline;

    var days = null;
    var dayRenderer = null;
    var dayRecycler = null;
    // method each test can call to set custom left/right sizes
    // method is defined in setUp function for compactness of globals
    var setDays = null;

    //
    // Setup
    //

    function setup() {
        dayRenderer = function(item) {
            return "<div class='day'>" + item + "</div>";
        };

        dayRecycler = function(old, data) {
            data.el.innerHTML = data.item;
        };

        // custom data source that allows different left/right sizes
        var _left, _right;
        days = {
            left: function () {
                return _left;
            },

            right: function () {
                return _right;
            },

            getItem: function (index) {
                return index;
            }
        };

        setDays = function(leftIndex, rightIndex) {
            _left = leftIndex;
            _right = rightIndex;
        };

        // create new styles
        var style = document.createElement("style");
        style.innerHTML =
            "html, body " +
            "{ " +
            "    width: 100%; " +
            "    height: 100%; " +
            "    margin: 0; " +
            "    padding: 0; " +
            "} " +

            "#dayview " +
            "{ " +
            "    width: 100%; " +
            "    height: 100%; " +
            "    position: relative; " +
            "    padding-right: 120px; " +
            "} " +

            "#dayview .day" +
            "{ " +
            "    position: absolute;" +
            "    width:  calc(50% - 60px); " +
            "    height: 100%; " +
            "}" +

            ".timelineScroller {" +
            "    position: relative;" +
            "    width:  100%;" +
            "    height: 100%;" +

            "    overflow-x: scroll;" +
            "    overflow-y: hidden;" +

            "    -ms-overflow-style: none;" +
            "    -ms-scroll-snap-type: mandatory;" +
            "}"
        ;

        // add the styles
        var head = document.getElementsByTagName("head")[0];
        head.appendChild(style);

        // add the timeline to the view
        dayview = document.createElement("div");
        dayview.id = "dayview";

        var body = document.body;

        for (var i = 0; i < body.childNodes.length; i++) {
            body.childNodes[i].display = "none";
        }

        body.insertBefore(dayview, body.firstChild);

        jobset = new MockJobset();
    }

    //
    // Teardown
    //

    function cleanup() {
        if (timeline) {
            timeline.shutdown();
        }

        jobset.dispose();
        jobset = null;

        var body = document.body;
        body.removeChild(body.firstChild);
        dayview  = null;
        timeline = null;
    }

    //
    // Tests
    //

    // This tests the smallest data source possible, aligned right
    Tx.test("TimelineTestsExtended.testSmallSourceRight", function (tc) {
        tc.cleanup = cleanup;
        setup();

        setDays(0,1);

        runSync(function() {
            timeline = new Timeline(dayview, jobset, days, dayRenderer, dayRecycler);
            timeline.initialize();
        });

        timeline.setFocusedIndex(-100);
        // force re-calc of realized items
        timeline._onScroll();
        tc.areEqual(0, timeline._realized[0].index, "No days to left, scroll to -100 should leave index at 0");
        timeline.setFocusedIndex(100);
        // force re-calc of realized items
        timeline._onScroll();
        tc.areEqual(0, timeline._realized[0].index, "No days to right, scroll to 100 should leave index at 0");
    });


    // This tests the smallest data source possible, aligned left
    Tx.test("TimelineTestsExtended.testSmallSourceLeft", function (tc) {
        tc.cleanup = cleanup;
        setup();

        setDays(1,0);

        runSync(function() {
            timeline = new Timeline(dayview, jobset, days, dayRenderer, dayRecycler);
            timeline.initialize();
        });

        timeline.setFocusedIndex(-100);
        // force re-calc of realized items
        timeline._onScroll();
        tc.areEqual(-1, timeline._realized[0].index, "No days to left, scroll to -100 should leave index at -1");
        timeline.setFocusedIndex(100);
        // force re-calc of realized items
        timeline._onScroll();
        tc.areEqual(-1, timeline._realized[0].index, "No days to right, scroll to 100 should leave index at -1");
    });

    // This tests an empty data source possible, today is still provided
    Tx.test("TimelineTestsExtended.testEmptySource", function (tc) {
        tc.cleanup = cleanup;
        setup();

        setDays(0,0);

        runSync(function() {
            timeline = new Timeline(dayview, jobset, days, dayRenderer, dayRecycler);
            timeline.initialize();
        });

        tc.areEqual(1, timeline._realized.length, "Should only be one day [today] with an empty source");

        timeline.setFocusedIndex(-100);
        // force re-calc of realized items
        timeline._onScroll();
        tc.areEqual(0, timeline._realized[0].index, "No days to left, scroll to -100 should leave index at 0");
        timeline.setFocusedIndex(100);
        // force re-calc of realized items
        timeline._onScroll();
        tc.areEqual(0, timeline._realized[0].index, "No days to right, scroll to -100 should leave index at 0");
    });

    // This verifies that the output of the renderer is valid
    Tx.test("TimelineTestsExtended.testRender", function (tc) {
        tc.cleanup = cleanup;
        setup();

        setDays(100,100);

        runSync(function() {
            timeline = new Timeline(dayview, jobset, days, dayRenderer, dayRecycler);
            timeline.initialize();
        });

        runSync(function() {
            timeline.setFocusedIndex(42);
            // force calculation
            timeline._onScroll();
        });

        var els = timeline._realized;
        tc.areEqual("41", els[0].el.innerHTML, "Wrong innerHTML on rendered item");
        tc.areEqual("42", els[1].el.innerHTML, "Wrong innerHTML on rendered item");
        tc.areEqual("43", els[2].el.innerHTML, "Wrong innerHTML on rendered item");
    });

    // This test the max width, the number of days needed to do so is below
    // The max width boundary will cause recalculation of canvas bounds etc.
    // 1352 = 1000000 / item width (1000000 being max width, item width being 740 on a 1600x1200 machine)
    Tx.test("TimelineTestsExtended.testBoundariesHugeSource", function (tc) {
        tc.cleanup = cleanup;
        setup();

        setDays(5000,5000);

        runSync(function() {
            timeline = new Timeline(dayview, jobset, days, dayRenderer, dayRecycler);
            timeline.initialize();
        });

        var els = timeline._realized;

        for (var i = 0; i < 5000; i += 100) {
            runSync(function() {
                timeline.setFocusedIndex(i);
                timeline._onScroll();
            });

            tc.areEqual(i-1, els[0].index, "Failed to scroll to new index");
            tc.areEqual(i,   els[1].index, "Failed to scroll to new index");
        }
    });

})();