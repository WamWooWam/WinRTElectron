
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Tx,Debug,Microsoft*/

(function  () {

    var U = Mail.UnitTest,
        UnseenMonitor = Mail.UnseenMonitor;

    var sandbox, collection;
    function setup(tc, initialVisibility) {
        collection = { unlock: function () {}, dispose: function () {} };
        Jx.mix(collection, Jx.Events);
        Debug.Events.define(collection, "collectionchanged", "otherevent");

        sandbox = document.getElementById("sandbox");
        sandbox.hidden = !initialVisibility;
        tc.cleanup = function () {
            sandbox.innerText = "";
            sandbox = null;
            collection = null;
        };
    }

    Tx.test("UnseenMonitor.testNullCollection", function (tc) {
        setup(tc, true);
        var called = 0, unseen;
        var view = {
            mockedType: Mail.UIDataModel.MailView,
            clearUnseenMessages: function () { called++; },
            getMessages: function () { return null; },
        };

        // The unseen count should be cleared upon construction
        U.ensureSynchronous(function () {
            unseen = new UnseenMonitor(view, {}, sandbox);
        });
        tc.areEqual(called, 1);

        unseen.dispose();
        tc.areEqual(called, 1);
    });

    Tx.test("UnseenMonitor.testInit", function (tc) {
        setup(tc, true);
        var called = 0, unseen;
        var view = {
            mockedType: Mail.UIDataModel.MailView,
            clearUnseenMessages: function () { called++; },
            getMessages: function () { return collection; },
        };

        // The unseen count should be cleared upon construction
        U.ensureSynchronous(function () {
            unseen = new UnseenMonitor(view, {}, sandbox);
        });
        tc.areEqual(called, 1);

        unseen.dispose();
        tc.areEqual(called, 1);
    });

    Tx.test("UnseenMonitor.testChange", function (tc) {
        setup(tc, true);
        var called = 0, unseen;
        var view = {
            mockedType: Mail.UIDataModel.MailView,
            clearUnseenMessages: function () { called++; },
            getMessages: function () { return collection; },
        };
        // The unseen count should be cleared upon construction
        U.ensureSynchronous(function () {
            unseen = new UnseenMonitor(view, {}, sandbox);
        });
        tc.areEqual(called, 1);

        // The unseen count should be cleared when the collection changes
        U.ensureSynchronous(function () {
            collection.raiseEvent("collectionchanged", { eType: Microsoft.WindowsLive.Platform.CollectionChangeType.reset });
        });
        tc.areEqual(called, 2);

        // Some other event shouldn't clear the count
        U.ensureSynchronous(function () {
            collection.raiseEvent("otherevent");
        });
        tc.areEqual(called, 2);

        unseen.dispose();
        tc.areEqual(called, 2);
    });

    function fakeVisibility(hidden)  {
        U.ensureSynchronous(function () {
            var ev = document.createEvent("Event");
            ev.initEvent("visibilitychange", true, true);
            sandbox.hidden = hidden;
            sandbox.dispatchEvent(ev);
        });
    }

    Tx.test("UnseenMonitor.testVisibility", function (tc) {
        setup(tc, true);
        var called = 0, scrolled = 0, unseen;
        var view = {
            mockedType: Mail.UIDataModel.MailView,
            clearUnseenMessages: function () { called++; },
            getMessages: function () { return collection; },
        };
        var list = {
            ensureVisible: function (index) {
                tc.areEqual(index, 0, "scrolling somewhere other than the top");
                scrolled++;
            },
        };

        // The unseen count should be cleared upon construction
        U.ensureSynchronous(function () {
            unseen = new UnseenMonitor(view, list, sandbox);
        });
        tc.areEqual(called, 1);
        tc.areEqual(scrolled, 0);

        // The unseen count shouldn't be cleared on visibility change
        // if the root element is hidden
        fakeVisibility(true);
        tc.areEqual(called, 1);
        tc.areEqual(scrolled, 0);

        // The unseen count shouldn't be cleared on visibility change
        // if the collection count is still 0
        collection.count = 0;
        fakeVisibility(false);
        tc.areEqual(called, 1);
        tc.areEqual(scrolled, 0);

        // The unseen count should be cleared and the list scrolled
        collection.count = 12;
        fakeVisibility(false);
        tc.areEqual(called, 2);
        tc.areEqual(scrolled, 1);

        unseen.dispose();
        tc.areEqual(called, 2);
        tc.areEqual(scrolled, 1);
    });

    Tx.test("UnseenMonitor.testInitiallyHidden", function (tc) {
        setup(tc, false);

        var called = 0, scrolled = 0, unseen;
        var view = {
            mockedType: Mail.UIDataModel.MailView,
            clearUnseenMessages: function () { called++; },
            getMessages: function () { return collection; },
        };
        var list = {
            ensureVisible: function (index) {
                tc.areEqual(index, 0, "scrolling somewhere other than the top");
                scrolled++;
            },
        };

        // The unseen count should NOT be cleared upon construction because the app is not visible yet
        U.ensureSynchronous(function () {
            unseen = new UnseenMonitor(view, list, sandbox);
        });
        tc.areEqual(called, 0);

        collection.count = 12;
        fakeVisibility(false);

        tc.areEqual(called, 1);
        tc.areEqual(scrolled, 1);

        unseen.dispose();
        tc.areEqual(called, 1);
        tc.areEqual(scrolled, 1);
    });

})();


