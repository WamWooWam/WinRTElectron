
(function () {
    /*global Mail,Microsoft,Tx,Mocks,Jx,Debug,Jm,JmDefs,WinJS*/
    /*jshint browser: true */

    var Plat = Microsoft.WindowsLive.Platform,
        M = Mocks.Microsoft.WindowsLive.Platform,
        U = Mail.UnitTest,
        ScrollOptions = Mail.SelectionModel.ScrollOptions;

    function setup(tc, options) {
        tc.preserve = Jm.preserve(Jx, "isRtl");
        tc.preserve.preserve(Jx, "isInstanceOf");
        tc.preserve.preserve(Jx, "isHTMLElement");

        Jx.isInstanceOf = function () { return true; };
        Jx.isHTMLElement = function () { return true; };
        Jx.isRtl = function () { return false; };

        tc.preserve.preserve(Mail, "guiState");
        Mail.guiState = {
            isOnePane: true
        };
        tc.preserve.preserve(Mail.Globals, "animator");
        tc.animator = Mail.Globals.animator = {
            animateNavigateForward: Jm.mockFn()
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

        tc.provider = createProvider(tc, options);
        tc.selection = {
            clearMessageSelection: function () {
                this.updateMessages(null, -1, [], false);
            },
            updateMessages: function (displayed, index, messages, keyboard) {
                this.displayed = displayed;
                this.index = index;
                this.messages = messages;
                this.keyboard = keyboard;
            },
            messages: [],
            view: {
                mockedType: Mail.UIDataModel.MailView,
                type: Plat.MailViewType.inbox
            }
        };
        tc.collection = createCollection(tc, tc.provider, options);
        tc.model = createModel(tc, options.selection);
        tc.target = new Mail.SelectionController(tc.collection, tc.selection, tc.model, tc.handler);

        // clean up
        tc.addCleanup(function () {
            JmDefs.unbindUtVerify();
            tc.preserve.restore();
        });
    }

    var createProvider = function (tc, options) {
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
                    parentConversationId: conversationId,
                    displayViewIds: ["inboxView"]
                });
            }
        }
        return new M.Data.JsonProvider(dataset, M.Data.MethodHandlers);
    };

    var createModel = function (tc, initialSelection) {
        var model = Jm.mock(Mail.SelectionModel.prototype);

        initialSelection = Jx.isArray(initialSelection) ? initialSelection : [];
        Jm.when(model).listViewElement.thenReturn(Jm.mock(HTMLDivElement.prototype));
        Jm.when(model).selection(Jm.ANY).then(function () {
            return new Mail.FilteredSelection(initialSelection, tc.collection);
        });

        Jm.when(model).isValidIndex(Jm.ANY).then(function (index) {
            return index >= 0 && index < tc.collection.count;
        });

        Jm.when(model).setSelection(Jm.ANY).then(function (selection) {
            selection = Jx.isArray(selection) ? selection : [selection];
            Jm.when(tc.model).selection().then(function () {
                return new Mail.FilteredSelection(selection, tc.collection);
            });
            tc.target._onSelectionChanged(selection);
            return WinJS.Promise.wrap();
        });
        return model;
    };

    var createCollection = function (tc, provider, options) {
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
            trailingItem = {
                addListener: Jx.fnEmpty,
                removeListener: Jx.fnEmpty,
                visible: false
            },
            threadedListCollection = new Mail.ThreadedListCollection(provider.getClient(), conversationCollection, view, locked, CtorOption),
            collection = new Mail.TrailingItemCollection(threadedListCollection, trailingItem);

        collection.mockedType = Mail.TrailingItemCollection;
        tc.treeView = collection.getTreeView();
        tc.conversationCollection = conversationCollection;
        Debug.ThreadedListCollection.verifyExpansionState = Jx.fnEmpty;

        tc.handler = {
            isSelectionMode: false,
            mockedType: Mail.SelectionHandler
        };
        return collection;
    };

    // Conditions:
    // Unexpanded thread
    // MessageId provided
    // IndexHint given
    // More than 1 message in expansion
    //
    // Expected: Expand, then select the message with messageId
    Tx.test("SelectionController.test_setInitialSelection1", {owner: "kepoon", priority: 0}, function (tc) {
        setup(tc, {
            collection: {
                c1: 1,
                c2: 3,
                c3: 1
            }
        });
        setInitialSelection(tc, "c2message3", 1);
        verifySetSelection(tc, 4, ScrollOptions.ensureVisible);
    });

    // Conditions:
    // Expanded thread
    // MessageId provided
    // IndexHint given
    // More than 1 message in expansion
    //
    // Expected: Immediately select the message with messageId
    Tx.test("SelectionController.test_setInitialSelection2", {owner: "kepoon", priority: 0}, function (tc) {
        setup(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 1
            },
            initialExpansion: 1,
            initialExpansionId: "c2message2"
        });
        setInitialSelection(tc, "c2message2", 1);
        verifySetSelection(tc, 3, ScrollOptions.ensureVisible);
    });

    // Conditions:
    // Expanded thread
    // MessageId provided
    // IndexHint given
    // Just 1 message in expansion
    //
    // Expected: Select the message header
    Tx.test("SelectionController.test_setInitialSelection3", {owner: "kepoon", priority: 0}, function (tc) {
        setup(tc, {
            collection: {
                c1: 1,
                c2: 1,
                c3: 1
            },
            initialExpansion: 1,
            initialExpansionId: "c2message1"
        });
        setInitialSelection(tc, "c2message1", 1);
        verifySetSelection(tc, 1, ScrollOptions.ensureVisible);
    });

    // Conditions:
    // Expanded thread
    // MessageId provided but is invalid
    // IndexHint given
    // More than 1 message in conversation
    //
    // Expected: Select the first unsent item in the first header (index: 1)
    Tx.test("SelectionController.test_setInitialSelection4", {owner: "kepoon", priority: 0}, function (tc) {
        setup(tc, {
            collection: {
                c1: 2,
                c2: 1,
                c3: 1
            },
            initialExpansion: 0,
            initialExpansionId: "c1message2"
        });

        setInitialSelection(tc, "somebogusmessageid", 1);
        verifySetSelection(tc, 1, ScrollOptions.ensureVisible);
    });

    // Conditions:
    // Unexpanded thread
    // MessageId provided
    // IndexHint given
    // 1 message in conversation
    //
    // Expected:
    // Select the header
    Tx.test("SelectionController.test_setInitialSelection5", {owner: "kepoon", priority: 0}, function (tc) {
        setup(tc, {
            collection: {
                c1: 2,
                c2: 1,
                c3: 1
            },
        });

        setInitialSelection(tc, "c2message1", 2);
        verifySetSelection(tc, 1, ScrollOptions.ensureVisible);
    });

    Tx.test("SelectionController.test_setInitialSelection_clearAsyncOperations", {owner: "kepoon", priority: 0}, function (tc) {
        setup(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 1
            },
            initialExpansion: 1,
            initialExpansionId: "c2message2"
        });

        tc.treeView.clearPendingExpandCollapse = Jm.mockFn();
        setInitialSelection(tc, "c2message2", 3);

        // Verify that we canceled any async operations as a result of programatically setting the selection
        Jm.verify(tc.treeView.clearPendingExpandCollapse)();
    });

    Tx.test("SelectionController.test_clearDisplayedItem", {owner: "kepoon", priority: 0}, function (tc) {
        setup(tc);
        tc.target.clearDisplayedItem();
        verifyEmptyReadingPane(tc);
    });

    // Conditions:
    // One-pane mode
    // Collapsed thread is selected
    // 1 item in thread
    //
    // Expected:
    // No selection is programmatically set (listview selects item on its own)
    // Animate to reading pane
    Tx.test("SelectionController.test_itemInvoked1", {owner: "kepoon", priority: 0}, function (tc) {
        setup(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 1
            },
            initialExpansion: 0,
            initialExpansionId: "c1message1"
        });

        var c1 = tc.collection.item(0);
        runItemInvoked(tc, 0, c1);
        verifyItemInvoked(tc, { animateSameMessage: true, expandIndex: 0});
    });

    // Conditions:
    // One-pane mode
    // Expanded thread is selected
    // 1 item in thread
    //
    // Expected:
    // No selection is programmatically set (listview selects item on its own)
    // Animate to reading pane
    Tx.test("SelectionController.test_itemInvoked2", {owner: "kepoon", priority: 0}, function (tc) {
        setup(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 1
            },
            initialExpansion: 0,
            initialExpansionId: "c1message1"
        });

        var c3 = tc.collection.item(2);
        runItemInvoked(tc, 2, c3);
        verifyItemInvoked(tc, { animateSameMessage: true, expandIndex: 2 });
    });

    // Conditions:
    // One-pane mode
    // Collapsed thread is selected
    // More than 1 item in thread
    //
    // Expected:
    // Thread expands and first message is selected
    // Do not animate
    Tx.test("SelectionController.test_itemInvoked3", {owner: "kepoon", priority: 0}, function (tc) {
        setup(tc, {
            collection: {
                c1: 2,
                c2: 1,
                c3: 1
            }
        });

        var c1 = tc.collection.item(0);
        runItemInvoked(tc, 0, c1);
        verifyItemInvoked(tc, { setSelectionIndex: 1, expandIndex: 0 });
    });

    // Conditions:
    // One-pane mode
    // Expanded thread is selected
    // More than 1 item in thread
    //
    // Expected:
    // Thread is collapsed
    // Do not animate
    Tx.test("SelectionController.test_itemInvoked4", {owner: "kepoon", priority: 0}, function (tc) {
        setup(tc, {
            collection: {
                c1: 2,
                c2: 2,
                c3: 1
            },
            initialExpansion: 0,
            initialExpansionId: "c1message1"
        });

        var c1 = tc.collection.item(0);
        runItemInvoked(tc, 0, c1);
        verifyItemInvoked(tc, { collapse: true });
    });

    // Conditions:
    // One-pane mode
    // Message is selected
    //
    // Expected: animate to reading pane
    Tx.test("SelectionController.test_itemInvoked5", {owner: "kepoon", priority: 0}, function (tc) {
        setup(tc, {
            collection: {
                c1: 2,
                c2: 2,
                c3: 1
            },
            initialExpansion: 0,
            initialExpansionId: "c1message1"
        });

        var c1 = tc.collection.item(0);
        runItemInvoked(tc, 1, c1);
        verifyItemInvoked(tc, { animateSameMessage: true });
    });

    // Conditions:
    // One-pane mode
    // Message is selected, selectionMode is active
    //
    // Expected: no navigation to reading pane
    Tx.test("SelectionController.test_itemInvoked_selectionMode", { owner: "kepoon", priority: 0 }, function (tc) {
        setup(tc, {
            collection: {
                c1: 2,
                c2: 2,
                c3: 1
            },
            initialExpansion: 0,
            initialExpansionId: "c1message1"
        });

        tc.handler.isSelectionMode = true;
        var c1 = tc.collection.item(0);
        runItemInvoked(tc, 1, c1);
        verifyItemInvoked(tc /* verify no invoke actions */);
    });

    Tx.test("SelectionController.test_selectionChanging_collapsed_multiItem_header", {owner: "kepoon", priority: 0}, function (tc) {
        setup(tc, {
            collection: {
                c1: 2
            }
        });
        // clicking on a collapsed thread should prevent tap selection
        verifySelectionChanging(tc, 0, { preventTapBehavior: true });
    });

    Tx.test("SelectionController.test_selectionChanging_expanded_multiItem_header", { owner: "kepoon", priority: 0 }, function (tc) {
        setup(tc, {
            collection: {
                c1: 2
            },
            initialExpansion: 0,
            initialExpansionId: "c1message1"
        });

        // clicking on an expanded thread should allow tap selection
        verifySelectionChanging(tc, 0, { preventTapBehavior: false });
    });

    Tx.test("SelectionController.test_selectionChanging_collapsed_singleItem_header", { owner: "kepoon", priority: 0 }, function (tc) {
        setup(tc, {
            collection: {
                c1: 1
            }
        });
        // clicking on a collapsed single item  thread should allow tap selection
        verifySelectionChanging(tc, 0, { preventTapBehavior: false });
    });

    Tx.test("SelectionController.test_selectionChanging_expanded_singleItem_header", { owner: "kepoon", priority: 0 }, function (tc) {
        setup(tc, {
            collection: {
                c1: 1
            },
            initialExpansion: 0,
            initialExpansionId: "c1message1"
        });
        // clicking on a expanded single item  thread should allow tap selection
        verifySelectionChanging(tc, 0, { preventTapBehavior: false });
    });

    Tx.test("SelectionController.test_selectionChanging_childMessage", { owner: "kepoon", priority: 0 }, function (tc) {
        setup(tc, {
            collection: {
                c1: 2
            },
            initialExpansion: 0,
            initialExpansionId: "c1message1"
        });
        // clicking on a child message should allow tap selection
        verifySelectionChanging(tc, 1, { preventTapBehavior: false });
    });

    // Conditions:
    // Thread header 0 is selected
    // Thread has 1 item
    //
    // Expected:
    // Reading pane set to first message of first conversation
    Tx.test("SelectionController.test_selectionChanged3", {owner: "kepoon", priority: 0}, function (tc) {
        setup(tc, {
            collection: {
                c1: 1
            }
        });
        verifySelectionChanged(tc, { selection: [0] }, { threadIndex: 0, displayIndex: 0, displayMessageIndex: 0, selectedIndices: [0]});
    });

    // Conditions:
    // Thread 0 is selected
    // Then thread 1 is added to the selection
    //
    // Expected:
    // Keep 0 in the reading pane
    Tx.test("SelectionController.test_selectionChanged_keepSelection", {owner: "kepoon", priority: 0}, function (tc) {
        setup(tc, {
            collection: {
                c1: 1,
                c2: 2
            }
        });

        // Set initial state
        verifySelectionChanged(tc, { selection: [0] }, { threadIndex: 0, displayIndex: 0, displayMessageIndex: 0, selectedIndices: [0] });
        verifySelectionChanged(tc, { selection: [0, 1] }, { threadIndex: 0, displayIndex: 0, displayMessageIndex: 0, selectedIndices: [0, 1] });
    });

    // Conditions:
    // Thread header 0 is selected via keyboard
    // Thread has 1 item
    //
    // Expected:
    // Reading pane set to first message of first conversation
    Tx.test("SelectionController.test_selectionChanged_keyboardExpand", {owner: "kepoon", priority: 0}, function (tc) {
        setup(tc, {
            collection: {
                c1: 2
            }
        });

        verifySelectionChanged(tc, { selection: [0], keyboard: true },
            { threadIndex: 0, displayIndex: 1, displayMessageIndex: 0, selectedIndices: [1], setSelection: 1});
    });

    // Conditions: changes from non empty to non empty
    // Expected: nothing
    Tx.test("SelectionController.test_onEndChanges1", {owner: "kepoon", priority: 0}, function (tc) {
        setup(tc, {
            collection: {
                c1: 1
            }
        });

        U.ensureSynchronous(function () {
            var newThread = tc.provider.loadObject("MailConversation", { objectId: "c2", totalCount: 1 });
            tc.conversationCollection.mock$addItem(newThread, 1);
        });
        verifyItemInvoked(tc /* verify no invoke actions */);
    });

    // Conditions:
    // changes from empty to non-empty
    // new thread has 1 message
    //
    // Expected:
    // header is selected
    // thread is expanded (but not visually)
    Tx.test("SelectionController.test_onEndChanges2", {owner: "kepoon", priority: 0}, function (tc) {
        setup(tc, {
            collection: {}
        });

        U.ensureSynchronous(function () {
            var newThread = tc.provider.loadObject("MailConversation", { objectId: "c1", totalCount: 1 });
            tc.conversationCollection.mock$addItem(newThread, 0);
        });

        verifySetSelection(tc, 0, ScrollOptions.none);
        verifyItemInvoked(tc, { expandIndex: 0 });
    });

    // Conditions:
    // changes from empty to non-empty
    // new thread has 2 messages
    //
    // Expected: new thread is expanded with 1st message selected
    Tx.test("SelectionController.test_onEndChanges3", {owner: "kepoon", priority: 0}, function (tc) {
        setup(tc, {
            collection: {}
        });

        U.ensureSynchronous(function () {
            var newThread = createConversation(tc, "c2", 2 /*totalCount*/);
            tc.conversationCollection.mock$addItem(newThread, 0);
        });
        verifyItemInvoked(tc, { expandIndex: 0, setSelectionIndex: 1 });
        tc.areEqual(tc.treeView.activeConversationIndex, 0);
    });

    // Conditions: expanded conversation header with more than 1 item is selected
    // Expected: do nothing
    Tx.test("SelectionController.test_rightArrowKeyOnNonExpandableHeader", {owner: "kepoon", priority: 0}, function (tc) {
        setup(tc, {
            collection: {
                c1: 1
            },
            initialExpansion: 0,
            selection: [0]
        });

        tc.isFalse(tc.treeView.expanded);
        tc.treeView.expand = Jm.mockFn();
        var keyEvent = {
            key: "Right",
            stopImmediatePropagation: Jm.mockFn()
        };

        U.ensureSynchronous(function () {
            tc.target._onKeyDown(keyEvent);
        });

        tc.isFalse(tc.treeView.expanded);
        Jm.verifyNot(tc.treeView.expand)();
        Jm.verifyNot(keyEvent.stopImmediatePropagation)();
    });

    // Conditions: expanded conversation header with 1 item is selected
    // Expected: do nothing
    Tx.test("SelectionController.test_leftArrowKey_collapsedHeader", { owner: "kepoon", priority: 0 }, function (tc) {
        setup(tc, {
            collection: {
                c1: 3
            },
            selection: [0]
        });

        tc.isFalse(tc.treeView.expanded);
        tc.treeView.collapse = Jm.mockFn();

        U.ensureSynchronous(function () {
            tc.target._onKeyDown({ key: "Left" });
        });

        tc.isFalse(tc.treeView.expanded);
        Jm.verifyNot(tc.treeView.collapse)();
    });

    // Conditions: message is selected
    // Expected: collapse the thread
    Tx.test("SelectionController.test_leftArrowKey_expandedMessage", {owner: "kepoon", priority: 0}, function (tc) {
        setup(tc, {
            collection: {
                c1: 3
            },
            initialExpansion: 0,
            selection: [1]
        });

        tc.isTrue(tc.treeView.expanded);
        U.ensureSynchronous(function () {
            tc.target._onKeyDown({
                key: "Left",
                stopImmediatePropagation: Jx.fnEmpty
            });
        });
        tc.isFalse(tc.treeView.expanded);
    });

    // Ensure left arrow behaves like right arrow in rtl
    Tx.test("SelectionController.test_leftArrow_rtl", {owner: "kepoon", priority: 0}, function (tc) {
        setup(tc, {
            collection: {
                c1: 3,
                c2: 2
            },
            selection: [0]
        });

        tc.isFalse(tc.treeView.expanded);
        Jx.isRtl = function () { return true; };
        U.ensureSynchronous(function () {
            tc.target._onKeyDown({
                key: "Left",
                stopImmediatePropagation: Jx.fnEmpty
            });
        });
        tc.isTrue(tc.treeView.expanded);
        tc.areEqual(tc.treeView.activeConversationIndex, 0);
    });

    // Conditions: expanded conversation header with more than 1 item is selected
    // Expected: do nothing
    Tx.test("SelectionController.test_rightArrow_expandedHeader", {owner: "kepoon", priority: 0}, function (tc) {
        setup(tc, {
            collection: {
                c1: 3,
                c2: 2
            },
            selection: [0],
            initialExpansion: 0,
        });

        tc.isTrue(tc.treeView.expanded);

        tc.treeView.expand = Jm.mockFn();
        U.ensureSynchronous(function () {
            tc.target._onKeyDown({
                key: "Right",
                stopImmediatePropagation: Jx.fnEmpty
            });
        });

        tc.isTrue(tc.treeView.expanded);
        Jm.verifyNot(tc.treeView.expand)();
    });

    // Conditions: collapsed conversation header with more than 1 item is selected
    // Expected: expand the conversation
    Tx.test("SelectionController.test_rightArrowKey_collapsedheader", {owner: "kepoon", priority: 0}, function (tc) {
        setup(tc, {
            collection: {
                c1: 3,
                c2: 2
            },
            selection: [1]
        });

        tc.isFalse(tc.treeView.expanded);
        U.ensureSynchronous(function () {
            tc.target._onKeyDown({
                key: "Right",
                stopImmediatePropagation: Jx.fnEmpty
            });
        });
        tc.isTrue(tc.treeView.expanded);
        tc.areEqual(tc.treeView.activeConversationIndex, 1);
    });

    // Ensure rght arrow behaves likes left arrow in rtl
    Tx.test("SelectionController.test_rightArrow_rtl", {owner: "kepoon", priority: 0}, function (tc) {
        setup(tc, {
            collection: {
                c1: 3,
                c2: 2
            },
            selection: [1],
            initialExpansion: 0,
        });

        tc.isTrue(tc.treeView.expanded);
        Jx.isRtl = function () { return true; };
        U.ensureSynchronous(function () {
            tc.target._onKeyDown({
                key: "Right",
                stopImmediatePropagation: Jx.fnEmpty
            });
        });
        tc.isFalse(tc.treeView.expanded);
    });

    Tx.test("SelectionController.test_getSelectionRange_noShiftKey", { owner: "kepoon", priority: 0 }, function (tc) {
        var selectionProxy = new MockSelectionModel(-1, [0]),
            expected = 5,
            actual = Mail.SelectionController.getSelectionRange(expected, false, selectionProxy);
        tc.areEqual(actual.firstIndex, 5);
        tc.areEqual(actual.lastIndex, 5);
    });

    Tx.test("SelectionController.test_getSelectionRange_shiftKey", { owner: "kepoon", priority: 0 }, function (tc) {
        // no pivot, no selection
        var selectionProxy = new MockSelectionModel(-1, []),
            expected = 5,
            actual = Mail.SelectionController.getSelectionRange(expected, true, selectionProxy);
        tc.areEqual(actual.firstIndex, expected);
        tc.areEqual(actual.lastIndex, expected);
        // no pivot, has selection
        selectionProxy = new MockSelectionModel(-1, [2]),
        expected = 5,
        actual = Mail.SelectionController.getSelectionRange(expected, true, selectionProxy);
        tc.areEqual(actual.firstIndex, 2);
        tc.areEqual(actual.lastIndex, expected);

        // pivot, lower range
        selectionProxy = new MockSelectionModel(-1, [2]),
        expected = 5,
        actual = Mail.SelectionController.getSelectionRange(expected, true, selectionProxy);
        tc.areEqual(actual.firstIndex, 2);
        tc.areEqual(actual.lastIndex, 5);

        // pivot, upper range
        selectionProxy = new MockSelectionModel(-1, [9]),
        expected = 5,
        actual = Mail.SelectionController.getSelectionRange(expected, true, selectionProxy);
        tc.areEqual(actual.firstIndex, 5);
        tc.areEqual(actual.lastIndex, 9);
    });

    // Helpers
    var MockSelectionModel = function (pivot, indices) {
        this._indices = indices;
        this.selectionPivot = pivot;
    };

    MockSelectionModel.prototype.selection = function () {
        return {
            indices : this._indices
        };
    };

    var setInitialSelection = function (tc, messageId, indexHint) {
        U.ensureSynchronous(function () {
            tc.target.setInitialSelection(messageId, indexHint);
        });
    };

    var verifyItemInvoked = function (tc, expected) {
        /// <param name="expected" type="Object">animateSameMessage,setSelectionIndex,collapse,expandIndex</param>
        expected = expected || {};

        if (Jx.isBoolean(expected.animateSameMessage)) {
            Jm.verify(tc.animator.animateNavigateForward)(Jx.fnEmpty, expected.animateSameMessage);
        } else {
            Jm.verifyNot(tc.animator.animateNavigateForward)(Jm.ANY);
        }

        if (Jx.isNumber(expected.setSelectionIndex)) {
            verifySetSelection(tc,   expected.setSelectionIndex, ScrollOptions.ensureVisible);
        } else {
            Jm.verifyNot(tc.model).setSelection(Jm.ANY);
        }

        if (expected.collapse) {
            tc.isFalse(tc.treeView.expanded);
        }

        if (Jx.isNumber(expected.expandIndex)) {
            tc.areEqual(tc.treeView.activeConversationIndex, expected.expandIndex);
        }
    };

    var verifySelectionChanged = function (tc, options, expected) {
        /// <param name="options" type="Object">threadIndex,nMessages,selection,isExpanded,keyboard,customSetupFn</param>
        /// <param name="expected" type="Object">displayIndex,displayMessageIndex,selectedIndices,setSelection</param>
        tc.isTrue(Jx.isNumber(expected.displayIndex));
        tc.isTrue(Jx.isArray(expected.selectedIndices));

        // Prepare for a selection
        Jm.when(tc.model).selection().then(function () {
            return new Mail.FilteredSelection(options.selection, tc.collection);
        });

        runSelectionChanged(tc, options.keyboard);

        if (expected.displayIndex >= 0) {
            tc.isTrue(Jx.isNumber(expected.displayMessageIndex));
            var thread = tc.collection.item(expected.threadIndex),
                selectedItems = expected.selectedIndices.map(function (index) {
                    return tc.collection.item(index);
                }),
                expectedItems = selectedItems.map(function (item) {
                    return item.data;
                });

            verifyReadingPane(tc,
                thread.item(expected.displayMessageIndex).data,
                expected.displayIndex,
                expectedItems);
        } else {
            verifyEmptyReadingPane(tc);
        }

        if (Jx.isNumber(expected.setSelection)) {
            verifySetSelection(tc,   expected.setSelection, ScrollOptions.ensureVisible);
        } else {
            Jm.verifyNot(tc.model).setSelection(Jm.ANY);
        }
        // Selection change should never trigger a reading pane animation. That should only happen from a direct invoke action.
        Jm.verifyNot(tc.animator.animateNavigateForward)(Jm.ANY);
    };

    var verifyReadingPane = function (tc, displayedItem, index, selectedMessages) {
        tc.isTrue(Mail.Validators.areEqual(tc.selection.displayed, displayedItem));
        tc.areEqual(tc.selection.index, index);
        tc.areEqual(tc.selection.messages.length, selectedMessages.length);
        tc.selection.messages.forEach(function (msg, i) { tc.areEqual(msg, selectedMessages[i]); });
    };

    var runSelectionChanged = function (tc, keyboard) {
        var invokeTypes = Mail.SelectionModel.InvokeTypes;
        U.ensureSynchronous(function () {
            tc.target._onSelectionChanged({ invokeType: keyboard ? invokeTypes.keyboard : invokeTypes.tap });
        });
    };

    var verifySelectionChanging = function (tc, index, expected) {
        /// <param name="options" type="Object">isThread,nMessages,expanded</param>
        /// <param name="expected" type="Object">preventTapBehavior</param>
        var ev = runSelectionChanging(tc, [index]);
        if (expected.preventTapBehavior) {
            Jm.verify(ev.detail.preventTapBehavior)();
        } else {
            Jm.verifyNot(ev.detail.preventTapBehavior)();
        }
    };

    var runSelectionChanging = function (tc, selection) {
        var ev = createSelectionChangingEvent(selection);
        tc.target._onSelectionChanging(ev);
        return ev;
    };

    function createSelectionChangingEvent(selection) {
        return {
            preventDefault: Jm.mockFn(),
            detail: {
                preventTapBehavior: Jm.mockFn(),
                newSelection: {
                    getIndices: function () { return selection; },
                    count: function () { return selection.length; },
                    remove : function (i) {
                        selection.splice(i, 1);
                    }
                }
            }
        };
    }

    var verifyEmptyReadingPane = function (tc) {
        tc.areEqual(tc.selection.displayed, null);
        tc.areEqual(tc.selection.index, -1);
        tc.areEqual(tc.selection.messages.length, 0);
    };

    var runItemInvoked = function (tc, index) {
        // Set lastSelectedMessage so we can expect the animation "sameMessage" parameter to be true
        tc.target._displayedItemManager.setDisplayItem(index);

        U.ensureSynchronous(function () {
            tc.target._onItemInvoked({ detail: { itemIndex: index } });
        });
    };

    var verifySetSelection = function (tc, index, scrollOption, options) {
        /// <param name="index" type="Number"/>
        /// <param name="scrollOption" type="Number"/>
        /// <param name="options" type="Object" optional="true">viaKeyboard</param>
        options = options || {};
        options.viaKeyboard = Jx.isBoolean(options.viaKeyboard) ? options.viaKeyboard : false;
        Jm.verify(tc.model).setSelection(index, scrollOption, options.viaKeyboard);
    };

    var createConversation = function (tc, id, count) {
        // create the child messages
        for (var i = 1; i <= count; i++) {
            var allMessageQuery = tc.provider._queries.MailMessage.all,
                newMessage = tc.provider.loadObject("MailMessage", {
                    objectId: id + "message" + i,
                    parentConversationId: id,
                    displayViewIds: ["inboxView"]
                });

            // insert them to the query
            allMessageQuery.mock$addItem(newMessage, allMessageQuery.count);
        }
        return tc.provider.loadObject("MailConversation", {
            objectId: id,
            totalCount: count
        });
    };
})();
