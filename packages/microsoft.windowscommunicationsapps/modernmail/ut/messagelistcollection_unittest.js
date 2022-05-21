
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Jx, Mail, Jx, Mocks, Microsoft, Tx*/

(function () {

    var M = Mocks,
        MP = M.Microsoft.WindowsLive.Platform,
        D = MP.Data,
        U = Mail.UnitTest,
        Plat = Microsoft.WindowsLive.Platform;

    function verifyCollection (tc, collection, expectedContents) {
        tc.areEqual(collection.count, expectedContents.length);
        expectedContents.forEach(function (expected, index) {
            tc.areEqual(collection.item(index).objectId, expected);
        });
    }

    function verifyPlatformCollection (tc, collection, platformCollection) {
        tc.areEqual(collection.count, platformCollection.count);
        for (var i = 0, len = collection.count; i < len; i++) {
            tc.areEqual(collection.item(i).objectId, platformCollection.item(i).objectId);
        }
    }

    var mockView = null;

    function Listener(tc, platformCollection, locked) {
        this._tc = tc;
        this._platformCollection = platformCollection;
        if (Jx.isNullOrUndefined(locked)) {
            locked = false;
        }
        var collection = this._collection = Mail.MessageListCollection.createForMessages(platformCollection, mockView, locked);
        verifyPlatformCollection(tc, collection, platformCollection);

        collection.addListener("itemAdded", this._verifyEvent.bind(this, "add"));
        collection.addListener("itemRemoved", this._verifyEvent.bind(this, "remove"));
        collection.addListener("itemMoved", this._verifyEvent.bind(this, "move"));
        collection.addListener("beginChanges", this._verifyEvent.bind(this, "begin"));
        collection.addListener("endChanges", this._verifyEvent.bind(this, "end"));
        collection.addListener("reset", this._verifyEvent.bind(this, "reset"));

        var contents = this._contents = [];
        for (var i = 0, len = collection.count; i < len; i++) {
            contents.push(collection.item(i).objectId);
        }
        this._expected = [{ type: "begin", contents: contents.slice(0), ev: { target: collection } }];
    }

    Listener.prototype.verifyComplete = function () {
        this._tc.areEqual(this._expected.length, 0);
        verifyPlatformCollection(this._tc, this._collection, this._platformCollection);
    };

    Listener.prototype.add = function (id, index) {
        // add item with id at index and set up the expected events
        var contents = this._contents;
        contents.splice(index, 0, id);
        this._expected.push({
            type: "add",
            contents: contents.slice(0),
            ev: { index: index, objectId: id}
        });
        this._platformCollection.mock$addItem({ objectId: id, accountId: "account", mockedType: Microsoft.WindowsLive.Platform.MailMessage }, index);
    };

    Listener.prototype.remove = function (index) {
        var id = this._contents.splice(index, 1)[0];
        this._expected.push({
            type: "remove",
            contents: this._contents.slice(0),
            ev: { index: index, objectId: id }
        });

        this._platformCollection.mock$removeItem(index);
    };

    Listener.prototype.move = function (fromIndex, toIndex) {
        var contents = this._contents;

        // Implement move using splice
        var id = contents.splice(fromIndex, 1)[0];
        contents.splice(toIndex, 0, id);

        this._expected.push({
            type: "move",
            contents: contents.slice(0),
            ev: { index: toIndex, objectId: id, previousIndex : fromIndex}
        });
        this._platformCollection.mock$moveItem(fromIndex, toIndex);
    };

    Listener.prototype.reset = function () {
        var platformCollection = this._platformCollection;

        this.add("$", 4);
        // This will produce a reset. All other changes will get rolled into the the single reset event
        platformCollection.mock$suspendNotifications();
        this.remove(1);
        this.add("*", 1);
        var contents = [];
        for (var i = 0, len = platformCollection.count; i < len; i++) {
            contents.push(platformCollection.item(i).objectId);
        }

        this._expected = [
            { type: "reset", contents: contents, ev: { target: this._collection } }
        ];
        platformCollection.mock$resumeNotifications();
    };

    Listener.prototype.end = function () {
        this._expected.push({ type: "end", contents: this._contents.slice(0), ev: { target: this._collection } });
    };

    Listener.prototype._verifyEvent = function (type, ev) {
        var expected = this._expected.shift();
        this._tc.areEqual(type, expected.type);
        for (var field in expected.ev) {
            this._tc.areEqual(expected.ev[field], ev[field]);
        }
        verifyCollection(this._tc, this._collection, expected.contents);
    };

    function setup(tc) {
        tc.cleanup = function () {
            Jx.scheduler.testFlush();
            Mail.Globals = {};
            mockView = null;
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
            account = Mail.Account.load("account", platform);
        mockView = account.loadView("inboxView");

        var provider = new D.JsonProvider({
            Account: {
                all: [ { objectId: "account" } ]
            }
        });
        Mail.Globals = { platform: provider.getClient() };
    }

    Tx.test("MessageListCollection.deferredChanges", { owner: "kepoon", priority: 0 }, function (tc) {
        // This test is essentially the same as test_changes, except we passed in ViewReady=false
        // in the constructor of the messageListCollection.
        // This defers any changes in the collection until the listView is ready again
        setup(tc);
        var platformCollection = new MP.Collection("MailMessage", { clone: function (item) { return item; } });
        [ "A", "B", "C", "D" ].forEach(function (id, index) { platformCollection.mock$addItem({ objectId: id, accountId: "account", mockedType: Microsoft.WindowsLive.Platform.MailMessage }, index); });

        var listener = new Listener(tc, platformCollection, true);
        U.ensureSynchronous(function () {
            listener.add("$", 4); // ABCD$    insert back
            listener.add("^", 0); // ^ABCD$   insert front
            listener.add("-", 3); // ^AB-CD$  insert middle
            listener.remove(2);   // ^A-CD$   delete in front of new item (B)
            listener.end();
        });
        verifyCollection(tc, listener._collection, [ "A", "B", "C", "D" ]);
        listener._collection.lock();
        verifyCollection(tc, listener._collection, [ "A", "B", "C", "D" ]);
        listener._collection.unlock();
        listener.verifyComplete();
    });

    Tx.test("MessageListCollection.changes", { owner: "kepoon", priority: 0 }, function (tc) {
        setup(tc);

        var platformCollection = new MP.Collection("MailMessage", { clone: function (item) { return item; } });
        [ "A", "B", "C", "D" ].forEach(function (id, index) { platformCollection.mock$addItem({ objectId: id, accountId: "account", mockedType: Microsoft.WindowsLive.Platform.MailMessage }, index); });

        var listener = new Listener(tc, platformCollection);
        U.ensureSynchronous(function () {
            listener.add("$", 4); // ABCD$    insert back
            listener.add("^", 0); // ^ABCD$   insert front
            listener.add("-", 3); // ^AB-CD$  insert middle
            listener.remove(2);   // ^A-CD$   delete in front of new item (B)
            listener.add(")", 3); // ^A-)CD$  insert after new item
            listener.add(":", 2); // ^A:-)CD$ insert before new item
            listener.remove(5);   // ^A:-)D$  delete behind new item (C)
            listener.remove(0);   // A:-)D$   delete inserted item (^)
            listener.move(1,4);   // A-)D:$   move : from index 1 to 4
            listener.move(3,0);   // DA-):$   move D from index 3 to 0
            listener.end();
        });

        listener.verifyComplete();
    });

    Tx.test("MessageListCollection.reset", { owner: "kepoon", priority: 0 }, function (tc) {
        setup(tc);

        var platformCollection = new MP.Collection("MailMessage", { clone: function (item) { return item; } });
        [ "A", "B", "C", "D" ].forEach(function (id, index) { platformCollection.mock$addItem({ objectId: id, accountId: "account", mockedType: Microsoft.WindowsLive.Platform.MailMessage }, index); });

        var listener = new Listener(tc, platformCollection);
        U.ensureSynchronous(function () {
            listener.reset();
        });

        listener.verifyComplete();
    });

    Tx.test("MessageListCollection.cancelTimers", { owner: "kepoon", priority: 0 }, function (tc) {
        setup(tc);

        var platformCollection = new MP.Collection("MailMessage", { clone: function (item) { return item; } });
        var collection = Mail.MessageListCollection.createForMessages(platformCollection, mockView, true);
        var isDisposed = false;
        var origAcceptPendingChanges = collection._acceptPendingChanges;
        collection._acceptPendingChanges =  function () {
            tc.isFalse(isDisposed, "Why are we getting called after we have been disposed");
            origAcceptPendingChanges.call(collection);
        };

        U.ensureSynchronous(function () {
            platformCollection.mock$addItem({ objectId: "A" , accountId: "account", mockedType: Microsoft.WindowsLive.Platform.MailMessage }, 0);
            collection.unlock();
            platformCollection.mock$addItem({ objectId: "B" , accountId: "account", mockedType: Microsoft.WindowsLive.Platform.MailMessage }, 0);
            collection.dispose();
            // we should not get called anymore
            isDisposed = true;
        });
    });

})();
