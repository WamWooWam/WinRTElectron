
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx, Mail, Debug, Microsoft, MSApp, ModernCanvas */
/*jshint browser:true*/

Jx.delayDefine(Mail.Worker, "_Scrubber", function () {
    "use strict";

    var Plat = Microsoft.WindowsLive.Platform,
        MailBodyType = Plat.MailBodyType,
        Bidi = Jx.Bidi;

    // DO NOT USE THIS CLASS
    // This is meant to be called only from AsyncMessageScrubber and scrubSynchronously
    // Please only use those APIs.
    var Scrubber = Mail.Worker._Scrubber = function (platform, message, options) {
        _markAsyncStart("scrub");
        _markStart("ctor");
        Debug.assert(Jx.isInstanceOf(platform, Plat.Client));
        Debug.assert(Jx.isInstanceOf(message, Mail.UIDataModel.MailMessage));
        // Compose likes to waste my time with empty messages.
        //Debug.assert(Jx.isNonEmptyString(message.objectId) && (message.objectId !== "0"));
        Debug.assert(!message.pendingRemoval);
        this._message = message;
        _mark("objectId = " + message.objectId);

        this._onComplete = null;
        this._onCompleteContext = null;
        this._priority = Mail.Priority.workerMessageScrubber;
        this._scrubDraft = false;
        if (options) {
            if (options.onComplete) {
                Debug.assert(Jx.isFunction(options.onComplete));
                this._onComplete = options.onComplete;
            }
            if (options.onCompleteContext) {
                Debug.assert(Jx.isObject(options.onCompleteContext));
                this._onCompleteContext = options.onCompleteContext;
            }
            if (options.priority) {
                Debug.assert(Jx.scheduler.isValidPriority(options.priority));
                this._priority = options.priority;
            }
            if (options.scrubDrafts) {
                Debug.assert(Jx.isBoolean(options.scrubDrafts));
                this._scrubDraft = true;
            }
            Debug.only(Object.keys(options).forEach(function (option) {
                Debug.assert(["onComplete", "onCompleteContext", "priority", "scrubDrafts"].indexOf(option) !== -1, "Worker._Scrubber:" + option + " is not a valid option");
            }));
        }

        this._done = false;
        var jobSet = this._jobSet = Jx.scheduler.createJobSet();
        this._disposer = new Mail.Disposer(jobSet);
        this._htmlBody = null;
        this._htmlBodyTruncated = null;

        this._allowExternalImages = message.allowExternalImages;

        this._scrubbedHTML = null;
        this._rawHTML = null;
        this._htmlBodyHash = null;
        this._document = null;
        this._rawHTMLParts = null;
        this._nextPart = 0;
        this._hasExternalImages = false;
        this._hasExternalBackgrounds = false;
        this._hasCSSImages = false;
        this._hrefWorker = null;
        this._tabIndexWorker = null;
        this._titleWorker = null;
        this._elements = null;
        this._innerText = "";
        this._readingDirection = Bidi.Values.none;
        this._sanitizedBody = null;

        Jx.scheduler.addJob(jobSet, this._priority, "Scrubber._setup", this._setup, this);
        Debug.only(Object.seal(this));
        _markStop("ctor");
    };

    Scrubber.scrubSynchronously = function (platform, message, options) {
        Debug.assert(Jx.isInstanceOf(platform, Plat.Client));
        Debug.assert(Jx.isInstanceOf(message, Mail.UIDataModel.MailMessage));
        var scrubber = new Scrubber(platform, message, options);
        scrubber.runSynchronous();
        return scrubber;
    };

    var maxBlockSize = 10*1024; // 10k
    Debug.call(function () {maxBlockSize = 512;});

    var unblockedImagePrefixes = ["cid:", "file:"];
    function isUrlAllowed(url) {
        url = url.toLowerCase();
        return unblockedImagePrefixes.some(function (allowedPrefix) {
            return (url.indexOf(allowedPrefix) === 0);
        });
    }
    var localCSSFiles = [
        "/ModernMail/resources/css/ReadingPaneBody.css"
    ];


    Scrubber.prototype = {
        dispose: function () {
            _markStart("dispose");
            this._disposer.dispose();
            this._disposer = null;
            _markStop("dispose");
        },
        getDocument: function () {
            _markStart("getDocument");
            Debug.assert(this._done);
            var doc = this._document;
            if (!doc) {
                this._createDocument();
                doc = this._document;
                doc.open();
                var sanitizedBody = this.getSanitizedBody();
                if (sanitizedBody) {
                    MSApp.execUnsafeLocalFunction(function () {
                        doc.write(sanitizedBody.body);
                    });
                }
                doc.close();
            }
            Debug.assert(doc);
            _markStop("getDocument");
            return doc;
        },
        isSameHtmlBody: function (body) {
            return this._htmlBodyHash === Mail.Validators.hashString(body.body);
        },
        runSynchronous: function () {
            Debug.assert(!this._done);
            this._jobSet.runSynchronous();
        },
        getSanitizedBody: function () {
            if (this._sanitizedBody === null) {
                this._sanitizedBody = this._message.getSanitizedBody()
            }
            return this._sanitizedBody;
        },
        _setup: function () {
            _markStart("_setup");
            var message = this._message;
            Debug.assert(Jx.isInstanceOf(message, Mail.UIDataModel.MailMessage));
            if (this.getSanitizedBody()) {
                this._done = true;
                this._raiseCompleteEvent();
                _markStop("_setup");
                return;
            }
            if (!this._scrubDraft && message.isDraft) {
                this._done = true;
                message.setDraftSanitizedVersion();
                this._raiseCompleteEvent();
                _markStop("_setup");
                return;
            }
            Debug.assert(this._htmlBody === null);
            var htmlBody = this._htmlBody = message.getBodyByType(MailBodyType.html);
            if (!htmlBody) {
                this._done = true;
                message.setNoHTMLBody();
                this._raiseCompleteEvent();
                _markStop("_setup");
                return;
            }
            this._htmlBodyTruncated = htmlBody.truncated;
            Debug.assert(Jx.isBoolean(this._htmlBodyTruncated));
            Jx.scheduler.addJob(this._jobSet, this._priority, "Scrubber._scrub", this._scrub, this);
            _markStop("_setup");
        },
        _scrub: function () {
            _markStart("_scrub");
            this._addJob("Scrubber._createDocument", this._createDocument);
            this._addJob("Scrubber._toStaticHTML", this._toStaticHTML);
            this._addJob("Scrubber._breakHTML", this._breakHTML);
            this._addJob("Scrubber._writeHTML", this._writeHTML);
            this._addJob("Scrubber._enablePhoneDetection", this._enablePhoneDetection);
            this._addJob("Scrubber._bodyDirection", this._bodyDirection);
            this._addJob("Scrubber._getInnerText", this._getInnerText);
            this._addJob("Scrubber._getReadingDirection", this._getReadingDirection);
            this._addJob("Scrubber._blockImages", this.scheduleElements("img", this._blockImages));
            this._addJob("Scrubber._blockBackgrounds", this.scheduleElements("[background]", this._blockBackgrounds));
            this._addJob("Scrubber._blockInlineImageStyles", this.scheduleElements("[style]", this._blockInlineImageStyles));
            this._addJob("Scrubber._blockCSSImages", this.scheduleElements("style", this._blockCSSImages));
            this._addJob("Scrubber._removeBadTags", this._removeBadTags);
            this._addJob("Scrubber._fixHRs", this._fixHRs);
            this._addJob("Scrubber._addLocalCSS", this._addLocalCSS);
            this._addJob("Scrubber._fixHREFs", this._fixHREFs);
            this._addJob("Scrubber._fixTabIndexes", this._fixTabIndexes);
            this._addJob("Scrubber._fixTitles", this._fixTitles);
            this._addJob("Scrubber._serializeBody", this._serializeBody);
            this._addJob("Scrubber._saveBody", this._saveBody);
            this._addJob("Scrubber._raiseCompleteEvent", this._raiseCompleteEvent);
            _markStop("_scrub");
        },
        _addJob: function (description, func) {
            Debug.assert(Jx.isNonEmptyString(description));
            Debug.assert(Jx.isFunction(func));
            Jx.scheduler.addJob(this._jobSet, this._priority, description, function () {
                try {
                    return func.call(this);
                } catch (ex) {
                    Jx.log.exception("ScrubHelper - unable to complete " + description, ex);
                }
                this._jobSet.dispose();
                this._done = true;
                this._message.setNoHTMLBody();
                this._raiseCompleteEvent();
                return Jx.Scheduler.repeat(false);
            }, this);
        },
        _raiseCompleteEvent: function () {
            _markStart("_raiseCompleteEvent");
            _markAsyncStop("scrub");
            Debug.assert(this._done);
            if (this._onComplete) {
                this._onComplete.call(this._onCompleteContext);
            }
            _markStop("_raiseCompleteEvent");
        },
        _createDocument: function () {
            _markStart("_createDocument");
            Debug.assert(this._document === null);
            this._document = document.implementation.createHTMLDocument("");
            _markStop("_createDocument");
        },
        _toStaticHTML: function () {
            _markStart("_toStaticHTML");
            Debug.assert(Jx.isInstanceOf(this._htmlBody, Plat.MailBody));

            var html = this._htmlBody.body;
            this._htmlBodyHash = Mail.Validators.hashString(html);

            Debug.assert(this._rawHTML === null);
            try {
                this._rawHTML = window.toStaticHTML(html);
            } catch (ex) {
                Jx.log.exception("toStaticHTML threw", ex);
                this._rawHTML = "";
            }
            Debug.assert(Jx.isString(this._rawHTML));
            _markStop("_toStaticHTML");
        },
        _breakHTML: function () {
            _markStart("_breakHTML");
            var html = this._rawHTML,
                htmlLength = html.length;
            var htmlParts = this._rawHTMLParts = [];
            var pos = 0;
            while (pos < htmlLength) {
                var remaining = htmlLength - pos;
                var blockSize = Math.min(remaining, maxBlockSize);
                htmlParts.push(html.substr(pos, blockSize));
                pos += blockSize;
            }
            Debug.assert(pos === htmlLength);
            Debug.assert(this._rawHTMLParts.length === Math.ceil(htmlLength / maxBlockSize));
            if (this._rawHTMLParts.length === 0) {
                this._rawHTMLParts = [""];
            }
            _markStop("_breakHTML");
        },
        _writeHTML: function () {
            _markStart("_writeHTML");
            var htmlParts = this._rawHTMLParts;
            Debug.assert(this._nextPart < htmlParts.length);
            var partIndex = this._nextPart++,
                doc = this._document;
            if (partIndex === 0) {
                doc.open();
            }
            MSApp.execUnsafeLocalFunction(function () {
                doc.write(htmlParts[partIndex]);
            });
            var done = (this._nextPart === htmlParts.length);
            if (done) {
                doc.close();
            }
            _markStop("_writeHTML");
            return Jx.Scheduler.repeat(!done);
        },
        _enablePhoneDetection: function () {
            _markStart("_enablePhoneDetection");
            this._document.documentElement.setAttribute("x-ms-format-detection", "phone");
            _markStop("_enablePhoneDetection");
        },
        _bodyDirection: function () {
            _markStart("_bodyDirection");
            var body = this._document.body,
                messageDirection = Bidi.getDocumentDirection(this._document);

            // If the email body already specifies a direction, use that.
            // Else, if the first element in the body specifies a direction, use that.
            // Else, use mail app's direction.
            if (!messageDirection) {
                var childNode = body.firstChild;

                // skip any text nodes before the first element.
                // once we find the first element thens stop.  Older Mail clients
                // set the direction on the first element, and it is unknown if senders
                // who only set direction on later elements meant for the entire email
                // to be in a specific direction
                while (childNode && !Jx.isHTMLElement(childNode)) {
                    childNode = childNode.nextSibling;
                }

                if (childNode && childNode.getAttribute("data-externalstyle")) {
                    body.style.direction = childNode.dir;
                }
            }
            _markStop("_bodyDirection");
        },
        _getInnerText: function () {
            _markStart("_getInnerText");
            this._innerText = this._document.body.innerText;
            _markStop("_getInnerText");
        },
        _getReadingDirection: function () {
            _markStart("_getReadingDirection");
            this._readingDirection = Bidi.getTextDirection(this._innerText);
            _markStop("_getReadingDirection");
        },
        scheduleElements: function (selector, iterator) {
            var elementList = null;
            var elementIndex = 0;
            return function () {
                if (!elementList) {
                    elementList = this._document.querySelectorAll(selector);
                }
                Debug.assert(elementIndex <= elementList.length);
                if (elementIndex < elementList.length) {
                    iterator.call(this, elementList[elementIndex]);
                    elementIndex++;
                }
                return Jx.Scheduler.repeat(elementIndex !== elementList.length);
            };
        },
        _blockImages: function (img) {
            Debug.assert(Jx.isHTMLElement(img));
            Debug.assert(img.nodeName === "IMG");
            var src = img.src;
            if (Jx.isNonEmptyString(src)) {
                img.setAttribute("data-ms-imgsrc", img.getAttribute("src"));
                if (!isUrlAllowed(src)) {
                    img.src = "";
                    this._hasExternalImages = true;
                }
            }
        },
        _blockBackgrounds: function (element) {
            Debug.assert(Jx.isHTMLElement(element));
            var background = element.background;
            if (Jx.isNonEmptyString(background)) {
                element.setAttribute("data-ms-background", element.getAttribute("background"));
                if (!isUrlAllowed(background)) {
                    element.background = "";
                    this._hasExternalBackgrounds = true;
                }
            }
        },
        _scrubStyleProperties: function (styleProperties) {
            Debug.assert(Jx.isValidNumber(styleProperties.length));
            var changed = false;
            var allowExternalImages = this._allowExternalImages;
            // Count down because changing a style will invalidate the index
            for (var j = styleProperties.length - 1; j >= 0; --j) {
                var styleName = styleProperties[j];
                var styleValue = styleProperties[styleName];
                if (Jx.isNonEmptyString(styleValue) && styleValue.indexOf("url(") >= 0) {
                    this._hasCSSImages = true;
                    if (!allowExternalImages) {
                        styleProperties[styleName] = "";
                        changed = true;
                    }
                }
            }
            return changed;
        },
        _blockInlineImageStyles: function (element) {
            Debug.assert(Jx.isHTMLElement(element));
            this._scrubStyleProperties(element.style);
        },
        _blockCSSImages: function (styleElement) {
            Debug.assert(Jx.isHTMLElement(styleElement));
            Debug.assert(styleElement.nodeName === "STYLE");
            var changed = false;
            var sheet = styleElement.sheet;
            var cssRules = sheet.cssRules;
            for (var jj = 0, jjMax = cssRules.length; jj < jjMax; ++jj) {
                var rule = cssRules[jj];
                if (rule.cssRules) {
                    rule = rule.cssRules;
                } else {
                    rule = [rule];
                }
                for (var kk = 0, kkMax = rule.length; kk < kkMax; ++kk) {
                    changed |= this._scrubStyleProperties(rule[kk].style);
                }
            }
            // IE doesn't change the style element's HTML when you change the rules it contains.
            // But cssText is modified, so we'll inject the cssText back into the element.
            if (changed) {
                Debug.assert(styleElement.innerText !== sheet.cssText);
                styleElement.innerText = sheet.cssText;
            }
        },
        _removeBadTags: function () {
            _markStart("_removeBadTags");
            ModernCanvas.runWorkersSynchronously([
                new ModernCanvas.BadElementHtmlWorker(this._document)
            ]);
            _markStop("_removeBadTags");
        },
        _fixHRs: function () {
            _markStart("_fixHRs");
            var fullWidthHRs = this._document.querySelectorAll("hr[width=\"100%\"]");
            for (var ii = 0, iiMax = fullWidthHRs.length; ii < iiMax; ii++) {
                fullWidthHRs[ii].width = "99%";
            }
            _markStop("_fixHRs");
        },
        _addLocalCSS: function () {
            _markStart("_addLocalCSS");
            var doc = this._document,
                head = doc.head;
            localCSSFiles.forEach(function (url) {
                var link = doc.createElement("link");
                link.rel = "Stylesheet";
                link.href = url;
                head.appendChild(link);
            }, this);
            _markStop("_addLocalCSS");
        },
        _fixHREFs: function () {
            _markStart("_fixHREFs");
            var hrefWorker = this._hrefWorker;
            if (!hrefWorker) {
                hrefWorker = this._hrefWorker = new ModernCanvas.HrefHtmlWorker(this._document.documentElement);
            }
            _markStop("_fixHREFs");
            return hrefWorker.run();
        },
        _fixTabIndexes: function () {
            _markStart("_fixTabIndexes");
            var tabIndexWorker = this._tabIndexWorker;
            if (!tabIndexWorker) {
                tabIndexWorker = this._tabIndexWorker = new ModernCanvas.TabIndexHtmlWorker(this._document.documentElement);
            }
            _markStop("_fixTabIndexes");
            return tabIndexWorker.run();
        },
        _fixTitles: function () {
            _markStart("_fixTitles");
            var titleWorker = this._titleWorker;
            if (!titleWorker) {
                titleWorker = this._titleWorker = new ModernCanvas.TitleAttributeHtmlWorker(this._document.documentElement);
            }
            _markStop("_fixTitles");
            return titleWorker.run();
        },
        _serializeBody: function () {
            _markStart("_serializeBody");
            Debug.assert(this._document);
            this._scrubbedHTML = this._document.documentElement.outerHTML;
            Debug.assert(Jx.isString(this._scrubbedHTML));
            _markStop("_serializeBody");
        },
        _saveBody: function () {
            _markStart("_saveBody");
            this._done = true;
            var message = this._message;
            Debug.assert(!message.pendingRemoval);
            var metadata = {
                hasExternalImages: this._hasExternalImages,
                hasExternalBackgrounds: this._hasExternalBackgrounds,
                hasCSSImages: this._hasCSSImages,
                allowedCSSImages: this._hasCSSImages ? this._allowExternalImages : false,
                htmlBodyHash: this._htmlBodyHash,
                readingDirection: this._readingDirection
            };
            Debug.assert(Jx.isString(this._scrubbedHTML));
            Debug.assert(Jx.isBoolean(this._htmlBodyTruncated));
            // Its possible the message was moved to the draft folder while being scrubbed.
            // If we're not supposed to scrub drafts, then don't save the new body.
            if (!this._scrubDraft && message.isDraft) {
                message.setDraftSanitizedVersion();
            } else {
                message.addSanitizedBody(this._scrubbedHTML, metadata, this._htmlBodyTruncated);
            }
            _markStop("_saveBody");
        }
    };

    function _mark(s) { Jx.mark("Scrubber." + s); }
    function _markStart(s) { Jx.mark("Scrubber." + s + ",StartTA,Scrubber"); }
    function _markStop(s) { Jx.mark("Scrubber." + s + ",StopTA,Scrubber"); }
    function _markAsyncStart(s) { Jx.mark("Scrubber:" + s + ",StartTM,Scrubber"); }
    function _markAsyncStop(s) { Jx.mark("Scrubber:" + s + ",StopTM,Scrubber"); }

});
