
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global document, Jx, ModernCanvas, Tx, window*/
(function () {

    // Override Jx getString
    Jx.res.getString = function (key) {
        return "STRING_FOR_KEY(" + key + ")";
    };

    var opt,
        log,
        modernCanvas,
        iframeElement,
        iframeDocument,
        canvasElement,
        runUnitTest,
        testDiv,
        fontChangeCalls,
        focusCalls,
        oldMail,
        emptyOptions = {
            autoReplaceManager: {
                addEventListener: function () { },
                bulkConvertElement: function () { },
                bulkConvertString: function (htmlString) {
                    return htmlString;
                },
                bulkElementConversion: function () { return false; },
                getElementHTML: function () {
                    return "";
                },
                insertElement: function () { },
                onKeyDown: function () { },
                onKeyUp: function () { },
                removeEventListener: function () { },
                setDefaultClasses: function () { },
                setFlag: function (newFlag) {
                    log += "setFlag(autoReplaceManager)[" + newFlag + "]";
                }
            },
            autoResize: {},
            commandManager: {},
            contextMenuManager: {
                clearUsageData: function () {
                    log += "clearUsageData(contextMenuManager)";
                },
                getUsageData: function () { return "usageData(contextMenuManager)"; },
                onContextMenu: function () { }
            },
            delayActivation: true,
            editTracker: {
                addSubtreeChange: function () { },
                beginUnit: function () { },
                dispose: function () { },
                reset: function () {
                    log += "reset(editTracker)";
                }
            },
            plugins: {
                defaultFont: new ModernCanvas.Plugins.DefaultFont()
            },
            shortcutManager: {
                clearUsageData: function () {
                    log += "clearUsageData(shortcutManager)";
                },
                getUsageData: function () { return "usageData(shortcutManager)"; },
                onKeyDown: function () { }
            },
            undoRedoStack: {
                clear: function () {
                    log += "clear(undoRedoStack)";
                }
            }
        };

    function setup(tc, canvasOptions) {
        log = "";
        focusCalls = 0;
        fontChangeCalls = 0;
        
        oldMail = window.Mail || {};

        window.Mail = { Globals: {}, AppSettings: { Events: {} } };
        
        Mail.Globals.appSettings = {
            composeFontFamily: "Arial",
            composeFontSize: "16pt",
            composeFontColor: "#000000",
            addListener: function (evt, fnc){
                this._change = fnc;
            }, 
            removeListener: function () {
                this._change = function () { };
            },
            change: function () {
                this._change();
            },
            _change: function () { }
        };

        emptyOptions.commandManager = new ModernCanvas.CommandManager("full",null);

        iframeElement = document.createElement("iframe");
        document.getElementById("modernCanvasContainer").appendChild(iframeElement);
        iframeElement.addEventListener("load", function onLoadUnitTestElement () {

            iframeElement.removeEventListener("load", onLoadUnitTestElement, false);

            // Initialize the ModernCanvas
            tc.log("Creating ModernCanvas.");
            canvasOptions.plugins.defaultFont = new ModernCanvas.Plugins.DefaultFont();
            
            var changeFont = canvasOptions.plugins.defaultFont._changeFont.bind(canvasOptions.plugins.defaultFont);
            
            canvasOptions.plugins.defaultFont._changeFont = function() {
                fontChangeCalls++;
                changeFont();
            };
            
            modernCanvas = new ModernCanvas.ModernCanvasBase(iframeElement, canvasOptions);
            modernCanvas.addContent("", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);
            modernCanvas.activate();
            canvasElement = modernCanvas.getCanvasElement();
            iframeDocument = iframeElement.contentDocument;

            testDiv = document.createElement("div");
            testDiv.innerText = "test";

            // Need this to avoid an assert in getContent().
            canvasElement.style.fontSize = "16px";

            runUnitTest(tc);
        }, false);
        iframeElement.src = "ms-appx:///ModernCanvas/ModernCanvasFrame.html";
    }

    function cleanup() {
        // Throw away the ModernCanvas
        modernCanvas.dispose();
        modernCanvas = null;
        
        // Return the appSettings to their original state
        Mail = oldMail;

        // Remove the test element from the DOM
        document.getElementById("modernCanvasContainer").innerHTML = "";
    }
    
    function runCanvasTest(tc, fnTest, argsFnTest) {
        runUnitTest = function (tc) {
            fnTest(argsFnTest);
            tc.start();
        };

        tc.stop();
        tc.cleanup = cleanup;
        setup(tc, emptyOptions);
    }
    
    opt = { owner: "andrha", priority: "0"};
    
    opt.description = "Test the font change is called when the AppSettings change";
    Tx.asyncTest("DefaultFont.testChangeFontMail", opt, function(tc){
        runCanvasTest(tc, function () {
            tc.areEqual(fontChangeCalls, 0);
            Mail.Globals.appSettings.composeFontSize = "12pt";
            Mail.Globals.appSettings.change();
            tc.areEqual(fontChangeCalls, 1);
        });
    });

    opt.description = "Test that the font listener is not added for share";
    Tx.asyncTest("DefaultFont.testChangeFontShare", opt, function (tc) {
        window.Share = {};
        runCanvasTest(tc, function () {
            tc.areEqual(fontChangeCalls, 0);
            Mail.Globals.appSettings.composeFontSize = "12pt";
            Mail.Globals.appSettings.change();
            tc.areEqual(fontChangeCalls, 0);
        });
    });

    opt.description = "Test that the clear formatting command works";
    Tx.asyncTest("DefaultFont.testClearFormat", opt, function (tc) {
        runCanvasTest(tc, function () {
            modernCanvas.addContent('<div id="firstDiv"><font ><strong>text</strong></font><br></div><div id="lastDiv"><font></font><font><strong>text</strong></font></div>',
                                    ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.start);

            var range = modernCanvas.getDocument().createRange(),
                firstDiv = modernCanvas.getDocument().getElementById("firstDiv"),
                lastDiv = modernCanvas.getDocument().getElementById("lastDiv");

            range.setStartBefore(firstDiv);
            range.setEndAfter(lastDiv);
            modernCanvas.replaceSelection(range);

            var commandManager = modernCanvas.components.commandManager,
                clearFormattingCmd = commandManager.getCommand("clearFormatting");

            commandManager.setModernCanvas(modernCanvas);
            clearFormattingCmd.run({ value: "" });

            var divTags = modernCanvas.getCanvasElement().querySelectorAll("div"),
                div;
            for (var i = divTags.length; i--;) {
                div = divTags[i];
                tc.isTrue(Jx.hasClass(div, "defaultFont"));
            }
            tc.areEqual(0, modernCanvas.getDocument().querySelectorAll("strong").length);
        });
    });

    opt.description = "Test that clear formatting is disable on collapsed selection";
    Tx.asyncTest("DefaultFont.testClearFormatCollapsed", opt, function (tc) {
        runCanvasTest(tc, function () {
            modernCanvas.addContent('<div id="firstDiv"><font ><strong>text</strong></font><br></div><div id="lastDiv"><font></font><font><strong>text</strong></font></div>',
                                    ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.start);

            var range = modernCanvas.getDocument().createRange(),
                firstDiv = modernCanvas.getDocument().getElementById("firstDiv");

            range.setStartBefore(firstDiv.firstChild);
            range.collapse(true);
            modernCanvas.replaceSelection(range);

            var commandManager = modernCanvas.components.commandManager,
                clearFormattingCmd = commandManager.getCommand("clearFormatting");

            commandManager.setModernCanvas(modernCanvas);
            clearFormattingCmd.run({ value: "" });

            tc.areEqual(2, modernCanvas.getDocument().querySelectorAll("strong").length);
        });
    });

    opt.description = "Test that the select all command selects everything correctly but doesn't delete the default font";
    Tx.asyncTest("DefaultFont.testSelectAll", opt, function (tc) {
        runCanvasTest(tc, function () {
            modernCanvas.addContent('<div id="firstDiv" class="defaultFont" style="color: #000; font-size: 24pt" ><font ><strong>text</strong></font><br></div><div id="lastDiv" class="defaultFont" style="color: #000; font-size: 24pt"><font></font><font><strong>text</strong></font></div>',
                                    ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.start);

            var commandManager = modernCanvas.components.commandManager,
                selectAll = commandManager.getCommand("selectAll"),
                newRange = modernCanvas.getDocument().createRange();

            commandManager.setModernCanvas(modernCanvas);

            // Have to have an initial selection in canvas for select all
            newRange.setStart(modernCanvas.getDocument().getElementById("firstDiv"), 0);
            newRange.collapse(true);
            modernCanvas.replaceSelection(newRange);
            selectAll.run();

            var range = modernCanvas.getSelectionRange(),
                element = modernCanvas.getCanvasElement();

            tc.areEqual(range.startContainer.id, element.firstChild.id);
            tc.areEqual(range.endContainer.id, element.lastChild.id);

            range.deleteContents();

            // With this selection, deleting the contents yields two divs since the selection starts
            // in one and ends in another.
            tc.areEqual(2, element.childNodes.length);
            tc.isTrue(element.firstChild.classList.contains("defaultFont"));
            tc.isTrue(element.lastChild.classList.contains("defaultFont"));
            tc.areEqual(element.firstChild.innerHTML, "");
            tc.areEqual(element.lastChild.innerHTML, "");
        });
    });

    opt.description = "Test that the select all functions with text blocks";
    Tx.asyncTest("DefaultFont.testSelectAllText", opt, function (tc) {
        runCanvasTest(tc, function () {
            modernCanvas.addContent('<div id="firstDiv" class="defaultFont" style="color: #000; font-size: 24pt" ><font ><strong>text</strong></font><br></div><div id="lastDiv" class="defaultFont" style="color: #000; font-size: 24pt"><font></font><font><strong>text</strong></font>This is some text that will be outside of the font tag</div>',
                                    ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.start);

            var commandManager = modernCanvas.components.commandManager,
                selectAll = commandManager.getCommand("selectAll"),
                newRange = modernCanvas.getDocument().createRange();

            commandManager.setModernCanvas(modernCanvas);

            // Have to have an initial selection in canvas for select all
            newRange.setStart(modernCanvas.getDocument().getElementById("firstDiv"), 0);
            newRange.collapse(true);
            modernCanvas.replaceSelection(newRange);
            selectAll.run();

            var range = modernCanvas.getSelectionRange(),
                element = modernCanvas.getCanvasElement();

            tc.areEqual(range.startContainer.id, element.firstChild.id);
            tc.areEqual(range.endContainer.id, element.lastChild.id);

            range.deleteContents();

            // With this selection, deleting the contents yields two divs since the selection starts
            // in one and ends in another.
            tc.areEqual(2, element.childNodes.length);
            tc.isTrue(element.firstChild.classList.contains("defaultFont"));
            tc.isTrue(element.lastChild.classList.contains("defaultFont"));
            tc.areEqual(element.firstChild.innerHTML, "");
            tc.areEqual(element.lastChild.innerHTML, "");
        });
    });
    
})();