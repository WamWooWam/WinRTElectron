
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Allow for override of global components
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
        irmQuotedBody,
        irmQuotedBodyElement,
        canvasElement,
        runUnitTest,
        testDiv,
        emptyOptions = {
            autoReplaceManager: {
                addEventListener: function () { },
                bulkConvertElement: function (htmlElement, classNames) { },
                bulkConvertString: function (htmlString, classNames) {
                    return htmlString;
                },
                getElementHTML: function (uniqueId) {
                    return "";
                },
                insertElement: function (uniqueId) { },
                onKeyDown: function (e) { },
                onKeyUp: function (e) { },
                removeEventListener: function () { },
                setDefaultClasses: function (classNames) { },
                setFlag: function (newFlag) {
                    log += "setFlag(autoReplaceManager)[" + newFlag + "]";
                }
            },
            autoResize: {},
            commandManager: {
                addEventListener: function () { },
                clearUsageData: function () {
                    log += "clearUsageData(commandManager)";
                },
                getCommand: function (commandName) { return new ModernCanvas.Command("copy", Jx.fnEmpty); },
                getUsageData: function () { return "usageData(commandManager)"; },
                removeEventListener: function () { },
                setCommand: function () { },
                onCommand: function () { },
                updateEnabledStates: function () { }
            },
            contextMenuManager: {
                clearUsageData: function () {
                    log += "clearUsageData(contextMenuManager)";
                },
                getUsageData: function () { return "usageData(contextMenuManager)"; },
                onContextMenu: function () { }
            },
            delayActivation: true,
            plugins: {
                irmQuotedBody: new ModernCanvas.Plugins.IrmQuotedBody()
            },
            shortcutManager: {
                clearUsageData: function () {
                    log += "clearUsageData(shortcutManager)";
                },
                getUsageData: function () { return "usageData(shortcutManager)"; },
                onKeyDown: function () { }
            },
        };

    function setup(tc, canvasOptions) {
        log = "";

        iframeElement = document.createElement("iframe");
        document.getElementById("modernCanvasContainer").appendChild(iframeElement);
        iframeElement.addEventListener("load", function onLoadUnitTestElement () {

            iframeElement.removeEventListener("load", onLoadUnitTestElement, false);

            // Initialize the ModernCanvas
            tc.log("Creating ModernCanvas.");
            canvasOptions.plugins.irmQuotedBody = new ModernCanvas.Plugins.IrmQuotedBody();
            modernCanvas = new ModernCanvas.ModernCanvasBase(iframeElement, canvasOptions);
            modernCanvas.addContent("", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);
            irmQuotedBody = modernCanvas.components.irmQuotedBody;
            irmQuotedBody._modernCanvas = modernCanvas;
            modernCanvas.activate();
            canvasElement = modernCanvas.getCanvasElement();
            iframeDocument = iframeElement.contentDocument;
            irmQuotedBodyElement = iframeDocument.querySelector(".modernCanvas-irmQuotedBody");

            testDiv = document.createElement("div");
            testDiv.innerText = "test";

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

        // Remove the test element from the DOM
        document.getElementById("modernCanvasContainer").innerHTML = "";
    };

    function runCanvasTest(tc, fnTest, argsFnTest) {
        runUnitTest = function (tc) {
            fnTest(argsFnTest);
            tc.start();
        };

        tc.stop();
        tc.cleanup = cleanup;
        setup(tc, emptyOptions);
    };

    opt = {
        owner: "widuff",
        priority: "0"
    };

    opt.description = "Tests that the quoted body is below the Modern Canvas.";
    Tx.asyncTest("IrmQuotedBody.testDOMLocation", opt, function (tc) {
        runCanvasTest(tc, function () {
            tc.areEqual(irmQuotedBodyElement, canvasElement.nextSibling);
        });
    });

    opt.description = "Tests setting empty content into the IRM quoted body.";
    Tx.asyncTest("IrmQuotedBody.testSetEmpty", opt, function (tc) {
        runCanvasTest(tc, function () {
            irmQuotedBody.setContent(null);
            tc.areEqual("", irmQuotedBodyElement.innerHTML);
            tc.isFalse(Jx.hasClass(canvasElement, "modernCanvas-hasIrmQuotedBody"));
        });
    });

    opt.description = "Tests setting simple content into the IRM quoted body.";
    Tx.asyncTest("IrmQuotedBody.testSetContent", opt, function (tc) {
        runCanvasTest(tc, function () {
            irmQuotedBody.setContent(testDiv);
            tc.areEqual("<div>test</div>", irmQuotedBodyElement.innerHTML);
            tc.isTrue(Jx.hasClass(canvasElement, "modernCanvas-hasIrmQuotedBody"));
        });
    });

    opt.description = "Tests setting disableCopy to true and invoking a context menu.";
    Tx.asyncTest("IrmQuotedBody.testDisableCopyTrue", opt, function (tc) {
        runCanvasTest(tc, function () {
            irmQuotedBody.setContent(testDiv);

            irmQuotedBody.disableCopy = true;
            var e = document.createEvent("MouseEvent");
            e.initMouseEvent("contextmenu", true, true, null, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            tc.isFalse(irmQuotedBodyElement.dispatchEvent(e), "Expected preventDefault to be called");
        });
    });


    opt.description = "Tests setting disableCopy to false and invoking a context menu.";
    Tx.asyncTest("IrmQuotedBody.testDisableCopyFalse", opt, function (tc) {
        runCanvasTest(tc, function () {
            irmQuotedBody.setContent(testDiv);

            irmQuotedBody.disableCopy = false;
            var e = document.createEvent("MouseEvent");
            e.initMouseEvent("contextmenu", true, true, null, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            tc.isTrue(irmQuotedBodyElement.dispatchEvent(e), "Expected preventDefault not to be called");
        });
    });

})();
