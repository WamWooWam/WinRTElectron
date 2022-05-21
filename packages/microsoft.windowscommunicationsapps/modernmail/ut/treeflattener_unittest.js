
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
(function() {

    var U = Mail.UnitTest;
    var P = Microsoft.WindowsLive.Platform;
    var ChangeType = P.CollectionChangeType;

    // Verify flattenning a basic set of folders generates the expected list
    Tx.test("TreeFlattener_UnitTest.test_flatten", {owner: "neilpa", priority: 0}, function (tc) {
        // Created in an "interesting" order to validate sorting of the tree
        var names = ["1.1.1", "4", "3.1", "2", "3", "1", "1.2", "1.1", "4.1", "4.2"];
        var allFolders = createFolders(names);
        var flattened = new Mail.TreeFlattener(createTree(allFolders));

        // The folders should be sorted depth-first by name, which is the same as the raw
        // lexicographic sort of the entire name collection.
        verifyCollection(tc, flattened, names.sort(), new U.CallVerifier(tc));
    });

    // Verify node additions are propagated to the flattened collection
    Tx.test("TreeFlattener.insert", {owner: "neilpa", priority: 0}, function (tc) {
        var calls = new U.CallVerifier(tc);

        var names = ["2.3", "4", "2"];
        var allFolders = createFolders(names);
        var flattened = new Mail.TreeFlattener(createTree(allFolders));
        var listener = calls.hookEvents(flattened, ["collectionchanged"]);

        verifyCollection(tc, flattened, names.sort(), calls);

        // Inserts to apply to the source collection
        var changes = [
            // 2, 2.3, 4
            { name: "1", evIndex: 0, insertIndex: 2 }, // new root folder at the start
            // 1, 2, 2.3, 4
            { name: "5", evIndex: 4 }, // new root folder at the end
            // 1, 2, 2.3, 4, 5
            { name: "3", evIndex: 3 }, // new root folder in the middle
            // 1, 2, 2.3, 3, 4, 5
            { name: "1.1", evIndex: 1, insertIndex: 5 }, // first new child folder
            // 1, 1.1, 2, 2.3, 3, 4, 5
            { name: "2.1", evIndex: 3 }, // child folder before
            // 1, 1.1, 2, 2.1, 2.3, 3, 4, 5
            { name: "2.4", evIndex: 5 }, // child folder after
            // 1, 1.1, 2, 2.1, 2.3, 2.4, 3, 4, 5
            { name: "5.1", evIndex: 9 }, // child folder at end
            // 1, 1.1, 2, 2.1, 2.3, 2.4, 3, 4, 5, 5.1
            { name: "2.3.1", evIndex: 5 }, // first grand-child folder
            // 1, 1.1, 2, 2.1, 2.3, 2.3.1, 2.4, 3, 4, 5, 5.1
            { name: "1.1.2", evIndex: 2 }, // grand-child folder at the start
            // 1, 1.1, 2, 2.1, 2.3, 2.3.1, 2.4, 3, 4, 5, 5.1, 5.1.2
            { name: "5.1.2", evIndex: 12 } // grand-child folder at the end
            // 1, 1.1, 2, 2.1, 2.3, 2.3.1, 2.4, 3, 4, 5, 5.1, 5.1.2
        ];

        // Apply each change and validate the flattened list
        flattened.unlock();
        changes.forEach(function (change) {
            // Should be called when adding an item, even if it doesn't match the filter
            var folder = createFolder(change.name, allFolders);
            names.push(change.name);

            // Validate the insert event is fired for the expected index
            calls.expectOnce(listener, "collectionchanged", null, function (ev) {
                tc.areEqual(flattened, ev.target);
                tc.areEqual(folder.objectId, ev.objectId);
                tc.areEqual(ChangeType.itemAdded, ev.eType);
                tc.areEqual(change.evIndex, ev.index);
            });

            // Insert at the front of all folders if not given a desired index. This shouldn't
            // matter since we should be re-sorting all the items as part of building the tree
            allFolders.insertItem(folder, change.insertIndex || 0);

            // Validate that our flattened collection fires the insert and has the right sort
            verifyCollection(tc, flattened, names.sort(), calls);
        });
    });

    // Verify node removals are propagated to the flattened collection
    Tx.test("TreeFlattener.remove", {owner: "neilpa", priority: 0}, function (tc) {
        var calls = new U.CallVerifier(tc);

        var names = [
            "1", "2", "3", "4",
            "1.1", "1.2", "2.1", "4.1", "4.2",
            "1.2.1", "1.2.2", "2.1.1", "4.2.1", "4.2.2", "4.2.3",
            "4.2.2.1", "4.2.3.1"
        ];

        var source = createFolders(names);
        var flattened = new Mail.TreeFlattener(createTree(source));
        var listener = calls.hookEvents(flattened, ["collectionchanged"]);

        verifyCollection(tc, flattened, names.sort(), calls);

        // Removes to apply to the source tree
        flattened.unlock();
        var changes = [
               // source:  1, 2, 3, 4, 1.1, 1.2, 2.1, 4.1, 4.2, 1.2.1, 1.2.2, 2.1.1, 4.2.1, 4.2.2, 4.2.3, 4.2.2.1, 4.2.3.1
            {  // delete a leaf child folder
                srcIndex: 9, evIndex: 3, removed: "1.2.1",
                expected: "1, 1.1, 1.2, 1.2.2, 2, 2.1, 2.1.1, 3, 4, 4.1, 4.2, 4.2.1, 4.2.2, 4.2.2.1, 4.2.3, 4.2.3.1"
            }, // source:  1, 2, 3, 4, 1.1, 1.2, 2.1, 4.1, 4.2, 1.2.2, 2.1.1, 4.2.1, 4.2.2, 4.2.3, 4.2.2.1, 4.2.3.1
            {  // delete the last leaf child folder
                srcIndex: 15, evIndex: 15, removed: "4.2.3.1",
                expected: "1, 1.1, 1.2, 1.2.2, 2, 2.1, 2.1.1, 3, 4, 4.1, 4.2, 4.2.1, 4.2.2, 4.2.2.1, 4.2.3"
            }, // source:  1, 2, 3, 4, 1.1, 1.2, 2.1, 4.1, 4.2, 1.2.2, 2.1.1, 4.2.1, 4.2.2, 4.2.3, 4.2.2.1
            {  // delete a root folder without children
                srcIndex: 2, evIndex: 7, removed: "3",
                expected: "1, 1.1, 1.2, 1.2.2, 2, 2.1, 2.1.1, 4, 4.1, 4.2, 4.2.1, 4.2.2, 4.2.2.1, 4.2.3"
            }, // source:  1, 2, 4, 1.1, 1.2, 2.1, 4.1, 4.2, 1.2.2, 2.1.1, 4.2.1, 4.2.2, 4.2.3, 4.2.2.1
            {  // delete a child folder with children
                srcIndex: 5, evIndex: 5, removed: "2.1, 2.1.1",
                expected: "1, 1.1, 1.2, 1.2.2, 2, 4, 4.1, 4.2, 4.2.1, 4.2.2, 4.2.2.1, 4.2.3"
            }, // source:  1, 2, 4, 1.1, 1.2, 4.1, 4.2, 1.2.2, 2.1.1, 4.2.1, 4.2.2, 4.2.3, 4.2.2.1
            {  // delete the no longer parented child
                srcIndex: 8,
                expected: "1, 1.1, 1.2, 1.2.2, 2, 4, 4.1, 4.2, 4.2.1, 4.2.2, 4.2.2.1, 4.2.3"
            }, // source:  1, 2, 4, 1.1, 1.2, 4.1, 4.2, 1.2.2, 4.2.1, 4.2.2, 4.2.3, 4.2.2.1
            {  // delete the last child folder
                srcIndex: 10, evIndex: 11, removed: "4.2.3",
                expected: "1, 1.1, 1.2, 1.2.2, 2, 4, 4.1, 4.2, 4.2.1, 4.2.2, 4.2.2.1"
            }, // source:  1, 2, 4, 1.1, 1.2, 4.1, 4.2, 1.2.2, 4.2.1, 4.2.2, 4.2.2.1
            {  // delete a root with children
                srcIndex: 2, evIndex: 5, removed: "4, 4.1, 4.2, 4.2.1, 4.2.2, 4.2.2.1",
                expected: "1, 1.1, 1.2, 1.2.2, 2"
            }, // source:  1, 2, 1.1, 1.2, 4.1, 4.2, 1.2.2, 4.2.1, 4.2.2, 4.2.2.1
            {  // delete the last un-parented child
                srcIndex: 9,
                expected: "1, 1.1, 1.2, 1.2.2, 2"
            }, // source:  1, 2, 1.1, 1.2, 4.1, 4.2, 1.2.2, 4.2.1, 4.2.2, 4.2.2.1
            {  // delete the another un-parented child
                srcIndex: 5,
                expected: "1, 1.1, 1.2, 1.2.2, 2"
            }, // source:  1, 2, 1.1, 1.2, 4.1, 1.2.2, 4.2.1, 4.2.2, 4.2.2.1
            {  // delete children of the first root
                srcIndex: 3, evIndex: 2, removed: "1.2, 1.2.2",
                expected: "1, 1.1, 2"
            }, // source:  2, 1.1, 4.1, 1.2.2, 4.2.1, 4.2.2
            {  // delete the first root
                srcIndex: 0, evIndex: 0, removed: "1, 1.1",
                expected: "2"
            }, // source:  2, 1.1, 4.1, 1.2.2, 4.2.1, 4.2.2
            {  // delete the first-unparented child
                srcIndex: 1,
                expected: "2"
            }, // source:  2, 4.1, 1.2.2, 4.2.1, 4.2.2
            {  // delete the last root
                srcIndex: 0, evIndex: 0, removed: "2",
                expected: ""
            }, // source:  4.1, 1.2.2, 4.2.1, 4.2.2
            {  // delete the first un-parented root
                srcIndex: 0,
                expected: ""
            }  // source:  1.2.2, 4.2.1, 4.2.2
        ];

        // Apply each change and validate the flattened collection
        changes.forEach(function (change) {
            if (change.evIndex !== undefined) {
                // Validate the parent item being removed is what we expect
                var removed = change.removed.split(", ");
                tc.areEqual(removed[0], source.item(change.srcIndex).name);

                // Validate we get a remove notification for the item and each of it's children
                calls.expectMany(removed.length, listener, "collectionchanged", null, function (ev) {
                    var name = removed.shift();
                    tc.areEqual(flattened, ev.target);
                    tc.areEqual(ChangeType.itemRemoved, ev.eType);
                    tc.areEqual(change.evIndex, ev.index);
                    tc.areEqual(name, ev.removed[0].view.name);

                    if (removed.length > 0) {
                        tc.areEqual(removed[0], flattened.item(change.evIndex).view.name);
                    }
                });
            }

            source.removeItem(change.srcIndex);
            var expected = change.expected.length > 0 ? change.expected.split(", ") : [];
            verifyCollection(tc, flattened, expected, calls);
        });
    });

    // Verify changing nodes are propagated to the flattened collection
    Tx.test("TreeFlattener.move", {owner: "neilpa", priority: 0}, function (tc) {
        var calls = new U.CallVerifier(tc);
        var names = [
            "1", "2", "3", "4",
            "1.1", "1.2", "1.4", "1.5", "2.1", "4.1", "4.2",
            "1.2.1", "1.2.2", "2.1.1", "4.2.1", "4.2.2", "4.2.3",
            "4.2.2.1", "4.2.3.1"
        ];

        var source = createFolders(names);
        var flattened = new Mail.TreeFlattener(createTree(source));
        var listener = calls.hookEvents(flattened, ["collectionchanged"]);

        verifyCollection(tc, flattened, names.sort(), calls);

        // Removes to apply to the source tree
        flattened.unlock();
        var changes = [
               // source:  1, 2, 3, 4, 1.1, 1.2, 1.4, 1.5, 2.1, 4.1, 4.2, 1.2.1, 1.2.2, 2.1.1, 4.2.1, 4.2.2, 4.2.3, 4.2.2.1, 4.2.3.1
            {  // rename a leaf such that it doesn't move, 1.2.2 => 1.2.3
                name: "1.2.3", srcIndex: 12,
                expected: "1, 1.1, 1.2, 1.2.1, 1.2.3, 1.4, 1.5, 2, 2.1, 2.1.1, 3, 4, 4.1, 4.2, 4.2.1, 4.2.2, 4.2.2.1, 4.2.3, 4.2.3.1"
            }, // source:  1, 2, 3, 4, 1.1, 1.2, 1.4, 1.5, 2.1, 4.1, 4.2, 1.2.1, 1.2.3, 2.1.1, 4.2.1, 4.2.2, 4.2.3, 4.2.2.1, 4.2.3.1
            {  // rename a leaf that moves down past a sibling, 1.2.1 => 1.2.4
                name: "1.2.4", srcIndex: 11, evPrev: 3, evIndex: 4, movers: ["1.2.4"],
                expected: "1, 1.1, 1.2, 1.2.3, 1.2.4, 1.4, 1.5, 2, 2.1, 2.1.1, 3, 4, 4.1, 4.2, 4.2.1, 4.2.2, 4.2.2.1, 4.2.3, 4.2.3.1"
            }, // source:  1, 2, 3, 4, 1.1, 1.2, 1.4, 1.5, 2.1, 4.1, 4.2, 1.2.4, 1.2.3, 2.1.1, 4.2.1, 4.2.2, 4.2.3, 4.2.2.1, 4.2.3.1
            {  // rename a leaf that moves up past a sibling, 1.5 => 1.3
                name: "1.3", srcIndex: 7, evPrev: 6, evIndex: 5, movers: ["1.3"],
                expected: "1, 1.1, 1.2, 1.2.3, 1.2.4, 1.3, 1.4, 2, 2.1, 2.1.1, 3, 4, 4.1, 4.2, 4.2.1, 4.2.2, 4.2.2.1, 4.2.3, 4.2.3.1"
            }, // source:  1, 2, 3, 4, 1.1, 1.2, 1.4, 1.3, 2.1, 4.1, 4.2, 1.2.4, 1.2.3, 2.1.1, 4.2.1, 4.2.2, 4.2.3, 4.2.2.1, 4.2.3.1
            {  // rename a parent such that it doesn't move, 4.2 => 4.3
                name: "4.3", srcIndex: 10,
                expected: "1, 1.1, 1.2, 1.2.3, 1.2.4, 1.3, 1.4, 2, 2.1, 2.1.1, 3, 4, 4.1, 4.3, 4.2.1, 4.2.2, 4.2.2.1, 4.2.3, 4.2.3.1"
            }, // source:  1, 2, 3, 4, 1.1, 1.2, 1.4, 1.3, 2.1, 4.1, 4.3, 1.2.4, 1.2.3, 2.1.1, 4.2.1, 4.2.2, 4.2.3, 4.2.2.1, 4.2.3.1
            {  // rename a leaf such that it moves down past a sibling+children 1.1 => 1.5
                name: "1.5", srcIndex: 4, evPrev: 1, evIndex: 6, movers: ["1.5"],
                expected: "1, 1.2, 1.2.3, 1.2.4, 1.3, 1.4, 1.5, 2, 2.1, 2.1.1, 3, 4, 4.1, 4.3, 4.2.1, 4.2.2, 4.2.2.1, 4.2.3, 4.2.3.1"
            }, // source:  1, 2, 3, 4, 1.5, 1.2, 1.4, 1.3, 2.1, 4.1, 4.3, 1.2.4, 1.2.3, 2.1.1, 4.2.1, 4.2.2, 4.2.3, 4.2.2.1, 4.2.3.1
            {  // rename a leaf such that it moves up past a sibling+children 3 => 0
                name: "0", srcIndex: 2, evPrev: 10, evIndex: 0, movers: ["0"],
                expected: "0, 1, 1.2, 1.2.3, 1.2.4, 1.3, 1.4, 1.5, 2, 2.1, 2.1.1, 4, 4.1, 4.3, 4.2.1, 4.2.2, 4.2.2.1, 4.2.3, 4.2.3.1"
            }, // source:  1, 2, 0, 4, 1.5, 1.2, 1.4, 1.3, 2.1, 4.1, 4.3, 1.2.4, 1.2.3, 2.1.1, 4.2.1, 4.2.2, 4.2.3, 4.2.2.1, 4.2.3.1
            {  // rename a parent such that it moves down past siblings 1.2 => 1.6
                name: "1.6", srcIndex: 5, evPrev: 2, evIndex: 7, movers: ["1.6", "1.2.3", "1.2.4"],
                expected: "0, 1, 1.3, 1.4, 1.5, 1.6, 1.2.3, 1.2.4, 2, 2.1, 2.1.1, 4, 4.1, 4.3, 4.2.1, 4.2.2, 4.2.2.1, 4.2.3, 4.2.3.1"
            }, // source:  1, 2, 0, 4, 1.5, 1.6, 1.4, 1.3, 2.1, 4.1, 4.3, 1.2.4, 1.2.3, 2.1.1, 4.2.1, 4.2.2, 4.2.3, 4.2.2.1, 4.2.3.1
            {  // rename a parent such that it moves up past siblings 1.6 => 1.1
                name: "1.1", srcIndex: 5, evPrev: 5, evIndex: 2, movers: ["1.1", "1.2.3", "1.2.4"],
                expected: "0, 1, 1.1, 1.2.3, 1.2.4, 1.3, 1.4, 1.5, 2, 2.1, 2.1.1, 4, 4.1, 4.3, 4.2.1, 4.2.2, 4.2.2.1, 4.2.3, 4.2.3.1"
            }, // source:  1, 2, 0, 4, 1.5, 1.1, 1.4, 1.3, 2.1, 4.1, 4.3, 1.2.4, 1.2.3, 2.1.1, 4.2.1, 4.2.2, 4.2.3, 4.2.2.1, 4.2.3.1
            {  // rename a parent such that it moves up past other parents 1.6 => 1.1
                name: "5", srcIndex: 0, evPrev: 1, evIndex: 18, movers: ["5", "1.1", "1.2.3", "1.2.4", "1.3", "1.4", "1.5"],
                expected: "0, 2, 2.1, 2.1.1, 4, 4.1, 4.3, 4.2.1, 4.2.2, 4.2.2.1, 4.2.3, 4.2.3.1, 5, 1.1, 1.2.3, 1.2.4, 1.3, 1.4, 1.5"
            }, // source:  5, 2, 0, 4, 1.5, 1.1, 1.4, 1.3, 2.1, 4.1, 4.3, 1.2.4, 1.2.3, 2.1.1, 4.2.1, 4.2.2, 4.2.3, 4.2.2.1, 4.2.3.1
            {  // rename a parent such that it moves up past other parents 1.6 => 1.1
                name: "_", srcIndex: 3, evPrev: 4, evIndex: 0, movers: ["_", "4.1", "4.3", "4.2.1", "4.2.2", "4.2.2.1", "4.2.3", "4.2.3.1"],
                expected: "_, 4.1, 4.3, 4.2.1, 4.2.2, 4.2.2.1, 4.2.3, 4.2.3.1, 0, 2, 2.1, 2.1.1, 5, 1.1, 1.2.3, 1.2.4, 1.3, 1.4, 1.5"
            }  // source:  5, 2, 0, _, 1.5, 1.1, 1.4, 1.3, 2.1, 4.1, 4.3, 1.2.4, 1.2.3, 2.1.1, 4.2.1, 4.2.2, 4.2.3, 4.2.2.1, 4.2.3.1
        ];

        // Apply each change and validate the flattened collection
        changes.forEach(function (change) {
            if (change.movers) {
                Debug.assert(change.movers[0] === change.name);

                // Validate we get a move notification for the item and each of it's children
                calls.expectMany(change.movers.length, listener, "collectionchanged", null, function (ev) {
                    var mover = change.movers.shift();

                    tc.areEqual(flattened, ev.target);
                    tc.areEqual(ChangeType.itemChanged, ev.eType);
                    tc.areEqual(change.evPrev, ev.previousIndex);
                    tc.areEqual(change.evIndex, ev.index);
                    tc.areEqual(mover, flattened.item(change.evIndex).view.name);

                    // Moving up the tree requires us to shift our epxected index for children
                    if (change.evIndex < change.evPrev) {
                        change.evPrev++;
                        change.evIndex++;
                    }
                });
            }

            source.item(change.srcIndex).setName(change.name);
            var expected = change.expected.length > 0 ? change.expected.split(", ") : [];
            verifyCollection(tc, flattened, expected, calls);
        });
    });

    // Verify that nodes are removed/added when their parent changes
    Tx.test("TreeFlattener.parent", {owner: "neilpa", priority: 0}, function (tc) {
        var calls = new U.CallVerifier(tc);
        var names = ["1", "1.1", "2", "2.1", "2.2", "3", "4", "4.1", "4.2"];
        var source = createFolders(names);
        var flattened = new Mail.TreeFlattener(createTree(source));

        flattened.unlock();
        verifyCollection(tc, flattened, names, calls);

        // Parent changes to apply
        var changes = [
            // Make 4.2 a child of 4.1
            { itemIndex: 8, parentIndex: 7, expected: ["1", "1.1", "2", "2.1", "2.2", "3", "4", "4.1", "4.2"]  },
            // Make 3 a child of 4
            { itemIndex: 5, parentIndex: 6, expected: ["1", "1.1", "2", "2.1", "2.2", "4", "3", "4.1", "4.2"]  },
            // Make 2.2 a root node
            { itemIndex: 4, expected: ["1", "1.1", "2", "2.1", "2.2", "4", "3", "4.1", "4.2"]  },
            // Make 4.1 a child of 2.2
            { itemIndex: 7, parentIndex: 4, expected: ["1", "1.1", "2", "2.1", "2.2", "4.1", "4.2", "4", "3"]  },
            // Make 4.1 a root node
            { itemIndex: 7, expected: ["1", "1.1", "2", "2.1", "2.2", "4", "3", "4.1", "4.2"]  }
        ];

        changes.forEach(function (change) {
            var parentFolder = change.parentIndex !== undefined ? source.item(change.parentIndex).folder : null;
            var view = source.item(change.itemIndex);
            view.setParent(parentFolder);
            change.expected.forEach(function (name, index) {
                tc.areEqual(flattened.item(index).view.name, name);
            });
        });
    });

    // Verify that nodes with cycles (e.g. folder.parentFolder === folder) are filtered
    // out of the flattened collection
    Tx.test("TreeFlattener.cycle", {owner: "neilpa", priority: 0}, function (tc) {
        var calls = new U.CallVerifier(tc);
        var source = createFolders(["1"]);
        var view = source.item(0);
        var folder = view.folder;
        var flattened = new Mail.TreeFlattener(createTree(source));
        var listener = calls.hookEvents(flattened, ["collectionchanged"]);

        // Should have a single root folder
        flattened.unlock();
        verifyCollection(tc, flattened, ["1"], calls);

        // Setting the parent to istelf creates a cylce and it should be removed
        calls.expectOnce(listener, "collectionchanged", null, function (ev) {
            tc.areEqual(flattened, ev.target);
            tc.areEqual(ChangeType.itemRemoved, ev.eType);
            tc.areEqual(view.objectId, ev.objectId);
            tc.areEqual(0, ev.index);
            tc.areEqual(view, ev.removed[0].view);
        });
        view.setParent(folder);
        verifyCollection(tc, flattened, [], calls);

        // Break the cycle and it should show back up
        calls.expectOnce(listener, "collectionchanged", null, function (ev) {
            tc.areEqual(flattened, ev.target);
            tc.areEqual(ChangeType.itemAdded, ev.eType);
            tc.areEqual(view.objectId, ev.objectId);
            tc.areEqual(0, ev.index);
        });
        view.setParent(null);
        verifyCollection(tc, flattened, ["1"], calls);
    });

    function createTree(folders) {
        var tree = new Mail.ViewHierarchy(folders);
        tree.unlock();
        return tree;
    }

    function createFolders(names) {
        var collection = new Mail.ArrayCollection(names.map(function (name) { return createFolder(name); }));
        collection.forEach(function (view) { setParent(view.folder, collection); });
        collection.unlock();
        return collection;
    }

    function createFolder(name, collection) {
        var view = {
            mockedType: Mail.UIDataModel.MailView,
            objectId: String(Jx.uid()),
            name: name,
            type: P.MailViewType.userGeneratedFolder,
            setName: function (name) {
                this.name = this.folder.folderName = name;
                var ev = ["name"];
                ev.target = this;
                this.raiseEvent("changed", ev);
            },
            setParent: function (parentFolder) {
                this.folder.parentFolder = parentFolder;
                var ev = ["parentFolder"];
                ev.target = this;
                this.raiseEvent("changed", ev);
            }
        };
        var folder = {
            objectId: String(Jx.uid()),
            folderName: name,
            parentFolder: null,
            folderType: P.FolderType.mail,
            specialMailFolderType: P.MailFolderType.userGenerated,
        };
        view.sourceObject = view.folder = folder;

        Jx.mix(view, Jx.Events);
        Debug.Events.define(view, "changed");
        Jx.mix(folder, Jx.Events);
        Debug.Events.define(folder, "changed");

        if (collection) {
            setParent(view.folder, collection);
        }
        return view;
    }

    function setParent(folder, collection) {
        // Hierarchy of the tree is implied by the folder names e.g. 2 -> 2.1 -> 2.1.3
        var parentName = folder.folderName.slice(0, -2);
        folder.parentFolder = collection.reduce(function (prev, candidate) {
            return (candidate.name === parentName) ? candidate.folder : prev;
        }, null);
        Debug.assert(folder.parentFolder || parentName === "");
    }

    function verifyCollection(tc, collection, contents, calls) {
        tc.areEqual(collection.count, contents.length);
        calls.verify();
        forEach(contents, function (data, index) {
            var node = collection.item(index),
                view = node.view;
            tc.areEqual(view.name, data);
            tc.areEqual(node.depth, view.name.split(".").length - 1);
        });
    }

    function forEach(sequence, fn, context) { Array.prototype.forEach.call(sequence, fn, context); }
    function map(sequence, fn, context) { return Array.prototype.map.call(sequence, fn, context); }
    function reduce(sequence, fn, initial) { return Array.prototype.reduce.call(sequence, fn, initial); }
})();
