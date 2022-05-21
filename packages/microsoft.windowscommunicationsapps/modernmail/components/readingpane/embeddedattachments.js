
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true */
/*global Mail,Jx,Debug,Microsoft,AttachmentWell */

Jx.delayDefine(Mail, "EmbeddedAttachments", function () {
    "use strict";

    var Platform = Microsoft.WindowsLive.Platform,
        AttachmentSyncStatus = Platform.AttachmentSyncStatus;
    
    var EmbeddedAttachments = Mail.EmbeddedAttachments = function (message, isTruncated, element, downloadStatus) {
        Debug.assert(Jx.isInstanceOf(message, Mail.UIDataModel.MailMessage));
        Debug.assert(Jx.isBoolean(isTruncated));
        Debug.assert(Jx.isHTMLElement(element));
        Debug.assert(Jx.isNullOrUndefined(downloadStatus) || Jx.isInstanceOf(downloadStatus, Mail.ImageDownloadStatus));
        Mail.writeProfilerMark("EmbeddedAttachments.constructor", Mail.LogEvent.start);

        this._message = message;
        this._isTruncated = isTruncated;
        this._element = element;

        this._fixed = [];
        this._attachmentsWithListeners = [];

        this._embeddedButNotForDirectUse = null; // Don't use this directly.  Call this._getEmbedded instead.
        this._imgsButNotForDirectUse = null; // Don't use this directly.  Call this._getImages instead.

        this._onAttachmentChanged = this._onAttachmentChanged.bind(this);

        this._fixLocal();
        this._downloadStatus = downloadStatus;
        if (downloadStatus) {
            downloadStatus.newMessageSelected();
        }
        Mail.writeProfilerMark("EmbeddedAttachments.constructor", Mail.LogEvent.stop);
    };

    var prototype = EmbeddedAttachments.prototype;

    prototype.dispose = function () {
        Mail.writeProfilerMark("EmbeddedAttachments.dispose", Mail.LogEvent.start);

        this._attachmentsWithListeners.forEach(function (attachment) {
            Debug.assert(Jx.isInstanceOf(attachment, Platform.MailAttachment));
            attachment.removeEventListener("changed", this._onAttachmentChanged);
        }, this);

        if (this._downloadStatus) {
            this._downloadStatus.clear();
            this._downloadStatus = null;
        }
        Mail.writeProfilerMark("EmbeddedAttachments.dispose", Mail.LogEvent.stop);
    };

    Object.defineProperty(prototype, "embeddedCount", {
        get: function () { return this._getEmbedded().length; }
    });

    prototype._getEmbedded = function () {
        if (!this._embeddedButNotForDirectUse) {
            Mail.writeProfilerMark("EmbeddedAttachments._getEmbedded", Mail.LogEvent.start);
            var collection = this._message.getEmbeddedAttachmentCollection();
            this._embeddedButNotForDirectUse = [];
            for (var ii = 0, iiMax = collection.count; ii < iiMax; ii++) {
                this._embeddedButNotForDirectUse.push(collection.item(ii));
            }
            collection.dispose();
            Mail.writeProfilerMark("EmbeddedAttachments._getEmbedded", Mail.LogEvent.stop);
        }
        return this._embeddedButNotForDirectUse;
    };

    prototype._getImages = function () {
        if (!this._imgsButNotForDirectUse) {
            this._imgsButNotForDirectUse = this._element.querySelectorAll("img[src]");
        }
        return this._imgsButNotForDirectUse;
    };

    prototype._commitMessage = function () {
        this._message.commit();
        this._embeddedButNotForDirectUse = null;
    };

    prototype._fixLocal = function () {
        var embedded = this._getEmbedded();
        if (embedded.length === 0) {
            return;
        }

        embedded.forEach(function (attachment) {
            Debug.assert(Jx.isInstanceOf(attachment, Platform.MailAttachment));
            if (attachment.syncStatus === AttachmentSyncStatus.done) {
                this._fix(attachment);
            }
        }, this);
    };

    function attachmentArrayContains(array, attachment) {
        // An attachment might have an objectId of "0" in some cases (e.g. opening a .eml file) but it will have a unique
        // bodyUri in these cases. However, an attachment with a valid objectId may not have started downloading its body yet
        // and will have an empty bodyUri. Therefore, we use objectId in the common case but fallback to bodyUri if necessary.
        Debug.assert(Jx.isArray(array));
        Debug.assert(Jx.isInstanceOf(attachment, Platform.MailAttachment));
        Debug.assert(attachment.objectId !== "0" || Jx.isNonEmptyString(attachment.bodyUri));
        var uniqueProperty = attachment.objectId !== "0" ? "objectId" : "bodyUri";
        for (var ii = 0, iiMax = array.length; ii < iiMax; ii++) {
            Debug.assert(Jx.isInstanceOf(array[ii], Platform.MailAttachment));
            Debug.assert(array[ii].objectId !== "0" || Jx.isNonEmptyString(array[ii].bodyUri));
            if (array[ii][uniqueProperty] === attachment[uniqueProperty]) {
                return true;
            }
        }
        return false;
    }

    function attachmentIsImage(attachment) {
        Debug.assert(Jx.isInstanceOf(attachment, Platform.MailAttachment));

        var contentType = attachment.contentType;
        if (!contentType || contentType === "application/octet-stream") {
            // "application/octet-stream" is a vague, default content-type, so we double-check the file extension, if available
            var fileExtension = AttachmentWell.Utils.getFileExtension(attachment);
            var isImage = (fileExtension === "") || AttachmentWell.Utils.isSupportedPhotoFormat(fileExtension);
            if (!isImage) {
                // some images produced by mail generation tools have non-standard extensions, see WinBlue 420438
                var nsExt = [
                    ".ext",
                    ".bin"
                ];
                isImage = (nsExt.indexOf(fileExtension.toLowerCase()) >= 0);
            }

            return isImage;
        }

        return contentType.indexOf("image/") === 0;
    }

    prototype._fix = function (attachment) {
        Debug.assert(Jx.isInstanceOf(attachment, Platform.MailAttachment));
        Mail.writeProfilerMark("EmbeddedAttachments._fix", Mail.LogEvent.start);

        /// If the uiType has already been fixed by the platform, there is no need to try to fix it here.
        /// This can happen if the attachment was embedded before "download all attachments" was started, and
        /// no longer an embedded attachment after.
        if (attachment.uiType !== Platform.AttachmentUIType.embedded) {
            Mail.writeProfilerMark("EmbeddedAttachments._fix", Mail.LogEvent.stop);
            return;
        }

        var embedded = this._getEmbedded();
        Debug.assert(attachmentArrayContains(embedded, attachment));
        Debug.assert(!attachmentArrayContains(this._attachmentsWithListeners, attachment), "EmbeddedAttachments._fix: we shouldn't still be listening for changes");
        Debug.assert(attachment.syncStatus === AttachmentSyncStatus.done);

        if (attachmentArrayContains(this._fixed, attachment)) {
            Mail.writeProfilerMark("EmbeddedAttachments._fix", Mail.LogEvent.stop);
            return;
        }

        var contentId = attachment.contentId,
            foundUsage = false,
            // WinBlue:252845 - Some versions of Exchange create <img> tags that point to non-images (e.g. *.txt files).
            isImage = attachmentIsImage(attachment);
        if (isImage && Jx.isNonEmptyString(contentId)) {
            var cid = "cid:" + contentId.toLowerCase().trim().replace(/^</, "").replace(/>$/, "");
            Array.prototype.forEach.call(this._getImages(), function (element) {
                Debug.assert(Jx.isHTMLElement(element));
                Debug.assert(Jx.isString(element.src));
                if (element.src.toLowerCase() === cid) {
                    foundUsage = true;
                    var uri = attachment.bodyUri;
                    Debug.assert(Jx.isNonEmptyString(uri));
                    if (Jx.isNonEmptyString(uri)) {
                        element.src = uri;
                    }
                }
            }, this);
        }

        if ((!foundUsage || !isImage) && !this._isTruncated && !this._message.isDraft) {
            // If we didn't actually find the embedded attachment used anywhere or if its not an image, then we should
            // change it to be an ordinary attachment so that it shows up in the attachment well.
            Mail.writeProfilerMark("EmbeddedAttachments.updateEmbeddedAttachment - changing type to ordinary", Mail.LogEvent.start);
            attachment.uiType = Platform.AttachmentUIType.ordinary;
            this._commitMessage();
            Mail.writeProfilerMark("EmbeddedAttachments.updateEmbeddedAttachment - changing type to ordinary", Mail.LogEvent.stop);
        } else {
            this._fixed.push(attachment);
        }
        Mail.writeProfilerMark("EmbeddedAttachments._fix", Mail.LogEvent.stop);
    };

    prototype.downloadAll = function () {
        Mail.writeProfilerMark("EmbeddedAttachments.downloadAll", Mail.LogEvent.start);
        this._fixOrdinary();

        var embedded = this._getEmbedded();

        embedded.forEach(function (attachment) {
            Debug.assert(Jx.isInstanceOf(attachment, Platform.MailAttachment));
            Debug.assert(!attachmentArrayContains(this._attachmentsWithListeners, attachment), "EmbeddedAttachments.downloadAll: make sure it isn't already in the array");

            if (attachment.syncStatus === AttachmentSyncStatus.done) {
                this._fix(attachment);
            } else {
                Debug.assert([AttachmentSyncStatus.notStarted, AttachmentSyncStatus.inProgress, AttachmentSyncStatus.failed].indexOf(attachment.syncStatus) !== -1, 
                            "EmbeddedAttachments.downloadAll: unknown attachment sync status");
                this._attachmentsWithListeners.push(attachment);
                attachment.addEventListener("changed", this._onAttachmentChanged);

                try {
                    attachment.downloadBody();
                } catch (e) {
                    // The message could have already been deleted from the store
                    Jx.log.exception("Cannot download body", e);
                    attachment.removeEventListener("changed", this._onAttachmentChanged);
                    this._attachmentsWithListeners.pop();
                }
            }
        }, this);

        if (this._attachmentsWithListeners.length === 0 && this._downloadStatus) {
            this._downloadStatus.downloadComplete();
        }
        Mail.writeProfilerMark("EmbeddedAttachments.downloadAll", Mail.LogEvent.stop);
    };

    prototype._onAttachmentChanged = function (evt) {
        Mail.writeProfilerMark("EmbeddedAttachments._onAttachmentChanged", Mail.LogEvent.start);
        Debug.assert(Jx.isObject(evt));
        Debug.assert(Jx.isInstanceOf(evt.target, Platform.MailAttachment));

        var attachment = evt.target;

        if (attachment.syncStatus === AttachmentSyncStatus.done) {
            var index = this._attachmentsWithListeners.indexOf(attachment);
            Debug.assert(index !== -1);
            this._attachmentsWithListeners.splice(index, 1);
            Debug.assert(!attachmentArrayContains(this._attachmentsWithListeners, attachment), "EmbeddedAttachments._onAttachmentChanged: make sure it was only in the array once");
            attachment.removeEventListener("changed", this._onAttachmentChanged);
            this._fix(attachment);
            if (this._attachmentsWithListeners.length === 0 && this._downloadStatus) {
                this._downloadStatus.downloadComplete();
            }
        } else if (attachment.syncStatus === AttachmentSyncStatus.failed && this._downloadStatus) {
            this._downloadStatus.downloadError();
        } 

        Mail.writeProfilerMark("EmbeddedAttachments._onAttachmentChanged", Mail.LogEvent.stop);
    };

    prototype._fixOrdinary = function () {
        Mail.writeProfilerMark("EmbeddedAttachments._fixOrdinary", Mail.LogEvent.start);
        if (this._message.hasOrdinaryAttachments) {
            var imgCollection = this._getImages(),
                attachments = this._message.getOrdinaryAttachmentCollection(),
                changedAny = false;
            if (!Jx.isNullOrUndefined(attachments)) {
                for (var ii = 0, iiMax = attachments.count; ii < iiMax; ii++) {
                    var attachment = attachments.item(ii);
                    Debug.assert(Jx.isInstanceOf(attachment, Platform.MailAttachment));
                    var newContentId = this._isOrdinaryAttachmentUsedInline(attachment, imgCollection);
                    if (newContentId) {
                        Mail.writeProfilerMark("EmbeddedAttachments._fixOrdinary - changing type to embedded");
                        attachment.uiType = Platform.AttachmentUIType.embedded;
                        attachment.contentId = newContentId;
                        changedAny = true;
                    }
                }
                attachments.dispose();
            }
            if (changedAny) {
                this._commitMessage();
            }
        }
        Mail.writeProfilerMark("EmbeddedAttachments._fixOrdinary", Mail.LogEvent.stop);
    };

    prototype._isOrdinaryAttachmentUsedInline = function (attachment, imgCollection) {
        Debug.assert(Jx.isInstanceOf(attachment, Platform.MailAttachment));
        Debug.assert(attachment.uiType === Platform.AttachmentUIType.ordinary);
        var fileName = attachment.fileName;
        if (Jx.isNonEmptyString(fileName) && this._checkForCID(fileName, imgCollection)) {
            return fileName;
        }
        var cid = attachment.contentId;
        if (Jx.isNonEmptyString(cid) && this._checkForCID(cid, imgCollection)) {
            return cid;
        }
        return null;
    };


    prototype._checkForCID = function (cid, imgCollection) {
        Debug.assert(Jx.isNonEmptyString(cid));
        var cidSrc = "cid:" + cid.toLowerCase().trim().replace(/^</, "").replace(/>$/, "");
        return Array.prototype.some.call(imgCollection, function (element) {
            Debug.assert(Jx.isHTMLElement(element));
            return (element.src.toLowerCase() === cidSrc);
        }, this);
    };

});
