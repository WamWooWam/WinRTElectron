
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

    Tx.test("FolderViewSyncMonitor.testLocal", function (tc) {
        setup(tc);

        var account = new Mail.Account(provider.loadObject("Account", {}), provider.getClient()),
            folder = provider.loadObject("Folder", {
                folderType: Plat.FolderType.mail,
                specialMailFolderType: Plat.MailFolderType.drafts,
                isLocalMailFolder: true,
                syncFolderContents: false,
                syncStatus: 0,
                hasSynced: false,
                hasProcessedConversations: false
            }),
            view = new Mail.UIDataModel.MailView(provider.loadObject("MailView", { 
                type: Plat.MailViewType.userGeneratedFolder,
                mock$sourceObjectId: folder.objectId,
                accountId: account.objectId
            }), account);

        var monitor = new Mail.FolderViewSyncMonitor(view);

        tc.areEqual(monitor.getSyncStatus(), SyncStatus.completed);
        tc.isTrue(monitor.isSyncCompleted);

        // Local folder never syncs
        folder.mock$setProperty("syncStatus", -2147483638 /* E_PENDING */);
        Jx.scheduler.testFlush();
        tc.areEqual(monitor.getSyncStatus(), SyncStatus.completed);
        tc.isTrue(monitor.isSyncCompleted);

        // Local folders never fail
        folder.mock$setProperty("syncStatus", 123456789);
        Jx.scheduler.testFlush();
        tc.areEqual(monitor.getSyncStatus(), SyncStatus.completed);
        tc.isTrue(monitor.isSyncCompleted);

        // Local folders have no sync window
        account.mailResource.mock$setProperty("syncWindowSize", Plat.SyncWindowSize.oneDay);
        tc.areEqual(monitor.getSyncWindow(), Plat.SyncWindowSize.all);

        monitor.dispose();
    });

    Tx.test("FolderViewSyncMonitor.testFolderSync", function (tc) {
        setup(tc);

        var account = new Mail.Account(provider.loadObject("Account", {}), provider.getClient()),
            folder = provider.loadObject("Folder", {
                folderType: Plat.FolderType.mail,
                specialMailFolderType: Plat.MailFolderType.userGenerated,
                isLocalMailFolder: false,
                syncFolderContents: false,
                syncStatus: 0,
                hasSynced: false,
                hasProcessedConversations: false
            }),
            view = new Mail.UIDataModel.MailView(provider.loadObject("MailView", { 
                type: Plat.MailViewType.userGeneratedFolder,
                mock$sourceObjectId: folder.objectId,
                accountId: account.objectId
            }), account);

        var monitor = new Mail.FolderViewSyncMonitor(view);

        // Not configured for sync yet
        tc.areEqual(monitor.getSyncStatus(), SyncStatus.notStarted);
        tc.isFalse(monitor.isSyncCompleted);

        // Syncing
        folder.mock$setProperty("syncStatus",  -2147483638 /* E_PENDING */);
        folder.mock$setProperty("syncFolderContents", true);
        Jx.scheduler.testFlush();
        tc.areEqual(monitor.getSyncStatus(), SyncStatus.syncing);
        tc.isFalse(monitor.isSyncCompleted);

        folder.mock$setProperty("syncStatus", Plat.Result.e_NEXUS_SYNC_SYNCKEY);
        Jx.scheduler.testFlush();
        tc.areEqual(monitor.getSyncStatus(), SyncStatus.syncing);
        tc.isFalse(monitor.isSyncCompleted);

        folder.mock$setProperty("syncStatus", 0);
        Jx.scheduler.testFlush();
        tc.areEqual(monitor.getSyncStatus(), SyncStatus.syncing);
        tc.isFalse(monitor.isSyncCompleted);

        // Sync complete
        folder.mock$setProperty("hasSynced", true);
        folder.mock$setProperty("hasProcessedConversations", true);
        Jx.scheduler.testFlush();
        tc.areEqual(monitor.getSyncStatus(), SyncStatus.completed);
        tc.isTrue(monitor.isSyncCompleted);

        // Syncing again
        folder.mock$setProperty("syncStatus",  -2147483638 /* E_PENDING */);
        Jx.scheduler.testFlush();
        tc.areEqual(monitor.getSyncStatus(), SyncStatus.syncing);
        tc.isFalse(monitor.isSyncCompleted);

        // Error
        folder.mock$setProperty("syncStatus", 987654321);
        Jx.scheduler.testFlush();
        tc.areEqual(monitor.getSyncStatus(), SyncStatus.failed);
        tc.isTrue(monitor.isSyncCompleted);
    });

})();
