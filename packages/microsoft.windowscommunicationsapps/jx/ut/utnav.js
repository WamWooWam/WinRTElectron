
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Navigation UTs

/// <reference path="../core/Nav.js" />

/*global Jx,Tx*/

// Verify constructor
Tx.test("NavTests.testConstructor", function (tc) {
    var nav = new Jx.Nav();
        
    // Verify a function from the prototype
    tc.isTrue(Jx.isFunction(nav.go), "Jx.Nav doesn't have go");

    // Verify a random function from the events mixin
    tc.isTrue(Jx.isFunction(nav.raiseEvent), "Jx.Nav doesn't have raiseEvent");

    tc.areEqual(nav.getLocation(), null, "invalid location");
    tc.areEqual(nav.canGoBack(), false, "canGoBack should be false");
    tc.areEqual(nav.canGoForward(), false, "canGoForward should be false");

    tc.areEqual(nav.back(), false, "back() should return false");
    tc.areEqual(nav.back(1), false, "back(1) should return false");
    tc.areEqual(nav.back(100), false, "back(100) should return false");

    tc.areEqual(nav.forward(), false, "forward() should return false");
    tc.areEqual(nav.forward(1), false, "forward(1) should return false");
    tc.areEqual(nav.forward(100), false, "forward(100) should return false");

    nav.dispose();
});

// Verify first navigation
Tx.test("NavTests.testNavigate1", function (tc) {
    var location, nav = new Jx.Nav();

    nav.go({ view: "view1" });

    location = nav.getLocation();
    tc.areEqual(location.view, "view1", "invalid location");
    tc.areEqual(nav.canGoBack(), false, "invalid canGoBack");
    tc.areEqual(nav.canGoForward(), false, "invalid canGoForward");

    nav.dispose();
});

// Verify two navigations, back and froward
Tx.test("NavTests.testNavigate2", function (tc) {
    var location, nav = new Jx.Nav();

    nav.go({ view: "view1" });
    nav.go({ view: "view2" });

    location = nav.getLocation();
    tc.areEqual(location.view, "view2", "#1 invalid location");

    tc.areEqual(nav.canGoBack(), true, "#1 invalid canGoBack");
    tc.areEqual(nav.canGoForward(), false, "#1 invalid canGoForward");

    nav.back();

    location = nav.getLocation();
    tc.areEqual(location.view, "view1", "#2 invalid location");

    tc.areEqual(nav.canGoBack(), false, "#2 invalid canGoBack");
    tc.areEqual(nav.canGoForward(), true, "#2 invalid canGoForward");

    nav.forward();

    location = nav.getLocation();
    tc.areEqual(location.view, "view2", "#3 invalid location");

    tc.areEqual(nav.canGoBack(), true, "#3 invalid canGoBack");
    tc.areEqual(nav.canGoForward(), false, "#3 invalid canGoForward");

    nav.dispose();
});

// Back and forward with distance > 1 
Tx.test("NavTests.testLongStackNav", function (tc) {
    var nav = new Jx.Nav();

    // Setup
    nav.go({ view: 1 });
    nav.go({ view: 2 });
    nav.go({ view: 3 });
    nav.go({ view: 4 });
    nav.go({ view: 5 });
    nav.go({ view: 6 });

    // #1 - verify initial location
    tc.areEqual(nav.getLocation().view, 6, "#1 invalid location");
    tc.areEqual(nav.canGoBack(), true, "#1 invalid canGoBack ");
    tc.areEqual(nav.canGoForward(), false, "#1 invalid canGoForward");

    // #2 - navigate to view 2
    tc.areEqual(nav.back(4), true, "#2 invalid nav.back(4)");
    tc.areEqual(nav.getLocation().view, 2, "#2 invalid location");
    tc.areEqual(nav.canGoBack(), true, "#2 invalid canGoBack");
    tc.areEqual(nav.canGoForward(), true, "#2 invalid canGoForward");

    // #3 - navigate to view 4
    tc.areEqual(nav.forward(2), true, "#3 invalid nav.forward(2)");
    tc.areEqual(nav.getLocation().view, 4, "#3 invalid location");
    tc.areEqual(nav.canGoBack(), true, "#3 invalid canGoBack");
    tc.areEqual(nav.canGoForward(), true, "#3 invalid canGoForward");

    // #4 - navigate to view 1 with a distance too large
    tc.areEqual(nav.back(100), true, "#4 invalid nav.back(100)");
    tc.areEqual(nav.getLocation().view, 1, "#4 invalid location");
    tc.areEqual(nav.canGoBack(), false, "#4 invalid canGoBack");
    tc.areEqual(nav.canGoForward(), true, "#4 invalid canGoForward");

    // #5 - navigate to view 6 with a distance too large
    tc.areEqual(nav.forward(100), true, "#5 invalid nav.forward(100)");
    tc.areEqual(nav.getLocation().view, 6, "#5 invalid location");
    tc.areEqual(nav.canGoBack(), true, "#5 invalid canGoBack");
    tc.areEqual(nav.canGoForward(), false, "#5 invalid canGoForward");

    nav.dispose();
});

