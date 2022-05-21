
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx, ModernCanvas, Tx*/
/*jshint browser:true*/

(function () {

    // Override Jx getString
    Jx.res.getString = function (key) {
        return "STRING_FOR_KEY(" + key + ")";
    };

    // Define the setup/teardown functions
    var unitTestElement,
        plainContentElement,
        linkElement,
        contextMenuManager;

    function setup(tc) {
        // Add test element to the DOM
        unitTestElement = document.createElement("div");
        unitTestElement.contentEditable = true;
        document.body.appendChild(unitTestElement);
        plainContentElement = document.createElement("span");
        plainContentElement.innerText = "plain text";
        unitTestElement.appendChild(plainContentElement);
        linkElement = document.createElement("a");
        linkElement.innerText = "link text";
        unitTestElement.appendChild(linkElement);

        // Initialize the ContextMenuManager and attach it to the DOM
        tc.log("Creating context menu manager.");
        contextMenuManager = new ModernCanvas.ContextMenuManager("empty");
        tc.log("Attaching to DOM.");
        unitTestElement.addEventListener("contextmenu", contextMenuManager.onContextMenu, false);
        tc.log("Finished creating context menu manager.");

        // Set focus in the element
        unitTestElement.focus();
        var range = document.createRange(),
            selObj = document.getSelection();
        range.selectNodeContents(unitTestElement);
        range.collapse(true);
        selObj.removeAllRanges();
        selObj.addRange(range);
    }

    function cleanup (tc) {
        // Detach the context menu manager from the DOM
        unitTestElement.removeEventListener("contextmenu", contextMenuManager.onContextMenu, false);

        // Remove the test element from the DOM
        unitTestElement.parentNode.removeChild(unitTestElement);

        // Throw away the context menu manager
        tc.log("Destroying context menu manager.");
        contextMenuManager = null;
    }

    // Selection information for testing menu items
    var enabledInformationWithNoSelectionLink = ModernCanvas.Command.EnableStates.inLink,
    enabledInformationWithNoSelectionNoLink = 0,
    enabledInformationWithSelectionLink = ModernCanvas.Command.EnableStates.hasSelection | ModernCanvas.Command.EnableStates.inLink,
    enabledInformationWithSelectionNoLink = ModernCanvas.Command.EnableStates.hasSelection;

    // MenuItem tests
    var opt = {
        owner: "widuff",
        priority: "0"
    };

    opt.description = "Tests that menu items isEnabled reacts properly.";
    Tx.test("ContextMenuManager.testMenuItem", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var menuItem = new ModernCanvas.ContextMenuItem("displayName", "commandName");
        tc.areEqual("displayName", menuItem.displayName);
        tc.areEqual("commandName", menuItem.commandId);
        tc.isTrue(menuItem.isEnabled(enabledInformationWithNoSelectionLink));
        tc.isTrue(menuItem.isEnabled(enabledInformationWithNoSelectionNoLink));
        tc.isTrue(menuItem.isEnabled(enabledInformationWithSelectionLink));
        tc.isTrue(menuItem.isEnabled(enabledInformationWithSelectionNoLink));
        tc.log("MenuItem correctly calculated enabled state for defaults.");

        menuItem.enabledOn = ModernCanvas.Command.EnableStates.hasSelection;
        tc.isFalse(menuItem.isEnabled(enabledInformationWithNoSelectionLink));
        tc.isFalse(menuItem.isEnabled(enabledInformationWithNoSelectionNoLink));
        tc.isTrue(menuItem.isEnabled(enabledInformationWithSelectionLink));
        tc.isTrue(menuItem.isEnabled(enabledInformationWithSelectionNoLink));
        tc.log("MenuItem correctly calculated enabled state based on selection.");

        menuItem.enabledOn = ModernCanvas.Command.EnableStates.inLink;
        tc.isTrue(menuItem.isEnabled(enabledInformationWithNoSelectionLink));
        tc.isFalse(menuItem.isEnabled(enabledInformationWithNoSelectionNoLink));
        tc.isTrue(menuItem.isEnabled(enabledInformationWithSelectionLink));
        tc.isFalse(menuItem.isEnabled(enabledInformationWithSelectionNoLink));
        tc.log("MenuItem correctly calculated enabled state based on being in a link.");

        menuItem.isEnabled = function () { return true; };
        tc.isTrue(menuItem.isEnabled(enabledInformationWithNoSelectionLink));
        tc.isTrue(menuItem.isEnabled(enabledInformationWithNoSelectionNoLink));
        tc.isTrue(menuItem.isEnabled(enabledInformationWithSelectionLink));
        tc.isTrue(menuItem.isEnabled(enabledInformationWithSelectionNoLink));

        menuItem.isEnabled = function () { return false; };
        tc.isFalse(menuItem.isEnabled(enabledInformationWithNoSelectionLink));
        tc.isFalse(menuItem.isEnabled(enabledInformationWithNoSelectionNoLink));
        tc.isFalse(menuItem.isEnabled(enabledInformationWithSelectionLink));
        tc.isFalse(menuItem.isEnabled(enabledInformationWithSelectionNoLink));
        tc.log("MenuItem correctly calculated enabled using custom isEnabled function.");
    });

    // Can no longer test the onContextMenu call because Windows.UI.Popups.PopupMenu can not be overwritten
    // to do programmatic detection of it being called.

})();
