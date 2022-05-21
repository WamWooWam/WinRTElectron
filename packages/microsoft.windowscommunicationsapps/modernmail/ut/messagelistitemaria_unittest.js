
(function () {
    /*global Mail, Microsoft,Tx,Mocks*/
    var Plat = Microsoft.WindowsLive.Platform,
        D = Mocks.Microsoft.WindowsLive.Platform.Data;

    var provider,
        testInfo = { owner: "kepoon", priority: 0 };
    function setup(tc) {
        provider = new D.JsonProvider({
            Account: {
                all: [ { objectId: "account" } ]
            },
            Folder: {
                all: [ {
                    objectId: "inbox",
                    specialMailFolderType: Plat.MailFolderType.inbox
                }]
            },
            MailView: {
                all: [ {
                    accountId: "account",
                    objectId: "inboxView",
                    type: Plat.MailViewType.inbox,
                    mock$sourceObjectId: "inbox"
                }]
            },
            MailMessage: {
                all: [ {
                    objectId: "inboxMail",
                    displayViewIds: ["inboxView"],
                    subject: "Test Subject",
                    importance: Plat.MailMessageImportance.high,
                    lastVerb: Plat.MailMessageLastVerb.forward,
                    read: false,
                    parentConversationId: "conversation1",
                    flagged: true,
                    hasOrdinaryAttachments : true,
                    irmHasTemplate: true,
                    calendarMessageType: Plat.CalendarMessageType.request
                }, {
                    objectId: "inboxMail2",
                    displayViewIds: ["inboxView"],
                    parentConversationId: "conversation1",
                }]
            },
            MailConversation: {
                all: [{
                    importance: Plat.MailMessageImportance.high,
                    lastVerb: Plat.MailMessageLastVerb.forward,
                    read: false,
                    objectId: "conversation1",
                    flagged: true,
                    hasOrdinaryAttachments : true,
                    irmHasTemplate: true,
                    hasCalendarRequest: true,
                    totalCount: 2
                }]
            }
        }, D.MethodHandlers);

        tc.cleanup = function () {
            provider = null;
        };
    }

    Tx.test("MessagelistItemAria.testNonThreadedMessage", testInfo, function (tc) {
        setup(tc);
        var account = new Mail.Account(provider.getObjectById("account"), provider.getClient()),
            view = new Mail.UIDataModel.MailView(provider.getObjectById("inboxView"), account),
            message = new Mail.UIDataModel.MailMessage(provider.getObjectById("inboxMail"), account),
            result = Mail.MessageListItemAria.getDescription(message, false /*isChild*/, view);
        tc.areEqual(result, "High priority, From No sender, Subject Invitation: Test Subject, Received , Unread, Flagged, Forwarded, Has attachment, Invitation, Has Information Rights Management");
    });

    Tx.test("MessagelistItemAria.testConversationChild", testInfo, function (tc) {
        setup(tc);
        var account = new Mail.Account(provider.getObjectById("account"), provider.getClient()),
            view = new Mail.UIDataModel.MailView(provider.getObjectById("inboxView"), account),
            message = new Mail.UIDataModel.MailMessage(provider.getObjectById("inboxMail"), account),
            result = Mail.MessageListItemAria.getDescription(message, true /*isChild*/, view);
        tc.areEqual(result, "High priority, Message in a conversation, Subject Invitation: Test Subject, Received , From No sender, Unread, Flagged, Forwarded, Has attachment, Invitation, Has Information Rights Management");
    });

    Tx.test("MessagelistItemAria.testConversation", testInfo, function (tc) {
        setup(tc);
        var account = new Mail.Account(provider.getObjectById("account"), provider.getClient()),
            view = new Mail.UIDataModel.MailView(provider.getObjectById("inboxView"), account),
            conversation = new Mail.UIDataModel.MailConversation(provider.getObjectById("conversation1"), account),
            result = Mail.MessageListItemAria.getDescription(conversation, false /*isChild*/, view);
        tc.areEqual(result, "High priority, Conversation with 2 items, From No sender, Invitation: No subject, Received , Unread, Flagged, Forwarded, Has attachment, , Has Information Rights Management");
    });
})();
