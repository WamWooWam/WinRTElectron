
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="ShareTarget.dep.js" />

Share.AttachmentWrapper = /* @constructor */function (files, mailManager, mailMessage) {
    ///<summary>
    /// ShareAttachmentWrapper constructor.  Call using new.
    /// This component will not work properly when attempting to activate it multiple times in a session.
    /// ShareAttachmentWrapper wraps the AttachmentWell that is displayed in the file share case.
    ///</summary>
    ///<param name="files" type="Array">Files, loaded from DataPackage</param>
    ///<param name="mailManager" type="Microsoft.WindowsLive.Platform.IMailManager">The mail manager.</param>
    ///<param name="mailMessage" type="Microsoft.WindowsLive.Platform.IMailMessage">The mail message to attach files to.</param>

    // Verify that "this" is an object of the correct type
    if (/* @static_cast(Function) */this.constructor !== Share.AttachmentWrapper) {
        throw new Error("Share.AttachmentWrapper is a constructor; it must be called using new.");
    }

    this.initComponent();
    // There is only one Share.AttachmentWrapper allowed per page.
    this._id = "shareAttachmentWrapper";

    this._files = files;
    this._mailManager = mailManager;
    this._mailMessage = mailMessage;
};

Jx.augment(Share.AttachmentWrapper, Jx.Component);

// Private Variables
Share.AttachmentWrapper.prototype._uiInitialized = false;

Share.AttachmentWrapper.prototype._files = /*@static_cast(Array)*/null;
Share.AttachmentWrapper.prototype._mailManager = /* @static_cast(Microsoft.WindowsLive.Platform.IMailManager) */null;
Share.AttachmentWrapper.prototype._mailMessage = /* @static_cast(Microsoft.WindowsLive.Platform.IMailMessage) */null;
Share.AttachmentWrapper.prototype.fileRetrievalOperation = /* @static_cast(WinJS.Promise)*/ null;
Share.AttachmentWrapper.prototype._awContainingDivID = "awAttachmentWell";

// Public Variables
// The attachmentWell component that will be used to attach files to the mailMessage and create a viewer for the attached files.
Share.AttachmentWrapper.prototype.attachmentWell = /*@static_cast(AttachmentWell.ShareAnythingControl.Frame)*/null;

Share.AttachmentWrapper.prototype.getUI = function (ui) {
    /// <summary>
    /// Constructs the UI object for this component.
    /// </summary>
    /// <param name="ui" type="JxUI">The UI object to set properties on.</param>

    ui.html = '<div id="' + this._id + '" class="share-awContainer">' + 
                '<div id="' + this._awContainingDivID + '">' +
                '</div>' +
              '</div>';

};

Share.AttachmentWrapper.prototype.activateUI = function () {
    /// <summary>
    /// Logic after UI has been initialized.
    /// </summary>

    Jx.Component.prototype.activateUI.call(this);
    if (!this._uiInitialized) {

        this._containerElement = document.getElementById(this._id);

        this._uiInitialized = true;
        this._addAttachments(this._files);
    }
};

Share.AttachmentWrapper.prototype.deactivateUI = function () {
    /// <summary>
    /// Logic to detach component from UI interaction.
    /// </summary>

    if (this._uiInitialized) {
        Jx.Component.prototype.deactivateUI.call(this);
        this._uiInitialized = false;
    }

};

Share.AttachmentWrapper.prototype.isReady = function () {
    /// <summary>
    /// Indicates whether attachments are ready to be validated
    /// </summary>
    /// <returns type="Boolean">true if attachments are ready to be validated, false otherwise.</returns>

    // We should always have an attachment well unless the control isn't activated yet... checking just in case.
    return Boolean(this.attachmentWell) && !this.attachmentWell.isAttaching();
};

Share.AttachmentWrapper.prototype._addAttachments = function (files) {
    /// <summary>
    /// Mehtod used to add attachments to the mailMessage and attachment well.
    /// </summary>
    /// <param name="files" type="Array">Values returned from data package after getting shared files.</param>

    // Create the attachment well
    this.attachmentWell = new AttachmentWell.ShareAnything.Module(this._mailManager, this._mailMessage);
    this.append(this.attachmentWell);
    this.attachmentWell.initUI(document.getElementById(this._awContainingDivID));

    if (Jx.isObject(files)) {
        this.attachmentWell.add(files);
    }
};
