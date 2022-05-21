
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// ScrubHelper UTs

(function () {

    var Plat = Microsoft.WindowsLive.Platform,
        Mock = Mocks.Microsoft.WindowsLive.Platform,
        MockData = Mock.Data;

    var accountIds = ["accountId1", "accountId2"],
        folderIds = ["folderId1", "folderId2"],
        messageIds = [];

    var provider, platform, scrubbed;

    function setup(tc) {
        var messages = [];
        var folders = [];
        var views = {};
        accountIds.forEach(function (accountId, accountIndex) {
            folderIds.forEach(function (folderId, folderIndex) {
                folders.push({
                    objectId: folderId,
                    specialMailFolderType: Plat.MailFolderType.userGenerated
                });
                var viewType = Plat.MailViewType.userGeneratedFolder;
                var viewQueryId = "ensureMailView_" + viewType + "_" + accountId + "_" + folderId;
                views[viewQueryId] = [{
                    objectId: folderId+"View",
                    type: viewType
                }];
                for (var ii = 0; ii < 2; ii++) {
                    var messageId = "messageId" + accountIndex.toString() + folderIndex.toString() + ii.toString();
                    messageIds.push(messageId);
                    messages.push( {
                        objectId: messageId,
                        parentConversationId: messageId + "-conversation",
                        displayViewIds: [folderId + "View"],
                        accountId: accountId
                    });
                }
            });
        });
        provider = new MockData.JsonProvider({
            Account: {
                "default": [{
                    objectId: accountIds[0]
                }],
                "connected": [
                    accountIds[0],
                    {
                        objectId: accountIds[1]
                    }
                ]
            },
            Folder: {
                "all": folders
            },
            MailView: views,
            MailMessage: {
                "all": messages
            }
        });
        platform = provider.getClient();

        scrubbed = [];
        var origAsyncMessageScrubber = Mail.Worker.AsyncMessageScrubber;
        Mail.Worker.AsyncMessageScrubber = function (platform, message, onComplete, onCompleteContext, priority) {
            Debug.assert(Jx.isInstanceOf(platform, Plat.Client));
            tc.isTrue(Jx.isInstanceOf(message, Mail.UIDataModel.MailMessage));
            tc.isTrue(Jx.isNullOrUndefined(onComplete) || Jx.isFunction(onComplete));
            tc.isTrue(Jx.scheduler.isValidPriority(priority));
            this._disposeTracker = {
                objectId: message.objectId,
                disposed: false
            };
            scrubbed.push(this._disposeTracker);

            this.dispose = function () {
                tc.isFalse(this._disposeTracker.disposed);
                this._disposeTracker.disposed = true;
            };
        };
        tc.addCleanup(function () {
            scrubbed.forEach(function (obj) {
                tc.isTrue(obj.disposed);
            });
            Mail.Worker.AsyncMessageScrubber = origAsyncMessageScrubber;
        });
    }

    function runThroughAllSelections(tc, selection) {
        accountIds.push(null);
        folderIds.push(null);
        messageIds.push(null);
        accountIds.forEach(function (accountId) {
            selection.onSelectionChanged({
                messageType: "accountChanged",
                message: {newValue: accountId}
            });
            folderIds.forEach(function (folderId) {
                selection.onSelectionChanged({
                    messageType: "viewChanged",
                    message: {newValue: folderId + "View"}
                });
                messageIds.forEach(function (messageId) {
                    selection.onSelectionChanged({
                        messageType: "messageChanged",
                        message: {newValue: messageId}
                    });
                });
            });
        });
        tc.isTrue(accountIds.pop() === null);
        tc.isTrue(folderIds.pop() === null);
        tc.isTrue(messageIds.pop() === null);
    }

    Tx.test("Selection.changingSelection", function (tc) {
        setup(tc);
        var selection = new Mail.Worker.Selection(platform);
        runThroughAllSelections(tc, selection);
        selection.dispose();

        messageIds.forEach(function (messageId) {
            var found = false;
            for (var ii = 0, iiMax = scrubbed.length; ii < iiMax; ii++) {
                var obj = scrubbed[ii];
                if (obj.objectId === messageId) {
                    tc.isTrue(obj.disposed);
                    found = true;
                }
            }
            tc.isTrue(found);
        });
    });

    Tx.test("Selection.scoreUpdate", function (tc) {
        setup(tc);
        var selection = new Mail.Worker.Selection(platform);
        selection._viewId = "SomeView";

        var scores = [];
        messageIds.forEach(function (messageId) {
            var platformMessage = platform.mailManager.loadMessage(messageId),
                account = Mail.Account.load(platformMessage.accountId, platform),
                message = new Mail.UIDataModel.MailMessage(platformMessage, account),
                onUpdate = Jx.fnEmpty;
            var score = new Mail.Worker.Score(platform, message, selection, onUpdate);
            scores.push(score);
        });

        runThroughAllSelections(tc, selection);
        selection.dispose();
    });

})();

