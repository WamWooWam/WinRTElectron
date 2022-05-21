
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
//

/*jshint browser:true*/
/*global Jx, Mail, Microsoft, Tx, WinJS, People */

(function () {
    "use strict";

    var U = Mail.UnitTest,
        Platform = Microsoft.WindowsLive.Platform;

    var controls = [
        ".mailReadingPaneRespondButton",
        ".mailReadingPaneHeaderArea",
        ".mailReadingPaneImageDownloadStatusArea",
        ".mailReadingPaneFinishDownloadingFlyout",
        ".mailReadingPaneAttachmentWell",
        ".mailReadingPaneFrom",
        ".mailReadingPaneWarning",
        ".mailReadingPaneWarningTitle",
        ".mailReadingPaneWarningMessage",
        ".mailReadingPaneMissingBodyMessage",
        ".mailReadingPaneDate",
        ".mailReadingPaneTo",
        ".mailReadingPaneCC",
        ".mailReadingPaneBcc",
        { id: ".mailReadingPaneBodyFrame", type: "iframe" },
        ".mailReadingPaneBodyWrapper",
        ".mailReadingPaneSubjectArea",
        ".mailReadingPaneSubject",
        ".mailReadingPaneFlagGlyph",
        ".mailDraftEditButton",
        ".mailReadingPaneProgressWrapper",
        ".mailReadingPaneProgress",
        ".mailReadingPaneDateTime",
        ".mailReadingPaneDateContent",
        ".mailReadingPaneTimeContent",
        ".mailReadingPaneNoRecipientsContent",
        ".mailReadingPaneToContent",
        ".mailReadingPaneCCContent",
        ".mailReadingPaneBccContent",
        ".mailReadingPaneToLabel",
        ".mailReadingPaneCCLabel",
        ".mailReadingPaneBccLabel",
        "mailFrameReadingPane",
        ".mailReadingPaneContent",
        ".mailReadingPanePrintFrameHost",
        ".mailReadingPanePrintHeaderTemplate",
        ".mailReadingPaneExpandHeadersButton",
        ".mailReadingPaneExpandHeadersButtonLabel",
        ".mailReadingPaneDownloadImagesLink",
        ".mailReadingPaneHeaderDetails",
        "mailReadingPaneCalendarNotification",
        ".mailReadingPaneInviteArea",
        ".mailReadingPaneDownloadMessageLink",
        ".mailReadingPaneDownloadMessageLinkRetry",
        ".mailReadingPaneDownloadMessageProgress",
        ".mailReadingPaneDownloadMessageFailure",
        ".mailReadingPaneDownloadMessageFailureText"
    ];

    function setup (tc) {
        var originalCommandManager = Mail.Globals.commandManager,
            originalFlyout = WinJS.UI.Flyout,
            originalGUIState = Mail.guiState,
            originalGlomManager = Jx.glomManager,
            originalInstrumentation = Mail.Instrumentation,
            sandbox = document.getElementById("sandbox"),
            root = document.createElement("div");

        root.id = "idCompApp";
        sandbox.appendChild(root);
        tc.cleanup = function () {
            ["mailReadingPaneBodyFrame", "mailReadingPanePrintFrame", "mailReadingPanePrintHeaderFrame"].forEach(function (id) {
                var element = document.getElementById(id);
                if (element) {
                    element.removeNode(true /*deep*/);
                }
            });
            U.removeElements(controls);
            root.removeNode(true /*deep*/);
            tc.printHandler.deactivate(); // Ensure deactivated here in case activated in the test
            Mail.Globals.commandManager = originalCommandManager;
            Mail.UnitTest.disposeGlobals();
            Mail.UnitTest.restoreJx();
            Mail.UnitTest.restoreUtilities();
            WinJS.UI.Flyout = originalFlyout;
            Mail.guiState = originalGUIState;
            Jx.glomManager = originalGlomManager;
            Mail.Instrumentation = originalInstrumentation;
        };
        U.addElements(tc, controls, root);

        Mail.UnitTest.stubUtilities();
        Mail.UnitTest.setupCalendarStubs();
        Mail.UnitTest.setupModernCanvasStubs();
        Mail.UnitTest.stubJx(tc, "activation");
        Mail.UnitTest.stubJx(tc, "appData");
        Mail.UnitTest.stubJx(tc, "res");
        Mail.UnitTest.initGlobals(tc);
        Mail.Globals.commandManager = {
            filterCommands: function (cmds) { return cmds; },
            registerCommandHost: Jx.fnEmpty,
            registerShortcuts: Jx.fnEmpty,
            isValidCommandId: function () { return true; },
            addListener: Jx.fnEmpty,
            removeListener: Jx.fnEmpty,
            getContext: Jx.fnEmpty
        };

        WinJS.UI.Flyout = Jx.fnEmpty;

        Jx.glomManager = { isGlomOpen: function () { return false; }, getIsParent: function () { return false; } };

        Mail.Instrumentation = {
            instrumentTriageCommand: Jx.fnEmpty,
            Commands : {},
            UIEntryPoint: {}
        };

        // Get the PrintHandler singleton here to ensure deactivated in tearDown
        tc.printHandler = new Mail.PrintHandler();
   }

    function generateFakeICString (array) {
        return array.map(function (person) { return person.calculatedUIName; }).join("; ");
    }

    function getText(selector) {
        return document.querySelector(selector).innerText.replace(/[\n\r]/g, "");
    }

    function setupReadingPane(tc, folderType, folder) {
        U.setupStubs();
        U.setupAttachmentStubs();
        U.setupPrintStubs();
        U.setupShareStubs(tc);
        U.setupFormatStubs();

        Mail.guiState = {
            addListener: function () {},
            removeListener: function () {},
            isThreePane: true,
            isSnapped: false
        };

        return U.ensureSynchronous(function () {
            var result = {};
            result.platform = window.getMailPlatform();
            result.standardReadingPane = new Mail.StandardReadingPane("idCompApp", {
                setReadState: function (read, messages) { messages[0].platformMailMessage.read = read; }
            });
            result.readingPane = result.standardReadingPane._readingPane;
            result.readingPane.rootContentElementSelector = document;
            result.readingPane._insertIframes = function () { };

            result.readingPaneBody = result.readingPane._body;
            result.readingPane._body = {
                deactivateUI: Jx.fnEmpty,
                activateUI: Jx.fnEmpty,
                update: Jx.fnEmpty,
                addListener: Jx.fnEmpty,
                removeListener: Jx.fnEmpty,
                disposeOldContent: Jx.fnEmpty,
                clearMessage: Jx.fnEmpty,
                focusAfterReload: false,
                bodyContent: { bodyTypeShown: 1 }
            };
            result.ui = {};
            result.readingPane.getUI(result.ui);

            folder = folder || { objectId: "***ReadingPaneUnitTest***" };
            if (folderType !== undefined) {
                folder = result.platform.folderManager.getSpecialMailFolder(result.platform.accountManager.defaultAccount, folderType);
            }
            result.messageCollection = result.platform.mock$provider.query("MailMessage", "getFilteredMessageCollection", [folder.objectId, Platform.FilterCriteria.all]);
            var platformMessage = result.messageCollection.item(0),
                account = Mail.Account.load(platformMessage.accountId, result.platform);
            result.message = new Mail.UIDataModel.MailMessage(platformMessage, account);
            result.readingPane.activateUI();

            // Hide elements marked as hideOnReload
            var elements = document.querySelectorAll(".hideOnReload");
            for (var i = 0, max = elements.length; i < max; i++) {
                elements[i].classList.add("hidden");
            }

            U.ensureSynchronous(Mail.Globals.appState.setSelectedMessages, Mail.Globals.appState, [result.message, -1, []]);
            result.readingPane.onNewSelectedMessageSynchronous(result.message);
            result.readingPane._header._updateHeader();

            return result;
        });
    }

    Tx.test("ReadingPane_UnitTest.test_ReadingPane", function (tc) {
        setup(tc);

        var readingPane = setupReadingPane(tc);

        tc.areEqual(generateFakeICString([readingPane.message.from]), getText(".mailReadingPaneSingleFrom"));
        tc.areEqual(generateFakeICString(readingPane.message.headerRecipients), getText(".mailReadingPaneSingleFrom"));
        tc.areEqual(readingPane.message.subject, getText(".mailReadingPaneSubject"));
        tc.areEqual(generateFakeICString(readingPane.message.to), getText(".mailReadingPaneToContent"));
        tc.areEqual(generateFakeICString(readingPane.message.cc), getText(".mailReadingPaneCCContent"));
        tc.areEqual(generateFakeICString(readingPane.message.bcc), getText(".mailReadingPaneBccContent"));

        tc.isFalse(document.querySelector(".mailReadingPaneSingleFrom").classList.contains("hidden"));
        tc.isTrue(document.querySelector(".mailReadingPaneBehalfArea").classList.contains("hidden"));
        tc.isTrue(document.querySelector(".mailReadingPaneWarningTitle").classList.contains("hidden"));
        tc.isTrue(document.querySelector(".mailReadingPaneWarningMessage").classList.contains("hidden"));
        tc.isTrue(document.querySelector(".mailReadingPaneNoRecipients").classList.contains("hidden"));

        // Can't test the message body because creating an iframe in the liveunit test page causes all further liveunit tests to fail.
    });

    Tx.test("ReadingPane_UnitTest.test_ReadingPane_NoRecipients", function (tc) {
        setup(tc);

        var readingPane = setupReadingPane(tc, undefined, { objectId: "***ReadingPaneNoReceiverUnitTest***"});

        tc.areEqual(generateFakeICString([readingPane.message.from]), getText(".mailReadingPaneSingleFrom"));
        tc.areEqual(generateFakeICString(readingPane.message.headerRecipients), getText(".mailReadingPaneSingleFrom"));
        tc.areEqual(readingPane.message.subject, getText(".mailReadingPaneSubject"));
        tc.areEqual(generateFakeICString(readingPane.message.to), getText(".mailReadingPaneToContent"));
        tc.areEqual(generateFakeICString(readingPane.message.cc), getText(".mailReadingPaneCCContent"));
        tc.areEqual(generateFakeICString(readingPane.message.bcc), getText(".mailReadingPaneBccContent"));

        tc.isFalse(document.querySelector(".mailReadingPaneSingleFrom").classList.contains("hidden"));
        tc.isTrue(document.querySelector(".mailReadingPaneBehalfArea").classList.contains("hidden"));
        tc.isTrue(document.querySelector(".mailReadingPaneWarningTitle").classList.contains("hidden"));
        tc.isTrue(document.querySelector(".mailReadingPaneWarningMessage").classList.contains("hidden"));
        tc.isFalse(document.querySelector(".mailReadingPaneNoRecipients").classList.contains("hidden"));

        // Can't test the message body because creating an iframe in the liveunit test page causes all further liveunit tests to fail.
    });

    Tx.test("ReadingPane_UnitTest.test_ReadingPane_drafts", function (tc) {
        setup(tc);

        var readingPane = setupReadingPane(tc, Platform.MailFolderType.drafts);

        tc.areEqual(generateFakeICString([readingPane.message.from]), getText(".mailReadingPaneSingleFrom"));
        tc.areEqual(Jx.res.getString("mailMessageListDraftPrefix") + readingPane.message.subject, getText(".mailReadingPaneSubject"));
        tc.areEqual(generateFakeICString(readingPane.message.to), getText(".mailReadingPaneToContent"));
        tc.areEqual(generateFakeICString(readingPane.message.cc), getText(".mailReadingPaneCCContent"));
        tc.areEqual(generateFakeICString(readingPane.message.bcc), getText(".mailReadingPaneBccContent"));

        tc.isTrue(document.querySelector(".mailReadingPaneWarningTitle").classList.contains("hidden"));
        tc.isTrue(document.querySelector(".mailReadingPaneWarningMessage").classList.contains("hidden"));
        tc.isTrue(document.querySelector(".mailReadingPaneNoRecipients").classList.contains("hidden"));

        // Can't test the message body because creating an iframe in the liveunit test page causes all further liveunit tests to fail.
    });

    Tx.test("ReadingPane_UnitTest.test_ReadingPane_outbox", function (tc) {
        setup(tc);

        var readingPane = setupReadingPane(tc, Platform.MailFolderType.outbox);

        tc.areEqual(generateFakeICString([readingPane.message.from]), getText(".mailReadingPaneSingleFrom"));
        tc.areEqual(readingPane.message.subject, getText(".mailReadingPaneSubject"));
        tc.areEqual(generateFakeICString(readingPane.message.to), getText(".mailReadingPaneToContent"));
        tc.areEqual(generateFakeICString(readingPane.message.cc), getText(".mailReadingPaneCCContent"));
        tc.areEqual(generateFakeICString(readingPane.message.bcc), getText(".mailReadingPaneBccContent"));

        tc.isTrue(document.querySelector(".mailReadingPaneWarningTitle").classList.contains("hidden"));
        tc.isTrue(document.querySelector(".mailReadingPaneWarningMessage").classList.contains("hidden"));
        tc.isTrue(document.querySelector(".mailReadingPaneNoRecipients").classList.contains("hidden"));

        // Can't test the message body because creating an iframe in the liveunit test page causes all further liveunit tests to fail.
    });

    Tx.test("ReadingPane_UnitTest.test_ReadingPane_sentItems", function (tc) {
        setup(tc);

        var readingPane = setupReadingPane(tc, Platform.MailFolderType.sentItems);

        tc.areEqual(generateFakeICString([readingPane.message.from]), getText(".mailReadingPaneSingleFrom"));
        tc.areEqual(readingPane.message.subject, getText(".mailReadingPaneSubject"));
        tc.areEqual(generateFakeICString(readingPane.message.to), getText(".mailReadingPaneToContent"));
        tc.areEqual(generateFakeICString(readingPane.message.cc), getText(".mailReadingPaneCCContent"));
        tc.areEqual(generateFakeICString(readingPane.message.bcc), getText(".mailReadingPaneBccContent"));

        tc.isFalse(document.querySelector(".mailReadingPaneSingleFrom").classList.contains("hidden"));
        tc.isTrue(document.querySelector(".mailReadingPaneBehalfArea").classList.contains("hidden"));
        tc.isTrue(document.querySelector(".mailReadingPaneWarningTitle").classList.contains("hidden"));
        tc.isTrue(document.querySelector(".mailReadingPaneWarningMessage").classList.contains("hidden"));
        tc.isTrue(document.querySelector(".mailReadingPaneNoRecipients").classList.contains("hidden"));

        // Can't test the message body because creating an iframe in the liveunit test page causes all further liveunit tests to fail.
    });

    Tx.test("ReadingPane_UnitTest.test_ReadingPane_deletedItems", function (tc) {
        setup(tc);

        var readingPane = setupReadingPane(tc, Platform.MailFolderType.deletedItems);

        tc.areEqual(generateFakeICString([readingPane.message.from]), getText(".mailReadingPaneSingleFrom"));
        tc.areEqual(generateFakeICString(readingPane.message.headerRecipients), getText(".mailReadingPaneSingleFrom"));
        tc.areEqual(readingPane.message.subject, getText(".mailReadingPaneSubject"));
        tc.areEqual(generateFakeICString(readingPane.message.to), getText(".mailReadingPaneToContent"));
        tc.areEqual(generateFakeICString(readingPane.message.cc), getText(".mailReadingPaneCCContent"));
        tc.areEqual(generateFakeICString(readingPane.message.bcc), getText(".mailReadingPaneBccContent"));

        tc.isTrue(document.querySelector(".mailReadingPaneWarningTitle").classList.contains("hidden"));
        tc.isTrue(document.querySelector(".mailReadingPaneWarningMessage").classList.contains("hidden"));
        tc.isTrue(document.querySelector(".mailReadingPaneNoRecipients").classList.contains("hidden"));

        // Can't test the message body because creating an iframe in the liveunit test page causes all further liveunit tests to fail.
    });

    Tx.test("ReadingPane_UnitTest.test_ReadingPane_junkMail", function (tc) {
        setup(tc);

        var readingPane = setupReadingPane(tc, Platform.MailFolderType.junkMail);

        tc.areEqual(generateFakeICString([readingPane.message.from]), getText(".mailReadingPaneSingleFrom"));
        tc.areEqual(generateFakeICString(readingPane.message.headerRecipients), getText(".mailReadingPaneSingleFrom"));
        tc.areEqual(readingPane.message.subject, getText(".mailReadingPaneSubject"));
        tc.areEqual(generateFakeICString(readingPane.message.to), getText(".mailReadingPaneToContent"));
        tc.areEqual(generateFakeICString(readingPane.message.cc), getText(".mailReadingPaneCCContent"));
        tc.areEqual(generateFakeICString(readingPane.message.bcc), getText(".mailReadingPaneBccContent"));

        tc.isFalse(document.querySelector(".mailReadingPaneWarningTitle").classList.contains("hidden"));
        tc.isFalse(document.querySelector(".mailReadingPaneWarningMessage").classList.contains("hidden"));
        tc.isTrue(document.querySelector(".mailReadingPaneNoRecipients").classList.contains("hidden"));

        // Can't test the message body because creating an iframe in the liveunit test page causes all further liveunit tests to fail.
    });

    Tx.test("ReadingPane_UnitTest.test_ReadingPane_onBehalfOf_Inbox", function (tc) {
        setup(tc);

        var readingPane = setupReadingPane(tc, undefined, { objectId: "***ReadingPaneOnBehalfOfUnitTest***" });

        tc.areEqual(generateFakeICString([readingPane.message.senderRecipient]), getText(".mailReadingPaneBehalfSender"));
        tc.areEqual(generateFakeICString([readingPane.message.from]), getText(".mailReadingPaneBehalfFrom"));

        tc.isFalse(document.querySelector(".mailReadingPaneBehalfArea").classList.contains("hidden"));
        tc.isTrue(document.querySelector(".mailReadingPaneSingleFrom").classList.contains("hidden"));
    });

    Tx.test("ReadingPane_UnitTest.test_ReadingPane_onBehalfOf_SentItems", function (tc) {
        setup(tc);

        // Before rendering the reading pane, set up the current account's emails for on behalf of
        Mail.Globals.appState.selectedAccount.allEmailAddresses = [
            "account1@email.com",
            "account2@email.com",
            "account3@email.com",
            "account4@email.com"
        ];
        var readingPane = setupReadingPane(tc, undefined, { objectId: "***ReadingPaneOnBehalfOfSentItemsUnitTest***" });

        tc.areEqual(generateFakeICString([readingPane.message.senderRecipient]), getText(".mailReadingPaneBehalfSender"));
        tc.areEqual(generateFakeICString([readingPane.message.from]), getText(".mailReadingPaneBehalfFrom"));

        // Assert the "on behalf of" area is showing
        tc.isFalse(document.querySelector(".mailReadingPaneBehalfArea").classList.contains("hidden"));
        tc.isTrue(document.querySelector(".mailReadingPaneSingleFrom").classList.contains("hidden"));
    });

    Tx.test("ReadingPane_UnitTest.test_ReadingPane_onBehalfOf_SentItemsCurrentAccount", function (tc) {
        setup(tc);

        // Before rendering the reading pane, set up the current account's emails
        Mail.Globals.appState.selectedAccount.allEmailAddresses = [
            "account1@email.com",
            "account2@email.com",
            "account3@email.com",
            "account4@email.com"
        ];

        // This mail has from/sender as emails in the current account
        var readingPane = setupReadingPane(tc, undefined, { objectId: "***ReadingPaneOnBehalfOfSentItemsCurrentAccountUnitTest***" });

        // Assert that we got the correct user in the from area
        tc.areEqual(generateFakeICString([readingPane.message.from]), getText(".mailReadingPaneSingleFrom"));

        // Assert the "on behalf of" area is not showing
        tc.isTrue(document.querySelector(".mailReadingPaneBehalfArea").classList.contains("hidden"));
        tc.isFalse(document.querySelector(".mailReadingPaneSingleFrom").classList.contains("hidden"));
    });

    Tx.test("ReadingPane_UnitTest.test_ReadingPane_onBehalfOf_SentItemsFromAccount", function (tc) {
        setup(tc);

        // Before rendering the reading pane, set up the current account's emails
        Mail.Globals.appState.selectedAccount.allEmailAddresses = [
            "account1@email.com",
            "account2@email.com",
            "account3@email.com",
            "account4@email.com"
        ];

        // This mail has only from (not sender) as an email in the current account
        var readingPane = setupReadingPane(tc, undefined, { objectId: "***ReadingPaneOnBehalfOfSentItemsFromCurrentAccountUnitTest***" });

        // Assert that we got the correct user in the from/behalf area
        tc.areEqual(generateFakeICString([readingPane.message.senderRecipient]), getText(".mailReadingPaneBehalfSender"));
        tc.areEqual(generateFakeICString([readingPane.message.from]), getText(".mailReadingPaneBehalfFrom"));

        // Assert the "on behalf of" area is showing
        tc.isFalse(document.querySelector(".mailReadingPaneBehalfArea").classList.contains("hidden"));
        tc.isTrue(document.querySelector(".mailReadingPaneSingleFrom").classList.contains("hidden"));
    });

    Tx.test("ReadingPane_UnitTest.test_ReadingPane_onBehalfOf_SentItemsNoFrom", function (tc) {
        setup(tc);

        // Before rendering the reading pane, set up the current account's emails
        Mail.Globals.appState.selectedAccount.allEmailAddresses = [
            "account1@email.com",
            "account2@email.com",
            "account3@email.com",
            "account4@email.com"
        ];

        // This mail is missing the from field
        setupReadingPane(tc, undefined, { objectId: "***ReadingPaneOnBehalfOfSentItemsNoFromUnitTest***" });

        // Assert that we got the correct user in the from area
        tc.areEqual("mailUIMailMessageNoRecipients", getText(".mailReadingPaneSingleFrom"));

        // Assert the "on behalf of" area is not showing
        tc.isTrue(document.querySelector(".mailReadingPaneBehalfArea").classList.contains("hidden"));
        tc.isFalse(document.querySelector(".mailReadingPaneSingleFrom").classList.contains("hidden"));
    });

    Tx.test("ReadingPane_UnitTest.test_markAsRead", function (tc) {
        setup(tc);

        var result = setupReadingPane(tc);
        var readingPane = result.readingPane;
         /// override update Body to no-op as we don't want to mess with the iframe during the UT
        readingPane._updateBody = function() {};
        Mail.Globals.splashScreen = {isShown: false};

        /// passed in a message that is unread
        var account = Mail.Account.load(result.messageCollection.item(1).accountId, result.platform),
            mailMessage1 = new Mail.UIDataModel.MailMessage(result.messageCollection.item(1), account),
            mailMessage2 = new Mail.UIDataModel.MailMessage(result.messageCollection.item(2), account);

        mailMessage1.platformMailMessage.read = false;
        tc.isFalse(mailMessage1.read, "Message 1 should be unread");
        mailMessage2.platformMailMessage.read = false;
        tc.isFalse(mailMessage2.read, "Message 2 should be unread");

        readingPane._getDocHidden = function () { return true; };
        readingPane.onNewSelectedMessageSynchronous(mailMessage1);
        readingPane.onNewSelectedMessageSynchronous(mailMessage2);
        tc.isFalse(mailMessage1.read, "The message 1 should not be marked as read when document hidden");
        tc.isFalse(mailMessage2.read, "The message 2 should not be marked as read when document hidden");

        readingPane._getDocHidden = function () { return false; };
        readingPane.onNewSelectedMessageSynchronous(mailMessage1);
        readingPane.onNewSelectedMessageSynchronous(mailMessage2);
        tc.isTrue(mailMessage1.read, "The message 1 should be marked as read");
        tc.isTrue(mailMessage2.read, "The message 2 should be marked as read");

        /// mark message 2 as unread while being display
        mailMessage2.platformMailMessage.read = false;

        /// make sure when the message unloads, it is still unread
        U.ensureSynchronous(Mail.Globals.appState.setSelectedMessages, Mail.Globals.appState, [mailMessage1, -1, []]);
        tc.isFalse(mailMessage2.read, "The message 2 should be still be unread because it was marked as unread while it was loaded");
    });

    Tx.test("ReadingPane_UnitTest.test_downloadMissingBodySuccess", function (tc) {
        setup(tc);

        var result = setupReadingPane(tc);
        var readingPane = result.readingPane;
        /// override update Body to no-op as we don't want to mess with the iframe during the UT
        readingPane._updateBody = function() {};
        Mail.Globals.splashScreen = {isShown: false};

        /// pass in a message that needs a body
        var platformMessage = result.messageCollection.item(1),
            account = Mail.Account.load(platformMessage.accountId, result.platform),
            mailMessage = new Mail.UIDataModel.MailMessage(platformMessage, account);
        platformMessage._needBody = true;
        var downloadRequested = false;
        mailMessage.downloadFullBody = function() {
            downloadRequested = true;
        };

        U.ensureSynchronous(function () {
            readingPane.onNewSelectedMessageSynchronous(mailMessage);
        });

        // When the message is selected, we should kick off a download of the full body and hide the frame
        tc.isTrue(downloadRequested, "The reading pane should have called downloadFullBody() on the message");
        tc.isTrue(document.querySelector(".mailReadingPaneBodyWrapper").classList.contains("hidden"), "The body frame should be hidden");

        // When the download finishes, we should show the body frame again
        mailMessage._platformMailMessage._needBody = false;
        var body = mailMessage._platformMailMessage.createBody();
        body.type = Platform.MailBodyType.sanitized;
        body.body = "some html goes here";
        mailMessage._platformMailMessage.commit();
        U.ensureSynchronous(function () {
            readingPane._truncate._messageChanged(["needBody"]);
        });
        tc.isFalse(document.querySelector(".mailReadingPaneBodyWrapper").classList.contains("hidden"), "The body frame should not be hidden");
    });

    Tx.test("ReadingPane_UnitTest.test_downloadMissingBodyFailure", function (tc) {
        setup(tc);

        var result = setupReadingPane(tc);
        var readingPane = result.readingPane;
        /// override update Body to no-op as we don't want to mess with the iframe during the UT
        readingPane._updateBody = function() {};
        Mail.Globals.splashScreen = {isShown: false};

        /// pass in a message that needs a body
        var platformMessage = result.messageCollection.item(1),
            account = Mail.Account.load(platformMessage.accountId, result.platform),
            mailMessage = new Mail.UIDataModel.MailMessage(platformMessage, account);
        platformMessage._needBody = true;
        var downloadRequested = false;
        mailMessage.downloadFullBody = function() {
            downloadRequested = true;
        };

        readingPane.onNewSelectedMessageSynchronous(mailMessage);

        // When the message is selected, we should kick off a download of the full body and hide the frame
        tc.isTrue(downloadRequested, "The reading pane should have called downloadFullBody() on the message");
        tc.isTrue(document.querySelector(".mailReadingPaneBodyWrapper").classList.contains("hidden"), "The body frame should be hidden");

        // If the user clicks the download link, that should also kick off a download of the full body.
        downloadRequested = false;
        readingPane._truncate._onDownloadLinkClick();
        tc.isTrue(downloadRequested, "The reading pane should have called downloadFullBody() on the message");

        // If the download fails, we should be showing an error message
        mailMessage._platformMailMessage._bodyDownloadStatus = Platform.BodyDownloadStatus.failed;
        var event = ["bodyDownloadStatus"];
        event.target = { objectId: mailMessage.objectId };
        U.ensureSynchronous(function () {
            readingPane._truncate._messageChanged(event);
        });
        tc.isFalse(document.querySelector(".mailReadingPaneMissingBodyMessage").classList.contains("hidden"), "The error message should not be hidden");
    });

    Tx.test("ReadingPane_UnitTest.test_Irm", function (tc) {
        setup(tc);

        var result = setupReadingPane(tc),
            readingPane = result.readingPane;
        tc.isTrue(document.querySelector(".mailReadingPaneSubject").classList.contains("mailReadingPaneSubjectSelection"), "The user should be able to copy");

        var platformMessage = result.messageCollection.item(1),
            account = Mail.Account.load(platformMessage.accountId, result.platform),
            mailMessage = new Mail.UIDataModel.MailMessage(platformMessage, account);
        readingPane.onNewSelectedMessageSynchronous(mailMessage);
        tc.isFalse(document.querySelector(".mailReadingPaneSubject").classList.contains("mailReadingPaneSubjectSelection"), "The user shouldn't be able to copy");
    });

    Tx.test("ReadingPane_UnitTest.test_Flag", function (tc) {
        setup(tc);

        var readingPane = setupReadingPane(tc),
            message = readingPane.message,
            platformMailMessage = message.platformMailMessage;

        tc.isFalse(message.flagged);
        tc.isFalse(document.querySelector(".mailReadingPaneFlagGlyph").classList.contains("flagged"));

        platformMailMessage.flagged = true;
        platformMailMessage.commit();
        tc.isTrue(readingPane.message.flagged);
        tc.isTrue(document.querySelector(".mailReadingPaneFlagGlyph").classList.contains("flagged"));

        platformMailMessage.flagged = false;
        platformMailMessage.commit();
        tc.isFalse(readingPane.message.flagged);
        tc.isFalse(document.querySelector(".mailReadingPaneFlagGlyph").classList.contains("flagged"));
    });

    Tx.test("ReadingPane_UnitTest.test_LayoutChanged", function (tc) {
        setup(tc);

        var readingPane = setupReadingPane(tc).readingPane,
            markedAsRead = false,
            activeElementSet = false,
            oldSetActiveElement = Mail.setActiveHTMLElement,
            oldGuiState = Mail.guiState,
            oldUtilities = Mail.Utilities;

        readingPane.markAsRead = function() {markedAsRead = true;};
        Mail.setActiveHTMLElement = function() {activeElementSet = true;};

        Mail.guiState = {isReadingPaneVisible: true};
        Mail.Utilities = {ComposeHelper:{isComposeShowing:false}};
        readingPane._onLayoutChanged();
        tc.isTrue(markedAsRead, "Expected message to be marked read");
        tc.isTrue(activeElementSet, "Expected activeElementChanged");

        markedAsRead = false;
        activeElementSet = false;
        Mail.guiState = {isReadingPaneVisible: false};
        Mail.Utilities = {ComposeHelper:{isComposeShowing:true}};
        readingPane._onLayoutChanged();
        tc.isFalse(markedAsRead, "Did not expect message to be marked read");
        tc.isFalse(activeElementSet, "Did not expect activeElementChanged");

        Mail.setActiveHTMLElement = oldSetActiveElement;
        Mail.guiState = oldGuiState;
        Mail.Utilities = oldUtilities;

    });

    Tx.test("ReadingPane_UnitTest.test_EditClicked", function (tc) {
        setup(tc);

        var readingPane = setupReadingPane(tc).readingPane,
            newChildCalled = false,
            oldGlomManager = readingPane._glomManager;

        readingPane._glomManager = { handleCommandBarNewChild:function() {newChildCalled = true;}};
        readingPane._editClicked();
        tc.isTrue(newChildCalled, "Clicking edit should switch to child window");

        readingPane._glomManager = oldGlomManager;
    });

    Tx.test("ReadingPane_UnitTest.test_HeaderControl", function (tc) {

        setup(tc);

        var readingPane = setupReadingPane(tc).readingPane;
        var getTooltip = readingPane._header._header._identityControls[0]._options.getTooltip;
        var onClick = readingPane._header._header._identityControls[0]._options.onClick;
        tc.isTrue(Jx.isFunction(getTooltip), "expected getTooltip()");
        tc.isTrue(Jx.isFunction(onClick), "expected getTooltip()");

        var emailAddress = "EmailAddy",
            toolTip = getTooltip({emailAddress:emailAddress, mockedType:Microsoft.WindowsLive.Platform.Recipient}, "DefaultTooltip");

        tc.isTrue(toolTip.indexOf(emailAddress) !== -1, "Expected tooltip to contain email address");

        toolTip = getTooltip({emailAddress:emailAddress, mockedType:Microsoft.WindowsLive.Platform.Recipient}, emailAddress + "DefaultTooltip");
        tc.isTrue(toolTip.substring(1).indexOf(emailAddress) === -1, "Duplicate email address in tooltip");

        var oldContactCard = People.ContactCard,
            showCalled = false;

        People.ContactCard = { show:function(person, node) {
                tc.areEqual(person, "person", "Expected person");
                tc.areEqual(node, "node", "Expected node");
                showCalled = true;
            }
        };

        onClick({person:"person"}, "node");
        tc.isTrue(showCalled, "Expected People.ContactCard.show to be called");

        People.ContactCard = oldContactCard;

        readingPane._header._header._isOverflowDetected = true;
        readingPane._header._header._setOverflowDetected(false);
        tc.isFalse(readingPane._header._header._isOverflowDetected, "Calling _setOverflowDetected did not change overflow state");

        var removeHiddenCalled = false;
        readingPane._header._header._removeHiddenICTabStops = function() { removeHiddenCalled = true; };
        readingPane._header._header._isOverflowDetected = false;
        readingPane._header._header._setOverflowDetected(true);
        tc.isTrue(readingPane._header._header._isOverflowDetected, "Calling _setOverflowDetected did not change overflow state");
        tc.isTrue(removeHiddenCalled, "Expected call to _removeHiddenICTabStops");


        var oldFlyout = readingPane._header._header._irmFlyout;

        readingPane._header._header._irmFlyout = { show:function(){ showCalled = true;}};

        showCalled = false;
        readingPane._header._header._onIrmKeyDown({keyCode:Jx.KeyCode.enter});
        tc.isTrue(showCalled);

        showCalled = false;
        readingPane._header._header._onIrmKeyDown({keyCode:Jx.KeyCode.space});
        tc.isTrue(showCalled);

        showCalled = false;
        readingPane._header._header._onIrmKeyDown({keyCode:Jx.KeyCode.e});
        tc.isFalse(showCalled);

        readingPane._header._header._irmFlyout = oldFlyout;

    });

    Tx.test("ReadingPane_UnitTest.test_ReadingPaneBody", function (tc) {
        setup(tc);
        var readingPaneBody = setupReadingPane(tc).readingPaneBody,
            eventFired = false,
            hook = Mail.EventHook.createGlobalHook(Mail.ReadingPaneBody.Events.frameClicked, function() {eventFired = true;});

        readingPaneBody._frameClickHandler();
        tc.isTrue(eventFired, "Expected 'frameClicked' event");
        hook.dispose();

        var oldCommandManager = Mail.Globals.commandManager,
            forwardedKeyEvent = false;

        Mail.Globals.commandManager = {
            executeShortcut:function () {
                forwardedKeyEvent = true;
            }
        };

        readingPaneBody._frameKeyDownHandler({preventDefault:Jx.fnEmpty, stopPropagation:Jx.fnEmpty, stopImmediatePropagation:Jx.fnEmpty});
        tc.isTrue(forwardedKeyEvent);
        Mail.Globals.commandManager = oldCommandManager;

        var oldGuiState = Mail.guiState,
            oldResetFrameSize = readingPaneBody._resetFrameSize,
            resized = false;

        Mail.guiState = { isReadingPaneVisible: false};
        readingPaneBody._resetFrameSize = function () {resized = true;};
        readingPaneBody._onLayoutChanged();
        tc.isFalse(resized);

        Mail.guiState = { isReadingPaneVisible: true};
        readingPaneBody._onLayoutChanged();
        tc.isTrue(resized);

        Mail.guiState = oldGuiState;
        readingPaneBody._resetFrameSize = oldResetFrameSize;

        readingPaneBody._setFocusAfterReload = false;
        readingPaneBody.focusAfterReload = true;
        tc.isTrue(readingPaneBody._setFocusAfterReload);

    });

    Tx.test("ReadingPane_UnitTest.test_onGlomCreated", function (tc) {
        setup(tc);

        var readingPane = setupReadingPane(tc).standardReadingPane,
            oldSelection = readingPane._selection,
            messageAid = "TestMessage A",
            messageBid = "TestMessage B",
            oldNewMessage = readingPane._onNewSelectedMessageSynchronous,
            newMessageCalled = false,
            oldGlomManager = Jx.glomManager;

        Jx.glomManager = { isGlomOpen: function () { return false; }, getIsParent: function () { return true; } };

        readingPane._onNewSelectedMessageSynchronous = function() { newMessageCalled = true;};


        readingPane._selection = {message:{objectId:messageAid, isDraft:false}};
        readingPane._onGlomCreated ({
            glom:{
                getGlomId:function() {
                    return messageAid;
                }
            }
        });
        tc.isFalse(newMessageCalled);

        readingPane._selection = {message:{objectId:messageAid, isDraft:true}};
        readingPane._onGlomCreated ({
            glom:{
                getGlomId:function() {
                    return messageBid;
                }
            }
        });
        tc.isFalse(newMessageCalled);

        readingPane._selection = {message:{objectId:messageAid, isDraft:true}};
        readingPane._onGlomCreated ({
            glom:{
                getGlomId:function() {
                    return messageAid;
                }
            }
        });
        tc.isTrue(newMessageCalled);

        readingPane._onNewSelectedMessageSynchronous = oldNewMessage;
        readingPane._selection = oldSelection;
        Jx.glomManager = oldGlomManager;
    });

    Tx.test("ReadingPane_UnitTest.test_onReleasingMessage", function (tc) {
        setup(tc);

        var readingPane = setupReadingPane(tc).standardReadingPane,
            oldSelection = readingPane._selection,
            messageAid = "TestMessage A",
            messageBid = "TestMessage B",
            oldPlatform = Mail.Globals.platform,
            waitCalled = false,
            oldGlomManager = Jx.glomManager;

        Jx.glomManager = { isGlomOpen: function () { return false; }, getIsParent: function () { return true; } };

        Mail.Globals.platform = {
            mailManager: {
                waitForInstanceNumberOnMessage: function() { waitCalled = true; }
            }
        };

        readingPane._selection = {message:{objectId:messageAid, isDraft:false}};
        readingPane._onReleasingMessage( {context:{messageId:messageAid}} );
        tc.isFalse(waitCalled);

        readingPane._selection = {message:{objectId:messageAid, isDraft:true}};
        readingPane._onReleasingMessage( {context:{messageId:messageBid}} );
        tc.isFalse(waitCalled);

        readingPane._selection = {message:{objectId:messageAid, isDraft:true}};
        readingPane._onReleasingMessage( {context:{messageId:messageAid}} );
        tc.isTrue(waitCalled);

        Mail.Globals.platform = oldPlatform;
        readingPane._selection = oldSelection;
        Jx.glomManager = oldGlomManager;
    });

    Tx.test("ReadingPane_UnitTest.test_subjectAreaFlagged", function (tc) {
        setup(tc);

        function validateSubject(tc, element, str, disabled, classes) {
            tc.isTrue(element.tagName === "DIV");
            tc.isTrue(element.tabIndex === -1);
            tc.isTrue(element.title === str);
            tc.isTrue(element.getAttribute("aria-label") === str);
            tc.isTrue(element.innerText === '');
            tc.isTrue(element.disabled === disabled);
            classes.forEach(function (cl) {
                tc.isTrue(element.classList.contains(cl));
            });
            tc.isTrue(element.classList.length === classes.length);
        }

        var subjectArea = setupReadingPane(tc).readingPane._subjectArea;

        subjectArea._message._platformMailMessage._canFlag = true;
        subjectArea._message._platformMailMessage._flagged = true;
        subjectArea._updateFlagGlyph();
        validateSubject(tc, subjectArea._flagElement, 'mailReadingPaneUnflagTooltip', false, ['mailReadingPaneFlagGlyph', 'flagged']);

        subjectArea._message._platformMailMessage._canFlag = true;
        subjectArea._message._platformMailMessage._flagged = false;
        subjectArea._updateFlagGlyph();
        validateSubject(tc, subjectArea._flagElement, 'mailReadingPaneFlagTooltip', false, ['mailReadingPaneFlagGlyph']);

        subjectArea._message._platformMailMessage._canFlag = false;
        subjectArea._message._platformMailMessage._flagged = true;
        subjectArea._updateFlagGlyph();
        validateSubject(tc, subjectArea._flagElement, 'mailReadingPaneFlaggedTooltip', true, ['mailReadingPaneFlagGlyph', 'flagged']);

        subjectArea._message._platformMailMessage._canFlag = false;
        subjectArea._message._platformMailMessage._flagged = false;
        subjectArea._updateFlagGlyph();
        validateSubject(tc, subjectArea._flagElement, 'mailReadingPaneFlaggedTooltip', true, ['mailReadingPaneFlagGlyph', 'hidden']);

    });

    Tx.test("ReadingPane_UnitTest.test_subjectAreaFlagClick", function (tc) {
        setup(tc);

        var subjectArea = setupReadingPane(tc).readingPane._subjectArea,
            oldInstrument = Mail.Instrumentation.instrumentTriageCommand,
            oldSelection = subjectArea._selection,
            commandInstrumented = false,
            flagSet = false,
            showFlag = null;

        Mail.Instrumentation.instrumentTriageCommand = function() {commandInstrumented = true;};
        subjectArea._selection = {
            setFlagState:function(flagValue) {
                flagSet = true;
                showFlag = flagValue;
            }
        };
        subjectArea._message._platformMailMessage._flagged = true;
        subjectArea._onFlagGlyphClick();
        tc.isTrue(flagSet);
        tc.isTrue(Jx.isBoolean(showFlag) && !showFlag);
        tc.isTrue(commandInstrumented);
        tc.isTrue(subjectArea._flagElement.classList.contains("pressed"));
        subjectArea._onFlagGlyphMouseOut();
        tc.isFalse(subjectArea._flagElement.classList.contains("pressed"));

        subjectArea._selection = oldSelection;
        Mail.Instrumentation.instrumentTriageCommand = oldInstrument;

    });

    Tx.test("ReadingPane_UnitTest.test_shareHandler", function (tc) {
        var shareHandler = new Mail.ShareHandler(),
            oldBestReadingBody = Mail.ShareHandler.prototype._getBestReadingBody,
            failedShare = false,
            dataRequest = {
                request:{
                    failWithDisplayText:function() {
                        failedShare = true;
                    },
                    data: null
                }
            };

        Mail.ShareHandler.prototype._getBestReadingBody = function () {
            return { contentWindow:window, nodeType:1 };
        };

        failedShare = false;
        shareHandler._onShareSourceDataRequested(dataRequest);
        tc.isFalse(dataRequest.request.data === null);
        tc.isFalse(failedShare);

        shareHandler.dispose();
        Mail.ShareHandler.prototype._getBestReadingBody = oldBestReadingBody;
    });

})();
