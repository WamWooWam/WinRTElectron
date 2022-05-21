
//
// Copyright (C) Microsoft Corporation. All rights reserved.
//

Jx.delayDefine(Mail, "Validators", function () {
    "use strict";

    var algorithmProvider = null;

    Mail.Validators = {
        hasPropertyChanged : function (ev, propName) {
            /// <param name="ev" type="Event" />
            /// <param name="propName" type="String" />
            Debug.assert(Jx.isObject(ev));
            Debug.assert(Jx.isNonEmptyString(propName));
            
            // Debug checks to avoid bug regressions when events change.
            // This list of events is from MailMessage.cpp::CMailMessageBase::StoreObjectChanged
            Debug.call(function () {
                var knownProperties = null;
                if (Jx.isInstanceOf(ev.target, Microsoft.WindowsLive.Platform.MailMessage)) {
                    knownProperties = [
                        "read",
                        "flagged",
                        "from",
                        "to",
                        "cc",
                        "bcc",
                        "subject",
                        "receivedDate",
                        "modifiedDate",
                        "bodyDownloadStatus",
                        "importance",
                        "preview",
                        "lastVerb",
                        "syncStatus",
                        "hasOrdinaryAttachments",
                        "needBody",
                        "irmDontAllowProgramaticAccess",
                        "irmCannotEdit",
                        "irmCannotExtractContent",
                        "irmCannotForward",
                        "irmCannotModifyRecipients",
                        "irmCannotRemoveRightsManagement",
                        "irmCannotReply",
                        "irmCannotReplyAll",
                        "irmCannotPrint",
                        "irmExpiryDate",
                        "irmHasTemplate",
                        "irmIsntContentOwner",
                        "irmTemplateDescription",
                        "irmTemplateId",
                        "irmTemplateName",
                        "sanitizedVersion",
                        "hasNewsletterCategory",
                        "hasSocialUpdateCategory",
                        "displayViewIds",
                        "parentConversationId",
                        "allowExternalImages"
                    ];
                }
                if (knownProperties) {
                    for (var property in ev) {
                        if (property !== "type") {
                            var prop = ev[property];
                            if (Jx.isNonEmptyString(prop)) {
                                Debug.assert(knownProperties.indexOf(prop) !== -1, "Event changed unknown property " + prop);
                            }
                        }
                    }
                    Debug.assert(knownProperties.indexOf(propName) !== -1, "Looking for unknown property " + propName);
                }
            });
            return Array.prototype.indexOf.call(ev, propName) !== -1;
        },
        havePropertiesChanged : function (ev, propArray) {
            /// <param name="ev" type="Event" />
            /// <param name="propArray" type="Array" />
            /// <returns type="Boolean" />
            Debug.assert(Jx.isObject(ev));
            Debug.assert(Jx.isArray(propArray));
            return propArray.some(function (property) {
                return Mail.Validators.hasPropertyChanged(ev, property);
            });
        },
        areEqual: function (/*@dynamic*/a, /*@dynamic*/b) {
            if (a === b) {
                return true;
            }
            return Jx.isObject(a) && Jx.isObject(b) && Jx.isNonEmptyString(a.objectId) && (a.objectId === b.objectId);

        },
        clamp: function (x, min, max) {
            return Math.min(Math.max(x, min), max);
        },
        hashString: function (string) {
            Mail.writeProfilerMark("Validators.hashString", Mail.LogEvent.start);
            var Cryptography = Windows.Security.Cryptography,
                CryptographicBuffer = Cryptography.CryptographicBuffer,
                encoding = Cryptography.BinaryStringEncoding.utf16BE;

            if (!algorithmProvider) {
                var Core = Cryptography.Core;
                algorithmProvider = Core.HashAlgorithmProvider.openAlgorithm(Core.HashAlgorithmNames.sha1);
            }

            var dataBuffer = CryptographicBuffer.convertStringToBinary(string, encoding);
            var hashBuffer = algorithmProvider.hashData(dataBuffer);
            Debug.assert(hashBuffer.length === algorithmProvider.hashLength);
            var hash = CryptographicBuffer.encodeToBase64String(hashBuffer);
            Mail.writeProfilerMark("Validators.hashString", Mail.LogEvent.stop);
            return hash;
        },
        isDocumentReady: function (doc) {
            // Sometimes IE throws when accessing readyState.
            // So we'll assume not-complete until we can actually read the property.
            try {
                var readyState = doc.readyState;
                return (readyState === "complete" || readyState === "interactive");
            } catch (e) { }
            return false;
        }
    };
});

