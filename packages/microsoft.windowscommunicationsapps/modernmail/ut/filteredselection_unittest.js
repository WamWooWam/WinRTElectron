
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
(function () {

    Tx.test("FilteredSelection_UnitTest_testCollectionChnaged_itemAdded", { owner: "kepoon", priority: 0 }, function (tc) {
        setup(tc, {
            selection: [1, 3, 4],
            collectionCount : 10
        });
        verifySelection(tc, [1, 3, 4], ["item1", "item3", "item4"]);
        // insert item in between
        tc.collection.mock$addItem(2, "*");
        verifySelection(tc, [1, 4, 5], ["item1", "item3", "item4"]);
    });

    Tx.test("FilteredSelection_UnitTest_testCollectionChnaged_itemDeleted", { owner: "kepoon", priority: 0 }, function (tc) {
        setup(tc, {
            selection: [1, 3, 4],
            collectionCount: 10
        });
        verifySelection(tc, [1, 3, 4], ["item1", "item3", "item4"]);
        // insert item in between
        tc.collection.mock$removeItem(3);
        verifySelection(tc, [1, 3], ["item1", "item4"]);

        // do a diff
        var diff = tc.target.diff([1, 3]);
        tc.areEqual(diff.deletedItems.length, 1);
        tc.areEqual(diff.deletedItems[0].objectId, "item3");
        tc.areEqual(tc.target.items.length, 2);
    });


    Tx.test("FilteredSelection_UnitTest_testDiff_same", {owner: "kepoon", priority: 0}, function (tc) {
        runDiffTestCase(tc, [1, 2, 3], [1, 2, 3], [], []);
    });

    Tx.test("FilteredSelection_UnitTest_testDiff_addOnly", {owner: "kepoon", priority: 0}, function (tc) {
        runDiffTestCase(tc, [], [1, 2, 3], [1, 2, 3], []);
        runDiffTestCase(tc, [2, 3], [1, 2, 3], [1], []);
        runDiffTestCase(tc, [2, 3], [2, 3, 4], [4], []);
    });

    Tx.test("FilteredSelection_UnitTest_testDiff_removeOnly", {owner: "kepoon", priority: 0}, function (tc) {
        runDiffTestCase(tc, [1, 2, 3], [], [], [1, 2, 3]);
        runDiffTestCase(tc, [1, 2, 3], [2, 3], [], [1]);
        runDiffTestCase(tc, [1, 2, 3], [1, 2], [], [3]);
        runDiffTestCase(tc, [1, 2, 3], [1, 3], [], [2]);
    });

    Tx.test("FilteredSelection_UnitTest_testDiff_mix", {owner: "kepoon", priority: 0}, function (tc) {
        runDiffTestCase(tc, [1, 2, 3], [1, 4, 7], [4, 7], [2, 3]);
        runDiffTestCase(tc, [1, 2, 3], [4, 5, 6], [4, 5, 6], [1, 2, 3]);
        runDiffTestCase(tc, [4, 5, 6], [1, 2, 3], [1, 2, 3], [4, 5, 6]);
    });

    // Helpers
    var setup = function (tc, options) {
        Debug.assert(Jx.isArray(options.selection));
        Debug.assert(Jx.isNumber(options.collectionCount));

        tc.collection = new MockCollection(options.collectionCount);
        tc.target = new Mail.FilteredSelection(options.selection, tc.collection);
    };

    var verifySelection = function (tc, indices, ids) {
        var newSelection = tc.target,
            indexString = "[" + indices.join(", ") + "]";

        tc.areEqual(newSelection.length, indices.length, "selection length do not match");
        indices.forEach(function (index, i) {
            tc.areEqual(tc.collection.item(index).objectId, ids[i], "The id of the indices do not match");
            tc.isTrue(newSelection.isIndexSelected(index), "Expecting:= " + indexString + " actual:=[" + newSelection.indices.join(", ") + "]");
        });
    };

    var MockCollection = function (count) {
        this.mockedType = Mail.TrailingItemCollection;
        this._items = [];
        for (var i = 0; i < count; i++) {
            this._items.push({
                pendingRemoval: false,
                selectable: true,
                objectId: "item" + i,
            });
        }
    };
    Jx.augment(MockCollection, Jx.Events);
    Debug.Events.define(MockCollection.prototype, "itemAdded", "itemRemoved", "itemMoved", "reset", "beginChanges", "endChanges");


    MockCollection.prototype.mock$addItem = function (index, itemId) {
        this._items.splice(index, 0, {
            pendingRemoval: false,
            selectable: true,
            objectId: itemId,
        });
        this.raiseEvent("itemAdded");
    };

    MockCollection.prototype.mock$removeItem = function (index) {
        this._items.splice(index, 1);
        this.raiseEvent("itemRemoved");
    };

    MockCollection.prototype.item = function (index) {
        return this._items[index];
    };

    Object.defineProperty(MockCollection.prototype, "count", {
        get: function () {
            return this._items.length;
        }
    });

    Object.defineProperty(MockCollection.prototype, "totalCount", {
        get: function () {
            return this._items.length;
        }
    });

    var runDiffTestCase = function (tc, oldSelection, newSelection, added, removed) {
        var result = Mail.FilteredSelection.diff(oldSelection, newSelection);
        assertArraysEqual(tc, added, result.added, "itemsAdded");
        assertArraysEqual(tc, removed, result.removed, "itemsRemoved");
    };

    var assertArraysEqual = function (tc, arr1, arr2, arrayName, notEqual) {
        tc.isTrue(Jx.isArray(arr1));
        tc.isTrue(Jx.isArray(arr2));
        notEqual = Jx.isBoolean(notEqual) ? notEqual : false;

        var verifyFn = function (expected, actual, property) {
            var val1 = expected[property], val2 = actual[property];
            if (notEqual && val1 !== val2) {
                return false;
            }
            tc.areEqual(val1, val2, arrayName + "." + property + " does not match");
            return true;
        };

        if (!verifyFn(arr1, arr2, "length")) {
            return;
        }
        for (var i = 0; i < arr1.length; i++) {
            if (!verifyFn(arr1, arr2, i)) {
                return;
            }
        }
    };
})();