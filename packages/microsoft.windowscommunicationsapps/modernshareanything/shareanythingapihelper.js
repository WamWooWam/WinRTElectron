
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Note: This file is not currently in use, but has been kept around for reference.  It can be deleted once it is no longer useful.

/// <reference path="ShareRootBase.js" />
/// <reference path="ext/Auth.js" />

Share.ShareAnythingApiHelper = /* @constructor */function () {
    /// <summary>
    /// RequestHelper class used to make calls to services 
    /// </summary>
};

Share.RequestHelper.prototype.saStatusUpdate = function (messageBody) {
    /// <summary>
    /// Requests the auth token, the resulting callback continues the Status Update Request.
    /// </summary>
    /// <param name="messageBody" type="String">The request body</param>

    // Grab a temporary INT token using Auth.js.
    var target = ["skydrive.live-int.com"];

    // Context allows us to pass data to _continueStatusRequest.
    var context = {
        messageBody: messageBody,
        callBack: this._endTransfer.bind(this),
        errorCallBack: null
    };

    // Temporary authorization method calls.
    var authorization = new Share.AuthRequest(context, this._continueStatusRequest.bind(this));
    authorization.getTokens(target, "Rubedo@live-int.com", "Integral");
};

Share.RequestHelper.prototype._continueStatusRequest = function (/* @dynamic*/context, tokens){
    /// <summary>
    /// Makes the xhr call to Share Anything RequestHelper.
    /// </summary>
    /// <param name="context">Context object contains messageBody (String, request body), and callbacks.</param>
    /// <param name="tokens" type="Array">The array of tokens returned by the Auth request.</param>

    // Stop if the call has been canceled.  The callback does not need to be called for this case.
    if (this.networkShareSent) {
        return;
    }

    var callBack = /* @static_cast(Function)*/context.callBack;
    var errorCallBack = /* @static_cast(Function)*/context.errorCallBack;
    var messageBody = /* @static_cast(String)*/context.messageBody;

    var request = this._request = new XMLHttpRequest();

    // TODO: WinLive 379842 - Temp var this will be removed later.
    var cid = "8327725923447988047";

    // Configuration system takes care of environment-specific URLs and AppId
    var url = 'http://' + this._config.shareAnythingApiHost + '/users(' + cid + ')/status';
    request.open("POST", url, true, null, null);
    request.setRequestHeader("AppId", this._config.shareAnythingApiAppId);
    request.setRequestHeader("Host", this._config.shareAnythingApiHost);
         
    if (Jx.isNonEmptyString(tokens[0].ticket)) {
        request.setRequestHeader("Authorization:", ("WLID1.0 t=" + tokens[0].ticket));
    } else {
        Jx.log.error("Returned token was null or undefined.");
        return;
    }

    request.setRequestHeader("Content-Type", "application/atom+xml");
    request.setRequestHeader("Expect", "100-continue");

    request.onreadystatechange = function () {
        // Ready state when set to 4 means that all data is available. The status of 201 indicates a successful request.
        if (request.readyState === 4 && request.status !== 201) {
            Jx.log.error(" Status Error " + request.status.toString() + "  " + request.responseText);
        }
        if (request.readyState === 4) {
            
            // If in WWA call done transfer.
            // First param is true since we have completed the network share.
            callBack(true, false);
        }
    };

    if (Jx.isNonEmptyString(messageBody)) {
       request.send(messageBody);
    } else {
        Jx.log.error("Share.RequestHelper: Share message is undefined.");
    }

};

Share.RequestHelper.prototype._errorCallBack = function () {
    /// <summary>
    /// A temporary error callback for the use with Auth.js.
    /// </summary>

    Jx.log.error("An error occured in Auth.js.");
};

Share.RequestHelper.prototype.uploadFile = function (file, album, callBack) {
    /// <summary>
    /// Uploads the file to onedrive.
    /// </summary>
    /// <param name="file" type="Windows.Storage.StorageFile">The file to upload.</param>
    /// <param name="album" type="String">The Album to send to.</param>
    /// <param name="callBack" type="Function">The function to return to after completing upload.</param>

    // Note: there's a bug in this code somewhere where we don't set the filename correctly for OneDrive

    /// <disable>JS3092.DeclarePropertiesBeforeUse</disable> WinLive 468310 JSCop is not aware of CAL
    var callManager = Microsoft.WindowsLive.ClientAccessLibrary.LibraryManager.getLibraryManager();
    var uploadWorker = callManager.getUploadWorker("WL");

    try {
        // TODO WinLive 322142 remove the timout workaround when finalizing file sharing
        // This is temporarily being done to give the upload worker time to get the user credentials.
        var upload = function () { uploadWorker.uploadItemAsync({ albumId: album, filename: file.fileName, autoResolveNameConflicts: true }, file).then(callBack.bind(this), this._uploadFileFailureHandler.bind(this)); };
        setTimeout(upload.bind(this), 10000);
    } catch (e) {
        Jx.log.exception("uploadItemAsync exception", e);
    }
    /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
};

Share.RequestHelper.prototype._uploadFileFailureHandler = function (error) {
    /// <summary>
    /// The error callback for the file upload case.
    /// </summary>
    /// <param name="error" type="String">The upload error.</param>

    // response handling occurs here:
    Jx.log.error("Upload failed: " + error);
    
    // TODO M4 work item: Surface error to user
};



Share.RequestHelper.prototype._shareOperation = /* @static_cast(Windows.ApplicationModel.DataTransfer.ShareTarget.ShareOperation) */null;
Share.RequestHelper.prototype.networkShareSent = false; // Have we succesfully sent the expected network share
Share.RequestHelper.prototype._request = /*@static_cast(XMLHttpRequest)*/null;
Share.RequestHelper.prototype._quickLink = /*@static_cast(Windows.ApplicationModel.DataTransfer.ShareTarget.QuickLink)*/null; 
