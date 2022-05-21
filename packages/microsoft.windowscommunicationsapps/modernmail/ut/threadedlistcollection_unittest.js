
(function () {

    /*global Mail,Microsoft,Tx,Mocks,Jx,Debug,Jm,JmDefs*/
    var Plat = Microsoft.WindowsLive.Platform,
        M = Mocks.Microsoft.WindowsLive.Platform,
        U = Mail.UnitTest;

    function setUp(tc, options) {
        var dataset = {
            Account: {
                all: [{ objectId: "account" }]
            },
            Folder: {
                all: [{
                    objectId: "inbox",
                    specialMailFolderType: Plat.MailFolderType.inbox
                }]
            },
            MailView: {
                all: [{
                    accountId: "account",
                    objectId: "inboxView",
                    type: Plat.MailViewType.inbox,
                    mock$sourceObjectId: "inbox"
                }]
            },
            MailConversation: { all: [] },
            MailMessage: { all: [] }
        };

        options = options || {
            collection: {
                c1: 2,
                c2: 1,
                c3: 2
            },
            initialExpansion: 2,
            initialExpansionId: "c3"
        };

        // Init Jm
        JmDefs.bindUtVerify(tc);

        // Populate the sample data set
        for (var conversationId in options.collection) {
            var childrenCount = options.collection[conversationId];
            dataset.MailConversation.all.push({
                objectId: conversationId,
                totalCount: childrenCount
            });
            for (var i = 0; i < childrenCount; i++) {
                dataset.MailMessage.all.push({
                    objectId: conversationId + "message" + String(i + 1),
                    parentConversationId: conversationId
                });
            }
        }
        tc.provider = new M.Data.JsonProvider(dataset, M.Data.MethodHandlers);
        // create the target
        tc.target = createTarget(tc, tc.provider, options);

        // clean up
        tc.cleanup = function () {
            JmDefs.unbindUtVerify();
        };
    }

    var createTarget = function (tc, provider, options) {
        tc.isTrue(Jx.isNullOrUndefined(options.initialExpansion) || Jx.isValidNumber(options.initialExpansion));
        tc.isTrue(Jx.isNullOrUndefined(options.initialExpansionId) || Jx.isNonEmptyString(options.initialExpansionId));

        var conversationCollection = provider.query("MailConversation", "all"),
            account = new Mail.Account(provider.getObjectById("account"), provider.getClient()),
            view = new Mail.UIDataModel.MailView(provider.getObjectById("inboxView"), account),
            CtorOption = {
                initialExpansion: options.initialExpansion,
                initialExpansionId: options.initialExpansionId
            },
            locked = Jx.isBoolean(options.locked) ? options.locked : false,
            target = new Mail.ThreadedListCollection(provider.getClient(), conversationCollection, view, locked, CtorOption);

        // Disable debug hooks
        Debug.ThreadedListCollection.verifyExpansionState = Jx.fnEmpty;

        // Override the raiseEvent method on target so we can pick up events
        target.raiseEvent = Jm.mockFn();
        tc.conversationCollection = conversationCollection;
        return target;
    };

    var verifyInitialized = function (tc, options) {
        // Ensure we hooked all the events on the given conversation collection
        // Validate initial values
        tc.areEqual(options.count, tc.target.count);
        tc.areEqual(options.expandedIndex, tc.target.activeConversationIndex);
        tc.areEqual(Jx.isNumber(options.expandedIndex) && (options.expandedIndex !== -1), tc.target.expanded);
    };

    Tx.test("ThreadedListCollection.test_conversationNode_placeHolder", { owner: "kepoon", priority: 0 }, function (tc) {
        setUp(tc);
        var account = new Mail.Account(tc.provider.getObjectById("account"), tc.provider.getClient()),
            view = new Mail.UIDataModel.MailView(tc.provider.getObjectById("inboxView"), account),
            node = new Mail.ConversationNode({ objectId: "foo" }, view);

        tc.areEqual(node.totalCount, 0);
        tc.areEqual(node.objectId, "foo");
        tc.areEqual(node.pendingRemoval, true);

        // Accessing member function should not crash
        tc.isFalse(node.expand());
        tc.areEqual(node.findIndexById("someIndex"), -1);
    });

    Tx.test("ThreadedListCollection.test_preExpand", {owner: "kepoon", priority: 0}, function (tc) {
        setUp(tc, {
            collection: {
                c1: 2,
                c2: 1,
                c3: 2
            },
            initialExpansion: 2,
            initialExpansionId: "c3message1"
        });
        verifyInitialized(tc, { count: 5, expandedIndex: 2});
    });

    // We should default to pre-expanding the first conv in the list if the given id does not exist
    Tx.test("ThreadedListCollection.test_preExpandWithInvalidId", { owner: "kepoon", priority: 0 }, function (tc) {
        setUp(tc, {
            collection: {
                c1: 2,
                c2: 1,
                c3: 2
            },
            initialExpansion: 2,
            initialExpansionId: "invalidId"
        });
        // Initialize a conversation collection with a pre-expanded id
        verifyInitialized(tc, { count: 5, expandedIndex: 0 /*default to 0*/ });
    });

    Tx.test("ThreadedListCollection.test_dispose", { owner: "kepoon", priority: 0 }, function (tc) {
        setUp(tc);
        var activeConversation = tc.target.activeConversation,
            conversationCollection = tc.target._conversationCollection;
        activeConversation.dispose = Jm.mockFn();
        conversationCollection.dispose = Jm.mockFn();
        // Verify both conversations are disposed
        tc.target.dispose();
        Jm.verify(conversationCollection.dispose)();
        Jm.verify(activeConversation.dispose)();
    });

    // Ensure we pass this call on to the child collections correctly. Additional logic in onListViewLoadingStateChanged is covered in later tests.
    Tx.test("ThreadedListCollection.test_lockunlock", { owner: "kepoon", priority: 0 }, function (tc) {
        setUp(tc);
        var activeConversation = tc.target.activeConversation,
            conversationCollection = tc.target._conversationCollection;
        conversationCollection.lock = Jm.mockFn();
        activeConversation.lock = Jm.mockFn();
        conversationCollection.unlock = Jm.mockFn();
        activeConversation.unlock = Jm.mockFn();
        // Verify both conversations are disposed
        tc.target.lock();
        Jm.verify(conversationCollection.lock)();
        Jm.verify(activeConversation.lock)();
        tc.target.lock();
        Jm.verifyNot(conversationCollection.lock)();
        Jm.verifyNot(activeConversation.lock)();

        tc.target.unlock();
        Jm.verify(conversationCollection.unlock)();
        Jm.verify(activeConversation.unlock)();
        tc.target.unlock();
        Jm.verifyNot(conversationCollection.unlock)();
        Jm.verifyNot(activeConversation.unlock)();

        // test lock/unlock with pending expansion
        tc.target.lock();
        tc.target.expand(0);
        tc.target.unlock();
        Jm.verify(conversationCollection.unlock)();
        Jm.verify(activeConversation.unlock)();

    });

    Tx.test("ThreadedListCollection.test_getConversation", { owner: "kepoon", priority: 0 }, function (tc) {
        setUp(tc, {
            collection: {
                c1: 2,
                c2: 2,
                c3: 2
            },
            initialExpansion: 1,
            initialExpansionId: "c2message1"
        });

        // Verification
        verifyInitialized(tc, { count: 5, expandedIndex: 1});
        tc.areEqual(tc.target.item(0).objectId, "c1", "before expanded index");
        tc.areEqual(tc.target.item(1).objectId, "c2", "at expanded index");
        tc.areEqual(tc.target.item(4).objectId, "c3", "after expanded index");
    });

    Tx.test("ThreadedListCollection.test_getMessageItem", { owner: "kepoon", priority: 0 }, function (tc) {
        setUp(tc, {
            collection: {
                c1: 2,
                c2: 2,
                c3: 2
            },
            initialExpansion: 1,
            initialExpansionId: "c2message1"
        });

        // Verification
        verifyInitialized(tc, { count: 5, expandedIndex: 1 });
        tc.areEqual(tc.target.item(2).objectId, "c2message1");
        tc.areEqual(tc.target.item(3).objectId, "c2message2");
    });

    Tx.test("ThreadedListCollection.test_collapse", { owner: "kepoon", priority: 0 }, function (tc) {
        setUp(tc, {
            collection: {
                c1: 2,
                c2: 2,
                c3: 2
            },
            initialExpansion: 0,
            initialExpansionId: "c1message1"
        });
        tc.target.collapse();

        verifyBatchOperation(tc, { expectedCount: 3, expectedExpandedConversationIndex: 0 }, function (inOrder) {
            verifyCollapsed(tc, inOrder, 0);
        });

        // Verify we no longer return items from the expanded message collection
        for (var i = 0; i < tc.target.count; i++) {
            tc.areEqual(tc.target._conversationCollection.item(i), tc.target.item(i));
        }
        tc.isTrue(!tc.target.expanded);
    });

    // Collapsing single item conversations will not fire a raiseEvent since it was never appearing expanded.
    Tx.test("ThreadedListCollection.test_collapseSingleItem", { owner: "kepoon", priority: 0 }, function (tc) {
        setUp(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 2
            },
            initialExpansion: 0,
            initialExpansionId: "c1message1"
        });
        tc.target.collapse();
        verifyNoRemoves(tc);
    });

    // Ensure collapsing unopened thread is a noop
    Tx.test("ThreadedListCollection.test_collapseUnopenedThread", { owner: "kepoon", priority: 0 }, function (tc) {
        setUp(tc, {
            collection: {
                c1: 2,
                c2: 2,
                c3: 2
            }
        });
        tc.target.collapse();
        verifyNoRemoves(tc);
    });

    Tx.test("ThreadedListCollection.test_collapseWhenViewIsNotReady", { owner: "kepoon", priority: 0 }, function (tc) {
        setUp(tc, {
            collection: {
                c1: 2,
                c2: 2,
                c3: 2
            },
            initialExpansion: 0,
            initialExpansionId: "c1message1",
            locked: true
        });

        // Verify we don't collapse right away
        tc.target.collapse();
        verifyNoRemoves(tc);

        // Now alert the collection that the view is ready, and ensure the thread is then collapsed
        tc.target.unlock();
        verifyBatchOperation(tc, { expectedCount: 3, expectedExpandedConversationIndex: 0 }, function (inOrder) {
            verifyCollapsed(tc, inOrder, 0);
        });
    });

    Tx.test("ThreadedListCollection.test_expand", { owner: "kepoon", priority: 0 }, function (tc) {
        setUp(tc, {
            collection: {
                c1: 2,
                c2: 2,
                c3: 2
            }
        });

        // Expand conversation c2
        tc.target.expand(1);
        verifyBatchOperation(tc, { expectedCount: 5, expectedExpandedConversationIndex: 1}, function (inOrder) {
            verifyExpanded(tc, inOrder, 1);
        });
    });

    // Expanding a collection with just 1 item should hook events, but not fire any raiseEvent operations
    Tx.test("ThreadedListCollection.test_expandSingleItem", { owner: "kepoon", priority: 0 }, function (tc) {
        setUp(tc, {
            collection: {
                c1: 2,
                c2: 1,
                c3: 2
            }
        });

        // Expand conversation c2
        tc.target.expand(1);

        // Expected count is just the number of conversations
        verifyBatchOperation(tc, { expectedCount: 3, expectedExpandedConversationIndex: 1 }, function (inOrder) {
            verifyExpanded(tc, inOrder, 1);
        });
    });

    Tx.test("ThreadedListCollection.test_expandCollapse", { owner: "kepoon", priority: 0 }, function (tc) {
        setUp(tc, {
            collection: {
                c1: 2,
                c2: 3,
                c3: 2
            },
            initialExpansion: 0,
            initialExpansionId: "c1message1"
        });

        verifyInitialized(tc, {count: 5, expandedIndex: 0});
        var prevExpandedConversation = tc.target._conversationCollection.item(0);
        // Expand conversation c2
        tc.target.expand(3);

        // Verify
        verifyBatchOperation(tc, { expectedCount: 6, expectedExpandedConversationIndex: 1}, function (inOrder) {
            verifyCollapsed(tc, inOrder, 0, prevExpandedConversation);
            verifyExpanded(tc, inOrder, 1);
        });
    });

    // Trying to expand an already expanded conversation should be a noop
    Tx.test("ThreadedListCollection.test_expandAlreadyExpandedConversation", { owner: "kepoon", priority: 0 }, function (tc) {
        setUp(tc, {
                collection: {
                    c1: 2,
                    c2: 3,
                    c3: 2
                },
                initialExpansion: 0,
                initialExpansionId: "c1message1"
            });

        verifyInitialized(tc, {count: 5, expandedIndex: 0});
        // Expand conversation c1
        tc.target.expand(0);
        verifyNotExpanded(tc);
    });

    Tx.test("ThreadedListCollection.test_expandWhenViewIsNotReady", { owner: "kepoon", priority: 0 }, function (tc) {
        setUp(tc, {
            collection: {
                c1: 4,
                c2: 3,
                c3: 2
            },
            locked: true
        });

        // Verify we don't expand right away
        tc.target.expand(0);
        verifyNotExpanded(tc);

        // Now alert the collection that the view is ready, and ensure the thread is then expanded
        tc.target.unlock();
        tc.areEqual(tc.target.activeConversationIndex, 0);
        tc.isTrue(tc.target.item(0).expanded);
        tc.areEqual(tc.target.count, 7);
    });

    // Verify the event indices are adjusted correctly
    Tx.test("ThreadedListCollection.test_itemAdded", { owner: "kepoon", priority: 0 }, function (tc) {
        // Initialize a conversation collection with a pre-expanded index
        setUp(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 1,
                c4: 2,
                c5: 1
            },
            initialExpansion: 3,
            initialExpansionId: "c4message1"
        });

        // ev.index before the expanded thread should stay the same
        verifyItemAdded(tc, tc.conversationCollection, "MailConversation", 3, 3);

        // index after the expanded thread should stay be updated
        var activeConversationIndex = tc.target.activeConversationIndex;
        tc.areEqual(activeConversationIndex, 4);
        verifyItemAdded(tc, tc.conversationCollection, "MailConversation", 5, 7);

        tc.areEqual(tc.target.activeConversationIndex, 4);

        // index from the expanded thread should be adjusted
        verifyItemAdded(tc, getActiveChildren(tc), "MailMessage", 1, activeConversationIndex + 1 + 1);
    });

    Tx.test("ThreadedListCollection.test_itemRemoved", { owner: "kepoon", priority: 0 }, function (tc) {
        setUp(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 1,
                c4: 2,
                c5: 1
            },
            initialExpansion: 3,
            initialExpansionId: "c4message1"
        });

        // ev.index before the expanded thread should stay the same
        verifyItemRemoved(tc, tc.conversationCollection, 2, 2);

        // index after the expanded thread should stay be updated
        var activeConversationIndex = tc.target.activeConversationIndex;
        tc.areEqual(activeConversationIndex, 2);
        verifyItemRemoved(tc, tc.conversationCollection, 3, 5);

        tc.areEqual(tc.target.activeConversationIndex, 2);

        // index from the expanded thread should be adjusted
        verifyItemRemoved(tc, getActiveChildren(tc), 0, activeConversationIndex + 1);
    });

    Tx.test("ThreadedListCollection.test_itemAdded_noExpandedThread", { owner: "kepoon", priority: 0 }, function (tc) {
        setUp(tc, {
            collection: {
                c1: 1,
                c2: 1,
                c3: 1
            },
            initialExpansion: 1,
            initialExpansionId: "c2message1"
        });

        tc.areEqual(tc.target.activeConversationIndex, 1);
        verifyItemAdded(tc, tc.conversationCollection, "MailConversation", 0, 0);
        verifyItemAdded(tc, tc.conversationCollection, "MailConversation", 2, 2);
    });

    Tx.test("ThreadedListCollection.test_itemMoved_noExpandedThread", { owner: "kepoon", priority: 0 }, function (tc) {
        setUp(tc, {
            collection: {
                c1: 1,
                c2: 1,
                c3: 1,
                c4: 1,
                c5: 1
            },
            initialExpansion: 2,
            initialExpansionId: "c3message1"
        });

        tc.areEqual(tc.target.activeConversationIndex, 2);
        verifyItemMoved(tc, tc.conversationCollection, "MailConversation", 0, 1, 0, 1);
        verifyItemMoved(tc, tc.conversationCollection, "MailConversation", 3, 4, 3, 4);
    });

    Tx.test("ThreadedListCollection.test_itemRemoved_noExpandedThread", { owner: "kepoon", priority: 0 }, function (tc) {
        setUp(tc, {
            collection: {
                c1: 1,
                c2: 1,
                c3: 1
            },
            initialExpansion: 1,
            initialExpansionId: "c2message1"
        });

        tc.areEqual(tc.target.activeConversationIndex, 1);
        verifyItemRemoved(tc, tc.conversationCollection, 0, 0);
        verifyItemRemoved(tc, tc.conversationCollection, 1, 1);
    });

    Tx.test("ThreadedListCollection.test_removeOnlyExpandedThread", { owner: "kepoon", priority: 0 }, function (tc) {
        setUp(tc, {
            collection: {
                c1: 4,
                c2: 1
            },
            initialExpansion: 0,
            initialExpansionId: "c1message1"
        });

        tc.areEqual(tc.target.count, 6);
        var isCollapsingFired = false;
        // Listen to the threadCollapsing event and call expand
        Jm.when(tc.target.raiseEvent)("collapsing", Jm.Verifiers.deepCompare({ index: 0 })).then(function () {
            // ensure the intermittent count is correct in the middle of a cascaded collapsed
            verifyCollection(tc, {
                c2: 1
            }, -1);
            tc.areEqual(tc.target.activeConversation, null);
            isCollapsingFired = true;
        }.bind(this));

        U.ensureSynchronous(function () {
            tc.conversationCollection.mock$removeItem(0);
        });
        tc.isTrue(isCollapsingFired);
    });

    // When an item is removed to make this a single message convo, we should fire the events to collapse the thread
    Tx.test("ThreadedListCollection.test_autoCollapse", { owner: "kepoon", priority: 0 }, function (tc) {
        setUp(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 1
            },
            initialExpansion: 1,
            initialExpansionId: "c2message1"
        });

        U.ensureSynchronous(function () {
            // remove c2message2
            getActiveChildren(tc).mock$removeItem(1);
        });

        verifyBatchOperation(tc, { expectedCount: 3, expectedExpandedConversationIndex: 1 }, function (inOrder) {
            verifyCollapsedEvents(tc, inOrder, 1);
        });

        verifyCollection(tc, {
            c1: 1,
            c2: 1,
            c3: 1
        }, 1);
    });

    // We should just suppress the event entirely
    Tx.test("ThreadedListCollection.test_itemRemoved_lastMessageInConversation", { owner: "kepoon", priority: 0 }, function (tc) {
        setUp(tc, {
            collection: {
                c1: 1,
                c2: 1,
                c3: 1
            },
            initialExpansion: 1,
            initialExpansionId: "c2message1"
        });

        U.ensureSynchronous(function () {
            // remove c2message1
            getActiveChildren(tc).mock$removeItem(0);
        });

        verifyNoRemoves(tc);
    });

    // Ensure we collapse the expanded thread if it is removed.
    // This test also makes sure we can call expand during this collapse and have it all be one single operation.
    // This simulates the expected behavior in the app.
    Tx.test("ThreadedListCollection.test_itemRemoved_expandedThread", { owner: "kepoon", priority: 0 }, function (tc) {
        setUp(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 3,
                c4: 1
            },
            initialExpansion: 1,
            initialExpansionId: "c2message1"
        });

        // Listen to the threadCollapsing event and call expand
        Jm.when(tc.target.raiseEvent)("itemRemoved", Jm.Verifiers.deepCompare({ objectId: "c2" })).then(function () {
            tc.target.expand(1); // expand c3
        }.bind(this));

        var originalExpandedThread = tc.target.item(1);
        U.ensureSynchronous(function () {
            // remove c2message2
            tc.conversationCollection.mock$removeItem(1);
        });

        // Verify we collapsed the expanded thread, and expanded the new thread all in one batch operation
        verifyBatchOperation(tc, { expectedCount: 6, expectedExpandedConversationIndex: 1}, function (inOrder) {
            // Collapse
            verifyCollapsed(tc, inOrder, 1, originalExpandedThread);
            inOrder.verify(tc.target.raiseEvent)("itemRemoved", Jm.Verifiers.deepCompare({ index: 1 }));

            // Expand
            verifyExpanded(tc, inOrder, 1);
        });

        verifyCollection(tc, {
            c1: 1,
            c3: 3,
            c4: 1
        }, 1);
    });

    // Ensure there is no expansion after a reset event
    Tx.test("ThreadedListCollection.test_reset", { owner: "kepoon", priority: 0 }, function (tc) {
        setUp(tc, {
            collection: {
                c1: 2,
                c2: 1,
                c3: 1,
                c4: 1
            },
            initialExpansion: 0,
            initialExpansionId: "c1message1"
        });


        U.ensureSynchronous(function () {
            tc.conversationCollection._fireChange(Plat.CollectionChangeType.reset, -1, -1, null);
        });

        // Verify there is no expanded thread anymore
        tc.areEqual(-1, tc.target.activeConversationIndex);

        // Verify no remove events were fired due to collapse
        Jm.verifyNot(tc.target.raiseEvent)("itemRemoved", Jm.Verifiers.deepCompare({}));
    });

    Tx.test("ThreadedListCollection.test_reset_without_initialExpansion", { owner: "kepoon", priority: 0 }, function (tc) {
        // regression test for BLUE:349384
        setUp(tc, {
            collection: {
                c1: 2,
                c2: 1,
                c3: 1,
                c4: 1
            },
        });

        U.ensureSynchronous(function () {
            tc.conversationCollection._fireChange(Plat.CollectionChangeType.reset, -1, -1, null);
        });

        // Verify there is no expanded thread anymore
        tc.areEqual(-1, tc.target.activeConversationIndex);

        // Verify no remove events were fired due to collapse
        Jm.verifyNot(tc.target.raiseEvent)("itemRemoved", Jm.Verifiers.deepCompare({}));
    });

    // Ensure we remove any pending expansion after a reset event
    Tx.test("ThreadedListCollection.test_reset_clearPendingExpandCollapse", { owner: "kepoon", priority: 0 }, function (tc) {
        setUp(tc, {
            collection: {
                c1: 2
            }
        });

        tc.target.lock();
        tc.target.expand(0);
        tc.target.clearPendingExpandCollapse = Jm.mockFn();
        tc.conversationCollection._fireChange(Plat.CollectionChangeType.reset, -1, -1, null);
        Jm.verify(tc.target.clearPendingExpandCollapse)();
    });

    Tx.test("ThreadedListCollection.test_findIndexByMessageId_noExpansion", { owner: "kepoon", priority: 0 }, function (tc) {
        setUp(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 3
            }
        });

        var testCases = [
            { input: "c1message1", expected: 0},
            { input: "c2message1", expected: 1},
            { input: "c2message2", expected: 1},
            { input: "c3message1", expected: 2},
            { input: "c3message2", expected: 2},
            { input: "c3message3", expected: 2},
            { input: "xyzabc", expected: -1},
        ];

        testCases.forEach(function (testCase) {
            tc.areEqual(tc.target.findIndexByMessageId(testCase.input), testCase.expected, "input:= " + testCase.input);
        });
    });

    Tx.test("ThreadedListCollection.test_findIndexByMessageId", { owner: "kepoon", priority: 0 }, function (tc) {
        setUp(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 3
            },
            initialExpansion: 1,
            initialExpansionId: "c2message1"
        });

        // add a message that is committed to the DB, but not yet notified to the collection yet
        tc.provider.loadObject("MailMessage", {
            objectId : "c1message2",
            parentConversationId: "c1"
        });

        var testCases = [
            { input: "c1message1", expected: 0},
            { input: "c1message2", expected: -1},
            { input: "c2message1", expected: 1},
            { input: "c2message2", expected: 1},
            { input: "c3message1", expected: 4},
            { input: "c3message2", expected: 4},
            { input: "c3message3", expected: 4},
            { input: "xyzabc", expected: -1},
        ];

        testCases.forEach(function (testCase) {
            tc.areEqual(tc.target.findIndexByMessageId(testCase.input), testCase.expected, "input:= " + testCase.input);
        });
    });

    Tx.test("ThreadedListCollection.test_findIndexByThreadId", { owner: "kepoon", priority: 0 }, function (tc) {
        setUp(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 3
            },
            initialExpansion: 1,
            initialExpansionId: "c2message1"
        });

        var testCases = [
            { input: "c1", expected: 0},
            { input: "c2", expected: 1},
            { input: "c3", expected: 4},
            { input: "xyzabc", expected: -1},
        ];

        testCases.forEach(function (testCase) {
            tc.areEqual(tc.target.findIndexByThreadId(testCase.input), testCase.expected, "input:= " + testCase.input);
        });
    });

    // Ensure that we correctly do the batch depth for begin/end changes so we only call them once per large operation
    Tx.test("ThreadedListCollection.test_beginEndChanges", { owner: "kepoon", priority: 0 }, function (tc) {
        setUp(tc, {
            collection: {
                c1: 1,
                c2: 1,
                c3: 1
            }
        });

        // Set up endChanges so that it calls beginChanges, which at one point, messed up the logic
        var called = false,
            deepVerifier = Jm.Verifiers.deepCompare({ target: tc.target });
        Jm.when(tc.target.raiseEvent)("endChanges", deepVerifier).then(function () {
            // Overwrite that logic
            Jm.when(tc.target.raiseEvent)(Jm.ANY).then(function () { });

            tc.target._beginChanges();
            tc.target._beginChanges();
            tc.target._endChanges();
            tc.target._endChanges();

            called = true;
        }.bind(this));

        tc.target._beginChanges();
        tc.target._endChanges();
        tc.isTrue(called, "Failed sanity check. endChanges event should have been raised");

        var inOrder = Jm.inOrder();
        inOrder.verify(tc.target.raiseEvent)("beginChanges", deepVerifier);
        inOrder.verifyNot(tc.target.raiseEvent)("beginChanges", deepVerifier);
        inOrder.verify(tc.target.raiseEvent)("endChanges", deepVerifier);
        inOrder.verifyNot(tc.target.raiseEvent)("endChanges", deepVerifier);
    });

    // Action
    // c2 -> c1
    //
    // Special handling
    // - Adjust the activeConversationIndex
    // - Fire move events for all expanded messages
    Tx.test("ThreadedListCollection.test_expandedConversationMoved", { owner: "kepoon", priority: 0 }, function (tc) {
        setUp(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 1,
                c4: 1
            },
            initialExpansion: 1,
            initialExpansionId: "c2message1"
        });

        // Adjust the conversation collection to reflect state in the move event
        var c1 = tc.target._conversationCollection.item(0),
            c2 = tc.target._conversationCollection.item(1);

        // Move c2 => c1
        U.ensureSynchronous(function () {
            tc.conversationCollection.mock$moveItem(1, 0);
        });

        // Verify
        verifyBatchOperation(tc, { expectedCount: 4 + 2, expectedExpandedConversationIndex: 0 }, function (inOrder) {
            inOrder.verify(tc.target.raiseEvent)("itemMoved", Jm.Verifiers.deepCompare({
                previousIndex: 1,
                index: 0,
                nextId: c1.objectId
            }));
            inOrder.verify(tc.target.raiseEvent)("itemMoved", Jm.Verifiers.deepCompare({
                data: c2.item(0),
                previousIndex: 2,
                index: 1,
                nextId: c1.objectId,
                objectId: c2.item(0).objectId
            }));
            inOrder.verify(tc.target.raiseEvent)("itemMoved", Jm.Verifiers.deepCompare({
                data: c2.item(1),
                previousIndex: 3,
                index: 2,
                nextId: c1.objectId,
                objectId: c2.item(1).objectId
            }));
            inOrder.verifyNot(tc.target.raiseEvent)("itemMoved", Jm.Verifiers.deepCompare({}));
        });
        tc.areEqual(0, tc.target.activeConversationIndex, "Unexpected activeConversationIndex");
    });

    Tx.test("ThreadedListCollection.test_conversationMovedBeforeExpanded", { owner: "kepoon", priority: 0 }, function (tc) {
        setUp(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 1,
                c4: 1
            },
            initialExpansion: 1,
            initialExpansionId: "c2message1"
        });

        // Move c3 => c2
        U.ensureSynchronous(function () {
            tc.conversationCollection.mock$moveItem(2, 1);
        });

        // Verify
        Jm.verify(tc.target.raiseEvent)("itemMoved", Jm.Verifiers.deepCompare({
            previousIndex: 4,
            index: 1
        }));
        Jm.verifyNot(tc.target.raiseEvent)("itemMoved", Jm.Verifiers.deepCompare({}));
        tc.areEqual(2, tc.target.activeConversationIndex, "Unexpected activeConversationIndex");
    });

    function getActiveChildren(tc) {
        return tc.target.activeConversation._children._deferredCollection._collection._realCollection._collection._collection;
    }

    Tx.test("ThreadedListCollection.test_conversationMoved_afterExpanded", { owner: "kepoon", priority: 0 }, function (tc) {
        setUp(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 1,
                c4: 1
            },
            initialExpansion: 1,
            initialExpansionId: "c2message1"
        });

        // Move c4 => c3
        U.ensureSynchronous(function () {
            tc.conversationCollection.mock$moveItem(3, 2);
        });

        // Verify
        Jm.verify(tc.target.raiseEvent)("itemMoved", Jm.Verifiers.deepCompare({
            previousIndex: 5,
            index: 4
        }));
        Jm.verifyNot(tc.target.raiseEvent)("itemMoved", Jm.Verifiers.deepCompare({}));
        tc.areEqual(1, tc.target.activeConversationIndex, "Unexpected activeConversationIndex");
    });

    Tx.test("ThreadedListCollection.test_ConversationMovedAcrossExpandedThread", { owner: "kepoon", priority: 0 }, function (tc) {
        setUp(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 1,
                c4: 1
            },
            initialExpansion: 1,
            initialExpansionId: "c2message1"
        });

        // Move c1 => c2
        U.ensureSynchronous(function () {
            tc.conversationCollection.mock$moveItem(0, 1);
        });

        // Verify
        Jm.verify(tc.target.raiseEvent)("itemMoved", Jm.Verifiers.deepCompare({
            previousIndex: 0,
            index: 3,
            objectId: "c1"
        }));
        Jm.verifyNot(tc.target.raiseEvent)("itemMoved", Jm.Verifiers.deepCompare({}));
        tc.areEqual(0, tc.target.activeConversationIndex, "Unexpected activeConversationIndex");
    });

    Tx.test("ThreadedListCollection.test_expandedConversationMovedDown", { owner: "kepoon", priority: 0 }, function (tc) {
        setUp(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 1,
                c4: 1
            },
            initialExpansion: 1,
            initialExpansionId: "c2message1"
        });

        // Adjust the conversation collection to reflect state in the move event
        var c3 = tc.target._conversationCollection.item(2),
            c2 = tc.target._conversationCollection.item(1);

        // Move c2 => c3
        U.ensureSynchronous(function () {
            tc.conversationCollection.mock$moveItem(1, 2);
        });

        // Verify
        verifyBatchOperation(tc, { expectedCount: 6, expectedExpandedConversationIndex: 2 }, function (inOrder) {
            inOrder.verify(tc.target.raiseEvent)("itemMoved", Jm.Verifiers.deepCompare({
                data: c2.item(1),
                previousIndex: 3,
                index: 4,
                prevId: c3.objectId,
                objectId: c2.item(1).objectId
            }));
            inOrder.verify(tc.target.raiseEvent)("itemMoved", Jm.Verifiers.deepCompare({
                data: c2.item(0),
                previousIndex: 2,
                index: 3,
                prevId: c3.objectId,
                objectId: c2.item(0).objectId
            }));
            inOrder.verify(tc.target.raiseEvent)("itemMoved", Jm.Verifiers.deepCompare({
                previousIndex: 1,
                index: 2,
                objectId: "c2"
            }));
            inOrder.verifyNot(tc.target.raiseEvent)("itemMoved", Jm.Verifiers.deepCompare({}));
        });

        tc.areEqual(2, tc.target.activeConversationIndex, "Unexpected activeConversationIndex");
    });

    var verifyCollection = function (tc, collection, activeConversationIndex) {
        var indexCounter = 0,
            keys = Object.keys(collection),
            activeKey = keys[activeConversationIndex],
            activeConversationTotalCount = activeKey ? collection[activeKey] : 0,
            expectedCount = (activeConversationTotalCount === 1) ? keys.length : keys.length + activeConversationTotalCount;

        tc.areEqual(activeConversationIndex, tc.target.activeConversationIndex);
        tc.areEqual(expectedCount, tc.target.count);
        for (var conversationId in collection) {
            var count = collection[conversationId];
            tc.areEqual(tc.target.item(indexCounter).objectId, conversationId);
            if (indexCounter === activeConversationIndex && tc.target.expanded) {
                for (var i = 0; i < count; i++) {
                    indexCounter++;
                    tc.areEqual(tc.target.item(indexCounter).objectId, conversationId + "message" + (i + 1));
                }
            }
            indexCounter++;
        }
    };

    var verifyItemAdded = function (tc, eventSource, type, index, expectedIndex) {
        // Also ensure we adjust any previousIndex properties
        U.ensureSynchronous(function () {
            eventSource.mock$addItem(tc.provider.createObject(type), index);
        });
        Jm.verify(tc.target.raiseEvent)("itemAdded", Jm.Verifiers.deepCompare({ index: expectedIndex}));
    };

    var verifyItemMoved = function (tc, eventSource, type, index, prevIndex, expectedIndex, expectedPrevIndex) {
        // Also ensure we adjust any previousIndex properties
        U.ensureSynchronous(function () {
            eventSource.mock$moveItem(prevIndex, index);
        });
        Jm.verify(tc.target.raiseEvent)("itemMoved", Jm.Verifiers.deepCompare({ index: expectedIndex, previousIndex: expectedPrevIndex}));
    };

    var verifyItemRemoved = function (tc, eventSource, index, expectedIndex) {
        // Also ensure we adjust any previousIndex properties
        U.ensureSynchronous(function () {
            eventSource.mock$removeItem(index);
        });
        Jm.verify(tc.target.raiseEvent)("itemRemoved", Jm.Verifiers.deepCompare({ index: expectedIndex }));
    };

    var verifyNoRemoves = function (tc) {
        // Verify no itemRemoved events were raised
        Jm.verifyNot(tc.target.raiseEvent)("itemRemoved", Jm.Verifiers.deepCompare({}));
    };

    var verifyNotExpanded = function (tc) {
        // Verify no itemAdded events were raised
        Jm.verifyNot(tc.target.raiseEvent)("itemAdded", Jm.Verifiers.deepCompare({}));
    };

    var verifyCollapsedEvents = function (tc, inOrder, startIndex) {
        tc.isTrue(Boolean(tc.target.activeConversation), "Expected activeConversation");

        var childrenCount = tc.target.activeConversation.totalCount,
            conversationId = tc.target.activeConversation.objectId;

        // Verify we fired the itemRemoved events, in order
        for (var i = childrenCount - 1; i >= 0; i--) {
            var listViewIndex = startIndex + i + 1;
            Jm.verify(tc.target.raiseEvent)("itemRemoved", Jm.Verifiers.deepCompare({
                objectId: conversationId + "message" + String(i + 1),
                index: listViewIndex
            }));
        }
    };

    var verifyCollapsed = function (tc, inOrder, startIndex, conversation) {
        /// <param name="options" type="Object" optional="true"></param>
        tc.isTrue(Boolean(tc.target.activeConversation), "Expected tc.activeConversation");
        conversation = conversation || tc.target.activeConversation;
        var childrenCount = conversation.totalCount,
            conversationId = conversation.objectId;

        if (childrenCount > 1) {
            // Verify we fired the itemRemoved events, in order
            for (var i = childrenCount - 1; i >= 0; i--) {
                var listViewIndex = startIndex + i + 1;
                Jm.verify(tc.target.raiseEvent)("itemRemoved", Jm.Verifiers.deepCompare({
                    objectId: conversationId + "message" + String(i + 1),
                    index: listViewIndex
                }));
            }
        } else {
            verifyNoRemoves(tc);
        }

        tc.isFalse(conversation.expanded);

        if (conversation === tc.target.activeConversation) {
            tc.isFalse(tc.target.expanded);
        }
    };

    var verifyExpandedEvents = function (tc, inOrder, startIndex) {
        tc.isTrue(Boolean(tc.target.activeConversation), "Expected activeConversation");

        var childrenCount = tc.target.activeConversation.totalCount,
            conversationId = tc.target.activeConversation.objectId;
        tc.isTrue(childrenCount > 1, "Expected activeConversation to have count > 1");

        // Verify we fired the itemAdded events, in order
        for (var i = 0; i < childrenCount; i++) {
            var listViewIndex = startIndex + i + 1;
            inOrder.verify(tc.target.raiseEvent)("itemAdded", Jm.Verifiers.deepCompare({
                objectId: conversationId + "message" + String(i + 1),
                index: listViewIndex
            }));
        }
    };

    var verifyExpanded = function (tc, inOrder, startIndex) {
        tc.isTrue(Boolean(tc.target.activeConversation), "Expected tc.activeConversation");
        var childrenCount = tc.target.activeConversation.totalCount,
            conversationId = tc.target.activeConversation.objectId;

        if (childrenCount > 1) {
            // Verify we fired the itemAdded events, in order
            tc.isTrue(childrenCount > 1, "Expected tc.activeConversation to have count > 1");
            // Verify we fired the itemAdded events, in order
            for (var i = 0; i < childrenCount; i++) {
                var listViewIndex = startIndex + i + 1;
                inOrder.verify(tc.target.raiseEvent)("itemAdded", Jm.Verifiers.deepCompare({
                    objectId: conversationId + "message" + String(i + 1),
                    index: listViewIndex
                }));
            }
        } else {
            verifyNotExpanded(tc);
        }

        // Verify we return items from the correct collections given the overall index
        tc.areEqual(tc.target._conversationCollection.item(startIndex), tc.target.item(startIndex));
        if (childrenCount > 1) {
            // When we have a multiple item conversation, we should return items from both collections
            tc.areEqual(tc.target.activeConversation.item(0), tc.target.item(startIndex + 1));
            tc.areEqual(tc.target._conversationCollection.item(startIndex + 1), tc.target.item(startIndex + childrenCount + 1));
            tc.areEqual(tc.target.activeConversation.item(childrenCount - 1), tc.target.item(startIndex + childrenCount));
        } else {
            // When we have a single-item conversation, we should return only items from the conversation
            tc.areEqual(tc.target._conversationCollection.item(startIndex + 1), tc.target.item(startIndex + 1));
        }
    };

    var verifyBatchOperation = function (tc, expected, verifyFn) {
        /// <summary>Verifies the given verifyFn happens between begin/endChanges</summary>
        /// <param name="expected" type="Object">expectedCount,expectedExpandedConversationIndex</param>
        tc.isTrue(Jx.isObject(expected), "expected is not an object");
        tc.isTrue(Jx.isNumber(expected.expectedCount), "expected.expectedCount is not a number");
        tc.isTrue(Jx.isNumber(expected.expectedExpandedConversationIndex), "expected.expectedExpandedConversationIndex is not a number");

        // Verify operations occurred in order
        var inOrder = Jm.inOrder(),
            evComparer = Jm.Verifiers.deepCompare({ target: tc.target });
        inOrder.verify(tc.target.raiseEvent)("beginChanges", evComparer);
        inOrder.verifyNot(tc.target.raiseEvent)("beginChanges", evComparer); // Verify there were no nested beginChanges calls
        verifyFn(inOrder);
        inOrder.verify(tc.target.raiseEvent)("endChanges", evComparer);
        inOrder.verifyNot(tc.target.raiseEvent)("endChanges", evComparer);

        // Verify end state
        tc.areEqual(expected.expectedCount, tc.target.count, "Unexpected count");
        tc.areEqual(expected.expectedExpandedConversationIndex, tc.target.activeConversationIndex, "Unexpected activeConversationIndex");
    };
})();
