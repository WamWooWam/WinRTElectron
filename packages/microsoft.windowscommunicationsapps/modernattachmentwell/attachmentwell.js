
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Jx,window,$include*/

Jx.delayDefine(window, "AttachmentWell", function () {
    window.AttachmentWell = {
        AttachmentManager: {},
        Base: {},
        Read: {},
        Compose: {},
        DownloadSaveAllControl: {},
        ErrorManager: {},
        FilesAttachedControl: {},
        Templates: {},
        ShareAnythingControl: {},
        ShareAnything: {},
        Utils: {},
        ThumbnailResizer: {}
    };

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global AttachmentWell,Jx,Microsoft,Debug,MockAttachments,window*/
(function () {

    var AttachmentComposeStatus = Microsoft.WindowsLive.Platform.AttachmentComposeStatus,
        BasicAttachmentsMax = {
            count: 1000,
            sizeInBytes: 26214400 /* 25MB */
        };

    AttachmentWell.AttachmentManager = /*@constructor*/function (mailManager, mailMessage) {
        /// <summary>Returns an initialized attachment manager object</summary>
        /// <param name="mailManager" type="Microsoft.WindowsLive.Platform.IMailManager">mail manager</param>
        /// <param name="mailMessage" type="Microsoft.WindowsLive.Platform.IMailMessage">mail message</param>

        // Call the Jx component initialization code.
        this.initComponent();

        Debug.assert(mailManager);
        Debug.assert(mailMessage);
        this._mailManager = mailManager;
        this._mailMessage = mailMessage;
        this._changedListeners = [];

        
        // Running in IE, create mock manager
        if (!Jx.isWWA) {
            this._attachmentManager = /*@static_cast(Microsoft.WindowsLive.Photomail.AttachmentManager)*/MockAttachments.getManager(mailMessage.objectId);
        } else {
            
            // Create and initialize the background worker manager for the passed in message
            this._attachmentManager = /*@static_cast(Microsoft.WindowsLive.Photomail.AttachmentManager)*/Microsoft.WindowsLive.Photomail.AttachmentManager.getManager(mailMessage.objectId);
            
        }
        

        // Create an empty attachment list
        this._attachmentObjects = {};
        this._attachmentSizes = {};
        this._pendingAttachments = {};
        this._failedAttachments = {};

        // Get all the ordinary attachment and register for change notification
        this._attachmentCollection = mailMessage.getOrdinaryAttachmentCollection();
        Debug.assert(this._attachmentCollection, "Expecting at least an empty collection");

        this._attachmentChanged = this._attachmentChanged.bind(this);
        this._attachmentCollectionChanged = this._attachmentCollectionChanged.bind(this);
    };

    Jx.augment(AttachmentWell.AttachmentManager, Jx.Component);

    var proto = AttachmentWell.AttachmentManager.prototype;

    proto.activate = function () {
        /// <summary>Starts listening to and firing notifications.</summary>
        this._attachmentCollection.addEventListener("collectionchanged", this._attachmentCollectionChanged);

        // Add all existing attachments to the collection
        var attachment;
        for (var i = 0, len = this._attachmentCollection.count; i < len; i++) {
            attachment = this._attachmentCollection.item(i);

            // Add a changed handler so when the file is finished attaching, we can fire events
            attachment.addEventListener("changed", this._attachmentChanged);

            var objectId = attachment.objectId;

            // Hold on to this object so it doesn't get garbage collected until we remove the listener
            this._attachmentObjects[objectId] = attachment;

            this._update(objectId);
        }

        // The attachmentwell starts as not dirty by default
        this._isDirty = false;

        // Now unlock to listen for changes
        this._attachmentCollection.unlock();

        this._attachmentQueueEmpty = this._attachmentQueueEmpty.bind(this);
        this._attachmentManager.addEventListener("attachqueueempty", this._attachmentQueueEmpty);
    };

    proto.addFiles = function (files) {
        /// <summary>add a file to the current message</summary>
        /// <param name="files" type="Array">list of files to attach</param>
        Debug.assert(files);
        Debug.assert(this._mailMessage);
        Debug.assert(this._attachmentManager);

        if (this.canAddMore(files.length)) {
            // The array we get may not always marshall to IVectorView<StorageFile*> (for e.g SAC).
            var filesToAttach = [];
            for (var len = files.length, i = 0; i < len; i++) {
                filesToAttach.push(files[i]);
            }

            // If we can add files, then we no longer have 'reached max limit' error, clear it.
            this.fire("clearerror", { errorId: AttachmentWell.ErrorIds.maxFiles });

            // Inform listeners we are about start attaching files.
            Jx.EventManager.fire(null, "attachstarted", {});

            this._attachmentManager.addFiles(filesToAttach);
        } else {
            var maxFilesError = new AttachmentWell.Error(AttachmentWell.ErrorIds.maxFiles, Jx.res.getString("composeMaxFilesErrorMessage"));
            this.fire("error", { error: maxFilesError });
        }
    };
    proto.isAttaching = function (attachmentId) {
        /// <summary>returns true if attaching is in progress. If attachmentId is not passed, then
        /// this checks if any file is being attached.
        ///</summary>
        /// <param name="attachmentId" type="String" optional="true">Attachment Id to check</param>
        /// <returns type="Boolean">Returns true if given attachmentId is attaching.</returns>
        Debug.assert(this._attachmentManager);

        // Pass null if we were not passed in an attachmentId as the native function expects a param
        return this._attachmentManager.isAttaching(attachmentId || "");
    };
    proto.isDirty = function () {
        /// <summary>returns true if the contents of the attachment well have been modified since the dirty
        /// flag was last set to false
        /// </summary>
        /// <returns type="Boolean">Returns true if the attachment well contents have been modified</returns>
        return this._isDirty;
    };
    proto.canAddMore = function (newCount) {
        /// <summary>Checks if specified number of attachments can be added</summary>
        /// <param name="newCount" type="Number">Number of new attachments to be added</param>
        /// <returns type="Boolean">Returns true if specified number of attachments can be added</returns>
        Debug.assert(this._attachmentCollection);

        // Support upto 1000 attachments
        return (this._attachmentCollection.count + newCount <= BasicAttachmentsMax.count);
    };
    proto.canSendMail = function () {
        /// <summary>
        ///    Validates attachments on this message for sending the mail. 
        ///    Returns false if there are any errors in the attached files or attaching is still in progress.
        /// </summary>
        /// <returns type="Boolean">Returns true if the message can be sent, otherwise false.</returns>
        var isAttaching = this.isAttaching("");
        if (isAttaching) {
            if (!this._attachStartTime) {
                this._attachStartTime = (new Date()).getTime();
            }
            // If we are still attaching, then fire the attach in progress error event
            var inProgressError = new AttachmentWell.Error(AttachmentWell.ErrorIds.inProgress, Jx.res.getString("composeInProgressErrorMessage"));
            this.fire("error", { error: inProgressError });

            // Number of times we failed because we were still attaching, for instrumentation purpose
            this._numberOfValidateFailures++;
        }

        // If we are done attaching, then check if there are any failed files.
        var failedAttachmentsCount = Object.keys(this._failedAttachments).length,
            isFailed = failedAttachmentsCount > 0;

        return !isAttaching && !isFailed;
    };
    proto.removeFailedFiles = function () {
        /// <summary>Removes all attachments that have failed to attach.</summary>
        Object.keys(this._failedAttachments).forEach(/*@bind(AttachmentWell.AttachmentManager)*/function (key) {
            // Remove the file
            this.removeFile(key);
        }, this);
    };
    proto.finalizeForSend = function () {
        /// <summary>Finalize for sending the message, including any instrumentation reporting etc.</summary>

        // Let attachment manager finalize
        Debug.assert(this._attachmentManager);
        this._attachmentManager.finalizeForSend();
    };
    proto.removeFile = function (attachmentId) {
        /// <summary>Removes the specified attachment</summary>
        /// <param name="attachmentId" type="String">Attachment Id to remove</param>
        Debug.assert(attachmentId);
        Debug.assert(this._attachmentManager);

        // Now remove the attachment from the message
        this._attachmentManager.removeFile(attachmentId);
    };
    // For mapping the category bitmap value to BiCi bucket value.
    proto.fileCategoryMap = [
        0,  /* 1 - Photos */
        1,  /* 2 - Videos */
        4,  /* 3 - PhotosVideos */
        2,  /* 4 - Doc */
        5,  /* 5 - PhotosVideosPlusDocs */
        5,  /* 6 - PhotosVideosPlusDocs */
        5,  /* 7 - PhotosVideosPlusDocs */
        3,  /* 8 - Other */
        7,  /* 9 - PhotosVideosPlusOther */
        7,  /* 10 - PhotosVideosPlusOther */
        7,  /* 11 - PhotosVideosPlusOther */
        6,  /* 12 - DocsPlusOther */
        7,  /* 13 - PhotosVideosPlusOther */
        7,  /* 14 - PhotosVideosPlusOther */
        7   /* 15 - PhotosVideosPlusOther */
    ];
    proto.getAttachmentMetrics = function () {
        /// <summary>Returns metrics of attachments in the message currently for instrumentation purpose.</summary>
        /// <returns type="Object">Returns total size, category and duration of attaching</returns>
        var category = 0,
            attachmentCount = 0,
            officeDocRegEx = /\.((doc)|(docx)|(xls)|(xlsx)|(ppt)|(pptx))$/i;
        Object.keys(this._attachmentObjects).forEach(/*@bind(AttachmentWell.AttachmentManager)*/function (key) {
            var attachmentObject = /*@static_cast(Microsoft.WindowsLive.Platform.IMailAttachment)*/this._attachmentObjects[key];
            if (Boolean(attachmentObject) && attachmentObject.composeStatus === AttachmentComposeStatus.done) {
                // Identify the category
                // The final category value is a bit wise map of individual one
                var contentType = attachmentObject.contentType;
                if (contentType.indexOf("image") >= 0) {
                    category |= 1;
                } else if (contentType.indexOf("video") >= 0) {
                    category |= 2;
                } else if (attachmentObject.fileName.match(officeDocRegEx)) {
                    // extension matches one of the office doc
                    category |= 4;
                } else {
                    category |= 8;
                }

                attachmentCount++;
            }
        }, this);

        Debug.assert(category < 16);
        return {
            totalSize: Math.round(this._totalAttachmentSize / 1024),
            category: this.fileCategoryMap[category - 1] || 0,
            count: attachmentCount,
            duration: Math.round(this._totalAttachDuration / 1000),  // convert to seconds 
            validateFailures: this._numberOfValidateFailures
        };
    };
    proto.discard = function () {
        /// <summary>Discards attachments</summary>
        // We are not going to actually remove the attachment from the message, 
        // assumption is who ever is calling this (compose) is going to discard the message
        // itself and so the attachments should go with that.
        Debug.assert(this._attachmentManager);
        this._attachmentManager.discard();
    };
    proto.shutdown = function () {
        /// <summary>Clean up routine</summary>
        Debug.assert(this._attachmentManager);

        try {
            this._removeAttachmentListeners();

            this._attachmentManager.stopAll();
            this._attachmentManager.dispose();
            this._attachmentManager = null;
        } catch (ex) {
            Debug.assert("Exception while shutting down AttachmentManager: " + ex);
        }
    };
    proto._removeAttachmentListeners = function () {
        /// <summary>Removes all db object notification listeners</summary>

        this._attachmentManager.removeEventListener("attachqueueempty", this._attachmentQueueEmpty);

        // Remove listeners
        this._attachmentCollection.lock();
        this._attachmentCollection.removeEventListener("collectionchanged", this._attachmentCollectionChanged);
        Object.keys(this._attachmentObjects).forEach(/*@bind(AttachmentWell.AttachmentManager)*/function (key) {
            var attachmentObject = /*@static_cast(Microsoft.WindowsLive.Platform.IMailAttachment)*/this._attachmentObjects[key];
            if (attachmentObject) {
                attachmentObject.removeEventListener("changed", this._attachmentChanged);
            }
        }, this);
        this._attachmentObjects = {};
    };
    proto._attachmentChanged = function (/*@dynamic*/eventArgs) {
        /// <summary>Responds to attachment changed event notifications</summary>
        /// <param name="eventArgs" type="Object">Event arguments</param>

        Debug.assert(eventArgs);
        // One of the attachment item changed
        // If the file is no longer being attached, then attaching is complete
        var objectId = eventArgs.target.objectId,
            changedAttachment = /*@static_cast(Microsoft.WindowsLive.Platform.IMailAttachment)*/this._attachmentObjects[objectId];
        if (changedAttachment) {
            // Inform listeners
            this.fire("attachmentchanged", { id: objectId, dbObject: changedAttachment });

            // Is this attachment completed or failed attaching?
            var composeStatus = changedAttachment.composeStatus;
            if (composeStatus === AttachmentComposeStatus.failed || composeStatus === AttachmentComposeStatus.done) {
                delete this._pendingAttachments[objectId];

                this._checkAndFireQueueEmpty();
            }
        }

        this._update(objectId);
    };
    proto._attachmentCollectionChanged = function (eventArgs) {
        /// <summary>Responds to attachment collection changed event notifications</summary>
        /// <param name="eventArgs" type="Microsoft.WindowsLive.Platform.CollectionChangedEventArgs">Event arguments</param>
        Debug.assert(eventArgs);
        // A new attachment being added?
        var objectId = eventArgs.objectId;
        if (eventArgs.eType === /*@static_cast(Microsoft.WindowsLive.Platform.CollectionChangeType)*/Microsoft.WindowsLive.Platform.CollectionChangeType.itemAdded) {
            this._isDirty = true;
            var changedAttachment = /*@static_cast(Microsoft.WindowsLive.Platform.IMailAttachment)*/this._attachmentCollection.item(eventArgs.index);

            // If we haven't started the timer, then start it as we just added a new file
            // and so we are attaching.
            if (!this._attachStartTime) {
                this._attachStartTime = (new Date()).getTime();
            }

            // Add a changed handler so when the file is finished attaching, we can fire events
            changedAttachment.addEventListener("changed", this._attachmentChanged);
            // Hold on to this object so it doesn't get garbage collected until we remove the listener
            this._attachmentObjects[objectId] = changedAttachment;

            // Is this new attachment already in completed or failed state?
            var composeStatus = changedAttachment.composeStatus;
            if (composeStatus !== AttachmentComposeStatus.failed && composeStatus !== AttachmentComposeStatus.done) {
                this._pendingAttachments[objectId] = true;
            }

            // Inform listeners
            this.fire("attachmentadded", { id: objectId, dbObject: changedAttachment });
        } else if (eventArgs.eType === /*@static_cast(Microsoft.WindowsLive.Platform.CollectionChangeType)*/Microsoft.WindowsLive.Platform.CollectionChangeType.itemRemoved) {
            // An attachment is being removed
            this._isDirty = true;
            delete this._pendingAttachments[objectId];

            var removedAttachment = /*@static_cast(Microsoft.WindowsLive.Platform.IMailAttachment)*/this._attachmentObjects[objectId];
            if (removedAttachment) {
                // Remove the listener and from our cache
                removedAttachment.removeEventListener("changed", this._attachmentChanged);
                delete this._attachmentObjects[objectId];
                // Inform listeners
                this.fire("attachmentremoved", { id: objectId, dbObject: null });
            }

            this._checkAndFireQueueEmpty();
        }

        this._update(objectId);

        // Do we need to handle Microsoft.WindowsLive.Platform.CollectionChangeType.reset?
        Debug.assert(eventArgs.eType !== /*@static_cast(Microsoft.WindowsLive.Platform.CollectionChangeType)*/Microsoft.WindowsLive.Platform.CollectionChangeType.reset);
    };
    proto._update = function (objectId) {
        /// <summary>Updates the internal state relating to the given attachment.</summary>
        /// <param name="objectId" type="String">The unique id of the attachment.</param>
        var attachment = this._attachmentObjects[objectId] || null;
        this._updateFailedAttachments(objectId, attachment);
        this._updateTotalAttachmentSize(objectId, attachment);
    };
    proto._updateFailedAttachments = function (objectId, attachment) {
        /// <summary>Keeps track of failed attachments.</summary>
        /// <param name="objectId" type="String">The unique id of the attachment.</param>
        /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment" optional="true">The attachment object. This is null if the attachment no longer exists.</param>
        var attachmentExists = Boolean(attachment);
        if (attachmentExists && attachment.composeStatus === AttachmentComposeStatus.failed) {
            this._failedAttachments[objectId] = true;
        } else if ((!attachmentExists || attachment.composeStatus !== AttachmentComposeStatus.failed) && this._failedAttachments[objectId]) {
            delete this._failedAttachments[objectId];

            // If we removed the last failed attachment, then clear the error
            if (Object.keys(this._failedAttachments).length === 0) {
                this.fire("clearerror", { errorId: AttachmentWell.ErrorIds.attachFailed });
                return;
            }
        }

        var failedAttachmentsCount = Object.keys(this._failedAttachments).length,
            totalAttachmentsCount = this._attachmentCollection.count,
            errorMessage;
        if (failedAttachmentsCount > 0) {
            // Fire failed file error event
            if (failedAttachmentsCount === 1 && totalAttachmentsCount > 1) {
                // One of many attachments failed.
                errorMessage = Jx.res.getString("composeOneAttachFailedErrorMessage");
            } else if (failedAttachmentsCount === totalAttachmentsCount) {
                errorMessage = totalAttachmentsCount === 1 ?
                    Jx.res.getString("composeOneOfOneAttachFailedErrorMessage") : Jx.res.getString("composeAllAttachFailedErrorMessage");
            } else {
                // More than one (but not all) attachments failed.
                errorMessage = Jx.res.getString("composeMultipleAttachFailedErrorMessage");
            }

            var attachFailedError = new AttachmentWell.Error(AttachmentWell.ErrorIds.attachFailed, errorMessage);
            this.fire("error", { error: attachFailedError });
        }
    };
    proto._updateTotalAttachmentSize = function (objectId, attachment) {
        /// <summary>Keeps track of the total size of all attachments.</summary>
        /// <param name="objectId" type="String">The unique id of the attachment.</param>
        /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment" optional="true">The attachment object. This is null if the attachment no longer exists.</param>
        var previousTotalAttachmentSize = this._totalAttachmentSize;

        // Default to zero for the case that this is a brand new attachment that was just added.
        var oldAttachmentSize = this._attachmentSizes[objectId] || 0;
        this._totalAttachmentSize -= oldAttachmentSize;
        Debug.assert(this._totalAttachmentSize >= 0, "Expected total attachment size to be a positive number");

        // Default to zero for the case that this attachment was just removed.
        var newAttachmentSize = attachment ? attachment.size : 0;
        this._totalAttachmentSize += newAttachmentSize;

        if (attachment) {
            // Save this for the future.
            this._attachmentSizes[objectId] = newAttachmentSize;
        } else {
            // The attachment does not exist anymore.
            delete this._attachmentSizes[objectId];
        }

        // Check if we need to show or hide the error for basic attachments.
        var maxBasicAttachmentsSizeInBytes = BasicAttachmentsMax.sizeInBytes;
        if (previousTotalAttachmentSize >= maxBasicAttachmentsSizeInBytes && this._totalAttachmentSize < maxBasicAttachmentsSizeInBytes) {
            // We were over the max size, but now we are under.
            this.fire("clearerror", { errorId: AttachmentWell.ErrorIds.maxBasicAttachmentsSize });
        } else if (previousTotalAttachmentSize < maxBasicAttachmentsSizeInBytes && this._totalAttachmentSize >= maxBasicAttachmentsSizeInBytes) {
            // We were under the max size but now we are over.
            var maxBasicAttachmentsSizeError = new AttachmentWell.Error(AttachmentWell.ErrorIds.maxBasicAttachmentsSize, Jx.res.getString("composeMaxBasicAttachmentsSizeErrorMessage"));
            this.fire("error", { error: maxBasicAttachmentsSizeError });
        }
    };
    proto._attachmentQueueEmpty = function () {
        /// <summary>Responds to attachment queue empty event notifications</summary>
        this._needToFireAttachComplete = true;
        this._checkAndFireQueueEmpty();
    };
    proto._checkAndFireQueueEmpty = function () {
        /// <summary>Checks if we are ready to fire attachcomplete event and fires accordingly. 
        ///          Fires event if the queue empty event is received and all pending attachments are either completed or failed.
        /// </summary>
        if (this._needToFireAttachComplete && Object.keys(this._pendingAttachments).length === 0) {
            // Clear progress error
            this.fire("clearerror", { errorId: AttachmentWell.ErrorIds.inProgress });

            // Queue is empty, that means message can be sent, calculate the time in processing
            if (this._attachStartTime > 0) {
                this._totalAttachDuration += ((new Date()).getTime() - this._attachStartTime);
                this._attachStartTime = 0;
            }
            // Inform clients that attaching is complete for the current queue
            Jx.EventManager.fire(null, "attachcomplete", {});

            this._needToFireAttachComplete = false;
        }
    };
    /* @type(Microsoft.WindowsLive.Platform.IMailManager) */proto._mailManager = null;
    /* @type(Microsoft.WindowsLive.Platform.IMailMessage) */proto._mailMessage = null;
    /* @type(Microsoft.WindowsLive.Photomail.AttachmentManager) */proto._attachmentManager = null;
    /* @type(Microsoft.WindowsLive.Platform.ICollection) */proto._attachmentCollection = null;
    /* @type(Number)*/proto._attachmentCount = 0;
    /* @type(Object)*/proto._attachmentObjects = null;
    /* @type(Object)*/proto._attachmentSizes = null;
    /* @type(Number)*/proto._totalAttachmentSize = 0;
    /* @type(Array)*/proto._changedListeners = null;
    /* @type(Object)*/proto._pendingAttachments = null;
    /* @type(Object)*/proto._failedAttachments = null;
    /* @type(Number)*/proto._totalAttachDuration = 0;
    /* @type(Number)*/proto._attachStartTime = 0;
    /* @type(Number)*/proto._numberOfValidateFailures = 0;
    /* @type(Boolean)*/proto._isDirty = null;
    /* @type(Boolean)*/proto._needToFireAttachComplete = false;


    
    // Mock Microsoft.WindowsLive.Photomail.AttachmentManager for running in IE
    window.MockAttachments = {};
    MockAttachments.getManager = function (messageId) {
        return {
            _messageId: messageId,
            _files: [],
            _isAttaching: false,
            imageSize: 0,
            addFiles: function (files) {
                // Do something with files
                this._isAttaching = true;
                this._files = this._files.concat(files);
            },
            addFile: function (attachmentId, aFile) {
                this.addFiles([aFile]);
            },
            removeFile: function (attachmentId) {
                // Do something
            },
            isAttaching: function (attachmentId) {
                // Check if this file is being attaching
                // since we are mock, we are always attaching something
                return this._isAttaching;
            },
            discard: function () {
                // Discard any intermediate state (transcoded files etc) and stop everything
            },
            stopAll: function () {
                // Stop everything
            },
            dispose: function () {
                // Cleanup routine to explicitly clean and not rely on JS GC
            }
        };
    };
    

})();

//
// Copyright (C) Microsoft. All rights reserved.
//
/*global AttachmentWell*/
/// <reference path="AttachmentWell.ref.js" />

(function () {
    
    var T = AttachmentWell.Templates = {

        // Error Manager
        errorMessage: function (data) {
            var err = data.error;
            var s = '<div data-errorId="' + err.id + '" class="attachmentWell-error-message">' +  Jx.escapeHtml(err.message);
            for (var i = 0, len = err.commands.length; i < len; i++) {
                s += '<button class="attachmentWell-error-command" type="button">' +  err.commands[i].label + '</button>';
            }
            s += '</div>';
            return s;
        },

        // Shared helpers
        basicProperties: function (data) {
            return  '' + 
                '<li class="attachmentWell-item-property-fileName">' + Jx.escapeHtml(data.name) + '</li>' + 
                '<li class="attachmentWell-item-property-fileExtension">' + Jx.escapeHtml(data.fileExtension) + '</li>' + 
                '<li class="attachmentWell-item-property-fileSize">' +  Jx.escapeHtml(data.fileSize) + '</li>';
        },

        properties: function (data) {
            return '' +
                '<ul class="attachmentWell-item-properties">' +
                    T.basicProperties(data) +
                '</ul>';
        },

        image: function (data, src, className) {
            Debug.assert(!Jx.isNullOrUndefined(data) && !Jx.isNullOrUndefined(data.name), "AttachmentWell.Templates.image: data cannot be null");
            Debug.assert(Jx.isNonEmptyString(src), "AttachmentWell.Templates.image: src has to be a non-empty string");
            className = className ? className : "";
            return '<img class="' + className + '" src="' + src + '" alt="' + Jx.escapeHtml(data.name) + '">'
        },

        defaultImage: function (data, iconFileName, className) {
            return T.image(data, "/resources/modernattachmentwell/images/" + iconFileName, className);
        },

        fileIcon: function (data) {
            if (data.isEml) {
                return '' +
                    '<div class="attachmentWell-item-status">' +
                        T.defaultImage(data, "emlIcon.png", "attachmentWell-photo-video-icon") +
                    '</div>';
            }

            if (data.fileIconUrl) {
                return '' +
                    '<div class="attachmentWell-item-status">' +
                        '<img src="' + data.fileIconUrl + '" alt="' + Jx.escapeHtml(data.name) + '" height="' + data.fileIconHeight + '" width="' + data.fileIconWidth + '">' +
                    '</div>';
            }

            return '' +
                '<div class="attachmentWell-item-status attachmentWell-item-placeholder">' +
                    T.defaultImage(data, "default.png", "attachmentWell-default-icon") +
                '</div>';
        },

        // Shared renderers
        photoVideoItemPlaceholder: function (data) {
            return '' +
                '<div class="attachmentWell-item-photoVideo attachmentWell-item-placeholder" aria-hidden="true">' +
                     T.defaultImage(data, "default.png", "attachmentWell-default-icon") +
                '</div>';
        },

        videoItem: function (data) {
            return '' +
                '<div class="attachmentWell-item-photoVideoDone" aria-hidden="true">' +
                    T.image(data, data.thumbnailUrl) + 
                    '<div class="attachments-videoInfo" aria-hidden="true">' +
                        '<div class="videoPlayGlyph">\uE102</div>' +
                    '</div>' +
                '</div>';
        },

        photoItem: function (data) {
            return '' +
                '<div class="attachmentWell-item-photoVideoDone" aria-hidden="true">' +
                    '<img src="' + data.thumbnailUrl + '">' +
                '</div>';
        },

        otherItem: function (data) {
            return '' +
                '<div class="attachmentWell-item-other attachmentWell-item-downloaded" aria-hidden="true">' +
                    T.fileIcon(data) +
                    T.properties(data) +
                '</div>';
        },

        // Compose helpers
        propertiesWithRemoveCommand: function (data) {
            return '' +
                '<ul class="attachmentWell-item-properties">' +
                    '<li class="attachmentWell-item-property-fileName">' + Jx.escapeHtml(data.name) + '</li>' +
                    '<li class="attachmentWell-item-command">' + data.commandLabel + '</li>' +
                '</ul>';
        },

        // Compose renderers
        composeItemWithProgress: function(/*data*/) {
            return '<div class="attachmentWell-item-progress" aria-hidden="true"></div>';
        },

        composeErrorItem: function(data) {
            return '' + 
                '<div class="attachmentWell-item-other attachmentWell-item-error" aria-hidden="true">' + 
                    '<div class="attachmentWell-item-status">' +
                         T.defaultImage(data, "default.png", "attachmentWell-default-icon") +
                    '</div>' + 
                    T.propertiesWithRemoveCommand(data) + 
                '</div>';
        },

        // Read helpers
        propertiesWithDownloadCommand: function(data) {
            return '' + 
                '<ul class="attachmentWell-item-properties">' + 
                    T.basicProperties(data) + 
                    '<li class="attachmentWell-item-command">' + data.commandLabel + '</li>' + 
                '</ul>';
        },
       
        propertiesWithCancelCommand: function(data) {
            return '' + 
                '<ul class="attachmentWell-item-properties">' + 
                    T.basicProperties(data) + 
                    '<li class="attachmentWell-item-command">' + 
                        '<progress class="win-ring"></progress>' + 
                        data.commandLabel + 
                    '</li>' + 
                '</ul>';
        },

        notDownloadedPhotoVideo: function (data) {
            return '' +
                '<div class="attachmentWell-item-status attachmentWell-item-placeholder">' +
                     T.defaultImage(data, "photoVideoIcon.png", "attachmentWell-photo-video-icon") +
                '</div>';
        },
       
        // Read
        readOtherItemDownloading: function(data) {
            return '' + 
                '<div class="attachmentWell-item-other attachmentWell-item-downloading" aria-hidden="true">' + 
                    T.fileIcon(data) + 
                    T.propertiesWithCancelCommand(data) + 
                '</div>';
        },

        readOtherItemNotDownloaded: function(data) {
            return '' + 
                '<div class="attachmentWell-item-other attachmentWell-item-notDownloaded" aria-hidden="true">' + 
                    T.fileIcon(data) + 
                    T.propertiesWithDownloadCommand(data) + 
                '</div>';
        },

        readPhotoVideoItemDownloading: function(data) {
            return '' + 
                '<div class="attachmentWell-item-photoVideo attachmentWell-item-downloading" aria-hidden="true">' + 
                    T.notDownloadedPhotoVideo(data) + 
                    T.propertiesWithCancelCommand(data) + 
                '</div>';
        },

        readPhotoVideoItemNotDownloaded: function(data) {
            return '' + 
                '<div class="attachmentWell-item-photoVideo attachmentWell-item-notDownloaded" aria-hidden="true">' + 
                    T.notDownloadedPhotoVideo(data) + 
                    T.propertiesWithDownloadCommand(data) + 
                '</div>';
        }
    };

})();
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="AttachmentWell.ref.js" />
/*global AttachmentWell,Jx,Debug*/

(function () {
    AttachmentWell.ErrorIds = {
        attachFailed: "attachFailed",
        downloadFailed: "downloadFailed",
        inProgress: "inProgress",
        maxBasicAttachmentsSize: "maxBasicAttachmentsSize",
        maxFiles: "maxFiles",
        openFailed: "openFailed"
    };

    AttachmentWell.Error = /*@constructor*/function (id, message) {
        /// <param name="id" type="String">The unique ID for the error.</param>
        /// <param name="message" type="String">The localized message for the error.</param>
        Debug.assert(Jx.isNonEmptyString(id), "Expected id to be a valid string");
        Debug.assert(Jx.isNonEmptyString(message), "Expected message to be a valid string");
        this.commands = [];
        this.id = id;
        this.message = message;
    };

    var errorProto = AttachmentWell.Error.prototype;
    errorProto.commands = /*static_cast(Array)*/null;
    errorProto.id = /*static_cast(String)*/null;
    errorProto.message = /*static_cast(String)*/null;


    AttachmentWell.ErrorCommand = /*@constructor*/function (label, action) {
        /// <param name="label" type="String">The localized label for the error command.</param>
        /// <param name="action" type="Function">The event handler for the error command.</param>
        this.action = action;
        this.label = label;
    };

    var errorCommandProto = AttachmentWell.ErrorCommand.prototype;
    errorCommandProto.action = /*@static_cast(Function)*/null;
    errorCommandProto.label = /*static_cast(String)*/null;
})();
//
// Copyright (C) Microsoft. All rights reserved.
//
// Renders errors for the attachment well.
//
/*global AttachmentWell,Jx,Debug,document*/

(function () {
    AttachmentWell.ErrorManager = /*@constructor*/function () {
        /// <summary>Renders errors from the compose attachment well.</summary>
        this.initComponent();
    };

    Jx.augment(AttachmentWell.ErrorManager, Jx.Component);

    var proto = AttachmentWell.ErrorManager.prototype;

    proto.getUI = function (ui) {
        ui.html = '<div class="attachmentWell-errorList" aria-hidden="true" aria-live="polite"></div>';
    };

    proto.activateUI = function () {
        /// <summary>Used to interact with the DOM after it was built.</summary>
        this._activeErrors = {};
        this._commandCallbacks = {};
        this._errorWrapper = document.createElement("div");

        var view = this.getParent();
        this._errorListElement = view.getElement().querySelector(".attachmentWell-errorList");
    };

    proto._addCommandEventListeners = function (errorElement, error) {
        /// <summary>Adds event listeners to each command.</summary>
        /// <param name="errorElement" type="HTMLElement">The HTML element that holds the error.</param>
        /// <param name="error" type="AttachmentWell.Error">The error containing commands.</param>
        var commandElements = errorElement.querySelectorAll(".attachmentWell-error-command");
        Debug.assert(commandElements.length === error.commands.length, "Expected all error commands to be present in error element");

        var command,
            commandElement,
            that = this;
        for (var i = 0, len = error.commands.length; i < len; i++) {
            command = /*@static_cast(AttachmentWell.ErrorCommand)*/error.commands[i];
            commandElement = /*@static_cast(HTMLElement)*/commandElements[i];
            if (commandElement) {
                var commandCallback = function () {
                    that.clearError(error.id);
                    command.action();
                };
                this._commandCallbacks[command.action] = commandCallback;
                commandElement.addEventListener("click", commandCallback, false);
                
            } else {
                Debug.assert(false, "Expected to find command element in error element");
                
            }
        }
    };

    proto.clearError = function (errorId) {
        /// <summary>Clears the given error.</summary>
        /// <param name="errorId" type="String">The unique ID of the error to clear.</param>
        /// <returns type="Boolean">true if the error was cleared and false otherwise.</returns>
        try {
            // If the error doesn't exist then we just no-op so that clients can attempt to clear errors 
            // without having to check if they exist first.
            var existingError = this._activeErrors[errorId];
            if (existingError) {
                var errorElement = this._errorListElement.querySelector('[data-errorId="' + errorId + '"]');
                if (errorElement) {
                    // We pass existingError to _removeCommandEventListeners as it is the original error 
                    // object that referenced all of the associated commands. The new error object passed 
                    // to use via the parameter may not contain these same exact commands.
                    this._removeCommandEventListeners(errorElement, existingError);
                    this._errorListElement.removeChild(errorElement);
                    delete this._activeErrors[errorId];
                    this._showOrHide();
                    return true;
                    
                } else {
                    Debug.assert(false, "Expected to find error element");
                    
                }
            }
        } catch (ex) {
            Jx.log.error("Failed to clear Attachment Well error " + errorId + ": " + ex);
        }

        return false;
    };

    proto.clearAllErrors = function () {
        /// <summary>Clears all errors.</summary>
        if (this._activeErrors) {
            var keys = Object.keys(this._activeErrors),
                error,
                cleared;
            for (var i = keys.length; i--;) {
                error = /*@static_cast(AttachmentWell.Error)*/this._activeErrors[keys[i]];
                cleared = this.clearError(error.id);
                Debug.assert(cleared, "Expected to successfully clear Attachment well error " + error.id);
            }
        }
    };

    proto._createErrorElement = function (error) {
        /// <summary>Creates an element for the error, including all associated commands.</summary>
        /// <param name="error" type="AttachmentWell.Error">The error to create an element for.</param>
        /// <returns type="HTMLElement">The element containing error info.</returns>
        this._errorWrapper.innerHTML = AttachmentWell.Templates.errorMessage.call(this, { error: error });

        return this._errorWrapper.querySelector(".attachmentWell-error-message");
    };

    proto._removeCommandEventListeners = function (errorElement, error) {
        /// <summary>Removes event listeners from each command.</summary>
        /// <param name="errorElement" type="HTMLElement">The HTML element that holds the error.</param>
        /// <param name="error" type="AttachmentWell.Error">The error containing commands.</param>
        var commandElements = errorElement.querySelectorAll(".attachmentWell-error-command");
        Debug.assert(commandElements.length === error.commands.length, "Expected all error commands to be present in error element");

        var command,
            commandElement,
            commandCallback;
        for (var i = 0, len = error.commands.length; i < len; i++) {
            command = /*@static_cast(AttachmentWell.ErrorCommand)*/error.commands[i];
            commandElement = /*@static_cast(HTMLElement)*/commandElements[i];
            if (commandElement) {
                commandCallback = this._commandCallbacks[command.action];
                if (commandCallback) {
                    commandElement.removeEventListener("click", commandCallback, false);
                    
                } else {
                    Debug.assert(false, "Expected to find command callback");
                    
                }
                
            } else {
                Debug.assert(false, "Expected to find command element in error element");
                
            }
        }
    };

    proto._showOrHide = function () {
        /// <summary>Shows or hides the error manager depending on if there are any visible errors.</summary>
        var numErrors = Object.keys(this._activeErrors).length,
            hiddenErrors = this._errorListElement.querySelectorAll(".attachmentWell-error-message[aria-hidden='true']");
        if (numErrors > 0 && hiddenErrors.length !== numErrors) {
            this._errorListElement.removeAttribute("aria-hidden");
        } else {
            this._errorListElement.setAttribute("aria-hidden", "true");
        }
    };

    proto.hideError = function (error) {
        /// <summary>Hides the given error.</summary>
        /// <param name="error" type="AttachmentWell.Error">The error to hide.</param>
        /// <returns type="Boolean">true if the error was hidden and false otherwise.</returns>
        try {
            // If the error doesn't exist then we just no-op so that clients can attempt to hide errors 
            // without having to check if they exist first.
            var errorElement = this._errorListElement.querySelector('[data-errorId="' + error.id + '"]');
            if (errorElement) {
                errorElement.setAttribute("aria-hidden", "true");
                this._showOrHide();
                return true;
            
            } else {
                Debug.assert(false, "Expected to find error element");
            
            }
        } catch (ex) {
            Jx.log.error("Failed to hide Attachment Well error " + error.id + ": " + ex);
        }

        return false;
    };

    proto.showError = function (error) {
        /// <summary>Shows the given error.</summary>
        /// <param name="error" type="AttachmentWell.Error">The error to show.</param>
        /// <returns type="Boolean">true if the error was shown and false otherwise.</returns>
        try {
            Jx.log.info("AttachmentWell.ErrorManager.showError: " + error.id);

            // Always clear the error first so that if it is already being shown it will be bumped to the top of the list.
            this.clearError(error.id);

            var errorElement = this._createErrorElement(error);
            this._addCommandEventListeners(errorElement, error);

            var errorListElement = this._errorListElement,
                firstChild = errorListElement.firstChild;

            // Always insert at the beginning of the list.
            if (firstChild) {
                errorListElement.insertBefore(errorElement, firstChild);
            } else {
                errorListElement.appendChild(errorElement);
            }

            this._activeErrors[error.id] = error;

            this._showOrHide();

            return true;
        } catch (ex) {
            Jx.log.error("Failed to show Attachment Well error " + error.id + ": " + ex);
        }

        return false;
    };

    proto.deactivateUI = function () {
        /// <summary>Used to interact with the DOM just before it is destroyed.</summary>
        this.clearAllErrors();
        this._activeErrors = null;
        this._commandCallbacks = null;
        this._errorWrapper = null;
        this._errorListElement = null;
        Jx.Component.prototype.deactivateUI.call(this);
    };

    proto._activeErrors = null;
    proto._commandCallbacks = null;
    proto._errorWrapper = /*@static_cast(HTMLElement)*/null;
    proto._errorListElement = /*@static_cast(HTMLElement)*/null;
})();
//
// Copyright (C) Microsoft. All rights reserved.
//
/*global AttachmentWell,Jx,Debug,Windows,WinJS*/
(function () {

    var Utils = AttachmentWell.Utils;

    // Defines file display ordering with smaller number indicating closer to the front
    Utils.GroupOrdering = {
        photoVideo: 0,
        others: 1
    };

    Utils.FileCategory = {
        photo: "photo",
        video: "video",
        others: "others"
    };

    // File extensions that we recognize as a photo file
    Utils._photoExtensions = [
        ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tif", ".tiff", ".jpe", ".jfif", ".dib", ".wdp", ".pano",
        ".arw", ".cr2", ".crw", ".erf", ".mrw", ".nef", ".orf", ".pef", ".sr2", ".mef", ".nrw", ".raw", ".rw2", ".rwl" // Raw image extensions
    ];

    // File extensions that we recognize as a video file
    Utils._videoExtensions = [
        ".avi", ".wmv", ".mpg", ".mpeg", ".dvr-ms", ".mp4", ".mov", ".m4v", ".3g2",
        ".3gp2", ".3gp", ".3gpp", ".m4a", ".mp4v", ".mts", ".m2ts", ".ts", ".wm", ".wtv"
    ];

    Utils.isSupportedPhotoOrVideoFormat = function (fileExtension) {
        /// <summary>Gets whether the given file extension is a photo or video type that we recognize.</summary>
        /// <param name="fileExtension" type="String">File extension, ex: ".jpg"</param>
        return Utils.isSupportedPhotoFormat(fileExtension) || Utils.isSupportedVideoFormat(fileExtension);
    };

    Utils.isSupportedPhotoFormat = function (fileExtension) {
        /// <summary>Gets whether the given file extension is a photo type that we recognize.</summary>
        /// <param name="fileExtension" type="String">File extension, ex: ".jpg"</param>
        return Utils._photoExtensions.indexOf(fileExtension.toLowerCase()) >= 0;
    };

    Utils.isSupportedVideoFormat = function (fileExtension) {
        /// <summary>Gets whether the given file extension is a video type that we recognize.</summary>
        /// <param name="fileExtension" type="String">File extension, ex: ".jpg"</param>
        return Utils._videoExtensions.indexOf(fileExtension.toLowerCase()) >= 0;
    };

    Utils.isEml = function (fileExtension) {
        /// <summary>Gets whether the given file extension is an EML extension.</summary>
        /// <param name="fileExtension" type="String">File extension, ex: ".eml"</param>
        return fileExtension.toLowerCase() === ".eml";
    };

    Utils.getFileFromBodyUri = function (attachment) {
        Debug.assert(attachment.bodyUri, "AttachmentWell.Utils.getFileFromBodyUri: the given attachment's bodyUri is not available");
        var encodedUri = Utils.encodeUri(attachment.bodyUri);
        var uri = new Windows.Foundation.Uri(encodedUri);
        try {
            // getFileFromApplicationUriAsync throws exception instead of returning failed promise
            // for cases like when the file path exceeds the system max file size
            return Windows.Storage.StorageFile.getFileFromApplicationUriAsync(uri);
        } catch (e) {
            return WinJS.Promise.wrapError(e);
        }
    };

    Utils.encodeUri = function (uri) {
        /// <summary>Encodes special characters that are allowed as part of the file name but not in an URI.</summary>
        /// <param name="uri" type="String">URI string to encode.</param>
        Debug.assert(Jx.isString(uri), "AttachmentWell.Utils._encodeUri: given uri is not a string");
        return uri.replace(/%/g, "%25")   // encode %
                  .replace(/#/g, "%23");   // encode # 
    };

    Utils.getFileName = function (attachment) {
        /// <summary>Gets the file name of the given attachment without file extension.</summary>
        /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
        // Default to the full file name because there may not be a file extension at all
        var fileName = attachment.fileName;
        var index = fileName.lastIndexOf(".");
        if (index >= 0) {
            fileName = fileName.substr(0, index);
        }
        return fileName;
    };

    Utils.getFileExtension = function (attachment) {
        /// <summary>Gets the file extension of the given attachment in lower case in the format of ".jpg"
        /// Returns an empty string if the given attachment file name does not have an extension.</summary>
        /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
        var fileName = attachment.fileName;
        var extension = ""; // Default to empty string because there may not be a file extension at all
        var index = fileName.lastIndexOf(".");
        if (index >= 0) {
            extension = fileName.substr(index).toLowerCase();
        }
        return extension;
    };

    Utils.markFileAsWritable = function (file) {
        /// <summary>Sets the given file's attributes so that it is marked as writable / not read-only.</summary>
        /// <param name="file" type="Windows.Storage.StorageFile">File to mark as writable</param>
        if (file) {
            var fileAttributesProperty = "System.FileAttributes";
            return file.properties.retrievePropertiesAsync([fileAttributesProperty])
                .then(function (properties) {
                    // make sure the saved file is not marked as read-only by setting its fil attributes to "normal"
                    properties[fileAttributesProperty] = Windows.Storage.FileAttributes.normal;
                    return file.properties.savePropertiesAsync(properties);
                });
        }
    };

    Utils._numSuggestedNumerals = 3;
    Utils._ordersOfMagnitude = ["bytes", "kilobytes", "megabytes", "gigabytes", "terabytes", "petabytes", "exabytes"];
    Utils.getFileSize = function (attachment) {
        /// <summary>Gets a human-readable string that represents the file size.</summary>
        /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
        var fileSizeInBytes = attachment.size;

        if (fileSizeInBytes === 1) {
            // Special case for the singular "1 byte".
            return Jx.res.getString("singleByte");
        }

        var size = fileSizeInBytes,
            sizeString = size.toString(10),
            ordersOfMagnitude = Utils._ordersOfMagnitude,
            order = 0;

        // This logic is borrowed from the implementation of PSStrFormatByteSizeW in //depot/winmain/shell/propsys/formatdisplay.cpp.
        if (size >= 1024) {
            // If the suggested number of numerals is 3, then we know that the string "1000" (10^3) is too long because it contains 4 
            // numerals. We multiply this "too long" number by 1024 because we'll divide by 1024 again after the loop.
            var numSuggestedNumerals = Utils._numSuggestedNumerals,
                sizeThatIsTooLong = 1024 * Math.pow(10, numSuggestedNumerals),
                len;

            for (order = 1, len = ordersOfMagnitude.length; order < len && size >= sizeThatIsTooLong; order++) {
                size /= 1024;
            }

            // Format the integer portion of the file size as a string to see if it is the right length already.
            size /= 1024;
            var integerPortion = Math.floor(size),
                formatter = new Windows.Globalization.NumberFormatting.DecimalFormatter();
            formatter.fractionDigits = 0;
            sizeString = formatter.format(integerPortion);

            var numFractionDigitsNeeded = numSuggestedNumerals - sizeString.length;
            if (numFractionDigitsNeeded > 0) {
                // We need to truncate the decimal portion to the appropriate length because it is probably too long, but the Windows 
                // DecimalFormatter doesn't truncate  numbers (by design), so we do it manually. However, JavaScript doesn't have a 
                // native method that can truncate a number in-place, so we have to use toFixed which converts the number to a string.
                var truncatedSizeString = size.toFixed(numFractionDigitsNeeded),
                    truncatedSize = parseFloat(truncatedSizeString);

                // Format the final number.
                formatter.fractionDigits = numFractionDigitsNeeded;
                sizeString = formatter.format(truncatedSize);
            }
        }

        return Jx.res.loadCompoundString(ordersOfMagnitude[order], sizeString);
    };
})();

//
// Copyright (C) Microsoft. All rights reserved.
//
// A base component that encapsulates all compose attachment UX.
//

/*global AttachmentWell,Jx,Debug*/

(function () {

    AttachmentWell.Base.Module = /*@constructor*/function () {
        /// <summary>A base component that encapsulates all compose attachment UX.</summary>
        this.initComponent();
        this._id = "idAttachmentWell_" + Jx.uid();
    };

    Jx.augment(AttachmentWell.Base.Module, Jx.Component);

    var proto = AttachmentWell.Base.Module.prototype;

    proto.getUI = function (ui) {
        /// <summary>Gets the HTML and CSS for this component.</summary>
        /// <param name="ui" type="JxUI">An object that contains the HTML and CSS as strings.</param>
        Debug.assert(Jx.isObject(ui), "Expected ui to be a valid object");

        ui.html =
            '<div id="' + this._id + '" class="attachmentWell-module">' +
                Jx.getUI(this._view).html +
            '</div>';
    };

    proto._id = /*@static_cast(String)*/null;
    proto._view = /*@static_cast(AttachmentWell.Compose.ViewLayout)*/null;
})();

//
// Copyright (C) Microsoft. All rights reserved.
//
// Base controller that controls an individual attachment item actions.
//

/*global AttachmentWell,Jx,Debug,WinJS,Microsoft,Windows*/

(function () {

    var Utils = AttachmentWell.Utils;

    AttachmentWell.Base.ItemController = /*@constructor*/function (view) {
        /// <summary>Base controller that controls an individual attachment item actions.</summary>
        /// <param name="view" type="AttachmentWell.Base.ViewLayout">View that hosts the items this controller controls.</param>
        Debug.assert(view && view.getElement, "AttachmentWell.Base.ItemController: given view is invalid or does not have getElement function implemented");
        this._view = view;
    };

    Jx.augment(AttachmentWell.Base.ItemController, Jx.EventTarget);

    var proto = AttachmentWell.Base.ItemController.prototype;

    proto._getAttachmentStatus = function (attachment) {
        /// <summary>Returns the sync or attach status state of the given attachment.</summary>
        /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
        Debug.assert(false, "Expected AttachmentWell.Base.Controller._getAttachmentStatus() to be implemented by subclass");
    };

    proto._getItemInvokedCallback = function (attachmentStatus) {
        /// <summary>Returns a function to be invoked when a user taps on an attachment.</summary>
        /// <param name="attachmentStatus" type="Number">The status of the attachment.</param>
        /// <returns type="Function">A callback function to execute.</returns>
        if (!this._itemInvokedCallbacks) {
            this._itemInvokedCallbacks = this._createItemInvokedCallbacks();
        }
        return this._itemInvokedCallbacks[attachmentStatus];
    };

    proto._createItemInvokedCallbacks = function () {
        /// <returns type="Object">A mapping from attachment status to item invoked callback.</returns>
        Debug.assert(false, "Expected AttachmentWell.Base.Controller._createItemInvokedCallbacks() to be implemented by subclass");
    };

    proto._getContextMenuCallbacks = function (attachmentStatus) {
        /// <summary>Returns an array of context menu callbacks, one of which will be invoked when a user right-clicks on an attachment and chooses a command.</summary>
        /// <param name="attachmentStatus" type="Number">The status of the attachment.</param>
        /// <returns type="Array">An array of context menu callbacks.</returns>
        if (!this._contextMenuCallbacks) {
            this._contextMenuCallbacks = this._createContextMenuCallbacks();
        }
        return this._contextMenuCallbacks[attachmentStatus] || [];
    };

    proto._getContextMenuCommands = function (attachment, options) {
        /// <summary>Returns an array of context menu commands to be shown when a user right-clicks on an attachment.</summary>
        /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
        /// <param name="options" type="Object">Options for the context menu commands. 
        /// options: {
        ///         launcherOptions: null,  // Windows.System.LauncherOptions for Open windowing preference
        ///         itemDiv: null           // HTMLElement to remove for Delete command
        /// }
        /// </param>
        /// <returns type="Array">A list of WinJS.UI.MenuCommands to show.</returns>
        var status = this._getAttachmentStatus(attachment),
            callbacks = this._getContextMenuCallbacks(status);
        Debug.assert(Jx.isArray(callbacks), "Expected callbacks to be a valid array");

        var contextMenu = this._getContextMenu(),
            fileExtension = Utils.getFileExtension(attachment);
        return callbacks
            .filter(function (callback) {
                return callback.isEnabled(fileExtension);
            })
            .map(function (callback) {
            /// <param name="callback" type="AttachmentWell.Base.ContextMenuCallback">The callback for the context menu item.</param>
                var contextMenuCommand = contextMenu.getCommandById(callback.commandId);
                contextMenuCommand.onclick = function () {
                    callback.invoke(attachment, options);
                };
                return contextMenuCommand;
            });
    };

    proto._alwaysEnable = function () {
        return true;
    };

    proto._disableForEml = function (fileExtension) {
        /// <param name="fileExtension" type="String">The file extension of the attachment.</param>
        return !Utils.isEml(fileExtension);
    };

    proto._enableForEml = function (fileExtension) {
        /// <param name="fileExtension" type="String">The file extension of the attachment.</param>
        return Utils.isEml(fileExtension);
    };

    proto._getContextMenu = function () {
        /// <returns type="WinJS.UI.Menu">The context menu for the attachment well.</returns>
        if (!this._contextMenu) {
            var contextMenuElement = this._view.getElement().querySelector(".attachments-contextMenu");
            Debug.assert(Jx.isHTMLElement(contextMenuElement), "Expected valid context menu element");
            WinJS.UI.processAll(contextMenuElement);
            Jx.res.processAll(contextMenuElement);

            // WinLive 625320 - Narrator won't move to the "close" button of context menus (i.e. win-flyoutmenuclickeater) 
            // unless the context menu element is moved to be closer in the DOM to the "close" button.
            var flyoutContainerElement = this._getFlyoutContainerElement();
            Debug.assert(flyoutContainerElement, "Couldn't find flyout container for attachment well context menu");
            if (flyoutContainerElement) {
                flyoutContainerElement.appendChild(contextMenuElement);
            }

            this._contextMenu = contextMenuElement.winControl;
        }
        return this._contextMenu;
    };

    proto._getFlyoutContainerElement = function () {
        /// <summary>Returns the parent element for flyouts.</summary>
        /// <returns type="HTMLElement">The parent element for flyouts.</returns>
        Debug.assert(false, "Expected AttachmentWell.Base.Controller._getFlyoutContainerElement() to be implemented by subclass");
    };

    proto.showContextMenu = function (attachment, options) {
        /// <summary>Shows a context menu for the given attachment.</summary>
        /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
        /// <param name="options" type="Object">Contains the DOM element to anchor the context menu.</param>
        Debug.assert(Jx.isObject(attachment), "Expected attachment to be a valid object");
        Debug.assert(options && Jx.isHTMLElement(options.itemDiv), "Expected itemDiv to be a valid HTMLElement");

        var commands = this._getContextMenuCommands(attachment, options);
        if (commands.length > 0) {
            var menu = this._getContextMenu();
            menu.showOnlyCommands(commands);
            menu.show(options.itemDiv, "top", "center");
        }
    };

    proto.onItemInvoked = function (attachment, options) {
        /// <summary>Handles the iteminvoked event.</summary>
        /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
        /// <param name="options" type="Object">Contains the DOM element to anchor the context menu.</param>
        Debug.assert(Jx.isObject(attachment), "Expected attachment to be a valid object");
        Debug.assert(options && Jx.isHTMLElement(options.itemDiv), "Expected itemDiv to be a valid HTMLElement");

        var status = this._getAttachmentStatus(attachment),
            itemInvokedCallback = this._getItemInvokedCallback(status);
        if (itemInvokedCallback) {
            itemInvokedCallback(attachment, options);
        } else {
            // If there was no command to invoke, we show a context menu instead.
            this.showContextMenu(attachment, options);
        }
    };

    proto._openWith = function (attachment, options) {
        /// <summary>Opens an attachment with the user-specified handler.</summary>
        /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
        /// <param name="options" type="Object" optional="true">Additional options.</param>
        Jx.log.info("AttachmentWell.Base.ItemController._openWith");
        var launcherOptions = new Windows.System.LauncherOptions();
        launcherOptions.displayApplicationPicker = true;
        options.launcherOptions = launcherOptions;
        this._open(attachment, options);
    };

    proto._open = function (attachment, options) {
        /// <summary>Opens an attachment.</summary>
        /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
        /// <param name="options" type="Object" optional="true">Additional options.</param>
        Jx.log.info("AttachmentWell.Base.ItemController._open");
        var fileExtension = Utils.getFileExtension(attachment),
            launcherOptions = options ? options.launcherOptions : null,
            that = this;

        // In case the last open attempt caused an error, clear the error before we attempt opening again.
        this._view.fire("clearerror", { errorId: AttachmentWell.ErrorIds.openFailed });

        Utils.getFileFromBodyUri(attachment).then(function (file) {
            if (Jx.isNullOrUndefined(launcherOptions) && Utils.isEml(fileExtension)) {
                return file.openAsync(Windows.Storage.FileAccessMode.read)
                    .then(function (stream) {
                        Jx.EventManager.broadcast("openEml", [stream]);
                        return true;
                    });
            } else {
                launcherOptions = launcherOptions || new Windows.System.LauncherOptions();
                launcherOptions.desiredRemainingView = Utils.isSupportedPhotoOrVideoFormat(fileExtension) ?
                    Windows.UI.ViewManagement.ViewSizePreference.useLess : Windows.UI.ViewManagement.ViewSizePreference.useHalf;
                return Windows.System.Launcher.launchFileAsync(file, launcherOptions);
            }
        }).done(function (launched) {
            if (!launched) {
                Jx.log.error("Failed to open " + attachment.objectId + ": Windows launcher failed to launch");
                that._fireOpenFailedError(attachment);
            }
        }, function (err) {
            Jx.log.error("Failed to open " + attachment.objectId + ": " + err);
            that._fireOpenFailedError(attachment);
        });
    };

    proto._fireOpenFailedError = function (attachment) {
        /// <summary>Fires the openFailed error for the given attachment.</summary>
        /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
        Debug.assert(false, "Expected AttachmentWell.Base.ItemController._fireOpenFailedError() to be implemented by subclass");
    };

    proto.dispose = function () {
        /// <summary>Releases all resources and shuts down this component.</summary>
        if (this._contextMenu) {
            var contextMenuElement = /*@static_cast(HTMLElement)*/this._contextMenu.element;
            if (contextMenuElement) {
                // The context menu element was likely re-parented outside of our component, so make sure we remove it from the DOM.
                contextMenuElement.parentNode.removeChild(contextMenuElement);
            }
            this._contextMenu = null;
        }
        this._contextMenuCallbacks = null;
        this._itemInvokedCallbacks = null;
    };

    proto._contextMenu = /*@static_cast(WinJS.UI.Menu)*/null;
    proto._contextMenuCallbacks = /*@static_cast(Object)*/null;
    proto._itemInvokedCallbacks = /*@static_cast(Object)*/null;
})();
//
// Copyright (C) Microsoft. All rights reserved.
//

/*global AttachmentWell,Jx,document,Debug,WinJS,Windows,URL*/
/// <reference path="AttachmentWell.ref.js" />

(function () {

    var Templates = AttachmentWell.Templates,
        ThumbnailResizer = AttachmentWell.ThumbnailResizer,
        ThumbnailType = Windows.Storage.FileProperties.ThumbnailType,
        Utils = AttachmentWell.Utils;

    AttachmentWell.Base.Item = /*@constructor*/function (attachment, controller, host) {
        /// <summary>Base Attachment Item</summary>
        /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
        /// <param name="controller" type="AttachmentWell.Base.ItemController">Controls actions like context menu on an item.</param>
        this._controller = controller;
        this._attachment = attachment;
        this._host = host;
        this._currentStatus = this._getCurrentStatus();
        this._id = "idAttachmentItem_" + Jx.uid();
        this._disposed = false;
        this._animationPromise = null;
        this._ignoreItemInvokedEvent = false;

        this._attachmentChanged = this._onAttachmentChanged.bind(this);
        attachment.addEventListener("changed", this._attachmentChanged, false);

        this._buildItemContainer();
    };
    var proto = AttachmentWell.Base.Item.prototype;

    var _thumbnailWidth = Math.round(90 * 4 / 3); // Landscape-photo aspect ratio
    proto._thumbnailDimensions = {
        photoVideo: {
            height: 90,
            width: _thumbnailWidth,
            minWidth: 48,
            maxWidth: 1024
        },
        fileIcon: {
            height: 40,
            width: 40
        }
    };

    proto._setBasicProperties = function () {
        var attachment = this._attachment;
        return this._properties = {
            ariaLabel: attachment.fileName,
            fileExtension: Utils.getFileExtension(attachment),
            name: Utils.getFileName(attachment)
        };
    };

    proto._buildItemContainer = function () {
        var attachment = this._attachment;

        // host the item div that gets replaced when the attachment's status is updated.
        var itemWrapperDiv = this._itemWrapperDiv = document.createElement("div");
        itemWrapperDiv.setAttribute("aria-hidden", "true");
        itemWrapperDiv.className = "attachmentWell-item-wrapper";
        new WinJS.UI.Tooltip(itemWrapperDiv, { innerHTML: attachment.fileName, extraClass: "attachments-tooltip" });

        var itemContainerDiv = this._itemContainerDiv = document.createElement("div");
        itemContainerDiv.id = this._id;
        itemContainerDiv.tabIndex = -1;
        itemContainerDiv.setAttribute("role", "option");
        itemContainerDiv.appendChild(itemWrapperDiv);

        var itemContainer = new WinJS.UI.ItemContainer(itemContainerDiv);
        itemContainer.selectionDisabled = true;
        itemContainer.oninvoked = this._onItemInvoked.bind(this);

        this._contextMenuHandler = this._onContextMenu.bind(this);
        this._keydownHandler = this._onKeyDown.bind(this);
        this._holdVisualHandler = this._onMSHoldVisual.bind(this);
        itemContainerDiv.addEventListener("contextmenu", this._contextMenuHandler, false);
        itemContainerDiv.addEventListener("keydown", this._keydownHandler, false);
        itemContainerDiv.addEventListener("MSHoldVisual", this._holdVisualHandler, true);

        // Cap thumbnail width to its parent container's width. 
        var containerWidth = this._host.getContainerWidth();
        if (containerWidth > 0) {
            this._thumbnailDimensions.photoVideo.maxWidth = containerWidth;
        }

        this._updateItemDiv();
    };

    proto._onAttachmentChanged = function (ev) {
        /// <summary>Updates item rendering based on the changed status.</summary>
        /// <param name="ev" type="Object">Event arguments</param>
        var updatedStatus = this._getCurrentStatus();
        if (updatedStatus !== this._currentStatus) {
            Debug.assert(!Jx.isNullOrUndefined(ev.target), "AttachmentWell.Base.Item._onAttachmentChanged: ev.target is not valid");
            Jx.log.info("AttachmentWell.Base.Item._onAttachmentChanged: " + ev.target.objectId + " status changed from " + this._currentStatus + " to " + updatedStatus);
            this._currentStatus = updatedStatus;
            this._updateItemDiv();
        }
    };

    proto._updateItemDiv = function () {
        /// <summary>Updates item rendering div based on the current attachment status.</summary>
        var attachment = this._attachment,
            itemWrapperDiv = this._itemWrapperDiv,
            properties = this._setBasicProperties(),
            renderer = this._getItemRenderer(properties.fileExtension, this._currentStatus).render;  // get a renderering function based on file type and attachment status
        
        // render the item and replace the existing rendered div if there is one
        var that = this;
        renderer(attachment, properties).done(function (itemDiv) {
            if (!that._disposed) {
                if (itemWrapperDiv.hasChildNodes()) {
                    if (!Jx.isNullOrUndefined(that._animationPromise)) {
                        that._animationPromise.cancel();
                    }
                    Debug.assert(itemWrapperDiv.children.length === 1, "There should be only one rendered div inside ItemContainer.");
                    
                    // cross-fade the update itemDiv
                    var oldElement = itemWrapperDiv.firstChild;
                    oldElement.style.position = "absolute";

                    itemWrapperDiv.appendChild(itemDiv);
                    itemDiv.style.opacity = "0";

                    var removeOldChild = function () {
                        itemWrapperDiv.removeChild(oldElement);
                        itemDiv.style.opacity = "1";
                        that._animationPromise = null;
                    };
                    that._animationPromise = WinJS.UI.Animation.crossFade(itemDiv, oldElement);
                    that._animationPromise.done(removeOldChild /*success*/, removeOldChild /*error*/);
                } else {
                    itemWrapperDiv.appendChild(itemDiv);
                }

                // set image to be not draggable
                var img = itemDiv.querySelector("img");
                if (!Jx.isNullOrUndefined(img)) {
                    img.setAttribute("draggable", "false");
                }

                that._itemContainerDiv.setAttribute("aria-label", properties.ariaLabel);
            }
        });
    };

    proto.getItemContainer = function () {
        /// <summary>Gets the HTMLElement that hosts the ItemContainer control.</summary>
        return this._itemContainerDiv;
    };

    proto._onKeyDown = function (ev) {
        if (ev.key === "Spacebar") {
            this._onContextMenu(ev);
        }
    };

    proto._onMSHoldVisual = function (ev) {
        // By default ItemContainer disables firing context menu events if selection is
        // disabled. To get the event, we need to capture MSHoldVisual event before ItemContainer 
        // and stop its propagation. 
        ev.stopImmediatePropagation();
        this._ignoreItemInvokedEvent = true;
    };

    proto._onItemInvoked = function (ev) {
        // When doing a press-and-hold gesture with touch, ItemContainer would fire both 
        // context menu and item invoked events on us. In this case we want to ignore 
        // the item invoked event following the context menu event.
        if (!this._ignoreItemInvokedEvent) {
            this._controller.onItemInvoked(this._attachment, { itemDiv: this._itemContainerDiv });
        }
        this._ignoreItemInvokedEvent = false;
    };

    proto._onContextMenu = function (ev) {
        ev.preventDefault();
        this._controller.showContextMenu(this._attachment, { itemDiv: this._itemContainerDiv });
    };

    proto._getCurrentStatus = function () {
        /// <summary>Returns the current status of the attachment.</summary>
        Debug.assert(false, "Expected AttachmentWell.Base.Item._getCurrentStatus() to be implemented by subclass.");
    };

    proto._getItemRenderer = function (fileExtension, status) {
        /// <summary>Returns a rendering function based on the given file type and attachment status</summary>
        Debug.assert(false, "Expected AttachmentWell.Base.Controller._getItemRenderer() to be implemented by subclass");
    };

    proto.dispose = function () {
        this._disposed = true;

        if (this._animationPromise) {
            this._animationPromise.cancel();
        }

        this._itemContainerDiv.removeEventListener("keydown", this._keydownHandler, false);
        this._itemContainerDiv.removeEventListener("contextmenu", this._contextMenuHandler, false);
        this._itemContainerDiv.removeEventListener("MSHoldVisual", this._holdVisualHandler, true);
        this._itemContainerDiv = null;

        if (this._itemWrapperDiv.winControl instanceof WinJS.UI.Tooltip) {
            this._itemWrapperDiv.winControl.innerHTML = "";
            this._itemWrapperDiv.winControl = null;
        }
        this._itemWrapperDiv = null;

        this._attachment.removeEventListener("changed", this._attachmentChanged, false);
        this._attachment = null;
    };

    proto._renderWithTemplate = function (template, properties) {
        /// <summary>Renders a HTMLElement using the given template and set properties.</summary>
        /// <param name="template" type="Function">The template to call.</param>
        /// <param name="properties" type="AttachmentWell.Base.TemplateProperties">The item properties to be rendered.</param>
        /// <returns type="HTMLElement">HTMLElement rendered by the given template and properties.</returns>
        Debug.assert(Jx.isFunction(template), "Expected template to be a valid function");
        Debug.assert(Jx.isObject(properties), "Expected properties to be a valid object");
        Debug.assert(properties.ariaLabel, "ARIA label is not set by renderer.");
        var templateDiv = document.createElement("div");
        templateDiv.innerHTML = template.call(this, properties);
        return templateDiv.firstChild;
    };

    proto._photoItemRenderer = {
        /// <summary>Renders photo items that are done syncing or attaching.</summary>
        canRender: function (fileExtension, status, statusEnums) {
            /// <param name="fileExtension" type="String">The file extension of the attachment.</param>
            /// <param name="status" type="Number">The compose or sync status of the mail attachment.</param>
            /// <param name="statusEnums" type="Object">The sync or compose status enums to compare with.</param>
            /// <returns type="Boolean">true if it can render the given item and false otherwise.</returns>
            return status === statusEnums.done && Utils.isSupportedPhotoFormat(fileExtension);
        },
        render: function (attachment, properties) {
            /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
            /// <param name="properties" type="AttachmentWell.Base.TemplateProperties">The item properties to be rendered.</param>
            /// <returns type="HTMLElement">HTMLElement that contains a thumbnail image of the given photo attachment 
            /// or a placeholder if a thumbnail cannot be obtained.</returns>
            var that = this;
            properties.command = "openCommand";
            return ThumbnailResizer.getThumbnail(attachment, Utils.FileCategory.photo, this._thumbnailDimensions).then(function (thumbnailStream) {
                return that._renderPhotoVideoItem(attachment, thumbnailStream, Templates.photoItem, properties);
            });
        }.bind(proto)
    };

    proto._videoItemRenderer = {
        /// <summary>Renders video items that are done syncing or attaching.</summary>
        canRender: function (fileExtension, status, statusEnums) {
            /// <param name="fileExtension" type="String">The file extension of the attachment.</param>
            /// <param name="status" type="Number">The compose or sync status of the mail attachment.</param>
            /// <param name="statusEnums" type="Object">The sync or compose status enums to compare with.</param>
            /// <returns type="Boolean">true if it can render the given item and false otherwise.</returns>
            return status === statusEnums.done && Utils.isSupportedVideoFormat(fileExtension);
        },
        render: function (attachment, properties) {
            /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
            /// <param name="properties" type="AttachmentWell.Base.TemplateProperties">The item properties to be rendered.</param>
            /// <returns type="HTMLElement">HTMLElement that contains a thumbnail image of the given video attachment 
            /// or a placeholder if a thumbnail cannot be obtained.</returns>
            var that = this;
            properties.command = "openCommand";
            return ThumbnailResizer.getThumbnail(attachment, Utils.FileCategory.video, this._thumbnailDimensions).then(function (thumbnailStream) {
                return that._renderPhotoVideoItem(attachment, thumbnailStream, Templates.videoItem, properties);
            });
        }.bind(proto)
    };

    proto._otherItemRenderer = {
        /// <summary>Renders other items that are done syncing or attaching.</summary>
        canRender: function (fileExtension, status, statusEnums) {
            /// <param name="fileExtension" type="String">The file extension of the attachment.</param>
            /// <param name="status" type="Number">The compose or sync status of the mail attachment.</param>
            /// <param name="statusEnums" type="Object">The sync or compose status enums to compare with.</param>
            /// <returns type="Boolean">true if it can render the given item and false otherwise.</returns>
            return status === statusEnums.done && !Utils.isSupportedPhotoOrVideoFormat(fileExtension);
        },
        render: function (attachment, properties) {
            /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
            /// <param name="properties" type="AttachmentWell.Base.TemplateProperties">The item properties to be rendered.</param>
            /// <returns type="HTMLElement">HTMLElement that contains a file icon and file description of the given non-photo/video attachment</returns>
            Debug.assert(Jx.isString(properties.fileExtension), "AttachmentWell.Base.Item._otherItemRenderer: File extension is not set on properties");
            var promise = Utils.isEml(properties.fileExtension) ? WinJS.Promise.wrap() : ThumbnailResizer.getThumbnail(attachment, Utils.FileCategory.others, this._thumbnailDimensions);
            var that = this;
            return promise.then(function (thumbnailStream) {
                return that._renderFileIconItem(attachment, thumbnailStream, Templates.otherItem, properties, "openCommand");
            });
        }.bind(proto)
    };

    proto._renderPhotoVideoItem = function (attachment, thumbnailStream, template, properties) {
        /// <summary>Renders a photo or video item with the given thumbnail stream and resizes the result to the desired display size.</summary>
        /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
        /// <param name="properties" type="AttachmentWell.Base.TemplateProperties">The item properties to be rendered.</param>
        /// <returns type="HTMLElement">HTMLElement that contains a thumbnail image of the given photo or video attachment</returns>
        Debug.assert(Jx.isNonEmptyString(properties.command), "AttachmentWell.Base.Item._renderPhotoVideoItem: properties.command needs to be set to an non-empty string");
        properties.fileSize = Utils.getFileSize(attachment);
        properties.ariaLabel = Jx.res.loadCompoundString("label", properties.name, properties.fileSize, Jx.res.getString(properties.command));
        if (!thumbnailStream) {
            // we failed to get a thumbnail, return error renderer
            Jx.log.info("AttachmentWell.Base.Item._renderPhotoVideoItem: failed to get thumbnailStream from file");
            return this._renderWithTemplate(Templates.photoVideoItemPlaceholder, properties);
        } else if (thumbnailStream.type === ThumbnailType.icon) {
            // the thumbnail stream we got back is of type icon, return the fallback file icon renderer
            return this._renderFileIconItem(attachment, thumbnailStream, Templates.otherItem, properties, properties.command);
        } else {
            // able to get an image thumbnail, return photo/video renderer
            properties.thumbnailUrl = URL.createObjectURL(thumbnailStream, { oneTimeOnly: true });
            var div = this._renderWithTemplate(template, properties);

            // Resize thumbnail to fit into our desired display dimensions
            var desiredSize = ThumbnailResizer.calcDesiredDisplaySize(thumbnailStream, this._thumbnailDimensions.photoVideo);
            ThumbnailResizer.scaleAndCenter(div.querySelector("img"), thumbnailStream.originalWidth, thumbnailStream.originalHeight, desiredSize.width, desiredSize.height, /*stretchToFill:*/true);
            return div;
        }
    };

    proto._renderFileIconItem = function (attachment, thumbnailStream, template, properties, command) {
        /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
        /// <param name="properties" type="AttachmentWell.Base.TemplateProperties">The item properties to be rendered.</param>
        /// <returns type="HTMLElement">HTMLElement that contains a file icon and file description for the given attachment.</returns>
        Debug.assert(!Jx.isNullOrUndefined(properties.fileExtension), "AttachmentWell.Base.Item._renderFileIconItem: File extension is not set on properties");
        if (thumbnailStream) {
            properties.fileIconUrl = URL.createObjectURL(thumbnailStream, { oneTimeOnly: true });
        }
        properties.isEml = properties.fileExtension === ".eml";
        properties.fileIconHeight = this._thumbnailDimensions.fileIcon.height;
        properties.fileIconWidth = this._thumbnailDimensions.fileIcon.width;
        properties.commandLabel = Jx.res.getString(command);
        properties.fileSize = Utils.getFileSize(attachment);
        properties.ariaLabel = Jx.res.loadCompoundString("label", properties.name, properties.fileSize, properties.commandLabel);
        return this._renderWithTemplate(template, properties);
    };

    proto._itemRenderers = /*@static_cast(Array)*/null;
})();

//
// Copyright (C) Microsoft. All rights reserved.
//
// Renders the view of the attachment well.
//

/*global AttachmentWell,Jx,Debug,document,WinJS,Microsoft*/

(function () {

    var Utils = AttachmentWell.Utils,
        Animation = WinJS.UI.Animation;

    AttachmentWell.Base.ViewLayout = /*@constructor*/function (mailMessage, neighborElement) {
        /// <param name="mailMessage" type="Microsoft.WindowsLive.Platform.IMailMessage">The mail message to show attachments for.</param>
        /// <param name="neighborElement" type="HTMLElement" optional="true">The neighboring element that gets affected when we expand/collapse the view.</param>
        /// <summary>Renders the view of the attachment well.</summary>
        this.initComponent();
        this._id = "idAttachmentWellView_" + Jx.uid();
        this._mailMessage = mailMessage;
        this._attachmentCollection = mailMessage.getOrdinaryAttachmentCollection();
        Debug.assert(this._attachmentCollection, "Expecting at least an empty collection");

        this._containerWidth = 0;
        this._attachmentItems = {};
        this._neighborElement = neighborElement;

        // bind listeners
        this._elementResize = this._onElementResize.bind(this);
        this._attachmentCollectionChanged = this._onAttachmentCollectionChanged.bind(this);
        this._onClearError = this.onClearError.bind(this);
        this._onError = this.onError.bind(this);

        // append child components
        this._filesAttachedControl = new AttachmentWell.FilesAttachedControl();
        this._errorManager = new AttachmentWell.ErrorManager();
        this.append(this._filesAttachedControl, this._errorManager);
    };

    Jx.augment(AttachmentWell.Base.ViewLayout, Jx.Component);

    var proto = AttachmentWell.Base.ViewLayout.prototype;

    proto.getUI = function (ui) {
        ui.html =
            '<div id="' + this._id + '" class="attachmentWell-view">' +
                Jx.getUI(this._errorManager).html +
                '<div class="attachmentWell-controls">' + Jx.getUI(this._filesAttachedControl).html + '</div>' +
                '<div class="attachmentWell-repeater" role="listbox"></div>' +
                this._contextMenuUI() +
            '</div>';
    };

    proto._contextMenuUI = function () {
        return '<div class="attachments-contextMenu" aria-hidden="true" data-win-control="WinJS.UI.Menu" data-win-res="aria-label:attachmentContextMenuLabel">' +
                    '<button data-win-control="WinJS.UI.MenuCommand" data-win-options="{id:\'openCommand\'}" data-win-res="innerText:openCommand;aria-label:openCommand" type="button"></button>' +
                    '<button data-win-control="WinJS.UI.MenuCommand" data-win-options="{id:\'openInMailCommand\'}" data-win-res="innerText:openWithMailCommand;aria-label:openWithMailCommand" type="button"></button>' +
                    '<button data-win-control="WinJS.UI.MenuCommand" data-win-options="{id:\'openWithCommand\'}" data-win-res="innerText:openWithCommand;aria-label:openWithCommand" type="button"></button>' +
                    '<button data-win-control="WinJS.UI.MenuCommand" data-win-options="{id:\'removeCommand\'}" data-win-res="innerText:removeCommand;aria-label:removeCommand" type="button"></button>' +
                    '<button data-win-control="WinJS.UI.MenuCommand" data-win-options="{id:\'saveCommand\'}" data-win-res="innerText:saveCommand;aria-label:saveCommand" type="button"></button>' +
                '</div>';
    };

    proto.activateUI = function () {
        Jx.Component.prototype.activateUI.call(this);
        this.getElement().addEventListener("mselementresize", this._elementResize, false);
    };

    proto._onElementResize = function () {
        this._containerWidth = parseInt(getComputedStyle(this.getElement()).width, 10);
        
        if (Jx.isNullOrUndefined(this._repeater) && this._containerWidth > 0) {
            // activate UI if we know the container width
            var element = this.getElement(),
            repeaterElement = element.querySelector(".attachmentWell-repeater");
            this._controller = this._createController();

            // attach listeners
            this._attachmentCollection.addEventListener("collectionchanged", this._attachmentCollectionChanged);
            this.on("clearerror", this._onClearError, this);
            this.on("error", this._onError, this);

            // Build Repeater
            this._repeater = new WinJS.UI.Repeater(repeaterElement, {
                data: this._getSortedBindingList(),
                template: this._getItemTemplate.bind(this)
            });
            this._keyboardNavigation = new Jx.KeyboardNavigation(repeaterElement, "horizontal");
            this._updateCount();

            // unlock to listen for changes
            this._attachmentCollection.unlock();
        }
    };

    proto._getItemTemplate = function (objectId) {
        /// <summary>Gets an HTMLElement that represents the corresponding attachment</summary>
        /// <param name="objectId" type="String">An id that represents the corresponding attachment object.</param>
        var attachment = this._mailMessage.loadAttachment(objectId),
            item = this._createAttachmentItem(attachment);
        this._attachmentItems[objectId] = item;
        return item.getItemContainer();
    };

    proto._createAttachmentItem = function (attachment) {
        /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
        Debug.assert(false, "Expected AttachmentWell.Base.ViewLayout._createAttachmentItem to be implemented by subclass");
    };

    proto._createController = function () {
        Debug.assert(false, "Expected AttachmentWell.Base.ViewLayout._createController to be implemented by subclass");
    };

    proto._getSortedBindingList = function () {
        var attachmentCollection = this._attachmentCollection,
            mailMessage = this._mailMessage,
            list = new WinJS.Binding.List();

        for (var i = 0, len = attachmentCollection.count; i < len; i++) {
            var attachment = attachmentCollection.item(i);
            list.push(attachment.objectId);
        }

        var getGroupKey = function (itemId) {
            var itemAttachment = mailMessage.loadAttachment(itemId),
                fileExtension = Utils.getFileExtension(itemAttachment);
            if (Utils.isSupportedPhotoOrVideoFormat(fileExtension)) {
                return "photoVideo";
            } else {
                return "others";
            }
        };

        var compareGroups = function (first, second) {
            var groups = AttachmentWell.Utils.GroupOrdering;
            Debug.assert(groups[first] !== undefined && groups[second] !== undefined, "Unexpected group key passed.");
            return groups[first] - groups[second];
        };

        return list.createGrouped(getGroupKey, getGroupKey, compareGroups);
    };

    proto._onAttachmentCollectionChanged = function (eventArgs) {
        /// <summary>Responds to attachment collection changed event notifications</summary>
        /// <param name="eventArgs" type="Microsoft.WindowsLive.Platform.CollectionChangedEventArgs">Event arguments</param>
        Debug.assert(eventArgs);
        var objectId = eventArgs.objectId;

        var changeType = Microsoft.WindowsLive.Platform.CollectionChangeType;
        switch (eventArgs.eType) {
            case changeType.itemAdded:
                this._addAttachment(objectId);
                break;
            case changeType.itemRemoved:
                this._removeAttachment(objectId);
                break;
            case changeType.reset:
                // The attachment collection we have is somehow corrupted, need to get a new one from platform
                this._resetAttachmentCollection();
                break;
        }
        this._updateCount();
        this._keyboardNavigation.update(true /*reset*/);
    };

    proto._updateCount = function () {
        // Update the count and show/hide the well depending on if there are attachments to show
        var count = this._attachmentCollection.count;
        this.isHidden = count === 0;
        this._filesAttachedControl.updateCount(count);
    };

    proto._addAttachment = function (objectId) {
        /// <param name="objectId" type="String">An id that represents the corresponding attachment object.</param>
        // adds the item to the repeater
        Jx.log.info("AttachmentWell.Base.ViewLayout._addAttachment: " + objectId);
        this._repeater.data.push(objectId);
    
        // create addToList animation
        var addedElement = this._getRepeaterItem(objectId),
            affectedItems = this._getAffectedRepeaterItems(objectId),
            animation = Animation.createAddToListAnimation(addedElement, affectedItems);
        animation.execute();
    };

    proto._removeAttachment = function (objectId) {
        /// <param name="objectId" type="String">An id that represents the corresponding attachment object.</param>
        Jx.log.info("AttachmentWell.Base.ViewLayout._removeAttachment: " + objectId);
        var repeater = this._repeater,
            repeaterData = repeater.data,
            removedIndex = repeaterData.indexOf(objectId);

        // Create deleteFromList animation
        var removedElement = this._getRepeaterItem(objectId),
            affectedItems = this._getAffectedRepeaterItems(objectId),
            animation = Animation.createDeleteFromListAnimation(removedElement, affectedItems);

        // Remove from repeater
        repeaterData.splice(removedIndex, 1);

        // Execute animation
        animation.execute();

        // Update focus
        if (repeaterData.length > 0) {
            // If the item removed is the first item, set focus to the next item, else to the previous item.
            var nextIndex = removedIndex === 0 ? removedIndex : removedIndex - 1,
                nextItem = repeater.elementFromIndex(nextIndex);
            Jx.safeSetActive(nextItem);
        }

        // dispose the item
        var item = this._attachmentItems[objectId];
        Debug.assert(item, "Can not find the deleted attachment item in our list");
        item.dispose();
        delete this._attachmentItems[objectId];
    };

    proto._getRepeaterItem = function (objectId) {
        var repeaterData = this._repeater.data,
            index = repeaterData.indexOf(objectId);
        Debug.assert(index >= 0, "AttachmentWell.Base.ViewLayout._getRepeaterItem: Cannot find the given objectId=" + objectId + " in repeater's data list");
        return this._repeater.elementFromIndex(index);
    };

    proto._getAffectedRepeaterItems = function (objectId) {
        var repeaterData = this._repeater.data,
            actionIndex = repeaterData.indexOf(objectId),
            affectedItems = [];
        Debug.assert(actionIndex >= 0, "AttachmentWell.Base.ViewLayout._getAffectedItems: given objectId does not exit in the repeater data");

        for (var i = actionIndex + 1; i < repeaterData.length; i++) {
            affectedItems.push(this._repeater.elementFromIndex(i));
        }
        return affectedItems;
    };

    proto._resetAttachmentCollection = function () {
        // dispose current item elements
        Jx.log.info("AttachmentWell.Base.ViewLayout._resetAttachmentCollection");
        this._disposeAttachmentItems();

        // update collection
        this._removeCollectionListener();
        this._attachmentCollection = this._mailMessage.getOrdinaryAttachmentCollection();
        this._attachmentCollection.addEventListener("collectionchanged", this._attachmentCollectionChanged);
        this._attachmentCollection.unlock();

        // ask the repeater to build upon the new collection
        this._repeater.data = this._getSortedBindingList();
    };

    proto.deactivateUI = function () {
        this._element.removeEventListener("mselementresize", this._elementResize, false);

        if (this._repeater) {
            this._removeCollectionListener();
            this._disposeAttachmentItems();

            this._controller.dispose();
            this._controller = null;

            this._repeater.dispose();
            this._repeater = null;

            this._keyboardNavigation.dispose();
            this._keyboardNavigation = null;

            this.detach("clearerror", this._onClearError, this);
            this.detach("error", this._onError, this);

            Jx.Component.prototype.deactivateUI.call(this);
        }
    };

    proto._removeCollectionListener = function () {
        var collection = this._attachmentCollection;
        collection.lock();
        collection.removeEventListener("collectionchanged", this._attachmentCollectionChanged);
    };

    proto._disposeAttachmentItems = function () {
        var items = this._attachmentItems;
        Object.keys(items).forEach(function (objectId) {
            items[objectId].dispose();
        }, this);
        this._attachmentItems = {};
    };

    proto.getElement = function () {
        if (!this._element) {
            this._element = document.getElementById(this._id);
        }
        return this._element;
    };

    proto.getContainerWidth = function () {
        Debug.assert(this._containerWidth > 0);
        return this._containerWidth;
    };
    
    Object.defineProperty(proto, "isCollapsed", {
        get: function () { return Jx.hasClass(this._repeater.element, "hidden"); },
        set: function (collapsed) {
            Jx.log.info("AttachmentWell.Base.ViewLayout.isCollapsed: " + collapsed);
            var repeaterElement = this._repeater.element,
                animation = this._collapsed ?
                    WinJS.UI.Animation.createCollapseAnimation(repeaterElement, this._neighborElement) : WinJS.UI.Animation.createExpandAnimation(repeaterElement, this._neighborElement);

            // execute expand/collapse animation
            Jx.setClass(repeaterElement, "hidden", collapsed);
            animation.execute();
        },
        enumerable: true
    });

    Object.defineProperty(proto, "isHidden", {
        get: function () { return Jx.hasClass(this._element, "hidden"); },
        set: function (hide) {
            Jx.log.info("AttachmentWell.Base.ViewLayout.isHidden: " + hide);
            Jx.setClass(this._element, "hidden", hide);
        },
        enumerable: true
    });

    proto.onClearError = function (evt) {
        /// <summary>Handles the clearerror event.</summary>
        /// <param name="evt" type="JxEvent">Contains metadata about the convert event.</param>
        Debug.assert(Jx.isNonEmptyString(evt.data.errorId), "Expected valid error ID");
        if (this._errorManager.clearError(evt.data.errorId)) {
            // The event has been handled, so no need to bubble it anymore.
            evt.cancel = true;
        }
    };

    proto.onError = function (evt) {
        /// <summary>Handles the error event.</summary>
        /// <param name="evt" type="JxEvent">Contains metadata about the convert event.</param>
        Debug.assert(evt.data.error, "Expected valid error");
        if (this._errorManager.showError(evt.data.error)) {
            // The event has been handled, so no need to bubble it anymore.
            evt.cancel = true;
        }
    };

    proto._id = /*@static_cast(String)*/null;
    proto._mailMessage = /*static_cast(Microsoft.WindowsLive.Platform.IMailMessage)*/null;
    proto._element = /*@static_cast(HTMLElement)*/null;
    proto._attachmentCollection = null;
    proto._attachmentCollectionChanged = /*static_cast(Function)*/null;
    proto._repeater = /*@static_cast(WinJS.UI.Repeater)*/null;
})();

//
// Copyright (C) Microsoft. All rights reserved.
//
// A component that encapsulates all compose attachment UX.
//

/*global AttachmentWell,Jx,Debug,document,AttachmentWell,Microsoft*/

/// <reference path="..\..\Photomail\JS\AttachmentManager.js" />

(function () {

    AttachmentWell.Compose.ActivationType = {
        compose: 0,
        shareAnything: 1
    };

    AttachmentWell.Compose.AttachmentTypeBici = {
        skyDrive: 0,
        convertedToAttachment: 1,
        attachment: 2,
        convertedToSkyDrive: 3
    };

    AttachmentWell.Compose.Module = /*@constructor*/function (mailManager, mailMessage, neighborElement) {
        /// <summary>A component that encapsulates all compose attachment UX.</summary>
        /// <param name="mailManager" type="Microsoft.WindowsLive.Platform.IMailManager">The mail manager.</param>
        /// <param name="mailMessage" type="Microsoft.WindowsLive.Platform.IMailMessage">The mail message to show attachments for.</param>
        /// <param name="neighborElement" type="HTMLElement" optional="true">The neighboring element that gets affected when we expand/collapse the well.</param>
        Debug.assert(Jx.isObject(mailManager), "Expected mailManager to be a valid object");
        Debug.assert(Jx.isObject(mailMessage), "Expected mailMessage to be a valid object");

        AttachmentWell.Base.Module.call(this);
        this._activationType = AttachmentWell.Compose.ActivationType.compose;

        this._removeFileHandler = this._onRemoveFile.bind(this);
        this._onClearError = this._onClearError.bind(this);
        this._onError = this._onError.bind(this);

        this._view = this._getViewLayout(mailMessage, neighborElement);
        this._attachmentManager = new AttachmentWell.AttachmentManager(mailManager, mailMessage);
        this.append(this._attachmentManager, this._view);
    };
    Jx.inherit(AttachmentWell.Compose.Module, AttachmentWell.Base.Module);

    var proto = AttachmentWell.Compose.Module.prototype;

    proto._getViewLayout = function (mailMessage, neighborElement) {
        /// <param name="mailMessage" type="Microsoft.WindowsLive.Platform.IMailMessage">The mail message to show attachments for.</param>
        return new AttachmentWell.Compose.ViewLayout(mailMessage, neighborElement);
    };

    proto.activateUI = function () {
        Jx.Component.prototype.activateUI.call(this);
        this._element = document.getElementById(this._id);
        this._element.addEventListener("removeFile", this._removeFileHandler, false);

        this.on("clearerror", this._onClearError, this);
        this.on("error", this._onError, this);

        this._attachmentManager.activate();
    };

    proto.deactivateUI = function () {
        this.detach("clearerror", this._onClearError, this);
        this.detach("error", this._onError, this);
        this._element.removeEventListener("removeFile", this._removeFileHandler, false);
        this._attachmentManager.shutdown();
        Jx.Component.prototype.deactivateUI.call(this);
    };

    proto.discard = function () {
        /// <summary>Discards any pending attachments in the current message</summary>
        // Before we discard attachments, shutdown the attachment UI to remove UI
        // This is faster than the component getting a bunch of itemRemoved notification that removes item one by one
        var view = this._view;
        if (view && view.isInit()) {
            view.shutdownUI();
        }

        this._attachmentManager.discard();
    };

    proto._onRemoveFile = function (ev) {
        /// <summary>removeFile event hanlder.</summary>
        /// <param name="ev" type="Event">
        /// ev.detail: {
        ///     objectId: String // objectId of the attachment that needs to be removed
        /// }
        /// </param>
        var objectId = ev.detail.objectId,
            fileName = ev.detail.fileName;
        Debug.assert(Jx.isNonEmptyString(objectId) && Jx.isNonEmptyString(fileName), "Expected ev.detail.objectId and fileName to be non-empty Strings");
        Jx.log.info("AttachmentWell.Compose.Module._onRemoveFile");
        this._attachmentManager.removeFile(objectId);
    };

    proto.add = function (files) {
        /// <summary>Adds the given files to the current mail message.</summary>
        /// <param name="files" type="Array">Files to add to the mail message.</param>
        Debug.assert(Jx.isObject(files), "Expected files to be a valid object");
        Jx.log.info("AttachmentWell.Compose.Module.add: adding " + files.length + " file(s)");
        this._attachmentManager.addFiles(files);
    };

    proto.getMetrics = function () {
        return this._attachmentManager.getAttachmentMetrics();
    };

    proto.finalizeForSend = function () {
        /// <summary>Finalize for sending the message, including any instrumentation reporting etc.</summary>
        // Report instrumentation
        try {
            var attachmentMetrics = this._attachmentManager.getAttachmentMetrics();
            // If there are any attachments in the message, then capture the instrumentation for it.
            if (attachmentMetrics.count > 0) {
                var attachmentType = AttachmentWell.Compose.AttachmentTypeBici.attachment,
                    mailType = 1; // Basic attachments

                Jx.bici.addToStream(Microsoft.WindowsLive.Instrumentation.Ids.Mail.sendMailWithAttachment,
                    mailType,    // MailType
                    attachmentMetrics.totalSize, // PhotosAttachmentSize in KBs
                    attachmentType, // AttachmentConversion
                    attachmentMetrics.count, // PhotosAppSentFileCount
                    attachmentMetrics.validateFailures, // TimesSendReclicked
                    0, // SkyDriveFileSize, 0 for basic attachments
                    0, // SkyDrivePermissions, 0 for basic attachments
                    attachmentMetrics.category, // ContentType
                    attachmentMetrics.count  // PhotosAppAttachments
                    );

                Jx.bici.addToStream(Microsoft.WindowsLive.Instrumentation.Ids.Mail.sendButtonActive,
                    this._activationType, // PhotosMailExperience (MoMail/Share)
                    mailType, // MailType
                    attachmentMetrics.count, // PhotosAppSentFileCount
                    attachmentMetrics.duration // TimeTakenForButtonActivation
                    );
            }
        } catch (ex) {
            // Failure to report instrumentation should not prevent sending the mail, so just log and move on
            Jx.log.error("AttachmentWell - Failed to report instrumentation " + ex);
        }
        this._attachmentManager.finalizeForSend();
    };

    proto.canAddMore = function (newCount) {
        /// <summary>Checks if specified number of attachments can be added</summary>
        /// <param name="newCount" type="Number">Number of new attachments to be added</param>
        /// <returns type="Boolean">Returns true if specified number of attachments can be added</returns>
        Debug.assert(this._attachmentManager);
        return this._attachmentManager.canAddMore(newCount);
    };

    proto.isAttaching = function () {
        /// <summary>Returns true if any attaching is in progress.</summary>
        /// <returns type="Boolean">Returns true if any file is being attached.</returns>
        return this._attachmentManager.isAttaching();
    };

    proto.validate = function () {
        /// <summary>Returns true if all files have successfully been attached.</summary>
        /// <returns type="Boolean">Returns false if any files are still attaching or there are any failures in the attaching.</returns>
        return this._attachmentManager.canSendMail();
    };

    proto.focus = function () {
        /// <summary>Sets the focus on the first attachement if there is one.</summary>
        this._view.focusFirst();
    };

    proto.isHidden = function () {
        /// <summary>Returns true if the view is not visible.</summary>
        return this._view.isHidden;
    };

    Object.defineProperty(proto, "isDirty", {
        get: function () {
            return this._attachmentManager.isDirty();
        },
        enumarable: true
    });

    proto._onClearError = function (evt) {
        /// <summary>Handles the clearerror event.</summary>
        /// <param name="evt" type="JxEvent">Contains metadata about the convert event.</param>
        this._view.onClearError(evt);
    };

    proto._onError = function (evt) {
        /// <summary>Handles the error event.</summary>
        /// <param name="evt" type="JxEvent">Contains metadata about the convert event.</param>
        this._view.onError(evt);
    };

    proto._element = /*@static_cast(HTMLElement)*/null;
    proto._attachmentManager = /*@static_cast(AttachmentWell.AttachmentManager)*/null;
    proto._removeFileHandler = /*@static_cast(Function)*/null;
})();

//
// Copyright (C) Microsoft. All rights reserved.
//
// Compose controller that controls an individual attachment item actions.
//

/*global AttachmentWell,Jx,Microsoft,Windows,document,Mail,Debug*/

/// <reference path="AttachmentWellBaseItemController.js" />

(function () {
    var AttachmentComposeStatus = Microsoft.WindowsLive.Platform.AttachmentComposeStatus;

    AttachmentWell.Compose.ItemController = /*@constructor*/function (view) {
        /// <summary>Controls an individual attachment item actions</summar>
        /// <param name="view" type="AttachmentWell.Base.ViewLayout">View that hosts the items this controller controls.</param>
        AttachmentWell.Base.ItemController.call(this, view);
    };

    Jx.inherit(AttachmentWell.Compose.ItemController, AttachmentWell.Base.ItemController);

    var proto = AttachmentWell.Compose.ItemController.prototype;

    proto._createContextMenuCallbacks = function () {
        /// <returns type="Object">A mapping from attachment status to an array of context menu callbacks.</returns>
        var contextMenuCallbacks = {},
            openCallback = {
                commandId: "openCommand",
                invoke: this._open.bind(this),
                isEnabled: this._disableForEml
            },
            removeCallback = {
                commandId: "removeCommand",
                invoke: this._remove.bind(this),
                isEnabled: this._alwaysEnable
            },
            openInMailCallback = {
                commandId: "openInMailCommand",
                invoke: this._open.bind(this),
                isEnabled: this._enableForEml
            },
            openWithCallback = {
                commandId: "openWithCommand",
                invoke: this._openWith.bind(this),
                isEnabled: this._alwaysEnable
            };
       
        contextMenuCallbacks[AttachmentComposeStatus.done] = [openInMailCallback, openCallback, openWithCallback, removeCallback];
        return contextMenuCallbacks;
    };

    proto._createItemInvokedCallbacks = function () {
        /// <returns type="Object">A mapping from attachment status to item invoked callback.</returns>
        var removeCallback = this._remove.bind(this),
            itemInvokedCallbacks = {};
        itemInvokedCallbacks[AttachmentComposeStatus.failed] = removeCallback;
        return itemInvokedCallbacks;
    };

    proto._getAttachmentStatus = function (attachment) {
        /// <summary>Returns the compose status of the given attachment.</summary>
        /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
        var status = attachment.composeStatus;
        Debug.assert(Jx.isNumber(status), "Expected status to be a number");
        return status;
    };

    proto._getFlyoutContainerElement = function () {
        /// <summary>Returns the parent element for flyouts.</summary>
        /// <returns type="HTMLElement">The parent element for flyouts.</returns>
        // We can't use the compose root element because of its z-index, so we use the mail root element just as the 
        //  ReadController does
        return document.getElementById(Mail.CompApp.rootElementId);
    };

    proto._remove = function (attachment, options) {
        /// <summary>Removes an attachment.</summary>
        /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object to remove.</param>
        /// <param name="options" type="Object">Object contains the itemDiv to remove.</param>
        Jx.log.info("AttachmentWell.Compose.ItemController._remove");
        Debug.assert(options && Jx.isHTMLElement(options.itemDiv), "AttachmentWell.Compose.ItemController._remove: given options parameter does not have itemDiv set");

        // In case the last open attempt caused an error, clear the error.
        this._view.fire("clearerror", { errorId: AttachmentWell.ErrorIds.openFailed });

        var itemDiv = options.itemDiv,
            evt = document.createEvent("CustomEvent");
        evt.initCustomEvent("removeFile", true, false, { objectId: attachment.objectId, fileName: attachment.fileName });
        itemDiv.dispatchEvent(evt);
    };

    proto._fireOpenFailedError = function (attachment) {
        /// <summary>Fires the openFailed error for the given attachment.</summary>
        /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
        var openFailedError = new AttachmentWell.Error(AttachmentWell.ErrorIds.openFailed, Jx.res.getString("composeOpenFailedErrorMessage"));
        this._view.fire("error", { error: openFailedError });
    };
})();
//
// Copyright (C) Microsoft. All rights reserved.
//

/*global AttachmentWell,Jx,Microsoft,Debug,WinJS*/

/// <reference path="AttachmentWell.ref.js" />
/// <reference path="AttachmentWellComposeItemController.js" />

(function () {

    var AttachmentComposeStatus = Microsoft.WindowsLive.Platform.AttachmentComposeStatus,
        Templates = AttachmentWell.Templates;

    AttachmentWell.Compose.Item = /*@constructor*/function (attachment, controller, host) {
        /// <summary>Compose Item.</summary>
        /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
        this._itemRenderers = [
            this._otherItemRenderer,
            this._photoItemRenderer,
            this._videoItemRenderer,
            this._inProgressItemRenderer,
            this._failedItemRenderer
        ];

        AttachmentWell.Base.Item.call(this, attachment, controller, host);
    };

    Jx.inherit(AttachmentWell.Compose.Item, AttachmentWell.Base.Item);

    var proto = AttachmentWell.Compose.Item.prototype;

    proto._getCurrentStatus = function () {
        /// <summary>Returns the current composing status of the attachment.</summary>
        /// <returns type="Microsoft.WindowsLive.Platform.AttachmentComposeStatus"></returns>
        return this._attachment.composeStatus;
    };

    proto._getItemRenderer = function (fileExtension, status) {
        /// <summary>Returns a rendering function based on the given file type and attachment status</summary>
        var found = this._itemRenderers.filter(function (current) {
            return current.canRender(fileExtension, status, Microsoft.WindowsLive.Platform.AttachmentComposeStatus);
        });
        Debug.assert(found.length === 1, "There should be one and only one render found.");
        return found[0];
    };

    proto._inProgressItemRenderer = {
        /// <summary>Renders items that are in the progress of getting attached.</summary>
        canRender: function (fileExtension, composeStatus) {
            /// <param name="fileExtension" type="String">The file extension of the attachment.</param>
            /// <param name="composeStatus" type="Microsoft.WindowsLive.Platform.AttachmentComposeStatus">The compose status of the mail attachment.</param>
            /// <returns type="Boolean">true if it can render the given item and false otherwise.</returns>
            return composeStatus === AttachmentComposeStatus.inProgress;
        },
        render: function (attachment, properties) {
            /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
            /// <param name="properties" type="AttachmentWell.Base.TemplateProperties">The item properties to be rendered.</param>
            /// <returns type="HTMLElement">HTMLElement that indicates that the item is still in the progress of attaching.</returns>
            properties.commandLabel = Jx.res.getString("removeCommand");
            properties.ariaLabel = Jx.res.loadCompoundString("label", properties.name, properties.fileSize, properties.commandLabel);
            var div = this._renderWithTemplate(Templates.composeItemWithProgress, properties);
            return WinJS.Promise.wrap(div);
        }.bind(proto)
    };

    proto._failedItemRenderer = {
        /// <summary>Renders items that failed to attach.</summary>
        canRender: function (fileExtension, composeStatus) {
            /// <param name="fileExtension" type="String">The file extension of the attachment.</param>
            /// <param name="composeStatus" type="Microsoft.WindowsLive.Platform.AttachmentComposeStatus">The compose status of the mail attachment.</param>
            /// <returns type="Boolean">true if it can render the given item and false otherwise.</returns>
            return composeStatus === AttachmentComposeStatus.failed;
        },
        render: function (attachment, properties) {
            /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
            /// <param name="properties" type="AttachmentWell.Base.TemplateProperties">The item properties to be rendered.</param>
            /// <returns type="HTMLElement">HTMLElement that indicates that the given attachment failed to attach.</returns>
            Jx.log.info("AttachmentWell.Compose.Item._failedItemRenderer: failed to attach the file");
            properties.commandLabel = Jx.res.getString("removeCommand");
            properties.ariaLabel = Jx.res.loadCompoundString("label", properties.name, properties.fileSize, properties.commandLabel);
            var div = this._renderWithTemplate(Templates.composeErrorItem, properties);
            return WinJS.Promise.wrap(div);
        }.bind(proto)
    };

    proto._itemRenderers = /*@static_cast(Array)*/null;
})();

//
// Copyright (C) Microsoft. All rights reserved.
//
// Renders the view of the attachment well.
//

/*global AttachmentWell,Jx,Debug*/

/// <reference path="AttachmentWellComposeItem.js" />

(function () {
    AttachmentWell.Compose.ViewLayout = /*@constructor*/function (mailMessage, neighborElement) {
        /// <param name="mailMessage" type="Microsoft.WindowsLive.Platform.IMailMessage">The mail message to show attachments for.</param>
        /// <param name="neighborElement" type="HTMLElement" optional="true">The neighboring element that gets affected when we expand/collapse the view.</param>
        /// <summary>Renders the view of the attachment well.</summary>
        AttachmentWell.Base.ViewLayout.call(this, mailMessage, neighborElement);
    };

    Jx.inherit(AttachmentWell.Compose.ViewLayout, AttachmentWell.Base.ViewLayout);

    var proto = AttachmentWell.Compose.ViewLayout.prototype;

    proto._createAttachmentItem = function (attachment) {
        /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
        Debug.assert(this._controller, "AttachmentWell.Compose.ViewLayout._controller should have been set by parent class");
        return new AttachmentWell.Compose.Item(attachment, this._controller, this);
    };

    proto._createController = function () {
        return new AttachmentWell.Compose.ItemController(this);
    };

    proto.focusFirst = function () {
        /// <summary>Sets the focus on the first attachement if there is one.</summary>
        Debug.assert(this._repeater, "AttachmentWell.Compose.ViewLayout.focusFirst: repeater hasn't been initialized in activateUI yet");
        if (!this.isHidden && !this.isCollapsed && this._repeater.length > 0) {
            this._repeater.elementFromIndex(0).focus();
        }
    };

    Object.defineProperty(proto, "isHidden", {
        get: function () { return Jx.hasClass(this._element, "hidden"); },
        set: function (hide) {
            Jx.log.info("AttachmentWell.Compose.ViewLayout.isHidden: " + hide);
            Jx.setClass(this._element, "hidden", hide);
            if (hide) {
                // Inform clients that the well is hidden for focus handling
                Jx.EventManager.fire(null, "hide", {});
            }
        },
        enumerable: true
    });

    proto._statusProperty = "composeStatus";
})();
//
// Copyright (C) Microsoft. All rights reserved.
//
// A component that encapsulates all compose attachment UX.
//

/// <reference path="AttachmentWellComposeModule.js" />

/*global AttachmentWell,Jx,Debug,AttachmentWell*/


(function () {
    AttachmentWell.ShareAnything.Module = /*@constructor*/function (mailManager, mailMessage, neighborElement) {
        /// <summary>A component that encapsulates all Share Anything attachment UX.</summary>
        /// <param name="mailManager" type="Microsoft.WindowsLive.Platform.IMailManager">The mail manager.</param>
        /// <param name="mailMessage" type="Microsoft.WindowsLive.Platform.IMailMessage">The mail message to show attachments for.</param>
        /// <param name="neighborElement" type="HTMLElement" optional="true">The neighboring element that gets affected when we expand/collapse the well.</param>
        Debug.assert(Jx.isObject(mailManager), "Expected mailManager to be a valid object");
        Debug.assert(Jx.isObject(mailMessage), "Expected mailMessage to be a valid object");

        AttachmentWell.Compose.Module.call(this, mailManager, mailMessage, neighborElement);
        this._activationType = AttachmentWell.Compose.ActivationType.shareAnything;
    };

    Jx.inherit(AttachmentWell.ShareAnything.Module, AttachmentWell.Compose.Module);

    var proto = AttachmentWell.ShareAnything.Module.prototype;

    proto._getViewLayout = function (mailMessage) {
        /// <param name="mailMessage" type="Microsoft.WindowsLive.Platform.IMailMessage">The mail message to show attachments for.</param>
        return new AttachmentWell.ShareAnything.ViewLayout(mailMessage);
    };
})();

//
// Copyright (C) Microsoft. All rights reserved.
//
// ShareAnything controller that controls an individual attachment item actions.
//

/*global AttachmentWell,Jx,Microsoft,document*/

/// <reference path="AttachmentWellBaseItemController.js" />

(function () {
    var AttachmentComposeStatus = Microsoft.WindowsLive.Platform.AttachmentComposeStatus;

    AttachmentWell.ShareAnything.ItemController = /*@constructor*/function (view) {
        /// <summary>Controls an individual attachment item actions</summar>
        /// <param name="view" type="AttachmentWell.Base.ViewLayout">View that hosts the items this controller controls.</param>
        AttachmentWell.Compose.ItemController.call(this, view);
    };

    Jx.inherit(AttachmentWell.ShareAnything.ItemController, AttachmentWell.Compose.ItemController);

    var proto = AttachmentWell.ShareAnything.ItemController.prototype;

    proto._createContextMenuCallbacks = function () {
        /// <returns type="Object">A mapping from attachment status to an array of context menu callbacks.</returns>
        var removeCallback = {
            commandId: "removeCommand",
            invoke: this._remove.bind(this),
            isEnabled: this._alwaysEnable
        };

        var contextMenuCallbacks = {};
        contextMenuCallbacks[AttachmentComposeStatus.done] = [removeCallback];
        return contextMenuCallbacks;
    };

    proto._getFlyoutContainerElement = function () {
        /// <summary>Returns the parent element for flyouts.</summary>
        /// <returns type="HTMLElement">The parent element for flyouts.</returns>
        return document.getElementById("shareFlyout");
    };

})();
//
// Copyright (C) Microsoft. All rights reserved.
//

/*global AttachmentWell,Jx,Debug,WinJS*/

/// <reference path="AttachmentWell.ref.js" />

(function () {

    var Templates = AttachmentWell.Templates,
        ThumbnailResizer = AttachmentWell.ThumbnailResizer,
        Utils = AttachmentWell.Utils;

    AttachmentWell.ShareAnything.Item = /*@constructor*/function (attachment, controller, host) {
        /// <summary>Share Anything Item.</summary>
        /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
        AttachmentWell.Compose.Item.call(this, attachment, controller, host);
    };

    Jx.inherit(AttachmentWell.ShareAnything.Item, AttachmentWell.Compose.Item);

    var proto = AttachmentWell.ShareAnything.Item.prototype;

    proto._otherItemRenderer = {
        /// <summary>Renders other items that are done syncing or attaching.</summary>
        canRender: function (fileExtension, status, statusEnums) {
            /// <param name="fileExtension" type="String">The file extension of the attachment.</param>
            /// <param name="status" type="Number">The compose status of the mail attachment.</param>
            /// <param name="statusEnums" type="Object">The compose status enums to compare with.</param>
            /// <returns type="Boolean">true if it can render the given item and false otherwise.</returns>
            return status === statusEnums.done && !Utils.isSupportedPhotoOrVideoFormat(fileExtension);
        },
        render: function (attachment, properties) {
            /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
            /// <param name="properties" type="AttachmentWell.Base.TemplateProperties">The item properties to be rendered.</param>
            /// <returns type="HTMLElement">HTMLElement that contains a file icon and file description of the given non-photo/video attachment</returns>
            Debug.assert(Jx.isString(properties.fileExtension), "AttachmentWell.ShareAnything.Item._otherItemRenderer: File extension is not set on properties");
            var promise = Utils.isEml(properties.fileExtension) ? WinJS.Promise.wrap() : ThumbnailResizer.getThumbnail(attachment, Utils.FileCategory.others, this._thumbnailDimensions);
            var that = this;
            return promise.then(function (thumbnailStream) {
                // The open command is disabled in the Share to Mail scenario but the remove command is not, so we use use the "removeCommand" string here instead.
                return that._renderFileIconItem(attachment, thumbnailStream, Templates.otherItem, properties, "removeCommand");
            });
        }.bind(proto)
    };

    proto._photoItemRenderer = {
        /// <summary>Renders photo items that are done attaching.</summary>
        canRender: function (fileExtension, status, statusEnums) {
            /// <param name="fileExtension" type="String">The file extension of the attachment.</param>
            /// <param name="status" type="Number">The compose status of the mail attachment.</param>
            /// <param name="statusEnums" type="Object">The compose status enums to compare with.</param>
            /// <returns type="Boolean">true if it can render the given item and false otherwise.</returns>
            return status === statusEnums.done && Utils.isSupportedPhotoFormat(fileExtension);
        },
        render: function (attachment, properties) {
            /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
            /// <param name="properties" type="AttachmentWell.Base.TemplateProperties">The item properties to be rendered.</param>
            /// <returns type="HTMLElement">HTMLElement that contains a thumbnail image of the given photo attachment 
            /// or a placeholder if a thumbnail cannot be obtained.</returns>
            var that = this;
            // The open command is disabled in the Share to Mail scenario but the remove command is not, so we use use the "removeCommand" string here instead.
            properties.command = "removeCommand";
            return ThumbnailResizer.getThumbnail(attachment, Utils.FileCategory.photo, this._thumbnailDimensions).then(function (thumbnailStream) {
                return that._renderPhotoVideoItem(attachment, thumbnailStream, Templates.photoItem, properties);
            });
        }.bind(proto)
    };

    proto._videoItemRenderer = {
        /// <summary>Renders video items that are done attaching.</summary>
        canRender: function (fileExtension, status, statusEnums) {
            /// <param name="fileExtension" type="String">The file extension of the attachment.</param>
            /// <param name="status" type="Number">The compose status of the mail attachment.</param>
            /// <param name="statusEnums" type="Object">The compose status enums to compare with.</param>
            /// <returns type="Boolean">true if it can render the given item and false otherwise.</returns>
            return status === statusEnums.done && Utils.isSupportedVideoFormat(fileExtension);
        },
        render: function (attachment, properties) {
            /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
            /// <param name="properties" type="AttachmentWell.Base.TemplateProperties">The item properties to be rendered.</param>
            /// <returns type="HTMLElement">HTMLElement that contains a thumbnail image of the given video attachment 
            /// or a placeholder if a thumbnail cannot be obtained.</returns>
            var that = this;
            // The open command is disabled in the Share to Mail scenario but the remove command is not, so we use use the "removeCommand" string here instead.
            properties.command = "removeCommand";
            return ThumbnailResizer.getThumbnail(attachment, Utils.FileCategory.video, this._thumbnailDimensions).then(function (thumbnailStream) {
                return that._renderPhotoVideoItem(attachment, thumbnailStream, Templates.videoItem, properties);
            });
        }.bind(proto)
    };

    proto._itemRenderers = /*@static_cast(Array)*/null;
})();

//
// Copyright (C) Microsoft. All rights reserved.
//
// Renders the view of the attachment well.
//

/*global AttachmentWell,Jx,Debug*/

(function () {
    AttachmentWell.ShareAnything.ViewLayout = /*@constructor*/function (mailMessage, neighborElement) {
        /// <param name="mailMessage" type="Microsoft.WindowsLive.Platform.IMailMessage">The mail message to show attachments for.</param>
        /// <param name="neighborElement" type="HTMLElement" optional="true">The neighboring element that gets affected when we expand/collapse the view.</param>
        /// <summary>Renders the view of the attachment well.</summary>
        AttachmentWell.Compose.ViewLayout.call(this, mailMessage, neighborElement);
    };

    Jx.inherit(AttachmentWell.ShareAnything.ViewLayout, AttachmentWell.Compose.ViewLayout);

    var proto = AttachmentWell.ShareAnything.ViewLayout.prototype;

    proto._createAttachmentItem = function (attachment) {
        /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
        Debug.assert(this._controller, "AttachmentWell.ShareAnything.ViewLayout._controller should have been set by parent class");
        return new AttachmentWell.ShareAnything.Item(attachment, this._controller, this);
    };

    proto._createController = function () {
        return new AttachmentWell.ShareAnything.ItemController(this);
    };
})();
//
// Copyright (C) Microsoft. All rights reserved.
//
// A component that encapsulates the read attachment well UX.
//

/*global AttachmentWell,Jx,Debug*/

/// <reference path="AttachmentWellBaseModule.js" />
/// <reference path="AttachmentWellReadViewLayout.js" />

(function () {
    AttachmentWell.Read.Module = /*@constructor*/function (mailMessage, neighborElement) {
        /// <summary>A component that encapsulates the read attachment well UX.</summary>
        /// <param name="mailMessage" type="Microsoft.WindowsLive.Platform.IMailMessage">The mail message to show attachments for.</param>
        /// <param name="neighborElement" type="HTMLElement" optional="true">The neighboring element that gets affected when we expand/collapse the well.</param>
        Debug.assert(Jx.isObject(mailMessage), "Expected mailMessage to be a valid object");
        AttachmentWell.Base.Module.call(this);

        this._view = new AttachmentWell.Read.ViewLayout(mailMessage, neighborElement);
        this.append(this._view);
    };
    Jx.inherit(AttachmentWell.Read.Module, AttachmentWell.Base.Module);

    var proto = AttachmentWell.Read.Module.prototype;
})();

//
// Copyright (C) Microsoft. All rights reserved.
//
// Read controller that controls an individual attachment item actions.
//

/*global AttachmentWell,Jx,Microsoft,Windows,document,Mail,Debug*/

/// <reference path="AttachmentWellBaseItemController.js" />

(function () {

    var Utils = AttachmentWell.Utils,
        AttachmentSyncStatus = Microsoft.WindowsLive.Platform.AttachmentSyncStatus,
        Connectivity = Windows.Networking.Connectivity;

    AttachmentWell.Read.ItemController = /*@constructor*/function (view) {
        /// <summary>Controls an individual attachment item actions.</summary>
        /// <param name="view" type="AttachmentWell.Base.ViewLayout">View that hosts the items this controller controls.</param>
        AttachmentWell.Base.ItemController.call(this, view);
        this._networkStatusChangedHandler = this._onNetworkStatusChanged.bind(this);
    };

    Jx.inherit(AttachmentWell.Read.ItemController, AttachmentWell.Base.ItemController);

    var proto = AttachmentWell.Read.ItemController.prototype;

    proto._createContextMenuCallbacks = function () {
        /// <returns type="Object">A mapping from attachment status to an array of context menu callbacks.</returns>
        var contextMenuCallbacks = {},
            saveCallback = {
                commandId: "saveCommand",
                invoke: this._save.bind(this),
                isEnabled: this._alwaysEnable
            },
            openInMailCallback = {
                commandId: "openInMailCommand",
                invoke: this._open.bind(this),
                isEnabled: this._enableForEml
            },
            openWithCallback = {
                commandId: "openWithCommand",
                invoke: this._openWith.bind(this),
                isEnabled: this._alwaysEnable
            };

        contextMenuCallbacks[AttachmentSyncStatus.done] = [openInMailCallback, openWithCallback, saveCallback];
        return contextMenuCallbacks;
    };

    proto._createItemInvokedCallbacks = function () {
        /// <returns type="Object">A mapping from attachment status to item invoked callback.</returns>
        var downloadCallback = this._download.bind(this),
            cancelCallback = this._cancel.bind(this),
            openCallback = this._open.bind(this);

        var itemInvokedCallbacks = {};
        itemInvokedCallbacks[AttachmentSyncStatus.notStarted] = downloadCallback;
        itemInvokedCallbacks[AttachmentSyncStatus.failed] = downloadCallback;
        itemInvokedCallbacks[AttachmentSyncStatus.inProgress] = cancelCallback;
        itemInvokedCallbacks[AttachmentSyncStatus.done] = openCallback;
        return itemInvokedCallbacks;
    };

    proto._getAttachmentStatus = function (attachment) {
        /// <summary>Returns the sync status of the given attachment.</summary>
        /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
        var status = attachment.syncStatus;
        Debug.assert(Jx.isNumber(status), "Expected status to be a number");
        return status;
    };

    proto._getFlyoutContainerElement = function () {
        /// <summary>Returns the parent element for flyouts.</summary>
        /// <returns type="HTMLElement">The parent element for flyouts.</returns>
        return document.getElementById(Mail.CompApp.rootElementId);
    };

    proto._download = function (attachment) {
        /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
        /// <summary>Starts downloading an attachment.</summary>

        // In case the last download attempt caused an error, clear the error before we attempt downloading again.
        this._view.fire("clearerror", { errorId: AttachmentWell.ErrorIds.downloadFailed });

        try {
            Jx.log.info("AttachmentWell.Read.ItemController._download: start downloading file");
            attachment.downloadBody();
        } catch (err) {
            Jx.log.error("AttachmentWell.Read.ItemController._download: failed to download file: " + err);
            this.fireDownloadFailedError(attachment);
        }
    };

    proto.fireDownloadFailedError = function (attachment) {
        /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
        var that = this,
           errorMessage,
           tryAgainCommand;
        if (this._getNetworkConnectivityLevel() === Connectivity.NetworkConnectivityLevel.internetAccess) {
            // We have internet access, so just assume this was a generic failure.
            errorMessage = Jx.res.getString("readDownloadFailedGenericErrorMessage");
            tryAgainCommand = new AttachmentWell.ErrorCommand(Jx.res.getString("tryAgainCommand"), function () { that._download(attachment); });
        } else {
            // We don't have full internet access, so assume the download failed due to lack of an internet connection.
            errorMessage = Jx.res.getString("readDownloadFailedConnectionErrorMessage");

            if (!this._registeredForNetworkStatusChange) {
                // Make sure that this error message will be cleared out if the network connectivity level changes.
                Connectivity.NetworkInformation.addEventListener("networkstatuschanged", this._networkStatusChangedHandler);
                this._registeredForNetworkStatusChange = true;
            }
        }

        var downloadFailedError = new AttachmentWell.Error(AttachmentWell.ErrorIds.downloadFailed, errorMessage);
        if (tryAgainCommand) {
            downloadFailedError.commands.push(tryAgainCommand);
        }

        this._view.fire("error", { error: downloadFailedError });
    };

    proto._getNetworkConnectivityLevel = function () {
        /// <summary>Returns the current network connectivity level.</summary>
        /// <returns type="Windows.Networking.Connectivity.NetworkConnectivityLevel">The current NetworkConnectivityLevel.</returns>
        // Assume the user has internet access so that we don't show a "no internet connection" error by mistake.
        var connectivityLevel = Connectivity.NetworkConnectivityLevel.internetAccess;
        try {
            // If there is no active internet connection profile, then we are not connected to the internet.
            var internetConnectionProfile = Connectivity.NetworkInformation.getInternetConnectionProfile();
            connectivityLevel = internetConnectionProfile ? internetConnectionProfile.getNetworkConnectivityLevel() : Connectivity.NetworkConnectivityLevel.none;
        } catch (ex) {
            Debug.assert(false, "Attachment Well failed to get connectivity information");
            Jx.log.error("Attachment Well failed to get connectivity information: " + ex);
        }

        Jx.log.info("AttachmentWell.Read.ItemController._getNetworkConnectivityLevel: connectivity level = " + connectivityLevel);
        return connectivityLevel;
    };

    proto._onNetworkStatusChanged = function () {
        /// <summary>Handles the networkstatuschanged event by clearing out any errors related to internet connectivity.</summary>
        // This handler can be called multiple times even after the call to removeEventListener.
        if (this._registeredForNetworkStatusChange && this._getNetworkConnectivityLevel() === Connectivity.NetworkConnectivityLevel.internetAccess) {
            Jx.log.info("AttachmentWell.Read.ItemController._onNetworkStatusChanged: has internet access now");
            this._view.fire("clearerror", { errorId: AttachmentWell.ErrorIds.downloadFailed });
            Connectivity.NetworkInformation.removeEventListener("networkstatuschanged", this._networkStatusChangedHandler);
            this._registeredForNetworkStatusChange = false;
        }
    };

    proto._cancel = function (attachment) {
        /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
        /// <summary>Cancels downloading an attachment.</summary>
        try {
            Jx.log.info("AttachmentWell.Read.ItemController._cancel: cancel downloading file");
            attachment.cancelDownload();
        } catch (err) {
            Jx.log.error("AttachmentWell.Read.ItemController._cancel: failed to cancel downloading file: " + err);
            Debug.assert(false, "Failed to cancel downloading file");
        }
    };

    proto._save = function (attachment) {
        /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
        /// <summary>Saves an attachment.</summary>
        Jx.log.info("AttachmentWell.Read.ItemController._save");

        // The file picker requires a file extension so they can show a list of available file type choices. That means that even when there is no file 
        // extension on this attachment we still need to pass a valid file extension (no wildcards allowed), so we default to a non-existent file 
        // extension. This is intentionally not localized.
        var fileExtension = Utils.getFileExtension(attachment) || ".ext";

        var fileSavePicker = new Windows.Storage.Pickers.FileSavePicker();
        fileSavePicker.defaultFileExtension = fileExtension;
        fileSavePicker.fileTypeChoices.insert(fileExtension, [fileExtension]);
        fileSavePicker.settingsIdentifier = "AttachmentWell.Read.ItemController";
        fileSavePicker.suggestedFileName =  Utils.getFileName(attachment);
        fileSavePicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.picturesLibrary;

        var savePickedFile = function (pickedFile, attachment) {
            if (pickedFile) {
                return Utils.getFileFromBodyUri(attachment)
                    .then(function (attachmentFile) {
                        return attachmentFile.copyAndReplaceAsync(pickedFile);  // Copy the source file into the destination file.
                    });
            }
        };

        var savedFile;
        fileSavePicker.pickSaveFileAsync()
            .then(function (pickedFile) {
                savedFile = pickedFile;
                return savePickedFile(pickedFile, attachment);
            })
            .then(function () {
                return Utils.markFileAsWritable(savedFile);
            }).done(
                Jx.fnEmpty, // result returned does not contain any values
                function (err) {
                    Jx.log.error("AttachmentWell.Read.ItemController._save: failed to save file: " + err);
                    Debug.assert(false, "Failed to save file");
                }
            );
    };

    proto._fireOpenFailedError = function (attachment) {
        /// <summary>Fires the openFailed error for the given attachment.</summary>
        /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
        var that = this,
           openFailedError = new AttachmentWell.Error(AttachmentWell.ErrorIds.openFailed, Jx.res.getString("readOpenFailedErrorMessage")),
           saveCommand = new AttachmentWell.ErrorCommand(Jx.res.getString("saveCommand"), function () { that._save(attachment); });

        openFailedError.commands.push(saveCommand);
        this._view.fire("error", { error: openFailedError });
    };

    proto._dispose = function () {
        if (this._registeredForNetworkStatusChange) {
            Connectivity.NetworkInformation.removeEventListener("networkstatuschanged", this._networkStatusChangedHandler);
            this._registeredForNetworkStatusChange = false;
        }
        AttachmentWell.Base.ItemController.prototype.dispose.call(this);
    };

})();
//
// Copyright (C) Microsoft. All rights reserved.
//

/*global AttachmentWell,Jx,Microsoft,Debug,WinJS,document*/

/// <reference path="AttachmentWell.ref.js" />
/// <reference path="AttachmentWellReadItemController.js" />

(function () {

    var AttachmentSyncStatus = Microsoft.WindowsLive.Platform.AttachmentSyncStatus,
        Templates = AttachmentWell.Templates,
        ThumbnailResizer = AttachmentWell.ThumbnailResizer,
        Utils = AttachmentWell.Utils;

    AttachmentWell.Read.Item = /*@constructor*/function (attachment, controller, host) {
        /// <summary>Read Item.</summary>
        /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
        this._itemRenderers = [
            this._otherItemRenderer,
            this._photoItemRenderer,
            this._videoItemRenderer,
            this._inProgressOtherItemRenderer,
            this._inProgressPhotoVideoItemRenderer,
            this._notDownloadedOtherItemRenderer,
            this._notDownloadedPhotoVideoItemRenderer
        ];

        AttachmentWell.Base.Item.call(this, attachment, controller, host);
    };

    Jx.inherit(AttachmentWell.Read.Item, AttachmentWell.Base.Item);

    var proto = AttachmentWell.Read.Item.prototype;

    proto._getCurrentStatus = function () {
        /// <summary>Returns the current syncing status of the attachment.</summary>
        /// <returns type="Microsoft.WindowsLive.Platform.AttachmentSyncStatus"></returns>
        return this._attachment.syncStatus;
    };

    proto._onAttachmentChanged = function (ev) {
        /// <summary>Updates item rendering based on the changed status.</summary>
        /// <param name="ev" type="Object">Event arguments</param>
        AttachmentWell.Base.Item.prototype._onAttachmentChanged.call(this, ev);
        this._reportStatus();
    };

    proto._reportStatus = function () {
        /// <summary>Log and report item status.</summary>
        var fileName = this._attachment.fileName;
        switch (this._currentStatus) {
            case AttachmentSyncStatus.notStarted:
                this._logAccessibility(Jx.res.loadCompoundString("attachmentDownloadCancelled", fileName));
                break;
            case AttachmentSyncStatus.inProgress:
                this._logAccessibility(Jx.res.loadCompoundString("attachmentDownloading", fileName));
                break;
            case AttachmentSyncStatus.done:
                this._logAccessibility(Jx.res.loadCompoundString("attachmentFinishedDownloading", fileName));
                break;
            case AttachmentSyncStatus.failed:
                this._controller.fireDownloadFailedError(this._attachment);
                break;
        }
    };

    proto._getItemRenderer = function (fileExtension, status) {
        /// <summary>Returns a rendering function based on the given file type and attachment status</summary>
        var found = this._itemRenderers.filter(function (current) {
            return current.canRender(fileExtension, status, Microsoft.WindowsLive.Platform.AttachmentSyncStatus);
        });
        Debug.assert(found.length === 1, "There should be one and only one render found.");
        return found[0];
    };

    proto._inProgressOtherItemRenderer = {
        /// <summary>Renders non-photo/video items that are in the process of being downloaded.</summary>
        canRender: function (fileExtension, syncStatus) {
            /// <param name="fileExtension" type="String">The file extension of the attachment.</param>
            /// <param name="syncStatus" type="Microsoft.WindowsLive.Platform.AttachmentSyncStatus">The sync status of the mail attachment.</param>
            /// <returns type="Boolean">true if it can render the given item and false otherwise.</returns>
            return syncStatus === AttachmentSyncStatus.inProgress && !Utils.isSupportedPhotoOrVideoFormat(fileExtension);
        },
        render: function (attachment, properties) {
            /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
            /// <param name="properties" type="AttachmentWell.Base.TemplateProperties">The item properties to be rendered.</param>
            /// <returns type="HTMLElement">HTMLElement that indicates the given non-photo/video attachment is still in the progress of syncing.</returns>
            var that = this;
            return ThumbnailResizer.getThumbnail(attachment, Utils.FileCategory.others, this._thumbnailDimensions).then(function (thumbnailStream) {
                return that._renderFileIconItem(attachment, thumbnailStream, Templates.readOtherItemDownloading, properties, "cancelCommand");
            });
        }.bind(proto)
    };

    proto._inProgressPhotoVideoItemRenderer = {
        /// <summary>Renders photo/video items that are in the process of being downloaded.</summary>
        canRender: function (fileExtension, syncStatus) {
            /// <param name="fileExtension" type="String">The file extension of the attachment.</param>
            /// <param name="syncStatus" type="Microsoft.WindowsLive.Platform.AttachmentSyncStatus">The sync status of the mail attachment.</param>
            /// <returns type="Boolean">true if it can render the given item and false otherwise.</returns>
            return syncStatus === AttachmentSyncStatus.inProgress && Utils.isSupportedPhotoOrVideoFormat(fileExtension);
        },
        render: function (attachment, properties) {
            /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
            /// <param name="properties" type="AttachmentWell.Base.TemplateProperties">The item properties to be rendered.</param>
            /// <returns type="HTMLElement">HTMLElement that indicates the given photo/video attachment is still in the progress of syncing.</returns>
            var div = this._renderFileIconItem(attachment, null/*render with default file icon*/, Templates.readPhotoVideoItemDownloading, properties, "cancelCommand");
            return WinJS.Promise.wrap(div);
        }.bind(proto)
    };

    proto._notDownloadedOtherItemRenderer = {
        /// <summary>Renders non-photo/video items that have not yet being downloaded.</summary>
        canRender: function (fileExtension, syncStatus) {
            /// <param name="fileExtension" type="String">The file extension of the attachment.</param>
            /// <param name="syncStatus" type="Microsoft.WindowsLive.Platform.AttachmentSyncStatus">The sync status of the mail attachment.</param>
            /// <returns type="Boolean">true if it can render the given item and false otherwise.</returns>
            return (syncStatus === AttachmentSyncStatus.notStarted || syncStatus === AttachmentSyncStatus.failed) && !Utils.isSupportedPhotoOrVideoFormat(fileExtension);
        },
        render: function (attachment, properties) {
            /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
            /// <param name="properties" type="AttachmentWell.Base.TemplateProperties">The item properties to be rendered.</param>
            /// <returns type="HTMLElement">HTMLElement that indicates the given non-photo/video attachment has not yet start syncing.</returns>
            var that = this;
            return ThumbnailResizer.getThumbnail(attachment, Utils.FileCategory.others, this._thumbnailDimensions).then(function (thumbnailStream) {
                return that._renderFileIconItem(attachment, thumbnailStream, Templates.readOtherItemNotDownloaded, properties, "downloadCommand");
            });
        }.bind(proto)
    };

    proto._notDownloadedPhotoVideoItemRenderer = {
        /// <summary>Renders photo/video items that have not yet being downloaded.</summary>
        canRender: function (fileExtension, syncStatus) {
            /// <param name="fileExtension" type="String">The file extension of the attachment.</param>
            /// <param name="syncStatus" type="Microsoft.WindowsLive.Platform.AttachmentSyncStatus">The sync status of the mail attachment.</param>
            /// <returns type="Boolean">true if it can render the given item and false otherwise.</returns>
            return (syncStatus === AttachmentSyncStatus.notStarted || syncStatus === AttachmentSyncStatus.failed) && Utils.isSupportedPhotoOrVideoFormat(fileExtension);
        },
        render: function (attachment, properties) {
            /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
            /// <param name="properties" type="AttachmentWell.Base.TemplateProperties">The item properties to be rendered.</param>
            /// <returns type="HTMLElement">HTMLElement that indicates the given photo/video attachment has not yet start syncing.</returns>
            var div = this._renderFileIconItem(attachment, null/*render with default file icon*/, Templates.readPhotoVideoItemNotDownloaded, properties, "downloadCommand");
            return WinJS.Promise.wrap(div);
        }.bind(proto)
    };

    proto._logAccessibility = function (message) {
        /// <summary>Logs a message to an aria-live region to be read by Narrator.</summary>
        // Each message gets its own seperate aria-live region to avoid Narrator re-reading unchanged status and to work 
        // around an issue where Narrator keeps reading the old message even after it has been updated.
        var statusElement = document.createElement("div");
        statusElement.setAttribute("aria-live", "polite");
        statusElement.setAttribute("role", "status");
        statusElement.className = "attachmentWell-statusListItem";
        statusElement.innerText = message;

        var statusListElement = this._statusListElement;
        if (Jx.isNullOrUndefined(statusListElement)) {
            statusListElement = this._statusListElement = this._host.getElement().querySelector(".attachmentWell-statusList");
            Debug.assert(Jx.isHTMLElement(statusListElement));
        }
        statusListElement.appendChild(statusElement); 
    };

    proto._itemRenderers = /*@static_cast(Array)*/null;
})();

//
// Copyright (C) Microsoft. All rights reserved.
//
// Renders the view of the attachment well.
//

/*global AttachmentWell,Jx,Debug*/

/// <reference path="AttachmentWellReadItem.js" />

(function () {
    AttachmentWell.Read.ViewLayout = /*@constructor*/function (mailMessage, neighborElement) {
        /// <param name="mailMessage" type="Microsoft.WindowsLive.Platform.IMailMessage">The mail message to show attachments for.</param>
        /// <param name="neighborElement" type="HTMLElement" optional="true">The neighboring element that gets affected when we expand/collapse the view.</param>
        /// <summary>Renders the view of the attachment well.</summary>
        AttachmentWell.Base.ViewLayout.call(this, mailMessage, neighborElement);
        this._downloadSaveAllControl = new AttachmentWell.DownloadSaveAllControl(mailMessage);
        this.append(this._downloadSaveAllControl);
    };

    Jx.inherit(AttachmentWell.Read.ViewLayout, AttachmentWell.Base.ViewLayout);

    var proto = AttachmentWell.Read.ViewLayout.prototype;

    proto.getUI = function (ui) {
        ui.html =
            '<div id="' + this._id + '" class="attachmentWell-view">' +
                Jx.getUI(this._errorManager).html +
                '<div class="attachmentWell-controls">' +
                    Jx.getUI(this._filesAttachedControl).html +
                    Jx.getUI(this._downloadSaveAllControl).html +
                '</div>' +
                '<div class="attachmentWell-repeater"></div>' +
                '<div class="attachmentWell-statusList" aria-hidden="true"></div>' +
                this._contextMenuUI() + 
            '</div>';
    };

    proto._createAttachmentItem = function (attachment) {
        /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
        Debug.assert(this._controller, "AttachmentWell.Read.ViewLayout._controller should have been set by parent class");
        return new AttachmentWell.Read.Item(attachment, this._controller, this);
    };

    proto._createController = function () {
        return new AttachmentWell.Read.ItemController(this);
    };

    proto._resetAttachmentCollection = function () {
        AttachmentWell.Base.ViewLayout.prototype._resetAttachmentCollection.call(this);
        this._downloadSaveAllControl.resetAttachmentCollection();
    };

    proto._statusProperty = "syncStatus";
})();
//
// Copyright (C) Microsoft. All rights reserved.
//
// Renders the view of the attachment well.
//

/*global AttachmentWell,Jx,Microsoft,Debug,Windows,WinJS*/

(function () {

    var AttachmentSyncStatus = Microsoft.WindowsLive.Platform.AttachmentSyncStatus,
        Utils = AttachmentWell.Utils;

    AttachmentWell.DownloadSaveAllControl = /*@constructor*/function (mailMessage) {
        /// <summary>Control that allows user to either start downloading all attachments that haven't been downloaded, 
        /// or save all files that have been downloaded into a selected location when there are more than one attachments.</summary>
        /// <param name="mailMessage" type="Microsoft.WindowsLive.Platform.IMailMessage">The mail message to show attachments for.</param>
        Debug.assert(mailMessage, "AttachmentWell.DownloadSaveAllControl: given mail message is not valid.");
        this.initComponent();
        this._mailMessage = mailMessage;
        this._attachmentCollection = mailMessage.getOrdinaryAttachmentCollection();
        this._attachmentObjects = {};
        this._attachmentChanged = this._updateControlState.bind(this);
    };
    Jx.augment(AttachmentWell.DownloadSaveAllControl, Jx.Component);

    var proto = AttachmentWell.DownloadSaveAllControl.prototype;

    proto.getUI = function (ui) {
        ui.html =
            '<div class="attachmentWell-downloadSaveAllControl">' +
                '<span class="attachmentWell-downloadAll hidden" tabIndex="0" role="button">' + Jx.escapeHtml(Jx.res.getString("downloadAll")) + '</span>' +
                '<span class="attachmentWell-saveAll hidden" tabIndex="0" role="button">' + Jx.escapeHtml(Jx.res.getString("saveAll")) + '</span>' +
            '</div>';
    };

    proto.activateUI = function () {
        this._view = this.getParent();
        Debug.assert(this._view.getElement, "AttachmentWell.DownloadSaveAllControl.activateUI: given view needs to have the getElement function implemented");
        var element = this._element = this._view.getElement().querySelector(".attachmentWell-downloadSaveAllControl");

        this._downloadAll = element.querySelector(".attachmentWell-downloadAll");
        this._saveAll = element.querySelector(".attachmentWell-saveAll");
        this._downloadAllClicker = new Jx.Clicker(this._downloadAll, this._onDownloadAllClicked, this);
        this._saveAllClicker = new Jx.Clicker(this._saveAll, this._onSaveAllClicked, this);

        this._addAttachmentListeners();
        this._updateControlState();
    };

    proto._addAttachmentListeners = function () {
        // attach attachment listeners
        var attachmentCollection = this._attachmentCollection;

        attachmentCollection.addEventListener("collectionchanged", this._attachmentChanged);
        var attachment;
        for (var i = 0, len = attachmentCollection.count; i < len; i++) {
            attachment = attachmentCollection.item(i);
            attachment.addEventListener("changed", this._attachmentChanged);

            // Hold on to this object so it doesn't get garbage collected until we remove the listener
            this._attachmentObjects[attachment.objectId] = attachment;
        }

        // unlock to listen for changes
        attachmentCollection.unlock();
    };

    proto._onDownloadAllClicked = function () {
        /// <summary>Starts downloading all attachments that have not yet been downloaded.</summary>
        Jx.log.info("AttachmentWell.DownloadSaveAllControl._onDownloadAllClicked");
        var attachment;
        for (var i = 0, len = this._attachmentCollection.count; i < len; i++) {
            attachment = this._attachmentCollection.item(i);
            if (attachment.syncStatus === AttachmentSyncStatus.notStarted || attachment.syncStatus === AttachmentSyncStatus.failed) {
                attachment.downloadBody();
            }
        }
    };

    proto._onSaveAllClicked = function () {
        /// <summary>Launch folder picker to allow user to pick a folder location to save all downloaded files. 
        /// If duplicated file names are found, unique file names will be generated by appending a number to the name of the file.</summary>
        Jx.log.info("AttachmentWell.DownloadSaveAllControl._onSaveAllClicked");
        var attachmentCollection = this._attachmentCollection;
        var saveAllFiles = function (folder) {
            if (folder) {
                var attachment,
                    promises = [];
                for (var i = 0, len = attachmentCollection.count; i < len; i++) {
                    attachment = attachmentCollection.item(i);
                    promises.push(
                        Utils.getFileFromBodyUri(attachment)
                        .then(function (attachmentFile) {
                            return attachmentFile.copyAsync(folder, attachmentFile.name, Windows.Storage.NameCollisionOption.generateUniqueName);
                        })
                    );
                }
                return WinJS.Promise.join(promises);
            }
        };

        var markAllFilesAsWritable = function () {
            var attachment,
                 promises = [];
            for (var i = 0, len = attachmentCollection.count; i < len; i++) {
                attachment = attachmentCollection.item(i);
                promises.push(
                    Utils.getFileFromBodyUri(attachment)
                    .then(Utils.markFileAsWritable)
                );
            }
            return WinJS.Promise.join(promises);
        };

        var folderPicker = new Windows.Storage.Pickers.FolderPicker();
        folderPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.picturesLibrary;
        folderPicker.fileTypeFilter.replaceAll(["*"]);
        folderPicker.pickSingleFolderAsync()
            .then(saveAllFiles)
            .then(markAllFilesAsWritable)
            .done(function () {
                Jx.log.info("AttachmentWell.DownloadSaveAllControl._onSaveAllClicked: all files saved successfully");
            }, function (error) {
                Jx.log.error("AttachmentWell.DownloadSaveAllControl._onSaveAllClicked: failed to save all files: " + error);
            });
    };

    proto._updateControlState = function () {
        /// <summary>Shows either 'Download all' or 'Save all' verb depending on the number of attachments and their sync status. 
        /// When there are two more more attachments, shows 'Save all' when all files have been downloaded successfully else 'Download all.'
        /// Shows nothing (hides both 'Download all' and 'Save all' when there are only one file.</summary>
        var attachmentCollection = this._attachmentCollection,
            totalCount = attachmentCollection.count,
            downloadedFileCount = 0;

        for (var i = 0; i < totalCount; i++) {
            if (attachmentCollection.item(i).syncStatus === AttachmentSyncStatus.done) {
                downloadedFileCount++;
            }
        }

        var hideDownloadAll = totalCount <= 1 || downloadedFileCount === totalCount,
            hideSaveAll = totalCount <= 1 || downloadedFileCount !== totalCount;
        Jx.setClass(this._downloadAll, "hidden", hideDownloadAll);
        this._downloadAll.setAttribute("aria-hidden", hideDownloadAll);
        Jx.setClass(this._saveAll, "hidden", hideSaveAll);
        this._saveAll.setAttribute("aria-hidden", hideSaveAll);
    };

    proto.deactivateUI = function () {
        this._removeAttachmentListeners();

        Jx.dispose(this._downloadAllClicker);
        Jx.dispose(this._saveAllClicker);
        this._downloadAllClicker = null;
        this._saveAllClicker = null;
    };

    proto._removeAttachmentListeners = function () {
        this._attachmentCollection.lock();
        this._attachmentCollection.removeEventListener("collectionchanged", this._attachmentChanged);
        Object.keys(this._attachmentObjects).forEach(function (key) {
            var attachmentObject = this._attachmentObjects[key];
            if (attachmentObject) {
                attachmentObject.removeEventListener("changed", this._attachmentChanged);
            }
        }, this);
        this._attachmentObjects = {};
    };

    proto.resetAttachmentCollection = function () {
        this._removeAttachmentListeners();
        this._attachmentCollection = this._mailMessage.getOrdinaryAttachmentCollection();
        this._addAttachmentListeners();
        this._updateControlState();
    };

})();

//
// Copyright (C) Microsoft. All rights reserved.
//
// Renders the view of the attachment well.
//

/*global AttachmentWell,Jx,Debug*/

(function () {
    AttachmentWell.FilesAttachedControl = /*@constructor*/function () {
        /// <summary>Control that shows the number of files currently displayed in the view 
        /// and allows user to expand or collapse the view by clicking on it.</summary>
        this.initComponent();
        this._collapsed = false;
    };
    Jx.augment(AttachmentWell.FilesAttachedControl, Jx.Component);

    var proto = AttachmentWell.FilesAttachedControl.prototype;

    proto.getUI = function (ui) {
        ui.html =
            '<div class="attachmentWell-filesAttachedControl" tabIndex="0" role="button" aria-expanded="true">' +
                '<span class="attachmentWell-numberOfFiles"></span>&ensp;' +
                '<span class="attachmentWell-expandChevron">\uE098</span>' +
                '<span class="attachmentWell-collapseChevron hidden">\uE099</span>' +
            '</div>';
    };

    proto.activateUI = function () {
        this._view = this.getParent();
        Debug.assert(this._view.getElement, "AttachmentWell.DownloadSaveAllControl.activateUI: given view needs to have the getElement function implemented");
        var element = this._element = this._view.getElement().querySelector(".attachmentWell-filesAttachedControl");
        this._numberOfFiles = element.querySelector(".attachmentWell-numberOfFiles");
        this._expandChevron = element.querySelector(".attachmentWell-expandChevron");
        this._collapseChevron = element.querySelector(".attachmentWell-collapseChevron");

        // attach listeners
        this._observer = Jx.observeAttribute(element, "aria-expanded", function () {
            this.collapse(element.getAttribute("aria-expanded") === "false");
        }, this);

        this._clicker = new Jx.Clicker(element, function () {
            this._element.setAttribute("aria-expanded", this._collapsed);
        }, this);
    };

    proto.collapse = function (shouldCollapses) {
        var collapsed = this._collapsed = !this._collapsed;
        this._view.isCollapsed = collapsed;

        Jx.setClass(this._expandChevron, "hidden", collapsed);
        Jx.setClass(this._collapseChevron, "hidden", !collapsed);
    };

    proto.updateCount = function (count) {
        /// <summary>Update count to reflect changes in number of files attached.</summary>
        /// <param name="count" type="Number">Updated number of files attached</param>
        Debug.assert(Jx.isNumber(count), "AttachmentWell.FilesAttachedControl.updateCount: given count is not a valid number");
        Jx.log.info("AttachmentWell.FilesAttachedControl.updateCount: count = " + count);
        var text = this._numberOfFiles.innerText =
            count === 1 ? Jx.res.getString("oneFileAttached") : Jx.res.loadCompoundString("numberOfFilesAttached", count);
        this._element.setAttribute("aria-label", text);
    };

    proto.deactivateUI = function () {
        Jx.dispose(this._clicker);
        this._clicker = null;
        this._observer.disconnect();
        this._observer = null;
    };

})();

//
// Copyright (C) Microsoft. All rights reserved.
//
/*global AttachmentWell,Jx,Debug,WinJS,Windows*/

(function () {

    var FileProperties = Windows.Storage.FileProperties,
        ThumbnailResizer = AttachmentWell.ThumbnailResizer,
        Utils = AttachmentWell.Utils;

    var temporaryFolderName = "Attachments",
        temporaryFileName = "empty";

    var _getFile = function (attachment) {
        if (attachment.bodyUri) {
            return Utils.getFileFromBodyUri(attachment);
        } else {
            var collisionOption = Windows.Storage.CreationCollisionOption.openIfExists;
            return Windows.Storage.ApplicationData.current.temporaryFolder.createFolderAsync(temporaryFolderName, collisionOption)
                .then(function (folder) {
                    var fileExtension = Utils.getFileExtension(attachment);
                    return folder.createFileAsync(temporaryFileName + fileExtension, collisionOption);
                });
        }
    };

    var _requestedThumbnailSize = function (file, isPhotoOrVideo, fileCategory, thumbnailDimensions) {
        /// <summary>Gets a promise that returns the requested size in pixels of the longest edge of the thumbnail.</summary>
        Debug.assert(Jx.isObject(thumbnailDimensions), "ThumbnailResizer._requestedThumbnailSize: thumbnailDimensions is invalid");
        if (isPhotoOrVideo) {
            var photoVideoDimensions = thumbnailDimensions.photoVideo;
            Debug.assert(Jx.isObject(photoVideoDimensions));
            Debug.assert(Jx.isNumber(photoVideoDimensions.width) && Jx.isNumber(photoVideoDimensions.height));

            var propertyNames = {
                width: fileCategory === Utils.FileCategory.photo ? "System.Image.HorizontalSize" : "System.Video.FrameWidth",
                height: fileCategory === Utils.FileCategory.photo ? "System.Image.VerticalSize" : "System.Video.FrameHeight"
            };

            return file.properties.retrievePropertiesAsync([propertyNames.width, propertyNames.height]).then(function (properties) {
                var actualWidth = properties[propertyNames.width];
                var actualHeight = properties[propertyNames.height];

                var displayWidth = photoVideoDimensions.width;
                var displayHeight = photoVideoDimensions.height;

                // We only need to handle the case where the dimensions are larger than the requested dimensions.
                if (actualHeight > displayHeight && actualWidth > displayWidth) {
                    // For portrait image, pick height. Otherwise, constrain the width based on requested height and the aspect ratio of the original dimensions.
                    return actualWidth <= actualHeight ? displayHeight : Math.round(actualWidth * displayHeight / actualHeight);
                } else {
                    return Math.max(displayWidth, displayHeight);
                }
            });
        } else {
            var fileIconDimensions = thumbnailDimensions.fileIcon;
            Debug.assert(Jx.isObject(fileIconDimensions));
            Debug.assert(Jx.isNumber(fileIconDimensions.width) && Jx.isNumber(fileIconDimensions.height));
            var requestedSize = Math.max(fileIconDimensions.width, fileIconDimensions.height);
            return WinJS.Promise.wrap(requestedSize);
        }
    };

    ThumbnailResizer.getThumbnail = function (attachment, fileCategory, thumbnailDimensions) {
        /// <summary>
        /// Gets a promise that returns a thumbnail stream for the given attachment.
        /// If the attachment is not available yet (hasn't been downloaded), returns a file icon for the given file type.
        /// Returns a null promise if fail.
        /// </summary>
        /// <param name="attachment" type="Microsoft.WindowsLive.Platform.IMailAttachment">The attachment object.</param>
        /// <param name="thumbnailDimensions" type="Object">Object that specifies the thumbnail's min and max dimensions.
        /// options: {
        ///     photoVideo: {
        ///         width: 0,
        ///         height: 0,
        ///         minWidth: 0,
        ///         maxWidth: 0
        ///     },
        ///     fileIcon: {
        ///         width: 0,
        ///         height: 0
        ///     }
        /// }
        /// </param>
        Debug.assert(Utils.FileCategory[fileCategory], "Invalide file category given.");
        var isPhotoOrVideo = fileCategory === Utils.FileCategory.photo || fileCategory === Utils.FileCategory.video,
            imgFile;

        return _getFile(attachment)
            .then(function (file){ 
                imgFile = file;
                return _requestedThumbnailSize(file, isPhotoOrVideo, fileCategory, thumbnailDimensions);
            })
            .then(function (requestedSize) {
                var thumbnailMode = isPhotoOrVideo ? FileProperties.ThumbnailMode.singleItem : FileProperties.ThumbnailMode.listView;
                var thumbnailOption = FileProperties.ThumbnailOptions.useCurrentScale; // Increase requested size based on the Pixels Per Inch (PPI) of the display
                return imgFile.getThumbnailAsync(thumbnailMode, requestedSize, thumbnailOption);
            })
            .then(null, function (err) {
                Debug.assert(Jx.isObject(err), "ThumbnailResizer.getThumbnail: given err is not an object");
                Jx.log.exception("ThumbnailResizer.getThumbnail: failed to get thumbnail", err);
                return WinJS.Promise.wrap(null);
            });
    };

    ThumbnailResizer.calcDesiredDisplaySize = function (thumbnail, dimensions) {
        /// <summary> Returns the desired size of the thumbnail based on the specified original media dimensions.</summary>
        /// <returns type="Object">An object with {width, height} properties containing the desired display size.</returns>
        var originalWidth = thumbnail.originalWidth;
        var originalHeight = thumbnail.originalHeight;

        var fixedHeight = dimensions.height,
            minItemWidth = dimensions.minWidth,
            maxItemWidth = dimensions.maxWidth;

        if (originalHeight > fixedHeight || originalWidth > maxItemWidth) {
            // Scale it down to fit within the fixed height and maximum width, letterboxing if necessary
            // (Note: we won't pillarbox if the returned width is less than the maximum)
            return ThumbnailResizer.scaleAspect(maxItemWidth, fixedHeight, /*stretchToFill:*/false, originalWidth, originalHeight);
        } else if (originalWidth < minItemWidth) {
            // Scale it up to fit within the minimum width, letterboxed or (in extremely rare cases) pillarboxed
            return ThumbnailResizer.scaleAspect(minItemWidth, fixedHeight, /*stretchToFill:*/false, originalWidth, originalHeight);
        } else {
            // Use the original size
            return { width: originalWidth, height: originalHeight };
        }
    };

    // Constants
    // IMPORTANT: DO NOT CHANGE THESE CONSTANTS WITHOUT UPDATING THE CONSTANTS IN THE NATIVE THUMBNAIL GENERATION CODE ALSO.
    // IF YOU DON'T KNOW WHERE THAT CODE IS, THEN YOU SHOULDN'T BE TOUCHING THIS CODE.
    var centeringDivisor = 2;
    var favorTopCroppingDivisor = 3;
    ThumbnailResizer.scaleAspect = function (widthToFitIn, heightToFitIn, stretchToFill, width, height) {
        /// <summary>Function to scale a width and height to fit within specified bounds.</summary>
        /// <param name="widthToFitIn" type="Number">The width that we want to scale to.</param>
        /// <param name="heightToFitIn" type="Number">The height that we want to scale to.</param>
        /// <param name="stretchToFill" type="Boolean">
        ///     If true, stretch width/height to fill widthToFitIn/heightToFitIn (while maintaining same aspect ratio).
        ///     Otherwise, letterbox: scale so that one dimension matches while the other is smaller than *toFitIn.
        /// </param>
        /// <param name="width" type="Number">The width that we want to scale.</param>
        /// <param name="height" type="Number">The height that we want to scale.</param>
        /// <returns type="Object">An object with {width, height} properties containing the element size.</returns>

        Debug.assert(widthToFitIn >= 0, "Bad width to fit in for ScaleAspect: " + widthToFitIn.toString());
        Debug.assert(heightToFitIn >= 0, "Bad height to fit in for ScaleAspect: " + heightToFitIn.toString());
        Debug.assert(width >= 0, "Bad width for ScaleAspect: " + width.toString());
        Debug.assert(height >= 0, "Bad height for ScaleAspect: " + height.toString());

        if (width > 0 && height > 0 && widthToFitIn > 0 && heightToFitIn > 0) {
            // Determine whether the original width and height gives a wider aspect ratio than the box to fit it in.
            var widerThanBox = (width * heightToFitIn > widthToFitIn * height);

            // Make the aspect width and height fit exactly in the rect's size.
            if ((stretchToFill && widerThanBox) || (!stretchToFill && !widerThanBox)) {

                // Image is wider than the display rectangle and needs cropping, or narrower and needs letterboxing.
                width = Math.round(heightToFitIn * width / height);
                height = heightToFitIn;

                // Always have at least 1.
                if (width < 1) {
                    width = 1;
                }
            } else {

                // Image is taller than the display rectangle and needs cropping, or shorter and needs letterboxing.
                height = Math.round(widthToFitIn * height / width);
                width = widthToFitIn;

                // Always have at least 1.
                if (height < 1) {
                    height = 1;
                }
            }
        } else {
            width = 0;
            height = 0;
        }

        return { width: width, height: height };
    };

    ThumbnailResizer.centerElement = function (htmlElement, widthToFitIn, heightToFitIn, elementSize) {
        /// <summary>Function to center an HTML element within specified bounds using its margin properties.</summary>
        /// <param name="htmlElement" type="HTMLElement">The DOM element to center.</param>
        /// <param name="widthToFitIn" type="Number">The width of the area that we want to center in.</param>
        /// <param name="heightToFitIn" type="Number">The height of the area that we want to center in.</param>
        /// <param name="elementSize" type="RectSize">An object with {width, height} properties containing the element size.</param>
        /// <returns type="Object">An object with {top, left} properties of the element.</returns>
        var elementStyle = htmlElement.style;
        Debug.assert(elementStyle);

        var width = elementSize.width,
            height = elementSize.height,
            marginLeft = 0,
            marginTop = 0;
        if (widthToFitIn !== width) {
            var horizontalMargin = (widthToFitIn - width) / centeringDivisor;
            marginLeft = Math.floor(horizontalMargin);
            elementStyle.marginLeft = marginLeft.toString() + "px";
            elementStyle.marginRight = Math.ceil(horizontalMargin).toString() + "px";
        } else {
            marginLeft = 0;
            elementStyle.marginLeft = "";
            elementStyle.marginRight = "";
        }
        if (heightToFitIn !== height) {
            // If cropping vertically, crop less off the top and more off the bottom to avoid cutting off people's faces
            var verticalMargin = (heightToFitIn - height) / (height > heightToFitIn ? favorTopCroppingDivisor : centeringDivisor);
            marginTop = Math.floor(verticalMargin);
            elementStyle.marginTop = marginTop.toString() + "px";
            elementStyle.marginBottom = Math.ceil(verticalMargin).toString() + "px";
        } else {
            marginTop = 0;
            elementStyle.marginTop = "";
            elementStyle.marginBottom = "";
        }
        return {
            top: marginTop,
            left: marginLeft
        };
    };

    ThumbnailResizer.scaleAndCenter = function (htmlElement, currentWidth, currentHeight, displayWidth, displayHeight, stretchToFill, zoomCap) {
        /// <summary>Scales and centers an HTML element in the given display area.</summary>
        /// <param name="htmlElement" type="HTMLElement">The element to modify.</param>
        /// <param name="currentWidth" type="Number">The width of the element.</param>
        /// <param name="currentHeight" type="Number">The height of the element.</param>
        /// <param name="displayWidth" type="Number">The width of the display area.</param>
        /// <param name="displayHeight" type="Number">The height of the display area.</param>
        /// <param name="stretchToFill" type="Boolean">
        ///     If true, stretch width/height to fill displayWidth/displayHeight (while maintaining same aspect ratio).
        ///     Otherwise, letterbox: scale so that one dimension matches while the other is smaller than display*.
        /// </param>
        /// <param name="zoomCap" type="Boolean" optional="true">If true, keep the scaling to no larger than 200%.</param>
        /// <returns type="Object">An object with {top, left, width, height} properties of the element.</returns>

        var newSize = ThumbnailResizer.scaleAspect(displayWidth, displayHeight, stretchToFill, currentWidth, currentHeight);

        if (zoomCap) {
            // Ensure our new size is no greater than 200% of original width/height.
            if (newSize.width > (currentWidth * 2) || newSize.height > (currentHeight * 2)) {
                newSize.width = currentWidth * 2;
                newSize.height = currentHeight * 2;
            }
        }

        htmlElement.style.width = String(newSize.width) + "px";
        htmlElement.style.height = String(newSize.height) + "px";
        var /*@type(ElementPosition)*/topLeftPosition = ThumbnailResizer.centerElement(htmlElement, displayWidth, displayHeight, newSize);
        var /*@type(RectPosition)*/elementPosition = {
            top: topLeftPosition.top,
            left: topLeftPosition.left,
            width: newSize.width,
            height: newSize.height
        };
        return elementPosition;
    };
})();
//
// Copyright (C) Microsoft. All rights reserved.
//

});
