
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Mark Debug to throw errors rather than attempt a debug dialog
Debug.throwOnAssert = true;

(function () {

    // Override Jx getString
    Jx.res.getString = function (key) {
        return "STRING_FOR_KEY(" + key + ")";
    };

    var opt,
        log,
        defaultIframeHeight = "150px", // IE defaults <iframe> to a height of 150px.
        defaultIframeWidth = "1024px", // We have CSS applied to the UT page that defaults the <iframe> to a width of 1024px.
        domxSetImmediate,
        modernCanvas,
        iframeElement,
        iframeDocument,
        canvasElement,
        runUnitTest,
        emptyOptions = {
            delayActivation: true,
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
            commandManager: {
                addEventListener: function () { },
                clearUsageData: function () {
                    log += "clearUsageData(commandManager)";
                },
                getCommand: function (commandName) { },
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
            shortcutManager: {
                clearUsageData: function () {
                    log += "clearUsageData(shortcutManager)";
                },
                getUsageData: function () { return "usageData(shortcutManager)"; },
                onKeyDown: function () { }
            }
        };

    function setup(tc) {
        log = "";

        domxSetImmediate = window.setImmediate;
        window.setImmediate = window.originalSetImmediate;

        iframeElement = document.createElement("iframe");
        document.getElementById("modernCanvasContainer").appendChild(iframeElement);
        iframeElement.addEventListener("load", function onLoadUnitTestElement () {

            iframeElement.removeEventListener("load", onLoadUnitTestElement, false);

            // Initialize the ModernCanvas
            tc.log("Creating ModernCanvas.");
            modernCanvas = new ModernCanvas.ModernCanvasBase(iframeElement, emptyOptions);
            canvasElement = modernCanvas.getCanvasElement();
            iframeDocument = iframeElement.contentDocument;

            // Override default margin on the body to get accurate measurements.
            iframeDocument.body.style.margin = "0px";

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

        window.setImmediate = domxSetImmediate;
    };


    function runAutoResizeTest(tc, fnTest) {
        runUnitTest = function (tc) {
            fnTest(function () { 
                tc.start() });
        };

        tc.stop();
        tc.cleanup = cleanup;
        setup(tc);
    };

    function forceAutoResize() {
        // AutoResize is listening for the scroll event and does an immediate resize as long as it thinks the DOM is dirty. 
        // Because DOM mutation events are fired only after our JavaScript yields the UI thread, you should call this 
        // function after a setImmediate.
        var e = document.createEvent("UIEvent");
        e.initUIEvent("scroll", true, false, window, 0);
        modernCanvas.getScrollableElement().dispatchEvent(e);
    };

    opt = {
        owner: "widuff",
        priority: "0"
    };

    opt.description = "Tests that no scrollbars are shown in the iframe.";
    Tx.asyncTest("ModernCanvas.testNoScrollBar", opt, function (tc) {
        runAutoResizeTest(tc, function (complete) {
            modernCanvas.addContent("", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);
            modernCanvas.activate();

            var nodeIterator = iframeDocument.createNodeIterator(iframeDocument.body, NodeFilter.SHOW_ELEMENT, null, false),
                currentElement = nodeIterator.nextNode();
            while (currentElement) {
                var overflowY = currentElement.currentStyle.overflowY;
                tc.isTrue(overflowY !== "auto" && overflowY !== "scroll", "Found element with scroll style: " + currentElement.outerHTML);
                currentElement = nodeIterator.nextNode();
            }

            complete();
        });
    });

    opt.description = "Tests that the iframe uses a default height if the content is short.";
    Tx.asyncTest("ModernCanvas.testStartShort", opt, function (tc) {
        runAutoResizeTest(tc, function (complete) {
            modernCanvas.addContent("<img style='width:1px;height:64px;'>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);
            modernCanvas.activate();

            setImmediate(function () {
                forceAutoResize();
                tc.areEqual(defaultIframeHeight, getComputedStyle(iframeElement).height);
                tc.areEqual(defaultIframeWidth, getComputedStyle(iframeElement).width);

                complete();
            });
        });
    });

    opt.description = "Tests that the iframe uses the height of the content if the content is tall.";
    Tx.asyncTest("ModernCanvas.testStartTall", opt, function (tc) {
        runAutoResizeTest(tc, function (complete) {
            modernCanvas.addContent("<img style='width:1px;height:1337px;'>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);
            modernCanvas.activate();

            setImmediate(function () {
                forceAutoResize();
                // IE adds a mysterious 4px to the scroll height...
                tc.areEqual("1341px", getComputedStyle(iframeElement).height);
                tc.areEqual(defaultIframeWidth, getComputedStyle(iframeElement).width);

                complete();
            });
        });
    });

    opt.description = "Tests that the iframe stays the default size if the content is short.";
    Tx.asyncTest("ModernCanvas.testShrinkShortToShorter", opt, function (tc) {
        runAutoResizeTest(tc, function (complete) {
            modernCanvas.addContent("<img style='width:1px;height:64px;'>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);
            modernCanvas.activate();

            setImmediate(function () {
                forceAutoResize();
                modernCanvas.addContent("<img style='width:1px;height:32px;'>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);
                
                setImmediate(function () {
                    forceAutoResize();
                    tc.areEqual(defaultIframeHeight, getComputedStyle(iframeElement).height);
                    tc.areEqual(defaultIframeWidth, getComputedStyle(iframeElement).width);

                    complete();
                });
            });
        });
    });

    opt.description = "Tests that the iframe grows to fit tall content.";
    Tx.asyncTest("ModernCanvas.testTransitionShortToTall", opt, function (tc) {
        runAutoResizeTest(tc, function (complete) {
            modernCanvas.addContent("<img style='width:1px;height:64px;'>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);
            modernCanvas.activate();

            setImmediate(function () {
                forceAutoResize();
                modernCanvas.addContent("<img style='width:1px;height:1337px;'>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);

                setImmediate(function () {
                    forceAutoResize();
                    // IE adds a mysterious 4px to the scroll height...
                    tc.areEqual("1341px", getComputedStyle(iframeElement).height);
                    tc.areEqual(defaultIframeWidth, getComputedStyle(iframeElement).width);

                    complete();
                });
            });
        });
    });

    opt.description = "Tests that the iframe shrinks to to default height.";
    Tx.asyncTest("ModernCanvas.testTransitionTallToShort", opt, function (tc) {
        runAutoResizeTest(tc, function (complete) {
            modernCanvas.addContent("<img style='width:1px;height:1337px;'>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);
            modernCanvas.activate();

            setImmediate(function () {
                forceAutoResize();
                modernCanvas.addContent("<img style='width:1px;height:64px;'>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);

                setImmediate(function () {
                    forceAutoResize();
                    tc.areEqual(defaultIframeHeight, getComputedStyle(iframeElement).height);
                    tc.areEqual(defaultIframeWidth, getComputedStyle(iframeElement).width);

                    complete();
                });
            });
        });
    });

    opt.description = "Tests that the iframe grows from an already tall height to an even taller height.";
    Tx.asyncTest("ModernCanvas.testGrowTallToTaller", opt, function (tc) {
        runAutoResizeTest(tc, function (complete) {
            modernCanvas.addContent("<img style='width:1px;height:1337px;'>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);
            modernCanvas.activate();

            setImmediate(function () {
                forceAutoResize();
                modernCanvas.addContent("<img style='width:1px;height:7331px;'>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);

                setImmediate(function () {
                    forceAutoResize();
                    // IE adds a mysterious 4px to the scroll height...
                    tc.areEqual("7335px", getComputedStyle(iframeElement).height);
                    tc.areEqual(defaultIframeWidth, getComputedStyle(iframeElement).width);

                    complete();
                });
            });
        });
    });

    
    opt.description = "Tests that the iframe uses the width of the content if the content is wide.";
    Tx.asyncTest("ModernCanvas.testStartWide", opt, function (tc) {
        runAutoResizeTest(tc, function (complete) {
            modernCanvas.addContent("<img style='width:1337px;height:1px;'>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);
            modernCanvas.activate();

            setImmediate(function () {
                forceAutoResize();
                tc.areEqual(defaultIframeHeight, getComputedStyle(iframeElement).height);
                // WinBlue:340090 - IE adds 1px to show the caret when the user is at the end of a line beyond the width of the element
                tc.areEqual("1338px", getComputedStyle(iframeElement).width);

                complete();
            });
        });
    });

    opt.description = "Tests that the iframe stays the default size if the content is thin.";
    Tx.asyncTest("ModernCanvas.testShrinkThinToThinner", opt, function (tc) {
        runAutoResizeTest(tc, function (complete) {
            modernCanvas.addContent("<img style='width:64px;height:1px;'>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);
            modernCanvas.activate();

            setImmediate(function () {
                forceAutoResize();
                modernCanvas.addContent("<img style='width:32px;height:1px;'>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);

                setImmediate(function () {
                    forceAutoResize();
                    tc.areEqual(defaultIframeHeight, getComputedStyle(iframeElement).height);
                    tc.areEqual(defaultIframeWidth, getComputedStyle(iframeElement).width);

                    complete();
                });
            });
        });
    });

    opt.description = "Tests that the iframe grows to fit wide content.";
    Tx.asyncTest("ModernCanvas.testTransitionThinToWide", opt, function (tc) {
        runAutoResizeTest(tc, function (complete) {
            modernCanvas.addContent("<img style='width:64px;height:1px;'>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);
            modernCanvas.activate();

            setImmediate(function () {
                forceAutoResize();
                modernCanvas.addContent("<img style='width:1337px;height:1px;'>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);

                setImmediate(function () {
                    forceAutoResize();
                    tc.areEqual(defaultIframeHeight, getComputedStyle(iframeElement).height);
                    // WinBlue:340090 - IE adds 1px to show the caret when the user is at the end of a line beyond the width of the element
                    tc.areEqual("1338px", getComputedStyle(iframeElement).width);

                    complete();
                });
            });
        });
    });

    opt.description = "Tests that the iframe shrinks to to default width.";
    Tx.asyncTest("ModernCanvas.testTransitionWideToThin", opt, function (tc) {
        runAutoResizeTest(tc, function (complete) {
            modernCanvas.addContent("<img style='width:1337px;height:1px;'>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);
            modernCanvas.activate();

            setImmediate(function () {
                forceAutoResize();
                modernCanvas.addContent("<img style='width:64px;height:1px;'>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);

                setImmediate(function () {
                    forceAutoResize();
                    tc.areEqual(defaultIframeHeight, getComputedStyle(iframeElement).height);
                    tc.areEqual(defaultIframeWidth, getComputedStyle(iframeElement).width);

                    complete();
                });
            });
        });
    });

    opt.description = "Tests that the iframe grows from an already wide width to an even wider width.";
    Tx.asyncTest("ModernCanvas.testGrowWideToWider", opt, function (tc) {
        runAutoResizeTest(tc, function (complete) {
            modernCanvas.addContent("<img style='width:1337px;height:1px;'>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);
            modernCanvas.activate();

            setImmediate(function () {
                forceAutoResize();
                modernCanvas.addContent("<img style='width:7331px;height:1px;'>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);

                setImmediate(function () {
                    forceAutoResize();
                    tc.areEqual(defaultIframeHeight, getComputedStyle(iframeElement).height);
                    // WinBlue:340090 - IE adds 1px to show the caret when the user is at the end of a line beyond the width of the element
                    tc.areEqual("7332px", getComputedStyle(iframeElement).width);

                    complete();
                });
            });
        });
    });
    
})();
