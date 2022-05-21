
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail,Jx,Debug,Microsoft*/

Jx.delayDefine(Mail, "ViewCustomizations", function () {

    var Plat = Microsoft.WindowsLive.Platform,
        MailViewType = Plat.MailViewType;

    var categories = [
        { property: "hasNewsletterCategory",   viewType: MailViewType.newsletter, resource: "mailLabelNewsletter"  },
        { property: "hasSocialUpdateCategory", viewType: MailViewType.social,     resource: "mailLabelSocialUpdate" }
    ];

    function isCategoryEnabled(account, type) {
        var view = account.getView(type);
        return view && view.isEnabled;
    }

    Mail.ViewCustomizations = {
        getLabel: function (message, view) {
            /// <summary>The message list will sometimes display a string returned by this function instead of the date,
            /// to help identify the location of a message</summary>
            Debug.assert(Jx.isInstanceOf(message, Mail.UIDataModel.MailMessage));
            Debug.assert(Jx.isInstanceOf(view, Mail.UIDataModel.MailView));

            if (message.isDraft) {
                // Drafts never have a folder label
                return null;
            }

            var viewType = view.type;
            if (viewType === MailViewType.person || viewType === MailViewType.allPinnedPeople || viewType === MailViewType.flagged) {
                // Labels in cross-folder views act like the inbox
                view = view.account.inboxView;
            }
            if (view.containsMessage(message)) {
                return null;
            }

            if (message.isInInbox) {
                var messageCategories = categories.filter(function (category) {
                    return message[category.property] && isCategoryEnabled(view.account, category.viewType);
                });
                if (messageCategories.length > 0) {
                    return messageCategories.map(function (category) { return Jx.res.getString(category.resource); }).join(", ");
                }
            }
            return message.getBestViewName(view.objectId);
        },

        shouldBeDefaultSelection: function (conversation, message, view) {
            ///<summary>Should this message be selected/displayed by default when expanding a conversation?</summary>
            Debug.assert(Jx.isInstanceOf(conversation, Mail.UIDataModel.MailConversation));
            Debug.assert(Jx.isInstanceOf(message, Mail.UIDataModel.MailMessage));
            Debug.assert(Jx.isInstanceOf(view, Mail.UIDataModel.MailView));

            switch (view.type) {
            case MailViewType.allPinnedPeople:
            case MailViewType.person:
                return view.containsMessage(message);
            default:
                // If the conversation has only drafts or sent items, prefer the sent item to drafts
                // Otherwise, return anything that is not in sent items
                return (conversation.hasOnlyDraftOrSent) ? message.isInSentItems : !message.isInSentItems;
            }
        }

    };

});

