
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx, Mail, Debug, Mocks, Platform, Tx, Microsoft */
/*jshint browser:true*/

(function () {
    "use strict";

    var Plat = Microsoft.WindowsLive.Platform,
        Mock = Mocks.Microsoft.WindowsLive.Platform,
        MockData = Mock.Data;

    var platform;

    function setup(tc) {
        var origScrubber = Mail.Worker._Scrubber;
        var scrubberCount = 0;
        var Scrubber = Mail.Worker._Scrubber = function (platform, message, options) {
            scrubberCount++;
            tc.isTrue(arguments.length === 3);
            Debug.assert(Jx.isInstanceOf(platform, Platform.Client));
            tc.isTrue(Jx.isInstanceOf(message, Mail.UIDataModel.MailMessage));
            tc.isTrue(Jx.isNonEmptyString(message.objectId) && (message.objectId !== "0"));
            tc.isTrue(Jx.isFunction(options.onComplete) || options.scrubDrafts);
            tc.isTrue(Jx.scheduler.isValidPriority(options.priority) || options.scrubDrafts);

            var priority = options.priority || Mail.Priority.workerMessageScrubber;
            tc.isTrue(Jx.scheduler.isValidPriority(priority));

            this._job = Jx.scheduler.addJob(null, priority, "unit test scheduler", function () {
                this._job = null;
                if (options.onComplete) {
                    options.onComplete.call(options.onCompleteContext);
                }
            }, this);
            this._disposer = new Mail.Disposer(this._job);
            this.dispose = function () {
                this._disposer.dispose();
                this._disposer = null;
                scrubberCount--;
            };
            this.runSynchronous = function () {
                this._job.run();
                this._job = null;
            };
            this.getDocument = function () {
                tc.isTrue(this._job === null);
                return {
                    notADocument: true,
                    body: {},
                    head: {},
                    documentElement: { outerHTML: "something" }
                };
            };
            this.getSanitizedBody = function () {
                return {};
            };
        };
        Scrubber.scrubSynchronously = function (platform, message, options) {
            Debug.assert(Jx.isInstanceOf(platform, Plat.Client));
            Debug.assert(Jx.isInstanceOf(message, Mail.UIDataModel.MailMessage));
            var scrubber = new Scrubber(platform, message, options);
            scrubber.runSynchronous();
            return scrubber;
        };

        var origBodyWriter = Mail.BodyWriter;
        var writerCount = 0;
        Mail.BodyWriter = function (message, doc, options, downloadStatus) {
            writerCount++;
            tc.isTrue(Jx.isInstanceOf(message, Mail.UIDataModel.MailMessage));
            tc.isTrue(Jx.isNonEmptyString(message.objectId) && (message.objectId !== "0"));
            tc.isTrue(doc.notADocument);
            tc.isTrue(Jx.isObject(options) || Jx.isUndefined(options));

            this._runSynchronousCalled = false;
            this.dispose = function () {
                tc.isTrue(this._runSynchronousCalled);
                writerCount--;
            };
            this.runSynchronous = function () {
                tc.isFalse(this._runSynchronousCalled);
                this._runSynchronousCalled = true;
            };
        };

        var accountId = "AccountId0";
        var htmlString = "<html><head></head><body><div>This is the body of an HTML message.  There are many things wrong with it.</div><div>There are <a href='http://verybadplace.com' title='http://microsoft.com'>anchors that lie</a> about their destination.</div><akjshdjkahd>There are garbage tags</akjshdjkahd><br><listing>And listing tags</listing><div>External http images: <img width='100' src='http://ts2.mm.bing.net/th?id=H.5051342075593673&pid=1.7'></div><hr><div>And even dreaded &lt;hr&gt;s</div></body></html>";
        var provider = new MockData.JsonProvider({
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
                "all": [{
                    objectId: "htmlMessage",
                    displayViewIds: ["**InboxViewId**"],
                    accountId: accountId,
                    sanitizedVersion: Plat.SanitizedVersion.notSanitized,
                    mock$body: [{
                        body: htmlString,
                        type: Plat.MailBodyType.html
                    }]
                }]
            }
        });
        platform = provider.getClient();

        tc.addCleanup(function () {
            tc.areEqual(scrubberCount, 0);
            Mail.Worker._Scrubber = origScrubber;
            tc.areEqual(writerCount, 0);
            Mail.BodyWriter = origBodyWriter;
            provider = null;
            platform = null;
        });
    }

    Tx.test("MessageScrubber.getScrubbedDocument", function (tc) {
        setup(tc);
        var platformMessage = platform.mailManager.loadMessage("htmlMessage"),
            account = Mail.Account.load(platformMessage.accountId, platform),
            message = new Mail.UIDataModel.MailMessage(platformMessage, account);

        tc.isFalse(Jx.scheduler.testHasAnyRealWork());
        var doc = Mail.getScrubbedDocument(platform, message);
        tc.isFalse(Jx.scheduler.testHasAnyRealWork());

        tc.areEqual(doc.documentElement.outerHTML, "something");
    });

    Tx.asyncTest("MessageScrubber.async", function (tc) {
        tc.stop();
        setup(tc);
        var platformMessage = platform.mailManager.loadMessage("htmlMessage"),
            account = Mail.Account.load(platformMessage.accountId, platform),
            message = new Mail.UIDataModel.MailMessage(platformMessage, account);

        var scrubber = new Mail.Worker.AsyncMessageScrubber(platform, message, function () {
            scrubber.dispose();
            tc.start();
        }, this, Mail.Priority.workerMessageScrubber);

    });
})();

