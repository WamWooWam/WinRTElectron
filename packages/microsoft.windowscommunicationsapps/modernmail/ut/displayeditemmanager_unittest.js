
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Mail,Microsoft,Mocks,Jx,Tx,Debug*/

(function () {
    var Plat = Microsoft.WindowsLive.Platform,
        M = Mocks.Microsoft.WindowsLive.Platform,
        U = Mail.UnitTest;

    function createCollection(tc, provider, options) {
        var conversationCollection = provider.query("MailConversation", "all"),
            account = new Mail.Account(provider.getObjectById("account"), provider.getClient()),
            view = new Mail.UIDataModel.MailView(provider.getObjectById("inboxView"), account),
            CtorOption = {
                initialExpansion: options.expandedIndex
            },
            locked = Jx.isBoolean(options.locked) ? options.locked : false,
            treeView = new Mail.ThreadedListCollection(provider.getClient(), conversationCollection, view, locked, CtorOption);

        // Disable debug hooks
        Debug.ThreadedListCollection.verifyExpansionState = Jx.fnEmpty;
        tc.conversationCollection = conversationCollection;
        tc.treeView = treeView;
        tc.collection = new Mail.TrailingItemCollection(treeView, {
            objectId: "endOfList",
            selectable: false,
            isDescendant: Jx.fnEmpty,
            addListener: Jx.fnEmpty,
            removeListener: Jx.fnEmpty,
            visible: options.showEndOfList
        });
    }

    function setupTestCase(tc, options) {
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
                    objectId: conversationId + ":message" + String(i + 1),
                    parentConversationId: conversationId,
                    displayViewIds: ["inboxView"],
                });
            }
        }
        tc.provider = new M.Data.JsonProvider(dataset, M.Data.MethodHandlers);
        createCollection(tc, tc.provider, options);
        tc.model = new MockSelectionModel(tc, options.selection, tc.collection);
        tc.selection = new MockSelection(tc.provider);
        tc.target = new Mail.DisplayedItemManager(tc.collection, tc.model, tc.selection);

        tc.tearDown = function () {
            tc.target.dispose();
            tc.target = null;
            tc.collection = null;
            tc.model = null;
            tc.selection = null;
        };
    }

    function verifyNewSelection(tc, newIndex, expected, id) {
        /// verify both the index and the id of the expected selection is correct
        tc.areEqual(newIndex, expected, "the new index doesn't match");
        tc.areEqual(tc.collection.item(newIndex).objectId, id, "the id of the new index doesn't match");
    }

    function verifyDisplayItem(tc, expectedIndex, expectedId) {
        tc.areEqual(tc.selection.message.objectId, expectedId);
        tc.areEqual(tc.selection.index, expectedIndex);
    }

    function setSingleDisplayMessage(tc, index) {
        tc.target.setDisplayItem(index);
    }

    function getChildCollectionByIndex(tc, convIndex) {
        var conversation = tc.treeView.item(convIndex);
        return getChildCollection(conversation);
    }

    function getChildCollection(node) {
        return node._children._deferredCollection._collection._realCollection._collection._collection;
    }

    Tx.test("DisplayedItemManager_Unittest.deleteLastItem_fallbackToParent", { owner: "kepoon", priority: 0 }, function (tc) {
        // This is a regression test for WindowsBlue:278992
        // Deleting the last item in the thread before the end of list item should select the thread header
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 2 // <= expanded
                // c2:message1 <= selected
                // c2:message2
            },
            
            expandedIndex: 1,
            selection: [2] //c2
        });
        // set the displayedItem to c2
        setSingleDisplayMessage(tc, 2);

        // delete c2:message1 and c2:message2 to simulate a cascaded collapse after a delete
        U.ensureSynchronous(function () {
            var childCollection = getChildCollectionByIndex(tc, 1);
            childCollection.mock$removeItem(0);
            childCollection.mock$removeItem(0);
        });
        tc.model._selection = [];

        // Expected
        // c1
        // c2 <= selected
        // c3
        var newIndex = tc.target.handleSelectionChange(tc.model.selection() /*newSelection*/, false);
        verifyNewSelection(tc, newIndex, 1, "c2");
    });

    Tx.test("DisplayedItemManager_Unittest.delete_fallbackToNextSibling", { owner: "kepoon", priority: 0 }, function (tc) {
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 3, // <= expanded
                // c2:message1 <= selected
                // c2:message2
                // c2:message3
                c3: 3
            },
            
            expandedIndex: 1,
            selection: [2] //c2:message1
        });
        // set the displayedItem to c2
        setSingleDisplayMessage(tc, 2);

        // delete c2:message1
        U.ensureSynchronous(function () {
            var childCollection = getChildCollectionByIndex(tc, 1);
            childCollection.mock$removeItem(0);
        });

        tc.model._selection = [];

        // Expected
        // c1
        // c2
        // c2:message2 <= selected
        // c2:message3
        // c3
        var newIndex = tc.target.handleSelectionChange(tc.model.selection() /*newSelection*/, false);
        verifyNewSelection(tc, newIndex, 2, "c2:message2");
    });

    Tx.test("DisplayedItemManager_Unittest.delete_fallbackToPrevSibling", { owner: "kepoon", priority: 0 }, function (tc) {
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 3, // <= expanded
                // c2:message1
                // c2:message2
                // c2:message3 <= selected
                c3: 3
            },
            
            expandedIndex: 1,
            selection: [4] //c2:message3
        });
        // set the displayedItem to c2
        setSingleDisplayMessage(tc, 4);

        // delete c2:message3
        U.ensureSynchronous(function () {
            var childCollection = getChildCollectionByIndex(tc, 1);
            childCollection.mock$removeItem(2);
        });
        tc.model._selection = [];

        // Expected
        // c1
        // c2
        // c2:message1
        // c2:message2 <= selected
        // c3
        var newIndex = tc.target.handleSelectionChange(tc.model.selection() /*newSelection*/, false);
        verifyNewSelection(tc, newIndex, 3, "c2:message2");
    });

    Tx.test("DisplayedItemManager_Unittest.delete_fallbackToNextConveration", { owner: "kepoon", priority: 0 }, function (tc) {
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 2, // <= expanded
                // c2:message1
                // c2:message2 <= selected
                c3: 3
            },
            
            expandedIndex: 1,
            selection: [3] //c2:message2
        });

        // set the displayedItem to c2
        setSingleDisplayMessage(tc, 3);

        // delete c2 altogether
        // delete c2:message3
        U.ensureSynchronous(function () {
            tc.conversationCollection.mock$removeItem(1);
        });

        tc.model._selection = [];

        // Expected
        // c1
        // c3 <= selected
        var newIndex = tc.target.handleSelectionChange(tc.model.selection() /*newSelection*/, false);
        verifyNewSelection(tc, newIndex, 1, "c3");
    });

    Tx.test("DisplayedItemManager_Unittest.delete_fallbackToPrevConveration", { owner: "kepoon", priority: 0 }, function (tc) {
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 2 // <= expanded
                // c2:message1
                // c2:message2 <= selected
            },
            
            expandedIndex: 1,
            selection: [3] //c2:message2
        });

        // set the displayedItem to c2
        setSingleDisplayMessage(tc, 3);

        // delete c2 altogether
        U.ensureSynchronous(function () {
            tc.conversationCollection.mock$removeItem(1);
        });
        tc.model._selection = [];

        // Expected
        // c1 <= selected
        var newIndex = tc.target.handleSelectionChange(tc.model.selection() /*newSelection*/, false);
        verifyNewSelection(tc, newIndex, 0, "c1");
    });

    Tx.test("DisplayedItemManager_Unittest.delete_lastConversation", { owner: "kepoon", priority: 0 }, function (tc) {
        // Regression test for WindowsBlueBug 311838
        // Assert when deleting the last conversation before the end of list item
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 1,
                c3: 1 // <= expanded
            },
            threaded: false,
            showEndOfList: true,
            selection: [2] //c3
        });

        // set the displayedItem to c3
        setSingleDisplayMessage(tc, 2);

        // delete c3 altogether
        U.ensureSynchronous(function () {
            tc.conversationCollection.mock$removeItem(2);
        });
        tc.model._selection = [];

        // Expected
        // c1 <= selected
        var newIndex = tc.target.handleSelectionChange(tc.model.selection() /*newSelection*/, false);
        verifyNewSelection(tc, newIndex, 1, "c2");
    });

    Tx.test("DisplayedItemManager_Unittest.delete_LastChildItem", { owner: "kepoon", priority: 0 }, function (tc) {
        // Regression test for Windows Blue Bug:293098
        setupTestCase(tc, {
            collection: {
                c1: 3 // <= expanded
                // c1:message1
                // c1:message2
                // c1:message3 <= selected
            },
            
            expandedIndex: 0,
            selection: [3] //c1:message3
        });

        // set the displayedItem to c1:message3
        setSingleDisplayMessage(tc, 3);

        // delete that message altogether
        U.ensureSynchronous(function () {
            var childCollection = getChildCollectionByIndex(tc, 0);
            childCollection.mock$removeItem(2);
        });

        // selection is changed to empty
        tc.model._selection = [];

        // Expected: c1:message2 is selected
        var newIndex = tc.target.handleSelectionChange(tc.model.selection() /*newSelection*/, false);
        verifyNewSelection(tc, newIndex, 2, "c1:message2");
    });

    Tx.test("DisplayedItemManager_Unittest.delete_pendingRemoval", { owner: "kepoon", priority: 0 }, function (tc) {
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 2, // <= expanded
                // c2:message1 <= selected
                // c2:message2
                c3: 3,
                c4: 1
            },
            
            expandedIndex: 1,
            selection: [2] //c2:message1
        });
        // set the displayedItem to c2:message1
        setSingleDisplayMessage(tc, 2);
        verifyDisplayItem(tc, 2, "c2:message1");

        // delete c2 altogether
        U.ensureSynchronous(function () {
            tc.conversationCollection.mock$removeItem(1);
        });
        // c3 is pendingRemoval as well due to a fast delete
        var c3 = tc.collection.item(1);
        c3.data._platformObject._isObjectValid = false;

        tc.model._selection = [];
        // Expected: selection fallback to c4
        // c1
        // c3
        // c4 <= selected

        var newIndex = tc.target.handleSelectionChange(tc.model.selection() /*newSelection*/, false);
        verifyNewSelection(tc, newIndex, 2, "c4");
    });

    Tx.test("DisplayedItemManager_Unittest.setDisplayItem_pendingRemoval", { owner: "kepoon", priority: 0 }, function (tc) {
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 1,
                c3: 1
            },

            expandedIndex: 1,
            selection: [1] //c2:message1
        });


        var c2 = getChildCollectionByIndex(tc, 1),
            c2message1 = c2.item(0);
        c2message1._isObjectValid = false;

        // set the displayedItem to c2:message1
        setSingleDisplayMessage(tc, 1);
        tc.isNull(tc.selection.message);
        tc.isTrue(tc.selection.messages.length === 0);
        tc.areEqual(tc.selection.index, -1);
    });

    Tx.test("DisplayedItemManager_Unittest.deleteAll", { owner: "kepoon", priority: 0 }, function (tc) {
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 2 // <= expanded
                // c2:message1
                // c2:message2 <= selected
            },
            expandedIndex: 1,
            selection: [3] //c2:message2
        });

        // set the displayedItem to c2
        setSingleDisplayMessage(tc, 3);

        // delete c2 altogether
        U.ensureSynchronous(function () {
            tc.conversationCollection.mock$removeItem(0);
            tc.conversationCollection.mock$removeItem(0);
        });
        tc.model._selection = [];

        // Expected: nothing selected
        var newIndex = tc.target.handleSelectionChange(tc.model.selection() /*newSelection*/, false);
        tc.areEqual(newIndex, -1);
    });

    Tx.test("DisplayedItemManager_Unittest.selectionChanged_singleSelectMessage", { owner: "kepoon", priority: 0 }, function (tc) {
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 3, // <= expanded
                // c2:message1 <= selected
                // c2:message2
                // c2:message3
                c3: 3
            },
            
            expandedIndex: 1,
            selection: [2] //c2:message1
        });
        // set the displayedItem to c2:message1
        setSingleDisplayMessage(tc, 2);
        verifyDisplayItem(tc, 2, "c2:message1");

        // selection changed to c2:message3
        tc.model._selection = [4];

        // Expected
        // c1
        // c2
        // c2:message1
        // c2:message2
        // c2:message3 <= selected
        // c3
        tc.target.handleSelectionChange(tc.model.selection() /*newSelection*/, false);
        verifyDisplayItem(tc, 4, "c2:message3");
    });

    Tx.test("DisplayedItemManager_Unittest.selectionChanged_singleSelectConversation", { owner: "kepoon", priority: 0 }, function (tc) {
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 2, // <= expanded
                // c2:message1 <= selected
                // c2:message2
                c3: 3
            },
            
            expandedIndex: 1,
            selection: [2] //c2:message1
        });
        // set the displayedItem to c2:message1
        setSingleDisplayMessage(tc, 2);
        verifyDisplayItem(tc, 2, "c2:message1");

        // selection changed to c3
        tc.model._selection = [4];

        // Expected
        // c1
        // c2
        // c2:message1
        // c2:message2
        // c3  <= selected
        tc.target.handleSelectionChange(tc.model.selection() /*newSelection*/, false);
        verifyDisplayItem(tc, 4, "c3:message1");
    });

    Tx.test("DisplayedItemManager_Unittest.selectionChanged_multiSelect_fallbackToOriginal", { owner: "kepoon", priority: 0 }, function (tc) {
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 3, // <= expanded
                // c2:message1 <= selected
                // c2:message2
                // c2:message3
                c3: 3
            },
            
            expandedIndex: 1,
            selection: [2] //c2:message1
        });
        // set the displayedItem to c2:message1
        setSingleDisplayMessage(tc, 2);
        verifyDisplayItem(tc, 2, "c2:message1");

        // selection changed to c2:message1,c2:message2
        tc.model._selection = [2, 3];

        // Expected
        // c1
        // c2
        // c2:message1 <= selected
        // c2:message2 <= selected
        // c3
        tc.target.handleSelectionChange(tc.model.selection() /*newSelection*/, false);
        verifyDisplayItem(tc, 2, "c2:message1");
    });

    Tx.test("DisplayedItemManager_Unittest.selectionChanged_multiSelect_keepSelectionInView", { owner: "kepoon", priority: 0 }, function (tc) {
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 3,
                c3: 3
            },
            selection: [1] //c2:message1
        });

        // select c1, the displayedItem would be c2:message1
        var c2 = tc.collection.item(1),
            displayedItem = Mail.DisplayedItem.create(tc.selection.view, c2, "c2:message1", null);
        tc.target.setDisplayItems(1, displayedItem, [c2], false);

        verifyDisplayItem(tc, 1, "c2:message1");

        // selection changed to c1, c2
        tc.model._selection = [0, 1];

        tc.target.handleSelectionChange(tc.model.selection() /*newSelection*/, false);

        // The selected message should be kept in view
        verifyDisplayItem(tc, 1, "c2:message1");
    });

    Tx.test("DisplayedItemManager_Unittest.selectionChanged_enterSelectionMode", { owner: "kepoon", priority: 0 }, function (tc) {
        // regression test for WindowsBlueBug 276537
        setupTestCase(tc, {
            collection: {
                c1: 2, // <= expanded
                // c2:message1 <= selected
                // c2:message2
                c3: 3
            },
            expandedIndex: 0,
            selection: [1]
        });

        // select c1, the displayedItem would be c2:message1
        var c1 = tc.collection.item(0),
            c1message1 = c1.children.item(0),
            displayedItem = Mail.DisplayedItem.create(tc.selection.view, c1message1);
        tc.target.setDisplayItems(1, displayedItem, [c1message1], false);

        verifyDisplayItem(tc, 1, "c1:message1");

        // User enter selection mode by clicking on c1, selection changed to c1, c1message2
        tc.model._selection = [0, 2];
        tc.target.handleSelectionChange(tc.model.selection() /*newSelection*/, false);

        // The reading pane should update to c1:message2 as c1:message1 is no longer selected
        verifyDisplayItem(tc, 2, "c1:message2");
    });

    Tx.test("DisplayedItemManager_Unittest.selectNextMessage", { owner: "kepoon", priority: 0 }, function (tc) {
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 3, // <= expanded
                // c2:message1 <= selected
                // c2:message2
                // c2:message3
                c3: 3
            },
            expandedIndex: 1,
            selection: [2] //c2:message1
        });
        // set the displayedItem to c2:message1
        setSingleDisplayMessage(tc, 2);
        tc.target._selectNextMessage();
        tc.areEqual(tc.model.selectedIndex, 3);
    });

    Tx.test("DisplayedItemManager_Unittest.selectPrevMessage", { owner: "kepoon", priority: 0 }, function (tc) {
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 3, // <= expanded
                // c2:message1 <= selected
                // c2:message2
                // c2:message3
                c3: 3
            },
            expandedIndex: 1,
            selection: [2] //c2:message1
        });
        // set the displayedItem to c2:message1
        setSingleDisplayMessage(tc, 2);
        tc.target._selectPreviousMessage();
        tc.areEqual(tc.model.selectedIndex, 1);
    });

    Tx.test("DisplayedItemManager_Unittest.autoExpand_singleItemConversation", { owner: "kepoon", priority: 0 }, function (tc) {
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 1,
                c3: 3
            },
            expandedIndex: 1,
            selection: [1] //c2
        });

        // set the displayedItem to c2
        setSingleDisplayMessage(tc, 1);

        U.ensureSynchronous(function () {
            var c2 = getChildCollectionByIndex(tc, 1),
                c2message2 = tc.provider.loadObject("MailMessage", { objectId: "c2:message2" });
            c2.mock$addItem(c2message2, 1);
        });

        tc.isTrue(tc.treeView.expanded);
        tc.areEqual(tc.treeView.item(1).objectId, "c2");
        tc.areEqual(tc.treeView.item(2).objectId, "c2:message1");
        tc.areEqual(tc.treeView.item(3).objectId, "c2:message2");
    });

    Tx.test("DisplayedItemManager_Unittest.autoExpand_collapsedConveration", { owner: "kepoon", priority: 0 }, function (tc) {
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 3
            },
            expandedIndex: 1
        });

        // set the displayedItem to c2
        tc.treeView.collapse();
        setSingleDisplayMessage(tc, 1);

        U.ensureSynchronous(function () {
            var c2 = getChildCollection(tc.target.displayedItem._node);
                c2message3 = tc.provider.loadObject("MailMessage", { objectId: "c2:message3" });
            c2.mock$addItem(c2message3, 2);
        });

        tc.isTrue(tc.treeView.expanded);
        tc.areEqual(tc.treeView.item(1).objectId, "c2");
        tc.areEqual(tc.treeView.item(2).objectId, "c2:message1");
        tc.areEqual(tc.treeView.item(3).objectId, "c2:message2");
        tc.areEqual(tc.treeView.item(4).objectId, "c2:message3");
    });

    Tx.test("DisplayedItemManager_Unittest.messageChanged", { owner: "kepoon", priority: 0 }, function (tc) {
        // Item deleted in a collapsed thread, ensure we select another item
        setupTestCase(tc, {
            collection: {
                c1: 1,
                c2: 2,
                c3: 3
            },
            expandedIndex: 1
        });

        // set the displayedItem to c2
        tc.treeView.collapse();
        setSingleDisplayMessage(tc, 1);

        verifyDisplayItem(tc, 1, "c2:message1");

        U.ensureSynchronous(function () {
            var c2 = getChildCollection(tc.target.displayedItem._node);
            c2.mock$removeItem(0);
        });
        verifyDisplayItem(tc, 1, "c2:message2");
    });

    ///
    /// Mocks
    ///
    var MockSelection = function (provider) {
        this.message = null;
        this.index = -1;
        var account = new Mail.Account(provider.getObjectById("account"), provider.getClient());
        this.view = new Mail.UIDataModel.MailView(provider.getObjectById("inboxView"), account);
        this.messages = [];
    };

    MockSelection.prototype = {
        clearMessageSelection: function () {
            this.updateMessages(null, -1, []);
        },
        updateMessages: function (displayed, index, messages) {
            this.message = displayed;
            this.index = index;
            this.messages = messages;
        }
    };

    var MockSelectionModel = function (tc, selection, collection) {
        this._tc = tc;
        this._selection = selection;
        this._collection = collection;
    };

    MockSelectionModel.prototype = {
        mockedType: Mail.SelectionModel,
        selection : function () {
            return new Mail.FilteredSelection(this._selection, this._collection);
        },
        selectedItems : function () {
            return this._selection.map(function (index) {
                return this._collection.item(index);
            }, this);
        },
        indexOfObject: function (id) {
            var result = -1;
            for (var i = 0 ; i < this._selection.length; i++) {
                var selectedIndex = this._selection[i];
                if (this._collection.item(selectedIndex).objectId === id) {
                    result = selectedIndex;
                    break;
                }
            }
            return result;
        },
        isValidIndex: function (index) {
            return index >= 0 && index < this._collection.count;
        },
        setSelection: function (index) {
            this._tc.isTrue(Jx.isValidNumber(index));
            this.selectedIndex = index;
        },
        getNodeSelection: function () {
            return null;
        }
    };
})();
