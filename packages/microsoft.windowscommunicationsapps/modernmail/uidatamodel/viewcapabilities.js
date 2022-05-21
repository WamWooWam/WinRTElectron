
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail,Jx,Debug,Microsoft*/

Jx.delayDefine(Mail, "ViewCapabilities", function () {
    "use strict";

    var Plat = Microsoft.WindowsLive.Platform,
        MailViewType = Plat.MailViewType;

    Mail.ViewCapabilities = {
        isFiltered: function (view, filter) {
            Debug.assert(Jx.isInstanceOf(view, Mail.UIDataModel.MailView));
            Debug.assert(Jx.isValidNumber(filter));

            return view.type === MailViewType.flagged || filter !== Plat.FilterCriteria.all;
        },

        canPinToStart: function (view) {
            var type = view.type;
            return isFolder(type) || type === MailViewType.flagged;
        },

        supportsSweep: function (view) {
            Debug.assert(Jx.isInstanceOf(view, Mail.UIDataModel.MailView));

            // Sweep is supported only in Outlook.com accounts and only in views other than
            // the outbox, drafts, flagged, sent items, or deleted items folders.
            if (view.account.isWlasSupported()) {
                var type = view.type;
                return type !== MailViewType.outbox &&
                    type !== MailViewType.draft &&
                    type !== MailViewType.flagged &&
                    type !== MailViewType.sentItems &&
                    type !== MailViewType.deletedItems;
            }
            return false;
        },

        supportsThreading: function (view, settings) {
            Debug.assert(Jx.isInstanceOf(view, Mail.UIDataModel.MailView));
            Debug.assert(Jx.isInstanceOf(settings, Mail.AppSettings));

            if (!settings.isThreadingEnabled) {
                return false;
            }

            var source = view.sourceObject;

            // All non-Folder view supports threading
            if (source && source.objectType === "Folder") {
                return source.isFolderThreadingCapable;
            }
            return true;
        },

        supportsMoveAll: function (view) {
            Debug.assert(Jx.isInstanceOf(view, Mail.UIDataModel.MailView));

            // Move all is supported only in Outlook.com accounts for any folder that is a valid move source.
            return view.account.isWlasSupported();
        },

        canRename: function (view) {
            Debug.assert(Jx.isInstanceOf(view, Mail.UIDataModel.MailView));

            var source = view.sourceObject;
            return source && source.canRename;
        },

        canHaveChildren: function (view) {
            Debug.assert(Jx.isInstanceOf(view, Mail.UIDataModel.MailView));

            var source = view.sourceObject;
            return source && source.canHaveChildren;
        },

        canMoveTo: function (view) {
            Debug.assert(Jx.isInstanceOf(view, Mail.UIDataModel.MailView));

            var type = view.type,
                source = view.sourceObject;
            return isMoveTarget(type) &&
                (!source || source.objectType !== "Folder" || !source.selectionDisabled);
        },

        canMoveFrom: function (view) {
            Debug.assert(Jx.isInstanceOf(view, Mail.UIDataModel.MailView));

            var type = view.type;
            return type !== MailViewType.outbox && type !== MailViewType.draft && type !== MailViewType.flagged;
        },

        canHaveDrafts: function (view) {
            var type = view.type;
            return type !== MailViewType.outbox &&
                   type !== MailViewType.sentItems &&
                   type !== MailViewType.junkMail &&
                   type !== MailViewType.deletedItems;
        },

        requiresMoveConfirmationDialog: function (view) {
            var type = view.type;
            return type === MailViewType.newsletter || type === MailViewType.social;
        }

    };

    var folderTypes = [
        MailViewType.inbox,
        MailViewType.draft,
        MailViewType.deletedItems,
        MailViewType.sentItems,
        MailViewType.junkMail,
        MailViewType.outbox,
        MailViewType.userGeneratedFolder
    ];
    function isFolder(type) {
        return folderTypes.indexOf(type) !== -1;
    }

    var moveTargets = [
        MailViewType.inbox,
        MailViewType.deletedItems,
        MailViewType.sentItems,
        MailViewType.junkMail,
        MailViewType.userGeneratedFolder,
        MailViewType.flagged,
        MailViewType.newsletter,
        MailViewType.social
    ];
    function isMoveTarget(type) {
        return moveTargets.indexOf(type) !== -1;
    }

});
