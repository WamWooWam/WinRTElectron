
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
//

/*global Mail, Tx, Jx, Microsoft*/
(function () {
    var Platform = Microsoft.WindowsLive.Platform;

    var messageBody = {
            body: "message body text",
            type: Platform.MailBodyType.plainText,
            addEventListener: function () {},
            removeEventListener: function () {},
            mockedType: Platform.MailBody
        },
        messageBodyHTML = {
            body: "something in html",
            type: Platform.MailBodyType.sanitized,
            metadata: JSON.stringify({hasCSSImages: false, htmlBodyHash: "hash", readingDirection: "ltr"}),
            addEventListener: function () {},
            removeEventListener: function () {},
            mockedType: Platform.MailBody
        },
        account = {
            mockedType: Mail.Account
        };

    var setup = function (tc) {
        tc.cleanup = function () {
            Mail.UnitTest.restoreJx();
            Mail.UnitTest.restoreUtilities();
            Mail.UnitTest.disposeGlobals();
        };

        Mail.UnitTest.stubJx(tc, "appData");
        Mail.UnitTest.stubJx(tc, "res");
        Mail.UnitTest.stubJx(tc, "activation");
        Mail.UnitTest.stubUtilities();
        Mail.UnitTest.setupModernCanvasStubs();
        Mail.UnitTest.initGlobals(tc);
        Mail.Globals.appState.setSelectedView({
            folder: {
                objectId: "1234567890",
                markViewed: Jx.fnEmpty,
                mockedType: Mail.UIDataModel.MailFolder,
                ensureSyncEnabled: function () {},
            },
            mockedType: Mail.UIDataModel.MailView,
        });
    };

    Tx.test("UIMailMessage_UnitTest.test_subject", {owner: "geevens", priority: 0}, function (tc) {
        setup(tc);
        var Plat = Platform;
        var platformMessage = {
            subject: "foo bar baz",
            mockedType: Plat.MailMessage,
            displayViewIdString: "a view id",
            calendarMessageType: Plat.CalendarMessageType.none,
            isInSpecialFolderType: function () { return false; }
        };
        var message = new Mail.UIDataModel.MailMessage(platformMessage, account);
        tc.areEqual("foo bar baz", message.subject);
        tc.areEqual("foo bar baz", message.subjectHTML);

        platformMessage.subject = "  foo     bar    baz  ";
        tc.areEqual("foo     bar    baz", message.subject);
        tc.areEqual("foo&nbsp;&nbsp;&nbsp;&nbsp; bar&nbsp;&nbsp;&nbsp; baz", message.subjectHTML);

        platformMessage.subject = " \r\n \r  \n    foo\r\n\r\n\r\n     bar  \r\n\r\n \r \n \r \n    baz  ";
        tc.areEqual("foo\r\n\r\n\r\n     bar  \r\n\r\n \r \n \r \n    baz", message.subject);
        tc.areEqual("foo&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; bar&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; baz", message.subjectHTML);

        platformMessage.subject = "";
        tc.areEqual("NoSubject", message.subject);
        tc.areEqual("NoSubject", message.subjectHTML);

        platformMessage.subject = "  <     >  ";
        tc.areEqual("<     >", message.subject);
        tc.areEqual("&lt;&nbsp;&nbsp;&nbsp;&nbsp; &gt;", message.subjectHTML);

        platformMessage.subject = "foo bar baz";
        platformMessage.calendarMessageType = Plat.CalendarMessageType.request;
        tc.areEqual("Invitation: foo bar baz", message.subject);
        tc.areEqual("Invitation: foo bar baz", message.subjectHTML);
    });

    Tx.test("UIMailMessage_UnitTest.test_UIMailMessage", {owner: "kepoon", priority: 0}, function (tc) {
        var platformMessage = {
            importance: 0,
            hasOrdinaryAttachments: false,
            received: new Date(1298429889000), //FileTime equivalent of Tuesday, February 22, 2011 9:58:09pm
            sent: new Date(1398420089000), //FileTime equivalent of Friday, April 25, 2014 3:01:29 AM
            modified: new Date(125420089000), //FileTime equivalent of Saturday, December 22, 1973 6:54:49 AM
            getBody: function (type) {
                tc.areEqual(type, Platform.MailBodyType.sanitized);
                return messageBodyHTML;
            },
            getJunkBody: function () { return messageBody; },
            allowExternalImages: true,
            sanitizedVersion: Platform.SanitizedVersion.current,
            accountId: "AccountId0",
            mockedType: Platform.MailMessage,
            irmHasTemplate: false,
            specialFolderType: Platform.MailFolderType.userGenerated,
            displayViewIdString: "a view id",
            isInSpecialFolderType: function (type) { return type === this.specialFolderType; }
        };
        var expectedReceivedDate = new Date(1298429889000);
        var expectedSentDate = new Date(1398420089000);
        var expectedModifiedDate = new Date(125420089000);

        var message = new Mail.UIDataModel.MailMessage(platformMessage, account);
        // Verify the date to string functions work
        tc.areEqual(expectedReceivedDate.toLocaleString(), message.received.toLocaleString());
        tc.areEqual(expectedSentDate.toLocaleString(), message.sent.toLocaleString());
        tc.areEqual(expectedModifiedDate.toLocaleString(), message.modified.toLocaleString());
        // Verify that received is the "best" date for a message in this folder
        tc.areEqual(expectedReceivedDate.toLocaleString(), message.bestDate.toLocaleString());
        // Verify that we're using the normal message body
        var body = message.getBody();
        tc.areEqual(messageBodyHTML.type, body.type);
        tc.areEqual(messageBodyHTML.body, body.body);

        platformMessage.specialFolderType = Platform.MailFolderType.junkMail;
        message = new Mail.UIDataModel.MailMessage(platformMessage, account);
        // Verify that we're using the junk message body
        tc.areEqual(message.getBody(), null);
        body = message.getJunkBody();
        tc.areEqual(messageBody.type, body.type);
        tc.areEqual(messageBody.body, body.body);
        tc.areEqual(expectedReceivedDate.toLocaleString(), message.bestDate.toLocaleString());

        platformMessage.specialFolderType = Platform.MailFolderType.drafts;
        message = new Mail.UIDataModel.MailMessage(platformMessage, account);
        // Verify that we're using the normal message body
        body = message.getBody();
        tc.areEqual(messageBodyHTML.type, body.type);
        tc.areEqual(messageBodyHTML.body, body.body);
        // Verify that modified is the "best" date for a message in this folder
        tc.areEqual(expectedModifiedDate.toLocaleString(), message.bestDate.toLocaleString());

        platformMessage.specialFolderType = Platform.MailFolderType.outbox;
        message = new Mail.UIDataModel.MailMessage(platformMessage, account);
        // Verify that we're using the normal message body
        body = message.getBody();
        tc.areEqual(messageBodyHTML.type, body.type);
        tc.areEqual(messageBodyHTML.body, body.body);
        // Verify that modified is the "best" date for a message in this folder
        tc.areEqual(expectedModifiedDate.toLocaleString(), message.bestDate.toLocaleString());

        platformMessage.specialFolderType = Platform.MailFolderType.sentItems;
        message = new Mail.UIDataModel.MailMessage(platformMessage, account);
        // Verify that we're using the normal message body
        body = message.getBody();
        tc.areEqual(messageBodyHTML.type, body.type);
        tc.areEqual(messageBodyHTML.body, body.body);
        // Verify that sent is the "best" date for a message in this folder
        tc.areEqual(expectedSentDate.toLocaleString(), message.bestDate.toLocaleString());
    });

    var MockFormatter = /* constructor */function (name) {
        this.output = name + " called";
        this.originalFunction = null;
    };
    MockFormatter.prototype.format = function () {
        return this.output;
    };

    var formatterNames = ["shortTimeFormatter", "shortWeekDayFormatter", "shortDateFormatterSameYear", "shortDateFormatter"];
    var formatters = null;

    var setupMockDateFormatters = function () {
        if (!formatters) {
            formatters = {};
            formatterNames.forEach(function (name) {
                var mockFormatter = new MockFormatter(name);
                formatters[name] = mockFormatter;
                mockFormatter.originalFunction = Mail.Utilities[name];
                Mail.Utilities[name] = mockFormatter;
            });
        }
    };

    var cleanupMockDateFormatters = function () {
        if (formatters) {
            formatterNames.forEach(function (name) {
                var mockFormatter = formatters[name];
                if (mockFormatter.originalFunction) {
                    Mail.Utilities[name] = mockFormatter.originalFunction;
                }
            });
            formatters = null;
        }
    };

    Tx.test("UIMailMessage_UnitTest.test_getShortDateString", {owner: "kepoon", priority: 0}, function (tc) {
        tc.cleanup = cleanupMockDateFormatters;
        setupMockDateFormatters();

        // Mock the the date.now() function
        var now = new Date(2012, 5 /*Jun (Month is a zero-based index) */, 7); // 2012/6/7
        now.setHours(15);
        now.setMinutes(15);

        var testDate = new Date(now);
        testDate.setHours(0);
        testDate.setMinutes(7);
        tc.areEqual(formatters.shortTimeFormatter.output, Mail.Utilities._formatShortDate(now, testDate));

        testDate.setHours(0);
        testDate.setMinutes(10);
        tc.areEqual(formatters.shortTimeFormatter.output, Mail.Utilities._formatShortDate(now, testDate));

        testDate.setHours(1);
        testDate.setMinutes(11);
        tc.areEqual(formatters.shortTimeFormatter.output, Mail.Utilities._formatShortDate(now, testDate));

        testDate.setHours(12);
        testDate.setMinutes(12);
        tc.areEqual(formatters.shortTimeFormatter.output, Mail.Utilities._formatShortDate(now, testDate));

        testDate.setHours(13);
        testDate.setMinutes(13);
        tc.areEqual(formatters.shortTimeFormatter.output, Mail.Utilities._formatShortDate(now, testDate));

        // Today's future
        testDate.setHours(16);
        testDate.setMinutes(16);
        tc.areEqual(formatters.shortTimeFormatter.output, Mail.Utilities._formatShortDate(now, testDate));

        // Within the last week
        testDate = new Date(now);
        testDate.setDate(now.getDate() - 3);
        tc.areEqual(formatters.shortWeekDayFormatter.output, Mail.Utilities._formatShortDate(now, testDate));

        // Within the last week boundary case
        testDate = new Date(2012, 4, 31, 23, 59); // 2012/5/31 11:59PM Thu  (now is 2012/6/7 Thu)
        tc.areEqual(formatters.shortDateFormatterSameYear.output, Mail.Utilities._formatShortDate(now, testDate));

        testDate = new Date(2012, 5, 1); // 2012/6/1 12:00AM Thu  (now is 2012/6/7 Thu)
        tc.areEqual(formatters.shortWeekDayFormatter.output, Mail.Utilities._formatShortDate(now, testDate));

        // Within the last year
        testDate = new Date(now);
        testDate.setMonth(now.getMonth() - 1);
        tc.areEqual(formatters.shortDateFormatterSameYear.output, Mail.Utilities._formatShortDate(now, testDate));
    });

    Tx.test("UIMailMessage_UnitTest.test_getShortDateStringInTheSameYear", {owner: "kepoon", priority: 0}, function (tc) {
        tc.cleanup = cleanupMockDateFormatters;
        setupMockDateFormatters();

        var now = new Date(2012, 5 /*Jun (Month is a zero-based index) */, 7), // 2012/6/7
            testDate = new Date(now);
        testDate.setMonth(1);
       tc.areEqual(formatters.shortDateFormatterSameYear.output, Mail.Utilities._formatShortDate(now, testDate));

        /// Test cross year boundary
        now = new Date(2012, 0 /*Jan (Month is a zero-based index) */, 7); // 2012/1/7
        testDate = new Date(2011, 11 /*Dec (Month is a zero-based index) */, 30); // 2011/12/30
        tc.areEqual(formatters.shortDateFormatterSameYear.output, Mail.Utilities._formatShortDate(now, testDate));

        /// Test boundary cases
        now = new Date(2012, 0 /*Jan (Month is a zero-based index) */, 7); // 2012/1/7
        testDate = new Date(2011, 0 /*Dec (Month is a zero-based index) */, 7, 23, 59); // 2011/1/7 11:59PM
        tc.areEqual(formatters.shortDateFormatter.output, Mail.Utilities._formatShortDate(now, testDate));

        testDate = new Date(2011, 0 /*Dec (Month is a zero-based index) */, 8); // 2011/1/8
        tc.areEqual(formatters.shortDateFormatterSameYear.output, Mail.Utilities._formatShortDate(now, testDate));

        /// Test Leap year, 2012 is a leap year
        now = new Date(2013, 0 /*Jan (Month is a zero-based index) */, 7); // 2013/1/7
        testDate = new Date(2012, 0 /*Dec (Month is a zero-based index) */, 7, 23, 59); // 2012/1/7 11:59PM
        tc.areEqual(formatters.shortDateFormatter.output, Mail.Utilities._formatShortDate(now, testDate));

        testDate = new Date(2012, 0 /*Dec (Month is a zero-based index) */, 8); // 2012/1/8
        tc.areEqual(formatters.shortDateFormatterSameYear.output, Mail.Utilities._formatShortDate(now, testDate));

    });
})();
