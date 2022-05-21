
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
(function () {

    var U = Mail.UnitTest;
    var Helper = Mail.SelectionHelper;
    var EventTypes = Helper.EventTypes;
    var InvokeTypes = Mail.SelectionModel.InvokeTypes;


    var setup = function (tc, options) {
        tc.cleanup = function () {
            Jx.scheduler.testFlush();
            if (tc.preserve) {
                tc.preserve.restore();
            }
            Mail.Globals = {};
        };

        tc.preserve = null;

        tc.target = null;
        tc.collection = null;
        tc.listView = null;

        Mail.Globals = {};
        // Preserve our test state
        tc.preserve = Jm.preserve(this, ["_target", "_collection", "_listView"]);

        createTarget(tc, options);
    };

    Tx.test("SelectionModel_UnitTest.test_basicProperties", {owner: "kepoon", priority: 0}, function (tc) {
        setup(tc, { selection: [0, 1, 2, 3], count: 5 });
        verifyValues(tc, { count: 5, selection: [0, 1, 2, 3] });
    });


    Tx.test("SelectionModel_UnitTest.test_selectionChanged_keyboard", {owner: "kepoon", priority: 0}, function (tc) {
        setup(tc, { selection: [0, 1, 2], count: 5 });

        verifyValues(tc, { count: 5, selection: [0, 1, 2] });

        // Now change the selection "via keyboard"
        var ev = {};
        prepare(tc, { selection: [1, 2, 3], count: 6 });
        tc.target._onKeyboardNavigating();
        runSelectionChanged(tc, ev);

        verifyValues(tc, { count: 6, selection: [1, 2, 3] });
        Jm.verify(tc.target.raiseEvent)("selectionchanged", ev);
        tc.areEqual(InvokeTypes.keyboard, ev.invokeType, "expected keyboard invocation");

        // re-select the same index, viaKeyboard should be false
        runSelectionChanged(tc, ev);
        verifyValues(tc, { count: 6, selection: [1, 2, 3] });
        Jm.verify(tc.target.raiseEvent)("selectionchanged", ev);
        tc.isTrue(ev.invokeType !== InvokeTypes.keyboard, "expected non keyboard invocation");
    });

    Tx.test("SelectionModel_UnitTest.test_selectionChanged_tap", {owner: "kepoon", priority: 0}, function (tc) {
        setup(tc, { selection: [0, 1, 2], count: 5 });
        verifyValues(tc, { count: 5, selection: [0, 1, 2] });

        // Now change the selection "via touch"
        var changedEvent = {}, invokeEvent = {
            detail : {
                itemIndex : 2
            }
        };
        prepare(tc, { selection: [1, 2, 3], count: 6 });
        U.ensureSynchronous(function () {
            // itemInvoked comes after selectionChanged from listview
            tc.target._onSelectionChanged(changedEvent);
            tc.target._onTapInvoked(invokeEvent);
        }.bind(this));

        verifyValues(tc, { count: 6, selection: [1, 2, 3] });

        var inOrder = Jm.inOrder();
        inOrder.verify(tc.target.raiseEvent)("iteminvoked", invokeEvent);
        inOrder.verify(tc.target.raiseEvent)("selectionchanged", changedEvent);
        inOrder.verifyNot(tc.target.raiseEvent)("iteminvoked", invokeEvent); // Ensure we fired iteminvoked just once
        tc.areEqual(InvokeTypes.tap, changedEvent.invokeType, "expected tap invocation");
    });

    // Ensure we fire the invoke event even if we never get a selectionchanged event (this happens when you click on a selected item)
    Tx.test("SelectionModel_UnitTest.test_invokeWithoutSelectionChanged", {owner: "kepoon", priority: 0}, function (tc) {
        setup(tc, { selection: [1, 2, 3], count: 6 });

        var invokeEvent = {
            detail : {
                itemIndex : 2
            }
        };
        U.ensureSynchronous(function () {
            tc.target._onTapInvoked(invokeEvent);
        }.bind(this));

        var inOrder = Jm.inOrder();
        inOrder.verify(tc.target.raiseEvent)("iteminvoked", invokeEvent);
        inOrder.verifyNot(tc.target.raiseEvent)("iteminvoked", invokeEvent); // Ensure we fired iteminvoked just once
    });

    // Helpers

    var createTarget = function (tc, options) {
        /// <param name="options" type="Object">selection,count</param>
        tc.isTrue(Jx.isArray(options.selection));
        tc.isTrue(Jx.isNumber(options.count));

        var mockElement = document.createElement("div");
        tc.collection = _createCollection();
        Jm.when(tc.collection).count.thenReturn(options.count);

        for (var i = 0; i < options.count; i++) {
            Jm.when(tc.collection).item(i).thenReturn({
                objectId: _objectId(i),
                pendingRemoval: false,
                selectable: true
            });
        }

        tc.listView = Jm.mock(WinJS.UI.ListView.prototype);
        Jm.when(tc.listView).selection.thenReturn({
            getIndices: function () { return options.selection; },
            count: function () { return options.selection.length; }
        });
        Jm.when(tc.listView).element.thenReturn(mockElement);

        tc.target = new Mail.SelectionModel(tc.collection, tc.listView);
        tc.target.raiseEvent = Jm.mockFn();
    };

    var runSelectionChanged = function (tc, ev) {
        U.ensureSynchronous(function () {
            tc.target._onSelectionChanged(ev);
        });
    };

    var prepare = function (tc, options) {
        /// <param name="options" type="Object">selection,count</param>
        tc.isTrue(Jx.isArray(options.selection));
        tc.isTrue(Jx.isNumber(options.count));

        Jm.when(tc.listView).selection.thenReturn({
            getIndices: function () { return options.selection; },
            count: function () { return options.selection.length; }
        });
        Jm.when(tc.collection).count.thenReturn(options.count);

        for (var i = 0; i < options.count; i++) {
            Jm.when(tc.collection).item(i).thenReturn({
                objectId: _objectId(i),
                pendingRemoval: false,
                selectable: true
            });
        }
    };

    var verifyValues = function (tc, expected) {
        /// <param name="expected" type="Object">count,selection</param>
        tc.isTrue(Jx.isNumber(expected.count));
        tc.isTrue(Jx.isArray(expected.selection));

        // isValidIndex
        tc.isFalse(tc.target.isValidIndex(-1), "-1 should be an invalid index");
        for (var i = 0; i < expected.count; i++) {
            tc.isTrue(tc.target.isValidIndex(i), "index should be valid:" + i + " count:" + expected.count);
        }
        tc.isFalse(tc.target.isValidIndex(expected.count), "count should be an invalid index");

        // selection
        assertArraysEqual(tc, expected.selection, tc.target.selection().indices, "selection");

        // selectedItems
        var expectedSelectedItems = expected.selection.map(function (index) {
            var item = tc.collection.item(index);
            tc.isTrue(Jx.isNonEmptyString(item.objectId));
            return item;
        }.bind(this));
        assertArraysEqual(tc, expectedSelectedItems, tc.target.selection().items, "selectedItems");

        // indexOfObject
        for (i = 0; i < expected.count; i++) {
            var expectedIndex = expected.selection.indexOf(i) === -1 ? -1 : i,
                item = tc.collection.item(i);
            tc.isTrue(Jx.isNonEmptyString(item.objectId));

            tc.areEqual(expectedIndex, tc.target.selection().indexOfObject(item.objectId),
                "unexpected indexOfObject for object:" + item.objectId + " at expectedIndex:" + expectedIndex);
        }

        // isIndexSelected
        for (i = 0; i < expected.count; i++) {
            var expectedLocal = expected.selection.indexOf(i) !== -1;
            tc.areEqual(expectedLocal, tc.target.selection().isIndexSelected(i), "unexpected isIndexSelected at i:" + i);
        }
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

    var _createCollection = function () {
        var collection = Jm.mock(Mail.MessageListCollection.prototype);
        collection.mockedType = Mail.TrailingItemCollection;
        return collection;
    };

    var _objectId = function (index) {
        return "object:" + index;
    };
})();