
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,WinJS,Jx,Debug,Tx,Microsoft*/

(function () {
    var Plat = Microsoft.WindowsLive.Platform;

    function setupTestCase(tc, options) {
        tc.collection = new MockCollection(tc, options.collection, options.threaded, null);
        if (Jx.isNumber(options.expandedIndex)) {
            tc.collection.expand(options.expandedIndex);
        }
        tc.model = new MockSelectionModel(tc, options.selection, tc.collection);
        tc.handler = {
            mockedType : Mail.SelectionHandler,
            exitSelectionMode: function () {
                this.isSelectionMode = false;
                tc.target.dispose();
                if (tc.controller) {
                    tc.controller.exitSelectionMode();
                    tc.controller.setModel(tc.model);
                }
            },
            enterSelectionMode : function () {
                this.isSelectionMode = true;
                createTarget(tc);
                if (tc.controller) {
                    tc.controller.setModel(tc.target);
                    tc.controller.setNodeExpansionHandler(tc.target);
                }
            }
        };

        if (options.enableController) {
            tc.selection = new MockSelection();
            tc.controller = new Mail.SelectionController(tc.collection, tc.selection, tc.model, tc.handler);
            tc.controller._displayedItemManager.handleSelectionChange(tc.model.selection(), false);
        }
       

        if (!options.doNotEnterSelectionMode) {
            tc.handler.enterSelectionMode();
        }

        tc.tearDown = function () {
            Jx.dispose(tc.target);
            tc.target = null;
            tc.collection = null;
            tc.model = null;
            tc.handler = null;
        };
    }

    var createTarget = function (tc) {
        var mockView = {
            mockedType: Mail.UIDataModel.MailView,
            type: Plat.MailViewType.inbox
        };
        tc.target = new Mail.SelectionAggregator(tc.collection, tc.model, mockView, tc.handler);
        tc.target._exitSelectionMode = function () {
            tc.target._exitSelectionMode = Jx.fnEmpty;
            this._handler.exitSelectionMode();
        };
    };
    var verifyLogicalSelection = function (tc, ids) {
        var newSelection = tc.target.selection(),
            logicalItems = newSelection.logicalItems;

        tc.areEqual(logicalItems.length, ids.length, "selection length do not match");
        logicalItems.forEach(function (item) {
            var id = item.objectId;
            tc.isTrue(ids.indexOf(id) !== -1, "Do not expect id:= " + id + " in [" + ids.join(", ") + "]");
        });
    };

    var verifySelection = function (tc, indices, ids) {
        var newSelection = tc.model.selection(),
            indexString = "[" + indices.join(", ") + "]";

        tc.areEqual(newSelection.length, indices.length, "selection length do not match");
        indices.forEach(function (index, i) {
            tc.areEqual(tc.collection.item(index).objectId, ids[i], "The id of the indices do not match");
            tc.isTrue(newSelection.isIndexSelected(index), "Expecting:= " + indexString + " actual:=[" + newSelection.indices.join(", ") + "]");
        });
    };

    var verifyAppState = function (tc, lastSelectedId, selectedIds) {
        tc.areEqual(tc.selection.message.objectId, lastSelectedId);
        tc.selection.messages.forEach(function (message) {
            var messageId = message.objectId;
            tc.isTrue(selectedIds.indexOf(messageId) !== -1);
        });
    };

    Tx.test("SelectionAggregator_UnitTest.expand_defaultSelection", { owner: "kepoon", priority : 0}, function (tc) {
        setupTestCase(tc, {
            collection : {
                c1 : 1,
                c2: 2,
                c3 : 3 // <= selected
                // c3:message1 <= sentItems
                // c3:message2
                // c3:message3
            },
            threaded : true,
            selection : [2]
        });

        // fiddle with the child message of c3
        var c3 = tc.collection.item(2),
            c3message0 = c3.item(0);
        c3message0.data.isInSentItems = true;

        // expand c3
        tc.collection.expand(2);
        tc.target.onNodeExpanded({ index: 2});
        verifySelection(tc, [2, 4, 5], ["c3", "c3:message2", "c3:message3"]);
    });

    Tx.test("SelectionAggregator_UnitTest.expand_customSelection", { owner: "kepoon", priority: 0 }, function (tc) {
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 3 // <= selected
                // c3:message1 <= sentItems
                // c3:message2
                // c3:message3
            },
            threaded: true,
            selection: [2]
        });

        // expand c3
        tc.collection.expand(2);
        tc.target.onNodeExpanded({ index: 2 });
        verifySelection(tc, [2, 3, 4, 5], ["c3", "c3:message1", "c3:message2", "c3:message3"]);

        // select c3Message1, unselect c3:message3
        tc.model.removeSelection(5);

        tc.collection.collapse();
        tc.collection.expand(2);
        tc.target.onNodeExpanded({ index: 2 });
        verifySelection(tc, [2, 3, 4], ["c3", "c3:message1", "c3:message2"]);

    });

    Tx.test("SelectionAggregator_UnitTest.aggregateSelectParent", { owner: "kepoon", priority: 0 }, function (tc) {
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 3 // <= selected
                // c3:message1 <= sentItems
                // c3:message2
                // c3:message3
            },
            threaded: true,
            selection: [0]
        });
        verifySelection(tc, [0], ["c1"]);
        // expand c3
        tc.collection.expand(2);
        tc.target.onNodeExpanded({ index: 2 });
        // expanding an empty node to lead to nothing being selected
        verifySelection(tc, [0], ["c1"]);

        // select child c3Message1, should select parent c3
        tc.model.addSelection(3);
        verifySelection(tc, [0, 2, 3], ["c1", "c3", "c3:message1"]);
    });

    Tx.test("SelectionAggregator_UnitTest.aggregateDelectParent", { owner: "kepoon", priority: 0 }, function (tc) {
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 3 // <= selected
                // c3:message1 <= sentItems
                // c3:message2
                // c3:message3
            },
            threaded: true,
            selection: [0, 3],
            expandedIndex : 2
        });

        // verify initial aggregation
        verifySelection(tc, [0, 2, 3], ["c1", "c3", "c3:message1"]);

        // deselect child c3Message1, should deselect parent c3
        tc.model.removeSelection(3);
        verifySelection(tc, [0], ["c1"]);
        var c3 = tc.collection.item(2);
        tc.isFalse(c3.expanded, "deselect a thread should also collapsed it");
        verifyLogicalSelection(tc, ["c1"]);
    });

    Tx.test("SelectionAggregator_UnitTest.aggregateSelectChild", { owner: "kepoon", priority: 0 }, function (tc) {
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 3 // <= selected
                // c3:message1 <= sentItems
                // c3:message2
                // c3:message3
            },
            threaded: true,
            selection: [0]
        });
        verifySelection(tc, [0], ["c1"]);
        // expand c3
        tc.collection.expand(2);
        tc.target.onNodeExpanded({ index: 2 });
        // expanding an empty node to lead to nothing being selected
        verifySelection(tc, [0], ["c1"]);

        // select parent c3, should select its children
        tc.model.addSelection(2);
        verifySelection(tc, [0, 2, 3, 4, 5], ["c1", "c3", "c3:message1", "c3:message2", "c3:message3"]);
    });

    Tx.test("SelectionAggregator_UnitTest.aggregateDelectChild", { owner: "kepoon", priority: 0 }, function (tc) {
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 3 // <= selected
                // c3:message1 <= sentItems
                // c3:message2
                // c3:message3
            },
            threaded: true,
            selection: [0, 2],
            expandedIndex: 2
        });

        // verify initial aggregation
        verifySelection(tc, [0, 2, 3, 4, 5], ["c1", "c3", "c3:message1", "c3:message2", "c3:message3"]);

        // deselect parent should deselect all its children
        tc.model.removeSelection(2);
        verifySelection(tc, [0], ["c1"]);
        var c3 = tc.collection.item(2);
        tc.isFalse(c3.expanded, "deselect a thread should also collapsed it");
    });

    Tx.test("SelectionAggregator_UnitTest.logicalItems_collapsedOnly", { owner: "kepoon", priority: 0 }, function (tc) {
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 3
            },
            threaded: true,
            selection: [0, 1, 2]
        });

        // verify initial aggregation
        verifyLogicalSelection(tc, ["c1", "c2", "c3"]);
    });

    Tx.test("SelectionAggregator_UnitTest.logicalItems_expandedOnly", { owner: "kepoon", priority: 0 }, function (tc) {
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 3 // <= selected
                // c3:message1 <= sentItems
                // c3:message2
                // c3:message3
            },
            threaded: true,
            selection: [2],
            expandedIndex: 2
        });

        // deselect one of the items
        tc.model.removeSelection(3);
        verifySelection(tc, [2, 4, 5], ["c3", "c3:message2", "c3:message3"]);

        // verify initial aggregation
        verifyLogicalSelection(tc, ["c3:message2", "c3:message3"]);
    });

    Tx.test("SelectionAggregator_UnitTest.logicalItems_mixed", { owner: "kepoon", priority: 0 }, function (tc) {
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 3 // <= selected
                // c3:message1 <= sentItems
                // c3:message2
                // c3:message3
            },
            threaded: true,
            selection: [0, 2],
            expandedIndex: 2
        });

        // deselect one of the items
        tc.model.removeSelection(3);
        verifySelection(tc, [0, 2, 4, 5], ["c1", "c3", "c3:message2", "c3:message3"]);

        // verify initial aggregation
        verifyLogicalSelection(tc, ["c1", "c3:message2", "c3:message3"]);
    });

    Tx.test("SelectionAggregator_UnitTest.logicalItems_collapseThread", { owner: "kepoon", priority: 0 }, function (tc) {
        // collapse thread should not remove an logical item
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 3 // <= selected
                // c3:message1 <= sentItems
                // c3:message2
                // c3:message3
            },
            threaded: true,
            selection: [0, 3],
            expandedIndex: 2
        });
        // verify initial aggregation
        verifyLogicalSelection(tc, ["c1", "c3:message1"]);
        tc.collection.collapse();
        verifyLogicalSelection(tc, ["c1", "c3:message1"]);
    });

    Tx.test("SelectionAggregator_UnitTest.logicalItems_nonThreadedMode", { owner: "kepoon", priority: 0 }, function (tc) {
        // collapse thread should not remove an logical item
        setupTestCase(tc, {
            collection: {
                m1: 1,
                m2: 1,
                m3: 1
            },
            threaded: false,
            selection: [0, 2]
        });
        // verify initial aggregation
        verifyLogicalSelection(tc, ["m1", "m3"]);
        tc.model.addSelection(1);
        verifyLogicalSelection(tc, ["m1", "m2", "m3"]);
    });


    Tx.test("SelectionAggregator_UnitTest.addParent", { owner: "kepoon", priority: 0 }, function (tc) {
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 3
            },
            threaded: true,
            selection: [0, 2]
        });

        // deselect one of the items
        verifySelection(tc, [0, 2], ["c1", "c3"]);
        verifyLogicalSelection(tc, ["c1", "c3"]);
        tc.model.addSelection(1);
        // verify initial aggregation
        verifyLogicalSelection(tc, ["c1", "c2", "c3"]);
    });

    Tx.test("SelectionAggregator_UnitTest.deselectParent", { owner: "kepoon", priority: 0 }, function (tc) {
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 3
            },
            threaded: true,
            selection: [0, 2]
        });

        verifySelection(tc, [0, 2], ["c1", "c3"]);
        verifyLogicalSelection(tc, ["c1", "c3"]);
        // deselect one of the items
        tc.model.removeSelection(0);

        // verify final results
        verifySelection(tc, [2], ["c3"]);
        verifyLogicalSelection(tc, ["c3"]);
    });

    Tx.test("SelectionAggregator_UnitTest.addChild", { owner: "kepoon", priority: 0 }, function (tc) {
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 3 // <= selected
                // c3:message1 <= sentItems
                // c3:message2
                // c3:message3
            },
            threaded: true,
            expandedIndex: 2,
            selection: [3]
        });

        // Verify initial selection
        verifySelection(tc, [2, 3], ["c3", "c3:message1"]);
        verifyLogicalSelection(tc, ["c3:message1"]);

        // add child c3:message2
        tc.model.addSelection(4);

        // verify final results
        verifySelection(tc, [2, 3, 4], ["c3", "c3:message1", "c3:message2"]);
        verifyLogicalSelection(tc, ["c3:message1", "c3:message2"]);
    });

    Tx.test("SelectionAggregator_UnitTest.removeChild", { owner: "kepoon", priority: 0 }, function (tc) {
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 3 // <= selected
                // c3:message1 <= sentItems
                // c3:message2
                // c3:message3
            },
            threaded: true,
            expandedIndex: 2,
            selection: [3]
        });

        // Verify initial selection
        verifySelection(tc, [2, 3], ["c3", "c3:message1"]);
        verifyLogicalSelection(tc, ["c3:message1"]);

        // add child c3:message2
        tc.model.addSelection(4);

        // verify final results
        verifySelection(tc, [2, 3, 4], ["c3", "c3:message1", "c3:message2"]);
        verifyLogicalSelection(tc, ["c3:message1", "c3:message2"]);

        // remove child c3:message1
        tc.model.removeSelection(3);

        // verify final results
        verifySelection(tc, [2, 4], ["c3", "c3:message2"]);
        verifyLogicalSelection(tc, ["c3:message2"]);
    });

    Tx.test("SelectionAggregator_UnitTest.enterSelectionMode", { owner: "kepoon", priority: 0 }, function (tc) {
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 3, // <= selected
                // c3:message1 <= sentItems
                // c3:message2
                // c3:message3
                c4: 1
            },
            threaded: true,
            expandedIndex: 2,
            selection: [4],
            enableController : true,
            doNotEnterSelectionMode : true
        });

        // Verify initial selection
        Jx.dispose(tc.controller._modelEventHook);
        tc.controller._modelEventHook = null;

        tc.model.addSelection(1);

        tc.handler.enterSelectionMode();
        verifySelection(tc, [1, 2, 4], ["c2", "c3", "c3:message2"]);
        verifyAppState(tc, "c3:message2", ["c2", "c3:message2"]);
    });

    Tx.test("SelectionAggregator_UnitTest.enterSelectionMode2", { owner: "kepoon", priority: 0 }, function (tc) {
        // enter selection mode by checking the sibling of the existing selected item
        // the newly checked item should be selected
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 3, // <= expanded
                // c2:message1 <= selected
                // c2:message2
                // c2:message3
                c3: 3
            },
            threaded: true,
            expandedIndex: 1,
            selection: [2], //c2:message1
            enableController : true,
            doNotEnterSelectionMode : true
        });
        // set the displayedItem to c2:message1
        verifyAppState(tc, "c2:message1", ["c2:message1"]);

        // The code below fakes entering selection mode by checking on index 3 c2:message2
        Jx.dispose(tc.controller._modelEventHook);
        tc.controller._modelEventHook = null;
        tc.model.setSelection([3], "none", false /*viaKeyboard*/, false /*suppressEvent*/);
        tc.handler.enterSelectionMode();

        // Expected
        // c1: 1,
        // c2: 3, <= expanded
        // c2:message1
        // c2:message2 <= selected
        // c2:message3
        // c3: 3
        verifySelection(tc, [1, 3], ["c2", "c2:message2"]);
        verifyAppState(tc, "c2:message2", ["c2:message2"]);
    });

    Tx.test("SelectionAggregator_UnitTest.exitSelectionMode_appBar_expandedThread_only", { owner: "kepoon", priority: 0 }, function (tc) {
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 3, // <= selected
                // c3:message1 <= sentItems
                // c3:message2
                // c3:message3
                c4: 1
            },
            threaded: true,
            expandedIndex: 2,
            enableController: true,
            selection: [4]
        });

        // Verify initial selection
        verifySelection(tc, [2, 4], ["c3", "c3:message2"]);
        verifyLogicalSelection(tc, ["c3:message2"]);
        tc.handler.exitSelectionMode();

        verifySelection(tc, [4], ["c3:message2"]);
        var c3 = tc.collection.item(2);
        tc.isTrue(c3.expanded, "Exit selection mode should not change the expansion of the thread");
    });

    Tx.test("SelectionAggregator_UnitTest.exitSelectionMode_appBar_expandedThread_with_items", { owner: "kepoon", priority: 0 }, function (tc) {
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 3, // <= selected
                // c3:message1 <= sentItems
                // c3:message2
                // c3:message3
                c4: 1
            },
            threaded: true,
            expandedIndex: 2,
            enableController: true,
            selection: [0, 4]
        });

        // Verify initial selection
        verifySelection(tc, [0, 2, 4], ["c1", "c3", "c3:message2"]);
        verifyLogicalSelection(tc, ["c1", "c3:message2"]);
        tc.handler.exitSelectionMode();

        verifySelection(tc, [0], ["c1"]);
        var c3 = tc.collection.item(2);
        tc.isTrue(c3.expanded, "Exit selection mode should not change the expansion of the thread");
    });

    Tx.test("SelectionAggregator_UnitTest.exitSelectionMode_appBar_singeItem", { owner: "kepoon", priority: 0 }, function (tc) {
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 3, // <= selected
                // c3:message1 <= sentItems
                // c3:message2
                // c3:message3
                c4: 1
            },
            threaded: true,
            expandedIndex: 2,
            enableController: true,
            selection: [0]
        });

        // Verify initial selection
        verifySelection(tc, [0], ["c1"]);
        verifyLogicalSelection(tc, ["c1"]);
        tc.handler.exitSelectionMode();

        verifySelection(tc, [0], ["c1"]);
        var c3 = tc.collection.item(2);
        tc.isTrue(c3.expanded, "Exit selection mode should not change the expansion of the thread");
    });


    Tx.test("SelectionAggregator_UnitTest.exitSelectionMode_uncheck_singeItem", { owner: "kepoon", priority: 0 }, function (tc) {
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 3, // <= selected
                // c3:message1 <= sentItems
                // c3:message2
                // c3:message3
                c4: 1
            },
            threaded: true,
            expandedIndex: 2,
            selection: [0],
            enableController: true
        });

        // Verify initial selection
        verifySelection(tc, [0], ["c1"]);
        verifyLogicalSelection(tc, ["c1"]);

        tc.model.removeSelection(0);
        verifySelection(tc, [0], ["c1"]);
        tc.isFalse(tc.handler.isSelectionMode, "unchecking the last item should exit selection mode");
    });


    Tx.test("SelectionAggregator_UnitTest.exitSelectionMode_uncheck_onlyChild", { owner: "kepoon", priority: 0 }, function (tc) {
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 3, // <= selected
                // c3:message1 <= sentItems
                // c3:message2
                // c3:message3
                c4: 1
            },
            threaded: true,
            expandedIndex: 2,
            enableController: true,
            selection: [3]
        });

        // Verify initial selection
        verifySelection(tc, [2, 3], ["c3", "c3:message1"]);
        verifyLogicalSelection(tc, ["c3:message1"]);

        tc.model.removeSelection(3);
        verifySelection(tc, [3], ["c3:message1"]);
        var c3 = tc.collection.item(2);
        tc.isTrue(c3.expanded, "Exit selection mode should not change the expansion of the thread");
        tc.isFalse(tc.handler.isSelectionMode, "unchecking the last item should exit selection mode");
    });

    Tx.test("SelectionAggregator_UnitTest.exitSelectionMode_uncheck_onlyParent", { owner: "kepoon", priority: 0 }, function (tc) {
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 3, // <= selected
                // c3:message1 <= sentItems
                // c3:message2
                // c3:message3
                c4: 1
            },
            threaded: true,
            expandedIndex: 2,
            enableController: true,
            selection: [3]
        });

        // Verify initial selection
        verifySelection(tc, [2, 3], ["c3", "c3:message1"]);
        verifyLogicalSelection(tc, ["c3:message1"]);

        tc.model.removeSelection(2);
        verifySelection(tc, [3], ["c3:message1"]);
        var c3 = tc.collection.item(2);
        tc.isTrue(c3.expanded, "Exit selection mode should not change the expansion of the thread");
        tc.isFalse(tc.handler.isSelectionMode, "unchecking the last item should exit selection mode");
    });

    Tx.test("SelectionAggregator_UnitTest.exitSelectionMode_deselectAll", { owner: "kepoon", priority: 0 }, function (tc) {
        // Regression test for BLUE:406797
        // The key here is we have an expanded thread selected before an collapsed thread and hit Esc to deselect all messages
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 3, // <= selected
                // c3:message1 <= selected
                // c3:message2
                // c3:message3
                c4: 1 // <= selected
            },
            threaded: true,
            expandedIndex: 2,
            enableController: true,
            selection: [3, 6]
        });

        // Verify initial selection
        verifySelection(tc, [2, 3, 6], ["c3", "c3:message1", "c4"]);
        verifyLogicalSelection(tc, ["c3:message1", "c4"]);

        tc.model.removeSelection([2, 3, 6]);
        verifySelection(tc, [2], ["c3"]);
        tc.isFalse(tc.handler.isSelectionMode, "unchecking all items should exit selection mode");
    });

    Tx.test("SelectionAggregator_UnitTest.itemDeletedFrom_onlyCollapsedThread", { owner: "kepoon", priority: 0 }, function (tc) {
        // Delete the only selected child item from an collapsed thread
        // Verify the thread is deleted and collapsed
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 3,
                // c3:message1
                // c3:message2
                // c3:message3 <= selected
                c4: 1
            },
            threaded: true,
            expandedIndex: 2,
            enableController: true,
            selection: [5]
        });

        // Verify initial selection
        verifySelection(tc, [2, 5], ["c3", "c3:message3"]);

        tc.collection.collapse();

        // delete the item from c3
        var c3 = tc.collection.item(2);
        c3._children.mock$removeItem(2);
        c3.raiseEvent("itemRemoved", { objectId: "c3:message3" });

        verifySelection(tc, [2], ["c3"]);
        tc.isFalse(tc.handler.isSelectionMode, "unchecking the last item should exit selection mode");
    });

    Tx.test("SelectionAggregator_UnitTest.itemDeletedFrom_onlyExpandedThread", { owner: "kepoon", priority: 0 }, function (tc) {
        // Delete the only selected child item from an expanded thread
        // Verify the thread is deleted and collapsed
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 3,
                // c3:message1
                // c3:message2
                // c3:message3 <= selected
                c4: 1
            },
            threaded: true,
            expandedIndex: 2,
            enableController: true,
            selection: [5]
        });

        // Verify initial selection
        verifySelection(tc, [2, 5], ["c3", "c3:message3"]);

        // delete the item from c3
        var c3 = tc.collection.item(2),
            c3message3 = c3.item(2);

        // remove c3message3 from both the collection and the thread
        c3._children.mock$removeItem(2);
        tc.collection.mock$removeItem(5);

        var ev = {
            diff: {
                added: [],
                removed: [],
                deletedItems: [c3message3]
            }
        };
        tc.model._selection = new Mail.FilteredSelection([2 /*c3*/], tc.collection);
        tc.model.raiseEvent("selectionchanged", ev);

        verifySelection(tc, [4], ["c3:message2"]);
        tc.isFalse(tc.handler.isSelectionMode, "unchecking the last item should exit selection mode");
    });

    Tx.test("SelectionAggregator_UnitTest.displayItem_collapse", { owner: "kepoon", priority: 0 }, function (tc) {
        // Have a custom selection and collapse the thread
        // the display item should not change
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 3,
                // c3:message1
                // c3:message2
                // c3:message3 // <= selected
                c4: 1
            },
            threaded: true,
            expandedIndex: 2,
            selection: [5],
            enableController : true
        });

        // Verify initial selection
        verifySelection(tc, [2, 5], ["c3", "c3:message3"]);
        verifyLogicalSelection(tc, ["c3:message3"]);
        verifyAppState(tc, "c3:message3", ["c3:message3"]);

        tc.collection.collapse();
        var c3 = tc.collection.item(2);
        tc.isFalse(c3.expanded, "leaving selection mode should collapse the active thread");

        verifyAppState(tc, "c3:message3", ["c3:message3"]);
    });

    Tx.test("SelectionAggregator_UnitTest.displayItem_collapse2", { owner: "kepoon", priority: 0 }, function (tc) {
        // Have a custom selection and collapse the thread
        // the display item should not change
        setupTestCase(tc, {
            collection: {
                c1: 1, // <= selected
                c2: 2,
                c3: 3,
                // c3:message1
                // c3:message2
                // c3:message3 // <= selected
                c4: 1
            },
            threaded: true,
            expandedIndex: 2,
            selection: [0, 5],
            enableController: true
        });

        // Verify initial selection
        verifySelection(tc, [0, 2, 5], ["c1", "c3", "c3:message3"]);
        verifyAppState(tc, "c1:message1", ["c1", "c3:message3"]);

        tc.model.removeSelection(0);
        verifyAppState(tc, "c3:message3", ["c3:message3"]);
    });

    Tx.test("SelectionAggregator_UnitTest.itemDeletedFromExpandedThread", { owner: "kepoon", priority: 0 }, function (tc) {
        // Delete the only selected child item from an expanded thread
        // Verify the thread is deleted and collapsed
        setupTestCase(tc, {
            collection: {
                c1: 1, // <= selected
                c2: 2,
                c3: 3,
                // c3:message1
                // c3:message2
                // c3:message3 <= selected
                c4: 1
            },
            threaded: true,
            expandedIndex: 2,
            selection: [0, 5]
        });

        // Verify initial selection
        verifySelection(tc, [0, 2, 5], ["c1", "c3", "c3:message3"]);

        // delete the item
        var c3 = tc.collection.item(2);
        tc.collection.mock$removeItem(5);
        c3._children.mock$removeItem(2);

        // dirty the selection
        tc.model._selection._onCollectionChanged();
        // fire an empty selection change to simulate a delete
        tc.model.removeSelection([5], false);

        verifySelection(tc, [0], ["c1"]);
        verifyLogicalSelection(tc, ["c1"]);

        tc.isFalse(c3.expanded, "leaving selection mode should collapse the active thread");
    });

    Tx.test("SelectionAggregator_UnitTest.itemDeletedFromCollapsedThread", { owner: "kepoon", priority: 0 }, function (tc) {
        // Delete the only selected child item from an expanded thread
        // Verify the thread is deleted and collapsed
        setupTestCase(tc, {
            collection: {
                c1: 1, // <= selected
                c2: 2,
                c3: 3,
                // c3:message1
                // c3:message2
                // c3:message3 <= selected
                c4: 1
            },
            threaded: true,
            expandedIndex: 2,
            selection: [0, 5]
        });

        // Verify initial selection
        verifySelection(tc, [0, 2, 5], ["c1", "c3", "c3:message3"]);

        tc.collection.collapse();

        // delete the item from c3
        var c3 = tc.collection.item(2);
        c3._children.mock$removeItem(2);
        c3.raiseEvent("itemRemoved", { objectId : "c3:message3"});

        verifySelection(tc, [0], ["c1"]);
        verifyLogicalSelection(tc, ["c1"]);
        tc.isFalse(c3.expanded, "leaving selection mode should collapse the active thread");
    });

    Tx.test("SelectionAggregator_UnitTest.selectAll", { owner: "kepoon", priority: 0 }, function (tc) {
        // Select all should not select the end of list item
        setupTestCase(tc, {
            collection: {
                c1: 1, // <= selected
                c2: 2,
                c3: 3
                // c3:message1
                // c3:message2
                // c3:message3 <= selected
            },
            threaded: true,
            expandedIndex: 2,
            selection: [0, 5]
        });


        // Verify initial selection
        verifySelection(tc, [0, 2, 5], ["c1", "c3", "c3:message3"]);

        // insert the end of list item
        tc.collection.mock$addItem(6, {
            objectId: "endofList",
            selectable: false
        });

        // select all
        tc.model.setSelection([0, 1, 2, 3, 4, 5, 6], "none", false /*viaKeyboard*/, false /*suppressEvent*/);

        // the end of list item should not be selected
        verifySelection(tc, [0, 1, 2, 3, 4, 5], ["c1", "c2", "c3", "c3:message1", "c3:message2", "c3:message3"]);
    });

    ///
    /// Mocks
    ///
    var MockSelectionModel = function (tc, selection, collection) {
        this._tc = tc;
        this._selection = new Mail.FilteredSelection(selection, collection);
        this._collection = collection;
        this.currentItem = { index: -1 };
        this.listViewElement = document.createElement("div");
    };
    Jx.inherit(MockSelectionModel, Jx.Events);
    Debug.Events.define(MockSelectionModel.prototype, "selectionchanging", "selectionchanged", "iteminvoked");


    function unique(array) {
        // a naive implementation of unique for merging selection
        for (var i = 0; i < array.length; ++i) {
            for (var j = i + 1; j < array.length; ++j) {
                if (array[i] === array[j]) {
                    array.splice(j--, 1);
                }
            }
        }
        return array;
    }

    function remove(array, toBeRemoved) {
        toBeRemoved = Jx.isArray(toBeRemoved) ? toBeRemoved : [toBeRemoved];
        toBeRemoved.forEach(function (item) {
            var index = array.indexOf(item);
            if (index !== -1) {
                array.splice(index, 1);
            }
        });
        return array;
    }

    MockSelectionModel.prototype.mockedType = Mail.SelectionModel;
    MockSelectionModel.prototype.ensureVisible = Jx.fnEmpty;

    MockSelectionModel.prototype.selection = function () {
        return this._selection;
    };

    MockSelectionModel.prototype.isValidIndex = function (index) {
        return index >= 0 && index < this._collection.count;
    };

    MockSelectionModel.prototype.getNodeSelection = function (node) {
        return null;
    };

    MockSelectionModel.prototype.addSelection = function (indices, suppressEvent) {
        var newIndices = unique(this._selection.indices.concat(indices));
        this.setSelection(newIndices, "none", false, suppressEvent);
    };

    MockSelectionModel.prototype.removeSelection = function (toBeRemoved, suppressEvent) {
        var oldIndices = this._selection.indices.concat(),
            newIndices = remove(oldIndices, toBeRemoved);
        this.setSelection(newIndices, "none", false, suppressEvent);
    };

    MockSelectionModel.prototype.setSelection = function (newIndices, scrollOption, viaKeyboard, suppressEvent) {
        newIndices = Jx.isArray(newIndices) ? newIndices : [newIndices];
        newIndices.sort(function (a, b) {
            return a - b;
        });

        var evChanging = { detail: {} },
            selectionAllowed = true;

        evChanging.detail.newSelection = {
            getIndices: function () {
                return newIndices;
            },
            count: function () {
                return newIndices.length;
            },
            add: function (toBeAdded) {
                newIndices = unique(newIndices.concat(toBeAdded));
            },
            remove: function (toBeRemoved) {
                newIndices = remove(newIndices, toBeRemoved);
            }
        };
        evChanging.detail.preventTapBehavior = Jx.fnEmpty;

        evChanging.preventDefault = function () {
            selectionAllowed = false;
        };

        if (!suppressEvent) {
            this.raiseEvent("selectionchanging", evChanging);
        }

        if (selectionAllowed) {
            var ev = {};
            ev.diff = this._selection.diff(newIndices);
            this._selection.dispose();
            this._selection = new Mail.FilteredSelection(newIndices, this._collection);
            if (!suppressEvent) {
                this.raiseEvent("selectionchanged", ev);
            }
        }
        return WinJS.Promise.wrap();
    };

    var MockConversationNode = function (tc, id, totalCount) {
        this._tc = tc;
        var childrenMapping = {};
        for (var i = 0; i < totalCount; i++) {
            var childId = id + ":message" + (i + 1);
            childrenMapping[childId] = 1;
        }
        Mail.MessageListTreeNode.call(this, {
                objectId: id,
                mockedType: Mail.UIDataModel.MailConversation
            }, "conversation", null);
        this._children = new MockCollection(tc, childrenMapping, false, this);
        this.mockedType = Mail.ConversationNode;
    };
    Jx.inherit(MockConversationNode, Mail.MessageListTreeNode);

    MockConversationNode.prototype.item = function (index) {
        return this._children.item(index);
    };

    MockConversationNode.prototype.forEach = function (fn, context) {
        return Mail.Collection.forEach(this._children, fn, context);
    };

    MockConversationNode.prototype.findIndexById = function (childId) {
        return Mail.Collection.findIndexById(this._children, childId);
    };

    Object.defineProperty(MockConversationNode.prototype, "totalCount", { get: function () { return this._children.count; } });

    var MockCollection = function (tc, mapping, threaded, parent) {
        this._items = [];
        this._tc = tc;
        for (var nodeId in mapping) {
            if (threaded) {
                var totalCount = mapping[nodeId],
                    conversationNode = new MockConversationNode(tc, nodeId, totalCount);
                tc.areEqual(conversationNode.totalCount, totalCount);
                this._items.push(conversationNode);

            } else {
                this._items.push(new Mail.MessageListTreeNode({
                    objectId: nodeId,
                    mockedType: Mail.UIDataModel.MailMessage
                }, "message", parent));
            }
        }
        this.mockedType = Mail.TrailingItemCollection;
    };

    MockCollection.prototype = {
        addListener: Jx.fnEmpty,
        removeListener : Jx.fnEmpty,
        mock$stubItem: function (index, item) {
            this._items[index] = item;
        },
        mock$addItem: function (index, item) {
            this._items.splice(index, 0, item);
        },
        mock$removeItem: function (index) {
            this._items.splice(index, 1);
        },
        mock$removeAll: function () {
            this._items = [];
        },
        expand : function (index) {
            var parentNode = this.item(index),
                countBefore = this.totalCount;
            this._tc.isTrue(parentNode.totalCount > 1);
            this._activeConversationIndex = index;
            parentNode._expanded = true;
            for (var i = 0; i < parentNode.totalCount; i++) {
                var childNode = parentNode.item(i);
                this.mock$addItem(index + i + 1, childNode);
            }
            this._tc.areEqual(countBefore + parentNode.totalCount, this.totalCount, "The count should match after expand");
        },
        collapse: function () {
            var index = this.activeConversationIndex,
                parentNode = this.item(index),
                countBefore = this.totalCount;
            this._tc.isTrue(parentNode.totalCount > 1);

            if (!parentNode.expanded) {
                return;
            }
            parentNode._expanded = false;

            var toBeRemoved = [];

            for (var i = 0; i < parentNode.totalCount; i++) {
                toBeRemoved.push(index + i + 1);
                this.mock$removeItem(index + 1);
            }

            // remove items from selection
            if (this._tc.model) {
                this._tc.model.removeSelection(toBeRemoved);
            }

            this._tc.areEqual(countBefore - parentNode.totalCount, this.totalCount, "The count should match after expand");
        },
        item: function (i) {
            return this._items[i];
        },
        findIndexByMessageId: function (messageId) {
            for (var i = 0; i < this._items.length; i++) {
                var node = this._items[i];
                if (node.type === "conversation") {
                    var childIndex = node.findIndexById(messageId);
                    if (childIndex !== -1) {
                        return i;
                    }

                }
            }
            return -1;
        },
        findIndexByThreadId: function (id) {
            return Mail.Collection.findIndexById(this, id);
        },
        clearPendingExpandCollapse: function () {
        },
        getTreeView: function () {
            return this;
        }
    };
    Object.defineProperty(MockCollection.prototype, "activeConversation", { get: function () { return this._activeConversationIndex > 0 ? this.item(this._activeConversationIndex) : null; } });
    Object.defineProperty(MockCollection.prototype, "activeConversationIndex", { get: function () { return this._activeConversationIndex; } });
    Object.defineProperty(MockCollection.prototype, "count", { get: function () { return this._items.length; } });
    Object.defineProperty(MockCollection.prototype, "mailItems", { get: function () { return this; }});
    Object.defineProperty(MockCollection.prototype, "totalCount", { get: function () { return this._items.length; } });

    var MockSelection = function () {
        this.view = {
            mockedType: Mail.UIDataModel.MailView,
            type: Plat.MailViewType.inbox
        };
        this.message = null;
        this.index = -1;
        this.messages = [];
    };

    MockSelection.prototype = {
        updateMessages: function (displayed, index, messages) {
            this.message = displayed;
            this.index = index;
            this.messages = messages;
        }
    };
})();
