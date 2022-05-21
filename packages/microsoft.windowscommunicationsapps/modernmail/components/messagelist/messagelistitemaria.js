
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Mail,Jx*/

Jx.delayDefine(Mail, "MessageListItemAria", function () {
    "use strict";

    var Plat = Microsoft.WindowsLive.Platform;

    function getTimestampAria(item, isChild, view) {
        if (isChild) {
            var label = Mail.ViewCustomizations.getLabel(item, view);
            if (label) {
                return Jx.res.loadCompoundString("mailMessageListConversationChildItemFolderNameAriaDesc", label);
            }
        }
        var resource = item.isOutboundFolder ? "mailMessageListItemAriaDescOutboundTimestamp" : "mailMessageListItemAriaDescInboundTimestamp";
        return Jx.res.loadCompoundString(resource, item.bestDateShortString);
    }

    function getRecipientAria(item) {
        var resource = item.isOutboundFolder ? "mailMessageListItemAriaDescOutboundRecipient" : "mailMessageListItemAriaDescInboundRecipient";
        return Jx.res.loadCompoundString(resource, item.slowHeaderRecipientsString);
    }

    var priorityAriaMap = {};
    priorityAriaMap[Plat.MailMessageImportance.low] = "mailMessageListItemAriaDescLowPriority";
    priorityAriaMap[Plat.MailMessageImportance.high] = "mailMessageListItemAriaDescHighPriority";

    var lastVerbAriaMap = {};
    lastVerbAriaMap[Plat.MailMessageLastVerb.forward] = "mailMessageListListViewAriaDescriptionForwarded";
    lastVerbAriaMap[Plat.MailMessageLastVerb.replyToSender] = "mailMessageListListViewAriaDescriptionReplied";
    lastVerbAriaMap[Plat.MailMessageLastVerb.replyToAll] = "mailMessageListListViewAriaDescriptionReplied";

    function getStringFromMap(value, map) {
        var resource = map[value];
        return resource ? Jx.res.getString(resource) : "";
    }

    Mail.MessageListItemAria = {
        getDescription: function (item, isChild, view) {
            Debug.assert(Jx.isInstanceOf(item, Mail.UIDataModel.MailItem));
            Debug.assert(Jx.isBoolean(isChild));
            Debug.assert(Jx.isInstanceOf(view, Mail.UIDataModel.MailView));

            Jx.mark("Mail.MessageListItemAria.getDescription,StartTA,Mail");

            var result,
                timestamp = getTimestampAria(item, isChild, view),
                recipient = getRecipientAria(item),
                subject = item.subject,
                priority = getStringFromMap(item.importance, priorityAriaMap),
                lastVerb = getStringFromMap(item.lastVerb, lastVerbAriaMap),
                readState = Jx.res.getString(item.read ? "mailMessageListListViewAriaDescriptionRead" : "mailMessageListListViewAriaDescriptionUnread"),
                flagState = item.flagged ? Jx.res.getString("mailMessageListItemAriaDescFlagged") : "",
                attachments = item.hasOrdinaryAttachments ? Jx.res.getString("mailMessageListItemAriaDescHasAttachment") : "",
                irm = item.irmHasTemplate ? Jx.res.getString("mailMessageListItemAriaDescIrm") : "",
                calendar = item.calendarInvite ? Jx.res.getString("mailMessageListItemAriaDescCalendarItem") : "";

            if (isChild) {
                result = Jx.res.loadCompoundString(
                    "mailMessageListConversationChildItemAriaDescriptionTemplate",
                    priority, subject, timestamp, recipient, readState, flagState,
                    lastVerb, attachments, calendar, irm
                );
            } else {
                var totalCount = item.totalCount;
                if (totalCount <= 1) {
                    result = Jx.res.loadCompoundString(
                        "mailMessageListMailItemAriaDescriptionTemplate",
                        priority, recipient, subject, timestamp, readState, flagState,
                        lastVerb, attachments, calendar, irm
                    );
                } else {
                    result = Jx.res.loadCompoundString(
                        "mailMessageListConversationHeaderAriaDescriptionTemplate",
                        priority, totalCount, recipient, subject, timestamp, readState,
                        flagState, lastVerb, attachments, calendar, irm
                    );
                }
            }

            Jx.mark("Mail.MessageListItemAria.getDescription,StopTA,Mail");
            return result;
        }
    };

});
