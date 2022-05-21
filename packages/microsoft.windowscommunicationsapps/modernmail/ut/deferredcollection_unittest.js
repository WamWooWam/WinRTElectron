
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function () {
    /*global Mail,Tx,Mocks,Jx*/

    "use strict";

    var MP = Mocks.Microsoft.WindowsLive.Platform,
        platformCollection = null,
        deferredCollection = null,
        listener = null;

    function setup(tc, options) {
        tc.isTrue(Jx.isArray(options.contents));
        listener = {
            onChangesPending: function () {},
            onResetPending: function () {},
        };

        platformCollection = new MP.Collection("String", { clone: function (item) { return item; } });
        options.contents.forEach(function (id, index) {
            platformCollection.mock$addItem(id, index);
        });
        deferredCollection = new Mail.DeferredCollection(platformCollection, listener);
    }

    Tx.test("DeferredCollection.test_reset", { owner: "kepoon", priority: 0 }, function (tc) {
        setup(tc, {
            contents: ["A", "B", "C", "D"],
        });

        // setup up the listener
        var isResetPending = false;
        listener.onResetPending = function () {
            isResetPending = true;
        };

        tc.areEqual(platformCollection.count, 4);

        // simulate a reset
        platformCollection.mock$suspendNotifications();
        platformCollection.mock$addItem("E", 4);
        platformCollection.mock$resumeNotifications();

        // the count does not change
        tc.areEqual(deferredCollection.count, 4, "Count should not change if acceptPendingChanges is not called");
        tc.isTrue(isResetPending, "Listener is notified of the reset");

        // The collection can handle more pending changes without crashing
        platformCollection.mock$addItem("F", 5);
        tc.areEqual(deferredCollection.count, 4, "Count should not change if acceptPendingChanges is not called");

        deferredCollection.acceptPendingChanges();
        tc.areEqual(deferredCollection.count, 6);
        verifyCollection(tc, ["A", "B", "C", "D", "E", "F"]);
    });

    Tx.test("DeferredCollection.test_reset_noResetListener", { owner: "kepoon", priority: 0 }, function (tc) {
        setup(tc, {
            contents: ["A", "B", "C", "D"],
        });

        // setup up the listener
        var changesPending = 0;
        listener.onResetPending = null;
        listener.onChangesPending = function () {
            changesPending++;
        };

        tc.areEqual(platformCollection.count, 4);

        // we start with pending changes
        platformCollection.mock$addItem("E", 4);
        tc.areEqual(changesPending, 1, "Listener is notified of the add item changes");

        // simulate a reset
        platformCollection.mock$suspendNotifications();
        platformCollection.mock$addItem("F", 5);
        platformCollection.mock$resumeNotifications();

        // the count does not change
        tc.areEqual(deferredCollection.count, 4, "Count should not change if acceptPendingChanges is not called");
        tc.areEqual(changesPending, 2, "Listener is notified of the reset");

        // further changes are not reported
        platformCollection.mock$addItem("G", 6);
        tc.areEqual(changesPending, 2, "Listener is not notified as there is a pending reset");

    });

    Tx.test("DeferredCollection.test_itemAdded", { owner: "kepoon", priority: 0 }, function (tc) {
        setup(tc, {
            contents: ["A", "B", "C", "D"],
        });

        platformCollection.mock$addItem("E", 4);

        // the count does not change
        verifyCollection(tc, ["A", "B", "C", "D"]);
        deferredCollection.acceptPendingChanges();
        verifyCollection(tc, ["A", "B", "C", "D", "E"]);
    });

    function verifyCollection(tc, expected) {
        expected.forEach(function (item, index) {
            tc.areEqual(item, deferredCollection.item(index), "item mismatched at index:=" + index);
        });
    }
})();
