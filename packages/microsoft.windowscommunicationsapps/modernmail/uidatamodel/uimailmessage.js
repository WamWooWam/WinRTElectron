
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx,Mail,Debug,Microsoft,self*/
/*jshint browser:true*/

Jx.delayDefine(Mail.UIDataModel, "MailMessage", function () {
    "use strict";

    var UIDataModel = self.Mail.UIDataModel,
        Plat = Microsoft.WindowsLive.Platform,
        MailFolderType = Plat.MailFolderType,
        SanitizedVersion = Plat.SanitizedVersion,
        MailBodyType = Plat.MailBodyType,
        CalendarMessageType = Plat.CalendarMessageType;

    var MailMessage = UIDataModel.MailMessage = function (platformMailMessage, account) {
        Debug.assert(Jx.isInstanceOf(platformMailMessage, Plat.MailMessage));
        Debug.assert(Jx.isInstanceOf(account, Mail.Account));

        this._platformMailMessage = platformMailMessage;
        this._account = account;
        this._initMailItem(this._platformMailMessage);

        this._calendarEvent = null;
        this._fetchedCalendarEvent = false;

        this._addCachedProperties();
    };
    Jx.inherit(MailMessage, UIDataModel.MailItem);

    UIDataModel.MailMessage.prototype._addCachedProperties = function () {
        this._propertyCache.add("from", "fromRecipientString", function () {
            return this._getHeaderRecipientStringHelper("calculatedUIName", this.fromRecipientArray);
        }, this);
        this._propertyCache.add("to", "toRecipientString", function () {
            return this._getHeaderRecipientStringHelper("calculatedUIName", this.to);
        }, this);
        this._propertyCache.add("preview", "previewHTML", function () {
            return generateSingleLineHTMLFromString(this.preview);
        }, this);
        this._propertyCache.add("displayViewIdString", "primaryView", function () {
            var primaryViewId = this.primaryViewId;
            if (primaryViewId) {
                try {
                    var platform = this._account.platform;
                    return platform.mailManager.tryLoadMailView(primaryViewId);
                } catch (e) {
                    // Retrieving the view can fail if the view has been deleted.  Due to the client side
                    // cache of the data, we might still have an apparently valid view ID in this case, but
                    // retrieving the folder will throw an exception when it goes all the way to the DB.
                    return null;
                }
            }
            return null;
        }, this);
        this._propertyCache.add("displayViewIdString", "isInInbox", function () {
            return this._platformMailMessage.isInSpecialFolderType(MailFolderType.inbox);
        }, this);
        this._propertyCache.add("displayViewIdString", "isDraft", function () {
            return this._platformMailMessage.isInSpecialFolderType(MailFolderType.drafts);
        }, this);
        this._propertyCache.add("displayViewIdString", "isInDeletedItems", function () {
            return this._platformMailMessage.isInSpecialFolderType(MailFolderType.deletedItems);
        }, this);
        this._propertyCache.add("displayViewIdString", "isInSentItems", function () {
            return this._platformMailMessage.isInSpecialFolderType(MailFolderType.sentItems);
        }, this);
        this._propertyCache.add("displayViewIdString", "isJunk", function () {
            return this._platformMailMessage.isInSpecialFolderType(MailFolderType.junkMail);
        }, this);
        this._propertyCache.add("displayViewIdString", "isInOutbox", function () {
            return this._platformMailMessage.isInSpecialFolderType(MailFolderType.outbox);
        }, this);
        this._propertyCache.add("displayViewIdString", "primaryUIView", function () {
            var platformView = this._propertyCache.get("primaryView");

            if (platformView) {
                return new UIDataModel.MailView(platformView, this._account);
            }
            return null;
        }, this);
        this._propertyCache.add("displayViewIdString", "isInPinnedFolderView", function () {
            var viewIds = this._platformMailMessage.displayViewIds,
                account = this._account;
            return Array.prototype.some.call(viewIds, function (viewId) {
                var view = account.loadView(viewId);
                if (view) {
                    return view.isPinnedToNavPane;
                }
                return false;
            });
        }, this);
    };

    // Functions
    MailMessage.prototype.getEmbeddedAttachmentCollection = function () { return this._platformMailMessage.getEmbeddedAttachmentCollection(); };
    MailMessage.prototype.getOrdinaryAttachmentCollection = function () { return this._platformMailMessage.getOrdinaryAttachmentCollection(); };

    Object.defineProperty(MailMessage.prototype, "platformMailMessage", { get: function () { return this._platformMailMessage; }, enumerable: true });

    // These properties go directly down to the platform object
    Object.defineProperty(MailMessage.prototype, "canFlag", { get: function () { return this._platformMailMessage.canFlag; }, enumerable: true });
    Object.defineProperty(MailMessage.prototype, "canMove", { get: function () { return this._platformMailMessage.canMove; }, enumerable: true });
    Object.defineProperty(MailMessage.prototype, "sanitizedVersion", { get: function () { return this._platformMailMessage.sanitizedVersion;}, enumerable: true });
    Object.defineProperty(MailMessage.prototype, "canMarkRead", { get: function () { return this._platformMailMessage.canMarkRead;}, enumerable: true });
    Object.defineProperty(MailMessage.prototype, "canMoveFromOutboxToDrafts", { get: function () { return this._platformMailMessage.canMoveFromOutboxToDrafts;}, enumerable: true });
    Object.defineProperty(MailMessage.prototype, "isLocalMessage", { get: function () { return this._platformMailMessage.isLocalMessage;}, enumerable: true });
    Object.defineProperty(MailMessage.prototype, "accountId", { get: function () { return this._platformMailMessage.accountId; }, enumerable: true });
    Object.defineProperty(MailMessage.prototype, "account", { get: function () { return this._account; }, enumerable: true });
    Object.defineProperty(MailMessage.prototype, "parentConversationId", { get: function () {
        // The parentConversationId of a message can be an empty string sometimes even it actually belongs to a conversation
        // since change notifications to an object and a collection are not aggregated concurrently in a single operation.
        // This is especially true when a conversation is newly inserted
        // Use this property at your own risk
        return this._platformMailMessage.parentConversationId;
    }, enumerable: true });

    Object.defineProperty(MailMessage.prototype, "fromRecipientString", { get: function () {
        return this._propertyCache.get("fromRecipientString");
    }, enumerable: true });

    Object.defineProperty(MailMessage.prototype, "toRecipientString", { get: function () {
        return this._propertyCache.get("toRecipientString");
    }, enumerable: true });

    Object.defineProperty(MailMessage.prototype, "preview", {
        get: function () {
            var preview = this._platformMailMessage.preview || this.subject;
            // IE auto converts new line characters into br tags when using innerText.
            // This will mess up one line view in the message list, so we need to strip them out.
            return preview.replace(/\r\n|\r|\n/gi, " ").trim();
        },
        enumerable: true
    });

    Object.defineProperty(MailMessage.prototype, "received", { get: function () { return this._platformMailMessage.received; }, enumerable: true });
    Object.defineProperty(MailMessage.prototype, "sent", { get: function () { return this._platformMailMessage.sent; }, enumerable: true });
    Object.defineProperty(MailMessage.prototype, "modified", { get: function () { return this._platformMailMessage.modified; }, enumerable: true });
    Object.defineProperty(MailMessage.prototype, "hasAttachments", { get: function () { return this._platformMailMessage.hasAttachments; }, enumerable: true });
    Object.defineProperty(MailMessage.prototype, "bodyDownloadStatus", { get: function () { return this._platformMailMessage.bodyDownloadStatus; }, enumerable: true });
    Object.defineProperty(MailMessage.prototype, "calendarMessageType", { get: function () { return this._platformMailMessage.calendarMessageType; }, enumerable: true });
    Object.defineProperty(MailMessage.prototype, "calendarRequest", { get: function () {
            return this.calendarMessageType === CalendarMessageType.request;
    }, enumerable: true });
    Object.defineProperty(MailMessage.prototype, "calendarEvent", {
        get: function () {
            if (!this._fetchedCalendarEvent) {
                this._calendarEvent        = this._platformMailMessage.calendarEvent;
                this._fetchedCalendarEvent = true;
            }

            return this._calendarEvent;
        },
        enumerable: true
    });
    Object.defineProperty(MailMessage.prototype, "needBody", {
        get: function () {
            return this._platformMailMessage.needBody;
        },
        enumerable: true
    });
    Object.defineProperty(MailMessage.prototype, "isComposeBodyTruncated", {
        get: function () {
            var preferredType = MailBodyType.html;
            if (!this._platformMailMessage.hasBody(preferredType)) {
                preferredType = MailBodyType.plainText;
            }

            return this._platformMailMessage.isBodyTruncated(preferredType);
        }, enumerable: true
    });
    Object.defineProperty(MailMessage.prototype, "calendarInvite", { get: function () {
        return this._platformMailMessage.calendarMessageType !== CalendarMessageType.none;
    }, enumerable: true
    });

    Object.defineProperty(MailMessage.prototype, "senderRecipient", {
        get: function () {
            // returns the senderRecipient from the platform - the recipient object representing the "sender" field
            // This field is present when the mail was sent by the sender on behalf of someone else (indicated in the "from" field)
            // This is possible with certain mailbox permissions or when forwarding meetings
            var recipient = this._platformMailMessage.senderRecipient;
            Debug.assert(Jx.isNullOrUndefined(recipient) || Jx.isInstanceOf(recipient, Plat.IRecipient));
            return recipient;
        },
        enumerable: true
    });

    Object.defineProperty(MailMessage.prototype, "irmCanEdit", {
        get: function () {
            var rightsManagementLicense = this._platformMailMessage;
            return rightsManagementLicense.irmCanEdit;
        }, enumerable: true
    });
    Object.defineProperty(MailMessage.prototype, "irmCanExtractContent", {
        get: function () {
            var rightsManagementLicense = this._platformMailMessage;
            return rightsManagementLicense.irmCanExtractContent;
        }, enumerable: true
    });
    Object.defineProperty(MailMessage.prototype, "irmCanForward", {
        get: function () {
            var rightsManagementLicense = this._platformMailMessage;
            return rightsManagementLicense.irmCanForward;
        }, enumerable: true
    });
    Object.defineProperty(MailMessage.prototype, "irmCanPrint", {
        get: function () {
            var rightsManagementLicense = this._platformMailMessage;
            return rightsManagementLicense.irmCanPrint;
        }, enumerable: true
    });
    Object.defineProperty(MailMessage.prototype, "irmCanReply", {
        get: function () {
            var rightsManagementLicense = this._platformMailMessage;
            return rightsManagementLicense.irmCanReply;
        }, enumerable: true
    });
    Object.defineProperty(MailMessage.prototype, "irmCanReplyAll", {
        get: function () {
            var rightsManagementLicense = this._platformMailMessage;
            return rightsManagementLicense.irmCanReplyAll;
        }, enumerable: true
    });
    Object.defineProperty(MailMessage.prototype, "irmTemplateDescription", {
        get: function () {
            var rightsManagementLicense = this._platformMailMessage;
            return rightsManagementLicense.irmTemplateDescription;
        }, enumerable: true
    });
    Object.defineProperty(MailMessage.prototype, "irmTemplateName", {
        get: function () {
            var rightsManagementLicense = this._platformMailMessage;
            return rightsManagementLicense.irmTemplateName;
        }, enumerable: true
    });
    Object.defineProperty(MailMessage.prototype, "sourceMessageStoreId", { get: function () { return this._platformMailMessage.sourceMessageStoreId; }, enumerable: true });

    // These properties override platform object properties
    Object.defineProperty(MailMessage.prototype, "cc", { get: function () { return UIDataModel.MailItem.convertVectorToArray(this._platformMailMessage.ccRecipients); }, enumerable: true });
    Object.defineProperty(MailMessage.prototype, "bcc", { get: function () { return UIDataModel.MailItem.convertVectorToArray(this._platformMailMessage.bccRecipients); }, enumerable: true });

    Object.defineProperty(MailMessage.prototype, "primaryViewId", {
        get: function () {
            var viewIds = this._platformMailMessage.displayViewIds;
            if (viewIds.length > 0) {
                return viewIds[0];
            }
            return null;
        }, enumerable: true
    });
    Object.defineProperty(MailMessage.prototype, "displayViewIds", {
        get: function () {
            return this._platformMailMessage.displayViewIds;
        }, enumerable: true
    });

    Object.defineProperty(MailMessage.prototype, "primaryView", { get: function () { return this._propertyCache.get("primaryUIView"); }, enumerable: true });

    MailMessage.prototype.getBestViewName = function (viewId) {
        Debug.assert(Jx.isNonEmptyString(viewId));
        // Gets the display name of the best view to say this message is in
        var bestViewId = this._platformMailMessage.bestDisplayViewId(viewId);

        var bestView = this._account.loadView(bestViewId);
        return bestView ? bestView.name : null;
    };

    MailMessage.prototype.isInView = function (viewId) {
        Debug.assert(Jx.isNonEmptyString(viewId));

        var bestViewId = this._platformMailMessage.bestDisplayViewId(viewId);

        return bestViewId === viewId;
    };

    Object.defineProperty(MailMessage.prototype, "read", {
        get: function () { return this._platformMailMessage.read; }, enumerable: true
    });

    Object.defineProperty(MailMessage.prototype, "flagged", {get: function () { return this._platformMailMessage.flagged; }, enumerable: true });
    Object.defineProperty(MailMessage.prototype, "isFromPersonPinned", {get: function () { return this._platformMailMessage.isFromPersonPinned; }, enumerable: true });
    Object.defineProperty(MailMessage.prototype, "hasNewsletterCategory", { get: function () { return this._platformMailMessage.hasNewsletterCategory; }, enumerable: true });
    Object.defineProperty(MailMessage.prototype, "hasSocialUpdateCategory", { get: function () { return this._platformMailMessage.hasSocialUpdateCategory; }, enumerable: true });
    Object.defineProperty(MailMessage.prototype, "allowExternalImages", {
        get: function () {
            if (this._platformMailMessage.allowExternalImages) {
                return true;
            }

            return this._account.mailResource.allowExternalImages;
        },
        set: function (fAllow) {
            ///<param name="fAllow" type="Boolean"/>
            this._setBoolProperty("allowExternalImages", fAllow);
        }
    });

    Object.defineProperty(MailMessage.prototype, "isInInbox", { get: function () { return this._propertyCache.get("isInInbox"); }, enumerable: true });
    Object.defineProperty(MailMessage.prototype, "isDraft", { get: function () { return this._propertyCache.get("isDraft"); }, enumerable: true });
    Object.defineProperty(MailMessage.prototype, "hasDraft", { get: function () { return this.isDraft; }, enumerable: true });
    Object.defineProperty(MailMessage.prototype, "isInDeletedItems", { get: function () { return this._propertyCache.get("isInDeletedItems"); }, enumerable: true });
    Object.defineProperty(MailMessage.prototype, "isInSentItems", { get: function () { return this._propertyCache.get("isInSentItems"); }, enumerable: true });
    Object.defineProperty(MailMessage.prototype, "isJunk", { get: function () { return this._propertyCache.get("isJunk"); }, enumerable: true });
    Object.defineProperty(MailMessage.prototype, "isInOutbox", { get: function () { return this._propertyCache.get("isInOutbox"); }, enumerable: true });
    Object.defineProperty(MailMessage.prototype, "isInPinnedFolderView", { get: function () { return this._propertyCache.get("isInPinnedFolderView"); }, enumerable: true });
    Object.defineProperty(MailMessage.prototype, "syncStatus", { get: function () { return this._platformMailMessage.syncStatus; }, enumerable: true });
    Object.defineProperty(MailMessage.prototype, "hasSyncError", { get: function () { return this.syncStatus < 0; }, enumerable: true });
    Object.defineProperty(MailMessage.prototype, "isStuckInOutbox", { get: function () {
        return this.hasSyncError && this.isInOutbox;
    }, enumerable: true
    });

    Object.defineProperty(MailMessage.prototype, "isOutboundFolder", {
        get: function () {
            return this.isInOutbox ||
                this.isInSentItems ||
                this.isDraft;
        }, enumerable: true
    });

    MailMessage.prototype.hasBody = function (type) {
        Debug.assert(type > 0 && type < MailBodyType.max);
        var body = this.getBodyByType(type);
        return Boolean(body && (body.type == type));
    };

    MailMessage.prototype.getBodyByType = function (type) {
        var logString = "getBodyByType:" + type;
        _markStart(logString);
        var result = null;
        switch (type) {
            case MailBodyType.sanitized:
                result = this.getSanitizedBody();
                break;
            case MailBodyType.html:
                if (this.sanitizedVersion !== SanitizedVersion.noHtmlBody) {
                    result = this._platformMailMessage.getBody(type);
                }
                break;
            default:
                result = this._platformMailMessage.getBody(type);
                break;
        }
        _markStop(logString);
        return result;
    };

    MailMessage.prototype.getSanitizedBody = function () {
        _markStart("getSanitizedBody");
        if (this.sanitizedVersion !== SanitizedVersion.current) {
            _mark("getSanitizedBody - sanitized version not current");
            _markStop("getSanitizedBody");
            return null;
        }

        var scrubbedBody = this._platformMailMessage.getBody(MailBodyType.sanitized);
        if (!scrubbedBody) {
            this._clearSanitizedBody();
            _mark("getSanitizedBody - not sanitized");
            _markStop("getSanitizedBody");
            return null;
        }

        _mark("getSanitizedBody - validating");
        var allowExternalImages = this.allowExternalImages;
        var metadata = JSON.parse(scrubbedBody.metadata);
        if (metadata.hasCSSImages && (metadata.allowedCSSImages !== allowExternalImages)) {
            this._clearSanitizedBody();
            _mark("getSanitizedBody - incorrect image setting");
            _markStop("getSanitizedBody");
            return null;
        }

        // Check if this message meets the direction requirements
        if (Mail.Utilities.haveRtlLanguage() && !metadata.readingDirection && Mail.Globals.appSettings.readingDirection === Mail.AppSettings.Direction.auto) {
            this._clearSanitizedBody();
            _mark("getSanitizedBody - Needs direction metadata");
            _markStop("getSanitizedBody");
            return null;
        }

        
        // If the hash is "hash", then we'll just ignore whether it actually matches.
        // This is to simplify the test app's mock data (so that you don't have to also make an html body with a matching hash).
        if (metadata.htmlBodyHash === "hash") {
            _mark("getSanitizedBody - debug hash");
            _markStop("getSanitizedBody");
            return scrubbedBody;
        }
        

        var htmlBody = this._platformMailMessage.getBody(MailBodyType.html);
        if (Jx.isObject(htmlBody) && (metadata.htmlBodyHash !== Mail.Validators.hashString(htmlBody.body))) {
            this._clearSanitizedBody();
            _mark("getSanitizedBody - wrong hash");
            _markStop("getSanitizedBody");
            return null;
        }

        _mark("getSanitizedBody - success");
        _markStop("getSanitizedBody");
        return scrubbedBody;
    };

    MailMessage.prototype.getBody = function () {
        Debug.assert(arguments.length === 0);
        if (this.isJunk) {
            return null;
        }

        return this.getSanitizedBody();
    };

    MailMessage.prototype.getJunkBody = function () {
        var platMessage = this._platformMailMessage;
        Debug.assert(Jx.isInstanceOf(platMessage, Plat.MailMessage));
        var body = platMessage.getJunkBody();
        Debug.assert(Jx.isInstanceOf(body, Plat.MailBody));
        return body;
    };

    // These properties exist only on the JS wrapper objects
    Object.defineProperty(MailMessage.prototype, "previewHTML", {
        get: function () {
            return this._propertyCache.get("previewHTML");
        }, enumerable: true
    });

    Object.defineProperty(MailMessage.prototype, "bestDate", { get: function () {
        var date;
        if (this.isDraft || this.isInOutbox) {
            date = this.modified;
        } else if (this.isInSentItems) {
            date = this.sent;
        } else {
            // Items that are deleted from the outbox when we are offline do not have a received date.  In this case, we are falling back to the modified date
            date = this.received || this.modified || this.sent;
        }
        return date;
    }, enumerable: true
    });

    Object.defineProperty(MailMessage.prototype, "bestTimeShortString", { get: function () { return Mail.Utilities.getShortTimeString(this.bestDate); }, enumerable: true });

    UIDataModel.MailMessage.prototype.getKeepAlive = function () {
        return this._platformMailMessage.getKeepAlive();
    };

    MailMessage.prototype.isBodyTruncated = function (bodyType) {
        // If you ask for the sanitized version and we only have an old one, then pretend we don't have anything at all.
        if (bodyType === MailBodyType.sanitized && this.sanitizedVersion !== SanitizedVersion.current) {
            return false;
        }
        return this._platformMailMessage.isBodyTruncated(bodyType);
    };

    MailMessage.prototype.downloadFullBody = function () {
        this._platformMailMessage.downloadFullBody();
    };

    MailMessage.prototype.moveFromOutboxToDraftsAndCommit = function () {
        this._platformMailMessage.moveFromOutboxToDraftsAndCommit();
    };

    MailMessage.prototype._setBoolProperty = function (property, value) {
        ///<param name="property" type="String"/>
        ///<param name="value" type="Boolean"/>

        Debug.assert(Jx.isNonEmptyString(property));
        Debug.assert(Jx.isBoolean(value));

        var platformMessage = this._platformMailMessage;
        if (platformMessage[property] !== value) {
            platformMessage[property] = value;
            this.commit();
        }
    };

    MailMessage.prototype.addSanitizedBody = function (html, metadata, isTruncated) {
        Debug.assert(Jx.isString(html));
        Debug.assert(Jx.isObject(metadata));
        Debug.assert(Jx.isString(JSON.stringify(metadata)));
        Debug.assert(Jx.isBoolean(isTruncated));
        var bodyType = MailBodyType.sanitized;
        var message = this._platformMailMessage;
        var sanitizedBody = message.getBody(bodyType);
        if (!sanitizedBody) {
            sanitizedBody = message.createBody();
            sanitizedBody.type = bodyType;
        }
        sanitizedBody.truncated = isTruncated;
        sanitizedBody.body = html;
        Debug.assert(Jx.isBoolean(metadata.hasExternalImages));
        Debug.assert(Jx.isBoolean(metadata.hasExternalBackgrounds));
        Debug.assert(Jx.isBoolean(metadata.hasCSSImages));
        Debug.assert(Jx.isBoolean(metadata.allowedCSSImages));
        sanitizedBody.metadata = JSON.stringify(metadata);
        this._setSanitizedVersion(SanitizedVersion.current, true /*alwaysCommit*/);
    };

    MailMessage.prototype._clearSanitizedBody = function () {
        // You can't actually delete a body.  So we're just going to flag the message
        // as "not sanitized" and refuse - at the UI data model layer - to return the
        // sanitized body if the sanitized version is "not sanitized".
        Debug.assert(this._platformMailMessage.sanitizedVersion !== SanitizedVersion.notSanitized);
        this._setSanitizedVersion(SanitizedVersion.notSanitized);
    };

    MailMessage.prototype.setNoHTMLBody = function () {
        this._setSanitizedVersion(SanitizedVersion.noHtmlBody);
    };

    MailMessage.prototype.setDraftSanitizedVersion = function () {
        Debug.assert(this.isDraft);
        this._setSanitizedVersion(SanitizedVersion.locallyCreatedMessage);
    };

    MailMessage.prototype._setSanitizedVersion = function (version, alwaysCommit) {
        var platformMailMessage = this._platformMailMessage;
        Debug.assert(Jx.isValidNumber(version));
        alwaysCommit = alwaysCommit || (platformMailMessage.sanitizedVersion !== version);
        if (alwaysCommit) {
            platformMailMessage.sanitizedVersion = version;
            platformMailMessage.commitSanitizedBody();
        }
    };

    MailMessage.prototype.recordAction = function (action) {
        var primaryView = this.primaryView;
        if (primaryView) {
            var folder = primaryView.folder;
            if (folder) {
                folder.recordAction(action);
            }
        }
    };

    MailMessage.prototype.commit = function () {
        try {
            /// This may throw if the message is in the process of being deleted
            this._platformMailMessage.commit();
        } catch (e) {
            Jx.log.exception("Failed to commit email message " + this._platformMailMessage.objectId, e);
        }
    };

    function generateSingleLineHTMLFromString(str) {
        /// <param name="str" type="String"></param>
        /// <returns type="String"></returns>
        var ret = str;
        if (Jx.isNonEmptyString(ret)) {
            ret = ret.trim();
            ret = Jx.escapeHtmlToSingleLine(ret);
        }
        return ret;
    }

    function _mark(s) { Jx.mark("UIDataModel.MailMessage." + s); }
    function _markStart(s) { Jx.mark("UIDataModel.MailMessage." + s + ",StartTA,Mail,MailMessage"); }
    function _markStop(s) { Jx.mark("UIDataModel.MailMessage." + s + ",StopTA,Mail,MailMessage"); }
});
