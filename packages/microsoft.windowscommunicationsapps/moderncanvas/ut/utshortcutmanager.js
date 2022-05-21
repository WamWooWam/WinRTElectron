
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Allow for override of global components
(function () {

    // Override Jx getString
    Jx.res.getString = function (key) {
        return "STRING_FOR_KEY(" + key + ")";
    };

    var log,
        addCommandToLog = function (e) {
            log += e.command;
        };

    // Define the setup/teardown functions
    var unitTestElement,
        shortcutManager,
        parentComponent;

    function setup(tc) {
        parentComponent = new MockComponent();
        Debug.Events.define(parentComponent, "command");

        // Add test element to the DOM
        unitTestElement = document.createElement("div");
        unitTestElement.contentEditable = true;
        unitTestElement.innerHTML = "Content"
        document.body.appendChild(unitTestElement);

        // Initialize the ShortcutManager and attach it to the DOM
        tc.log("Creating shortcut manager.");
        shortcutManager = new ModernCanvas.ShortcutManager("empty");
        parentComponent.appendChild(shortcutManager);
        tc.log("Attaching to DOM.");
        unitTestElement.addEventListener("keydown", shortcutManager.onKeyDown, false);
        tc.log("Finished creating shortcut manager.");

        // Attach command listener that build the log
        log = "";
        Jx.addListener(parentComponent, "command", addCommandToLog, tc);

        // Set focus in the element
        unitTestElement.focus();
        var range = document.createRange(),
            selObj = document.getSelection();
        range.selectNodeContents(unitTestElement);
        selObj.removeAllRanges();
        selObj.addRange(range);
    };

    function cleanup (tc) {
        // Detach the shortcut manager from the DOM
        unitTestElement.removeEventListener("keydown", shortcutManager.onKeyDown, false);
        Jx.removeListener(parentComponent, "command", addCommandToLog, tc);

        // Remove the test element from the DOM
        unitTestElement.parentNode.removeChild(unitTestElement);

        // Throw away the shortcut manager
        tc.log("Destroying shortcut manager.");
        shortcutManager = null;
    };

    // ShortcutManager tests
    var opt = {
        owner: "jamima",
        priority: "0"
    };

    opt.description = "Tests that shortcuts can be added.";
    Tx.test("ShortcutManager.testAdd", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        shortcutManager.setShortcut("ctrl+1", "testCommand1");
        shortcutManager.setShortcut("ctrl+2", "testCommand2");

        DOMx.simulateKeyStroke({ ctrl: true, key: "1" });
        tc.areEqual("testCommand1", log);

        log = "";
        DOMx.simulateKeyStroke({ ctrl: true, key: "1" });
        tc.areEqual("testCommand1", log);

        log = "";
        DOMx.simulateKeyStroke({ ctrl: true, key: "2" });
        tc.areEqual("testCommand2", log);
    });

    opt.description = "Tests that shortcuts can be removed.";
    Tx.test("ShortcutManager.testRemove", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        shortcutManager.setShortcut("ctrl+1", "testCommand1");
        shortcutManager.setShortcut("ctrl+2", "testCommand2");

        DOMx.simulateKeyStroke({ ctrl: true, key: "1" });
        tc.areEqual("testCommand1", log);

        log = "";
        shortcutManager.removeShortcut("ctrl+1");
        DOMx.simulateKeyStroke({ ctrl: true, key: "1" });
        tc.areEqual("", log);

        DOMx.simulateKeyStroke({ ctrl: true, key: "2" });
        tc.areEqual("testCommand2", log);

        log = "";
        shortcutManager.removeShortcut();
        DOMx.simulateKeyStroke({ ctrl: true, key: "2" });
        tc.areEqual("", log);
    });

    opt.description = "Tests that key definitions may be made in all valid ways.";
    Tx.test("ShortcutManager.testKeyDefinitions", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        shortcutManager.setShortcut("ctrl+1", "1Command");
        shortcutManager.setShortcut("ctrl+a", "aCommand");
        shortcutManager.setShortcut("ctrl+#|90", "zCommand");
        shortcutManager.setShortcut("ctrl+#|13", "enterCommand");

        DOMx.simulateKeyStroke({ ctrl: true, key: "1" });
        tc.areEqual("1Command", log);

        log = "";
        DOMx.simulateKeyStroke({ ctrl: true, key: "a" });
        tc.areEqual("aCommand", log);

        log = ""
        DOMx.simulateKeyStroke({ ctrl: true, key: "z" });
        tc.areEqual("zCommand", log);

        log = ""
        DOMx.simulateKeyStroke({ ctrl: true, key: "Enter" });
        tc.areEqual("enterCommand", log);
    });

    opt.description = "Tests that multiple conditional commands can be added to a key combo.";
    Tx.test("ShortcutManager.testMultipleConditionalShortcuts", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        // Setup shortcuts using the different conditions
        shortcutManager.setShortcut("ctrl+1", "#conditional:list#Command1");
        shortcutManager.setShortcut("ctrl+2", "#conditional:list#Command2");
        shortcutManager.setShortcut("ctrl+2", "#conditional:selection#Command2Alt");

        // Try all the shortcuts with a selection
        DOMx.simulateKeyStroke({ ctrl: true, key: "1" });
        DOMx.simulateKeyStroke({ ctrl: true, key: "2" });
        DOMx.simulateKeyStroke({ ctrl: true, key: "3" });
        tc.areEqual("Command2Alt", log, "Expected only the selection command would be enabled");
    });

    opt.description = "Tests that conditional shortcuts work when expected.";
    Tx.test("ShortcutManager.testConditionalShortcuts", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        // Setup shortcuts using the different conditions
        shortcutManager.setShortcut("ctrl+1", "#conditional:list#Command1");
        shortcutManager.setShortcut("ctrl+2", "#conditional:selection#Command2");

        // Try all the shortcuts with a selection
        DOMx.simulateKeyStroke({ ctrl: true, key: "1" });
        DOMx.simulateKeyStroke({ ctrl: true, key: "2" });
        DOMx.simulateKeyStroke({ ctrl: true, key: "3" });
        tc.areEqual("Command2", log, "Expected only the selection command would be enabled");

        // Add a list
        var ul = document.createElement("ul"),
            li = document.createElement("li"),
            span = document.createElement("span"),
            span2 = document.createElement("span");
        span2.innerHTML = "My text";
        span.appendChild(span2);
        li.appendChild(span);
        ul.appendChild(li);
        unitTestElement.appendChild(ul);

        // Select the list
        var range = document.createRange(),
            selObj = document.getSelection();
        range.selectNodeContents(span2);
        range.collapse(true);
        selObj.removeAllRanges();
        selObj.addRange(range);

        // Try all shortcuts with selection sitting at the beginning of the list
        log = "";
        DOMx.simulateKeyStroke({ ctrl: true, key: "1" });
        DOMx.simulateKeyStroke({ ctrl: true, key: "2" });
        DOMx.simulateKeyStroke({ ctrl: true, key: "3" });
        tc.areEqual("Command1", log, "Expected only the list command would be enabled");
    });

    opt.description = "Tests that blocking and nonblocking shortcuts work as expected.";
    Tx.test("ShortcutManager.testNonblockingShortcuts", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        // Setup shortcuts using regular and nonblocking conditions
        shortcutManager.setShortcut("ctrl+1", "#nonblocking#Command1");
        shortcutManager.setShortcut("ctrl+2", "Command2");

        tc.isTrue(DOMx.simulateKeyStroke({ ctrl: true, key: "1" }), "Nonblocking shortcut should not have blocked the keystroke.");
        tc.isFalse(DOMx.simulateKeyStroke({ ctrl: true, key: "2" }), "Regular shortcuts should have blocked the keystroke.");
    });

    opt.description = "Tests that usage data is properly recorded.";
    Tx.test("ShortcutManager.testUsageData", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        shortcutManager.setShortcut("ctrl+1", "sampleCommand1");
        shortcutManager.setShortcut("ctrl+2", "sampleCommand2");

        DOMx.simulateKeyStroke({ ctrl: true, key: "1" });
        DOMx.simulateKeyStroke({ ctrl: true, key: "1" });
        tc.areEqual(2, shortcutManager.getUsageData()["sampleCommand1"]);
        tc.areEqual(undefined, shortcutManager.getUsageData()["sampleCommand2"]);

        DOMx.simulateKeyStroke({ ctrl: true, key: "2" });
        tc.areEqual(2, shortcutManager.getUsageData()["sampleCommand1"]);
        tc.areEqual(1, shortcutManager.getUsageData()["sampleCommand2"]);

        shortcutManager.clearUsageData();
        tc.areEqual(undefined, shortcutManager.getUsageData()["sampleCommand1"]);
        tc.areEqual(undefined, shortcutManager.getUsageData()["sampleCommand2"]);

        DOMx.simulateKeyStroke({ ctrl: true, key: "2" });
        tc.areEqual(undefined, shortcutManager.getUsageData()["sampleCommand1"]);
        tc.areEqual(1, shortcutManager.getUsageData()["sampleCommand2"]);
    });
})();
