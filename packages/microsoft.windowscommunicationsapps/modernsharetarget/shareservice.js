
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Share, Debug, Jx*/

Share.ShareService = function () {
    /// <summary>
    /// ShareService Class is responsible for the building the message for the Share Anything request of all Share types.
    /// </summary>

    this._helper = null;
};

Share.ShareService.prototype._shareObject = null; // ShareData saved for the file share case

Share.ShareService.prototype.initiateShare = function (shareObject) {
    /// <summary>
    /// Initiates the Share Activity. 
    /// </summary>
    /// <param name="shareObject" type="Share.MailData">The ShareObject containing the networks, type, and data on the shared object.</param>

    Debug.assert(shareObject, "initiateShare requires a share object");

    if (Jx.isObject(shareObject)) {
 
        var helper = this._helper = new Share.RequestHelper(shareObject.shareOperation, shareObject.quickLink);
        
        // Begin sending the mail.
        helper.sendMessageToOutbox(shareObject.mailMessage, shareObject.account, shareObject.platform);
    } else {
        Jx.log.error("shareObject is null or undefined");
    }
};

Share.ShareService.prototype.cancelShare = function (shareData) {
    /// <summary>
    /// Cancels any pending sharing actions
    /// </summary>
    /// <param name="shareData" type="Share.MailData">Share.MailData object containing mail information</param>
    
    this._helper.cancel(shareData.mailMessage);
};