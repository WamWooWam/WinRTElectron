
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Microsoft,Jx,Debug*/

Jx.delayDefine(Mail, "SweepRules", function () {
    "use strict";

    Mail.SweepRules = {};

    var Plat = Microsoft.WindowsLive.Platform,
        SweepRules = Mail.SweepRules;

    var sweepTypeEnum = Mail.SweepRules.sweepType = {
        moveAll: 0,
        moveAllFuture: 1,
        moveTenDays: 2,
        moveNotMostRecent: 3
    };

    function runRule(senderEmail, sourceView, destinationView, sweepType) {
        Debug.assert(Mail.Validators.areEqual(sourceView.account, destinationView.account));
        var rule = SweepRules._createRule(sourceView.account.platformObject),
            saveRule = false;

        if (!rule) {
            return;
        }

        var actionType = getActionType(sourceView, destinationView);

        rule.actionType = actionType;

        switch (sweepType) {
            case sweepTypeEnum.moveAll:
                rule.deferredActionAge = 0;
                rule.deferredActionType = Plat.MailRuleDeferredActionType.none;
                saveRule = false;
                break;
            case sweepTypeEnum.moveAllFuture:
                rule.deferredActionAge = 0;
                rule.deferredActionType = Plat.MailRuleDeferredActionType.none;
                saveRule = true;
                break;
            case sweepTypeEnum.moveTenDays:
                rule.deferredActionAge = 10;
                rule.deferredActionType = Plat.MailRuleDeferredActionType.days;
                saveRule = true;
                break;
            case sweepTypeEnum.moveNotMostRecent:
                rule.deferredActionAge = 1;
                rule.deferredActionType = Plat.MailRuleDeferredActionType.count;
                saveRule = true;
                break;
            default:
                Debug.assert(false);
                return;
        }

        rule.senderEmailAddress = senderEmail;

        rule.targetCategoryId = getTargetCategoryId(actionType, sourceView, destinationView);

        rule.targetFolderId = getTargetFolderId(actionType, destinationView);

        var scopeFolder = SweepRules.getScopeFolder(actionType, sweepType, sourceView),
            scopeFolderId = scopeFolder ? scopeFolder.objectId : "";
        rule.runMailRule(scopeFolderId);

        if (saveRule) {
            rule.commit();
        }

    }

    SweepRules.runSweepRule = function (senderEmail, view, sweepType) {
        _markStart("runSweepRule");
        Debug.assert(Jx.isNonEmptyString(senderEmail));
        Debug.assert(Jx.isInstanceOf(view, Mail.UIDataModel.MailView));
        Debug.assert(Jx.isNumber(sweepType));

        runRule(senderEmail, view, view.account.deletedView, sweepType);

        _markStop("runSweepRule");
    };

    SweepRules.runMoveAllRule = function (senderEmail, sourceView, destinationView, sweepType) {
        Debug.assert(Jx.isNonEmptyString(senderEmail));
        Debug.assert(Jx.isInstanceOf(sourceView, Mail.UIDataModel.MailView));
        Debug.assert(Jx.isInstanceOf(destinationView, Mail.UIDataModel.MailView));
        Debug.assert(Jx.isNumber(sweepType));

        if (twoRulesRequired(sourceView.type, destinationView.type)) {
            // Some combinations of source and destination views require two rules to accomplish.
            // In these cases, we need to create:
            // 1. A move from the source to the inbox
            // 2. A move from the inbox to the destination
            var inbox = sourceView.account.inboxView;

            runRule(senderEmail, sourceView, inbox, sweepType);
            runRule(senderEmail, inbox, destinationView, sweepType);
        } else {
            runRule(senderEmail, sourceView, destinationView, sweepType);
        }
    };

    SweepRules.getSenders = function (selection, items) {
        /// <summary>Creates a de-duped list of IRecipients for the senders of the given
        /// messages. If multiple messages are sent from the same email address but a different
        /// sender name, one IRecipient is chosen arbitrarily. This function first places
        /// recipients in a map keyed off the email address and then converts the de-duped set
        /// into an array which is returned.</summary>
        _markStart("getSenders");
        items = items || selection.messages;
        var senderMap = {};

        items.forEach(function (item) {
            var sender = item.from;

            if (sender) {
                senderMap[sender.emailAddress] = sender;
            }
        });

        var senderArray = [];
        for (var key in senderMap) {
            if (senderMap.hasOwnProperty(key)) {
                senderArray.push(senderMap[key]);
            }
        }

        _markStop("getSenders");
        return senderArray;
    };

    SweepRules._createRule = function (account) {
        Debug.assert(Jx.isInstanceOf(account, Microsoft.WindowsLive.Platform.Account));
        var ruleResource = account.getResourceByType(Plat.ResourceType.mailRule);

        if (!ruleResource) {
            Debug.assert(false, "Unable to get rule resource");
            return null;
        }

        return ruleResource.createRule();
    };

    function twoRulesRequired(sourceViewType, destinationViewType) {
        // Returns true if two rules are required to accomplish the move from the
        // source type to the destination type and false if one rule will work
        var viewType = Plat.MailViewType;

        if (((sourceViewType === viewType.newsletter) || (sourceViewType === viewType.social)) &&
            (destinationViewType !== viewType.inbox)) {
            // Moving from a newsletter/social view to a destination other than the inbox
            return true;
        } else if ((sourceViewType !== viewType.inbox) &&
            ((destinationViewType === viewType.newsletter) || (destinationViewType === viewType.social))){
            // Moving to a newsletter/social view from a source other than the inbox
            return true;
        }

        return false;
    }

    function getActionType(sourceView, destinationView) {
        var viewType = Plat.MailViewType;

        if ((destinationView.type === viewType.newsletter) || (destinationView.type === viewType.social))  {
            // We should only add categories to messages already in the inbox since
            // categories views are subsets of the inbox
            Debug.assert(sourceView.type === viewType.inbox);
            return Plat.MailRuleActionType.addCategory;
        } else if (((sourceView.type === viewType.newsletter) || (sourceView.type === viewType.social)) &&
            (destinationView.type !== viewType.deletedItems)) {
            // We should only remove categories from messages already in the inbox since
            // categories views are subsets of the inbox
            Debug.assert(destinationView.type === viewType.inbox);
            return Plat.MailRuleActionType.removeCategory;
        } else {
            return Plat.MailRuleActionType.move;
        }
    }

    SweepRules.getScopeFolder = function (actionType, sweepType, sourceView) {
        var mailFolder = null,
            viewType = Plat.MailViewType,
            sourceViewType = sourceView.type;

        if (sweepType === sweepTypeEnum.moveAll || sweepType === sweepTypeEnum.moveAllFuture) {
            if (actionType === Plat.MailRuleActionType.move) {
                if ((sourceViewType === viewType.newsletter) || (sourceViewType === viewType.social)) {
                    mailFolder = sourceView.account.inboxView.folder;
                } else {
                    mailFolder = sourceView.folder;
                }
            } else {
                mailFolder = sourceView.account.inboxView.folder;
                Debug.assert(Jx.isObject(mailFolder));
            }
        }
        else {
            Debug.assert(sweepType === sweepTypeEnum.moveTenDays || sweepType === sweepTypeEnum.moveNotMostRecent);
            mailFolder = null;
        }

        return mailFolder;
    };

    function getTargetCategoryId(actionType, sourceView, destinationView) {
        var actionTypeEnum = Plat.MailRuleActionType,
            viewType = Plat.MailViewType,
            view = null;

        // For moves, the target category ID is none. For add category rules, the
        // target category ID corresponds to the destination view's type. For remove
        // category rules, it corresponds to the source view's type.

        switch (actionType) {
            case actionTypeEnum.move:
                return Plat.MailRuleCategoryId.none;

            case actionTypeEnum.addCategory:
                view = destinationView;
                break;

            case actionTypeEnum.removeCategory:
                view = sourceView;
                break;

            default:
                Debug.assert(false, "Unexpected action type");
                return Plat.MailRuleCategoryId.none;
        }

        switch (view.type) {
            case viewType.newsletter:
                return Plat.MailRuleCategoryId.newsletter;

            case viewType.social:
                return Plat.MailRuleCategoryId.social;

            default:
                Debug.assert(false, "Unexpected view type");
                return Plat.MailRuleCategoryId.none;
        }
    }

    function getTargetFolderId(actionType, destinationView) {
        // If this is a move, the destinationView needs to have a backing MailFolder
        Debug.assert((actionType !== Plat.MailRuleActionType.move) || Jx.isObject(destinationView.folder));

        // For moves, the target folder ID is the object ID of the destination view's backing folder.
        // For add and remove category rules, this target folder ID is an empty string.
        return (actionType === Plat.MailRuleActionType.move) ? destinationView.folder.objectId : "";
    }

    function _markStart(s) { Jx.mark("SweepRules." + s + ",StartTA,WorkerOwner"); }
    function _markStop(s) { Jx.mark("SweepRules." + s + ",StopTA,WorkerOwner"); }
});
