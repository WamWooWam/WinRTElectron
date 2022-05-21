
(function () {

    var Plat = Microsoft.WindowsLive.Platform,
        D = Mocks.Microsoft.WindowsLive.Platform.Data,
        SyncStatus = Mail.ViewSyncMonitor.SyncStatus;

    var isOnline, provider;
    function setup(tc) {
        var oldConnectivity = Mail.Utilities.ConnectivityMonitor,
            oldRoot = Jx.root;

        Mail.Utilities.ConnectivityMonitor = {
            hasNoInternetConnection: function () { return !isOnline; },
            Events: { connectivityChanged: "connectivityChanged" }
        };
        isOnline = true;

        Jx.root = new Jx.Component();
        Jx.root.initComponent();

        provider = new D.JsonProvider({});

        tc.cleanup = function () {
            Mail.Utilities.ConnectivityMonitor = oldConnectivity;
            Jx.root = oldRoot;
            provider = null;
        };
    }

    Tx.test("AllPinnedViewSyncMonitor.testSync", function (tc) {
        setup(tc);

        var account = new Mail.Account(provider.loadObject("Account", {
                peopleViewComplete: false
            }), provider.getClient()),
            view = new Mail.UIDataModel.MailView(provider.loadObject("MailView", {
                accountId: account.objectId
            }), account);

        account.mailResource.mock$setProperty("lastSyncResult", Plat.Result.authNotAttempted);

        var changes = 0;
        var monitor = new Mail.AllPinnedViewSyncMonitor(view);
        monitor.addListener("syncStatusChanged", function () { changes++; });

        // Sync not started
        tc.areEqual(monitor.getSyncStatus(), SyncStatus.notStarted);
        tc.isFalse(monitor.isSyncCompleted);

        // Sync begins
        account.mailResource.mock$setProperty("isSynchronizing", true);
        tc.areEqual(changes, 0);
        Jx.scheduler.testFlush();
        tc.areEqual(changes, 1);
        tc.areEqual(monitor.getSyncStatus(), SyncStatus.syncing);
        tc.isFalse(monitor.isSyncCompleted);

        // Account reports success, people view still waiting
        account.mailResource.mock$setProperty("lastSyncResult", 0);
        account.mailResource.mock$setProperty("isSynchronizing", false);
        tc.areEqual(changes, 1);
        Jx.scheduler.testFlush();
        tc.areEqual(changes, 1);
        tc.areEqual(monitor.getSyncStatus(), SyncStatus.syncing);
        tc.isFalse(monitor.isSyncCompleted);

        // People view completes
        account.platformObject.mock$setProperty("peopleViewComplete", true);
        tc.areEqual(changes, 1);
        Jx.scheduler.testFlush();
        tc.areEqual(changes, 2);
        tc.areEqual(monitor.getSyncStatus(), SyncStatus.completed);
        tc.isTrue(monitor.isSyncCompleted);

        monitor.dispose();
    });

    Tx.test("AllPinnedViewSyncMonitor.testErrors", function (tc) {
        setup(tc);

        var account = new Mail.Account(provider.loadObject("Account", {
                peopleViewComplete: false
            }), provider.getClient()),
            view = new Mail.UIDataModel.MailView(provider.loadObject("MailView", {
                accountId: account.objectId
            }), account);

        account.mailResource.mock$setProperty("lastSyncResult", 999999);

        var changes = 0;
        var monitor = new Mail.AllPinnedViewSyncMonitor(view);
        monitor.addListener("syncStatusChanged", function () { changes++; });

        // Error reported
        tc.areEqual(monitor.getSyncStatus(), SyncStatus.failed);
        tc.isTrue(monitor.isSyncCompleted);

        // Trumped by peopleViewComplete
        account.platformObject.mock$setProperty("peopleViewComplete", true);
        tc.areEqual(changes, 0);
        Jx.scheduler.testFlush();
        tc.areEqual(changes, 1);
        tc.areEqual(monitor.getSyncStatus(), SyncStatus.completed);
        tc.isTrue(monitor.isSyncCompleted);

        monitor.dispose();
    });

    Tx.test("AllPinnedViewSyncMonitor.testOffline", function (tc) {
        setup(tc);

        var account = new Mail.Account(provider.loadObject("Account", {
                peopleViewComplete: false
            }), provider.getClient()),
            view = new Mail.UIDataModel.MailView(provider.loadObject("MailView", {
                accountId: account.objectId
            }), account);

        account.mailResource.mock$setProperty("lastSyncResult", -52);
        isOnline = false;

        var changes = 0;
        var monitor = new Mail.AllPinnedViewSyncMonitor(view);
        monitor.addListener("syncStatusChanged", function () { changes++; });

        // People view respects offline
        tc.areEqual(monitor.getSyncStatus(), SyncStatus.offline);
        tc.isTrue(monitor.isSyncCompleted);

        // Until it is complete
        account.platformObject.mock$setProperty("peopleViewComplete", true);
        tc.areEqual(changes, 0);
        Jx.scheduler.testFlush();
        tc.areEqual(changes, 1);
        tc.areEqual(monitor.getSyncStatus(), SyncStatus.completed);
        tc.isTrue(monitor.isSyncCompleted);

        monitor.dispose();
    });

})();
