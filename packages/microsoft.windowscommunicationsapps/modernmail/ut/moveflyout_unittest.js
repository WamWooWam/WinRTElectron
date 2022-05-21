
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Microsoft,Mocks,WinJS,Tx*/

(function () {

    var P = Microsoft.WindowsLive.Platform,
        D = Mocks.Microsoft.WindowsLive.Platform.Data;

    var sandbox, provider;
    function setup(tc) {
        sandbox = document.createElement("div");
        document.body.appendChild(sandbox);
        sandbox.innerHTML = "<button id='move'></button>";

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
                        objectId: "deletedFolder",
                        folderName: "Deleted",
                        folderType: P.FolderType.mail,
                        specialMailFolderType: P.MailFolderType.deletedItems
                    }, {
                        accountId: "account",
                        objectId: "draftFolder",
                        folderName: "Drafts",
                        folderType: P.FolderType.mail,
                        specialMailFolderType: P.MailFolderType.drafts
                    }, {
                        accountId: "account",
                        objectId: "sentFolder",
                        folderName: "Sent",
                        folderType: P.FolderType.mail,
                        specialMailFolderType: P.MailFolderType.sentItems
                    }, {
                        accountId: "account",
                        objectId: "outboxFolder",
                        folderName: "Outbox",
                        folderType: P.FolderType.mail,
                        specialMailFolderType: P.MailFolderType.outbox
                    }, {
                        accountId: "account",
                        objectId: "junkFolder",
                        folderName: "Junk",
                        folderType: P.FolderType.mail,
                        specialMailFolderType: P.MailFolderType.junkMail
                    }, {
                        accountId: "account",
                        objectId: "escapedFolder",
                        folderName: "&<>\"'`!@$%()=+{}[],",
                        folderType: P.FolderType.mail,
                        specialMailFolderType: P.MailFolderType.userGenerated
                    }, {
                        accountId: "account",
                        objectId: "cFolder",
                        folderName: "C",
                        folderType: P.FolderType.mail,
                        specialMailFolderType: P.MailFolderType.userGenerated
                    }, {
                        accountId: "account",
                        objectId: "bFolder",
                        folderName: "B",
                        folderType: P.FolderType.mail,
                        specialMailFolderType: P.MailFolderType.userGenerated
                    }, {
                        accountId: "account",
                        objectId: "a123456Folder",
                        folderName: "A123456",
                        folderType: P.FolderType.mail,
                        specialMailFolderType: P.MailFolderType.userGenerated,
                        parentFolder: { objectId: "a12345Folder" }
                    }, {
                        accountId: "account",
                        objectId: "a12345Folder",
                        folderName: "A12345",
                        folderType: P.FolderType.mail,
                        specialMailFolderType: P.MailFolderType.userGenerated,
                        parentFolder: { objectId: "a1234Folder" }
                    }, {
                        accountId: "account",
                        objectId: "a1234Folder",
                        folderName: "A1234",
                        folderType: P.FolderType.mail,
                        specialMailFolderType: P.MailFolderType.userGenerated,
                        parentFolder: { objectId: "a123Folder" }
                    }, {
                        accountId: "account",
                        objectId: "a123Folder",
                        folderName: "A123",
                        folderType: P.FolderType.mail,
                        specialMailFolderType: P.MailFolderType.userGenerated,
                        parentFolder: { objectId: "a12Folder" }
                    }, {
                        accountId: "account",
                        objectId: "a12Folder",
                        folderName: "A12",
                        folderType: P.FolderType.mail,
                        specialMailFolderType: P.MailFolderType.userGenerated,
                        parentFolder: { objectId: "a1Folder" }
                    }, {
                        accountId: "account",
                        objectId: "a1Folder",
                        folderName: "A1",
                        folderType: P.FolderType.mail,
                        specialMailFolderType: P.MailFolderType.userGenerated,
                        parentFolder: { objectId: "aFolder" }
                    }, {
                        accountId: "account",
                        objectId: "aFolder",
                        folderName: "A",
                        folderType: P.FolderType.mail,
                        specialMailFolderType: P.MailFolderType.userGenerated
                    }, {
                        accountId: "account",
                        objectId: "inbox1Folder",
                        folderName: "Inbox1",
                        folderType: P.FolderType.mail,
                        specialMailFolderType: P.MailFolderType.userGenerated,
                        parentFolder: { objectId: "inboxFolder" }
                    }, {
                        accountId: "account",
                        objectId: "inboxFolder",
                        folderName: "Inbox",
                        folderType: P.FolderType.mail,
                        specialMailFolderType: P.MailFolderType.inbox
                    }
                ]
            },
            MailView: {
                all: [
                    {
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
                        objectId: "escapedView",
                        mock$sourceObjectId: "escapedFolder",
                        type: P.MailViewType.userGeneratedFolder
                    }, {
                        accountId: "account",
                        objectId: "cView",
                        mock$sourceObjectId: "cFolder",
                        type: P.MailViewType.userGeneratedFolder
                    }, {
                        accountId: "account",
                        objectId: "bView",
                        mock$sourceObjectId: "bFolder",
                        type: P.MailViewType.userGeneratedFolder
                    }, {
                        accountId: "account",
                        objectId: "a123456View",
                        mock$sourceObjectId: "a123456Folder",
                        type: P.MailViewType.userGeneratedFolder,
                    }, {
                        accountId: "account",
                        objectId: "a12345View",
                        mock$sourceObjectId: "a12345Folder",
                        type: P.MailViewType.userGeneratedFolder,
                    }, {
                        accountId: "account",
                        objectId: "a1234View",
                        mock$sourceObjectId: "a1234Folder",
                        type: P.MailViewType.userGeneratedFolder,
                    }, {
                        accountId: "account",
                        objectId: "a123View",
                        mock$sourceObjectId: "a123Folder",
                        type: P.MailViewType.userGeneratedFolder,
                    }, {
                        accountId: "account",
                        objectId: "a12View",
                        mock$sourceObjectId: "a12Folder",
                        type: P.MailViewType.userGeneratedFolder,
                    }, {
                        accountId: "account",
                        objectId: "a1View",
                        mock$sourceObjectId: "a1Folder",
                        type: P.MailViewType.userGeneratedFolder,
                    }, {
                        accountId: "account",
                        objectId: "aView",
                        mock$sourceObjectId: "aFolder",
                        type: P.MailViewType.userGeneratedFolder
                    }, {
                        accountId: "account",
                        objectId: "inbox1View",
                        mock$sourceObjectId: "inbox1Folder",
                        type: P.MailViewType.userGeneratedFolder,
                    }, {
                        accountId: "account",
                        objectId: "inboxView",
                        mock$sourceObjectId: "inboxFolder",
                        type: P.MailViewType.inbox
                    }
                ]
            },
            MailMessage: {
                all: [
                    {
                        objectId: "message",
                        displayViewIds: ["inboxView"],
                        from: "foo@example.com",
                        subject: "Stuff",
                        to: "bar@example.com"
                    }
                ]
            }
        }, D.MethodHandlers);

        WinJS.UI.disableAnimations();

        tc.cleanup = function () {
            sandbox.removeNode(true);
            sandbox = null;

            provider = null;

            WinJS.UI.enableAnimations();
        };
    }

    Tx.asyncTest("MoveFlyout.testContent", function (tc) {
        setup(tc);
        tc.stop();

        var account = new Mail.Account(provider.getObjectById("account"), provider.getClient()),
            selection = {
                account: account,
                view: new Mail.UIDataModel.MailView(provider.getObjectById("inboxView"), account),
                messages: [new Mail.UIDataModel.MailMessage(provider.getObjectById("message"), account)],
            };

        Mail.MoveFlyout.showMoveFlyout(sandbox, selection, "move").done(function () {

            var elems = sandbox.querySelectorAll("button.moveTarget");

            // Sorted like as expected with drafts and outbox excluded and at the right depth (capped at 5)
            var names = [ "Inbox", "Inbox1", "Sent", "Junk", "Deleted", "&<>\"'`!@$%()=+{}[],",
                "A", "A1", "A12", "A123", "A1234", "A12345", "A123456", "B", "C" ];
            var depth = [ 0, 1, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 0, 0 ];

            tc.areEqual(elems.length, names.length);
            tc.areEqual(elems.length, depth.length);

            names.forEach(function (n, i) { tc.areEqual(n, elems[i].innerText); });
            depth.forEach(function (d, i) { tc.isTrue(elems[i].classList.contains("depth" + d)); });

            // Validate the indentation of a depth 5 and depth 6 item is the same
            var depth5 = getComputedStyle(sandbox.querySelector(".moveTarget.depth5"));
            var depth6 = getComputedStyle(sandbox.querySelector(".moveTarget.depth6"));
            tc.areEqual(depth5.paddingLeft, depth6.paddingLeft);
            tc.areEqual(depth5.paddingRight, depth6.paddingRight);

            // Make sure the flyout is dismissed
            sandbox.firstElementChild.click();

            tc.start();
        });

    });

})();
