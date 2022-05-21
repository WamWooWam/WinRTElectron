
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// This file is currently not in use, it is kept around as a reference.  It can be deleted as soon as it is no longer useful.

/// <reference path="ShareAnything.ref.js" />
/// <reference path="ShareAnything.dep.js" />
/// <reference path="%_NTTREE%\drop\published\ModernPhotomail\jsref\Microsoft.WindowsLive.Photomail.js" />

Share.ShareService = /* @constructor */function () {
    /// <summary>
    /// ShareService Class is responsible for the building the message for the Share Anything request of all Share types.
    /// </summary>

    this._transcoder = Microsoft.WindowsLive.Photomail.PhotomailTranscoder;
    this._helper = /*@static_cast(Share.RequestHelper)*/null;
};

Share.ShareService.prototype._album = "";
Share.ShareService.prototype._resourceId = ""; // The resource id for file type shares
Share.ShareService.prototype._shareObject = /* @static_cast(Share.Data) */null; // ShareData saved for the file share case

Share.ShareService.prototype.initiateShare = function (shareObject) {
    /// <summary>
    /// Initiates the Share Activity. 
    /// </summary>
    /// <param name="shareObject" type="Share.Data">The ShareObject containing the networks, type, and data on the shared object.</param>

    // Null check for the shareObject
    if (Jx.isObject(shareObject)) {
 
        var helper = this._helper = new Share.RequestHelper(shareObject.config, shareObject.shareOperation, shareObject.quickLink);
        
        // Begin Send mail if we have a mailMessage.
        if (Jx.isNonEmptyString(shareObject.mailMessage.to)) {
            helper.sendMessageToOutbox(shareObject.mailMessage, shareObject.platform);
        } else {
            // No mail share is expected so set sent to true.
            helper.mailSent = true;
        }

        // If we have any non-muted networks send a network share
        if (Jx.isArray(shareObject.networks) && shareObject.networks.length > 0) {
            if ((shareObject.networkShareType !== Share.Data.NetworkType.document) && (shareObject.networkShareType !== Share.Data.NetworkType.video) && (shareObject.networkShareType !== Share.Data.NetworkType.photo)) {
                helper.saStatusUpdate(this._constructStatusMessage(shareObject));
            }
            // TODO WinLive 322142 Enable this when hooking up file sharing in the people app 
            // else {
            //    this._shareObject = shareObject;
            // TODO WinLive 322142 Create ShareFileData object in M4
            //    this.beginFileShare(shareObject.file, shareObject.networkShareType);
           // }
        } else {
            // No network share is expected so set sent to true.
            helper.networkShareSent = true;
        }
    } else {
        Jx.log.error("shareObject is null or undefined");
    }
};

Share.ShareService.prototype.cancelShare = function (shareData) {
    /// <summary>
    /// Cancels any pending sharing actions
    /// </summary>
    /// <param name="shareData" type="Share.Data">Share.Data object containing mail information</param>
    
    this._helper.cancel(shareData.mailMessage);
};

Share.ShareService.prototype._constructStatusMessage = function (shareObject) {
    /// <summary>
    /// Constructs the status message for a share.
    /// </summary>
    /// <param name="shareObject" type="Share.Data">The ShareObject containing the networks, type, and data on the shared object.</param>
    /// <returns type="String">Returns the messageBody for the Share Anything REST call</returns>

    var messageStart = '<?xml version="1.0" encoding="utf-8"?> <entry xmlns="http://www.w3.org/2005/Atom" xmlns:live="http://api.live.com/schemas" xmlns:ab="http://www.msn.com/webservices/AddressBook" xmlns:georss="http://www.georss.org/georss"> ';
    var messageContent = '';
    var messageClose = '';

    // This code handles html in the user's message rendering tags as strings.
    if (Jx.isNonEmptyString(shareObject.messageHtml)) {

        // Log that the user's message is too long for a status update, but allow the publish to occur.
        if (shareObject.messageHtml.length > 520) {
            Jx.log.error("Text length exceeds limit");
        }

        // This isn't ideal - we shouldn't be putting HTML in the title. We're living with this for now.
        messageContent = '<title>' + Jx.escapeHtml(shareObject.messageHtml) + '</title> ';
    }

    // This code adds the rest of the request based on shareObject type.
    switch (shareObject.networkShareType) {
        case Share.Data.NetworkType.link:
            messageContent = this._createLinkMessage(shareObject.linkData, messageContent);
            break;
        case Share.Data.NetworkType.videoEmbed:
            messageContent = this._createVideoEmbedMessage(shareObject.linkData, messageContent);
            break;
        case Share.Data.NetworkType.photo:
            messageContent += "<live:photo> <live:resourceId>" + this._resourceId + "</live:resourceId> </live:photo>";
            break;
        case Share.Data.NetworkType.video:
            // FALLTHROUGH 
        case Share.Data.NetworkType.document:
            messageContent += "<live:document> <live:resourceId>" + this._resourceId + "</live:resourceId> </live:document>";
            break;
        default:
            // In the case of an unsupported share type the share would go through as a text share, with a logged error message.
            Jx.log.error("Unsupported Share Object Type: " + shareObject.networkShareType.toString());
            break;

    }

    // Get non-muted networks.
    messageClose += '<live:networks>';

    for (var iCount = 0; iCount < shareObject.networks.length; iCount++) {
        if (Jx.isObject(shareObject.networks[iCount]) && Jx.isNonEmptyString(shareObject.networks[iCount].id)) {
            messageClose += '<live:sourceId>' + shareObject.networks[iCount].id + '</live:sourceId>';
        }
    }

    messageClose += '</live:networks></entry>';

    return (messageStart + messageContent + messageClose);
};

