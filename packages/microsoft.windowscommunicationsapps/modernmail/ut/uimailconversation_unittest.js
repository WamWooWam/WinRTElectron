
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
//

(function () {
    var setup = function (tc) {
        Mail.UnitTest.stubJx(tc, "res");
        Mail.UnitTest.setupModernCanvasStubs();
    };

    var tearDown = function () {
        Mail.UnitTest.restoreJx();
    };

    Tx.test("UIMailConversation_UnitTest.test_UIMailConversation", {owner: "tonypan", priority: 0}, function (tc) {
        tc.cleanup = tearDown;
        setup(tc);

        var latestReceivedTime = new Date(1298429889000), //FileTime equivalent of Tuesday, February 22, 2011 9:58:09pm
            latestReceivedTimeString = Windows.Globalization.DateTimeFormatting.DateTimeFormatter.shortDate.format(latestReceivedTime),
            platformConversation = {
            fromRecipient : { fastName: "HR", calculatedUIName : "Human Resources" },
            read: false,
            importance: 3,
            hasOrdinaryAttachments: true,
            lastVerb: 2,
            hasCalendarInvite: false,
            totalCount: 10,
            latestReceivedTime: latestReceivedTime,
            subject : "We need to have a conversation...",
            mockedType: Microsoft.WindowsLive.Platform.MailConversation,
            irmHasTemplate: false,
            hasDraft: false,
            hasOnlyDraftOrSent: false
        };

        var uiConversation = new Mail.UIDataModel.MailConversation(platformConversation);
        tc.isFalse(uiConversation.isOutboundFolder);
        tc.isFalse(uiConversation.isDraft);
        tc.isFalse(uiConversation.read);
        tc.areEqual(uiConversation.subject, "We need to have a conversation...");
        tc.areEqual(uiConversation.importance, 3);
        tc.areEqual(uiConversation.lastVerb, 2);
        tc.areEqual(uiConversation.totalCount, 10);
        tc.isTrue(uiConversation.hasOrdinaryAttachments);
        tc.isFalse(uiConversation.calendarInvite);
        tc.areEqual(uiConversation.fastHeaderRecipientsString, "HR");
    });

    Tx.test("UIMailConversation_UnitTest.test_UIMailConversationHasDraft", {owner: "andrha", priority: 0}, function (tc) {
        tc.cleanup = tearDown;
        setup(tc);

        var latestReceivedTime = new Date(1298429889000), //FileTime equivalent of Tuesday, February 22, 2011 9:58:09pm,
            latestReceivedTimeString = Windows.Globalization.DateTimeFormatting.DateTimeFormatter.shortDate.format(latestReceivedTime),
            platformConversation = {
            fromRecipient : { fastName: "HR", calculatedUIName : "Human Resources" },
            read: false,
            importance: 3,
            hasOrdinaryAttachments: true,
            lastVerb: 2,
            hasCalendarInvite: false,
            totalCount: 10,
            latestReceivedTime: latestReceivedTime,
            subject : "We need to have a conversation...",
            mockedType: Microsoft.WindowsLive.Platform.MailConversation,
            irmHasTemplate: false,
            hasDraft: true,
            hasOnlyDraftOrSent: false
        };

        var uiConversation = new Mail.UIDataModel.MailConversation(platformConversation);
        tc.isFalse(uiConversation.isOutboundFolder);
        tc.isFalse(uiConversation.isDraft);
        tc.isFalse(uiConversation.read);
        tc.areEqual(uiConversation.subject, "We need to have a conversation...");
        tc.areEqual(uiConversation.importance, 3);
        tc.areEqual(uiConversation.lastVerb, 2);
        tc.areEqual(uiConversation.totalCount, 10);
        tc.isTrue(uiConversation.hasOrdinaryAttachments);
        tc.isFalse(uiConversation.calendarInvite);
        tc.areEqual(uiConversation.fastHeaderRecipientsString, "HR");
    });

    Tx.test("UIMailConversation_UnitTest.test_UIMailConversationDraft", {owner: "tonypan", priority: 0}, function (tc) {
        tc.cleanup = tearDown;
        setup(tc);

        var latestReceivedTime = new Date(1298429889000), //FileTime equivalent of Tuesday, February 22, 2011 9:58:09pm,
            latestReceivedTimeString = Windows.Globalization.DateTimeFormatting.DateTimeFormatter.shortDate.format(latestReceivedTime),
            platformConversation = {
            fromRecipient : { fastName: "HR", calculatedUIName : "Human Resources" },
            toRecipients : [{ fastName: "Alice", calculatedUIName : "Alice from Boston" }, { fastName: "Charlie", calculatedUIName : "Charlie from Detroit" }],
            read: false,
            importance: 3,
            hasOrdinaryAttachments: true,
            lastVerb: 2,
            hasCalendarInvite: false,
            totalCount: 10,
            latestReceivedTime: latestReceivedTime,
            subject : "We need to have a conversation...",
            mockedType: Microsoft.WindowsLive.Platform.MailConversation,
            irmHasTemplate: false,
            hasDraft: true,
            hasOnlyDraftOrSent: true
        };

        var uiConversation = new Mail.UIDataModel.MailConversation(platformConversation);
        tc.isTrue(uiConversation.isOutboundFolder);
        tc.isTrue(uiConversation.isDraft);
        tc.isFalse(uiConversation.read);
        tc.areEqual(uiConversation.subject, "We need to have a conversation...");
        tc.areEqual(uiConversation.importance, 3);
        tc.areEqual(uiConversation.lastVerb, 2);
        tc.areEqual(uiConversation.totalCount, 10);
        tc.isTrue(uiConversation.hasOrdinaryAttachments);
        tc.isFalse(uiConversation.calendarInvite);
        tc.areEqual(uiConversation.fastHeaderRecipientsString, "Alice; Charlie");
    });

    Tx.test("UIMailConversation_UnitTest.test_UIMailConversationCalendarInvite", {owner: "kepoon", priority: 0}, function (tc) {
        tc.cleanup = tearDown;
        setup(tc);

        var latestReceivedTime = new Date(1298429889000), //FileTime equivalent of Tuesday, February 22, 2011 9:58:09pm,
            latestReceivedTimeString = Windows.Globalization.DateTimeFormatting.DateTimeFormatter.shortDate.format(latestReceivedTime),
            platformConversation = {
            fromRecipient : { fastName: "HR", calculatedUIName : "Human Resources" },
            read: false,
            importance: 3,
            hasOrdinaryAttachments: true,
            lastVerb: 2,
            hasCalendarRequest: true,
            hasCalendarInvite: true,
            totalCount: 10,
            latestReceivedTime: latestReceivedTime,
            subject : "We need to have a conversation...",
            mockedType: Microsoft.WindowsLive.Platform.MailConversation,
            irmHasTemplate: true
        };

        var uiConversation = new Mail.UIDataModel.MailConversation(platformConversation);
        tc.areEqual(uiConversation.subject, "Invitation: We need to have a conversation...");
    });
})();
