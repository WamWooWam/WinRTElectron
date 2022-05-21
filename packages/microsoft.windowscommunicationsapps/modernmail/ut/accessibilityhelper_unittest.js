
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true */
/*global Mail,Jx,Tx,WinJS*/

(function () {

    var mockListView = null,
        mockConversationCollection = null,
        mockConversationNode = null;

    var MockEventSource = function () {
        this._addEventListenerCalls = [];
        this._removeEventListenerCalls = [];
    };
    MockEventSource.prototype = {
        reset: function () {
            this._addEventListenerCalls = [];
            this._removeEventListenerCalls = [];
        },
        addEventListener : function () {
            this._addEventListenerCalls.push(arguments);
        },
        removeEventListener : function () {
            this._removeEventListenerCalls.push(arguments);
        }
    };

    var MockCollection = function (tc) {
        MockEventSource.call(this);
        this._items = [];
        this._locked = true;
        this._disposed = false;
        this._tc = tc;
    };

    MockCollection.prototype = {
        item: function (index) {
            this._tc.isFalse(this._disposed);
            this._tc.isTrue(index >= 0);
            this._tc.isTrue(index < this._items.length);
            return this._items[index];
        },
        lock: function () {
            this._tc.isFalse(this._disposed);
            this._tc.isFalse(this._locked);
            this._locked = true;
        },
        unlock: function () {
            this._tc.isFalse(this._disposed);
            this._tc.isTrue(this._locked);
            this._locked = false;
        },

        getTreeView: function () {
            return {
                mockedType: Mail.ThreadedListCollection,
                addListener: Jx.fnEmpty,
                removeListener: Jx.fnEmpty
            };
        },

        dispose: function () {
            this._tc.isFalse(this._disposed);
            this._disposed = true;
        },

        addListener: Jx.fnEmpty,
        removeListener: Jx.fnEmpty
    };

    Object.defineProperty(MockCollection.prototype, "count", {
        get: function () {
            this._tc.isFalse(this._disposed);
            return this._items.length;
        },
        enumerable: true
    });
    Jx.augment(MockCollection, MockEventSource);

    var MockConversationNode = function (tc) {
        MockCollection.call(this, tc);
    };
    Jx.inherit(MockConversationNode, MockCollection);

    Object.defineProperty(MockConversationNode.prototype, "totalCount", {
        get: function () {
            return this.count;
        },
        enumerable: true
    });

    var elements = {};
    var setUp = function (tc) {
        var messageListItemFactory = Mail.MessageListItemFactory;
        tc.cleanup = function () {
            Mail.MessageListItemFactory = messageListItemFactory;
            mockListView = null;
            mockConversationCollection = null;
            Mail.UnitTest.disposeGlobals();
            Mail.UnitTest.restoreJx();
        };
        
        Mail.UnitTest.stubJx(tc, "activation");
        Mail.UnitTest.stubJx(tc, "appData");
        Mail.UnitTest.initGlobals(tc);

        mockListView = new MockEventSource();
        mockListView.mockedType = WinJS.UI.ListView;
        mockListView.loadingState = "complete";

        mockConversationCollection = new MockCollection(tc);
        mockConversationCollection.mockedType = Mail.TrailingItemCollection;

        mockConversationNode = new MockConversationNode(tc);
        mockConversationNode.mockedType = Mail.ConversationNode;

        Mail.MessageListItemFactory = {
            getElementById : function (objectId) {
                var element = elements[objectId];
                if (!element) {
                    element = elements[objectId] = document.createElement("div");
                }
                return element;
            }
        };
    };

    Tx.test("AccessibilityHelper_UnitTest.test_ctor", {owner:"geevens", priority:0}, function (tc) {
        setUp(tc);
        var accessibilityHelper = new Mail.AccessibilityHelper(mockListView, mockConversationCollection);
        tc.areEqual(1, mockListView._addEventListenerCalls.length);
        tc.areEqual(3, mockListView._addEventListenerCalls[0].length);
        tc.areEqual("accessibilityannotationcomplete", mockListView._addEventListenerCalls[0][0]);
        tc.areEqual(0, mockListView._removeEventListenerCalls.length);

        accessibilityHelper.dispose();
        tc.areEqual(mockListView._addEventListenerCalls.length, mockListView._removeEventListenerCalls.length);
        for (var ii = 0, iiMax = mockListView._addEventListenerCalls.length; ii < iiMax; ii++) {
            tc.areEqual(mockListView._addEventListenerCalls[ii].length, mockListView._removeEventListenerCalls[ii].length);
            for (var jj = 0, jjMax = mockListView._addEventListenerCalls[ii].length; jj < jjMax; jj++) {
                tc.areEqual(mockListView._addEventListenerCalls[ii][jj], mockListView._removeEventListenerCalls[ii][jj]);
            }
        }
    });

    Tx.test("AccessibilityHelper_UnitTest.test_basic", {owner:"geevens", priority:0}, function (tc) {
        setUp(tc);
        // Create a mock conversation collection with 40 items
        for (var ii = 0; ii < 40; ii++) {
            mockConversationCollection._items[ii] = {
                objectId: "conversation-object-id-" + ii,
                mockedType: Mail.UIDataModel.MailConversation
            };
        }
        // Create a expanded thread with 10 items at position 5
        var expandedConversationSize = 10,
            expandedConversationPosition = 5;

        for (ii = 0; ii < expandedConversationSize; ii++) {
            mockConversationNode._items[ii] = {
                objectId: "message-object-id-" + ii,
                _id: ii,
                mockedType: Mail.TreeNode
            };
            mockConversationCollection._items.splice(expandedConversationPosition, 0, mockConversationNode._items[ii]);
        }
        var accessibilityHelper = new Mail.AccessibilityHelper(mockListView, mockConversationCollection);
        accessibilityHelper._onExpandedConversationChanged({
            newValue: mockConversationNode,
            index: expandedConversationPosition
        });
        accessibilityHelper._updateAccessibility({
            detail: {
                firstIndex: 0,
                lastIndex: mockConversationCollection.count - 1
            }
        });
        for (ii = 0; ii < mockConversationCollection.count; ii++) {
            var item = mockConversationCollection.item(ii);
            var element = Mail.MessageListItemFactory.getElementById(item.objectId);
            if (item.mockedType === Mail.TreeNode) {
                tc.areEqual(String(expandedConversationSize), element.getAttribute("aria-setsize"));
                tc.areEqual(String(item._id + 1), element.getAttribute("aria-posinset"));
                tc.areEqual((item._id === expandedConversationSize - 1), element.classList.contains("mailMessageListLastItemInConversation"));
            }
        }
        accessibilityHelper.dispose();
    });

    Tx.test("AccessibilityHelper_UnitTest.test_noItems", {owner:"geevens", priority:0}, function (tc) {
        setUp(tc);
        var accessibilityHelper = new Mail.AccessibilityHelper(mockListView, mockConversationCollection);
        accessibilityHelper._updateAccessibility({
            detail: {
                firstIndex: -1,
                lastIndex: -1
            }
        });
        accessibilityHelper.dispose();
    });
})();
