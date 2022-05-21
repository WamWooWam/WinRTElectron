

(function() {

    var U = Mail.UnitTest;
    var P = Microsoft.WindowsLive.Platform;
    var ChangeType = P.CollectionChangeType;

    // Verify that filters are applied as expected and maintain the original sort
    Tx.test("FilteredCollection_UnitTest.test_filter", function (tc) {
        var contents = "ABCDEFG"
        var source = createCollection(contents);
        var calls = new U.CallVerifier(tc);
        var adapter = createAdapter(all);

        var filtered = createFiltered(tc, source, adapter, calls, contents);
        var listener = calls.hookEvents(filtered, ["collectionchanged"]);

        // Apply some different filters and validate the results. This tests basic filtering
        // as well as resets to the source collection.
        [none, vowel, consonant].forEach(function (filter) {
            var expected = reduce(contents, function (prev, data) { return prev + (filter(data) ? data : ""); }, "");
            adapter.filter = filter;
            calls.expectOnce(listener, "collectionchanged", null, function (ev) {
                tc.areEqual(filtered, ev.target);
                tc.areEqual(ChangeType.reset, ev.eType);
            });
            calls.expectMany(contents.length, adapter, "unhook");
            calls.expectMany(contents.length, adapter, "hook");

            reset(source);
            verifyCollection(tc, filtered, expected, calls);
        });

        // Validate unhook when disposing a collection
        calls.expectMany(source.count, adapter, "unhook");
        filtered.dispose();
        calls.verify();
    });

    // Verify the filtered collection responds to item inserts in the source collection
    Tx.test("FilteredCollection_UnitTest.test_insert", function (tc) {
        var source = createCollection([2,3,4,7]);
        var calls = new U.CallVerifier(tc);
        var adapter = createAdapter(odd);

        // Should filter to 3 and 7 to start with
        var filtered = createFiltered(tc, source, adapter, calls, [3,7]);
        var listener = calls.hookEvents(filtered, ["collectionchanged"]);

        // Inserts to apply to the source collection
        var changes = [
            // source = [2,3,4,7]
            // match in the middle
            { data: 5, srcIndex: 3, expected: [3,5,7], evIndex: 1 },
            // source = [2,3,4,5,7]
            // non-match in the middle
            { data: 6, srcIndex: 4, expected: [3,5,7] },
            // source = [2,3,4,5,6,7]
            // match at the start
            { data: 1, srcIndex: 0, expected: [1,3,5,7], evIndex: 0 },
            // source = [1,2,3,4,5,6,7]
            // non-match at the start
            { data: 0, srcIndex: 0, expected: [1,3,5,7] },
            // source = [0,1,2,3,4,5,6,7]
            // non-match at the end
            { data: 8, srcIndex: 8, expected: [1,3,5,7] },
            // source = [0,1,2,3,4,5,6,7,8]
            // match at the end
            { data: 9, srcIndex: 9, expected: [1,3,5,7,9], evIndex: 4 }
            // source = [0,1,2,3,4,5,6,7,8,9]
        ];

        // Apply each change and validate the filter
        changes.forEach(function (change) {
            // Should be called when adding an item, even if it doesn't match the filter
            var item = { data: change.data, objectId: String(Jx.uid()) };
            calls.expectOnce(adapter, "hook", [item]);

            if (change.evIndex !== undefined) {
                // Inserts that match our filter should produce a collection change event
                calls.expectOnce(listener, "collectionchanged", null, function (ev) {
                    tc.areEqual(filtered, ev.target);
                    tc.areEqual(item.objectId, ev.objectId);
                    tc.areEqual(ChangeType.itemAdded, ev.eType);
                    tc.areEqual(change.evIndex, ev.index);
                });
            }

            source.insertItem(item, change.srcIndex);
            verifyCollection(tc, filtered, change.expected, calls);
        });
    });

    // Verify the filtered collection responds to item removals in the source collection
    Tx.test("FilteredCollection_UnitTest.test_remove", function (tc) {
        var source = createCollection(map("23456789", Number));
        var calls = new U.CallVerifier(tc);
        var adapter = createAdapter(odd);

        var filtered = createFiltered(tc, source, adapter, calls, [3,5,7,9]);
        var listener = calls.hookEvents(filtered, ["collectionchanged"]);

        // Removes to apply to the source collection
        var changes = [
            // source = [2,3,4,5,6,7,8,9]
            // non-match at the start
            { srcIndex: 0, expected: [3,5,7,9] },
            // source = [3,4,5,6,7,8,9]
            // non-match in the middle
            { srcIndex: 3, expected: [3,5,7,9] },
            // source = [3,4,5,7,8,9]
            // match at the end
            { srcIndex: 5, expected: [3,5,7], evIndex: 3 },
            // source = [3,4,5,7,8]
            // non-match at the end
            { srcIndex: 4, expected: [3,5,7] },
            // source = [3,4,5,7]
            // match in the middle
            { srcIndex: 2, expected: [3,7], evIndex: 1 },
            // source = [3,4,7]
            // match at the start
            { srcIndex: 0, expected: [7], evIndex: 0 },
            // source = [4,7]
            // final match
            { srcIndex: 1, expected: [], evIndex: 0 },
            // source = [4]
            // final non-match
            { srcIndex: 0, expected: [] }
            // source = []
        ];

        // Apply each change and validate the filter
        changes.forEach(function (change) {
            // Should be called to unhook when an item is removed from source
            var item = source.item(change.srcIndex);
            calls.expectOnce(adapter, "unhook", [item]);

            if (change.evIndex !== undefined) {
                // Removes that match our filter should produce a collection change event
                calls.expectOnce(listener, "collectionchanged", null, function (ev) {
                    tc.areEqual(filtered, ev.target);
                    tc.areEqual(item.objectId, ev.objectId);
                    tc.areEqual(ChangeType.itemRemoved, ev.eType);
                    tc.areEqual(change.evIndex, ev.index);
                    tc.areEqual(item, ev.removed[0]);
                });
            }

            source.removeItem(change.srcIndex);
            verifyCollection(tc, filtered, change.expected, calls);
        });
    });

    // Verify the filtered collection responds to item moves in the source collection
    Tx.test("FilteredCollection_UnitTest.test_move", function (tc) {
        var source = createCollection(map("23456789", Number));
        var calls = new U.CallVerifier(tc);
        var adapter = createAdapter(even);

        var filtered = createFiltered(tc, source, adapter, calls, [2,4,6,8]);
        var listener = calls.hookEvents(filtered, ["collectionchanged"]);

        // Moves to apply to the source collection
        var changes = [
            // source = [2,3,4,5,6,7,8,9]
            // non-match moves toward the end
            { srcPrev: 3, srcIndex: 4, expected: [2,4,6,8] },
            // source = [2,3,4,6,5,7,8,9]
            // non-match moves toward the start
            { srcPrev: 5, srcIndex: 3, expected: [2,4,6,8] },
            // source = [2,3,4,7,6,5,8,9]
            // match moves toward the start
            { srcPrev: 4, srcIndex: 3, expected: [2,4,6,8] },
            // source = [2,3,4,6,7,5,8,9]
            // match moves toward the end
            { srcPrev: 2, srcIndex: 5, expected: [2,6,4,8], evPrev: 1, evIndex: 2 },
            // source = [2,3,6,7,5,4,8,9]
            // match moves from start
            { srcPrev: 0, srcIndex: 6, expected: [6,4,8,2], evPrev: 0, evIndex: 3 },
            // source = [3,6,7,5,4,8,2,9]
            // non-match moves from end
            { srcPrev: 7, srcIndex: 4, expected: [6,4,8,2] },
            // source = [3,6,7,5,9,4,8,2]
            // match moves from end
            { srcPrev: 7, srcIndex: 3, expected: [6,2,4,8], evPrev: 3, evIndex: 1 },
            // source = [3,6,7,2,5,9,4,8]
            // non-match moves from start
            { srcPrev: 0, srcIndex: 7, expected: [6,2,4,8] }
            // source = [6,7,2,5,9,4,8,3]
        ];

        // Apply each change and validate the filter
        changes.forEach(function (change) {
            var item = source.item(change.srcPrev);

            if (change.evIndex !== undefined) {
                // Moves that match our filter should produce a collection change event
                calls.expectOnce(listener, "collectionchanged", null, function (ev) {
                    tc.areEqual(filtered, ev.target);
                    tc.areEqual(item.objectId, ev.objectId);
                    tc.areEqual(ChangeType.itemChanged, ev.eType);
                    tc.areEqual(change.evPrev, ev.previousIndex);
                    tc.areEqual(change.evIndex, ev.index);
                });
            }

            source.moveItem(change.srcPrev, change.srcIndex);
            verifyCollection(tc, filtered, change.expected, calls);
        });
    });

    // Verifies FilteredCollection.update can be used to explitly add/remove items from
    // the collection, firing events when this occurs
    Tx.test("FilteredCollection_UnitTest.test_update", function (tc) {
        var source = createCollection("ABCDEFG");
        var calls = new U.CallVerifier(tc);
        var adapter = createAdapter(vowel);

        // Filter down to just the vowels
        var filtered = createFiltered(tc, source, adapter, calls, "AE");
        var listener = calls.hookEvents(filtered, ["collectionchanged"]);

        // Updates to apply to items in the collection
        var changes = [
            // source = A B C D E F G
            // change a non-match to a non-match
            { srcIndex: 6, data: "Z", expected: "AE" },
            // source = A B C D E F Z
            // change a match to a match
            { srcIndex: 0, data: "O", expected: "OE" },
            // source = O B C D E F Z
            // change a non-match to a match
            { srcIndex: 3, data: "I", expected: "OIE", evType: ChangeType.itemAdded, evIndex: 1 },
            // source = O B C I E F Z
            // change a match to a non-match
            { srcIndex: 4, data: "D", expected: "OI", evType: ChangeType.itemRemoved, evIndex: 2 }
            // source = O B C I D F Z
        ]

        // Apply each change and validate the filter
        changes.forEach(function (change) {
            var item = source.item(change.srcIndex);

            if (change.evType !== undefined) {
                // Should get add/remove events as a result of this update
                calls.expectOnce(listener, "collectionchanged", null, function (ev) {
                    tc.areEqual(filtered, ev.target);
                    tc.areEqual(item.objectId, ev.objectId);
                    tc.areEqual(change.evType, ev.eType);
                    tc.areEqual(change.evIndex, ev.index);
                });
            }

            // Update the item and validate the change
            item.data = change.data;
            filtered.update(item);
            verifyCollection(tc, filtered, change.expected, calls);
        });
    });

    function createFiltered(tc, source, adapter, calls, expected) {
        // Should be called for each item in the source collection
        calls.expectMany(source.count, adapter, "hook");

        // Filtered collection should match original contents since we said everything matches
        var filtered = new Mail.FilteredCollection(adapter, source)
        verifyCollection(tc, filtered, expected, calls);
        return filtered;
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

    function all() { return true; };
    function none() { return false; };
    function odd(num) { return num % 2; };
    function even(num) { return !odd(num); };
    function letter(c) { return "A" < c && c <= "Z"; };
    function vowel(c) { return "AEIOU".indexOf(c) !== -1; };
    function consonant(c) { return letter(c) && !vowel(c); };

    function createAdapter(filter) {
        return {
            filter: filter,
            matches: function (item) { return this.filter(item.data); },
            setCallback: function () {},
            hook: function () {},
            unhook: function () {}
        };
    }
})();