Share.ShareService.prototype._createLinkMessage = function (shareObject, messageContent) {
    /// <summary>
    /// Constructs the link specific fields for a share message.
    /// </summary>
    /// <param name="shareObject" type="Share.LinkData">The ShareObject containing the networks, type, and data on the shared object.</param>
    /// <param name="messageContent" type="String">The current message to add the link fields to.</param>
    /// <returns type="String">Returns the messageBody with the addition of the link specific fields for the Share Anything REST call.</returns>

    var htmlEncode = Jx.escapeHtml;

    // Check if the Url property exists
    if (Jx.isNonEmptyString(shareObject.url)) {
        messageContent += '<link rel="related" href="' + htmlEncode(shareObject.url) + '" /> <live:page> ';
    } else {
        Jx.log.error("Url is undefined or null");
    }

    // Add optional description.
    if (Jx.isNonEmptyString(shareObject.description)) {
        messageContent +=  '<content>' + htmlEncode(shareObject.description) + '</content> ';
    }

    // Add optional thumbnail.
    if (Jx.isNonEmptyString(shareObject.thumbnailUrl)) {
        messageContent += '<link rel="http://api.live.com/schemas#thumbnail" href="' + htmlEncode(shareObject.thumbnailUrl) + '" /> ';
    }
    // Add optional title.
    if (Jx.isNonEmptyString(shareObject.title)) {
        messageContent += '<title>' + htmlEncode(shareObject.title) + '</title> ';
    }

    messageContent +=   '</live:page> ';

    return messageContent;
};

Share.ShareService.prototype._createVideoEmbedMessage = function (shareObject, messageContent) {
    /// <summary>
    /// Constructs the videoEmbed specific fields for a share message.
    /// </summary>
    /// <param name="shareObject" type="Share.LinkData">The ShareObject containing the networks, type, and data on the shared object.</param>
    /// <param name="messageContent" type="String">The current message to add the video embed fields to.</param>
    /// <returns type="String">Returns the messageBody with the addition of the video embed specific fields for the Share Anything REST call.</returns>

    var htmlEncode = Jx.escapeHtml;

    // Check if Url exists.
    if (Jx.isNonEmptyString(shareObject.url)) {
        messageContent += '<link rel="related" href="' + htmlEncode(shareObject.url) + '" /> <live:videoEmbed> ';
    } else {
        Jx.log.error("Url is undefined or null");
    }

    // Add optional thumbnail.
    if (Jx.isNonEmptyString(shareObject.thumbnailUrl)) {
        messageContent += '<link rel="http://api.live.com/schemas#thumbnail" href="' + htmlEncode(shareObject.thumbnailUrl) + '" /> ';
    }

    // Add optional description.
    if (Jx.isNonEmptyString(shareObject.description)) {
        messageContent +=  '<summary>' + htmlEncode(shareObject.description) + '</summary> ';
    }

    // Add optional title.
    if (Jx.isNonEmptyString(shareObject.title)) {
        messageContent += '<title>' + htmlEncode(shareObject.title) + '</title> ';
    }

    // Add the embed parameters
    messageContent += '<live:embedParams>src=';
    var liveEmbedParameters = encodeURIComponent(shareObject.videoUrl);
    
    if (Jx.isNonEmptyString(shareObject.videoWidth) && Jx.isNonEmptyString(shareObject.videoHeight)) {
        liveEmbedParameters += '&width=' + encodeURIComponent(shareObject.videoWidth) + '&height=' + encodeURIComponent(shareObject.videoHeight);
    }

    if (Jx.isNonEmptyString(shareObject.flashParams)) {
        liveEmbedParameters += '&flashParams=' + encodeURIComponent(shareObject.flashParams);
    }

    // Url Encode the Video Url
    liveEmbedParameters = htmlEncode(liveEmbedParameters);
    messageContent += liveEmbedParameters;

    messageContent +=  '</live:embedParams> <live:embedType>' + shareObject.embedType + '</live:embedType> </live:videoEmbed> ';

    return messageContent;
};

