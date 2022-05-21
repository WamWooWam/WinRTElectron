
(function () {
    /*global Mail,Microsoft, Tx, Mocks*/

    var Plat = Microsoft.WindowsLive.Platform,
        D = Mocks.Microsoft.WindowsLive.Platform.Data;

    var provider;
    function setup(tc) {
        provider = new D.JsonProvider({
            Account: {
                all: [ { objectId: "account" } ]
            },
            Folder: {
                all: [ {
                    objectId: "inbox",
                    specialMailFolderType: Plat.MailFolderType.inbox
                }, {
                    objectId: "userFolder",
                    folderName: "Folder",
                    specialMailFolderType: Plat.MailFolderType.userGenerated
                }, {
                    objectId: "sentFolder",
                    specialMailFolderType: Plat.MailFolderType.sentItems
                } ]
            },
            Person: {
                all: [ {
                    objectId: "personA",
                    linkedContacts: [ { personalEmailAddress: "personA" } ]
                } ]
            },
            MailView: {
                all: [ {
                    accountId: "account",
                    objectId: "inboxView",
                    type: Plat.MailViewType.inbox,
                    mock$sourceObjectId: "inbox"
                }, {
                    accountId: "account",
                    objectId: "newsletterView",
                    type: Plat.MailViewType.newsletter,
                    isEnabled: true,
                    isPinnedToNavPane: true
                }, {
                    accountId: "account",
                    objectId: "folderView",
                    type: Plat.MailViewType.userGeneratedFolder,
                    mock$sourceObjectId: "userFolder"
                }, {
                    accountId: "account",
                    objectId: "sentView",
                    type: Plat.MailViewType.sentItems,
                    mock$sourceObjectId: "sentFolder"
                }, {
                    accountId: "account",
                    objectId: "personView",
                    type: Plat.MailViewType.person,
                    mock$sourceObjectId: "personA"
                }, {
                    accountId: "account",
                    objectId: "allPinnedView",
                    type: Plat.MailViewType.allPinnedPeople
                } ]
            },
            MailMessage: {
                all: [ {
                    objectId: "inboxMail",
                    displayViewIds: ["inboxView"],
                    parentConversationId: "inboxConversation"
                }, {
                    objectId: "newsletterMail",
                    parentConversationId: "newsletterConversation",
                    displayViewIds: ["inboxView"],
                    hasNewsletterCategory: true
                }, {
                    objectId: "notNewsletterMail",
                    parentConversationId: "notNewsletterConversation",
                    displayViewIds: ["folderView"],
                    from: "personA",
                    hasNewsletterCategory: true,
                    isFromPersonPinned: true
                }, {
                    objectId: "sentMail",
                    parentConversationId: "sentConversation",
                    displayViewIds: ["sentView"]
                } ]
            },
            MailConversation: {
                all: [{
                    objectId: "inboxConversation"
                }, {
                    objectId: "newsletterConversation"
                }, {
                    objectId: "notNewsletterConversation"
                }, {
                    objectId: "sentConversation"
                }]
            }
        }, D.MethodHandlers);

        tc.cleanup = function () {
            provider = null;
        };
    }

    Tx.test("ViewCustomizations.testLabels", function (tc) {
        setup(tc);

        var messageIds =    [ "inboxMail", "newsletterMail", "notNewsletterMail" ];
        var expected = {
            inboxView:      [ null,        "Newsletter",     "Folder" ],
            newsletterView: [ "Inbox",     null,             "Folder" ],
            folderView:     [ "Inbox",     "Newsletter",     null     ],
            personView:     [ null,        "Newsletter",     "Folder" ],
            allPinnedView:  [ null,        "Newsletter",     "Folder" ]
        };

        var account = new Mail.Account(provider.getObjectById("account"), provider.getClient());
        for (var viewId in expected) {
            var view = new Mail.UIDataModel.MailView(provider.getObjectById(viewId), account);
            messageIds.forEach(function (messageId, index) {
                var message = new Mail.UIDataModel.MailMessage(provider.getObjectById(messageId), account);
                var result = Mail.ViewCustomizations.getLabel(message, view);
                tc.areEqual(result, expected[viewId][index]);
            });
        }
    });

    Tx.test("ViewCustomizations.testLabelsDisabledCategory", function (tc) {
        setup(tc);

        provider.getObjectById("newsletterView").mock$setProperty("isEnabled", false);

        var messageIds =    [ "inboxMail", "newsletterMail", "notNewsletterMail" ];
        var expected = {
            inboxView:      [ null,        null,             "Folder" ],
            folderView:     [ "Inbox",     "Inbox",          null     ],
            personView:     [ null,        null,             "Folder" ],
            allPinnedView:  [ null,        null,             "Folder" ]
        };

        var account = new Mail.Account(provider.getObjectById("account"), provider.getClient());
        for (var viewId in expected) {
            var view = new Mail.UIDataModel.MailView(provider.getObjectById(viewId), account);
            messageIds.forEach(function (messageId, index) {
                var message = new Mail.UIDataModel.MailMessage(provider.getObjectById(messageId), account);
                var result = Mail.ViewCustomizations.getLabel(message, view);
                tc.areEqual(result, expected[viewId][index]);
            });
        }
    });

    Tx.test("ViewCustomizations.testShouldSelect", function (tc) {
        setup(tc);

        var messageIds =    [ "inboxMail", "newsletterMail", "notNewsletterMail", "sentMail" ];
        var expected = {
            inboxView:      [ true,        true,             true,                 false ],
            folderView:     [ true,        true,             true,                 false ],
            personView:     [ false,        false,           true,                 false ],
            allPinnedView:  [ false,        false,           true,                 false ]
        };

        var account = new Mail.Account(provider.getObjectById("account"), provider.getClient());
        for (var viewId in expected) {
            var view = new Mail.UIDataModel.MailView(provider.getObjectById(viewId), account);
            messageIds.forEach(function (messageId, index) {
                var message = new Mail.UIDataModel.MailMessage(provider.getObjectById(messageId), account),
                    conversation = new Mail.UIDataModel.MailConversation(provider.getObjectById(message.parentConversationId)),
                    result = Mail.ViewCustomizations.shouldBeDefaultSelection(conversation, message, view);
                tc.areEqual(result, expected[viewId][index]);
            });
        }
    });

})();
