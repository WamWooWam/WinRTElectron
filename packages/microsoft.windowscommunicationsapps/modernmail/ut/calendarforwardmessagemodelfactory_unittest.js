
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function () {
    /// <summary>Tests Compose.CalendarForwardMessageModelFactory</summary>

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

        preserver.preserve(Compose.CalendarUtil, "getRecipientsArray");
        Compose.CalendarUtil.getRecipientsArray = function () { return []; };

        preserver.preserve(Compose.CalendarUtil, "messageRequiresForwardContent");
        preserver.preserve(Compose.CalendarUtil, "getDownlevelForwardBodyContent");
        preserver.preserve(Compose.CalendarUtil, "getReplyHeaderHtmlFromEvent");
        preserver.preserve(Compose.CalendarUtil, "getBodyContentFromEvent");

        // Set up some mock objects
        Mail.UnitTest.setupCalendarStubs();
        Mail.UnitTest.setupModernCanvasStubs();
    }

    Tx.test("CalendarForwardMessageModelFactory_UnitTest.testBodyContentWithForwardMessage", function (tc) {
        /// <summary>Verifies that the downlevel forward body content is included as appropriate</summary>
        setup(tc);

        var replyHeaderHtml = "reply header html";
        var bodyContent = {
            id: "body content"
        };
        var forwardContent = {
            id: 'forwardContent'
        };

        var mockMessage = {
            set: function () { },
            addBodyContents: function (contents) {
                this.bodyContents = contents;
            },
            bodyContents: null
        };

        Compose.CalendarUtil.messageRequiresForwardContent = function () { return true; };
        Compose.CalendarUtil.getDownlevelForwardBodyContent = function () { return forwardContent; }
        Compose.CalendarUtil.getReplyHeaderHtmlFromEvent = function () { return replyHeaderHtml; };
        Compose.CalendarUtil.getBodyContentFromEvent = function () { return bodyContent; };

        var callback = setupMessageFactory(tc, mockMessage);

        callback(mockMessage);

        tc.isNotNull(mockMessage.bodyContents, "Body contents not set on message");
        tc.areEqual(4, mockMessage.bodyContents.length, "Unexpected number of items added to body");
        tc.areEqual(replyHeaderHtml, mockMessage.bodyContents[1].content, "Body contents 1");
        tc.areEqual(bodyContent, mockMessage.bodyContents[2], "Body contents 2");
        tc.areEqual(forwardContent, mockMessage.bodyContents[3], "Body contents 3");
    });

    Tx.test("CalendarForwardMessageModelFactory_UnitTest.testBodyContentWithoutForwardMessage", function (tc) {
        /// <summary>Verifies that the downlevel forward body content is not included if not appropriate</summary>
        setup(tc);

        var replyHtml = "Reply header";
        var bodyContent = {
            id: "body content"
        };

        var mockMessage = {
            set: function () { },
            addBodyContents: function (contents) {
                this.bodyContents = contents;
            },
            bodyContents: null
        };

        Compose.CalendarUtil.messageRequiresForwardContent = function () { return false; };
        Compose.CalendarUtil.getDownlevelForwardBodyContent = function () { tc.fail("Unexpected call to getDownlevelForwardBodyContent"); }
        Compose.CalendarUtil.getReplyHeaderHtmlFromEvent = function () { return replyHtml; };
        Compose.CalendarUtil.getBodyContentFromEvent = function () { return bodyContent; };

        var callback = setupMessageFactory(tc, mockMessage);

        callback(mockMessage);
        
        tc.isNotNull(mockMessage.bodyContents, "Body contents not set on message");
        tc.areEqual(3, mockMessage.bodyContents.length, "Unexpected number of items added to body");
        tc.areEqual(replyHtml, mockMessage.bodyContents[1].content, "Body contents 1");
        tc.areEqual(bodyContent, mockMessage.bodyContents[2], "Body contents 2");
    });

    // Helper functions

    function setupMessageFactory (tc, message) {
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
            tc.areEqual(Compose.CalendarActionType.forward, creatorAction, "Unexpected action passed to MessageFromEventCreator");

            return {
                setCallback: function (creatorCallback) {
                    callback = creatorCallback;
                }
            }
        };

        var messageModel = Compose.calendarForwardMessageModelFactory.instance(originalEvent);

        tc.isNotNull(callback, "Expected messageModelFactory to set up a create callback");

        return callback;
    }

})();
