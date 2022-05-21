
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Tx,Microsoft,Mocks*/

(function () {

    var U = Mail.UnitTest;
    var MP = Mocks.Microsoft.WindowsLive.Platform;

    var setUp = function (tc) {
        U.stubJx(tc, "res");
        var div = document.createElement("div");
        document.body.appendChild(div);
        return div;
    };

    var tearDown = function (div) {
        try {
            document.body.removeChild(div);
        } catch(e) { }
        U.restoreJx();
    };

    Tx.test("AccountItem.test_changes", {owner:"neilpa", priority:0}, function (tc) {
        var containerDiv = setUp(tc);
        tc.cleanup = function () {
            tearDown(containerDiv);
        };
        var account = new MP.Object("Account", { clone: function (item) { return item; } });
        var resource = new MP.Object("AccountResource", { clone: function (item) { return item; } });
        account.getResourceByType = function () { return resource; };
        account.getServerByType = function () { return null; };
        account._objectId = "123456789";
        account.mockedType = Microsoft.WindowsLive.Platform.Account;
        account._displayName = account.displayName = "Foo";
        resource.lastSyncResult = 0;
        resource.lastPushResult = 0;

        // Pre-populate with 12 items
        var counter = new MP.Collection("MailMessage", { clone: function (item) { return item; } });
        for (var i = 0; i < 12; i++) { counter.mock$addItem({objectId: String(i)}, i); }

        // Overwrite getUnseenCollection
        Mail.AccountItem._getUnseenCollection = function () { return counter; };

        var item;
        U.ensureSynchronous(function () {
            item = new Mail.AccountItem(account, Jx.scheduler);
        });
        Jx.scheduler.testFlush();

        item.initUI(containerDiv);
        var elAccount = containerDiv.querySelector(".accountItem");
        tc.isTrue(Jx.isHTMLElement(elAccount));

        // Validate we're showing the right name
        var elName = elAccount.querySelector(".accountName");
        tc.isTrue(Jx.isHTMLElement(elName));
        tc.isTrue(elName.innerText === account.displayName);

        // Validate we're showing the right count
        var elCount = elAccount.querySelector(".unseenCount");
        tc.isTrue(Jx.isHTMLElement(elCount));
        tc.isTrue(elCount.innerText === "12");

        // We shouldn't be showing the overflow glyph
        var elGlyph = elAccount.querySelector(".unseenPlus");
        tc.isTrue(Jx.isHTMLElement(elGlyph));
        tc.isTrue(elGlyph.innerText === "");

        // We shouldn't be showing the error text
        tc.isFalse(elAccount.classList.contains("showError"));

        // Update the unseen count to 999 and validate the count updated and the glyph is still hidden
        counter.mock$suspendNotifications();
        for (i = counter.count; i < 999; i++) { counter.mock$addItem({objectId: String(i)}, i); }
        U.ensureSynchronous(function () { counter.mock$resumeNotifications(); });

        tc.isTrue(elCount.innerText === "999");
        tc.isTrue(elGlyph.innerText === "");

        // Update the count to > 999 validate
        U.ensureSynchronous(function () { counter.mock$addItem({objectId: "-1"}, 0); });
        tc.isTrue(elCount.innerText === "999");
        tc.isTrue(elGlyph.innerHTML !== "");

        // Clear the count to zero and ensure that both are hidden
        counter.mock$suspendNotifications();
        while (counter.count > 0) { counter.mock$removeItem(0); }
        U.ensureSynchronous(function () { counter.mock$resumeNotifications(); });
        counter.count = 0;
        tc.isTrue(elCount.innerText === "");
        tc.isTrue(elGlyph.innerText === "");

        // Update the name of the folder
        account.mock$setProperty("displayName", "Bar");
        tc.isTrue(elName.innerText === account.displayName);
    });
})();
