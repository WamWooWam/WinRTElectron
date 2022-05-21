
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Jx, Mail, Debug, ModernCanvas*/

Jx.delayDefine(Mail, "ReadingPaneBody", function () {
    "use strict";

    var ReadingPaneBody = Mail.ReadingPaneBody = /*@constructor*/function (rootId, readingPane, animator, downloadStatus) {
        /// <param name="rootId" type="String" />
        /// <param name="readingPane" type="Mail.CompReadingPane" />
        Debug.assert(Jx.isNonEmptyString(rootId));
        Debug.assert(Jx.isInstanceOf(readingPane, Mail.CompReadingPane));
        Debug.assert(Jx.isInstanceOf(downloadStatus, Mail.ImageDownloadStatus));

        Debug.Mail.log("ReadingPaneBody_Ctor", Mail.LogEvent.start);
        this._parent = readingPane;
        this._downloadStatus = downloadStatus;
        this._message = null;
        this._animator = animator || null;
        this._disposer = new Mail.Disposer();
        this._writer = null;
        this._writerDisposer = null;
        this._frame = null;
        this._frameReadyStateHook = null;
        this._frameKeyDownHandler = this._frameKeyDownHandler.bind(this);
        this._framePointerUpHandler = this._framePointerUpHandler.bind(this);
        this._resizeJob = null;
        this._resetZoomLevelJob = null;
        this._updateJob = null;
        this._cachedReadingPaneWrapperWidth = 0;

        this._setFocusAfterReload = false; // whether we need to set the focus to the readingPaneBody after a reload
        this._imageListeners = null;
        this._numberOfImagesToLoad = 0;

        this._resizeTimer = null;

        this._rootElementId = rootId;
        this._rootElement = null;

        // Show a tooltip when hovering over hyperlinks.
        this._hyperlinkTooltip = new ModernCanvas.HyperlinkTooltip(ModernCanvas.OpenLinkOptions.click);

        Debug.Mail.log("ReadingPaneBody_Ctor", Mail.LogEvent.stop);
    };

    var Selectors = ReadingPaneBody._Selectors = {
        bodyFrameElementSelector: ".mailReadingPaneBodyFrame",
        bodyWrapperSelector: ".mailReadingPaneBodyWrapper",
        scrollPreserverSelector: ".mailReadingPaneScrollPreserver",
        downloadImagesLink: ".mailReadingPaneDownloadImagesLink"
    };

    var Events = ReadingPaneBody.Events = {
        bodyLoaded: "bodyLoaded",
        frameClicked: "frameClicked"
    };

    var prototype = ReadingPaneBody.prototype;
    Debug.Events.define(prototype, Events.bodyLoaded);
    Jx.augment(ReadingPaneBody, Jx.Events);

    Object.defineProperty(prototype, "focusAfterReload", {
        set: function (value) {
            /// <param name="value" type="boolean" />
            Debug.assert(Jx.isBoolean(value));
            this._setFocusAfterReload = value;
        }, enumerable: true
    });

    prototype.getBodyType = function () {
        var writer = this._writer;
        return writer ? writer.getBodyType() : null;
    };

    prototype._clearAsyncUpdate = function () {
        Jx.dispose(this._updateJob);
        this._updateJob = null;
    };

    prototype.deactivateUI = function () {
        Debug.Mail.log("ReadingPaneBody.deactivateUI", Mail.LogEvent.start);
        Debug.assert(Jx.isHTMLElement(this._frame));
        this.disposeOldContent();

        this._disposer.dispose();

        Jx.dispose(this._resizeJob);
        Jx.dispose(this._resetZoomLevelJob);

        this._clearFrameReadyStateListener();

        Jx.dispose(this._resizeTimer);

        this._clearAsyncUpdate();

        Debug.Mail.log("ReadingPaneBody.deactivateUI", Mail.LogEvent.stop);
    };

    prototype.activateUI = function () {
        Debug.Mail.log("ReadingPaneBody.activateUI", Mail.LogEvent.start);

        var rootElement = this._rootElement = document.getElementById(this._rootElementId);

        Debug.assert(Jx.isNullOrUndefined(this._frame));
        this._frame = rootElement.querySelector(Selectors.bodyFrameElementSelector);
        Debug.assert(Jx.isHTMLElement(this._frame));

        this._disposer.add(new Mail.EventHook(window, "resize", this._onLayoutChanged, this, true /*capture*/));
        this._disposer.add(new Mail.EventHook(Mail.guiState, "layoutChanged", this._onLayoutChanged, this));

        var downloadImagesLink = rootElement.querySelector(Selectors.downloadImagesLink);
        Debug.assert(Jx.isHTMLElement(downloadImagesLink));
        this._disposer.add(new Mail.EventHook(downloadImagesLink, "click", function () {
            Debug.assert(Jx.isInstanceOf(this._message, Mail.UIDataModel.MailMessage));
            this._message.allowExternalImages = true;
            this.disposeOldContent();
            this.update();
        }, this, false));

        this._initPinchAndZoom();
        Debug.Mail.log("ReadingPaneBody.activateUI", Mail.LogEvent.stop);
    };

    prototype._onLayoutChanged = function () {

        // recalcuate readingPaneWidth on next use.
        this._cachedReadingPaneWrapperWidth = 0;

        if (Mail.guiState.isReadingPaneVisible) {
            // The body may be size 0 because it has not been visible.
            // calling setFrameSize so it can properly size itself
            this._resetFrameSize();
        }
    };

    prototype._initPinchAndZoom = function () {
        Debug.Mail.log("ReadingPaneBody._initPinchAndZoom", Mail.LogEvent.start);
        var frameDoc = this._frame.contentDocument;
        var rootContentElement = this._rootElement.querySelector(Mail.CompReadingPane.rootContentElementSelector);
        Debug.assert(Jx.isHTMLElement(rootContentElement));
        frameDoc.addEventListener("dblclick", function () {
            rootContentElement.msContentZoomFactor = 1;
        }.bind(this), false);

        // reset the zoom level to 100%
        rootContentElement.msContentZoomFactor = 1;
        Debug.Mail.log("ReadingPaneBody._initPinchAndZoom", Mail.LogEvent.stop);
    };

    prototype.update = function (message) {
        /// <summary>When we want to update the reading pane body, the first
        /// step is to reload the iframe.  When that's finished, then we can load
        /// the contents of a mail to it dynamically.</summary>
        Debug.Mail.log("ReadingPaneBody.update", Mail.LogEvent.start);
        this._clearAsyncUpdate();
        this.disposeOldContent();
        this._refreshUI(message);
        Debug.Mail.log("ReadingPaneBody.update", Mail.LogEvent.stop);
    };

    prototype.clearMessage = function () {
        this.disposeOldContent();
        this._message = null;
    };

    prototype.disposeOldContent = function () {
        Debug.assert(Jx.isNullOrUndefined(this._writer) === Jx.isNullOrUndefined(this._writerDisposer));
        if (Jx.isNullOrUndefined(this._writer)) {
            return;
        }
        Mail.writeProfilerMark("ReadingPaneBody.disposeOldContent", Mail.LogEvent.start);
        this._hyperlinkTooltip.deactivateUI();
        this._disposer.disposeNow(this._writerDisposer);
        this._writerDisposer = null;
        this._writer = null;

        Jx.dispose(this._resizeJob);
        this._resizeJob = null;

        this._clearAsyncUpdate();

        Jx.dispose(this._resizeTimer);

        Jx.dispose(this._imageListeners);
        this._imageListeners = null;
        this._numberOfImagesToLoad = 0;

        this._nullifyBody();

        Mail.writeProfilerMark("ReadingPaneBody.disposeOldContent", Mail.LogEvent.stop);
    };

    prototype._isFrameReady = function () {
        var isReady = this._isReady;
        if (!isReady) {
            isReady = this._isReady = Mail.Validators.isDocumentReady(this._frame.contentDocument);
        }
        Debug.assert(!isReady || Mail.Validators.isDocumentReady(this._frame.contentDocument), "If we were ever ready, we should always be ready");
        return isReady;
    };

    prototype._clearFrameReadyStateListener = function () {
        this._disposer.disposeNow(this._frameReadyStateHook);
        this._frameReadyStateHook = null;
    };

    prototype._refreshUI = function (message) {
        Mail.writeProfilerMark("ReadingPaneBody._refreshUI", Mail.LogEvent.start);
        if (Jx.isInstanceOf(message, Mail.UIDataModel.MailMessage)) {
            this._message = message;
        }

        this._clearFrameReadyStateListener();
        if (!this._isFrameReady()) {
            Debug.assert(this._frameReadyStateHook === null);
            this._frameReadyStateHook = new Mail.EventHook(this._frame.contentDocument, "readystatechange", this._refreshUI, this, false);
            this._disposer.add(this._frameReadyStateHook);
            return;
        }

        // loading the contents in the iframe
        this._load();
        this._showReadingPane();
        Mail.writeProfilerMark("ReadingPaneBody._refreshUI", Mail.LogEvent.stop);
    };

    prototype._nullifyBody = function () {
        this._frame.contentDocument.innerHTML = "";
    };

    prototype._load = function () {
        this._nullifyBody();

        if (!Jx.isObject(this._message)) {
            Jx.log.info("ReadingPaneBody._loadBody: no message to load");
            return;
        }
        Mail.log("ReadingPane_updateBody", Mail.LogEvent.start);
        Debug.assert(Jx.isHTMLElement(this._frame));
        Debug.assert(this._isFrameReady());
        Debug.assert(this._writer === null);
        Debug.assert(this._writerDisposer === null);

        var contentDocument = this._frame.contentDocument;

        this._showSpinner(false);
        this._writer = new Mail.BodyWriter(this._message, contentDocument, {onNoBody: this._onNoBody, onNoBodyContext: this}, this._downloadStatus);
        this._writerDisposer = this._disposer.add(new Mail.Disposer(this._writer,
            new Mail.EventHook(this._writer, Mail.BodyWriter.Events.contentWritten, this._onContentReady, this),
            new Mail.EventHook(this._writer, Mail.BodyWriter.Events.processingDone, this._parent.onBodyProcessingDone, this._parent),
            new Mail.EventHook(this._writer, Mail.BodyWriter.Events.contentChanged, function () {
                this.disposeOldContent();
                this._clearAsyncUpdate();
                this._updateJob = Jx.scheduler.addJob(null,
                    Mail.Priority.readingPaneContentChanged,
                    "reading pane body - update",
                    this.update,
                    this
                );
            }, this),
            new Mail.EventHook(contentDocument, "click", this._frameClickHandler, this),
            new Mail.EventHook(contentDocument, "keydown", this._frameKeyDownHandler, this),
            new Mail.EventHook(contentDocument, "MSPointerUp", this._framePointerUpHandler, this)
        ));

        // reset the zoom level to 100%
        this._resetZoomLevel();

        this.raiseEvent(Events.bodyLoaded, null);
        Mail.log("ReadingPane_updateBody", Mail.LogEvent.stop);
    };

    prototype._onNoBody = function () {
        this._showSpinner(true);
    };

    prototype._showSpinner = function (show) {
        Debug.assert(Jx.isBoolean(show));
        Mail.ReadingPaneTruncationControl.showSpinner(show, document.getElementById("mailFrameReadingPane"));
    };

    prototype._onContentReady = function () {
        Mail.writeProfilerMark("ReadingPaneBody._onContentReady", Mail.LogEvent.start);
        Debug.assert(this._writer);
        Debug.assert(this._writer.isContentWritten());

        var contentDocument = this._frame.contentDocument,
            documentElement = contentDocument.documentElement,
            body = contentDocument.body;
        Jx.setClass(documentElement, "mailReadingPaneSelection", this._message.irmCanExtractContent);

        // The content document's title is what is read out by Narrator when focus is
        // on the IFrame. We want the title to read out something
        // similar to "Message Body" to let people know what has focus
        contentDocument.title = Jx.res.getString("mailReadingPaneMessageBodyAriaLabel");

        var downloadImagesLink = this._rootElement.querySelector(Selectors.downloadImagesLink);
        var imagesBlocked = this._writer.areImagesBlocked();
        Jx.setClass(downloadImagesLink, "hidden", !imagesBlocked);
        if (!imagesBlocked) {
            Debug.assert(this._imageListeners === null);
            var imageListeners = this._imageListeners = new Mail.Disposer();
            /* Add event listeners to img tags to adjust frame height & width once they're loaded */
            var imageList = body.getElementsByTagName('img');
            var numberOfImagesToLoad = this._numberOfImagesToLoad = imageList.length;
            var onImageDownloadStatusChanged = this._onImageDownloadStatusChanged;
            for (var ii = 0; ii < numberOfImagesToLoad; ++ii) {
                var img = imageList[ii];
                imageListeners.addMany(
                    new Mail.EventHook(img, "load", onImageDownloadStatusChanged, this, false),
                    new Mail.EventHook(img, "error", onImageDownloadStatusChanged, this, false),
                    new Mail.EventHook(img, "abort", onImageDownloadStatusChanged, this, false)
                );
            }
        }
        this._resetFrameSize(this._getFrameDirectionReversed()/*resetHScroll*/);

        this._hyperlinkTooltip.iframeElement = this._frame;
        this._hyperlinkTooltip.activateUI();

        Mail.writeProfilerMark("ReadingPaneBody._onContentReady", Mail.LogEvent.stop);
    };

    prototype._getFrameDirectionReversed = function () {
        // Safely get direction of body.
        var contentDocument = this._frame.contentDocument;
        if (contentDocument && contentDocument.body) {
            var messageDirection = Jx.Bidi.getDocumentDirection(contentDocument);
            if (Jx.isNonEmptyString(messageDirection)) {
                return messageDirection !== document.body.currentStyle.direction;
            }
        }

        return false;
    };

    prototype._resetHScroll = function () {
        Mail.writeProfilerMark("ReadingPaneBody._resetHScroll", Mail.LogEvent.start);
        var rootContentElement = this._rootElement.querySelector(Mail.CompReadingPane.rootContentElementSelector);
        Debug.assert(Jx.isHTMLElement(rootContentElement));
        if (this._getFrameDirectionReversed()) {
            rootContentElement.scrollLeft = this._frame.contentDocument.documentElement.scrollWidth;
        } else {
            rootContentElement.scrollLeft = 0;
        }
        Mail.writeProfilerMark("ReadingPaneBody._resetHScroll", Mail.LogEvent.stop);
    };

    prototype._resetZoomLevel = function () {
        Jx.dispose(this._resetZoomLevelJob);
        this._resetZoomLevelJob = Jx.scheduler.addJob(null,
            Mail.Priority.readingPaneBodyResetZoomLevel,
            "ReadingPaneBody._resetZoomLevel",
            function () {
                Mail.writeProfilerMark("ReadingPaneBody._resetZoomLevel", Mail.LogEvent.start);
                var rootContentElement = this._rootElement.querySelector(Mail.CompReadingPane.rootContentElementSelector);
                Debug.assert(Jx.isHTMLElement(rootContentElement));

                rootContentElement.scrollTop = 0;
                rootContentElement.msContentZoomFactor = 1;
                this._resetHScroll();
                Mail.writeProfilerMark("ReadingPaneBody._resetZoomLevel", Mail.LogEvent.stop);
            },
            this
        );
    };

    prototype._showReadingPane = function () {
        if (!this._message) {
            // If no message, then nothing to show.
            return;
        }

        Mail.log("ReadingPane_showReadingPane", Mail.LogEvent.start);

        this._frame.classList.remove("hidden");
        this._resetFrameSize();
        if (this._animator) {
            this._animator.shortFadeIn(this._frame);
        }
        if (this._setFocusAfterReload) {
            this._setFocusAfterReload = false;
            Mail.setActiveElementBySelector(Selectors.bodyFrameElementSelector, document.getElementById(this._rootElementId));
        }
        Mail.log("ReadingPane_showReadingPane", Mail.LogEvent.stop);
    };

    prototype._frameClickHandler = function () {
        Jx.EventManager.fireDirect(null, Events.frameClicked);
    };

    prototype._frameKeyDownHandler = function (evt) {
        /// <param name="evt" type="Event" />
        Mail.log("ReadingPane_body_keydown", Mail.LogEvent.start);
        Debug.assert(Jx.isObject(evt));

        if (Mail.Globals.commandManager.executeShortcut(Mail.Commands.ShortcutManager.mapKeyEvents(evt))) {
            // If command manager processed this key as a shortcut, then stop propagation
            evt.preventDefault();
            evt.stopPropagation();
            evt.stopImmediatePropagation();
        }
        Mail.log("ReadingPane_body_keydown", Mail.LogEvent.stop);
    };

    prototype._framePointerUpHandler = function (evt) {
        /// <summary>
        /// This function listens to the mouse back button click, which is exposed by HIP as event.button === 3
        /// on the MSPointerUp Event.  Upon the back button is clicked, we translate it to a browserBack keyboard event
        /// </summary>
        /// <param name="evt" type="Event" />
        Debug.assert(Jx.isObject(evt));
        if (evt.button === 3 /* The mouse back button*/) {
            evt.preventDefault();
            evt.stopPropagation();
            evt.stopImmediatePropagation();

            var shortcutItem = {
                control: false,
                shift: false,
                keyCode: Jx.KeyCode.browserback,
                alt: false
            };
            Mail.Globals.commandManager.executeShortcut(shortcutItem);
        }
    };

    prototype._onImageDownloadStatusChanged = function () {
        Mail.writeProfilerMark("ReadingPaneBody._onImageDownloadStatusChanged", Mail.LogEvent.start);
        Debug.assert(Jx.isNumber(this._numberOfImagesToLoad));

        Jx.dispose(this._resizeTimer);
        this._numberOfImagesToLoad--;
        if (this._numberOfImagesToLoad > 0) {
            this._resizeTimer = new Jx.Timer(200, this._setFrameSize, this);
        } else {
            this._setFrameSize();
        }
        Mail.writeProfilerMark("ReadingPaneBody._onImageDownloadStatusChanged", Mail.LogEvent.stop);
    };

    prototype._clearFrameDimensions = function () {
        var frameStyle = this._frame.style;
        Debug.assert(Jx.isObject(frameStyle));
        // Setting width to 280px so that with 20px on either edge the reading pane will fit in a snapped
        // window (320px) without scrollbars if the content allows.
        frameStyle.height = "auto";
        frameStyle.width = "280px";
        Debug.assert(window.innerWidth === 0 || window.innerWidth >= 320, "Reading pane assumption that snap is 320px is broken");
    };

    prototype._resetFrameSize = function (resetHScroll) {
        if (!this._writer || !this._writer.isContentWritten()) {
            return;
        }

        Mail.writeProfilerMark("ReadingPaneBody._resetFrameSize", Mail.LogEvent.start);

        Jx.dispose(this._resizeTimer);

        this._frame.classList.add("mailHideScrollbars");
        Jx.dispose(this._resizeJob);
        this._resizeJob = Jx.scheduler.addJob(null,
            Mail.Priority.readingPaneBodyResetFrameSize,
            "ReadingPaneBody._resetFrameSize",
            function (frame) {
                Mail.writeProfilerMark("ReadingPaneBody._resetFrameSize-async", Mail.LogEvent.start);
                Debug.assert(this._writer);
                Debug.assert(this._writer.isContentWritten());
                frame.classList.remove("mailHideScrollbars");
                Debug.assert(!frame.classList.contains("hidden"));
                // Reset the frame size and give IE a chance to redo the layout
                this._clearFrameDimensions();
                this._setFrameSize();
                if (resetHScroll) {
                    this._resetHScroll();
                }
                Jx.EventManager.fireDirect(null, "bodyResized");
                Mail.writeProfilerMark("ReadingPaneBody._resetFrameSize-async", Mail.LogEvent.stop);
            },
            this,
            [this._frame]
        );

        Mail.writeProfilerMark("ReadingPaneBody._resetFrameSize", Mail.LogEvent.stop);
    };

    prototype._getReadingPaneWrapperWidth = function () {
        if (this._cachedReadingPaneWrapperWidth === 0) {
            Mail.writeProfilerMark("ReadingPaneBody._getReadingPaneWrapperWidth", Mail.LogEvent.start);
            this._cachedReadingPaneWrapperWidth = this._rootElement.querySelector(Selectors.bodyWrapperSelector).offsetWidth;
            Mail.writeProfilerMark("ReadingPaneBody._getReadingPaneWrapperWidth", Mail.LogEvent.stop);
        }
        return this._cachedReadingPaneWrapperWidth;
    };

    prototype._setFrameSize = function () {
        Mail.writeProfilerMark("ReadingPaneBody._setFrameSize", Mail.LogEvent.start);

        Debug.assert(Jx.isHTMLElement(this._frame));
        Debug.assert(Jx.isObject(this._frame.contentDocument));
        Debug.assert(Jx.isObject(this._frame.contentDocument.documentElement));
        Debug.assert(Jx.isObject(this._frame.style));

        var frame = this._frame,
            doc = frame.contentDocument,
            documentElement = doc.documentElement,
            frameStyle = frame.style;

        var bodyContentWidth = this._getReadingPaneWrapperWidth();
        Debug.assert(Jx.isNumber(bodyContentWidth) && Math.ceil(bodyContentWidth) === Math.floor(bodyContentWidth) && (bodyContentWidth >= 0), "The body content width should be an integer");

        if (bodyContentWidth === 0) {
            // Under some use cases such as single pane, the width will be 0.  If so, there is no reason to continue
            // manipulating the size of the content.  setFrameSize will be called again once visible.
            Mail.writeProfilerMark("ReadingPaneBody._setFrameSize", Mail.LogEvent.stop);
            return;
        }
        documentElement.style.maxWidth = bodyContentWidth + "px";

        /// The scrollPreserver div did not have its size cleared when the iframe dimensions were cleared so that
        /// we would not lose the previous scroll position.
        /// The scrollPreserver size is updated here to match the new size of the iframe so that it has the correct size later for the next
        /// size related event.
        var scrollPreserverStyle = this._rootElement.querySelector(Selectors.scrollPreserverSelector).style;

        Mail.writeProfilerMark("ReadingPaneBody._setFrameSize - get document scrollWidth", Mail.LogEvent.start);
        var documentWidth = documentElement.scrollWidth;
        Mail.writeProfilerMark("ReadingPaneBody._setFrameSize - get document scrollWidth", Mail.LogEvent.stop);
        scrollPreserverStyle.width = frameStyle.width = Math.max(bodyContentWidth, documentWidth.toString()) + "px";

        // The scrollHight may change after iframe width has been set, especially if the email contains
        // media queries based on screen or window width
        Mail.writeProfilerMark("ReadingPaneBody._setFrameSize - get document scrollHeight", Mail.LogEvent.start);
        var documentHeight = documentElement.scrollHeight;
        Mail.writeProfilerMark("ReadingPaneBody._setFrameSize - get document scrollHeight", Mail.LogEvent.stop);
        scrollPreserverStyle.height = frameStyle.height = documentHeight.toString() + "px";

        Mail.writeProfilerMark("ReadingPaneBody._setFrameSize", Mail.LogEvent.stop);
    };

});
