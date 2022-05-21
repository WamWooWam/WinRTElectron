
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="ShareTarget.dep.js" />

Share.RetailShareService = /* @constructor */function () {
    /// <summary>
    /// ShareService Class is responsible for the building the message for the Share Anything request of all Share types.
    /// </summary>
};

Share.RetailShareService.prototype.initiateShare = function (shareObject) {
    /// <summary>
    /// Invokes the "share" action
    /// In Retail mode, this immediately closes the window without sending.
    /// </summary>
    /// <param name="shareObject" type="Share.MailData">Internal object containing share data</param>

    // Delete any draft message
    if (shareObject.mailMessage.canDelete) {
        shareObject.mailMessage.deleteObject();
    }

    // Notify the share platform that we've successfully finished (with no quicklinks)
    shareObject.shareOperation.reportCompleted();
};

Share.RetailShareService.prototype.cancelShare = function (shareData) {
    /// <summary>
    /// Cancels any pending sharing actions
    /// </summary>
    /// <param name="shareData" type="Share.MailData">Share.MailData object containing mail information</param>
    
    // In retail mode, this does nothing and should never be called.
};