
(function () {
    /*global Mail, Microsoft,Tx,Mocks,Jm,Jx*/
    /*jshint browser:true*/

    var Plat = Microsoft.WindowsLive.Platform,
        D = Mocks.Microsoft.WindowsLive.Platform.Data,
        testInfo = { owner: "kepoon", priority: 0 },
        sandbox = null,
        account = null,
        provider = null,
        control = null,
        openAccountSettings = null;

    function setup(tc, viewOptions) {
        provider = new D.JsonProvider({}, D.MethodHandlers),
        account = new Mail.Account(provider.loadObject("Account", {}), provider.getClient()),
        sandbox = document.createElement("div");

        var defaultViewOption = {
            accountId: account.objectId
        };
        viewOptions = viewOptions ? Jx.mix(viewOptions, defaultViewOption) : defaultViewOption;
        var view = new Mail.UIDataModel.MailView(provider.loadObject("MailView", viewOptions), account),
            monitor = new Mail.ViewSyncMonitor(view),
            preserver = Jm.preserve(Mail.AppSettings, "openAccountUI");

        openAccountSettings = {
            invoked: false,
            account: null
        };

        Mail.AppSettings.openAccountUI = function (account) {
            openAccountSettings = {
                account: account,
                invoked: true
            };
        };

        control = Mail.EmptyTextControl.create(sandbox, monitor, view);

        tc.addCleanup(function () {
            preserver.restore();
            provider = null;
            account = null;
            sandbox = null;
            openAccountSettings = null;
            provider = null;
        });
    }

    Tx.test("EmpyTextControl.test_UI", testInfo, function (tc) {
        setup(tc);
        account.mailResource.mock$setProperty("syncWindowSize", Plat.SyncWindowSize.threeDays);
        control.setVisibility(true);

        // Verify the UI
        tc.areEqual(sandbox.querySelector("span").innerText, Jx.res.getString("mailMessageListNoMessagesThreeDays"));
        tc.areEqual(sandbox.querySelector("a").innerText, Jx.res.getString("mailMessageListGetOlderMessages"));
        tc.isFalse(sandbox.classList.contains("hidden"));

        control.setVisibility(false);
        tc.isTrue(sandbox.classList.contains("hidden"));
    });

    Tx.test("EmpyTextControl.test_UI_syncWindowAll", testInfo, function (tc) {
        setup(tc);
        account.mailResource.mock$setProperty("syncWindowSize", Plat.SyncWindowSize.all);
        control.setVisibility(true);

        // Verify the UI
        tc.areEqual(sandbox.querySelector("span").innerText, Jx.res.getString("mailMessageListNoMessagesAnyTime"));
        tc.isTrue(Jx.isNullOrUndefined(sandbox.querySelector("a")));
        tc.isFalse(sandbox.classList.contains("hidden"));

        control.setVisibility(false);
        tc.isTrue(sandbox.classList.contains("hidden"));
    });

    Tx.test("EmpyTextControl.test_UI_syncStatusChanges", testInfo, function (tc) {
        setup(tc);
        Mail.UnitTest.ensureSynchronous(function () {
            account.mailResource.mock$setProperty("lastSyncResult", -52); // An arbitrary number to simulate a sync failure
            account.mailResource.mock$setProperty("syncWindowSize", Plat.SyncWindowSize.twoWeeks);
        });
        control.setVisibility(true);

        // Verify the UI
        tc.areEqual(sandbox.querySelector("span").innerText, Jx.res.getString("mailMessageListFailedToSync"));
        tc.isFalse(sandbox.classList.contains("hidden"));
        tc.isNull(sandbox.querySelector("a"), "No settings link should be shown in the error case");

        // now the sync status changes
        Mail.UnitTest.ensureSynchronous(function () {
            account.mailResource.mock$setProperty("lastSyncResult", 0);
        });

        control.setVisibility(true);

        // Verify the UI
        tc.areEqual(sandbox.querySelector("span").innerText, Jx.res.getString("mailMessageListNoMessagesTwoWeeks"));
        tc.areEqual(sandbox.querySelector("a").innerText, Jx.res.getString("mailMessageListGetOlderMessages"));
        tc.isFalse(sandbox.classList.contains("hidden"));
    });

    Tx.test("EmpyTextControl.test_UI_syncWindowChanges", testInfo, function (tc) {
        setup(tc);
        account.mailResource.mock$setProperty("syncWindowSize", Plat.SyncWindowSize.twoWeeks);
        control.setVisibility(true);

        // Verify the UI
        tc.areEqual(sandbox.querySelector("span").innerText, Jx.res.getString("mailMessageListNoMessagesTwoWeeks"));

        account.mailResource.mock$setProperty("syncWindowSize", Plat.SyncWindowSize.oneMonth);

        // Verify sync window change in the UI
        tc.areEqual(sandbox.querySelector("span").innerText, Jx.res.getString("mailMessageListNoMessagesOneMonth"));
    });

    Tx.test("EmpyTextControl.test_invoke", testInfo, function (tc) {
        setup(tc);
        control.setVisibility(true);

        sandbox.querySelector("a").click();
        tc.areEqual(openAccountSettings.account.objectId, account.objectId);
        tc.isTrue(openAccountSettings.invoked);
    });

    Tx.test("AllPinnedEmptyTextControl.test_ui_syncWindowChanges", testInfo, function (tc) {
        setup(tc, { type: Plat.MailViewType.allPinnedPeople});

        control.setVisibility(true);

        control._collection._collection._collection.mock$addItem(provider.loadObject("MailView", {
            accountId: account.objectId, type: Plat.MailViewType.person
        }), 0);
        account.mailResource.mock$setProperty("syncWindowSize", Plat.SyncWindowSize.threeDays);

        // Verify the UI
        tc.areEqual(sandbox.querySelector("span").innerText, Jx.res.getString("mailMessageListNoMessagesThreeDays"));

        account.mailResource.mock$setProperty("syncWindowSize", Plat.SyncWindowSize.oneWeek);

        // Verify sync window change in the UI
        tc.areEqual(sandbox.querySelector("span").innerText, Jx.res.getString("mailMessageListNoMessagesOneWeek"));
    });

    Tx.test("AllPinnedEmptyTextControl.test_ui_showProgress", testInfo, function (tc) {
        setup(tc, { type: Plat.MailViewType.allPinnedPeople});
        control.setVisibility(true, true /*showProgress*/);

        // empty string is correct
        tc.areEqual(sandbox.querySelector("span").innerText, Jx.res.getString("mailMessageListAllPinnedFirstRun"));
        tc.isTrue(sandbox.querySelector("a").classList.contains("hidden"));

        // the visibility is correct
        tc.isFalse(sandbox.classList.contains("hidden"));
    });

    Tx.test("AllPinnedEmptyTextControl.test_ui_syncFailure", testInfo, function (tc) {
        setup(tc, { type: Plat.MailViewType.allPinnedPeople });
        Mail.UnitTest.ensureSynchronous(function () {
            account.mailResource.mock$setProperty("lastSyncResult", -52); // An arbitrary number to simulate a sync failure
        });
        control.setVisibility(true, false/*showProgress*/);

        tc.areEqual(sandbox.querySelector("span").innerText, Jx.res.getString("mailMessageListFailedToSync"));
        tc.areEqual(sandbox.querySelector("a").innerText, "");
        tc.isFalse(sandbox.classList.contains("hidden"));
    });

    Tx.test("AllPinnedEmptyTextControl.test_ui_peopleViewComplete", testInfo, function (tc) {
        setup(tc, { type: Plat.MailViewType.allPinnedPeople });

        Mail.UnitTest.ensureSynchronous(function () {
            account.platformObject.mock$setProperty("peopleViewComplete", false);
        });

        control.setVisibility(true, false/*showProgress*/);
        tc.areEqual(sandbox.querySelector("span").innerText, Jx.res.getString("mailMessageListAllPinnedEmpty"));
        tc.areEqual(sandbox.querySelector("a").innerText, Jx.res.getString("mailMessageListAllPinnedEmptyLink"));

        // simulate people view complete

        Mail.UnitTest.ensureSynchronous(function () {
            var personView = provider.loadObject("MailView", { accountId: account.objectId, type: Plat.MailViewType.person });
            account.mailResource.mock$setProperty("syncWindowSize", Plat.SyncWindowSize.threeDays);
            account.platformObject.mock$setProperty("peopleViewComplete", true);
            control._collection._collection._collection.mock$addItem(personView, 0);
        });

        // verify UI
        tc.areEqual(sandbox.querySelector("span").innerText, Jx.res.getString("mailMessageListNoMessagesThreeDays"));
        tc.areEqual(sandbox.querySelector("a").innerText, Jx.res.getString("mailMessageListGetOlderMessages"));
        tc.isFalse(sandbox.classList.contains("hidden"));

        // verify link
        sandbox.querySelector("a").click();
        tc.areEqual(openAccountSettings.account.objectId, account.objectId);
        tc.isTrue(openAccountSettings.invoked);
    });
})();
