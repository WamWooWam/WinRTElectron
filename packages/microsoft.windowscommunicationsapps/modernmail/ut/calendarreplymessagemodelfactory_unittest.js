
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
(function () {
    /// <summary>Tests Compose.CalendarReplyMessageModelFactory</summary>


    function setup (tc) {
        var preserver = new Jm.Preserve();
        tc.cleanup = function() {
            preserver.restore();
        };

        // Throw (and fail unit tests) on asserts
        if (window.Debug) {
            preserver.preserve(Debug, "throwOnAssert");
            Debug.throwOnAssert = true;
        }

        preserver.preserve(Compose.MessageFromEventCreator, "instance");
        preserver.preserve(Compose.MailMessageModel, "instance");

        var calendarUtil = Compose.CalendarUtil;
        var factoryUtil = Compose.mailMessageFactoryUtil;

        preserver.preserve(factoryUtil, "getRecipientsStringWithoutReceiver");
        preserver.preserve(factoryUtil, "getRecipientString");

        preserver.preserve(Compose.CalendarUtil, "getRecipientsArray");
        Compose.CalendarUtil.getRecipientsArray = function () { return []; };
        preserver.preserve(Compose.CalendarUtil, "getReplyHeaderHtmlFromEvent");
        preserver.preserve(Compose.CalendarUtil, "getBodyContentFromEvent");
    }

    Tx.test("CalendarReplyMessageModelFactory_UnitTest.testReplyAll", function (tc) {
        /// <summary>Verifies that the downlevel forward body content is included as appropriate</summary>
        setup(tc);

        var replyHeaderHtml = "ReplyHTML";
        var bodyContent = {
            id: "body content"
        };

        var expectedToString = "This is the TO string 1!";

        var mockMessage = {
            set: function (params) { this.setProperties = params; },
            addBodyContents: function (contents) {
                this.bodyContents = contents;
            },
            bodyContents: null,
            setProperties: null
        };

        Compose.CalendarUtil.getReplyHeaderHtmlFromEvent = function () { return replyHeaderHtml; };
        Compose.CalendarUtil.getBodyContentFromEvent = function () { return bodyContent; };

        Compose.mailMessageFactoryUtil.getRecipientString = function () { tc.fail("Unexpected call to getRecipientString"); };
        Compose.mailMessageFactoryUtil.getRecipientsStringWithoutReceiver = function () { return expectedToString; };

        var callback = setupMessageFactory(tc, mockMessage, Compose.CalendarActionType.replyAll);
        callback(mockMessage);

        tc.isNotNull(mockMessage.bodyContents, "Body contents not set on message");
        tc.areEqual(3, mockMessage.bodyContents.length, "Unexpected number of items added to body");
        tc.areEqual(replyHeaderHtml, mockMessage.bodyContents[1].content, "Body contents 1");
        tc.areEqual(bodyContent, mockMessage.bodyContents[2], "Body contents 2");

        // Check TO
        tc.isNotNull(mockMessage.setProperties, "Additional fields not set on message");
        tc.areEqual(expectedToString, mockMessage.setProperties.to, "TO did not match");
    });

    Tx.test("CalendarReplyMessageModelFactory_UnitTest.testReply", function (tc) {
        /// <summary>Verifies that the downlevel forward body content is not included if not appropriate</summary>
        setup(tc);

        var replyHeaderHTML = "Reply Html";
        var bodyContent = {
            id: "body content"
        };
        var expectedToString = "This is the TO string 2!";

        var mockMessage = {
            set: function (params) { this.setProperties = params; },
            addBodyContents: function (contents) {
                this.bodyContents = contents;
            },
            bodyContents: null,
            setProperties: null
        };

        Compose.CalendarUtil.getReplyHeaderHtmlFromEvent = function () { return replyHeaderHTML; };
        Compose.CalendarUtil.getBodyContentFromEvent = function () { return bodyContent; };

        Compose.mailMessageFactoryUtil.getRecipientString = function () { return expectedToString; };
        Compose.mailMessageFactoryUtil.getRecipientsStringWithoutReceiver = function () { tc.fail("Unexpected call to getRecipientsStringWithoutReceiver"); };

        var callback = setupMessageFactory(tc, mockMessage, Compose.CalendarActionType.reply);
        callback(mockMessage);

        tc.isNotNull(mockMessage.bodyContents, "Body contents not set on message");
        tc.areEqual(3, mockMessage.bodyContents.length, "Unexpected number of items added to body");
        tc.areEqual(replyHeaderHTML, mockMessage.bodyContents[1].content, "Body contents 1");
        tc.areEqual(bodyContent, mockMessage.bodyContents[2], "Body contents 2");
        
        // Check TO
        tc.isNotNull(mockMessage.setProperties, "Additional fields not set on message");
        tc.areEqual(expectedToString, mockMessage.setProperties.to, "TO did not match");
    });

    // Helper functions

    function setupMessageFactory(tc, message, action) {
        /// <summary>Sets up a message model factory and returns the create callback</summary>

        var callback = null;

        var originalEvent = {
            calendar: {
                account: { id: "fakeAccount" }
            },
            subject: "This is the subject"
        };
        var expectedAccount = originalEvent.calendar.account;

        Compose.MailMessageModel.instance = function () {
            return message;
        };

        Compose.MessageFromEventCreator.instance = function (creatorEvent, creatorAccount, creatorAction) {
            tc.areEqual(originalEvent, creatorEvent, "Unexpected event passed to MessageFromEventCreator");
            tc.areEqual(expectedAccount, creatorAccount, "Unexpected account passed to MessageFromEventCreator");
            tc.areEqual(action, creatorAction, "Unexpected action passed to MessageFromEventCreator");

            return {
                setCallback: function (creatorCallback) {
                    callback = creatorCallback;
                }
            }
        };

        var messageModel = Compose.calendarReplyMessageModelFactory.instance(originalEvent, action);

        tc.isNotNull(callback, "Expected messageModelFactory to set up a create callback");

        return callback;
    }
})();
