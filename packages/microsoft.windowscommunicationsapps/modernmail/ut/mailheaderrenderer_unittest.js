

//
// Tests
//

/*jshint browser:true*/
/*global Mail,Microsoft,Jx,People,WinJS,Tx*/

(function() {
    var P = Microsoft.WindowsLive.Platform;

    // Actors in this test
    var notificationHandler = {
        changed : function () {}
    };

    var selectionHandler = {
        mockedType: Mail.SelectionHandler
    };

    var mockListView = {
        mockedType: WinJS.UI.ListView,
        addEventListener: Jx.fnEmpty,
        removeEventListener: Jx.fnEmpty,
        loadingstate: "complete"
    };

    var selection = {
        mockedType: Mail.Selection
    };

    var originalMLIFactoryListView = Mail.MessageListItemFactory.listView;

    function setup(tc) {
        tc.cleanup = function () {
            Mail.UnitTest.disposeGlobals();
            Mail.UnitTest.restoreUtilities();
            Mail.UnitTest.restoreJx();
            Mail.MessageListItemFactory.listView = originalMLIFactoryListView;
        };

        Mail.MessageListItemFactory.listView = mockListView;
        Mail.UnitTest.stubJx(tc, "activation");
        Mail.UnitTest.stubJx(tc, "appData");
        Mail.UnitTest.stubJx(tc, "res");
        Mail.UnitTest.initGlobals(tc);
        Mail.UnitTest.setupStubs();
        Mail.UnitTest.setupFormatStubs();
        Mail.UnitTest.setupModernCanvasStubs();
        Mail.UnitTest.stubUtilities();

        var platform = Mail.Globals.platform;
        selection.account = new Mail.Account(platform.accountManager.defaultAccount, platform);
        selection.view = selection.account.inboxView;
    }


    function getMessage(index, collectionName) {
        var platform = Mail.Globals.platform,
            utMailCollection = platform.mock$provider.query("MailMessage", "getFilteredMessageCollection", [collectionName, P.FilterCriteria.all]),
            platformMessage = utMailCollection.item(index);
        return new Mail.UIDataModel.MailMessage(platformMessage, selection.account);
    }

    function wrapItem(uiMailMessage) {
        var treeNode = new Mail.MessageListTreeNode(uiMailMessage, "message", null);
        return {
            key: uiMailMessage.objectId,
            data: treeNode
        };
    }

    function getIdentityString(peopleList) {
        if (peopleList.length <= 0) {
            return null;
        }

        var div = document.createElement("DIV");
        var ui = [];
        for(var i = 0, iMax = peopleList.length; i < iMax; i++) {
            var person = peopleList[i];
            var identityControl = new People.IdentityControl(person, null, { interactive : false });
            ui.push(identityControl.getUI(People.IdentityElements.Name));
        }
        div.innerHTML = ui.join("; ");

        return div.innerText;
    }

    function getSimpleString(peopleList) {
        if (peopleList.length <= 0) {
            return null;
        }

        var arr = [];
        for(var i = 0, iMax = peopleList.length; i < iMax; i++) {
            arr.push(peopleList[i].calculatedUIName);
        }
        return arr.join("; ");
    }

    function validateGlyph(tc, element, glyph, shouldShow) {
        var el = element.querySelector("." + glyph);
        tc.isTrue((el !== null) === shouldShow, glyph + " is not rendered property");
    }

    function validateRendering(tc, element, message, collectionName) {
        /// <summary></summary>
        /// <param name="element" type="HTMLElment"></param>
        /// <param name="message" type="Mail.UIDataModel.UIMailMessage"></param>
        /// <param name="collectionName" type="String"></param>
        var fromSimpleString, fromSimpleField;
        if (collectionName === "MailHeaderRenderer_Unittest_SentItem") {
            fromSimpleField = getSimpleString(message.to);
        } else {
            fromSimpleField = getSimpleString([message.from]);
            tc.areEqual(element.querySelector(".mailMessageListDate").innerText , message.bestDateShortString, "The date format does not match");
        }
        fromSimpleString = (fromSimpleField === null) ? message.headerNoRecipientsString : fromSimpleField;

        var fromString = element.querySelector(".mailMessageListFrom").innerText;
        if(fromString == "null") {
            tc.isTrue(fromSimpleString === null, "The sender does not match (both should be null).");
        }
        else {
            tc.areEqual(fromString , fromSimpleString, "The sender does not match");
        }
        tc.areEqual(element.querySelector(".mailMessageListSubject").innerHTML, "<span>" + message.subjectHTML + "</span>", "The subject does not match");

        validateGlyph(tc, element, "glyphAttachment", message.hasOrdinaryAttachments);

        validateGlyph(tc, element, "glyphForwarded", message.lastVerb === P.MailMessageLastVerb.forward);
        validateGlyph(tc, element, "glyphReplied", message.lastVerb === P.MailMessageLastVerb.replyToSender ||
                                                   message.lastVerb === P.MailMessageLastVerb.replyToAll);

        validateGlyph(tc, element, "glyphLowPriority", message.importance === P.MailMessageImportance.low);
        validateGlyph(tc, element, "glyphHiPriority", message.importance === P.MailMessageImportance.high);

        validateGlyph(tc, element, "glyphInvite", message.calendarMessageType !== P.CalendarMessageType.none);

        validateGlyph(tc, element, "glyphIrm", message.irmHasTemplate);

        /// Validate Read/Unread Status
        tc.isTrue(element.classList.contains("unread") !== message.read, "This message should be shown as " + (message.read)? "read" : "unread");
    }

    function validateSecondPassRendering(tc, element, message, collectionName) {
        /// <param name="element" type="HTMLElment"></param>
        /// <param name="message" type="Mail.UIDataModel.UIMailMessage"></param>
        /// <param name="collectionName" type="String"></param>
        var fromString, fromField;
        if (collectionName === "MailHeaderRenderer_Unittest_SentItem") {
            fromField = getIdentityString(message.to);
        } else {
            fromField = getIdentityString([message.from]);
        }
        fromString = (fromField === null) ? message.headerNoRecipientsString : fromField;

        var fromStringActual = element.querySelector(".mailMessageListFrom").innerText;
        if(fromStringActual == "null") {
            tc.isTrue(fromString === null, "The sender does not match (both should be null).");
        }
        else {
            tc.areEqual(fromString , fromStringActual, "The sender does not match");
        }
    }

    Tx.test("MailHeaderRenderer.renderMessage", function (tc) {
        setup(tc);

        var renderer = new Mail.MailHeaderRenderer(notificationHandler, selectionHandler, false, selection);
        var messageCollection = "MessageList_UnitTest";
        var item = getMessage(0, messageCollection);
        tc.isTrue(!item.read, "This message should be unread");
        tc.isTrue(item.hasOrdinaryAttachments, "This message should have attachment");
        tc.areEqual(item.importance,P.MailMessageImportance.high, "The message should have importance high");
        tc.areEqual(item.lastVerb,P.MailMessageLastVerb.replyToSender, "The message should have lastVerb reply to sender");
        var element = renderer.renderItem(wrapItem(item));
        tc.isTrue(Jx.isHTMLElement(element));
        validateRendering(tc, element, item, messageCollection);
        Mail.UnitTest.ensureSynchronous(Mail.MessageListItemFactory._onListViewStateComplete, Mail.MessageListItemFactory);
        validateSecondPassRendering(tc, element, item, messageCollection);

        item = getMessage(1, messageCollection);
        tc.isTrue(item.read, "This message should be read");
        tc.isTrue(!item.hasOrdinaryAttachments, "This message should have no attachment");
        tc.areEqual(item.importance,P.MailMessageImportance.low, "The message should have importance low");
        tc.areEqual(item.lastVerb,P.MailMessageLastVerb.replyToAll, "The message should have lastVerb replyToAll");
        element = renderer.renderItem(wrapItem(item));
        tc.isTrue(Jx.isHTMLElement(element));
        validateRendering(tc, element, item, messageCollection);
        Mail.UnitTest.ensureSynchronous(Mail.MessageListItemFactory._onListViewStateComplete, Mail.MessageListItemFactory);
        validateSecondPassRendering(tc, element, item, messageCollection);

        item = getMessage(2, messageCollection);
        tc.areEqual(item.importance,P.MailMessageImportance.normal, "The message should have importance normal");
        tc.areEqual(item.lastVerb,P.MailMessageLastVerb.forward, "The message should have lastVerb reply to sender");
        element = renderer.renderItem(wrapItem(item));
        tc.isTrue(Jx.isHTMLElement(element));
        validateRendering(tc, element, item, messageCollection);
        Mail.UnitTest.ensureSynchronous(Mail.MessageListItemFactory._onListViewStateComplete, Mail.MessageListItemFactory);
        validateSecondPassRendering(tc, element, item, messageCollection);

        item = getMessage(3, messageCollection);
        tc.areEqual(item.lastVerb,P.MailMessageLastVerb.unknown, "The message should have lastVerb unknown");
        element = renderer.renderItem(wrapItem(item));
        tc.isTrue(Jx.isHTMLElement(element));
        validateRendering(tc, element, item, messageCollection);
        Mail.UnitTest.ensureSynchronous(Mail.MessageListItemFactory._onListViewStateComplete, Mail.MessageListItemFactory);
        validateSecondPassRendering(tc, element, item, messageCollection);
        Mail.UnitTest.ensureSynchronous(Mail.MessageListItemFactory.resetAll, Mail.MessageListItemFactory);
        Mail.UnitTest.ensureSynchronous(renderer.dispose, renderer);
    });

    Tx.test("MailHeaderRenderer.renderSentItems", function (tc) {
        setup(tc);

        selection.view = selection.account.sentView;
        var renderer = new Mail.MailHeaderRenderer(notificationHandler, selectionHandler, false, selection);
        var messageCollection = "MailHeaderRenderer_Unittest_SentItem";
        var item = getMessage(0, messageCollection);
        var element = renderer.renderItem(wrapItem(item));
        tc.isTrue(Jx.isHTMLElement(element));
        validateRendering(tc, element, item, messageCollection);

        item = getMessage(1, messageCollection);
        element = renderer.renderItem(wrapItem(item));
        tc.isTrue(Jx.isHTMLElement(element));
        validateRendering(tc, element, item, messageCollection);
        Mail.UnitTest.ensureSynchronous(Mail.MessageListItemFactory._onListViewStateComplete, Mail.MessageListItemFactory);
        validateSecondPassRendering(tc, element, item, messageCollection);

        /// No receiver
        item = getMessage(2, messageCollection);
        element = renderer.renderItem(wrapItem(item));
        tc.isTrue(Jx.isHTMLElement(element));
        validateRendering(tc, element, item, messageCollection);
        Mail.UnitTest.ensureSynchronous(Mail.MessageListItemFactory._onListViewStateComplete, Mail.MessageListItemFactory);
        validateSecondPassRendering(tc, element, item, messageCollection);
        Mail.UnitTest.ensureSynchronous(Mail.MessageListItemFactory.resetAll, Mail.MessageListItemFactory);
        Mail.UnitTest.ensureSynchronous(renderer.dispose, renderer);
    });

    Tx.test("MailHeaderRenderer.renderConversationHeader", function (tc) {
        setup(tc);

        var accessibilityHelper = {
            isExpanded: function () { return false; },
            setListenerForThread: Jx.fnEmpty,
            removeListenerForThread: Jx.fnEmpty,
            mockedType: Mail.AccessibilityHelper
        };
        var renderer = new Mail.MailHeaderRenderer(notificationHandler, selectionHandler, true, selection);
        var platformConversation = {
            objectId: "conversation1234567890",
            fromRecipient : { fastName: "HR", calculatedUIName : "Human Resources", objectType: "Recipient" },
            read: false,
            importance: 3,
            hasOrdinaryAttachments: true,
            irmHasTemplate: true,
            lastVerb: 2,
            hasCalendarInvite: true,
            totalCount: 10,
            unreadCount: 5,
            latestReceivedTime: new Date(1298429889000), //FileTime equivalent of Tuesday, February 22, 2011 9:58:09pm
            subject : "We need to have a conversation...",
            addEventListener: Jx.fnEmpty,
            removeEventListener: Jx.fnEmpty,
            instanceNumber: -1,
            mockedType: Microsoft.WindowsLive.Platform.MailConversation,
            hasDraft: false,
            isObjectValid : true
        };
        var uiConversation = new Mail.UIDataModel.MailConversation(platformConversation);
        var item = {
            key: "conversation1234567890",
            data: new Mail.ConversationNode(uiConversation, selection.view)
        };

        var element = Mail.UnitTest.ensureSynchronous(renderer.renderItem, renderer, [item, accessibilityHelper]);
        tc.isTrue(Jx.isHTMLElement(element));
        tc.isTrue(!Jx.isNonEmptyString(element.getAttribute("aria-expanded")));
        tc.isTrue(!Jx.isNonEmptyString(element.getAttribute("aria-labelledby")));
        tc.areEqual(element.querySelector(".mailMessageListFrom").innerText, platformConversation.fromRecipient.fastName);
        tc.areEqual(element.querySelector(".glyphCount").innerText, String(platformConversation.totalCount));
        validateGlyph(tc, element, "glyphIrm", true);
        Mail.UnitTest.ensureSynchronous(Mail.MessageListItemFactory._onListViewStateComplete, Mail.MessageListItemFactory);
        Mail.UnitTest.ensureSynchronous(Mail.MessageListItemFactory.resetAll, Mail.MessageListItemFactory);
        Mail.UnitTest.ensureSynchronous(renderer.dispose, renderer);
    });
})();
