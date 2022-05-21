
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
//

(function () {

    var P = Microsoft.WindowsLive.Platform,
        Type = P.MailViewType,
        MP = Mocks.Microsoft.WindowsLive.Platform;

    nextId = 1;
    function mockFolder(all, name, parentView, type) {
        var view = {
            objectId: String(nextId++),
            type: type,
            name: name,
            mockedType: Mail.UIDataModel.MailView,
            addListener: function () { },
            removeListener: function () { },
            folder: {
                objectId: String(nextId++),
                folderName: name,
                folderType: P.FolderType.mail,
                parentFolder: parentView ? parentView.folder : null,
                addListener: function () { },
                removeListener: function () { },
            },
        };
        view.sourceObject = view.folder;

        all.insertItem(view, all.count);
        return view;
    }
    function mockUser(all, name, parentFolder) { return mockFolder(all, name, parentFolder, Type.userGeneratedFolder); }
    function mockSpecial(all, name, type) { return mockFolder(all, name, null, type); }

    function setup (tc) {
        tc.cleanup = function () { Mail.UnitTest.restoreJx("res"); };
        Mail.UnitTest.stubJx(tc, "res");
    }

    Tx.test("ViewHierarchy.sort", function (tc) {
        setup(tc);

        var allFolders = new Mail.ArrayCollection([]);
        allFolders.unlock();

        // Populate all folders in an unordered fashion
        var z = mockUser(allFolders, "Z", null);
        var z_2 = mockUser(allFolders, "Z_2", z);
        var junk = mockSpecial(allFolders, "Junk", Type.junkMail);
        var outbox = mockSpecial(allFolders, "Outbox", Type.outbox);
        var drafts = mockSpecial(allFolders, "Drafts", Type.draft);
        var deleted = mockSpecial(allFolders, "Deleted", Type.deletedItems);
        var inbox = mockSpecial(allFolders, "Inbox", Type.inbox);
        var deleted_1 = mockUser(allFolders, "Deleted_1", deleted);
        var z_1 = mockUser(allFolders, "Z_1", z);
        var z_1_i = mockUser(allFolders, "Z_1_i", z_1);
        var inbox_1 = mockUser(allFolders, "Inbox_1", inbox);
        var inbox_2 = mockUser(allFolders, "Inbox_2", inbox);
        var a = mockUser(allFolders, "A", null);
        var inbox_2_i = mockUser(allFolders, "Inbox_2_i", inbox_2);
        var sent = mockSpecial(allFolders, "Sent", Type.sentItems);
        var q = mockUser(allFolders, "Q", null);
        var q_1 = mockUser(allFolders, "Q_1", q);

        var expectedOrder = [
            inbox,
                inbox_1,
                inbox_2,
                    inbox_2_i,
            drafts,
            sent,
            outbox,
            junk,
            deleted,
                deleted_1,
            a,
            q,
                q_1,
            z,
                z_1,
                    z_1_i,
                z_2
        ];

        var tree = new Mail.TreeFlattener(new Mail.ViewHierarchy(allFolders));

        // Validate the sort
        expectedOrder.forEach(function (expected, index) {
            var actual = tree.item(index);
            tc.areEqual(expected.name, actual.view.name);
        });
    });

})();
