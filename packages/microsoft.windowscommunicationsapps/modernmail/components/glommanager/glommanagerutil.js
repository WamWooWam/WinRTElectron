
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx, Mail, Debug, Microsoft */
/*jshint browser:true*/

Jx.delayDefine(Mail, "GlomManagerUtil", function () {

    Mail.GlomManagerUtil = function (glomManager, selection) {
        Debug.assert(Jx.isObject(glomManager));
        Debug.assert(Jx.isInstanceOf(selection, Mail.Selection));
        Jx.EventManager.addListener(Jx.root, "openEml", this._onOpenEml, this);
        this._glomManager = glomManager;
        this._selection = selection;
    };
    var proto = Mail.GlomManagerUtil.prototype;
    proto.dispose = function () {
        Jx.EventManager.removeListener(Jx.root, "openEml", this._onOpenEml, this);
    };
    proto._onOpenEml = function (event) {
        // Create a MailMessage from the stream
        var stream = event.data[0],
            platform = Mail.Globals.platform,
            account = this._selection.account.platformObject;

        var inboxFolder = Mail.UIDataModel.FolderCache.getPlatformFolder(account, Microsoft.WindowsLive.Platform.MailFolderType.inbox);
        Debug.assert(!Jx.isNullOrUndefined(inboxFolder));

        platform.mailManager.createMessageFromMimeAsync(inboxFolder, stream, false/*allow commit*/).done(function (platformMessage) {
            if (platformMessage) {
                this.openChildMailWindow(platformMessage, /* isEmlMessage */ true);
            }
        }.bind(this));
    };
    proto.openChildMailWindow = function (message, isEmlMessage) {
        Debug.assert(Jx.isInstanceOf(message, Microsoft.WindowsLive.Platform.IMailMessage));
        Debug.assert(Jx.isBoolean(isEmlMessage));
        // handle event from button on the command bar to create a new window
        Mail.writeProfilerMark("Glom ManagerUtil openChildMailWindow");
        Jx.ptStart("Mail-ChildStart");
        var keepAlive = message.getKeepAlive();
        if (keepAlive) {
            if (isEmlMessage) { // We need to scrub EML messages before displaying them.
                // Scrubbed bodies must be commited after keepalive has commited the main HTML body
                // Committing both at the same time is not supported.
                // Keepalive may have changed the objectId, so it needs to be loaded from mailManager
                var platform = Mail.Globals.platform,
                    loadedMessage = platform.mailManager.loadMessage(keepAlive.objectId);
                if (loadedMessage) {
                    var account = Mail.Account.load(loadedMessage.accountId, platform);
                    Mail.synchronousScrub(platform, new Mail.UIDataModel.MailMessage(loadedMessage, account));
                } else {
                    Debug.assert(Jx.isObject(loadedMessage), "Failed to load message stored by keepAlive");
                    keepAlive.dispose();
                    return;
                }
            } else {
                // If we are launching a non-EML child window, we always want to show NavPane + MessageList in the main window.
                Mail.guiState.navigateBackward();
            }

            var startingContext = {
                messageId: keepAlive.objectId,
                instanceNumber: message.instanceNumber,
                isEmlMessage: isEmlMessage,
                isParentVisible : this._glomManager.getParentVisible()
            };
            Debug.assert(Jx.isNonEmptyString(startingContext.messageId));
            Debug.assert(Jx.isNumber(startingContext.instanceNumber));
            // If the current glom manager supports adding keepalive, call it.
            if (Jx.isFunction(this._glomManager.addKeepAlive)) {
                this._glomManager.addKeepAlive(keepAlive);
            }
            Jx.glomManager.createOrShowGlom(startingContext.messageId, startingContext, Jx.GlomManager.ShowType.shareScreen);
        }
    };
});
