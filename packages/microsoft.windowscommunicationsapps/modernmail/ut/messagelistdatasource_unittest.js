
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Jx, Mail, Jx, Mocks, Microsoft, Tx*/

(function () {

    var MP = Mocks.Microsoft.WindowsLive.Platform,
        D = MP.Data,
        U = Mail.UnitTest,
        Plat = Microsoft.WindowsLive.Platform;

    function unwrap(promise) {
        var result;
        promise.then(function (r) { result = r; });
        return result;
    }

    function verifyDataSource(tc) {
        var platformCollection = tc.platformCollection,
            dataSource = tc.dataSource,
            len = unwrap(dataSource.getCount());
        tc.areEqual(len, platformCollection.count);
        if (len > 0) {
            var data = unwrap(dataSource.itemsFromIndex(0, 0, len - 1));
            tc.areEqual(data.totalCount, len);
            tc.areEqual(data.offset, 0);
            tc.areEqual(data.absoluteIndex, 0);
            data.items.forEach(function (item, index) {
                tc.areEqual(item.key, platformCollection.item(index).objectId);
            });
        }
    }

    function createCollection(contents) {
        var platformCollection = new MP.Collection("MailMessage", { clone: function (item) { return item; } });
        contents.forEach(function (id, index) { platformCollection.mock$addItem({ objectId: id, accountId: "account", mockedType: Microsoft.WindowsLive.Platform.MailMessage }, index); });
        return platformCollection;
    }

    function createNotificationHandler(tc, mockView, platformCollection) {
        var winjs_notificationHandler = {};
        tc.callVerifier.initialize(winjs_notificationHandler, ["beginNotifications", "endNotifications", "inserted", "removed", "moved", "invalidateAll"]);
        tc.dataSource = new Mail.MessageListDataSource(Mail.MessageListCollection.createForMessages(platformCollection, mockView, false));
        var mockListView = {
            get _cachedCount() {
                return platformCollection.count;
            }
        };
        new Mail.MessageListNotificationHandler(Mail.MessageListCollection.createForMessages(platformCollection, mockView, false), mockListView, winjs_notificationHandler);
        return winjs_notificationHandler;
    }

    function setup(tc, contents) {
        tc.cleanup = function () {
            Jx.scheduler.testFlush();
            Mail.UnitTest.restoreJx();
            tc.mockView = null;
            tc.platformCollection = null;
            tc.notificationHandler = null;
            tc.datasource = null;
        };

        var provider = new D.JsonProvider({
            Account: {
                all: [ { objectId: "account" } ]
            },
            Folder: {
                all: [ {
                    objectId: "inbox",
                    specialMailFolderType: Plat.MailFolderType.inbox
                } ]
            },
            MailView: {
                all: [ {
                    accountId: "account",
                    objectId: "inboxView",
                    type: Plat.MailViewType.inbox,
                    mock$sourceObjectId: "inbox"
                } ]
            }
        });

        var platform = provider.getClient(),
            account = Mail.Account.load("account", platform),
            platformCollection = tc.platformCollection = createCollection(contents);

        tc.callVerifier = new U.CallVerifier(tc);
        tc.notificationHandler = createNotificationHandler(tc, account.loadView("inboxView"), platformCollection);
        verifyDataSource(tc);
    }

    function createInsertTest(contents, id, index, prev, next) {
        return function (tc) {
            setup(tc, contents);

            var calls = tc.callVerifier;
            calls.expectOnce(tc.notificationHandler, "beginNotifications");
            calls.expectOnce(tc.notificationHandler, "inserted", [ { key: id, data: { objectId: id } }, prev, next ]);
            calls.expectOnce(tc.notificationHandler, "endNotifications");

            U.ensureSynchronous(function () {
                tc.platformCollection.mock$addItem({ objectId: id, accountId: "account", mockedType: Plat.MailMessage }, index);
            });

            calls.verify();
            verifyDataSource(tc);
        };
    }

    Tx.test("MessageListDataSource_UnitTest.insertEmpty", { owner: "kepoon", priority: 0 }, createInsertTest([], "A", 0, null, null));
    Tx.test("MessageListDataSource_UnitTest.insertFront", { owner: "kepoon", priority: 0 }, createInsertTest(["A", "B", "C"], "^", 0, null, "A"));
    Tx.test("MessageListDataSource_UnitTest.insertBack", { owner: "kepoon", priority: 0 }, createInsertTest(["A", "B", "C"], "$", 3, "C", null));
    Tx.test("MessageListDataSource_UnitTest.insertMiddle", { owner: "kepoon", priority: 0 }, createInsertTest(["A", "B", "C"], "*", 2, "B", null));

    function createRemoveTest(contents, index) {
        return function (tc) {
            setup(tc, contents);

            var calls = tc.callVerifier;
            calls.expectOnce(tc.notificationHandler, "beginNotifications");
            calls.expectOnce(tc.notificationHandler, "removed", [ contents[index] ]);
            calls.expectOnce(tc.notificationHandler, "endNotifications");

            U.ensureSynchronous(function () {
                tc.platformCollection.mock$removeItem(index);
            });

            calls.verify();
            verifyDataSource(tc);
        };
    }

    Tx.test("MessageListDataSource_UnitTest.removeEmpty", { owner: "kepoon", priority: 0 }, createRemoveTest(["A"], 0));
    Tx.test("MessageListDataSource_UnitTest.removeFront", { owner: "kepoon", priority: 0 }, createRemoveTest(["A", "B", "C"], 0));
    Tx.test("MessageListDataSource_UnitTest.removeBack", { owner: "kepoon", priority: 0 }, createRemoveTest(["A", "B", "C", "D"], 3));
    Tx.test("MessageListDataSource_UnitTest.removeMiddle", { owner: "kepoon", priority: 0 }, createRemoveTest(["A", "B", "C"], 1));

    function createMoveTest(contents, id, fromIndex, toIndex, prevKey, nextKey) {
        return function (tc) {
            setup(tc, contents);

            var calls = tc.callVerifier;
            calls.expectOnce(tc.notificationHandler, "beginNotifications");
            calls.expectOnce(tc.notificationHandler, "moved", [ { key: id, data: { objectId: id } }, prevKey, nextKey, fromIndex, toIndex]);
            calls.expectOnce(tc.notificationHandler, "endNotifications");

            U.ensureSynchronous(function () {
                tc.platformCollection.mock$moveItem(fromIndex, toIndex);
            });

            calls.verify();
            verifyDataSource(tc);
        };
    }

    // A, B, C, [D] => [D], A, B, C
    Tx.test("MessageListDataSource_UnitTest.moveToFront", { owner: "kepoon", priority: 0 }, createMoveTest(["A", "B", "C", "D"], "D", 3, 0, null, "A"));
    // [A], B, C => B, C, [A]
    Tx.test("MessageListDataSource_UnitTest.moveToEnd", { owner: "kepoon", priority: 0 }, createMoveTest(["A", "B", "C"], "A", 0, 2, "C", null));
    // A, [B], C, D => A, C, [B], D
    Tx.test("MessageListDataSource_UnitTest.moveForward", { owner: "kepoon", priority: 0 }, createMoveTest(["A", "B", "C", "D"], "B", 1, 2, "C", null));
    // A, B, [C], D => A, [C], B, D
    Tx.test("MessageListDataSource_UnitTest.moveBackward", { owner: "kepoon", priority: 0 }, createMoveTest(["A", "B", "C", "D"], "C", 2, 1, "A", null));
})();
