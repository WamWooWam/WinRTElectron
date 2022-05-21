
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug,Microsoft,MSApp*/

Jx.delayDefine(Mail, "BodyWriter", function () {
    "use strict";

    var Platform = Microsoft.WindowsLive.Platform,
        MailBodyType = Platform.MailBodyType,
        Bidi = Jx.Bidi,
        Utilities = Mail.Utilities,
        SettingsDirection = Mail.AppSettings.Direction;

    var BodyWriter = Mail.BodyWriter = function (message, doc, options, downloadStatus) {
        _markStart("ctor");
        Debug.assert(Jx.isInstanceOf(message, Mail.UIDataModel.MailMessage));
        Debug.assert(Mail.Validators.isDocumentReady(doc));
        Debug.assert(Jx.isObject(options) || Jx.isUndefined(options));
        Debug.assert(Jx.isNullOrUndefined(downloadStatus) || Jx.isInstanceOf(downloadStatus, Mail.ImageDownloadStatus));
        this._message = message;
        this._document = doc;
        this._skipWriting = false;
        this._onNoBody = null;
        this._onNoBodyContext = null;

        if (options) {
            Debug.assert(Jx.isFunction(options.onNoBody) || Jx.isUndefined(options.onNoBody));
            if (options.onNoBody) {
                this._onNoBody = options.onNoBody;
            }
            Debug.assert(Jx.isObject(options.onNoBodyContext) || Jx.isUndefined(options.onNoBodyContext));
            if (options.onNoBodyContext) {
                this._onNoBodyContext = options.onNoBodyContext;
            }
            Debug.assert(Jx.isBoolean(options.skipWriting) || Jx.isUndefined(options.skipWriting));
            if (Jx.isBoolean(options.skipWriting)) {
                this._skipWriting = options.skipWriting;
            }
            Debug.only(Object.keys(options).forEach(function (option) {
                Debug.assert(["onNoBody", "onNoBodyContext", "skipWriting", "sanitizedBody"].indexOf(option) !== -1, "BodyWriter:" + option + " is not a valid option");
            }));
        }

        this._done = false;
        this._contentWritten = false;

        this._attachments = null;
        this._downloadStatus = downloadStatus;

        this._disposer = new Mail.Disposer();
        this._disposer.add(new Mail.EventHook(message.platformMailMessage, "changed", this._onMessageChanged, this));
        this._changeJob = null;

        this._jobSet = this._disposer.add(Jx.scheduler.createJobSet());

        this._wasJunk = message.isJunk;
        if (this._wasJunk || (message.sanitizedVersion === Platform.SanitizedVersion.noHtmlBody) ) {
            this._writePlainText();
        } else {
            var sanitizedBody = (options && options.sanitizedBody) || message.getSanitizedBody();
            if (sanitizedBody) {
                this._writeBody(sanitizedBody, this._skipWriting);
            } else if (this._onNoBody) {
                this._onNoBody.call(this._onNoBodyContext);
            }
        }

        this.initEvents();
        Debug.only(Object.seal(this));
        _markStop("ctor");
    };

    BodyWriter.Events = {
        contentChanged: "contentChanged",
        contentWritten: "contentWritten",
        processingDone: "processingDone"
    };
    Jx.inherit(BodyWriter, Jx.Events);
    Debug.Events.define.apply(Debug.Events, [BodyWriter.prototype].concat(Object.keys(BodyWriter.Events)));

    BodyWriter.prototype.dispose = function () {
        _markStart("dispose");
        this._disposer.dispose();
        _markStop("dispose");
    };

    BodyWriter.prototype._setBody = function (body) {
        _markStart("_setBody");
        this._body = body;
        this._disposer.disposeNow(this._bodyChangedHook);
        this._bodyChangedHook = this._disposer.add(new Mail.EventHook(body, "changed", this._onBodyChanged, this));
        _markStop("_setBody");
    };

    BodyWriter.prototype._onHTMLWriterError = function (isValid) {
        _markStart("_onHTMLWriterError");
        if (this._writer) {
            this._disposer.disposeNow(this._writer);
            this._writer = null;
        }
        this._jobSet.cancelJobs();

        if (isValid) {
            this._writePlainText();
        } else {
            this._raiseContentChanged();
        }
        _markStop("_onHTMLWriterError");
    };

    BodyWriter.prototype._writePlainText = function () {
        _markStart("_writePlainText");
        // getJunkBody is the best way to get the plain text body (whether it is junk or not)
        var body = this._message.getJunkBody();
        this._setBody(body);
        if (writePlainText(body, this._document)) {
            Jx.scheduler.addJob(this._jobSet, Mail.Priority.bodyContentChanged, "BodyWriter._writePlainText", this._onFirstPassFinished, this);
        }
        _markStop("_writePlainText");
    };

    BodyWriter.prototype._writeBody = function (sanitizedBody, skipWriting) {
        _markStart("_writeBody");
        Debug.assert(Jx.isInstanceOf(sanitizedBody, Platform.MailBody));
        this._setBody(sanitizedBody);
        this._writer = this._disposer.add(new HTMLWriter(this._message, sanitizedBody, this._document, skipWriting, this._onHTMLWriterError, this));
        this._writer.write(this._onFirstPassFinished, this);
        _markStop("_writeBody");
    };

    BodyWriter.prototype.isContentWritten = function () {
        return this._contentWritten;
    };

    BodyWriter.prototype._onFirstPassFinished = function () {
        _markStart("_onFirstPassFinished");
        this._contentWritten = true;
        this.raiseEvent(BodyWriter.Events.contentWritten);
        Jx.scheduler.addJob(this._jobSet, Mail.Priority.readingPaneBodySecondPass, "BodyWriter-copyHandler", function () {
            this._disposer.add(new Mail.BodyCopyHandler(this._message, this._document.body));
        }, this);
        if (this._body.type === MailBodyType.sanitized) {
            Jx.scheduler.addJob(this._jobSet, Mail.Priority.readingPaneBodySecondPass, "BodyWriter-attachments", function () {
                this._attachments = this._disposer.add(new Mail.EmbeddedAttachments(this._message, this._body.truncated, this._document.body, this._downloadStatus));
            }, this);
            Jx.scheduler.addJob(this._jobSet, Mail.Priority.readingPaneBodySecondPass, "BodyWriter-download attachments", function () {
                this._attachments.downloadAll();
            }, this);
        }
        Jx.scheduler.addJob(this._jobSet, Mail.Priority.readingPaneBodySecondPass, "BodyWriter-finished", this._onFinished, this);
        _markStop("_onFirstPassFinished");
    };

    BodyWriter.prototype._onFinished = function () {
        _markStart("_onFinished");
        this._done = true;
        this.raiseEvent(BodyWriter.Events.processingDone);
        _markStop("_onFinished");
    };

    BodyWriter.prototype.runSynchronous = function () {
        Debug.assert(!this._done);
        if (this._writer) {
            this._writer.runSynchronous();
        }
        this._jobSet.runSynchronous();
    };

    BodyWriter.prototype.areImagesBlocked = function () {
        return this._writer ? this._writer.areImagesBlocked() : false;
    };

    BodyWriter.prototype.getBodyType = function () {
        var body = this._body;
        return body ? body.type : null;
    };

    BodyWriter.prototype._raiseContentChanged = function () {
        _markStart("_raiseContentChanged");
        if (!this._changeJob) {
            this._changeJob = Jx.scheduler.addJob(this._jobSet, Mail.Priority.bodyContentChanged, null, function () {
                this._changeJob = null;
                this.raiseEvent(BodyWriter.Events.contentChanged);
            }, this);
        }
        _markStop("_raiseContentChanged");
    };

    BodyWriter.prototype._onMessageChanged = function (evt) {
        _markStart("_onMessageChanged");
        if (Mail.Validators.hasPropertyChanged(evt, "sanitizedVersion")) {
            this._raiseContentChanged();
        } else if (Mail.Validators.hasPropertyChanged(evt, "displayViewIds")) {
            var isJunk = this._message.isJunk;
            if (this._wasJunk !== isJunk) {
                this._wasJunk = isJunk;
                this._raiseContentChanged();
            }
        }
        _markStop("_onMessageChanged");
    };

    BodyWriter.prototype._onBodyChanged = function () {
        _markStart("_onBodyChanged");
        this._raiseContentChanged();
        _markStop("_onBodyChanged");
    };

    function addFontFamilyStyles(doc) {
        _markStart("addFontFamilyStyles");
        Debug.assert(Jx.isObject(doc));

        // If there's no head, we won't be able to insert (could happen if an email has >10K of content
        // before getting to the <head>).  Trying to insert would crash, so just don't continue if there
        // is no head.  The email might look strange, but that's acceptable since this would be a strange case

        if (Jx.isObject(doc.head)) {
            var DF = Jx.DynamicFont;

            // create the style node to contain authoring style information
            Jx.addStyleToDocument('html { font-family: ' + DF.getAuthoringFontFamilyQuoted('"') + '; }', doc);
        }
        _markStop("addFontFamilyStyles");
    }

    function writePlainText(body, doc) {
        Debug.assert(body.type === MailBodyType.plainText);
        var success = false;

        try {
            var html = "<!DOCTYPE html>" +
                "<html>" +
                    "<head>" +
                        "<link href='/ModernMail/resources/css/ReadingPaneBody.css' rel='Stylesheet' type='text/css' />" +
                    "</head>" +
                    "<body class='readingPaneBody'>" +
                        "<div id='readingPaneBodyContent'></div>" +
                    "</body>" +
                "</html>";
            doc.open();
            MSApp.execUnsafeLocalFunction(function () {
                doc.write(html);
            });
            doc.close();

            addFontFamilyStyles(doc);
            var div = doc.getElementById("readingPaneBodyContent");
            Debug.assert(Jx.isHTMLElement(div));

            // Plaintext messages always inherit the direction setting
            var bodyText = body.body;

            Mail.applyDirection(doc.body, bodyText);

            div.innerText = bodyText;
            success = true;
        } catch (ex) {
            Jx.log.exception("writePlainText", ex);
        }
        return success;
    }

    var maxBlockSize = 10*1024; // 10k
    Debug.call(function () {maxBlockSize = 512;});

    var HTMLWriter = function (message, body, doc, skipWriting, onError, onErrorContext) {
        _markStart("HTMLWriter.ctor");
        Debug.assert(Jx.isInstanceOf(message, Mail.UIDataModel.MailMessage));
        Debug.assert(Jx.isInstanceOf(body, Platform.MailBody));
        Debug.assert(body.type === MailBodyType.sanitized);
        Debug.assert(Mail.Validators.isDocumentReady(doc));
        Debug.assert(Jx.isFunction(onError));
        this._message = message;
        this._body = body;
        this._document = doc;
        this._skipWriting = Boolean(skipWriting);
        this._onErrorCallback = onError;
        this._onErrorCallbackContext = onErrorContext;
        this._isValid = true;

        this._disposer = new Mail.Disposer();
        this._jobSet = this._disposer.add(Jx.scheduler.createJobSet());

        if (body.length === 0) {
            _mark("HTMLWriter.ctor - no content");
            _markStop("HTMLWriter.ctor");
            return;
        }

        var bodyMetaData = JSON.parse(body.metadata);
        var hasImages = this._hasExternalImages = bodyMetaData.hasExternalImages;
        var hasBackgrounds = this._hasExternalBackgrounds = bodyMetaData.hasExternalBackgrounds;
        var hasCSSImages = bodyMetaData.hasCSSImages;
        this._direction = bodyMetaData.readingDirection;
        Debug.assert(Jx.isBoolean(hasImages));
        Debug.assert(Jx.isBoolean(hasBackgrounds));
        Debug.assert(Jx.isBoolean(hasCSSImages));

        if (!this._skipWriting) {
            var html = body.body,
                htmlLength = html.length;
            var htmlParts = this._htmlParts = [];
            var pos = 0;
            while (pos < htmlLength) {
                var remaining = htmlLength - pos;
                var blockSize = Math.min(remaining, maxBlockSize);
                htmlParts.push(html.substr(pos, blockSize));
                pos += blockSize;
            }
            Debug.assert(pos === htmlLength);
            Debug.assert(htmlParts.length === Math.ceil(htmlLength / maxBlockSize));
            if (htmlParts.length === 0) {
                this._htmlParts = [""];
            }
            this._nextPart = 0;
        }

        this._allowExternalImages = message.allowExternalImages;
        this._imagesBlocked = (hasImages || hasBackgrounds || hasCSSImages) && !this._allowExternalImages;

        _markStop("HTMLWriter.ctor");
    };

    HTMLWriter.prototype = {
        dispose: function () {
            _markStart("HTMLWriter.dispose");
            this._document.close();
            this._onErrorCallback = null;
            this._onErrorCallbackContext = null;
            this._disposer.dispose();
            _markStop("HTMLWriter.dispose");
        },
        runSynchronous: function () {
            this._jobSet.runSynchronous();
        },
        areImagesBlocked: function () {
            Debug.assert(this._isValid);
            return this._imagesBlocked;
        },
        write: function (onComplete, onCompleteContext) {
            Debug.assert(Jx.isFunction(onComplete));
            if (!this._isValid) {
                return;
            }

            _markStart("HTMLWriter.write");
            Debug.assert(Jx.isBoolean(this._hasExternalImages));
            Debug.assert(Jx.isBoolean(this._allowExternalImages));
            Debug.assert(Jx.isBoolean(this._hasExternalBackgrounds));

            var writeJob = null;
            if (!this._skipWriting) {
                writeJob = this._addJob(this._writeContent, this, "BodyWriter.HTMLWriter._writeContent");
            }

            this._addJob(this._applyDirection, this, "BodyWriter.HTMLWriter._applyDirection");

            if (this._hasExternalImages && this._allowExternalImages) {
                this._addJob(this._unblockImages, this, "BodyWriter.HTMLWriter._unblockImages");
            }
            if (this._hasExternalBackgrounds && this._allowExternalImages) {
                this._addJob(this._unblockBackgrounds, this, "BodyWriter.HTMLWriter._unblockBackgrounds");
            }

            this._addJob(onComplete, onCompleteContext, "BodyWriter.HTMLWriter.onComplete");

            if (writeJob) {
                writeJob.runIteration();     // put at least the first block into the document

                // run this immediately so the styles are applied along with the first part of the content
                addFontFamilyStyles(this._document);
            }
            _markStop("HTMLWriter.write");
        },
        _addJob: function (func, context, description) {
            Debug.assert(Jx.isFunction(func));
            Debug.assert(Jx.isNonEmptyString(description));
            Debug.assert(this._isValid);
            return Jx.scheduler.addJob(this._jobSet, Mail.Priority.readingPaneWriteContent, description, function () {
                Debug.assert(Jx.isFunction(this._onErrorCallback));
                try {
                    return func.call(context);
                } catch (ex) {
                    Jx.log.exception("BodyWriter.HTMLWriter: Failed when writing html to the reading pane", ex);
                    this._onError();
                }
            }, this);
        },
        _onError: function () {
            _markStart("HTMLWriter._onError");
            var onErrorCallback = this._onErrorCallback,
                onErrorCallbackContext = this._onErrorCallbackContext;

            try {
                this._document.close();
            } catch (ex) {
                Jx.log.exception("BodyWriter.HTMLWriter: Unable to close document", ex);
            }

            onErrorCallback.call(onErrorCallbackContext, this._isValid);
            _markStop("HTMLWriter._onError");
        },
        _writeContent: function () {
            _markStart("HTMLWriter._writeContent");
            Debug.assert(this._isValid);
            Debug.assert(!this._skipWriting);
            var htmlParts = this._htmlParts;
            Debug.assert(this._nextPart < htmlParts.length);
            var partIndex = this._nextPart++,
                doc = this._document;
            if (partIndex === 0) {
                _markStart("HTMLWriter._writeContent-open");
                doc.open();
                _markStop("HTMLWriter._writeContent-open");
            }
            MSApp.execUnsafeLocalFunction(function () {
                _markStart("HTMLWriter._writeContent-write");
                doc.write(htmlParts[partIndex]);
                _markStop("HTMLWriter._writeContent-write");
            });
            var done = (this._nextPart === htmlParts.length);
            if (done) {
                _markStart("HTMLWriter._writeContent-close");
                doc.close();
                _markStop("HTMLWriter._writeContent-close");
            }
            _markStop("HTMLWriter._writeContent");
            return Jx.Scheduler.repeat(!done);
        },
        _unblockImages: function () {
            _markStart("HTMLWriter._unblockImages");
            Debug.assert(this._isValid);
            Debug.assert(this._message.allowExternalImages);
            Debug.assert(!this.areImagesBlocked());
            Debug.assert(this._hasExternalImages);

            var images = this._document.getElementsByTagName("img");
            Debug.assert(images.length > 0);
            Array.prototype.forEach.call(images, function (img) {
                // Don't assert on img.src.  It will be something like "ms-appx://microsoft.windowscommunicationsapps/ModernMail/app/"
                Debug.assert(img.getAttribute("src") === "" || img.getAttribute("data-ms-imgsrc") === img.getAttribute("src"));
                img.src = img.getAttribute("data-ms-imgsrc");
            }, this);
            _markStop("HTMLWriter._unblockImages");
        },
        _unblockBackgrounds: function () {
            _markStart("HTMLWriter._unblockBackgrounds");
            Debug.assert(this._isValid);
            Debug.assert(this._message.allowExternalImages);
            Debug.assert(!this.areImagesBlocked());
            Debug.assert(this._hasExternalBackgrounds);

            var backgrounds = this._document.querySelectorAll("[background]");
            Debug.assert(backgrounds.length > 0);
            Array.prototype.forEach.call(backgrounds, function (el) {
                Debug.assert(el.getAttribute("background") === "" || el.getAttribute("data-ms-background") === el.getAttribute("background"));
                el.background = el.getAttribute("data-ms-background");
            }, this);
            _markStop("HTMLWriter._unblockBackgrounds");
        },
        _applyDirection: function () {
            _markStart("HTMLWriter._applyDirection");
            var doc = this._document;

            // Check if we need to apply a direction to the message from the metadata
            if(!Bidi.getDocumentDirection(doc)) {
                if (Utilities.haveRtlLanguage()) {
                    var direction = this._direction,
                        appSettings = Mail.Globals.appSettings;

                    if (direction !== Bidi.Values.none &&
                        appSettings.readingDirection === SettingsDirection.auto) {
                        doc.body.style.direction = direction;
                    } else if (appSettings.readingDirection !== SettingsDirection.auto) {
                        doc.body.style.direction = appSettings.readingDirection;
                    } else {
                        // If the setting is auto and the direction is none, just use the app direction
                        doc.body.style.direction = document.body.currentStyle.direction;
                    }
                
                } else {
                    // if there are no rtl languages installed, just default to the app direction
                    doc.body.style.direction = document.body.currentStyle.direction;
                }
            }
            _markStop("HTMLWriter._applyDirection");
        }
    };

    function _mark(s) { Jx.mark("BodyWriter:" + s); }
    function _markStart(s) { Jx.mark("BodyWriter." + s + ",StartTA,BodyWriter"); }
    function _markStop(s) { Jx.mark("BodyWriter." + s + ",StopTA,BodyWriter"); }
    //function _markAsyncStart(s) { Jx.mark("BodyWriter:" + s + ",StartTM,BodyWriter"); }
    //function _markAsyncStop(s) { Jx.mark("BodyWriter:" + s + ",StopTM,BodyWriter"); }

});
