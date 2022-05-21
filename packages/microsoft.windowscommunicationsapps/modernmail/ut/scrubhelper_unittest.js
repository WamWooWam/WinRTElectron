
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx, Mail, Mocks, Tx, Microsoft, ModernCanvas */
/*jshint browser:true*/

(function () {

    var Plat = Microsoft.WindowsLive.Platform,
        Mock = Mocks.Microsoft.WindowsLive.Platform,
        MockData = Mock.Data;

    var accountId = "AccountId0",
        plainTextString = "This is the body of a plain text message",
        htmlString = "<html><head></head><body><div>This is the body of an HTML message.  There are many things wrong with it.</div><div>There are <a href='http://verybadplace.com' title='http://microsoft.com'>anchors that lie</a> about their destination.</div><akjshdjkahd>There are garbage tags</akjshdjkahd><br><listing>And listing tags</listing><div>External http images: <img width='100' src='http://ts2.mm.bing.net/th?id=H.5051342075593673&pid=1.7'></div><hr><div>And even dreaded &lt;hr&gt;s</div></body></html>",
        scrubbedString = "<html x-ms-format-detection=\"phone\"><head><link href=\"/ModernMail/resources/css/ReadingPaneBody.css\" rel=\"Stylesheet\"></head><body><div>This is the body of an HTML message.  There are many things wrong with it.</div><div>There are <a title=\"http://microsoft.com\" href=\"http://verybadplace.com\">anchors that lie</a> about their destination.</div>There are garbage tags<br><listing>And listing tags</listing><div>External http images: <img width=\"100\" src=\"\" data-ms-imgsrc=\"http://ts2.mm.bing.net/th?id=H.5051342075593673&amp;pid=1.7\"></div><hr><div>And even dreaded &lt;hr&gt;s</div></body></html>",
        documentString = scrubbedString.replace(
            "<head><link href=\"/ModernMail/resources/css/ReadingPaneBody.css\" rel=\"Stylesheet\"></head>",
            "<head><link href=\"/ModernMail/resources/css/ReadingPaneBody.css\" rel=\"Stylesheet\"></head>"
        ).replace(
            "src=\"\" data-ms-imgsrc=\"http://ts2.mm.bing.net/th?id=H.5051342075593673&amp;pid=1.7\"",
            "src=\"http://ts2.mm.bing.net/th?id=H.5051342075593673&amp;pid=1.7\" data-ms-imgsrc=\"http://ts2.mm.bing.net/th?id=H.5051342075593673&amp;pid=1.7\""
        ).replace("<body>","<body style=\"direction: ltr;\">"),
        draftMessage = {
            objectId: "draftMessage",
            displayViewIds: ["**DraftViewId**"],
            accountId: accountId,
            sanitizedVersion: Plat.SanitizedVersion.notSanitized,
            mock$body: [{
                body: htmlString,
                type: Plat.MailBodyType.html
            }]
        },
        plainTextMessage = {
            objectId: "plainTextMessage",
            displayViewIds: ["**InboxViewId**"],
            accountId: accountId,
            sanitizedVersion: Plat.SanitizedVersion.notSanitized,
            mock$body: [{
                body: plainTextString,
                type: Plat.MailBodyType.plainText
            }]
        },
        htmlMessage = {
            objectId: "htmlMessage",
            displayViewIds: ["**InboxViewId**"],
            accountId: accountId,
            sanitizedVersion: Plat.SanitizedVersion.notSanitized,
            mock$body: [{
                body: htmlString,
                type: Plat.MailBodyType.html
            }]
        },
        preScrubbedMessage = {
            objectId: "preScrubbedMessage",
            displayViewIds: ["**InboxViewId**"],
            accountId: accountId,
            sanitizedVersion: Plat.SanitizedVersion.current,
            mock$body: [{
                body: htmlString,
                type: Plat.MailBodyType.html
            }, {
                body: scrubbedString,
                metadata: JSON.stringify({
                    hasExternalImages: false,
                    hasExternalBackgrounds: false,
                    hasCSSImages: false,
                    allowedCSSImages: false,
                    htmlBodyHash: Mail.Validators.hashString(htmlString),
                    readingDirection: "ltr"
                }),
                type: Plat.MailBodyType.sanitized
            }]
        };

    var provider, platform;

    function fakeCanvasWorkers(tc) {
        var DummyWorker = function (element) {
            // Not necessarily an element, but should have querySelectorAll
            tc.isTrue(Jx.isFunction(element.querySelectorAll));
            this.run = Jx.fnEmpty;
        };

        var origModernCanvas = ModernCanvas;
        window.ModernCanvas = {
            runWorkersSynchronously: Jx.fnEmpty,
            BadElementHtmlWorker: DummyWorker,
            TabIndexHtmlWorker: DummyWorker,
            HrefHtmlWorker: DummyWorker,
            TitleAttributeHtmlWorker: DummyWorker
        };
        tc.addCleanup(function () {
            window.ModernCanvas = origModernCanvas;
        });
    }

    function setup(tc, message) {
        provider = new MockData.JsonProvider({
            Account: {
                "default": [{
                    objectId: accountId
                }]
            },
            Folder: {
                "all": [{
                    objectId: "**DraftFolderId**",
                    folderType: Plat.FolderType.mail,
                    specialMailFolderType: Plat.MailFolderType.drafts
                }, {
                    objectId: "**InboxFolderId**",
                    folderType: Plat.FolderType.mail,
                    specialMailFolderType: Plat.MailFolderType.inbox
                }]
            },
            MailView: {
                "all": [{
                    accountId: "default",
                    objectId: "**DraftViewId**",
                    type: Plat.MailViewType.draft,
                    mock$sourceObjectId: "**DraftFolderId**"
                }, {
                    accountId: "default",
                    objectId: "**InboxViewId**",
                    type: Plat.MailViewType.inbox,
                    mock$sourceObjectId: "**InboxFolderId**"
                }]
            },
            MailMessage: {
                "all": message instanceof Array ? message : [message]
            }
        });
        var account = provider.loadObject("Account", accountId);
        account.getResourceByType(Plat.ResourceType.mail).allowExternalImages = true;
        platform = provider.getClient();

        Mail.UnitTest.stubJx(tc, "appData");
        Mail.UnitTest.stubJx(tc, "activation");
        Mail.UnitTest.initGlobals();
        Mail.Globals.appSettings = new Mail.AppSettings();
        Mail.Utilities.haveRtlLanguage = function () { return true; };

        tc.addCleanup(function () {
            Mail.UnitTest.restoreJx();
            Mail.Globals.appSettings.dispose();
            Mail.Globals.appSettings = null;
            Mail.UnitTest.disposeGlobals();
        });
    }

    Tx.asyncTest("ScrubHelper.draftMessage", function (tc) {
        tc.stop();
        setup(tc, draftMessage);
        var platformMessage = platform.mailManager.loadMessage("draftMessage"),
            account = Mail.Account.load(platformMessage.accountId, platform),
            message = new Mail.UIDataModel.MailMessage(platformMessage, account),
            scrubber;

        tc.areEqual(message.sanitizedVersion, Plat.SanitizedVersion.notSanitized);
        function onComplete() {
            tc.areEqual(message.sanitizedVersion, Plat.SanitizedVersion.locallyCreatedMessage);
            var doc = scrubber.getDocument();
            tc.areEqual(doc.documentElement.outerHTML, "<html><head></head><body></body></html>");
            scrubber.dispose();
            tc.start();
        }

        scrubber = new Mail.Worker._Scrubber(platform, message, {
            onComplete: onComplete,
            priority: Mail.Priority.workerMessageScrubber
        });
    });

    Tx.test("ScrubHelper.draftMessage-force", function (tc) {
        setup(tc, draftMessage);
        var platformMessage = platform.mailManager.loadMessage("draftMessage"),
            account = Mail.Account.load(platformMessage.accountId, platform),
            message = new Mail.UIDataModel.MailMessage(platformMessage, account);

        fakeCanvasWorkers(tc);

        tc.areEqual(message.sanitizedVersion, Plat.SanitizedVersion.notSanitized);
        var doc = Mail.getScrubbedDocument(platform, message);
        tc.areEqual(message.sanitizedVersion, Plat.SanitizedVersion.current);
        tc.areEqual(doc.documentElement.outerHTML, documentString);

        var sanitizedBody = message.getSanitizedBody();
        tc.areEqual(sanitizedBody.body, scrubbedString);
    });

    Tx.asyncTest("ScrubHelper.plainTextMessage", function (tc) {
        tc.stop();
        setup(tc, plainTextMessage);
        var platformMessage = platform.mailManager.loadMessage("plainTextMessage"),
            account = Mail.Account.load(platformMessage.accountId, platform),
            message = new Mail.UIDataModel.MailMessage(platformMessage, account),
            scrubber;

        tc.areEqual(message.sanitizedVersion, Plat.SanitizedVersion.notSanitized);
        function onComplete() {
            tc.areEqual(message.sanitizedVersion, Plat.SanitizedVersion.noHtmlBody);
            var doc = scrubber.getDocument();
            tc.areEqual(doc.documentElement.outerHTML, "<html><head></head><body></body></html>");
            scrubber.dispose();
            tc.start();
        }

        scrubber = new Mail.Worker._Scrubber(platform, message, {
            onComplete: onComplete,
            priority: Mail.Priority.workerMessageScrubber
        });
    });

    Tx.asyncTest("ScrubHelper.htmlMessage", function (tc) {
        tc.stop();
        setup(tc, htmlMessage);
        var platformMessage = platform.mailManager.loadMessage("htmlMessage"),
            account = Mail.Account.load(platformMessage.accountId, platform),
            message = new Mail.UIDataModel.MailMessage(platformMessage, account),
            scrubber;

        fakeCanvasWorkers(tc);

        tc.areEqual(message.sanitizedVersion, Plat.SanitizedVersion.notSanitized);
        function onComplete() {
            tc.areEqual(message.sanitizedVersion, Plat.SanitizedVersion.current);

            var doc = scrubber.getDocument();
            tc.areEqual(doc.documentElement.outerHTML, scrubbedString);

            scrubber.dispose();

            var sanitizedBody = message.getSanitizedBody();
            tc.areEqual(sanitizedBody.body, scrubbedString);

            tc.start();
        }

        scrubber = new Mail.Worker._Scrubber(platform, message, {
            onComplete: onComplete,
            priority: Mail.Priority.workerMessageScrubber
        });
    });

    Tx.asyncTest("ScrubHelper.preScrubbedMessage", function (tc) {
        tc.stop();
        setup(tc, preScrubbedMessage);
        var platformMessage = platform.mailManager.loadMessage("preScrubbedMessage"),
            account = Mail.Account.load(platformMessage.accountId, platform),
            message = new Mail.UIDataModel.MailMessage(platformMessage, account),
            scrubber;

        var sanitizedBody = message.getSanitizedBody();
        tc.areEqual(sanitizedBody.body, scrubbedString);

        tc.areEqual(message.sanitizedVersion, Plat.SanitizedVersion.current);
        function onComplete() {
            tc.areEqual(message.sanitizedVersion, Plat.SanitizedVersion.current);

            var doc = scrubber.getDocument();
            tc.areEqual(doc.documentElement.outerHTML, scrubbedString);

            scrubber.dispose();
            tc.start();
        }

        scrubber = new Mail.Worker._Scrubber(platform, message, {
            onComplete: onComplete,
            priority: Mail.Priority.workerMessageScrubber
        });
    });

    Tx.asyncTest("BiDiSettings", { owner: "andrha", priority: 0 }, function (tc) {
        tc.stop();

        var constLtr = "ltr",
            constRtl = "rtl",
            constAuto = "auto",
            arabicString = "!!!@@@$$$\u0634\u0633\u064a\u0628\u0634\u0633$$$@@@!!!",
            englishString = "!!!@@@$$$this text is LTR$$$@@@!!!";

        var inputSet = [
            // When setting is not auto, it overrides First Strong Character detection (FSC)
            { inputBody: "<html><body>" + englishString + "</body></html>", inputAppDirection: constRtl, inputSettingValue: constRtl, expectedDirection: constRtl },
            { inputBody: "<html><body>" + arabicString + "</body></html>", inputAppDirection: constRtl, inputSettingValue: constLtr, expectedDirection: constLtr },
            { inputBody: "<html><body>" + englishString + "</body></html>", inputAppDirection: constLtr, inputSettingValue: constRtl, expectedDirection: constRtl },
            { inputBody: "<html><body>" + arabicString + "</body></html>", inputAppDirection: constLtr, inputSettingValue: constLtr, expectedDirection: constLtr },

            // When setting is Auto and FSC is available, use it
            { inputBody: "<html><body>" + arabicString + "</body></html>", inputAppDirection: constLtr, inputSettingValue: constAuto, expectedDirection: constRtl },
            { inputBody: "<html><body>" + arabicString + "</body></html>", inputAppDirection: constRtl, inputSettingValue: constAuto, expectedDirection: constRtl },
            { inputBody: "<html><body>" + englishString + "</body></html>", inputAppDirection: constLtr, inputSettingValue: constAuto, expectedDirection: constLtr },
            { inputBody: "<html><body>" + englishString + "</body></html>", inputAppDirection: constRtl, inputSettingValue: constAuto, expectedDirection: constLtr },

            // When setting is Auto and there is no FSC, use app direction
            { inputBody: "<html><body>!!!!!!</body></html>", inputAppDirection: constRtl, inputSettingValue: constAuto, expectedDirection: constRtl },
            { inputBody: "<html><body>!!!!!!</body></html>", inputAppDirection: constLtr, inputSettingValue: constAuto, expectedDirection: constLtr },

            // Dir attribute always takes precedence when available
            { inputBody: "<html dir=\"ltr\"><body>" + arabicString + "</body></html>", inputAppDirection: constRtl, inputSettingValue: constRtl, expectedDirection: constLtr },
            { inputBody: "<html style=\"direction: rtl\"><body>" + englishString + "</body></html>", inputAppDirection: constLtr, inputSettingValue: constLtr, expectedDirection: constRtl },
            { inputBody: "<html><body dir=\"ltr\">" + arabicString + "</body></html>", inputAppDirection: constRtl, inputSettingValue: constAuto, expectedDirection: constLtr },
            { inputBody: "<html><body style=\"direction: rtl\">" + englishString + "</body></html>", inputAppDirection: constLtr, inputSettingValue: constAuto, expectedDirection: constRtl },

            // Smoketest conflicting html attributes
            { inputBody: "<html style=\"direction: rtl\"><body dir=\"ltr\">" + arabicString + "</body></html>", inputAppDirection: constRtl, inputSettingValue: constAuto, expectedDirection: constLtr },
            { inputBody: "<html dir=\"ltr\"><body style=\"direction: rtl\">" + englishString + "</body></html>", inputAppDirection: constLtr, inputSettingValue: constAuto, expectedDirection: constRtl }
        ];

        // Set up the messages to be scrubbed
        var platformMessages = [];
        for (var i = 0; i < inputSet.length; i++) {
            var mailMessage = {
                objectId: "bidiMessage" + i,
                displayViewIds: ["**InboxViewId**"],
                accountId: accountId,
                sanitizedVersion: Plat.SanitizedVersion.notSanitized,
                mock$body: [{
                    body: inputSet[i].inputBody, // input for FSC and dir attribute
                    type: Plat.MailBodyType.html
                }]
            }
            platformMessages.push(mailMessage);
        }
        setup(tc, platformMessages);
        fakeCanvasWorkers(tc);

        var originalDir = document.body.style.direction;
        tc.addCleanup(function () {
            document.body.style.direction = originalDir;
        });

        // iterate over the test scenarios
        for (var i = 0, length = inputSet.length; i < length; i++) {
            // Change the app direction and settings to test input
            document.body.style.direction = inputSet[i].inputAppDirection;
            Mail.Globals.appSettings.readingDirection = inputSet[i].inputSettingValue;

            // force a scrub/body write
            var platformMessage = platform.mailManager.loadMessage("bidiMessage" + i),
                account = Mail.Account.load(platformMessage.accountId, platform),
                message = new Mail.UIDataModel.MailMessage(platformMessage, account);
            var scrubbedDoc = Mail.getScrubbedDocument(platform, message);

            // get actual dir
            var actualDirection = scrubbedDoc.body.currentStyle.direction;
            tc.areEqual(actualDirection, inputSet[i].expectedDirection);
        }

        tc.start();
    });
})();
