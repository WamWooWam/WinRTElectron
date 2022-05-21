
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug,Microsoft*/

Jx.delayDefine(Mail.UIDataModel, "MailItem", function () {
    "use strict";

    var UIDataModel = Mail.UIDataModel;

    UIDataModel.MailItem = function () { };
    Jx.inherit(UIDataModel.MailItem, Mail.PlatformEventForwarder);

    // Common behaviors
    UIDataModel.MailItem.prototype._initMailItem = function (platformObject) {
        /// <param name="platformObject" type="Microsoft.WindowsLive.Platform.IObject" />
        Debug.assert(Jx.isObject(platformObject));
        Debug.assert(Jx.isInstanceOf(platformObject, Microsoft.WindowsLive.Platform.MailMessage) ||
                     Jx.isInstanceOf(platformObject, Microsoft.WindowsLive.Platform.MailConversation));
        this._platformObject = platformObject;
        this._propertyCache = new UIDataModel.CachedProperties(this._platformObject);
        this._propertyCache.add("subject", "subjectHTML", this._generateSubjectHTML, this);

        this.initForwarder(platformObject);
    };

    UIDataModel.MailItem.prototype._getHeaderRecipientStringHelper = function (nameType, peopleList) {
        Mail.writeProfilerMark("MailItem.getHeaderRecipientString - " + nameType, Mail.LogEvent.start);
        Debug.assert((nameType === "calculatedUIName") || (nameType === "fastName"));
        Debug.assert(Jx.isArray(peopleList));

        var headerString = "";
        if (peopleList.length > 0) {
            try {
                headerString = peopleList.map(function (recipient) {
                    Debug.assert(Jx.isInstanceOf(recipient, Microsoft.WindowsLive.Platform.IRecipient));
                    return recipient[nameType];
                }).join("; ");
            } catch (e) {
                // Logging for WinBlue:373859
                Jx.fault("UIMailItem.js", "_getHeaderRecipientStringHelper:" + nameType, e);
                Jx.terminateApp(e);
            }
        } else {
            headerString = this.headerNoRecipientsString;
        }
        Debug.assert(Jx.isString(headerString));

        Mail.writeProfilerMark("MailItem.getHeaderRecipientString - " + nameType, Mail.LogEvent.stop);
        return headerString;
    };

    UIDataModel.MailItem.prototype._getHeaderRecipientString = function (nameType) {
        /// <param name="nameType" type="String" />
        Debug.assert(Jx.isNonEmptyString(nameType));
        return this._getHeaderRecipientStringHelper(nameType, this.headerRecipients);
    };

    UIDataModel.MailItem.prototype._getFromRecipientString = function (nameType) {
        /// <param name="nameType" type="String" />
        Debug.assert(Jx.isNonEmptyString(nameType));
        return this._getHeaderRecipientStringHelper(nameType, this.fromRecipientArray);
    };

    Object.defineProperty(UIDataModel.MailItem.prototype, "headerRecipients", {
        get: function () {
            Mail.writeProfilerMark("MailItem.headerRecipients", Mail.LogEvent.start);
            var header = [];
            if (this.isOutboundFolder) {
                header = this.to;
            } else {
                header = this.fromRecipientArray;
            }
            Mail.writeProfilerMark("MailItem.headerRecipients", Mail.LogEvent.stop);
            Debug.assert(Jx.isArray(header));
            return header;
        },
        enumerable: true
    });

    Object.defineProperty(UIDataModel.MailItem.prototype, "fromRecipientArray", {
        get: function () {
            Mail.writeProfilerMark("MailItem.fromRecipient", Mail.LogEvent.start);
            var array = [],
                fromRecipient = /* @static_cast(Microsoft.WindowsLive.Platform.IRecipient) */ this.from;
            if (Jx.isObject(fromRecipient)) {
                array.push(fromRecipient);
            }
            Mail.writeProfilerMark("MailItem.fromRecipient", Mail.LogEvent.stop);
            Debug.assert(Jx.isArray(array));
            return array;
        },
        enumerable: true
    });

    Object.defineProperty(UIDataModel.MailItem.prototype, "fastHeaderRecipientsString", { get: function () {
        return this._getHeaderRecipientString("fastName");
    }, enumerable: true });

    Object.defineProperty(UIDataModel.MailItem.prototype, "fastFromRecipientsString", { get: function () {
        return this._getFromRecipientString("fastName");
    }, enumerable: true });

    Object.defineProperty(UIDataModel.MailItem.prototype, "slowHeaderRecipientsString", { get: function () {
        return this.isOutboundFolder ? this.toRecipientString : this.fromRecipientString;
    }, enumerable: true });

    UIDataModel.MailItem.prototype._getSubjectString = function () {
        /// <returns type="String"></returns>

        var platformObject = /*@static_cast(Microsoft.WindowsLive.Platform.IMailMessage)*/ this._platformObject;
        var result = platformObject.subject.trim();

        if (!Jx.isNonEmptyString(result)) {
            result = Jx.res.getString("mailUIMailMessageNoSubject");
        }

        if (this.calendarRequest && !this.isOutboundFolder) {
            var /* @type(String) */invitePrefix = Jx.res.getString("mailUIMailMessageCalendarInvitePrefix");
            var /* @type(String) */invitationPrefix = Jx.res.getString("mailUIMailMessageCalendarInvitationPrefix");

            if (result.substring(0, invitationPrefix.length) !== invitationPrefix) {
                if (result.substring(0, invitePrefix.length) === invitePrefix) {
                    result = result.slice(invitePrefix.length, result.length);
                }
                result = invitationPrefix + " " + result;
            }
        }
        return result;
    };
    Object.defineProperty(UIDataModel.MailItem.prototype, "subject", { get: function () { return this._getSubjectString(); }, enumerable: true });

    Object.defineProperty(UIDataModel.MailItem.prototype, "objectId", { get: function () {
        Debug.assert(Jx.isObject(this._platformObject));
        Debug.assert(Jx.isNonEmptyString(this._platformObject.objectId));
        return this._platformObject.objectId;
    }, enumerable: true });

    Object.defineProperty(UIDataModel.MailItem.prototype, "instanceNumber", { get: function () {
        Debug.assert(Jx.isObject(this._platformObject));
        Debug.assert(Jx.isValidNumber(this._platformObject.instanceNumber));
        return this._platformObject.instanceNumber;
    }, enumerable: true });

    var generateHTMLFromText_helperElement = document.createElement("div");
    function generateHTMLFromText(text) {
        Debug.Mail.log("generateHTMLFromText", Mail.LogEvent.start);
        Debug.assert(Jx.isString(text));
        generateHTMLFromText_helperElement.innerText = text;
        var result = generateHTMLFromText_helperElement.innerHTML;
        Debug.Mail.log("generateHTMLFromText", Mail.LogEvent.stop);
        return result;
    }

    UIDataModel.MailItem.prototype._generateSubjectHTML = function () {
        var subject = /* @static_cast(String) */ this.subject;
        Debug.assert(Jx.isString(subject));
        if (Jx.isNonEmptyString(subject)) {
            // Flatten the string into a single line, and escape any HTML in it
            subject = generateHTMLFromText(subject.trim().replace(/[\n\r]+/g, function () { return " "; }));
        }
        return subject;
    };
    Object.defineProperty(UIDataModel.MailItem.prototype, "subjectHTML", {
        get: function () {
            return this._propertyCache.get("subjectHTML");
        },
        enumerable: true
    });

    Object.defineProperty(UIDataModel.MailItem.prototype, "bestDateShortString", { get: function () {
        return Mail.Utilities.getShortDateString(this.bestDate);
    }, enumerable: true });

    Object.defineProperty(UIDataModel.MailItem.prototype, "bestDateLongString", { get: function () {
        return Mail.Utilities.getAbbreviatedDateString(this.bestDate);
    }, enumerable: true });

    Object.defineProperty(UIDataModel.MailItem.prototype, "lastVerb", { get: function () {
        Debug.assert(Jx.isObject(this._platformObject));
        Debug.assert(Jx.isValidNumber(this._platformObject.lastVerb));
        return this._platformObject.lastVerb;
    }, enumerable: true });

    Object.defineProperty(UIDataModel.MailItem.prototype, "importance", { get: function () {
        Debug.assert(Jx.isObject(this._platformObject));
        Debug.assert(Jx.isValidNumber(this._platformObject.importance));
        return this._platformObject.importance;
    }, enumerable: true });

    Object.defineProperty(UIDataModel.MailItem.prototype, "hasOrdinaryAttachments", { get: function () {
        Debug.assert(Jx.isObject(this._platformObject));
        Debug.assert(Jx.isBoolean(this._platformObject.hasOrdinaryAttachments));
        return this._platformObject.hasOrdinaryAttachments;
    }, enumerable: true });

    Object.defineProperty(UIDataModel.MailItem.prototype, "irmHasTemplate", { get: function () {
        Debug.assert(Jx.isObject(this._platformObject));
        Debug.assert(Jx.isBoolean(this._platformObject.irmHasTemplate));
        return this._platformObject.irmHasTemplate;
    }, enumerable: true });

    UIDataModel.MailItem.convertVectorToArray = function (vector) {
        /// <param name="vector" type="Windows.Foundation.Collections.IVector" />
        Debug.assert(Jx.isObject(vector));
        // There are some subtle differences between a vector and an array,
        // so we'll use slice (which returns an array) to create a clone.
        Debug.assert(Jx.isFunction(vector.slice));
        Debug.assert(Jx.isArray(vector.slice()));
        return vector.slice();
    };

    Object.defineProperty(UIDataModel.MailItem.prototype, "to", { get: function () {
        return UIDataModel.MailItem.convertVectorToArray(this._platformObject.toRecipients);
    }, enumerable: true });

    Object.defineProperty(UIDataModel.MailItem.prototype, "from", { get: function () {
        Debug.assert(Jx.isObject(this._platformObject));
        var fromRecipient = this._platformObject.fromRecipient;
        Debug.assert(Jx.isNullOrUndefined(fromRecipient) || Jx.isInstanceOf(fromRecipient, Microsoft.WindowsLive.Platform.IRecipient));
        return fromRecipient;
    }, enumerable: true });

    Object.defineProperty(UIDataModel.MailItem.prototype, "pendingRemoval", { get: function () {
        return !this._platformObject.isObjectValid;
    }, enumerable: true });
    Object.defineProperty(UIDataModel.MailItem.prototype, "headerNoRecipientsString", { get: function () {
        Debug.assert(Jx.isBoolean(this.isOutboundFolder));
        return Jx.res.getString(this.isOutboundFolder ? "mailUIMailMessageNoRecipients" : "mailUIMailMessageNoSender");
    }, enumerable: true });

    Object.defineProperty(UIDataModel.MailItem.prototype, "selectable", { get: function () { return true; }, enumerable: true });

    // Requires implementation
    Object.defineProperty(UIDataModel.MailItem.prototype, "isOutboundFolder", { get: function () { Debug.assert(false); return false; }, enumerable: true });
    Object.defineProperty(UIDataModel.MailItem.prototype, "read", {
        get: function () { Debug.assert(false); return false; },
        set: function () { Debug.assert(false); },
        enumerable: true
    });
    Object.defineProperty(UIDataModel.MailItem.prototype, "flagged", {
        get: function () { Debug.assert(false); return false; },
        set: function () { Debug.assert(false); },
        enumerable: true
    });
    Object.defineProperty(UIDataModel.MailItem.prototype, "totalCount", { get: function () { return 0; }, enumerable: true });

    Object.defineProperty(UIDataModel.MailItem.prototype, "preview", { get: function () { Debug.assert(false); return ""; }, enumerable: true });
    Object.defineProperty(UIDataModel.MailItem.prototype, "previewHTML", { get: function () { Debug.assert(false); return ""; }, enumerable: true });
    Object.defineProperty(UIDataModel.MailItem.prototype, "bestDate", { get: function () { Debug.assert(false); return Date.now(); }, enumerable: true });
    Object.defineProperty(UIDataModel.MailItem.prototype, "calendarInvite", { get: function () { Debug.assert(false); return false; }, enumerable: true });
    Object.defineProperty(UIDataModel.MailItem.prototype, "calendarRequest", { get: function () { Debug.assert(false); return false; }, enumerable: true });
    Object.defineProperty(UIDataModel.MailItem.prototype, "folderName", { get: function () { Debug.assert(false); return ""; }, enumerable: true });
    Object.defineProperty(UIDataModel.MailItem.prototype, "canFlag", { get: function () { Debug.assert(false); return false; }, enumerable: true });
    Object.defineProperty(UIDataModel.MailItem.prototype, "canDelete", { get: function () { Debug.assert(false); return false; }, enumerable: true });
    Object.defineProperty(UIDataModel.MailItem.prototype, "canMarkRead", { get: function () { Debug.assert(false); return false; }, enumerable: true });
    Object.defineProperty(UIDataModel.MailItem.prototype, "isLocalMessage", { get: function () { Debug.assert(false); return false; }, enumerable: true });
    Object.defineProperty(UIDataModel.MailItem.prototype, "isDraft", { get: function () { Debug.assert(false); return false; }, enumerable: true });
    Object.defineProperty(UIDataModel.MailItem.prototype, "hasDraft", { get: function () { Debug.assert(false); return false; }, enumerable: true });

});

