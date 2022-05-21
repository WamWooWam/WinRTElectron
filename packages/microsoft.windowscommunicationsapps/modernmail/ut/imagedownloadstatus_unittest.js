
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail, Tx */
/*jshint browser:true*/

(function () {

    Tx.test("ImageDownloadStatus.test_layout", function (tc) {
        // Test to make sure showing and hiding the progress line will not move the reading pane up and down
        var sandbox = document.getElementById("sandbox"),
            hostDiv = document.createElement("div"),
            downloadStatus = new Mail.ImageDownloadStatus();

        hostDiv.classList.add("mailReadingPaneNoZoom");
        hostDiv.classList.add("mailReadingPaneImageDownloadStatusArea");

        downloadStatus.initialize(hostDiv);
        sandbox.appendChild(hostDiv);
        tc.areEqual(hostDiv.offsetHeight, 6);
        tc.areEqual(downloadStatus._progressRingElement.currentStyle.display, "none");
        tc.areEqual(downloadStatus._downloadErrorElement.currentStyle.display, "none");

        downloadStatus.newMessageSelected();
        tc.areEqual(hostDiv.offsetHeight, 6);
        tc.areEqual(downloadStatus._progressRingElement.currentStyle.display, "none");
        tc.areEqual(downloadStatus._downloadErrorElement.currentStyle.display, "none");

        downloadStatus.downloadComplete();
        tc.areEqual(hostDiv.offsetHeight, 6);
        tc.areEqual(downloadStatus._progressRingElement.currentStyle.display, "none");
        tc.areEqual(downloadStatus._downloadErrorElement.currentStyle.display, "none");

        downloadStatus.newMessageSelected();
        tc.areEqual(hostDiv.offsetHeight, 6);
        tc.areEqual(downloadStatus._progressRingElement.currentStyle.display, "none");
        tc.areEqual(downloadStatus._downloadErrorElement.currentStyle.display, "none");

        // showing the progress ring should not adjust the height
        downloadStatus.downloadDelayed();
        tc.areEqual(hostDiv.offsetHeight, 6);
        tc.isFalse(downloadStatus._progressRingElement.currentStyle.display === "none");
        tc.areEqual(downloadStatus._downloadErrorElement.currentStyle.display, "none");

        // Hight change not expected when showing an error
        downloadStatus.downloadError();
        tc.areEqual(hostDiv.offsetHeight, 6);
        tc.areEqual(downloadStatus._progressRingElement.currentStyle.display, "none");
        tc.isFalse(downloadStatus._downloadErrorElement.currentStyle.display === "none");

        downloadStatus.downloadComplete();
        tc.areEqual(hostDiv.offsetHeight, 6);
        tc.areEqual(downloadStatus._progressRingElement.currentStyle.display, "none");
        tc.areEqual(downloadStatus._downloadErrorElement.currentStyle.display, "none");

        downloadStatus.dispose();

        // Calling downloadStatus clear after it has been disposed should not crash.
        downloadStatus.clear();
        sandbox.removeChild(hostDiv);

    });

})();