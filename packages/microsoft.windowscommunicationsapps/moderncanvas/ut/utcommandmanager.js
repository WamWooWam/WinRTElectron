
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx, MockComponent, Debug, ModernCanvas, Tx*/
/*jshint browser:true*/

(function () {

    // Override Jx getString
    Jx.res.getString = function (key) {
        return "STRING_FOR_KEY(" + key + ")";
    };

    // Define the setup/teardown functions
    var unitTestElement,
        unitTestComponent,
        commandManager,
        contentNode,
        testContext;

    var runCommandFunction = function () {
        testContext.log("Running the command");
    };
    var executeCommand = function (obj, commandId, value) {
        Jx.raiseEvent(obj, "command", { command: commandId, value: value });
    };

    function setup(tc) {
        testContext = tc;

        // Add test element to the DOM
        unitTestElement = document.createElement("div");
        unitTestElement.contentEditable = true;
        document.body.appendChild(unitTestElement);

        unitTestComponent = new MockComponent();
        Debug.Events.define(unitTestComponent, "beforecommand", "command", "aftercommand", "beforeundoablechange", "undoablechange");
        unitTestComponent.getCanvasElement = function () { return unitTestElement; };
        unitTestComponent.components = {
            autoReplaceManager: {
                bulkConvertString: function (str) { return str; },
                bulkElementConversion: function () { return true; },
                bulkConvertRangeText: function () { }
            },
        };
        unitTestComponent.getSelectionStyles = function () { return {}; };

        // Start the element with some content
        contentNode = document.createTextNode("content");
        unitTestElement.appendChild(contentNode);

        // Set focus in the element
        unitTestElement.focus();
        var range = document.createRange(),
            selObj = document.getSelection();
        range.selectNodeContents(unitTestElement);
        selObj.removeAllRanges();
        selObj.addRange(range);
    }

    function cleanup() {
        // Detach the command manager from the DOM
        if (commandManager) {
            Jx.removeListener(unitTestComponent, "command", commandManager.onCommand, commandManager);
        }

        // Remove the test element from the DOM
        unitTestElement.parentNode.removeChild(unitTestElement);

        // Throw away the handles
        commandManager = null;
        contentNode = null;
        unitTestElement = null;
        testContext = null;
    }

    function setUpCommandManager(tc, className) {
        // Initialize the CommandManager and attach it to the DOM
        tc.log("Creating command manager.");
        commandManager = new ModernCanvas.CommandManager(className, unitTestComponent);
        unitTestComponent.appendChild(commandManager);
        tc.log("Attaching to DOM.");
        Jx.addListener(unitTestComponent, "command", commandManager.onCommand, commandManager);
        tc.log("Finished creating command manager.");
    }

    // Command tests - Tests that commands initialize correctly.
    Tx.test("CommandManager.testCommandInit", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        setUpCommandManager(tc, "empty");
        var command = new ModernCanvas.Command("sampleCommandName", runCommandFunction, { enabledOn: ModernCanvas.Command.EnableStates.hasSelection, undoable: false });
        tc.areEqual("sampleCommandName", command.id);
        tc.areEqual(runCommandFunction, command.run);
        tc.areEqual(ModernCanvas.Command.EnableStates.hasSelection, command.enabledOn);
        tc.areEqual(false, command.undoable);
    });

    // CommandManager tests - Tests that commands can be added.
    Tx.test("CommandManager.testAdd", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        setUpCommandManager(tc, "empty");
        var command1 = new ModernCanvas.Command("sampleCommand1", runCommandFunction),
            command2 = new ModernCanvas.Command("sampleCommand2", runCommandFunction);

        commandManager.setCommand(command1);
        commandManager.setCommand(command2);
        tc.areEqual(command1, commandManager.getCommand("sampleCommand1"));
        tc.areEqual(command2, commandManager.getCommand("sampleCommand2"));
    });

    // CommandManager tests - Tests that commands can be removed.
    Tx.test("CommandManager.testRemove", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        setUpCommandManager(tc, "empty");
        var command1 = new ModernCanvas.Command("sampleCommand1", runCommandFunction),
            command2 = new ModernCanvas.Command("sampleCommand2", runCommandFunction);

        commandManager.setCommand(command1);
        commandManager.setCommand(command2);
        commandManager.removeCommand("sampleCommand1");
        tc.areEqual(null, commandManager.getCommand("sampleCommand1"));
    });

    // CommandManager tests - Tests that onCommand calls the correct commands.
    Tx.test("CommandManager.testOnCommand", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        setUpCommandManager(tc, "empty");
        var recordedString = "";
        var testFunction1 = function (e) {
            recordedString += "1(" + e.value + ")";
        };
        var testFunction2 = function (e) {
            recordedString += "2(" + e.value + ")";
        };

        commandManager.setCommand(new ModernCanvas.Command("sampleCommand1", testFunction1));
        commandManager.setCommand(new ModernCanvas.Command("sampleCommand2", testFunction2));

        executeCommand(unitTestComponent, "sampleCommand1", "value1");
        tc.areEqual("1(value1)", recordedString);
        executeCommand(unitTestComponent, "sampleCommand1", "value1");
        tc.areEqual("1(value1)1(value1)", recordedString);
        executeCommand(unitTestComponent, "sampleCommand2", "value2");
        tc.areEqual("1(value1)1(value1)2(value2)", recordedString);
    });

    // CommandManager tests - Tests that the listeners properly fire when the enabled state changes.
    Tx.test("CommandManager.testEnabledChanged", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        setUpCommandManager(tc, "empty");
        var sampleCommand = new ModernCanvas.Command("sampleCommand", runCommandFunction, { enabledOn: ModernCanvas.Command.EnableStates.hasNonEmptySelection }),
            recordString = "",
            selObj = document.getSelection();
        var enabledChangedListener1 = function (enabledState) {
            recordString += "Listen1:" + enabledState.toString();
        };
        var enabledChangedListener2 = function (enabledState) {
            recordString += "Listen2:" + enabledState.toString();
        };
        selObj.removeAllRanges();
        Jx.addListener(sampleCommand, "enabledchanged", enabledChangedListener1, this);
        Jx.addListener(sampleCommand, "enabledchanged", enabledChangedListener2, this);
        commandManager.setCommand(sampleCommand);
        commandManager.updateEnabledStates([sampleCommand]);
        tc.areEqual("Listen1:falseListen2:false", recordString);
        tc.log("CommandManager fired enabledchanged event.");

        recordString = "";
        commandManager.updateEnabledStates([sampleCommand]);
        tc.areEqual("", recordString);
        tc.log("CommandManager did not fire enabledchanged event when not needed.");

        Jx.removeListener(sampleCommand, "enabledchanged", enabledChangedListener1, this);
        var newSelectionRange = document.createRange();
        newSelectionRange.selectNode(document.body);
        selObj.addRange(newSelectionRange);
        commandManager.updateEnabledStates([sampleCommand]);
        tc.areEqual("Listen2:true", recordString);
        tc.log("CommandManager properly removed event listener.");

        Jx.removeListener(sampleCommand, "enabledchanged", enabledChangedListener2, this);
    });

    // CommandManager tests - Tests that usage data is properly recorded.
    Tx.test("CommandManager.testUsageData", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        setUpCommandManager(tc, "empty");
        commandManager.setCommand(new ModernCanvas.Command("sampleCommand1", runCommandFunction));
        commandManager.setCommand(new ModernCanvas.Command("sampleCommand2", runCommandFunction));

        tc.log("Firing sampleCommand1 and verifying results.");
        executeCommand(unitTestComponent, "sampleCommand1");
        executeCommand(unitTestComponent, "sampleCommand1");
        tc.areEqual(2, commandManager.getUsageData().sampleCommand1);
        tc.areEqual(undefined, commandManager.getUsageData().sampleCommand2);

        tc.log("Firing sampleCommand2 and verifying results");
        executeCommand(unitTestComponent, "sampleCommand2");
        tc.areEqual(2, commandManager.getUsageData().sampleCommand1);
        tc.areEqual(1, commandManager.getUsageData().sampleCommand2);

        tc.log("Clearing usage data and verifying results");
        commandManager.clearUsageData();
        tc.areEqual(undefined, commandManager.getUsageData().sampleCommand1);
        tc.areEqual(undefined, commandManager.getUsageData().sampleCommand2);
    });


    // Individual Command Tests
    var testCommand = function (tc, options) {
        /// <summary>Tests a particular command.</summary>
        /// <param name="options" type="Object">The collection of settings for the test.</param>
        /// <returns type="Function">The function to run to perform the test.</returns>
        options.testFunction = options.testFunction || function () { return true; };
        return function () {
            if (!commandManager) {
                setUpCommandManager(tc, "default");
            }

            tc.log("Firing command event");
            executeCommand(unitTestComponent, options.name, options.value);

            tc.log("Checking results");
            tc.isTrue(options.testFunction(), "Did not notice appropriate changes in HTML when testing " + options.name + ": " + unitTestElement.outerHTML);
        };
    };

    var getAttribute = function (tc, attributeName, isStyle) {
        // Make sure we still have our content node
        tc.isTrue(Boolean(contentNode), "Could not find original content in html: " + unitTestElement.outerHTML);

        // Start with the immediate parent
        var parentElement = contentNode.parentNode,
            value;
        // While we still have an element to work with and we don't yet have a valid value
        while (parentElement && parentElement !== document.body && (!value || value === "transparent" || value === "inherit")) {
            // Get the value
            if (isStyle) {
                value = parentElement.currentStyle[attributeName];
            } else {
                value = parentElement[attributeName];
            }
            // Increment the parent up one level
            parentElement = parentElement.parentNode;
        }
        return (value || "").toLowerCase();
    };
    var getStyleAttribute = function (tc, attributeName) {
        return getAttribute(tc, attributeName, true);
    };

    var hasParent = function (tc, parentTagName) {
        // Make sure we still have our content node
        tc.isTrue(Boolean(contentNode), "Could not find original content in html: " + unitTestElement.outerHTML);

        // Start with the immediate parent
        var parentElement = contentNode.parentNode;

        // While we have an element to work with and it doesn't match the parent tag we are searching for
        while (parentElement && parentElement !== document.body && parentElement.tagName.toLowerCase() !== parentTagName) {
            // Increment the parent up one level
            parentElement = parentElement.parentNode;
        }
        return (parentElement && parentElement.tagName.toLowerCase() === parentTagName);
    };

    // AlignCenter - Tests that the provided AlignCenter command works as expected.
    Tx.test("CommandManager.testCommandAlignCenter", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        testCommand(tc, {
            name: "alignCenter",
            testFunction: function () {
                return ((getAttribute(tc, "align") === "center") || (getStyleAttribute(tc, "textAlign") === "center"));
            }
        })();
    });

    // AlignLeft - Tests that the provided AlignLeft command works as expected.
    Tx.test("CommandManager.testCommandAlignLeft", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        testCommand(tc, {
            name: "alignLeft",
            testFunction: function () {
                return ((getAttribute(tc, "align") === "left") || (getStyleAttribute(tc, "textAlign") === "left"));
            }
        })();
    });

    // AlignRight - Tests that the provided AlignRight command works as expected.
    Tx.test("CommandManager.testCommandAlignRight", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        testCommand(tc, {
            name: "alignRight",
            testFunction: function () {
                return ((getAttribute(tc, "align") === "right") || (getStyleAttribute(tc, "textAlign") === "right"));
            }
        })();
    });

    // Bold - Tests that the provided Bold command works as expected.
    Tx.test("CommandManager.testCommandBold", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        testCommand(tc, {
            name: "bold",
            testFunction: function () {
                return (hasParent(tc, "strong") || hasParent(tc, "b") || (getStyleAttribute(tc, "fontWeight") === "bold"));
            }
        })();
    });

    // Bullets - Tests that the provided Bullets command works as expected.
    Tx.test("CommandManager.testCommandBullets", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        testCommand(tc, {
            name: "bullets",
            testFunction: function () {
                return (hasParent(tc, "li") && hasParent(tc, "ul"));
            }
        })();
    });

    // Bullets - Tests that the Bullets command works as expected when the line contains a trailing <br>
    Tx.test("CommandManager.testCommandBulletsWithBr", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        // The following HTML caused WinBlue:462808 - <div><strong>|</strong><br></div>
        var strong = document.createElement("strong"),
            div = document.createElement("div"),
            selection = document.getSelection(),
            range = selection.getRangeAt(0);
        range.surroundContents(strong);
        range.surroundContents(div);
        div.appendChild(document.createElement("br"));
        contentNode.data = "";

        // Put the caret in the <strong> tag.
        range = document.createRange();
        range.selectNodeContents(strong);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);

        testCommand(tc, {
            name: "bullets",
            testFunction: function () {
                return (hasParent(tc, "strong") && hasParent(tc, "li") && hasParent(tc, "ul"));
            }
        })();
    });

    // ClearFormatting - Tests that the provided ClearFormatting command works as expected.
    Tx.test("CommandManager.testCommandClearFormatting", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        // Apply several formattings
        testCommand(tc, {
            name: "bold"
        })();
        testCommand(tc, {
            name: "italic"
        })();
        testCommand(tc, {
            name: "underline"
        })();

        // Check that they are all cleared when clearFormatting is applied
        testCommand(tc, {
            name: "clearFormatting",
            testFunction: function () {
                return (unitTestElement.innerHTML === "content");
            }
        })();
    });

    // GrowFont and ShrinkFont - Tests that the provided GrowFont and ShrinkFont commands work as expected.
    Tx.test("CommandManager.testCommandGrowShrinkFont", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        // Start the font at size 6
        testCommand(tc, {
            name: "setFontSize",
            testFunction: function () {
                return true;
            },
            value: "6"
        })();

        // Test the full progression of sizes going up
        var expectedSizes = [7, 8, 10, 11, 12, 13, 14, 18, 24, 36, 48, 72, 80, 90, 100],
            m,
            len = expectedSizes.length,
            testFunction = function () {
                return (getStyleAttribute(tc, "fontSize") === (expectedSizes[m] + "pt"));
            };
        for (m = 0; m < len; m++) {
            testCommand(tc, {
                name: "growFont",
                testFunction: testFunction
            })();
            tc.log("Correctly increased font to size " + expectedSizes[m] + "pt");
        }

        // Test the full progression of sizes going down
        for (m = (len - 1); m--; ) {
            testCommand(tc, {
                name: "shrinkFont",
                testFunction: testFunction
            })();
            tc.log("Correctly decreased font to size " + expectedSizes[m] + "pt");
        }

        // Test going up in mid progression
        testCommand(tc, {
            name: "setFontSize",
            value: "16"
        })();
        testCommand(tc, {
            name: "growFont",
            testFunction: function () {
                return (getStyleAttribute(tc, "fontSize") === "18pt");
            }
        })();

        // Test going down in mid progression
        testCommand(tc, {
            name: "setFontSize",
            value: "16"
        })();
        testCommand(tc, {
            name: "shrinkFont",
            testFunction: function () {
                return (getStyleAttribute(tc, "fontSize") === "14pt");
            }
        })();
    });

    // GrowFontOnePoint - Tests that the provided GrowFontOnePoint command works as expected.
    Tx.test("CommandManager.testCommandGrowFontOnePoint", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        // Start the font at size 3
        testCommand(tc, {
            name: "setFontSize",
            value: "3"
        })();

        testCommand(tc, {
            name: "growFontOnePoint",
            testFunction: function () {
                return (getStyleAttribute(tc, "fontSize") === "4pt");
            }
        })();
    });

    // Italic - Tests that the provided Italic command works as expected.
    Tx.test("CommandManager.testCommandItalic", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        testCommand(tc, {
            name: "italic",
            testFunction: function () {
                return (hasParent(tc, "em") || hasParent(tc, "i") || (getAttribute(tc, "fontStyle", true) === "italic"));
            }
        })();
    });

    // Numbers - Tests that the provided Numbers command works as expected.
    Tx.test("CommandManager.testCommandNumbers", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        testCommand(tc, {
            name: "numbers",
            testFunction: function () {
                return (hasParent(tc, "li") && hasParent(tc, "ol"));
            }
        })();
    });

    // QuotedLink - Tests that the quotedLink command works as expected.
    Tx.test("CommandManager.testQuotedLink", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        // Start the element with a link text
        contentNode.data = "\"http://msn.com";
        var range = document.createRange(),
            selObj = document.getSelection();
        range.selectNodeContents(contentNode);
        range.collapse(false);
        selObj.removeAllRanges();
        selObj.addRange(range);

        testCommand(tc, {
            name: "quotedLink",
            testFunction: function () {
                return (unitTestElement.innerHTML === "<a href=\"http://msn.com\" target=\"_parent\">http://msn.com</a>");
            }
        })();
    });

    // QuotedLinkAfter - Tests that the quotedLink command works as expected.
    Tx.test("CommandManager.testQuotedLinkAfter", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        // Start the element with a link text before quote
        contentNode.data = "asdf http://msn.com\"asdf";
        var range = document.createRange(),
            selObj = document.getSelection();
        range.setStart(contentNode, 5);
        range.collapse(true);
        selObj.removeAllRanges();
        selObj.addRange(range);

        testCommand(tc, {
            name: "quotedLink",
            testFunction: function () {
                return (unitTestElement.innerHTML === "asdf <a href=\"http://msn.com\" target=\"_parent\">http://msn.com</a>asdf");
            }
        })();
    });

    // RemoveHyperlink - Tests that the provided RemoveHyperlink command works as expected.
    Tx.test("CommandManager.testCommandRemoveHyperlink", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var anchor = document.createElement("a"),
            selection = document.getSelection(),
            range = selection.getRangeAt(0);
        range.surroundContents(anchor);
        tc.isTrue(hasParent(tc, "a"), "Unable to add an anchor tag around the content.");
        range = document.createRange();
        range.selectNode(anchor);
        selection.removeAllRanges();
        selection.addRange(range);

        testCommand(tc, {
            name: "removeHyperlink",
            testFunction: function () {
                return (!hasParent(tc, "a"));
            }
        })();
    });

    // SetFontColor - Tests that the provided SetFontColor command works as expected.
    Tx.test("CommandManager.testCommandSetFontColor", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        testCommand(tc, {
            name: "setFontColor",
            testFunction: function () {
                return (getStyleAttribute(tc, "color") === "blue");
            },
            value: "blue"
        })();
    });

    // _styleListElements - Tests that the _styleListElements part of SetFontColor command works as expected.
    Tx.test("CommandManager.testStyleListElements", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var li = document.createElement("li"),
            ul = document.createElement("ul"),
            selection = document.getSelection(),
            range = selection.getRangeAt(0);

        ul.appendChild(li);
        range.surroundContents(li);
        range.selectNode(li);
        range.surroundContents(ul);

        range.selectNodeContents(li);
        selection.removeAllRanges();
        selection.addRange(range);

        tc.isTrue(hasParent(tc, "li"), "Unable to add an li tag around the content.");

        testCommand(tc, {
            name: "setFontColor",
            testFunction: function () {
                return li.style.color === "blue" && (getStyleAttribute(tc, "color") === "blue");
            },
            value: "blue"
        })();

        // Test the case that the full content of the LI isn't selected from the start of the range
        range.setStart(contentNode, 1);
        range.setEnd(contentNode, contentNode.length);
        selection.removeAllRanges();
        selection.addRange(range);

        testCommand(tc, {
            name: "setFontColor",
            testFunction: function () {
                contentNode = li.firstChild.firstChild.nextSibling.firstChild;
                return li.style.color === "blue" && (getStyleAttribute(tc, "color") === "red");
            },
            value: "red"
        })();

        // Test the case that the full content of the LI isn't selected from the end of the range
        range.setStart(contentNode, 0);
        range.setEnd(contentNode, contentNode.length -2);
        selection.removeAllRanges();
        selection.addRange(range);

        testCommand(tc, {
            name: "setFontColor",
            testFunction: function () {
                return li.style.color === "blue" && (getStyleAttribute(tc, "color") === "green");
            },
            value: "green"
        })();

        // Test the case that the selection only contains a list
        unitTestElement.innerHTML = "some<ul><li>content</li></ul>text";
        li = unitTestElement.firstChild.nextSibling.firstChild;
        contentNode = li.firstChild;

        range.selectNodeContents(unitTestElement);
        selection.removeAllRanges();
        selection.addRange(range);

        testCommand(tc, {
            name: "setFontColor",
            testFunction: function () {
                return li.style.color === "green" && (getStyleAttribute(tc, "color") === "green");
            },
            value: "green"
        })();
    });

    // SetFontFamily - Tests that the provided SetFontFamily command works as expected.
    Tx.test("CommandManager.testCommandSetFontFamily", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        testCommand(tc, {
            name: "setFontFamily",
            testFunction: function () {
                return (getStyleAttribute(tc, "fontFamily") === "customtype");
            },
            value: "customtype"
        })();
    });

    // SetFontHighlightColor - Tests that the provided SetFontHighlightColor command works as expected.
    Tx.test("CommandManager.testCommandSetFontHighlightColor", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        testCommand(tc, {
            name: "setFontHighlightColor",
            testFunction: function () {
                return (getStyleAttribute(tc, "backgroundColor") === "blue" && document.getSelection().getRangeAt(0).collapsed);
            },
            value: "blue"
        })();
    });

    // SetFontSize - Tests that the provided SetFontSize command works as expected.
    Tx.test("CommandManager.testCommandSetFontSize", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        testCommand(tc, {
            name: "setFontSize",
            testFunction: function () {
                return (getStyleAttribute(tc, "fontSize") === "28pt");
            },
            value: "28"
        })();
    });

    // ShrinkFontOnePoint - Tests that the provided ShrinkFontOnePoint command works as expected.
    Tx.test("CommandManager.testCommandShrinkFontOnePoint", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        // Start the font at size 3
        testCommand(tc, {
            name: "setFontSize",
            value: "3"
        })();

        testCommand(tc, {
            name: "shrinkFontOnePoint",
            testFunction: function () {
                return (getStyleAttribute(tc, "fontSize") === "2pt");
            }
        })();
        tc.log("Confirmed ShrinkFontOnePoint worked on first run.");

        testCommand(tc, {
            name: "shrinkFontOnePoint",
            testFunction: function () {
                return (getStyleAttribute(tc, "fontSize") === "1pt");
            }
        })();
        tc.log("Confirmed ShrinkFontOnePoint worked on second run.");

        testCommand(tc, {
            name: "shrinkFontOnePoint",
            testFunction: function () {
                return (getStyleAttribute(tc, "fontSize") === "1pt");
            }
        })();
        tc.log("Confirmed ShrinkFontOnePoint did not shrink below 1pt.");
    });

    // Underline - Tests that the provided Underline command works as expected.
    Tx.test("CommandManager.testCommandUnderline", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        testCommand(tc, {
            name: "underline",
            testFunction: function () {
                return (hasParent(tc, "u") || (getStyleAttribute(tc, "textDecoration") === "underline"));
            }
        })();
    });

})();