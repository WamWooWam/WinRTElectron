
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug,Windows,MSApp,WinJS*/

Jx.delayDefine(Mail, "PrintHandler", function () {
    "use strict";

    var printHandlerInstance,
        ElementSelectors = {
            readingPaneContent: ".mailReadingPaneContent",
            printHeaderTemplate: ".mailReadingPanePrintHeaderTemplate",
            readingPaneSubject: ".mailReadingPaneSubjectArea",
            readingPaneHeaderArea: ".mailReadingPaneHeaderArea",
            readingPaneAttachmentWell: ".mailReadingPaneAttachmentWell",
            readingPaneInviteArea: ".mailReadingPaneInviteArea"
        };

    // PrintHandler - Handling printing for the Mail app
    Mail.PrintHandler = /*@constructor*/ function () {
        // Return the print handler singleton
        if (!printHandlerInstance) {
            this._isActivated = false;
            this._frame = null;
            this._headerFrame = null;
            this._isPrintEnabled = false;
            this._completeCallback = null;
            this._rootElement = null;

            // Binding callbacks
            this._loadContent = this._loadContent.bind(this);
            this._loadHeader = this._loadHeader.bind(this);
            this._printTaskRequestedHandler = this._printTaskRequestedHandler.bind(this);
            this._printTaskSourceRequestedHandler = this._printTaskSourceRequestedHandler.bind(this);
            this._beforePrintHandlerInternal = this._beforePrintHandlerInternal.bind(this);
            this._afterPrintHandlerInternal = this._afterPrintHandlerInternal.bind(this);

            printHandlerInstance = this;
        }

        return printHandlerInstance;
    };

    Mail.PrintHandler.taskNameMaxLength = 100;

    Object.defineProperty(Mail.PrintHandler.prototype, "printEnabled", { get : function () {
        return this._isPrintEnabled;
    }});

    Mail.PrintHandler.prototype.deactivate = function () {
        // Deactivate printing

        if (!this._isActivated) {
            return;
        }

        this._eventHook.dispose();

        this._isActivated = false;
    };

    Mail.PrintHandler.prototype.activate = function () {
        // Activate printing

        if (this._isActivated) {
            Jx.log.info("Print handler already activated.");
            return;
        }

        Mail.writeProfilerMark("PrintHandler_activate", Mail.LogEvent.start);

        var commandManager = Mail.Globals.commandManager;
        Debug.assert(Jx.isObject(commandManager));

        var commandIds = ["printMenu"];
        
        commandIds.push("printDebug"); // "printDebug" is only defined for non-ship flavors
        
        commandManager.registerShortcuts(commandIds);

        this._eventHook = Mail.EventHook.createGlobalHook("composeVisibilityChanged", this.checkPrintViability, this);

        this._isActivated = true;

        // Enable printing
        this.checkPrintViability();

        Mail.writeProfilerMark("PrintHandler_activate", Mail.LogEvent.stop);
    };

    Mail.PrintHandler.prototype.setRootElement = function (element) {
        Debug.assert(Jx.isHTMLElement(element));
        if (this._rootElement !== element) {
            this._rootElement = element;
            this._frame = this._rootElement.querySelector(".mailReadingPanePrintFrame");
            this.checkPrintViability();
        }
    };

    // Private members

    Object.defineProperty(Mail.PrintHandler.prototype, "_printFrame", {
        // Return the iframe hosting the print document
        get: function () {
            if (!this._frame) {
                this._frame = document.createElement("iframe");
                this._frame.className = "mailReadingPanePrintFrame hidden";
                this._frame.sandbox = "allow-same-origin";
                this._frame.src = "about:blank";

                Debug.assert(!Jx.isNullOrUndefined(this._rootElement));
                this._rootElement.querySelector(".mailReadingPanePrintFrameHost").replaceNode(this._frame);
            }
            Debug.assert(Jx.isHTMLElement(this._frame));
            return this._frame;
        },
        enumerable: false
    });

    Object.defineProperty(Mail.PrintHandler.prototype, "_printHeaderFrame", {
        // Return the iframe hosting the header document
        get: function () {
            if (!this._headerFrame) {
                this._headerFrame = document.createElement("iframe");
                this._headerFrame.className = "mailReadingPanePrintHeaderFrame";
                var style = this._headerFrame.style;
                style.width = "100%";
                style.border = "0px";
                style.margin = "0px";
                this._headerFrame.sandbox = "allow-same-origin";
                this._headerFrame.src = "/ModernMail/Components/ReadingPane/ReadingPanePrintHeader.html";
                this._frame.contentDocument.querySelector(ElementSelectors.printHeaderTemplate).appendChild(this._headerFrame);
            }
            return this._headerFrame;
        },
        enumerable: false
    });

    Mail.PrintHandler.prototype.checkPrintViability = function () {
        // Enable or disable printing by subscribing to or unsubscribing from appropriate events
        Debug.assert(Jx.isInstanceOf(this, Mail.PrintHandler));

        var message = Mail.Globals.appState.lastSelectedMessage,
            shouldEnable = this._isActivated &&
                           (!Mail.Utilities.ComposeHelper.isComposeShowing) &&
                           Jx.isHTMLElement(this._rootElement) &&
                           Jx.isObject(message) &&
                           message.irmCanPrint;

        if (shouldEnable !== this._isPrintEnabled) {
            this._isPrintEnabled = shouldEnable;
            var eventListenerFunc = shouldEnable ? "addEventListener" : "removeEventListener";

            // Enable or disable printing
            var printManager = Windows.Graphics.Printing.PrintManager.getForCurrentView();
            printManager[eventListenerFunc]("printtaskrequested", this._printTaskRequestedHandler);
        }
    };

    Mail.PrintHandler.prototype.showPrintUI = function (toggleDebug) {
        // Show the printUI
        Windows.Graphics.Printing.PrintManager.showPrintUIAsync();

        
        if (toggleDebug) {
            this._toggleDebug();
        }
        
    };

    Mail.PrintHandler.prototype._printTaskRequestedHandler = function (printEvent) {
        // Handler for the PrintManager's "printtaskrequested" event
        Debug.assert(Jx.isInstanceOf(printEvent,Windows.Graphics.Printing.IPrintTaskRequestedEventArgs));

        Mail.writeProfilerMark("PrintHandler_printTaskRequested", Mail.LogEvent.start);

        var lastSelectedMessage = Mail.Globals.appState.lastSelectedMessage;

        // Only create a print task if there is a selected message
        if (Jx.isObject(lastSelectedMessage)) {
            var StandardOptions = Windows.Graphics.Printing.StandardPrintTaskOptions;

            // Create the print task name from the mail subject (limit to the first taskNameMaxLength chars)
            var subject = lastSelectedMessage.subject;
            Debug.assert(Jx.isString(subject));
            var printTaskName = subject.substr(0, Mail.PrintHandler.taskNameMaxLength);

            // Create a print task
            var printTask = printEvent.request.createPrintTask(printTaskName, this._printTaskSourceRequestedHandler);
            Debug.assert(Jx.isInstanceOf(printTask, Windows.Graphics.Printing.IPrintTask));
            var displayOptions = printTask.options.displayedOptions;

            // Request to show additional printing options
            displayOptions.push(
                StandardOptions.mediaSize,
                StandardOptions.duplex,
                StandardOptions.inputBin,
                StandardOptions.printQuality,
                StandardOptions.staple,
                StandardOptions.holePunch
            );
        }

        Mail.writeProfilerMark("PrintHandler_printTaskRequested", Mail.LogEvent.stop);
    };

    Mail.PrintHandler.prototype._printTaskSourceRequestedHandler = function (args) {
        // Handler to set the Print source for preview and printing
        Debug.assert(Jx.isInstanceOf(args, Windows.Graphics.Printing.IPrintTaskSourceRequestedArgs));

        Mail.writeProfilerMark("PrintHandler_printTaskSourceRequested", Mail.LogEvent.start);

        // Defer the completion until we get the print document
        var deferral = args.getDeferral();

        // Get the print document and set the print source
        WinJS.Promise.as(this._getPrintDocument()).done(function (printDocument) {
            // Set the print source if available
            if (printDocument) {
                args.setSource(MSApp.getHtmlPrintDocumentSource(printDocument));
            }

            deferral.complete();

            Mail.writeProfilerMark("PrintHandler_printTaskSourceRequested", Mail.LogEvent.stop);
        });
    };

    Mail.PrintHandler.prototype._abort = function (exception) {
        if (exception) {
            // Let's just log and complete as Print shouldn't crash the app
            Debug.assert(false);
            Jx.fault("PrintHandler.js", "Print threw an exception", exception);
        }

        Debug.assert(Jx.isFunction(this._completeCallback));
        this._completeCallback();
        this._completeCallback = null;
    };

    Mail.PrintHandler.prototype._loadContent = function () {
        try {
            if (this._printFrame.contentDocument.readyState !== "complete") {
                return;
            }
            this._printFrame.contentDocument.removeEventListener("readystatechange", this._loadContent, false);

            var printFrameDocument = this._printFrame.contentDocument,
                body = printFrameDocument.body,
                head = printFrameDocument.head;
            if (!body || !head) {
                this._abort();
                return;
            }
            body.removeNode(true /*deep*/);
            head.removeNode(true /*deep*/);

            var readingPaneBodyFrame = this._rootElement.querySelector(Mail.ReadingPaneBody._Selectors.bodyFrameElementSelector);
            Debug.assert(Jx.isHTMLElement(readingPaneBodyFrame));

            // First append the mail head to the print document iframe and then the body.
            var contentHead = readingPaneBodyFrame.contentDocument.head,
                contentBody = readingPaneBodyFrame.contentDocument.body;
            if (!contentHead || !contentBody) {
                this._abort();
                return;
            }

            printFrameDocument.documentElement.appendChild(printFrameDocument.importNode(contentHead, true /*deep*/));
            printFrameDocument.documentElement.appendChild(printFrameDocument.importNode(contentBody, true /*deep*/));

            // Clone the header template and prepend it to the print document iframe
            var printHeaderTemplate = this._rootElement.querySelector(ElementSelectors.printHeaderTemplate);
            Debug.assert(Jx.isHTMLElement(printHeaderTemplate));

            printFrameDocument.body.insertAdjacentElement("afterBegin", printFrameDocument.importNode(printHeaderTemplate, true /*deep*/));

            // Now we need to wait until the nested header iframe is ready before setting the mail header info
            var printHeaderFrame = this._printHeaderFrame;
            Debug.assert(!Jx.isNullOrUndefined(printHeaderFrame));

            if (printHeaderFrame.contentDocument.readyState === "complete") {
                this._loadHeader();
            } else {
                printHeaderFrame.contentDocument.addEventListener("readystatechange", this._loadHeader, false);
            }

        } catch (ex) {
            this._abort(ex);
        }
    };

    Mail.PrintHandler.prototype._loadHeader =  function () {
        try {
            var headerFrame = this._printHeaderFrame;
            if (headerFrame.contentDocument.readyState !== "complete") {
                return;
            }
            headerFrame.contentDocument.removeEventListener("readystatechange", this._loadHeader, false);

            // add the reading pane default styles
            var DF = Jx.DynamicFont;
            var css = 
                'body:not(#spec) { font-family: ' + DF.getPrimaryFontFamilyQuoted('"') + '; } ' +
                Mail.ReadingPaneBody._Selectors.bodyFrameElementSelector + ' { font-family: ' + DF.getAuthoringFontFamilyQuoted('"') + '; }';
            Jx.addStyleToDocument(css, headerFrame.contentDocument);

            var printHeader = headerFrame.contentDocument.querySelector(ElementSelectors.readingPaneContent);
            printHeader.innerHTML = "";

            // Header area
            var mailHeader = this._rootElement.querySelector(ElementSelectors.readingPaneHeaderArea).cloneNode(true);
            printHeader.appendChild(mailHeader);

            // Subject area (except for the flag glyph)
            var mailSubject = this._rootElement.querySelector(ElementSelectors.readingPaneSubject).cloneNode(true);
            mailSubject.querySelector(".mailReadingPaneFlagGlyph").removeNode(true);
            printHeader.appendChild(mailSubject);

            // AttachmentWell
            var mailAttachment = this._rootElement.querySelector(ElementSelectors.readingPaneAttachmentWell).cloneNode(true);
            printHeader.appendChild(mailAttachment);

            // Invite area (except for the buttons)
            var mailInviteArea = this._rootElement.querySelector(ElementSelectors.readingPaneInviteArea).cloneNode(true);
            mailInviteArea.querySelector(".calendarInviteButtons").removeNode(true);
            printHeader.appendChild(mailInviteArea);

            // Hook up the before and after print handlers
            var printFrameDocument = this._printFrame.contentDocument;
            var body = printFrameDocument.body;
            body.onbeforeprint = this._beforePrintHandlerInternal;
            body.onafterprint = this._afterPrintHandlerInternal;

            // We now have everything we need to print
            Debug.assert(Jx.isFunction(this._completeCallback));
            this._completeCallback(printFrameDocument);
        } catch (ex) {
            this._abort(ex);
        }

        this._completeCallback = null;
    };

    Mail.PrintHandler.prototype._getPrintDocument = function () {
        // Return the document to print

        return new WinJS.Promise(function (complete) {
            this._completeCallback = complete;
            try {
                if (this._printFrame.contentDocument.readyState === "complete") {
                    this._loadContent();
                } else {
                    this._printFrame.contentDocument.addEventListener("readystatechange", this._loadContent, false);
                }
            } catch (ex) {
                this._abort(ex);
            }
        }.bind(this));
    };

    Mail.PrintHandler.prototype._beforePrintHandlerInternal = function () {
        // Handler for "beforeprint"

        // Remove the 'hidden' class for layout to happen before we can take elements' sizes
        this._printFrame.classList.remove("hidden");

        var printHeader = this._printHeaderFrame,
            printHeaderContent = printHeader.contentDocument,
            printHeaderDocument = printHeaderContent.documentElement,
            printHeaderBody = printHeaderContent.body;

        // Our CSS is a mixture of css for various languages.  Normally, IE applies
        // 'Windows.Globalization.ApplicationLanguages.languages[0]' to our body element and
        // everything is fine.  However, it does not do that for inner iframes like the print
        // header.  So we have to do this manually.  If we didn't, our styles would not apply.
        var lang = Windows.Globalization.ApplicationLanguages.languages[0],
            printBody = this._printFrame.contentDocument.body;

        printHeaderBody.style.direction = document.body.currentStyle.direction;
        printBody.lang = printHeaderBody.lang = lang;
        printBody.style.maxWidth = "";

        // Set the height of the header iframe to fit its content
        // Note: For some reasons, the header iframe's scrollHeight doesn't change with its content;
        // so we use the height of the enclosed content to set the height of the containing iframe.
        var height = printHeaderDocument.scrollHeight + printHeaderDocument.offsetHeight - printHeaderDocument.clientHeight;
        printHeader.style.height = String(height) + "px";
    };

    Mail.PrintHandler.prototype._afterPrintHandlerInternal = function () {
        /// Handler for "afterprint"

        
        if (!this._debugEnabled) {
            
            this._cleanup();
            
        }
        
    };

    Mail.PrintHandler.prototype._cleanup = function () {
        // Clean up the print iframe

        // Re-apply the 'hidden' class to hide the print document iframe
        this._printFrame.classList.add("hidden");

        // Reload the iframe to clear the print content
        this._printFrame.contentWindow.location.reload();
        this._headerFrame = null;
    };

    
    Object.defineProperty(Mail.PrintHandler.prototype, "_debugEnabled", {
        // Get or set the debug mode
        get: function () {
            return this._printFrame.classList.contains("debug");
        },
        set: function (enabled) {
            if (enabled) {
                this._printFrame.classList.add("debug");
                Jx.log.info("Print debug enabled.");
            } else {
                this._printFrame.classList.remove("debug");
                Jx.log.info("Print debug disabled.");
            }
        },
        enumerable: true
    });

    Mail.PrintHandler.prototype._toggleDebug = function () {
        // Toggle debug mode

        if (this._debugEnabled) {
            this._debugEnabled = false;
            this._cleanup();
        } else {
            this._debugEnabled = true;
        }
    };
    

});
