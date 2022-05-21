
//
// Copyright (C) Microsoft. All rights reserved.
//

/*global MockMailAttachment,Jx,Microsoft,WinJS,Tx,AttachmentWell,setTimeout*/

(function () {
    var imageAttachment,
        videoAttachment,
        othersAttachment;

    var mockController,
        mockHost;

    var AttachmentComposeStatus,
        AttachmentSyncStatus;

    function setup() {
        imageAttachment = new MockMailAttachment("image.jpg", "image");
        videoAttachment = new MockMailAttachment("video.wmv", "video");
        othersAttachment = new MockMailAttachment("others.doc", "doc");

        mockController = {
            onItemInvoked: Jx.fnEmpty,
            showContextMenu: Jx.fnEmpty
        };

        mockHost = {
            getContainerWidth: function () { return 1024; }
        };

        AttachmentComposeStatus = Microsoft.WindowsLive.Platform.AttachmentComposeStatus;
        AttachmentSyncStatus = Microsoft.WindowsLive.Platform.AttachmentSyncStatus;

        WinJS.UI.ItemContainer = Jx.fnEmpty;
        WinJS.UI.Tooltip = Jx.fnEmpty;
    }

    function cleanup() {
        imageAttachment = videoAttachment = othersAttachment = null;
        mockController = null;
        mockHost = null;
        WinJS.UI.ItemContainer = null;
    }

    function findClassOnChildren(div, searchClass) {
        if (div.className.indexOf(searchClass) >= 0) {
            return true;
        } else if (div.children.length === 0) {
            return false;
        } else {
            var found = false;
            for (var i = 0; i < div.children.length; i++) {
                var child = div.children[i];
                found = findClassOnChildren(child, searchClass);
                if (found) {
                    return true;
                }
            }
            return false;
        }
    }

    Tx.asyncTest("AttachmentWellComposeItem.testInProgressItem", function (tc) {
        /// <summary>Tests In Progress compose item rendering.</summary>
        tc.stop();
        tc.cleanup = cleanup;
        setup();

        imageAttachment.composeStatus = AttachmentComposeStatus.inProgress;
        var item = new AttachmentWell.Compose.Item(imageAttachment, mockController, mockHost);
        var itemDiv = item.getItemContainer();

        setTimeout(function () {
            tc.isTrue(findClassOnChildren(itemDiv, "attachmentWell-item-progress"));
            tc.start();
        }, 100);
    });

    Tx.asyncTest("AttachmentWellComposeItem.testFailedItem", function (tc) {
        /// <summary>Tests Failed compose item rendering.</summary>
        tc.stop();
        tc.cleanup = cleanup;
        setup();

        imageAttachment.composeStatus = AttachmentComposeStatus.failed;
        var item = new AttachmentWell.Compose.Item(imageAttachment, mockController, mockHost);
        var itemDiv = item.getItemContainer();

        setTimeout(function () {
            tc.isTrue(findClassOnChildren(itemDiv, "attachmentWell-item-error"));
            tc.start();
        }, 100);
    });

    Tx.asyncTest("AttachmentWellComposeItem.testDoneOtherItem", function (tc) {
        /// <summary>Tests Done Other compose item rendering.</summary>
        tc.stop();
        tc.cleanup = cleanup;
        setup();

        othersAttachment.composeStatus = AttachmentComposeStatus.done;
        othersAttachment.size = 100;
        var item = new AttachmentWell.Compose.Item(othersAttachment, mockController, mockHost);
        var itemDiv = item.getItemContainer();

        setTimeout(function () {
            tc.isTrue(findClassOnChildren(itemDiv, "attachmentWell-item-downloaded"));
            tc.isTrue(findClassOnChildren(itemDiv, "attachmentWell-item-other"));
            tc.start();
        }, 100);
    });

    Tx.asyncTest("AttachmentWellReadItem.testFailedImageItem", function (tc) {
        /// <summary>Tests Failed read item rendering.</summary>
        tc.stop();
        tc.cleanup = cleanup;
        setup();

        imageAttachment.syncStatus = AttachmentSyncStatus.failed;
        imageAttachment.size = 9999;
        var item = new AttachmentWell.Read.Item(imageAttachment, mockController, mockHost);
        var itemDiv = item.getItemContainer();

        setTimeout(function () {
            tc.isTrue(findClassOnChildren(itemDiv, "attachmentWell-item-notDownloaded"));
            tc.isTrue(findClassOnChildren(itemDiv, "attachmentWell-item-photoVideo"));
            tc.start();
        }, 100);
    });

    Tx.asyncTest("AttachmentWellReadItem.testNotStartedOtherItem", function (tc) {
        /// <summary>Tests NotStarted read item rendering.</summary>
        tc.stop();
        tc.cleanup = cleanup;
        setup();

        othersAttachment.syncStatus = AttachmentSyncStatus.notStarted;
        othersAttachment.size = 101001;
        var item = new AttachmentWell.Read.Item(othersAttachment, mockController, mockHost);
        var itemDiv = item.getItemContainer();

        setTimeout(function () {
            tc.isTrue(findClassOnChildren(itemDiv, "attachmentWell-item-notDownloaded"));
            tc.isTrue(findClassOnChildren(itemDiv, "attachmentWell-item-other"));
            tc.start();
        }, 100);
    });

})();