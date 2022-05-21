
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global document, DOMxImpl, Jx, ModernCanvas, MSApp, Node, Tx, URL, Windows, WinJS*/
(function () {

    // Override Jx getString
    Jx.res.getString = function (key) {
        return "STRING_FOR_KEY(" + key + ")";
    };

    var opt,
        log,
        iframeElement,
        modernCanvas,
        iframeDOMx,
        canvasElement,
        scrollableElement,
        runUnitTest,
        emptyOptions = {
            delayActivation: true,
            autoReplaceManager: {
                addEventListener: function () { },
                bulkConvertRangeText: function () { },
                bulkConvertElement: function () { },
                bulkConvertString: function (htmlString) {
                    return htmlString;
                },
                bulkConvert: function (htmlString, htmlElement) {
                    return htmlElement.innerHTML;
                },
                bulkElementConversion: function () {
                    return false;
                },
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
            commandManager: {
                addEventListener: function () { },
                clearUsageData: function () {
                    log += "clearUsageData(commandManager)";
                },
                getCommand: function () { },
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
        },

        defaultOptions = {
            delayActivation: true,
            autoResize: {},
            contextMenuManager: {
                clearUsageData: function () {},
                getUsageData: function () { },
                onContextMenu: function () { }
            }
        };

    // Each line will have a line-height of 20px, so the height of all 50 lines will be 1000px.
    var fiftyLines = "";
    for (var i = 0; i < 50; i++) {
        fiftyLines += "<div>Bacon ipsum dolor sit amet sausage pork chop ham hock jowl, turducken tongue bacon brisket chuck flank leberkas turkey ham meatball.</div>";
    }

    function setup(tc, canvasOptions) {
        log = "";

        // The scrollable element contains the Modern Canvas iframe
        scrollableElement = document.getElementById("modernCanvasContainer");

        iframeElement = document.createElement("iframe");
        scrollableElement.appendChild(iframeElement);
        iframeElement.addEventListener("load", function onLoadIframeElement() {

            iframeElement.removeEventListener("load", onLoadIframeElement, false);
            iframeDOMx = new DOMxImpl(iframeElement.contentDocument);

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

            // Styles necessary for unit testing
            canvasElement.style.lineHeight = "20px";

            runUnitTest(tc);
        }, false);
        iframeElement.src = "ms-appx:///ModernCanvas/ModernCanvasFrame.html";
    }

    function cleanup() {
        // Throw away the ModernCanvas
        modernCanvas.dispose();
        modernCanvas = null;

        // Remove the test elements from the DOM
        scrollableElement.innerHTML = "";
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

    function runFullCanvasTest(tc, fnTest, argsFnTest) {
        runUnitTest = function (tc) {
            fnTest(argsFnTest);
            tc.start();
        };

        tc.stop();
        tc.cleanup = cleanup;
        setup(tc, defaultOptions);
    }

    function runScrollCanvasTest(tc, fnTest, argsFnTest) {
        runUnitTest = function (tc) {
            modernCanvas.addContent(fiftyLines, ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);

            // Mimic auto-resize behavior to force the iframe larger, thus causing scrollbars in the scrollableElement.
            iframeElement.style.width = canvasElement.scrollWidth + "px";
            iframeElement.style.height = canvasElement.scrollHeight + "px";

            // Make sure we start in a known state.
            scrollableElement.scrollTop = 0;
            scrollableElement.scrollLeft = 0;

            fnTest(argsFnTest);
            tc.start();
        };

        tc.stop();
        tc.cleanup = cleanup;
        setup(tc, emptyOptions);
    }

    function runAccentTest(tc, options) {
        // For each one of the letter conversions
        var keyArgs = options.keyArgs,
            letterConversions = options.letterConversions,
            currentLetterConversion;
        for (var m = letterConversions.length; m--;) {
            // Ensure the Canvas is empty and has focus
            modernCanvas.addContent("", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);
            modernCanvas.focus();

            // Press the keystrokes to set the accent flag
            iframeDOMx.simulateKeyStroke(keyArgs);

            // Send the basic letter
            currentLetterConversion = letterConversions[m];
            iframeDOMx.simulateKeyStroke({ key: currentLetterConversion.letter, shift: currentLetterConversion.shift });

            // Check that the correct result was entered
            var content = modernCanvas.getContent([ModernCanvas.ContentFormat.text]);
            tc.areEqual(currentLetterConversion.result, content[ModernCanvas.ContentFormat.text], "Unexpected result when typing " + currentLetterConversion.letter + " " + (currentLetterConversion.shift ? "with" : "without") + " shift key after accent keystroke.");
        }
    }

    opt = {
        owner: "widuff",
        priority: "0"
    };

    opt.description = "Tests that the modern canvas can do a min-bar initialization.";
    Tx.asyncTest("ModernCanvas.testInitialization", opt, function (tc) {
        runCanvasTest(tc, function () {
            tc.areEqual(true, iframeElement.id !== undefined);
            tc.log("ModernCanvas assigned an ID to the element.");
        });
    });

    opt.description = "Tests that the modern canvas can add content.";
    Tx.asyncTest("ModernCanvas.testAddContent", opt, function (tc) {
        runCanvasTest(tc, function () {
            modernCanvas.addContent("<h1>newTextContent</h1>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);
            tc.isTrue(canvasElement.innerHTML.indexOf("<h1>newTextContent</h1>") !== -1);
            tc.log("ModernCanvas correctly set full HTML");

            modernCanvas.addContent("<h1>secondTextContent</h1>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.end, true);
            tc.isTrue(canvasElement.innerHTML.indexOf("<h1>newTextContent</h1>") !== -1);
            tc.isTrue(canvasElement.innerHTML.indexOf("<h1>secondTextContent</h1>") !== -1);
            tc.isTrue(canvasElement.innerHTML.indexOf("<h1>newTextContent</h1>") < canvasElement.innerHTML.indexOf("<h1>secondTextContent</h1>"));
            tc.log("ModernCanvas correctly appended HTML");

            modernCanvas.addContent("<h1>firstTextContent</h1>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.start, true);
            tc.isTrue(canvasElement.innerHTML.indexOf("<h1>newTextContent</h1>") !== -1);
            tc.isTrue(canvasElement.innerHTML.indexOf("<h1>secondTextContent</h1>") !== -1);
            tc.isTrue(canvasElement.innerHTML.indexOf("<h1>firstTextContent</h1>") !== -1);
            tc.isTrue(canvasElement.innerHTML.indexOf("<h1>newTextContent</h1>") < canvasElement.innerHTML.indexOf("<h1>secondTextContent</h1>"));
            tc.isTrue(canvasElement.innerHTML.indexOf("<h1>firstTextContent</h1>") < canvasElement.innerHTML.indexOf("<h1>newTextContent</h1>"));
            tc.log("ModernCanvas correctly prepended HTML");

            modernCanvas.addContent("newTextContent", ModernCanvas.ContentFormat.text, ModernCanvas.ContentLocation.all, true);
            tc.isTrue(canvasElement.innerHTML.indexOf("newTextContent") !== -1);
            tc.isTrue(canvasElement.innerHTML.indexOf("<h1>") === -1);
            tc.log("ModernCanvas correctly set full text");

            modernCanvas.addContent("secondTextContent", ModernCanvas.ContentFormat.text, ModernCanvas.ContentLocation.end, true);
            tc.isTrue(canvasElement.innerHTML.indexOf("newTextContent") !== -1);
            tc.isTrue(canvasElement.innerHTML.indexOf("secondTextContent") !== -1);
            tc.isTrue(canvasElement.innerHTML.indexOf("newTextContent") < canvasElement.innerHTML.indexOf("secondTextContent"));
            tc.isTrue(canvasElement.innerHTML.indexOf("<h1>") === -1);
            tc.log("ModernCanvas correctly appended text");

            modernCanvas.addContent("firstTextContent", ModernCanvas.ContentFormat.text, ModernCanvas.ContentLocation.start, true);
            tc.isTrue(canvasElement.innerHTML.indexOf("newTextContent") !== -1);
            tc.isTrue(canvasElement.innerHTML.indexOf("secondTextContent") !== -1);
            tc.isTrue(canvasElement.innerHTML.indexOf("firstTextContent") !== -1);
            tc.isTrue(canvasElement.innerHTML.indexOf("newTextContent") < canvasElement.innerHTML.indexOf("secondTextContent"));
            tc.isTrue(canvasElement.innerHTML.indexOf("firstTextContent") < canvasElement.innerHTML.indexOf("newTextContent"));
            tc.isTrue(canvasElement.innerHTML.indexOf("<h1>") === -1);
            tc.log("ModernCanvas correctly prepended text");
        });
    });

    opt.description = "Tests that the modern canvas adds empty lines if a table is inserted as the first and/or last element.";
    Tx.asyncTest("ModernCanvas.testEmptyLinesForTables", opt, function (tc) {
        runCanvasTest(tc, function () {
            var emptyLineHtml = "<div><br></div>";

            modernCanvas.addContent("<table><tr><td>1</td></tr></table>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);
            tc.areEqual(canvasElement.firstChild.outerHTML, emptyLineHtml);
            tc.areEqual(canvasElement.lastChild.outerHTML, emptyLineHtml);

            modernCanvas.addContent("<div>test</div><table><tr><td>1</td></tr></table>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);
            tc.areEqual(canvasElement.firstChild.outerHTML, "<div>test</div>");
            tc.areEqual(canvasElement.lastChild.outerHTML, emptyLineHtml);

            modernCanvas.addContent("<table><tr><td>1</td></tr></table><div>test</div>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);
            tc.areEqual(canvasElement.firstChild.outerHTML, emptyLineHtml);
            tc.areEqual(canvasElement.lastChild.outerHTML, "<div>test</div>");
        });
    });

    opt.description = "Verifies that createUrlToStreamMapAsync returns the desired mapping";
    Tx.asyncTest("ModernCanvas.testCreateUrlToStreamMapAsync", opt, function (tc) {
        runCanvasTest(tc, function () {
            tc.stop();

            var RandomAccessStreamReference = Windows.Storage.Streams.RandomAccessStreamReference,
                dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage(),
                stream = new Windows.Storage.Streams.InMemoryRandomAccessStream(),
                writer = Windows.Storage.Streams.DataWriter(stream),
                readers = {},
                expectedString = "This is just a test.",
                msAppxUrl = "ms-appx:///default.html",
                blobUrl,
                fileUrl = "file:///C:/Users/Administrator/default.html",
                msClipboardFileUrl = "ms-clipboard-" + fileUrl;

            // Write out to a test stream.
            writer.writeString(expectedString);
            writer.storeAsync()
                .then(function () {
                    return writer.flushAsync();
                })
                .then(function () {
                    stream = writer.detachStream();
                    stream.seek(0);
                    writer.close();

                    // Point three different URLs at the test stream.
                    dataPackage.resourceMap[msAppxUrl] = RandomAccessStreamReference.createFromStream(stream.cloneStream());
                    dataPackage.resourceMap[fileUrl] = RandomAccessStreamReference.createFromStream(stream.cloneStream());

                    var blob = MSApp.createBlobFromRandomAccessStream("text/plain", stream);
                    blobUrl = URL.createObjectURL(blob);
                    dataPackage.resourceMap[blobUrl] = RandomAccessStreamReference.createFromStream(stream.cloneStream());

                    // Create a urlToStreamMap.
                    return ModernCanvas.createUrlToStreamMapAsync(dataPackage.getView());
                })
                .then(function (urlToStreamMap) {
                    // Verify the expected URLs are in the urlToStreamMap.
                    [msAppxUrl, blobUrl, fileUrl, msClipboardFileUrl].forEach(function (url) {
                        tc.isNotNullOrUndefined(urlToStreamMap[url]);
                    });

                    // Load a reader over each stream in the urlToStreamMap.
                    var readerPromises = [msAppxUrl, blobUrl, fileUrl].map(function (url) {
                        var reader = readers[url] = new Windows.Storage.Streams.DataReader(urlToStreamMap[url]);
                        return reader.loadAsync(stream.size);
                    });

                    return WinJS.Promise.join(readerPromises);
                })
                .done(function () {
                    // Read back the streams returned by the urlToStreamMap and make sure they match the original test stream.
                    Object.keys(readers).forEach(function (url) {
                        var reader = readers[url];
                        tc.areEqual(reader.readString(expectedString.length), expectedString);
                    });

                    tc.start();
                });
        });
    });

    opt.description = "Verifies that getCharacterCount returns the correct number of characters.";
    Tx.asyncTest("ModernCanvas.testGetCharacterCount", opt, function (tc) {
        runCanvasTest(tc, function () {
            modernCanvas.addContent("<div>my<strong>Text</strong>Content</div>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);

            tc.areEqual(13, modernCanvas.getCharacterCount());
        });
    });

    opt.description = "Tests that the modern canvas can return its contents.";
    Tx.asyncTest("ModernCanvas.testGetContent", opt, function (tc) {
        runCanvasTest(tc, function () {
            modernCanvas.addContent("<div>myTextContent</div>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);

            var content = modernCanvas.getContent([ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentFormat.text]);

            tc.isTrue(content[ModernCanvas.ContentFormat.htmlString].indexOf("<div>myTextContent</div>") !== -1);
            tc.log("ModernCanvas correctly fetched innerHTML");

            tc.areEqual("myTextContent", content[ModernCanvas.ContentFormat.text]);
            tc.log("ModernCanvas correctly fetched innerHTML");
        });
    });

    opt.description = "Verifies that isRTL correctly identifies if the content is RTL or not.";
    Tx.asyncTest("ModernCanvas.testIsRTL", opt, function (tc) {
        runCanvasTest(tc, function () {
            // Set the direction as LTR
            modernCanvas.getDocument().body.dir = "ltr";
            tc.isFalse(modernCanvas.isRTL(), "isRTL returned true when direction was LTR");

            // Set the direction as TRL
            modernCanvas.getDocument().body.dir = "rtl";
            tc.isTrue(modernCanvas.isRTL(), "isRTL returned false when direction was RTL");

            // Return the body
            modernCanvas.getDocument().body.dir = "";
        });
    });

    opt.description = "Verifies that the 'reset' function performs all expected tasks.";
    Tx.asyncTest("ModernCanvas.testReset", opt, function (tc) {
        runCanvasTest(tc, function () {
            modernCanvas.addContent("<div>myTextContent</div>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);

            modernCanvas.reset();

            tc.areEqual(null, modernCanvas.getCanvasElement().firstChild, "Content was not cleared properly.");
            tc.isTrue(log.indexOf("clearUsageData") >= 0, "Usage data was not cleared properly.");
        });
    });

    opt.description = "Verifies that undoable changes work correctly.";
    Tx.asyncTest("ModernCanvas.testUndoableChange", opt, function (tc) {
        runFullCanvasTest(tc, function () {
            modernCanvas.addContent("<div>Bacon ipsum dolor sit amet beef ribs capicola sausage jerky.</div>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);

            Jx.raiseEvent(modernCanvas, "beforeundoablechange");

            var range = modernCanvas.getDocument().createRange(),
                textNode = canvasElement.querySelector("div").firstChild;
            tc.areEqual(textNode.nodeType, Node.TEXT_NODE);

            var capicolaIndex = textNode.data.indexOf("capicola");
            range.setStart(textNode, capicolaIndex);
            range.setEnd(textNode, capicolaIndex + "capicola".length);
            range.deleteContents();

            var fragment = range.createContextualFragment("prosciutto");
            range.insertNode(fragment);

            Jx.raiseEvent(modernCanvas, "undoablechange");

            tc.areEqual(canvasElement.innerHTML, "<div>Bacon ipsum dolor sit amet beef ribs prosciutto sausage jerky.</div>");
            Jx.raiseEvent(modernCanvas, "command", { command: "undo" });
            tc.areEqual(canvasElement.innerHTML, "<div>Bacon ipsum dolor sit amet beef ribs capicola sausage jerky.</div>");
            Jx.raiseEvent(modernCanvas, "command", { command: "redo" });
            tc.areEqual(canvasElement.innerHTML, "<div>Bacon ipsum dolor sit amet beef ribs prosciutto sausage jerky.</div>");

            modernCanvas.clearUndoRedo();

            Jx.raiseEvent(modernCanvas, "command", { command: "undo" });
            tc.areEqual(canvasElement.innerHTML, "<div>Bacon ipsum dolor sit amet beef ribs prosciutto sausage jerky.</div>");
            Jx.raiseEvent(modernCanvas, "command", { command: "redo" });
            tc.areEqual(canvasElement.innerHTML, "<div>Bacon ipsum dolor sit amet beef ribs prosciutto sausage jerky.</div>");
        });
    });

    opt.description = "Verifies the _normalizeRange function performs as expected.";
    Tx.test("ModernCanvas.normalizeRange", opt, function (tc) {
        var html = '<div id="normalDiv">text<div id="nonNormalDiv">text</div>text</div><div id="emptyDiv"></div>',
            root = document.createElement("div"),
            nonZeroText = document.createTextNode("text"),
            zeroText = document.createTextNode(""),
            range = document.createRange();

        document.body.appendChild(root);
        root.innerHTML = html;

        var emptyDiv = document.getElementById("emptyDiv"),
            normalDiv = document.getElementById("normalDiv"),
            nonNormalDiv = document.getElementById("nonNormalDiv");

        nonNormalDiv.appendChild(zeroText.cloneNode(true));
        nonNormalDiv.appendChild(zeroText.cloneNode(true));
        nonNormalDiv.appendChild(nonZeroText.cloneNode(true));
        nonNormalDiv.appendChild(zeroText.cloneNode(true));

        emptyDiv.appendChild(zeroText.cloneNode(true));

        range.selectNodeContents(root);
        
        // make sure we understand the pre-condition
        tc.areEqual(nonNormalDiv.childNodes.length, 5, "pre-nonNormalDiv");
        tc.areEqual(normalDiv.childNodes.length, 3, "pre-normalDiv");
        tc.areEqual(emptyDiv.childNodes.length, 1, "pre-emptyDiv");

        ModernCanvas.Component.prototype._normalizeRange(range);

        // validate the result
        tc.areEqual(nonNormalDiv.childNodes.length, 1, "nonNormalDiv");
        tc.areEqual(nonNormalDiv.firstChild.nodeValue, "texttext", "nonNormalDiv value");
        tc.areEqual(normalDiv.childNodes.length, 3, "normalDiv");
        tc.areEqual(emptyDiv.childNodes.length, 0, "emptyDiv");

        root.removeNode(true);
    });


    opt.description = "Verifies the _constrainMaxImageSize function performs as expected.";
    Tx.test("ModernCanvas.constrainMaxImageSize", opt, function (tc) {
        var img = document.createElement("img"),
            mcanvas = {
                _constrainMaxImageSize: ModernCanvas.ModernCanvasBase.prototype._constrainMaxImageSize,
                _maxImageSize: 640,
                _maxImageSizeString: "640px"
            },
            clearImg = function () {
                img.style.removeAttribute("max-height");
                img.style.removeAttribute("max-width");
                img.style.removeAttribute("width");
                img.style.removeAttribute("height");
                img.removeAttribute("height");
                img.removeAttribute("width");
            };
            
        // no dimensions
        clearImg();
        mcanvas._constrainMaxImageSize(img);
        tc.areEqual(img.currentStyle.width, "auto");
        tc.areEqual(img.currentStyle.height, "auto");
        tc.areEqual(img.currentStyle.maxWidth, "640px");
        tc.areEqual(img.currentStyle.maxHeight, "640px");

        // only set width
        // 2000x8000
        clearImg();
        img.width="8000";
        mcanvas._constrainMaxImageSize(img);
        tc.areEqual(img.currentStyle.width, "auto");
        tc.areEqual(img.currentStyle.height, "auto");
        tc.areEqual(img.currentStyle.maxWidth, "640px");
        tc.areEqual(img.currentStyle.maxHeight, "640px");

        // 2000x8000
        clearImg();
        img.width = "2000";
        mcanvas._constrainMaxImageSize(img);
        tc.areEqual(img.currentStyle.width, "auto");
        tc.areEqual(img.currentStyle.height, "auto");
        tc.areEqual(img.currentStyle.maxWidth, "640px");
        tc.areEqual(img.currentStyle.maxHeight, "640px");

        // 800x200
        clearImg();
        img.width = "800";
        mcanvas._constrainMaxImageSize(img);
        tc.areEqual(img.currentStyle.width, "auto");
        tc.areEqual(img.currentStyle.height, "auto");
        tc.areEqual(img.currentStyle.maxWidth, "640px");
        tc.areEqual(img.currentStyle.maxHeight, "640px");

        // 200x800
        clearImg();
        img.width = "200";
        mcanvas._constrainMaxImageSize(img);
        tc.areEqual(img.currentStyle.width, "200px");
        tc.areEqual(img.currentStyle.height, "auto");
        tc.areEqual(img.currentStyle.maxWidth, "none");
        tc.areEqual(img.currentStyle.maxHeight, "none");

        // 80x20
        clearImg();
        img.width = "80";
        mcanvas._constrainMaxImageSize(img);
        tc.areEqual(img.currentStyle.width, "80px");
        tc.areEqual(img.currentStyle.height, "auto");
        tc.areEqual(img.currentStyle.maxWidth, "none");
        tc.areEqual(img.currentStyle.maxHeight, "none");

        // 20x80
        clearImg();
        img.width = "20";
        mcanvas._constrainMaxImageSize(img);
        tc.areEqual(img.currentStyle.width, "20px");
        tc.areEqual(img.currentStyle.height, "auto");
        tc.areEqual(img.currentStyle.maxWidth, "none");
        tc.areEqual(img.currentStyle.maxHeight, "none");

        // only set height
        // 8000x2000
        clearImg();
        img.height = "2000";
        mcanvas._constrainMaxImageSize(img);
        tc.areEqual(img.currentStyle.width, "auto");
        tc.areEqual(img.currentStyle.height, "auto");
        tc.areEqual(img.currentStyle.maxWidth, "640px");
        tc.areEqual(img.currentStyle.maxHeight, "640px");

        // 2000x8000
        clearImg();
        img.height = "8000";
        mcanvas._constrainMaxImageSize(img);
        tc.areEqual(img.currentStyle.width, "auto");
        tc.areEqual(img.currentStyle.height, "auto");
        tc.areEqual(img.currentStyle.maxWidth, "640px");
        tc.areEqual(img.currentStyle.maxHeight, "640px");

        // 800x200
        clearImg();
        img.height = "200";
        mcanvas._constrainMaxImageSize(img);
        tc.areEqual(img.currentStyle.width, "auto");
        tc.areEqual(img.currentStyle.height, "200px");
        tc.areEqual(img.currentStyle.maxWidth, "none");
        tc.areEqual(img.currentStyle.maxHeight, "none");

        // 200x800
        clearImg();
        img.height = "800";
        mcanvas._constrainMaxImageSize(img);
        tc.areEqual(img.currentStyle.width, "auto");
        tc.areEqual(img.currentStyle.height, "auto");
        tc.areEqual(img.currentStyle.maxWidth, "640px");
        tc.areEqual(img.currentStyle.maxHeight, "640px");

        // 80x20
        clearImg();
        img.height = "20";
        mcanvas._constrainMaxImageSize(img);
        tc.areEqual(img.currentStyle.width, "auto");
        tc.areEqual(img.currentStyle.height, "20px");
        tc.areEqual(img.currentStyle.maxWidth, "none");
        tc.areEqual(img.currentStyle.maxHeight, "none");

        // 20x80
        clearImg();
        img.height = "80";
        mcanvas._constrainMaxImageSize(img);
        tc.areEqual(img.currentStyle.width, "auto");
        tc.areEqual(img.currentStyle.height, "80px");
        tc.areEqual(img.currentStyle.maxWidth, "none");
        tc.areEqual(img.currentStyle.maxHeight, "none");

        // set both
        // 8000x2000
        clearImg();
        img.width = "8000"; img.height = "2000";
        mcanvas._constrainMaxImageSize(img);
        tc.areEqual(img.currentStyle.width, "auto");
        tc.areEqual(img.currentStyle.height, "auto");
        tc.areEqual(img.currentStyle.maxWidth, "640px");
        tc.areEqual(img.currentStyle.maxHeight, "640px");

        // 2000x8000
        clearImg();
        img.width = "2000"; img.height = "8000";
        mcanvas._constrainMaxImageSize(img);
        tc.areEqual(img.currentStyle.width, "auto");
        tc.areEqual(img.currentStyle.height, "auto");
        tc.areEqual(img.currentStyle.maxWidth, "640px");
        tc.areEqual(img.currentStyle.maxHeight, "640px");

        // 800x200
        clearImg();
        img.width = "800"; img.height = "200";
        mcanvas._constrainMaxImageSize(img);
        tc.areEqual(img.currentStyle.width, "800px");
        tc.areEqual(img.currentStyle.height, "200px");
        tc.areEqual(img.currentStyle.maxWidth, "none");
        tc.areEqual(img.currentStyle.maxHeight, "none");

        // 200x800
        clearImg();
        img.width = "200"; img.height = "800";
        mcanvas._constrainMaxImageSize(img);
        tc.areEqual(img.currentStyle.width, "200px");
        tc.areEqual(img.currentStyle.height, "800px");
        tc.areEqual(img.currentStyle.maxWidth, "none");
        tc.areEqual(img.currentStyle.maxHeight, "none");

        // 80x20
        clearImg();
        img.width = "80"; img.height = "20";
        mcanvas._constrainMaxImageSize(img);
        tc.areEqual(img.currentStyle.width, "80px");
        tc.areEqual(img.currentStyle.height, "20px");
        tc.areEqual(img.currentStyle.maxWidth, "none");
        tc.areEqual(img.currentStyle.maxHeight, "none");

        // 20x80
        clearImg();
        img.width = "20"; img.height = "80";
        mcanvas._constrainMaxImageSize(img);
        tc.areEqual(img.currentStyle.width, "20px");
        tc.areEqual(img.currentStyle.height, "80px");
        tc.areEqual(img.currentStyle.maxWidth, "none");
        tc.areEqual(img.currentStyle.maxHeight, "none");

    });

    opt.description = "Verifies that the 'trimRange' function performs all expected tasks.";
    Tx.asyncTest("ModernCanvas.testTrimRange", opt, function (tc) {
        runCanvasTest(tc, function () {
            modernCanvas.addContent("<div id=\"ttrdiv1\">teststr</div><div id=\"ttrdiv2\"><strong id=\"ttrstr1\">123</strong>345<em id=\"ttrem\">678</em><a id=\"ttra\" href=\"test.htm\">901<strong id=\"ttrstr2\">234</strong><strong id=\"ttrstr3\">567</strong></a><a id=\"ttra2\" href=\"test.htm\"><strong id=\"ttrstr4\">890</strong><strong id=\"ttrstr5\">123</strong></a></div>" +
                "<div id=\"tsttxtlines\"><font style=\"font-size: 8pt;\" id=\"tsttextfirst\">first</font><br><font style=\"font-size: 8pt;\" id=\"tsttextsecond\">second</font><br>third<br></div>" +
                "<div>from <u>Windows<font id=\"empty\"> </font></u><font id=\"mail\">Mail (17.5.9490.0)</font></div>", ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);
            var doc = modernCanvas.getDocument(),
                ttrdiv1 = doc.getElementById("ttrdiv1"),
                ttrdiv2 = doc.getElementById("ttrdiv2"),
                ttrstr1 = doc.getElementById("ttrstr1"),
                ttrstr2 = doc.getElementById("ttrstr2"),
                ttrstr3 = doc.getElementById("ttrstr3"),
                ttrstr4 = doc.getElementById("ttrstr4"),
                ttrstr5 = doc.getElementById("ttrstr5"),
                ttrem = doc.getElementById("ttrem"),
                tsttxtlines = doc.getElementById("tsttxtlines"),
                tsttextfirst = doc.getElementById("tsttextfirst"),
                tsttextsecond = doc.getElementById("tsttextsecond"),
                empty = doc.getElementById("empty"),
                mail = doc.getElementById("mail"),
                range = doc.createRange();

            // Zeroth Test:
            // 
            // <strong>1[23</strong>345<em>67]8</em>
            //
            // Should stay
            // <strong>1[23</strong>345<em>67]8</em>
            range.setStart(ttrstr1.firstChild, 1);
            range.setEnd(ttrem.firstChild, 2);
            var trimRange = modernCanvas.trimRange(range);
            tc.isTrue(trimRange.startContainer === ttrstr1.firstChild);
            tc.isTrue(trimRange.startOffset === 1);
            tc.isTrue(trimRange.endContainer === ttrem.firstChild);
            tc.isTrue(trimRange.endOffset === 2);

            // First Test:
            // 
            // <div>teststr</div><div>[<strong>123</strong>...123</strong></a></div>]<div>content</div>
            //
            // Should become
            // <div>teststr</div><div><strong>[123</strong>...123]</strong></a></div>
            range.setStartBefore(ttrstr1);
            range.setEndAfter(ttrdiv2);
            var trimRange = modernCanvas.trimRange(range);
            tc.isTrue(trimRange.startContainer === ttrstr1.firstChild);
            tc.isTrue(trimRange.startOffset === 0);
            tc.isTrue(trimRange.endContainer === ttrstr5.firstChild);
            tc.isTrue(trimRange.endOffset === 3);
            

            // Second Test:
            //
            // <div><a><strong>234[</strong><strong>567</strong></a><a><strong>890</strong><strong>]123</strong></a></div>
            // Becomes
            //
            // <div><a><strong>234</strong><strong>[567</strong></a><a><strong>890]</strong><strong>123</strong></a></div>
            range = doc.createRange();
            range.setStartAfter(ttrstr2.firstChild);
            range.setEndBefore(ttrstr5.firstChild);
            
            trimRange = modernCanvas.trimRange(range);
            tc.isTrue(trimRange.startContainer === ttrstr3.firstChild);
            tc.isTrue(trimRange.startOffset === 0);
            tc.isTrue(trimRange.endContainer === ttrstr4.firstChild);
            tc.isTrue(trimRange.endOffset === 3);

            // Third Test:
            // 
            // [<strong id=\"ttrstr1\">123</strong>]345
            //
            // Should become
            // <strong id=\"ttrstr1\">[123]</strong>345
            range.setStartBefore(ttrstr1);
            range.setEnd(ttrstr1.nextSibling, 0);
            trimRange = modernCanvas.trimRange(range);
            tc.isTrue(trimRange.startContainer === ttrstr1.firstChild);
            tc.isTrue(trimRange.startOffset === 0);
            tc.isTrue(trimRange.endContainer === ttrstr1.firstChild);
            tc.isTrue(trimRange.endOffset === 3);

            // Fourth Test:
            // 
            // <strong id=\"ttrstr1\">123</strong>345[<em id=\"ttrem\">678</em>]
            //
            // Should become
            // <strong id=\"ttrstr1\">123</strong>345<em id=\"ttrem\">[678]</em>
            range.setStart(ttrstr1.nextSibling, ttrstr1.nextSibling.length);
            range.setEnd(ttrem, 1);
            trimRange = modernCanvas.trimRange(range);
            tc.isTrue(trimRange.startContainer === ttrem.firstChild);
            tc.isTrue(trimRange.startOffset === 0);
            tc.isTrue(trimRange.endContainer === ttrem.firstChild);
            tc.isTrue(trimRange.endOffset === 3);

            // Fifth Test:
            // 
            // <div>[<font style="font-size: 8pt;">first</font><br><font style="font-size: 8pt;">second]</font><br>third<br></div>
            //
            // Should become
            // <div><font style="font-size: 8pt;">[first</font><br><font style="font-size: 8pt;">second]</font><br>third<br></div>
            range.setStart(tsttxtlines, 0);
            range.setEnd(tsttextsecond, 1);
            trimRange = modernCanvas.trimRange(range);
            tc.isTrue(trimRange.startContainer === tsttextfirst.firstChild);
            tc.isTrue(trimRange.startOffset === 0);
            tc.isTrue(trimRange.endContainer === tsttextsecond.firstChild);
            tc.isTrue(trimRange.endOffset === tsttextsecond.firstChild.length);

            // Sixth Test: 
            // 
            // from <u>Windows<font id="empty">[ </font></u><font id="mail">Mail (17.5.9490.0)]</font>
            //
            // Should become
            // from <u>Windows<font id="empty">[ </font></u><font id="mail">Mail (17.5.9490.0)]</font>
            range.setStart(empty, 0);
            range.setEnd(mail, 1);
            trimRange = modernCanvas.trimRange(range);
            tc.isTrue(trimRange.startContainer === empty.firstChild);
            tc.isTrue(trimRange.startOffset === 0);
            tc.isTrue(trimRange.endContainer === mail.firstChild);
            tc.isTrue(trimRange.endOffset === mail.firstChild.length);
        });
    });

    opt.description = "Verifies that the 'getBasicSelectionStyles' function performs all expected tasks.";
    Tx.asyncTest("ModernCanvas.testGetBasicSelectionStyles", opt, function (tc) {
        runCanvasTest(tc, function () {
            modernCanvas.addContent('<div id="gssdiv">teststr<strong id="gssstr">123</strong>345<em id="gssem">678<u id="gssu">901</u></em></div>', ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);
            var doc = modernCanvas.getDocument(),
                gssdiv = doc.getElementById("gssdiv"),
                gssu = doc.getElementById("gssu"),
                gssem = doc.getElementById("gssem"),
                range = doc.createRange();

            range.setStart(gssdiv.firstChild, gssdiv.firstChild.length);
            range.setEnd(gssu.firstChild, 0);
            modernCanvas.replaceSelection(range);
            var styles = modernCanvas.getBasicSelectionStyles();
            tc.isTrue(styles.bold, "first bold");
            tc.isFalse(styles.italic, "first italic");
            tc.isFalse(styles.underline, "first underline");

            range.setStart(gssem.firstChild, gssem.firstChild.length);
            range.setEnd(gssu.firstChild, gssu.firstChild.length);
            modernCanvas.replaceSelection(range);
            styles = modernCanvas.getSelectionStyles();
            tc.isFalse(styles.bold, "second bold");
            tc.isTrue(styles.italic, "second italic");
            tc.isTrue(styles.underline, "second underline");

        });
    });

    Tx.asyncTest("ModernCanvas.testGetSelectionStyles", { owner: "jamima", priority: 0 }, function (tc) {
        runCanvasTest(tc, function () {
            modernCanvas.addContent('<div><font id="test_Selection_getSelectionStyles" face="Calibri" style="color: bisque; background-color: yellow; font-size: 36pt; display: none; ">Nothing to see here.</font></div>', ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.all, true);
            var doc = modernCanvas.getDocument(),
                gssdiv = doc.getElementById("gssdiv"),
                gssu = doc.getElementById("gssu"),
                gssem = doc.getElementById("gssem"),
                range = doc.createRange();

            range.selectNodeContents(doc.getElementById("test_Selection_getSelectionStyles"));
            modernCanvas.replaceSelection(range);

            var styles = modernCanvas.getSelectionStyles();
            tc.areEqual(styles.fontSize, "48px", "fontSize");
            tc.areEqual(styles.fontFamily, "Calibri", "fontFamily");
            tc.areEqual(styles.fontColor, "rgb(255, 228, 196)", "fontColor");
            tc.areEqual(styles.highlightColor, "rgb(255, 255, 0)", "highlightColor");
            tc.isFalse(styles.bold, "bold");
            tc.isFalse(styles.underline, "underline");
            tc.isFalse(styles.italic, "italic");
        });
    });

    opt.description = "Tests that usage data is properly recorded.";
    Tx.asyncTest("ModernCanvas.testUsageData", opt, function (tc) {
        runCanvasTest(tc, function () {
            tc.areEqual("usageData(commandManager)", modernCanvas.getUsageData().commandManager);
            tc.areEqual("usageData(contextMenuManager)", modernCanvas.getUsageData().contextMenuManager);
            tc.areEqual("usageData(shortcutManager)", modernCanvas.getUsageData().shortcutManager);

            modernCanvas.clearUsageData();
            tc.isTrue(log.indexOf("clearUsageData(commandManager)") >= 0);
            tc.isTrue(log.indexOf("clearUsageData(contextMenuManager)") >= 0);
            tc.isTrue(log.indexOf("clearUsageData(shortcutManager)") >= 0);
        });
    });

    opt.description = "Tests that the modern canvas doesn't scroll when the selection is already in view.";
    Tx.asyncTest("ModernCanvas.testDontScrollVisibleSelectionIntoView", opt, function (tc) {
        runScrollCanvasTest(tc, function () {
            var range = iframeElement.contentDocument.createRange();
            range.selectNodeContents(canvasElement.firstChild);
            modernCanvas.replaceSelection(range);

            modernCanvas.scrollSelectionIntoView();

            tc.isTrue(scrollableElement.scrollTop === 0 && scrollableElement.scrollLeft === 0, "Selection was already in view, why did we scroll?");
        });
    });

    opt.description = "Tests that the modern canvas doesn't scroll when the selection is taller than the viewport.";
    Tx.asyncTest("ModernCanvas.testDontScrollVisibleSelectionIntoView", opt, function (tc) {
        runScrollCanvasTest(tc, function () {
            var range = iframeElement.contentDocument.createRange();
            range.selectNodeContents(canvasElement);
            modernCanvas.replaceSelection(range);

            modernCanvas.scrollSelectionIntoView();

            tc.isTrue(scrollableElement.scrollTop === 0 && scrollableElement.scrollLeft === 0, "Selection was taller than the viewport, why did we scroll?");
        });
    });

    opt.description = "Tests that the modern canvas scrolls the top-most line into view when it is selected.";
    Tx.asyncTest("ModernCanvas.testScrollTopLineIntoView", opt, function (tc) {
        runScrollCanvasTest(tc, function () {
            // Scroll all the way to the bottom so the top-most position is not in view.
            scrollableElement.scrollTop = scrollableElement.scrollHeight;

            var range = iframeElement.contentDocument.createRange();
            range.selectNodeContents(canvasElement.firstChild);
            modernCanvas.replaceSelection(range);

            modernCanvas.scrollSelectionIntoView();

            tc.isTrue(scrollableElement.scrollTop === 0 && scrollableElement.scrollLeft === 0, "Selection was not scrolled into view properly");
        });
    });

    opt.description = "Tests that the modern canvas scrolls the bottom-most line into view when it is selected.";
    Tx.asyncTest("ModernCanvas.testScrollBottomLineIntoView", opt, function (tc) {
        runScrollCanvasTest(tc, function () {
            var range = iframeElement.contentDocument.createRange();
            range.selectNodeContents(canvasElement.lastChild);
            modernCanvas.replaceSelection(range);

            modernCanvas.scrollSelectionIntoView();

            // When scrolled all the way to the bottom, the scroll position corresponds to the top of the viewport, so scrollTop !== scrollHeight.
            var bottomMostScrollTop = scrollableElement.scrollHeight - scrollableElement.offsetHeight;
            tc.isTrue(scrollableElement.scrollTop === bottomMostScrollTop && scrollableElement.scrollLeft === 0, "Selection was not scrolled into view properly");
        });
    });

    opt.description = "Tests that the modern canvas scrolls the left-most position into view when it is selected.";
    Tx.asyncTest("ModernCanvas.testScrollLeftIntoView", opt, function (tc) {
        runScrollCanvasTest(tc, function () {
            // Scroll all the way to the right so the left-most position is not in view.
            scrollableElement.scrollLeft = scrollableElement.scrollWidth;

            var range = iframeElement.contentDocument.createRange();
            range.selectNodeContents(canvasElement.firstChild);
            range.collapse(/*toStart*/true);
            modernCanvas.replaceSelection(range);

            modernCanvas.scrollSelectionIntoView();

            tc.isTrue(scrollableElement.scrollTop === 0 && scrollableElement.scrollLeft === 0, "Selection was not scrolled into view properly");
        });
    });

    opt.description = "Tests that the modern canvas scrolls the right-most position into view when it is selected.";
    Tx.asyncTest("ModernCanvas.testScrollRightIntoView", opt, function (tc) {
        runScrollCanvasTest(tc, function () {
            var range = iframeElement.contentDocument.createRange();
            range.selectNodeContents(canvasElement.firstChild);
            range.collapse(/*toStart*/false);
            modernCanvas.replaceSelection(range);

            modernCanvas.scrollSelectionIntoView();

            // When scrolled all the way to the right, the scroll position corresponds to the left of the viewport, so scrollLeft !== scrollWidth. 
            // And because the canvas is wider than the text it contains, we can't use scrollableElement.scrollWidth directly but instead must 
            // measure where the scroll position actually is.
            var rightMostScrollLeft = Math.round(range.getBoundingClientRect().left) - scrollableElement.offsetWidth;
            tc.isTrue(scrollableElement.scrollTop === 0 && scrollableElement.scrollLeft === rightMostScrollLeft, "Selection was not scrolled into view properly");
        });
    });

    opt = {
        owner: "jamima",
        priority: "0"
    };

    opt.description = "Tests that the modern canvas correctly allows typing in accent acute characters.";
    Tx.asyncTest("ModernCanvas.testAccentAcute", opt, function (tc) {
        runFullCanvasTest(tc, function (args) {
            runAccentTest(tc, args);
        }, {
            keyArgs: { ctrl: true, key: "'" },
            letterConversions: [
                { letter: "A", result: "\u00C1", shift: true },
                { letter: "D", result: "\u00D0", shift: true },
                { letter: "E", result: "\u00C9", shift: true },
                { letter: "I", result: "\u00CD", shift: true },
                { letter: "O", result: "\u00D3", shift: true },
                { letter: "U", result: "\u00DA", shift: true },
                { letter: "Y", result: "\u00DD", shift: true },
                { letter: "a", result: "\u00E1", shift: false },
                { letter: "d", result: "\u00F0", shift: false },
                { letter: "e", result: "\u00E9", shift: false },
                { letter: "i", result: "\u00ED", shift: false },
                { letter: "o", result: "\u00F3", shift: false },
                { letter: "u", result: "\u00FA", shift: false },
                { letter: "y", result: "\u00FD", shift: false }
            ]
        });
    });

    opt.description = "Tests that the modern canvas correctly allows typing in accent cedilla characters.";
    Tx.asyncTest("ModernCanvas.testAccentCedilla", opt, function (tc) {
        runFullCanvasTest(tc, function (args) {
            runAccentTest(tc, args);
        }, {
            keyArgs: { ctrl: true, key: "," },
            letterConversions: [
                { letter: "C", result: "\u00C7", shift: true },
                { letter: "c", result: "\u00E7", shift: false }
            ]
        });
    });

    opt.description = "Tests that the modern canvas correctly allows typing in accent circumflex characters.";
    Tx.asyncTest("ModernCanvas.testAccentCircumflex", opt, function (tc) {
        runFullCanvasTest(tc, function (args) {
            runAccentTest(tc, args);
        }, {
            keyArgs: { ctrl: true, key: "^", shift: true },
            letterConversions: [
                { letter: "A", result: "\u00C2", shift: true },
                { letter: "E", result: "\u00CA", shift: true },
                { letter: "I", result: "\u00CE", shift: true },
                { letter: "O", result: "\u00D4", shift: true },
                { letter: "U", result: "\u00DB", shift: true },
                { letter: "a", result: "\u00E2", shift: false },
                { letter: "e", result: "\u00EA", shift: false },
                { letter: "i", result: "\u00EE", shift: false },
                { letter: "o", result: "\u00F4", shift: false },
                { letter: "u", result: "\u00FB", shift: false }
            ]
        });
    });

    opt.description = "Tests that the modern canvas correctly allows typing in accent diaeresis characters.";
    Tx.asyncTest("ModernCanvas.testAccentDiaeresis", opt, function (tc) {
        runFullCanvasTest(tc, function (args) {
            runAccentTest(tc, args);
        }, {
            keyArgs: { ctrl: true, key: "semicolon", shift: true },
            letterConversions: [
                { letter: "A", result: "\u00C4", shift: true },
                { letter: "E", result: "\u00CB", shift: true },
                { letter: "I", result: "\u00CF", shift: true },
                { letter: "O", result: "\u00D6", shift: true },
                { letter: "U", result: "\u00DC", shift: true },
                { letter: "Y", result: "\u0178", shift: true },
                { letter: "a", result: "\u00E4", shift: false },
                { letter: "e", result: "\u00EB", shift: false },
                { letter: "i", result: "\u00EF", shift: false },
                { letter: "o", result: "\u00F6", shift: false },
                { letter: "u", result: "\u00FC", shift: false },
                { letter: "y", result: "\u00FF", shift: false }
            ]
        });
    });

    opt.description = "Tests that the modern canvas correctly allows typing in accent grave characters.";
    Tx.asyncTest("ModernCanvas.testAccentGrave", opt, function (tc) {
        runFullCanvasTest(tc, function (args) {
            runAccentTest(tc, args);
        }, {
            keyArgs: { ctrl: true, key: "`" },
            letterConversions: [
                { letter: "A", result: "\u00C0", shift: true },
                { letter: "E", result: "\u00C8", shift: true },
                { letter: "I", result: "\u00CC", shift: true },
                { letter: "O", result: "\u00D2", shift: true },
                { letter: "U", result: "\u00D9", shift: true },
                { letter: "a", result: "\u00E0", shift: false },
                { letter: "e", result: "\u00E8", shift: false },
                { letter: "i", result: "\u00EC", shift: false },
                { letter: "o", result: "\u00F2", shift: false },
                { letter: "u", result: "\u00F9", shift: false }
            ]
        });
    });

    opt.description = "Tests that the modern canvas correctly allows typing in accent ligature characters.";
    Tx.asyncTest("ModernCanvas.testAccentLigature", opt, function (tc) {
        runFullCanvasTest(tc, function (args) {
            runAccentTest(tc, args);
        }, {
            keyArgs: { ctrl: true, key: "&", shift: true },
            letterConversions: [
                { letter: "A", result: "\u00C6", shift: true },
                { letter: "O", result: "\u0152", shift: true },
                { letter: "a", result: "\u00E6", shift: false },
                { letter: "o", result: "\u0153", shift: false },
                { letter: "s", result: "\u00DF", shift: false }
            ]
        });
    });

    opt.description = "Tests that the modern canvas correctly allows typing in accent ring characters.";
    Tx.asyncTest("ModernCanvas.testAccentRing", opt, function (tc) {
        runFullCanvasTest(tc, function (args) {
            runAccentTest(tc, args);
        }, {
            keyArgs: { ctrl: true, key: "@", shift: true },
            letterConversions: [
                { letter: "A", result: "\u00C5", shift: true },
                { letter: "a", result: "\u00E5", shift: false }
            ]
        });
    });

    opt.description = "Tests that the modern canvas correctly allows typing in accent slash characters.";
    Tx.asyncTest("ModernCanvas.testAccentSlash", opt, function (tc) {
        runFullCanvasTest(tc, function (args) {
            runAccentTest(tc, args);
        }, {
            keyArgs: { ctrl: true, key: "forwardslash" },
            letterConversions: [
                { letter: "O", result: "\u00D8", shift: true },
                { letter: "o", result: "\u00F8", shift: false }
            ]
        });
    });

    opt.description = "Tests that the modern canvas correctly allows typing in accent tilde characters.";
    Tx.asyncTest("ModernCanvas.testAccentTilde", opt, function (tc) {
        runFullCanvasTest(tc, function (args) {
            runAccentTest(tc, args);
        }, {
            keyArgs: { ctrl: true, key: "~", shift: true },
            letterConversions: [
                { letter: "A", result: "\u00C3", shift: true },
                { letter: "N", result: "\u00D1", shift: true },
                { letter: "O", result: "\u00D5", shift: true },
                { letter: "a", result: "\u00E3", shift: false },
                { letter: "n", result: "\u00F1", shift: false },
                { letter: "o", result: "\u00F5", shift: false }
            ]
        });
    });

})();
