
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx, Mail, Microsoft, Tx */
/*jshint browser:true*/

(function () {
    "use strict";

    var Plat = Microsoft.WindowsLive.Platform;

    function setup(tc, messageId) {
        Mail.UnitTest.stubJx(tc, "appData");
        Mail.UnitTest.stubJx(tc, "activation");
        tc.addCleanup(Mail.UnitTest.restoreJx);
        Mail.UnitTest.initGlobals();
        tc.addCleanup(Mail.UnitTest.disposeGlobals);

        var result = {};
        var platform = Mail.Globals.platform;
        result.platformAccount = platform.accountManager.defaultAccount;
        result.account = new Mail.Account(result.platformAccount, platform);
        result.platformMessage = platform.mailManager.loadMessage(messageId);
        result.message = new Mail.UIDataModel.MailMessage(result.platformMessage, result.account);

        result.downloadStatusCallbacks = {
            newMessageSelected: false,
            downloadComplete: false,
            clear: false
        };
        result.downloadStatus = {
            newMessageSelected: function () {
                tc.isFalse(result.downloadStatusCallbacks.newMessageSelected, "downloadStatus.newMessageSelected called more than once");
                result.downloadStatusCallbacks.newMessageSelected = true;
            },
            downloadComplete: function () {
                tc.isFalse(result.downloadStatusCallbacks.downloadComplete, "downloadStatus.downloadComplete called more than once");
                result.downloadStatusCallbacks.downloadComplete = true;
            },
            clear: function () {
                tc.isFalse(result.downloadStatusCallbacks.clear, "downloadStatus.clear called more than once");
                result.downloadStatusCallbacks.clear = true;
            },
            mockedType: Mail.ImageDownloadStatus
        };

        return result;
    }

    Tx.test("EmbeddedAttachments.test_basic", function (tc) {
        var setupResult = setup(tc, "EmbeddedAttachments.test_basic");
        var el = document.createElement("div");

        tc.isFalse(setupResult.downloadStatusCallbacks.newMessageSelected, "downloadStatus.newMessageSelected called too early");
        var instance = new Mail.EmbeddedAttachments(setupResult.message, false /*isTruncated*/, el, setupResult.downloadStatus);
        tc.isTrue(setupResult.downloadStatusCallbacks.newMessageSelected, "downloadStatus.newMessageSelected not called");

        tc.isFalse(setupResult.downloadStatusCallbacks.downloadComplete, "downloadStatus.downloadComplete called too early");
        instance.downloadAll();
        tc.isTrue(setupResult.downloadStatusCallbacks.downloadComplete, "downloadStatus.downloadComplete not called");

        tc.isFalse(setupResult.downloadStatusCallbacks.clear, "downloadStatus.clear called too early");
        instance.dispose();
        tc.isTrue(setupResult.downloadStatusCallbacks.clear, "downloadStatus.clear not called");
    });

    Tx.test("EmbeddedAttachments.test_ordinary_not_used", function (tc) {
        var setupResult = setup(tc, "EmbeddedAttachments.test_ordinary");
        var el = document.createElement("div");
        el.innerHTML = "<img src=''>";

        tc.isFalse(setupResult.downloadStatusCallbacks.newMessageSelected, "downloadStatus.newMessageSelected called too early");
        var instance = new Mail.EmbeddedAttachments(setupResult.message, false /*isTruncated*/, el, setupResult.downloadStatus);
        tc.isTrue(setupResult.downloadStatusCallbacks.newMessageSelected, "downloadStatus.newMessageSelected not called");

        tc.isFalse(setupResult.downloadStatusCallbacks.downloadComplete, "downloadStatus.downloadComplete called too early");
        instance.downloadAll();
        tc.isTrue(setupResult.downloadStatusCallbacks.downloadComplete, "downloadStatus.downloadComplete not called");

        tc.isFalse(setupResult.downloadStatusCallbacks.clear, "downloadStatus.clear called too early");
        instance.dispose();
        tc.isTrue(setupResult.downloadStatusCallbacks.clear, "downloadStatus.clear not called");
    });

    Tx.test("EmbeddedAttachments.test_ordinary_used_by_filename", function (tc) {
        var setupResult = setup(tc, "EmbeddedAttachments.test_ordinary");
        var el = document.createElement("div");
        el.innerHTML = '<img src="cid:attachment-file-name.gif">';

        tc.isFalse(setupResult.downloadStatusCallbacks.newMessageSelected, "downloadStatus.newMessageSelected called too early");
        var instance = new Mail.EmbeddedAttachments(setupResult.message, false /*isTruncated*/, el, setupResult.downloadStatus);
        tc.isTrue(setupResult.downloadStatusCallbacks.newMessageSelected, "downloadStatus.newMessageSelected not called");

        tc.isFalse(setupResult.downloadStatusCallbacks.downloadComplete, "downloadStatus.downloadComplete called too early");
        instance.downloadAll();
        tc.isTrue(setupResult.downloadStatusCallbacks.downloadComplete, "downloadStatus.downloadComplete not called");
        tc.areEqual('<img src="unique-string-01">', el.innerHTML);

        tc.isFalse(setupResult.downloadStatusCallbacks.clear, "downloadStatus.clear called too early");
        instance.dispose();
        tc.isTrue(setupResult.downloadStatusCallbacks.clear, "downloadStatus.clear not called");
    });

    Tx.test("EmbeddedAttachments.test_ordinary_used_by_cid", function (tc) {
        var setupResult = setup(tc, "EmbeddedAttachments.test_ordinary");
        var el = document.createElement("div");
        el.innerHTML = '<img src="cid:attachment-content-id">';

        tc.isFalse(setupResult.downloadStatusCallbacks.newMessageSelected, "downloadStatus.newMessageSelected called too early");
        var instance = new Mail.EmbeddedAttachments(setupResult.message, false /*isTruncated*/, el, setupResult.downloadStatus);
        tc.isTrue(setupResult.downloadStatusCallbacks.newMessageSelected, "downloadStatus.newMessageSelected not called");

        tc.isFalse(setupResult.downloadStatusCallbacks.downloadComplete, "downloadStatus.downloadComplete called too early");
        instance.downloadAll();
        tc.isTrue(setupResult.downloadStatusCallbacks.downloadComplete, "downloadStatus.downloadComplete not called");
        tc.areEqual('<img src="unique-string-01">', el.innerHTML);

        tc.isFalse(setupResult.downloadStatusCallbacks.clear, "downloadStatus.clear called too early");
        instance.dispose();
        tc.isTrue(setupResult.downloadStatusCallbacks.clear, "downloadStatus.clear not called");
    });

    Tx.test("EmbeddedAttachments.test_embedded_used_by_cid", function (tc) {
        var setupResult = setup(tc, "EmbeddedAttachments.test_embedded");
        var el = document.createElement("div");
        el.innerHTML = '<img src="cid:attachment-content-id">';

        tc.isFalse(setupResult.downloadStatusCallbacks.newMessageSelected, "downloadStatus.newMessageSelected called too early");
        var instance = new Mail.EmbeddedAttachments(setupResult.message, false /*isTruncated*/, el, setupResult.downloadStatus);
        tc.isTrue(setupResult.downloadStatusCallbacks.newMessageSelected, "downloadStatus.newMessageSelected not called");

        tc.isFalse(setupResult.downloadStatusCallbacks.downloadComplete, "downloadStatus.downloadComplete called too early");
        instance.downloadAll();
        tc.isTrue(setupResult.downloadStatusCallbacks.downloadComplete, "downloadStatus.downloadComplete not called");
        tc.areEqual('<img src="unique-string-01">', el.innerHTML);

        tc.isFalse(setupResult.downloadStatusCallbacks.clear, "downloadStatus.clear called too early");
        instance.dispose();
        tc.isTrue(setupResult.downloadStatusCallbacks.clear, "downloadStatus.clear not called");
    });
})();

