
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
//

(function () {

    var U = Mail.UnitTest;

    var printHandler;

    // Setup function run before each test
    function setup(tc) {
        var preserve = Jm.preserve(Mail.Globals, ["appState", "commandManager"]);
        preserve.preserve(Mail, "guiState");
        preserve.preserve(Mail.Utilities, "ComposeHelper");

        tc.cleanup = function () {
            U.restoreJx();
            U.disposeGlobals();

            // Make sure next test gets updated mailReadingPanePrintFrame reference
            printHandler._frame = null;

            printHandler.onBeforePrint = null;
            printHandler.onAfterPrint = null;
            printHandler.deactivate();
            printHandler = null;

            // This needs to happen after PrintHandler's deactivation
            preserve.restore();
        };

        U.stubJx(tc, "appData");
        U.stubJx(tc, "activation");
        U.initGlobals(tc);
        U.setupPrintStubs();

        Mail.Globals.commandManager = {
            filterCommands: function (cmds) { return cmds; },
            registerShortcuts: Jx.fnEmpty
        };
        Mail.guiState = { addListener: Jx.fnEmpty, removeListener: Jx.fnEmpty, isThreePane: true };

        // Mock the subject of the last selected message to be used as the print task name
        Mail.Globals.appState = { lastSelectedMessage: { subject: "Print task name: ", irmCanPrint: true } };

        Mail.Utilities.ComposeHelper = {
            isComposeShowing: false
        };

        printHandler = new Mail.PrintHandler();
        printHandler.activate();

        var div = document.createElement("div");
        printHandler.setRootElement(div);
    }

    // Helpers

    function createPrintTaskRequestedArg() {
        var createPrintTask = function (name, sourceRequestHandler) {
            this._printTask.name = name;
            this._printTask.sourceRequestHandler = sourceRequestHandler;
            this._printTask.options = { displayedOptions: [] };
            return { options: this._printTask.options };
        };

        return {
            request: {
                createPrintTask: createPrintTask,
                _printTask: {}
            }
        };
    }

    function createPrintTaskSourceRequestedArg() {
        return {
            setSource: function (source) {
                this._source = source;
            },
            getDeferral: function () {
                this._deferralCount++;
                return {
                    complete: function () {
                        this._deferralCount--;
                    }.bind(this)
                };
            },
            _source: null,
            _deferralCount: 0
        };
    }

    // Tests

    Tx.test("PrintHandler.Singleton", function (tc) {
        setup(tc);
        tc.areEqual(printHandler, new Mail.PrintHandler());
    });

    Tx.test("PrintHandler.PrintViability", function (tc) {
        setup(tc);
        // Test print viability when canPrint is true
        Mail.Globals.appState.lastSelectedMessage.irmCanPrint = true;
        printHandler.checkPrintViability();
        tc.areEqual(printHandler._isPrintEnabled, true);

        // Test print viability when canPrint is false
        Mail.Globals.appState.lastSelectedMessage.irmCanPrint = false;
        printHandler.checkPrintViability();
        tc.areEqual(printHandler._isPrintEnabled, false);
    });

    Tx.test("PrintHandler.PrintTaskRequested", function (tc) {
        setup(tc);
        var printTaskRequestedListener = Windows.Graphics.Printing.PrintManager._printTaskRequestedListener || printHandler._printTaskRequestedHandler;
        tc.areEqual(typeof printTaskRequestedListener, "function");

        var taskNameMaxLength = Mail.PrintHandler.taskNameMaxLength;

        // Override the subject to be longer than the limit
        Mail.Globals.appState.lastSelectedMessage.subject = "test_PrintTaskRequested: Print task name is limited to " + String(taskNameMaxLength) + " character long; so it should be cut off after. BUG BUG BUG!!!";

        var printTaskRequestedArg = createPrintTaskRequestedArg();
        printTaskRequestedListener(printTaskRequestedArg);

        tc.areEqual(typeof printTaskRequestedArg.request._printTask.sourceRequestHandler, "function");
        tc.areEqual(printTaskRequestedArg.request._printTask.name.length, taskNameMaxLength);
        tc.isTrue(printTaskRequestedArg.request._printTask.options.displayedOptions.length > 0);

        // Make sure all expected print options were selected
        var expectedDisplayedOptions = ["DocumentInputBin", "PageMediaSize", "DocumentDuplex", "DocumentStaple", "PageOutputQuality", "DocumentHolePunch"];
        var displayedOptions = printTaskRequestedArg.request._printTask.options.displayedOptions;
        for (var i = displayedOptions.length - 1; i >= 0; i--) {
            var foundIndex = expectedDisplayedOptions.indexOf(displayedOptions[i]);
            tc.areNotEqual(foundIndex, -1);

            // Remove both from the two arrays
            expectedDisplayedOptions.splice(foundIndex, 1);
            displayedOptions.splice(i, 1);
        }
        tc.areEqual(expectedDisplayedOptions.length, 0);
        tc.areEqual(displayedOptions.length, 0);
    });

    Tx.asyncTest("PrintHandler._getPrintDocument", { timeoutMs: 200000, owner: "joshuala", priority: 0 }, function (tc) {
        setup(tc);
        var sourceSet = false,
            sandbox = document.getElementById("sandbox"),
            originalDocSource = MSApp.getHtmlPrintDocumentSource;

        tc.areEqual(sandbox.innerHTML, "", "Expecting empty sandbox to start test");

        MSApp.execUnsafeLocalFunction( function () {
            sandbox.innerHTML = "<div>" +
                                    "<div class='mailReadingPanePrintFrameHost' />" +
                                "</div>" +
                                "<div class='mailReadingPaneContent'>ReadingPaneContent</div>" +
                                "<div class='mailReadingPanePrintHeaderTemplate'>printHeaderTemplate</div>" +
                                "<div class='mailReadingPaneSubjectArea'><div class='mailReadingPaneSubject'>Subject</div><div class='mailReadingPaneFlagGlyph'><span>&#xE129;</span></div>" +
                                "<div class='mailReadingPaneHeaderArea'>Header Area</div>" +
                                "<div class='mailReadingPaneAttachmentWell'>Attachment Well</div>" +
                                "<div class='mailReadingPaneInviteArea'>Invite Area<div class='calendarInviteButtons'/></div>" +
                                "<iframe class='mailReadingPaneBodyFrame' />";
        });
        printHandler.setRootElement(sandbox);

        var iframeReady = printHandler._printFrame.contentDocument.readyState === "complete";
        tc.isFalse(iframeReady);
        if (!iframeReady) {
            tc.stop();
            printHandler._printFrame.contentDocument.addEventListener("readystatechange", function () {
                if(printHandler._printFrame.contentDocument.readyState === "complete") {
                    sandbox.querySelector(".mailReadingPaneBodyFrame").contentDocument.body.innerText = "Reading Pane Content";

                    MSApp.getHtmlPrintDocumentSource = function (doc) {
                        // Verify header to be printed.
                        tc.areEqual(printHandler._printHeaderFrame.contentDocument.body.innerHTML.trim(), '<div class="mailReadingPaneContent" hosttype="print"><div class="mailReadingPaneHeaderArea">Header Area</div><div class="mailReadingPaneSubjectArea"><div class="mailReadingPaneSubject">Subject</div><div class="mailReadingPaneHeaderArea">Header Area</div><div class="mailReadingPaneAttachmentWell">Attachment Well</div><div class="mailReadingPaneInviteArea">Invite Area<div class="calendarInviteButtons"></div><iframe class="mailReadingPaneBodyFrame"></iframe></div></div><div class="mailReadingPaneAttachmentWell">Attachment Well</div><div class="mailReadingPaneInviteArea">Invite Area<iframe class="mailReadingPaneBodyFrame"></iframe></div></div>');
                        // Verify body to be printed.
                        tc.areEqual(doc.body.outerHTML, '<body><div class="mailReadingPanePrintHeaderTemplate">printHeaderTemplate<iframe class="mailReadingPanePrintHeaderFrame" src="/ModernMail/Components/ReadingPane/ReadingPanePrintHeader.html" style="margin: 0px; border: 0px currentColor; border-image: none; width: 100%;" sandbox="allow-same-origin"></iframe></div>Reading Pane Content</body>');
                        return true;
                    };

                    Mail.UnitTest.ensureSynchronous(function () {
                        printHandler._printTaskSourceRequestedHandler({
                            setSource:function() {
                                sourceSet = true;
                            },
                            getDeferral:function() {
                                return {
                                    complete:function () {
                                        tc.isTrue(sourceSet);
                                        tc.start();
                                    }
                                };
                            }
                        });
                    });

                }
            }, false);
        }

        tc.addCleanup(function () {
            sandbox.innerHTML = "";
            MSApp.getHtmlPrintDocumentSource= originalDocSource;
            var div = document.createElement("div");
            printHandler.setRootElement(div);
        });

    });

})();
