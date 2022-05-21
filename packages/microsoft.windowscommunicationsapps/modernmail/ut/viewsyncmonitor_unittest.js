
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

    Tx.test("ViewSyncMonitor.testSuccess", function (tc) {
        setup(tc);

        var account = new Mail.Account(provider.loadObject("Account", {}), provider.getClient()),
            view = new Mail.UIDataModel.MailView(provider.loadObject("MailView", {
                accountId: account.objectId
            }), account);

        account.mailResource.mock$setProperty("lastSyncResult", Plat.Result.authNotAttempted);

        var changes = 0;
        var monitor = new Mail.ViewSyncMonitor(view);
        monitor.addListener("syncStatusChanged", function () { changes++; });

        // Sync not started
        tc.isFalse(monitor.isSyncCompleted);
        tc.areEqual(monitor.getSyncStatus(), SyncStatus.notStarted);

        // Sync begins
        account.mailResource.mock$setProperty("isSynchronizing", true);
        tc.areEqual(changes, 0);
        Jx.scheduler.testFlush();
        tc.areEqual(changes, 1);
        tc.isFalse(monitor.isSyncCompleted);
        tc.areEqual(monitor.getSyncStatus(), SyncStatus.syncing);

        // Stopped syncing, into success state
        account.mailResource.mock$setProperty("lastSyncResult", 0);
        account.mailResource.mock$setProperty("isSynchronizing", false);
        tc.areEqual(changes, 1);
        Jx.scheduler.testFlush();
        tc.areEqual(changes, 2);
        tc.isTrue(monitor.isSyncCompleted);
        tc.areEqual(monitor.getSyncStatus(), SyncStatus.completed);

        monitor.dispose();
    });

    Tx.test("ViewSyncMonitor.testOffline", function (tc) {
        setup(tc);

        var account = new Mail.Account(provider.loadObject("Account", {}), provider.getClient()),
            view = new Mail.UIDataModel.MailView(provider.loadObject("MailView", {
                accountId: account.objectId
            }), account);

        account.mailResource.mock$setProperty("lastSyncResult", -52);
        isOnline = false;

        var changes = 0;
        var monitor = new Mail.ViewSyncMonitor(view);
        monitor.addListener("syncStatusChanged", function () { changes++; });

        // Starts offline
        tc.areEqual(monitor.getSyncStatus(), SyncStatus.offline);
        tc.isTrue(monitor.isSyncCompleted);

        // Syncing resource trumps offline network status
        account.mailResource.mock$setProperty("isSynchronizing", true);
        tc.areEqual(changes, 0);
        Jx.scheduler.testFlush();
        tc.areEqual(changes, 1);
        tc.areEqual(monitor.getSyncStatus(), SyncStatus.syncing);
        tc.isFalse(monitor.isSyncCompleted);

        // Stopped syncing, back to offline
        account.mailResource.mock$setProperty("isSynchronizing", false);
        tc.areEqual(changes, 1);
        Jx.scheduler.testFlush();
        tc.areEqual(changes, 2);
        tc.areEqual(monitor.getSyncStatus(), SyncStatus.offline);
        tc.isTrue(monitor.isSyncCompleted);

        // Goes online, into error state
        isOnline = true;
        Jx.EventManager.fire(Jx.root, "connectivityChanged");
        tc.areEqual(changes, 2);
        Jx.scheduler.testFlush();
        tc.areEqual(changes, 3);
        tc.areEqual(monitor.getSyncStatus(), SyncStatus.failed);
        tc.isTrue(monitor.isSyncCompleted);

        monitor.dispose();
    });

    Tx.test("ViewSyncMonitor.testSyncWindow", function (tc) {
        setup(tc);

        var account = new Mail.Account(provider.loadObject("Account", {}), provider.getClient()),
            view = new Mail.UIDataModel.MailView(provider.loadObject("MailView", {
                accountId: account.objectId
            }), account);
        account.mailResource.mock$setProperty("syncWindowSize", Plat.SyncWindowSize.all);

        var changes = 0;
        var monitor = new Mail.ViewSyncMonitor(view);
        monitor.addListener("syncWindowChanged", function () { changes++; });

        tc.areEqual(monitor.getSyncWindow(), Plat.SyncWindowSize.all);

        account.mailResource.mock$setProperty("syncWindowSize", Plat.SyncWindowSize.threeDays);
        tc.areEqual(changes, 1);
        tc.areEqual(monitor.getSyncWindow(), Plat.SyncWindowSize.threeDays);

        monitor.dispose();
    });

})();

