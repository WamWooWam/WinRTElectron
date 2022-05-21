
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,Microsoft,People,Jx,MockJobSet,Mocks*/

(function () {

    var P = People;
    var M = Mocks;
    var MP = M.Microsoft.WindowsLive.Platform;
    var Plat = Microsoft.WindowsLive.Platform;

    function verifyCollection(tc, collection, expectedContents) {
        tc.areEqual(expectedContents.length, collection.length);
        expectedContents.forEach(function (expectedObject, index) {
            tc.areEqual(expectedObject, collection.getItem(index));
        });
    }

    function verifyPlatformCollection(tc, collection, expectedIds) {
        tc.areEqual(expectedIds.length, collection.count);
        expectedIds.forEach(function (expectedId, index) {
            if (expectedId === null) {
                tc.areEqual(null, collection.item(index));
            } else {
                tc.areEqual(expectedId, collection.item(index).objectId);
            }
        });
    }

    function verifyQueryCollection(tc, collection, expectedIds) {
        tc.areEqual(expectedIds.length, collection.length);
        expectedIds.forEach(function (expectedId, index) {
            if (expectedId === null) {
                tc.areEqual("none", collection.getItem(index).type);
            } else {
                tc.areEqual(expectedId, collection.getItem(index).data.objectId);
            }
        });
    }

    function verifyDeferredCollection(tc, collection, expectedIds) {
        tc.areEqual(expectedIds.length, collection.length);
        expectedIds.forEach(function (expectedId, index) {
            if (expectedId === null) {
                tc.areEqual(null, collection.getItem(index));
            } else {
                tc.areEqual(expectedId, collection.getItem(index).objectId);
            }
        });
    }

    function verifyDeferredChanges(tc, expectedChanges, deferredChanges) {
        tc.areEqual(expectedChanges.length, deferredChanges.length);
        expectedChanges.forEach(function (change, i) {
            for (var prop in change) {
                tc.areEqual(change[prop], deferredChanges[i][prop]);
            }
        });
    }

    function expectChange(tc, calls, collection, listener, expectedChange, expectedArguments, expectedContents, continuation) {
        calls.expectOnce(listener, expectedChange, expectedArguments, function () {
            verifyCollection(tc, collection, expectedContents);
            if (continuation) {
                continuation.call(this);
            }
        });
    }

    function expectPlatformChange(tc, calls, collection, listener, expectedChange, expectedIds, continuation) {
        calls.expectOnce(listener, "collectionchanged", null, function (ev) {
            var change = ev.detail[0];
            for (var field in expectedChange) {
                tc.areEqual(expectedChange[field], change[field]);
            }
            verifyPlatformCollection(tc, collection, expectedIds);
            if (continuation) {
                continuation.call(this);
            }
        });
    }

    function expectException(tc, fn) {
        try {
            fn();
        } catch (ex) {
            return;
        }
        tc.fail("Exception expected");
    }

    Tx.test("collectionTests.testArrayCollection", function (tc) {
        var calls = new M.CallVerifier(tc);
        var collection = new P.ArrayCollection();
        var listener = calls.hookEvents(collection, ["load", "changesPending"]);
        collection.appendItem("A");
        collection.appendItem("B");
        collection.appendItem("C");
        collection.appendItem("D");
        collection.appendItem("E");
        tc.areEqual(false, collection.isLoaded);
        tc.areEqual(0, collection.length);

        calls.expectOnce(listener, "load", [{ target: collection, length: 5 }]);
        collection.loadComplete();
        calls.verify();
        tc.areEqual(true, collection.isLoaded);
        verifyCollection(tc, collection, ["A", "B", "C", "D", "E"]);

        // add at the end
        expectChange(tc, calls, collection, listener, "changesPending", [{ target: collection }], ["A", "B", "C", "D", "E"]);
        collection.addItem("F", 5);
        calls.verify();

        // add at the beginning
        collection.addItem("G", 0);
        verifyCollection(tc, collection, ["A", "B", "C", "D", "E"]);
        calls.verify();

        // add out of bounds
        expectException(tc, function () {
            collection.addItem("Q", 10);
        });

        // remove in the middle
        collection.removeItem(3);
        verifyCollection(tc, collection, ["A", "B", "C", "D", "E"]);
        calls.verify();

        // remove at the end
        collection.removeItem(5);
        verifyCollection(tc, collection, ["A", "B", "C", "D", "E"]);
        calls.verify();

        // remove out of bounds
        expectException(tc, function () {
            collection.removeItem(-1);
        });

        // move left
        verifyCollection(tc, collection, ["A", "B", "C", "D", "E"]);
        collection.moveItem(4, 1);
        calls.verify();

        // move right
        collection.moveItem(0, 4);
        verifyCollection(tc, collection, ["A", "B", "C", "D", "E"]);
        calls.verify();

        // move out of bounds
        expectException(tc, function () {
            collection.moveItem(0, 8);
        });
        var pendingChanges = collection.acceptPendingChanges();
        verifyDeferredChanges(tc, [{ eType: Plat.CollectionChangeType.itemAdded,   index: 5 },
                               { eType: Plat.CollectionChangeType.itemAdded,   index: 0 },
                               { eType: Plat.CollectionChangeType.itemRemoved, index: 3 },
                               { eType: Plat.CollectionChangeType.itemRemoved, index: 5 },
                               { eType: Plat.CollectionChangeType.itemChanged, index: 1, previousIndex: 4 },
                               { eType: Plat.CollectionChangeType.itemChanged, index: 4, previousIndex: 0 }],
                              pendingChanges);

        verifyCollection(tc, collection, ["E", "A", "B", "G", "D"]);
    });

    function addItem(letter, index) {
        this.mock$addItem({ objectId: letter }, index);
    }

    function mockCollectionCallback (collection) {
        return new P.Callback(function () { return this; }, collection, []);
    }

    var forEach = Array.prototype.forEach;
    Tx.test("collectionTests.testConcatenatedCollection", function (tc) {
        var calls = new M.CallVerifier(tc);
        var provider = { clone: function (item) { return item; } };
        var firstPlatformCollection = new MP.Collection("person", provider);
        var secondPlatformCollection = new MP.Collection("person", provider);

        var firstQueryCollection = new P.QueryCollection("person", mockCollectionCallback(firstPlatformCollection), "first");
        var secondQueryCollection = new P.QueryCollection("person", mockCollectionCallback(secondPlatformCollection), "second");
        var concatenatedCollection = new P.ConcatenatedCollection([firstQueryCollection, secondQueryCollection]);
        var listener = calls.hookEvents(concatenatedCollection, ["load", "changesPending"]);

        var firstHydrationData = 12;
        var secondHydrationData = 5;
        calls.expectOnce(firstQueryCollection, "hydrate", [firstHydrationData],
                         firstQueryCollection.hydrate.bind(firstQueryCollection));
        calls.expectOnce(secondQueryCollection, "hydrate", [secondHydrationData],
                         secondQueryCollection.hydrate.bind(secondQueryCollection));
        concatenatedCollection.hydrate({ first: firstHydrationData, second: secondHydrationData });
        calls.verify();
        tc.areEqual(17, concatenatedCollection.length);

        forEach.call("ABCDE", addItem, firstPlatformCollection);
        forEach.call("WXYZ", addItem, secondPlatformCollection);

        tc.areEqual(false, concatenatedCollection.isLoaded);
        tc.areEqual(17, concatenatedCollection.length);

        firstQueryCollection.load(new MockJobSet());
        tc.areEqual(false, concatenatedCollection.isLoaded);
        tc.areEqual(17, concatenatedCollection.length);
        calls.expectOnce(listener, "load", [{ target: concatenatedCollection, length: 9 }]);
        secondQueryCollection.load(new MockJobSet());
        calls.verify();
        tc.areEqual(true, concatenatedCollection.isLoaded);

        verifyQueryCollection(tc, concatenatedCollection, ["A", "B", "C", "D", "E", "W", "X", "Y", "Z"]);

        calls.expectOnce(listener, "changesPending", [{ target: concatenatedCollection }]);
        addItem.call(firstPlatformCollection, "F", 5); // ABCDEFWXYZ
        calls.verify();
        verifyQueryCollection(tc, concatenatedCollection, ["A", "B", "C", "D", "E", "W", "X", "Y", "Z"]);

        secondPlatformCollection.mock$removeItem(0); // ABCDEFXYZ
        calls.verify();
        verifyQueryCollection(tc, concatenatedCollection, ["A", "B", "C", "D", "E", null, "X", "Y", "Z"]);

        secondPlatformCollection.mock$moveItem(2, 1); // ABCDEFXZY
        verifyQueryCollection(tc, concatenatedCollection, ["A", "B", "C", "D", "E", null, "X", "Y", "Z"]);

        var deferredChanges = concatenatedCollection.acceptPendingChanges();
        verifyDeferredChanges(tc, [{ eType: Plat.CollectionChangeType.itemAdded,   objectId: "F", index: 5 },
                               { eType: Plat.CollectionChangeType.itemRemoved, objectId: "W", index: 6 },
                               { eType: Plat.CollectionChangeType.itemChanged, objectId: "Z", index: 7, previousIndex: 8 }],
                              deferredChanges);

        verifyQueryCollection(tc, concatenatedCollection, ["A", "B", "C", "D", "E", "F", "X", "Z", "Y"]);

        firstPlatformCollection.mock$suspendNotifications();
        firstPlatformCollection.mock$removeItem(0);
        firstPlatformCollection.mock$removeItem(3);
        calls.expectOnce(listener, "changesPending", [{ target: concatenatedCollection }]);
        firstPlatformCollection.mock$resumeNotifications();
        calls.verify();
        var deferredChanges2 = concatenatedCollection.acceptPendingChanges();
        verifyDeferredChanges(tc, [{ eType: Plat.CollectionChangeType.reset }],
                              deferredChanges2);
        verifyQueryCollection(tc, concatenatedCollection, ["B", "C", "D", "F", "X", "Z", "Y"]);
        calls.verify();
    });

    Tx.test("collectionTests.testDeferredCollection", function (tc) {

        // Crank up the monitoring level
        if (!Jx.isUndefined(P.PlatformCollectionWatcher.VerificationLevel)) {
            P.PlatformCollectionWatcher.verificationLevel = P.PlatformCollectionWatcher.VerificationLevel.obsessive;
        }

        var calls = new M.CallVerifier(tc);
        var provider = { clone: function (item) { return item; } };
        var platformCollection = new MP.Collection("Stamp", provider);
        forEach.call("ABCDEFG", function (letter, index) {
            platformCollection.mock$addItem({ objectId: letter }, index);
        });
        var listener = { onChangesPending: function (sender, deferredCollection) { } };
        var deferredCollection = new P.DeferredCollection(platformCollection, listener);
        verifyDeferredCollection(tc, deferredCollection, ["A", "B", "C", "D", "E", "F", "G"]);

        // We'll make a bunch of changes.  The deferred collection should be relatively unaffected.
        // It should fire a changesPending event, and occasionally lose the ability to return deleted items.
        calls.expectOnce(listener, "onChangesPending");
        platformCollection.mock$addItem({ objectId: "Q"}, 0); //QABCDEFG
        calls.verify();
        verifyDeferredCollection(tc, deferredCollection, ["A", "B", "C", "D", "E", "F", "G"]);

        platformCollection.mock$removeItem(2); //QACDEFG
        verifyDeferredCollection(tc, deferredCollection, ["A", null, "C", "D", "E", "F", "G"]);
        tc.areEqual(deferredCollection.getItemId(1), "B", "Cannot retrieve the objectId of a removed item");
        tc.areEqual(deferredCollection.getItemId(4), "E", "Cannot retrieve the objectId of an existing item");


        platformCollection.mock$moveItem(3,0); //DQACEFG
        verifyDeferredCollection(tc, deferredCollection, ["A", null, "C", "D", "E", "F", "G"]);

        platformCollection.mock$moveItem(2,4); //DQCEAFG
        verifyDeferredCollection(tc, deferredCollection, ["A", null, "C", "D", "E", "F", "G"]);

        platformCollection.mock$removeItem(6); //DQCEAF
        verifyDeferredCollection(tc, deferredCollection, ["A", null, "C", "D", "E", "F", null]);

        // Now when we call acceptPendingChanges, those deferred changes should be returned in order
        var deferredChanges = deferredCollection.acceptPendingChanges();

        verifyDeferredChanges(tc, [{ eType: Plat.CollectionChangeType.itemAdded,   objectId: "Q", index: 0 },
                               { eType: Plat.CollectionChangeType.itemRemoved, objectId: "B", index: 2 },
                               { eType: Plat.CollectionChangeType.itemChanged, objectId: "D", index: 0, previousIndex: 3 },
                               { eType: Plat.CollectionChangeType.itemChanged, objectId: "A", index: 4, previousIndex: 2 },
                               { eType: Plat.CollectionChangeType.itemRemoved, objectId: "G", index: 6 }],
                               deferredChanges);

        verifyDeferredCollection(tc, deferredCollection, ["D", "Q", "C", "E", "A", "F"]);

        // The pending changes should be an array of length 0
        tc.areEqual(0, deferredCollection.acceptPendingChanges().length);

        // Changes applied during this lull will have no effect
        calls.expectOnce(listener, "onChangesPending");
        platformCollection.mock$addItem({ objectId: "Z"}, 6); //DQCEAFZ
        verifyDeferredCollection(tc, deferredCollection, ["D", "Q", "C", "E", "A", "F"]);

        platformCollection.mock$removeItem(2); //DQEAFZ
        calls.verify();

        verifyDeferredChanges(tc, [{ eType:Plat.CollectionChangeType.itemAdded, objectId:"Z", index:6 },
                               { eType: Plat.CollectionChangeType.itemRemoved, objectId: "C", index: 2 }], deferredCollection.acceptPendingChanges());
        verifyDeferredCollection(tc, deferredCollection, ["D", "Q", "E", "A", "F", "Z"]);
        calls.verify();

        // Reset will absorb other changes
        calls.expectOnce(listener, "onChangesPending");
        var item = platformCollection.mock$removeItem(0);
        calls.verify();
        platformCollection.mock$suspendNotifications();
        platformCollection.mock$addItem(item, 4);
        platformCollection.mock$removeItem(0);
        tc.isFalse(deferredCollection._isReset());
        platformCollection.mock$resumeNotifications();
        // If there is a reset, we should not be able to get any items
        tc.isTrue(deferredCollection._isReset());
        tc.areEqual(deferredCollection.getItem(2), null);

        platformCollection.mock$removeItem(0);
        verifyDeferredChanges(tc, [{ eType: Plat.CollectionChangeType.reset }], deferredCollection.acceptPendingChanges());
        verifyDeferredCollection(tc, deferredCollection, ["A", "F", "D", "Z"]);
        calls.verify();

        // Testing getFirstPendingChange
        platformCollection = new MP.Collection("Stamp", provider);
        deferredCollection = new P.DeferredCollection(platformCollection, listener);
        var initialContent = ["A", "B", "C", "D", "E"];
        calls.expectOnce(listener, "onChangesPending");
        forEach.call(initialContent.join(""), function (letter, index) {
            platformCollection.mock$addItem({ objectId: letter }, index);
        });
        calls.verify();

        var i = 0;
        while (deferredCollection.hasPendingChanges) {
            var change = deferredCollection.getFirstPendingChange();
            verifyDeferredChanges(tc, [{ eType:Plat.CollectionChangeType.itemAdded, objectId:initialContent[i], index: i}], [change]);
            tc.areEqual(++i, deferredCollection.length);
            verifyDeferredCollection(tc, deferredCollection, initialContent.slice(0, i));
        }

        // test item removeal
        calls.expectOnce(listener, "onChangesPending");
        platformCollection.mock$removeItem(2); //ABDE
        platformCollection.mock$removeItem(2); //ABE
        calls.verify();
        verifyDeferredCollection(tc, deferredCollection, ["A","B", null, null,"E"]);
        tc.areEqual(5, deferredCollection.length);
        deferredCollection.getFirstPendingChange();
        tc.areEqual(4, deferredCollection.length);
        verifyDeferredCollection(tc, deferredCollection, ["A","B", null,"E"]);
        deferredCollection.getFirstPendingChange();
        tc.areEqual(3, deferredCollection.length);
        verifyDeferredCollection(tc, deferredCollection, ["A","B","E"]);

        // test onResetPending
        platformCollection = new MP.Collection("Stamp", provider);
        forEach.call("ABCDEFG", function (letter, index) {
            platformCollection.mock$addItem({ objectId: letter }, index);
        });
        var resetListener = { onResetPending: function (sender, deferredCollection) { } };
        deferredCollection = new P.DeferredCollection(platformCollection, resetListener);
        platformCollection.mock$suspendNotifications();
        platformCollection.mock$removeItem(0);
        tc.isFalse(deferredCollection._isReset());
        calls.expectOnce(resetListener, "onResetPending");
        platformCollection.mock$resumeNotifications();
        calls.verify();
    });

    Tx.test("collectionTests.testCappedPlatformCollection", function (tc) {

        // Crank up the monitoring level
        if (!Jx.isUndefined(P.PlatformCollectionWatcher.VerificationLevel)) {
            P.PlatformCollectionWatcher.verificationLevel = P.PlatformCollectionWatcher.VerificationLevel.obsessive;
        }

        var calls = new M.CallVerifier(tc);
        var provider = { clone: function (item) { return item; } };
        var platformCollection = new MP.Collection("Stamp", provider);
        forEach.call("ABCDEFG", function (letter, index) {
            platformCollection.mock$addItem({ objectId: letter }, index);
        });

        var cappedValue = 4;
        // Make a capped-collection with a capped bound of 4.
        var cappedCollection = new P.CappedPlatformCollection(platformCollection, cappedValue);
        var listener = calls.hookEvents(cappedCollection, ["collectionchanged"]);

        // There are 7 items in the underlying collection, verify that our capped-collection tells
        // us there are only 4.
        verifyPlatformCollection(tc, cappedCollection, ["A", "B", "C", "D"]);

        // Add something to the end of the list, make sure we don't get the notification and the collection didn't change.
        platformCollection.mock$addItem({ objectId: "Q" }, platformCollection.count);
        verifyPlatformCollection(tc, cappedCollection, ["A", "B", "C", "D"]);

        // Add an item to the front and verify that we can both a remove and addition notification, in that correct order.
        var allowContinue = true;
        expectPlatformChange(
            tc, 
            calls, cappedCollection, listener,
            { eType: Plat.CollectionChangeType.itemRemoved, objectId: "C", index: 3 },
            ["Z", "A", "B", "C"], function () {
                expectPlatformChange(
                    tc, 
                    calls, cappedCollection, listener,
                    { eType: Plat.CollectionChangeType.itemAdded, objectId: "Z", index: 0 },
                    ["Z", "A", "B", "C"], function () {
                        allowContinue = false;
                });
        });
        platformCollection.mock$addItem({ objectId: "Z" }, 0); // Real collection: [Z,A,B,C,D,E,F,G]
        calls.verify();

        // Remove an item to the front and verify that we can both a remove and addition notification, in the correct order.
        allowContinue = true;
        expectPlatformChange(
            tc,
            calls, cappedCollection, listener,
            { eType: Plat.CollectionChangeType.itemRemoved, objectId: "Z", index: 0 },
            ["A", "B", "C", "D"], function () {
                expectPlatformChange(
                    tc,
                    calls, cappedCollection, listener,
                    { eType: Plat.CollectionChangeType.itemAdded, objectId: "D", index: 3 },
                    ["A", "B", "C", "D"], function () {
                        allowContinue = false;
                });
        });
        platformCollection.mock$removeItem(0); // Real collection: [A,B,C,D,E,F,G]
        calls.verify();

        // Reposition an item within the range of the capped bounds. Verify we only get a reposition notification.
        allowContinue = true;
        expectPlatformChange(
            tc,
            calls, cappedCollection, listener,
            { eType: Plat.CollectionChangeType.itemChanged, objectId: "A", index: 2 },
            ["B", "C", "A", "D"], function () {
                        allowContinue = false;
            });
        platformCollection.mock$moveItem(0, 2); // Real collection: [B,C,A,D,E,F,G]
        calls.verify();

        // Reposition an item outside the range of the capped bounds. Verify we and item removal and addition notification.
        allowContinue = true;
        expectPlatformChange(
            tc,
            calls, cappedCollection, listener,
            { eType: Plat.CollectionChangeType.itemRemoved, objectId: "E", index: 3 },
            ["B", "C", "A", "E"], function () {
                expectPlatformChange(
                    tc,
                    calls, cappedCollection, listener,
                    { eType: Plat.CollectionChangeType.itemAdded, objectId: "E", index: 3 },
                    ["B", "C", "A", "E"], function () {
                        allowContinue = false;
                });
        });
        platformCollection.mock$moveItem(3, 5); // Real collection: [B,C,A,E,F,D,G]
        calls.verify();
    });

    Tx.test("collectionTests.testQueryCollection", function (tc) {
        var provider = { clone: function (item) { return item; } };
        var collection = new MP.Collection("person", provider);
        var query1 = { runQuery: function () { } };
        var query2 = { runQuery: function () { } };
        var jobSet1 = { addUIJob: function () { } };
        var jobSet2 = { addUIJob: function () { } };
        var jobSet3 = { addUIJob: function () { } };

        var calls = new M.CallVerifier(tc);
        calls.initialize(query1, [ "runQuery" ]);
        calls.initialize(query2, [ "runQuery" ]);

        var queryCollection = new P.QueryCollection("itemType", new P.Callback(query1.runQuery, query1), "collectionName");
        var listener = calls.hookEvents(queryCollection, ["load", "changesPending"]);
        calls.verify();
        tc.isFalse(queryCollection.isLoaded);

        // Load the query
        calls.expectOnce(jobSet1, "addUIJob");
        queryCollection.load(jobSet1);
        calls.verify();
        tc.isFalse(queryCollection.isLoaded);

        // Cancel and reload the query
        var pendingCallbackObject, pendingCallbackFunction;
        calls.expectOnce(jobSet2, "addUIJob", null, function (callbackObject, callbackFunction) {
            pendingCallbackObject = callbackObject;
            pendingCallbackFunction = callbackFunction;
        });
        queryCollection.load(jobSet2);
        calls.verify();
        tc.isFalse(queryCollection.isLoaded);

        // Replace the query
        queryCollection.replace(new P.Callback(query2.runQuery, query2), jobSet3);
        calls.verify();
        tc.isFalse(queryCollection.isLoaded);

        // Complete the query
        calls.expectOnce(query2, "runQuery", null, function () {
            return collection;
        });
        calls.expectOnce(listener, "load");
        pendingCallbackFunction.call(pendingCallbackObject, collection);
        calls.verify();
        tc.isTrue(queryCollection.isLoaded);
    });
})();
