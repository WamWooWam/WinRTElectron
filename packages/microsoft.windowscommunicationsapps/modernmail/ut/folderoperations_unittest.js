
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
//

(function () {

    var P = Microsoft.WindowsLive.Platform,
        D = Mocks.Microsoft.WindowsLive.Platform.Data,
        FolderOperations = Mail.Commands.FolderOperations,
        MailView = Mail.UIDataModel.MailView;

    var provider, defaultAccount, selection, inbox, deleted;
    function setup(tc) {
        tc.cleanup = function () { };

        provider = new D.JsonProvider({
            Account: {
                all: [
                    { objectId: "account", }
                ]
            },
            Folder: {
                all: [
                    {
                        accountId: "account",
                        objectId: "inboxFolder",
                        folderName: "Inbox",
                        folderType: P.FolderType.mail,
                        specialMailFolderType: P.MailFolderType.inbox,
                        canRename: false,
                        canMove: false,
                    }, {
                        accountId: "account",
                        objectId: "deletedFolder",
                        folderName: "Deleted",
                        folderType: P.FolderType.mail,
                        specialMailFolderType: P.MailFolderType.deletedItems,
                        canRename: false,
                        canMove: false,
                    }, {
                        accountId: "account",
                        objectId: "draftFolder",
                        folderName: "Drafts",
                        folderType: P.FolderType.mail,
                        specialMailFolderType: P.MailFolderType.drafts,
                        canRename: false,
                        canMove: false,
                    }, {
                        accountId: "account",
                        objectId: "sentFolder",
                        folderName: "Sent",
                        folderType: P.FolderType.mail,
                        specialMailFolderType: P.MailFolderType.sentItems,
                        canRename: false,
                        canMove: false,
                    }, {
                        accountId: "account",
                        objectId: "outboxFolder",
                        folderName: "Outbox",
                        folderType: P.FolderType.mail,
                        specialMailFolderType: P.MailFolderType.outbox,
                        canRename: false,
                        canMove: false,
                    }, {
                        accountId: "account",
                        objectId: "junkFolder",
                        folderName: "Junk",
                        folderType: P.FolderType.mail,
                        specialMailFolderType: P.MailFolderType.junkMail,
                        canRename: false,
                        canMove: false,
                    }, {
                        accountId: "account",
                        objectId: "otherFolder",
                        folderName: "OtherFolder",
                        folderType: P.FolderType.mail,
                        specialMailFolderType: P.MailFolderType.userGenerated,
                    }, {
                        accountId: "account",
                        objectId: "userFolder",
                        folderName: "UserFolder",
                        folderType: P.FolderType.mail,
                        specialMailFolderType: P.MailFolderType.userGenerated,
                        parentFolder: { objectId: "otherFolder" },
                    }
                ]
            },
            MailView: {
                all: [
                    {
                        accountId: "account",
                        objectId: "inboxView",
                        mock$sourceObjectId: "inboxFolder",
                        type: P.MailViewType.inbox
                    }, {
                        accountId: "account",
                        objectId: "deletedView",
                        mock$sourceObjectId: "deletedFolder",
                        type: P.MailViewType.deletedItems
                    }, {
                        accountId: "account",
                        objectId: "draftView",
                        mock$sourceObjectId: "draftFolder",
                        type: P.MailViewType.draft
                    }, {
                        accountId: "account",
                        objectId: "sentView",
                        mock$sourceObjectId: "sentFolder",
                        type: P.MailViewType.sentItems
                    }, {
                        accountId: "account",
                        objectId: "outboxView",
                        mock$sourceObjectId: "outboxFolder",
                        type: P.MailViewType.outbox
                    }, {
                        accountId: "account",
                        objectId: "junkView",
                        mock$sourceObjectId: "junkFolder",
                        type: P.MailViewType.junkMail
                    }, {
                        accountId: "account",
                        objectId: "otherView",
                        mock$sourceObjectId: "otherFolder",
                        type: P.MailViewType.userGeneratedFolder,
                    }, {
                        accountId: "account",
                        objectId: "userView",
                        mock$sourceObjectId: "userFolder",
                        type: P.MailViewType.userGeneratedFolder,
                    }, {
                        accountId: "account",
                        objectId: "flaggedView",
                        type: P.MailViewType.flagged,
                    }, {
                        accountId: "account",
                        objectId: "otherFolderView",
                        type: P.MailViewType.userGeneratedFolder,
                        mock$sourceObjectId: "otherFolder",
                    }
                ]
            },
            MailMessage: {
                all: [
                    {
                        objectId: "unreadMessage",
                        displayViewIds: ["otherFolderView"],
                        from: "foo@example.com",
                        subject: "Stuff",
                        to: "bar@example.com",
                        read: false,
                    }
                ]
            }
        }, D.MethodHandlers);

        defaultAccount = new Mail.Account(provider.getObjectById("account"), provider.getClient());
        selection = { account: defaultAccount };
    }

    var emptyFolder = "MailFolderOperations.EmptyFolder",
        markRead = "MailFolderOperations.MarkAsRead",
        newFolder = "MailFolderOperations.NewFolder",
        newSubFolder = "MailFolderOperations.NewSubFolder",
        deleteFolder = "MailFolderOperations.DeleteFolder",
        renameFolder = "MailFolderOperations.RenameFolder",
        pin = "MailFolderOperations.pinFolder",
        unpin = "MailFolderOperations.unpinFolder",
        separator = "MailFolderOperations.Separator";

    Tx.test("FolderOperations.inboxCommands", function (tc) {
        setup(tc);
        var expected, commands;

        selection.view = new MailView(provider.getObjectById("inboxView"), defaultAccount);

        // Can't delete or rename the inbox. The inbox is also empty
        // so can only create new (sub)folders and pin it
        expected = [ newFolder, newSubFolder, pin ];
        commands = FolderOperations._createCommandList("", selection);

        tc.areEqual(commands.length, expected.length, "extra commands");
        commands.forEach(function (cmd, i) {
            tc.areEqual(cmd.id, expected[i], "unexpected command: " + cmd.id);
        });

        // Put an unread message in the inbox
        var message = provider.getObjectById("unreadMessage");
        message.mock$setProperty("displayViewIds", ["inboxView"]);
        message.commit();
        selection.messages = [message];

        expected = [ emptyFolder, markRead, separator, newFolder, newSubFolder, pin ];
        commands = FolderOperations._createCommandList("", selection);

        tc.areEqual(commands.length, expected.length, "extra commands");
        commands.forEach(function (cmd, i) {
            tc.areEqual(cmd.id, expected[i], "unexpected command: " + cmd.id);
        });

        // Mark the inbox as read, the message should be updated
        var called = 0;
        selection.markViewRead = function () {
            called++;
            message.mock$setProperty("read", true);
            message.commit();
        };
        commands[1].onclick();
        tc.areEqual(1, called, "markViewRead called incorrect number of times: " + called);

        // Mark as read should no longer show
        expected = [ emptyFolder, separator, newFolder, newSubFolder, pin ];
        commands = FolderOperations._createCommandList("", selection);

        tc.areEqual(commands.length, expected.length, "extra commands");
        commands.forEach(function (cmd, i) {
            tc.areEqual(cmd.id, expected[i], "unexpected command: " + cmd.id);
        });
    });

    Tx.test("FolderOperations.deletedCommands", function (tc) {
        setup(tc);
        var expected, commands;

        var deletedView = provider.getObjectById("deletedView");
        selection.view = new MailView(deletedView, defaultAccount);

        // Can't delete or rename deleted items. Deleted is empty
        // so can only create new (sub)folders and pin it
        expected = [ newFolder, newSubFolder, pin ];
        commands = FolderOperations._createCommandList("", selection);

        tc.areEqual(commands.length, expected.length, "extra commands");
        commands.forEach(function (cmd) {
            tc.areEqual(cmd.id, expected.shift(), "unexpected command: " + cmd.id);
        });

        // Add a folder to deleted items, should be able to empty now
        var collection = deletedView.sourceObject.getChildFolderCollection(false);
        collection.mock$addItem(provider.getObjectById("userView"), 0);

        expected = [ emptyFolder, separator, newFolder, newSubFolder, pin ];
        commands = FolderOperations._createCommandList("", selection);

        tc.areEqual(commands.length, expected.length, "extra commands");
        commands.forEach(function (cmd) {
            tc.areEqual(cmd.id, expected.shift(), "unexpected command: " + cmd.id);
        });
    });

    Tx.test("FolderOperations.userFolderCommands", function (tc) {
        setup(tc);
        var expected, commands;

        selection.view = new MailView(provider.getObjectById("userView"), defaultAccount);

        // Should be able to delete and rename in addition to other commands
        expected = [ newFolder, newSubFolder, renameFolder, deleteFolder, pin ];
        commands = FolderOperations._createCommandList("", selection);

        tc.areEqual(commands.length, expected.length, "extra commands");
        commands.forEach(function (cmd) {
            tc.areEqual(cmd.id, expected.shift(), "unexpected command: " + cmd.id);
        });

    });

    Tx.test("FolderOperations.flaggedViewCommands", function (tc) {
        setup(tc);
        var expected, commands;

        selection.view = new MailView(provider.getObjectById("flaggedView"), defaultAccount);

        // Can only pin/unpin the flagged view
        expected = [ pin ];
        commands = FolderOperations._createCommandList("", selection);

        tc.areEqual(commands.length, expected.length, "extra commands");
        commands.forEach(function (cmd) {
            tc.areEqual(cmd.id, expected.shift(), "unexpected command: " + cmd.id);
        });
    });

})();
