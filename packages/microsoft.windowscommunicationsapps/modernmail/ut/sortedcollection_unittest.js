
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function() {

    var U = Mail.UnitTest;
    var P = Microsoft.WindowsLive.Platform;
    var ChangeType = P.CollectionChangeType;

    // Verify that sorts are applied as expected
    Tx.test("SortedCollection_UnitTest.test_sort", {owner:"neilpa", priority:0}, function (tc) {
        var source = createCollection("QWERTY");
        var expected = "EQRTWY";
        var calls = new U.CallVerifier(tc);

        var sorted = createSorted(tc, source, adapter, calls, expected);
        var listener = calls.hookEvents(sorted, ["collectionchanged"]);

        // Moves in the source collection should be entirely ignored
        source.moveItem(0, 5);
        verifyCollection(tc, sorted, expected, calls);

        // Resetting the source collection should produce the same sort
        calls.expectOnce(listener, "collectionchanged", null, function (ev) {
            tc.areEqual(sorted, ev.target);
            tc.areEqual(ChangeType.reset, ev.eType);
        });
        calls.expectMany(expected.length, adapter, "unhook");
        calls.expectMany(expected.length, adapter, "hook");
        reset(source);
        verifyCollection(tc, sorted, expected, calls);

        // Validate unhook when disposing a collection
        calls.expectMany(source.count, adapter, "unhook");
        sorted.dispose();
        calls.verify();
    });

    // Verify the sorted collection responds to item inserts in the source collection
    Tx.test("SortedCollection_UnitTest.test_insert", {owner:"neilpa", priority:0}, function (tc) {
        var source = createCollection("QWER");
        var calls = new U.CallVerifier(tc);

        var sorted = createSorted(tc, source, adapter, calls, "EQRW");
        var listener = calls.hookEvents(sorted, ["collectionchanged"]);

        // Inserts to apply to the source collection
        var changes = [
            { data: "B", srcIndex: 4, expected: "BEQRW" }, // sorts to the front
            { data: "X", srcIndex: 0, expected: "BEQRWX" }, // sorts to the end
            { data: "S", srcIndex: 1, expected: "BEQRSWX" }, // sorts to the middle
            { data: "P", srcIndex: 3, expected: "BEPQRSWX" }, // sorts to the middle
        ];

        // Apply each change and validate the sort
        changes.forEach(function (change) {
            // Hook should be called for each added item
            var item = { data: change.data, objectId: String(Jx.uid()) };
            calls.expectOnce(adapter, "hook", [item]);

            // Validate we get an insert event for the new item
            calls.expectOnce(listener, "collectionchanged", null, function (ev) {
                tc.areEqual(sorted, ev.target);
                tc.areEqual(item.objectId, ev.objectId);
                tc.areEqual(ChangeType.itemAdded, ev.eType);
                tc.areEqual(change.expected.indexOf(item.data), ev.index);
            });

            source.insertItem(item, change.srcIndex);
            verifyCollection(tc, sorted, change.expected, calls);
        });
    });

    // Verify the sorted collection responds to item removals in the source collection
    Tx.test("SortedCollection_UnitTest.test_remove", {owner:"neilpa", priority:0}, function (tc) {
        var source = createCollection("ZXCVBNM");
        var calls = new U.CallVerifier(tc);

        var expected = "BCMNVXZ";
        var sorted = createSorted(tc, source, adapter, calls, expected);
        var listener = calls.hookEvents(sorted, ["collectionchanged"]);

        // Removes items one at a time until the collection is empty
        var changes = [
            { srcIndex: 0, evIndex: 6, expected: "BCMNVX" }, // remove Z, source: XCVBNM
            { srcIndex: 3, evIndex: 0, expected: "CMNVX" },  // remove B, source: XCVNM
            { srcIndex: 4, evIndex: 1, expected: "CNVX" },   // remove M, source: XCVN
            { srcIndex: 0, evIndex: 3, expected: "CNV" },    // remove X, source: CVN
            { srcIndex: 0, evIndex: 0, expected: "NV" },     // remove C, source: VN
            { srcIndex: 0, evIndex: 1, expected: "N" },      // remove V, source: N
            { srcIndex: 0, evIndex: 0, expected: "" },       // remove N, source:
        ];

        // Apply each remove and validate the sort
        changes.forEach(function (change) {
            // Should be called to unhook when an item is removed from source
            var item = source.item(change.srcIndex);
            calls.expectOnce(adapter, "unhook", [item]);

            // Verify the correct event is raised for the removal
            calls.expectOnce(listener, "collectionchanged", null, function (ev) {
                tc.areEqual(sorted, ev.target);
                tc.areEqual(item.objectId, ev.objectId);
                tc.areEqual(ChangeType.itemRemoved, ev.eType);
                tc.areEqual(change.evIndex, ev.index);
                tc.areEqual(item, ev.removed[0]);
            });

            source.removeItem(change.srcIndex);
            verifyCollection(tc, sorted, change.expected, calls);
        });
    });

    // Verify when items are updated we can re-sort them and generate move events
    Tx.test("SortedCollection_UnitTest.test_update", {owner:"neilpa", priority:0}, function (tc) {
        var source = createCollection("QWERTY");
        var calls = new U.CallVerifier(tc);

        var sorted = createSorted(tc, source, adapter, calls, "EQRTWY");
        var listener = calls.hookEvents(sorted, ["collectionchanged"]);

        // Change items in the underlying collection to cause items to be re-sorted
        var dvorak = [
            { data: "D", expected: "DERTWY", evPrev: 1, evIndex: 0 },
            { data: "V", expected: "DERTVY" },
            { data: "O", expected: "DORTVY" },
            { data: "R", expected: "DORTVY" },
            { data: "A", expected: "ADORVY", evPrev: 3, evIndex: 0 },
            { data: "K", expected: "ADKORV", evPrev: 5, evIndex: 2 }
        ];

        // Reverse the changes back to the original
        var qwerty = [
            { data: "Q", expected: "AKOQRV", evPrev: 1, evIndex: 3 },
            { data: "W", expected: "AKOQRW" },
            { data: "E", expected: "AEKQRW", evPrev: 2, evIndex: 1 },
            { data: "R", expected: "AEKQRW" },
            { data: "T", expected: "EKQRTW", evPrev: 0, evIndex: 4 },
            { data: "Y", expected: "EQRTWY", evPrev: 1, evIndex: 5 }
        ];

        function validateUpdate(changes) {
            changes.forEach(function (change, srcIndex) {
                var item = source.item(srcIndex);

                if (change.evPrev !== undefined) {
                    // Should get move events for updates that cause the sorted item to move
                    calls.expectOnce(listener, "collectionchanged", null, function (ev) {
                        tc.areEqual(sorted, ev.target);
                        tc.areEqual(item.objectId, ev.objectId);
                        tc.areEqual(ChangeType.itemChanged, ev.eType);
                        tc.areEqual(change.evPrev, ev.previousIndex);
                        tc.areEqual(change.evIndex, ev.index);
                    });
                }

                // Update the item and validate the change
                item.data = change.data;
                sorted.update(item);
                verifyCollection(tc, sorted, change.expected, calls);
            });
        };

        // Apply each change and validate the sort
        validateUpdate(dvorak);
        validateUpdate(qwerty);
    });

    function createSorted(tc, source, adapter, calls, expected) {
        // Should be called for each item in the source collection
        calls.expectMany(source.count, adapter, "hook");

        // Sorted collection should match original contents since we said everything matches
        var sorted = new Mail.SortedCollection(adapter, source)
        verifyCollection(tc, sorted, expected, calls);
        return sorted;
    }

    function verifyCollection(tc, collection, contents, calls) {
        tc.areEqual(collection.count, contents.length);
        forEach(contents, function (data, index) {
            tc.areEqual(collection.item(index).data, data);
        });
        calls.verify();
    }

    function createCollection(contents) {
        var collection = new Mail.ArrayCollection(map(contents, function (data, index) {
            return { data: data, objectId: String(Jx.uid()) };
        }));
        collection.unlock();
        return collection;
    }

    function reset(collection) {
        collection.raiseEvent("collectionchanged", {
            target: collection,
            eType: ChangeType.reset,
            removed: collection.map(function (item) { return item; })
        });
    }

    function forEach(sequence, fn, context) { Array.prototype.forEach.call(sequence, fn, context); }
    function map(sequence, fn, context) { return Array.prototype.map.call(sequence, fn, context); }
    function reduce(sequence, fn, initial) { return Array.prototype.reduce.call(sequence, fn, initial); }

    function strcmp(a, b) { return a.data.localeCompare(b.data); };
    var adapter = { compare: strcmp, setCallback: function () {}, hook: function () {}, unhook: function () {} };

})();

