
//
// Copyright (C) Microsoft. All rights reserved.
//

/*global Microsoft, Mocks, Mail*/

(function () {

    var Plat = Microsoft.WindowsLive.Platform;
    var D = Mocks.Microsoft.WindowsLive.Platform.Data;

    Mail.makeUnitTestPlatform = function () {
        return new D.JsonProvider({
            Account: {
                "default": [{
                        objectId: "defaultAccount00",
                        mailScenarioState: Plat.ScenarioState.connected
                }],
                "connected": [
                    "defaultAccount00",
                    { displayName: "Gmail", iconMediumUrl: "http://regmedia.co.uk/2007/10/24/gmail_logo_75.jpg", emailAddress: "psa-test@gmail.com", mock$configureType: Plat.ConfigureType.editOnClient },
                ],
                "***accountListUnitTestOneAccount***" : [
                    "defaultAccount00"
                ],
                "***accountListUnitTestTwoAccounts***" : [
                    "defaultAccount00",
                    { displayName: "Gmail", iconMediumUrl: "http://regmedia.co.uk/2007/10/24/gmail_logo_75.jpg", emailAddress: "psa-test@gmail.com", mock$configureType: Plat.ConfigureType.editOnClient }
                ]
            },
            MailMessage: {
                "getFilteredMessageCollection_***ReadingPaneUnitTest***_0": [
                    {
                        from: "kepoon@microsoft.com",
                        to: "geoffcl@microsoft.com; kepoon@microsoft.com",
                        cc: "benchung@microsoft.com",
                        bcc: "athane@microsoft.com; kevbarn@microsoft.com",
                        subject: "If you don't get this mail, your UT is failing",
                        received: new Date(1299806034556),
                        hasOrdinaryAttachments: true,
                        importance: Plat.MailMessageImportance.high,
                        lastVerb: Plat.MailMessageLastVerb.replyToSender,
                        mock$body: [{
                            type: Plat.MailBodyType.html,
                            body: "<html><body>Hello World</body></html>"
                        }],
                        irmCanExtractContent: true,
                        preview: "Using mut in the mail branch",
                        read: false,
                        accountId: "defaultAccount00",
                        displayViewIds: ["***InboxView***"]
                    }, {
                        from: "kepoon@microsoft.com",
                        to: "geoffcl@microsoft.com; kepoon@microsoft.com",
                        cc: "benchung@microsoft.com",
                        bcc: "athane@microsoft.com; kevbarn@microsoft.com",
                        subject: "If you don't get this mail, your UT is failing",
                        received: new Date(1299806034556),
                        hasOrdinaryAttachments: true,
                        importance: Plat.MailMessageImportance.high,
                        lastVerb: Plat.MailMessageLastVerb.replyToSender,
                        mock$body: [{
                            type: Plat.MailBodyType.html,
                            body: "<html><body>Hello World</body></html>"
                        }],
                        irmCanExtractContent: false,
                        preview: "Using mut in the mail branch",
                        read: false,
                        accountId: "defaultAccount00",
                        displayViewIds: ["***InboxView***"]
                    }, {
                        from: "kepoon@microsoft.com",
                        to: "geoffcl@microsoft.com; kepoon@microsoft.com",
                        cc: "benchung@microsoft.com",
                        bcc: "athane@microsoft.com; kevbarn@microsoft.com",
                        subject: "If you don't get this mail, your UT is failing",
                        received: new Date(1299806034556),
                        hasOrdinaryAttachments: true,
                        importance: Plat.MailMessageImportance.high,
                        lastVerb: Plat.MailMessageLastVerb.replyToSender,
                        mock$body: [{
                            type: Plat.MailBodyType.html,
                            body: "<html><body>Hello World</body></html>"
                        }],
                        preview: "Using mut in the mail branch",
                        read: false,
                        accountId: "defaultAccount00",
                        displayViewIds: ["***InboxView***"]
                    }
                ],
                "getFilteredMessageCollection_***ReadingPaneNoReceiverUnitTest***_0": [
                    {
                        from: "Andrew Hall <andrha@microsoft.com>",
                        to: "",
                        cc: "",
                        bcc: "",
                        subject: "No Recipients Test",
                        received: new Date(1092815960000),
                        mock$body: [{
                            type: Plat.MailBodyType.plainText,
                            body: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
                        }],
                        preview: "Lorem ipsum dolor sit amet, consectetur",
                        accountId: "defaultAccount00",
                        displayViewIds: ["***InboxView***"]
                    }
                ],
                "getFilteredMessageCollection_***ReadingPaneOnBehalfOfUnitTest***_0": [
                    {
                        from: "eihash@microsoft.com",
                        to: "geoffcl@microsoft.com; kepoon@microsoft.com",
                        cc: "benchung@microsoft.com",
                        bcc: "athane@microsoft.com; kevbarn@microsoft.com",
                        subject: "On Behalf Of test",
                        sender: "yuhkiyam@microsoft.com",
                        received: new Date(1092815960000),
                        mock$body: [{
                            type: Plat.MailBodyType.plainText,
                            body: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
                        }],
                        preview: "Lorem ipsum dolor sit amet, consectetur",
                        accountId: "defaultAccount00",
                        displayViewIds: ["***InboxView***"]
                    }
                ],
                "getFilteredMessageCollection_***ReadingPaneOnBehalfOfSentItemsUnitTest***_0": [
                    {
                        from: "eihash@microsoft.com",
                        to: "geoffcl@microsoft.com; kepoon@microsoft.com",
                        cc: "benchung@microsoft.com",
                        bcc: "athane@microsoft.com; kevbarn@microsoft.com",
                        subject: "On Behalf Of test",
                        sender: "yuhkiyam@microsoft.com",
                        received: new Date(1092815960000),
                        sent: new Date(1092815960000),
                        mock$body: [{
                            type: Plat.MailBodyType.plainText,
                            body: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
                        }],
                        preview: "Lorem ipsum dolor sit amet, consectetur",
                        accountId: "defaultAccount00",
                        displayViewIds: ["***SentItemsView***"]
                    }
                ],
                "getFilteredMessageCollection_***ReadingPaneOnBehalfOfSentItemsCurrentAccountUnitTest***_0": [
                    {
                        from: "Account2@email.com",
                        to: "geoffcl@microsoft.com; kepoon@microsoft.com",
                        cc: "benchung@microsoft.com",
                        bcc: "athane@microsoft.com; kevbarn@microsoft.com",
                        subject: "On Behalf Of test",
                        sender: "Account1@email.com",
                        received: new Date(1092815960000),
                        sent: new Date(1092815960000),
                        mock$body: [{
                            type: Plat.MailBodyType.plainText,
                            body: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
                        }],
                        preview: "Lorem ipsum dolor sit amet, consectetur",
                        accountId: "defaultAccount00",
                        displayViewIds: ["***SentItemsView***"]
                    }
                ],
                "getFilteredMessageCollection_***ReadingPaneOnBehalfOfSentItemsFromCurrentAccountUnitTest***_0": [
                    {
                        from: "account2@email.com",
                        to: "geoffcl@microsoft.com; kepoon@microsoft.com",
                        cc: "benchung@microsoft.com",
                        bcc: "athane@microsoft.com; kevbarn@microsoft.com",
                        subject: "On Behalf Of test",
                        sender: "yuhkiyam@microsoft.com",
                        received: new Date(1092815960000),
                        sent: new Date(1092815960000),
                        mock$body: [{
                            type: Plat.MailBodyType.plainText,
                            body: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
                        }],
                        preview: "Lorem ipsum dolor sit amet, consectetur",
                        accountId: "defaultAccount00",
                        displayViewIds: ["***SentItemsView***"]
                    }
                ],
                "getFilteredMessageCollection_***ReadingPaneOnBehalfOfSentItemsNoFromUnitTest***_0": [
                    {
                        // From is missing
                        to: "geoffcl@microsoft.com; kepoon@microsoft.com",
                        cc: "benchung@microsoft.com",
                        bcc: "athane@microsoft.com; kevbarn@microsoft.com",
                        subject: "On Behalf Of test",
                        sender: "yuhkiyam@microsoft.com",
                        received: new Date(1092815960000),
                        sent: new Date(1092815960000),
                        mock$body: [{
                            type: Plat.MailBodyType.plainText,
                            body: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
                        }],
                        preview: "Lorem ipsum dolor sit amet, consectetur",
                        accountId: "defaultAccount00",
                        displayViewIds: ["***SentItemsView***"]
                    }
                ],
                "getFilteredMessageCollection_MessageList_UnitTest_0": [
                    {
                        from: "kepoon@microsoft.com",
                        to: "geoffcl@microsoft.com; kepoon@microsoft.com",
                        cc: "benchung@microsoft.com",
                        bcc: "athane@microsoft.com; kevbarn@microsoft.com",
                        subject: "If you don't get this mail, your UT is failing",
                        received: new Date(1299806034556),
                        hasOrdinaryAttachments: true,
                        importance: Plat.MailMessageImportance.high,
                        lastVerb: Plat.MailMessageLastVerb.replyToSender,
                        calendarMessageType: Plat.CalendarMessageType.none,
                        mock$body: [{
                            type: Plat.MailBodyType.html,
                            body: "<html><body>Hello World</body></html>"
                        }],
                        irmHasTemplate: true,
                        preview: "Using mut in the mail branch",
                        read: false,
                        accountId: "defaultAccount00",
                        displayViewIds: ["***InboxView***"]
                    }, {
                        from: "Geeven",
                        to: "Geoff; Kelvin",
                        cc: "Ben",
                        bcc: "Anthony; Kevin",
                        subject: "This mail just got moved from another folder!",
                        received: new Date(1299806024556),
                        importance: Plat.MailMessageImportance.low,
                        lastVerb: Plat.MailMessageLastVerb.replyToAll,
                        calendarMessageType: Plat.CalendarMessageType.request,
                        mock$body: [{
                            type: Plat.MailBodyType.plainText,
                            body: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
                        }],
                        irmHasTemplate: false,
                        preview: "anim id est laborum.",
                        read: true,
                        accountId: "defaultAccount00",
                        displayViewIds: ["***InboxView***"]
                    },{
                        from: "Ma Lin",
                        to: "Geoff; Kelvin",
                        cc: "Ben",
                        bcc: "Anthony; Kevin",
                        subject: "How to do a ghost serve",
                        received: new Date(1299806014556),
                        lastVerb: Plat.MailMessageLastVerb.forward,
                        calendarMessageType: Plat.CalendarMessageType.responseAccepted,
                        mock$body: [{
                            type: Plat.MailBodyType.plainText,
                            body: "culpa qui officia deserunt mollit anim id est laborum."
                        }],
                        irmHasTemplate: false,
                        preview: "anim id est laborum.",
                        read: false,
                        accountId: "defaultAccount00",
                        displayViewIds: ["***InboxView***"]
                    },{
                        from: "jwatson@microsoft.com",
                        to: "geevens@microsoft.com; uamartimus@gmail.com",
                        cc: "neilpa@microsoft.com; jspivey@microsoft.com; jaredru@microsoft.com",
                        subject: "IF FTW (Watson spam)",
                        received: new Date(1299806004556),
                        calendarMessageType: Plat.CalendarMessageType.responseTentative,
                        mock$body: [{
                            type: Plat.MailBodyType.plainText,
                            body: "Geeven wanted non-(fad|blog) sources for my fasting claims.  Here's a small sampling:\r\n\r\n1) Source: Journal of Molecular and Cellular Cardiology. Volume 46, Issue 3, March 2009, Pages 405-412\r\n\r\nSummary: \"Chronic intermittent fasting markedly improves the long-term survival after Chronic Heart Failure by activation through its pro-angiogenic (development of blood vessels), anti-apoptotic (apoptosis === cell death) and anti-remodeling (cardiac remodeling is apparently bad) effects.\"\r\n\r\nhttp://www.sciencedirect.com/science?_ob=ArticleURL&_udi=B6WK6-4TX33WR-1&_user=10&_coverDate=03/31/2009&_rdoc=1&_fmt=high&_orig=gateway&_origin=gateway&_sort=d&_docanchor=&view=c&_acct=C000050221&_version=1&_urlVersion=0&_userid=10&md5=5ebeb35fe38e3df9a4d34182786447a4&searchtype=a\r\n\r\n2) Source: National Institutes of Health\r\n\r\nSummary:  \"IF may function as a form of nutritional hormesis.\"\r\nhttp://www.ncbi.nlm.nih.gov/pubmed/17913594\r\n\r\n3) Source: National Institute of Aging (division of National Institutes of Health) http://en.wikipedia.org/wiki/National_Institute_on_Aging\r\nR. Michael Anson, Zhihong Guo, Rafael de Cabo, Titilola Iyun, Michelle Rios, Adrienne Hagepanos, Donald K. Ingram, Mark A. LaneDagger, Mark P. Mattson. Intermittent fasting dissociates beneficial effects of dietary restriction on glucose metabolism and neuronal resistance to injury from calorie intake. PNAS | May 13, 2003 | vol. 100 | no. 10 | 6216-6220\r\n\r\nSummary: \"IF mice had lower blood sugar and insulin levels than control group.  After being injected w/ neurotoxin (Kainic acid), less damage was seen in IF mice compared to control group.\r\n http://www.ncbi.nlm.nih.gov/pubmed/12724520\r\n\r\n4) Source: (National Institutes of Health):\r\n\r\nSummary: IF = protection against gamma-irradiation (goes along with IF improving resistance to oxidative stress in general)\r\nhttp://www.ncbi.nlm.nih.gov/pubmed/6761903\r\n\r\n5) Source: NIA\r\n\r\nSummary: Intermittent fasting ameliorates age-related behavioral deficits in the triple-transgenic mouse model of Alzheimer's disease\r\nhttp://www.ncbi.nlm.nih.gov/pubmed/17306982\r\n\r\n6) Source: Department of Nutritional Sciences and Toxicology, University of California at Berkeley, Berkeley, CA\r\n\r\nSummary: I'll grant that it ends with \"More research is required to establish definitively the consequences of ADF (Alternate Day Fasting).\"\r\n\"The findings in animals suggest that ADF may effectively modulate several risk factors, thereby preventing chronic disease, and that ADF may modulate disease risk to an extent similar to that of CR (caloric restriction).\"\r\nThe risk factors to which they refer are:\r\nlower diabetes incidence, lower fasting glucose/insulin concentrations, lower total cholesterol, lower triacylglycerol levels, lower heart rate,  improved cardiac response to myocardial infarction, and lower blood pressure.\r\n http://www.ncbi.nlm.nih.gov/pubmed/17616757\r\n\r\n7) Annals of Nutrition & Metabolism\r\n\r\nSummary: Those practicing Ramadan (food/beverage restricted to nighttime) showed positive effects on inflammatory status and risk factors for cardiovascular diseases.\r\n http://content.karger.com/ProdukteDB/produkte.asp?Aktion=ShowAbstract&ArtikelNr=100954&Ausgabe=232822&ProduktNr=223977\r\n"
                        }],
                        irmHasTemplate: false,
                        preview: "Geeven wanted non-(fad|blog) sources for my",
                        accountId: "defaultAccount00",
                        displayViewIds: ["***InboxView***"]
                    }
                ],
                "getFilteredMessageCollection_MailHeaderRenderer_Unittest_SentItem_0": [
                    {
                        from: "Not a real person",
                        to: "You",
                        cc: "No really, you!",
                        subject: "message in sent items",
                        sent: new Date(7740287760000),
                        mock$body: [{
                            type: Plat.MailBodyType.plainText,
                            body: "We were unable to make the real platform.  Something went wrong.  If you're running in IE, this is expected.  If you're running in WWAHost, did you set the working directory to the appx-root?  Are you running on PDC-7 (build 7950 with VSExpress for Win8)?  Do you have script debugging enabled?  If all of these things are true, feel free to ask Geeven to investigate."
                        }],
                        irmHasTemplate: true,
                        preview: "We were unable to make the real platform.",
                        read: false,
                        accountId: "defaultAccount00",
                        displayViewIds: ["***SentItemsView***"]
                    }, {
                        from: "geevens@microsoft.com",
                        to: "geoffcl@microsoft.com; kepoon@microsoft.com",
                        cc: "benchung@microsoft.com",
                        bcc: "athane@microsoft.com; kevbarn@microsoft.com",
                        subject: "another message in sent items",
                        sent: new Date(7740286460000),
                        mock$body: [{
                            type: Plat.MailBodyType.plainText,
                            body: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
                        }],
                        irmHasTemplate: false,
                        preview: "Lorem ipsum dolor sit amet, consectetur",
                        read: true,
                        accountId: "defaultAccount00",
                        displayViewIds: ["***SentItemsView***"]
                    }, {
                        from: "daeng@microsoft.com",
                        to: "",
                        cc: "kepoon@microsoft.com",
                        bcc: "tonypan@microsoft.com",
                        subject: "To no one in particular",
                        sent: new Date(7740286460000),
                        mock$body: [{
                            type: 2,
                            body: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
                        }],
                        irmHasTemplate: false,
                        preview: "Lorem ipsum dolor sit amet, consectetur",
                        read: true,
                        accountId: "defaultAccount00",
                        displayViewIds: ["***SentItemsView***"]
                    }
                ],
                "getFilteredMessageCollection_***Inbox***_0": [
                    {
                        from: "Not a real person",
                        to: "You",
                        cc: "No really, you!",
                        subject: "You are not using the real platform!",
                        received: new Date(1299806034556),
                        importance: Plat.MailMessageImportance.high,
                        mock$body: [{
                            type: Plat.MailBodyType.plainText,
                            body: "We were unable to make the real platform.  Something went wrong.  If you're running in IE, this is expected.  If you're running in WWAHost, did you set the working directory to the appx-root?  Are you running on PDC-7 (build 7950 with VSExpress for Win8)?  Do you have script debugging enabled?  If all of these things are true, feel free to ask Geeven to investigate."
                        }],
                        preview: "We were unable to make the real platform.",
                        read: false,
                        accountId: "defaultAccount00",
                        displayViewIds: ["***InboxView***"]
                    }
                ],
                "getFilteredMessageCollection_***Drafts***_0": [
                    {
                        from: "Not a real person",
                        to: "You",
                        cc: "No really, you!",
                        subject: "drafts, drafts, drafts...",
                        modified: new Date(7740286760000),
                        mock$body: [{
                            type: Plat.MailBodyType.plainText,
                            body: "We were unable to make the real platform.  Something went wrong.  If you're running in IE, this is expected.  If you're running in WWAHost, did you set the working directory to the appx-root?  Are you running on PDC-7 (build 7950 with VSExpress for Win8)?  Do you have script debugging enabled?  If all of these things are true, feel free to ask Geeven to investigate."
                        }],
                        preview: "We were unable to make the real platform.",
                        read: false,
                        accountId: "defaultAccount00",
                        displayViewIds: ["***DraftsView***"]
                    }
                ],
                "getFilteredMessageCollection_***Outbox***_0": [
                    {
                        from: "Not a real person",
                        to: "You",
                        cc: "No really, you!",
                        subject: "message in the outbox",
                        modified: new Date(7740286730000),
                        mock$body: [{
                            type: Plat.MailBodyType.plainText,
                            body: "We were unable to make the real platform.  Something went wrong.  If you're running in IE, this is expected.  If you're running in WWAHost, did you set the working directory to the appx-root?  Are you running on PDC-7 (build 7950 with VSExpress for Win8)?  Do you have script debugging enabled?  If all of these things are true, feel free to ask Geeven to investigate."
                        }],
                        preview: "We were unable to make the real platform.",
                        read: false,
                        accountId: "defaultAccount00",
                        displayViewIds: ["***OutboxView***"]
                    }
                ],
                "getFilteredMessageCollection_***SentItems***_0": [
                    {
                        from: "Not a real person",
                        to: "You",
                        cc: "No really, you!",
                        subject: "message in sent items",
                        sent: new Date(7740287760000),
                        mock$body: [{
                            type: Plat.MailBodyType.plainText,
                            body: "We were unable to make the real platform.  Something went wrong.  If you're running in IE, this is expected.  If you're running in WWAHost, did you set the working directory to the appx-root?  Are you running on PDC-7 (build 7950 with VSExpress for Win8)?  Do you have script debugging enabled?  If all of these things are true, feel free to ask Geeven to investigate."
                        }],
                        preview: "We were unable to make the real platform.",
                        read: false,
                        accountId: "defaultAccount00",
                        displayViewIds: ["***SentItemsView***"]
                    }
                ],
                "getFilteredMessageCollection_***DeletedItems***_0": [
                    {
                        from: "Not a real person",
                        to: "You",
                        cc: "No really, you!",
                        subject: "deleted mail",
                        received: new Date(7740286734000),
                        mock$body: [{
                            type: Plat.MailBodyType.plainText,
                            body: "We were unable to make the real platform.  Something went wrong.  If you're running in IE, this is expected.  If you're running in WWAHost, did you set the working directory to the appx-root?  Are you running on PDC-7 (build 7950 with VSExpress for Win8)?  Do you have script debugging enabled?  If all of these things are true, feel free to ask Geeven to investigate."
                        }],
                        preview: "We were unable to make the real platform.",
                        read: false,
                        accountId: "defaultAccount00",
                        displayViewIds: ["***DeletedItemsView***"]
                    }
                ],
                "getFilteredMessageCollection_***JunkMail***_0": [
                    {
                        from: "Not a real person",
                        to: "You",
                        cc: "No really, you!",
                        subject: "Junk Mail #1",
                        received: new Date(2942903489000),
                        mock$body: [{
                            type: Plat.MailBodyType.html,
                            body: "<html xmlns:v=\"urn:schemas-microsoft-com:vml\" xmlns:o=\"urn:schemas-microsoft-com:office:office\" xmlns:w=\"urn:schemas-microsoft-com:office:word\" xmlns:m=\"http://schemas.microsoft.com/office/2004/12/omml\" xmlns=\"http://www.w3.org/TR/REC-html40\"> <head> <meta http-equiv=Content-Type content=\"text/html; charset=windows-1252\"> <meta name=ProgId content=Word.Document> <meta name=Generator content=\"Microsoft Word 14\"> <meta name=Originator content=\"Microsoft Word 14\"> <link rel=File-List href=\"Commitment_files/filelist.xml\"> <link rel=Edit-Time-Data href=\"Commitment_files/editdata.mso\"> <!--[if gte mso 9]><xml> <o:DocumentProperties> <o:Author>Geeven Singh</o:Author> <o:Template>NormalEmail.dotm</o:Template> <o:Revision>1</o:Revision> <o:TotalTime>1</o:TotalTime> <o:Created>2011-03-13T03:15:00Z</o:Created> <o:Pages>1</o:Pages> <o:Words>791</o:Words> <o:Characters>4509</o:Characters> <o:Lines>37</o:Lines> <o:Paragraphs>10</o:Paragraphs> <o:CharactersWithSpaces>5290</o:CharactersWithSpaces> <o:Version>14.00</o:Version> </o:DocumentProperties> </xml><![endif]--> <link rel=themeData href=\"Commitment_files/themedata.thmx\"> <link rel=colorSchemeMapping href=\"Commitment_files/colorschememapping.xml\"> <!--[if gte mso 9]><xml> <w:WordDocument> <w:Zoom>0</w:Zoom> <w:TrackMoves/> <w:TrackFormatting/> <w:ValidateAgainstSchemas/> <w:SaveIfXMLInvalid>false</w:SaveIfXMLInvalid> <w:IgnoreMixedContent>false</w:IgnoreMixedContent> <w:AlwaysShowPlaceholderText>false</w:AlwaysShowPlaceholderText> <w:DoNotPromoteQF/> <w:LidThemeOther>EN-US</w:LidThemeOther> <w:LidThemeAsian>X-NONE</w:LidThemeAsian> <w:LidThemeComplexScript>X-NONE</w:LidThemeComplexScript> <w:Compatibility> <w:DoNotExpandShiftReturn/> <w:BreakWrappedTables/> <w:SplitPgBreakAndParaMark/> <w:EnableOpenTypeKerning/> </w:Compatibility> <w:BrowserLevel>MicrosoftInternetExplorer4</w:BrowserLevel> <m:mathPr> <m:mathFont m:val=\"Cambria Math\"/> <m:brkBin m:val=\"before\"/> <m:brkBinSub m:val=\"&#45;-\"/> <m:smallFrac m:val=\"off\"/> <m:dispDef/> <m:lMargin m:val=\"0\"/> <m:rMargin m:val=\"0\"/> <m:defJc m:val=\"centerGroup\"/> <m:wrapIndent m:val=\"1440\"/> <m:intLim m:val=\"subSup\"/> <m:naryLim m:val=\"undOvr\"/> </m:mathPr></w:WordDocument> </xml><![endif]--><!--[if gte mso 9]><xml> <w:LatentStyles DefLockedState=\"false\" DefUnhideWhenUsed=\"true\" DefSemiHidden=\"true\" DefQFormat=\"false\" DefPriority=\"99\" LatentStyleCount=\"267\"> <w:LsdException Locked=\"false\" Priority=\"0\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" QFormat=\"true\" Name=\"Normal\"/> <w:LsdException Locked=\"false\" Priority=\"9\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" QFormat=\"true\" Name=\"heading 1\"/> <w:LsdException Locked=\"false\" Priority=\"9\" QFormat=\"true\" Name=\"heading 2\"/> <w:LsdException Locked=\"false\" Priority=\"9\" QFormat=\"true\" Name=\"heading 3\"/> <w:LsdException Locked=\"false\" Priority=\"9\" QFormat=\"true\" Name=\"heading 4\"/> <w:LsdException Locked=\"false\" Priority=\"9\" QFormat=\"true\" Name=\"heading 5\"/> <w:LsdException Locked=\"false\" Priority=\"9\" QFormat=\"true\" Name=\"heading 6\"/> <w:LsdException Locked=\"false\" Priority=\"9\" QFormat=\"true\" Name=\"heading 7\"/> <w:LsdException Locked=\"false\" Priority=\"9\" QFormat=\"true\" Name=\"heading 8\"/> <w:LsdException Locked=\"false\" Priority=\"9\" QFormat=\"true\" Name=\"heading 9\"/> <w:LsdException Locked=\"false\" Priority=\"39\" Name=\"toc 1\"/> <w:LsdException Locked=\"false\" Priority=\"39\" Name=\"toc 2\"/> <w:LsdException Locked=\"false\" Priority=\"39\" Name=\"toc 3\"/> <w:LsdException Locked=\"false\" Priority=\"39\" Name=\"toc 4\"/> <w:LsdException Locked=\"false\" Priority=\"39\" Name=\"toc 5\"/> <w:LsdException Locked=\"false\" Priority=\"39\" Name=\"toc 6\"/> <w:LsdException Locked=\"false\" Priority=\"39\" Name=\"toc 7\"/> <w:LsdException Locked=\"false\" Priority=\"39\" Name=\"toc 8\"/> <w:LsdException Locked=\"false\" Priority=\"39\" Name=\"toc 9\"/> <w:LsdException Locked=\"false\" Priority=\"35\" QFormat=\"true\" Name=\"caption\"/> <w:LsdException Locked=\"false\" Priority=\"10\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" QFormat=\"true\" Name=\"Title\"/> <w:LsdException Locked=\"false\" Priority=\"1\" Name=\"Default Paragraph Font\"/> <w:LsdException Locked=\"false\" Priority=\"11\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" QFormat=\"true\" Name=\"Subtitle\"/> <w:LsdException Locked=\"false\" Priority=\"22\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" QFormat=\"true\" Name=\"Strong\"/> <w:LsdException Locked=\"false\" Priority=\"20\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" QFormat=\"true\" Name=\"Emphasis\"/> <w:LsdException Locked=\"false\" Priority=\"59\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Table Grid\"/> <w:LsdException Locked=\"false\" UnhideWhenUsed=\"false\" Name=\"Placeholder Text\"/> <w:LsdException Locked=\"false\" Priority=\"1\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" QFormat=\"true\" Name=\"No Spacing\"/> <w:LsdException Locked=\"false\" Priority=\"60\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Light Shading\"/> <w:LsdException Locked=\"false\" Priority=\"61\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Light List\"/> <w:LsdException Locked=\"false\" Priority=\"62\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Light Grid\"/> <w:LsdException Locked=\"false\" Priority=\"63\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium Shading 1\"/> <w:LsdException Locked=\"false\" Priority=\"64\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium Shading 2\"/> <w:LsdException Locked=\"false\" Priority=\"65\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium List 1\"/> <w:LsdException Locked=\"false\" Priority=\"66\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium List 2\"/> <w:LsdException Locked=\"false\" Priority=\"67\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium Grid 1\"/> <w:LsdException Locked=\"false\" Priority=\"68\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium Grid 2\"/> <w:LsdException Locked=\"false\" Priority=\"69\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium Grid 3\"/> <w:LsdException Locked=\"false\" Priority=\"70\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Dark List\"/> <w:LsdException Locked=\"false\" Priority=\"71\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Colorful Shading\"/> <w:LsdException Locked=\"false\" Priority=\"72\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Colorful List\"/> <w:LsdException Locked=\"false\" Priority=\"73\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Colorful Grid\"/> <w:LsdException Locked=\"false\" Priority=\"60\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Light Shading Accent 1\"/> <w:LsdException Locked=\"false\" Priority=\"61\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Light List Accent 1\"/> <w:LsdException Locked=\"false\" Priority=\"62\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Light Grid Accent 1\"/> <w:LsdException Locked=\"false\" Priority=\"63\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium Shading 1 Accent 1\"/> <w:LsdException Locked=\"false\" Priority=\"64\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium Shading 2 Accent 1\"/> <w:LsdException Locked=\"false\" Priority=\"65\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium List 1 Accent 1\"/> <w:LsdException Locked=\"false\" UnhideWhenUsed=\"false\" Name=\"Revision\"/> <w:LsdException Locked=\"false\" Priority=\"34\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" QFormat=\"true\" Name=\"List Paragraph\"/> <w:LsdException Locked=\"false\" Priority=\"29\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" QFormat=\"true\" Name=\"Quote\"/> <w:LsdException Locked=\"false\" Priority=\"30\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" QFormat=\"true\" Name=\"Intense Quote\"/> <w:LsdException Locked=\"false\" Priority=\"66\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium List 2 Accent 1\"/> <w:LsdException Locked=\"false\" Priority=\"67\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium Grid 1 Accent 1\"/> <w:LsdException Locked=\"false\" Priority=\"68\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium Grid 2 Accent 1\"/> <w:LsdException Locked=\"false\" Priority=\"69\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium Grid 3 Accent 1\"/> <w:LsdException Locked=\"false\" Priority=\"70\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Dark List Accent 1\"/> <w:LsdException Locked=\"false\" Priority=\"71\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Colorful Shading Accent 1\"/> <w:LsdException Locked=\"false\" Priority=\"72\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Colorful List Accent 1\"/> <w:LsdException Locked=\"false\" Priority=\"73\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Colorful Grid Accent 1\"/> <w:LsdException Locked=\"false\" Priority=\"60\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Light Shading Accent 2\"/> <w:LsdException Locked=\"false\" Priority=\"61\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Light List Accent 2\"/> <w:LsdException Locked=\"false\" Priority=\"62\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Light Grid Accent 2\"/> <w:LsdException Locked=\"false\" Priority=\"63\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium Shading 1 Accent 2\"/> <w:LsdException Locked=\"false\" Priority=\"64\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium Shading 2 Accent 2\"/> <w:LsdException Locked=\"false\" Priority=\"65\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium List 1 Accent 2\"/> <w:LsdException Locked=\"false\" Priority=\"66\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium List 2 Accent 2\"/> <w:LsdException Locked=\"false\" Priority=\"67\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium Grid 1 Accent 2\"/> <w:LsdException Locked=\"false\" Priority=\"68\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium Grid 2 Accent 2\"/> <w:LsdException Locked=\"false\" Priority=\"69\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium Grid 3 Accent 2\"/> <w:LsdException Locked=\"false\" Priority=\"70\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Dark List Accent 2\"/> <w:LsdException Locked=\"false\" Priority=\"71\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Colorful Shading Accent 2\"/> <w:LsdException Locked=\"false\" Priority=\"72\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Colorful List Accent 2\"/> <w:LsdException Locked=\"false\" Priority=\"73\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Colorful Grid Accent 2\"/> <w:LsdException Locked=\"false\" Priority=\"60\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Light Shading Accent 3\"/> <w:LsdException Locked=\"false\" Priority=\"61\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Light List Accent 3\"/> <w:LsdException Locked=\"false\" Priority=\"62\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Light Grid Accent 3\"/> <w:LsdException Locked=\"false\" Priority=\"63\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium Shading 1 Accent 3\"/> <w:LsdException Locked=\"false\" Priority=\"64\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium Shading 2 Accent 3\"/> <w:LsdException Locked=\"false\" Priority=\"65\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium List 1 Accent 3\"/> <w:LsdException Locked=\"false\" Priority=\"66\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium List 2 Accent 3\"/> <w:LsdException Locked=\"false\" Priority=\"67\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium Grid 1 Accent 3\"/> <w:LsdException Locked=\"false\" Priority=\"68\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium Grid 2 Accent 3\"/> <w:LsdException Locked=\"false\" Priority=\"69\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium Grid 3 Accent 3\"/> <w:LsdException Locked=\"false\" Priority=\"70\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Dark List Accent 3\"/> <w:LsdException Locked=\"false\" Priority=\"71\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Colorful Shading Accent 3\"/> <w:LsdException Locked=\"false\" Priority=\"72\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Colorful List Accent 3\"/> <w:LsdException Locked=\"false\" Priority=\"73\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Colorful Grid Accent 3\"/> <w:LsdException Locked=\"false\" Priority=\"60\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Light Shading Accent 4\"/> <w:LsdException Locked=\"false\" Priority=\"61\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Light List Accent 4\"/> <w:LsdException Locked=\"false\" Priority=\"62\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Light Grid Accent 4\"/> <w:LsdException Locked=\"false\" Priority=\"63\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium Shading 1 Accent 4\"/> <w:LsdException Locked=\"false\" Priority=\"64\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium Shading 2 Accent 4\"/> <w:LsdException Locked=\"false\" Priority=\"65\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium List 1 Accent 4\"/> <w:LsdException Locked=\"false\" Priority=\"66\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium List 2 Accent 4\"/> <w:LsdException Locked=\"false\" Priority=\"67\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium Grid 1 Accent 4\"/> <w:LsdException Locked=\"false\" Priority=\"68\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium Grid 2 Accent 4\"/> <w:LsdException Locked=\"false\" Priority=\"69\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium Grid 3 Accent 4\"/> <w:LsdException Locked=\"false\" Priority=\"70\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Dark List Accent 4\"/> <w:LsdException Locked=\"false\" Priority=\"71\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Colorful Shading Accent 4\"/> <w:LsdException Locked=\"false\" Priority=\"72\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Colorful List Accent 4\"/> <w:LsdException Locked=\"false\" Priority=\"73\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Colorful Grid Accent 4\"/> <w:LsdException Locked=\"false\" Priority=\"60\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Light Shading Accent 5\"/> <w:LsdException Locked=\"false\" Priority=\"61\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Light List Accent 5\"/> <w:LsdException Locked=\"false\" Priority=\"62\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Light Grid Accent 5\"/> <w:LsdException Locked=\"false\" Priority=\"63\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium Shading 1 Accent 5\"/> <w:LsdException Locked=\"false\" Priority=\"64\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium Shading 2 Accent 5\"/> <w:LsdException Locked=\"false\" Priority=\"65\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium List 1 Accent 5\"/> <w:LsdException Locked=\"false\" Priority=\"66\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium List 2 Accent 5\"/> <w:LsdException Locked=\"false\" Priority=\"67\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium Grid 1 Accent 5\"/> <w:LsdException Locked=\"false\" Priority=\"68\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium Grid 2 Accent 5\"/> <w:LsdException Locked=\"false\" Priority=\"69\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium Grid 3 Accent 5\"/> <w:LsdException Locked=\"false\" Priority=\"70\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Dark List Accent 5\"/> <w:LsdException Locked=\"false\" Priority=\"71\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Colorful Shading Accent 5\"/> <w:LsdException Locked=\"false\" Priority=\"72\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Colorful List Accent 5\"/> <w:LsdException Locked=\"false\" Priority=\"73\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Colorful Grid Accent 5\"/> <w:LsdException Locked=\"false\" Priority=\"60\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Light Shading Accent 6\"/> <w:LsdException Locked=\"false\" Priority=\"61\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Light List Accent 6\"/> <w:LsdException Locked=\"false\" Priority=\"62\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Light Grid Accent 6\"/> <w:LsdException Locked=\"false\" Priority=\"63\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium Shading 1 Accent 6\"/> <w:LsdException Locked=\"false\" Priority=\"64\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium Shading 2 Accent 6\"/> <w:LsdException Locked=\"false\" Priority=\"65\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium List 1 Accent 6\"/> <w:LsdException Locked=\"false\" Priority=\"66\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium List 2 Accent 6\"/> <w:LsdException Locked=\"false\" Priority=\"67\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium Grid 1 Accent 6\"/> <w:LsdException Locked=\"false\" Priority=\"68\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium Grid 2 Accent 6\"/> <w:LsdException Locked=\"false\" Priority=\"69\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Medium Grid 3 Accent 6\"/> <w:LsdException Locked=\"false\" Priority=\"70\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Dark List Accent 6\"/> <w:LsdException Locked=\"false\" Priority=\"71\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Colorful Shading Accent 6\"/> <w:LsdException Locked=\"false\" Priority=\"72\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Colorful List Accent 6\"/> <w:LsdException Locked=\"false\" Priority=\"73\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" Name=\"Colorful Grid Accent 6\"/> <w:LsdException Locked=\"false\" Priority=\"19\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" QFormat=\"true\" Name=\"Subtle Emphasis\"/> <w:LsdException Locked=\"false\" Priority=\"21\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" QFormat=\"true\" Name=\"Intense Emphasis\"/> <w:LsdException Locked=\"false\" Priority=\"31\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" QFormat=\"true\" Name=\"Subtle Reference\"/> <w:LsdException Locked=\"false\" Priority=\"32\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" QFormat=\"true\" Name=\"Intense Reference\"/> <w:LsdException Locked=\"false\" Priority=\"33\" SemiHidden=\"false\" UnhideWhenUsed=\"false\" QFormat=\"true\" Name=\"Book Title\"/> <w:LsdException Locked=\"false\" Priority=\"37\" Name=\"Bibliography\"/> <w:LsdException Locked=\"false\" Priority=\"39\" QFormat=\"true\" Name=\"TOC Heading\"/> </w:LatentStyles> </xml><![endif]--> <style> <!-- /* Font Definitions */ @font-face {font-family:Calibri; panose-1:2 15 5 2 2 2 4 3 2 4; mso-font-alt:\"Times New Roman\"; mso-font-charset:0; mso-generic-font-family:swiss; mso-font-pitch:variable; mso-font-signature:-520092929 1073786111 9 0 415 0;} @font-face {font-family:Verdana; panose-1:2 11 6 4 3 5 4 4 2 4; mso-font-charset:0; mso-generic-font-family:swiss; mso-font-pitch:variable; mso-font-signature:-1593833729 1073750107 16 0 415 0;} /* Style Definitions */ p.MsoNormal, li.MsoNormal, div.MsoNormal {mso-style-unhide:no; mso-style-qformat:yes; mso-style-parent:\"\"; margin:0in; margin-bottom:.0001pt; mso-pagination:widow-orphan; font-size:11.0pt; font-family:\"Calibri\",\"sans-serif\"; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin;} a:link, span.MsoHyperlink {mso-style-noshow:yes; mso-style-priority:99; color:blue; text-decoration:underline; text-underline:single;} a:visited, span.MsoHyperlinkFollowed {mso-style-noshow:yes; mso-style-priority:99; color:purple; text-decoration:underline; text-underline:single;} p.MsoListParagraph, li.MsoListParagraph, div.MsoListParagraph {mso-style-priority:34; mso-style-unhide:no; mso-style-qformat:yes; margin-top:0in; margin-right:0in; margin-bottom:0in; margin-left:.5in; margin-bottom:.0001pt; mso-pagination:widow-orphan; font-size:11.0pt; font-family:\"Calibri\",\"sans-serif\"; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin;} span.EmailStyle18 {mso-style-type:personal; mso-style-noshow:yes; mso-style-unhide:no; font-family:\"Verdana\",\"sans-serif\"; mso-ascii-font-family:Verdana; mso-hansi-font-family:Verdana; color:windowtext; mso-text-animation:none; font-weight:normal; font-style:normal; text-decoration:none; text-underline:none; text-decoration:none; text-line-through:none;} .MsoChpDefault {mso-style-type:export-only; mso-default-props:yes; font-size:10.0pt; mso-ansi-font-size:10.0pt; mso-bidi-font-size:10.0pt;} @page WordSection1 {size:8.5in 11.0in; margin:1.0in 1.0in 1.0in 1.0in; mso-header-margin:.5in; mso-footer-margin:.5in; mso-paper-source:0;} div.WordSection1 {page:WordSection1;} /* List Definitions */ @list l0 {mso-list-id:799616619; mso-list-type:hybrid; mso-list-template-ids:979270586 67698703 67698713 67698715 67698703 67698713 67698715 67698703 67698713 67698715;} @list l0:level1 {mso-level-tab-stop:none; mso-level-number-position:left; text-indent:-.25in;} @list l0:level2 {mso-level-number-format:alpha-lower; mso-level-tab-stop:none; mso-level-number-position:left; text-indent:-.25in;} @list l0:level3 {mso-level-tab-stop:1.5in; mso-level-number-position:left; text-indent:-.25in;} @list l0:level4 {mso-level-tab-stop:2.0in; mso-level-number-position:left; text-indent:-.25in;} @list l0:level5 {mso-level-tab-stop:2.5in; mso-level-number-position:left; text-indent:-.25in;} @list l0:level6 {mso-level-tab-stop:3.0in; mso-level-number-position:left; text-indent:-.25in;} @list l0:level7 {mso-level-tab-stop:3.5in; mso-level-number-position:left; text-indent:-.25in;} @list l0:level8 {mso-level-tab-stop:4.0in; mso-level-number-position:left; text-indent:-.25in;} @list l0:level9 {mso-level-tab-stop:4.5in; mso-level-number-position:left; text-indent:-.25in;} ol {margin-bottom:0in;} ul {margin-bottom:0in;} --> </style> <!--[if gte mso 10]> <style> /* Style Definitions */ table.MsoNormalTable {mso-style-name:\"Table Normal\"; mso-tstyle-rowband-size:0; mso-tstyle-colband-size:0; mso-style-noshow:yes; mso-style-priority:99; mso-style-parent:\"\"; mso-padding-alt:0in 5.4pt 0in 5.4pt; mso-para-margin:0in; mso-para-margin-bottom:.0001pt; mso-pagination:widow-orphan; font-size:10.0pt; font-family:\"Times New Roman\",\"serif\";} </style> <![endif]--> </head> <body lang=EN-US link=blue vlink=purple style='tab-interval:.5in'> <div class=WordSection1> <p class=MsoNormal><span style='font-size:10.0pt;font-family:\"Verdana\",\"sans-serif\"'>Windows Live Development Team,<o:p></o:p></span></p> <p class=MsoNormal><span style='font-size:10.0pt;font-family:\"Verdana\",\"sans-serif\"'><o:p>&nbsp;</o:p></span></p> <p class=MsoNormal><span style='font-size:10.0pt;font-family:\"Verdana\",\"sans-serif\"'>Now that we've completed Wave4 and started to move into Wave5, I'd like us to use the rest of this month to update our personal commitments for FY11.  &nbsp;&nbsp;Let's try to have them completed by October 29<sup>th</sup>.<o:p></o:p></span></p> <p class=MsoNormal><span style='font-size:10.0pt;font-family:\"Verdana\",\"sans-serif\"'><o:p>&nbsp;</o:p></span></p> <p class=MsoNormal><span style='font-size:10.0pt;font-family:\"Verdana\",\"sans-serif\"'>My commitments for this year are attached.&nbsp; An outline of expected commitments for all contributors in Windows Live is below.<o:p></o:p></span></p> <p class=MsoNormal><span style='font-size:10.0pt;font-family:\"Verdana\",\"sans-serif\"'><o:p>&nbsp;</o:p></span></p> <p class=MsoNormal><span style='font-size:10.0pt;font-family:\"Verdana\",\"sans-serif\"'>The Microsoft engineering <a href=\"http://hrweb/US/Career/CareerModel/engineering/dev/Pages/default.aspx\">CSPs</a> and <a href=\"http://hrweb/US/Career/CareerModel/engineering/Pages/competencies.aspx\">Competencies</a> define a shared set of expectations across the company. Effectively, they define the minimum bar for what is expected of each engineer in their respective career stage. As you'd expect they define a broad set of behaviors and expected results.&nbsp; Being broad, they can be hard to apply day-to-day.<o:p></o:p></span></p> <p class=MsoNormal><span style='font-size:10.0pt;font-family:\"Verdana\",\"sans-serif\"'><o:p>&nbsp;</o:p></span></p> <p class=MsoNormal><span style='font-size:10.0pt;font-family:\"Verdana\",\"sans-serif\"'>To make setting commitments easier, we've created a canonical commitment (attached spreadsheet) for each career stage. These do not supersede the CSP and Competencies that can be found on <a href=\"http://hrweb/\">HRWeb</a>. Instead, they call out those behaviors that are expected in Windows Live. In addition, they clarify some Windows Live organization specifics, like feature teams, unit tests, and bug jail. In effect this adjusts the minimum bar up from the Microsoft-wide bar.&nbsp; The goal of the standard commitment template is to give us well-calibrated, consistent and fair commitments within which to work.  The template also attempts to guarantee that peer groups are working against the same set of goals. <o:p></o:p></span></p> <p class=MsoNormal><span style='font-size:10.0pt;font-family:\"Verdana\",\"sans-serif\"'><o:p>&nbsp;</o:p></span></p> <p class=MsoNormal><span style='font-size:10.0pt;font-family:\"Verdana\",\"sans-serif\"'>What if all the items do not apply to me? The canonical commitments are generated from the CSP/Competencies, so it should be the case that all the items apply to all developers in the organization. However, it's sometimes the case that people at higher levels (Partner, Principal, in rare cases L64) develop deep expertise/specialization in a given area that can make it infeasible for an individual to fulfill every item. In this case, it is reasonable to exclude those items that are not appropriate from the commitment (or include items that are more appropriate), but only after reaching an agreement with your manager.<o:p></o:p></span></p> <p class=MsoNormal><span style='font-size:10.0pt;font-family:\"Verdana\",\"sans-serif\"'><o:p>&nbsp;</o:p></span></p> <p class=MsoNormal><span style='font-size:10.0pt;font-family:\"Verdana\",\"sans-serif\"'>In addition to the standard commitment template, everyone is also being asked to commit to a \"growth and development\" commitment, a \"live-site\" commitment and \"per milestone\" commitments.&nbsp; These commitments are described below.<o:p></o:p></span></p> <p class=MsoNormal><span style='font-size:10.0pt;font-family:\"Verdana\",\"sans-serif\"'><o:p>&nbsp;</o:p></span></p> <p class=MsoNormal><span style='font-size:10.0pt;font-family:\"Verdana\",\"sans-serif\"'>We will also ask that each manager commit to an \"organizational excellence\" commitment which is described below as well. <o:p></o:p></span></p> <p class=MsoNormal><span style='font-size:10.0pt;font-family:\"Verdana\",\"sans-serif\"'><o:p>&nbsp;</o:p></span></p> <p class=MsoNormal><span style='font-size:10.0pt;font-family:\"Verdana\",\"sans-serif\"'>As always, commitments are set on the <a href=\"http://performance/\">Performance</a> site.<o:p></o:p></span></p> <p class=MsoNormal><span style='font-size:10.0pt;font-family:\"Verdana\",\"sans-serif\"'><o:p>&nbsp;</o:p></span></p> <p class=MsoNormal><span style='font-size:10.0pt;font-family:\"Verdana\",\"sans-serif\"'>Here's an outline for the commitments that each contributor should create in the commitment tool:<o:p></o:p></span></p> <p class=MsoNormal><span style='font-size:10.0pt;font-family:\"Verdana\",\"sans-serif\"'><o:p>&nbsp;</o:p></span></p> <p class=MsoListParagraph style='margin-bottom:12.0pt;text-indent:-.25in; mso-list:l0 level1 lfo2'><![if !supportLists]><span style='font-size:10.0pt; font-family:\"Verdana\",\"sans-serif\";mso-fareast-font-family:Verdana;mso-bidi-font-family: Verdana'><span style='mso-list:Ignore'>1.<span style='font:7.0pt \"Times New Roman\"'>&nbsp;&nbsp;&nbsp; </span></span></span><![endif]><b><i><span style='font-size:10.0pt;font-family: \"Verdana\",\"sans-serif\"'>Perform as a great [SDE, SDE2, Senior SDE, Principal, Partner] developer</span></i></b><span style='font-size:10.0pt;font-family: \"Verdana\",\"sans-serif\"'><br> <br> Execution Plan &amp; Accountabilities can be cut and pasted into this commitment from the attached spreadsheet.<o:p></o:p></span></p> <p class=MsoListParagraph style='margin-bottom:12.0pt;text-indent:-.25in; mso-list:l0 level1 lfo2'><![if !supportLists]><span style='font-size:10.0pt; font-family:\"Verdana\",\"sans-serif\";mso-fareast-font-family:Verdana;mso-bidi-font-family: Verdana'><span style='mso-list:Ignore'>2.<span style='font:7.0pt \"Times New Roman\"'>&nbsp;&nbsp;&nbsp; </span></span></span><![endif]><b><i><span style='font-size:10.0pt;font-family: \"Verdana\",\"sans-serif\"'>Deliver Windows Live MQ milestone</span></i></b><span style='font-size:10.0pt;font-family:\"Verdana\",\"sans-serif\"'><br> <br> The execution plan for this commitment addresses how you will achieve your commitments with specific steps.&nbsp; <o:p></o:p></span></p> <p class=MsoListParagraph style='margin-bottom:12.0pt'><span style='font-size: 10.0pt;font-family:\"Verdana\",\"sans-serif\"'>Accountabilities for this milestone should list the specific deliverables and responsibilities in accordance with the Career Stage Profile described in commitment one.&nbsp; Accountabilities should include how you will measure the achievement of your commitment.<o:p></o:p></span></p> <p class=MsoListParagraph style='margin-bottom:12.0pt;text-indent:-.25in; mso-list:l0 level1 lfo2'><![if !supportLists]><span style='font-size:10.0pt; font-family:\"Verdana\",\"sans-serif\";mso-fareast-font-family:Verdana;mso-bidi-font-family: Verdana'><span style='mso-list:Ignore'>3.<span style='font:7.0pt \"Times New Roman\"'>&nbsp;&nbsp;&nbsp; </span></span></span><![endif]><b><i><span style='font-size:10.0pt;font-family: \"Verdana\",\"sans-serif\"'>Deliver Windows Live Wave 5 M1 milestone</span></i></b><span style='font-size:10.0pt;font-family:\"Verdana\",\"sans-serif\"'><br> <br> The Execution Plan and Accountabilities for this commitment will follow the same template as #2 above. For the time being, just put the accountabilities as TBD.&nbsp; We will update these at the beginning of each milestone.<o:p></o:p></span></p> <p class=MsoListParagraph style='margin-bottom:12.0pt;text-indent:-.25in; mso-list:l0 level1 lfo2'><![if !supportLists]><span style='font-size:10.0pt; font-family:\"Verdana\",\"sans-serif\";mso-fareast-font-family:Verdana;mso-bidi-font-family: Verdana'><span style='mso-list:Ignore'>4.<span style='font:7.0pt \"Times New Roman\"'>&nbsp;&nbsp;&nbsp; </span></span></span><![endif]><b><i><span style='font-size:10.0pt;font-family: \"Verdana\",\"sans-serif\"'>Deliver Windows Live Wave 5 M2 milestone</span></i></b><span style='font-size:10.0pt;font-family:\"Verdana\",\"sans-serif\"'><br> <br> The Execution Plan and Accountabilities for this commitment will follow the same template as #2 above.&nbsp; Again, just put the accountabilities as TBD.&nbsp; <o:p></o:p></span></p> <p class=MsoListParagraph style='margin-bottom:12.0pt;text-indent:-.25in; mso-list:l0 level1 lfo2'><![if !supportLists]><span style='font-size:10.0pt; font-family:\"Verdana\",\"sans-serif\";mso-fareast-font-family:Verdana;mso-bidi-font-family: Verdana'><span style='mso-list:Ignore'>5.<span style='font:7.0pt \"Times New Roman\"'>&nbsp;&nbsp;&nbsp; </span></span></span><![endif]><b><i><span style='font-size:10.0pt;font-family: \"Verdana\",\"sans-serif\"'>Develop and grow my skills and competencies as well as the depth and breadth of my influence</span></i></b><span style='font-size: 10.0pt;font-family:\"Verdana\",\"sans-serif\"'><br> <br> This is a personal commitment, the contents of which won't be standardized across the team. The purpose of this commitment is to give each of us an opportunity to identify and commit to development in areas where there are opportunities for growth. Please make a pass at writing this down yourself.  Your manager will probably have specific items that might be expanded upon or added. <o:p></o:p></span></p> <p class=MsoListParagraph style='margin-bottom:12.0pt;text-indent:-.25in; mso-list:l0 level1 lfo2'><![if !supportLists]><span style='font-size:10.0pt; font-family:\"Verdana\",\"sans-serif\";mso-fareast-font-family:Verdana;mso-bidi-font-family: Verdana'><span style='mso-list:Ignore'>6.<span style='font:7.0pt \"Times New Roman\"'>&nbsp;&nbsp;&nbsp; </span></span></span><![endif]><b><i><span style='font-size:10.0pt;font-family: \"Verdana\",\"sans-serif\";color:#333333'>Ensure Live-site quality for Clients and Services is Job#1</span></i></b><i><span style='font-size:10.0pt;font-family: \"Verdana\",\"sans-serif\"'><br> <br> </span></i><span style='font-size:10.0pt;font-family:\"Verdana\",\"sans-serif\"'>The first five commitments capture the essence of the software development aspect of what we do. In reality, though, there's another dimension to the work our team does, which involves the on-going deployment and management of our client software and our services. &nbsp;It's important that we internalize and commit to doing an outstanding job at client and service delivery and maintenance.<o:p></o:p></span></p> <p class=MsoListParagraph style='margin-bottom:12.0pt;text-indent:-.25in; mso-list:l0 level1 lfo2'><![if !supportLists]><span style='font-size:10.0pt; font-family:\"Verdana\",\"sans-serif\";mso-fareast-font-family:Verdana;mso-bidi-font-family: Verdana'><span style='mso-list:Ignore'>7.<span style='font:7.0pt \"Times New Roman\"'>&nbsp;&nbsp;&nbsp; </span></span></span><![endif]><b><i><span style='font-size:10.0pt;font-family: \"Verdana\",\"sans-serif\";color:#333333'>Organizational Excellence (Leads and Managers only)</span></i></b><span style='font-size:10.0pt;font-family:\"Verdana\",\"sans-serif\"'><o:p></o:p></span></p> <p class=MsoListParagraph style='margin-bottom:12.0pt'><span style='font-size: 10.0pt;font-family:\"Verdana\",\"sans-serif\"'>These commitments state what our commitments are for attracting, training, retaining and managing our talent.&nbsp; They state our commitments to improving our development processes and are our commitments to making our peers and others around us successful. <o:p></o:p></span></p> <p class=MsoNormal><span style='font-size:10.0pt;font-family:\"Verdana\",\"sans-serif\"'>If you have any questions for feedback, please let me or you manager know.<o:p></o:p></span></p> <p class=MsoNormal><span style='font-size:10.0pt;font-family:\"Verdana\",\"sans-serif\"'><o:p>&nbsp;</o:p></span></p> <p class=MsoNormal><span style='font-size:10.0pt;font-family:\"Verdana\",\"sans-serif\"'>Thanks, Phil<o:p></o:p></span></p> <p class=MsoNormal><span style='font-size:10.0pt;font-family:\"Verdana\",\"sans-serif\"'><o:p>&nbsp;</o:p></span></p> </div> </body> </html>"
                        }],
                        preview: "We were unable to make the real platform.",
                        read: false,
                        accountId: "defaultAccount00",
                        displayViewIds: ["***JunkMailView***"]
                    }
                ],
                "ut": [
                    {
                        objectId: "ComposeHelpers.test_launchCompose",
                        from: "jspivey@microsoft.com",
                        to: "composetest@microsoft.com",
                        subject: "GeneratedId1?",
                        accountId: "defaultAccount00",
                        displayViewIds: ["***InboxView***"],
                        received: new Date(2012, 3, 16),
                        mock$body: [{
                            type: Plat.MailBodyType.plainText,
                            body: "GeneratedId1 was the second object in this file: the Me contact.\n" +
                                  "That contact was being crammed into lastSelectedMessage.\n" +
                                  "That doesn't even take a platform object, it takes a mail UIDataModel object.\n" +
                                  "The test hacked the mockedType property that was telling you something was wrong.\n" +
                                  "The really disturbing thing is that the test passed..."
                        }]
                    }, {
                        objectId: "EmbeddedAttachments.test_basic",
                    }, {
                        objectId: "EmbeddedAttachments.test_ordinary",
                        hasOrdinaryAttachments: true,
                        mock$attachmentCollection: [{
                            uiType: Plat.AttachmentUIType.ordinary,
                            fileName: "attachment-file-name.gif",
                            contentId: "attachment-content-id",
                            syncStatus: Plat.AttachmentSyncStatus.done,
                            bodyUri: "unique-string-01"
                        }]
                    }, {
                        objectId: "EmbeddedAttachments.test_embedded",
                        hasOrdinaryAttachments: false,
                        mock$attachmentCollection: [{
                            uiType: Plat.AttachmentUIType.embedded,
                            fileName: "attachment-file-name.gif",
                            contentId: "attachment-content-id",
                            syncStatus: Plat.AttachmentSyncStatus.done,
                            bodyUri: "unique-string-01"
                        }]
                    }
                ]
            },
            MailView: {
                "all": [
                    {
                        objectId: "***InboxView***",
                        accountId: "defaultAccount00",
                        type: Plat.MailViewType.inbox,
                        isPinnedToNavPane: true,
                        canChangePinState: false,
                        mock$sourceObjectId: "***Inbox***"
                    }, {
                        objectId: "***DraftsView***",
                        accountId: "defaultAccount00",
                        type: Plat.MailViewType.draft,
                        mock$sourceObjectId: "***Drafts***"
                    }, {
                        objectId: "***SentItemsView***",
                        accountId: "defaultAccount00",
                        type: Plat.MailViewType.sentItems,
                        mock$sourceObjectId: "***SentItems***"
                    }, {
                        objectId: "***JunkMailView***",
                        accountId: "defaultAccount00",
                        type: Plat.MailViewType.junkMail,
                        mock$sourceObjectId: "***JunkMail***"
                    }, {
                        objectId: "***OutboxView***",
                        accountId: "defaultAccount00",
                        type: Plat.MailViewType.outbox,
                        mock$sourceObjectId: "***Outbox***"
                    }, {
                        objectId: "***DeletedItemsView***",
                        accountId: "defaultAccount00",
                        type: Plat.MailViewType.deletedItems,
                        mock$sourceObjectId: "***DeletedItems***"
                    }
                ]
            },
            Folder: {
                "account_defaultAccount00" : [
                    {
                        objectId: "***Inbox***",
                        accountId: "defaultAccount00",
                        folderType: Plat.FolderType.mail,
                        specialMailFolderType: Plat.MailFolderType.inbox
                    }, {
                        objectId: "***Drafts***",
                        accountId: "defaultAccount00",
                        folderType: Plat.FolderType.mail,
                        specialMailFolderType: Plat.MailFolderType.drafts,
                        isLocalMailFolder: true,
                        syncFolderContents: false
                    }, {
                        objectId: "***Outbox***",
                        accountId: "defaultAccount00",
                        folderType: Plat.FolderType.mail,
                        specialMailFolderType: Plat.MailFolderType.outbox,
                        isLocalMailFolder: true,
                        syncFolderContents: false
                    }, {
                        objectId: "***SentItems***",
                        accountId: "defaultAccount00",
                        folderType: Plat.FolderType.mail,
                        specialMailFolderType: Plat.MailFolderType.sentItems
                    }, {
                        objectId: "***DeletedItems***",
                        accountId: "defaultAccount00",
                        folderType: Plat.FolderType.mail,
                        specialMailFolderType: Plat.MailFolderType.deletedItems
                    }, {
                        objectId: "***JunkMail***",
                        accountId: "defaultAccount00",
                        folderType: Plat.FolderType.mail,
                        specialMailFolderType: Plat.MailFolderType.junkMail
                    }
                ],
                "getSpecialMailFolder_defaultAccount00_1": [
                        "***Inbox***"
                ],
                "getSpecialMailFolder_defaultAccount00_2": [
                        "***Drafts***"
                ],
                "getSpecialMailFolder_defaultAccount00_3": [
                        "***DeletedItems***"
                ],
                "getSpecialMailFolder_defaultAccount00_4": [
                        "***SentItems***"
                ],
                "getSpecialMailFolder_defaultAccount00_5": [
                        "***JunkMail***"
                ],
                "getSpecialMailFolder_defaultAccount00_6": [
                        "***Outbox***"
                ],
                "children_***DeletedItems***": [
                    {
                        folderName: "DeletedSubfolder 1",
                        folderType: Plat.FolderType.mail,
                        specialMailFolderType: Plat.MailFolderType.userGenerated,
                        parentFolder: { objectId: "***DeletedItems***" },
                    }, {
                        folderName: "DeletedSubfolder 2",
                        folderType: Plat.FolderType.mail,
                        specialMailFolderType: Plat.MailFolderType.userGenerated,
                        parentFolder: { objectId: "***DeletedItems***" },
                    }, {
                        folderName: "DeletedSubfolder 3",
                        folderType: Plat.FolderType.mail,
                        specialMailFolderType: Plat.MailFolderType.userGenerated,
                        parentFolder: { objectId: "***DeletedItems***" },
                    }
                ]
            },
            Person: {
                "all": [{
                    objectId: "kelvin",
                    calculatedUIName: "Kelvin Poon",
                    linkedContacts: [ { businessEmailAddress: "kepoon@microsoft.com" } ]
                }, {
                    objectId: "andrew",
                    calculatedUIName: "Andrew Hall",
                    linkedContacts: [ { businessEmailAddress: "Andrew Hall <andrha@microsoft.com>" } ],
                }, {
                    objectId: "noOne",
                    calculatedUIName: "Don't ask why this is here!?!?!?",
                    linkedContacts: [ { businessEmailAddress: "Not a real person" } ],
                },{
                    objectId: "John S",
                    calculatedUIName: "John Spivey",
                    linkedContacts: [ { businessEmailAddress: "JSpivey@microsoft.com" } ],
                },{
                    objectId: "account",
                    calculatedUIName: "Account 2",
                    linkedContacts: [ { businessEmailAddress: "Account2@email.com" } ],
                }, {
                    objectId: "brian",
                    calculatedUIName: "Eileen",
                    linkedContacts: [ { businessEmailAddress: "eihash@microsoft.com" } ],
                }]

            }
        }, D.MethodHandlers).getClient();
    };

})();

