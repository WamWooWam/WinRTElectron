
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function () {

    // Override Jx getString
    Jx.res.getString = function (key) {
        return "STRING_FOR_KEY(" + key + ")";
    };

    var opt,
        log,
        iframeElement,
        modernCanvas,
        canvasElement,
        scrollableElement,
        runUnitTest,
        defaultOptions = {
            delayActivation: true,
            autoResize: {},
            contextMenuManager: {
                clearUsageData: function () { },
                getUsageData: function () { },
                onContextMenu: function () { }
            },
            plugins: {}
        };

    function setup(tc, canvasOptions) {
        log = "";

        // The scrollable element contains the Modern Canvas iframe
        scrollableElement = document.getElementById("modernCanvasContainer");

        iframeElement = document.createElement("iframe");
        scrollableElement.appendChild(iframeElement);
        iframeElement.addEventListener("load", function onLoadIframeElement() {

            iframeElement.removeEventListener("load", onLoadIframeElement, false);

            canvasOptions.plugins.indent = new ModernCanvas.Plugins.Indent();

            // Initialize the ModernCanvas
            tc.log("Creating ModernCanvas.");
            modernCanvas = new ModernCanvas.ModernCanvasBase(iframeElement, canvasOptions);
            modernCanvas.addContent("", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);
            modernCanvas.activate();
            modernCanvas.focus();

            var range = modernCanvas.getDocument().createRange();
            range.selectNodeContents(modernCanvas.getCanvasElement());
            modernCanvas.replaceSelection(range);

            canvasElement = modernCanvas.getCanvasElement();

            // Need this to avoid an assert in getContent().
            canvasElement.style.fontSize = "16px";

            runUnitTest(tc);
        }, false);
        iframeElement.src = "ms-appx:///ModernCanvas/ModernCanvasFrame.html";
    };

    function cleanup(tc) {
        // Throw away the ModernCanvas
        modernCanvas.dispose();
        modernCanvas = null;

        // Remove the test elements from the DOM
        scrollableElement.innerHTML = "";
    };

    function runCanvasTest(tc, fnTest, argsFnTest) {
        runUnitTest = function (tc) {
            fnTest(argsFnTest);
            tc.start();
        };

        tc.stop();
        tc.cleanup = cleanup;
        setup(tc, defaultOptions);
    };

    opt = {
        owner: "widuff",
        priority: "0"
    };

    opt.description = "Verifies that text is indented correctly";
    Tx.asyncTest("ModernCanvas.testIndentText", opt, function (tc) {
        runCanvasTest(tc, function () {
            modernCanvas.addContent("<div>test</div>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);

            var range = modernCanvas.getDocument().createRange();
            range.selectNodeContents(canvasElement.querySelector("div"));
            range.collapse(/*toStart:*/true);
            modernCanvas.replaceSelection(range);

            // Indent once
            Jx.raiseEvent(modernCanvas, "command", { command: "indentTab" });

            // <blockquote><div>test</div></blockquote>
            var blockquote = canvasElement.firstChild;
            tc.isTrue(modernCanvas.isNodeName(blockquote, "blockquote"));
            tc.isTrue(modernCanvas.isNodeName(blockquote.firstChild, "div"));
            tc.areEqual(blockquote.firstChild.innerHTML, "test");

            // Indent again
            Jx.raiseEvent(modernCanvas, "command", { command: "indentTab" });

            // <blockquote><blockquote><div>test</div></blockquote></blockquote>
            blockquote = canvasElement.firstChild;
            tc.isTrue(modernCanvas.isNodeName(blockquote, "blockquote"));

            blockquote = blockquote.firstChild;
            tc.isTrue(modernCanvas.isNodeName(blockquote, "blockquote"));
            tc.isTrue(modernCanvas.isNodeName(blockquote.firstChild, "div"));
            tc.areEqual(blockquote.firstChild.innerHTML, "test");
        });
    });

    opt.description = "Verifies that text is outdented correctly";
    Tx.asyncTest("ModernCanvas.testOutdentText", opt, function (tc) {
        runCanvasTest(tc, function () {
            modernCanvas.addContent("<div>test</div>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);

            var range = modernCanvas.getDocument().createRange();
            range.selectNodeContents(canvasElement.querySelector("div"));
            range.collapse(/*toStart:*/true);
            modernCanvas.replaceSelection(range);

            // Indent twice
            Jx.raiseEvent(modernCanvas, "command", { command: "indentTab" });
            Jx.raiseEvent(modernCanvas, "command", { command: "indentTab" });

            // TODO: Remove workaround when WinBlue:165988 is fixed. For now we need force selection back into the <div> after an indent.
            var range = modernCanvas.getDocument().createRange();
            range.selectNodeContents(canvasElement.querySelector("div"));
            range.collapse(/*toStart:*/true);
            modernCanvas.replaceSelection(range);

            // Outdent once
            Jx.raiseEvent(modernCanvas, "command", { command: "outdentTab" });

            // <blockquote><div>test</div></blockquote>
            var blockquote = canvasElement.firstChild;
            tc.isTrue(modernCanvas.isNodeName(blockquote, "blockquote"));
            tc.isTrue(modernCanvas.isNodeName(blockquote.firstChild, "div"));
            tc.areEqual(blockquote.firstChild.innerHTML, "test");

            // Outdent again
            Jx.raiseEvent(modernCanvas, "command", { command: "outdentTab" });

            // <div>test</div>
            tc.isTrue(modernCanvas.isNodeName(canvasElement.firstChild, "div"));
            tc.areEqual(canvasElement.firstChild.innerHTML, "test");
        });
    });

    opt.description = "Verifies that a list is indented correctly";
    Tx.asyncTest("ModernCanvas.testIndentList", opt, function (tc) {
        runCanvasTest(tc, function () {
            modernCanvas.addContent("<ul><li>test</li></ul>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);

            var range = modernCanvas.getDocument().createRange();
            range.selectNodeContents(canvasElement.querySelector("li"));
            range.collapse(/*toStart:*/true);
            modernCanvas.replaceSelection(range);

            // Indent once
            Jx.raiseEvent(modernCanvas, "command", { command: "indentTab" });

            // <ul><ul><li>test</li></ul></ul>
            var ul = canvasElement.firstChild;
            tc.isTrue(modernCanvas.isNodeName(ul, "ul"));
            tc.isTrue(modernCanvas.isNodeName(ul.firstChild, "ul"));
            var li = ul.firstChild.firstChild;
            tc.isTrue(modernCanvas.isNodeName(li, "li"));
            tc.areEqual(li.innerHTML, "test");

            // Indent again
            Jx.raiseEvent(modernCanvas, "command", { command: "indentTab" });

            // <ul><ul><ul><li>test</li></ul></ul></ul>
            ul = canvasElement.firstChild;
            tc.isTrue(modernCanvas.isNodeName(ul, "ul"));
            tc.isTrue(modernCanvas.isNodeName(ul.firstChild, "ul"));
            tc.isTrue(modernCanvas.isNodeName(ul.firstChild.firstChild, "ul"));
            li = ul.firstChild.firstChild.firstChild;
            tc.isTrue(modernCanvas.isNodeName(li, "li"));
            tc.areEqual(li.innerHTML, "test");
        });
    });

    opt.description = "Verifies that a list is outdented correctly";
    Tx.asyncTest("ModernCanvas.testOutdentList", opt, function (tc) {
        runCanvasTest(tc, function () {
            modernCanvas.addContent("<ol><li>test</li></ol>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);

            var range = modernCanvas.getDocument().createRange();
            range.selectNodeContents(canvasElement.querySelector("li"));
            range.collapse(/*toStart:*/true);
            modernCanvas.replaceSelection(range);

            // Indent twice
            Jx.raiseEvent(modernCanvas, "command", { command: "indentTab" });
            Jx.raiseEvent(modernCanvas, "command", { command: "indentTab" });

            // TODO: Remove workaround when WinBlue:165988 is fixed. For now we need force selection back into the <div> after an indent.
            var range = modernCanvas.getDocument().createRange();
            range.selectNodeContents(canvasElement.querySelector("li"));
            range.collapse(/*toStart:*/true);
            modernCanvas.replaceSelection(range);

            // Outdent once
            Jx.raiseEvent(modernCanvas, "command", { command: "outdentTab" });

            // <ol><ol><li>test</li></ol></ol>
            var ol = canvasElement.firstChild;
            tc.isTrue(modernCanvas.isNodeName(ol, "ol"));
            tc.isTrue(modernCanvas.isNodeName(ol.firstChild, "ol"));
            var li = ol.firstChild.firstChild;
            tc.isTrue(modernCanvas.isNodeName(li, "li"));
            tc.areEqual(li.innerHTML, "test");

            // Outdent again
            Jx.raiseEvent(modernCanvas, "command", { command: "outdentTab" });

            // <ol><li>test</li></ol>
            ol = canvasElement.firstChild;
            tc.isTrue(modernCanvas.isNodeName(ol, "ol"));
            li = ol.firstChild;
            tc.isTrue(modernCanvas.isNodeName(li, "li"));
            tc.areEqual(li.innerHTML, "test");
        });
    });

    opt.description = "Verifies that the focusPrevious event is fired when outdentTab command is executed at the beginning of a line";
    Tx.asyncTest("ModernCanvas.testFocusPrevious", opt, function (tc) {
        runCanvasTest(tc, function () {
            modernCanvas.addContent("<div>test</div><div>test2</div>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);

            var previousFocused = false;
            modernCanvas.components.commandManager.setCommand(new ModernCanvas.Command("focusPrevious", function () {
                previousFocused = true;
            }));

            var range = modernCanvas.getDocument().createRange();
            range.selectNodeContents(canvasElement.querySelector("div + div"));
            range.collapse(/*toStart:*/true);
            modernCanvas.replaceSelection(range);

            // Outdent once
            Jx.raiseEvent(modernCanvas, "command", { command: "outdentTab" });

            // The focusPrevious command gets queued in the CommandManager.
            tc.stop();
            originalSetImmediate(function () {
                tc.isTrue(previousFocused);
                tc.start();
            });
        });
    });

    opt.description = "Verifies that the focusPrevious event is fired when outdentTab command is executed in the middle of a line";
    Tx.asyncTest("ModernCanvas.testNoFocusPrevious", opt, function (tc) {
        runCanvasTest(tc, function () {
            modernCanvas.addContent("<div>test</div>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);

            var previousFocused = false;
            modernCanvas.components.commandManager.setCommand(new ModernCanvas.Command("focusPrevious", function () {
                previousFocused = true;
            }));

            // Put selection in the middle of the text node.
            var range = modernCanvas.getDocument().createRange();
            range.setStart(canvasElement.querySelector("div").firstChild, 2);
            range.collapse(/*toStart:*/true);
            modernCanvas.replaceSelection(range);

            Jx.raiseEvent(modernCanvas, "command", { command: "outdentTab" });

            // The focusPrevious command would get queued in the CommandManager.
            tc.stop();
            originalSetImmediate(function () {
                tc.isTrue(previousFocused);
                tc.start();
            });
        });
    });

})();
