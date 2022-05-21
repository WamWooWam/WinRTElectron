
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail,Jx,Debug,Microsoft,JmDefs,Jm,Tx*/
(function () {

    var setup = function (tc) {
        JmDefs.bindUtVerify(tc);

        tc.addCleanup(function () {
            JmDefs.unbindUtVerify(tc);
            tc.messageCollection = null;
            tc.collection = null;
            tc.trailingItem = null;
        });

        tc.collection = null;
        tc.messageCollection = null;
        tc.trailingItem = null;
    };

    var createTarget = function (tc, contents, isTrailingItemVisible) {
        setup(tc);

        // create the trailingItem
        var trailingItem = Jm.mock(Mail.FolderEndOfListItem);
        // create the underlying collection
        Jm.when(trailingItem).visible.thenReturn(isTrailingItemVisible);
        Jm.when(trailingItem).objectId.thenReturn("trailingItemObjectId");
        var messageCollection = Jm.mock(Mail.MessageListCollection);

        // override item
        Jm.when(messageCollection).item(Jm.ANY).then(function (i) {
            return contents[i];
        });

        // override addListener
        var MockEventSource = function () {};
        Jx.augment(MockEventSource, Jx.Events);
        Debug.Events.define(MockEventSource.prototype, "beginChanges", "itemAdded", "itemRemoved", "itemMoved", "reset", "endChanges");

        var mockEventSource = new MockEventSource();
        Jm.when(messageCollection).addListener(Jm.ANY).then(function () {
            mockEventSource.addListener.apply(mockEventSource, arguments);
        });

        // override raiseEvent
        Jm.when(messageCollection).raiseEvent(Jm.ANY).then(function () {
            mockEventSource.raiseEvent.apply(mockEventSource, arguments);
        });

        tc.trailingItem = trailingItem;
        Jm.when(messageCollection).count.then(function () {
            return contents.length;
        });
        tc.messageCollection = messageCollection;

        // create the trailing item collection
        tc.collection = new Mail.TrailingItemCollection(messageCollection, trailingItem);
        tc.collection.raiseEvent = Jm.mockFn(); // override raise event so that we can listen for them in verification
    };

    // Conditions:
    // Trailing Item is Hidden
    //
    // Expected:
    // Verify that the trailingCollection.item(i) === collection.item(i)
    Tx.test("TrailingItemCollection_UnitTest.test_hiddenTrailingItem", {owner: "kepoon", priority: 0}, function (tc) {
        var collectionContents = ["A", "B", "C", "D", "E"];
        createTarget(tc, collectionContents, false);

        // verify the count is the same
        tc.areEqual(tc.messageCollection.count, tc.collection.count, "The count should match");

        // verify all contents of the collection are the same
        for (var i = 0; i < tc.collection.count; i++) {
            tc.areEqual(tc.collection.item(i), tc.messageCollection.item(i));
        }
    });

    // Conditions:
    // Trailing Item is shown
    //
    // Expected:
    // Verify that the trailingCollection.item(i) === collection.item(i) except for the last one
    Tx.test("TrailingItemCollection_UnitTest.test_visibleTrailingItem", {owner: "kepoon", priority: 0}, function (tc) {
        var collectionContents = ["A", "B", "C", "D", "E"];
        createTarget(tc, collectionContents, true);

        // verify the count is the same
        tc.areEqual(tc.messageCollection.count + 1, tc.collection.count, "The count should match");

        // verify all contents of the collection are the same
        for (var i = 0; i < tc.messageCollection.count; i++) {
            tc.areEqual(tc.collection.item(i), tc.messageCollection.item(i));
        }

        var lastItem = tc.collection.item(tc.collection.count - 1);
        tc.areEqual(lastItem, tc.trailingItem);
    });

    // Conditions:
    // Empty collection with trailing Item visible
    //
    // Expected:
    // Verify that the trailingCollection.item(i) === collection.item(i) except for the last one
    Tx.test("TrailingItemCollection_UnitTest.test_emptyCollection", {owner: "kepoon", priority: 0}, function (tc) {
        createTarget(tc, [], true);

        // verify the count is the same
        tc.areEqual(tc.collection.count, 1, "The count should match");

        // verify all contents of the collection are the same
        var lastItem = tc.collection.item(tc.collection.count - 1);
        tc.areEqual(lastItem, tc.trailingItem);
    });

    // Conditions:
    // Fire events on the underlying collection
    //
    // Expected:
    // The trailing collection should fire the same events
    Tx.test("TrailingItemCollection_UnitTest.test_forwardEvents", {owner: "kepoon", priority: 0}, function (tc) {
        createTarget(tc, [], true);
        var expectedEvents = [
            { name: "beginChanges", data: null},
            { name: "itemAdded", data: { index: 0, prevId: null, nextId: null}},
            { name: "itemRemoved", data: { index: 0, prevId: null, nextId: null}},
            { name: "itemMoved", data: { index: 1, prevId: null, nextId: "A"}},
            { name: "endChanges", data: null},
            { name: "reset", data: null}
        ];

        expectedEvents.forEach(function (evt) {
            tc.messageCollection.raiseEvent(evt.name, evt.data);
            Jm.verify(tc.collection.raiseEvent)(evt.name, Jm.Verifiers.deepCompare(evt.data));
        }.bind(this));
    });

    // Conditions:
    // Start with the trailing item hidden
    // Show the trailing item
    //
    // Expected:
    // The itemAdded event is fired, the collection count is incremented
    Tx.test("TrailingItemCollection_UnitTest.test_showTrailingItem1", {owner: "kepoon", priority: 0}, function (tc) {
        createTarget(tc, [{ objectId: "A"}], false);
        var expectedData = tc.trailingItem,
            expectedIndex = tc.collection.count,
            expectedChangeType = Microsoft.WindowsLive.Platform.CollectionChangeType.itemAdded;

        tc.collection._showTrailingItem();

        Jm.verify(tc.collection.raiseEvent)("itemAdded", Jm.Verifiers.deepCompare({
                eType: expectedChangeType,
                index: expectedIndex,
                previousIndex: 0,
                objectId: expectedData.objectId,
                data: expectedData
            }));

        tc.areEqual(tc.collection.count, 2, "The count should match");
    });

    // Conditions:
    // Start with the trailing item hidden
    // Show it again
    //
    // Expected:
    // Nothing should fired
    Tx.test("TrailingItemCollection_UnitTest.test_showTrailingItem2", {owner: "kepoon", priority: 0}, function (tc) {
        createTarget(tc, [{ objectId: "A"}], true);
        var countBefore = tc.collection.count;
        tc.collection._showTrailingItem();
        Jm.verifyNot(tc.collection.raiseEvent)(Jm.ANY); // Sanity - Nothing should change
        tc.areEqual(tc.collection.count, countBefore, "The count should not change");
    });


    // Conditions:
    // Start with the trailing item shown
    // Hide the trailing item
    //
    // Expected:
    // The itemRemoved event is fired, the collection count is decremented
    Tx.test("TrailingItemCollection_UnitTest.test_hideTrailingItem1", {owner: "kepoon", priority: 0}, function (tc) {
        createTarget(tc, [{ objectId: "A"}], true);
        var expectedData = tc.trailingItem,
            expectedChangeType = Microsoft.WindowsLive.Platform.CollectionChangeType.itemRemoved;

        tc.collection._hideTrailingItem();

        Jm.verify(tc.collection.raiseEvent)("itemRemoved", Jm.Verifiers.deepCompare({
                eType: expectedChangeType,
                index: 1,
                previousIndex: 0,
                objectId: expectedData.objectId,
                data: expectedData
            }));

        tc.areEqual(tc.collection.count, 1, "The count should match");
    });

    // Conditions:
    // Start with the trailing item hidden
    // Hide the trailing item again
    //
    // Expected:
    // Nothing should fired
    Tx.test("TrailingItemCollection_UnitTest.test_hideTrailingItem2", {owner: "kepoon", priority: 0}, function (tc) {
        createTarget(tc, [{ objectId: "A"}], false);
        var countBefore = tc.collection.count;
        tc.collection._hideTrailingItem();
        Jm.verifyNot(tc.collection.raiseEvent)(Jm.ANY); // Sanity - Nothing should change
        tc.areEqual(tc.collection.count, countBefore, "The count should not change");
    });
})();