// Navigation events
Tx.test("NavTests.testEvents", function (tc) {
    var nav = new Jx.Nav(), 
        onBeforeNavigateCalled = 0, 
        onNavigateCalled = 0;

    function onBeforeNavigate(ev) {
        onBeforeNavigateCalled++;
        tc.areEqual(ev.location.view, "view1", "invalid onBeforeNavigate event data");
        tc.areEqual(ev.location.id, 1234, "invalid onBeforeNavigate event data");
    }

    function onNavigate(ev) {
        onNavigateCalled++;
        tc.areEqual(ev.location.view, "view1", "invalid onNavigate event data");
        tc.areEqual(ev.location.id, 1234, "invalid onNavigate event data");
    }

    nav.addListener(nav.beforeNavigate, onBeforeNavigate);
    nav.addListener(nav.navigate, onNavigate);
        
    nav.go({ view: "view1", id: 1234 });

    tc.areEqual(onBeforeNavigateCalled, 1, "onBeforeNavigate not called");
    tc.areEqual(onNavigateCalled, 1, "onNavigate not called");

    nav.dispose();
});

// Cancel beforeNavigate
Tx.test("NavTests.testCancelOnBeforeNavigate", function (tc) {
    var location, 
        nav = new Jx.Nav(), 
        onBeforeNavigateCalled = 0, 
        onNavigateCalled = 0;

    function onBeforeNavigate(ev) {
        onBeforeNavigateCalled++;
        ev.cancel = true;
    }

    function onNavigate(/*ev*/) {
        onNavigateCalled++;
    }

    nav.go({ page: "settings" });

    nav.addListener(nav.beforeNavigate, onBeforeNavigate);
    nav.addListener(nav.navigate, onNavigate);
        
    nav.go({ view: "view1", id: 1234 });

    tc.areEqual(onBeforeNavigateCalled, 1, "onBeforeNavigate should be called once");
    tc.areEqual(onNavigateCalled, 0, "onNavigate should not be called");

    // Verify location is not changed
    location = nav.getLocation();
    tc.areEqual(location.page, "settings", "location.page should not change");

    // Verify stacks are not changed
    tc.areEqual(nav.canGoBack(), false, "canGoBack should be false");
    tc.areEqual(nav.canGoForward(), false, "canGoForward should be false");

    nav.dispose();
});

// Modify location in beforeNavigate event handler
Tx.test("NavTests.testUpdateLocation", function (tc) {
    var location, 
        nav = new Jx.Nav(), 
        onBeforeNavigateCalled = 0, 
        onNavigateCalled = 0;

    function onBeforeNavigate(ev) {
        onBeforeNavigateCalled++;
        tc.areEqual(ev.location.view, "view1", "invalid onBeforeNavigate event data");
        tc.areEqual(ev.location.id, 1234, "invalid onBeforeNavigate event data");
        ev.location.id = 888;
    }

    function onNavigate(ev) {
        onNavigateCalled++;
        tc.areEqual(ev.location.view, "view1", "invalid onNavigate event data");
        tc.areEqual(ev.location.id, 888, "invalid onNavigate event data");
    }

    nav.addListener(nav.beforeNavigate, onBeforeNavigate);
    nav.addListener(nav.navigate, onNavigate);
        
    nav.go({ view: "view1", id: 1234 });

    tc.areEqual(onBeforeNavigateCalled, 1, "onBeforeNavigate should be called");
    tc.areEqual(onNavigateCalled, 1, "onNavigate should be called");

    // Verify location is changed
    location = nav.getLocation();
    tc.areEqual(location.view, "view1", "location should change");
    tc.areEqual(location.id, 888, "location should change");

    nav.dispose();
});

// Verify max stack
Tx.test("NavTests.testMaxStack", function (tc) {
    var nav = new Jx.Nav();

    nav.maxStack = 3;

    nav.go({ view: 1 });
    nav.go({ view: 2 });
    nav.go({ view: 3 });
    nav.go({ view: 4 });
    nav.go({ view: 5 });

    // 1 should be discarded, [2,3,4] in the back stack and 5 in location
    tc.areEqual(nav.getLocation().view, 5, "invalid location");
    tc.areEqual(nav.backStack.length, nav.maxStack, "invalid backStack length #1");
    tc.areEqual(nav.backStack[0].view, 2, "invalid backStack content");

    // Fill the forward stack
    nav.back(nav.maxStack);
    tc.areEqual(nav.backStack.length, 0, "invalid backStack length #2");
    tc.areEqual(nav.forwardStack.length, nav.maxStack, "invalid forwardStack length");
    tc.areEqual(nav.forwardStack[0].view, 5, "invalid forwardStack content");

    nav.dispose();
});