Share.ShareService.prototype._continueFileShare = function ( /*@dynamic*/uploadResponse) {
    /// <summary>
    /// Callback to Continue the status message construction after finishing transcode/resize and upload calls.
    /// </summary>
    /// <param name="uploadResponse">The response from the upload call, contains the resourceId</param>

    Jx.log.info("Received response from skydrive.");

    // Use the response to finish the status message
    this._resourceId = uploadResponse.resourceId;

    // TODO WinLive 322142 Enable this when hooking up file sharing in the people app
    // helper.saStatusUpdate(this._constructStatusMessage(shareObject));

};

Share.ShareService.prototype.beginFileShare = function (file, shareType) {
    /// <summary>
    /// Begins the first leg of the file sharing. If file is a video transcode it, if a photo then call resize, else call upload.
    /// </summary>
    /// <param name="file" type="Windows.Storage.StorageFile">The file to handle</param>
    /// <param name="shareType" type="String">Share.Data.NetworkType enum value indicating what type of file we are dealing with.</param>

    var tempFolder = Windows.Storage.ApplicationData.current.temporaryFolder;
    var transcodeOptions = {
        resizeOption: Microsoft.WindowsLive.Photomail.ImageResizeOption.large,
        targetSize: 0,
        stripMetadata: false,
        copyOnFail: true
    };

    // TODO WinLive 322142 go over error scenarios here:
    // Remember that errors in _transcodeComplete or _resizeError (or functions they call) will not reach the global error handler

    if (shareType === Share.Data.NetworkType.photo) {
        // Resize then upload
        this._album = "quickphotos"; // The special skydrive album to upload to
        Jx.log.info("Began transcoding the file");
        this._transcoder.transcodeFileAsync(transcodeOptions, file, tempFolder).then(this._transcodeComplete.bind(this), this._resizeError.bind(this));

    } else if (shareType === Share.Data.NetworkType.video) {
        // Transcode then upload
        this._album = "quickdocuments";  // The special skydrive album to upload to
        Jx.log.info("Began transcoding the file");
        this._transcoder.transcodeFileAsync(transcodeOptions, file, tempFolder).then(this._transcodeComplete.bind(this), this._transcodeError.bind(this));
    } else {
        Jx.log.info("Non-photo Non-video upload started.");
        this._helper.uploadFile( file, "quickdocuments"/*the special skydrive album to upload to*/, this._continueFileShare.bind(this));
    }
};

Share.ShareService.prototype._transcodeComplete = function (file) {
    /// <summary>
    /// Callback for transcode\resize functions. Begins upload.
    /// </summary>
    /// <param name="file" type="Windows.Storage.StorageFile">The file to handle</param>

    Jx.log.info("Transcode\Resize completed starting upload.");
    this._helper.uploadFile(file, this._album, this._continueFileShare.bind(this));

};

Share.ShareService.prototype._resizeError = function (error) {
    /// <summary>
    /// Error callback for resize functions..
    /// </summary>
    /// <param name="error" type="String">The error</param>

    Jx.log.error("Resize error has occured: " + error);

    // TODO M4 work item: Surface error to user
};

Share.ShareService.prototype._transcodeError = function (error) {
    /// <summary>
    /// Error callback for transcode functions..
    /// </summary>
    /// <param name="error" type="String">The error</param>

    Jx.log.error("Transcode error has occured: " + error);

    // TODO M4 work item: Surface error to user
};