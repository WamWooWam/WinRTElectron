Jx.delayDefine(Mail.UIDataModel, "MailMessage", function() {
    "use strict";
    function c(n) {
        var t = n;
        return Jx.isNonEmptyString(t) && (t = t.trim(),
        t = Jx.escapeHtmlToSingleLine(t)),
        t
    }
    function f(n) {
        Jx.mark("UIDataModel.MailMessage." + n)
    }
    function h(n) {
        Jx.mark("UIDataModel.MailMessage." + n + ",StartTA,Mail,MailMessage")
    }
    function e(n) {
        Jx.mark("UIDataModel.MailMessage." + n + ",StopTA,Mail,MailMessage")
    }
    var u = self.Mail.UIDataModel
      , i = Microsoft.WindowsLive.Platform
      , o = i.MailFolderType
      , r = i.SanitizedVersion
      , t = i.MailBodyType
      , s = i.CalendarMessageType
      , n = u.MailMessage = function(n, t) {
        this._platformMailMessage = n;
        this._account = t;
        this._initMailItem(this._platformMailMessage);
        this._calendarEvent = null;
        this._fetchedCalendarEvent = false;
        this._addCachedProperties()
    }
    ;
    Jx.inherit(n, u.MailItem);
    u.MailMessage.prototype._addCachedProperties = function() {
        this._propertyCache.add("from", "fromRecipientString", function() {
            return this._getHeaderRecipientStringHelper("calculatedUIName", this.fromRecipientArray)
        }, this);
        this._propertyCache.add("to", "toRecipientString", function() {
            return this._getHeaderRecipientStringHelper("calculatedUIName", this.to)
        }, this);
        this._propertyCache.add("preview", "previewHTML", function() {
            return c(this.preview)
        }, this);
        this._propertyCache.add("displayViewIdString", "primaryView", function() {
            var n = this.primaryViewId, t;
            if (n)
                try {
                    return t = this._account.platform,
                    t.mailManager.tryLoadMailView(n)
                } catch (i) {
                    return null
                }
            return null
        }, this);
        this._propertyCache.add("displayViewIdString", "isInInbox", function() {
            return this._platformMailMessage.isInSpecialFolderType(o.inbox)
        }, this);
        this._propertyCache.add("displayViewIdString", "isDraft", function() {
            return this._platformMailMessage.isInSpecialFolderType(o.drafts)
        }, this);
        this._propertyCache.add("displayViewIdString", "isInDeletedItems", function() {
            return this._platformMailMessage.isInSpecialFolderType(o.deletedItems)
        }, this);
        this._propertyCache.add("displayViewIdString", "isInSentItems", function() {
            return this._platformMailMessage.isInSpecialFolderType(o.sentItems)
        }, this);
        this._propertyCache.add("displayViewIdString", "isJunk", function() {
            return this._platformMailMessage.isInSpecialFolderType(o.junkMail)
        }, this);
        this._propertyCache.add("displayViewIdString", "isInOutbox", function() {
            return this._platformMailMessage.isInSpecialFolderType(o.outbox)
        }, this);
        this._propertyCache.add("displayViewIdString", "primaryUIView", function() {
            var n = this._propertyCache.get("primaryView");
            return n ? new u.MailView(n,this._account) : null
        }, this);
        this._propertyCache.add("displayViewIdString", "isInPinnedFolderView", function() {
            var n = this._platformMailMessage.displayViewIds
              , t = this._account;
            return Array.prototype.some.call(n, function(n) {
                var i = t.loadView(n);
                return i ? i.isPinnedToNavPane : false
            })
        }, this)
    }
    ;
    n.prototype.getEmbeddedAttachmentCollection = function() {
        return this._platformMailMessage.getEmbeddedAttachmentCollection()
    }
    ;
    n.prototype.getOrdinaryAttachmentCollection = function() {
        return this._platformMailMessage.getOrdinaryAttachmentCollection()
    }
    ;
    Object.defineProperty(n.prototype, "platformMailMessage", {
        get: function() {
            return this._platformMailMessage
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "canFlag", {
        get: function() {
            return this._platformMailMessage.canFlag
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "canMove", {
        get: function() {
            return this._platformMailMessage.canMove
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "sanitizedVersion", {
        get: function() {
            return this._platformMailMessage.sanitizedVersion
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "canMarkRead", {
        get: function() {
            return this._platformMailMessage.canMarkRead
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "canMoveFromOutboxToDrafts", {
        get: function() {
            return this._platformMailMessage.canMoveFromOutboxToDrafts
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "isLocalMessage", {
        get: function() {
            return this._platformMailMessage.isLocalMessage
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "accountId", {
        get: function() {
            return this._platformMailMessage.accountId
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "account", {
        get: function() {
            return this._account
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "parentConversationId", {
        get: function() {
            return this._platformMailMessage.parentConversationId
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "fromRecipientString", {
        get: function() {
            return this._propertyCache.get("fromRecipientString")
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "toRecipientString", {
        get: function() {
            return this._propertyCache.get("toRecipientString")
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "preview", {
        get: function() {
            var n = this._platformMailMessage.preview || this.subject;
            return n.replace(/\r\n|\r|\n/gi, " ").trim()
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "received", {
        get: function() {
            return this._platformMailMessage.received
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "sent", {
        get: function() {
            return this._platformMailMessage.sent
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "modified", {
        get: function() {
            return this._platformMailMessage.modified
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "hasAttachments", {
        get: function() {
            return this._platformMailMessage.hasAttachments
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "bodyDownloadStatus", {
        get: function() {
            return this._platformMailMessage.bodyDownloadStatus
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "calendarMessageType", {
        get: function() {
            return this._platformMailMessage.calendarMessageType
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "calendarRequest", {
        get: function() {
            return this.calendarMessageType === s.request
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "calendarEvent", {
        get: function() {
            return this._fetchedCalendarEvent || (this._calendarEvent = this._platformMailMessage.calendarEvent,
            this._fetchedCalendarEvent = true),
            this._calendarEvent
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "needBody", {
        get: function() {
            return this._platformMailMessage.needBody
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "isComposeBodyTruncated", {
        get: function() {
            var n = t.html;
            return this._platformMailMessage.hasBody(n) || (n = t.plainText),
            this._platformMailMessage.isBodyTruncated(n)
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "calendarInvite", {
        get: function() {
            return this._platformMailMessage.calendarMessageType !== s.none
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "senderRecipient", {
        get: function() {
            return this._platformMailMessage.senderRecipient
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "irmCanEdit", {
        get: function() {
            var n = this._platformMailMessage;
            return n.irmCanEdit
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "irmCanExtractContent", {
        get: function() {
            var n = this._platformMailMessage;
            return n.irmCanExtractContent
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "irmCanForward", {
        get: function() {
            var n = this._platformMailMessage;
            return n.irmCanForward
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "irmCanPrint", {
        get: function() {
            var n = this._platformMailMessage;
            return n.irmCanPrint
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "irmCanReply", {
        get: function() {
            var n = this._platformMailMessage;
            return n.irmCanReply
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "irmCanReplyAll", {
        get: function() {
            var n = this._platformMailMessage;
            return n.irmCanReplyAll
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "irmTemplateDescription", {
        get: function() {
            var n = this._platformMailMessage;
            return n.irmTemplateDescription
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "irmTemplateName", {
        get: function() {
            var n = this._platformMailMessage;
            return n.irmTemplateName
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "sourceMessageStoreId", {
        get: function() {
            return this._platformMailMessage.sourceMessageStoreId
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "cc", {
        get: function() {
            return u.MailItem.convertVectorToArray(this._platformMailMessage.ccRecipients)
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "bcc", {
        get: function() {
            return u.MailItem.convertVectorToArray(this._platformMailMessage.bccRecipients)
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "primaryViewId", {
        get: function() {
            var n = this._platformMailMessage.displayViewIds;
            return n.length > 0 ? n[0] : null
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "displayViewIds", {
        get: function() {
            return this._platformMailMessage.displayViewIds
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "primaryView", {
        get: function() {
            return this._propertyCache.get("primaryUIView")
        },
        enumerable: true
    });
    n.prototype.getBestViewName = function(n) {
        var i = this._platformMailMessage.bestDisplayViewId(n)
          , t = this._account.loadView(i);
        return t ? t.name : null
    }
    ;
    n.prototype.isInView = function(n) {
        var t = this._platformMailMessage.bestDisplayViewId(n);
        return t === n
    }
    ;
    Object.defineProperty(n.prototype, "read", {
        get: function() {
            return this._platformMailMessage.read
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "flagged", {
        get: function() {
            return this._platformMailMessage.flagged
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "isFromPersonPinned", {
        get: function() {
            return this._platformMailMessage.isFromPersonPinned
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "hasNewsletterCategory", {
        get: function() {
            return this._platformMailMessage.hasNewsletterCategory
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "hasSocialUpdateCategory", {
        get: function() {
            return this._platformMailMessage.hasSocialUpdateCategory
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "allowExternalImages", {
        get: function() {
            return this._platformMailMessage.allowExternalImages ? true : this._account.mailResource.allowExternalImages
        },
        set: function(n) {
            this._setBoolProperty("allowExternalImages", n)
        }
    });
    Object.defineProperty(n.prototype, "isInInbox", {
        get: function() {
            return this._propertyCache.get("isInInbox")
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "isDraft", {
        get: function() {
            return this._propertyCache.get("isDraft")
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "hasDraft", {
        get: function() {
            return this.isDraft
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "isInDeletedItems", {
        get: function() {
            return this._propertyCache.get("isInDeletedItems")
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "isInSentItems", {
        get: function() {
            return this._propertyCache.get("isInSentItems")
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "isJunk", {
        get: function() {
            return this._propertyCache.get("isJunk")
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "isInOutbox", {
        get: function() {
            return this._propertyCache.get("isInOutbox")
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "isInPinnedFolderView", {
        get: function() {
            return this._propertyCache.get("isInPinnedFolderView")
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "syncStatus", {
        get: function() {
            return this._platformMailMessage.syncStatus
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "hasSyncError", {
        get: function() {
            return this.syncStatus < 0
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "isStuckInOutbox", {
        get: function() {
            return this.hasSyncError && this.isInOutbox
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "isOutboundFolder", {
        get: function() {
            return this.isInOutbox || this.isInSentItems || this.isDraft
        },
        enumerable: true
    });
    n.prototype.hasBody = function(n) {
        var i = this.getBodyByType(n);
        return Boolean(i && i.type == n)
    }
    ;
    n.prototype.getBodyByType = function(n) {
        var u = "getBodyByType:" + n, i;
        h(u);
        i = null;
        switch (n) {
        case t.sanitized:
            i = this.getSanitizedBody();
            break;
        case t.html:
            this.sanitizedVersion !== r.noHtmlBody && (i = this._platformMailMessage.getBody(n));
            break;
        default:
            i = this._platformMailMessage.getBody(n)
        }
        return e(u),
        i
    }
    ;
    n.prototype.getSanitizedBody = function() {
        var i, o, meta, body;
        return (h("getSanitizedBody"),
        this.sanitizedVersion !== r.current) ? (f("getSanitizedBody - sanitized version not current"),
        e("getSanitizedBody"),
        null) : (i = this._platformMailMessage.getBody(t.sanitized),
        !i) ? (this._clearSanitizedBody(),
        f("getSanitizedBody - not sanitized"),
        e("getSanitizedBody"),
        null) : (f("getSanitizedBody - validating"),
        o = this.allowExternalImages,
        meta = JSON.parse(i.metadata),
        meta.hasCSSImages && meta.allowedCSSImages !== o) ? (this._clearSanitizedBody(),
        f("getSanitizedBody - incorrect image setting"),
        e("getSanitizedBody"),
        null) : Mail.Utilities.haveRtlLanguage() && !meta.readingDirection && Mail.Globals.appSettings.readingDirection === Mail.AppSettings.Direction.auto ? (this._clearSanitizedBody(),
        f("getSanitizedBody - Needs direction metadata"),
        e("getSanitizedBody"),
        null) : (body = this._platformMailMessage.getBody(t.html), // this is just stupid
        /* Jx.isObject(body) && meta.htmlBodyHash !== Mail.Validators.hashString(body.body) */ false) ? (this._clearSanitizedBody(),
        f("getSanitizedBody - wrong hash"),
        e("getSanitizedBody"),
        null) : (f("getSanitizedBody - success"),
        e("getSanitizedBody"),
        i)
    }
    ;
    n.prototype.getBody = function() {
        return this.isJunk ? null : this.getSanitizedBody()
    }
    ;
    n.prototype.getJunkBody = function() {
        var n = this._platformMailMessage;
        return n.getJunkBody()
    }
    ;
    Object.defineProperty(n.prototype, "previewHTML", {
        get: function() {
            return this._propertyCache.get("previewHTML")
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "bestDate", {
        get: function() {
            return this.isDraft || this.isInOutbox ? this.modified : this.isInSentItems ? this.sent : this.received || this.modified || this.sent
        },
        enumerable: true
    });
    Object.defineProperty(n.prototype, "bestTimeShortString", {
        get: function() {
            return Mail.Utilities.getShortTimeString(this.bestDate)
        },
        enumerable: true
    });
    u.MailMessage.prototype.getKeepAlive = function() {
        return this._platformMailMessage.getKeepAlive()
    }
    ;
    n.prototype.isBodyTruncated = function(n) {
        return n === t.sanitized && this.sanitizedVersion !== r.current ? false : this._platformMailMessage.isBodyTruncated(n)
    }
    ;
    n.prototype.downloadFullBody = function() {
        this._platformMailMessage.downloadFullBody()
    }
    ;
    n.prototype.moveFromOutboxToDraftsAndCommit = function() {
        this._platformMailMessage.moveFromOutboxToDraftsAndCommit()
    }
    ;
    n.prototype._setBoolProperty = function(n, t) {
        var i = this._platformMailMessage;
        i[n] !== t && (i[n] = t,
        this.commit())
    }
    ;
    n.prototype.addSanitizedBody = function(n, i, u) {
        var e = t.sanitized
          , o = this._platformMailMessage
          , f = o.getBody(e);
        f || (f = o.createBody(),
        f.type = e);
        f.truncated = u;
        f.body = n;
        f.metadata = JSON.stringify(i);
        this._setSanitizedVersion(r.current, true)
    }
    ;
    n.prototype._clearSanitizedBody = function() {
        this._setSanitizedVersion(r.notSanitized)
    }
    ;
    n.prototype.setNoHTMLBody = function() {
        this._setSanitizedVersion(r.noHtmlBody)
    }
    ;
    n.prototype.setDraftSanitizedVersion = function() {
        this._setSanitizedVersion(r.locallyCreatedMessage)
    }
    ;
    n.prototype._setSanitizedVersion = function(n, t) {
        var i = this._platformMailMessage;
        t = t || i.sanitizedVersion !== n;
        t && (i.sanitizedVersion = n,
        i.commitSanitizedBody())
    }
    ;
    n.prototype.recordAction = function(n) {
        var i = this.primaryView, t;
        i && (t = i.folder,
        t && t.recordAction(n))
    }
    ;
    n.prototype.commit = function() {
        try {
            this._platformMailMessage.commit()
        } catch (n) {
            Jx.log.exception("Failed to commit email message " + this._platformMailMessage.objectId, n)
        }
    }
})
