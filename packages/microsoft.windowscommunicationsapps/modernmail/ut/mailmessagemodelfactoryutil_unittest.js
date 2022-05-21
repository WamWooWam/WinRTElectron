
(function () {

    var factoryUtil = Compose.mailMessageFactoryUtil;

    function setup () {
        this._preserve = Jm.preserve();
        var preserve = this._preserve.preserve.bind(this._preserve);

        preserve(Compose, "platform");

        // Throw (and fail unit tests) on asserts
        if (window.Debug) {
            preserve(Debug, "throwOnAssert");
            Debug.throwOnAssert = true;
        }

        // Mock out Jx.escapeHtml to make validation easier
        preserve(Jx, "escapeHtml");
        Jx.escapeHtml = function (string) { return string; };
    }

    function cleanup () {
        this._preserve.restore();
    }

    Tx.test("MailMessageModelFactoryUtil_UnitTest.testGetReplyHeaderRecipientsHtml", function (tc) {
        /// <summary>Verifies getReplyHeaderRecipientsHtml</summary>

        var recipients = [{ calculatedUIName: "test name", emailAddress: "email@address.com" },
            { calculatedUIName: "test name2", emailAddress: "email2@address.com" },
            { calculatedUIName: "test name3", emailAddress: "email3@address.com" }],
            expectedHtml = "<a tabindex='-1' title='mailto:email@address.com' href='mailto:email@address.com'>test name</a>, " +
            "<a tabindex='-1' title='mailto:email2@address.com' href='mailto:email2@address.com'>test name2</a>, " +
            "<a tabindex='-1' title='mailto:email3@address.com' href='mailto:email3@address.com'>test name3</a>",
            resultHtml = factoryUtil.getReplyHeaderRecipientsHtml(recipients);

        tc.areEqual(expectedHtml, resultHtml);
    });

    Tx.test("MailMessageModelFactoryUtil_UnitTest.testGetRecipientString", function (tc) {
        /// <summary>Verifies getRecipientString for normal recipient</summary>

        var recipient = {
            calculatedUIName: "Name Name name",
            emailAddress: "email1@email.com"
        };
        var expectedResult = '"Name Name name" <email1@email.com>;';

        var result = factoryUtil.getRecipientString(recipient);

        tc.areEqual(expectedResult, result);
    });

    Tx.test("MailMessageModelFactoryUtil_UnitTest.testGetRecipientStringOnlyEmail", function (tc) {
        /// <summary>Verifies that the recipient string is correct when there is only the email address</summary>

        var emailAddress = 'emailAddress@email.com';
        var recipient = {
            calculatedUIName: emailAddress,
            emailAddress: emailAddress
        };
        var expectedResult = '<emailAddress@email.com>;';

        var result = factoryUtil.getRecipientString(recipient);

        tc.areEqual(expectedResult, result);
    });

    // Windows Blue bugs: 48606
    /*Tx.noop("MailMessageModelFactoryUtil_UnitTest.testGetRecipientStringNameWithQuotes", function (tc) {
        /// <summary>Verifies that the recipient string is constructed correctly when the name contains quotes</summary>

        var recipient = {
            calculatedUIName: 'Name "Nickname" LastName',
            emailAddress: "email1@email.com"
        };
        var expectedResult = '"Name \"Nickname\" LastName" <email1@email.com>;';

        var result = factoryUtil.getRecipientString(recipient);

        tc.areEqual(expectedResult, result);
    });*/

    Tx.test("MailMessageModelFactoryUtil_UnitTest.testUpdateEmbeddedAttachments", function (tc) {
        /// <summary>Verifies that the img src is updated to reference the message instead of the source message</summary>

        var sourceMessageAttachmentBodyUri = "ms-appdata:///sourcemessage/test.jpg",
            sourceMessage = {
                getEmbeddedAttachmentCollection: function () {
                    return {
                        count: 1,
                        item: function () {
                            return {
                                bodyUri: sourceMessageAttachmentBodyUri,
                                contentId: "test.jpg@123abc"
                            };
                        }
                    };
                },
                objectId: "1"
            },
            messageAttachmentBodyUri = "ms-appdata:///message/test.jpg",
            message = {
                getEmbeddedAttachmentCollection: function () {
                    return {
                        count: 1,
                        item: function () {
                            return {
                                bodyUri: messageAttachmentBodyUri,
                                contentId: "test.jpg@123abc"
                            };
                        }
                    };
                },
                sourceMessageStoreId: "1"
            };

        var documentFragment = document.createDocumentFragment(),
            img = document.createElement("img");
        img.src = sourceMessageAttachmentBodyUri;
        documentFragment.appendChild(img);

        factoryUtil.updateEmbeddedAttachments(documentFragment, sourceMessage, message);

        tc.areEqual(messageAttachmentBodyUri, img.src);
    });

})();
