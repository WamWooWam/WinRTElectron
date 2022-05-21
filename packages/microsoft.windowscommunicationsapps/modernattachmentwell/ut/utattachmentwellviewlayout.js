
//
// Copyright (C) Microsoft. All rights reserved.
//
/*global AttachmentWell,Jx,MockCollection,MockMailAttachment,MockMailMessage,document,window,Tx*/

(function () {

    var mockMessage;
    var attachments;
    var host;

    function setup() {
        attachments = new MockCollection();
        attachments.add(new MockMailAttachment("image.jpg", "image"));
        attachments.add(new MockMailAttachment("document.doc", "doc"));
        attachments.add(new MockMailAttachment("video.wmv", "video"));

        mockMessage = new MockMailMessage(attachments);
        host = document.getElementById("hostContainer");
    }

    function cleanup() {
        mockMessage = null;
        attachments = null;
        host.innerHTML = "";
    }

    function getNumberOfFilesCount(tc) {
        /// <summary>Returns the integer displayed by the number of files control.</summary>
        var numberOfFilesDiv = host.querySelector(".attachmentWell-numberOfFiles");
        tc.isNotNull(numberOfFilesDiv);
        var match = numberOfFilesDiv.innerText.match(/\d+/);
        tc.isNotNull(match);
        tc.areEqual(match.length, 1);
        return parseInt(match[0], 10);
    }

    function sendClick(element) {
        var evt = document.createEvent("MouseEvent");
        evt.initMouseEvent("click", true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
        element.dispatchEvent(evt);
    }

    Tx.test("AttachmentWellViewLayout.testFileGroupOrdering", function (tc) {
        /// <summary>Tests that photo/video files are ordered before non-photo/video files
        /// and each file group preserves the same ordering as in the attachment collection.</summary>
        tc.cleanup = cleanup;
        setup();

        var composeView = new AttachmentWell.Compose.ViewLayout(mockMessage);
        tc.areEqual(attachments.count, composeView._attachmentCollection.count);

        var sortedList = composeView._getSortedBindingList();

        // The display order should now be: image, video, document
        tc.areEqual(sortedList.getItem(0).data, attachments.item(0).objectId);
        tc.areEqual(sortedList.getItem(1).data, attachments.item(2).objectId);
        tc.areEqual(sortedList.getItem(2).data, attachments.item(1).objectId);

        // add another image item
        var image2 = new MockMailAttachment("image2.jpg", "image2");
        attachments.add(image2);
        sortedList.push(image2.objectId);

        // The display order should now be: image, video, image2, document
        tc.areEqual(sortedList.getItem(0).data, attachments.item(0).objectId);
        tc.areEqual(sortedList.getItem(1).data, attachments.item(2).objectId);
        tc.areEqual(sortedList.getItem(2).data, attachments.item(3).objectId); // this is image2
        tc.areEqual(sortedList.getItem(3).data, attachments.item(1).objectId);
    });

    Tx.asyncTest("AttachmentWellViewLayout.testFilesAttached_numberOfFiles", function (tc) {
        /// <summary>Tests that the number of files attached is shown correctly.</summary>
        tc.stop();
        tc.cleanup = cleanup;
        setup();

        // initialize the view and check that the number of files are correct upon initialization
        var composeView = new AttachmentWell.Compose.ViewLayout(mockMessage);
        composeView._getItemTemplate = function () {
            return document.createElement("div");
        };
        composeView.initUI(host);
        composeView.getElement().style.width = "1024px";

        setTimeout(function () {
            tc.areEqual(attachments.count, getNumberOfFilesCount(tc));

            // add another image item, check count
            var image2 = new MockMailAttachment("image2.jpg", "image2");
            attachments.add(image2);
            composeView._updateCount();
            tc.areEqual(attachments.count, getNumberOfFilesCount(tc));

            // remove image image item, check count
            attachments.remove(image2);
            composeView._updateCount();
            tc.areEqual(attachments.count, getNumberOfFilesCount(tc));
            tc.start();
        }, 100);
    });

    Tx.test("AttachmentWellViewLayout.testFilesAttached_showHideView", function (tc) {
        /// <summary>Tests that the view is hidden when there are no files attached.</summary>
        tc.cleanup = cleanup;
        setup();

        // initialize the view and check that the view is visible upon initialization
        // since the collection is not empty.
        var composeView = new AttachmentWell.Compose.ViewLayout(mockMessage);
        composeView._getItemTemplate = function () {
            return document.createElement("div");
        };
        composeView.initUI(host);
        tc.isFalse(composeView.isHidden);

        // remove all files and check that the view is set to hidden
        for (var i = 0, count = attachments.count; i < count; i++) {
            attachments.remove(attachments.item(0));
        }
        composeView._updateCount();
        tc.isTrue(composeView.isHidden);
    });

    Tx.asyncTest("AttachmentWellViewLayout.testFilesAttached_expandCollapse", function (tc) {
        /// <summary>Tests that the view expands and collapses accordingly.</summary>
        tc.stop();
        tc.cleanup = cleanup;
        setup();

        // initialize the view and check that the view is expanded upon initialization
        // since the collection is not empty.
        var composeView = new AttachmentWell.Compose.ViewLayout(mockMessage);
        composeView._getItemTemplate = function () {
            return document.createElement("div");
        };
        composeView.initUI(host);
        composeView.getElement().style.width = "1024px";
        var expandCollapseElement = composeView._filesAttachedControl._element;
        sendClick(expandCollapseElement);

        setTimeout(function () {
            tc.isTrue(composeView.isCollapsed);
            tc.start();
        }, 100);
    });

    Tx.test("AttachmentWellViewLayout.testDownloadSaveAll_showHideControl", function (tc) {
        /// <summary>Tests that the download all / save all link is shown or hidden correctly
        // based on the number of files attached.</summary>
        tc.cleanup = cleanup;
        setup();

        // initialize the view and check that the view is expanded upon initialization
        // since the collection is not empty.
        var readView = new AttachmentWell.Read.ViewLayout(mockMessage);
        readView._getItemTemplate = function () {
            return document.createElement("div");
        };
        readView.initUI(host);
        
        // get the link divs
        var downloadAllDiv = host.querySelector(".attachmentWell-downloadAll"),
            saveAllDiv = host.querySelector(".attachmentWell-saveAll");
        tc.isNotNull(downloadAllDiv);
        tc.isNotNull(saveAllDiv);

        // mock attachments have sync status set to 0 = not started, 
        // we should show the Download all link and hide Save all link.
        tc.isFalse(Jx.hasClass(downloadAllDiv, "hidden"));
        tc.isTrue(Jx.hasClass(saveAllDiv, "hidden"));

        // remove all but one files
        for (var i = 0, count = attachments.count-1; i < count; i++) {
            attachments.remove(attachments.item(0));
        }
        tc.areEqual(attachments.count, 1);
        readView._downloadSaveAllControl._updateControlState();
        
        // when there is only one file attached, we should hide both Download all and Save all links.
        tc.isTrue(Jx.hasClass(downloadAllDiv, "hidden"));
        tc.isTrue(Jx.hasClass(saveAllDiv, "hidden"));
    });
}) ();